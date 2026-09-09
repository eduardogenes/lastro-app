// A folha de baixo — o único padrão modal do sistema.
//
// O que diz "isto é modal" é a linha ácida de 1px no topo, não sombra: o
// Instrumento não tem sombra em lugar nenhum.
//
// Folhas empilham em três níveis, nunca mais: refeição (50) → seletor (70) →
// editor (80). Três é o limite porque na quarta ninguém sabe mais o que
// fechar leva de volta para onde.

import { useEffect, useRef } from 'preact/hooks';

/**
 * Trava o scroll do corpo enquanto a folha está aberta.
 *
 * No iOS, `overflow: hidden` no body NÃO segura o scroll de toque — a página
 * continua rolando por baixo do modal e você perde o lugar onde estava. O
 * único jeito confiável é `position: fixed` com o deslocamento atual gravado
 * em `top`, devolvido na hora de destravar.
 *
 * A contagem existe porque folhas empilham: destravar na primeira que fechar
 * soltaria o corpo com duas ainda abertas.
 */
let travas = 0;
let yGravado = 0;

function trava() {
  if (travas++ > 0) return;
  yGravado = window.scrollY;
  document.body.style.top = `-${yGravado}px`;
  document.body.classList.add('ins-travado');
}

function destrava() {
  if (--travas > 0) return;
  travas = 0;
  document.body.classList.remove('ins-travado');
  document.body.style.top = '';
  // 'instant' e não suave: suave faz a página deslizar sozinha depois que a
  // folha já sumiu, e parece bug.
  window.scrollTo({ top: yGravado, behavior: 'instant' });
}

/**
 * Torna inerte tudo que não é a folha, e devolve a função que desfaz.
 *
 * `aria-modal="true"` DESCREVE a intenção; quem impede o foco de vazar é o
 * `inert`. Sem ele, medido: 39 elementos continuavam tabuláveis atrás da folha
 * e três Tabs saíam dela para a página de baixo.
 *
 * Recebe o INVÓLUCRO da folha e marca os irmãos dele — cabeçalho, `main` e tab
 * bar, todos filhos de `#app`, porque a folha não usa portal e mora na mesma
 * árvore. O véu fica de fora, dentro do invólucro, senão tocar nele para fechar
 * pararia de funcionar.
 *
 * O que já estiver inerte é deixado como está: com duas folhas empilhadas, a de
 * cima não pode desmarcar, ao fechar, o que a de baixo marcou.
 */
function isolaOResto(folha) {
  if (!folha || !folha.parentElement) return function () {};
  const marcados = [];
  [].slice.call(folha.parentElement.children).forEach(function (el) {
    if (el === folha || el.hasAttribute('inert')) return;
    // O ATRIBUTO, e não a propriedade: os dois ligam o mesmo comportamento no
    // navegador, mas só o atributo é consultável por seletor — e é assim que o
    // teste cobra que o fundo ficou isolado de verdade.
    el.setAttribute('inert', '');
    marcados.push(el);
  });
  return function () {
    marcados.forEach(function (el) { el.removeAttribute('inert'); });
  };
}

/**
 * @param {object} p
 * @param {string} p.olho        sobrancelha do cabeçalho fixo
 * @param {string} p.titulo      título de 24px
 * @param {string} [p.meta]      valor em mono à direita do título
 * @param {number} [p.nivel]     50 refeição · 70 seletor · 80 editor
 * @param {Function} p.aoFechar
 * @param {Function} [p.aoEditar] mostra o botão ··· quando existe
 * @param {*} [p.acao]           ação primária: sempre o ÚLTIMO elemento
 */
export function Folha({ olho, titulo, meta, nivel = 50, aoFechar, aoEditar, acao, children }) {
  const corpo = useRef(null);
  const caixa = useRef(null);

  useEffect(() => {
    trava();
    return destrava;
  }, []);

  /**
   * Foco: entra ao abrir, volta ao fechar.
   *
   * A folha recebe o foco ela mesma (`tabindex="-1"`), e não o primeiro botão
   * de dentro: o primeiro botão costuma ser o `×`, e mandar o leitor de tela
   * anunciar "fechar" antes do título diria a coisa errada sobre o que acabou
   * de abrir. É o mesmo que `TelaCheia` já faz com o `h1`.
   *
   * Devolver o foco ao acionador é o que impede o cursor de ficar perdido no
   * começo da página depois de fechar — WCAG 2.2 SC 2.4.3.
   */
  useEffect(() => {
    const acionador = document.activeElement;
    if (caixa.current) caixa.current.focus({ preventScroll: true });
    const solta = isolaOResto(caixa.current && caixa.current.parentElement);
    return () => {
      solta();
      // Só devolve se o acionador ainda estiver na página: uma folha que fecha
      // porque o que a abriu sumiu não tem para onde voltar.
      if (acionador && acionador.isConnected && acionador.focus) {
        acionador.focus({ preventScroll: true });
      }
    };
  }, []);

  // Escape fecha — vale no Safari de desktop e para teclado externo no iPad.
  useEffect(() => {
    const tecla = e => { if (e.key === 'Escape') aoFechar(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aoFechar]);

  // Sem portal de propósito: preact/compat custaria 10 kB por uma função.
  // `position: fixed` sai da árvore visualmente de qualquer lugar — desde que
  // NENHUM ancestral tenha transform, filter ou perspective, que criariam um
  // bloco de contenção e prenderiam a folha dentro dele. O Instrumento não usa
  // nenhum dos três, e um teste cobra isso.
  return (
    <div class="ins-folha-w" style={`z-index:${nivel}`}>
      {/* Tocar no véu fecha. O véu é irmão da folha, não pai: pai capturaria
          o toque que sobe de dentro dela. */}
      <div class="ins-veu" onClick={aoFechar} />
      <div class="ins-folha" role="dialog" aria-modal="true" aria-label={titulo}
           ref={caixa} tabindex="-1">
        <div class="ins-folha-h">
          <div class="ins-folha-h-txt">
            {olho && <div class="ins-label">{olho}</div>}
            <h2 class="ins-title">{titulo}</h2>
          </div>
          {meta && <span class="ins-folha-meta">{meta}</span>}
          {aoEditar && (
            <button class="ins-folha-b" aria-label="editar" onClick={aoEditar}>···</button>
          )}
          <button class="ins-folha-b" aria-label="fechar" onClick={aoFechar}>×</button>
        </div>
        <div class="ins-folha-c" ref={corpo}>
          {children}
          {acao && <div class="ins-folha-acao">{acao}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Linha que expande no lugar quando tocada. **Não existe modo de edição**: a
 * afordância de editar mora onde o objeto está.
 *
 * O destrutivo vive aqui dentro, um nível para dentro da lista, em coral, e
 * sempre abaixo do construtivo — nunca na lista, onde o polegar passa raspando.
 */
export function LinhaExpansivel({ aberta, aoAbrir, cabecalho, children }) {
  return (
    <div class={'ins-lx' + (aberta ? ' aberta' : '')}>
      <button class="ins-lx-h" onClick={aoAbrir}>{cabecalho}</button>
      {aberta && <div class="ins-lx-c">{children}</div>}
    </div>
  );
}
