// O estado compartilhado — onde os dois apps viram um produto só.
//
// Estes testes existem porque a fusão tinha dois conflitos de modelo que não se
// resolvem sozinhos, e resolver errado dá duas verdades sobre o mesmo fato:
//
//   1. `dayType`  — treino modelava por SEQUÊNCIA, nutrição por dia da semana.
//   2. o veredito — os dois tinham motor próprio sobre o MESMO peso, com
//                   limiares diferentes (0,15/0,40 aqui, 0,10/0,40 lá).

import { test } from 'vitest';
import assert from 'node:assert';
import {
  CADENCIA_PADRAO, cadenciaPrevista, diaDeHoje, previsaoDoHorizonte, proximoTreino
} from '../../src/dominio/dia';
import { ajusteDoVeredito, veredito } from '../../src/dominio/corpo';
import { e1rmDaSerie, sinalDeForca, tendenciaDeForca } from '../../src/dominio/forca';
import * as forca from '../../src/dominio/forca';
import { ROT_BASE } from '../../src/dominio/programa';
import type { Estado, IdEx, Log } from '../../src/dominio/tipos';
import { DIA, log, pesagens } from './ajuda';

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 4,
    prog: null, rot: null, ex: {}, mods: null, progLog: [],
    cadencia: null, comida: { plano: null, alimentos: {}, ocultos: {} },
    dia: null, ajuste: 0, perfManual: null,
    compras: { comprado: {}, extras: [], removidas: {}, dias: 7 }
  } as Estado, extra);
}

const agora = Date.now();

// ---------- qual treino vem: SEMPRE a rotação ----------

test('a rotação decide qual treino vem, e o dia da semana nunca opina', () => {
  const S = estado({ done: [{ day: 'C', t: agora - DIA, sid: 1, dur: 0 }] });
  assert.strictEqual(proximoTreino(S, ROT_BASE), 'D',
    'a rotação é alfabética desde o plano 5; depois de C vem D');

  // a cadência não muda isso, seja qual for o dia da semana
  const h = diaDeHoje(S, ROT_BASE, CADENCIA_PADRAO, null, agora);
  if (h.cadencia === 'treino') assert.strictEqual(h.treino, 'D');
});

test('treino avulso não move a fila', () => {
  const S = estado({ done: [
    { day: 'C', t: agora - 2 * DIA, sid: 1, dur: 0 },
    { day: 'X', t: agora - DIA, sid: 2, dur: 0, livre: 1 }
  ] });
  assert.strictEqual(proximoTreino(S, ROT_BASE), 'D', 'a avulsa é presença, não sessão');
});

// ---------- hoje é dia de treinar: fato > override > previsão ----------

test('sessão registrada hoje é fato consumado', () => {
  const S = estado({ done: [{ day: 'B', t: agora, sid: 1, dur: 0 }] });
  // domingo é descanso na cadência padrão, mas ele treinou: o fato vence
  const h = diaDeHoje(S, ROT_BASE, ['descanso', 'descanso', 'descanso', 'descanso', 'descanso', 'descanso', 'descanso'], null, agora);
  assert.strictEqual(h.cadencia, 'treino');
  assert.strictEqual(h.treino, 'B', 'a letra vem da própria sessão, não da rotação');
  assert.strictEqual(h.origem, 'registrado');
  assert.strictEqual(h.previsto, false);
});

test('sessão aberta conta como dia de treino', () => {
  const S = estado({ sessao: { day: 'D', inicio: agora, ultima: agora, sid: 1 } });
  const h = diaDeHoje(S, ROT_BASE, CADENCIA_PADRAO, null, agora);
  assert.strictEqual(h.origem, 'aberta');
  assert.strictEqual(h.treino, 'D');
});

test('o override manual vence a previsão, mas não o fato', () => {
  const S = estado();
  const h = diaDeHoje(S, ROT_BASE, CADENCIA_PADRAO, 'descanso', agora);
  assert.strictEqual(h.cadencia, 'descanso');
  assert.strictEqual(h.treino, null);
  assert.strictEqual(h.previsto, false, 'ele disse, então não é palpite');

  const comFato = estado({ done: [{ day: 'A', t: agora, sid: 1, dur: 0 }] });
  assert.strictEqual(diaDeHoje(comFato, ROT_BASE, CADENCIA_PADRAO, 'descanso', agora).cadencia, 'treino',
    'ele marcou descanso e treinou mesmo assim: o registro manda');
});

