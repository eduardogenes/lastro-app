// O que a foto de corpo leva sobre a própria captura: o nível do celular, a
// lente da câmera do app e a lente que o EXIF da câmera do sistema conta.
//
// Os três nasceram da auditoria das fotos (docs/fotos/01-captura.md): lente e
// inclinação mudam a foto mais do que duas semanas de treino, e nenhuma das
// duas dá para ler na foto depois. Aqui está escrito que a leitura é certa —
// e que, quando o aparelho não informa, a foto é guardada igual, sem o dado.

import { describe, expect, it } from 'vitest';
import { angulos, noNivel } from '../../src/infra/nivel';
import { leExif } from '../../src/infra/exif';
import { lenteDe } from '../../src/infra/camera';

const G = 9.81;
const rad = (g: number) => g * Math.PI / 180;

describe('o nível pela gravidade', () => {
  it('em pé e reto, zero nas duas', () => {
    expect(angulos(0, G, 0)).toEqual({ lado: 0, frente: 0 });
  });

  it('girado no plano da tela: o lado mede, a frente não', () => {
    const n = angulos(G * Math.sin(rad(4.2)), G * Math.cos(rad(4.2)), 0)!;
    expect(n.lado).toBeCloseTo(4.2, 1);
    expect(n.frente).toBe(0);
  });

  it('inclinado para trás: a frente mede, o lado não', () => {
    const n = angulos(0, G * Math.cos(rad(2)), -G * Math.sin(rad(2)))!;
    expect(n.frente).toBeCloseTo(2, 1);
    expect(n.lado).toBe(0);
  });

  it('o sinal trocado do iOS dá o mesmo tamanho', () => {
    // o iOS já entregou o vetor com os eixos invertidos; o nível só promete o tamanho
    const a = angulos(1.2, G, -0.5)!, b = angulos(-1.2, -G, 0.5)!;
    expect(b).toEqual(a);
  });

  it('deitado, ou sem gravidade para ler, não há nível de retrato', () => {
    expect(angulos(0, 0, G)).toBeNull();          // deitado na mesa
    expect(angulos(0, 0.5, 0.3)).toBeNull();      // em queda, ou sensor falso
    expect(angulos(NaN, G, 0)).toBeNull();
  });

  it('no nível é até 1° nas duas', () => {
    expect(noNivel({ lado: 1, frente: 0.4 })).toBe(true);
    expect(noNivel({ lado: 1.1, frente: 0 })).toBe(false);
    expect(noNivel(null)).toBe(false);
  });
});

/**
 * Um JPEG mínimo com EXIF: SOI, APP1 "Exif" com um TIFF (IFD0 apontando para o
 * IFD do Exif, que tem a focal em 35 mm e o LensModel), e SOS.
 */
function jpegComExif(lente: string, mm: number, intel = false): ArrayBuffer {
  const tiff: number[] = [];
  const u16 = (n: number) => intel ? [n & 255, n >> 8] : [n >> 8, n & 255];
  const u32 = (n: number) => intel
    ? [n & 255, (n >> 8) & 255, (n >> 16) & 255, n >>> 24]
    : [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255];
  const txt = Array.from(lente).map(c => c.charCodeAt(0)).concat([0]);
  // cabeçalho (8) + IFD0 com 1 entrada (2 + 12 + 4 = 18) → IFD do Exif no 26
  tiff.push(...(intel ? [0x49, 0x49] : [0x4D, 0x4D]), ...u16(42), ...u32(8));
  tiff.push(...u16(1), ...u16(0x8769), ...u16(4), ...u32(1), ...u32(26), ...u32(0));
  // IFD do Exif com 2 entradas (2 + 24 + 4 = 30) → o texto da lente no 56
  tiff.push(...u16(2));
  tiff.push(...u16(0xA405), ...u16(3), ...u32(1), ...u16(mm), 0, 0);
  tiff.push(...u16(0xA434), ...u16(2), ...u32(txt.length), ...u32(56));
  tiff.push(...u32(0));
  tiff.push(...txt);
  const app1 = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const tam = app1.length + 2;
  const bytes = [0xFF, 0xD8, 0xFF, 0xE1, tam >> 8, tam & 255, ...app1, 0xFF, 0xDA, 0, 2];
  return new Uint8Array(bytes).buffer;
}

describe('a lente pelo EXIF da câmera do sistema', () => {
  it('lê o LensModel e a focal em 35 mm, nas duas ordens de byte', () => {
    const lente = 'iPhone 11 Pro Max back triple camera 6mm f/2';
    expect(leExif(jpegComExif(lente, 52))).toEqual({ lente, mm: 52 });
    expect(leExif(jpegComExif(lente, 26, true))).toEqual({ lente, mm: 26 });
  });

  it('o que não é JPEG com EXIF devolve vazio, nunca erro', () => {
    expect(leExif(new Uint8Array([1, 2, 3, 4]).buffer)).toEqual({});
    expect(leExif(new Uint8Array([0xFF, 0xD8, 0xFF, 0xDA, 0, 2]).buffer)).toEqual({});
    expect(leExif(new ArrayBuffer(0))).toEqual({});
    // cortado no meio do EXIF: sem a lente, mas sem estourar
    expect(leExif(jpegComExif('x', 52).slice(0, 30))).toEqual({});
  });
});

describe('a lente da câmera do app', () => {
  const stream = (faixa: unknown) => ({ getVideoTracks: () => (faixa ? [faixa] : []) }) as unknown as MediaStream;

  it('o rótulo da câmera e o zoom, quando o navegador diz', () => {
    expect(lenteDe(stream({ label: 'Câmera Traseira', getSettings: () => ({ zoom: 1 }) })))
      .toEqual({ nome: 'Câmera Traseira', zoom: 1 });
  });

  it('sem nada a dizer, null; e nunca estoura', () => {
    expect(lenteDe(stream({ label: '', getSettings: () => ({}) }))).toBeNull();
    expect(lenteDe(stream(null))).toBeNull();
    expect(lenteDe(null)).toBeNull();
    expect(lenteDe(stream({ get label() { throw new Error('x'); } }))).toBeNull();
  });
});
