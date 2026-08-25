// Service worker do Treino Eduardo. MOLDE: o build gera o dist/sw.js a partir
// daqui, preenchendo o nome do cache e a lista de arquivos com o que acabou de
// ser emitido (ver o plugin sw-versionado em vite.config.js).
//
// Estratégia: stale-while-revalidate. Abre instantâneo a partir do cache
// (academia às 6h15, sinal ruim no subsolo) e atualiza por baixo quando há rede.
//
// O número da versão saiu da mão. Antes era um `const CACHE = 'treino-v28'`
// que precisava ser incrementado a cada publicação — e esquecer significava
// publicar e o aparelho continuar servindo a versão velha, sem aviso nenhum.
// Agora ele vem do hash dos assets: mudou o código, mudou o cache.
const CACHE = '__CACHE__';

const LOCAIS = __LOCAIS__;

/** Cache das fotos que ELE tirou. Sem versão no nome: não é asset, é dado. */
const FOTOS = 'treino-fotos';

/**
 * Busca em fila, não todas de uma vez.
 *
 * `Promise.all` sobre a lista inteira dispara uma requisição por arquivo no
 * mesmo instante. Com os poucos arquivos de hoje isso é inofensivo; a partir de
 * algumas dezenas, o navegador enfileira, o sinal ruim do subsolo derruba as
 * do fim da fila, e o `.catch` abaixo engole cada falha em silêncio — o app
 * instala, se declara pronto, e só descobre o buraco quando abre offline.
 *
 * Seis por vez é o que um navegador abre por origem de qualquer forma.
 */
async function guardaEmFila(cache, urls, largura) {
  const fila = urls.slice();
  const trabalhadores = [];
  for (let i = 0; i < largura; i++) {
    trabalhadores.push((async function () {
      while (fila.length) {
        const u = fila.shift();
        // um ícone faltando não pode impedir a instalação
        try { await cache.add(u); } catch (e) {}
      }
    })());
  }
  await Promise.all(trabalhadores);
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => guardaEmFila(c, LOCAIS, 6))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      // FOTOS sobrevive à limpeza de propósito: é dado do usuário, não asset do
      // build. O nome do cache do build muda a cada publicação, e apagar tudo
      // que não é o atual levaria junto fotos que não têm como ser refeitas.
      .then(ks => Promise.all(
        ks.filter(k => k !== CACHE && k !== FOTOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const fonte = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  // NÃO alargue isto para "cachear tudo". A sincronização é uma chamada de
  // outra origem, e servi-la do cache devolveria um estado velho como se fosse
  // o da nuvem — o app fundiria contra o passado e reescreveria por cima do
  // presente. O que é dado vivo passa direto; o que é asset é que se cacheia.
  if (!mesmaOrigem && !fonte) return;

  // Navegação sempre resolve para o index em cache: garante abrir offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copia)).catch(() => {});
          return r;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cacheado) {
      const rede = fetch(req).then(function (r) {
        if (r && (r.ok || r.type === 'opaque')) {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        }
        return r;
      }).catch(function () { return cacheado; });
      return cacheado || rede;
    })
  );
});
