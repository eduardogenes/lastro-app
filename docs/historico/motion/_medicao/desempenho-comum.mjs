// Peças comuns dos scripts de desempenho do time de motion (docs/motion/04-desempenho.md).
// Não roda sozinho: é importado por desempenho-render.mjs, desempenho-toque.mjs,
// desempenho-movimentos.mjs e desempenho-armadilhas.mjs.
//
// Como rodar qualquer um deles (do raiz do projeto, com o dist/ já construído):
//
//   python3 -m http.server 4724 -d dist &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-<nome>.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//
// No WebKit (Playwright 1.62, WebKit 26.5): `npx playwright-core install webkit` baixa
// o motor, mas nesta máquina (Ubuntu 24.04) faltam quatro bibliotecas do sistema.
// Sem sudo, elas são baixadas e extraídas no cache, sem instalar nada:
//
//   mkdir -p /tmp/wk && cd /tmp/wk && apt-get download libevent-2.1-7t64 libavif16 libgav1-1 libyuv0
//   for f in *.deb; do dpkg-deb -x "$f" x; done
//   mkdir -p ~/.cache/ms-playwright/webkit-deps-noble && cp -a x/usr/lib/x86_64-linux-gnu/* ~/.cache/ms-playwright/webkit-deps-noble/
//
// e o script roda com:
//
//   L=~/.cache/ms-playwright/webkit-deps-noble
//   MOTOR=webkit LD_LIBRARY_PATH=$L \
//   LD_PRELOAD=$L/libgav1.so.1:$L/libyuv.so.0:$L/libevent-2.1.so.7:$L/libavif.so.16 \
//     node docs/motion/_medicao/desempenho-<nome>.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//
// (LD_PRELOAD porque o lançador do MiniBrowser reescreve LD_LIBRARY_PATH.)
//
// CPU lenta: LENTO=4 liga `Emulation.setCPUThrottlingRate` 4× (só Chromium, via CDP).
// É PESSIMISTA para o iPhone 11 Pro Max: o A13 roda JavaScript de página única na
// mesma ordem de grandeza de um núcleo deste i5-13420H, não 4× mais devagar. O 4×
// é o "e se o aparelho estiver quente, com pouca bateria, ou for um telefone mais
// fraco de outro usuário" — o teto, não a expectativa.

import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

export const URL = process.argv[2] || 'http://localhost:4724/';
export const SAIDA = process.argv[3] || 'docs/motion/_medicao/shots/desempenho';
export const MOTOR = process.env.MOTOR === 'webkit' ? 'webkit' : 'chromium';
export const LENTO = Number(process.env.LENTO || 1);
// Quantos dias de histórico o registro semeado tem. 120 = uns quatro meses de uso:
// treino 5×/semana, peso todo dia, comida fechada todo dia, cardio 1×/semana.
export const DIAS = Number(process.env.DIAS || 120);

fs.mkdirSync(SAIDA, { recursive: true });

// O relógio do app fica num instante fixo (quinta, 15/10/2026, 07:10) mas ANDA:
// o cronômetro e as transições precisam de tempo correndo, então é deslocamento,
// não congelamento (os moldes de docs/redesign/_medicao congelam Date.now).
const ALVO = new Date(2026, 9, 15, 7, 10, 0).getTime();

