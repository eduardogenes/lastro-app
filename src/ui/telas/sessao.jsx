// O detalhe de uma sessão passada — a terceira entrega da D (`dias.html`,
// estados 3, 4 e 14).
//
// A sessão abre COMO FOI: o começo e o fim, e cada série na ordem em que
// aconteceu, com o RIR quando houve. Corrigir é tocar o número errado: a régua
// de repetições da academia abre ali mesmo, porque o dado é o mesmo, e o toque
// grava. O fim de uma sessão que fechou sozinha aparece como aproximado, com
// "Corrigir" ao lado (F152, F295). O que estava prescrito e não foi feito fica
// "não feito", na posição dele — não é falha nem pendência.
//
// Saíram daqui, pelo desenho: a grade de tempo, volume e recordes e a variação
// de cada exercício contra a vez anterior (são leitura de Semana e do histórico
// do exercício), e o cardio do dia (mora no dia aberto).

import { Procedencia, Vazio } from '../instrumento/primitivos.jsx';
import { Stats, TelaCheia } from '../instrumento/telacheia.jsx';
import { Regua } from '../instrumento/regua.jsx';
import { Teclado } from '../instrumento/teclado.jsx';

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
          Apagar este registro
        </button>
      </TelaCheia>
    );
  }

  return (
    <TelaCheia olho={d.cab.meta} titulo={d.cab.titulo} aoVoltar={ctx.fechaSessao} corpo="hwrap">
      <div class="ss-tempo">
        <div class="ss-tempo-l">
          <span class="ins-body-sm ins-t2 ss-tempo-r">Começo</span>
          <span class="ss-tempo-v">
            <span class="ins-body ins-t1">{d.comeco.hora}</span>
            {d.comeco.nota && <small class="ins-body-xs ins-t3">{d.comeco.nota}</small>}
          </span>
        </div>
        {d.fim && (
          <div class="ss-tempo-l">
            <span class="ins-body-sm ins-t2 ss-tempo-r">Fim</span>
            <span class="ss-tempo-v">
              <span class={'ins-body ins-t1' + (d.fim.aprox ? ' ss-aprox' : '')}>{d.fim.hora}</span>
              <small class="ins-body-xs ins-t3">{d.fim.nota}</small>
            </span>
            {d.corrigivel && (
              <button class="ins-btn-secondary ss-corrige" data-a="sessao-corrige-tempo"
                      aria-expanded={d.corrigindoTempo ? 'true' : 'false'}
                      onClick={() => ctx.abreCorrecaoDoTempo(d.t)}>Corrigir</button>
            )}
          </div>
        )}
        {d.corrigindoTempo && (
          <div class="ss-tempo-c">
            <div class="ins-chips">
              {d.duracoes.map(v => (
                <button key={v.k} class={'ins-chip' + (v.on ? ' on' : '')} aria-pressed={v.on ? 'true' : 'false'}
                        onClick={() => ctx.corrigeDuracao(d.t, v.k)}>{v.t}</button>
              ))}
            </div>
            <Procedencia>
              Hoje está {d.duracaoTxt}. Corrigir torna o tempo declarado, e o "aproximado" some.
            </Procedencia>
          </div>
        )}
      </div>

      {d.exercicios.length === 0
        ? <Vazio>Nenhuma série registrada neste dia. Só a presença.</Vazio>
        : (
          <ul class="ss-lista">
            {d.exercicios.map(x => (
              <li key={x.idEx + (x.chave || '')} class="ss-ex">
                <div class="ss-ex-l">
                  <span class="ss-ex-n">
                    <span class="ins-body ins-t1">{x.nome}</span>
                    <small class="ins-body-xs ins-t3">{x.presc}</small>
                  </span>
                  <span class="ss-series">
                    {x.series.map(sr => sr.nao
                      ? (sr.lanca
                          ? <button key={sr.k} class={'ss-sv nf' + (sr.aberta ? ' on' : '')}
                                    data-a={'serie-' + x.idEx + '-' + sr.k} aria-expanded={sr.aberta ? 'true' : 'false'}
                                    aria-label={'série ' + (sr.k + 1) + ': não feita. Tocar lança, se você fez.'}
                                    onClick={() => ctx.abreSerieDaPassada(x.idEx, x.chave, sr.k)}>não feito</button>
                          : <span key={sr.k} class="ss-sv nf">não feito</span>)
                      : (
                        <button key={sr.k} class={'ss-sv' + (sr.aberta ? ' on' : '')} disabled={!sr.editavel}
                                data-a={'serie-' + x.idEx + '-' + sr.k} aria-expanded={sr.aberta ? 'true' : 'false'}
                                aria-label={'série ' + (sr.k + 1) + ': ' + sr.texto + (sr.rir ? ', ' + sr.rir : '') + (sr.editavel ? '. Tocar corrige.' : '')}
                                onClick={() => ctx.abreSerieDaPassada(x.idEx, x.chave, sr.k)}>
                          {sr.texto}
                          <small>{sr.rir || '\u00a0'}</small>
                        </button>
                      ))}
                  </span>
                </div>
                {x.nota && <p class="ins-body-xs ins-t3 ss-ex-nota">{x.nota}</p>}
                {x.editor && <Editor e={x.editor} ctx={ctx} />}
              </li>
            ))}
          </ul>
        )}

      {d.notas.length > 0 && <p class="ins-body-sm ins-t3 tc-nota">{d.notas.join(' ')}</p>}

      {d.mods && (
        <div class="tc-bloco">
          <div class="ins-body-sm ins-t2">
            {d.mods.length === 1 ? 'A mudança do dia' : 'As ' + d.mods.length + ' mudanças do dia'}
          </div>
          <p class="ins-body-sm ins-t2">{d.mods.join(' · ')}</p>
        </div>
      )}

      <button class="ins-btn-secondary ins-btn-destructive tc-rm" data-a="sessao-apaga"
              onClick={() => ctx.editaSessao(d.t)}>
        Apagar este treino
      </button>
    </TelaCheia>
  );
}

