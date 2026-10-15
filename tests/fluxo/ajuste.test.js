// O ajuste calórico é um SALDO, não um destino.
//
// A regra do nutricionista tem critérios diferentes para cortar e para subir,
// e é essa assimetria que evita o efeito sanfona: depois de um ajuste, a nova
// ingestão VIRA a linha de base. Cortou e o peso voltou à faixa? As calorias
// novas ficam. Enquanto o ajuste era `-1 | 0 | 1` lido como estado-destino, um
// veredito de observar com corte em vigor punha na tela um botão "voltar ao
// plano base" — convidando a desfazer exatamente o que não se desfaz.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, inicioDaSemana, DIA } from './harness.js';
import { cacheFalso } from './dubles.js';

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

/** 14 dias com registro: sem isto a trava de adesão não deixa nada acontecer. */
function comidaRegistrada(dias, aderencia) {
  const out = [];
  for (let i = 1; i <= dias; i++) {
    const d = new Date(Date.now() - i * DIA);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
    const h = { d: iso, done: { cafe: Date.now() }, agua: 0, escala: {},
                tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: Date.now() };
    if (aderencia) h.aderencia = aderencia;
    out.push(h);
  }
  return out.sort(function (x, y) { return x.d < y.d ? -1 : 1; });
}

function comPeso(medias) {
  return app({ estado: {
    logs: {}, done: [], perfManual: false,
    comidaHist: comidaRegistrada(14),
    body: { peso: pesagens(medias), cintura: [] }
  } });
}

test('dois passos no mesmo sentido somam, e a tela diz que são dois', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer mais 150 kcal');
  const base = a.v('arrozAtual');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 1);
  assert.strictEqual(a.v('arrozAtual'), base + 120, '+150 kcal são 120 g de arroz');

  semanasNovas(a);
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 2, 'o segundo passo soma ao primeiro');
  assert.strictEqual(a.v('arrozAtual'), base + 240, 'e o arroz anda de novo');
  assert.ok(a.vJ('ctx.dados').veredito.estado.includes('2 passos'),
    a.vJ('ctx.dados').veredito.estado);
  a.fechar();
});

test('um passo por evidência: depois de aplicar, as mesmas semanas não pedem outro', async () => {
  // Decisão do dono, 14/10. A Semana continuava oferecendo "aplicar" sobre as
  // mesmas duas semanas, e um segundo toque virava 300 kcal por um motivo só.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 1);

  const v = a.vJ('ctx.dados').veredito;
  assert.ok(/^Não mexer: o passo de \d\d\/\d\d ainda está sendo medido$/.test(v.t), v.t);
  assert.ok(/duas semanas de peso inteiras depois dele, de \d\d\/\d\d a \d\d\/\d\d: faltam 2 semanas\./.test(v.p), v.p);
  assert.strictEqual(v.podeAplicar, false, 'nada a aplicar enquanto o passo é medido');
  assert.strictEqual(v.podeDesfazer, true, 'e desfazer continua à mão');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 1, 'o segundo toque não aplica nada');
  assert.strictEqual(a.S().ajusteHist.length, 1);

  // desfeito o passo, não há o que esperar: as semanas voltam a decidir
  await a.v('ctx.desfazAjuste'); await a.esperar();
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer mais 150 kcal');
  a.fechar();
});

test('observar não oferece desfazer o corte', async () => {
  // 0,35 kg/semana: fora da faixa-alvo, mas sem critério para agir. Era aqui
  // que nascia o convite a devolver as 150 kcal.
  const a = await comPeso([73.0, 73.20, 73.55]);
  a.E('S.ajuste = -1');
  a.aba('semana');
  const v = a.vJ('ctx.dados').veredito;
  assert.strictEqual(v.t, 'Não mexer: uma semana sozinha não decide');
  assert.strictEqual(v.podeAplicar, false, 'nada a aplicar: observar não é decisão');
  assert.strictEqual(v.acaoTxt, null);
  assert.ok(v.estado.includes('−150 kcal'), 'mas o saldo continua à vista: ' + v.estado);
  a.fechar();
});

