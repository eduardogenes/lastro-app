// Os três campos do cardio (modalidade, minutos, intensidade), cada um em
// fichas que gravam ou corrigem no toque. Um desenho só para o cardio rápido
// do Hoje, o cardio esquecido de um dia passado e a correção no dia aberto.

import { Fichas } from './base.jsx';

/** `campos`: `{ modais, minutos, intensidades }`, cada um `[{ k, t, on }]`. */
export function CamposDoCardio({ campos, prefixo, aoTocar }) {
  return (
    <>
      <p class="v3-rotulo">Modalidade</p>
      <Fichas rotulo="Modalidade" opcoes={campos.modais} prefixo={prefixo + 'm-'} aoTocar={k => aoTocar('m', k)} />
      <p class="v3-rotulo">Minutos</p>
      <Fichas rotulo="Minutos" opcoes={campos.minutos} prefixo={prefixo + 'min-'} aoTocar={k => aoTocar('min', k)} />
      <p class="v3-rotulo">Intensidade</p>
      <Fichas rotulo="Intensidade" opcoes={campos.intensidades} prefixo={prefixo + 'i-'} aoTocar={k => aoTocar('i', k)} />
    </>
  );
}
