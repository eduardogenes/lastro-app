// Edição no meio do treino. A regra central: mexer no treino de hoje NÃO
// mexe no programa oficial. A decisão vem no fim da sessão, uma a uma, e o
// padrão é sempre o conservador.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

// abre a edição no dia da rotação
async function editando(o) {
  const a = await app(o);
  a.v('modoEdicao', true);
  return a;
}

test('editar só aparece no treino do dia', async () => {
  const a = await app();
  assert.ok(a.$('.edlink'), 'no dia da rotação, dá para editar');
  a.v('go', 'E');
  assert.strictEqual(a.$('.edlink'), null, 'outro dia é edição de programa, não de sessão');
  a.fechar();
});

test('mudar séries vale para hoje e não toca no oficial', async () => {
  const a = await editando();
  const oficial = a.S().prog.A.ex[4].s;
  a.v('mudaSeries', 4, 1);

  assert.strictEqual(a.vJ('treino', 'A').ex[4].s, oficial + 1, 'o treino de hoje mudou');
  assert.strictEqual(a.S().prog.A.ex[4].s, oficial, 'o oficial ficou onde estava');

  const mods = a.S().mods.list;
  assert.strictEqual(mods.length, 1);
  assert.deepStrictEqual([mods[0].k, mods[0].de, mods[0].para], ['sets', oficial, oficial + 1]);
  a.fechar();
});

test('voltar ao valor original apaga o mod em vez de registrar ida e volta', async () => {
  const a = await editando();
  a.v('mudaSeries', 4, 1);
  a.v('mudaSeries', 4, 1);
  assert.strictEqual(a.S().mods.list.length, 1, 'dois toques, uma mudança');
  assert.strictEqual(a.S().mods.list[0].para, a.S().prog.A.ex[4].s + 2);

  a.v('mudaSeries', 4, -1);
  a.v('mudaSeries', 4, -1);
  assert.strictEqual(a.S().mods.list.length, 0, 'voltou ao original: não houve mudança');
  a.fechar();
});

test('a série registrada segue o exercício quando ele muda de posição', async () => {
  const a = await app();
  a.v('toggle', 3);
  a.preencher(3, 0, 50, 10);
  const chave = a.k('A', 3);

  a.v('modoEdicao', true);
  a.v('moverEx', 3, -1);
  assert.strictEqual(a.k('A', 2), chave, 'subiu uma posição');
  assert.strictEqual(a.log('A', 2).length, 1, 'e o registro veio junto');
  a.fechar();
});

test('adicionar exercício entra só no dia e mantém histórico próprio', async () => {
  const a = await editando();
  const antes = a.vJ('treino', 'A').ex.length;
  await a.v('addExercicio', 'pec-deck');
  await a.esperar();

  assert.strictEqual(a.vJ('treino', 'A').ex.length, antes + 1);
  assert.strictEqual(a.S().prog.A.ex.length, antes, 'o oficial não cresceu');

  a.v('modoEdicao', false);
  a.v('toggle', antes);
  a.preencher(antes, 0, 40, 12);
  assert.strictEqual(a.S().logs["pec-deck"].length, 1, 'e já registra no histórico dele');
  a.fechar();
});

test('remover exercício tira do dia e apaga o registro da sessão', async () => {
  const a = await app();
  a.v('toggle', 1);
  a.preencher(1, 0, 30, 12);
  const chave = a.k('A', 1);
  assert.ok(a.S().logs[chave]);

  a.v('modoEdicao', true);
  await a.v('removerEx', 1);
  await a.esperar();

  assert.notStrictEqual(a.k('A', 1), chave, 'saiu do treino de hoje');
  assert.strictEqual(a.S().logs[chave], undefined,
    'e o registro daquela sessão foi junto');
  assert.strictEqual(a.S().prog.A.ex.filter(function (x) { return x.id === chave; }).length, 1,
    'mas continua no programa oficial');
  a.fechar();
});

