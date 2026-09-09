// O histórico do dia alimentar.
//
// Antes disto o dia era sobrescrito na virada da data: nada do que ele comeu
// sobrevivia à meia-noite, e o laço monitorar → comparar → ajustar ficava
// travado no primeiro terço. Os testes daqui guardam três coisas que é fácil
// errar: o passado não se reescreve, ausência de registro não é falha, e a
// medida é contagem, não nota.

import { test } from 'vitest';
import assert from 'node:assert';
import { ALIMENTOS_BASE, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  aderenciaDoDia, fechaDia, janelaDoHistorico, padraoPorRefeicao, refeicoesDeHoje
} from '../../src/dominio/nutricao/calculo';
import type { DiaComida, DiaComidaHist } from '../../src/dominio/nutricao/tipos';

const cat = ALIMENTOS_BASE;
const dia = (extra: Partial<DiaComida> = {}): DiaComida => Object.assign({
  data: '2026-01-14', done: {}, agua: 0, escala: {}, cadencia: 'treino' as const, alta: 0 as const
}, extra);

test('o total é congelado no fechamento, contra o plano daquele dia', () => {
  const d = dia({ done: { pos: 1, almoco: 1 } });
  const h = fechaDia(d, PLANO_BASE, cat, 111, 0, 1000);
  assert.ok(h.tot.kcal > 0);
  assert.strictEqual(h.pv, 111, 'e carrega o carimbo do plano com que foi calculado');

  // o plano muda depois — o dia já fechado não se mexe
  const outro = JSON.parse(JSON.stringify(PLANO_BASE));
  outro.find((r: { id: string }) => r.id === 'almoco').itens[0].q = 100;
  const agora = fechaDia(d, outro, cat, 222, 0, 1000);
  assert.ok(agora.tot.kcal < h.tot.kcal, 'o mesmo dia daria outro número contra o plano novo');
  assert.ok(h.tot.kcal > 0, 'e é justamente por isso que o congelado tem que existir');
});

test('a aderência é ponderada pela escala, não pela contagem crua', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const cheio = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 } }),
                         PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(cheio, refs), 1);

  const meio = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                              escala: { jantar: 0.5 } }), PLANO_BASE, cat, 1, 0, 1000);
  const a = aderenciaDoDia(meio, refs)!;
  assert.ok(a < 1 && a > 0.9,
    '"marcou feito com metade" não é igual a "comeu tudo" — o app já tem esse dado');
});

test('ausência de registro NÃO é aderência zero', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const vazio = fechaDia(dia({ agua: 4 }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(vazio, refs), null,
    'ele pode ter comido perfeitamente e só não ter aberto o app');
});

test('o padrão por refeição sai em contagem, e o dia mudo não entra no denominador', () => {
  const h: DiaComidaHist[] = [
    fechaDia(dia({ data: '2026-01-10', done: { pos: 1, almoco: 1, lanche: 1 } }), PLANO_BASE, cat, 1, 0, 1),
    fechaDia(dia({ data: '2026-01-11', done: { pos: 1, almoco: 1 } }), PLANO_BASE, cat, 1, 0, 2),
    fechaDia(dia({ data: '2026-01-12', done: { pos: 1, almoco: 1 } }), PLANO_BASE, cat, 1, 0, 3),
    fechaDia(dia({ data: '2026-01-13', agua: 6 }), PLANO_BASE, cat, 1, 0, 4)   // dia mudo
  ];
  const p = padraoPorRefeicao(h, PLANO_BASE);
  const almoco = p.find(x => x.id === 'almoco')!;
  const lanche = p.find(x => x.id === 'lanche')!;
  assert.strictEqual(almoco.possiveis, 3, 'o dia sem registro nenhum fica de fora da conta');
  assert.strictEqual(almoco.feitas, 3);
  assert.strictEqual(lanche.feitas, 1, 'o lanche é o que mais falha, e a contagem diz isso');
  assert.strictEqual(lanche.possiveis, 3);
  assert.ok(!('pct' in lanche), 'contagem, nunca percentual — percentual contra 100% vira nota');
});

test('o dia guarda o ajuste calórico em vigor, para o app auditar a própria régua', () => {
  const h = fechaDia(dia({ done: { pos: 1 } }), PLANO_BASE, cat, 1, 1, 1000);
  assert.strictEqual(h.aj, 1);
  const zero = fechaDia(dia({ done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(zero.aj, undefined, 'ajuste neutro não gasta byte');
});

test('o enquadramento do dia viaja junto', () => {
  const h = fechaDia(dia({ done: { pos: 1 }, alta: 1, turno: 'noite', cadencia: 'treino' }),
                     PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(h.turno, 'noite');
  assert.strictEqual(h.alta, 1);
  assert.strictEqual(h.cadencia, 'treino');
});

test('a janela devolve os dias em ordem, do mais antigo ao mais novo', () => {
  const h = ['2026-01-01', '2026-01-20', '2026-01-14'].map(d =>
    fechaDia(dia({ data: d, done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, 1));
  const j = janelaDoHistorico(h, 14, '2026-01-20');
  assert.deepStrictEqual(j.map(x => x.d), ['2026-01-14', '2026-01-20']);
});

test('um dia inteiramente mudo não vira linha nenhuma', () => {
  // o `fechaDia` monta o registro; quem decide se ele vale a pena é o casco.
  // Aqui garantimos que pelo menos o registro sai coerente e vazio.
  const h = fechaDia(dia(), PLANO_BASE, cat, 1, 0, 1000);
  assert.deepStrictEqual(h.done, {});
  assert.strictEqual(h.tot.kcal, 0);
});
