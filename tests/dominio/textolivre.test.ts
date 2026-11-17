// O texto livre do "+" (direção 3, Fase 4): só o que tem certeza vira
// registro. Cada teste guarda um jeito de o app inventar dado: um número solto
// virando peso, "café" marcando o lanche, o copo que ninguém disse.

import { test } from 'vitest';
import assert from 'node:assert';
import { entendeuAlgo, interpretaTexto } from '../../src/dominio/textolivre';

const DIA = [
  { id: 'cafe', n: 'Café da manhã' }, { id: 'almoco', n: 'Almoço' },
  { id: 'lanche', n: 'Lanche da tarde' }, { id: 'jantar', n: 'Jantar' }, { id: 'ceia', n: 'Ceia' }
];

test('a frase do protótipo: almoço e dois copos', () => {
  assert.deepStrictEqual(interpretaTexto('almocei e tomei 2 copos', DIA), { refeicoes: ['almoco'], copos: 2, peso: null });
});

test('copos por extenso, e água sozinha é um copo', () => {
  assert.strictEqual(interpretaTexto('dois copos de água', DIA).copos, 2);
  assert.strictEqual(interpretaTexto('bebi água', DIA).copos, 1);
  assert.strictEqual(interpretaTexto('jantei', DIA).copos, null, 'ninguém disse copo');
});

test('o peso só com a palavra que o diz; número solto não é peso', () => {
  assert.strictEqual(interpretaTexto('pesei 77,6', DIA).peso, 77.6);
  assert.strictEqual(interpretaTexto('77.4 kg hoje', DIA).peso, 77.4);
  assert.strictEqual(interpretaTexto('comi 120 de arroz', DIA).peso, null);
  assert.strictEqual(interpretaTexto('pesei 7,6', DIA).peso, null, 'fora da faixa possível');
});

test('cada refeição pelo seu nome, sem marcar a vizinha', () => {
  assert.deepStrictEqual(interpretaTexto('jantei e fiz a ceia', DIA).refeicoes, ['jantar', 'ceia']);
  assert.deepStrictEqual(interpretaTexto('tomei café', DIA).refeicoes, ['cafe']);
  assert.deepStrictEqual(interpretaTexto('lanchei', DIA).refeicoes, ['lanche']);
});

test('o que não se entende não vira nada', () => {
  const e = interpretaTexto('fui na academia e voltei', DIA);
  assert.strictEqual(entendeuAlgo(e), false);
  assert.strictEqual(entendeuAlgo(interpretaTexto('', DIA)), false);
});
