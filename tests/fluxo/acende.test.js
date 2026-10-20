// O AVISO CURTO SOBE E ACENDE, E SAI APAGANDO — medido no motor de verdade.
//
// Peça 7 do motion (dono, 16/10, pergunta 10: o aviso entra subindo
// `--ins-sobe-aviso` e acendendo, sai apagando, em `--ins-dur-lugar` na
// `--ins-curva`, e o texto novo refaz a entrada; pergunta 2: sob "Reduzir
// movimento" só a opacidade). Antes, o aviso aparecia, trocava de texto e sumia,
// cada coisa num quadro, e entre um aviso e outro a região viva era
// `display: none` — fora da árvore de acessibilidade (docs/motion/05 §3.2).
//
// A forma: `#toast` é o LUGAR (fixo, centrado, acompanhando o cronômetro pelo
// `translate` — peça 3) e a mensagem é o nó de dentro, `#toast > .aviso`, que é
// quem chega e sai. Os dois movimentos se somam, e é isso que o caso da
// composição cobra: o aviso não pula quando o cronômetro entra ou sai no meio
// da subida dele.
//
// O jsdom não tem layout nem animação, então estes casos sobem o build num
// Chromium (`navegador.js`; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit). O
// tempo pelo texto e a ordem dos nós são `aviso.test.js`, na árvore; a forma no
// CSS é a guarda (j) de `estilo.test.ts`. Os tempos e as curvas são lidos dos
// tokens, nunca escritos aqui.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador, MOTOR } from './navegador.js';

const DEMORADO = { timeout: 120000 };
afterAll(fechaNavegador);

const MEDIA = 'Desconectado. O histórico continua neste aparelho.';
const OUTRA = 'Foto guardada neste aparelho.';
const DESCANSO = `startTimer(90, 'descanso · série 1 · Supino')`;
// A folga de leitura de caixa no WebKit desta máquina (descanso.test.js, FOLGA):
// a caixa de um elemento que anima no compositor às vezes vem ~1 px atrás.
const FOLGA = 1.5;

const tokens = nav => nav.p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const ms = n => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(cs.getPropertyValue(n).trim()); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : NaN; };
  return { lugar: ms('--ins-dur-lugar'), dissolve: ms('--ins-dur-dissolve'), sobe: parseFloat(cs.getPropertyValue('--ins-sobe-aviso')),
           curva: cs.getPropertyValue('--ins-curva').trim() };
});
const numeros = c => (String(c).match(/-?\d*\.?\d+/g) || []).map(Number).join();
const desloca = v => { if (!v || v === 'none') return 0; const p = String(v).trim().split(/\s+/); return p.length > 1 ? parseFloat(p[1]) : 0; };

/**
 * Roda `acao` no escopo do app e amostra quadro a quadro, por `ms`: a caixa do
 * lugar (`#toast`) e da mensagem (`#toast > .aviso`), a opacidade, as classes,
 * as animações da mensagem e do lugar, e o cronômetro.
 */
