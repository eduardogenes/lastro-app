// A nutrição: totais derivados, escopo por regra e a lista de compras.
//
// Lei 5 do sistema: nada derivável é digitado. Tudo aqui é derivação, e
// derivação errada é o modo de falha que ninguém nota — o número aparece,
// parece plausível, e está errado.

import { test } from 'vitest';
import assert from 'node:assert';
import { ALIMENTOS_BASE, CATEGORIAS, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  arrozDoAjuste, fmtKg, itemEntra, listaDeCompras, minutosDe, refeicaoEntra,
  refeicoesDeHoje, resumoDaRefeicao, totalDaRefeicao, totalDoDia, totalDoItem
} from '../../src/dominio/nutricao/calculo';
import { migraPlano4 } from '../../src/dominio/migracoes';
import type { Estado } from '../../src/dominio/tipos';

const cat = ALIMENTOS_BASE;

test('a prescrição chegou inteira do plano original', () => {
  assert.strictEqual(Object.keys(cat).length, 36, '36 alimentos na biblioteca');
  assert.strictEqual(PLANO_BASE.length, 6, 'seis refeições');
  assert.deepStrictEqual(PLANO_BASE.map(r => r.id),
    ['pre', 'treino', 'pos', 'almoco', 'lanche', 'jantar']);
});

test('todo alimento declara categoria conhecida e unidade válida', () => {
  const cats = new Set(CATEGORIAS.map(([k]) => k));
  Object.values(cat).forEach(a => {
    assert.ok(cats.has(a.cat), a.n + ' tem categoria desconhecida: ' + a.cat);
    assert.ok(a.u === 'g' || a.u === 'ml', a.n + ' tem unidade inválida');
    assert.ok(a.kcal >= 0 && a.p >= 0 && a.c >= 0 && a.g >= 0, a.n + ' tem macro negativo');
  });
});

test('todo item do plano aponta para alimento que existe', () => {
  PLANO_BASE.forEach(r => r.itens.forEach(i => {
    assert.ok(cat[i.f], r.n + ' cita alimento inexistente: ' + i.f);
    assert.ok(i.q > 0, r.n + ' tem quantidade não positiva em ' + i.f);
  }));
});

test('macros são por 100 unidades', () => {
  const t = totalDoItem({ f: 'arroz', q: 200 }, cat);
  assert.strictEqual(Math.round(t.kcal), 256, '128 kcal/100 g × 200 g');
  assert.strictEqual(Math.round(t.c), 56);
});

test('a escala de porção multiplica, e é só de hoje', () => {
  const cheio = totalDoItem({ f: 'arroz', q: 200 }, cat, 1);
  const metade = totalDoItem({ f: 'arroz', q: 200 }, cat, 0.5);
  assert.strictEqual(Math.round(metade.kcal), Math.round(cheio.kcal / 2));
});

test('item de alimento desconhecido soma zero em vez de derrubar a tela', () => {
  assert.deepStrictEqual(totalDoItem({ f: 'fantasma', q: 100 }, cat), { kcal: 0, p: 0, c: 0, g: 0 });
});

// ---------- escopo por regra, não por duplicação ----------

test('refeição de treino não entra em dia de descanso', () => {
  const pre = PLANO_BASE.find(r => r.id === 'pre')!;
  assert.strictEqual(refeicaoEntra(pre, true, false), true);
  assert.strictEqual(refeicaoEntra(pre, false, false), false, 'não há pré-treino sem treino');

  const almoco = PLANO_BASE.find(r => r.id === 'almoco')!;
  assert.strictEqual(refeicaoEntra(almoco, false, false), true, 'almoço é todo dia');
});

test('item de alta demanda só entra em dia de alta', () => {
  assert.strictEqual(itemEntra({ f: 'malto', q: 25, alta: true }, false), false);
  assert.strictEqual(itemEntra({ f: 'malto', q: 25, alta: true }, true), true);
  assert.strictEqual(itemEntra({ f: 'arroz', q: 100 }, false), true);
});

test('o dia de treino come mais que o de descanso', () => {
  const treino = totalDoDia(PLANO_BASE, cat, true, false);
  const folga = totalDoDia(PLANO_BASE, cat, false, false);
  assert.ok(treino.kcal > folga.kcal, `${treino.kcal} deveria ser maior que ${folga.kcal}`);
  assert.ok(folga.kcal > 1500, 'dia de descanso ainda é um dia inteiro de comida');
});

test('a timeline sai em ordem de relógio', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const horas = refs.map(r => minutosDe(r.t));
  assert.deepStrictEqual(horas, horas.slice().sort((a, b) => a - b));
  assert.strictEqual(refs[0].id, 'pre', 'o pré-treino das 5h45 abre o dia');
  assert.strictEqual(refs[1].id, 'treino', 'e o treino das 6h15 é a linha seguinte, no mesmo eixo');
});

test('o resumo lista o que tem dentro, na unidade certa', () => {
  const pre = PLANO_BASE.find(r => r.id === 'pre')!;
  const txt = resumoDaRefeicao(pre, cat, false);
  assert.ok(txt.includes('35 g pão artesano'), txt);
  assert.ok(txt.includes('20 g doce de leite'), txt);
  assert.ok(txt.includes('200 ml café'), 'café é ml, não g: ' + txt);
});

// ---------- o ajuste calórico ----------

