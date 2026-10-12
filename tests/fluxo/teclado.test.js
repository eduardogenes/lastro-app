// O TECLADO PRÓPRIO na tela — §6.2 da frente 2, T1 a T4.
//
// Ele abre pela porta "outro valor" da régua, no mesmo lugar em que a régua
// abre: embaixo da linha da série. Só um painel por vez.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const DIA = 86400000;

function comHistorico() {
  const agora = Date.UTC(2025, 0, 8, 15, 0, 0);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

/** Abre o cartão, a régua da série 1 e o teclado pela porta "outro valor". */
async function abreTeclado() {
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  a.clicar(a.$('[data-a="regua-outro"]'));
  await a.esperar();
  assert.ok(a.$('.tcl-grade'), 'pré-condição: o teclado abriu');
  return a;
}

test('a ordem das teclas é a da calculadora, não a do telefone', async () => {
  // A ordem do protótipo da D, conferida pela frente 2: quem registra carga está
  // fazendo conta, não discando. Telefone teria 1 2 3 em cima.
  const a = await abreTeclado();
  const teclas = a.$$('.tcl-grade > *').map(function (el) { return el.textContent.trim(); });
  assert.deepStrictEqual(teclas, ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫'],
    'a grade tem doze lugares, e o da vírgula fica vazio num campo inteiro');
  a.fechar();
});

test('o teclado FÍSICO digita, e era o único defeito nomeado do próprio', async () => {
  // T1. C2 nomeou e a frente conferiu: o teclado de doze teclas do protótipo tem
  // ZERO `keydown` — existe só por `click`. Quem está no notebook, com teclado de
  // verdade na frente, tinha de mirar com o mouse em doze teclas. O dono usa o
  // notebook "bastante" (P8, P11) e ninguém contou quanto, então o requisito não
  // se justifica por volume: se justifica por não haver razão para não o fazer.
  const a = await abreTeclado();
  a.digitar('w0_0', 60);
  const painel = a.$('.tcl');

  const tecla = function (k) {
    painel.dispatchEvent(new a.window.KeyboardEvent('keydown', { key: k, bubbles: true }));
  };
  tecla('2'); await a.esperar();
  tecla('7'); await a.esperar();

  assert.ok(a.texto('.tcl-visor').includes('27'), 'o visor recebeu o que o teclado físico digitou');
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 27, 'e a série foi registrada');

  tecla('Backspace'); await a.esperar();
  assert.ok(a.texto('.tcl-visor').includes('2'), 'o Backspace apaga');
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 2);
  a.fechar();
});

test('Enter e Escape fecham o painel', async () => {
  const a = await abreTeclado();
  a.$('.tcl').dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.$('.tcl-grade'), null, 'o Enter fechou');

  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  a.clicar(a.$('[data-a="regua-outro"]'));
  await a.esperar();
  a.$('.tcl').dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.$('.tcl-grade'), null, 'e o Escape também');
  a.fechar();
});

test('o painel recebe o foco ao abrir', async () => {
  // T2, e é também o que faz o `keydown` da raiz alcançar o teclado físico sem
  // ouvinte de `document` — o mecanismo que causou a intermitência deste projeto.
  //
  // A ESPERA É MAIOR DE PROPÓSITO, e o número tem razão medida: **neste jsdom
  // `requestAnimationFrame` é `undefined`** (conferi), então o Preact enfileira
  // os efeitos com `setTimeout(_, 100)` em vez de esperar o quadro. O foco chega
  // por volta dos 100 ms, e `esperar()` sem argumento dá 20. Num navegador de
  // verdade o rAF existe e o efeito roda no quadro seguinte.
  //
  // Vale para qualquer caso que dependa de `useEffect`: o padrão do harness não
  // alcança o efeito.
  const a = await abreTeclado();
  await a.esperar(150);
  assert.strictEqual(a.doc.activeElement, a.$('.tcl'),
    'sem foco no painel, o teclado físico não chega nele');
  a.fechar();
});

test('o visor é região viva, e informa sem interromper', async () => {
  // No protótipo o visor é um `<b>` que muda de texto sem anunciar nada — o
  // mesmo defeito do R-D1, num lugar onde o valor é a única coisa que existe.
  const a = await abreTeclado();
  const visor = a.$('.tcl-visor');
  assert.strictEqual(visor.getAttribute('role'), 'status');
  assert.strictEqual(visor.getAttribute('aria-live'), 'polite',
    'polite e não assertive: informa, não interrompe');
  a.fechar();
});

test('as teclas que não são dígito têm nome acessível', async () => {
  // "⌫" lido em voz alta não é nada. O protótipo já acertava isto, e o requisito
  // é manter.
  const a = await abreTeclado();
  const apaga = a.$('[data-a="tcl-apaga"]');
  assert.ok(/apagar/i.test(apaga.getAttribute('aria-label') || ''),
    'o apagar diz o que faz: ' + apaga.getAttribute('aria-label'));
  a.$$('.tcl-t').forEach(function (b) {
    const t = b.textContent.trim();
    if (/^[0-9]$/.test(t)) return;
    assert.ok(b.getAttribute('aria-label'), 'a tecla "' + t + '" não tem nome');
  });
  a.fechar();
});

test('o visor nasce com o valor que já estava, e não do zero', async () => {
  // Corrigir 27 para 28 não deve começar de novo: o texto nasce do registrado.
  const a = await abreTeclado();
  a.digitar('w0_0', 60);
  a.clicar(a.$('[data-a="tcl-2"]'));
  await a.esperar();
  a.clicar(a.$('[data-a="tcl-7"]'));
  await a.esperar();
  a.clicar(a.$('[data-a="tcl-pronto"]'));
  await a.esperar();

  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  a.clicar(a.$('[data-a="regua-outro"]'));
  await a.esperar();
  assert.ok(a.texto('.tcl-visor').includes('27'), 'o visor reabriu com o 27');
  a.fechar();
});

test('o pronto fecha, e o que foi digitado fica', async () => {
  // Um estado sem saída é defeito (§7), e o painel abre embaixo da linha: sem o
  // "pronto" a única saída seria tocar noutra coisa.
  const a = await abreTeclado();
  a.digitar('w0_0', 60);
  a.clicar(a.$('[data-a="tcl-3"]'));
  await a.esperar();
  a.clicar(a.$('[data-a="tcl-pronto"]'));
  await a.esperar();
  assert.strictEqual(a.$('.tcl-grade'), null, 'fechou');
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 3, 'e o valor ficou');
  a.fechar();
});
