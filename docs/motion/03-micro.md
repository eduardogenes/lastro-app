# 03 · Micro-interações

Especialista em micro-interações, leva 1 do time de motion. Fase 1: só leitura
e proposta, nenhum código. Leitura no commit `a22b09d`; toda linha citada foi
conferida nesse commit. Medições em Chromium 151 (Playwright), 414 × 896, ×2,
`isMobile`, `hasTouch`, contra o `dist/` de `a22b09d`. Scripts em
`docs/motion/_medicao/micro-*.mjs`; capturas em `docs/motion/_medicao/shots/micro/`
(fora do git). **O WebKit do Playwright não abre nesta máquina** (falta
`libevent-2.1.so.7` para o `MiniBrowser`), então tudo o que é de WebKit aqui é
leitura e está marcado "a confirmar".

---

## 0. Em uma página

**O que o app faz hoje no toque:** quase nada que se veja. O "toque que
afunda", que `src/tokens.css:421-423` chama de "o único movimento que o dono
tocou e aprovou", **não existe no app**; o "voo" do valor até a tabela, que dois
comentários dizem existir, **também não**. Dos 28 controles que medi, **16 não
mudam nada** quando o dedo está neles — entre eles a célula da série, o RIR, o
−15/+15/parar do descanso e o "+1 copo" do descanso — e os que mudam trocam o
fundo por outro quase igual (de 1,00:1 a 1,24:1; a maioria, 1,08:1). E no iPhone pode ser pior: o
WebKit do iOS só aplica `:active` com um ouvinte de `touchstart`, e o app não
tem nenhum.

**As cinco de maior valor**, por frequência × o quanto ele precisa saber que
pegou:

| # | micro-interação | o que o movimento diz | frequência |
|---|---|---|---|
| 1 | **O toque que afunda** (todo controle) | "o toque chegou" | toda interação |
| 2 | **O pouso da série** (o número assenta na célula que recebeu) | "o valor entrou aqui" | ~22 por sessão, ~100 por semana |
| 3 | **O copo que enche** ("+1 copo": a bolinha nova enche de baixo) | "o copo entrou, e é este" | ~14 por dia |
| 4 | **O descanso que sobe** (o cronômetro entra e sai pela borda de baixo) | "o descanso começou, e mora aqui embaixo" | ~22 por sessão |
| 5 | **O toast que chega** (entra subindo, sai apagando, fica o tempo do texto) | "acabou de acontecer" | várias por dia |

**O `render()` em uma frase:** o cartão do exercício sobrevive ao `render()`
(medido: o mesmo nó antes e depois de cada toque), então transição por classe
dispara; mas **número que muda sem trocar classe** pede uma chave por valor e
uma marca de "recém", **painel que nasce** (régua, teclado, RIR, pare) só aceita
animação de nascimento e some sem saída, e **o que é escrito por fora do
Preact** (contador, toast, cronômetro) tem de ser animado lá fora — e o contador
"séries N/M" tem dois escritores e **já mostra número velho** (§8.1).

**O que fica fora, com motivo:** comemoração, contagem animada de números,
esqueleto que cintila, movimento no fim do descanso, painel de régua/teclado/RIR
deslizando, conteúdo deslizando para explicar salto de layout, e vibração (o
Safari não tem `navigator.vibrate`).

**Decisões do dono** (§9): o afundar (em tudo, só nos do treino, ou só cor);
o pouso ou o voo da série; o cronômetro subir; o toast; o painel de pare parado
ou igual à folha.

---

## 1. Cinco achados que mudam o ponto de partida

### 1.1 O "toque que afunda" não existe no app

