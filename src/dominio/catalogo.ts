// O catálogo do SISTEMA (docs/catalogo/00-desenho.md, etapa 0).
//
// Até aqui o catálogo era o `EX_BASE` do código mais o `S.ex` de cada pessoa,
// e o exercício era reconhecido pelo nome. Este módulo dá ao catálogo a forma
// que o desenho pede: um exercício com id estável, movimento, equipamento,
// músculos com fração, nomes alternativos e equivalentes — igual para todos,
// curado pelo moderador, e lido pelo app como cópia (embutida ou baixada).
//
// Três garantias, todas cobertas em `tests/dominio/catalogo.test.ts`:
//
// 1. **Nenhuma chave muda.** Os ids do catálogo são os `slugEx` de sempre; o
//    histórico (`S.logs[id]`) não se move. Para todo id do `EX_BASE`, o
//    exercício que este catálogo devolve é IGUAL ao do código.
// 2. **Um id nunca some.** Uma cópia baixada que perdeu um id da semente é
//    recusada; unir dois exercícios é redirecionamento, nunca apagamento.
// 3. **O nome nunca é a chave.** Nome alternativo e apelido levam a um id; a
//    parecença só entra depois deles, e continua perguntando.
//
// Dado puro: nada aqui lê o estado nem a rede.

import type { Exercicio, IdEx, TipoCarga, Unidade } from './tipos';
import { ALT, EX_BASE, slugEx } from './programa';
import { ALT_NOMES, EQUIPAMENTOS, MOVIMENTOS, NOVOS_DA_V22, NOVOS_DO_SISTEMA, VERSAO_DA_SEMENTE, type NovoDoSistema } from './catalogo-semente';

/** Músculo (o mesmo vocabulário do `g`) e a fração da série que ele recebe. */
export type Musculo = [string, number];

/** Um exercício do catálogo do sistema. */
export interface ExDoSistema {
  id: IdEx;
  /** nome principal */
  n: string;
  /** nomes alternativos, em português e em inglês, inclusive os de academia */
  alt: string[];
  /** id do movimento (`MOVIMENTOS`) */
  mov: string;
  /** id do tipo de equipamento (`EQUIPAMENTOS`) */
  eq: string;
  /** o grupo a que a série conta no volume de hoje (`Exercicio.g`) */
  g: string;
  /** músculos com fração: o principal com 1, os secundários com menos */
  mus: Musculo[];
  car: TipoCarga;
  u?: Unidade;
  q?: number;
  /** composto grande (governa o descanso padrão) */
  c: 0 | 1;
  /** feito um lado de cada vez */
  uni?: 1;
  /** equivalentes: o mesmo alvo com outra mecânica */
  equiv: IdEx[];
  /** dica padrão; ausente onde o código não tem */
  cue?: string;
  peg?: string;
  pegPe?: 1;
  /** entrou como substituto (herdado do `EX_BASE`) */
  sub?: 1;
  /** algum dado foi preenchido por regra e espera o moderador */
  cur?: 1;
}

export interface CatalogoDoSistema {
  /**
   * A versão do BANCO de onde esta cópia veio (`catalogo_versao`); 0 é a semente
   * embutida. São duas perguntas separadas: a cópia SERVE (`validaCatalogo`: tem
   * todos os ids da semente, nenhuma troca proibida) e é MAIS NOVA (`maisNova`:
   * passa a versão que o aparelho já tem). A versão do conteúdo da semente
   * (`VERSAO_DA_SEMENTE`) não se compara com a do banco: são contadores de
   * coisas diferentes.
   */
  v: number;
  ex: Record<IdEx, ExDoSistema>;
  /** uniões: id antigo → id que ficou. Nunca se apaga uma. */
  redir: Record<IdEx, IdEx>;
}

const CARREGAMENTOS_VALIDOS: TipoCarga[] = ['pino', 'lado', 'barra', 'halter', 'halter1', 'corpo', 'assist'];
const UNIDADES_VALIDAS: Unidade[] = ['seg', 'm', 'cal', 'rep'];

