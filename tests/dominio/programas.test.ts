// Os PROGRAMAS (etapa 1 de docs/catalogo): a migração que separa o programa
// somado pela revisão, a que programa pertence uma sessão, a rotação só do
// ativo, trocar e reativar, e a compatibilidade com o build 13 na fusão.

import { test } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  garanteProgramas, separacaoPendente, programaDaSessao, ativaPrograma, criaPrograma, duplicaPrograma, renomeiaPrograma,
  sessoesDoAtivo, balancoDoPrograma, revisoesDoPrograma, nomeLivre, semanaDoAtivo, programasDe, SEPARA_ATE, fundeProgramas
} from '../../src/dominio/programas';
import { proximoTreino } from '../../src/dominio/dia';
import { lerRevisao } from '../../src/dominio/revisao';
import { funde } from '../../src/dominio/sincronia';
import { funde as funde13 } from './fixtures/sincronia-build13';
import type { Estado, Treino } from '../../src/dominio/tipos';

type ComP = Estado & { programas?: ReturnType<typeof programasDe> };
const copia = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const DIA = 86400000;

function fixture(): ComP {
  return JSON.parse(readFileSync(new URL('./fixtures/estado-plano-13.json', import.meta.url), 'utf8'));
}
const tr = (name: string, ids: string[], aberto?: 1): Treino => {
  const t = { name, tag: '', ex: ids.map(id => ({ id, s: 3, r: '8–12', d: 120, desde: 0 })) } as Treino & { aberto?: 1 };
  if (aberto) t.aberto = 1;
  return t;
};
function estado(extra: Partial<ComP> = {}): ComP {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 13,
    prog: null, rot: null, ex: {}, mods: null, progLog: [], apagados: {}, falta: {}, descanso: {}
  } as unknown as ComP, extra);
}
function doisProgramas(): ComP {
  const S = estado({
    prog: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']), HX: tr('HYROX', [], 1) },
    rot: ['A', 'B', 'HX'],
    done: [{ day: 'A', t: 1000 * DIA, sid: 1000 * DIA, dur: 0 }, { day: 'B', t: 1001 * DIA, sid: 1001 * DIA, dur: 0 }] as Estado['done'],
    logs: { supino: [{ t: 1000 * DIA, sid: 1000 * DIA, sets: [[50, 8]] }, { t: 1030 * DIA, sid: 1030 * DIA, sets: [[60, 8]] }] } as Estado['logs']
  });
  garanteProgramas(S);
  return S;
}

// ---------- a migração ----------

test('a migração separa o programa que a revisão somou: A a E guardados, SA a SC e o HYROX no ativo', () => {
  const S = fixture();
  assert.deepStrictEqual(S.rot, ['A', 'B', 'C', 'D', 'E', 'HX', 'SA', 'IA', 'SB', 'IB', 'SC'], 'a fixture traz o caso do dono');
  const sep = separacaoPendente(S)!;
  assert.deepStrictEqual(sep.novos, ['SA', 'IA', 'SB', 'IB', 'SC']);
  assert.deepStrictEqual(sep.velhos, ['A', 'B', 'C', 'D', 'E']);
  assert.strictEqual(garanteProgramas(S), true);
  const P = programasDe(S)!;
  assert.deepStrictEqual(S.rot, ['SA', 'IA', 'SB', 'IB', 'SC', 'HX']);
  assert.deepStrictEqual(Object.keys(S.prog!).sort(), ['HX', 'IA', 'IB', 'SA', 'SB', 'SC']);
  assert.deepStrictEqual(Object.keys(S.progTreinador!.dias).sort(), ['HX', 'IA', 'IB', 'SA', 'SB', 'SC']);
  const velho = P.lista[P.separados!.de];
  assert.strictEqual(velho.estado, 'guardado');
  assert.deepStrictEqual(velho.rot, ['A', 'B', 'C', 'D', 'E', 'HX']);
  assert.deepStrictEqual(Object.keys(velho.prog!).sort(), ['A', 'B', 'C', 'D', 'E', 'HX']);
  assert.strictEqual(P.lista[P.ativo].nome, 'Programa de 23/11');
  assert.strictEqual(P.lista[P.ativo].estado, 'ativo');
});

