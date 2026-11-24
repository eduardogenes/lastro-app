// Os PROGRAMAS de treino (etapa 1 de docs/catalogo/00-desenho.md).
//
// Um programa é uma coisa própria: nome, origem, objetivo, os treinos e a
// rotação, o programa do treinador e as versões. Um é o ATIVO de cada vez; os
// outros ficam guardados (ou em "Próximo"), e nada se apaga.
//
// COMPATIBILIDADE com o build 13, que está nos aparelhos e não conhece nada
// disto. O ativo continua morando em `S.prog`, `S.rot` e `S.progTreinador`,
// exatamente como antes: o build 13 lê e edita o programa de sempre, e a fusão
// dele trata esses três documentos como sempre tratou. O que é novo vive num
// documento novo, `S.programas`, que o build 13 não conhece e carrega junto do
// estado sem mexer. Trocar de programa é trocar o conteúdo dos três documentos
// (com carimbo novo) e guardar a cópia do que saiu dentro de `S.programas`.
//
// O plano NÃO sobe (lição da etapa 0: o build 13 funde pelo estado inteiro um
// plano que não conhece, e perde o que o outro lado editou).
//
// A letra deixa de ser a chave: uma sessão pertence ao programa do campo
// `prog` dela; sem ele (sessões antigas, e as que o build 13 grava), ao
// programa que era o ativo naquele instante, e, se a letra não existe nele, ao
// programa que tem aquela letra.

import type { Dia, Estado, Sessao, Treino, EntradaProgLog } from './tipos';

export type EstadoDoPrograma = 'ativo' | 'guardado' | 'proximo' | 'rascunho';

export interface Programa {
  id: string;
  nome: string;
  origem: 'treinador' | 'eu';
  objetivo?: string | null;
  estado: EstadoDoPrograma;
  /** quando nasceu (o da migração: a primeira sessão dele) */
  criado: number;
  /** os períodos em que foi o ativo: [início, fim); fim null = ainda é o ativo */
  periodos: Array<[number, number | null]>;
  /** 'DD/MM' do texto: o dia em que um programa em "Próximo" deve começar */
  comeca?: string | null;
  /** a cópia, enquanto NÃO é o ativo (o ativo vive em S.prog, S.rot e S.progTreinador) */
  prog?: Record<Dia, Treino> | null;
  rot?: Dia[] | null;
  progTreinador?: Estado['progTreinador'];
  /** o dia (00h) em que ele respondeu "Depois" ao "começa hoje?": o Hoje não pergunta de novo nesse dia */
  adiado?: number;
  /** o texto do treinador que o criou, guardado como rede de segurança */
  texto?: string;
  /** o resumo do texto que o criou: "5 treinos, 46 exercícios" */
  resumo?: string;
  /** quando foi alterado pela última vez */
  m: number;
}

export interface Programas {
  ativo: string;
  lista: Record<string, Programa>;
  /** a migração separou o programa somado pela revisão (aviso único no Plano) */
  separados?: { t: number; de: string; para: string; visto?: 1 } | null;
}

type ComProgramas = Estado & { programas?: Programas | null };

const SEMANA = 7 * 86400000;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const copia = <T>(x: T): T => (x == null ? x : JSON.parse(JSON.stringify(x)));
const ddmm = (t: number) => { const d = new Date(t); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); };

/** O documento, quando é válido: um ativo que existe na lista. */
export function programasDe(S: Partial<ComProgramas> | null | undefined): Programas | null {
  const P = S && S.programas;
  if (!P || typeof P !== 'object' || !P.lista || typeof P.lista !== 'object') return null;
  if (!P.ativo || !P.lista[P.ativo]) return null;
  return P;
}

/** Os dias abertos (a aula do box, o HYROX): ficam fora de programa e valem com qualquer um. */
export function diasAbertos(prog: Record<Dia, Treino> | null | undefined): Dia[] {
  return Object.keys(prog || {}).filter(d => !!(prog![d] as Treino & { aberto?: unknown })?.aberto);
}

/** Os treinos do programa (sem os abertos), na ordem da rotação. */
export function treinosDe(prog: Record<Dia, Treino> | null | undefined, rot: Dia[] | null | undefined): Dia[] {
  const p = prog || {};
  const abertos = new Set(diasAbertos(p));
  const ordem = (rot && rot.length ? rot : Object.keys(p)).filter(d => p[d] && !abertos.has(d));
  Object.keys(p).forEach(d => { if (!abertos.has(d) && ordem.indexOf(d) < 0) ordem.push(d); });
  return ordem;
}

/** O conteúdo de um programa: o vivo, se é o ativo; a cópia, se não. */
export function conteudoDe(S: ComProgramas, id: string): { prog: Record<Dia, Treino>; rot: Dia[]; progTreinador: Estado['progTreinador'] } | null {
  const P = programasDe(S);
  if (!P || !P.lista[id]) return null;
  if (id === P.ativo) return { prog: S.prog || {}, rot: S.rot || Object.keys(S.prog || {}), progTreinador: S.progTreinador || null };
  const x = P.lista[id];
  return { prog: x.prog || {}, rot: x.rot || Object.keys(x.prog || {}), progTreinador: x.progTreinador || null };
}

