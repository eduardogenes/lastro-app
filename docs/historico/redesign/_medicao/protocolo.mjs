// A sessão de fotos: o preparo (estado 1) e o fim, com as nove poses feitas
// (estado 10). Para comparar com sessao-fotos.html.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`CTX.vaiPara('corpo'); CTX.abreProtocolo(); render();`));
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/protocolo-0.png', fullPage: true });
await p.evaluate(() => window.__escopo(`
  const d = hojeISO(); const f = {};
  CTX.protocoloFotos().pontos.forEach(function (x, i) { f[x.id] = { v: Date.now() - (9 - i) * 10000, ext: 'webp' }; });
  S.protocolo.sessoes = [{ d: d, t: Date.now() - 100000, m: Date.now(), fotos: f }];
  view.protocolo.montagem = false; render();`));
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/protocolo-1.png', fullPage: true });
console.log(JSON.stringify({ erros }));
await b.close();
