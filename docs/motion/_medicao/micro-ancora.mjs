// Micro-interações · "Comi tudo" com a página ROLADA: a leitura de volta nasce
// lá em cima, e a linha tocada desce junto — ou não, se o motor ancora a
// rolagem. O Chromium ancora (CSS scroll anchoring); o WebKit é o que o iPhone
// usa, e este script roda nos dois quando o WebKit do Playwright está no cache.
//
// Uso: node micro-ancora.mjs <url> <pasta> [chromium|webkit]
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
const motor = process.argv[4] || 'chromium';
const b = motor === 'webkit' ? await webkit.launch() : await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, ...(motor === 'webkit' ? {} : { isMobile: true }), hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(19, 40, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(1200);
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);
await ev(`CTX.vaiPara('agora'); render();`);
await p.waitForTimeout(300);
const linhas = await p.$$eval('.ag-l-b', l => l.map(e => e.dataset.a));
const alvo = linhas[linhas.length - 1];
await p.evaluate((a) => { const e = document.querySelector('[data-a="' + a + '"]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 300); }, alvo);
await p.waitForTimeout(150);
await p.evaluate((a) => document.querySelector('[data-a="' + a + '"]').click(), alvo);
await p.waitForTimeout(150);
const id = alvo.replace('linha-', '');
const antes = await p.evaluate((a) => ({ y: Math.round(document.querySelector('[data-a="' + a + '"]').getBoundingClientRect().top), scrollY: Math.round(scrollY) }), alvo);
await p.evaluate((id) => document.querySelector('[data-a="tudo-' + id + '"]').click(), id);
await p.waitForTimeout(150);
const depois = await p.evaluate((a) => ({ y: Math.round(document.querySelector('[data-a="' + a + '"]').getBoundingClientRect().top), scrollY: Math.round(scrollY),
  volta: document.querySelector('.ag-volta') ? Math.round(document.querySelector('.ag-volta').getBoundingClientRect().top) : null }), alvo);
await p.screenshot({ path: process.argv[3] + '/ancora-' + motor + '.png' });
console.log(JSON.stringify({ motor, versao: b.version(), erros, alvo, antes, depois, desceu: depois.y - antes.y }));
await b.close();