/** O nome de um mês, para "Programa de agosto". */
export function nomeDoMes(t: number): string { return MESES[new Date(t).getMonth()]; }

/** "Programa de 23/11", quando o texto não traz título. */
export function nomeReserva(data: string | null | undefined, agora: number): string {
  const d = data ? String(data).split('/').slice(0, 2).join('/') : ddmm(agora);
  return 'Programa de ' + d;
}

/** Nome repetido ganha "(2)", "(3)"… */
export function nomeLivre(S: ComProgramas, nome: string, menos?: string): string {
  const P = programasDe(S);
  const usados = new Set(Object.values(P ? P.lista : {}).filter(x => x.id !== menos).map(x => x.nome.toLowerCase()));
  if (!usados.has(nome.toLowerCase())) return nome;
  for (let k = 2; ; k++) { const n = nome + ' (' + k + ')'; if (!usados.has(n.toLowerCase())) return n; }
}

/** O programa que tem esse nome (para avisar antes de começar outro igual). */
export function programaComNome(S: ComProgramas, nome: string): Programa | null {
  const P = programasDe(S);
  if (!P) return null;
  return Object.values(P.lista).find(x => x.nome.toLowerCase() === String(nome).trim().toLowerCase()) || null;
}

// ---------- a que programa pertence uma sessão ----------

function letrasDe(S: ComProgramas, id: string): Set<Dia> {
  const c = conteudoDe(S, id);
  return new Set(c ? Object.keys(c.prog) : []);
}

function vigenteEm(P: Programas, t: number): string[] {
  return Object.values(P.lista).filter(x => (x.periodos || []).some(([a, b]) => t >= a && (b == null || t < b))).map(x => x.id);
}

/** O programa que valia num instante (o ativo, se nenhum período o cobre). */
export function programaEm(S: ComProgramas, t: number): string | null {
  const P = programasDe(S);
  if (!P) return null;
  const ids = vigenteEm(P, t);
  return ids.indexOf(P.ativo) >= 0 ? P.ativo : (ids[0] || P.ativo);
}

/**
 * O programa de uma sessão: o campo `prog`, se ela tem; senão o que valia no
 * instante dela; e, se a letra não existe nele, o programa que tem a letra
 * (uma sessão do A registrada depois da troca, por um aparelho no build 13).
 */
export function programaDaSessao(S: ComProgramas, s: Pick<Sessao, 't' | 'day'> & { prog?: string; livre?: 0 | 1 }): string | null {
  const P = programasDe(S);
  if (!P) return null;
  if (s.prog && P.lista[s.prog]) return s.prog;
  const noTempo = programaEm(S, s.t)!;
  if (!s.day || s.livre || letrasDe(S, noTempo).has(s.day)) return noTempo;
  if (letrasDe(S, P.ativo).has(s.day)) return P.ativo;
  const outros = Object.values(P.lista).filter(x => letrasDe(S, x.id).has(s.day))
    .sort((a, b) => ultimoFim(b) - ultimoFim(a));
  return outros.length ? outros[0].id : noTempo;
}

function ultimoFim(x: Programa): number {
  const p = x.periodos || [];
  if (!p.length) return x.criado || 0;
  const u = p[p.length - 1];
  return u[1] == null ? Infinity : u[1];
}

/** As sessões do programa ATIVO, as que contam para a rotação. Sem programas, todas. */
export function sessoesDoAtivo(S: ComProgramas): Sessao[] {
  const P = programasDe(S);
  if (!P) return S.done || [];
  // só as do período ATUAL: reativar recomeça a rotação pelo primeiro treino
  const ini = inicioDoAtivo(S);
  return (S.done || []).filter(x => x && x.t >= ini && programaDaSessao(S, x) === P.ativo);
}

/** Quando o período atual do ativo começou (−∞ sem programas). */
export function inicioDoAtivo(S: ComProgramas): number {
  const P = programasDe(S);
  if (!P) return -Infinity;
  const per = P.lista[P.ativo].periodos || [];
  return per.length ? per[per.length - 1][0] : -Infinity;
}

/**
 * Um estado com o programa `id` no lugar do ativo, e só as sessões dele: o
 * que `proximoTreino` precisa para dizer qual era o seguinte naquele programa.
 */
export function estadoDoPrograma(S: ComProgramas, id: string): ComProgramas {
  const c = conteudoDe(S, id);
  if (!c) return S;
  return Object.assign({}, S, {
    prog: c.prog, rot: c.rot, progTreinador: c.progTreinador, programas: null,
    done: (S.done || []).filter(x => x && programaDaSessao(S, x) === id)
  });
}

// ---------- trocar de programa ----------

/** O ativo vira guardado: a cópia do que estava em S.prog, S.rot e S.progTreinador. */
function guardaAtivo(S: ComProgramas, agora: number): void {
  const P = S.programas!;
  const x = P.lista[P.ativo];
  const per = (x.periodos || []).slice();
  if (per.length && per[per.length - 1][1] == null) per[per.length - 1] = [per[per.length - 1][0], agora];
  P.lista[P.ativo] = Object.assign({}, x, {
    estado: 'guardado' as const, periodos: per, m: agora,
    prog: copia(S.prog), rot: copia(S.rot), progTreinador: copia(S.progTreinador || null)
  });
}

