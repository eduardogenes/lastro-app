// O TECLADO PRÓPRIO, de doze teclas.
//
// §6.2 da frente 2, T1 a T4. Ele existe porque o teclado do sistema cobre metade
// da tela no meio de uma série — a razão já estava escrita no fonte do app, para
// o RIR ser botão — e porque a régua, que substituiu o campo de repetição,
// precisa de uma porta para o valor que ela não carrega.
//
// ---- A ordem das teclas é a da calculadora, e isso é conferido ----
//
// `7 8 9 / 4 5 6 / 1 2 3 / , 0 ⌫` — a ordem do protótipo da Direção D, que a
// frente 2 conferiu. É a ordem de uma calculadora e não a de um telefone (que
// seria `1 2 3` em cima): quem registra carga está fazendo conta, não discando.
//
// ---- T1 · ele aceita o teclado físico, e esse era o único defeito nomeado ----
//
// C2 nomeou e a frente conferiu: o teclado de doze teclas do protótipo existe só
// por `click` — `grep -c "keydown\|keypress\|keyup"` devolve **0**. Quem está no
// notebook, com teclado de verdade na frente, tem de MIRAR COM O MOUSE em doze
// teclas. O dono usa o notebook "bastante" (P8, P11), e ninguém contou quanto.
//
// O `keydown` fica no nó RAIZ do painel, que recebe foco ao abrir — e não num
// ouvinte de `document`. A diferença não é estilo: ouvinte de documento posto por
// efeito de componente foi a causa da intermitência que custou caro neste
// projeto (`09-desligamento.md`), e aqui ele não é necessário, porque o painel
// tem foco e os eventos sobem até ele.
//
// ---- T2 · o visor é região viva ----
//
// No protótipo o visor é um `<b data-k="d">` que muda de texto sem anunciar nada.
// É o mesmo defeito do R-D1, num lugar onde o valor é a única coisa que existe.
// Aqui ele é `role="status" aria-live="polite"`: anuncia, e não interrompe.
//
// ---- T4 · o cursor não pisca ----
//
// A Direção C pisca a 1 Hz, infinitamente, e é o único movimento infinito dos
// dois arquivos de direção. A D tem um retângulo estático, e é a forma dela que
// fica — sem animação nenhuma, então não há o que pôr dentro de
// `prefers-reduced-motion`.
//
// ---- A VÍRGULA ----
//
// A §6.1 manda "próprio, com vírgula e casa decimal fixa", e as duas metades da
// frase não são a mesma coisa. **O argumento e o ponto de reversão estão em
// `src/dominio/teclado.ts`**, junto da constante que decide.

import { useEffect, useRef } from 'preact/hooks';
import { DECIMAL_FIXA } from '../../dominio/teclado';

/** A ordem da calculadora, conferida no protótipo da D. */
const TECLAS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫'];

const NOME = { ',': 'vírgula', '⌫': 'apagar o último número' };

export function Teclado({ texto, decimal, rotulo, unidade, aoTeclar, aoFechar }) {
  const raiz = useRef(null);

  // Foco ao abrir: é o que faz o `keydown` da raiz alcançar o teclado físico
  // (T1) sem ouvinte de documento, e é também o T2 — o painel é alcançável.
  //
  // `preventScroll` (peça 8 do motion; docs/motion/01 A.5): o foco não rola a
  // página. Sem ele o navegador trazia o painel em foco para a vista do jeito
  // dele — sem descontar o cronômetro nem a área segura, e cada motor com a sua
  // regra. Quem traz o teclado inteiro para a tela, quando ele não cabe, é o
  // casco, no desenho seguinte, pelo mínimo e de uma vez
  // (`mostraOTecladoInteiro`, `main.jsx`); quando cabe, nada rola. O foco e o
  // visor continuam os mesmos.
  useEffect(() => { if (raiz.current) raiz.current.focus({ preventScroll: true }); }, []);

  function naTecla(e) {
    const k = e.key;
    if (k === 'Enter' || k === 'Escape') { e.preventDefault(); aoFechar(); return; }
    if (k === 'Backspace') { e.preventDefault(); aoTeclar('⌫'); return; }
    // o ponto do teclado numérico do notebook vira vírgula: é o separador
    // decimal do português, e quem digita `.` quer dizer `,`
    if (k === '.' || k === ',') { e.preventDefault(); aoTeclar(','); return; }
    if (/^[0-9]$/.test(k)) { e.preventDefault(); aoTeclar(k); return; }
  }

  return (
    <div class="tcl" ref={raiz} tabIndex={-1} onKeyDown={naTecla}
         role="group" aria-label={rotulo}>
      {/* O VISOR é região viva: no protótipo ele muda de texto sem anunciar
          nada, e aqui o valor é a única coisa que existe. */}
      <div class="tcl-visor" role="status" aria-live="polite">
        <span class="tcl-n">{texto || '0'}</span>
        {unidade && <span class="tcl-u">{unidade}</span>}
        {/* O cursor é um retângulo ESTÁTICO: a forma da D. O da C pisca a 1 Hz,
            infinitamente, e é o único movimento infinito das duas direções. */}
        <span class="tcl-cursor" aria-hidden="true" />
      </div>
      <div class="tcl-grade">
        {TECLAS.map(t => (t === ',' && !decimal) ? (
          // Tecla que não faria nada é falso sucesso, e a doutrina do app o
          // proíbe. Num campo de número inteiro o lugar dela fica VAZIO, e a
          // grade mantém a forma.
          <span key="vazia" class="tcl-vazia" aria-hidden="true" />
        ) : (
          <button
            key={t}
            class={'tcl-t' + (t === '⌫' ? ' tcl-apaga' : '')}
            data-a={'tcl-' + (t === ',' ? 'virgula' : t === '⌫' ? 'apaga' : t)}
            aria-label={NOME[t]}
            onClick={() => aoTeclar(t)}
          >{t}</button>
        ))}
      </div>
      <button class="tcl-pronto" data-a="tcl-pronto" onClick={aoFechar}>pronto</button>
    </div>
  );
}
