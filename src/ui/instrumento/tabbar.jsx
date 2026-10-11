// A tab bar. UMA, para o produto inteiro — treino e comida são metades do
// mesmo dia, não dois apps lado a lado.
//
// Duas coisas do iPhone que ela precisa resolver, e que não se descobre no
// desktop:
//
// 1. Teclado. Barra `position: fixed` no iOS não sobe com o teclado: ela fica
//    flutuando POR CIMA dele, cobrindo justo o campo que você está digitando.
//    A barra some enquanto houver campo em foco (ver `escutaTeclado`).
//
// 2. Barra de gestos. O padding de baixo é `env(safe-area-inset-bottom)`, e o
//    alvo de toque continua tendo 46px ACIMA dela — sem isso, a aba fica na
//    faixa onde o gesto de home rouba o toque.

import { useEffect, useState } from 'preact/hooks';

// OS CINCO LUGARES, cada um com uma pergunta e nenhuma repetida:
//
//   agora      · e agora?
//   dias       · o que aconteceu em cada dia, e o que falta dizer?
//   corpo      · como está o corpo, e o que eu registro hoje?
//   semana     · a semana andou para onde, e dá para mexer na comida?
//   prescrição · o que foi prescrito, e o que eu mudo?
//
// O que SAIU: a aba de treino. A sessão virou MODO — tela cheia com saída
// própria —, e ela se alcança por três portas (o cartão do Agora, a faixa e o
// pouso do app com treino em andamento). Uma aba para o mesmo lugar seria uma
// quarta porta competindo com as três, e a razão de o modo existir é justamente
// que a sessão não é um lugar entre lugares: é um estado em que o resto sai da
// frente.
//
// E `guia` saiu como nome: metade dele era prescrição e foi para Prescrição; a
// outra metade — conta, sincronia, backup — é AJUSTES, que não é lugar, é um
// botão no canto do Agora.
export const ABAS = [
  { k: 'agora',      t: 'agora' },
  { k: 'dias',       t: 'dias' },
  { k: 'corpo',      t: 'corpo' },
  { k: 'semana',     t: 'semana' },
  { k: 'prescricao', t: 'prescrição' }
];

/**
 * Verdadeiro enquanto o foco estiver num campo de texto — ou seja, enquanto o
 * teclado do sistema provavelmente está aberto. Não existe evento de teclado
 * no iOS; foco é o sinal mais confiável que dá para observar.
 */
function useTecladoAberto() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const eCampo = el => el && /^(INPUT|TEXTAREA)$/.test(el.tagName);
    const entra = e => { if (eCampo(e.target)) setAberto(true); };
    const sai = e => { if (eCampo(e.target)) setAberto(false); };
    document.addEventListener('focusin', entra);
    document.addEventListener('focusout', sai);
    return () => {
      document.removeEventListener('focusin', entra);
      document.removeEventListener('focusout', sai);
    };
  }, []);
  return aberto;
}

export function TabBar({ ativa, onMuda }) {
  const teclado = useTecladoAberto();
  const i = Math.max(0, ABAS.findIndex(a => a.k === ativa));

  return (
    <nav class={'ins-tabbar' + (teclado ? ' oculta' : '')} aria-label="seções">
      <div
        class="ins-tab-ind"
        style={`left:${i * (100 / ABAS.length)}%;width:${100 / ABAS.length}%`}
      />
      {ABAS.map(a => (
        <button
          key={a.k}
          class={'ins-tab' + (a.k === ativa ? ' on' : '')}
          aria-current={a.k === ativa ? 'page' : undefined}
          onClick={() => onMuda(a.k)}
        >{a.t}</button>
      ))}
    </nav>
  );
}
