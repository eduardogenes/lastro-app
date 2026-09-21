// A leitura da semana, do estado até a tela.
//
// As regras estão em tests/dominio/leitura.test.ts, onde custam
// microssegundos. O que sobra aqui é a ligação: o painel de volume sempre teve
// o dado e nunca lia as linhas em conjunto.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, inicioDaSemana, DIA } from './harness.js';

/**
 * Séries registradas nesta semana, `horas` atrás.
 *
 * Ancorar num DIA da semana não serve: `seriesPorMusculo` corta a semana no
 * ponto em que estamos, e uma entrada na terça cai no futuro quando a suíte
 * roda numa segunda — some da conta em silêncio. Contar horas para trás,
 * travado no começo da semana, vale em qualquer dia.
 */
function semana(logs, id, quantas, horas) {
  const t = Math.max(inicioDaSemana(Date.now()), Date.now() - (horas || 1) * 3600000);
  logs[id] = [{ t: t, sid: t, sets: Array.from({ length: quantas }, () => [40, 10]) }];
  return logs;
}

test('o painel lê as linhas juntas e diz a inversão', async () => {
  // Peito (normal) com mais séries que peito superior (prioridade máxima) —
  // exatamente o caso que motivou o item.
  const logs = {};
  semana(logs, 'chest-press-horizontal-convergente', 8, 2);
  semana(logs, 'chest-press-inclinado-convergente', 3, 1);

  const a = await app({ estado: { logs: logs, done: [] } });
  a.aba('dados');
  await a.modo('treino');

  const leitura = a.J('CTX.musculos().leitura');
  const inv = leitura.filter(function (x) { return x.k === 'inversao'; })[0];
  assert.ok(inv, 'nenhuma inversão lida: ' + JSON.stringify(leitura));
  assert.ok(inv.txt.includes('peito levou 8'), inv.txt);
  assert.ok(inv.txt.includes('peito superior, 3'), inv.txt);

  const na_tela = a.$$('.dd-leitura-l').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(na_tela.includes('peito superior'), 'não chegou na tela: ' + na_tela);
  a.fechar();
});

test('a tela carrega a ressalva do treinador', async () => {
  const logs = {};
  semana(logs, 'chest-press-horizontal-convergente', 8, 2);
  semana(logs, 'chest-press-inclinado-convergente', 3, 1);
  const a = await app({ estado: { logs: logs, done: [] } });
  a.aba('dados');
  await a.modo('treino');

  const bloco = a.$('.dd-leitura').textContent.toLowerCase();
  // A ressalva é dele: prioridade não se mede só em séries.
  assert.ok(bloco.includes('desvio para olhar, não erro'), bloco);
  assert.ok(bloco.includes('seleção de exercício'), bloco);
  ['aument', 'reduz', 'deveria', 'precisa corrig'].forEach(function (p) {
    assert.ok(!bloco.includes(p), 'virou conselho com "' + p + '": ' + bloco);
  });
  a.fechar();
});

test('semana sem inversão não mostra o bloco', async () => {
  const logs = {};
  semana(logs, 'chest-press-inclinado-convergente', 9, 1);
  const a = await app({ estado: { logs: logs, done: [] } });
  a.aba('dados');
  await a.modo('treino');
  assert.strictEqual(a.$('.dd-leitura'), null, 'sem o que dizer, cala');
  a.fechar();
});
