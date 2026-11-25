// CORRIGIR UMA SÉRIE FEITA SEM SAIR DO TREINO (hotfix de 25/11): "anotei a
// série 1, passei para a próxima e vi que errei o peso". Tocar na série feita
// (ou no "corrigir" do descanso) abre a correção no lugar. O que se cobra: a
// série muda NO MESMO registro, o descanso que corria continua, o foco volta
// para a série em que se estava, apagar tem Desfazer, e o par também corrige.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

function comHistorico() {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}
async function emFoco() {
  const a = await app(comHistorico());
  await a.pronto();
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  return a;
}
const hoje = a => { const h = JSON.parse(a.E(`JSON.stringify(S.logs[logKey(view.day, 0)])`)); return h[h.length - 1]; };

test('no descanso, "corrigir" muda a série que acabou e o descanso continua correndo', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');                 // 60 × 8
  await a.esperar(60);
  assert.ok(a.E('timerFim > Date.now()'), 'descansando');
  const fimAntes = a.E('timerFim');
  a.clicar('[data-a="desc-corrige"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="corrige-salva"]'), 'a folha de corrigir abriu');
  assert.strictEqual(a.texto('#corrige-carga'), '60', 'parte do que foi anotado');
  a.clicar('[data-a="corrige-carga-menos"]');          // 60 → 57,5
  a.clicar('[data-a="corrige-carga-menos"]');          // → 55
  await a.esperar(5);
  a.clicar('[data-a="corrige-salva"]');
  await a.esperar(40);
  assert.deepStrictEqual(hoje(a).sets[0].slice(0, 2), [55, 8], 'corrigida no mesmo registro');
  assert.strictEqual(hoje(a).sets.filter(Boolean).length, 1, 'sem série a mais');
  assert.strictEqual(a.E('timerFim'), fimAntes, 'o descanso não reiniciou nem parou');
  assert.ok(/Série 1 corrigida: 55 × 8/.test(a.texto('#toast')), a.texto('#toast'));
  a.fechar();
});

test('na tela da série 2, tocar na série 1 feita corrige e volta para a série 2', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(60);
  a.v('ctx.paraDescanso');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.focoV3').k, 1, 'na série 2');
  assert.match(a.$('[data-a="corrige-serie-1"]').getAttribute('aria-label'), /Corrigir série 1: 60 × 8/);
  a.clicar('[data-a="corrige-serie-1"]');
  await a.esperar(40);
  a.clicar('[data-a="corrige-reps-mais"]');             // 8 → 9
  await a.esperar(5);
  a.clicar('[data-a="corrige-salva"]');
  await a.esperar(40);
  assert.deepStrictEqual(hoje(a).sets[0].slice(0, 2), [60, 9]);
  const f = a.vJ('ctx.focoV3');
  assert.deepStrictEqual([f.i, f.k], [0, 1], 'continua na série 2');
  assert.ok(!a.E('!!timerFim'), 'corrigir não abre descanso');
  a.fechar();
});

test('o RIR da série corrigida também muda, e tocar de novo limpa', async () => {
  const a = await emFoco();
  a.v('ctx.fazSerieV3', 60, 8);
  a.v('ctx.paraDescanso');
  a.v('ctx.salvaCorrecaoV3', 0, 0, 60, 8, 2);
  assert.strictEqual(hoje(a).sets[0][2], 2);
  a.v('ctx.salvaCorrecaoV3', 0, 0, 60, 8, null);
  assert.strictEqual(hoje(a).sets[0][2] == null, true, 'sem RIR');
  a.fechar();
});

test('apagar uma série feita tem Desfazer, e o foco fica onde estava', async () => {
  const a = await emFoco();
  a.v('ctx.fazSerieV3', 60, 8);
  a.v('ctx.paraDescanso');
  a.v('ctx.fazSerieV3', 60, 7);
  a.v('ctx.paraDescanso');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.focoV3').k, 2, 'na série 3');
  a.v('ctx.abreFolha', { k: 'corrigeSerie', i: 0, s: 0 });
  await a.esperar(40);
  a.clicar('[data-a="corrige-apaga"]');
  await a.esperar(40);
  assert.strictEqual(a.E('draftPeek(0).s[0][1]'), null, 'a série 1 saiu do rascunho');
  assert.strictEqual(hoje(a).sets[0], null, 'e do histórico (a 2 continua)');
  assert.deepStrictEqual(hoje(a).sets[1].slice(0, 2), [60, 7]);
  assert.strictEqual(a.vJ('ctx.focoV3').k, 2, 'apagar a 1 não puxou o foco para ela');
  a.clicar('[data-a="aviso-acao"]');                    // Desfazer
  await a.esperar(40);
  assert.deepStrictEqual(hoje(a).sets[0].slice(0, 2), [60, 8], 'Desfazer devolveu a série');
  a.fechar();
});

test('a série normal usa − e +, e tocar no número abre a régua para saltos grandes', async () => {
  const a = await emFoco();
  assert.ok(!a.$('.v3-regua'), 'sem régua de saída');
  a.clicar('[data-a="serie-carga-mais"]');
  await a.esperar(5);
  assert.strictEqual(a.texto('#serie-carga'), '62,5', 'um passo do equipamento');
  a.clicar('[data-a="serie-carga-regua"]');
  await a.esperar(5);
  assert.ok(a.$('.v3-regua [role="slider"]'), 'a régua abriu');
  a.clicar('[data-a="serie-carga-regua"]');
  await a.esperar(5);
  assert.ok(!a.$('.v3-regua'), 'e fecha no mesmo toque');
  a.fechar();
});

test('no par, a série feita de cada estação também corrige', async () => {
  const a = await app();
  a.v('go', 'E');
  a.E('S.prog.E.ex[4].bi = 1; S.prog.E.ex[4].d = 150; S.prog.E.ex[5].d = 75;');
  a.v('render');
  a.v('ctx.setFocoV3', 4, 0);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  a.v('ctx.fazSerieV3', 15, 12);
  await a.esperar();
  const est = a.vJ('ctx.focoV3').par.estacoes[0];
  assert.deepStrictEqual(est.feitasTxt, [{ k: 0, txt: '15 × 12' }], 'a estação 1 lista a série feita');
  assert.ok(a.$('[data-a="corrige-par-4-1"]'), 'e ela é tocável na tela do par');
  a.v('ctx.salvaCorrecaoV3', 4, 0, 17.5, 12);
  assert.strictEqual(a.E('draftPeek(4).s[0][0]'), 17.5);
  assert.strictEqual(a.vJ('ctx.focoV3').i, 5, 'o circuito segue na estação 2');
  a.fechar();
});
