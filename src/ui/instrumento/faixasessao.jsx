// A faixa da sessão: a tira acima da tab bar enquanto há treino aberto.
//
// Dois papéis, e nunca os dois ao mesmo tempo:
//
//   ATALHO   — "treino A em andamento · Supino inclinado". Registrar é só
//              metade do uso da academia: entre séries ele marca água, confere
//              o que falta comer, olha o peso. Voltar custava achar a aba e
//              depois achar o exercício. Some na própria aba de treino, onde
//              seria porta para a sala em que já se está.
//
//   PERGUNTA — depois de 1h30 sem série nova. Aparece em TODAS as abas, treino
//              inclusive: quem esquece de finalizar costuma ter esquecido
//              olhando justamente para ela.
//
// Empilha ACIMA do cronômetro, como o toast: `--ins-timer-h` é escrito pelo
// casco quando o descanso entra e sai, e sem isso a faixa nasceria atrás dele.
// E escreve a própria altura em `--ins-faixa-h`, que o toast e o fim da página
// leem pelo mesmo motivo — foi este bug que o cronômetro já causou uma vez.

import { useLayoutEffect, useRef } from 'preact/hooks';

export function FaixaDaSessao({ faixa, onVolta, onContinua, onEncerra }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const h = ref.current ? ref.current.offsetHeight : 0;
    try {
      document.documentElement.style.setProperty('--ins-faixa-h', h + 'px');
    } catch (e) {}
  });

  if (!faixa) return null;

  if (faixa.tipo === 'pergunta') {
    return (
      <div ref={ref} class="ins-faixa ins-faixa-p" role="status">
        <span class="ins-faixa-o">{faixa.txt}</span>
        <div class="ins-faixa-acoes">
          <button class="ins-faixa-b" onClick={onContinua}>continuo treinando</button>
          <button class="ins-faixa-b" onClick={onEncerra}>já parei</button>
        </div>
      </div>
    );
  }

  return (
    <button ref={ref} class="ins-faixa ins-atalho" onClick={onVolta}
            aria-label={'voltar ao treino ' + faixa.dia + ': ' + faixa.txt}>
      <span class="ins-faixa-o">treino {faixa.dia} em andamento</span>
      <span class="ins-atalho-v">{faixa.txt}</span>
    </button>
  );
}
