// O atalho de volta ao treino em andamento.
//
// Existe porque registrar é só metade do uso da academia: entre uma série e
// outra ele marca água, confere o que falta comer, olha o peso. Voltar ao
// treino custava achar a aba e depois achar o exercício — dois toques e uma
// rolagem, de pé, com uma mão.
//
// Empilha ACIMA do cronômetro, como o toast: `--ins-timer-h` é escrito pelo
// casco quando o descanso entra e sai, e sem isso o atalho nasceria atrás
// dele. E escreve a própria altura em `--ins-atalho-h`, que o toast e o fim da
// página leem pelo mesmo motivo — foi exatamente este bug que o cronômetro já
// causou uma vez.

import { useLayoutEffect, useRef } from 'preact/hooks';

export function AtalhoTreino({ atalho, onVolta }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const h = ref.current ? ref.current.offsetHeight : 0;
    try {
      document.documentElement.style.setProperty('--ins-atalho-h', h + 'px');
    } catch (e) {}
  });

  if (!atalho) return null;

  return (
    <button ref={ref} class="ins-atalho" onClick={onVolta}
            aria-label={'voltar ao treino ' + atalho.dia + ': ' + atalho.txt}>
      <span class="ins-atalho-o">treino {atalho.dia} em andamento</span>
      <span class="ins-atalho-v">{atalho.txt}</span>
    </button>
  );
}
