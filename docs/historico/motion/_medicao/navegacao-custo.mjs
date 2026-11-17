// Quanto custa um render() com cada tela na frente: é o preço de manter a aba
// montada POR BAIXO de uma tela cheia (a alternativa por classes), pago em todo
// desenho enquanto o destino estiver aberto. Mediana de 30 renders seguidos.
//
//   CHROME=... node docs/motion/_medicao/navegacao-custo.mjs http://localhost:4722/
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const d = new Date(); d.setHours(12, 10, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2] || 'http://localhost:4722/'); await p.waitForTimeout(800);
const E = c => p.evaluate(x => window.__escopo(x), c);
await E(`
  const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
  const t = function (k) { return base.getTime() - k*DIA; };
  S.logs = {}; S.done = [];
  ['A','B','C','D','E'].forEach(function (L, j) { for (let sem = 0; sem < 8; sem++) { const tt = t(1 + j + sem*7); const P = treino(L); if (!P) return;
    P.ex.forEach(function (ex, i) { const sets = []; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); (S.logs[ex.id] = S.logs[ex.id] || []).push({ t: tt+i*600000, sid: tt, sets: sets }); });
    S.done.push({ day: L, t: tt, sid: tt, dur: 4000000, fim: 'manual' }); } });
  S.body.peso = []; for (let k=1;k<60;k++) S.body.peso.push({ t: t(k), v: 74 - k*0.03 });
  CTX.vaiPara('agora'); render();`);
const mede = () => p.evaluate(() => window.__escopo(`(function(){ const a=[]; for (let i=0;i<30;i++){ const t0=performance.now(); render(); a.push(performance.now()-t0);} a.sort(function(x,y){return x-y;}); return Math.round(a[15]*100)/100; })()`));
const r = {};
for (const aba of ['agora', 'dias', 'corpo', 'semana', 'prescricao']) { await E(`CTX.vaiPara('${aba}');`); await p.waitForTimeout(150); r[aba] = await mede(); }
await E(`CTX.vaiPara('agora'); CTX.abreAjustes();`); await p.waitForTimeout(150); r.ajustes = await mede(); await E(`CTX.fechaAjustes();`);
await E(`view.day='A'; abreModo(); render();`); await p.waitForTimeout(150); r.modo = await mede(); await E(`CTX.fechaModoDeSessao();`);
await E(`CTX.vaiPara('prescricao'); CTX.abrePrograma();`); await p.waitForTimeout(150); r.programa = await mede();
console.log(JSON.stringify({ medianaPorRenderEmMs: r }));
await b.close();
