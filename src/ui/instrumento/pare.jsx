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

// ---------------------------------------------------------------------------
// A família "FALHOU" — §3.2 da frente 3, §7.2 da frente 2
// ---------------------------------------------------------------------------
//
// A mesma moldura do pare, e o que a distingue é a palavra: abre por "Não
// guardei…" (verbo negado no passado, o sujeito é o app), diz a causa, diz o que
// NÃO aconteceu e até quando o valor vale. `role="alert"`, porque interrompe. Três
// saídas, todas ações, e a terceira é sair sem fazer nada — dispensar não
// escolhe por ele, e não apaga a marca.

const CAUSA = {
  cota: 'O armazenamento deste aparelho recusou a gravação: ele está cheio.',
  recusa: 'O armazenamento deste aparelho recusou a gravação.'
};

/**
 * @param {object} p
 * @param {{ motivo: string, oQue: string, valor: string | null } | null} p.f
 */
export function Falhou({ f, onTenta, onCopia, onFecha }) {
  const primeiro = useRef(null);
  useEffect(function () {
    if (f && primeiro.current) primeiro.current.focus();
  }, [!!f]);
  if (!f) return null;
  return (
    <div class="pare-w falhou-w">
      <div class="ins-veu" />
      <div class="pare" role="alert" aria-labelledby="falhou-t">
        <p id="falhou-t" class="pare-t">
          Não guardei {f.oQue}. {CAUSA[f.motivo] || CAUSA.recusa} Nada foi apagado e nada saiu do
          aparelho. {f.valor ? 'O valor continua aqui, ' + f.valor + ', enquanto o app estiver aberto.'
                             : 'O que foi registrado continua aqui enquanto o app estiver aberto.'}
        </p>
        <div class="pare-b">
          <button class="pare-sim" data-a="falhou-tenta" ref={primeiro} onClick={onTenta}>Tentar de novo</button>
          <button class="pare-nao" data-a="falhou-copia" onClick={onCopia}>Copiar o registro inteiro</button>
          <button class="pare-nao" data-a="falhou-fecha" onClick={onFecha}>Fechar este aviso</button>
        </div>
      </div>
    </div>
  );
}

/**
 * A MARCA de não guardado, que fica depois de o aviso ser fechado. É o estado do
 * dado: ela some quando uma gravação der certo, e não quando o aviso some.
 * `role="status"`: informa, não interrompe — quem interrompeu foi o painel.
 */
export function NaoGuardado({ n, aberto, onTenta }) {
  if (!n || aberto) return null;
  return (
    <div class="ng-faixa" role="status">
      <span>Não guardado neste aparelho · {n.oQue}</span>
      <button class="ng-b" data-a="ng-tenta" onClick={onTenta}>Tentar de novo</button>
    </div>
  );
}
