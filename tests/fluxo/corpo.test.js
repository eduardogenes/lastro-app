// Acompanhamento corporal: média semanal e as três regras de ajuste.
// O peso do dia não decide nada; quem decide é a média e o ritmo entre semanas.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, inicioDaSemana, DIA } from './harness.js';

// Gera pesagens dentro de cada semana alvo, com ruído que se anula na média.
// Âncora na última semana FECHADA, nunca na semana em curso: rodando numa
// segunda-feira, a semana atual teria uma pesagem só e a média viraria ruído.
function pesagens(medias) {
  const ultima = inicioDaSemana(Date.now()) - 7 * DIA;
  const ruido = [0.4, -0.3, 0.2, -0.3];
  const out = [];
  medias.forEach(function (m, idx) {
    const semana = ultima - (medias.length - 1 - idx) * 7 * DIA;
    for (let j = 0; j < 4; j++) {
      out.push({ t: semana + j * DIA + 10 * 3600000, v: Math.round((m + ruido[j]) * 100) / 100 });
    }
  });
  return out;
}

/**
 * Dias de comida registrados, para destravar a regra.
 *
 * A trava de adesão do nutricionista: o app só mexe nas calorias quando sabe
 * se o ganho veio da dieta prescrita ou de saídas dela. Sem isto semeado, o
 * veredito correto é "registrar antes de mexer" — e é o que o último teste
 * daqui cobra.
 */
function comidaRegistrada(dias) {
  const out = [];
  for (let i = 1; i <= dias; i++) {
    const d = new Date(Date.now() - i * DIA);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
    out.push({ d: iso, done: { cafe: Date.now() }, agua: 0, escala: {},
               tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: Date.now() });
  }
  return out.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
}

function medidas(pares) {   // [{diasAtras, valor}]
  return pares.map(function (p) { return { t: Date.now() - p.d * DIA, v: p.v }; })
              .sort(function (x, y) { return x.t - y.t; });
}

async function veredito(peso, cintura) {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: peso || [], cintura: cintura || [] } } });
  a.aba('dados');
  const r = { titulo: a.texto('.verdict-t'), texto: a.texto('.verdict p'), classe: a.$('.verdict').className };
  a.fechar();
  return r;
}

// As REGRAS estão em tests/dominio/corpo.test.ts, onde custam microssegundos e
// dá para varrer os limites exatos. O que sobra aqui é a ligação: o veredito
// calculado precisa chegar na tela, e chegar no lugar certo.
test('o veredito da regra é o que aparece na aba corpo', async () => {
  const a = await app({ estado: { logs: [], done: [], comidaHist: comidaRegistrada(14),
    body: { peso: pesagens([73.0, 73.05, 73.10]), cintura: [] } } });
  a.aba('dados');
  // o veredito é o cartão do Instrumento; o legado saiu de DADOS para não
  // aparecer duas vezes na mesma tela
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Comer mais');
  assert.strictEqual(a.texto('.ins-veredito-p'), a.vJ('veredito').p, 'a tela não reescreve o texto');
  assert.ok(a.$('.ins-veredito'), 'e é um objeto destacado, com borda');
  a.fechar();
});

test('cintura alta não sobrepõe mais o peso na faixa', async () => {
  // Ela tinha precedência e vetava o peso. Saiu do algoritmo: medir
  // circunferência parou de acontecer, e as fotos padronizadas passaram a ser
  // a segunda camada de confirmação. Medida ocasional vira informação.
  const a = await app({ estado: { logs: [], done: [], comidaHist: comidaRegistrada(14), body: {
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  } } });
  a.aba('dados');
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Manter como está');
  a.fechar();
});

test('sem registro de comida, a tela manda registrar em vez de cortar', async () => {
  // O peso sozinho não corta: sem saber se o ganho veio da dieta ou de uma
  // saída dela, tirar comida do plano puniria os dias em que ele seguiu.
  const a = await app({ estado: { logs: [], done: [], comidaHist: [],
    body: { peso: pesagens([73.0, 73.6, 74.2]), cintura: [] } } });
  a.aba('dados');
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Registrar antes de mexer');
  assert.ok(a.texto('.ins-veredito-p').includes('saídas'), a.texto('.ins-veredito-p'));
  a.fechar();
});

test('registro aceita vírgula e substitui a medida do mesmo dia', async () => {
  const a = await app();
  a.aba('dados');
  a.E('view.bodyForm = { peso: "73,4" }');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso[0].v, 73.4, 'vírgula do teclado pt-BR');

  a.E('view.bodyForm = { peso: "73,8" }');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 1, 'uma medida por dia');
  assert.strictEqual(a.S().body.peso[0].v, 73.8);
  a.fechar();
});

test('entrada inválida não grava', async () => {
  const a = await app();
  a.aba('dados');
  a.E('view.bodyForm = { peso: "abc" }');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 0);
  assert.ok(a.toast().includes('número válido'));
  a.fechar();
});

test('cardio conta a semana e reseta na segunda', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [], cardio: [
    { t: seg - 3 * DIA, m: 'bike', min: 20, i: 'leve' },      // semana passada
    { t: seg + 3600000, m: 'bike', min: 20, i: 'leve' }       // esta semana
  ] } });
  a.aba('dados');
  await a.modo('treino');
  assert.strictEqual(a.vJ('cardioSemana').length, 1, 'a da semana passada não conta');
  assert.strictEqual(a.vJ('ctx.corpo').cardio.semana, 1, 'e a tela conta o mesmo');
  const nota = a.$$('.ins-secao-nota').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(/1 de 2 nesta semana/.test(nota), nota);
  a.fechar();
});

