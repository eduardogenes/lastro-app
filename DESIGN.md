# DESIGN.md — Instrumento

Sistema visual do produto inteiro. A fonte canônica dos valores é
[`src/tokens.css`](src/tokens.css); este documento explica o porquê.

## Tema

**Escuro, e não por estilo.** O app abre às 6h15 no subsolo de uma academia e
de novo à noite. Superfície escura de leitura, dado em monoespaçada, estrutura
desenhada com fio de 1px em vez de cartão, e exatamente um acento ácido que
diz o que está vivo, o que está feito e onde apertar. Lê como preciso, não
como motivacional, e nunca comemora.

## Os seis inegociáveis

1. **Raio zero.** Tudo é quadrado. As exceções são três, e cada uma tem
   motivo: o ponto de status, o thumb do slider e a **miniatura do aparelho**
   (`--ins-raio-foto`, 10px).

   A terceira entrou quando o app ganhou foto. Fotografia com canto reto no
   meio de uma lista construída com fios lê como recorte colado por cima;
   com canto suave ela se assenta. O raio é de FOTO, não de cartão — 10px em
   44px —, e não abre precedente para arredondar caixa, botão ou campo.
2. **Número em mono, prosa em display.** IBM Plex Mono carrega toda quantidade,
   hora, carga, macro e contagem. Space Grotesk carrega todo nome, frase e
   título. Nunca misturar dentro de uma mesma string.
3. **Fio, não cartão.** Estrutura vem de régua de 1px e do vão de 1px da grade.
   Caixa com borda é reservada a objeto genuinamente destacado — veredito,
   formulário, resumo. Nunca sombra. Nunca preenchimento para "agrupar".
4. **Um acento, e ele significa.** Ácido `#CBF35E` = agora / feito / seu /
   aperte aqui. Âmbar `#FFC46B` = preste atenção. Coral `#FF8A6B` = destrói
   dado. O resto é escala de cinza. No máximo um elemento ácido por região.
5. **Rótulo mono em caixa alta é estrutura**, nunca ênfase.
6. **Quase nenhum movimento.** Existem dois: o pulso do ponto ao vivo (2,4 s) e
   o indicador de aba (220 ms).

## Paleta

### A ausência de imagem

Um exercício sem foto **não desenha moldura vazia**: a calha mostra uma
superfície elevada com um ponto ao centro, e ela é TOCÁVEL — é por ali que a
foto entra. Isso é o que a separa de decoração. Um retângulo que não faz nada e
não diz nada seria preenchimento para agrupar, que o inegociável 3 proíbe.

O ponto ao centro é o mesmo elemento redondo do ponto de status. Repetir a forma
que o sistema já tem custa menos que inventar um símbolo novo para dizer "vazio".

### Superfícies
| Token | Hex | Uso |
|---|---|---|
| `--ins-canvas` | `#0C0E0C` | fundo da página e da folha |
| `--ins-surface-low` | `#0F120F` | linha de opção dentro de folha |
| `--ins-surface` | `#111411` | elevado: input, selo |
| `--ins-surface-acid` | `#161B12` | linha selecionada / dia atual |
| `--ins-surface-warn` | `#101408` | fundo do cartão de veredito |

### Linhas — são quatro, e a escolha é semântica
| Token | Hex | Significa |
|---|---|---|
| `--ins-hairline` | `#161A15` | entre linhas **dentro** de uma lista |
| `--ins-rule` | `#22271F` | entre seções; o vão de 1px da grade |
| `--ins-border` | `#2B302A` | borda em repouso |
| `--ins-border-strong` | `#3A4137` | borda interativa |

### Texto — cinco níveis, nunca mais
`#F2F4EF` primário · `#D6DAD0` prosa em cartão · `#A8AFA1` frase de apoio ·
`#7C8478` rótulo e meta · `#5E655A` dica, procedência, aba inativa.

Os dois últimos são para rótulo, nunca para prosa que precisa ser lida.

### Sinal
`#CBF35E` ácido · `#FFC46B` âmbar · `#FF8A6B` coral · texto sobre qualquer
preenchimento ácido é sempre `#0C0E0C`.

## Tipografia

