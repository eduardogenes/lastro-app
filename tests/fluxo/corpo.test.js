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
  const a = await app({ estado: { logs: [], done: [],
    body: { peso: pesagens([73.0, 73.05, 73.10]), cintura: [] } } });
  a.aba('dados');
  // o veredito é o cartão do Instrumento; o legado saiu de DADOS para não
  // aparecer duas vezes na mesma tela
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Comer mais');
  assert.strictEqual(a.texto('.ins-veredito-p'), a.E('veredito().p'), 'a tela não reescreve o texto');
  assert.ok(a.$('.ins-veredito'), 'e é um objeto destacado, com borda');
  a.fechar();
});

test('cintura tem precedência sobre o peso, e a tela diz por quê', async () => {
  const a = await app({ estado: { logs: [], done: [], body: {
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  } } });
  a.aba('dados');
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Comer menos');
  assert.ok(a.texto('.ins-veredito-p').includes('cintura'));
  a.fechar();
});

test('registro aceita vírgula e substitui a medida do mesmo dia', async () => {
  const a = await app();
  a.aba('dados');
  a.E('view.bodyForm = { peso: "73,4" }');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso[0].v'), 73.4, 'vírgula do teclado pt-BR');

  a.E('view.bodyForm = { peso: "73,8" }');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso.length'), 1, 'uma medida por dia');
  assert.strictEqual(a.E('S.body.peso[0].v'), 73.8);
  a.fechar();
});

test('entrada inválida não grava', async () => {
  const a = await app();
  a.aba('dados');
  a.E('view.bodyForm = { peso: "abc" }');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso.length'), 0);
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
  assert.strictEqual(a.E('cardioSemana().length'), 1, 'a da semana passada não conta');
  assert.strictEqual(a.E('CTX.corpo().cardio.semana'), 1, 'e a tela conta o mesmo');
  const nota = a.$$('.ins-secao-nota').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(/1 de 2 nesta semana/.test(nota), nota);
  a.fechar();
});

test('cardio avisa quando houve treino de perna no mesmo dia', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'B', t: Date.now(), sid: Date.now() }] } });
  a.aba('dados');
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

  assert.ok(!a.J('S.body.peso').some(function (x) { return x.v === 743; }), 'e sai do histórico');
  a.fechar();
});

test('sessão de cardio registrada por engano pode ser apagada', async () => {
  const a = await app();
  await a.E('S.cardio.push({ t: Date.now(), m: "bike", min: 25, i: "moderado" }); save()');
  await a.esperar();
  a.aba('dados');

  const linha = a.$$('.crow').find(function (x) { return /bike/.test(x.textContent); });
  assert.ok(linha, 'a sessão da semana aparece com a porta de saída');
  linha.querySelector('.crow-x').click();
  await a.esperar();

  assert.strictEqual(a.E('S.cardio.length'), 0);
  a.fechar();
});

test('preencher treino passado avisa para onde as séries estão indo', async () => {
  const a = await app();
  const t = Date.now() - 2 * 86400000;
  a.E('abrirAdicionar(' + t + ')');
  a.E('addSet("tipo","A")');
  await a.E('gravarRetro(true)');
  await a.esperar();

  const aviso = a.texto('.tr-aviso');
  assert.ok(/não em hoje/.test(aviso), 'sem isso, a sessão retroativa fica invisível: ' + aviso);

  const botao = a.$$('.tr-aviso button').find(function (x) { return /concluir/.test(x.textContent); });
  assert.ok(botao, 'e a porta de saída fica no próprio aviso');
  await botao.click();
  await a.esperar();
  assert.strictEqual(a.E('S.sessao'), null, 'concluir encerra a sessão retroativa');
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
  assert.strictEqual(a.E("CTX.corpo().peso.valor"), 75);
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.J('S.body.peso').length, 1, 'o botão sozinho já registra');
  assert.strictEqual(a.J('S.body.peso')[0].v, 75);
  a.fechar();
});

test('mexer no stepper antes de registrar não quebra a tela', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');

  // o stepper entrega NÚMERO, não string: é o que fazia o .replace estourar
  a.E('CTX.setPeso(73.4)');
  assert.strictEqual(a.E("CTX.corpo().peso.valor"), 73.4, 'a tela mostra o que ele escolheu');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.J('S.body.peso')[0].v, 73.4, 'e é isso que vai para o histórico');

  // depois de gravar, o stepper se deriva da última medida em vez de zerar
  assert.strictEqual(a.E("CTX.corpo().peso.valor"), 73.4);
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
  assert.strictEqual(a.J('S.body.peso').length, 1, 'clicar em "registrar hoje" registra');

  a.clicar(botoes[1]);
  await a.esperar();
  assert.strictEqual(a.J('S.body.cintura').length, 1, 'e a cintura também');
  assert.strictEqual(a.J('S.body.cintura')[0].v, 85);
  a.fechar();
});

