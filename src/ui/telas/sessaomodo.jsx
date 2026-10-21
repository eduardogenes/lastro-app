// O MODO DE SESSÃO — o treino em tela cheia, com saída própria.
//
// Existe por um defeito que o protótipo achou e que nenhum documento tinha:
// instalado na tela de início não há barra de navegador, e com a sessão
// ocupando a tela o dedo ficava PRESO dentro do treino, sem caminho para a
// comida. A sessão deixou de ser aba e passou a ser modo — e modo sem saída é
// armadilha.
//
// Este invólucro é fino de propósito. Ele não desenha o treino: o `Treino` já
// tem cabeçalho, contagem e cartões, e duplicá-los aqui seria dois cabeçalhos
// na mesma tela. O que ele acrescenta é UMA coisa — a saída — e o que ele tira
// é a barra de abas.
//
// Por que a barra sai: o contrato vigente mandava o contrário, que ela
// continuasse visível durante o treino, e a razão escrita dela era boa — "sair
// para conferir a comida e voltar é um caminho legítimo". A cláusula cai porque
// a SETA paga por ela: o caminho continua existindo, com um toque de cada lado,
// e o que se ganha é a tela inteira para o que se faz de pé, com uma mão.
//
// O rótulo da seta diz o que ela FAZ, e não só que ela volta. É a frase da
// frente 1, literal, e ela existe porque o efeito não é óbvio: sair do modo
// NÃO encerra o treino. Um "voltar" genérico deixaria a dúvida — e a dúvida,
// no meio de uma série, custa um toque de teste para descobrir.

import { useLayoutEffect, useRef } from 'preact/hooks';
import { Treino } from './treino.jsx';
import { FaixaDaSessao } from '../instrumento/faixasessao.jsx';

export function SessaoModo({ ctx }) {
  const modo = useRef(null);
  // O FOCO ENTRA COM O MODO (peça 5 do motion; docs/motion/05 §3.1): até aqui o
  // modo abria com o foco no `body` — para o teclado e o VoiceOver a tela tinha
  // mudado inteira e o cursor não. O alvo é o título do treino (o `h1` do
  // cabeçalho, `tabindex=-1`), como o de toda tela cheia, no mesmo desenho em
  // que o modo monta e sem rolar nada. Uma vez por montagem: enquanto o modo
  // continua, o foco não é roubado de quem está digitando a carga.
  useLayoutEffect(function () {
    const t = modo.current && modo.current.querySelector('main h1');
    if (t) t.focus({ preventScroll: true });
  }, []);
  return (
    <div class="ins-modo" ref={modo}>
      <div class="ins-modo-topo">
        <button class="ins-modo-sair"
                data-a="sai-do-modo"
                aria-label="Voltar ao Agora, deixando a sessão aberta"
                onClick={ctx.fechaModoDeSessao}>‹</button>
        {/* A hora de parede saiu da barra (dono, 21/10): o iPhone já mostra a
            hora logo acima, e a barra fica com a saída e o `···`. */}
        {/* O `···`: o que é RARO mora aqui, e hoje é o deload. Ele saiu de
            Ajustes por decisão do dono, e o lugar antigo ERA o freio — por isso
            o item da folha diz o corte em número antes do toque, em vez de ser
            um interruptor com nome. */}
        <button class="ins-modo-mais"
                data-a="menu-sessao"
                aria-label="O que é raro nesta sessão"
                onClick={() => ctx.abreFolha({ k: 'menuSessao' })}>···</button>
      </div>
      {/* O `<main>` é do MODO, e precisa ser. A tela cheia é devolvida antes
          da casca (`app.jsx`), então o `<main>` dela não entra — e sem este
          aqui o relógio da sessão vira filho do invólucro, que é um flex
          column: o sticky dele se prende ao bloco que o contém, e trocar o pai
          é trocar a âncora. Vale também como marco: no modo, o modo é a
          página, e há exatamente um `<main>` nela. */}
      <main>
        <Treino ctx={ctx} />
      </main>

      {/* A pergunta de 1h30 continua aqui — item 1 da lista do que não some no
          modo (frente 1, §4.3), pela mesma razão de ela aparecer em todas as
          abas: quem esqueceu de finalizar costuma ter esquecido olhando para o
          treino, e o modo é onde ele fica olhando. A casca devolve a tela cheia
          antes de desenhar a faixa, então sem esta linha a sessão esquecida só
          seria perguntada se ele SAÍSSE do modo.
          O `tipo` é decidido pelo modelo: dentro do modo só vem `pergunta`. */}
      <FaixaDaSessao
        faixa={ctx.faixaDaSessao()}
        onVolta={ctx.voltaAoTreino}
        onContinua={ctx.continuaSessao}
        onEncerra={ctx.encerraSessaoEsquecida}
      />
    </div>
  );
}
