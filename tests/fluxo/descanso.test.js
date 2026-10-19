// O DESCANSO SOBE DA BORDA E DESCE POR ONDE VEIO, medido no motor de verdade.
//
// Peça 3 do motion (docs/motion/03 §4.3; dono, 16/10, pergunta 9: "sobe da
// borda e desce"; pergunta 1: a camada entra e sai em 350 ms na curva do
// iPhone, sem quique; pergunta 2: sob "Reduzir movimento" esmaece ao chegar e
// sai de uma vez). Antes, o cronômetro aparecia e sumia num quadro, o toast
// saltava 82 px no meio, e no modo de sessão os dois flutuavam 52 px acima do
// fundo da tela (docs/motion/03 §8.2): a reserva da barra de abas era zerada no
// `#app`, e eles moram fora dele. Com o cronômetro em cena, a pergunta de 1h30
// do modo ficava com os dois botões POR BAIXO dele.
//
// O jsdom não tem layout nem animação, então estes casos sobem o build num
// Chromium (`navegador.js`; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit). A
// ordem das classes, o estado gravado antes do desenho e o caminho parado são
// `cena.test.js`, na árvore.
//
// Os tempos e a curva são lidos dos tokens, nunca escritos aqui: se o dono
// mudar a resposta, o caso acompanha.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador } from './navegador.js';

const DEMORADO = { timeout: 120000 };
afterAll(fechaNavegador);

const DESCANSO = `startTimer(90, 'descanso · série 1 · Supino')`;
// A folga de leitura entre duas caixas que andam juntas. No WebKit desta
// máquina, ler a caixa de um elemento com transição no compositor às vezes
// devolve um valor ~1 px atrás do quadro (medido: duas leituras do MESMO
// cronômetro no mesmo quadro, 0,92 px de diferença, com o `currentTime` e o
// `translate` computado das três transições iguais). O que prova que andam
// juntas é o instante, o tempo e a curva de cada transição, cobrados exatos;
// a caixa quadro a quadro cobra a ordem com esta folga — o defeito que ela
// pega é de 52 px (o vão) ou de 10 px (a altura corrigida um quadro tarde).
const FOLGA = 1.5;
const PARA = `stopTimer(); render();`;

/** Os tokens do movimento, como o motor os resolve. */
const tokens = nav => nav.p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const ms = n => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(cs.getPropertyValue(n).trim()); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : NaN; };
  return { entra: ms('--ins-dur-entra'), sai: ms('--ins-dur-sai'), dissolve: ms('--ins-dur-dissolve'),
           curva: cs.getPropertyValue('--ins-curva-camada').trim() };
});
/** O deslocamento vertical de um valor de `translate` (`none` é 0; `0px 82.19px` é 82,19). */
const desloca = v => { if (!v || v === 'none') return 0; const p = String(v).trim().split(/\s+/); return p.length > 1 ? parseFloat(p[1]) : 0; };
/** `cubic-bezier(.32, .72, 0, 1)` e `cubic-bezier(0.32, 0.72, 0, 1)` são a mesma curva. */
const numeros = c => (String(c).match(/-?\d*\.?\d+/g) || []).map(Number);

/**
 * Roda `acao` no escopo do app e amostra quadro a quadro, por `ms`: a caixa do
 * cronômetro, do toast e da faixa, a visibilidade, as classes, e o que o dedo
 * acharia no centro do −15. No segundo quadro, as animações vivas de cada um;
 * e o instante em que cada transição de `translate` começou.
 */
