// Comparar duas sessões na mesma pose.
//
// É aqui que a foto vira dado. Sem esta tela o app seria um álbum, e a evolução
// continuaria sendo lida abrindo arquivos no computador — que é exatamente o
// trabalho que isto existe para eliminar.
//
// Duas decisões que valem registrar:
//
// O par padrão é a mais nova contra a MAIS ANTIGA, nunca contra a anterior.
// Entre duas sessões seguidas a diferença é quase toda água, sono e horário, e é
// assim que se desiste de um plano que estava funcionando.
//
// A pergunta de gordura visual mora aqui, e não numa tela de fechamento
// semanal, porque é aqui que a resposta está à vista. Ela só aparece quando o
// par cobre mais ou menos duas semanas: num par de três meses seria outra
// pergunta, e a régua calórica leria a resposta como se fosse esta. Substituiu
// a cintura como segunda camada de confirmação — medir parou de acontecer.
//
// O peso e a cintura embaixo de cada foto são MÉDIA DA SEMANA e vêm de
// `S.body` — a sessão de fotos não pede número nenhum: perguntar de novo seria
// perguntar o que o app já sabe. A hora de cada foto aparece ao lado da data
// (decisão do dono, 14/10: ele tira a maioria à noite).

import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Chips, Procedencia, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

/** Um lado da comparação: a foto, a data e os números daquela semana. */
function Lado({ l, aoAjustar, aoTentar }) {
  return (
    <figure class="cp-lado">
      <FotoAjustada url={l.url} enq={l.enq} alt={l.pose + ' em ' + l.data} vazio={l.aviso}
                    aoTentar={l.retomar ? () => aoTentar(l.d) : null} />
      <figcaption>
        <span class="ins-label">{l.data}{l.hora ? ' · ' + l.hora : ''}</span>
        <span class="ins-data cp-num">{l.peso}</span>
        <span class="ins-data cp-num cp-num2">{l.cintura}</span>
        {/* É aqui que o desalinhamento se percebe, então é daqui que se conserta:
            mandar procurar a foto na sessão dela seria mandar sair da tela que
            mostra o problema. */}
        {l.url && <button class="cp-ajustar" onClick={() => aoAjustar(l.d)}>Ajustar</button>}
      </figcaption>
    </figure>
  );
}

