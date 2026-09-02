// O protocolo de fotos: ordem, continuidade e referência.
//
// O que estes testes protegem não é a lista de poses — é a COMPARABILIDADE.
// Uma sessão que continua de onde parou, uma referência que não cega quando uma
// pose é pulada, e um par padrão que não compara duas semanas de água.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  CADENCIA_DIAS, PROTOCOLO, comAPose, completude, dataLocal, diasDesde,
  instanteDaData, mediaDaSemana, ordemPadrao, parPadrao, poseDe, poses,
  proximaPose, referencia, sessaoDe, ultima, vizinhaComAPose
} from '../../src/dominio/protocolo';
import type { Marca, SessaoFoto } from '../../src/dominio/tipos';

const DIA = 86400000;

function sessao(d: string, poseIds: string[], t = 0): SessaoFoto {
  const fotos: SessaoFoto['fotos'] = {};
  poseIds.forEach(function (p, i) { fotos[p] = { v: t + i, ext: 'webp' }; });
  return { d: d, t: t || instanteDaData(d), fotos: fotos };
}

// ---------- o catálogo ----------

test('as nove poses têm id único e giro conhecido', () => {
  assert.strictEqual(PROTOCOLO.length, 9);
  const ids = new Set(PROTOCOLO.map(p => p.id));
  assert.strictEqual(ids.size, 9);
  PROTOCOLO.forEach(p => {
    assert.ok([0, 90, 180, 270].includes(p.giro), p.id + ' com giro ' + p.giro);
    assert.ok(p.como.length >= 2, p.id + ' sem execução');
    assert.ok(p.revela && p.erro, p.id + ' sem revela/erro');
  });
});

test('a ordem é uma rotação contínua, nunca volta para trás', () => {
  const giros = PROTOCOLO.map(p => p.giro);
  for (let i = 1; i < giros.length; i++) {
    assert.ok(giros[i] >= giros[i - 1], 'a pose ' + i + ' faz o corpo girar de volta');
  }
});

test('ordem vazia ou desconhecida cai na do código', () => {
  assert.deepStrictEqual(poses(null).map(p => p.id), ordemPadrao());
  assert.deepStrictEqual(poses([]).map(p => p.id), ordemPadrao());
  assert.deepStrictEqual(poses(['nao-existe']).map(p => p.id), ordemPadrao());
});

test('a seleção dele manda quando é válida, e id desconhecido some', () => {
  const r = poses(['costas-relaxado', 'inventada', 'frente-relaxado']);
  assert.deepStrictEqual(r.map(p => p.id), ['costas-relaxado', 'frente-relaxado']);
});

test('poseDe devolve null para id que não existe', () => {
  assert.strictEqual(poseDe('nada'), null);
  assert.strictEqual(poseDe('frente-relaxado')!.n, 'Frente relaxado');
});

// ---------- data local ----------

test('a data é local, não UTC — sessão de manhã não cai no dia anterior', () => {
  const seis = new Date(2026, 8, 1, 6, 15, 0).getTime();
  assert.strictEqual(dataLocal(seis), '2026-09-01');
  const quaseMeiaNoite = new Date(2026, 8, 1, 23, 50, 0).getTime();
  assert.strictEqual(dataLocal(quaseMeiaNoite), '2026-09-01');
});

test('instanteDaData volta para a mesma data', () => {
  assert.strictEqual(dataLocal(instanteDaData('2026-09-01')), '2026-09-01');
});

// ---------- continuidade ----------

test('a sessão continua da primeira pose sem foto', () => {
  const s = sessao('2026-09-01', ['frente-relaxado', 'frente-duplo-biceps']);
  assert.strictEqual(proximaPose(s, null), 'frente-abdomen-coxa');
});

test('pose pulada no meio é a próxima a ser retomada', () => {
  const s = sessao('2026-09-01', ['frente-relaxado', 'frente-abdomen-coxa']);
  assert.strictEqual(proximaPose(s, null), 'frente-duplo-biceps');
});

test('sessão cheia não tem próxima', () => {
  const s = sessao('2026-09-01', ordemPadrao());
  assert.strictEqual(proximaPose(s, null), null);
  assert.strictEqual(completude(s, null).cheia, true);
});

test('sessão inexistente começa da primeira pose', () => {
  assert.strictEqual(proximaPose(null, null), ordemPadrao()[0]);
  const c = completude(null, null);
  assert.strictEqual(c.feitas, 0);
  assert.strictEqual(c.total, 9);
});

test('a completude conta contra a ordem dele, não contra as nove', () => {
  const ordem = ['frente-relaxado', 'costas-relaxado'];
  const s = sessao('2026-09-01', ['frente-relaxado']);
  const c = completude(s, ordem);
  assert.strictEqual(c.total, 2);
  assert.strictEqual(c.feitas, 1);
  assert.deepStrictEqual(c.faltando, ['costas-relaxado']);
});

// ---------- cadência ----------

test('dias desde conta viradas de dia, não horas', () => {
  const hoje = dataLocal(Date.now());
  assert.strictEqual(diasDesde([sessao(hoje, ['frente-relaxado'])], Date.now()), 0);
  const ontem = dataLocal(Date.now() - DIA);
  assert.strictEqual(diasDesde([sessao(ontem, ['frente-relaxado'])], Date.now()), 1);
});

