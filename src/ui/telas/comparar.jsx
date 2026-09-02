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
// O peso e a cintura embaixo de cada foto são MÉDIA DA SEMANA e vêm de
// `S.body` — a sessão de fotos não pede número nenhum. O protocolo manda
// fotografar de manhã em jejum, que é o mesmo momento da pesagem: perguntar de
// novo seria perguntar o que o app já sabe.

import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Chips, Procedencia, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

/** Um lado da comparação: a foto, a data e os números daquela semana. */
function Lado({ l, aoAjustar }) {
  return (
    <figure class="cp-lado">
      <FotoAjustada url={l.url} enq={l.enq} alt={l.pose + ' em ' + l.data} vazio={l.aviso} />
      <figcaption>
        <span class="ins-label">{l.data}</span>
        <span class="ins-data cp-num">{l.peso}</span>
        <span class="ins-data cp-num cp-num2">{l.cintura}</span>
        {/* É aqui que o desalinhamento se percebe, então é daqui que se conserta:
            mandar procurar a foto na sessão dela seria mandar sair da tela que
            mostra o problema. */}
        {l.url && <button class="cp-ajustar" onClick={() => aoAjustar(l.d)}>ajustar</button>}
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
              <button class={'ins-chip' + (!c.sobrepor ? ' on' : '')}
                      onClick={() => ctx.setSobrepor(false)}>lado a lado</button>
              <button class={'ins-chip' + (c.sobrepor ? ' on' : '')}
                      onClick={() => ctx.setSobrepor(true)}>sobrepor</button>
            </div>

            {c.sobrepor
              ? (
                <>
                  <div class="cp-onion">
                    <FotoAjustada url={c.de.url} enq={c.de.enq} alt={'Antes: ' + c.de.data} vazio={c.de.aviso} />
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
                  <Lado l={c.de} aoAjustar={d => ctx.abreAjuste(d, c.pose)} />
                  <Lado l={c.ate} aoAjustar={d => ctx.abreAjuste(d, c.pose)} />
                </div>
              )}

            <Procedencia>{c.intervalo}</Procedencia>
            <Procedencia>
              peso e cintura são a média da SEMANA de cada sessão, tirada do
              registro corporal — a sessão de fotos não pede número nenhum.
            </Procedencia>
            {c.notas.map(n => <Procedencia key={n}>{n}</Procedencia>)}
          </>
        )}
    </TelaCheia>
  );
}
