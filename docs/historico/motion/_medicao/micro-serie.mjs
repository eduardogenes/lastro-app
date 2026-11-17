// Micro-interações · uma série do começo ao fim, como ela é hoje (o "antes"):
// a régua aberta, o toque, a célula com o número, o descanso que aparece, e a
// última série que leva ao próximo exercício. Mede onde cada coisa está, para
// a proposta saber de onde e para onde algo se move.
//
// Uso: igual ao micro-render.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const OUT = process.argv[3];
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);
await ev(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const DD = nextDay(); const P = treino(DD); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:DD, t:t, sid:t, dur:3600000, fim:'manual' }];
  diaDeComida().cadencia = 'treino';
  CTX.abreTreinoDeHoje(); toggle(0); render();
`);
await p.waitForTimeout(300);
const caixa = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : 'invisível'; }, sel);
// carga da série 1 pela coluna "anterior" não: pelo teclado, como ele faz
await ev(`abreTecladoDeCarga(0, 0);`); await p.waitForTimeout(80);
await p.screenshot({ path: OUT + '/serie-0-teclado.png' });
await p.click('[data-a="tcl-4"]'); await p.click('[data-a="tcl-0"]'); await p.click('[data-a="tcl-pronto"]');
await p.waitForTimeout(80);
await p.click('#r0_0'); await p.waitForTimeout(80);
const alvo = await p.evaluate(() => document.querySelectorAll('.regua-v')[2].dataset.a);
const antes = { alvo, celula: await caixa('#r0_0'), valor9: await caixa('[data-a="' + alvo + '"]'), regua: await caixa('.regua') };
await p.screenshot({ path: OUT + '/serie-1-regua.png' });
await p.click('[data-a="' + alvo + '"]');
await p.waitForTimeout(80);
const depois = {
  celula: await caixa('#r0_0'), timer: await caixa('#timer'), toast: await caixa('#toast'),
  sobOdedo: await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.className) + ' · ' + e.textContent.trim().slice(0, 30) : null; }, { x: antes.valor9[0] + antes.valor9[2] / 2, y: antes.valor9[1] + antes.valor9[3] / 2 }),
  anunciado: await p.evaluate(() => document.querySelector('#serie-dita').textContent),
  vaoEmbaixoDoTimer: await p.evaluate(() => { const t = document.querySelector('#timer').getBoundingClientRect(); return Math.round(innerHeight - t.bottom); }),
  tabbarNoModo: await p.evaluate(() => getComputedStyle(document.querySelector('#timer')).bottom),
  tabbarNoApp: await p.evaluate(() => getComputedStyle(document.querySelector('#app')).getPropertyValue('--ins-tabbar'))
};
await p.screenshot({ path: OUT + '/serie-2-guardada.png' });
// a última série do exercício: preenche as outras e toca a última
const n = await ev(`setsFor(treino(view.day).ex[0])`);
for (let k = 1; k < n - 1; k++) await ev(`anotaSerie(0, ${k}, 0, 40); anotaSerie(0, ${k}, 1, 9); render();`);
await ev(`anotaSerie(0, ${n - 1}, 0, 40); abreRegua(0, ${n - 1});`); await p.waitForTimeout(80);
const yAntesUltima = await p.evaluate(() => scrollY);
await p.click('.regua-v >> nth=2'); await p.waitForTimeout(120);
const ultima = { aberto: await ev(`view.open`), rolou: (await p.evaluate(() => scrollY)) - yAntesUltima,
                 cartao0: await p.evaluate(() => document.querySelector('[data-ex="0"]').className),
                 selo: await p.evaluate(() => [...document.querySelectorAll('[data-ex="0"] .tag')].map(e => e.textContent)) };
await p.screenshot({ path: OUT + '/serie-3-ultima-avanca.png' });
console.log(JSON.stringify({ erros, antes, depois, ultima }, null, 1));
await b.close();
