// Endireitar e reenquadrar uma foto já tirada.
//
// A tela existe por causa de uma assimetria: a pose o app controla, a geometria
// da câmera não — ela mora nas marcas de fita no chão, e a fita sai do lugar.
// Quando sai, duas sessões que deviam ser comparáveis passam a diferir pela
// câmera, e é tarde para tirar de novo.
//
// Duas decisões desta tela:
//
// O FANTASMA da sessão anterior por cima é o instrumento de verdade aqui, não
// enfeite. Endireitar contra a borda do quadro conserta o horizonte; alinhar
// contra a foto anterior conserta a COMPARAÇÃO, que é o que se quer. Por isso
// ele já vem ligado quando existe referência.
//
// E não há brilho, contraste nem filtro. Qualquer um dos três mudaria a
// aparência do corpo, e aí a foto passaria a medir a edição em vez do corpo.
// Girar e recortar movem o enquadramento sem tocar no que está dentro dele.

import { useRef } from 'preact/hooks';
import { GIRO_MAX, ZOOM_MAX, zoomMinimo } from '../../dominio/enquadramento';
import { FotoAjustada } from '../instrumento/fotoajustada.jsx';
import { Procedencia, Secao, Vazio } from '../instrumento/primitivos.jsx';
import { TelaCheia } from '../instrumento/telacheia.jsx';

/** Uma linha de controle: rótulo, valor lido e a barra. */
function Controle({ rotulo, valor, min, max, passo, n, onMuda }) {
  return (
    <div class="aj-ctrl">
      <div class="aj-ctrl-t">
        <span class="ins-label">{rotulo}</span>
        <span class="ins-data aj-ctrl-v">{valor}</span>
      </div>
      <input
        type="range" min={min} max={max} step={passo} value={n}
        aria-label={rotulo}
        onInput={e => onMuda(Number(e.currentTarget.value))}
      />
    </div>
  );
}

export function AjusteFoto({ ctx }) {
  const d = ctx.ajusteEmEdicao();
  const arraste = useRef(null);
  if (!d) return null;

  // O arrasto é medido em fração do QUADRO, não em pixels: assim o mesmo gesto
  // move a mesma quantidade de foto no iPhone e na janela do computador.
  function comeca(e) {
    const c = e.currentTarget.getBoundingClientRect();
    arraste.current = { x: e.clientX, y: e.clientY, l: c.width, a: c.height };
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const p = arraste.current;
    if (!p) return;
    ctx.arrastaAjuste((e.clientX - p.x) / p.l, (e.clientY - p.y) / p.a);
    arraste.current = { x: e.clientX, y: e.clientY, l: p.l, a: p.a };
  }
  function solta() { arraste.current = null; }

  const zMin = zoomMinimo(d.enq.r);

  return (
    <TelaCheia
      olho="ajustar" meta={d.data} titulo={d.pose}
      aoVoltar={ctx.fechaAjuste} corpo="hwrap"
      acao={<button class="aj-salvar" onClick={ctx.salvaAjuste}>salvar</button>}
    >
      {/* O quadro. Arrastar aqui move o recorte; o fantasma e a grade ficam por
          cima, sem capturar o toque. */}
      <div
        class="aj-quadro" onPointerDown={comeca} onPointerMove={move}
        onPointerUp={solta} onPointerCancel={solta}
      >
        <FotoAjustada url={d.url} enq={d.enq} alt={'Ajustando ' + d.pose} classe="aj-fa" />
        {d.fantasma && d.refUrl && (
          <FotoAjustada
            url={d.refUrl} enq={d.refEnq} alt={'Sobreposta: ' + d.refTxt}
            classe="aj-fa aj-ghost" estilo="opacity:.45"
          />
        )}
        {d.grade && (
          <div class="aj-grade" aria-hidden="true">
            <i class="aj-v1" /><i class="aj-v2" /><i class="aj-h1" /><i class="aj-h2" />
            <i class="aj-eixo" />
          </div>
        )}
      </div>

      <div class="aj-modos">
        <button
          class={'ins-chip' + (d.grade ? ' on' : '')}
          onClick={() => ctx.setGradeDoAjuste(!d.grade)}
        >grade</button>
        {d.datas.length > 0 && (
          <button
            class={'ins-chip' + (d.fantasma ? ' on' : '')}
            onClick={() => ctx.setFantasmaDoAjuste(!d.fantasma)}
          >sobrepor</button>
        )}
      </div>

      {/* Contra QUAL sessão alinhar é escolha dele, não do app. O padrão é a
          vizinha, que acerta quase sempre; mas quando uma sessão antiga tem a
          geometria boa, é contra ela que se quer alinhar as seguintes — e o
          app não tem como saber qual é essa. */}
      {d.fantasma && d.datas.length > 0 && (
        <div class="aj-fantasma">
          <span class="ins-label">alinhar contra</span>
          <select
            class="ins-input aj-sel" value={d.fantasmaD || ''}
            onChange={e => ctx.setDataDoFantasma(e.currentTarget.value)}
          >
            {d.datas.map(o => <option key={o.d} value={o.d}>{o.txt}</option>)}
          </select>
        </div>
      )}

      <Secao rotulo="ajuste" nota="arraste a foto para reenquadrar">
        <Controle
          rotulo="girar" valor={d.enq.r.toFixed(1).replace('.', ',') + '°'}
          min={-GIRO_MAX} max={GIRO_MAX} passo={0.1} n={d.enq.r} onMuda={ctx.setGiroDoAjuste}
        />
        <Controle
          rotulo="aproximar" valor={Math.round(d.enq.z * 100) + '%'}
          min={zMin} max={ZOOM_MAX} passo={0.01} n={d.enq.z} onMuda={ctx.setZoomDoAjuste}
        />
      </Secao>

      {d.enq.r !== 0 && (
        <Procedencia>
          girar {Math.abs(d.enq.r).toFixed(1).replace('.', ',')}° obriga a aproximar
          {' '}{Math.round((zMin - 1) * 100)}% para não abrir borda vazia — é o preço de endireitar
        </Procedencia>
      )}
      <Procedencia>
        o recorte é DADO, não pixel: os bytes originais ficam intactos no bucket
        e o ajuste pode ser desfeito a qualquer momento
      </Procedencia>

      {d.sujo
        ? <button class="ins-btn-secondary aj-zerar" onClick={ctx.zeraAjuste}>voltar ao original</button>
        : <Vazio>Sem ajuste. A foto está como saiu da câmera.</Vazio>}
    </TelaCheia>
  );
}
