// Um endereço sem dado nenhum: a Prescrição oferece achar o que existe antes
// de começar. Para comparar com prescricao.html, estado 9.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`CTX.vaiPara('prescricao'); render();`));
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/endereco-0.png' });
console.log(JSON.stringify({ erros }));
await b.close();