// Instrumentação instalada ANTES do app: tudo o que precisa ver o primeiro toque.
const INSTRUMENTA = `
(function () {
  var off = ${ALVO} - Date.now();
  var real = Date.now.bind(Date);
  Date.now = function () { return real() + off; };

  var M = window.__m = { sets: [], eventos: [], longas: [], desloc: [], loaf: [], mut: 0, toque: null, toques: [] };

  // 1) Quando o registro chega ao disco: toda escrita de 'lastro-v1'.
  var orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    var t0 = performance.now();
    var r = orig.apply(this, arguments);
    if (k === 'lastro-v1') M.sets.push({ t: t0, dur: performance.now() - t0, kb: Math.round(String(v).length / 1024) });
    return r;
  };

  // 2) O toque: do pointerdown até o fim do click e até o quadro seguinte.
  //    'click' na janela, fase de bolha: os handlers do Preact moram nos próprios
  //    elementos, então este roda DEPOIS deles.
  addEventListener('pointerdown', function (e) {
    M.toque = { pd: e.timeStamp, pdAgora: performance.now(), alvo: (e.target && (e.target.getAttribute('data-a') || e.target.className || e.target.tagName)) + '' };
  }, true);
  addEventListener('click', function () {
    if (M.toque) M.toque.clickIni = performance.now();
  }, true);
  addEventListener('click', function () {
    var t = M.toque; if (!t) return;
    t.clickFim = performance.now();
    requestAnimationFrame(function (ts) {
      t.raf = performance.now(); t.rafTs = ts;
      // Um setTimeout depois do rAF cai depois da pintura daquele quadro.
      setTimeout(function () { t.pinta = performance.now(); M.toques.push(t); }, 0);
    });
  }, false);

  // 3) Observadores do motor (Chromium tem todos; WebKit, quase nenhum).
  function obs(tipo, f, extra) {
    try { new PerformanceObserver(function (l) { l.getEntries().forEach(f); })
            .observe(Object.assign({ type: tipo, buffered: true }, extra || {})); return true; }
    catch (e) { return false; }
  }
  M.suporta = {
    event: obs('event', function (e) { M.eventos.push({ n: e.name, t: e.startTime, dur: e.duration, ini: e.processingStart, fim: e.processingEnd }); }, { durationThreshold: 16 }),
    longtask: obs('longtask', function (e) { M.longas.push({ t: e.startTime, dur: e.duration }); }),
    layoutShift: obs('layout-shift', function (e) { M.desloc.push({ t: e.startTime, v: e.value, input: e.hadRecentInput }); }),
    loaf: obs('long-animation-frame', function (e) { M.loaf.push({ t: e.startTime, dur: e.duration, bloqueio: e.blockingDuration, estilo: e.styleAndLayoutStart ? (e.startTime + e.duration - e.styleAndLayoutStart) : null }); })
  };

  // 4) Quadros: intervalos entre rAF enquanto um gravador estiver ligado.
  M.gravaQuadros = function () {
    var q = []; var vivo = true; var ult = null;
    function passo(ts) { if (!vivo) return; if (ult != null) q.push(ts - ult); ult = ts; requestAnimationFrame(passo); }
    requestAnimationFrame(passo);
    return function () { vivo = false; return q; };
  };
})();
`;

export async function abre({ lento = LENTO, dias = DIAS, semear = true } = {}) {
  const tipo = MOTOR === 'webkit' ? webkit : chromium;
  const b = await tipo.launch(MOTOR === 'webkit' ? {} : { executablePath: process.env.CHROME });
  const opc = { viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, hasTouch: true };
  let ctx;
  try { ctx = await b.newContext(Object.assign({ isMobile: true }, opc)); }
  catch (e) { ctx = await b.newContext(opc); }
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  await p.addInitScript(INSTRUMENTA);
  await p.goto(URL);
  await p.waitForFunction(() => typeof window.__escopo === 'function');
  await p.waitForTimeout(400);
  if (semear) {
    await semeia(p, dias);
    await p.reload();
    await p.waitForFunction(() => typeof window.__escopo === 'function');
    await p.waitForTimeout(600);
  }
  let cdp = null;
  if (MOTOR === 'chromium') {
    cdp = await ctx.newCDPSession(p);
    await cdp.send('Performance.enable');
    if (lento > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: lento });
  }
  return { b, ctx, p, cdp, erros };
}

/**
 * Semeia um registro de uso real, pelos verbos do próprio app, e grava.
 * O app reabre em seguida (reload), para a medição pegar o caminho da abertura.
 */
