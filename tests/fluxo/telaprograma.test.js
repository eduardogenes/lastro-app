// Tela de programa: a edição sentado em casa. Aqui é o oposto da edição do
// dia — mexeu, mudou o oficial, e vale a partir do próximo treino.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function noPrograma(d) {
  const a = await app();
  a.E('abrirPrograma(' + (d ? JSON.stringify(d) : 'null') + ')');
  return a;
}

test('a lista mostra os cinco treinos e a conta contra o treinador', async () => {
  const a = await noPrograma();
  const stats = a.$$('.stats b').map(function (x) { return x.textContent; });
  assert.deepStrictEqual(stats, ['93', '93', '0'], 'começa idêntico ao programa dele');
  assert.strictEqual(a.$$('.progd').length, 5);
  assert.strictEqual(a.$$('.progd-l')[0].textContent, 'A');
  assert.strictEqual(a.$$('.progd-l')[3].textContent, 'D', 'a ordem da lista é a da rotação');
  a.fechar();
});

test('mudar série no programa é imediato e fica no histórico', async () => {
  const a = await noPrograma('B');
  await a.E('progSeries("B",0,1)');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.B.ex[0].s'), 4);
  assert.strictEqual(a.E('treino("B").ex[0].s'), 4, 'vale já no próximo treino');

  const log = a.J('S.progLog');
  assert.strictEqual(log.length, 1);
  assert.match(log[0].txt, /Pendulum squat: 3 → 4 séries/);
  assert.strictEqual(log[0].day, 'B');
  a.fechar();
});

test('reordenar exercício no programa', async () => {
  const a = await noPrograma('C');
  const segundo = a.E('S.prog.C.ex[1].id');
  await a.E('moverProg("C",1,-1)');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.C.ex[0].id'), segundo);
  a.fechar();
});

test('remover exercício do programa não toca no histórico', async () => {
  const a = await app();
  a.E('go("C")');
  a.E('toggle(0)');
  a.preencher(0, 0, 100, 8);
  const chave = a.k('C', 0);
  assert.ok(a.J('S.logs[' + JSON.stringify(chave) + ']'));

  a.E('abrirPrograma("C")');
  await a.E('progRemove("C",0)');
  await a.esperar();
  assert.notStrictEqual(a.E('S.prog.C.ex[0].id'), chave, 'saiu do programa');
  assert.ok(a.J('S.logs[' + JSON.stringify(chave) + ']'), 'mas o histórico continua guardado');
  a.fechar();
});

test('trocar no programa reinicia o relógio do exercício', async () => {
  const a = await noPrograma('B');
  await a.E('progSetTroca("B",0,"belt-squat")');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.B.ex[0].id'), 'belt-squat');
  assert.ok(a.E('S.prog.B.ex[0].desde') > Date.now() - 5000);
  a.fechar();
});

test('trocar exercício com menos de 6 semanas pede confirmação', async () => {
  const a = await noPrograma('B');
  a.E('S.prog.B.ex[0].desde = Date.now() - 14*86400000');
  a.recusar();
  await a.E('progSetTroca("B",0,"belt-squat")');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.B.ex[0].id'), 'pendulum-squat', 'a regra do treinador segura a troca');
  assert.match(a.perguntas().join(' '), /6 a 8 semanas/);
  a.fechar();
});

test('adicionar exercício pela tela de programa é permanente', async () => {
  const a = await noPrograma('C');
  const antes = a.E('S.prog.C.ex.length');
  await a.E('addExercicio("belt-squat")');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.C.ex.length'), antes + 1);
  assert.strictEqual(a.E('S.mods'), null, 'não passa pelos mods do dia');
  assert.match(a.J('S.progLog')[0].txt, /Belt squat entrou/);
  a.fechar();
});

test('a diferença lê uma troca como troca, não como duas mudanças', async () => {
  const a = await noPrograma('B');
  await a.E('progSetTroca("B",3,"extensora-unilateral")');
  await a.esperar();
  const dif = a.J('difDoDia("B")');
  assert.strictEqual(dif.length, 1, 'saiu um e entrou outro na mesma posição: é uma troca');
  assert.strictEqual(dif[0].k, 'troca');
  assert.match(dif[0].txt, /Cadeira extensora → Extensora unilateral/);
  a.fechar();
});

test('a diferença separa série, repetição e descanso', async () => {
  const a = await noPrograma('C');
  await a.E('progSeries("C",0,1)');
  await a.E('progDesc("C",1)');
  await a.esperar();
  const dif = a.J('difDoDia("C")');
  const ks = dif.map(function (x) { return x.k; }).sort();
  assert.deepStrictEqual(ks, ['desc', 'sets']);
  a.fechar();
});

