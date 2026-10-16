// Acessibilidade do movimento — o "antes" (commit a22b09d), medido no Chromium.
//
// Duas passadas, uma com `reducedMotion: 'reduce'` e outra com 'no-preference',
// 414 × 896, ×2, toque. Em cada uma: que animações estão vivas
// (`document.getAnimations()`), para onde vai o foco ao abrir e ao fechar folha,
// tela cheia, modo de sessão e painel de pare, se o Tab escapa da camada de
// cima, se `transitionend` e `animationend` ainda chegam sob o portão de
// `src/base.css:374`, e se algum anel de foco seria cortado por um ancestral com
// `overflow` diferente de `visible`.
//
//   python3 -m http.server 4725 -d dist &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/acesso-foco.mjs http://localhost:4725/ docs/motion/_medicao/shots/acesso
//
// Só lê: nada aqui grava no app além da semente de fixture via `__escopo`.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';

const URL = process.argv[2], OUT = process.argv[3];
const b = await chromium.launch({ executablePath: process.env.CHROME });

const SEMENTE = `
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const P = treino('A'); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:'A', t:t, sid:t, dur:3600000, fim:'manual' }, { day:'HX', t:t+5*DIA, sid:t+5*DIA, dur:3600000, fim:'manual' }];
  CTX.vaiPara('agora'); render();
`;

// Funções que rodam DENTRO da página.
const NA_PAGINA = `
window.__a11y = {
  quem() {
    const e = document.activeElement;
    if (!e || e === document.body) return 'body';
    const t = (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    return e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ').join('.') : '') +
      (e.dataset && e.dataset.a ? '[data-a=' + e.dataset.a + ']' : '') + (t ? ' "' + t + '"' : '');
  },
  anims() {
    return document.getAnimations().map(function (a) {
      const alvo = a.effect && a.effect.target;
      const tm = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : {};
      return {
        tipo: a.constructor.name,
        nome: a.animationName || a.transitionProperty || '',
        estado: a.playState,
        iter: tm.iterations,
        dur: tm.duration,
        alvo: alvo ? (alvo.id ? '#' + alvo.id : '') + (alvo.className ? '.' + String(alvo.className).split(' ').join('.') : alvo.tagName) : null
      };
    });
  },
  inertes() { return [].slice.call(document.querySelectorAll('[inert]')).map(function (e) { return e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '') + (e.id ? '#' + e.id : ''); }); },
  dentro(sel) { const c = document.querySelector(sel); return !!(c && document.activeElement && c.contains(document.activeElement)); },
  // O anel é outline de 3px com folga de 2px (tokens.css:410-411): ocupa 5px
  // para fora da caixa. Para cada focável visível, procura o primeiro ancestral
  // que corta (overflow != visible) e confere se a caixa inflada cabe nele.
  aneisCortados() {
    const sel = 'button, a[href], [role="button"], [tabindex], input, select, textarea';
    const fora = [];
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.closest('[inert]')) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') return;
      const inf = { l: r.left - 5, t: r.top - 5, r: r.right + 5, b: r.bottom + 5 };
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const ps = getComputedStyle(p);
        const cx = ps.overflowX !== 'visible', cy = ps.overflowY !== 'visible';
        if (!cx && !cy) continue;
        const pr = p.getBoundingClientRect();
        const bl = parseFloat(ps.borderLeftWidth), bt = parseFloat(ps.borderTopWidth);
        const cl = pr.left + bl, ct = pr.top + bt, cr = cl + p.clientWidth, cb = ct + p.clientHeight;
        const corta = (cx && (inf.l < cl - .5 || inf.r > cr + .5)) || (cy && (inf.t < ct - .5 || inf.b > cb + .5));
        // só conta o corte se o elemento em si está dentro do recorte (senão é rolagem, não corte de anel)
        const visivel = r.left >= cl - .5 && r.right <= cr + .5 && r.top >= ct - .5 && r.bottom <= cb + .5;
        if (corta && visivel) {
          fora.push({
            el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ' "' + (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24) + '"',
            corte: p.tagName.toLowerCase() + '.' + String(p.className).split(' ')[0] + (p.id ? '#' + p.id : ''),
            overflow: ps.overflowX + '/' + ps.overflowY
          });
        }
        break;
      }
    });
    return fora;
  },
  // Sob o portão de hoje, uma transição vira 'none': o transitionend chega?
  fimDeTransicao() {
    return new Promise(function (ok) {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;left:0;top:0;width:10px;height:10px;opacity:1;transition:opacity 120ms linear';
      document.body.appendChild(d);
      let veio = false;
      d.addEventListener('transitionend', function () { veio = true; });
      d.getBoundingClientRect();
      requestAnimationFrame(function () { d.style.opacity = '0'; });
      setTimeout(function () { d.remove(); ok(veio); }, 600);
    });
  },
  fimDeAnimacao() {
    return new Promise(function (ok) {
      const s = document.createElement('style');
      s.textContent = '@keyframes __t { from { opacity: 0 } to { opacity: 1 } } .__t { animation: __t 120ms both; }';
      document.head.appendChild(s);
      const d = document.createElement('div');
      d.className = '__t';
      d.style.cssText = 'position:fixed;left:0;top:0;width:10px;height:10px';
      let veio = false;
      d.addEventListener('animationend', function () { veio = true; });
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); s.remove(); ok(veio); }, 600);
    });
  }
};
`;

