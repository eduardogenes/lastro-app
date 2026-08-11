// A fusão, de ponta a ponta: um estado antigo abre migrado e íntegro.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

test('estado migra para o plano 4 e a nutrição nasce semeada', async () => {
  const a = await app();
  assert.deepStrictEqual(a.erros, []);
  assert.strictEqual(a.E('S.plano'), 4);
  assert.strictEqual(a.E('S.comida.plano.length'), 6, 'plano nutricional semeado');
  assert.strictEqual(a.J('S.cadencia').length, 7, 'cadência da semana nasce com 7 posições');
  assert.strictEqual(a.E('S.ajuste'), 0);
  assert.strictEqual(a.E('S.perfManual'), null, 'o app calcula a força até ele dizer o contrário');
  assert.ok(a.$$('.ex').length > 0, 'a tela de treino continua montando');
  a.fechar();
});

test('o backup leva a metade de comida e devolve ela igual', async () => {
  // Sem isto, trocar de celular perderia o plano nutricional, a cadência e o
  // ajuste em vigor — e a importação é whitelist, então campo novo só passa se
  // alguém lembrar de listar. Este teste é o "alguém lembrar".
  const a = await app();
  a.E('S.ajuste = 1');
  a.E('S.perfManual = false');
  a.E('S.cadencia = ["treino","treino","descanso","treino","treino","descanso","treino"]');
  a.E('S.comida.plano[0].itens[0].q = 321');
  a.E('S.compras.dias = 30');

  a.E('tab("ajustes")');
  a.E('showJSON()');
  const json = a.doc.getElementById('jout').value;
  const bkp = JSON.parse(json);
  assert.strictEqual(bkp.data.ajuste, 1);
  assert.strictEqual(bkp.data.perfManual, false);
  assert.strictEqual(bkp.data.cadencia[2], 'descanso');
  assert.strictEqual(bkp.data.comida.plano[0].itens[0].q, 321);
  a.fechar();

  const b = await app({ estado: bkp.data });
  assert.strictEqual(b.E('S.ajuste'), 1, 'o ajuste sobreviveu à volta');
  assert.strictEqual(b.E('S.perfManual'), false);
  assert.strictEqual(b.J('S.cadencia')[2], 'descanso');
  assert.strictEqual(b.E('S.comida.plano[0].itens[0].q'), 321, 'o plano editado voltou igual');
  assert.strictEqual(b.E('S.compras.dias'), 30);
  b.fechar();
});

test('backup antigo, sem a metade de comida, abre semeado em vez de vazio', async () => {
  const a = await app({ estado: {
    plano: 3, logs: {}, done: [], prog: null, rot: null, ex: {}
  } });
  assert.strictEqual(a.E('S.comida.plano.length'), 6, 'a nutrição nasce da prescrição');
  assert.strictEqual(a.J('S.cadencia').length, 7);
  assert.strictEqual(a.E('S.ajuste'), 0, 'sem ajuste herdado de lugar nenhum');
  a.fechar();
});
