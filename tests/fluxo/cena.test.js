// O DESCANSO ENTRA E SAI DE CENA por classe, e nada espera o fim de animação.
//
// Peça 3 do motion (docs/motion/03 §4.3; dono, 16/10, pergunta 9: "sobe da
// borda e desce"). O cronômetro deixou de ser `display: none` fora de cena, que
// não transiciona: fora de cena ele está layoutado, abaixo da borda e
// `visibility: hidden`. Três classes, todas postas pelo casco (`main.jsx`):
//   - `.on`   em cena (o último quadro);
//   - `.sai`  descendo: segura a visibilidade pelo tempo de `--ins-dur-sai`,
//             lido na porta do movimento (`tempo()`), que é 0 sob "Reduzir
//             movimento" — e aí `.sai` nem entra;
//   - `.anda` o cronômetro se move (posta pelo toque; a abertura não se move).
//
// Aqui, na árvore (jsdom, sem layout nem animação nenhuma): a ordem das
// classes, o estado gravado ANTES de qualquer desenho, a descida que acaba
// pelo relógio da porta e não por evento (o jsdom nunca dispara fim de
// transição — se a classe sai aqui, ninguém o esperava), e o caminho parado.
// O movimento como o motor o roda — 350 ms na curva do iPhone, o lugar no
// modo, o toast e a faixa acompanhando, o esmaecer — é `descanso.test.js`.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

/** O aparelho que pediu movimento (ou menos), visto pela porta do app. */
const pede = reduz => ({
  antesDoApp: w => {
    w.matchMedia = q => ({ matches: reduz ? /:\s*reduce\)/.test(q) : /:\s*no-preference\)/.test(q), media: q,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  }
});
const classes = a => [...a.$('#timer').classList].sort().join(' ');
const publicada = a => a.doc.documentElement.style.getPropertyValue('--ins-timer-h');
/** O tempo da saída, como a porta o lê: o token, e não um número deste teste. */
const tempoDaSaida = a => {
  const m = /^(\d*\.?\d+)(ms|s)$/.exec(a.E(`getComputedStyle(document.documentElement).getPropertyValue('--ins-dur-sai')`).trim());
  assert.ok(m, 'o token --ins-dur-sai não se lê');
  return Number(m[1]) * (m[2] === 's' ? 1000 : 1);
};

test('o descanso entra em cena já gravado, e sai descendo: o relógio da porta tira a classe, não um evento', async () => {
  const a = await app(pede(false));
  const SAI = tempoDaSaida(a);
  assert.ok(SAI > 0, 'com movimento pedido, a saída tem tempo');
  assert.strictEqual(classes(a), '', 'fora de cena antes de qualquer descanso');
  assert.strictEqual(publicada(a), '0px', 'e a altura publicada é zero');

  a.v('startTimer', 90, 'descanso · série 1 · Supino');
  // o toque nunca espera: o alvo e a chave local já estão gravados AGORA,
  // no mesmo tique, antes de o navegador desenhar a subida
  assert.ok(a.dado('timerFim') > Date.now(), 'o alvo do descanso já está gravado');
  assert.strictEqual(classes(a), 'anda on', 'em cena, e pelo toque: ele sobe');
  await a.esperar();
  assert.ok(a.window.localStorage.getItem('lastro-descanso-v1'), 'e a chave local também (a escrita do disco é assíncrona, não a da tela)');

  a.v('stopTimer');
  assert.strictEqual(a.dado('timerFim'), 0, 'parar zera o alvo na hora');
  assert.strictEqual(classes(a), 'anda sai', 'fora de cena, mas ainda visível enquanto desce');
  assert.strictEqual(publicada(a), '0px', 'o toast e a faixa descem junto: a altura publicada já é zero');
  assert.strictEqual(a.texto('#tctx'), 'descanso · série 1 · Supino', 'ele desce inteiro, com a procedência que tinha');

  await a.esperar();
  assert.strictEqual(a.window.localStorage.getItem('lastro-descanso-v1'), null, 'a chave local saiu, com ele ainda descendo');
  await a.esperar(SAI + 80);
  assert.strictEqual(classes(a), 'anda', 'a descida acabou pelo relógio da porta — o jsdom nunca dispara fim de transição');
  assert.strictEqual(a.texto('#tctx'), '', 'e o rótulo sai junto com o descanso');
  a.fechar();
});

