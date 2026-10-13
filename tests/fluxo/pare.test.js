// O PAINEL DE PARE nas ações que apagam sem volta — decisão 13, §3.3 da frente 3.
//
// Cada frase abre pelo infinitivo do estrago e diz o NÚMERO do que vai embora,
// tirado do dado. Os casos antigos destas ações passam pelo observador do
// harness, que responde o painel, mas não leem a frase; estes leem. E recusar
// ("Deixar como está") não mexe em nada.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

const ultima = a => a.perguntas()[a.perguntas().length - 1] || '';

test('apagar um treino diz quantas séries vão junto, e recusar deixa tudo', async () => {
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    done: [{ day: 'A', t: t, sid: t, dur: 3600000 }],
    logs: { supino: [{ t: t, sid: t, sets: [[60, 8], [60, 7], [60, 6]] }] }
  } });
  a.recusar();
  await a.v('ctx.editaSessao', t);
  assert.strictEqual(ultima(a), 'Apagar este treino tira as 3 séries registradas nele. Isso não tem volta, e vale para os outros aparelhos.');
  assert.strictEqual(a.S().done.length, 1, '"Deixar como está" não apaga o treino');
  assert.strictEqual(a.S().logs.supino.length, 1, 'nem as séries');

  a.aceitar();
  await a.v('ctx.editaSessao', t);
  assert.strictEqual(a.S().done.length, 0, 'o verbo apaga o treino');
  assert.ok(!a.S().logs.supino || a.S().logs.supino.length === 0, 'e as séries dele');
  a.fechar();
});

test('apagar um cardio diz o que sai e de qual placar', async () => {
  const t = Date.now() - DIA;
  const a = await app({ estado: { cardio: [{ t: t, m: 'bike', min: 25, i: 'leve' }] } });
  a.recusar();
  await a.v('ctx.apagaCardio', t);
  assert.strictEqual(ultima(a).indexOf('Apagar 25 min de bike de '), 0, ultima(a));
  assert.ok(/tira ele do placar da semana/.test(ultima(a)));
  assert.strictEqual(a.S().cardio.length, 1, 'recusar deixa o cardio');
  a.fechar();
});

test('apagar todo o histórico conta cada coisa que sai, e diz o que fica', async () => {
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    done: [{ day: 'A', t: t, sid: t, dur: 3600000 }, { day: 'B', t: t + DIA, sid: t + DIA, dur: 3600000 }],
    cardio: [{ t: t, m: 'remo', min: 20, i: 'leve' }],
    body: { peso: [{ t: t, v: 73.8 }, { t: t + DIA, v: 74 }], cintura: [] }
  } });
  a.recusar();
  await a.v('wipe');
  assert.strictEqual(ultima(a),
    'Apagar todo o histórico tira 2 sessões, 2 medidas do corpo e 1 cardio deste aparelho. ' +
    'O programa, o plano alimentar e as fotos de equipamento ficam. ' +
    'Isso não tem volta, e vale para os outros aparelhos.');
  assert.strictEqual(a.S().done.length, 2, 'recusar não apaga nada');
  a.fechar();
});

test('descartar a sessão sem série diz que não há série para perder', async () => {
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.recusar();
  await a.v('finalizarSessao');
  assert.strictEqual(ultima(a).indexOf('Descartar esta sessão apaga o horário de início e a duração.'), 0, ultima(a));
  assert.ok(a.S().sessao, 'recusar deixa a sessão aberta');
  a.fechar();
});

test('tirar um exercício com série registrada hoje diz quantas séries vão junto', async () => {
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('anotaSerie', 0, 0, 0, 60);
  a.v('anotaSerie', 0, 0, 1, 8);
  a.v('anotaSerie', 0, 1, 0, 60);
  a.v('anotaSerie', 0, 1, 1, 7);
  await a.esperar();
  a.recusar();
  await a.v('removerEx', 0);
  assert.strictEqual(ultima(a),
    'Tirar este exercício agora apaga as 2 séries que você registrou nele hoje. O histórico das outras sessões fica.');
  a.fechar();
});
