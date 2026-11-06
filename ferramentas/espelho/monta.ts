// Do estado do app para uma pasta organizada por assunto.
//
// O estado é um documento só, otimizado para o app: chaves de uma letra,
// histórico indexado por exercício e não por sessão, totais congelados ao lado
// de marcas de refeição. Isso é ótimo para gravar uma série em 6 ms e péssimo
// para alguém LER — e quem lê esta pasta são os agentes dele (treinador,
// nutricionista) e ele mesmo.
//
// Então aqui o estado vira o que cada leitor procura: o treino por sessão, a
// comida por dia, o corpo por medida, as fotos por data. Markdown para ler, CSV
// para fazer conta, e o estado bruto ao lado para o que não coube.
//
// Este módulo é PURO: recebe o estado e devolve `caminho → conteúdo`. Rede,
// disco e login moram em `espelho.ts`. É o que deixa testar a organização sem
// conta e sem rede.
//
// Nada aqui é conselho. A regra 6 do PRODUCT.md vale para esta pasta como vale
// para a tela: descrever o que aconteceu, nunca prescrever.

import type {
  Cardio, Dia, EntradaProgLog, Estado, Exercicio, FotoRef, IdEx, Log, Marca,
  ModeloDeAula, PassoDeAjuste, PromoPendente, Serie, Sessao, SessaoFoto, Slot, Treino, Unidade
} from '../../src/dominio/tipos';
import type { Alimento, DiaComida, DiaComidaHist, Refeicao, Totais } from '../../src/dominio/nutricao/tipos';
import type { LeituraDeGordura } from '../../src/dominio/corpo';
import {
  CARGAS, DORES, ROT_BASE, exercicioFantasma, montaCatalogo, semeiaProg
} from '../../src/dominio/programa';
import { ARQUIVO } from '../../src/dominio/migracoes';
import { MEDIDAS_DO_CORPO } from '../../src/dominio/corpo';
import { CADENCIA_DIAS, DESDE_11_POSES, PROTOCOLO, dataLocal, instanteDaData, poses, posesDaData } from '../../src/dominio/protocolo';
import { ALIMENTOS_BASE, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  ajusteNoItem, quantidadePrescrita, totalDaRefeicao, totalDoDia, totalRegistrado
} from '../../src/dominio/nutricao/calculo';
import { CADENCIA_PADRAO, cadenciaPrevista } from '../../src/dominio/dia';
import { DIAS_CURTOS, DIAS_LONGOS, MESES, fmtDesc, fmtDur, fmtHora } from '../../src/dominio/formato';
import { BUCKET_APARELHOS, BUCKET_CORPO } from '../../src/infra/supabase';
import { APOIADO, NIVEL_FRENTE, NIVEL_LADO, TREMOR, noNivel } from '../../src/infra/nivel';
import { extDoOriginal } from '../../src/infra/corpo';

// ---------------------------------------------------------------------------
// O que entra e o que sai

/** Uma foto que a pasta deve ter: onde ela fica aqui e onde ela está na nuvem. */
export interface FotoAlvo {
  /** caminho relativo dentro da pasta, sempre com `/` */
  caminho: string;
  bucket: string;
  /** o caminho no bucket DEPOIS do uid, segmento a segmento */
  partes: string[];
  /** a versão da foto (instante da captura); muda quando ela é refeita */
  v: number;
}

export interface Contexto {
  /** o instante da geração */
  agora: number;
  /**
   * As fotos que ESTÃO na pasta. Ausente = não se sabe (só nos testes), e aí
   * todo arquivo vira link. Presente, o que não está aqui vira um aviso em vez
   * de um link para nada.
   */
  presentes?: Set<string>;
  /** fotos que a nuvem ainda não tem (404): o aparelho que tirou ainda não subiu */
  faltando?: Set<string>;
  /** fotos que a nuvem tem mas o download falhou desta vez */
  falhou?: Set<string>;
  /** a pasta foi gerada de um arquivo de cópia, que não leva fotos */
  semDownload?: boolean;
  /** e-mail da conta, para o LEIA-ME dizer de quem são os dados */
  conta?: string | null;
  /** de onde o estado veio, em texto: "nuvem" ou o nome do arquivo */
  origem?: string;
  /** quando o estado foi gravado na nuvem pela última vez, se veio de lá */
  gravadoEm?: number | null;
}

/** `caminho relativo → conteúdo`. A ordem de inserção é a ordem do índice. */
export type Arquivos = Record<string, string>;

// ---------------------------------------------------------------------------
// Leitura defensiva
//
// O estado chega da nuvem como `unknown`, gravado por qualquer build que o
// aparelho tivesse. O app normaliza na abertura; aqui não há abertura, então
// cada leitura se defende sozinha. Um campo faltando vira seção vazia, nunca
// exceção — uma pasta incompleta ainda serve, uma pasta que não gera não.

function lista<T>(x: unknown): T[] { return Array.isArray(x) ? (x as T[]) : []; }
function obj<T>(x: unknown): Record<string, T> {
  return (x && typeof x === 'object' && !Array.isArray(x)) ? (x as Record<string, T>) : {};
}
function numero(x: unknown): number | null { return typeof x === 'number' && isFinite(x) ? x : null; }

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Um segmento de caminho que não escapa da pasta.
 *
 * Os ids saem de `slugEx` e já são seguros — mas vêm de um documento que
 * qualquer aparelho dele gravou, e um `../` aqui escreveria fora da pasta. A
 * defesa custa uma linha.
 */
export function segmento(s: string): string {
  const r = String(s).replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[.-]+/, '');
  return r || 'sem-nome';
}

// ---------------------------------------------------------------------------
// Formato
//
// Markdown em português do Brasil (vírgula decimal, data dd/mm/aaaa), porque é
// texto para ler. CSV no formato que qualquer ferramenta abre sem configurar
// (vírgula separa, ponto decimal, datas ISO), porque é dado para calcular.

function dois(n: number): string { return String(n).padStart(2, '0'); }

/** 28/10/2026 */
function dataBR(t: number): string {
  const d = new Date(t);
  return dois(d.getDate()) + '/' + dois(d.getMonth() + 1) + '/' + d.getFullYear();
}
/** ter, 28/10/2026 */
function dataComDia(t: number): string { return DIAS_CURTOS[new Date(t).getDay()] + ', ' + dataBR(t); }
/** terça, 28/10/2026 às 06:18 */
function momento(t: number): string {
  return DIAS_LONGOS[new Date(t).getDay()] + ', ' + dataBR(t) + ' às ' + fmtHora(t);
}
function dataIsoBR(d: string): string { return dataComDia(instanteDaData(d)); }

/** Número para ler: vírgula decimal, sem zeros inúteis. */
function br(n: number, casas: number = 1): string {
  const f = Math.pow(10, casas);
  return String(Math.round(n * f) / f).replace('.', ',');
}
/** Milhar com ponto, para kcal. */
function milhar(n: number): string { return Math.round(n).toLocaleString('pt-BR'); }

/** 1:52, ou 1:02:05 acima de uma hora. */
function relogio(seg: number): string {
  const s = Math.round(seg);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? h + ':' + dois(m) + ':' + dois(r) : m + ':' + dois(r);
}

/** Célula de tabela markdown: sem quebra de linha e sem barra vertical solta. */
function cel(x: unknown): string {
  return String(x == null ? '' : x).replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();
}

/** CSV no padrão RFC 4180: aspas só onde precisa. */
function csv(cabecalho: string[], linhas: Array<Array<string | number | null | undefined>>): string {
  const campo = function (x: string | number | null | undefined): string {
    if (x == null) return '';
    const s = typeof x === 'number' ? String(Math.round(x * 1000) / 1000) : String(x);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cabecalho].concat(linhas as string[][]).map(function (l) { return l.map(campo).join(','); }).join('\n') + '\n';
}

function totaisTexto(t: Totais): string {
  return milhar(t.kcal) + ' kcal · P ' + Math.round(t.p) + ' g · C ' + Math.round(t.c) + ' g · G ' + Math.round(t.g) + ' g';
}

/**
 * O cabeçalho comum.
 *
 * Sem a hora da geração, de propósito: com ela, todo arquivo mudaria a cada
 * atualização, e "o que mudou desde ontem" deixaria de ser uma pergunta que a
 * data do arquivo responde. A hora mora num lugar só, o LEIA-ME.
 */
