// O DEDO NÃO PERDE O LUGAR, medido no motor de verdade.
//
// Defeito 2 da docs/motion/03 §8.6, consertado na peça 2 do motion: o nó
// persiste no render(), mas a posição não. Na primeira série da sessão nascem
// no topo o relógio e Pausar/Encerrar — 52 px —, a linha tocada descia e a
// célula de CARGA da mesma série caía sob o dedo (medido antes: célula de y 323
// para 375; sob o dedo, "Série 1: 40 quilos por lado"). No teclado próprio, a
// tecla de cima caía sob o dedo. Depois de "Pular", o cartão fecha e o NOME do
// exercício seguinte subia para baixo do dedo: um segundo toque abria outro
// cartão.
//
// O jsdom não tem layout, então estes casos sobem o build num Chromium
// (`navegador.js`). Cada um mede a posição antes e depois, com ±2 px, e o que
// fica sob o ponto exato em que o dedo tocou. E cada um confere primeiro que o
// defeito tinha como acontecer — a série é a primeira, a sessão nasce, o relógio
// aparece —, senão o caso passaria vazio.
import { afterAll, test } from 'vitest';
import assert from 'node:assert';
import { abreNavegador, fechaNavegador } from './navegador.js';

// Folga larga: a suíte inteira roda em paralelo com o navegador.
const DEMORADO = { timeout: 120000 };
afterAll(fechaNavegador);
const FOLGA_PX = 2;

/** O cartão 0 aberto, sem sessão: a próxima série completa é a primeira. */
async function cartaoAberto(nav, extra) {
  await nav.treinoDeHoje();
  await nav.E(`if (view.open !== 0) toggle(0); ${extra || ''} render();`);
  await nav.espera(120);
  assert.strictEqual(await nav.E('!!S.sessao'), false, 'ainda sem sessão: a série que vem é a primeira');
  assert.strictEqual(await nav.caixa('#relogio'), null, 'e sem o relógio no topo');
}

/** A sessão nasceu com a série, e o topo cresceu: a condição do defeito aconteceu. */
async function sessaoNasceu(nav) {
  assert.strictEqual(await nav.E('!!S.sessao'), true, 'a série abriu a sessão');
  assert.ok(await nav.caixa('#relogio'), 'e o relógio nasceu no topo — o que descia a linha');
}

test('a 1ª série pela régua: a linha fica onde estava, e a carga da mesma série não cai sob o dedo', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await cartaoAberto(nav, 'anotaSerie(0, 0, 0, 40);');
    const cel = await nav.caixa('#r0_0');
    await nav.toca(cel.cx, cel.cy);
    await nav.espera(150);
    const valor = await nav.caixa('.regua-v', 2);
    assert.ok(valor, 'a régua abriu');
    const antes = await nav.topoDaLinha(0, 0);

    await nav.toca(valor.cx, valor.cy);
    await nav.espera(200);

    await sessaoNasceu(nav);
    assert.notStrictEqual(await nav.E('draftPeek(0).s[0][1]'), null, 'o valor entrou na célula');
    const depois = await nav.topoDaLinha(0, 0);
    assert.ok(Math.abs(depois - antes) <= FOLGA_PX,
      'a linha da série saiu do lugar: y ' + antes + ' → ' + depois + ' (antes do conserto, +52)');
    const sob = await nav.sobODedo(valor.cx, valor.cy);
    assert.ok(!sob.controle || !sob.controle.startsWith('button#w0_0'),
      'sob o dedo ficou a carga da MESMA série: ' + JSON.stringify(sob));
    assert.deepStrictEqual(nav.erros, []);
  } finally { await nav.fecha(); }
});

test('a 1ª série pela coluna anterior: a linha fica, e sob o dedo continua o mesmo botão', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await cartaoAberto(nav);
    const ant = await nav.caixa('[data-ex="0"] .setant-b', 0);
    assert.ok(ant, 'há coluna anterior na série 1');
    const antes = await nav.topoDaLinha(0, 0);

    await nav.toca(ant.cx, ant.cy);
    await nav.espera(200);

    await sessaoNasceu(nav);
    const depois = await nav.topoDaLinha(0, 0);
    assert.ok(Math.abs(depois - antes) <= FOLGA_PX, 'a linha saiu do lugar: y ' + antes + ' → ' + depois);
    const mesmo = await nav.p.evaluate(([x, y]) => {
      const e = document.elementFromPoint(x, y);
      return !!e && e.closest('button') === document.querySelector('[data-ex="0"] .setant-b');
    }, [ant.cx, ant.cy]);
    assert.ok(mesmo, 'sob o dedo devia continuar o "anterior" da série 1: ' +
      JSON.stringify(await nav.sobODedo(ant.cx, ant.cy)));
  } finally { await nav.fecha(); }
});

