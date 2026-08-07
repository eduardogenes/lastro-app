// Cronômetro de descanso e o que o iOS faz com ele.
// O iOS suspende o JavaScript quando a tela apaga: por isso o cronômetro
// guarda o instante em que o descanso acaba, e não um contador que decrementa.
const { test } = require('node:test');
const assert = require('node:assert');
const { app } = require('./harness');

test('conta a partir do instante-alvo', async () => {
  const a = await app();
  a.E('startTimer(180)');
  assert.strictEqual(a.texto('#tval'), '3:00');

  a.viajar(30000);
  a.E('pintaTimer()');
  assert.strictEqual(a.texto('#tval'), '2:30');
  a.relogioNormal();
  a.fechar();
});

test('sobrevive à tela apagada', async () => {
  const a = await app();
  a.E('startTimer(180)');
  a.viajar(30000);
  a.E('pintaTimer()');

  // o iOS congela os timers: o intervalo para de rodar e o relógio anda
  a.E('clearInterval(timer); timer = null;');
  a.viajar(175000);
  assert.strictEqual(a.texto('#tval'), '2:30', 'a tela fica congelada enquanto suspenso');

  a.doc.dispatchEvent(new a.window.Event('visibilitychange'));
  await a.esperar();
  assert.strictEqual(a.texto('#tval'), '0:05', 'ao desbloquear, pula para o tempo real');
  assert.ok(a.E('timer !== null'), 'o intervalo é religado');
  a.relogioNormal();
  a.fechar();
});

test('avisa uma vez só ao zerar', async () => {
  const a = await app();
  a.E('startTimer(180)');
  a.viajar(181000);
  a.E('pintaTimer()');

  assert.strictEqual(a.texto('#tval'), 'vai');
  assert.strictEqual(a.registro.bipes, 2, 'bipe duplo por Web Audio');
  // Array.from normaliza: o array vem do realm do jsdom
  assert.deepStrictEqual(Array.from(a.vibrou[a.vibrou.length - 1]), [420, 140, 420]);

  const antes = a.registro.bipes;
  a.E('pintaTimer()');
  a.E('pintaTimer()');
  assert.strictEqual(a.registro.bipes, antes, 'não repete o aviso');
  a.relogioNormal();
  a.fechar();
});

test('AudioContext nasce dentro do gesto, exigência do iOS', async () => {
  const a = await app();
  assert.strictEqual(a.E('audioCtx'), null);
  a.E('startTimer(90)');
  assert.ok(a.E('audioCtx !== null'), 'criado no toque, não na hora de tocar');
  a.fechar();
});

test('tela acesa é pedida ao começar a digitar e solta ao encerrar', async () => {
  const a = await app();
  assert.strictEqual(a.registro.wakeLock, 0);

  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  assert.ok(a.E('querSegurar'), 'segura a tela durante o treino');
  assert.ok(a.registro.wakeLock > 0);

  a.E('fechaSessao()');
  a.E('soltarTela()');
  assert.strictEqual(a.E('querSegurar'), false);
  a.fechar();
});

test('descanso automático na última série, e bi-set encadeia em vez de descansar', async () => {
  const a = await app();
  a.E('go("D")');

  // rosca inclinada é o primeiro do par: ao completar, abre o próximo
  a.E('toggle(5)');
  for (let k = 0; k < 3; k++) a.preencher(5, k, 15, 12);
  assert.strictEqual(a.E('view.open'), 6, 'vai direto para o tríceps');
  assert.ok(!a.doc.getElementById('timer').className.includes('on'), 'sem pausa no meio do par');

  // tríceps corda é o segundo: aí sim descansa
  for (let k = 0; k < 3; k++) a.preencher(6, k, 20, 12);
  assert.ok(a.doc.getElementById('timer').className.includes('on'));
  assert.strictEqual(a.texto('#tval'), '1:30');
  a.fechar();
});
