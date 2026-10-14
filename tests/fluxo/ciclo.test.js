// Ciclo explícito da sessão: iniciar, pausar, finalizar, pular.
// O botão nunca é pré-condição para gravar série — ele acrescenta precisão
// à duração. Esquecer custa precisão, nunca dado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

test('iniciar marca o tempo antes da primeira série', async () => {
  const a = await app();
  assert.strictEqual(a.texto('.day-ini'), 'iniciar treino', 'o botão fica ao lado da letra do dia');
  assert.strictEqual(a.$('#relogio'), null, 'sem sessão não há relógio');

  await a.v('iniciarSessao');
  await a.esperar();
  assert.ok(a.S().sessao !== null);
  assert.strictEqual(a.S().sessao.manual, 1);
  assert.strictEqual(a.S().done[0].ini, 'manual');
  assert.ok(a.$('#relogio'), 'o relógio toma o lugar do botão');
  assert.match(a.texto('#relogio'), /^\d{2}:\d{2}$/, a.texto('#relogio'));
  assert.match(a.texto('.day-rel em'), /^desde \d{2}:\d{2}$/, 'o rótulo diz desde que horas');
  a.fechar();
});

test('sem iniciar, a primeira série continua abrindo sozinha', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.ok(a.S().sessao !== null);
  assert.strictEqual(a.S().done[0].ini, 'auto');
  a.fechar();
});

test('pausar para o relógio e retomar continua', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  // treinou 20 min e parou há 10: o tempo de treino é 20, não 30
  a.E('S.sessao.inicio = Date.now() - 30*60000');

  await a.v('pausarSessao');
  await a.esperar();
  assert.ok(a.S().sessao.pausadoEm > 0);
  assert.ok(a.$('.day-rel.pausado'), 'o relógio muda de cor e rótulo');
  assert.strictEqual(a.texto('.day-rel em'), 'pausado');

  a.E('S.sessao.pausadoEm = Date.now() - 10*60000');
  const congelado = a.v('duracaoAtual', a.S().sessao);
  assert.ok(Math.abs(congelado - 20 * 60000) < 2000, 'relógio congelado em 20 min, deu ' + congelado);

  await a.v('retomarSessao');
  await a.esperar();
  assert.strictEqual(a.S().sessao.pausadoEm, null);
  assert.strictEqual(a.S().sessao.pausas.length, 1);
  const depois = a.v('duracaoAtual', a.S().sessao);
  assert.ok(Math.abs(depois - 20 * 60000) < 2000, 'a pausa saiu da conta: ' + depois);
  a.fechar();
});

test('digitar estando pausado retoma sozinho', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  await a.v('pausarSessao');
  await a.esperar();

  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.S().sessao.pausadoEm, null, 'digitar é prova de que voltou');
  assert.strictEqual(a.S().sessao.pausas.length, 1);
  a.fechar();
});

test('pausado não morre por inatividade, só na virada do dia', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  await a.v('pausarSessao');
  const estado = a.S();
  estado.sessao.pausadoEm = Date.now() - 6 * 3600 * 1000;   // seis horas pausado
  a.fechar();

  const b = await app({ estado });
  assert.ok(b.S().sessao !== null, 'pausar é intenção declarada');
  b.fechar();
});

test('finalizar grava tempo exato e marca como manual', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  for (let k = 0; k < a.v('setsFor', a.vJ('treino', 'A').ex[0]); k++) a.preencher(0, k, 40, 10);
  a.E('S.sessao.inicio = Date.now() - 62*60000');

  await a.v('finalizarSessao');
  await a.esperar();

  const m = a.S().done[0];
  assert.strictEqual(m.fim, 'manual');
  assert.ok(Math.abs(m.dur - 62 * 60000) < 3000, 'tempo até o toque, não até a última série');
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.texto('.ins-estado-v'), 'B', 'rotação avançou');
  // §7.7 da frente 3: "Encerrei", na voz do app, com o intervalo e a duração
  // MEDIDA — o fecho no toque não leva "aproximada".
  assert.ok(/^Encerrei o Treino A · \d+h\d\d → \d+h\d\d · 1h02 · /.test(a.toast()), a.toast());
  assert.ok(!/aproximada/.test(a.toast()), 'o fecho no toque é medido, não estimado');
  a.fechar();
});

