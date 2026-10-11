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

export function SessaoModo({ ctx }) {
  return (
    <div class="ins-modo">
      <div class="ins-modo-topo">
        <button class="ins-modo-sair"
                data-a="sai-do-modo"
                aria-label="Voltar ao Agora, deixando a sessão aberta"
                onClick={ctx.fechaModoDeSessao}>‹</button>
      </div>
      <Treino ctx={ctx} />
    </div>
  );
}
