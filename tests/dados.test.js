// Custódia dos dados: migração de formatos antigos, backup e reimportação.
// Regra 2 do projeto: nenhuma mudança pode quebrar o que já está salvo.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, DIA } = require('./harness');

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
    ['body', 'cardio', 'carga', 'deload', 'done', 'draft', 'export', 'logs', 'plano', 'sessao'].sort()
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
  assert.strictEqual(a.E('S.logs.A0.length'), 40);
  assert.strictEqual(a.E('S.logs.A0[0].sets[0][0]'), 30, 'a primeira sessão continua lá');
  a.fechar();
});

test('abrir o JSON conta como backup', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: Date.now() - 60 * DIA }] } });
  assert.ok(a.E('diasSemBackup()') > 30);
  a.E('tab("ajustes")');
  assert.ok(a.$$('.deload').some(function (x) { return /backup|exportou/.test(x.textContent); }));

  a.E('showJSON()');
  await a.esperar();
  assert.ok(a.E('S.export') > 0, 'quem copia o texto na mão também fez backup');
  a.E('tab("ajustes")');
  assert.ok(!a.$$('.deload').some(function (x) { return /backup|exportou/.test(x.textContent); }));
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
  assert.deepStrictEqual(b.J('S.logs.A0[0].sets[0]'), [42.5, 10]);
  b.fechar();
});

// ---------- troca de programa ----------
// As chaves são dia+posição. Sem arquivar, o exercício novo herdaria a carga
// do antigo que ocupava aquela posição: placeholder mentindo e selo de subir
// carga disparando errado.

test('histórico do plano antigo é arquivado, não apagado', async () => {
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
    'antigo~Agachamento hack',
    'antigo~Remada unilateral na polia baixa',
    'antigo~Supino inclinado com halteres'
  ], 'as três viram chaves arquivadas pelo nome');

  assert.strictEqual(a.E('S.plano'), 2);
  assert.deepStrictEqual(a.J('S.logs["antigo~Supino inclinado com halteres"][0].sets'), [[30, 10], [30, 10]],
    'as séries continuam íntegras');
  assert.deepStrictEqual(a.J('S.carga'), {}, 'correção de carga apontava para posição antiga');
  assert.strictEqual(a.E('S.done.length'), 1, 'o calendário não é tocado');
  assert.ok(a.toast().includes('arquivados'));
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
  assert.strictEqual(a.doc.getElementById('w0_0').placeholder, 'kg', 'sem referência: é outro exercício');
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
  assert.ok(txt.includes('plano antigo'));
  a.fechar();
});

test('a migração roda uma vez só', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ estado: {
    plano: 1, logs: { A0: [{ t: t, sid: t, sets: [[30, 10]] }] }, done: []
  } });
  await a.esperar();
  assert.strictEqual(a.E('migraPlano()'), 0, 'segunda passada não mexe em nada');
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), ['antigo~Supino inclinado com halteres']);
  a.fechar();
});