test('encerramento automático fica marcado como aproximado', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const estado = a.S();
  const agora = Date.now();
  estado.sessao.inicio = agora - 6 * 3600 * 1000;
  estado.sessao.ultima = agora - 5 * 3600 * 1000;
  estado.done[0].t = estado.sessao.inicio;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.S().done[0].fim, 'auto');
  assert.strictEqual(b.S().done[0].dur, 3600 * 1000, 'vai até a última série');
  b.v('abrirSessao', estado.done[0].t);
  assert.ok(/aproximado: fechou sem você/.test(b.texto('.ss-tempo')), b.texto('.ss-tempo'));
  assert.ok(b.$('.ss-aprox'), 'com o pontilhado do palpite');
  b.fechar();
});

test('pular é decisão registrada; não feito é ausência derivada', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  for (let k = 0; k < a.v('setsFor', a.vJ('treino', 'A').ex[0]); k++) a.preencher(0, k, 40, 10);
  a.v('toggle', 1);
  a.preencher(1, 0, 60, 12);                 // parcial: 1 de 3
  await a.v('pularEx', 2);
  await a.esperar();

  const sid = a.S().sessao.sid;
  assert.strictEqual(a.v('estadoEx', 'A', 0, sid, a.S().sessao.pulados), 'feito');
  assert.strictEqual(a.v('estadoEx', 'A', 1, sid, a.S().sessao.pulados), 'parcial');
  assert.strictEqual(a.v('estadoEx', 'A', 2, sid, a.S().sessao.pulados), 'pulado');
  assert.strictEqual(a.v('estadoEx', 'A', 3, sid, a.S().sessao.pulados), 'nada');

  assert.deepStrictEqual(a.S().sessao.pulados, [a.k('A',2)], 'só a decisão é gravada');
  assert.strictEqual(a.log('A',2), null, 'pular não cria entrada falsa no histórico');
  a.fechar();
});

test('exercício pulado colapsa e dá para desfazer', async () => {
  const a = await app();
  await a.v('pularEx', 2);
  await a.esperar();
  assert.ok(a.$('.ex.pulado'), 'o cartão fica marcado');
  assert.ok(a.$$('.tag.pulado-t').length === 1);

  await a.v('pularEx', 2);
  await a.esperar();
  assert.strictEqual(a.$('.ex.pulado'), null);
  assert.deepStrictEqual(a.S().sessao.pulados, []);
  a.fechar();
});

test('finalizar com pendência pede confirmação', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  for (let k = 0; k < a.v('setsFor', a.vJ('treino', 'A').ex[0]); k++) a.preencher(0, k, 40, 10);

  await a.v('finalizarSessao');
  await a.esperar();
  const msg = a.registro.confirmou[a.registro.confirmou.length - 1];
  assert.ok(/pendentes/.test(msg), msg);
  assert.ok(/não feitos/.test(msg));
  assert.strictEqual(a.S().sessao, null, 'confirmou, então encerrou');
  a.fechar();
});

test('pulado não entra na contagem de pendências da confirmação', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  for (let k = 0; k < a.v('setsFor', a.vJ('treino', 'A').ex[0]); k++) a.preencher(0, k, 40, 10);
  const total = a.vJ('treino', 'A').ex.length;
  for (let i = 1; i < total; i++) await a.v('pularEx', i);
  await a.esperar();

  await a.v('finalizarSessao');
  await a.esperar();
  const msg = a.registro.confirmou[a.registro.confirmou.length - 1] || '';
  assert.ok(!/pendentes/.test(msg), 'já decidiu; perguntar de novo seria duvidar dele: ' + msg);
  assert.strictEqual(a.S().sessao, null);
  a.fechar();
});

test('finalizar sem nenhuma série oferece descartar', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  await a.esperar();
  assert.strictEqual(a.S().done.length, 1);

  await a.v('finalizarSessao');
  await a.esperar();
  assert.ok(/Descartar/.test(a.registro.confirmou[a.registro.confirmou.length - 1]));
  assert.strictEqual(a.S().done.length, 0, 'não vira dia treinado vazio');
  assert.strictEqual(a.S().sessao, null);
  a.fechar();
});

