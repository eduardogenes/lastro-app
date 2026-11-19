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
import { fmtDesc } from './formato';

/** Duração da prescrição na lista e no histórico da revisão. */
function descansoEscrito(segundos: number): string {
  const min = Math.floor(segundos / 60), s = segundos % 60;
  if (!min) return s + ' s';
  return min + ' min' + (s ? ' ' + s + ' s' : '');
}

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
  const nomePorSlug = new Map<string, string>();
  // o mesmo exercício duas vezes no mesmo treino: o programa é por exercício, e
  // as duas linhas virariam uma só sem ninguém dizer; o app guarda a primeira e diz
  const exDoDia: Record<string, Record<string, 1>> = {};
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
    else if (sobra.length) out.problemas.push({ linha: linha, motivo: 'trecho não reconhecido: ' + sobra.join(', ') });
    if (!ex.n || !ex.s || !ex.r) {
      out.problemas.push({ linha: linha, motivo: 'falta séries × repetições, como "3 x 8-12"' });
      return;
    }
    const noDia = exDoDia[atual.dia] || (exDoDia[atual.dia] = {});
    const chave = slugEx(ex.n);
    if (noDia[chave]) {
      out.problemas.push({ linha: linha, motivo: ex.n + ' aparece duas vezes no Treino ' + atual.dia + '; o app guarda só a primeira' });
      return;
    }
    noDia[chave] = 1;
    // Uma grafia por revisão mantém a pergunta e o id iguais em todos os treinos.
    if (!nomePorSlug.has(chave)) nomePorSlug.set(chave, ex.n);
    ex.n = nomePorSlug.get(chave)!;
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

// ---------- mudança por mudança (peça 6, 18/11/2026) ----------
//
// Decisão do dono (17/11/2026): a revisão entra mudança por mudança, com a
// chave em cada uma. O programa do TREINADOR passa a ser a revisão inteira; o
// programa DELE recebe só as mudanças marcadas, e o que ficar de fora continua
// aparecendo como diferença dele em relação ao do treinador (a `difDoDia` de
// sempre, que compara os dois). O que ele mudou e a revisão não toca fica como
// está: antes, aplicar um treino apagava as mudanças dele naquele treino.
//
// Uma mudança é uma afirmação do treinador sobre UM exercício (entra, sai, ou
// muda séries, repetições, RIR, descanso), sobre a ordem dos que ficam, ou
// sobre um treino novo. Aplicar uma é aplicar o DELTA dela: "Flexora: 4 → 3
// séries" muda as séries do slot dele e deixa as repetições que ele escolheu.

/** Um slot do programa, como esta parte lê e escreve (os outros campos passam intactos). */
export interface SlotDoPrograma { id: string; s: number; r: string; d?: number; rir?: string; desde?: number; [k: string]: unknown }
/** Um treino do programa. */
export interface TreinoDoPrograma { name?: string; tag?: string; aberto?: 1; ex: SlotDoPrograma[] }

export type TipoDaMudanca = 'entra' | 'sai' | 'muda' | 'ordem' | 'dia' | 'nome' | 'aberto';
/** O que uma mudança de exercício mexe no slot. */
export type CampoDoSlot = 's' | 'r' | 'rir' | 'd';

export interface MudancaDaRevisao {
  /** chave estável dentro de uma leitura: 'B:entra:hack-machine', 'B:ordem', 'F:dia' */
  k: string;
  dia: string;
  tipo: TipoDaMudanca;
  /** o exercício (entra, sai, muda) */
  id?: string;
  /** o que a mudança mexe no slot (só `muda`) */
  campos?: CampoDoSlot[];
  /** '+' entra, '−' sai, '↑' ou '↓' séries, '~' outro parâmetro, '⇅' a ordem */
  sinal: string;
  /** "Hack machine entra" · "Cadeira flexora: 4 → 3 séries" */
  titulo: string;
  /** "3 × 8–12, depois do agachamento" · "era 1 × 10–15" · o que já está no programa dele */
  detalhe: string | null;
  /** o programa dele já está como a mudança diz: aplicar não muda nada nele */
  jaEsta?: boolean;
  /** a mudança inteira, para o histórico do programa: todos os campos, sem as notas da tela */
  texto: string;
  /** começa desmarcada: o treino que ele deixou de fora numa revisão anterior */
  desmarcada?: boolean;
}

