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
import { useAgora } from './instrumento/primitivos.jsx';
import { fmtHoraDita } from '../dominio/formato';
import { Pare, Falhou, NaoGuardado } from './instrumento/pare.jsx';

/** A hora de parede no cabeçalho do Agora, andando com o relógio. */
function HoraDoCabecalho() {
  const t = useAgora();
  return <span class="ag-cab-h">{fmtHoraDita(t)}</span>;
}

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
  const pare = <>
    <NaoGuardado n={ctx.naoGuardado()} aberto={!!ctx.falhou()} onTenta={ctx.tentaGravar} />
    <Falhou f={ctx.falhou()} onTenta={ctx.tentaGravar} onCopia={ctx.copiaRegistro} onBaixa={ctx.exportar} onFecha={ctx.dispensaFalha} />
    <Pare p={ctx.pare()} onResponde={ctx.respondePare} />
  </>;
  if (ctx.emTelaCheia()) return <>{ctx.telaCheia()}{ctx.folhas()}{pare}</>;

  const aba = ctx.abaAtual();
  const Tela = TELAS[aba] || Agora;
  const h = ctx.cabecalhoDeHoje();

  return (
    <>
      {/* O cabeçalho do AGORA mora aqui e não na tela, porque a linha do tipo
          do dia é o único lugar onde o tipo do dia e o turno se trocam — e ela
          precisa estar acima do aviso de perda e do cartão.
          Pela D (`agora-descanso.html`, estados 1, 4 e 5): o dia e a hora, e
          embaixo a PROCEDÊNCIA do tipo do dia, tocável. O palpite leva o
          pontilhado do palpite; o que ele disse e a sessão registrada, não.
          Os AJUSTES são o botão do canto, e não um lugar: a decisão é da §1.6 —
          conta, sincronia e backup não respondem nenhuma das cinco perguntas. */}
      {aba === 'agora' && (
        <header class="ins-cab ag-cab">
          <div class="ag-cab-r1">
            {/* alvo de foco sem tabulação: para onde o foco volta quando um
                destino fecha e o controle que o abriu não existe mais (peça 5) */}
            <h1 class="ag-cab-d" tabindex="-1">{h.data}<HoraDoCabecalho /></h1>
            <button class="ins-cab-ajustes" data-a="ajustes"
                    aria-label="Ajustes deste aparelho"
                    onClick={ctx.abreAjustes}>⚙</button>
          </div>
          <button class={'ag-prov' + (h.palpite ? ' palpite' : '')} data-a="tipo-do-dia"
                  aria-label={h.procedencia + '. Tocar muda o tipo do dia.'}
                  onClick={ctx.abreSeletorDeDia}>{h.procedencia}</button>
        </header>
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
