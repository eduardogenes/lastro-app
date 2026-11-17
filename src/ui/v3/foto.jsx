// A foto do corpo no visual novo, com o ajuste aplicado.
//
// Toda foto do protocolo passa pelo mesmo `transform` do enquadramento
// (`src/dominio/enquadramento.ts`), como no visual antigo: se dois lugares
// recortassem cada um do seu jeito, a diferença apareceria como uma mudança no
// corpo que não existe. O ajuste é desenhado, nunca gravado no pixel.

import { transform } from '../../dominio/enquadramento';

/**
 * `url` nula: os bytes ainda não chegaram (ou não há foto); aparece o quadro
 * vazio com `vazio`. `marca` põe o ponto laranja da foto fora do padrão.
 */
export function Foto({ url, enq, alt, vazio, marca, classe }) {
  return (
    <span class={'v3-foto' + (classe ? ' ' + classe : '')}>
      {url
        ? <img src={url} alt={alt || ''} style={'transform:' + transform(enq)} />
        : <small>{vazio || 'sem foto'}</small>}
      {marca && <i class="v3-foto-m" title="fora do padrão" />}
    </span>
  );
}