test('a migração é determinística e idempotente: dois aparelhos chegam ao mesmo documento', () => {
  const a = fixture(), b = fixture();
  garanteProgramas(a); garanteProgramas(b);
  assert.strictEqual(JSON.stringify(a.programas), JSON.stringify(b.programas));
  assert.strictEqual(JSON.stringify(a.prog), JSON.stringify(b.prog));
  const antes = JSON.stringify(a);
  assert.strictEqual(garanteProgramas(a), false);
  assert.strictEqual(JSON.stringify(a), antes);
});

test('sem revisão somada, a migração cria um programa só e não mexe no programa de sempre', () => {
  const S = estado({ prog: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']) }, rot: ['A', 'B'],
    done: [{ day: 'A', t: Date.UTC(2026, 7, 6), sid: 1, dur: 0 }] as Estado['done'] });
  const prog = JSON.stringify(S.prog), rot = JSON.stringify(S.rot);
  assert.strictEqual(garanteProgramas(S), true);
  assert.strictEqual(JSON.stringify(S.prog), prog);
  assert.strictEqual(JSON.stringify(S.rot), rot);
  const P = programasDe(S)!;
  assert.strictEqual(Object.keys(P.lista).length, 1);
  assert.strictEqual(P.lista[P.ativo].nome, 'Programa de agosto');
  assert.strictEqual(P.separados, null);
});

test('uma revisão que mexe num treino de antes não é separada (é revisão de verdade)', () => {
  const S = fixture();
  S.progLog.push({ t: S.progTreinador!.em, day: 'A', txt: 'revisão do treinador de 23/11: Supino sai.', m: 1 } as Estado['progLog'][0]);
  assert.strictEqual(separacaoPendente(S), null);
});

// ---------- a sessão e a rotação ----------

test('a sessão pertence ao programa do campo `prog`; sem ele, ao que valia no instante; e pela letra, se ela não existe nele', () => {
  const S = fixture();
  garanteProgramas(S);
  const P = programasDe(S)!;
  const t = S.progTreinador!.em;
  assert.strictEqual(programaDaSessao(S, { t: t - DIA, day: 'A' }), P.separados!.de);
  assert.strictEqual(programaDaSessao(S, { t: t + DIA, day: 'SA' }), P.ativo);
  assert.strictEqual(programaDaSessao(S, { t: t + DIA, day: 'B' }), P.separados!.de, 'o B depois da troca, gravado pelo build 13');
  assert.strictEqual(programaDaSessao(S, { t: t + DIA, day: 'SA', prog: P.separados!.de }), P.separados!.de);
});

test('a rotação só conta as sessões do ativo: a letra de outro programa não move a fila', () => {
  const S = doisProgramas();
  const idVelho = S.programas!.ativo;
  criaPrograma(S, { nome: 'Novo', origem: 'treinador', prog: { A: tr('Costas', ['remada']), C: tr('Braço', ['rosca']) }, rot: ['A', 'C'],
    progTreinador: null }, 1100 * DIA);
  assert.notStrictEqual(S.programas!.ativo, idVelho);
  assert.deepStrictEqual(S.rot, ['A', 'C', 'HX'], 'o HYROX vem junto, fora de programa');
  // o B de antes, o último registrado, não conta; o A de antes também não
  assert.strictEqual(proximoTreino(S, []), 'A');
  S.done.push({ day: 'A', t: 1101 * DIA, sid: 1101 * DIA, dur: 0, prog: S.programas!.ativo } as Estado['done'][0]);
  assert.strictEqual(proximoTreino(S, []), 'C');
  assert.strictEqual(sessoesDoAtivo(S).length, 1);
});

