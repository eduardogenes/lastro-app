// Séries por músculo: o alvo, o impacto e a atribuição do que foi registrado.

import { test } from 'vitest';
import assert from 'node:assert';
import { alvoDoPrograma, impacto, impactoDoMod, seriesDeGrupo, seriesPorMusculo } from '../../src/dominio/volume';
import type { ContextoDoImpacto } from '../../src/dominio/volume';
import { ALT, EX_BASE, LEGADO, PROGRAMA, ROT_BASE, SIMULACAO_HYROX, slugEx } from '../../src/dominio/programa';
import type { IdEx, Log } from '../../src/dominio/tipos';
import { DIA, inicioDaSemana, log } from './ajuda';

const ALVO = alvoDoPrograma(PROGRAMA, ROT_BASE);

test('o alvo é calculado do programa, nunca transcrito', () => {
  // conferência independente: soma na mão, sem passar pela função sob teste
  const somaNaMao: Record<string, number> = {};
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    if (!ex.g) return;   // estação de HYROX não tem músculo a que atribuir
    somaNaMao[ex.g] = (somaNaMao[ex.g] || 0) + ex.s;
  }));
  assert.deepStrictEqual(ALVO, somaNaMao);

  const total = Object.keys(ALVO).reduce((n, k) => n + ALVO[k], 0);
  assert.strictEqual(total, 90, 'o treinador prescreveu 90 séries de musculação');
  assert.ok(!('' in ALVO), 'grupo vazio viraria um músculo sem nome no painel');
});

test('as prioridades do treinador aparecem no alvo', () => {
  assert.ok(ALVO['peito superior'] >= 10, 'prioridade 1: ' + ALVO['peito superior']);
  assert.ok(ALVO['delt lateral'] >= 12, 'prioridade 1: ' + ALVO['delt lateral']);
  assert.ok(ALVO['dorsal'] >= 10, 'prioridade 2: ' + ALVO['dorsal']);
  assert.ok(ALVO['panturrilha'] >= 10, 'prioridade 2: ' + ALVO['panturrilha']);
  // quadríceps é ponto forte: cedeu volume para quem precisa crescer
  assert.ok(ALVO['quadríceps'] <= 8, 'ponto forte não rouba recuperação: ' + ALVO['quadríceps']);
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
  assert.ok(vistos.size >= 30, 'o programa tem 32 exercícios distintos em 5 treinos');
});

// ---------- a prescrição de 2026: RIR e o que saiu do programa ----------

test('todo exercício prescrito declara o RIR alvo', () => {
  // as estações do HYROX não têm RIR: não são séries de hipertrofia
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    if (!ex.g) return;
    assert.ok(ex.rir, 'sem RIR: ' + ex.n + ' (treino ' + d + ')');
    assert.match(ex.rir!, /^\d(–\d)?$/, 'RIR fora do formato: ' + ex.rir + ' (' + ex.n + ')');
  }));
});

test('o exercício que saiu do programa continua nomeado no catálogo', () => {
  // Sem isto o histórico dele vira exercício fantasma: a tela mostra o slug
  // cru no lugar do nome, e meses de carga ficam ilegíveis.
  Object.keys(LEGADO).forEach(nome => {
    const e = EX_BASE[slugEx(nome)];
    assert.ok(e, 'saiu do catálogo: ' + nome);
    assert.strictEqual(e.n, nome);
    assert.strictEqual(e.g, LEGADO[nome].g, 'grupo do legado sobrescrito por quem ele substitui');
    assert.ok(!e.arq, 'arquivado sumiria das listas de troca; o legado precisa continuar trocável');
  });
});

test('cada exercício do programa tem pelo menos dois substitutos', () => {
  // Só os de musculação: sled push não tem equivalente, e por isso o app nem
  // oferece o botão de trocar num exercício sem grupo muscular.
  ROT_BASE.forEach(d => PROGRAMA[d].ex.forEach(ex => {
    if (!ex.g) return;
    assert.ok(ALT[ex.n] && ALT[ex.n].length >= 2,
      'sem alternativa suficiente: ' + ex.n);
  }));
});

