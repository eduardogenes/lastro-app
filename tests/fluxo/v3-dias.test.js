// Dias no visual novo (direção 3, Fase 4): o mês em grade, o dia escolhido
// com a pergunta da comida, e "responder os dias" um por tela, com voltar um
// e "os que faltam". As respostas gravam pela porta de sempre (respondeODia).

import { test } from 'vitest';
import assert from 'node:assert';
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
