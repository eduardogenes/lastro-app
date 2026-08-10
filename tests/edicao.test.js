// Edição no meio do treino. A regra central: mexer no treino de hoje NÃO
// mexe no programa oficial. A decisão vem no fim da sessão, uma a uma, e o
// padrão é sempre o conservador.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, DIA } = require('./harness');

// abre a edição no dia da rotação
async function editando(o) {
  const a = await app(o);
  a.E('modoEdicao(true)');
  return a;
}

test('editar só aparece no treino do dia', async () => {
  const a = await app();
  assert.ok(a.$('.edlink'), 'no dia da rotação, dá para editar');
  a.E('go("F")');
  assert.strictEqual(a.$('.edlink'), null, 'outro dia é edição de programa, não de sessão');
  a.fechar();
});

test('mudar séries vale para hoje e não toca no oficial', async () => {
  const a = await editando();
  const oficial = a.E('S.prog.A.ex[2].s');
  a.E('mudaSeries(2, 1)');

  assert.strictEqual(a.E('treino("A").ex[2].s'), oficial + 1, 'o treino de hoje mudou');
  assert.strictEqual(a.E('S.prog.A.ex[2].s'), oficial, 'o oficial ficou onde estava');

  const mods = a.J('S.mods.list');
  assert.strictEqual(mods.length, 1);
  assert.deepStrictEqual([mods[0].k, mods[0].de, mods[0].para], ['sets', oficial, oficial + 1]);
  a.fechar();
});

test('voltar ao valor original apaga o mod em vez de registrar ida e volta', async () => {
  const a = await editando();
  a.E('mudaSeries(2, 1)');
  a.E('mudaSeries(2, 1)');
  assert.strictEqual(a.E('S.mods.list.length'), 1, 'dois toques, uma mudança');
  assert.strictEqual(a.J('S.mods.list')[0].para, a.E('S.prog.A.ex[2].s') + 2);

  a.E('mudaSeries(2, -1)');
  a.E('mudaSeries(2, -1)');
  assert.strictEqual(a.E('S.mods.list.length'), 0, 'voltou ao original: não houve mudança');
  a.fechar();
});

test('a série registrada segue o exercício quando ele muda de posição', async () => {
  const a = await app();
  a.E('toggle(3)');
  a.preencher(3, 0, 50, 10);
  const chave = a.k('A', 3);

  a.E('modoEdicao(true)');
  a.E('moverEx(3, -1)');
  assert.strictEqual(a.k('A', 2), chave, 'subiu uma posição');
  assert.strictEqual(a.log('A', 2).length, 1, 'e o registro veio junto');
  a.fechar();
});

test('adicionar exercício entra só no dia e mantém histórico próprio', async () => {
  const a = await editando();
  const antes = a.E('treino("A").ex.length');
  await a.E('addExercicio("pec-deck")');
  await a.esperar();

  assert.strictEqual(a.E('treino("A").ex.length'), antes + 1);
  assert.strictEqual(a.E('S.prog.A.ex.length'), antes, 'o oficial não cresceu');

  a.E('modoEdicao(false)');
  a.E('toggle(' + antes + ')');
  a.preencher(antes, 0, 40, 12);
  assert.strictEqual(a.J('S.logs["pec-deck"]').length, 1, 'e já registra no histórico dele');
  a.fechar();
});

test('remover exercício tira do dia e apaga o registro da sessão', async () => {
  const a = await app();
  a.E('toggle(1)');
  a.preencher(1, 0, 30, 12);
  const chave = a.k('A', 1);
  assert.ok(a.J('S.logs[' + JSON.stringify(chave) + ']'));

  a.E('modoEdicao(true)');
  await a.E('removerEx(1)');
  await a.esperar();

  assert.notStrictEqual(a.k('A', 1), chave, 'saiu do treino de hoje');
  assert.strictEqual(a.E('S.logs[' + JSON.stringify(chave) + ']'), undefined,
    'e o registro daquela sessão foi junto');
  assert.strictEqual(a.E('S.prog.A.ex.filter(function (x) { return x.id === ' + JSON.stringify(chave) + '; }).length'), 1,
    'mas continua no programa oficial');
  a.fechar();
});

