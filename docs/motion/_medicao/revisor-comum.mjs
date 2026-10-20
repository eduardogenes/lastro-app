// Peças do Revisor do time de motion (docs/motion/07-revisao-base.md). Não roda
// sozinho: é importado por revisor-gravar.mjs. Como rodar: no topo daquele.
//
// O que este módulo faz, em ordem:
//   1. abre o motor (Chromium do cache do Playwright ou WebKit 26.5 com a receita
//      de desempenho-comum.mjs) a 414 × 896, ×2 (DPR=3 para ×3), toque, com
//      `reducedMotion: 'reduce'` quando REDUZ=1;
//   2. calibra o relógio dos quadros: seis trocas de cor numa página em branco
//      dizem quanto tempo a captura leva para entregar uma mudança (no Chromium o
//      carimbo do quadro é hora de parede; no WebKit é um relógio monotônico, e o
//      quadro chega uns 38 ms depois da troca);
//   3. abre o app, semeia 120 dias de uso pelos verbos do app (a `semeia` de
//      desempenho-comum.mjs) OU carrega um registro já semeado (REGISTRO=arquivo,
//      que é como o "depois" usa exatamente o mesmo dado do "antes"), e aquece as
//      telas (no WebKit desta máquina a primeira entrada em cada tela custa de 300
//      a 950 ms por causa da fonte do sistema, que não existe no Linux);
//   4. para cada fluxo: devolve o registro, acerta o relógio, recarrega, monta o
//      estado, liga a gravação (`page.screencast`: o vídeo .webm e cada quadro com
//      o carimbo), executa os passos com o dedo de verdade e guarda as medidas;
//   5. chama revisor-tiras.py, que monta a tira de quadros de cada passo e mede o
//      que mudou quadro a quadro.
//
// O dedo: no Chromium é toque de verdade pelo CDP (`Input.dispatchTouchEvent`),
// pousado SEGURA ms (padrão 100) e solto — o `click` nasce do gesto, como no
// telefone. No WebKit do Playwright não há toque com duração: o dedo é o ponteiro
// do mouse, apertado SEGURA ms. Com o mouse, `:active` vale enquanto o dedo está
// pousado e o quadro "dedo" da tira mostra esse instante; com o toque emulado do
// Chromium, não (ver DEDO abaixo).
//
// Nada aqui escreve no app além do estado montado por `window.__escopo`.

import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
import { semeia } from './desempenho-comum.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const URL_APP = process.argv[2] || 'http://localhost:4727/';
export const SAIDA = process.argv[3] || 'docs/motion/_medicao/shots/revisor/antes';
export const MOTOR = process.env.MOTOR === 'webkit' ? 'webkit' : 'chromium';
export const REDUZ = !!process.env.REDUZ;
export const DPR = Number(process.env.DPR || 2);
export const SEGURA = Number(process.env.SEGURA || 100);
// O dedo: 'toque' (CDP, só Chromium; padrão nele) ou 'mouse' (padrão no WebKit).
// No Chromium com toque emulado o `:active` NUNCA é aplicado com o dedo pousado
// (medido: nenhum elemento casa `:active` a 20, 80, 200 e 400 ms); com o mouse,
// é. Para conferir o "afundar" no Chromium, DEDO=mouse.
export const DEDO = MOTOR === 'webkit' ? 'mouse' : (process.env.DEDO === 'mouse' ? 'mouse' : 'toque');
/** Rótulo da rodada, que vai no nome de todo arquivo: chromium, webkit, chromium-reduz… */
export const ROTULO = MOTOR + (REDUZ ? '-reduz' : '') + (DPR !== 2 ? '-x' + DPR : '') + (MOTOR === 'chromium' && DEDO === 'mouse' ? '-mouse' : '');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
// O Python com Pillow e numpy (PYTHON=/usr/bin/python3.12 quando o python3 do
// sistema não os tem — foi o caso depois da atualização de 19/10, que trouxe o 3.14).
const PY = process.env.PYTHON || 'python3';

fs.mkdirSync(SAIDA, { recursive: true });

