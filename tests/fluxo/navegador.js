// Sobe o app num NAVEGADOR DE VERDADE, para o que o jsdom não tem: layout,
// rolagem e animação.
//
// O harness de sempre (`harness.js`) monta o build num jsdom, e o jsdom não
// desenha: toda caixa mede zero, nada rola, nenhuma animação roda. Isso basta
// para quase tudo o que a suíte cobra — dado, ordem dos toques, o que a tela
// diz —, e não basta para "a linha da série fica onde estava, ±2 px" nem para
// "o número pousa em 160 ms e um render() no meio não o reinicia". Esses casos
// sobem o mesmo `dist/` num Chromium (o do cache do Playwright, que o time de
// motion já usa para medir: `playwright-core` é dependência de desenvolvimento)
// e tocam com o dedo emulado.
//
// O build é servido por um servidor HTTP deste processo, numa porta que o
// sistema escolhe. As fontes do Google ficam de fora (o teste não depende de
// rede, e o que se mede é posição relativa, que não depende da fonte), e o
// service worker também.
//
// `LASTRO_MOTOR=webkit` roda os mesmos casos no WebKit do Playwright, com as
// quatro bibliotecas que faltam nesta máquina (receita no topo de
// docs/motion/_medicao/desempenho-comum.mjs). Fica fora do `npx vitest run`
// porque depende delas.

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright-core';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(RAIZ, 'dist');
const CACHE = path.join(os.homedir(), '.cache', 'ms-playwright');
export const MOTOR = process.env.LASTRO_MOTOR === 'webkit' ? 'webkit' : 'chromium';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

/** O Chromium do cache do Playwright: `CHROME`, ou o mais novo que houver lá. */
function chrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const dirs = fs.existsSync(CACHE)
    ? fs.readdirSync(CACHE).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => Number(b.slice(9)) - Number(a.slice(9)))
    : [];
  for (const d of dirs) {
    const exe = path.join(CACHE, d, 'chrome-linux64', 'chrome');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Não achei o Chromium do Playwright em ' + CACHE + '. Instale com ' +
    '`npx playwright-core install chromium`, ou aponte CHROME para um executável.');
}

function opcoesDoMotor() {
  if (MOTOR === 'chromium') return { executablePath: chrome() };
  const L = path.join(CACHE, 'webkit-deps-noble');
  return { env: Object.assign({}, process.env, {
    LD_LIBRARY_PATH: L,
    LD_PRELOAD: ['libgav1.so.1', 'libyuv.so.0', 'libevent-2.1.so.7', 'libavif.so.16'].map(f => path.join(L, f)).join(':')
  }) };
}

