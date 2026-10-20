// O RESTO DO LUGAR, como o motor o roda: o copo que enche, a forma que pousa, a
// linha do "Comi tudo" que não sai de baixo do dedo, o teclado que não rola a
// página, e a frase da abertura que só aparece quando a abertura demora.
//
// Peça 8 do motion (docs/motion/03 §4.4, §4.6, §4.7, §6, §8 itens 5 e 7;
// 01 A.5; 08 §4 e §5.1; dono, 16/10, perguntas 2 e 13). O jsdom não anima nem
// mede (`lugar.test.js` cobre ali o que é de árvore: o defeito 6 e a marca de
// recém da forma); estes casos sobem o `dist/` num Chromium, ou no WebKit com
// `LASTRO_MOTOR=webkit`, e leem os tempos e as curvas dos tokens.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador } from './navegador.js';

const DEMORADO = { timeout: 120000 };
afterAll(fechaNavegador);
const FOLGA_PX = 2;

/** O tempo e a curva de um token, como o motor os escreve. */
const token = (nav, nome) => nav.p.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), nome);
async function tempoECurva(nav) {
  const ms = v => /ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000;
  // a curva como o motor a devolve numa animação (`cubic-bezier(0.2, 0.8, 0.2, 1)`)
  const curva = await nav.p.evaluate(c => {
    const e = document.createElement('i');
    e.style.transitionTimingFunction = c;
    document.body.appendChild(e);
    const v = getComputedStyle(e).transitionTimingFunction;
    e.remove();
    return v;
  }, await token(nav, '--ins-curva'));
  return { lugar: ms(await token(nav, '--ins-dur-lugar')), dissolve: ms(await token(nav, '--ins-dur-dissolve')),
           espera: ms(await token(nav, '--ins-espera-abertura')), curva };
}

/** O Agora no topo, parado (a aba nasce dentro de uma transição de vista). */
async function noAgora(nav, y = 0) {
  await nav.E(`CTX.vaiPara('agora'); render();`);
  await nav.p.waitForFunction(() => !document.activeViewTransition && !!document.querySelector('.ag-agua'), null, { timeout: 8000 });
  await nav.p.evaluate(y => window.scrollTo(0, y), y);
  await nav.espera(150);
}

// ---------- o copo ----------

/**
 * Toca "+1 copo" e acompanha, quadro a quadro, o preenchimento de cada copo
 * (a escala vertical do `::after`) e as animações vivas, até `ms`.
 */
async function tocaOCopo(nav, sel, ms = 400) {
  const b = await nav.caixa(sel);
  await nav.p.evaluate(ms => {
    window.__copos = [];
    const t0 = performance.now();
    const passo = () => {
      const cs = [...document.querySelectorAll('.ag-copos i')];
      const sy = cs.map(c => { const m = getComputedStyle(c, '::after').transform; return m === 'none' ? 1 : new DOMMatrix(m).d; });
      // o que se move na linha da água (o ponto ao vivo do cabeçalho pulsa sem fim, e não é daqui)
      const vivas = document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest &&
        a.effect.target.closest('.ag-agua')).map(a => ({
        tipo: a.constructor.name, prop: a.transitionProperty || a.animationName, pseudo: a.effect.pseudoElement || '',
        copo: a.effect.target.closest('.ag-copos') ? cs.indexOf(a.effect.target) : -1,
        alvo: a.effect.target.getAttribute('class') || '',
        dur: a.effect.getTiming().duration, curva: a.effect.getTiming().easing }));
      window.__copos.push({ t: performance.now() - t0, sy, vivas });
      if (performance.now() - t0 < ms) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }, ms);
  await nav.toca(b.cx, b.cy);
  await nav.espera(ms + 100);
  return nav.p.evaluate(() => window.__copos);
}