test('a 1ª série pelo teclado próprio: a tecla seguinte continua onde o dedo está', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    // a repetição já posta; a carga digitada é o que completa a série
    await cartaoAberto(nav, 'anotaSerie(0, 0, 1, 10);');
    const cel = await nav.caixa('#w0_0');
    await nav.toca(cel.cx, cel.cy);
    await nav.espera(150);
    const tecla = await nav.caixa('[data-a="tcl-4"]');
    assert.ok(tecla, 'o teclado abriu');
    const antes = await nav.caixa('.tcl');

    await nav.toca(tecla.cx, tecla.cy);
    await nav.espera(200);

    await sessaoNasceu(nav);
    const depois = await nav.caixa('.tcl');
    assert.ok(Math.abs(depois.y - antes.y) <= FOLGA_PX, 'o teclado saiu do lugar: y ' + antes.y + ' → ' + depois.y);
    const sob = await nav.sobODedo(tecla.cx, tecla.cy);
    assert.ok(sob.controle && sob.controle.includes('[tcl-4]'),
      'sob o dedo devia continuar a tecla 4 (o "0" de "40" iria para outra): ' + JSON.stringify(sob));
  } finally { await nav.fecha(); }
});

for (const sessao of [false, true]) {
  test('"Pular" ' + (sessao ? 'com a sessão aberta' : 'antes da primeira série') +
       ': sob o dedo fica a frase "Pulado hoje…", e não o exercício seguinte', DEMORADO, async () => {
    const nav = await abreNavegador();
    try {
      for (const i of [0, 1, 3]) {
        await nav.treinoDeHoje({ sessao });
        await nav.E(`if (view.open !== ${i}) toggle(${i}); render();`);
        await nav.espera(120);
        const n = await nav.p.evaluate(i => [...document.querySelectorAll('[data-ex="' + i + '"] .exacoes button')]
          .findIndex(b => b.textContent.trim() === 'Pular'), i);
        assert.ok(n >= 0, 'o cartão ' + i + ' tem "Pular"');
        const pular = await nav.caixa('[data-ex="' + i + '"] .exacoes button', n);

        await nav.toca(pular.cx, pular.cy);
        await nav.espera(250);

        assert.strictEqual(await nav.E(`ehPulado(${i})`), true, 'o exercício ' + i + ' ficou pulado');
        const sob = await nav.p.evaluate(([x, y]) => {
          const e = document.elementFromPoint(x, y);
          return { naFrase: !!(e && e.closest('.puladobox') && !e.closest('button')),
                   o: e ? (e.className || e.tagName) + ' · ' + (e.textContent || '').trim().slice(0, 40) : null };
        }, [pular.cx, pular.cy]);
        assert.ok(sob.naFrase, 'cartão ' + i + ': sob o dedo ficou ' + sob.o);
      }
    } finally { await nav.fecha(); }
  });
}

test('a altura do cronômetro chega a quem se empilha nele sem ser medida no meio do toque', DEMORADO, async () => {
  // Peça 2 (docs/motion/04 R8): `alturaDoTimer` lia `offsetHeight` no toque da
  // série e montava o layout duas vezes. Agora um ResizeObserver publica a
  // altura no desenho seguinte; o que este caso cobra é o contrato com o toast,
  // a faixa e o fim da página: a variável é a altura de verdade com o
  // cronômetro na tela, e zero sem ele — inclusive quando um descanso substitui
  // outro no mesmo toque.
  const nav = await abreNavegador();
  try {
    await nav.treinoDeHoje({ sessao: true });
    const medida = () => nav.p.evaluate(() => ({
      publicada: getComputedStyle(document.documentElement).getPropertyValue('--ins-timer-h').trim(),
      timer: document.getElementById('timer').offsetHeight
    }));
    await nav.E(`startTimer(90, 'descanso · série 1 · teste');`);
    await nav.espera(100);
    let m = await medida();
    assert.ok(m.timer > 0);
    assert.strictEqual(m.publicada, m.timer + 'px', 'com o cronômetro na tela');

    await nav.E(`startTimer(120, 'descanso · série 2 · teste');`);   // sai e entra no mesmo toque
    await nav.espera(100);
    m = await medida();
    assert.strictEqual(m.publicada, m.timer + 'px', 'um descanso que substitui outro');

    await nav.E(`stopTimer();`);
    await nav.espera(100);
    m = await medida();
    assert.strictEqual(m.publicada, '0px', 'sem o cronômetro, zero');
  } finally { await nav.fecha(); }
});

// ---------- o pouso, como o motor o roda ----------

/** As animações vivas nos números das células, com o que importa de cada uma. */
const POUSOS = `(function () {
  return document.getAnimations()
    .filter(function (a) { return a.effect && a.effect.target && a.effect.target.classList.contains('pousa'); })
    .map(function (a) {
      const t = a.effect.getTiming();
      const props = [];
      a.effect.getKeyframes().forEach(function (k) { Object.keys(k).forEach(function (p) {
        if (['offset', 'computedOffset', 'easing', 'composite'].indexOf(p) < 0 && props.indexOf(p) < 0) props.push(p);
      }); });
      // numa animação de CSS a curva mora nos quadros, e não no efeito
      const curva = (a.effect.getKeyframes()[0] || {}).easing;
      return { nome: a.animationName, dur: t.duration, curva: curva, props: props.sort(),
               celula: a.effect.target.closest('button').id, estado: a.playState };
    });
})()`;

