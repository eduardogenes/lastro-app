// Custódia dos dados: migração de formatos antigos, backup e reimportação.
// Regra 2 do projeto: nenhuma mudança pode quebrar o que já está salvo.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

// Formato original: só logs e done, sem sid, dur, deload, cardio, body ou carga.
const ANTIGO = {
  logs: { A0: [{ t: Date.now() - 40 * DIA, sets: [[30, 10], [30, 10], [30, 9], [30, 9]] }] },
  done: [{ day: 'A', t: Date.now() - 40 * DIA }]
};

test('estado do formato original carrega com padrões', async () => {
  const a = await app({ estado: ANTIGO });
  assert.strictEqual(a.E('S.done.length'), 1);
  assert.strictEqual(a.E('S.deload'), false);
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.E('S.export'), 0);
  assert.deepStrictEqual(a.J('S.carga'), {});
  assert.deepStrictEqual(a.J('S.cardio'), []);
  assert.deepStrictEqual(a.J('S.body.peso'), []);
  assert.strictEqual(a.E('nextDay()'), 'B');
  a.fechar();
});

test('todas as telas renderizam com estado antigo', async () => {
  const a = await app({ estado: ANTIGO });
  ['treino', 'acomp', 'corpo', 'ajustes'].forEach(function (t) {
    a.E('tab("' + t + '")');
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'aba ' + t + ' vazia');
  });
  a.fechar();
});

test('sessão sem sid abre no detalhe e mostra traço na duração', async () => {
  const a = await app({ estado: ANTIGO });
  a.E('abrirSessao(' + ANTIGO.done[0].t + ')');
  assert.ok(a.$$('.hs').length > 0, 'exercícios do dia aparecem');
  assert.strictEqual(a.$$('.stats b')[0].textContent, '–', 'aquele tempo nunca foi medido');
  a.fechar();
});

test('placeholder do exercício vem do histórico antigo', async () => {
  const a = await app({ estado: ANTIGO });
  a.E('go("A")');
  a.E('toggle(0)');
  assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '30');
  a.fechar();
});

test('exportar carrega todos os campos do estado', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('tab("ajustes")');
  a.E('showJSON()');

  const bkp = JSON.parse(a.doc.getElementById('jout').value);
  assert.strictEqual(bkp.app, 'treino-eduardo');
  assert.deepStrictEqual(
    Object.keys(bkp.data).sort(),
    ['body', 'cardio', 'carga', 'deload', 'done', 'draft', 'ex', 'export', 'logs',
     'mods', 'plano', 'prog', 'progLog', 'rot', 'sessao',
     // a fusão: sem estes no backup, trocar de celular perderia o plano
     // nutricional, a cadência e o ajuste calórico em vigor
     'ajuste', 'cadencia', 'comida', 'compras', 'dia', 'perfManual'].sort()
  );
  a.fechar();
});

test('apagar e reimportar devolve os dados idênticos', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  a.E('abrirAdicionar(' + (Date.now() - 2 * DIA) + ')');
  a.E('addSet("tipo","livre")');
  a.E('addSet("grupo","dorsal")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  a.E('tab("ajustes")');
  a.E('showJSON()');
  const bkp = a.doc.getElementById('jout').value;
  const antes = JSON.parse(bkp).data;

  await a.E('wipe()');
  await a.esperar();
  assert.strictEqual(a.E('S.done.length'), 0);

  a.E('tab("ajustes")');
  await a.E('importText(' + JSON.stringify(bkp) + ')');
  await a.esperar(60);

  assert.deepStrictEqual(a.J('S.logs'), antes.logs);
  assert.strictEqual(a.E('S.done.length'), antes.done.length);
  assert.strictEqual(a.E('S.done.filter(function (x) { return x.livre; }).length'), 1);
  a.fechar();
});

test('importar lixo não toca no estado', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const antes = a.J('S.logs');

  a.E('tab("ajustes")');
  await a.E('importText("{ isso nao e json")');
  assert.ok(a.toast().includes('JSON inválido'));

  await a.E('importText(JSON.stringify({ qualquer: 1 }))');
  assert.ok(a.toast().includes('não parece'));

  assert.deepStrictEqual(a.J('S.logs'), antes);
  a.fechar();
});

test('importar aceita o objeto cru, sem envelope', async () => {
  const a = await app();
  const cru = JSON.stringify({ logs: ANTIGO.logs, done: ANTIGO.done });
  a.E('tab("ajustes")');
  await a.E('importText(' + JSON.stringify(cru) + ')');
  await a.esperar(60);
  assert.strictEqual(a.E('S.done.length'), 1);
  a.fechar();
});

test('histórico longo não é truncado', async () => {
  // O teto antigo de 12 apagava em silêncio o histórico de longo prazo.
  const logs = { A0: [] }, done = [];
  for (let k = 0; k < 40; k++) {
    const t = Date.now() - (60 - k) * DIA;
    logs.A0.push({ t: t, sid: t, sets: [[30 + k, 10]] });
    done.push({ day: 'A', t: t, sid: t, dur: 50 * 60000 });
  }
  const a = await app({ estado: { logs: logs, done: done } });
  assert.strictEqual(a.log('A',0).length, 40);
  assert.strictEqual(a.log('A',0)[0].sets[0][0], 30, 'a primeira sessão continua lá');
  a.fechar();
});

test('abrir o JSON conta como backup', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: Date.now() - 60 * DIA }] } });
  assert.ok(a.E('diasSemBackup()') > 30);
  a.aba('guia');
  assert.ok(a.$('.gu-cobra'), 'o GUIA cobra o backup quando passou de 30 dias');
  assert.match(a.texto('.gu-cobra'), /backup|exportou/);

  a.E('showJSON()');
  await a.esperar();
  assert.ok(a.E('S.export') > 0, 'quem copia o texto na mão também fez backup');
  a.aba('guia');
  assert.strictEqual(a.$('.gu-cobra'), null, 'e para de cobrar depois que ele exporta');
  a.fechar();
});

