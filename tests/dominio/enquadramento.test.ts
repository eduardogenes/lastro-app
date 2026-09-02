// O enquadramento ajustado: giro fino e recorte.
//
// A conta que mais importa aqui é o zoom mínimo. Se ela errar para baixo, o
// quadro abre borda vazia num canto e a foto fica com um triângulo de fundo —
// visível, feio e fácil de notar. Se errar para cima, come foto sem motivo, o
// que ninguém percebe e todo mundo paga.
import { test } from 'vitest';
import assert from 'node:assert';
import {
  ASPECTO, GIRO_MAX, IDENTIDADE, ZOOM_MAX,
  arrasta, ehIdentidade, folga, normaliza, transform, zoomMinimo
} from '../../src/dominio/enquadramento';

test('sem giro, o zoom mínimo é 1: a foto já cobre o quadro', () => {
  assert.strictEqual(zoomMinimo(0), 1);
});

test('girar obriga a aproximar, e o preço cresce com o ângulo', () => {
  const um = zoomMinimo(1), tres = zoomMinimo(3), seis = zoomMinimo(6);
  assert.ok(um > 1 && tres > um && seis > tres, [um, tres, seis].join(' < '));
  // 6° num quadro 3:4 custa treze por cento do lado
  assert.ok(Math.abs(seis - 1.13) < 0.01, 'a 6° o mínimo é ~1,13: ' + seis);
});

test('o sinal do giro não muda o preço', () => {
  assert.strictEqual(zoomMinimo(4), zoomMinimo(-4));
});

test('no zoom mínimo não sobra folga para arrastar', () => {
  // é o que tem que acontecer: naquele ponto a foto girada mal cobre o quadro
  const r = 5;
  const f = folga(r, zoomMinimo(r));
  assert.ok(Math.abs(f.bx - 0.5) < 0.002, 'sem folga no eixo apertado: ' + f.bx);
});

test('aproximar mais abre folga para arrastar', () => {
  const apertado = folga(0, 1), solto = folga(0, 1.5);
  assert.ok(solto.bx < apertado.bx, 'com zoom, a meia-folga encolhe e o centro anda');
  assert.ok(solto.bx > 0 && solto.bx < 0.5);
});

// ---------- normalizar ----------

test('o giro é limitado, e o limite é baixo de propósito', () => {
  assert.strictEqual(normaliza({ r: 90 }).r, GIRO_MAX);
  assert.strictEqual(normaliza({ r: -90 }).r, -GIRO_MAX);
});

test('o zoom nunca desce abaixo do que o giro exige', () => {
  // pedir 1 com 5° de giro abriria borda vazia; a normalização sobe sozinha
  const a = normaliza({ r: 5, z: 1 });
  assert.ok(a.z >= zoomMinimo(5) - 1e-9, 'subiu para o mínimo: ' + a.z);
});

test('o zoom tem teto: além disso não é recorte, é outra foto', () => {
  assert.strictEqual(normaliza({ z: 99 }).z, ZOOM_MAX);
});

test('o centro é preso dentro da foto, nunca fora dela', () => {
  const a = normaliza({ z: 1.5, cx: 5, cy: -5 });
  const f = folga(0, 1.5);
  assert.ok(Math.abs(a.cx - (1 - f.bx)) < 1e-9, 'grudou na borda direita: ' + a.cx);
  assert.ok(Math.abs(a.cy - f.by) < 1e-9, 'e na de cima: ' + a.cy);
});

test('lixo não vira erro, vira o ajuste possível mais próximo', () => {
  // vem do outro aparelho, de um backup antigo, de um bug: a tela nunca tem
  // que decidir o que fazer com isso. Note que NaN e Infinity caem no PADRÃO,
  // não no teto: número que não é número não diz "o máximo", diz nada.
  const a = normaliza({ r: NaN, z: Infinity, cx: undefined, cy: 'x' } as never);
  assert.deepStrictEqual(a, IDENTIDADE);
});

test('número grande de verdade grude no teto, esse sim', () => {
  assert.strictEqual(normaliza({ z: 99 }).z, ZOOM_MAX);
  assert.strictEqual(normaliza({ r: 99 }).r, GIRO_MAX);
});

test('null e undefined dão a identidade', () => {
  assert.deepStrictEqual(normaliza(null), IDENTIDADE);
  assert.deepStrictEqual(normaliza(undefined), IDENTIDADE);
});

