// O PLANO ALIMENTAR na Prescrição — a D, `prescricao.html`, estado 7.
//
// O que tem dentro de cada refeição, como se lê no prato; o momento criado por
// ele marcado como dele, ao lado do que o nutricionista escreveu (F182); e o
// saldo dos passos de ±150 kcal à vista.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function naComida(antes) {
  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  if (antes) antes(a);
  await a.modo('comida');
  await a.esperar();
  return a;
}

test('cada refeição diz o que tem dentro, e o condicional à alta demanda é dito', async () => {
  const a = await naComida();
  const pre = a.texto('[data-a="refeicao-pre"]');
  assert.ok(pre.indexOf('pão Artesano 35 g · doce de leite 20 g · canela em pó 1 g') >= 0, pre);
  assert.ok(pre.indexOf('só em dia de treino') >= 0, pre);
  const tr = a.texto('[data-a="refeicao-treino"]');
  assert.ok(/maltodextrina \/ dextrose 25 g só em dia de alta demanda/.test(tr), tr);
  a.fechar();
});

test('o momento criado por ele aparece marcado como dele; os do nutricionista não', async () => {
  const a = await naComida(function (a) {
    a.E(`planoDeComida().push({ id: 'r-minha', t: '22:00', n: 'Ceia minha', tag: '', quando: 'sempre', nota: '',
                                itens: [{ f: 'leite', q: 200 }] })`);
  });
  assert.ok(a.texto('[data-a="refeicao-r-minha"]').indexOf('criada por você') >= 0);
  assert.strictEqual(a.texto('[data-a="refeicao-pre"]').indexOf('criada por você'), -1);
  a.fechar();
});

test('o ajuste acumulado: nenhum passo, ou o saldo dos passos', async () => {
  const a = await naComida();
  assert.strictEqual(a.texto('[data-a="ajuste-acumulado"]'), 'nenhum passo de ±150 kcal aplicado');
  a.fechar();
  const b = await naComida(function (b) { b.E('S.ajuste = -2'); });
  assert.strictEqual(b.texto('[data-a="ajuste-acumulado"]'), '−300 kcal · 2 passos');
  b.fechar();
});

// ---------- as compras (a D, prescrição, estado 8) ----------

async function nasCompras(antes) {
  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  if (antes) antes(a);
  await a.modo('alimentos');
  await a.esperar();
  return a;
}
const chip = (a, t) => a.$$('.ins-chip').filter(b => b.textContent.trim() === t)[0];

test('o horizonte das compras: 3, 7, 15 dias ou outro número', async () => {
  const a = await nasCompras();
  a.clicar(chip(a, '15 dias'));
  await a.esperar();
  assert.strictEqual(a.S().compras.dias, 15);
  assert.strictEqual(a.$('[data-a="compras-dias"]'), null, 'sem "outro", sem campo');

  a.clicar(chip(a, 'outro'));
  await a.esperar();
  const campo = a.$('[data-a="compras-dias"]');
  assert.ok(campo, '"outro" abre o campo');
  campo.value = '10';
  campo.dispatchEvent(new a.window.Event('change', { bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.S().compras.dias, 10);
  assert.ok(chip(a, 'outro').classList.contains('on'));

  const c2 = a.$('[data-a="compras-dias"]');
  c2.value = '0';
  c2.dispatchEvent(new a.window.Event('change', { bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.S().compras.dias, 10, 'zero dias não é horizonte');
  a.fechar();
});

test('um horizonte guardado fora dos três abre como "outro", com o número', async () => {
  const a = await nasCompras(function (a) { a.E('S.compras.dias = 14'); });
  assert.ok(chip(a, 'outro').classList.contains('on'));
  assert.strictEqual(a.$('[data-a="compras-dias"]').value, '14');
  a.fechar();
});

test('o que só entra em dia de alta demanda fica fora, e a tela diz', async () => {
  const a = await nasCompras();
  assert.ok(/Dias de alta demanda não entram nesta previsão: maltodextrina \/ dextrose não aparece aqui\./.test(a.texto('main')),
    'a maltodextrina não aparece e a tela diz por quê');
  assert.ok(!a.vJ('ctx.compras').linhas.some(l => l.f === 'malto'), 'e não está na lista de compras');
  a.fechar();
});

// ---------- o vazio da fila (a D, prescrição, estado 4) ----------

test('nada esperando diz quando foi a última mudança que entrou no programa', async () => {
  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  assert.strictEqual(a.$('[data-a="ultima-que-entrou"]'), null, 'sem nada no histórico, nada a dizer');
  a.fechar();

  const t1 = new Date(2026, 8, 21, 20, 0).getTime(), t2 = new Date(2026, 8, 29, 21, 0).getTime();
  const b = await app({ aba: 'prescricao', estado: { progLog: [
    { t: t2, day: 'B', txt: 'Cadeira flexora: 3 → 4 séries' },
    { t: t1, day: 'A', txt: 'Supino: 2 → 3 séries' }
  ] } });
  await b.esperar();
  assert.strictEqual(b.texto('[data-a="ultima-que-entrou"]'), 'a última mudança que entrou no programa foi em 29/09');
  b.fechar();
});