test('cadastrar equipamento novo cria exercício com histórico próprio', async () => {
  const a = await editando();
  a.E('abrirNovoEx()');
  a.digitar('nxn', 'Chest press da academia nova');
  a.E('document.getElementById("nxg").value = "peito superior"');
  a.E('document.getElementById("nxk").checked = true');
  await a.E('criarExercicio()');
  await a.esperar();

  const k = 'chest-press-da-academia-nova';
  assert.strictEqual(a.E('CAT["' + k + '"].g'), 'peito superior');
  assert.strictEqual(a.E('CAT["' + k + '"].c'), 1);
  assert.strictEqual(a.E('CAT["' + k + '"].meu'), 1);
  assert.ok(a.J('treino("A").ex').some(function (x) { return x.id === k; }), 'já entrou no dia');
  a.fechar();
});

test('trocar exercício é uma mudança de hoje, e sai na lista', async () => {
  const a = await editando();
  const orig = a.k('C', 0);
  a.E('go("C")');
  a.E('modoEdicao(true)');
  a.E('setAlt(0, "agachamento-hack")');

  assert.strictEqual(a.E('treino("C").ex[0].id'), 'agachamento-hack');
  assert.strictEqual(a.E('treino("C").ex[0].orig'), 'pendulum-squat');
  assert.strictEqual(a.E('S.prog.C.ex[0].id'), 'pendulum-squat', 'oficial intocado');
  assert.strictEqual(a.J('S.mods.list')[0].k, 'troca');
  a.fechar();
});

test('desfazer uma mudança volta o dia ao programa', async () => {
  const a = await editando();
  const antes = a.E('treino("A").ex[2].s');
  a.E('mudaSeries(2, 1)');
  a.E('desfazMod(0)');
  assert.strictEqual(a.E('treino("A").ex[2].s'), antes);
  assert.strictEqual(a.E('S.mods.list.length'), 0);
  a.fechar();
});

test('finalizar com mudanças abre a decisão, e o padrão é só hoje', async () => {
  const a = await app();
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  a.E('modoEdicao(false)');

  const oficial = a.E('S.prog.A.ex[2].s');
  await a.E('finalizarSessao()');
  await a.esperar();

  assert.ok(a.$('.promo'), 'a tela de decisão aparece antes de encerrar');
  assert.ok(a.E('!!S.sessao'), 'e a sessão continua aberta até ele responder');
  assert.deepStrictEqual(a.J('view.promo.dec'), ['hoje'], 'o padrão é o conservador');

  await a.E('concluirPromo()');
  await a.esperar();
  assert.strictEqual(a.E('S.sessao'), null, 'agora sim encerrou');
  assert.strictEqual(a.E('S.prog.A.ex[2].s'), oficial, 'e o oficial não mudou');
  assert.strictEqual(a.E('S.mods'), null, 'as mudanças do dia morrem com a sessão');
  a.fechar();
});

test('levar para o oficial muda o programa e fica registrado', async () => {
  const a = await app();
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  a.E('modoEdicao(false)');

  const oficial = a.E('S.prog.A.ex[2].s');
  await a.E('finalizarSessao()');
  await a.esperar();
  a.E('decidePromo(0, "oficial")');
  a.E('motivoPromo("decisao")');
  await a.E('concluirPromo()');
  await a.esperar();

  assert.strictEqual(a.E('S.prog.A.ex[2].s'), oficial + 1, 'o programa de amanhã mudou');
  const log = a.J('S.progLog');
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].motivo, 'decisao');
  assert.match(log[0].txt, /séries/);
  a.fechar();
});

test('decidir cada mudança separadamente', async () => {
  const a = await app();
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  a.E('setAlt(2, "elevacao-lateral-com-halteres")');
  a.E('modoEdicao(false)');

  const series = a.E('S.prog.A.ex[2].s');
  await a.E('finalizarSessao()');
  await a.esperar();
  assert.strictEqual(a.E('view.promo.mods.length'), 2);

  // aceita a série, recusa a troca: são decisões sem relação nenhuma
  a.E('decidePromo(0, "oficial")');
  await a.E('concluirPromo()');
  await a.esperar();

  assert.strictEqual(a.E('S.prog.A.ex[2].s'), series + 1);
  assert.strictEqual(a.E('S.prog.A.ex[2].id'), 'elevacao-lateral-na-maquina', 'a troca era só de hoje');
  a.fechar();
});

test('o que mudou fica no registro do dia mesmo sem virar permanente', async () => {
  const a = await app();
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.E('modoEdicao(true)');
  a.E('setAlt(0, "supino-inclinado-com-halteres")');
  a.E('modoEdicao(false)');

  await a.E('finalizarSessao()');
  await a.esperar();
  await a.E('concluirPromo()');
  await a.esperar();

  const m = a.J('S.done[S.done.length-1]');
  assert.ok(Array.isArray(m.mods) && m.mods.length === 1, 'daqui a um mês, o dia se explica');
  assert.match(m.mods[0], /Supino inclinado com halteres/);
  a.fechar();
});

