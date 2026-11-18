// Ciclo explícito da sessão: iniciar, pausar, finalizar, pular.
// O botão nunca é pré-condição para gravar série — ele acrescenta precisão
// à duração. Esquecer custa precisão, nunca dado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

test('sem iniciar, a primeira série continua abrindo sozinha', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.ok(a.S().sessao !== null);
  assert.strictEqual(a.S().done[0].ini, 'auto');
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
  assert.strictEqual(a.v('nextDay'), 'B', 'rotação avançou');
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

test('dois treinos no mesmo dia agora são possíveis', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.v('finalizarSessao');
  await a.esperar();
  assert.strictEqual(a.v('nextDay'), 'B');

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
