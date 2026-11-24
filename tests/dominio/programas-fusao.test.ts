// A fusão dos PROGRAMAS, rodada 2 da revisão de dado da etapa 1: a identidade
// de um programa é o id (ou os exercícios, do lado do build 13), nunca o
// conjunto de letras. Os cenários são os do revisor (r2-*), e o fuzz junta
// três aparelhos, um deles no build 13, até ele atualizar.

import { test } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { garanteProgramas, criaPrograma, ativaPrograma, renomeiaPrograma, programasDe, mesmoPrograma, fundeProgramas } from '../../src/dominio/programas';
import { funde } from '../../src/dominio/sincronia';
import { funde as funde13 } from './fixtures/sincronia-build13';

/* eslint-disable @typescript-eslint/no-explicit-any */
const copia = (x: any) => JSON.parse(JSON.stringify(x));
const tr = (name: string, ids: string[], s = 3) => ({ name, tag: '', ex: ids.map(id => ({ id, s, r: '8–12', d: 120, desde: 0 })) });
const vazio = (extra: any): any => Object.assign({ logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [], body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 13,
  ex: {}, mods: null, progLog: [], apagados: {}, falta: {}, descanso: {} }, extra);
const carimba = (S: any, t: number, docs: string[]) => { S.carimbos = Object.assign({}, S.carimbos); docs.forEach(d => { S.carimbos[d] = t; }); S.mtime = Math.max(S.mtime || 0, t); S.carimbosEm = S.mtime; };
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/estado-plano-13.json', import.meta.url), 'utf8'));
const T = 1796000000000, H = 3600000;

test('identidade pelos exercícios: mesmas letras com treinos diferentes são programas diferentes', () => {
  assert.strictEqual(mesmoPrograma({ A: tr('A', ['supino']), B: tr('B', ['leg']) } as any, { A: tr('A', ['remada']), B: tr('B', ['rosca']) } as any), false);
  assert.strictEqual(mesmoPrograma({ A: tr('A', ['supino']), B: tr('B', ['leg'], 5) } as any, { A: tr('A', ['supino', 'crucifixo']), B: tr('B', ['leg']) } as any), true);
  assert.strictEqual(mesmoPrograma({ A: tr('A', ['supino']) } as any, { X: tr('X', ['supino']) } as any), false, 'sem letra em comum');
});

