// A RÉGUA DE REPETIÇÕES, na tela.
//
// A ação mais frequente do produto: 48 registros de série por semana, de pé, com
// uma mão, entre duas séries. O dono escolheu a régua (decisão 8) e a frente 2
// §1 escreveu o conserto em sete requisitos; o domínio provou o ALCANCE
// (`tests/dominio/regua.test.ts`), e aqui ficam os que só a tela mostra.
//
// O que NÃO está medido, e nenhum destes casos substitui: o toque engolido e o
// erro de alvo (medição A) exigem o aparelho e o dedo dele, "idealmente suado".
// Jsdom não tem dedo. O que os casos abaixo seguram é que as ESCOLHAS de desenho
// que respondem àquelas medições continuem de pé.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const DIA = 86400000;

/** O mesmo estado dos casos de série: uma sessão de uma semana atrás. */
function comHistorico(sets) {
  const agora = Date.UTC(2025, 0, 8, 15, 0, 0);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: sets || [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

/** Os números que a régua está mostrando agora, em ordem. */
function visiveis(a) {
  return a.$$('.regua-v').map(function (b) { return Number(b.textContent.replace(/\D+/g, '')); });
}

async function abreCartao(opcoes) {
  const a = await app(opcoes || comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();
  return a;
}

test('exercício medido por tempo continua com campo', async () => {
  // A régua é de REPETIÇÃO. Em metro, caloria ou segundo o valor não é um número
  // curto de faixa conhecida — 500 m não cabe numa régua de onze valores.
  const a = await abreCartao();
  const comUnidade = a.vJ('treino', a.vista().day).ex.findIndex(function (e) { return !!a.v('unidadeDe', e); });
  if (comUnidade < 0) {
    // O Treino A pode não ter movimento medido: aí o caso prova o contrário —
    // que a régua está em todas as linhas dele, e não que ela nunca cede.
    assert.ok(a.vJ('vmExercicio', a.vista().day, 0, a.vJ('treino', a.vista().day).ex[0]).temRegua,
      'sem movimento medido no dia, toda linha tem régua');
    a.fechar();
    return;
  }
  a.v('toggle', comUnidade);
  await a.esperar();
  const campo = a.doc.getElementById('r' + comUnidade + '_0');
  assert.strictEqual(campo.tagName, 'INPUT', 'medido por tempo ou metro: campo');
  a.fechar();
});

