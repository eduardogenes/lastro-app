// AS TRÊS LUZES DO DISPARO (direção 3; docs/redesign-3/02-captura.md, §2).
//
// Nível, altura e distância. O botão da câmera só destrava com as três
// verdes, ou depois de "Tirar mesmo assim", e cada foto guarda o que não
// estava verde no instante do disparo (`Captura.fora`).
//
// De onde vem cada luz, em ordem de preferência:
//
// - NÍVEL: do sensor de movimento, quando ele lê. Sem leitura (sem sensor, ou
//   a permissão recusada), quem fotografa confere a olho.
// - ALTURA e DISTÂNCIA: da detecção do corpo na imagem, quando ela está ativa.
//   Sem ela (não carregou, caiu ou está lenta), quem fotografa confere pelas
//   linhas da tela, como sempre foi. Nada trava por causa da detecção.
//
// Tudo aqui é regra pura: quem lê sensor e imagem é a câmera.

export type Luz = 'nivel' | 'altura' | 'distancia';
export const LUZES: Luz[] = ['nivel', 'altura', 'distancia'];

/** O que fica gravado como fora do padrão: as luzes e a foto tremida. */
export type Fora = Luz | 'tremida';

export interface FonteDasLuzes {
  /** o sensor: verdadeiro no nível, falso fora, `null` quando não há leitura */
  nivel: boolean | null;
  /** a detecção do corpo, quando ativa; `null` quando não há */
  det?: { altura: boolean; distancia: boolean } | null;
  /** o que quem fotografa conferiu a olho, para a luz que não se mede */
  conferi?: Partial<Record<Luz, boolean>> | null;
}

export interface Luzes {
  nivel: boolean;
  altura: boolean;
  distancia: boolean;
  /** quais luzes o app mede sozinho; as outras são conferidas a olho */
  medida: Record<Luz, boolean>;
}

export function luzes(f: FonteDasLuzes): Luzes {
  const c = f.conferi || {};
  const medeNivel = typeof f.nivel === 'boolean';
  const det = f.det || null;
  return {
    nivel: medeNivel ? !!f.nivel : !!c.nivel,
    altura: det ? !!det.altura : !!c.altura,
    distancia: det ? !!det.distancia : !!c.distancia,
    medida: { nivel: medeNivel, altura: !!det, distancia: !!det }
  };
}

/** As luzes que não estão verdes, na ordem em que se acertam. */
export function apagadas(l: Luzes): Luz[] {
  return LUZES.filter(function (k) { return !l[k]; });
}

/** O botão destrava com as três verdes, ou quando quem fotografa escolheu tirar mesmo assim. */
export function liberado(l: Luzes, forcado: boolean): boolean {
  return forcado || apagadas(l).length === 0;
}

/**
 * O `fora` de uma foto: o que não estava verde no disparo e, se o celular
 * girava acima do limite no toque, a tremida. Lista vazia = no padrão.
 */
export function foraNoDisparo(l: Luzes, tremida: boolean): Fora[] {
  const f: Fora[] = apagadas(l);
  if (tremida) f.push('tremida');
  return f;
}

/** "nível", "altura e distância": as luzes, escritas para a tela. */
const NOME: Record<Fora, string> = { nivel: 'nível', altura: 'altura', distancia: 'distância', tremida: 'tremida' };
export function nomesDoFora(f: Fora[]): string {
  const n = f.map(function (k) { return NOME[k]; });
  return n.length <= 1 ? (n[0] || '') : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1];
}
