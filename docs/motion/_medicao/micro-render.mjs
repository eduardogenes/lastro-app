// Micro-interações · o render() do app preserva os nós que um movimento
// precisaria? E o que acontece na tela no toque da série, da régua, do RIR,
// do teclado, do "+ série", do "Pular" e do "+1 copo".
//
// Para cada elemento: marca o nó com uma propriedade JS, dispara a ação e
// confere se o nó que está na tela depois é O MESMO (transição CSS dispara) ou
// um nó novo (animação CSS recomeça, transição não dispara).
//
// Uso:
//   python3 -m http.server 4723 -d dist &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/micro-render.mjs http://localhost:4723/ docs/motion/_medicao/shots/micro
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const OUT = process.argv[3];
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);

// histórico da semana passada, como no modo.mjs do coordenador
await ev(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const P = treino('A'); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:'A', t:t, sid:t, dur:3600000, fim:'manual' }, { day:'HX', t:t+5*DIA, sid:t+5*DIA, dur:3600000, fim:'manual' }];
  diaDeComida().cadencia = 'treino';
  CTX.vaiPara('agora'); render();
`);
await p.waitForTimeout(300);
await ev(`CTX.abreTreinoDeHoje(); toggle(0); render();`);
await p.waitForTimeout(300);

// marca: põe um número de série em cada nó vigiado
const marca = () => p.evaluate(() => {
  let n = 0;
  const q = s => document.querySelector(s);
  const alvos = {
    cartao: q('[data-ex="0"]'), carga: q('#w0_0'), rep: q('#r0_0'), rir: q('#q0_0'),
    linha: q('.setrow:not(.sethead)'), daymeta: q('#daymeta'),
    daymetaTexto: q('#daymeta') && q('#daymeta').firstChild,
    relogio: q('#relogio'), timer: q('#timer'), tfill: q('#tfill'), toast: q('#toast'),
    maisSerie: q('.ex-mais')
  };
  window.__marcas = {};
  for (const k in alvos) if (alvos[k]) { alvos[k].__m = ++n; window.__marcas[k] = n; }
  return Object.keys(window.__marcas);
});
const confere = (rotulo) => p.evaluate((rotulo) => {
  const q = s => document.querySelector(s);
  const agora = {
    cartao: q('[data-ex="0"]'), carga: q('#w0_0'), rep: q('#r0_0'), rir: q('#q0_0'),
    linha: q('.setrow:not(.sethead)'), daymeta: q('#daymeta'),
    daymetaTexto: q('#daymeta') && q('#daymeta').firstChild,
    relogio: q('#relogio'), timer: q('#timer'), tfill: q('#tfill'), toast: q('#toast'),
    maisSerie: q('.ex-mais')
  };
  const r = {};
  for (const k in window.__marcas) {
    const el = agora[k];
    r[k] = !el ? 'sumiu' : el.__m === window.__marcas[k] ? 'mesmo' : 'NOVO';
  }
  return { rotulo, r };
}, rotulo);

const linhas = [];
// 1 · um render() sem mudança nenhuma (é o que a sincronia faz duas vezes por ciclo)
await marca();
await ev(`render();`);
linhas.push(await confere('render() sem mudança'));

// 2 · abrir a régua da série 1 e tocar no 2º valor
await marca();
await ev(`abreRegua(0, 0);`);
await p.waitForTimeout(100);
const antesRegua = await p.evaluate(() => {
  const r = document.querySelector('.ex-mais'); const s = document.querySelectorAll('.setrow')[2];
  return { maisY: r ? Math.round(r.getBoundingClientRect().top) : null, linha2Y: s ? Math.round(s.getBoundingClientRect().top) : null,
           reguaH: Math.round(document.querySelector('.regua').getBoundingClientRect().height) };
});
await p.screenshot({ path: OUT + '/render-1-regua-aberta.png' });
const t0 = await p.evaluate(() => performance.now());
const reguaV = await p.$$('.regua-v');
await reguaV[1].click();
const depois = await p.evaluate(() => {
  const r = document.querySelector('.ex-mais'); const s = document.querySelectorAll('.setrow')[2];
  return { maisY: r ? Math.round(r.getBoundingClientRect().top) : null, linha2Y: s ? Math.round(s.getBoundingClientRect().top) : null,
           rep: document.querySelector('#r0_0').textContent, timerOn: document.querySelector('#timer').classList.contains('on'),
           anunciado: document.querySelector('#serie-dita').textContent,
           daymeta: document.querySelector('#daymeta').textContent };
});
linhas.push(await confere('toque na régua (registra a série 1)'));
await p.screenshot({ path: OUT + '/render-2-serie-guardada.png' });

// 3 · RIR: abrir e escolher
await marca();
await ev(`abreRir(0, 0);`);
await p.waitForTimeout(50);
const rirop = await p.$$('.rirop'); await rirop[2].click();
linhas.push(await confere('RIR: abrir e escolher 2'));

// 4 · teclado: carga da série 2, digitar 4 e 5
await marca();
await ev(`abreTecladoDeCarga(0, 1);`);
await p.waitForTimeout(50);
await p.click('[data-a="tcl-4"]'); await p.click('[data-a="tcl-5"]');
linhas.push(await confere('teclado: carga da série 2, "4" e "5"'));
await ev(`fechaTeclado();`);

// 5 · "+ série"
await marca();
const contaAntes = await p.evaluate(() => document.querySelector('#daymeta').textContent);
await p.click('.ex-mais');
await p.waitForTimeout(50);
linhas.push(await confere('"+ série"'));
const contaDepois = await p.evaluate(() => window.__escopo(`
  ({ tela: document.querySelector('#daymeta').textContent,
     dado: seriesFeitasHoje(view.day) + '/' + treino(view.day).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) })`));
await ev(`view.regua = null; render();`);

// 6 · o contador de séries depois de uma mudança que NÃO passa por atualizaEstado
await ev(`mudaSeries(0, 1);`);
await p.waitForTimeout(50);
const contaMuda = await p.evaluate(() => window.__escopo(`
  ({ tela: document.querySelector('#daymeta').textContent,
     dado: seriesFeitasHoje(view.day) + '/' + treino(view.day).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) })`));
await ev(`mudaSeries(0, -1); mudaSeries(0, -1);`);
await p.waitForTimeout(50);

// 7 · Pular (no cartão aberto) — onde fica o dedo depois?
await ev(`toggle(1); render();`);
await p.waitForTimeout(100);
const pular = await p.$('[data-ex="1"] .exacoes .histbtn:nth-child(2)');
const bx = await pular.boundingBox();
await marca();
await pular.click();
await p.waitForTimeout(150);
const sobOdedo = await p.evaluate(({ x, y }) => {
  const el = document.elementFromPoint(x, y);
  return el ? (el.className || el.tagName) + ' · ' + (el.textContent || '').trim().slice(0, 40) : null;
}, { x: bx.x + bx.width / 2, y: bx.y + bx.height / 2 });
linhas.push(await confere('Pular o exercício 2'));
await p.screenshot({ path: OUT + '/render-3-pulado.png' });

console.log(JSON.stringify({ erros, antesRegua, depois, contaAntes, contaDepois, contaMuda, sobOdedo, pularEm: bx }, null, 1));
for (const l of linhas) console.log(l.rotulo.padEnd(42), JSON.stringify(l.r));
await b.close();
