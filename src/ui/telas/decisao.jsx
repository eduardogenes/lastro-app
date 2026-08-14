// A pergunta do fim da sessão: o que fica no programa?
//
// Aparece só quando houve mudança no dia, e interrompe o encerramento de
// propósito — é o único momento em que ele lembra por que mudou. Perguntar
// depois seria perguntar para alguém que já esqueceu.
//
// Cada mudança é uma decisão INDEPENDENTE. Aceitar a série a mais e recusar a
// troca de exercício é o caso comum, não a exceção, e por isso não existe um
// "aceitar tudo": o par de botões se repete em cada linha.
//
// O padrão é "só hoje" em todas. O programa é do treinador; mudá-lo tem que
// ser um ato, nunca o resultado de encerrar o treino no automático.

import { TelaCheia } from '../instrumento/telacheia.jsx';

export function Decisao({ ctx }) {
  const d = ctx.decisao();
  if (!d) return null;

  return (
    <TelaCheia
      olho={d.olho}
      meta={d.meta}
      titulo="O que fica no programa?"
      aoVoltar={ctx.voltaDoPromo}
      corpo="promo"
    >
      <p class="ins-body-sm ins-t3 tc-nota">
        As séries que você registrou já estão no histórico. Isto decide só o
        treino {d.dia} de amanhã.
      </p>

      {d.mods.map(m => (
        <div class="pmod" key={m.j}>
          <div class="pmod-t ins-body">{m.txt}</div>
          {m.impacto && (
            <div class={'pmod-i ins-provenance' + (m.acima ? ' acima ins-amber' : '')}>
              {m.impacto}
            </div>
          )}
          <div class="pmod-b">
            <button class={m.oficial ? '' : 'on'}
                    onClick={() => ctx.decidePromo(m.j, 'hoje')}>só hoje</button>
            <button class={m.oficial ? 'on' : ''}
                    onClick={() => ctx.decidePromo(m.j, 'oficial')}>levar para o oficial</button>
          </div>
        </div>
      ))}

      <div class="pmot">
        <div class="ins-label obs-h">motivo (opcional)</div>
        <div class="chips ins-chips">
          {d.motivos.map(x => (
            <button key={x.k} class={'chip ins-chip' + (x.on ? ' on' : '')}
                    onClick={() => ctx.motivoPromo(x.k)}>{x.t}</button>
          ))}
        </div>
      </div>

      {/* Um botão só. O "voltar" do topo já é a saída sem decidir, e repetir
          a mesma porta ao lado da ação principal só criaria hesitação. */}
      <button class="ins-btn-primary dbtn promo-ok" onClick={ctx.concluiPromo}>{d.acao}</button>
    </TelaCheia>
  );
}
