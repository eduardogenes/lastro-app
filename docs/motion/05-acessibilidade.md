# 05 · Acessibilidade do movimento

Especialista de acessibilidade do movimento, fase 1 (só leitura). Leitura e
medição no commit `a22b09d`, contra o `dist/` construído dele, no Chromium do
Playwright a 414 × 896, ×2, toque, nas duas preferências (`reducedMotion:
'reduce'` e `'no-preference'`). Scripts em `docs/motion/_medicao/acesso-*.mjs`,
resultados em `docs/motion/_medicao/shots/acesso/*.json` e as capturas ao lado.
**Nada foi rodado em WebKit nem com leitor de tela de verdade**: o que depende
disso está marcado "pela leitura".

---

## Em uma página

- **Hoje nada escapa do movimento reduzido no CSS.** Medido: sob `reduce`,
  `document.getAnimations()` volta vazio no Agora, com folha aberta, em tela
  cheia, no modo de sessão e no descanso. O portão universal de
  `src/base.css:374-380` pega tudo o que é CSS em elemento.
- **Mas ele tem três buracos, e os três aparecem justamente quando o time
  começar a mexer.** (1) Ele engole o `transitionend`: medido, sob `reduce` o
  evento **não chega** (o `animationend` chega). Uma folha que desmontasse
  "quando a transição acabar" ficaria presa na tela de quem pediu menos
  movimento, com o véu bloqueando o app. (2) Ele não alcança JavaScript
  (`.animate()`, `scrollTo({behavior:'smooth'})`, `startViewTransition`) nem os
  pseudo-elementos fora de `*`, `*::before`, `*::after` (`::view-transition-*`,
  `::backdrop`). (3) Com `transition: none !important` em tudo, a alternativa
  certa para quem pede menos movimento (dissolver curto em opacidade) fica
  impossível de escrever sem brigar com `!important`.
- **A doutrina conta três histórias diferentes** sobre o mesmo portão
  (`src/tokens.css:59-65`, `DESIGN.md:275-279`, `src/base.css:359-380`), e duas
  delas descrevem código que não existe. O `DESIGN.md:258` ainda lista uma
  rolagem suave que saiu em `926a549` (13/10).
- **Padrão recomendado, um só:** portão por **adesão** (todo movimento dentro de
  `@media (prefers-reduced-motion: no-preference)`), cobrado por **guarda de
  fonte**, com **uma porta só para o JavaScript** que lê a preferência na hora e
  responde "não" quando não sabe, e com a regra de que **nada espera evento de
  fim de animação**. Sob `reduce`: troca de camada **dissolve** (≤ 150 ms, só
  opacidade); mudança no lugar é **de estalo**. O bloco universal de
  `base.css:374` sai no mesmo commit em que a guarda nova entra.
- **Foco, medido:** a folha está certa (foco entra, fundo inerte, foco volta ao
  acionador), com uma fresta: com o cronômetro ligado o Tab sai da folha para o
  `−15` (o cronômetro mora fora do `#app`). **Tela cheia e modo de sessão
  devolvem o foco ao `body`** ao fechar; o **modo de sessão nem recebe foco**
  ao abrir. **O painel de pare e o aviso "Não guardei" não isolam o fundo**: um
  Shift+Tab cai na barra de abas por trás. O **toast** some com `display: none`,
  e a região viva sai da árvore de acessibilidade entre um aviso e outro.
- **WCAG:** 2.3.3 atendido pelo portão; **2.2.2 fere a letra** no pulso do ponto
  ao vivo (infinito, automático, em paralelo com o conteúdo, sem mecanismo de
  parar além da chave do sistema); **2.3.1 passa** no clarão da câmera (um
  clarão por foto), com uma brecha teórica no temporizador "sem".
- **Uma decisão do dono:** o pulso do ponto ao vivo (§6).

---

## 1. Auditoria do movimento reduzido hoje

### 1.1 O que se move, e o que acontece com cada um sob `reduce`

Medido com `acesso-foco.mjs` (as duas passadas) e conferido no fonte.

| movimento | onde | sem preferência | sob `reduce` | quem desliga |
|---|---|---|---|---|
| Pulso do ponto ao vivo | `src/base.css:352` (keyframes), `:357` (`animation: ins-pulse 2.4s infinite`); aparece em todo `CartaoFoco` (`src/ui/instrumento/primitivos.jsx:240`, o cartão de cima do Agora, sempre) e no relógio da sessão (`src/ui/telas/treino.jsx:75`) | `CSSAnimation` `ins-pulse`, `running`, 2400 ms, **iterações infinitas** (medido no Agora, com folha e em tela cheia) | nenhuma animação (medido): roda 0,01 ms uma vez e fica no último quadro, opacidade 1 | `base.css:374-380` |
| Indicador de aba | `src/componentes.css:270`, `transition: left` | desliza 220 ms | pula (sem transição) | `base.css:378` |
| Barra do cronômetro | `src/componentes.css:1187-1190`, `transition: transform .25s linear`; repintada por `pintaTimer` (`src/main.jsx:6804`) | contínua | degraus de 250 ms, como o `DESIGN.md:280-284` decidiu | `base.css:378` |
| Clarão da câmera | `src/componentes.css:1801-1803`, branco (`--ins-foto-tinta: #FFFFFF`, `src/tokens.css:244`) de .9 a 0 em 320 ms | um clarão por foto | invisível: 0,01 ms (o universal vence o `1ms` local) e `opacity: 0` | `componentes.css:1803` **e** `base.css:374` |
| Bancada: pouso, virada, painel | `src/palco.css:458-474` | 520, 300 e 420 ms | nada: o JS nem põe a classe (`src/palco.js:207`, `:275`, `:309`), o bloco local zera (`palco.css:476-478`) e o universal também | três portões para a mesma coisa |
| Rolagem suave | — | **não existe mais** | — | — |
| Folha subindo (decisão 14) | — | **não existe no código** (ver `01-inventario.md`, D4) | — | — |

