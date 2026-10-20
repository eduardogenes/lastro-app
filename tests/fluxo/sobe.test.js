// A FOLHA SOBE, E O PAINEL DE PARE IGUAL — medido no motor de verdade.
//
// Peça 4 do motion. Dono, 16/10: pergunta 1, a folha chega "como o iPhone, com
// quique" (640 ms: passa 8 % do lugar aos 55 %, volta 3 % aos 80 %, assenta —
// a única ultrapassagem do app); pergunta 11, o painel de apagar "igual à
// folha"; pergunta 2, sob "Reduzir movimento" folha, painel e véu esmaecem ao
// chegar, e nada se desloca. A saída desce pela transição de vista (peça 5,
// `troca.test.js`). A troca
// da folha do topo ("cadastrar") não sobe (02 T8). O "Não guardei" não se move
// (03 §5.3).
//
// O jsdom não anima nem tem layout: aqui o build sobe num Chromium
// (`navegador.js`; `LASTRO_MOTOR=webkit` roda os mesmos casos no WebKit). O
// isolamento, o foco devolvido e a janela do "Não guardei", na árvore, são
// `camadas.test.js`. Os tempos, a curva e os quadros vêm dos tokens, como o
// motor os resolve — nunca escritos aqui.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abreNavegador, fechaNavegador, MOTOR } from './navegador.js';

