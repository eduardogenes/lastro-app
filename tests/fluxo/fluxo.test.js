// Ponta a ponta: uma semana de uso real, com tudo acontecendo junto.
// Os outros arquivos testam cada peça isolada; este existe para pegar o que
// só quebra quando elas se encontram.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, inicioDaSemana } from './harness.js';

test('uma semana de treino, com edição, promoção, cardio e corpo', async () => {
  const a = await app();

  // ---- segunda: treino A, com a máquina de peito ocupada ----
  assert.strictEqual(a.vista().day, 'A');
  a.v('toggle', 0);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');       // vira mod de troca
  for (let k = 0; k < 3; k++) a.preencher(0, k, 60, 8);
  a.v('toggle', 2);                                   // crucifixo inclinado: 2 séries
  for (let k = 0; k < 2; k++) a.preencher(2, k, 20, 12);

  assert.strictEqual(a.S().logs["supino-inclinado-no-smith"].length, 1,
    'a série foi para o histórico do que ele de fato usou');

  await a.v('finalizarSessao');
  await a.esperar();
  assert.ok(a.$('.promo'), 'houve mudança: pergunta antes de encerrar');
  a.v('motivoPromo', 'ocupada');
  await a.v('concluirPromo');           // padrão: só hoje
  await a.esperar();

  assert.strictEqual(a.S().prog.A.ex[0].id, 'chest-press-inclinado-convergente',
    'máquina ocupada não muda o programa');
  assert.strictEqual(a.S().progLog.length, 0);
  assert.strictEqual(a.vista().day, 'B', 'a rotação avançou');

  // cardio depois do A, como o treinador pediu
  a.aba('dados');
  a.v('cardioSet', 'min', 30);
  await a.v('addCardio');
  await a.esperar();
  assert.strictEqual(a.E('cardioSemana().length'), 1);

  // pesagem
  a.E('view.bodyForm = { peso: "73,4" }');
  await a.v('addBody', 'peso');
  await a.esperar();
  assert.strictEqual(a.S().body.peso.length, 1);

  // ---- terça: treino B, e ele decide que lateral merece mais uma série ----
  a.aba('treino');
  assert.strictEqual(a.vista().day, 'B');
  a.v('toggle', 0);
  const setsB0 = a.E('setsFor(treino("B").ex[0])');
  for (let k = 0; k < setsB0; k++) a.preencher(0, k, 70, 9);

  a.v('go', 'D');                          // navega e volta: nada pode se perder
  a.v('go', 'B');
  assert.strictEqual(a.log('B', 0).length, 1, 'a série continua lá');

  a.v('modoEdicao', true);
  // Lido do programa e não fixado: a prescrição do treinador muda, e um número
  // cravado aqui transformaria revisão de treino em teste quebrado.
  const antesDoSlot4 = a.E('treino("B").ex[4].s');
  a.v('mudaSeries', 4, 1);
  a.v('modoEdicao', false);
  await a.v('finalizarSessao');
  await a.esperar();
  a.v('decidePromo', 0, 'oficial');
  a.v('motivoPromo', 'decisao');
  await a.v('concluirPromo');
  await a.esperar();

  assert.strictEqual(a.S().prog.B.ex[4].s, antesDoSlot4 + 1, 'essa ele quis para valer');
  assert.strictEqual(a.S().progLog.length, 1);
  assert.strictEqual(a.S().progLog[0].motivo, 'decisao');

  // ---- quarta: treino C, com um aparelho que o app não conhecia ----
  assert.strictEqual(a.vista().day, 'C');
  a.v('modoEdicao', true);
  a.v('abrirNovoEx');
  a.digitar('nxn', 'Pendulum da unidade nova');
  a.E('document.getElementById("nxg").value = "quadríceps"');
  a.E('document.getElementById("nxk").checked = true');
  await a.E('criarExercicio()');
  await a.esperar();
  a.v('modoEdicao', false);

  const novo = a.E('treino("C").ex.length') - 1;
  a.v('toggle', novo);
  for (let k = 0; k < 3; k++) a.preencher(novo, k, 120, 8);
  assert.strictEqual(a.S().logs["pendulum-da-unidade-nova"].length, 1,
    'equipamento novo já tem histórico próprio');

  await a.v('finalizarSessao');
  await a.esperar();
  a.v('decidePromo', 0, 'oficial');
  await a.v('concluirPromo');
  await a.esperar();
  assert.ok(a.S().prog.C.ex.some(function (x) { return x.id === 'pendulum-da-unidade-nova'; }),
    'e entrou no programa porque ele quis');

  // ---- quinta: esqueceu de registrar, lança retroativo ----
  a.aba('dados');
  a.v('abrirAdicionar', (Date.now() - 1 * DIA));
  a.v('addSet', 'tipo', 'E');
  a.v('addSet', 'dur', 55);
  await a.v('gravarRetro', false);
  await a.esperar();
  // done fica ordenado por data: o lançamento de ontem não é o último
  const retro = a.J('S.done.filter(function (x) { return x.retro; })');
  assert.strictEqual(retro.length, 1);
  assert.strictEqual(retro[0].day, 'E');

  // ---- fecha e reabre: nada pode ter se perdido ----
  const bruto = a.gravado();
  a.fechar();

  const b = await app({ estado: bruto });
  await b.esperar();

  assert.strictEqual(b.E('S.done.length'), 4, 'três treinos e o retroativo');
  assert.strictEqual(b.E('S.prog.B.ex[4].s'), antesDoSlot4 + 1, 'a promoção sobreviveu');
  assert.strictEqual(b.E('CAT["pendulum-da-unidade-nova"].n'), 'Pendulum da unidade nova');
  assert.strictEqual(b.E('S.mods'), null, 'nenhum mod ficou pendurado');
  assert.strictEqual(b.E('S.sessao'), null);
  assert.strictEqual(b.E('S.body.peso.length'), 1);
  assert.strictEqual(b.E('S.cardio.length'), 1);

  // o painel de músculos conta o que foi feito, não o que estava prescrito
  const mus = b.J('seriesPorMusculo(0, Date.now() + 1)');
  // 3 do supino no Smith que substituiu o chest press + 2 do crucifixo inclinado
  assert.strictEqual(mus['peito superior'], 5, 'o supino no Smith contou em peito superior');
  // o agachamento da terça + 3 do aparelho novo cadastrado na quarta
  assert.strictEqual(mus['quadríceps'], setsB0 + 3, 'o pendulum novo contou em quadríceps');

  // e todas as telas continuam de pé
  ['hoje', 'treino', 'comida', 'dados', 'guia'].forEach(function (t) {
    b.aba(t);
    assert.ok(b.doc.getElementById('app').innerHTML.length > 600, 'aba vazia: ' + t);
  });
  b.E('abrirPrograma(null)');
  assert.strictEqual(b.texto('.htitle'), 'Programa');
  b.E('modoPrograma("diff")');
  assert.ok(b.doc.getElementById('app').textContent.includes('treino B'), 'a diferença aponta o que ele mudou');
  b.fechar();
});

