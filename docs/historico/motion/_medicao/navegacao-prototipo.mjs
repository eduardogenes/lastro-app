// Protótipo de coreografia da navegação, SEM tocar em `src/`.
//
// Injeta na página (pelo `window.__escopo`, que avalia no escopo do bundle) um
// `render()` que, quando a pilha de camadas ou a aba mudam, desenha dentro de
// `document.startViewTransition`, e um CSS de prova com o modelo espacial do
// documento 02-navegacao.md (aba: deslocamento curto; tela cheia: chega da
// direita por cima, o lugar recua; folha: sobe; Voltar: o inverso). Mede:
//
//   1. o tempo do toque até o desenho novo (o "update") e até o fim;
//   2. se a posição de leitura volta exata (inclusive o caso que hoje corta:
//      modo aberto pela faixa do fundo do Corpo);
//   3. se nasce rolagem horizontal ou a viewport muda de largura/escala durante
//      um deslocamento para a direita (a armadilha do translateX(+));
//   4. se um toque NO MEIO da transição chega ao app (com e sem
//      `::view-transition { pointer-events: none }`);
//   5. com LENTO=1, capturas a 25 %, 50 % e 75 % de cada transição.
//
// Também mede a alternativa por classes: `main` animado em translateX(+44px)
// com e sem o `overflow-x: clip` do body.
//
//   MOTOR=chromium|webkit  DUR=240  LENTO=1
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/navegacao-prototipo.mjs http://localhost:4722/ docs/motion/_medicao/shots/navegacao
//
// WebKit: o MiniBrowser do Playwright precisa achar `libevent` em
// `~/.cache/ms-playwright/webkit-deps-noble`; passe um invólucro em WK= que
// acrescente esse caminho ao LD_LIBRARY_PATH (o do cache o sobrescreve).
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';

