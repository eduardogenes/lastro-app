// Horário do treino. "Normalmente é 6h15, mas não é exato" — então o app
// registra o que aconteceu e nunca inventa o que não mediu.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, DIA } = require('./harness');

function emHoje(h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

test('o relógio diz desde que horas', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('S.sessao.inicio = ' + emHoje(6, 22));
  a.E('render()');
  assert.strictEqual(a.texto('.day-rel em'), 'desde 06:22');
  a.fechar();
});

test('detalhe da sessão mostra início e fim', async () => {
  const t = emHoje(6, 22) - DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 69 * 60000, fim: 'manual' }]
  } });
  a.E('abrirSessao(' + t + ')');
  const linha = a.texto('.horario');
  assert.ok(/06:22/.test(linha), linha);
  assert.ok(/07:31/.test(linha), 'fim derivado da duração: ' + linha);
  a.fechar();
});

test('sessão em andamento mostra só o começo', async () => {
  const a = await app();
  await a.E('iniciarSessao()');
  a.E('S.sessao.inicio = ' + emHoje(6, 5));
  a.E('S.done[0].t = ' + emHoje(6, 5));
  const t = a.E('S.done[0].t');
  a.E('abrirSessao(' + t + ')');
  const linha = a.texto('.horario');
  assert.ok(/começou às/.test(linha), linha);
  assert.ok(/06:05/.test(linha));
  a.fechar();
});

test('lista do mês mostra a hora embaixo da data', async () => {
  const t = emHoje(6, 40) - 2 * DIA;
  const a = await app({ estado: {
    logs: {}, done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000, fim: 'manual' }]
  } });
  a.E('tab("acomp")');
  assert.ok(a.texto('.sess-d').includes('06:40'), a.texto('.sess-d'));
  a.fechar();
});

test('horário típico do mês, com o mais cedo e o mais tarde', async () => {
  const hoje = new Date();
  const dia = function (d, h, m) {
    return new Date(hoje.getFullYear(), hoje.getMonth(), d, h, m).getTime();
  };
  const done = [
    { day: 'A', t: dia(2, 6, 0), sid: 1, dur: 50 * 60000 },
    { day: 'B', t: dia(3, 6, 30), sid: 2, dur: 50 * 60000 },
    { day: 'C', t: dia(4, 7, 0), sid: 3, dur: 50 * 60000 }
  ];
  const a = await app({ estado: { logs: {}, done: done } });
  a.E('tab("acomp")');

  const linha = a.$$('.mediasem').map(function (x) { return x.textContent.replace(/\s+/g, ' '); })
    .find(function (x) { return /em média/.test(x); });
  assert.ok(linha, 'faltou o bloco de horário');
  assert.ok(/06:30/.test(linha), 'média das três: ' + linha);
  assert.ok(/mais cedo 06:00/.test(linha), linha);
  assert.ok(/mais tarde 07:00/.test(linha), linha);
  a.fechar();
});

test('retroativo sem horário não inventa hora', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + (Date.now() - DIA) + ')');
  a.E('addSet("tipo","B")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  const m = a.J('S.done[0]');
  assert.strictEqual(m.hora, undefined);
  assert.strictEqual(a.E('temHora(S.done[0])'), false);

  a.E('tab("acomp")');
  assert.ok(!/\d{2}:\d{2}/.test(a.texto('.sess-d')), 'nada de 07:00 fantasma: ' + a.texto('.sess-d'));
  a.E('abrirSessao(' + m.t + ')');
  assert.strictEqual(a.$('.horario'), null);
  a.fechar();
});

test('retroativo com horário informado registra a hora', async () => {
  const a = await app();
  const ontem = Date.now() - DIA;
  a.E('abrirAdicionar(' + ontem + ')');
  a.E('addSet("tipo","B")');
  a.digitar('ahora', '05:50');
  await a.E('gravarRetro(false)');
  await a.esperar();

  const m = a.J('S.done[0]');
  assert.strictEqual(m.hora, 1);
  const d = new Date(m.t);
  assert.strictEqual(d.getHours(), 5);
  assert.strictEqual(d.getMinutes(), 50);
  assert.strictEqual(new Date(m.t).toDateString(), new Date(ontem).toDateString(), 'continua ontem');

  a.E('tab("acomp")');
  assert.ok(a.texto('.sess-d').includes('05:50'));
  a.fechar();
});

test('horário inválido é ignorado sem quebrar', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + (Date.now() - DIA) + ')');
  a.E('addSet("tipo","B")');
  a.digitar('ahora', '99:99');
  await a.E('gravarRetro(false)');
  await a.esperar();
  assert.strictEqual(a.E('S.done[0].hora'), undefined, 'cai para sem horário em vez de gravar lixo');
  a.fechar();
});

test('treino avulso não entra na conta de horário', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + (Date.now() - DIA) + ')');
  a.E('addSet("tipo","livre")');
  a.E('addSet("grupo","peito")');
  await a.E('gravarRetro(false)');
  await a.esperar();
  assert.strictEqual(a.E('temHora(S.done[0])'), false);
  a.fechar();
});

test('calendário marca o período do dia', async () => {
  const hoje = new Date();
  const dia = function (d, h) {
    return new Date(hoje.getFullYear(), hoje.getMonth(), d, h, 15).getTime();
  };
  const done = [
    { day: 'A', t: dia(2, 6), sid: 1, dur: 50 * 60000 },    // manhã
    { day: 'B', t: dia(3, 14), sid: 2, dur: 50 * 60000 },   // tarde
    { day: 'C', t: dia(4, 20), sid: 3, dur: 50 * 60000 }    // noite
  ];
  const a = await app({ estado: { logs: {}, done: done } });
  a.E('tab("acomp")');

  const marca = function (n) {
    const cel = a.$$('.cal-d').find(function (c) {
      return c.querySelector('em') && c.querySelector('em').textContent === String(n);
    });
    const per = cel.querySelector('.per');
    return per ? per.textContent + ':' + per.className.replace('per ', '') : null;
  };
  assert.strictEqual(marca(2), '\u{1F305}:manha');
  assert.strictEqual(marca(3), '\u{1F324}\u{FE0F}:tarde');
  assert.strictEqual(marca(4), '\u{1F319}:noite');
  assert.ok(a.texto('.callegenda').includes('manhã'), 'legenda explica os três');
  a.fechar();
});

test('limites das faixas de período', async () => {
  const a = await app();
  const emH = function (h) { const d = new Date(); d.setHours(h, 0, 0, 0); return d.getTime(); };
  assert.strictEqual(a.E('periodoDe(' + emH(5) + ').k'), 'manha');
  assert.strictEqual(a.E('periodoDe(' + emH(11) + ').k'), 'manha');
  assert.strictEqual(a.E('periodoDe(' + emH(12) + ').k'), 'tarde');
  assert.strictEqual(a.E('periodoDe(' + emH(17) + ').k'), 'tarde');
  assert.strictEqual(a.E('periodoDe(' + emH(18) + ').k'), 'noite');
  assert.strictEqual(a.E('periodoDe(' + emH(4) + ').k'), 'noite', 'madrugada é noite');
  a.fechar();
});

test('sem horário medido não há marcador de período', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + (Date.now() - DIA) + ')');
  a.E('addSet("tipo","B")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  a.E('tab("acomp")');
  assert.strictEqual(a.$('.cal-d .per'), null, 'não marca período de hora que ninguém mediu');
  a.fechar();
});
