// O TOQUE DA 1ª SÉRIE NÃO MONTA O DESENHO DENTRO DELE, medido no motor de verdade.
//
// A regra é que o toque nunca espera. A peça 2 tirou do toque da primeira série
// a frio o layout que ele pagava (no WebKit desta máquina, de ~170 ms para
// 10–13 ms no handler): a medida da linha passou para depois do layout
// (`depoisDoLayout`). Da peça 6 em diante voltaram ~195 ms DENTRO do handler, no
// WebKit, e a causa medida foi o foco que o desenho devolve (`naoPerdeOFoco`):
// a régua que fecha tira da página o valor tocado, que tinha o foco, e o
// `focus()` no título, ainda dentro do toque, obrigava o motor a montar o
// desenho ali mesmo — no WebKit, os ~180 ms da primeira vez (a fonte que falta
// no Linux), que o quadro ia gastar de qualquer jeito; no Chromium, o estilo e o
// layout inteiros (docs/motion/09, "A primeira série a frio no WebKit").
//
// O caso cobra duas coisas, com o dedo e com o ponteiro (o WebKit desta máquina
// só foca o botão tocado com o ponteiro, que é o "dedo" do revisor nele; o
// Chromium, com os dois):
//
//  1. O DESENHO FICA PARA O QUADRO. "A frio" é o que faz o custo aparecer, e um
//     caso não pode depender de ser o primeiro a desenhar o descanso num processo
//     do motor. Então o caso põe o "frio" ele mesmo, igual em toda rodada: um
//     LASTRO de texto fora da tela, que muda de largura e de estilo no MESMO
//     desenho em que a régua fecha (uma regra `html:not(:has(.regua))`, nada do
//     app). Quem pedir estilo ou layout do documento dentro do toque paga o
//     lastro inteiro ali; quem deixar para o quadro não paga nada. No fim do
//     toque, o lastro tem de estar AINDA por montar, e o toque tem de ter levado
//     bem menos que ele.
//  2. NENHUM `focus()` DENTRO DO TOQUE, a causa achada. O WebKit não monta o
//     documento inteiro no `focus()` — só o que o nó precisa, e o lastro, que é
//     uma raiz de layout à parte, fica de fora (medido: o build de `28d5a21`
//     pagava ~230 ms ali dentro, e o lastro continuava por montar). O que ele
//     monta é o app, a frio. O foco que o desenho devolve vai depois do layout
//     (`depoisDoLayout`), no mesmo quadro.
//
// E o foco continua indo aonde ia: ao título do treino, no fim.
// `LASTRO_MOTOR=webkit` roda o mesmo caso no WebKit.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador, MOTOR } from './navegador.js';

const DEMORADO = { timeout: 180000 };
afterAll(fechaNavegador);

/** O lastro: texto fora da tela, que muda de largura e de estilo quando a régua fecha. */
const POE_O_LASTRO = `(function () {
  const st = document.createElement('style');
  st.textContent =
    '#lastro-frio { position: absolute; left: -20000px; top: 0; width: 320px; font: 400 15px/1.4 sans-serif; }' +
    'html:not(:has(.regua)) #lastro-frio { width: 321px; }' +
    'html:not(:has(.regua)) #lastro-frio p { letter-spacing: 0.01px; }';
  document.head.appendChild(st);
  const l = document.createElement('div');
  l.id = 'lastro-frio';
  l.setAttribute('aria-hidden', 'true');
  const frase = 'carga de quarenta quilos por lado, nove repetições, descanso de dois minutos e meio ';
  let html = '';
  for (let i = 0; i < 4000; i++) html += '<p>' + i + ' ' + frase + frase.slice(i % 40) + '</p>';
  l.innerHTML = html;
  document.body.appendChild(l);
  l.offsetHeight;
})()`;

/**
 * Quanto custa montar o estilo e o layout do lastro, no motor, agora: a mesma
 * mudança que a régua dispara (largura e estilo de todo parágrafo), lida na
 * hora. Mediana de três, e o lastro volta ao que era.
 */
const CUSTO_DO_LASTRO = `(function () {
  const l = document.getElementById('lastro-frio');
  const ps = [];
  for (let i = 0; i < 3; i++) {
    l.style.width = (330 + i) + 'px';
    l.style.letterSpacing = (0.02 + i / 100) + 'px';
    const t = performance.now();
    l.offsetHeight;
    ps.push(performance.now() - t);
  }
  l.style.width = ''; l.style.letterSpacing = '';
  l.offsetHeight;
  return ps.sort(function (a, b) { return a - b; })[1];
})()`;

/**
 * O relógio do toque: do clique na janela, na captura (antes de tudo do app),
 * até o fim dele na janela, na bolha (depois de tudo do app e das promessas que
 * ele resolveu); os `focus()` chamados nesse meio; e, já fora da conta, quanto
 * o lastro ainda custava ali — se o toque o montou, nada.
 */
