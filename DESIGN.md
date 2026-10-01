# DESIGN.md — Instrumento

Sistema visual do produto inteiro. A fonte canônica dos valores é
[`src/tokens.css`](src/tokens.css); este documento explica o porquê.

O sistema veio pronto do handoff do Instrumento,
[`DESIGN_SYSTEM.md`](<App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md>)
(`41bb122`), extraído do app de nutrição e escrito para ser reusado neste. As
marcas `§3.x` abaixo são seções dele.

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
   título. Nunca misturar dentro de uma mesma string: "250 g arroz" é mono só
   quando é dado numa coluna de valores; dentro de uma frase, a frase inteira é
   display.
3. **Fio, não cartão.** Estrutura vem de régua de 1px e do vão de 1px da grade.
   Caixa com borda é **lista fechada**, e não um critério a interpretar:
   veredito, formulário e resumo. "Genuinamente destacado" nunca teve critério
   em documento nenhum, handoff incluído — então vale a lista, e caixa nova é
   decisão, não aplicação da regra. Nunca sombra. Nunca preenchimento para
   "agrupar".
4. **Um acento, e ele significa.** Ácido `#CBF35E` = agora / feito / seu /
   aperte aqui. Âmbar `#FFC46B` = preste atenção. Coral `#FF8A6B` = destrói
   dado. O resto é escala de cinza. No máximo um elemento ácido competindo em
   cada região da tela.

   **E não existe um quinto sentido: ácido nunca pinta comparação favorável.**
   "Melhor que antes" — recorde, delta positivo, exercício que subiu — é elogio,
   e o app não comemora nem por palavra nem por cor. O número já traz o sinal.
   A fronteira é esta: *dentro da regra* é estado, e pode ser ácido — o ritmo na
   faixa que o nutricionista prescreveu, a nuvem em dia; *melhor que antes* é
   comparação, e fica cinza. O âmbar continua livre, porque atenção não é elogio.
5. **Rótulo mono em caixa alta é estrutura**, nunca ênfase. Tem três usos, e
   só três: abre uma seção, nomeia um valor, ou é o **rótulo de ação dentro de
   um botão** — todo botão do sistema é mono 11px em caixa alta com tracking,
   como no handoff, e declarar isso é o que torna a regra conferível. Fora dos
   três, caixa alta é ênfase, e ênfase não existe aqui.
