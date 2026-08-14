// A retrospectiva do bloco.
//
// A única tela do app que olha para trás sem pedir nada em troca: não há botão
// de ação, não há nada para corrigir. Ela existe para o momento entre um bloco
// e o próximo, e o que responde é "o que mudou nas últimas semanas".
//
// "Parados" não é acusação e o texto diz isso explicitamente. Carga igual do
// começo ao fim pode ser exatamente o certo — em exercício de estabilização,
// em fase de deload, em exercício novo. O valor da lista é ele ter olhado.

import { Vazio } from '../instrumento/primitivos.jsx';
import { LinhaResumo, Stats, TelaCheia } from '../instrumento/telacheia.jsx';

export function Retrospectiva({ ctx }) {
  const d = ctx.retrospectiva();

  return (
    <TelaCheia olho={d.olho} meta={d.meta} titulo={d.titulo}
               aoVoltar={ctx.fechaRetro} corpo="hwrap">
      <Stats celulas={d.stats} />

      {d.evol.length > 0 && (
        <>
          <div class="ins-label hsec">o que evoluiu</div>
          {d.evol.map((x, i) => <LinhaResumo key={i} {...x} />)}
        </>
      )}

      {d.parados.length > 0 && (
        <>
          <div class="ins-label hsec">parados no bloco</div>
          <p class="ins-body-sm ins-t3 cue retro-nota">
            Mesma carga do começo ao fim, com 3 ou mais sessões. Não quer dizer
            que esteja errado — quer dizer que você olhou.
          </p>
          {d.parados.map((x, i) => <LinhaResumo key={i} {...x} />)}
        </>
      )}

      {d.evol.length === 0 && d.parados.length === 0 && (
        <Vazio>
          Ainda não há sessões suficientes neste bloco para comparar começo e
          fim. A retrospectiva fica útil a partir de três sessões por exercício.
        </Vazio>
      )}

      {d.dores && (
        <div class="painsum tc-bloco atencao">
          <div class="ins-label ins-amber">dor no bloco</div>
          <p class="ins-body-sm ins-t2">
            <b>{d.dores}.</b> Vale olhar se está concentrada em algum exercício
            antes de começar o próximo.
          </p>
        </div>
      )}

      {d.deloads && <p class="ins-body-sm ins-t3 cue tc-nota">{d.deloads}</p>}

      <button class="ins-btn-secondary retro-fim" onClick={ctx.fechaRetro}>Fechar</button>
    </TelaCheia>
  );
}