**A rolagem suave saiu em `926a549` (13/10)**, que trocou o
`scrollIntoView({ behavior: parado ? 'auto' : 'smooth' })` pelo dia aberto; a
função `levaAsSessoesDoDia` saiu depois, em `83b3e3a`. Hoje toda rolagem
programática é `instant` (`src/ui/instrumento/folha.jsx:40`,
`src/main.jsx:5043`, `:11850`) ou `auto` por omissão
(`src/ui/telas/semana.jsx:141`), e nenhum CSS declara `scroll-behavior`. O
`DESIGN.md:258` (a quarta linha da tabela) e o `DESIGN.md:275-276` ("a rolagem
cai para `auto` na própria linha") descrevem código morto.

### 1.2 Três textos, três portões

| onde | o que diz | confere com o código? |
|---|---|---|
| `src/tokens.css:59-65` (princípio 6) | "o portão é por ADESÃO — todo movimento mora dentro de `@media (prefers-reduced-motion: no-preference)` —, porque assim ele falha fechado" | **Não.** Não há um único `no-preference` em `src/`. |
| `DESIGN.md:275-279` | "As transições morrem pelo curinga… o pulso morre por seletor. Um `@keyframes` novo **não** morre sozinho" | **Não.** Desde 11/10 o curinga pega animação também (`docs/redesign/10-tokens.md` §14.1). |
| `src/base.css:359-380`, `10-tokens.md` §14.1, `tests/dominio/estilo.test.ts:1144-1186` | portão por **exclusão**: `*, *::before, *::after` sob `reduce`, com `!important`, `animation-duration: .01ms`, uma iteração, `transition: none` | **Sim.** É o que roda, e a guarda de estilo **exige** essa forma. |

Ao lado do universal convivem dois blocos locais redundantes
(`componentes.css:1803`, `palco.css:476-478`) e uma consulta em JS
(`palco.js:207`) que lê a preferência **uma vez**, ao montar a bancada: se a
pessoa ligar "Reduzir movimento" com a bancada aberta, a virada continua
animando até recarregar (o CSS acompanha; o JS não).

**Os dois padrões não convivem de verdade.** "Adesão" e "exclusão" só convivem
no papel: no código só existe exclusão. Se alguém seguir o princípio 6 ao pé da
letra e escrever a folha dentro de `no-preference`, o resultado é o mesmo; se
escrever fora, o universal a mata. O perigo da convivência é outro: quem lê o
`tokens.css` acha que está protegido pela adesão, quem lê o `base.css` acha que
está protegido pelo curinga, e **nenhum dos dois cobre JavaScript**.

### 1.3 Qual falha fechado de verdade

"Falhar fechado" aqui é: quando algo dá errado ou alguém esquece, quem pediu
menos movimento recebe **menos** movimento, nunca mais — e nunca uma tela presa.

| o que dá errado | exclusão universal (hoje) | adesão sem guarda | **adesão + guarda + porta do JS** |
|---|---|---|---|
| alguém escreve `transition`/`animation` e esquece o portão | pego (fechado), se for CSS em elemento | **vaza** | a guarda fica vermelha no `npx vitest run` |
| navegador sem a media feature | anima (aberto) — irrelevante no iOS ≥ 10.3 | parado | parado |
| movimento por JS (`.animate()`, `smooth`, `startViewTransition`, rAF) | **vaza** | **vaza** | a porta responde "não"; guarda de fonte proíbe chamar fora dela |
| pseudo-elemento fora do `*` (`::view-transition-*`, `::backdrop`) | **vaza** | parado, se declarado dentro do portão | idem |
| código espera `transitionend` para desmontar | **trava** (medido: o evento não chega) | trava (sem transição não há evento) | proibido pela regra M5; desmontar é por estado |
| alternativa deliberada sob `reduce` (dissolver) | impossível sem `!important` mais específico | possível | possível, e só com `opacity` |
| `animation-delay` com `fill: both` | o atraso continua: o elemento fica no primeiro quadro durante o atraso e depois salta | — | sob `reduce` a animação nem existe |

**Medido** (`acesso-foco.mjs`, passo 8, elemento de teste injetado):

| | sem preferência | sob `reduce` |
|---|---|---|
| `transitionend` de uma transição de 120 ms | chega | **não chega** |
| `animationend` de uma animação de 120 ms | chega | chega (0,01 ms) |

### 1.4 Recomendação: um padrão só

**Adesão, cobrada por guarda, com uma porta só para o JavaScript.**

1. **CSS.** Toda declaração `transition*` e `animation*` mora dentro de
   `@media (prefers-reduced-motion: no-preference) { … }`. Fora dele, a regra
   descreve o estado final, parado. `@keyframes` pode morar em qualquer lugar
   (sem quem o use, não faz nada).
2. **A alternativa de `reduce`** — quando existir — mora em
   `@media (prefers-reduced-motion: reduce) { … }`, anima **só `opacity`**, e
   dura no máximo o token de dissolver (proposta: 150 ms; o número é do
   `06-sistema.md`).
3. **JavaScript.** Uma função só (nome sugerido `podeMover()`), num módulo só,
   que devolve `matchMedia('(prefers-reduced-motion: no-preference)').matches`
   **lida na hora de cada uso** (nada de guardar em variável na montagem, como
   `palco.js:207`), e `false` se `matchMedia` não existir. Todo `.animate()`,
   toda rolagem `smooth`, todo `document.startViewTransition` passa por ela.
4. **Nada espera fim de animação.** Montar, desmontar, liberar o toque e mover o
   foco acontecem pelo estado, no mesmo desenho. Se uma saída precisa ficar na
   tela por um tempo, o tempo é o do token e vira 0 quando `podeMover()` é
   falso — nunca um `transitionend`.
5. **O universal sai** (`base.css:374-380`) no mesmo commit em que a guarda
   nova entra, e a guarda velha (`estilo.test.ts:1144-1186`, que exige o
   universal) é reescrita. Os blocos locais (`componentes.css:1803`,
   `palco.css:476-478`) viram o próprio portão por adesão das regras deles, e
   `palco.js:207` passa a usar a porta.
6. **Os três textos passam a dizer a mesma coisa** na fase 3: `DESIGN.md`
   §Movimento, `tokens.css` princípio 6 e o comentário do portão.

**Por que não manter o universal como segunda rede.** Ele engole o
`transitionend`, proíbe o dissolver e dá a impressão de cobrir o que não cobre
(JavaScript e pseudo-elementos de transição de vista). A guarda de fonte pega o
esquecimento no CI, antes de chegar ao aparelho; o teste de navegador da §5 pega
o que a guarda não vê (o que o JS faz em tempo de execução). Duas redes que
discordam sobre o dissolver são pior que uma que concorda com a doutrina.

---

## 2. Sensibilidade vestibular e critérios WCAG

### 2.1 O que é seguro num telefone de 414 pt

O que provoca enjoo, tontura e náusea em quem tem distúrbio vestibular é
**movimento percebido do campo visual**: área grande se deslocando, escala
mudando (sensação de aproximar ou afastar), camadas em velocidades diferentes,
e movimento que não para. Num telefone a 30–40 cm do rosto, a tela inteira
ocupa boa parte do campo visual central: "área grande" aqui é pouco.

| família | risco | sem preferência (`no-preference`) | sob `reduce` |
|---|---|---|---|
| **Deslizar a tela inteira** (empurrar 100% da largura, como o "push" do iOS) | **alto**: fluxo óptico horizontal de área total | evitar o deslocamento de largura inteira; se a navegação pedir direção, deslocamento **curto** (≤ 1/10 da largura, ~40 pt) somado a opacidade, ≤ 250 ms, sem ultrapassagem | dissolver |
| **Zoom ou escala de tela cheia** (cartão que cresce até virar tela) | **alto**: simula aproximação | não usar escala em área maior que 1/3 da tela; escala pequena (≥ .97) só em elemento pequeno | dissolver |
| **Paralaxe**, movimento preso à rolagem | **alto**, e não diz nada | não entra (é enfeite, regra 6 do briefing) | não entra |
| **Folha subindo** (área grande, eixo único, a partir da borda, idioma do iOS) | moderado | aceitável: ≤ 280 ms, `--ins-ease` sem ultrapassagem (`tokens.css:414-418`) | **folha e véu dissolvem**, sem `translate` |
| **Movimento pequeno no lugar** (indicador de aba, marca da régua, botão afundando) | baixo | aceitável, ≤ 220 ms | de estalo |
| **Mola, ricochete, ultrapassagem** | alto: oscilação | proibido (já está: `tokens.css:414-418`) | — |
| **Contínuo ou infinito** (pulso, spinner, cintilar) | atenção e 2.2.2 mais que vestibular | no máximo 5 s (§2.3) | parado |
| **Número que rola** (contador animado) | não é vestibular, mas mostra valor falso no meio | proibido: todo quadro tem de mostrar um número verdadeiro | — |

### 2.2 O que substitui cada família sob `reduce`: estalo ou dissolver

**Dissolver curto em opacidade para troca de camada; estalo para mudança no
lugar.**

- **Troca de camada** (folha e véu, tela cheia, modo de sessão, aviso de pare e
  "Não guardei", toast): dissolver de até 150 ms, só `opacity`.
  1. **Não é movimento pela definição da norma.** O entendimento do 2.3.3 diz
     que "motion animation does not include changes of color, blurring, or
     opacity which do not change the perceived size, shape, or position of the
     element" (com uma errata recente que passou a **incluir** o desfoque —
     mais um motivo para nunca usar `blur` aqui).
  2. **É o idioma do próprio iOS**: com "Reduzir movimento" ligado, o sistema
     troca deslizar e zoom por dissolução. Quem liga a chave já conhece esse
     gesto. O grupo de CSS decidiu o mesmo para as transições de vista: sob
     movimento reduzido, o padrão do navegador é dissolver, sem animar tamanho
     nem posição.
  3. **O estalo de uma camada inteira é uma troca brusca de luminância em área
     grande** — o véu (`--ins-veu: rgba(18,18,30,.42)`, `tokens.css:153`)
     escurece meia tela num quadro. Dissolver em 150 ms tira o tranco e mantém
     o único sinal que importa: "chegou algo por cima".
