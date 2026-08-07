// Service worker do Treino Eduardo.
// Estratégia: stale-while-revalidate. Abre instantâneo a partir do cache
// (academia às 6h15, sinal ruim no subsolo) e atualiza por baixo quando há rede.
// Para publicar uma versão nova do app, suba o número do CACHE abaixo.

const CACHE = 'treino-v10';

const LOCAIS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone-180.png',
  './icone-192.png',
  './icone-512.png',
  './icone-512-mascara.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      // um ícone faltando não pode impedir a instalação
      .then(c => Promise.all(LOCAIS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const fonte = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
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
