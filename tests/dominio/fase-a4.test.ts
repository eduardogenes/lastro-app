// Fase A4 (24/11/2026), achados do primeiro teste do MCP:
// - a barra fixa livre entra no catálogo; o apelido que levava "Barra fixa" à
//   assistida é apagado (com lápide que vem do dado e atravessa a fusão);
// - a referência de carga ignora as entradas antigas com carga 0 do "como o prescrito".
import { test } from 'vitest';
import assert from 'node:assert';
import { SEMENTE, exerciciosDoSistema, indiceDeNomes } from '../../src/dominio/catalogo';
import { montaCatalogo } from '../../src/dominio/programa';
import { casaNomes, lerRevisao } from '../../src/dominio/revisao';
import { corrigeApelidosErrados } from '../../src/dominio/migracoes';
import { historicoDeReferencia } from '../../src/dominio/progressao';
import { funde } from '../../src/dominio/sincronia';
import { funde as funde13 } from './fixtures/sincronia-build13';
import type { Estado, Log } from '../../src/dominio/tipos';

const TEXTO = 'Treino SA · Torso A\n- Barra fixa · 4 x 6-10 · RIR 1 · 2:30 · dorsal · carga: corpo\n';

function catalogo() {
  const cat = montaCatalogo({} as Estado['ex'], exerciciosDoSistema(SEMENTE));
  const c: Record<string, { n: string; g?: string; arq?: 1 }> = {};
  Object.keys(cat).forEach(function (k) { c[k] = { n: cat[k].n, g: cat[k].g, arq: cat[k].arq }; });
  return c;
}

test('a barra fixa livre está no catálogo, peso do corpo, e não é a assistida', () => {
  const b = SEMENTE.ex['barra-fixa'];
  assert.ok(b, 'barra-fixa existe');
  assert.strictEqual(b.car, 'corpo');
  assert.ok(b.equiv.indexOf('barra-fixa-assistida-pegada-neutra') >= 0);
  assert.ok(SEMENTE.ex['barra-fixa-assistida-pegada-neutra'], 'a assistida continua');
});

test('"Barra fixa" casa com a barra fixa livre, sem perguntar', () => {
  const casa = casaNomes(lerRevisao(TEXTO), catalogo(), {}, { alt: indiceDeNomes(SEMENTE) });
  assert.deepStrictEqual(casa['Barra fixa'], { k: 'igual', id: 'barra-fixa' });
});

test('com o apelido velho "Barra fixa" → assistida, a migração apaga e a próxima leitura acerta', () => {
  const S = { apelidos: { 'barra-fixa': { id: 'barra-fixa-assistida-pegada-neutra', m: 500 }, 'outro': { id: 'x', m: 1 } }, apagados: {} } as unknown as Estado;
  const antes = casaNomes(lerRevisao(TEXTO), catalogo(), {}, { alt: indiceDeNomes(SEMENTE), apelidos: { 'barra-fixa': 'barra-fixa-assistida-pegada-neutra' } });
  assert.strictEqual(antes['Barra fixa'].id, 'barra-fixa-assistida-pegada-neutra', 'o apelido velho vence (é o bug)');
  assert.strictEqual(corrigeApelidosErrados(S), 1);
  const ap = (S as unknown as { apelidos: Record<string, unknown> }).apelidos;
  assert.strictEqual(ap['barra-fixa'], undefined);
  assert.ok(ap['outro'], 'os outros apelidos ficam');
  assert.strictEqual((S as unknown as { apagados: Record<string, number> }).apagados['apelido:barra-fixa'], 501, 'lápide do dado, não do relógio');
  assert.strictEqual(corrigeApelidosErrados(S), 0, 'idempotente');
});

test('o apelido apontando para outro id não é tocado', () => {
  const S = { apelidos: { 'barra-fixa': { id: 'barra-fixa', m: 9 } }, apagados: {} } as unknown as Estado;
  assert.strictEqual(corrigeApelidosErrados(S), 0);
});

test('a lápide do apelido atravessa a fusão com o build anterior e com o atual', () => {
  const comApelido = { plano: 13, mtime: 900, apelidos: { 'barra-fixa': { id: 'barra-fixa-assistida-pegada-neutra', m: 500 } }, apagados: {}, carimbos: {}, logs: {}, done: [] } as unknown as Estado;
  const migrado = JSON.parse(JSON.stringify(comApelido)) as Estado;
  corrigeApelidosErrados(migrado);
  (migrado as unknown as { mtime: number }).mtime = 800; // o outro aparelho gravou depois
  for (const ordem of [[comApelido, migrado], [migrado, comApelido]]) {
    const a = funde(JSON.parse(JSON.stringify(ordem[0])), JSON.parse(JSON.stringify(ordem[1])), 1000).estado as unknown as { apelidos?: Record<string, unknown> };
    assert.ok(!a.apelidos || !a.apelidos['barra-fixa'], 'no build atual, não ressuscita');
    // o build de antes dos apelidos (b0efd72) não os conhece: guarda o apelido
    // velho, mas preserva a lápide; o build atual mata de novo na volta
    const v = funde13(JSON.parse(JSON.stringify(ordem[0])), JSON.parse(JSON.stringify(ordem[1])), 1000).estado as unknown as Estado;
    assert.strictEqual((v as unknown as { apagados: Record<string, number> }).apagados['apelido:barra-fixa'], 501, 'a lápide atravessa o build antigo');
    const volta = funde(JSON.parse(JSON.stringify(v)), JSON.parse(JSON.stringify(migrado)), 1100).estado as unknown as { apelidos?: Record<string, unknown> };
    corrigeApelidosErrados(volta as unknown as Estado);
    assert.ok(!volta.apelidos || !volta.apelidos['barra-fixa'], 'na volta ao build atual, some');
  }
});

test('a referência de carga ignora entrada com carga 0 num exercício que tem carga', () => {
  const h = [
    { t: 1, sid: 1, sets: [[32.5, 8], [32.5, 7]] },
    { t: 2, sid: 2, sets: [[0, 10], [0, 10], null] },
  ] as unknown as Log[];
  const r = historicoDeReferencia(h, true);
  assert.strictEqual(r.length, 1);
  assert.strictEqual((r[0].sets[0] as number[])[0], 32.5);
  assert.strictEqual(h.length, 2, 'nada é apagado');
});

test('peso do corpo e assistida: zero é valor e continua na referência', () => {
  const h = [{ t: 2, sid: 2, sets: [[0, 12], [0, 12]] }] as unknown as Log[];
  assert.strictEqual(historicoDeReferencia(h, false).length, 1);
});

test('entrada sem série feita continua (não é a do prescrito)', () => {
  const h = [{ t: 2, sid: 2, sets: [null, null] }] as unknown as Log[];
  assert.strictEqual(historicoDeReferencia(h, true).length, 1);
});