test('o copo que entrou enche de baixo, em 160 ms, e só ele; o número e os ml trocam sem movimento', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const T = await tempoECurva(nav);
    await noAgora(nav);
    await nav.p.evaluate(() => document.querySelector('[data-a="agua-mais"]').scrollIntoView({ block: 'center' }));
    await nav.espera(100);
    const origem = await nav.p.evaluate(() => {
      const c = getComputedStyle(document.querySelector('.ag-copos i'), '::after');
      return { origem: c.transformOrigin, altura: c.height };
    });
    assert.strictEqual(origem.origem.split(' ')[1], origem.altura, 'o preenchimento cresce a partir da BASE do copo: ' + JSON.stringify(origem));

    for (const n of [1, 2]) {
      const q = await tocaOCopo(nav, '[data-a="agua-mais"]');
      assert.strictEqual(await nav.p.evaluate(() => document.querySelectorAll('.ag-copos i.f').length), n, n + ' copos cheios');
      const vivas = q.flatMap(x => x.vivas);
      const kinds = [...new Set(vivas.map(v => JSON.stringify(v)))].map(s => JSON.parse(s));
      assert.deepStrictEqual(kinds, [{ tipo: 'CSSTransition', prop: 'transform', pseudo: '::after', copo: n - 1, alvo: 'f',
        dur: T.lugar, curva: T.curva }], 'só o preenchimento do copo que entrou se move, no tempo e na curva do lugar: ' + JSON.stringify(kinds));
      const sy = q.map(x => x.sy[n - 1]);
      const enche = sy.slice(sy.findIndex(v => v < 0.5));
      assert.ok(enche.length && enche[0] < 0.5, 'o copo começa vazio, no quadro do toque: ' + sy.map(v => v.toFixed(2)).join(' '));
      assert.ok(enche.every((v, i) => i === 0 || v >= enche[i - 1] - 1e-6), 'só enche: ' + sy.map(v => v.toFixed(2)).join(' '));
      assert.ok(enche.filter(v => v > 0.02 && v < 0.98).length >= 3, 'enche em vários quadros, e não de uma vez: ' + sy.map(v => v.toFixed(2)).join(' '));
      assert.strictEqual(sy[sy.length - 1], 1, 'e assenta cheio');
      assert.ok(q.every(x => x.sy.every((v, i) => i === n - 1 || v === (i < n - 1 ? 1 : 0))), 'os outros copos não se mexem');
    }
    assert.ok(/Água · 2 de 14 copos/.test(await nav.p.evaluate(() => document.querySelector('.ag-agua-t').textContent)));

    // corrigir para menos esvazia pelo mesmo caminho
    await nav.p.evaluate(() => document.querySelector('[data-a="agua-corrige"]').click());
    await nav.espera(150);
    const q = await tocaOCopo(nav, '.ag-agua-c [aria-label="diminuir"]');
    const vivas = [...new Set(q.flatMap(x => x.vivas).map(v => JSON.stringify(v)))].map(s => JSON.parse(s));
    assert.deepStrictEqual(vivas, [{ tipo: 'CSSTransition', prop: 'transform', pseudo: '::after', copo: 1, alvo: '',
      dur: T.lugar, curva: T.curva }], 'esvazia o segundo copo, e só ele: ' + JSON.stringify(vivas));
    const sy = q.map(x => x.sy[1]);
    assert.ok(sy.filter(v => v > 0.02 && v < 0.98).length >= 3 && sy[sy.length - 1] === 0 &&
      sy.every((v, i) => i === 0 || v <= sy[i - 1] + 1e-6), 'esvazia de cima para baixo, em vários quadros: ' + sy.map(v => v.toFixed(2)).join(' '));
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o Agora que monta nasce com os copos cheios, parados', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await nav.E(`CTX.setAgua(5);`);
    await noAgora(nav);
    await nav.E(`CTX.vaiPara('corpo'); render();`);
    await nav.p.waitForFunction(() => !document.activeViewTransition && !document.querySelector('.ag-agua'), null, { timeout: 8000 });
    // a volta ao Agora, quadro a quadro, do toque até a aba assentar
    const q = await nav.p.evaluate(() => new Promise(ok => {
      const q = [], t0 = performance.now();
      const passo = () => {
        const cs = [...document.querySelectorAll('.ag-copos i')];
        q.push({ copos: cs.length, cheios: cs.filter(c => getComputedStyle(c, '::after').transform === 'none').length,
                 vivas: document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.ag-copos')).length });
        if (performance.now() - t0 < 700) requestAnimationFrame(passo); else ok(q);
      };
      window.__escopo(`CTX.vaiPara('agora'); render();`);
      requestAnimationFrame(passo);
    }));
    const comCopos = q.filter(x => x.copos);
    assert.ok(comCopos.length > 5, 'o Agora apareceu');
    assert.ok(comCopos.every(x => x.cheios === 5 && x.vivas === 0), 'os cinco copos já nascem cheios, e nada anima: ' + JSON.stringify(comCopos.slice(0, 4)));
  } finally { await nav.fecha(); }
});