test('o HYROX é sessão da rotação, mas não série de hipertrofia', () => {
  const f = PROGRAMA.HX;
  assert.ok(f, 'o HYROX ocupa um lugar na rotação');
  assert.ok(ROT_BASE.indexOf('HX') >= 0, 'o dia se chama HX, não F');
  assert.strictEqual(ROT_BASE.indexOf('F'), -1,
    'F significou o treino de posteriores no histórico dele; não se reaproveita');

  // O sábado é ABERTO: quem programa é o box, e nada é prescrito de véspera.
  assert.strictEqual(f.aberto, 1, 'o dia se decide no dia');
  assert.deepStrictEqual(f.ex, [], 'e por isso nasce sem exercício');

  // As nove estações saíram da prescrição e continuam no catálogo. A regra que
  // este teste sempre guardou vale para elas, onde quer que morem: estação com
  // grupo muscular entraria no alvo por músculo, e nenhuma delas é série de
  // musculação.
  //
  // A GRANDEZA delas deixou de ser `seg` para todas. Oito são distância — a
  // prova as pontua pelo relógio, mas o que é fixo é a distância, e é dela que
  // sai o ritmo; wall balls é repetição. Enquanto todas se declaravam por
  // tempo, 500 m e 1000 m de remo caíam no mesmo histórico como se fossem a
  // mesma coisa.
  assert.strictEqual(SIMULACAO_HYROX.length, 9, 'a prova tem nove estações');
  SIMULACAO_HYROX.forEach(ex => {
    assert.strictEqual(ex.g, '', 'estação com grupo entraria no alvo por músculo: ' + ex.n);
    assert.ok(ex.u, 'estação sem grandeza viraria série de musculação: ' + ex.n);
    assert.ok(ex.q! > 0, 'sem quantidade não há ritmo a comparar: ' + ex.n);
  });
  const porUnidade = SIMULACAO_HYROX.filter(ex => ex.u === 'm').length;
  assert.strictEqual(porUnidade, 8, 'oito estações são distância');
  assert.strictEqual(SIMULACAO_HYROX.filter(ex => ex.u === 'rep').length, 1, 'wall balls é repetição');
});

// ---------- o impacto de uma MUDANÇA do dia ----------
//
// Veio de `src/main.jsx`, onde lia `S` direto. Das quatro ramificações que
// produzem número, UMA tinha asserção (`troca`, em `tests/fluxo/edicao.test.js`)
// — as três de volume não tinham nenhuma, em lugar nenhum, e são justamente as
// que escrevem o número que ele lê para decidir o que vira permanente.
//
// A rotação daqui é feita à mão e não é o PROGRAMA de verdade: o ponto é que as
// contas se confiram de olho. O alvo também, pela mesma razão.

const DIA_SEM = 7 * 86400000;
const AGORA = 1760000000000;          // qualquer instante fixo serve: nada aqui lê relógio

/** Uma rotação de bolso: peito 5 séries no total, dorsal 4, e uma estação sem músculo. */
function ctxDeTeste(extra?: Partial<ContextoDoImpacto>): ContextoDoImpacto {
  const GRUPO: Record<string, string> = {
    supino: 'peito', crucifixo: 'peito', remada: 'dorsal', puxada: 'dorsal',
    sled: ''                            // estação de HYROX: não há músculo a que atribuir
  };
  const NOME: Record<string, string> = {
    supino: 'supino reto', crucifixo: 'crucifixo', remada: 'remada curvada',
    puxada: 'puxada alta', sled: 'sled push'
  };
  const OFICIAL: Record<string, { s: number; desde: number }> = {
    supino: { s: 3, desde: AGORA - 2 * DIA_SEM },   // entrou há 2 semanas
    remada: { s: 4, desde: 0 },                      // veio do treinador
    puxada: { s: 2, desde: AGORA - 30 * DIA_SEM }    // há 30 semanas
  };
  return Object.assign({
    rotacao: [
      { name: 'A', tag: '', ex: [{ g: 'peito', s: 3 }, { g: 'dorsal', s: 4 }] },
      { name: 'B', tag: '', ex: [{ g: 'peito', s: 2 }] },
      null
    ],
    alvo: { peito: 6 },                 // dorsal de propósito SEM alvo
    grupoDe: (id: IdEx) => GRUPO[id] || '',
    nomeDe: (id: IdEx) => NOME[id] || id,
    oficialDe: (slot: IdEx) => OFICIAL[slot] || null,
    agora: AGORA
  }, extra || {}) as ContextoDoImpacto;
}

