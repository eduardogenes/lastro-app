// Força estimada — o número que faz o treino ALIMENTAR a nutrição.
//
// Antes da fusão, `performance` era um interruptor que ele ligava na mão para
// dizer "estou ficando mais forte", e a regra calórica lia esse interruptor.
// Perguntar isso é estranho: o app já tem todas as cargas registradas. Agora
// ele calcula, e o interruptor vira override — porque o cálculo pode estar
// cego (voltou de pausa, trocou de exercício, semana de deload) e nesses casos
// quem sabe é ele.
//
// A conta é Epley: 1RM ≈ carga × (1 + reps/30). É estimativa, e o app fala
// dela como estimativa em todo lugar. Serve para comparar consigo mesma ao
// longo das semanas, não para prescrever um número de barra.

import { isTime } from './carga';
import type { Estado, IdEx, Log } from './tipos';

const DIA = 86400000;

/** e1RM de uma série pela fórmula de Epley. */
export function e1rmDaSerie(carga: number, reps: number): number {
  if (!(carga > 0) || !(reps > 0)) return 0;
  return carga * (1 + reps / 30);
}

/** O melhor e1RM de uma entrada de histórico. */
export function e1rmDoLog(l: Log): number {
  if (l.u === 'seg') return 0;   // exercício por tempo não tem carga máxima
  return l.sets.reduce((m, s) => (s ? Math.max(m, e1rmDaSerie(s[0], s[1])) : m), 0);
}

export interface Tendencia {
  /** média de e1RM na janela recente */
  agora: number;
  /** média na janela anterior */
  antes: number;
  /** variação relativa; 0.02 = 2% */
  delta: number;
  /** quantos exercícios entraram na conta dos dois lados */
  base: number;
  /** false quando não há histórico suficiente para concluir nada */
  ok: boolean;
  /** true quando está subindo o bastante para valer como sinal */
  subindo: boolean;
}

/**
 * A força está subindo?
 *
 * Compara a média de e1RM das últimas 2 semanas com a das 2 anteriores, por
 * EXERCÍCIO, e só considera exercício presente nas duas janelas — senão trocar
 * de aparelho apareceria como queda de força, que é falso.
 *
 * O limiar é 1%: abaixo disso é ruído de arredondamento de anilha, e um sinal
 * que dispara com ruído faria a regra calórica oscilar toda semana.
 */
export function tendenciaDeForca(
  logs: Record<IdEx, Log[]>,
  ehTempo: (k: IdEx) => boolean,
  agora: number = Date.now()
): Tendencia {
  const fimRecente = agora, iniRecente = agora - 14 * DIA;
  const fimAntes = iniRecente, iniAntes = agora - 28 * DIA;

  let somaAgora = 0, somaAntes = 0, base = 0;

  Object.keys(logs).forEach(k => {
    if (ehTempo(k)) return;
    const h = logs[k] || [];
    const janela = (de: number, ate: number) => {
      const v = h.filter(e => e.t >= de && e.t < ate).map(e1rmDoLog).filter(x => x > 0);
      return v.length ? Math.max(...v) : null;
    };
    const a = janela(iniRecente, fimRecente);
    const b = janela(iniAntes, fimAntes);
    if (a == null || b == null) return;   // sem os dois lados não dá para comparar
    somaAgora += a;
    somaAntes += b;
    base++;
  });

  if (base < 3 || somaAntes <= 0) {
    return { agora: somaAgora, antes: somaAntes, delta: 0, base, ok: false, subindo: false };
  }

  const delta = (somaAgora - somaAntes) / somaAntes;
  return {
    agora: somaAgora, antes: somaAntes, delta, base, ok: true,
    subindo: delta >= 0.01
  };
}

/**
 * O sinal que a regra calórica consome. `manual` vence quando existe — o
 * cálculo não sabe que ele voltou de duas semanas doente.
 */
export function performance(t: Tendencia, manual: boolean | null): boolean {
  return manual == null ? t.subindo : manual;
}

/** Ajuda a interface a dizer de onde o sinal veio, sem inventar certeza. */
export function textoDaTendencia(t: Tendencia, manual: boolean | null): string {
  if (manual != null) return 'definido na mão';
  if (!t.ok) return 'coletando · faltam 4 semanas de carga em 3 exercícios';
  const pct = (Math.abs(t.delta) * 100).toFixed(1).replace('.', ',');
  const dir = t.delta >= 0 ? 'subindo' : 'caindo';
  return `e1rm ${dir} ${pct}% em 2 semanas · ${t.base} exercícios`;
}

/** Melhor e1RM de um exercício, para a tela de histórico. */
export function melhorE1rm(h: Log[]): number {
  return h.reduce((m, l) => Math.max(m, e1rmDoLog(l)), 0);
}

/** Série de e1RM por semana, para a sparkline. */
export function e1rmPorSemana(
  h: Log[],
  inicioDaSemana: (t: number) => number,
  semanas: number,
  agora: number = Date.now()
): Array<number | null> {
  const base = inicioDaSemana(agora);
  const saida: Array<number | null> = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const de = base - i * 7 * DIA, ate = de + 7 * DIA;
    const v = h.filter(l => l.t >= de && l.t < ate).map(e1rmDoLog).filter(x => x > 0);
    saida.push(v.length ? Math.round(Math.max(...v)) : null);
  }
  return saida;
}
