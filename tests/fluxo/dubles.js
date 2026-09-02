// Os dublês que as duas suítes de foto compartilham.
//
// Foto de aparelho e foto de corpo passam pelo MESMO caminho de bytes — reduz,
// grava no Cache Storage, sobe para um bucket — e o jsdom não tem nenhuma das
// três peças que esse caminho exige: Cache Storage, `createImageBitmap` e
// `canvas.toBlob`. Manter duas cópias destes dublês seria manter dois contratos
// de mentira que podem divergir sem ninguém notar, justamente sobre a parte do
// app onde uma divergência custa a foto.

/**
 * Cache Storage, `Response`, `URL.createObjectURL` e o caminho de canvas.
 *
 * `globalThis.__caches` fica exposto: é por ele que o teste vê o que foi
 * gravado, e em qual cache — `lastro-fotos` para aparelho, `lastro-corpo` para
 * corpo.
 */
export function cacheFalso(a) {
  a.E(`
    // o jsdom não traz Response, que o Cache Storage exige para embrulhar bytes
    if (typeof Response === 'undefined') {
      globalThis.Response = function (corpo) { this._c = corpo; };
      globalThis.Response.prototype.blob = async function () { return this._c; };
    }
    if (typeof URL.createObjectURL !== 'function') {
      let n = 0;
      URL.createObjectURL = () => 'blob:teste/' + (++n);
      URL.revokeObjectURL = () => {};
    }
    globalThis.__caches = {};
    // keys() devolve REQUISIÇÃO, não string — e quem poda lê o .url dela para
    // descobrir de que sessão é o byte. Um dublê que devolvesse string faria a
    // poda não casar com nada e passar no teste sem apagar coisa nenhuma: o
    // resultado certo pelo motivo errado, no único lugar do app que apaga foto.
    // Por isso match/put/delete aceitam os dois formatos, como a API de verdade.
    globalThis.__chaveDeCache = k => (k && typeof k === 'object' && k.url) ? k.url : k;
    globalThis.caches = {
      // abrir um cache que não existe o CRIA, igual à API de verdade — é por
      // isso que a migração pergunta com has() antes de abrir
      open: async function (nome) {
        const c = globalThis.__caches[nome] || (globalThis.__caches[nome] = {});
        const ch = globalThis.__chaveDeCache;
        return {
          put: async function (k, resp) { c[ch(k)] = resp; },
          match: async function (k) { return c[ch(k)] || undefined; },
          keys: async function () { return Object.keys(c).map(u => ({ url: u })); },
          delete: async function (k) { const t = ch(k) in c; delete c[ch(k)]; return t; }
        };
      },
      has: async function (nome) { return nome in globalThis.__caches; },
      delete: async function (nome) {
        const t = nome in globalThis.__caches;
        delete globalThis.__caches[nome];
        return t;
      }
    };
    // createImageBitmap e canvas.toBlob não existem no jsdom
    globalThis.__passos = [];
    // 4000x3000: o que uma foto de telefone realmente entrega
    globalThis.createImageBitmap = async function () {
      return { width: 4000, height: 3000, close: function () {} };
    };
    const criar = document.createElement.bind(document);
    document.createElement = function (tag) {
      const el = criar(tag);
      if (tag === 'canvas') {
        el.getContext = function () {
          return {
            drawImage: function () { globalThis.__passos.push(el.width + 'x' + el.height); },
            fillRect: function () {},
            set fillStyle(v) {},
            set imageSmoothingEnabled(v) { globalThis.__suave = v; },
            set imageSmoothingQuality(v) { globalThis.__qual = v; }
          };
        };
        el.toBlob = function (cb, tipo) {
          globalThis.__medida = { l: el.width, a: el.height };
          cb(tipo === 'image/webp' ? new Blob(['x'.repeat(6000)], { type: 'image/webp' }) : null);
        };
      }
      return el;
    };
  `);
}

/** As chaves gravadas num cache, ordenadas. */
export function guardadasEm(a, cache) {
  return Object.keys(a.J('globalThis.__caches[' + JSON.stringify(cache) + '] || {}')).sort();
}

/**
 * Nuvem de mentira com os DOIS buckets, para exercitar a reconciliação de
 * bytes de ponta a ponta.
 *
 * Os dois entram juntos porque uma sincronização mexe nos dois: `reconciliaFotos`
 * e `reconciliaCorpo` rodam uma atrás da outra, e um dublê que só cobrisse
 * metade faria a outra metade estourar em vez de falhar com sentido.
 *
 * O que fica observável: `__bucket`/`__subiu` para aparelho, `__bucketCorpo`/
 * `__subiuCorpo` para corpo.
 */
export function nuvemComBucket(a, comFoto, comCorpo) {
  a.E(`
    globalThis.__bucket = ${JSON.stringify(comFoto || {})};
    globalThis.__subiu = [];
    globalThis.__bucketCorpo = ${JSON.stringify(comCorpo || {})};
    globalThis.__subiuCorpo = [];
    NUVEM.sessao = () => ({ email: 'eu@x.com', uid: 'u1' });
    NUVEM.pronta = async () => NUVEM.sessao();
    NUVEM.puxa = async () => ({ ok: true, v: globalThis.__linha || null });
    NUVEM.empurra = async (deV, data) => {
      globalThis.__linha = { v: (globalThis.__linha ? globalThis.__linha.v : 0) + 1,
                             data: JSON.parse(JSON.stringify(data)) };
      return { ok: true, v: globalThis.__linha.v };
    };
    NUVEM.subirFoto = async (id, blob, ext) => {
      globalThis.__subiu.push(id); globalThis.__bucket[id + '.' + ext] = 1; return { ok: true, v: true };
    };
    NUVEM.baixaFoto = async (id, ext) => ({ ok: true,
      v: globalThis.__bucket[id + '.' + ext] ? new Blob(['bytes'], { type: 'image/' + ext }) : null });
    NUVEM.apagaFoto = async (id, ext) => { delete globalThis.__bucket[id + '.' + ext]; return { ok: true, v: true }; };

    // o caminho do corpo é uma pasta por sessão: 'AAAA-MM-DD/pose.ext'
    NUVEM.subirCorpo = async (d, pose, blob, ext) => {
      globalThis.__subiuCorpo.push(d + '/' + pose);
      globalThis.__bucketCorpo[d + '/' + pose + '.' + ext] = 1;
      return { ok: true, v: true };
    };
    NUVEM.baixaCorpo = async (d, pose, ext) => ({ ok: true,
      v: globalThis.__bucketCorpo[d + '/' + pose + '.' + ext]
        ? new Blob(['bytes'], { type: 'image/' + ext }) : null });
    NUVEM.apagaCorpo = async (d, pose, ext) => {
      delete globalThis.__bucketCorpo[d + '/' + pose + '.' + ext];
      return { ok: true, v: true };
    };
  `);
}
