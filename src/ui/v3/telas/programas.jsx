// Os PROGRAMAS (etapa 1 de docs/catalogo/00-desenho.md): a linha do tempo
// (próximo, agora, antes), o programa aberto — o ativo, com a continuidade de
// cada exercício e as revisões; o guardado, só leitura, com o balanço — e as
// folhas de reativar, renomear e ver uma revisão. Protótipo aprovado:
// ~/lastro-rascunho/programas (rodada 2). Dados: `ctx.programasV3`,
// `ctx.programaAbertoV3`, `ctx.revisaoDoProgramaV3`.

import { useState } from 'preact/hooks';
import { ic } from '../icones.jsx';
import { Acoes, Apoio, Botao, Caixa, Cabecalho, Folha, Saida, Secao } from '../base.jsx';

/** As letras da rotação: feitas, a próxima, as que faltam; os abertos à parte. */
export function Letras({ letras, fora, alerta, rotulo }) {
  return (
    <div class="v3-letras" role="list" aria-label={rotulo || 'Rotação'}>
      {letras.map(l => {
        const c = alerta ? 'alerta' : l.feito ? 'feito' : l.prox ? 'prox' : '';
        return <i key={l.k} role="listitem" class={c} aria-label={(l.sigla || l.k) + (l.feito ? ', feito' : l.prox ? ', o próximo' : '')}>
          {l.feito ? ic.ok : null}{l.sigla || l.k}</i>;
      })}
      {fora && fora.length > 0 && <><span class="sep" aria-hidden="true">+</span>{fora.map(k => <i key={k} role="listitem" class="fora" aria-label={k + ', fora de programa'}>{k}</i>)}</>}
    </div>
  );
}

export function LegendaDasLetras({ alerta }) {
  return (
    <div class="v3-rot-leg" aria-hidden="true">
      {!alerta && <><span><i style="background:var(--assunto-feito)" />feito</span><span><i style="background:var(--assunto-treino);box-shadow:inset 0 0 0 1.5px var(--texto)" />próximo</span></>}
      <span><i style="background:var(--assunto-semana)" />fora de programa</span>
    </div>
  );
}

function Ader({ barras, alto }) {
  return (
    <div class="v3-ader" style={alto ? 'height:44px' : undefined} aria-label="Treinos feitos por semana" role="img">
      {barras.map((b, i) => <i key={i} class={b.baixa ? 'b' : undefined} style={'height:' + Math.max(8, b.h) + '%'} />)}
    </div>
  );
}

