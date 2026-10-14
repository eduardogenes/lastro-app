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

test('placar da semana aparece no AGORA', async () => {
  const a = await app({ aba: 'agora' });
  const linha = a.texto('.cardl');
  assert.ok(/cardio/.test(linha), linha);
  assert.ok(/0 de 2 nesta semana/.test(linha), linha);
  a.fechar();
});

test('registro rápido sem sair do AGORA', async () => {
  const a = await app({ aba: 'agora' });
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
  const a = await app({ aba: 'agora', estado: { logs: {}, done: [],
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
  assert.ok(a.$$('.ins-label').some(function (x) { return x.textContent === 'cardio'; }),
    'o placar do cardio é da semana');

  a.aba('agora');
  await a.esperar();
  assert.ok(/nunca antes do treino/.test(proc(a)),
    'e a regra de quando fazer cardio está onde ele se registra: ' + proc(a));
  a.fechar();
});
