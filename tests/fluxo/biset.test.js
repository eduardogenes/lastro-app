// O PAR EM CIRCUITO na tela do treino (Fase A2/A3): o descanso é o da estação
// 2, "Separar hoje" volta ao exercício comum, tocar a outra estação troca a
// vez, e a pegada da dica vira linha própria.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function comPar() {
  const a = await app();
  a.v('go', 'E');
  // cirurgia de fixture: o par 4 ↔ 5, com descansos diferentes para distinguir
  a.E('S.prog.E.ex[4].bi = 1; S.prog.E.ex[4].d = 150; S.prog.E.ex[5].d = 75;');
  // a dica é do exercício (o catálogo), não do slot
  a.E("const id = S.prog.E.ex[4].id; S.ex[id] = Object.assign({}, S.ex[id], { cue: 'pegada: neutra na corda; costas no encosto', m: Date.now() }); montaCatalogo();");
  a.v('render');
  a.v('toggle', 4);
  a.v('ctx.setFocoV3', 4, 0);
  return a;
}

test('o descanso do par é o da estação 2', async () => {
  const a = await comPar();
  a.v('ctx.fazSerieV3', 15, 12);
  a.v('ctx.fazSerieV3', 20, 12);
  const d = a.vJ('ctx.descansoV3');
  assert.ok(d, 'descansa no fim da rodada');
  assert.strictEqual(d.total, 75000, 'o descanso é o da estação 2 (75 s), não o da 1 (150 s)');
  a.fechar();
});

test('a tela diz o que vem: a outra estação, ou o descanso', async () => {
  const a = await comPar();
  const f = a.vJ('ctx.focoV3');
  assert.strictEqual(f.par.n, 1);
  assert.strictEqual(f.par.depois.k, 'segue');
  assert.strictEqual(f.par.estacoes.length, 2);
  assert.ok(f.par.estacoes[0].ativa && !f.par.estacoes[1].ativa);
  a.v('ctx.fazSerieV3', 15, 12);
  const g = a.vJ('ctx.focoV3');
  assert.strictEqual(g.par.depois.k, 'descanso');
  assert.strictEqual(g.par.estacoes[0].pontos[0], 'f', 'a grade marca a série feita');
  assert.strictEqual(g.par.estacoes[1].pontos[0], 'a', 'e a de agora');
  a.fechar();
});

test('tocar a outra estação troca a vez, e o circuito continua certo', async () => {
  const a = await comPar();
  a.v('ctx.trocaVezV3');
  assert.strictEqual(a.vJ('ctx.focoV3').i, 5, 'começa pela estação 2');
  a.v('ctx.fazSerieV3', 20, 12);
  assert.strictEqual(a.vJ('ctx.descansoV3'), null, 'a estação 1 ainda deve a rodada: sem pausa');
  assert.strictEqual(a.vJ('ctx.focoV3').i, 4);
  a.v('ctx.fazSerieV3', 15, 12);
  assert.ok(a.vJ('ctx.descansoV3'), 'agora a rodada fechou');
  assert.strictEqual(a.vJ('ctx.descansoV3').total, 75000, 'fechando pela estação 1, o descanso continua o da estação 2');
  a.fechar();
});

test('"Separar hoje": o par vira dois exercícios comuns, com o próprio descanso', async () => {
  const a = await comPar();
  await a.v('ctx.separaParV3', 4, true);
  assert.deepStrictEqual(JSON.parse(a.E('JSON.stringify(S.sessao.separar)')), [a.E('slotDe(view.day, 4)')], 'fica na sessão de hoje');
  a.v('ctx.setFocoV3', 4, 0);
  assert.strictEqual(a.vJ('ctx.focoV3').par, null, 'sem tela de par');
  a.v('ctx.fazSerieV3', 15, 12);
  const d = a.vJ('ctx.descansoV3');
  assert.ok(d, 'separado, cada série descansa');
  assert.strictEqual(d.total, 150000, 'com o descanso do próprio exercício');
  const l = a.vJ('ctx.listaV3');
  assert.strictEqual(l.exercicios[4].par.separado, true, 'a lista mostra o par separado hoje');
  await a.v('ctx.separaParV3', 4, false);
  a.v('ctx.paraDescanso');
  a.v('ctx.setFocoV3', 4, 1);
  assert.ok(a.vJ('ctx.focoV3').par, 'juntou de novo');
  a.fechar();
});

test('a pegada sai da dica e vira linha própria', async () => {
  const a = await comPar();
  const f = a.vJ('ctx.focoV3');
  assert.strictEqual(f.pegada, 'neutra na corda');
  assert.strictEqual(f.ex.cue, 'costas no encosto', 'a dica não repete a pegada');
  assert.strictEqual(f.par.estacoes[0].pegada, 'neutra na corda');
  a.fechar();
});

test('a lista do treino marca o par', async () => {
  const a = await comPar();
  const l = a.vJ('ctx.listaV3');
  assert.deepStrictEqual([l.exercicios[4].par.lado, l.exercicios[5].par.lado], ['a', 'b']);
  assert.strictEqual(l.exercicios[3].par, null);
  a.fechar();
});