test('reativar devolve o programa de antes inteiro e recomeça a rotação pelo primeiro', () => {
  const S = doisProgramas();
  const idVelho = S.programas!.ativo;
  const progVelho = JSON.stringify(S.prog);
  criaPrograma(S, { nome: 'Novo', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: null }, 1100 * DIA);
  S.done.push({ day: 'X', t: 1101 * DIA, sid: 1101 * DIA, dur: 0, prog: S.programas!.ativo } as Estado['done'][0]);
  const idNovo = S.programas!.ativo;
  assert.strictEqual(ativaPrograma(S, idVelho, 1102 * DIA), true);
  assert.strictEqual(JSON.stringify(S.prog), progVelho);
  assert.deepStrictEqual(S.rot, ['A', 'B', 'HX']);
  assert.strictEqual(S.programas!.lista[idNovo].estado, 'guardado');
  assert.deepStrictEqual(Object.keys(S.programas!.lista[idNovo].prog!).sort(), ['HX', 'X']);
  // o B foi o último feito no período de antes; reativado, recomeça pelo A
  assert.strictEqual(proximoTreino(S, []), 'A');
  assert.strictEqual(S.programas!.lista[idVelho].periodos.length, 2);
});

test('"começa dd/mm" guarda em Próximo sem mexer no ativo', () => {
  const S = doisProgramas();
  const prog = JSON.stringify(S.prog), ativo = S.programas!.ativo;
  const id = criaPrograma(S, { nome: 'Depois', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: null, comeca: '01/12' }, 1100 * DIA);
  assert.strictEqual(S.programas!.ativo, ativo);
  assert.strictEqual(JSON.stringify(S.prog), prog);
  assert.strictEqual(S.programas!.lista[id].estado, 'proximo');
  assert.strictEqual(S.programas!.lista[id].comeca, '01/12');
});

test('duplicar cria um rascunho; nome repetido ganha "(2)"', () => {
  const S = doisProgramas();
  const id = duplicaPrograma(S, S.programas!.ativo, 1100 * DIA)!;
  assert.strictEqual(S.programas!.lista[id].estado, 'rascunho');
  assert.strictEqual(nomeLivre(S, S.programas!.lista[S.programas!.ativo].nome), S.programas!.lista[S.programas!.ativo].nome + ' (2)');
});

test('o balanço: treinos feitos, a carga que mais subiu e o que seguiu para o ativo', () => {
  const S = doisProgramas();
  const idVelho = S.programas!.ativo;
  criaPrograma(S, { nome: 'Novo', origem: 'treinador', prog: { A: tr('Peito', ['supino']) }, rot: ['A'], progTreinador: null }, 1100 * DIA);
  const b = balancoDoPrograma(S, idVelho, 1200 * DIA, 2)!;
  assert.strictEqual(b.feitos, 2);
  assert.strictEqual(b.progressoes[0].id, 'supino');
  assert.strictEqual(b.progressoes[0].delta, 10);
  assert.deepStrictEqual(b.seguiram, ['supino']);
});

test('as revisões do programa: uma linha por revisão do treinador, a mais nova primeiro', () => {
  const S = fixture();
  garanteProgramas(S);
  const r = revisoesDoPrograma(S, S.programas!.ativo);
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].quem, 'treinador');
  assert.match(r[0].titulo, /^Revisão de 23\/11: 5 treinos$/);
});

test('a semana do programa ativo conta os treinos dele desde o início', () => {
  const S = doisProgramas();
  criaPrograma(S, { nome: 'Novo', origem: 'treinador', prog: { X: tr('X', ['remada']), Y: tr('Y', ['rosca']) }, rot: ['X', 'Y'], progTreinador: null }, 1100 * DIA);
  S.done.push({ day: 'X', t: 1101 * DIA, sid: 1101 * DIA, dur: 0 } as Estado['done'][0]);
  const s = semanaDoAtivo(S, 1102 * DIA)!;
  assert.strictEqual(s.semana, 1);
  assert.deepStrictEqual(s.feitos, ['X']);
});

// ---------- o texto do treinador ----------

