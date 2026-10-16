# 04 · Desempenho e motores

> Especialista em desempenho e motores, fase 1: leitura e medição, sem mexer no
> código do app. Leitura no commit `a22b09d`; medições contra o `dist/` construído
> desse commit, servido em `localhost:4724`. Chromium 151.0.7922.34 (Playwright,
> `chromium-1234`) e **WebKit 26.5** (Playwright `webkit-2336`, que **rodou** nesta
> máquina; ver §4). Viewport 414 × 896, ×2, `isMobile`, `hasTouch`.

## O que pesa, em dez linhas

1. **O app redesenha de cima a baixo a cada `render()`, mas os nós sobrevivem.**
   Medido em dez telas: um `render()` sem mudança cria e remove **zero** nós, e o
   `<main>` e o primeiro botão são os mesmos objetos depois dele. Uma animação
   num nó que fica **não reinicia** quando um `render()` cai no meio dela.
2. **O que trava é a thread principal.** Com a thread ocupada 300 ms no meio de
   uma animação, a caixa animada em `left` **fica parada 320 ms** e depois salta;
   a mesma caixa em `transform` **não para nenhum quadro**. O resultado é igual
   nos dois motores (§1.6, vídeo quadro a quadro).
3. **O indicador de aba anima `left`** (`src/componentes.css:270`): o Chromium
   recusa levá-lo ao compositor (`unsupportedProperties: ["left"]`) e ele custa
   14 layouts e 26 pinturas em 400 ms, contra 1 e 3 do mesmo deslize em
   `transform`. Ele também conta como deslocamento de layout.
4. **Trocar de aba custa de 2 a 14 ms de JavaScript e de 2 a 4 ms de layout no
   Chromium** (de 11 a 52 ms e de 10 a 19 ms com a CPU 4× mais lenta). A Semana e
   o modo de sessão são as telas pesadas. Toda animação de entrada começa
   **depois** desse trabalho.
5. **Nenhum toque frequente passa de um quadro hoje** (mediana de 15 a 18 ms do
   início do click à pintura, no Chromium). A exceção é a **primeira série do
   treino**: ela cria o `AudioContext` dentro do toque e custa 74 ms no
   Chromium e 184 ms no WebKit.
6. **Não sobrou nenhum `backdrop-filter`** nem `will-change` no app (varredura do
   estilo computado em três telas, nos dois motores).
7. **`overflow-x: clip` no `body` vira `hidden` na janela.** Um `translateX(+)`
   não cria barra de rolagem, mas a página fica rolável de lado **por programa**
   (`scrollTo`, `focus()`, `scrollIntoView`): medido, 140 a 160 px. Dentro da
   folha, o conteúdo rola de lado também com o dedo.
8. **Um `transform` em `#app` ou em `.ins-modo` arranca o que é `fixed` lá
   dentro.** A barra de abas pula de y=849 para y=1251, e a faixa da pergunta
   do modo pula de y=805 para y=1309. A guarda de hoje cobre `#app`, mas não
   cobre `.ins-modo`.
9. **A subida da folha, decidida em 06/10, não está no código.** A folha aparece
   num quadro só (2 layouts, 3 pinturas e nenhum quadro perdido).
10. **Uma View Transition engole o toque no Chromium**: o toque dado no meio dela
    cai no `<html>` e se perde, mesmo com `pointer-events: none`.

---

## 1. Como o app renderiza e o que isso custa para animar

### 1.1 O modelo

- `render()` (`src/main.jsx:7373`) chama `montaNoApp(<App ctx={CTX} />)`
  (`src/main.jsx:7375` → `src/ui/raiz.jsx:33`). É o `render` do Preact sobre
  `#app`, **síncrono**, com o diff a partir da raiz. `src/main.jsx` tem **284**
  chamadas a `render()`. Quase toda ação faz "muda `S`/`view` → `render()`".
- A rota mora em `view`. A casca devolve **duas formas diferentes** de árvore. Com
  tela cheia aberta, devolve `<>{telaCheia}{folhas}{pare}</>`
  (`src/ui/app.jsx:49`). Sem ela, devolve `header` + `<main><Tela/></main>` +
  folhas + `FaixaDaSessao` + `TabBar` + pare (`src/ui/app.jsx:55-102`).
- O cronômetro de descanso (`#timer`), o toast e o aviso de telefone deitado
  ficam **fora** do Preact (`index.html:88-96`). Quem os pinta é o JavaScript
  direto: `pintaTimer` (`src/main.jsx:6797`).

### 1.2 Os nós persistem? Sim, com três exceções que importam

Medido (`desempenho-render.mjs`): em cada uma de dez telas, 15 `render()`
seguidos sem mudar nada. Um `MutationObserver` conta o que muda, e uma marca
posta no `<main>` (ou no `.tc`) e no primeiro botão confere se são os mesmos
nós depois.

- **Zero nós criados ou removidos** em todas as dez telas, nos dois motores, e
  a marca sobrevive. Quando uma animação mora num nó que fica, um `render()` no
  meio não a reinicia.
- Dias e Semana regravam o mesmo texto em 23 e 26 nós de texto por render, com
  o mesmo valor (`""` → `""`, `"0"` → `"0"`). É inofensivo: 0,1 ms de layout
  forçado depois.

As três exceções, pela leitura do código:

1. **Trocar de aba troca o componente** (`TELAS[aba]`, `src/ui/app.jsx:51-52`).
   A tela velha **sai do DOM no mesmo `render()`** em que a nova entra. Não sobra
   nada para animar a saída.
2. **Entrar numa tela cheia troca a forma da árvore** (`src/ui/app.jsx:49`): o
   `<main>`, a `FaixaDaSessao` e a `TabBar` desmontam. Ao voltar, a `TabBar`
   **nasce de novo**, e o indicador aparece no lugar, sem deslizar. A aba de
   baixo é reconstruída inteira, com o custo de entrada da tabela 1.3.
3. **Fechar uma camada a tira do DOM na hora.** Para animar a saída de uma
   folha ou de uma tela cheia, o nó tem de continuar montado durante o
   movimento, num estado "saindo" explícito, ou a saída tem de ser uma foto
   (View Transition; ver §2.6, que tem um problema).

### 1.3 Quanto custa construir cada tela (o atraso antes do primeiro quadro)

Medido (`desempenho-render.mjs`, 120 dias de histórico semeado: 85 sessões,
peso diário, comida fechada todo dia, registro de 93 KB). **Entrada** = o
`render()` que constrói a tela, medido com `performance.now()` em volta da
chamada, mais o estilo e o layout que ele deixa pendentes, forçados com
`offsetHeight`. A tela já tinha sido visitada uma vez (ver a coluna "1ª vez").
**Re-render** = mediana de 15 `render()` sem mudança. Em ms.