test('cardio avisa quando houve treino de perna no mesmo dia', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'B', t: Date.now(), sid: Date.now() }] } });
  a.aba('dados');
  await a.modo('treino');
  const aviso = a.$$('.ins-provenance').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(/treino B/.test(aviso), 'deve sinalizar sem bloquear: ' + aviso);
  assert.strictEqual(a.$('.ins-btn-add[disabled]'), null, 'sinaliza, não bloqueia');
  a.fechar();
});

test('nada na interface de cardio fala em caloria', async () => {
  const a = await app();
  a.aba('dados');
  const txt = a.doc.getElementById('app').textContent.toLowerCase();
  assert.ok(!/calor|gasto energ|queima|hiit/.test(txt), 'ele está em superávit; cardio não é queima');
  a.fechar();
});

// Estes três caminhos existiam no sistema antigo e sumiram quando as telas
// viraram componente — não por decisão, por descuido: a função continuava no
// fonte, viva só porque a ponte de handlers globais a republicava em `window`.
// Voltaram junto com a ponte morrendo, e ficam cobertos daqui para frente.
test('pesagem errada pode ser apagada', async () => {
  const a = await app();
  await a.E('S.body.peso.push({ t: Date.now(), v: 743 }); save()');
  await a.esperar();
  a.aba('dados');

  const linha = a.$$('.crow').find(function (x) { return /743/.test(x.textContent); });
  assert.ok(linha, 'a medida aparece na lista de correção');
  linha.querySelector('.crow-x').click();
  await a.esperar();

  assert.ok(!a.S().body.peso.some(function (x) { return x.v === 743; }), 'e sai do histórico');
  a.fechar();
});

test('sessão de cardio registrada por engano pode ser apagada', async () => {
  const a = await app();
  await a.E('S.cardio.push({ t: Date.now(), m: "bike", min: 25, i: "moderado" }); save()');
  await a.esperar();
  a.aba('dados');
  await a.modo('treino');

  const linha = a.$$('.crow').find(function (x) { return /bike/.test(x.textContent); });
  assert.ok(linha, 'a sessão da semana aparece com a porta de saída');
  linha.querySelector('.crow-x').click();
  await a.esperar();

  assert.strictEqual(a.S().cardio.length, 0);
  a.fechar();
});

test('preencher treino passado avisa para onde as séries estão indo', async () => {
  const a = await app();
  const t = Date.now() - 2 * 86400000;
  a.v('abrirAdicionar', t);
  a.v('addSet', 'tipo', 'A');
  await a.v('gravarRetro', true);
  await a.esperar();

  const aviso = a.texto('.tr-aviso');
  assert.ok(/não em hoje/.test(aviso), 'sem isso, a sessão retroativa fica invisível: ' + aviso);

  const botao = a.$$('.tr-aviso button').find(function (x) { return /concluir/.test(x.textContent); });
  assert.ok(botao, 'e a porta de saída fica no próprio aviso');
  await botao.click();
  await a.esperar();
  assert.strictEqual(a.S().sessao, null, 'concluir encerra a sessão retroativa');
  a.fechar();
});

test('célula de métrica sem medida mostra traço, não a primeira palavra da frase', async () => {
  // A tela cortava a frase de procedência no primeiro espaço para preencher a
  // célula. Sem três semanas de medida, a frase é "faltam 3 semanas..." — e o
  // painel exibia a palavra `faltam` no lugar do número, em mono, como se
  // fosse um valor medido.
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('dados');

  const celulas = a.$$('.ins-metrica-v, .ins-celula b, .stats b')
    .map(function (x) { return x.textContent.trim(); });
  assert.ok(!celulas.includes('faltam'), 'palavra vazando para célula de número: ' + celulas.join(' | '));

  const txt = a.doc.getElementById('app').textContent;
  assert.ok(/faltam 3 semanas de medida/.test(txt), 'a frase continua, na procedência');
  a.fechar();
});

// ---------- o stepper e o botão têm que ler o mesmo lugar ----------
// Regressão: quando o campo de texto virou stepper, `addBody` continuou lendo
// um `<input>` por id que o redesenho já tinha apagado. Sem tocar no stepper o
// botão não gravava nada; tocando, chegava um número onde o código fazia
// `.replace` de string e a tela quebrava com TypeError.

test('registrar peso grava o número que o stepper mostra', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');

  // sem nenhuma medida, o stepper parte do padrão e o botão grava ELE
  assert.strictEqual(a.vJ('ctx.corpo').peso.valor, 75);
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 1, 'o botão sozinho já registra');
  assert.strictEqual(a.S().body.peso[0].v, 75);
  a.fechar();
});

test('mexer no stepper antes de registrar não quebra a tela', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');

  // o stepper entrega NÚMERO, não string: é o que fazia o .replace estourar
  a.v('ctx.setPeso', 73.4);
  assert.strictEqual(a.vJ('ctx.corpo').peso.valor, 73.4, 'a tela mostra o que ele escolheu');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso[0].v, 73.4, 'e é isso que vai para o histórico');

  // depois de gravar, o stepper se deriva da última medida em vez de zerar
  assert.strictEqual(a.vJ('ctx.corpo').peso.valor, 73.4);
  a.fechar();
});

