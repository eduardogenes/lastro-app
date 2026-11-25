// O PROGRAMA, o EDITOR de um treino e a REVISÃO DO TREINADOR no visual novo
// (Fase 3). Protótipo: docs/redesign-3/prototipos/treino.html ("programa",
// "editor" e "revisão"). Dados e ações são os de sempre: `ctx.programa`,
// `ctx.acoesPrograma`, `ctx.acoesProg`, `ctx.revisao` e as portas da revisão;
// a faixa de séries por músculo é `ctx.faixaDoTreinoV3`.

import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Chave, Linha, Pequeno, Pergunta, Radios, Saida, Secao, Vazio, radio } from '../base.jsx';
import { Letras, LegendaDasLetras } from './programas.jsx';

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
        <Cabecalho titulo="Texto do treinador" aoVoltar={ctx.fechaRevisao} />
        <div class="v3-pad v3-revisao-colar">
          <Apoio>Cole o texto que o treinador mandou. O app lê e mostra o que acontece antes de mudar qualquer coisa.</Apoio>
          <label class="v3-rotulo" for="revisao-texto">Texto</label>
          <textarea id="revisao-texto" class="v3-campo v3-texto" placeholder="Cole o texto do treinador"
                    onInput={e => ctx.textoDaRevisao(e.currentTarget)}>{r.texto}</textarea>
          <Acoes><Botao data-a="revisao-le" onClick={ctx.leRevisao}>Ler o texto {ic.seta}</Botao></Acoes>
        </div>
      </>
    );
  }
  const perguntas = r.perguntas.map(q => (
    <Secao key={q.nome}>
      <Pergunta pergunta={q.resposta === 'outro' ? '“' + q.nome + '” é outro exercício.'
                : '“' + q.nome + '” é ' + q.candidato + (q.resposta ? '.' : '?')}
                nota={(q.porApelido && q.resposta === 'mesma' ? 'Pelo que você respondeu antes. ' : '') + q.candidato + ' ' + q.series + q.lugar + '.'}
                respostas={[{ k: 'mesma', t: 'É o mesmo' }, { k: 'outro', t: 'É outro' }]}
                valor={q.resposta} aoResponder={k => ctx.respondeRevisao(q.nome, k)} />
    </Secao>
  ));
  const falha = r.falhou && <Caixa tom="atencao" titulo="A revisão não foi aplicada." nota="Suas escolhas continuam aqui." />;
  if (r.vazia) {
    const linhas = String(ctx.revisaoTexto ? ctx.revisaoTexto() : '').split(/\r?\n/).filter(l => l.trim()).length;
    return (
      <>
        <Cabecalho titulo="" aoVoltar={ctx.fechaRevisao} />
        <div class="v3-pad">
          <div class="v3-vazio-t">
            <h1 tabindex="-1">Nenhum treino no texto</h1>
            <p>O app procura linhas como <code>Treino A · nome</code> e, embaixo, exercícios com séries: <code>- Supino · 3 x 8-12</code>.{linhas ? ' Este texto tem ' + linhas + (linhas === 1 ? ' linha, e ela não é assim.' : ' linhas, e nenhuma é assim.') : ''}</p>
            <p>Nada foi criado, e o programa de agora continua igual.</p>
            <Acoes><Botao data-a="revisao-edita" onClick={ctx.editaTextoDaRevisao}>Editar o texto</Botao></Acoes>
            <div class="v3-saidas"><Saida data-a="revisao-programa" onClick={() => { ctx.fechaRevisao(); ctx.abrePrograma(); }}>Editar o programa de agora à mão</Saida></div>
          </div>
        </div>
        {r.problemas && r.problemas.length > 0 && <Secao titulo="As linhas que o app não entendeu">
          <ul class="v3-linhas-ruins">{r.problemas.map(p => <li key={p.linha}><b>“{p.linha}”</b><span>{p.motivo.charAt(0).toUpperCase() + p.motivo.slice(1)}.</span></li>)}</ul>
        </Secao>}
        <div class="v3-fim-curto" />
      </>
    );
  }
  if (r.igual) {
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
  if (r.escolha) return <DecidirV3 ctx={ctx} r={r} falha={falha} />;
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

const junta = l => l.length > 1 ? l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1] : (l[0] || '');
const respostas = n => n === 1 ? 'falta 1 resposta' : 'faltam ' + n + ' respostas';
const Artigo = (a, maiuscula) => (maiuscula ? a.toUpperCase() : a);