function cabeca(titulo: string, linhas: string[] = []): string[] {
  return ['# ' + titulo, '', ...linhas, ...(linhas.length ? [''] : []),
    '_Arquivo gerado a partir do app. Não edite: a próxima atualização sobrescreve. Ver `LEIA-ME.md` na raiz da pasta._', ''];
}

// ---------------------------------------------------------------------------
// O que o resto do módulo consulta

interface Base {
  S: Partial<Estado>;
  cat: Record<IdEx, Exercicio>;
  rot: Dia[];
  prog: Record<Dia, Treino>;
  /** o programa do treinador, como o app o entende: a revisão colada, ou o do código */
  treinador: { rot: Dia[]; dias: Record<Dia, Treino>; data: string | null; colado: boolean };
  alimentos: Record<string, Alimento>;
  plano: Refeicao[];
  sessoes: Sessao[];
  /** os registros de cada sessão, pelo sid */
  porSid: Map<number, Array<{ key: IdEx; l: Log }>>;
}

function base(S: Partial<Estado>): Base {
  const cat = montaCatalogo(obj<Partial<Exercicio>>(S.ex));
  const progS = obj<Treino>(S.prog);
  const prog = Object.keys(progS).length ? progS : semeiaProg();
  const rot = lista<Dia>(S.rot).length ? lista<Dia>(S.rot) : ROT_BASE.filter(function (d) { return prog[d]; });

  const pt = S.progTreinador && typeof S.progTreinador === 'object' && S.progTreinador.dias ? S.progTreinador : null;
  const treinador = pt
    ? { rot: lista<Dia>(pt.rot), dias: obj<Treino>(pt.dias), data: pt.data || null, colado: true }
    : { rot: ROT_BASE.slice(), dias: semeiaProg(), data: null, colado: false };

  // Como `catalogoAlimentos()` do app, mas sem esconder os ocultos: aqui o
  // catálogo serve para dar NOME a um item, e um item do plano não perde o
  // nome porque o alimento saiu da lista de busca.
  const comida = obj<unknown>(S.comida);
  const proprios = obj<Partial<Alimento>>(comida.alimentos);
  const alimentos: Record<string, Alimento> = {};
  Object.keys(ALIMENTOS_BASE).forEach(function (k) { alimentos[k] = ALIMENTOS_BASE[k]; });
  Object.keys(proprios).forEach(function (k) {
    alimentos[k] = Object.assign({ id: k }, ALIMENTOS_BASE[k] || {}, proprios[k]) as Alimento;
  });
  const plano = lista<Refeicao>(comida.plano).length ? lista<Refeicao>(comida.plano) : PLANO_BASE;

  const sessoes = lista<Sessao>(S.done).filter(function (m) { return m && numero(m.t) != null; })
    .slice().sort(function (a, b) { return a.t - b.t; });

  const porSid = new Map<number, Array<{ key: IdEx; l: Log }>>();
  const logs = obj<Log[]>(S.logs);
  Object.keys(logs).forEach(function (key) {
    lista<Log>(logs[key]).forEach(function (l) {
      if (!l || numero(l.t) == null) return;
      const sid = numero(l.sid) != null ? l.sid : l.t;
      if (!porSid.has(sid)) porSid.set(sid, []);
      porSid.get(sid)!.push({ key: key, l: l });
    });
  });

  return { S, cat, rot, prog, treinador, alimentos, plano, sessoes, porSid };
}

function exDe(b: Base, id: IdEx): Exercicio {
  if (b.cat[id]) return b.cat[id];
  // O histórico anterior ao plano 2 vive sob `antigo~Nome do exercício`: o nome
  // está na própria chave, e é melhor que o id cru.
  if (id.indexOf(ARQUIVO) === 0) return Object.assign(exercicioFantasma(id), { n: id.slice(ARQUIVO.length) });
  return exercicioFantasma(id);
}
function nomeEx(b: Base, id: IdEx): string { return exDe(b, id).n || id; }
/** O tipo de carga do exercício, com a correção que ele fez no app por cima do catálogo. */
function tipoCarga(b: Base, id: IdEx): keyof typeof CARGAS {
  const k = (obj<string>(b.S.carga)[id] || exDe(b, id).car) as keyof typeof CARGAS;
  return CARGAS[k] ? k : 'pino';
}
function nomeDoTreino(b: Base, day: Dia): string {
  const t = b.prog[day] || b.treinador.dias[day];
  return t && t.name ? t.name : '';
}
function dor(k: string): string {
  const d = DORES.filter(function (x) { return x.k === k; })[0];
  return d ? d.t : k;
}

/** A hora de uma sessão só aparece quando é confiável — a mesma regra do app (`temHora`). */
function temHora(m: Sessao): boolean {
  if (m.livre) return m.hora === 1;
  return !m.retro || m.hora === 1;
}

// ---------------------------------------------------------------------------
// Fotos

/**
 * As fotos que a pasta deve ter, tiradas das REFERÊNCIAS no estado.
 *
 * Não lista o bucket: o estado já diz o que existe, em que versão e com que
 * extensão — é a mesma fonte que o app usa para pedir os bytes. Uma foto no
 * bucket sem referência no estado é sobra de uma troca, e não interessa a
 * ninguém que leia a pasta.
 */
export function fotosDoEstado(S: Partial<Estado>): FotoAlvo[] {
  const r: FotoAlvo[] = [];

  lista<SessaoFoto>(obj<unknown>(S.protocolo).sessoes).forEach(function (s) {
    if (!s || !DATA_ISO.test(String(s.d))) return;
    const fotos = obj<FotoRef>(s.fotos);
    Object.keys(fotos).forEach(function (pose) {
      const f = fotos[pose];
      if (!f || numero(f.v) == null || !f.ext) return;
      const arquivo = segmento(pose) + '.' + segmento(f.ext);
      r.push({ caminho: 'corpo/fotos/' + s.d + '/' + arquivo, bucket: BUCKET_CORPO, partes: [s.d, pose + '.' + f.ext], v: f.v });
      // o original da foto de verdade (F27), ao lado, com a resolução cheia
      if (f.orig && f.orig.ext) {
        r.push({ caminho: 'corpo/fotos/' + s.d + '/' + segmento(pose) + '.original.' + segmento(f.orig.ext), bucket: BUCKET_CORPO,
                 partes: [s.d, pose + '.' + extDoOriginal(f.v, f.orig.ext)], v: f.v });
      }
    });
  });

  const aparelhos = obj<FotoRef>(S.fotos);
  Object.keys(aparelhos).forEach(function (id) {
    const f = aparelhos[id];
    if (!f || numero(f.v) == null || !f.ext) return;
    r.push({ caminho: 'treino/aparelhos/' + segmento(id) + '.' + segmento(f.ext), bucket: BUCKET_APARELHOS, partes: [id + '.' + f.ext], v: f.v });
  });

  return r;
}

/** `null` quando a foto está na pasta; senão, o porquê de não estar, em texto. */
function situacaoDaFoto(caminho: string, ctx: Contexto): string | null {
  if (ctx.presentes && ctx.presentes.has(caminho)) return null;
  if (ctx.faltando && ctx.faltando.has(caminho)) return 'ainda não subiu para a nuvem';
  if (ctx.falhou && ctx.falhou.has(caminho)) return 'não deu para baixar nesta atualização';
  if (ctx.semDownload) return 'não baixada (a cópia em arquivo não leva fotos)';
  return ctx.presentes ? 'não baixada' : null;
}

// ---------------------------------------------------------------------------
// Treino

function alvoDoSlot(s: Slot, ex: Exercicio): string {
  const u = s.u || ex.u;
  const q = s.q != null ? s.q : ex.q;
  if (!u) return s.r || '';
  const ROT: Record<Unidade, string> = { m: 'm', cal: 'cal', rep: 'reps', seg: 's' };
  return (q != null ? br(q) + ' ' : '') + ROT[u];
}

/**
 * Um treino em tabela. `comDesde` liga a coluna de quando o exercício entrou
 * na posição — que só tem sentido no programa atual: na prescrição do
 * treinador, tudo está lá desde a prescrição.
 */