const amostra = (nav, acao, ms) => nav.p.evaluate(async ([acao, ms]) => {
  const caixa = s => {
    const e = document.querySelector(s);
    if (!e || !e.getClientRects().length) return null;
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { top: r.top, bottom: r.bottom, h: r.height, vis: cs.visibility, op: Number(cs.opacity) };
  };
  const anims = s => {
    const e = document.querySelector(s);
    return e ? e.getAnimations().map(a => {
      const t = a.effect.getTiming(), k = a.effect.getKeyframes();
      return { tipo: a.constructor.name, nome: a.transitionProperty || a.animationName, dur: t.duration,
               curva: a.transitionProperty ? t.easing : (k[0] || {}).easing, estado: a.playState,
               de: (k[0] || {}).translate, para: (k[k.length - 1] || {}).translate,
               props: [...new Set(k.flatMap(q => Object.keys(q)))].filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)) };
    }) : [];
  };
  const quadros = [];
  const inicios = {};
  let vivas = null;
  const t0 = performance.now();
  window.__escopo(acao);
  await new Promise(ok => {
    const passo = () => {
      const t = performance.now() - t0;
      if (!vivas && quadros.length === 1) vivas = { timer: anims('#timer'), toast: anims('#toast'), faixa: anims('.ins-faixa') };
      // o instante de início de cada transição de `translate`: o primeiro que o
      // motor resolver (até o compositor confirmar, ele fica pendente — sob
      // carga, por mais de um quadro)
      ['#timer', '#toast', '.ins-faixa'].forEach(sel => {
        const e = document.querySelector(sel);
        const a = e && e.getAnimations().find(x => x.transitionProperty === 'translate' && x.startTime !== null);
        if (a && !(sel in inicios)) inicios[sel] = a.startTime;
      });
      const m = document.getElementById('tmenos').getBoundingClientRect();
      const sob = document.elementFromPoint(m.x + m.width / 2, m.y + m.height / 2);
      quadros.push({ t, timer: caixa('#timer'), toast: caixa('#toast'), faixa: caixa('.ins-faixa'),
                     classes: document.getElementById('timer').className,
                     menosSobODedo: !!sob && sob.id === 'tmenos', larg: document.documentElement.scrollWidth });
      if (t < ms) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  return { quadros, vivas, inicios, h: window.innerHeight,
           publicada: getComputedStyle(document.documentElement).getPropertyValue('--ins-timer-h').trim() };
}, [acao, ms]);

/** O modo de sessão com o cartão aberto; com `pergunta`, a faixa de 1h30 dentro dele. */
async function modo(nav, { pergunta = false, aviso = false } = {}) {
  await nav.treinoDeHoje({ sessao: true });
  await nav.E(`if (view.open !== 0) toggle(0);
    ${pergunta ? 'S.sessao.ultima = Date.now() - 95 * 60000;' : ''}
    render(); ${aviso ? `toast('Um aviso curto, para ver se ele acompanha.');` : ''}`);
  await nav.espera(150);
  assert.ok(await nav.caixa('.ins-modo'), 'no modo de sessão');
  if (pergunta) assert.ok(await nav.caixa('.ins-modo .ins-faixa-p'), 'com a pergunta de 1h30 dentro dele');
}

test('no modo, o fundo do cronômetro é o fundo da tela, e a pergunta de 1h30 fica tocável acima dele; fora do modo, ele mora sobre a barra de abas', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await modo(nav, { pergunta: true, aviso: true });
    await nav.E(DESCANSO);
    await nav.espera(600);
    const m = await nav.p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const botoes = [...document.querySelectorAll('.ins-faixa-b')].map(b => {
        const c = b.getBoundingClientRect();
        return { texto: b.textContent, acerta: document.elementFromPoint(c.x + c.width / 2, c.y + c.height / 2) === b };
      });
      return { timer: r('#timer'), toast: r('#toast'), faixa: r('.ins-faixa'), botoes, h: innerHeight,
               reserva: getComputedStyle(document.getElementById('timer')).bottom };
    });
    assert.ok(Math.abs(m.timer.bottom - m.h) <= 0.5,
      'no modo, o fundo do cronômetro tem de ser o fundo da tela: ' + m.timer.bottom + ' de ' + m.h +
      ' (antes do conserto, 844: 52 px acima, com o treino aparecendo por baixo)');
    assert.strictEqual(m.reserva, '0px', 'no modo a reserva do rodapé é só a área segura (zero aqui)');
    // a medida publicada é inteira e a caixa tem fração: meio pixel de folga
    assert.ok(m.faixa.bottom <= m.timer.top + 0.5, 'a faixa fica acima do cronômetro: ' + m.faixa.bottom + ' > ' + m.timer.top);
    assert.ok(m.toast.bottom <= m.faixa.top + 0.5, 'e o toast acima da faixa');
    assert.strictEqual(m.botoes.length, 2);
    m.botoes.forEach(b => assert.ok(b.acerta,
      '"' + b.texto + '" está por baixo do cronômetro: o dedo acertaria outra coisa (antes do conserto, o rótulo do descanso)'));

    await nav.E(`CTX.fechaModoDeSessao(); render();`);
    await nav.espera(400);
    const f = await nav.p.evaluate(() => {
      const t = document.querySelector('.ins-tabbar');
      return { timer: document.getElementById('timer').getBoundingClientRect(), barra: t && t.getBoundingClientRect(),
               reserva: parseFloat(getComputedStyle(document.getElementById('timer')).bottom), h: innerHeight };
    });
    assert.ok(f.barra, 'fora do modo, com a barra de abas');
    assert.ok(f.reserva > 0, 'fora do modo a reserva tem a barra');
    assert.ok(Math.abs(f.timer.bottom - (f.h - f.reserva)) <= 0.5 && f.timer.bottom <= f.barra.top,
      'fora do modo o cronômetro continua sobre a barra de abas: fundo ' + f.timer.bottom + ', barra em ' + f.barra.top);
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o cronômetro sobe da borda no tempo e na curva da camada, tocável no caminho, e desce por onde veio sem ninguém escutar o fim', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await modo(nav);
    const tok = await tokens(nav);
    assert.ok(tok.entra > 0 && tok.sai > 0, 'os tokens da camada se leem: ' + JSON.stringify(tok));
    // Nenhum evento de fim chega ao app: se a descida dependesse dele, ficaria presa.
    await nav.p.evaluate(() => ['transitionend', 'transitioncancel', 'animationend', 'animationcancel']
      .forEach(t => window.addEventListener(t, e => e.stopImmediatePropagation(), true)));

    // ---- sobe
    const sobe = await amostra(nav, DESCANSO, tok.entra + 150);
    const q = sobe.quadros, fim = q[q.length - 1].timer;
    assert.deepStrictEqual(sobe.vivas.timer.map(a => [a.tipo, a.nome, a.dur]), [['CSSTransition', 'translate', tok.entra]],
      'uma transição só, de `translate`, em --ins-dur-entra: ' + JSON.stringify(sobe.vivas.timer));
    assert.deepStrictEqual(numeros(sobe.vivas.timer[0].curva), numeros(tok.curva), 'na curva da camada: ' + sobe.vivas.timer[0].curva);
    assert.ok(Math.abs(fim.bottom - sobe.h) <= 0.5, 'e termina com o fundo na borda da tela');
    // de onde a transição parte, pelo motor: a altura inteira dele abaixo do lugar (mais a reserva do
    // rodapé, que no modo é zero aqui) — a borda da tela, e não o meio do ar
    assert.ok(desloca(sobe.vivas.timer[0].de) >= fim.h - 0.5 && desloca(sobe.vivas.timer[0].para) === 0,
      'nasce da borda: a transição parte de ' + sobe.vivas.timer[0].de + ' e chega a ' + sobe.vivas.timer[0].para);
    assert.ok(q[0].timer.top >= fim.top + 0.5 * fim.h, 'e no primeiro quadro amostrado ainda está embaixo (top ' + q[0].timer.top + ')');
    assert.ok(q.every(x => x.timer.vis === 'visible'), 'visível desde o primeiro quadro');
    assert.ok(q.every((x, i) => i === 0 || x.timer.top <= q[i - 1].timer.top + FOLGA), 'só sobe, nunca volta');
    assert.ok(Math.min(...q.map(x => x.timer.top)) >= fim.top - 0.01, 'e não passa do lugar: sem quique');
    assert.ok(new Set(q.map(x => x.timer.top.toFixed(1))).size >= 4, 'a subida aparece em vários quadros, não num só');
    assert.ok(q.some(x => x.timer.top > fim.top + 2 && x.menosSobODedo),
      'o −15 é tocável no meio da subida, onde estiver');
    assert.ok(q.every(x => x.larg <= 414), 'nenhuma rolagem de lado');

    // ---- um descanso que substitui outro: troca no lugar
    const troca = await amostra(nav, `startTimer(120, 'descanso · série 2 · Supino')`, 150);
    assert.deepStrictEqual(troca.vivas.timer.filter(a => a.estado === 'running'), [], 'nada se move ao trocar um descanso por outro');
    assert.ok(troca.quadros.every(x => Math.abs(x.timer.top - fim.top) < 0.01), 'ele fica onde está');

    // ---- desce
    const desce = await amostra(nav, PARA, tok.sai + 200);
    const d = desce.quadros;
    assert.deepStrictEqual(desce.vivas.timer.map(a => [a.tipo, a.nome, a.dur]), [['CSSTransition', 'translate', tok.sai]],
      'desce por `translate`, em --ins-dur-sai');
    assert.deepStrictEqual(numeros(desce.vivas.timer[0].curva), numeros(tok.curva), 'na mesma curva, sem quique');
    assert.ok(desloca(desce.vivas.timer[0].de) === 0 && desloca(desce.vivas.timer[0].para) >= fim.h - 0.5,
      'e volta para a borda por onde veio: de ' + desce.vivas.timer[0].de + ' a ' + desce.vivas.timer[0].para);
    const descendo = d.filter(x => x.t < tok.sai - 40);
    assert.ok(descendo.length >= 3 && descendo.every(x => x.timer.vis === 'visible' && /\bsai\b/.test(x.classes)),
      'visível enquanto desce: a saída se vê');
    assert.ok(d.every((x, i) => i === 0 || x.timer.top >= d[i - 1].timer.top - FOLGA), 'só desce');
    const ultimo = d[d.length - 1];
    assert.strictEqual(ultimo.timer.vis, 'hidden', 'no fim, fora de cena e escondido — sem evento de fim nenhum');
    assert.ok(!/\bsai\b/.test(ultimo.classes), 'e a classe da descida saiu pelo relógio da porta');
    assert.ok(ultimo.timer.top >= desce.h - 0.5, 'inteiro abaixo da borda');

    // ---- parar no meio da subida inverte dali
    const meio = await amostra(nav, `${DESCANSO}; setTimeout(function () { window.__escopo(${JSON.stringify(PARA)}); }, 120);`, 500);
    const i = meio.quadros.findIndex(x => /\bsai\b/.test(x.classes));
    assert.ok(i > 0, 'o parar chegou no meio da subida');
    const antes = meio.quadros[i - 1].timer.top, depois = meio.quadros[i].timer.top;
    assert.ok(antes < meio.h - 10, 'ele já tinha subido: ' + antes);
    assert.ok(Math.abs(depois - antes) < 25 && depois < meio.h - 10,
      'e volta de onde estava, sem saltar para a borda nem para o lugar: ' + antes + ' → ' + depois);
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o toast e a faixa acompanham o cronômetro no mesmo movimento, sem saltar e sem passar por baixo dele', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await modo(nav, { pergunta: true, aviso: true });
    const tok = await tokens(nav);
    const antes = { toast: await nav.caixa('#toast'), faixa: await nav.caixa('.ins-faixa') };

    for (const [nome, acao, dur] of [['subida', DESCANSO, tok.entra], ['descida', PARA, tok.sai]]) {
      const s = await amostra(nav, acao, dur + 150);
      const t = s.vivas.timer[0];
      ['toast', 'faixa'].forEach(quem => {
        assert.deepStrictEqual(s.vivas[quem].map(a => [a.tipo, a.nome, a.dur, numeros(a.curva).join()]),
          [['CSSTransition', 'translate', t.dur, numeros(t.curva).join()]],
          nome + ': ' + quem + ' anda pela propriedade `translate`, no tempo e na curva do cronômetro: ' + JSON.stringify(s.vivas[quem]));
        const de = { toast: '#toast', faixa: '.ins-faixa' }[quem];
        assert.ok(s.inicios['#timer'] !== undefined && s.inicios[de] === s.inicios['#timer'],
          nome + ': ' + quem + ' começa no mesmo instante que o cronômetro (' + JSON.stringify(s.inicios) + ')');
      });
      const q = s.quadros;
      q.forEach(x => {
        if (x.timer.vis !== 'visible') return;
        assert.ok(x.faixa.bottom <= x.timer.top + FOLGA, nome + ' a ' + x.t.toFixed(0) + ' ms: a faixa por baixo do cronômetro (' + x.faixa.bottom + ' > ' + x.timer.top + ')');
        assert.ok(x.toast.bottom <= x.faixa.top + FOLGA, nome + ': o toast por baixo da faixa');
      });
      const altura = parseFloat(nome === 'subida' ? s.publicada : (await nav.caixa('#timer')).h);
      const salto = Math.max(...q.slice(1).map((x, i) => Math.abs(x.toast.top - q[i].toast.top)));
      assert.ok(salto < altura / 2,
        nome + ': o toast andou ' + salto.toFixed(1) + ' px num quadro (antes da peça, os ' + altura + ' de uma vez)');
      assert.ok(new Set(q.map(x => x.toast.top.toFixed(1))).size >= 4, nome + ': o toast se move em vários quadros');
    }
    // e volta exatamente para onde estava
    const depois = { toast: await nav.caixa('#toast'), faixa: await nav.caixa('.ins-faixa') };
    assert.ok(Math.abs(depois.toast.y - antes.toast.y) < 0.01 && Math.abs(depois.faixa.y - antes.faixa.y) < 0.01,
      'o toast e a faixa voltam ao lugar de antes do descanso');
    // a faixa é tocável enquanto anda: ela é botão, e quem a toca não espera
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('sob "Reduzir movimento" o cronômetro esmaece ao chegar e sai de uma vez; o toast e a faixa vão direto ao lugar', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    await modo(nav, { pergunta: true, aviso: true });
    const tok = await tokens(nav);
    const s = await amostra(nav, DESCANSO, tok.dissolve + 150);
    assert.deepStrictEqual(s.vivas.timer.map(a => [a.tipo, a.nome, a.dur, a.props.join()]),
      [['CSSAnimation', 'ins-esmaece', tok.dissolve, 'opacity']],
      'esmaece em --ins-dur-dissolve, só opacidade: ' + JSON.stringify(s.vivas.timer));
    assert.deepStrictEqual([...s.vivas.toast, ...s.vivas.faixa], [], 'o toast e a faixa não se movem');
    const q = s.quadros, fim = q[q.length - 1];
    assert.ok(q.every(x => Math.abs(x.timer.top - fim.timer.top) < 0.01), 'nada desliza: o cronômetro nasce no lugar');
    assert.ok(q.every(x => Math.abs(x.toast.top - fim.toast.top) < 0.01 && Math.abs(x.faixa.top - fim.faixa.top) < 0.01),
      'o toast e a faixa já estão no lugar novo no primeiro quadro');
    assert.ok(q[0].timer.op < 1 && fim.timer.op === 1, 'e acende: ' + q[0].timer.op + ' → ' + fim.timer.op);
    assert.ok(Math.abs(fim.timer.bottom - s.h) <= 0.5, 'com o fundo na borda da tela');

    const p = await amostra(nav, PARA, 150);
    assert.ok(p.quadros.every(x => x.timer.vis === 'hidden' && !/\bsai\b/.test(x.classes)),
      'sai de uma vez: escondido desde o primeiro quadro, sem a classe da descida');
    assert.deepStrictEqual([...p.vivas.timer, ...p.vivas.toast, ...p.vivas.faixa].filter(a => a.estado === 'running'), [],
      'nenhuma animação na saída');
    assert.ok(p.quadros.every(x => Math.abs(x.toast.top - p.quadros[0].toast.top) < 0.01), 'o toast desce direto');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a altura publicada diz a verdade com o cronômetro sempre layoutado: zero fora de cena, a dele em cena', DEMORADO, async () => {
  // Antes da peça 3 o cronômetro escondido era `display: none` e media 0, e a
  // publicação podia ler a caixa. Agora ele fica layoutado fora de cena, com a
  // altura de sempre: se a publicação lesse a caixa, o toast e a faixa
  // reservariam 82 px para um cronômetro que não está ali.
  const nav = await abreNavegador();
  try {
    await modo(nav);
    const le = () => nav.p.evaluate(() => {
      const t = document.getElementById('timer');
      return { publicada: document.documentElement.style.getPropertyValue('--ins-timer-h'),
               caixa: t.offsetHeight, vis: getComputedStyle(t).visibility, classes: t.className };
    });
    let m = await le();
    assert.ok(m.caixa > 0 && m.vis === 'hidden', 'fora de cena, layoutado e escondido: ' + JSON.stringify(m));
    assert.strictEqual(m.publicada, '0px', 'e a altura publicada é zero');
    const fora = m.caixa;

    await nav.E(DESCANSO);
    await nav.espera(60);
    m = await le();
    assert.strictEqual(m.publicada, m.caixa + 'px', 'em cena, a altura dele');
    assert.strictEqual(m.caixa, fora,
      'fora de cena ele tem a altura de quando entra: a publicação do toque não espera o observador ' +
      '(no WebKit a correção chegava um quadro depois, e o toast e a faixa subiam atrás do cronômetro)');

    await nav.E(PARA);
    m = await le();
    assert.ok(/\bsai\b/.test(m.classes) && m.vis === 'visible', 'descendo, ainda visível');
    assert.strictEqual(m.publicada, '0px', 'mas a altura publicada já é zero: o toast e a faixa descem junto');
    await nav.espera(600);
    m = await le();
    assert.strictEqual(m.publicada, '0px', 'e continua zero depois que ele saiu');
    assert.strictEqual(m.caixa, fora, 'com a mesma altura fora de cena');
  } finally { await nav.fecha(); }
});