test('cada passo guarda de onde veio', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();

  const h = a.S().ajusteHist;
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].de, 0);
  assert.strictEqual(h[0].para, 1);
  assert.strictEqual(h[0].k, 'mais');
  // 13 e não 14: a janela de `janelaDoHistorico` é aberta no extremo antigo,
  // então o 14º dia atrás fica de fora. Acima da trava de 11, que é o que vale.
  assert.strictEqual(h[0].reg, 13, 'a adesão registrada na hora fica com o passo');
  assert.ok(h[0].p.includes('0,05'), 'e o veredito por extenso: ' + h[0].p);
  a.fechar();
});

test('manter não mexe no saldo nem no ledger', async () => {
  const a = await comPeso([73.0, 73.25, 73.5]);
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Não mexer: a taxa está na faixa');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 0);
  assert.strictEqual(a.S().ajusteHist.length, 0);
  a.fechar();
});

test('saldo de dois passos sobrevive ao boot', async () => {
  const a = await app({ estado: { logs: {}, done: [], ajuste: -2 } });
  assert.strictEqual(a.S().ajuste, -2, 'o clamp ternário de antes truncaria para 0');
  a.fechar();
});

test('o backup leva o saldo e o ledger', async () => {
  const a = await app();
  a.E('S.ajuste = -2');
  a.E("S.ajusteHist = [{ t: 1, de: -1, para: -2, k: 'menos', p: 'texto', reg: 13 }]");
  a.aba('ajustes');
  a.v('showJSON');
  const bkp = JSON.parse(a.doc.getElementById('jout').value);
  assert.strictEqual(bkp.data.ajuste, -2);
  assert.strictEqual(bkp.data.ajusteHist.length, 1);
  a.fechar();

  const b = await app({ estado: bkp.data });
  assert.strictEqual(b.S().ajuste, -2);
  assert.strictEqual(b.S().ajusteHist[0].k, 'menos', 'a procedência voltou junto');
  b.fechar();
});

test('restaurar o plano é o caminho documentado para zerar', async () => {
  // Tirei o botão que desfazia sozinho; o desfazer continua existindo, um
  // nível para dentro e com confirmação. É a regra 6 do produto.
  const a = await app();
  a.E('S.ajuste = -2');
  a.E('window.confirm = function () { return true; }');
  await a.v('ctx.restauraPlano'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 0);
  a.fechar();
});

// ---------- a leitura das fotos, que é o que destrava o corte ----------

const iso = n => {
  const d = new Date(Date.now() - n * DIA);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
};

function comFotos(a, datas) {
  a.E(`S.protocolo.sessoes = ${JSON.stringify(datas)}.map(function (d, i) {
    return { d: d, t: 1, m: 1, fotos: { 'frente-relaxado': { v: i + 1, ext: 'webp' } } };
  })`);
}

test('a leitura das fotos destrava o corte que o peso sozinho não dá', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);          // duas semanas acima de 0,40
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);

  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Não mexer: falta a avaliação das fotos',
    'sem a leitura, o peso abre revisão e não corta');

  a.v('ctx.abreComparar');
  const p = a.vJ('ctx.comparacao').pergunta;
  assert.ok(p, 'a pergunta aparece num par de 14 dias');
  assert.strictEqual(p.valor, null, 'e começa sem resposta');

  await a.v('ctx.setGordura', 'sim'); await a.esperar();
  assert.strictEqual(a.S().gordura.length, 1);
  assert.strictEqual(a.S().gordura[0].v, 'sim');
  assert.strictEqual(a.S().gordura[0].d, iso(0), 'a chave é a sessão mais nova');

  a.aba('semana');
  const v = a.vJ('ctx.dados').veredito;
  assert.strictEqual(v.t, 'Comer menos 150 kcal');
  assert.strictEqual(v.podeAplicar, true, 'e agora há o que aplicar');
  a.fechar();
});

test('fotos sem piora mandam manter, e não cortam', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);
  a.v('ctx.abreComparar');
  await a.v('ctx.setGordura', 'nao'); await a.esperar();

  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Não mexer: as fotos não mostram piora',
    'ganho acima da faixa não é ruim por si: está comprando músculo');
  a.fechar();
});

