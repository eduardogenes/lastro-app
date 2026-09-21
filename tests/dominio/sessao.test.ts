// Qual exercício vem agora — as duas perguntas, que não são a mesma.
import { test } from 'vitest';
import assert from 'node:assert';
import { ondeEleEstava, pendente, proximoDepois } from '../../src/dominio/sessao';
import type { EstadoEx } from '../../src/dominio/sessao';

const E = (s: string): EstadoEx[] =>
  s.split('').map(c => (c === 'f' ? 'feito' : c === 'p' ? 'parcial' : c === 'x' ? 'pulado' : 'nada'));

test('pulado não é pendente: ele já recusou', () => {
  assert.strictEqual(pendente('pulado'), false);
  assert.strictEqual(pendente('feito'), false);
  assert.strictEqual(pendente('parcial'), true);
  assert.strictEqual(pendente('nada'), true);
});

// ---------- onde ele estava ----------

test('o exercício começado vence a ordem do programa', () => {
  // O 1 ficou para trás, mas ele está no meio do 3: séries registradas são a
  // prova de onde parou.
  assert.strictEqual(ondeEleEstava(E('nfpn')), 2);
});

test('sem nenhum começado, cai no primeiro não tocado', () => {
  assert.strictEqual(ondeEleEstava(E('ffnn')), 2);
});

test('pulado é atravessado, não oferecido de novo', () => {
  assert.strictEqual(ondeEleEstava(E('fxxn')), 3);
});

test('tudo resolvido devolve null: quem encerra é ele', () => {
  assert.strictEqual(ondeEleEstava(E('ffxf')), null);
  assert.strictEqual(ondeEleEstava([]), null);
});

// ---------- o que abre depois ----------

test('depois de terminar, abre o seguinte', () => {
  assert.strictEqual(proximoDepois(E('fnnn'), 0), 1);
});

test('só para a frente: o que ficou para trás não puxa de volta', () => {
  // O 0 está pendente, mas ele acabou de terminar o 2. Voltar ao 0 seria
  // reordenar o treino no meio da sessão.
  assert.strictEqual(proximoDepois(E('nffn'), 2), 3);
});

test('pula o pulado e o já feito', () => {
  assert.strictEqual(proximoDepois(E('fxfn'), 0), 3);
});

test('no último, não dá a volta', () => {
  assert.strictEqual(proximoDepois(E('nfff'), 3), null,
    'chegar ao fim é informação: quem decide é a tela de finalizar');
  assert.strictEqual(proximoDepois(E('ffff'), 1), null);
});