- **Mudança no lugar** (número, seleção na régua, toque que afunda, indicador de
  aba, barra do cronômetro): de estalo. Dissolver um número deixa **dois valores
  na tela ao mesmo tempo** por alguns quadros, e o número tem de ser legível em
  todo quadro.
- **Em nenhum dos dois o toque espera** (regra 2 do briefing): a camada é
  tocável e recebe o foco no quadro zero da dissolução (§3.2).

### 2.3 Os critérios

**2.3.3 Animação a partir de interações (AAA).** Atendido hoje pelo portão
(técnica C39, `prefers-reduced-motion`). Continua atendido com o padrão da
§1.4: sob `reduce` só sobra opacidade, que a definição exclui.

**2.2.2 Pausar, parar, ocultar (A) — o pulso fere a letra.** O critério vale
para informação que se move ou pisca, começa sozinha, dura mais de 5 s e
aparece em paralelo com outro conteúdo. O pulso:
- começa sozinho e é infinito (`base.css:357`);
- está em paralelo com tudo: no cartão de cima do Agora (sempre,
  `primitivos.jsx:240`) e no relógio da sessão, que gruda no topo durante o
  treino inteiro (`treino.jsx:75`);
- o único jeito de pará-lo é a chave do sistema, e o entendimento do 2.2.2 **não
  lista** `prefers-reduced-motion` entre as técnicas suficientes (G4, G11,
  G152, SCR22, G186, G191);
