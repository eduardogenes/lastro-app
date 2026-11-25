// O bi-set como circuito (dominio/biset.ts): a ordem das séries, o descanso
// depois de cada uma e a pegada que sai da dica. E o "Separar hoje" guardado
// na sessão atravessando a fusão com o build em produção.
import { test } from 'vitest';
import assert from 'node:assert';
import { depoisDaSerie, paresDoTreino, proximaDoPar, separaPegada, type Estacao } from '../../src/dominio/biset';
import { funde } from '../../src/dominio/sincronia';
import { funde as funde13 } from './fixtures/sincronia-build13';
import type { Estado } from '../../src/dominio/tipos';

const est = (series: number, feitas: number[] = [], fora = false): Estacao =>
  ({ series, fora, cheia: k => feitas.indexOf(k) >= 0 });

test('os pares do treino: bi liga ao de baixo, não encadeia, o último não forma par', () => {
  const { pares, de } = paresDoTreino([{}, { bi: 1 }, {}, { bi: 1 }, { bi: 1 }, { bi: 1 }, {}, { bi: 1 }]);
  assert.deepStrictEqual(pares, [{ n: 1, a: 1, b: 2 }, { n: 2, a: 3, b: 4 }, { n: 3, a: 5, b: 6 }]);
  assert.strictEqual(de[0], undefined);
  assert.strictEqual(de[7], undefined, 'bi no último exercício não forma par');
  assert.strictEqual(de[4].a, 3, 'a estação 2 aponta para o par dela');
});

test('o par separado hoje continua numerado, marcado como separado', () => {
  const { de } = paresDoTreino([{ bi: 1 }, {}, { bi: 1 }, {}], [0]);
  assert.strictEqual(de[0].separado, true);
  assert.strictEqual(de[1].separado, true);
  assert.strictEqual(de[2].separado, false);
  assert.strictEqual(de[2].n, 2, 'o par 2 continua sendo o 2');
});

test('o circuito alterna: estação 1, estação 2, rodada seguinte', () => {
  assert.deepStrictEqual(proximaDoPar(est(4), est(3)), { lado: 'a', k: 0 });
  assert.deepStrictEqual(proximaDoPar(est(4, [0]), est(3)), { lado: 'b', k: 0 }, 'depois da 1ª do A vem a 1ª do B, não a 2ª do A');
  assert.deepStrictEqual(proximaDoPar(est(4, [0]), est(3, [0])), { lado: 'a', k: 1 });
  // começou a rodada pela estação 2 (aparelho ocupado): falta a 1 desta rodada
  assert.deepStrictEqual(proximaDoPar(est(4, [0]), est(3, [0, 1])), { lado: 'a', k: 1 });
});

test('a série que sobra sai sozinha, e o par acaba', () => {
  assert.deepStrictEqual(proximaDoPar(est(4, [0, 1, 2]), est(3, [0, 1, 2])), { lado: 'a', k: 3 });
  assert.deepStrictEqual(proximaDoPar(est(2, [0, 1]), est(3, [0, 1])), { lado: 'b', k: 2 });
  assert.strictEqual(proximaDoPar(est(2, [0, 1]), est(2, [0, 1])), null);
});

test('estação pulada some do circuito: a outra segue sozinha', () => {
  assert.deepStrictEqual(proximaDoPar(est(3, [], true), est(3)), { lado: 'b', k: 0 });
  assert.deepStrictEqual(proximaDoPar(est(3, [], true), est(3, [0])), { lado: 'b', k: 1 });
});

test('depois da série: sem pausa no meio da rodada, descanso do par no fim, o próprio na que sobra', () => {
  assert.strictEqual(depoisDaSerie('a', 0, est(4, [0]), est(3)), 'segue');
  assert.strictEqual(depoisDaSerie('b', 0, est(4, [0]), est(3, [0])), 'par');
  // começou pela estação 2: depois dela, a 1 ainda deve a rodada
  assert.strictEqual(depoisDaSerie('b', 1, est(4, [0]), est(3, [0, 1])), 'segue');
  assert.strictEqual(depoisDaSerie('a', 1, est(4, [0, 1]), est(3, [0, 1])), 'par');
  assert.strictEqual(depoisDaSerie('a', 3, est(4, [0, 1, 2, 3]), est(3, [0, 1, 2])), 'proprio', 'a 4ª do A não tem par');
  assert.strictEqual(depoisDaSerie('a', 0, est(3, [0]), est(3, [], true)), 'proprio', 'com a outra pulada, cada série descansa o seu');
});

test('a pegada e os pés saem da dica, o resto fica', () => {
  assert.deepStrictEqual(separaPegada('pegada: neutra na corda; bi-set com o de baixo; costas no encosto'),
    { pegada: 'neutra na corda', pes: null, resto: 'bi-set com o de baixo; costas no encosto' });
  assert.deepStrictEqual(separaPegada('por perna; pegada: neutra nos halteres; pés: passo médio-longo; comece pela esquerda'),
    { pegada: 'neutra nos halteres', pes: 'passo médio-longo', resto: 'por perna; comece pela esquerda' });
  assert.deepStrictEqual(separaPegada('Pes: largura dos ombros; desça fundo'), { pegada: null, pes: 'largura dos ombros', resto: 'desça fundo' });
  assert.deepStrictEqual(separaPegada('lento, sem forçar'), { pegada: null, pes: null, resto: 'lento, sem forçar' });
  assert.deepStrictEqual(separaPegada('troque a pegada: a cada série'), { pegada: null, pes: null, resto: 'troque a pegada: a cada série' }, 'só trecho que começa com "pegada:"');
  assert.deepStrictEqual(separaPegada(undefined), { pegada: null, pes: null, resto: '' });
});

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 13,
    prog: null, rot: null, ex: {}, mods: null, progLog: [], apagados: {}, falta: {}, descanso: {}
  } as Estado, extra);
}

test('"Separar hoje" fica na sessão e atravessa a fusão com o build em produção', () => {
  const T = 1790000000000;
  const sessao = { day: 'SB', inicio: T, ultima: T + 5, sid: T, pausas: [], pulados: [], separar: ['triceps-testa-com-barra-w'] };
  const novo = estado({ mtime: T + 5, carimbosEm: T + 5, carimbos: { sessao: T + 5 }, sessao: sessao as unknown as Estado['sessao'] });
  // o build em produção registrou depois uma série de outro exercício (mtime maior), sem mexer na sessão
  const velho = estado({ mtime: T + 9, carimbosEm: T + 9, carimbos: { sessao: T - 100 },
    sessao: { day: 'SB', inicio: T, ultima: T, sid: T, pausas: [], pulados: [] } as unknown as Estado['sessao'] });
  const no13 = funde13(velho, novo, T + 10).estado as Estado;
  assert.deepStrictEqual((no13.sessao as unknown as { separar: string[] }).separar, ['triceps-testa-com-barra-w'], 'o 13 leva a sessão inteira, com o campo que não conhece');
  const volta = funde(novo, no13, T + 11).estado;
  assert.deepStrictEqual((volta.sessao as unknown as { separar: string[] }).separar, ['triceps-testa-com-barra-w']);
});
