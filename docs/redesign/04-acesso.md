# 04 · Acesso e corpo — C e D medidos

Quem escreve é C3. O mandato é um só: **medir** as duas direções sobreviventes
contra a WCAG 2.2 AA e contra o corpo que o `02-uso.md` descreve, e dizer o que
precisa mudar para cada uma existir. Não redesenho, não escolho entre C e D e
não cancelo exigência nenhuma.

**Onde medi.** Nos quatro HTML: `03-direcao-C/momento-1.html`,
`03-direcao-C/momento-2.html`, `03-direcao-D/momento-1.html`,
`03-direcao-D/momento-2.html`. Contraste é conta sobre cor declarada, alvo é
medida em px, ordem de foco é leitura do DOM. Nenhuma afirmação aqui vem do
texto das direções sem que eu tenha conferido no desenho; onde a direção afirma
um número, eu digo se o número confere.

**Fontes.** F = `01-fatos.md`. U, K, D, M = `02-uso.md`. P = resposta do dono em
`02-perguntas.md`. "Medi" = a medição descrita na seção 0. Onde não há medida,
está escrito **não medido**.

---

## 0 · Como medi

**A ferramenta.** Chromium (`/usr/bin/google-chrome`) guiado por
`playwright-core`, com scripts escritos no diretório de rascunho da sessão —
nada fora deste arquivo foi criado ou alterado no repositório.

**A viewport.** Os arquivos têm um script próprio que encolhe o quadro do
telefone para caber na janela, com alcance diferente nas duas direções: na **D**,
`fit()` escala **todos** os telefones (`p.style.transform='scale('+s+')'`, m1
linha 878); na **C**, só os dois quadros de paisagem (`[data-land]`, m1 linha
837) — os telefones em retrato da C usam `width:100%;max-width:414px` e não são
escalados. Medir em cima do encaixe dá número errado: na primeira passada os
botões de repetição da D saíram com 23 × 27 px, que é 0,426 do tamanho
declarado. Então **neutralizei o encaixe** (`.phone{transform:none}`) e medi com
a janela larga, o que faz cada `.phone` valer os 414 × 896 px que ela declara —
a área útil do iPhone 11 Pro Max em retrato (F49). Conferi que nenhum dos quatro
arquivos tem regra `@media` de largura que mexa no conteúdo do app: a única da C
é `min-width:480px`, e só acrescenta a moldura e a sombra do aparelho. Todos os
números deste arquivo são da medição com o encaixe neutralizado.

**O contraste.** Luminância relativa da WCAG 2.x sobre o **fundo efetivo**: subo
a árvore de ancestrais compondo cor de fundo com alfa e com `opacity`
acumulada, até a primeira cor opaca. Limiares: 4,5:1 para texto normal, 3:1 para
texto grande (≥ 24 px, ou ≥ 18,66 px em peso ≥ 700), 3:1 para não-texto
(1.4.11). Componente inativo entra na exceção da norma e está marcado como tal.
Medi **os dois temas**: claro, e escuro por `data-theme="dark"`.

**O alvo.** Caixa de contorno de `button`, `a[href]`, `input`, `[role]` e
`[tabindex]` dentro de `.phone`, com a **exceção de espaçamento do 2.5.8**
calculada: distância do centro do alvo à caixa do alvo vizinho mais próximo.
Separo os dois limiares, porque eles são critérios diferentes:

- **2.5.8 Target Size (Minimum) — AA — 24 × 24 px.** É a norma que vale aqui.
- **2.5.5 Target Size (Enhanced) — AAA — 44 × 44 px.** Não é AA. É também a
  recomendação da Apple para toque, e é o número que o corpo deste uso cobra
  (seção 4).

**O foco.** Foquei um por um todos os elementos focáveis dentro dos telefones e
li o `outline` e o `box-shadow` computados.

**O que um protótipo não pode provar.** Três coisas que medi e **descartei** como
defeito de direção, porque são do protótipo e não do desenho:

1. **Hierarquia de títulos.** Dentro de cada telefone o primeiro título é `h3`
   (C) ou `h3`/`h4` (D), porque o telefone está aninhado numa galeria cujo `h1`
   e `h2` são da página de apresentação. Num app isso seria `h1`.
2. **Destino dos links.** A barra de lugares da C usa `<a href="#m1">`, que é
   âncora da galeria.
3. **Transbordo horizontal da régua.** Dez elementos da D m1 saem pela direita
   do telefone; todos estão dentro de um contêiner de rolagem horizontal, o que
   é a régua funcionando, não corte. Conta para a seção 3.5, não como corte.

---

## 1 · O que as duas passam, com o número

Isto não é cortesia. A onda 3 existe para achar defeito, e o modo de falha 6 do
briefing é "chegar ao detalhamento com alvo pequeno e contraste reprovado". Nos
dois casos, **não é o que está no disco.** As duas direções trataram acesso como
estrutura, e dá para provar.

| o que medi | C | D |
|---|---|---|
| telefones desenhados | 24 (13 em M1, 11 em M2) | 27 (14 em M1, 13 em M2) |
| elementos com texto medidos | 725 | 801 |
| controles ativos medidos | 218 | 307 |
| **1.4.3** reprovações de contraste de texto | **0** | **0** |
| **2.5.8** alvos abaixo de 24 px | **0** | **0** |
| **2.4.7** focáveis sem anel de foco | **0** de 218 | **0** de 307 |
| `tabindex` positivo | 0 | 0 |
| bloqueio de zoom (`user-scalable=no`) | não | não |

**1.4.3 Contraste (mínimo) — passa nas duas, nos dois temas.** Nenhum dos 1 526
elementos com texto medidos reprova. O piso que medi: na C, `--muted #5D594F`
sobre `--paper #F5F2EB` = 6,25:1; na D, `--ink-3 #5C6169` sobre `--surface-2
#EDEAE3` = 5,19:1. Os únicos textos abaixo do limiar estão em componente
inativo, que a norma excetua: na C, `.arrow[disabled]` a 1,38:1 (9 ocorrências);
na D, os 8 botões de `.strip.off`, `disabled`, a 2,41:1. Os dois casos voltam na
seção do corpo, porque a exceção da norma não é exceção do olho.