test('o botão de registrar na tela chega até o histórico', async () => {
  // pelo caminho real: o clique no botão, não a função por dentro
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');
  const botoes = a.$$('.dd-registro .ins-btn-secondary');
  assert.ok(botoes.length >= 2, 'peso e cintura têm botão de registrar');

  a.clicar(botoes[0]);
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 1, 'clicar em "registrar hoje" registra');

  a.clicar(botoes[1]);
  await a.esperar();
  assert.strictEqual(a.S().body.cintura.length, 1, 'e a cintura também');
  assert.strictEqual(a.S().body.cintura[0].v, 85);
  a.fechar();
});

test('cintura usa o stepper dela, não o do peso', async () => {
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: Date.now(), v: 73 }], cintura: [] } } });
  a.aba('dados');
  a.v('ctx.setCintura', 84.5);
  await a.v('addBody', 'cintura');
  await a.esperar();
  assert.strictEqual(a.S().body.cintura[0].v, 84.5);
  assert.strictEqual(a.S().body.peso.length, 1, 'o peso não foi tocado');
  a.fechar();
});

// ---------- data retroativa da medida ----------
// Pesou ontem e esqueceu de registrar: lançar como hoje deslocaria a média de
// duas semanas, e é a média que decide comer mais ou comer menos. A medida
// esquecida também pode ser bem mais antiga, então o seletor é de data cheia.

function iso(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}
const vazio = { logs: {}, done: [], body: { peso: [], cintura: [] } };

test('o padrão continua sendo hoje, num toque', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');
  const d = a.vJ('ctx.corpo').peso.dia;
  assert.strictEqual(d.hoje, true, 'abre em hoje, sem pedir data');
  assert.strictEqual(d.aberto, false, 'e o seletor fica fechado');
  assert.strictEqual(d.iso, iso(Date.now()));
  assert.strictEqual(a.vJ('ctx.corpo').peso.acao, 'registrar hoje');
  a.fechar();
});

test('dá para registrar numa data bem anterior, não só nos últimos dias', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');

  const antigo = Date.now() - 23 * DIA;
  a.E('CTX.setDiaCorpo("peso", "' + iso(antigo) + '")');
  a.v('ctx.setPeso', 71.2);
  await a.v('addBody', 'peso');
  await a.esperar();

  const m = a.S().body.peso;
  assert.strictEqual(m.length, 1);
  assert.strictEqual(m[0].v, 71.2);
  assert.strictEqual(a.E('sameDay(S.body.peso[0].t, ' + antigo + ')'), true,
    'caiu no dia escolhido, três semanas atrás');
  a.fechar();
});

test('escolher ontem grava no dia certo, não em hoje', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');

  const ontem = Date.now() - DIA;
  a.E('CTX.setDiaCorpo("peso", "' + iso(ontem) + '")');
  assert.strictEqual(a.vJ('ctx.corpo').peso.acao, 'registrar ontem',
    'o botão passa a dizer em que dia vai gravar');

  a.v('ctx.setPeso', 73.4);
  await a.v('addBody', 'peso');
  await a.esperar();

  assert.strictEqual(a.E('sameDay(S.body.peso[0].t, Date.now())'), false, 'não caiu em hoje');
  assert.strictEqual(a.E('sameDay(S.body.peso[0].t, ' + ontem + ')'), true);
  a.fechar();
});

test('data no futuro é recusada', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');
  a.E('CTX.setDiaCorpo("peso", "' + iso(Date.now() + 3 * DIA) + '")');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.hoje, true, 'continua em hoje');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.max, iso(Date.now()),
    'e o campo nem oferece: max é hoje');
  a.fechar();
});

test('depois de gravar, a data volta para hoje sozinha', async () => {
  // deixar uma data passada armada faria a próxima pesagem cair no dia errado
  const a = await app({ estado: vazio });
  a.aba('dados');
  a.E('CTX.setDiaCorpo("peso", "' + iso(Date.now() - DIA) + '")');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.hoje, true);
  assert.strictEqual(a.vJ('ctx.corpo').peso.acao, 'registrar hoje');
  a.fechar();
});

test('o seletor diz o que o dia escolhido já tem', async () => {
  const ontem = Date.now() - DIA;
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: ontem, v: 73.4 }], cintura: [] } } });
  a.aba('dados');
  assert.match(a.vJ('ctx.corpo').peso.dia.jaTem, /nenhuma medida/, 'hoje ainda está vazio');

  a.E('CTX.setDiaCorpo("peso", "' + iso(ontem) + '")');
  assert.match(a.vJ('ctx.corpo').peso.dia.jaTem, /73,4 kg · registrar substitui/);
  a.fechar();
});

test('escolher um dia já medido parte do valor daquele dia', async () => {
  // o gesto ali é corrigir aquele dia; partir do último peso faria digitar por
  // cima do que já estava certo
  const ontem = Date.now() - DIA;
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: ontem, v: 73.4 }, { t: Date.now(), v: 75 }], cintura: [] } } });
  a.aba('dados');
  assert.strictEqual(a.vJ('ctx.corpo').peso.valor, 75, 'em hoje, mostra o de hoje');

  a.E('CTX.setDiaCorpo("peso", "' + iso(ontem) + '")');
  assert.strictEqual(a.vJ('ctx.corpo').peso.valor, 73.4, 'em ontem, mostra o de ontem');

  a.v('ctx.setPeso', 73.9);
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 2, 'corrigiu, não duplicou');
  assert.strictEqual(a.S().body.peso[0].v, 73.9);
  a.fechar();
});