test('mudar a ordem sem mudar nada mais aparece como ordem', async () => {
  const a = await noPrograma('C');
  await a.E('moverProg("C",0,1)');
  await a.esperar();
  const dif = a.J('difDoDia("C")');
  assert.deepStrictEqual(dif.map(function (x) { return x.k; }), ['ordem']);
  a.fechar();
});

test('restaurar um treino desfaz só aquele treino', async () => {
  const a = await noPrograma('C');
  await a.E('progSeries("C",0,1)');
  await a.E('progSeries("A",0,1)');
  await a.esperar();
  assert.strictEqual(a.E('difTotal()'), 2);

  await a.E('restaurarDia("C")');
  await a.esperar();
  assert.deepStrictEqual(a.J('difDoDia("C")'), []);
  assert.strictEqual(a.E('difDoDia("A").length'), 1, 'o A continua como ele deixou');
  a.fechar();
});

test('restaurar tudo volta programa e rotação, sem tocar no histórico nem no catálogo', async () => {
  const a = await noPrograma('C');
  a.E('S.ex["meu-aparelho"] = { n:"Meu aparelho", car:"pino", g:"peito", c:0, cue:"", meu:1 }; montaCatalogo()');
  a.E('toggle(0)');
  await a.E('progSeries("C",0,1)');
  await a.E('moverDia(0,1)');
  await a.esperar();
  assert.ok(a.E('difTotal()') >= 2);

  await a.E('restaurarTudo()');
  await a.esperar();
  assert.strictEqual(a.E('difTotal()'), 0);
  assert.deepStrictEqual(a.J('rot()'), ['A', 'B', 'C', 'D', 'E']);
  assert.strictEqual(a.E('CAT["meu-aparelho"].n'), 'Meu aparelho', 'o que ele cadastrou continua lá');
  a.fechar();
});

test('reordenar a rotação muda a sequência dos treinos', async () => {
  const a = await noPrograma();
  // a rotação já nasce alfabética desde o plano 5; subir o quinto dia a
  // desalinha, que é justamente o que se quer testar
  await a.E('moverDia(4,-1)');
  await a.esperar();
  assert.deepStrictEqual(a.J('rot()'), ['A', 'B', 'C', 'E', 'D']);
  assert.strictEqual(a.E('difTotal()'), 1, 'a rotação conta como diferença');
  a.fechar();
});

test('criar treino novo entra na rotação e começa vazio', async () => {
  const a = await noPrograma();
  a.responder('Braço extra');
  await a.E('criarTreino()');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.F.name'), 'Braço extra');
  assert.deepStrictEqual(a.J('S.prog.F.ex'), []);
  assert.strictEqual(a.J('rot()').indexOf('F'), 5);

  await a.E('addExercicio("rosca-martelo")');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.F.ex.length'), 1);
  assert.strictEqual(a.E('treino("F").ex[0].n'), 'Rosca martelo');
  a.fechar();
});

test('apagar um treino que ele criou tira da rotação', async () => {
  const a = await noPrograma();
  a.responder('Braço extra');
  await a.E('criarTreino()');
  await a.esperar();
  await a.E('restaurarDia("F")');
  await a.esperar();
  assert.strictEqual(a.E('S.prog.F'), undefined);
  assert.strictEqual(a.J('rot()').indexOf('F'), -1);
  a.fechar();
});

test('o programa avisa quando um músculo sai do alvo do treinador', async () => {
  const a = await noPrograma('A');
  assert.strictEqual(a.J('impactoOficial("delt lateral")'), null, 'dentro do alvo, nada é dito');
  await a.E('progSeries("A",4,1)');
  await a.esperar();
  const imp = a.J('impactoOficial("delt lateral")');
  assert.match(imp.txt, /13 na rotação · o treinador prescreveu 12/);
  assert.strictEqual(imp.acima, 1);
  a.fechar();
});

test('o programa sobrevive a fechar e reabrir', async () => {
  const a = await noPrograma('C');
  await a.E('progSeries("C",0,1)');
  await a.E('moverDia(0,1)');
  await a.esperar();
  const bruto = a.gravado();
  a.fechar();

  const b = await app({ estado: bruto });
  await b.esperar();
  assert.strictEqual(b.E('S.prog.C.ex[0].s'), 4);
  assert.deepStrictEqual(b.J('rot()'), ['B', 'A', 'C', 'D', 'E']);
  assert.strictEqual(b.E('S.progLog.length'), 2);
  b.fechar();
});

