// Navegação HOJE (commit a22b09d): o que acontece em cada troca, sem mudar nada.
//
// Mede, para cada camada: a rolagem antes de entrar, depois de entrar e depois
// de sair (pelo botão do app e pelo Voltar do sistema); a altura da página de
// cada lado (a devolução da rolagem só acerta se a página de destino já for a
// que está no DOM quando `scrollTo` roda); a profundidade do histórico; se a
// barra de abas e o `main` são o MESMO nó depois de trocar de aba; e o que o
// CSS computa como transição em cada peça que muda.
//
//   python3 -m http.server 4722 -d dist &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/navegacao-hoje.mjs http://localhost:4722/ docs/motion/_medicao/shots/navegacao
//
// Com REDUZ=1 roda com `prefers-reduced-motion: reduce`.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';

const URL = process.argv[2] || 'http://localhost:4722/';
const OUT = process.argv[3] || 'docs/motion/_medicao/shots/navegacao';
const b = await chromium.launch({ executablePath: process.env.CHROME });
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
const estado = () => p.evaluate(() => ({
  y: Math.round(scrollY),
  altura: document.documentElement.scrollHeight,
  maxY: document.documentElement.scrollHeight - innerHeight,
  hist: history.length,
  prof: history.state && history.state.lastro,
  camadas: window.__escopo('camadasAbertas(view).join(",")'),
  travado: document.body.classList.contains('ins-travado'),
  bodyTop: document.body.style.top
}));

// Um registro com volume: sessões, séries, pesos e cardio, para as abas terem
// rolagem de verdade.
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
  S.cardio = [{ t: t(1)+3600000, m: 'esteira', min: 30, i: 'moderado' }];
  CTX.vaiPara('agora'); render();
