// A escala do sparkline. Nasceu de um defeito visível: com a escala ancorada
// no zero, 14 semanas de peso viravam 14 barras da mesma altura.
import { test } from 'vitest';
import assert from 'node:assert';

/** Mesma conta do componente, para poder testar sem montar DOM. */
function alturas(valores: Array<number | null>, piso = 2): Array<number | null> {
  const cheios = valores.filter(x => x != null) as number[];
  const hi = cheios.length ? Math.max(...cheios) : 1;
  const lo = cheios.length ? Math.min(...cheios) : 0;
  const folga = Math.max(0, piso - (hi - lo)) / 2;
  const topo = hi + folga, base = lo - folga;
  return valores.map(x => x == null ? null : (topo === base ? 60 : 12 + ((x - base) / (topo - base)) * 88));
}

test('variação de peso vira variação visível de altura', () => {
  const a = alturas([70, 70.5, 71, 71.5]) as number[];
  // contra o zero isto dava 97,9% a 100%: um pixel em 48
  assert.ok(a[3] - a[0] > 50, 'a diferença tem que ser legível: ' + JSON.stringify(a));
  assert.ok(a[0] >= 0 && a[3] <= 100, 'sem estourar a caixa: ' + JSON.stringify(a));
  assert.ok(a[0] < a[1] && a[1] < a[2] && a[2] < a[3], 'e monotônica');
});

test('oscilação minúscula não vira tendência', () => {
  // 100 g de retenção de água não pode desenhar uma escalada
  const a = alturas([71.4, 71.5]) as number[];
  assert.ok(a[1] - a[0] < 15, 'o piso segura o drama: ' + JSON.stringify(a));
});

test('semana sem registro não desenha barra', () => {
  const a = alturas([null, 71, null, 72]);
  assert.strictEqual(a[0], null);
  assert.strictEqual(a[2], null);
});

test('um único ponto não quebra a conta', () => {
  const a = alturas([null, 71.5]) as Array<number | null>;
  assert.ok(a[1]! > 0 && a[1]! <= 100, 'altura válida com um ponto só: ' + a[1]);
});

test('série vazia não quebra', () => {
  assert.deepStrictEqual(alturas([null, null]), [null, null]);
});