test('a data é por medida: peso e cintura não se misturam', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');
  a.E('CTX.setDiaCorpo("peso", "' + iso(Date.now() - DIA) + '")');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.hoje, false);
  assert.strictEqual(a.vJ('ctx.corpo').cintura.dia.hoje, true, 'a cintura continua em hoje');
  a.fechar();
});

test('o seletor de data abre pelo link e aceita o campo nativo', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');
  assert.strictEqual(a.$$('.dd-dia').length, 0, 'fechado por padrão: não custa espaço');
  assert.ok(a.$('.dd-diabtn'), 'mas existe o caminho');

  a.clicar(a.$('.dd-diabtn'));
  const campo = a.$('.dd-dia input[type=date]');
  assert.ok(campo, 'abre o seletor de data do aparelho');
  assert.strictEqual(campo.getAttribute('max'), iso(Date.now()), 'sem data futura');

  a.digitar('ddia-peso', iso(Date.now() - 9 * DIA));
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.hoje, false, 'mexer no campo muda o dia');
  a.fechar();
});

// ===========================================================================
// As chaves destrutivas de `CTX`, chamadas PELO NOME em vez de pelo `.crow-x`
// ===========================================================================
//
// `pesagem errada pode ser apagada` e `sessão de cardio registrada por engano`
// (acima) clicam no botão: eles provam a FIAÇÃO — que existe um `.crow-x` na
// tela de hoje ligado no verbo. Os casos daqui provam a CAPACIDADE, pela
// superfície: que o verbo avisa antes, que apaga só o que nomeia e que deixa
// lápide. **Nenhum deles diz nada sobre a tela nova ter botão ligado neles** —
// se o redesenho esquecer o `.crow-x`, estes continuam verdes.
//
// Por que destrutivo primeiro: um alcance de apagamento que cresceu sem
// ninguém pedir, ou um aviso que sumiu, é o defeito que não aparece no dia e
// se descobre semanas depois, sem desfazer.

test('ctx.apagaMedida avisa antes, e recusar não apaga nada', async () => {
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: { logs: {}, done: [],
                                  body: { peso: [{ t: t, v: 81.2 }], cintura: [] } } });

  a.recusar();
  a.v('ctx.apagaMedida', 'peso', t);
  await a.esperar();

  assert.strictEqual(a.S().body.peso.length, 1, 'recusar deixa a medida onde estava');
  assert.deepStrictEqual(a.S().apagados, {}, 'e não deixa lápide do que ficou');

  const q = a.perguntas().join(' | ');
  assert.ok(/81,2 kg/.test(q), 'o aviso diz QUAL medida, com o valor: ' + q);
  assert.ok(/outras medidas ficam/.test(q), 'e delimita o estrago, em vez de dramatizar: ' + q);
  a.fechar();
});

test('ctx.apagaMedida apaga só a medida nomeada, e deixa lápide', async () => {
  // Três pesagens e uma cintura: o alcance do apagamento é UMA delas. Se ele
  // crescer para o dia, para a grandeza ou para a semana, este caso cai.
  const t0 = Date.now() - 3 * DIA, t1 = Date.now() - 2 * DIA, t2 = Date.now() - DIA;
  const a = await app({ estado: { logs: {}, done: [], body: {
    peso: [{ t: t0, v: 80 }, { t: t1, v: 81 }, { t: t2, v: 82 }],
    cintura: [{ t: t1, v: 85 }]
  } } });

  a.v('ctx.apagaMedida', 'peso', t1);
  await a.esperar();

  assert.deepStrictEqual(a.S().body.peso.map(x => x.v), [80, 82], 'só a do meio saiu');
  assert.deepStrictEqual(a.S().body.cintura.map(x => x.v), [85],
    'a cintura do MESMO dia não vai junto: a grandeza faz parte do endereço');
  assert.ok(a.S().apagados['peso:' + t1] > 0,
    'com lápide, senão a fusão do outro aparelho a ressuscita');
  assert.strictEqual(a.S().apagados['cintura:' + t1], undefined, 'e lápide de uma só');
  assert.strictEqual(a.toast(), 'Medida removida.');
  a.fechar();
});

test('ctx.apagaCardio sai da contagem da semana e não mexe no treino do dia', async () => {
  const t = Date.now() - 3600000, outro = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    logs: {}, done: [{ day: 'A', t: t, sid: t }],
    cardio: [{ t: t, m: 'bike', min: 25, i: 'moderado' },
             { t: outro, m: 'esteira', min: 30, i: 'leve' }]
  } });

  a.recusar();
  a.v('ctx.apagaCardio', t);
  await a.esperar();
  assert.strictEqual(a.S().cardio.length, 2, 'recusar não apaga');
  const q = a.perguntas().join(' | ');
  assert.ok(/25 min de bike/.test(q), 'o aviso diz qual sessão: ' + q);
  assert.ok(/treino do dia não muda/.test(q), 'e diz o que NÃO vai junto: ' + q);

  a.aceitar();
  a.v('ctx.apagaCardio', t);
  await a.esperar();

  assert.deepStrictEqual(a.S().cardio.map(x => x.m), ['esteira'], 'só a nomeada saiu');
  assert.ok(a.S().apagados['cardio:' + t] > 0, 'com lápide');
  assert.strictEqual(a.S().done.length, 1, 'e o treino do dia ficou, como o aviso prometeu');
  a.fechar();
});