// ---------------------------------------------------------------------------
// O que roda dentro da página, antes do app, em todo documento (inclusive a cada
// recarga entre fluxos).
// ---------------------------------------------------------------------------
const NA_PAGINA = `
(function () {
  // 0) Devolver o registro guardado ANTES de o app ler o aparelho. Feito aqui, e
  //    não antes da recarga, porque o app grava o que estiver pendente no
  //    'pagehide' (src/main.jsx:6921) e sobrescreveria o que fosse posto antes.
  try {
    var guardado = sessionStorage.getItem('__revisor_registro');
    if (guardado) {
      var o = JSON.parse(guardado);
      localStorage.clear();
      Object.keys(o).forEach(function (k) { localStorage.setItem(k, o[k]); });
      sessionStorage.removeItem('__revisor_registro');
    }
  } catch (e) {}

  // 1) O relógio: quinta, 15/10/2026, na hora pedida pelo fluxo, ANDANDO (o
  //    cronômetro e as transições precisam de tempo correndo).
  var hora = (sessionStorage.getItem('__revisor_hora') || '07:10').split(':');
  var RD = Date, realNow = RD.now.bind(RD);
  var off = new RD(2026, 9, 15, +hora[0], +hora[1], 0).getTime() - realNow();
  function D() {
    var a = [].slice.call(arguments);
    if (!(this instanceof D)) return new RD(realNow() + off).toString();
    return a.length ? new (Function.prototype.bind.apply(RD, [null].concat(a)))() : new RD(realNow() + off);
  }
  D.prototype = RD.prototype; D.UTC = RD.UTC; D.parse = RD.parse;
  D.now = function () { return realNow() + off; };
  window.Date = D;

  // 2) Instrumentação do Revisor. Tempos em hora de parede (timeOrigin + now),
  //    que é a mesma régua dos quadros depois da calibração.
  var agora = function () { return performance.timeOrigin + performance.now(); };
  function desc(e) {
    if (!e || !e.tagName) return null;
    if (e === document.body) return 'body';
    var t = (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 32);
    return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
      (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).join('.') : '') +
      (e.dataset && e.dataset.a ? '[' + e.dataset.a + ']' : '') + (t ? ' "' + t + '"' : '');
  }
  var R = window.__rev = { ev: [], cliques: [], quadros: [], agora: agora, desc: desc };
  addEventListener('pointerdown', function (e) { R.ev.push({ tipo: 'pointerdown', t: agora(), alvo: desc(e.target), ptr: e.pointerType }); }, true);
  addEventListener('pointerup', function (e) { R.ev.push({ tipo: 'pointerup', t: agora() }); }, true);
  addEventListener('click', function (e) { R.clickIni = agora(); R.clickAlvo = desc(e.target); }, true);
  addEventListener('click', function () {
    var c = { ini: R.clickIni, fim: agora(), alvo: R.clickAlvo };
    R.cliques.push(c);
    requestAnimationFrame(function () {
      c.raf = agora();
      c.anims = R.anims();
      setTimeout(function () { c.pinta = agora(); }, 0);
    });
    // O meio do movimento: onde estão os fixos 120 ms depois do toque.
    setTimeout(function () { c.meio = R.fixos(); c.meio.t = agora() - c.ini; }, 120);
    setTimeout(function () { c.anims150 = R.anims(); c.foco50 = desc(document.activeElement); }, 150);
  }, false);
  // Event Timing (Chromium e WebKit 26.5): a duração que o próprio motor dá a cada evento,
  // do toque até o quadro APRESENTADO depois dele. É a régua de fora contra a
  // qual a captura se confere.
  R.eventos = [];
  try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) {
    R.eventos.push({ nome: e.name, ini: performance.timeOrigin + e.startTime, dur: e.duration, proc: e.processingEnd - e.processingStart });
  }); }).observe({ type: 'event', buffered: true, durationThreshold: 16 }); } catch (e) {}
  // Animações vivas: tipo, propriedades dos quadros, duração e repetição.
  R.anims = function () {
    try {
      return document.getAnimations().map(function (a) {
        var ef = a.effect, tm = ef && ef.getComputedTiming ? ef.getComputedTiming() : {};
        var props = [];
        try { ef.getKeyframes().forEach(function (k) { Object.keys(k).forEach(function (p) {
          if (['offset', 'easing', 'composite', 'computedOffset'].indexOf(p) < 0 && props.indexOf(p) < 0) props.push(p); }); }); } catch (e) {}
        var curvas = []; try { curvas = ef.getKeyframes().map(function (k) { return k.easing; }).filter(function (e, i, l) { return e && l.indexOf(e) === i; }); } catch (e) {}
        return { tipo: a.constructor.name, nome: a.animationName || a.transitionProperty || '', props: props,
                 dur: tm.duration, iter: tm.iterations, estado: a.playState,
                 curva: ef && ef.getTiming ? ef.getTiming().easing : null, curvasDosQuadros: curvas,
                 alvo: desc(ef && ef.target), pseudo: ef && ef.pseudoElement || null };
      });
    } catch (e) { return ['erro: ' + e]; }
  };
  // Quadros pelo requestAnimationFrame (o que a thread principal consegue
  // desenhar), em hora de parede; guarda os últimos 4000.
  (function passo() {
    requestAnimationFrame(function () { R.quadros.push(agora()); if (R.quadros.length > 4000) R.quadros.splice(0, 1000); passo(); });
  })();
  // Onde estão as peças fixas e as que grudam no topo, e se a página rola de lado.
  R.fixos = function () {
    var caixa = function (e) { var r = e.getBoundingClientRect(); return r.width || r.height ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : 'invisível'; };
    var f = {};
    [['abas', '.ins-tabbar'], ['cronometro', '#timer'], ['toast', '#toast'], ['faixa', '.ins-faixa'], ['naoGuardado', '.ng-faixa'],
     ['topoModo', '.ins-modo-topo'], ['topoTela', '.tc-topo'], ['relogio', '.day-rel']].forEach(function (kv) {
      var e = document.querySelector(kv[1]);
      if (e) { var cs = getComputedStyle(e); f[kv[0]] = cs.display === 'none' || cs.visibility === 'hidden' ? 'escondido' : caixa(e); }
    });
    return { fixos: f, scrollX: Math.round(scrollX), larguraRolavel: document.documentElement.scrollWidth, larguraDaJanela: innerWidth };
  };
  // A hora em que um elemento some ou aparece (para o passo "espera").
  R.esperaAte = function (fn, limite) {
    return new Promise(function (ok) {
      var t0 = agora();
      (function olha() {
        var v = false; try { v = fn(); } catch (e) {}
        if (v) return ok(agora());
        if (agora() - t0 > limite) return ok(null);
        requestAnimationFrame(olha);
      })();
    });
  };
})();
`;

