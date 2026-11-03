// O quadro em pé da câmera de dentro do app (`src/infra/camera.ts`): a mesma
// geometria pinta a tela e monta a foto. O caso que importa é o medido no
// iPhone em 03/11 — o vídeo se anunciando deitado com o conteúdo em pé.

import { afterEach, describe, expect, it } from 'vitest';
import { celularEmPe, desenhaQuadro, tamanhoDoQuadro } from '../../src/infra/camera';

type Chamada = number[];
function contexto() {
  const chamadas: Chamada[] = [];
  return {
    chamadas,
    c: { drawImage: (_v: unknown, ...n: number[]) => { chamadas.push(n); } } as unknown as CanvasRenderingContext2D
  };
}
const video = (l: number, a: number) => ({ videoWidth: l, videoHeight: a }) as HTMLVideoElement;
const g = globalThis as { matchMedia?: unknown };

function noCelular(sim: boolean) {
  g.matchMedia = (q: string) => ({ matches: sim && /portrait|coarse/.test(q) });
}
afterEach(() => { delete g.matchMedia; });

describe('câmera — o quadro em pé', () => {
  it('sabe quando está no celular em pé', () => {
    noCelular(true);
    expect(celularEmPe()).toBe(true);
    noCelular(false);
    expect(celularEmPe()).toBe(false);
    delete g.matchMedia;
    expect(celularEmPe()).toBe(false);
  });

  it('vídeo em pé, do tamanho certo: a foto é o quadro inteiro', () => {
    noCelular(true);
    const v = video(1080, 1440);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 1080, a: 1440 });
    const { c, chamadas } = contexto();
    desenhaQuadro(c, v, 1080, 1440);
    expect(chamadas).toEqual([[0, 0, 1080, 1440]]);
  });

  it('o caso do iPhone: vídeo anunciado deitado com o celular em pé vira quadro em pé, inteiro, sem recorte calculado', () => {
    // Os números do vídeo estão trocados: calcular recorte com eles foi o que
    // cortou 55% × 55% da tela. O vídeo inteiro vai para o retângulo em pé.
    noCelular(true);
    const v = video(1440, 1080);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 1080, a: 1440 });
    const foto = contexto(), tela = contexto();
    desenhaQuadro(foto.c, v, 1080, 1440);
    desenhaQuadro(tela.c, v, 748, 998);
    expect(foto.chamadas).toEqual([[0, 0, 1080, 1440]]);
    expect(tela.chamadas).toEqual([[0, 0, 748, 998]]);
  });

  it('a webcam do notebook, deitada de verdade: o meio em 3:4, na tela e na foto', () => {
    noCelular(false);
    const v = video(1920, 1080);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 810, a: 1080 });
    const { c, chamadas } = contexto();
    desenhaQuadro(c, v, 810, 1080);
    expect(chamadas).toEqual([[555, 0, 810, 1080, 0, 0, 810, 1080]]);
  });

  it('vídeo em pé mais comprido que 3:4: a tela corta em cima e embaixo, sem esticar', () => {
    noCelular(true);
    const { c, chamadas } = contexto();
    desenhaQuadro(c, video(1080, 1920), 750, 1000);
    expect(chamadas).toEqual([[0, 240, 1080, 1440, 0, 0, 750, 1000]]);
  });
});