/** Serve `dist/` numa porta livre. */
function serve() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html não existe. Rode `npm run build` antes dos testes.');
  }
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const arq = path.join(DIST, rel);
    if (!arq.startsWith(DIST) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
    fs.createReadStream(arq).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

/**
 * Abre o navegador e o app. `reduz` liga "Reduzir movimento".
 *
 * O relógio do app fica numa quinta-feira, 15/10/2026, às 7h10 — e ANDA:
 * animação e cronômetro precisam de tempo correndo, então é deslocamento, não
 * congelamento.
 */
// Um navegador e um servidor por arquivo de teste, e um contexto limpo por caso:
// abrir o motor é o que custa, e a suíte inteira roda em paralelo com ele.
let motor = null;
function sobe() {
  if (!motor) motor = Promise.all([serve(), (MOTOR === 'webkit' ? webkit : chromium).launch(opcoesDoMotor())]);
  return motor;
}
/** Fecha o navegador e o servidor do arquivo (no `afterAll`). */
export async function fechaNavegador() {
  if (!motor) return;
  const [srv, b] = await motor;
  motor = null;
  await b.close();
  await new Promise(r => srv.close(r));
}

export async function abreNavegador({ reduz = false } = {}) {
  const [srv, b] = await sobe();
  const ctx = await b.newContext({
    viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, hasTouch: true,
    isMobile: MOTOR === 'chromium', reducedMotion: reduz ? 'reduce' : 'no-preference',
    serviceWorkers: 'block'
  });
  await ctx.route(/^https?:\/\/fonts\./, r => r.abort());
  const alvo = new Date(2026, 9, 15, 7, 10, 0).getTime();
  await ctx.addInitScript(`(function () {
    var real = Date.now.bind(Date), off = ${alvo} - real();
    Date.now = function () { return real() + off; };
  })();`);
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  await p.goto('http://127.0.0.1:' + srv.address().port + '/');
  await p.waitForFunction(() => !!(window.__escopo && document.querySelector('.ins-tabbar, .ins-modo')));

  const nav = {
    p, erros,
    /** avalia dentro do escopo do app, como o `a.E` do harness */
    E: codigo => p.evaluate(c => window.__escopo(c), codigo),
    espera: ms => p.waitForTimeout(ms),
    /**
     * O treino de hoje no modo de sessão, com a semana passada inteira no
     * histórico (há coluna ANTERIOR em toda série) e, se `sessao`, uma sessão
     * aberta há dez minutos. Devolve o dia.
     */
    treinoDeHoje: async ({ sessao = false } = {}) => {
      const dia = await nav.E(`(function () {
        const DIA = 86400000, t = Date.now() - 7 * DIA;
        const DD = nextDay(), P = treino(DD);
        S.logs = {}; S.sessao = null; S.draft = null;
        P.ex.forEach(function (ex, i) {
          const sets = [];
          for (let k = 0; k < ex.s; k++) sets.push([40 + 5 * i, 9 - k, 1]);
          S.logs[ex.id] = [{ t: t + i * 600000, sid: t, sets: sets }];
        });
        S.done = [{ day: DD, t: t, sid: t, dur: 3600000, fim: 'manual' }];
        ${sessao ? `const ag = Date.now() - 600000;
        S.sessao = { day: DD, inicio: ag, ultima: ag, sid: ag, manual: 1, pausas: [], pulados: [] };
        S.done.push({ day: DD, t: ag, sid: ag, ini: 'manual' });` : ''}
        diaDeComida().cadencia = 'treino';
        view.day = DD; view.open = null; view.regua = null; view.rir = null; view.teclado = null;
        CTX.abreModoDeSessao();
        render();
        window.scrollTo(0, 0);
        return view.day;
      })()`);
      await nav.espera(150);
      return dia;
    },
    /** a caixa do `n`-ésimo elemento que casa `sel`, ou null se não está desenhado */
    caixa: (sel, n = 0) => p.evaluate(([s, n]) => {
      const e = document.querySelectorAll(s)[n];
      if (!e || !e.getClientRects().length) return null;
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
    }, [sel, n]),
    /** o topo da linha da série `k` do exercício `i` */
    topoDaLinha: (i, k) => p.evaluate(([i, k]) => {
      const c = document.querySelector('[data-ex="' + i + '"]');
      const l = c && c.querySelectorAll('.setrow')[k];
      return l && l.getClientRects().length ? l.getBoundingClientRect().top : null;
    }, [i, k]),
    /**
     * O que está sob o dedo no ponto (x, y): o controle (botão, rótulo, o topo
     * do cartão) que um segundo toque ali acionaria, ou o nó de texto.
     */
    sobODedo: (x, y) => p.evaluate(([x, y]) => {
      const e = document.elementFromPoint(x, y);
      if (!e) return null;
      const c = e.closest('button, label, [role="button"], .ex-top, input, select, textarea');
      const desc = n => n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
        (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '') +
        (n.dataset && n.dataset.a ? '[' + n.dataset.a + ']' : '');
      return { controle: c ? desc(c) : null, no: desc(e), texto: (e.textContent || '').trim().slice(0, 40) };
    }, [x, y]),
    /** o dedo: toque de verdade no centro da caixa */
    toca: async (x, y) => { await p.touchscreen.tap(x, y); },
    fecha: async () => { await ctx.close(); }
  };
  return nav;
}
