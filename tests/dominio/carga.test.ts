// Os seis tipos de carregamento e as agregações de série.
// O app NUNCA converte, só rotula — converter seria mentira.

import { test } from 'vitest';
import assert from 'node:assert';
import { isTime, maxLoad, repsOf, topReps, totalAnilhas, tutOf, volOf } from '../../src/dominio/carga';
import { CARGAS, PROGRAMA, ROT_BASE } from '../../src/dominio/programa';
import { log } from './ajuda';

test('todo exercício do programa declara um tipo de carga conhecido', () => {
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    assert.ok(CARGAS[ex.car], ex.n + ' tem tipo desconhecido: ' + ex.car);
  }));
});

test('só os tipos de dois lados mostram total', () => {
  assert.strictEqual(CARGAS.lado.dobra, 1, 'anilha por lado');
  assert.strictEqual(CARGAS.halter.dobra, 1, 'um halter em cada mão');
  assert.strictEqual(CARGAS.halter1.dobra, undefined, 'um halter só não tem o que somar');
  assert.strictEqual(CARGAS.pino.dobra, undefined, 'placa já é a carga inteira');
  assert.strictEqual(CARGAS.corpo.dobra, undefined);
  assert.strictEqual(CARGAS.assist.dobra, undefined);
});

test('o total em anilhas é o dobro do lado e nunca soma a barra', () => {
  assert.strictEqual(totalAnilhas(20), 40);
  assert.strictEqual(totalAnilhas(22.5), 45);
  assert.strictEqual(totalAnilhas(0), 0, 'sem anilha não há total');
  assert.strictEqual(totalAnilhas(-5), 0);
});

test('a chave interna do tipo mais comum continua sendo pino', () => {
  // renomear quebraria as correções de tipo já gravadas em S.carga
  assert.ok(CARGAS.pino, 'S.carga guarda essa string no aparelho dele');
});

test('exercício por tempo se reconhece pela unidade', () => {
  assert.strictEqual(isTime({ u: 'seg' }), true);
  assert.strictEqual(isTime({ n: 'Supino' }), false);
  assert.strictEqual(isTime(null), false, 'slot vazio não pode derrubar a tela');
  assert.strictEqual(isTime(undefined), false);
});

test('volume soma peso × repetição e ignora série não feita', () => {
  const l = log([[60, 10], [60, 8], null]);
  assert.strictEqual(volOf(l), 1080);
  assert.strictEqual(repsOf(l), 18);
  assert.strictEqual(maxLoad(l), 60);
  assert.strictEqual(tutOf(l), 18, 'por tempo, o segundo campo são segundos');
});

test('volume de uma sessão sem nada feito é zero', () => {
  const l = log([null, null]);
  assert.strictEqual(volOf(l), 0);
  assert.strictEqual(maxLoad(l), 0);
  assert.strictEqual(repsOf(l), 0);
});

test('o topo da faixa é o segundo número, com traço ou meia-risca', () => {
  assert.strictEqual(topReps('6–10'), 10, 'meia-risca, que é o que o programa usa');
  assert.strictEqual(topReps('8-12'), 12, 'hífen comum também');
  assert.strictEqual(topReps('12–20'), 20);
});