**Os números que as próprias direções afirmaram, conferidos.** A C diz que "o
tracejado do lápis tem 3:1 ou mais contra o fundo": medi **3,55:1** no claro
(`--ghost #857F74` sobre `--paper`) e **5,25:1** no escuro. Confere. A D diz
"texto secundário: 5,1:1 ou mais": o piso que medi é **5,19:1**. Confere. A D diz
"borda dos controles: 3,3:1 ou mais no claro": medi `--line-2 #8C867A` a 3,26:1
sobre `--bg`, 3,62:1 sobre `--surface` e **3,01:1 sobre `--surface-2`** — passa
o 3:1 da norma em todos, mas o pior caso é 3,01 e não 3,3. A C diz que "o texto
sobre a hachura tem fundo liso": confere, e está no CSS (`.row.hatch time,
.row.hatch .w strong, .row.hatch .w span{background:var(--paper)}`, m1 linha
230) — nenhum texto de linha hachurada fica sobre as listras.

**Mais, nas duas:**

- **2.4.3 Ordem do foco.** Zero `tabindex` positivo nos quatro arquivos; a ordem
  do DOM é a ordem de leitura.
- **2.4.7 Foco visível.** As duas declaram `:focus-visible{outline:3px solid …;
  outline-offset:2px}` e nenhuma tem regra `outline:none`. Dos 525 focáveis
  medidos, 525 recebem anel.
- **1.4.4 / 1.4.10.** Nenhuma põe `maximum-scale` nem `user-scalable=no`. As duas
  usam `text-size-adjust:100%`, que só desliga a inflação automática do Safari e
  não impede o usuário de ampliar.
- **2.5.1 Gestos de ponteiro.** Zero `input[type=range]`, zero multitoque, zero
  `draggable`. `touch-action:manipulation` está só nos botões: mata o zoom por
  toque duplo em cima do botão (F62) sem matar a pinça, que é o que 1.4.4 pede.
- **3.1.1 Idioma.** `lang="pt-BR"` nos quatro.
- **2.3.1 Três piscadas.** A única animação infinita é o cursor de texto do
  teclado próprio da C, a 1 Hz — abaixo dos 3 Hz do critério.
- **3.3.1 Identificação de erro.** As duas põem `role="alert"` em todo painel de
  falha (C: 3; D: 2) e dizem a causa em palavra, não em código.
- **1.3.4 Orientação.** As duas desenham o estado paisagem (F60).

**Movimento.** A D põe **todo** o movimento dentro de
`@media (prefers-reduced-motion:no-preference)` — `pulse`, as transições de
`.rep/.rir/.chip/.sec/.primary`, o `scale(.95)` do toque, o `enter` e o
`transition:width 1s` da barra de descanso (m1 linhas 220–228). Com "reduzir
movimento", a tela fica parada. A afirmação da D confere, e é o padrão certo
(opção por adesão, não por exclusão). A C é quase isso: `.caret` (piscada
infinita) e `.set.fresh` (`animation:ink .5s`) são declarados sem condição e
desligados no bloco `reduce` (m1 linha 253) — mas `.chip{transition:background
.15s,color .15s,transform .1s}` fica **fora** do bloco `reduce`. Com "reduzir
movimento" ligado, o botão de repetição da C ainda escala ao toque. É 2.3.3
(AAA), não AA, e a C afirma que "as transições são curtas e somem com reduzir
movimento" — somem duas de três.

---

## 2 · Direção C · Previsto e feito

### 2.1 O que já passa

Tudo o que está na seção 1, mais:

- **2.5.8 e 2.5.5 quase juntos.** Dos 218 alvos ativos, o menor é 40 × 44 px
  (`.gb`, "Mais: pular, mudar só hoje…"). **Um** alvo em 218 fica abaixo de
  44 px, e em uma dimensão só. Altura mediana: 54 px em M1, 48 px em M2. Os
  botões de repetição medem 49 × 64 e 52 × 64 px, o RIR 56 × 44, as teclas do
  teclado próprio 123 × 54, a fileira de dias 50 × 54. **Isto é o que o corpo
  pede** (F28) e é a coisa mais bem resolvida da direção.
- **1.1.1 e 1.3.1 nos gráficos.** Os dez gráficos sem texto da C têm
  `role="img"` **com rótulo escrito**, e o rótulo carrega o número: "Séries da
  sessão: 9 feitas de 20", "10 de 20 séries feitas, mais uma extra em
  andamento", "Últimos 14 dias: 9 conhecidos, 5 sem marca", "Últimos 14 dias:
  9 conhecidos; sexta saiu da conta". Zero `<svg>` sem nome no arquivo, porque
  a C não usa `<svg>`. Isto resolve, para leitor de tela, exatamente o dado que
  a régua do nutricionista precisa (F213).
- **4.1.3 Mensagens de estado — passa.** A C tem região viva em cada momento: em
  M1, `<p class="vh" aria-live="polite" data-say>` (linha 403) mais dois
  `role="alert"`; em M2, a mesma região viva mais **três** `role="status"` nos
  avisos de gravado — "Lanche marcado: tudo, às 15:34. Gravado neste aparelho.
  Desfazer", "Terça conta para a regra…", "Sexta saiu da conta: 10 → 9 de 14" —
  e um `role="alert"` no erro. O ato que acontece 48 vezes por semana (U1, P1-B)
  é anunciado.
- **Grupos rotulados.** `role="group"` com rótulo em todo telefone, no RIR
  ("RIR desta série, opcional"), no teclado ("Teclado numérico") e na fileira de
  dias ("Escolher o dia").
- **A régua de repetição não exige rolagem.** Medi: 7 botões, `scrollWidth` 382
  igual ao `clientWidth` 382, `overflow:visible`. **7 de 7 valores alcançáveis
  sem arrastar.** Na fileira de dias de M2, 7 de 7 visíveis (`scrollWidth` 418
  contra 414 — 4 px, dentro do raio do dedo). Isto importa: é uma mão só (F28).

### 2.2 O que reprova

**R-C1 · 1.4.11 Non-text Contrast — 119 controles com limite desenhado e
imperceptível. É a reprovação grave da C.**

Medi, para cada controle ativo, o contraste da borda contra o fundo onde ela
está desenhada e o contraste do preenchimento contra o mesmo fundo. Dos **170
controles que desenham um limite** (os outros 48 são só texto, e para esses o
critério não pede limite), **119 têm os dois canais abaixo de 3:1** — 84 em M1 e
35 em M2, **igual nos dois temas**. A causa é um token só: `--line`, que é
`#D6CFC2` no claro e `#3A3731` no escuro.

