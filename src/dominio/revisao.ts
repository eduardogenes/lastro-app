// A REVISÃO DO TREINADOR, colada em texto — a D, `prescricao.html`, estado 6;
// decisão do dono, 14/10 ("em texto, colado no app").
//
// O treinador é um agente de IA do dono: ele escreve o programa em texto, e o
// app lê. As revisões chegam com nomes diferentes para o mesmo exercício —
// "Flexora sentada" é a Cadeira flexora sentada, "Hip thrust máquina" é a
// Elevação pélvica (F263). Se o app adivinha errado, o histórico vai para o
// exercício errado, defeito que já aconteceu (F300). Então ele pergunta, uma vez
// por nome, antes de gravar qualquer coisa, com "é outro exercício" como
// resposta igualmente fácil. Nome idêntico ao de um exercício do catálogo não
// pergunta: é o mesmo.
//
// Este arquivo é puro: lê o texto, propõe as correspondências e calcula o que
// muda. Quem grava é o casco, depois das respostas.

import { slugEx } from './programa';

/** Um exercício como a revisão o escreveu. */
export interface ExDaRevisao {
  /** o nome, como veio */
  n: string;
  s: number;
  /** faixa de repetições, como '6–10' */
  r: string;
  rir?: string;
  /** descanso em segundos */
  d?: number;
  /** grupo muscular, quando a linha diz */
  g?: string;
  /** dica de execução, quando a linha diz */
  cue?: string;
}

export interface DiaDaRevisao {
  /** a letra do treino: A, B, HX… */
  dia: string;
  nome: string;
  /** o dia é o que o box programar */
  aberto: boolean;
  ex: ExDaRevisao[];
}

export interface LeituraDaRevisao {
  dias: DiaDaRevisao[];
  /** a data que a revisão traz, 'DD/MM' ou 'DD/MM/AAAA', quando traz */
  data: string | null;
  /** linhas que o app não entendeu, com o motivo */
  problemas: { linha: string; motivo: string }[];
}

const TRACO = '–';

function limpa(x: string): string { return x.replace(/\s+/g, ' ').trim(); }

/** "6-10" e "6 a 10" viram "6–10"; "1-2" no RIR também. */
function faixa(a: string, b?: string): string { return b ? a + TRACO + b : a; }

/**
 * Lê o texto da revisão. Formato, um treino por bloco:
 *
 *   Revisão 21/09
 *   Treino A · Peito superior + dorsais
 *   - Chest press inclinado convergente · 3 x 6-10 · RIR 1-2 · 3 min · peito superior
 *   - Pulldown convergente · 3 x 6-10 · RIR 1-2 · 2:30 · dorsal
 *   Treino HX · Aula do box (aberto)
 *
 * Os campos de cada exercício são separados por "·", "|" ou ";", em qualquer
 * ordem depois do nome: séries × repetições é obrigatório; RIR, descanso
 * ("3 min", "2:30", "90 s"), grupo muscular e "dica: …" são opcionais. O que
 * não for entendido vira problema dito, e não chute.
 */
