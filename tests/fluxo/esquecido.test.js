// O treino esquecido: 1h30 sem série nova.
//
// Eram 4 horas, e 4 horas nunca encerraram nada de útil — quem esquece guarda
// o celular e só reabre no dia seguinte, quando a virada do dia já tinha
// fechado a sessão.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { camadasAbertas } from '../../src/ui/navegacao.js';

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
  assert.ok(viva.S().sessao, 'reabrir o app é justamente a chance de responder');
  assert.strictEqual(viva.vJ('ctx.faixaDaSessao').tipo, 'pergunta');
  viva.fechar();

  const morta = await app({ estado: estado(105) });
  assert.strictEqual(morta.S().sessao, null, 'passada a graça, o app não pergunta mais');
  morta.fechar();
});

// ---------------------------------------------------------------------------
// `ctx.voltaAoTreino` — a porta de volta que a FAIXA oferece
// ---------------------------------------------------------------------------
//
// Terceiro degrau do critério desta passada (quanto custa uma quebra em
// silêncio): a faixa é o único lugar do app que leva de qualquer aba de volta à
// sessão aberta, e `voltaAoTreino` é o verbo dela — `onVolta` em `app.jsx`.
// Quebrado em silêncio, o treino em andamento fica alcançável só por quem
// lembrar de trocar a aba E a letra do dia na mão, e a faixa passa a ser um
// botão que não faz nada. Não tinha uma única menção em `tests/fluxo/`.
//
// O QUE ESTE GRUPO NÃO COBRE: que a faixa tenha botão ligado nele. Chamar o
// verbo prova que a capacidade existe no MODELO, não que o dedo a alcança.

test('ctx.voltaAoTreino leva à aba, ao DIA da sessão e ao exercício onde ele parou', async () => {
  const a = await comSessao();
  // sai da sessão: outra aba, e a letra do dia mexida por outro caminho
  a.v('ctx.vaiPara', 'dados');
  a.v('go', 'E');
  a.v('ctx.fechaTudo');
  assert.strictEqual(a.vista().aba, 'dados', 'pré-condição: longe do treino');
  assert.strictEqual(a.vista().day, 'E', 'e em outro dia');
  assert.strictEqual(a.S().sessao.day, 'A', 'a sessão aberta é do A');

  a.v('ctx.voltaAoTreino');
  await a.esperar();

  assert.strictEqual(a.vista().aba, 'treino', 'voltou para a aba do treino');
  assert.strictEqual(a.vista().day, 'A', 'e para o dia DA SESSÃO, não o último visitado');
  assert.strictEqual(a.vista().open, 0,
    'e ABERTO onde ele parou: `ondeEleEstava` devolve o primeiro PARCIAL, que é o ' +
    '0 — uma série registrada de várias prescritas');
  assert.strictEqual(a.vista().swapOpen, null, 'e sem seletor de troca pendurado');
  a.fechar();
});

test('ctx.voltaAoTreino sem sessão aberta não mexe na tela', async () => {
  // A faixa só existe com sessão aberta, mas o verbo é alcançável sem ela —
  // e inventar uma volta para um treino que ninguém abriu trocaria a aba e a
  // letra do dia dele sem nada ter acontecido.
  const a = await app({ aba: 'dados' });
  assert.strictEqual(a.S().sessao, null, 'pré-condição: nenhuma sessão');
  const foto = () => JSON.stringify(
    [a.vista().aba, a.vista().day, a.vista().open, a.vista().modoSessao]);
  const antes = foto();

  a.v('ctx.voltaAoTreino');
  await a.esperar();

  assert.strictEqual(foto(), antes,
    'aba, dia, exercício aberto E o modo ficaram exatamente onde estavam: ' + antes);
  a.fechar();
});

test('ctx.voltaAoTreino abre o MODO, e não só a aba atrás dele', async () => {
  // A faixa é a porta 2 do modo (frente 1, §4.4). Antes desta passada o verbo
  // devolvia à ABA do treino — a mesma tela de quem está só planejando o dia,
  // com barra de abas e tudo. Entrar no treino em andamento e entrar para
  // olhar o treino passaram a ser duas coisas diferentes, e a faixa pertence à
  // primeira: quem a toca está com a mão na barra, não navegando.
  const a = await comSessao();
  a.v('ctx.vaiPara', 'dados');
  a.v('ctx.fechaTudo');
  assert.strictEqual(a.vista().modoSessao, false, 'pré-condição: fora do modo');

  a.v('ctx.voltaAoTreino');
  await a.esperar();

  assert.strictEqual(a.vista().modoSessao, true, 'a faixa entrou NO MODO');
  assert.deepStrictEqual(camadasAbertas(a.vista()), ['modoSessao'],
    'e o modo é a única camada: a faixa não deixa nada pendurado por cima');
  // A aba e o dia continuam arrumados por baixo — é o que fecha o modo de
  // volta no lugar certo, sem este caso dizer de novo o que o de cima já diz.
  assert.strictEqual(a.vista().aba, 'treino', 'com a aba certa por baixo');
  assert.strictEqual(a.vista().day, 'A', 'e o dia da sessão');
  a.fechar();
});
