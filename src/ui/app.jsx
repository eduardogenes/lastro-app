// A shell. UMA tab bar, um papel, cinco abas.
//
// A rota continua morando em `view` no casco — não entrou router: o app tem
// cinco destinos e nenhuma URL para compartilhar, e um router seria peso e
// indireção sem nada em troca.
//
// Uma decisão de uso que vale registrar: quando há sessão de treino aberta, o
// cartão-foco de HOJE aponta direto para a sessão. Sem isso, o único momento em
// que o app é usado sob esforço — de pé, no meio de uma série — custaria um
// toque a mais do que custava antes da fusão.

import { TabBar } from './instrumento/tabbar.jsx';
import { FaixaDaSessao } from './instrumento/faixasessao.jsx';
import { Agora } from './telas/agora.jsx';
import { Dias } from './telas/dias.jsx';
import { Corpo } from './telas/corpo.jsx';
import { Semana } from './telas/semana.jsx';
import { Prescricao } from './telas/prescricao.jsx';
import { Cabecalho } from './instrumento/primitivos.jsx';
import { Pare } from './instrumento/pare.jsx';

const TELAS = { agora: Agora, dias: Dias, corpo: Corpo, semana: Semana, prescricao: Prescricao };

export function App({ ctx }) {
  // Tela cheia toma o lugar de tudo, tab bar inclusive: histórico, programa,
  // sessão, retrospectiva e a decisão de fim de treino são destinos, não lugares.
  //
  // MENOS as folhas, e isto é conserto. O retorno aqui era `ctx.telaCheia()`
  // seco, e portanto uma folha aberta de DENTRO de um destino simplesmente não
  // era desenhada: a pilha existia em `view.pilha`, `camadasAbertas` já a
  // contava por cima do destino, o Voltar já a fechava — e a tela não mostrava
  // nada. O buraco era antigo e estava fora de alcance porque a tela do treino
  // era uma ABA; com ela virando modo, a foto do aparelho, o histórico do
  // exercício, a nota e o seletor de troca passaram todos a abrir no vazio.
  // O painel de PARE vem por último nas duas cascas: ele é a camada mais alta,
  // e uma ação destrutiva pode ser pedida de dentro de um destino.
  const pare = <Pare p={ctx.pare()} onResponde={ctx.respondePare} />;
  if (ctx.emTelaCheia()) return <>{ctx.telaCheia()}{ctx.folhas()}{pare}</>;

  const aba = ctx.abaAtual();
  const Tela = TELAS[aba] || Agora;
  const h = ctx.cabecalhoDeHoje();

  return (
    <>
      {/* O cabeçalho do AGORA mora aqui e não na tela, porque o botão de estado
          do dia é o único lugar onde o tipo do dia e o turno se trocam — e ele
          precisa estar acima do aviso de perda e do cartão.
          Os AJUSTES são o botão do canto, e não um lugar: a decisão é da §1.6 —
          conta, sincronia e backup não respondem nenhuma das cinco perguntas. */}
      {aba === 'agora' && (
        <Cabecalho
          olho={h.olho}
          titulo="Agora"
          acao={
            <div class="ins-cab-acoes">
              <button class="ins-estado" onClick={ctx.abreSeletorDeDia}>
                <span class="ins-label-sm">{h.rotulo}</span>
                <span class="ins-estado-v">{h.valor}</span>
              </button>
              <button class="ins-cab-ajustes" data-a="ajustes"
                      aria-label="Ajustes deste aparelho"
                      onClick={ctx.abreAjustes}>⚙</button>
            </div>
          }
        />
      )}

      <main>
        <Tela ctx={ctx} />
      </main>

      {ctx.folhas()}

      {/* No AGORA a tira não é desenhada: lá o cartão de cima É a sessão, e com
          a contagem de séries que a tira não tem — duas peças para o mesmo
          trabalho na mesma tela é o oposto da regra de UM cartão.
          Montada com `faixa={null}` em vez de removida da árvore: o efeito de
          layout dela escreve `--ins-faixa-h`, que o toast e o fim da página
          leem. Fora da árvore, o efeito não roda e a variável fica com a altura
          da ABA ANTERIOR — espaço reservado para uma tira que não está ali. */}
      <FaixaDaSessao
        faixa={aba === 'agora' ? null : ctx.faixaDaSessao()}
        onVolta={ctx.voltaAoTreino}
        onContinua={ctx.continuaSessao}
        onEncerra={ctx.encerraSessaoEsquecida}
      />

      <TabBar ativa={aba} onMuda={ctx.vaiPara} />
      {pare}
    </>
  );
}
