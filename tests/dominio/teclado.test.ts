// O teclado próprio, a parte pura: o que uma tecla faz com o que já está lá.
//
// A régua tirou o teclado do sistema da repetição; este teclado é o que atende o
// que a régua não carrega, e a carga da série quando ela deixar de ser campo.
// §6.2 da frente 2.

import { test } from 'vitest';
import assert from 'node:assert';
import { teclar, DECIMAL_FIXA } from '../../src/dominio/teclado.js';

test('dígito soma à direita, como em qualquer campo', () => {
  assert.strictEqual(teclar('', '2', false), '2');
  assert.strictEqual(teclar('2', '7', false), '27');
  assert.strictEqual(teclar('27', '0', false), '270');
});

test('apagar tira o último caractere, e no vazio não estoura', () => {
  assert.strictEqual(teclar('275', '⌫', false), '27');
  assert.strictEqual(teclar('2', '⌫', false), '');
  assert.strictEqual(teclar('', '⌫', false), '');
  assert.strictEqual(teclar('22,', '⌫', true), '22', 'a vírgula também se apaga');
});

test('a vírgula não existe em campo de inteiro', () => {
  // Repetição é inteira. Uma vírgula aceita ali seria um valor que o histórico
  // não sabe guardar, e a tecla nem aparece na grade.
  assert.strictEqual(teclar('22', ',', false), '22');
});

test('a vírgula entra uma vez só, e nunca começa o número', () => {
  assert.strictEqual(teclar('22', ',', true), '22,');
  assert.strictEqual(teclar('22,', ',', true), '22,', 'duas vírgulas não');
  assert.strictEqual(teclar('22,5', ',', true), '22,5');
  assert.strictEqual(teclar('', ',', true), '',
    '",5" não é número que ele queira: a vírgula pede um inteiro antes');
});

test('uma casa decimal, e só', () => {
  // A carga não tem centésimo, e o 22,55 que o dedo produz sem querer entraria
  // no histórico que alimenta a leitura de força.
  assert.strictEqual(teclar('22,5', '5', true), '22,5');
  assert.strictEqual(teclar('22,', '5', true), '22,5');
});

test('o zero à esquerda não gruda', () => {
  assert.strictEqual(teclar('0', '6', true), '6', '"06" não é um número que alguém digite');
  assert.strictEqual(teclar('0', ',', true), '0,', 'mas "0," é o começo de "0,5"');
});

test('tecla que não é dígito, vírgula ou apagar não muda nada', () => {
  assert.strictEqual(teclar('22', 'x', true), '22');
  assert.strictEqual(teclar('22', '', true), '22');
});

test('o modelo da casa decimal está declarado, e é reversível numa linha', () => {
  // A §6.1 manda "com vírgula E casa decimal fixa", e as duas metades não são a
  // mesma coisa: o parêntese de C2 ("736" → 73,6) é a registradora, que não tem
  // vírgula a digitar. Eu implementei a vírgula e declarei a divergência; este
  // caso existe para que a decisão não vire acidente — se alguém trocar a
  // constante, ele fica vermelho e obriga a ler o argumento.
  assert.strictEqual(DECIMAL_FIXA, false,
    'se a registradora entrar, é decisão dele e o argumento no topo de ' +
    'src/dominio/teclado.ts tem de mudar junto');
  assert.strictEqual(teclar('6', '0', true), '60',
    'livre: dois toques fazem 60, e carga redonda é o caso comum');
});
