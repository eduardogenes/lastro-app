// Tipo de carga: resolve "esse peso é de um lado ou dos dois?".
// O app nunca converte o que foi digitado; o total é só exibição.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

// (a integridade do catálogo virou tests/dominio/carga.test.ts)
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
  a.E('toggle(0)');                       // pendulum squat
  assert.strictEqual(a.texto('.ex.open .sethead .f'), 'kg/lado');

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
  a.E('go("C")');
  a.E('toggle(6)');                       // rosca martelo
  a.preencher(6, 0, 30, 10);
  assert.ok(a.texto('#tot6').includes('60 kg nas duas mãos'));
  a.fechar();
});

test('um halter só não mostra total', async () => {
  // Nenhum exercício do plano nasce como halter único; é uma correção que ele
  // faz na hora, quando pega um halter só em vez de um par.
  const a = await app();
  a.E('go("C")');
  a.E('toggle(6)');                       // rosca martelo
  await a.E('setCarga(6,"halter1")');
  await a.esperar();
  assert.strictEqual(a.texto('.ex.open .sethead .f'), 'kg');
  assert.strictEqual(a.$('.ex.open .anilhas'), null);
  a.fechar();
});

test('peso do corpo aceita carga vazia', async () => {
  const a = await app();
  a.E('go("D")');
  a.E('toggle(5)');                       // elevação de pernas ou reverse crunch
  assert.strictEqual(a.texto('.ex.open .sethead .f'), '+kg');

  a.preencher(5, 0, null, 12);
  a.preencher(5, 1, null, 12);
  assert.deepStrictEqual(a.log('D',5)[0].sets[0], [0, 12]);
  assert.strictEqual(a.log('D',5)[0].sets.filter(Boolean).length, 2);
  a.fechar();
});

test('correção do tipo persiste e some ao voltar ao padrão', async () => {
  const a = await app();
  a.E('toggle(1)');
  await a.E('setCarga(1,"lado")');
  await a.esperar();
  assert.strictEqual(a.J('S.carga')[a.k('A',1)], 'lado',
    'a correção acompanha o exercício, não a posição no treino');
  assert.strictEqual(a.texto('.ex.open .sethead .f'), 'kg/lado');

  await a.E('setCarga(1,"pino")');
  await a.esperar();
  assert.deepStrictEqual(a.J('S.carga'), {}, 'voltar ao padrão não deixa lixo no estado');
  a.fechar();
});

test('chave interna continua pino para não quebrar correção antiga', async () => {
  // correção gravada quando a chave ainda era posicional: a migração leva junto
  const a = await app({ estado: { plano: 2, logs: {}, done: [], carga: { A0: 'pino' } } });
  await a.esperar();
  assert.strictEqual(a.E('cargaTipo(id("A",0), treino("A").ex[0])'), 'pino');
  assert.strictEqual(a.E('CARGAS[cargaTipo(id("A",0), treino("A").ex[0])].nome'), 'placa');
  assert.strictEqual(a.J('S.carga')[a.k('A',0)], 'pino', 'reindexada para o exercício');
  a.fechar();
});

test('histórico de peso do corpo plota repetições, não carga', async () => {
  const agora = Date.now();
  const logs = { D8: [] }, done = [];
  [0, 1, 2, 3].forEach(function (k) {
    const t = agora - (8 - k * 2) * DIA;
    done.push({ day: 'D', t: t, sid: t, dur: 50 * 60000 });
    logs.D8.push({ t: t, sid: t, sets: [[0, 10 + k], [0, 10 + k], [0, 9 + k]] });
  });

  const a = await app({ estado: { logs: logs, done: done, plano: 2 } });
  a.E('go("E")');   // ombros e braços: era D até o plano 5
  a.E('toggle(8)');
  a.E('openHist(8)');

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
    done: [{ day: 'C', t: t, sid: t, dur: 50 * 60000 }], plano: 2
  } });
  a.E('go("C")');
  a.E('toggle(0)');
  a.E('openHist(0)');

  assert.ok(a.$$('.chart .axu').map(x => x.textContent).includes('kg/lado'));
  assert.ok(a.texto('.hs-sets').includes('180 kg em anilhas'));
  assert.ok(a.$$('.ex-sub .tag').some(function (x) { return x.textContent.trim() === 'anilha por lado'; }));
  a.fechar();
});
