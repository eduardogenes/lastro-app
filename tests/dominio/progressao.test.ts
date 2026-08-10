// O freio. O app registra, mas boa parte do que ele faz é atrasar a decisão de
// subir carga — músculo fica forte mais rápido do que tendão se adapta.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  PAUSA_DIAS, dorSeguida, historico, lastSet, pausaEx, setsFor, shouldUp
} from '../../src/dominio/progressao';
import type { IdEx, Log } from '../../src/dominio/tipos';
import { DIA, log } from './ajuda';

const ex = { s: 3, r: '6–10', car: 'pino' as const, g: 'peito', c: 1 as const, n: 'Supino' };

test('só sobe carga quando TODAS as séries bateram o topo da faixa', () => {
  assert.strictEqual(shouldUp(log([[60, 10], [60, 10], [60, 10]]), ex, 0), true);
  assert.strictEqual(shouldUp(log([[60, 10], [60, 10], [60, 9]]), ex, 0), false,
    'uma série abaixo do topo já segura a carga');
  assert.strictEqual(shouldUp(log([[60, 12], [60, 11], [60, 10]]), ex, 0), true,
    'passar do topo também conta');
});

test('série faltando não conta como sessão completa', () => {
  assert.strictEqual(shouldUp(log([[60, 10], [60, 10]]), ex, 0), false,
    'duas séries de três: não dá para concluir nada');
});

test('carga zero não sobe carga', () => {
  assert.strictEqual(shouldUp(log([[0, 10], [0, 10], [0, 10]]), ex, 0), false);
});

test('pausa longa suspende o selo', () => {
  const completo = log([[60, 10], [60, 10], [60, 10]]);
  assert.strictEqual(shouldUp(completo, ex, PAUSA_DIAS - 1), true);
  assert.strictEqual(shouldUp(completo, ex, PAUSA_DIAS), false,
    'voltando de pausa, repetir a última carga já é o trabalho da volta');
});

test('exercício por tempo não ganha selo de subir carga', () => {
  const prancha = Object.assign({}, ex, { u: 'seg' as const, r: '30–60' });
  assert.strictEqual(shouldUp(log([[0, 60], [0, 60], [0, 60]]), prancha, 0), false);
});

test('sem histórico não há decisão', () => {
  assert.strictEqual(shouldUp(null, ex, 0), false);
});

test('a sessão aberta não vira referência de si mesma', () => {
  const logs: Record<IdEx, Log[]> = {
    supino: [log([[60, 8]], { sid: 1 }), log([[65, 8]], { sid: 2 })]
  };
  assert.strictEqual(historico(logs, 'supino').length, 2, 'sem sessão aberta, tudo conta');
  assert.strictEqual(historico(logs, 'supino', { sid: 2 }).length, 1,
    'a sessão em andamento sai: senão o placeholder mostraria o que você acabou de digitar');
  assert.strictEqual(historico(logs, 'inexistente').length, 0, 'chave sem histórico devolve vazio');
});

test('o placeholder anda para trás até achar aquela série', () => {
  const h = [log([[60, 8], [60, 8], [60, 8]]), log([[65, 8]])];
  assert.deepStrictEqual(lastSet(h, 0), [65, 8], 'a mais recente ganha');
  assert.deepStrictEqual(lastSet(h, 2), [60, 8],
    'a última sessão teve uma série só; a terceira vem de antes');
  assert.strictEqual(lastSet(h, 5), null);
  assert.strictEqual(lastSet([], 0), null);
});

test('dor nas duas últimas sessões sugere trocar o ângulo', () => {
  const dor = (d: string[]) => log([[60, 8]], { dor: d });
  assert.deepStrictEqual(dorSeguida([dor(['ombro']), dor(['ombro'])]), ['ombro']);
  assert.strictEqual(dorSeguida([dor(['ombro']), dor(['cotovelo'])]), null,
    'dores diferentes não são um padrão');
  assert.strictEqual(dorSeguida([dor(['ombro'])]), null, 'uma sessão só não é seguida');
  assert.strictEqual(dorSeguida([dor(['ombro']), log([[60, 8]])]), null);
});

test('pausa do exercício é medida da última vez que ele foi registrado', () => {
  const agora = Date.now();
  const h = [log([[60, 8]], { t: agora - 20 * DIA }), log([[60, 8]], { t: agora - 3 * DIA })];
  assert.strictEqual(Math.round(pausaEx(h, agora)), 3, 'vale a mais recente, não a primeira');
  assert.strictEqual(pausaEx([], agora), 0, 'nunca feito não é pausa');
});

test('deload corta as séries pela metade, arredondando para cima', () => {
  assert.strictEqual(setsFor({ s: 3 }, true), 2, '3 vira 2, não 1: melhor sobrar que faltar');
  assert.strictEqual(setsFor({ s: 4 }, true), 2);
  assert.strictEqual(setsFor({ s: 3 }, false), 3);
});