test('com "Reduzir movimento" o copo aparece cheio, de uma vez', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    await noAgora(nav);
    await nav.p.evaluate(() => document.querySelector('[data-a="agua-mais"]').scrollIntoView({ block: 'center' }));
    await nav.espera(100);
    const q = await tocaOCopo(nav, '[data-a="agua-mais"]', 250);
    assert.deepStrictEqual(q.flatMap(x => x.vivas), [], 'nada anima');
    const sy = q.map(x => x.sy[0]);
    const i = sy.findIndex(v => v > 0);
    assert.ok(i >= 0 && sy.slice(i).every(v => v === 1), 'do vazio ao cheio num quadro: ' + sy.map(v => v.toFixed(2)).join(' '));
  } finally { await nav.fecha(); }
});

// ---------- a refeição marcada pela linha ----------

/** As animações vivas de forma de refeição, com onde a forma está. */
const FORMAS = `(function () {
  return document.getAnimations()
    .filter(function (a) { return a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('df'); })
    .map(function (a) {
      const props = [];
      a.effect.getKeyframes().forEach(function (k) { Object.keys(k).forEach(function (p) {
        if (['offset', 'computedOffset', 'easing', 'composite'].indexOf(p) < 0 && props.indexOf(p) < 0) props.push(p);
      }); });
      const l = a.effect.target.closest('.ag-l');
      return { nome: a.animationName, dur: a.effect.getTiming().duration, curva: (a.effect.getKeyframes()[0] || {}).easing,
               props: props.sort(), onde: l ? l.querySelector('.ag-l-b').getAttribute('data-a') : a.effect.target.parentNode.className,
               estado: a.playState };
    });
})()`;

/** Abre a linha `id` com um toque e devolve onde estão a linha e o botão `k`. */
async function abreALinha(nav, id, k) {
  const l = await nav.caixa('[data-a="linha-' + id + '"]');
  await nav.toca(l.cx, l.cy);
  await nav.espera(200);
  return { linha: await nav.caixa('[data-a="linha-' + id + '"]'), botao: await nav.caixa('[data-a="' + k + '-' + id + '"]') };
}

test('a forma da linha marcada pousa em 160 ms, e um render() no meio não a reinicia; a da leitura de volta não se move', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const T = await tempoECurva(nav);
    await noAgora(nav);
    assert.deepStrictEqual(await nav.E(FORMAS), [], 'abrir o Agora não faz nada pousar');
    const { botao } = await abreALinha(nav, 'almoco', 'tudo');
    assert.ok(botao, 'a linha do almoço abriu com "Comi tudo"');
    const r = await nav.p.evaluate(async (FORMAS) => {
      const formas = () => window.__escopo(FORMAS);
      document.querySelector('[data-a="tudo-almoco"]').click();
      const logo = formas();
      const anim = document.getAnimations().filter(a => a.effect.target.classList && a.effect.target.classList.contains('df'))[0];
      await new Promise(ok => setTimeout(ok, 60));
      const t1 = anim && anim.currentTime;
      window.__escopo('render()');
      const mesma = document.getAnimations().indexOf(anim) >= 0;
      const t2 = anim && anim.currentTime;
      return { logo, t1, t2, mesma, depois: formas(), volta: !!document.querySelector('.ag-volta .df') };
    }, FORMAS);
    assert.ok(r.volta, 'a leitura de volta nasceu, com a forma dela');
    assert.deepStrictEqual(r.logo, [{ nome: 'ins-pousa', dur: T.lugar, curva: T.curva, props: ['opacity', 'translate'],
      onde: 'linha-almoco', estado: 'running' }], 'uma forma pousa, a da linha tocada: ' + JSON.stringify(r.logo));
    assert.ok(r.mesma && r.t1 > 0 && r.t2 >= r.t1, 'o render() no meio reiniciou o pouso: ' + r.t1 + ' → ' + r.t2);
    assert.strictEqual(r.depois.length, 1, 'o render() no meio fez outra forma pousar: ' + JSON.stringify(r.depois));
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('com "Reduzir movimento" a forma não se desloca: só acende, em 120 ms', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    const T = await tempoECurva(nav);
    await noAgora(nav);
    await abreALinha(nav, 'almoco', 'metade');
    const r = await nav.p.evaluate(F => { document.querySelector('[data-a="metade-almoco"]').click(); return window.__escopo(F); }, FORMAS);
    assert.deepStrictEqual(r, [{ nome: 'ins-acende', dur: T.dissolve, curva: T.curva, props: ['opacity'], onde: 'linha-almoco', estado: 'running' }]);
  } finally { await nav.fecha(); }
});