| controle | tamanho | borda medida | preenchimento medido |
|---|---|---|---|
| `.chip` — os botões de repetição (27×) | 49 × 64 / 52 × 64 | 1,55:1 | **1,00:1** |
| `.kp button` — o teclado próprio (13×) | 123 × 54 | 1,55:1 | 1,12:1 |
| `.rir button` — o RIR (10×) | 56 × 44 | 1,27:1 | 1,22:1 |
| `.pill` (8×) | 72 × 44 | 1,38:1 | 1,12:1 |
| `.secondary` (8×) | 187 × 48 | 1,55:1 | 1,12:1 |
| `.load` (7×) | 382 × 60 | 1,55:1 | 1,12:1 |
| `.gb` (7×) | 40–182 × 44 | 1,38:1 | 1,12:1 |
| `.btn.line` (6×) | 114–382 × 44–50 | 1,38–1,55:1 | 1,00–1,12:1 |
| `.daystrip button` (6×) | 50 × 54 | 1,38:1 | 1,09–1,12:1 |
| `.choice button` (4×) | 91 × 44 | 1,55:1 | 1,00:1 |

Três coisas que fazem disto reprovação e não detalhe:

1. **O preenchimento de `.chip` é 1,00:1.** `.chip{background:var(--card)}` e
   `--card` é `#FFFFFF`; o cartão em que ele está também é `#FFFFFF`. Branco
   sobre branco. O botão mais tocado do produto — 48 séries por semana (P1-B),
   o número que pôs M1 na lista (M1) — **não tem limite perceptível nenhum**: a
   borda dá 1,55:1 e o preenchimento dá 1,00:1. Quem acha o botão acha pelo
   algarismo, não pelo alvo.
2. **A hierarquia está invertida.** `.chip.out` — os valores **fora** da faixa
   prevista — usa `border-style:dashed; border-color:var(--ghost)` e mede
   **3,55:1**: passa. Os valores **dentro** da faixa, que são os que ele vai
   tocar, usam `--line` e medem 1,55:1. O desenho deu o limite forte ao botão
   improvável e o limite invisível ao provável.
3. **O teclado que a direção construiu para ser mais seguro é o pior caso.** A C
   recusa o teclado do sistema por três fatos (F63 vírgula, F65 cobre metade da
   tela, F66 sobe por cima) e põe no lugar um teclado próprio de 14 teclas de
   123 × 54 px cuja única separação entre teclas é uma linha de 1 px a 1,55:1.
   Treze teclas sem limite perceptível, para digitar carga com a mão suada.

Nota de honestidade sobre o critério: há auditor que lê o 1.4.11 como "se o
controle não precisa de limite visual, não há o que medir" e marcaria estes como
não aplicáveis, porque o rótulo identifica o controle. Eu não aceito essa leitura
aqui, por um motivo de fato: **o desenho escolheu desenhar o limite.** Ele está
lá, em 1 px a 1,5 px, em 170 controles. Um limite desenhado e não perceptível é
pior que nenhum, porque promete uma borda de alvo que o olho não acha. E o
argumento de "a tela do telefone é brilhante" não está disponível: **01-fatos
diz, nas ausências, que a luz da academia não é conhecida** (linha 1474).

**R-C2 · 1.4.11 — a hachura, que é o canal do E3, mede 1,48:1.**

A hachura é `repeating-linear-gradient(135deg, rgba(120,113,100,.32) 0 1.5px,
transparent 1.5px 7px)`. Composta sobre `--paper #F5F2EB`, a listra fica
`rgb(205,201,192)`: **1,48:1 contra o fundo** no claro, **1,67:1** no escuro. É
o canal visual com que a C diz "sem marca" — o estado que o E3 exige marcar.
Onde a hachura tem palavra ao lado, isto não derruba nada. Onde não tem, derruba:

- **`.cells i.u` — os 14 quadradinhos da regra do nutricionista.** 14 px de
  altura, sem texto, `background-image:var(--hatch)` mais `border:1px solid
  var(--line)` a 1,38:1. O estado "sem marca" desses quadradinhos é dito por
  **uma textura a 1,48:1 e uma borda a 1,38:1, e por nada mais no pixel**. O
  quadradinho "conhecido" (`.cells i.k`, preenchido com `--ink`) mede 9,99:1,
  então dá para contar os escuros; o que não dá é ver quantas casas existem. Em
  14 dias, saber que são 14 é o dado (F213).
- **`.daystrip button.u`** — 50 × 54, a fileira com que se escolhe o dia do pôr
  em dia (U11, 3,25 registros por semana em P1-B): o estado "sem marca" do dia é
  a mesma hachura a 1,48:1 sobre uma borda a 1,38:1.

O que salva parcialmente: o `role="img"` com o rótulo escrito (seção 2.1) dá o
número a quem usa leitor de tela, e a C escreve "9 de 14" ao lado. Então a
**informação** existe em palavra; o que reprova é o **objeto gráfico**, que o
1.4.11 cobra a 3:1 quando ele é necessário para entender o conteúdo.

**R-C3 · 4.1.2 Name, Role, Value — o lugar em que se está não é programático.**

`grep -c aria-current` nos dois arquivos da C dá **0**. A barra de lugares é
`<nav class="tabs" aria-label="Lugares"><a class="on" href="#m1">Hoje</a><a
href="#m1">Semanas</a><a href="#m1">Prescrição</a></nav>`. O lugar ativo é dito
por `class="on"`, que no pixel vira uma barrinha de 3 × 22 px mais a cor
`--ink-text` — dois canais, o que é certo para 1.4.1 — e **nada** para leitor de
tela. Quem navega por voz ouve três links iguais. A D faz isso certo
(`aria-current="page"`), o que mostra que não é limitação do modelo.

**R-C4 · 2.3.3 (AAA) — o bloco `reduce` está incompleto.** `.chip`'s
`transition:transform .1s` sobrevive a "reduzir movimento". Fica registrado como
desvio da própria afirmação da direção, não como reprovação AA.

**Contagem da C: 3 reprovações em AA (R-C1, R-C2, R-C3) e 1 em AAA (R-C4).**
R-C1 é 119 instâncias de um token; R-C2 são 2 famílias de objeto gráfico; R-C3 é
uma, estrutural.

### 2.3 O que o corpo cobra da C, além da norma

- **O limite do alvo, não só o tamanho.** A C ganha no tamanho (menor alvo
  40 × 44, mediana 54) e perde no limite (1,00 a 1,55:1). Para uma mão suada, de
  pé, logo depois do esforço (F28), o alvo de 64 px só vale se o olho souber onde
  ele começa. A norma AA não cobra o limite de um botão com rótulo; **o corpo
  cobra**, e cobra justamente nos 27 `.chip` e nas 13 teclas.
