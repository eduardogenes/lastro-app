// A PROGRESSÃO e UM EXERCÍCIO no visual novo (Fase 3). Protótipo:
// docs/redesign-3/prototipos/treino.html ("progressão" e "exercício"). Dados:
// `ctx.progressaoV3` e `ctx.exercicioV3`, em src/main.jsx; a regra que agrupa
// é `estadoDaProgressao`, em src/dominio/progressao.ts.

import { useState } from 'preact/hooks';
import { Acoes, Apoio, Botao, Cabecalho, Folha, Linha, Saida, Secao, Seletor, Vazio } from '../base.jsx';
import { Grafico } from '../grafico.jsx';

const GRUPOS = [
  { k: 'subir', t: 'Prontos para subir', nota: 'bateram o topo da faixa em todas as séries' },
  { k: 'rep', t: 'Ganhando repetição', nota: 'ainda dentro da faixa' },
  { k: 'parado', t: 'Parados', nota: 'mesma carga e repetições há 3 sessões' }
];

function Mini({ serie }) {
  if (!serie || serie.length < 2) return null;
  const mn = Math.min(...serie), mx = Math.max(...serie), n = serie.length;
  const d = serie.map((y, i) => (i ? 'L' : 'M') + (i / (n - 1) * 64).toFixed(1) + ' ' + (30 - (mx === mn ? 0.5 : (y - mn) / (mx - mn)) * 30).toFixed(1)).join('');
  return <svg class="v3-mini v3-mini-l" viewBox="-3 -3 70 36" preserveAspectRatio="none" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>;
}

