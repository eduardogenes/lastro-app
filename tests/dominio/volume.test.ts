// Séries por músculo: o alvo, o impacto e a atribuição do que foi registrado.

import { test } from 'vitest';
import assert from 'node:assert';
import { alvoDoPrograma, impacto, seriesDeGrupo, seriesPorMusculo } from '../../src/dominio/volume';
import { PROGRAMA, ROT_BASE, slugEx } from '../../src/dominio/programa';
import type { IdEx, Log } from '../../src/dominio/tipos';
import { DIA, inicioDaSemana, log } from './ajuda';

const ALVO = alvoDoPrograma(PROGRAMA, ROT_BASE);

test('o alvo é calculado do programa, nunca transcrito', () => {
  // conferência independente: soma na mão, sem passar pela função sob teste
  const somaNaMao: Record<string, number> = {};
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    somaNaMao[ex.g] = (somaNaMao[ex.g] || 0) + ex.s;
  }));
  assert.deepStrictEqual(ALVO, somaNaMao);

  const total = Object.keys(ALVO).reduce((n, k) => n + ALVO[k], 0);
  assert.strictEqual(total, 125, 'o treinador prescreveu 125 séries diretas');
});

test('as prioridades do treinador aparecem no alvo', () => {
  assert.ok(ALVO['delt lateral'] >= 12, 'prioridade máxima: ' + ALVO['delt lateral']);
  assert.ok(ALVO['dorsal'] >= 12, 'prioridade máxima: ' + ALVO['dorsal']);
  assert.ok(ALVO['peito superior'] >= 10, 'prioridade máxima: ' + ALVO['peito superior']);
  assert.ok(ALVO['delt anterior'] == null || ALVO['delt anterior'] <= 2,
    'delt anterior recebe estímulo indireto; série direta seria desperdício');
});

test('séries de um grupo somam a rotação inteira', () => {
  const treinos = [
    { name: 'A', tag: '', ex: [{ g: 'peito', s: 3 }, { g: 'tríceps', s: 2 }] },
    { name: 'B', tag: '', ex: [{ g: 'peito', s: 2 }] },
    null
  ];
  assert.strictEqual(seriesDeGrupo(treinos, 'peito'), 5);
  assert.strictEqual(seriesDeGrupo(treinos, 'dorsal'), 0, 'grupo ausente conta zero, não quebra');
});

test('o impacto se lê contra o que o treinador prescreveu', () => {
  assert.deepStrictEqual(impacto('peito', 10, 10), { txt: 'peito: 10 na rotação · igual ao treinador', acima: 0 });
  assert.deepStrictEqual(impacto('peito', 12, 10), { txt: 'peito: 12 na rotação · o treinador prescreveu 10', acima: 1 });
  assert.deepStrictEqual(impacto('peito', 8, 10), { txt: 'peito: 8 na rotação · o treinador prescreveu 10', acima: 0 });
  assert.strictEqual(impacto('bochecha', 3, undefined).acima, 0,
    'músculo fora do programa não vira alerta: não há alvo para estourar');
});

test('a série é atribuída ao exercício registrado, não à posição prescrita', () => {
  // trocou elevação lateral por um aparelho de peito: conta em peito, que é
  // onde o trabalho aconteceu
  const grupos: Record<IdEx, string> = { 'pec-deck': 'peito', 'elevacao-lateral': 'delt lateral' };
  const logs: Record<IdEx, Log[]> = {
    'pec-deck': [log([[40, 10], [40, 10], null])],
    'elevacao-lateral': [log([[10, 15]])]
  };
  const acc = seriesPorMusculo(logs, k => grupos[k] || '', 0, Date.now() + DIA);
  assert.strictEqual(acc['peito'], 2, 'null é série não feita e não conta');
  assert.strictEqual(acc['delt lateral'], 1);
});

test('exercício sem grupo conhecido não entra na conta', () => {
  const logs: Record<IdEx, Log[]> = { 'fantasma': [log([[10, 10]])] };
  const acc = seriesPorMusculo(logs, () => '', 0, Date.now() + DIA);
  assert.deepStrictEqual(acc, {}, 'melhor não contar do que contar no músculo errado');
});

test('o corte compara com o mesmo ponto das semanas anteriores', () => {
  const seg = inicioDaSemana(Date.now());
  const logs: Record<IdEx, Log[]> = {
    'supino': [
      log([[60, 8]], { t: seg - 7 * DIA + 1 * DIA }),   // segunda-feira passada
      log([[60, 8]], { t: seg - 7 * DIA + 5 * DIA })    // sexta passada: além do corte
    ]
  };
  const ate = Date.now() + DIA;
  const inteira = seriesPorMusculo(logs, () => 'peito', 0, ate);
  assert.strictEqual(inteira['peito'], 2, 'sem corte, a semana passada aparece cheia');

  // estamos na terça: só conta até o mesmo ponto das semanas anteriores
  const naTerca = seriesPorMusculo(logs, () => 'peito', 0, ate, 2 * DIA);
  assert.strictEqual(naTerca['peito'], 1,
    'sem o corte, toda terça o painel apareceria despencando contra semanas cheias');
});

test('o período é fechado no início e aberto no fim', () => {
  const t = Date.now();
  const logs: Record<IdEx, Log[]> = { 'x': [log([[1, 1]], { t })] };
  assert.strictEqual(seriesPorMusculo(logs, () => 'peito', t, t + 1)['peito'], 1);
  assert.strictEqual(seriesPorMusculo(logs, () => 'peito', t + 1, t + 2)['peito'], undefined);
  assert.strictEqual(seriesPorMusculo(logs, () => 'peito', t - 1, t)['peito'], undefined,
    'o fim é exclusivo: senão a série do limite contaria em dois períodos');
});

test('todo exercício do programa tem id estável derivado do nome', () => {
  const vistos = new Set<string>();
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    const id = slugEx(ex.n);
    assert.ok(/^[a-z0-9-]+$/.test(id), 'id fora do formato: ' + id + ' (' + ex.n + ')');
    vistos.add(id);
  }));
  assert.ok(vistos.size >= 40, 'o programa tem 48 exercícios em 6 treinos');
});
