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

export const ABAS = [
  { k: 'hoje',   t: 'hoje' },
  { k: 'treino', t: 'treino' },
  { k: 'comida', t: 'comida' },
  { k: 'dados',  t: 'dados' },
  { k: 'guia',   t: 'guia' }
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
