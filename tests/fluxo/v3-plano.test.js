// O Plano no visual novo (direção 3, Fase 4): os treinos, os dias de treino,
// a comida com a quantidade pela régua, os alimentos e as compras. Dados e
// ações são os de sempre.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

async function noPlano() {
  const a = await app({ aba: 'prescricao', agora: agoraEstavel(10), estado: { logs: {}, done: [] } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  return a;
}

test('o Plano: os treinos levam ao editor, e os dias de treino mudam a cadência', async () => {
  const a = await noPlano();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Plano');
  assert.ok(a.$('[data-a="plano-treino-A"]'));
  const antes = a.E('cadenciaDaSemana()[0]');
  a.clicar('[data-a="cadencia-0"]');
  await a.esperar();
  assert.notStrictEqual(a.E('cadenciaDaSemana()[0]'), antes, 'o domingo trocou');
  a.clicar('[data-a="plano-treino-A"]');
  await a.esperar();
  assert.ok(/^Treino A/.test(a.texto('.v3-cab h1')), 'o editor do treino');
  a.fechar();
});

test('a comida: a quantidade de um item muda pela régua e vale para o plano', async () => {
  const a = await noPlano();
  const id = a.E('planoDeComida()[0].id');
  a.clicar(`[data-a="plano-ref-${id}"]`);
  await a.esperar(40);
  const q0 = a.E(`achaRefeicao(${JSON.stringify(id)}).itens[0].q`);
  a.clicar('[data-a="plano-item-0"]');
  await a.esperar();
  a.clicar('.v3-folha .v3-regua-p button:last-child');
  await a.esperar(10);
  a.clicar('.v3-folha .v3-regua-p button:last-child');
  await a.esperar();
  a.clicar('[data-a="plano-qtd-ok"]');
  await a.esperar(60);
  assert.strictEqual(a.E(`achaRefeicao(${JSON.stringify(id)}).itens[0].q`), q0 + 10, 'dois passos de 5');
  assert.ok(a.$('[data-a="plano-item-0"]'), 'e volta à lista da refeição');
  a.fechar();
});

test('alimentos buscam pelo nome, e compras marcam o que já foi comprado', async () => {
  const a = await noPlano();
  a.clicar('[data-a="plano-alimentos"]');
  await a.esperar(40);
  const todos = a.$$('.v3-folha .v3-lin').length;
  const campo = a.$('#alimentos-busca');
  campo.value = 'arroz';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  const achados = a.$$('.v3-folha .v3-lin').map(e => e.textContent.toLowerCase());
  assert.ok(achados.length > 0 && achados.length < todos, 'filtrou');
  assert.ok(achados.every(t => t.includes('arroz')), 'só arroz');
  a.v('ctx.fechaFolha');
  await a.esperar();
  a.clicar('[data-a="plano-compras"]');
  await a.esperar(40);
  const b = a.$('.v3-compra');
  assert.ok(b, 'há o que comprar');
  const f = b.getAttribute('data-a').replace('compra-', '');
  a.clicar(b);
  await a.esperar();
  assert.strictEqual(a.E(`!!S.compras.comprado[${JSON.stringify(f)}]`), true, 'marcado como comprado');
  a.fechar();
});

test('editar a refeição: a folha nova muda a quantidade, troca o alimento pela busca e cadastra um novo', async () => {
  const a = await noPlano();
  const id = a.E('planoDeComida()[0].id');
  a.v('ctx.editaRefeicao', id);
  await a.esperar(40);
  assert.ok(a.$('#ref-nome'), 'a folha nova');
  assert.ok(!a.$('.ed-campo'), 'e não a antiga');
  a.clicar('[data-a="ed-item-0"]');
  await a.esperar();
  assert.ok(a.$('[data-a="ed-item-troca-0"]'), 'o item abre no lugar');
  a.clicar('[data-a="ed-item-troca-0"]');
  await a.esperar(40);
  const busca = a.$('#seletor-busca');
  busca.value = 'ovo';
  busca.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  const alvo = a.$('[data-a^="seletor-"]:not([data-a="seletor-novo"])');
  assert.ok(alvo, 'a busca acha');
  const novo = alvo.getAttribute('data-a').slice(8);
  alvo.click();
  await a.esperar(40);
  assert.strictEqual(a.E(`planoDeComida()[0].itens[0].f`), novo, 'trocou');

  a.clicar('[data-a="ref-adiciona"]');
  await a.esperar(40);
  a.clicar('[data-a="seletor-novo"]');
  await a.esperar(40);
  const nome = a.$('#alimento-nome');
  nome.value = 'Tapioca da esquina';
  nome.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  const kcal = a.$('#alimento-kcal');
  kcal.value = '240';
  kcal.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="alimento-salva"]');
  await a.esperar(40);
  const itens = a.J('planoDeComida()[0].itens.map(i => i.f)');
  const cat = a.J('catalogoAlimentos()');
  assert.ok(itens.some(f => cat[f] && cat[f].n === 'Tapioca da esquina' && cat[f].kcal === 240), 'cadastrado e posto na refeição, com o nome e as calorias: ' + JSON.stringify(itens));
  a.fechar();
});

test('nova refeição: só cria com nome, e entra no plano', async () => {
  const a = await noPlano();
  const antes = a.E('planoDeComida().length');
  a.v('ctx.novaRefeicao');
  await a.esperar(40);
  assert.ok(a.$('[data-a="ref-cria"]').disabled, 'sem nome, não cria');
  const nome = a.$('#ref-nome');
  nome.value = 'Ceia';
  nome.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="ref-cria"]');
  await a.esperar(40);
  assert.strictEqual(a.E('planoDeComida().length'), antes + 1);
  assert.strictEqual(a.E('planoDeComida()[planoDeComida().length - 1].n'), 'Ceia');
  a.fechar();
});