test('cadastrar equipamento novo cria exercício com histórico próprio', async () => {
  const a = await editando();
  a.v('abrirNovoEx');
  a.digitar('nxn', 'Chest press da academia nova');
  a.$('#nxg').value = 'peito superior';
  a.$('#nxk').checked = true;
  await a.v('criarExercicio');
  await a.esperar();

  const k = 'chest-press-da-academia-nova';
  assert.strictEqual(a.dado('CAT')[k].g, 'peito superior');
  assert.strictEqual(a.dado('CAT')[k].c, 1);
  assert.strictEqual(a.dado('CAT')[k].meu, 1);
  assert.ok(a.vJ('treino', 'A').ex.some(function (x) { return x.id === k; }), 'já entrou no dia');
  a.fechar();
});

test('trocar exercício é uma mudança de hoje, e sai na lista', async () => {
  const a = await editando();
  const orig = a.k('B', 0);
  a.v('go', 'B');
  a.v('modoEdicao', true);
  a.v('setAlt', 0, 'agachamento-hack');

  assert.strictEqual(a.vJ('treino', 'B').ex[0].id, 'agachamento-hack');
  assert.strictEqual(a.vJ('treino', 'B').ex[0].orig, 'agachamento-no-smith');
  assert.strictEqual(a.S().prog.B.ex[0].id, 'agachamento-no-smith', 'oficial intocado');
  assert.strictEqual(a.S().mods.list[0].k, 'troca');
  a.fechar();
});

test('desfazer uma mudança volta o dia ao programa', async () => {
  const a = await editando();
  const antes = a.vJ('treino', 'A').ex[4].s;
  a.v('mudaSeries', 4, 1);
  a.v('desfazMod', 0);
  assert.strictEqual(a.vJ('treino', 'A').ex[4].s, antes);
  assert.strictEqual(a.S().mods.list.length, 0);
  a.fechar();
});

test('finalizar com mudanças encerra e carrega, com o padrão conservador', async () => {
  const a = await app();
  a.v('toggle', 0);
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  a.v('modoEdicao', false);

  const oficial = a.S().prog.A.ex[4].s;
  await a.v('finalizarSessao');
  await a.esperar(60);

  // Reescrito pela D1: ele afirmava "a tela de decisão aparece antes de
  // encerrar" e "a sessão continua aberta até ele responder". Finalizar deixou
  // de ter escala — encerra, e a mudança vai para a fila de Prescrição.
  assert.strictEqual(a.S().sessao, null, 'encerrou, sem tela no caminho');
  assert.strictEqual(a.S().prog.A.ex[4].s, oficial,
    'e o padrão continua o conservador: o oficial não mudou');
  assert.strictEqual(a.S().mods, null, 'as mudanças do dia morrem com a sessão');
  assert.ok((a.S().promoPendente || []).length, 'mas não se perdem: ficam na fila');
  a.fechar();
});

test('levar para o oficial muda o programa e fica registrado', async () => {
  const a = await app();
  a.v('toggle', 0);
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  a.v('modoEdicao', false);

  const oficial = a.S().prog.A.ex[4].s;
  await a.v('finalizarSessao');
  await a.esperar(60);
  const sid = a.S().promoPendente[0].sid;
  await a.v('ctx.respondeMudanca', sid, 0, true, 'decisao');
  await a.esperar(60);

  assert.strictEqual(a.S().prog.A.ex[4].s, oficial + 1, 'o programa de amanhã mudou');
  const log = a.S().progLog;
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].motivo, 'decisao');
  assert.match(log[0].txt, /séries/);
  a.fechar();
});

