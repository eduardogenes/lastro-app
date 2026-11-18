// As CAMADAS do visual novo: a trava do fundo, o isolamento e o foco.
//
// Toda folha e todo painel (confirmação, falha) passam por aqui. A camada de
// cima é a única alcançável pelo Tab, pelo leitor de tela e pelo dedo; o fundo
// não rola enquanto houver uma aberta; ao sair, o foco volta a quem a abriu.
//
// Veio de `src/ui/instrumento/folha.jsx` na Fase 5, quando o visual antigo
// saiu (docs/redesign-3/00-plano.md). O comportamento é o mesmo.

import { createContext } from 'preact';

/**
 * Onde a folha está na pilha (0 a de baixo): dá a ordem de empilhamento.
 * Pela posição, e nunca por um nível fixo: duas folhas do mesmo tipo podem
 * estar abertas uma sobre a outra.
 */
export const LugarNaPilha = createContext(0);

/**
 * A TRAVA do fundo. Com uma camada aberta, o corpo fica fixo na posição em que
 * estava (`top` negativo) e volta para ela ao destravar. A contagem existe
 * porque as folhas empilham: destravar na primeira que fechar soltaria o
 * corpo com outras ainda abertas.
 */
let travas = 0;
let yGravado = 0;

export function trava() {
  if (travas++ > 0) return;
  yGravado = window.scrollY;
  document.body.style.top = `-${yGravado}px`;
  document.body.classList.add('travado');
}

export function destrava() {
  if (--travas > 0) return;
  travas = 0;
  document.body.classList.remove('travado');
  document.body.style.top = '';
  // instantâneo: rolar suave depois de a folha sumir parece defeito
  window.scrollTo({ top: yGravado, behavior: 'instant' });
}

/**
 * O ISOLAMENTO. `aria-modal` descreve a intenção; quem impede o foco de vazar
 * é o `inert` nos irmãos da camada de cima. A ordem, da mais alta para a mais
 * baixa: os painéis (confirmação e falha), depois as folhas (entre duas, a que
 * veio depois). É derivado a cada camada que nasce ou sai, então a ordem de abrir e
 * fechar não importa.
 */
// (a confirmação e o aviso de falha usam a mesma moldura, `.v3-pare-w`; com os
// dois na tela, a de cima é a que veio depois na árvore, a confirmação)
const CAMADAS = ['.v3-pare-w', '.v3-folha-w'];
/** A marca do que ESTE isolamento tornou inerte, para desfazer só o que é dele. */
const MARCA = 'data-isolado';

function camadaDeCima(saindo) {
  for (let i = 0; i < CAMADAS.length; i++) {
    const todas = [].slice.call(document.querySelectorAll(CAMADAS[i]))
      .filter(function (el) { return el !== saindo; });
    if (todas.length) return todas[todas.length - 1];
  }
  return null;
}

/**
 * Isola tudo o que não é a camada de cima. `saindo` é a que está sendo
 * desmontada agora: o Preact roda a limpeza antes de tirar o nó da árvore.
 */
export function isolaACamadaDeCima(saindo) {
  const topo = camadaDeCima(saindo);
  const devem = [];
  if (topo && topo.parentElement) {
    [].slice.call(topo.parentElement.children).forEach(function (el) {
      if (el !== topo && el !== saindo) devem.push(el);
    });
  }
  [].slice.call(document.querySelectorAll('[' + MARCA + ']')).forEach(function (el) {
    if (devem.indexOf(el) >= 0) return;
    el.removeAttribute('inert');
    el.removeAttribute(MARCA);
  });
  devem.forEach(function (el) {
    if (el.hasAttribute('inert')) return;
    // o atributo, e não a propriedade: é consultável por seletor, e é assim
    // que o teste cobra que o fundo ficou isolado
    el.setAttribute('inert', '');
    el.setAttribute(MARCA, '');
  });
}

/**
 * Uma camada que chega: isola o resto, leva o foco para `alvo` (sem rolar) e
 * devolve a função que, na saída, isola de novo sem ela e devolve o foco a
 * quem o tinha, se ele ainda estiver na página e alcançável.
 */
export function abreCamada(camada, alvo) {
  const acionador = document.activeElement;
  isolaACamadaDeCima();
  if (alvo && !alvo.closest('[inert]')) alvo.focus({ preventScroll: true });
  return function () {
    isolaACamadaDeCima(camada);
    if (acionador && acionador !== document.body && acionador.isConnected &&
        !acionador.closest('[inert]') && acionador.focus) {
      acionador.focus({ preventScroll: true });
    }
  };
}