test('finalizar sem mudanças não mostra a tela de decisão', async () => {
  const a = await app();
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  await a.E('finalizarSessao()');
  await a.esperar();
  assert.strictEqual(a.E('view.promo'), null);
  assert.strictEqual(a.E('S.sessao'), null);
  a.fechar();
});

test('encerramento automático não promove nada', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  const oficial = a.E('S.prog.A.ex[2].s');

  // some por cinco horas: o app encerra sozinho
  a.E('S.sessao.ultima = Date.now() - 5*3600*1000; S.sessao.inicio = S.sessao.ultima');
  a.E('encerraSePreciso()');
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.E('S.prog.A.ex[2].s'), oficial, 'sem decisão, nada vira permanente');
  assert.strictEqual(a.E('S.mods'), null);
  a.fechar();
});

test('as mudanças sobrevivem a navegar entre os dias no meio do treino', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  const alvo = a.E('treino("A").ex[2].s');

  a.E('go("E")');
  a.E('go("A")');
  assert.strictEqual(a.E('treino("A").ex[2].s'), alvo, 'o mod não se perde ao trocar de dia');
  assert.strictEqual(a.E('S.mods.list.length'), 1);
  a.fechar();
});

test('as mudanças sobrevivem a fechar e reabrir o app', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  await a.E('save()');
  await a.esperar();
  const bruto = a.gravado();
  a.fechar();

  const b = await app({ estado: bruto });
  await b.esperar();
  assert.strictEqual(b.E('S.mods.list.length'), 1);
  assert.strictEqual(b.E('S.prog.A.ex[2].s') + 1, b.E('treino("A").ex[2].s'));
  b.fechar();
});

test('o impacto no volume aparece na hora de mexer', async () => {
  const a = await editando();
  const imp = a.J('impactoSeries("A", "delt lateral")');
  assert.match(imp.txt, /delt lateral: 13/);
  assert.strictEqual(imp.acima, 0);

  a.E('mudaSeries(2, 1)');
  const depois = a.J('impactoSeries("A", "delt lateral")');
  assert.match(depois.txt, /14/);
  assert.match(depois.txt, /o treinador prescreveu 13/);
  assert.strictEqual(depois.acima, 1, 'acima do alvo é sinalizado');
  a.fechar();
});

test('o alvo do treinador é calculado do programa, nunca transcrito', async () => {
  const a = await app();
  assert.strictEqual(a.E('ALVO_TOTAL'), 125);
  assert.strictEqual(a.E('ALVO["delt lateral"]'), 13);
  assert.strictEqual(a.E('ALVO["dorsal"]'), 12);

  // mexer no programa dele não move o alvo
  a.E('S.prog.A.ex[2].s = 9');   // eram 3
  assert.strictEqual(a.E('ALVO["delt lateral"]'), 13, 'o alvo é do treinador e não se move');
  assert.strictEqual(a.E('seriesDe("delt lateral")'), 19, 'o número dele acompanha a edição');
  a.fechar();
});

test('trocar exercício recém-promovido avisa da regra de 6 a 8 semanas', async () => {
  const a = await app();
  a.E('S.prog.C.ex[0].desde = Date.now() - 14*86400000');
  const imp = a.J('impactoDoMod("C", { k:"troca", slot:"pendulum-squat", por:"belt-squat" })');
  assert.ok(imp, 'exercício com 2 semanas de casa gera aviso');
  assert.match(imp.txt, /6 a 8 semanas/);
  assert.strictEqual(imp.acima, 1);

  // o que veio do treinador (desde 0) não entra nessa conta
  a.E('S.prog.C.ex[0].desde = 0');
  assert.strictEqual(a.J('impactoDoMod("C", { k:"troca", slot:"pendulum-squat", por:"belt-squat" })'), null);
  a.fechar();
});

test('promover uma troca reinicia o relógio do exercício no programa', async () => {
  const a = await app();
  a.E('aplicaAoOficial("C", [{ k:"troca", slot:"pendulum-squat", por:"belt-squat" }], "decisao")');
  assert.strictEqual(a.E('S.prog.C.ex[0].id'), 'belt-squat');
  assert.ok(a.E('S.prog.C.ex[0].desde') > Date.now() - 5000, 'entrou agora, conta a partir de agora');
  a.fechar();
});
