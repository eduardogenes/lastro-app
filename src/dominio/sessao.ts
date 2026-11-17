// A sessão em andamento: qual exercício vem agora.
//
// Duas perguntas parecidas, e confundi-las dá comportamento errado:
//
//   "Voltei de outra aba, onde eu estava?"  → `ondeEleEstava`
//   "Acabei este, qual abre agora?"         → `proximoDepois`
//
// A primeira olha a sessão inteira e prefere o exercício COMEÇADO, porque é
// onde ele literalmente parou. A segunda só olha para a frente: ao terminar o
// terceiro, abrir o primeiro porque ficou para trás seria reordenar o treino
// no meio da sessão, e a ordem é do treinador.
//
// Pulado nunca é pendente. Pular é decisão declarada — a máquina estava
// ocupada, o ombro doeu — e voltar a oferecer o que ele recusou é o app
// discutindo com quem está na academia.

export type EstadoEx = 'feito' | 'parcial' | 'pulado' | 'nada';

/** Pendente é o que não foi feito nem recusado. */
export function pendente(e: EstadoEx): boolean {
  return e === 'parcial' || e === 'nada';
}

/** O primeiro índice, a partir de `de`, que satisfaz o teste. */
function primeiro(estados: EstadoEx[], de: number, teste: (e: EstadoEx) => boolean): number | null {
  for (let i = Math.max(0, de); i < estados.length; i++) {
    if (teste(estados[i])) return i;
  }
  return null;
}

/**
 * Onde ele estava, para o atalho de voltar ao treino.
 *
 * Prefere o exercício COMEÇADO e não terminado: séries registradas são a
 * prova de onde ele parou, e vale mais que a ordem do programa. Só quando não
 * há nenhum começado é que cai no primeiro não tocado.
 *
 * `null` quando não há nada pendente — a sessão acabou em tudo menos no nome,
 * e quem decide encerrar é ele.
 */
export function ondeEleEstava(estados: EstadoEx[]): number | null {
  const comecado = primeiro(estados, 0, e => e === 'parcial');
  if (comecado != null) return comecado;
  return primeiro(estados, 0, e => e === 'nada');
}

/**
 * O que abre depois de terminar o de índice `i`.
 *
 * Só para a frente, e sem dar a volta: chegar ao fim da lista é informação —
 * quer dizer que o que sobrou ficou para trás de propósito, e quem decide o
 * que fazer com isso é a tela de finalizar, não um salto automático.
 */
export function proximoDepois(estados: EstadoEx[], i: number): number | null {
  return primeiro(estados, i + 1, pendente);
}

/**
 * O INTERVALO LONGO (direção 3): passou tempo demais desde a última série
 * para ser descanso. É quando o app pergunta se ele fez séries sem anotar
 * ("Já fiz mais do que anotei") ou só parou. O limite é três vezes o descanso
 * do exercício em foco, e nunca menos de seis minutos: a máquina ocupada e a
 * água no meio não viram pergunta.
 */
export const FATOR_DO_INTERVALO = 3;
export const INTERVALO_MINIMO = 6 * 60 * 1000;
export function limiteDoIntervalo(descansoSeg: number): number {
  const d = typeof descansoSeg === 'number' && isFinite(descansoSeg) && descansoSeg > 0 ? descansoSeg * 1000 : 0;
  return Math.max(INTERVALO_MINIMO, d * FATOR_DO_INTERVALO);
}
export function intervaloLongo(ultimaSerie: number | null | undefined, agora: number, descansoSeg: number): boolean {
  if (typeof ultimaSerie !== 'number' || !isFinite(ultimaSerie)) return false;
  return agora - ultimaSerie > limiteDoIntervalo(descansoSeg);
}
