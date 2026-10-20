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
6. **Movimento explica, e só explica.** Cada movimento diz uma coisa só: de
   onde a camada veio, para onde se andou, o que mudou, que o toque pegou — ou,
   no ambiente, que o tempo está correndo e que a tela está viva. O que não diz
   nenhuma das seis não entra. Os que existem estão em [Movimento](#movimento),
   com a função de cada um.

   **Camada se move; conteúdo não.** Folha, tela cheia, modo de sessão,
   cronômetro e aviso chegam pela borda de onde vêm e voltam por ela: a camada
   chega **por cima** de outra coisa, e o movimento é o que diz, sem texto, onde
   ela começa e para onde volta (o argumento da decisão 14, de 06/10, estendido
   a toda camada). Lista, cartão, linha e o painel que nasce sob o polegar
   (régua, teclado, RIR) aparecem no lugar: entrada animada de conteúdo enfeita
   a chegada de algo que já ia chegar, e alvo que se move sob o dedo é alvo
   errado.

   **Proibido pela forma, não pela contagem:** comemoração (nenhum quadro, curva
   ou tempo diferente para "feito", "6/6" ou "14/14"), número que rola,
   esqueleto que cintila, altura, largura ou posição animadas (só `transform` e
   `opacity`) e movimento no fim do descanso, quando ele não está olhando. A
   ultrapassagem existe **só no quique** (`ins-quique`, `--ins-dur-quique`), que
   só a chegada da folha e do painel de apagar usam, e nenhuma saída quica —
   decisão do dono de 16/10.

   **O toque nunca espera.** O dado grava no toque; nada trava a entrada
   enquanto algo anima, e nada escuta o fim de uma animação para gravar,
   desmontar ou mover o foco.

   **O toque se vê, e não se move.** Todo controle escurece enquanto o dedo
   está nele, e nada encolhe (dono, 16/10, pergunta 7: "nenhum movimento
   novo"). É estado, não movimento: troca na hora e mora fora do portão, então
   com "Reduzir movimento" é igual. Como, em [Toque](#toque).

   **O portão é por adesão**, e falha fechado: todo movimento mora dentro de
   `@media (prefers-reduced-motion: no-preference)`, com o último quadro escrito
   fora, e o JavaScript pergunta a uma porta só (`src/ui/movimento.js`). Sob
   "Reduzir movimento" nunca há mais movimento do que sem a preferência.

   (Caiu em 16/10: "quase nenhum movimento" e a contagem de funções
   autorizadas. O pedido de 15/10 — "que o app se mova bem; cada movimento tem
   de explicar alguma coisa" — pede o contrário da contagem, e a contagem
   quebrou duas vezes em um mês com o código certo no mérito. O raciocínio
   inteiro, o que caiu e o que ficou, está em `docs/motion/06-sistema.md` §1 e
   `docs/motion/08-parecer.md` §1 e §5.1.)

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

**O controle escurece enquanto o dedo está nele — todo controle, e só ele.**
A seção "O TOQUE" de `base.css` pinta uma camada translúcida por cima do
preenchimento de repouso de todo `<button>`, do rótulo que abre seletor de
arquivo ou marca caixa, e do topo do cartão do exercício: o transparente
escurece o fundo atrás dele, o preenchido escurece o próprio preenchimento. A
camada de cada controle é `--ins-toque`, que nasce como `--ins-toque-papel` (a
tinta a 25% no claro; no escuro ela CLAREIA, a 18%, porque contra o preto não
há para onde ir). O controle de preenchimento cheio (acento, pare) declara
`--ins-toque: var(--ins-toque-cheio)` na mesma regra que pinta o
preenchimento — escurecer o que já é escuro mede menos: a camada do papel dá
1,2:1 sobre o acento —, e a regra que devolve um controle cheio ao papel (o
`.dbtn`, que deixa o primário transparente) devolve a camada junto.

- **A régua: 1,5:1 no mínimo** entre o tocado e o repouso, e entre o tocado e o
  fundo atrás dele, nos dois temas. Medido em 115 controles no Chromium, com o
  dedo de verdade (ponteiro) no WebKit, e na árvore do teste: de 1,51 (o verbo
  do painel de pare) a 1,73:1. Antes eram 78 de 115 sem mudança nenhuma, e o mais forte 1,24:1; o
  "+1 copo" trocava para a cor exata do bloco em volta. 1,5 são cinco degraus
  do 1,08 que não se via (a razão se multiplica: 1,08⁵ ≈ 1,5), e é a ordem do
  toque que o dono apertou na página das decisões (o cinza dela mede 1,52:1
  sobre o branco). **Luz da academia ninguém mediu**: o piso existe para o
  toque não encolher em silêncio.
- **Só escurece, e na hora.** Nenhuma escala, nenhum `transform`, nenhuma
  transição — a entrada é imediata e a saída também. Uma soltura que apagasse
  aos poucos só tocaria onde o nó sobrevive ao `render()`, e a régua, o RIR, o
  "pronto" e o "Comi tudo" somem no mesmo toque.
- **Só o tocado.** `:active` vale para o tocado e para todos os ancestrais;
  nenhum ancestral pinta nada com ele. A régua escurece o botão, nunca a faixa;
  o topo do cartão não escurece quando o dedo está na miniatura de dentro dele.
  A miniatura, que cobre o próprio botão, escurece o quadrado de dentro, e a
  foto apaga.
- **Uma camada só.** Nenhuma outra regra troca o fundo do controle no
  `:active` — era assim que o "+1 copo" virava a cor do bloco. O `!important` da
  camada é o único do app: ele é o que a deixa por cima do `background:`
  abreviado de qualquer repouso. E `button:active` mora numa regra sozinho: um
  navegador sem `:has()` descarta a regra inteira em que ele aparece, e o toque
  de todo botão iria junto com o do rótulo e do topo do cartão.
- **No iPhone**, `:active` só acontece porque `src/main.jsx` põe um ouvinte vazio
  e passivo de `touchstart` no documento: sem nenhum ouvinte, o Safari do iOS não
  aplica `:active` num toque.
- **A guarda**: `tests/dominio/estilo.test.ts`, caso (f), cobra a forma (as
  regras fora de `@media`, `button:active` sozinho, o `!important` só nelas, nada que se mova, nenhum
  segundo fundo no `:active`, a troca de camada só na regra que pinta o
  preenchimento que a pede, e todo preenchimento cheio de controle — controle
  tirado do JSX — com a camada do cheio) e a conta das camadas sobre a
  paleta; `tests/fluxo/toque.test.js` confere na árvore montada todo controle
  de 27 estados de tela, com o fundo de verdade atrás dele, nos dois temas e
  com "Reduzir movimento", e o ouvinte de `touchstart`.

**O dedo não perde o lugar.** O toque que faz nascer alguma coisa ACIMA de onde
o dedo está não pode pôr outro controle embaixo dele. Na primeira série da
sessão nascem no topo o relógio e Pausar/Encerrar (52 px): a linha da série
tocada descia e a célula de carga da mesma série caía sob o dedo; no teclado
próprio, a tecla de cima. Agora, no mesmo desenho, a página rola de uma vez
para a linha (ou o teclado) ficar onde estava. Depois de "Pular", o cartão
fecha e o nome do exercício seguinte subia para baixo do dedo; agora a página
rola para pôr ali a frase "Pulado hoje…" do próprio exercício — texto, e o
Desfazer ao lado. É rolagem, sempre um salto (ver [Movimento](#movimento)), e
depois do render(): nada do que se grava muda, nem a ordem dos toques. O que
some ABAIXO do dedo continua como é: fechar a régua sobe a linha seguinte para
onde ela estava. Medido no motor de verdade por `tests/fluxo/dedo.test.js`.

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
  mais. Sobe da borda com o quique e sai de uma vez (ver [Movimento](#movimento)).
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
| 6. Os tempos são os do app | Três movimentos com tempos e curva próprios (`--pl-dur-*`, `--pl-curva`, no bloco de tokens de `palco.css`): o pouso do aparelho (520ms, uma vez), a virada ao girar (300ms) e o painel e a régua pousando logo depois (420ms, 140ms de atraso). | Todos são estado — "chegou", "virou" —, moram no mesmo portão por adesão do app e não rodam sob `prefers-reduced-motion`; a classe do pouso e a da virada passam pela porta do movimento. |
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

**Movimento explica, e só explica** (inegociável 6). A fonte dos tempos e das
curvas é o bloco "Movimento" de [`src/tokens.css`](src/tokens.css), com o
comentário de cada token — o que é, quando usar, quando não. Os valores são as
respostas do dono de 16/10 (`docs/motion/00-coordenacao.md`).

| Token | Valor | Papel |
|---|---|---|
| `--ins-curva` | `cubic-bezier(.2, .8, .2, 1)` | o que muda no lugar: pouso, aviso, o fio da aba; e o carrossel da aba, que é andar de lado no chão e não camada (a curva que o desenho escolhido pelo dono tocava) |
| `--ins-curva-camada` | `cubic-bezier(.32, .72, 0, 1)` | a camada que entra e sai pela borda (a curva do iPhone) |
| `--ins-curva-grandeza` | `linear` | só a barra do descanso: o tempo passa linear |
| `--ins-curva-ciclo` | `cubic-bezier(.25, .1, .25, 1)` (o `ease`) | o pulso do ponto ao vivo e o véu da folha e do painel de pare acendendo (o token mais perto do `ease-out` que o dono viu) |
| `--ins-dur-lugar` | 160 ms | o que muda onde está |
| `--ins-dur-entra` · `--ins-dur-sai` | 350 ms · 350 ms | a camada que entra · que sai, pela mesma borda; o véu da folha e do pare acende em `--ins-dur-entra`; o carrossel da aba — as duas páginas juntas — e o fio com elas, em `--ins-dur-entra` |
| `--ins-dur-quique` | 640 ms | só a chegada da folha e do painel de apagar, com os quadros de `ins-quique` (passa 8 % aos 55 %, volta 3 % aos 80 %) |
| `--ins-dur-clarao` | 200 ms | só o clarão do disparo da câmera |
| `--ins-dur-dissolve` | 120 ms | só sob "Reduzir movimento": a camada que chega esmaece; o valor que pousa só acende |
| `--ins-adianta` | −17 ms | não é duração: o atraso negativo de um quadro (60 Hz) com que as fotos da transição de vista — e o fio da aba, que anda com elas — começam, para o primeiro quadro animado já mostrar a página andando (sem ele, o tempo 0 saía igual ao quadro anterior, e a troca andava dois quadros depois do antes; 07 §11.2) |
| `--ins-dur-amostra` | 250 ms | o período de `pintaTimer`, não uma duração de transição |
| `--ins-ciclo-vivo` | 2,4 s | uma volta do pulso |
| `--ins-pousa` · `--ins-sobe-aviso` | 4 px · 8 px | de quanto abaixo o valor pousa · o aviso chega |
| `--ins-barra-de-abas` | 52 px | a barra de abas sem a área segura (`--ins-tabbar` soma a área): o quanto o cronômetro e o aviso descem ou sobem quando uma troca tira ou devolve a barra |

**Os movimentos que existem.** Esta é a tabela verdadeira; cada peça do motion
acrescenta as suas linhas no mesmo commit em que entra no código.

| Movimento | Onde | O que se move | Tempo · curva | Diz | Sob "Reduzir movimento" |
|---|---|---|---|---|---|
| O fio da aba | `.ins-tab-ind` (`componentes.css`), posto pela `TabBar` | `transform: translateX(i × 20%)` de um invólucro da largura da barra; o fio é o `<i>` de dentro, com um quinto dela; anda junto com o carrossel e chega no mesmo quadro (na troca seca, a aba fora da barra, salta) | `--ins-dur-entra` · `--ins-curva` | para onde se andou | salta para a aba |
| A aba desliza (o carrossel) | as FOTOS da página inteira (`html[data-nav="aba-direita"]` e `[data-nav="aba-esquerda"]`, `::view-transition-old(root)` e `-new(root)`, `componentes.css`, "A TROCA DE ABA"), na transição de vista que o `render()` pede à porta quando a aba muda, com o sentido do ÍNDICE na barra; o cabeçalho do Agora vai com a página | a velha sai pelo lado oposto e a nova entra pelo lado para onde se andou, a tela inteira, as duas juntas e encostadas (`ins-para-esquerda` + `ins-da-direita`, ou `ins-para-direita` + `ins-da-esquerda`, `base.css`) — sem fio nem sombra: não é camada; a barra de abas tem foto própria só nesta troca e fica PARADA, com o fio andando dentro dela; o que é do aparelho, parado | `--ins-dur-entra` · `--ins-curva` | para que lado se andou entre os cinco lugares, no lugar onde o olho está (dono, 16/10, pergunta 3) | sem transição: o `<main>` que nasce com a aba (a chave é a aba) e o cabeçalho do Agora esmaecem (`ins-esmaece`, em `--ins-dur-dissolve`); a velha sai de uma vez; o fio salta |
| A barra do descanso | `#tfill` (`componentes.css`), escrita por `pintaTimer` | `transform: scaleX` | `--ins-dur-amostra` · `--ins-curva-grandeza` | o tempo passando | anda em degraus de 250 ms |
| O pulso do ponto ao vivo | `.ins-live-dot` (`base.css`) | `opacity` 1 → .25 → 1, sem fim | `--ins-ciclo-vivo` · `--ins-curva-ciclo` | a tela está viva agora | aceso e parado |
| O clarão do disparo | `.cam-clarao` (`componentes.css`), um nó por foto | `opacity` .9 → 0 | `--ins-dur-clarao` · `--ins-curva` | a foto foi tirada (lido a 3 m) | não aparece: a foto é dita pelo obturador, pela voz e pelo bloco da pose |
| O pouso da série | `.pousa.recem` (`treino.css`), o número da célula num nó próprio por valor (`pousa`, `ui/exercicio.jsx`), só sob a marca de recém do toque que grava — régua, RIR, coluna anterior, a carga do "+ série"; o teclado não (`marcaRecem`, `main.jsx`) | `@keyframes ins-pousa` (`base.css`): `translate` de `--ins-pousa` abaixo e `opacity` .4 → 1, no número e nunca no botão | `--ins-dur-lugar` · `--ins-curva` | o valor entrou AQUI | só acende: `ins-acende`, `opacity` .4 → 1, em `--ins-dur-dissolve` |
| O descanso sobe e desce | `#timer` (`componentes.css`), fora da árvore do Preact; as classes `.on` (em cena), `.sai` (descendo, segurada pelo tempo de `--ins-dur-sai` lido na porta) e `.anda` (posta pelo toque), por `poeEmCena`/`tiraDeCena` (`main.jsx`) | `translate` de `calc(100% + --ins-tabbar)` (abaixo da borda da tela) a `none`, e de volta; fora de cena `visibility: hidden` — o `translateX(-50%)` que centra fica intacto | entra `--ins-dur-entra`, sai `--ins-dur-sai` · `--ins-curva-camada`, sem quique | o descanso começou, e mora aqui embaixo; acabou | esmaece ao chegar (`ins-esmaece`, `opacity` 0 → 1, em `--ins-dur-dissolve`) e sai de uma vez |
| O toast e a faixa acompanham o descanso | `#toast`, `.ins-faixa` (`componentes.css`) | `translate` de menos a altura publicada do cronômetro (`--ins-timer-h`), que muda na hora em que ele entra ou sai | o tempo e a curva dele (`--ins-dur-entra`/`-sai` · `--ins-curva-camada`), no mesmo instante | o que estava em cima do rodapé foi empurrado pelo que chegou embaixo | vão direto ao lugar novo |
| A folha sobe | `.ins-folha` (`componentes.css`, "A CAMADA QUE CHEGA COM O QUIQUE"), no nó que nasce; a segunda e a terceira sobem por cima da primeira, que fica onde está | `@keyframes ins-quique` (`tokens.css`): `transform` de `translateY(100%)` a `-8%` aos 55 %, `3%` aos 80 % e `none` — a única ultrapassagem do app; o pé (`::after`, o mesmo fundo) cobre o vão abaixo da caixa no pico; o invólucro, que é o fixo, não se move | `--ins-dur-quique` · os trechos do quique (a declaração diz `--ins-curva-camada`) | de onde veio: de baixo, por cima de tudo | esmaece ao chegar (`ins-esmaece`, `opacity` 0 → 1, em `--ins-dur-dissolve`) e sai de uma vez |
| O véu acende | `.ins-veu` da folha e do painel de pare, cada camada com o seu | `opacity` 0 → 1 (`ins-esmaece`) | `--ins-dur-entra` · `--ins-curva-ciclo` | chegou algo por cima; os véus empilhados somam, e a profundidade fica dita pela cor | esmaece em `--ins-dur-dissolve` |
| O painel de pare chega igual à folha | `.pare` do `Pare` (as duas variantes; não o "Não guardei") | o quique e o véu, iguais aos da folha; a frase sobe inteira com o painel, legível desde o primeiro quadro | os da folha | chegou por cima, a pedido do dedo (dono, 16/10, pergunta 11) | esmaece ao chegar e sai de uma vez |
| A tela cheia e o modo chegam | a FOTO da tela nova (`html[data-nav="entra"]::view-transition-new(root)`, `componentes.css`, "A TROCA DE CAMADA"), numa transição de vista pedida pelo `render()` à porta (`trocaDeCamada`); vale para os 14 destinos, os Ajustes e o modo de sessão | `transform` de `translateX(100%)` a `none` (`ins-da-direita`, `base.css`): a tela inteira, da borda direita, com um fio de 1 px (`--ins-fio`) na borda esquerda dela, fora da foto; a de baixo PARADA (a foto velha não anima) | `--ins-dur-entra` · `--ins-curva-camada`, sem quique | de onde veio: da direita, por cima do lugar, que continua lá (dono, 16/10, perguntas 4 e 5) | sem transição: a tela cheia e o modo esmaecem no nó que nasce (`ins-esmaece`, em `--ins-dur-dissolve`) |
| A tela cheia e o modo saem | a foto da tela velha (`html[data-nav="sai"]::view-transition-old(root)`), por cima da que reaparece — que já nasce na rolagem de onde se entrou; pela seta, pelo "‹ Voltar", pelo Esc e pelo Voltar do sistema | `transform` de `none` a `translateX(100%)` (`ins-para-direita`), com o mesmo fio | `--ins-dur-sai` · `--ins-curva-camada` | para onde foi: o lugar estava lá embaixo | sai de uma vez |
| A folha e o painel de apagar descem | as fotos `folha-N` (o nome é a POSIÇÃO na pilha, no `style` da `Folha`; nunca o nível, que se repete) e `painel`, só a foto velha sem nova (`:only-child`): a folha que fica aberta debaixo de outra não se move | `transform` de `none` a `translateY(100%)` (`ins-desce`) — sem quique, nenhuma saída quica | `--ins-dur-sai` · `--ins-curva-camada` | para onde foi: de volta à borda de baixo | sai de uma vez |
| O véu apaga | as fotos `veu-N` e `veu-painel`, com a folha e o painel que descem | `opacity` 1 → 0 (`ins-apaga`) | `--ins-dur-sai` · `--ins-curva-ciclo` | a camada de cima acabou | sai de uma vez |
| O cronômetro e o aviso mudam de altura com a troca | o par de imagens das fotos `cronometro` (só com o cronômetro em cena) e `aviso`, quando a troca tira a barra de abas (chega uma tela cheia ou o modo: `html[data-pe="desce"]`) ou a devolve (`data-pe="sobe"`), posto pela porta a pedido do `render()` | `translate` vertical da altura da barra (`--ins-barra-de-abas`) até `none` (`ins-rodape-desce`, `ins-rodape-sobe`, `base.css`) — só na vertical: não andam de lado com as páginas | `--ins-dur-entra` / `--ins-dur-sai` · `--ins-curva-camada` | continuam do aparelho; a reserva do rodapé mudou junto com a troca (antes, saltavam 52 px no primeiro quadro; 07 §11.3) | sem transição: vão ao lugar novo no mesmo desenho que a troca |
| A bancada: pouso, painel e régua, virada | `palco.css`, `palco.js` | `transform` e `opacity` | `--pl-dur-*` · `--pl-curva` | chegou; virou | nada |

**O que fica sem movimento**, de propósito: o toque, que só escurece e troca na
hora (é estado: ver [Toque](#toque); `--ins-dur-toque` saiu com o afundar); o
painel que nasce sob o polegar
(régua, teclado, RIR) — alvo que se move sob o dedo é alvo errado; o número
digitado tecla a tecla no teclado próprio, que não pousa (o olho está no visor,
e pousar cada dígito seria cintilar); os números
derivados (contador, volume, kcal), que não rolam; o fim do descanso, cujo
canal é o som e o "vai" (o cronômetro fica onde está); um descanso que
substitui outro, que troca no lugar; a abertura do app — o descanso que estava
correndo volta no lugar, sem subir — e o giro do telefone; o que é do
aparelho durante uma troca de camada — o cronômetro, o aviso curto, a faixa da
sessão e a faixa "Não guardado" têm foto própria e ficam parados enquanto as
páginas passam por baixo (o que sai da tela sai de uma vez; o que chega aparece
no lugar), e a barra de abas fica com o lugar — na troca de ABA ela ganha foto própria e fica parada enquanto as páginas passam, com o fio andando dentro dela; a aba que não está na barra (`vaiPara('treino')`), que troca seca, porque não há para que lado andar; o Voltar que o navegador já
animou (o gesto de borda do iPhone, `hasUAVisualTransition`), que o app não anima
de novo; a primeira tela, que nunca anima; a folha que toma o lugar da de cima ("cadastrar", `trocaFolha`),
que nasce no lugar — a camada não se move, só o conteúdo troca; o aviso "Não
guardei", que chega sozinho e é meia tela em tinta de pare (uma subida faria os
botões varrerem a zona do polegar); e toda rolagem
programática, que é sempre um salto (`instant`) — a rolagem suave é do
navegador, sem token de tempo nem de curva, e roda na thread que o `render()`
ocupa (`docs/motion/04-desempenho.md` §1.6).

**O toque chega ao que o dedo mirou.** Um toque no meio da subida da folha ou
do painel se perdia nos dois motores: o dedo descia no × e o clique saía no
cabeçalho, porque a camada andou entre descer e soltar (o Safari do iPhone
cancela o toque quando o nó sob o dedo muda). Na peça 4 o dedo SEGURAVA a
camada (pausava a chegada), e no Chromium a pausa recuava a folha um quadro;
desde a peça 5 nada pausa: o clique de um toque que desceu numa camada que
ainda chega vai ao nó em que o dedo desceu (`miraSobODedo`, `folha.jsx`, e
`miraDoDedo`, na porta), e a subida segue o caminho dela. Durante uma troca de
camada (a transição de vista) o alvo de todo toque é a raiz: o `pointerdown`
PULA para o fim (`skipTransition()`), o desenho novo entra na hora, e o clique
vai ao que ficou sob o dedo — sozinho, quando o navegador acha o alvo de novo, ou
reenviado pela porta. O mesmo no carrossel da aba: a barra está parada, e o toque
rápido em outra aba no meio da troca acerta a aba que o dedo vê. Nada espera: o
clique age na hora, e nada escuta o fim de uma transição.

**A troca de camada mora num ponto só, e a rolagem e o foco vão dentro dela.**
O `render()` (`main.jsx`) compara as camadas desenhadas com as que `view` pede
(e a aba desenhada com a pedida) e, quando uma tela cheia ou o modo chegam ou
saem, uma folha ou o painel de apagar fecham, ou a aba muda, desenha dentro de
uma transição de vista: o navegador fotografa
a tela de agora e chama o desenho ~1 quadro depois (o quadro a mais que o dono
aceitou, pergunta 6). Enquanto o desenho está pendente, `render()` não faz nada
— dois seguidos viram uma troca só, no sentido da primeira —, e toda rolagem
pedida nesse meio entra DENTRO do desenho novo (`rola`), que já nasce na
posição: desenha, depois rola, em todo fecho (o Corpo que entrou no modo a 1982
px voltava a 1091) e em toda troca de aba (a aba nova abre no topo, e a foto da
que sai fica onde estava). Ao entrar, o título do destino e o do modo recebem o foco no
mesmo desenho; ao sair, o foco volta ao controle que abriu (achado de novo pela
chave dele) ou ao título da tela que reaparece — nunca ao `body`. E quando um
desenho que não troca camada tira da página o controle que tinha o foco (a aba
que troca, sob "Reduzir movimento" o segundo desenho do "Ir para Semana"; o
treino aberto na lista do Programa), o foco vai ao título da tela desenhada.
Toda foto que anda começa um quadro adiante (`--ins-adianta`): o primeiro
quadro é a foto da tela velha, e o primeiro animado já mostra a página andando.

**A camada de cima é a única alcançável.** A folha, o painel de pare e o "Não
guardei" isolam o resto com `inert`, pelo mesmo mecanismo (`abreCamada`,
`folha.jsx`), derivado da camada de cima — o pare (90) sobre o aviso (88) sobre
as folhas —, e o isolamento inclui o cronômetro, que mora fora do `#app`. Ao
fechar, o foco volta a quem o tinha. E o "Não guardei" só aceita o toque que
começou nele, e pelo menos `JANELA_DO_AVISO_MS` (400 ms) depois de chegar: o
toque que já vinha para outra coisa não o fecha antes de lido (o teclado age
na hora).

**Só `transform` e `opacity`** — e as propriedades individuais `translate` e
`scale`. Tudo o mais refaz layout ou pintura a cada quadro e congela quando a
thread trava: o fio da aba andava em `left`, 14 layouts e 26 pinturas por troca
contra 1 e 3 em `transform`, e parava 320 ms com a thread presa. O centrado por
`translateX(-50%)` (`#toast`, `#timer`, `.ins-faixa`) só se move pela
propriedade `translate`, que não desfaz o centramento. E nada que contenha um
fixo (`html`, `body`, `#app`, `.ins-modo`) ganha `transform`, `filter` ou
`will-change`: o fixo passaria a rolar com o pai. Por isso o quique é da caixa
da folha e do pare, e nunca do invólucro deles, que é o fixo.

**O portão.** Todo `transition` e `animation` mora dentro de
`@media (prefers-reduced-motion: no-preference)`, ao lado da regra que ele
move, e **fora do bloco o elemento já está no último quadro** — é o que vê quem
pediu menos movimento e quem tem navegador sem a media feature. Sob `reduce` a
única alternativa deliberada é esmaecer (só `opacity`, só `--ins-dur-dissolve`),
e só onde sem a preferência há movimento. O JavaScript pergunta a uma porta só,
`src/ui/movimento.js` (`podeMover()`, `podeDissolver()`, `tempo(nome)`), lida na
hora e respondendo "não" quando não sabe; ela é o único lugar que pode falar
com o aparelho sobre movimento, chamar `startViewTransition` ou `.animate()`.

O bloco universal de `base.css` (`*` com `!important` sob `reduce`) **saiu** em
16/10: engolia o evento de fim de transição, não alcançava o JavaScript nem os
pseudo-elementos de transição de vista, proibia o esmaecer e discordava do
princípio 6, que já dizia "adesão". O que ele protegia — o movimento esquecido
não chegar a quem pediu menos — passou para a guarda, que fica vermelha antes do
aparelho.

**O pulso descumpre o critério 2.2.2 da WCAG, por decisão do dono.** O critério
pede que movimento que dura mais de cinco segundos possa ser pausado. O pulso do
ponto ao vivo roda sem fim enquanto a tela está viva; a recomendação do time
era duas voltas e o ponto aceso, e o dono escolheu em 16/10 (pergunta 12) que
ele pulse para sempre, como sempre pulsou. Quem liga "Reduzir movimento" vê o
ponto aceso e parado.

**A barra sob `reduce` anda em degraus de 250 ms**, e é assim que fica: quem
liga a chave pediu para não interpolar, e inventar uma amostragem especial seria
movimento novo para resolver um problema que ninguém mediu. O número ao lado
continua exato.

**A guarda.** `tests/dominio/estilo.test.ts`, seção "O movimento", lê as folhas
regra a regra com a pilha de `@media`: (a) tempo e curva só nascem nos tokens, e
ultrapassagem só no quique; (b) todo movimento mora no portão e, fora dele, o
elemento está no último quadro, e o JavaScript só move pela porta; (c) só
`transform`, `translate`, `scale` e `opacity` se movem; (d) nada entre um fixo e
a janela cria bloco de contenção — com a lista de ancestrais conferida na árvore
montada por `tests/fluxo/movimento.test.js`; (e) nada escuta o fim de uma
animação; (g) o quique é só da caixa da folha e do pare, o véu acende no tempo
da camada, sob "Reduzir" os quatro só esmaecem, e nada mais da pilha se move;
(h) a troca de camada move só as fotos — a tela que chega e a que sai, a folha
e o painel que descem, os véus —, a de baixo fica parada, nada quica, e só o
que é do aparelho tem nome — e o cronômetro e o aviso só mudam de altura, quando
a troca tira ou devolve a barra de abas —; toda foto que anda começa um quadro
adiante; fora do portão as fotos não animam; (i) a aba
desliza a página inteira, as duas fotos juntas, no sentido do índice, em
`--ins-dur-entra` na `--ins-curva`, o fio anda junto no mesmo tempo e na mesma
curva, a barra só tem nome nessa troca e não se move, e sob "Reduzir" só o que
nasce com a aba esmaece.

**O que já foi recusado, e o que caiu.** Mola e ultrapassagem continuam fora de
tudo menos do quique (decisão do dono, 16/10). Comemoração, esqueleto que
cintila, altura animada e conteúdo deslizando dentro de uma tela continuam
recusados, cada um com o motivo em `docs/design-review/05-movimento.md`. Caíram
"nada de animação de entrada" (para camada; fica para conteúdo), "nada de fade"
(fica para usos nomeados — o véu da folha, o aviso que apaga e o esmaecer sob
"Reduzir movimento" —, e a peça que precisar de outro o nomeia aqui) e a recusa
da transição entre abas, que o dono reabriu como carrossel.

**Movimento novo entra nesta tabela, com a função que cumpre, antes de entrar
no código.** A rolagem suave entrou sem que ninguém citasse a regra (`02077e3`);
seis dias depois, outra rolagem foi recusada justamente por citá-la
(`mostraExercicio`). A regra ficou, e agora tem guarda.

## Estado de retirada

Concluída. O sistema antigo (azul-marinho + âmbar, Archivo, cartões com raio)
saiu do projeto: `src/app.css` foi apagado em `6f4dd12`, a ponte global de
handlers morreu em `3283495`, e `minify` e `treeshake` estão ligados no build.
A última sobra era a própria Archivo, ainda baixada pelo `index.html` sem ser
usada por regra nenhuma. `tests/dominio/estilo.test.ts` cobra que a paleta
antiga não volte, nem por apelido.