test('o leitor lê as linhas opcionais de programa e objetivo, só antes do primeiro treino', () => {
  const l = lerRevisao(`Programa · v2.2 Lombar · começa 01/12
Objetivo: Fase 1 da lombar, sem carga axial pesada.
Revisão 23/11
Treino SA · Peito
- Supino · 3 x 8-12`);
  assert.deepStrictEqual(l.programa, { nome: 'v2.2 Lombar', comeca: '01/12' });
  assert.strictEqual(l.objetivo, 'Fase 1 da lombar, sem carga axial pesada.');
  assert.strictEqual(l.problemas.length, 0);
  assert.strictEqual(lerRevisao('Revisão 23/11\nTreino A · x\n- Supino · 3 x 8').programa, undefined);
});

// ---------- a fusão com o build 13 ----------

test('a troca de programa atravessa uma fusão no build 13 e volta inteira', () => {
  const T = 1795500000000;
  const novo = doisProgramas();
  criaPrograma(novo, { nome: 'Novo', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: null }, T);
  Object.assign(novo, { mtime: T + 5, carimbosEm: T + 5, carimbos: { prog: T + 5, rot: T + 5, progTreinador: T + 5, programas: T + 5 } });
  // o iPhone no build 13: o programa de antes, sem `programas`, e uma série registrada depois (mtime maior)
  const velho = doisProgramas();
  delete velho.programas;
  Object.assign(velho, { mtime: T + 9, carimbosEm: T + 9, carimbos: { prog: T - 100, rot: T - 100 } });
  velho.logs.remada = [{ t: T + 9, sid: T + 9, sets: [[40, 10]] }] as Estado['logs']['x'];
  const no13 = funde13(velho, novo, T + 10).estado as ComP;
  assert.deepStrictEqual(Object.keys(no13.prog!).sort(), ['HX', 'X'], 'o 13 leva o programa novo por documento');
  const volta = funde(novo, no13, T + 11).estado as ComP;
  assert.deepStrictEqual(Object.keys(volta.prog!).sort(), ['HX', 'X']);
  assert.strictEqual(volta.programas!.ativo, novo.programas!.ativo, 'o documento dos programas volta do lado que o tinha');
  assert.strictEqual(Object.keys(volta.programas!.lista).length, 2);
  assert.strictEqual(volta.logs.remada.length, 1, 'e a série do 13 chegou');
});

test('a separação da migração, carimbada, vence o programa somado de um aparelho no build 13', () => {
  const T = 1795500000000;
  const migrado = fixture();
  garanteProgramas(migrado);
  Object.assign(migrado, { mtime: T + 5, carimbosEm: T + 5, carimbos: Object.assign({}, migrado.carimbos, { prog: T + 5, rot: T + 5, progTreinador: T + 5, programas: T + 5 }) });
  const velho = fixture();
  Object.assign(velho, { mtime: T + 9, carimbosEm: T + 9 });
  const no13 = funde13(velho, migrado, T + 10).estado as ComP;
  assert.deepStrictEqual(no13.rot, ['SA', 'IA', 'SB', 'IB', 'SC', 'HX']);
  const volta = funde(migrado, no13, T + 11).estado as ComP;
  assert.deepStrictEqual(volta.rot, ['SA', 'IA', 'SB', 'IB', 'SC', 'HX']);
  assert.strictEqual(garanteProgramas(volta), false, 'nada a migrar de novo');
});

test('ativos diferentes nos dois lados: os treinos vêm do mesmo lado que os programas', () => {
  const T = 1795500000000;
  const a = doisProgramas();
  const b = copia(a);
  // A trocou de programa (carimbo T+5); B, sem saber, editou o programa de antes depois (T+8)
  criaPrograma(a, { nome: 'Novo', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: null }, T);
  Object.assign(a, { mtime: T + 5, carimbosEm: T + 5, carimbos: { prog: T + 5, rot: T + 5, progTreinador: T + 5, programas: T + 5 } });
  b.prog!.A.ex[0].s = 5;
  Object.assign(b, { mtime: T + 8, carimbosEm: T + 8, carimbos: { prog: T + 8, programas: 1 } });
  const r = funde(b, a, T + 10).estado as ComP;
  assert.strictEqual(r.programas!.ativo, a.programas!.ativo);
  assert.deepStrictEqual(Object.keys(r.prog!).sort(), ['HX', 'X'], 'sem o nome de um programa com os treinos de outro');
});

