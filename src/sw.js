// Service worker do Lastro. MOLDE: o build gera o dist/sw.js a partir
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

/**
 * Caches das fotos que ELE tirou. Sem versão no nome: não é asset, é dado.
 *
 * O worker não SERVE estas fotos — quem as lê é a página, que transforma os
 * bytes num endereço de objeto. Os nomes vivem aqui por uma razão só: poupar
 * estes caches da limpeza de ativação, logo abaixo.
 *
 * `lastro-fotos` são as dos aparelhos; `lastro-corpo`, as do corpo;
 * `lastro-lousa`, a foto da lousa do box. Esta lista
 * esqueceu `lastro-corpo` quando o protocolo de fotos nasceu, e cada versão
 * publicada apagava a cópia local das fotos do corpo — as que ainda não tinham
 * subido se perdiam (F252). Um caso de `publicacao.test.js` cobra agora que todo
 * cache de dado declarado em `src/infra` esteja aqui.
 *
 * `treino-fotos` é como o cache dos aparelhos se chamava antes de o app virar
 * Lastro, e ele precisa sobreviver à limpeza até a página ter copiado os bytes
 * para `lastro-fotos` — a ativação do worker não espera a página, então apagar
 * aqui primeiro apagaria as fotos antes da migração.
 */
const FOTOS = ['lastro-fotos', 'lastro-corpo', 'lastro-lousa', 'treino-fotos'];

/**
 * As ANIMAÇÕES dos exercícios do programa ativo (Fase D): imagens de outra
 * origem (bases livres), guardadas para a academia sem sinal. A página pede
 * (`guarda-midia`) e o worker serve daqui primeiro. O vídeo do YouTube NUNCA
 * passa por aqui: é um iframe de outra origem, e o worker não o toca.
 */
const MIDIA = 'lastro-midia';

/**
 * O MOTOR DA DETECÇÃO DO CORPO (`pose/`: o modelo e o MediaPipe, uns 20 MB).
 * Fica fora da instalação e do cache do build: baixa na primeira vez que a
 * câmera abre e mora aqui, com o nome da versão. Publicar o app não o baixa de
 * novo; trocar a versão do motor troca o nome, e o antigo sai na ativação.
 */
const MOTOR = 'lastro-pose-1.2.2';

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
        ks.filter(k => k !== CACHE && k !== MOTOR && k !== MIDIA && FOTOS.indexOf(k) < 0).map(k => caches.delete(k))))
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
  if (!mesmaOrigem && !fonte) {
    // só uma IMAGEM já guardada (animação do exercício) vem do aparelho; dado
    // vivo, vídeo e o resto de fora seguem direto, como sempre
    if (req.destination === 'image') {
      e.respondWith(caches.open(MIDIA).then(function (c) {
        return c.match(req.url).then(function (tem) { return tem || fetch(req); });
      }));
    }
    return;
  }

  // O motor da detecção: do cache dele, e da rede só na primeira vez
  if (mesmaOrigem && url.pathname.indexOf('/pose/') >= 0) {
    e.respondWith(caches.open(MOTOR).then(function (c) {
      return c.match(req).then(function (tem) {
        return tem || fetch(req).then(function (r) { if (r && r.ok) c.put(req, r.clone()); return r; });
      });
    }));
    return;
  }

  // A página de autorizar dos agentes (public/autorizar.html) e as portas do
  // MCP (api/) passam direto. Sem isto, a navegação para /autorizar seria
  // gravada no cache COMO o index.html, e o app abriria offline na página de
  // consentimento.
  if (mesmaOrigem && (/\/autorizar(\.html)?$/.test(url.pathname) || url.pathname.indexOf('/api/') === 0)) return;

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

self.addEventListener('message', function (e) {
  const d = e.data;
  if (!d || d.tipo !== 'guarda-midia' || !Array.isArray(d.urls)) return;
  const urls = d.urls.filter(function (u) { return typeof u === 'string' && /^https:\/\//.test(u); }).slice(0, 200);
  e.waitUntil(caches.open(MIDIA).then(function (c) {
    return Promise.all(urls.map(function (u) {
      return c.match(u).then(function (tem) {
        if (tem) return;
        return fetch(u, { mode: 'no-cors' }).then(function (r) { if (r) return c.put(u, r); }).catch(function () {});
      });
    }));
  }));
});