const POE_O_RELOGIO = `(function () {
  const R = window.__frio = { cliques: [], dentro: false, focos: [] };
  const foca = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function () {
    if (R.dentro) R.focos.push(this.tagName.toLowerCase() + (this.className && typeof this.className === 'string' ? '.' + this.className.trim().split(/\\s+/)[0] : ''));
    return foca.apply(this, arguments);
  };
  addEventListener('click', function () {
    R.ini = performance.now(); R.dentro = true; R.focos = [];
    // o motor que foca o botão tocado já pôs o foco no valor da régua, que
    // este desenho tira da página
    const f = document.activeElement;
    R.focoNoValor = !!(f && f.closest && f.closest('.regua'));
  }, true);
  addEventListener('click', function () {
    const fim = performance.now();
    R.dentro = false;
    const l = document.getElementById('lastro-frio');
    const t = performance.now();
    l.offsetHeight;
    R.cliques.push({ handler: fim - R.ini, pendente: performance.now() - t, focoNoValor: R.focoNoValor, focos: R.focos.slice() });
  }, false);
})()`;

/** O dedo (toque de verdade) ou o ponteiro (o mouse apertado, como o "dedo" do revisor no WebKit). */
async function toca(nav, como, x, y) {
  if (como === 'ponteiro') { await nav.p.mouse.move(x, y); await nav.p.mouse.down(); await nav.espera(60); await nav.p.mouse.up(); }
  else await nav.toca(x, y);
}

test('o toque da 1ª série a frio não monta o desenho dentro dele: o estilo e o layout ficam para o quadro, e o foco vai depois do layout', DEMORADO, async () => {
  const falhas = [];
  const visto = [];
  // o ponteiro primeiro: no WebKit é o que foca o botão, e o primeiro desenho do
  // descanso no processo do motor é o frio de verdade
  for (const como of ['ponteiro', 'dedo']) {
    const nav = await abreNavegador();
    try {
      await nav.treinoDeHoje();
      await nav.E(`if (view.open !== 0) toggle(0); anotaSerie(0, 0, 0, 40); render();`);
      await nav.espera(150);
      assert.strictEqual(await nav.E('!!S.sessao'), false, 'ainda sem sessão: a série que vem é a primeira');
      await nav.p.evaluate(POE_O_LASTRO);

      const cel = await nav.caixa('#r0_0');
      await toca(nav, como, cel.cx, cel.cy);
      await nav.espera(250);
      const valor = await nav.caixa('.regua-v', 2);
      assert.ok(valor, como + ': a régua abriu');
      const custo = await nav.p.evaluate(CUSTO_DO_LASTRO);
      // o lastro tem de pesar: senão a conta 1 passaria vazia
      assert.ok(custo >= 25, MOTOR + ' · ' + como + ': o lastro custa só ' + custo.toFixed(1) + ' ms — leve demais para distinguir');
      await nav.p.evaluate(POE_O_RELOGIO);

      await toca(nav, como, valor.cx, valor.cy);
      await nav.espera(400);

      assert.strictEqual(await nav.E('!!S.sessao'), true, como + ': a série gravou e abriu a sessão — era a primeira');
      assert.strictEqual(await nav.p.evaluate(() => !!document.querySelector('.regua')), false, como + ': a régua fechou (é o que muda o lastro)');
      const r = await nav.p.evaluate(() => window.__frio.cliques);
      assert.strictEqual(r.length, 1, como + ': um clique só: ' + JSON.stringify(r));
      const { handler, pendente, focoNoValor, focos } = r[0];
      const caso = MOTOR + ' · ' + como + ': o toque levou ' + handler.toFixed(1) + ' ms; o lastro custa ' + custo.toFixed(1) +
        ' ms, e no fim do toque ainda custava ' + pendente.toFixed(1) + ' ms';
      visto.push(caso + (focos.length ? ' · focus() dentro: ' + focos.join(', ') : ''));
      // 1. o desenho ficou para o quadro: o lastro ainda estava por montar...
      if (pendente < custo / 3) falhas.push(caso + ' — o toque montou o estilo ou o layout do documento dentro dele');
      // ...e o toque não o pagou
      if (handler >= custo / 2) falhas.push(caso + ' — o toque esperou o desenho');
      // 2. a causa achada: nenhum focus() dentro do toque
      if (focos.length) falhas.push(caso + ' — focus() dentro do toque: ' + focos.join(', '));
      // o foco continua indo aonde ia: o valor tocado tinha o foco e saiu da
      // página, e o foco não fica no body — vai ao título do treino
      if (focoNoValor) {
        const foco = await nav.p.evaluate(() => { const e = document.activeElement; return !e || e === document.body ? 'body' : e.tagName.toLowerCase(); });
        if (foco !== 'h1') falhas.push(MOTOR + ' · ' + como + ': o valor tocado saiu da página, e o foco foi a ' + foco + ' — tinha de ir ao título do treino');
      }
      assert.deepStrictEqual(nav.erros, []);
    } finally { await nav.fecha(); }
  }
  // o que se mediu, para o relatório (passando ou não)
  console.log(visto.join('\n'));
  assert.deepStrictEqual(falhas, [], visto.join(' | '));
});
