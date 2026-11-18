// O MOVIMENTO de cada troca (docs/design-system/07-fluidez-e-estabilidade.md):
// o casco escolhe o sentido pela camada que chega ou sai e pelo passo da
// tarefa, e a porta (`src/ui/movimento.js`) o põe em `data-nav` no `html`, que
// é o que o CSS de `src/v3/movimento.css` lê. O jsdom não tem transição de
// vista, então a porta desenha na hora — e o sentido fica no atributo, que é o
// que se cobra aqui. O movimento em si se confere num navegador de verdade.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

const nav = a => a.window.document.documentElement.getAttribute('data-nav');

function comHistorico() {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

test('cada troca diz o seu movimento: lugar, destino, tela de ação, passo e folha', async () => {
  const a = await app(Object.assign({ aba: 'agora' }, comHistorico()));
  await a.pronto();
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();

  // trocar de lugar pela doca: fade through
  a.v('ctx.vaiPara', 'corpo');
  await a.esperar();
  assert.strictEqual(nav(a), 'lugar', 'trocar de lugar');

  // entrar num destino e voltar dele: o eixo horizontal
  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar();
  a.clicar('[data-a="plano-ajustes"]');
  await a.esperar();
  assert.strictEqual(nav(a), 'entra', 'entrar num destino');
  a.v('ctx.fechaAjustes');
  await a.esperar();
  assert.strictEqual(nav(a), 'sai', 'voltar do destino');

  // a folha que fecha desce sozinha
  a.v('ctx.abreFolha', { k: 'oQueAparece' });
  await a.esperar();
  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.strictEqual(nav(a), 'fica', 'a folha desce; o resto fica');

  // a tela de ação sobe; o passo da mesma tarefa troca só o miolo; recolher desce
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(nav(a), 'sobe', 'abrir a tela de ação');
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(60);
  assert.ok(a.$('.v3-desc'), 'o descanso');
  assert.strictEqual(nav(a), 'passo', 'a série guardada vira descanso: passo da mesma tarefa');
  a.E(`document.documentElement.removeAttribute('data-nav')`);
  a.clicar('[data-a="desc-mais"]');
  await a.esperar(40);
  assert.strictEqual(nav(a), null, '+15 s redesenha o mesmo passo: nada se move');
  a.clicar('[data-a="desc-pula"]');
  await a.esperar(40);
  assert.strictEqual(nav(a), 'passo', 'o descanso vira a próxima série');
  a.clicar('[data-a="sai-do-modo"]');
  await a.esperar();
  assert.strictEqual(nav(a), 'desce', 'recolher a tela de ação');
  a.fechar();
});

test('as âncoras da tela de ação existem em todo passo: o pé e a linha das saídas, mesmo vazia', async () => {
  const a = await app(Object.assign({ aba: 'agora' }, comHistorico()));
  await a.pronto();
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  const ancoras = () => ['.v3-acao-topo', '.v3-acao > .v3-segs', '.v3-acao-pe', '.v3-acao-links']
    .map(sel => a.$$(sel).length);
  assert.deepStrictEqual(ancoras(), [1, 1, 1, 1], 'na série: uma de cada');
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(60);
  assert.deepStrictEqual(ancoras(), [1, 1, 1, 1], 'no descanso: as mesmas');
  assert.strictEqual(a.texto('[data-a="desc-pula"]'), 'Começar já');
  assert.ok(a.$('.v3-acao-links [data-a="desc-mais"]'), 'os ajustes do descanso moram na linha das saídas');
  a.fechar();
});

test('o aviso com "Desfazer" é um só: pular um exercício grava e oferece desfazer', async () => {
  const a = await app(Object.assign({ aba: 'agora' }, comHistorico()));
  await a.pronto();
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  a.v('ctx.abreFolha', { k: 'mudarEx', i: 0 });
  await a.esperar();
  a.clicar('[data-a="mudar-pular"]');
  await a.esperar(60);
  assert.ok(a.E(`S.sessao.pulados.length === 1`), 'gravou o pulo');
  assert.strictEqual(a.$('[data-a="aviso-acao"]').textContent, 'Desfazer');
  assert.ok(/pulado hoje\.$/.test(a.$('#toast .aviso span').textContent), a.toast());
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(40);
  assert.ok(a.E(`S.sessao.pulados.length === 0`), 'desfez');
  a.fechar();
});

test('a tira do treino aberto aparece nos lugares e leva de volta ao treino', async () => {
  const a = await app(Object.assign({ aba: 'agora' }, comHistorico()));
  await a.pronto();
  a.E(`view.day = proximoTreino(S, ROT_BASE)`);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  a.clicar('[data-a="serie-feita"]');
  await a.esperar(60);
  a.clicar('[data-a="sai-do-modo"]');
  await a.esperar();
  a.v('ctx.vaiPara', 'corpo');
  await a.esperar();
  assert.ok(a.$('[data-a="tira-treino"]'), 'a tira no Corpo');
  assert.ok(/Treino A · 1 de \d+/.test(a.texto('[data-a="tira-treino"]')), a.texto('[data-a="tira-treino"]'));
  a.clicar('[data-a="tira-treino"]');
  await a.esperar();
  assert.ok(a.$('.v3-acao'), 'de volta ao treino');
  a.fechar();
});
