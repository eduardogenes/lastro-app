// Ler uma aula de box escrita fora do app.
//
// O formato e o porquê dele estão em docs/AULA-IMPORTACAO.md. Aqui está só a
// leitura: texto entra, aula sai — ou uma recusa com motivo.
//
// Duas regras governam tudo:
//
// **Movimento desconhecido sem declaração é RECUSA, não palpite.** O arquivo
// pode cadastrar (`novo`), e aí diz tipo de carregamento e grandeza como quem
// cadastra na mão. O que ele não pode é citar um nome que o app nunca viu e
// deixar o app decidir o que aquilo mede — um burpee virando série de peito no
// painel de volume é o tipo de erro que ninguém percebe.
//
// **O catálogo vence o arquivo.** Se o movimento já existe, `novo` é ignorado
// com aviso. Senão um arquivo colado mudaria a grandeza de um exercício com
// meses de histórico, e duas séries históricas viariam uma só, torta.

import { slugEx } from './programa';
import type { IdEx, Unidade } from './tipos';

export const UNIDADES: Unidade[] = ['seg', 'm', 'cal', 'rep'];
/**
 * Os tipos de carregamento que um cadastro pode declarar.
 *
 * Não se chama `CARGAS` porque `programa.ts` já exporta esse nome, e o bundle
 * põe os dois no mesmo escopo — o harness de fluxo lê expressões ali dentro, e
 * a colisão fez um teste de catálogo passar a ler este array em silêncio.
 */
export const CARREGAMENTOS = ['pino', 'lado', 'barra', 'halter', 'halter1', 'corpo', 'assist'];

/** Um movimento que o arquivo pediu para cadastrar. */
export interface MovimentoNovo {
  id: IdEx;
  n: string;
  car: string;
  u?: Unidade;
  q?: number;
}

export interface AulaLida {
  nome: string;
  /** 'AAAA-MM-DD'. Ausente quando o arquivo não disse a que dia pertence. */
  data?: string;
  /** a lousa transcrita, literal */
  quadro?: string;
  mov: Array<{ id: IdEx; s: number; d?: number; u?: Unidade; q?: number }>;
  novos: MovimentoNovo[];
}

export interface Leitura {
  ok: boolean;
  aula?: AulaLida;
  /** o motivo da recusa, em português, pronto para a tela */
  erro?: string;
  /** o que passou mas merece ser dito */
  avisos: string[];
}

const recusa = (erro: string): Leitura => ({ ok: false, erro, avisos: [] });

function ehData(s: unknown): boolean {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Lê o texto de uma aula.
 *
 * `conhecido` responde se um id já existe no catálogo. Entra como função para
 * esta leitura continuar pura: o catálogo mora no casco, e arrastá-lo para cá
 * custaria a testabilidade que é o motivo de o módulo existir.
 */
export function leAula(texto: string, conhecido: (id: IdEx) => boolean): Leitura {
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(String(texto || ''));
  } catch (e) {
    return recusa('JSON inválido. Confira se copiou o arquivo inteiro.');
  }
  if (!o || typeof o !== 'object') return recusa('JSON inválido.');
  if (o.lastro !== 'aula') return recusa('Isto não é uma aula deste app.');

  const avisos: string[] = [];
  const v = typeof o.v === 'number' ? o.v : 1;
  if (v > 1) avisos.push('O arquivo diz versão ' + v + ', e este app lê a 1. Confira o resultado.');

  const nome = typeof o.nome === 'string' ? o.nome.trim() : '';
  if (!nome) return recusa('A aula precisa de um nome.');

  if (o.data != null && !ehData(o.data)) return recusa('A data precisa ser AAAA-MM-DD.');

  const lista = Array.isArray(o.mov) ? o.mov : null;
  if (!lista || !lista.length) return recusa('A aula não tem movimento nenhum.');

  const mov: AulaLida['mov'] = [];
  const novos: MovimentoNovo[] = [];
  const declarados: Record<string, 1> = {};

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i] as Record<string, unknown>;
    const onde = 'movimento ' + (i + 1);
    if (!m || typeof m !== 'object') return recusa(onde + ': linha vazia.');

    const n = typeof m.n === 'string' ? m.n.trim() : '';
    if (!n) return recusa(onde + ': falta o nome.');
    const id = slugEx(n);
    if (!id) return recusa(onde + ': o nome "' + n + '" não vira identificador.');

    const u = m.u == null ? undefined : (m.u as Unidade);
    if (u != null && UNIDADES.indexOf(u) < 0) {
      return recusa(onde + ' (' + n + '): grandeza "' + String(u) + '" não existe. São ' + UNIDADES.join(', ') + '.');
    }

    const q = m.q == null ? undefined : Number(m.q);
    if (q != null && (!isFinite(q) || q <= 0)) return recusa(onde + ' (' + n + '): quantidade inválida.');
    if (q != null && u == null) return recusa(onde + ' (' + n + '): tem quantidade mas não diz em que grandeza.');

    const s = m.s == null ? 1 : Number(m.s);
    if (!isFinite(s) || s < 1 || s !== Math.round(s)) return recusa(onde + ' (' + n + '): número de passadas inválido.');

    const d = m.d == null ? undefined : Number(m.d);
    if (d != null && (!isFinite(d) || d < 0)) return recusa(onde + ' (' + n + '): descanso inválido.');

    const noCatalogo = conhecido(id);
    // Declarado numa linha anterior DESTA leitura já basta: a corrida aparece
    // três vezes com distâncias diferentes, e exigir `novo` em cada uma faria
    // o arquivo repetir o cadastro para dizer a mesma coisa.
    const jaDeclarado = !!declarados[id];
    const novo = m.novo as Record<string, unknown> | undefined;

    if (noCatalogo && novo) {
      avisos.push('"' + n + '" já existe no catálogo; o cadastro do arquivo foi ignorado.');
    } else if (!noCatalogo && !jaDeclarado) {
      if (!novo || typeof novo !== 'object') {
        return recusa('"' + n + '" não existe no catálogo. Para entrar, o arquivo precisa declará-lo em "novo".');
      }
      const car = typeof novo.car === 'string' ? novo.car : '';
      if (CARREGAMENTOS.indexOf(car) < 0) {
        return recusa('"' + n + '": tipo de carregamento "' + String(novo.car) + '" não existe. São ' + CARREGAMENTOS.join(', ') + '.');
      }
      const un = novo.u == null ? undefined : (novo.u as Unidade);
      if (un != null && UNIDADES.indexOf(un) < 0) {
        return recusa('"' + n + '": grandeza "' + String(novo.u) + '" não existe.');
      }
      const nq = novo.q == null ? undefined : Number(novo.q);
      if (nq != null && (!isFinite(nq) || nq <= 0)) return recusa('"' + n + '": quantidade padrão inválida.');

      declarados[id] = 1;
      const reg: MovimentoNovo = { id: id, n: n, car: car };
      if (un != null) reg.u = un;
      if (nq != null) reg.q = nq;
      novos.push(reg);
    }

    const linha: AulaLida['mov'][number] = { id: id, s: s };
    if (d != null) linha.d = d;
    if (u != null) linha.u = u;
    if (q != null) linha.q = q;
    mov.push(linha);
  }

  const aula: AulaLida = { nome: nome, mov: mov, novos: novos };
  if (ehData(o.data)) aula.data = o.data as string;
  if (typeof o.quadro === 'string' && o.quadro.trim()) aula.quadro = o.quadro;

  return { ok: true, aula: aula, avisos: avisos };
}
