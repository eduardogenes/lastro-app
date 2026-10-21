// A TROCA DE CAMADA — tela cheia, modo de sessão, e a saída da folha e do
// painel de apagar — medida no motor de verdade.
//
// Peça 5 do motion. Dono, 16/10: pergunta 4, a tela cheia chega da direita, a
// tela inteira, e a de baixo fica PARADA; pergunta 5, o modo entra como
// qualquer tela cheia; pergunta 1, camada entra e sai em 350 ms na curva do
// iPhone, sem quique, e nenhuma saída quica (a folha e o painel DESCEM, o véu
// apaga junto); pergunta 2, sob "Reduzir movimento" o que chega esmaece e o que
// sai vai de uma vez; pergunta 6, o quadro a mais, aceito; pergunta 13, os
// defeitos 4 (a faixa "Não guardado" sobre a saída do modo) e 7 (o campo de
// importar sem foco visível) entram aqui.
//
// A técnica é a transição de vista, pedida num ponto só (`render()`, pela porta
// `src/ui/movimento.js`). Durante ela o alvo de todo toque é o `html`, e o
// toque se perdia nos dois motores (docs/motion/04 §2.6): A CONDIÇÃO DE ENTRADA
// da peça é o primeiro caso abaixo — um segundo toque no meio de cada troca
// chega ao alvo que está sob o dedo, com o dedo e com o ponteiro. Se uma camada
// reprovasse num motor, ela trocaria seco naquele motor (o app de antes); as
// quatro passaram nos dois (docs/motion/09, peça 5).
//
// O jsdom não tem a API nem layout: aqui o build sobe num Chromium
// (`navegador.js`; `LASTRO_MOTOR=webkit` roda os mesmos casos no WebKit 26.5).
// Os tempos e as curvas vêm dos tokens, como o motor os resolve.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador, MOTOR } from './navegador.js';

const DEMORADO = { timeout: 180000 };
afterAll(fechaNavegador);

const tokens = nav => nav.p.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const ms = n => { const m = /^(\d*\.?\d+)(ms|s)$/.exec(cs.getPropertyValue(n).trim()); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : NaN; };
  return { entra: ms('--ins-dur-entra'), sai: ms('--ins-dur-sai'), dissolve: ms('--ins-dur-dissolve'),
           curvaCamada: cs.getPropertyValue('--ins-curva-camada').trim(),
           adianta: Number((/^(-?\d*\.?\d+)ms$/.exec(cs.getPropertyValue('--ins-adianta').trim()) || [0, NaN])[1]) };
});
const numeros = c => (String(c).match(/-?\d*\.?\d+/g) || []).map(Number);
/** Um transform como os dois motores o escrevem de volta: o Chromium diz `translate(100%)` por `translateX(100%)`. */
const forma = t => String(t).replace(/^translateX\(([^)]+)\)$/, 'translate($1)').replace(/^translate\(0(px)?,\s*([^)]+)\)$/, 'translateY($2)');
const mesmaCurva = (a, b) => JSON.stringify(numeros(a)) === JSON.stringify(numeros(b));

