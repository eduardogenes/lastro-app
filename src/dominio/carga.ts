// Carga e agregações de série. Puro.
//
// O app NUNCA converte carga, só rotula: o total em anilhas é exibição, e
// nunca soma o peso da barra. Converter seria mentira — barra olímpica tem
// 20 kg, a W tem 10, e articulada tem alavanca própria.

import type { Exercicio, Log, Serie } from './tipos';

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