- se é "piscar" é discutível (a definição pede alternar entre dois estados
  "para chamar atenção"; o pulso existe para dizer "vivo", o que é chamar
  atenção). Leitura conservadora: **risco de reprovação em nível A**.

A correção barata é a G11: **pulsar no máximo 5 s** — duas voltas de 2,4 s
(4,8 s) a cada vez que o ponto aparece, e depois ficar aceso, parado. O Preact
mantém o elemento entre desenhos, então a animação só recomeça quando o ponto
é montado de novo (voltar ao Agora, retomar a sessão). É decisão do dono (§6),
porque muda o que ele vê.

Os outros movimentos contínuos passam: a **barra do cronômetro** se move por até
três minutos, mas o botão "parar" (`index.html:95`) a esconde (mecanismo G186);
a **contagem da câmera** dura no máximo 10 s, foi ele quem a começou, e
"Cancelar" a interrompe (`src/ui/telas/camera.jsx:154`).

**2.3.1 Três flashes (A) — o clarão passa.** O limite é: no máximo três
flashes em qualquer segundo, **ou** flash abaixo do limiar de área. O clarão é
branco (`tokens.css:244`) de .9 a 0 em 320 ms, cobrindo o quadro da câmera
(`src/protocolo.css:215-219`, 3:4 na largura da tela, perto de metade da
área): **acima** do limiar de área. Então só a contagem o protege, e ela
protege: **um clarão por foto guardada** (`main.jsx:12083-12087`, chamado uma
vez em `capturaAgora`). Com o temporizador de 3 s ou 10 s, é no máximo um a
cada 3 s. Não é vermelho, então o limiar de vermelho não se aplica.

**A brecha, teórica:** com o temporizador "sem" (`camera.jsx:23`),
`disparaCamera` (`main.jsx:12141-12147`) só recusa o toque se houver contagem;
não recusa se uma captura ainda estiver em andamento. Toques rápidos podem
disparar capturas em paralelo. O clarão de cada uma reaproveita o mesmo
elemento enquanto ele estiver montado (os 320 ms se fundem), então seriam
necessárias quatro capturas terminando em intervalos de ~330 ms dentro de um
segundo para passar de três — improvável, mas não impedido. **Uma captura por
vez** fecha a brecha e, de quebra, impede gravar duas vezes a mesma pose
(fica para quem cuida da câmera, área 08 do mapa). Sob `reduce` o clarão some
(`componentes.css:1803`), e isso está certo: a informação já vai pelo
obturador, pela voz da próxima pose e pelo título "Pose N de 9" que muda.

### 2.4 O que o iOS entrega à web

