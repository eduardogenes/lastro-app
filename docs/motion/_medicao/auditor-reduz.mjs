// Auditor: o portão de movimento reduzido, conferido no ponto ao vivo do cartão
// de cima do Agora e na barra do cronômetro. Mesmo uso do auditor-movimento.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const R = {};
for (const modo of ['no-preference', 'reduce']) {
  const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: modo });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
  await p.goto(process.argv[2]); await p.waitForTimeout(900);
  const r = R[modo] = { erros };
  await p.evaluate(() => window.__escopo(`
    const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
    const t = function (k) { return base.getTime() - k*DIA; };
    S.done = [{ day:'A', t:t(3), sid:t(3), dur:4000000, fim:'manual' }, { day:'B', t:t(2), sid:t(2), dur:4000000, fim:'auto' }];
    render();
  `));
  await p.waitForTimeout(300);
  r.ponto = await p.evaluate(() => {
    const d = document.querySelector('.ins-live-dot');
    if (!d) return null;
    const c = getComputedStyle(d);
    return { onde: d.parentElement.className, dur: c.animationDuration, iter: c.animationIterationCount, opacidade: c.opacity, animando: d.getAnimations().map(a => a.playState) };
  });
  await p.evaluate(() => window.__escopo(`diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); toggle(0); startTimer(90, 'teste'); render();`));
  await p.waitForTimeout(700);
  r.barra = await p.evaluate(() => {
    const f = document.getElementById('tfill');
    return { transition: getComputedStyle(f).transition, animando: f.getAnimations().length };
  });
  await ctx.close();
}
console.log(JSON.stringify(R, null, 1));
await b.close();
