// Uso depois do build: node docs/design-system/conferir-app.mjs chromium|webkit [pasta-de-fotos] [reduz]
// O par do conferir.mjs para o APP: sobe o dist/ a 414x896 (dpr 2, toque), com a fixture do plano 11
// e quatro semanas de treino geradas, percorre os estados do dia a dia e lista, por estado: erro de página,
// rolagem lateral (da página e de qualquer caixa que role de lado, menos a régua), alvo < 44, letra < 12,
// campo < 16, backdrop-filter, e o retângulo do botão principal nos passos do treino (tem de ser um só).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import http from 'node:http';
import { fileURLToPath } from 'node:url';
import pw from '../../node_modules/playwright-core/index.js';
const [, , motor = 'chromium', fotos, reduz] = process.argv;
const RAIZ = fileURLToPath(new URL('../../', import.meta.url)); const DIST = path.join(RAIZ, 'dist');
if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('Rode npm run build antes.');
if (fotos) fs.mkdirSync(fotos, { recursive: true });
const CACHE = path.join(os.homedir(), '.cache/ms-playwright'); const L = path.join(CACHE, 'webkit-deps-noble');
const op = motor === 'chromium' ? { executablePath: process.env.LASTRO_NAVEGADOR || path.join(CACHE, 'chromium-1254/chrome-linux64/chrome') }
  : fs.existsSync(L) ? { env: { ...process.env, LD_LIBRARY_PATH: L, LD_PRELOAD: ['libgav1.so.1', 'libyuv.so.0', 'libevent-2.1.so.7', 'libavif.so.16'].map(f => path.join(L, f)).join(':') } } : {};
const TIPO = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { const a = path.join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html');
  if (!a.startsWith(DIST) || !fs.existsSync(a) || fs.statSync(a).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TIPO[path.extname(a)] || 'application/octet-stream' }); fs.createReadStream(a).pipe(r); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URL_APP = 'http://127.0.0.1:' + srv.address().port + '/';

// O dado: a fixture do plano 11 (gerada pelo app) e, por cima, quatro semanas de treino A-E e pesagens.
const DIA = 864e5, hoje = new Date(2026, 9, 8);
function estado(mut) {
  const S = JSON.parse(fs.readFileSync(path.join(RAIZ, 'tests/dominio/fixtures/estado-plano-11.json'), 'utf8')); let i = 0;
  for (let t = new Date(hoje - 28 * DIA).setHours(6, 10, 0, 0); t < hoje.getTime(); t += DIA) {
    if (new Date(t).getDay() === 0) continue; const day = 'ABCDE'[i++ % 5], sem = Math.floor((t - hoje + 28 * DIA) / (7 * DIA));
    S.done.push({ day, t, sid: t, dur: 58 * 60000, fim: 'manual', hora: 1 });
    S.prog[day].ex.forEach((e, k) => (S.logs[e.id] ||= []).push({ t, sid: t, sets: Array.from({ length: e.s || 3 }, (_, j) => [20 + k * 7.5 + sem * 2.5, 10 - j]) }));
  }
  if (mut) mut(S); return S;
}
const as = (h, m) => new Date(2026, 9, 8, h, m).getTime();
const marca = ids => S => { S.dia.done = Object.fromEntries(ids.map(k => [k, as(6, 0)])); };

const VARRE = () => {
  const peq = [], miudo = [], campo = [], bd = [], lado = [];
  document.querySelectorAll('button, a[href], input, select, textarea, [role=slider], [role=radio], [role=switch], [role=checkbox]').forEach(el => {
    const q = el.getBoundingClientRect(), cs = getComputedStyle(el); if (!q.width || el.disabled || cs.visibility === 'hidden' || q.bottom < 0 || q.top > innerHeight || el.matches('input[type=range]')) return;
    if (q.width < 43.5 || q.height < 43.5) peq.push(((el.getAttribute('aria-label') || el.textContent) + '').trim().slice(0, 30) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height));
    if (el.matches('input:not([type=checkbox]):not([type=radio]), textarea, select') && parseFloat(cs.fontSize) < 16) campo.push(cs.fontSize);
  });
  document.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el);
    if ((cs.backdropFilter || 'none') !== 'none' || (cs.webkitBackdropFilter || 'none') !== 'none') bd.push(String(el.className));
    if (/auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && !el.closest('[role=slider], .v3-regua, [class*="regua"]')) lado.push(String(el.className).slice(0, 30) + ' ' + el.clientWidth + '<' + el.scrollWidth);
    if (!el.closest('svg') && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 11.5) miudo.push(el.textContent.trim().slice(0, 20) + ' ' + cs.fontSize); });
  if (document.documentElement.scrollWidth > innerWidth) lado.unshift('página ' + document.documentElement.scrollWidth);
  return { lado, peq: [...new Set(peq)], miudo: [...new Set(miudo)].slice(0, 6), campo, bd: [...new Set(bd)] };
};
const PRINCIPAL = () => { const e = document.querySelector('[data-a="serie-feita"], [data-a="desc-pula"], [data-a="fim-encerra"], [data-a="fim-fecha"], .v3-acao .v3-btn.p.g'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].join(','); };