/** A LINHA DO TEMPO dos programas. */
export function ProgramasV3({ ctx }) {
  const p = ctx.programasV3();
  if (!p) return null;
  const a = p.agora;
  return (
    <>
      <Cabecalho titulo="Programas" aoVoltar={ctx.fechaProgramas} />
      <div class="v3-tl" role="list">
        <div class={'v3-tl-n' + (p.proximos.length ? '' : ' vazio')} role="listitem">
          <span class="v3-tl-p" aria-hidden="true" />
          <div class="v3-tl-c"><p class="v3-tl-q">Próximo</p>
            {p.proximos.length ? p.proximos.map(x => (
              <button key={x.id} class="v3-tl-card" data-a={'programa-' + x.id} aria-label={x.nome + ', próximo, ' + x.sub} onClick={() => ctx.abreProgramaAberto(x.id)}>
                <span aria-hidden="true"><h3>{x.nome}{ic.dir}</h3><p class="per">{x.sub}</p></span>
              </button>
            )) : (
              <button class="v3-tl-card tracejado" data-a="programas-colar" onClick={() => ctx.abreRevisao()}>
                <p class="per">Quando o treinador mandar o próximo, ele aparece aqui. <span class="v3-tl-link">Colar um texto</span></p>
              </button>
            )}
          </div>
        </div>
        <div class="v3-tl-n agora" role="listitem">
          <span class="v3-tl-p" aria-hidden="true" />
          <div class="v3-tl-c"><p class="v3-tl-q">Agora</p>
            <button class="v3-tl-card" data-a="programa-ativo" onClick={() => ctx.abreProgramaAberto(a.id)}
                    aria-label={a.nome + ', agora' + (a.semana ? ', semana ' + a.semana : '') + ', ' + a.feitos + ' de ' + a.total + ' feitos' + (a.proximo ? ', o próximo é o ' + a.proximo : '')}>
              <span aria-hidden="true">
                <h3>{a.nome}{ic.dir}</h3><p class="per">{a.per}</p>
                {a.letras.length > 0 && <Letras letras={a.letras} />}
                <span class="lin3">
                  {a.semana && <span><b>semana {a.semana}</b></span>}
                  <span><b>{a.feitos} de {a.total}</b> feitos</span>
                  {a.proximo && <span>próximo: <b>{a.proximo}</b></span>}
                </span>
              </span>
            </button>
          </div>
        </div>
        {p.antes.length > 0 && (
          <div class="v3-tl-n" role="listitem">
            <span class="v3-tl-p" aria-hidden="true" />
            <div class="v3-tl-c"><p class="v3-tl-q">Antes</p>
              {p.antes.map(x => (
                <button key={x.id} class="v3-tl-card" data-a={'programa-' + x.id} onClick={() => ctx.abreProgramaAberto(x.id)}
                        aria-label={x.nome + ', antes, ' + x.per + (x.pct != null ? ', ' + x.pct + '% dos previstos' : '')}>
                  <span aria-hidden="true">
                    <h3>{x.nome}{ic.dir}</h3><p class="per">{x.per}</p>
                    {x.ader.length > 1 && <><Ader barras={x.ader} />
                      <span class="v3-ader-l"><span>treinos por semana</span>{x.pct != null && <span><b>{x.pct}%</b> dos previstos</span>}</span></>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {p.fora.length > 0 && (
        <Secao titulo="Fora de programa" nota="valem sempre">
          <div class="v3-lin" style="border:0">
            <span class="v3-lin-o" style="background:var(--assunto-semana)">{ic.halter}</span>
            <span class="v3-lin-t"><b>{p.fora.map(f => f.sigla === 'HX' ? 'HYROX' : f.nome).join(', ')}, aula e treino livre</b><span>aparecem com qualquer programa</span></span>
          </div>
        </Secao>
      )}
      <Secao titulo="Começar outro">
        <div>
          <button class="v3-lin" data-a="programas-colar-texto" onClick={() => ctx.abreRevisao()}>
            <span class="v3-lin-t"><b>Colar um texto do treinador</b><span>o app pergunta se é revisão ou programa novo</span></span>{ic.dir}
          </button>
          <button class="v3-lin" data-a="programas-duplica-ativo" onClick={() => ctx.duplicaPrograma(a.id)}>
            <span class="v3-lin-t"><b>Duplicar o de agora</b><span>fica em “Próximo”, como rascunho</span></span>{ic.mais}
          </button>
        </div>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/** UM PROGRAMA aberto: o ativo ou um guardado (ou o de "Próximo"). */
export function ProgramaAbertoV3({ ctx }) {
  const p = ctx.programaAbertoV3();
  if (!p) return null;
  const guardado = p.estado === 'guardado';
  return (
    <>
      <Cabecalho titulo="" aoVoltar={ctx.fechaProgramaAberto} />
      <div class="v3-pcab">
        <p class="k"><i class={p.ativo ? undefined : 'guard'} />{p.rotulo}</p>
        <h1 tabindex="-1">{p.nome}</h1>
        <p class="sub">{p.sub}</p>
      </div>
      {p.objetivo && <div class="v3-objetivo"><small>Objetivo, {p.origem === 'treinador' ? 'do treinador' : 'seu'}</small><p>{p.objetivo}</p></div>}
      {p.nums && <div class={'v3-nums' + (p.nums.length === 2 ? ' dois' : '')}>
        {p.nums.map(n => <div key={n.t}><b>{n.v}{n.u && <small>{n.u}</small>}</b><span>{n.t}</span></div>)}
      </div>}
      {p.balanco && <>
        {p.balanco.ader.length > 1 && <Secao titulo="Semana a semana" nota="treinos feitos">
          <Ader barras={p.balanco.ader} alto />
          <div class="v3-ader-l">{p.balanco.meses.map(m => <span key={m}>{m}</span>)}</div>
          {p.balanco.fraca && <Apoio>{p.balanco.fraca}</Apoio>}
        </Secao>}
        {(p.balanco.progressoes.length > 0 || p.balanco.parados.length > 0) && <Secao titulo="O que mais progrediu" nota={p.balanco.notaProgressao}>
          <div>
            {p.balanco.progressoes.map(x => <div class="v3-prog-l" key={x.id}><span class="v3-lin-t"><b>{x.n}</b><span>{x.de}</span></span><span class="d"><b>{x.d}</b><span>{x.em}</span></span></div>)}
            {p.balanco.parados.map(x => <div class="v3-prog-l" key={x.id}><span class="v3-lin-t"><b>{x.n}</b><span>{x.de}</span></span><span class="d"><b>=</b><span>{x.em}</span></span></div>)}
          </div>
        </Secao>}
        {p.balanco.seguiram.length > 0 && <Secao titulo={'Seguiram para o ' + p.balanco.ativo} nota={p.balanco.seguiram.length + ' de ' + p.balanco.total}>
          <div class="v3-chips">{p.balanco.seguiram.slice(0, 6).map(n => <span key={n}>{n}</span>)}{p.balanco.seguiram.length > 6 && <span class="mais">e mais {p.balanco.seguiram.length - 6}</span>}</div>
          <Apoio>Nesses, a carga do {p.balanco.ativo} parte de onde este programa parou.</Apoio>
        </Secao>}
      </>}
      <Secao titulo="Os treinos" nota={p.ativo ? p.comHistorico + ' de ' + p.todos + ' com histórico' : guardado ? 'só leitura' : null}>
        <div class="v3-tiles-p">
          {guardado ? p.treinos.map(t => (
            <div key={t.k} class="v3-tr">
              <button data-a={'programa-treino-' + t.k} onClick={() => ctx.abreFolha({ k: 'treinoDoPrograma', d: t.k })}>
                <span class="v3-tr-l g">{t.sigla}</span>
                <span class="v3-lin-t"><b>{t.nome}</b><span>{t.n} exercícios · feito {t.vezes}×</span></span>
                {ic.dir}
              </button>
            </div>
          )) : p.treinos.map(t => (
            <div key={t.k} class="v3-tr" data-aberto={t.aberto ? 'true' : 'false'}>
              <button data-a={'programa-treino-' + t.k} aria-expanded={t.aberto ? 'true' : 'false'} onClick={() => ctx.abreTreinoDoPrograma(t.k)}>
                <span class={'v3-tr-l' + (guardado ? ' g' : t.feito ? ' feito' : t.prox ? ' prox' : '')}>{t.sigla}</span>
                <span class="v3-lin-t"><b>{t.nome}</b>
                  <span>{t.n} exercícios · {p.ativo ? (t.novos ? t.novos + (t.novos === 1 ? ' novo' : ' novos') : 'todos com histórico') : 'feito ' + t.vezes + '×'}{t.prox ? ' · o próximo' : ''}</span></span>
                {ic.baixo}
              </button>
              {t.aberto && <div class="v3-exl">
                {t.ex.map((e, j) => {
                  const linha = x => <div class="ex" key={x.id + '-' + j}><span class="v3-lin-t"><b>{x.n}</b><span>{x.apoio}</span></span>
                    {p.ativo && <span class={'v3-selo ' + (x.hist ? 'hist' : 'novo')}>{x.hist ? <>{ic.ok}com histórico</> : 'novo'}</span>}</div>;
                  if (e.par && e.par.lado === 'b') return null;
                  if (!e.par) return linha(e);
                  const y = t.ex[j + 1];
                  return <div class="v3-par-bl" key={'par-' + e.par.n} role="group" aria-label={'Par ' + e.par.n + ', alternando'}>
                    <p class="v3-par-bl-h">{ic.gira}<b>Par {e.par.n}</b><span>alternando · {e.par.descanso} depois do par</span></p>
                    {linha(e)}{y && linha(y)}
                  </div>;
                })}
              </div>}
            </div>
          ))}
        </div>
        {p.ativo && <Apoio>“Com histórico”: a sugestão de carga parte do que você já fez nesse exercício, em qualquer programa.</Apoio>}
        {guardado && <Apoio>Para mudar um programa guardado, reative ou duplique. Assim, o que foi feito nele continua batendo com o que ele prescrevia.</Apoio>}
      </Secao>
      {p.revisoes.length > 0 && <Secao titulo="Revisões" nota="a mais nova primeiro">
        <div>
          {p.revisoes.map(r => (
            <button key={r.i} class="v3-rv" data-a={'programa-revisao-' + r.i} onClick={() => ctx.abreFolha({ k: 'revisaoDoPrograma', i: r.i })}>
              <time>{r.dia}<small>{r.semana}</small></time>
              <span class="v3-lin-t"><b><span class={'v3-quem ' + (r.quem === 'treinador' ? 't' : 'e')}>{r.quem === 'treinador' ? 'treinador' : 'você'}</span>{r.titulo}</b>
                {(r.detalhe || r.texto) && <span>{[r.detalhe, r.texto ? 'o texto colado' : null].filter(Boolean).join(' · ')}</span>}</span>
              {ic.dir}
            </button>
          ))}
        </div>
      </Secao>}
      <Secao>
        {p.ativo ? (
          <div class="v3-saidas">
            {p.dif > 0 && <Saida data-a="programa-diferencas" onClick={() => { ctx.abrePrograma(); ctx.acoesPrograma.modo('diff'); }}>Diferenças do treinador ({p.dif})</Saida>}
            <Saida data-a="programa-editar" onClick={() => ctx.abrePrograma()}>Editar o programa</Saida>
            <Saida data-a="programa-renomear" onClick={() => ctx.abreFolha({ k: 'renomeiaPrograma', id: p.id, nome: p.nome })}>Renomear</Saida>
            <Saida data-a="programa-duplicar" onClick={() => ctx.duplicaPrograma(p.id)}>Duplicar como base</Saida>
          </div>
        ) : (
          <>
            <Acoes>
              <Botao data-a="programa-reativar" onClick={() => ctx.abreFolha({ k: 'reativaPrograma', id: p.id })}>{guardado ? 'Reativar' : 'Começar agora'}</Botao>
              <Botao tipo="contorno" data-a="programa-duplicar" onClick={() => ctx.duplicaPrograma(p.id)}>Duplicar</Botao>
            </Acoes>
            <div class="v3-saidas"><Saida data-a="programa-renomear" onClick={() => ctx.abreFolha({ k: 'renomeiaPrograma', id: p.id, nome: p.nome })}>Renomear</Saida></div>
          </>
        )}
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/** Reativar (ou começar) um programa: o que acontece, antes do toque. */
export function FolhaReativaPrograma({ ctx, f }) {
  const p = ctx.programaAbertoV3();
  if (!p || !p.reativa) return null;
  const r = p.reativa;
  return (
    <Folha titulo={(p.estado === 'guardado' ? 'Reativar o ' : 'Começar o ') + p.nome + '?'} aoFechar={() => ctx.fechaFolha()}>
      {p.bloqueio && <Caixa tom="atencao" data-a="reativa-bloqueio" titulo={p.bloqueio + ' está aberto agora.'}
                            nota="Trocar de programa no meio misturaria as séries de hoje. Encerre o treino e volte aqui." />}
      <ul class="v3-ef">
        <li>{ic.plano}<span>O <b>{r.ativo}</b> vai para “Antes”, com {r.feitos === 1 ? 'o treino feito' : 'os ' + r.feitos + ' treinos feitos'} nele.</span></li>
        {r.primeiro && <li>{ic.troca}<span>A rotação {p.estado === 'guardado' ? 'recomeça' : 'começa'} pelo <b>{r.primeiro}</b>.</span></li>}
        <li>{ic.halter}<span>As cargas vêm do histórico de cada exercício, inclusive o que você fez no {r.ativo}.</span></li>
      </ul>
      <Acoes><Botao data-a="reativa-ok" disabled={!!p.bloqueio} onClick={() => { ctx.fechaFolha(); ctx.ativaPrograma(f.id); }}>{p.estado === 'guardado' ? 'Reativar' : 'Começar agora'}</Botao></Acoes>
      <Saida data-a="reativa-nao" onClick={() => ctx.fechaFolha()}>Agora não</Saida>
    </Folha>
  );
}

export function FolhaRenomeiaPrograma({ ctx, f }) {
  const [nome, setNome] = useState(f.nome);
  const ok = nome.trim().length > 1 && nome.trim() !== f.nome;
  return (
    <Folha titulo="Renomear o programa" sub="O que foi feito nele continua igual. Só o nome muda." aoFechar={() => ctx.fechaFolha()}>
      <input id="renomeia-programa" class="v3-campo" value={nome} onInput={e => setNome(e.currentTarget.value)} aria-label="Nome do programa" />
      <Acoes><Botao data-a="renomeia-programa-ok" disabled={!ok} onClick={() => { ctx.fechaFolha(); ctx.renomeiaPrograma(f.id, nome.trim()); }}>Guardar o nome</Botao></Acoes>
    </Folha>
  );
}

/** Uma revisão do programa: o que mudou, com o motivo; e o texto colado, se houver. */
export function FolhaRevisaoDoPrograma({ ctx, f }) {
  const r = ctx.revisaoDoProgramaV3(f.i);
  if (!r) return null;
  return (
    <Folha titulo={r.titulo} sub={(r.quem === 'treinador' ? 'Do treinador' : 'Sua') + ' · ' + r.quando} aoFechar={() => ctx.fechaFolha()}>
      <div>
        {r.itens.map((x, i) => <div class="v3-mud" key={i}><span class={'v3-mud-s ' + (x.sinal === '+' ? 'mais' : x.sinal === '−' ? 'menos' : '')} aria-hidden="true">{x.sinal}</span>
          <span class="v3-lin-t"><b>{x.txt}</b>{(x.dia || x.motivo) && <span>{[x.dia ? 'no ' + x.dia : null, x.motivo ? 'Motivo: “' + x.motivo + '”' : null].filter(Boolean).join('. ')}</span>}</span></div>)}
      </div>
      {r.fora.length > 0 && <><h3 class="v3-folha-h3">Ficou de fora</h3>
        <div>{r.fora.map((x, i) => <div class="v3-mud" key={i}><span class="v3-mud-s" aria-hidden="true">{x.sinal}</span><span class="v3-lin-t"><b>{x.txt}</b>{x.dia && <span>no {x.dia}</span>}</span></div>)}</div></>}
      {r.texto && <Saida data-a="revisao-ver-texto" onClick={() => { ctx.fechaFolha(); ctx.abreRevisao(r.texto); }}>Ver o texto colado</Saida>}
    </Folha>
  );
}

/** Um treino de um programa guardado: a prescrição como era, só leitura. */
export function FolhaTreinoDoPrograma({ ctx, f }) {
  const p = ctx.programaAbertoV3();
  const t = p && p.treinos.find(x => x.k === f.d);
  if (!t) return null;
  return (
    <Folha titulo={'Treino ' + t.sigla} sub={t.nome + ' · ' + p.nome} aoFechar={() => ctx.fechaFolha()}>
      <div class="v3-exl">
        {t.ex.map(e => <div class="ex" key={e.id}><span class="v3-lin-t"><b>{e.n}</b><span>{e.prescricao}</span></span></div>)}
      </div>
      <Apoio>Feito {t.vezes}× neste programa. Para treinar de novo, reative ou duplique.</Apoio>
    </Folha>
  );
}