const amostra = (nav, acao, ms) => nav.p.evaluate(async ([acao, ms]) => {
  const anims = e => e ? e.getAnimations().map(a => {
    const k = a.effect.getKeyframes();
    return { tipo: a.constructor.name, nome: a.animationName || a.transitionProperty, dur: a.effect.getTiming().duration,
             curva: a.transitionProperty ? a.effect.getTiming().easing : (k[0] || {}).easing, estado: a.playState, t: a.currentTime, a,
             de: { tr: (k[0] || {}).translate, op: (k[0] || {}).opacity }, para: { tr: (k[k.length - 1] || {}).translate, op: (k[k.length - 1] || {}).opacity },
             props: [...new Set(k.flatMap(q => Object.keys(q)))].filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)) };
  }) : [];
  const q = [];
  const t0 = performance.now();
  const vistas = new Set();
  window.__escopo(acao);
  await new Promise(ok => {
    const passo = () => {
      const t = performance.now() - t0;
      const lugar = document.getElementById('toast'), m = lugar.firstElementChild;
      const rl = lugar.getBoundingClientRect(), rm = m && m.getBoundingClientRect(), tm = document.getElementById('timer');
      const am = anims(m);
      am.forEach(x => vistas.add(x.a));
      q.push({ t, lugar: rl.top, display: getComputedStyle(lugar).display, vis: getComputedStyle(lugar).visibility,
               msg: m ? { top: rm.top, bottom: rm.bottom, cx: rm.x + rm.width / 2, cy: rm.y + rm.height / 2, op: Number(getComputedStyle(m).opacity),
                          tr: getComputedStyle(m).translate, cls: m.className, texto: m.textContent, no: m.__no || (m.__no = Math.random()) } : null,
               animMsg: am.map(({ a, ...x }) => x), animLugar: anims(lugar).map(({ a, ...x }) => x),
               timer: tm.classList.contains('on') || tm.classList.contains('sai') ? tm.getBoundingClientRect().top : null });
      if (t < ms) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  return { q, animacoesDaMensagem: vistas.size };
}, [acao, ms]);

/** O modo de sessão do treino de hoje, parado. */
async function modo(nav) {
  await nav.treinoDeHoje({ sessao: true });
  await nav.espera(150);
}
/** Uma passada a frio: a primeira vez que o aviso aparece no WebKit desta máquina custa um desenho lento. */
async function aquece(nav) {
  await nav.E(`toast('aquece')`); await nav.espera(250); await nav.E(`apagaAviso()`); await nav.espera(400);
}

test('o aviso sobe 8 px e acende em 160 ms na curva do lugar, e sai só apagando, pelo relógio, com o toque passando por ele', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    assert.ok(k.lugar > 0 && k.sobe > 0, 'os tokens: ' + JSON.stringify(k));
    await aquece(nav);
    // ---- a entrada
    const e = await amostra(nav, `toast(${JSON.stringify(MEDIA)})`, k.lugar + 120);
    const q = e.q.filter(x => x.msg);
    assert.strictEqual(e.animacoesDaMensagem, 1, 'uma animação só na mensagem');
    const a = q[0].animMsg[0];
    assert.deepStrictEqual([a.tipo, a.nome, a.dur, numeros(a.curva), a.props.sort().join()],
      ['CSSAnimation', 'ins-chega-aviso', k.lugar, numeros(k.curva), 'opacity,translate'],
      'sobe e acende em --ins-dur-lugar, na --ins-curva, só translate e opacidade: ' + JSON.stringify(a));
    assert.deepStrictEqual([desloca(a.de.tr), Number(a.de.op), desloca(a.para.tr), Number(a.para.op)], [k.sobe, 0, 0, 1],
      'de --ins-sobe-aviso abaixo e apagado, até o lugar e aceso');
    assert.ok(e.q.every(x => x.animLugar.length === 0), 'o lugar não se move: a entrada é da mensagem');
    const rel = q.map(x => x.msg.top - x.lugar);
    assert.ok(rel.every((r, i) => i === 0 || r <= rel[i - 1] + 0.05), 'só sobe: ' + rel.map(r => r.toFixed(2)).join(' '));
    assert.ok(q.every((x, i) => i === 0 || x.msg.op >= q[i - 1].msg.op - 0.001), 'só acende: ' + q.map(x => x.msg.op.toFixed(2)).join(' '));
    assert.ok(q.filter(x => x.msg.op > 0.02 && x.msg.op < 0.98).length >= 3, 'acende em vários quadros, e não de uma vez');
    assert.ok(Math.max(...rel) <= k.sobe + 0.05 && Math.max(...rel) > 1, 'parte de no máximo --ins-sobe-aviso abaixo: ' + Math.max(...rel));
    const fim = q[q.length - 1];
    assert.ok(Math.abs(rel[rel.length - 1]) < 0.05 && fim.msg.op === 1, 'e assenta no lugar, aceso');

    // ---- a saída: nada de evento de fim chega ao app, e mesmo assim ela acaba
    await nav.p.evaluate(() => ['transitionend', 'transitioncancel', 'animationend', 'animationcancel']
      .forEach(t => window.addEventListener(t, ev => ev.stopImmediatePropagation(), true)));
    const s = await amostra(nav, `apagaAviso()`, k.lugar + 200);
    const indo = s.q.filter(x => x.msg);
    assert.ok(indo.length >= 3, 'a mensagem continua na tela enquanto apaga: ' + indo.length + ' quadros');
    const b = indo[0].animMsg.find(x => x.nome === 'ins-apaga');
    assert.ok(b, 'apaga: ' + JSON.stringify(indo[0].animMsg));
    assert.deepStrictEqual([b.dur, numeros(b.curva), b.props.join()], [k.lugar, numeros(k.curva), 'opacity'],
      'só apagando, no mesmo tempo e na mesma curva: ' + JSON.stringify(b));
    assert.ok(indo.every(x => /\bsai\b/.test(x.msg.cls) && Math.abs(x.msg.top - x.lugar) < 0.05), 'e não vai a lugar nenhum');
    assert.ok(indo.every((x, i) => i === 0 || x.msg.op <= indo[i - 1].msg.op + 0.001), 'só apaga');
    assert.ok(indo.filter(x => x.msg.op > 0.02 && x.msg.op < 0.98).length >= 2, 'em vários quadros');
    assert.ok(indo[indo.length - 1].t <= k.lugar + 80, 'o relógio da porta tira o nó no tempo da saída: ' + indo[indo.length - 1].t.toFixed(0));
    assert.ok(!s.q[s.q.length - 1].msg, 'e a região fica vazia');
    assert.ok(s.q.concat(e.q).every(x => x.display !== 'none' && x.vis !== 'hidden'), 'a região nunca some');

    // ---- o toque passa pela mensagem que apaga
    await nav.E(`toast(${JSON.stringify(MEDIA)})`); await nav.espera(k.lugar + 100);
    const pega = await nav.p.evaluate(() => {
      const m = document.querySelector('#toast > .aviso'), r = m.getBoundingClientRect();
      const em = () => document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      const naTela = m.contains(em());
      window.__escopo('apagaAviso()');
      const apagando = em();
      return { naTela, apagando: !!apagando && !document.getElementById('toast').contains(apagando) };
    });
    assert.ok(pega.naTela, 'na tela, a mensagem pega o toque como sempre pegou');
    assert.ok(pega.apagando, 'apagando, o toque passa por ela e chega ao que está embaixo');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('um texto novo com o aviso na tela refaz a entrada; o mesmo texto não se mexe', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await aquece(nav);
    await nav.E(`toast(${JSON.stringify(MEDIA)})`); await nav.espera(k.lugar + 250);
    const novo = await amostra(nav, `toast(${JSON.stringify(OUTRA)})`, k.lugar + 80);
    const q = novo.q.filter(x => x.msg);
    assert.ok(q.every(x => x.msg.texto === OUTRA), 'a mensagem nova está na tela desde o primeiro quadro');
    assert.strictEqual(new Set(q.map(x => x.msg.no)).size, 1);
    const a = q[0].animMsg[0];
    assert.ok(a && a.nome === 'ins-chega-aviso' && a.t <= 40, 'a entrada recomeça do zero: ' + JSON.stringify(a));
    assert.ok(q[0].msg.op < 0.6 && q[0].msg.top - q[0].lugar > 1, 'de novo apagada e abaixo do lugar no primeiro quadro: ' + JSON.stringify(q[0].msg));
    assert.ok(q.filter(x => x.msg.op > 0.02 && x.msg.op < 0.98).length >= 3, 'e acende de novo em vários quadros');
    const mesmo = await amostra(nav, `toast(${JSON.stringify(OUTRA)})`, 100);
    assert.strictEqual(new Set(mesmo.q.map(x => x.msg.no).concat(q[0].msg.no)).size, 1, 'o mesmo texto: o mesmo nó');
    assert.ok(mesmo.q.every(x => x.msg.op === 1 && Math.abs(x.msg.top - x.lugar) < 0.05 && x.animMsg.every(y => y.estado === 'finished')),
      'e nada se mexe: não é outra mensagem');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o aviso não pula quando o cronômetro entra ou sai no meio da entrada dele: os dois movimentos se somam', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await modo(nav);
    await aquece(nav);
    for (const [nome, acao] of [
      ['o descanso começa', `toast(${JSON.stringify(MEDIA)}); setTimeout(function () { window.__escopo(${JSON.stringify(DESCANSO)}); }, 40);`],
      ['o descanso para', `toast(${JSON.stringify(OUTRA)}); setTimeout(function () { window.__escopo('stopTimer(); render();'); }, 40);`]
    ]) {
      const s = await amostra(nav, acao, 600);
      const q = s.q.filter(x => x.msg);
      // primeiro o que se VÊ — a mensagem na tela, quadro a quadro —, e depois a forma
      const trilha = q.map(x => x.msg.top.toFixed(1)).join(' ');
      const altura = (await nav.caixa('#timer')).h;
      const passos = q.slice(1).map((x, i) => Math.abs(x.msg.top - q[i].msg.top));
      assert.ok(Math.max(...passos) < altura / 2,
        nome + ': o aviso andou ' + Math.max(...passos).toFixed(1) + ' px num quadro (a altura do cronômetro é ' + altura.toFixed(0) + '): ' + trilha);
      assert.ok(new Set(q.map(x => x.msg.top.toFixed(1))).size >= 6, nome + ': em vários quadros: ' + trilha);
      q.forEach(x => { if (x.timer != null) assert.ok(x.msg.bottom <= x.timer + FOLGA, nome + ' a ' + x.t.toFixed(0) + ' ms: o aviso por baixo do cronômetro'); });
      const ops = q.map(x => x.msg.op);
      assert.ok(ops.every((o, i) => i === 0 || o >= ops[i - 1] - 0.001) && ops[0] < 0.6 && ops[ops.length - 1] === 1,
        nome + ': a mensagem só acende, do começo ao fim: ' + ops.map(o => o.toFixed(2)).join(' '));
      const lugar = q.map(x => x.lugar);
      assert.ok(Math.abs(lugar[lugar.length - 1] - lugar[0]) > 40, nome + ': o lugar acompanhou o cronômetro');
      const rel = q.map(x => x.msg.top - x.lugar);
      assert.ok(rel.every((r, i) => i === 0 || r <= rel[i - 1] + FOLGA * (MOTOR === 'webkit' ? 1 : 0.05)),
        nome + ': a mensagem continua subindo os 8 px dela dentro do lugar que anda: ' + rel.map(r => r.toFixed(1)).join(' '));
      const f = q[q.length - 1];
      assert.ok(Math.abs(f.msg.top - f.lugar) < 0.05 && f.msg.op === 1, nome + ': e assenta, aceso, no lugar novo');
      // a forma: uma entrada só, que o acompanhamento não reinicia, correndo quando o lugar começa a andar
      assert.strictEqual(s.animacoesDaMensagem, 1, nome + ': a entrada é uma só, do começo ao fim — o acompanhamento não a reinicia');
      const andou = q.findIndex(x => x.animLugar.some(a => a.nome === 'translate' && a.estado === 'running'));
      assert.ok(andou > 0 && q[andou].animMsg.some(a => a.nome === 'ins-chega-aviso' && a.estado === 'running'),
        nome + ': o lugar começou a acompanhar com a mensagem ainda chegando (quadro ' + andou + ')');
      const ts = q.map(x => (x.animMsg[0] || {}).t || 0);
      assert.ok(ts.every((t, i) => i === 0 || t >= ts[i - 1]), nome + ': o tempo da entrada só anda para a frente');
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('sob "Reduzir movimento" o aviso só acende, em --ins-dur-dissolve, e sai de uma vez', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    const k = await tokens(nav);
    await aquece(nav);
    const e = await amostra(nav, `toast(${JSON.stringify(MEDIA)})`, k.dissolve + 100);
    const q = e.q.filter(x => x.msg);
    const a = q[0].animMsg;
    assert.deepStrictEqual(a.map(x => [x.nome, x.dur, x.props.join()]), [['ins-esmaece', k.dissolve, 'opacity']],
      'só esmaecer, em --ins-dur-dissolve, só opacidade: ' + JSON.stringify(a));
    assert.ok(k.dissolve <= k.lugar, 'no máximo o tempo do lugar');
    assert.ok(q.every(x => Math.abs(x.msg.top - x.lugar) < 0.05 && x.msg.tr === 'none'), 'nada sobe: a mensagem nasce no lugar');
    assert.ok(q.every((x, i) => i === 0 || x.msg.op >= q[i - 1].msg.op - 0.001) && q[q.length - 1].msg.op === 1, 'e acende');
    const novo = await amostra(nav, `toast(${JSON.stringify(OUTRA)})`, 60);
    assert.ok(novo.q[0].animMsg.some(x => x.nome === 'ins-esmaece'), 'o texto novo acende de novo: é outra mensagem');
    const s = await amostra(nav, `apagaAviso()`, 120);
    assert.ok(s.q.every(x => !x.msg), 'sai de uma vez: vazia desde o primeiro quadro');
    assert.ok(s.q.every(x => x.animLugar.length === 0), 'e nada se move');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a região viva está na árvore de acessibilidade com e sem aviso, e sem aviso não sobra frase velha', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    // o que o motor expõe: o papel e o texto da região, pela árvore que o
    // Playwright monta (os dois motores) e, no Chromium, pela do próprio motor
    const arvore = async () => {
      const papel = await nav.p.locator('#toast').ariaSnapshot({ timeout: 3000 }).catch(e => 'fora da árvore: ' + e.message.split('\n')[0]);
      let doMotor = null;
      if (MOTOR === 'chromium') {
        const s = await nav.p.context().newCDPSession(nav.p);
        const { root } = await s.send('DOM.getDocument', { depth: 0 });
        const { nodeId } = await s.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#toast' });
        const { nodes } = await s.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
        const n = nodes[0] || {};
        doMotor = { papel: n.role && n.role.value, ignorado: !!n.ignored };
        await s.detach();
      }
      return { papel, doMotor };
    };
    const sem = await arvore();
    assert.strictEqual(sem.papel, '- status', 'sem aviso, a região está na árvore, vazia: ' + JSON.stringify(sem));
    if (sem.doMotor) assert.deepStrictEqual(sem.doMotor, { papel: 'status', ignorado: false }, 'e o motor a expõe');
    await nav.E(`toast(${JSON.stringify(MEDIA)})`);
    await nav.espera(30);
    const com = await arvore();
    assert.strictEqual(com.papel, '- status: ' + MEDIA, 'o texto entra numa região que já estava lá');
    if (com.doMotor) assert.deepStrictEqual(com.doMotor, { papel: 'status', ignorado: false });
    await nav.E(`apagaAviso()`);
    await nav.espera(k.lugar + 150);
    const depois = await arvore();
    assert.strictEqual(depois.papel, '- status', 'depois, de novo vazia: nada de "' + MEDIA + '" para o dedo do leitor de tela achar');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('na troca de camada o aviso é só o vivo: a foto velha não aparece, e só o aviso na tela muda de altura com o rodapé', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await aquece(nav);
    await nav.E(`CTX.abreAjustes()`); await nav.espera(600); await nav.E(`CTX.fechaAjustes()`); await nav.espera(600);
    const troca = codigo => nav.p.evaluate(async c => {
      window.__escopo(c);
      const vivas = new Set(), opVelha = new Set();
      let viu = false, chegando = false;
      const t0 = performance.now();
      while (performance.now() - t0 < 1500) {
        await new Promise(ok => requestAnimationFrame(ok));
        if (!document.activeViewTransition) { if (viu) break; continue; }
        viu = true;
        document.getAnimations().filter(a => a.effect && a.effect.pseudoElement && /\(aviso\)/.test(a.effect.pseudoElement))
          .forEach(a => vivas.add(a.effect.pseudoElement + ' ' + a.animationName));
        try { opVelha.add(getComputedStyle(document.documentElement, '::view-transition-old(aviso)').opacity); } catch (e) {}
        const m = document.querySelector('#toast > .aviso');
        if (m && m.getAnimations().some(a => a.animationName === 'ins-chega-aviso' && a.playState === 'running')) chegando = true;
      }
      return { viu, vivas: [...vivas], opVelha: [...opVelha], chegando };
    }, codigo);
    // com o aviso na tela, abrir uma tela cheia tira a barra de abas: ele desce junto (peça 6), e a foto velha não aparece
    await nav.E(`toast(${JSON.stringify(MEDIA)})`); await nav.espera(300);
    let r = await troca(`CTX.abreAjustes()`);
    assert.ok(r.viu, 'houve troca de camada');
    assert.deepStrictEqual(r.vivas, ['::view-transition-image-pair(aviso) ins-rodape-desce'], 'o aviso na tela muda de altura com a troca: ' + JSON.stringify(r));
    assert.deepStrictEqual(r.opVelha, ['0'], 'e a foto velha dele nunca aparece');
    await nav.espera(400); await nav.E(`CTX.fechaAjustes()`); await nav.espera(600);
    // sem aviso: o lugar vazio também tem foto, e não anda
    await nav.E(`apagaAviso()`); await nav.espera(400);
    r = await troca(`CTX.abreAjustes()`);
    assert.ok(r.viu);
    assert.deepStrictEqual(r.vivas, [], 'sem aviso, nada do aviso se move');
    await nav.espera(400); await nav.E(`CTX.fechaAjustes()`); await nav.espera(600);
    // o aviso que chega junto com a troca chega dentro dela, na foto viva
    r = await troca(`CTX.abreAjustes(); toast(${JSON.stringify(OUTRA)})`);
    assert.ok(r.viu && r.chegando, 'a entrada do aviso roda durante a troca: ' + JSON.stringify(r));
    assert.deepStrictEqual(r.opVelha, ['0']);
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});
