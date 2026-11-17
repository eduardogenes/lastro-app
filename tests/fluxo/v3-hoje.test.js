// O Hoje no visual novo (direção 3, Fase 4): o bloco do momento pela mesma
// regra (`cartaoDeCima`), a linha do dia, o "se quiser" que obedece ao que
// está ligado, o "+" com o texto livre, a pergunta da noite e a de ontem.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';
import { dataLocal } from '../../src/dominio/protocolo';

const dia = (h, m, extra) => Object.assign({ data: dataLocal(agoraEstavel(h, m)), done: {}, agua: 0, escala: {}, cadencia: 'treino', alta: 0 }, extra || {});
async function noHoje(h, m, extra) {
  const a = await app({ agora: agoraEstavel(h, m), estado: Object.assign({ logs: {}, done: [], dia: dia(h, m) }, extra || {}) });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  // num dia de treino o app abre no treino; o Hoje fica por baixo dele
  a.v('ctx.fechaModoDeSessao');
  a.v('ctx.comecaAqui');        // aparelho vazio: passa da primeira vez
  await a.esperar();
  return a;
}

test('às 12h05 o momento é o almoço, e "Comi" marca pela porta de sempre', async () => {
  const a = await noHoje(12, 5);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'refeicao');
  assert.ok(/Almoço/.test(a.texto('.v3-bloco-t')), a.texto('.v3-bloco-t'));
  assert.ok(a.$('[data-a="linha-almoco"].agora'), 'a linha do dia marca o momento');
  a.clicar('[data-a="hoje-comi"]');
  await a.esperar(40);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'marcado');
  assert.ok(a.$('[data-a="linha-almoco"].ok'), 'e a linha mostra');
  a.fechar();
});

test('o "+": o texto livre grava o que entendeu e diz o que não entendeu', async () => {
  const a = await noHoje(13, 0);
  a.clicar('.v3-doca-m');
  await a.esperar(40);
  assert.ok(a.$('#registrar-texto'), 'a folha do "+"');
  const campo = a.$('#registrar-texto');
  campo.value = 'almocei e tomei 2 copos';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.$('.v3-diga').dispatchEvent(new a.window.Event('submit', { bubbles: true, cancelable: true }));
  await a.esperar(80);
  assert.ok(a.E('!!diaDeComida().done.almoco'), 'o almoço');
  assert.strictEqual(a.vJ('ctx.agua').n, 2, 'e os dois copos');
  assert.ok(/Guardado: almoço, 2 copos/.test(a.texto('.v3-eco')), a.texto('.v3-eco'));

  campo.value = 'fui e voltei';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.$('.v3-diga').dispatchEvent(new a.window.Event('submit', { bubbles: true, cancelable: true }));
  await a.esperar(60);
  assert.ok(/Não entendi/.test(a.texto('.v3-eco')));
  a.fechar();
});

test('"se quiser" obedece ao que está ligado, e a chave muda na hora', async () => {
  const a = await noHoje(15, 0);
  assert.ok(a.$('[data-a="hoje-agua"]'), 'a água ligada por padrão');
  a.clicar('[data-a="hoje-aparece"]');
  await a.esperar(40);
  a.clicar('[data-a="aparece-agua"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="aparece-agua"]').getAttribute('aria-checked'), 'false', 'a chave desligou sem fechar a folha');
  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.ok(!a.$('[data-a="hoje-agua"]'), 'e a água sumiu do Hoje');
  a.clicar('[data-a="hoje-agua"]'.replace('hoje-agua', 'hoje-peso'));
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'corpo', 'o peso leva à régua do Corpo');
  a.fechar();
});

test('de noite, com refeições sem resposta, o momento pergunta pelo dia, e responder grava', async () => {
  const a = await noHoje(21, 0);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'noite');
  a.clicar('[data-a="noite-quase"]');
  await a.esperar(60);
  assert.strictEqual(a.E('CTX.respostaDoDia(hojeISO())'), 'quase');
  a.fechar();
});

test('ontem em branco: a pergunta aparece no ritmo, e responder fecha o dia de ontem', async () => {
  const ontem = dataLocal(agoraEstavel(10) - DIA);
  const a = await noHoje(10, 0, { comidaHist: [{ d: ontem, done: {}, agua: 0, escala: {}, tot: {}, pv: 1, m: 1 }] });
  assert.ok(a.texto('.v3-perg').includes('Ontem ficou em branco'));
  a.clicar('.v3-perg-r button:first-child');
  await a.esperar(60);
  assert.strictEqual(a.E(`CTX.respostaDoDia(${JSON.stringify(ontem)})`), 'sim');
  assert.ok(!a.$('.v3-perg'), 'e a pergunta sai');
  a.fechar();
});

test('cardio: o toque no Hoje abre a folha, e gravar registra pela porta de sempre', async () => {
  const a = await noHoje(15, 0);
  a.clicar('[data-a="hoje-cardio"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="cardio-grava"]'), 'a folha do cardio');
  a.clicar('[data-a="cardio-m-remo"]');
  a.clicar('[data-a="cardio-min-30"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="cardio-min-30"]').getAttribute('aria-pressed'), 'true');
  assert.ok(/30 min de remo/.test(a.texto('[data-a="cardio-grava"]')));
  a.clicar('[data-a="cardio-grava"]');
  await a.esperar(60);
  const c = a.E('S.cardio[S.cardio.length - 1]');
  assert.strictEqual(c.m, 'remo'); assert.strictEqual(c.min, 30);
  assert.ok(!a.$('[data-a="cardio-grava"]'), 'e a folha fecha');
  a.fechar();
});

test('o tipo do dia: "Hoje não vou treinar" vira descanso, e a folha da data volta, com turno e demanda alta', async () => {
  const a = await noHoje(5, 30);
  assert.strictEqual(a.vJ('ctx.hojeV3').bloco.k, 'treino');
  a.clicar('[data-a="hoje-nao-treino"]');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().cadencia'), 'descanso');
  assert.notStrictEqual(a.vJ('ctx.hojeV3').bloco.k, 'treino', 'o bloco deixa de ser o treino');
  assert.ok(/descanso/.test(a.texto('[data-a="hoje-tipo"]')));
  a.clicar('[data-a="hoje-tipo"]');
  await a.esperar(40);
  assert.ok(a.$('[data-a="jafiz-cardio"]'), 'descanso oferece o "já fiz"');
  a.clicar('[data-a="dia-e-treino"]');
  await a.esperar(40);
  assert.strictEqual(a.E('diaDeComida().cadencia'), 'treino');
  a.clicar('[data-a="hoje-tipo"]');
  await a.esperar(40);
  a.clicar('[data-a="dia-alta"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().alta'), 1, 'demanda alta');
  a.clicar('[data-a="aderencia-fora"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().aderencia'), 'fora');
  a.clicar('[data-a="turno-noite"]');
  await a.esperar();
  assert.strictEqual(a.E('diaDeComida().turno'), 'noite');
  a.fechar();
});