// ---------------------------------------------------------------------------
// O motor
// ---------------------------------------------------------------------------
export async function abreMotor() {
  const tipo = MOTOR === 'webkit' ? webkit : chromium;
  const b = await tipo.launch(MOTOR === 'webkit' ? {} : { executablePath: process.env.CHROME });
  const opc = {
    viewport: { width: 414, height: 896 }, deviceScaleFactor: DPR, hasTouch: true,
    reducedMotion: REDUZ ? 'reduce' : 'no-preference', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo'
  };
  let ctx, mobile = true;
  // O WebKit do Playwright no Linux não aceita isMobile; o resto é igual.
  try { ctx = await b.newContext(Object.assign({ isMobile: true }, opc)); }
  catch (e) { mobile = false; ctx = await b.newContext(opc); }
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  const cdp = MOTOR === 'chromium' ? await ctx.newCDPSession(p) : null;
  return { b, ctx, p, cdp, erros, mobile, versao: b.version() };
}

// ---------------------------------------------------------------------------
// A calibração do relógio dos quadros
// ---------------------------------------------------------------------------
/**
 * Seis trocas de cor de fundo numa página em branco. Para cada uma: a hora de
 * parede em que o JS trocou a cor e o carimbo do primeiro quadro que mostra a
 * cor nova. Devolve `lat`, a mediana (carimbo convertido − troca), que se desconta
 * de todo quadro: o "0 ms" das tiras é o instante em que uma mudança feita
 * naquele momento apareceria na captura.
 */