test('decidir cada mudança separadamente', async () => {
  const a = await app();
  a.v('toggle', 0);
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  a.v('setAlt', 2, 'elevacao-lateral-com-halteres');
  a.v('modoEdicao', false);

  const series = a.S().prog.A.ex[4].s;
  await a.v('finalizarSessao');
  await a.esperar(60);
  const g = a.S().promoPendente[0];
  assert.strictEqual(g.mods.length, 2);

  // Aceita a série, recusa a troca: são decisões sem relação nenhuma, e agora
  // cada uma tem a sua própria linha com as duas respostas ao lado — o que
  // antes era um `dec[]` dentro de uma tela só.
  const iSeries = g.mods.findIndex(function (m) { return m.k === 'sets'; });
  const iTroca = g.mods.findIndex(function (m) { return m.k === 'troca'; });
  assert.ok(iSeries >= 0 && iTroca >= 0, 'as duas mudanças estão na fila');

  await a.v('ctx.respondeMudanca', g.sid, iSeries, true, null);
  await a.esperar(60);
  await a.v('ctx.respondeMudanca', a.S().promoPendente[0].sid, 0, false, null);
  await a.esperar(60);

  assert.strictEqual(a.S().prog.A.ex[4].s, series + 1);
  assert.strictEqual(a.S().prog.A.ex[4].id, 'elevacao-lateral-na-maquina', 'a troca era só de hoje');
  assert.deepStrictEqual(a.S().promoPendente, [], 'e as duas saíram da fila');
  a.fechar();
});

test('o que mudou fica no registro do dia mesmo sem virar permanente', async () => {
  const a = await app();
  a.v('toggle', 0);
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  a.v('modoEdicao', true);
  a.v('setAlt', 0, 'supino-inclinado-com-halteres');
  a.v('modoEdicao', false);

  await a.v('finalizarSessao');
  await a.esperar(60);

  const m = a.S().done[a.S().done.length - 1];
  assert.ok(Array.isArray(m.mods) && m.mods.length === 1, 'daqui a um mês, o dia se explica');
  assert.match(m.mods[0], /Supino inclinado com halteres/);
  a.fechar();
});

test('finalizar sem mudanças não enfileira nada', async () => {
  // A asserção falava de `view.promo`, e essa chave saiu com a tela de decisão
  // (D1). O que importa é o mesmo: sem mudança, não há o que decidir depois.
  const a = await app();
  a.v('toggle', 0);
  for (let k = 0; k < 3; k++) a.preencher(0, k, 40, 10);
  await a.v('finalizarSessao');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().promoPendente || [], [], 'nada a decidir depois');
  assert.strictEqual(a.S().sessao, null, 'e a sessão encerrou');
  // ENCERRAR MATA A SESSÃO, NÃO O MODO, e é regra escrita (§4.5, a tabela das
  // três saídas). Eu havia afirmado o contrário aqui por reflexo — que nada
  // tomaria a tela — e a regra diz que o modo fica: depois de finalizar ele
  // pode querer conferir o que registrou, e a tela do treino é onde isso se vê.
  // Quem fecha o modo é a seta, o Voltar do sistema, ou um dos lugares.
  assert.strictEqual(a.vista().modoSessao, true, 'o modo fica: encerrar não é sair');
  a.fechar();
});

test('encerramento automático não promove nada', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  const oficial = a.S().prog.A.ex[4].s;

  // some por cinco horas: o app encerra sozinho
  a.E('S.sessao.ultima = Date.now() - 5*3600*1000; S.sessao.inicio = S.sessao.ultima');
  a.v('encerraSePreciso');
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.S().prog.A.ex[4].s, oficial, 'sem decisão, nada vira permanente');
  assert.strictEqual(a.S().mods, null);
  a.fechar();
});

test('as mudanças sobrevivem a navegar entre os dias no meio do treino', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  const alvo = a.vJ('treino', 'A').ex[4].s;

  a.v('go', 'E');
  a.v('go', 'A');
  assert.strictEqual(a.vJ('treino', 'A').ex[4].s, alvo, 'o mod não se perde ao trocar de dia');
  assert.strictEqual(a.S().mods.list.length, 1);
  a.fechar();
});

test('as mudanças sobrevivem a fechar e reabrir o app', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('modoEdicao', true);
  a.v('mudaSeries', 4, 1);
  await a.v('save');
  await a.esperar();
  const bruto = a.gravado();
  a.fechar();

  const b = await app({ estado: bruto });
  await b.esperar();
  assert.strictEqual(b.S().mods.list.length, 1);
  assert.strictEqual(b.S().prog.A.ex[4].s + 1, b.vJ('treino', 'A').ex[4].s);
  b.fechar();
});

