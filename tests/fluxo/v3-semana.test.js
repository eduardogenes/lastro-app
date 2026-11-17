// A Semana no visual novo (direção 3, Fase 4): o veredito da comida com o que
// a regra olha, e as séries da semana separando as feitas das que ainda vêm.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

test('as séries da semana somam as feitas e as que ainda vêm, por região', async () => {
  const agora = agoraEstavel(10);
  const a = await app({ aba: 'semana', agora: agora, estado: { logs: {}, done: [] } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  const s = a.vJ('ctx.semanaV3');
  assert.ok(s.veredito && s.veredito.t, 'o veredito');
  assert.ok(a.$('.v3-bloco-t'), 'no bloco do momento');
  assert.ok(s.vemDias.length > 0, 'semana com treino pela frente');
  const total = s.regioes.reduce((n, r) => n + r.vem, 0);
  const esperado = a.E(`(function () { let n = 0; ${JSON.stringify(s.vemDias)}.forEach(function (d) { treino(d).ex.forEach(function (ex) { if (ex.g) n += setsFor(ex); }); }); return n; })()`);
  assert.strictEqual(total, esperado, 'as que ainda vêm são as dos treinos que faltam');
  assert.ok(s.regioes.every(r => r.feitas === 0), 'nada feito ainda');
  const r0 = s.regioes[0].regiao;
  a.clicar(`[data-a="semana-${r0}"]`);
  await a.esperar(40);
  assert.ok(a.$$('.v3-musc').length > 0, 'os músculos da região');
  a.fechar();
});

test('com a adesão faltando, o caminho é responder os dias', async () => {
  const a = await app({ aba: 'semana', agora: agoraEstavel(10), estado: { logs: {}, done: [],
    body: { peso: Array.from({ length: 28 }, (_, i) => ({ t: agoraEstavel(7) - (27 - i) * 86400000, v: 77, m: 1 })), cintura: [] } } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  const p = a.vJ('ctx.semanaV3').veredito.portoes;
  assert.ok(p && p.some(g => g.k === 'adesao' && !g.ok), 'peso parado e nenhum dia respondido: falta a adesão');
  a.clicar('[data-a="semana-responder"]');
  await a.esperar();
  assert.ok(a.vJ('ctx.responderDiasV3'), 'abre a sequência de responder os dias');
  a.fechar();
});

test('a retrospectiva do bloco abre da Semana, na tela nova, e fechar volta', async () => {
  const a = await app({ aba: 'semana', agora: agoraEstavel(10), estado: { logs: {}, done: [] } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  a.clicar('[data-a="semana-retro"]');
  await a.esperar(40);
  assert.strictEqual(a.texto('.v3-cab h1'), 'O bloco');
  assert.ok(!a.$('.tc-res, .retro-fim'), 'e não a antiga');
  assert.ok(a.$('.v3-vazio'), 'sem sessões, diz que ainda é cedo');
  a.clicar('[data-a="retro-fecha"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="semana-retro"]'), 'de volta à Semana');
  a.fechar();
});