export function Progressao({ ctx }) {
  const p = ctx.progressaoV3();
  if (!p) return null;
  const vazio = !p.grupos.subir.length && !p.grupos.rep.length && !p.grupos.parado.length;
  return (
    <>
      <Cabecalho titulo="Progressão" nota={'Treino ' + p.dia} aoVoltar={ctx.fechaProgressao} />
      {p.dias.length > 1 && (
        <div class="v3-pad">
          <Seletor rotulo="Treino" valor={p.dia} aoMudar={ctx.setDiaDaProgressao} opcoes={p.dias.map(d => ({ k: d, t: d }))} />
        </div>
      )}
      {vazio && <div class="v3-pad"><Vazio titulo="Ainda sem histórico"><p>Depois do primeiro treino {p.dia}, cada exercício aparece aqui no grupo dele.</p></Vazio></div>}
      {GRUPOS.map(g => p.grupos[g.k].length > 0 && (
        <Secao key={g.k} titulo={g.t} nota={g.nota}>
          <div>
            {p.grupos[g.k].map(x => (
              <Linha key={x.i} titulo={x.n} apoio={x.reps + ' na última'} valor={x.carga} unidade={x.unidade}
                     data-a={'prog-ex-' + x.i} aoTocar={() => ctx.abreExercicioV3(p.dia, x.i)} />
            ))}
          </div>
        </Secao>
      ))}
      <Secao><Apoio>A regra é a do treinador: primeiro ganhar repetição até o topo da faixa em todas as séries, depois subir a carga.</Apoio></Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

export function ExercicioV3({ ctx }) {
  const e = ctx.exercicioV3();
  if (!e) return null;
  const de = e.linha.length ? e.linha[0].t : 0, ate = e.linha.length ? e.linha[e.linha.length - 1].t : 1;
  return (
    <>
      <Cabecalho titulo={e.n} nota={e.prescricao} aoVoltar={ctx.fechaHist} />
      <div class="v3-pad">
        {e.atual
          ? <div class="v3-gigante v3-n v3-gigante-m">{e.atual}<small>{e.unidade}{e.desde ? ' · ' + e.desde : ''}</small></div>
          : <Vazio titulo="Ainda sem histórico"><p>A primeira sessão deste exercício aparece aqui.</p></Vazio>}
        {e.passo && (
          <div class={'v3-passo ' + e.passo.tom} data-a="ex-passo"><b>{e.passo.t}</b><span>{e.passo.d}</span></div>
        )}
        {e.linha.length > 1 && <Grafico linha={e.linha} de={de} ate={ate} altura={90} bolas rotulo={'Carga por sessão: ' + e.n} />}
      </div>
      {e.sessoes.length > 0 && (
        <Secao titulo="Sessão a sessão" nota={'em destaque, a série que bateu o topo (' + e.topo + ')'}>
          <div>
            {e.sessoes.map(s => {
              const dentro = <>
                <span class="v3-n">{s.data}{s.dp ? <small> · posta em dia</small> : null}</span>
                <div>{s.reps.map((r, j) => <i key={j} class={'v3-n' + (r.topo ? ' t' : '')}>{r.r}</i>)}</div>
                <b class="v3-n">{s.carga} {e.unidade}</b>
              </>;
              // a sessão abre inteira, e é lá que cada série se corrige
              return s.sessao != null
                ? <button key={s.t} class="v3-sess" data-a="ex-sessao" aria-label={'Sessão de ' + s.data + ': abrir para ver ou corrigir'}
                          onClick={() => ctx.abreSessaoDoHistorico(s.sessao, s.sid)}>{dentro}</button>
                : <div key={s.t} class="v3-sess">{dentro}</div>;
            })}
          </div>
          <Apoio>Digitou um número errado? Toque na sessão para corrigir a série.</Apoio>
        </Secao>
      )}
      <Secao>
        <div>
          {e.temFoto && e.foto && <img class="v3-ex-foto" src={e.foto} alt={'Foto do aparelho: ' + e.n} />}
          <Linha titulo={e.temFoto ? 'A foto do aparelho' : 'Fotografar o aparelho'} apoio={e.temFoto ? 'trocar ou apagar' : 'para achar e regular a máquina da próxima vez'}
                 data-a="ex-foto" aoTocar={() => ctx.abreFotoDoAparelhoV3(e.id)} />
          <Linha titulo="Trocar o nome" apoio="o histórico continua neste exercício" data-a="ex-renomeia"
                 aoTocar={() => ctx.abreFolha({ k: 'renomeiaEx', id: e.id, nome: e.renome.nome, doCodigo: e.renome.doCodigo })} />
        </div>
      </Secao>
      <div class="v3-fim-curto" />
    </>
  );
}

/** Trocar o nome do exercício: o histórico continua nele. */
export function FolhaRenomeiaEx({ ctx, f }) {
  const [nome, setNome] = useState(f.nome);
  const ok = nome.trim().length > 0 && nome.trim() !== f.nome;
  return (
    <Folha titulo="Trocar o nome" sub="O histórico continua neste exercício. Só o nome que aparece muda." aoFechar={() => ctx.fechaFolha()}>
      <input id="renomeia-ex" class="v3-campo" value={nome} onInput={e => setNome(e.currentTarget.value)} aria-label="Nome do exercício" />
      <Acoes><Botao data-a="renomeia-ok" disabled={!ok} onClick={() => { ctx.renomeiaExercicio(f.id, nome.trim()); ctx.fechaFolha(); }}>Guardar o nome</Botao></Acoes>
      {f.doCodigo && <Saida onClick={() => { ctx.renomeiaExercicio(f.id, f.doCodigo); ctx.fechaFolha(); }}>Voltar ao nome do treinador: {f.doCodigo}</Saida>}
    </Folha>
  );
}

// assume a camada `hist` quando aberta pelo visual novo (`view.hist.v3`); a
// correção de uma sessão passada abre a sessão por cima (`abreSessaoDoHistorico`)
ExercicioV3.so = view => !!(view.hist && view.hist.v3);

/**
 * A FOTO DO APARELHO: a imagem (ou o que diz que ela não está aqui), a dica do
 * treinador, e fotografar, trocar ou apagar. `capture` abre a câmera no celular
 * e vira seletor de arquivo no computador.
 */
export function FolhaFotoV3({ ctx, f }) {
  const x = ctx.foto(f.id);
  if (!x) return null;
  return (
    <Folha titulo={x.nome} sub="O aparelho" aoFechar={() => ctx.fechaFolha()}>
      {x.url
        ? <img class="v3-ex-foto" src={x.url} alt={'Aparelho: ' + x.nome} />
        : <Apoio>{x.tem ? 'A foto desta máquina ainda não chegou a este aparelho.' : 'Nenhuma foto desta máquina ainda.'}</Apoio>}
      {x.cue && <p class="v3-pare-t v3-cue">{x.cue}</p>}
      <Acoes>
        <label class="v3-btn p cheio v3-arquivo" data-a="foto-tira">
          {x.tem ? 'Trocar a foto' : 'Fotografar o aparelho'}
          <input type="file" accept="image/*" capture="environment" hidden onChange={e => ctx.tiraFoto(e.currentTarget)} />
        </label>
      </Acoes>
      {x.tem && <Saida data-a="foto-apaga" onClick={ctx.apagaFoto}>Apagar a foto</Saida>}
    </Folha>
  );
}
