// A busca do catálogo: acento, caixa e pontuação não podem separar quem digita
// de pé, com uma mão, do exercício que ele quer.

import { test } from 'vitest';
import assert from 'node:assert';
import { casaBusca, normalizaBusca } from '../../src/dominio/formato';

test('o acento cai, e o ç vem junto de graça', () => {
  assert.strictEqual(normalizaBusca('Macarrão'), 'macarrao');
  assert.strictEqual(normalizaBusca('Feijão cozido'), 'feijao cozido');
  assert.strictEqual(normalizaBusca('Requeijão light'), 'requeijao light');
  assert.strictEqual(normalizaBusca('Tilápia/merluza'), 'tilapia merluza');
  assert.strictEqual(normalizaBusca('AÇOUGUE'), 'acougue', 'o ç é c + cedilha em NFD');
  assert.strictEqual(normalizaBusca('tríceps'), 'triceps');
  assert.strictEqual(normalizaBusca('abdômen'), 'abdomen');
});

test('a caixa cai depois do acento, não antes', () => {
  // toLowerCase de 'Ã' é 'ã', que continua com o sinal — a ordem importa
  assert.strictEqual(normalizaBusca('PÃO'), 'pao');
  assert.strictEqual(normalizaBusca('Pão'), 'pao');
});

test('pontuação vira espaço, e não vazio', () => {
  assert.strictEqual(normalizaBusca('Sit-up'), 'sit up',
    'colar viraria "situp", e "sit up" deixaria de achar');
  assert.strictEqual(normalizaBusca('Filé/lombo suíno'), 'file lombo suino');
  assert.strictEqual(normalizaBusca('  Pré-treino  '), 'pre treino');
});

test('sem consulta, tudo casa', () => {
  assert.strictEqual(casaBusca('Corrida', ''), true);
  assert.strictEqual(casaBusca('Corrida', '   '), true);
  assert.strictEqual(casaBusca('Corrida', null), true);
});

test('digitar sem acento acha quem tem', () => {
  assert.strictEqual(casaBusca('Macarrão cozido', 'macarrao'), true);
  assert.strictEqual(casaBusca('Feijão cozido', 'feijao'), true);
  assert.strictEqual(casaBusca('Remo ergômetro', 'ergometro'), true);
  assert.strictEqual(casaBusca('Panturrilha em pé', 'em pe'), true);
});

test('digitar COM acento continua achando', () => {
  assert.strictEqual(casaBusca('Macarrão cozido', 'macarrão'), true,
    'quem tem teclado com acento não pode ficar de fora da correção');
  assert.strictEqual(casaBusca('Remo ergômetro', 'ergômetro'), true);
});

test('a ordem das palavras não importa', () => {
  assert.strictEqual(casaBusca('Sled push', 'push sled'), true);
  assert.strictEqual(casaBusca('Farmers carry', 'carry farmers'), true);
  assert.strictEqual(casaBusca('Lunges com sandbag', 'sandbag lunges'), true);
});

test('o hífen casa nos dois sentidos', () => {
  assert.strictEqual(casaBusca('Sit-up', 'sit up'), true);
  assert.strictEqual(casaBusca('Sit-up', 'sit-up'), true);
  assert.strictEqual(casaBusca('Pula-corda', 'pula corda'), true);
});

test('toda palavra da consulta precisa aparecer', () => {
  assert.strictEqual(casaBusca('Sled push', 'sled pull'), false,
    'push não é pull — busca que adivinha devolve o exercício errado');
  assert.strictEqual(casaBusca('Corrida', 'corrida rapida'), false);
});

test('não aproxima palavra errada, e isso é de propósito', () => {
  assert.strictEqual(casaBusca('Remo ergômetro', 'remmo'), false);
  assert.strictEqual(casaBusca('Corrida', 'korrida'), false,
    'um registro sob a chave errada é pior que uma busca sem resultado');
});
