// Prescrição: o que vem de fora, mais o que ele decide manter.
//
// Esta primeira peça é o VENCIMENTO da mudança do dia. A decisão do dono é que
// a mudança vence POR POSIÇÃO — "quando aquele treino voltar" (5.a' P1) — e não
// por prazo em dias. A razão é de uso: decidir se uma mudança fica no programa
// se faz quando aquele dia está de novo na frente, não numa quarta-feira
// qualquer em que ele lembrou.
//
// Nada aqui lê estado nem relógio: quem chama entrega a rotação, a letra do
// próximo treino e o padrão semanal. É a convenção dos outros módulos de
// domínio, e é o que permite exercitar a conta de vencimento sem subir o app.

import { cadenciaPrevista } from './dia';
import type { Cadencia } from './dia';

/** Dias à frente que a conta percorre antes de desistir. */
export const HORIZONTE_PADRAO = 60;

/**
 * Quando aquele treino volta — a data em que a mudança dele vence.
 *
 * A conta caminha um dia por vez a partir de `de`. Em cada dia ela pergunta ao
 * padrão semanal se é dia de treino; sendo, aquele dia consome uma posição da
 * rotação. O primeiro dia de treino cuja posição é `alvo` é a resposta.
 *
 * **Por que a rotação avança só nos dias de treino:** a sequência deste app é
 * SEQUÊNCIA, não dia da semana — A, B, C, D, E, HX e volta ao A. Um domingo de
 * descanso não gasta posição nenhuma, e por isso contar em dias corridos daria
 * a data errada toda semana.
 *
 * **`proxima` é a letra que o PRÓXIMO dia de treino vai ter**, e é quem chama
 * que a resolve — ela depende de já ter havido sessão hoje, do que o dono
 * declarou e do que ficou registrado. Se ela própria é o `alvo` e hoje é dia de
 * treino, vence HOJE: é o passo 4 do fluxo, "na manhã do dia em que aquele
 * treino volta".
 *
 * Devolve `null` quando o alvo não aparece dentro do horizonte — padrão semanal
 * sem nenhum dia de treino, ou um alvo que não está na rotação. Nunca inventa
 * uma data: sem data não há vencimento a anunciar, e anunciar um palpite aqui
 * seria dizer que uma mudança vence quando ninguém sabe se vence.
 *
 * O instante devolvido é aquele dia na MESMA hora de `de` — quem desenha o lê
 * como data, e é assim que a tela o usa.
 */
export function quandoAquelaVolta(
  alvo: string,
  rotacao: string[],
  proxima: string,
  cadencia: Cadencia[],
  de: number,
  horizonte: number = HORIZONTE_PADRAO
): number | null {
  if (!alvo || !rotacao || !rotacao.length) return null;
  let i = rotacao.indexOf(proxima);
  if (i < 0) return null;              // a próxima não está na rotação: não há conta a fazer

  for (let d = 0; d < horizonte; d++) {
    const t = de + d * 86400000;
    if (cadenciaPrevista(cadencia, t) !== 'treino') continue;
    if (rotacao[i] === alvo) return t;
    i = (i + 1) % rotacao.length;
  }
  return null;
}
