import { defineConfig } from 'vitest/config';

// Os testes em dois níveis.
//
// `dominio` importa os módulos direto e roda em milissegundos: é onde moram as
// regras — limites da dieta, atribuição de série por músculo, dupla progressão,
// migrações. Custa tão pouco que dá para testar caso de borda à vontade.
//
// `fluxo` sobe o app inteiro num jsdom a partir do BUILD e aperta botão. É caro
// e continua existindo pelo motivo certo: os bugs que apagavam série apareceram
// na fronteira entre rascunho, DOM e log, e essa fronteira só existe montada.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'dominio',
          environment: 'node',
          include: ['tests/dominio/**/*.test.ts']
        }
      },
      {
        test: {
          name: 'fluxo',
          environment: 'node',
          include: ['tests/fluxo/**/*.test.js']
        }
      }
    ]
  }
});