Space Grotesk (400/500/700) + IBM Plex Mono (400/500/600). O par tem eixo de
contraste real: geométrica com grotesca monoespaçada.

| Papel | Fonte | Tamanho / peso / tracking |
|---|---|---|
| metric-xl | mono | 52 / 600 / −.05em — o número que a tela é sobre |
| metric-l | mono | 34 / 500 / −.04em — contagem regressiva |
| metric-m | mono | 22 / 600 / −.03em — célula de grade |
| headline | display | 34 / 700 / −.035em — o nome do objeto em foco |
| display | display | 30 / 700 / −.03em — título de tela |
| title | display | 24 / 700 — título de folha |
| subtitle | display | 17 / 500 — nome de linha |
| body-sm | display | 14 / 400 / 1.5 |
| body-xs | display | 13 / 400 / 1.4 — piso da prosa |
| label | mono | 10 / .18em / caixa alta |
| provenance | mono | 10 / .06em — "cru · 3,4 kg prontos" |

**Pisos:** nunca abaixo de 9px em rótulo mono, 13px em prosa, 16px em campo de
texto (Safari), 15px em nome tocável.

## Espaço

Base 4. **Só estes degraus aparecem:** 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34.
Goteira da página 20px. Limite entre seções 24px no total. Sempre `gap`, nunca
margem entre irmãos.

Exceções autorizadas, cada uma com fonte: 5px (§3.5, dentro da célula de
métrica), 3px (§3.14, vão da sparkline), 9px (§3.10, chip de CTA), 17px
(alinhamento óptico do ponto da timeline). `tests/dominio/estilo.test.ts` cobra.

## Toque

`--ins-tap: 46px` para controle apertado repetidamente — stepper, botão
primário, botão de ação. `--ins-tap-dense: 28px` só para toggle de um toque
dentro de linha densa. Campo de digitar uma vez usa 40px: já é alvo confortável
e não é controle repetido.

**Nunca forçar `min-height` dentro de uma linha que já é o alvo.** Alvo pequeno
é problema; alvo grande duas vezes é altura perdida, e some no desktop.

## Componentes

Anatomia exata em [`src/componentes.css`](src/componentes.css) e
[`src/treino.css`](src/treino.css).

- **Cartão-foco** — responde "e agora?". Ponto pulsante + `AGORA · HH:MM`,
  nome em 34px, contagem em 34px mono à direita, resumo, chip ácido. Sem borda
  e sem preenchimento: flutua no papel.
- **Linha de timeline** — a espinha de qualquer dia em sequência. Calha de 46px
  (hora na comida, posição no treino) + espinha de 1px com ponto de 9px +
  conteúdo + `···`. **Reusada por refeição e por exercício**, e é isso que faz
  o dia parecer uma sequência só.
- **Grade de fios** — o vão de 1px É a régua. Sem borda nas células.
- **Veredito** — recomendação calculada. Uma das poucas caixas com borda.
- **Folha de baixo** — o único modal. O que diz "modal" é a linha ácida de 1px
  no topo, não sombra. Empilha em três níveis, nunca mais.
- **Sparkline** — 14 fatias. Fatia vazia continua como trilho: os buracos no
  registro são visíveis de propósito.
- **Ticks** — quantidade que se toca. Tocar na última cheia remove.
- **Tab bar** — 5 abas, indicador de 2px deslizando em 220ms. Some quando há
  campo em foco, senão flutua sobre o teclado do iOS.

## Movimento

Dois, e só dois: `ins-pulse` no ponto ao vivo (2,4s) e o deslize do indicador
de aba (220ms, `cubic-bezier(.2,.8,.2,1)`). `prefers-reduced-motion` desliga
os dois.

## Estado de retirada

Concluída. O sistema antigo (azul-marinho + âmbar, Archivo, cartões com raio)
saiu do projeto: `src/app.css` foi apagado em `6f4dd12`, a ponte global de
handlers morreu em `3283495`, e `minify` e `treeshake` estão ligados no build.
A última sobra era a própria Archivo, ainda baixada pelo `index.html` sem ser
usada por regra nenhuma. `tests/dominio/estilo.test.ts` cobra que a paleta
antiga não volte, nem por apelido.
