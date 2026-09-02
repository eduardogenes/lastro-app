// A foto de acompanhamento, com o ajuste aplicado.
//
// TODA foto do protocolo passa por aqui: a de hoje, a referência da captura, os
// dois lados da comparação e as duas camadas da sobreposição. Isso não é
// arrumação — é o requisito. Se dois lugares aplicassem o recorte por conta
// própria, uma divergência entre eles apareceria na tela como uma diferença no
// corpo que não existe, que é exatamente o erro que o protocolo inteiro existe
// para não cometer.
//
// O ajuste é desenhado por `transform`, nunca gravado no pixel: os bytes no
// cache e no bucket continuam sendo os que saíram da câmera.

import { transform } from '../../dominio/enquadramento';

/**
 * @param url    endereço de objeto dos bytes; null enquanto não chegaram
 * @param enq    o enquadramento, ou null para a foto como ela saiu
 * @param vazio  o que dizer quando não há o que desenhar
 */
export function FotoAjustada({ url, enq, alt, classe, vazio, estilo }) {
  if (!url) {
    return (
      <div class={'fa fa-vazio ' + (classe || '')} style={estilo}>
        <span class="ins-body-sm ins-t5">{vazio || 'sem foto'}</span>
      </div>
    );
  }
  return (
    <div class={'fa ' + (classe || '')} style={estilo}>
      <img class="fa-img" src={url} alt={alt} style={'transform:' + transform(enq)} />
    </div>
  );
}