// ---------- as regras que preenchem a semente ----------
// Movimento, equipamento e secundários saem do NOME por regra, e não à mão em
// 190 objetos: a regra é uma só, legível de uma vez, e o que ela não reconhece
// fica marcado `cur` para o moderador. Os secundários seguem a convenção de
// contagem de volume mais usada (meia série para o sinergista).

function sem(n: string): string {
  return ' ' + String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
}

/** [movimento, palavras] na ordem em que são testadas: a primeira que casa vale. */
const REGRAS_DE_MOVIMENTO: Array<[string, string[]]> = [
  ['mobilidade', [' alongamento ', ' mobilidade ']],
  ['core', [' prancha ', ' dead bug ', ' pallof ', ' ab wheel ', ' rollout ', ' crunch ', ' abdominal ', ' sit up ', ' elevacao de pernas ', ' reverse crunch ']],
  ['crucifixo-inverso', [' crucifixo inverso ', ' reverse ', ' face pull ', ' deltoide posterior ', ' remada alta com corda ', ' remada aberta ']],
  ['elevacao-lateral', [' elevacao lateral ']],
  ['elevacao-frontal', [' elevacao frontal ']],
  ['encolhimento', [' encolhimento ']],
  ['supino-inclinado', [' supino inclinado ', ' chest press inclinado ', ' maquina de supino inclinado ']],
  ['supino', [' supino ', ' chest press ']],
  ['crucifixo', [' crucifixo ', ' crossover ', ' pec deck ', ' peck deck ']],
  ['pullover', [' pullover ', ' straight arm ']],
  ['puxada', [' puxada ', ' pulldown ', ' barra fixa ']],
  ['remada', [' remada ', ' high row ']],
  ['rosca', [' rosca ']],
  ['triceps', [' triceps ', ' pushdown ', ' mergulho ', ' extensao unilateral acima ', ' extensao acima da cabeca ']],
  ['extensao-de-joelho', [' extensora ']],
  ['flexao-de-joelho', [' flexora ']],
  ['dobradica', [' terra romeno ', ' stiff ', ' good morning ']],
  ['ponte', [' elevacao pelvica ', ' hip thrust ', ' coice na maquina ']],
  ['abducao', [' abdutora ', ' abducao ', ' passada lateral ']],
  ['aducao', [' adutora ', ' aducao ', ' agachamento sumo ']],
  ['panturrilha', [' panturrilha ']],
  ['tibial', [' tibial ', ' flexao de tornozelo ']],
  ['agachamento', [' agachamento ', ' squat ', ' leg press ', ' hack ', ' afundo ', ' bulgaro ', ' lunge ']]
];

/** Secundários por movimento, quando o principal não é ele mesmo. */
const SECUNDARIOS: Record<string, Musculo[]> = {
  'supino-inclinado': [['tríceps', 0.5], ['delt anterior', 0.5]],
  'supino': [['tríceps', 0.5], ['delt anterior', 0.5]],
  'puxada': [['bíceps', 0.5]],
  'remada': [['bíceps', 0.5], ['delt posterior', 0.5]],
  'agachamento': [['glúteo', 0.5]],
  'dobradica': [['glúteo', 0.5]],
  'ponte': [['posterior', 0.25]]
};

/** O grupo como o texto do treinador escreve → o vocabulário do app. */
const GRUPO_DO_TEXTO: Record<string, string> = {
  'deltoide lateral': 'delt lateral', 'deltoide posterior': 'delt posterior', 'deltoide anterior': 'delt anterior',
  'costas': 'costas espessura', 'core': 'abdômen', 'peito inferior': 'peito', 'mobilidade': ''
};

export function grupoCanonico(g: string): string {
  const k = String(g || '').trim().toLowerCase();
  return k in GRUPO_DO_TEXTO ? GRUPO_DO_TEXTO[k] : k;
}

export function movimentoDe(n: string, u?: Unidade): string | null {
  const s = sem(n);
  for (const [mov, palavras] of REGRAS_DE_MOVIMENTO) {
    if (palavras.some(function (p) { return s.indexOf(p) >= 0; })) return mov;
  }
  return u ? 'condicionamento' : null;
}

