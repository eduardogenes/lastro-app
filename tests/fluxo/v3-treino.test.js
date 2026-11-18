// O treino em foco no visual novo (direção 3, Fase 3): uma série por tela. O
// que se cobra é que a série entra pela MESMA porta do modo antigo e chega ao
// histórico (o app já perdeu série nessa fronteira), que o descanso toma a
// tela, que "sobraram quantas?" grava o RIR da série que acabou, e as folhas
// da lista e de mudar o exercício. Especificação: docs/redesign-3/03-lotes.md.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/** O histórico do treino A (60 × 8, 7, 6), e a rotação parada para o próximo ser o A. */
function comHistorico(sets) {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: sets || [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}
async function emFoco(opcoes) {
  const a = await app(opcoes || comHistorico());
  await a.pronto();
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  return a;
}
// direto do histórico gravado (S.logs), com a sessão em curso
const historicoDoA0 = a => a.E(`JSON.stringify(S.logs[logKey(view.day, 0)])`);
const maisNa = async (a, qual, n = 1) => {
  for (let i = 0; i < n; i++) { a.clicar(a.$$('.v3-serie-g')[qual - 1].querySelector('.v3-regua-p button:last-child')); await a.esperar(5); }
};

test('a série feita entra pelo caminho de sempre: rascunho, histórico e sessão aberta, e o descanso toma a tela', async () => {
  const a = await emFoco();
  const f = a.vJ('ctx.focoV3');
  assert.deepStrictEqual([f.i, f.k], [0, 0], 'a primeira série que falta');
  assert.strictEqual(f.carga, 60, 'parte da carga da última vez');
  assert.strictEqual(f.reps, 8);
  assert.ok(/da última vez: 60 × 8/.test(a.texto('.v3-serie-ant')), a.texto('.v3-serie-ant'));
  assert.strictEqual(a.E('!!S.sessao'), false, 'nenhuma sessão antes da primeira série');

  a.clicar('[data-a="serie-feita"]');
  await a.esperar(60);
  assert.ok(a.E('!!S.sessao'), 'a sessão nasceu na primeira série, como no modo antigo');
  const h = JSON.parse(historicoDoA0(a));
  assert.strictEqual(h.length, 2, 'uma entrada nova no histórico, a de hoje');
  assert.strictEqual(h[1].sid, a.E('S.sessao.sid'), 'da sessão aberta');
  assert.deepStrictEqual(h[1].sets[0].slice(0, 2), [60, 8], 'com a série');
  assert.ok(a.$('.v3-desc'), 'o descanso tomou a tela');
  assert.ok(a.E('timerFim > Date.now()'), 'contando');

  a.clicar('.v3-desc .v3-perg-r button:nth-child(3)');   // sobraram 2
  await a.esperar(40);
  assert.strictEqual(a.E('draftPeek(0).s[0][2]'), 2, 'o RIR da série que acabou');
  const h2 = JSON.parse(historicoDoA0(a));
  assert.strictEqual(h2[h2.length - 1].sets[0][2], 2, 'e ele chegou ao histórico');

  a.clicar('[data-a="desc-pula"]');
  await a.esperar();
  const g = a.vJ('ctx.focoV3');
  assert.deepStrictEqual([g.i, g.k], [0, 1], 'a próxima série');
  assert.strictEqual(g.reps, 7, 'partindo da mesma série da última vez');
  a.fechar();
});

test('a régua muda a carga antes de gravar, e corrigir uma série feita não abre outra', async () => {
  const a = await emFoco();
  await maisNa(a, 1, 2);                       // 60 → 65 (passo de 2,5)
  await maisNa(a, 2, 1);                       // 8 → 9
  assert.ok(/Feita: 65 × 9/.test(a.texto('[data-a="serie-feita"]')), a.texto('[data-a="serie-feita"]'));
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  a.v('ctx.paraDescanso');
  a.v('ctx.setFocoV3', 0, 0);
  await a.esperar();
  assert.ok(/Corrigir/.test(a.texto('[data-a="serie-feita"]')), 'a série já feita é corrigida');
  await maisNa(a, 2, 1);
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  const h = JSON.parse(historicoDoA0(a));
  const hoje = h[h.length - 1];
  assert.deepStrictEqual(hoje.sets[0].slice(0, 2), [65, 10], 'corrigida no lugar');
  assert.strictEqual(hoje.sets.filter(Boolean).length, 1, 'sem série a mais');
  assert.strictEqual(a.E('!!timerFim'), false, 'corrigir não reinicia o descanso');
  a.fechar();
});

test('todas no topo da faixa da última vez: pergunta se sobe, e subir põe a carga nova na série', async () => {
  const topo = a => a.E(`treino(view.day).ex[0].r`);
  const a0 = await app(comHistorico());
  await a0.pronto();
  const faixa = topo(a0);
  a0.fechar();
  const t = parseInt(String(faixa).split(/[–-]/)[1], 10);
  const a = await emFoco(comHistorico([[60, t], [60, t], [60, t], [60, t], [60, t]]));
  const f = a.vJ('ctx.focoV3');
  assert.ok(f.sobe > 60, 'há sugestão: ' + f.sobe);
  assert.ok(/Subir para/.test(a.texto('.v3-perg')));
  a.clicar('.v3-perg-r button:first-child');
  await a.esperar();
  assert.ok(new RegExp('Feita: ' + String(f.sobe).replace('.', ',')).test(a.texto('[data-a="serie-feita"]')), a.texto('[data-a="serie-feita"]'));
  a.fechar();
});

test('a lista do treino leva a outro exercício, e pular hoje tira o exercício da fila', async () => {
  const a = await emFoco();
  a.clicar('[data-a="lista-treino"]');
  await a.esperar(40);
  a.clicar('[data-a="lista-ex-1"]');
  await a.esperar(40);
  assert.strictEqual(a.vJ('ctx.focoV3').i, 1, 'foi para o segundo');

  a.v('ctx.setFocoV3', 0, 0);
  a.E('view.focoV3 = null');
  a.clicar('[data-a="mudar-ex"]');
  await a.esperar(40);
  a.clicar('[data-a="mudar-pular"]');
  await a.esperar(80);
  assert.strictEqual(a.vJ('ctx.focoV3').i, 1, 'o pulado sai da fila');
  assert.ok(a.E('S.sessao && S.sessao.pulados.length === 1'), 'e fica anotado na sessão');
  a.fechar();
});

test('intervalo longo: o aviso pergunta, "pôr em dia" grava as que faltam com os números da última vez, marcadas, sem descanso', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  a.v('ctx.paraDescanso');
  await a.esperar();
  assert.ok(!a.$('.v3-serie-int'), 'logo depois, nada a perguntar');
  a.viajar(20 * 60000);
  a.v('ctx.setFocoV3', 0, 1);
  a.E('view.focoV3 = null');
  await a.esperar();
  assert.ok(/Faz 20 min desde a última série/.test(a.texto('.v3-serie-int')), a.texto('.v3-serie-int'));

  a.clicar('[data-a="intervalo-em-dia"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="emdia-0-1"]') && a.$('[data-a="emdia-0-2"]'), 'as duas que faltam no primeiro');
  assert.ok(/60 × 7/.test(a.texto('[data-a="emdia-0-1"]')), 'com o número que vai gravar');
  a.clicar('[data-a="emdia-ok"]');
  await a.esperar(60);
  const h = JSON.parse(historicoDoA0(a));
  assert.deepStrictEqual(h[1].sets.map(s => s && s.slice(0, 2)), [[60, 8], [60, 7], [60, 6]]);
  assert.strictEqual(h[1].dp, 1, 'o registro diz que foi posto em dia');
  assert.strictEqual(a.E('!!timerFim'), false, 'e nenhum descanso começou');
  a.relogioNormal();
  a.fechar();
});

