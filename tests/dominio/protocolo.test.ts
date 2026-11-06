// O protocolo de fotos: ordem, continuidade e referência.
//
// O que estes testes protegem não é a lista de poses — é a COMPARABILIDADE.
// Uma sessão que continua de onde parou, uma referência que não cega quando uma
// pose é pulada, e um par padrão que não compara duas semanas de água.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  CADENCIA_DIAS, CONFERE_SEMPRE, DESDE_11_POSES, PASSOS_DO_AJUSTE, POSES_ATE_05_11, PROTOCOLO, montagem, posesDaData, comAPose, completude, dataLocal, diasDesde,
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

test('as poses do catálogo têm id único e giro conhecido', () => {
  assert.strictEqual(PROTOCOLO.length, 11);
  const ids = new Set(PROTOCOLO.map(p => p.id));
  assert.strictEqual(ids.size, 11);
  PROTOCOLO.forEach(p => {
    assert.ok([0, 90, 180, 270].includes(p.giro), p.id + ' com giro ' + p.giro);
    assert.ok(p.como.length >= 2, p.id + ' sem execução');
    assert.ok(p.revela && p.erro, p.id + ' sem revela/erro');
  });
});

test('toda pose pedida tem a frase da voz, curta', () => {
  // a três metros nada se lê: o que a voz diz é a instrução. Uns 8 s falados.
  poses(null).forEach(p => {
    assert.ok(p.voz, p.id + ' sem voz');
    assert.ok(p.voz!.length <= 110, p.id + ' com voz longa demais: ' + p.voz!.length);
  });
});

test('a montagem não troca lente por distância: é a 1×, sempre, nos dois modos', () => {
  // "3 m com a 2× ou 2,5 m com a 1×" mostrava uma faixa 1,67× maior da cena; e
  // desde a revisão de quem fotografa (F5) a lente é só a 1×
  (['alguem', 'sozinho'] as const).forEach(q => {
    const itens = montagem(q);
    const texto = itens.map(i => i.valor + ' ' + i.nota).join(' ');
    assert.ok(!/(2,5|3) m com a/.test(texto), q + ': ' + texto);
    const lente = itens.filter(i => i.k === 'lente')[0];
    assert.strictEqual(lente.valor, 'a 1×, sempre');
    assert.ok(/Não troque para a 2× nem para a 0,5×/.test(lente.nota));
    // a lente fica na linha do quadril, e não no umbigo
    const alt = itens.filter(i => i.k === 'alt')[0];
    assert.ok(/quadril|mesmo espaço/.test(alt.nota) && !/^Umbigo/.test(alt.nota), alt.nota);
  });
});

test('cômodo pequeno: encurta a parede, nunca a lente', () => {
  // D2 (decisão do dono, 04/11): a 0,5× obriga a chegar a uns 70 cm
  (['alguem', 'sozinho'] as const).forEach(q => {
    const parede = montagem(q).filter(i => i.k === 'parede')[0];
    assert.ok(/encurte até 40 cm/.test(parede.nota) && /Nunca troque para a 0,5×/.test(parede.nota), parede.nota);
  });
});

test('com alguém tirando, a montagem é a de quem fotografa', () => {
  // F1–F4, F6, F7: cadeira marcada, regra do centro, linhas como régua, pegada
  const itens = montagem('alguem');
  const k = itens.map(i => i.k);
  ['quem', 'dist', 'alt', 'pegada', 'lente', 'apoio', 'parede', 'luz', 'hora', 'roupa']
    .forEach(c => assert.ok(k.includes(c), 'falta ' + c));
  const de = (c: string) => itens.filter(i => i.k === c)[0];
  assert.ok(/cadeira/.test(de('quem').valor) && /fita/.test(de('quem').nota));
  assert.strictEqual(de('dist').valor, 'a das linhas');
  assert.ok(/punhos podem passar/.test(de('dist').nota), 'a linha de cima é para a cabeça (F11)');
  assert.ok(/mesmo espaço acima da cabeça e abaixo dos pés/.test(de('alt').nota), 'a regra do centro (F3)');
  assert.ok(/não fica entre a luz e a pessoa/.test(de('luz').nota), 'F7');
  // sozinho, nada de cadeira: o celular está apoiado
  assert.ok(!montagem('sozinho').some(i => i.k === 'quem' || i.k === 'pegada'));
});

