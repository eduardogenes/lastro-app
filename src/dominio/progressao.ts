// Histórico de um exercício e as regras que decidem quando subir carga.
//
// O app existe em boa parte para FREAR a progressão: músculo fica forte mais
// rápido do que tendão consegue se adaptar. As regras daqui são o freio, e por
// isso valem mais como função pura testável do que como trecho de render.

import { maxLoad, repsOf, temUnidade, topReps } from './carga';
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
 * O histórico que serve de REFERÊNCIA de carga (sugestão, "da última vez",
 * valor sugerido nas séries). Antes de 24/11/2026, marcar "como o prescrito"
 * gravava carga 0 nas séries; num exercício que tem carga, essa entrada não diz
 * nada sobre o peso e puxava a referência para zero. Ela continua no histórico
 * (nada é apagado) e conta como treino feito; só não serve de referência.
 * Sem carga própria (peso do corpo, assistida, cardio por tempo) zero é valor.
 */
export function historicoDeReferencia(h: Log[], temCarga: boolean): Log[] {
  if (!temCarga) return h;
  return h.filter(function (l) {
    const feitas = (l.sets || []).filter(Boolean) as Array<[number, number, number?]>;
    return !feitas.length || feitas.some(function (x) { return +x[0] > 0; });
  });
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
 * sobe por carga. Aprovada pelo dono em 17/11/2026.
 */
export function proximaCarga(carga: number | null | undefined, tipo: string): number | null {
  if (typeof carga !== 'number' || !isFinite(carga) || carga <= 0) return null;
  if (tipo === 'corpo') return null;
  const passo = tipo === 'lado' || tipo === 'barra' ? 1.25 : tipo === 'halter' ? 2 : 2.5;
  return Math.round((carga + passo) * 100) / 100;
}

/**
 * A PROGRESSÃO de um exercício, para a tela que agrupa (direção 3):
 * - `subir`: a última sessão bateu o topo da faixa em todas as séries (`shouldUp`);
 * - `parado`: as três últimas sessões com a mesma carga e as mesmas repetições;
 * - `rep`: ganhando repetição, e quanto falta em cada série para chegar ao topo.
 * A regra é a do treinador: primeiro repetição até o topo, depois carga.
 * Movimento com grandeza própria (metro, caloria, segundo) e exercício sem
 * histórico ficam de fora (`null`).
 */
export type EstadoDaProgressao =
  | { k: 'subir' }
  | { k: 'parado' }
  | { k: 'rep'; falta: Array<[number, number]> };
export function estadoDaProgressao(
  h: Log[], ex: Partial<Exercicio> & { s: number; r: string }, pausaDias: number
): EstadoDaProgressao | null {
  if (temUnidade(ex) || !h || !h.length) return null;
  const u = h[h.length - 1];
  if (!u || !Array.isArray(u.sets) || !u.sets.some(Boolean)) return null;
  if (shouldUp(u, ex, pausaDias)) return { k: 'subir' };
  const tres = h.slice(-3);
  if (tres.length === 3 && tres.every(function (l) { return maxLoad(l) === maxLoad(u) && repsOf(l) === repsOf(u); })) return { k: 'parado' };
  const topo = topReps(ex.r);
  const falta: Array<[number, number]> = [];
  for (let k = 0; k < ex.s; k++) {
    const s = u.sets[k];
    const r = s ? s[1] : 0;
    if (isFinite(topo) && r < topo) falta.push([k + 1, topo - r]);
  }
  return { k: 'rep', falta: falta };
}
