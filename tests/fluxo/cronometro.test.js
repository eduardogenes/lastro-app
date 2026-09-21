// Cronômetro de descanso e o que o iOS faz com ele.
// O iOS suspende o JavaScript quando a tela apaga: por isso o cronômetro
// guarda o instante em que o descanso acaba, e não um contador que decrementa.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

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
  a.E('go("B")');

  // agachamento no Smith: grande composto, 3 min
  a.E('toggle(0)');
  const n = a.E('setsFor(treino("B").ex[0])');
  for (let k = 0; k < n; k++) a.preencher(0, k, 100, 8);
  assert.ok(a.doc.getElementById('timer').className.includes('on'));
  assert.strictEqual(a.texto('#tval'), '3:00');

  // adutora: isolador, 1:45, e não os 3 min genéricos de antes
  a.E('stopTimer()');
  a.E('toggle(6)');
  for (let k = 0; k < 2; k++) a.preencher(6, k, 60, 12);
  assert.strictEqual(a.texto('#tval'), '1:45');
  a.fechar();
});

test('cada categoria de exercício declara seu descanso', async () => {
  const a = await app();
  const faltando = a.J(`
    rot().reduce(function (acc, d) {
      treino(d).ex.forEach(function (ex) {
        if (![180,150,120,105,90].includes(descOf(ex))) acc.push(d + ' ' + ex.n + ' ' + descOf(ex));
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
  a.E('go("E")');
  a.E('S.prog.E.ex[4].bi = 1; S.prog.E.ex[5].bi = 2; render()');

  a.E('toggle(4)');
  for (let k = 0; k < 2; k++) a.preencher(4, k, 15, 12);
  assert.strictEqual(a.E('view.open'), 5, 'vai direto para o próximo do par');
  assert.ok(!a.doc.getElementById('timer').className.includes('on'), 'sem pausa no meio do par');

  for (let k = 0; k < 2; k++) a.preencher(5, k, 20, 12);
  assert.ok(a.doc.getElementById('timer').className.includes('on'), 'o descanso é no segundo');
  a.fechar();
});

test('esticar e encurtar o descanso mexe no instante-alvo', async () => {
  // A academia cobra os dois: máquina ocupada e o descanso estica; série leve e
  // não vale esperar os três minutos. Sem isto a única saída era parar o
  // cronômetro e perder a conta.
  const a = await app();
  a.E('startTimer(180)');
  assert.strictEqual(a.texto('#tval'), '3:00');

  a.E('ajustaTimer(15)');
  assert.strictEqual(a.texto('#tval'), '3:15', '+15 estica');

  a.E('ajustaTimer(-30)');
  assert.strictEqual(a.texto('#tval'), '2:45', '−15 encurta');

  // A barra é `restante / total`. Sem subir o total junto ao esticar, a escala
  // passaria de 1 e o preenchimento vazaria da calha.
  a.E('startTimer(60)');
  a.E('ajustaTimer(120)');
  const escala = parseFloat(a.E("document.getElementById('tfill').style.transform.match(/[\\d.]+/)[0]"));
  assert.ok(escala <= 1.001, 'a barra não vaza da calha ao esticar: ' + escala);

  a.relogioNormal();
  a.fechar();
});

test('encurtar abaixo de zero para o descanso em vez de deixá-lo negativo', async () => {
  const a = await app();
  a.E('startTimer(10)');
  a.E('ajustaTimer(-15)');
  assert.ok(!a.E("document.getElementById('timer').classList.contains('on')"),
    'o cronômetro some em vez de contar para trás');
  a.relogioNormal();
  a.fechar();
});

test('o cronômetro diz de onde veio o descanso', async () => {
  // Sem procedência o número flutua sem assunto depois de rolar a tela ou
  // reabrir o app.
  const a = await app();
  a.E("startTimer(180, 'descanso · série 2 · Pulldown')");
  assert.strictEqual(a.texto('#tctx'), 'descanso · série 2 · Pulldown');

  a.E('stopTimer()');
  assert.strictEqual(a.texto('#tctx'), '', 'e o rótulo sai junto com o descanso');
  a.relogioNormal();
  a.fechar();
});

test('o cronômetro publica a própria altura para quem se empilha nele', async () => {
  // Duas coisas do rodapé dependem disso, e as duas quebravam sem ele: o toast
  // nascia INTEIRO atrás do cronômetro (e some, porque o cronômetro tem z-index
  // maior), e o último elemento da página ficava 52px atrás dele — no fim da
  // rolagem, sem como trazer à vista.
  //
  // Geometria não dá para cobrar no jsdom, que não faz layout. O que se cobra
  // aqui é o CONTRATO de que os dois lados dependem: a medida publicada na raiz.
  const a = await app();
  const medida = () => a.doc.documentElement.style.getPropertyValue('--ins-timer-h');

  a.E("startTimer(180, 'descanso · série 2 · Pulldown')");
  assert.notStrictEqual(medida(), '', 'entrou em descanso: a altura foi publicada');
  assert.match(medida(), /^\d+px$/, 'e é uma medida em px: ' + medida());

  a.E('stopTimer()');
  assert.strictEqual(medida(), '0px', 'saiu do descanso: volta a zero, sem espaço morto');

  a.relogioNormal();
  a.fechar();
});