test('cada pose tem a linha que quem fotografa confere, com no máximo dois itens', () => {
  // F16: é tela, nunca voz — e cabe embaixo do quadro, em duas linhas no máximo
  poses(null).forEach(p => {
    assert.ok(p.confira, p.id + ' sem linha de conferência');
    assert.ok(p.confira!.split(' · ').length <= 2, p.id + ': ' + p.confira);
  });
  assert.strictEqual(poseDe('costas-maos-na-cintura')!.confira, 'mãos só apoiadas, sem beliscar · cintura à mostra');
  assert.strictEqual(CONFERE_SEMPRE, 'nível verde · cabeça e pés nas linhas');
  assert.strictEqual(PASSOS_DO_AJUSTE.length, 4);
});

test('no abdômen a pessoa olha para a frente, e não para o celular', () => {
  // F21: com a lente no quadril, olhar para o celular baixa a cabeça uns 28°
  const p = poseDe('frente-abdomen-coxa')!;
  assert.ok(!/celular/.test(p.voz! + p.como.join(' ')), p.voz);
  assert.ok(/Olhe para a frente\./.test(p.voz!));
  assert.ok(/Olhe para a frente, na altura dos olhos/.test(p.como.join(' ')));
  // F22: pés juntos no duplo bíceps de costas, mãos só apoiadas na cintura
  assert.ok(/Pés juntos/.test(poseDe('costas-duplo-biceps')!.voz!));
  assert.ok(/sem beliscar/i.test(poseDe('costas-maos-na-cintura')!.voz!));
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
  assert.strictEqual(c.total, 11);
});

// ---------- 9 → 11 poses (06/11/2026) ----------

test('as duas poses novas ficam junto das que usam a mesma posição de câmera', () => {
  assert.deepStrictEqual(ordemPadrao(), [
    'frente-relaxado', 'frente-bracos-afastados', 'frente-duplo-biceps', 'frente-abdomen-coxa',
    'perfil-direito', 'perfil-direito-postura', 'perfil-maos-na-nuca',
    'costas-relaxado', 'costas-duplo-biceps', 'costas-maos-na-cintura', 'perfil-esquerdo'
  ]);
  assert.strictEqual(poseDe('frente-bracos-afastados')!.giro, 0);
  assert.strictEqual(poseDe('perfil-maos-na-nuca')!.giro, 90);
});

test('as nove poses de antes não mudaram de id nem de nome', () => {
  assert.deepStrictEqual(POSES_ATE_05_11.map(id => poseDe(id)!.n), [
    'Frente relaxado', 'Frente duplo bíceps', 'Abdômen e coxa', 'Perfil direito', 'Perfil direito natural',
    'Costas relaxado', 'Costas duplo bíceps', 'Costas mãos na cintura', 'Perfil esquerdo'
  ]);
});

test('sessão antiga continua contada sobre nove; a partir de 06/11, sobre onze', () => {
  assert.strictEqual(DESDE_11_POSES, '2026-11-06');
  assert.strictEqual(posesDaData('2026-10-29', null).length, 9);
  assert.strictEqual(posesDaData('2026-11-05', null).length, 9);
  assert.strictEqual(posesDaData('2026-11-06', null).length, 11);
  const antiga = sessao('2026-10-29', POSES_ATE_05_11);
  assert.deepStrictEqual([completude(antiga, null).feitas, completude(antiga, null).total], [9, 9]);
  assert.strictEqual(completude(antiga, null).cheia, true);
  const meia = sessao('2026-10-12', POSES_ATE_05_11.slice(0, 5));
  assert.strictEqual(completude(meia, null).total, 9, '"5 de 9" continua "5 de 9"');
  const nova = sessao('2026-11-27', POSES_ATE_05_11);
  const c = completude(nova, null);
  assert.deepStrictEqual([c.feitas, c.total], [9, 11]);
  assert.deepStrictEqual(c.faltando, ['frente-bracos-afastados', 'perfil-maos-na-nuca']);
  assert.strictEqual(proximaPose(nova, null), 'frente-bracos-afastados');
});

test('na das mãos na cintura não há mais pinça: mãos só apoiadas, sem beliscar', () => {
  const p = poseDe('costas-maos-na-cintura')!;
  const txt = p.como.join(' ') + ' ' + p.voz;
  assert.ok(/só apoiadas/.test(txt) && /polegares logo acima do osso do quadril/.test(txt));
  assert.ok(/Sem beliscar a pele/.test(txt));
  assert.ok(!/contraída|pinç|segur/i.test(txt), txt);
});

test('a completude conta contra a ordem dele, não contra a do código', () => {
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
