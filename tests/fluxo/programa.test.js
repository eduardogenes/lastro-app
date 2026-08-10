// O programa como dado: catálogo de exercícios, id estável e S.prog.
// A regra que sustenta tudo: a chave do histórico é o EXERCÍCIO, nunca a
// posição dele no treino. Sem isso, editar o programa desloca o histórico.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('a chave do histórico é o exercício, não a posição', async () => {
  const a = await app();
  assert.strictEqual(a.k('A', 0), 'chest-press-inclinado-convergente');
  assert.notStrictEqual(a.k('A', 0), 'A0');

  // o mesmo exercício em dois treinos diferentes tem a mesma chave
  const iC = a.E('treino("C").ex.findIndex(function (x) { return x.n === "Panturrilha sentada"; })');
  const iF = a.E('treino("F").ex.findIndex(function (x) { return x.n === "Panturrilha sentada"; })');
  assert.ok(iC >= 0 && iF >= 0);
  assert.strictEqual(a.k('C', iC), a.k('F', iF), 'é o mesmo exercício, é o mesmo histórico');
  a.fechar();
});

test('inserir um exercício no meio não desloca o histórico dos outros', async () => {
  // A regressão que este redesenho existe para impedir.
  const a = await app();
  a.E('toggle(3)');
  a.preencher(3, 0, 50, 10);
  const chave = a.k('A', 3);
  const antes = a.J('S.logs[' + JSON.stringify(chave) + ']');
  assert.strictEqual(antes.length, 1);

  // insere um exercício qualquer na segunda posição do treino
  a.E('S.prog.A.ex.splice(1, 0, { id:"pec-deck", s:2, r:"10–15", d:105, desde:Date.now() }); render()');

  assert.strictEqual(a.k('A', 4), chave, 'o exercício desceu uma posição');
  assert.deepStrictEqual(a.J('S.logs[' + JSON.stringify(chave) + ']'), antes,
    'e levou o histórico junto, intacto');
  a.fechar();
});

test('o catálogo conhece o programa e os substitutos', async () => {
  const a = await app();
  const n = a.E('Object.keys(CAT).length');
  assert.ok(n > 100, 'substitutos viram exercícios de verdade: ' + n);

  // todo exercício do programa está no catálogo
  const faltando = a.J(`
    rot().reduce(function (acc, d) {
      treino(d).ex.forEach(function (ex) { if (!CAT[ex.id]) acc.push(ex.n); });
      return acc;
    }, [])`);
  assert.deepStrictEqual(faltando, []);

  // e todo substituto oferecido também
  const semCat = a.J(`
    rot().reduce(function (acc, d) {
      treino(d).ex.forEach(function (ex, i) {
        altList(d, i).forEach(function (o) { if (!CAT[o.id]) acc.push(o.n); });
      });
      return acc;
    }, [])`);
  assert.deepStrictEqual(semCat, []);
  a.fechar();
});

test('a lista de troca traz o indicado do treinador e o resto do grupo', async () => {
  const a = await app();
  const lista = a.J('altList("A", 2)');   // elevação lateral na máquina
  assert.ok(lista.length >= 3);
  assert.ok(lista[0].ind, 'o que o treinador indicou vem primeiro');
  assert.ok(lista.some(function (x) { return !x.ind; }), 'e depois o resto do grupo');
  assert.ok(lista.every(function (x) { return x.id !== a.k('A', 2); }),
    'o próprio exercício não aparece como substituto dele mesmo');
  a.fechar();
});

test('exercício cadastrado por ele aparece na troca e tem histórico próprio', async () => {
  const a = await app();
  a.E(`S.ex["maquina-nova-da-academia"] = { n:"Máquina nova da academia",
        car:"pino", g:"delt lateral", c:0, cue:"", meu:1 }; montaCatalogo(); render()`);

  const lista = a.J('altList("A", 2)');
  const achou = lista.filter(function (x) { return x.id === 'maquina-nova-da-academia'; })[0];
  assert.ok(achou, 'sem isso, todo equipamento novo nasceria invisível');

  const original = a.k('A', 2);
  a.E('toggle(2)');
  a.E('setAlt(2,"maquina-nova-da-academia")');
  a.preencher(2, 0, 25, 15);
  assert.strictEqual(a.J('S.logs["maquina-nova-da-academia"]').length, 1);
  assert.strictEqual(a.E('S.logs[' + JSON.stringify(original) + ']'), undefined,
    'não contamina o exercício original');
  a.fechar();
});

test('o programa do treinador continua congelado e comparável', async () => {
  const a = await app();
  a.E('S.prog.A.ex[0].s = 9; render()');
  assert.strictEqual(a.E('treino("A").ex[0].s'), 9, 'o programa dele mudou');
  assert.strictEqual(a.E('PROGRAMA.A.ex[0].s'), 3, 'o do treinador não');

  const alvo = a.J(`
    ROT_BASE.reduce(function (acc, d) {
      PROGRAMA[d].ex.forEach(function (ex) { acc[ex.g] = (acc[ex.g] || 0) + ex.s; });
      return acc;
    }, {})`);
  assert.strictEqual(Object.values(alvo).reduce(function (x, y) { return x + y; }, 0), 125);
  a.fechar();
});

test('id sem entrada no catálogo não derruba a tela', async () => {
  const a = await app();
  a.E('S.prog.A.ex[0].id = "exercicio-que-sumiu"; render()');
  assert.strictEqual(a.E('treino("A").ex[0].n'), 'exercicio-que-sumiu');
  assert.strictEqual(a.E('treino("A").ex[0].sumido'), undefined);
  assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'a tela continua de pé');
  a.fechar();
});

