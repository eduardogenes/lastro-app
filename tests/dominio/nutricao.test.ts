// A nutrição: totais derivados, escopo por regra e a lista de compras.
//
// Lei 5 do sistema: nada derivável é digitado. Tudo aqui é derivação, e
// derivação errada é o modo de falha que ninguém nota — o número aparece,
// parece plausível, e está errado.

import { test } from 'vitest';
import assert from 'node:assert';
import { ALIMENTOS_BASE, CATEGORIAS, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  ajusteNoItem, aplicaAjusteNoArroz, arrozDoAjuste, diaInterpretavel, diasInterpretaveis,
  fechaDia, fmtKg, itemEntra, listaDeCompras, minutosDe, quantidadePrescrita, refeicaoEntra,
  refeicoesDeHoje, resumoDaRefeicao, tiraMarcaDeArroz, totalDaRefeicao, totalDoDia, totalDoItem
} from '../../src/dominio/nutricao/calculo';
import { migraPlano4 } from '../../src/dominio/migracoes';
import type { Estado } from '../../src/dominio/tipos';
import type { DiaComidaHist, Item } from '../../src/dominio/nutricao/tipos';

const cat = ALIMENTOS_BASE;

test('a prescrição chegou inteira do plano original', () => {
  assert.strictEqual(Object.keys(cat).length, 37, '37 alimentos na biblioteca');
  assert.strictEqual(PLANO_BASE.length, 7, 'sete refeições');
  assert.deepStrictEqual(PLANO_BASE.map(r => r.id),
    ['pre', 'treino', 'pos', 'almoco', 'lanche', 'jantar', 'ceia'],
    'a ceia entrou no plano 11, e o Neston no catálogo com ela');
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
  assert.strictEqual(arrozDoAjuste(200, 0), 200, 'sem ajuste, o prato não se mexe');
  assert.strictEqual(arrozDoAjuste(200, 1), 320, 'o passo de 120 g é múltiplo de 15');
  assert.strictEqual(arrozDoAjuste(200, -1), 80);
  assert.strictEqual(arrozDoAjuste(50, -1), 0, 'nunca negativo');
});

test('o passo é do DIA e se reparte entre as refeições com arroz', () => {
  // Na prescrição, −60 g no almoço e −60 g no jantar: 120 g pelo dia. Aplicar
  // os 120 em cada prato dobrava o ajuste.
  assert.strictEqual(arrozDoAjuste(250, 1, 2), 310, 'metade do passo em cada prato');
  assert.strictEqual(arrozDoAjuste(250, -1, 2), 190);
  assert.strictEqual(arrozDoAjuste(250, 2, 2), 370, 'dois passos valem o dobro');
});

test('desfazer o saldo devolve o prato ao que era', () => {
  const depois = arrozDoAjuste(250, 1, 2);
  assert.strictEqual(arrozDoAjuste(depois, -1, 2), 250, 'ida e volta sem deriva');
});

// ---------- o desfazer, que não recalcula ----------
//
// "Com o passo na grade de 15 g, ida e volta são exatas" só vale enquanto a
// CONTAGEM de pratos com arroz for a mesma na ida e na volta. Mexer no plano é
// normal, e aí o desfazer recalculado tirava comida em silêncio.

/** Dois pratos de arroz na prescrição, como o plano os escreve. */
function doisPratos(): Item[] {
  return [{ f: 'arroz', q: 250, arroz: true }, { f: 'arroz', q: 250, arroz: true }];
}

test('aplicar reparte o passo e grava quanto deu a cada item', () => {
  const itens = doisPratos();
  aplicaAjusteNoArroz(itens, 1);
  assert.deepStrictEqual(itens.map(i => i.q), [310, 310]);
  assert.deepStrictEqual(itens.map(i => i.ajq), [60, 60], 'o que cada prato recebeu');
  assert.deepStrictEqual(itens.map(quantidadePrescrita), [250, 250],
    'e a prescrição continua legível por baixo');
});

test('o desfazer não depende da contagem de agora', () => {
  // O defeito, em aritmética nua: somou com dois pratos, desfaz com um.
  const itens = doisPratos();
  aplicaAjusteNoArroz(itens, 1);
  const sobrou = [itens[1]];                       // o outro prato perdeu a marca
  aplicaAjusteNoArroz(sobrou, 0);
  assert.strictEqual(sobrou[0].q, 250, 'volta à prescrição, e não a 190');
  assert.strictEqual(sobrou[0].ajq, undefined, 'e o registro sai: zero não se grava');
});

test('aplicar o mesmo saldo duas vezes não acumula', () => {
  const itens = doisPratos();
  aplicaAjusteNoArroz(itens, -1);
  aplicaAjusteNoArroz(itens, -1);
  assert.deepStrictEqual(itens.map(i => i.q), [190, 190], 'a base é a prescrição, não o prato de agora');
  assert.deepStrictEqual(itens.map(i => i.ajq), [-60, -60]);
});

test('o corte que esbarra no zero grava o que deu, não o que pediu', () => {
  // Um passo de −120 num prato de 50 g só consegue tirar 50. Gravar −120 faria
  // o desfazer devolver 120 e o prato subir acima da prescrição.
  const itens: Item[] = [{ f: 'arroz', q: 50, arroz: true }];
  aplicaAjusteNoArroz(itens, -1);
  assert.strictEqual(itens[0].q, 0);
  assert.strictEqual(itens[0].ajq, -50, 'o que ele deu');
  aplicaAjusteNoArroz(itens, 0);
  assert.strictEqual(itens[0].q, 50, 'e a volta é a prescrição, não 120');
});

