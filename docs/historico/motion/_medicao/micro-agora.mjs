// Micro-interações · o Agora: marcar uma refeição pela linha e "+1 copo".
// Mede o que se move sem animação nenhuma: a linha tocada, a leitura de volta
// que nasce lá em cima, e quanto tempo o "+1 copo" leva para pintar o número
// (ele espera a gravação antes de desenhar).
//
// Uso: igual ao micro-render.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(13, 10, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const OUT = process.argv[3];
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);
await ev(`CTX.vaiPara('agora'); render();`);
await p.waitForTimeout(300);
const caixa = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }, sel);

// uma linha de refeição sem marca, abaixo da dobra
const linhas = await p.$$eval('.ag-l-b', l => l.map(e => e.dataset.a));
const alvo = linhas[Math.min(3, linhas.length - 1)];
await p.evaluate((a) => document.querySelector('[data-a="' + a + '"]').scrollIntoView({ block: 'center' }), alvo);
await p.waitForTimeout(100);
await p.click('[data-a="' + alvo + '"]'); await p.waitForTimeout(80);
await p.screenshot({ path: OUT + '/agora-0-linha-aberta.png' });
const id = alvo.replace('linha-', '');
const antes = { linha: await caixa('[data-a="' + alvo + '"]'), tudo: await caixa('[data-a="tudo-' + id + '"]'), scrollY: await p.evaluate(() => scrollY) };
await p.click('[data-a="tudo-' + id + '"]'); await p.waitForTimeout(80);
const depois = { linha: await caixa('[data-a="' + alvo + '"]'), volta: await caixa('.ag-volta'), scrollY: await p.evaluate(() => scrollY),
  sobOdedo: await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.a || e.className) + ' · ' + e.textContent.trim().slice(0, 30) : null; }, { x: antes.tudo[0] + antes.tudo[2] / 2, y: antes.tudo[1] + antes.tudo[3] / 2 }) };
await p.screenshot({ path: OUT + '/agora-1-marcada.png' });

// "+1 copo": quanto tempo do clique até o número mudar, e qual bolinha encheu
await p.evaluate(() => document.querySelector('[data-a="agua-mais"]').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(100);
const agua = await p.evaluate(async () => {
  const b = document.querySelector('.ag-agua-t b'); const antes = b ? b.textContent : '0';
  const bolas = [...document.querySelectorAll('.ag-copos i')]; bolas.forEach((e, i) => e.__i = i);
  const t0 = performance.now();
  let pintou = null;
  const mo = new MutationObserver(() => { if (pintou == null) pintou = performance.now() - t0; });
  mo.observe(document.querySelector('.ag-agua'), { subtree: true, childList: true, characterData: true, attributes: true });
  document.querySelector('[data-a="agua-mais"]').click();
  const sincrono = document.querySelector('.ag-agua-t b') ? document.querySelector('.ag-agua-t b').textContent : null;
  await new Promise(r => setTimeout(r, 200));
  mo.disconnect();
  const depois = document.querySelector('.ag-agua-t b').textContent;
  const cheias = [...document.querySelectorAll('.ag-copos i')].map((e, i) => (e.classList.contains('f') ? 'f' : '.') + (e.__i === i ? '' : '*')).join('');
  return { antes, noMesmoTique: sincrono, depois, msAtePintar: pintou == null ? null : Math.round(pintou), cheias };
});
await p.screenshot({ path: OUT + '/agora-2-copo.png' });
console.log(JSON.stringify({ erros, alvo, antes, depois, agua }, null, 1));
await b.close();