// ===========================================================================
// O registro do corpo, pelas chaves de `CTX`
// ===========================================================================
//
// `registraPeso`, `registraCintura`, `abreDiaCorpo`, `setPerfManual` e
// `abreCardio` não tinham caso próprio. Os casos de registro acima chamam
// `addBody` pelo nome de módulo; estes entram pela chave que a tela usa.
//
// Cobrem o modelo, não a fiação: provam a capacidade e onde ela para. Nenhum
// deles afirma que a tela nova tem botão de registrar ligado nestas chaves.

test('ctx.registraPeso e ctx.registraCintura gravam cada um na própria série', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');

  a.v('ctx.setPeso', 78.6);
  a.v('ctx.setCintura', 86.4);
  await a.v('ctx.registraPeso');
  await a.esperar();

  assert.strictEqual(a.S().body.peso.length, 1, 'o peso foi');
  assert.strictEqual(a.S().body.peso[0].v, 78.6);
  assert.strictEqual(a.S().body.cintura.length, 0,
    'e a cintura NÃO foi: um verbo por grandeza, e o rascunho da outra espera');

  await a.v('ctx.registraCintura');
  await a.esperar();
  assert.strictEqual(a.S().body.cintura[0].v, 86.4, 'agora sim, com o valor dela');
  assert.strictEqual(a.S().body.peso.length, 1, 'sem duplicar o peso');
  a.fechar();
});

test('ctx.registraPeso recusa o que não é número, e não grava meia medida', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');

  a.v('ctx.setPeso', 'abc');
  await a.v('ctx.registraPeso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 0, 'texto não vira medida');
  assert.strictEqual(a.toast(), 'Digite um número válido.');

  a.v('ctx.setPeso', 0);
  await a.v('ctx.registraPeso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 0, 'nem zero: não existe pesar zero');

  a.v('ctx.setPeso', '79,4');
  await a.v('ctx.registraPeso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso[0].v, 79.4, 'e a vírgula do teclado do iPhone vale ponto');
  a.fechar();
});

test('ctx.abreDiaCorpo abre o seletor de data de UMA grandeza e fecha no segundo toque', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.aberto, false, 'fechado por padrão');

  a.v('ctx.abreDiaCorpo', 'peso');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.aberto, true, 'abre o do peso');
  assert.strictEqual(a.vJ('ctx.corpo').cintura.dia.aberto, false,
    'e só o do peso: um seletor aberto por vez, senão dois campos de data competem');

  a.v('ctx.abreDiaCorpo', 'cintura');
  assert.strictEqual(a.vJ('ctx.corpo').peso.dia.aberto, false, 'abrir o outro fecha o primeiro');
  assert.strictEqual(a.vJ('ctx.corpo').cintura.dia.aberto, true);

  a.v('ctx.abreDiaCorpo', 'cintura');
  assert.strictEqual(a.vJ('ctx.corpo').cintura.dia.aberto, false, 'e o mesmo verbo fecha');
  a.fechar();
});

test('ctx.setPerfManual deixa ele contradizer o sinal de força que o app calculou', async () => {
  // O sinal de força do treino decide se o app manda comer mais: peso parado
  // com carga subindo é recomposição. Esta chave é a palavra final dele sobre
  // isso, e a tela precisa dizer de onde o sinal veio.
  const a = await app({ estado: vazio });
  a.aba('dados');

  const auto = a.vJ('ctx.dados').forca;
  assert.strictEqual(auto.opcoes[0].on, true, 'o padrão é o app decidir');
  assert.match(auto.txt, /coletando|e1rm/, 'e o texto explica de onde o sinal sai: ' + auto.txt);

  a.v('ctx.setPerfManual', true);
  await a.esperar();
  const f = a.vJ('ctx.dados').forca;
  assert.strictEqual(f.opcoes[1].on, true, '"está subindo" fica aceso');
  assert.strictEqual(f.opcoes[0].on, false, 'e "o app decide" apaga');
  assert.strictEqual(f.txt, 'definido na mão',
    'o texto para de inventar certeza do cálculo e diz que foi ele');
  assert.strictEqual(a.S().perfManual, true, 'e fica no estado, não só na tela');

  a.v('ctx.setPerfManual', false);
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.dados').forca.opcoes[2].on, true, '"não está" é o terceiro valor');
  assert.strictEqual(a.S().perfManual, false, 'e false não é lido como "sem resposta"');

  a.v('ctx.setPerfManual', null);
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.dados').forca.opcoes[0].on, true, 'e dá para devolver ao app');
  assert.strictEqual(a.S().perfManual, null);
  a.fechar();
});

test('ctx.abreCardio abre e fecha o registro rápido, no cromo do treino', async () => {
  // O placar e o registro de cardio moram na aba TREINO, no cromo — não em
  // HOJE. `ctx.cromoDoTreino` é a leitura que os desenha, e também não tinha
  // caso próprio.
  const a = await app({ estado: vazio });
  assert.strictEqual(a.vJ('ctx.cromoDoTreino').cardio.aberto, false, 'fechado por padrão');
  assert.match(a.vJ('ctx.cromoDoTreino').cardio.resumo, /0 de 2 nesta semana/,
    'e o placar da semana vem na mesma leitura, sem sair da tela');

  a.v('ctx.abreCardio');
  assert.strictEqual(a.vJ('ctx.cromoDoTreino').cardio.aberto, true, 'abre');
  a.v('ctx.abreCardio');
  assert.strictEqual(a.vJ('ctx.cromoDoTreino').cardio.aberto, false, 'e o mesmo verbo fecha');
  a.fechar();
});

