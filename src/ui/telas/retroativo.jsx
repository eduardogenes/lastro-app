// REGISTRAR UM TREINO PASSADO — a terceira entrega da D (`dias.html`, estados
// 6 a 8).
//
// A folha pergunta uma coisa só: que treino foi. O previsto é o próximo da
// sequência NAQUELE dia, em destaque e do tamanho do polegar; os outros da
// sequência e a aula ficam logo abaixo, um toque cada; e "Fora da prescrição"
// é uma linha à parte, porque grava outra coisa — presença, grupos e duração,
// sem séries — e não mexe na sequência (F155).
//
// Um toque GRAVA. Depois dele a folha diz o que ficou gravado e o que mudou por
// causa disso, e oferece o resto como opcional: a hora (nenhuma é inventada,
// F270) e as séries, ou, fora da prescrição, os grupos, a duração e um nome.
// Cada um desses toques corrige o registro que já existe.
//
// O que ela NÃO tem, e está declarado: a escolha da data (a data é a do dia de
// onde ela abriu — o mês escolhe o dia) e o "foi descanso" (mora no próprio
// dia, com o mesmo peso de "Registrar treino").

import { TelaCheia } from '../instrumento/telacheia.jsx';

function Antes({ d, ctx }) {
  return (
    <>
      <p class="ins-label ln-prev-r">o próximo da sequência naquele dia</p>
      <h2 class="ins-title ln-pergunta">{d.pergunta}</h2>
      <button class="ins-linha ln-previsto" data-a="lanca-previsto" onClick={() => ctx.lancaTreino(d.previsto.k)}>
        <span class="ln-letra" aria-hidden="true">{d.previsto.letra === 'aula' ? 'aula' : d.previsto.letra}</span>
        <span class="ins-linha-n">
          <span class="ins-linha-t">{d.previsto.titulo}</span>
          {d.previsto.detalhe && <span class="ins-linha-s">{d.previsto.detalhe}</span>}
        </span>
      </button>
      {d.outros.length > 0 && (
        <div class="ln-outros">
          <span class="ins-body-sm ins-t2">Outro da sequência</span>
          <div class="ln-chips">
            {d.outros.map(x => (
              <button key={x.k} class="chip ins-chip" data-a={'lanca-' + x.k}
                      onClick={() => ctx.lancaTreino(x.k)}>{x.t}</button>
            ))}
          </div>
        </div>
      )}
      <button class="ins-linha ln-fora" data-a="lanca-livre" onClick={() => ctx.lancaTreino('livre')}>
        <span class="ins-linha-n">
          <span class="ins-linha-t">Fora da prescrição</span>
          <span class="ins-linha-s">presença, grupos trabalhados e duração · não mexe na sequência</span>
        </span>
      </button>
      <p class="ins-body-sm ins-t3 ln-nota">Um toque grava a presença. A hora e as séries vêm depois, se você quiser.</p>
    </>
  );
}

function Gravado({ d }) {
  return (
    <div class="ln-gravado" role="status">
      <span class="ins-body ins-t1">{d.titulo2}</span>
      <span class="ins-body-sm ins-t2">{d.gravadoEm}</span>
    </div>
  );
}

function DoPlano({ d, ctx }) {
  return (
    <>
      <Gravado d={d} />
      <div class="ln-bloco">
        <span class="ins-body-sm ins-t2 ln-bloco-t">A hora de início</span>
        <div class="ln-chips">
          <button class={'chip ins-chip' + (!d.horaAberta ? ' on' : '')} aria-pressed={!d.horaAberta ? 'true' : 'false'}
                  data-a="lanca-sem-hora" onClick={() => ctx.semHoraNoLancamento()}>Sem hora</button>
          <button class={'chip ins-chip' + (d.horaAberta ? ' on' : '')} aria-pressed={d.horaAberta ? 'true' : 'false'}
                  data-a="lanca-por-hora" onClick={() => ctx.abreHoraDoLancamento()}>Pôr a hora</button>
        </div>
        {d.horaAberta && (
          <input type="text" inputmode="numeric" id="ahora" class="ins-input ln-hora" value={d.hora}
                 placeholder="06:15" aria-label="hora de início" onInput={e => ctx.horaDoLancamento(e.currentTarget)} />
        )}
        <p class="ins-body-sm ins-t3">{d.notaHora}</p>
      </div>
      <div class="ln-bloco">
        <span class="ins-body-sm ins-t2 ln-bloco-t">As séries</span>
        <button class="ins-linha ln-detalhar" data-a="lanca-detalhar" onClick={() => ctx.detalhaLancamento()}>
          <span class="ins-linha-n">
            <span class="ins-linha-t">Detalhar exercícios e séries</span>
            <span class="ins-linha-s">{d.detalhar}</span>
          </span>
        </button>
        <p class="ins-body-sm ins-t3">
          Só a presença também vale: o treino conta como dia com treino do mesmo jeito, e a sequência anda igual.
        </p>
      </div>
      <p class="ins-body-sm ins-t2 ln-nota">{d.sequencia}</p>
    </>
  );
}

function Fora({ d, ctx }) {
  return (
    <>
      <Gravado d={d} />
      <div class="ln-bloco">
        <span class="ins-body-sm ins-t2 ln-bloco-t">O que trabalhou</span>
        <div class="ln-chips">
          {d.grupos.map(g => (
            <button key={g.k} class={'chip ins-chip' + (g.on ? ' on' : '')} aria-pressed={g.on ? 'true' : 'false'}
                    data-a={'lanca-grupo-' + g.k} onClick={() => ctx.grupoDoLancamento(g.k)}>{g.t}</button>
          ))}
        </div>
      </div>
      <div class="ln-bloco">
        <span class="ins-body-sm ins-t2 ln-bloco-t">Quanto tempo</span>
        <div class="ln-chips">
          {d.duracoes.map(v => (
            <button key={v.k} class={'chip ins-chip' + (v.on ? ' on' : '')} aria-pressed={v.on ? 'true' : 'false'}
                    data-a={'lanca-dur-' + v.k} onClick={() => ctx.duracaoDoLancamento(v.k)}>{v.t}</button>
          ))}
        </div>
        {d.durAberta && (
          <input type="text" inputmode="numeric" class="ins-input ln-min" value={d.durMin} placeholder="minutos"
                 aria-label="duração em minutos" onChange={e => ctx.duracaoDoLancamento(e.currentTarget.value)} />
        )}
      </div>
      <div class="ln-bloco">
        <span class="ins-body-sm ins-t2 ln-bloco-t">Um nome, se quiser</span>
        {/* o único texto livre da folha, e por isso o teclado do sistema */}
        <input class="ins-input add-nome" value={d.nome} placeholder="futevôlei, academia do hotel…"
               onInput={e => ctx.nomeDoLancamento(e.currentTarget)} onChange={() => ctx.guardaLancamento()} />
      </div>
      <p class="ins-body-sm ins-t2 ln-nota">{d.nota}</p>
    </>
  );
}

export function Retroativo({ ctx }) {
  const d = ctx.retroativo();
  if (!d) return null;
  return (
    <TelaCheia olho={d.procedencia} titulo={d.titulo} aoVoltar={ctx.fechaAdicionar} corpo="hwrap">
      {!d.gravado ? <Antes d={d} ctx={ctx} /> : d.livre ? <Fora d={d} ctx={ctx} /> : <DoPlano d={d} ctx={ctx} />}
    </TelaCheia>
  );
}
