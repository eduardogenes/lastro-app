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

test('o descanso começa em QUALQUER série, não só na última', async () => {
  // Começava só na última do exercício, e isso deixava sem cronômetro a espera
  // mais frequente da sessão: a que separa a série 1 da 2.
  const a = await app(comHistorico());
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
  await a.esperar();

  a.preencher(0, 0, 60, 8);
  await a.esperar();
  assert.ok(a.E("document.getElementById('timer').classList.contains('on')"),
    'a série 1 de 3 dispara o descanso');
  assert.notStrictEqual(a.texto('#tval'), '0:00', 'e ele está contando');

  a.E('stopTimer()');
  a.preencher(0, 1, 60, 8);
  await a.esperar();
  assert.ok(a.E("document.getElementById('timer').classList.contains('on')"),
    'a série 2 de 3 também');
  a.fechar();
});

test('apagar o campo rearma o disparo daquela série, e só dela', async () => {
  const a = await app(comHistorico());
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
  await a.esperar();

  a.preencher(0, 0, 60, 8);
  await a.esperar();
  a.E('stopTimer()');

  // mexer de novo na MESMA série não redispara
  a.digitar('r0_0', 9);
  await a.esperar();
  assert.ok(!a.E("document.getElementById('timer').classList.contains('on')"),
    'corrigir a repetição não redispara o descanso');

  // esvaziar e completar de novo dispara
  a.digitar('r0_0', '');
  await a.esperar();
  a.digitar('r0_0', 8);
  await a.esperar();
  assert.ok(a.E("document.getElementById('timer').classList.contains('on')"),
    'completar de novo depois de apagar dispara');
  a.fechar();
});

test('tocar na coluna ANTERIOR registra a série inteira', async () => {
  // A coluna já mostrava exatamente o que ia ser digitado. Era um `div` inerte,
  // e os dois números iam para o teclado virtual assim mesmo.
  const a = await app(comHistorico());
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
  await a.esperar();

  const botao = a.$('[data-ex="0"] .setant-b');
  assert.ok(botao, 'a coluna anterior é um botão');
  assert.ok(/repetir a série 1 anterior/.test(botao.getAttribute('aria-label')),
    'e diz o que faz para quem não a enxerga');

  a.clicar(botao);
  await a.esperar();

  assert.strictEqual(a.doc.getElementById('w0_0').value, '60', 'carga preenchida');
  assert.strictEqual(a.doc.getElementById('r0_0').value, '8', 'repetição preenchida');
  const log = a.log('A', 0);
  assert.deepStrictEqual(log[log.length - 1].sets[0], [60, 8], 'a série entrou no histórico');
  assert.ok(a.E("document.getElementById('timer').classList.contains('on')"),
    'e o descanso começou pelo caminho normal');
  a.fechar();
});

test('sem histórico não há o que copiar, e a coluna volta a ser inerte', async () => {
  const a = await app();
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
  await a.esperar();
  assert.ok(!a.$('[data-ex="0"] .setant-b'), 'nada de botão que não faria nada');
  a.fechar();
});

test('todo controle do cartão de exercício tem nome acessível', async () => {
  // Eram seis campos de texto idênticos, sem grandeza e sem número de série:
  // o cartão mais usado do produto, ilegível no VoiceOver.
  const a = await app(comHistorico());
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
  await a.esperar();

  const cartao = a.$('[data-ex="0"]');
  const semNome = Array.from(cartao.querySelectorAll('button,input')).filter(function (el) {
    return !((el.textContent || '').trim() || el.getAttribute('aria-label'));
  });
  assert.deepStrictEqual(
    semNome.map(function (el) { return el.id || el.className; }), [],
    'nenhum controle sem nome'
  );
  assert.strictEqual(
    a.doc.getElementById('w0_0').getAttribute('aria-label'), 'carga da série 1, kg');
  assert.strictEqual(
    a.doc.getElementById('r0_0').getAttribute('aria-label'), 'repetições da série 1');
  a.fechar();
});

test('o descanso sobrevive a fechar e reabrir o app', async () => {
  // O cronômetro já era escrito por instante-alvo para sobreviver à tela
  // apagada; o que faltava era o instante sobreviver ao processo.
  const agora = agoraEstavel(8);
  const a = await app({
    agora: agora,
    chaves: { 'lastro-descanso-v1': { fim: agora + 120000, total: 180 } }
  });
  await a.pronto();
  await a.esperar(60);

  assert.ok(a.E("document.getElementById('timer').classList.contains('on')"),
    'o descanso religou no boot');
  assert.strictEqual(a.texto('#tval'), '2:00', 'com o tempo que faltava, não do zero');
  a.fechar();
});

test('descanso já vencido não ressuscita', async () => {
  const agora = agoraEstavel(8);
  const a = await app({
    agora: agora,
    chaves: { 'lastro-descanso-v1': { fim: agora - 60000, total: 180 } }
  });
  await a.pronto();
  await a.esperar(60);
  assert.ok(!a.E("document.getElementById('timer').classList.contains('on')"),
    'um descanso que acabou ontem não volta à tela');
  a.fechar();
});

test('sair do app descarrega a gravação represada', async () => {
  // `queueSave()` represa 700 ms para não escrever a cada tecla. Fechar o app
  // dentro dessa janela perdia a série recém-digitada.
  const a = await app(comHistorico());
  await a.pronto();
  a.E('iniciarSessao()');
  await a.esperar();
  a.E('toggle(0)');
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
