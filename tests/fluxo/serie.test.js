// Registrar uma série: o que acontece entre encostar no telefone e o descanso
// começar. É a interação de maior frequência do produto e a que acontece no
// pior contexto — de pé, com uma mão, entre duas séries.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/**
 * Uma sessão anterior do treino A, para que exista coluna ANTERIOR — e a
 * rotação parada de forma que o PRÓXIMO dia seja o A.
 *
 * A presença é registrada em HX, o último da rotação, de propósito: registrá-la
 * em A empurraria a rotação para o B, `iniciarSessao()` abriria o treino de
 * pernas, e os campos `w0_0`/`r0_0` passariam a ser de outro exercício — que é
 * como este arquivo mediu errado da primeira vez.
 *
 * A chave `A0` é a forma posicional antiga: a migração do boot a reindexa para
 * o id do exercício, que é onde o histórico mora hoje.
 */
function comHistorico() {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

test('sem histórico não há o que copiar, e a coluna volta a ser inerte', async () => {
  const a = await app();
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();
  assert.ok(!a.$('[data-ex="0"] .setant-b'), 'nada de botão que não faria nada');
  a.fechar();
});

test('sair do app descarrega a gravação represada', async () => {
  // `queueSave()` represa 700 ms para não escrever a cada tecla. Fechar o app
  // dentro dessa janela perdia a série recém-digitada.
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  a.preencher(0, 0, 72, 9);
  // NÃO espera os 700 ms: é justamente a janela que estava desprotegida.
  Object.defineProperty(a.doc, 'hidden', { value: true, configurable: true });
  a.doc.dispatchEvent(new a.window.Event('visibilitychange'));
  await a.esperar(50);

  const disco = JSON.parse(a.window.localStorage.getItem('lastro-v1'));
  const chave = a.k('A', 0);
  const linhas = disco.logs[chave];
  assert.deepStrictEqual(
    linhas[linhas.length - 1].sets[0], [72, 9],
    'a série está em disco sem ter esperado o debounce'
  );
  a.fechar();
});

// ---------------------------------------------------------------------------
// A SÉRIE GUARDADA É ANUNCIADA — R6 da frente 2
// ---------------------------------------------------------------------------
//
// A confirmação visual já existia: o número entra na célula que recebeu o toque.
// O que faltava era a metade auditiva — nenhuma das 94 chamadas de `toast()` é
// da gravação de série, e o `<input>` ecoava o valor por SER campo, o que deixa
// de valer no dia em que a régua de repetições substituir o campo.

test('gravar uma série anuncia o VALOR, não só "guardado"', async () => {
  // O valor dentro do anúncio é o ponto: um anúncio que diga só "guardado"
  // obriga quem usa leitor de tela a ir conferir o que foi guardado — que é
  // justamente o trabalho que o anúncio existe para poupar.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, 9);
  await a.esperar();

  const dito = a.doc.getElementById('serie-dita');
  assert.ok(dito, 'a região viva existe');
  assert.strictEqual(dito.getAttribute('aria-live'), 'polite',
    'informa, não interrompe — a mesma razão escrita do toast');
  assert.strictEqual(dito.getAttribute('role'), 'status');
  assert.strictEqual(dito.textContent, 'Guardei a série 1: 55 kg × 9.', 'o agente aparece, com o valor dentro');
  a.fechar();
});

test('corrigir uma série anuncia com palavra DIFERENTE de gravar', async () => {
  // O que mudou foi o valor, não o registro — e dizer "guardada" de novo faria
  // a correção soar como uma série a mais.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, 9);
  await a.esperar();
  assert.match(a.doc.getElementById('serie-dita').textContent, /^Guardei a série 1: /);

  a.preencher(0, 0, 60, null);
  await a.esperar();
  assert.match(a.doc.getElementById('serie-dita').textContent, /^Corrigi a série 1: 60 kg × 9/,
    a.doc.getElementById('serie-dita').textContent);
  a.fechar();
});

test('série incompleta não anuncia nada', async () => {
  // Meia série não é série: anunciar "55 kg, série 1 guardada" com a repetição
  // em branco diria que algo foi registrado quando o registro é a dupla.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, null);
  await a.esperar();
  assert.strictEqual(a.doc.getElementById('serie-dita').textContent, '',
    'nada anunciado: a série não ficou completa');
  a.fechar();
});