test('deload com programa editado corta as séries pela metade do que ele prescreveu', async () => {
  const a = await app();
  a.v('abrirPrograma', 'A');
  await a.v('progSeries', 'A', 0, 1);        // 3 → 4
  await a.esperar();
  a.v('fecharPrograma');
  await a.v('setDeload', true);
  await a.esperar();

  assert.strictEqual(a.E('treino("A").ex[0].s'), 4, 'a prescrição é a dele');
  assert.strictEqual(a.E('setsFor(treino("A").ex[0])'), 2, 'e o deload corta essa, não a do treinador');
  a.v('toggle', 0);
  assert.strictEqual(a.$$('.ex.open .setrow').length, 2, 'duas linhas na tela, não quatro');
  assert.ok(a.texto('.ex.open .ex-sub').includes('deload'));
  a.fechar();
});

test('exercício removido do programa continua abrindo no histórico antigo', async () => {
  const t = Date.now() - 5 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[60, 8], [60, 8]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }]
  } });
  await a.esperar();
  const chave = a.k('A', 0);

  a.v('abrirPrograma', 'A');
  await a.v('progRemove', 'A', 0);
  await a.esperar();
  a.v('fecharPrograma');

  a.aba('dados');
  a.v('abrirSessao', t);
  const txt = a.doc.getElementById('app').textContent;
  assert.ok(txt.includes('Chest press inclinado convergente'), 'a sessão de cinco dias atrás abre igual');
  assert.ok(txt.includes('fora do treino'), 'sinalizado como fora do programa de hoje');
  assert.ok(a.J('S.logs[' + JSON.stringify(chave) + ']'), 'o histórico não foi tocado');
  a.fechar();
});

test('o app não presume que o dia de hoje é o dia da sessão', async () => {
  // Sessão aberta no C, ele navega para o F e edita: o mod tem que continuar
  // sendo do C, e o F não deve virar editável.
  const a = await app();
  a.v('go', 'C');
  a.v('toggle', 0);
  a.preencher(0, 0, 100, 8);
  assert.strictEqual(a.S().sessao.day, 'C');

  a.v('go', 'F');
  assert.strictEqual(a.$('.edlink'), null, 'com sessão aberta no C, o F não é editável');

  a.v('go', 'C');
  a.v('modoEdicao', true);
  a.v('mudaSeries', 1, 1);
  assert.strictEqual(a.S().mods.day, 'C');
  assert.strictEqual(a.S().mods.list.length, 1);
  a.fechar();
});

test('importar um backup do formato antigo reconstrói tudo', async () => {
  // O caminho que mais assusta: JSON de meses atrás caindo no app de hoje.
  const t = Date.now() - 60 * DIA;
  const antigo = JSON.stringify({
    app: 'treino-eduardo',
    data: {
      logs: {
        A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10]] }],
        'B2~Remada unilateral na polia baixa': [{ t: t, sid: t, sets: [[40, 10]] }]
      },
      done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }],
      deload: false, cardio: [], carga: { A0: 'halter' },
      body: { peso: [{ t: t, v: 72.8 }], cintura: [] }, export: 0
    }
  });

  const a = await app();
  a.aba('guia');
  await a.v('importText', antigo);
  await a.esperar(60);

  // Ancorado em PLANO_ATUAL e não num número escrito à mão: a asserção é
  // "passou pela cadeia INTEIRA", e fixar 6 a fazia envelhecer em silêncio —
  // foi assim que a importação ficou parando na 6 sem ninguém ver.
  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'),
    'a importação passa pela mesma cadeia que o boot');
  assert.ok(a.S().logs["supino-inclinado-com-halteres"], 'reindexado por exercício');
  assert.ok(a.S().logs["remada-unilateral-na-polia-baixa"]);
  assert.ok(!!a.S().prog, 'e ganhou um programa');
  assert.strictEqual(a.E('treino("A").ex.length'), 7);
  assert.strictEqual(a.S().done.length, 1);
  assert.strictEqual(a.S().body.peso.length, 1);

  a.aba('treino');
  assert.ok(a.doc.getElementById('app').innerHTML.length > 600);
  a.fechar();
});