test('o impacto no volume aparece na hora de mexer', async () => {
  const a = await editando();
  const imp = a.vJ('impactoSeries', 'A', 'delt lateral');
  assert.match(imp.txt, /delt lateral: 12/);
  assert.strictEqual(imp.acima, 0);

  a.v('mudaSeries', 4, 1);
  const depois = a.vJ('impactoSeries', 'A', 'delt lateral');
  assert.match(depois.txt, /13/);
  assert.match(depois.txt, /o treinador prescreveu 12/);
  assert.strictEqual(depois.acima, 1, 'acima do alvo é sinalizado');
  a.fechar();
});

test('o alvo do treinador é calculado do programa, nunca transcrito', async () => {
  const a = await app();
  assert.strictEqual(a.dado('ALVO_TOTAL'), 90);
  assert.strictEqual(a.dado('ALVO')["delt lateral"], 12);
  assert.strictEqual(a.dado('ALVO')["dorsal"], 10);

  // mexer no programa dele não move o alvo
  a.E('S.prog.A.ex[4].s = 9');   // eram 3
  assert.strictEqual(a.dado('ALVO')["delt lateral"], 12, 'o alvo é do treinador e não se move');
  assert.strictEqual(a.v('seriesDe', 'delt lateral'), 18, 'o número dele acompanha a edição');
  a.fechar();
});

test('trocar exercício recém-promovido avisa da regra de 6 a 8 semanas', async () => {
  const a = await app();
  a.E('S.prog.B.ex[0].desde = Date.now() - 14*86400000');
  const imp = a.vJ('impactoDoMod', 'B', { k: 'troca', slot: 'agachamento-no-smith', por: 'belt-squat' });
  assert.ok(imp, 'exercício com 2 semanas de casa gera aviso');
  assert.match(imp.txt, /6 a 8 semanas/);
  assert.strictEqual(imp.acima, 1);

  // o que veio do treinador (desde 0) não entra nessa conta
  a.E('S.prog.B.ex[0].desde = 0');
  assert.strictEqual(a.vJ('impactoDoMod', 'B', { k: 'troca', slot: 'agachamento-no-smith', por: 'belt-squat' }), null);
  a.fechar();
});

test('promover uma troca reinicia o relógio do exercício no programa', async () => {
  const a = await app();
  a.v('aplicaAoOficial', 'B', [{ k: 'troca', slot: 'agachamento-no-smith', por: 'belt-squat' }], 'decisao');
  assert.strictEqual(a.S().prog.B.ex[0].id, 'belt-squat');
  assert.ok(a.S().prog.B.ex[0].desde > Date.now() - 5000, 'entrou agora, conta a partir de agora');
  a.fechar();
});

// ---------- trocar o nome de um exercício ----------
// A chave do histórico é o ID, e o id nasce do nome UMA vez. Depois disso ele é
// identidade, não rótulo — e é isso que permite renomear sem mover nada.

/** Abre o histórico do primeiro exercício do dia e devolve o id dele. */
function abreHistorico(a) {
  a.v('toggle', 0); a.v('openHist', 0);
  return (function (h) { return h.key || a.k(h.day, h.i); })(a.vista().hist);
}

test('renomear não move o histórico, porque não mexe no id', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  const series = (a.S().logs[alvo] || []).length;
  a.E(`S.fotos[${JSON.stringify(alvo)}] = { v: 7, ext: 'webp' }`);

  await a.v('ctx.renomeiaExercicio', alvo, 'Máquina nova do canto');
  await a.esperar(60);

  assert.strictEqual(a.v('nomeEx', alvo), 'Máquina nova do canto');
  assert.ok(!!a.dado('CAT')[alvo], 'o id continua existindo no catálogo');
  assert.strictEqual((a.S().logs[alvo] || []).length, series,
    'as séries continuam sob a MESMA chave');
  assert.ok(!!a.S().fotos[alvo], 'a foto do aparelho também');
  assert.ok(a.S().prog[a.vista().hist.day].ex.some(function (x) { return x.id === alvo; }),
    'e a prescrição no programa');
  a.fechar();
});

