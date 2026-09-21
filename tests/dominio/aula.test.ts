// Ler uma aula escrita fora do app.
//
// O modo de falha que importa aqui não é o JSON torto — é o arquivo plausível
// que entra e planta dado errado: um movimento desconhecido cuja grandeza o
// app teria que adivinhar, ou um cadastro que reescreve um exercício com meses
// de histórico.
import { test } from 'vitest';
import assert from 'node:assert';
import { leAula } from '../../src/dominio/aula';

/** Catálogo de mentira: só corrida e wall balls existem. */
const CONHECIDO = (id: string) => id === 'corrida' || id === 'wall-balls';

const base = (extra: Record<string, unknown> = {}) => JSON.stringify(Object.assign({
  lastro: 'aula', v: 1, nome: 'HYROX MZ',
  mov: [{ n: 'Corrida', s: 3, q: 200, u: 'm', d: 60 }]
}, extra));

test('uma aula mínima entra', () => {
  const r = leAula(base(), CONHECIDO);
  assert.strictEqual(r.ok, true, r.erro);
  assert.strictEqual(r.aula!.nome, 'HYROX MZ');
  assert.deepStrictEqual(r.aula!.mov[0], { id: 'corrida', s: 3, d: 60, u: 'm', q: 200 });
  assert.deepStrictEqual(r.aula!.novos, []);
});

// ---------- as duas regras que governam ----------

test('movimento desconhecido sem declaração é recusa, não palpite', () => {
  const r = leAula(base({ mov: [{ n: 'Squat jump', s: 3, q: 15, u: 'rep' }] }), CONHECIDO);
  assert.strictEqual(r.ok, false);
  assert.ok(r.erro!.includes('não existe no catálogo'), r.erro);
});

test('declarado, o movimento novo entra para cadastro', () => {
  const r = leAula(base({
    mov: [{ n: 'Squat jump', novo: { car: 'corpo', u: 'rep' }, s: 3, q: 15, u: 'rep' }]
  }), CONHECIDO);
  assert.strictEqual(r.ok, true, r.erro);
  assert.deepStrictEqual(r.aula!.novos, [{ id: 'squat-jump', n: 'Squat jump', car: 'corpo', u: 'rep' }]);
});

test('o catálogo vence o arquivo: cadastro de quem já existe é ignorado', () => {
  // Senão um arquivo colado mudaria a grandeza de um exercício com meses de
  // histórico, e duas séries históricas viravam uma só, torta.
  const r = leAula(base({
    mov: [{ n: 'Corrida', novo: { car: 'corpo', u: 'cal' }, s: 1, q: 15, u: 'cal' }]
  }), CONHECIDO);
  assert.strictEqual(r.ok, true, r.erro);
  assert.deepStrictEqual(r.aula!.novos, [], 'não cadastra por cima');
  assert.ok(r.avisos[0].includes('já existe'), r.avisos.join(' | '));
});

test('o mesmo movimento novo em várias linhas cadastra uma vez só', () => {
  const r = leAula(base({
    mov: [
      { n: 'Split jump', novo: { car: 'corpo', u: 'rep' }, s: 3, q: 12, u: 'rep' },
      { n: 'Split jump', s: 1, q: 20, u: 'rep' }
    ]
  }), CONHECIDO);
  assert.strictEqual(r.ok, true, r.erro);
  assert.strictEqual(r.aula!.novos.length, 1);
  assert.strictEqual(r.aula!.mov.length, 2, 'mas as duas linhas ficam');
});

test('o mesmo movimento conhecido repete à vontade: é a mesma série histórica', () => {
  const r = leAula(base({
    mov: [
      { n: 'Corrida', s: 3, q: 200, u: 'm' },
      { n: 'Corrida', s: 3, q: 300, u: 'm' },
      { n: 'Corrida', s: 1, q: 1000, u: 'm' }
    ]
  }), CONHECIDO);
  assert.strictEqual(r.ok, true, r.erro);
  assert.deepStrictEqual(r.aula!.mov.map(m => m.q), [200, 300, 1000]);
});

// ---------- recusas ----------

test('JSON torto recusa com motivo legível', () => {
  assert.ok(leAula('{ isso nao e json', CONHECIDO).erro!.includes('JSON inválido'));
});

test('arquivo de outra coisa não passa por aula', () => {
  assert.ok(leAula(JSON.stringify({ app: 'lastro', data: {} }), CONHECIDO)
    .erro!.includes('não é uma aula'));
});

test('grandeza inventada recusa, e diz quais existem', () => {
  const r = leAula(base({ mov: [{ n: 'Corrida', s: 1, q: 5, u: 'km' }] }), CONHECIDO);
  assert.strictEqual(r.ok, false);
  assert.ok(r.erro!.includes('rep'), r.erro);
});

test('quantidade sem grandeza recusa: número sem unidade não se registra', () => {
  const r = leAula(base({ mov: [{ n: 'Corrida', s: 1, q: 200 }] }), CONHECIDO);
  assert.ok(r.erro!.includes('grandeza'), r.erro);
});

test('carregamento inventado recusa no cadastro', () => {
  const r = leAula(base({
    mov: [{ n: 'Sled drag', novo: { car: 'trenó', u: 'm' }, s: 1, q: 50, u: 'm' }]
  }), CONHECIDO);
  assert.ok(r.erro!.includes('carregamento'), r.erro);
});

test('aula sem movimento e aula sem nome recusam', () => {
  assert.ok(leAula(base({ mov: [] }), CONHECIDO).erro!.includes('movimento nenhum'));
  assert.ok(leAula(base({ nome: '  ' }), CONHECIDO).erro!.includes('nome'));
});

test('data fora do formato recusa', () => {
  assert.ok(leAula(base({ data: '20/09/2026' }), CONHECIDO).erro!.includes('AAAA-MM-DD'));
});

test('passadas fracionárias ou zero recusam', () => {
  assert.ok(!leAula(base({ mov: [{ n: 'Corrida', s: 0, q: 1, u: 'm' }] }), CONHECIDO).ok);
  assert.ok(!leAula(base({ mov: [{ n: 'Corrida', s: 1.5, q: 1, u: 'm' }] }), CONHECIDO).ok);
});

// ---------- o que sobrevive ----------

test('o quadro e a data atravessam inteiros', () => {
  const quadro = 'HYROX MZ!\n· 150 WALL BALL\n· 1KM RUN';
  const r = leAula(base({ data: '2026-09-20', quadro: quadro }), CONHECIDO);
  assert.strictEqual(r.aula!.data, '2026-09-20');
  assert.strictEqual(r.aula!.quadro, quadro, 'a procedência é literal, sem reescrita');
});

test('versão futura avisa em vez de recusar', () => {
  const r = leAula(base({ v: 9 }), CONHECIDO);
  assert.strictEqual(r.ok, true);
  assert.ok(r.avisos[0].includes('versão 9'), r.avisos.join(' | '));
});