// ---------------------------------------------------------------------------
// As cinco grandezas da bioimpedância: a tubulação, e a torneira
// ---------------------------------------------------------------------------
//
// ESTE CASO MUDOU DE ASSUNTO, e é a única asserção alterada nesta passada.
//
// Antes ele gravava a ausência: *"addBody nas cinco grandezas da bioimpedância
// recusa hoje, por falta de porta"*, com `Object.keys(CTX).filter(/bio/i)`
// valendo `[]`. A porta agora existe — `CTX.registraBio` —, e a asserção da
// lista vazia ficou vermelha. **Isso é o acerto, não uma regressão**: ela foi
// escrita exatamente para ficar vermelha no dia em que alguém construísse a
// torneira, e apontou a linha como prometido.
//
// O que ele guarda agora são as três coisas que continuam verdade:
//
//   1. **As cinco NÃO ganharam valor de partida.** `CORPO_PADRAO` segue com
//      `peso` e `cintura` só, então `addBody('bioPeso')` continua recusando —
//      e deve. Um padrão de `bioGorduraPct: 18` seria o app inventando leitura
//      de balança; campo de bioimpedância nasce vazio.
//   2. **A porta das cinco é `registraBio`, e é só ela.** Nenhuma outra chave
//      de `CTX` menciona bioimpedância.
//   3. **`dadosDoApp` continua não as contando no resumo do acervo.** Enquanto
//      não havia torneira isso era coerente — não havia o que contar. Agora é
//      omissão real: o resumo diz ao dono o tamanho do que ele tem a perder, e
//      a partir daqui ele pode ter leituras de bioimpedância que o resumo
//      ignora. Não consertei (está fora desta tarefa) e o caso grava o estado
//      de hoje, para quem consertar ter o vermelho que aponta a linha.

test('as cinco da bioimpedância seguem sem valor de partida, e a porta delas é ctx.registraBio', async () => {
  const a = await app({ estado: vazio });
  a.aba('dados');

  const bio = a.dado('MARCAS_DO_CORPO').filter(function (k) { return /^bio/.test(k); });
  assert.deepStrictEqual(bio, ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua'],
    'as cinco estão declaradas no domínio');

  for (const k of bio) {
    await a.v('addBody', k);
    await a.esperar();
    assert.strictEqual(a.S().body[k].length, 0, k + ' não grava: não tem valor de partida');
    assert.strictEqual(a.toast(), 'Digite um número válido.',
      k + ' recusa pela porta da manhã, que lê rascunho e referência que elas não têm');
  }

  // e UMA chave de `CTX` as alcança: a torneira, e nenhuma outra
  const chaves = Object.keys(a.m.ctx).filter(function (k) { return /bio/i.test(k); });
  assert.deepStrictEqual(chaves, ['registraBio'],
    'a bioimpedância tem uma porta de escrita, e só uma');
  assert.strictEqual(typeof a.m.ctx.registraBio, 'function');

  // o resumo do acervo AINDA não as conta — ver o comentário acima
  assert.ok(!/bio/i.test(a.vJ('ctx.dadosDoApp').resumo),
    'o resumo do que ele tem a perder conta peso e cintura, e não as cinco');
  a.fechar();
});

// ---------------------------------------------------------------------------
// A torneira: `ctx.registraBio`
// ---------------------------------------------------------------------------
//
// O QUE ESTE GRUPO PROVA: que existe no MODELO um caminho de escrita para as
// cinco grandezas da bioimpedância; que ele grava a leitura inteira num
// instante só; que ele recusa leitura incompleta sem gravar nada pela metade;
// que obedece à coluna `obrigatorio` de `MEDIDAS_DO_CORPO` em vez de a
// transcrever; que o peso da balança de bioimpedância é série SEPARADA da
// pesagem da manhã; e que o que ele grava atravessa a cópia de segurança.
//
// O QUE ESTE GRUPO NÃO PROVA — e aqui a ressalva é mais forte do que de
// costume: **A TELA NÃO EXISTE.** Não há campo, botão ou folha no app que
// chame `registraBio`. Chamar o verbo prova que a capacidade existe no modelo;
// não prova que o dono alcança a bioimpedância com o dedo, porque hoje ele não
// alcança. A tela é de outra frente, e nada aqui a antecipa: nenhum caso deste
// grupo toca o DOM.

/** Uma leitura de balança completa, na forma que um campo de aparelho entrega. */
const LEITURA = {
  bioPeso: 79.2, bioMusculo: 37.4, bioGordura: 14.1, bioGorduraPct: 17.8, bioAgua: 45.3
};

test('ctx.registraBio grava a leitura inteira da balança, num instante só', async () => {
  const a = await app({ estado: vazio });
  const r = await a.v('ctx.registraBio', LEITURA);
  await a.esperar();

  assert.strictEqual(r.ok, true, 'a leitura entrou');
  assert.deepStrictEqual(Array.prototype.slice.call(r.gravadas),
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua'],
    'as cinco, na ordem da tabela do domínio');

  const S = a.S();
  assert.deepStrictEqual(
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua']
      .map(function (k) { return S.body[k].length; }), [1, 1, 1, 1, 1],
    'uma marca em cada série');
  assert.strictEqual(S.body.bioGorduraPct[0].v, 17.8, 'com o valor que foi medido');
  const instantes = ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua']
    .map(function (k) { return S.body[k][0].t; });
  assert.strictEqual(new Set(instantes).size, 1,
    'e TODAS no mesmo instante: é o que as torna uma leitura, e não cinco medidas soltas');

  // texto com vírgula decimal, que é o que um campo de aparelho entrega
  await a.v('ctx.registraBio', {
    bioPeso: '78,6', bioMusculo: '37,5', bioGordura: '13,4', bioGorduraPct: '17,0', bioAgua: '45,9'
  }, Date.now() - DIA);
  await a.esperar();
  assert.strictEqual(a.S().body.bioPeso.length, 2, 'a leitura de ontem entrou também');
  assert.strictEqual(a.S().body.bioPeso[0].v, 78.6,
    'vírgula decimal lida como número, não como NaN nem como 78');
  assert.deepStrictEqual(a.S().body.bioPeso.map(function (x) { return x.v; }), [78.6, 79.2],
    'e a série fica em ordem de tempo, como a do peso da manhã');
  a.fechar();
});