`);
await pausa(400);

const r = { erros, telas: {}, casos: {}, troca: {} };

// 1. Altura de cada aba.
for (const aba of ['agora', 'dias', 'corpo', 'semana', 'prescricao']) {
  await E(`CTX.vaiPara('${aba}');`); await pausa(200);
  r.telas[aba] = await estado();
}

// 2. Trocar de aba: o que persiste e o que o CSS anima.
await E(`CTX.vaiPara('agora');`); await pausa(200);
await p.evaluate(() => { document.querySelector('.ins-tabbar').__marca = 1; document.querySelector('main').__marca = 1; });
await p.evaluate(() => window.scrollTo(0, 600));
await E(`CTX.vaiPara('semana');`);
r.troca = await p.evaluate(() => {
  const ind = document.querySelector('.ins-tab-ind');
  const cs = getComputedStyle(ind);
  return {
    mesmaBarra: document.querySelector('.ins-tabbar').__marca === 1,
    mesmoMain: document.querySelector('main').__marca === 1,
    yDepois: Math.round(scrollY),
    indicador: { transition: cs.transitionProperty + ' ' + cs.transitionDuration + ' ' + cs.transitionTimingFunction, left: ind.style.left },
    folha: null
  };
});
await pausa(300);

// 3. A devolução da rolagem: entra no destino a partir do FUNDO da aba e sai.
async function caso(nome, aba, abre, fechaApp) {
  const o = {};
  await E(`CTX.vaiPara('${aba}');`); await pausa(200);
  const st0 = await estado();
  await p.evaluate(y => window.scrollTo(0, y), st0.maxY);
  o.antes = await estado();
  await E(abre); await pausa(250);
  o.dentro = await estado();
  await p.screenshot({ path: `${OUT}/hoje-${nome}-dentro.png` });
  await E(fechaApp); await pausa(250);
  o.saiuPeloBotao = await estado();
  // de novo, saindo pelo Voltar do sistema
  await p.evaluate(y => window.scrollTo(0, y), o.antes.y);
  await E(abre); await pausa(250);
  await p.evaluate(() => history.back()); await pausa(400);
  o.saiuPeloVoltar = await estado();
  r.casos[nome] = o;
}
await caso('ajustes', 'agora', 'CTX.abreAjustes();', 'CTX.fechaAjustes();');
await caso('modo', 'agora', `view.day='A'; abreModo(); render();`, 'CTX.fechaModoDeSessao();');
await caso('modo-de-dias', 'dias', `view.day='A'; abreModo(); render();`, 'CTX.fechaModoDeSessao();');
await caso('programa', 'prescricao', 'CTX.abrePrograma();', 'fecharPrograma();');
await caso('evolucao', 'corpo', 'CTX.abreEvolucao();', 'CTX.fechaEvolucao();');
// o dia aberto: pelo toque na primeira célula com registro
await caso('dia', 'dias',
  `(function(){ const c=[].slice.call(document.querySelectorAll('button.dc')).filter(function(x){return !x.disabled && !x.classList.contains('hoje');}); c[c.length-1].click(); })();`,
  'CTX.fechaDia();');

// 4. Folhas: abrir, empilhar três, trocar a do topo, fechar.
await E(`CTX.vaiPara('agora');`); await pausa(200);
await p.evaluate(() => window.scrollTo(0, 500));
const f = {};
f.antes = await estado();
await E(`CTX.abreSeletorDeDia();`); await pausa(300);
f.uma = await estado();
f.css = await p.evaluate(() => {
  const fo = document.querySelector('.ins-folha'), veu = document.querySelector('.ins-veu');
  const a = getComputedStyle(fo), v = getComputedStyle(veu);
  return { folha: a.transitionProperty + ' ' + a.transitionDuration + ' / anim ' + a.animationName,
           veu: v.transitionProperty + ' ' + v.transitionDuration + ' / anim ' + v.animationName + ' / fundo ' + v.backgroundColor };
});
await p.screenshot({ path: `${OUT}/hoje-folha-1.png` });
await E(`CTX.fechaFolha();`); await pausa(300);
f.fechou = await estado();
// a pilha de três, pelo caminho real da refeição: refeição → ··· (editar) → seletor
await E(`const r0 = planoDeComida()[0]; CTX.abreFolha({ k:'refeicao', id: r0.id }); CTX.abreFolha({ k:'editaRefeicao', id: r0.id }); CTX.abreFolha({ k:'seletor', ref: r0.id, idx: 0 });`);
await pausa(400);
f.tres = await estado();
f.veus = await p.evaluate(() => document.querySelectorAll('.ins-veu').length);
await p.screenshot({ path: `${OUT}/hoje-folha-3.png` });
await E(`CTX.trocaFolha({ k:'editaAlimento', id: null });`); await pausa(300);
f.trocou = await estado();
await p.screenshot({ path: `${OUT}/hoje-folha-troca.png` });
await p.evaluate(() => history.back()); await pausa(300);
f.voltar1 = await estado();
await E(`CTX.fechaTudo();`); await pausa(300);
f.fechouTudo = await estado();
r.folhas = f;

// 5. Telas que ficam por baixo: a aba continua montada sob uma tela cheia?
await E(`CTX.vaiPara('agora'); CTX.abreAjustes();`); await pausa(200);
r.sobTelaCheia = await p.evaluate(() => ({
  main: document.querySelectorAll('main').length,
  tabbar: !!document.querySelector('.ins-tabbar'),
  cabecalhoAgora: !!document.querySelector('.ag-cab')
}));
await E(`CTX.fechaAjustes();`);

// 6. O modo aberto pela FAIXA, do fundo do Corpo (página mais alta que o modo):
//    `fechaModoDeSessao` devolve a rolagem ANTES do render, com o modo ainda no
//    DOM — se o modo for mais baixo que a posição guardada, o navegador corta.
await E(`const ag = Date.now() - 1800000;
  S.sessao = { day:'A', inicio: ag, ultima: Date.now() - 60000, sid: ag, manual: 1, pausas: [], pulados: [] };
  S.done.push({ day:'A', t: ag, sid: ag, ini: 'manual' }); render();`);
for (const aba of ['corpo', 'semana']) {
  const o = {};
  await E(`CTX.vaiPara('${aba}');`); await pausa(200);
  const st0 = await estado();
  await p.evaluate(y => window.scrollTo(0, y), st0.maxY);
  o.antes = await estado();
  await p.click('.ins-faixa'); await pausa(300);
  o.dentro = await estado();
  await p.click('.ins-modo-sair'); await pausa(300);
  o.saiuPelaSeta = await estado();
  await p.evaluate(y => window.scrollTo(0, y), o.antes.y);
  await p.click('.ins-faixa'); await pausa(300);
  await p.evaluate(() => history.back()); await pausa(400);
  o.saiuPeloVoltar = await estado();
  r.casos['faixa-' + aba] = o;
}

console.log(JSON.stringify(r, null, 1));
await b.close();