/**
 * Põe `x` no lugar do ativo. Os dias abertos do programa que sai (o HYROX)
 * vêm junto: ficam fora de programa e valem com qualquer um.
 */
function pocomoAtivo(S: ComProgramas, x: Programa, agora: number): void {
  const prog: Record<Dia, Treino> = copia(x.prog || {}) || {};
  const rot: Dia[] = (copia(x.rot) || Object.keys(prog)).filter((d: Dia) => prog[d]);
  const pt = copia(x.progTreinador || null);
  const abertosAntes = diasAbertos(S.prog);
  abertosAntes.forEach(d => {
    prog[d] = copia(S.prog![d]);
    if (rot.indexOf(d) < 0 && (S.rot || []).indexOf(d) >= 0) rot.push(d);
    if (pt && S.progTreinador && S.progTreinador.dias && S.progTreinador.dias[d]) {
      pt.dias = Object.assign({}, pt.dias, { [d]: copia(S.progTreinador.dias[d]) });
      if (pt.rot && pt.rot.indexOf(d) < 0) pt.rot = pt.rot.concat([d]);
    }
  });
  S.prog = prog;
  S.rot = rot;
  S.progTreinador = pt;
  const ativo: Programa = Object.assign({}, x, {
    estado: 'ativo' as const, periodos: (x.periodos || []).concat([[agora, null] as [number, null]]), m: agora
  });
  delete ativo.prog; delete ativo.rot; delete ativo.progTreinador; delete ativo.comeca;
  S.programas!.lista[x.id] = ativo;
  S.programas!.ativo = x.id;
}

/** Reativa um programa guardado (ou começa um que estava em "Próximo"). */
export function ativaPrograma(S: ComProgramas, id: string, agora: number): boolean {
  const P = programasDe(S);
  if (!P || !P.lista[id] || id === P.ativo) return false;
  S.programas = copia(P);
  const alvo = S.programas!.lista[id];
  guardaAtivo(S, agora);
  pocomoAtivo(S, alvo, agora);
  return true;
}

export interface ProgramaNovo {
  nome: string;
  origem: 'treinador' | 'eu';
  objetivo?: string | null;
  prog: Record<Dia, Treino>;
  rot: Dia[];
  progTreinador: Estado['progTreinador'];
  resumo?: string;
  /** o texto colado, guardado junto do programa */
  texto?: string;
  /** 'DD/MM': fica em "Próximo" até esse dia */
  comeca?: string | null;
}

/** Cria um programa: o ativo agora, ou em "Próximo" (`comeca`). Devolve o id. */
export function criaPrograma(S: ComProgramas, dados: ProgramaNovo, agora: number): string {
  garanteProgramas(S);
  S.programas = copia(S.programas!);
  let id = 'p' + agora;
  while (S.programas!.lista[id]) id += 'x';
  const x: Programa = {
    id, nome: nomeLivre(S, dados.nome), origem: dados.origem, objetivo: dados.objetivo || null,
    estado: dados.comeca ? 'proximo' : 'guardado', criado: agora, periodos: [],
    prog: copia(dados.prog), rot: copia(dados.rot), progTreinador: copia(dados.progTreinador),
    resumo: dados.resumo, m: agora
  };
  if (dados.texto) x.texto = dados.texto;
  if (dados.comeca) { x.comeca = dados.comeca; S.programas!.lista[id] = x; return id; }
  guardaAtivo(S, agora);
  pocomoAtivo(S, x, agora);
  return id;
}

/** Duplica um programa como rascunho, em "Próximo". */
export function duplicaPrograma(S: ComProgramas, id: string, agora: number): string | null {
  const c = conteudoDe(S, id);
  const P = programasDe(S);
  if (!c || !P) return null;
  S.programas = copia(P);
  const nid = 'p' + agora;
  S.programas!.lista[nid] = {
    id: nid, nome: nomeLivre(S, 'Cópia de ' + P.lista[id].nome), origem: 'eu', objetivo: P.lista[id].objetivo || null,
    estado: 'rascunho', criado: agora, periodos: [],
    prog: copia(c.prog), rot: copia(c.rot), progTreinador: copia(c.progTreinador), m: agora
  };
  return nid;
}

export function renomeiaPrograma(S: ComProgramas, id: string, nome: string, agora: number): boolean {
  const P = programasDe(S);
  const n = String(nome || '').replace(/\s+/g, ' ').trim();
  if (!P || !P.lista[id] || n.length < 2) return false;
  S.programas = copia(P);
  S.programas!.lista[id] = Object.assign({}, S.programas!.lista[id], { nome: nomeLivre(S, n, id), m: agora });
  return true;
}

// ---------- a migração ----------

function escolhe<T>(m: Record<Dia, T> | null | undefined, dias: Dia[]): Record<Dia, T> {
  const out: Record<Dia, T> = {};
  dias.forEach(d => { if (m && m[d]) out[d] = copia(m[d]); });
  return out;
}

/**
 * A revisão que SOMOU um programa inteiro ao de antes (o caso da v2.2): ela
 * criou dois treinos ou mais, não tocou em nenhum dos que já existiam, e
 * sobram dois ou mais desses. Os treinos que ela criou são os do programa
 * novo; os outros, os do antigo.
 */
