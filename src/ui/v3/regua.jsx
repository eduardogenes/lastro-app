// A RÉGUA: o número se arrasta, não se digita.
//
// É uma fita de marcas que rola na horizontal e encaixa em cada passo; o valor
// é o passo que está sob o ponteiro do centro. Para quem não arrasta, há os
// botões de passo embaixo e as setas do teclado: a régua é um `slider`.

import { useEffect, useRef } from 'preact/hooks';

const arred = v => Math.round(v * 1000) / 1000;
const txt = v => String(v).replace('.', ',');

/**
 * @param {object} p
 * @param {number} p.min
 * @param {number} p.max
 * @param {number} p.passo      quanto vale cada marca
 * @param {number} p.valor
 * @param {number} p.cada       de quanto em quanto a marca é grande e numerada
 * @param {number} [p.largura]  pixels entre duas marcas (14 por padrão)
 * @param {(v: number) => void} p.aoMudar  chamado enquanto arrasta
 * @param {string} p.rotulo     nome acessível ("carga em kg")
 */
export function Regua({ min, max, passo, valor, cada, largura = 14, aoMudar, rotulo }) {
  const el = useRef(null);
  const ultimo = useRef(valor);
  const n = Math.round((max - min) / passo);

  // Põe a fita no valor quando ele muda POR FORA (outra série, outro campo).
  // Enquanto o dedo arrasta, o valor que volta é o que a própria fita mandou,
  // e mexer na rolagem aí brigaria com o dedo.
  useEffect(() => {
    const r = el.current;
    if (!r) return;
    if (arred(valor) !== arred(ultimo.current) || r.dataset.pronta !== '1') {
      r.scrollLeft = (valor - min) / passo * largura;
      ultimo.current = valor;
      r.dataset.pronta = '1';
    }
  }, [valor, min, passo, largura]);

  const aoRolar = () => {
    const r = el.current;
    const v = arred(min + Math.max(0, Math.min(n, Math.round(r.scrollLeft / largura))) * passo);
    if (v !== arred(ultimo.current)) { ultimo.current = v; aoMudar(v); }
  };
  const anda = d => {
    const v = arred(Math.max(min, Math.min(max, ultimo.current + d * passo)));
    ultimo.current = v;
    if (el.current) el.current.scrollLeft = (v - min) / passo * largura;
    aoMudar(v);
  };
  const aoTeclar = e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); anda(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); anda(-1); }
  };

  const marcas = [];
  for (let i = 0; i <= n; i++) {
    const v = arred(min + i * passo);
    const grande = Math.abs(v / cada - Math.round(v / cada)) < 1e-6;
    marcas.push(<i key={i} class={grande ? 'g' : undefined} data-r={grande ? txt(v) : undefined} />);
  }

  return (
    <div>
      <div class="v3-regua" style={`--v3-passo:${largura}px`}>
        <div class="v3-regua-r" ref={el} onScroll={aoRolar} onKeyDown={aoTeclar}
             role="slider" tabindex="0" aria-label={rotulo}
             aria-valuemin={min} aria-valuemax={max} aria-valuenow={valor} aria-valuetext={txt(valor)}>
          <div class="v3-regua-f">{marcas}</div>
        </div>
      </div>
      <div class="v3-regua-p">
        <button onClick={() => anda(-1)} aria-label={`Menos ${txt(passo)}`}>−</button>
        <button onClick={() => anda(1)} aria-label={`Mais ${txt(passo)}`}>+</button>
      </div>
    </div>
  );
}
