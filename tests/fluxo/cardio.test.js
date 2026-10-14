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

test('placar da semana aparece no AGORA', async () => {
  const a = await app({ aba: 'agora', estado: { cadencia: TODO_DIA_TREINO } });
  const linha = a.texto('.cardl');
  assert.ok(/Cardio/.test(linha), linha);
  assert.ok(/0 de 2 nesta semana/.test(linha), linha);
  a.fechar();
});

test('registro rápido sem sair do AGORA', async () => {
  const a = await app({ aba: 'agora', estado: { cadencia: TODO_DIA_TREINO } });
  assert.strictEqual(a.$('.cardq'), null, 'fechado por padrão, para não ocupar espaço');

  a.v('abrirCardioRapido');
  assert.ok(a.$('.cardq'), 'abre no lugar');
  assert.ok(a.$$('.cardq .chip').length >= 8, 'modalidade, duração e intensidade');

  a.v('cardioSet', 'm', 'remo');
  a.v('cardioSet', 'min', 30);
  await a.v('addCardio');
  await a.esperar();

  assert.strictEqual(a.S().cardio.length, 1);
  assert.strictEqual(a.S().cardio[0].m, 'remo');
  assert.strictEqual(a.S().cardio[0].min, 30);
  assert.strictEqual(a.$('.cardq'), null, 'fecha depois de registrar');
  assert.ok(a.texto('.cardl').includes('30 min de remo'), a.texto('.cardl'));
  a.fechar();
});

test('feito hoje muda o estado da linha', async () => {
  const a = await app({ aba: 'agora', estado: { logs: {}, done: [], cadencia: TODO_DIA_TREINO,
    cardio: [{ t: Date.now(), m: 'bike', min: 20, i: 'leve' }] } });
  assert.ok(a.$('.cardl').className.includes('feito'));
  assert.ok(a.texto('.cardl').includes('20 min de bike'));
  a.fechar();
});

test('aviso de dia de perna aparece no momento em que importa', async () => {
  const a = await app({ aba: 'agora',
    estado: { logs: {}, done: [{ day: 'B', t: Date.now(), sid: Date.now() }] } });
  a.v('abrirCardioRapido');
  assert.ok(a.texto('.cardq .cwarn').includes('treinou B'), 'sinaliza sem bloquear');
  assert.strictEqual(a.$('.cardq .dbtn[disabled]'), null);
  a.fechar();
});

test('o mês marca os dias com cardio, em DIAS', async () => {
  // A faixa da semana saiu de Dias (a D: o mês já mostra a semana). O cardio é
  // o coração na célula do dia.
  const agora = agoraEstavel();
  const t = agora - 2 * DIA;
  const a = await app({ aba: 'dias', agora: agora, estado: { logs: {}, done: [],
    cardio: [{ t: t, m: 'bike', min: 20, i: 'leve' }] } });

  const cel = function (x) { return a.$('[data-dia="' + a.v('hojeISO', x) + '"]'); };
  assert.ok(cel(t).querySelector('.dc-c'), 'o dia tem cardio');
  assert.strictEqual(cel(t - DIA).querySelector('.dc-c'), null, 'o da véspera, não');
  assert.ok(/cardio/.test(cel(t).getAttribute('aria-label')), 'e o nome acessível diz');
  a.fechar();
});

test('o mês marca cardio sem competir com a letra do treino', async () => {
  const agora = agoraEstavel();
  const hoje = new Date(agora);
  const dia = new Date(hoje.getFullYear(), hoje.getMonth(), 2, 8).getTime();
  const a = await app({ agora: agora, estado: {
    logs: {}, done: [{ day: 'A', t: dia, sid: dia, dur: 50 * 60000 }],
    cardio: [{ t: dia + 3600000, m: 'bike', min: 20, i: 'leve' }]
  } });
  a.aba('dias');

  const cel = a.$('[data-dia="' + a.v('hojeISO', dia) + '"]');
  assert.strictEqual(cel.querySelector('.dc-p').textContent, 'A', 'a letra continua mandando');
  assert.ok(cel.querySelector('.dc-c'), 'e o coração diz que teve cardio');
  a.fechar();
});