| tela | nós | entrada Chromium 1× (JS + layout) | entrada Chromium 4× | entrada WebKit | 1ª vez, layout, WebKit | re-render 1× / 4× / WebKit |
|---|---:|---:|---:|---:|---:|---:|
| Agora | 136 | 7,2 + 0,2 | 17,8 + 0,5 | 6 + 0 | 0 | 5,0 / 17 / 5 |
| Dias | 171 | 2,4 + 2,1 | 10,8 + 10,2 | 6 + 14 | 910 | 1,6 / 6,3 / 2 |
| Corpo | 241 | 4,2 + 4,0 | 16,6 + 19,1 | 7 + 15 | 553 | 2,2 / 8,7 / 3 |
| **Semana** | 230 | **13,7 + 3,1** | **51,8 + 14,6** | 18 + 27 | 474 | **9,4 / 39,3 / 16** |
| Prescrição | 119 | 1,9 + 1,8 | 11,0 + 11,9 | 4 + 7 | 329 | 0,7 / 4,3 / 1 |
| Ajustes (tela cheia) | 50 | 8,3 + 1,6 | 34,1 + 7,0 | 5 + 5 | 6 | 0,4 / 3,3 / 1 |
| Dia aberto (tela cheia) | 67 | 7,6 + 1,1 | 34,0 + 8,7 | 5 + 4 | 8 | 0,2 / 1,9 / 0 |
| Programa (tela cheia) | 88 | 5,1 + 1,4 | 25,7 + 8,7 | 5 + 6 | 340 | 0,9 / 4,4 / 1 |
| **Modo de sessão** | 562 | **18,2 + 5,5** | **39,7 + 13,5** | 22 + 15 | 493 | 4,1 / 11,8 / 4 |
| **Modo, exercício aberto + régua** | 562 | **20,8 + 2,8** | **68,0 + 7,3** | 42 + 8 | 198 | 2,7 / 10,2 / 5 |

- **Com um ano de histórico** (`DIAS=365`, registro de 269 KB, Chromium 1×), os
  números ficam na mesma ordem: Semana 23 + 7 ms, modo com régua 28,5 + 2 ms.
  O histórico pesa pouco na tela. Pesa mais na gravação (§1.5).
- **O 4× varia entre rodadas** (de 68 a 169 ms na entrada do modo com régua,
  em duas rodadas). A tabela traz a rodada com a tela já visitada.
- **A coluna "1ª vez" do WebKit é artefato desta máquina.** O app usa a fonte do
  sistema (`--ins-fonte: -apple-system, … 'SF Pro Text'`,
  `src/tokens.css:272`), que não existe no Linux. Na primeira vez, o WebKit
  procura fonte de recurso no fontconfig, e isso custa de 300 a 950 ms. Na
  segunda vez, de 4 a 27 ms. No iPhone, a SF Pro é do sistema. Isso não muda o
  que importa aqui: o primeiro quadro de uma entrada espera o render.

**O que isso quer dizer para o movimento.** Uma transição CSS começa a contar
no recálculo de estilo que vem **depois** do `render()`. A duração não
"absorve" o render: o movimento começa atrasado e dura o que foi escrito.

- No Chromium 1×, entrar na Semana custa uns 17 ms (um quadro) e entrar no modo
  com a régua uns 24 ms (um quadro e meio) antes do primeiro quadro de qualquer
  movimento.
- No 4×, o mesmo custa de 66 a 75 ms: quatro ou cinco quadros.

### 1.4 Quem redesenha sozinho (o `render()` que cai no meio de uma animação sem ninguém pedir)

| quem | onde | ritmo | o que faz | custo medido |
|---|---|---|---|---|
| `useAgora` dentro de `Agora` | `src/ui/telas/agora.jsx:61` → `src/ui/instrumento/primitivos.jsx:283-292` | 1 s | redesenha **a tela Agora inteira** (Preact, por componente) | 5 tarefas em 5 s, 8,9 ms de script no total (≈1,8 ms cada) a 1×; 21,7 ms (≈4,3 ms cada) a 4×; nenhum quadro perdido (`desempenho-parado.mjs`) |
| `HoraDoCabecalho` | `src/ui/app.jsx:25` | 1 s | redesenha a hora do cabeçalho | (contado acima) |
| `pintaTimer` | `src/main.jsx:6797-6820`, `setInterval` em `:6762` | 250 ms | `transform: scaleX` em `#tfill` **e** `textContent` em `#tval` (`:6819`) | 25 layouts em 5 s no modo com descanso (5 ms a 1×, 16 ms a 4×), nenhum quadro perdido |
| `tickRelogio` | `src/main.jsx:2103`, ligado em `:2122` | 1 s | `textContent` da hora e do relógio, sem render | (dentro dos 25 layouts acima) |
| `batida` | `src/main.jsx:728` | 30 s | `render()` só na virada para a pergunta | não medido (raro) |
| `arrastaAjuste` | `src/main.jsx:11922-11925` | cada `pointermove` | `render()` do app inteiro por movimento do dedo | não medido; a tela cheia re-renderiza em 0,2 a 0,9 ms |
| a gravação adiada | `queueSave`, `src/main.jsx:1816-1820` | 700 ms depois do toque | `save()`: serializa e grava o registro inteiro (§1.5) | ver §1.5 |
| a sincronia | `src/main.jsx:1261` | 4 s depois de gravar, com conta | funde e redesenha | não medido (sem conta no teste) |

O pulso do ponto ao vivo (`@keyframes ins-pulse`, `src/base.css:352-358`) roda
sem parar no Agora (`primitivos.jsx:240`) e no treino (`treino.jsx:75`). No
Chromium ele vai para o compositor, mas o motor recalcula estilo a cada quadro
enquanto ele vive: são 300 recálculos de estilo em 5 s parado, baratos e sem
layout.

### 1.5 O custo de gravar

`save()` (`src/main.jsx:1721`) carimba cada documento (um `JSON.stringify` por
documento) e chama `grava()` (`:1678`), que faz `JSON.stringify(S)` do registro
inteiro **de forma síncrona**, antes do primeiro `await`, e depois
`localStorage.setItem`.

| registro | Chromium 1× | Chromium 4× | WebKit |
|---|---:|---:|---:|
| 93 KB (120 dias) | 2,0 ms (stringify 1,5; `setItem` 0,4) | 8,8 ms | 2 ms |
| 269 KB (365 dias) | 7,4 ms (stringify 6,6) | não medido | não medido |

Medido em `desempenho-render.mjs`, mediana de 10 `save()` seguidos.

**Quando a gravação acontece**, medido em `desempenho-toque.mjs`, do início do
click ao `setItem('lastro-v1')`:

- **"+1 copo"** grava na hora (0,8 ms depois do click), e **a tela espera**:
  `await save()` vem antes de `render()` (`src/main.jsx:2761-2768`).
- **A série pela régua e a refeição** gravam **703 ms depois** (o debounce de
  700 ms de `queueSave`). O dado fica na memória na hora, e o disco vem depois.