6. **Quase nenhum movimento.** Movimento aqui não decora e não comemora. Ele
   faz só três coisas: interpola uma grandeza que é contínua no mundo, diz que
   a tela está viva agora, e mostra para onde se andou. Fora disso a tela troca
   de estado sem transição. Nada de animação de entrada, nada de fade, nada de
   esqueleto que cintila, nada de folha com mola. Os que existem estão em
   [Movimento](#movimento).

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
`#7C8478` rótulo, meta, procedência e aba inativa · `#5E655A` o redundante:
dica que repete o que já está na tela.

Os dois últimos são para rótulo, nunca para prosa que precisa ser lida.

O critério é contraste, medido sobre `--ins-canvas` em `2e3ef75`: texto pede AA,
4,5:1. O nível 4 dá 5,01:1 e passa. O nível 5 dá 3,22:1 e reprova, então só
carrega o que já está dito em outro lugar. Rótulo que traz informação, como a
procedência, vai no nível 4.

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
| metric-s | mono | 19 / 600 / −.03em — célula de métrica na folha |
| headline | display | 34 / 700 / −.035em — o nome do objeto em foco |
| display | display | 30 / 700 / −.03em — título de tela |
| title | display | 24 / 700 — título de folha |
| subtitle | display | 17 / 500 — nome de linha |
| body | display | 15 / 400 / 1.4 — nome de item |
| body-sm | display | 14 / 400 / 1.5 |
| body-xs | display | 13 / 400 / 1.5 — piso da prosa |
| label | mono | 10 / .18em / caixa alta |
| label-sm | mono | 9 / .16em / caixa alta — rótulo dentro da célula de grade |
| data | mono | 13 — quantidade, hora, valor |
| provenance | mono | 10 / .06em — "cru · 3,4 kg prontos" |

**Pisos:** nunca abaixo de 9px em rótulo mono, 13px em prosa, 16px em campo de
texto (Safari), 15px em nome tocável.

## Espaço

Base 4. **Só estes degraus aparecem:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26,
34. Goteira da página 20px. Limite entre seções 24px no total.

**O 2px é costura óptica, não degrau de layout:** ele só vale DENTRO de um bloco
de texto — entre um nome e o subtítulo dele, entre as duas linhas de uma célula —
e no anel de 2px do ponto de status. Nunca entre dois objetos: ali o menor é 4.

Exceções autorizadas, cada uma com fonte: 5px (handoff §3.5, dentro da célula
de métrica), 3px (§3.14, vão da sparkline), 9px (§3.10, chip de CTA), 17px
(alinhamento óptico do ponto da timeline, `src/componentes.css`).

`tests/dominio/estilo.test.ts` cobra o valor de `padding`, `margin` e `gap` em
`base.css`, `componentes.css` e `treino.css`. Não lê `protocolo.css` nem estilo
embutido no JSX, aceita também 1 e 46 — o 2 agora é degrau declarado — e aceita
as quatro exceções em qualquer lugar, não só onde elas foram autorizadas.

## Toque

`--ins-tap: 46px` para controle apertado repetidamente — stepper, botão
primário, botão de ação. Campo de digitar uma vez usa 40px: já é alvo
confortável e não é controle repetido.

**`--ins-tap-dense: 28px` é DESENHO, não alvo.** Ele vale para controle
secundário dentro de linha cheia — caixa de marcar, chip, opção de escala, ponto
de pose, o "marcar" da linha de cardio —, e quem o usa **estende a área por
`::after` até 44 no mínimo**. Onde o vão entre fileiras não permite chegar lá, o
quanto deu está escrito na própria regra do CSS: os chips param em 37 e 41,
porque crescer além do vão faria a fileira de baixo roubar o toque da de cima,
que é pior que o alvo pequeno.

**Desenho e alvo podem ter tamanhos diferentes, e às vezes precisam.** O stepper
compacto é o caso: 38px de desenho, porque os três controles do exercício têm de
caber numa linha de 390px e quebrar dobraria a altura da lista, e 46px de alvo,
pela vertical. Quando as duas razões escritas se chocam, a saída é esta, não
escolher uma delas.

**Nunca forçar `min-height` dentro de uma linha que já é o alvo.** Alvo pequeno
é problema; alvo grande duas vezes é altura perdida, e some no desktop.

## Componentes

Anatomia exata em [`src/componentes.css`](src/componentes.css) e
[`src/treino.css`](src/treino.css).

- **Cartão-foco** — responde "e agora?". Ponto pulsante + `AGORA · HH:MM`,
  nome em 34px, contagem em 34px mono à direita, resumo, chip ácido. Sem borda
  e sem preenchimento: flutua no papel.
- **Linha de timeline** — a espinha do dia em HOJE. Calha de 46px com a hora +
  espinha de 1px com ponto de 9px + conteúdo + `···`. A sessão de treino entra
  nela como uma linha entre as refeições, e é isso que faz o dia parecer uma
  sequência só. O exercício, na tela TREINO, tem anatomia própria: a calha leva
  a miniatura do aparelho, e o número vai embaixo, menor — uma coluna a mais
  custaria largura ao nome, que é o que ele lê primeiro (`508cbc6`).
- **Grade de fios** — o vão de 1px É a régua. Sem borda nas células.
- **Veredito** — recomendação calculada. Uma das poucas caixas com borda.
- **Folha de baixo** — o único modal que o app desenha. Confirmar o que não tem
  volta usa o `confirm()` do sistema (`c0974b2`). O que diz "modal" na folha é
  a linha ácida de 1px no topo, não sombra. Empilha em três níveis, nunca
  mais.
- **Sparkline** — 14 fatias. Fatia vazia continua como trilho: os buracos no
  registro são visíveis de propósito.
- **Ticks** — quantidade que se toca. Tocar na última cheia remove.
- **Tab bar** — 5 abas, indicador de 2px deslizando em 220ms. Some quando há
  campo em foco, senão flutua sobre o teclado do iOS.

## A bancada (só no computador)

Numa janela de mesa o app não é o app: é a **bancada**, e o app está pousado
nela dentro de um iPhone. Anatomia em [`src/palco.css`](src/palco.css), o
porquê inteiro no cabeçalho de [`src/palco.js`](src/palco.js).

**Por que existe.** Toda decisão deste sistema pressupõe 402 × 874 na mão: a
goteira de 20px, a área segura, o sticky que para abaixo do relógio do sistema,
o aviso de telefone deitado. Numa janela de 1900px a coluna de 460px flutuava
no vazio e a tab bar esticava de ponta a ponta — não era o app quebrado, era o
app certo na tela errada, e nenhuma das decisões acima tinha o que provar.

**Como.** Um iframe do mesmo documento, com viewport de verdade: `100svh`,
`@media (orientation)`, `position: fixed` e `sticky` se resolvem sozinhos lá
dentro, sem uma linha de CSS condicional no app. A única coisa que o iframe
não dá é `env(safe-area-inset-*)`, que pertence ao sistema — a bancada escreve
`--sa-top` e companhia na raiz do documento de dentro, e o app segue lendo os
mesmos tokens de sempre.

**As quatro licenças.** A bancada rompe três dos seis inegociáveis, e nenhuma
das licenças atravessa o vidro:

| Inegociável | O que a bancada faz | Por quê |
|---|---|---|
| 1. Raio zero | O aparelho tem o canto contínuo do modelo que imita — 73px no de referência, com o vidro em 62 (`palco.js`) —, com `corner-shape: squircle` onde existe. | Mesma licença da miniatura de foto: forma que o mundo já tem, não caixa arredondada por gosto. |
| 3. Nunca sombra | O aparelho projeta uma. | É ela que separa *objeto pousado numa superfície* de *desenho colado na página*, e é a coisa toda que a bancada tem a dizer. Pertence ao objeto; a tela continua sendo a única região plana da composição. |
| 6. Quase nenhum movimento | Três: o pouso do aparelho (520ms, uma vez), a virada ao girar (300ms) e o painel e a régua pousando logo depois (420ms, 140ms de atraso). | Todos são estado — "chegou", "virou" —, e todos morrem em `prefers-reduced-motion`. |
| — | Relógio, sinal e bateria vão na fonte do **sistema**. | São do iOS. Escrevê-los em Space Grotesk seria o app assinando o que não é dele — a mesma regra que faz `body::before` devolver o fundo sob a barra de status. |

**O prefixo é `pl-`, não `ins-`.** `ins-` é a língua do que se vê dentro do
app; a bancada está do lado de fora do vidro. O titânio dela é uma segunda
paleta e mora no bloco de tokens de `palco.css`, nunca em `tokens.css`.

**O que ela não faz.** Não amplia — a escala só reduz, e quando reduz o painel
diz de quanto, porque aqui também todo número responde de onde veio. Não
aparece em telefone, em PWA instalado, em ponteiro grosso nem embutida em outro
documento. `?palco=0` devolve o app cru na janela.

`tests/dominio/estilo.test.ts` cobra as recusas, a paleta presa nos tokens e
que nenhum seletor do palco alcance o app.

## Movimento

Quatro, e cada um tem função. `prefers-reduced-motion` desliga os quatro.

| Movimento | Onde | Como | Função |
|---|---|---|---|
| Pulso do ponto ao vivo | `ins-pulse`, `base.css` | 2,4 s, opacidade, em ciclo | diz que a tela está viva agora |
| Indicador de aba | `.ins-tab-ind`, `componentes.css` | 220 ms, `cubic-bezier(.2,.8,.2,1)` (`--ins-dur`, `--ins-ease`), em `left` | mostra para que lado se andou |
| Barra do cronômetro | `#tfill`, `componentes.css` | 250 ms `linear`, em `transform: scaleX` | interpola o descanso entre as quatro amostras por segundo de `pintaTimer` |
| Rolagem até a sessão destacada | `levaAsSessoesDoDia`, `main.jsx` | `smooth`, na curva do navegador | leva o olho até um alvo que estava fora de vista |

**A barra do cronômetro é mais velha que este documento** (`7cd6418`), e o
handoff já a contava como movimento ambiente: "a ticking countdown and a
pulsing dot are the only ambient motion; they exist to make the screen feel
current" (§4, lei 2). Dura 250 ms porque é o intervalo entre duas amostras —
menos deixa vão parado, mais atrasa a barra em relação ao número —, e é
`linear` porque o tempo passa linear.

**Rolagem suave só quando o alvo estava fora de vista** e a tela precisa mostrar
para onde foi. Quando o alvo é o que se acabou de tocar, ela é `instant`: ele
já é o assunto (`mostraExercicio`).

**Custo.** Grandeza que se repinta sem parar anima `transform`, nunca largura
nem posição: a barra trocou `width` por `scaleX` porque repinta 4× por segundo
por até três minutos (`3ef9bb9`), e `tests/dominio/estilo.test.ts` cobra.

**`prefers-reduced-motion`.** As transições morrem pelo curinga de `base.css` e
`componentes.css`, a rolagem cai para `auto` na própria linha, e o pulso morre
por seletor. Um `@keyframes` novo **não** morre sozinho: o bloco só desliga
`animation` em `.ins-live-dot`. Movimento novo é `transition`, ou entra no
bloco.

Sob `reduce`, a barra do cronômetro passa a andar em degraus de 250 ms — quatro
por segundo —, e **é assim que fica**: quem liga `reduce` pediu para não
interpolar, e inventar uma amostragem especial para ela seria movimento novo
para resolver um problema que ninguém mediu. O número ao lado continua exato.

**O que já foi considerado e recusado.** A folha subir ao abrir: era o único
lugar onde a revisão de design achou função para movimento novo — dizer de onde
a camada veio —, e perdeu por ser animação de entrada, que a lista acima proíbe
pelo nome, e porque o véu atrás dela ou aparece de uma vez ou pede um fade, que
é mais movimento ainda. Transição entre abas, deslizar conteúdo, animar altura,
esqueleto que cintila e qualquer comemoração: recusados, cada um com motivo, em
`docs/design-review/05-movimento.md`.

**Movimento novo entra nesta tabela, com a função que cumpre, antes de entrar
no código.** A rolagem entrou sem que ninguém citasse a regra (`02077e3`); seis
dias depois, outra rolagem foi recusada justamente por citá-la
(`mostraExercicio`).

## Estado de retirada

Concluída. O sistema antigo (azul-marinho + âmbar, Archivo, cartões com raio)
saiu do projeto: `src/app.css` foi apagado em `6f4dd12`, a ponte global de
handlers morreu em `3283495`, e `minify` e `treeshake` estão ligados no build.
A última sobra era a própria Archivo, ainda baixada pelo `index.html` sem ser
usada por regra nenhuma. `tests/dominio/estilo.test.ts` cobra que a paleta
antiga não volte, nem por apelido.
