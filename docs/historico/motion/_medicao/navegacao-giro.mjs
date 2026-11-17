// O giro do telefone no meio da sessão: o cartão aberto continua à vista?
//
// Abre o modo, abre o TERCEIRO exercício (o app rola até ele), gira para
// 896 × 414 e volta para 414 × 896, medindo onde o cartão aberto fica. O
// WebKit não tem âncora de rolagem (`overflow-anchor`); o Chromium tem — por
// isso roda nos dois motores. Fora do modo, girar mostra o aviso "Gire o
// telefone" (só CSS) e nada se mexe.
//
//   MOTOR=chromium|webkit CHROME=... WK=... node docs/motion/_medicao/navegacao-giro.mjs http://localhost:4722/ docs/motion/_medicao/shots/navegacao
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';

const URL = process.argv[2] || 'http://localhost:4722/';
const OUT = process.argv[3] || 'docs/motion/_medicao/shots/navegacao';
const MOTOR = process.env.MOTOR || 'chromium';
const b = await (MOTOR === 'webkit' ? webkit : chromium).launch({ executablePath: MOTOR === 'webkit' ? process.env.WK : process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(URL); await p.waitForTimeout(800);
const E = c => p.evaluate(x => window.__escopo(x), c);
await E(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const P = treino('A'); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:'A', t:t, sid:t, dur:3600000, fim:'manual' }];
  view.day = 'A'; abreModo(); render();
`);
await p.waitForTimeout(300);
await E(`toggle(2); render(); mostraExercicio(2);`);
await p.waitForTimeout(300);
const onde = () => p.evaluate(() => {
  const c = document.querySelector('.ex.open');
  const r = c ? c.getBoundingClientRect() : null;
  return { y: Math.round(scrollY), topoDoCartao: r && Math.round(r.top), alturaDaJanela: innerHeight, aVista: !!r && r.top < innerHeight && r.bottom > 0 };
});
const r = { motor: MOTOR, erros };
r.dePe = await onde();
await p.screenshot({ path: `${OUT}/giro-${MOTOR}-1-de-pe.png` });
await p.setViewportSize({ width: 896, height: 414 }); await p.waitForTimeout(400);
r.deitado = await onde();
await p.screenshot({ path: `${OUT}/giro-${MOTOR}-2-deitado.png` });
await p.setViewportSize({ width: 414, height: 896 }); await p.waitForTimeout(400);
r.dePeDeNovo = await onde();
console.log(JSON.stringify(r));
await b.close();