export function equipamentoDe(n: string, car: TipoCarga, u?: Unidade): string {
  const s = sem(n);
  const tem = function (...p: string[]) { return p.some(function (x) { return s.indexOf(' ' + x + ' ') >= 0; }); };
  if (tem('smith')) return 'smith';
  if (tem('barra fixa')) return 'maquina-pino';
  if (tem('polia', 'cabo', 'crossover', 'corda', 'face pull', 'straight arm pulldown', 'pushdown', 'pallof')) return 'polia';
  if (tem('halter', 'halteres', 'goblet')) return 'halteres';
  if (tem('kettlebell', 'sandbag', 'wall balls')) return 'implemento';
  if (tem('barra', 'barra w')) return 'barra';
  if (tem('bike', 'remo', 'ski', 'esteira', 'corrida', 'erg')) return 'ergometro';
  if (tem('sled')) return 'sled';
  if (car === 'corpo') return 'corpo';
  if (car === 'assist') return 'maquina-pino';
  if (car === 'halter') return 'halteres';
  if (car === 'halter1') return 'implemento';
  if (car === 'barra') return 'barra';
  if (car === 'lado') return 'maquina-anilha';
  return u ? 'corpo' : 'maquina-pino';
}

export function unilateralDe(n: string): boolean {
  const s = sem(n);
  return [' unilateral ', ' alternada ', ' concentrada ', ' serrote ', ' bulgaro ', ' afundo ', ' lunge '].some(function (p) {
    return s.indexOf(p) >= 0;
  });
}

function musculosDe(g: string, mov: string | null): { mus: Musculo[]; cur: boolean } {
  if (!g) return { mus: [], cur: !mov };
  const mus: Musculo[] = [[g, 1]];
  (SECUNDARIOS[mov || ''] || []).forEach(function (m) { if (m[0] !== g) mus.push([m[0], m[1]]); });
  return { mus: mus, cur: !mov };
}

// ---------- a semente ----------

function doCodigo(id: IdEx, e: Exercicio): ExDoSistema {
  const mov = movimentoDe(e.n, e.u);
  const m = musculosDe(e.g, mov);
  const x: ExDoSistema = {
    id: id, n: e.n, alt: [], mov: mov || 'outro', eq: equipamentoDe(e.n, e.car, e.u),
    g: e.g, mus: m.mus, car: e.car, c: e.c, equiv: []
  };
  if (e.cue !== undefined) x.cue = e.cue;
  if (e.u) x.u = e.u;
  if (e.q != null) x.q = e.q;
  if (unilateralDe(e.n)) x.uni = 1;
  if (e.peg) x.peg = e.peg;
  if (e.pegPe) x.pegPe = 1;
  if (e.sub) x.sub = 1;
  if (m.cur || !mov) x.cur = 1;
  return x;
}

function doTexto(x: NovoDoSistema): ExDoSistema {
  const id = slugEx(x.n);
  const mov = x.mov || movimentoDe(x.n, x.u);
  const g = x.u === 'seg' ? '' : grupoCanonico(x.g);
  const m = musculosDe(g, mov);
  const e: ExDoSistema = {
    id: id, n: x.n, alt: (x.alt || []).slice(), mov: mov || 'outro', eq: x.eq || equipamentoDe(x.n, x.car, x.u),
    g: g, mus: x.mus || m.mus, car: x.car, c: x.c ? 1 : 0, equiv: (x.equiv || []).slice(), cue: ''
  };
  if (x.uni || unilateralDe(x.n)) e.uni = 1;
  // tudo o que veio de um texto de treinador, e não do catálogo revisado do
  // código, espera o moderador
  e.cur = 1;
  return e;
}

