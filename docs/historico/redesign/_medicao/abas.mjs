// As cinco abas, com algum dado: duas sessões, dois pesos. Página inteira.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(12, 10, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`
  const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
  const t = function (k) { return base.getTime() - k*DIA; };
  S.done = [{ day:'A', t:t(3), sid:t(3), dur:4000000, fim:'manual' }, { day:'B', t:t(2), sid:t(2), dur:4000000, fim:'auto' }];
  S.body.peso = [{ t: t(9), v: 74.1 }, { t: t(8), v: 74.0 }, { t: t(2), v: 73.8 }, { t: t(1), v: 73.6 }];
  render();
`));
for (const aba of (process.argv[4] || 'agora,dias,corpo,semana,prescricao').split(',')) {
  await p.evaluate(a => window.__escopo(`CTX.vaiPara('${a}'); render();`), aba);
  await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[3] + '/aba-' + aba + '.png', fullPage: true });
}
console.log(JSON.stringify({ erros }));
await b.close();