export function Comparar({ ctx }) {
  const c = ctx.comparacao();

  return (
    <TelaCheia olho="acompanhamento" meta={c.meta} titulo="Comparar"
               aoVoltar={ctx.fechaComparar} corpo="hwrap">

      <Chips opcoes={c.poses} valor={c.pose} onMuda={ctx.setPoseComparada} />

      {!c.par
        ? <Vazio>{c.vazio}</Vazio>
        : (
          <>
            <div class="cp-datas">
              <select class="ins-input cp-sel" value={c.de.d}
                      onChange={e => ctx.setDataComparada('de', e.currentTarget.value)}>
                {c.datas.map(d => <option key={d.d} value={d.d}>{d.txt}</option>)}
              </select>
              <span class="ins-label cp-ate">até</span>
              <select class="ins-input cp-sel" value={c.ate.d}
                      onChange={e => ctx.setDataComparada('ate', e.currentTarget.value)}>
                {c.datas.map(d => <option key={d.d} value={d.d}>{d.txt}</option>)}
              </select>
            </div>

            {/* Sobrepor é o que revela DESVIO DE ENQUADRAMENTO — se os pés
                andaram, as duas silhuetas não se encaixam, e aí a diferença que
                se vê no corpo é da câmera. Lado a lado é para ler o corpo;
                sobrepor é para desconfiar da foto. */}
            <div class="cp-modo">
              <button class={'ins-chip' + (!c.sobrepor && !c.cortina ? ' on' : '')}
                      onClick={() => { ctx.setSobrepor(false); ctx.setCortina(false); }}>lado a lado</button>
              <button class={'ins-chip' + (c.cortina ? ' on' : '')} data-a="modo-cortina"
                      onClick={() => ctx.setCortina(true)}>cortina</button>
              <button class={'ins-chip' + (c.sobrepor ? ' on' : '')}
                      onClick={() => ctx.setSobrepor(true)}>sobrepor</button>
            </div>

            {/* A CORTINA (o desenho, estado 2): a foto nova por cima, recortada
                a partir da divisa; o dedo anda a divisa. */}
            {c.cortina && (
              <>
                <div class="cp-onion cp-cortina">
                  <FotoAjustada url={c.de.url} enq={c.de.enq} alt={'Antes: ' + c.de.data}
                                vazio={c.de.aviso}
                                aoTentar={c.de.retomar ? () => ctx.tentaFotos(c.de.d) : null} />
                  {c.ate.url && (
                    <FotoAjustada url={c.ate.url} enq={c.ate.enq} alt={'Depois: ' + c.ate.data}
                                  classe="cp-cima" estilo={'clip-path: inset(0 0 0 ' + c.corte + '%)'} />
                  )}
                  <i class="cp-divisa" style={'left:' + c.corte + '%'} aria-hidden="true" />
                  <span class="cp-lado-r cp-lado-e">{c.de.data}{c.de.hora ? ' · ' + c.de.hora : ''}</span>
                  <span class="cp-lado-r cp-lado-d">{c.ate.data}{c.ate.hora ? ' · ' + c.ate.hora : ''}</span>
                </div>
                <input class="cp-corte" type="range" min="0" max="100" value={c.corte}
                       aria-label={'a divisa entre ' + c.de.data + ' e ' + c.ate.data}
                       data-a="cortina-divisa"
                       onInput={e => ctx.setCorte(Number(e.currentTarget.value))} />
              </>
            )}

            {c.cortina ? null : c.sobrepor
              ? (
                <>
                  <div class="cp-onion">
                    <FotoAjustada url={c.de.url} enq={c.de.enq} alt={'Antes: ' + c.de.data}
                                  vazio={c.de.aviso}
                                  aoTentar={c.de.retomar ? () => ctx.tentaFotos(c.de.d) : null} />
                    {c.ate.url && (
                      <FotoAjustada
                        url={c.ate.url} enq={c.ate.enq} alt={'Depois: ' + c.ate.data}
                        classe="cp-cima" estilo={'opacity:' + (c.opacidade / 100)}
                      />
                    )}
                  </div>
                  <div class="cp-slider">
                    <span class="ins-label">{c.de.data}</span>
                    <input type="range" min="0" max="100" value={c.opacidade}
                           aria-label="mistura entre as duas datas"
                           onInput={e => ctx.setOpacidade(Number(e.currentTarget.value))} />
                    <span class="ins-label">{c.ate.data}</span>
                  </div>
                </>
              )
              : (
                <div class="cp-par">
                  <Lado l={c.de} aoAjustar={d => ctx.abreAjuste(d, c.pose)}
                        aoTentar={ctx.tentaFotos} />
                  <Lado l={c.ate} aoAjustar={d => ctx.abreAjuste(d, c.pose)}
                        aoTentar={ctx.tentaFotos} />
                </div>
              )}

            {/* A pergunta do nutricionista, feita aqui e não numa tela de
                fechamento: a resposta está na tela, logo acima. Ela é a
                segunda camada de confirmação que substituiu a cintura —
                medir circunferência parou de acontecer. */}
            {c.pergunta && (
              <div class="cp-gordura">
                <div class="ins-label obs-h">{c.pergunta.t}</div>
                <Chips opcoes={c.pergunta.opcoes} valor={c.pergunta.valor}
                       onMuda={ctx.setGordura} />
                <Procedencia>{c.pergunta.nota}</Procedencia>
              </div>
            )}

            <Procedencia>{c.intervalo}</Procedencia>
            {c.longo && (
              <Procedencia>
                Comparar com a sessão anterior engana: em duas semanas a diferença
                é quase toda água e sono. Por isso o par que abre é o mais longo.
              </Procedencia>
            )}
            {/* O par curto que ele escolheu: a tela avisa e não impede (a D,
                estado 3). Avisar e obedecer é diferente de bloquear. */}
            {c.curto && (
              <div class="cp-curto" role="status">
                <b class="ins-body ins-t1">{c.curto.titulo}</b>
                <p class="ins-body-sm ins-t2">{c.curto.texto}</p>
                <button class="ins-btn-secondary" data-a="par-longo" onClick={ctx.voltaAoParLongo}>{c.curto.voltar}</button>
                <p class="ins-body-xs ins-t3">{c.curto.pares}</p>
              </div>
            )}
            {/* O par que recuou sozinho diz que recuou (a D, estado 7). */}
            {c.recuou && (
              <div class="cp-recuou">
                <b class="ins-body ins-t1">{c.recuou.titulo}</b>
                <p class="ins-body-sm ins-t2">{c.recuou.texto}</p>
              </div>
            )}
            <Procedencia>
              peso e cintura são a média da semana de cada sessão, tirada do
              registro corporal — a sessão de fotos não pede número nenhum.
            </Procedencia>
            {c.notas.map(n => <Procedencia key={n}>{n}</Procedencia>)}
          </>
        )}
    </TelaCheia>
  );
}