/**
 * Os quadros do COMPOSITOR (`page.screencast`) de `acao` até `ms` depois, na
 * ordem do carimbo — sob carga o screencast entrega quadros fora de ordem
 * (docs/motion/09, peça 6) —, decodificados.
 */
async function quadrosDoCompositor(nav, acao, ms) {
  const { jpegjs } = await import('../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
  const q = [];
  await nav.p.screencast.start({ size: { width: 414, height: 896 }, quality: 90, onFrame: f => { q.push({ ts: f.timestamp, d: f.data }); } });
  await nav.espera(300);
  const antes = q.length;
  await acao();
  await nav.espera(ms);
  await nav.p.screencast.stop();
  q.sort((a, b) => a.ts - b.ts);
  return q.slice(Math.max(0, antes - 1)).map(f => jpegjs.decode(f.d, { useTArray: true }));
}
/** A faixa de uma caixa (`x0..x1`, `y0..y1`, em pt) de um quadro, em cinza. */
function faixa(im, { x0, x1, y0, y1 }) {
  const E = im.width / 414, out = [];
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) {
    const o = (Math.round(y * E) * im.width + Math.round(x * E)) * 4;
    out.push((im.data[o] + im.data[o + 1] + im.data[o + 2]) / 3);
  }
  return out;
}
const distancia = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;

for (const [nome, rolagem, k] of [['com a página no topo', 0, 'tudo'], ['com a página rolada', 200, 'tudo'], ['"Metade", no topo', 0, 'metade']]) {
  test('"' + (k === 'tudo' ? 'Comi tudo' : 'Metade') + '" pela linha, ' + nome + ': a linha fica onde estava, e o retorno do toque se vê nela', DEMORADO, async () => {
    const nav = await abreNavegador();
    try {
      await noAgora(nav, rolagem);
      const { linha, botao } = await abreALinha(nav, 'almoco', k);
      assert.strictEqual(await nav.caixa('.ag-volta'), null, 'pré-condição: sem leitura de volta');
      await nav.toca(botao.cx, botao.cy);
      await nav.espera(300);

      assert.ok(await nav.caixa('.ag-volta'), 'a leitura de volta nasceu acima da linha — o que a fazia descer');
      const depois = await nav.caixa('[data-a="linha-almoco"]');
      assert.ok(Math.abs(depois.y - linha.y) <= FOLGA_PX,
        'a linha saiu do lugar: y ' + linha.y + ' → ' + depois.y + ' (antes do conserto, no topo, +157)');
      // o retorno do toque: a linha, no lugar do dedo, diz o que ficou, e a forma dela é a da marca
      const linhaAgora = await nav.p.evaluate(() => {
        const b = document.querySelector('[data-a="linha-almoco"]');
        return { texto: b.querySelector('.ag-l-s').textContent, forma: b.querySelector('.df').getAttribute('class') };
      });
      assert.ok(new RegExp('^' + (k === 'tudo' ? 'comi tudo' : 'metade') + ' · ').test(linhaAgora.texto), linhaAgora.texto);
      assert.ok(new RegExp('\\b' + k + '\\b').test(linhaAgora.forma), linhaAgora.forma);
      assert.ok(depois.y >= 0 && depois.y + depois.h <= 896, 'e ela está na tela');
      // sob o dedo não cai um botão que grava
      const sob = await nav.sobODedo(botao.cx, botao.cy);
      assert.ok(!sob.controle || !/\[(tudo|metade|naocomi|fora|nsei|nao|desfaz|cartao)-/.test(sob.controle),
        'sob o dedo ficou um botão que grava: ' + JSON.stringify(sob));
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  });
}

test('"Comi tudo" no topo: em nenhum quadro do compositor a linha sai do lugar; e "Desfazer" pela linha também a deixa lá', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await noAgora(nav, 0);
    const { linha, botao } = await abreALinha(nav, 'almoco', 'tudo');
    // a hora e o nome da linha: o que não muda com a marca (a forma pousa e o
    // texto da direita troca)
    const h = await nav.caixa('[data-a="linha-almoco"] .ag-l-h'), n = await nav.caixa('[data-a="linha-almoco"] .ag-l-n');
    const caixa = { x0: Math.round(h.x), x1: Math.min(Math.round(n.x + 80), 300), y0: Math.round(linha.y + 6), y1: Math.round(linha.y + linha.h - 6) };
    const qs = await quadrosDoCompositor(nav, () => nav.toca(botao.cx, botao.cy), 500);
    assert.ok(qs.length >= 3, 'o compositor entregou ' + qs.length + ' quadros');
    const fim = faixa(qs[qs.length - 1], caixa);
    const longe = qs.map(im => distancia(faixa(im, caixa), fim));
    assert.ok(longe.every(d => d < 4), 'algum quadro mostrou a linha fora do lugar (distância da faixa ao último quadro): ' +
      longe.map(d => d.toFixed(1)).join(' '));
    // e a faixa é mesmo a da linha: 157 px abaixo, no último quadro, é outra coisa
    assert.ok(distancia(faixa(qs[qs.length - 1], { ...caixa, y0: caixa.y0 + 157, y1: caixa.y1 + 157 }), fim) > 4,
      'a faixa medida não distingue a linha do que está embaixo dela');

    // Desfazer pela linha aberta: a leitura sai de cima, e a linha não sobe
    const { linha: aberta, botao: desfaz } = await abreALinha(nav, 'almoco', 'desfaz');
    assert.ok(desfaz, 'a linha marcada abre com "Desfazer"');
    await nav.toca(desfaz.cx, desfaz.cy);
    await nav.espera(300);
    assert.strictEqual(await nav.caixa('.ag-volta'), null, 'a leitura de volta saiu');
    const depois = await nav.caixa('[data-a="linha-almoco"]');
    assert.ok(Math.abs(depois.y - aberta.y) <= FOLGA_PX, 'desfazer subiu a linha: y ' + aberta.y + ' → ' + depois.y);
  } finally { await nav.fecha(); }
});

