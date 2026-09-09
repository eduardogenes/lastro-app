// Carga e agregações de série. Puro.
//
// O app NUNCA converte carga, só rotula: o total em anilhas é exibição, e
// nunca soma o peso da barra. Converter seria mentira — barra olímpica tem
// 20 kg, a W tem 10, e articulada tem alavanca própria.

import type { Exercicio, Log, Serie, Unidade } from './tipos';

// total em anilhas: sempre 2x o lado, nunca somando a barra
/**
 * O total de um carregamento que se dobra: os dois lados, mais a barra quando
 * o tipo tem uma.
 *
 * `barra` existe porque nem todo "kg por lado" é a mesma coisa. Máquina de
 * anilha, sled e Smith não têm barra a somar — o número deles é anilha e ponto.
 * A barra livre tem, e são 20 kg que mudam o total de toda série.
 */
export function totalAnilhas(v: number, barra: number = 0): number {
  return v > 0 ? v*2 + barra : 0;
}

// Exercício por tempo: a série continua sendo [a,b], mas b são segundos
// em vez de repetições e a carga é opcional (0 = peso do corpo).
export function isTime(ex: Partial<Exercicio> | null | undefined): boolean { return !!(ex && ex.u === 'seg'); }

/** A grandeza declarada, ou nada — e "nada" é a série de musculação. */
export function unidadeDe(x: { u?: Unidade } | null | undefined): Unidade | null {
  return x && x.u ? x.u : null;
}

/**
 * Tem grandeza declarada, seja ela qual for.
 *
 * É a pergunta que quase todo lugar do app queria fazer quando perguntava
 * `isTime`: "isto é série de musculação, com carga e faixa de repetição, ou é
 * outra coisa?". Quem trata dos SEGUNDOS especificamente continua em `isTime`.
 */
export function temUnidade(x: { u?: Unidade } | null | undefined): boolean {
  return !!unidadeDe(x);
}

/**
 * A quantidade é fixa e o RELÓGIO é o resultado.
 *
 * Vale para metro e caloria: a prescrição diz 500 m, e o que melhora ao longo
 * dos meses é o tempo de cobrir os 500. Em repetição e em segundo é o
 * contrário — a janela é que é fixa, e o que melhora é quanto saiu dela.
 *
 * É desta função que sai a DIREÇÃO da métrica, e é por isso que ela pergunta
 * pela unidade e nunca pelo exercício.
 */
export function cronometrado(u: Unidade | null | undefined): boolean {
  return u === 'm' || u === 'cal';
}

/** Menos é melhor? Só onde o resultado é o relógio. */
export function menosEhMelhor(u: Unidade | null | undefined): boolean {
  return cronometrado(u);
}

/** Como a grandeza se escreve ao lado do número. */
export const ROTULO_UNIDADE: Record<Unidade, string> = {
  seg: 'seg', m: 'm', cal: 'cal', rep: 'reps'
};

/**
 * O ritmo daquele registro: segundos por unidade de trabalho.
 *
 * É a única leitura honesta de um movimento cronometrado, e resolve dois
 * problemas com um número só. Compara sessões de tamanhos diferentes — 5×500 m
 * e um 1000 m viram o mesmo eixo — e aponta para o lado certo, porque ritmo
 * que cai é ritmo que melhora. Somar os segundos brutos fazia as duas coisas
 * erradas ao mesmo tempo.
 *
 * `null` quando não há o que dividir: sem `q` não existe trabalho conhecido, e
 * inventar um denominador seria pior que não mostrar nada.
 */
export function ritmoDe(l: Log): number | null {
  if (!cronometrado(l.u) || !(l.q! > 0)) return null;
  const feitas = l.sets.filter(Boolean) as Exclude<Serie, null>[];
  if (!feitas.length) return null;
  const seg = feitas.reduce((a, s) => a + s[1], 0);
  return seg > 0 ? seg / (l.q! * feitas.length) : null;
}

/**
 * A escala em que o ritmo se lê: por 100 m, por caloria.
 *
 * Segundo por metro daria 0,22 — número que não se compara de cabeça. Por 100
 * m dá 22, que é o que está escrito no ergômetro e na cabeça de quem corre.
 */
export const ESCALA_RITMO: Partial<Record<Unidade, { fator: number; rot: string }>> = {
  m:   { fator: 100, rot: 's / 100 m' },
  cal: { fator: 1,   rot: 's / cal' }
};

export function tutOf(l: Log): number { return l.sets.reduce((a: number, s: Serie) => a + (s ? s[1] : 0), 0); }

// volume = soma de peso × repetições. Sobe mesmo com a carga parada,
// que é o ponto: mostra progresso quando o número da barra não muda.
export function volOf(l: Log): number  { return l.sets.reduce((a: number, s: Serie) => a + (s ? s[0]*s[1] : 0), 0); }

export function maxLoad(l: Log): number { return l.sets.reduce((a: number, s: Serie) => (s && s[0] > a ? s[0] : a), 0); }

export function repsOf(l: Log): number { return l.sets.reduce((a,s) => a + (s ? s[1] : 0), 0); }

// Histórico: não podia se chamar top() enquanto o app era um script global —
// window.top é read-only ali, e o script inteiro morria antes de rodar. Em
// módulo a restrição não existe mais, mas o nome ficou e o histórico também.
export function topReps(r: string): number { return parseInt(r.split(/[–-]/)[1], 10); }