test('dia só de cardio fica marcado mesmo sem treino', async () => {
  const agora = agoraEstavel();
  const hoje = new Date(agora);
  const dia = new Date(hoje.getFullYear(), hoje.getMonth(), 3, 8).getTime();
  const a = await app({ agora: agora, estado: { logs: {}, done: [],
    cardio: [{ t: dia, m: 'esteira inclinada', min: 25, i: 'moderado' }] } });
  a.aba('dias');

  const cel = a.$('[data-dia="' + a.v('hojeISO', dia) + '"]');
  assert.ok(cel.querySelector('.dc-c'));
  assert.strictEqual(cel.querySelector('.dc-p'), null, 'não é dia treinado');
  a.fechar();
});

test('o dia mostra o cardio junto do treino, e o mês soma o cardio', async () => {
  const agora = agoraEstavel();
  const hoje = new Date(agora);
  const d1 = new Date(hoje.getFullYear(), hoje.getMonth(), 4, 7).getTime();
  const d2 = new Date(hoje.getFullYear(), hoje.getMonth(), 5, 7).getTime();
  const a = await app({ agora: agora, estado: {
    logs: {}, done: [{ day: 'A', t: d1, sid: d1, dur: 50 * 60000 }],
    cardio: [
      { t: d1 + 3600000, m: 'bike', min: 20, i: 'leve' },
      { t: d2, m: 'remo', min: 30, i: 'leve' }
    ]
  } });
  a.aba('dias');

  const c = a.vJ('ctx.mes').cardio;
  assert.strictEqual(c.n, 2, 'duas sessões de cardio');
  assert.strictEqual(c.min, 50, '50 minutos no mês');
  assert.strictEqual(c.so, 1, 'uma em dia sem musculação');
  const tela = a.$$('.dm-tres').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(/2sessões/.test(tela) && /50 min/.test(tela) && /1em dia sem musculação/.test(tela), tela);

  a.v('ctx.abreDia', d1);
  await a.esperar();
  assert.strictEqual(a.$$('[data-a="dia-sessao"]').length, 1, 'o dia 4 tem o treino');
  assert.ok(/depois do treino/.test(a.texto('[data-a="dia-cardio"]')), 'e o cardio, dito depois do treino');
  a.fechar();
});

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
  assert.ok(/20 min de bike/.test(a.texto('[data-a="dia-cardio"]')), a.texto('[data-a="dia-cardio"]'));
  assert.ok(/leve/.test(a.texto('[data-a="dia-cardio"]')));
  a.v('abrirSessao', t);
  assert.strictEqual(a.$('.cardio-dia'), null, 'e a sessão não o repete');
  a.fechar();
});

test('a divisão do DADOS em três lugares não engoliu regra nenhuma', async () => {
  // Reescrito, e o que ele guarda é o MESMO: a divisão não ENGOLIU nada. O que
  // mudou é a divisão — eram dois modos de uma tela só; agora são três lugares,
  // porque "como está o corpo", "a semana andou para onde" e "o que aconteceu
  // em cada dia" são três perguntas e não duas.
  //
  // Cada regra continua existindo, no lugar a que ela pertence — e a conferência
  // é por PROCEDÊNCIA, que é onde as regras do nutricionista e do treinador
  // moram na tela.
  const proc = a => a.$$('.ins-provenance').map(function (x) { return x.textContent; }).join(' | ');

  const a = await app({ aba: 'corpo' });
  await a.esperar();
  assert.ok(/mesmo ponto, em jejum/.test(proc(a)), 'regra de posicionamento da cintura');
  assert.strictEqual(a.$('.ins-veredito'), null,
    'e o veredito NÃO está aqui: ele responde "dá para mexer na comida?", que é da semana');

  a.aba('semana');
  await a.esperar();
  assert.ok(a.$('.ins-veredito'), 'o veredito é a primeira coisa da SEMANA');
  await a.modo('treino');
  assert.ok(a.$$('.ins-rotulo').some(function (x) { return x.textContent === 'O cardio da semana'; }),
    'o placar do cardio é da semana');

  a.aba('agora');
  await a.esperar();
  assert.ok(/nunca antes do treino/.test(proc(a)),
    'e a regra de quando fazer cardio está onde ele se registra: ' + proc(a));
  a.fechar();
});