test('ctx.registraBio recusa a leitura incompleta, e não grava nada pela metade', async () => {
  const a = await app({ estado: vazio });
  const semGordura = Object.assign({}, LEITURA);
  delete semGordura.bioGordura;

  const r = await a.v('ctx.registraBio', semGordura);
  await a.esperar();
  assert.strictEqual(r.ok, false, 'recusou');
  assert.deepStrictEqual(Array.prototype.slice.call(r.falta), ['bioGordura'],
    'e diz qual grandeza faltou');
  assert.strictEqual(a.toast(), 'Falta massa de gordura.',
    'com o NOME que a tabela do domínio dá a ela, não com a chave crua');

  const S = a.S();
  assert.deepStrictEqual(
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua']
      .map(function (k) { return S.body[k].length; }), [0, 0, 0, 0, 0],
    'NADA entrou: as quatro válidas também ficaram fora. Meia leitura de ' +
    'bioimpedância não fecha — gordura sem percentual, percentual sem peso');

  // lixo numa das obrigatórias
  const ruim = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioGorduraPct: 'dezoito' }));
  await a.esperar();
  assert.strictEqual(ruim.ok, false);
  assert.deepStrictEqual(Array.prototype.slice.call(ruim.invalidas), ['bioGorduraPct']);
  assert.strictEqual(a.toast(), 'Número inválido em percentual de gordura.');
  assert.strictEqual(a.S().body.bioPeso.length, 0, 'e de novo nada entrou');

  // zero e negativo não são medida de balança
  const zero = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioMusculo: 0 }));
  await a.esperar();
  assert.strictEqual(zero.ok, false, 'zero quilo de massa muscular não é uma medida');
  const neg = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioPeso: -79 }));
  await a.esperar();
  assert.strictEqual(neg.ok, false, 'nem peso negativo');
  assert.strictEqual(a.S().body.bioPeso.length, 0);

  // leitura sem nada: as quatro obrigatórias aparecem na recusa
  const nada = await a.v('ctx.registraBio', {});
  await a.esperar();
  assert.deepStrictEqual(Array.prototype.slice.call(nada.falta),
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct'],
    'quatro obrigatórias — a água não está na lista');
  a.fechar();
});

test('a água corporal é a única opcional, e é a tabela do domínio que diz isso', async () => {
  const a = await app({ estado: vazio });

  // a regra vem da tabela, não daqui: se ela mudar, este caso acusa
  const tabela = a.dado('MEDIDAS_DO_CORPO').filter(function (m) { return m.bio; });
  assert.strictEqual(tabela.length, 5, 'cinco grandezas saem da balança');
  assert.deepStrictEqual(tabela.filter(function (m) { return !m.obrigatorio; })
    .map(function (m) { return m.k; }), ['bioAgua'],
    'e uma só é opcional, declarada na tabela do domínio');

  const semAgua = Object.assign({}, LEITURA);
  delete semAgua.bioAgua;
  const r = await a.v('ctx.registraBio', semAgua);
  await a.esperar();
  assert.strictEqual(r.ok, true, 'a leitura sem água entra');
  assert.deepStrictEqual(Array.prototype.slice.call(r.gravadas),
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct'], 'com quatro medidas');
  assert.deepStrictEqual(a.S().body.bioAgua, [],
    'e a água fica VAZIA em vez de virar zero: ausência de medida não é medida de zero');

  // vazia em texto é o mesmo que ausente — é o que um campo em branco entrega
  const vazia = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioAgua: '' }), Date.now() - DIA);
  await a.esperar();
  assert.strictEqual(vazia.ok, true, 'campo em branco não é erro de digitação');
  assert.deepStrictEqual(a.S().body.bioAgua, [], 'e segue sem marca nenhuma');

  // mas lixo na opcional recusa a leitura inteira, em vez de perder a medida
  const lixo = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioAgua: 'x' }), Date.now() - 2 * DIA);
  await a.esperar();
  assert.strictEqual(lixo.ok, false,
    'opcional preenchida com lixo recusa: deixar passar em silêncio perderia ' +
    'uma medida digitada, e erro de digitação não é "não medi"');
  a.fechar();
});