test('sem sessão nenhuma, não há dias desde', () => {
  assert.strictEqual(diasDesde([], Date.now()), null);
  assert.strictEqual(ultima([]), null);
});

test('a cadência do protocolo é de duas semanas', () => {
  assert.strictEqual(CADENCIA_DIAS, 14);
});

// ---------- referência ----------

test('a referência é a foto mais recente ANTES da sessão atual', () => {
  const ss = [
    sessao('2026-07-06', ['frente-relaxado']),
    sessao('2026-08-06', ['frente-relaxado']),
    sessao('2026-09-01', [])
  ];
  assert.strictEqual(referencia(ss, 'frente-relaxado', '2026-09-01')!.d, '2026-08-06');
});

test('pose pulada numa sessão não cega a referência da seguinte', () => {
  const ss = [
    sessao('2026-07-06', ['costas-relaxado']),
    sessao('2026-08-06', ['frente-relaxado']),      // não tem costas
    sessao('2026-09-01', [])
  ];
  assert.strictEqual(referencia(ss, 'costas-relaxado', '2026-09-01')!.d, '2026-07-06');
});

test('a própria sessão nunca é referência de si mesma', () => {
  const ss = [sessao('2026-09-01', ['frente-relaxado'])];
  assert.strictEqual(referencia(ss, 'frente-relaxado', '2026-09-01'), null);
});

// ---------- comparação ----------

test('o par padrão é a mais nova contra a MAIS ANTIGA', () => {
  const ss = [
    sessao('2026-07-06', ['frente-relaxado']),
    sessao('2026-08-06', ['frente-relaxado']),
    sessao('2026-09-01', ['frente-relaxado'])
  ];
  const p = parPadrao(ss, 'frente-relaxado')!;
  assert.strictEqual(p.de.d, '2026-07-06');
  assert.strictEqual(p.ate.d, '2026-09-01');
});

test('uma sessão só não dá par', () => {
  assert.strictEqual(parPadrao([sessao('2026-09-01', ['frente-relaxado'])], 'frente-relaxado'), null);
});

test('comparar só enxerga sessões que têm aquela pose', () => {
  const ss = [
    sessao('2026-07-06', ['frente-relaxado', 'costas-relaxado']),
    sessao('2026-08-06', ['frente-relaxado'])
  ];
  assert.deepStrictEqual(comAPose(ss, 'costas-relaxado').map(s => s.d), ['2026-07-06']);
});

test('sessaoDe acha pela data', () => {
  const ss = [sessao('2026-07-06', []), sessao('2026-09-01', [])];
  assert.strictEqual(sessaoDe(ss, '2026-09-01')!.d, '2026-09-01');
  assert.strictEqual(sessaoDe(ss, '2026-08-06'), null);
});

// ---------- o número ao lado da foto ----------

test('a média da semana da sessão sai de S.body, não da sessão', () => {
  const t = instanteDaData('2026-09-02');       // quarta
  const marcas: Marca[] = [
    { t: t - DIA, v: 74.0 },
    { t: t, v: 74.4 },
    { t: t - 40 * DIA, v: 70.0 }                 // outra semana, fora da conta
  ];
  const m = mediaDaSemana(marcas, '2026-09-02')!;
  assert.strictEqual(Math.round(m * 100) / 100, 74.2);
});

test('semana sem pesagem devolve null em vez de zero', () => {
  assert.strictEqual(mediaDaSemana([], '2026-09-02'), null);
  assert.strictEqual(mediaDaSemana(null, '2026-09-02'), null);
});

// ---------- a vizinha, que vira fantasma ao ajustar ----------

test('a vizinha padrão é a sessão ANTERIOR naquela pose', () => {
  const ss = [sessao('2026-07-06', ['a']), sessao('2026-07-20', ['a']), sessao('2026-08-03', ['a'])];
  assert.strictEqual(vizinhaComAPose(ss, 'a', '2026-08-03')!.d, '2026-07-20');
});

test('pose pulada no meio não cega a vizinha: pula para trás até achar', () => {
  const ss = [sessao('2026-07-06', ['a']), sessao('2026-07-20', ['b']), sessao('2026-08-03', ['a'])];
  assert.strictEqual(vizinhaComAPose(ss, 'a', '2026-08-03')!.d, '2026-07-06');
});

test('sem anterior, a SEGUINTE serve — senão a mais antiga nunca teria fantasma', () => {
  const ss = [sessao('2026-07-06', ['a']), sessao('2026-07-20', ['a'])];
  assert.strictEqual(vizinhaComAPose(ss, 'a', '2026-07-06')!.d, '2026-07-20');
});

test('pose que só existe numa sessão não tem vizinha', () => {
  const ss = [sessao('2026-07-06', ['a']), sessao('2026-07-20', ['b'])];
  assert.strictEqual(vizinhaComAPose(ss, 'a', '2026-07-06'), null);
});

test('a própria sessão nunca é vizinha de si mesma', () => {
  const ss = [sessao('2026-07-06', ['a'])];
  assert.strictEqual(vizinhaComAPose(ss, 'a', '2026-07-06'), null);
});
