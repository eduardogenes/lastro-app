// O tempo fora dos atalhos continua com o valor guardado até o primeiro passo.
import { useState } from 'preact/hooks';
import { Fichas } from './base.jsx';

export function Contador({ valor, nome, prefixo, menos, mais }) {
  return <span class="v3-reg-contador">
    <button type="button" aria-label={'Diminuir ' + nome} data-a={prefixo + 'menos'} disabled={!menos} onClick={menos}>−</button>
    <output aria-label={nome} aria-live="polite">{valor}</output>
    <button type="button" aria-label={'Aumentar ' + nome} data-a={prefixo + 'mais'} disabled={!mais} onClick={mais}>+</button>
  </span>;
}

export function CamposDoCardio({ campos, prefixo, aoTocar }) {
  const [abriuOutro, setOutro] = useState(false);
  const outro = abriuOutro || !campos.minutos.some(o => o.on);
  const opcoes = campos.minutos.map(o => ({ ...o, on: !outro && o.on })).concat({ k: 'outro', t: 'outro', on: outro });
  function passo(sentido) {
    const v = sentido > 0 ? Math.floor(campos.min / 5) + 1 : Math.ceil(campos.min / 5) - 1;
    setOutro(true);
    aoTocar('min', Math.max(5, Math.min(180, v * 5)));
  }
  return <>
    <p class="v3-rotulo">Modalidade</p>
    <Fichas rotulo="Modalidade" opcoes={campos.modais} prefixo={prefixo + 'm-'} aoTocar={k => aoTocar('m', k)} />
    <p class="v3-rotulo">Minutos</p>
    <Fichas rotulo="Minutos" opcoes={opcoes} prefixo={prefixo + 'min-'} aoTocar={k => {
      setOutro(k === 'outro');
      if (k !== 'outro') aoTocar('min', k);
    }} />
    {outro && <Contador nome="minutos" prefixo={prefixo + 'min-'} valor={campos.min + ' min'}
      menos={campos.min > 5 && (() => passo(-1))} mais={campos.min < 180 && (() => passo(1))} />}
    <p class="v3-rotulo">Intensidade</p>
    <Fichas rotulo="Intensidade" opcoes={campos.intensidades} prefixo={prefixo + 'i-'} aoTocar={k => aoTocar('i', k)} />
  </>;
}
