// A câmera da sessão de fotos com câmera falsa do Chromium: os blocos das poses
// e o clarão do disparo. Para comparar com sessao-fotos.html, estados 2 e 3.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  permissions: ['camera'] });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(process.argv[2]); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`CTX.vaiPara('corpo'); CTX.abreProtocolo(); CTX.comecaSessaoDeFotos(); render();`));
await p.waitForTimeout(300);
await p.evaluate(() => window.__escopo(`CTX.abreCamera();`));
await p.waitForTimeout(1500);
await p.screenshot({ path: process.argv[3] + '/camera-0.png' });
await p.evaluate(() => window.__escopo(`CTX.setTimerDaCamera(0); CTX.disparaCamera();`));
await p.waitForTimeout(90);
await p.screenshot({ path: process.argv[3] + '/camera-1.png' });
await p.waitForTimeout(800);
await p.screenshot({ path: process.argv[3] + '/camera-2.png' });
const blocos = await p.$$eval('.cam-bloco', l => l.map(e => e.className));
console.log(JSON.stringify({ erros, blocos }));
await b.close();