- Uma animação de até 700 ms que começa no toque termina antes da gravação.
  Uma mais longa, ou um segundo toque, recebe os 2 a 9 ms do `save()` no meio.
  Isso é inofensivo para `transform` e `opacity` no compositor, e é um tranco
  para qualquer coisa animada na thread principal.

### 1.6 Um `render()` no meio de uma animação causa o quê

Três coisas, todas medidas:

1. **Ele não reinicia a animação** se o nó persiste e o render não mexe na
   propriedade animada (§1.2). Se mexe, por exemplo trocando o `left` do
   indicador, a transição muda de alvo a partir de onde estava.
2. **Ele ocupa a thread principal pelo tempo da tabela 1.3.** O que ele faz com
   a animação depende **só** da propriedade animada.
   - Experimento (`desempenho-compositor.mjs`): uma página em branco com uma
     caixa que anda 300 px em 1 s, linear. Aos 350 ms a thread principal fica
     ocupada 300 ms. A página é gravada em vídeo a 25 quadros/s, e em cada
     quadro o ffmpeg lê a posição da caixa.

     | motor | `left` | `transform` |
     |---|---|---|
     | Chromium | 0 10 20 35 45 60 70 80 95 105 **105 105 105 105 105 105 105 105** 195 210 … 300 → **parada de 320 ms** e salto de 90 px | 0 10 25 35 45 … 285 300 → **parada de 0 ms** |
     | WebKit | 0 10 24 34 49 58 73 82 97 102 **102 102 102 102 102 102 102 102** 203 … 300 → **parada de 320 ms** e salto de 101 px | 0 11 23 39 50 … 289 300 → **parada de 0 ms** |

   - No traço do Chromium, a animação de `left` vem marcada "não composta"
     (`compositeFailed: 8224`, `unsupportedProperties: ["left"]`). A de
     `transform` vem composta (`compositeFailed: 0`).
3. **A animação de `left` ainda soma deslocamento de layout**: 0,004 no
   experimento (`desempenho-movimentos.mjs`, janela `bloqueio-left`). A de
   `transform` soma 0.

Conclusão para o time: **só `transform` e `opacity` aguentam um `render()` no
meio**. Qualquer outra propriedade congela por todo o tempo de render, que vai
de 2 a 52 ms conforme a tela e a CPU (tabela 1.3).

---

## 2. O mapa das armadilhas no código de hoje

### 2.1 `backdrop-filter`: nenhum sobrou

- Nas folhas de estilo, a palavra só aparece em comentários:
  `src/componentes.css:255` (barra de abas), `:594` (topo da tela cheia) e
  `:1279` (topo do modo). Não há nenhum em JSX nem em `src/palco.css`.
- Varredura do estilo computado de **todos** os elementos (`desempenho-armadilhas.mjs`,
  §0) no Agora, na Semana e no modo com descanso, nos dois motores:
  `backdropFilter` diferente de `none` em **0** elementos; `will-change`
  diferente de `auto` em **0**.
- Os `transform` presentes hoje são só `#timer` e `#tfill` (com o descanso
  contando), mais o `translateX(-50%)` de centralizar o `#toast` e a
  `.ins-faixa` quando estão na tela.

### 2.2 Ancestrais com `overflow` diferente de `visible`

| onde | o quê | risco se algo animar dentro |
|---|---|---|
| `src/base.css:107` | `body { overflow-x: clip }` | **Vai para a janela como `hidden`** (o `body` passa o overflow dele à janela). O `body` não vira contêiner de rolagem e o sticky funciona; ver §2.4 sobre a rolagem de lado. |
| `src/base.css:113-117` | `body.ins-travado { position: fixed; inset: 0; overflow: hidden }` | Só com folha aberta. Correto: segura a página atrás. |
| `src/componentes.css:234-240` | `.ins-folha-c { overflow-y: auto }` | **É contêiner de rolagem, e o eixo X vira `auto`.** Conteúdo deslizando para a direita dentro da folha rola de lado (medido em §2.4). Pede `overflow-x: hidden` (lá, `clip` também vira `hidden`, porque o outro eixo é `auto`). |
| `src/componentes.css:862` | `.addlist { max-height: 340px; overflow-y: auto }` | O mesmo da folha, em escala menor. |
| `src/componentes.css:1870` | `.rv-modelo { overflow-x: auto }` | Rola de lado de propósito (texto colado da revisão). Nada deve animar dentro. |
| `src/componentes.css:1098` | `.abertura-falhou { position: fixed; overflow-y: auto }` | Tela de erro, sem movimento. |
| `src/componentes.css:90`, `:550`, `:997`, `:1164`, `:1178`, `:1183`; `src/treino.css:162`; `src/base.css:423` | `overflow: hidden` em folhas da árvore: texto cortado com reticências, rótulo de arquivo, `#tbar` (que corta o `#tfill`), só para leitor de tela | Nenhum tem filho sticky. `#tbar` cortar o `scaleX` é o que se quer. |
| `src/protocolo.css:47`, `:215` | quadro da foto, `overflow: hidden` | Corta o `transform` da foto ajustada. É o que se quer. |
| `src/palco.css:92`, `:114`, `:169` | a bancada (só no documento de fora) | Não alcança o app (o app roda num iframe). |

**Na cadeia de cada sticky não há nenhum `overflow`.** Medido no estilo
computado, depois de rolar 700 px (`desempenho-armadilhas.mjs`, §3), igual nos
dois motores:

- `.ins-modo-topo` (`src/componentes.css:1285`): `div.ins-modo` < `#app` <
  `body[clip/visible]` < `html`. Fica em **top = 0**.
- `.day-rel` (`src/treino.css:602`): `main` < `div.ins-modo` < … Fica em
  **top = 54**, logo abaixo da barra do modo.
- `.tc-topo` (`src/componentes.css:588`): `div.tc` < `#app` < … Fica em
  **top = 0**.

Para continuar assim: **nada de `overflow` em `#app`, `.tc`, `.ins-modo`, `main`
nem `.tc-corpo`**, nem para cortar o transbordo de uma animação. Quem corta é o
`body` (já corta) ou um invólucro novo **abaixo** do sticky.

### 2.3 `transform` num ancestral de quem é `fixed`

O que é `fixed` dentro de `#app`:

- a barra de abas (`.ins-tabbar`, `src/componentes.css:250`, filha de `#app`);
- as folhas (`.ins-folha-w`, `:151`), o pare (`:158`) e a faixa "não guardado"
  (`:188`), todas irmãs da tela, sem portal (`src/ui/instrumento/folha.jsx:129-135`);
- a faixa da sessão (`.ins-faixa`, `:1150`). **Dentro do modo, ela é filha de
  `.ins-modo`** (`src/ui/telas/sessaomodo.jsx:74`).

Sonda (`desempenho-armadilhas.mjs`, §2): um `transform: translateX(1px)` parado,
o quadro do meio de uma animação.