function tabelaDoTreino(b: Base, t: Treino, comDesde: boolean): string[] {
  if (t.aberto && !lista(t.ex).length) return ['Decidido no dia (aula de box): sem exercícios prescritos.', ''];
  const L = ['| # | Exercício | Séries | Repetições / alvo | RIR | Descanso | Grupo |' + (comDesde ? ' Na posição desde |' : ''),
             '|---|---|---|---|---|---|---|' + (comDesde ? '---|' : '')];
  lista<Slot>(t.ex).forEach(function (s, i) {
    const ex = exDe(b, s.id);
    let nome = ex.n;
    if (s.orig && s.orig !== s.id) nome += ' (no lugar de ' + nomeEx(b, s.orig) + ')';
    if (s.bi) nome += ' — bi-set com o próximo';
    const cols: Array<string | number> = [i + 1, cel(nome), s.s, cel(alvoDoSlot(s, ex)), cel(s.rir || ''), s.d ? fmtDesc(s.d) : '', cel(ex.g || '')];
    if (comDesde) cols.push(!s.desde ? 'do treinador' : dataBR(s.desde));
    L.push('| ' + cols.join(' | ') + ' |');
  });
  if (t.aberto) L.push('', 'Dia aberto: o que entra nele se decide no dia.');
  return L.concat(['']);
}

function programaAtual(b: Base, ctx: Contexto): string {
  const S = b.S;
  const cad = lista<string>(S.cadencia).length === 7 ? lista<string>(S.cadencia) : CADENCIA_PADRAO;
  const L = cabeca('Programa de treino atual', [
    'O programa que o app executa hoje. Começou como cópia do programa do treinador',
    '(`programa-do-treinador.md`) e muda conforme as decisões registradas em `mudancas.md`.'
  ]);
  L.push('- **Rotação:** ' + b.rot.join(' → ') + ' (avança conforme os treinos são registrados, não pelo dia da semana)');
  L.push('- **Semana típica:** ' + cad.map(function (c, i) { return DIAS_CURTOS[i] + ' ' + c; }).join(' · '));
  L.push('- **Deload:** ' + (S.deload ? 'ligado agora' : 'desligado'));
  L.push('- **Na posição desde:** quando o exercício entrou naquela posição; "do treinador" = está lá desde a prescrição original.');
  L.push('');
  b.rot.forEach(function (d) {
    const t = b.prog[d];
    if (!t) return;
    L.push('## ' + d + ' — ' + (t.name || '') + (t.tag ? ' (' + t.tag + ')' : ''), '');
    L.push(...tabelaDoTreino(b, t, true));
  });
  return L.join('\n');
}

function programaDoTreinador(b: Base, ctx: Contexto): string {
  const t = b.treinador;
  const L = cabeca('Programa do treinador', [
    t.colado
      ? 'A última revisão que o treinador mandou e foi colada no app' + (t.data ? ', datada de ' + dataIsoBR(t.data) : '') + '.'
      : 'O programa original, como o treinador prescreveu (é o que vem no código do app; nenhuma revisão foi colada depois).',
    'É a referência: o programa atual (`programa.md`) pode ter divergido dele por decisões do dia a dia.'
  ]);
  const rot = t.rot.length ? t.rot : Object.keys(t.dias);
  rot.forEach(function (d) {
    const dia = t.dias[d];
    if (!dia) return;
    L.push('## ' + d + ' — ' + (dia.name || '') + (dia.tag ? ' (' + dia.tag + ')' : ''), '');
    L.push(...tabelaDoTreino(b, dia, false));
  });
  return L.join('\n');
}

function mudancas(b: Base, ctx: Contexto): string {
  const L = cabeca('Mudanças no programa');
  const pend = lista<PromoPendente>(b.S.promoPendente).slice().sort(function (a, b2) { return a.t - b2.t; });
  L.push('## Esperando decisão', '');
  if (!pend.length) L.push('Nada esperando.', '');
  else {
    L.push('Mudanças feitas num treino que ainda não viraram permanentes nem foram descartadas.', '');
    pend.forEach(function (p) {
      L.push('- **' + dataComDia(p.t) + ' — treino ' + p.day + (nomeDoTreino(b, p.day) ? ' (' + nomeDoTreino(b, p.day) + ')' : '') + '**');
      lista<string>(p.resumoMods).forEach(function (m) { L.push('  - ' + cel(m)); });
    });
    L.push('');
  }
  const log = lista<EntradaProgLog>(b.S.progLog).slice().sort(function (a, b2) { return b2.t - a.t; });
  L.push('## Decisões registradas', '');
  if (!log.length) L.push('Nenhuma ainda.', '');
  else {
    L.push('A mais recente primeiro.', '');
    log.forEach(function (e) {
      L.push('- **' + dataComDia(e.t) + ' — treino ' + e.day + ':** ' + cel(e.txt) + (e.motivo ? ' _Motivo: ' + cel(e.motivo) + '_' : ''));
    });
    L.push('');
  }
  return L.join('\n');
}

/** Uma série em texto: o que ela foi, na grandeza em que foi medida. */
function serieTexto(s: Exclude<Serie, null>, u: Unidade | undefined, q: number | undefined): string {
  const carga = s[0], res = s[1], rir = s[2];
  const r = typeof rir === 'number' ? ' (RIR ' + rir + ')' : '';
  const kg = carga > 0 ? br(carga, 2) + ' kg' : '';
  if (!u) return br(carga, 2) + ' × ' + res + r;
  if (u === 'm' || u === 'cal') return (kg ? kg + ' · ' : '') + (q ? br(q) + ' ' + u + ' ' : '') + 'em ' + relogio(res) + r;
  if (u === 'rep') return (kg ? kg + ' × ' : '') + res + ' reps' + r;
  return (kg ? kg + ' · ' : '') + res + ' s' + r;
}

/** Os registros de uma sessão, na ordem das posições do treino daquele dia. */
function registrosEmOrdem(b: Base, day: Dia, regs: Array<{ key: IdEx; l: Log }>): Array<{ key: IdEx; l: Log }> {
  const pos = lista<Slot>((b.prog[day] || { ex: [] }).ex).map(function (s) { return s.id; });
  return regs.slice().sort(function (x, y) {
    const px = pos.indexOf(x.l.sl || x.key), py = pos.indexOf(y.l.sl || y.key);
    return (px < 0 ? 999 : px) - (py < 0 ? 999 : py);
  });
}

interface SessaoMontada {
  m: Sessao;
  /** sessão que só existe no histórico de exercícios, sem a marca de presença */
  orfa: boolean;
  regs: Array<{ key: IdEx; l: Log }>;
}

function sessoesMontadas(b: Base): SessaoMontada[] {
  const usados = new Set<number>();
  const r: SessaoMontada[] = b.sessoes.map(function (m) {
    usados.add(m.sid);
    return { m: m, orfa: false, regs: registrosEmOrdem(b, m.day, b.porSid.get(m.sid) || []) };
  });
  b.porSid.forEach(function (regs, sid) {
    if (usados.has(sid)) return;
    const t = Math.min(...regs.map(function (x) { return x.l.t; }));
    r.push({ m: { day: '', t: t, sid: sid, dur: 0 }, orfa: true, regs: regs });
  });
  return r.sort(function (a, c) { return a.m.t - c.m.t; });
}