test('o peso da bioimpedância é registro SEPARADO da pesagem da manhã', async () => {
  // Decisão do dono: ele pesa numa balança de manhã e mede na outra em outra
  // hora. As duas séries convivem de propósito, e o veredito da dieta — que lê
  // média semanal e ritmo — continua lendo só a da manhã.
  const a = await app({ estado: vazio });
  a.aba('dados');
  a.v('ctx.setPeso', 80.5);
  await a.v('ctx.registraPeso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 1, 'a pesagem da manhã entrou');
  assert.strictEqual(a.S().body.peso[0].v, 80.5);
  const vereditoAntes = a.vJ('ctx.dados').veredito;

  await a.v('ctx.registraBio', LEITURA);
  await a.esperar();

  assert.strictEqual(a.S().body.peso.length, 1,
    'a balança de bioimpedância NÃO acrescenta nem substitui a pesagem da manhã');
  assert.strictEqual(a.S().body.peso[0].v, 80.5, 'que continua sendo 80,5');
  assert.strictEqual(a.S().body.bioPeso.length, 1, 'e o peso dela mora na série própria');
  assert.strictEqual(a.S().body.bioPeso[0].v, 79.2,
    'com o valor da outra balança — 1,3 kg de diferença entre as duas, que é o fato');
  assert.deepStrictEqual(a.vJ('ctx.dados').veredito, vereditoAntes,
    'e o veredito da dieta não se mexeu: ele lê a pesagem da manhã, não a da balança');
  a.fechar();
});

test('registrar duas vezes no mesmo dia substitui a leitura e deixa lápide nas cinco', async () => {
  // A lápide é o que impede a fusão do outro aparelho de ressuscitar a leitura
  // corrigida: sem ela o dia teria duas medidas de cada grandeza.
  const a = await app({ estado: vazio });
  await a.v('ctx.registraBio', LEITURA);
  await a.esperar();
  const primeiro = a.S().body.bioPeso[0].t;
  assert.deepStrictEqual(a.S().apagados || {}, {}, 'nenhuma lápide ainda');

  await a.esperar(5);   // o relógio real anda: a segunda leitura tem outro instante
  const r = await a.v('ctx.registraBio', Object.assign({}, LEITURA, { bioPeso: 80.1 }));
  await a.esperar();
  assert.strictEqual(r.ok, true);
  assert.strictEqual(a.S().body.bioPeso.length, 1,
    'o dia continua com UMA leitura: a segunda substituiu, não empilhou');
  assert.strictEqual(a.S().body.bioPeso[0].v, 80.1, 'a corrigida é a que fica');
  assert.match(a.toast(), /substituiu a leitura do dia/,
    'e o app diz que substituiu, em vez de deixar parecer que acrescentou');

  const lapides = Object.keys(a.S().apagados || {});
  assert.strictEqual(lapides.length, 5,
    'uma lápide por grandeza substituída: ' + lapides.join(' '));
  assert.ok(lapides.every(function (k) { return k.indexOf(String(primeiro)) >= 0; }),
    'todas carimbando o instante da leitura antiga: ' + lapides[0]);
  a.fechar();
});

test('ctx.registraBio recusa data no futuro, e não grava nada', async () => {
  const a = await app({ estado: vazio });
  const r = await a.v('ctx.registraBio', LEITURA, Date.now() + DIA);
  await a.esperar();
  assert.strictEqual(r.ok, false, 'recusou');
  assert.strictEqual(r.futuro, true, 'e diz por quê');
  assert.strictEqual(a.toast(), 'Data no futuro: a leitura não foi registrada.');
  assert.strictEqual(a.S().body.bioPeso.length, 0, 'nada entrou');

  // uma data passada entra, e com o instante que foi pedido
  const quando = Date.now() - 3 * DIA;
  const ok = await a.v('ctx.registraBio', LEITURA, quando);
  await a.esperar();
  assert.strictEqual(ok.ok, true);
  assert.strictEqual(a.S().body.bioPeso[0].t, quando,
    'leitura retroativa cai no dia que ele disse, não em hoje');
  a.fechar();
});

test('a leitura que registraBio grava atravessa a cópia de segurança e volta pela importação', async () => {
  // É o fecho do assunto: a tubulação existia e não havia torneira. Isto mede a
  // água correndo do começo ao fim — torneira, estado, backup, apagar tudo,
  // importar de volta.
  //
  // Pelo caminho da IMPORTAÇÃO, e não semeando o backup no armazenamento: são
  // portas diferentes. Semear entra pelo boot, que copia `S` inteiro; importar
  // passa pela LISTA BRANCA (`corpoDoBackup`), que enumera as grandezas por
  // nome e é a única das duas que pode perder uma em silêncio. A primeira
  // versão deste caso semeava, e uma quebra deliberada da lista branca não o
  // derrubava — o caso passava afirmando o que não media.
  const a = await app({ estado: vazio });
  await a.v('ctx.registraBio', LEITURA);
  await a.esperar();
  const bkp = a.v('payload');
  assert.strictEqual(JSON.parse(bkp).data.body.bioGorduraPct[0].v, 17.8,
    'a leitura entrou na cópia de segurança');

  a.aceitar();
  await a.v('wipe');
  await a.esperar();
  assert.strictEqual(a.S().body.bioPeso.length, 0, 'apagou tudo — pré-condição');

  a.aba('guia');
  await a.v('importText', bkp);
  await a.esperar(60);

  const S = a.S();
  assert.deepStrictEqual(
    ['bioPeso', 'bioMusculo', 'bioGordura', 'bioGorduraPct', 'bioAgua']
      .map(function (k) { return S.body[k][0].v; }), [79.2, 37.4, 14.1, 17.8, 45.3],
    'e as cinco voltaram iguais pela lista branca, que as copia por nome');
  assert.strictEqual(S.body.peso.length, 0,
    'sem que a pesagem da manhã tenha ganhado nada de carona');
  a.fechar();
});
