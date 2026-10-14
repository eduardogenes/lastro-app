// ENQUANTO DESCANSA — a D, momento 1, estado 2.
//
// No descanso, dentro da sessão, a refeição de antes do treino, um copo de água
// e o peso de hoje, um toque cada (F30: 7 de 11 pesagens entraram entre 6h28 e
// 7h52, no meio do treino). Só enquanto o descanso conta, só no modo, e só no
// cartão aberto, que é onde o polegar está.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

function dataLocal(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Dia de treino às 6h30, o treino de hoje aberto no modo, uma série guardada. */
async function noDescanso(antes) {
  const agora = agoraEstavel(6, 30);
  const a = await app({ agora: agora, estado: { logs: {}, done: [],
    dia: { data: dataLocal(agora), done: {}, agua: 0, escala: {}, cadencia: 'treino', alta: 0 } } });
  a.v('ctx.abreTreinoDeHoje');
  a.v('toggle', 0);
  await a.esperar();
  if (antes) antes(a);
  // pelo caminho do dedo: a carga, e a repetição tocada na régua
  a.preencher(0, 0, 40);
  await a.regua(0, 0, 10);
  await a.esperar();
  return a;
}

const chips = a => a.$$('.ex.open .ex-descansa .chip').map(b => b.textContent.trim());

test('o descanso traz os três, no cartão aberto, e só nele', async () => {
  const a = await noDescanso(function (a) {
    assert.strictEqual(a.$('.ex-descansa'), null, 'antes da série não há descanso, nem os três');
  });
  assert.ok(a.vista().modoSessao, 'no modo de sessão');
  const d = a.vJ('ctx.enquantoDescansa');
  assert.strictEqual(d.pre.id, 'pre', 'a refeição de antes do treino é a condicional ao treino que vem antes dele');
  assert.deepStrictEqual(chips(a), ['Pré-treino: comi', 'Água 0/14 · +1', 'Peso de hoje']);
  assert.strictEqual(a.$$('.ex-descansa').length, 1, 'num cartão só');
  a.fechar();
});

test('a refeição de antes do treino é a de ANTES: a condicional que vem depois não entra', async () => {
  // Um plano com um shake condicional ao treino às 7h40, depois da linha do
  // treino: no descanso, "comi" continua sendo o pré-treino das 5h45.
  const a = await noDescanso(function (a) {
    a.E(`planoDeComida().push({ id: 'shake', t: '07:40', n: 'Shake', tag: '', quando: 'treino', nota: '', itens: [] })`);
  });
  assert.strictEqual(a.vJ('ctx.enquantoDescansa').pre.id, 'pre');
  assert.strictEqual(chips(a)[0], 'Pré-treino: comi');
  a.fechar();
});

test('"comi" grava a refeição na hora, lê de volta, e o segundo toque desfaz', async () => {
  const a = await noDescanso();
  a.clicar('[data-a="descansa-pre"]');
  await a.esperar(800);
  assert.ok(a.gravado().dia.done.pre, 'o pré-treino está no disco');
  const b = a.$('[data-a="descansa-pre"]');
  assert.strictEqual(b.getAttribute('aria-pressed'), 'true');
  assert.strictEqual(b.textContent.trim(), 'Pré-treino: comi ✓');

  a.clicar('[data-a="descansa-pre"]');
  await a.esperar(800);
  assert.ok(!a.gravado().dia.done.pre, 'desfeito, e no disco também');
  assert.strictEqual(a.$('[data-a="descansa-pre"]').getAttribute('aria-pressed'), 'false');
  a.fechar();
});

test('"+1" grava o copo na hora; recusado, a conta volta e o cartão diz', async () => {
  const a = await noDescanso();
  a.clicar('[data-a="descansa-agua"]');
  await a.esperar();
  assert.strictEqual(a.gravado().dia.agua, 1);
  assert.strictEqual(a.texto('[data-a="descansa-agua"]'), 'Água 1/14 · +1');

  a.encheCota();
  a.clicar('[data-a="descansa-agua"]');
  await a.esperar();
  assert.strictEqual(a.gravado().dia.agua, 1, 'o disco ficou no que tinha');
  assert.strictEqual(a.texto('[data-a="descansa-agua"]'), 'Água 1/14 · +1', 'e a conta também');
  assert.ok(/O 2º copo não foi gravado/.test(a.texto('.ex-descansa-f')), a.texto('.ex-descansa-f'));
  a.fechar();
});

test('o peso de hoje abre a folha curta, grava HOJE mesmo com outro dia armado, e fecha', async () => {
  const a = await noDescanso();
  const hoje = agoraEstavel(6, 30), ontem = hoje - 86400000;
  a.E(`view.bodyDia = { peso: ${ontem} }`);
  a.clicar('[data-a="descansa-peso"]');
  await a.esperar();
  assert.ok(a.$('[data-a="peso-rapido-anota"]'), 'a folha abriu');
  assert.ok(a.vista().modoSessao, 'e a sessão continua aberta por baixo');

  a.v('ctx.setPeso', 80.4);
  a.clicar('[data-a="peso-rapido-anota"]');
  await a.esperar(100);
  const p = a.gravado().body.peso.filter(x => dataLocal(x.t) === dataLocal(hoje));
  assert.strictEqual(p.length, 1, 'gravado hoje, e não no dia que estava armado');
  assert.strictEqual(a.gravado().body.peso.filter(x => dataLocal(x.t) === dataLocal(ontem)).length, 0);
  assert.strictEqual(p[0].v, 80.4);
  assert.strictEqual(a.$('[data-a="peso-rapido-anota"]'), null, 'a folha fechou');
  assert.strictEqual(a.texto('[data-a="descansa-peso"]'), 'Peso de hoje: 80,4 kg', 'e o chip lê de volta');
  a.fechar();
});

test('número inválido não fecha a folha: o aviso é dito e nada é gravado', async () => {
  const a = await noDescanso();
  a.clicar('[data-a="descansa-peso"]');
  await a.esperar();
  a.E(`view.bodyForm = { peso: 'x' }`);
  a.clicar('[data-a="peso-rapido-anota"]');
  await a.esperar(100);
  assert.ok(a.$('[data-a="peso-rapido-anota"]'), 'a folha continua aberta');
  assert.strictEqual(a.toast(), 'Digite um número válido.');
  assert.strictEqual((a.gravado().body.peso || []).length, 0);
  a.fechar();
});

test('parar o descanso tira os três; fora do modo eles não existem', async () => {
  const a = await noDescanso();
  assert.ok(a.$('.ex-descansa'));
  a.clicar('#tstop');
  await a.esperar();
  assert.strictEqual(a.$('.ex-descansa'), null, 'parou o descanso, saíram junto');

  a.v('startTimer', 120);
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.enquantoDescansa'), null, 'fora do modo, o Agora já tem as três linhas');
  a.fechar();
});