function linhasDaSessao(b: Base, x: SessaoMontada): string[] {
  const m = x.m, S = b.S;
  const titulo = m.livre ? (m.nome || 'Sessão avulsa') : (m.day ? m.day + (nomeDoTreino(b, m.day) ? ' · ' + nomeDoTreino(b, m.day) : '') : 'Sem treino identificado');
  const L = ['## ' + dataComDia(m.t) + ' — ' + titulo, ''];

  const fatos: string[] = [];
  if (temHora(m)) fatos.push('começou às ' + fmtHora(m.t));
  if (m.dur > 0) fatos.push(fmtDur(m.dur) + ' de treino');
  if (S.sessao && S.sessao.sid === m.sid) fatos.push('em andamento');
  if (m.dl) fatos.push('deload');
  if (m.retro) fatos.push('lançada depois');
  if (m.livre) fatos.push('fora do plano');
  if (m.fim === 'auto') fatos.push('encerrada sozinha pelo app');
  if (x.orfa) fatos.push('registros sem a marca da sessão');
  if (fatos.length) L.push(fatos.join(' · '), '');

  if (lista<string>(m.grupos).length) L.push('- Grupos: ' + lista<string>(m.grupos).join(', '));
  const pulados = lista<number>(m.pulados).map(function (i) {
    const s = lista<Slot>((b.prog[m.day] || { ex: [] }).ex)[i];
    return s ? nomeEx(b, s.id) : 'posição ' + (i + 1);
  });
  if (pulados.length) L.push('- Pulou: ' + pulados.join(', '));
  if (lista<string>(m.dorMesmoAssim).length) {
    L.push('- Fez mesmo com dor repetida: ' + lista<string>(m.dorMesmoAssim).map(function (id) { return nomeEx(b, id); }).join(', '));
  }
  if (lista<string>(m.mods).length) L.push('- Mudanças do dia: ' + lista<string>(m.mods).map(cel).join('; '));
  if (m.lousa) L.push('- Tem foto da lousa da aula (fica só no aparelho, não está nesta pasta)');
  if (m.obs) L.push('- Nota da sessão:', '', ...String(m.obs).split(/\r?\n/).map(function (l) { return '  > ' + l; }));
  if (L[L.length - 1] !== '') L.push('');

  if (!x.regs.length) L.push('_Nenhuma série registrada._');
  x.regs.forEach(function (rg) {
    const l = rg.l;
    const ex = exDe(b, rg.key);
    const feitas = lista<Serie>(l.sets).filter(Boolean) as Array<Exclude<Serie, null>>;
    const unidade = l.u ? '' : ' (' + CARGAS[tipoCarga(b, rg.key)].rot + ')';
    let nome = '**' + ex.n + '**' + unidade;
    if (l.sl && l.sl !== rg.key) nome += ' no lugar de ' + nomeEx(b, l.sl);
    L.push('- ' + nome + ' — ' + (feitas.length ? feitas.map(function (s) { return serieTexto(s, l.u, l.q); }).join(' · ') : 'sem série completa'));
    if (l.rir && !feitas.some(function (s) { return typeof s[2] === 'number'; })) L.push('  - RIR da última série: ' + l.rir);
    if (l.aq) L.push('  - feito com aproximação');
    if (lista<string>(l.dor).length) L.push('  - dor: ' + lista<string>(l.dor).map(dor).join(', '));
    if (l.obs) L.push('  - nota: ' + cel(l.obs));
  });
  L.push('');
  return L;
}

/** `AAAA-MM` → "outubro de 2026" */
function nomeDoMes(am: string): string {
  const p = am.split('-');
  return MESES[Number(p[1]) - 1] + ' de ' + p[0];
}

function historicoPorMes(b: Base, ctx: Contexto): Arquivos {
  const meses = new Map<string, { sessoes: SessaoMontada[]; cardio: Cardio[]; descanso: string[] }>();
  const mes = function (am: string) {
    if (!meses.has(am)) meses.set(am, { sessoes: [], cardio: [], descanso: [] });
    return meses.get(am)!;
  };
  sessoesMontadas(b).forEach(function (x) { mes(dataLocal(x.m.t).slice(0, 7)).sessoes.push(x); });
  lista<Cardio>(b.S.cardio).forEach(function (c) { if (c && numero(c.t) != null) mes(dataLocal(c.t).slice(0, 7)).cardio.push(c); });
  Object.keys(obj<number>(b.S.descanso)).forEach(function (d) { if (DATA_ISO.test(d)) mes(d.slice(0, 7)).descanso.push(d); });

  const r: Arquivos = {};
  Array.from(meses.keys()).sort().forEach(function (am) {
    const M = meses.get(am)!;
    const L = cabeca('Treinos — ' + nomeDoMes(am));
    const series = M.sessoes.reduce(function (a, x) {
      return a + x.regs.reduce(function (s, rg) { return s + lista<Serie>(rg.l.sets).filter(Boolean).length; }, 0);
    }, 0);
    L.push(M.sessoes.length + (M.sessoes.length === 1 ? ' sessão' : ' sessões') + ' · ' + series + ' séries · ' +
      M.cardio.length + ' de cardio · ' + M.descanso.length + (M.descanso.length === 1 ? ' dia marcado' : ' dias marcados') + ' como descanso', '');
    M.sessoes.forEach(function (x) { L.push(...linhasDaSessao(b, x)); });
    if (M.cardio.length) {
      L.push('## Cardio', '', '| Dia | Hora | Modalidade | Minutos | Intensidade |', '|---|---|---|---|---|');
      M.cardio.sort(function (a, c) { return a.t - c.t; }).forEach(function (c) {
        L.push('| ' + [dataComDia(c.t), c.semHora ? '' : fmtHora(c.t), cel(c.m), c.min, cel(c.i)].join(' | ') + ' |');
      });
      L.push('');
    }
    if (M.descanso.length) {
      L.push('## Descanso', '', 'Dias marcados como descanso: ' + M.descanso.sort().map(dataIsoBR).join(' · ') + '.', '');
    }
    r['treino/historico/' + am + '.md'] = L.join('\n');
  });
  return r;
}

function seriesCsv(b: Base): string {
  const linhas: Array<Array<string | number | null>> = [];
  sessoesMontadas(b).forEach(function (x) {
    const m = x.m;
    x.regs.forEach(function (rg) {
      const l = rg.l, ex = exDe(b, rg.key);
      lista<Serie>(l.sets).forEach(function (s, i) {
        if (!s) return;
        linhas.push([
          dataLocal(m.t), temHora(m) ? fmtHora(m.t) : '', m.sid, m.day || '', m.livre ? (m.nome || 'avulsa') : nomeDoTreino(b, m.day),
          rg.key, ex.n, ex.g || '', i + 1,
          s[0], l.u ? 'kg' : CARGAS[tipoCarga(b, rg.key)].rot,
          s[1], l.u === 'm' || l.u === 'cal' || l.u === 'seg' ? 'segundos' : 'reps',
          l.u ? (l.q != null ? l.q : '') : '', l.u || '',
          typeof s[2] === 'number' ? s[2] : '', m.dl || l.dl ? 1 : 0, l.obs || ''
        ]);
      });
    });
  });
  return csv(['data', 'hora', 'sessao', 'treino', 'nome_do_treino', 'exercicio_id', 'exercicio', 'grupo', 'serie',
    'carga', 'carga_unidade', 'resultado', 'resultado_unidade', 'alvo', 'alvo_unidade', 'rir', 'deload', 'nota'], linhas);
}

function cardioCsv(b: Base): string {
  const c = lista<Cardio>(b.S.cardio).filter(function (x) { return x && numero(x.t) != null; }).sort(function (a, x) { return a.t - x.t; });
  return csv(['data', 'hora', 'modalidade', 'minutos', 'intensidade'],
    c.map(function (x) { return [dataLocal(x.t), x.semHora ? '' : fmtHora(x.t), x.m, x.min, x.i]; }));
}

function exercicios(b: Base, ctx: Contexto): string {
  const noPrograma = new Set<IdEx>();
  b.rot.forEach(function (d) { lista<Slot>((b.prog[d] || { ex: [] }).ex).forEach(function (s) { noPrograma.add(s.id); }); });
  const doTreinador = new Set<IdEx>();
  Object.keys(b.treinador.dias).forEach(function (d) { lista<Slot>(b.treinador.dias[d].ex).forEach(function (s) { doTreinador.add(s.id); }); });
  const logs = obj<Log[]>(b.S.logs);
  const fotos = obj<FotoRef>(b.S.fotos);
  const todos = new Set<IdEx>([...noPrograma, ...doTreinador, ...Object.keys(logs), ...Object.keys(fotos)]);

  const linha = function (id: IdEx): string {
    const ex = exDe(b, id);
    const h = lista<Log>(logs[id]);
    const ultima = h.reduce(function (a, l) { return l && l.t > a ? l.t : a; }, 0);
    const f = fotos[id];
    const arquivo = f && f.ext ? 'aparelhos/' + segmento(id) + '.' + segmento(f.ext) : null;
    const sit = arquivo ? situacaoDaFoto('treino/' + arquivo, ctx) : null;
    const foto = !arquivo ? '' : sit ? cel(sit) : '[foto](' + arquivo + ')';
    const medida = ex.u ? ({ m: 'distância', cal: 'calorias', rep: 'repetições', seg: 'tempo' } as Record<Unidade, string>)[ex.u] : 'carga × reps';
    return '| ' + [cel(ex.n), '`' + id + '`', cel(ex.g || ''), cel(CARGAS[tipoCarga(b, id)].nome), medida,
      h.length ? h.length + (ultima ? ' (última ' + dataBR(ultima) + ')' : '') : '—', foto].join(' | ') + ' |';
  };
  const ordem = function (ids: IdEx[]) {
    return ids.sort(function (a, c) { return nomeEx(b, a).localeCompare(nomeEx(b, c), 'pt-BR'); });
  };
  const cab = ['| Exercício | id | Grupo | Carregamento | Mede | Sessões registradas | Aparelho |', '|---|---|---|---|---|---|---|'];

  const L = cabeca('Exercícios', [
    'Os exercícios do programa e todos os que têm histórico. O `id` é a chave usada em `series.csv`.',
    'Carregamento diz como a carga é digitada: "anilha por lado" e "barra livre" são o peso de UM lado; "halter em cada mão" é o de UMA mão. O app nunca converte.'
  ]);
  L.push('## No programa atual', '', ...cab, ...ordem([...noPrograma]).map(linha), '');
  const fora = ordem([...todos].filter(function (id) { return !noPrograma.has(id); }));
  if (fora.length) L.push('## Fora do programa atual', '', 'Do programa do treinador, de sessões antigas ou trocados no caminho.', '', ...cab, ...fora.map(linha), '');
  return L.join('\n');
}