test('o nome novo aparece no título e no cartão', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  await a.v('ctx.renomeiaExercicio', alvo, 'Cadeira do fundo');
  await a.esperar(60);
  assert.strictEqual(a.texto('.htitle'), 'Cadeira do fundo');

  a.v('ctx.fechaHist');
  assert.ok(a.$$('.ex').map(x => x.textContent).join(' ').includes('Cadeira do fundo'),
    'o cartão do treino segue o nome');
  a.fechar();
});

test('renomear um exercício do código grava só o nome, sobre o mesmo id', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  assert.strictEqual(!!a.S().ex[alvo], false, 'vem do código, não de S.ex');

  await a.v('ctx.renomeiaExercicio', alvo, 'Apelido dele');
  await a.esperar(60);
  const marca = a.S().ex[alvo];
  assert.deepStrictEqual(Object.keys(marca), ['n'], 'só o nome vira override');
  assert.strictEqual(marca.n, 'Apelido dele');
  a.fechar();
});

test('voltar ao nome do treinador apaga o override em vez de copiá-lo', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  const original = a.v('nomeEx', alvo);

  await a.v('ctx.renomeiaExercicio', alvo, 'Outro nome qualquer');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.historico').renome.doCodigo, original,
    'a tela oferece a volta, com o nome do código');

  await a.v('ctx.renomeiaExercicio', alvo, original);
  await a.esperar(60);
  assert.strictEqual(a.v('nomeEx', alvo), original);
  assert.strictEqual(!!(a.S().ex[alvo] && a.S().ex[alvo].n), false,
    'o estado não guarda cópia do que já está no código');
  a.fechar();
});

test('nome curto demais e nome repetido são recusados', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  const original = a.v('nomeEx', alvo);

  await a.v('ctx.renomeiaExercicio', alvo, 'ab');
  await a.esperar(40);
  assert.strictEqual(a.v('nomeEx', alvo), original);
  assert.ok(/três letras/.test(a.toast()), a.toast());

  // o nome de OUTRO exercício do catálogo
  const outro = (function (CAT) { return Object.keys(CAT).filter(function (k) { return k !== alvo && !CAT[k].arq; })[0]; })(a.dado('CAT'));
  const nomeDoOutro = a.dado('CAT')[outro].n;
  await a.v('ctx.renomeiaExercicio', alvo, nomeDoOutro);
  await a.esperar(40);
  assert.strictEqual(a.v('nomeEx', alvo), original, 'não trocou');
  assert.ok(/Já existe/.test(a.toast()), a.toast());
  a.fechar();
});

test('espaço em excesso não vira nome diferente', async () => {
  const a = await app();
  const alvo = abreHistorico(a);
  await a.v('ctx.renomeiaExercicio', alvo, '   Leg    press   45   ');
  await a.esperar(60);
  assert.strictEqual(a.v('nomeEx', alvo), 'Leg press 45');
  a.fechar();
});

// ---------------------------------------------------------------------------
// `ctx.edicaoDoDia` — a leitura inteira da tela de editar o treino de hoje
// ---------------------------------------------------------------------------
//
// Terceiro degrau do critério desta passada (quanto custa uma quebra em
// silêncio). É a ÚNICA leitura da tela `edicaodia.jsx` — tudo que ela desenha
// sai daqui —, e a frase que ela monta é o que promete, no meio do treino, que
// mexer no dia não mexe no programa oficial. Quebrada em silêncio, ou a tela
// fica vazia, ou ela mente sobre o que acontece com as mudanças no fim da
// sessão. Não tinha menção em `tests/fluxo/`: a rede chegava nos verbos de
// mexer, nunca na leitura que os mostra.
//
// O QUE ESTE GRUPO NÃO COBRE: que a tela esteja desenhando esta leitura.
// Chamar o verbo prova que a capacidade existe no MODELO.