function porIdDe(ex: SlotDoPrograma[] | undefined): Record<string, SlotDoPrograma> {
  const m: Record<string, SlotDoPrograma> = {};
  (ex || []).forEach(function (sl) { if (sl && sl.id && !m[sl.id]) m[sl.id] = sl; });
  return m;
}

/**
 * O treino como o TREINADOR o prescreve depois da revisão. O que a linha da
 * revisão não diz (RIR, descanso) fica como estava no programa dele: omitir não
 * é mudar. Exercício novo sem descanso dito ganha o padrão (`descansoDe`).
 * `desde` vem do slot do treinador quando o exercício já estava lá.
 */
export function treinoDaRevisao(
  d: DiaDaRevisao, ids: Record<string, string>, velho: TreinoDoPrograma | undefined,
  descansoDe: (id: string) => number, agora: number
): TreinoDoPrograma {
  const antes = porIdDe(velho && velho.ex);
  const ex = d.ex.map(function (x) {
    const id = ids[x.n];
    const v = antes[id];
    const sl: SlotDoPrograma = {
      id: id, s: x.s, r: x.r,
      d: x.d != null ? x.d : (v && typeof v.d === 'number' ? v.d : descansoDe(id)),
      desde: v ? (typeof v.desde === 'number' ? v.desde : 0) : agora
    };
    const rir = x.rir != null ? x.rir : (v ? v.rir : undefined);
    if (rir) sl.rir = rir;
    return sl;
  });
  const t: TreinoDoPrograma = { name: d.nome || (velho && velho.name) || ('Treino ' + d.dia), tag: (velho && velho.tag) || '', ex: ex };
  if (d.aberto) t.aberto = 1;
  return t;
}

/** O que mudou num exercício que fica, campo a campo, na ordem em que se lê. */
function camposQueMudam(v: SlotDoPrograma, n: SlotDoPrograma): CampoDoSlot[] {
  const c: CampoDoSlot[] = [];
  if (v.s !== n.s) c.push('s');
  if (v.r !== n.r) c.push('r');
  if ((v.rir || '') !== (n.rir || '')) c.push('rir');
  if ((v.d || 0) !== (n.d || 0)) c.push('d');
  return c;
}

function fraseDoCampo(c: CampoDoSlot, v: SlotDoPrograma, n: SlotDoPrograma): string {
  if (c === 's') return v.s + ' → ' + n.s + ' séries';
  if (c === 'r') return v.r + ' → ' + n.r + ' repetições';
  if (c === 'rir') return 'sobrando ' + (v.rir || '—') + ' → ' + (n.rir || '—');
  return 'descanso ' + descansoEscrito(v.d || 0) + ' → ' + descansoEscrito(n.d || 0);
}

/** "3 × 8–12, RIR 1, descanso 2min": a prescrição inteira, para o histórico. */
function prescricao(x: SlotDoPrograma): string {
  return x.s + ' × ' + x.r + (x.rir ? ', RIR ' + x.rir : '') + (typeof x.d === 'number' && x.d ? ', descanso ' + fmtDesc(x.d) : '');
}

/**
 * As mudanças de UM treino, contra o programa do treinador de antes (`velho`).
 * `meu` é o programa dele, para dizer o que ele já tem (`jaEsta`) e o que muda
 * nele: a lista é do treinador, e é igual para qualquer pessoa com o mesmo
 * programa base.
 *
 * Treino que não está no programa dele é uma mudança só ("Treino F entra na
 * rotação"): metade de um treino não é um treino. Vale para o treino novo e
 * para o que ele deixou de fora numa revisão anterior — este começa desmarcado
 * (`desmarcada`), porque foi o que ele escolheu da última vez; sem isto, ele
 * nunca mais entraria pela revisão.
 *
 * "Entra" num exercício que ele já tem é a diferença contra o slot DELE
 * (`campos`): aplicar mexe só no que difere, e "já está no seu programa" não
 * mexe em nada.
 */
