// Fase A (24/11): a revisão muda também o EXERCÍCIO que já existe — o tipo de
// carga (`carga:`) e a dica (`dica:`) —, antes lidos e ignorados em silêncio.

import { test } from 'vitest';
import assert from 'node:assert';
import { lerRevisao, mudancasDosExercicios } from '../../src/dominio/revisao';

const texto = [
  'Treino IB · Quadríceps',
  '- Panturrilha sentado · 4 x 10-15 · RIR 1 · 60 s · panturrilha · carga: placa · dica: 2 s de pausa',
  '- Agachamento goblet · 4 x 8-12 · RIR 2 · 2 min · quadríceps · carga: halter unilateral · dica: um halter só, colado no peito',
  '- Dead bug · 3 x 8/lado · core · carga: corpo',
  'Treino IA · Glúteo',
  '- Panturrilha sentado · 4 x 10-15 · RIR 1 · 60 s · panturrilha · carga: placa · dica: 2 s de pausa'
].join('\n');
const ids = { 'Panturrilha sentado': 'panturrilha-sentado', 'Agachamento goblet': 'agachamento-goblet', 'Dead bug': 'dead-bug' };
const nome = (id: string) => id;
const carga = (t: string) => ({ pino: 'placa', lado: 'anilha por lado', halter1: 'um peso só', corpo: 'peso do corpo' } as Record<string, string>)[t] || t;

test('carga e dica diferentes viram mudanças do exercício, uma por exercício, marcadas', () => {
  const agora = (id: string) => ({
    'panturrilha-sentado': { car: 'lado', cue: '2 s de pausa' },
    'agachamento-goblet': { car: 'halter1', cue: 'halter colado no peito' },
    'dead-bug': { car: 'corpo', cue: '' }
  } as Record<string, { car: string; cue: string }>)[id] || null;
  const m = mudancasDosExercicios(lerRevisao(texto), ids, agora, nome, carga);
  assert.deepStrictEqual(m.map(x => x.k), ['*:carga:panturrilha-sentado', '*:dica:agachamento-goblet'], 'sem dica escrita (o dead bug só tem a nota "por lado"), não há mudança de dica');
  assert.strictEqual(m[0].valor, 'pino');
  assert.strictEqual(m[0].titulo, 'panturrilha-sentado: carga anilha por lado → placa');
  assert.ok(!m.some(x => x.desmarcada));
});

test('o que já está igual não é mudança, e o exercício que nasce com a revisão fica de fora', () => {
  const agora = (id: string) => id === 'agachamento-goblet' ? null
    : id === 'dead-bug' ? { car: 'corpo', cue: 'por lado' } : { car: 'pino', cue: '2 s de pausa' };
  const m = mudancasDosExercicios(lerRevisao(texto), ids, agora, nome, carga);
  assert.deepStrictEqual(m, []);
});
