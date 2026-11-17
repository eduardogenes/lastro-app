// Ajustes, estados e primeira vez no visual novo (direção 3, Fase 4).

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

async function comVisual(estado) {
  const a = await app({ aba: 'agora', agora: agoraEstavel(15), estado: estado || { logs: {}, done: [] } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  return a;
}

test('primeira vez: o aparelho vazio começa pelo que já está aqui, e "começar assim" leva ao Hoje', async () => {
  const a = await comVisual();
  assert.ok(a.$('[data-a="primeira-comeca"]'), 'a primeira vez');
  assert.ok(a.$('[data-a="primeira-treinador"]') && a.$('[data-a="primeira-importa"]'), 'trazer o seu');
  a.clicar('[data-a="primeira-comeca"]');
  await a.esperar();
  assert.ok(a.$('.v3-ld'), 'o Hoje, com a linha do dia');
  a.fechar();
});

test('ajustes: a conta, o que aparece e o interruptor do visual', async () => {
  const a = await comVisual();
  a.v('ctx.abreAjustes');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Ajustes');
  assert.ok(a.$('#nuvem-email') && a.$('#nuvem-senha'), 'entrar na conta');
  a.clicar('[data-a="ajustes-entrar"]');
  await a.esperar();
  assert.ok(/e-mail e senha/.test(a.texto('.v3-erro')), 'sem preencher, diz o que falta');
  a.clicar('[data-a="ajustes-cardio"]');
  await a.esperar();
  assert.strictEqual(a.E(`ligado(S.modulos, 'cardio')`), false, 'desligou o cardio');
  a.clicar('[data-a="visual-novo"]');
  await a.esperar();
  assert.strictEqual(a.E('visualNovo()'), false, 'voltou ao visual antigo');
  a.fechar();
});

test('estados: a gravação que falhou vira a faixa fixa, e sem rede avisa sem bloquear', async () => {
  const a = await comVisual();
  a.v('ctx.comecaAqui');
  a.E(`view.naoGuardado = { motivo: 'recusa', oQue: 'a série 2', valor: null, salvo: '' }; render();`);
  await a.esperar();
  assert.ok(/Não guardado neste aparelho · a série 2/.test(a.texto('.v3-estados')), a.texto('.v3-estados'));
  assert.ok(!a.$('.ng-faixa'), 'e não a faixa antiga');
  a.E(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); window.dispatchEvent(new Event('offline'));`);
  await a.esperar();
  assert.ok(/Sem rede/.test(a.texto('.v3-estados')));
  a.fechar();
});
