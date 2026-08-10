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
      const conteudo = Object.values(bundle)
        .map(a => (a.type === 'chunk' ? a.code : a.source))
        .join('');

      const locais = ['./', './index.html', './manifest.webmanifest',
        './icone-180.png', './icone-192.png', './icone-512.png', './icone-512-mascara.png']
        .concat(emitidos.filter(f => !f.endsWith('.map') && !f.endsWith('.html')));

      const hash = createHash('sha256').update(conteudo).digest('hex').slice(0, 12);

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: readFileSync('src/sw.js', 'utf8')
          .replace("const CACHE = '__CACHE__';", "const CACHE = 'treino-" + hash + "';")
          .replace('const LOCAIS = __LOCAIS__;', 'const LOCAIS = ' + JSON.stringify(locais, null, 2) + ';')
      });
    }
  };
}

// Build do Treino. A saída continua sendo um punhado de arquivos estáticos que
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
    // Desligado de propósito enquanto os testes alcançam o escopo do módulo por
    // `window.__escopo` (eval). Minificador que renomeia binding de módulo
    // quebraria isso em silêncio. Volta a ligar quando os testes importarem os
    // módulos direto — fase 2.
    minify: false,
    sourcemap: true,
    rollupOptions: {
      // Desligado durante a transição. O app tem um ponto de entrada só e não
      // carrega código morto, então shaking não economiza nada aqui — mas
      // apagou funções que os testes alcançam por `window.__escopo` (string,
      // não referência estática). Some junto com o `__escopo`, na fase 2.
      treeshake: false,
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

  server: { port: 5173 }
});
