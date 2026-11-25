// Cronômetro de descanso e o que o iOS faz com ele.
// O iOS suspende o JavaScript quando a tela apaga: por isso o cronômetro
// guarda o instante em que o descanso acaba, e não um contador que decrementa.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** O descanso como a tela do treino em foco o mostra: o que falta, em m:ss, ou null sem descanso. */
function falta(a) {
  const d = a.vJ('ctx.descansoV3');
  if (!d) return null;
  const s = Math.max(0, Math.ceil((d.fim - a.E('Date.now()')) / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

test('conta a partir do instante-alvo', async () => {
  const a = await app();
  a.v('startTimer', 180);
  assert.strictEqual(falta(a), '3:00');

  a.viajar(30000);
  a.v('pintaTimer');
  assert.strictEqual(falta(a), '2:30');
  a.relogioNormal();
  a.fechar();
});

test('sobrevive à tela apagada', async () => {
  const a = await app();
  a.v('startTimer', 180);
  a.viajar(30000);
  a.v('pintaTimer');

  // o iOS congela os timers: o intervalo para de rodar e o relógio anda.
  // Continua na ponte de escopo de propósito: matar o intervalo por fora é
  // simulação de plataforma, e não há verbo do app que faça isso.
  a.E('clearInterval(timer); timer = null;');
  a.viajar(175000);
  assert.strictEqual(falta(a), '0:05', 'o alvo é um instante: ao desbloquear, o que falta é o tempo real');

  a.doc.dispatchEvent(new a.window.Event('visibilitychange'));
  await a.esperar();
  assert.ok(a.dado('timer') !== null, 'o intervalo é religado');
  a.relogioNormal();
  a.fechar();
});

test('avisa uma vez só ao zerar', async () => {
  const a = await app();
  a.v('startTimer', 180);
  a.viajar(181000);
  a.v('pintaTimer');

  assert.strictEqual(falta(a), '0:00');
  assert.strictEqual(a.registro.bipes, 2, 'bipe duplo por Web Audio');
  // Array.from normaliza: o array vem do realm do jsdom
  assert.deepStrictEqual(Array.from(a.vibrou[a.vibrou.length - 1]), [420, 140, 420]);

  const antes = a.registro.bipes;
  a.v('pintaTimer');
  a.v('pintaTimer');
  assert.strictEqual(a.registro.bipes, antes, 'não repete o aviso');
  a.relogioNormal();
  a.fechar();
});

test('AudioContext nasce dentro do gesto, exigência do iOS', async () => {
  // A rede: quem chega ao descanso antes do meio segundo da entrada no modo (ou
  // sem passar por ela) ainda tem o som criado no toque, não na hora de tocar.
  const a = await app();
  assert.strictEqual(a.dado('audioCtx'), null);
  a.v('startTimer', 90);
  assert.ok(a.dado('audioCtx') !== null, 'criado no toque, não na hora de tocar');
  a.fechar();
});

test('o som nasce logo depois de entrar no modo, e o toque da primeira série não o cria', async () => {
  // Peça 2 do motion (docs/motion/04 R8): criar o AudioContext custa 43–55 ms
  // no Chromium e prende a thread ~60 ms no WebKit, e isso caía dentro do toque
  // da primeira série — o mais repetido do produto, no quadro em que o número
  // pousa e o descanso começa. Agora ele nasce meio segundo depois da entrada
  // no modo, fora do quadro dela e dentro da janela de gesto do iPhone.
  const a = await app();                 // `app()` entra no modo
  assert.strictEqual(a.dado('audioCtx'), null, 'não no quadro da entrada');
  await a.esperar(700);
  assert.ok(a.dado('audioCtx'), 'meio segundo depois da entrada, o som já existe');
  a.E('window.__som = audioCtx');

  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);             // a 1ª série: o descanso começa
  assert.ok(a.vJ('ctx.descansoV3'), 'o descanso começou');
  assert.strictEqual(a.E('audioCtx === window.__som'), true, 'o toque da série não criou outro');
  a.fechar();
});

test('tela acesa é pedida ao começar a digitar e solta ao encerrar', async () => {
  const a = await app();
  assert.strictEqual(a.registro.wakeLock, 0);

  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.ok(a.dado('querSegurar'), 'segura a tela durante o treino');
  assert.ok(a.registro.wakeLock > 0);

  a.v('fechaSessao');
  a.v('soltarTela');
  assert.strictEqual(a.dado('querSegurar'), false);
  a.fechar();
});

test('descanso automático na última série usa o tempo do exercício', async () => {
  const a = await app();
  a.v('go', 'B');

  // agachamento no Smith: grande composto, 3 min
  a.v('toggle', 0);
  const n = a.v('setsFor', a.vJ('treino', 'B').ex[0]);
  for (let k = 0; k < n; k++) a.preencher(0, k, 100, 8);
  assert.ok(a.vJ('ctx.descansoV3'), 'o descanso começou');
  assert.strictEqual(falta(a), '3:00');

  // adutora: isolador, 1:45, e não os 3 min genéricos de antes
  a.v('stopTimer');
  a.v('toggle', 6);
  for (let k = 0; k < 2; k++) a.preencher(6, k, 60, 12);
  assert.strictEqual(falta(a), '1:45');
  a.fechar();
});

test('cada categoria de exercício declara seu descanso', async () => {
  const a = await app();
  const faltando = a.vJ('rot').reduce(function (acc, d) {
    a.vJ('treino', d).ex.forEach(function (ex) {
      const desc = a.v('descOf', ex);
      if (![180,150,120,105,90].includes(desc)) acc.push(d + ' ' + ex.n + ' ' + desc);
    });
    return acc;
  }, []);
  assert.deepStrictEqual(faltando, [], 'descanso fora das categorias do treinador');
  // exercício sem 'd' (dado antigo, substituto) cai na regra genérica
  assert.strictEqual(a.v('descOf', { c: 1 }), 180);
  assert.strictEqual(a.v('descOf', { c: 0 }), 90);
  a.fechar();
});

test('bi-set encadeia em vez de descansar', async () => {
  // O programa atual não usa bi-set, mas o encadeamento continua sustentado:
  // é o par declarado no programa que decide, não o dia.
  const a = await app();
  a.v('go', 'E');
  // escrita no estado: cirurgia de fixture, que a superfície não cobre
  a.E('S.prog.E.ex[4].bi = 1; S.prog.E.ex[5].bi = 2;');
  a.v('render');

  // O PAR É UM CIRCUITO (dominio/biset.ts): estação 1 → estação 2 → descanso
  // do par → volta. Antes eram todas as séries do primeiro e depois todas do
  // segundo, sem nunca alternar.
  a.v('toggle', 4);
  a.v('ctx.setFocoV3', 4, 0);
  a.v('ctx.fazSerieV3', 15, 12);
  assert.strictEqual(a.vJ('ctx.descansoV3'), null, 'sem pausa no meio da rodada');
  assert.strictEqual(a.vJ('ctx.focoV3').i, 5, 'a série em foco é a da estação 2, rodada 1');
  assert.ok(a.vJ('ctx.focoV3').par, 'a tela é a do par');

  a.v('ctx.fazSerieV3', 20, 12);
  const d = a.vJ('ctx.descansoV3');
  assert.ok(d, 'a rodada fechou: descanso do par');
  assert.match(d.rotulo, /par 1/, 'o descanso é o do par');
  a.v('stopTimer');
  assert.strictEqual(a.vJ('ctx.focoV3').i, 4, 'volta para a estação 1, rodada 2');
  assert.strictEqual(a.vJ('ctx.focoV3').k, 1);
  a.fechar();
});

test('esticar e encurtar o descanso mexe no instante-alvo', async () => {
  // A academia cobra os dois: máquina ocupada e o descanso estica; série leve e
  // não vale esperar os três minutos. Sem isto a única saída era parar o
  // cronômetro e perder a conta.
  const a = await app();
  a.v('startTimer', 180);
  assert.strictEqual(falta(a), '3:00');

  a.v('ajustaTimer', 15);
  assert.strictEqual(falta(a), '3:15', '+15 estica');

  a.v('ajustaTimer', -30);
  assert.strictEqual(falta(a), '2:45', '−15 encurta');

  // A tela enche a cor por `restante / total`. Sem subir o total junto ao
  // esticar, a proporção passaria de 1.
  a.v('startTimer', 60);
  a.v('ajustaTimer', 120);
  const d = a.vJ('ctx.descansoV3');
  const proporcao = (d.fim - a.E('Date.now()')) / d.total;
  assert.ok(proporcao <= 1.001, 'a proporção não passa de 1 ao esticar: ' + proporcao);

  a.relogioNormal();
  a.fechar();
});

test('encurtar abaixo de zero para o descanso em vez de deixá-lo negativo', async () => {
  const a = await app();
  a.v('startTimer', 10);
  a.v('ajustaTimer', -15);
  assert.strictEqual(a.vJ('ctx.descansoV3'), null, 'o descanso acaba em vez de contar para trás');
  a.relogioNormal();
  a.fechar();
});

test('o cronômetro diz de onde veio o descanso', async () => {
  // Sem procedência o número flutua sem assunto depois de rolar a tela ou
  // reabrir o app.
  const a = await app();
  a.v('startTimer', 180, 'descanso · série 2 · Pulldown');
  assert.strictEqual(a.vJ('ctx.descansoV3').rotulo, 'descanso · série 2 · Pulldown');

  a.v('stopTimer');
  assert.strictEqual(a.vJ('ctx.descansoV3'), null, 'e o rótulo sai junto com o descanso');
  a.relogioNormal();
  a.fechar();
});