test('responder de novo substitui, em vez de empilhar opinião', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);
  a.v('ctx.abreComparar');
  await a.v('ctx.setGordura', 'sim'); await a.esperar();
  await a.v('ctx.setGordura', 'incerto'); await a.esperar();

  assert.strictEqual(a.S().gordura.length, 1, 'uma leitura por par');
  assert.strictEqual(a.S().gordura[0].v, 'incerto');
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Não mexer: a avaliação das fotos ficou incerta', 'incerto não corta');
  assert.strictEqual(a.vJ('ctx.dados').veredito.podeAplicar, false);
  a.fechar();
});

test('num par de três meses a pergunta não aparece', async () => {
  // Seria outra pergunta, e a régua leria a resposta como se fosse esta.
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(92), iso(0)]);
  a.v('ctx.abreComparar');
  assert.strictEqual(a.vJ('ctx.comparacao').pergunta, null);
  a.fechar();
});

test('com quatro sessões de foto, "Responder" ainda acha o par de 10 a 28 dias', async () => {
  // Regressão (docs/mapa, risco R2 da visão geral): o par da pergunta era o mais
  // longo, e a partir da quarta sessão a cada 14 dias ele passava de 28 dias. A
  // pergunta sumia e o corte por ganho rápido travava.
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(42), iso(28), iso(14), iso(0)]);
  a.aba('semana');
  const portoes = a.vJ('ctx.dados').veredito.portoes || [];
  assert.ok(portoes.some(function (g) { return g.acao === 'responder'; }), 'o portão oferece responder');

  a.v('ctx.abreAvaliacao');
  const c = a.vJ('ctx.comparacao');
  assert.ok(c.pergunta, 'a comparação abre num par com a pergunta');
  assert.match(c.pergunta.t, /Comparando com 28 dias atrás/);
  await a.v('ctx.setGordura', 'sim'); await a.esperar();
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer menos 150 kcal', 'e o corte destrava');
  a.fechar();
});

test('semanas pesadas há dois meses, e nada depois, não decidem nada', async () => {
  // Regressão (docs/mapa, risco R1): três semanas válidas, mas velhas, davam
  // "Comer mais 150 kcal" com o botão.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.E(`S.body.peso.forEach(function (x) { x.t -= 6 * 7 * 86400000; })`);
  a.aba('semana');
  const v = a.vJ('ctx.dados').veredito;
  assert.strictEqual(v.t, 'Não mexer: faltam pesagens', v.t);
  assert.ok(/quebra a sequência/.test(v.p), v.p);
  assert.strictEqual(a.vJ('ctx.dados').veredito.portoes, null, 'sem portões');
  a.fechar();
});

test('enquanto o passo é medido, os portões não aparecem', async () => {
  // Regressão (docs/mapa, risco R4): os portões cumpridos sugeriam uma decisão
  // que a regra não ia tomar.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  assert.ok(a.vJ('ctx.dados').veredito.portoes, 'antes do passo, os portões estão lá');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.match(a.vJ('ctx.dados').veredito.t, /ainda está sendo medido/, 'o passo está sendo medido');
  assert.strictEqual(a.vJ('ctx.dados').veredito.portoes, null);
  a.fechar();
});

test('restaurar o plano fecha o passo em vigor no registro', async () => {
  // Regressão (docs/mapa, risco R5 da área 09): o passo ficava no registro
  // parecendo vigente, com o saldo já em zero.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  a.E('window.confirm = function () { return true; }');
  await a.v('ctx.restauraPlano'); await a.esperar();
  const u = a.S().ajusteHist[a.S().ajusteHist.length - 1];
  assert.ok(u.desfeito, 'o passo saiu do registro como desfeito');
  assert.match(a.toast(), /saiu junto/);
  assert.ok(!/Apliquei/.test(a.vJ('ctx.dados').veredito.estado || ''), 'e a linha não diz que ele vale');
  a.fechar();
});

// ---------- as saídas da dieta ----------
// O peso responde ao que ele COMEU, não ao que estava prescrito. Reduzir o
// plano-base numa semana de saídas tiraria comida dos dias em que ele seguiu.

