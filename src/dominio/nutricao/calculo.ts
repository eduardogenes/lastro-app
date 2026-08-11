// O que a nutrição deriva. Nada aqui é digitado duas vezes.
//
// Lei 5 do sistema: nada derivável é digitado. Os totais do dia saem da
// biblioteca × as quantidades; a lista de compras sai do plano × a previsão da
// semana; o alvo calórico sai do plano, não de um número escrito à parte. Onde
// um número é derivado, quem mostra tem que dizer de onde veio.

import type {
  Alimento, DiaComida, Item, LinhaCompra, Quando, Refeicao, Totais
} from './tipos';

export const VAZIO: Totais = { kcal: 0, p: 0, c: 0, g: 0 };

/** Soma dois totais. */
export function somaTotais(a: Totais, b: Totais): Totais {
  return { kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, g: a.g + b.g };
}

/** O que um item soma, dado o catálogo e uma escala de porção. */
export function totalDoItem(
  item: Item,
  catalogo: Record<string, Alimento>,
  escala: number = 1
): Totais {
  const a = catalogo[item.f];
  if (!a) return VAZIO;
  const f = (item.q * escala) / 100;
  return { kcal: a.kcal * f, p: a.p * f, c: a.c * f, g: a.g * f };
}

/** Um item entra hoje? `alta` só aparece em dia de alta demanda. */
export function itemEntra(item: Item, alta: boolean): boolean {
  return !item.alta || alta;
}

/** Uma refeição entra hoje? */
export function refeicaoEntra(r: Refeicao, treino: boolean, alta: boolean): boolean {
  if (r.quando === 'sempre') return true;
  if (r.quando === 'treino') return treino;
  return alta;
}

/** O que uma refeição soma hoje. */
export function totalDaRefeicao(
  r: Refeicao,
  catalogo: Record<string, Alimento>,
  alta: boolean,
  escala: number = 1
): Totais {
  return r.itens
    .filter(i => itemEntra(i, alta))
    .reduce((acc, i) => somaTotais(acc, totalDoItem(i, catalogo, escala)), VAZIO);
}

/** O que o dia inteiro soma, com as condições e as escalas de hoje aplicadas. */
export function totalDoDia(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  treino: boolean,
  alta: boolean,
  escala: Record<string, number> = {}
): Totais {
  return plano
    .filter(r => refeicaoEntra(r, treino, alta))
    .reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, escala[r.id] ?? 1)), VAZIO);
}

/** O que já foi comido: só as refeições marcadas. */
export function totalRegistrado(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  dia: DiaComida,
  treino: boolean,
  alta: boolean
): Totais {
  return plano
    .filter(r => refeicaoEntra(r, treino, alta) && dia.done[r.id])
    .reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, dia.escala[r.id] ?? 1)), VAZIO);
}

/** Minutos desde a meia-noite, para ordenar a timeline. */
export function minutosDe(hhmm: string): number {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** As refeições de hoje, em ordem de relógio. */
export function refeicoesDeHoje(
  plano: Refeicao[],
  treino: boolean,
  alta: boolean
): Refeicao[] {
  return plano
    .filter(r => refeicaoEntra(r, treino, alta))
    .slice()
    .sort((a, b) => minutosDe(a.t) - minutosDe(b.t));
}

/** Resumo de uma linha: "120 g banana · 15 g mel · 200 ml café". */
export function resumoDaRefeicao(
  r: Refeicao,
  catalogo: Record<string, Alimento>,
  alta: boolean,
  escala: number = 1
): string {
  return r.itens
    .filter(i => itemEntra(i, alta))
    .map(i => {
      const a = catalogo[i.f];
      if (!a) return null;
      return Math.round(i.q * escala) + ' ' + a.u + ' ' + a.n.toLowerCase();
    })
    .filter(Boolean)
    .join(' · ');
}

/**
 * O ajuste calórico, aplicado onde o plano manda aplicar: no arroz.
 *
 * ±150 kcal em arroz cozido a 128 kcal/100 g dão ~117 g. Arredondado para 15 g,
 * que é a menor colherada que dá para medir sem balança de precisão às 12h30
 * no trabalho — precisão maior que a da execução é falsa precisão.
 */
export const PASSO_ARROZ = 120;

/** Quanto o arroz muda para um dado ajuste. */
export function arrozDoAjuste(base: number, ajuste: -1 | 0 | 1): number {
  return Math.max(0, Math.round((base + ajuste * PASSO_ARROZ) / 15) * 15);
}

/**
 * A lista de compras — derivada, nunca guardada.
 *
 * Soma cada refeição pelas vezes que ela aparece no horizonte, e converte
 * pronto → cru onde há fator. Cada linha convertida carrega a procedência,
 * porque "1,3 kg" sem dizer que veio de "1 kg pronto" é um número que ninguém
 * consegue conferir no açougue.
 */
export function listaDeCompras(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  previsao: { treino: number; descanso: number },
  diasAlta: number = 0
): LinhaCompra[] {
  const total = previsao.treino + previsao.descanso;
  const acc: Record<string, number> = {};

  plano.forEach(r => {
    // quantas vezes esta refeição acontece no horizonte
    const vezes = r.quando === 'sempre' ? total
      : r.quando === 'treino' ? previsao.treino
      : diasAlta;
    if (!vezes) return;
    r.itens.forEach(i => {
      const vezesItem = i.alta ? diasAlta : vezes;
      if (!vezesItem) return;
      acc[i.f] = (acc[i.f] || 0) + i.q * vezesItem;
    });
  });

  return Object.keys(acc)
    .map(f => {
      const a = catalogo[f];
      if (!a) return null;
      const pronto = acc[f];
      const comprar = a.cru > 0 ? pronto * a.cru : pronto;
      return {
        f, n: a.n, cat: a.cat, u: a.u,
        pronto: Math.round(pronto),
        comprar: Math.round(comprar),
        procedencia: a.cru > 0 ? `cru · ${fmtKg(pronto, a.u)} prontos` : null
      } as LinhaCompra;
    })
    .filter((x): x is LinhaCompra => x !== null)
    .sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'));
}

/** Quantidade grande vira kg/l: "3,4 kg" lê melhor que "3400 g" na gôndola. */
export function fmtKg(v: number, u: 'g' | 'ml'): string {
  if (v >= 1000) {
    return (Math.round(v / 100) / 10).toFixed(1).replace('.', ',') + (u === 'g' ? ' kg' : ' l');
  }
  return Math.round(v) + ' ' + u;
}
