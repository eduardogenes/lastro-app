// Registro contínuo: a mudança estrutural do app. Não existe botão de salvar,
// a sessão nasce na primeira série completa e morre sozinha.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, DIA } = require('./harness');

test('não existe mais função de salvar', async () => {
  const a = await app();
  assert.strictEqual(a.E('typeof finish'), 'undefined');
  assert.ok(a.texto('.autonota').includes('Não há nada para salvar'));
  a.fechar();
});

test('série incompleta não abre sessão', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, null);          // só a carga
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.E('S.done.length'), 0);
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), []);
  a.fechar();
});

test('série completa abre a sessão e grava na hora', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);

  assert.ok(a.E('S.sessao !== null'), 'sessão deveria estar aberta');
  assert.strictEqual(a.E('S.done.length'), 1);
  assert.strictEqual(a.E('S.done[0].sid'), a.E('S.sessao.sid'));

  const log = a.log('A',0)[0];
  assert.deepStrictEqual(log.sets[0], [40, 10]);
  assert.strictEqual(log.sid, a.E('S.sessao.sid'));
  a.fechar();
});

test('apagar o campo remove a série do histórico', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 2);

  a.preencher(0, 1, '', '');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1);
  a.fechar();
});

test('a sessão aberta não vira referência de si mesma', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('render()');

  // placeholder da série 2 não pode repetir o que acabou de ser digitado
  assert.strictEqual(a.doc.getElementById('w0_1').placeholder, 'kg');
  assert.ok(a.texto('.ex.open .lastline').includes('primeira vez'));
  assert.deepStrictEqual(a.J('historico("A0")'), []);
  a.fechar();
});

test('sessão encerra por inatividade, grava duração e avança a rotação', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const estado = a.J('S');

  // seis horas atrás, última série cinco horas atrás
  const agora = Date.now();
  estado.sessao.inicio = agora - 6 * 3600 * 1000;
  estado.sessao.ultima = agora - 5 * 3600 * 1000;
  estado.done[0].t = estado.sessao.inicio;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.E('S.sessao'), null, 'sessão deveria ter encerrado sozinha');
  assert.strictEqual(b.E('S.done[0].dur'), 3600 * 1000, 'uma hora de treino');
  assert.strictEqual(b.E('S.draft'), null);
  assert.strictEqual(b.texto('.dayletter'), 'B', 'rotação deveria ter avançado');
  assert.strictEqual(b.log('A',0)[0].sets.filter(Boolean).length, 1, 'histórico preservado');
  b.fechar();
});

test('sessão do mesmo dia com pouca pausa continua aberta', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const estado = a.J('S');
  estado.sessao.ultima = Date.now() - 30 * 60 * 1000;   // 30 min de descanso
  a.fechar();

  const b = await app({ estado });
  assert.ok(b.E('S.sessao !== null'), 'não deveria encerrar por 30 minutos');
  assert.strictEqual(b.texto('.dayletter'), 'A');
  b.fechar();
});

test('trocar de dia no meio do treino não perde nem sobrescreve série', async () => {
  // Regressão: o rascunho é zerado ao trocar de dia. Sem hidratação, os campos
  // voltavam em branco com as séries gravadas, e digitar por cima apagava o resto.
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  a.preencher(0, 2, 40, 9);

  a.E('go("D")');
  a.E('go("A")');
  a.E('toggle(0)');

  assert.strictEqual(a.doc.getElementById('w0_0').value, '40', 'campo deveria voltar preenchido');
  assert.strictEqual(a.doc.getElementById('r0_2').value, '9');

  a.preencher(0, 0, 45, 10);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 3, 'as outras séries continuam');
  assert.deepStrictEqual(a.log('A',0)[0].sets[1], [40, 10]);
  a.fechar();
});

test('hidratação recupera observação, dor e substituto', async () => {
  const a = await app();
  a.E('toggle(1)');
  a.E('setAlt(1,"crucifixo-inclinado-no-cabo")');
  a.E('abrirNota(1)');
  a.digitar('o1', 'ombro ok hoje');
  a.E('toggleDor(1,"ombro")');
  a.preencher(1, 0, 32, 10);

  a.E('go("E")');
  a.E('go("A")');
  a.E('toggle(1)');

  assert.strictEqual(a.E('altOf(1)'), 'crucifixo-inclinado-no-cabo');
  assert.strictEqual(a.E('logKey("A",1)'), 'crucifixo-inclinado-no-cabo',
    'o registro vai para o histórico do substituto, não para uma chave derivada');
  assert.strictEqual(a.doc.getElementById('o1').value, 'ombro ok hoje');
  assert.strictEqual(a.texto('.ex.open .chip.on'), 'ombro anterior');
  a.fechar();
});

test('cabeçalho conta as séries sem re-render', async () => {
  const a = await app();
  assert.ok(a.texto('#daymeta').includes('séries prescritas'));

  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  assert.ok(a.texto('#daymeta').includes('1 série registrada'), a.texto('#daymeta'));

  a.preencher(0, 1, 40, 10);
  assert.ok(a.texto('#daymeta').includes('2 séries'), 'contador acompanha a digitação');
  a.fechar();
});

test('troca de exercício move a projeção para o histórico do substituto', async () => {
  const a = await app();
  a.E('toggle(1)');
  a.preencher(1, 0, 60, 12);
  assert.ok(a.log('A',1), 'gravou no exercício original');

  a.E('setAlt(1,"crossover-na-polia-baixa")');
  assert.strictEqual(a.log('A',1), null, 'sai do histórico do original');
  const sub = a.J('S.logs["crossover-na-polia-baixa"]');
  assert.strictEqual(sub.length, 1, 'e entra no histórico do substituto');
  assert.strictEqual(sub[0].sl, a.k('A',1), 'guardando de que posição do treino veio');
  a.fechar();
});

test('substituto acumula histórico próprio entre treinos', async () => {
  // O ganho de indexar por exercício: usar o mesmo aparelho como substituto em
  // dias diferentes vira uma série histórica só, não duas chaves órfãs.
  const a = await app();
  a.E('toggle(1)');
  a.E('setAlt(1,"crossover-na-polia-baixa")');
  a.preencher(1, 0, 20, 12);
  assert.strictEqual(a.J('S.logs["crossover-na-polia-baixa"]').length, 1);

  a.E('go("E")');
  a.E('toggle(6)');
  a.E('setAlt(6,"crossover-na-polia-baixa")');
  a.preencher(6, 0, 22, 12);
  const h = a.J('S.logs["crossover-na-polia-baixa"]');
  assert.strictEqual(h.length, 2, 'mesma chave, dois dias diferentes');
  assert.notStrictEqual(h[0].sl, h[1].sl, 'cada um sabe de que posição veio');
  a.fechar();
});

test('deload corta as séries pela metade e marca a sessão', async () => {
  const a = await app();
  await a.E('setDeload(true)');
  a.E('go("A")');
  a.E('toggle(0)');

  assert.strictEqual(a.$$('.ex.open .setrow').length, 2, 'quatro séries viram duas');
  assert.strictEqual(a.$('.up'), null, 'selo de subir carga fica suspenso');

  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.log('A',0)[0].dl, 1);
  assert.strictEqual(a.E('S.done[0].dl'), 1);
  assert.strictEqual(a.E('sessoesDeTrabalho()'), 0, 'deload não conta para as 48');
  a.fechar();
});
