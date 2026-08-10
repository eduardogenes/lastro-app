// Fixtures para os testes de domínio. Sem DOM, sem app: só dado.

import type { Log, Marca, Serie } from '../../src/dominio/tipos';

export const DIA = 86400000;

/** Segunda-feira 00:00 da semana de `t`, igual ao weekStart() do app. */
export function inicioDaSemana(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/**
 * Pesagens que caem em médias semanais conhecidas, com ruído que se anula.
 * Ancora na última semana FECHADA, nunca na semana em curso: rodando numa
 * segunda-feira, a semana atual teria uma pesagem só e a média viraria ruído.
 */
export function pesagens(medias: number[]): Marca[] {
  const ultima = inicioDaSemana(Date.now()) - 7 * DIA;
  const ruido = [0.4, -0.3, 0.2, -0.3];
  const out: Marca[] = [];
  medias.forEach(function (m, idx) {
    const semana = ultima - (medias.length - 1 - idx) * 7 * DIA;
    for (let j = 0; j < 4; j++) {
      out.push({ t: semana + j * DIA + 10 * 3600000, v: Math.round((m + ruido[j]) * 100) / 100 });
    }
  });
  return out;
}

/** Medidas soltas, informadas por dias atrás. */
export function medidas(pares: Array<{ d: number; v: number }>): Marca[] {
  return pares.map(p => ({ t: Date.now() - p.d * DIA, v: p.v }))
              .sort((x, y) => x.t - y.t);
}

/** Uma entrada de histórico com o mínimo para as regras de progressão. */
export function log(sets: Serie[], extra: Partial<Log> = {}): Log {
  return Object.assign({ t: Date.now(), sid: 1, sets }, extra);
}
