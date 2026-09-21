// A leitura da semana: as linhas do painel de volume lidas em conjunto.
//
// O modo de falha aqui não é a conta — é a frase virar conselho. A regra 6 do
// produto é "não inventar conselho de treino", e o que estes testes cercam é
// que ela descreva e pare.
import { test } from 'vitest';
import assert from 'node:assert';
import { leituraDaSemana } from '../../src/dominio/volume';

const NIVEL: Record<string, string> = {
  'peito superior': 'maxima', 'delt lateral': 'maxima',
  'dorsal': 'secundaria', 'panturrilha': 'secundaria',
  'peito': 'normal', 'bíceps': 'normal', 'quadríceps': 'normal',
  'delt posterior': 'normal'
};
const nivelDe = (g: string) => NIVEL[g] || 'normal';

test('a inversão que ele descreveu: peito 12, peito superior 6', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 12, media: 10 },
    { g: 'peito superior', n: 6, media: 9 }
  ], nivelDe, 4);
  const inv = r.filter(x => x.k === 'inversao')[0];
  assert.ok(inv, 'nenhuma inversão vista');
  assert.ok(inv.txt.includes('peito levou 12'), inv.txt);
  assert.ok(inv.txt.includes('peito superior, 6'), inv.txt);
});

test('descreve e para: nada de "aumente", "reduza" ou "deveria"', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 12, media: 10 },
    { g: 'peito superior', n: 2, media: 9 },
    { g: 'dorsal', n: 3, media: 8 }
  ], nivelDe, 4);
  const txt = r.map(x => x.txt).join(' ').toLowerCase();
  ['aument', 'reduz', 'deveria', 'precisa', 'falta', 'errado', 'corrig'].forEach(p => {
    assert.ok(!txt.includes(p), 'virou conselho com "' + p + '": ' + txt);
  });
});

test('só a inversão mais gritante, nunca três dizendo o mesmo', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 10, media: null },
    { g: 'peito superior', n: 4, media: null },
    { g: 'delt posterior', n: 12, media: null },
    { g: 'delt lateral', n: 2, media: null }
  ], nivelDe, 4);
  const invs = r.filter(x => x.k === 'inversao');
  assert.strictEqual(invs.length, 1);
  assert.ok(invs[0].txt.includes('delt posterior levou 12'), 'a maior diferença: ' + invs[0].txt);
});

test('não cruza regiões: peito contra delt lateral não é inversão', () => {
  // A maior diferença do painel, e não diz nada — são dias diferentes do
  // programa, e um não tira volume do outro.
  const r = leituraDaSemana([
    { g: 'peito', n: 14, media: null },
    { g: 'delt lateral', n: 0, media: null }
  ], nivelDe, 4);
  assert.strictEqual(r.filter(x => x.k === 'inversao').length, 0);
});

test('zero séries no priorizado ainda é inversão, se houver par na região', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 9, media: null },
    { g: 'peito superior', n: 0, media: null }
  ], nivelDe, 4);
  assert.ok(r.filter(x => x.k === 'inversao').length, 1);
});

test('sem inversão, cala', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 6, media: 6 },
    { g: 'peito superior', n: 10, media: 9 }
  ], nivelDe, 4);
  assert.strictEqual(r.filter(x => x.k === 'inversao').length, 0);
});

test('priorizado abaixo da própria média é contagem, nunca percentual', () => {
  // "3 de 5" e "60%" são iguais na matemática e opostos na cabeça: um número
  // contra 100% implícito funciona como nota.
  const r = leituraDaSemana([
    { g: 'peito superior', n: 6, media: 9 },
    { g: 'delt lateral', n: 4, media: 8 },
    { g: 'dorsal', n: 9, media: 8 },
    { g: 'panturrilha', n: 2, media: 6 }
  ], nivelDe, 4);
  const ab = r.filter(x => x.k === 'abaixo')[0];
  assert.ok(ab, 'não observou');
  assert.ok(ab.txt.includes('3 dos 4'), ab.txt);
  assert.ok(!ab.txt.includes('%'), 'percentual vira nota: ' + ab.txt);
});

test('sem média não há o que comparar, e o silêncio é a resposta', () => {
  const r = leituraDaSemana([
    { g: 'peito superior', n: 6, media: null },
    { g: 'dorsal', n: 3, media: null }
  ], nivelDe, 4);
  assert.strictEqual(r.filter(x => x.k === 'abaixo').length, 0);
});

test('painel vazio não inventa frase', () => {
  assert.deepStrictEqual(leituraDaSemana([], nivelDe, 4), []);
});

test('semana sem treino nenhum não é inversão', () => {
  const r = leituraDaSemana([
    { g: 'peito', n: 0, media: 8 },
    { g: 'peito superior', n: 0, media: 9 }
  ], nivelDe, 4);
  assert.strictEqual(r.filter(x => x.k === 'inversao').length, 0,
    'sem diferença não há o que observar');
});
