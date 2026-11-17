// A armadilha do translateX(+N), medida onde ela morde: Chromium com barra de
// rolagem CLÁSSICA (a do computador, e portanto a da bancada), não a de
// sobreposição do celular. Sem `--hide-scrollbars`, que o Playwright liga por
// padrão no modo sem janela e esconderia justamente o defeito.
//
// Para cada caso, amostra a cada quadro: a largura e a ALTURA úteis da janela
// (uma barra horizontal que nasce come altura, e tudo que está ancorado em
// baixo — barra de abas, cronômetro, faixa, toast — sobe), o scrollWidth e a
// posição da barra de abas.
//
// Resultado em a22b09d (15/10): nada muda em nenhum dos quatro casos. A barra
// clássica funciona neste Chromium (página em branco: clientWidth 399), mas o
// app a esconde em `src/base.css:198` (`::-webkit-scrollbar { display: none }`),
// e uma barra que não ocupa lugar não reflui a janela. O `overflow-x: clip` do
// body (`src/base.css:107`) é a segunda trava: com ele, nem rolagem lateral há.
// A transição de vista nem chega a aumentar o scrollWidth: os pseudo-elementos
// dela não entram no transbordo da página.
//
//   CHROME=... node docs/motion/_medicao/navegacao-armadilha.mjs http://localhost:4722/
import { chromium } from '../../../node_modules/playwright-core/index.mjs';

const URL = process.argv[2] || 'http://localhost:4722/';
const b = await chromium.launch({ executablePath: process.env.CHROME, ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--disable-features=OverlayScrollbar,OverlayScrollbars'] });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(URL + '?palco=0'); await p.waitForTimeout(800);
const E = c => p.evaluate(x => window.__escopo(x), c);

async function caso(seletor, abre, semClip, comVT) {
  await E(`CTX.vaiPara('agora'); render();`); await p.waitForTimeout(200);
  if (abre) { await E(abre); await p.waitForTimeout(200); }
  if (semClip) await p.addStyleTag({ content: 'body { overflow-x: visible !important; }' });
  return p.evaluate(([seletor, comVT]) => new Promise(res => {
    const a = [], t0 = performance.now();
    (function q() {
      const de = document.documentElement, tb = document.querySelector('.ins-tabbar');
      a.push({ cw: de.clientWidth, ch: de.clientHeight, sw: de.scrollWidth, tab: tb ? Math.round(tb.getBoundingClientRect().top) : null });
      if (performance.now() - t0 < 500) requestAnimationFrame(q);
      else res({
        quadros: a.length,
        clientWidth: [...new Set(a.map(x => x.cw))], clientHeight: [...new Set(a.map(x => x.ch))],
        scrollWidthMax: Math.max(...a.map(x => x.sw)), topoDaBarraDeAbas: [...new Set(a.map(x => x.tab))]
      });
    })();
    const el = document.querySelector(seletor);
    if (comVT) {
      const st = document.createElement('style');
      st.textContent = '::view-transition-new(root){animation:vtx 400ms linear both} @keyframes vtx{from{transform:translateX(100vw)}}';
      document.head.appendChild(st);
      document.startViewTransition(() => {});
    } else {
      el.animate([{ transform: 'translateX(44px)' }, { transform: 'none' }], { duration: 400 });
    }
  }), [seletor, comVT]);
}

const r = { erros };
r.mainComClip = await caso('main', null, false, false);
r.vtDaRaizComClip = await caso('main', null, false, true);
r.mainSemClip = await caso('main', null, true, false);
await p.reload(); await p.waitForTimeout(800);
r.vtDaRaizSemClip = await caso('main', null, true, true);
console.log(JSON.stringify(r, null, 1));
await b.close();