test('o número pousa só na célula que o recebeu, sobe e acende em 160 ms, e um render() no meio não o reinicia', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await nav.treinoDeHoje({ sessao: true });
    // outras células já cheias, para "outro número pousar" ter onde acontecer
    await nav.E(`if (view.open !== 0) toggle(0); anotaSerie(0, 0, 0, 40); anotaSerie(0, 1, 0, 40); anotaSerie(0, 1, 1, 8); render();`);
    await nav.espera(120);
    assert.deepStrictEqual(await nav.E(POUSOS), [], 'abrir o cartão não faz nada pousar');

    await nav.E(`abreRegua(0, 0);`);
    await nav.espera(60);
    const r = await nav.p.evaluate(async (POUSOS) => {
      const pousos = () => window.__escopo(POUSOS);
      document.querySelectorAll('.regua-v')[2].click();
      const logo = pousos();
      const anim = document.getAnimations().filter(a => a.effect.target.classList.contains('pousa'))[0];
      await new Promise(ok => setTimeout(ok, 60));
      const t1 = anim.currentTime;
      window.__escopo('render()');
      const mesma = document.getAnimations().indexOf(anim) >= 0;
      const t2 = anim.currentTime;
      return { logo, t1, t2, mesma, depois: pousos() };
    }, POUSOS);

    assert.strictEqual(r.logo.length, 1, 'um número pousa, e só um: ' + JSON.stringify(r.logo));
    assert.deepStrictEqual(r.logo[0], { nome: 'ins-pousa', dur: 160, curva: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      props: ['opacity', 'translate'], celula: 'r0_0', estado: 'running' });
    assert.ok(r.mesma, 'o render() no meio trocou a animação');
    assert.ok(r.t1 > 0 && r.t2 >= r.t1, 'o render() no meio reiniciou o pouso: ' + r.t1 + ' → ' + r.t2);
    assert.strictEqual(r.depois.length, 1, 'o render() no meio fez outro número pousar: ' + JSON.stringify(r.depois));

    // corrigir é outro valor: outro nó, outro pouso
    await nav.espera(300);
    await nav.E(`abreRegua(0, 0);`);
    await nav.espera(60);
    const corrige = await nav.p.evaluate((POUSOS) => {
      const antes = document.querySelector('#r0_0 .pousa');
      document.querySelectorAll('.regua-v')[3].click();
      const depois = document.querySelector('#r0_0 .pousa');
      return { outroNo: antes !== depois, vivos: window.__escopo(POUSOS).filter(a => a.estado === 'running') };
    }, POUSOS);
    assert.ok(corrige.outroNo, 'o valor novo mora num nó novo');
    assert.deepStrictEqual(corrige.vivos.map(a => a.celula), ['r0_0']);
  } finally { await nav.fecha(); }
});

test('a coluna anterior pousa as duas células; o teclado não pousa tecla nenhuma', DEMORADO, async () => {
  const nav = await abreNavegador();
  try {
    await nav.treinoDeHoje({ sessao: true });
    await nav.E(`if (view.open !== 0) toggle(0); render();`);
    await nav.espera(120);
    const ant = await nav.p.evaluate((POUSOS) => {
      document.querySelector('[data-ex="0"] .setant-b').click();
      return window.__escopo(POUSOS).map(a => a.celula).sort();
    }, POUSOS);
    assert.deepStrictEqual(ant, ['r0_0', 'w0_0']);

    await nav.espera(1200);                    // a marca venceu
    await nav.E(`abreTecladoDeCarga(0, 1);`);
    await nav.espera(60);
    const tecla = await nav.p.evaluate((POUSOS) => {
      document.querySelector('[data-a="tcl-5"]').click();
      return window.__escopo(POUSOS).filter(a => a.estado === 'running');
    }, POUSOS);
    assert.deepStrictEqual(tecla, [], 'tecla a tecla, o número não pousa');
  } finally { await nav.fecha(); }
});

test('com "Reduzir movimento" o número não se desloca: só acende, em 120 ms', DEMORADO, async () => {
  const nav = await abreNavegador({ reduz: true });
  try {
    await nav.treinoDeHoje({ sessao: true });
    await nav.E(`if (view.open !== 0) toggle(0); abreRir(0, 0);`);
    await nav.espera(120);
    const r = await nav.p.evaluate((POUSOS) => {
      document.querySelectorAll('.rirop')[1].click();
      return window.__escopo(POUSOS);
    }, POUSOS);
    assert.deepStrictEqual(r, [{ nome: 'ins-acende', dur: 120, curva: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      props: ['opacity'], celula: 'q0_0', estado: 'running' }]);
  } finally { await nav.fecha(); }
});