test('a rotação vem do estado e o app não presume seis dias', async () => {
  // plano 3 explícito: a migração reescreve a rotação, e aqui queremos a dele
  const a = await app({ estado: { plano: 3, logs: {}, done: [{ day: 'C', t: Date.now(), sid: Date.now() }],
                                  rot: ['A', 'B', 'C'] } });
  assert.deepStrictEqual(a.J('rot()'), ['A', 'B', 'C']);
  assert.strictEqual(a.E('nextDay()'), 'A', 'depois do último volta para o primeiro');
  a.fechar();
});

test('o mesmo aparelho em duas posições da mesma sessão não se sobrescreve', async () => {
  const a = await app();
  a.E('toggle(4)');
  a.E('setAlt(4,"pec-deck")');
  a.preencher(4, 0, 40, 12);
  a.E('toggle(5)');
  a.E('setAlt(5,"pec-deck")');
  a.preencher(5, 0, 45, 10);

  const h = a.J('S.logs["pec-deck"]');
  assert.strictEqual(h.length, 2, 'duas posições, dois registros');
  assert.notStrictEqual(h[0].sl, h[1].sl);
  a.fechar();
});

test('estado sem programa nasce com o do treinador', async () => {
  const a = await app({ estado: { logs: {}, done: [], prog: null, rot: null } });
  await a.esperar();
  assert.deepStrictEqual(a.J('rot()'), ['A', 'B', 'C', 'E', 'D', 'F']);
  assert.strictEqual(a.E('treino("A").ex.length'), 7);
  assert.strictEqual(a.E('treino("A").ex[0].s'), 3);
  assert.strictEqual(a.E('treino("A").ex[0].d'), 180, 'o descanso vem do slot');
  a.fechar();
});

test('o programa editado sobrevive a fechar e reabrir', async () => {
  const a = await app();
  a.E('S.prog.A.ex[0].s = 4');
  a.E('S.ex["meu-aparelho"] = { n:"Meu aparelho", car:"pino", g:"peito", c:0, cue:"", meu:1 }');
  await a.E('save()');
  await a.esperar();
  const bruto = a.gravado();
  a.fechar();

  const b = await app({ estado: bruto });
  await b.esperar();
  assert.strictEqual(b.E('treino("A").ex[0].s'), 4);
  assert.strictEqual(b.E('CAT["meu-aparelho"].n'), 'Meu aparelho');
  b.fechar();
});

test('estado do plano 1 atravessa as duas migrações sem perder nada', async () => {
  const t1 = Date.now() - 40 * DIA, t2 = Date.now() - 33 * DIA;
  const a = await app({ estado: {
    plano: 1,
    logs: {
      A0: [{ t: t1, sid: t1, sets: [[30, 10], [30, 10], [30, 9]] }],   // supino inclinado com halteres
      A6: [{ t: t1, sid: t1, sets: [[12, 15], [12, 15]] }],            // elevação lateral
      F1: [{ t: t2, sid: t2, sets: [[45, 12], [45, 12]] }],            // mesa flexora deitada
      'B2~Remada unilateral na polia baixa': [{ t: t2, sid: t2, sets: [[40, 10]] }]
    },
    done: [{ day: 'A', t: t1, sid: t1, dur: 52 * 60000 },
           { day: 'F', t: t2, sid: t2, dur: 48 * 60000 }],
    carga: { A0: 'halter' },
    body: { peso: [{ t: t1, v: 73.2 }], cintura: [] }
  } });
  await a.esperar();

  assert.strictEqual(a.E('S.plano'), 3);
  assert.strictEqual(a.E('S.done.length'), 2, 'o calendário atravessa intacto');

  const logs = a.J('S.logs');
  // mesa flexora deitada continua no programa: volta para o histórico ativo
  assert.ok(logs['mesa-flexora-deitada'], 'exercício que sobreviveu volta a ser ativo');
  assert.deepStrictEqual(logs['mesa-flexora-deitada'][0].sets, [[45, 12], [45, 12]]);
  const iF = a.E('treino("F").ex.findIndex(function (x) { return x.n === "Mesa flexora deitada"; })');
  assert.strictEqual(a.k('F', iF), 'mesa-flexora-deitada', 'e o app já o encontra pela chave');

  // os que saíram do programa continuam com histórico, sem posição
  assert.ok(logs['supino-inclinado-com-halteres']);
  assert.strictEqual(logs['supino-inclinado-com-halteres'][0].sets.length, 3);
  assert.ok(logs['elevacao-lateral'], 'nenhuma série se perdeu no caminho');
  assert.ok(logs['remada-unilateral-na-polia-baixa'], 'substituto virou exercício');

  assert.strictEqual(Object.keys(logs).length, 4, 'quatro chaves entraram, quatro saíram');
  assert.deepStrictEqual(a.J('S.carga'), {}, 'correção posicional do plano 1 não sobrevive');

  // e as telas continuam de pé
  ['treino', 'acomp', 'corpo', 'ajustes'].forEach(function (x) {
    a.E('tab("' + x + '")');
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'aba vazia: ' + x);
  });
  a.E('tab("acomp")');
  a.E('abrirSessao(' + t1 + ')');
  const txt = a.doc.getElementById('app').textContent;
  assert.ok(txt.includes('Supino inclinado com halteres'), 'o detalhe da sessão antiga abre');
  a.fechar();
});
