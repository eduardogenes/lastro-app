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
// a série tem UMA régua: o par escolhe o que ela muda (1 = carga, 2 = repetição),
// e a seta do teclado anda um passo nela
const maisNa = async (a, qual, n = 1) => {
  a.clicar(qual === 1 ? '[data-a="par-carga"]' : '[data-a="par-reps"]');
  await a.esperar(5);
  for (let i = 0; i < n; i++) {
    a.E(`document.querySelector('.v3-regua-r').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
    await a.esperar(5);
  }
};
// o par diz o que "Feito" vai gravar
const noPar = a => (a.texto('[data-a="par-carga"]') || '') + ' × ' + (a.texto('[data-a="par-reps"]') || '');

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

test('o par e a régua dizem o que a carga conta, por lado ou em cada mão', async () => {
  const a = await emFoco();
  a.clicar('[data-a="par-carga"]');
  for (const [tipo, unidade, falada] of [['lado', 'kg por lado', 'quilos por lado'], ['halter', 'kg em cada mão', 'quilos em cada mão']]) {
    a.E(`S.carga[logKey(view.day, 0)] = '${tipo}'; render()`);
    await a.esperar();
    assert.match(a.texto('[data-a="par-carga"]'), new RegExp(unidade));
    assert.ok(a.$('[role="slider"]').getAttribute('aria-valuetext').endsWith(falada));
  }
  a.fechar();
});

test('a régua muda a carga antes de gravar, e corrigir uma série feita não abre outra', async () => {
  const a = await emFoco();
  await maisNa(a, 1, 2);                       // 60 → 65 (passo de 2,5)
  await maisNa(a, 2, 1);                       // 8 → 9
  assert.ok(/65 × .*9$/.test(noPar(a)), noPar(a));
  assert.ok(/^Feito$/.test(a.texto('[data-a="serie-feita"]')), 'o principal é só "Feito": o número está no par');
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
  // a sugestão é um aviso logo abaixo das séries, com o porquê e Manter / Subir
  assert.ok(/Subir para/.test(a.texto('[data-a="sugestao-subir"]')), a.texto('[data-a="sugestao-subir"]'));
  a.clicar('[data-a="sobe-sobe"]');
  await a.esperar();
  assert.ok(new RegExp(String(f.sobe).replace('.', ',')).test(a.texto('[data-a="par-carga"]')), noPar(a));
  assert.ok(!a.$('[data-a="sugestao-subir"]'), 'respondida, sai');
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
  assert.match(a.texto('.v3-folha'), /Mudar hoje/);
  a.clicar('[data-a="mudar-dor"]');
  await a.esperar();
  assert.match(a.texto('.v3-folha'), /Treinador · Apareceu/);
  a.v('ctx.fechaFolha');
  await a.esperar();
  a.clicar('[data-a="mudar-trocar"]');
  await a.esperar();
  assert.ok(a.$('#catalogo-busca'));
  a.v('ctx.fechaFolha');
  await a.esperar();
  a.clicar('[data-a="mudar-pular"]');
  await a.esperar(80);
  assert.strictEqual(a.vJ('ctx.focoV3').i, 1, 'o pulado sai da fila');
  assert.ok(a.E('S.sessao && S.sessao.pulados.length === 1'), 'e fica anotado na sessão');
  a.fechar();
});

test('Trocar por outro só oferece a mesma grandeza e leva a série para o substituto', async () => {
  const a = await emFoco();
  try {
    const original = a.E('treino(view.day).ex[0].id');
    const unidades = a.J('Object.fromEntries(Object.entries(CAT).map(([id, ex]) => [id, unidadeDe(ex)]))');
    assert.equal(unidades[original], null);
    assert.equal(unidades['remo-ergometro'], 'm');
    a.preencher(0, 0, 60, 10);
    await a.esperar();
    a.clicar('[data-a="mudar-ex"]');
    await a.esperar();
    a.clicar('[data-a="mudar-trocar"]');
    await a.esperar();
    const opcoes = () => a.$$('.v3-folha .v3-lin[data-a^="catalogo-"]').map(b => b.dataset.a.slice('catalogo-'.length));
    assert.ok(opcoes().length > 0);
    assert.deepEqual(opcoes().filter(id => unidades[id] !== null), []);
    a.digitar('catalogo-busca', 'remo');
    await a.esperar();
    assert.equal(a.$('[data-a="catalogo-remo-ergometro"]'), null);
    assert.deepEqual(opcoes().filter(id => unidades[id] !== null), []);
    a.digitar('catalogo-busca', 'supino');
    await a.esperar();
    const substituto = opcoes().find(id => id !== original && unidades[id] === null);
    assert.ok(substituto, 'a busca encontrou outro supino com carga e repetições');
    a.clicar('[data-a="catalogo-' + substituto + '"]');
    await a.esperar();
    const { sessao, logs } = a.S();
    const registro = logs[substituto].find(l => l.sid === sessao.sid && l.sl === original);
    assert.deepEqual(registro.sets[0].slice(0, 2), [60, 10]);
    assert.equal(registro.u, undefined);
    assert.ok(!(logs[original] || []).some(l => l.sid === sessao.sid), 'a série saiu do exercício original');
  } finally { a.fechar(); }
});

test('a troca usa a unidade prescrita na posição, inclusive para um remo prescrito em calorias', async () => {
  const a = await emFoco();
  try {
    a.E("Object.assign(S.prog[view.day].ex[0], { id: 'remo-ergometro', u: 'cal', q: 15 }); render()");
    await a.esperar();
    a.clicar('[data-a="mudar-ex"]');
    await a.esperar();
    a.clicar('[data-a="mudar-trocar"]');
    await a.esperar();
    const oferecidos = a.$$('.v3-folha .v3-lin[data-a^="catalogo-"]').map(b => b.dataset.a.slice('catalogo-'.length));
    const calorias = a.J("Object.keys(CAT).filter(id => unidadeDe(CAT[id]) === 'cal')");
    assert.ok(oferecidos.includes('assault-bike'));
    assert.ok(oferecidos.every(id => calorias.includes(id)));
  } finally { a.fechar(); }
});

test('intervalo longo: o aviso pergunta, "pôr em dia" grava as que faltam com os números da última vez, marcadas, sem descanso', async () => {
  const a = await emFoco();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(40);
  a.v('ctx.paraDescanso');
  await a.esperar();
  assert.ok(!a.$('[data-a="aviso-intervalo"]'), 'logo depois, nada a perguntar');
  a.viajar(20 * 60000);
  a.v('ctx.setFocoV3', 0, 1);
  a.E('view.focoV3 = null');
  await a.esperar();
  assert.ok(/Faz 20 minutos desde a última série/.test(a.texto('[data-a="aviso-intervalo"]')), a.texto('[data-a="aviso-intervalo"]'));

  // pôr em dia é TELA (destino), com uma linha por exercício
  a.clicar('[data-a="intervalo-em-dia"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-cab') && /Pôr em dia/.test(a.texto('.v3-cab h1')), 'a tela');
  const linha0 = a.$('[data-a="emdia-0"]').closest('.v3-emdia-l');
  assert.ok(/2 séries · 7 6 rep/.test(linha0.textContent), 'as duas que faltam no primeiro, com as repetições que vai gravar: ' + linha0.textContent);
  assert.ok(/60/.test(linha0.querySelector('.v3-passo-c').textContent), 'e a carga');
  // "Fiz tudo como da última vez": um toque grava tudo o que falta
  a.clicar('[data-a="emdia-tudo"]');
  await a.esperar(60);
  assert.ok(!a.E('!!view.porEmDia'), 'e volta ao treino');
  const h = JSON.parse(historicoDoA0(a));
  assert.deepStrictEqual(h[1].sets.map(s => s && s.slice(0, 2)), [[60, 8], [60, 7], [60, 6]]);
  assert.strictEqual(h[1].dp, 1, 'o registro diz que foi posto em dia');
  assert.strictEqual(a.E('!!timerFim'), false, 'e nenhum descanso começou');
  a.relogioNormal();
  a.fechar();
});

test('pôr em dia: só o marcado entra, com a carga acertada na tela, e a marca sobrevive ao rascunho refeito', async () => {
  const a = await emFoco();
  a.v('ctx.abrePorEmDia');
  await a.esperar(40);
  assert.ok(/Marque o que você fez/.test(a.texto('[data-a="emdia-ok"]')), 'sem marca, nada a guardar');
  assert.strictEqual(a.$('[data-a="emdia-ok"]').getAttribute('aria-disabled'), 'true', 'e o principal espera, sem sair do foco');
  // acertar a carga marca o exercício
  a.clicar('[data-a="emdia-mais-0"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="emdia-0"]').getAttribute('aria-checked'), 'true', 'mexer na carga marca');
  a.clicar('[data-a="emdia-ok"]');
  await a.esperar(60);
  let h = JSON.parse(historicoDoA0(a));
  const passo = a.E('passoDaCarga(cargaTipo(logKey(view.day, 0), treino(view.day).ex[0]))');
  assert.deepStrictEqual(h[1].sets.map(s => s && s.slice(0, 2)), [[60 + passo, 8], [60 + passo, 7], [60 + passo, 6]],
    'todas as que faltavam, com as repetições da última vez e a carga acertada');
  assert.ok(!(a.E('(S.logs[logKey(view.day, 1)] || []).length') > 0), 'o exercício sem marca ficou de fora');

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
  assert.match(a.texto('.v3-acao-q'), /guardado · \d+ min/);
  assert.doesNotMatch(a.toast(), /Encerrei/);
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

test('a série que o aparelho recusou fica na tela: sem descanso, com a caixa de atenção, e ninguém ouve "guardei"', async () => {
  const a = await emFoco();
  a.encheCota();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(900);                         // a gravação é represada 700 ms
  assert.ok(a.$('[data-a="serie-falhou"]'), 'a caixa "A série não foi guardada."');
  assert.strictEqual(a.E('!!timerFim'), false, 'o descanso que ela começou parou');
  assert.ok(!a.$('.v3-desc'), 'e a tela é a da série');
  assert.ok(/não foi guardada/.test(a.texto('#serie-dita')), 'o anúncio diz a verdade: ' + a.texto('#serie-dita'));
  // o aparelho voltou a aceitar: tentar de novo grava, e a caixa sai
  a.encheCota(false);
  a.clicar('[data-a="serie-tenta"]');
  await a.esperar(900);
  assert.ok(!a.$('[data-a="serie-falhou"]'), 'guardado, a caixa sai');
  a.fechar();
});