test('dados sobrevivem a fechar e reabrir o app', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 42.5, 10);
  await a.esperar(900);                 // espera o debounce do save
  const gravado = a.gravado();
  assert.ok(gravado, 'nada foi para o armazenamento');
  a.fechar();

  const b = await app({ estado: gravado });
  assert.deepStrictEqual(b.log('A',0)[0].sets[0], [42.5, 10]);
  b.fechar();
});

// ---------- troca de programa e reindexação ----------
// Duas migrações em cadeia. A do plano 2 arquivou o histórico do programa
// anterior, porque a chave era dia+posição e o exercício novo herdaria a
// carga do antigo. A do plano 3 reindexa tudo pelo exercício — e nisso
// devolve ao histórico ativo os arquivados que continuam no programa.

test('histórico do plano antigo é reindexado, não apagado', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,   // exatamente o estado de quem já usava o app
    logs: {
      A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10]] }],                    // supino inclinado com halteres
      'B2~Remada unilateral na polia baixa': [{ t: t, sid: t, sets: [[40, 10]] }],
      C0: [{ t: t, sid: t, sets: [[100, 8]] }]
    },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }],
    carga: { A1: 'lado' }
  } });
  await a.esperar();

  const chaves = a.J('Object.keys(S.logs).sort()');
  assert.deepStrictEqual(chaves, [
    'agachamento-hack',
    'remada-unilateral-na-polia-baixa',
    'supino-inclinado-com-halteres'
  ], 'chave por exercício, não por posição');

  assert.strictEqual(a.E('S.plano'), 5, 'a 3→4 da fusão roda na mesma cadeia');
  assert.deepStrictEqual(a.J('S.logs["supino-inclinado-com-halteres"][0].sets'), [[30, 10], [30, 10]],
    'as séries continuam íntegras');
  assert.deepStrictEqual(a.J('S.carga'), {}, 'correção de carga apontava para posição antiga');
  assert.strictEqual(a.E('S.done.length'), 1, 'o calendário não é tocado');

  // agachamento hack saiu do programa mas é substituto do pendulum: continua
  // no catálogo. supino inclinado com halteres também.
  assert.ok(a.E('!!CAT["agachamento-hack"]'), 'exercício conhecido continua no catálogo');
  assert.strictEqual(a.E('CAT["agachamento-hack"].n'), 'Agachamento hack');
  a.fechar();
});

test('exercício que sumiu do catálogo vira arquivado, com nome e histórico', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 2,
    logs: { 'antigo~Aparelho que não existe mais': [{ t: t, sid: t, sets: [[10, 10]] }] },
    done: []
  } });
  await a.esperar();
  const k = 'aparelho-que-nao-existe-mais';
  assert.ok(a.J('S.ex')[k], 'entra no catálogo do usuário, marcado como arquivado');
  assert.strictEqual(a.E('CAT["' + k + '"].n'), 'Aparelho que não existe mais');
  assert.strictEqual(a.E('CAT["' + k + '"].arq'), 1);
  assert.strictEqual(a.J('S.logs')[k].length, 1, 'histórico intacto');
  a.fechar();
});

test('substituto antigo passa a viver no histórico do próprio exercício', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 2,
    logs: { 'A1~Crossover na polia baixa': [{ t: t, sid: t, sets: [[20, 12]] }] },
    done: []
  } });
  await a.esperar();
  const h = a.J('S.logs')['crossover-na-polia-baixa'];
  assert.ok(h, 'saiu da chave derivada');
  assert.strictEqual(h[0].sl, a.k('A', 1), 'guardando de que posição do treino veio');
  a.fechar();
});

test('exercício novo não herda a carga do que ocupava a posição', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,
    logs: { A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10], [30, 10]] }] },
    done: [{ day: 'F', t: t, sid: t }]
  } });
  await a.esperar();
  a.E('go("A")');
  a.E('toggle(0)');
  // vazio, não 'kg': a unidade fica no rótulo ao lado, e o placeholder é
  // reservado para o dado — a carga da última vez. Sem histórico, sem número.
  assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '', 'sem referência: é outro exercício');
  assert.strictEqual(a.log('A', 0), null, 'o chest press não herdou nada do supino');
  assert.strictEqual(a.$('.up'), null, 'e sem selo de subir carga herdado');
  a.fechar();
});

test('sessão anterior à troca continua abrindo no calendário', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1,
    logs: { A0: [{ t: t, sid: t, sets: [[30, 10], [30, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000 }]
  } });
  await a.esperar();
  a.E('tab("acomp")');
  a.E('abrirSessao(' + t + ')');
  const txt = a.doc.getElementById('app').textContent;
  assert.ok(txt.includes('Supino inclinado com halteres'), txt.slice(0, 300));
  assert.ok(txt.includes('fora do treino'), 'sinalizado como fora do treino de hoje');
  a.fechar();
});

test('a migração roda uma vez só', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1, logs: { A0: [{ t: t, sid: t, sets: [[30, 10]] }] }, done: []
  } });
  await a.esperar();
  // As migrações recebem o estado desde que viraram módulo: dá para testá-las
  // contra uma fixture sem subir o app (ver tests/dominio/migracoes.test.js).
  assert.strictEqual(a.E('migraPlano(S)'), 0, 'segunda passada não mexe em nada');
  assert.strictEqual(a.E('migraPlano3(S)'), null);
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), ['supino-inclinado-com-halteres']);
  a.fechar();
});
