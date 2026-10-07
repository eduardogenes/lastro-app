// O treino esquecido: 1h30 sem série nova.
//
// Eram 4 horas, e 4 horas nunca encerraram nada de útil — quem esquece guarda
// o celular e só reabre no dia seguinte, quando a virada do dia já tinha
// fechado a sessão.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const MIN = 60 * 1000;

/** Sessão aberta de verdade, com uma série registrada. */
async function comSessao() {
  const a = await app();
  a.v('go', 'A');
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  assert.ok(a.S().sessao, 'a sessão nasceu na primeira série');
  return a;
}

/**
 * Envelhece a parada sem mexer em `inicio`.
 *
 * `encerraSePreciso` também olha `sameDay(s.inicio)`, e recuar o início faria
 * a suíte falhar quando rodasse depois da meia-noite — exatamente o tipo de
 * fixture dependente de relógio que já quebrou dois testes deste repo.
 */
function parada(a, minutos) {
  a.E(`S.sessao.ultima = Date.now() - ${minutos} * ${MIN}`);
}

test('antes de 1h30 a faixa é atalho, não pergunta', async () => {
  const a = await comSessao();
  parada(a, 80);
  a.aba('comida');
  assert.strictEqual(a.vJ('ctx.faixaDaSessao').tipo, 'atalho');
  a.fechar();
});

test('passando de 1h30 a faixa pergunta, e pergunta até na aba de treino', async () => {
  // Quem esquece de finalizar costuma ter esquecido olhando justamente para ela.
  const a = await comSessao();
  parada(a, 95);
  a.aba('treino');
  const f = a.vJ('ctx.faixaDaSessao');
  assert.strictEqual(f.tipo, 'pergunta');
  assert.ok(a.$('.ins-faixa-p'), 'e está na tela');
  // `.ins-faixa-q`, e não a sobrancelha: a pergunta é prosa em display, porque
  // rótulo mono de 9px não é onde se lê uma frase.
  assert.ok(a.texto('.ins-faixa-q').includes('sem série nova'), a.texto('.ins-faixa-q'));
  a.fechar();
});

test('pausado não conta como esquecido: pausar é aviso, não ausência', async () => {
  const a = await comSessao();
  await a.v('pausarSessao');
  a.E(`S.sessao.pausadoEm = Date.now() - 200 * ${MIN}`);
  a.aba('comida');
  assert.strictEqual(a.vJ('ctx.faixaDaSessao').tipo, 'atalho',
    'cobrar inatividade de quem avisou que parou seria punir o aviso');
  a.fechar();
});

test('"continuo treinando" zera o relógio e devolve o atalho', async () => {
  const a = await comSessao();
  parada(a, 95);
  a.aba('comida');
  assert.strictEqual(a.vJ('ctx.faixaDaSessao').tipo, 'pergunta');

  await a.v('ctx.continuaSessao');
  await a.esperar();
  assert.ok(a.S().sessao, 'a sessão continua aberta');
  assert.strictEqual(a.vJ('ctx.faixaDaSessao').tipo, 'atalho');
  a.fechar();
});

test('"já parei" grava a duração até a última série, não até agora', async () => {
  const a = await comSessao();
  const sid = a.S().sessao.sid;
  a.E(`S.sessao.inicio = Date.now() - 100 * ${MIN}`);
  parada(a, 95);                                  // treinou 5 min, parou 95

  await a.v('ctx.encerraSessaoEsquecida');
  await a.esperar();

  assert.strictEqual(a.S().sessao, null);
  const dur = a.E(`S.done.filter(function (x) { return x.sid === ${sid}; })[0].dur`);
  assert.ok(dur > 4 * MIN && dur < 10 * MIN,
    'a ociosidade não pode virar treino no histórico: ' + Math.round(dur / MIN) + ' min');
  a.fechar();
});

test('na abertura: dentro da graça a sessão vive, além dela fecha', async () => {
  const t = Date.now();
  const estado = function (paradoMin) {
    return {
      logs: {}, done: [{ day: 'A', t: t, sid: t }],
      sessao: { day: 'A', inicio: t, ultima: t - paradoMin * MIN, sid: t, pausas: [], pulados: [] }
    };
  };

  const viva = await app({ estado: estado(95) });
  assert.ok(viva.E('S.sessao'), 'reabrir o app é justamente a chance de responder');
  assert.strictEqual(viva.vJ('ctx.faixaDaSessao').tipo, 'pergunta');
  viva.fechar();

  const morta = await app({ estado: estado(105) });
  assert.strictEqual(morta.E('S.sessao'), null, 'passada a graça, o app não pergunta mais');
  morta.fechar();
});