/** O catálogo embutido no app: o `EX_BASE`, os novos da v2.2 e os nomes alternativos. */
export const SEMENTE: CatalogoDoSistema = (function () {
  const ex: Record<IdEx, ExDoSistema> = {};
  Object.keys(EX_BASE).forEach(function (id) { ex[id] = doCodigo(id, EX_BASE[id]); });
  // os substitutos indicados pelo treinador são os equivalentes de partida
  Object.keys(ALT).forEach(function (nome) {
    const de = ex[slugEx(nome)];
    if (!de) return;
    ALT[nome].forEach(function (a) {
      const para = slugEx(a.n);
      if (para !== de.id && ex[para] && de.equiv.indexOf(para) < 0) de.equiv.push(para);
    });
  });
  NOVOS_DA_V22.concat(NOVOS_DO_SISTEMA).forEach(function (x) {
    const e = doTexto(x);
    if (ex[e.id]) throw new Error('semente: ' + e.id + ' já existe no código');
    ex[e.id] = e;
  });
  Object.keys(ALT_NOMES).forEach(function (id) {
    if (!ex[id]) throw new Error('semente: nome alternativo para id inexistente ' + id);
    ALT_NOMES[id].forEach(function (n) { if (ex[id].alt.indexOf(n) < 0) ex[id].alt.push(n); });
  });
  return { v: 0, ex: ex, redir: {} };
})();

/** A versão do conteúdo da semente (a do bundle), para o SQL gerado e o teste. */
export { VERSAO_DA_SEMENTE };

export { MOVIMENTOS, EQUIPAMENTOS };

// ---------- leitura ----------

/** Um exercício do sistema na forma que o resto do app usa (`Exercicio`). */
export function paraExercicio(e: ExDoSistema): Exercicio {
  const x: Exercicio = { n: e.n, car: e.car, g: e.g, c: e.c };
  if (e.cue !== undefined) x.cue = e.cue;
  if (e.u) x.u = e.u;
  if (e.q != null) x.q = e.q;
  if (e.peg) x.peg = e.peg;
  if (e.pegPe) x.pegPe = 1;
  if (e.sub) x.sub = 1;
  return x;
}

/**
 * O catálogo do sistema como mapa de `Exercicio`, a base de `montaCatalogo`.
 *
 * Cada união é MATERIALIZADA: o id antigo aparece com o exercício que ficou
 * (nome, carga, grupo). O histórico de quem usava o id antigo continua sob a
 * chave antiga, mas com a cara certa — e mesmo que a linha antiga tenha saído
 * da tabela, o id nunca vira fantasma.
 */
export function exerciciosDoSistema(c: CatalogoDoSistema): Record<IdEx, Exercicio> {
  const out: Record<IdEx, Exercicio> = {};
  Object.keys(c.ex).forEach(function (id) { out[id] = paraExercicio(c.ex[id]); });
  Object.keys(c.redir || {}).forEach(function (de) {
    const para = resolveId(de, c.redir);
    if (para !== de && c.ex[para]) out[de] = paraExercicio(c.ex[para]);
  });
  return out;
}

/** Segue as uniões até o id que ficou. Ciclo (dado ruim) para no ponto de partida. */
export function resolveId(id: IdEx, redir: Record<IdEx, IdEx>): IdEx {
  let x = id;
  const visto: Record<string, 1> = {};
  while (redir[x] && !visto[x]) { visto[x] = 1; x = redir[x]; }
  return visto[x] ? id : x;
}

/** A chave de um nome: a mesma normalização do id. "Hip Thrust" e "hip thrust" são um só. */
export function chaveDoNome(n: string): string { return slugEx(n); }

/**
 * Nome alternativo → id. O nome principal não entra: ele já é o id (`slugEx`).
 * Um nome alternativo que colida com o nome principal de outro exercício fica
 * de fora — o principal vence, e a colisão é dado ruim que o teste aponta.
 */
export function indiceDeNomes(c: CatalogoDoSistema): Record<string, IdEx> {
  const idx: Record<string, IdEx> = {};
  Object.keys(c.ex).forEach(function (id) {
    c.ex[id].alt.forEach(function (n) {
      const k = chaveDoNome(n);
      if (!k || c.ex[k] || k === id) return;
      if (!idx[k]) idx[k] = id;
    });
  });
  return idx;
}

/** O id é do catálogo do sistema (direto ou por união)? O resto é pessoal. */
export function ehDoSistema(id: IdEx, c: CatalogoDoSistema): boolean {
  return !!c.ex[resolveId(id, c.redir)];
}

// ---------- a cópia baixada ----------

function num(x: unknown): number | undefined { return typeof x === 'number' && isFinite(x) ? x : undefined; }
function txt(x: unknown): string { return typeof x === 'string' ? x : ''; }
function lst(x: unknown): string[] { return Array.isArray(x) ? x.filter(function (s) { return typeof s === 'string'; }) as string[] : []; }

