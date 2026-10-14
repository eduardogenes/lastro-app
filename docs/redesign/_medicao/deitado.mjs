// O modo de sessão com o telefone deitado (896×414): para comparar com
// momento-1.html, estado 14 — a mesma tela do estado 3 em duas colunas.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 896, height: 414 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
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
await p.screenshot({ path: process.argv[3] + '/deitado-0.png' });
await p.evaluate(() => window.__escopo(`toggle(0); render();`));
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/deitado-1.png' });
const rb = await p.$$('.setrow .repbtn');
if (rb.length > 1) { await rb[1].click(); await p.waitForTimeout(400); }
const r = await p.$$('.regua-v');
await p.screenshot({ path: process.argv[3] + '/deitado-2.png' });
if (r.length) { await r[1].click(); await p.waitForTimeout(400); }
await p.screenshot({ path: process.argv[3] + '/deitado-3.png' });
const aviso = await p.$eval('#deitado', e => getComputedStyle(e).display);
console.log(JSON.stringify({ erros, regua: r.length, aviso }));
await b.close();
