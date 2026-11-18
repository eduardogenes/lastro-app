// Cardio: obrigação semanal, fácil de esquecer, e que vivia enterrada na
// terceira seção de outra aba.
//
// O nome destes casos dizia "tela de hoje" e o código dizia outra coisa: o
// placar e o registro rápido estavam na aba TREINO, e os casos passavam porque
// o padrão do harness era justamente ela (achado 4 da frente 1). Com a
// reestruturação dos cinco lugares o cardio se repartiu pela posse (§1.7) — o
// dono é o AGORA, porque é onde ele se REGISTRA; a Semana tem o placar como
// leitura; Dias tem a marca no calendário e na faixa. Então os nomes passam a
// falar a verdade pela primeira vez, e os casos montam no lugar que eles dizem.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, inicioDaSemana, DIA } from './harness.js';

// A seção de cardio é do dia de TREINO: no descanso o cardio entra pela folha do
// tipo do dia (a D, `agora-descanso.html`, estado 1). Os casos do placar e do
// registro rápido fixam a cadência, para não dependerem do dia da semana.
const TODO_DIA_TREINO = ['treino','treino','treino','treino','treino','treino','treino'];

test('o cardio do mesmo dia mora no dia, não na sessão', async () => {
  // Saída declarada pela D (`dias.html`, estado 3): a sessão passada abre como
  // foi, e o cardio daquele dia está no dia aberto, ao lado dela — dito como
  // "depois do treino". Repetir na sessão seria o mesmo dado em dois lugares.
  const agora = agoraEstavel();
  const t = agora - 2 * DIA;
  const a = await app({ agora: agora, estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000, fim: 'manual' }],
    cardio: [{ t: t + 3600000, m: 'bike', min: 20, i: 'leve' }]
  } });
  a.v('ctx.abreDia', t);
  await a.esperar();
  assert.ok(/Cardio: bike/.test(a.texto('[data-a="dia-cardio"]')) && /20 min/.test(a.texto('[data-a="dia-cardio"]')), a.texto('[data-a="dia-cardio"]'));
  assert.ok(/leve/.test(a.texto('[data-a="dia-cardio"]')));
  a.v('abrirSessao', t);
  assert.strictEqual(a.$('.cardio-dia'), null, 'e a sessão não o repete');
  a.fechar();
});

// ---------- o cardio esquecido, num dia passado (decisão do dono, 14/10) ----------

test('o cardio esquecido entra pelo dia passado, sem hora, e conta no dia certo', async () => {
  const agora = agoraEstavel(9, 0);
  const tres = agora - 3 * DIA;
  const a = await app({ agora: agora, estado: { logs: {}, done: [], cardio: [] } });
  a.aba('dias');
  a.v('ctx.abreDia', tres);
  await a.esperar();
  // pelo "Pôr o dia em dia": "Fiz cardio"
  a.clicar('[data-a="dia-poe"]');
  await a.esperar();
  a.clicar('[data-a="poe-cardio"]');
  await a.esperar();
  a.clicar('[data-a="dia-cardio-novo-m-remo"]');
  a.clicar('[data-a="dia-cardio-novo-min-30"]');
  a.clicar('[data-a="dia-cardio-novo-i-leve"]');
  a.clicar('[data-a="dia-cardio-grava"]');
  await a.esperar(60);

  const c = a.gravado().cardio;
  assert.strictEqual(c.length, 1, 'gravado');
  assert.deepStrictEqual([c[0].m, c[0].min, c[0].i, c[0].semHora], ['remo', 30, 'leve', 1]);
  const d = new Date(c[0].t), d3 = new Date(tres);
  assert.deepStrictEqual([d.getDate(), d.getHours()], [d3.getDate(), 12], 'no dia escolhido, ao meio-dia');
  assert.strictEqual(a.$('.dia-cardio-novo'), null, 'o formulário fecha');
  const linha = a.texto('[data-a="dia-cardio"]');
  assert.ok(/lançado depois, sem hora/.test(linha) && !/12h00/.test(linha), 'a hora não é inventada: ' + linha);
  a.fechar();
});

test('dois cardios esquecidos no mesmo dia não colidem na chave, e o segundo não cita hora', async () => {
  const agora = agoraEstavel(9, 0);
  const tres = agora - 3 * DIA;
  const a = await app({ agora: agora, estado: { logs: {}, done: [], cardio: [] } });
  a.v('ctx.abreDia', tres);
  for (let i = 0; i < 2; i++) {
    a.v('ctx.abreCardioNoDia');
    await a.v('ctx.gravaCardioNoDia');
    await a.esperar(30);
  }
  const ts = a.gravado().cardio.map(x => x.t);
  assert.strictEqual(new Set(ts).size, 2, 'dois instantes, duas chaves');
  assert.ok(/igual a outro deste dia/.test(a.$$('[data-a="dia-cardio"]')[1].textContent));
  a.fechar();
});

test('hoje e o futuro não ganham o lançamento: hoje é pelo Agora', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ agora: agora, estado: { logs: {}, done: [], cardio: [] } });
  a.v('ctx.abreDia', agora + 2 * DIA);
  await a.esperar();
  a.clicar('[data-a="dia-poe"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="poe-cardio"]'), null, 'o futuro não oferece cardio');
  a.v('ctx.fechaFolha');
  a.v('ctx.abreCardioNoDia');
  await a.v('ctx.gravaCardioNoDia');
  assert.strictEqual(a.S().cardio.length, 0);
  a.fechar();
});
