// Horário do treino. "Normalmente é 6h15, mas não é exato" — então o app
// registra o que aconteceu e nunca inventa o que não mediu.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

function emHoje(h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

test('o relógio diz desde que horas', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.E('S.sessao.inicio = ' + emHoje(6, 22));
  a.v('render');
  assert.strictEqual(a.texto('.day-rel em'), 'desde 06:22');
  a.fechar();
});

test('detalhe da sessão mostra início e fim', async () => {
  const t = emHoje(6, 22) - DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 69 * 60000, fim: 'manual' }]
  } });
  a.v('abrirSessao', t);
  const linha = a.texto('.ss-tempo');
  assert.ok(/6h22/.test(linha), linha);
  assert.ok(/7h31/.test(linha), 'fim derivado da duração: ' + linha);
  a.fechar();
});

test('sessão em andamento mostra só o começo', async () => {
  const a = await app();
  await a.v('iniciarSessao');
  a.E('S.sessao.inicio = ' + emHoje(6, 5));
  a.E('S.done[0].t = ' + emHoje(6, 5));
  const t = a.S().done[0].t;
  a.v('abrirSessao', t);
  const linha = a.texto('.ss-tempo');
  assert.ok(/Começo/.test(linha) && /6h05/.test(linha), linha);
  assert.strictEqual(a.vJ('ctx.detalheDaSessao').fim, null, 'em andamento não tem fim');
  a.fechar();
});

test('o dia aberto mostra a hora da sessão', async () => {
  // A lista do mês saiu (a D: o mês é a entrada, o dia é o lugar). A hora mora
  // na linha da sessão, em prosa: "6h40", sem o zero da frente (frente 3, §7.7).
  const agora = agoraEstavel(6, 40);
  const t = agora - 2 * DIA;
  const a = await app({ agora: agora, estado: {
    logs: {}, done: [{ day: 'A', t: t, sid: t, dur: 50 * 60000, fim: 'manual' }]
  } });
  a.aba('dias');
  a.v('ctx.abreDia', t);
  await a.esperar();
  assert.ok(a.texto('[data-a="dia-sessao"]').includes('6h40 → 7h30'), a.texto('[data-a="dia-sessao"]'));
  a.fechar();
});

test('horário típico do mês, com o mais cedo e o mais tarde', async () => {
  const agora = agoraEstavel();
  const hoje = new Date(agora);
  const dia = function (d, h, m) {
    return new Date(hoje.getFullYear(), hoje.getMonth(), d, h, m).getTime();
  };
  const done = [
    { day: 'A', t: dia(2, 6, 0), sid: 1, dur: 50 * 60000 },
    { day: 'B', t: dia(3, 6, 30), sid: 2, dur: 50 * 60000 },
    { day: 'C', t: dia(4, 7, 0), sid: 3, dur: 50 * 60000 }
  ];
  const a = await app({ agora: agora, estado: { logs: {}, done: done } });
  a.aba('dias');

  const h = a.vJ('ctx.mes').horario;
  assert.strictEqual(h.media, '6h30', 'média das três');
  assert.strictEqual(h.cedo, '6h00');
  assert.strictEqual(h.tarde, '7h00');
  assert.deepStrictEqual(h.pontos, [360, 390, 420], 'e os pontos, para a média não enganar');
  const linha = a.$$('.dm-tres').map(function (x) { return x.textContent; }).find(function (x) { return /média/.test(x); });
  assert.ok(linha && /6h30/.test(linha) && /mais cedo/.test(linha) && /mais tarde/.test(linha), 'na tela: ' + linha);
  a.fechar();
});

