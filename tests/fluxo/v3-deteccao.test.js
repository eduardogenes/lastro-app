// A detecção do corpo na câmera do visual novo (direção 3, Fase 1;
// docs/redesign-3/02-captura.md), com o motor trocado por um dublê
// (`globalThis.__lastroPose`) que devolve os pontos que o teste quiser.
// O que se cobra: altura e distância acendem sozinhas, a frase diz para onde
// mexer, a foto guarda que a detecção estava ativa e sai alinhada, a queda do
// motor devolve o caminho das linhas, e sozinho o app espera a pessoa parada.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { cacheFalso, cameraFalsa } from './dubles.js';

/** Instala o dublê: 33 pontos de um corpo com topo, base e meio em `globalThis.__corpo`. */
function motorFalso(a, { falha = false } = {}) {
  a.E(`
    globalThis.__corpo = { topo: 0.04, base: 0.96, meio: 0.5 };
    globalThis.__lastroPose = { detecta: function () {
      if (${falha}) throw new Error('sem WebGL');
      const c = globalThis.__corpo, h = c.base - c.topo, u = h * 0.035, m = c.meio;
      const pts = []; for (let i = 0; i < 33; i++) pts.push({ x: m, y: c.topo + h / 2, visibility: 0.95 });
      const p = function (i, x, y) { pts[i] = { x: x, y: y, visibility: 0.95 }; };
      const olho = c.topo + 1.8 * u, boca = olho + u;
      [1, 2, 3, 4, 5, 6].forEach(function (i) { p(i, m, olho); });
      p(9, m, boca); p(10, m, boca);
      p(11, m - 0.1, c.topo + 0.18 * h); p(12, m + 0.1, c.topo + 0.18 * h);
      p(23, m - 0.06, c.topo + 0.5 * h); p(24, m + 0.06, c.topo + 0.5 * h);
      [27, 28].forEach(function (i) { p(i, m, c.base - 0.02 * h); });
      [29, 30, 31, 32].forEach(function (i) { p(i, m, c.base); });
      return pts;
    } };`);
}

async function camera(opcoes = {}) {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  cacheFalso(a);
  cameraFalsa(a);
  motorFalso(a, opcoes);
  if (opcoes.antes) opcoes.antes(a);
  a.v('ctx.abreProtocolo');
  await a.esperar();
  if (opcoes.sozinho) { a.clicar('[data-a="quem-sozinho"]'); await a.esperar(); }
  a.clicar('[data-a="sessao-camera"]');
  await a.esperar(400);
  return a;
}
const v3 = a => a.vJ('ctx.cameraV3');
const foto = a => { const s = a.S().protocolo.sessoes[0]; return s && s.fotos['frente-relaxado']; };

test('com a detecção ativa, altura e distância acendem sozinhas e não se tocam', async () => {
  const a = await camera();
  const x = v3(a);
  assert.strictEqual(x.deteccao, 'ativa');
  assert.deepStrictEqual([x.luzes.altura, x.luzes.distancia], [true, true]);
  assert.deepStrictEqual([x.luzes.medida.altura, x.luzes.medida.distancia], [true, true]);
  assert.deepStrictEqual(x.apagadas, ['nivel'], 'sem sensor, só o nível espera quem confere');
  a.clicar('[data-a="luz-altura"]');
  await a.esperar();
  assert.strictEqual(v3(a).luzes.medida.altura, true, 'tocar na luz medida não muda nada');

  a.clicar('[data-a="luz-nivel"]');
  await a.esperar();
  a.clicar('[data-a="cam-ajustado"]');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  const f = foto(a);
  assert.strictEqual(f.cap.det.ativa, true, 'a foto guarda que a detecção estava ativa');
  assert.ok(f.cap.det.qps > 0, 'e a quantos quadros por segundo');
  assert.strictEqual(f.cap.fora, undefined);
  assert.strictEqual(f.enq, undefined, 'nas linhas já, nada a alinhar');
  assert.strictEqual(f.sug, undefined, 'nem a sugerir');
  a.fechar();
});

test('corpo pequeno no quadro: a frase manda chegar a cadeira, e a foto tirada assim sai com o alinhamento sugerido, não aplicado', async () => {
  const a = await camera();
  a.E('globalThis.__corpo = { topo: 0.12, base: 0.86, meio: 0.47 }');
  await a.esperar(250);
  assert.strictEqual(v3(a).luzes.distancia, false);
  a.clicar('[data-a="luz-nivel"]');
  await a.esperar();
  assert.ok(/Chegue a cadeira para a frente/.test(a.texto('.v3-cam-aviso')), a.texto('.v3-cam-aviso'));

  a.v('ctx.tiraMesmoAssim');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  const f = foto(a);
  assert.ok(f.cap.fora.indexOf('distancia') >= 0, 'fora do padrão na distância');
  assert.strictEqual(f.enq, undefined, 'o app não aplica sozinho: o dono aceita (17/11/2026)');
  assert.strictEqual(f.sug.auto, 1, 'a sugestão fica guardada');
  assert.ok(f.sug.z > 1.2, 'aproximando: ' + f.sug.z);
  a.fechar();
});

test('o motor falhou: a câmera volta às linhas conferidas a olho, e a foto diz', async () => {
  const a = await camera({ falha: true });
  const x = v3(a);
  assert.strictEqual(x.deteccao, 'reserva');
  assert.strictEqual(x.luzes.medida.altura, false);
  assert.ok(a.$('[data-a="cam-reserva"]'), 'a tela diz que a detecção não está disponível');
  for (const k of ['nivel', 'altura', 'distancia']) a.clicar(`[data-a="luz-${k}"]`);
  await a.esperar();
  a.clicar('[data-a="cam-ajustado"]');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  assert.deepStrictEqual(foto(a).cap.det, { ativa: false, qps: 0 });
  a.fechar();
});

test('sozinho: o toque pede só o nível, e a contagem de cinco espera a pessoa parada na marca', async () => {
  const a = await camera({ sozinho: true });
  // a pessoa ainda ao lado do celular, fora do quadro
  a.E('globalThis.__corpo = { topo: 0.3, base: 1.2, meio: 0.5 }');
  await a.esperar(150);
  a.clicar('[data-a="luz-nivel"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="cam-disparo"]').disabled, false, 'o toque não exige ver a pessoa');
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(300);
  assert.strictEqual(v3(a).esperando, true, 'espera');
  assert.strictEqual(a.vista().camera.contagem, null, 'sem contagem com a pessoa fora da marca');

  a.E('globalThis.__corpo = { topo: 0.04, base: 0.96, meio: 0.5 }');
  await a.esperar(1400);
  assert.ok([5, 4].indexOf(a.vista().camera.contagem) >= 0, 'parada na marca, conta cinco: ' + a.vista().camera.contagem);
  a.fechar();
});