async function comDieta(aderencia) {
  const a = await app({ estado: {
    logs: {}, done: [], perfManual: false,
    comidaHist: comidaRegistrada(14, aderencia),
    body: { peso: pesagens([73.0, 73.6, 74.2]), cintura: [] }
  } });
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);
  a.v('ctx.abreComparar');
  await a.v('ctx.setGordura', 'sim'); await a.esperar();
  a.aba('semana');
  return a;
}

test('semana perdida trava o corte, mesmo com as fotos confirmando', async () => {
  const a = await comDieta('perdido');
  const v = a.vJ('ctx.dados').veredito;
  assert.strictEqual(v.t, 'Não mexer: falta registro de comida');
  assert.strictEqual(v.podeAplicar, false, 'não se corta o plano por comida que veio de fora dele');
  a.fechar();
});

test('sair do plano sabendo o que comeu não trava', async () => {
  const a = await comDieta('fora');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer menos 150 kcal',
    'saída registrada ainda deixa a semana legível');
  a.fechar();
});

test('a folha do dia oferece os três estados, e a escolha persiste', async () => {
  const a = await app();
  a.aba('prescricao');
  a.v('ctx.abreSeletorDeDia');

  await a.v('ctx.setAderencia', 'perdido'); await a.esperar();
  assert.strictEqual(a.vJ('diaDeComida').aderencia, 'perdido');

  await a.v('ctx.setAderencia', 'plano'); await a.esperar();
  assert.strictEqual(a.vJ('diaDeComida').aderencia, undefined,
    'seguir o plano é a ausência de marca: não se guarda o padrão');
  a.fechar();
});

// ---------- mexer no plano no meio do ajuste ----------
//
// O passo de 120 g se REPARTE entre os itens marcados com arroz, e desfazer
// recalculava o passo pela contagem DE AGORA — não pela de quando somou. Trocar
// ou remover um dos dois pratos de arroz com ajuste em vigor fazia o desfazer
// achar UM item e tirar dele os 120 g do dia inteiro: medido, o jantar caía a
// 190 g com a prescrição em 250, e o prato trocado ficava com os +60 para
// sempre, porque perdeu a marca e o desfazer não passava mais por ele.
//
// Mexer no plano é normal, e o dono respondeu de quem é o número que fica no
// prato quando a quantidade de pratos muda: **é dele**. Então o app desfaz
// exatamente o que somou, e para isso lembra quanto deu a cada item.

/** A quantidade do primeiro item de uma refeição do plano guardado. */
function itemDe(a, refId) {
  const r = a.vJ('planoDeComida').filter(function (x) { return x.id === refId; })[0];
  return r.itens[0];
}

/** Põe o veredito em "comer menos", que é o caminho de volta do saldo. */
/**
 * As duas semanas novas de peso chegaram: o passo em vigor fica mais velho que
 * as semanas que a regra lê, e ela pode decidir de novo (decisão do dono,
 * 14/10 — um passo por evidência).
 */
function semanasNovas(a) {
  a.E('S.ajusteHist[S.ajusteHist.length - 1].t = Date.now() - 30 * 86400000');
}

async function viraParaMenos(a) {
  if (a.S().ajusteHist.length) semanasNovas(a);
  a.E('S.body.peso = ' + JSON.stringify(pesagens([73.0, 73.6, 74.2])));
  comFotos(a, [iso(14), iso(0)]);
  a.v('ctx.abreComparar');
  await a.v('ctx.setGordura', 'sim'); await a.esperar();
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer menos 150 kcal');
}

