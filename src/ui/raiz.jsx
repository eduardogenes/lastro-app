// A raiz do render.
//
// Antes: `render()` montava uma string de 200 linhas e escrevia em
// `#app.innerHTML`. Isso reconstruía o DOM inteiro a cada tecla — daí as
// gambiarras de devolver o foco à mão, e daí o valor dos campos viver só no
// DOM, que foi a origem de dois bugs que perdiam série registrada.
//
// Agora `#app` pertence ao Preact: o diff toca só no que mudou, campo em foco
// continua em foco, e o rascunho é a fonte de verdade em vez de um espelho.

import { render as montar } from 'preact';

let raiz = null;

/**
 * Monta a árvore no #app. Chamado pelo `render()` do casco, que continua
 * decidindo QUAL tela mostrar — a rota ainda mora em `view`.
 *
 * @param {import('preact').ComponentChild} arvore
 */
export function montaNoApp(arvore) {
  if (!raiz) {
    raiz = document.getElementById('app');
    if (!raiz) return;
    // O Preact NÃO remove o que já estava no container: no primeiro render ele
    // não tem árvore antiga para comparar, então cria os nós dele e deixa o
    // resto onde estava. O placeholder "Carregando seu histórico…" do
    // index.html ficava para sempre no topo da tela, e qualquer resíduo de uma
    // troca de módulo pelo HMR ficava junto. Limpar uma vez, aqui, resolve os
    // dois — e tem que ser antes do primeiro montar(), nunca depois.
    raiz.textContent = '';
  }
  montar(arvore, raiz);
}

