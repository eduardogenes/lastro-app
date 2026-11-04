// O que a foto da câmera do sistema conta de si mesma.
//
// O app recomprime toda foto de corpo (`reduzPara`), e o canvas não leva o
// EXIF junto. Por isso a lente é lida AQUI, dos bytes originais, antes da
// redução: é o único momento em que ela existe.
//
// Por que a lente: 1× e 2× desenham o corpo com perspectivas diferentes, e a
// auditoria das fotos (docs/fotos/01-captura.md) não conseguiu dizer qual foi
// usada em nenhuma sessão. Com isto gravado, os dados dizem — sem ninguém
// precisar lembrar nem testar à mão.
//
// Só o que interessa, e só JPEG: o LensModel (0xA434) e a focal equivalente em
// 35 mm (0xA405), do IFD do Exif. Qualquer coisa fora do formato devolve vazio,
// nunca erro: faltar a lente não pode impedir a foto de ser guardada.

export interface DoExif {
  /** ex.: "iPhone 11 Pro Max back triple camera 4.25mm f/1.8" */
  lente?: string;
  /** focal equivalente em 35 mm: 26 é a 1×, 52 a 2×, 13 a ultra-angular */
  mm?: number;
}

/** Os primeiros bytes bastam: o EXIF mora no começo do JPEG. */
export const BYTES_DO_EXIF = 256 * 1024;

export function leExif(buf: ArrayBuffer): DoExif {
  try {
    const v = new DataView(buf);
    if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return {};
    let o = 2;
    while (o + 4 <= v.byteLength) {
      if (v.getUint8(o) !== 0xFF) return {};
      const marca = v.getUint8(o + 1);
      const tam = v.getUint16(o + 2);
      if (marca === 0xDA || marca === 0xD9) return {};    // começou a imagem: não há EXIF
      if (marca === 0xE1 && o + 10 <= v.byteLength && v.getUint32(o + 4) === 0x45786966) {
        return doTiff(v, o + 10, Math.min(v.byteLength, o + 2 + tam));
      }
      o += 2 + tam;
    }
  } catch (e) {}
  return {};
}

function doTiff(v: DataView, base: number, fim: number): DoExif {
  const le = v.getUint16(base) === 0x4949;
  const u16 = function (p: number) { return v.getUint16(p, le); };
  const u32 = function (p: number) { return v.getUint32(p, le); };
  if (u16(base + 2) !== 42) return {};

  const entradas = function (p: number, cada: (tag: number, tipo: number, n: number, valor: number) => void) {
    if (p + 2 > fim) return;
    const n = u16(p);
    for (let i = 0; i < n; i++) {
      const e = p + 2 + i * 12;
      if (e + 12 > fim) return;
      cada(u16(e), u16(e + 2), u32(e + 4), e + 8);
    }
  };

  let exif = 0;
  entradas(base + u32(base + 4), function (tag, _tipo, _n, valor) {
    if (tag === 0x8769) exif = base + u32(valor);
  });
  const r: DoExif = {};
  if (!exif) return r;
  entradas(exif, function (tag, tipo, n, valor) {
    if (tag === 0xA405 && tipo === 3) {
      const mm = u16(valor);
      if (mm > 0) r.mm = mm;
    }
    if (tag === 0xA434 && tipo === 2) {
      const t = texto(v, n <= 4 ? valor : base + u32(valor), n, fim);
      if (t) r.lente = t;
    }
  });
  return r;
}

function texto(v: DataView, p: number, n: number, fim: number): string {
  let s = '';
  for (let i = 0; i < n && p + i < fim; i++) {
    const c = v.getUint8(p + i);
    if (!c) break;
    s += String.fromCharCode(c);
  }
  return s.trim().slice(0, 80);
}

/** A lente de um arquivo de foto. Nunca estoura: sem EXIF, devolve vazio. */
export async function exifDoArquivo(arquivo: Blob | null | undefined): Promise<DoExif> {
  try {
    if (!arquivo || typeof arquivo.slice !== 'function') return {};
    return leExif(await bytesDe(arquivo.slice(0, BYTES_DO_EXIF)));
  } catch (e) {
    return {};
  }
}

/**
 * Os bytes de um pedaço do arquivo. `Blob.arrayBuffer` só chegou ao Safari no
 * iOS 14; antes dele, e no jsdom dos testes, quem lê é o `FileReader`.
 */
function bytesDe(b: Blob): Promise<ArrayBuffer> {
  if (typeof b.arrayBuffer === 'function') return b.arrayBuffer();
  return new Promise(function (ok, falha) {
    const r = new FileReader();
    r.onload = function () { ok(r.result as ArrayBuffer); };
    r.onerror = function () { falha(r.error); };
    r.readAsArrayBuffer(b);
  });
}
