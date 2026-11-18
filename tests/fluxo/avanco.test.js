// O avanço automático de exercício.
//
// Tira um toque por exercício de quem está de pé, com uma mão, entre séries —
// o mesmo motivo pelo qual o cronômetro de descanso passou a disparar sozinho.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** Preenche todas as séries do exercício `i` do dia aberto. */
function completa(a, i) {
  const n = a.v('setsFor', a.vJ('treino', a.vista().day).ex[i]);
  for (let k = 0; k < n; k++) a.preencher(i, k, 40, 10);
  return n;
}

test('ao completar o último set, o próximo abre pronto', async () => {
  const a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  assert.strictEqual(a.vista().open, 0);

  completa(a, 0);
  await a.esperar();

  assert.strictEqual(a.vista().open, 1, 'a tela andou sozinha');
  assert.strictEqual(a.v('estadoEx', a.vista().day, 0, a.S().sessao.sid, a.S().sessao.pulados), 'feito');
  assert.strictEqual(a.v('estadoEx', a.vista().day, 1, a.S().sessao.sid, a.S().sessao.pulados), 'nada',
    'aberto PRONTO, não iniciado: nada foi preenchido nele');
  a.fechar();
});

test('com série faltando, a tela não anda', async () => {
  const a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  const n = a.v('setsFor', a.vJ('treino', a.vista().day).ex[0]);
  for (let k = 0; k < n - 1; k++) a.preencher(0, k, 40, 10);
  await a.esperar();
  assert.strictEqual(a.vista().open, 0, 'ainda falta uma série neste');
  a.fechar();
});

test('o avanço pula o que foi pulado de propósito', async () => {
  const a = await app();
  a.v('go', 'A');
  await a.v('pularEx', 1);
  await a.esperar();

  a.v('toggle', 0);
  completa(a, 0);
  await a.esperar();

  assert.strictEqual(a.vista().open, 2, 'voltar a oferecer o que ele recusou seria discutir');
  a.fechar();
});

test('no último pendente, a tela fica onde está', async () => {
  const a = await app();
  a.v('go', 'A');
  const total = a.vJ('treino', a.vista().day).ex.length;
  // deixa só o primeiro pendente: pula todos os outros
  for (let j = 1; j < total; j++) await a.v('pularEx', j);
  await a.esperar();

  a.v('toggle', 0);
  completa(a, 0);
  await a.esperar();

  assert.strictEqual(a.vista().open, 0,
    'chegar ao fim é informação, e quem decide é a tela de finalizar');
  a.fechar();
});

test('o descanso ainda começa, e diz de qual exercício é', async () => {
  // O cronômetro é do exercício que ACABOU, não do que abriu. Se o rótulo
  // andasse junto com a tela, ele diria a coisa errada.
  const a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  const nome = a.vJ('treino', a.vista().day).ex[0].n;
  completa(a, 0);
  await a.esperar();

  assert.ok(a.dado('timerFim') > Date.now(), 'o descanso está correndo');
  assert.ok(a.dado('timerCtx').includes(nome), 'e é o do exercício que acabou: ' + a.dado('timerCtx'));
  a.fechar();
});

// ---------- o atalho de volta ao treino ----------
// Registrar é só metade do uso da academia: entre séries ele marca água,
// confere o que falta comer, olha o peso. Voltar custava dois toques e uma
// rolagem, de pé, com uma mão.

test('sem sessão aberta não há atalho', async () => {
  const a = await app();
  a.aba('prescricao');
  assert.strictEqual(a.$('.ins-atalho'), null);
  a.fechar();
});

test('na própria aba de treino o atalho some', async () => {
  const a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.esperar();

  a.aba('treino');
  assert.strictEqual(a.$('.ins-atalho'), null,
    'seria uma porta para a sala em que já se está');
  a.fechar();
});