/**
 * A separação só vale para revisões coladas ANTES da etapa 1: depois dela, o
 * app pergunta "programa novo ou revisão?", e uma revisão que soma treinos é
 * escolha da pessoa (C2 da revisão de dado). 28/11/2026, 00h, hora de Brasília.
 */
export const SEPARA_ATE = Date.UTC(2026, 10, 28, 3);

/** A separação sem olhar a sessão aberta (ver `separacaoPendente`). */
function separacaoBruta(S: Estado): { velhos: Dia[]; novos: Dia[]; t: number; data: string | null } | null {
  const pt = S.progTreinador;
  if (!pt || !pt.em || !S.prog) return null;
  const t = pt.em;
  if (t >= SEPARA_ATE) return null;
  const novos = new Set<Dia>(), tocados = new Set<Dia>();
  (S.progLog || []).forEach((e: EntradaProgLog) => {
    if (!e || Math.abs(e.t - t) > 60000 || !/^revis[aã]o do treinador/.test(e.txt || '')) return;
    tocados.add(e.day);
    const m = (e.txt || '').match(/Treino (\S+) entra na rota[cç][aã]o/);
    if (m && m[1] === e.day) novos.add(e.day);
  });
  const abertos = new Set(diasAbertos(S.prog));
  // as letras de `prog` que não estão na rotação também são do programa de antes (P5)
  const ordem = ordemDeTudo(S);
  const velhos = ordem.filter(d => S.prog![d] && !abertos.has(d) && !novos.has(d));
  const todosNovos = Array.from(novos).every(d => S.prog![d] && !abertos.has(d));
  if (novos.size < 2 || velhos.length < 2 || !todosNovos) return null;
  if (velhos.some(d => tocados.has(d))) return null;
  return { velhos, novos: ordem.filter(d => novos.has(d)), t, data: pt.data || null };
}

/** Com um treino de antes aberto agora, separar trocaria o treino debaixo da
 *  sessão (as trocas do dia e as séries iriam para o exercício errado): espera (C1). */
function sessaoNosVelhos(S: Estado, velhos: Dia[]): boolean {
  return !!(S.sessao && S.sessao.day && velhos.indexOf(S.sessao.day) >= 0);
}

export function separacaoPendente(S: Estado): { velhos: Dia[]; novos: Dia[]; t: number; data: string | null } | null {
  const sep = separacaoBruta(S);
  return sep && !sessaoNosVelhos(S, sep.velhos) ? sep : null;
}

/** A rotação e, depois dela, as letras de `prog` que não estão nela. */
function ordemDeTudo(S: Estado): Dia[] {
  const rot = (S.rot && S.rot.length ? S.rot : []).filter(d => S.prog && S.prog[d]);
  Object.keys(S.prog || {}).forEach(d => { if (rot.indexOf(d) < 0) rot.push(d); });
  return rot;
}

/** O primeiro instante de treino (para "Programa de agosto"). */
function primeiraSessao(S: Estado, ate?: number): number | null {
  const ts = (S.done || []).filter(x => x && !x.livre && x.day && (ate == null || x.t < ate)).map(x => x.t);
  return ts.length ? Math.min.apply(null, ts) : null;
}

/**
 * Cria `S.programas` a partir do programa de sempre. Idempotente: com o
 * documento válido, não faz nada. DETERMINÍSTICA (ids e instantes saem do
 * dado, nunca do relógio): dois aparelhos que migram o mesmo estado chegam ao
 * mesmo documento, e a fusão não tem o que escolher.
 *
 * Separa o caso da revisão que somou um programa inteiro ao de antes: os
 * treinos de antes vão para um programa guardado, e os que a revisão criou
 * formam o ativo (com os dias abertos, que valem com qualquer um).
 *
 * Devolve true quando criou (o chamador carimba os documentos que mudaram).
 */