test('no descanso não há seção de cardio; ele entra pela folha do tipo do dia', async () => {
  // A D (`agora-descanso.html`, estados 1 e 4): "não há outro cartão, faixa ou
  // convite", e "um cardio leve num domingo é cardio em dia sem musculação, e é
  // aqui que ele entra" — na folha.
  const DESCANSO = ['descanso','descanso','descanso','descanso','descanso','descanso','descanso'];
  const a = await app({ aba: 'agora', estado: { logs: {}, done: [], cardio: [], cadencia: DESCANSO } });
  assert.strictEqual(a.$('.cardl'), null, 'sem seção, sem convite');
  a.clicar('[data-a="tipo-do-dia"]');
  await a.esperar(60);
  a.clicar('[data-a="jafiz-cardio"]');
  await a.esperar(60);
  assert.ok(a.$('.cardq'), '"Já fiz → Cardio" abre o registro no Agora');
  a.clicar('.cardq-b');
  await a.esperar(60);
  assert.strictEqual(a.S().cardio.length, 1, 'e grava');
  assert.strictEqual(a.$('.cardl'), null, 'registrado, a seção volta a sair');
  assert.strictEqual(a.$$('.ag-cardio-hoje li').length, 1,
    'mas o que foi feito hoje fica, para poder desfazer — sem placar nem convite');
  a.fechar();
});

test('o cardio de hoje aparece no Agora e se apaga ali, com a pergunta antes', async () => {
  // Decisão do dono, 14/10: o lançado por engano se desfaz onde foi lançado.
  // Antes, só amanhã, em Dias.
  const agora = agoraEstavel(9, 0);
  const t1 = agora - 2 * 3600000, t2 = agora - 3600000, ontem = agora - 86400000;
  const TREINO = ['treino','treino','treino','treino','treino','treino','treino'];
  const a = await app({ aba: 'agora', agora: agora, estado: { logs: {}, done: [], cadencia: TREINO,
    cardio: [{ t: ontem, m: 'bike', min: 30, i: 'leve' },
             { t: t1, m: 'bike', min: 25, i: 'leve' }, { t: t2, m: 'bike', min: 25, i: 'leve' }] } });
  const linhas = a.$$('.ag-cardio-hoje li').map(li => li.textContent);
  assert.strictEqual(linhas.length, 2, 'só os de hoje: ' + linhas.join(' | '));
  assert.ok(/^7h00 · 25 min de bike, leve/.test(linhas[0]), linhas[0]);

  a.recusar();
  a.clicar('[data-a="cardio-apaga-' + t2 + '"]');
  await a.esperar(60);
  assert.strictEqual(a.S().cardio.length, 3, 'recusar a pergunta não apaga');

  a.aceitar();
  a.clicar('[data-a="cardio-apaga-' + t2 + '"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.gravado().cardio.map(c => c.t).sort(), [ontem, t1].sort(), 'apagou o de 8h, no disco');
  assert.strictEqual(a.$$('.ag-cardio-hoje li').length, 1);
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
  a.clicar('[data-a="dia-cardio-novo"]');
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

test('se o aparelho recusa, o cardio esquecido não fica fingindo que gravou', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ agora: agora, estado: { logs: {}, done: [], cardio: [] } });
  a.v('ctx.abreDia', agora - 3 * DIA);
  a.v('ctx.abreCardioNoDia');
  a.encheCota();
  await a.v('ctx.gravaCardioNoDia');
  await a.esperar(60);
  assert.strictEqual(a.S().cardio.length, 0, 'a memória volta ao que está guardado');
  assert.ok(/não foi gravado/.test(a.texto('.dia-cardio-falhou')));
  assert.ok(a.$('.dia-cardio-novo'), 'e o formulário fica, para tentar de novo');
  a.fechar();
});

test('hoje e o futuro não ganham o lançamento: hoje é pelo Agora', async () => {
  const agora = agoraEstavel(9, 0);
  const a = await app({ agora: agora, estado: { logs: {}, done: [], cardio: [] } });
  a.v('ctx.abreDia', agora + 2 * DIA);
  await a.esperar();
  assert.strictEqual(a.$('[data-a="dia-cardio-novo"]'), null);
  a.v('ctx.abreCardioNoDia');
  await a.v('ctx.gravaCardioNoDia');
  assert.strictEqual(a.S().cardio.length, 0);
  a.fechar();
});