export function mudancasDoTreino(
  dia: string, velho: TreinoDoPrograma | undefined, novo: TreinoDoPrograma,
  meu: TreinoDoPrograma | undefined, nomeDe: (id: string) => string
): MudancaDaRevisao[] {
  if (!meu) {
    const series = novo.ex.reduce(function (n, x) { return n + x.s; }, 0);
    const resumo = novo.aberto && !novo.ex.length ? 'o que o box programar'
      : novo.ex.length + (novo.ex.length === 1 ? ' exercício, ' : ' exercícios, ') + series + (series === 1 ? ' série' : ' séries');
    return [{
      k: dia + ':dia', dia: dia, tipo: 'dia', sinal: '+',
      titulo: 'Treino ' + dia + ' entra na rotação',
      detalhe: resumo + (velho ? ' · ficou de fora do seu programa antes' : ''),
      texto: 'Treino ' + dia + ' entra na rotação (' + resumo + ')',
      desmarcada: velho ? true : undefined
    }];
  }
  const V = (velho && velho.ex) || [];
  const antes = porIdDe(V), depois = porIdDe(novo.ex), dele = porIdDe(meu.ex);
  const out: MudancaDaRevisao[] = [];

  // o nome e a aula aberta, contra o treinador de antes (ou o dele, sem treinador)
  const nomeAntes = velho ? velho.name : meu.name;
  if (novo.name && novo.name !== nomeAntes) {
    out.push({ k: dia + ':nome', dia: dia, tipo: 'nome', sinal: '~',
               titulo: 'O treino ' + dia + ' passa a se chamar “' + novo.name + '”',
               detalhe: 'era “' + (nomeAntes || '') + '”' + (meu.name !== nomeAntes ? ' · o seu se chama “' + meu.name + '”' : ''),
               texto: 'o treino ' + dia + ' passa a se chamar “' + novo.name + '”',
               jaEsta: meu.name === novo.name || undefined });
  }
  const abertoAntes = !!(velho ? velho.aberto : meu.aberto);
  const converte = !!novo.aberto !== !!meu.aberto;
  if (converte || !!novo.aberto !== abertoAntes) {
    // Uma revisão idêntica não reabre a conversão que ele já deixou de fora.
    if (!!novo.aberto === abertoAntes && V.length === novo.ex.length &&
        V.every((v, i) => v.id === novo.ex[i].id && !camposQueMudam(v, novo.ex[i]).length)) return out;
    const t = novo.aberto ? 'O treino ' + dia + ' vira aula do box' : 'O treino ' + dia + ' deixa de ser aula do box';
    const slots = novo.aberto ? meu.ex : novo.ex;
    const efeito = novo.aberto ? 'a lista fixa sai' : 'entra a lista fixa';
    const lista = slots.map(x => nomeDe(x.id) + ' (' + prescricao(x) + ')').join(', ');
    out.push({ k: dia + ':aberto', dia: dia, tipo: 'aberto', sinal: '~', titulo: t,
               detalhe: lista ? efeito + ': ' + slots.map(x => nomeDe(x.id)).join(', ') : efeito,
               texto: t.charAt(0).toLowerCase() + t.slice(1) + (lista ? ': ' + lista : ''),
               desmarcada: (converte && !!novo.aberto === abertoAntes) || undefined,
               jaEsta: !converte || undefined });
    if (converte) return out; // tipo e lista fixa são uma escolha só
  }

  novo.ex.forEach(function (x, i) {
    const v = antes[x.id];
    if (!v) {
      const ant = i > 0 ? novo.ex[i - 1] : null;
      const onde = !ant ? (novo.ex.length > 1 ? 'no começo' : null)
        : i === novo.ex.length - 1 ? 'no fim' : 'depois de ' + nomeDe(ant.id);
      const m = dele[x.id];
      const camposDele = m ? camposQueMudam(m, x) : undefined;
      const ja = !!m && !camposDele!.length;
      out.push({ k: dia + ':entra:' + x.id, dia: dia, tipo: 'entra', id: x.id, campos: camposDele, sinal: '+',
                 titulo: nomeDe(x.id) + ' entra',
                 detalhe: x.s + ' × ' + x.r + (onde ? ', ' + onde : '') + (ja ? ' · já está no seu programa' : m ? ' · no seu programa: ' + m.s + ' × ' + m.r : ''),
                 texto: nomeDe(x.id) + ' entra (' + prescricao(x) + (onde ? ', ' + onde : '') + ')',
                 jaEsta: ja || undefined });
      return;
    }
    const campos = camposQueMudam(v, x);
    if (!campos.length) return;
    const m = dele[x.id];
    const ja = !!m && campos.every(function (c) { return (m[c] || '') === (x[c] || ''); });
    const seu = !m ? 'não está no seu programa'
      : ja ? 'o seu já está assim'
      : (m.s !== v.s || m.r !== v.r) ? 'no seu programa: ' + m.s + ' × ' + m.r : null;
    const frases = campos.map(function (c) { return fraseDoCampo(c, v, x); });
    out.push({ k: dia + ':muda:' + x.id, dia: dia, tipo: 'muda', id: x.id, campos: campos,
               sinal: x.s > v.s ? '↑' : x.s < v.s ? '↓' : '~',
               titulo: nomeDe(x.id) + ': ' + frases[0],
               detalhe: frases.slice(1).concat(seu ? [seu] : []).join(' · ') || null,
               texto: nomeDe(x.id) + ': ' + frases.join(', '),
               jaEsta: ja || !m || undefined });
  });

  V.forEach(function (v) {
    if (depois[v.id]) return;
    const ja = !dele[v.id];
    out.push({ k: dia + ':sai:' + v.id, dia: dia, tipo: 'sai', id: v.id, sinal: '−',
               titulo: nomeDe(v.id) + ' sai',
               detalhe: 'era ' + v.s + ' × ' + v.r + (ja ? ' · já não está no seu programa' : ''),
               texto: nomeDe(v.id) + ' sai (era ' + v.s + ' × ' + v.r + ')',
               jaEsta: ja || undefined });
  });

  // a ordem, só entre os que ficam (entrar e sair já são mudanças próprias)
  const ficavam = V.filter(function (v) { return depois[v.id]; }).map(function (v) { return v.id; });
  const ficam = novo.ex.filter(function (x) { return antes[x.id]; }).map(function (x) { return x.id; });
  if (ficavam.join('|') !== ficam.join('|')) {
    const i = ficam.findIndex((id, j) => id !== ficavam[j]);
    const adiantado = ficam[i], adiado = ficavam[i];
    const sem = (ids: string[], id: string) => ids.filter(x => x !== id).join('|');
    const adiantouUm = sem(ficavam, adiantado) === sem(ficam, adiantado);
    const adiouUm = !adiantouUm && sem(ficavam, adiado) === sem(ficam, adiado);
    const detalhe = adiouUm
      ? nomeDe(adiado) + ' passa para depois de ' + nomeDe(ficam[ficam.indexOf(adiado) - 1])
      : nomeDe(adiantado) + ' passa para antes de ' + nomeDe(adiado) + (adiantouUm ? '' : ', entre outras trocas');
    out.push({ k: dia + ':ordem', dia: dia, tipo: 'ordem', sinal: '⇅', titulo: 'A ordem dos exercícios muda',
               detalhe: detalhe,
               texto: 'a ordem dos exercícios muda: ' + ficam.map(nomeDe).join(', ') });
  }
  const ordem: TipoDaMudanca[] = ['dia', 'entra', 'sai', 'nome', 'aberto', 'muda', 'ordem'];
  return out.sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo));
}