test('sets: o impacto é o do programa DEPOIS da promoção, e avisa acima do alvo', () => {
  // peito tem 5 na rotação (3 no A + 2 no B) e o treinador prescreveu 6.
  // Subir o supino de 3 para 5 leva peito a 7 — acima.
  const i = impactoDoMod({ k: 'sets', slot: 'supino' as IdEx, de: 3, para: 5 }, ctxDeTeste());
  assert.deepStrictEqual(i, {
    txt: 'peito passa de 5 para 7 séries na rotação. O treinador prescreveu 6.',
    acima: 1, volume: 1
  });

  // e o mesmo movimento para baixo não avisa nada
  const baixo = impactoDoMod({ k: 'sets', slot: 'supino' as IdEx, de: 3, para: 2 }, ctxDeTeste());
  assert.deepStrictEqual(baixo, { txt: 'peito passa de 5 para 4 séries na rotação. O treinador prescreveu 6.', acima: 0, volume: 1 });

  // chegar EXATAMENTE no alvo não é acima
  const igual = impactoDoMod({ k: 'sets', slot: 'supino' as IdEx, de: 3, para: 4 }, ctxDeTeste());
  assert.strictEqual(igual!.acima, 0, 'no alvo não é acima do alvo');
});

test('sets: sem alvo do treinador, a frase acaba na conta', () => {
  // dorsal não tem alvo neste contexto, e a segunda frase não existe: o app não
  // inventa alvo que o treinador não deu (§5.5 da frente 3).
  const i = impactoDoMod({ k: 'sets', slot: 'remada' as IdEx, de: 4, para: 6 }, ctxDeTeste());
  assert.deepStrictEqual(i, { txt: 'dorsal passa de 4 para 6 séries na rotação.', acima: 0, volume: 1 });
});

test('o que não tem músculo a que atribuir não produz impacto de volume', () => {
  // as estações do HYROX — corrida, sled, wall balls — são sessão de verdade na
  // rotação, e apresentá-las como "séries de quadríceps" foi a falha
  // metodológica que o treinador apontou.
  const ctx = ctxDeTeste();
  assert.strictEqual(impactoDoMod({ k: 'sets', slot: 'sled' as IdEx, de: 1, para: 3 }, ctx), null);
  assert.strictEqual(
    impactoDoMod({ k: 'add', id: 'sled' as IdEx, s: 3, r: '', d: 0, pos: 0 }, ctx), null);
  assert.strictEqual(impactoDoMod({ k: 'rm', slot: 'sled' as IdEx }, ctx), null);
});

test('add: as séries do exercício novo entram inteiras', () => {
  // peito está em 5; acrescentar crucifixo com 3 séries leva a 8, acima do 6.
  const i = impactoDoMod(
    { k: 'add', id: 'crucifixo' as IdEx, s: 3, r: '8–12', d: 90, pos: 2 }, ctxDeTeste());
  assert.deepStrictEqual(i, { txt: 'peito passa de 5 para 8 séries na rotação. O treinador prescreveu 6.', acima: 1, volume: 1 });

  // e sem alvo, a mesma convenção da frase de cima
  const sem = impactoDoMod(
    { k: 'add', id: 'puxada' as IdEx, s: 2, r: '8–12', d: 90, pos: 2 }, ctxDeTeste());
  assert.deepStrictEqual(sem, { txt: 'dorsal passa de 4 para 6 séries na rotação.', acima: 0, volume: 1 });
});

test('rm: desconta as séries do slot OFICIAL, e nunca avisa', () => {
  // o supino oficial tem 3 séries: tirá-lo leva peito de 5 para 2.
  const i = impactoDoMod({ k: 'rm', slot: 'supino' as IdEx }, ctxDeTeste());
  assert.deepStrictEqual(i, { txt: 'peito passa de 5 para 2 séries na rotação. O treinador prescreveu 6.', acima: 0, volume: 1 });

  // E o caso que prova a regra: com alvo 1, remover ainda termina ACIMA — e
  // mesmo assim não avisa. `acima` pinta o aviso, e avisar quem está reduzindo
  // volume para perto do que o treinador pediu seria o sinal ao contrário.
  const ainda = impactoDoMod({ k: 'rm', slot: 'supino' as IdEx }, ctxDeTeste({ alvo: { peito: 1 } }));
  assert.strictEqual(ainda!.acima, 0, 'remoção não avisa nem terminando acima do alvo');
  assert.ok(ainda!.txt.includes('passa de 5 para 2'), ainda!.txt);
});