export function garanteProgramas(S: ComProgramas): boolean {
  if (programasDe(S)) return false;
  if (!S.prog || !Object.keys(S.prog).length) return false;
  const origem: Programa['origem'] = S.progTreinador || !(S as Estado & { primeiraVez?: number }).primeiraVez ? 'treinador' : 'eu';
  const bruta = separacaoBruta(S);
  // separação adiada pela sessão aberta: não cria nada agora, senão o programa
  // somado nasceria como um só e a separação nunca mais aconteceria (item 5)
  if (bruta && sessaoNosVelhos(S, bruta.velhos)) return false;
  const sep = bruta;
  if (!sep) {
    const ini = primeiraSessao(S) ?? (S.progTreinador && S.progTreinador.em) ?? 0;
    const id = 'p' + ini;
    S.programas = {
      ativo: id,
      lista: { [id]: { id, nome: ini ? 'Programa de ' + nomeDoMes(ini) : 'Programa', origem, estado: 'ativo', criado: ini, periodos: [[0, null]], m: ini } },
      separados: null
    };
    return true;
  }
  const abertos = diasAbertos(S.prog);
  const rot = S.rot && S.rot.length ? S.rot : Object.keys(S.prog);
  // a cópia de antes guarda TODAS as letras dele (P5); a rotação, só as que estavam nela
  const rotVelho = rot.filter(d => sep.velhos.indexOf(d) >= 0 || abertos.indexOf(d) >= 0);
  const letrasVelho = ordemDeTudo(S).filter(d => sep.velhos.indexOf(d) >= 0 || abertos.indexOf(d) >= 0);
  const rotNovo = sep.novos.filter(d => rot.indexOf(d) >= 0).concat(rot.filter(d => abertos.indexOf(d) >= 0));
  const letrasNovo = sep.novos.concat(abertos);
  const pt = S.progTreinador!;
  const ptRot = pt.rot && pt.rot.length ? pt.rot : rot;
  // as letras que só o treinador tem (a pessoa deixou de fora) também são de antes (item 7)
  const letrasVelhoT = letrasVelho.concat(Object.keys(pt.dias || {}).filter(d => !(S.prog && S.prog[d]) && sep.novos.indexOf(d) < 0 && letrasVelho.indexOf(d) < 0));
  // o carimbo da separação sai do dado: dois aparelhos que separam entradas
  // diferentes não empatam (a edição mais nova vence) (item 6)
  const car = S.carimbos || {};
  const mSep = 1 + Math.max(sep.t, car.prog || 0, car.rot || 0, car.progTreinador || 0);
  const iniVelho = primeiraSessao(S, sep.t);
  const idVelho = 'p' + (iniVelho ?? 0), idNovo = 'p' + sep.t;
  const velho: Programa = {
    id: idVelho, nome: iniVelho != null ? 'Programa de ' + nomeDoMes(iniVelho) : 'Programa até ' + (sep.data || ddmm(sep.t)),
    origem: 'treinador', estado: 'guardado', criado: iniVelho ?? 0, periodos: [[0, sep.t]],
    prog: escolhe(S.prog, letrasVelho), rot: rotVelho,
    progTreinador: { em: sep.t, data: null, rot: ptRot.filter(d => letrasVelhoT.indexOf(d) >= 0), dias: escolhe(pt.dias, letrasVelhoT) },
    m: mSep
  };
  const novo: Programa = {
    id: idNovo, nome: nomeReserva(sep.data, sep.t), origem: 'treinador', estado: 'ativo', criado: sep.t,
    periodos: [[sep.t, null]], resumo: sep.novos.length + ' treinos', m: mSep
  };
  S.prog = escolhe(S.prog, letrasNovo);
  S.rot = rotNovo;
  S.progTreinador = { em: pt.em, data: pt.data, rot: ptRot.filter(d => letrasNovo.indexOf(d) >= 0 && !!(pt.dias || {})[d]), dias: escolhe(pt.dias, letrasNovo) };
  S.programas = { ativo: idNovo, lista: { [idVelho]: velho, [idNovo]: novo }, separados: { t: sep.t, de: idVelho, para: idNovo } };
  return true;
}

// ---------- o que as telas leem ----------

/** A semana do programa ativo (1 na primeira) e quantos treinos dele já saíram nela. */
export function semanaDoAtivo(S: ComProgramas, agora: number): { semana: number; inicioDaSemana: number; feitos: Dia[] } | null {
  const P = programasDe(S);
  if (!P) return null;
  const ini = inicioDoAtivo(S);
  if (!isFinite(ini) || ini <= 0) return null;
  const semana = Math.max(1, Math.floor((agora - ini) / SEMANA) + 1);
  const inicioDaSemana = ini + (semana - 1) * SEMANA;
  const feitos = new Set<Dia>();
  sessoesDoAtivo(S).forEach(x => { if (!x.livre && x.day && x.t >= inicioDaSemana) feitos.add(x.day); });
  return { semana, inicioDaSemana, feitos: Array.from(feitos) };
}

/** O período inteiro de um programa: do primeiro início ao último fim (ou agora). */
export function periodoDe(S: ComProgramas, id: string, agora: number): { de: number; ate: number } | null {
  const P = programasDe(S);
  const x = P && P.lista[id];
  if (!x) return null;
  const sess = (S.done || []).filter(s => s && !s.livre && programaDaSessao(S, s) === id).map(s => s.t);
  const per = x.periodos || [];
  let de = per.length ? per[0][0] : x.criado;
  if (!de && sess.length) de = Math.min.apply(null, sess);
  const fim = per.length ? per[per.length - 1][1] : null;
  return { de: de || x.criado || 0, ate: fim == null ? agora : fim };
}

export interface Balanco {
  feitos: number;
  semanas: number;
  porSemana: number[];
  previstos: number;
  pct: number | null;
  progressoes: Array<{ id: string; de: number; para: number; delta: number; semanas: number; desde?: number }>;
  parados: Array<{ id: string; carga: number; desde: number; semanas: number }>;
  seguiram: string[];
  total: number;
}

/**
 * O balanço de um programa: treinos feitos, semana a semana, a aderência (os
 * feitos sobre os previstos pelos dias de treino; o aberto conta como feito e
 * não como previsto), o que mais progrediu e o que ficou parado, e quais
 * exercícios seguiram para o programa ativo.
 */
