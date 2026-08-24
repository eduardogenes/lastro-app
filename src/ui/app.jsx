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
import { Hoje } from './telas/hoje.jsx';
import { Treino } from './telas/treino.jsx';
import { Comida } from './telas/comida.jsx';
import { Dados } from './telas/dados.jsx';
import { Guia } from './telas/guia.jsx';
import { Cabecalho } from './instrumento/primitivos.jsx';

const TELAS = { hoje: Hoje, treino: Treino, comida: Comida, dados: Dados, guia: Guia };

export function App({ ctx }) {
  // Tela cheia toma o lugar de tudo, tab bar inclusive: histórico, programa,
  // sessão, retrospectiva e a decisão de fim de treino são destinos, não abas.
  if (ctx.emTelaCheia()) return ctx.telaCheia();

  const aba = ctx.abaAtual();
  const Tela = TELAS[aba] || Hoje;
  const h = ctx.cabecalhoDeHoje();

  return (
    <>
      {aba === 'hoje' && (
        <Cabecalho
          olho={h.olho}
          titulo="Hoje"
          acao={
            <button class="ins-estado" onClick={ctx.abreSeletorDeDia}>
              <span class="ins-label-sm">{h.rotulo}</span>
              <span class="ins-estado-v">{h.valor}</span>
            </button>
          }
        />
      )}

      <main>
        <Tela ctx={ctx} />
      </main>

      {ctx.folhas()}

      <TabBar ativa={aba} onMuda={ctx.vaiPara} />
    </>
  );
}