test('o ajuste move o arroz em passos mensuráveis', () => {
  assert.strictEqual(arrozDoAjuste(200, 0), 195, 'arredonda para múltiplo de 15');
  assert.strictEqual(arrozDoAjuste(200, 1), 315, '200 + 120 arredondado ao múltiplo de 15');
  assert.strictEqual(arrozDoAjuste(200, -1), 75);
  assert.strictEqual(arrozDoAjuste(50, -1), 0, 'nunca negativo');
});

// ---------- compras ----------

test('a lista soma o plano pelas vezes que cada refeição acontece', () => {
  const linhas = listaDeCompras(PLANO_BASE, cat, { treino: 6, descanso: 1 });
  const arroz = linhas.find(l => l.f === 'arroz');
  assert.ok(arroz && arroz.comprar > 0);
  // o doce de leite só existe no pré-treino, que só acontece em dia de treino:
  // é o item que prova o escopo por regra em vez de sete planos de dia
  const soTreino = listaDeCompras(PLANO_BASE, cat, { treino: 6, descanso: 1 })
    .find(l => l.f === 'docedeleite')!;
  const menos = listaDeCompras(PLANO_BASE, cat, { treino: 3, descanso: 4 })
    .find(l => l.f === 'docedeleite')!;
  assert.ok(soTreino.pronto > menos.pronto,
    'menos treinos, menos pré-treino, menos doce de leite');
});

test('converte pronto para cru onde há fator, e diz de onde veio', () => {
  const linhas = listaDeCompras(PLANO_BASE, cat, { treino: 7, descanso: 0 });
  const frango = linhas.find(l => l.f === 'frango');
  assert.ok(frango, 'o plano tem frango');
  assert.ok(frango!.comprar > frango!.pronto, '1 kg cozido são 1,3 kg crus no açougue');
  assert.ok(frango!.procedencia && frango!.procedencia.startsWith('cru · '), frango!.procedencia!);

  const arroz = linhas.find(l => l.f === 'arroz')!;
  assert.ok(arroz.comprar < arroz.pronto, 'arroz encolhe: 100 g cozidos são 36 g crus');
});

test('alimento sem fator não ganha linha de procedência', () => {
  const linhas = listaDeCompras(PLANO_BASE, cat, { treino: 7, descanso: 0 });
  const whey = linhas.find(l => l.f === 'whey');
  if (whey) {
    assert.strictEqual(whey.procedencia, null, 'whey não cozinha');
    assert.strictEqual(whey.comprar, whey.pronto);
  }
});

test('horizonte zerado não gera lista', () => {
  assert.deepStrictEqual(listaDeCompras(PLANO_BASE, cat, { treino: 0, descanso: 0 }), []);
});

test('quantidade grande vira kg para ler na gôndola', () => {
  assert.strictEqual(fmtKg(3400, 'g'), '3,4 kg');
  assert.strictEqual(fmtKg(999, 'g'), '999 g');
  assert.strictEqual(fmtKg(1500, 'ml'), '1,5 l');
});

// ---------- a migração 3→4 ----------

function estado3(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 3,
    prog: null, rot: null, ex: {}, mods: null, progLog: []
  } as unknown as Estado, extra);
}

test('3→4 é aditiva: não toca em nada do treino', () => {
  const S = estado3({
    logs: { supino: [{ t: 1, sid: 1, sets: [[60, 8]] }] },
    done: [{ day: 'A', t: 1, sid: 1, dur: 100 }],
    carga: { supino: 'lado' }
  });
  const antes = JSON.stringify({ logs: S.logs, done: S.done, carga: S.carga });
  migraPlano4(S);
  assert.strictEqual(JSON.stringify({ logs: S.logs, done: S.done, carga: S.carga }), antes,
    'histórico, presença e correções de carga saem intactos');
  assert.strictEqual(S.plano, 4);
});

test('3→4 semeia o plano nutricional e a cadência', () => {
  const S = estado3();
  const r = migraPlano4(S)!;
  assert.strictEqual(r.refeicoes, 6);
  assert.strictEqual(r.cadencia, true);
  assert.strictEqual(S.comida.plano!.length, 6);
  assert.strictEqual(S.cadencia!.length, 7);
  assert.strictEqual(S.cadencia![0], 'descanso', 'domingo é folga na semana típica dele');
  assert.strictEqual(S.ajuste, 0);
  assert.strictEqual(S.perfManual, null, 'o app calcula até ele dizer o contrário');
});

test('3→4 copia o plano em profundidade', () => {
  const S = estado3();
  migraPlano4(S);
  S.comida.plano![0].itens[0].q = 999;
  assert.notStrictEqual(PLANO_BASE[0].itens[0].q, 999,
    'editar o plano dele não pode mudar a prescrição de origem');
});

test('3→4 não roda duas vezes', () => {
  const S = estado3({ plano: 4 } as Partial<Estado>);
  assert.strictEqual(migraPlano4(S), null);
});

test('3→4 respeita o que já existe', () => {
  const S = estado3();
  S.cadencia = ['treino', 'treino', 'treino', 'treino', 'treino', 'treino', 'treino'];
  const r = migraPlano4(S)!;
  assert.strictEqual(r.cadencia, false, 'cadência dele não é sobrescrita');
  assert.strictEqual(S.cadencia[0], 'treino');
});