export function balancoDoPrograma(S: ComProgramas, id: string, agora: number, diasDeTreinoPorSemana: number): Balanco | null {
  const P = programasDe(S);
  const c = conteudoDe(S, id);
  const per = periodoDe(S, id, agora);
  if (!P || !c || !per) return null;
  const sess = (S.done || []).filter(s => s && !s.livre && s.day && programaDaSessao(S, s) === id);
  const semanas = Math.max(1, Math.ceil((per.ate - per.de) / SEMANA));
  const porSemana = Array.from({ length: Math.min(semanas, 52) }, () => 0);
  const base = semanas > 52 ? per.ate - 52 * SEMANA : per.de;
  sess.forEach(s => { const k = Math.floor((s.t - base) / SEMANA); if (k >= 0 && k < porSemana.length) porSemana[k]++; });
  const previstos = semanas * Math.max(0, diasDeTreinoPorSemana);
  // cada semana conta até os previstos: a semana de seis não cobre a de dois
  const cumpridos = semanas > 52 ? Math.min(sess.length, previstos)
    : porSemana.reduce((n, v) => n + Math.min(v, diasDeTreinoPorSemana), 0);
  const pct = previstos ? Math.min(100, Math.round(cumpridos / previstos * 100)) : null;
  const ids = new Set<string>();
  treinosDe(c.prog, c.rot).forEach(d => ((c.prog[d] && c.prog[d].ex) || []).forEach(sl => ids.add(sl.id)));
  const progressoes: Balanco['progressoes'] = [], parados: Balanco['parados'] = [];
  ids.forEach(ex => {
    const no = ((S.logs || {})[ex] || []).filter(l => l && l.t >= per.de && l.t <= per.ate && !l.sl)
      .map(l => ({ t: l.t, c: Math.max(0, ...((l.sets || []).filter(Boolean) as Array<[number, number]>).map(p => +p[0] || 0)) }))
      .filter(x => x.c > 0).sort((a, b) => a.t - b.t);
    if (no.length < 2) return;
    const a = no[0], b = no[no.length - 1];
    const sem = Math.max(1, Math.round((b.t - a.t) / SEMANA));
    if (b.c > a.c) progressoes.push({ id: ex, de: a.c, para: b.c, delta: +(b.c - a.c).toFixed(2), semanas: sem });
    else if (b.c === a.c && b.t - a.t >= 4 * SEMANA) {
      let desde = b.t;
      for (let i = no.length - 1; i >= 0 && no[i].c === b.c; i--) desde = no[i].t;
      parados.push({ id: ex, carga: b.c, desde, semanas: Math.max(1, Math.round((b.t - desde) / SEMANA)) });
    }
  });
  progressoes.sort((x, y) => y.delta - x.delta);
  parados.sort((x, y) => y.semanas - x.semanas);
  const ativos = new Set<string>();
  if (id !== P.ativo) treinosDe(S.prog, S.rot).forEach(d => ((S.prog![d] && S.prog![d].ex) || []).forEach(sl => ativos.add(sl.id)));
  return { feitos: sess.length, semanas, porSemana, previstos, pct, progressoes, parados,
           seguiram: Array.from(ids).filter(x => ativos.has(x)), total: ids.size };
}

export interface Revisao {
  t: number;
  quem: 'treinador' | 'voce';
  titulo: string;
  detalhe: string;
  itens: EntradaProgLog[];
  textoRevisao?: string;
}

/**
 * As revisões de um programa, a mais nova primeiro: o registro do programa
 * (`progLog`) no período dele. As entradas de uma mesma revisão do treinador
 * (uma por treino) viram uma linha só.
 */
export function revisoesDoPrograma(S: ComProgramas, id: string): Revisao[] {
  const P = programasDe(S);
  if (!P || !P.lista[id]) return [];
  const per = P.lista[id].periodos || [];
  const dele = (e: EntradaProgLog & { p?: string }) => e.p ? e.p === id
    : per.some(([a, b]) => e.t >= a && (b == null || e.t < b));
  const out: Revisao[] = [];
  (S.progLog || []).filter(e => e && dele(e)).sort((a, b) => a.t - b.t).forEach(e => {
    const doTreinador = /^revis[aã]o do treinador|^programa novo/i.test(e.txt || '');
    const ultimo = out[out.length - 1];
    if (doTreinador && ultimo && ultimo.quem === 'treinador' && e.t - ultimo.t < 60000 && /^revis/i.test(e.txt || '') && /^revis/i.test(ultimo.itens[0].txt || '')) {
      ultimo.itens.push(e);
      if (e.textoRevisao && !ultimo.textoRevisao) ultimo.textoRevisao = e.textoRevisao;
      return;
    }
    out.push({ t: e.t, quem: doTreinador ? 'treinador' : 'voce', titulo: e.txt, detalhe: e.day && e.day !== '-' ? 'no ' + e.day : '', itens: [e], textoRevisao: e.textoRevisao });
  });
  out.forEach(r => {
    if (r.quem !== 'treinador' || !/^revis/i.test(r.itens[0].txt || '')) return;
    const m = (r.itens[0].txt || '').match(/^revis[aã]o do treinador( de [\d/]+)?/i);
    r.titulo = 'Revisão' + (m && m[1] ? m[1] : '') + ': ' + r.itens.length + (r.itens.length === 1 ? ' treino' : ' treinos');
    r.detalhe = r.itens.map(x => x.day).join(', ');
  });
  return out.reverse();
}

// ---------- a fusão (P1–P4 da revisão de dado) ----------

function inicioMaisRecente(x: Programa): number {
  return (x.periodos || []).reduce((m, p) => Math.max(m, p[0]), -Infinity);
}

