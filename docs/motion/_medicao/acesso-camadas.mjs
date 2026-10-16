// Acessibilidade do movimento — o foco escapa da camada de cima?
//
// Complemento de acesso-foco.mjs: lá o Tab para frente saía do documento (o
// painel de pare é o último filho do #app). Aqui o caminho que importa é o
// Shift+Tab, que anda para TRÁS, para dentro da página de baixo, e o Tab com o
// cronômetro de descanso ligado, que mora FORA do #app (index.html:88) e por
// isso não recebe o `inert` da folha (folha.jsx:58).
//
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/acesso-camadas.mjs http://localhost:4725/ docs/motion/_medicao/shots/acesso
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';

const URL = process.argv[2], OUT = process.argv[3];
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({
  viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  reducedMotion: 'reduce'
});
const p = await ctx.newPage();
p.setDefaultTimeout(5000);
const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(URL); await p.waitForTimeout(800);
await p.evaluate(() => window.__escopo(`CTX.vaiPara('agora'); render();`));
await p.waitForTimeout(300);

const quem = () => p.evaluate(() => {
  const e = document.activeElement;
  if (!e || e === document.body) return 'body';
  const t = (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36);
  return e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + (e.id ? '#' + e.id : '') + ' "' + t + '"';
});
async function anda(tecla, sel, n) {
  const caminho = [];
  for (let i = 0; i < n; i++) {
    await p.keyboard.press(tecla);
    const dentro = await p.evaluate(s => { const c = document.querySelector(s); return !!(c && c.contains(document.activeElement)); }, sel);
    const q = await quem();
    caminho.push((dentro ? 'dentro ' : 'FORA ') + q);
    if (!dentro) break;
  }
  return caminho;
}

const r = { erros };

// 1. Pare por cima do Agora: Shift+Tab a partir da saída
await p.evaluate(() => window.__escopo(`pare({ texto: 'Apagar o peso de 28/09.', sim: 'Apagar o peso de 28/09' }); null;`));
await p.waitForTimeout(300);
r.pareShiftTab = await anda('Shift+Tab', '.pare-w', 6);
await p.screenshot({ path: OUT + '/camadas-1-pare-shifttab.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(200);

// 2. Aviso "Não guardei" por cima do Agora: Shift+Tab a partir do primeiro botão
await p.evaluate(() => window.__escopo(`view.naoGuardado = { motivo: 'cota', oQue: 'a série 3 do Supino', valor: '55 × 9' }; view.falhou = true; render();`));
await p.waitForTimeout(300);
r.falhouShiftTab = await anda('Shift+Tab', '.falhou-w', 6);
await p.evaluate(() => window.__escopo(`view.falhou = false; view.naoGuardado = null; render();`));
await p.waitForTimeout(200);

// 3. Cronômetro ligado + folha aberta: Tab e Shift+Tab
await p.evaluate(() => window.__escopo(`startTimer(90, 'descanso · série 1 · teste'); null;`));
await p.waitForTimeout(200);
await p.click('[data-a="tipo-do-dia"]'); await p.waitForTimeout(350);
r.folhaComTimer = {
  timerInerte: await p.evaluate(() => !!document.getElementById('timer').closest('[inert]')),
  tab: await anda('Tab', '.ins-folha', 30)
};
await p.click('[data-a="tipo-do-dia"]', { trial: true }).catch(() => {});
await p.screenshot({ path: OUT + '/camadas-3-folha-timer.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(300);

// 4. Tela cheia com o cronômetro ligado: o foco no h1, e o Shift+Tab
await p.click('[data-a="ajustes"]'); await p.waitForTimeout(350);
r.telaCheiaComTimer = { foco: await quem(), shiftTab: await anda('Shift+Tab', '.tc', 4) };

writeFileSync(OUT + '/acesso-camadas.json', JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 2));
await b.close();