- **"Reduzir movimento" → `prefers-reduced-motion: reduce`.** No WebKit desde o
  Safari 10.1 / iOS 10.3, e vale no app instalado na tela de início (é o mesmo
  WebKit). O CSS acompanha a troca da chave com o app aberto; o JavaScript só
  acompanha se ler a preferência na hora ou escutar o evento `change` (o WebKit
  já teve um defeito em que a troca não atualizava a consulta, bug 222381, dado
  como corrigido). Por isso a porta da §1.4 lê na hora.
- **"Preferir transições com dissolução" não chega à web.** Não existe media
  feature para ela; a única porta é `prefers-reduced-motion`. O app não tem
  como distinguir "reduz" de "reduz e prefere dissolver" — e por isso a
  alternativa escolhida para todo `reduce` já é dissolver, que atende os dois.
- **"Reduzir transparência"** tem media feature própria
  (`prefers-reduced-transparency`), mas o app não tem vidro nem blur; nada a
  fazer.
- **Pela leitura, não medido:** nada disto foi conferido num iPhone. O que foi
  medido é o Chromium com a preferência emulada.

---

## 3. Foco e leitor de tela durante o movimento

### 3.1 O que acontece hoje, medido

`acesso-foco.mjs` (abre por toque real, nas duas preferências — o resultado é
o mesmo nas duas) e `acesso-camadas.mjs` (Shift+Tab e cronômetro ligado).

| camada | o foco ao abrir | o resto fica inerte? | Tab / Shift+Tab escapa? | o foco ao fechar |
|---|---|---|---|---|
| **Folha** (tipo do dia; menu da sessão) | a própria folha, `role="dialog"`, `tabindex="-1"` (`folha.jsx:106`, `:141-142`) ✓ | sim: cabeçalho, `main` e barra de abas (`folha.jsx:58-73`) ✓ | não, **salvo com o cronômetro ligado: o 11º Tab sai para `#tmenos`** ✗ | o acionador (`folha.jsx:113`) ✓ |
| **Tela cheia** (Ajustes) | o `h1` (`src/ui/instrumento/telacheia.jsx:22-24`, `:40`) ✓ | não precisa: a casca é trocada (`src/ui/app.jsx:49`) | não ✓ | **`body`** ✗ |
| **Modo de sessão** (pelo cartão do Agora) | **`body`** ✗ — `src/ui/telas/sessaomodo.jsx:28-35` não tem alvo de foco | não precisa | — | **`body`** ✗ |
| **Pare** | "Deixar como está" (`src/ui/instrumento/pare.jsx:30-32`) ✓ | **não**: `aria-modal="true"` (`pare.jsx:37`) descreve, mas nada fica `inert` | **Shift+Tab: o 2º cai na aba "Prescrição", atrás do painel** ✗ | **`body`** ✗ |
| **"Não guardei"** | "Tentar de novo" (`pare.jsx:71-73`) ✓ | **não**; e é `role="alert"` sem `aria-modal` (`pare.jsx:78`) | **Shift+Tab: o 1º já cai na barra de abas** ✗ | (fecha por estado; não medido) |

Por que o cronômetro escapa: ele mora **fora do `#app`** de propósito
(`index.html:88`, para repintar sem redesenhar a árvore), e `isolaOResto` marca
só os irmãos do invólucro da folha, que são filhos do `#app`
(`folha.jsx:58-73`). Com um descanso correndo — que é quando a folha do menu da
sessão e a do peso rápido abrem —, `−15`, `+15` e `parar` ficam alcançáveis
atrás da folha.

Por que tela cheia e modo devolvem ao `body`: o destino **substitui** a casca
inteira (`app.jsx:49`), então o botão que o abriu deixa de existir; ao voltar,
a casca é desenhada de novo, sem ninguém dizer onde o foco deve pousar. A
posição de **rolagem** volta (`docs/mapa/01-fundacao.md` §3.17); a de **foco**,
não.

### 3.2 Avisos e anúncios

- **Toast** (`index.html:58`, `role="status" aria-live="polite"`): escondido
  com `display: none` (`componentes.css:1118-1126`), ele **sai da árvore de
  acessibilidade** entre um aviso e outro (medido: `display` `none` → `block`).
  `toast()` escreve o texto e mostra a região no mesmo passo
  (`main.jsx:5003-5010`): a região entra na árvore **já com o texto**, e região
  viva que nasce cheia não é anunciada de forma confiável (no VoiceOver
  sobretudo). **Pela leitura**; não há leitor de tela aqui.
- **Série gravada** (`index.html:71`, `#serie-dita`): sempre presente,
  invisível por recorte, e por isso confiável. Uma ressalva pequena: corrigir
  para o mesmo valor escreve o mesmo texto (`main.jsx:5260-5283`), e texto
  idêntico não é reanunciado.
- **"Não guardei"**: `role="alert"` montado com o texto dentro, que é o caso em
  que alerta é anunciado. Mas no mesmo instante o foco vai para "Tentar de
  novo", e o anúncio do foco pode cortar o do alerta. O pare faz certo:
  `role="alertdialog"` com `aria-labelledby` (`pare.jsx:37`) — quem entra no
  diálogo ouve a frase como nome dele.