test('retroativo sem horário não inventa hora', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora });
  a.v('abrirAdicionar', agora - DIA);
  await a.v('lancaTreino', 'B');
  await a.esperar();

  const m = a.S().done[0];
  assert.strictEqual(m.hora, undefined);
  assert.strictEqual(a.v('temHora', a.S().done[0]), false);

  a.v('ctx.fechaAdicionar');
  a.v('ctx.abreDia', agora - DIA);
  await a.esperar();
  assert.ok(/sem hora/.test(a.texto('[data-a="dia-sessao"]')), 'o dia diz que não tem: ' + a.texto('[data-a="dia-sessao"]'));
  assert.ok(!/\dh\d\d/.test(a.texto('[data-a="dia-sessao"]')), 'nada de 7h00 fantasma');
  a.v('abrirSessao', m.t);
  assert.strictEqual(a.$('.horario'), null);
  a.fechar();
});

test('retroativo com horário informado registra a hora', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora });
  const ontem = agora - DIA;
  a.v('abrirAdicionar', ontem);
  await a.v('lancaTreino', 'B');
  a.clicar('[data-a="lanca-por-hora"]');
  await a.esperar();
  a.digitar('ahora', '05:50');
  await a.esperar();

  const m = a.S().done[0];
  assert.strictEqual(m.hora, 1);
  const d = new Date(m.t);
  assert.strictEqual(d.getHours(), 5);
  assert.strictEqual(d.getMinutes(), 50);
  assert.strictEqual(new Date(m.t).toDateString(), new Date(ontem).toDateString(), 'continua ontem');

  a.v('ctx.fechaAdicionar');
  a.aba('dias');
  a.v('ctx.abreDia', ontem);
  await a.esperar();
  assert.ok(a.texto('[data-a="dia-sessao"]').includes('5h50'), a.texto('[data-a="dia-sessao"]'));
  a.fechar();
});

test('horário inválido é ignorado sem quebrar', async () => {
  const a = await app();
  a.v('abrirAdicionar', (Date.now() - DIA));
  await a.v('lancaTreino', 'B');
  a.clicar('[data-a="lanca-por-hora"]');
  await a.esperar();
  a.digitar('ahora', '99:99');
  await a.esperar();
  assert.strictEqual(a.S().done[0].hora, undefined, 'fica sem horário em vez de gravar lixo');
  assert.ok(a.$('#ahora'), 'e o campo continua ali para ele consertar');
  // e o verbo, chamado por valor, recusa sozinho — não depende do campo
  await a.v('horaDoLancamento', '25:10');
  assert.strictEqual(a.S().done[0].hora, undefined, 'o verbo também não grava lixo');
  a.fechar();
});

test('treino avulso não entra na conta de horário', async () => {
  const a = await app();
  a.v('abrirAdicionar', (Date.now() - DIA));
  await a.v('lancaTreino', 'livre');
  await a.v('grupoDoLancamento', 'peito');
  await a.esperar();
  assert.strictEqual(a.v('temHora', a.S().done[0]), false);
  assert.strictEqual(a.$('[data-a="lanca-por-hora"]'), null, 'e a folha nem oferece a hora');
  a.fechar();
});

test('o período saiu das células; o horário de início mostra os pontos', async () => {
  // Saída declarada pela D (`dias.html`, estado 1): a marca de manhã/tarde/
  // noite nas células saiu, e com ela a legenda. Quando ele treina está no
  // horário de início, com cada sessão como um ponto no eixo.
  const agora = agoraEstavel();
  const hoje = new Date(agora);
  const dia = function (d, h) {
    return new Date(hoje.getFullYear(), hoje.getMonth(), d, h, 15).getTime();
  };
  const done = [
    { day: 'A', t: dia(2, 6), sid: 1, dur: 50 * 60000 },
    { day: 'B', t: dia(3, 14), sid: 2, dur: 50 * 60000 },
    { day: 'C', t: dia(4, 20), sid: 3, dur: 50 * 60000 }
  ];
  const a = await app({ agora: agora, estado: { logs: {}, done: done } });
  a.aba('dias');

  assert.strictEqual(a.$('.per'), null, 'nenhuma célula com período');
  assert.strictEqual(a.$('.callegenda'), null, 'nem legenda');
  assert.strictEqual(a.$$('.dm-eixo-p').length, 3, 'um ponto por sessão no eixo');
  a.fechar();
});

