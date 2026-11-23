// Dias no visual novo (direção 3, Fase 4): o mês em grade, o dia escolhido
// com a pergunta da comida, e "responder os dias" um por tela, com voltar um
// e "os que faltam". As respostas gravam pela porta de sempre (respondeODia).

import { test, vi } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { app, agoraEstavel, DIA } from './harness.js';
import { dataLocal } from '../../src/dominio/protocolo';

async function emDias(hist) {
  const a = await app({ aba: 'dias', agora: agoraEstavel(10), estado: { logs: {}, done: [], comidaHist: hist || [] } });
  await a.pronto();
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  return a;
}
const iso = n => dataLocal(agoraEstavel(10) - n * DIA);

test('o mês em grade, e o dia escolhido pergunta pela comida', async () => {
  const a = await emDias();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Dias');
  assert.equal(a.window.getComputedStyle(a.$('.v3-cab h1')).flexGrow, '0');
  assert.ok(a.$$('.v3-dia').length >= 28, 'os dias do mês');
  const ontem = iso(1);   // o harness fixa o dia 15: ontem está no mês
  a.clicar(`[data-a="dia-${ontem}"]`);
  await a.esperar();
  assert.ok(/comida deste dia/.test(a.texto('.v3-perg')), 'a pergunta do dia');
  a.clicar('.v3-perg-r button:nth-child(2)');
  await a.esperar(60);
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(ontem)})`), 'quase');
  // respondida, a pergunta fica com a resposta marcada: tocar outra corrige
  assert.ok(/Comida: quase como o plano/.test(a.texto('.v3-perg')), a.texto('.v3-perg'));
  assert.strictEqual(a.$('.v3-perg-r button:nth-child(2)').getAttribute('aria-checked'), 'true');
  a.clicar('.v3-perg-r button:nth-child(1)');
  await a.esperar(60);
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(ontem)})`), 'sim', 'corrigida');
  a.fechar();
});