- **Faixa "Não guardado"** (`pare.jsx:104`, `role="status"`): monta com o
  texto quando o aviso fecha (logo depois do alerta, aceitável) e atualiza a
  cada falha nova (anunciado).
- **Contagem da câmera** (`camera.jsx:95`, `role="status"
  aria-live="assertive"`): a região nasce com o primeiro número, que pode não
  ser dito; a voz do app cobre (`falaTexto`).

### 3.3 O foco visível e o `transform`

O contorno de foco é pintado com o elemento: **acompanha o `transform` e
sobrevive a ele**. O que corta o anel é ancestral com `overflow` diferente de
`visible` (ou `clip-path`). O anel do app ocupa 5 px para fora da caixa (3 px
de largura + 2 px de folga, `tokens.css:410-411`; regra em
`base.css:176-182`).

Medido (`aneisCortados()`, em Agora, folha, Ajustes e modo, nas duas
preferências):
- **Nenhum anel cortado por `overflow` de componente.**
- As abas das pontas ("Agora" e "Prescrição") têm o lado de fora do anel além
  da borda da tela: é a borda física, não um recorte; três lados continuam
  visíveis.
- **Achado lateral, fora do movimento (2.4.7):** o campo de arquivo de Ajustes
  (`src/ui/telas/ajustes.jsx:99`) é um `input` transparente dentro do rótulo
  (`componentes.css:552`), e `input:focus` tira o contorno
  (`base.css:154-157`). Com teclado, focar "importar arquivo" não mostra nada.

O risco que o movimento traz: a correção da armadilha do `translateX(+N)` é
`overflow-x: clip` num ancestral. O `body` já tem (`base.css:107`), e é largura
inteira. **Um `clip` numa caixa mais estreita que a tela, em volta de
controles, corta os 5 px do anel.** E durante uma dissolução o anel fica
translúcido junto com a camada — momentâneo e aceitável; em repouso, nada
focado pode ficar com opacidade parcial.

O título da tela cheia usa outro anel (`componentes.css:617`: 2 px de
`--ins-indicator`, folga `--ins-1`), fora dos tokens de foco. Pequeno, mas é a
mesma dívida que a §11 do `10-tokens.md` fechou para os botões.

### 3.4 Regras para quando a camada se mover

1. **Foco no quadro zero.** A camada que entra recebe o foco no mesmo desenho
   em que monta — como já fazem `folha.jsx:106` e `telacheia.jsx:23` —, nunca
   no fim da animação, e sempre com `preventScroll: true`. Consequência para a
   coreografia: **a entrada começa de `opacity: 0` ou de `transform`, nunca de
   `visibility: hidden` ou `display: none`**, que tornariam o alvo não focável
   no quadro zero.
2. **A camada que sai fica `inert` desde o primeiro quadro.** Hoje ela é
   desmontada no mesmo desenho (`app.jsx:49`) e nunca está na árvore. Se a
   navegação mantiver uma cópia da tela que sai durante a animação, a cópia é
   `inert` (que no WebKit e no Blink também a tira da árvore de acessibilidade),
   sem `pointer-events`, e sai do DOM pelo estado ou pelo tempo do token —
   nunca por `transitionend`.
3. **Folha que desce:** ao fechar, a folha vira `inert`, o fundo deixa de ser
   `inert` e o foco volta ao acionador **no quadro zero** — o `cleanup` de
   `folha.jsx:108-115` não pode ser adiado para o fim da descida. O toque no
   fundo funciona enquanto ela ainda desce.
4. **Voltar de tela cheia e do modo devolve o foco a um lugar declarado**: o
   acionador redesenhado (mesmo `data-a`/chave), ou, se ele não existe mais, o
   título da tela de volta. Guardado por nome do destino, como a posição de
   leitura. Nunca o `body`.
5. **O modo de sessão ganha alvo de foco** ao entrar (o título do treino, com
   `tabindex="-1"`, como `TelaCheia`).
6. **A camada de cima isola tudo**: pare e "Não guardei" passam a usar o mesmo
   `isolaOResto`, e ele passa a marcar também o que mora fora do `#app` e é
   focável (`#timer`).
7. **"Não guardei" vira `role="alertdialog"` com `aria-modal="true"` e
   `aria-labelledby="falhou-t"`**, como o pare.
8. **A região viva nunca sai da árvore.** O toast deixa de usar `display: none`:
   fica sempre presente, escondido por opacidade (o que a proposta de movimento
   dele vai querer de qualquer jeito), sem `pointer-events` e **com o texto
   esvaziado** quando escondido (senão o VoiceOver acha um "Ajuste salvo"
   velho ao passar o dedo). O texto novo entra depois de a região estar na
   árvore.
9. **Nada animado por cima cobre inteiramente o elemento em foco** (2.4.11):
   toast e faixas que entrarem com movimento não podem pousar sobre o controle
   focado.

---

## 4. Nada que só se entenda pelo movimento

**A suíte de fluxo já é, sem querer, o teste disto:** ela roda em jsdom
(`tests/fluxo/harness.js`), onde nenhuma animação acontece. Toda informação que
só existisse no movimento seria invisível para ela. Regra: **todo movimento
novo vem com a asserção de fluxo do seu equivalente estático.**