test('detalhe da sessão mostra o que não foi feito e a pausa', async () => {
  // Pela D (estado 3), o pulado, o parcial e o não feito viram "não feito" na
  // POSIÇÃO de cada série — não é falha nem pendência, então não há bloco à
  // parte com contagem.
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  const n0 = a.v('setsFor', a.vJ('treino', 'A').ex[0]);
  for (let k = 0; k < n0; k++) a.preencher(0, k, 40, 10);
  a.v('toggle', 1);
  a.preencher(1, 0, 60, 12);
  await a.v('pularEx', 2);
  a.E('S.sessao.pausas = [{ de: Date.now() - 600000, ate: Date.now() - 300000 }]');
  const t = a.S().done[0].t;

  await a.v('finalizarSessao');
  await a.esperar();
  a.v('abrirSessao', t);

  const d = a.vJ('ctx.detalheDaSessao');
  const ex = d.exercicios;
  assert.strictEqual(ex[0].series.filter(function (s) { return s.nao; }).length, 0, 'o primeiro, inteiro');
  assert.ok(ex[1].series[0].texto && ex[1].series.slice(1).every(function (s) { return s.nao; }), 'o parcial: uma feita, o resto não feito');
  assert.ok(ex[2].series.every(function (s) { return s.nao; }), 'o pulado: tudo não feito');
  assert.ok(a.$$('.ss-sv.nf').length > 0, 'e a tela diz "não feito"');
  assert.ok(a.texto('.tc-nota').includes('pausa'), a.texto('.tc-nota'));
  assert.ok(/declarad/.test(d.fim.nota) && !/aproximad/.test(d.fim.nota), 'fim exato: ' + d.fim.nota);
  a.fechar();
});

test('dois treinos no mesmo dia agora são possíveis', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.v('finalizarSessao');
  await a.esperar();
  assert.strictEqual(a.texto('.ins-estado-v'), 'B');

  await a.v('iniciarSessao');
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 12);
  await a.v('finalizarSessao');
  await a.esperar();

  assert.strictEqual(a.S().done.length, 2);
  assert.deepStrictEqual(a.S().done.map(function (x) { return x.day; }), ['A', 'B']);
  a.fechar();
});

test('o dia aberto diz qual sessão o app fechou sozinho', async () => {
  // A média de duração do mês saiu com o quadro de tempo e volume (a D: "três
  // leituras do mês, e só estas"; tempo é de Semana). A marca do aproximado
  // ficou, onde a sessão mora: a linha dela no dia aberto diz "fechou sem você".
  const agora = agoraEstavel();
  const done = [], logs = { A0: [] };
  [0, 1].forEach(function (k) {
    const t = agora - k * DIA;
    done.push({ day: 'A', t: t, sid: t, dur: (50 + k * 10) * 60000, fim: k ? 'auto' : 'manual' });
    logs.A0.push({ t: t, sid: t, sets: [[40, 10]] });
  });
  const a = await app({ agora: agora, estado: { logs: logs, done: done } });
  a.aba('dias');
  await a.esperar();

  const detalhe = function (t) {
    a.v('ctx.abreDia', t);
    const x = a.texto('[data-a="dia-sessao"]');
    a.v('ctx.fechaDia');
    return x;
  };
  assert.ok(/fechou sem você/.test(detalhe(agora - DIA)), 'a que o app fechou sozinho diz: ' + detalhe(agora - DIA));
  assert.ok(!/fechou sem você/.test(detalhe(agora)), 'a encerrada por ele, não: ' + detalhe(agora));
  a.fechar();
});

test('o relógio anda sozinho, sem re-render', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.E('S.sessao.inicio = Date.now() - 65*1000');
  a.v('tickRelogio');
  assert.strictEqual(a.texto('#relogio'), '01:05');

  a.E('S.sessao.inicio = Date.now() - 3725*1000');
  a.v('tickRelogio');
  assert.strictEqual(a.texto('#relogio'), '1:02:05', 'passa a mostrar a hora depois de 60 min');
  a.fechar();
});

test('relógio congela na pausa e não anda para trás', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.E('S.sessao.inicio = Date.now() - 30*60000');
  await a.v('pausarSessao');
  a.E('S.sessao.pausadoEm = Date.now() - 10*60000');
  a.v('tickRelogio');
  const antes = a.texto('#relogio');
  a.v('tickRelogio');
  assert.strictEqual(a.texto('#relogio'), antes, 'congelado é congelado');
  assert.strictEqual(antes, '20:00');
  a.fechar();
});

test('o relógio para de ticar fora da aba de hoje', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  assert.ok(a.dado('relogioT') !== null);
  a.aba('semana');
  assert.strictEqual(a.dado('relogioT'), null, 'sem intervalo rodando à toa');
  a.aba('treino');
  assert.ok(a.dado('relogioT') !== null);
  a.fechar();
});
