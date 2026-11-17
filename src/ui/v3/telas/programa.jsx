// O PROGRAMA, o EDITOR de um treino e a REVISÃO DO TREINADOR no visual novo
// (Fase 3). Protótipo: docs/redesign-3/prototipos/treino.html ("programa",
// "editor" e "revisão"). Dados e ações são os de sempre: `ctx.programa`,
// `ctx.acoesPrograma`, `ctx.acoesProg`, `ctx.revisao` e as portas da revisão;
// a faixa de séries por músculo é `ctx.faixaDoTreinoV3`.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Cabecalho, Linha, Pergunta, Saida, Secao, Vazio } from '../base.jsx';

export function ProgramaV3({ ctx }) {
  const p = ctx.programa();
  if (!p) return null;
  const A = ctx.acoesPrograma;
  if (p.modo === 'dia') return <EditorV3 ctx={ctx} p={p} />;
  if (p.modo === 'diff') {
    return (
      <>
        <Cabecalho titulo="O que está diferente" nota={p.meta} aoVoltar={A.volta} />
        {!p.blocos.length && <div class="v3-pad"><Vazio titulo="Igual ao treinador"><p>Nada no seu programa difere do que ele prescreveu.</p></Vazio></div>}
        {p.blocos.map(b => (
          <Secao key={b.k} titulo={b.titulo.charAt(0).toUpperCase() + b.titulo.slice(1)}>
            <div>{b.itens.map(t => <Linha key={t} titulo={t} />)}</div>
            {b.dia && <Saida data-a={'restaura-' + b.dia} onClick={() => A.restauraDia(b.dia)}>Voltar o treino {b.dia} ao do treinador</Saida>}
          </Secao>
        ))}
        <div class="v3-fim-curto" />
      </>
    );
  }
  if (p.modo === 'historico') {
    return (
      <>
        <Cabecalho titulo="Mudanças" nota={p.meta} aoVoltar={A.volta} />
        <Secao><div>{p.log.length ? p.log.map(x => <Linha key={x.i} titulo={x.txt} apoio={x.meta} />) : <Apoio>Nenhuma mudança no programa ainda.</Apoio>}</div></Secao>
        <div class="v3-fim-curto" />
      </>
    );
  }
  return (
    <>
      <Cabecalho titulo="Programa" nota={p.stats[0].valor + ' séries · ' + p.dif + (p.dif === 1 ? ' diferença' : ' diferenças')} aoVoltar={A.volta} />
      <div class="v3-pad"><Apoio>Mudança aqui vale a partir do próximo treino. Para mudar só hoje, use "Mudar este exercício" durante o treino.</Apoio></div>
      <Secao>
        <div class="v3-tiles">
          {p.dias.map(d => (
            <div key={d.d} class="v3-tile">
              <button class="v3-tile-b" data-a={'prog-dia-' + d.d} onClick={() => A.abreDia(d.d)}>
                <span class="v3-tile-l">{d.d}</span>
                <span class="v3-lin-t"><b>{d.nome}</b><span>{d.meta}</span></span>
              </button>
              <span class="v3-tile-m">
                <button disabled={d.primeiro} aria-label={'Subir o treino ' + d.d + ' na ordem'} onClick={() => A.moveDia(d.i, -1)}>{ic.cima}</button>
                <button disabled={d.ultimo} aria-label={'Descer o treino ' + d.d + ' na ordem'} onClick={() => A.moveDia(d.i, 1)}>{ic.baixo}</button>
              </span>
            </div>
          ))}
        </div>
      </Secao>
      <Secao>
        <div>
          <Linha titulo={p.dif ? 'Ver as ' + p.dif + ' diferenças do treinador' : 'Igual ao treinador'} apoio="o que você mudou em relação a ele"
                 data-a="prog-diff" aoTocar={() => A.modo('diff')} />
          <Linha titulo="Histórico de mudanças" apoio="o que mudou, quando e por quê" data-a="prog-hist" aoTocar={() => A.modo('historico')} />
          <Linha titulo="Revisão do treinador" apoio="colar o texto novo" data-a="prog-revisao" aoTocar={ctx.abreRevisao} />
          <Linha titulo="Criar treino novo" apoio="entra no fim da sequência" mais data-a="prog-cria" aoTocar={A.criaTreino} />
        </div>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

function EditorV3({ ctx, p }) {
  const A = ctx.acoesProg;
  if (p.vazio) return <><Cabecalho titulo={p.titulo} aoVoltar={ctx.acoesPrograma.volta} /><div class="v3-pad"><Vazio titulo="Treino não encontrado" /></div></>;
  const faixa = ctx.faixaDoTreinoV3(p.dia);
  const total = p.linhas.reduce((n, l) => n + l.series, 0);
  return (
    <>
      <Cabecalho titulo={'Treino ' + p.dia} nota={total + ' séries'} aoVoltar={ctx.acoesPrograma.volta} />
      {faixa.length > 0 && (
        <div class="v3-vol" aria-label="Séries por músculo neste treino">
          {faixa.map(f => (
            <span key={f.g} class={f.diferenca > 0 ? 'mais' : f.diferenca < 0 ? 'menos' : undefined}>
              <b class="v3-n">{f.series}{f.diferenca ? ' (' + (f.diferenca > 0 ? '+' : '') + f.diferenca + ')' : ''}</b>{f.g}
            </span>
          ))}
        </div>
      )}
      <Secao>
        <div>
          {p.linhas.map(l => (
            <div key={l.i} class="v3-ed">
              <span class="v3-ed-m">
                <button disabled={l.primeira} aria-label={'Subir ' + l.nome} onClick={() => A.subir(l.i)}>{ic.cima}</button>
                <button disabled={l.ultima} aria-label={'Descer ' + l.nome} onClick={() => A.descer(l.i)}>{ic.baixo}</button>
              </span>
              <button class="v3-ed-n" data-a={'ed-troca-' + l.i} onClick={() => A.trocar(l.i)} aria-label={'Trocar ' + l.nome}>
                <b>{l.nome}</b><span>{l.meta} · {l.reps}</span>
              </button>
              <span class="v3-ed-s">
                <button aria-label={'Menos uma série em ' + l.nome} data-a={'ed-menos-' + l.i} onClick={() => A.menos(l.i)}>−</button>
                <b class="v3-n">{l.series}</b>
                <button aria-label={'Mais uma série em ' + l.nome} data-a={'ed-mais-' + l.i} onClick={() => A.mais(l.i)}>+</button>
              </span>
              {l.troca && (
                <div class="v3-ed-troca">
                  {l.troca.grupos.map(g => (
                    <div key={g.rotulo}>
                      <Apoio>{g.rotulo}</Apoio>
                      {g.opcoes.map(o => <Linha key={o.id} titulo={o.n} apoio={o.antes || ''} aoTocar={() => A.escolheTroca(l.i, o.id)} />)}
                    </div>
                  ))}
                  <Saida onClick={() => A.remover(l.i)}>Tirar {l.nome} do treino</Saida>
                </div>
              )}
            </div>
          ))}
        </div>
        <Acoes><Botao tipo="contorno" cheio data-a="ed-add" onClick={ctx.acoesAdd.abre}>{ic.mais} Exercício</Botao></Acoes>
        {p.dif.length > 0 && <Saida onClick={() => ctx.acoesPrograma.restauraDia(p.dia)}>Voltar ao do treinador</Saida>}
        <Apoio>A faixa de cima mostra as séries por músculo neste treino e quanto saiu do que o treinador prescreveu. Tocar no nome mostra as trocas.</Apoio>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}
// o catálogo de adicionar exercício é a folha `catalogo` (catalogo.jsx)

// ---------- revisão do treinador ----------

export function RevisaoV3({ ctx }) {
  const r = ctx.revisao();
  if (!r) return null;
  if (!r.lida) {
    return (
      <>
        <Cabecalho titulo="Revisão do treinador" aoVoltar={ctx.fechaRevisao} />
        <div class="v3-pad">
          <Apoio>Cole aqui o texto que o treinador mandou. O app lê, mostra o que muda em cada treino, e você confirma.</Apoio>
          <textarea id="revisao-texto" class="v3-campo v3-texto" aria-label="Texto da revisão" placeholder="Cole o texto da revisão"
                    onInput={e => ctx.textoDaRevisao(e.currentTarget)}>{r.texto}</textarea>
          <Acoes><Botao data-a="revisao-le" onClick={ctx.leRevisao}>Ler a revisão {ic.seta}</Botao></Acoes>
        </div>
      </>
    );
  }
  return (
    <>
      <Cabecalho titulo={r.vazia ? 'Nada lido' : r.dias.length + (r.dias.length === 1 ? ' treino muda' : ' treinos mudam')} nota={r.data || ''} aoVoltar={ctx.fechaRevisao} />
      {r.problemas && r.problemas.length > 0 && <div class="v3-pad">{r.problemas.map(p => <Apoio key={p}>{p}</Apoio>)}</div>}
      {r.perguntas.map(q => (
        <Secao key={q.nome}>
          <Pergunta pergunta={'"' + q.nome + '" é ' + q.candidato + '?'} nota={q.series + (q.lugar ? ' ' + q.lugar : '')}
                    respostas={[{ k: 'mesma', t: 'É o mesmo' }, { k: 'outro', t: 'É outro' }]}
                    valor={q.resposta} aoResponder={k => ctx.respondeRevisao(q.nome, k)} />
        </Secao>
      ))}
      {r.dias.map(d => (
        <Secao key={d.dia} titulo={'Treino ' + d.dia + (d.novo ? ' · novo' : '')} nota={d.series}>
          <div>{d.linhas.map((l, j) => <Linha key={j} titulo={l} />)}</div>
          {d.suas.length > 0 && <Apoio>Suas mudanças neste treino saem: {d.suas.join('; ')}.</Apoio>}
        </Secao>
      ))}
      {r.novos.length > 0 && <div class="v3-pad"><Apoio>Exercícios novos no catálogo: {r.novos.join(', ')}.</Apoio></div>}
      <Secao>
        <Acoes><Botao data-a="revisao-aplica" disabled={!r.pode} onClick={ctx.incorporaRevisao}>Aplicar a revisão</Botao></Acoes>
        <Apoio>O programa do treinador passa a ser este, nos treinos que a revisão traz. Dá para desfazer pelo histórico de mudanças.</Apoio>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}
