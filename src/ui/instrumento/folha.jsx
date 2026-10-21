// A folha de baixo — o único padrão modal do sistema.
//
// O que diz "isto é modal" é a linha ácida de 1px no topo, não sombra: o
// Instrumento não tem sombra em lugar nenhum.
//
// Folhas empilham em três níveis, nunca mais: refeição (50) → seletor (70) →
// editor (80). Três é o limite porque na quarta ninguém sabe mais o que
// fechar leva de volta para onde.

import { createContext } from 'preact';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { miraDoDedo } from '../movimento.js';

/**
 * COMO A FOLHA NASCE: subindo da borda, ou no lugar da de cima.
 *
 * Folha nova é camada nova, e sobe com o quique (peça 4 do motion; dono, 16/10,
 * pergunta 1). A que nasce por `trocaFolha` NÃO é camada nova: cadastrar o
 * alimento é a continuação da busca que não o achou (docs/motion/02 T8), e a
 * camada não se move — só o conteúdo troca. Para o Preact as duas são iguais
 * (outro componente na mesma posição da pilha, nó novo), e por isso quem sabe
 * a diferença é a pilha, que diz por aqui (`folhaAberta`, `main.jsx`). A
 * chegada é lida uma vez, no nascimento: a classe não muda depois, e uma
 * animação de CSS só recomeça se o nome dela mudar.
 */
export const ChegadaDaFolha = createContext('sobe');

/**
 * ONDE A FOLHA ESTÁ NA PILHA: 0 a de baixo, 1 a segunda, 2 a terceira. Dá o
 * NOME dela na transição de vista (peça 5 do motion): a folha que fecha DESCE
 * pela foto dela (`folha-N`), e o véu dela apaga junto (`veu-N`) —
 * `componentes.css`, "A TROCA DE CAMADA". Pela posição, e nunca pelo `nivel`:
 * a refeição e "editar refeição" têm os dois o nível 50, e dois nomes iguais na
 * mesma tela abortam a transição (docs/motion/02 T3).
 *
 * A posição vai no invólucro (`data-lugar`), e o NOME mora no CSS, não no
 * `style` (ajustes finais do motion): na descida, a folha que FICA não tem foto
 * própria — fotografá-la à parte, sem ela se mover, fazia o quadro da foto
 * passar do tempo de um quadro, e fechar pelo × a folha de cima com outra
 * embaixo andava dois quadros depois do toque (07 §12.3). Um nome no `style`
 * venceria a regra que o tira.
 */
export const LugarNaPilha = createContext(0);

/**
 * O TOQUE NA CAMADA QUE CHEGA VAI AO QUE O DEDO MIROU.
 *
 * Medido nos dois motores (peça 4 do motion), com a folha subindo e o × ou o
 * véu tocados de 60 a 220 ms depois de ela abrir: o toque NÃO fechava a folha.
 * O dedo descia no × (ou no véu) e o clique saía em outra coisa, porque a
 * camada andou entre descer e soltar: o Chromium entrega o clique ao que está
 * sob o dedo quando ele SOLTA (o cabeçalho, o conteúdo da folha), o WebKit com
 * ponteiro ao ancestral comum dos dois alvos, e o Safari do iPhone cancela o
 * toque quando o nó sob o dedo muda. Parada, ela fechava sempre.
 *
 * Na peça 4 o dedo SEGURAVA a camada (pausava a chegada). No Chromium a pausa
 * caía no tempo da thread principal, um quadro atrás do compositor, e a folha
 * voltava um quadro sob o dedo — um piscar (07 §10). Desde a peça 5 nada pausa:
 * a chegada segue o caminho dela, e o clique deste toque vai ao nó em que o dedo
 * DESCEU, pela porta do movimento (`miraDoDedo`) — o mesmo princípio do toque
 * no meio de uma transição de vista. Sem animação correndo (a camada já parou,
 * nasceu no lugar, ou "Reduzir movimento" está ligado) não há o que mirar.
 */
