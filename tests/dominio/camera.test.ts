// O quadro em pé da câmera de dentro do app (`src/infra/camera.ts`): a mesma
// geometria pinta a tela e monta a foto, e a regra é uma só — preencher sem
// esticar, como o `object-fit: cover`.
//
// O caso que custou o dia 03/11: desenhar um quadro deitado num retângulo em pé
// esticou a foto 1,79×. Aqui está escrito que isso não volta.

import { describe, expect, it } from 'vitest';
import { desenhaQuadro, tamanhoDoQuadro } from '../../src/infra/camera';

type Chamada = number[];
function contexto() {
  const chamadas: Chamada[] = [];
  return {
    chamadas,
    c: { drawImage: (_v: unknown, ...n: number[]) => { chamadas.push(n); } } as unknown as CanvasRenderingContext2D
  };
}
const video = (l: number, a: number) => ({ videoWidth: l, videoHeight: a }) as HTMLVideoElement;

/** A proporção da origem e a do destino de um desenho: iguais = não esticou. */
function proporcoes(ch: Chamada): [number, number] {
  return ch.length === 4 ? [NaN, NaN] : [ch[2] / ch[3], ch[6] / ch[7]];
}

describe('câmera — o quadro em pé', () => {
  it('vídeo em pé, 3:4: a foto é o quadro inteiro, e a tela também', () => {
    const v = video(1080, 1440);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 1080, a: 1440 });
    const foto = contexto(), tela = contexto();
    desenhaQuadro(foto.c, v, 1080, 1440);
    desenhaQuadro(tela.c, v, 744, 992);
    expect(foto.chamadas).toEqual([[0, 0, 1080, 1440]]);
    expect(tela.chamadas).toEqual([[0, 0, 744, 992]]);
  });

  it('vídeo deitado: o meio em 3:4, na foto e na tela, sem esticar', () => {
    const v = video(1440, 1080);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 810, a: 1080 });
    const foto = contexto(), tela = contexto();
    desenhaQuadro(foto.c, v, 810, 1080);
    desenhaQuadro(tela.c, v, 744, 992);
    expect(foto.chamadas).toEqual([[315, 0, 810, 1080, 0, 0, 810, 1080]]);
    const [origem, destino] = proporcoes(tela.chamadas[0]);
    expect(origem).toBeCloseTo(destino, 3);
    expect(tela.chamadas[0].slice(0, 2)).toEqual([315, 0]);   // o mesmo meio da foto
  });

  it('nunca desenha um quadro deitado inteiro num retângulo em pé', () => {
    const { c, chamadas } = contexto();
    desenhaQuadro(c, video(1440, 1080), 1080, 1440);
    expect(chamadas[0]).not.toEqual([0, 0, 1080, 1440]);
    const [origem, destino] = proporcoes(chamadas[0]);
    expect(origem).toBeCloseTo(destino, 3);
  });

  it('a webcam 16:9 do notebook: o meio em 3:4', () => {
    const v = video(1920, 1080);
    expect(tamanhoDoQuadro(v)).toEqual({ l: 810, a: 1080 });
    const { c, chamadas } = contexto();
    desenhaQuadro(c, v, 810, 1080);
    expect(chamadas).toEqual([[555, 0, 810, 1080, 0, 0, 810, 1080]]);
  });

  it('vídeo em pé mais comprido que 3:4: a tela corta em cima e embaixo, sem esticar', () => {
    const { c, chamadas } = contexto();
    desenhaQuadro(c, video(1080, 1920), 750, 1000);
    expect(chamadas).toEqual([[0, 240, 1080, 1440, 0, 0, 750, 1000]]);
  });
});