/**
 * Depois de responder uma pergunta, o foco vai para a próxima, ou para o botão
 * final: a pergunta respondida some da tela (design 6).
 */
function focaDepoisDeResponder() {
  const vai = () => {
    const prox = document.querySelector('.v3-q1:not(.feita) .rs [role="radio"]') || document.querySelector('[data-a="revisao-aplica"]');
    if (prox) prox.focus({ preventScroll: false });
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(vai); else setTimeout(vai, 0);
}

/**
 * A DECISÃO AO COLAR (protótipo de Programas, rodada 2): programa novo ou
 * revisão, já na sugestão; as perguntas que bloqueiam no topo; e embaixo, ao
 * vivo, o que acontece com cada escolha. O botão diz o que falta.
 */
function DecidirV3({ ctx, r, falha }) {
  const novo = r.modo === 'novo';
  const n = r.novo;
  const faltam = r.perguntas.filter(q => !q.resposta).length;
  const vaiParaPerguntas = () => {
    const el = document.querySelector('.v3-q1:not(.feita) .rs [role="radio"]') || document.getElementById('revisao-bloq');
    if (el) { el.focus({ preventScroll: true }); document.getElementById('revisao-bloq')?.scrollIntoView({ block: 'start' }); }
  };
  const rotulo = faltam ? (faltam === 1 ? 'Falta 1 resposta' : 'Faltam ' + faltam + ' respostas')
    : novo ? (n.quando === 'data' ? 'Guardar até ' + n.comeca : 'Começar o ' + (n.temTitulo ? n.nomeFinal : 'programa'))
    : r.marcadas ? 'Aplicar ' + mudancasEm(r.marcadas) : 'Guardar a revisão';
  const batem = r.doTexto.filter(d => r.deAgora.indexOf(d) >= 0);
  const motivo = r.sugestao === 'novo'
    ? <><b>Sugestão: programa novo.</b> Nenhum treino do texto bate com os de agora: o texto traz {junta(r.doTexto)}, e o programa de agora tem {junta(r.deAgora)}.</>
    : <><b>Sugestão: revisão.</b> {batem.length === 1 ? 'O ' + batem[0] + ' do texto já está' : 'O ' + junta(batem) + ' do texto já estão'} no programa de agora.</>;
  const e = r.exercicios;
  const exercicios = (
    <div class="v3-cons-l">{ic.halter}<div><b>Os exercícios</b>
      <span class="t">{!e.doZero.length ? 'Todos já têm histórico: as cargas continuam.'
        : !e.comHistorico ? 'Nenhum tem histórico ainda: todos começam do zero.'
        : e.comHistorico + ' dos ' + e.total + ' já têm histórico, e as cargas continuam. ' + (e.doZero.length === 1 ? 'Este começa do zero:' : 'Estes ' + e.doZero.length + ' começam do zero:')}</span>
      {e.doZero.length > 0 && e.comHistorico > 0 && <div class="v3-exl">{e.doZero.map(x => <div class="ex" key={x.id}><span class="v3-lin-t"><b>{x.n}</b><span>no {x.em}</span></span><span class="v3-selo novo">novo</span></div>)}</div>}
    </div></div>
  );
  const nomeVazio = novo && !String(n.nome || '').trim();
  return (
    <>
      <Cabecalho titulo="" aoVoltar={ctx.fechaRevisao} />
      <div class="v3-dec-topo">
        <p class="q">Lido: {r.lido.treinos} {r.lido.treinos === 1 ? 'treino' : 'treinos'}, {r.lido.exercicios} {r.lido.exercicios === 1 ? 'exercício' : 'exercícios'}</p>
        <h1 tabindex="-1">O que é este texto?</h1>
        <Radios classe="v3-seg" rotulo="O que é este texto">
          <button {...radio(novo, true, true)} data-a="revisao-modo-novo" onClick={() => ctx.escolheModoDaRevisao('novo')}>Programa novo</button>
          <button {...radio(!novo, false, true)} data-a="revisao-modo-revisao" onClick={() => ctx.escolheModoDaRevisao('revisao')}>Revisão</button>
        </Radios>
        <p class="v3-porque">{motivo}</p>
      </div>
      {r.problemas && r.problemas.length > 0 && <div class="v3-pad">{r.problemas.map(p => <Apoio key={p.linha}>“{p.linha}”: {p.motivo}.</Apoio>)}</div>}
      {r.perguntas.length > 0 && (
        <div class="v3-bloq" id="revisao-bloq" tabindex="-1">
          <div class="v3-bloq-h"><h2>{faltam ? (novo ? 'Antes de começar' : 'Antes de aplicar') : (r.perguntas.every(q => q.porApelido) ? 'Como você respondeu antes' : 'Respondido')}</h2><small class={faltam ? undefined : 'ok'}>{faltam ? respostas(faltam) : 'pronto'}</small></div>
          {r.perguntas.map(q => q.resposta ? (
            <div class="v3-q1 feita" key={q.nome}>{ic.ok}<p>“{q.nome}” {q.resposta === 'mesma' ? <><b>é</b> {q.artigo} {q.candidato}</> : <>é <b>outro</b> exercício</>}
              {q.porApelido && q.resposta === 'mesma' && <small>pelo que você respondeu antes</small>}</p>
              <button data-a={'revisao-muda-' + q.nome} aria-label={'Mudar a resposta sobre ' + q.nome} onClick={() => ctx.respondeRevisao(q.nome, null)}>mudar</button></div>
          ) : (
            <div class="v3-q1" key={q.nome}><p>“{q.nome}” é {q.artigo} {q.candidato}?</p>
              <small>{q.noPrograma ? Artigo(q.artigo, true) + ' de agora: ' + q.noPrograma + '.' : q.candidato + ' ' + q.series + q.lugar + '.'} Se for o mesmo, as cargas continuam.</small>
              <Radios classe="rs" rotulo={q.nome}>
                <button {...radio(false, true, false)} onClick={() => { ctx.respondeRevisao(q.nome, 'mesma'); focaDepoisDeResponder(); }}>É o mesmo</button>
                <button {...radio(false, false, false)} onClick={() => { ctx.respondeRevisao(q.nome, 'outro'); focaDepoisDeResponder(); }}>É outro</button>
              </Radios></div>
          ))}
        </div>
      )}
      {r.bloqueio && (
        <div class="v3-pad">
          <Caixa tom="atencao" data-a="revisao-bloqueio" titulo={'O treino ' + r.bloqueio + ' está aberto agora.'}
                 nota={novo ? 'Trocar de programa no meio misturaria as séries de hoje. Comece depois de encerrar o treino.'
                   : 'Mudar o programa dele no meio do treino misturaria as séries de hoje. Aplique depois de encerrar, ou desmarque as mudanças do treino ' + r.bloqueio + '.'} />
        </div>
      )}
      <div class="v3-depois"><h2>{novo ? 'Depois de começar' : 'Depois de aplicar'}</h2>
        <div class="v3-cons">
          {novo ? <>
            <div class="v3-cons-l">{ic.lista}<div><b>O nome</b>
              <label class="so-leitor" for="programa-nome">Nome do programa</label>
              <input id="programa-nome" class={'v3-campo' + (n.repetido ? ' erro' : '')} value={n.nome} placeholder={n.reserva} autocomplete="off"
                     aria-describedby="programa-nome-apoio"
                     onInput={ev => ctx.nomeDoProgramaNovo(ev.currentTarget)} onBlur={ev => ctx.nomeDoProgramaNovo(ev.currentTarget, true)} />
              <span id="programa-nome-apoio">
                {n.repetido ? <p class="v3-msg-e">{ic.atencao}<span>Já existe um “{n.repetido.nome}”, de {n.repetido.de}, guardado. Este fica “{n.nomeFinal}”, ou troque o nome.</span></p>
                  : nomeVazio ? <span class="t">Sem nome, ele fica “{n.reserva}”.</span>
                  : n.temTitulo ? <span class="t">Lido da primeira linha do texto. A data vira subtítulo: “desde {n.desde}”.</span>
                  : <span class="t">O texto não traz título, então o nome é a data {n.dataDoTexto ? 'do texto' : 'de hoje'}. O treinador pode escrever no topo: <code>Programa · nome · começa dd/mm</code>.</span>}
              </span>
              {n.objetivo && <span class="t v3-cons-obj"><b>Objetivo:</b> {n.objetivo}</span>}
            </div></div>
            {n.comeca && <div class="v3-cons-l">{ic.dias}<div><b>Quando começa</b><span class="t">O texto diz {n.comeca}.</span>
              <Radios classe="v3-seg" rotulo="Quando começa">
                <button {...radio(n.quando === 'data', true, true)} data-a="revisao-comeca-data" onClick={() => ctx.quandoComecaONovo('data')}>Em {n.comeca}</button>
                <button {...radio(n.quando === 'agora', false, true)} data-a="revisao-comeca-agora" onClick={() => ctx.quandoComecaONovo('agora')}>Agora</button>
              </Radios>
              {n.quando === 'data' && <span class="t v3-cons-obj">Até lá, segue o de agora. Em {n.comeca}, o Hoje pergunta se começa.</span>}
            </div></div>}
            <div class="v3-cons-l">{ic.troca}<div><b>A rotação</b>
              <span class="t">{n.quando === 'data' ? 'A partir de ' + n.comeca + ':' : 'A partir de hoje, começando pelo ' + (n.rotacao[0] || '') + ':'}</span>
              <Letras letras={n.rotacao.map(k => ({ k }))} fora={n.fora} rotulo="A rotação do programa novo" /><LegendaDasLetras alerta />
            </div></div>
            {n.agora && <div class="v3-cons-l">{ic.plano}<div><b>O programa de agora</b>
              <span class="t">{n.quando === 'data'
                ? <>Segue até {n.comeca}. Depois vai para a linha do tempo, guardado, com o que foi feito nele.</>
                : <>Vai para a linha do tempo como <b>{n.agora.nome}</b>{n.agora.de ? ', ' + n.agora.de + ' a ' + n.agora.ate : ''}, com {n.agora.feitos === 1 ? 'o treino feito' : 'os ' + n.agora.feitos + ' treinos feitos'} nele. Nada se apaga, e ele pode voltar.</>}</span>
            </div></div>}
            {exercicios}
          </> : <>
            {r.somados && <div class="v3-cons-l alerta">{ic.atencao}<div><b>A rotação fica com {r.somados.total} treinos</b>
              <span class="t">{r.somados.novos.length === 1 ? 'O treino novo do texto entra somado' : 'Os ' + r.somados.novos.length + ' treinos novos do texto entram somados'} aos {r.somados.deAgora.length} de agora. Se o texto é um programa inteiro, isso não é o que você quer.</span>
              <Letras letras={r.somados.deAgora.map(k => ({ k }))} rotulo="Os treinos de agora" />
              <div class="v3-cons-mais"><Letras letras={r.somados.novos.map(k => ({ k }))} fora={r.somados.fora} alerta rotulo="Os treinos que entram" /></div>
            </div></div>}
            <div class="v3-cons-l">{ic.plano}<div><b>O programa de agora</b>
              <span class="t">Continua o mesmo, sem nome novo. As mudanças entram como uma revisão dele{r.data ? ', com a data de ' + r.data : ''}. O que você deixar de fora continua aparecendo como diferença sua.</span>
            </div></div>
            {exercicios}
          </>}
        </div>
      </div>
      {!novo && r.grupos.map(g => (
        <Secao key={g.dia} titulo={g.titulo}>
          <div>
            {g.mudancas.map(m => (
              <Chave key={m.k} sinal={m.sinal} tom={m.sinal in TOM_DO_SINAL ? TOM_DO_SINAL[m.sinal] : 'm'} titulo={m.titulo} apoio={m.detalhe}
                     ligada={m.on} data-a={'mud-' + m.k} aoMudar={() => ctx.alternaMudanca(m.k)} />
            ))}
          </div>
        </Secao>
      ))}
      <div class="v3-dec-fim v3-revisao-confirmar">
        {falha}
        <Botao data-a="revisao-aplica" disabled={!!r.bloqueio} aria-disabled={faltam ? 'true' : undefined} aria-describedby="revisao-motivo"
               onClick={ev => faltam ? vaiParaPerguntas() : ctx.incorporaRevisao(ev)}>{rotulo}</Botao>
        <p id="revisao-motivo">{faltam ? (faltam > 1 ? 'Responda as perguntas no topo.' : 'Responda a pergunta no topo.') : 'Dá para desfazer logo depois.'}</p>
      </div>
    </>
  );
}