/**
 * O treino DELE depois das mudanças escolhidas. Puro: devolve um treino novo.
 *
 * Na ordem: o que sai (toda ocorrência), o que muda (só os campos da mudança),
 * o que entra (no lugar que o treinador deu: depois do exercício que vem antes
 * na revisão e que ele tem; sem esse, antes do seguinte; sem nenhum, no fim; e,
 * se ele já tem o exercício, só os campos que diferem), a ordem (os que estão na
 * revisão trocam de lugar entre si, na ordem dela; os que só ele tem ficam onde
 * estão), o nome e a aula aberta, cada um só se escolhido.
 *
 * Sem o treino no programa dele, só o treino inteiro entra (`dia`).
 */
export function aplicaMudancas(
  meu: TreinoDoPrograma | undefined, velho: TreinoDoPrograma | undefined, novo: TreinoDoPrograma,
  escolhidas: MudancaDaRevisao[], agora: number
): TreinoDoPrograma | undefined {
  const quer = function (tipo: TipoDaMudanca) { return escolhidas.filter(function (m) { return m.tipo === tipo; }); };
  const copia = function (sl: SlotDoPrograma): SlotDoPrograma { return JSON.parse(JSON.stringify(sl)); };
  if (quer('dia').length) {
    const t: TreinoDoPrograma = JSON.parse(JSON.stringify(novo));
    t.ex.forEach(function (sl) { sl.desde = agora; });
    return t;
  }
  if (!meu) return meu;
  const t: TreinoDoPrograma = Object.assign({}, meu, { ex: (meu.ex || []).map(copia) });
  if (quer('nome').length && novo.name) t.name = novo.name;
  if (!!meu.aberto !== !!novo.aberto) {
    if (quer('aberto').length) {
      if (novo.aberto) { t.aberto = 1; t.ex = []; }
      else {
        delete t.aberto;
        t.ex = novo.ex.map(sl => Object.assign(copia(sl), { desde: agora }));
      }
    }
    return t;
  }
  const ex = t.ex;
  const doNovo = porIdDe(novo.ex);
  const onde = function (id: string) { return ex.findIndex(function (sl) { return sl.id === id; }); };
  const ajusta = function (sl: SlotDoPrograma, n: SlotDoPrograma, campos: CampoDoSlot[]) {
    campos.forEach(function (c) {
      if (c === 'rir') { if (n.rir) sl.rir = n.rir; else delete sl.rir; return; }
      (sl as Record<string, unknown>)[c] = n[c];
    });
  };

  quer('sai').forEach(function (m) {
    let i;
    while ((i = onde(m.id!)) >= 0) ex.splice(i, 1);
  });
  quer('muda').forEach(function (m) {
    const n = doNovo[m.id!];
    if (!n) return;
    ex.forEach(function (sl) { if (sl.id === m.id) ajusta(sl, n, m.campos || ['s', 'r', 'rir', 'd']); });
  });
  const entra: Record<string, MudancaDaRevisao> = {};
  quer('entra').forEach(function (m) { entra[m.id!] = m; });
  novo.ex.forEach(function (n, j) {
    const m = entra[n.id];
    if (!m) return;
    const ja = onde(n.id);
    if (ja >= 0) { ajusta(ex[ja], n, m.campos || ['s', 'r', 'rir', 'd']); return; }
    const sl = copia(n);
    sl.desde = agora;
    let pos = -1;
    for (let a = j - 1; a >= 0 && pos < 0; a--) { const p = onde(novo.ex[a].id); if (p >= 0) pos = p + 1; }
    for (let a = j + 1; a < novo.ex.length && pos < 0; a++) { const p = onde(novo.ex[a].id); if (p >= 0) pos = p; }
    ex.splice(pos < 0 ? ex.length : pos, 0, sl);
  });
  if (quer('ordem').length) {
    const lugar = function (id: string) { return novo.ex.findIndex(function (n) { return n.id === id; }); };
    const posicoes: number[] = [], quem: SlotDoPrograma[] = [];
    ex.forEach(function (sl, i) { if (doNovo[sl.id]) { posicoes.push(i); quem.push(sl); } });
    quem.sort(function (a, b) { return lugar(a.id) - lugar(b.id); });
    posicoes.forEach(function (i, j) { ex[i] = quem[j]; });
  }
  return t;
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
