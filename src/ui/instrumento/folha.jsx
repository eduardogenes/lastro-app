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

  useEffect(() => {
    trava();
    return destrava;
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
      <div class="ins-folha" role="dialog" aria-modal="true" aria-label={titulo}>
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
