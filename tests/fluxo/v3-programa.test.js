// O programa, o editor de um treino e a revisão do treinador no visual novo
// (direção 3, Fase 3). Os dados e as ações são os de sempre; o que se cobra
// é que a tela nova chega a eles e mostra a faixa de séries por músculo.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

const TEXTO = `Revisão 21/09
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 5 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Hip thrust máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;

async function noPrograma() {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.abrePrograma');
  await a.esperar();
  return a;
}

test('o programa: os treinos, e o editor muda séries com a faixa por músculo dizendo quanto saiu do treinador', async () => {
  const a = await noPrograma();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Programa');
  assert.ok(a.$('[data-a="prog-dia-A"]'), 'o treino A');
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  assert.ok(/^Treino A/.test(a.texto('.v3-cab h1')));
  const antes = a.E('S.prog.A.ex[0].s');
  assert.ok(!a.$('.v3-vol span.mais'), 'igual ao treinador, nada acima');
  a.clicar('[data-a="ed-mais-0"]');
  await a.esperar(60);
  assert.strictEqual(a.E('S.prog.A.ex[0].s'), antes + 1, 'a série entrou no programa');
  assert.ok(/\(\+1\)/.test(a.texto('.v3-vol span.mais')), 'e a faixa diz: ' + a.texto('.v3-vol'));
  a.clicar('.v3-cab > button');               // voltar à lista
  await a.esperar();
  a.clicar('[data-a="prog-diff"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'O que está diferente');
  assert.ok(a.$('[data-a="restaura-A"]'), 'com a volta ao do treinador');
  a.fechar();
});

test('adicionar exercício: o catálogo é uma folha sobre o editor, busca e põe no programa', async () => {
  const a = await noPrograma();
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  a.clicar('[data-a="ed-add"]');
  await a.esperar(40);
  assert.ok(a.$('#catalogo-busca'), 'o catálogo novo');
  assert.ok(!a.$('.addex'), 'e não o antigo');
  assert.ok(/^Treino A/.test(a.texto('.v3-cab h1')), 'o editor continua por baixo');
  const busca = a.$('#catalogo-busca');
  busca.value = 'remo';
  busca.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  const alvo = a.$('[data-a^="catalogo-"]:not([data-a="catalogo-novo"])');
  assert.ok(alvo, 'a busca acha');
  const id = alvo.getAttribute('data-a').slice(9);
  const antes = a.E('S.prog.A.ex.length');
  alvo.click();
  await a.esperar(60);
  assert.strictEqual(a.E('S.prog.A.ex.length'), antes + 1);
  assert.strictEqual(a.E('S.prog.A.ex[S.prog.A.ex.length - 1].id'), id, 'entrou no programa');
  assert.ok(!a.$('#catalogo-busca'), 'e a folha fecha');
  a.fechar();
});

test('cadastrar um exercício novo pelo catálogo: só com nome, e já entra no treino', async () => {
  const a = await noPrograma();
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  a.clicar('[data-a="ed-add"]');
  await a.esperar(40);
  a.clicar('[data-a="catalogo-novo"]');
  await a.esperar();
  assert.ok(a.$('[data-a="novo-ex-cria"]').disabled, 'sem nome, não cria');
  const nome = a.$('#novo-ex-nome');
  nome.value = 'Remada articulada do box';
  nome.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="novo-ex-composto"]');
  await a.esperar();
  a.clicar('[data-a="novo-ex-cria"]');
  await a.esperar(80);
  const ult = a.E('S.prog.A.ex[S.prog.A.ex.length - 1].id');
  assert.strictEqual(a.E(`S.ex[${JSON.stringify(ult)}].n`), 'Remada articulada do box');
  assert.strictEqual(a.E(`S.ex[${JSON.stringify(ult)}].c`), 1, 'composto');
  assert.ok(!a.$('#novo-ex-nome'), 'a folha fecha');
  a.fechar();
});

test('a revisão do treinador: lê o texto, pergunta o que não reconhece, e mostra o que muda em cada treino', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ aba: 'agora', estado: { plano: 7,
    logs: { 'cadeira-flexora-sentada': [{ t: t, sid: t, sets: [[45, 12, 1], [45, 11, 1]] }] },
    done: [{ day: 'B', t: t, sid: t, dur: 3600000 }] } });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.v('ctx.abreRevisao');
  await a.esperar();
  assert.ok(a.$('#revisao-texto'), 'o campo de colar');
  a.v('ctx.textoDaRevisao', { value: TEXTO });
  a.clicar('[data-a="revisao-le"]');
  await a.esperar();
  const r = a.vJ('ctx.revisao');
  assert.ok(r.perguntas.length > 0, 'há nome a confirmar');
  assert.strictEqual(a.$('[data-a="revisao-aplica"]').disabled, true, 'não aplica enquanto falta resposta');
  assert.ok(a.texto('.v3-sec-h').includes('Treino B') || a.$$('.v3-sec-h').some(e => /Treino B/.test(e.textContent)), 'o que muda no B');
  r.perguntas.forEach((q, i) => a.clicar(a.$$('.v3-perg')[i].querySelector('.v3-perg-r button')));
  await a.esperar();
  assert.strictEqual(a.$('[data-a="revisao-aplica"]').disabled, false, 'respondido, aplica');
  a.fechar();
});
