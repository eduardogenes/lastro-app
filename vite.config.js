import { defineConfig } from 'vite';

// Build do Treino. A saída continua sendo um punhado de arquivos estáticos que
// qualquer hospedagem serve — o que mudou é que o fonte deixou de ser um HTML
// de 5.279 linhas.
export default defineConfig({
  // Caminhos relativos: o app precisa abrir sob qualquer prefixo, inclusive
  // um preview de deploy servido de subpasta.
  base: './',

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

  server: { port: 5173 }
});
