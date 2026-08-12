// Acompanhamento corporal: média semanal e as três regras de ajuste.
// O peso do dia não decide nada; quem decide é a média e o ritmo entre semanas.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, inicioDaSemana, DIA } from './harness.js';

// Gera pesagens dentro de cada semana alvo, com ruído que se anula na média.
// Âncora na última semana FECHADA, nunca na semana em curso: rodando numa
// segunda-feira, a semana atual teria uma pesagem só e a média viraria ruído.
function pesagens(medias) {
  const ultima = inicioDaSemana(Date.now()) - 7 * DIA;
  const ruido = [0.4, -0.3, 0.2, -0.3];
  const out = [];
  medias.forEach(function (m, idx) {
    const semana = ultima - (medias.length - 1 - idx) * 7 * DIA;
    for (let j = 0; j < 4; j++) {
      out.push({ t: semana + j * DIA + 10 * 3600000, v: Math.round((m + ruido[j]) * 100) / 100 });
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

// As REGRAS estão em tests/dominio/corpo.test.ts, onde custam microssegundos e
// dá para varrer os limites exatos. O que sobra aqui é a ligação: o veredito
// calculado precisa chegar na tela, e chegar no lugar certo.
test('o veredito da regra é o que aparece na aba corpo', async () => {
  const a = await app({ estado: { logs: [], done: [],
    body: { peso: pesagens([73.0, 73.05, 73.10]), cintura: [] } } });
  a.aba('dados');
  // o veredito é o cartão do Instrumento; o legado saiu de DADOS para não
  // aparecer duas vezes na mesma tela
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Comer mais');
  assert.strictEqual(a.texto('.ins-veredito-p'), a.E('veredito().p'), 'a tela não reescreve o texto');
  assert.ok(a.$('.ins-veredito'), 'e é um objeto destacado, com borda');
  a.fechar();
});

test('cintura tem precedência sobre o peso, e a tela diz por quê', async () => {
  const a = await app({ estado: { logs: [], done: [], body: {
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  } } });
  a.aba('dados');
  assert.strictEqual(a.texto('.ins-veredito-t'), 'Comer menos');
  assert.ok(a.texto('.ins-veredito-p').includes('cintura'));
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
