// O PAINEL DE PARE nas ações que apagam sem volta — decisão 13, §3.3 da frente 3.
//
// Cada frase abre pelo infinitivo do estrago e diz o NÚMERO do que vai embora,
// tirado do dado. Os casos antigos destas ações passam pelo observador do
// harness, que responde o painel, mas não leem a frase; estes leem. E recusar
// ("Deixar como está") não mexe em nada.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, agoraEstavel } from './harness.js';

const ultima = a => a.perguntas()[a.perguntas().length - 1] || '';

test('apagar um treino diz quantas séries vão junto, e recusar deixa tudo', async () => {
  const t = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    done: [{ day: 'A', t: t, sid: t, dur: 3600000 }],
    logs: { supino: [{ t: t, sid: t, sets: [[60, 8], [60, 7], [60, 6]] }] }
  } });
  a.recusar();
  await a.v('ctx.editaSessao', t);
  assert.ok(/^Apagar o Treino A de [a-zçá]+, \d\d\/\d\d tira 1 sessão, aberta às \d+h\d\d, com 3 séries\. /.test(ultima(a)), ultima(a));
  assert.ok(/A sequência volta um passo: não sobra treino registrado, e o próximo volta a ser o primeiro\./.test(ultima(a)), ultima(a));
  assert.ok(/ Isso não tem volta, e vale para os outros aparelhos\.$/.test(ultima(a)));
  assert.strictEqual(a.S().done.length, 1, '"Deixar como está" não apaga o treino');
  assert.strictEqual(a.S().logs.supino.length, 1, 'nem as séries');

  a.aceitar();
  await a.v('ctx.editaSessao', t);
  assert.strictEqual(a.S().done.length, 0, 'o verbo apaga o treino');
  assert.ok(!a.S().logs.supino || a.S().logs.supino.length === 0, 'e as séries dele');
  a.fechar();
});

test('apagar um cardio diz o que sai, o que fica e o efeito no mês', async () => {
  // O painel do desenho (a D, `dias.html`, estado 12).
  const agora = agoraEstavel();
  const t = agora - DIA;
  const mes = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][new Date(t).getMonth()];
  const a = await app({ agora: agora, estado: { cardio: [
    { t: t, m: 'bike', min: 25, i: 'leve' }, { t: t + 600000, m: 'bike', min: 25, i: 'leve' }
  ] } });
  a.recusar();
  await a.v('ctx.apagaCardio', t + 600000);
  assert.ok(/^Apagar o cardio de [a-zá]+ \d\d\/\d\d tira 1 sessão de cardio: 25 min de bike, leve\./.test(ultima(a)), ultima(a));
  assert.ok(/ Fica o cardio das \d+h\d\d, igual a este\./.test(ultima(a)), 'o que fica, e que é igual: ' + ultima(a));
  assert.ok(ultima(a).includes(' O cardio de ' + mes + ' passa de 2 para 1 sessão e de 50 para 25 min.'), ultima(a));
  assert.strictEqual(a.S().cardio.length, 2, 'recusar deixa o cardio');
  a.fechar();
});

test('apagar a sessão aberta por engano diz o que fica e que a sequência não muda', async () => {
  // O caso do estado 13: abriu o E por engano às 6h12 e o D, o certo, às 6h14;
  // o último registrado é o B de hoje.
  const agora = agoraEstavel(9, 0);
  const d = new Date(agora - 2 * DIA); d.setHours(6, 12, 0, 0);
  const tE = d.getTime(), tD = tE + 2 * 60000, tB = agora - 3600000;
  const a = await app({ agora: agora, estado: { plano: 6,
    done: [{ day: 'E', t: tE, sid: tE, dur: 60000, fim: 'manual' }, { day: 'D', t: tD, sid: tD, dur: 3600000, fim: 'manual' },
           { day: 'B', t: tB, sid: tB, dur: 3000000, fim: 'manual' }],
    logs: { supino: [{ t: tD, sid: tD, sets: [[60, 8], [60, 7]] }] }
  } });
  a.recusar();
  await a.v('ctx.editaSessao', tE);
  const f = ultima(a);
  assert.ok(/^Apagar o Treino E de [a-zçá]+, \d\d\/\d\d tira 1 sessão, aberta às 6h12, com 0 séries\./.test(f), f);
  assert.ok(f.includes(' Fica o Treino D das 6h14, com 2 séries.'), 'o que fica, com o número: ' + f);
  assert.ok(f.includes(' A sequência não muda: o último registrado continua sendo o Treino B de hoje.'), f);
  assert.strictEqual(a.S().done.length, 3, 'recusar não apaga');
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