// ---------- régua, teclado e RIR ----------

/**
 * Abre o teclado da carga da série 1 com um toque de verdade e devolve, antes e
 * depois, a rolagem, a célula, o teclado e a área visível — a janela menos o que
 * cobre a tela embaixo (o cronômetro em cena; no modo, a barra de abas não está)
 * —, e a rolagem a cada quadro desde o toque: rolagem suave passaria por valores
 * no meio.
 */
async function abreOTeclado(nav, { topo, cronometro }) {
  await nav.treinoDeHoje();
  await nav.E(`if (view.open !== 0) toggle(0); render();`);
  await nav.espera(150);
  if (cronometro) { await nav.E(`startTimer(90, 'descanso · teste');`); await nav.espera(600); }
  if (topo) { await nav.p.evaluate(() => window.scrollTo(0, 0)); await nav.espera(100); }
  const cel = await nav.caixa('#w0_0');
  const antes = await nav.p.evaluate(() => scrollY);
  await nav.p.evaluate(() => {
    window.__rol = [];
    const t0 = performance.now();
    const f = () => { window.__rol.push(scrollY); if (performance.now() - t0 < 500) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  await nav.toca(cel.cx, cel.cy);
  await nav.espera(600);
  const depois = await nav.p.evaluate(() => {
    const cx = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { y: r.top, b: r.bottom }; };
    const t = document.getElementById('timer');
    const emCena = t && t.classList.contains('on') && getComputedStyle(t).visibility !== 'hidden';
    return { rolagem: scrollY, celula: cx('#w0_0'), teclado: cx('.tcl'), pronto: cx('[data-a="tcl-pronto"]'),
             visivelAte: emCena ? t.getBoundingClientRect().top : innerHeight, foco: document.activeElement && document.activeElement.className,
             quadros: window.__rol };
  });
  return { cel, antes, ...depois };
}

for (const motivo of ['a célula na metade de cima', 'a célula na metade de baixo', 'a célula na metade de baixo, com o cronômetro em cena']) {
  test('o teclado próprio, ' + motivo + ': ' + (motivo.includes('cima') ? 'nada rola' : 'a página rola o mínimo, de uma vez, para ele aparecer inteiro'), DEMORADO, async () => {
    const nav = await abreNavegador();
    try {
      const r = await abreOTeclado(nav, { topo: !motivo.includes('cima'), cronometro: motivo.includes('cronômetro') });
      assert.ok(r.teclado, 'o teclado abriu');
      if (motivo.includes('cima')) {
        assert.ok(r.cel.cy < 896 / 2, 'pré-condição: o cartão aberto deixa a célula na metade de cima (y ' + r.cel.y + ')');
        assert.strictEqual(r.rolagem, r.antes, 'o teclado cabia, e a página rolou: ' + r.antes + ' → ' + r.rolagem);
        assert.ok(Math.abs(r.celula.y - r.cel.y) <= FOLGA_PX, 'a célula saiu do lugar');
        const sob = await nav.sobODedo(r.cel.cx, r.cel.cy);
        assert.ok(sob.controle && sob.controle.startsWith('button#w0_0'), 'sob o dedo devia continuar a célula: ' + JSON.stringify(sob));
      } else {
        assert.ok(r.cel.cy > 896 / 2, 'pré-condição: com a página no topo a célula está na metade de baixo (y ' + r.cel.y + ')');
        assert.ok(r.rolagem > r.antes, 'o teclado não cabia, e a página não rolou');
        // inteiro, do topo ao "pronto", dentro da área visível
        assert.ok(r.teclado.y >= 0 && r.pronto.b <= r.visivelAte + 0.5,
          'o teclado não está inteiro na tela: ' + r.teclado.y.toFixed(1) + ' a ' + r.pronto.b.toFixed(1) + ', visível até ' + r.visivelAte.toFixed(1) +
          ' (antes do conserto, sem rolar, o "pronto" em 1026,7; e com o foco rolando, por baixo do cronômetro)');
        // o MÍNIMO: o fundo do teclado encosta no fim da área visível
        assert.ok(r.visivelAte - r.teclado.b <= FOLGA_PX,
          'rolou mais que o mínimo: o teclado acaba em ' + r.teclado.b.toFixed(1) + ' com a área visível até ' + r.visivelAte.toFixed(1));
      }
      // de uma vez: nenhum quadro com a rolagem no meio do caminho
      const valores = [...new Set(r.quadros)];
      assert.ok(valores.every(v => v === r.antes || v === r.rolagem), 'a rolagem passou por valores no meio (suave): ' + valores.join(' → '));
      // o foco, o teclado físico e o visor continuam
      assert.strictEqual(r.foco, 'tcl', 'o teclado tem o foco');
      await nav.p.keyboard.press('4');
      await nav.p.keyboard.press('2');
      await nav.espera(100);
      assert.strictEqual(await nav.p.evaluate(() => document.querySelector('.tcl-n').textContent), '42', 'o teclado físico chega ao visor');
      assert.strictEqual(await nav.p.evaluate(() => document.querySelector('#w0_0').textContent.trim()), '42', 'e à célula');
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  });
}

test('régua, teclado e RIR aparecem no lugar: nada neles se move ao abrir', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await nav.treinoDeHoje({ sessao: true });
    await nav.E(`if (view.open !== 0) toggle(0); render();`);
    await nav.espera(150);
    for (const [abre, sel] of [['abreRegua(0, 0)', '.regua'], ['abreTecladoDeCarga(0, 1)', '.tcl'], ['abreRir(0, 2)', '.rirscale']]) {
      const vivas = await nav.p.evaluate(async ([abre, sel]) => {
        window.__escopo(abre + '; render();');
        const visto = [];
        for (let i = 0; i < 12; i++) {
          await new Promise(ok => requestAnimationFrame(ok));
          if (!document.querySelector(sel)) visto.push('não abriu');
          document.getAnimations().forEach(a => {
            const t = a.effect && a.effect.target;
            if (t && t.closest && t.closest(sel)) visto.push((a.animationName || a.transitionProperty) + ' em ' + (t.className || t.tagName));
          });
        }
        return [...new Set(visto)];
      }, [abre, sel]);
      assert.deepStrictEqual(vivas, [], sel + ' se move ao abrir: ' + vivas.join(', '));
    }
  } finally { await nav.fecha(); }
});

// ---------- a abertura ----------

/**
 * Abre o app registrando, a cada quadro desde o primeiro, se a frase "Abrindo o
 * registro…" está lá e com que opacidade, a animação de espera dela enquanto
 * existe (depois do atraso ela acaba e sai da lista: duração zero, sem
 * `forwards`), e o relógio do documento — com ele, quanto da espera já correu
 * em cada quadro. `atrasaJs` segura o script do app no servidor: a abertura lenta.
 */
async function abre(opcoes, atrasaJs) {
  const nav = await abreNavegador(Object.assign({}, opcoes, {
    preparo: async ctx => {
      if (atrasaJs) await ctx.route(/\/assets\/.*\.js$/, async r => { await new Promise(ok => setTimeout(ok, atrasaJs)); await r.continue(); });
      await ctx.addInitScript(() => {
        window.__frase = { q: [], inicio: null };
        const passo = () => {
          const m = document.querySelector('#app > .msg');
          const a = m && m.getAnimations ? m.getAnimations()[0] : null;
          if (a && a.startTime != null && window.__frase.inicio == null) window.__frase.inicio = a.startTime;
          window.__frase.q.push({ ha: !!m, op: m ? Number(getComputedStyle(m).opacity) : null, tl: document.timeline.currentTime,
            anim: a ? { nome: a.animationName, atraso: a.effect.getTiming().delay,
                        // a duração COMPUTADA: a não escrita o motor devolve como `auto`, que é zero
                        dur: a.effect.getComputedTiming().duration } : null });
          if (window.__frase.q.length < 600 && !(window.__frase.q.length > 3 && !m)) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    }
  }));
  const r = await nav.p.evaluate(() => window.__frase);
  // quanto da espera tinha corrido em cada quadro
  r.q.forEach(x => { x.correu = r.inicio == null || x.tl == null ? null : x.tl - r.inicio; });
  return { nav, q: r.q, inicio: r.inicio };
}

for (const reduz of [false, true]) {
  test('"Abrindo o registro…" só aparece se a abertura demorar, de uma vez' + (reduz ? ', igual com "Reduzir movimento"' : ''), DEMORADO, async () => {
    // a abertura lenta: o script do app chega 900 ms depois
    let { nav, q, inicio } = await abre({ reduz }, 900);
    let T;
    try {
      T = await tempoECurva(nav);
      const com = q.filter(x => x.ha);
      assert.ok(com.length > 10 && inicio != null, 'a frase ficou na tela enquanto o script não chegava (' + com.length + ' quadros)');
      const esperando = com.filter(x => x.anim);
      assert.ok(esperando.length >= 3, 'a frase esperou em vários quadros');
      assert.ok(esperando.every(x => x.anim.nome === 'ins-espera' && x.anim.atraso === T.espera && x.anim.dur === 0),
        'a espera é a do token, sem duração: ' + JSON.stringify(esperando.find(x => !(x.anim.nome === 'ins-espera' && x.anim.atraso === T.espera && x.anim.dur === 0))));
      assert.ok(com.every(x => x.op === 0 || x.op === 1), 'aparece de uma vez, sem esmaecer: ' + [...new Set(com.map(x => x.op))].join(' '));
      assert.ok(esperando.every(x => x.op === 0 && x.correu < T.espera), 'enquanto espera, apagada');
      const i = com.findIndex(x => x.op === 1);
      assert.ok(i > 0 && com.slice(i).every(x => x.op === 1 && !x.anim), 'passada a espera ela aparece e fica até o app montar: ' + com.map(x => x.op).join(''));
      assert.ok(com[i].correu >= T.espera - 1 && com[i - 1].correu < T.espera + 1,
        'aparece no primeiro quadro depois da espera: ' + com[i - 1].correu.toFixed(0) + ' → ' + com[i].correu.toFixed(0) + ' ms');
      assert.strictEqual(await nav.p.evaluate(() => document.querySelector('#app > .msg')), null, 'o app montou por cima dela');
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }

    // a abertura rápida: só o fundo e o app
    ({ nav, q } = await abre({ reduz }, 0));
    try {
      // muitas vezes o primeiro quadro já sai com o app montado, e a frase nem é
      // vista; quando ela está, apagada
      const com = q.filter(x => x.ha);
      assert.ok(q.length >= 1, 'nenhum quadro registrado');
      // sob a carga da suíte a abertura "rápida" pode passar da espera; aí ela já é
      // uma espera, e a frase aparece — a regra é a mesma, pelo relógio dela
      assert.ok(com.every(x => (x.correu == null || x.correu < T.espera - 1) ? x.op === 0 : x.op === 1),
        'a frase apareceu fora da regra: ' + JSON.stringify(com.map(x => [x.op, x.correu && Math.round(x.correu)])));
      if (com.every(x => x.correu == null || x.correu < T.espera)) {
        assert.ok(com.every(x => x.op === 0), 'a abertura rápida mostrou a frase');
      }
    } finally { await nav.fecha(); }
  });
}
