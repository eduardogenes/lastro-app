// Séries por músculo: o alvo do treinador, o que o programa prescreve hoje e o
// que foi de fato registrado.
//
// A contagem é de SÉRIES DIRETAS. Tríceps também trabalha nos supinos, bíceps
// nas puxadas, glúteo no terra e no leg press — apresentar série direta como
// estímulo total foi a falha metodológica que o treinador apontou, e a
// interface diz isso em voz alta.
//
// Nada aqui lê estado: quem chama entrega os treinos já resolvidos e uma função
// que diz a que músculo um id pertence. É o que permite testar o alvo, o
// impacto e a atribuição por exercício sem subir o app.

import { weekStart } from './formato';
import type { Dia, IdEx, Log, Treino } from './tipos';

/** Um exercício, na medida em que o volume se importa com ele. */
interface ComGrupoESeries { g: string; s: number; }

/**
 * Alvo por músculo, calculado do programa — nunca transcrito. Transcrever
 * seria criar uma segunda fonte de verdade que sai de sincronia na primeira
 * vez que o programa mudar.
 */
export function alvoDoPrograma(
  programa: Record<Dia, Treino<ComGrupoESeries>>,
  rotacao: Dia[]
): Record<string, number> {
  const a: Record<string, number> = {};
  rotacao.forEach(function (d) {
    programa[d].ex.forEach(function (ex) { a[ex.g] = (a[ex.g] || 0) + ex.s; });
  });
  return a;
}

/** Séries diretas de um músculo somadas ao longo de uma lista de treinos. */
export function seriesDeGrupo(treinos: Array<Treino<ComGrupoESeries> | null>, g: string): number {
  let n = 0;
  treinos.forEach(function (t) {
    if (t) t.ex.forEach(function (ex) { if (ex.g === g) n += ex.s; });
  });
  return n;
}

export interface Impacto { txt: string; acima: 0 | 1; }

/** Como o número atual se lê contra o que o treinador prescreveu. */
export function impacto(g: string, agora: number, alvo: number | undefined): Impacto {
  if (alvo == null) return { txt: g + ': ' + agora + ' séries na rotação', acima: 0 };
  if (agora === alvo) return { txt: g + ': ' + agora + ' na rotação · igual ao treinador', acima: 0 };
  return {
    txt: g + ': ' + agora + ' na rotação · o treinador prescreveu ' + alvo,
    acima: agora > alvo ? 1 : 0
  };
}

/**
 * Séries efetivamente REGISTRADAS por músculo num período. Mede adesão ao
 * programa que já existe; não propõe dose nenhuma.
 *
 * O músculo vem do exercício registrado, não da posição onde ele estava
 * prescrito: trocar elevação lateral por um aparelho de peito conta em peito,
 * que é onde o trabalho aconteceu. É o que faz substituto, exercício adicionado
 * no dia e equipamento cadastrado por ele contarem no lugar certo.
 *
 * `corte` limita as semanas passadas ao mesmo ponto da semana em que estamos.
 * Sem isso, numa terça-feira o painel inteiro apareceria despencando contra
 * semanas cheias, e o número não significaria nada.
 */
export function seriesPorMusculo(
  logs: Record<IdEx, Log[]>,
  grupoDe: (k: IdEx) => string,
  de: number,
  ate: number,
  corte?: number | null
): Record<string, number> {
  const acc: Record<string, number> = {};
  Object.keys(logs).forEach(function (k) {
    const g = grupoDe(k);
    if (!g) return;
    (logs[k] || []).forEach(function (e) {
      if (e.t < de || e.t >= ate) return;
      if (corte != null && (e.t - weekStart(e.t)) > corte) return;
      acc[g] = (acc[g] || 0) + e.sets.filter(Boolean).length;
    });
  });
  return acc;
}
