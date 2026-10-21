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

// O "Comi tudo" fica no PAINEL aberto da linha, abaixo dela, e a marca fecha o
// painel: com o topo da linha no lugar (peça 8), sob o dedo subia a linha de
// baixo — a "Ceia" —, e um segundo toque rápido a abria (07 §14.3). Desde os
// ajustes finais a rolagem é pelo ponto do toque: a linha desce, de uma vez,
// só até o dedo cair dentro dela, e nunca sobe.
// (`alcanca`: o "Metade" fica 56 px abaixo do "Comi tudo", e com a página no topo
// nenhuma rolagem leva a linha até ele — ela desce o máximo, os 157 px de antes)
for (const [nome, rolagem, k, alcanca] of [['com a página no topo', 0, 'tudo', true], ['com a página rolada', 200, 'tudo', true],
  ['"Metade", no topo', 0, 'metade', false], ['"Metade", com a página rolada', 200, 'metade', true]]) {
  test('"' + (k === 'tudo' ? 'Comi tudo' : 'Metade') + '" pela linha, ' + nome + ': o dedo continua sobre a linha, ela não é empurrada, e o retorno do toque se vê nela', DEMORADO, async () => {
    const nav = await abreNavegador();
    try {
      await noAgora(nav, rolagem);
      const { linha, botao } = await abreALinha(nav, 'almoco', k);
      assert.strictEqual(await nav.caixa('.ag-volta'), null, 'pré-condição: sem leitura de volta');
      assert.ok(botao.cy > linha.y + linha.h, 'pré-condição: o botão fica no painel, ABAIXO da linha fechada');
      await nav.toca(botao.cx, botao.cy);
      await nav.espera(300);

      assert.ok(await nav.caixa('.ag-volta'), 'a leitura de volta nasceu acima da linha — o que a fazia descer 157 px');
      const depois = await nav.caixa('[data-a="linha-almoco"]');
      assert.ok(depois.y >= linha.y - FOLGA_PX, 'a linha subiu: y ' + linha.y + ' → ' + depois.y);
      const sob = await nav.sobODedo(botao.cx, botao.cy);
      const rolouAte = await nav.p.evaluate(() => window.scrollY);
      if (alcanca) {
        // o dedo continua SOBRE a linha que acabou de ser marcada, e ela desceu
        // só o que faltava para isso: o dedo dentro dela, a no máximo 12 px (a
        // folga) da borda de baixo
        assert.strictEqual(sob.controle, 'button.ag-l-b[linha-almoco]', 'sob o dedo ficou outra coisa, e não a linha marcada: ' + JSON.stringify(sob));
        assert.ok(botao.cy <= depois.y + depois.h - 1 && botao.cy >= depois.y + depois.h - 12 - FOLGA_PX,
          'a linha desceu além do dedo: o dedo em ' + botao.cy + ', a linha em ' + depois.y + '–' + (depois.y + depois.h));
      } else {
        // o botão está tão abaixo da linha que nem a página no topo a leva até
        // o dedo: ela desce o mais que dá — a rolagem fica em 0, e a leitura de
        // volta inteira acima dela —, e não passa do dedo
        assert.strictEqual(rolouAte, 0, 'a linha não desceu o que podia: rolagem ' + rolouAte);
        assert.ok(depois.y + depois.h <= botao.cy, 'a linha passou do dedo');
      }
      // o retorno do toque: a linha, sob o dedo, diz o que ficou, e a forma dela é a da marca
      const linhaAgora = await nav.p.evaluate(() => {
        const b = document.querySelector('[data-a="linha-almoco"]');
        return { texto: b.querySelector('.ag-l-s').textContent, forma: b.querySelector('.df').getAttribute('class') };
      });
      assert.ok(new RegExp('^' + (k === 'tudo' ? 'comi tudo' : 'metade') + ' · ').test(linhaAgora.texto), linhaAgora.texto);
      assert.ok(new RegExp('\\b' + k + '\\b').test(linhaAgora.forma), linhaAgora.forma);
      assert.ok(depois.y >= 0 && depois.y + depois.h <= 896, 'e ela está na tela');
      // o segundo toque rápido, no mesmo ponto, reabre a MESMA linha (a de "Desfazer"), e não a de baixo
      if (alcanca) {
        await nav.toca(botao.cx, botao.cy);
        await nav.espera(200);
        assert.strictEqual(await nav.E('view.linhaComida'), 'almoco', 'o segundo toque abriu outra linha');
      }
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  });
}

test('"Comi tudo" pelo teclado (sem dedo): a linha fica onde estava, como na peça 8', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await noAgora(nav, 0);
    const { linha } = await abreALinha(nav, 'almoco', 'tudo');
    await nav.p.focus('[data-a="tudo-almoco"]');
    await nav.p.keyboard.press('Enter');
    await nav.espera(300);
    assert.ok(await nav.caixa('.ag-volta'), 'a marca entrou');
    const depois = await nav.caixa('[data-a="linha-almoco"]');
    assert.ok(Math.abs(depois.y - linha.y) <= FOLGA_PX, 'sem dedo, a linha saiu do lugar: y ' + linha.y + ' → ' + depois.y);
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('"Comi tudo" no topo: a linha vai ao dedo de uma vez — nenhum quadro do compositor a mostra empurrada ou no meio do caminho; e "Desfazer" pela linha a deixa lá', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await noAgora(nav, 0);
    const { linha, botao } = await abreALinha(nav, 'almoco', 'tudo');
    // a hora e o nome da linha: o que não muda com a marca (a forma pousa e o
    // texto da direita troca)
    const h = await nav.caixa('[data-a="linha-almoco"] .ag-l-h'), n = await nav.caixa('[data-a="linha-almoco"] .ag-l-n');
    const caixa = y => ({ x0: Math.round(h.x), x1: Math.min(Math.round(n.x + 80), 300), y0: Math.round(y + 6), y1: Math.round(y + linha.h - 6) });
    const qs = await quadrosDoCompositor(nav, () => nav.toca(botao.cx, botao.cy), 500);
    assert.ok(qs.length >= 3, 'o compositor entregou ' + qs.length + ' quadros');
    const depois = await nav.caixa('[data-a="linha-almoco"]');
    assert.ok(depois.y > linha.y + FOLGA_PX, 'pré-condição: a linha desceu até o dedo (' + linha.y + ' → ' + depois.y + ')');
    const velha = faixa(qs[0], caixa(linha.y)), nova = faixa(qs[qs.length - 1], caixa(depois.y));
    // cada quadro mostra a linha no lugar de antes (o toque ainda não entrou) ou
    // no de depois — e, depois de ir, não volta. Um quadro com ela empurrada
    // (+157, a leitura de volta nascendo sem a rolagem) ou no meio não casa com
    // nenhum dos dois.
    const onde = qs.map(im => distancia(faixa(im, caixa(depois.y)), nova) < 4 ? 'n' : distancia(faixa(im, caixa(linha.y)), velha) < 4 ? 'v' : '?');
    assert.ok(/^v*n+$/.test(onde.join('')), 'algum quadro mostrou a linha fora dos dois lugares (v antes, n depois): ' + onde.join(''));
    // e a faixa é mesmo a da linha: no lugar de antes, no último quadro, é outra coisa
    assert.ok(distancia(faixa(qs[qs.length - 1], caixa(linha.y)), nova) > 4,
      'a faixa medida não distingue a linha do que ficou no lugar de antes');

    // Desfazer pela linha aberta: a leitura sai de cima, o dedo continua no
    // painel dela, e a linha não sobe (a linha desceu até o dedo, e o painel
    // dela aberto passaria da dobra: a página rola antes, como o dedo faria)
    await nav.p.evaluate(() => window.scrollBy(0, 220));
    await nav.espera(150);
    const { linha: aberta, botao: desfaz } = await abreALinha(nav, 'almoco', 'desfaz');
    assert.ok(desfaz, 'a linha marcada abre com "Desfazer"');
    const sobDesfaz = await nav.sobODedo(desfaz.cx, desfaz.cy);
    await nav.toca(desfaz.cx, desfaz.cy);
    await nav.espera(300);
    assert.strictEqual(await nav.caixa('.ag-volta'), null, 'a leitura de volta saiu (sob o dedo: ' + JSON.stringify(sobDesfaz) + ', ' + JSON.stringify(desfaz) + ')');
    const voltou = await nav.caixa('[data-a="linha-almoco"]');
    assert.ok(Math.abs(voltou.y - aberta.y) <= FOLGA_PX, 'desfazer subiu a linha: y ' + aberta.y + ' → ' + voltou.y);
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
      // a forma dos ajustes finais: uma animação que dura CEM esperas, sem
      // atraso, com o degrau a 1 % — ainda correndo quando a frase acende, para
      // o compositor a acender com a thread presa (o caso abaixo)
      const esperando = com.filter(x => x.anim);
      assert.ok(esperando.length >= 3, 'a frase esperou em vários quadros');
      const naForma = x => x.anim.nome === 'ins-espera' && x.anim.atraso === 0 && Math.abs(x.anim.dur - T.espera * 100) < 1;
      assert.ok(esperando.every(naForma), 'a espera é a do token, cem vezes, sem atraso: ' + JSON.stringify(esperando.find(x => !naForma(x))));
      // de uma vez: o degrau tem 30 µs de rampa, e no máximo um quadro cairia nele
      const noMeio = com.filter(x => x.op > 0 && x.op < 1);
      assert.ok(noMeio.length === 0 || (noMeio.length === 1 && Math.abs(noMeio[0].correu - T.espera) < 1),
        'aparece de uma vez, sem esmaecer: ' + [...new Set(com.map(x => x.op))].join(' '));
      assert.ok(com.filter(x => x.correu != null && x.correu < T.espera).every(x => x.op === 0), 'enquanto espera, apagada');
      const i = com.findIndex(x => x.op === 1);
      assert.ok(i > 0 && com.slice(i).every(x => x.op === 1), 'passada a espera ela aparece e fica até o app montar: ' + com.map(x => x.op).join(''));
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

// A ABERTURA LENTA COM A THREAD PRESA (ajustes finais; 07 §14.3). No WebKit desta
// máquina o boot prende a thread principal de ~200 ms até o primeiro desenho do
// app, a ~850, e a forma da peça 8 (duração zero e um atraso) dependia dela para
// acender: a frase nunca chegava à tela. Aqui a thread fica presa de propósito,
// por 1,2 s, logo depois dos primeiros quadros, com o script do app ainda longe
// (chega a 2 s): quem acende a frase, se ela acender, é o compositor. Lido nos
// quadros DO COMPOSITOR, não no DOM.
/** Abre o app com o script a 2 s e a thread presa por 1,2 s a partir dos 120 ms; liga o screencast antes. */
async function abreComAThreadPresa(reduz) {
  const q = [];
  let liga = null;
  const nav = await abreNavegador({ reduz, preparo: async ctx => {
    await ctx.route(/\/assets\/.*\.js$/, async r => { await new Promise(ok => setTimeout(ok, 2000)); await r.continue(); });
    await ctx.addInitScript(() => {
      window.__presa = {};
      requestAnimationFrame(t => { window.__presa.quadro = t; });
      setTimeout(() => {
        window.__presa.de = performance.now();
        const f = performance.now() + 1200;
        while (performance.now() < f) { /* a thread presa, como no boot */ }
        window.__presa.ate = performance.now();
      }, Math.max(0, 120 - performance.now()));
    });
    // o screencast liga quando a página nasce, antes de ela abrir o app: os
    // quadros do compositor desde o começo
    ctx.on('page', pg => { liga = pg.screencast.start({ size: { width: 414, height: 896 }, quality: 90, onFrame: f => { q.push({ ts: f.timestamp, d: f.data }); } }); });
  } });
  await liga;
  await nav.p.screencast.stop();
  const { origem, presa } = await nav.p.evaluate(() => ({ origem: performance.timeOrigin, presa: window.__presa }));
  return { nav, q, origem, presa };
}
for (const reduz of [false, true]) {
  test('"Abrindo o registro…" acende aos 300 ms mesmo com a thread presa, nos quadros do compositor' + (reduz ? ', igual com "Reduzir movimento"' : ''), DEMORADO, async () => {
    const { jpegjs } = await import('../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
    // sob a carga da suíte o primeiro quadro pode sair depois da trava, e aí a
    // frase nem chegou ao compositor: a abertura não serve de prova e se repete
    // (até três vezes)
    let aberta = null, tentativas = [];
    for (let k = 0; k < 3 && !aberta; k++) {
      const a = await abreComAThreadPresa(reduz);
      const espera = (await tempoECurva(a.nav)).espera;
      tentativas.push(a.presa);
      // um quadro desenhado antes da trava (é nele que a frase vai ao compositor)
      if (a.presa.quadro != null && a.presa.quadro <= a.presa.de && a.presa.de < espera - 50 && a.presa.ate > espera + 300) aberta = Object.assign(a, { espera });
      else await a.nav.fecha();
    }
    assert.ok(aberta, 'a trava nunca cobriu a espera: ' + JSON.stringify(tentativas));
    const { nav, q, origem, presa, espera } = aberta;
    try {
      assert.ok(presa.ate - presa.de >= 1100, 'a thread ficou presa: ' + JSON.stringify(presa));
      // o WebKit carimba no relógio monotônico; o Chromium, em época
      const OFF = Date.now() - Number(process.hrtime.bigint()) / 1e6;
      // antes do script do app chegar (2 s) a página só tem o fundo e a frase: a
      // tela inteira serve de caixa
      q.sort((a, b) => a.ts - b.ts);
      const linha = q.map(({ ts, d }) => {
        const t = (ts < 1e11 ? ts + OFF : ts) - origem;
        const im = jpegjs.decode(d, { useTArray: true });
        const E = im.width / 414, px = (x, y) => (Math.round(y * E) * im.width + Math.round(x * E)) * 4;
        const f0 = px(5, 5), fundo = [im.data[f0], im.data[f0 + 1], im.data[f0 + 2]];
        let tinta = 0;
        for (let y = 1; y <= 895; y += 2) for (let x = 1; x <= 413; x += 2) {
          const o = px(x, y);
          if (Math.abs(im.data[o] - fundo[0]) + Math.abs(im.data[o + 1] - fundo[1]) + Math.abs(im.data[o + 2] - fundo[2]) > 60) tinta++;
        }
        return { t, tinta };
      }).filter(x => x.t > -100 && x.t < presa.ate);
      // a frase é pouca tinta sobre o fundo; o quadro de antes do estilo (o
      // documento ainda em branco, no WebKit) é tinta na tela inteira, e não conta
      const FRASE = x => x.tinta > 30 && x.tinta < 5000;
      const acesa = linha.find(FRASE);
      assert.ok(acesa, 'com a thread presa (' + Math.round(presa.de) + '–' + Math.round(presa.ate) + ' ms) a frase não chegou à tela: ' +
        linha.map(x => Math.round(x.t) + ':' + x.tinta).join(' '));
      assert.ok(acesa.t >= espera - 20, 'acendeu antes da espera: ' + Math.round(acesa.t) + ' ms');
      assert.ok(acesa.t < presa.ate - 200, 'só acendeu quando a thread soltou (' + Math.round(presa.ate) + ' ms): ' + Math.round(acesa.t) + ' ms');
      // e fica acesa enquanto a thread está presa (a animação que acaba com a
      // thread presa volta, no WebKit, ao apagado que a thread tinha entregado)
      assert.ok(linha.filter(x => x.t >= acesa.t).every(FRASE), 'a frase apagou de novo com a thread presa: ' +
        linha.filter(x => x.t >= acesa.t).map(x => Math.round(x.t) + ':' + x.tinta).join(' '));
      assert.ok(linha.filter(x => x.t < espera - 20).every(x => !FRASE(x)), 'antes da espera, só o fundo: ' +
        linha.map(x => Math.round(x.t) + ':' + x.tinta).join(' '));
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  });
}