export function lerRevisao(texto: string): LeituraDaRevisao {
  const out: LeituraDaRevisao = { dias: [], data: null, problemas: [] };
  let atual: DiaDaRevisao | null = null;
  const vistos: Record<string, 1> = {};
  String(texto || '').split(/\r?\n/).forEach(function (cru) {
    const linha = limpa(cru);
    if (!linha) return;
    const data = linha.match(/^revis[aã]o\b.*?(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);
    if (data) { out.data = data[1]; return; }
    const cab = linha.match(/^treino\s+([A-Za-z0-9]{1,3})\b\s*(?:[·:|—–-]\s*)?(.*)$/i);
    if (cab) {
      const dia = cab[1].toUpperCase();
      if (vistos[dia]) { out.problemas.push({ linha: linha, motivo: 'o Treino ' + dia + ' aparece duas vezes' }); atual = null; return; }
      vistos[dia] = 1;
      const nome = limpa(cab[2].replace(/\((?:dia\s+)?aberto\)/i, ''));
      atual = { dia: dia, nome: nome, aberto: /\(\s*(?:dia\s+)?aberto\s*\)|o que o box programar/i.test(cab[2]), ex: [] };
      out.dias.push(atual);
      return;
    }
    const item = linha.match(/^(?:[-•*]|\d+[.)])\s*(.+)$/);
    if (!item) { out.problemas.push({ linha: linha, motivo: 'não é cabeçalho de treino nem exercício' }); return; }
    if (!atual) { out.problemas.push({ linha: linha, motivo: 'exercício antes de qualquer "Treino X"' }); return; }
    const campos = item[1].split(/\s*[·|;]\s*/).map(limpa).filter(Boolean);
    const ex: Partial<ExDaRevisao> = { n: campos[0] };
    const sobra: string[] = [];
    campos.slice(1).forEach(function (c) {
      let m;
      if ((m = c.match(/^(\d+)\s*[x×]\s*(\d+)(?:\s*(?:[–-]|a)\s*(\d+))?$/i))) { ex.s = +m[1]; ex.r = faixa(m[2], m[3]); return; }
      if ((m = c.match(/^(\d+)\s*s[ée]ries?\s+de\s+(\d+)(?:\s*(?:[–-]|a)\s*(\d+))?/i))) { ex.s = +m[1]; ex.r = faixa(m[2], m[3]); return; }
      if ((m = c.match(/^rir\s*(\d+)(?:\s*[–-]\s*(\d+))?$/i))) { ex.rir = faixa(m[1], m[2]); return; }
      if ((m = c.match(/^(\d+)\s*min(?:utos?)?$/i))) { ex.d = +m[1] * 60; return; }
      if ((m = c.match(/^(\d+):(\d\d)$/))) { ex.d = +m[1] * 60 + +m[2]; return; }
      if ((m = c.match(/^(\d+)\s*s(?:eg(?:undos)?)?$/i))) { ex.d = +m[1]; return; }
      if ((m = c.match(/^dica\s*:\s*(.+)$/i))) { ex.cue = m[1]; return; }
      sobra.push(c);
    });
    if (sobra.length === 1 && /^[a-zà-ú ]+$/i.test(sobra[0])) ex.g = sobra[0].toLowerCase();
    else if (sobra.length) out.problemas.push({ linha: linha, motivo: 'não entendi: ' + sobra.join(', ') });
    if (!ex.n || !ex.s || !ex.r) {
      out.problemas.push({ linha: linha, motivo: 'falta séries × repetições, como "3 x 8-12"' });
      return;
    }
    atual.ex.push(ex as ExDaRevisao);
  });
  return out;
}

// ---------- casar os nomes ----------

const VAZIAS: Record<string, 1> = { de: 1, do: 1, da: 1, dos: 1, das: 1, no: 1, na: 1, nos: 1, nas: 1, em: 1, com: 1, e: 1, ou: 1, a: 1, o: 1, ao: 1 };

/** Nomes que o treinador usa para a mesma coisa, sem palavra em comum. */
const SINONIMOS: [RegExp, string][] = [
  [/\bhip thrust\b/g, 'elevacao pelvica'],
  [/\bpuxada\b/g, 'pulldown'],
  [/\brdl\b/g, 'terra romeno']
];

function palavras(n: string): string[] {
  let t = String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
  SINONIMOS.forEach(function (s) { t = t.replace(s[0], s[1]); });
  return t.split(/\s+/).filter(function (w) { return w && !VAZIAS[w]; });
}

/** Parecença entre dois nomes, de 0 a 1: palavras em comum sobre o total. */
export function parecenca(a: string, b: string): number {
  const A = palavras(a), B = palavras(b);
  if (!A.length || !B.length) return 0;
  const sa: Record<string, 1> = {}; A.forEach(function (w) { sa[w] = 1; });
  const sb: Record<string, 1> = {}; B.forEach(function (w) { sb[w] = 1; });
  const comum = Object.keys(sa).filter(function (w) { return sb[w]; }).length;
  const todas = Object.keys(Object.assign({}, sa, sb)).length;
  const dentro = comum === Math.min(Object.keys(sa).length, Object.keys(sb).length);
  // um nome contido no outro ("Flexora sentada" em "Cadeira flexora sentada")
  // vale como parecido, mesmo que a proporção fique baixa
  return dentro ? Math.max(comum / todas, 0.6) : comum / todas;
}

export type Correspondencia =
  | { k: 'igual'; id: string }
  | { k: 'pergunta'; id: string; por: 'nome' | 'lugar' }
  | { k: 'novo' };

export interface ExDoCatalogo { n: string; g?: string; arq?: 1 }

/**
 * Para cada nome da revisão, o que o app propõe:
 *
 * - **igual**: o nome é o de um exercício do catálogo (mesmo id). Não pergunta.
 * - **pergunta**: há um candidato, por nome parecido ou por LUGAR — o
 *   exercício do mesmo treino que a revisão deixa de fora, na mesma posição ou
 *   do mesmo grupo. "Hip thrust máquina" não tem palavra em comum com
 *   "Elevação pélvica na máquina", mas ocupa o lugar dela no Treino B.
 * - **novo**: nenhum candidato. Vira exercício novo, com histórico próprio.
 *
 * Um mesmo exercício nunca é proposto para dois nomes.
 */
