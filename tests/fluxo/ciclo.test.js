// Ciclo explícito da sessão: iniciar, pausar, finalizar, pular.
// O botão nunca é pré-condição para gravar série — ele acrescenta precisão
// à duração. Esquecer custa precisão, nunca dado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('iniciar marca o tempo antes da primeira série', async () => {
  const a = await app();
  assert.strictEqual(a.texto('.day-ini'), 'iniciar', 'o botão fica ao lado da letra do dia');
  assert.strictEqual(a.$('#relogio'), null, 'sem sessão não há relógio');

  await a.E('iniciarSessao()');
  await a.esperar();
  assert.ok(a.E('S.sessao !== null'));
  assert.strictEqual(a.E('S.sessao.manual'), 1);
  assert.strictEqual(a.E('S.done[0].ini'), 'manual');
  assert.ok(a.$('#relogio'), 'o relógio toma o lugar do botão');
  assert.match(a.texto('#relogio'), /^\d{2}:\d{2}$/, a.texto('#relogio'));
  assert.match(a.texto('.day-rel em'), /^desde \d{2}:\d{2}$/, 'o rótulo diz desde que horas');
  a.fechar();
});

test('sem iniciar, a primeira série continua abrindo sozinha', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  assert.ok(a.E('S.sessao !== null'));
  assert.strictEqual(a.E('S.done[0].ini'), 'auto');
  a.fechar();
});

test('pausar para o relógio e retomar continua', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  // treinou 20 min e parou há 10: o tempo de treino é 20, não 30
  a.E('S.sessao.inicio = Date.now() - 30*60000');

  await a.E('pausarSessao()');
  await a.esperar();
  assert.ok(a.E('S.sessao.pausadoEm > 0'));
  assert.ok(a.$('.day-rel.pausado'), 'o relógio muda de cor e rótulo');
  assert.strictEqual(a.texto('.day-rel em'), 'pausado');

  a.E('S.sessao.pausadoEm = Date.now() - 10*60000');
  const congelado = a.E('duracaoAtual(S.sessao)');
  assert.ok(Math.abs(congelado - 20 * 60000) < 2000, 'relógio congelado em 20 min, deu ' + congelado);

  await a.E('retomarSessao()');
  await a.esperar();
  assert.strictEqual(a.E('S.sessao.pausadoEm'), null);
  assert.strictEqual(a.E('S.sessao.pausas.length'), 1);
  const depois = a.E('duracaoAtual(S.sessao)');
  assert.ok(Math.abs(depois - 20 * 60000) < 2000, 'a pausa saiu da conta: ' + depois);
  a.fechar();
});

test('digitar estando pausado retoma sozinho', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  await a.E('pausarSessao()');
  await a.esperar();

  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.E('S.sessao.pausadoEm'), null, 'digitar é prova de que voltou');
  assert.strictEqual(a.E('S.sessao.pausas.length'), 1);
  a.fechar();
});

test('pausado não morre por inatividade, só na virada do dia', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  await a.E('pausarSessao()');
  const estado = a.J('S');
  estado.sessao.pausadoEm = Date.now() - 6 * 3600 * 1000;   // seis horas pausado
  a.fechar();

  const b = await app({ estado });
  assert.ok(b.E('S.sessao !== null'), 'pausar é intenção declarada');
  b.fechar();
});

test('finalizar grava tempo exato e marca como manual', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  for (let k = 0; k < a.E('setsFor(treino(\'A\').ex[0])'); k++) a.preencher(0, k, 40, 10);
  a.E('S.sessao.inicio = Date.now() - 62*60000');

  await a.E('finalizarSessao()');
  await a.esperar();

  const m = a.J('S.done[0]');
  assert.strictEqual(m.fim, 'manual');
  assert.ok(Math.abs(m.dur - 62 * 60000) < 3000, 'tempo até o toque, não até a última série');
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.texto('.ins-estado-v'), 'B', 'rotação avançou');
  assert.ok(a.toast().includes('encerrado'));
  a.fechar();
});