/**
 * O `onPointerDown` do invólucro de uma camada que chega com o quique: a mira é
 * o nó tocado, e as animações que dizem "ainda chega" são as da caixa e do véu,
 * que são os filhos dele.
 * @param {PointerEvent} ev
 */
export function miraSobODedo(ev) {
  miraDoDedo(ev, ev.currentTarget);
}

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
 * O ISOLAMENTO: a camada de cima é a única alcançável — pelo Tab, pelo leitor de
 * tela e pelo dedo.
 *
 * `aria-modal="true"` DESCREVE a intenção; quem impede o foco de vazar é o
 * `inert`. Sem ele, medido: 39 elementos continuavam tabuláveis atrás da folha
 * e três Tabs saíam dela para a página de baixo.
 *
 * Três camadas isolam, e esta é a ordem delas, da mais alta para a mais baixa:
 * o painel de PARE (z 90), o aviso "Não guardei" (z 88: ele chega sozinho, e o
 * que o dedo pediu fica por cima) e as folhas (50 a 80; entre duas, a que veio
 * depois). Até a peça 4 do motion só a folha isolava, e cada uma marcava os
 * próprios irmãos (docs/motion/05 §3.1): o pare e o "Não guardei" deixavam o
 * Shift+Tab cair na barra de abas atrás deles, e com o descanso contando o Tab
 * saía da folha para o −15 — o cronômetro mora FORA do `#app` (`index.html`),
 * e os irmãos do invólucro da folha são filhos do `#app`.
 *
 * Agora o isolamento é DERIVADO, e não acumulado: toda vez que uma camada
 * nasce ou sai, `isolaACamadaDeCima` acha a de cima na árvore e marca tudo o
 * mais — os irmãos dela no `#app` (cabeçalho, `main`, barra de abas, as
 * camadas de baixo) e o que mora fora do `#app` e se alcança com o Tab (o
 * cronômetro). Assim a ordem de abrir e fechar não importa: um aviso que chega
 * por baixo de um pare aberto já nasce inerte, e o pare que fecha antes de uma
 * folha aberta depois dele não solta o fundo que a folha ainda precisa preso.
 *
 * O véu de cada camada fica dentro do invólucro dela: tocar nele para fechar
 * continua funcionando. O que já era inerte por outro motivo não é tocado.
 */
const CAMADAS = ['.pare-w:not(.falhou-w)', '.falhou-w', '.ins-folha-w'];
/**
 * O que mora fora do `#app` e é alcançável pelo Tab: o cronômetro do descanso
 * (−15, +15, parar). O toast e a série dita são regiões vivas, sem nada que se
 * foque, e ficam de fora: inertes, sairiam da árvore de acessibilidade, e um
 * anúncio que chegasse com a folha aberta se perderia.
 */
const FORA_DO_APP = ['#timer'];
/** A marca do que ESTE isolamento tornou inerte, para desfazer só o que é dele. */
const MARCA = 'data-isolado';

/** A camada de cima que está na árvore, sem contar a que está saindo. */
function camadaDeCima(saindo) {
  for (let i = 0; i < CAMADAS.length; i++) {
    const todas = [].slice.call(document.querySelectorAll(CAMADAS[i]))
      .filter(function (el) { return el !== saindo; });
    if (todas.length) return todas[todas.length - 1];
  }
  return null;
}

/**
 * Isola tudo o que não é a camada de cima. `saindo` é a camada que está sendo
 * desmontada agora: o Preact roda a limpeza do efeito ANTES de tirar o nó da
 * árvore, e ela ainda seria achada como a de cima.
 */