export function casaNomes(
  rev: LeituraDaRevisao,
  catalogo: Record<string, ExDoCatalogo>,
  atual: Record<string, { ex: { id: string }[] }>
): Record<string, Correspondencia> {
  const out: Record<string, Correspondencia> = {};
  const usados: Record<string, 1> = {};

  // 1) os iguais, primeiro e em toda a revisão: tiram os ids do jogo
  rev.dias.forEach(function (d) {
    d.ex.forEach(function (x) {
      const id = slugEx(x.n);
      if (out[x.n]) return;
      if (catalogo[id]) { out[x.n] = { k: 'igual', id: id }; usados[id] = 1; }
    });
  });

  // 2) por nome parecido, no catálogo inteiro (fora os arquivados)
  rev.dias.forEach(function (d) {
    d.ex.forEach(function (x) {
      if (out[x.n]) return;
      let melhor: string | null = null, nota = 0;
      Object.keys(catalogo).forEach(function (id) {
        if (usados[id] || catalogo[id].arq) return;
        const p = parecenca(x.n, catalogo[id].n);
        if (p > nota) { nota = p; melhor = id; }
      });
      if (melhor && nota >= 0.5) { out[x.n] = { k: 'pergunta', id: melhor, por: 'nome' }; usados[melhor] = 1; }
    });
  });

  // 3) por lugar: o que sai do mesmo treino, na mesma posição ou do mesmo grupo
  rev.dias.forEach(function (d) {
    const antes = (atual[d.dia] && atual[d.dia].ex) || [];
    d.ex.forEach(function (x, i) {
      if (out[x.n]) return;
      const livres = antes.map(function (sl, j) { return { id: sl.id, j: j }; })
        .filter(function (c) { return !usados[c.id]; });
      const mesmo = livres.filter(function (c) { return c.j === i; })[0] ||
        livres.filter(function (c) { return x.g && catalogo[c.id] && catalogo[c.id].g === x.g; })[0];
      if (mesmo) { out[x.n] = { k: 'pergunta', id: mesmo.id, por: 'lugar' }; usados[mesmo.id] = 1; }
      else out[x.n] = { k: 'novo' };
    });
  });
  return out;
}

// ---------- o que muda ----------

export interface MudancaDoDia {
  dia: string;
  /** "Agachamento no Smith, 2 séries" · "Cadeira flexora sentada: 3 → 4 séries" */
  linhas: string[];
  /** séries do dia, antes e depois */
  antes: number;
  depois: number;
  novo: boolean;
}

/**
 * O que a revisão muda em cada treino, contra o programa do treinador de agora:
 * o que entra, o que sai, e as séries que mudam. `ids` é a resposta já dada
 * para cada nome (o id final, existente ou novo).
 */
export function mudancasDaRevisao(
  rev: LeituraDaRevisao,
  ids: Record<string, string>,
  atual: Record<string, { ex: { id: string; s: number }[] }>,
  nomeDe: (id: string) => string
): MudancaDoDia[] {
  return rev.dias.map(function (d) {
    const antes = (atual[d.dia] && atual[d.dia].ex) || [];
    const porId: Record<string, number> = {};
    antes.forEach(function (sl) { porId[sl.id] = sl.s; });
    const linhas: string[] = [];
    const ficam: Record<string, 1> = {};
    d.ex.forEach(function (x) {
      const id = ids[x.n];
      ficam[id] = 1;
      if (porId[id] == null) linhas.push('entra ' + x.n + ', ' + x.s + (x.s === 1 ? ' série' : ' séries'));
      else if (porId[id] !== x.s) linhas.push(nomeDe(id) + ': ' + porId[id] + ' → ' + x.s + ' séries');
    });
    antes.forEach(function (sl) { if (!ficam[sl.id]) linhas.push('sai ' + nomeDe(sl.id)); });
    return {
      dia: d.dia, linhas: linhas, novo: !atual[d.dia],
      antes: antes.reduce(function (n, sl) { return n + sl.s; }, 0),
      depois: d.ex.reduce(function (n, x) { return n + x.s; }, 0)
    };
  });
}

/** O modelo que o app oferece para o treinador escrever a revisão. */
export const MODELO_DA_REVISAO = [
  'Revisão DD/MM',
  '',
  'Treino A · nome do treino',
  '- Nome do exercício · 3 x 6-10 · RIR 1-2 · 3 min · grupo muscular',
  '- Outro exercício · 2 x 10-15 · RIR 1 · 1:45 · grupo muscular · dica: como executar',
  '',
  'Treino B · nome do treino',
  '- …',
  '',
  'Treino HX · Aula do box (aberto)'
].join('\n');