/** Uma linha de `catalogo_exercicio` (Supabase) na forma do app. Linha ruim → null. */
export function deLinha(r: Record<string, unknown>): ExDoSistema | null {
  const id = txt(r.id), n = txt(r.nome), car = txt(r.carga) as TipoCarga;
  if (!id || !n || CARREGAMENTOS_VALIDOS.indexOf(car) < 0) return null;
  const mus: Musculo[] = (Array.isArray(r.musculos) ? r.musculos : [])
    .filter(function (m: unknown) { return Array.isArray(m) && typeof m[0] === 'string' && typeof m[1] === 'number'; })
    .map(function (m: [string, number]) { return [m[0], m[1]] as Musculo; });
  const e: ExDoSistema = {
    id: id, n: n, alt: lst(r.alt), mov: txt(r.movimento) || 'outro', eq: txt(r.equipamento) || 'maquina-pino',
    g: txt(r.grupo), mus: mus, car: car, c: r.composto ? 1 : 0, equiv: lst(r.equivalentes)
  };
  if (typeof r.dica === 'string') e.cue = r.dica;
  const u = txt(r.unidade) as Unidade;
  if (UNIDADES_VALIDAS.indexOf(u) >= 0) e.u = u;
  const q = num(r.quantidade);
  if (q != null) e.q = q;
  if (r.unilateral) e.uni = 1;
  if (txt(r.pegada)) e.peg = txt(r.pegada);
  if (r.pegada_pe) e.pegPe = 1;
  if (r.substituto) e.sub = 1;
  if (r.curadoria) e.cur = 1;
  return e;
}

/** O inverso de `deLinha`: a linha que o gerador de SQL escreve. */
export function paraLinha(e: ExDoSistema): Record<string, unknown> {
  return {
    id: e.id, nome: e.n, alt: e.alt, movimento: e.mov, equipamento: e.eq, grupo: e.g, musculos: e.mus,
    carga: e.car, unidade: e.u || null, quantidade: e.q == null ? null : e.q, composto: e.c === 1,
    unilateral: e.uni === 1, equivalentes: e.equiv, dica: e.cue == null ? null : e.cue, pegada: e.peg || null,
    pegada_pe: e.pegPe === 1, substituto: e.sub === 1, curadoria: e.cur === 1
  };
}

/**
 * A cópia SERVE? (baixada ou guardada no aparelho). Serve quando não perdeu
 * nenhum id da semente (direto ou por união), não tem união em círculo, e não
 * trocou o tipo de carga nem a grandeza de um exercício da semente.
 *
 * Esta última é regra de curadoria (docs/catalogo/00-desenho.md): `car` e `u`
 * dizem como ler a série guardada — 40 em `lado` é anilha por lado, em `pino` é
 * a placa. Trocar num id com histórico relê o passado de todo mundo. Mudou a
 * carga, é outro exercício: id novo, e o antigo como equivalente.
 *
 * Não serve → null, e o app continua com o que tinha: uma tabela mal editada
 * nunca derruba o catálogo. Ser MAIS NOVA é outra pergunta (`maisNova`).
 */
export function validaCatalogo(bruto: unknown, semente: CatalogoDoSistema): CatalogoDoSistema | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const b = bruto as { v?: unknown; ex?: unknown; redir?: unknown };
  const v = num(b.v);
  if (v == null || v < 0 || !b.ex || typeof b.ex !== 'object') return null;
  const ex: Record<IdEx, ExDoSistema> = {};
  const fonte = b.ex as Record<string, unknown>;
  for (const id of Object.keys(fonte)) {
    const e = fonte[id] as ExDoSistema;
    if (!e || e.id !== id || typeof e.n !== 'string' || !e.n || CARREGAMENTOS_VALIDOS.indexOf(e.car) < 0 ||
        (e.c !== 0 && e.c !== 1) || !Array.isArray(e.alt) || !Array.isArray(e.mus) || !Array.isArray(e.equiv)) return null;
    ex[id] = e;
  }
  const redir: Record<IdEx, IdEx> = {};
  const r = (b.redir && typeof b.redir === 'object' ? b.redir : {}) as Record<string, unknown>;
  for (const de of Object.keys(r)) {
    if (typeof r[de] !== 'string' || de === r[de]) return null;
    redir[de] = r[de] as string;
  }
  const c: CatalogoDoSistema = { v: v, ex: ex, redir: redir };
  // nenhum id da semente pode sumir, e nenhuma união pode girar em círculo
  for (const id of Object.keys(semente.ex)) if (!ex[resolveId(id, redir)]) return null;
  for (const de of Object.keys(redir)) if (resolveId(de, redir) === de || !ex[resolveId(de, redir)]) return null;
  for (const id of Object.keys(semente.ex)) {
    const e = ex[id], s = semente.ex[id];
    if (e && (e.car !== s.car || (e.u || '') !== (s.u || ''))) return null;
  }
  return c;
}

