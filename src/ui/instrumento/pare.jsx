// O PAINEL DE PARE — decisão 13, §3 da frente 3.
//
// O terceiro sinal deixou de dizer "destrói dado" e passou a dizer PARE: a
// gravação que falhou e a ação que vai destruir usam a mesma moldura, e o que as
// distingue é a palavra. Esta peça é a moldura da segunda família — "vai
// destruir" —, e existe porque o diálogo de confirmação do sistema não a permite: os
// botões dele chamam-se "OK" e "Cancelar", e a frente 3 escreveu, como regra de
// uma linha, que nenhum painel de pare tem botão com esses rótulos. O botão
// repete o verbo com o objeto ("Apagar o peso de 28/09"); a saída é "Deixar como
// está", nunca "Cancelar" — não há formulário a abandonar, há um dado que
// continua existindo se ele não tocar.
//
// O FOCO nasce na saída, e não no verbo: Enter num painel recém-aberto tem de
// ser o gesto que não apaga nada. E o painel é uma CAMADA (`camadasAbertas`):
// o Voltar do sistema, o gesto de borda do Safari e o Esc respondem "Deixar
// como está" pelo mesmo caminho que fecha qualquer camada.
//
// Aparece sem animação (frente 4): um painel que chega animado diz "apareci",
// e o que ele tem de dizer é a frase.

import { useEffect, useRef } from 'preact/hooks';

/**
 * @param {object} p
 * @param {{ id: number, texto: string, sim: string } | null} p.p
 * @param {(sim: boolean) => void} p.onResponde
 */
export function Pare({ p, onResponde }) {
  const saida = useRef(null);
  useEffect(function () {
    if (p && saida.current) saida.current.focus();
  }, [p && p.id]);
  if (!p) return null;
  return (
    <div class="pare-w" data-pare={p.id}>
      <div class="ins-veu" />
      <div class="pare" role="alertdialog" aria-modal="true" aria-labelledby="pare-t">
        <p id="pare-t" class="pare-t">{p.texto}</p>
        <div class="pare-b">
          <button class="pare-sim" data-a="pare-sim" onClick={() => onResponde(true)}>{p.sim}</button>
          <button class="pare-nao" data-a="pare-nao" ref={saida} onClick={() => onResponde(false)}>
            Deixar como está
          </button>
        </div>
      </div>
    </div>
  );
}
