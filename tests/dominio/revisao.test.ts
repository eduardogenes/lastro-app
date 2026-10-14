// A revisão do treinador colada em texto (prescrição, estado 6; decisão do
// dono, 14/10): ler, casar os nomes sem chutar, e dizer o que muda.
import { test } from 'vitest';
import assert from 'node:assert';
import { lerRevisao, casaNomes, parecenca, mudancasDaRevisao } from '../../src/dominio/revisao';

const TEXTO = `Revisão 21/09

Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 4 x 8-12 · RIR 1 · 2:00 · posterior
- Hip thrust máquina · 3 x 8-12 · RIR 1 · 2:30 · glúteo
- Panturrilha em pé · 3 séries de 6 a 10 · 90 s · panturrilha · dica: descida completa

Treino HX · Aula do box (aberto)`;

const CAT = {
  'agachamento-no-smith': { n: 'Agachamento no Smith', g: 'quadríceps' },
  'cadeira-flexora-sentada': { n: 'Cadeira flexora sentada', g: 'posterior' },
  'elevacao-pelvica-na-maquina': { n: 'Elevação pélvica na máquina', g: 'glúteo' },
  'panturrilha-em-pe': { n: 'Panturrilha em pé', g: 'panturrilha' },
  'leg-press': { n: 'Leg press', g: 'quadríceps' }
};
const ATUAL = { B: { ex: [
  { id: 'agachamento-no-smith', s: 2 }, { id: 'cadeira-flexora-sentada', s: 3 },
  { id: 'elevacao-pelvica-na-maquina', s: 2 }, { id: 'leg-press', s: 2 }
] } };

test('lê os treinos, os exercícios e cada campo, em qualquer ordem', () => {
  const r = lerRevisao(TEXTO);
  assert.strictEqual(r.data, '21/09');
  assert.deepStrictEqual(r.problemas, []);
  assert.deepStrictEqual(r.dias.map(d => [d.dia, d.nome, d.aberto, d.ex.length]),
    [['B', 'Pernas completas + panturrilhas', false, 4], ['HX', 'Aula do box', true, 0]]);
  const [ag, fl, , pt] = r.dias[0].ex;
  assert.deepStrictEqual(ag, { n: 'Agachamento no Smith', s: 2, r: '6–10', rir: '1–2', d: 180, g: 'quadríceps' });
  assert.strictEqual(fl.d, 120);
  assert.deepStrictEqual([pt.s, pt.r, pt.d, pt.cue], [3, '6–10', 90, 'descida completa']);
});

test('o que não se entende vira problema dito, não chute', () => {
  const r = lerRevisao(`- Supino solto · 3 x 8
Treino A
- Supino reto · 3 x 8-12 · pesado demais · ombro
- Remada · RIR 1
Texto qualquer
Treino A · de novo`);
  const motivos = r.problemas.map(p => p.motivo);
  assert.ok(motivos.includes('exercício antes de qualquer "Treino X"'));
  assert.ok(motivos.some(m => /^não entendi: pesado demais, ombro$/.test(m)), motivos.join(' | '));
  assert.ok(motivos.includes('falta séries × repetições, como "3 x 8-12"'));
  assert.ok(motivos.includes('não é cabeçalho de treino nem exercício'));
  assert.ok(motivos.includes('o Treino A aparece duas vezes'));
  assert.strictEqual(r.dias[0].ex.length, 1, 'o supino reto entrou mesmo com o campo não entendido');
});

test('nome idêntico é o mesmo; parecido pergunta; o do mesmo lugar pergunta; o resto é novo', () => {
  const r = lerRevisao(TEXTO + '\n');
  const c = casaNomes(r, CAT, ATUAL);
  assert.deepStrictEqual(c['Agachamento no Smith'], { k: 'igual', id: 'agachamento-no-smith' });
  assert.deepStrictEqual(c['Panturrilha em pé'], { k: 'igual', id: 'panturrilha-em-pe' });
  assert.deepStrictEqual(c['Flexora sentada'], { k: 'pergunta', id: 'cadeira-flexora-sentada', por: 'nome' });
  assert.deepStrictEqual(c['Hip thrust máquina'], { k: 'pergunta', id: 'elevacao-pelvica-na-maquina', por: 'nome' },
    'hip thrust é elevação pélvica');
});

test('sem nome parecido, o candidato é o que a revisão deixa de fora no mesmo lugar', () => {
  const r = lerRevisao(`Treino B
- Agachamento no Smith · 2 x 6-10
- Belt squat · 3 x 8-12 · quadríceps`);
  const c = casaNomes(r, CAT, ATUAL);
  assert.deepStrictEqual(c['Belt squat'], { k: 'pergunta', id: 'cadeira-flexora-sentada', por: 'lugar' },
    'a posição 2 do B é a da flexora, que a revisão deixou de fora');
  const sem = casaNomes(lerRevisao(`Treino Z\n- Belt squat · 3 x 8-12`), CAT, ATUAL);
  assert.deepStrictEqual(sem['Belt squat'], { k: 'novo' }, 'treino novo, sem lugar a herdar: é exercício novo');
});

test('um exercício nunca é proposto para dois nomes', () => {
  const r = lerRevisao(`Treino B
- Flexora sentada · 3 x 8-12
- Flexora sentada unilateral · 2 x 10-15`);
  const c = casaNomes(r, CAT, ATUAL);
  const ids = Object.values(c).filter(x => x.k !== 'novo').map(x => (x as { id: string }).id);
  assert.strictEqual(new Set(ids).size, ids.length, JSON.stringify(c));
});

test('a parecença: contido conta, palavra solta não basta', () => {
  assert.ok(parecenca('Flexora sentada', 'Cadeira flexora sentada') >= 0.5);
  assert.ok(parecenca('Rosca direta', 'Rosca martelo') < 0.5);
  assert.ok(parecenca('Hip thrust máquina', 'Elevação pélvica na máquina') >= 0.5);
});

test('o que muda no treino: entra, sai, e as séries de antes e depois', () => {
  const r = lerRevisao(TEXTO);
  const ids = { 'Agachamento no Smith': 'agachamento-no-smith', 'Flexora sentada': 'cadeira-flexora-sentada',
                'Hip thrust máquina': 'elevacao-pelvica-na-maquina', 'Panturrilha em pé': 'panturrilha-em-pe' };
  const m = mudancasDaRevisao(r, ids, ATUAL, id => (CAT as Record<string, { n: string }>)[id].n);
  assert.deepStrictEqual(m[0].linhas, [
    'Cadeira flexora sentada: 3 → 4 séries',
    'Elevação pélvica na máquina: 2 → 3 séries',
    'entra Panturrilha em pé, 3 séries',
    'sai Leg press'
  ]);
  assert.deepStrictEqual([m[0].antes, m[0].depois], [9, 12]);
  assert.strictEqual(m[1].novo, true, 'o HX não existia nesse programa de teste');
});

test('uma palavra em comum não faz candidato: "Rosca direta" não é a Rosca martelo', () => {
  const c = casaNomes(lerRevisao('Treino Z\n- Rosca direta · 3 x 8-12'),
    { 'rosca-martelo': { n: 'Rosca martelo', g: 'bíceps' } }, {});
  assert.deepStrictEqual(c['Rosca direta'], { k: 'novo' });
});
