// O tipo do dia — a fonte única que treino e comida leem.
//
// Este módulo existe porque os dois apps modelavam o MESMO fato de formas
// irreconciliáveis, e fundir sem resolver isso teria dado duas verdades:
//
//   Treino   — rotação dirigida por SEQUÊNCIA. Avança quando ele registra uma
//              sessão. Não conhece dia da semana, de propósito: ele treina 5 a
//              6 vezes por semana, e semana fixa quebraria na primeira vez que
//              pulasse um dia.
//   Nutrição — mapa de 7 posições, dia da semana → A-F | descanso. Sexta é
//              sempre a mesma coisa.
//
// A resolução separa duas perguntas que estavam grudadas numa só:
//
//   QUAL treino é o próximo?  → sempre a rotação. O mapa nunca opina nisso.
//   HOJE é dia de treinar?    → fato, depois override, depois previsão.
//
// Com isso o mapa deixa de guardar letra e passa a guardar só a CADÊNCIA
// (treina / descansa por dia da semana). Ele não pode mais discordar da
// rotação sobre qual sessão vem, porque não fala mais sobre isso — e continua
// fazendo o único trabalho que a rotação não sabe fazer: projetar o futuro
// para a lista de compras, que precisa somar 7, 14 ou 30 dias à frente.

import { sameDay } from './formato';
import type { Dia, Estado, Sessao } from './tipos';

/** O que um dia da semana é, na cadência dele. */
export type Cadencia = 'treino' | 'descanso';

/**
 * Cadência padrão: descansa domingo e quinta. Índice 0 = domingo, como
 * Date#getDay. A quinta no meio da semana é deliberada na prescrição — é o dia
 * de recuperação e cardio entre C e o treino de especialização.
 */
export const CADENCIA_PADRAO: Cadencia[] =
  ['descanso', 'treino', 'treino', 'treino', 'descanso', 'treino', 'treino'];

/** De onde veio a resposta. A interface mostra isso — número derivado diz a origem. */
export type Origem = 'registrado' | 'aberta' | 'manual' | 'previsto';

export interface DiaDeHoje {
  /** treina ou descansa */
  cadencia: Cadencia;
  /** a letra do treino, quando houver. Vem SEMPRE da rotação. */
  treino: Dia | null;
  origem: Origem;
  /** true quando ainda é palpite: dá para o app falar em previsão, não em fato */
  previsto: boolean;
}

/** A rotação efetiva: a dele, ou a do treinador. */
export function rotacao(S: Estado, padrao: Dia[]): Dia[] {
  return (S.rot && S.rot.length) ? S.rot : padrao;
}

/** A última sessão que conta para a rotação — avulsa não move a fila. */
export function ultimaDoPlano(S: Estado): Sessao | null {
  for (let i = S.done.length - 1; i >= 0; i--) if (!S.done[i].livre) return S.done[i];
  return null;
}

/** O próximo treino da rotação. É a única autoridade sobre QUAL sessão vem. */
export function proximoTreino(S: Estado, padrao: Dia[]): Dia {
  const rot = rotacao(S, padrao);
  const u = ultimaDoPlano(S);
  if (!u) return rot[0];
  const i = rot.indexOf(u.day);
  return rot[(i + 1) % rot.length];
}

/** A cadência prevista para um instante, pelo dia da semana. */
export function cadenciaPrevista(cadencia: Cadencia[], t: number): Cadencia {
  const c = (cadencia && cadencia.length === 7) ? cadencia : CADENCIA_PADRAO;
  return c[new Date(t).getDay()];
}

/**
 * O dia de hoje, resolvido. A ordem de precedência é o coração da fusão:
 *
 *   1. Sessão JÁ REGISTRADA hoje — fato consumado, nada discute.
 *   2. Sessão ABERTA agora — está acontecendo.
 *   3. Override manual para hoje — ele disse, ele sabe.
 *   4. Previsão pela cadência da semana — palpite, e a tela diz que é palpite.
 *
 * O `treino` sai da rotação em todos os casos, menos quando já há sessão: aí
 * sai da própria sessão, porque ele pode ter navegado para outro dia.
 */
export function diaDeHoje(
  S: Estado,
  padrao: Dia[],
  cadencia: Cadencia[],
  override: Cadencia | Dia | null,
  agora: number = Date.now()
): DiaDeHoje {
  const doDia = S.done.filter(x => sameDay(x.t, agora) && !x.livre);
  if (doDia.length) {
    return { cadencia: 'treino', treino: doDia[doDia.length - 1].day, origem: 'registrado', previsto: false };
  }

  if (S.sessao && sameDay(S.sessao.inicio, agora)) {
    return { cadencia: 'treino', treino: S.sessao.day, origem: 'aberta', previsto: false };
  }

  if (override) {
    return override === 'descanso'
      ? { cadencia: 'descanso', treino: null, origem: 'manual', previsto: false }
      : { cadencia: 'treino', treino: proximoTreino(S, padrao), origem: 'manual', previsto: false };
  }

  const prev = cadenciaPrevista(cadencia, agora);
  return prev === 'descanso'
    ? { cadencia: 'descanso', treino: null, origem: 'previsto', previsto: true }
    : { cadencia: 'treino', treino: proximoTreino(S, padrao), origem: 'previsto', previsto: true };
}

/**
 * Quantos dias de treino e de descanso caem num horizonte de N dias.
 *
 * É o ÚNICO uso legítimo do mapa: a lista de compras precisa somar refeições
 * de 7, 14 ou 30 dias à frente, e nenhuma rotação por sequência sabe dizer o
 * que ele vai fazer daqui a três semanas. A tela que consome isto tem que
 * carimbar "previsão pela semana típica" — é número derivado de palpite, e
 * número derivado sempre diz de onde veio.
 */
export function previsaoDoHorizonte(
  cadencia: Cadencia[],
  dias: number,
  de: number = Date.now()
): { treino: number; descanso: number } {
  let treino = 0, descanso = 0;
  for (let i = 0; i < dias; i++) {
    const t = de + i * 86400000;
    if (cadenciaPrevista(cadencia, t) === 'treino') treino++; else descanso++;
  }
  return { treino, descanso };
}