function aulas(b: Base, ctx: Contexto): string | null {
  const a = lista<ModeloDeAula>(b.S.aulas);
  if (!a.length) return null;
  const L = cabeca('Modelos de aula de box', ['Prescrições salvas para reaproveitar. Guardam o que foi pedido, nunca o resultado.']);
  a.slice().sort(function (x, y) { return String(x.nome).localeCompare(String(y.nome), 'pt-BR'); }).forEach(function (m) {
    L.push('## ' + cel(m.nome), '');
    lista<ModeloDeAula['mov'][number]>(m.mov).forEach(function (v) {
      const alvo = v.u ? (v.q != null ? br(v.q) + ' ' : '') + ({ m: 'm', cal: 'cal', rep: 'reps', seg: 's' } as Record<Unidade, string>)[v.u] : (v.r || '');
      L.push('- ' + nomeEx(b, v.id) + ' — ' + v.s + ' × ' + alvo + (v.d ? ' · descanso ' + fmtDesc(v.d) : ''));
    });
    if (m.quadro) L.push('', '```', m.quadro, '```');
    L.push('');
  });
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// Nutrição

const QUANDO: Record<string, string> = { sempre: 'todo dia', treino: 'só em dia de treino', alta: 'só em dia de alta demanda' };

function planoAlimentar(b: Base, ctx: Contexto): string {
  const S = b.S;
  const comida = obj<unknown>(S.comida);
  const ajuste = numero(S.ajuste) || 0;
  const L = cabeca('Plano alimentar', [
    'O plano que o app usa hoje. Quantidades por porção; macros calculados pela tabela de alimentos (`alimentos.csv`).'
  ]);
  if (numero(comida.v)) L.push('- **Plano ou tabela alterados por último em:** ' + dataBR(comida.v as number));
  L.push('- **Ajuste calórico em vigor:** ' + (ajuste ? (ajuste > 0 ? '+' : '−') + Math.abs(ajuste) + (Math.abs(ajuste) === 1 ? ' passo' : ' passos') + ' (cada passo ≈ 150 kcal, aplicado nos itens de arroz; ver `ajustes.md`)' : 'nenhum'));
  L.push('');
  L.push('## Total do dia', '', '| Dia | Total |', '|---|---|');
  L.push('| Treino | ' + totaisTexto(totalDoDia(b.plano, b.alimentos, true, false)) + ' |');
  L.push('| Descanso | ' + totaisTexto(totalDoDia(b.plano, b.alimentos, false, false)) + ' |');
  if (b.plano.some(function (r) { return r.quando === 'alta' || lista<{ alta?: boolean }>(r.itens).some(function (i) { return i.alta; }); })) {
    L.push('| Treino de alta demanda | ' + totaisTexto(totalDoDia(b.plano, b.alimentos, true, true)) + ' |');
  }
  L.push('');
  b.plano.slice().sort(function (a, c) { return String(a.t).localeCompare(String(c.t)); }).forEach(function (r) {
    L.push('## ' + r.t + ' · ' + r.n + ' — ' + (QUANDO[r.quando] || r.quando), '');
    if (r.nota) L.push('_' + cel(r.nota) + '_', '');
    lista<Refeicao['itens'][number]>(r.itens).forEach(function (i) {
      const a = b.alimentos[i.f];
      const nome = a ? a.n : i.f;
      const u = a ? a.u : 'g';
      let q = br(i.q) + ' ' + u;
      const aj = ajusteNoItem(i);
      if (aj) q += ' (' + quantidadePrescrita(i) + ' ' + u + ' prescritos ' + (aj > 0 ? '+ ' : '− ') + Math.abs(aj) + ' ' + u + ' do ajuste)';
      const marcas: string[] = [];
      if (i.alta) marcas.push('só em dia de alta demanda');
      if (i.caf) marcas.push('cafeína');
      L.push('- ' + nome + ' — ' + q + (marcas.length ? ' · ' + marcas.join(' · ') : ''));
    });
    L.push('', 'Total: ' + totaisTexto(totalDaRefeicao(r, b.alimentos, false)), '');
  });
  return L.join('\n');
}

function alimentosCsv(b: Base): string {
  const comida = obj<unknown>(b.S.comida);
  const proprios = obj<unknown>(comida.alimentos), ocultos = obj<unknown>(comida.ocultos);
  const usados = new Set<string>();
  b.plano.forEach(function (r) { lista<{ f: string }>(r.itens).forEach(function (i) { usados.add(i.f); }); });
  const ids = Object.keys(b.alimentos).sort(function (a, c) { return String(b.alimentos[a].n).localeCompare(String(b.alimentos[c].n), 'pt-BR'); });
  return csv(['id', 'nome', 'categoria', 'unidade', 'kcal_por_100', 'proteina_por_100', 'carbo_por_100', 'gordura_por_100', 'no_plano', 'cadastrado_por_voce', 'oculto'],
    ids.map(function (k) {
      const a = b.alimentos[k];
      return [k, a.n, a.cat, a.u, a.kcal, a.p, a.c, a.g, usados.has(k) ? 1 : 0, (a.meu || (proprios[k] && !ALIMENTOS_BASE[k])) ? 1 : 0, ocultos[k] ? 1 : 0];
    }));
}

const COMO: Record<string, string> = { fora: 'fora do plano', nao: 'não comeu', nsei: 'não sabe o que comeu' };

/** Treino ou descanso num dia de comida, pela mesma autoridade do app: sessão registrada, depois o que ele disse, depois a semana típica. */
function tipoDoDia(b: Base, d: string, informado: string | null | undefined): [string, string] {
  if (b.sessoes.some(function (m) { return dataLocal(m.t) === d && !m.livre; })) return ['treino', 'sessão registrada'];
  if (informado === 'treino' || informado === 'descanso') return [informado, 'informado no dia'];
  const cad = lista<'treino' | 'descanso'>(b.S.cadencia);
  return [cadenciaPrevista(cad.length === 7 ? cad : CADENCIA_PADRAO, instanteDaData(d)), 'semana típica'];
}

function diasCsv(b: Base): string {
  const S = b.S;
  const nomes: Record<string, string> = {};
  b.plano.forEach(function (r) { nomes[r.id] = r.n; });
  const refeicoes = function (h: { done: Record<string, number>; como?: Record<string, string>; escala?: Record<string, number> }): string {
    const done = obj<number>(h.done);
    return Object.keys(done).sort(function (a, c) { return (done[a] || 0) - (done[c] || 0); }).map(function (id) {
      const notas: string[] = [];
      const como = obj<string>(h.como)[id];
      if (como && COMO[como]) notas.push(COMO[como]);
      const e = obj<number>(h.escala)[id];
      if (typeof e === 'number' && e !== 1 && como !== 'nao') notas.push('porção ' + Math.round(e * 100) + '%');
      const hora = numero(done[id]) && done[id] > 1 ? ' ' + fmtHora(done[id]) : '';
      return (nomes[id] || id) + hora + (notas.length ? ' (' + notas.join(', ') + ')' : '');
    }).join(' | ');
  };

  const linhas: Array<Array<string | number | null>> = [];
  const hist = lista<DiaComidaHist>(S.comidaHist).filter(function (h) { return h && DATA_ISO.test(h.d); });
  const datas = new Set(hist.map(function (h) { return h.d; }));
  hist.slice().sort(function (a, c) { return a.d.localeCompare(c.d); }).forEach(function (h) {
    const [tipo, origem] = tipoDoDia(b, h.d, h.cadencia);
    const t = h.tot || { kcal: 0, p: 0, c: 0, g: 0 };
    linhas.push([h.d, DIAS_CURTOS[new Date(instanteDaData(h.d)).getDay()], 'fechado', tipo, origem, h.alta ? 1 : 0, h.turno || 'manha',
      h.aderencia || 'plano', refeicoes(h), h.aguaNaoContada ? '' : h.agua, Math.round(t.kcal), Math.round(t.p), Math.round(t.c), Math.round(t.g), numero(h.aj) || 0]);
  });

  // O dia em curso ainda não tem total congelado: calcula do jeito que o app
  // mostra agora (`totalRegistrado`), e a coluna `situacao` diz que é parcial.
  const dia = S.dia as DiaComida | null | undefined;
  if (dia && DATA_ISO.test(String(dia.data)) && !datas.has(dia.data)) {
    const [tipo, origem] = tipoDoDia(b, dia.data, dia.cadencia);
    const t = totalRegistrado(b.plano, b.alimentos, Object.assign({ done: {}, escala: {} }, dia), tipo === 'treino', !!dia.alta);
    linhas.push([dia.data, DIAS_CURTOS[new Date(instanteDaData(dia.data)).getDay()], 'em andamento', tipo, origem, dia.alta ? 1 : 0, dia.turno || 'manha',
      dia.aderencia || 'plano', refeicoes(dia), dia.aguaNaoContada ? '' : dia.agua, Math.round(t.kcal), Math.round(t.p), Math.round(t.c), Math.round(t.g), numero(S.ajuste) || 0]);
  }

  return csv(['data', 'dia_da_semana', 'situacao', 'tipo_de_dia', 'tipo_de_dia_veio_de', 'alta_demanda', 'turno_do_treino',
    'como_foi_o_dia', 'refeicoes_marcadas', 'agua_copos', 'kcal', 'proteina_g', 'carbo_g', 'gordura_g', 'passos_de_ajuste'], linhas);
}

function ajustes(b: Base, ctx: Contexto): string {
  const S = b.S;
  const aj = numero(S.ajuste) || 0;
  const L = cabeca('Ajustes calóricos', [
    'Cada passo é ±150 kcal, aplicado nos itens de arroz do plano, e se acumula: depois de um ajuste, a nova ingestão vira a linha de base.',
    'Cada linha guarda o veredito que motivou o passo, com o texto inteiro.'
  ]);
  L.push('**Em vigor agora:** ' + (aj ? (aj > 0 ? '+' : '−') + Math.abs(aj) + (Math.abs(aj) === 1 ? ' passo' : ' passos') : 'nenhum passo') + '.', '');
  const h = lista<PassoDeAjuste>(S.ajusteHist).slice().sort(function (a, c) { return a.t - c.t; });
  if (!h.length) { L.push('Nenhum ajuste aconteceu ainda.', ''); return L.join('\n'); }
  h.forEach(function (p) {
    L.push('## ' + dataComDia(p.t) + ' — ' + (p.k === 'mais' ? 'mais comida' : 'menos comida') + ' (' + p.de + ' → ' + p.para + ')', '');
    if (numero(p.kde) != null && numero(p.kpara) != null) L.push('- Dia de treino: ' + milhar(p.kde!) + ' → ' + milhar(p.kpara!) + ' kcal');
    L.push('- Dias com registro de comida nos 14 anteriores: ' + p.reg);
    if (p.desfeito) L.push('- **Desfeito em ' + dataBR(p.desfeito) + '**');
    L.push('', '> ' + cel(p.p), '');
  });
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// Corpo

function medidasCsv(b: Base): string {
  const body = obj<Marca[]>(b.S.body);
  const conhecidas = MEDIDAS_DO_CORPO.map(function (m) { return m.k as string; });
  const chaves = conhecidas.concat(Object.keys(body).filter(function (k) { return conhecidas.indexOf(k) < 0; }));
  const linhas: Array<{ t: number; ordem: number; l: Array<string | number | null> }> = [];
  chaves.forEach(function (k, ordem) {
    const m = MEDIDAS_DO_CORPO.filter(function (x) { return x.k === k; })[0];
    lista<Marca>(body[k]).forEach(function (x) {
      if (!x || numero(x.t) == null || numero(x.v) == null) return;
      linhas.push({ t: x.t, ordem: ordem, l: [dataLocal(x.t), x.semHora ? '' : fmtHora(x.t), k, m ? m.n : k, x.v, m ? m.u : '', m && m.bio ? 'bioimpedância' : (m && m.dobra ? 'adipômetro' : (m && m.fita ? 'fita' : 'balança')), x.onde || ''] });
    });
  });
  linhas.sort(function (a, c) { return a.t - c.t || a.ordem - c.ordem; });
  return csv(['data', 'hora', 'medida', 'nome', 'valor', 'unidade', 'aparelho', 'onde_mediu'], linhas.map(function (x) { return x.l; }));
}

function ajusteDaFoto(f: FotoRef): string {
  const e = f.enq;
  if (!e || (Math.abs(e.r || 0) < 0.05 && Math.abs((e.z || 1) - 1) < 0.005 && Math.abs((e.cx ?? 0.5) - 0.5) < 0.005 && Math.abs((e.cy ?? 0.5) - 0.5) < 0.005)) return '';
  const p: string[] = [];
  if (Math.abs(e.r || 0) >= 0.05) p.push('giro ' + br(e.r, 1) + '°');
  if (Math.abs((e.z || 1) - 1) >= 0.005) p.push('zoom ' + br(e.z, 2) + '×');
  if (Math.abs((e.cx ?? 0.5) - 0.5) >= 0.005 || Math.abs((e.cy ?? 0.5) - 0.5) >= 0.005) p.push('recorte deslocado');
  return p.join(', ');
}

/** A câmera que tirou a foto, quando o app registrou (fotos a partir de 03/11/2026). */
const CAMERA: Record<string, string> = { app: 'do app', sistema: 'do sistema' };

/**
 * A câmera por extenso: qual, e desde 04/11 a lente (o rótulo da câmera do app
 * ou o LensModel do EXIF da do sistema), a focal equivalente e o zoom.
 */
function cameraDaFoto(f: FotoRef): string {
  const c = f.cap;
  if (!c) return '';
  const p = [CAMERA[c.via] || ''];
  if (c.lente) p.push(c.lente);
  if (numero(c.mm)) p.push(c.mm + ' mm');
  if (typeof c.zoom === 'number' && isFinite(c.zoom)) p.push('zoom ' + br(c.zoom, 2) + '×');
  if (c.origem) p.push(c.origem === 'foto' ? 'foto do sensor' : 'quadro do vídeo');
  if (c.modo) p.push(MODO[c.modo] || '');
  // apoiado ou na mão, pelo maior giro do segundo antes do toque; e o tremor
  // do instante do toque (ver infra/nivel.ts)
  if (c.mov && numero(c.mov.seg) != null) p.push(c.mov.seg < APOIADO ? 'apoiado' : 'na mão');
  if (c.mov && numero(c.mov.toque) != null && c.mov.toque > TREMOR) p.push('pode ter tremido (' + br(c.mov.toque, 1) + '°/s)');
  return p.filter(Boolean).join(' · ');
}

const MODO: Record<string, string> = { alguem: 'alguém tirou', sozinho: 'sozinho' };

/** A inclinação do celular no disparo, quando o app mediu (câmera do app, desde 04/11). */
function nivelDaFoto(f: FotoRef): string {
  const n = f.cap && f.cap.nivel;
  if (!n || numero(n.lado) == null || numero(n.frente) == null) return '';
  const txt = 'de lado ' + br(n.lado, 1) + '° · frente ' + br(n.frente, 1) + '°';
  // fora da régua: só chega aqui se quem fotografou viu o aviso e escolheu
  // registrar assim
  return noNivel(n) ? txt : txt + ' (fora do nível)';
}

function fotosDoCorpo(b: Base, ctx: Contexto): string {
  const S = b.S;
  const proto = obj<unknown>(S.protocolo);
  const ordem = poses(lista<string>(proto.poses));
  const sessoes = lista<SessaoFoto>(proto.sessoes).filter(function (s) { return s && DATA_ISO.test(String(s.d)); })
    .slice().sort(function (a, c) { return a.d.localeCompare(c.d); });

  const L = cabeca('Fotos do corpo', [
    'Uma sessão de fotos a cada ' + CADENCIA_DIAS + ' dias, sempre as mesmas poses, no mesmo lugar marcado no chão.',
    'Os arquivos são as fotos originais. Quando a coluna "Ajuste no app" tem algo, o app mostra a foto girada ou recortada, mas o arquivo não muda.',
    'A hora de cada foto importa: luz e hora do dia mudam o que a foto mostra.',
    'Desde ' + dataBR(instanteDaData(DESDE_11_POSES)) + ', o protocolo tem ' + PROTOCOLO.length + ' poses: entraram "Frente braços afastados" e "Perfil mãos na nuca", e "Costas mãos na cintura" passou a ser com as mãos só apoiadas, sem beliscar a pele (até 29/10/2026 ela virou uma pinça da dobra lombar). Cada sessão lista só as poses do protocolo da data dela: as de antes contam sobre 9.',
    'A coluna "Câmera" diz se a foto saiu da câmera do app (um quadro do vídeo, com menos processamento) ou da câmera do sistema; vazia nas fotos de antes de 03/11/2026. Desde 04/11/2026 ela traz também a lente: o nome que o aparelho dá a ela, a focal equivalente em 35 mm (26 mm é a 1×, 52 mm a 2×) e o zoom, quando o aparelho informa.',
    'Desde 04/11/2026, a câmera do app tira a foto de verdade do sensor ("foto do sensor" na coluna "Câmera"); quando ela falha, fica um quadro do vídeo ("quadro do vídeo"). A foto do sensor tem também o ORIGINAL, na resolução cheia e sem recompressão, ao lado da cópia de 1440 px: `<pose>.original.jpeg`. Ele pode trazer a orientação na etiqueta EXIF em vez de nos pixels. Só existe quando o celular tinha a conta da nuvem.',
    'A coluna "Câmera" diz também quem disparou ("alguém tirou" ou "sozinho"), se o celular estava apoiado ou na mão (pelo giroscópio, no segundo antes do toque) e quando a foto pode ter tremido (giro acima de ' + TREMOR + '°/s no toque). Só na câmera do app, desde 04/11/2026.',
    'A coluna "Nível" é a inclinação do celular no disparo, medida pelo sensor (só na câmera do app, desde 04/11/2026): de lado, no plano da tela, e para a frente ou para trás. Só o tamanho, sem o sentido. Está no nível até ' + NIVEL_LADO + '° de lado e ' + NIVEL_FRENTE + '° para a frente. Foto fora disso só é guardada quando quem fotografa vê o aviso e escolhe registrar assim, e a coluna diz "(fora do nível)".'
  ]);

  L.push('## O protocolo', '', '| Pose | Bloco | Giro | O que mostra |', '|---|---|---|---|');
  ordem.forEach(function (p) { L.push('| ' + [cel(p.n), p.bloco, p.giro + '°', cel(p.revela)].join(' | ') + ' |'); });
  L.push('');

  if (!sessoes.length) L.push('Nenhuma sessão de fotos ainda.', '');
  sessoes.forEach(function (s) {
    const fotos = obj<FotoRef>(s.fotos);
    const daData = posesDaData(s.d, lista<string>(proto.poses));
    const ids = daData.map(function (p) { return p.id; });
    Object.keys(fotos).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
    const feitas = ids.filter(function (id) { return fotos[id]; });
    L.push('## ' + dataIsoBR(s.d) + ' — ' + feitas.length + ' de ' + daData.length + ' poses', '');
    if (s.obs) L.push('Nota: ' + cel(s.obs), '');
    L.push('| Pose | Hora | Câmera | Nível | Arquivo | Ajuste no app |', '|---|---|---|---|---|---|');
    ids.forEach(function (id) {
      const p = PROTOCOLO.filter(function (x) { return x.id === id; })[0];
      const f = fotos[id];
      if (!f) { L.push('| ' + cel(p ? p.n : id) + ' | — | | | não tirada | |'); return; }
      const caminho = 'fotos/' + s.d + '/' + segmento(id) + '.' + segmento(f.ext);
      const sit = situacaoDaFoto('corpo/' + caminho, ctx);
      L.push('| ' + [cel(p ? p.n : id), numero(f.v) ? fmtHora(f.v) : '', cel(cameraDaFoto(f)), nivelDaFoto(f),
        sit ? cel(sit) : '[' + segmento(id) + '.' + segmento(f.ext) + '](' + caminho + ')', ajusteDaFoto(f)].join(' | ') + ' |');
    });
    L.push('');
  });

  const g = lista<LeituraDeGordura>(S.gordura).filter(function (x) { return x && DATA_ISO.test(String(x.d)); })
    .slice().sort(function (a, c) { return a.d.localeCompare(c.d); });
  L.push('## Gordura visual', '', 'A pergunta do nutricionista no fechamento: "comparando com 2 semanas atrás, a gordura visual aumentou claramente?"', '');
  if (!g.length) L.push('Nenhuma resposta ainda.', '');
  else {
    L.push('| Sessão | Comparada com | Aumentou claramente? | Respondido em |', '|---|---|---|---|');
    const V: Record<string, string> = { sim: 'sim', nao: 'não', incerto: 'incerto' };
    g.forEach(function (x) { L.push('| ' + [dataIsoBR(x.d), DATA_ISO.test(String(x.de)) ? dataIsoBR(x.de) : '', V[x.v] || x.v, numero(x.t) ? dataBR(x.t) : ''].join(' | ') + ' |'); });
    L.push('');
  }
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// O índice

function qtd(n: number, um: string, varios: string): string { return n + ' ' + (n === 1 ? um : varios); }

function resumo(b: Base): string[] {
  const S = b.S, L: string[] = [];
  const sess = b.sessoes;
  if (sess.length) {
    const u = sess[sess.length - 1];
    L.push('- **Treino:** ' + qtd(sess.length, 'sessão registrada', 'sessões registradas') + ', de ' + dataBR(sess[0].t) + ' a ' + dataBR(u.t) +
      '. Última: ' + dataComDia(u.t) + ', ' + (u.livre ? (u.nome || 'avulsa') : u.day + (nomeDoTreino(b, u.day) ? ' (' + nomeDoTreino(b, u.day) + ')' : '')) + '.');
  } else L.push('- **Treino:** nenhuma sessão registrada.');
  const hist = lista<DiaComidaHist>(S.comidaHist).filter(function (h) { return h && DATA_ISO.test(h.d); }).map(function (h) { return h.d; }).sort();
  L.push('- **Comida:** ' + (hist.length ? hist.length + ' dias fechados, de ' + dataIsoBR(hist[0]) + ' a ' + dataIsoBR(hist[hist.length - 1]) + '.' : 'nenhum dia fechado ainda.') +
    ' Ajuste em vigor: ' + (numero(S.ajuste) ? (S.ajuste! > 0 ? '+' : '−') + qtd(Math.abs(S.ajuste!), 'passo', 'passos') + '.' : 'nenhum.'));
  const body = obj<Marca[]>(S.body);
  const ultimas = ['peso', 'cintura', 'bioGorduraPct'].map(function (k) {
    const m = MEDIDAS_DO_CORPO.filter(function (x) { return x.k === k; })[0];
    const l = lista<Marca>(body[k]).filter(function (x) { return x && numero(x.t) != null && numero(x.v) != null; }).sort(function (a, c) { return a.t - c.t; });
    const x = l[l.length - 1];
    return x && m ? m.n + ' ' + br(x.v, 2) + ' ' + m.u + ' em ' + dataBR(x.t) : null;
  }).filter(Boolean);
  L.push('- **Corpo:** ' + (ultimas.length ? 'última medida de ' + ultimas.join('; ') + '.' : 'nenhuma medida ainda.'));
  const fs = lista<SessaoFoto>(obj<unknown>(S.protocolo).sessoes).filter(function (s) { return s && DATA_ISO.test(String(s.d)); }).map(function (s) { return s.d; }).sort();
  L.push('- **Fotos do corpo:** ' + (fs.length ? qtd(fs.length, 'sessão', 'sessões') + ', a última em ' + dataIsoBR(fs[fs.length - 1]) + '.' : 'nenhuma sessão ainda.'));
  return L;
}

const MAPA: Array<[string, string]> = [
  ['treino/programa.md', 'O programa que o app executa hoje: rotação, exercícios, séries, repetições, RIR e descanso.'],
  ['treino/programa-do-treinador.md', 'O programa como o treinador prescreveu. O atual pode ter divergido dele.'],
  ['treino/mudancas.md', 'Decisões registradas sobre o programa, e as mudanças que esperam decisão.'],
  ['treino/historico/AAAA-MM.md', 'Um arquivo por mês: cada sessão, exercício por exercício, série por série, com notas, dor, cardio e descanso.'],
  ['treino/series.csv', 'Todas as séries numa tabela só, para calcular tendência, volume e carga.'],
  ['treino/cardio.csv', 'As sessões de cardio.'],
  ['treino/exercicios.md', 'Cada exercício: grupo muscular, como a carga é digitada, quantas sessões, foto do aparelho.'],
  ['treino/aulas-de-box.md', 'Os modelos de aula de box salvos (só existe se houver algum).'],
  ['treino/aparelhos/', 'Fotos dos aparelhos da academia, pelo id do exercício.'],
  ['nutricao/plano.md', 'O plano alimentar: refeições, horários, itens, quantidades e totais.'],
  ['nutricao/dias.csv', 'Um dia por linha: refeições marcadas e a hora de cada uma, água, como foi o dia, totais.'],
  ['nutricao/ajustes.md', 'Cada ajuste calórico que aconteceu, com o veredito que o motivou.'],
  ['nutricao/alimentos.csv', 'A tabela de alimentos: macros por 100 g ou 100 ml.'],
  ['corpo/medidas.csv', 'Peso, bioimpedância, medidas com fita e dobras com adipômetro, uma medida por linha.'],
  ['corpo/fotos.md', 'O protocolo de fotos (11 poses desde 06/11/2026; antes, 9), cada sessão com a hora de cada foto, e as respostas sobre gordura visual.'],
  ['corpo/fotos/AAAA-MM-DD/', 'As fotos de cada sessão, uma por pose.'],
  ['bruto/estado.json', 'O estado inteiro do app, sem tratamento. Para o que não coube nos arquivos acima.']
];

function leiaMe(b: Base, ctx: Contexto, existentes: Set<string>): string {
  const L = ['# Lastro — seus dados', ''];
  L.push('Cópia de leitura dos dados do app Lastro, organizada por assunto para ser lida por pessoas e por agentes (treinador, nutricionista).', '');
  L.push('- **Atualizada em:** ' + momento(ctx.agora));
  if (ctx.gravadoEm) L.push('- **Dados gravados na nuvem pela última vez em:** ' + momento(ctx.gravadoEm) + ' (o que foi registrado no celular depois disso só aparece após sincronizar lá e atualizar aqui)');
  if (ctx.origem) L.push('- **Veio de:** ' + ctx.origem);
  if (ctx.conta) L.push('- **Conta:** ' + ctx.conta);
  if (numero(b.S.plano)) L.push('- **Versão do formato dos dados:** ' + b.S.plano);
  L.push('', '> Esta pasta é gerada. Não edite nada aqui dentro: a próxima atualização sobrescreve. Para guardar anotações suas, use outra pasta.', '');

  L.push('## Resumo', '', ...resumo(b), '');

  L.push('## O que tem aqui', '', '| Caminho | O que responde |', '|---|---|');
  MAPA.forEach(function (x) {
    // Pasta ou padrão (`AAAA-MM`) entra quando há ao menos um arquivo dentro;
    // arquivo, quando existe. O índice não promete o que a pasta não tem.
    const corte = x[0].indexOf('AAAA');
    const prefixo = corte >= 0 ? x[0].slice(0, corte) : (x[0].slice(-1) === '/' ? x[0] : null);
    const presente = prefixo
      ? Array.from(existentes).some(function (c) { return c.indexOf(prefixo) === 0; })
      : existentes.has(x[0]);
    if (presente) L.push('| `' + x[0] + '` | ' + x[1] + ' |');
  });
  L.push('');

  L.push('## Como ler', '');
  L.push('- **Datas e horas** estão no fuso deste computador. Nos CSV, datas no formato AAAA-MM-DD.');
  L.push('- **CSV:** vírgula separa os campos, ponto separa os decimais, UTF-8. A primeira linha é o cabeçalho.');
  L.push('- **Série de musculação:** `carga × repetições (RIR n)`. RIR é quantas repetições sobraram antes da falha. Séries antigas podem não ter RIR.');
  L.push('- **Carga:** é o número digitado, sem conversão. "kg/lado" é o peso de UM lado (sem a barra); em halteres, o de UMA mão; "+kg" é o que foi somado ao peso do corpo; "ajuda" é o contrapeso da máquina assistida (menos é mais força). Ver `treino/exercicios.md`.');
  L.push('- **Movimentos medidos por distância ou caloria** (remo, corrida, sled): o resultado é o TEMPO, e menos é melhor. Por repetição ou tempo (wall ball, prancha): o resultado é QUANTO saiu, e mais é melhor.');
  L.push('- **Hora do treino** só aparece quando é confiável (sessão lançada depois sem hora informada fica sem).');
  L.push('- **Totais de comida** de dias fechados foram congelados no fechamento, contra o plano daquela data: mudar o plano depois não reescreve o passado. Refeição marcada "fora do plano" ou "não sabe" entra com os números do plano; "não comeu" não entra.');
  L.push('- **Água** em copos; vazio quando ele marcou que não contou (é diferente de zero).');
  L.push('- **Medidas com fita** (`medidas.csv`): quando a medida é de um lado só, é sempre o direito. `onde_mediu` é o ponto onde a fita passou; o app preenche com o ponto padrão de cada medida, e a pessoa pode trocar.');
  L.push('- **Dobras** (`dobraAbdominal`, `dobraSuprailiaca`, `dobraCoxa`): adipômetro, lado direito, em mm. O valor é a leitura do meio de três. Nunca convertidas para percentual de gordura.');
  L.push('- **Hora vazia** em `medidas.csv` quer dizer que a hora não foi informada (leitura lançada depois, só com a data).');
  L.push('- **Peso** (`peso`) é a pesagem da manhã na balança comum; `bioPeso` é o da balança de bioimpedância. São aparelhos e horários diferentes, e nenhum corrige o outro.');
  L.push('');

  L.push('## O que não está aqui', '');
  L.push('- A foto da lousa das aulas de box: fica só no aparelho onde foi tirada.');
  L.push('- O que foi registrado num aparelho que ainda não sincronizou.');
  if (ctx.semDownload) L.push('- **As fotos:** esta pasta foi gerada a partir de um arquivo de cópia, que não leva fotos. Atualize pela conta para baixá-las.');
  L.push('');
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// A montagem

/**
 * O estado inteiro vira a pasta, menos as fotos (que são bytes, e vêm da rede).
 *
 * Determinístico para o mesmo estado e o mesmo `agora`: é o que deixa o
 * espelho reescrever só o arquivo que mudou de verdade.
 */
export function montaArquivos(estado: unknown, ctx: Contexto): Arquivos {
  const S = obj<unknown>(estado) as Partial<Estado>;
  const b = base(S);

  const corpo: Arquivos = {
    'treino/programa.md': programaAtual(b, ctx),
    'treino/programa-do-treinador.md': programaDoTreinador(b, ctx),
    'treino/mudancas.md': mudancas(b, ctx),
    ...historicoPorMes(b, ctx),
    'treino/series.csv': seriesCsv(b),
    'treino/cardio.csv': cardioCsv(b),
    'treino/exercicios.md': exercicios(b, ctx)
  };
  const a = aulas(b, ctx);
  if (a) corpo['treino/aulas-de-box.md'] = a;
  Object.assign(corpo, {
    'nutricao/plano.md': planoAlimentar(b, ctx),
    'nutricao/dias.csv': diasCsv(b),
    'nutricao/ajustes.md': ajustes(b, ctx),
    'nutricao/alimentos.csv': alimentosCsv(b),
    'corpo/medidas.csv': medidasCsv(b),
    'corpo/fotos.md': fotosDoCorpo(b, ctx),
    'bruto/estado.json': JSON.stringify(S, null, 2) + '\n'
  });

  const existentes = new Set(Object.keys(corpo).concat(fotosDoEstado(S).map(function (f) { return f.caminho; })));
  const r: Arquivos = { 'LEIA-ME.md': leiaMe(b, ctx, existentes) };
  return Object.assign(r, corpo);
}