async function passada(reduz) {
  const ctx = await b.newContext({
    viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    reducedMotion: reduz ? 'reduce' : 'no-preference'
  });
  const p = await ctx.newPage();
  const erros = []; p.on('pageerror', e => erros.push(String(e)));
  const d = new Date(); d.setHours(6, 30, 0, 0);
  await p.addInitScript(`Date.now = () => ${d.getTime()};`);
  await p.addInitScript(NA_PAGINA);
  await p.goto(URL); await p.waitForTimeout(800);
  await p.evaluate(s => window.__escopo(s), SEMENTE);
  await p.waitForTimeout(300);
  const tag = reduz ? 'reduz' : 'livre';
  const A = () => p.evaluate(() => window.__a11y.anims());
  const Q = () => p.evaluate(() => window.__a11y.quem());
  const r = { contexto: tag, erros };

  // Tab até N vezes; devolve a primeira posição fora da camada.
  async function tabs(sel, n) {
    const visto = [];
    for (let i = 0; i < n; i++) {
      await p.keyboard.press('Tab');
      const ok = await p.evaluate(s => window.__a11y.dentro(s), sel);
      if (!ok) { visto.push({ tab: i + 1, foi: await Q() }); break; }
    }
    return visto.length ? visto[0] : 'ficou dentro em ' + n + ' Tabs';
  }

  const passo = n => process.stderr.write(tag + ' ' + n + '\n');
  p.setDefaultTimeout(5000);
  // ---- 1. Agora em repouso ----
  r.agora = { anims: await A(), aneis: await p.evaluate(() => window.__a11y.aneisCortados()) };
  await p.screenshot({ path: OUT + '/' + tag + '-1-agora.png' });

  passo(2);
  // ---- 2. Folha (tipo do dia), aberta por toque real ----
  await p.click('[data-a="tipo-do-dia"]'); await p.waitForTimeout(350);
  r.folha = {
    focoAoAbrir: await Q(),
    inertes: await p.evaluate(() => window.__a11y.inertes()),
    anims: await A(),
    aneis: await p.evaluate(() => window.__a11y.aneisCortados())
  };
  await p.screenshot({ path: OUT + '/' + tag + '-2-folha.png' });
  r.folha.tab = await tabs('.ins-folha', 30);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  r.folha.focoAoFechar = await Q();

  passo(3);
  // ---- 3. Tela cheia (Ajustes), aberta por toque real ----
  await p.click('[data-a="ajustes"]'); await p.waitForTimeout(350);
  r.telaCheia = { focoAoAbrir: await Q(), anims: await A(), aneis: await p.evaluate(() => window.__a11y.aneisCortados()) };
  await p.click('.tc-back'); await p.waitForTimeout(350);
  r.telaCheia.focoAoFechar = await Q();
  r.telaCheia.anims = r.telaCheia.anims.concat(await A());

  passo(4);
  // ---- 4. Painel de pare, por cima do Agora ----
  await p.evaluate(() => window.__escopo(`pare({ texto: 'Apagar o peso de 28/09.', sim: 'Apagar o peso de 28/09' }); null;`));
  await p.waitForTimeout(300);
  r.pare = { focoAoAbrir: await Q(), inertes: await p.evaluate(() => window.__a11y.inertes()) };
  await p.screenshot({ path: OUT + '/' + tag + '-4-pare.png' });
  r.pare.tab = await tabs('.pare-w', 30);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  r.pare.focoAoFechar = await Q();

  passo(5);
  // ---- 5. Aviso "Não guardei" (a família falhou), por cima do Agora ----
  await p.evaluate(() => window.__escopo(`view.naoGuardado = { motivo: 'cota', oQue: 'a série 3 do Supino', valor: '55 × 9' }; view.falhou = true; render();`));
  await p.waitForTimeout(300);
  r.falhou = {
    focoAoAbrir: await Q(),
    role: await p.evaluate(() => { const e = document.querySelector('.falhou-w .pare'); return e && (e.getAttribute('role') + ' aria-modal=' + e.getAttribute('aria-modal')); }),
    inertes: await p.evaluate(() => window.__a11y.inertes())
  };
  r.falhou.tab = await tabs('.falhou-w', 30);
  await p.evaluate(() => window.__escopo(`view.falhou = false; view.naoGuardado = null; render();`));
  await p.waitForTimeout(200);

  passo(6);
  // ---- 6. Modo de sessão: entrar pelo cartão de cima, por toque real ----
  await p.click('.ins-foco'); await p.waitForTimeout(400);
  r.modo = { focoAoEntrar: await Q(), anims: await A() };
  await p.evaluate(() => window.__escopo(`toggle(0); render();`)); await p.waitForTimeout(300);
  const regua = await p.$$('.regua-v');
  if (regua.length) { await regua[1].click(); await p.waitForTimeout(400); }
  r.modo.timerLigado = await p.evaluate(() => document.getElementById('timer').classList.contains('on'));
  r.modo.serieDita = await p.evaluate(() => document.getElementById('serie-dita').textContent);
  r.modo.animsNoDescanso = await A();
  r.modo.aneis = await p.evaluate(() => window.__a11y.aneisCortados());
  await p.screenshot({ path: OUT + '/' + tag + '-6-modo-descanso.png' });
  // folha por cima do modo, com o cronômetro ligado: o Tab escapa para o cronômetro?
  await p.click('[data-a="menu-sessao"]'); await p.waitForTimeout(350);
  r.modo.folhaFoco = await Q();
  r.modo.folhaInertes = await p.evaluate(() => window.__a11y.inertes());
  r.modo.folhaTab = await tabs('.ins-folha', 40);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  r.modo.folhaFocoAoFechar = await Q();
  await p.click('[data-a="sai-do-modo"]'); await p.waitForTimeout(400);
  r.modo.focoAoSair = await Q();

  passo(7);
  // ---- 7. O toast: está na árvore enquanto escondido? ----
  r.toast = await p.evaluate(() => {
    const el = document.getElementById('toast');
    const antes = getComputedStyle(el).display;
    window.__escopo(`toast('Ajuste salvo.');`);
    const depois = getComputedStyle(el).display;
    return { displayEscondido: antes, displayMostrando: depois, role: el.getAttribute('role'), live: el.getAttribute('aria-live') };
  });

  passo(8);
  // ---- 8. Os eventos de fim sob o portão ----
  r.eventos = {
    transitionend: await p.evaluate(() => window.__a11y.fimDeTransicao()),
    animationend: await p.evaluate(() => window.__a11y.fimDeAnimacao())
  };

  await ctx.close();
  return r;
}

const saida = { livre: await passada(false), reduz: await passada(true) };
writeFileSync(OUT + '/acesso-foco.json', JSON.stringify(saida, null, 2));
console.log(JSON.stringify(saida, null, 2));
await b.close();