test('item 1: a edição de um programa nunca vai para a cópia de outro com as mesmas letras', () => {
  const base = vazio({ done: [{ day: 'A', t: T - 9e8, sid: T - 9e8, dur: 0 }], prog: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']) }, rot: ['A', 'B'], progTreinador: null });
  garanteProgramas(base); carimba(base, T, ['prog', 'rot']); base.carimbos.programas = 1;
  const idP0 = base.programas.ativo;
  const X = copia(base);
  const idP1 = criaPrograma(X, { nome: 'P1', origem: 'treinador', prog: { A: tr('Costas', ['remada']), B: tr('Braço', ['rosca']) }, rot: ['A', 'B'], progTreinador: null } as any, T + H);
  carimba(X, T + H, ['prog', 'rot', 'progTreinador', 'programas']);
  X.prog.B.ex[0].s = 6; carimba(X, T + 3 * H, ['prog']);
  const Y = copia(base);
  criaPrograma(Y, { nome: 'P2', origem: 'treinador', prog: { C: tr('Ombro', ['desenvolvimento']) }, rot: ['C'], progTreinador: null } as any, T + 2 * H);
  carimba(Y, T + 2 * H, ['prog', 'rot', 'progTreinador', 'programas']);
  const r = funde(copia(Y), copia(X), T + 4 * H).estado as any;
  const r2 = funde(copia(X), copia(Y), T + 4 * H).estado as any;
  assert.deepStrictEqual(Object.keys(r.prog), ['C']);
  assert.strictEqual(r.programas.lista[idP0].prog.A.ex[0].id, 'supino', 'a cópia do P0 continua do P0');
  assert.strictEqual(r.programas.lista[idP1].prog.B.ex[0].s, 6, 'a edição do P1 vai para o P1');
  assert.strictEqual(JSON.stringify(r.programas), JSON.stringify(r2.programas), 'os dois sentidos dão o mesmo documento');
});

test('item 2: com as mesmas letras, o aparelho no 13 que edita o programa de antes não apaga o novo', () => {
  const base = vazio({ prog: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']) }, rot: ['A', 'B'],
    progTreinador: { em: T - 9e8, data: null, rot: ['A', 'B'], dias: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']) } },
    done: [{ day: 'A', t: T - 8e8, sid: T - 8e8, dur: 0 }] });
  garanteProgramas(base); carimba(base, T, ['prog', 'rot', 'progTreinador']); base.carimbos.programas = 1;
  const idVelho = base.programas.ativo;
  const N = copia(base);
  criaPrograma(N, { nome: 'Novo', origem: 'treinador', prog: { A: tr('Costas', ['remada']), B: tr('Braço', ['rosca']) }, rot: ['A', 'B'],
    progTreinador: { em: T + H, data: null, rot: ['A', 'B'], dias: { A: tr('Costas', ['remada']), B: tr('Braço', ['rosca']) } } } as any, T + H);
  carimba(N, T + H, ['prog', 'rot', 'progTreinador', 'programas']);
  const O = copia(base); delete O.programas; delete O.carimbos.programas;
  O.prog.A.ex[0].s = 5; carimba(O, T + 2 * H, ['prog']);
  const no13 = funde13(copia(O), copia(N), T + 2 * H + 10).estado as any;
  const r = funde(copia(N), copia(no13), T + 2 * H + 20).estado as any;
  assert.strictEqual(r.programas.lista[r.programas.ativo].nome, 'Novo');
  assert.strictEqual(r.prog.A.ex[0].id, 'remada', 'o ativo continua com os treinos do novo');
  assert.strictEqual(r.programas.lista[idVelho].prog.A.ex[0].s, 5, 'a edição do 13 vai para a cópia do de antes');
});

test('item 3: o programa somado editado offline no 13 se reparte: o ativo e a cópia guardam cada edição', () => {
  const L = fixture(); const c0 = Math.max(L.carimbos.prog, L.carimbos.rot, L.carimbos.progTreinador);
  garanteProgramas(L); ['prog', 'rot', 'progTreinador', 'programas'].forEach(d => { L.carimbos[d] = c0 + 1; });
  const R = fixture(); const Te = c0 + 5 * H;
  R.prog.SA.ex[0].s = 9; R.prog.B.ex[0].s = 7; carimba(R, Te, ['prog']);
  const no13 = funde13(copia(R), copia(L), Te + 10).estado as any;
  const r = funde(copia(L), copia(no13), Te + 20).estado as any;
  assert.strictEqual(r.prog.SA.ex[0].s, 9);
  assert.strictEqual(r.programas.lista[r.programas.separados.de].prog.B.ex[0].s, 7);
  assert.ok(!r.prog.B, 'a letra do programa de antes não fica no ativo');
  assert.ok(r.rot.every((d: string) => !!r.prog[d]), 'a rotação só tem treinos que existem');
});

test('item 4: no mesmo programa, a revisão de um aparelho e a edição do outro convivem', () => {
  const dias = { A: tr('A', ['supino']), B: tr('B', ['leg-press']), C: tr('C', ['remada']) };
  const base = vazio({ prog: copia(dias), rot: ['A', 'B', 'C'], progTreinador: { em: T - 9e8, data: null, rot: ['A', 'B', 'C'], dias: copia(dias) } });
  garanteProgramas(base); carimba(base, T, ['prog', 'rot', 'progTreinador']); base.carimbos.programas = 1;
  const A1 = copia(base);
  A1.prog.D = tr('D', ['rosca']); A1.prog.E = tr('E', ['panturrilha']); A1.rot = ['A', 'B', 'C', 'D', 'E'];
  A1.progTreinador = { em: T + H, data: '01/12', rot: ['A', 'B', 'C', 'D', 'E'], dias: Object.assign(copia(dias), { D: tr('D', ['rosca']), E: tr('E', ['panturrilha']) }) };
  carimba(A1, T + H, ['prog', 'rot', 'progTreinador']);
  const B1 = copia(base); B1.prog.A.ex[0].s = 5; carimba(B1, T + 2 * H, ['prog']);
  const r = funde(copia(B1), copia(A1), T + 2 * H + 10).estado as any;
  assert.strictEqual(r.rot.join(','), 'A,B,C,D,E', 'a revisão fica');
  assert.strictEqual(Object.keys(r.progTreinador.dias).join(','), 'A,B,C,D,E');
  assert.strictEqual(r.prog.A.ex[0].s, 5, 'a edição fica');
  assert.ok(r.prog.D && r.prog.E, 'os treinos que a revisão somou existem');
});

test('item 5: a separação adiada pela sessão aberta não cria o programa somado, e acontece depois', () => {
  const S = fixture();
  const sep = S.progTreinador.em;
  const velha = Object.keys(S.prog).find((d: string) => !S.progLog.some((e: any) => e.day === d && Math.abs(e.t - sep) < 60000));
  S.sessao = { day: velha, inicio: sep + H, ultima: sep + H, sid: sep + H };
  assert.strictEqual(garanteProgramas(S), false);
  assert.strictEqual(programasDe(S), null, 'nada criado enquanto a sessão está aberta');
  S.sessao = null;
  assert.strictEqual(garanteProgramas(S), true);
  assert.ok(S.programas.separados, 'separou depois');
});

test('item 6: separações concorrentes convergem, e a edição mais nova sobrevive a reativar', () => {
  const sepa = (S: any) => { const c = 1 + Math.max(S.carimbos.prog, S.carimbos.rot, S.carimbos.progTreinador); garanteProgramas(S); ['prog', 'rot', 'progTreinador', 'programas'].forEach(d => { S.carimbos[d] = Math.max(S.carimbos[d] || 0, c); }); };
  const L = fixture(); sepa(L);
  const R = fixture(); const Te = fixture().progTreinador.em + 2 * H; R.prog.B.ex[0].s = 7; carimba(R, Te, ['prog']); sepa(R);
  const deL = funde(copia(L), copia(R), Te + 10).estado as any, deR = funde(copia(R), copia(L), Te + 10).estado as any;
  assert.strictEqual(deL.programas.lista[deL.programas.separados.de].prog.B.ex[0].s, 7);
  assert.strictEqual(deR.programas.lista[deR.programas.separados.de].prog.B.ex[0].s, 7);
  const L2 = copia(deL); ativaPrograma(L2, L2.programas.separados.de, Te + 3 * H); carimba(L2, Te + 3 * H, ['prog', 'rot', 'progTreinador', 'programas']);
  const R2 = funde(copia(deR), copia(L2), Te + 3 * H + 10).estado as any;
  assert.strictEqual(R2.prog.B.ex[0].s, 7);
});

test('item 7: uma letra que só o treinador tem fica na cópia do treinador do programa de antes', () => {
  const S = fixture();
  S.progTreinador = copia(S.progTreinador); S.progTreinador.dias.F = tr('F', ['so-do-treinador']);
  garanteProgramas(S);
  const velho = S.programas.lista[S.programas.separados.de];
  assert.ok(velho.progTreinador.dias.F, 'o F do treinador não some');
});

test('item 1: do lado do 13 (sem programas), a edição vai letra a letra para a cópia com o mesmo treino, não a mais recente', () => {
  const base = vazio({ done: [{ day: 'A', t: T - 9e8, sid: T - 9e8, dur: 0 }], prog: { A: tr('Peito', ['supino']), B: tr('Pernas', ['leg-press']) }, rot: ['A', 'B'], progTreinador: null });
  garanteProgramas(base); carimba(base, T, ['prog', 'rot']); base.carimbos.programas = 1;
  const idP0 = base.programas.ativo;
  const N = copia(base);
  const idP1 = criaPrograma(N, { nome: 'P1', origem: 'treinador', prog: { A: tr('Costas', ['remada']), B: tr('Braço', ['rosca']) }, rot: ['A', 'B'], progTreinador: null } as any, T + H);
  criaPrograma(N, { nome: 'P2', origem: 'treinador', prog: { C: tr('Ombro', ['desenvolvimento']) }, rot: ['C'], progTreinador: null } as any, T + 2 * H);
  carimba(N, T + 2 * H, ['prog', 'rot', 'progTreinador', 'programas']);
  const O = copia(base); delete O.programas; delete O.carimbos.programas;
  O.prog.A.ex[0].s = 5; carimba(O, T + 3 * H, ['prog']);
  const r = funde(copia(N), copia(O), T + 3 * H + 10).estado as any;
  assert.deepStrictEqual(Object.keys(r.prog), ['C']);
  assert.strictEqual(r.programas.lista[idP1].prog.A.ex[0].id, 'remada', 'o P1 (o mais recente) não recebe o treino do P0');
  assert.strictEqual(r.programas.lista[idP0].prog.A.ex[0].s, 5, 'a edição vai para o P0');
});

test('item 6: a separação se carimba pelo dado, e o empate de m se decide igual nos dois sentidos', () => {
  const S = fixture();
  const c = Math.max(S.carimbos.prog, S.carimbos.rot, S.carimbos.progTreinador, S.progTreinador.em);
  garanteProgramas(S);
  Object.values<any>(S.programas.lista).forEach(p => assert.strictEqual(p.m, c + 1));
  const a = { ativo: 'p1', lista: { p1: { id: 'p1', nome: 'Um', origem: 'eu', estado: 'ativo', criado: 1, periodos: [[1, null]], m: 5 } } } as any;
  const b = copia(a); b.lista.p1.nome = 'Outro';
  const vivo = () => ({ prog: null, rot: null, progTreinador: null, carimbo: 0 });
  assert.strictEqual(JSON.stringify(fundeProgramas(a, b, vivo)), JSON.stringify(fundeProgramas(b, a, vivo)));
});

test('a rotação de um lado misturado pelo 13 não entra com treino que não existe', () => {
  const base = vazio({ done: [{ day: 'A', t: T - 9e8, sid: T - 9e8, dur: 0 }], prog: { A: tr('A', ['supino']), B: tr('B', ['leg-press']) }, rot: ['A', 'B'], progTreinador: null });
  garanteProgramas(base); carimba(base, T, ['prog', 'rot']); base.carimbos.programas = 1;
  const nuvem = copia(base); delete nuvem.programas; delete nuvem.carimbos.programas;
  nuvem.prog.A.ex[0].s = 7; nuvem.rot = ['C']; carimba(nuvem, T + 2 * H, ['prog', 'rot']);
  const r = funde(copia(base), copia(nuvem), T + 3 * H).estado as any;
  assert.ok(r.rot.every((d: string) => !!r.prog[d]), 'rot ' + r.rot + ' prog ' + Object.keys(r.prog));
  assert.strictEqual(r.prog.A.ex[0].s, 7);
});

// ---- fuzz: três aparelhos, um no build 13 até atualizar ----
function fuzz(semente: number, rodadas: number, com13: boolean): Record<string, number> {
  let seed = semente;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = <X>(a: X[]) => a[Math.floor(rnd() * a.length)];
  const DOCS = ['prog', 'rot', 'progTreinador', 'programas'];
  const falhas: Record<string, number> = {};
  const falha = (k: string) => { falhas[k] = (falhas[k] || 0) + 1; };
  for (let it = 0; it < rodadas; it++) {
    let t = T + it * 1e9;
    const base = vazio({ done: [{ day: 'A', t: t - 9e8, sid: t - 9e8, dur: 0 }], prog: { A: tr('A', ['supino']), B: tr('B', ['leg-press']) }, rot: ['A', 'B'],
      progTreinador: { em: t - 9e8, data: null, rot: ['A', 'B'], dias: { A: tr('A', ['supino']), B: tr('B', ['leg-press']) } } });
    garanteProgramas(base);
    base.carimbos = { prog: t, rot: t, progTreinador: t, programas: 1 }; base.mtime = t; base.carimbosEm = t;
    const dev: any[] = [copia(base), copia(base), copia(base)];
    const e13 = com13 ? 2 : -1;
    if (com13) delete dev[2].programas;
    let nuvem: any = copia(base);
    const ids = new Set<string>(Object.keys(base.programas.lista));
    for (let passo = 0; passo < 14; passo++) {
      const i = Math.floor(rnd() * 3), S = dev[i];
      const antes = copia({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas });
      const op = pick(i === e13 ? ['sync', 'sync', 'edit'] : ['sync', 'sync', 'novo', 'reativa', 'edit', 'renomeia', 'proximo']);
      if (op === 'sync') {
        t += 500;
        const r = (i === e13 ? funde13 : funde)(copia(S), copia(nuvem), t).estado as any;
        if (i !== e13) garanteProgramas(r);
        dev[i] = r; nuvem = copia(r); continue;
      }
      if (op === 'edit') {
        const ls = Object.keys(S.prog || {}); if (!ls.length) continue;
        const l = pick(ls); S.prog = copia(S.prog); S.prog[l].ex[0].s = 1 + Math.floor(rnd() * 8);
      } else if (op === 'novo') {
        const letras = rnd() < 0.5 ? ['A', 'B'] : pick([['X', 'Y'], ['C'], ['A', 'C']]);
        const prog: any = {}; letras.forEach(l => { prog[l] = tr(l, ['ex-' + Math.floor(rnd() * 1e6)]); });
        ids.add(criaPrograma(S, { nome: 'N' + passo, origem: 'treinador', prog, rot: letras, progTreinador: { em: t, data: null, rot: letras, dias: copia(prog) } } as any, t + 1));
      } else if (op === 'proximo') {
        const prog: any = { Q: tr('Q', ['ex-q' + Math.floor(rnd() * 1e6)]) };
        ids.add(criaPrograma(S, { nome: 'P' + passo, origem: 'treinador', prog, rot: ['Q'], progTreinador: null, comeca: '01/12' } as any, t + 1));
      } else if (op === 'reativa') {
        const P2 = programasDe(S); if (!P2) continue;
        const g = Object.values<any>(P2.lista).filter(p => p.id !== P2.ativo && p.estado !== 'rascunho'); if (!g.length) continue;
        ativaPrograma(S, pick(g).id, t + 1);
      } else if (op === 'renomeia') {
        const P2 = programasDe(S); if (!P2) continue;
        renomeiaPrograma(S, pick(Object.keys(P2.lista)), 'R' + passo + Math.floor(rnd() * 100), t + 1);
      }
      t += 1000 + Math.floor(rnd() * 5000);
      S.carimbos = Object.assign({}, S.carimbos);
      DOCS.forEach(d => { if (JSON.stringify(S[d] ?? null) !== JSON.stringify((antes as any)[d] ?? null)) S.carimbos[d] = t; });
      S.mtime = t; S.carimbosEm = t;
    }
    // perda: um programa que não está em nenhum aparelho no build novo
    const vistos = new Set<string>();
    dev.forEach((S, k) => { if (k !== e13 && S.programas) Object.keys(S.programas.lista).forEach(id => vistos.add(id)); });
    ids.forEach(id => { if (!vistos.has(id)) falha('sumiu de todos'); });
    // o aparelho no 13 atualiza (a janela acaba), e todos sincronizam até parar de mudar
    if (com13) garanteProgramas(dev[e13]);
    for (let volta = 0; volta < 6; volta++) for (let i = 0; i < 3; i++) {
      t += 500;
      const r = funde(copia(dev[i]), copia(nuvem), t).estado as any;
      garanteProgramas(r);
      dev[i] = r; nuvem = copia(r);
    }
    const chave = (S: any) => JSON.stringify({ programas: S.programas, prog: S.prog, rot: S.rot, pt: S.progTreinador });
    if (new Set(dev.map(chave)).size > 1) falha('não converge');
    const F = dev[0];
    const lista = F.programas ? Object.keys(F.programas.lista) : [];
    ids.forEach(id => { if (lista.indexOf(id) < 0) falha('programa sumiu'); });
    if (!F.programas || !F.programas.lista[F.programas.ativo]) falha('sem ativo');
    if ((F.rot || []).some((d: string) => !(F.prog || {})[d])) falha('rotação com treino que não existe');
    const vals = Object.values<any>(F.programas ? F.programas.lista : {});
    vals.forEach(p => { if (p.id !== F.programas.ativo && p.estado === 'guardado' && !p.prog) falha('guardado sem cópia'); });
    if (vals.filter(p => p.estado === 'ativo').length !== 1) falha('mais de um ativo');
    const sig = (prog: any) => Object.keys(prog || {}).sort().map(l => l + ':' + (prog[l].ex[0] ? prog[l].ex[0].id : '')).join('|');
    if (vals.some(p => p.id !== F.programas.ativo && p.prog && p.estado === 'guardado' && sig(p.prog) === sig(F.prog) && sig(F.prog))) falha('o ativo tem os treinos de um guardado');
  }
  return falhas;
}

test('fuzz: três aparelhos no build novo não perdem nem misturam programas', () => {
  for (const s of [1, 2]) assert.deepStrictEqual(fuzz(s, 60, false), {}, 'semente ' + s);
}, 60000);

test('fuzz: com um aparelho no build 13, nada some de todos, e tudo converge quando ele atualiza', () => {
  for (const s of [1, 2]) assert.deepStrictEqual(fuzz(s, 60, true), {}, 'semente ' + s);
}, 60000);
