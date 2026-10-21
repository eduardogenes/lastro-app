// "Abrindo o registro…" pisca na abertura? (peça 8; 03 §8: a frase ficava 2 a 3
// quadros na tela antes de o app montar.)
//
// Desde a peça 8 a frase (`#app > .msg`) nasce APAGADA e só aparece aos 300 ms
// (`--ins-espera-abertura`). Estar no DOM não basta: aqui se lê, a cada quadro
// (`requestAnimationFrame` desde o começo do documento), se ela existe e a
// OPACIDADE dela. Contexto novo a cada abertura (sem registro, sem cache), as
// fontes do Google bloqueadas, como no micro-abertura.mjs. No Chromium, sem
// freio e com a CPU freada 4× e 6×; no WebKit, sem freio. Três aberturas de cada.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… node docs/motion/_medicao/revisor-abertura.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs; REDUZ=1)
//
// Escreve <pasta>/abertura-<rodada>.json.
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const URL_APP = process.argv[2], SAIDA = process.argv[3];
const MOTOR = process.env.MOTOR === 'webkit' ? 'webkit' : 'chromium', REDUZ = !!process.env.REDUZ;
const ROTULO = MOTOR + (REDUZ ? '-reduz' : '');
const b = await (MOTOR === 'webkit' ? webkit : chromium).launch(MOTOR === 'webkit' ? {} : { executablePath: process.env.CHROME });
const res = { motor: MOTOR, rotulo: ROTULO, aberturas: [] };
for (const freio of MOTOR === 'chromium' ? [1, 4, 6] : [1]) {
  for (let rodada = 0; rodada < 3; rodada++) {
    const opc = { viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: REDUZ ? 'reduce' : 'no-preference', locale: 'pt-BR' };
    let ctx; try { ctx = await b.newContext(Object.assign({ isMobile: true }, opc)); } catch (e) { ctx = await b.newContext(opc); }
    const p = await ctx.newPage();
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (MOTOR === 'chromium') { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: freio }); }
    await p.addInitScript(() => {
      window.__ab = { q: [], fcp: null };
      (function olha() {
        const m = document.querySelector('#app > .msg');
        window.__ab.q.push([Math.round(performance.now() * 10) / 10, m ? 1 : 0, m ? Math.round(+getComputedStyle(m).opacity * 100) / 100 : null]);
        if (performance.now() < 3000) requestAnimationFrame(olha);
      })();
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__ab.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch (e) {}
    });
    await p.goto(URL_APP);
    await p.waitForTimeout(3200);
    const ab = await p.evaluate(() => window.__ab);
    const q = ab.q;
    let presente = 0, visivel = 0;
    for (let i = 1; i < q.length; i++) {
      const dt = q[i][0] - q[i - 1][0];
      if (q[i - 1][1]) presente += dt;
      if (q[i - 1][2] != null && q[i - 1][2] > 0.01) visivel += dt;
    }
    const pres = q.filter(x => x[1]);
    res.aberturas.push({ freio, rodada, fcpMs: ab.fcp != null ? Math.round(ab.fcp) : null,
      fraseNoDomAteMs: pres.length ? pres[pres.length - 1][0] : null, fraseNoDomMs: Math.round(presente),
      fraseVisivelMs: Math.round(visivel), quadrosComAFraseVisivel: q.filter(x => x[2] != null && x[2] > 0.01).length,
      maiorOpacidade: Math.max(0, ...q.map(x => x[2] || 0)), quadros: q.length,
      primeiros: q.slice(0, 12) });
    await ctx.close();
  }
}
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'abertura-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
for (const a of res.aberturas) console.log(ROTULO, JSON.stringify(Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'primeiros'))));
await b.close();
