// O detalhe de uma sessão passada.
//
// É tela de leitura: responde "o que aconteceu naquele dia" com o número que
// importa no topo e o exercício a exercício embaixo. Nada aqui edita nada —
// corrigir uma sessão passada é outro caminho, pelo histórico do exercício.
//
// A distinção entre tempo EXATO e APROXIMADO aparece no rótulo e não é
// decoração: sessão que o app fechou sozinho tem o tempo indo até a última
// série, não até quando ele saiu da academia. Apresentar os dois como iguais
// seria inventar precisão.

import { Procedencia, Vazio } from '../instrumento/primitivos.jsx';
import { LinhaResumo, Stats, TelaCheia } from '../instrumento/telacheia.jsx';

export function Sessao({ ctx }) {
  const d = ctx.detalheDaSessao();
  if (!d) return null;

  if (d.livre) {
    return (
      <TelaCheia olho={d.olho} meta={d.meta} titulo={d.titulo} aoVoltar={ctx.fechaSessao}>
        <Stats celulas={d.stats} />
        {d.grupos.length > 0 && (
          <div class="ins-chips tc-grupos">
            {d.grupos.map(g => <span key={g} class="ins-chip on">{g}</span>)}
          </div>
        )}
        <p class="ins-body-sm ins-t3 tc-nota">
          Fora do plano. Conta como dia treinado no calendário e na média
          semanal, mas não tem carga nem série registrada e não move a rotação.
        </p>
        <button class="ins-btn-secondary ins-btn-destructive tc-rm" onClick={() => ctx.editaSessao(d.t)}>
          apagar este registro
        </button>
      </TelaCheia>
    );
  }

  return (
    <TelaCheia olho={d.olho} meta={d.meta} titulo={d.titulo} aoVoltar={ctx.fechaSessao} corpo="hwrap">
      <Stats celulas={d.stats} />

      {d.horario && (
        <p class="ins-provenance horario">
          {d.horario.ate
            ? <>das <b>{d.horario.de}</b> às <b>{d.horario.ate}</b></>
            : <>começou às <b>{d.horario.de}</b></>}
        </p>
      )}

      {d.notas.length > 0 && (
        <p class="ins-body-sm ins-t3 tc-nota cue">{d.notas.join(' ')}</p>
      )}

      {d.mods && (
        <div class="tc-bloco">
          <div class="ins-label">
            {d.mods.length === 1 ? '1 mudança no dia' : d.mods.length + ' mudanças no dia'}
          </div>
          <p class="ins-body-sm ins-t2">{d.mods.join(' · ')}</p>
        </div>
      )}

      {d.pendencias.length > 0 && (
        <div class="tc-bloco pend">
          {d.pendencias.map(p => (
            <div key={p.k} class="tc-pend">
              <span class="ins-label">{p.n} {p.rotulo}</span>
              <span class="ins-body-sm ins-t3">{p.nomes}</span>
            </div>
          ))}
        </div>
      )}

      {d.cardio && (
        <div class="tc-bloco cardio-dia">
          <div class="ins-label">cardio no mesmo dia</div>
          {d.cardio.map(c => <p key={c} class="ins-body-sm ins-t2">{c}</p>)}
        </div>
      )}

      {d.tempo && (
        <Procedencia>
          mais {d.tempo} segundos de prancha, contados à parte do volume
        </Procedencia>
      )}

      {d.dores && (
        <div class="tc-bloco atencao">
          <div class="ins-label ins-amber">dor marcada</div>
          <p class="ins-body-sm ins-t2">
            <b>{d.dores}.</b> Se repetir na próxima sessão, o app sugere a troca
            de ângulo.
          </p>
        </div>
      )}

      <div class="ins-label tc-h">exercício a exercício</div>
      {d.itens.length === 0
        ? <Vazio>Nenhuma série registrada neste dia.</Vazio>
        : d.itens.map((x, i) => <LinhaResumo key={i} {...x} />)}
    </TelaCheia>
  );
}