export async function calibra(p) {
  await p.setContent('<body style="margin:0;background:#fff"></body>');
  const q = [];
  await p.screencast.start({ size: { width: 414, height: 896 }, quality: 70, onFrame: f => { q.push({ ts: f.timestamp, node: Date.now(), d: f.data }); } });
  await p.waitForTimeout(400);
  const marcas = [];
  for (let i = 0; i < 6; i++) {
    marcas.push(await p.evaluate(i => { const t = performance.timeOrigin + performance.now(); document.body.style.background = i % 2 ? '#ffffff' : '#ff0000'; return t; }, i));
    await p.waitForTimeout(300);
  }
  await p.screencast.stop();
  const off = MOTOR === 'chromium' ? 0 : Math.min(...q.map(x => x.node - x.ts));
  // Cor de um pixel do meio, pelo decodificador de JPEG que vem no Playwright.
  const { jpegjs } = await import('../../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
  const vermelho = x => { const im = jpegjs.decode(x.d, { useTArray: true }); const i = ((im.height >> 1) * im.width + (im.width >> 1)) * 4; return im.data[i] > 200 && im.data[i + 1] < 90; };
  const lats = marcas.map((m, i) => {
    const prim = q.find(x => x.ts + off >= m - 50 && vermelho(x) === (i % 2 === 0));
    return prim ? Math.round(prim.ts + off - m) : null;
  }).filter(x => x != null);
  const ord = lats.slice().sort((a, b) => a - b);
  return { motor: MOTOR, latencias: lats, lat: ord[ord.length >> 1], monotonico: MOTOR !== 'chromium' };
}

// ---------------------------------------------------------------------------
// O app, o registro e o aquecimento
// ---------------------------------------------------------------------------
export const escopo = (p, codigo) => p.evaluate(c => window.__escopo(c), codigo);

export async function abreApp(p) {
  await p.addInitScript(NA_PAGINA);
  await p.goto(URL_APP);
  await p.waitForFunction(() => typeof window.__escopo === 'function');
  await p.waitForTimeout(400);
  let registro;
  if (process.env.REGISTRO) {
    registro = JSON.parse(fs.readFileSync(process.env.REGISTRO, 'utf8'));
  } else {
    const r = await semeia(p, Number(process.env.DIAS || 120));
    await p.waitForTimeout(300);
    registro = await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
    registro.__semente = JSON.stringify(r);
    fs.writeFileSync(path.join(SAIDA, 'registro.json'), JSON.stringify(registro));
  }
  delete registro.__semente;
  return registro;
}

/** Recarrega a página com o registro devolvido e o relógio na hora pedida. */
export async function recarrega(p, registro, hora) {
  await p.evaluate(({ r, h }) => {
    sessionStorage.setItem('__revisor_registro', JSON.stringify(r));
    sessionStorage.setItem('__revisor_hora', h);
  }, { r: registro, h: hora || '07:10' });
  // Navegação nova (e não reload): o estado do histórico do fluxo anterior não
  // passa para este.
  await p.goto(URL_APP);
  await p.waitForFunction(() => typeof window.__escopo === 'function');
  await p.waitForTimeout(500);
}

/** Passa uma vez por toda tela que os fluxos usam (fonte do WebKit, JIT). */
export async function aquece(p) {
  const passos = [
    `CTX.vaiPara('dias'); render();`, `CTX.vaiPara('corpo'); render();`, `CTX.vaiPara('semana'); render();`,
    `CTX.vaiPara('prescricao'); render();`, `CTX.abrePrograma(); render();`, `fecharPrograma(); render();`,
    `CTX.vaiPara('corpo'); CTX.abreEvolucao(); render();`, `CTX.abreComparar(); render();`,
    `voltarUmaCamada(); voltarUmaCamada(); CTX.vaiPara('agora'); render();`,
    `CTX.abreTreinoDeHoje(); render();`, `toggle(0); render();`, `abreRegua(0, 0); render();`,
    `abreTecladoDeCarga(0, 0); render();`,
    `for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada(); CTX.vaiPara('agora'); render();`,
    `const r0 = planoDeComida()[0]; CTX.abreFolha({ k: 'refeicao', id: r0.id }); CTX.abreFolha({ k: 'editaRefeicao', id: r0.id }); render();`,
    `CTX.fechaTudo(); CTX.vaiPara('agora'); render();`
  ];
  for (const c of passos) { try { await escopo(p, c); } catch (e) { /* tela que não existe mais no "depois": segue */ } await p.waitForTimeout(250); }
}

// ---------------------------------------------------------------------------
// O dedo
// ---------------------------------------------------------------------------
async function dedo(p, cdp, x, y, segura = SEGURA) {
  if (DEDO === 'toque') {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 8, radiusY: 8, force: 1 }] });
    await p.waitForTimeout(segura);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await p.mouse.move(x, y);
    await p.mouse.down();
    await p.waitForTimeout(segura);
    await p.mouse.up();
  }
}

