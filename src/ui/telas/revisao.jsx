// A REVISÃO DO TREINADOR, colada em texto — a D, `prescricao.html`, estado 6;
// decisão do dono, 14/10.
//
// Três momentos numa tela só: colar o texto; responder, uma vez por nome, se
// é o mesmo exercício (com as séries que ele já tem, porque é isso que uma
// resposta errada levaria para o lugar errado); e ler o que muda em cada
// treino, com as mudanças dele que saem, antes de gravar.

import { TelaCheia } from '../instrumento/telacheia.jsx';
import { Procedencia, Secao } from '../instrumento/primitivos.jsx';

function Colar({ d, ctx }) {
  return (
    <>
      <Secao primeira rotulo="O texto da revisão">
        <p class="ins-body-sm ins-t2 rv-p">
          Cole o programa que o treinador escreveu. O app lê, pergunta o que não
          reconhece com certeza, e mostra o que muda antes de gravar qualquer coisa.
        </p>
        <textarea id="rev-texto" class="ins-input rv-texto" rows="10" aria-label="Texto da revisão do treinador"
                  placeholder={'Treino B · Pernas\n- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps'}
                  onInput={e => ctx.textoDaRevisao(e.currentTarget)}>{d.texto}</textarea>
        <button class="ins-btn-primary" data-a="rev-ler" onClick={ctx.leRevisao}>Ler a revisão</button>
      </Secao>
      <Secao rotulo="O modelo para o treinador">
        <p class="ins-body-sm ins-t2 rv-p">
          Peça ao treinador que escreva neste formato: um "Treino X" por bloco, um
          exercício por linha, com séries × repetições e, se quiser, RIR, descanso,
          grupo muscular e "dica:".
        </p>
        <pre class="rv-modelo" data-a="rev-modelo">{d.modelo}</pre>
      </Secao>
    </>
  );
}

function Lida({ d, ctx }) {
  return (
    <>
      {d.problemas.length > 0 && (
        <Secao primeira rotulo={d.problemas.length === 1 ? 'Uma linha não foi entendida' : d.problemas.length + ' linhas não foram entendidas'}>
          <ul class="ins-lista rv-problemas">
            {d.problemas.map((p, i) => (
              <li key={i} class="ins-linha">
                <span class="ins-linha-n">
                  <span class="ins-linha-t rv-linha">{p.linha}</span>
                  <span class="ins-linha-s">{p.motivo}</span>
                </span>
              </li>
            ))}
          </ul>
          <Procedencia>o que não foi entendido fica de fora: corrija o texto e leia de novo</Procedencia>
        </Secao>
      )}

      {d.vazia && <p class="ins-body ins-t1">Nenhum "Treino X" com exercício foi encontrado no texto.</p>}

      {d.perguntas.length > 0 && (
        <Secao primeira={!d.problemas.length} rotulo="Antes de gravar, uma pergunta por nome">
          {d.perguntas.map(q => (
            <div key={q.nome} class="rv-perg" data-rev-pergunta={q.nome}>
              <p class="ins-body ins-t1 rv-q">“{q.nome}” é o mesmo exercício que <b>{q.candidato}</b>?</p>
              <p class="ins-body-sm ins-t2">
                {q.series} {q.lugar ? q.lugar + ' ' : ''}Responder errado manda o histórico para o exercício errado.
              </p>
              <div class="rv-b">
                <button class={'ins-btn-secondary' + (q.resposta === 'mesma' ? ' on' : '')} aria-pressed={q.resposta === 'mesma' ? 'true' : 'false'}
                        data-a="rev-mesma" onClick={() => ctx.respondeRevisao(q.nome, 'mesma')}>É o mesmo</button>
                <button class={'ins-btn-secondary' + (q.resposta === 'outro' ? ' on' : '')} aria-pressed={q.resposta === 'outro' ? 'true' : 'false'}
                        data-a="rev-outro" onClick={() => ctx.respondeRevisao(q.nome, 'outro')}>É outro exercício</button>
              </div>
            </div>
          ))}
        </Secao>
      )}

      {d.novos.length > 0 && (
        <p class="ins-body-sm ins-t2 rv-novos" data-a="rev-novos">
          {d.novos.length === 1 ? 'Entra como exercício novo, com histórico próprio: ' : 'Entram como exercícios novos, com histórico próprio: '}
          {d.novos.join(', ')}.
        </p>
      )}

      {d.dias.map(m => (
        <Secao key={m.dia} rotulo={'O que esta revisão muda no Treino ' + m.dia} nota={m.series}>
          {m.novo && <p class="ins-body-sm ins-t2">Treino novo: entra no fim da sequência.</p>}
          {m.linhas.length
            ? <ul class="rv-mud">{m.linhas.map(l => <li key={l} class="ins-body-sm">{l}</li>)}</ul>
            : <p class="ins-body-sm ins-t3">Nada muda neste treino.</p>}
          {m.suas.length > 0 && (
            <div class="rv-suas">
              <p class="ins-body-sm ins-t1">Suas mudanças no Treino {m.dia} são substituídas por esta revisão:</p>
              <ul class="rv-mud">{m.suas.map(l => <li key={l} class="ins-body-sm ins-t2">{l}</li>)}</ul>
            </div>
          )}
        </Secao>
      ))}

      <div class="rv-fim">
        <button class="ins-btn-primary" data-a="rev-incorpora" disabled={!d.pode} onClick={ctx.incorporaRevisao}>
          Incorporar a revisão
        </button>
        {!d.pode && !d.vazia && <p class="ins-body-sm ins-t3">Responda as perguntas acima para gravar.</p>}
        <button class="ins-btn-secondary" data-a="rev-de-novo" onClick={ctx.abreRevisao}>Colar outro texto</button>
      </div>
    </>
  );
}

export function Revisao({ ctx }) {
  const d = ctx.revisao();
  if (!d) return null;
  return (
    <TelaCheia olho="prescrição" titulo={d.lida && d.data ? 'Revisão de ' + d.data : 'Revisão do treinador'}
               aoVoltar={ctx.fechaRevisao} corpo="hwrap">
      {d.lida ? <Lida d={d} ctx={ctx} /> : <Colar d={d} ctx={ctx} />}
    </TelaCheia>
  );
}
