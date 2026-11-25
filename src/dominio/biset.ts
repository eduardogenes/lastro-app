// O BI-SET COMO CIRCUITO (Fase A2, protótipo de 24/11/2026): dois exercícios
// combinados são duas estações de uma rodada. Estação 1 → estação 2 →
// descanso (o do SEGUNDO, decisão do dono) → volta. Quem tem mais séries faz a
// que sobra sozinho, com o próprio descanso.
//
// Antes o app fazia todas as séries do primeiro sem pausa e só depois as do
// segundo: o par nunca alternava.
//
// Tudo aqui é puro: o app passa o que sabe (quantas séries, quais estão
// cheias, quem foi pulado ou separado hoje) e recebe a ordem.

/** Um par do treino: as posições das duas estações e o número de ordem ("Par 2"). */
export interface ParDoTreino { n: number; a: number; b: number }

/**
 * Os pares de um treino. `bi` no slot quer dizer "em bi-set com o de baixo";
 * um par não encadeia no seguinte (três seguidos com `bi` viram um par e um
 * solo), e o último exercício não forma par com ninguém.
 *
 * `separados`: posições da estação 1 dos pares desfeitos hoje ("Separar hoje").
 * Um par separado continua contando na numeração, para "Par 3" ser sempre o
 * mesmo par na lista e na tela.
 */
export function paresDoTreino(ex: { bi?: number | boolean }[], separados: number[] = []): { pares: ParDoTreino[]; de: Record<number, ParDoTreino & { separado: boolean }> } {
  const pares: ParDoTreino[] = [];
  const de: Record<number, ParDoTreino & { separado: boolean }> = {};
  let n = 0;
  for (let i = 0; i < ex.length - 1; i++) {
    if (!ex[i] || !ex[i].bi) continue;
    if (de[i]) continue;
    n++;
    const p = { n: n, a: i, b: i + 1 };
    const sep = separados.indexOf(i) >= 0;
    pares.push(p);
    de[i] = Object.assign({ separado: sep }, p);
    de[i + 1] = Object.assign({ separado: sep }, p);
    i++; // a estação 2 não abre outro par
  }
  return { pares: pares, de: de };
}

/** O que o circuito precisa saber de cada estação. */
export interface Estacao { series: number; cheia: (k: number) => boolean; fora: boolean }

/**
 * A próxima série do par, na ordem do circuito: rodada a rodada, a estação 1
 * e depois a 2. Uma estação fora (pulada) some da conta; a outra segue como
 * exercício sozinho. `null`: o par acabou.
 */
export function proximaDoPar(a: Estacao, b: Estacao): { lado: 'a' | 'b'; k: number } | null {
  const rodadas = Math.max(a.fora ? 0 : a.series, b.fora ? 0 : b.series);
  for (let r = 0; r < rodadas; r++) {
    if (!a.fora && r < a.series && !a.cheia(r)) return { lado: 'a', k: r };
    if (!b.fora && r < b.series && !b.cheia(r)) return { lado: 'b', k: r };
  }
  return null;
}

/**
 * Depois de guardar a série `k` da estação `lado`, o que vem:
 * - `'segue'`: a outra estação tem a série desta rodada por fazer — sem pausa;
 * - `'par'`: a rodada fechou com as duas — o descanso do par (o da estação 2);
 * - `'proprio'`: a série era só desta estação (a que sobra) — o descanso dela.
 *
 * Vale também quando ele começou a rodada pela estação 2 (aparelho ocupado):
 * o que manda é se a outra ainda deve a série desta rodada.
 */
export function depoisDaSerie(lado: 'a' | 'b', k: number, a: Estacao, b: Estacao): 'segue' | 'par' | 'proprio' {
  const outra = lado === 'a' ? b : a;
  if (!outra.fora && k < outra.series) return outra.cheia(k) ? 'par' : 'segue';
  return 'proprio';
}

/**
 * A pegada e os pés que o treinador escreveu NA DICA ("pegada: neutra na
 * corda; …", "pés: largura dos ombros; …"). Saem do texto da dica, para a tela
 * não dizer a mesma coisa duas vezes, e viram uma linha própria com ícone.
 * Só trechos inteiros, separados por ";", contam.
 */
export function separaPegada(cue: string | undefined | null): { pegada: string | null; pes: string | null; resto: string } {
  const partes = String(cue || '').split(';').map(function (p) { return p.trim(); }).filter(Boolean);
  let pegada: string | null = null, pes: string | null = null;
  const resto: string[] = [];
  partes.forEach(function (p) {
    const m = /^(pegada|p[eé]s)\s*:\s*(.+)$/i.exec(p);
    if (m && /^peg/i.test(m[1]) && !pegada) pegada = m[2].trim();
    else if (m && !/^peg/i.test(m[1]) && !pes) pes = m[2].trim();
    else resto.push(p);
  });
  return { pegada: pegada, pes: pes, resto: resto.join('; ') };
}