| movimento que o time vai propor | o que ele diz | equivalente estático obrigatório | existe hoje? |
|---|---|---|---|
| Tela cheia entra / sai | fui para dentro, voltei | o `h1` com o título recebe o foco (`telacheia.jsx:40`); "‹ Voltar" no topo; sem barra de abas | sim; **o modo de sessão não tem o título focado** |
| Troca de aba | para que lado andei | `aria-current="page"` na aba (`tabbar.jsx:78`), a cor `.on`, o indicador parado sob a aba | sim |
| Folha sobe / desce | chegou uma camada por cima, e volta para baixo | o véu, o fio de acento no topo (`componentes.css:203-214`), o `h2`, `role="dialog"` com `aria-modal`, o `×` | sim |
| Série gravada | o toque pegou e gravou | o valor na linha e na régua, a contagem "séries N/M", o descanso que começa com a procedência, e `#serie-dita` com o valor | sim |
| Número que muda (volume, contagem, total, cronômetro) | o que mudou | o número final, verdadeiro em todo quadro; se for preciso dizer "mudou", uma marca de texto, não um brilho | sim; **proibir contador rolando** |
| Aviso (toast, pare, "Não guardei", faixa) | aconteceu algo, ou espera resposta | a frase numa região viva ou diálogo; a faixa "Não guardado" persiste como estado | sim, com as ressalvas da §3.2 |
| Toque aceito (afundar) | o dedo foi lido | a cor de `:active`, instantânea, e o resultado da ação | sim (a cor) |
| Pulso ao vivo | a tela está viva | o relógio andando (`treino.jsx:76`), a procedência no cartão; parado, o ponto continua aceso | sim |
| Barra do cronômetro | o tempo está passando | `#tval` exato, "vai" ao zerar, bipe e vibração | sim |
| Clarão | a foto foi tirada | obturador, bloco "feita", título "Pose N de 9" que muda, voz da próxima pose; os blocos são `aria-hidden` (`camera.jsx:64`), então para leitor de tela valem o título e a voz | sim |
| Giro da câmera | gire o corpo | "↻ gire 90°" em texto (`camera.jsx:73`) e a voz | sim |
| Rolagem até um alvo (se voltar) | onde a coisa ficou | o foco ou um título no alvo; sob `reduce`, instantânea | — |

---

## 5. Regras e guardas testáveis

| # | regra | como se confere | onde | hoje |
|---|---|---|---|---|
| **M1** | Todo `transition*`/`animation*` mora em `@media (prefers-reduced-motion: no-preference)`; em bloco `reduce` só se anima `opacity`, com duração ≤ token de dissolver | guarda de fonte: tira comentários, acha cada declaração e o `@media` que a envolve | `tests/dominio/estilo.test.ts`, substituindo o caso de `:1144-1186` | **falha**: `base.css:357`, `componentes.css:270`, `:1189`, `:1801`, `palco.css:471-474` estão fora |
| **M2** | Nenhum movimento infinito; nenhum dura mais de 5 s sem parar | guarda: `infinite` proibido em `src/*.css`; `iterations: Infinity` proibido no JS | `estilo.test.ts` | **falha**: `base.css:357` |
| **M3** | Em `no-preference`, só `transform` e `opacity`; em `reduce`, só `opacity` | guarda: `transition-property` e as propriedades de cada `@keyframes` referenciado | `estilo.test.ts` | **falha**: `componentes.css:270` anima `left` |
| **M4** | JavaScript só move pela porta | guarda: `.animate(`, `'smooth'`, `startViewTransition`, `requestAnimationFrame` proibidos em `src/` fora do módulo da porta | `estilo.test.ts` | passa (zero hoje) |
| **M5** | Nada espera fim de animação | guarda: `transitionend`, `animationend`, `onTransitionEnd`, `onAnimationEnd` proibidos em `src/` | `estilo.test.ts` | passa (zero hoje) |
| **M6** | Sob `reduce`, nada se desloca | teste de navegador com `reducedMotion: 'reduce'`: depois de abrir folha, tela cheia, modo, pare, toast e gravar uma série, toda animação de `document.getAnimations()` só tem `opacity` nos quadros, dura ≤ 150 ms e é finita; 200 ms depois, nenhuma em `running` | **novo**: navegador | passa (zero animações, medido) |
| **M7** | Sem preferência, nada infinito e nada fora de `transform`/`opacity` | o mesmo teste com `'no-preference'` | navegador | **falha**: `ins-pulse` infinito |
| **M8** | Foco no quadro zero | logo depois do toque (sem esperar a animação), `document.activeElement` está dentro da camada nova | `tests/fluxo` (jsdom tem foco) | **falha** no modo de sessão |
| **M9** | Fechar nunca devolve o foco ao `body` | depois de fechar cada camada, `activeElement` não é `body` e está conectado | `tests/fluxo` | **falha**: tela cheia, modo, pare |
| **M10** | A camada de cima isola tudo | todo elemento focável fora da camada de cima está dentro de `[inert]` (conferível em jsdom, sem simular Tab) | `tests/fluxo` | **falha**: pare, "Não guardei", folha com cronômetro |
| **M11** | A camada que sai é inerte desde o primeiro quadro | navegador, sem preferência: logo depois de fechar, o nó que sai tem `inert` | navegador | — (não há saída animada) |
| **M12** | Região viva nunca sai da árvore | guarda: nenhuma regra dá `display: none` ou `visibility: hidden` a `#toast`/`#serie-dita`; navegador: `display` computado nunca `none` | `estilo.test.ts` + navegador | **falha**: `componentes.css:1118-1126` |
| **M13** | Anel de foco nunca cortado | `aneisCortados()` (de `acesso-foco.mjs`) vazio em cada tela, salvo a lista declarada da borda física | navegador | passa (só a borda física) |
| **M14** | No máximo um clarão por foto, e nunca mais de três por segundo | fluxo com câmera dublada: cinco disparos seguidos com temporizador "sem" → capturas em série, um clarão por captura | `tests/fluxo/protocolo.test.js` | não garantido (`main.jsx:12141-12147`) |

