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

import { Bruto } from './bruto.jsx';

let raiz = null;

/**
 * Monta a árvore no #app. Chamado pelo `render()` do casco, que continua
 * decidindo QUAL tela mostrar — a rota ainda mora em `view`.
 *
 * @param {import('preact').ComponentChild} arvore
 */
export function montaNoApp(arvore) {
  if (!raiz) raiz = document.getElementById('app');
  if (!raiz) return;
  montar(arvore, raiz);
}

/**
 * Monta uma tela que ainda produz string de HTML. Ponte da migração: some
 * quando a última tela virar componente.
 *
 * @param {string} html
 */
export function montaHTML(html) {
  montaNoApp(<Bruto html={html} />);
}