test('as duas edições não se confundem', async () => {
  // mod de hoje no A, edição de programa no C: cada um no seu lugar
  const a = await app();
  a.E('modoEdicao(true)');
  a.E('mudaSeries(2, 1)');
  const hoje = a.E('treino("A").ex[2].s');
  const oficial = a.E('S.prog.A.ex[2].s');

  a.E('abrirPrograma("C")');
  await a.E('progSeries("C",0,1)');
  await a.esperar();

  assert.strictEqual(a.E('S.prog.A.ex[2].s'), oficial, 'o mod do dia continua sendo só do dia');
  assert.strictEqual(a.E('treino("A").ex[2].s'), hoje);
  assert.strictEqual(a.E('S.prog.C.ex[0].s'), 4, 'e a edição de programa é permanente');
  a.fechar();
});

test('todas as telas do programa renderizam', async () => {
  const a = await noPrograma();
  const titulos = { lista: 'Programa', diff: 'O que está diferente', historico: 'Histórico de mudanças' };
  Object.keys(titulos).forEach(function (m) {
    a.E('modoPrograma("' + m + '")');
    assert.strictEqual(a.texto('.htitle'), titulos[m], 'tela errada: ' + m);
    assert.ok(a.$('.back'), 'sem caminho de volta em ' + m);
  });
  a.E('abrirPrograma("E")');
  assert.ok(a.$$('.edx').length, 'o treino abre com os exercícios');
  a.E('fecharPrograma()');
  assert.strictEqual(a.E('view.prog'), null);
  assert.ok(a.$('.ins-estado-v'), 'e volta para a tela de treino');
  a.fechar();
});

// ---------- o freio no painel de músculos ----------

test('o painel atribui a série ao exercício registrado, não à posição', async () => {
  // Substituto de outro grupo: antes a série ia para o músculo do titular.
  const a = await app();
  a.E('toggle(4)');                             // elevação lateral na máquina
  a.E('setAlt(4, "pec-deck")');                 // peito
  a.preencher(4, 0, 40, 12);
  a.preencher(4, 1, 40, 12);

  const m = a.J('seriesPorMusculo(0, Date.now() + 1)');
  assert.strictEqual(m['peito'], 2, 'contou onde o trabalho aconteceu');
  assert.strictEqual(m['delt lateral'], undefined, 'e não onde ele estava prescrito');
  a.fechar();
});

test('exercício cadastrado por ele conta no painel', async () => {
  const a = await app();
  a.E(`S.ex["maquina-nova"] = { n:"Máquina nova", car:"pino", g:"dorsal", c:0, cue:"", meu:1 };
       montaCatalogo()`);
  a.E('modoEdicao(true)');
  await a.E('addExercicio("maquina-nova")');
  await a.esperar();
  a.E('modoEdicao(false)');
  const i = a.E('treino("A").ex.length') - 1;
  a.E('toggle(' + i + ')');
  a.preencher(i, 0, 50, 10);

  assert.strictEqual(a.J('seriesPorMusculo(0, Date.now() + 1)')['dorsal'], 1);
  a.aba('dados');
  assert.ok(a.doc.getElementById('app').textContent.includes('dorsal'));
  a.fechar();
});

test('o painel de corpo avisa quando o programa saiu do alvo do treinador', async () => {
  const a = await app();
  a.aba('dados');
  assert.strictEqual(a.$('.dd-fora'), null, 'programa igual ao dele: nada a dizer');

  a.E('abrirPrograma("A")');
  await a.E('progSeries("A",4,1)');
  await a.esperar();
  a.E('fecharPrograma()');
  a.aba('dados');

  const aviso = a.texto('.dd-fora');
  assert.ok(aviso, 'programa fora do alvo aparece onde ele acompanha o volume');
  assert.match(aviso, /delt lateral: 13 na rotação · o treinador prescreveu 12/);
  a.fechar();
});

test('músculo que saiu do programa mas foi treinado continua aparecendo', async () => {
  // Tibial anterior saiu do programa na revisão de 2026 e sobrevive no catálogo
  // como legado: continua trocável, e o trabalho feito nele continua contando.
  const a = await app();
  a.E('go("B")');
  a.E('toggle(4)');
  a.E('setAlt(4, "tibial-anterior")');
  a.preencher(4, 0, 20, 15);
  a.aba('dados');
  const musculos = a.$$('.dd-mus-n').map(function (x) { return x.textContent; });
  assert.ok(musculos.some(function (x) { return /tibial/.test(x); }),
    'sumir da tabela esconderia trabalho que existiu');
  a.fechar();
});
