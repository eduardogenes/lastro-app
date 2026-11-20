// A casca: os cinco lugares, a doca, os destinos de tela cheia e as camadas.
//
// A rota mora em `view`, no casco (`src/main.jsx`): o app tem cinco lugares e
// nenhuma URL para compartilhar, e um roteador seria peso sem nada em troca.
// Quem desenha cada lugar, destino e folha é o visual novo
// (`src/ui/v3/telas.js`); o antigo saiu na Fase 5 (docs/redesign-3/00-plano.md).

import { Doca } from './v3/doca.jsx';
import { TELAS_V3 } from './v3/telas.js';
import { EstadosV3 } from './v3/estados.jsx';
import { PareV3, FalhouV3 } from './v3/pare.jsx';

export function App({ ctx }) {
  // As faixas de estado e os painéis (falha, confirmação) vêm por último nos
  // dois caminhos: são as camadas mais altas, e uma ação destrutiva pode ser
  // pedida de dentro de um destino.
  const paineis = <>
    <EstadosV3 ctx={ctx} />
    <FalhouV3 f={ctx.falhou()} onTenta={ctx.tentaGravar} onCopia={ctx.copiaRegistro} onBaixa={ctx.exportar} />
    <PareV3 p={ctx.pare()} onResponde={ctx.respondePare} />
  </>;
  // Tela cheia toma o lugar do lugar e da doca, MENOS as folhas: uma folha
  // aberta de dentro de um destino precisa ser desenhada por cima dele.
  if (ctx.emTelaCheia()) return <>{ctx.telaCheia()}{ctx.folhas()}{paineis}</>;

  const aba = ctx.abaAtual();
  const Tela = TELAS_V3[aba] || TELAS_V3.agora;
  return (
    <>
      {/* A chave é a aba: cada lugar ganha um `<main>` que nasce com ele. */}
      <main key={aba}>
        <Tela ctx={ctx} />
      </main>
      {ctx.folhas()}
      <Doca ativa={aba} onMuda={ctx.vaiPara} aoRegistrar={ctx.abreRegistrar}
            tira={ctx.tiraDoTreinoV3()} aoVoltarAoTreino={ctx.voltaAoTreino} />
      {paineis}
    </>
  );
}