test('trocar o arroz de um prato não tira comida do outro', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  cacheFalso(a);
  a.aba('semana');
  assert.strictEqual(itemDe(a, 'almoco').q, 250, 'a prescrição do almoço');
  assert.strictEqual(itemDe(a, 'jantar').q, 250, 'e a do jantar');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 1);
  assert.strictEqual(itemDe(a, 'almoco').q, 310, '+60 em cada: o passo é do dia');
  assert.strictEqual(itemDe(a, 'jantar').q, 310);

  // o arroz do almoço vira cuscuz: a marca cai, e o desfazer não passa mais
  // por ele — era aqui que a contagem de agora virava 1
  await a.v('ctx.trocaItem', 'almoco', 0, 'cuscuz'); await a.esperar();
  assert.strictEqual(itemDe(a, 'almoco').arroz, undefined, 'a marca cai na troca');

  await viraParaMenos(a);
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 0, 'o saldo voltou ao plano base');
  assert.strictEqual(itemDe(a, 'jantar').q, 250,
    'o jantar volta à PRESCRIÇÃO, não a 190: o desfazer tira o que deu, não o passo de agora');
  a.fechar();
});

test('perder a marca do arroz devolve a parte daquele item', async () => {
  // A outra metade: o alimento trocado ficava com os +60 g PARA SEMPRE, porque
  // a marca caiu e o desfazer não o alcança mais. Como o número é do dono, o
  // app devolve exatamente o que tomou — o item volta à prescrição.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(itemDe(a, 'almoco').q, 310);

  await a.v('ctx.trocaItem', 'almoco', 0, 'cuscuz'); await a.esperar();
  assert.strictEqual(itemDe(a, 'almoco').f, 'cuscuz');
  assert.strictEqual(itemDe(a, 'almoco').q, 250,
    'devolve os 60 g que o ajuste lhe deu, e não fica com eles para sempre');
  assert.strictEqual(itemDe(a, 'jantar').q, 310,
    'e o outro prato não é tocado: a troca é de um item só');
  a.fechar();
});

test('remover o arroz de um prato não tira comida do outro', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  cacheFalso(a);
  a.aba('semana');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(itemDe(a, 'jantar').q, 310);

  // o item sai do plano inteiro — e sai com os gramas que recebeu, porque não
  // há mais prato para devolvê-los
  await a.v('ctx.removeItem', 'almoco', 0); await a.esperar();
  assert.strictEqual(itemDe(a, 'almoco').f, 'feijao', 'o arroz do almoço saiu do plano');

  await viraParaMenos(a);
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 0);
  assert.strictEqual(itemDe(a, 'jantar').q, 250,
    'o jantar volta à prescrição, e não a 190');
  a.fechar();
});

test('remover a refeição inteira não tira comida da outra', async () => {
  // O terceiro caminho que muda a contagem de pratos com arroz, e o que ninguém
  // tinha olhado: `removeRefeicao` leva o item junto, sem passar por
  // `removeItem`.
  const a = await comPeso([73.0, 73.05, 73.10]);
  cacheFalso(a);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();

  await a.v('ctx.removeRefeicao', 'almoco'); await a.esperar();
  assert.strictEqual(a.vJ('planoDeComida').filter(function (r) { return r.id === 'almoco'; }).length, 0);

  await viraParaMenos(a);
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(itemDe(a, 'jantar').q, 250, 'o jantar volta à prescrição');
  a.fechar();
});

test('duplicar a refeição com arroz não tira comida de ninguém', async () => {
  // `duplicaRefeicao` clona o item COM a marca: a contagem SOBE no meio do
  // ajuste. O lado de aplicar continua dividindo pela contagem de agora — é o
  // que o plano prescreve —, e o de desfazer continua exato.
  const a = await comPeso([73.0, 73.05, 73.10]);
  cacheFalso(a);
  a.aba('semana');
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(itemDe(a, 'jantar').q, 310);

  await a.v('ctx.duplicaRefeicao', 'jantar'); await a.esperar();
  await viraParaMenos(a);
  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.S().ajuste, 0);
  a.vJ('planoDeComida').forEach(function (r) {
    r.itens.forEach(function (i) {
      if (i.f === 'arroz') assert.strictEqual(i.q, 250, r.n + ' volta à prescrição');
    });
  });
  a.fechar();
});