/** A cópia passa a versão do banco que o aparelho já tem? (0 = só a semente) */
export function maisNova(c: CatalogoDoSistema, atual: CatalogoDoSistema): boolean {
  return c.v > atual.v;
}

// ---------- a cópia no aparelho ----------
// O aparelho guarda só a DIFERENÇA para a semente: o catálogo embutido já está
// no bundle, e regravar 200 exercícios no armazenamento local (o do Safari tem
// cerca de 5 MiB, e o estado é regravado a cada série) tiraria espaço do que
// importa. Nenhum id sai do catálogo, então a diferença é só o que mudou ou
// entrou, mais as uniões.

export interface DiferencaDoCatalogo {
  v: number;
  ex: Record<IdEx, ExDoSistema>;
  redir: Record<IdEx, IdEx>;
}

/** JSON com as chaves em ordem e sem as indefinidas: igualdade de conteúdo. */
function canonico(x: unknown): string {
  return JSON.stringify(x, function (_k, v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const o: Record<string, unknown> = {};
      Object.keys(v).sort().forEach(function (k) { if (v[k] !== undefined) o[k] = v[k]; });
      return o;
    }
    return v;
  });
}

function mesmo(a: unknown, b: unknown): boolean { return canonico(a) === canonico(b); }

export function diferencaDaSemente(c: CatalogoDoSistema, semente: CatalogoDoSistema): DiferencaDoCatalogo {
  const ex: Record<IdEx, ExDoSistema> = {};
  Object.keys(c.ex).forEach(function (id) { if (!mesmo(c.ex[id], semente.ex[id])) ex[id] = c.ex[id]; });
  return { v: c.v, ex: ex, redir: Object.assign({}, c.redir) };
}

/** A semente com a diferença por cima, já validada. Diferença ruim → null. */
export function comDiferenca(semente: CatalogoDoSistema, d: unknown): CatalogoDoSistema | null {
  if (!d || typeof d !== 'object') return null;
  const x = d as DiferencaDoCatalogo;
  if (!x.ex || typeof x.ex !== 'object') return null;
  return validaCatalogo({ v: x.v, ex: Object.assign({}, semente.ex, x.ex), redir: x.redir || {} }, semente);
}

/** O que o banco devolve (linhas de `catalogo_exercicio` e de `catalogo_redirecionamento`). */
export interface CatalogoBruto {
  v: number;
  ex: Record<string, unknown>[];
  redir: { de: string; para: string }[];
}

/** As linhas do banco como catálogo, validado contra a semente. Uma linha ruim recusa tudo. */
export function catalogoDasLinhas(b: CatalogoBruto, semente: CatalogoDoSistema): CatalogoDoSistema | null {
  if (!b || !Array.isArray(b.ex) || !Array.isArray(b.redir)) return null;
  const ex: Record<IdEx, ExDoSistema> = {};
  for (const linha of b.ex) {
    const e = deLinha(linha);
    if (!e) return null;
    ex[e.id] = e;
  }
  const redir: Record<IdEx, IdEx> = {};
  b.redir.forEach(function (r) { if (r && typeof r.de === 'string' && typeof r.para === 'string') redir[r.de] = r.para; });
  return validaCatalogo({ v: b.v, ex: ex, redir: redir }, semente);
}
