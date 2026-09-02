// O ajuste fino da foto de acompanhamento: um giro pequeno e um recorte.
//
// Por que isto existe. O protocolo garante a POSE; a geometria da câmera ele
// não alcança, porque ela mora nas marcas de fita no chão. Na prática a fita
// sai do lugar, o celular encosta um grau torto, e duas sessões que deviam ser
// comparáveis passam a diferir por causa da câmera. Este módulo devolve ao app
// o pedaço da geometria que dá para consertar depois: endireitar e reenquadrar.
//
// O que ele NÃO é: um editor. Não há filtro, brilho, contraste nem corte livre.
// Qualquer um dos quatro mudaria a aparência do corpo, e aí a foto deixaria de
// medir o corpo e passaria a medir a edição. Giro e recorte movem o
// enquadramento sem tocar em um pixel do que está dentro dele.
//
// Recebem dado e devolvem decisão: não leem estado global nem tocam em DOM.

import type { Enquadramento } from './tipos';

/** O quadro em que toda foto é desenhada. As do protocolo já nascem 3:4. */
export const ASPECTO = 3 / 4;

/**
 * O giro é limitado a 6°, e o limite é a parte importante.
 *
 * Endireitar um celular torto custa menos de 3°. Além disso não se está mais
 * corrigindo a câmera, e sim recompondo a foto — e recompor é exatamente o que
 * destrói a comparabilidade que o resto do protocolo existe para proteger.
 * O limite baixo também segura o preço do giro: a 6° o zoom mínimo já come 13%
 * do lado, porque girar sem abrir borda vazia obriga a aproximar.
 */
export const GIRO_MAX = 6;

/** Teto do zoom. Além disso não é recorte, é outra foto. */
export const ZOOM_MAX = 2;

const GRAU = Math.PI / 180;

/** A foto como ela saiu da câmera. */
export const IDENTIDADE: Enquadramento = { r: 0, z: 1, cx: 0.5, cy: 0.5, m: 0 };

function limita(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

function numero(n: unknown, padrao: number): number {
  return typeof n === 'number' && isFinite(n) ? n : padrao;
}

/**
 * O zoom mínimo que impede o giro de abrir borda vazia no quadro.
 *
 * Um retângulo girado por θ só volta a cobrir o quadro se for aproximado. Para
 * um quadro de proporção `a`, o pior dos dois lados manda:
 *
 *     z = cos θ + max(a, 1/a) · sen θ
 *
 * A 6° num quadro 3:4 isso dá 1,13 — treze por cento do lado somem para o giro
 * caber. É o preço real de endireitar, e é por isso que o limite é baixo.
 */
export function zoomMinimo(r: number, aspecto: number = ASPECTO): number {
  const t = Math.abs(numero(r, 0)) * GRAU;
  const pior = Math.max(aspecto, 1 / aspecto);
  return Math.cos(t) + pior * Math.sin(t);
}

/**
 * Quanto o centro do recorte pode andar sem descolar da foto, em fração de
 * cada lado. Devolve as duas meias-folgas: `cx` vive em [bx, 1−bx].
 *
 * É a caixa que envolve o quadro girado, medida de volta no espaço da foto.
 * Quando o zoom é o mínimo, a folga é zero e não há para onde arrastar — o que
 * está certo: naquele ponto a foto girada mal cobre o quadro.
 */
export function folga(r: number, z: number, aspecto: number = ASPECTO): { bx: number; by: number } {
  const t = Math.abs(numero(r, 0)) * GRAU;
  const zz = Math.max(0.0001, numero(z, 1));
  return {
    bx: Math.min(0.5, (Math.cos(t) + Math.sin(t) / aspecto) / (2 * zz)),
    by: Math.min(0.5, (Math.cos(t) + aspecto * Math.sin(t)) / (2 * zz))
  };
}

/**
 * Põe um ajuste dentro do que é possível desenhar.
 *
 * Toda entrada passa por aqui — a do editor, a que veio do outro aparelho e a
 * de um backup antigo. Um ajuste impossível não vira erro: vira o ajuste
 * possível mais próximo. A tela nunca tem que decidir o que fazer com lixo.
 */
export function normaliza(aj: Partial<Enquadramento> | null | undefined, aspecto: number = ASPECTO): Enquadramento {
  const r = limita(numero(aj && aj.r, 0), -GIRO_MAX, GIRO_MAX);
  const z = limita(numero(aj && aj.z, 1), zoomMinimo(r, aspecto), ZOOM_MAX);
  const f = folga(r, z, aspecto);
  return {
    r: r,
    z: z,
    cx: limita(numero(aj && aj.cx, 0.5), f.bx, 1 - f.bx),
    cy: limita(numero(aj && aj.cy, 0.5), f.by, 1 - f.by),
    m: numero(aj && aj.m, 0)
  };
}

/** É a foto como ela saiu? Enquadramento assim não se grava — some do estado. */
export function ehIdentidade(aj: Partial<Enquadramento> | null | undefined): boolean {
  if (!aj) return true;
  const a = normaliza(aj);
  return Math.abs(a.r) < 0.01 && Math.abs(a.z - 1) < 0.001 &&
         Math.abs(a.cx - 0.5) < 0.001 && Math.abs(a.cy - 0.5) < 0.001;
}

/**
 * O `transform` que desenha o ajuste.
 *
 * Mora aqui, e não em cada tela, porque a captura, a referência, a comparação
 * lado a lado e a sobreposição têm que aplicar EXATAMENTE a mesma coisa. Duas
 * implementações dessa conta divergiriam, e a divergência apareceria como uma
 * diferença no corpo que não existe.
 *
 * A ordem importa e é lida da direita para a esquerda: leva o ponto (cx,cy) ao
 * centro do elemento, aproxima e gira em volta DELE, e só então centraliza no
 * quadro. Girar antes de centralizar giraria em volta do canto.
 */
export function transform(aj: Partial<Enquadramento> | null | undefined): string {
  const a = normaliza(aj);
  const dx = ((0.5 - a.cx) * 100).toFixed(4);
  const dy = ((0.5 - a.cy) * 100).toFixed(4);
  return 'translate(-50%,-50%) rotate(' + a.r.toFixed(3) + 'deg) scale(' +
         a.z.toFixed(4) + ') translate(' + dx + '%,' + dy + '%)';
}

/**
 * Arrasta o recorte. `dx`/`dy` vêm em fração do QUADRO, e o zoom os encolhe:
 * quanto mais perto, menos foto um centímetro de dedo atravessa.
 *
 * O giro não entra na conta de propósito. A até 6° a diferença entre arrastar
 * no eixo da tela e no eixo da foto é menor que o dedo, e fazer o arrasto
 * torto para ser matematicamente correto seria pior de usar.
 */
export function arrasta(aj: Enquadramento, dx: number, dy: number, aspecto: number = ASPECTO): Enquadramento {
  const a = normaliza(aj, aspecto);
  return normaliza({
    r: a.r, z: a.z, m: a.m,
    cx: a.cx - numero(dx, 0) / a.z,
    cy: a.cy - numero(dy, 0) / a.z
  }, aspecto);
}
