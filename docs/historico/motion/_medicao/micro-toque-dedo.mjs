// O dedo de verdade (ponteiro apertado), sem forçar `:active`: aperta o botão,
// fotografa a caixa dele com o botão apertado, sai de cima ANTES de soltar (sem
// `click`, nada muda de dado) e compara com a foto de antes. Nos dois motores,
// com e sem "Reduzir movimento".
//
// Peça 1 do motion (docs/motion/09-implementacao.md). No Chromium:
//
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/micro-toque-dedo.mjs http://localhost:4729/ saida.json
//
// No WebKit, com as bibliotecas da receita de desempenho-comum.mjs:
//
//   L=~/.cache/ms-playwright/webkit-deps-noble
//   MOTOR=webkit LD_LIBRARY_PATH=$L \
//   LD_PRELOAD=$L/libgav1.so.1:$L/libyuv.so.0:$L/libevent-2.1.so.7:$L/libavif.so.16 \
//     node docs/motion/_medicao/micro-toque-dedo.mjs http://localhost:4729/ saida.json
//
// REDUZ=1 liga "Reduzir movimento".
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import utils from '../../../node_modules/playwright-core/lib/utilsBundle.js'; const { PNG } = utils;

const [url, saida] = process.argv.slice(2);
const motor = process.env.MOTOR === 'webkit' ? webkit : chromium;
const b = await motor.launch(process.env.MOTOR === 'webkit' ? {} : { executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2,
  reducedMotion: process.env.REDUZ ? 'reduce' : 'no-preference' });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(18, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(url); await p.waitForTimeout(1200);
const ev = (c) => p.evaluate((c) => { window.__escopo(c); return null; }, c);
await ev(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const DD = nextDay(); const P = treino(DD); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:DD, t:t, sid:t, dur:3600000, fim:'manual' }];
  diaDeComida().cadencia = 'treino';
  CTX.vaiPara('agora'); render();
`);
await p.waitForTimeout(400);

const lum = c => { const l = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
const razao = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

async function foto(caixa) {
  const buf = await p.screenshot({ clip: caixa, animations: 'disabled' });
  return PNG.sync.read(buf);
}
const r = [];
async function aperta(sel, rotulo) {
  const el = await p.$(sel);
  if (!el) { r.push({ rotulo, sel, r: 'não achei' }); return; }
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(80);
  const caixa = await el.boundingBox();
  const antes = await foto(caixa);
  await p.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await p.mouse.down();
  await p.waitForTimeout(100);
  const dedo = await foto(caixa);
  const escala = await el.evaluate(e => { const cs = getComputedStyle(e); return cs.transform + ' / ' + cs.scale; });
  // sai de cima antes de soltar: sem click, nada muda de dado
  await p.mouse.move(2, 2);
  await p.mouse.up();
  await p.waitForTimeout(80);
  // os pixels que mudaram, e o contraste mediano entre antes e dedo neles
  let mudou = 0; const rs = [];
  for (let i = 0; i < antes.data.length; i += 4) {
    const a = [antes.data[i], antes.data[i + 1], antes.data[i + 2]], z = [dedo.data[i], dedo.data[i + 1], dedo.data[i + 2]];
    if (a.some((v, k) => Math.abs(v - z[k]) > 2)) { mudou++; rs.push(razao(a, z)); }
  }
  rs.sort((x, y) => x - y);
  const total = antes.data.length / 4;
  r.push({ rotulo, sel, mudouPct: +(100 * mudou / total).toFixed(1), contrasteMediano: rs.length ? +rs[rs.length >> 1].toFixed(2) : 1, escala });
}

await aperta('[data-a="agua-mais"]', '+1 copo');
await aperta('[data-a="agua-corrige"]', 'a conta da água');
await aperta('.ag-l-b', 'linha de refeição');
await aperta('.ins-tab:not(.on)', 'aba');
await aperta('.ins-cab-ajustes', 'Ajustes');
await ev(`CTX.abreTreinoDeHoje(); render();`); await p.waitForTimeout(400);
await aperta('.day-ini', 'Iniciar treino');
await aperta('[data-ex="0"] .ex-top', 'topo do cartão');
await aperta('[data-ex="0"] .exfoto', 'miniatura do aparelho');
await ev(`toggle(0); render();`); await p.waitForTimeout(300);
await aperta('#w0_0', 'carga da série');
await aperta('#r0_0', 'repetição da série');
await aperta('#q0_0', 'RIR da série');
await aperta('.ex-mais', '+ série');
await aperta('.histbtn', 'Trocar/Pular/Histórico');
await ev(`abreRegua(0, 0);`); await p.waitForTimeout(150);
await aperta('.regua-v', 'valor da régua');
await aperta('.regua-anda', 'seta da régua');
await ev(`abreTecladoDeCarga(0, 0);`); await p.waitForTimeout(150);
await aperta('.tcl-t', 'tecla');
await aperta('.tcl-pronto', 'pronto');
await ev(`fechaTeclado(); abreRir(0, 0);`); await p.waitForTimeout(150);
await aperta('.rirop', 'valor do RIR');
await ev(`view.rir = null; anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 9); render();`); await p.waitForTimeout(300);
await aperta('#tmenos', '−15');
await aperta('#tmais', '+15');
await aperta('#tstop', 'parar');
await aperta('[data-a="descansa-agua"]', 'chip Água (descanso)');
await aperta('.ctrl-b', 'Pausar');

fs.writeFileSync(saida, JSON.stringify({ motor: process.env.MOTOR || 'chromium', reduz: !!process.env.REDUZ, erros, r }, null, 1));
for (const x of r) console.log(x.rotulo.padEnd(26), x.r || (String(x.mudouPct).padStart(5) + '% dos pixels, ' + x.contrasteMediano + ':1 mediano, ' + x.escala));
if (erros.length) console.log('ERROS', erros);
await b.close();