test('sem fato e sem override, é previsão — e ela se identifica como tal', () => {
  const S = estado();
  const domingo = new Date(2026, 7, 9, 10, 0).getTime();   // 9/8/2026 é domingo
  const h = diaDeHoje(S, ROT_BASE, CADENCIA_PADRAO, null, domingo);
  assert.strictEqual(h.cadencia, 'descanso');
  assert.strictEqual(h.previsto, true, 'a tela precisa poder dizer que é palpite');
  assert.strictEqual(h.origem, 'previsto');
});

test('a cadência é indexada por dia da semana, domingo primeiro', () => {
  const domingo = new Date(2026, 7, 9).getTime();
  const segunda = new Date(2026, 7, 10).getTime();
  assert.strictEqual(cadenciaPrevista(CADENCIA_PADRAO, domingo), 'descanso');
  assert.strictEqual(cadenciaPrevista(CADENCIA_PADRAO, segunda), 'treino');
  assert.strictEqual(cadenciaPrevista([] as never, domingo), 'descanso', 'cadência inválida cai no padrão');
});

// ---------- a previsão só serve para compras ----------

test('o horizonte conta treinos e descansos para a lista de compras', () => {
  const p = previsaoDoHorizonte(CADENCIA_PADRAO, 7, new Date(2026, 7, 10).getTime());
  assert.strictEqual(p.treino + p.descanso, 7);
  assert.strictEqual(p.descanso, 1, 'um domingo em sete dias');

  const duas = previsaoDoHorizonte(CADENCIA_PADRAO, 14, new Date(2026, 7, 10).getTime());
  assert.strictEqual(duas.descanso, 2);
  assert.strictEqual(duas.treino, 12);
});

// ---------- força estimada ----------

test('e1rm por Epley', () => {
  assert.strictEqual(Math.round(e1rmDaSerie(100, 0)), 0, 'sem repetição não há estimativa');
  assert.strictEqual(Math.round(e1rmDaSerie(0, 10)), 0, 'sem carga também não');
  assert.strictEqual(Math.round(e1rmDaSerie(100, 3)), 110);
  assert.strictEqual(Math.round(e1rmDaSerie(60, 10)), 80);
});

test('a tendência compara duas janelas de 2 semanas, por exercício', () => {
  const logs: Record<IdEx, Log[]> = {};
  ['supino', 'remada', 'agacho'].forEach(k => {
    logs[k] = [
      log([[100, 5]], { t: agora - 20 * DIA }),   // janela anterior
      log([[110, 5]], { t: agora - 5 * DIA })     // janela recente: +10%
    ];
  });
  const t = tendenciaDeForca(logs, () => false, agora);
  assert.strictEqual(t.ok, true);
  assert.strictEqual(t.base, 3);
  assert.ok(t.delta > 0.09 && t.delta < 0.11, 'delta ≈ 10%: ' + t.delta);
  assert.strictEqual(t.subindo, true);
});

test('exercício que só existe numa das janelas não entra na conta', () => {
  const logs: Record<IdEx, Log[]> = {
    novo: [log([[200, 5]], { t: agora - 2 * DIA })],   // só na janela recente
    a: [log([[100, 5]], { t: agora - 20 * DIA }), log([[100, 5]], { t: agora - 5 * DIA })],
    b: [log([[100, 5]], { t: agora - 20 * DIA }), log([[100, 5]], { t: agora - 5 * DIA })],
    c: [log([[100, 5]], { t: agora - 20 * DIA }), log([[100, 5]], { t: agora - 5 * DIA })]
  };
  const t = tendenciaDeForca(logs, () => false, agora);
  assert.strictEqual(t.base, 3, 'trocar de aparelho apareceria como salto de força, e é falso');
  assert.strictEqual(t.delta, 0);
});

