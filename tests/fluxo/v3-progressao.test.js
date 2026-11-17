// A progressão e um exercício no visual novo (direção 3, Fase 3): os
// exercícios de um treino em "prontos para subir", "ganhando repetição" e
// "parados", e a tela de um exercício com o próximo passo e sessão a sessão.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

/** Três exercícios do treino A: um no topo, um parado, um ganhando repetição. */
async function comHistorico() {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.E(`(function () {
    const P = treino('A'), agora = Date.now();
    const topo = function (i) { return parseInt(String(P.ex[i].r).split(/[–-]/)[1], 10); };
    const series = function (i, r) { const s = []; for (let k = 0; k < P.ex[i].s; k++) s.push([40, r]); return s; };
    S.logs[logKey('A', 0)] = [{ t: agora - 14 * ${DIA}, sid: 1, sets: series(0, topo(0) - 2) }, { t: agora - 7 * ${DIA}, sid: 2, sets: series(0, topo(0)) }];
    S.logs[logKey('A', 1)] = [1, 2, 3].map(function (n) { return { t: agora - (4 - n) * 7 * ${DIA}, sid: n, sets: series(1, topo(1) - 2) }; });
    const r2 = series(2, topo(2)); r2[1] = [40, topo(2) - 3];
    S.logs[logKey('A', 2)] = [{ t: agora - 7 * ${DIA}, sid: 2, sets: r2 }];
  })()`);
  a.E('CTX.alternaVisual()');
  await a.esperar();
  return a;
}

test('a progressão agrupa os exercícios pela regra do treinador', async () => {
  const a = await comHistorico();
  a.v('ctx.abreProgressao', 'A');
  await a.esperar();
  const p = a.vJ('ctx.progressaoV3');
  assert.deepStrictEqual(p.grupos.subir.map(x => x.i), [0]);
  assert.deepStrictEqual(p.grupos.parado.map(x => x.i), [1]);
  assert.deepStrictEqual(p.grupos.rep.map(x => x.i), [2]);
  assert.ok(a.texto('.v3-sec').includes('Prontos para subir'));
  a.fechar();
});

test('um exercício: o próximo passo diz para quanto subir, e sessão a sessão destaca o topo', async () => {
  const a = await comHistorico();
  a.v('ctx.abreProgressao', 'A');
  await a.esperar();
  a.clicar('[data-a="prog-ex-0"]');
  await a.esperar();
  assert.ok(/Na próxima, suba para/.test(a.texto('[data-a="ex-passo"]')), a.texto('[data-a="ex-passo"]'));
  assert.strictEqual(a.$$('.v3-sess').length, 2, 'as duas sessões');
  assert.ok(a.$$('.v3-sess:first-child i.t').length > 0, 'a última com as séries no topo em destaque');
  a.v('ctx.fechaHist');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Progressão', 'voltar devolve a progressão');

  a.clicar('[data-a="prog-ex-2"]');
  await a.esperar();
  assert.ok(/Série 2: mais 3/.test(a.texto('[data-a="ex-passo"]')), 'quanto falta em cada série: ' + a.texto('[data-a="ex-passo"]'));
  // sem a sessão em `S.done`, a linha não tem para onde abrir, e fica só leitura
  assert.ok(!a.$('[data-a="ex-sessao"]'));
  a.fechar();
});
