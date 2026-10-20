// A TROCA DE ABA — o carrossel — medida no motor de verdade.
//
// Peça 6 do motion. Dono, 16/10: pergunta 3, A PÁGINA INTEIRA DESLIZA, como um
// carrossel — a velha sai pelo lado oposto e a nova entra pelo lado para onde
// se andou na barra, as duas juntas, em 350 ms (`--ins-dur-entra`) na
// `--ins-curva`; o fio da aba anda junto, no mesmo tempo e na mesma curva;
// pergunta 2, sob "Reduzir movimento" o conteúdo novo esmaece e o velho sai de
// uma vez, e o fio salta; pergunta 6, o quadro a mais da transição de vista.
//
// A técnica é a da troca de camada (peça 5, `troca.test.js`): a transição de
// vista pedida pelo `render()`, agora também quando a aba muda, com o sentido
// do índice na barra. Durante ela o alvo de todo toque é o `html`, e o toque
// rápido em outra aba — o fluxo 14 do revisor — tem de chegar à aba que o dedo
// vê: o pulo e a mira da porta.
//
// O jsdom não tem a API nem layout: aqui o build sobe num Chromium
// (`navegador.js`; `LASTRO_MOTOR=webkit` roda os mesmos casos no WebKit 26.5).
// Os tempos e as curvas vêm dos tokens, como o motor os resolve.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador, MOTOR } from './navegador.js';

const DEMORADO = { timeout: 180000 };
afterAll(fechaNavegador);

const ABAS = ['Agora', 'Dias', 'Corpo', 'Semana', 'Prescrição'];
const CHAVE = { Agora: 'agora', Dias: 'dias', Corpo: 'corpo', Semana: 'semana', 'Prescrição': 'prescricao' };

const tokens = nav => nav.p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const ms = n => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(cs.getPropertyValue(n).trim()); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : NaN; };
  return { entra: ms('--ins-dur-entra'), dissolve: ms('--ins-dur-dissolve'), curva: cs.getPropertyValue('--ins-curva').trim(),
           adianta: Number((/^(-?\d*\.?\d+)ms$/.exec(cs.getPropertyValue('--ins-adianta').trim()) || [0, NaN])[1]) };
});
const numeros = c => (String(c).match(/-?\d*\.?\d+/g) || []).map(Number);
const mesmaCurva = (a, b) => JSON.stringify(numeros(a)) === JSON.stringify(numeros(b));
/** Um transform como os dois motores o escrevem de volta: o Chromium diz `translate(100%)` por `translateX(100%)`. */
const forma = t => String(t).replace(/^translateX\(([^)]+)\)$/, 'translate($1)');

/** O registro com histórico: o Corpo, a Semana e o Agora ficam longos, e há o que rolar. */
const semeia = (nav, { sessao = false } = {}) => nav.E(`(function () {
  const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
  const t = function (k) { return base.getTime() - k*DIA; };
  S.logs = {}; S.done = []; S.sessao = null; S.draft = null;
  ['A','B','C','D','E'].forEach(function (L, j) {
    for (let sem = 0; sem < 4; sem++) {
      const tt = t(1 + j + sem*7); const P = treino(L); if (!P) return;
      P.ex.forEach(function (ex, i) { const sets = []; for (let k = 0; k < ex.s; k++) sets.push([40+5*i, 9-k, 1]);
        (S.logs[ex.id] = S.logs[ex.id] || []).push({ t: tt+i*600000, sid: tt, sets: sets }); });
      S.done.push({ day: L, t: tt, sid: tt, dur: 4000000, fim: 'manual' });
    }
  });
  S.body.peso = []; for (let k = 1; k < 30; k++) S.body.peso.push({ t: t(k), v: 74 - k*0.03 });
  ${sessao ? `const ag = Date.now() - 1800000, DD = nextDay();
  S.sessao = { day: DD, inicio: ag, ultima: Date.now() - 60000, sid: ag, manual: 1, pausas: [], pulados: [] };
  S.done.push({ day: DD, t: ag, sid: ag, ini: 'manual' });` : ''}
  diaDeComida().cadencia = 'treino';
  CTX.vaiPara('agora'); render();
})()`);