`src/tokens.css:421-423` define `--ins-dur-toque: 120ms` com o comentário "O
toque que afunda acontece dezenas de vezes por sessão — a régua é tocada 48
vezes por semana — e é o único movimento que o dono tocou e aprovou". **Nenhuma
regra usa o token**: `grep -rn "dur-toque" src` devolve só a definição. O
`transform: scale(.95)` em `:active` que o dono tocou mora no protótipo
(`docs/redesign/03-direcao-D/prototipo.html:306-307`) e a frente 4 o manteve
por escrito (`docs/redesign/09-frente4-sistema.md:2155-2185`, "FICA, e ganha o
que falta nele"). Não foi portado. O app não tem nenhum `transform` em `:active`.

### 1.2 O "voo" do valor também não existe — e dois comentários dizem que existe

`index.html:60-70`: "Hoje a confirmação de uma série é VISUAL e é boa: `voa()`
anima o valor até a tabela". `src/main.jsx:5251` repete. `voa()` só existe em
`docs/redesign/03-direcao-D/prototipo.html:516`; nenhum commit jamais a pôs em
`src/` (`git log -S "function voa" -- src` vazio; o comentário entrou em
`23e773e` já falso). A confirmação visual da série no app é **só o número
trocando dentro da célula**. A doutrina também a conta como feita:
`src/tokens.css:59-65` lista "dizer para onde um valor foi" como uma das quatro
funções autorizadas, e nada no app a exerce.

### 1.3 O controle mais tocado do produto não tem estado de toque

`micro-toque.mjs` força `:active` pelo DevTools em cada controle e compara com o
repouso. Resultado (fundo pressionado contra o fundo real atrás do controle):

| controle | muda no toque | contraste |
|---|---|---|
| célula de CARGA da série (`#w…`, abre o teclado) | **nada** | — |
| célula de REPETIÇÃO (`#r…`, abre a régua) | **nada** | — |
| célula de RIR (`#q…`) | **nada** | — |
| topo do cartão (abre/fecha) | **nada** | — |
| −15 · +15 · parar (cronômetro) | **nada** | — |
| chip "Água n/14 · +1" do descanso | **nada** | — |
| "outro valor", "pronto" do teclado; "Anotar algo", "Carga: …" | **nada** | — |
| seta de sair do modo, aba, ⚙ Ajustes | **nada** | — |
| linha de refeição, conta da água | **nada** | — |
| **"+1 copo" (Agora)** | fundo → `--ins-superficie-2` | **1,00:1** (o bloco `.ag-agua` já é `--ins-superficie-2`, `src/componentes.css:1709`) |
| valor da régua, seta da régua, tecla, valor do RIR, Pausar/Encerrar, Trocar/Pular/Histórico, Metade | fundo → `--ins-superficie-2` | 1,08:1 |
| "+ série" | fundo → `--ins-acento-suave` | 1,09:1 |
| Comi tudo, Iniciar treino | acento → `--ins-acento-tinta` | 1,24:1 |
| descanso 3min | só a cor do número | — |

As regras que existem estão em `src/base.css:293, 301, 310, 344`,
`src/treino.css:179, 248, 293, 340, 367, 384, 574, 584, 705-706`,
`src/componentes.css:427, 607, 1450, 1515`. `.repbtn` e `.rirbtn`
(`src/treino.css:208-227`) não têm nenhuma. E o próprio CSS do cronômetro diz
que −15/+15 são "o controle mais repetido do app no pior contexto que ele tem"
(`src/componentes.css:1195-1200`) — sem estado de toque.

### 1.4 No iPhone, `:active` pode nem acontecer — a confirmar

O WebKit do iOS não aplica `:active` num toque a menos que haja um ouvinte de
`touchstart` no elemento ou num ancestral (comportamento documentado da Apple
para o Safari do iOS; não verificado no aparelho, porque o WebKit não roda aqui).
O app não tem nenhum: `grep -rn "touchstart\|onTouchStart" src index.html`
vazio (o único gesto de ponteiro é `onPointerDown` em
`src/ui/telas/ajustefoto.jsx:73`). E o realce nativo do sistema está desligado de
propósito (`-webkit-tap-highlight-color: transparent`, `src/base.css:76, 129`,
"o estado ativo é desenhado por nós"). Se a leitura estiver certa, **no iPhone
nenhum controle do app mostra nada no toque**. O remédio custa uma linha e não
muda comportamento: um ouvinte passivo vazio
(`document.addEventListener('touchstart', function () {}, { passive: true })`).
Recomendo pô-lo **sem esperar a confirmação**: o dono não testa à mão, e o
revisor não tem iPhone; com o ouvinte, o resultado não depende de saber.

### 1.5 Vibração não existe no iPhone

O Safari do iOS não implementa a Vibration API. O código já sabe:
`src/main.jsx:6861-6862` ("O Safari nunca implementou navigator.vibrate de forma
confiável") e as duas chamadas são guardadas (`:6854`, `:6873`). O mapa diz "Bipe
e vibração ao zerar" (`docs/mapa/03-sessao-de-treino.md:60`): no iPhone é só
bipe. **Nenhuma proposta deste documento conta com vibração.** Há relatos de que
alternar um `<input type="checkbox" switch>` no Safari 18 produz um toque
háptico, e de bibliotecas que exploram isso; é efeito colateral não documentado,
não verifiquei, e não recomendo como canal.

---

## 2. O `render()` do app e o que ele permite

O casco chama `render()` em quase toda ação (`src/main.jsx:7373-7391`), que monta
`<App>` no `#app` pelo Preact (`src/ui/raiz.jsx:20-33`). O Preact compara e mexe
só no que mudou. `micro-render.mjs` marca os nós com uma propriedade JS, dispara a
ação e confere se o nó na tela depois é o mesmo:

| ação | cartão | célula carga/rep/RIR | linha | `#daymeta` | seu nó de texto | cronômetro, toast |
|---|---|---|---|---|---|---|
| `render()` sem mudança (a sincronia faz dois por ciclo, `src/main.jsx:1289, 1342`) | mesmo | mesmo | mesmo | mesmo | mesmo | mesmo |
| toque na régua | mesmo | mesmo | mesmo | mesmo | **NOVO** | mesmo |
| RIR: abrir e escolher | mesmo | mesmo | mesmo | mesmo | mesmo | mesmo |
| teclado: duas teclas | mesmo | mesmo | mesmo | mesmo | **NOVO** | mesmo |
| "+ série" | mesmo | mesmo | mesmo | mesmo | **NOVO** | mesmo |
| Pular | mesmo | mesmo | mesmo | mesmo | mesmo | mesmo |

Por que persistem: `Exercicio` tem `key={vm.id}` (`src/ui/telas/treino.jsx:214`),
as linhas têm `key={k}` no `Fragment` (`src/ui/exercicio.jsx:519`), e o `.sets`
é desenhado sempre, só escondido por CSS quando o cartão está fechado
(`src/treino.css:97-98`). O `#daymeta` perde o nó de texto porque
`atualizaEstado` escreve `textContent` por fora do Preact
(`src/main.jsx:2134-2149`).

**O que isso exige de cada tipo de movimento:**

1. **Transição por classe em nó que persiste — funciona.** A bolinha da água
   (`<i key={i}>`, `src/ui/telas/agora.jsx:471`), o `.on` das células, o estado
   do cartão. Transição não roda no primeiro desenho de um nó, então montar a
   tela (trocar de aba, entrar no modo) não dispara nada: só a mudança real.
2. **Número que muda sem trocar classe — não dispara nada.** Corrigir 9 para 10
   numa célula só troca o texto do botão (`src/ui/exercicio.jsx:122`). Para o
   pouso (§4.2) o número precisa morar num `<span>` com **chave pelo valor**
   (nasce um nó por valor) **e** a animação só pode valer quando a ação marcou
   aquela célula como **recém** — senão abrir um cartão, ou entrar no modo,
   faria todas as células "pousarem" de uma vez (o `.sets` escondido mostra os
   nós ao abrir, e animação de nó que estava em `display: none` começa quando
   ele aparece). A marca de recém é estado de tela (`view`), nunca dado, e
   vence sozinha (vale só se tiver menos de ~1 s), para que um `render()` da
   sincronia 4 s depois não a reacenda e que uma remontagem não a repita.
3. **Painel que nasce e morre no `render()`** — régua, teclado, escala de RIR
   (`src/ui/exercicio.jsx:521-543`), linha de comida aberta
   (`src/ui/telas/agora.jsx:399`), leitura de volta (`:307`), pare, aviso de
   falha, faixa (`src/ui/instrumento/pare.jsx:27-102`). Transição não serve
   (não há estado anterior); só animação de nascimento. E **não há saída**: o nó
   é retirado no mesmo `render()`, e animar a saída exigiria segurar o nó vivo
   depois que o estado diz que ele acabou — que é atrasar a tela em relação ao
   dado. Este documento não propõe saída para nenhum deles.
4. **O que é escrito por fora do Preact** — `#toast` (`index.html:58`,
   `src/main.jsx:5002-5010`), `#timer` (`index.html:88-97`,
   `src/main.jsx:6751-6861`), `#relogio`/`#hora` (`:2103-2111`), `#daymeta`
   (`:2134-2149`), `#tot` (`:2082-2087`). Esses nós são fixos e o `render()`
   não os toca (medido): animação neles mora no código que os escreve, por
   classe no próprio nó.
5. **O dedo, depois do `render()`.** O nó persiste, mas a posição não: a régua
   fechando sobe 84 px o que está abaixo dela; a primeira série da sessão desce
   52 px a linha tocada (§4.2); "Pular" fecha o cartão e põe sob o dedo o nome do
   exercício seguinte (§4.9). Movimento não resolve salto de layout; o que este
   documento garante é que nenhum movimento proposto **piore** o segundo toque.

---

## 3. O vocabulário que proponho (os valores finais são do sistema)

- **Só `transform` e `opacity`**, sempre num elemento que não carrega o alvo do
  toque quando o movimento acontece depois do toque (anima-se o `<span>` dentro
  do botão, não o botão): o alvo fica parado.
- **Três classes de duração:** *instantânea* (≤ 80 ms: o afundar ao pôr o dedo);
  *curta* (120–180 ms: soltar, pouso, copo, toast); *média* (180–240 ms: o
  cronômetro entrando). Nada acima de 240 ms numa micro-interação: o dono está
  de pé, entre séries.
- **Duas curvas:** saída suave **sem ultrapassagem** para estado que chega e
  para (`--ins-ease`, `src/tokens.css:419`, nenhum ponto de controle acima de 1 —
  sem mola, sem quique, que é a forma da comemoração); `linear` só para
  interpolar grandeza (a barra do descanso, que já é assim,
  `src/componentes.css:1187-1190`).
- **Portão por adesão** (`src/tokens.css:63-65`): todo movimento novo dentro de
  `@media (prefers-reduced-motion: no-preference)`, e o estado final declarado
  fora dele. O portão estrutural de `src/base.css:374-380` continua de rede.
- **Nada comemora.** Nenhum movimento diferente para "feito", "6/6", "14/14",
  "Sessão completa". O pouso da série que fecha o exercício é o mesmo pouso da
  série 1.

---

## 4. As micro-interações, em ordem de valor

### 4.1 O toque que afunda — todo controle

**Hoje.** Ver §1.3: 16 de 28 controles sem nada; os demais com 1,00–1,08:1.
Nenhum `transform` em `:active`. O toque é aceito no `click` (os manipuladores
são `onClick`, p. ex. `src/ui/exercicio.jsx:101, 121, 142`), e a resposta visível
só chega com o `render()` da ação — que, em quase todos, troca a tela inteira
(régua some, teclado abre), sem dizer qual controle recebeu o dedo.

**A proposta.** Diz "o toque chegou". Dois canais, porque um deles é estado e
o outro é movimento:
- **forma** (movimento, dentro do portão): `transform: scale(…)` no próprio
  controle enquanto o dedo está nele. Entrada *instantânea* (≤ 80 ms), soltura
  *curta* (≈ `--ins-dur-toque`, 120 ms), saída suave. A escala depende do
  tamanho: controle pequeno (célula, régua, tecla, RIR, ±15, chip) na faixa da
  direção (≈ .95); botão largo (largura cheia) bem menos (≈ .98), porque .95 em
  374 px recolhe 9 px de cada lado e parece empurrão.
- **preenchimento** (estado, **fora** do portão): o fundo pressionado tem de se
  ver contra o fundo real — hoje 1,00 a 1,08:1. É o requisito 13 da frente 4
  (`docs/redesign/09-frente4-sistema.md:2171-2182`), que o app cumpriu pela
  metade: o token existe, a diferença não se vê. O valor é do sistema; a meta é
  "visível com a mão suada e a luz da academia", **não medida**.

**Onde não escala:** linhas inteiras (topo do cartão, linha de refeição, conta da
água) recebem só o preenchimento — escalar uma faixa de 374 px move as bordas e
lê como "a linha foi empurrada"; e a régua escala **o botão**, nunca a faixa
(frente 2, R7, `docs/redesign/09-frente2-interacao.md:346-347`).

**Por que nunca atrasa o toque.** `:active` acontece ao pôr o dedo; o `click`
chega ao soltar e o manipulador roda igual, com ou sem transição — transição CSS
não segura evento. O dado é gravado no manipulador (p. ex. `anotaSerie`,
`src/main.jsx:5098-5117`), que não espera nada. Segundo toque logo em seguida:
o controle volta a 1 em 120 ms; um toque dentro desse intervalo acha o controle
a ≥ 95 % do tamanho, e as áreas estendidas por `::after` (`src/treino.css:220`,
`src/componentes.css:1449`) encolhem junto e continuam maiores que o desenho.

**O `render()`.** Quando o nó persiste (célula, ±15, "+1 copo"), a soltura toca
inteira. Quando o toque **remove** o controle (valor da régua, escala de RIR,
"Comi tudo", "pronto"), o nó sai no `render()` e a soltura não acontece — fica
só o afundar durante o dedo, que é o que importa. Nada a fazer.

**Com movimento reduzido.** Sem escala; o preenchimento (estado) fica e diz a
mesma coisa.

**Riscos.** `transform` cria bloco de contenção para descendente `fixed`: nenhum
botão tem filho fixo (a folha e o pare moram fora, `src/ui/app.jsx:44-48`).
Texto pode borrar por um quadro durante a escala no Blink — aceitável em 120 ms,
a conferir pelo especialista de desempenho. Precondição do iPhone: o ouvinte de
`touchstart` (§1.4).

### 4.2 O pouso da série — o número assenta na célula que o recebeu

**Hoje.** Pela régua: `Regua` → `acoes.poeRep(i, k, v)`
(`src/ui/exercicio.jsx:528`) → `poeRep` (`src/main.jsx:5743-5749`): fecha a régua,
`anotaSerie` (`:5098-5117`) escreve no rascunho em memória, `projeta` escreve no
histórico, `atualizaEstado` e `atualizaAnilhas` reescrevem o contador e o total
por fora do Preact, `queueSave` represa o disco por 700 ms (`:1817-1821`),
`autoTimer` (`:5283-5313`) anuncia em `#serie-dita`, arma o descanso e, na última
série, avança; depois `render()`. Na tela, no mesmo quadro: a régua some (76 px),
o que está abaixo sobe 84 px, a célula troca "·" pelo número
(`src/ui/exercicio.jsx:114-122`), aparece o cronômetro, o selo "parcial", o
bloco "Enquanto descansa" — e, **na primeira série da sessão**, o relógio e os
controles no topo, que descem a linha tocada 52 px (`micro-serie.mjs`: célula de
y = 323 para y = 375; sob o dedo, a **célula de carga** da mesma série). Pelo
RIR: `poeRir` (`src/main.jsx:5874-5882`). Pela coluna anterior: `usaAnterior`
(`:5363-5381`), as duas células de uma vez. Pelo teclado: cada tecla grava
(`teclaDoTeclado`, `:5778-5809`) e a célula muda a cada dígito.

Nada diz **onde** o valor entrou. Com seis coisas mudando no mesmo quadro, em
quatro lugares, o olho que estava na régua (que sumiu) tem de procurar.

**A proposta.** O número **assenta** na célula que o recebeu: o `<span>` do
número entra de um pouco abaixo (3–4 px, a direção de onde a régua estava) e de
opacidade parcial (≈ .4) até o lugar, *curta* (140–180 ms), saída suave. Diz "o
valor entrou aqui". Vale para o toque único que grava: valor da régua, valor do
RIR, coluna anterior (as duas células), a carga copiada pelo "+ série". **Não**
vale por tecla do teclado: a célula muda a cada dígito e o visor do teclado já é
o lugar do olho; pousar cada dígito seria cintilar.

Não diz "guardado no disco": o disco vem 700 ms depois (`queueSave`), e se ele
recusar quem fala é o aviso de falha (§5.3) e a marca "tocado" da régua
(`src/ui/instrumento/regua.jsx:85-91`). O pouso é tão verdadeiro quanto o número
na célula — que o app já mostra no toque, da memória.

A alternativa que o dono pode preferir — **o voo** (um fantasma `position: fixed`
sai do valor tocado e vai até a célula) — está em §9, D2. Recomendo o pouso:
diz a mesma coisa (onde), não precisa medir posição antes e depois do `render()`,
não põe camada fixa por cima de tudo, e na última série do exercício nenhum dos
dois aparece (o cartão fecha no avanço; a célula fica escondida) — o voo perde
mais código pelo mesmo buraco. E o voo do protótipo **escondia a célula durante
o voo** (`visibility: hidden` no destino, `prototipo.html:528`): 300 ms sem o
número na célula, que é exatamente "atrasar o toque". Se o voo for escolhido,
o destino fica visível o tempo todo.

**Por que nunca atrasa o toque.** O dado está escrito em memória e no histórico
antes do `render()` (`anotaSerie` roda antes; `micro-render.mjs`: a célula já
mostra o número no mesmo tique do clique). O número começa a .4 de opacidade,
legível no primeiro quadro — nunca invisível. Anima-se o `<span>`, não o botão:
o alvo não se move, e um segundo toque na célula durante o pouso abre a régua de
novo normalmente (o manipulador é do botão, `src/ui/exercicio.jsx:121`).

**O `render()`.** O botão persiste, mas o texto troca sem classe (§2, item 2).
Exige: (a) o número num `<span>` com chave pelo valor; (b) uma marca de recém em
`view` (posição, série, campo, instante) posta por `poeRep`, `poeRir`,
`usaAnterior` e `maisUmaSerie`, lida pelo view-model como classe `recem` na
célula, e que vence em ~1 s; (c) a animação só sob `.recem`. Corrigir um valor
(mesma célula, valor novo) faz nascer outro `<span>` e o pouso recomeça — certo,
porque é outro valor.

**Com movimento reduzido.** O número aparece no lugar. O que diz a mesma coisa
continua: o número na célula e o anúncio "Guardei a série 3: 55 kg × 9." em
`#serie-dita` (`src/main.jsx:5260-5281`), que já existe para quem não vê.

**Riscos.** Nenhum de layout (opacidade e translação de 4 px num `<span>`).
O salto da primeira série (52 px, com a carga sob o dedo) e o salto da régua
fechando (84 px) continuam: não são de movimento, e o pouso ajuda o olho a achar
a linha que saltou. O primeiro é bug de layout para o coordenador (§8.6).

### 4.3 O descanso que sobe — o cronômetro entra e sai pela borda

**Hoje.** `startTimer` (`src/main.jsx:6751-6765`) põe a classe `on` e o
cronômetro aparece de uma vez (`display: none` → `flex`,
`src/componentes.css:1135-1143`), 82 px de altura, no rodapé. É a segunda metade
de "a série entrou" — o descanso começou — e chega em silêncio, longe da célula.
**No modo de sessão ele flutua 52 px acima do fundo**, com o conteúdo aparecendo
por baixo (`micro-serie.mjs`, captura `serie-2-guardada.png`): a regra que zera a
reserva da barra de abas no modo, `#app:has(.ins-modo) { --ins-tabbar: … }`
(`src/componentes.css:1250`), não alcança `#timer` nem `#toast`, que são irmãos do
`#app` (`index.html:58, 88`) e herdam do `:root`. O comentário logo acima
(`:1240-1249`) afirma que alcança. −15/+15 (`ajustaTimer`, `:6776-6794`): o
número pula, a barra interpola em 250 ms. "parar" (`stopTimer`, `:6847-6859`,
ligado em `:6831`): some de uma vez e o toast, se estiver na tela, cai 82 px
(`micro-avisos.mjs`: toast em y = 705 com cronômetro, 787 sem). No zero: "vai",
cor de acento, dois bipes se a tela estiver à vista (`:6806-6816`, `:6872-6891`).

**A proposta.** O cronômetro **sobe da borda de baixo** ao começar
(`translateY(100%)` → 0, *média*, 180–220 ms, saída suave) e **desce por onde
veio** ao parar ou zerar pelo −15 (*curta*, 140–180 ms). Diz "o descanso começou,
e mora aqui embaixo" — e é a mesma regra da folha (decisão 14): o que chega por
cima, chega pela borda de onde vem. Descanso novo substituindo outro (`startTimer`
chama `stopTimer`, `:6752`) não desce e sobe: troca no lugar. O toast e a faixa
da sessão, que se empilham sobre ele (`--ins-timer-h`), acompanham com o mesmo
movimento, ou o toast pula 82 px no meio da subida.

**Fim do descanso: nenhum movimento.** Quando ele não está olhando (o caso
comum: o telefone no banco), movimento não alcança — é o argumento de
`docs/design-review/05-movimento.md` §2, e continua de pé; quando está olhando,
"vai" em acento e o som dizem. Pulsar o "vai" seria chamar o olho para algo que
o som já chamou.

**Por que nunca atrasa o toque.** O alvo do descanso (`timerFim`) e a chave local
são gravados em `startTimer` antes de qualquer desenho (`:6754-6764`); a subida é
só apresentação de um estado que já existe. Os botões ±15/parar são clicáveis
durante a subida, onde estiverem (o teste de toque segue o `transform`); ninguém
os toca nos 200 ms seguintes a uma série. Um "parar" no meio da subida inverte
a transição dali.

**O `render()`.** `#timer` mora fora do Preact (`index.html:83-97`); o `render()`
não o toca (medido). A classe muda no próprio nó, então transição funciona —
desde que ele deixe de usar `display: none` (que não transiciona) e passe a
sair de cena por `transform` mais `visibility`, ou use `@starting-style`.

**Com movimento reduzido.** Aparece e some de uma vez, como hoje.

**Riscos.** O cronômetro já usa `transform: translateX(-50%)` para centrar
(`src/componentes.css:1136`): a subida tem de compor no mesmo `transform`
(`translate(-50%, Y)`) ou o centramento sai daí — senão ele salta para a direita
(é o mesmo aviso da C4 em `docs/design-review/05-movimento.md`). `translateY`
transborda para baixo, não para o lado: não cria a barra horizontal da armadilha
do `translateX(+N)`. **Precondição:** consertar o vão de 52 px (§8.2), senão ele
sobe do meio do ar.

### 4.4 O copo que enche — "+1 copo"

**Hoje.** `src/ui/telas/agora.jsx:474` → `CTX.maisUmCopo`
(`src/main.jsx:2753-2770`): soma em memória, **espera a gravação** (`await
save()`), desfaz se o aparelho recusar, e só então `render()`. Medido: o número
pinta ~4 ms depois do clique (`micro-agora.mjs`) — a tela nunca mostra um copo
que o disco recusou. Mudam: "Água · **4** de 14 copos", "1.000 ml de 3.500 ml" e a
quarta das 14 bolinhas, que ganha a classe `f` (`agora.jsx:470-472`,
`src/componentes.css:1714-1715`). O toque é invisível (1,00:1, §1.3). No
descanso, o chip "Água 3/14 · +1" (`src/ui/exercicio.jsx:387-389`) usa o mesmo
verbo, sem estado de toque.

**A proposta.** A bolinha nova **enche de baixo para cima** (um preenchimento em
`::after` de `scaleY(0)` a `scaleY(1)`, origem embaixo, *curta*, 140–180 ms). Diz
"o copo entrou, e é este". Corrigir para menos pelo contador
(`agora.jsx:476-480`) esvazia pelo mesmo caminho ao contrário. O número e os ml
trocam sem movimento: a bolinha já é o "onde". No chip do descanso, só o afundar.

**Por que nunca atrasa o toque.** O movimento começa no `render()` que já vem
depois da gravação — só anima copo guardado, que é a mesma verdade de hoje. Um
segundo toque durante o enchimento roda `maisUmCopo` de novo sobre a memória (5º
copo) e a quinta bolinha enche por conta própria.

**O `render()`.** `<i key={i}>` persiste (medido: as 14 bolinhas são os mesmos
nós); a classe `f` muda e a transição dispara. Ao montar o Agora (voltar de outra
aba) as bolinhas nascem já cheias, e transição não roda no primeiro desenho:
nada se mexe sem motivo.

**Com movimento reduzido.** A bolinha aparece cheia.

**Riscos.** O preenchimento hoje é `background` na própria bolinha; animar
`background-color` não é `transform`/`opacity`, por isso o `::after`. Fora de
movimento, um achado: dois toques rápidos com o aparelho recusando podem desfazer
o copo do segundo toque (cada chamada guarda o seu `antes`, `:2755-2766`) — só
na falha; anotado em §8.7.

### 4.5 Os números que mudam

**Hoje.** Contador "séries N/M" (`#daymeta`, escrito por `atualizaEstado` por
fora do Preact, `src/main.jsx:2134-2149`, **e** pelo Preact,
`src/ui/telas/treino.jsx:35-55`); volume (Preact); total em anilhas (`#tot`,
`innerHTML`, `:2082-2087`); relógio da sessão e hora (`tickRelogio`, `:2103-2111`,
1 s); carga no visor do teclado; kcal da folha da refeição; contagem de copos;
contagem da câmera.

**A proposta: uma regra, e nenhum movimento novo nestes.** Número que muda **onde
o dedo tocou** ganha o pouso (§4.2) ou o copo (§4.4). Número **derivado que muda
em outro lugar** — contador, volume, anilhas, kcal, ml — troca sem movimento:
movê-lo puxa o olho para longe de onde ele está, entre duas séries. Contagem
animada (1.840 → 1.895 rolando) fica fora: atrasa o valor verdadeiro e é a forma
mais conhecida de comemoração. O contador chegando a M/M só troca de cor (já faz,
`treino.jsx:46-48`): sem movimento, porque fechar o treino não é festa. Relógio e
hora tiquetaqueiam em texto, como hoje; animar cada segundo seria ruído.

**O `render()`.** Antes de qualquer coisa no contador, ele precisa de **um**
escritor: hoje mostra número velho (§8.1).

### 4.6 Marcar uma refeição pela linha

**Hoje.** Linha (`src/ui/telas/agora.jsx:389-398`) → `abreLinhaDaComida`
(`src/main.jsx:2783-2787`); "Comi tudo" (`agora.jsx:425-426`) →
`marcaLinhaDaComida` (`:2796-2812`) → `marcaRefeicao` (`:2703-2723`): grava em
memória, `queueSave`, `render()`. Na tela: a linha fecha, a forma muda
(`src/ui/instrumento/forma.jsx:16-27`), o texto à direita vira "comi tudo · 13h10",
e a **leitura de volta** nasce no topo (`agora.jsx:307-322`). Medido
(`micro-agora.mjs`, página no topo): a leitura de volta (145 px) nasce acima e a
linha tocada **desce 157 px**. Com a página rolada (`micro-ancora.mjs`), o Chromium
ancora a rolagem: a linha fica, e a leitura de volta nasce **fora da tela**
(y = −158) — o retorno do toque não é visto. O Safari, até onde sei, não
implementa ancoragem de rolagem: lá a linha desce. **A confirmar no aparelho.**

**A proposta.** A **forma** da linha tocada pousa (escala de ≈ .85 a 1 e opacidade
de ≈ .5 a 1, *curta*, 140–160 ms): diz "esta linha mudou para comi tudo", no lugar
onde o dedo está. A leitura de volta **não** se move: é conteúdo que entra
(categoria recusada) e, no caso rolado, está fora de vista. O salto de 157 px
**não se resolve com movimento**: deslizar a lista inteira para explicar o salto
é "deslizar conteúdo", recusado com motivo, e não devolve o retorno que está
fora da tela. É questão de layout para o coordenador (§8.5).

**Por que nunca atrasa o toque.** A marca é escrita antes do `render()`; a forma é
um `svg` sem manipulador (o alvo é o botão da linha). Segundo toque logo depois:
sob o dedo fica a mesma linha (medido), que reabre e mostra "Desfazer" — inócuo.

**O `render()`.** O `svg` persiste e só troca filhos; para o pouso, a mesma
técnica de §4.2: chave pela marca e o recém — que aqui já existe pela metade
(`view.ultimaMarca`, `src/main.jsx:2810`), faltando o instante.

**Com movimento reduzido.** A forma troca de uma vez.

### 4.7 Régua, teclado e escala de RIR abrindo e fechando

**Hoje.** Os três nascem e morrem no `render()` embaixo da linha
(`src/ui/exercicio.jsx:521-543`), empurrando o que está abaixo (a régua: 76 px de
painel, 84 px de deslocamento medido). As setas da régua trocam a página de
valores (`andaRegua`, `src/main.jsx:5712-5727`; botões com chave por valor,
`src/ui/instrumento/regua.jsx:69`).

**A proposta: nenhum movimento nos painéis.** Eles abrem sob o polegar, e os
alvos têm de estar parados e tocáveis no primeiro quadro — um painel deslizando
ou aparecendo em fade é um alvo que se move sob o dedo, e animar a altura é
layout. O que diz "aberto para esta série" já existe e é estado: o fio de acento
na célula (`.on`, `src/treino.css:227`), mais o afundar no toque que abriu. As
setas da régua — o único caso de "para onde se andou" nesta área — ficam sem
movimento: o caminho é raro por construção (a régua carrega a faixa inteira e a
vizinhança da última vez, como diz o comentário de `abreOutroValor`,
`src/main.jsx:5754-5756`), e deslizar seis botões com chave
por valor pede medir posição antes e depois para pouco uso.

### 4.8 "+ série"

**Hoje.** `src/ui/exercicio.jsx:550-554` → `maisUmaSerie`
(`src/main.jsx:2951-2960`): mudança do dia, `render()` (linha nova nasce), copia a
carga da anterior (`anotaSerie`), abre a régua na série nova.

**A proposta.** Só o pouso na carga copiada (§4.2) — diz "trouxe a carga da
anterior" — e a régua aberta com o fio na série nova. A linha nova não entra
animada (entrada de conteúdo; ela já é o lugar onde a régua abre).

### 4.9 Pular e Desfazer

**Hoje.** "Pular" (`src/ui/exercicio.jsx:582`, e no painel de troca e no de dor)
→ `pularEx` (`src/main.jsx:1101-1121`): espera a gravação, `render()` (o cartão
fecha, esmaece, nasce "Pulado hoje…" com Desfazer), toast. Medido
(`micro-render.mjs`): depois do toque, **sob o dedo está o nome do exercício
seguinte** — um segundo toque abre outro cartão.

**A proposta.** O afundar, e o toast (§5.1). O cartão fechando é abrir/fechar
cartão, território da navegação (`02-navegacao.md`). O risco do segundo toque é
de layout, anotado em §8.6.

### 4.10 Chips e alternâncias

**Hoje.** `.ins-chip` (`src/base.css:320-331`), `.chip` (`src/treino.css:468-481`),
rotação A B C D E HX, tipo do dia, turno, porção, deload, "Marcar/Feito" do
aquecimento: o selecionado troca de preenchimento na hora; o toque não mostra
nada na maioria (o chip do descanso: nada, §1.3).

**A proposta.** O afundar e o preenchimento do estado, instantâneo. Sem transição
de cor (não é `transform`/`opacity`, e o estado é o que importa), sem indicador
deslizando entre opções: o da barra de abas já existe e é o único lugar em que a
direção diz algo que o estado não diz.

### 4.11 O avanço para o próximo exercício (fronteira)

Na última série, `avancaExercicio` (`src/main.jsx:5328-5339`) fecha o cartão,
abre o próximo e rola de uma vez (`mostraExercicio`, `:5041-5044`; medido: 132 px).
É navegação (`02-navegacao.md`). Do lado da micro-interação: o pouso não aparece
(a célula ficou escondida no cartão fechado), e o que diz "a série entrou" ali é
o cronômetro subindo (§4.3) e o anúncio.

---

## 5. Os avisos

### 5.1 O toast

**Hoje.** `#toast` fora do Preact (`index.html:58`), `display: none` ↔ `block`
(`src/componentes.css:1118-1126`), 3,6 s fixos (`src/main.jsx:5009`), sem fila: o
novo troca o texto **no mesmo nó**, sem sinal nenhum de que é outra mensagem.
Pula 82 px quando o cronômetro entra ou sai (§4.3). São 112 chamadas; a mediana do
texto fixo é 27 caracteres, mas as longas passam de 100 com o nome dentro ("Guardei
como pulado hoje: Remada. Não volta a ser pedido nesta sessão; desfazer põe de
volta na fila.", ~105) — a 15–20 caracteres por segundo, 5 a 7 s de leitura.

**Entrada.** Sobe 6–8 px e acende (opacidade 0 → 1), *curta*, 140–180 ms. Diz
"acabou de acontecer": na periferia, algo que só aparece não se distingue de algo
que já estava lá. A premissa é a C4 de `docs/design-review/05-movimento.md`, e
continua **hipótese não medida** — digo isso como ela disse.

**Troca no meio.** O texto novo entra com o mesmo pequeno movimento (só o texto,
não a caixa). Sem isso, quem leu metade da mensagem velha não sabe que a segunda
metade é de outra.

**Saída.** Apaga (opacidade), *curta*, 120–160 ms. Não esconde nada que já não
estivesse indo embora; o que ela faz é não puxar o olho com um sumiço brusco no
canto da tela. É o único fade deste documento, e o argumento é esse: o sumiço
abrupto é, ele mesmo, um evento de movimento na periferia.

**Tempo na tela — não é movimento, e é o que de fato esconde.** 3,6 s não bastam
para as mensagens longas. Proposta para o coordenador (comportamento): tempo pelo
tamanho do texto, com piso nos 3,6 s de hoje e teto em ~8 s.

**Por que nunca atrasa.** O toast informa depois da ação feita
(`pularEx` grava antes, `:1111`); não tem botão nem alvo.

**O `render()`.** Nó fixo e persistente, fora do Preact: classe no próprio nó. Exige
trocar `display: none` por `visibility` + `opacity` (ou `@starting-style`) e
compor com o `translateX(-50%)` que já centra (`src/componentes.css:1119`).

**Com movimento reduzido.** Aparece e some de uma vez; o tempo pelo texto vale
igual.

### 5.2 O painel de pare

**Hoje.** Nasce a pedido do dedo, sem animação por decisão escrita
(`src/ui/instrumento/pare.jsx:18-19`, `src/componentes.css:153-157`), na base da
tela, com o foco em "Deixar como está" (`pare.jsx:30-32`).

**A proposta: continua parado — na entrada e na saída.** Três razões, nenhuma de
gosto: (1) ele foi pedido pelo dedo, não chega de surpresa; (2) o trabalho dele é
**parar** o dedo, e um painel que sobe faz o botão destrutivo ("Apagar…", o
primeiro, `pare.jsx:40`) passar por baixo do polegar que acabou de tocar; (3) a
frase tem de estar inteira no primeiro quadro. Saída: depois de "Apagar", o que
importa é a lista sem o item; depois de "Deixar como está", nada mudou — nos dois,
sumir de uma vez. Os botões afundam como todos (o toque mais importante merece a
mesma confirmação), e só isso: nada de escala no painel, nada de cor animada.
Se o dono quiser o pare igual à folha (§9, D5), a "Deixar como está" pode descer
como a folha desce; o "Apagar" some de uma vez.

### 5.3 "Não guardei…" e a faixa "Não guardado"

**Hoje.** O aviso chega **sozinho**, ~0,8 s depois do toque (700 ms de represa +
desenho; `micro-avisos.mjs`: 809 ms), cobre os 399 px de baixo, com os quatro
botões entre y = 674 e y = 882 — a zona do polegar — e foco em "Tentar de novo"
(`pare.jsx:66-87`). Um toque mirado no que estava ali (−15/+15, "+ série", Pular)
dentro dessa janela cai em "Copiar o registro inteiro" ou em "Fechar este aviso",
e fechar dispensa a explicação antes de lida. A faixa (`pare.jsx:94-102`,
`src/componentes.css:187-194`) fica no topo, fixa, z 86 — e **no modo cobre a seta
de saída, a hora e o `···`** (captura `avisos-3-faixa.png`).

**A proposta: nenhum movimento.** O aviso é meia tela em tinta de pare: não há como
não ver. Uma entrada subindo faria os quatro botões varrerem a zona do polegar
durante 200 ms — pior. O risco do toque que cai nele é de comportamento: uma
janela curta (~300–400 ms) em que os botões do aviso recém-chegado não respondem.
Proposta para o coordenador, não movimento. A faixa cobrindo a saída é bug de
layout (§8.3).

---

## 6. Carregando e falha

| onde | o que mostra hoje | proposta |
|---|---|---|
| **Abertura** | "Abrindo o registro… Lendo o registro deste aparelho. Não precisa de rede." (`index.html:52`), texto parado. Medido (`micro-abertura.mjs`): fica **43–61 ms** depois do primeiro quadro sem freio — 3 a 4 quadros —, 160–250 ms com a CPU freada 4×, ~300 ms com 6×. | **É um piscar a cada abertura.** Mostrar a frase só depois de ~300–400 ms (animação CSS com atraso, opacidade 0 → 1 em degrau, sem fade): abertura rápida mostra só o fundo e o app; abertura lenta mostra a frase. Não é movimento: o portão de `src/base.css:374-380` zera a duração, não o atraso, e a frase aparece igual com movimento reduzido. Decido, não é gosto. |
| **"O registro deste aparelho não abriu"** | Tela inteira em DOM puro aos 4 s (`src/main.jsx:7199-7243`). | Sem movimento: é estado, e o primeiro quadro tem de dizer tudo. |
| **Sincronia** | Só em Ajustes: "sincronizando..." e o botão desabilitado (`src/ui/telas/ajustes.jsx:44-47`, `src/main.jsx:8834-8838`). | Sem movimento e sem girador: o texto diz o estado real, e o pulso do ponto ao vivo é de "a tela está viva", não de "trabalhando". |
| **Câmera** | "abrindo a câmera…", erros em frase; contagem em tela cheia com voz e bipe (`src/ui/telas/camera.jsx:94-98`); clarão de 320 ms (`src/componentes.css:1801-1803`, `src/main.jsx:12083-12087`); bloco da pose fecha por classe. | Nada novo: a três metros quem fala é a voz e o bipe; o número trocando já é a mudança. O clarão está em 320 ms e o requisito 17 da frente 4 dizia 140 ms (`docs/redesign/09-frente4-sistema.md:2392-2397`): divergência para o especialista de sistema, não minha. |
| **Foto preta** | "A … saiu preta. Ela volta no fim." (`camera.jsx:72`, `role="status"`) e o bloco tracejado. | Sem movimento: voz e texto. |
| **Foto que ainda não chegou** | "buscando a foto…" e, na falha, a causa real (`src/main.jsx:1567-1576`). A imagem aparece quando os bytes chegam. | Sem movimento. |

**Por que o esqueleto que cintila continua fora.** (1) Não há espera a encenar no
caminho normal: o dado é local e a abertura leva quatro quadros. (2) As esperas
reais (câmera, bytes da nuvem) já dizem o estado em palavras, **com a falha**: o
app consertou o "buscando a foto…" que mentia para sempre (`src/main.jsx:1546-1553`);
um cintilar diria "carregando" também quando a nuvem não vai devolver nada, que é a
mesma mentira em forma de movimento. (3) O argumento de norma da frente 4 (WCAG
2.2.2 a um segundo de reprovar, `09-frente4-sistema.md:2219-2232`) continua.

---

## 7. O que fica fora, e por quê

| ideia | por que não |
|---|---|
| Qualquer movimento de conquista ("feito", M/M séries, 14/14 copos, "Sessão completa") | O app não comemora (`MARCA.md`, `PRODUCT.md`); a recusa vale para quadro e curva, não só para frase (`docs/design-review/05-movimento.md` §2). |
| Contagem animada de número | Atrasa o valor verdadeiro e é a forma clássica de festa. |
| Movimento no fim do descanso | Quem não olha não vê; quem olha tem o "vai" e o som (§4.3). |
| Régua, teclado, RIR deslizando ou em fade ao abrir | Alvo que se move sob o polegar; altura é layout (§4.7). |
| Deslizar a lista para explicar um salto | "Deslizar conteúdo", recusado; e não traz de volta o que está fora da tela (§4.6). |
| Saída animada de painel que o `render()` remove | Seguraria na tela algo que o estado já tirou (§2, item 3). |
| Vibração | Não existe no Safari do iOS (§1.5). |
| Esqueleto, girador | §6. |

---

## 8. Achados no caminho (não são de movimento, mas a implementação vai tropeçar)

1. **O contador "séries N/M" mostra número velho.** `atualizaEstado` escreve
   `textContent` (`src/main.jsx:2144-2146`) e troca o nó de texto que o Preact
   guardava; dali em diante o Preact pinta num nó solto. Medido
   (`micro-contador.mjs`): depois de uma série, ligar o deload deixa a tela em
   **1/20** com o dado em **1/12**; mudar séries pela edição do dia, igual
   (`micro-render.mjs`: tela 0/23, dado 0/24). Corrige-se dando ao contador um
   escritor só. Área 03.
2. **No modo, o cronômetro e o toast flutuam 52 px acima do fundo**, com o
   conteúdo aparecendo por baixo: `#app:has(.ins-modo)` (`src/componentes.css:1250`)
   não alcança `#timer`/`#toast`, irmãos do `#app` (`index.html:58, 88`), e o
   comentário de `:1240-1249` afirma o contrário. Precondição de §4.3. Áreas 01/03.
3. **A faixa "Não guardado" cobre a saída do modo** (seta, hora e `···`):
   `.ng-faixa` fixa no topo, z 86 (`src/componentes.css:187-194`). Áreas 01/03.
4. **Dois comentários afirmam um movimento que não existe** (`index.html:60-70`,
   `src/main.jsx:5251`), e um token afirma um aprovado que não está no app
   (`src/tokens.css:421-423`). Corrigir na fase 3 junto com a doutrina.
5. **"Comi tudo" insere 145 px acima da linha tocada.** Sem rolagem, a linha desce
   157 px; com rolagem, no Chromium, o retorno nasce fora da tela; no Safari,
   provavelmente desce (a confirmar). Layout, área 06/10.
6. **O dedo, depois de certos toques, cai em outro controle:** na primeira série da
   sessão, a célula de carga da mesma série (a linha desce 52 px com o relógio e os
   controles que nascem no topo); depois de "Pular", o nome do exercício seguinte.
   Layout, área 03.
7. **Dois "+1 copo" rápidos com o aparelho recusando** podem desfazer o copo do
   segundo toque (`src/main.jsx:2755-2766`). Só na falha. Área 06.
8. **`:active` no iPhone sem ouvinte de `touchstart`** (§1.4). Precondição de §4.1.
9. **Toast de 3,6 s fixos para mensagens de até ~105 caracteres** (§5.1).

---

## 9. Decisões do dono

Cada uma é de gosto; o resto deste documento eu decidi.

**D1 · O toque que afunda.** Como está hoje: quase nenhum controle mostra o toque.
- (a) **Todo controle afunda** um pouco (os pequenos mais, os largos quase nada) e
  escurece de um jeito que se vê. *Consequência:* o toque passa a ser sentido em
  todo o app, inclusive no painel de pare. O que ele tocou e aprovou no protótipo.
- (b) Afunda só no que se toca no treino (régua, teclado, RIR, células, ±15); o
  resto só escurece. *Consequência:* o treino fica com a sensação do protótipo;
  Agora e Prescrição ficam mais quietos.
- (c) Só escurece, sem afundar. *Consequência:* zero movimento novo; o toque se vê
  pela cor, que no sol da academia é o canal mais fraco.
- **Recomendo (a)**, com as linhas inteiras só escurecendo (§4.1).

**D2 · A série recebida.** Como está hoje: o número troca na célula; nada diz onde.
- (a) **Pouso:** o número assenta na célula que o recebeu, em ~160 ms.
  *Consequência:* o olho acha a célula; nada se move fora dela.
- (b) **Voo:** o número sai do botão da régua e voa até a célula, ~250 ms.
  *Consequência:* liga o gesto ao destino de forma mais literal; mais código, e uma
  camada voando por cima da tela em ~22 séries por sessão.
- (c) Nada. *Consequência:* como hoje; quem diz é o anúncio para o leitor de tela e
  o cronômetro aparecendo.
- **Recomendo (a)** (§4.2).

**D3 · O cronômetro.** Como está hoje: aparece e some de uma vez no rodapé.
- (a) **Sobe da borda de baixo** ao começar e desce ao parar. *Consequência:* o
  começo do descanso é notado de canto de olho; exige consertar antes o vão de 52 px.
- (b) Como hoje. *Consequência:* nenhum custo; o descanso começa em silêncio visual.
- **Recomendo (a)** (§4.3).

**D4 · O toast.** Como está hoje: aparece, fica 3,6 s, some de uma vez.
- (a) **Entra subindo, sai apagando, e fica o tempo do texto.** *Consequência:* as
  mensagens longas passam a dar tempo de ler; a chegada é notada.
- (b) Só o tempo pelo texto, sem movimento. *Consequência:* resolve a leitura, não
  a chegada.
- (c) Como hoje.
- **Recomendo (a)**; o tempo pelo texto vale nas duas primeiras (§5.1).

**D5 · O painel de pare.** Como está hoje: aparece e some parado.
- (a) **Parado, como hoje.** *Consequência:* o painel que destrói dado continua o
  mais sóbrio da tela; difere da folha, se a folha passar a subir.
- (b) Igual à folha: sobe ao abrir, desce no "Deixar como está", some de uma vez no
  "Apagar". *Consequência:* coerência com a folha; o botão de apagar passa sob o
  polegar durante a subida.
- **Recomendo (a)** (§5.2).

---

## 10. As medições

| script | o que prova |
|---|---|
| `micro-render.mjs` | quais nós sobrevivem ao `render()` em cada toque (§2); o deslocamento de 84 px ao fechar a régua; o contador velho pela edição do dia; o que fica sob o dedo depois de "Pular". |
| `micro-toque.mjs` | o que cada controle mostra com `:active` forçado, e o contraste do fundo pressionado contra o fundo real (§1.3). |
| `micro-serie.mjs` | a série inteira: régua, toque, célula, cronômetro, anúncio; a linha que desce 52 px na primeira série; o vão de 52 px do cronômetro no modo; o avanço na última série. |
| `micro-agora.mjs` | "Comi tudo" com a página no topo (a linha desce 157 px); o "+1 copo" pinta ~4 ms depois, após gravar; a bolinha que enche é o mesmo nó. |
| `micro-ancora.mjs` | "Comi tudo" com a página rolada: o Chromium ancora e o retorno nasce fora da tela. Aceita `webkit` como terceiro argumento — não roda nesta máquina (falta `libevent`). |
| `micro-avisos.mjs` | o toast que pula 82 px com o cronômetro; o "Não guardei" chegando a ~809 ms, na zona do polegar; a faixa cobrindo a saída do modo. |
| `micro-abertura.mjs` | quanto tempo "Abrindo o registro…" fica na tela, com e sem freio de CPU. |
| `micro-contador.mjs` | o contador em 1/20 com o dado em 1/12 depois de ligar o deload. |

Todos rodam assim (servidor numa porta livre, contra o `dist/`):

```
python3 -m http.server 4723 -d dist &
CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node docs/motion/_medicao/micro-<nome>.mjs http://localhost:4723/ docs/motion/_medicao/shots/micro
```

**O que não verifiquei:** nada em WebKit nem em iPhone — o `:active` sem
`touchstart`, a ancoragem de rolagem do Safari, o háptico do `switch`; nenhuma
duração foi tocada em aparelho; se o toast é perdido por surgir sem movimento
continua hipótese.
