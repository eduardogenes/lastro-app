// "Treinei ontem e não abri o app."
//
// Dois casos, e a tela se abre em um ou outro conforme a resposta da primeira
// pergunta: foi um treino do plano, ou foi outra coisa. O segundo registra
// presença e grupo muscular sem fingir que existe carga e repetição que
// ninguém anotou — e o texto diz, ali mesmo, o que isso implica: conta como
// dia treinado, não move a rotação.
//
// Horário e duração são opcionais e ficam por último de propósito. Se ele não
// lembra, o app não inventa: campo em branco vira ausência de dado, não zero.

import { TelaCheia } from '../instrumento/telacheia.jsx';

export function Retroativo({ ctx }) {
  const d = ctx.retroativo();
  if (!d) return null;

  return (
    <TelaCheia olho="registrar treino passado" titulo={d.titulo}
               aoVoltar={ctx.fechaAdicionar} corpo="hwrap">
      <div class="mesnav add-dia">
        <button onClick={() => ctx.addSet('dia', -1)}>‹</button>
        <span class="add-data">{d.data}</span>
        <button onClick={() => ctx.addSet('dia', 1)} disabled={d.hoje}>›</button>
      </div>

      {d.jaTem && (
        <div class="deload tc-bloco atencao">
          <div class="ins-label ins-amber">já existe treino neste dia</div>
          <p class="ins-body-sm ins-t2">
            {d.jaTem}. Adicionar de novo cria uma segunda sessão.
          </p>
        </div>
      )}

      <div class="ins-label obs-h add-h">o que foi</div>
      <div class="chips ins-chips">
        {d.tipos.map(x => (
          <button key={x.k} class={'chip ins-chip' + (x.on ? ' on' : '')}
                  onClick={() => ctx.addSet('tipo', x.k)}>{x.t}</button>
        ))}
      </div>
      {d.doPlano && <p class="ins-body-sm ins-t3 cue add-nota">{d.doPlano}</p>}

      {d.descanso && (
        <p class="ins-body-sm ins-t3 cue add-nota">
          {d.jaEraDescanso
            ? 'Este dia já está marcado como descanso. Confirmar remove a marca.'
            : 'Marca o dia como descanso, para o calendário não confundir folga com esquecimento. Não conta como treino em lugar nenhum.'}
        </p>
      )}

      {d.livre && (
        <>
          <div class="ins-label obs-h add-h">grupos musculares</div>
          <div class="chips ins-chips">
            {d.grupos.map(g => (
              <button key={g.k} class={'chip ins-chip' + (g.on ? ' on' : '')}
                      onClick={() => ctx.addSet('grupo', g.k)}>{g.t}</button>
            ))}
          </div>
          {/* input de uma linha, não `.note`: a caixa alta de textarea
              prometia um parágrafo onde cabe "pelada com os amigos". */}
          <input class="ins-input add-nome" placeholder="o que foi, se quiser dizer (opcional)"
                 value={d.nome} onInput={e => ctx.addNome(e.currentTarget)} />
          <p class="ins-body-sm ins-t3 cue add-nota">
            Treino avulso conta como dia treinado no calendário e na média
            semanal, mas não move a rotação nem entra na conta das 48 sessões
            do bloco.
          </p>
        </>
      )}

      {!d.descanso && (
        <>
      <div class="ins-label obs-h add-h">horário, se lembrar</div>
      <div class="addrow">
        <div class="f">
          <input type="text" inputmode="numeric" id="ahora" value={d.hora}
                 placeholder="06:15" onInput={e => ctx.addHora(e.currentTarget)} />
        </div>
      </div>
      <p class="crule ins-provenance add-regra">Em branco, o app não inventa horário.</p>

      <div class="ins-label obs-h add-h">duração, se lembrar</div>
      <div class="chips ins-chips">
        {d.duracoes.map(v => (
          <button key={v.k} class={'chip ins-chip' + (v.on ? ' on' : '')}
                  onClick={() => ctx.addSet('dur', v.k)}>{v.t}</button>
        ))}
      </div>
        </>
      )}

      <div class="edrow add-acoes">
        <button class="ins-btn-primary dbtn" disabled={!d.pode}
                onClick={() => ctx.gravaRetro(false)}>
          {d.descanso ? (d.jaEraDescanso ? 'Remover a marca' : 'Marcar descanso') : 'Adicionar'}
        </button>
      </div>
      {d.doPlano && (
        <button class="ins-btn-secondary dbtn ghost add-detalhe"
                onClick={() => ctx.gravaRetro(true)}>
          Adicionar e preencher os exercícios
        </button>
      )}
    </TelaCheia>
  );
}