const tap = async (p, sel, ms = 700) => { await p.locator(sel).first().tap(); await p.waitForTimeout(ms); };
const lugar = i => async p => { await p.locator('.v3-doca button').nth(i).tap(); await p.waitForTimeout(800); };
const CASOS = [
  ['hoje--treino', [6, 5], marca([]), []],
  ['hoje--refeicao', [12, 10], marca(['pre', 'treino', 'pos']), []],
  ['hoje--noite', [21, 0], marca(['pre', 'treino', 'pos', 'almoco']), []],
  ['hoje--livre', [15, 0], marca(['pre', 'treino', 'pos', 'almoco']), []],
  ['hoje--sem-comida', [6, 5], S => { marca([])(S); S.modulos = { comida: 0 }; }, []],
  ['f-registrar', [10, 20], null, [p => tap(p, '.v3-doca-m')]],
  ['f-aparece', [10, 20], null, [p => tap(p, '[data-a="hoje-aparece"]')]],
  ['f-refeicao', [12, 10], marca(['pre', 'treino', 'pos']), [p => tap(p, '[data-a="hoje-ver"]')]],
  ['dias', [10, 20], null, [lugar(1)]], ['corpo', [10, 20], null, [lugar(2)]], ['semana', [10, 20], null, [lugar(3)]], ['plano', [10, 20], null, [lugar(4)]],
  ['ajustes', [10, 20], null, [lugar(4), p => tap(p, '[data-a="plano-ajustes"]')]],
];
const b = await pw[motor].launch(op); const achados = []; let ancora = [];
async function abre(hora, mut) {
  const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, hasTouch: true, isMobile: motor === 'chromium', reducedMotion: reduz ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const alvo = as(...hora);
  await ctx.addInitScript(`(function(){var R=Date,real=R.now.bind(R),off=${alvo}-real();function D(...a){if(!(this instanceof D))return new R(real()+off).toString();return a.length?new R(...a):new R(real()+off);}D.prototype=R.prototype;D.now=function(){return real()+off};D.parse=R.parse;D.UTC=R.UTC;window.Date=D;})();`);
  await ctx.addInitScript(`if(!sessionStorage.getItem('s')){localStorage.setItem('lastro-v1',${JSON.stringify(JSON.stringify(estado(mut)))});sessionStorage.setItem('s','1')}`);
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(URL_APP); await p.waitForFunction(() => !!window.__escopo); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  return { ctx, p, erros };
}
const quieto = p => p.evaluate(async () => { await new Promise(requestAnimationFrame); await Promise.allSettled(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished)); });
async function registra(nome, a) {
  await a.p.waitForTimeout(300); await quieto(a.p); const r = await a.p.evaluate(VARRE);
  if (fotos) await a.p.screenshot({ path: path.join(fotos, nome + '.png') });
  const ruins = Object.entries(r).filter(([, v]) => v.length); if (a.erros.length) ruins.push(['erros', a.erros]);
  if (ruins.length) achados.push(nome + ' ' + JSON.stringify(Object.fromEntries(ruins)));
}
for (const [nome, hora, mut, passos] of CASOS) { const a = await abre(hora, mut || marca(['pre', 'treino', 'pos'])); for (const f of passos) await f(a.p); await registra(nome, a); await a.ctx.close(); }
// o treino: série, descanso, série 2, fim, encerrado; o principal não sai do lugar
{ const a = await abre([6, 5], marca([])); await tap(a.p, '[data-a="hoje-comeca"]', 900);
  const passo = async n => { await quieto(a.p); ancora.push([n, await a.p.evaluate(PRINCIPAL)]); await registra(n, a); };
  await passo('serie--normal'); await tap(a.p, '[data-a="serie-feita"]', 900); await passo('descanso'); await tap(a.p, '[data-a="desc-pula"]', 900); await passo('serie--meio');
  for (let i = 0; i < 60 && !(await a.p.locator('[data-a="fim-encerra"]').count()); i++) { const s = (await a.p.locator('[data-a="desc-pula"]').count()) ? 'desc-pula' : 'serie-feita'; await tap(a.p, `[data-a="${s}"]`, 350); }
  await passo('fim-treino--vazio'); await tap(a.p, '[data-a="fim-encerra"]', 1000); await passo('fim-treino--igual'); await a.ctx.close(); }
const u = [...new Set(ancora.map(x => x[1]))];
achados.push((u.length === 1 ? 'âncora ok: treino ' : 'ÂNCORA MOVE: ') + ancora.map(x => x.join('=')).join('  '));
console.log(motor + (reduz ? ' (reduzir movimento)' : ''), 'estados', CASOS.length + 5); console.log(achados.join('\n'));
await b.close(); srv.close();