- **A seta do dia desabilitada a 1,38:1.** `.arrow[disabled]{color:var(--line)}`
  — a norma excetua componente inativo, e eu não conto como reprovação. Mas o
  "dia seguinte" desabilitado, a 1,38:1, num aparelho cuja luz de uso não é
  conhecida (01-fatos, linha 1474), é um controle que desaparece em vez de se
  anunciar indisponível. O pôr em dia (U11) se faz andando por dias; saber para
  que lado não dá mais é parte do caminho.
- **A hachura a 1,48:1 e o olho cansado.** O E3 só existe se o estado for visto.
  A 1,48:1, a 14 px de altura, depois do esforço, a hachura é uma ausência, não
  uma marca.

---

## 3 · Direção D · O previsto já está escrito

### 3.1 O que já passa

Tudo o que está na seção 1, mais:

- **1.4.11 nos controles — passa, e é o contrário da C.** Todo controle com
  borda da D usa `--line-2` (`#8C867A` claro, `#7C818A` escuro): **3,26:1** sobre
  `--bg`, **3,62:1** sobre `--surface`, **3,01:1** sobre `--surface-2`; no escuro,
  4,79:1 e 4,31:1. `.rep` (54 × 64), `.chip`, `.pill` e `.load` todos passam.
  O token fraco `--line` (1,29:1 / 1,43:1) está reservado a divisórias e bordas
  de cartão (`.card`, `.band`, `.dl li`, `.ref th/td`, `.sh`, `.tabbar`), que não
  identificam controle. **A separação dos dois tokens é a melhor decisão de
  acesso das duas direções**, e é exatamente a que falta na C. (Os controles da
  D que **não** desenham borda são outra história: ver R-D7.)
- **O destaque, medido.** `--accent #3833DB` dá 7,11:1 sobre `--bg` e `#FFFFFF`
  sobre ele dá 7,88:1. O previsto não depende de distinguir matiz.
- **E3 com três canais e o canal gráfico acima de 3:1.** Os 14 quadradinhos da D
  (`.cell`, **22 px** de altura contra os 14 px da C) distinguem estado por
  **forma**, não por textura fraca: `sem marca` = `border:1.5px dashed
  var(--ink-3)` a **5,62:1**; `comi tudo` = preenchido com `--ink`; `metade` =
  borda sólida mais `linear-gradient(to top, var(--ink) 50%, transparent 50%)`,
  isto é, meio cheio; `hoje` = anel de 4 px em `--accent`. Mais a conta escrita
  — "Dias com marca nos últimos 14: 1. A regra precisa de 11." — e mais uma
  legenda de 6 itens (`<ul class="legend" aria-label="Formas de estado">`) em que
  cada forma vem com a palavra: "comi tudo", "metade", "fora do plano", "sem
  marca: desconhecido, não zero", "agora", "ainda por vir". **O E3 da D passa
  por forma, por palavra e por número, com o canal gráfico a 5,62:1.**
- **`aria-current="page"`** na barra de lugares, com rótulo `aria-label="Lugares"`
  e 4 itens de 104 × 50 px.
- **Grupos de rádio rotulados onde estão rotulados.** Em M2, seis `.seg` carregam
  `role="radiogroup"` com o nome da refeição — "Pré-treino", "Treino", "Café",
  "Almoço", "Lanche", "Jantar" — e 26 filhos com `role="radio"`. Quando está
  feito, está bem feito.
- **2.2.1 / 4.1.3 no cronômetro.** `.rest` tem `aria-live="off"`: o descanso não
  fala a cada segundo. É a decisão certa e a direção a afirma; confere.
- **Alvos.** Dos 307 ativos, zero abaixo de 24 px. `.rep` 54 × 64, `.rir` 52 × 56,
  `.primary` 56 de altura, `.tab` 104 × 50, `.seg button` 68 × 44.

### 3.2 O que reprova

**R-D1 · 4.1.3 Mensagens de estado — a série guardada não é anunciada. É a
reprovação grave da D.**

Em M1, o aviso de gravação é:

```
<div class="saved enter"><svg class="ico"><use href="#ck"/></svg><span class="t">Série 2
guardada neste aparelho · <b class="num" data-k="val">45 × 10</b> <em data-k="delta">+1
rep</em></span><button class="lk" data-a="undo">Desfazer</button></div>
```

(m1 linhas 357 e 460.) É um `<div>` comum: **sem `role="status"`, sem
`aria-live`, sem `aria-atomic`**. Varri `momento-1.html` inteiro: as únicas
regiões vivas são `.rest` com `aria-live="off"` (de propósito, e certo) e um
`role="alert"` no erro de armazenamento. Resultado medido: **o ato mais frequente
do produto não tem anúncio.** São 48 séries por semana em P1-B (P1), cerca de 16
por sessão, a situação que a vida apresenta mais vezes (M1, §9 do 02-uso) — e
quem usa leitor de tela toca "10" e não ouve nada. Pior: o `Desfazer` que corrige
o toque errado mora dentro desse div e também não se anuncia, então a correção
que a direção oferece não chega a quem mais precisa dela.

A D m2 **faz certo** no mesmo arquivo-irmão: a leitura de volta é
`<div class="rb" aria-live="polite">…VAI FICAR REGISTRADO…</div>` (m2 linha 536).
Então não é limitação do modelo: é um lugar em que o M1 não recebeu o que o M2
recebeu. Comparação direta: C declara 3 regiões vivas em M1 e 5 em M2; D declara
2 e 2, e a de M1 está desligada por projeto.

**R-D2 · 1.1.1 Non-text Content — 178 `<svg>` sem nome e sem `aria-hidden`.**

Medi: `momento-1.html` tem 54 `<svg>` inline, `momento-2.html` tem 124. **Nenhum
dos 178** tem `aria-hidden="true"`, `<title>` ou `aria-label`. Dos 178, **102**
(31 em M1, 71 em M2) não estão dentro de um controle com nome — são soltos, como
os 6 ícones da legenda de formas, o ✓ do aviso de gravado, o ícone de aviso de
dor e os ícones da barra de lugares. Os outros 76 estão dentro de botão com
rótulo, o que atenua mas não resolve. Um gráfico inline sem papel declarado e
sem nome é exposto como objeto gráfico anônimo; em 178 ocorrências por dois
arquivos, isso é ruído constante num produto que se usa de pé, com uma mão e com
a atenção disputada (C3 do 02-uso §3). A correção é de uma linha por ícone, mas
a contagem é a contagem.