/** Espera a troca em curso acabar: nenhuma transição ativa, nenhuma foto se movendo, e o fio parado. */
const assenta = async nav => {
  await nav.p.waitForFunction(() => {
    const ind = document.querySelector('.ins-tab-ind');
    return !document.activeViewTransition && !document.getAnimations().some(a => a.effect && a.effect.pseudoElement &&
      /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running') &&
      !(ind && ind.getAnimations().some(a => a.playState === 'running'));
  }, null, { timeout: 8000 });
  await nav.espera(60);
};
/** Vai à aba por código (o mesmo verbo que a barra chama) e espera a troca acabar. */
const vai = async (nav, k) => { await nav.E(`CTX.vaiPara('${k}')`); await nav.espera(100); await assenta(nav); };

/** O centro do botão da aba. */
const daAba = async (nav, rotulo) => {
  const c = await nav.p.evaluate(r => {
    const b = [...document.querySelectorAll('.ins-tab')].find(x => x.textContent === r);
    const q = b && b.getBoundingClientRect();
    return q ? [Math.round(q.x + q.width / 2), Math.round(q.y + q.height / 2)] : null;
  }, rotulo);
  assert.ok(c, 'a aba ' + rotulo + ' não está desenhada');
  return c;
};
/** O dedo (toque de verdade) ou o ponteiro (mouse), no ponto. */
async function toca(nav, como, x, y) {
  if (como === 'ponteiro') { await nav.p.mouse.move(x, y); await nav.p.mouse.down(); await nav.espera(40); await nav.p.mouse.up(); }
  else await nav.p.touchscreen.tap(x, y);
}
/** A aba acesa, o lugar do fio (o invólucro anda `i × 20%` da barra) e a aba de `view`. */
const ondeEsta = nav => nav.p.evaluate(() => {
  const on = document.querySelector('.ins-tab.on');
  const ind = document.querySelector('.ins-tab-ind');
  const barra = document.querySelector('.ins-tabbar').getBoundingClientRect();
  return { acesa: on ? on.textContent : null, fio: Math.round((ind.getBoundingClientRect().x - barra.x) / barra.width * 100), aba: window.__escopo('view.aba') };
});

/**
 * Toca a aba (`btn.click()`, no mesmo tique da amostra) e amostra quadro a
 * quadro, por `ms`: as fotos vivas, a transição do fio, o nome da barra, o
 * sentido no `html` e a largura rolável.
 */
const amostraAba = (nav, rotulo, ms) => nav.p.evaluate(async ([r, ms]) => {
  const q = [];
  const t0 = performance.now();
  [...document.querySelectorAll('.ins-tab')].find(x => x.textContent === r).click();
  await new Promise(ok => {
    const passo = () => {
      const fotos = document.getAnimations().filter(a => a.effect && a.effect.pseudoElement && /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running')
        .map(a => ({ foto: a.effect.pseudoElement, nome: a.animationName, dur: a.effect.getTiming().duration, atraso: a.effect.getTiming().delay, t: a.currentTime,
          curva: (a.effect.getKeyframes()[0] || {}).easing, quadros: a.effect.getKeyframes().map(k => k.transform || k.opacity) }));
      const fio = [...document.querySelectorAll('.ins-tab-ind')].flatMap(e => e.getAnimations()).filter(a => a.playState === 'running')
        .map(a => ({ prop: a.transitionProperty || a.animationName, dur: a.effect.getTiming().duration, atraso: a.effect.getTiming().delay, curva: a.effect.getTiming().easing, t: a.currentTime }));
      const barra = document.querySelector('.ins-tabbar');
      q.push({ t: performance.now() - t0, nav: document.documentElement.dataset.nav, fotos, fio,
        nome: barra ? getComputedStyle(barra).viewTransitionName : null,
        larg: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) });
      // até a troca acabar (a primeira, a frio, no WebKit desta máquina começa centenas de ms depois), e no mínimo `ms`
      const viu = q.some(x => x.fotos.length), acabou = viu && !document.activeViewTransition && !fotos.length;
      if ((performance.now() - t0 < ms || !acabou) && performance.now() - t0 < 4000) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  return { quadros: q, w: innerWidth };
}, [rotulo, ms]);

// ---------- o carrossel ----------

test('trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    // a sessão aberta põe a faixa fora do Agora; o descanso e o aviso, na tela
    await semeia(nav, { sessao: true });
    await nav.E(`startTimer(300, 'descanso · série 1 · Supino'); toast('um aviso na tela'); render();`);
    // aquece as cinco: no WebKit desta máquina a primeira pintura de cada aba prende a thread (07 §1.1)
    for (const a of ['dias', 'corpo', 'semana', 'prescricao', 'agora']) await vai(nav, a);
    const passos = [['Corpo', 'aba-direita'], ['Semana', 'aba-direita'], ['Agora', 'aba-esquerda'], ['Prescrição', 'aba-direita'], ['Dias', 'aba-esquerda']];
    for (const [rotulo, sentido] of passos) {
      const r = await amostraAba(nav, rotulo, k.entra + 250);
      await assenta(nav);
      const vivos = r.quadros.filter(q => q.fotos.length);
      const nome = 'para ' + rotulo;
      // nenhum quadro mais largo que a janela: a página que entra pela direita não abre rolagem de lado
      assert.deepStrictEqual([...new Set(r.quadros.map(q => q.larg))], [r.w], nome + ': nenhum quadro mais largo que a janela');
      assert.ok(vivos.length >= 3, nome + ': a troca se vê em pelo menos 3 quadros (' + vivos.length + ')');
      assert.ok(r.quadros.every(q => q.nav === sentido), nome + ': o sentido do índice no html, ' + sentido);
      // só as duas fotos da página andam: a barra, o cronômetro, o aviso e a faixa, parados
      const quem = [...new Set(vivos.flatMap(q => q.fotos.map(f => f.foto + ' ' + f.nome)))].sort();
      const esperado = sentido === 'aba-direita'
        ? ['::view-transition-new(root) ins-da-direita', '::view-transition-old(root) ins-para-esquerda']
        : ['::view-transition-new(root) ins-da-esquerda', '::view-transition-old(root) ins-para-direita'];
      assert.deepStrictEqual(quem, esperado, nome + ': a velha sai pelo lado oposto e a nova entra pelo lado para onde se andou — e nada mais anda');
      for (const f of vivos[0].fotos) {
        assert.strictEqual(f.dur, k.entra, nome + ': ' + f.foto + ' em --ins-dur-entra');
        // um quadro adiante (07 §11.2): o primeiro quadro animado já mostra a página andando
        assert.strictEqual(f.atraso, k.adianta, nome + ': ' + f.foto + ' começa um quadro adiante (--ins-adianta)');
        assert.ok(mesmaCurva(f.curva, k.curva), nome + ': ' + f.foto + ' na --ins-curva: ' + f.curva);
        const novo = /new/.test(f.foto);
        const q = f.quadros.map(forma);
        assert.deepStrictEqual(q, sentido === 'aba-direita'
          ? (novo ? ['translate(100%)', 'none'] : ['none', 'translate(-100%)'])
          : (novo ? ['translate(-100%)', 'none'] : ['none', 'translate(100%)']), nome + ': a tela inteira, de borda a borda: ' + f.foto);
      }
      // as duas juntas, e o fio com elas: no mesmo quadro (ou no seguinte), no mesmo tempo e na mesma curva
      const [a, b] = vivos[0].fotos;
      assert.ok(Math.abs(a.t - b.t) < 1, nome + ': as duas páginas andam juntas (' + a.t + ' e ' + b.t + ')');
      const iFotos = r.quadros.indexOf(vivos[0]);
      const iFio = r.quadros.findIndex(q => q.fio.length);
      assert.ok(iFio >= 0 && Math.abs(iFio - iFotos) <= 1, nome + ': o fio começa a andar com as páginas (quadro ' + iFio + ', as páginas no ' + iFotos + ')');
      const fio = r.quadros[iFio].fio;
      assert.strictEqual(fio.length, 1, nome + ': um fio só: ' + JSON.stringify(fio));
      assert.strictEqual(fio[0].prop, 'transform', nome + ': o fio anda em transform');
      assert.strictEqual(fio[0].dur, k.entra, nome + ': o fio no tempo do carrossel');
      assert.ok(mesmaCurva(fio[0].curva, k.curva), nome + ': o fio na curva do carrossel: ' + fio[0].curva);
      assert.strictEqual(fio[0].atraso, k.adianta, nome + ': o fio começa um quadro adiante, com as páginas');
      // a barra tem foto própria durante a troca
      assert.ok(vivos.every(q => q.nome === 'barra-de-abas'), nome + ': a barra de abas tem nome próprio na troca de aba');
      // e chegou: a aba acesa, o fio no lugar dela
      const fim = await ondeEsta(nav);
      assert.deepStrictEqual(fim, { acesa: rotulo, fio: ABAS.indexOf(rotulo) * 20, aba: CHAVE[rotulo] }, nome + ': chegou');
    }
    // na troca de CAMADA a barra não tem nome: é do lugar, e fica com ele (peça 5)
    await nav.E(`CTX.abreAjustes()`); await nav.espera(100);
    const noModo = await nav.p.evaluate(() => document.documentElement.dataset.nav);
    await assenta(nav); await nav.E(`CTX.fechaAjustes()`); await nav.espera(100); await assenta(nav);
    assert.strictEqual(noModo, 'entra');
    assert.strictEqual(await nav.p.evaluate(() => getComputedStyle(document.querySelector('.ins-tabbar')).viewTransitionName), 'none',
      'fora da troca de aba, a barra não tem nome');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

/**
 * Os quadros do COMPOSITOR durante a troca (`page.screencast`), decodificados:
 * em cada um, a linha dos rótulos da barra, onde está o fio e onde está a borda
 * do conteúdo. É o que a tela mostrou — e não o que o DOM diz.
 */
async function quadrosDoCompositor(nav, rotulo) {
  const { jpegjs } = await import('../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
  const q = [];
  await nav.p.screencast.start({ size: { width: 414, height: 896 }, quality: 90, onFrame: f => { q.push({ ts: f.timestamp, d: f.data }); } });
  await nav.espera(300);
  const antes = q.length;
  await nav.p.evaluate(r => [...document.querySelectorAll('.ins-tab')].find(x => x.textContent === r).click(), rotulo);
  await nav.espera(400);
  await assenta(nav);
  await nav.espera(200);
  await nav.p.screencast.stop();
  // NA ORDEM DO CARIMBO, e não na de chegada: sob carga o screencast entrega
  // quadros fora de ordem (o de 87 ms antes do de 75 ms), e o fio parecia voltar
  // um quadro sem a tela ter voltado (docs/motion/09, peça 6, decisão 17). O
  // carimbo é a hora em que o compositor fez o quadro; um quadro que volta DE
  // VERDADE (o fim da transição no WebKit desta máquina) chega com o carimbo em
  // ordem, e continua aparecendo.
  q.sort((a, b) => a.ts - b.ts);
  return q.slice(Math.max(0, antes - 1)).map(({ d }) => {
    const im = jpegjs.decode(d, { useTArray: true });
    const E = im.width / 414;
    const px = (x, y) => { const o = (Math.round(y * E) * im.width + Math.round(x * E)) * 4; return [im.data[o], im.data[o + 1], im.data[o + 2]]; };
    // a faixa dos rótulos da barra (y 862–888), pixel a pixel, para comparar com o último quadro
    const rotulos = [];
    for (let y = 862; y <= 888; y += 2) for (let x = 0; x < 414; x += 2) rotulos.push(...px(x, y));
    // o fio: onde está o acento, na borda de cima da barra
    const az = [];
    for (const y of [849, 850, 851]) for (let x = 0; x < 414; x++) { const [r, g, b] = px(x, y); if (b > r + 60 && b > g + 60) az.push(x); }
    // o conteúdo: a borda esquerda do primeiro traço escuro na faixa do título
    let borda = 999;
    for (let y = 40; y <= 60; y += 2) for (let x = 0; x < 414; x++) { const [r, g, b] = px(x, y); if (r < 90 && g < 90 && b < 90) { borda = Math.min(borda, x); break; } }
    // a tela inteira, em cinza, de 9 em 9 px e de 8 em 8: para achar o quadro que volta
    const sig = [];
    for (let y = 4; y < 896; y += 8) for (let x = 4; x < 414; x += 9) { const [r, g, b] = px(x, y); sig.push((r + g + b) / 3); }
    return { rotulos, fio: az.length ? Math.min(...az) : null, borda, sig };
  });
}
/**
 * Os quadros que VOLTAM: um quadro diferente dos dois vizinhos, que são iguais
 * entre si — a tela andou para trás um quadro e voltou. É o piscar.
 */
function quadrosQueVoltam(qs) {
  const d = (a, b) => a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0) / a.length;
  const voltam = [];
  for (let i = 1; i + 1 < qs.length; i++) {
    const a = d(qs[i].sig, qs[i - 1].sig), b = d(qs[i].sig, qs[i + 1].sig), c = d(qs[i - 1].sig, qs[i + 1].sig);
    if (a > 2 && b > 2 && c < Math.min(a, b) / 3) voltam.push(i);
  }
  return voltam;
}

test('a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    for (const a of ['corpo', 'agora', 'corpo', 'agora']) await vai(nav, a);
    const voltaram = [];
    for (const [rotulo, de, para] of [['Corpo', 0, 2], ['Agora', 2, 0]]) {
      const todos = await quadrosDoCompositor(nav, rotulo);
      // Nada pisca no Blink (07 §1.3, princípio 3): no Chromium nenhum quadro volta.
      // No WebKit desta máquina (sem placa de vídeo) a transição de vista volta um
      // quadro no fim em parte das rodadas — também numa página mínima, sem nada do
      // app, e também na troca de camada da peça 5 (docs/motion/09, peça 6). Lá o
      // quadro isolado que volta é contado e fica fora da conta do fio.
      const voltam = quadrosQueVoltam(todos);
      voltaram.push(rotulo + ': ' + voltam.length);
      if (MOTOR === 'chromium') assert.deepStrictEqual(voltam, [], rotulo + ': nenhum quadro volta no Chromium');
      const qs = todos.filter((q, i) => !voltam.includes(i));
      const fim = qs[qs.length - 1];
      // os quadros em que a página anda: a borda do conteúdo saiu do lugar dela
      const anda = qs.filter(q => q.borda !== fim.borda && q.borda !== qs[0].borda);
      assert.ok(anda.length >= 3, rotulo + ': a página inteira desliza, em pelo menos 3 quadros (' + anda.length + ')');
      // a barra: do primeiro quadro em que a página anda até o fim, os rótulos são os do fim (a nova, acesa na aba nova)
      const ini = qs.indexOf(anda[0]);
      const dif = qs.slice(ini).map(q => q.rotulos.reduce((s, v, i) => s + Math.abs(v - fim.rotulos[i]), 0) / q.rotulos.length);
      assert.ok(Math.max(...dif) < 4, rotulo + ': a barra de abas parada enquanto as páginas passam (maior diferença média por canal: ' + Math.max(...dif).toFixed(2) + ')');
      // o fio anda, sempre para o mesmo lado, e chega ao lugar
      const fios = qs.slice(ini).map(q => q.fio).filter(x => x != null);
      const passo = Math.sign(para - de);
      assert.ok(fios.every((x, i) => i === 0 || Math.sign(x - fios[i - 1]) !== -passo), rotulo + ': o fio só anda para o lado da aba nova: ' + fios.join(' '));
      assert.ok(new Set(fios).size >= 3, rotulo + ': o fio anda em pelo menos 3 quadros: ' + fios.join(' '));
      assert.ok(Math.abs(fim.fio - para * 82.8) <= 2, rotulo + ': o fio chega à aba (' + fim.fio + ')');
    }
    if (MOTOR !== 'chromium') console.log(MOTOR + ', quadros que voltam (o motor desta máquina): ' + voltaram.join(' · '));
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- a rolagem ----------

test('toda aba abre no topo, e o topo entra no desenho novo: a foto da aba que sai fica onde estava', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    for (const [de, rotulo] of [['corpo', 'Semana'], ['semana', 'Agora'], ['agora', 'Prescrição']]) {
      await vai(nav, de);
      await nav.p.evaluate(() => window.scrollTo(0, 99999)); await nav.espera(200);
      const y0 = await nav.p.evaluate(() => Math.round(scrollY));
      assert.ok(y0 > 300, de + ': a aba de onde se sai estava rolada (' + y0 + ')');
      // o que a página tinha na hora em que o navegador fotografou a tela velha:
      // a chamada de volta da transição roda logo depois da foto, antes do desenho
      await nav.p.evaluate(() => {
        const f = document.startViewTransition;
        window.__naFoto = null;
        document.startViewTransition = function (cb) {
          document.startViewTransition = f;
          return f.call(document, function () {
            window.__naFoto = { y: Math.round(scrollY), aba: (document.querySelector('.ins-tab.on') || {}).textContent };
            return cb();
          });
        };
      });
      const [x, y] = await daAba(nav, rotulo);
      await nav.toca(x, y);
      await nav.espera(100); await assenta(nav);
      const naFoto = await nav.p.evaluate(() => window.__naFoto);
      assert.ok(naFoto, de + ' → ' + rotulo + ': a troca de aba pediu a transição');
      assert.strictEqual(naFoto.y, y0, de + ' → ' + rotulo + ': a foto da aba que sai é tirada onde ela estava — a rolagem ainda não andou');
      assert.notStrictEqual(naFoto.aba, rotulo, de + ' → ' + rotulo + ': e ainda é a aba velha na tela');
      assert.strictEqual(await nav.p.evaluate(() => Math.round(scrollY)), 0, de + ' → ' + rotulo + ': a aba nova abre no topo');
      assert.strictEqual((await ondeEsta(nav)).acesa, rotulo);
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- o toque nunca espera ----------

test('a aba tocada no meio da troca vence: o dedo acerta a aba que vê (o fluxo 14)', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    for (const a of ['corpo', 'semana', 'agora']) await vai(nav, a);
    const falhas = [];
    for (const como of ['dedo', 'ponteiro']) {
      for (const [de, primeira, segunda] of [['agora', 'Corpo', 'Semana'], ['semana', 'Agora', 'Dias'], ['dias', 'Prescrição', 'Agora']]) {
        await vai(nav, de);
        const [x1, y1] = await daAba(nav, primeira);
        const [x2, y2] = await daAba(nav, segunda);
        await toca(nav, como, x1, y1);
        // o segundo toque com a página andando: as fotos já andaram ~120 ms (o fluxo 14 toca a 131)
        await nav.p.waitForFunction(() => document.getAnimations().some(a => a.effect && a.effect.pseudoElement &&
          /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running' && a.currentTime >= 110), null, { timeout: 8000 }).catch(() => {});
        const andava = await nav.p.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.pseudoElement &&
          /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running'));
        await toca(nav, como, x2, y2);
        await nav.espera(150); await assenta(nav);
        const fim = await ondeEsta(nav);
        const caso = como + ' · ' + primeira + ' e, no meio, ' + segunda;
        if (!andava) falhas.push(caso + ': nenhuma foto se movia quando o dedo desceu — o caso não prova nada');
        const quer = { acesa: segunda, fio: ABAS.indexOf(segunda) * 20, aba: CHAVE[segunda] };
        if (JSON.stringify(fim) !== JSON.stringify(quer)) falhas.push(caso + ': acabou em ' + JSON.stringify(fim));
      }
    }
    assert.deepStrictEqual(falhas, [], MOTOR + ': a aba tocada no meio da troca não venceu');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- "Reduzir movimento" e a aba sem índice ----------

/** Conta as transições de vista pedidas daqui em diante. */
const contaTrocas = nav => nav.p.evaluate(() => {
  window.__trocas = 0;
  const f = document.startViewTransition;
  if (f && !f.__contada) {
    document.startViewTransition = function (cb) { window.__trocas++; return f.call(document, cb); };
    document.startViewTransition.__contada = true;
  }
});
/** Toca a aba e devolve, no mesmo tique, o que nasceu e o que anima. */
const tocaENoMesmoTique = (nav, rotulo) => nav.p.evaluate(r => {
  const ainda = document.querySelector('main');
  [...document.querySelectorAll('.ins-tab')].find(x => x.textContent === r).click();
  const m = document.querySelector('main');
  const anima = e => e ? e.getAnimations().map(a => ({ nome: a.animationName || a.transitionProperty, dur: a.effect.getTiming().duration,
    props: [...new Set(a.effect.getKeyframes().flatMap(q => Object.keys(q)))].filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)) })) : null;
  return { nasceu: m !== ainda, velhoNaArvore: !!(ainda && ainda.isConnected), main: anima(m), cab: anima(document.querySelector('.ag-cab')),
    fio: anima(document.querySelector('.ins-tab-ind')), nav: document.documentElement.dataset.nav, trocas: window.__trocas };
}, rotulo);

test('sob "Reduzir movimento": nenhuma transição de vista; o conteúdo novo esmaece 120 ms, o velho sai de uma vez, e o fio salta', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    const k = await tokens(nav);
    await semeia(nav);
    await contaTrocas(nav);
    const esmaece = [{ nome: 'ins-esmaece', dur: k.dissolve, props: ['opacity'] }];
    for (const [rotulo, sentido] of [['Corpo', 'aba-direita'], ['Semana', 'aba-direita'], ['Agora', 'aba-esquerda']]) {
      const r = await tocaENoMesmoTique(nav, rotulo);
      assert.strictEqual(r.trocas, 0, rotulo + ': nenhuma transição de vista pedida');
      assert.strictEqual(r.nav, sentido, rotulo + ': o sentido no html, que diz qual nó que nasce esmaece');
      assert.ok(r.nasceu && !r.velhoNaArvore, rotulo + ': a página nova nasce, e a velha sai de uma vez, no mesmo desenho');
      assert.deepStrictEqual(r.main, esmaece, rotulo + ': a página nova só esmaece, em --ins-dur-dissolve');
      if (rotulo === 'Agora') assert.deepStrictEqual(r.cab, esmaece, 'o cabeçalho do Agora vai com a página');
      assert.deepStrictEqual(r.fio, [], rotulo + ': o fio salta');
      assert.strictEqual((await ondeEsta(nav)).fio, ABAS.indexOf(rotulo) * 20, rotulo + ': e já está no lugar');
      await nav.espera(300);
      // dentro da aba, o `<main>` fica: o que aparece por um toque não esmaece
      const dentro = await nav.p.evaluate(() => {
        const m = document.querySelector('main');
        window.__escopo('render()');
        return { mesmo: document.querySelector('main') === m, anima: m.getAnimations().filter(a => a.playState === 'running').length };
      });
      assert.deepStrictEqual(dentro, { mesmo: true, anima: 0 }, rotulo + ': um desenho dentro da aba não esmaece de novo');
    }
    // a aba que reaparece quando uma tela cheia sai não esmaece: ela já estava lá
    await nav.E(`CTX.abreAjustes()`); await nav.espera(300);
    const volta = await nav.p.evaluate(() => { window.__escopo('CTX.fechaAjustes()'); const m = document.querySelector('main'); return m ? m.getAnimations().length : -1; });
    assert.strictEqual(volta, 0, 'a aba que reaparece não esmaece');
    assert.strictEqual(await nav.p.evaluate(() => window.__trocas), 0, 'nenhuma transição de vista pedida');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a aba que não está na barra (vaiPara("treino")) troca seca: sem transição, sem esmaecer, e o fio salta', DEMORADO, async () => {
  for (const reduz of [false, true]) {
    const nav = await abreNavegador({ reduz });
    try {
      await semeia(nav);
      await contaTrocas(nav);
      const ida = await nav.p.evaluate(() => {
        window.__escopo(`CTX.vaiPara('treino')`);
        const m = document.querySelector('main');
        return { nav: document.documentElement.dataset.nav, trocas: window.__trocas, main: m.getAnimations().length };
      });
      assert.deepStrictEqual(ida, { nav: 'seca', trocas: 0, main: 0 }, (reduz ? 'reduz' : 'com movimento') + ': para uma aba sem índice, nada se move');
      const r = await tocaENoMesmoTique(nav, 'Corpo');
      assert.deepStrictEqual({ nav: r.nav, trocas: r.trocas, main: r.main, fio: r.fio }, { nav: 'seca', trocas: 0, main: [], fio: [] },
        (reduz ? 'reduz' : 'com movimento') + ': de uma aba sem índice, também: não há para que lado andar');
      await nav.espera(100);
      assert.strictEqual((await ondeEsta(nav)).acesa, 'Corpo');
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  }
});

// ---------- o foco ----------

test('o foco não cai no body quando um desenho tira da página o controle: "Ir para Semana" (com e sem "Reduzir") e o treino aberto no Programa', DEMORADO, async () => {
  // Da conferência da peça 5 (07 §11.2 e §11.3). Sob "Reduzir movimento",
  // "Ir para Semana" são dois desenhos (fecha a Evolução, depois troca de aba), e
  // o segundo tirava o controle que o primeiro tinha focado; abrir um treino da
  // lista do Programa troca o conteúdo dentro da mesma tela cheia. Nos dois, o
  // foco caía no `body`; agora vai ao título da tela que está desenhada.
  const falhas = [];
  for (const reduz of [false, true]) {
    const nav = await abreNavegador({ reduz });
    try {
      await semeia(nav);
      const foco = () => nav.p.evaluate(() => { const e = document.activeElement; return !e || e === document.body ? 'body' : e.tagName.toLowerCase() + ' ' + (e.textContent || '').trim().slice(0, 30); });
      for (const como of ['teclado', 'dedo']) {
        const caso = (reduz ? 'reduz' : 'com movimento') + ' · ' + como;
        const aperta = async sel => {
          if (como === 'teclado') { await nav.p.focus(sel); await nav.p.keyboard.press('Enter'); }
          else { const c = await nav.caixa(sel); await nav.toca(Math.round(c.cx), Math.round(c.cy)); }
          await nav.espera(150); await assenta(nav);
        };
        await vai(nav, 'corpo');
        await nav.p.evaluate(() => window.scrollTo(0, 0));
        await aperta('[data-a="abre-evolucao"]');
        await aperta('[data-a="evolucao-semana"]');
        const f1 = await foco();
        if (f1 !== 'h1 Semana') falhas.push(caso + ' · "Ir para Semana": o foco em ' + f1);
        await vai(nav, 'prescricao');
        await nav.E(`CTX.abrePrograma()`); await nav.espera(150); await assenta(nav);
        await aperta('.progd-b');
        const f2 = await foco();
        if (f2 === 'body') falhas.push(caso + ' · o treino aberto no Programa: o foco no body');
        await nav.E(`view.prog = null; render();`); await nav.espera(150); await assenta(nav);
      }
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  }
  assert.deepStrictEqual(falhas, [], MOTOR + ': o foco caiu no body');
});
