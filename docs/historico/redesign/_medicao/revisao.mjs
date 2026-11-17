// A revisão do treinador colada: as perguntas e o que muda no Treino B. Para
// comparar com prescricao.html, estado 6.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const texto = `Revisão 21/09
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 5 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Hip thrust máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;
await p.evaluate(t => window.__escopo(`CTX.vaiPara('prescricao'); CTX.abreRevisao(); CTX.textoDaRevisao({ value: ${JSON.stringify(t)} }); CTX.leRevisao();`), texto);
await p.waitForTimeout(300);
await p.screenshot({ path: process.argv[3] + '/revisao-0.png', fullPage: true });
console.log(JSON.stringify({ erros }));
await b.close();