/** Os períodos dos dois lados, unidos pelo início; o fim conhecido vence o aberto. */
function unePeriodos(a: Programa['periodos'], b: Programa['periodos']): Programa['periodos'] {
  const por = new Map<number, number | null>();
  (a || []).concat(b || []).forEach(([ini, fim]) => {
    if (!por.has(ini)) { por.set(ini, fim); return; }
    const f = por.get(ini)!;
    por.set(ini, f == null ? fim : fim == null ? f : Math.max(f, fim));
  });
  return Array.from(por.entries()).sort((x, y) => x[0] - y[0]).map(([ini, fim]) => [ini, fim] as [number, number | null]);
}

// A IDENTIDADE de um programa vivo (o `S.prog` de um lado) é pelos
// exercícios, nunca pelo conjunto de letras: dois programas têm as mesmas
// letras o tempo todo (o "Duplicar", e todo treinador escreve A, B, C).

/** Dois treinos da mesma letra são o mesmo treino quando têm algum exercício em comum. */
export function mesmaLetra(a: Treino | null | undefined, b: Treino | null | undefined): boolean {
  const ia = ((a && a.ex) || []).map(x => x && x.id), ib = new Set(((b && b.ex) || []).map(x => x && x.id));
  if (!ia.length && !ib.size) return true;
  return ia.some(id => ib.has(id));
}

/** Dois `prog` são o mesmo programa quando, nas letras em comum, a maioria é o mesmo treino. */
export function mesmoPrograma(a: Record<Dia, Treino> | null | undefined, b: Record<Dia, Treino> | null | undefined): boolean {
  if (!a || !b) return false;
  const aa = diasAbertos(a), ab = diasAbertos(b);
  const comuns = Object.keys(a).filter(d => b[d] && aa.indexOf(d) < 0 && ab.indexOf(d) < 0);
  if (!comuns.length) return false;
  return comuns.filter(d => mesmaLetra(a[d], b[d])).length * 2 >= comuns.length;
}

/** O programa guardado a que um `prog` vivo pertence (pelos exercícios), ou null. */
export function guardadoQueCasa(P: Programas, prog: Record<Dia, Treino> | null | undefined): Programa | null {
  const xs = Object.values(P.lista).filter(x => x.id !== P.ativo && x.estado === 'guardado' && x.prog && mesmoPrograma(prog, x.prog));
  return xs.sort(porMaisRecente)[0] || null;
}

/** O guardado que tem a letra `d` com o mesmo treino (o mais recente, se houver mais de um). */
function copiaDaLetra(P: Programas, d: Dia, t: Treino): Programa | null {
  const xs = Object.values(P.lista).filter(x => x.id !== P.ativo && x.estado === 'guardado' && x.prog && x.prog[d] && mesmaLetra(x.prog[d], t));
  return xs.sort(porMaisRecente)[0] || null;
}

function porMaisRecente(p: Programa, q: Programa): number {
  return (ultimoFim(q) - ultimoFim(p)) || (p.id < q.id ? -1 : 1);
}

/**
 * Funde `programas` POR PROGRAMA, e nunca o documento inteiro de um lado só.
 *
 * - A lista é a união pelos ids. Num id dos dois lados, os campos simples
 *   (nome, objetivo, "começa", "Depois", estado de rascunho) vêm do lado de
 *   `m` maior; os períodos se unem; a CÓPIA nunca se perde: uma entrada com
 *   cópia não é trocada por outra sem.
 * - O ativo é o programa cujo período começou por último. Renomear, adiar,
 *   "Entendi" e duplicar não decidem o ativo.
 * - O ativo de um lado que perdeu vira guardado; se ele não tinha cópia (era o
 *   ativo daquele lado), a cópia sai do programa vivo daquele lado
 *   (`vivo`), e o período dele se fecha onde o outro começou.
 *
 * `vivo(lado)` devolve o programa vivo do lado (prog, rot, progTreinador) e o
 * carimbo de `prog` daquele lado: uma edição feita lá depois da cópia que o
 * outro lado guardou substitui a cópia (o aparelho que editou sem ver a troca).
 */