| sonda | o fixo | top antes | top durante | janela |
|---|---|---:|---:|---:|
| `transform` em `#app` | barra de abas | 849 | **1251** | 896 |
| `transform` em `.ins-modo` | faixa da pergunta de 1h30 | 805 | **1309** | 896 |

Igual nos dois motores. **Animar a entrada do modo com `transform` no
`.ins-modo` faz a faixa pular para o fim do conteúdo e voltar no fim do
movimento**: é um pisca garantido. O mesmo vale para `will-change: transform`,
`filter`, `perspective` e `contain: paint` no ancestral.

A guarda de hoje (`tests/dominio/estilo.test.ts:1028`, "nada entre a folha e a
janela cria bloco de contenção") olha `html`, `body`, `:root`, `*` e `#app`. Ela
não olha `.ins-modo`, `.tc` nem `main`.

### 2.4 `translateX(+N)`: onde transbordaria, e quem corta

Sonda (`desempenho-armadilhas.mjs`, §1): `transform: translateX(160px)` parado
no lugar onde uma animação de "andar para a frente" moraria. Lido: largura
rolável do documento, se a janela rola de lado por programa
(`scrollTo(400, y)`), se os fixos e centrados se mexem e, na folha, se o
conteúdo rola de lado. Igual nos dois motores.

| onde | `scrollWidth` do documento | a janela rola de lado? | rolagem interna |
|---|---:|---|---|
| `#app > main` (uma aba) | 414 → **554** | **sim, 140 px** (por programa) | — |
| `#app > .tc` (tela cheia) | 414 → **574** | **sim, 160 px** | — |
| `#app > .ins-modo` | 414 → **574** | **sim, 160 px** | — |
| `.ins-folha` (a folha inteira) | 414 → 414 | não (é `fixed`, não estende a página) | — |
| filho de `.ins-folha-c` | 414 → 414 | não | **sim: 554 > 414; `scrollLeft` vai a 140, também com o dedo** |

O que isso quer dizer:

- **A barra de rolagem transitória não nasce**, por dois motivos. A janela tem
  `overflow-x: hidden` (o `clip` do `body` passado a ela), e as barras estão
  escondidas em Blink e WebKit (`::-webkit-scrollbar { display: none }`,
  `src/base.css:198`). Os centrados por `left: 50%` + `translateX(-50%)`
  (`#toast` `src/componentes.css:1119`, `#timer` `:1136`, `.ins-faixa` `:1150`)
  **não se mexeram** na sonda.
- **Mas a página fica rolável de lado por programa** enquanto o conteúdo
  transborda. Durante um deslize para a direita, um `focus()` sem
  `preventScroll`, um `scrollIntoView` ou uma âncora deslocam a página toda de
  lado, e ela não volta sozinha.
  - O `Folha` e o `TelaCheia` já focam com `preventScroll` (`folha.jsx`,
    `telacheia.jsx`).
  - `mostraExercicio` (`src/main.jsx:5041`) e a Semana (`semana.jsx:141`) usam
    `scrollIntoView`.
- **No iPhone, a confirmar no aparelho**: o WebKit do Linux se comporta como o
  Chromium. Já houve versões do Safari do iOS que deixavam arrastar de lado uma
  página com `overflow-x: hidden` vindo do `body`. Isso não foi medido aqui.
- **Quem corta:**
  - Na página, o `body` (já corta, `src/base.css:107`). Para fechar também a
    rolagem por programa, o corte tem de ficar num **invólucro novo, sem
    transform, entre `#app` e o que anima**, com `overflow-x: clip`, que ali não
    passa à janela.
  - Na folha, `.ins-folha-c` com `overflow-x: hidden` (`src/componentes.css:236`).
  - Na lista de adicionar, `.addlist` (`:862`).

### 2.5 A cadeia de alturas (`100vh` / `svh` / `dvh`)

| nível | regra | onde |
|---|---|---|
| `html` | altura automática | — |
| `body` | `min-height: 100vh; min-height: 100svh` (fallback antes, na ordem certa) | `src/base.css:104-105` |
| `#app` | altura automática; `padding-bottom: calc(--ins-tabbar + --ins-timer-h + --ins-faixa-h + 24px)` | `src/base.css:227` |
| `.ins-modo` | `min-height: 100vh; min-height: 100svh` | `src/componentes.css:1237-1238` |
| `.tc` | altura automática | — |
| `.ins-folha` | `max-height: 92dvh` | `src/componentes.css:207` |
| camadas por cima (folha, pare, deitado) | `position: fixed; inset: 0`, sem `vh` | `:151`, `:158`, `src/base.css:399` |

Não há `100vh` sozinho em lugar nenhum, e `overscroll-behavior: none` está em
`html, body` (`src/base.css:67`). Medido (`desempenho-armadilhas.mjs`, §4, no
Chromium; no WebKit a sonda do modo não abriu, mas o CSS é o mesmo):

- **A sobra rolável no modo com conteúdo curto.** O `.ins-modo` tem 100svh, e
  o `#app` soma o padding-bottom de 24 px por cima. A página fica com 920 px
  numa janela de 896: **24 px roláveis**. No iPhone, com `--sa-bottom` de 34 px,
  daria 58 px, mais a altura do cronômetro e da faixa quando estão na tela.
  Hoje o modo quase sempre é mais longo que a tela (de 1372 a 2019 px). A sobra
  aparece no modo vazio (aula antes de montar) e apareceria em qualquer
  animação que encolha o conteúdo.
- **A tela cheia curta não sobra, mas mostra o fundo do `body`.** A página fica
  com 896 (o `min-height` do `body`) e o `#app` com 220. Abaixo do conteúdo,
  aparece o `--ins-fundo` do `body`, não o `--ins-tela` do `#app`. Quando uma
  tela deslizar, é esse fundo que aparece por trás dela.
- **`vh` × `svh` não se mede aqui**: no emulador e no WebKit sem janela não há
  barra de navegador, então `svh` = `vh` = `lvh`. O mesmo vale no app instalado
  no iPhone (sem barra do Safari). A diferença só existe no Safari em aba.
- **`92dvh` na folha**: na aba do Safari, o `dvh` muda enquanto a barra anima e
  refaz o layout da folha. Como a página está travada com a folha aberta, a
  barra não anima. Risco baixo.

### 2.6 View Transitions: a saída de camada por foto, e o toque que se perde

A View Transition seria o atalho para animar a **saída** de uma camada que o
Preact já tirou do DOM (§1.2): o motor fotografa o antes e o depois e anima as
fotos no compositor. O Chromium 151 e o WebKit 26.5 têm
`document.startViewTransition`.

Sonda (`desempenho-armadilhas.mjs`, §5): trocar para Dias dentro de uma View
Transition de 600 ms e tocar em Corpo 150 ms depois.

| motor | variante | o toque | aba no fim |
|---|---|---|---|
| Chromium | padrão | caiu no `<html>` | Dias (**toque perdido**) |
| Chromium | `::view-transition { pointer-events: none }` | caiu no `<html>` | Dias (**toque perdido**) |
| WebKit | padrão | chegou à aba | Corpo |
| WebKit | `::view-transition { pointer-events: none }` | caiu no `<html>` | Dias (**toque perdido**) |

Uma amostra por linha, e os motores discordam. Isso basta para a regra: **View
Transition só entra com um teste automático que prove que o toque atravessa,
nos dois motores**. Sem esse teste, ela fere a regra 2 do briefing.

### 2.7 Animações de layout que existem hoje

- **O indicador de aba anima `left`**: `transition: left var(--ins-dur)
  var(--ins-ease)` (`src/componentes.css:270`), com o `left` inline em
  porcentagem (`src/ui/instrumento/tabbar.jsx:72`).
  - Confirmado no traço do Chromium: não composto (`compositeFailed: 8224`,
    `unsupportedProperties: ["left"]`).
  - Custo isolado, sem render (`desempenho-movimentos.mjs`, janela
    `indicador-so-left`): **14 layouts e 26 pinturas em 400 ms**, um par por
    quadro. O controle com o mesmo deslize em `transform` dá **1 layout e 3
    pinturas**, composto.
  - Hoje nenhum quadro se perde, porque o layout é pequeno (1,7 ms no total).
    O defeito é outro: ele **para** se a thread principal parar (§1.6), ele
    **começa depois** do render da aba nova (§1.3), ele **conta como
    deslocamento** (0,113 em cada troca de aba, dentro da janela do toque),
    e ele **não desliza** ao voltar de uma tela cheia (§1.2).
- **O cronômetro**: `#tfill` em `transform: scaleX` com `transition: transform
  .25s linear` (`src/componentes.css:1184-1190`) é composto (`compositeFailed:
  0`, quatro animações em 2 s). Mas `pintaTimer` também troca o `textContent`
  de `#tval` a cada 250 ms (`src/main.jsx:6819`), mesmo quando o número não
  muda. São **11 a 12 layouts e 22 a 24 pinturas em 2 s** (`cronometro-2s`,
  duas rodadas).
- **O início do descanso perde um quadro.** `startTimer`
  (`src/main.jsx:6751`) cria o `AudioContext` na primeira vez (`preparaAudio`,
  `:6758` → `:6863`): **45 ms no Chromium** (medido isolado). Também força um
  layout (`alturaDoTimer`, `offsetHeight` em `:6704`). Medido: um quadro de 50 a
  67 ms no começo de `cronometro-2s`. A primeira série do treino leva o
  `AudioContext` junto: **74 ms** de handler no Chromium, **184 ms** no WebKit.
- **Larguras e posições por porcentagem, sem transição**: a divisa do comparar,
  `left: N%` (`src/ui/telas/comparar.jsx:97`); as barras da Semana, `width: N%`
  (`semana.jsx:55`); a sparkline, `height: N%` (`primitivos.jsx:149`). Hoje não
  animam. A divisa segue o dedo por `render()` e é layout a cada movimento.
- **Rolagem suave: não existe mais.** A tabela de `DESIGN.md` §Movimento cita
  `levaAsSessoesDoDia` (`smooth`), que saiu em `83b3e3a`. `mostraExercicio` é
  `instant` (`src/main.jsx:5041-5044`), e a Semana usa `scrollIntoView` padrão
  (`semana.jsx:141`).
- **A subida da folha (decisão 14) não está no código.** `.ins-folha`
  (`src/componentes.css:203-214`) não tem `transition` nem `animation`. Medido:
  a folha aparece num quadro, com 2 layouts e 3 pinturas, sem quadro perdido;
  ao fechar, a rolagem volta exata (418 → 418 px, nos dois motores).
- **`--ins-dur-toque: 120ms`** (`src/tokens.css`, bloco "Movimento") é declarado
  e não é usado por nenhuma regra.
- **`:active` no iPhone, a confirmar no aparelho.** O "afunda" do toque é
  `:active` (por exemplo `.regua-v:active`, `src/componentes.css:1450`). Não há
  nenhum ouvinte de `touchstart` em `src/` nem em `index.html`. O WebKit do iOS
  documenta que só aplica `:active` no toque quando há um ouvinte de
  `touchstart` no elemento ou no `body`. Não se mede no Linux.

---

## 3. Medições de base (o "antes")

### 3.1 Como foi medido

- **Página**: o `dist/` de `a22b09d`, servido por `python3 -m http.server 4724`.
  Antes do app, um script de instrumentação
  (`docs/motion/_medicao/desempenho-comum.mjs`):
  - o relógio deslocado para qui 15/10/2026 7h10, **andando**;
  - o `setItem('lastro-v1')` com hora marcada;
  - `pointerdown`/`click` com hora marcada (início do click na captura, fim na
    bolha da janela, a pintura por `requestAnimationFrame` + `setTimeout 0`);
  - observadores de `event`, `longtask`, `layout-shift` e `long-animation-frame`
    (os quatro no Chromium, nenhum no WebKit);
  - um gravador de intervalos entre quadros por `requestAnimationFrame`.
- **Dado**: 120 dias semeados pelos verbos do app e gravados, depois a página
  recarregada para abrir pelo caminho real: 85 sessões, 31 exercícios com
  histórico, 120 pesagens, 120 dias de comida, 17 cardios, 93 KB.
- **Toque**: `locator.tap()` do Playwright. É toque de verdade: `touchstart` e
  `touchend` confiáveis, que viram `pointerdown`, `pointerup` e `click`.
- **CPU lenta**: `Emulation.setCPUThrottlingRate` 4× pelo CDP (só Chromium).
  **É pessimista para o iPhone 11 Pro Max**: o A13 roda JavaScript de página na
  mesma ordem de um núcleo deste i5-13420H, não quatro vezes mais devagar. O 4×
  representa o aparelho quente, a bateria baixa ou o telefone mais fraco de
  outro usuário: o teto, não a expectativa.
- **Traço do motor** (Chromium): `browser.startTracing` com `devtools.timeline`,
  `…timeline.frame`, `blink.animations`, `cc`, `viz` e `benchmark`. Contados
  Layout, Paint e DrawFrame, e lido o evento `Animation`. Os traços ficam em
  `docs/motion/_medicao/shots/desempenho/traco-*.json`.
- **Limitações**:
  - `performance.now()` no WebKit tem resolução de 1 ms.
  - O Event Timing do Chromium só registra a partir de 16 ms e arredonda para
    8 ms. A coluna "evento" inclui o atraso do próprio Playwright entre
    `touchend` e o click, e por isso fica sempre ≥ 32 ms.
  - Chromium sem janela desenha a 60 Hz em software. O iPhone 11 Pro Max também
    é 60 Hz (sem ProMotion), então 16,7 ms é o orçamento certo.

### 3.2 (a) O tempo do toque

`desempenho-toque.mjs`. **handler** = trabalho síncrono do app no click.
**quadro** = do início do click até depois da pintura seguinte (o que o dedo
espera para ver a resposta). **disco** = do início do click ao `setItem`.
Mediana / máximo, em ms.

| ação | n | handler, Chromium 1× | quadro, Chromium 1× | handler, 4× | quadro, 4× | handler, WebKit | quadro, WebKit | disco |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| trocar de aba | 10 | 8,9 / 24,2 | 18,0 / 35,7 | 32,6 / 91 | 65,8 / 132 | 7 / 25 | 23,5 / 961¹ | — |
| +1 copo | 5 | 7,3 / 10,0 | 15,1 / 16,0 | 26,5 / 29,5 | 36,7 / 39,3 | 8 / 11 | 12 / 117¹ | 0,8 |
| abrir a linha da refeição | 4 | 6,3 / 9,4 | 15,8 / 17,1 | 18,8 / 20,4 | 28,2 / 31,4 | 5 / 11 | 11 / 20 | — |
| marcar refeição ("comi tudo") | 3 | 6,7 / 8,4 | 15,4 / 16,1 | 19,4 / 25,7 | 28,5 / 39,3 | 6 / 12 | 13 / 286¹ | **701** |
| abrir folha (tipo do dia) | 5 | 9,0 / 10,1 | 16,7 / 17,0 | 21,7 / 33,6 | 35,6 / 76,8 | 7 / 12 | 16 / 327¹ | — |
| fechar folha (×) | 5 | 10,0 / 10,2 | 15,9 / 16,5 | 25,9 / 27,4 | 35,9 / 38,3 | 13 / 17 | 27 / 40 | — |
| abrir tela cheia (Ajustes) | 5 | 2,5 / 3,8 | 15,8 / 16,7 | 7,8 / 29,9 | 18,5 / 57,5 | 4 / 6 | 12 / 22 | — |
| fechar tela cheia (‹ Voltar) | 9 | 5,1 / 9,1 | 17,1 / 18,8 | 18,9 / 45,1 | 35,4 / 69,0 | 6 / 9 | 17 / 23 | — |
| abrir dia passado (Dias) | 4 | 2,8 / 4,0 | 15,7 / 15,8 | 10,9 / 16,5 | 24,1 / 28,6 | 4 / 4 | 11 / 11 | — |
| entrar no modo de sessão | 5 | 8,3 / 12,3 | 16,5 / 19,4 | 28,2 / 70,0 | 43,8 / 94,4 | 15 / 16 | 24 / 525¹ | — |
| sair do modo de sessão (‹) | 5 | 6,9 / 10,9 | 16,7 / 18,8 | 26,9 / 35,1 | 49,1 / 52,1 | 9 / 10 | 20 / 34 | — |
| **gravar série pela régua** | 3 | 6,5 / **74,5**² | 15,6 / **90,2**² | 42,9 / **117**² | 55,8 / **147**² | 11 / **184**² | 28 / **410**¹² | **704** |

¹ No WebKit, o máximo é a primeira visita à tela (o artefato de fonte da §1.3).
As visitas seguintes ficam entre 13 e 25 ms.
² A primeira série do treino: cria o `AudioContext` dentro do toque (§2.7).

Tarefas longas (> 50 ms, Chromium 4×): na troca de aba, 66, 124, 89, 52, 50 e
78 ms; ao entrar no modo, 89 e 80 ms; na primeira série, 143 ms. No Chromium 1×
houve só uma, de 89 ms, a primeira série.

**Leitura**: no Chromium 1×, todo toque frequente responde no quadro seguinte.
Com a CPU 4× mais lenta, trocar de aba e entrar no modo levam de 3 a 8 quadros.
É o pior caso, e é exatamente onde a coreografia de navegação vai morar.

### 3.3 (b) Os movimentos que já existem, quadro a quadro

`desempenho-movimentos.mjs`, com as telas e a folha visitadas uma vez antes
(aquecimento). **Perdidos** = intervalos entre quadros maiores que 25 ms,
vistos por `requestAnimationFrame`. Layouts, estilos e pinturas vêm dos
contadores do CDP e do traço.

| janela | ms | Chromium 1×: perdidos (pior) | layouts / pinturas | Chromium 4×: perdidos (pior) | WebKit: perdidos (pior) |
|---|---:|---|---|---|---|
| tocar em Semana (render + indicador em `left`) | 500 | 0 (16,8) | 15 / 27 | 2 (100) | 2 (41) |
| tocar em Dias | 500 | 0 (16,8) | 15 / 27 | 1 (33) | 1 (28) |
| só o indicador em `left` | 400 | 0 (16,8) | **14 / 26** | 0 (16,8) | 0 (21) |
| o mesmo em `transform` (controle) | 400 | 0 (16,8) | **1 / 3** | 0 (16,8) | 0 (19) |
| cronômetro contando | 2000 | 1 (67)³ | 12 / 24 | 1 (100)³ | 0 (17) |
| abrir a folha da refeição | 400 | 0 (16,8) | 2 / 3 | 2 (117) | 0 (23) |
| fechar a folha | 400 | 0 (16,7) | 2 / 1 | 1 (33) | 0 (21) |

³ O primeiro quadro: `startTimer` com `AudioContext` e layout forçado.

### 3.4 (c) Pisca e deslocamento de layout

- **Deslocamento fora de toque (o que entra no CLS): 0** em todas as ações e
  janelas, no Chromium a 1× e a 4×. O WebKit não tem a API.
- **Dentro da janela do toque**: 0,113 em cada troca de aba. É o conteúdo
  trocando, mais o indicador andando em `left`. O CLS desconta, por ser
  resposta a toque.
- A animação em `left` do experimento soma **0,004 fora de toque**. Em
  `transform`, 0.
- **Barra de rolagem horizontal transitória: não nasce** (§2.4).
- **Pisca de `backdrop-filter`: impossível hoje** (§2.1).
- **Saltos que uma animação nova criaria**: o fixo arrancado por `transform`
  num ancestral (§2.3) e a página rolada de lado por programa (§2.4).

---

## 4. WebKit

**Rodou.** O `npx playwright-core install webkit` baixou o WebKit 26.5
(Playwright `webkit-2336`), mas a primeira tentativa de abrir falhou com:

```
Host system is missing dependencies to run browsers.
  sudo apt-get install libevent-2.1-7t64 libavif16
```

Sem `sudo` e sem instalar nada no sistema, as quatro bibliotecas
(`libevent-2.1-7t64`, `libavif16`, e as dependências desta, `libgav1-1` e
`libyuv0`) foram baixadas com `apt-get download`, extraídas com `dpkg-deb -x`
e guardadas em `~/.cache/ms-playwright/webkit-deps-noble/`. O WebKit roda com
`LD_PRELOAD` delas: o lançador do MiniBrowser reescreve o `LD_LIBRARY_PATH`. A
receita está no topo de `desempenho-comum.mjs`. O `package.json` não foi
tocado.

**O que deu igual ao Chromium:**

- o experimento do compositor (`left` para 320 ms, `transform` não para);
- a persistência de nós;
- todas as sondas de armadilha (transbordo, fixos arrancados, sticky);
- a ausência de `backdrop-filter`;
- a rolagem devolvida ao fechar a folha;
- as medianas do toque: de 11 a 28 ms do click à pintura.

**O que diferiu:**

- **A primeira entrada em cada tela custa de 300 a 950 ms de layout**, por
  causa da fonte de recurso no Linux (§1.3). É artefato da máquina, mas é por
  isso que os scripts aquecem antes de medir.
- **O `AudioContext` custa 184 ms** na primeira série, contra 74 ms no Chromium.
- **A troca para a Semana perdeu 2 quadros** (pior 41 ms) no WebKit, contra 0
  no Chromium 1×. Re-render da Semana: 16 ms, contra 9,4.
- **View Transition**: o toque passou na variante padrão e se perdeu com
  `pointer-events: none`, o contrário do esperado e diferente do Chromium (§2.6).
- **Sem APIs de medida**: nada de Event Timing, `longtask`, `layout-shift` ou
  `long-animation-frame`, nem CDP. No WebKit só valem o `requestAnimationFrame`,
  o `performance.now()` em ms inteiros e o vídeo.

**O que fica só pela leitura** (o WebKit do Linux não é o Safari do iPhone; o
motor de layout e de estilo é o mesmo, mas o compositor não):

- No iPhone, quem anima `transform` e `opacity` fora da thread principal é o
  Core Animation. Aqui é o compositor do WPE. O resultado do experimento deve
  valer, mas não é a mesma peça.
- O `svh` × `lvh` com a barra do Safari (§2.5).
- O `:active` sem `touchstart` (§2.7).
- O arrasto de lado de uma página com `overflow-x: hidden` vindo do `body` (§2.4).
- O gesto de borda do Safari durante uma animação.

---

## 5. Regras de desempenho para o time

Curtas e conferíveis. Cada uma diz como se confere.

**R1 · Só `transform` e `opacity` animam.** Nada de `left`, `top`, `width`,
`height`, `margin`, `padding`, `max-height` nem `grid-template-*` em
`transition` ou `@keyframes`.
- *Por quê*: §1.6. É a única forma de um `render()`, uma gravação ou o
  `AudioContext` no meio não congelarem o movimento.
- *Confere*: o guarda de estilo lista as propriedades de toda `transition` e
  `@keyframes` em `src/*.css`. No traço do Chromium, todo evento `Animation`
  vem com `compositeFailed: 0`.
- *Primeiro caso*: o indicador de aba (`src/componentes.css:270`) passa a
  `transform: translateX(N × 100%)` com largura fixa de 1/5.

**R2 · O toque nunca espera o movimento.**
- O dado grava e a tela muda **no handler**. O movimento é só apresentação do
  estado novo.
- Proibido:
  - `await` de animação (`animation.finished`, `transitionend`, `setTimeout`
    da duração) antes de gravar ou de chamar `render()`;
  - travar entrada (`pointer-events: none`, `inert`, `disabled`, ou uma flag
    "animando") enquanto algo anima;
  - fila de toques "para depois da animação".
- Um toque novo no meio de um movimento **vence**: o estado muda já e o
  movimento ou muda de alvo, como a transição CSS faz sozinha, ou é cortado.
- View Transition só com o teste de §2.6 provando que o toque atravessa, nos
  dois motores.
- *Confere*: um teste de fluxo toca duas vezes seguidas, dentro da duração, e
  vê os dois efeitos. O revisor mede "handler" e "quadro" (§6) com e sem
  movimento, e os números não podem subir.

**R3 · Nenhum ancestral de um `fixed` ganha `transform`, `will-change`,
`filter`, `perspective` ou `contain: paint`.** Hoje isso vale para `#app`,
`.ins-modo` (a faixa da sessão mora lá dentro) e qualquer pai de folha.
- Para mover uma tela inteira, anime um **invólucro do conteúdo** que não
  contenha nenhum `fixed`: no modo, o `<main>` e não o `.ins-modo`.
- *Confere*: estender o caso de `tests/dominio/estilo.test.ts:1028` para os
  ancestrais de todo `fixed`, inclusive `.ins-modo`, `.tc` e `main`. A sonda
  §2 de `desempenho-armadilhas.mjs` tem de dar top igual antes e durante.

**R4 · Sticky e corte de transbordo.**
- Nada de `overflow` em `#app`, `.tc`, `.ins-modo`, `main` ou `.tc-corpo`.
- O corte horizontal de um deslize vai no `body` (já está) ou num invólucro
  novo **abaixo** de todo sticky, com `overflow-x: clip`. Nunca `hidden`,
  que vira `auto` no outro eixo.
- Dentro da folha: `.ins-folha-c { overflow-x: hidden }` antes de qualquer
  deslize lá dentro.
- Durante um deslize horizontal: nenhum `focus()` sem `preventScroll` e nenhum
  `scrollIntoView`.
- *Confere*: §3 e §1 de `desempenho-armadilhas.mjs` (o sticky em top 0, o
  `scrollX` em 0 depois de `scrollTo(400, y)` durante o movimento, e o
  `scrollWidth` interno da folha igual ao `clientWidth`).

**R5 · Política de `will-change`**: **não usar por padrão.**
- `transform` e `opacity` com `transition` ou `@keyframes` já sobem ao
  compositor sozinhos nos dois motores (§1.6, `compositeFailed: 0`, sem
  `will-change`).
- Só se uma medida mostrar um quadro perdido **no início** de um movimento que
  se repete muito (a folha, a régua). Nesse caso, `will-change: transform` no
  **próprio elemento que anima**, posto ao abrir e **tirado** no
  `transitionend` ou no fechar.
- Nunca no ancestral (R3), nunca em lista, nunca em `#app`.

**R6 · Orçamento de camadas**: **no máximo duas coisas animando ao mesmo tempo
por tela** (por exemplo a folha e o véu; a tela e o indicador), mais o
cronômetro e o pulso, que já existem.
- Nenhuma animação em elemento repetido de lista: série, linha de refeição,
  célula do mês.
- Cada camada composta do tamanho da tela, a 414 × 896 × 2, são uns 6 MB de
  textura (828 × 1792 px × 4 bytes).
- *Confere*: no traço, contar os `Animation` simultâneos; no Chromium, a aba
  Layers do DevTools, à mão, só pelo revisor.

**R7 · Não piscar nos dois motores.**
- Sem `backdrop-filter` (hoje zero; o guarda pode proibir a propriedade).
- Fundo opaco em toda barra que fica por cima de algo que se move.
- Sem `transform` no ancestral de `fixed` (R3).
- Sem `translateX(+)` fora de um invólucro que corta (R4).
- Animação de saída só com o nó ainda montado (§1.2). Nada de "remover e
  depois animar a sombra".
- *Confere*: vídeo a 25 quadros/s nos dois motores (o método de
  `desempenho-compositor.mjs`) e as sondas de `desempenho-armadilhas.mjs`.

**R8 · O primeiro quadro não espera trabalho evitável.**
- O `AudioContext` não nasce no toque da série. Ele nasce no primeiro toque do
  modo (entrar), que não tem movimento a proteger, ou num `requestIdleCallback`
  depois.
- O layout forçado de `alturaDoTimer` (`src/main.jsx:6704`) vai para depois da
  pintura.
- `pintaTimer` só escreve `textContent` quando o número muda (hoje escreve 4×
  por segundo, `src/main.jsx:6819`).
- *Confere*: §3.2, "gravar série pela régua", com o máximo igual à mediana
  (hoje 74,5 contra 6,5 ms).

**R9 · Duração ≤ 300 ms para navegação e ≤ 200 ms para resposta a toque**,
sempre `ease` sem ultrapassagem (`--ins-ease`).
- *Por quê, em desempenho*: a gravação adiada cai 700 ms depois do toque
  (§1.5), e a sincronia, 4 s depois. Um movimento curto termina antes delas.
  Um longo divide a thread com elas (inofensivo só se R1 for cumprida).
- O render de entrada (§1.3) **não** se desconta da duração: ele vem antes.

**R10 · `prefers-reduced-motion` continua pelo portão estrutural**
(`src/base.css:374-380`). Toda animação nova é `transition` ou `@keyframes`
que o curinga alcança. Nada de animação por `requestAnimationFrame` ou Web
Animations API sem conferir `matchMedia`, porque o portão não as alcança.

---

## 6. O método de verificação da fase 4

O revisor roda os scripts de `docs/motion/_medicao/desempenho-*.mjs` contra o
`dist/` novo, no Chromium a 1× e a 4× e no WebKit (receita no topo de
`desempenho-comum.mjs`). Compara com este "antes" (os JSON em
`docs/motion/_medicao/shots/desempenho/`, que não vão ao git; para refazer,
basta construir `a22b09d` numa árvore à parte e rodar os mesmos scripts).

| o quê | como | limite para passar |
|---|---|---|
| **Cada movimento novo vai ao compositor** | traço do Chromium na janela do movimento (`desempenho-movimentos.mjs`, uma janela por movimento novo) | todo evento `Animation` com `compositeFailed: 0` e sem `unsupportedProperties` |
| **Nenhum quadro perdido durante o movimento** | intervalos de `requestAnimationFrame` na janela do movimento, **sem contar o primeiro quadro** (o do render) | Chromium 1×: **0 intervalos > 25 ms**; WebKit (aquecido): **0 intervalos > 34 ms**, porque o WPE oscila até 23 ms parado; Chromium 4×: no máximo 1 |
| **O movimento não congela com a thread presa** | o método do vídeo de `desempenho-compositor.mjs`, aplicado ao elemento real (folha, tela, indicador): o handler da ação ocupa a thread 150 ms de propósito, só no teste | **parada de 0 ms** (nenhum par de quadros com o elemento no mesmo lugar no meio do movimento), nos dois motores |
| **O toque não ficou mais lento** | `desempenho-toque.mjs` | mediana do "quadro" de cada ação ≤ **o "antes" + 2 ms** no Chromium 1×; máximo do handler ≤ **o "antes"** |
| **O toque atravessa o movimento** | um toque novo no meio de cada movimento (tocar outra aba 100 ms depois da primeira; tocar o × da folha 100 ms depois de abrir) | o segundo toque produz o efeito dele em ≤ 1 quadro; nenhum toque cai no `<html>` |
| **Primeira série sem o tranco** | `desempenho-toque.mjs`, "gravar série pela régua" | máximo do handler ≤ 16 ms no Chromium 1× (hoje 74,5) |
| **Sem deslocamento fora de toque** | `layout-shift` com `hadRecentInput = false` em todas as janelas | **0** |
| **Sem salto de fixo nem de sticky** | `desempenho-armadilhas.mjs`, §2 e §3, com a sonda trocada pelo quadro do meio do movimento real (pausar a animação com `getAnimations()[i].pause()` e `currentTime` na metade) | o top de barra de abas, faixa, `.ins-modo-topo`, `.day-rel` e `.tc-topo` **igual** antes e no meio |
| **Sem rolagem de lado** | durante cada deslize, `scrollTo(400, scrollY)` e ler `scrollX`; na folha, `scrollWidth` contra `clientWidth` de `.ins-folha-c` | `scrollX = 0`; `scrollWidth = clientWidth` |
| **Movimento reduzido** | o mesmo script com `reducedMotion: 'reduce'` no contexto | `document.getAnimations()` vazio depois de cada ação; tela final idêntica (captura) |
| **Nada de `backdrop-filter` nem `will-change` sobrando** | §0 de `desempenho-armadilhas.mjs` em cada tela, com e sem movimento em curso | 0 e 0, ou `will-change` só no elemento que anima e só enquanto anima (R5) |

**O que o revisor não consegue medir aqui e diz que não mediu**: o Core
Animation do iPhone, o `:active` sem `touchstart`, o arrasto de lado no Safari
com `overflow-x` vindo do `body` e o `svh` com a barra do Safari. O dono não
testa à mão (regra 8 do briefing). Se o time quiser prova no aparelho, é o
coordenador quem decide como, por exemplo com uma página de diagnóstico que
grava os números por conta própria.

---

## Índice dos scripts

Todos em `docs/motion/_medicao/`. Como rodar: no topo de cada um. Saída em
`docs/motion/_medicao/shots/desempenho/`.

| script | o que mede |
|---|---|
| `desempenho-comum.mjs` | abre o navegador (Chromium ou WebKit, CPU lenta opcional), instala a instrumentação, semeia 120 dias de uso e recarrega; a receita do WebKit |
| `desempenho-render.mjs` | §1.2, §1.3, §1.5: custo de entrada e de re-render por tela, persistência dos nós, custo de gravar |
| `desempenho-toque.mjs` | §3.2: o tempo do toque nas doze ações |
| `desempenho-movimentos.mjs` | §3.3, §2.7: quadro a quadro, layouts e pinturas, e o traço do Chromium em cada movimento existente |
| `desempenho-parado.mjs` | §1.4: o que o app redesenha sozinho em 5 s |
| `desempenho-compositor.mjs` | §1.6: `left` × `transform` com a thread presa, em vídeo, nos dois motores |
| `desempenho-armadilhas.mjs` | §2: `backdrop-filter`, `translateX(+)`, `transform` no ancestral de `fixed`, sticky, alturas, View Transition |
