// Micro-interações · a abertura: quanto tempo a frase "Abrindo o registro…"
// fica na tela antes de o app montar. Se for um ou dois quadros, ela não é
// espera — é um piscar a cada abertura.
//
// Mede sem freio e com a CPU freada 4× e 6× (aproximação grosseira de um
// telefone; o iPhone 11 Pro Max não está aqui). A rede é local: as fontes do
// Google NÃO entram na conta (bloqueadas), porque o PWA as tem em cache.
//
// Uso: igual ao micro-render.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const out = [];
for (const freio of [1, 4, 6]) {
  for (let rodada = 0; rodada < 3; rodada++) {
    const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: freio });
    await p.addInitScript(() => {
      window.__ab = { };
      new MutationObserver(() => {
        const m = document.querySelector('#app .msg');
        if (m && window.__ab.msgVisto == null) window.__ab.msgVisto = performance.now();
        if (!m && window.__ab.msgVisto != null && window.__ab.msgSaiu == null) window.__ab.msgSaiu = performance.now();
      }).observe(document, { subtree: true, childList: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__ab.fcp = e.startTime; })
        .observe({ type: 'paint', buffered: true });
    });
    await p.goto(process.argv[2]);
    await p.waitForTimeout(1500);
    const ab = await p.evaluate(() => window.__ab);
    out.push({ freio, rodada, fcp: Math.round(ab.fcp), msgSaiu: Math.round(ab.msgSaiu), naTelaDepoisDoPrimeiroQuadro: Math.round(ab.msgSaiu - ab.fcp) });
    await ctx.close();
  }
}
for (const o of out) console.log(JSON.stringify(o));
await b.close();