test('pôr em dia: desmarcar tira a série que não foi feita, e a marca sobrevive ao rascunho refeito', async () => {
  const a = await emFoco();
  a.v('ctx.abreFolha', { k: 'porEmDia' });
  await a.esperar(40);
  a.clicar('[data-a="emdia-0-2"]');
  await a.esperar();
  assert.ok(/Pôr em dia 2 séries/.test(a.texto('[data-a="emdia-ok"]')), a.texto('[data-a="emdia-ok"]'));
  a.clicar('[data-a="emdia-ok"]');
  await a.esperar(60);
  let h = JSON.parse(historicoDoA0(a));
  assert.deepStrictEqual(h[1].sets.map(s => s && s.slice(0, 2)), [[60, 8], [60, 7], null], 'a terceira ficou de fora');

  // o rascunho refeito do histórico (o app reaberto) e uma série ao vivo depois
  a.E('S.draft = null; hidrataDraft(view.day);');
  a.v('ctx.setFocoV3', 0, 2);
  await a.esperar();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  h = JSON.parse(historicoDoA0(a));
  assert.strictEqual(h[1].dp, 1, 'a marca não se perdeu na volta do rascunho');
  a.fechar();
});

test('encerrar: o fim fica na tela com o resumo, e o "vira regra?" decide pela fila de sempre', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  a.v('ctx.paraDescanso');
  a.E('ACOES.maisUmaSerie(0)');                // uma mudança do dia: o primeiro ganha uma série
  await a.esperar();
  const sid = a.E('S.sessao.sid');
  a.v('ctx.abreFolha', { k: 'menuSessao' });
  await a.esperar(40);
  a.clicar('[data-a="encerrar"]');
  await a.esperar(60);
  assert.ok(a.perguntas().some(q => /pendente/.test(JSON.stringify(q))), 'pergunta pelos pendentes, como sempre: ' + JSON.stringify(a.perguntas()));
  await a.esperar(120);
  assert.strictEqual(a.E('S.sessao'), null, 'encerrado');
  // o título da tela do fim diz o resumo (é tela de ação desde a peça 2 do design system)
  assert.ok(/1 série\. .* fechado\./.test(a.texto('.v3-acao h1')), a.texto('.v3-acao h1'));
  assert.ok(a.$('[data-a="regra-sempre-0"]'), 'a mudança do dia pergunta se vira regra');
  assert.ok(a.E(`S.promoPendente.some(g => g.sid === ${sid})`), 'na fila de sempre');

  a.clicar('[data-a="regra-hoje-0"]');
  await a.esperar(80);
  assert.ok(!a.$('[data-a="regra-sempre-0"]'), 'respondida, sai');
  assert.ok(!a.E(`(S.promoPendente || []).some(g => g.sid === ${sid})`), 'e sai da fila');
  a.clicar('[data-a="encerrado-fecha"]');
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, false, 'fechar sai do modo');
  a.fechar();
});

test('"não, só parei" tira o aviso até a próxima série', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  a.v('ctx.paraDescanso');
  a.viajar(20 * 60000);
  a.E('view.focoV3 = null');
  a.v('ctx.setFocoV3', 0, 1);
  a.E('view.focoV3 = null');
  await a.esperar();
  a.clicar('[data-a="intervalo-parei"]');
  await a.esperar();
  assert.ok(!a.$('.v3-serie-int'));
  a.relogioNormal();
  a.fechar();
});