export function fundeProgramas(
  L: Programas | null | undefined, R: Programas | null | undefined,
  vivo: (lado: 'L' | 'R') => { prog: Record<Dia, Treino> | null; rot: Dia[] | null; progTreinador: Estado['progTreinador']; carimbo: number }
): Programas | null {
  const PL = L && L.lista && L.ativo && L.lista[L.ativo] ? L : null;
  const PR = R && R.lista && R.ativo && R.lista[R.ativo] ? R : null;
  if (!PL && !PR) return null;
  if (!PL || !PR) return copia((PL || PR)!);
  const lista: Record<string, Programa> = {};
  const ids = Array.from(new Set(Object.keys(PL.lista).concat(Object.keys(PR.lista)))).sort();
  ids.forEach(id => {
    const a = PL.lista[id], b = PR.lista[id];
    if (!a || !b) { lista[id] = copia((a || b)!); return; }
    // empate de `m`: o conteúdo decide, igual nos dois sentidos da fusão (item 6)
    const novo = (b.m || 0) > (a.m || 0) ? b : (b.m || 0) < (a.m || 0) ? a : (JSON.stringify(b) > JSON.stringify(a) ? b : a), velho = novo === a ? b : a;
    const x: Programa = copia(novo);
    x.periodos = unePeriodos(a.periodos, b.periodos);
    if (!x.prog && velho.prog) { x.prog = copia(velho.prog); x.rot = copia(velho.rot); x.progTreinador = copia(velho.progTreinador || null); }
    lista[id] = x;
  });
  // o ativo: o período que começou por último (empate: o id, para os dois lados concordarem)
  const ativo = ids.slice().sort((p, q) => (inicioMaisRecente(lista[q]) - inicioMaisRecente(lista[p])) || (p < q ? -1 : 1))[0];
  const inicioDoAtivo = inicioMaisRecente(lista[ativo]);
  // o ativo de um lado que perdeu: guarda a cópia do vivo daquele lado, se ela é mais nova
  ([['L', PL], ['R', PR]] as Array<['L' | 'R', Programas]>).forEach(([lado, P]) => {
    if (P.ativo === ativo || !lista[P.ativo]) return;
    const v = vivo(lado);
    const x = lista[P.ativo];
    if (!x.prog || (v.carimbo > (x.m || 0) && mesmoPrograma(v.prog, x.prog))) {
      x.prog = copia(v.prog); x.rot = copia(v.rot); x.progTreinador = copia(v.progTreinador || null);
      x.m = Math.max(x.m || 0, v.carimbo || 0);
    }
  });
  ids.forEach(id => {
    const x = lista[id];
    if (id === ativo) {
      x.estado = 'ativo';
      const per = x.periodos;
      if (per.length) per[per.length - 1] = [per[per.length - 1][0], null];
      delete x.prog; delete x.rot; delete x.progTreinador;
      return;
    }
    // um período ainda aberto de quem não é o ativo fecha onde o ativo começou
    x.periodos = (x.periodos || []).map(([ini, fim]) => [ini, fim == null ? Math.max(ini, inicioDoAtivo) : fim] as [number, number | null]);
    if (x.estado === 'ativo' || (x.periodos.length && x.estado !== 'guardado')) x.estado = 'guardado';
  });
  const sl = PL.separados, sr = PR.separados;
  const separados = sl || sr ? Object.assign({}, sl || sr, (sl && sl.visto) || (sr && sr.visto) ? { visto: 1 as const } : {}) : null;
  return { ativo, lista, separados };
}

/**
 * O programa vivo de um lado que perdeu a fusão vai para a cópia do programa a
 * que ele pertence, quando foi editado depois dela (o aparelho que editou sem
 * ver a troca). NUNCA pelo conjunto de letras (item 1 da conferência):
 * - o lado tem `programas` e o ativo dele não é o ativo da fusão: é a cópia
 *   desse id, e só dela;
 * - o lado não tem `programas` (build 13), ou diz ser o ativo mas perdeu (foi
 *   misturado pelo 13): letra a letra, pela cópia guardada que tem a mesma
 *   letra com o mesmo treino. Próximo e rascunho nunca recebem.
 */
export function guardaVivoNaCopia(P: Programas, v: { prog: Record<Dia, Treino> | null; rot: Dia[] | null; progTreinador: Estado['progTreinador']; carimbo: number }, dele: Programas | null | undefined): void {
  if (!v.prog) return;
  const dono = dele && dele.lista && dele.ativo && dele.lista[dele.ativo] ? dele.ativo : null;
  if (dono && dono !== P.ativo) {
    const x = P.lista[dono];
    if (!x || x.estado !== 'guardado') return;
    if (!x.prog || (v.carimbo > (x.m || 0) && mesmoPrograma(v.prog, x.prog))) {
      x.prog = copia(v.prog); x.rot = copia(v.rot) || x.rot;
      if (v.progTreinador && v.progTreinador.dias) x.progTreinador = copia(v.progTreinador);
      x.m = Math.max(x.m || 0, v.carimbo);
    }
    return;
  }
  levaLetrasParaCopias(P, v.prog, v.carimbo, Object.keys(v.prog));
}

/**
 * Leva as letras `ds` de um `prog` para as cópias guardadas que têm a mesma
 * letra com o mesmo treino, quando a edição é mais nova que a cópia. Devolve
 * as letras que pertencem a alguma cópia (levadas ou não).
 */
export function levaLetrasParaCopias(P: Programas, prog: Record<Dia, Treino>, carimbo: number, ds: Dia[]): Dia[] {
  const abertos = diasAbertos(prog);
  const mudar = new Map<string, Dia[]>(), deCopia: Dia[] = [];
  ds.forEach(d => {
    if (!prog[d] || abertos.indexOf(d) >= 0) return;
    const x = copiaDaLetra(P, d, prog[d]);
    if (!x) return;
    deCopia.push(d);
    if (carimbo > (x.m || 0) && JSON.stringify(x.prog![d]) !== JSON.stringify(prog[d])) mudar.set(x.id, (mudar.get(x.id) || []).concat([d]));
  });
  mudar.forEach((letras, id) => {
    const x = P.lista[id];
    x.prog = Object.assign({}, x.prog);
    letras.forEach(d => { x.prog![d] = copia(prog[d]); });
    x.m = Math.max(x.m || 0, carimbo);
  });
  return deCopia;
}