/** As fotos que se movem agora: as animações dos pseudo-elementos da transição de vista. */
const fotos = nav => nav.p.evaluate(() => document.getAnimations()
  .filter(a => a.effect && a.effect.pseudoElement && /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running')
  .map(a => ({ foto: a.effect.pseudoElement, nome: a.animationName, dur: a.effect.getTiming().duration, atraso: a.effect.getTiming().delay,
    curva: (a.effect.getKeyframes()[0] || {}).easing, quadros: a.effect.getKeyframes().map(q => q.transform || q.translate || q.opacity) })));
const camadas = nav => nav.E(`camadasAbertas(view).join(',')`);

/**
 * O registro com histórico (o Corpo e o Agora ficam longos, e há o que rolar) e,
 * se `sessao`, uma sessão aberta há meia hora — a faixa "em andamento" aparece
 * fora do Agora.
 */
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

/**
 * Espera a troca em curso acabar: nenhuma transição ativa (o desenho novo já
 * entrou — sob carga, no WebKit desta máquina, a foto da tela velha pode levar
 * centenas de ms) e nenhuma foto se movendo.
 */
const assenta = async nav => {
  await nav.p.waitForFunction(() => !document.activeViewTransition && !document.getAnimations().some(a => a.effect && a.effect.pseudoElement &&
    /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running'), null, { timeout: 8000 });
  await nav.espera(60);
};
/**
 * Roda `codigo` no app e espera a troca chegar a `ms` DO MOVIMENTO: a primeira
 * foto que se move já andou `ms` — ou, se nenhuma se mover em 3 s, `ms` no
 * relógio da página (o caso então reprova dizendo que nada se movia). Sob carga,
 * no WebKit desta máquina, a foto da tela velha leva centenas de ms, e um
 * relógio contado do pedido tocaria antes de a troca começar.
 */
const pedeEEspera = (nav, codigo, ms) => nav.p.evaluate(async ([c, ms]) => {
  const t0 = performance.now();
  window.__escopo(c);
  const andou = () => document.getAnimations().some(a => a.effect && a.effect.pseudoElement &&
    /view-transition/.test(a.effect.pseudoElement) && a.playState === 'running' && a.currentTime >= ms);
  await new Promise(ok => {
    const f = () => (andou() || performance.now() - t0 >= 3000 ? ok() : requestAnimationFrame(f));
    requestAnimationFrame(f);
  });
  if (!andou() && performance.now() - t0 < ms) await new Promise(ok => setTimeout(ok, ms));
}, [codigo, ms]);

/** O dedo (toque de verdade) ou o ponteiro (mouse), no ponto. */
async function toca(nav, como, x, y) {
  if (como === 'ponteiro') { await nav.p.mouse.move(x, y); await nav.p.mouse.down(); await nav.espera(40); await nav.p.mouse.up(); }
  else await nav.p.touchscreen.tap(x, y);
}
const centro = async (nav, sel) => {
  const c = await nav.caixa(sel);
  assert.ok(c, sel + ' não está desenhado');
  return [Math.round(c.cx), Math.round(c.cy)];
};

// ---------- a condição de entrada: o toque atravessa ----------

test('o toque no meio de cada troca chega ao que está sob o dedo: tela cheia, modo, folha descendo, painel descendo', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    // aquece cada camada: no WebKit desta máquina a primeira vez de cada uma é lenta
    for (const [abre, fecha] of [[`CTX.abreAjustes()`, `CTX.fechaAjustes()`], [`CTX.abreTreinoDeHoje()`, `CTX.fechaModoDeSessao()`],
      [`CTX.abreSeletorDeDia()`, `CTX.fechaFolha()`]]) {
      await nav.E(abre); await nav.espera(500); await assenta(nav); await nav.E(fecha); await nav.espera(500); await assenta(nav);
    }
    const casos = [
      // [camada, o que começa a troca, o alvo tocado no meio dela, o que tem de valer depois]
      ['tela cheia (Ajustes): o "‹ Voltar" no meio da chegada', null, `CTX.abreAjustes()`, '.tc-back', c => c === ''],
      ['modo de sessão: a seta "‹" no meio da chegada (o fluxo 16)', null, `CTX.abreTreinoDeHoje()`, '.ins-modo-sair', c => c === ''],
      ['folha descendo: o ⚙ do Agora, que estava atrás dela', `CTX.abreSeletorDeDia()`, `CTX.fechaFolha()`, '.ins-cab-ajustes', c => c === 'ajustes'],
      ['painel de apagar descendo: o ⚙ do Agora', `void pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`,
        `respondePare(false)`, '.ins-cab-ajustes', c => c === 'ajustes']
    ];
    const falhas = [];
    for (const como of ['dedo', 'ponteiro']) {
      for (const [nome, antes, troca, alvo, vale] of casos) {
        if (antes) { await nav.E(antes); await nav.espera(900); }
        await pedeEEspera(nav, troca, 120);
        const vivas = await fotos(nav);
        const [x, y] = await centro(nav, alvo);
        await toca(nav, como, x, y);
        await nav.espera(250);
        const c = await camadas(nav);
        if (!vivas.length) falhas.push(como + ' · ' + nome + ': nenhuma foto se movia quando o dedo desceu — o caso não prova nada');
        if (!vale(c)) falhas.push(como + ' · ' + nome + ': o toque não chegou (camadas: "' + c + '")');
        await nav.E(`view.pilha = []; view.pare = null; if (view.ajustes) CTX.fechaAjustes(); if (view.modoSessao) CTX.fechaModoDeSessao(); render();`);
        await nav.espera(500); await assenta(nav);
      }
    }
    assert.deepStrictEqual(falhas, [], MOTOR + ': o toque no meio da troca se perdeu');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- a forma da troca ----------

/** Amostra quadro a quadro, por `ms`, depois de `codigo`: as fotos vivas e a largura rolável. */
const amostraTroca = (nav, codigo, ms) => nav.p.evaluate(async ([c, ms]) => {
  const q = [];
  const t0 = performance.now();
  window.__escopo(c);
  await new Promise(ok => {
    const passo = () => {
      const vivas = document.getAnimations().filter(a => a.effect && a.effect.pseudoElement && /view-transition/.test(a.effect.pseudoElement))
        .map(a => a.effect.pseudoElement + ' ' + a.animationName);
      q.push({ t: performance.now() - t0, vivas, larg: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) });
      if (performance.now() - t0 < ms) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  return { quadros: q, w: innerWidth };
}, [codigo, ms]);

test('a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await semeia(nav, { sessao: true });
    await nav.E(`CTX.vaiPara('corpo'); startTimer(120, 'descanso · série 1 · Supino'); toast('um aviso na tela'); render();`);
    await nav.espera(500); await assenta(nav);
    for (const [nome, abre, fecha] of [['a tela cheia (Ajustes)', `CTX.abreAjustes()`, `CTX.fechaAjustes()`],
      ['o modo de sessão', `CTX.voltaAoTreino()`, `CTX.fechaModoDeSessao()`]]) {
      await nav.E(abre); await nav.espera(500); await assenta(nav); await nav.E(fecha); await nav.espera(500); await assenta(nav);
      for (const [sentido, codigo, foto, anim, dur] of [['entra', abre, '::view-transition-new(root)', 'ins-da-direita', k.entra],
        ['sai', fecha, '::view-transition-old(root)', 'ins-para-direita', k.sai]]) {
        await pedeEEspera(nav, codigo, 80);
        const vivas = await fotos(nav);
        const fio = await nav.p.evaluate(f => { try { const cs = getComputedStyle(document.documentElement, f);
          return { borda: cs.borderLeftWidth, margem: cs.marginLeft }; } catch (e) { return null; } }, foto);
        await assenta(nav);
        assert.strictEqual(await nav.p.evaluate(() => document.documentElement.dataset.nav), sentido, nome + ': o sentido no html');
        // só a tela que anda se move de lado — a de baixo parada, a faixa parada —;
        // o cronômetro e o aviso, que ficam sobre a barra de abas, só MUDAM DE
        // ALTURA junto com a troca, porque ela tira ou devolve a barra (peça 6, da
        // conferência da peça 5: antes eles saltavam 52 px no primeiro quadro)
        const pagina = vivas.filter(v => /\(root\)/.test(v.foto));
        const rodape = vivas.filter(v => !/\(root\)/.test(v.foto));
        assert.deepStrictEqual(pagina.map(v => v.foto + ' ' + v.nome), [foto + ' ' + anim],
          nome + ', ' + sentido + ': só a tela que anda se move de lado: ' + JSON.stringify(vivas));
        const pe = sentido === 'entra' ? 'ins-rodape-desce' : 'ins-rodape-sobe';
        assert.ok(rodape.some(v => v.foto === '::view-transition-image-pair(cronometro)'), nome + ', ' + sentido + ': o cronômetro muda de altura com a troca: ' + JSON.stringify(vivas));
        rodape.forEach(v => {
          assert.ok(/^::view-transition-image-pair\((cronometro|aviso)\)$/.test(v.foto) && v.nome === pe, nome + ', ' + sentido + ': só o cronômetro e o aviso, e ' + pe + ': ' + JSON.stringify(v));
          assert.ok(v.quadros.every(q => /^(none|0px -?[\d.]+px)$/.test(String(q))), nome + ': o cronômetro e o aviso só mudam de altura, não andam de lado: ' + JSON.stringify(v.quadros));
          assert.strictEqual(v.dur, dur, nome + ': o rodapé no tempo da camada');
          assert.ok(mesmaCurva(v.curva, k.curvaCamada), nome + ': o rodapé na curva da camada');
        });
        assert.strictEqual(pagina[0].dur, dur, nome + ', ' + sentido + ': no tempo da camada');
        assert.ok(mesmaCurva(pagina[0].curva, k.curvaCamada), nome + ', ' + sentido + ': na curva da camada, sem quique: ' + pagina[0].curva);
        assert.deepStrictEqual(pagina[0].quadros.map(forma), sentido === 'entra' ? ['translate(100%)', 'none'] : ['none', 'translate(100%)'],
          nome + ', ' + sentido + ': a tela inteira, da borda direita');
        // um quadro adiante (07 §11.2): o primeiro quadro animado já mostra a tela andando
        vivas.forEach(v => assert.strictEqual(v.atraso, k.adianta, nome + ', ' + sentido + ': ' + v.foto + ' começa um quadro adiante (--ins-adianta)'));
        if (fio && fio.borda) assert.deepStrictEqual(fio, { borda: '1px', margem: '-1px' }, nome + ': o fio de 1 px na borda, fora da foto');
      }
      // largura rolável em todo quadro: a página que chega pela direita não abre rolagem de lado
      for (const codigo of [abre, fecha]) {
        const r = await amostraTroca(nav, codigo, k.entra + 120);
        assert.ok(r.quadros.some(q => q.vivas.length), nome + ': a troca foi amostrada');
        assert.deepStrictEqual([...new Set(r.quadros.map(q => q.larg))], [r.w], nome + ': nenhum quadro mais largo que a janela');
        await assenta(nav);
      }
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o cronômetro não salta quando a troca tira ou devolve a barra de abas: muda de altura junto com ela, nos quadros que a tela mostrou', DEMORADO, async () => {
  // A conferência da peça 5 (07 §11.3), visto na peça 6: com um descanso
  // contando, abrir uma tela cheia tira a barra de abas, e o cronômetro — que tem
  // foto própria, do aparelho — ia ao lugar novo, 52 px abaixo, no primeiro
  // quadro (a barra azul dele: y 814 → 866 de um quadro para o outro, nos dois
  // motores). Agora desce e sobe junto com a troca.
  const nav = await abreNavegador();
  try {
    const { jpegjs } = await import('../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
    await semeia(nav);
    await nav.E(`startTimer(600, 'descanso · série 1 · Supino'); render();`);
    await nav.espera(600);
    await nav.E(`CTX.abreAjustes()`); await nav.espera(500); await assenta(nav); await nav.E(`CTX.fechaAjustes()`); await nav.espera(500); await assenta(nav);
    const barra = () => nav.p.evaluate(() => { const t = document.querySelector('#tfill'); const r = t && t.getBoundingClientRect(); return r ? Math.round(r.top) : null; });
    for (const [nome, codigo, desfaz] of [['abre os Ajustes', `CTX.abreAjustes()`, `CTX.fechaAjustes()`], ['fecha os Ajustes', `CTX.fechaAjustes()`, `CTX.abreAjustes()`]]) {
     // a captura do WebKit desta máquina, com carga, às vezes não entrega quadro
     // nenhum da troca: aí a medida se repete (até 3 vezes) — um salto VISTO reprova na hora
     for (let tentativa = 1; ; tentativa++) {
      const de = await barra();
      const q = [];
      await nav.p.screencast.start({ size: { width: 414, height: 896 }, quality: 90, onFrame: f => { q.push({ ts: f.timestamp, d: f.data }); } });
      await nav.espera(300);
      const ini = Math.max(0, q.length - 1);
      await nav.E(codigo);
      await nav.espera(500); await assenta(nav); await nav.espera(150);
      await nav.p.screencast.stop();
      // na ordem do carimbo do compositor: sob carga o screencast entrega quadros
      // fora de ordem (docs/motion/09, peça 6, decisão 17)
      q.sort((a, b) => a.ts - b.ts);
      const para = await barra();
      assert.ok(de != null && para != null && Math.abs(Math.abs(para - de) - 52) <= 1, nome + ': o cronômetro muda de lugar 52 px (' + de + ' → ' + para + ')');
      // a barra azul do descanso, em cada quadro: a primeira linha do acento na
      // coluna x = 150, na faixa entre o lugar velho e o novo
      const ys = q.slice(ini).map(({ d }) => {
        const im = jpegjs.decode(d, { useTArray: true }); const E = im.width / 414;
        for (let y = Math.min(de, para) - 6; y <= Math.max(de, para) + 6; y++) {
          const o = (Math.round(y * E) * im.width + Math.round(150 * E)) * 4;
          if (im.data[o + 2] > im.data[o] + 60 && im.data[o + 2] > im.data[o + 1] + 60) return y;
        }
        return null;
      }).filter(y => y != null);
      if (ys.length < 4 && tentativa < 3) { await nav.E(desfaz); await nav.espera(500); await assenta(nav); await nav.E(codigo); await nav.espera(500); await assenta(nav); await nav.E(desfaz); await nav.espera(500); await assenta(nav); continue; }
      // O salto de antes era o caminho inteiro num quadro, SEM posição no meio. No
      // Chromium, também nenhum passo grande e nenhum quadro que volta. No WebKit
      // desta máquina (sem placa de vídeo), sob carga, o primeiro quadro animado
      // pode chegar com o caminho já quase andado, e o fim de toda transição de
      // vista volta um quadro (docs/motion/09, peça 6, decisão 14, também numa
      // página sem o app): lá vale passar pelo meio, e o quadro isolado que volta
      // fica fora da conta.
      const volta = ys.map((y, i) => i > 0 && i + 1 < ys.length && ys[i - 1] === ys[i + 1] && y !== ys[i - 1]);
      if (MOTOR === 'chromium') assert.ok(!volta.some(Boolean), nome + ': nenhum quadro volta no Chromium (' + ys.join(' ') + ')');
      const ok = ys.filter((y, i) => !volta[i]);
      const passos = ok.slice(1).map((y, i) => Math.abs(y - ok[i]));
      const meio = new Set(ok.filter(y => Math.abs(y - de) > 2 && Math.abs(y - para) > 2));
      assert.ok(ok.length >= 2, nome + ': a captura entregou os quadros da troca (' + ok.length + ', em ' + tentativa + ' tentativas)');
      if (MOTOR === 'chromium') assert.ok(Math.max(...passos) < 40, nome + ': nenhum salto de um quadro para o outro (' + ys.join(' ') + ')');
      assert.ok(meio.size >= 2, nome + ': o cronômetro passa pelo meio do caminho, em pelo menos 2 quadros — o salto não passava (' + ys.join(' ') + ')');
      const sentido = Math.sign(para - de);
      assert.ok(ok.every((y, i) => i === 0 || Math.sign(y - ok[i - 1]) !== -sentido), nome + ': e só para o lado do lugar novo (' + ys.join(' ') + ')');
      break;
     }
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a folha e o painel de apagar descem em 350 ms sem quique, o véu apaga junto, e a folha de baixo de duas fica', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    const k = await tokens(nav);
    await semeia(nav);
    await nav.E(`CTX.abreSeletorDeDia()`); await nav.espera(900); await nav.E(`CTX.fechaFolha()`); await nav.espera(500); await assenta(nav);
    for (const [nome, abre, fecha, caixa, veu] of [
      ['a folha', `CTX.abreSeletorDeDia()`, `CTX.fechaFolha()`, 'folha-0', 'veu-0'],
      ['o painel de apagar', `void pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`, `respondePare(false)`, 'painel', 'veu-painel']
    ]) {
      await nav.E(abre); await nav.espera(900);
      await pedeEEspera(nav, fecha, 80);
      const vivas = await fotos(nav);
      assert.strictEqual(await nav.p.evaluate(() => document.querySelectorAll('.ins-folha, .pare-w').length), 0,
        nome + ': já saiu do DOM — o que desce é a foto dela');
      await assenta(nav);
      const porFoto = Object.fromEntries(vivas.map(v => [v.foto, v]));
      assert.deepStrictEqual(Object.keys(porFoto).sort(), ['::view-transition-old(' + caixa + ')', '::view-transition-old(' + veu + ')'].sort(),
        nome + ': só a caixa e o véu se movem; a página atrás, parada: ' + JSON.stringify(vivas));
      const c = porFoto['::view-transition-old(' + caixa + ')'], v = porFoto['::view-transition-old(' + veu + ')'];
      assert.strictEqual(c.nome, 'ins-desce'); assert.strictEqual(c.dur, k.sai, nome + ': desce no tempo da camada');
      assert.strictEqual(c.atraso, k.adianta, nome + ': desce um quadro adiante'); assert.strictEqual(v.atraso, k.adianta, nome + ': o véu também');
      assert.ok(mesmaCurva(c.curva, k.curvaCamada), nome + ': na curva da camada, sem quique: ' + c.curva);
      assert.deepStrictEqual(c.quadros.map(forma), ['none', 'translateY(100%)'], nome + ': pela borda de baixo');
      assert.strictEqual(v.nome, 'ins-apaga'); assert.strictEqual(v.dur, k.sai, nome + ': o véu apaga junto');
      assert.deepStrictEqual(v.quadros.map(Number), [1, 0], nome + ': o véu só apaga');
    }
    // duas folhas: fecha a de cima, e a de baixo não se move
    await nav.E(`CTX.abreFolha({ k: 'refeicao', id: 'almoco' })`); await nav.espera(900);
    await nav.E(`CTX.abreFolha({ k: 'editaRefeicao', id: 'almoco' })`); await nav.espera(900);
    await pedeEEspera(nav, `CTX.fechaFolha()`, 80);
    const duas = await fotos(nav);
    await assenta(nav);
    assert.deepStrictEqual(duas.map(v => v.foto).sort(), ['::view-transition-old(folha-1)', '::view-transition-old(veu-1)'],
      'só a de cima desce, pelo nome da POSIÇÃO na pilha; a de baixo fica: ' + JSON.stringify(duas));
    assert.strictEqual(await nav.p.evaluate(() => document.querySelectorAll('.ins-folha').length), 1);
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// NA DESCIDA, SÓ O QUE SAI TEM FOTO (ajustes finais; 07 §12.3). Fechar pelo × a
// folha de cima com outra embaixo andava DOIS quadros depois do toque: o quadro
// em que o navegador fotografa a tela fotografava, cada uma numa imagem à
// parte, as duas folhas e os dois véus inteiros, mais o cronômetro e o aviso —
// e o desenho dele passava do tempo de um quadro (15–18 ms, contra 11 com uma
// folha; trace do Chromium). Na descida a página não anda: o que não sai fica na
// foto dela, que é a viva. Cobrado nos nomes que o navegador vê na hora da foto
// velha e na da nova, e no que se move.
test('na descida só o que sai tem foto: a folha que fica, o véu dela, o cronômetro e o aviso ficam na página', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    await nav.E(`startTimer(600, 'descanso · série 1 · Supino'); toast('um aviso na tela'); render();`);
    await nav.espera(400);
    /** Os nomes da troca na foto velha (logo antes do desenho) e na nova (logo depois). */
    const nomesNaTroca = (fecha) => nav.p.evaluate(fecha => new Promise(ok => {
      const ler = () => [...document.querySelectorAll('.ins-folha-w > .ins-folha, .ins-folha-w > .ins-veu, .pare, .pare-w > .ins-veu, #timer, #toast')]
        .map(e => (e.id ? '#' + e.id : e.className.split(' ')[0]) + (e.closest('.ins-folha-w') ? '@' + e.closest('.ins-folha-w').getAttribute('data-lugar') : '') + '=' + getComputedStyle(e).viewTransitionName);
      const f = document.startViewTransition;
      document.startViewTransition = function (cb) {
        document.startViewTransition = f;
        const velha = ler();
        return f.call(document, function () { cb(); ok({ velha, nova: ler() }); });
      };
      window.__escopo(fecha);
    }), fecha);

    // duas folhas: fecha a de cima
    await nav.E(`CTX.abreFolha({ k: 'refeicao', id: 'almoco' })`); await nav.espera(900);
    await nav.E(`CTX.abreFolha({ k: 'editaRefeicao', id: 'almoco' })`); await nav.espera(900);
    const duas = await nomesNaTroca(`CTX.fechaFolha()`);
    const vivas = await fotos(nav);
    await assenta(nav);
    assert.deepStrictEqual(duas.velha.sort(), ['#timer=none', '#toast=none', 'ins-folha@0=none', 'ins-folha@1=folha-1', 'ins-veu@0=none', 'ins-veu@1=veu-1'],
      'na foto velha, só a folha que sai e o véu dela têm nome');
    assert.deepStrictEqual(duas.nova.sort(), ['#timer=none', '#toast=none', 'ins-folha@0=none', 'ins-veu@0=none'],
      'na nova, ninguém: a folha que fica está na página, parada');
    assert.deepStrictEqual(vivas.map(v => v.foto).sort(), ['::view-transition-old(folha-1)', '::view-transition-old(veu-1)'],
      'e a de cima desce, com o véu dela: ' + JSON.stringify(vivas));
    // a que ficou ganha o nome de volta para a descida DELA
    const uma = await nomesNaTroca(`CTX.fechaFolha()`);
    await assenta(nav);
    assert.deepStrictEqual(uma.velha.sort(), ['#timer=none', '#toast=none', 'ins-folha@0=folha-0', 'ins-veu@0=veu-0'],
      'fechando a última, ela tem nome na foto velha');

    // o painel de apagar sobre uma folha: desce só o painel
    await nav.E(`CTX.abreSeletorDeDia()`); await nav.espera(900);
    await nav.E(`void pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`); await nav.espera(900);
    const painel = await nomesNaTroca(`respondePare(false)`);
    await assenta(nav);
    assert.deepStrictEqual(painel.velha.sort(), ['#timer=none', '#toast=none', 'ins-folha@0=none', 'ins-veu=veu-painel', 'ins-veu@0=none', 'pare=painel'],
      'com o painel descendo, a folha embaixo dele fica na página');
    assert.strictEqual(await nav.p.evaluate(() => document.querySelectorAll('.ins-folha').length), 1, 'e continua aberta');
    await nav.E(`CTX.fechaFolha()`); await nav.espera(500); await assenta(nav);

    // numa troca que ANDA (a tela cheia que chega), o que é do aparelho continua com nome
    const ajustes = await nomesNaTroca(`CTX.abreAjustes()`);
    await assenta(nav);
    assert.deepStrictEqual(ajustes.velha.sort(), ['#timer=cronometro', '#toast=aviso'], 'fora da descida, o cronômetro e o aviso têm foto própria');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    await nav.E(`CTX.abreAjustes()`); await nav.espera(500); await assenta(nav);
    await nav.p.evaluate(() => history.back());
    await nav.espera(80);
    const vivas = await fotos(nav);
    await assenta(nav);
    assert.deepStrictEqual(vivas.map(v => v.foto + ' ' + v.nome), ['::view-transition-old(root) ins-para-direita'], 'o Voltar sai pela direita, como o "‹ Voltar"');
    assert.strictEqual(await camadas(nav), '');

    // o gesto de borda do iPhone: o evento chega com `hasUAVisualTransition`. A
    // entrada do histórico desce uma profundidade (como o gesto faz) e o evento é
    // o do navegador que já animou.
    await nav.E(`CTX.abreAjustes()`); await nav.espera(500); await assenta(nav);
    const r = await nav.p.evaluate(() => {
      const n = history.state && history.state.lastro;
      history.replaceState({ lastro: n - 1 }, '');
      const e = new PopStateEvent('popstate', { state: history.state, hasUAVisualTransition: true });
      if (!e.hasUAVisualTransition) return { semSuporte: true };
      let viu = false;
      const espiao = document.startViewTransition;
      document.startViewTransition = function (f) { viu = true; return espiao.call(document, f); };
      try { window.dispatchEvent(e); } finally { document.startViewTransition = espiao; }
      return { viu, ajustes: !!document.querySelector('.tc'), camadas: window.__escopo(`camadasAbertas(view).join(',')`) };
    });
    if (!r.semSuporte) {
      assert.deepStrictEqual(r, { viu: false, ajustes: false, camadas: '' },
        'com o navegador já tendo animado, o app fecha no mesmo tique e sem transição');
    }

    // A CORRIDA DO HISTÓRICO. O desenho que fecha uma camada pelo botão consome a
    // entrada dela (`history.go(-1)`), e o `popstate` disso chega depois — no
    // WebKit desta máquina, 100 a 160 ms depois. O destino da volta é fixado na
    // hora do pedido, nos dois motores. Se uma camada nova abre nesse meio, há
    // duas ordens, e as duas fechavam (ou podiam fechar) a camada recém-aberta:
    //  1. o `popstate` chega com o desenho da nova ainda PENDENTE: tem de ser
    //     comparado com a tela desenhada, e não com o `view` pendente (peça 5);
    //  2. o desenho da nova entra ANTES de a volta andar: a entrada dela era
    //     empurrada, a volta pousava atrás dela, e o `popstate` parecia um Voltar
    //     (ajustes finais: o app não empurra nada enquanto a volta dele está no
    //     ar). Era esta que caía às vezes no WebKit com carga.
    // As duas ordens, forçadas — e a do motor, sem forçar nada.
    for (const ordem of ['o popstate antes do desenho da nova', 'o desenho da nova antes da volta', 'a do motor']) {
      await nav.E(`CTX.vaiPara('corpo')`); await nav.espera(300); await assenta(nav);
      await nav.E(`CTX.abreAjustes()`); await nav.espera(500); await assenta(nav);
      await nav.p.evaluate(ordem => {
        const f = document.startViewTransition;
        document.startViewTransition = function (cb) {
          document.startViewTransition = f;
          return f.call(document, function () {
            cb();
            queueMicrotask(() => {
              if (ordem === 'o desenho da nova antes da volta') {
                // sem a transição, a Evolução desenha na hora: o pushState dela
                // entra antes de o go(-1) do fecho andar
                document.startViewTransition = undefined;
                try { window.__escopo(`CTX.abreEvolucao()`); } finally { document.startViewTransition = f; }
              } else if (ordem === 'o popstate antes do desenho da nova') {
                // o desenho da Evolução só entra depois do popstate do fecho
                document.startViewTransition = function (cb2) {
                  document.startViewTransition = f;
                  return f.call(document, () => new Promise(ok => addEventListener('popstate', () => { cb2(); ok(); }, { once: true })));
                };
                window.__escopo(`CTX.abreEvolucao()`);
              } else window.__escopo(`CTX.abreEvolucao()`);
            });
          });
        };
        window.__escopo(`CTX.fechaAjustes()`);
      }, ordem);
      await nav.espera(600); await assenta(nav); await nav.espera(300);
      assert.strictEqual(await camadas(nav), 'evolucao', ordem + ': a camada aberta logo depois do fecho continua aberta');
      assert.strictEqual(await nav.p.evaluate(() => history.state && history.state.lastro), 1, ordem + ': e o histórico tem a entrada dela');
      // e o Voltar do sistema a fecha, uma camada só
      await nav.p.evaluate(() => history.back());
      await nav.espera(200); await assenta(nav); await nav.espera(100);
      assert.strictEqual(await camadas(nav), '', ordem + ': o Voltar fecha a Evolução');
      assert.strictEqual(await nav.p.evaluate(() => history.state && history.state.lastro), 0, ordem + ': e o histórico volta à base');
    }
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- as precondições: a rolagem, o foco, a altura ----------

test('a rolagem volta exata: o Corpo pelo modo e o Agora pelos Ajustes, pela seta e pelo Voltar', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav, { sessao: true });
    const casos = [
      // [onde, a aba, abre (o dedo na faixa, que fica no rodapé; o ⚙ ficou lá em cima), a seta (seletor)]
      ['o Corpo, pelo modo (a faixa)', 'corpo', '.ins-faixa', '.ins-modo-sair'],
      ['o Agora, pelos Ajustes', 'agora', `CTX.abreAjustes()`, '.tc-back']
    ];
    const medidas = [];
    for (const [onde, aba, abre, seta] of casos) {
      for (const via of ['seta', 'Voltar']) {
        await nav.E(`CTX.vaiPara('${aba}')`); await nav.espera(400); await assenta(nav);
        await nav.p.evaluate(() => window.scrollTo(0, 99999)); await nav.espera(200);
        const antes = await nav.p.evaluate(() => Math.round(scrollY));
        if (abre.startsWith('CTX.')) await nav.E(abre);
        else { const [x, y] = await centro(nav, abre); await nav.toca(x, y); }
        await nav.espera(500); await assenta(nav);
        const dentro = await nav.p.evaluate(() => Math.round(scrollY));
        if (via === 'seta') { const [sx, sy] = await centro(nav, seta); await nav.toca(sx, sy); }
        else await nav.p.evaluate(() => history.back());
        await nav.espera(500); await assenta(nav);
        const depois = await nav.p.evaluate(() => Math.round(scrollY));
        medidas.push({ onde, via, antes, dentro, depois });
      }
    }
    medidas.forEach(m => {
      assert.ok(m.antes > 300, m.onde + ': a tela de baixo estava rolada (' + m.antes + ')');
      assert.strictEqual(m.dentro, 0, m.onde + ': o destino abre no topo');
      assert.ok(Math.abs(m.depois - m.antes) <= 1, m.onde + ', pela ' + m.via + ': a rolagem volta exata (' + m.antes + ' → ' + m.depois + '; antes da peça 5, o Corpo voltava cortado)');
    });
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

/** Onde está o foco: tag, classe, data-a — e se é o `body`. */
const foco = nav => nav.p.evaluate(() => {
  const e = document.activeElement;
  return !e || e === document.body ? 'body' : e.tagName.toLowerCase() + (e.getAttribute('data-a') ? '[' + e.getAttribute('data-a') + ']' : '') +
    (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : '');
});

test('o foco: entra no título do destino e do modo, e volta ao controle que abriu — nunca ao body', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    const passos = [];
    // com o TECLADO: o controle focado, Enter abre, Esc fecha
    for (const [nome, sel, titulo] of [['os Ajustes pelo ⚙', '[data-a="ajustes"]', 'h1.tc-titulo'],
      ['o modo pelo cartão do treino', 'button.ins-foco', 'h1.ins-display']]) {
      await nav.p.focus(sel);
      const abriu = await foco(nav);
      await nav.p.keyboard.press('Enter'); await nav.espera(500); await assenta(nav);
      const dentro = await nav.p.evaluate(t => { const e = document.activeElement; return !!(e && e.matches(t) && e.closest('.tc, .ins-modo')); }, titulo);
      await nav.p.keyboard.press('Escape'); await nav.espera(500); await assenta(nav);
      passos.push({ nome, abriu, dentro, voltou: await foco(nav) });
    }
    // com o DEDO: o ⚙ tocado, e o "‹ Voltar" tocado
    {
      const [x, y] = await centro(nav, '[data-a="ajustes"]');
      await nav.toca(x, y); await nav.espera(500); await assenta(nav);
      const dentro = await nav.p.evaluate(() => !!(document.activeElement && document.activeElement.matches('h1.tc-titulo')));
      const [vx, vy] = await centro(nav, '.tc-back');
      await nav.toca(vx, vy); await nav.espera(500); await assenta(nav);
      passos.push({ nome: 'os Ajustes com o dedo', abriu: (await nav.p.evaluate(() => document.querySelector('[data-a="ajustes"]').tagName.toLowerCase())) + '[ajustes].ins-cab-ajustes', dentro, voltou: await foco(nav) });
    }
    passos.forEach(p => {
      assert.ok(p.dentro, p.nome + ': o foco entrou no título');
      assert.notStrictEqual(p.voltou, 'body', p.nome + ': ao sair, o foco não cai no body');
      assert.strictEqual(p.voltou, p.abriu, p.nome + ': ao sair, o foco volta ao controle que abriu');
    });
    // o controle que abriu não existe mais (a Evolução que leva à Semana): o título da aba
    await nav.E(`CTX.vaiPara('corpo')`); await nav.espera(300); await assenta(nav);
    await nav.E(`CTX.abreEvolucao()`); await nav.espera(500); await assenta(nav);
    const [sx, sy] = await centro(nav, '[data-a="evolucao-semana"]');
    await nav.toca(sx, sy); await nav.espera(500); await assenta(nav);
    assert.strictEqual(await nav.E(`view.aba`), 'semana');
    assert.strictEqual(await nav.p.evaluate(() => { const e = document.activeElement; return e && e.matches('main h1') ? e.textContent : null; }), 'Semana',
      'sem o controle que abriu, o foco vai ao título da tela que reaparece');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('o modo com conteúdo curto não deixa sobra rolável, e o cronômetro fica no fundo da tela também nas telas cheias', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    const sobra = () => nav.p.evaluate(() => {
      const m = document.querySelector('.ins-modo main');
      const era = m.style.display; m.style.display = 'none';
      const s = document.documentElement.scrollHeight - innerHeight;
      m.style.display = era;
      return s;
    });
    await nav.E(`CTX.abreTreinoDeHoje()`); await nav.espera(500); await assenta(nav);
    const medidas = { sem: await sobra() };
    await nav.E(`startTimer(120, 'descanso'); render();`); await nav.espera(500);
    medidas.comDescanso = await sobra();
    // a área do indicador de home do iPhone (34 pt), como a bancada a escreve
    await nav.p.evaluate(() => document.documentElement.style.setProperty('--sa-bottom', '34px'));
    medidas.comAreaSegura = await sobra();
    await nav.p.evaluate(() => document.documentElement.style.removeProperty('--sa-bottom'));
    assert.deepStrictEqual(medidas, { sem: 0, comDescanso: 0, comAreaSegura: 0 },
      'o modo curto e o pé da página somam a janela (antes: 24 px roláveis, 58 com a área segura)');

    // o cronômetro, numa tela cheia: no fundo da tela, como no modo (antes, 52 px acima)
    await nav.E(`CTX.fechaModoDeSessao()`); await nav.espera(500); await assenta(nav);
    for (const abre of [`CTX.abreAjustes()`, `CTX.abreEvolucao()`]) {
      await nav.E(abre); await nav.espera(500); await assenta(nav);
      const t = await nav.caixa('#timer');
      assert.ok(t && Math.abs(t.y + t.h - 896) <= 0.5, abre + ': o fundo do cronômetro na borda da tela (' + (t && (t.y + t.h)) + ' de 896)');
      await nav.E(`view.ajustes = false; view.evolucao = null; render();`); await nav.espera(500); await assenta(nav);
    }
    const fora = await nav.caixa('#timer');
    const barra = await nav.caixa('.ins-tabbar');
    assert.ok(fora.y + fora.h <= barra.y + 0.5 && fora.y + fora.h > barra.y - 10,
      'fora das telas cheias, continua sobre a barra de abas, como antes (' + (fora.y + fora.h) + ', barra em ' + barra.y + ')');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('defeito 4: a faixa "Não guardado" não cobre a saída do modo, a hora e o ···, nem o "‹ Voltar" e o ⚙; defeito 7: o campo de importar mostra o foco', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await semeia(nav);
    await nav.E(`view.naoGuardado = { oQue: 'a série 1 do Supino Reto com Barra, de hoje', motivo: 'cota', valor: null }; view.falhou = false; render();`);
    await nav.espera(200);
    const acerta = sels => nav.p.evaluate(sels => sels.map(s => {
      const e = document.querySelector(s);
      if (!e) return s + ': não desenhado';
      const r = e.getBoundingClientRect();
      const sob = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return sob && (sob === e || e.contains(sob)) ? null : s + ': coberto por ' + (sob && sob.className);
    }).filter(Boolean), sels);
    const faixa = async () => { const f = await nav.caixa('.ng-faixa'); return !!f && f.y <= 0.5 && f.h > 30; };
    const falhas = [];
    falhas.push(...await acerta(['.ins-cab-ajustes', 'h1.ag-cab-d']));
    assert.ok(await faixa(), 'a faixa continua à vista, no topo');
    await nav.E(`CTX.abreTreinoDeHoje()`); await nav.espera(500); await assenta(nav);
    falhas.push(...await acerta(['.ins-modo-sair', '#hora', '.ins-modo-mais']));
    assert.ok(await faixa(), 'no modo, a faixa continua à vista');
    // rolado: a barra do modo gruda abaixo da faixa
    await nav.p.evaluate(() => window.scrollTo(0, 600)); await nav.espera(150);
    falhas.push(...(await acerta(['.ins-modo-sair', '#hora', '.ins-modo-mais'])).map(f => 'rolado: ' + f));
    await nav.E(`CTX.fechaModoDeSessao()`); await nav.espera(500); await assenta(nav);
    await nav.E(`CTX.abreAjustes()`); await nav.espera(500); await assenta(nav);
    falhas.push(...await acerta(['.tc-back']));
    assert.deepStrictEqual(falhas, [], 'a faixa "Não guardado" cobria os controles do topo');

    // defeito 7: Tab até o campo de importar; o rótulo, que é o botão que se vê, ganha o anel
    await nav.E(`view.naoGuardado = null; render();`); await nav.espera(150);
    const anel = await nav.p.evaluate(async () => {
      const campo = document.querySelector('.gu-arquivo input[type="file"]');
      const focaveis = [...document.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(e => !e.disabled && e.getClientRects().length);
      const antes = focaveis[focaveis.indexOf(campo) - 1];
      antes.focus();
      return !!campo;
    });
    assert.ok(anel, 'o campo de importar está nos Ajustes');
    await nav.p.keyboard.press('Tab');
    const r = await nav.p.evaluate(() => {
      const campo = document.querySelector('.gu-arquivo input[type="file"]');
      const rot = campo.closest('label');
      const cs = getComputedStyle(rot);
      return { focado: document.activeElement === campo, estilo: cs.outlineStyle, largura: cs.outlineWidth };
    });
    assert.deepStrictEqual(r, { focado: true, estilo: 'solid', largura: '3px' },
      'com o teclado, o campo de importar mostra o anel de foco como os outros controles (antes: nada)');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

// ---------- "Reduzir movimento", a primeira tela e a navegação composta ----------

test('sob "Reduzir movimento": nenhuma transição de vista; a tela cheia e o modo esmaecem 120 ms ao chegar e saem de uma vez', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    const k = await tokens(nav);
    await semeia(nav);
    let pediu = 0;
    await nav.p.exposeFunction('__pediuTroca', () => { pediu++; });
    await nav.p.evaluate(() => {
      const f = document.startViewTransition;
      if (f) document.startViewTransition = function (cb) { window.__pediuTroca(); return f.call(document, cb); };
    });
    for (const [nome, abre, sel, fecha] of [['a tela cheia', `CTX.abreAjustes()`, '.tc', `CTX.fechaAjustes()`],
      ['o modo', `CTX.abreTreinoDeHoje()`, '.ins-modo', `CTX.fechaModoDeSessao()`]]) {
      const r = await nav.p.evaluate(([abre, sel]) => {
        window.__escopo(abre);
        const e = document.querySelector(sel);
        return e ? e.getAnimations().map(a => ({ nome: a.animationName, dur: a.effect.getTiming().duration,
          props: [...new Set(a.effect.getKeyframes().flatMap(q => Object.keys(q)))].filter(p => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)) })) : null;
      }, [abre, sel]);
      assert.deepStrictEqual(r, [{ nome: 'ins-esmaece', dur: k.dissolve, props: ['opacity'] }],
        nome + ': chega no mesmo desenho e só esmaece, em --ins-dur-dissolve');
      await nav.espera(300);
      const saiu = await nav.p.evaluate(([fecha, sel]) => { window.__escopo(fecha); return document.querySelectorAll(sel).length; }, [fecha, sel]);
      assert.strictEqual(saiu, 0, nome + ': sai de uma vez, no mesmo desenho');
      const tela = await nav.p.evaluate(() => document.querySelector('main') ? document.querySelector('main').getAnimations().length : -1);
      assert.strictEqual(tela, 0, nome + ': a tela que reaparece não esmaece — ela já estava lá');
    }
    // a folha também sai de uma vez
    await nav.E(`CTX.abreSeletorDeDia()`); await nav.espera(300);
    assert.strictEqual(await nav.p.evaluate(() => { window.__escopo(`CTX.fechaFolha()`); return document.querySelectorAll('.ins-folha').length; }), 0);
    assert.strictEqual(pediu, 0, 'nenhuma transição de vista pedida');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a primeira tela não anima, nem quando é o modo, e dois desenhos seguidos (Evolução → "Ir para Semana") são uma troca só', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    // a abertura com treino em andamento: a primeira tela já é o modo, e não
    // anima (T9) — nenhuma troca pedida, nenhuma foto
    await semeia(nav, { sessao: true });
    await nav.E(`save()`);
    await nav.espera(300);
    await nav.p.reload();
    await nav.p.waitForFunction(() => !!(window.__escopo && document.querySelector('.ins-modo')));
    assert.deepStrictEqual(await fotos(nav), [], 'a primeira tela não anima (T9)');
    assert.strictEqual(await nav.p.evaluate(() => document.documentElement.dataset.nav), undefined,
      'nenhuma troca pedida ao abrir, nem para o modo que já é a primeira tela');
    await semeia(nav);
    await nav.E(`CTX.vaiPara('corpo')`); await nav.espera(300); await assenta(nav);
    await nav.E(`CTX.abreEvolucao()`); await nav.espera(500); await assenta(nav);
    const r = await nav.p.evaluate(() => {
      let n = 0;
      const f = document.startViewTransition;
      document.startViewTransition = function (cb) { n++; return f.call(document, cb); };
      try { document.querySelector('[data-a="evolucao-semana"]').click(); } finally { document.startViewTransition = f; }
      return { n, nav: document.documentElement.dataset.nav };
    });
    await nav.espera(500); await assenta(nav);
    assert.deepStrictEqual(r, { n: 1, nav: 'sai' }, 'fechar a Evolução e trocar de aba no mesmo toque: uma troca só, no sentido da primeira mudança');
    assert.strictEqual(await nav.E(`view.aba`), 'semana');
    assert.strictEqual(await nav.p.evaluate(() => Math.round(scrollY)), 0, 'e a aba nova no topo');
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});
