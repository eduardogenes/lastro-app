// A aula do box antes de começar: "Na última aula", e a lista de movimentos
// com a referência de cada um. Para comparar com aula.html, estados 3 e 5.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(2026, 9, 17, 9, 5);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`
  const t = new Date(2026, 9, 3, 9, 40).getTime();
  S.logs['wall-balls'] = [{ t: t + 60000, sid: t, u: 'rep', q: 100, sets: [[9, 100]] }];
  S.logs['farmers-carry'] = [{ t: t + 120000, sid: t, u: 'm', q: 200, sets: [[22.5, 95]] }];
  S.logs['sled-push'] = [{ t: t + 180000, sid: t, u: 'm', q: 50, sets: [[100, 64]] }];
  S.done.push({ day: 'HX', t: t, sid: t, dur: 3600000 });
  view.day = 'HX'; CTX.abreModoDeSessao(); render();
`));
await p.waitForTimeout(300);
const el = await p.$('.tr-ultima');
if (el) await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(200);
await p.screenshot({ path: process.argv[3] + '/aula-0.png' });
await p.evaluate(() => window.__escopo(`view.addEx = true; render();`));
await p.waitForTimeout(300);
const al = await p.$('.addlist');
if (al) await al.evaluate(e => e.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(200);
await p.screenshot({ path: process.argv[3] + '/aula-1.png' });
console.log(JSON.stringify({ erros, ultima: !!el, lista: !!al }));
await b.close();