test('exercício por tempo fica de fora da estimativa de força', () => {
  const logs: Record<IdEx, Log[]> = {
    prancha: [log([[0, 60]], { t: agora - 20 * DIA }), log([[0, 90]], { t: agora - 5 * DIA })]
  };
  const t = tendenciaDeForca(logs, k => k === 'prancha', agora);
  assert.strictEqual(t.base, 0);
  assert.strictEqual(t.ok, false, 'prancha mais longa não é carga maior');
});

test('menos de três exercícios não conclui nada', () => {
  const logs: Record<IdEx, Log[]> = {
    a: [log([[100, 5]], { t: agora - 20 * DIA }), log([[120, 5]], { t: agora - 5 * DIA })]
  };
  assert.strictEqual(tendenciaDeForca(logs, () => false, agora).ok, false);
});

test('variação abaixo de 1% é ruído de anilha, não sinal', () => {
  const logs: Record<IdEx, Log[]> = {};
  ['a', 'b', 'c'].forEach(k => {
    logs[k] = [
      log([[100, 5]], { t: agora - 20 * DIA }),
      log([[100.5, 5]], { t: agora - 5 * DIA })   // +0,5%
    ];
  });
  const t = tendenciaDeForca(logs, () => false, agora);
  assert.strictEqual(t.ok, true);
  assert.strictEqual(t.subindo, false, 'sinal que dispara com ruído faria a dieta oscilar toda semana');
});

test('o override manual vence o cálculo', () => {
  const t = tendenciaDeForca({}, () => false, agora);
  assert.strictEqual(sinalDeForca(t, null), false, 'sem override, vale o cálculo');
  assert.strictEqual(sinalDeForca(t, true), true, 'o app não sabe que ele voltou de duas semanas doente');
  assert.strictEqual(sinalDeForca(t, false), false);
});

// ---------- um motor de veredito, não dois ----------

test('peso parado com força subindo vira observar, não comer mais', () => {
  const body = { peso: pesagens([73.0, 73.05, 73.10]), cintura: [] };
  assert.strictEqual(veredito(body).t, 'Comer mais', 'sem o sinal, a regra é a de antes');
  const v = veredito(body, true);
  assert.strictEqual(v.k, 'observar');
  assert.ok(v.p.includes('recomposição'), v.p);
});

test('a força subindo não salva quem está engordando rápido', () => {
  const body = { peso: pesagens([73.0, 73.6, 74.2]), cintura: [] };
  assert.strictEqual(veredito(body, true).t, 'Comer menos', 'o ramo de cima não depende do sinal');
});

test('o veredito decide e o ajuste executa', () => {
  assert.strictEqual(ajusteDoVeredito(veredito({ peso: pesagens([73.0, 73.05, 73.10]), cintura: [] })), 1);
  assert.strictEqual(ajusteDoVeredito(veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] })), -1);
  assert.strictEqual(ajusteDoVeredito(veredito({ peso: pesagens([73.0, 73.25, 73.5]), cintura: [] })), 0);
});

test('observar e faltam não mexem na comida', () => {
  assert.strictEqual(ajusteDoVeredito({ k: 'observar', t: '', p: '' }), 0,
    'observar não é decisão, e mexer sem decisão é o oposto do que o app faz');
  assert.strictEqual(ajusteDoVeredito({ k: 'faltam', t: '', p: '' }), 0);
});

test('o sinal de força não se chama performance, e nada volta a chamar', () => {
  // `window.performance` existe em todo navegador e sombreava a importação em
  // silêncio: a chamada virava "performance is not a function" só em runtime,
  // dentro do jsdom, com stack de bundle. Mesma armadilha que já obrigou
  // topReps() a não se chamar top(). O teste é barato; o bug foi caro.
  const nomes = ['performance', 'top', 'name', 'status', 'length', 'origin', 'closed'];
  const exportados = Object.keys(forca);
  const colidem = exportados.filter(n => nomes.includes(n));
  assert.deepStrictEqual(colidem, [],
    'nome de export que existe como global do navegador é sombreado em silêncio');
  assert.ok(typeof forca.sinalDeForca === 'function');
});