**R-D3 · 1.3.1 / 4.1.2 — o grupo da régua está rotulado em 3 de 8.**

A direção afirma: "A régua e o RIR são grupos rotulados". Medi todas as fileiras
de 4 botões ou mais dentro dos telefones:

| | com `role="group"` + rótulo | sem papel e sem rótulo |
|---|---|---|
| régua de repetições (M1) | 3 — "Repetições da série 2", "Repetições", "Repetições da série 3" | 5 |
| fileira de RIR (M1) | 1 — "RIR da série 2" | 1 |
| `.seg` de porção (M2) | 6 — uma por refeição | 8 |

O padrão está provado e está certo onde existe; o que medi é que ele vale em 10
das 24 fileiras. Nas 8 `.seg` sem `role="radiogroup"`, os filhos `role="radio"`
ficam órfãos de grupo, que é pior que não ter papel nenhum: o leitor anuncia
"botão de rádio, 1 de ?" sem dizer de que refeição. Em M2 isso cai justamente
sobre a tarefa de maior falha medida do produto — 1 dia com refeição marcada em
22 (P1), 95% (02-uso §4).

**R-D4 · 2.5.7 Dragging Movements — metade dos valores da régua exige arrastar.
Reprovação limítrofe, e eu digo por que é limítrofe.**

A régua é `.strip{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;
scroll-snap-type:x proximity}`. Medi as cinco réguas que de fato rolam:

| régua | botões | largura do conteúdo | largura visível | alcançáveis sem arrastar |
|---|---|---|---|---|
| série 2 (o protótipo, M1-1) | 12 | 714 px | 382 px | **6 de 12** |
| M1-3 | 10 | 594 px | 382 px | 6 de 10 |
| M1-4 | 9 | 534 px | 382 px | 6 de 9 |
| M1-6 (`.strip.off`) | 8 | 474 px | 382 px | 6 de 8 |
| paisagem (M1-14) | 9 | 534 px | 393 px | 6 de 9 |

Com `scrollbar-width:none` não há barra de rolagem para clicar, e no iOS não
haveria barra persistente de qualquer modo. Então, por ponteiro, os valores 1 a 5
e 16 a 17 só se alcançam **arrastando**. É limítrofe porque existe caminho
alternativo: os botões são focáveis e o Tab rola o contêiner até eles, e há leitura
do 2.5.7 em que rolagem não conta como arrasto. O que **não** é limítrofe é o
custo de corpo: uma mão só (F28) e nada no pixel dizendo que há mais valor fora
da tela. A comparação com a C é direta e é da C: 7 de 7 valores sem rolagem.