test('ctx.edicaoDoDia descreve o dia, a linha de cada exercício e o aviso', async () => {
  const a = await editando();
  const d = a.vista().day;
  const e = a.vJ('ctx.edicaoDoDia');

  assert.strictEqual(e.dia, d, 'é a leitura do dia em edição');
  assert.strictEqual(e.aviso, 'O programa oficial só muda se você quiser, no fim do treino.',
    'sem mudança pendente, a promessa é a regra central do produto');
  assert.deepStrictEqual(e.mods, [], 'e nada na lista de decisões');

  const P = a.S().prog[d].ex;
  assert.strictEqual(e.linhas.length, P.length, 'uma linha por exercício do dia');
  assert.strictEqual(e.linhas[0].i, 0);
  assert.strictEqual(e.linhas[0].ord, '01', 'a ordem vem com dois dígitos, pronta para a tela');
  // O programa guarda `id` e `s`; o NOME mora no catálogo, e é de lá que a
  // linha tem de tirá-lo — um nome renomeado por ele aparece aqui ou em lugar
  // nenhum.
  assert.strictEqual(e.linhas[0].nome, a.v('nomeEx', P[0].id));
  assert.strictEqual(e.linhas[0].series, P[0].s, 'com as séries do dia');
  assert.strictEqual(e.linhas[0].mexido, false, 'nada mexido ainda');
  assert.strictEqual(e.linhas[0].noLugarDe, null, 'e nada no lugar de nada');
  assert.strictEqual(e.linhas[0].primeira, true, 'a primeira sabe que é a primeira');
  assert.strictEqual(e.linhas[0].ultima, false);
  assert.strictEqual(e.linhas[P.length - 1].ultima, true,
    'e a última também — é o que apaga as setas de subir e descer nas pontas');
  assert.strictEqual(e.linhas[0].troca, null, 'o seletor de troca só vem no índice aberto');
  a.fechar();
});

test('ctx.edicaoDoDia conta as mudanças pendentes, no singular e no plural', async () => {
  // A frase decide o que ele entende que vai acontecer no fim do treino, e
  // "1 mudanças pendentes" é o tipo de erro que faz a tela parecer rascunho.
  const a = await editando();
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  const uma = a.vJ('ctx.edicaoDoDia');
  assert.strictEqual(uma.aviso,
    '1 mudança pendente. No fim do treino você decide se ela fica.');
  assert.strictEqual(uma.mods.length, 1, 'com uma linha na lista de decisões');
  assert.strictEqual(uma.linhas[0].mexido, true, 'e a linha mexida marcada');

  a.v('mudaSeries', 1, 1);
  await a.esperar();
  const duas = a.vJ('ctx.edicaoDoDia');
  assert.strictEqual(duas.aviso,
    '2 mudanças pendentes. No fim do treino você decide o que fica.');
  assert.strictEqual(duas.mods.length, 2);
  assert.ok(duas.mods[0].txt, 'cada decisão vem com o texto dela: ' + duas.mods[0].txt);
  a.fechar();
});

test('ctx.edicaoDoDia traz o seletor de troca só no índice aberto, e a procedência', async () => {
  const a = await editando();
  a.v('toggleSwap', 2);
  await a.esperar();
  const e = a.vJ('ctx.edicaoDoDia');
  assert.ok(e.linhas[2].troca, 'o índice aberto traz as alternativas');
  assert.ok(e.linhas[2].troca.grupos.length >= 1, 'agrupadas por padrão de movimento');
  assert.strictEqual(e.linhas[0].troca, null, 'e nenhuma outra linha as traz');
  assert.strictEqual(e.linhas[2].troca.voltar, null, 'sem troca feita, não há para onde voltar');

  // feita a troca, a linha diz de onde veio — é a procedência que o programa
  // oficial ainda guarda
  // A troca entra pela TABELA DE AÇÃO, que `a.v` não alcança — `chama` parte o
  // nome no primeiro ponto (§8.6). `a.m.ctx` é a porta documentada para as
  // sete tabelas, e continua sendo por nome e sem `eval`.
  const alvo = e.linhas[2].troca.grupos[0].opcoes[0];
  a.m.ctx.acoesDia.escolheTroca(2, alvo.id);
  await a.esperar();
  const depois = a.vJ('ctx.edicaoDoDia');
  assert.ok(/^no lugar de /.test(depois.linhas[2].noLugarDe),
    'a linha carrega de quem ela tomou o lugar: ' + depois.linhas[2].noLugarDe);
  assert.strictEqual(depois.linhas[2].mexido, true);
  a.fechar();
});
