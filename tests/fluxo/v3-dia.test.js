// O dia aberto, a sessão passada, o treino que não foi anotado e o pôr em dia
// no visual novo (prerrequisitos da Fase 5). As portas de gravação são as de
// sempre; o que se cobra aqui é que cada tela nova chega nelas.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';
import { dataLocal } from '../../src/dominio/protocolo';

const ONTEM = agoraEstavel(10) - DIA;
const ANTEONTEM = agoraEstavel(10) - 2 * DIA;

/** Um treino A anteontem, às 7h, com duas séries no primeiro exercício. */
async function comTreinoPassado(extra) {
  const a = await app({ aba: 'agora', agora: agoraEstavel(10), estado: Object.assign({ logs: {}, done: [] }, extra || {}) });
  await a.pronto();
  a.E(`(function () {
    const t = ${ANTEONTEM} - 3 * 3600000;
    S.done.push({ t: t, day: 'A', sid: 77, dur: 3600000, fim: 'manual' });
    S.logs[logKey('A', 0)] = [{ t: t, sid: 77, sets: [[40, 10], [40, 9]] }];
  })()`);
  a.v('ctx.fechaModoDeSessao');
  a.v('ctx.comecaAqui');
  await a.esperar();
  return a;
}

async function abreODia(a, t) {
  a.v('ctx.abreDia', t);
  await a.esperar(40);
}

test('dias: "Abrir o dia" leva ao dia aberto novo, com o treino daquele dia', async () => {
  const a = await comTreinoPassado();
  a.v('ctx.vaiPara', 'dias');
  await a.esperar(40);
  a.clicar('[data-a="dia-' + dataLocal(ANTEONTEM) + '"]');
  await a.esperar();
  a.clicar('[data-a="dia-abre"]');
  await a.esperar(40);
  assert.ok(a.$('.v3 .v3-cab h1'), 'a tela nova');
  assert.ok(!a.$('.dia-reg'), 'e não a antiga');
  assert.ok(/Treino A/.test(a.texto('[data-a="dia-sessao"]')), a.texto('[data-a="dia-sessao"]'));
  a.clicar('[data-a="dia-poe"]');
  await a.esperar();
  assert.ok(!a.$('[data-a="poe-descanso"]'), 'dia com treino não aceita a marca de descanso');
  a.fechar();
});

test('o dia vazio: "Foi descanso" marca, e o cardio esquecido entra sem hora', async () => {
  const a = await comTreinoPassado();
  await abreODia(a, ONTEM);
  assert.ok(a.$('.v3-vazio'), 'nenhum treino, nenhum descanso');
  // "Pôr o dia em dia" → "Foi descanso"
  a.clicar('[data-a="dia-poe"]');
  await a.esperar();
  a.clicar('[data-a="poe-descanso"]');
  await a.esperar(60);
  assert.ok(a.E(`!!S.descanso[${JSON.stringify(dataLocal(ONTEM))}]`), 'descanso marcado');
  assert.ok(a.$('[data-a="dia-tira-descanso"]'));
  a.clicar('[data-a="dia-poe"]');
  await a.esperar();
  a.clicar('[data-a="poe-cardio"]');
  await a.esperar();
  a.clicar('[data-a="dia-cardio-novo-m-remo"]');
  await a.esperar();
  a.clicar('[data-a="dia-cardio-grava"]');
  await a.esperar(60);
  const c = a.E('S.cardio[S.cardio.length - 1]');
  assert.strictEqual(c.m, 'remo');
  assert.ok(/Cardio/.test(a.texto('[data-a="dia-cardio"]')), 'e aparece no dia');
  a.fechar();
});

test('a sessão passada: tocar na série abre a folha, e guardar corrige pela porta de sempre', async () => {
  const a = await comTreinoPassado();
  await abreODia(a, ANTEONTEM);
  a.clicar('[data-a="dia-sessao"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-ss-ex'), 'a sessão como foi');
  const id = a.E(`logKey('A', 0)`);
  a.clicar(`[data-a="serie-${id}-1"]`);
  await a.esperar(40);
  assert.ok(a.$('[data-a="passada-guarda"]'), 'a folha da série');
  // o par da folha parte do que foi guardado
  assert.ok(/40/.test(a.texto('[data-a="par-carga"]')) && /9/.test(a.texto('[data-a="par-reps"]')), a.texto('.v3-dupla'));
  a.v('ctx.guardaSeriePassadaV3', 42.5, 8, 2);
  await a.esperar(80);
  assert.deepStrictEqual(a.J(`S.logs[logKey('A', 0)][0].sets[1]`), [42.5, 8, 2]);
  assert.ok(!a.$('[data-a="passada-guarda"]'), 'a folha fecha');
  assert.ok(/42,5 × 8/.test(a.texto(`[data-a="serie-${id}-1"]`)), 'e a sessão mostra');

  // a série que não foi feita nasce no "Lançar"
  const ex1 = a.E(`treino('A').ex[1].id`);
  a.clicar(`[data-a="serie-${ex1}-0"]`);
  await a.esperar(40);
  assert.ok(/Lançar/.test(a.texto('[data-a="passada-guarda"]')));
  a.v('ctx.guardaSeriePassadaV3', 20, 12, null);
  await a.esperar(80);
  assert.deepStrictEqual(a.J(`(S.logs[${JSON.stringify(ex1)}] || [])[0].sets[0]`), [20, 12]);
  a.fechar();
});

