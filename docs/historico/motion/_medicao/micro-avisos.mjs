// Micro-interações · os avisos: o toast (e o toast trocado no meio), o painel
// "Não guardei" que chega sozinho 700 ms depois do toque, a faixa "Não
// guardado", e o painel de pare. Mede quando cada um chega, onde, e o que está
// embaixo do polegar quando ele chega.
//
// A falha é provocada fazendo o localStorage recusar (QuotaExceededError).
//
// Uso: igual ao micro-render.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const OUT = process.argv[3];
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);
const caixa = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : 'invisível'; }, sel);
await ev(`diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); toggle(0); render();`);
await p.waitForTimeout(300);

// 1 · o toast, e o toast trocado enquanto está na tela
await ev(`toast('Treino iniciado. O relógio está contando.');`);
const toast1 = { caixa: await caixa('#toast'), texto: await p.evaluate(() => document.querySelector('#toast').textContent) };
await p.screenshot({ path: OUT + '/avisos-0-toast.png' });
await p.waitForTimeout(1500);
await ev(`toast('Guardei como pulado hoje: Remada. Não volta a ser pedido nesta sessão; desfazer põe de volta na fila.');`);
const toast2 = { caixa: await caixa('#toast'), mesmoNo: true };
await p.screenshot({ path: OUT + '/avisos-1-toast-trocado.png' });

// 2 · descanso ligado: o toast sobe junto? (ele lê --ins-timer-h)
await ev(`anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 8); render();`);
await p.waitForTimeout(100);
await ev(`toast('Ajuste salvo.');`);
const comTimer = { toast: await caixa('#toast'), timer: await caixa('#timer') };
await ev(`stopTimer(); render();`);
const semTimer = { toast: await caixa('#toast') };

// 3 · a gravação recusada: o painel chega sozinho, depois do toque
await p.evaluate(() => {
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { if (k === 'lastro-v1') { const e = new Error('cheio'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); };
});
await ev(`abreRegua(0, 1); render();`); await p.waitForTimeout(80);
const v = await p.$$('.regua-v');
const bx = await v[2].boundingBox();
const t0 = Date.now();
await v[2].click();
let chegou = null;
for (let i = 0; i < 40; i++) { if (await p.$('.falhou-w')) { chegou = Date.now() - t0; break; } await p.waitForTimeout(50); }
const falha = { msAteOPainel: chegou, painel: await caixa('.falhou-w .pare'),
  botoes: await p.$$eval('.falhou-w button', l => l.map(e => { const r = e.getBoundingClientRect(); return e.textContent + ' @' + Math.round(r.y) + '–' + Math.round(r.bottom); })),
  sobOdedo: await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.a || e.className) + ' · ' + e.textContent.trim().slice(0, 30) : null; }, { x: bx.x + bx.width / 2, y: bx.y + bx.height / 2 }),
  foco: await p.evaluate(() => document.activeElement && document.activeElement.textContent) };
await p.screenshot({ path: OUT + '/avisos-2-nao-guardei.png' });
await p.click('[data-a="falhou-fecha"]'); await p.waitForTimeout(80);
const faixa = { caixa: await caixa('.ng-faixa'), texto: await p.evaluate(() => document.querySelector('.ng-faixa') && document.querySelector('.ng-faixa').textContent) };
await p.screenshot({ path: OUT + '/avisos-3-faixa.png' });

// 4 · o painel de pare (descartar sessão sem série é o mais comum de abrir)
await p.evaluate(() => { delete Storage.prototype.setItem; });
await ev(`view.naoGuardado = null; view.falhou = false; render();`);
await ev(`apagaFoto && 0; CTX.pedePare ? 0 : 0;`);
console.log(JSON.stringify({ erros, toast1, toast2, comTimer, semTimer, falha, faixa }, null, 1));
await b.close();
