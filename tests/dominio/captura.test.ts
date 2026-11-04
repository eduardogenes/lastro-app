// O que a foto de corpo leva sobre a própria captura: o nível do celular, a
// lente da câmera do app e a lente que o EXIF da câmera do sistema conta.
//
// Os três nasceram da auditoria das fotos (docs/fotos/01-captura.md): lente e
// inclinação mudam a foto mais do que duas semanas de treino, e nenhuma das
// duas dá para ler na foto depois. Aqui está escrito que a leitura é certa —
// e que, quando o aparelho não informa, a foto é guardada igual, sem o dado.

import { describe, expect, it } from 'vitest';
import { angulos, criaMovimento, foraDoNivel, noNivel, velocidade } from '../../src/infra/nivel';
import { leExif } from '../../src/infra/exif';
import { fixaZoom, lenteDe } from '../../src/infra/camera';

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

  it('no nível é até 1° para a frente e até 2° de lado', () => {
    // F9: para a frente muda a proporção do corpo; de lado só gira a foto
    expect(noNivel({ lado: 2, frente: 1 })).toBe(true);
    expect(noNivel({ lado: 2.1, frente: 0 })).toBe(false);
    expect(noNivel({ lado: 0, frente: 1.1 })).toBe(false);
    expect(noNivel(null)).toBe(false);
  });

  it('quem já estava no nível só sai depois da folga, e o verde não pisca', () => {
    expect(noNivel({ lado: 0, frente: 1.2 }, true)).toBe(true);
    expect(noNivel({ lado: 0, frente: 1.2 }, false)).toBe(false);
    expect(noNivel({ lado: 2.31, frente: 0 }, true)).toBe(false);
  });

  it('o que passou da régua, em palavras, para o aviso de foto torta', () => {
    expect(foraDoNivel({ lado: 0.5, frente: 1.44 })).toBe('frente 1,4°');
    expect(foraDoNivel({ lado: 2.6, frente: 1.2 })).toBe('de lado 2,6° · frente 1,2°');
    expect(foraDoNivel({ lado: 1, frente: 0.2 })).toBe('');
  });
});

describe('o giro do celular, pelo giroscópio', () => {
  it('a velocidade junta os três eixos; sem leitura, null', () => {
    expect(velocidade({ alpha: 3, beta: 4, gamma: 0 })).toBe(5);
    expect(velocidade({ alpha: null, beta: 1, gamma: 1 })).toBeNull();
    expect(velocidade(null)).toBeNull();
  });

  it('no toque: o giro do instante e o maior do segundo antes', () => {
    const m = criaMovimento();
    m.registra(6, 900);             // mais de um segundo antes: sai da janela
    m.registra(0.04, 1500);
    m.registra(0.08, 1900);
    m.registra(0.05, 2000);
    expect(m.resumo(2000)).toEqual({ toque: 0.1, seg: 0.08 });
    expect(criaMovimento().resumo(2000)).toBeNull();
  });
});

describe('a câmera na 1×', () => {
  const faixa = (zoom: { min: number; max: number } | null) => {
    const pedidos: unknown[] = [];
    return {
      pedidos,
      stream: { getVideoTracks: () => [{
        getCapabilities: () => (zoom ? { zoom } : {}),
        applyConstraints: async (c: unknown) => { pedidos.push(c); }
      }] } as unknown as MediaStream
    };
  };
  it('pede o zoom 1 quando a câmera deixa escolher', async () => {
    const f = faixa({ min: 0.5, max: 10 });
    expect(await fixaZoom(f.stream)).toBe(true);
    expect(f.pedidos).toEqual([{ advanced: [{ zoom: 1 }] }]);
  });
  it('sem zoom, ou sem a 1× na faixa, deixa como abriu', async () => {
    const a = faixa(null), b = faixa({ min: 2, max: 6 });
    expect(await fixaZoom(a.stream)).toBe(false);
    expect(await fixaZoom(b.stream)).toBe(false);
    expect(a.pedidos.length + b.pedidos.length).toBe(0);
    expect(await fixaZoom(null)).toBe(false);
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