// ---------- o carimbo de versão do plano ----------
//
// `S.comida.v` é a versão do plano nutricional. Cada dia de comida fechado
// guarda em `pv` a versão contra a qual ele foi calculado, e é a comparação das
// duas que faz a tela dizer "este dia foi calculado contra outro plano".
//
// A regra é uma e vale nos dois sentidos: QUEM MUDA O PLANO CARIMBA, QUEM NÃO
// MUDA NÃO CARIMBA. Os dois casos abaixo nasceram vermelhos, um de cada lado:
// aplicar o passo movia 120 g de arroz no plano persistido SEM carimbar (o app
// sub-relatava divergência), e cancelar a restauração carimbava SEM mudar nada
// (super-relatava). Erros espelhados no mesmo campo.

test('aplicar o passo carimba a versão do plano, porque ele mexe no arroz', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Comer mais 150 kcal');

  // `versaoDoPlano` não está na superfície, e não deve estar: é leitura
  // preguiçosa que INICIALIZA o campo. Lê-se o estado.
  const antes = a.S().comida.v || 0;
  const arrozAntes = a.v('arrozAtual');

  await a.v('ctx.aplicaAjuste'); await a.esperar();

  assert.strictEqual(a.v('arrozAtual'), arrozAntes + 120, 'o plano mudou de verdade');
  assert.ok((a.S().comida.v || 0) > antes,
    'e a versão subiu com ele: um dia fechado antes disto tem de poder dizer ' +
    'que foi calculado contra outro plano — versão: ' + antes + ' → ' + a.S().comida.v);
  a.fechar();
});

test('cancelar a restauração do plano NÃO carimba a versão', async () => {
  const a = await app();
  const antes = a.S().comida.v || 0;
  const planoAntes = JSON.stringify(a.S().comida.plano);

  a.recusar();
  a.v('ctx.restauraPlano');
  await a.esperar();

  assert.strictEqual(JSON.stringify(a.S().comida.plano), planoAntes,
    'cancelar não mexeu no plano');
  assert.strictEqual(a.S().comida.v || 0, antes,
    'e por isso não há versão nova a carimbar: carimbar aqui faria o app ' +
    'relatar divergência de plano em dias que não divergiram');
  a.fechar();
});

test('o passo diz antes do toque o que vira base, e depois diz quem aplicou, quando e quanto', async () => {
  // §6.3 da frente 3. Antes: a consequência em número (V4), e o que não volta
  // sozinho. Depois: o agente é o app (V8), com o instante e as kcal do dia de
  // treino antes e depois — guardadas no passo, porque o plano muda.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.esperar();
  const v0 = a.vJ('ctx.dados').veredito;
  assert.strictEqual(v0.estado.indexOf('plano base'), 0, 'pré-condição: sem passo, a linha é o estado');
  const m = /^Depois de aplicado, ([\d.]+) kcal vira a nova base\. Se o peso voltar ao alvo, o passo não é devolvido sozinho\.$/.exec(v0.naoVolta);
  assert.ok(m, 'a frase do que não volta, antes do toque: ' + v0.naoVolta);
  assert.ok(a.texto('.dd-naovolta'), 'e ela está na tela, junto do botão');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  assert.strictEqual(a.toast(), 'Apliquei +150 kcal. O arroz do plano foi para ' + a.v('arrozAtual') + ' g.');
  const passo = a.S().ajusteHist.slice(-1)[0];
  assert.strictEqual(passo.kpara.toLocaleString('pt-BR'), m[1], 'o número prometido antes é o que o passo deu');
  assert.ok(passo.kpara > passo.kde, 'e subiu');
  // O passo seguinte é outro veredito; a linha olha só o que está em vigor.
  const e = a.vJ('ctx.dados').veredito.estado;
  assert.ok(new RegExp('^Apliquei \\+150 kcal em \\d\\d/\\d\\d, às \\d+h\\d\\d · ' +
    passo.kde.toLocaleString('pt-BR').replace('.', '\\.') + ' → ' + m[1].replace('.', '\\.') +
    ' kcal em dia de treino · ajuste \\+150 kcal · arroz \\d+ g$').test(e), e);
  a.fechar();
});

// ---------- os portões, o vazio e o desfazer (§6.2, §6.4, §6.3 da frente 3) ----------