test('rm: posição que não é oficial não tem o que perder', () => {
  // exercício que o próprio dia acrescentou nunca entrou no programa: remover
  // não muda o oficial em nada, e inventar "peito: 5 → 2" seria mentir.
  const i = impactoDoMod({ k: 'rm', slot: 'crucifixo' as IdEx }, ctxDeTeste());
  assert.strictEqual(i, null, 'crucifixo não está no programa oficial deste contexto');
});

test('troca: dentro das 6 semanas o freio aparece, com o tempo escrito', () => {
  // o supino entrou há 2 semanas. A regra é do treinador: 6 a 8 semanas antes
  // de trocar os principais, porque abaixo disso não deu tempo de o estímulo
  // dizer nada.
  const i = impactoDoMod({ k: 'troca', slot: 'supino' as IdEx, por: 'crucifixo' as IdEx }, ctxDeTeste());
  assert.deepStrictEqual(i, {
    txt: 'supino reto está no programa há 2 semanas. ' +
         'O treinador pede 6 a 8 semanas antes de trocar os principais.',
    acima: 1
  });
});

test('troca: cumpridas as semanas, não há freio nenhum', () => {
  // a puxada está há 30 semanas: trocar é decisão dele, e o app não opina.
  const i = impactoDoMod({ k: 'troca', slot: 'puxada' as IdEx, por: 'remada' as IdEx }, ctxDeTeste());
  assert.strictEqual(i, null);

  // a fronteira exata: 6 semanas já cumpriu
  const seis = ctxDeTeste({ oficialDe: () => ({ s: 3, desde: AGORA - 6 * DIA_SEM }) });
  assert.strictEqual(impactoDoMod({ k: 'troca', slot: 'supino' as IdEx, por: 'x' as IdEx }, seis), null,
    '6 semanas cumpre a regra: o treinador pede 6 A 8, não mais de 6');
  const quase = ctxDeTeste({ oficialDe: () => ({ s: 3, desde: AGORA - 6 * DIA_SEM + 1 }) });
  assert.ok(impactoDoMod({ k: 'troca', slot: 'supino' as IdEx, por: 'x' as IdEx }, quase),
    'um milissegundo antes de 6 semanas, ainda freia');
});

test('troca: o que veio do treinador não freia', () => {
  // `desde: 0` significa "está no programa desde o começo", e é o que o tipo
  // diz (`Slot.desde`: "0 = veio do treinador"). Zero é o começo do tempo, e
  // "desde o começo do tempo" passa pela conta das 6 semanas pelo motivo certo.
  //
  // DECLARADO: este caso é CONSEQUÊNCIA, não ramo. Eu havia escrito um
  // `if (!sl.desde) return null` e a varredura de mutação mostrou que tirá-lo
  // não deixa nenhum caso vermelho — a conta chega sozinha na mesma resposta.
  // O guarda saiu; o comportamento fica cobrado aqui, e a razão está escrita no
  // lugar onde o guarda estava.
  const i = impactoDoMod({ k: 'troca', slot: 'remada' as IdEx, por: 'puxada' as IdEx }, ctxDeTeste());
  assert.strictEqual(i, null, 'a remada veio do treinador: desde 0');
});

test('mudança que não mexe em volume não produz impacto', () => {
  const ctx = ctxDeTeste();
  assert.strictEqual(impactoDoMod({ k: 'reps', slot: 'supino' as IdEx, de: '6–10', para: '8–12' }, ctx), null);
  assert.strictEqual(impactoDoMod({ k: 'desc', slot: 'supino' as IdEx, de: 90, para: 120 }, ctx), null);
  assert.strictEqual(impactoDoMod({ k: 'mover', slot: 'supino' as IdEx, de: 0, para: 2 }, ctx), null);
  assert.strictEqual(impactoDoMod({ k: 'med', slot: 'supino' as IdEx, q: 500 }, ctx), null);
});
