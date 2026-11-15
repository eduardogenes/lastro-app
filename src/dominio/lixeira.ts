// A LIXEIRA das fotos do corpo (pedido do dono, 13/11/2026).
//
// Ele tirou uma foto, apagou sem querer e a perdeu: apagar tirava a foto do
// aparelho e, na sincronização seguinte, do bucket. Agora apagar — e refazer
// uma pose, que substitui a anterior — põe a foto na lixeira. Ela fica lá 30
// dias, dá para restaurar, e só depois sai de vez, sozinha.
//
// Onde ficam os BYTES de uma foto na lixeira: num endereço próprio, com a
// versão no nome (`lixo-AAAA-MM-DD/<pose>.<v>.<ext>`), no aparelho e no
// bucket. O endereço da foto viva não tem versão, e refazer a pose grava por
// cima dele: deixar a foto apagada ali seria perdê-la na primeira foto nova.
//
// Restaurar devolve a MESMA foto (a mesma versão `v`) com um carimbo de
// restauração (`r`): a lápide da foto apagada é mais nova que `v`, e sem o
// carimbo a fusão a apagaria de novo (`vivaDesde`).
//
// Recebe dado e devolve decisão: não lê estado global nem toca em DOM.

import type { FotoRef, ItemDaLixeira, PoseId } from './tipos';

/** Quantos dias uma foto fica na lixeira antes de sair de vez. */
export const DIAS_NA_LIXEIRA = 30;

const DIA = 86400000;

/** A chave de um item: a mesma foto só existe uma vez na lixeira. É também a da lápide. */
export function chaveDaLixeira(x: { d: string; pose: PoseId; ref: { v: number } }): string {
  return 'lixo:' + x.d + ':' + x.pose + ':' + x.ref.v;
}

/** A pasta e o nome dos bytes de uma foto na lixeira (no aparelho e no bucket). */
export function pastaDaLixeira(d: string): string { return 'lixo-' + d; }
export function nomeNaLixeira(pose: PoseId, v: number): string { return pose + '.' + v; }

/**
 * Desde quando a foto está viva, para a fusão comparar com a lápide: a versão,
 * ou o instante em que foi restaurada, o que for mais novo.
 */
export function vivaDesde(ref: FotoRef | null | undefined): number {
  if (!ref) return 0;
  return Math.max(typeof ref.v === 'number' ? ref.v : 0, typeof ref.r === 'number' ? ref.r : 0);
}

/** Quando o item sai de vez. */
export function saiEm(x: ItemDaLixeira): number { return x.em + DIAS_NA_LIXEIRA * DIA; }

/** Quantos dias faltam (arredondado para cima; 0 quando já venceu). */
export function diasRestantes(x: ItemDaLixeira, agora: number): number {
  return Math.max(0, Math.ceil((saiEm(x) - agora) / DIA));
}

/** Os itens que já passaram dos 30 dias. */
export function vencidos(lista: ItemDaLixeira[] | null | undefined, agora: number): ItemDaLixeira[] {
  return (Array.isArray(lista) ? lista : []).filter(function (x) { return x && saiEm(x) <= agora; });
}

/** A lixeira na ordem de mostrar: a apagada por último primeiro. */
export function ordemDaLixeira(lista: ItemDaLixeira[] | null | undefined): ItemDaLixeira[] {
  return (Array.isArray(lista) ? lista.slice() : []).filter(Boolean).sort(function (a, b) { return b.em - a.em; });
}