export async function semeia(p, dias) {
  return p.evaluate(n => window.__escopo(`
    (function () {
      const DIA = 86400000, N = ${n};
      const h0 = new Date(Date.now()); h0.setHours(0, 0, 0, 0);
      const R = rot();
      S.logs = {}; S.done = []; S.cardio = []; S.comidaHist = [];
      S.body.peso = []; S.body.cintura = [];
      let k = 0;
      const plano = planoDeComida();
      for (let d = N; d >= 1; d--) {
        const base = h0.getTime() - d * DIA;
        S.body.peso.push({ t: base + 6.5 * 3600e3, v: Math.round((78 - (N - d) * 0.02 + Math.sin(d) * 0.3) * 10) / 10 });
        if (d % 7 === 0) S.body.cintura.push({ t: base + 6.6 * 3600e3, v: Math.round((84 - (N - d) * 0.01) * 10) / 10 });
        const dow = new Date(base).getDay();
        if (dow !== 0 && dow !== 3) {
          const L = R[k++ % R.length]; const P = treino(L);
          const t0 = base + 6.25 * 3600e3;
          if (P) {
            P.ex.forEach(function (ex, i) {
              const sets = [];
              for (let s = 0; s < (ex.s || 3); s++) sets.push([20 + 5 * (i % 6) + Math.floor((N - d) / 14) * 2.5, 10 - (s % 4), 2]);
              (S.logs[ex.id] = S.logs[ex.id] || []).push({ t: t0 + i * 360e3, sid: t0, sets: sets });
            });
            S.done.push({ day: L, t: t0, sid: t0, dur: 3900e3, fim: 'manual' });
          }
        }
        if (dow === 3) S.cardio.push({ t: base + 18 * 3600e3, m: 'bike', min: 30, i: 'moderado', alt: base + 18 * 3600e3 });
        const done = {};
        plano.forEach(function (r, j) { if ((d + j) % 7 !== 0) done[r.id] = base + 3600e3 * (7 + j); });
        fechaDiaDeComida({ data: hojeISO(base), done: done, agua: 6 + (d % 4), escala: {}, cadencia: null, alta: 0 });
      }
      S.dia = null; diaDeComida();
      S.export = Date.now();
      return save().then(function () {
        return { logs: Object.keys(S.logs).length, sessoes: S.done.length, pesos: S.body.peso.length,
                 comida: S.comidaHist.length, kb: Math.round(JSON.stringify(S).length / 1024) };
      });
    })()
  `), dias);
}

export const escopo = (p, codigo) => p.evaluate(c => window.__escopo(c), codigo);

/** Métricas do CDP (contadores acumulados). Devolve a diferença entre duas leituras. */
export async function metricas(cdp) {
  if (!cdp) return null;
  const { metrics } = await cdp.send('Performance.getMetrics');
  const o = {}; metrics.forEach(m => { o[m.name] = m.value; });
  return o;
}
export function diferenca(a, b) {
  if (!a || !b) return null;
  const k = ['LayoutCount', 'RecalcStyleCount', 'LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration', 'Nodes'];
  const o = {};
  k.forEach(n => {
    const v = b[n] - a[n];
    o[n] = /Duration/.test(n) ? Math.round(v * 1000 * 10) / 10 : v; // ms
  });
  return o;
}

export function mediana(xs) {
  const v = xs.filter(x => x != null && isFinite(x)).slice().sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return Math.round((v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2) * 10) / 10;
}
export function maximo(xs) {
  const v = xs.filter(x => x != null && isFinite(x));
  return v.length ? Math.round(Math.max.apply(null, v) * 10) / 10 : null;
}

export function grava(nome, dado) {
  const arq = path.join(SAIDA, nome + '-' + MOTOR + (LENTO > 1 ? '-lento' + LENTO : '') + '.json');
  fs.writeFileSync(arq, JSON.stringify(dado, null, 2));
  return arq;
}