test('cintura usa o stepper dela, não o do peso', async () => {
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: Date.now(), v: 73 }], cintura: [] } } });
  a.aba('dados');
  a.E('CTX.setCintura(84.5)');
  await a.E('addBody("cintura")');
  await a.esperar();
  assert.strictEqual(a.J('S.body.cintura')[0].v, 84.5);
  assert.strictEqual(a.J('S.body.peso').length, 1, 'o peso não foi tocado');
  a.fechar();
});

// ---------- data retroativa da medida ----------
// Pesou ontem e esqueceu de registrar: lançar como hoje deslocaria a média de
// duas semanas, e é a média que decide comer mais ou comer menos.

test('o padrão continua sendo hoje, num toque', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');
  const d = a.J('CTX.corpo().peso.dia');
  assert.strictEqual(d.hoje, true, 'abre em hoje, sem pedir data');
  assert.strictEqual(d.aberto, false, 'e o seletor fica fechado');
  assert.strictEqual(a.E("CTX.corpo().peso.acao"), 'registrar hoje');
  a.fechar();
});

test('escolher ontem grava no dia certo, não em hoje', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');

  const ontem = a.J('CTX.corpo().peso.dia').opcoes[1].k;
  a.E('CTX.setDiaCorpo("peso", ' + ontem + ')');
  assert.strictEqual(a.E("CTX.corpo().peso.acao"), 'registrar ontem',
    'o botão passa a dizer em que dia vai gravar');

  a.E('CTX.setPeso(73.4)');
  await a.E('addBody("peso")');
  await a.esperar();

  const m = a.J('S.body.peso');
  assert.strictEqual(m.length, 1);
  assert.strictEqual(m[0].v, 73.4);
  assert.strictEqual(a.E('sameDay(S.body.peso[0].t, Date.now())'), false, 'não caiu em hoje');
  assert.strictEqual(a.E('sameDay(S.body.peso[0].t, ' + ontem + ')'), true);
  a.fechar();
});

test('depois de gravar, a data volta para hoje sozinha', async () => {
  // deixar uma data passada armada faria a próxima pesagem cair no dia errado
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');
  const ontem = a.J('CTX.corpo().peso.dia').opcoes[1].k;
  a.E('CTX.setDiaCorpo("peso", ' + ontem + ')');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.J('CTX.corpo().peso.dia').hoje, true);
  assert.strictEqual(a.E("CTX.corpo().peso.acao"), 'registrar hoje');
  a.fechar();
});

test('cada dia oferecido diz o que já tem registrado', async () => {
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: ontem, v: 73.4 }], cintura: [] } } });
  a.aba('dados');
  const op = a.J('CTX.corpo().peso.dia').opcoes;
  assert.strictEqual(op.length, 5, 'cinco dias bastam para quem esquece ontem');
  assert.strictEqual(op[0].t, 'hoje', 'hoje ainda está vazio');
  assert.ok(/^ontem · 73/.test(op[1].t), 'o dia preenchido mostra o valor: ' + op[1].t);
  a.fechar();
});

test('escolher um dia já medido parte do valor daquele dia', async () => {
  // o gesto ali é corrigir aquele dia; partir do último peso faria digitar por
  // cima do que já estava certo
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [],
    body: { peso: [{ t: ontem, v: 73.4 }, { t: Date.now(), v: 75 }], cintura: [] } } });
  a.aba('dados');
  assert.strictEqual(a.E('CTX.corpo().peso.valor'), 75, 'em hoje, mostra o de hoje');

  const dOntem = a.J('CTX.corpo().peso.dia').opcoes[1].k;
  a.E('CTX.setDiaCorpo("peso", ' + dOntem + ')');
  assert.strictEqual(a.E('CTX.corpo().peso.valor'), 73.4, 'em ontem, mostra o de ontem');

  a.E('CTX.setPeso(73.9)');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.J('S.body.peso').length, 2, 'corrigiu, não duplicou');
  assert.strictEqual(a.J('S.body.peso')[0].v, 73.9);
  a.fechar();
});

test('a data é por medida: peso e cintura não se misturam', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');
  const ontem = a.J('CTX.corpo().peso.dia').opcoes[1].k;
  a.E('CTX.setDiaCorpo("peso", ' + ontem + ')');
  assert.strictEqual(a.J('CTX.corpo().peso.dia').hoje, false);
  assert.strictEqual(a.J('CTX.corpo().cintura.dia').hoje, true, 'a cintura continua em hoje');
  a.fechar();
});

test('o seletor de data abre e fecha pelo link', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('dados');
  assert.strictEqual(a.$$('.dd-dia').length, 0, 'fechado por padrão: não custa espaço');
  assert.ok(a.$('.dd-diabtn'), 'mas existe o caminho');

  a.clicar(a.$('.dd-diabtn'));
  assert.strictEqual(a.$$('.dd-dia .ins-chip').length, 5, 'abre com os cinco dias');
  a.fechar();
});