**Sobre o teste de navegador (M6, M7, M11–M13).** jsdom não roda animação nem
`getAnimations()`, então estes precisam de um navegador. O molde está pronto
(`acesso-foco.mjs`: `getAnimations()`, `getComputedTiming()`, foco,
`aneisCortados()`); falta virar caso do vitest com o `playwright-core` que já
está no projeto e o Chromium do cache. **Ele tem de falhar, não pular, quando o
Chromium não existir** — um teste que se desliga sozinho falha aberto.

O núcleo do M6, para orientar quem escrever:

```js
const vivas = await p.evaluate(() => document.getAnimations().map(a => ({
  props: a.effect.getKeyframes().flatMap(k => Object.keys(k))
    .filter(k => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)),
  dur: a.effect.getComputedTiming().duration,
  iter: a.effect.getComputedTiming().iterations
})));
for (const v of vivas) {
  assert.deepEqual([...new Set(v.props)], ['opacity'], 'sob reduce só se dissolve');
  assert.ok(v.dur <= 150 && Number.isFinite(v.iter));
}
```

E o do M1, na mesma gramática do `estilo.test.ts`: para cada declaração cujo
nome começa por `transition` ou `animation`, subir até o `@media` que a contém
e exigir `prefers-reduced-motion: no-preference` — ou `reduce` com
`transition-property: opacity` / quadros só de `opacity`. A mensagem de erro
diz o arquivo, o seletor e a linha, como as guardas de cor já fazem.

---

## 6. Decisões do dono

**D1 · O ponto ao vivo pulsa para sempre?** Hoje ele pulsa sem parar
(`base.css:357`) no cartão de cima do Agora e no relógio do treino. Isso fere a
letra do critério 2.2.2 (nível A) para quem não ligou "Reduzir movimento".

- **A (recomendado).** Pulsa duas vezes (4,8 s) quando aparece e fica aceso.
- **B.** Fica aceso e parado sempre.
- **C.** Continua como está, aceitando o risco no 2.2.2.

O resto (o padrão de portão, dissolver sob `reduce`, as regras de foco) é
técnico e cabe ao time.

---

## 7. O que não medi

- **WebKit e VoiceOver.** Nada rodou num iPhone nem no WebKit; o anúncio do
  toast e o corte do alerta "Não guardei" pelo foco são pela leitura.
- **A câmera com vídeo** não rodou aqui (o molde é
  `docs/redesign/_medicao/camera.mjs`); a brecha do clarão é pela leitura do
  código.
- **O descanso pela régua:** no meu script o toque na régua do modo não ligou o
  cronômetro (a sessão não estava iniciada); para medir a folha com o descanso
  correndo, o cronômetro foi ligado direto (`startTimer`, em
  `acesso-camadas.mjs`).
- **A bancada sob `reduce`** não foi rodada (pela leitura, três portões a
  desligam).

## Medições

| script | o que faz | resultado |
|---|---|---|
| `docs/motion/_medicao/acesso-foco.mjs` | duas passadas (`reduce` e `no-preference`): animações vivas, foco ao abrir e fechar folha, tela cheia, pare, "Não guardei" e modo; anéis cortados; `transitionend`/`animationend` sob o portão | `shots/acesso/acesso-foco.json`, capturas `livre-*` e `reduz-*` |
| `docs/motion/_medicao/acesso-camadas.mjs` | Shift+Tab no pare e no "Não guardei"; Tab na folha com o cronômetro ligado; Shift+Tab na tela cheia | `shots/acesso/acesso-camadas.json`, capturas `camadas-*` |

Fontes externas: o entendimento do WCAG 2.2 para
[2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
e [2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html); o
[bug 222381 do WebKit](https://bugs.webkit.org/show_bug.cgi?id=222381); a
[discussão do CSSWG sobre transições de vista e movimento reduzido](https://lists.w3.org/Archives/Public/public-css-archive/2024Sep/0857.html)
e a [nota sobre "Preferir transições com dissolução"](https://lists.w3.org/Archives/Public/public-css-archive/2024Sep/0657.html).