test('encerramento automático fica marcado como aproximado', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const estado = a.J('S');
  const agora = Date.now();
  estado.sessao.inicio = agora - 6 * 3600 * 1000;
  estado.sessao.ultima = agora - 5 * 3600 * 1000;
  estado.done[0].t = estado.sessao.inicio;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.E('S.done[0].fim'), 'auto');
  assert.strictEqual(b.E('S.done[0].dur'), 3600 * 1000, 'vai até a última série');
  b.E('abrirSessao(' + estado.done[0].t + ')');
  assert.ok(b.texto('.stats span').includes('aproximado'));
  b.fechar();
});

test('pular é decisão registrada; não feito é ausência derivada', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  for (let k = 0; k < a.E('setsFor(treino(\'A\').ex[0])'); k++) a.preencher(0, k, 40, 10);
  a.E('toggle(1)');
  a.preencher(1, 0, 60, 12);                 // parcial: 1 de 3
  await a.E('pularEx(2)');
  await a.esperar();

  const sid = a.E('S.sessao.sid');
  assert.strictEqual(a.E('estadoEx("A",0,' + sid + ',S.sessao.pulados)'), 'feito');
  assert.strictEqual(a.E('estadoEx("A",1,' + sid + ',S.sessao.pulados)'), 'parcial');
  assert.strictEqual(a.E('estadoEx("A",2,' + sid + ',S.sessao.pulados)'), 'pulado');
  assert.strictEqual(a.E('estadoEx("A",3,' + sid + ',S.sessao.pulados)'), 'nada');

  assert.deepStrictEqual(a.J('S.sessao.pulados'), [a.k('A',2)], 'só a decisão é gravada');
  assert.strictEqual(a.log('A',2), null, 'pular não cria entrada falsa no histórico');
  a.fechar();
});

test('exercício pulado colapsa e dá para desfazer', async () => {
  const a = await app();
  await a.E('pularEx(2)');
  await a.esperar();
  assert.ok(a.$('.ex.pulado'), 'o cartão fica marcado');
  assert.ok(a.$$('.tag.pulado-t').length === 1);

  await a.E('pularEx(2)');
  await a.esperar();
  assert.strictEqual(a.$('.ex.pulado'), null);
  assert.deepStrictEqual(a.J('S.sessao.pulados'), []);
  a.fechar();
});

test('finalizar com pendência pede confirmação', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  for (let k = 0; k < a.E('setsFor(treino(\'A\').ex[0])'); k++) a.preencher(0, k, 40, 10);

  await a.E('finalizarSessao()');
  await a.esperar();
  const msg = a.registro.confirmou[a.registro.confirmou.length - 1];
  assert.ok(/pendentes/.test(msg), msg);
  assert.ok(/não feitos/.test(msg));
  assert.strictEqual(a.E('S.sessao'), null, 'confirmou, então encerrou');
  a.fechar();
});

test('pulado não entra na contagem de pendências da confirmação', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  for (let k = 0; k < a.E('setsFor(treino(\'A\').ex[0])'); k++) a.preencher(0, k, 40, 10);
  const total = a.E('treino(\'A\').ex.length');
  for (let i = 1; i < total; i++) await a.E('pularEx(' + i + ')');
  await a.esperar();

  await a.E('finalizarSessao()');
  await a.esperar();
  const msg = a.registro.confirmou[a.registro.confirmou.length - 1] || '';
  assert.ok(!/pendentes/.test(msg), 'já decidiu; perguntar de novo seria duvidar dele: ' + msg);
  assert.strictEqual(a.E('S.sessao'), null);
  a.fechar();
});

