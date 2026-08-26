import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Gera o dist/sw.js a partir do molde em src/sw.js, com a lista de arquivos que
// o build acabou de emitir e um CACHE derivado do hash deles.
//
// Isso existe para matar um ritual de publicação: o CACHE era um número
// incrementado à mão, e esquecer de subir significava publicar e o iPhone
// continuar servindo a versão velha — sem erro, sem aviso, só o app parado no
// tempo. Agora mudou um byte, muda o cache.
//
// Não usa Workbox de propósito: o service worker do projeto já resolve o que
// precisa em 70 linhas legíveis (stale-while-revalidate, navegação sempre
// resolvendo para o index em cache, fonte do Google inclusa). Trocar isso por
// um gerador seria adicionar dependência para perder controle.
function servicWorkerVersionado() {
  return {
    name: 'sw-versionado',
    apply: 'build',
    generateBundle(_opcoes, bundle) {
      const emitidos = Object.keys(bundle).map(f => './' + f);

      const locais = ['./', './index.html', './manifest.webmanifest',
        './icone-180.png', './icone-192.png', './icone-512.png', './icone-512-mascara.png']
        .concat(emitidos.filter(f => !f.endsWith('.map') && !f.endsWith('.html')));

      // Alimenta o hash asset a asset, em vez de concatenar tudo numa string.
      // `source` de um asset binário é um Uint8Array, e juntar isso com
      // `join('')` o transforma em texto decimal separado por vírgula —
      // quatro vezes o tamanho, para produzir o mesmo hash. Com um arquivo
      // binário no bundle isso vira megabytes de string por publicação.
      const soma = createHash('sha256');
      Object.values(bundle).forEach(function (a) {
        soma.update(a.type === 'chunk' ? a.code : a.source);
      });
      const hash = soma.digest('hex').slice(0, 12);

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: readFileSync('src/sw.js', 'utf8')
          .replace("const CACHE = '__CACHE__';", "const CACHE = 'lastro-" + hash + "';")
          .replace('const LOCAIS = __LOCAIS__;', 'const LOCAIS = ' + JSON.stringify(locais, null, 2) + ';')
      });
    }
  };
}

// Build do Lastro. A saída continua sendo um punhado de arquivos estáticos que
// qualquer hospedagem serve — o que mudou é que o fonte deixou de ser um HTML
// de 5.279 linhas.
export default defineConfig({
  // Caminhos relativos: o app precisa abrir sob qualquer prefixo, inclusive
  // um preview de deploy servido de subpasta.
  base: './',

  // Preact, não React: 4 kB gzip contra 45. O app abre às 6h15 no subsolo de
  // uma academia, e o peso do runtime é orçamento de tempo de abertura.
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact'
  },

  build: {
    target: 'es2020',
    // Ligado desde que o último `onclick=` saiu do fonte. Enquanto existia a
    // ponte de handlers globais, minificar renomeava os bindings do módulo e
    // matava os botões em silêncio.
    minify: 'esbuild',
    // Desligado: o .map de 435 kB não é usado em produção, e o harness inlina o
    // bundle no jsdom — onde frames viram "https://treino.test/:757" e o Vitest
    // tenta ler isso como caminho de disco ao formatar um stack.
    sourcemap: false,
    rollupOptions: {
      // Ligado junto com o minify. Com ele, uma função que só é alcançada por
      // string — pelos testes, via `__escopo` — simplesmente some do bundle e
      // o teste quebra na hora. Foi assim que `tab()` apareceu: rota paralela
      // a `view.aba`, viva só porque a ponte a republicava em `window`.
      treeshake: true,
      output: {
        // Hash no nome: é o que permite o service worker versionar sozinho, sem
        // o bump manual de CACHE que hoje é ritual de publicação.
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },

  plugins: [servicWorkerVersionado()],

  server: {
    port: 5173,
    // Escuta em todas as interfaces para dar para abrir do iPhone, e aceita o
    // Host do túnel — sem isto o Vite recusa a requisição com "Blocked request".
    // Só o sufixo do ngrok, não `true`: liberar host arbitrário num servidor de
    // desenvolvimento é convite para DNS rebinding.
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io']
  }
});
