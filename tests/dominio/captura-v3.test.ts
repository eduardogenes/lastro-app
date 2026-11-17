// As três luzes do disparo e a ressalva da sessão (direção 3, Fase 1;
// docs/redesign-3/02-captura.md). Cada teste guarda um jeito de a padronização
// falhar calada: a luz que acende sem ninguém conferir, a detecção que cai e
// trava tudo, a foto fora do padrão que entra na comparação sem aviso.

import { test } from 'vitest';
import assert from 'node:assert';
import { apagadas, foraNoDisparo, liberado, luzes, nomesDoFora } from '../../src/dominio/captura';
import {
  mudancasDaSessao, pontaParaTrocar, ressalvaDaSessao, seloDaSessao, textoDaMudanca, tituloDoFim
} from '../../src/dominio/protocolo';
import type { SessaoFoto } from '../../src/dominio/tipos';

test('nada acende sozinho: sem sensor e sem detecção, as três esperam quem confere', () => {
  const l = luzes({ nivel: null });
  assert.deepStrictEqual(apagadas(l), ['nivel', 'altura', 'distancia']);
  assert.deepStrictEqual(l.medida, { nivel: false, altura: false, distancia: false });
  assert.strictEqual(liberado(l, false), false, 'o botão continua travado');
});

test('o sensor manda no nível: conferir a olho não o acende por cima de uma leitura torta', () => {
  const l = luzes({ nivel: false, conferi: { nivel: true, altura: true, distancia: true } });
  assert.strictEqual(l.nivel, false);
  assert.strictEqual(l.medida.nivel, true);
  assert.deepStrictEqual(apagadas(l), ['nivel']);
  assert.strictEqual(luzes({ nivel: true }).nivel, true);
});

test('com a detecção ativa, altura e distância são dela; sem ela, voltam a ser conferidas', () => {
  const comDet = luzes({ nivel: true, det: { altura: true, distancia: false }, conferi: { distancia: true } });
  assert.strictEqual(comDet.distancia, false, 'a detecção vê o que o olho deixou passar');
  assert.strictEqual(comDet.medida.altura, true);
  const caiu = luzes({ nivel: true, det: null, conferi: { altura: true, distancia: true } });
  assert.deepStrictEqual(apagadas(caiu), [], 'a detecção caiu e nada trava: o caminho das linhas continua');
});

test('as três verdes destravam; "mesmo assim" destrava com qualquer uma apagada', () => {
  const tres = luzes({ nivel: true, conferi: { altura: true, distancia: true } });
  assert.strictEqual(liberado(tres, false), true);
  const duas = luzes({ nivel: true, conferi: { altura: true } });
  assert.strictEqual(liberado(duas, false), false);
  assert.strictEqual(liberado(duas, true), true);
});

test('o fora da foto é o que não estava verde no disparo, mais a tremida', () => {
  assert.deepStrictEqual(foraNoDisparo(luzes({ nivel: true, conferi: { altura: true, distancia: true } }), false), []);
  assert.deepStrictEqual(foraNoDisparo(luzes({ nivel: false, conferi: { altura: true } }), true), ['nivel', 'distancia', 'tremida']);
  assert.strictEqual(nomesDoFora(['nivel', 'altura', 'distancia']), 'nível, altura e distância');
  assert.strictEqual(nomesDoFora(['tremida']), 'tremida');
});

const sessao = (extra: Partial<SessaoFoto> = {}): SessaoFoto => ({
  d: '2026-11-17', t: 1, m: 1,
  fotos: {
    'frente-relaxado': { v: 1, ext: 'webp', cap: { via: 'app', l: 1, a: 1 } },
    'perfil-direito': { v: 2, ext: 'webp', cap: { via: 'app', l: 1, a: 1, fora: ['nivel'] } },
    'costas-relaxado': { v: 3, ext: 'webp' }
  } as SessaoFoto['fotos'],
  ...extra
});

test('a ressalva junta o que mudou e as fotos fora do padrão; sem nada, a sessão está no padrão', () => {
  const r = ressalvaDaSessao(sessao({ muda: ['luz'] }));
  assert.deepStrictEqual(r.muda, ['luz']);
  assert.deepStrictEqual(r.fora, ['perfil-direito']);
  assert.strictEqual(r.noPadrao, false);
  const limpa = ressalvaDaSessao({ d: '2026-11-17', t: 1, fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } as SessaoFoto['fotos'] });
  assert.strictEqual(limpa.noPadrao, true, 'foto antiga, sem registro de captura, não vira ressalva');
  assert.strictEqual(ressalvaDaSessao(null).noPadrao, true);
});

test('o fim e o selo dizem a ressalva; a foto fora pesa mais que a mudança', () => {
  assert.strictEqual(tituloDoFim(11, 11, ressalvaDaSessao(sessao({ muda: ['luz'] }))), '11 de 11, uma fora do padrão');
  const soMuda = ressalvaDaSessao({ d: 'x', t: 1, muda: ['luz', 'roupa'], fotos: {} as SessaoFoto['fotos'] });
  assert.strictEqual(tituloDoFim(11, 11, soMuda), '11 de 11, com ressalvas');
  assert.strictEqual(seloDaSessao(soMuda), 'outra luz, outra roupa');
  assert.strictEqual(tituloDoFim(11, 11, ressalvaDaSessao(null)), '11 de 11, todas no padrão');
  assert.strictEqual(seloDaSessao(ressalvaDaSessao(null)), 'no padrão');
});

test('na linha das sessões, o toque troca a ponta do par mais perto, e tocar numa ponta não troca nada', () => {
  const d = ['a', 'b', 'c', 'd', 'e'];
  assert.strictEqual(pontaParaTrocar(d, 'b', 'e', 'a'), 'de', 'antes do par, a de cá');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'c', 'e'), 'ate', 'depois do par, a de lá');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'e', 'b'), 'de');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'e', 'd'), 'ate');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'e', 'c'), 'de', 'empate fica com a mais antiga');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'e', 'e'), null);
  assert.strictEqual(pontaParaTrocar(d, 'e', 'a', 'b'), 'ate', 'com o par invertido, o nome segue a data');
  assert.strictEqual(pontaParaTrocar(d, 'a', 'e', 'x'), null);
});

test('o que mudou é lido limpo: sem valor estranho, sem repetição, na ordem fixa', () => {
  assert.deepStrictEqual(mudancasDaSessao(['roupa', 'lente', 'luz', 'roupa']), ['luz', 'roupa']);
  assert.deepStrictEqual(mudancasDaSessao('luz'), []);
  assert.strictEqual(textoDaMudanca(['lugar']), 'outro lugar');
});

test('medir agora: a fita pede a segunda sempre e a terceira só quando diferem; a dobra pede três', async () => {
  const { passoDaLeitura } = await import('../../src/dominio/corpo');
  assert.strictEqual(passoDaLeitura(false, []), 1);
  assert.strictEqual(passoDaLeitura(false, [85]), 2, 'a segunda sempre');
  assert.strictEqual(passoDaLeitura(false, [85, 85.4]), 'pronta', 'batendo, segue');
  assert.strictEqual(passoDaLeitura(false, [85, 86]), 3, 'diferindo mais de 0,5, a terceira');
  assert.strictEqual(passoDaLeitura(false, [85, 86, 85.5]), 'pronta');
  assert.strictEqual(passoDaLeitura(true, [12, 12]), 3, 'a dobra pede três mesmo batendo');
  assert.strictEqual(passoDaLeitura(true, [12, 12, 13]), 'pronta');
});