const DEMORADO = { timeout: 120000 };
afterAll(fechaNavegador);
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Os quadros do quique, como `tokens.css` os escreve: [[posição, transform]]. */
const QUIQUE = (() => {
  const tokens = fs.readFileSync(path.join(RAIZ, 'src/tokens.css'), 'utf8');
  const bloco = /@keyframes ins-quique\s*\{([\s\S]*?)\n\}/.exec(tokens);
  assert.ok(bloco, 'os quadros do quique sumiram de tokens.css');
  return [...bloco[1].matchAll(/(\d+)%\s*\{\s*transform:\s*([^;]+);/g)].map(m => [Number(m[1]) / 100, m[2].trim()]);
})();
/** A ultrapassagem e a volta do quique, em fração da altura (8 % e 3 %), lidas dos quadros. */
const PASSA = -Math.min(...QUIQUE.map(([, t]) => (/translateY\((-?[\d.]+)%\)/.exec(t) || [0, 0])[1] / 100));
const VOLTA = Math.max(...QUIQUE.filter(([o]) => o > 0 && o < 1).map(([, t]) => (/translateY\((-?[\d.]+)%\)/.exec(t) || [0, 0])[1] / 100));

const tokens = nav => nav.p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const ms = n => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(cs.getPropertyValue(n).trim()); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : NaN; };
  return { entra: ms('--ins-dur-entra'), quique: ms('--ins-dur-quique'), dissolve: ms('--ins-dur-dissolve'),
           curvaVeu: cs.getPropertyValue('--ins-curva-ciclo').trim(), curvaCamada: cs.getPropertyValue('--ins-curva-camada').trim() };
});
/** Os pontos de uma curva; o WebKit escreve pela palavra a que tiver nome (`ease` é `cubic-bezier(.25, .1, .25, 1)`). */
const PALAVRAS = { ease: [0.25, 0.1, 0.25, 1], linear: [0, 0, 1, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };
const numeros = c => PALAVRAS[String(c).trim()] || (String(c).match(/-?\d*\.?\d+/g) || []).map(Number);
const mesmaCurva = (a, b) => JSON.stringify(numeros(a)) === JSON.stringify(numeros(b));

/**
 * Roda `acao` e amostra quadro a quadro, por `ms`: a caixa da camada (a última
 * que casa `sel`), a opacidade do véu irmão dela, a largura rolável e a caixa
 * do `main` atrás. No segundo quadro, as animações vivas da caixa, do véu e do
 * invólucro; e, no quadro mais alto, o que o dedo acharia rente à borda de baixo.
 */
const amostra = (nav, acao, sel, ms) => nav.p.evaluate(async ([acao, sel, ms]) => {
  const anims = e => e ? e.getAnimations().map(a => ({ nome: a.animationName || a.transitionProperty, dur: a.effect.getTiming().duration,
    quadros: a.effect.getKeyframes().map(q => ({ o: q.offset, tr: q.transform, op: q.opacity, ea: q.easing })),
    props: [...new Set(a.effect.getKeyframes().flatMap(q => Object.keys(q)))].filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)) })) : [];
  const quadros = [];
  let vivas = null, rente = null, maisAlto = Infinity;
  const t0 = performance.now();
  window.__escopo(acao);
  await new Promise(ok => {
    const passo = () => {
      const t = performance.now() - t0;
      const cx = [...document.querySelectorAll(sel)].pop();
      const veu = cx && cx.parentElement.querySelector(':scope > .ins-veu');
      if (cx && !vivas) vivas = { caixa: anims(cx), veu: anims(veu), involucro: anims(cx.parentElement) };
      const r = cx ? cx.getBoundingClientRect() : null;
      const m = document.querySelector('main');
      if (r && r.top < maisAlto) {
        maisAlto = r.top;
        const e = document.elementFromPoint(innerWidth / 2, innerHeight - 1);
        rente = !!(e && e.closest(sel.split(' > ').pop()));
      }
      quadros.push({ t, top: r ? r.top : null, h: r ? r.height : null, op: cx ? Number(getComputedStyle(cx).opacity) : null,
        veu: veu ? Number(getComputedStyle(veu).opacity) : null, larg: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        main: m ? m.getBoundingClientRect().top : null });
      if (t < ms) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  return { quadros: quadros.filter(q => q.top != null), vivas, rente, w: innerWidth };
}, [acao, sel, ms]);

const FECHA = `view.pilha = []; view.pare = null; view.falhou = false; render();`;
/** A troca de camada em curso acabou (a descida da folha e do painel é transição de vista, peça 5)? */
const semTroca = nav => nav.p.waitForFunction(() => !document.activeViewTransition, null, { timeout: 8000 });
/** Fecha tudo e espera a descida da folha e do painel acabar. */
const fecha = async nav => { await nav.E(FECHA); await nav.espera(100); await semTroca(nav); await nav.espera(60); };
/** A folha saiu do DOM? A descida pede o desenho novo ~1 quadro depois do toque — sob carga, mais. */
const saiu = nav => nav.p.waitForFunction(() => document.querySelectorAll('.ins-folha').length === 0, null, { timeout: 3000 })
  .then(() => true, () => false);
/**
 * Abre e fecha uma vez antes de medir: no WebKit desta máquina a PRIMEIRA vez
 * que uma camada aparece custa centenas de ms (a fonte do sistema não existe
 * no Linux, docs/motion/04 §1.3), e o primeiro quadro amostrado já vinha perto
 * do fim da subida. É a passada de aquecimento do revisor (07 §1.1).
 */
const aquece = async (nav, acao) => { await nav.E('void (' + acao + ')'); await nav.espera(900); await fecha(nav); };

/** A camada que chega com o quique: uma animação só, a do token, com os quadros dos tokens; o véu acende no tempo da camada. */
function confereQuique(r, k, nome) {
  const { caixa, veu, involucro } = r.vivas;
  assert.deepStrictEqual(caixa.map(a => a.nome), ['ins-quique'], nome + ': a caixa chega com o quique, e só com ele');
  assert.strictEqual(caixa[0].dur, k.quique, nome + ': no tempo do quique (--ins-dur-quique)');
  assert.deepStrictEqual(caixa[0].quadros.map(q => [q.o, q.tr]), QUIQUE, nome + ': com os quadros que o dono escolheu');
  assert.deepStrictEqual(veu.map(a => a.nome), ['ins-esmaece'], nome + ': o véu acende');
  assert.strictEqual(veu[0].dur, k.entra, nome + ': no tempo da camada (--ins-dur-entra), não no do quique');
  assert.ok(mesmaCurva(veu[0].quadros[0].ea, k.curvaVeu), nome + ': na curva do véu (--ins-curva-ciclo): ' + veu[0].quadros[0].ea);
  assert.deepStrictEqual(veu[0].props, ['opacity'], nome + ': o véu só muda a opacidade');
  assert.deepStrictEqual(involucro, [], nome + ': o invólucro, que é o fixo, não se move');

  const q = r.quadros, fim = q[q.length - 1], h = fim.h;
  assert.ok(q[0].top > fim.top + 0.5 * h, nome + ': nasce abaixo do lugar (primeiro quadro em ' + q[0].top + ', lugar ' + fim.top + ')');
  const alto = Math.min(...q.map(x => x.top));
  const iPico = q.findIndex(x => x.top === alto);
  const baixo = Math.max(...q.slice(iPico).map(x => x.top));
  const passa = (fim.top - alto) / h, volta = (baixo - fim.top) / h;
  assert.ok(passa > PASSA * 0.6 && passa < PASSA + 0.005, nome + ': passa do lugar ' + (passa * 100).toFixed(2) + ' % (os quadros dizem ' + PASSA * 100 + ' %)');
  assert.ok(volta > VOLTA * 0.3 && volta < VOLTA + 0.005, nome + ': e volta ' + (volta * 100).toFixed(2) + ' % (' + VOLTA * 100 + ' %)');
  assert.ok(alto >= 0, nome + ': no pico continua dentro da tela (topo em ' + alto.toFixed(1) + ')');
  assert.ok(r.rente, nome + ': no pico, o pé da camada cobre a borda de baixo — nenhum vão por onde a página apareça');
  assert.ok(q[0].veu < 0.5 && fim.veu === 1, nome + ': o véu vai de apagado a aceso (' + q[0].veu + ' → ' + fim.veu + ')');
  assert.deepStrictEqual([...new Set(q.map(x => x.larg))], [r.w], nome + ': nenhum quadro mais largo que a janela');
  assert.strictEqual(new Set(q.map(x => x.main)).size, 1, nome + ': o que está atrás não se move');
}

test('a folha sobe com o quique, o véu acende no tempo da camada, e a folha alta não sai da tela no pico', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    // a de 92dvh (o seletor de dia) e uma curta (o peso)
    for (const [nome, acao] of [['seletor de dia', `CTX.abreSeletorDeDia()`], ['peso rápido', `CTX.abreFolha({ k: 'pesoRapido' })`]]) {
      await fecha(nav);
      await aquece(nav, acao);
      const r = await amostra(nav, acao, '.ins-folha', k.quique + 250);
      confereQuique(r, k, nome);
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a segunda folha sobe sobre a primeira, que fica onde está, e os véus somam; a troca do topo não sobe', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await aquece(nav, `CTX.abreFolha({ k: 'editaRefeicao', id: null })`);
    await nav.E(`CTX.abreFolha({ k: 'refeicao', id: 'almoco' })`);
    await nav.espera(k.quique + 200);
    const primeira = await nav.caixa('.ins-folha', 0);
    const r = await amostra(nav, `CTX.abreFolha({ k: 'editaRefeicao', id: null })`, '.ins-folha', k.quique + 250);
    confereQuique(r, k, 'a segunda');
    const depois = await nav.p.evaluate(() => {
      const fs = [...document.querySelectorAll('.ins-folha')];
      return { top: fs[0].getBoundingClientRect().top, anima: fs[0].getAnimations().filter(a => a.playState === 'running').length,
               veus: [...document.querySelectorAll('.ins-folha-w > .ins-veu')].map(v => Number(getComputedStyle(v).opacity)) };
    });
    assert.strictEqual(depois.top, primeira.y, 'a primeira não se moveu');
    assert.strictEqual(depois.anima, 0, 'nem voltou a animar');
    assert.deepStrictEqual(depois.veus, [1, 1], 'os dois véus acesos: somam');

    // a troca: "cadastrar" toma o lugar da busca, sem subir e sem acender véu novo
    await fecha(nav);
    await nav.E(`CTX.abreFolha({ k: 'editaRefeicao', id: null }); CTX.abreFolha({ k: 'seletor', ref: null, idx: 0 })`);
    await nav.espera(k.quique + 200);
    const t = await amostra(nav, `CTX.trocaFolha({ k: 'editaAlimento', id: null })`, '.ins-folha', 200);
    assert.deepStrictEqual(t.vivas, { caixa: [], veu: [], involucro: [] }, 'a folha da troca nasce no lugar, e o véu dela já aceso');
    assert.strictEqual(new Set(t.quadros.map(x => x.top)).size, 1, 'nenhum quadro de deslocamento');
    assert.ok(t.quadros.every(x => x.veu === 1), 'o fundo não pisca: o véu novo nasce aceso');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o painel de pare chega igual à folha; o "Não guardei" não se move', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await aquece(nav, `pare({ texto: 'Apagar o peso de 28/09 tira 1 medida do histórico. Isso não tem volta.', sim: 'Apagar o peso de 28/09' })`);
    const r = await amostra(nav, `pare({ texto: 'Apagar o peso de 28/09 tira 1 medida do histórico. Isso não tem volta.', sim: 'Apagar o peso de 28/09' })`,
      '.pare-w:not(.falhou-w) > .pare', k.quique + 250);
    confereQuique(r, k, 'o pare');
    const frase = await nav.p.evaluate(() => document.querySelector('.pare-t').getAnimations().length);
    assert.strictEqual(frase, 0, 'a frase sobe com o painel, inteira: nada nela se anima à parte');
    await nav.E(`respondePare(false)`);
    await nav.espera(150);

    const f = await amostra(nav, `view.naoGuardado = { oQue: 'a série 1 do Supino', motivo: 'cota', valor: '40 kg × 8' }; view.falhou = true; render();`,
      '.falhou-w > .pare', 250);
    assert.deepStrictEqual(f.vivas, { caixa: [], veu: [], involucro: [] }, 'o "Não guardei" chega parado, com o véu já aceso');
    assert.strictEqual(new Set(f.quadros.map(x => x.top)).size, 1, 'e nenhum quadro de deslocamento');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('sob "Reduzir movimento", folha, painel e véu só esmaecem, no tempo do esmaecer, e nada se desloca', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    const k = await tokens(nav);
    for (const [nome, acao, sel] of [
      ['a folha', `CTX.abreSeletorDeDia()`, '.ins-folha'],
      ['o pare', `pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`, '.pare-w:not(.falhou-w) > .pare']
    ]) {
      await fecha(nav);
      const r = await amostra(nav, acao, sel, 300);
      [['caixa', r.vivas.caixa], ['véu', r.vivas.veu]].forEach(([qual, an]) => {
        assert.deepStrictEqual(an.map(a => a.nome), ['ins-esmaece'], nome + ', ' + qual + ': só esmaece');
        assert.strictEqual(an[0].dur, k.dissolve, nome + ', ' + qual + ': em --ins-dur-dissolve');
        assert.deepStrictEqual(an[0].props, ['opacity'], nome + ', ' + qual + ': só opacidade');
      });
      assert.strictEqual(new Set(r.quadros.map(x => x.top)).size, 1, nome + ': nasce no lugar, nenhum quadro de deslocamento');
    }
    // e sai de uma vez
    await nav.E(`CTX.abreSeletorDeDia()`);
    await nav.espera(300);
    const saiu = await nav.p.evaluate(() => { window.__escopo(`CTX.fechaFolha()`); return document.querySelectorAll('.ins-folha').length; });
    assert.strictEqual(saiu, 0, 'fechou no mesmo desenho');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- o toque no meio da subida ----------

/** O dedo: toque de verdade no Chromium (pelo CDP, segurando `segura` ms); no WebKit, o ponteiro apertado. */
async function dedo(nav, cdp, x, y, segura) {
  if (cdp) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await nav.espera(segura);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await nav.p.mouse.move(x, y);
    await nav.p.mouse.down();
    await nav.espera(segura);
    await nav.p.mouse.up();
  }
}
/** Abre a folha da refeição e espera `aos` ms DELA (no relógio da página); devolve a caixa do × e da folha. */
const abreEEspera = (nav, aos) => nav.p.evaluate(async aos => {
  window.__toques = [];
  if (!window.__ouve) {
    window.__ouve = true;
    const d = n => n ? n.tagName.toLowerCase() + (n.getAttribute('aria-label') ? '[' + n.getAttribute('aria-label') + ']' : '') +
      (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/)[0] : '') : '-';
    ['pointerdown', 'pointerup', 'click'].forEach(t => document.addEventListener(t, e => window.__toques.push([t, d(e.target)]), true));
  }
  const t0 = performance.now();
  window.__escopo(`CTX.abreRefeicao('almoco')`);
  await new Promise(ok => { const f = () => (performance.now() - t0 >= aos ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  const x = [...document.querySelectorAll('.ins-folha-b[aria-label="fechar"]')].pop().getBoundingClientRect();
  return { x: x.x + x.width / 2, y: x.y + x.height / 2, topo: document.querySelector('.ins-folha').getBoundingClientRect().top };
}, aos);

test('o toque no meio da subida chega ao que o dedo mirou, e a folha não para nem volta', DEMORADO, async () => {
  // Na peça 4 o dedo SEGURAVA a camada que chega (pausava a animação). No
  // Chromium a pausa caía no tempo da thread principal, um quadro atrás do
  // compositor, e a folha VOLTAVA um quadro sob o dedo (07 §10). Desde a peça 5
  // nada pausa: a subida segue, e o clique do toque vai ao nó em que o dedo
  // desceu (`miraDoDedo`, na porta do movimento).
  const nav = await abreNavegador();
  const cdp = MOTOR === 'chromium' ? await nav.p.context().newCDPSession(nav.p) : null;
  try {
    const k = await tokens(nav);
    // aquece a folha (no WebKit desta máquina o primeiro desenho dela é lento)
    await nav.E(`CTX.abreRefeicao('almoco')`); await nav.espera(k.quique + 200); await fecha(nav);

    // o VÉU, ~100 ms depois de abrir: rente ao topo, onde a folha nunca chega (o pico dela fica abaixo)
    const v = await abreEEspera(nav, 100);
    assert.ok(v.topo > 40, 'a folha ainda está subindo: topo em ' + v.topo);
    await dedo(nav, cdp, 207, 3, 30);
    assert.ok(await saiu(nav),
      'o véu tocado ~100 ms depois de abrir fecha a folha: ' + JSON.stringify(await nav.p.evaluate(() => window.__toques)));
    await fecha(nav);

    // O DEDO POUSADO NÃO PARA A FOLHA, E NENHUM QUADRO VOLTA. Quadro a quadro,
    // do toque até depois de soltar: a chegada continua correndo (nunca
    // `paused`), o tempo dela só anda para a frente, e no trecho que sobe (até o
    // pico do quique, 55 % do tempo) a caixa só sobe.
    const s = await abreEEspera(nav, 90);
    await nav.p.evaluate(() => {
      const f = document.querySelector('.ins-folha');
      const a = f.getAnimations()[0];
      window.__quadros = [];
      const t0 = performance.now();
      (function q() {
        window.__quadros.push({ t: performance.now() - t0, top: f.isConnected ? f.getBoundingClientRect().top : null,
          estado: a.playState, tempo: a.currentTime });
        if (performance.now() - t0 < 420) requestAnimationFrame(q);
      })();
    });
    const y = Math.round(s.topo + 60);
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 207, y }] });
    else { await nav.p.mouse.move(207, y); await nav.p.mouse.down(); }
    await nav.espera(120);
    if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await nav.p.mouse.up();
    await nav.espera(400);
    const quadros = (await nav.p.evaluate(() => window.__quadros)).filter(q => q.top != null);
    assert.ok(quadros.length > 4, 'amostrou a subida: ' + quadros.length + ' quadros');
    assert.deepStrictEqual([...new Set(quadros.map(q => q.estado))].filter(e => e !== 'running' && e !== 'finished'), [],
      'a chegada nunca para sob o dedo: ' + JSON.stringify(quadros.map(q => q.estado)));
    const recuos = quadros.slice(1).filter((q, i) => q.tempo != null && quadros[i].tempo != null && q.tempo < quadros[i].tempo);
    assert.deepStrictEqual(recuos, [], 'o tempo da chegada só anda para a frente');
    const pico = k.quique * 0.55;
    const sobe = quadros.filter(q => q.tempo != null && q.tempo < pico - 20);
    const volta = sobe.slice(1).filter((q, i) => q.top > sobe[i].top + 0.5);
    assert.deepStrictEqual(volta, [], 'nenhum quadro em que a folha volta, no trecho que sobe: ' + JSON.stringify(sobe.map(q => Math.round(q.top))));
    const toques = await nav.p.evaluate(() => window.__toques);
    const desceu = toques.find(t => t[0] === 'pointerdown'), clicou = toques.filter(t => t[0] === 'click');
    assert.ok(desceu && clicou.length === 1 && clicou[0][1] === desceu[1],
      'um clique só, no nó em que o dedo desceu: ' + JSON.stringify(toques));
    await nav.espera(k.quique);
    await fecha(nav);

    // o ×, no meio da subida: o dedo que desce nele fecha a folha. O × anda até
    // ~4 px/ms no começo do quique, e o robô lê a caixa um quadro antes de o
    // dedo descer: em alguns toques o dedo já cai abaixo dele. Conta o que caiu.
    const tentativas = [];
    for (let i = 0; i < 6 && tentativas.filter(t => t.noX).length < 2; i++) {
      const c = await abreEEspera(nav, 220);
      await dedo(nav, cdp, Math.round(c.x), Math.round(c.y), 40);
      await nav.espera(150);
      const fechada = await nav.E(`!view.pilha.length`) && await saiu(nav);
      const r = await nav.p.evaluate(() => ({ toques: window.__toques, aberta: document.querySelectorAll('.ins-folha').length }));
      r.aberta = fechada ? 0 : Math.max(1, r.aberta);
      const desceu = r.toques.find(t => t[0] === 'pointerdown');
      const cliques = r.toques.filter(t => t[0] === 'click');
      tentativas.push({ noX: !!desceu && desceu[1].startsWith('button[fechar]'), fechou: r.aberta === 0,
        mesmoNo: !!desceu && cliques.length === 1 && desceu[1] === cliques[0][1], toques: r.toques });
      await fecha(nav);
    }
    const noX = tentativas.filter(t => t.noX);
    assert.ok(noX.length > 0, 'o dedo não caiu no × em nenhuma tentativa: ' + JSON.stringify(tentativas));
    assert.deepStrictEqual(noX.filter(t => !t.fechou), [], 'todo toque que desceu no × fechou a folha (sem a mira, nenhum fechava)');
    assert.deepStrictEqual(tentativas.filter(t => !t.mesmoNo), [], 'e todo toque saiu, uma vez só, no nó em que desceu');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- o teclado, com o descanso contando ----------

/** Aperta `tecla` `n` vezes e devolve, a cada uma, onde o foco está e se está dentro de `dentro`. */
const tabs = (nav, tecla, n, dentro) => (async () => {
  const out = [];
  for (let i = 0; i < n; i++) {
    await nav.p.keyboard.press(tecla);
    out.push(await nav.p.evaluate(s => {
      const e = document.activeElement;
      return { el: e ? e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.getAttribute('data-a') ? '[' + e.getAttribute('data-a') + ']' : '') : null,
               dentro: !!(e && e.closest(s)), body: e === document.body || !e };
    }, dentro));
  }
  return out;
})();

test('com o descanso contando, o Tab não sai da folha para o cronômetro, nem do pare, nem do "Não guardei"', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await nav.E(`startTimer(120, 'descanso · série 1 · Supino'); render();`);
    await nav.espera(400);
    for (const [nome, acao, dentro] of [
      ['a folha', `CTX.abreSeletorDeDia()`, '.ins-folha-w'],
      // `void`: `pare()` devolve a promessa da resposta, e o `evaluate` esperaria por ela
      ['o pare', `void pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`, '.pare-w:not(.falhou-w)'],
      ['o "Não guardei"', `view.naoGuardado = { oQue: 'a série 1 do Supino', motivo: 'cota', valor: null }; view.falhou = true; render();`, '.falhou-w']
    ]) {
      await nav.E(acao);
      await nav.espera(800);
      const foco = [...await tabs(nav, 'Tab', 14, dentro), ...await tabs(nav, 'Shift+Tab', 14, dentro)];
      const fora = foco.filter(f => !f.dentro && !f.body);
      assert.deepStrictEqual(fora, [], nome + ': o foco saiu da camada (antes: o 11º Tab caía no −15; o Shift+Tab, na barra de abas)');
      await fecha(nav);
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o conteúdo das folhas não passa da largura delas, e não rola de lado', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const folhas = [`CTX.abreSeletorDeDia()`, `CTX.abreFolha({ k: 'refeicao', id: 'almoco' })`, `CTX.abreFolha({ k: 'editaRefeicao', id: 'almoco' })`,
      `CTX.abreFolha({ k: 'seletor', ref: 'almoco', idx: null })`, `CTX.abreFolha({ k: 'editaAlimento', id: null })`,
      `CTX.abreFolha({ k: 'pesoRapido' })`, `CTX.abreFolha({ k: 'poeODia', data: hojeISO() })`];
    for (const acao of folhas) {
      await fecha(nav);
      await nav.E(acao);
      await nav.espera(200);
      const c = await nav.p.evaluate(() => { const e = [...document.querySelectorAll('.ins-folha-c')].pop();
        return e ? { sw: e.scrollWidth, cw: e.clientWidth, ox: getComputedStyle(e).overflowX } : null; });
      assert.ok(c, acao + ': a folha abriu');
      assert.ok(c.sw <= c.cw, acao + ': nada passa da largura da folha (' + c.sw + ' > ' + c.cw + '), então nada fica cortado');
      assert.ok(c.ox === 'hidden' || c.ox === 'clip', acao + ': e o corpo não rola de lado (overflow-x ' + c.ox + ')');
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});
