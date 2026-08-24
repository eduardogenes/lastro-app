// O histórico de UM exercício.
//
// É a tela que responde "estou ficando mais forte nisto?" — e a resposta é o
// gráfico, não a tabela. A tabela existe para conferir e corrigir; por isso ela
// vem depois, em ordem inversa (mais recente primeiro), e cada linha carrega o
// botão de correção.
//
// A métrica muda com o tipo de exercício e isso não é detalhe: em prancha o que
// progride é o TEMPO, em barra fixa é a REPETIÇÃO, no resto é o VOLUME. Mostrar
// carga onde ela não é o assunto faria o gráfico mentir sobre estagnação.
//
// Máximo de 6 sessões. Não é limitação técnica: seis pontos é o que cabe na
// largura de um iPhone sem virar linha reta ilegível, e é o horizonte em que
// uma decisão de carga faz sentido.

import { Grafico, Stats, TelaCheia } from '../instrumento/telacheia.jsx';
import { Vazio } from '../instrumento/primitivos.jsx';

export function Historico({ ctx }) {
  const d = ctx.historico();
  if (!d) return null;

  const cab = (
    <>
      <div class="ex-sub">
        <span>{d.alvo}</span>
        {d.marcas.map(m => <span key={m.k} class={'tag ' + m.cls}>{m.t}</span>)}
        {d.up && <span class="up">↑ subir carga</span>}
      </div>
      {d.variantes && (
        <div class="vars ins-chips">
          {d.variantes.map(v => (
            <button key={v.k} class={'vchip ins-chip' + (v.on ? ' on' : '')}
                    onClick={() => ctx.histKey(v.k)}>{v.t}</button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <TelaCheia olho={d.olho} meta={d.meta} titulo={d.titulo}
               aoVoltar={ctx.fechaHist} corpo="hwrap">
      {cab}

      {d.vazio ? (
        <Vazio>
          Nenhuma sessão registrada neste exercício ainda. O gráfico aparece
          depois do primeiro treino salvo.
        </Vazio>
      ) : (
        <>
          <Stats celulas={d.stats} />
          <Grafico svg={d.svg} />
          <div class="legend">
            {d.legenda.map(l => (
              <span key={l.k} class={l.k}><i />{l.t}</span>
            ))}
          </div>

          <div class="ins-label hsec">sessão a sessão</div>
          {d.sessoes.map(s => (
            s.editando
              ? <Edicao key={s.real} s={s} ctx={ctx} />
              : <Sessao key={s.real} s={s} ctx={ctx} />
          ))}

          {d.dores && (
            <div class="painsum tc-bloco atencao">
              <div class="ins-label ins-amber">
                {d.dores.n === 1 ? '1 sessão marcada com dor' : d.dores.n + ' sessões marcadas com dor'}
              </div>
              <p class="ins-body-sm ins-t2">
                {d.dores.de > 1 && <>Nas últimas {d.dores.de} sessões. </>}
                A regra do programa é tirar o exercício por 2 semanas e trocar o
                ângulo, não empurrar por cima.
              </p>
            </div>
          )}

          <p class="ins-body-sm ins-t3 cue tc-nota">{d.cue}</p>
        </>
      )}
    </TelaCheia>
  );
}

function Sessao({ s, ctx }) {
  return (
    <div class="hs">
      <div class="hs-top">
        <span class="hs-date">{s.data}</span>
        <span class="hs-vol">{s.valor}<em>{s.unidade}</em></span>
        {s.deload && <span class="tag dl-t">deload</span>}
        {s.delta && <span class={'hs-d ' + s.deltaCor}>{s.delta}</span>}
      </div>
      <div class="hs-sets">
        {s.series.map((x, i) => <span key={i} class={x ? '' : 'nul'}>{x || '–'}</span>)}
        {s.reps && <span class="nul">{s.reps}</span>}
        {s.anilhas && <span class="nul">{s.anilhas}</span>}
        {s.rir && <span class="nul">{s.rir}</span>}
      </div>
      {s.dor && <div class="pain ins-amber">{s.dor}</div>}
      {s.obs && <div class="hs-obs">{s.obs}</div>}
      <button class="edbtn" onClick={() => ctx.editaLinha(s.real)}>corrigir esta sessão</button>
    </div>
  );
}

/**
 * A mesma sessão, aberta para conserto.
 *
 * Os campos mantêm os ids `ed{n}_0` / `ed{n}_1` / `edobs`: quem lê no salvar é
 * `guardaCamposEdicao()`, por id, e não por estado do componente. É de
 * propósito — o valor digitado tem que sobreviver a um re-render disparado
 * pelos chips de dor, e o caminho por id é o que já garantia isso.
 */
function Edicao({ s, ctx }) {
  const e = s.edicao;
  return (
    <div class="hs editando">
      <div class="hs-top">
        <span class="hs-date">{s.data}</span>
        <span class="hs-vol ins-amber">corrigindo</span>
      </div>

      <div class="ed-sets">
        {e.sets.map((x, k) => (
          <div class="setrow" key={k}>
            <div class="setno">{k + 1}</div>
            <div class="f">
              <input type="text" inputmode="decimal" id={`ed${k}_0`} value={x.carga}
                     placeholder={e.seg ? '0' : 'kg'}
                     onInput={ev => ctx.limpaNum(ev.currentTarget, true)} />
              <span class="unit">kg</span>
            </div>
            <div class="x">×</div>
            <div class="f">
              <input type="text" inputmode="numeric" id={`ed${k}_1`} value={x.reps}
                     placeholder={e.seg ? 'seg' : 'reps'}
                     onInput={ev => ctx.limpaNum(ev.currentTarget, false)} />
              {e.seg && <span class="unit">seg</span>}
            </div>
          </div>
        ))}
      </div>

      <div class="ins-label obs-h">dor de tendão</div>
      <div class="chips ins-chips">
        {e.dores.map(x => (
          <button key={x.k} class={'chip ins-chip' + (x.on ? ' on' : '')}
                  onClick={() => ctx.editDor(x.k)}>{x.t}</button>
        ))}
      </div>

      <textarea class="note" id="edobs" placeholder="observação da sessão"
                value={e.obs}></textarea>

      <div class="edrow">
        <button class="ins-btn-primary dbtn" onClick={ctx.salvaEdicao}>Salvar correção</button>
        <button class="ins-btn-secondary dbtn ghost" onClick={ctx.cancelaEdicao}>cancelar</button>
      </div>
      <button class="ins-btn-secondary ins-btn-destructive danger ed-rm"
              onClick={ctx.apagaLinha}>apagar esta sessão</button>
    </div>
  );
}
