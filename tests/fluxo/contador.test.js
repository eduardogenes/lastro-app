// O contador "séries N/M" do topo do treino: a tela diz o que o dado diz.
//
// Defeito 1 da docs/motion/03 §8.1, consertado na peça 2 do motion. O contador
// tinha dois escritores: o Preact, no render(), e `atualizaEstado`, que
// escrevia `textContent` direto no nó a cada série gravada sem render(). Isso
// TROCAVA o nó de texto que o Preact guardava, e dali em diante o render()
// pintava num nó solto: o que só passa pelo render() — ligar o deload, mudar
// séries na edição do dia — deixava a tela com o número velho. Medido antes:
// tela 1/20 com o dado em 1/12 (deload); tela 0/23 com o dado em 0/24 (edição).
//
// Agora o escritor é um só, o componente `Contador` (`ui/telas/treino.jsx`), e
// o casco só o avisa. O Preact agenda o desenho do aviso para antes do próximo
// quadro, e por isso cada conferência espera um tique.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** O que a tela mostra e o que o dado diz, lado a lado. */
function telaEDado(a) {
  return {
    tela: a.texto('#daymeta'),
    dado: a.E(`seriesFeitasHoje(view.day) + '/' + treino(view.day).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0)`)
  };
}
async function confere(a, quando) {
  await a.esperar(0);
  const c = telaEDado(a);
  assert.strictEqual(c.tela, c.dado, quando + ': a tela diz ' + c.tela + ' e o dado ' + c.dado);
  return c;
}

test('ligar e desligar o deload depois de uma série: a tela diz o que o dado diz', async () => {
  const a = await app();
  a.v('toggle', 0);
  // a série grava pela porta por valor, SEM render(): é o caminho do aviso, o
  // que trocava o nó do Preact
  a.preencher(0, 0, 40, 8);
  const antes = await confere(a, 'depois da série');
  assert.match(antes.tela, /^1\//);

  await a.v('setDeload', true);
  const deload = await confere(a, 'com o deload ligado');
  assert.notStrictEqual(deload.dado, antes.dado, 'o deload muda o total prescrito — senão o caso não prova nada');

  await a.v('setDeload', false);
  const volta = await confere(a, 'com o deload desligado');
  assert.strictEqual(volta.dado, antes.dado);
  a.fechar();
});

test('mudar séries na edição do dia, e o "+ série": a tela diz o que o dado diz', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 8);
  const antes = await confere(a, 'depois da série');

  a.v('mudaSeries', 0, 1);
  const mais = await confere(a, 'com uma série a mais na edição do dia');
  assert.notStrictEqual(mais.dado, antes.dado, 'a edição muda o total — senão o caso não prova nada');

  a.v('mudaSeries', 0, -1);
  await confere(a, 'de volta');

  a.clicar('[data-a="mais-serie-0"]');
  const maisSerie = await confere(a, 'depois do "+ série"');
  assert.notStrictEqual(maisSerie.dado, antes.dado);
  a.fechar();
});

test('um escritor só: o contador continua sendo o mesmo nó de texto depois de cada série', async () => {
  // A forma do defeito, e não só o sintoma: escrever `textContent` por fora
  // troca o nó que o Preact guarda. Se alguém voltar a escrever no contador por
  // fora, o nó muda aqui mesmo que a tela ainda acerte o número.
  const a = await app();
  a.v('toggle', 0);
  const textos = () => {
    const out = [];
    const ir = a.doc.createTreeWalker(a.$('#daymeta'), 4 /* NodeFilter.SHOW_TEXT */);
    while (ir.nextNode()) out.push(ir.currentNode);
    return out;
  };
  const antes = textos();
  assert.strictEqual(antes.length, 1);

  a.preencher(0, 0, 40, 8);
  await a.esperar(0);
  const depois = textos();
  assert.strictEqual(a.texto('#daymeta').split('/')[0], '1');
  assert.ok(depois.length === 1 && depois[0] === antes[0], 'o nó de texto do contador foi trocado por fora do Preact');
  a.fechar();
});