test('normalizar é idempotente', () => {
  const uma = normaliza({ r: 4.4, z: 1.02, cx: 0.9, cy: 0.1, m: 7 });
  assert.deepStrictEqual(normaliza(uma), uma);
});

// ---------- identidade ----------

test('a foto como saiu é identidade, e não se grava', () => {
  assert.strictEqual(ehIdentidade(null), true);
  assert.strictEqual(ehIdentidade(IDENTIDADE), true);
  assert.strictEqual(ehIdentidade({ r: 0, z: 1, cx: 0.5, cy: 0.5, m: 123 }), true,
    'o carimbo sozinho não é ajuste');
});

test('qualquer um dos três a quebra', () => {
  assert.strictEqual(ehIdentidade({ r: 1, z: 1, cx: 0.5, cy: 0.5, m: 0 }), false);
  assert.strictEqual(ehIdentidade({ r: 0, z: 1.2, cx: 0.5, cy: 0.5, m: 0 }), false);
  assert.strictEqual(ehIdentidade({ r: 0, z: 1.2, cx: 0.4, cy: 0.5, m: 0 }), false);
});

// ---------- o transform ----------

test('sem ajuste, o transform só centraliza', () => {
  const t = transform(null);
  assert.ok(t.startsWith('translate(-50%,-50%)'), t);
  assert.ok(/rotate\(0\.000deg\)/.test(t), t);
  assert.ok(/scale\(1\.0000\)/.test(t), t);
  assert.ok(/translate\(0\.0000%,0\.0000%\)/.test(t), t);
});

test('a ordem é centralizar depois de girar em volta do recorte', () => {
  // lida da direita para a esquerda: leva (cx,cy) ao centro do elemento,
  // aproxima e gira em volta DELE, e só então centraliza no quadro. Trocar a
  // ordem giraria em volta do canto.
  const t = transform({ r: 2, z: 1.5, cx: 0.25, cy: 0.75, m: 0 });
  const ordem = t.match(/translate|rotate|scale/g);
  assert.deepStrictEqual(ordem, ['translate', 'rotate', 'scale', 'translate']);
});

test('o deslocamento é o quanto o centro do recorte saiu do meio', () => {
  const t = transform({ r: 0, z: 1.5, cx: 0.4, cy: 0.6, m: 0 });
  assert.ok(/translate\(10\.0000%,-10\.0000%\)$/.test(t), t);
});

// ---------- arrastar ----------

test('arrastar para a direita move a foto para a direita', () => {
  // o recorte anda para a ESQUERDA, que é a mesma coisa vista do outro lado
  const a = arrasta(normaliza({ z: 1.5 }), 0.1, 0);
  assert.ok(a.cx < 0.5, 'o centro do recorte recuou: ' + a.cx);
});

test('quanto mais perto, menos foto o mesmo dedo atravessa', () => {
  const perto = arrasta(normaliza({ z: 2 }), 0.1, 0);
  const longe = arrasta(normaliza({ z: 1.2 }), 0.1, 0);
  assert.ok(Math.abs(0.5 - perto.cx) < Math.abs(0.5 - longe.cx),
    'o zoom divide o passo: ' + perto.cx + ' vs ' + longe.cx);
});

test('arrastar não escapa da foto por mais que se insista', () => {
  let a = normaliza({ z: 1.2 });
  for (let i = 0; i < 50; i++) a = arrasta(a, 0.5, 0.5);
  const f = folga(0, 1.2);
  assert.ok(a.cx >= f.bx - 1e-9 && a.cx <= 1 - f.bx + 1e-9, 'preso na borda: ' + a.cx);
  assert.ok(a.cy >= f.by - 1e-9 && a.cy <= 1 - f.by + 1e-9, 'preso na borda: ' + a.cy);
});

test('arrastar preserva giro e carimbo', () => {
  const a = arrasta(normaliza({ r: 3, z: 1.5, m: 42 }), 0.05, 0.05);
  assert.strictEqual(a.r, 3);
  assert.strictEqual(a.m, 42);
});

// ---------- o quadro ----------

test('o quadro é 3:4, que é o que as fotos do protocolo já são', () => {
  assert.strictEqual(ASPECTO, 0.75);
});
