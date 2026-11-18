// Tipo de carga: resolve "esse peso é de um lado ou dos dois?".
// O app nunca converte o que foi digitado; o total é só exibição.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

// (a integridade do catálogo virou tests/dominio/carga.test.ts)
test('rótulo do campo muda com o tipo', async () => {
  const a = await app();
  const rot = (function (C) { return Object.keys(C).reduce(function (o, k) { o[k] = C[k].rot; return o; }, {}); })(a.dado('CARGAS'));
  assert.strictEqual(rot.pino, 'kg');
  assert.strictEqual(rot.lado, 'kg/lado');
  assert.strictEqual(rot.halter, 'kg/lado', 'halter em cada mão também é por unidade');
  assert.strictEqual(rot.halter1, 'kg', 'um halter só não tem lado');
  assert.strictEqual(rot.corpo, '+kg');
  a.fechar();
});

test('chave interna continua pino para não quebrar correção antiga', async () => {
  // correção gravada quando a chave ainda era posicional: a migração leva junto
  const a = await app({ estado: { plano: 2, logs: {}, done: [], carga: { A0: 'pino' } } });
  await a.esperar();
  assert.strictEqual(a.v('cargaTipo', a.v('id', 'A', 0), a.vJ('treino', 'A').ex[0]), 'pino');
  assert.strictEqual(a.dado('CARGAS')[a.v('cargaTipo', a.v('id', 'A', 0), a.vJ('treino', 'A').ex[0])].nome, 'placa');
  assert.strictEqual(a.S().carga[a.k('A',0)], 'pino', 'reindexada para o exercício');
  a.fechar();
});

