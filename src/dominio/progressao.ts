// Histórico de um exercício e as regras que decidem quando subir carga.
//
// O app existe em boa parte para FREAR a progressão: músculo fica forte mais
// rápido do que tendão consegue se adaptar. As regras daqui são o freio, e por
// isso valem mais como função pura testável do que como trecho de render.

import { temUnidade, topReps } from './carga';
import type { Exercicio, IdEx, Log, Serie } from './tipos';

const DIA = 86400000;

/** Dias sem treinar a partir dos quais o selo de subir carga fica suspenso. */
export const PAUSA_DIAS = 14;

export function diasDesde(t: number, agora: number = Date.now()): number {
  return (agora - t) / DIA;
}

/**
 * O histórico de um exercício EXCLUINDO a sessão aberta. Sem isso a sessão em
 * andamento viraria referência de si mesma e o placeholder mostraria o que
 * você acabou de digitar.
 */
export function historico(
  logs: Record<IdEx, Log[]>,
  key: IdEx,
  sessaoAberta?: { sid: number } | null
): Log[] {
  const h = logs[key] || [];
  return sessaoAberta ? h.filter(function (x) { return x.sid !== sessaoAberta.sid; }) : h;
}

/**
 * Placeholder daquela série: o valor mais recente registrado naquela posição.
 * Anda para trás no histórico porque a última sessão pode ter menos séries.
 */
export function lastSet(h: Log[], k: number): Serie {
  for (let j = h.length - 1; j >= 0; j--) if (h[j].sets && h[j].sets[k]) return h[j].sets[k];
  return null;
}

/** Dias desde a última vez que este exercício foi registrado. */
export function pausaEx(h: Log[], agora: number = Date.now()): number {
  return h.length ? diasDesde(h[h.length - 1].t, agora) : 0;
}

/** Dor marcada nas duas últimas sessões do mesmo exercício. */
export function dorSeguida(h: Log[]): string[] | null {
  if (h.length < 2) return null;
  const a = h[h.length - 1], b = h[h.length - 2];
  if (!a.dor || !a.dor.length || !b.dor || !b.dor.length) return null;
  const comum = a.dor.filter(x => b.dor!.indexOf(x) >= 0);
  return comum.length ? comum : null;
}

/**
 * Dupla progressão: só sobe carga quando TODAS as séries bateram o topo da
 * faixa de repetição. Devolve false voltando de pausa longa — o corpo perdeu
 * adaptação e repetir a última carga já é o trabalho da volta.
 */
export function shouldUp(
  ultimo: Log | null,
  ex: Partial<Exercicio> & { s: number; r: string },
  pausaDias: number
): boolean {
  if (temUnidade(ex)) return false;             // movimento com grandeza própria não ganha selo de carga
  if (pausaDias >= PAUSA_DIAS) return false;    // voltando de pausa longa
  if (!ultimo || ultimo.sets.length < ex.s) return false;
  const t = topReps(ex.r);
  return ultimo.sets.every(s => s && s[1] >= t && s[0] > 0);
}

/** Deload corta as séries pela metade, sem tocar na carga. */
export function setsFor(ex: { s: number }, deload: boolean): number {
  return deload ? Math.ceil(ex.s / 2) : ex.s;
}

/**
 * PARA QUANTO SUBIR, quando `shouldUp` diz que é hora (direção 3, a pergunta
 * "subir para X?" na série). O menor passo que a academia oferece em cada
 * tipo de carga: 1,25 kg por lado (2,5 no total) na anilha e na barra, o
 * halter seguinte (2 kg), e 2,5 kg na placa e no resto. Peso do corpo não
 * sobe por carga. Regra de partida, a revisar com o dono.
 */
export function proximaCarga(carga: number | null | undefined, tipo: string): number | null {
  if (typeof carga !== 'number' || !isFinite(carga) || carga <= 0) return null;
  if (tipo === 'corpo') return null;
  const passo = tipo === 'lado' || tipo === 'barra' ? 1.25 : tipo === 'halter' ? 2 : 2.5;
  return Math.round((carga + passo) * 100) / 100;
}