function comPesoEComida(medias, dias) {
  return app({ estado: {
    logs: {}, done: [], perfManual: false,
    comidaHist: comidaRegistrada(dias),
    body: { peso: pesagens(medias), cintura: [] }
  } });
}

test('com a adesão faltando, a Semana promete não cobrar em outro lugar — e o Agora não cobra', async () => {
  // Decisão do dono, 14/10: a promessa entra, e é cumprida.
  const a = await comPesoEComida([73.0, 73.05, 73.10], 1);
  a.aba('semana');
  await a.esperar();
  assert.strictEqual(a.texto('[data-a="promessa-adesao"]'),
    'Enquanto a adesão não chega a 11, o veredito não muda, por mais pesagem que entre. A tela não vai pedir isso de novo em outro lugar.');
  a.aba('agora');
  await a.esperar();
  const agora = a.texto('#app');
  assert.ok(!/adesão/i.test(agora), 'o Agora não fala de adesão: ' + (agora.match(/.{0,40}ades.{0,40}/i) || [''])[0]);
  a.fechar();

  const b = await comPesoEComida([73.0, 73.05, 73.10], 14);
  b.aba('semana');
  await b.esperar();
  assert.strictEqual(b.$('[data-a="promessa-adesao"]'), null, 'com a adesão cumprida, não há o que prometer');
  b.fechar();
});

test('peso parado mostra os três portões, e o da adesão leva a pôr os dias em dia', async () => {
  const a = await comPesoEComida([73.0, 73.05, 73.10], 1);
  a.aba('semana');
  await a.esperar();
  const ks = a.$$('[data-portao]').map(function (x) { return x.getAttribute('data-portao'); });
  assert.deepStrictEqual(ks, ['taxa', 'forca', 'adesao']);
  assert.strictEqual(a.texto('[data-portao="forca"] .ins-linha-t'), 'Força: cumprida — não está subindo');
  assert.strictEqual(a.texto('[data-portao="adesao"] .ins-linha-t'), 'Adesão: falta — 1 dia de 14');
  assert.ok(a.$('[data-portao="forca"] [data-a="portao-ver-forca"]'), 'a força tem o "Ver a força"');

  a.clicar('[data-a="portao-por-em-dia"]');
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'dias', '"Pôr em dia" leva aos dias, onde cada um se põe em dia');
  a.fechar();
});

test('peso subindo rápido mostra taxa, adesão e avaliação visual — sem força', async () => {
  const a = await comPesoEComida([73.0, 73.5, 74.0], 14);
  a.aba('semana');
  await a.esperar();
  const ks = a.$$('[data-portao]').map(function (x) { return x.getAttribute('data-portao'); });
  assert.deepStrictEqual(ks, ['taxa', 'adesao', 'visual']);
  assert.strictEqual(a.texto('[data-portao="visual"] .ins-linha-t'), 'Avaliação visual: falta — sem resposta');
  assert.strictEqual(a.$('[data-a="portao-responder"]'), null, 'sem par de fotos, não há o que responder');
  a.fechar();
});

test('com uma semana sozinha fora da faixa, não há portão nenhum', async () => {
  const a = await comPesoEComida([73.0, 73.1, 73.85], 14);
  a.aba('semana');
  await a.esperar();
  assert.strictEqual(a.$('[data-portao]'), null);
  a.fechar();
});

test('o vazio lista as semanas, e as duas saídas levam ao Corpo', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [], cintura: [] } } });
  a.aba('semana');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.dados').veredito.t, 'Não mexer: faltam pesagens');
  assert.strictEqual(a.$$('.dd-semanas .ins-linha').length, 4, 'as quatro últimas semanas');
  assert.strictEqual(a.$$('.dd-semanas .ins-linha-v')[1].textContent, 'nenhuma pesagem', 'zero se diz "nenhuma", não "0 pesagens"');
  assert.strictEqual(a.texto('.dd-naoinvente'), 'Não invente o peso de um dia que passou.');

  a.clicar('[data-a="vazio-outro-dia"]');
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'corpo');
  assert.strictEqual(a.vista().bodyDiaAberto, 'peso', 'e com o dia do peso já aberto');
  a.fechar();
});