test('o histórico de um exercício abre a sessão por cima, e voltar devolve o histórico', async () => {
  const a = await comTreinoPassado();
  a.v('ctx.abreExercicioV3', 'A', 0);
  await a.esperar(40);
  assert.ok(a.$('[data-a="ex-sessao"]'), 'a sessão abre do histórico');
  a.clicar('[data-a="ex-sessao"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-ss-ex'), 'a sessão, por cima');
  a.v('ctx.fechaSessao');
  await a.esperar(40);
  assert.ok(a.$('[data-a="ex-sessao"]'), 'e volta ao histórico');
  a.fechar();
});

test('já treinei e não anotei: um toque grava a presença, e depois vem a hora', async () => {
  const a = await comTreinoPassado();
  a.v('ctx.lancaTreinoDeHoje');
  await a.esperar(40);
  assert.ok(a.$('.v3-pergunta-t'), 'a pergunta: que treino foi');
  const antes = a.E('S.done.length');
  a.clicar('[data-a="lanca-previsto"]');
  await a.esperar(60);
  assert.strictEqual(a.E('S.done.length'), antes + 1, 'gravou');
  assert.ok(a.$('.v3-gravado'));
  a.clicar('[data-a="lanca-por-hora"]');
  await a.esperar();
  assert.ok(a.$('#ahora'), 'a hora, se quiser');
  a.clicar('[data-a="lanca-pronto"]');
  await a.esperar(40);
  assert.ok(!a.$('.v3-gravado'), 'pronto fecha');
  a.fechar();
});

test('pôr o dia em dia: do dia aberto, o primeiro toque grava o dia', async () => {
  const a = await comTreinoPassado();
  await abreODia(a, ONTEM);
  a.clicar('[data-a="dia-poe-em-dia"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-pd-l'), 'a folha nova');
  const id = a.$('.v3-pd-l [data-a^="marca-"]').getAttribute('data-a').split('-')[1];
  a.clicar(`[data-a="marca-${id}-nao"]`);
  await a.esperar(80);
  const h = a.E(`(S.comidaHist || []).filter(x => x.d === ${JSON.stringify(dataLocal(ONTEM))})[0]`);
  assert.ok(h, 'o dia entrou no histórico');
  assert.ok(/./.test(a.texto('.v3-frase')), 'e a frase diz o que ficou');
  a.fechar();
});

test('pôr em dia: escolher a porção numa refeição ainda sem marca grava, como "comeu" naquela porção', async () => {
  const a = await comTreinoPassado();
  await abreODia(a, ONTEM);
  a.clicar('[data-a="dia-poe-em-dia"]');
  await a.esperar(40);
  const ids = a.$$('.v3-pd-l [data-a$="-tudo"]').map(b => b.getAttribute('data-a').split('-')[1]);
  // a primeira linha ganha uma marca (o dia passa a existir); a última fica sem
  a.clicar(`[data-a="marca-${ids[0]}-nao"]`);
  await a.esperar(80);
  const ult = ids[ids.length - 1];
  // o primeiro toque grava o dia sugerido; a última refeição perde a marca (como
  // uma refeição que entrou no plano depois), e fica `vazia`
  a.E(`(function () { const h = S.comidaHist.filter(x => x.d === ${JSON.stringify(dataLocal(ONTEM))})[0]; delete h.done[${JSON.stringify(ult)}]; render(); })()`);
  await a.esperar();
  assert.strictEqual(a.J(`CTX.poeODiaEmDia(${JSON.stringify(dataLocal(ONTEM))}).linhas.filter(l => l.id === ${JSON.stringify(ult)})[0].marca`), 'vazia');
  a.clicar(`[data-a="porcao-${ult}"]`);
  await a.esperar();
  a.clicar(`[data-a="porcao-${ult}-0.5"]`);
  await a.esperar(80);
  const h = a.J(`(S.comidaHist || []).filter(x => x.d === ${JSON.stringify(dataLocal(ONTEM))})[0]`);
  assert.ok(h.done[ult] != null, 'a porção gravou a refeição: ' + JSON.stringify(h.done));
  assert.strictEqual(h.escala[ult], 0.5);
  a.fechar();
});

test('fechar pelo Voltar do sistema solta o estado da folha (catálogo)', async () => {
  const a = await comTreinoPassado();
  a.v('ctx.abrePrograma');
  await a.esperar();
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  a.clicar('[data-a="ed-add"]');
  await a.esperar(40);
  assert.strictEqual(a.E('view.addEx'), true);
  a.v('ctx.fechaFolha');           // é a porta que o Voltar e o Esc usam
  await a.esperar();
  assert.strictEqual(a.E('view.addEx'), false, 'o catálogo não fica aberto por baixo');
  a.fechar();
});