/** O que a página diz sobre si num instante: rolagem, foco, camadas, fixos, o que está sob o dedo. */
async function retrato(p, x, y, alvoSel) {
  return p.evaluate(({ x, y, alvoSel }) => {
    const R = window.__rev;
    const caixa = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width || r.height ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : 'invisível'; };
    const fx = R.fixos();
    const fixos = fx.fixos;
    let camadas = null; try { camadas = window.__escopo('camadasAbertas(view).join(",")'); } catch (e) {}
    let alvo = null; try { alvo = alvoSel ? caixa(document.querySelector(alvoSel)) : null; } catch (e) {}
    return {
      y: Math.round(scrollY), x: Math.round(scrollX), altura: document.documentElement.scrollHeight,
      foco: R.desc(document.activeElement), camadas, alvo,
      sobODedo: x != null ? R.desc(document.elementFromPoint(x, y)) : null,
      hist: history.length, fixos, larguraRolavel: fx.larguraRolavel,
      // animações rodando (o pulso, a barra do descanso): com alguma viva, a
      // captura deveria mandar um quadro a cada ~16 ms; um buraco maior é dela.
      animsVivas: document.getAnimations().filter(a => a.playState === 'running').length
    };
  }, { x, y, alvoSel });
}

/**
 * Um passo. `passo.alvo` é um seletor (ou função do resultado do `montar`), com
 * `nth` opcional (-1 = o último); `tipo` é 'toque' (padrão), 'toqueNoMeio' (dois
 * toques seguidos, o segundo em `alvo2`), 'voltar' (o Voltar
 * do sistema: `history.back()`), 'espera' (nenhum dedo: o instante zero é quando
 * `passo.ate` fica verdadeiro na página) ou 'codigo' (roda `passo.codigo` no
 * escopo do app, sem dedo).
 */
