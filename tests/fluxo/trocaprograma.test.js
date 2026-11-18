// A troca de programa de agosto de 2026, do ponto de vista do aparelho dele:
// seis treinos viram cinco, e meses de carga registrada têm que atravessar
// intactos. É o que esta troca prometeu e o que nenhuma futura pode quebrar.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('backup antigo (plano 2) cai nos ids da época, não no programa de hoje', async () => {
  const t = Date.now() - 30 * DIA;
  // C0 no plano 2 era pendulum squat; hoje o índice 0 do C é uma remada
  const antigo = JSON.stringify({ app:'treino-eduardo', v:1, data:{
    plano: 2, logs: { 'C0': [{ t, sid: t, sets: [[100, 8]] }] }, done: [], carga: {}
  }});
  const a = await app();
  await a.v('importText', antigo);
  await a.esperar();
  assert.ok(a.S().logs["pendulum-squat"], 'histórico foi para o exercício certo da época');
  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'));
  a.fechar();
});

test('o dia aberto não pede promoção nem cobra pendência', async () => {
  // O app existe em parte para FREAR mudança de programa, e isso está certo de
  // segunda a sexta. No sábado vira obstáculo: o que entra no dia É o dia, não
  // uma emenda a ele, e não há conteúdo permanente para aquilo virar.
  const a = await app();
  a.v('go', 'HX');
  await a.esperar();

  assert.ok(a.v('diaAberto', 'HX'), 'sábado é dia aberto');
  assert.ok(!a.v('diaAberto', 'A'), 'e segunda não');

  // nada prescrito, nada pendente — não há o que cobrar no fim
  const p = a.vJ('pendencias', 'HX', 0, []);
  assert.deepStrictEqual(p.nada, [], 'nada prescrito, nada pendente');

  await a.v('addExercicio', 'corrida');
  await a.v('addExercicio', 'sled-push');
  await a.v('addExercicio', 'wall-balls');
  await a.esperar();
  assert.strictEqual(a.vJ('modsDoDia', 'HX').length, 3, 'o que ele adicionou virou mod do dia');

  a.v('toggle', 0);
  a.preencher(0, 0, null, 252);
  await a.esperar();
  await a.v('finalizarSessao');
  await a.esperar(60);

  assert.ok(!!!a.vista().promo,
    'e mesmo com nove mods no dia, nenhuma pergunta de promoção');
  assert.ok(!!!a.S().sessao, 'a sessão encerrou direto');
  a.fechar();
});

test('as estações da prova continuam no catálogo depois de sair da prescrição', async () => {
  // Quem já registrou um sled push precisa que o exercício continue existindo,
  // senão o histórico fica órfão sob uma chave sem dono.
  const a = await app();
  ['sled-push', 'sled-pull', 'wall-balls', 'ski-erg', 'corrida'].forEach(function (k) {
    assert.ok(!!a.dado('CAT')[k], 'sumiu do catálogo: ' + k);
  });
  a.fechar();
});

