// Tipo de carga: resolve "esse peso é de um lado ou dos dois?".
// O app nunca converte o que foi digitado; o total é só exibição.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, DIA } = require('./harness');

test('todos os exercícios do plano declaram tipo de carga', async () => {
  const a = await app();
  const faltando = a.J(`
    ROT.reduce(function (acc, d) {
      PLAN[d].ex.forEach(function (ex) { if (!ex.car || !CARGAS[ex.car]) acc.push(d + ' ' + ex.n); });
      return acc;
    }, [])`);
  assert.deepStrictEqual(faltando, []);
  a.fechar();
});

test('rótulo do campo muda com o tipo', async () => {
  const a = await app();
  const rot = a.J('Object.keys(CARGAS).reduce(function (o,k) { o[k] = CARGAS[k].rot; return o; }, {})');
  assert.strictEqual(rot.pino, 'kg');
  assert.strictEqual(rot.lado, 'kg/lado');
  assert.strictEqual(rot.halter, 'kg/lado', 'halter em cada mão também é por unidade');
  assert.strictEqual(rot.halter1, 'kg', 'um halter só não tem lado');
  assert.strictEqual(rot.corpo, '+kg');
  a.fechar();
});

test('anilha por lado mostra o total sem contar a barra', async () => {
  const a = await app();
  a.E('go("C")');
  a.E('toggle(0)');                       // agachamento hack
  assert.strictEqual(a.texto('.ex.open .unit'), 'kg/lado');

  a.preencher(0, 0, 60, 10);
  const t = a.texto('#tot0');
  assert.ok(t.includes('120 kg em anilhas'), 'dobra o lado: ' + t);
  assert.ok(t.includes('fora a barra'));

  a.preencher(0, 1, 80, 10);
  assert.ok(a.texto('#tot0').includes('160 kg em anilhas'), 'acompanha a digitação');
  a.fechar();
});

test('halter em cada mão soma as duas', async () => {
  const a = await app();
  a.E('toggle(0)');                       // supino inclinado com halteres
  a.preencher(0, 0, 30, 10);
  assert.ok(a.texto('#tot0').includes('60 kg nas duas mãos'));
  a.fechar();
});

test('um halter só não mostra total', async () => {
  const a = await app();
  a.E('go("B")');
  a.E('toggle(2)');                       // remada serrote
  assert.strictEqual(a.texto('.ex.open .unit'), 'kg');
  assert.strictEqual(a.$('.ex.open .anilhas'), null);
  a.fechar();
});

test('peso do corpo aceita carga vazia', async () => {
  const a = await app();
  a.E('go("C")');
  a.E('toggle(5)');                       // elevação de pernas suspenso
  assert.strictEqual(a.texto('.ex.open .unit'), '+kg');

  a.preencher(5, 0, null, 12);
  a.preencher(5, 1, null, 12);
  assert.deepStrictEqual(a.J('S.logs.C5[0].sets[0]'), [0, 12]);
  assert.strictEqual(a.E('S.logs.C5[0].sets.filter(Boolean).length'), 2);
  a.fechar();
});

test('correção do tipo persiste e some ao voltar ao padrão', async () => {
  const a = await app();
  a.E('toggle(1)');
  await a.E('setCarga(1,"lado")');
  await a.esperar();
  assert.strictEqual(a.J('S.carga').A1, 'lado');
  assert.strictEqual(a.texto('.ex.open .unit'), 'kg/lado');

  await a.E('setCarga(1,"pino")');
  await a.esperar();
  assert.deepStrictEqual(a.J('S.carga'), {}, 'voltar ao padrão não deixa lixo no estado');
  a.fechar();
});

test('chave interna continua pino para não quebrar correção antiga', async () => {
  const a = await app({ estado: { logs: {}, done: [], carga: { A0: 'pino' } } });
  assert.strictEqual(a.E('cargaTipo("A0", PLAN.A.ex[0])'), 'pino');
  assert.strictEqual(a.E('CARGAS[cargaTipo("A0", PLAN.A.ex[0])].nome'), 'placa');
  a.fechar();
});

test('histórico de peso do corpo plota repetições, não carga', async () => {
  const agora = Date.now();
  const logs = { C5: [] }, done = [];
  [0, 1, 2, 3].forEach(function (k) {
    const t = agora - (8 - k * 2) * DIA;
    done.push({ day: 'C', t: t, sid: t, dur: 50 * 60000 });
    logs.C5.push({ t: t, sid: t, sets: [[0, 10 + k], [0, 10 + k], [0, 9 + k]] });
  });

  const a = await app({ estado: { logs: logs, done: done } });
  a.E('go("C")');
  a.E('toggle(5)');
  a.E('openHist(5)');

  const eixos = a.$$('.chart .axu').map(function (x) { return x.textContent; });
  assert.deepStrictEqual(eixos, ['reps'], 'sem carga, só a faixa de repetições');
  const pontos = a.$$('.chart text.vl').map(function (x) { return x.textContent; });
  assert.deepStrictEqual(pontos, ['29', '32', '35', '38']);
  assert.ok(a.texto('.stats span').includes('repetições'));
  a.fechar();
});

test('histórico por lado carrega a unidade no eixo e no resumo da série', async () => {
  const agora = Date.now();
  const t = agora - 2 * DIA;
  const a = await app({ estado: {
    logs: { C0: [{ t: t, sid: t, sets: [[90, 10], [90, 10], [90, 9], [90, 9]] }] },
    done: [{ day: 'C', t: t, sid: t, dur: 50 * 60000 }]
  } });
  a.E('go("C")');
  a.E('toggle(0)');
  a.E('openHist(0)');

  assert.ok(a.$$('.chart .axu').map(x => x.textContent).includes('kg/lado'));
  assert.ok(a.texto('.hs-sets').includes('180 kg em anilhas'));
  assert.ok(a.$$('.ex-sub .tag').some(function (x) { return x.textContent.trim() === 'anilha por lado'; }));
  a.fechar();
});