export async function executaPasso(p, cdp, passo, montado) {
  const tipo = passo.tipo || 'toque';
  const seletor = typeof passo.alvo === 'function' ? passo.alvo(montado) : passo.alvo;
  let x = null, y = null, alvoSel = null;
  if (tipo === 'toque' || tipo === 'toqueNoMeio') {
    let loc = p.locator(seletor);
    loc = passo.nth === -1 ? loc.last() : loc.nth(passo.nth || 0);
    await loc.waitFor({ state: 'visible', timeout: 4000 });
    // Se o alvo não está inteiro na tela (ou está sob a barra de abas e as faixas),
    // rola ANTES do passo, fora da janela da tira. O que é fixo não se rola.
    const fora = passo.semRolar ? false : await loc.evaluate(e => {
      for (let a = e; a; a = a.parentElement) { const ps = getComputedStyle(a).position; if (ps === 'fixed' || ps === 'sticky') return false; }
      const r = e.getBoundingClientRect(); return r.top < 70 || r.bottom > innerHeight - 130;
    });
    if (fora) { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(350); }
    const bb = await loc.boundingBox();
    x = Math.round(bb.x + bb.width / 2); y = Math.round(bb.y + bb.height / 2);
    alvoSel = await loc.evaluate(e => { e.setAttribute('data-revisor-alvo', '1'); return '[data-revisor-alvo]'; });
  }
  await p.waitForTimeout(passo.pausaAntes ?? 350);
  const antes = await retrato(p, x, y, alvoSel);
  const n0 = await p.evaluate(() => ({ ev: window.__rev.ev.length, c: window.__rev.cliques.length, et: window.__rev.eventos.length }));
  let t0 = null, pousa = null;
  let meioNode = null, segundo = null;
  if (tipo === 'toque') {
    await dedo(p, cdp, x, y, passo.segura ?? SEGURA);
  } else if (tipo === 'toqueNoMeio') {
    // Dois toques sem ida e volta entre eles: o primeiro em `alvo`; `intervalo`
    // ms depois de soltar, um toque curto (`segura2`, 30 ms) em `alvo2`, cuja
    // posição é lida numa chamada só. O segundo `click` cai ~100–130 ms depois do
    // primeiro: no meio de uma transição de 180–240 ms.
    await dedo(p, cdp, x, y, passo.segura ?? SEGURA);
    await p.waitForTimeout(passo.intervalo ?? 50);
    // `ponto2` ([x, y] fixo) mira um lugar que não anda (o véu, longe da borda
    // da folha): ler a caixa de um alvo que sobe 60 px por quadro e descer o
    // dedo um quadro depois erra a mira (peça 4, 07 §10)
    const sel2 = passo.ponto2 ? null : (typeof passo.alvo2 === 'function' ? passo.alvo2(montado) : passo.alvo2);
    const r2 = passo.ponto2 ? passo.ponto2 : await p.evaluate(({ s, n }) => { const l = document.querySelectorAll(s); const e = n === -1 ? l[l.length - 1] : l[n || 0]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, { s: sel2, n: passo.nth2 });
    if (r2) await dedo(p, cdp, Math.round(r2[0]), Math.round(r2[1]), passo.segura2 ?? 30);
    segundo = { seletor: sel2 || 'ponto ' + JSON.stringify(passo.ponto2), dedo: r2 ? r2.map(Math.round) : null, achou: !!r2 };
  } else if (tipo === 'voltar') {
    t0 = await p.evaluate(() => { const t = window.__rev.agora(); history.back(); return t; });
  } else if (tipo === 'codigo') {
    t0 = await p.evaluate(c => { const t = window.__rev.agora(); window.__escopo(c); return t; }, passo.codigo);
  } else if (tipo === 'espera') {
    t0 = await p.evaluate(({ f, lim }) => window.__rev.esperaAte(new Function('return (' + f + ')'), lim), { f: passo.ate, lim: passo.limite || 6000 });
  }
  if (tipo !== 'toque') { await p.waitForTimeout(110); meioNode = await p.evaluate(() => window.__rev.fixos()); }
  await p.waitForTimeout((passo.depois ?? 900) - (tipo !== 'toque' ? 110 : 0));
  // O efeito que o passo tinha de produzir (por ex. a aba certa acesa): é o que
  // prova que o toque chegou, inclusive no meio de um movimento.
  let confere = null;
  if (passo.confere) { try { confere = await p.evaluate(c => !!(new Function('return (' + c + ')'))(), passo.confere); } catch (e) { confere = 'erro: ' + e; } }
  const pagina = await p.evaluate(n0 => {
    const R = window.__rev;
    return { ev: R.ev.slice(n0.ev), cliques: R.cliques.slice(n0.c), quadros: R.quadros.slice(-400), eventos: R.eventos.slice(n0.et) };
  }, n0);
  const pd = pagina.ev.find(e => e.tipo === 'pointerdown');
  const clique = pagina.cliques[0] || null;
  if (tipo === 'toque' || tipo === 'toqueNoMeio') {
    pousa = pd ? pd.t : null;
    t0 = clique ? clique.ini : (pagina.ev.find(e => e.tipo === 'pointerup') || {}).t || pousa;
  }
  // Quadros da thread principal na janela [t0, t0 + 800].
  const ints = [];
  const qs = pagina.quadros.filter(t => t >= t0 - 20 && t <= t0 + 800);
  for (let i = 1; i < qs.length; i++) ints.push(Math.round((qs[i] - qs[i - 1]) * 10) / 10);
  const limite = MOTOR === 'chromium' ? 25 : 34;
  // o primeiro intervalo depois do toque carrega o render() da ação: o 04 §6 não o conta
  const semOPrimeiro = ints.slice(1);
  const depois = await retrato(p, x, y, alvoSel);
  if (alvoSel) await p.evaluate(() => document.querySelectorAll('[data-revisor-alvo]').forEach(e => e.removeAttribute('data-revisor-alvo')));
  return {
    id: passo.id, titulo: passo.titulo, tipo, seletor: seletor || null, dedo: x != null ? [x, y] : null,
    pousa, t0,
    toque: clique ? {
      alvoDoClique: clique.alvo, alvoDoPousar: pd ? pd.alvo : null, ponteiro: pd ? pd.ptr : null,
      dedoPousadoMs: pd ? Math.round(clique.ini - pd.t) : null,
      handlerMs: Math.round((clique.fim - clique.ini) * 10) / 10,
      ateOQuadroMs: clique.pinta ? Math.round((clique.pinta - clique.ini) * 10) / 10 : null,
      // Event Timing do click: do toque à apresentação (arredondado a 8 ms pelo motor).
      eventTimingClickMs: (pagina.eventos.filter(e => e.nome === 'click').sort((a, b) => b.dur - a.dur)[0] || {}).dur ?? null
    } : (tipo !== 'voltar' && tipo !== 'espera' && tipo !== 'codigo' ? { semClique: true, eventos: pagina.ev.map(e => e.tipo) } : null),
    animacoes: clique ? { noQuadroSeguinte: clique.anims, aos150ms: clique.anims150 } : null,
    focoAos150ms: clique ? clique.foco50 : null,
    quadrosDaPagina: { n: qs.length, maiorIntervalo: ints.length ? Math.max(...ints) : null, acimaDoLimite: ints.filter(v => v > limite).length,
                       acimaDoLimiteSemOPrimeiro: semOPrimeiro.filter(v => v > limite).length, limiteMs: limite },
    meio: clique ? clique.meio || null : meioNode,
    segundoToque: segundo ? Object.assign(segundo, (() => {
      const pds = pagina.ev.filter(e => e.tipo === 'pointerdown'), c2 = pagina.cliques[1];
      return { pousaRelMs: pds[1] && clique ? Math.round(pds[1].t - clique.ini) : null,
               cliqueRelMs: c2 && clique ? Math.round(c2.ini - clique.ini) : null,
               alvoDoClique: c2 ? c2.alvo : null, alvoDoPousar: pds[1] ? pds[1].alvo : null,
               // com a View Transition o robô vê o 1º clique no `html`; o app o
               // reenvia ao nó sob o dedo (peça 5): todos os cliques depois do 1º
               cliquesDepois: pagina.cliques.slice(1).map(c => c.alvo) };
    })()) : null,
    confere, esperado: passo.confere || null,
    antes, depois
  };
}

// ---------------------------------------------------------------------------
// Um fluxo inteiro, gravado
// ---------------------------------------------------------------------------
export async function gravaFluxo(ab, registro, cal, fluxo) {
  const { p, cdp } = ab;
  const pasta = path.join(SAIDA, fluxo.id);
  fs.mkdirSync(pasta, { recursive: true });
  // A passada de aquecimento: o fluxo inteiro uma vez, sem gravar. No WebKit
  // desta máquina a primeira vez que uma tela aparece custa de 180 a mais de
  // 800 ms (a fonte do sistema não existe no Linux; 04 §1.3) e isso entraria na
  // tira como atraso do app. Feita nos dois motores, para antes e depois serem
  // medidos igual. AQUECE_FLUXO=0 desliga; `aquecer: false` no fluxo também
  // (o 03b mede de propósito o custo de primeira vez que é do app).
  if (process.env.AQUECE_FLUXO !== '0' && fluxo.aquecer !== false) {
    await recarrega(p, registro, fluxo.hora);
    let m0 = null;
    try {
      if (fluxo.montar) m0 = await escopo(p, fluxo.montar);
      if (fluxo.depoisDeMontar) await fluxo.depoisDeMontar(p, m0);
      for (const passo of fluxo.passos) await executaPasso(p, cdp, passo, m0);
    } catch (e) { /* o erro aparece na passada gravada */ }
  }
  await recarrega(p, registro, fluxo.hora);
  let montado = null;
  if (fluxo.montar) montado = await escopo(p, fluxo.montar);
  if (fluxo.depoisDeMontar) await fluxo.depoisDeMontar(p, montado);
  await p.waitForTimeout(500);

  const quadros = [];
  const video = path.join(pasta, ROTULO + '.webm');
  await p.screencast.start({
    path: process.env.SEMVIDEO ? undefined : video, size: { width: 414, height: 896 }, quality: 90,
    onFrame: f => { quadros.push({ ts: f.timestamp, node: Date.now(), d: f.data }); }
  });
  await p.waitForTimeout(400);
  const passos = [];
  for (const passo of fluxo.passos) {
    try { passos.push(await executaPasso(p, cdp, passo, montado)); }
    catch (e) { passos.push({ id: passo.id, titulo: passo.titulo, erro: String(e).split('\n')[0] }); }
  }
  await p.waitForTimeout(300);
  await p.screencast.stop();
  // Guarda: com pouquíssimos quadros (uma tela parada sob "Reduzir movimento"),
  // o gravador do Playwright já esticou o último quadro até um carimbo absurdo
  // (um .webm de 6,9 horas e 527 MB em depois-0/09-copo). Se o vídeo passar do
  // intervalo dos quadros + 5 s, corta-se ali, sem recodificar.
  try {
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString().trim());
    const real = quadros.length ? (quadros[quadros.length - 1].ts - quadros[0].ts) / 1000 + 2 : 10;
    if (dur > real + 5) {
      const tmp = video.replace(/\.webm$/, '.corte.webm');
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-t', String(Math.ceil(real)), '-i', video, '-c', 'copy', tmp]);
      fs.renameSync(tmp, video);
    }
  } catch (e) { /* sem ffprobe: fica o vídeo como veio */ }

  // Carimbo do quadro → hora de parede corrigida pela latência da captura.
  const off = MOTOR === 'chromium' ? 0 : Math.min(...quadros.map(q => q.node - q.ts));
  const tc = q => q.ts + off - cal.lat;
  // Para cada passo, os quadros da janela [pousa − 400, t0 + 900], mais o último
  // quadro de antes dela (a captura só manda quadro quando algo muda: o estado
  // num instante é o último quadro entregue até ali).
  const tmp = path.join(SAIDA, '_quadros', fluxo.id + '-' + ROTULO);
  fs.rmSync(tmp, { recursive: true, force: true });
  const manifesto = { fluxo: fluxo.id, titulo: fluxo.titulo, rotulo: ROTULO, motor: MOTOR, reduz: REDUZ, dpr: DPR, segura: SEGURA, dedo: DEDO,
                      calibracao: cal, url: URL_APP, video: path.basename(video), quadrosNoVideo: quadros.length, passos: [] };
  passos.forEach((ps, i) => {
    const m = Object.assign({}, ps);
    if (ps.t0 == null) { manifesto.passos.push(m); return; }
    const ini = (ps.pousa || ps.t0) - 400, fim = ps.t0 + 900;
    const dentro = [];
    let ultimoAntes = null;
    quadros.forEach((q, k) => { const t = tc(q); if (t < ini) ultimoAntes = k; else if (t <= fim) dentro.push(k); });
    const lista = (ultimoAntes != null ? [ultimoAntes] : []).concat(dentro);
    const dir = path.join(tmp, String(i + 1).padStart(2, '0') + '-' + ps.id);
    fs.mkdirSync(dir, { recursive: true });
    m.quadros = lista.map((k, j) => {
      const arq = path.join(dir, String(j).padStart(3, '0') + '.jpg');
      fs.writeFileSync(arq, quadros[k].d);
      return { arq, t: Math.round((tc(quadros[k]) - ps.t0) * 10) / 10 };
    });
    m.pousaRel = ps.pousa != null ? Math.round((ps.pousa - ps.t0) * 10) / 10 : null;
    // Onde o zero do passo cai no vídeo (o vídeo começa no primeiro quadro da
    // captura): é por aqui que o lado a lado alinha antes e depois no toque.
    m.t0NoVideoMs = quadros.length ? Math.round(ps.t0 - tc(quadros[0])) : null;
    m.tira = path.join(pasta, String(i + 1).padStart(2, '0') + '-' + ps.id + '-' + ROTULO + '.png');
    manifesto.passos.push(m);
  });
  const arqMan = path.join(pasta, 'medidas-' + ROTULO + '.json');
  fs.writeFileSync(arqMan, JSON.stringify(manifesto, null, 1));
  // As tiras e as medidas quadro a quadro.
  execFileSync(PY, [path.join(AQUI, 'revisor-tiras.py'), 'tiras', arqMan], { stdio: 'inherit' });
  if (!process.env.QUADROS) fs.rmSync(tmp, { recursive: true, force: true });
  return { arq: arqMan, passos: passos.map(x => x.id + (x.erro ? ' ERRO ' + x.erro : '')) };
}
