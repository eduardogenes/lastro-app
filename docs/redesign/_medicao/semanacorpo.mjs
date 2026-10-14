// O Corpo numa sexta à noite com uma pesagem só na semana: a semana sem média,
// o que falta e os dias. Para comparar com corpo.html, estado 9.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(2026, 9, 2, 21, 32);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`
  const DIA = 86400000, seg = new Date(2026, 8, 28, 6, 40).getTime();
  S.body.peso = [];
  for (let i = 1; i <= 11; i++) S.body.peso.push({ t: seg - 1 * DIA - i * 2.5 * DIA, v: 73 - i * 0.1, m: 1 });
  S.body.peso.push({ t: seg, v: 73.6, m: 1 });
  S.body.peso.sort(function (a, b) { return a.t - b.t; });
  CTX.vaiPara('corpo'); render();
`));
await p.waitForTimeout(300);
const el = await p.$('.co-semana');
if (el) await el.evaluate(e => e.scrollIntoView({ block: 'start' }));
await p.waitForTimeout(200);
await p.screenshot({ path: process.argv[3] + '/semanacorpo-0.png' });
console.log(JSON.stringify({ erros, tem: !!el }));
await b.close();
