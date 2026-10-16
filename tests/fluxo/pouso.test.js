// O POUSO da série: QUAL número pousa, e quando a marca sai.
//
// Peça 2 do motion (docs/motion/03 §4.2; dono, 16/10, pergunta 8: pouso). O
// número que acabou de entrar na célula mora num nó próprio por valor e pousa
// só sob a marca de "recém" que o toque que grava põe: a régua, o RIR, a coluna
// anterior (as duas células) e a carga que o "+ série" copia. O teclado não.
//
// Aqui, na árvore (jsdom, sem animação nenhuma): a classe `recem`, o nó por
// valor, e que a marca sai sem ouvir o fim de animação. O movimento como o
// motor o roda — 160 ms, só `translate` e `opacity`, só opacidade sob "Reduzir
// movimento", e um render() no meio que não o reinicia — é `dedo.test.js`.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/** Uma semana anterior do A (há coluna ANTERIOR) e o A como o próximo da rotação. */
function comHistorico() {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    // o relógio parado: a marca vale um segundo, e a suíte inteira rodando em
    // paralelo não pode vencê-la no meio de um caso
    agora: agora
  };
}

/** As células com o número sob a marca: `w0_0`, `r0_0`… */
const pousando = a => a.$$('.pousa.recem').map(s => s.closest('button').id).sort();

test('a régua pousa a repetição tocada, só ela, num nó por valor que um render() não troca', async () => {
  const a = await app(comHistorico());
  a.v('toggle', 0);
  a.preencher(0, 0, 60, null);
  a.preencher(0, 1, 60, 7);
  await a.pintar();
  assert.deepStrictEqual(pousando(a), [], 'gravar pela porta por valor não pousa nada');
  assert.ok(a.$('#w0_0 .pousa'), 'o número da célula mora num nó próprio');

  await a.regua(0, 0, 8);
  assert.deepStrictEqual(pousando(a), ['r0_0']);
  const no = a.$('#r0_0 .pousa');
  assert.strictEqual(no.textContent, '8');

  await a.pintar();
  assert.strictEqual(a.$('#r0_0 .pousa'), no, 'um render() no meio não troca o nó (e a animação não recomeça)');
  assert.deepStrictEqual(pousando(a), ['r0_0'], 'nem faz outro número pousar');

  // corrigir é outro valor: outro nó, e o pouso é dele
  await a.regua(0, 0, 9);
  assert.notStrictEqual(a.$('#r0_0 .pousa'), no);
  assert.deepStrictEqual(pousando(a), ['r0_0']);

  // tocar de novo no mesmo valor apaga: nada pousa
  await a.regua(0, 0, 9);
  assert.strictEqual(a.$('#r0_0 .pousa'), null);
  assert.strictEqual(a.texto('#r0_0'), '·');
  assert.deepStrictEqual(pousando(a), []);
  a.fechar();
});

test('o RIR pousa a célula dele; a coluna anterior, as duas; o "+ série", a carga que trouxe', async () => {
  const a = await app(comHistorico());
  a.v('toggle', 0);
  a.preencher(0, 2, 60, 6);              // a série de onde o "+ série" copia
  await a.pintar();

  a.clicar(a.$$('[data-ex="0"] .setant-b')[0]);
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['r0_0', 'w0_0'], 'a coluna anterior');

  a.clicar('#q0_0');
  await a.esperar();
  a.clicar(a.$$('.rirop')[1]);
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['q0_0'], 'o RIR troca a marca pela dele');

  a.clicar('[data-a="mais-serie-0"]');
  await a.esperar();
  const nova = a.E('setsFor(treino(view.day).ex[0])') - 1;
  assert.deepStrictEqual(pousando(a), ['w0_' + nova], 'o "+ série" pousa a carga copiada');
  assert.strictEqual(a.texto('#w0_' + nova), a.texto('#w0_' + (nova - 1)));
  a.fechar();
});

test('o teclado próprio não pousa: a célula muda a cada tecla, e o olho está no visor', async () => {
  const a = await app(comHistorico());
  a.v('toggle', 0);
  a.clicar('#w0_0');
  await a.esperar();
  a.clicar('[data-a="tcl-6"]');
  await a.esperar();
  a.clicar('[data-a="tcl-0"]');
  await a.esperar();
  assert.strictEqual(a.texto('#w0_0'), '60');
  assert.deepStrictEqual(pousando(a), []);
  a.fechar();
});

test('a marca sai sozinha, sem ouvir o fim da animação: em um segundo, ou ao abrir e fechar o cartão', async () => {
  const a = await app(comHistorico());
  a.v('toggle', 0);
  a.clicar(a.$$('[data-ex="0"] .setant-b')[0]);
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['r0_0', 'w0_0']);

  a.E('Date.now = (function (t) { return function () { return t; }; })(Date.now() + 1100)');
  await a.pintar();
  assert.deepStrictEqual(pousando(a), [], 'um segundo depois, o render() seguinte desenha sem a marca');
  assert.ok(a.$('#w0_0 .pousa'), 'e o número continua lá, parado');

  a.clicar(a.$$('[data-ex="0"] .setant-b')[1]);
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['r0_1', 'w0_1']);
  a.v('toggle', 0);
  a.v('toggle', 0);
  assert.deepStrictEqual(pousando(a), [], 'o que reaparece ao abrir o cartão não pousa de novo');
  a.fechar();
});
