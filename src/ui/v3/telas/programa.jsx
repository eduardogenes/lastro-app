// O PROGRAMA, o EDITOR de um treino e a REVISÃO DO TREINADOR no visual novo
// (Fase 3). Protótipo: docs/redesign-3/prototipos/treino.html ("programa",
// "editor" e "revisão"). Dados e ações são os de sempre: `ctx.programa`,
// `ctx.acoesPrograma`, `ctx.acoesProg`, `ctx.revisao` e as portas da revisão;
// a faixa de séries por músculo é `ctx.faixaDoTreinoV3`.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Chave, Linha, Pequeno, Pergunta, Saida, Secao, Vazio } from '../base.jsx';

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
    const meses = new Map();
    for (const x of p.log) {
      if (!meses.has(x.mes)) meses.set(x.mes, []);
      meses.get(x.mes).push(x);
    }
    return (
      <>
        <Cabecalho titulo="Mudanças" nota={p.meta} aoVoltar={A.volta} />
        {meses.size ? Array.from(meses, ([mes, entradas]) => <Secao key={mes} titulo={mes}>
          {entradas.map(x => <div class="v3-mud-l" key={x.i}>
            <span aria-hidden="true" class="v3-mud-s m v3-n">{x.dia}</span>
            <span class="v3-lin-t"><b>{x.txt}</b><span>{x.meta}</span></span>
            {x.textoRevisao && <Pequeno contorno onClick={() => ctx.abreRevisao(x.textoRevisao)}>Rever texto</Pequeno>}
          </div>)}
        </Secao>) : <Secao><Apoio>Nenhuma mudança no programa ainda.</Apoio></Secao>}
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

/** O tom do círculo de cada sinal: menta entra, atenção sai, o céu da semana o que muda. */
const TOM_DO_SINAL = { '+': '', '−': 't' };
const mudancasEm = n => n + (n === 1 ? ' mudança' : ' mudanças');

/**
 * A REVISÃO DO TREINADOR (ds-telas2.js, "revisao"): cola o texto, o app lê,
 * pergunta o nome que não reconhece com certeza, e mostra cada mudança com a
 * chave. Decisão do dono (17/11/2026): mudança por mudança; o que ficar de fora
 * continua como diferença dele em relação ao programa do treinador.
 */
export function RevisaoV3({ ctx }) {
  const r = ctx.revisao();
  if (!r) return null;
  if (!r.lida) {
    return (
      <>
        <Cabecalho titulo="Revisão do treinador" aoVoltar={ctx.fechaRevisao} />
        <div class="v3-pad v3-revisao-colar">
          <Apoio>Cole aqui o texto que o treinador mandou. O app lê, mostra cada mudança e você escolhe quais entram.</Apoio>
          <label class="v3-rotulo" for="revisao-texto">Texto da revisão</label>
          <textarea id="revisao-texto" class="v3-campo v3-texto" placeholder="Cole o texto da revisão"
                    onInput={e => ctx.textoDaRevisao(e.currentTarget)}>{r.texto}</textarea>
          <Acoes><Botao data-a="revisao-le" onClick={ctx.leRevisao}>Ler a revisão {ic.seta}</Botao></Acoes>
        </div>
      </>
    );
  }
  const perguntas = r.perguntas.map(q => (
    <Secao key={q.nome}>
      <Pergunta pergunta={q.resposta === 'outro' ? '“' + q.nome + '” é outro exercício.'
                : '“' + q.nome + '” é ' + q.candidato + (q.resposta ? '.' : '?')}
                nota={q.candidato + ' ' + q.series + q.lugar + '.'}
                respostas={[{ k: 'mesma', t: 'É o mesmo' }, { k: 'outro', t: 'É outro' }]}
                valor={q.resposta} aoResponder={k => ctx.respondeRevisao(q.nome, k)} />
    </Secao>
  ));
  const falha = r.falhou && <Caixa tom="atencao" titulo="A revisão não foi aplicada." nota="Suas escolhas continuam aqui." />;
  if (r.vazia || r.igual) {
    return (
      <>
        <Cabecalho titulo={r.vazia ? 'Nada lido' : 'Nada muda'} nota={r.data || ''} aoVoltar={ctx.fechaRevisao} />
        {perguntas}
        <Secao>
          {falha}
          <Vazio titulo={r.vazia ? 'O app não achou mudanças no texto' : 'A revisão é igual ao programa do treinador'}>
            <p>{r.vazia ? 'Ele procura nome de treino, de exercício e séries (“3x8-12”). Confira se o texto veio inteiro, ou edite o programa à mão.'
                        : 'Nenhum exercício, série, repetição ou descanso muda nos treinos que ela traz.'}</p>
            <Acoes>
              <Botao tipo="contorno" cheio data-a="revisao-edita" onClick={ctx.editaTextoDaRevisao}>Editar o texto</Botao>
              <Botao tipo="contorno" cheio data-a="revisao-programa" onClick={() => { ctx.fechaRevisao(); ctx.abrePrograma(); }}>Abrir o programa</Botao>
            </Acoes>
          </Vazio>
          {r.problemas && r.problemas.length > 0 && r.problemas.map(p => <Apoio key={p.linha}>“{p.linha}”: {p.motivo}.</Apoio>)}
        </Secao>
        <div class="v3-fim-curto" />
      </>
    );
  }
  return (
    <>
      <Cabecalho titulo={r.falta ? 'Revisão do treinador' : mudancasEm(r.total)} nota={r.falta ? null : r.marcadas + (r.marcadas === 1 ? ' marcada' : ' marcadas')} aoVoltar={ctx.fechaRevisao} />
      {r.problemas && r.problemas.length > 0 && (
        <div class="v3-pad">{r.problemas.map(p => <Apoio key={p.linha}>“{p.linha}”: {p.motivo}.</Apoio>)}</div>
      )}
      {perguntas}
      {r.grupos.map(g => (
        <Secao key={g.dia} titulo={g.titulo}>
          <div>
            {g.mudancas.map(m => (
              <Chave key={m.k} sinal={m.sinal} tom={m.sinal in TOM_DO_SINAL ? TOM_DO_SINAL[m.sinal] : 'm'} titulo={m.titulo} apoio={m.detalhe}
                     ligada={m.on} data-a={'mud-' + m.k} aoMudar={() => ctx.alternaMudanca(m.k)} />
            ))}
          </div>
        </Secao>
      ))}
      {r.novos.length > 0 && <div class="v3-pad"><Apoio>Exercícios novos no catálogo: {r.novos.join(', ')}.</Apoio></div>}
      <Secao classe="v3-revisao-confirmar">
        {falha}
        {r.bloqueio && (
          <Caixa tom="atencao" data-a="revisao-bloqueio" titulo={'Treino ' + r.bloqueio + ' está aberto agora.'}
                 nota={'Mudar o programa dele no meio do treino misturaria as séries de hoje. Aplique depois de encerrar, ou desmarque as mudanças do treino ' + r.bloqueio + '.'} />
        )}
        <Acoes class="v3-acoes-0">
          <Botao data-a="revisao-aplica" disabled={!!r.bloqueio} aria-disabled={r.falta || undefined}
                 aria-describedby={r.falta ? 'revisao-motivo' : undefined} onClick={ctx.incorporaRevisao}>
            {r.falta ? 'Aplicar' : r.marcadas ? 'Aplicar ' + mudancasEm(r.marcadas) : 'Guardar a revisão'}
          </Botao>
        </Acoes>
        {r.falta ? <p class="v3-apoio" id="revisao-motivo">
          {r.perguntas.filter(q => !q.resposta).length > 1 ? 'Responda as perguntas acima para aplicar.' : 'Responda a pergunta acima para aplicar.'}
        </p> : <Apoio>O programa do treinador passa a ser este. O que você deixar de fora continua aparecendo como diferença sua. Dá para desfazer.</Apoio>}
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}
