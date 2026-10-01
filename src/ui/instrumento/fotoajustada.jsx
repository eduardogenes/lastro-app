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
export function FotoAjustada({ url, enq, alt, classe, vazio, estilo, aoTentar }) {
  if (!url) {
    return (
      <div class={'fa fa-vazio ' + (classe || '')} style={estilo}>
        {/* Nível 3 pelo mesmo motivo do `Vazio`: aqui está a única frase do
            quadro — "buscando a foto…", "sem foto nesta pose" —, e o nível 5
            reprova em AA. */}
        <span class="ins-body-sm ins-t3">{vazio || 'sem foto'}</span>
        {/* A recuperação mora no quadro que falhou, e não num canto da tela:
            é aqui que se percebe que a foto não veio. Quem decide se existe
            o que tentar é quem sabe o motivo — sem conta na nuvem, tentar de
            novo daria na mesma. */}
        {aoTentar && <button class="fa-retomar" onClick={aoTentar}>tentar de novo</button>}
      </div>
    );
  }
  return (
    <div class={'fa ' + (classe || '')} style={estilo}>
      <img class="fa-img" src={url} alt={alt} style={'transform:' + transform(enq)} />
    </div>
  );
}
