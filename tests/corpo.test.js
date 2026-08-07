// Acompanhamento corporal: média semanal e as três regras de ajuste.
// O peso do dia não decide nada; quem decide é a média e o ritmo entre semanas.
const { test } = require('node:test');
const assert = require('node:assert');
const { app, inicioDaSemana, DIA } = require('./harness');

// Gera pesagens dentro de cada semana alvo, com ruído que se anula na média.
function pesagens(medias) {
  const seg = inicioDaSemana(Date.now());
  const agora = Date.now();
  const ruido = [0.4, -0.3, 0.2, -0.3];
  const out = [];
  medias.forEach(function (m, idx) {
    const semana = seg - (medias.length - 1 - idx) * 7 * DIA;
    for (let j = 0; j < 4; j++) {
      const t = semana + j * DIA + 10 * 3600000;
      if (t <= agora) out.push({ t: t, v: Math.round((m + ruido[j]) * 100) / 100 });
    }
  });
  return out;
}

function medidas(pares) {   // [{diasAtras, valor}]
  return pares.map(function (p) { return { t: Date.now() - p.d * DIA, v: p.v }; })
              .sort(function (x, y) { return x.t - y.t; });
}

async function veredito(peso, cintura) {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: peso || [], cintura: cintura || [] } } });
  a.E('tab("corpo")');
  const r = { titulo: a.texto('.verdict-t'), texto: a.texto('.verdict p'), classe: a.$('.verdict').className };
  a.fechar();
  return r;
}

test('ganho travado manda comer mais', async () => {
  const v = await veredito(pesagens([73.0, 73.05, 73.10]));
  assert.strictEqual(v.titulo, 'Comer mais');
  assert.ok(v.texto.includes('0,05'), v.texto);
  assert.ok(v.texto.includes('abaixo de 0,15'));
});

test('ganho rápido manda comer menos', async () => {
  const v = await veredito(pesagens([73.0, 73.6, 74.2]));
  assert.strictEqual(v.titulo, 'Comer menos');
  assert.ok(v.texto.includes('0,60'));
  assert.ok(v.texto.includes('acima de 0,4'));
});

test('ganho na faixa manda manter', async () => {
  const v = await veredito(pesagens([73.0, 73.25, 73.5]));
  assert.strictEqual(v.titulo, 'Manter como está');
  assert.ok(v.texto.includes('0,25'));
});

test('limite exato de 0,15 ainda é comer mais', async () => {
  const v = await veredito(pesagens([73.0, 73.15, 73.30]));
  assert.strictEqual(v.titulo, 'Comer mais');
});

test('limite exato de 0,40 ainda é manter', async () => {
  const v = await veredito(pesagens([73.0, 73.40, 73.80]));
  assert.strictEqual(v.titulo, 'Manter como está');
});

test('perdendo peso: o texto não diz que subiu', async () => {
  const v = await veredito(pesagens([73.5, 73.2, 73.0]));
  assert.strictEqual(v.titulo, 'Comer mais');
  assert.ok(v.texto.includes('caiu'), 'não pode dizer "subiu −0,25": ' + v.texto);
});

test('cintura estourando manda comer menos mesmo com peso na faixa', async () => {
  const v = await veredito(
    pesagens([73.0, 73.25, 73.5]),
    medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  );
  assert.strictEqual(v.titulo, 'Comer menos');
  assert.ok(v.texto.includes('cintura'));
});

test('cintura dentro do limite não sobrepõe o peso', async () => {
  const v = await veredito(
    pesagens([73.0, 73.25, 73.5]),
    medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.2 }, { d: 7, v: 80.5 }, { d: 0, v: 80.7 }])
  );
  assert.strictEqual(v.titulo, 'Manter como está');
});

test('uma semana só não aplica a regra', async () => {
  const v = await veredito(pesagens([73.0]));
  assert.strictEqual(v.titulo, 'Faltam dados');
});

test('duas semanas avisam que falta uma', async () => {
  const v = await veredito(pesagens([73.0, 73.25]));
  assert.strictEqual(v.titulo, 'Falta uma semana');
  assert.ok(v.texto.includes('2 semanas'));
});

test('sem nada registrado pede registro', async () => {
  const v = await veredito([]);
  assert.strictEqual(v.titulo, 'Faltam dados');
});

test('cintura usa média semanal, não medida solta', async () => {
  const a = await app({ estado: { logs: {}, done: [], body: { peso: [],
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 26, v: 80.4 }, { d: 2, v: 82.2 }, { d: 0, v: 81.8 }]) } } });
  const medias = a.J('mediasSemanais(S.body.cintura).map(function (x) { return Math.round(x.v*100)/100; })');
  assert.ok(medias.length >= 2);
  assert.strictEqual(medias[0], 80.2, 'as duas medidas da mesma semana viram média');
  a.fechar();
});

test('registro aceita vírgula e substitui a medida do mesmo dia', async () => {
  const a = await app();
  a.E('tab("corpo")');
  a.digitar('bpeso', '73,4');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso[0].v'), 73.4, 'vírgula do teclado pt-BR');

  a.digitar('bpeso', '73,8');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso.length'), 1, 'uma medida por dia');
  assert.strictEqual(a.E('S.body.peso[0].v'), 73.8);
  a.fechar();
});

test('entrada inválida não grava', async () => {
  const a = await app();
  a.E('tab("corpo")');
  a.digitar('bpeso', 'abc');
  await a.E('addBody("peso")');
  await a.esperar();
  assert.strictEqual(a.E('S.body.peso.length'), 0);
  assert.ok(a.toast().includes('número válido'));
  a.fechar();
});

test('cardio conta a semana e reseta na segunda', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [], cardio: [
    { t: seg - 3 * DIA, m: 'bike', min: 20, i: 'leve' },      // semana passada
    { t: seg + 3600000, m: 'bike', min: 20, i: 'leve' }       // esta semana
  ] } });
  a.E('tab("corpo")');
  assert.strictEqual(a.E('cardioSemana().length'), 1, 'a da semana passada não conta');
  // três cartões .week na aba corpo, nesta ordem: peso, cintura, cardio
  const cardio = a.$$('.week-n')[2];
  assert.ok(cardio.textContent.trim().startsWith('1'), cardio.textContent);
  a.fechar();
});

test('cardio avisa quando houve treino de perna no mesmo dia', async () => {
  const a = await app({ estado: { logs: {}, done: [{ day: 'C', t: Date.now(), sid: Date.now() }] } });
  a.E('tab("corpo")');
  assert.ok(a.texto('.cwarn').includes('treino C'), 'deve sinalizar sem bloquear');
  assert.strictEqual(a.$('.cwarn ~ .dbtn[disabled]'), null);
  a.fechar();
});

test('nada na interface de cardio fala em caloria', async () => {
  const a = await app();
  a.E('tab("corpo")');
  const txt = a.doc.getElementById('app').textContent.toLowerCase();
  assert.ok(!/calor|gasto energ|queima|hiit/.test(txt), 'ele está em superávit; cardio não é queima');
  a.fechar();
});