// ---------- o espelho dos agentes ----------

test('o espelho mostra os programas: o ativo e o guardado, com os treinos de cada um', async () => {
  const { montaArquivos } = await import('../../ferramentas/espelho/monta');
  const S = fixture();
  garanteProgramas(S);
  const arq = montaArquivos(S, { agora: S.progTreinador!.em + 2 * DIA } as never);
  const md = arq['treino/programas.md'] as string;
  assert.ok(md, 'o arquivo existe');
  assert.match(md, /## Programa de 23\/11 \(ativo\)/);
  assert.match(md, /\(guardado\)/);
  assert.match(md, /- \*\*Treinos:\*\* A \(/);
  assert.match(arq['treino/programa.md'] as string, /- \*\*Programa:\*\* Programa de 23\/11/);
});

// ---------- os cenários da revisão de dado (P1–P4), contra o funde do build 13 ----------

const tem = (s: ComP, letras: string[]) => letras.every(d => (s.prog && s.prog[d]) ||
  Object.values(s.programas?.lista || {}).some(p => p.prog && p.prog[d]));
const comSessoes = () => {
  const S = fixture();
  const ago = Date.UTC(2026, 7, 6, 21);
  S.done = ['A', 'B', 'C', 'D', 'E', 'A', 'B', 'C'].map((d, i) => ({ day: d, t: ago + i * 3 * DIA, sid: ago + i * 3 * DIA, dur: 3600000 })) as Estado['done'];
  return S;
};
/** o que carimbaProgramasNovos faz depois de separar: um acima do maior carimbo dos três */
function carimbaSeparacao(S: ComP, mtime: number) {
  const c = 1 + Math.max(0, S.carimbos?.prog || 0, S.carimbos?.rot || 0, S.carimbos?.progTreinador || 0);
  S.carimbos = Object.assign({}, S.carimbos, { prog: c, rot: c, progTreinador: c, programas: c });
  Object.assign(S, { mtime, carimbosEm: mtime });
}

test('P2: um aparelho com o estado de antes da v2.2 abre o build novo depois; a v2.2 não some', () => {
  const A = fixture(); garanteProgramas(A);
  const T = A.progTreinador!.em;
  carimbaSeparacao(A, T + DIA);
  const B = fixture();
  ['SA', 'IA', 'SB', 'IB', 'SC'].forEach(d => { delete B.prog![d]; });
  B.rot = B.rot!.filter(d => !/^S|^I/.test(d)); B.progTreinador = null; B.progLog = [];
  Object.assign(B, { mtime: T - DIA, carimbosEm: T - DIA, carimbos: { prog: T - DIA, rot: T - DIA } });
  garanteProgramas(B); B.carimbos.programas = 1;               // "criou": carimbo mínimo
  Object.assign(B, { mtime: T + DIA + 3600000, carimbosEm: T + DIA + 3600000 });
  const r1 = funde(copia(B), copia(A), T + 2 * DIA).estado as ComP;
  assert.ok(tem(r1, ['SA', 'IA', 'SB', 'IB', 'SC']), 'a v2.2 continua');
  assert.ok(tem(r1, ['A', 'B', 'C', 'D', 'E']), 'e A a E também');
  assert.strictEqual(r1.programas!.ativo, A.programas!.ativo);
  assert.deepStrictEqual(Object.keys(r1.prog!).sort(), ['HX', 'IA', 'IB', 'SA', 'SB', 'SC']);
  const r2 = funde(copia(A), copia(r1), T + 3 * DIA).estado as ComP;
  assert.strictEqual(r2.programas!.ativo, A.programas!.ativo);
  assert.ok(tem(r2, ['A', 'SA']));
});

test('P3: um toque pequeno (Entendi, renomear) num aparelho desatualizado não desfaz o programa novo do outro', () => {
  const base = fixture(); garanteProgramas(base);
  const T0 = base.progTreinador!.em + DIA;
  carimbaSeparacao(base, T0);
  const N1 = copia(base), N2 = copia(base), N3 = copia(base);
  const T1 = T0 + 3600000;
  const idNovo = criaPrograma(N1, { nome: 'v2.3', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: null }, T1);
  Object.assign(N1, { mtime: T1, carimbosEm: T1 }); Object.assign(N1.carimbos!, { prog: T1, rot: T1, progTreinador: T1, programas: T1 });
  const T2 = T1 + 60000;
  N2.programas = Object.assign({}, N2.programas, { separados: Object.assign({}, N2.programas!.separados, { visto: 1 }) });
  Object.assign(N2, { mtime: T2, carimbosEm: T2 }); N2.carimbos!.programas = T2;
  const r = funde(copia(N2), copia(N1), T2 + 10).estado as ComP;
  assert.strictEqual(r.programas!.ativo, idNovo);
  assert.deepStrictEqual(Object.keys(r.prog!).sort(), ['HX', 'X']);
  assert.strictEqual(r.programas!.separados!.visto, 1, 'e o "Entendi" fica');
  // renomear num aparelho, "começa 01/12" no outro: os dois ficam
  const idProx = criaPrograma(N3, { nome: 'Depois', origem: 'treinador', prog: { Y: tr('Y', ['rosca']) }, rot: ['Y'], progTreinador: null, comeca: '01/12' }, T1);
  Object.assign(N3, { mtime: T1, carimbosEm: T1 }); N3.carimbos!.programas = T1;
  const N4 = copia(base); renomeiaPrograma(N4, N4.programas!.ativo, 'Lombar', T2);
  Object.assign(N4, { mtime: T2, carimbosEm: T2 }); N4.carimbos!.programas = T2;
  const r4 = funde(copia(N4), copia(N3), T2 + 10).estado as ComP;
  assert.ok(r4.programas!.lista[idProx], 'o de Próximo continua');
  assert.strictEqual(r4.programas!.lista[r4.programas!.ativo].nome, 'Lombar', 'e o nome novo também');
});

test('P1 (cenário 3): um aparelho que passou pelo build 13 e atualiza não apaga o A a E guardado', () => {
  const iphone = comSessoes(); garanteProgramas(iphone);
  const T = iphone.progTreinador!.em;
  carimbaSeparacao(iphone, T + DIA);
  const ipad = comSessoes();
  ipad.logs['supino-x'] = [{ t: T + DIA + 600000, sid: T + DIA + 600000, sets: [[40, 10]] }] as Estado['logs']['x'];
  Object.assign(ipad, { mtime: T + DIA + 600000, carimbosEm: T + DIA + 600000 });
  const no13 = funde13(copia(ipad), copia(iphone), T + DIA + 600010).estado as ComP;
  assert.deepStrictEqual(Object.keys(no13.prog!).sort(), ['HX', 'IA', 'IB', 'SA', 'SB', 'SC'], 'o 13 adota a separação pelo carimbo');
  // o iPad atualiza: a migração roda no estado dele (sem `programas`)
  assert.strictEqual(garanteProgramas(no13), true);
  if (!no13.carimbos!.programas) no13.carimbos!.programas = 1;
  const r = funde(copia(no13), copia(iphone), T + 2 * DIA).estado as ComP;
  assert.ok(tem(r, ['A', 'B', 'C', 'D', 'E']), 'A a E continua guardado');
  assert.strictEqual(r.programas!.ativo, iphone.programas!.ativo);
  assert.deepStrictEqual(Object.keys(r.prog!).sort(), ['HX', 'IA', 'IB', 'SA', 'SB', 'SC']);
  const velho = r.programas!.lista[iphone.programas!.separados!.de];
  assert.ok(velho.prog!.A && velho.prog!.E, 'a cópia de A a E não foi trocada pela recriada');
  const r2 = funde(copia(iphone), copia(r), T + 3 * DIA).estado as ComP;
  assert.ok(tem(r2, ['A', 'E']));
  assert.strictEqual((r2.logs['supino-x'] || []).length, 1, 'e a série do iPad chegou');
});

test('P4 (cenário 4): um aparelho no 13 edita o programa de antes depois da troca; o ativo não fica misturado, e a edição vai para a cópia', () => {
  const base = fixture(); garanteProgramas(base);
  const T0 = base.progTreinador!.em + DIA;
  carimbaSeparacao(base, T0);
  const N = copia(base), O = copia(base);
  const T1 = T0 + 3600000;
  const idAntes = base.programas!.ativo;
  criaPrograma(N, { nome: 'v2.3', origem: 'treinador', prog: { X: tr('X', ['remada']), Y: tr('Y', ['rosca']) }, rot: ['X', 'Y'],
    progTreinador: { em: T1, data: null, rot: ['X', 'Y'], dias: { X: tr('X', ['remada']), Y: tr('Y', ['rosca']) } } }, T1);
  N.prog!.X.ex[0].s = 5;
  Object.assign(N, { mtime: T1 + 1000, carimbosEm: T1 + 1000 }); Object.assign(N.carimbos!, { prog: T1 + 1000, rot: T1, progTreinador: T1, programas: T1 });
  const T2 = T1 + 7200000;
  O.prog!.SA.ex[0].s = 2;
  Object.assign(O, { mtime: T2, carimbosEm: T2 }); O.carimbos!.prog = T2;
  const no13 = funde13(copia(O), copia(N), T2 + 10).estado as ComP;
  const r = funde(copia(N), copia(no13), T2 + 20).estado as ComP;
  assert.deepStrictEqual(Object.keys(r.prog!).sort(), ['HX', 'X', 'Y']);
  assert.deepStrictEqual(r.rot, ['X', 'Y', 'HX']);
  assert.strictEqual(r.prog!.X.ex[0].s, 5, 'a edição de N no programa novo fica');
  assert.strictEqual(r.programas!.lista[idAntes].prog!.SA.ex[0].s, 2, 'a edição de O vai para a cópia do programa de antes');
  assert.ok(r.carimbos!.prog > T2 && r.carimbos!.rot > T2, 'carimbo acima dos dois');
  // O (13) puxa de novo: converge
  const o2 = funde13(copia(no13), copia(r), T2 + 30).estado as ComP;
  assert.deepStrictEqual(Object.keys(o2.prog!).sort(), ['HX', 'X', 'Y']);
  assert.deepStrictEqual(o2.rot, ['X', 'Y', 'HX']);
  // variação: O nunca recebeu `programas`
  const O2 = copia(base); delete O2.programas; O2.prog!.SA.ex[0].s = 2;
  Object.assign(O2, { mtime: T2, carimbosEm: T2 }); O2.carimbos!.prog = T2; delete O2.carimbos!.programas;
  const no13b = funde13(copia(O2), copia(N), T2 + 10).estado as ComP;
  const rb = funde(copia(N), copia(no13b), T2 + 20).estado as ComP;
  assert.deepStrictEqual(Object.keys(rb.prog!).sort(), ['HX', 'X', 'Y']);
  assert.strictEqual(proximoTreino(rb, []), 'X');
  assert.strictEqual(rb.programas!.lista[idAntes].prog!.SA.ex[0].s, 2);
});

test('P5: a separação guarda também as letras do programa de antes que estavam fora da rotação', () => {
  const S = fixture();
  S.prog!.F = tr('Extra', ['rosca']);              // em prog, fora da rotação
  garanteProgramas(S);
  const velho = S.programas!.lista[S.programas!.separados!.de];
  assert.ok(velho.prog!.F, 'o F vai para o guardado');
  assert.ok(!S.prog!.F, 'e sai do ativo');
});

test('C1 e C2: não separa com um treino de antes aberto, nem uma revisão colada depois da etapa 1', () => {
  const S = fixture();
  (S as Estado).sessao = { day: 'B', inicio: 1, ultima: 1, sid: 1 } as Estado['sessao'];
  assert.strictEqual(separacaoPendente(S), null);
  const S2 = fixture();
  S2.progTreinador!.em = SEPARA_ATE + 1;
  S2.progLog.forEach(e => { e.t = SEPARA_ATE + 1; });
  assert.strictEqual(separacaoPendente(S2), null);
});

test('na primeira fusão com a conta, os programas vêm do mesmo lado que o programa (PRESCRICAO)', () => {
  const conta = doisProgramas();
  criaPrograma(conta, { nome: 'Da conta', origem: 'treinador', prog: { X: tr('X', ['remada']) }, rot: ['X'], progTreinador: { em: 5, data: null, rot: ['X'], dias: { X: tr('X', ['remada']) } } }, 1100 * DIA);
  Object.assign(conta, { mtime: 1100 * DIA, carimbosEm: 1100 * DIA, carimbos: { prog: 1100 * DIA, rot: 1100 * DIA, progTreinador: 1100 * DIA, programas: 1100 * DIA } });
  const novo = estado({ primeiraVez: 4, prog: { Q: tr('Q', ['supino']) }, rot: ['Q'] } as Partial<ComP>);
  garanteProgramas(novo);
  Object.assign(novo, { mtime: 1200 * DIA, carimbosEm: 1200 * DIA, carimbos: { programas: 1 } });
  const r = funde(novo, conta, 1201 * DIA, true).estado as ComP;
  assert.strictEqual(r.programas!.ativo, conta.programas!.ativo);
  assert.deepStrictEqual(Object.keys(r.prog!), ['X', 'HX'].filter(d => r.prog![d]));
});

test('o id da migração é determinístico (a primeira sessão), e é o mesmo do guardado de quem já separou', () => {
  const a = comSessoes(), b = comSessoes();
  garanteProgramas(a);
  ['SA', 'IA', 'SB', 'IB', 'SC'].forEach(d => { delete b.prog![d]; });
  b.rot = b.rot!.filter(d => !/^S|^I/.test(d)); b.progLog = [];
  garanteProgramas(b);
  assert.strictEqual(b.programas!.ativo, a.programas!.separados!.de);
});

test('a rotação ignora a mesma letra de outro programa (discriminante)', () => {
  const S = doisProgramas();                    // o último do de antes foi o B
  S.done.push({ day: 'A', t: 1002 * DIA, sid: 1002 * DIA, dur: 0 } as Estado['done'][0]);   // e depois o A
  criaPrograma(S, { nome: 'Novo', origem: 'treinador', prog: { A: tr('A2', ['remada']), B: tr('B2', ['rosca']), C: tr('C2', ['x']) }, rot: ['A', 'B', 'C'], progTreinador: null }, 1100 * DIA);
  // sem o filtro do ativo, o A de antes faria o próximo ser o B
  assert.strictEqual(proximoTreino(S, []), 'A');
});

test('fundir: a entrada com cópia nunca é trocada por uma sem cópia, mesmo mais nova', () => {
  const S = fixture(); garanteProgramas(S);
  const P = S.programas!;
  const de = P.separados!.de;
  const semCopia = copia(P);
  delete semCopia.lista[de].prog; delete semCopia.lista[de].rot; delete semCopia.lista[de].progTreinador;
  semCopia.lista[de].m = P.lista[de].m + 1000;       // mais nova, e sem cópia
  semCopia.lista[de].nome = 'Renomeado';
  const vivo = () => ({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador || null, carimbo: 0 });
  const r = fundeProgramas(semCopia, P, vivo)!;
  assert.ok(r.lista[de].prog && r.lista[de].prog.A, 'a cópia ficou');
  assert.strictEqual(r.lista[de].nome, 'Renomeado', 'e o nome mais novo também');
});
