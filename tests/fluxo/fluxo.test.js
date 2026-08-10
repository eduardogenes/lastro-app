// Ponta a ponta: uma semana de uso real, com tudo acontecendo junto.
// Os outros arquivos testam cada peça isolada; este existe para pegar o que
// só quebra quando elas se encontram.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, inicioDaSemana } from './harness.js';

test('uma semana de treino, com edição, promoção, cardio e corpo', async () => {
  const a = await app();

  // ---- segunda: treino A, com a máquina de peito ocupada ----
  assert.strictEqual(a.E('view.day'), 'A');
  a.E('toggle(0)');
  a.E('setAlt(0, "supino-inclinado-no-smith")');       // vira mod de troca
  for (let k = 0; k < 3; k++) a.preencher(0, k, 60, 8);
  a.E('toggle(2)');
  for (let k = 0; k < 3; k++) a.preencher(2, k, 20, 12);

  assert.strictEqual(a.J('S.logs["supino-inclinado-no-smith"]').length, 1,
    'a série foi para o histórico do que ele de fato usou');

  await a.E('finalizarSessao()');
  await a.esperar();
  assert.ok(a.$('.promo'), 'houve mudança: pergunta antes de encerrar');
  a.E('motivoPromo("ocupada")');
  await a.E('concluirPromo()');           // padrão: só hoje
  await a.esperar();

  assert.strictEqual(a.E('S.prog.A.ex[0].id'), 'chest-press-inclinado-convergente',
    'máquina ocupada não muda o programa');
  assert.strictEqual(a.E('S.progLog.length'), 0);
  assert.strictEqual(a.E('view.day'), 'B', 'a rotação avançou');

  // cardio depois do A, como o treinador pediu
  a.E('tab("corpo")');
  a.E('cardioSet("min",30)');
  await a.E('addCardio()');
  await a.esperar();
  assert.strictEqual(a.E('cardioSemana().length'), 1);

  // pesagem
  a.digitar('bpeso', '73,4');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso.length'), 1);

  // ---- terça: treino B, e ele decide que lateral merece mais uma série ----
  a.E('tab("treino")');
  assert.strictEqual(a.E('view.day'), 'B');
  a.E('toggle(0)');
  for (let k = 0; k < 3; k++) a.preencher(0, k, 70, 9);

  a.E('go("D")');                          // navega e volta: nada pode se perder
  a.E('go("B")');
  assert.strictEqual(a.log('B', 0).length, 1, 'a série continua lá');

  a.E('modoEdicao(true)');
  a.E('mudaSeries(4, 1)');                 // reverse pec deck: delt posterior
  a.E('modoEdicao(false)');
  await a.E('finalizarSessao()');
  await a.esperar();
  a.E('decidePromo(0, "oficial")');
  a.E('motivoPromo("decisao")');
  await a.E('concluirPromo()');
  await a.esperar();

  assert.strictEqual(a.E('S.prog.B.ex[4].s'), 4, 'essa ele quis para valer');
  assert.strictEqual(a.E('S.progLog.length'), 1);
  assert.strictEqual(a.J('S.progLog')[0].motivo, 'decisao');

  // ---- quarta: treino C, com um aparelho que o app não conhecia ----
  assert.strictEqual(a.E('view.day'), 'C');
  a.E('modoEdicao(true)');
  a.E('abrirNovoEx()');
  a.digitar('nxn', 'Pendulum da unidade nova');
  a.E('document.getElementById("nxg").value = "quadríceps"');
  a.E('document.getElementById("nxk").checked = true');
  await a.E('criarExercicio()');
  await a.esperar();
  a.E('modoEdicao(false)');

  const novo = a.E('treino("C").ex.length') - 1;
  a.E('toggle(' + novo + ')');
  for (let k = 0; k < 3; k++) a.preencher(novo, k, 120, 8);
  assert.strictEqual(a.J('S.logs["pendulum-da-unidade-nova"]').length, 1,
    'equipamento novo já tem histórico próprio');

  await a.E('finalizarSessao()');
  await a.esperar();
  a.E('decidePromo(0, "oficial")');
  await a.E('concluirPromo()');
  await a.esperar();
  assert.ok(a.J('S.prog.C.ex').some(function (x) { return x.id === 'pendulum-da-unidade-nova'; }),
    'e entrou no programa porque ele quis');

  // ---- quinta: esqueceu de registrar, lança retroativo ----
  a.E('tab("acomp")');
  a.E('abrirAdicionar(' + (Date.now() - 1 * DIA) + ')');
  a.E('addSet("tipo","E")');
  a.E('addSet("dur",55)');
  await a.E('gravarRetro(false)');
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
  assert.strictEqual(b.E('S.prog.B.ex[4].s'), 4, 'a promoção sobreviveu');
  assert.strictEqual(b.E('CAT["pendulum-da-unidade-nova"].n'), 'Pendulum da unidade nova');
  assert.strictEqual(b.E('S.mods'), null, 'nenhum mod ficou pendurado');
  assert.strictEqual(b.E('S.sessao'), null);
  assert.strictEqual(b.E('S.body.peso.length'), 1);
  assert.strictEqual(b.E('S.cardio.length'), 1);

  // o painel de músculos conta o que foi feito, não o que estava prescrito
  const mus = b.J('seriesPorMusculo(0, Date.now() + 1)');
  assert.strictEqual(mus['peito superior'], 3, 'o supino no Smith contou em peito superior');
  assert.strictEqual(mus['quadríceps'], 3, 'o pendulum novo contou em quadríceps');

  // e todas as telas continuam de pé
  ['treino', 'acomp', 'corpo', 'ajustes'].forEach(function (t) {
    b.E('tab("' + t + '")');
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
  a.E('abrirPrograma("A")');
  await a.E('progSeries("A",0,1)');        // 3 → 4
  await a.esperar();
  a.E('fecharPrograma()');
  await a.E('setDeload(true)');
  await a.esperar();

  assert.strictEqual(a.E('treino("A").ex[0].s'), 4, 'a prescrição é a dele');
  assert.strictEqual(a.E('setsFor(treino("A").ex[0])'), 2, 'e o deload corta essa, não a do treinador');
  a.E('toggle(0)');
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

  a.E('abrirPrograma("A")');
  await a.E('progRemove("A",0)');
  await a.esperar();
  a.E('fecharPrograma()');

  a.E('tab("acomp")');
  a.E('abrirSessao(' + t + ')');
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
  a.E('go("C")');
  a.E('toggle(0)');
  a.preencher(0, 0, 100, 8);
  assert.strictEqual(a.E('S.sessao.day'), 'C');

  a.E('go("F")');
  assert.strictEqual(a.$('.edlink'), null, 'com sessão aberta no C, o F não é editável');

  a.E('go("C")');
  a.E('modoEdicao(true)');
  a.E('mudaSeries(1, 1)');
  assert.strictEqual(a.E('S.mods.day'), 'C');
  assert.strictEqual(a.E('S.mods.list.length'), 1);
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
  a.E('tab("ajustes")');
  await a.E('importText(' + JSON.stringify(antigo) + ')');
  await a.esperar(60);

  assert.strictEqual(a.E('S.plano'), 3, 'passou pelas duas migrações');
  assert.ok(a.J('S.logs["supino-inclinado-com-halteres"]'), 'reindexado por exercício');
  assert.ok(a.J('S.logs["remada-unilateral-na-polia-baixa"]'));
  assert.ok(a.E('!!S.prog'), 'e ganhou um programa');
  assert.strictEqual(a.E('treino("A").ex.length'), 7);
  assert.strictEqual(a.E('S.done.length'), 1);
  assert.strictEqual(a.E('S.body.peso.length'), 1);

  a.E('tab("treino")');
  assert.ok(a.doc.getElementById('app').innerHTML.length > 600);
  a.fechar();
});