test('finalizar sem nenhuma série oferece descartar', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  await a.esperar();
  assert.strictEqual(a.E('S.done.length'), 1);

  await a.E('finalizarSessao()');
  await a.esperar();
  assert.ok(/Descartar/.test(a.registro.confirmou[a.registro.confirmou.length - 1]));
  assert.strictEqual(a.E('S.done.length'), 0, 'não vira dia treinado vazio');
  assert.strictEqual(a.E('S.sessao'), null);
  a.fechar();
});

test('detalhe da sessão mostra pendências e pausa', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  for (let k = 0; k < a.E('setsFor(treino(\'A\').ex[0])'); k++) a.preencher(0, k, 40, 10);
  a.E('toggle(1)');
  a.preencher(1, 0, 60, 12);
  await a.E('pularEx(2)');
  a.E('S.sessao.pausas = [{ de: Date.now() - 600000, ate: Date.now() - 300000 }]');
  const t = a.E('S.done[0].t');

  await a.E('finalizarSessao()');
  await a.esperar();
  a.E('abrirSessao(' + t + ')');

  const pend = a.texto('.pend');
  assert.ok(/1 pulado/.test(pend), pend);
  assert.ok(/1 parcial/.test(pend));
  assert.ok(/não feitos/.test(pend));
  assert.ok(a.texto('.hwrap .cue').includes('pausa'));
  assert.ok(a.texto('.stats span').includes('exato'));
  a.fechar();
});

test('dois treinos no mesmo dia agora são possíveis', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  await a.E('finalizarSessao()');
  await a.esperar();
  assert.strictEqual(a.texto('.ins-estado-v'), 'B');

  await a.E('iniciarSessao()');
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 12);
  await a.E('finalizarSessao()');
  await a.esperar();

  assert.strictEqual(a.E('S.done.length'), 2);
  assert.deepStrictEqual(a.J('S.done.map(function (x) { return x.day; })'), ['A', 'B']);
  a.fechar();
});

test('acompanhamento mostra média de duração e marca o aproximado', async () => {
  const agora = Date.now();
  const done = [], logs = { A0: [] };
  [0, 1].forEach(function (k) {
    const t = agora - k * DIA;
    done.push({ day: 'A', t: t, sid: t, dur: (50 + k * 10) * 60000, fim: k ? 'auto' : 'manual' });
    logs.A0.push({ t: t, sid: t, sets: [[40, 10]] });
  });
  const a = await app({ estado: { logs: logs, done: done } });
  a.E('tab("acomp")');

  const rotulo = a.$$('.stats span')[1].textContent;
  assert.ok(/méd/.test(rotulo), rotulo);
  assert.strictEqual(a.$$('.aprox').length, 1, 'só a que o app fechou sozinho');
  a.fechar();
});

test('o relógio anda sozinho, sem re-render', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('S.sessao.inicio = Date.now() - 65*1000');
  a.E('tickRelogio()');
  assert.strictEqual(a.texto('#relogio'), '01:05');

  a.E('S.sessao.inicio = Date.now() - 3725*1000');
  a.E('tickRelogio()');
  assert.strictEqual(a.texto('#relogio'), '1:02:05', 'passa a mostrar a hora depois de 60 min');
  a.fechar();
});

test('relógio congela na pausa e não anda para trás', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('S.sessao.inicio = Date.now() - 30*60000');
  await a.E('pausarSessao()');
  a.E('S.sessao.pausadoEm = Date.now() - 10*60000');
  a.E('tickRelogio()');
  const antes = a.texto('#relogio');
  a.E('tickRelogio()');
  assert.strictEqual(a.texto('#relogio'), antes, 'congelado é congelado');
  assert.strictEqual(antes, '20:00');
  a.fechar();
});

test('o relógio para de ticar fora da aba de hoje', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  assert.ok(a.E('relogioT !== null'));
  a.E('tab("acomp")');
  assert.strictEqual(a.E('relogioT'), null, 'sem intervalo rodando à toa');
  a.E('tab("treino")');
  assert.ok(a.E('relogioT !== null'));
  a.fechar();
});
