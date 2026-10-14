// O modo de sessão: antes da primeira série, o exercício aberto, e uma série
// guardada pela régua. Para comparar com momento-1.html, estados 1, 2 e 7.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const P = treino('A'); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:'A', t:t, sid:t, dur:3600000, fim:'manual' }, { day:'HX', t:t+5*DIA, sid:t+5*DIA, dur:3600000, fim:'manual' }];
  CTX.vaiPara('agora'); render();
`));
await p.waitForTimeout(300);
await p.evaluate(() => window.__escopo(`CTX.abreTreinoDeHoje(); render();`));
await p.waitForTimeout(400);
await p.screenshot({ path: process.argv[3] + '/modo-0.png' });
await p.evaluate(() => window.__escopo(`toggle(0); render();`));
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/modo-1.png' });
const r = await p.$$('.regua-v');
if (r.length) { await r[1].click(); await p.waitForTimeout(400); }
await p.screenshot({ path: process.argv[3] + '/modo-2.png' });
console.log(JSON.stringify({ erros, regua: r.length }));
await b.close();
