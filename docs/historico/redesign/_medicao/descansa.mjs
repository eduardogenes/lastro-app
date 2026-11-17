// Enquanto descansa: a série guardada pela régua, o descanso contando, e os
// três atalhos no cartão aberto. Para comparar com momento-1.html, estado 2.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); toggle(0); render();`));
await p.waitForTimeout(300);
await p.evaluate(() => window.__escopo(`anotaSerie(0, 0, 0, 40); abreRegua(0, 0); render();`));
await p.waitForTimeout(200);
const v = await p.$$('.regua-v'); if (v.length) await v[1].click();
await p.waitForTimeout(400);
const el = await p.$('.ex-descansa');
if (el) await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(200);
await p.screenshot({ path: process.argv[3] + '/descansa-0.png' });
console.log(JSON.stringify({ erros, chips: await p.$$eval('.ex-descansa .chip', l => l.map(e => e.textContent)) }));
await b.close();