test('perder a marca devolve a parte daquele item', () => {
  const itens = doisPratos();
  aplicaAjusteNoArroz(itens, 2);
  assert.deepStrictEqual(itens.map(i => i.q), [370, 370]);

  tiraMarcaDeArroz(itens[0]);
  assert.strictEqual(itens[0].q, 250, 'devolve os 120 que recebeu');
  assert.strictEqual(itens[0].arroz, undefined, 'e sai da alavanca do ajuste');
  assert.strictEqual(itens[0].ajq, undefined);
  assert.strictEqual(itens[1].q, 370, 'o outro prato não é tocado');
  assert.strictEqual(itens[1].ajq, 120);
});

test('o registro do ajuste não entra em conta nenhuma', () => {
  // `ajq` é contabilidade do ajuste, não comida: quem soma kcal soma `q`, e `q`
  // já é o prato de hoje. Se ele entrasse em `totalDoItem`, o alvo calórico — e
  // por ele o `tot` congelado de cada dia fechado — passaria a depender de um
  // campo que existe para poder ser desfeito.
  //
  // QUEBRA EM SENTIDO OPOSTO para esta negativa: fazer `totalDoItem` usar
  // `q − ajq` deixa isto vermelho na hora. Verbo inerte não passa daqui.
  const comRegistro = totalDoItem({ f: 'arroz', q: 310, arroz: true, ajq: 60 }, cat);
  const semRegistro = totalDoItem({ f: 'arroz', q: 310 }, cat);
  assert.deepStrictEqual(comRegistro, semRegistro, 'o mesmo prato soma o mesmo');
  assert.strictEqual(Math.round(comRegistro.kcal), 397, '310 g a 128 kcal/100 g');
});

test('item sem registro de ajuste é prato intocado', () => {
  // Ausente = zero. É o caso dominante: todo item que o ajuste nunca moveu.
  assert.strictEqual(quantidadePrescrita({ f: 'feijao', q: 50 }), 50);
  assert.strictEqual(ajusteNoItem({ f: 'feijao', q: 50 }), 0);
  assert.strictEqual(ajusteNoItem({ f: 'arroz', q: 310, ajq: 60 }), 60);
  // e lixo em disco não vira NaN no prato
  assert.strictEqual(ajusteNoItem({ f: 'arroz', q: 310, ajq: NaN }), 0);
  assert.strictEqual(quantidadePrescrita({ f: 'arroz', q: 310, ajq: NaN }), 310);
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
  assert.strictEqual(r.refeicoes, PLANO_BASE.length, 'a semente é o plano inteiro de hoje');
  assert.strictEqual(r.cadencia, true);
  assert.strictEqual(S.comida.plano!.length, PLANO_BASE.length);
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

// ---------- a trava de adesão ----------
// O peso responde à ingestão REAL, não à prescrição. Numa semana de saídas,
// reduzir o plano-base tiraria comida dos dias em que ele seguiu.

const diaHist = (d: string, extra: Partial<DiaComidaHist> = {}): DiaComidaHist =>
  Object.assign({ d, done: { cafe: 1 }, agua: 0, escala: {},
                  tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: 1 }, extra) as DiaComidaHist;

test('seguir o plano e sair sabendo o que comeu contam igual', () => {
  assert.strictEqual(diaInterpretavel(diaHist('2026-09-10')), true, 'ausente = seguiu');
  assert.strictEqual(diaInterpretavel(diaHist('2026-09-10', { aderencia: 'plano' })), true);
  assert.strictEqual(diaInterpretavel(diaHist('2026-09-10', { aderencia: 'fora' })), true,
    'saída registrada ainda deixa a semana legível');
});

test('dia perdido não conta, mesmo com refeições marcadas', () => {
  assert.strictEqual(diaInterpretavel(diaHist('2026-09-10', { aderencia: 'perdido' })), false,
    'o que ele marcou não descreve o que entrou');
});

test('dia mudo não conta: silêncio não é registro', () => {
  assert.strictEqual(diaInterpretavel(diaHist('2026-09-10', { done: {} })), false);
});

test('a contagem olha a janela inteira, não só os dias que existem', () => {
  const hoje = '2026-09-19';
  const hist = [
    diaHist('2026-09-18'), diaHist('2026-09-17', { aderencia: 'fora' }),
    diaHist('2026-09-16', { aderencia: 'perdido' }), diaHist('2026-09-15', { done: {} }),
    diaHist('2026-08-20')                                   // fora da janela
  ];
  assert.strictEqual(diasInterpretaveis(hist, 14, hoje), 2, 'dois dos cinco');
});

test('fechaDia congela como o dia foi', () => {
  const dia = { data: '2026-09-19', done: { cafe: 1 }, agua: 0, escala: {},
                aderencia: 'fora' as const };
  const h = fechaDia(dia as never, PLANO_BASE, cat, 1, 0);
  assert.strictEqual(h.aderencia, 'fora', 'senão o passado vira "seguiu o plano"');
});