/** A série aberta: carga, régua de repetições, RIR e o apagar. Cada toque grava. */
function Editor({ e, ctx }) {
  return (
    <div class="ss-ed">
      <div class="ss-ed-h">
        <span class="ins-body-sm ins-t2"><b>{e.titulo}</b> · {e.guardada}</span>
        <button class="ss-carga" data-a="sessao-carga" aria-label={'carga: ' + e.carga + ' ' + e.un + '. Tocar abre o teclado.'}
                onClick={() => ctx.abreCargaDaPassada()}>
          {e.carga}<span>{e.un}</span>
        </button>
      </div>
      {e.teclado && (
        <Teclado texto={e.teclado.texto} decimal unidade={e.teclado.unidade}
                 rotulo={'digitar a carga da ' + e.titulo.toLowerCase()}
                 aoTeclar={t => ctx.tecla(t)} aoFechar={() => ctx.fechaTeclado()} />
      )}
      <p class="ins-body-xs ins-t3 ss-ed-faixa">{e.faixa}</p>
      <Regua slots={e.regua.slots} valor={e.regua.valor} marca={e.regua.marca} tocado={e.regua.tocado}
             rotulo="Repetições · um toque corrige"
             aoEscolher={v => ctx.repsDaPassada(v)} aoAndar={dir => ctx.andaReguaDaPassada(dir)} />
      {e.gravado && <p class="ins-body-sm ins-t2 ss-ed-ok" role="status">{e.gravado}</p>}
      {e.falhou && (
        <div class="ss-ed-falhou" role="alert">
          <p class="ins-body-sm">{e.falhou}</p>
          <button class="ins-btn-secondary" data-a="sessao-tenta" onClick={() => ctx.repsDaPassada(e.regua.tocado)}>
            Tentar de novo
          </button>
        </div>
      )}
      {e.rir && <div class="ss-ed-pe">
        <button class="ss-lk" data-a="sessao-rir" aria-expanded={e.rir.aberto ? 'true' : 'false'}
                onClick={() => ctx.rirDaPassada('abre')}>{e.rir.texto}</button>
        <button class="ss-lk dn" data-a="sessao-apaga-serie" onClick={() => ctx.apagaSerieDaPassada()}>
          Apagar esta série
        </button>
      </div>}
      {e.rir && e.rir.aberto && (
        <div class="ins-chips ss-rir">
          {e.rir.escala.map(r => (
            <button key={r.v} class={'ins-chip' + (r.on ? ' on' : '')} aria-pressed={r.on ? 'true' : 'false'}
                    data-a={'sessao-rir-' + r.v} onClick={() => ctx.rirDaPassada(r.v)}>{'RIR ' + r.v}</button>
          ))}
          <button class="ins-chip" data-a="sessao-rir-nenhum" onClick={() => ctx.rirDaPassada(null)}>nenhum</button>
        </div>
      )}
    </div>
  );
}
