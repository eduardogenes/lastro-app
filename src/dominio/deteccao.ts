// A LEITURA DO CORPO NA IMAGEM (direção 3; docs/redesign-3/02-captura.md, §1,
// §3 e §5). Recebe os 33 pontos do MediaPipe Pose, em fração do quadro 3:4 que
// vira a foto, e devolve as luzes de altura e distância, a dica de lado, se o
// corpo está parado e o ajuste que alinha a foto depois.
//
// O modelo não tem ponto no topo da cabeça. O topo sai dos olhos e da boca
// (de frente e de perfil) ou, sem o rosto à vista (de costas), dos ombros e
// do quadril. As tolerâncias moram todas em `REGUA`, para ajustar com o dado
// real (cada foto guarda se a detecção estava ativa: `Captura.det`).
//
// Regra pura: não lê câmera, não lê estado. Quem chama é a câmera.

import type { Enquadramento } from './tipos';
import { normaliza } from './enquadramento';

export interface Ponto { x: number; y: number; visibility?: number }

/** As linhas da câmera e quanto se aceita fora delas. */
export const REGUA = {
  /** as guias da cabeça e dos pés, a 4% das bordas (as mesmas da tela) */
  topo: 0.04,
  base: 0.96,
  /** distância: a altura do corpo no quadro pode errar isto, para mais ou para menos */
  tolDistancia: 0.035,
  /** altura: a sobra de cima menos a de baixo pode errar isto */
  tolAltura: 0.03,
  /** com a luz já verde, a folga para ela apagar é maior (não pisca na borda) */
  folgaParaSair: 1.5,
  /** centro: o meio do quadril longe do meio do quadro mais que isto vira dica */
  tolLado: 0.06,
  /** do olho ao topo da cabeça, em múltiplos do olho à boca */
  fatorTopo: 1.8,
  /** sem rosto: do ombro ao topo, em múltiplos do ombro ao quadril */
  fatorTopoCostas: 0.62,
  /** ponto que conta como visto */
  visivel: 0.4,
  /** parado: o quanto o tronco pode andar, em fração do quadro, no último segundo */
  parado: 0.012,
  janelaParado: 1000
};

const I = { nariz: 0, olhoE: 2, olhoD: 5, orelhaE: 7, orelhaD: 8, bocaE: 9, bocaD: 10, ombroE: 11, ombroD: 12,
  quadrilE: 23, quadrilD: 24, tornozeloE: 27, tornozeloD: 28, calcanharE: 29, calcanharD: 30, peE: 31, peD: 32 };

export type Dica = 'ok' | 'frente' | 'tras' | 'subir' | 'descer';

export interface Leitura {
  /** o corpo inteiro está no quadro e foi visto */
  pessoa: boolean;
  /** a luz da distância: verde quando a cabeça e os pés estão nas linhas */
  distancia: boolean;
  /** a luz da altura: verde quando sobra o mesmo espaço em cima e embaixo */
  altura: boolean;
  /** o que fazer com a distância: chegar para a frente, para trás */
  dicaDistancia: Dica;
  /** o que fazer com a altura do celular: subir, descer */
  dicaAltura: Dica;
  /** o corpo fora do meio: para que lado ele está, no quadro */
  lado: 'centro' | 'esquerda' | 'direita';
  /** o topo estimado da cabeça e a base dos pés, em fração do quadro */
  topo: number;
  baseY: number;
  /** o meio do corpo, na horizontal */
  meioX: number;
}

const vis = (p: Ponto | undefined) => !!p && (p.visibility == null || p.visibility >= REGUA.visivel);
const media = (a: number[]) => a.reduce((s, n) => s + n, 0) / a.length;
function ys(pts: Ponto[], idx: number[]): number[] { return idx.map(i => pts[i]).filter(vis).map(p => p.y); }

/** O topo da cabeça e a base dos pés, ou `null` quando o corpo não está inteiro à vista. */
function extremos(pts: Ponto[]): { topo: number; base: number } | null {
  const pes = ys(pts, [I.calcanharE, I.calcanharD, I.peE, I.peD, I.tornozeloE, I.tornozeloD]);
  const ombros = ys(pts, [I.ombroE, I.ombroD]);
  const quadris = ys(pts, [I.quadrilE, I.quadrilD]);
  if (!pes.length || !ombros.length || !quadris.length) return null;
  const olhos = ys(pts, [I.olhoE, I.olhoD]);
  const boca = ys(pts, [I.bocaE, I.bocaD]);
  let topo: number;
  if (olhos.length && boca.length && media(boca) > Math.min(...olhos)) {
    const olho = Math.min(...olhos);
    topo = olho - REGUA.fatorTopo * (media(boca) - olho);
  } else {
    const o = media(ombros), q = media(quadris);
    if (q <= o) return null;
    topo = o - REGUA.fatorTopoCostas * (q - o);
  }
  return { topo: topo, base: Math.max(...pes) };
}