**R-D5 · 2.5.5 (AAA) e o corpo — 12 alvos abaixo de 44 px.** `.map` ("Ver a
sessão inteira") a 334 × **30** px, 3 ocorrências; `.daytype` ("Dia de treino ·
o próximo é o…") a 206–330 × **36** px, 9 ocorrências. Passam o 2.5.8 (24 px) e
reprovam o 2.5.5. Entram aqui porque o `.daytype` é o controle que troca o tipo
do dia, e o tipo do dia reposiciona todas as refeições (F187, F189, M2-13).

**R-D6 · `.strip.off` — 8 botões `disabled` a 2,41:1, e nada diz por quê.** Os
botões estão corretamente `disabled` (conferi: `disabled=true`), então a norma os
excetua de 1.4.3 e eu não os conto. Dois problemas ficam: o `aria-disabled="true"`
está no `<div class="strip off">`, que não tem papel — num `div` sem `role`, esse
atributo é ignorado pela tecnologia assistiva; e não há `aria-describedby`
ligando a régua desligada à razão de estar desligada ("primeiro a carga", no caso
do substituto nunca feito, F109). Para quem não vê a tela, oito botões
esmaecidos a 2,41:1 são oito botões que não respondem sem motivo dito.

**R-D7 · 1.4.11 — 32 controles sem borda e sem preenchimento perceptível, e os
piores são os da situação mais difícil.**

A D resolve o limite onde desenha borda (3.1) e não resolve onde não desenha.
Medi 32 controles ativos cujo único canal é um preenchimento que não se separa do
fundo, igual nos dois temas:

| controle | tamanho | preenchimento medido | o que é |
|---|---|---|---|
| `.acts > button` (16×) | 122–382 × 44 | **1,08:1** | "Máquina ocupada", "Dor", "Pular", "Trocar de novo", "Cancelar a série a mais" |
| `.kp button` (12×) | 122 × 54 | **1,20:1** claro, 1,14:1 escuro | as teclas do teclado próprio, inclusive "vírgula" e "apagar" |
| `.opt` (4×) | 382 × 65–84 | sem preenchimento; divisória `--line` a **1,43:1** | as linhas de escolha de substituto |

Todos os 32 têm `border-width: 0` e preenchimento `--surface-2 #EDEAE3`. Duas
consequências que a contagem sozinha não mostra:

1. **Os 16 são os controles de U4.** "Máquina ocupada", "Dor" e "Pular" são o que
   se toca quando a máquina prescrita está ocupada, quebrada, ou se está em outra
   academia (F26, F27, F109) — a situação **nº 2 em dificuldade** do produto, com
   5 das 7 condições adversas ao mesmo tempo (02-uso §3), 1,5 vez por semana em
   P1-B. Três botões lado a lado de 122 × 44 px separados por nada: num instante
   de pressa, com uma mão, o erro de toque entre "Dor" e "Pular" é de
   consequência diferente (um é sinal clínico que vira pendência por F172 e F102,
   o outro é decisão declarada por F154).
2. **As 4 linhas de `.opt`** são a lista de substitutos, que é a escolha de algo
   "que ele quase nunca executou" (F109) — a decisão nova sob pressão (C6). Elas
   se separam por uma divisória a 1,43:1.

**Contagem da D: 4 reprovações firmes em AA (R-D1, R-D2, R-D3, R-D7), 1 limítrofe
em AA (R-D4), 1 em AAA (R-D5) e 1 defeito de estado programático (R-D6).**

### 3.3 O que o corpo cobra da D, além da norma

- **O alcance de uma mão.** A régua exige arrasto horizontal para metade dos
  valores, num aparelho de 414 px segurado por uma mão (F28), com o polegar na
  parte de baixo (que é onde a direção acertadamente põe tudo). Arrastar na
  horizontal com o polegar da mão que segura é o gesto mais caro que o M1 pede, e
  a D não responde "qual mão" porque P3 não respondeu. Nada no desenho depende de
  lado — isso a D afirma e confere, porque não há controle lateralizado — mas
  arrastar na horizontal é de lado por natureza.
- **Confirmação por um canal só, para quem não olha.** O "guardada" da D é
  visual e nada mais: nem anúncio (R-D1), nem som nem vibração, e o Safari do iOS
  não vibra (F58). A direção recusa som e vibração por fato, e está certa. A
  consequência é que o único canal é a tela, e aí o canal **tem** que falar
  (`role="status"`), senão o produto fica sem confirmação nenhuma para parte dos
  usuários. O F294 diz que fechar o app logo depois de digitar já perdeu série:
  sem confirmação, ninguém sabe se pode fechar.
- **O 36 px do tipo do dia.** Tocar o controle que reorganiza o dia inteiro num
  alvo de 36 px de altura, sentado no meio do trabalho, é barato; de pé e suado,
  não. Ele aparece em M1-13, que é a manhã seguinte na academia.

---

## 4 · O corpo, nomeado — e o que a norma não cobre

O corpo é o do `02-uso` §3: **C1** relógio contra (P2, F36), **C2** corpo em
esforço, de pé e suado (F28), ofegante (F36), **C3** mão e atenção disputadas —
uma mão (F28), aparelho que bloqueia, música, outro app na frente com o produto
suspenso (P3, F57), **C4** rede fraca no subsolo (F25), **C5** longe do fato,
registrando de memória, **C6** decisão nova sob pressão (F109, F159), **C7**
sozinho a cerca de 3 m do aparelho (F45). E o notebook, sentado, com teclado
(F50, U14).

**Primeiro, uma correção de premissa, porque o meu mandato é prova.** O meu
enunciado diz "no subsolo com pouca luz". **A luz da academia não é fato.** O
`01-fatos.md`, na seção de ausências (linha 1474), lista como coisas que o
repositório não registra: "a luz da academia, uso ao ar livre ou ao sol, uso de
luva ou de magnésio". A linha seguinte lista "necessidades de acessibilidade do
próprio usuário". Então, sobre luz e sobre a visão do dono: **não medido, e não
sabido.** Isso não enfraquece a cobrança — fortalece. Um limite de alvo a 1,38:1
não pode ser defendido com "a tela é brilhante o bastante", porque ninguém sabe
contra que luz essa tela é vista, nem se há magnésio no dedo entre o dedo e o
vidro. O piso de 3:1 passa a ser o único número defensável.

**Cinco coisas que o corpo cobra e a WCAG 2.2 AA não cobra:**

1. **Alvo de 44 px, não de 24.** O 2.5.8 AA pede 24 × 24. Para 48 toques por
   semana (P1-B), de pé, suado, com uma mão (F28), o número é o 44 do 2.5.5
   (AAA) e da Apple. As duas direções já trabalham nesse patamar — C: menor alvo
   40 × 44, mediana 54; D: menor 30, mediana 54 em M1 e 44 em M2 — e por isso a
   cobrança é pontual: **1 alvo na C e 12 na D**.
2. **Limite de alvo perceptível, mesmo em botão com rótulo.** A norma dispensa;
   o corpo não. Mirar com o polegar suado é mirar numa área, e a área precisa ter
   contorno a 3:1. **Cobra 119 controles da C**; a D já cumpre nos controles com
   borda e falha em **32 sem borda** — as 12 teclas do seu teclado próprio a
   1,20:1 e os 16 botões de "Máquina ocupada", "Dor" e "Pular" a 1,08:1, que são
   os controles da situação nº 2 em dificuldade (R-D7).
3. **Confirmação em dois canais, porque um está proibido por fato.** O iOS não
   vibra pelo navegador e o som exige toque prévio (F58). Sobram tela e anúncio.
   Com o aparelho bloqueado na mão e música tocando (P3), e o app suspenso (F57),
   a confirmação **tem** que estar na tela **e** no anúncio. Cobra R-D1.
4. **Estado que sobrevive ao olho cansado.** O E3 marca "passou sem registro".
   A norma pede 3:1 para o objeto gráfico; o corpo pede que a marca seja
   **forma**, não intensidade. A hachura da C a 1,48:1 é intensidade. O tracejado
   da D a 5,62:1 é forma. Cobra R-C2.
5. **Nada que dependa de arrastar com a mão que segura.** Cobra R-D4.

**E uma que a norma cobre e os dois contextos agravam:** o subsolo sem rede (F25,
F72). Conferi que nada em nenhum dos quatro desenhos depende de rede para
registrar, e que as duas desenham o estado "sem rede" em palavra, não em ícone
de alerta. As duas passam, e isto é o item 2 da régua do briefing — funciona no
contexto que os fatos descrevem, não só no melhor.

---

## 5 · As três exigências, medidas

As três são dadas. Onde criam defeito de acesso, eu digo qual e onde; não cancelo
nenhuma.

### E1 · A decisão de tornar permanente, ao encerrar o treino e num atalho na tela do dia

**Nenhuma das duas tem isto escrito assim, e as duas recusam explicitamente o que
o E1 pede.** A C recusa "decidir o programa na academia" (recusa 3) e manda a
mudança do dia para a pendência, em casa. A D recusa "perguntar qualquer coisa
sob o relógio" (recusa 2): "Encerrar a sessão não pergunta nada". Isto não é
opinião minha sobre o E1 — é a medida de onde ele bate.

**O defeito de acesso que o E1 cria, e onde.** Encerrar a sessão (U3) é a
situação **mais difícil** do produto pela contagem do 02-uso §3: 5 das 7
condições adversas ao mesmo tempo (C1 C2 C3 C4 C6), e falha medida de 42% em
P1-B e 59% em P1-A — 42% a 59% das sessões **nunca chegam a ser encerradas por
ele** (P1). Pôr uma decisão nova exatamente aí tem três consequências
mensuráveis:

1. **Uma decisão que em metade das vezes não acontece.** Se a decisão viver
   dentro do encerramento, ela herda a falha do encerramento: em 42% a 59% dos
   casos, ninguém a verá. Isto não é defeito de acesso, é defeito de desenho, e
   é do dono decidir — mas o número é este.
2. **Risco de 2.1.2 e 2.4.11 se for modal.** Um painel de decisão ao fim do
   treino, no instante de C1 (hora-limite, P2), é o lugar clássico de armadilha
   de foco e de foco encoberto. Requisito, não desenho: **tem que ser
   descartável sem responder**, com alvo de dispensa ≥ 44 px, sem prender o
   foco, e sem cobrir o elemento focado.
3. **"Discreto" é a palavra que produz o defeito.** O E1 pede "um atalho
   discreto na tela do dia". Medi o que "discreto" virou nestes dois desenhos: na
   C, o controle discreto é `.gb` — o único alvo abaixo de 44 px do arquivo
   (40 × 44) e borda a 1,38:1; na D, são `.map` (334 × **30**) e `.daytype`
   (**36** de altura), os 12 alvos abaixo de 44, e `.lk`, que é texto sem
   limite. **Nos dois desenhos, o que é discreto é exatamente o que já falha o
   2.5.5 e o limite de 3:1.** Então o E1, como está escrito, empurra os dois para
   o lugar de onde vêm as reprovações que já medi.

**Requisito, não desenho:** o atalho discreto tem de ficar ≥ 24 × 24 px pela
norma e ≥ 44 × 44 pelo corpo; não pode ser ícone sem nome (é o R-D2 da D, 178
`<svg>` sem rótulo, à espera); não pode ser marcado só por cor; e a decisão
precisa de `role="status"` ou `role="dialog"` com nome, porque é informação nova
aparecendo sem o usuário pedir (4.1.3).

### E2 · Peso, medidas e fotos com lugar próprio

**Na D já é assim e já está medido como passando.** A barra de lugares da D é
`grid-template-columns:repeat(4,1fr)` com 4 itens de **104 × 50 px**,
`aria-label="Lugares"` e `aria-current="page"`. Passa 2.5.8 (24), passa o corpo
(≥ 44 na altura) e diz o lugar ativo à tecnologia assistiva. E2 não custa acesso
nenhum à D.

**Na C, o E2 leva a barra de 3 para 4.** Medi a barra de 3:
`.tabs{grid-template-columns:repeat(3,1fr)}`, `min-height:50px`, itens de
**138 × 50 px**, rótulos em 13 px. Com 4 colunas em 414 px, cada item passa a
**103,5 × 50 px**. Isso continua acima de 24 (norma) e de 44 na altura (corpo):
**o E2 não cria reprovação de alvo na C.** O que ele aperta é o texto: em 103,5 px
com 13 px de fonte, "Prescrição" cabe; **com o texto do sistema ampliado, não
medi** — o quarto lugar não existe no HTML, e eu não estimo sem dizer. Fica como
requisito: os quatro rótulos têm de caber, ou quebrar, em 103,5 px com o texto
ampliado, sem cortar palavra e sem depender de largura fixa (a C afirma que "as
fileiras de botões quebram em duas linhas; nada depende de largura fixa", o que
confere para as fileiras que medi).

**E o E2 agrava o R-C3 na C.** A barra da C não tem `aria-current`. Com 3 lugares,
um leitor de tela ouve 3 links iguais; com 4, ouve 4. A exigência multiplica um
defeito que já está medido, e a correção é a mesma de uma linha.

### E3 · O que passou sem registro aparece marcado

Nativo nas duas, como o enunciado diz. A regra de prova que recebi é clara:
**estado marcado só por cor ou só por textura reprova.** Medi os dois:

| | canal 1 | canal 2 | canal 3 | contraste do canal gráfico |
|---|---|---|---|---|
| **C**, linha hachurada (`.row.hatch`) | textura | palavra "sem marca" | — | listra a **1,48:1** (claro), 1,67:1 (escuro) |
| **C**, quadradinho do dia (`.cells i.u`) | textura | — (só no `aria-label` e na conta ao lado) | — | **1,48:1** + borda a 1,38:1 |
| **C**, dia da fileira (`.daystrip button.u`) | textura | — | — | **1,48:1** + borda a 1,38:1 |
| **D**, quadradinho do dia (`.cell`) | forma (tracejado) | legenda com palavra | conta escrita | tracejado a **5,62:1** |
| **D**, refeição sem marca | forma | palavra "sem marca" (26 ocorrências no M2) | conta de 14 dias | ≥ 3:1 |

**Conclusão medida: nenhuma das duas marca estado só por cor** — isso as duas
resolveram, e é o que as duas afirmam. Mas **a C marca por textura só**, em dois
lugares (`.cells i.u` e `.daystrip button.u`), e a textura mede 1,48:1. Pelo
critério que recebi, **isso reprova**, e é o R-C2. A D cumpre o E3 com três
canais e com o canal gráfico a 5,62:1.

**O E3 não cria defeito de acesso em nenhuma das duas.** Ele revela um que já
existia na C.

---

## 6 · O que precisa mudar para cada direção existir

Requisito, não desenho. Cada item diz o número medido e o número exigido.

### Direção C

| # | requisito | medido | exigido | critério |
|---|---|---|---|---|
| **C-1** | O token `--line` não pode ser o limite de controle nenhum. Separar em dois tokens, como a D fez, ou dar aos controles um preenchimento que se destaque do fundo. | borda 1,27–1,55:1; preenchimento 1,00–1,22:1; **119 controles** | ≥ 3:1 em um dos dois canais | 1.4.11 |
| **C-2** | `.chip` não pode ter preenchimento igual ao do cartão em que está. | `--card #FFFFFF` sobre `#FFFFFF` = **1,00:1**, em 27 botões de 49–52 × 64 px | ≥ 3:1, ou borda ≥ 3:1 | 1.4.11 |
| **C-3** | As 13 teclas do teclado próprio precisam de separação perceptível. É o teclado que a direção criou para substituir o do sistema (F63, F65, F66). | 123 × 54 px, borda 1,55:1 | ≥ 3:1 | 1.4.11 |
| **C-4** | A hachura não serve como canal gráfico único. Trocar por forma (tracejado, meio-cheio) ou subir a listra. | listra a **1,48:1** (claro), 1,67:1 (escuro) | ≥ 3:1 | 1.4.11, e a regra do E3 |
| **C-5** | Os 14 quadradinhos da regra precisam dizer o estado por mais que textura, no pixel. | `.cells i.u` 14 px de altura, textura 1,48:1, borda 1,38:1, zero texto | forma + ≥ 3:1 | 1.4.1, 1.4.11 |
| **C-6** | A barra de lugares precisa dizer qual lugar está ativo de forma programática. | `aria-current` = **0** nos dois arquivos | `aria-current` no item ativo | 4.1.2 |
| **C-7** | Levar um alvo de 40 × 44 para 44 × 44. | `.gb` 40,1 × 44 | ≥ 44 pelo corpo (já passa o 2.5.8) | 2.5.5 / corpo |
| **C-8** | Fechar o bloco `reduce`: `.chip`'s `transition:transform` sobrevive. | 2 de 3 animações desligadas | todas | 2.3.3 (AAA) |
| **C-9** | Com o E2, os 4 rótulos da barra precisam caber em 103,5 px com o texto do sistema ampliado. | 138 px hoje com 3 lugares; 103,5 px com 4 | **não medido** — o quarto lugar não está desenhado | 1.4.4, 1.4.10 |

### Direção D

| # | requisito | medido | exigido | critério |
|---|---|---|---|---|
| **D-1** | O aviso de série guardada precisa ser região viva. | `<div class="saved">` sem `role`/`aria-live`, m1 linhas 357 e 460; única região viva do M1 é `.rest` com `aria-live="off"` | `role="status"` (ou `aria-live="polite"`) com o valor e o "Desfazer" dentro do anúncio | 4.1.3 |
| **D-2** | Todo `<svg>` precisa de `aria-hidden="true"` (decorativo) ou de nome. | **178** `<svg>`, **0** com nome ou `aria-hidden`; **102** fora de controle nomeado | 178 de 178 resolvidos | 1.1.1 |
| **D-3** | O papel e o rótulo de grupo precisam valer em todas as fileiras, não em algumas. | régua 3 de 8; RIR 1 de 2; `.seg` 6 de 14 — e nas 8 sem grupo há `role="radio"` órfão | 24 de 24 | 1.3.1, 4.1.2 |
| **D-4** | A régua precisa de caminho sem arrasto para os valores fora da tela, ou de menos valores. | **6 de 12** alcançáveis; conteúdo de 714 px em 382 px; `scrollbar-width:none` | todos alcançáveis por toque simples, ou indicação visível de que há mais | 2.5.7 (limítrofe), e o corpo de uma mão (F28) |
| **D-5** | As 12 teclas do teclado próprio precisam de separação perceptível. Mesmo defeito da C-3, em 12 lugares em vez de 13. | 122 × 54 px, sem borda, preenchimento **1,20:1** (claro) / 1,14:1 (escuro) | ≥ 3:1 | 1.4.11 |
| **D-6** | Os 16 botões de `.acts` — "Máquina ocupada", "Dor", "Pular", "Trocar de novo", "Cancelar a série a mais" — e as 4 linhas de substituto precisam de limite. São os controles de U4, a situação nº 2 em dificuldade, e "Dor" e "Pular" têm consequência diferente (F172/F102 contra F154). | 122–382 × 44 px, borda 0, preenchimento **1,08:1**; `.opt` com divisória a **1,43:1** | ≥ 3:1 | 1.4.11 |
| **D-7** | Levar `.map` (30 px) e `.daytype` (36 px) para 44 px de altura. | 12 alvos: 3 a 30 px, 9 a 36 px | ≥ 44 pelo corpo (já passam o 2.5.8) | 2.5.5 / corpo |
| **D-8** | A régua desligada precisa dizer por que está desligada, e o `aria-disabled` precisa estar onde a tecnologia assistiva o leia. | `aria-disabled="true"` num `<div>` sem `role`; sem `aria-describedby`; 8 botões a 2,41:1 | razão ligada ao grupo | 1.3.1, 4.1.2 |

### Os dois, por causa do E1

| # | requisito | por quê |
|---|---|---|
| **E1-a** | A decisão ao encerrar não pode prender o foco nem cobrir o elemento focado, e tem de ser descartável sem responder, com alvo de dispensa ≥ 44 px. | O instante é o de 5 das 7 condições adversas (02-uso §3) e de 42% a 59% de falha medida (P1). 2.1.2, 2.4.11, 3.3.4 |
| **E1-b** | O atalho "discreto" na tela do dia tem de ficar ≥ 44 × 44 px, com limite ≥ 3:1, com nome escrito, e não pode ser ícone sem rótulo nem marca só de cor. | Medido: o que é "discreto" nos dois desenhos é exatamente o que já reprova 2.5.5 e o limite de 3:1. 2.5.8, 1.4.11, 1.1.1, 1.4.1 |

---

## 7 · O que não medi

- **As necessidades de acessibilidade do dono.** `01-fatos.md`, ausências, linha
  1475: o repositório não as registra. Tudo nas seções acima é piso para
  qualquer usuário (P3, D8), não resposta a uma necessidade conhecida.
- **A luz da academia, o sol, a luva, o magnésio.** `01-fatos.md`, linha 1474:
  não registrado. Não há como medir legibilidade contra uma luz que não se sabe.
- **Leitor de tela de verdade.** Medi a árvore de acessibilidade (papel, nome,
  estado, região viva, ordem do DOM) em Chromium. **Não rodei VoiceOver no
  iOS**, que é o leitor que importa aqui (F51). O que afirmo é o que está ou não
  está declarado no desenho; como o VoiceOver verbaliza cada caso, não medido.
- **O texto do sistema ampliado.** Os dois arquivos usam px e `text-size-adjust:
  100%`, e não bloqueiam zoom. Não medi o layout dos dois a 200% de texto, nem o
  quarto lugar da barra da C, que não existe no HTML.
- **Teclado físico de ponta a ponta.** Conferi ordem do DOM, ausência de
  `tabindex` positivo e anel de foco em 525 elementos. **Não** percorri os fluxos
  por Tab num app real; os dois arquivos são galerias de estados, e a navegação
  entre estados é do protótipo, não do desenho. O notebook com teclado (F50, U14)
  fica, portanto, medido só em parte.
- **Os cinco lugares da C e os três da D que estão descritos e não desenhados**
  (C: a aula, a sessão de fotos, Semanas, Prescrição, a tela larga; D: a sessão
  de fotos, Evolução, Prescrição). Não há pixel para medir. Em especial, a sessão
  de fotos é a situação de C7 — sozinho, a cerca de 3 m do aparelho, sem
  alcançá-lo (F45) — e é exatamente onde alvo e contraste deixam de valer e
  passam a valer voz, som e letra grande. A D registra isso como pergunta 8 ("A
  3 m, ele lê a tela?", P7 sem essa parte). **Não medido, nas duas**, e é o maior
  buraco de acesso que sobra.
- **A rede.** Conferi que nenhum dos dois momentos depende de rede para
  registrar (F72) e que as duas dizem "sem rede" em palavra. Não medi tempo de
  abertura nem comportamento real sob sinal fraco (F25, F73).
- **Daltonismo simulado.** Não rodei simulação de deficiência de cor. O que medi
  é mais forte para o caso: nos dois desenhos nenhum estado é dito só por cor
  (seção 4 do E3), o que torna a simulação secundária.