test('um descanso que substitui outro troca no lugar; um que chega no meio da descida sobe dali', async () => {
  const a = await app(pede(false));
  const SAI = tempoDaSaida(a);
  a.v('startTimer', 90, 'descanso · série 1 · Supino');
  a.v('startTimer', 120, 'descanso · série 2 · Supino');
  assert.strictEqual(classes(a), 'anda on', 'tirar e pôr na mesma tarefa: o estilo nunca o vê fora');
  assert.strictEqual(a.texto('#tctx'), 'descanso · série 2 · Supino');
  await a.esperar(SAI + 80);
  assert.strictEqual(classes(a), 'anda on', 'nenhuma descida ficou agendada');

  a.v('stopTimer');
  await a.esperar(Math.round(SAI / 3));
  assert.strictEqual(classes(a), 'anda sai', 'descendo');
  a.v('startTimer', 90, 'descanso · série 3 · Supino');
  assert.strictEqual(classes(a), 'anda on', 'o descanso novo desfaz a descida');
  await a.esperar(SAI + 80);
  assert.strictEqual(classes(a), 'anda on', 'e a descida que foi desfeita não o tira de cena depois');
  assert.strictEqual(a.texto('#tctx'), 'descanso · série 3 · Supino', 'nem apaga a procedência do novo');
  a.fechar();
});

test('±15 e parar respondem no meio da subida, e o −15 que zera desce como parar', async () => {
  const a = await app(pede(false));
  a.v('startTimer', 20, 'descanso · série 1 · Supino');
  const fim = a.dado('timerFim');
  a.$('#tmais').click();
  assert.strictEqual(a.dado('timerFim'), fim + 15000, '+15 chegou no mesmo tique, com o cronômetro subindo');
  a.$('#tmenos').click();
  a.$('#tmenos').click();
  a.$('#tmenos').click();
  assert.strictEqual(a.dado('timerFim'), 0, 'o −15 que passa de zero para o descanso');
  assert.strictEqual(classes(a), 'anda sai', 'e ele desce por onde veio');
  a.v('startTimer', 90, 'descanso · série 2 · Supino');
  a.$('#tstop').click();
  assert.strictEqual(a.dado('timerFim'), 0, 'parar no meio da subida para na hora');
  assert.strictEqual(classes(a), 'anda sai');
  a.fechar();
});

test('sob "Reduzir movimento", e onde a porta não sabe, ele sai de uma vez', async () => {
  for (const [nome, opcoes] of [['reduzir movimento', pede(true)], ['sem matchMedia (o jsdom cru)', {}]]) {
    const a = await app(opcoes);
    a.v('startTimer', 90, 'descanso · série 1 · Supino');
    assert.strictEqual(classes(a), 'anda on', nome + ': em cena');
    a.v('stopTimer');
    assert.strictEqual(classes(a), 'anda', nome + ': fora de cena de uma vez, sem a classe da descida');
    assert.strictEqual(a.texto('#tctx'), '', nome + ': e o rótulo sai junto');
    assert.strictEqual(publicada(a), '0px');
    a.fechar();
  }
});

test('o descanso que volta na abertura aparece no lugar, sem subir', async () => {
  // A abertura do app não se move (docs/motion/08 §4, "o que fica sem
  // movimento"): o cronômetro religado no boot entra em cena sem `.anda`, e as
  // regras de transição (que pedem `.anda`) não o alcançam.
  const agora = agoraEstavel(8);
  const a = await app(Object.assign(pede(false), {
    agora: agora,
    chaves: { 'lastro-descanso-v1': { fim: agora + 120000, total: 180, ctx: 'descanso · série 2 · Remada' } }
  }));
  await a.pronto();
  await a.esperar(60);
  assert.strictEqual(classes(a), 'on', 'religado no boot, em cena e parado');
  // e o primeiro toque depois disso já move: parar desce
  a.v('stopTimer');
  assert.strictEqual(classes(a), 'anda sai');
  a.relogioNormal();
  a.fechar();
});
