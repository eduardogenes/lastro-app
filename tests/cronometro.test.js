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

test('descanso automático na última série usa o tempo do exercício', async () => {
  const a = await app();
  a.E('go("C")');

  // pendulum squat: grande composto, 3 min
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 100, 8);
  assert.ok(a.doc.getElementById('timer').className.includes('on'));
  assert.strictEqual(a.texto('#tval'), '3:00');

  // panturrilha em pé: 90 s, e não os 3 min genéricos de antes
  a.E('stopTimer()');
  a.E('toggle(4)');
  for (let k = 0; k < 3; k++) a.preencher(4, k, 60, 10);
  assert.strictEqual(a.texto('#tval'), '1:30');
  a.fechar();
});

test('cada categoria de exercício declara seu descanso', async () => {
  const a = await app();
  const faltando = a.J(`
    rot().reduce(function (acc, d) {
      treino(d).ex.forEach(function (ex) {
        if (![180,150,105,90].includes(descOf(ex))) acc.push(d + ' ' + ex.n + ' ' + descOf(ex));
      });
      return acc;
    }, [])`);
  assert.deepStrictEqual(faltando, [], 'descanso fora das categorias do treinador');
  // exercício sem 'd' (dado antigo, substituto) cai na regra genérica
  assert.strictEqual(a.E('descOf({ c: 1 })'), 180);
  assert.strictEqual(a.E('descOf({ c: 0 })'), 90);
  a.fechar();
});

test('bi-set encadeia em vez de descansar', async () => {
  // O programa atual não usa bi-set, mas o encadeamento continua sustentado:
  // é o par declarado no programa que decide, não o dia.
  const a = await app();
  a.E('go("D")');
  a.E('S.prog.D.ex[4].bi = 1; S.prog.D.ex[5].bi = 2; render()');

  a.E('toggle(4)');
  for (let k = 0; k < 2; k++) a.preencher(4, k, 15, 12);
  assert.strictEqual(a.E('view.open'), 5, 'vai direto para o próximo do par');
  assert.ok(!a.doc.getElementById('timer').className.includes('on'), 'sem pausa no meio do par');

  for (let k = 0; k < 2; k++) a.preencher(5, k, 20, 12);
  assert.ok(a.doc.getElementById('timer').className.includes('on'), 'o descanso é no segundo');
  a.fechar();
});