test('limites das faixas de período', async () => {
  const a = await app();
  const emH = function (h) { const d = new Date(); d.setHours(h, 0, 0, 0); return d.getTime(); };
  assert.strictEqual(a.vJ('periodoDe', emH(5)).k, 'manha');
  assert.strictEqual(a.vJ('periodoDe', emH(11)).k, 'manha');
  assert.strictEqual(a.vJ('periodoDe', emH(12)).k, 'tarde');
  assert.strictEqual(a.vJ('periodoDe', emH(17)).k, 'tarde');
  assert.strictEqual(a.vJ('periodoDe', emH(18)).k, 'noite');
  assert.strictEqual(a.vJ('periodoDe', emH(4)).k, 'noite', 'madrugada é noite');
  a.fechar();
});

test('sem horário medido não há ponto no horário de início', async () => {
  // O marcador de período nas células saiu pela D; o que guarda a mesma regra
  // agora é o eixo do horário de início: hora que ninguém mediu não vira ponto.
  const agora = agoraEstavel();
  const a = await app({ agora: agora });
  a.v('abrirAdicionar', agora - DIA);
  await a.v('lancaTreino', 'B');
  a.v('ctx.fechaAdicionar');
  await a.esperar();

  a.aba('dias');
  assert.strictEqual(a.vJ('ctx.mes').horario, null, 'sem sessão com hora, não há horário de início');
  assert.strictEqual(a.$$('.dm-eixo-p').length, 0);
  a.fechar();
});

test('trocar de mês não mexe na posição de leitura', async () => {
  // As setas do mês ficam no MEIO da página. Subir ao topo a cada toque obrigava
  // a rolar de volta até elas para dar o toque seguinte — comparar três meses
  // custava três rolagens. Trocar de mês é atualizar o dado da mesma tela, não
  // entrar em lugar nenhum (§3 do contrato de UX).
  const a = await app();
  a.aba('dias');

  const pedidos = [];
  a.window.scrollTo = function (x, top) {
    pedidos.push(x && typeof x === 'object' ? x.top : top);
  };

  a.v('mudaMes', -1);
  await a.esperar();
  assert.strictEqual(a.vista().mes, -1, 'andou um mês para trás');
  assert.deepStrictEqual(pedidos, [], 'e não pediu rolagem nenhuma');

  a.v('mudaMes', 1);
  await a.esperar();
  assert.strictEqual(a.vista().mes, 0, 'e volta sem rolar também');
  assert.deepStrictEqual(pedidos, []);
  a.fechar();
});

test('recorde não é pintado de ácido: o app não comemora por cor', async () => {
  // A decisão da revisão de design: ácido significa agora, feito, seu e aperte
  // aqui — nenhum dos quatro é "melhor que antes". O número do recorde continua
  // na tela; o que sai é o elogio por cor.
  const antes = emHoje(6, 22) - 8 * DIA;
  const t = emHoje(6, 22) - DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: antes, sid: antes, sets: [[40, 10]] }, { t: t, sid: t, sets: [[50, 10]] }] },
    done: [{ day: 'A', t: antes, sid: antes, dur: 60 * 60000, fim: 'manual' },
           { day: 'A', t: t, sid: t, dur: 60 * 60000, fim: 'manual' }]
  } });
  a.v('abrirSessao', t);
  const v = a.vJ('ctx.detalheDaSessao');
  const rec = v.stats.filter(function (x) { return /recorde/.test(x.rotulo); })[0];
  assert.ok(rec, 'a linha de recordes existe');
  assert.strictEqual(rec.valor, '1', '40 kg para 50 kg é recorde de carga');
  assert.ok(!rec.cor, 'e não vem com cor nenhuma');
  a.fechar();
});