test('responder os dias: um por tela, voltar um, e "os que faltam" de uma vez', async () => {
  const a = await emDias();
  a.clicar('[data-a="responder-dias"]');
  await a.esperar();
  let r = a.vJ('ctx.responderDiasV3');
  assert.strictEqual(r.total, 13, 'os 13 dias antes de hoje, todos em branco');
  a.clicar('[data-a="resp-sim"]');
  await a.esperar(40);
  r = a.vJ('ctx.responderDiasV3');
  assert.strictEqual(r.i, 1, 'andou');
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(iso(1))})`), 'sim', 'o primeiro, o mais recente (ontem), gravado');
  a.clicar('[data-a="resp-volta"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.responderDiasV3').i, 0, 'voltou um');
  assert.ok(/Você respondeu “foi, sim”/.test(a.texto('[data-a="resp-ja"]')), 'e mostra a resposta que já deu');
  a.clicar('[data-a="resp-naosei"]');
  await a.esperar(40);
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(iso(1))})`), 'naosei', 'corrigido');
  a.clicar('[data-a="resp-todos"]');
  await a.esperar(80);
  assert.ok(!a.vJ('ctx.responderDiasV3').atual, 'acabou');
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(iso(13))})`), 'sim', 'os que faltavam, como o plano');
  assert.ok(/13 dias respondidos/.test(a.texto('.v3-acao h1')), a.texto('.v3-acao h1'));
  a.fechar();
});

test('dia sem treino aceita falta, motivo opcional, correção e treino registrado depois', async () => {
  const a = await emDias();
  const d = iso(1);
  const toca = async seletor => { a.clicar(seletor); await a.esperar(); };
  try {
    assert.equal(a.$('[data-a="frequencia-falta"]'), null, 'hoje continua em curso');
    await toca('[data-a="dia-' + d + '"]');
    assert.match(a.texto('.v3-cal-freq'), /O que foi esse dia\?/);
    await toca('[data-a="frequencia-falta"]');
    assert.deepEqual(a.$$('.v3-cal-freq [data-a^="motivo-"]').map(b => b.textContent), ['doença', 'preguiça', 'viagem', 'trabalho', 'outro']);
    assert.equal(a.gravado().falta[d], undefined, 'escolher Falta ainda não guarda');
    await toca('[data-a="frequencia-guardar"]');
    assert.equal(a.gravado().falta[d].motivo, undefined);
    await toca('[data-a="motivo-viagem"]');
    await toca('[data-a="frequencia-falta"]');
    assert.equal(a.gravado().falta[d].motivo, 'viagem');
    await toca('[data-a="dia-abre"]');
    assert.match(a.texto('.v3-lin-t'), /Falta.*viagem/);
    a.v('ctx.fechaDia'); await a.esperar();
    await toca('[data-a="dia-' + d + '"]');
    await toca('[data-a="frequencia-descanso"]');
    assert.ok(a.gravado().descanso[d]);
    assert.equal(a.gravado().falta[d], undefined);
    assert.equal(a.$('[data-a="motivo-viagem"]'), null);
    await toca('[data-a="frequencia-falta"]');
    await toca('[data-a="motivo-outro"]');
    await toca('[data-a="motivo-outro"]');
    assert.equal(a.gravado().falta[d].motivo, undefined);
    await toca('[data-a="motivo-viagem"]');
    const marca = a.gravado().falta[d], lapides = a.gravado().apagados;
    a.v('abrirAdicionar', agoraEstavel(10) - DIA);
    await a.v('lancaTreino', 'livre');
    const sessao = a.gravado().done.find(x => x.livre);
    assert.deepEqual(a.gravado().falta[d], marca);
    assert.deepEqual(a.gravado().apagados, lapides);
    a.v('ctx.fechaAdicionar'); await a.esperar();
    await toca('[data-a="dia-' + d + '"]');
    assert.match(a.texto('.v3-cal-det .v3-quadros'), /Treino fora/);
    assert.equal(a.$('.v3-cal-freq'), null);
    await toca('[data-a="dia-abre"]');
    assert.ok(a.$('[data-a="dia-sessao"]'));
    assert.doesNotMatch(a.texto('.v3-lin-t'), /Falta|viagem/);
    await a.v('ctx.editaSessao', sessao.t);
    assert.deepEqual(a.gravado().falta[d], marca);
    assert.match(a.texto('.v3-lin-t'), /Falta.*viagem/);
    await toca('.v3-cab [aria-label="Voltar"]');
    assert.match(a.texto('.v3-cal-det .v3-quadros'), /Falta.*viagem/);
  } finally { a.fechar(); }
});

test('descartar a sessão aberta hoje devolve o descanso com o carimbo original', async () => {
  const a = await emDias(), hoje = iso(0);
  try {
    await a.v('alternaDescanso', agoraEstavel(10));
    const marca = a.gravado().descanso[hoje];
    assert.ok(marca);
    await a.v('iniciarSessao');
    assert.ok(a.S().sessao);
    assert.equal(a.vJ('ctx.mes').celulas.find(d => d.hoje).descanso, false);
    await a.v('finalizarSessao');
    assert.equal(a.S().sessao, null);
    assert.deepEqual(a.gravado().done, []);
    assert.equal(a.gravado().descanso[hoje], marca);
    assert.equal(a.gravado().apagados['descanso:' + hoje], undefined);
    assert.equal(a.vJ('ctx.mes').celulas.find(d => d.hoje).descanso, true);
  } finally { a.fechar(); }
});

for (const porta of ['boot', 'importação']) {
  test(porta + ' do plano 12 conserva os dois descansos, inclusive o do dia com sessão', async () => {
    const fixture = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-12.json', import.meta.url)));
    const agora = new Date(2026, 10, 16, 10).getTime();
    const a = await app({ agora, estado: porta === 'boot' ? fixture : null });
    try {
      if (porta === 'importação') await a.v('importText', JSON.stringify(fixture));
      const s = a.S(), dias = a.vJ('ctx.mes').celulas;
      assert.equal(fixture.plano, 12);
      assert.equal(s.plano, 13);
      assert.deepEqual(Object.keys(s.descanso).sort(), ['2026-11-14', '2026-11-15']);
      assert.deepEqual(s.descanso, fixture.descanso);
      assert.deepEqual(s.apagados, fixture.apagados);
      assert.deepEqual(s.done, fixture.done);
      assert.deepEqual(s.falta, {});
      assert.equal(dias.find(c => c.n === 14).descanso, true);
      assert.equal(dias.find(c => c.n === 15).descanso, false);
      await a.v('ctx.editaSessao', s.done[0].t);
      assert.equal(a.vJ('ctx.mes').celulas.find(c => c.n === 15).descanso, true);
      assert.deepEqual(a.gravado().descanso, fixture.descanso);
    } finally { a.fechar(); }
  });

  test(porta + ' resolve respostas concorrentes e lápides e conserva uma falta de versão posterior inteira', async () => {
    const agora = agoraEstavel(10), d = iso(1), retirado = iso(2);
    const falta = { m: agora, motivo: 'plantão', detalhe: { turnos: ['noite'] } };
    const estado = { plano: 13, logs: {}, done: [], descanso: { [d]: agora - 1 }, falta: { [d]: falta, [retirado]: { m: agora } },
      apagados: { ['falta:' + retirado]: agora } };
    const a = await app({ agora, estado: porta === 'boot' ? estado : null });
    try {
      if (porta === 'importação') await a.v('importText', JSON.stringify({ data: estado }));
      assert.deepEqual(a.S().descanso, {});
      assert.deepEqual(a.S().falta, { [d]: falta });
      assert.equal(a.S().apagados['descanso:' + d], agora);
      const copia = JSON.parse(a.v('payload')).data;
      assert.deepEqual(copia.falta, { [d]: falta });
      assert.equal(copia.apagados['descanso:' + d], agora);
    } finally { a.fechar(); }
  });
}

test('Tirar a resposta volta ao ponto de interrogação e grava as lápides de descanso e falta', async () => {
  const a = await emDias(), d = iso(1), celula = '[data-a="dia-' + d + '"]';
  const toca = async s => { a.clicar(s); await a.esperar(); };
  const foco = vi.spyOn(a.window.HTMLElement.prototype, 'focus');
  try {
    await toca(celula);
    for (const escolha of ['descanso', 'falta']) {
      assert.equal(a.texto('.v3-cal-freq > p'), 'O que foi esse dia?');
      await toca('[data-a="frequencia-' + escolha + '"]');
      if (escolha === 'falta') await toca('[data-a="frequencia-guardar"]');
      assert.equal(a.texto('.v3-cal-freq > p'), 'Descanso ou falta?');
      if (escolha === 'falta') await toca('[data-a="motivo-viagem"]');
      const s = a.gravado(), em = s.descanso[d] || s.falta[d].m;
      const tirar = a.$('[data-a="frequencia-tirar"]');
      assert.equal(tirar.textContent, 'Tirar a resposta');
      tirar.focus();
      await toca('[data-a="frequencia-tirar"]');
      assert.equal(a.texto(celula + ' .v3-cal-bola'), '?');
      assert.equal(a.$('[data-a="frequencia-tirar"]'), null);
      assert.equal(a.doc.activeElement.dataset.a, 'frequencia-descanso');
      assert.equal(a.doc.activeElement.getAttribute('aria-checked'), 'false');
      assert.equal(foco.mock.lastCall[0]?.preventScroll, true);
      const depois = a.gravado();
      assert.equal(depois.descanso[d], undefined);
      assert.equal(depois.falta[d], undefined);
      for (const chave of ['descanso:', 'falta:']) assert.ok(depois.apagados[chave + d] > em);
      assert.deepEqual(a.vJ('funde', s, depois, em + 10).estado.falta, {});
      assert.deepEqual(a.vJ('funde', depois, s, em + 10).estado.descanso, {});
    }
    assert.equal(a.texto('.v3-cal-freq > p'), 'O que foi esse dia?');
  } finally { foco.mockRestore(); a.fechar(); }
});

test('tirar a falta com motivo reserva a altura do cartão só enquanto aquele dia está aberto', async () => {
  const a = await emDias();
  const toca = async seletor => { a.clicar(seletor); await a.esperar(); };
  try {
    await toca('[data-a="dia-' + iso(1) + '"]');
    await toca('[data-a="frequencia-falta"]');
    await toca('[data-a="motivo-viagem"]');
    const cartao = a.$('.v3-cal-det');
    // O jsdom não calcula layout. Simulamos uma caixa 112 px menor sem os motivos.
    const alturaComMotivos = 527.5;
    cartao.getBoundingClientRect = () => ({ height: cartao.querySelector('[data-a="motivo-viagem"]') ? alturaComMotivos : alturaComMotivos - 112 });
    await toca('[data-a="frequencia-tirar"]');
    assert.equal(a.$('[data-a="motivo-viagem"]'), null);
    assert.equal(a.window.getComputedStyle(a.$('.v3-cal-det')).minHeight, alturaComMotivos + 'px');
    await toca('[data-a="dia-' + iso(2) + '"]');
    assert.equal(a.$('.v3-cal-det').style.minHeight, '');
  } finally { a.fechar(); }
});

test('abrir um dia de outro mês e voltar mantém o mês, a célula e o cartão escolhidos', async () => {
  const a = await emDias();
  const toca = async s => { a.clicar(s); await a.esperar(); };
  try {
    await toca('[data-a="mes-anterior"]');
    const mes = a.texto('.v3-mes-nav b'), escolhido = a.$$('.v3-cal button')[6].dataset.a;
    await toca('[data-a="' + escolhido + '"]');
    const titulo = a.texto('.v3-cal-det h2');
    await toca('[data-a="dia-abre"]');
    assert.equal(a.texto('.v3-cab h1'), titulo);
    await toca('.v3-cab [aria-label="Voltar"]');
    assert.equal(a.texto('.v3-mes-nav b'), mes);
    assert.equal(a.$('.v3-cal [aria-pressed="true"]').dataset.a, escolhido);
    assert.equal(a.texto('.v3-cal-det h2'), titulo);
  } finally { a.fechar(); }
});

test('a grade aplica tinta na menta, os dois aros e a tipografia do treino e da legenda', async () => {
  const agora = agoraEstavel(7);
  const ontem = agora - DIA;
  const a = await app({ agora, aba: 'dias', estado: { plano: 13, logs: {},
    done: [{ t: agora, sid: agora, day: 'A' }, { t: ontem, sid: ontem, day: 'HX' }],
    cardio: [{ t: ontem, min: 20, m: 'bike' }], descanso: { [iso(2)]: ontem },
    body: { cintura: [{ t: ontem, v: 83 }] },
    protocolo: { sessoes: [{ d: iso(1), fotos: { frente: { v: ontem } } }] }
  } });
  try {
    const dia = n => a.$('[data-a="dia-' + iso(n) + '"]');
    const css = el => a.window.getComputedStyle(el);
    const raiz = css(a.doc.documentElement);
    const token = k => raiz.getPropertyValue(k).trim();
    const dentro = (n, seletor) => css(dia(n).querySelector(seletor));
    for (const resposta of ['sim', 'quase']) {
      for (const n of [0, 1, 2, 3]) await a.v('ctx.respondeODia', iso(n), resposta);
      for (const n of [0, 1, 2, 3]) assert.equal(css(dia(n)).getPropertyValue('--dia-tinta').trim(), 'var(--texto)');
      assert.equal(dentro(0, 'small').color, 'var(--texto-sobre-acao)');
      for (const [n, seletor] of [[1, 'small'], [1, '.v3-cal-corpo'], [2, '.desc'], [3, '.aberto']]) {
        assert.match(dentro(n, seletor).color, /var\(--dia-tinta,/);
      }
      assert.equal(dia(1).querySelectorAll('.v3-cal-corpo svg').length, 2);
      assert.equal(css(dia(1)).getPropertyValue('--dia-fundo').trim(), resposta === 'sim' ? 'var(--assunto-feito)' : 'var(--fundo)');
    }
    const hx = dentro(1, '.hx.cardio'), leg = css(a.$('.v3-cal-leg .hx'));
    assert.equal(dentro(0, '.treino').font, 'var(--t-letra-treino)');
    assert.equal(hx.font, 'var(--t-sigla-treino)');
    assert.equal(leg.font, hx.font);
    assert.equal(token('--t-letra-treino'), '800 16px/1 var(--f-titulo)');
    assert.equal(token('--t-sigla-treino'), '800 12px/1 var(--f-titulo)');
    assert.equal(leg.minWidth, 'var(--e-9)'); assert.equal(token('--e-9'), '26px');
    assert.match(hx.boxShadow, /inset.*var\(--anel-cardio\)/);
    assert.match(hx.getPropertyValue('--anel-cardio'), /var\(--fio-escolhido\) var\(--dia-fundo\),\s*0 0 0 calc\(var\(--fio-escolhido\) \+ var\(--fio-fino\)\) var\(--texto\)/);
    assert.deepEqual([token('--fio-escolhido'), token('--fio-fino')], ['2.5px', '1.5px']);
    assert.equal(dentro(0, '.v3-cal-arco').right, '0px');
    assert.equal(dentro(1, '.v3-cal-arco').right, 'var(--e-1)');
    assert.match(css(dia(1)).boxShadow, /inset 0 0 0 var\(--dia-contorno-quase\) var\(--divisoria\)/);
    assert.equal(token('--dia-contorno-quase'), '1px');
  } finally { a.fechar(); }
});

test('o mês distingue as respostas da comida, os três turnos, HYROX e os registros do corpo', async () => {
  const agora = agoraEstavel(10), t = n => agora - n * DIA;
  const hora = (n, h) => new Date(t(n)).setHours(h, 0, 0, 0);
  const treinos = [[0, 7, 'A'], [1, 6, 'HX'], [2, 15, 'B'], [2, 17, 'C'], [3, 21, 'D']];
  const hist = (n, a) => ({ d: iso(n), done: { almoco: t(n) }, ...(a && { pordia: 1, aderencia: a }), agua: 0, escala: {}, pv: 1, tot: {} });
  const a = await app({ aba: 'dias', agora, estado: { plano: 12, logs: {},
    done: treinos.map(([n, h, day]) => ({ t: hora(n, h), sid: hora(n, h), day })),
    comidaHist: [hist(1, 'plano'), hist(2, 'fora'), hist(3), hist(4, 'perdido')],
    cardio: [{ t: hora(1, 7), m: 'bike', min: 15 }, { t: hora(5, 17), m: 'bike', min: 10 }],
    body: { cintura: [{ t: t(1), v: 85 }], dobraCoxa: [{ t: t(3), v: 10 }], peso: [{ t: t(5), v: 77.1 }] },
    protocolo: { sessoes: [{ d: iso(1), fotos: { frente: { v: t(1) } } }, { d: iso(2), fotos: {} }] }
  } });
  const celula = n => a.$('[data-a="dia-' + iso(n) + '"]');
  try {
    assert.deepEqual(a.$$('.v3-cal-resumo div b').map(e => e.textContent), ['4', '4 de 14', '16h00']);
    assert.match(a.texto('.v3-cal-resumo'), /até ontem/);
    assert.equal(celula(1).querySelector('.hx.cardio').textContent, 'HX');
    assert.equal(celula(1).dataset.comida, 'sim');
    assert.equal(celula(2).dataset.comida, 'quase');
    assert.deepEqual([1, 2, 3].map(n => celula(n).querySelector('circle').getAttribute('cx')), ['3', '15', '27']);
    assert.deepEqual([1, 2, 3, 5].map(n => celula(n).querySelectorAll('.v3-cal-corpo svg').length), [2, 0, 1, 0]);
    assert.equal(celula(5).querySelector('.aberto.cardio').textContent, '?');
    assert.ok(celula(0).classList.contains('hoje'));
    assert.ok(celula(-1).disabled);
    assert.equal(celula(-1).children.length, 1);
    celula(1).click(); await a.esperar();
    assert.match(a.texto('.v3-cal-det'), /Também: fotos · medidas/);
    assert.match(a.texto('.v3-reg-cardio-ok'), /Cardio: 15 min de bike\./);
    celula(3).click(); await a.esperar();
    assert.match(a.texto('.v3-cal-det'), /Por refeição/);
    assert.equal(celula(3).dataset.comida, 'com');
    celula(4).click(); await a.esperar();
    assert.match(a.texto('.v3-cal-det .v3-quadros'), /Não lembro/);
    assert.equal(celula(4).dataset.comida, 'naosei');
    a.clicar('[data-a="mes-anterior"]'); await a.esperar();
    assert.ok(a.$('.v3-cal-det') && a.$('.v3-cal [aria-pressed="true"]'));
    assert.match(a.texto('.v3-cal-resumo div:nth-child(2)'), /0 de (28|29|30|31)/);
  } finally { a.fechar(); }
});

test('mês de seis semanas mostra todos os dias e deixa a resposta de hoje fora dos fechados', async () => {
  const agora = new Date(2026, 7, 31, 10).getTime();
  const a = await app({ aba: 'dias', agora, estado: { plano: 12, logs: {}, done: [] } });
  try {
    const grade = a.$('.v3-cal[role="group"]');
    assert.equal(grade.children.length, 37, '6 espaços até sábado e 31 datas');
    assert.equal(grade.querySelectorAll('button').length, 31);
    a.clicar('.v3-cal-det .v3-perg-r button');
    await a.esperar();
    assert.equal(grade.querySelector('.hoje').dataset.comida, 'sim');
    assert.match(a.texto('.v3-cal-resumo'), /0 de 30/);
    assert.match(a.texto('.v3-cal-det .v3-quadros'), /No plano/);
  } finally { a.fechar(); }
});