const URL = process.argv[2] || 'http://localhost:4722/';
const OUT = process.argv[3] || 'docs/motion/_medicao/shots/navegacao';
const MOTOR = process.env.MOTOR || 'chromium';
const LENTO = !!process.env.LENTO;
const DUR = LENTO ? 1600 : Number(process.env.DUR || 240);
// RAIZ=0: a raiz NÃO é capturada; só as peças da página têm nome (o toque
// atravessa a camada da transição e chega ao app).
const RAIZ = process.env.RAIZ !== '0';
const G = RAIZ ? ['root'] : ['pagina', 'cabecalho', 'tabbar'];
/** Uma regra para cada grupo da página: `nav` é o sentido, `lado` old|new. */
const regra = (nav, lado, corpo) => G.map(g => `html[data-nav="${nav}"]::view-transition-${lado}(${g})`).join(', ') + ` { ${corpo} }`;
const tipo = MOTOR === 'webkit' ? webkit : chromium;
const b = await tipo.launch({ executablePath: MOTOR === 'webkit' ? process.env.WK : process.env.CHROME });
const ctx = await b.newContext({
  viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  reducedMotion: process.env.REDUZ ? 'reduce' : 'no-preference'
});
const p = await ctx.newPage();
const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(12, 10, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(URL); await p.waitForTimeout(800);
const E = c => p.evaluate(x => window.__escopo(x), c);
const pausa = ms => p.waitForTimeout(ms);
const pref = `${OUT}/proto-${MOTOR}${RAIZ ? '' : '-semraiz'}${LENTO ? '-lento' : ''}`;

// O mesmo registro do navegacao-hoje.mjs, com uma sessão aberta (para a faixa).
await E(`
  const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
  const t = function (k) { return base.getTime() - k*DIA; };
  S.logs = {}; S.done = [];
  ['A','B','C','D','E'].forEach(function (L, j) {
    for (let sem = 0; sem < 4; sem++) {
      const tt = t(1 + j + sem*7);
      const P = treino(L); if (!P) return;
      P.ex.forEach(function (ex, i) {
        const sets = []; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]);
        (S.logs[ex.id] = S.logs[ex.id] || []).push({ t: tt+i*600000, sid: tt, sets: sets });
      });
      S.done.push({ day: L, t: tt, sid: tt, dur: 4000000, fim: 'manual' });
    }
  });
  S.body.peso = []; for (let k=1;k<30;k++) S.body.peso.push({ t: t(k), v: 74 - k*0.03 });
  const ag = Date.now() - 1800000;
  S.sessao = { day:'A', inicio: ag, ultima: Date.now() - 60000, sid: ag, manual: 1, pausas: [], pulados: [] };
  S.done.push({ day:'A', t: ag, sid: ag, ini: 'manual' });
  CTX.vaiPara('agora'); render();
`);
await pausa(300);

// ---- O CSS de prova. Tudo dentro do portão por adesão. ----
await p.addStyleTag({ content: `
@media (prefers-reduced-motion: no-preference) {
  :root { --vt: ${DUR}ms; --vt-curta: ${Math.round(DUR * 0.75)}ms; }
  ::view-transition { pointer-events: var(--vt-pe, none); }
  /* Peças fixas que NÃO são do lugar: ficam paradas durante qualquer troca. */
  #timer { view-transition-name: cronometro; }
  .ins-faixa { view-transition-name: faixa; }
  ${RAIZ ? 'html[data-nav^="aba"] .ins-tabbar { view-transition-name: tabbar; }' : ''}
  ::view-transition-group(*) { animation-duration: var(--vt); animation-timing-function: var(--ins-ease); }
  ::view-transition-old(*), ::view-transition-new(*) { animation-duration: var(--vt); }

  /* Tela cheia ENTRA: chega da direita por cima; o lugar recua um terço. */
  ${regra('entra', 'old', 'animation: vt-recua var(--vt) var(--ins-ease) both;')}
  ${regra('entra', 'new', 'animation: vt-da-direita var(--vt) var(--ins-ease) both;')}
  /* SAI (Voltar): o inverso exato. A de cima volta para a direita, por cima. */
  ${regra('sai', 'old', 'animation: vt-para-direita var(--vt) var(--ins-ease) both; z-index: 1;')}
  ${regra('sai', 'new', 'animation: vt-avanca var(--vt) var(--ins-ease) both;')}
  /* ABA: deslocamento curto no sentido do indicador, e cruzamento. */
  ${regra('aba-dir', 'old', 'animation: vt-some var(--vt-curta) linear both;')}
  ${regra('aba-dir', 'new', 'animation: vt-aba-da-direita var(--vt-curta) var(--ins-ease) both;')}
  ${regra('aba-esq', 'old', 'animation: vt-some var(--vt-curta) linear both;')}
  ${regra('aba-esq', 'new', 'animation: vt-aba-da-esquerda var(--vt-curta) var(--ins-ease) both;')}
  /* sem raiz: a barra de abas é do lugar nas trocas de camada, mas fica parada entre abas */
  ${RAIZ ? '' : 'html[data-nav^="aba"]::view-transition-old(tabbar), html[data-nav^="aba"]::view-transition-new(tabbar) { animation: none; }'}
  ${RAIZ ? '' : ':root { view-transition-name: none; } #app > main, #app > .tc, #app > .ins-modo { view-transition-name: pagina; } .ag-cab { view-transition-name: cabecalho; } .ins-tabbar { view-transition-name: tabbar; }'}
  /* FOLHA: o lugar não se mexe; a folha sobe, o véu escurece. */
  ${G.map(g => `html[data-nav^="folha"]::view-transition-old(${g}), html[data-nav^="folha"]::view-transition-new(${g})`).join(', ')} { animation: none; }
  ::view-transition-new(folha-0):only-child, ::view-transition-new(folha-1):only-child, ::view-transition-new(folha-2):only-child { animation: vt-sobe var(--vt) var(--ins-ease) both; }
  ::view-transition-old(folha-0):only-child, ::view-transition-old(folha-1):only-child, ::view-transition-old(folha-2):only-child { animation: vt-desce var(--vt) var(--ins-ease) both; }
  ::view-transition-new(veu-0):only-child, ::view-transition-new(veu-1):only-child, ::view-transition-new(veu-2):only-child { animation: vt-aparece var(--vt-curta) linear both; }
  ::view-transition-old(veu-0):only-child, ::view-transition-old(veu-1):only-child, ::view-transition-old(veu-2):only-child { animation: vt-some var(--vt-curta) linear both; }
}
@keyframes vt-da-direita { from { transform: translateX(100vw); } }
@keyframes vt-para-direita { to { transform: translateX(100vw); } }
@keyframes vt-recua { to { transform: translateX(-30vw); } }
@keyframes vt-avanca { from { transform: translateX(-30vw); } }
@keyframes vt-aba-da-direita { from { transform: translateX(24px); opacity: 0; } }
@keyframes vt-aba-da-esquerda { from { transform: translateX(-24px); opacity: 0; } }
@keyframes vt-some { to { opacity: 0; } }
@keyframes vt-aparece { from { opacity: 0; } }
@keyframes vt-sobe { from { transform: translateY(100%); } }
@keyframes vt-desce { to { transform: translateY(100%); } }
` });

// ---- O render que anima. Um ponto só, no casco. ----
await E(`(function () {
  const pinta = render, rola = window.scrollTo.bind(window);
  const ORDEM = ['agora','dias','corpo','semana','prescricao'];
  const M = window.__marcas = [];
  let pendente = false, rolagem = null, ultima = assinatura();
  function assinatura() {
    return { c: camadasAbertas(view), aba: view.aba || 'agora',
             folhas: (view.pilha || []).map(function (f) { return f.k; }).join(',') };
  }
  function sentido(a, b) {
    const fa = a.c.filter(function (x) { return x.indexOf('folha') === 0; }).length;
    const fb = b.c.filter(function (x) { return x.indexOf('folha') === 0; }).length;
    const da = a.c.length - fa, db = b.c.length - fb;
    if (db > da) return 'entra';
    if (db < da) return 'sai';
    if (fb > fa) return 'folha-sobe';
    if (fb < fa) return 'folha-desce';
    if (a.folhas !== b.folhas) return 'folha-troca';
    if (a.aba !== b.aba && !db) return ORDEM.indexOf(b.aba) > ORDEM.indexOf(a.aba) ? 'aba-dir' : 'aba-esq';
    return null;
  }
  // As folhas recebem nome pela POSIÇÃO na pilha (o nível 50 se repete).
  function nomeia() {
    [].slice.call(document.querySelectorAll('#app > .ins-folha-w')).forEach(function (w, i) {
      const f = w.querySelector('.ins-folha'), v = w.querySelector('.ins-veu');
      if (f) f.style.viewTransitionName = 'folha-' + i;
      if (v) v.style.viewTransitionName = 'veu-' + i;
    });
  }
  // Rolagem pedida enquanto o desenho novo não entrou fica para depois dele.
  window.scrollTo = function () { if (pendente) { rolagem = arguments; return; } return rola.apply(null, arguments); };
  entraNoDestino = function (k) { scrollDoDestino[k] = window.scrollY; rolagem = [0, 0]; };
  saiDoDestino = function (k) {
    const y = scrollDoDestino[k] || 0; delete scrollDoDestino[k];
    rolagem = [{ top: y, behavior: 'instant' }];
    if (!pendente) queueMicrotask(function () { if (rolagem && !pendente) { const r = rolagem; rolagem = null; rola.apply(null, r); } });
  };
  function aplicaRolagem() { if (rolagem) { const r = rolagem; rolagem = null; rola.apply(null, r); } }
  render = function () {
    if (pendente) return;                         // o desenho que vem já lê o view mais novo
    const agora = assinatura(), s = sentido(ultima, agora);
    ultima = agora;
    const pode = s && document.startViewTransition &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!pode) { pinta(); nomeia(); aplicaRolagem(); return; }
    document.documentElement.dataset.nav = s;
    const t0 = performance.now(), m = { s: s };
    M.push(m);
    pendente = true;
    const vt = document.startViewTransition(function () {
      pendente = false;
      m.update = Math.round(performance.now() - t0);
      pinta(); nomeia(); aplicaRolagem();
    });
    window.__vt = vt;
    vt.ready.then(function () { m.ready = Math.round(performance.now() - t0); }, function (e) { m.erroReady = String(e); });
    vt.finished.then(function () {
      m.fim = Math.round(performance.now() - t0);
      if (window.__vt === vt) delete document.documentElement.dataset.nav;
    });
  };
  // O toque no meio de uma transição não espera: pula para o fim e segue.
  // Durante a transição o conteúdo capturado não recebe toque (o alvo vira o
  // #app ou o html); com __redespacha, o clique que nasceu nesse vazio é
  // reenviado ao que está de fato sob o dedo depois do pulo.
  let pulou = false;
  document.addEventListener('pointerdown', function () {
    if (!window.__pulaNoToque || !document.documentElement.dataset.nav) return;
    try { window.__vt.skipTransition(); pulou = true; } catch (e) {}
  }, true);
  document.addEventListener('click', function (e) {
    if (!pulou) return; pulou = false;
    if (!window.__redespacha) return;
    const alvo = document.elementFromPoint(e.clientX, e.clientY);
    if (alvo && alvo !== e.target && !e.target.closest('button, a, input, label')) {
      e.stopPropagation(); e.preventDefault(); window.__redespachou = (alvo.className || alvo.tagName); alvo.click();
    }
  }, true);
})();`);

const r = { motor: MOTOR, dur: DUR, raiz: RAIZ, erros, casos: {}, marcas: null, overflow: {}, toque: {}, classes: {} };
const estado = () => p.evaluate(() => ({
  y: Math.round(scrollY), camadas: window.__escopo('camadasAbertas(view).join(",")'), aba: window.__escopo('view.aba')
}));

// Amostra, a cada quadro, o que a armadilha do translateX(+) mexeria.
async function amostra(ms) {
  return p.evaluate(ms => new Promise(res => {
    const a = [], t0 = performance.now();
    (function q() {
      const de = document.documentElement, vv = window.visualViewport;
      a.push({ sw: de.scrollWidth, cw: de.clientWidth, iw: innerWidth, vvw: vv ? Math.round(vv.width) : null, esc: vv ? vv.scale : null, sx: scrollX });
      if (performance.now() - t0 < ms) requestAnimationFrame(q); else res(a);
    })();
  }), ms);
}
function resume(a) {
  return { quadros: a.length, scrollWidthMax: Math.max(...a.map(x => x.sw)), clientWidth: a[0] && a[0].cw,
           innerWidth: [...new Set(a.map(x => x.iw))], escala: [...new Set(a.map(x => x.esc))], scrollX: Math.max(...a.map(x => x.sx)) };
}
async function capturas(nome) {
  if (!LENTO) return;
  for (const f of [0.25, 0.5, 0.75]) {
    await pausa(f === 0.25 ? DUR * 0.25 : DUR * 0.25);
    await p.screenshot({ path: `${pref}-${nome}-${Math.round(f * 100)}.png` });
  }
}
async function passo(nome, codigo, opcoes = {}) {
  const antes = await estado();
  const amostrando = amostra(DUR + 200);
  if (opcoes.clique) await p.click(opcoes.clique); else await E(codigo);
  await capturas(nome);
  const a = await amostrando;
  await pausa(LENTO ? DUR : 120);
  const depois = await estado();
  r.casos[nome] = { antes, depois, overflow: resume(a) };
}

// 1. Abas
await passo('aba-dir', `CTX.vaiPara('semana');`);
await passo('aba-esq', `CTX.vaiPara('dias');`);
// 2. Ajustes a partir do fundo do Agora, e a volta
await E(`CTX.vaiPara('agora');`); await pausa(LENTO ? DUR + 100 : 300);
await p.evaluate(() => window.scrollTo(0, 99999)); await pausa(100);
await passo('entra-ajustes', `CTX.abreAjustes();`);
await passo('sai-ajustes', `CTX.fechaAjustes();`);
// 3. O modo pela faixa, do fundo do Corpo; volta pela seta e pelo Voltar
await E(`CTX.vaiPara('corpo');`); await pausa(LENTO ? DUR + 100 : 300);
await p.evaluate(() => window.scrollTo(0, 99999)); await pausa(100);
await passo('entra-modo', null, { clique: '.ins-faixa' });
await passo('sai-modo-seta', null, { clique: '.ins-modo-sair' });
await p.click('.ins-faixa'); await pausa(LENTO ? DUR + 200 : 400);
await passo('sai-modo-voltar', `history.back();`);
// 4. Folhas: uma, três, a troca do topo, Voltar
await E(`CTX.vaiPara('agora');`); await pausa(LENTO ? DUR + 100 : 300);
await passo('folha-sobe', `CTX.abreSeletorDeDia();`);
await passo('folha-desce', `CTX.fechaFolha();`);
await passo('folha-1', `const r0 = planoDeComida()[0]; CTX.abreFolha({ k:'refeicao', id: r0.id });`);
await passo('folha-2', `const r0 = planoDeComida()[0]; CTX.abreFolha({ k:'editaRefeicao', id: r0.id });`);
await passo('folha-3', `const r0 = planoDeComida()[0]; CTX.abreFolha({ k:'seletor', ref: r0.id, idx: 0 });`);
await passo('folha-troca', `CTX.trocaFolha({ k:'editaAlimento', id: null });`);
await passo('folha-voltar', `history.back();`);
await E(`CTX.fechaTudo();`); await pausa(LENTO ? DUR + 100 : 300);
r.marcas = await p.evaluate(() => window.__marcas);

// 5. O toque no meio: abre Ajustes devagar e toca no "‹ Voltar" a 40 %.
async function toqueNoMeio(pe, pula, redespacha) {
  await p.evaluate(([pe, pula, redespacha]) => {
    document.documentElement.style.setProperty('--vt-pe', pe);
    document.documentElement.style.setProperty('--vt', '1600ms');
    window.__pulaNoToque = pula; window.__redespacha = redespacha; window.__redespachou = null;
  }, [pe, pula, redespacha]);
  await E(`CTX.vaiPara('agora');`); await pausa(1800);
  await E(`CTX.abreAjustes();`); await pausa(640);
  const box = await p.evaluate(() => { const b = document.querySelector('.tc-back'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  let alvo = null;
  if (box) { alvo = await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) : null; }, box); await p.mouse.move(box.x, box.y); await p.mouse.down(); await pausa(70); await p.mouse.up(); }
  await pausa(150);
  const o = { pe, pula, redespacha, alvo, redespachou: await p.evaluate(() => window.__redespachou), camadasDepoisDoToque: await p.evaluate(() => window.__escopo('camadasAbertas(view).join(",")')) };
  await pausa(1800);
  await E(`if (view.ajustes) CTX.fechaAjustes();`); await pausa(1800);
  await p.evaluate(() => { document.documentElement.style.removeProperty('--vt-pe'); document.documentElement.style.removeProperty('--vt'); window.__pulaNoToque = false; });
  return o;
}
if (!process.env.REDUZ) {
  r.toque.semPointerEvents = await toqueNoMeio('none', false, false);
  r.toque.comPulo = await toqueNoMeio('none', true, false);
  r.toque.comPuloERedespacho = await toqueNoMeio('none', true, true);
  r.toque.padrao = await toqueNoMeio('auto', false, false);
}

// 6. A alternativa por classes: `main` vindo de translateX(+44px).
async function classes(semClip) {
  await E(`CTX.vaiPara('agora');`); await pausa(400);
  if (semClip) await p.addStyleTag({ content: 'body { overflow-x: visible !important; }' });
  const amostrando = amostra(500);
  await p.evaluate(() => document.querySelector('main').animate(
    [{ transform: 'translateX(44px)' }, { transform: 'none' }], { duration: 400, easing: 'linear' }));
  return resume(await amostrando);
}
r.classes.comClipDoBody = await classes(false);
r.classes.semClipDoBody = await classes(true);

console.log(JSON.stringify(r, null, 1));
await b.close();
