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

import { Treino } from './treino.jsx';
import { FaixaDaSessao } from '../instrumento/faixasessao.jsx';

export function SessaoModo({ ctx }) {
  return (
    <div class="ins-modo">
      <div class="ins-modo-topo">
        <button class="ins-modo-sair"
                data-a="sai-do-modo"
                aria-label="Voltar ao Agora, deixando a sessão aberta"
                onClick={ctx.fechaModoDeSessao}>‹</button>
        {/* A HORA, item 3 da lista do que não some no modo. O protótipo achou
            que o app não tem relógio nenhum e que a projeção de fim não se
            confere sem ele.
            Escrita no primeiro desenho e mantida fresca por `tickRelogio`, que
            anda por fora do Preact — re-renderizar a tela a cada minuto
            roubaria o foco do campo que ele está preenchendo no meio da série,
            que é a mesma razão do relógio da sessão.
            `<time>` sem `datetime`: o conteúdo já é hora válida, e o atributo
            ficaria mentindo depois da primeira virada escrita pelo casco.
            Sem `aria-live`: anunciar a virada de cada minuto no meio de uma
            série é interrupção, não informação. */}
        <time id="hora" class="ins-modo-hora">{ctx.horaDeParede()}</time>
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