/**
 * Lê os pontos de um quadro. `antes` é a leitura anterior: uma luz que já
 * estava verde ganha folga para apagar, e a tela não pisca na borda da régua.
 */
export function leCorpo(pts: Ponto[] | null | undefined, antes?: Leitura | null): Leitura {
  const nada: Leitura = { pessoa: false, distancia: false, altura: false, dicaDistancia: 'frente', dicaAltura: 'ok',
    lado: 'centro', topo: 0, baseY: 1, meioX: 0.5 };
  if (!pts || pts.length < 33) return nada;
  const e = extremos(pts);
  if (!e) return nada;
  const h = e.base - e.topo;
  const alvo = REGUA.base - REGUA.topo;
  const tolD = REGUA.tolDistancia * (antes && antes.distancia ? REGUA.folgaParaSair : 1);
  const tolA = REGUA.tolAltura * (antes && antes.altura ? REGUA.folgaParaSair : 1);
  // cabeça ou pés para fora da borda: o corpo não está inteiro
  const inteiro = e.topo > -0.02 && e.base < 1.02;
  const dd = h - alvo;
  const distancia = inteiro && Math.abs(dd) <= tolD;
  // mais sobra em cima que embaixo: o corpo caiu no quadro, o celular está alto
  const sobra = e.topo - (1 - e.base);
  const altura = inteiro && Math.abs(sobra) <= tolA;
  const meio = media([I.quadrilE, I.quadrilD, I.ombroE, I.ombroD].map(i => pts[i]).filter(vis).map(p => p.x));
  return {
    pessoa: inteiro,
    distancia: distancia,
    altura: altura,
    dicaDistancia: distancia ? 'ok' : dd < 0 ? 'frente' : 'tras',
    dicaAltura: altura ? 'ok' : sobra > 0 ? 'descer' : 'subir',
    lado: Math.abs(meio - 0.5) <= REGUA.tolLado ? 'centro' : meio < 0.5 ? 'esquerda' : 'direita',
    topo: e.topo, baseY: e.base, meioX: meio
  };
}

/** O tronco num instante: o meio dos ombros e do quadril. */
export interface Rastro { t: number; x: number; y: number }
export function rastroDe(pts: Ponto[] | null | undefined, t: number): Rastro | null {
  if (!pts || pts.length < 33) return null;
  const p = [I.ombroE, I.ombroD, I.quadrilE, I.quadrilD].map(i => pts[i]).filter(vis);
  if (p.length < 2) return null;
  return { t: t, x: media(p.map(q => q.x)), y: media(p.map(q => q.y)) };
}

/**
 * Parado: no último segundo o tronco não andou mais que a régua. Pede rastro
 * cobrindo o segundo inteiro; sem isso, ainda não dá para dizer.
 */
export function parado(rastros: Rastro[], agora: number): boolean {
  const j = rastros.filter(r => agora - r.t <= REGUA.janelaParado);
  if (j.length < 3 || agora - j[0].t < REGUA.janelaParado * 0.8) return false;
  const xs = j.map(r => r.x), yy = j.map(r => r.y);
  return Math.max(...xs) - Math.min(...xs) <= REGUA.parado && Math.max(...yy) - Math.min(...yy) <= REGUA.parado;
}

/**
 * O ALINHAMENTO AUTOMÁTICO (§5): o ajuste que põe a cabeça e os pés nas
 * linhas e o corpo no meio. Só aproxima e centraliza, sem girar; o arquivo
 * não muda. `null` quando não há o que fazer: o corpo não foi visto, já está
 * nas linhas, ou é grande demais (afastar não existe, o zoom mínimo é 1).
 */
export function alinhamentoAutomatico(l: Leitura | null | undefined, agora: number): (Enquadramento & { auto: 1 }) | null {
  if (!l || !l.pessoa) return null;
  const h = l.baseY - l.topo;
  if (h <= 0) return null;
  const z = (REGUA.base - REGUA.topo) / h;
  if (z < 1) return null;
  const n = normaliza({ r: 0, z: z, cx: l.meioX, cy: (l.topo + l.baseY) / 2, m: agora });
  // o que a régua da câmera já aceitaria não vale um ajuste
  if (Math.abs(n.z - 1) < REGUA.tolDistancia && Math.abs(n.cx - 0.5) < 0.01 && Math.abs(n.cy - 0.5) < 0.01) return null;
  return Object.assign(n, { auto: 1 as const });
}