test('o vazio diz a saída quando um buraco separa duas semanas válidas', async () => {
  const s = function (k, dow) { return inicioDaSemana(Date.now()) - k * 7 * DIA + dow * DIA + 10 * 3600000; };
  const peso = [
    { t: s(3, 1), v: 73 }, { t: s(3, 3), v: 73 },
    { t: s(2, 2), v: 73 },
    { t: s(1, 1), v: 73 }, { t: s(1, 3), v: 73 }
  ];
  const a = await app({ estado: { logs: {}, done: [], body: { peso: peso, cintura: [] } } });
  a.aba('semana');
  await a.esperar();
  assert.ok(/^Com a semana de \d\d\/\d\d incompleta, as de \d\d\/\d\d e \d\d\/\d\d não formam sequência\. Uma pesagem com data passada em \d\d\/\d\d ainda resolve isso — se você souber o número\.$/
    .test(a.texto('.dd-saida')), a.texto('.dd-saida'));
  a.fechar();
});

test('"Desfazer" volta o plano ao saldo de antes, e o passo fica no registro marcado', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  await a.esperar();
  const base = a.v('arrozAtual');
  assert.strictEqual(a.$('[data-a="desfaz-ajuste"]'), null, 'sem passo, não há o que desfazer');

  await a.v('ctx.aplicaAjuste'); await a.esperar();
  a.clicar('[data-a="desfaz-ajuste"]');
  await a.esperar();
  assert.strictEqual(a.S().ajuste, 0, 'o saldo voltou');
  assert.strictEqual(a.v('arrozAtual'), base, 'e o arroz junto');
  assert.strictEqual(a.S().ajusteHist.length, 1, 'o passo não sumiu do registro');
  assert.ok(a.S().ajusteHist[0].desfeito > 0, 'ficou marcado como desfeito');
  assert.strictEqual(a.toast(), 'Desfiz o +150 kcal. O arroz do plano voltou para ' + base + ' g.');
  assert.strictEqual(a.$('[data-a="desfaz-ajuste"]'), null, 'e o botão sai: não há mais passo em vigor');
  assert.ok(a.vJ('ctx.dados').veredito.estado.indexOf('plano base') === 0, 'a linha volta ao estado');
  a.fechar();
});

test('se o aparelho recusa, o passo não entra pela metade e a tela diz o que não mudou', async () => {
  // A D (`semana.html`, estado 10). O passo mexe no ajuste, no histórico dele e
  // no arroz de duas refeições — e antes dizia "Apliquei" sem saber se tinha
  // gravado. Agora grava na hora; se o aparelho recusa, os três voltam juntos.
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('semana');
  const base = a.v('arrozAtual');
  const plano = JSON.stringify(a.S().comida.plano);
  a.encheCota();
  await a.v('ctx.aplicaAjuste'); await a.esperar(60);

  assert.strictEqual(a.S().ajuste || 0, 0, 'o ajuste não mudou');
  assert.strictEqual((a.S().ajusteHist || []).length, 0, 'o histórico do passo não ganhou linha');
  assert.strictEqual(a.v('arrozAtual'), base, 'e o arroz continua onde estava');
  assert.strictEqual(JSON.stringify(a.S().comida.plano), plano, 'o plano inteiro, igual');
  assert.ok(!/Apliquei/.test(a.toast() || ''), 'nenhum "Apliquei" antes de gravar');
  assert.ok(/O passo não foi aplicado/.test(a.texto('.dd-passo-falhou')), a.texto('.dd-passo-falhou'));
  assert.ok(/O veredito continua valendo: \+150 kcal/.test(a.texto('.dd-passo-falhou')));

  a.encheCota(false);
  a.clicar('[data-a="passo-tenta"]');
  await a.esperar(60);
  assert.strictEqual(a.S().ajuste, 1, '"Tentar de novo" aplica');
  assert.strictEqual(a.v('arrozAtual'), base + 120);
  assert.strictEqual(a.$('.dd-passo-falhou'), null);
  assert.ok(/Apliquei \+150 kcal/.test(a.toast()), a.toast());
  a.fechar();
});