export function isolaACamadaDeCima(saindo) {
  const topo = camadaDeCima(saindo);
  const devem = [];
  if (topo && topo.parentElement) {
    [].slice.call(topo.parentElement.children).forEach(function (el) {
      if (el !== topo && el !== saindo) devem.push(el);
    });
    FORA_DO_APP.forEach(function (sel) {
      const el = document.querySelector(sel);
      if (el && !el.contains(topo)) devem.push(el);
    });
  }
  [].slice.call(document.querySelectorAll('[' + MARCA + ']')).forEach(function (el) {
    if (devem.indexOf(el) >= 0) return;
    el.removeAttribute('inert');
    el.removeAttribute(MARCA);
  });
  devem.forEach(function (el) {
    if (el.hasAttribute('inert')) return;
    // O ATRIBUTO, e não a propriedade: os dois ligam o mesmo comportamento no
    // navegador, mas só o atributo é consultável por seletor — e é assim que o
    // teste cobra que o fundo ficou isolado de verdade.
    el.setAttribute('inert', '');
    el.setAttribute(MARCA, '');
  });
}

/**
 * Uma camada que chega: isola o resto, leva o foco para `alvo` (sem rolar
 * nada — no quadro zero ela ainda está abaixo da borda) e devolve a função que,
 * na saída, isola de novo sem ela e devolve o foco a quem o tinha.
 *
 * O foco entra no MESMO desenho em que a camada monta, e não no fim da subida
 * (docs/motion/05 §3.4): a camada é focável desde o quadro zero porque nasce
 * deslocada por `transform`, nunca escondida. Se ela já nasceu por baixo de
 * outra (um aviso que chega com o pare aberto), não rouba o foco de cima.
 *
 * Só devolve o foco se o acionador ainda estiver na página e alcançável: uma
 * camada que fecha porque o que a abriu sumiu não tem para onde voltar.
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
  const chegada = useContext(ChegadaDaFolha);
  const lugar = useContext(LugarNaPilha);

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
   * começo da página depois de fechar — WCAG 2.2 SC 2.4.3. O isolamento e a
   * devolução são os de toda camada (`abreCamada`, acima).
   */
  useEffect(() => {
    return abreCamada(caixa.current && caixa.current.parentElement, caixa.current);
  }, []);

  // O ESCAPE NÃO MORA AQUI, e isto é de propósito.
  //
  // Morava: cada folha montava o seu ouvinte no `document`, e cada um
  // perguntava ao DOM qual folha tinha o maior z-index para que só a de cima
  // agisse. O contrato manda que o Esc passe pelo MESMO caminho do Voltar
  // (`docs/LASTRO_UX_CONTRACT.md`, §2), e a pilha de camadas — não uma consulta
  // de z-index — é quem sabe o que está em cima. Agora é um ouvinte só, em
  // `src/ui/navegacao.js`, junto do `popstate`. A razão longa está escrita lá,
  // inclusive a corrida que o arranjo antigo abria entre a folha aparecer e o
  // efeito dela montar.

  // Sem portal de propósito: preact/compat custaria 10 kB por uma função.
  // `position: fixed` sai da árvore visualmente de qualquer lugar — desde que
  // NENHUM ancestral tenha transform, translate, filter, perspective ou
  // will-change, que criariam um bloco de contenção e prenderiam a folha dentro
  // dele. O Instrumento não usa nenhum deles em `html`, `body`, `#app` nem
  // `.ins-modo`, e quem cobra isso é `tests/dominio/estilo.test.ts`, em "(d)
  // nada entre um fixo e a janela cria bloco de contenção" — a promessa ficou
  // um ano aqui sem teste nenhum.
  //
  // A SUBIDA (peça 4 do motion) é do nó que nasce, por CSS
  // (`componentes.css`, "Folha de baixo"): a folha sobe com o quique e o véu
  // acende, no portão por adesão. O `transform` do quique é da `.ins-folha`, e
  // não do invólucro: o invólucro é o fixo, e nada acima dele pode conter. A
  // classe `troca` diz que esta folha tomou o lugar da de cima e não sobe; o
  // toque que desce nela enquanto ela sobe vai ao que o dedo mirou
  // (`miraSobODedo`).
  return (
    <div class={'ins-folha-w' + (chegada === 'troca' ? ' troca' : '')} style={`z-index:${nivel}`}
         data-lugar={lugar} onPointerDown={chegada === 'troca' ? undefined : miraSobODedo}>
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
