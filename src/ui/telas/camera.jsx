// A câmera de dentro do app, com a foto anterior por cima do quadro vivo.
//
// É a diferença entre corrigir e prevenir. Ajustar depois conserta o
// enquadramento dentro do que a foto pegou; alinhar ANTES do disparo conserta a
// foto. Nenhum recorte devolve o pé que saiu do quadro.
//
// Duas coisas fazem esta tela funcionar de verdade, e as duas são consequência
// de ele estar sozinho a três metros do celular:
//
// O TEMPORIZADOR não é conveniência. A três metros ninguém alcança o botão, e
// sem contagem esta tela seria bonita e inútil — a câmera do sistema, que tem
// temporizador, continuaria sendo a única saída.
//
// E a sessão CONTINUA aqui dentro. Depois do disparo ela avança para a próxima
// pose sem fechar a câmera: são nove fotos, e sair e voltar nove vezes seria
// pior que o problema que a tela resolve.

import { useEffect, useRef } from 'preact/hooks';
import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

const TEMPOS = [0, 3, 10];

export function Camera({ ctx }) {
  const d = ctx.cameraViva();
  const video = useRef(null);

  // O stream é preso ao <video> depois da montagem, e não por atributo: ele é
  // um objeto vivo, não uma URL, e o Preact não tem como escrevê-lo no JSX.
  useEffect(function () {
    const v = video.current;
    const s = ctx.streamDaCamera();
    if (!v || !s) return;
    try { if (v.srcObject !== s) v.srcObject = s; } catch (e) {}
    // `play()` devolve promessa que rejeita quando o gesto ainda não veio; não
    // é erro que interesse a ninguém, e deixá-la solta suja o console
    try { const p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  });

  if (!d) return null;

  if (d.erro) {
    return (
      <TelaCheia olho="câmera" meta={d.data} titulo={d.pose}
                 aoVoltar={ctx.fechaCamera} corpo="hwrap">
        <Vazio>{d.erro}</Vazio>
        <Procedencia>
          a câmera do sistema continua servindo — ela dá a melhor qualidade que o
          aparelho sabe produzir, só não deixa sobrepor a foto anterior
        </Procedencia>
        <button class="ins-btn-secondary cam-sair" onClick={ctx.fechaCamera}>voltar à pose</button>
      </TelaCheia>
    );
  }

  return (
    <TelaCheia
      olho={'pose ' + d.indice + ' de ' + d.total} meta={d.data} titulo={d.pose}
      aoVoltar={ctx.fechaCamera} corpo="hwrap"
    >
      <div class="cam-quadro">
        <video ref={video} class="cam-video" autoplay playsinline muted />

        {d.fantasma && d.refUrl && (
          <FotoAjustada
            url={d.refUrl} enq={d.refEnq} alt={'Sobreposta: ' + d.refTxt}
            classe="cam-ghost" estilo={'opacity:' + (d.opacidade / 100)}
          />
        )}

        {d.grade && (
          <div class="aj-grade" aria-hidden="true">
            <i class="aj-v1" /><i class="aj-v2" /><i class="aj-h1" /><i class="aj-h2" />
            <i class="aj-eixo" />
          </div>
        )}

        {/* A contagem cobre o quadro porque a três metros é a única coisa que
            ele precisa enxergar daqui. */}
        {d.contagem != null && (
          <div class="cam-contagem" role="status" aria-live="assertive">
            <span>{d.contagem || '·'}</span>
          </div>
        )}
      </div>

      <div class="aj-modos">
        <button class={'ins-chip' + (d.grade ? ' on' : '')}
                onClick={() => ctx.setGradeDaCamera(!d.grade)}>grade</button>
        {d.datas.length > 0 && (
          <button class={'ins-chip' + (d.fantasma ? ' on' : '')}
                  onClick={() => ctx.setFantasmaDaCamera(!d.fantasma)}>sobrepor</button>
        )}
      </div>

      {d.fantasma && d.datas.length > 0 && (
        <>
          <div class="aj-fantasma">
            <span class="ins-label">alinhar contra</span>
            <select class="ins-input aj-sel" value={d.fantasmaD || ''}
                    onChange={e => ctx.setDataDoFantasmaDaCamera(e.currentTarget.value)}>
              {d.datas.map(o => <option key={o.d} value={o.d}>{o.txt}</option>)}
            </select>
          </div>
          <div class="cam-op">
            <span class="ins-label">mistura</span>
            <input type="range" min="10" max="90" value={d.opacidade}
                   aria-label="opacidade da foto sobreposta"
                   onInput={e => ctx.setOpacidadeDaCamera(Number(e.currentTarget.value))} />
          </div>
        </>
      )}

      <Secao rotulo="temporizador" nota="a três metros ninguém alcança o botão">
        <div class="cam-tempos">
          {TEMPOS.map(t => (
            <button key={t} class={'ins-chip' + (d.timer === t ? ' on' : '')}
                    onClick={() => ctx.setTimerDaCamera(t)}>
              {t === 0 ? 'sem' : t + 's'}
            </button>
          ))}
        </div>
      </Secao>

      {d.contagem != null
        ? <button class="ins-btn-secondary cam-disparo" onClick={ctx.cancelaDisparo}>cancelar</button>
        : (
          <button class="ins-btn-primary cam-disparo" disabled={!d.pronta}
                  onClick={ctx.disparaCamera}>
            {d.pronta ? (d.feita ? 'refazer esta pose' : 'tirar a foto') : 'abrindo a câmera…'}
          </button>
        )}

      <Procedencia>
        posicione o celular até a sala coincidir com a sobreposta — é o
        enquadramento que se está acertando aqui, não a pose
      </Procedencia>
      <Procedencia>
        o quadro vivo tem menos resolução que a câmera do sistema. Vale pela
        consistência: nenhum recorte depois devolve o pé que saiu do quadro
      </Procedencia>
    </TelaCheia>
  );
}
