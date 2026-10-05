# 09 · Frente 2 — a interação e os estados

Esta frente não desenha lugar e não escreve código. Ela diz **o que aparece na
tela, o que acontece quando o dedo toca, e o que o dono vê quando dá errado** —
dentro dos cinco lugares que a frente 1 fixou, no modo de sessão que ela
definiu, e sob a precedência de cartão que ela escreveu.

É a maior das cinco porque é a única que o dono sente no dedo todo dia. E é a
que carrega o preço mais alto da direção escolhida: a régua de repetições, na
ação mais frequente do produto.

**Nenhuma linha deste arquivo tem estimativa de prazo ou de horas.** Ninguém
mediu isso.

---

## 0 · A convenção de prova, e o que eu abri

Quatro etiquetas, e elas valem para tudo:

- **conferi** — eu abri o arquivo nesta sessão e li a linha. O caminho fica ao
  lado.
- **conta** — eu calculei a partir de medidas que estão no fonte (larguras,
  vãos, contagens). A aritmética fica escrita, para poder ser refeita. **Conta
  não é medição em aparelho**, e onde ela substitui uma, está dito.
- **do plano / da rede / do parecer / do protótipo** — repito
  `07-plano.md`, `08-rede.md`, `06-parecer.md` ou `prototipo.md` sem reconferir.
  Fica marcado. E **o protótipo testou três minutos, não semanas**: impressão
  de uso, nunca hábito.
- **não medido** — ninguém mediu, e eu não invento número.

**Do desenho novo**, abri: `docs/redesign/09-frente1-lugares.md` inteiro (é a
régua desta casa), `07-plano.md` (§1.1, §1.2, §2 na parte da frente 2, §3.4,
§3.5, §3.6), `08-rede.md` (seções 1, 4 e 5), `09-desligamento.md` inteiro,
`09-frente0.md` na parte do diário e da bioimpedância, `06-parecer.md` (as
decisões 8, 9 e 15, a seção de acesso e a lista do que ninguém mediu),
`04-acesso.md` (a tabela de reprovações da D e as duas medições que faltam), os
dois `prototipo.md`, e os títulos de estado dos nove HTML da D
(`momento-1`, `momento-2`, `aula`, `comparar`, `corpo`, `prescricao`, `semana`,
`sessao-fotos`, `prototipo`). De `03-direcao-C/` abri `momento-1.html` na parte
do controle de repetições e do teclado próprio.

**Do `prototipo.html` da D eu abri o fonte**, não só o render: o CSS da zona do
polegar, a função `regua()`, `zonaRegistrar()`, `zonaDepois()`,
`zonaCorrigir()`, `centrarStrip()`, `ligarSessao()`, `registraSerie()`,
`corrigeSerie()`, `menuSessao()`, `folhaCarga()`, `renderCorpo()`, `render()`,
`tick()` e os dois `setInterval` do fim do arquivo.

**Do app que existe**, abri e li: `tests/dominio/estilo.test.ts` inteiro (os 38
casos, um a um), `index.html`, `src/base.css` na parte de `html`/`body`,
`src/ui/exercicio.jsx` na parte dos campos de série,
`src/ui/instrumento/folha.jsx` (a trava de scroll e o isolamento),
`src/ui/instrumento/telacheia.jsx`, `src/ui/folhas/refeicao.jsx` (a régua de
porções), `src/dominio/nutricao/calculo.ts` (`poeComidaNoDia`,
`pesoDaRefeicao`, `excessoDoDia`), `src/dominio/tipos.ts` (`PromoPendente` e
`Estado.promoPendente`), `src/dominio/sincronia.ts` (`chaveDePromo` e a fusão de
`promoPendente`), `docs/LASTRO_UX_CONTRACT.md` na linha do alvo, e de
`src/main.jsx` as funções `inp`, `inpRapido`, `limpaNum`, `obsIn`, `autoTimer`,
`projeta`, `toast`, `impactoDoMod`, `seriesOficiais`, `modsDoDia`, `bufferMods`,
`diaAberto`, `fechaSessao`, `finalizarSessao`, `guardaPromo`, `soltaPromo`,
`rot`, `nextDay`, `ultimaDoPlano`, `setEscala`, mais a declaração de `view`.

**O que eu não abri**, e por isso não afirmo nada sobre: `src/componentes.css`,
`src/treino.css`, `src/tokens.css` e `src/protocolo.css` (sei deles o que
`estilo.test.ts` afirma, que é bastante, e nada mais), `src/palco.js`,
`src/palco.css`, `src/sw.js`, e os nove HTML da D por inteiro — deles abri os
títulos dos 13 a 14 estados de cada e os trechos citados ao lado de cada
afirmação.

**Por que eu cito por nome e não por número de linha em `src/main.jsx`,
`src/dominio/**` e `tests/**`:** há outros agentes mexendo neles, e os números
andam. Nome de função, de constante e de tipo é estável. Nos nove HTML da D, em
`src/ui/**`, em `src/base.css` e em `index.html` — que ninguém está editando —
eu mantenho o número de linha.

**Três afirmações do meu briefing não bateram com o código.** Estão na seção 11,
com a prova ao lado. As três mudam trabalho: uma troca a causa do conserto da
régua, uma tira três dos sete estados ruins da lista de "já desenhados", e uma
mostra que a regra que eu ia especificar como nova já existe — e está apoiada
numa guarda que evapora.

### 0.1 · A especificação executável que eu já tinha: os 28 casos de `estilo.test.ts`

`08-rede.md` §4 diz que 28 dos 38 casos de `tests/dominio/estilo.test.ts` são
"invariante genérica" e sobrevivem se o redesenho os respeitar. **Li os 38, um a
um.** Eles não são régua de regressão da interface velha: são o que esta frente
ia redescobrir no aparelho, já escrito e executável. Os que amarram cada seção
deste documento:

| o caso | onde ele me amarra |
|---|---|
| *tela cheia usa svh, não vh* | o modo de sessão e a folha (§4, §7) |
| *espaço vertical fica na escala de 4* | toda medida de vão que eu propuser (a escala inclui **46**) |
| *a raiz recusa os gestos de zoom, e não só os botões* | a régua: `touch-action` na raiz é `pan-x pan-y`, e é por isso que o arrasto horizontal existe (§1.2) |
| *a pinça do WebKit é recusada* | idem; e §8.5, porque é o que bloqueia o 200% |
| *a barra deslizante toma o gesto* (`input[type=range]` com `touch-action: none`) | é o precedente escrito de "controle que toma o gesto em vez de disputá-lo" — a régua precisa do mesmo (§1.3) |
| *o campo nunca fica abaixo de 16px* | o teclado misto (§6) |
| *nenhum ancestral do sticky vira scroll container* | o cabeçalho do modo e a seta de saída (§7) |
| *o toast é anunciado por leitor de tela* | a única região viva do app, e o que §8.3 usa |
| *a tela cheia tem título de primeiro nível, e ele recebe foco* | a folha e o modo (§4.2, §7) |
| *nada entre a folha e a janela cria bloco de contenção* | a folha de pôr o dia em dia (§4) |
| *o cronômetro de descanso não anima largura* | o descanso dentro do modo (§5.3) |
| *o alvo do tick cresce só na vertical* | a régua: é exatamente o problema dela, já resolvido para outro controle (§1.3) |
| *controle pequeno estende o ALVO sem crescer o desenho* | §8.2, e é o mecanismo que salva a densidade |

**E quatro coisas que eu achei lendo os 38, que ninguém escreveu, e que fazem
diferença para quem for reescrever o CSS.** Não são achado de desenho; são
achado de rede, e eu os registro porque custam vermelho de graça:

1. **Pelo menos seis dos "28 genéricos" estão presos a um seletor literal, e
   dois a uma *lista* de seletores em ordem literal.** `08-rede.md` só declara o
   acoplamento dos 10. Mas *o campo nunca fica abaixo de 16px* casa
   `/\ninput,\s*textarea,\s*select\s*\{/` — a regra tem de existir com esses
   três elementos, nessa ordem, numa linha só; separar por elemento deixa o
   16px honrado em tudo e o caso **vermelho**. O mesmo em *mas campo e prosa
   continuam selecionáveis* (`p, .ins-prosa, input, textarea`). E
   *o voltar fica grudado no topo* (`.tc-topo`), *o alvo do tick cresce só na
   vertical* (`.ins-tick::after`), *a tela cheia tem título de primeiro nível*
   (`class="ins-display tc-titulo`) e *o cronômetro não anima largura*
   (`#tfill`) citam nome concreto. A conta do plano (10 acoplados, 28 livres)
   subestima; o número real de casos que um renome derruba é maior, e a rede
   diz "não medido: quantos dos 10 sobreviveriam renomeando só o seletor" —
   **vale para esses seis também.**
2. **O caso do `svh` não exige `svh`: exige que `100vh` nunca apareça sozinho.**
   A asserção itera as ocorrências de `height: 100vh` e pede `100svh` nos 200
   caracteres seguintes. CSS novo escrito só em `100svh` passa com **zero**
   iterações — e passa certo. CSS novo escrito só em `100vh` quebra. A forma que
   satisfaz as duas leituras é `height: 100vh; height: 100svh;`, nessa ordem.
3. **O caso da escala de 4 não olha `protocolo.css` nem os longhands laterais.**
   A lista é `['base.css', 'componentes.css', 'treino.css']` — `protocolo.css`
   está nas `FOLHAS` dos outros casos e **fora** deste. E a expressão casa
   `(padding|margin|gap)` com `-top|-bottom` opcionais: `padding-left: 7px` e
   `margin-inline: 7px` passam. A escala vale, mas o teste cobre menos do que
   parece — e quem detalhar não deve ler "passou" como "está na escala".
4. **Os dois casos de ancestral olham árvores diferentes.** *Nenhum ancestral do
   sticky vira scroll container* inspeciona **só `body`**; *nada entre a folha e
   a janela cria bloco de contenção* inspeciona `html|body|:root|*|#app`. Um
   `overflow: hidden` em `#app` mataria o `sticky` do cabeçalho do modo — que é
   onde mora a única saída — e **nenhum dos 38 casos pegaria.** É o defeito
   descrito na preferência global do dono ("header `sticky` que some sob a barra
   do navegador"), sem rede embaixo.

---

## 1 · A régua de repetições, consertada — e é o item mais caro da frente

A régua é a ação mais frequente do produto: **48 registros de série por semana**
(do parecer, decisão 8). É a única coisa desta frente que acontece dezenas de
vezes por semana, de pé, com uma mão, entre duas séries.

### 1.1 · O que está medido, e a aritmética que o reproduz

O número do cerco é **6 de 12 valores alcançáveis sem arrastar**, com a conta
"714 px de conteúdo em 382 px" (do parecer, tabela de acesso; C3 pela medida de
pixel, C1 pela captura). **Eu refiz a conta do fonte e ela fecha**, e por isso
eu posso estendê-la ao que ninguém mediu.

O que está no fonte (conferi, `03-direcao-D/prototipo.html:128`, `:135` e
`:137`):

```
.ctl   { padding: 8px 16px calc(6px + env(safe-area-inset-bottom)) }
.strip { display:flex; gap:6px; overflow-x:auto; scroll-snap-type:x proximity }
.rep   { flex:none; width:54px; height:64px; scroll-snap-align:center }
```

**A conta.** Num iPhone 11 Pro Max a janela tem 414 px de CSS. A faixa mora em
`.ctl`, que tira 16 px de cada lado: **382 px de largura útil**. Cada botão
ocupa 54 px e o vão é 6, então o passo é **60 px**. Um botão está inteiro na
janela quando começa depois da borda esquerda e acaba antes da direita, o que dá
uma sobra de `382 − 54 = 328 px` para distribuir: `328 ÷ 60 = 5,47`, mais o
primeiro. **No máximo 6 botões inteiros, sempre, qualquer que seja o
exercício.** Com 12 valores o conteúdo mede `12×54 + 11×6 = 714 px` — o número
do parecer, batido. **Conta.**

E é aqui que a conta diz mais do que a medida: **o "6" não é metade de 12; é um
teto.** Ele não depende do exercício, só da largura do botão e do vão. O que
varia é quantos ficam escondidos.

**Quantos valores a régua carrega, de verdade.** `regua(ref, fx, …)` monta de
`min(ref−4, fx[0]−1)` até `max(ref+5, fx[1]+2)` (conferi,
`prototipo.html`, função `regua`). Rodando isso contra os oito exercícios do
Treino A e as suas 20 séries (os dados estão em `var EX` no mesmo arquivo):

| valores na régua | em quantas das 20 séries | alcançáveis sem arrastar | escondidos |
|---:|---:|---:|---:|
| 10 | 15 | 6 | 4 |
| 11 | 2 | 6 | 5 |
| 12 | 2 | 6 | 6 |
| 13 | 1 | 6 | 7 |

**Conta.** O "6 de 12" medido é a elevação lateral unilateral no cabo, que tem a
faixa prescrita mais larga do treino (12–20 rep). Em 15 das 20 séries a régua
tem 10 valores e esconde 4. No pior caso — série 3 do mesmo exercício — ela tem
13 e esconde 7.

**E a faixa prescrita é cortada nas duas pontas, no caso medido.** Para a série
1 daquele exercício a régua vai de 11 a 22 e `centrarStrip()` a centra no 16
(a "última"). Pela mesma conta, ficam inteiros os valores **14 a 18**; 13 e 19
aparecem pela metade; **11, 12, 20, 21 e 22 exigem arrastar** — e 12 e 20 são
justamente os extremos da faixa que o treinador prescreveu. É o corte que C1
viu na captura. **Conta, e ela reproduz a captura.**

**O caso do treinador também confere.** F95 manda, depois de subir carga,
"recomeçar perto da base". Na elevação lateral na máquina (última 14, faixa
10–15) a régua vai de 9 a 19, centrada no 14: ficam inteiros 12 a 16, e **o 9 e
o 10 exigem arrastar**. É exatamente o "o 10 fica fora da tela à esquerda" que o
parecer registra, por dois caminhos independentes. **Conta.**

### 1.2 · As três causas, separadas — e a terceira não é o que o plano diz

O defeito tem três causas, com consertos diferentes. Misturá-las é o jeito de
consertar uma e achar que acabou.

**Causa 1 · A geometria.** 54 px de alvo com 6 de vão em 382 px de tela só cabe
seis. C3 nomeou a tensão sem saída fácil: "com 54 pt de alvo e 414 pt de tela,
12 números não cabem, e os dois requisitos — alvo grande e faixa inteira à
vista — não são simultaneamente satisfeitos pela forma escolhida" (do parecer).
Isto não é bug: é a forma.

**Causa 2 · O toque engolido como arrasto.** A faixa é `overflow-x: auto`, e a
raiz do app declara `touch-action: pan-x pan-y` — que é dizer ao navegador "o
gesto desta página é rolar" (conferi em `src/base.css`, com a razão escrita; é o
caso *a raiz recusa os gestos de zoom*). Num contêiner rolável na horizontal,
qualquer deslocamento do dedo durante o toque passa a ser pan, e o `click` não
dispara. O botão tem `touch-action: manipulation`
(`prototipo.html:45`), que mata o zoom de toque duplo e **não** impede o pan —
a propriedade efetiva é a interseção com os ancestrais, e `manipulation` já
inclui `pan-x`. **A frequência do engolimento é não medida**, e C2 escreveu por
quê: "precisaria de aparelho e de dedo — idealmente suado" (do parecer).

**Causa 3 · O `scrollLeft` que se perde — e não é o cronômetro.** O plano diz "o
`scrollLeft` perdido a cada render do cronômetro vizinho". **Conferi, e o
mecanismo é outro, com consequência pior.**

- `tick()` roda a cada 1 s e escreve **só** `textContent` e `style.width` em
  três nós (`[data-k="rest"]`, `[data-k="bar"]`, `[data-k="restr"]`). Ela **não
  chama `render()`** e **não toca na faixa.** Conferi a função inteira. O
  cronômetro de descanso, por si, não perde posição nenhuma.
- Quem perde é o **relógio de parede**. Um segundo `setInterval`, de 5 s,
  compara o minuto corrente e, quando ele vira, chama `save()` e `render()`
  (conferi, as últimas linhas de `prototipo.html` antes do
  `visibilitychange`). `render()` → `renderSessao()` → `sc.innerHTML = h` →
  `centrarStrip(sc)`.
- `sc.innerHTML = h` **destrói e recria a faixa inteira**, e `centrarStrip()` a
  reposiciona no `.rep.now` ou no `.rep.last` (conferi as duas funções).

**A consequência exata, e ela é diferente da que o plano descreve:** o arrasto
que o dono fizer para alcançar o 21 tem **validade de no máximo um minuto**, e a
perda chega num instante que ele não controla, dentro de uma janela de 5 s
depois da virada do minuto. Não é uma vez por segundo; é uma vez por minuto,
sem aviso, e **sem relação nenhuma com o descanso estar contando ou não** — vale
com cronômetro parado. Pior ainda: o `innerHTML` também derruba o **foco**, de
modo que quem navega por teclado ou VoiceOver perde o lugar na mesma batida.

**Também conferi o que o plano acertou:** `scroll-snap-type: x proximity` e não
`mandatory` (`prototipo.html:135`), e **três** `overflow-x: auto` —
`.map` (`:69`), `.also` (`:114`) e `.strip` (`:135`); o quarto `overflow-x` do
arquivo é `hidden`, em `.scroll` (`:57`). Bate.

### 1.3 · O conserto, em sete requisitos

O conserto não é "achar um valor melhor de `scroll-snap`". É tirar as três
causas, uma por uma, sem trocar a régua pelo controle que o dono recusou.

**R1 · A faixa deixa de disputar o gesto: ela o toma.**
`touch-action: pan-y` na faixa. O precedente está escrito e testado neste
repositório: `input[type="range"] { touch-action: none }`, com o caso *a barra
deslizante toma o gesto, em vez de disputá-lo com a rolagem*
(`tests/dominio/estilo.test.ts`, conferi). A régua é o mesmo problema: um
controle que se arrasta dentro de uma página que rola. `pan-y` e não `none`
porque a tela **precisa** rolar na vertical com o dedo em cima da faixa — a zona
do polegar é a parte baixa da tela e é onde o dedo pousa.

**Consequência que precisa ficar dita:** com `pan-y`, o arrasto horizontal
**deixa de existir como gesto do navegador**. Quem move a janela passa a ser o
app, por toque (R2) ou por botão (R3). Isso resolve a causa 2 por construção —
não há mais ambiguidade toque/arrasto porque não há mais arrasto — e é a única
forma de resolvê-la que não troca a régua por outra coisa.

**R2 · A régua anda por toque nas bordas, não por arrasto.** Os dois valores das
extremidades viram **dois alvos de andar**: tocar na borda esquerda rola a
janela um passo para a esquerda e tocar na direita, um para a direita, com
`scroll-behavior: smooth` e a mesma centragem. É o padrão que o app já usa em
outro lugar com razão escrita — abrir um exercício **rola até ele**, com
`scroll-margin-top` calculado do token do relógio (o caso *abrir um exercício
sabe onde parar de rolar*). Aqui o movimento é horizontal, e a diferença é que
ele é pedido, não arrastado.

**R3 · O alvo cresce sem o desenho crescer, e só na vertical.** A régua é o
caso-tipo do mecanismo que este repositório já tem: `::after` com
`position: absolute` e `inset` negativo, estendendo a área de toque sem mexer no
desenho. E a restrição que o app já descobriu vale aqui com mais força: *o alvo
do tick cresce só na vertical*, porque "na horizontal o vizinho é a repetição
seguinte: crescer para o lado faria um toque na borda registrar o número
errado" (`tests/dominio/estilo.test.ts`, conferi). **É literalmente a mesma
geometria e o mesmo risco.** Então: `inset: -Npx 0`, com o segundo valor em
zero, e nunca o contrário. O alvo visível fica em **46 px de altura no mínimo**
(§8.2) e os 64 px do desenho da D já passam disso.

**R4 · A posição da janela não se perde num re-render.** Duas metades:

- **A faixa não é reconstruída por mudança de relógio.** Atualizar hora e
  descanso é escrever texto em nós que já existem — é o que `tick()` já faz
  certo. A faixa **não pode** entrar no caminho de um `innerHTML` disparado por
  tempo. Na implementação em Preact isto quer dizer: a faixa tem `key` estável e
  o nó não é substituído; o que muda é o texto ao lado dela.
- **E se ela for reconstruída, a posição é restaurada, não recentrada.** A
  posição da janela passa a ser **estado derivado do valor em foco**, não um
  `scrollLeft` guardado — exatamente a disciplina que o app já usa para o
  descanso ("recalculado, nunca retomado de um contador",
  `tests/fluxo/cronometro.test.js`) e para a posição na sessão
  (`ondeEleEstava`, derivada e não guardada). A regra: a janela mostra sempre o
  valor em foco centrado, e **o valor em foco muda só por ato dele** — tocar
  numa borda (R2) move o foco um passo; não há nada mais que o mova.

**R5 · O desligamento vale aqui, e é por isso que ele existe.** `09-desligamento.md`
entregou `CTX.desliga()` e a lição em uma frase: *"a pergunta `if (desligado)
return;` depois de um `await` é o hábito que faltava"*. A régua é a tela com mais
continuação assíncrona por minuto do produto: a gravação da série, o
`queueSave()`, o `startTimer`, o avanço de exercício. **Requisito:** todo
caminho da régua que volta de um `await` para pintar confere o desligamento
antes. E a recíproca, que é o que o documento mediu: desmontar a árvore é o que
descarta o re-render enfileirado e o efeito pendente, então a régua **não pode**
guardar posição em variável de módulo que sobreviva à desmontagem — se guardar,
a próxima montagem herda a janela de uma sessão que acabou.

**R6 · A série guardada é anunciada.** É a reprovação grave da D
(**R-D1**: `<div class="saved">` sem `role` nem `aria-live`; conferi o
`zonaDepois()` do protótipo e é isso mesmo). E o preço é maior do que "falta um
atributo", porque **a régua remove um anúncio que hoje existe de graça**: hoje
o valor mora num `<input>`, e o campo ecoa o que foi digitado por ser campo
(`src/ui/exercicio.jsx:84-98`). Num botão não ecoa nada. O app tem **uma** região
viva, `#toast` com `role="status" aria-live="polite"` (`index.html:45`, com o caso
*o toast é anunciado por leitor de tela*), e hoje **registrar série não a usa** —
conferi as 94 chamadas de `toast()` em `src/main.jsx` e nenhuma é da gravação de
série. **Requisito:** a confirmação da série passa a ser anunciada, com o valor
dentro do anúncio ("55 kg × 9, série 3 guardada"), e `polite` e não `assertive`,
porque informa e não interrompe — é a razão escrita no `index.html`.

**R7 · O movimento é por adesão, e o toque não pisca.** A D põe todo o movimento
dentro de `@media (prefers-reduced-motion: no-preference)` e o parecer confirmou
que ela cumpre isso (`prototipo.html:305`, conferi). Fica. Duas coisas a mais,
e as duas vêm da experiência escrita do dono neste projeto:

- O `transform: scale(.95)` do toque (`prototipo.html:307`) **não** pode cair em
  cima da faixa como um todo, só no botão.
- A animação de "voar" o valor até a tabela (`voa()`, usada por `registraSerie`
  e por `corrigeSerie`) move um elemento **para a direita** quando a tabela está
  à direita do botão. É o caso documentado da preferência global: `translateX`
  positivo faz transbordar pela direita, cria barra de rolagem horizontal
  transitória, a viewport reflui e o que é fixo ou centrado pisca — no Blink, e
  só no sentido positivo. **Requisito:** um ancestral do conteúdo animado com
  `overflow-x: clip`, nunca `hidden`, porque `hidden` viraria `auto` no outro
  eixo e mataria o `sticky` do cabeçalho do modo, que é onde mora a única saída.
  O `body` do app já tem `overflow-x: clip`, e há um caso que o segura
  (*nenhum ancestral do sticky vira scroll container*) — mas ele olha **só o
  `body`** (§0.1, item 4), e a animação acontece dentro de `#app`.

### 1.4 · A régua do peso, que ninguém mediu, e é pior

A mesma forma aparece em Corpo, para registrar a pesagem da manhã
(`prototipo.html`, `renderCorpo`, conferi). Lá os botões são `.rep.w` com
**76 px** de largura (`:143`) e a régua tem **13 valores** — de 73,0 a 74,2, de
100 em 100 g (conferi o laço `for (var g = 730; g <= 742; g++)`).

**A conta, com a mesma fórmula:** passo de 82 px, sobra de `382 − 76 = 306`,
`306 ÷ 82 = 3,73`. **No máximo 4 de 13 valores inteiros na janela**, com 1060 px
de conteúdo em 382 px de tela. Centrada no 73,6, ficam inteiros 73,5 a 73,7;
73,4 e 73,8 aparecem pela metade; **73,0 a 73,3 e 73,9 a 74,2 exigem arrastar**.
**Conta — e ninguém mediu esta.** C3 mediu a régua de repetições; o parecer
registra 6 de 12 e não fala do peso.

Três coisas que mudam o peso disto, e nenhuma na direção de deixar como está:

1. **Aqui o alvo seguinte é mais perigoso que na régua de repetições.** Um toque
   na borda errada registra 73,5 em vez de 73,6 — 100 g de diferença numa medida
   cuja razão de existir é a **média semanal** e a **taxa entre semanas** que a
   regra do nutricionista lê (`veredito` em `src/dominio/corpo.ts`, com
   `MIN_REGISTRADOS = 11`). Erro de dedo na régua de repetições some no volume;
   erro de dedo na régua de peso entra na conta que decide ±150 kcal.
2. **Em compensação, a correção é mais barata**: uma medida por dia, e
   registrar de novo no mesmo dia substitui (está escrito na própria tela do
   protótipo, e é a regra do app — `tests/fluxo/corpo.test.js`, 25 casos).
3. **E o relógio não a derruba:** o `setInterval` do minuto só chama `render()`
   quando a tela é `sessao` ou `agora` (conferi), então Corpo não perde a
   posição por tempo. Perde por qualquer outro `render()` — fechar a folha de
   "Outro valor", por exemplo, porque `renderCorpo` também chama
   `centrarStrip(sc)`.

**Requisito:** os sete requisitos de §1.3 valem para as duas réguas, e a
medição de §1.5 cobre as duas. Trocar só a de repetições deixaria o defeito
inteiro no lugar onde o dado é mais caro.

### 1.5 · O protocolo de medição — e eu não posso executá-lo

**Eu não medi nada do que está aqui, e não dá para medir sem o aparelho e o dedo
dele.** C2 escreveu a razão em quatro palavras: *"precisaria de aparelho e de
dedo — idealmente suado"* (do parecer). Jsdom não faz layout, Chromium em modo
mobile não tem dedo, e a mão seca de quem está sentado não é a mão que o produto
atende. O que segue é o protocolo para **o dono executar**, e ele é escrito para
dar um número que reprova ou aprova — não uma impressão.

**Condições, e nenhuma é negociável para o número valer:**

- iPhone 11 Pro Max, **instalado na tela de início** (sem barra de navegador — é
  o F55, e é o que o protótipo descobriu que muda tudo).
- **De pé, uma mão**, a mesma que ele usa de verdade na academia.
- **Na academia, entre séries** — não sentado à mesa. A luz da academia, a luva
  e o magnésio nunca foram medidos (`01-fatos.md`, e o parecer registra isso na
  lista do que ninguém mediu); este protocolo não os isola, ele os inclui.
- **Duas passadas: mão seca e mão suada.** A suada é a que importa; a seca é o
  controle, para saber quanto do erro é do suor e quanto é da forma.
- **Antes e depois do conserto, no mesmo aparelho e nas mesmas condições.** O
  "antes" roda no `docs/redesign/03-direcao-D/prototipo.html`, que já está de pé
  e é a direção escolhida sem retoque. Sem o "antes", o "depois" não tem contra
  o que ser comparado, e o conserto fica sendo opinião.

**Medição A · O toque engolido.** 60 tentativas por passada, em **3 blocos de
20**, com os blocos separados por séries reais (não 60 toques seguidos: 60
toques seguidos medem fadiga de dedo, não uso). Cada tentativa é "registrar a
repetição que acabou de sair". Para cada uma, um de três resultados:

| resultado | o que foi |
|---|---|
| **acertou** | registrou o valor pretendido no primeiro toque |
| **engoliu** | o toque não registrou nada — virou arrasto |
| **errou o alvo** | registrou um valor **diferente** do pretendido |

**O número que reprova:** mais de **3 engolidas em 60** (acima de 5%), **ou**
**1 ou mais erros de alvo em 60**.

Por que esses dois números, e eles são diferentes de propósito:

- **5% de engolidas** em 48 séries por semana são 2 a 3 toques repetidos por
  semana. Engolir é visível — nada acontece, ele toca de novo —, então o custo é
  esforço, não dado. Um a cada vinte é o teto do que vale pagar por uma forma
  que o dono escolheu.
- **Erro de alvo tem tolerância zero** porque a única defesa contra ele é o dono
  **ler** a confirmação. O R6 de §1.3 faz a confirmação existir e ser anunciada;
  ele não força ninguém a ler. Um erro de alvo em 60 toques são cerca de 40
  repetições erradas por ano entrando no histórico que alimenta a leitura de
  força. E na régua de peso (§1.4) um erro de alvo entra na média semanal que
  decide ±150 kcal.

**O que 60 tentativas provam e o que não provam, dito antes de alguém se animar
com um zero:** 60 tentativas sem nenhuma engolida são compatíveis com uma taxa
real de até cerca de **5%** — é o limite superior de 95% de confiança para zero
em 60. Então "zero em 60" significa "abaixo de 5%", não "resolvido". Para
afirmar abaixo de 1% seriam ~300 tentativas, que são mais de seis semanas de uso
dele. **Este protocolo mede o que dá para medir numa semana, e o documento diz o
que ele deixa de fora.** É a mesma honestidade de `09-desligamento.md`: dez
execuções limpas não provam que a intermitência acabou.

**Medição B · O alcance.** Para cada uma das 20 séries do Treino A, contar
**quantos toques** vão da régua aberta até o valor registrado. Separar os casos
em que o valor pretendido está na janela dos seis e os casos em que não está —
e anotar qual era o valor, porque a conta de §1.1 prevê exatamente quais caem
fora.

**O número que reprova:** mediana acima de **1 toque**, **ou** qualquer série
que custe mais de **3**.

Por que: um toque é a tese da direção. O parecer já registrou que na direção C
o valor provável depois de uma subida de carga custa **4 toques** — e foi um
dos motivos da crítica a ela. Se a régua consertada chegar aos mesmos 4, ela
perdeu a disputa por dentro.

**Medição C · A janela sobrevive ao minuto.** Andar com a régua até um valor
fora da janela inicial, **não tocar em nada por 70 segundos** com o telefone na
mão, e olhar se a janela continua onde estava. Repetir 5 vezes, uma delas com o
descanso contando e uma delas com o descanso parado.

**O número que reprova:** **1 ou mais** deslocamentos em 5. Esta não tem
tolerância porque não é estatística: ou o re-render move a janela, ou não move.
É a causa 3 de §1.2, e é a única das três que tem resposta binária.

**Medição D · A régua do peso.** As medições A e B, com 20 tentativas em vez de
60, na régua de Corpo. Vinte e não sessenta porque a pesagem acontece uma vez
por dia e sessenta tentativas seriam um teste de outra coisa. **Com 20
tentativas o teto de confiança sobe para cerca de 14%** — então aqui o número
que reprova é só o de erro de alvo (1 ou mais em 20), e a taxa de engolida fica
declarada como **medida grossa**, não como aprovação.

**O que registrar junto de cada número**, porque sem isto a medida não se
reproduz: a data, se a mão estava seca ou suada, qual exercício, qual série,
qual valor pretendido, qual valor registrado, e se o telefone estava na mão ou
apoiado. Uma linha por tentativa. **Nenhum número deste protocolo vale sem a
linha que o produziu.**

### 1.6 · Se o toque continuar sendo engolido: o que volta à mesa dele

Isto não é proposta minha, é registro do que já está medido e decidido, e eu o
escrevo aqui para **ninguém trocar por conta própria**.

Se, depois dos sete requisitos de §1.3, a medição A ainda reprovar, **a
alternativa medida como melhor é o controle de botões fixos da direção C** —
sete botões que se dividem a largura disponível, sem rolagem nenhuma. Conferi a
forma no fonte: `.chips { display:flex; gap:6px }` e
`.chip { flex:1; min-width:0; height:64px }`
(`03-direcao-C/momento-1.html:151-152`), com sete `<button class="chip">` por
linha (`:360-368`). **Conta:** em 382 px com seis vãos de 6 px, cada botão fica
com `(382 − 36) ÷ 7 = 49,4 px` — e isso bate com a medida independente de C3,
"os botões de repetição medem 49 × 64 e 52 × 64 px" (do parecer). A mesma
fórmula que reproduziu a régua reproduz o controle de C, o que é o melhor
atestado que a conta pode ter.

**E o dono recusou esse controle ao escolher a régua.** A escolha está feita e
não se reabre aqui. O que está escrito é a condição: C2 chamou os sete botões
fixos de "**vantagem técnica — sem ambiguidade toque/arrasto na ação mais
frequente**" e a régua de D de "**o preço mais alto de D**: toque engolido como
arrasto na ação mais frequente (48/semana medidas)" (do parecer, decisão 5).

**O que C paga, e é por isso que ele a recusou**, para a mesa dele ter os dois
lados:

- **Sete valores em vez de 10 a 13.** O parecer mediu o caso que quebra: com os
  sete botões centrados na última (15), mostrando 12–18, **o 10 e o 11 — que são
  o valor provável depois de uma subida de carga, e estão dentro da faixa
  prescrita — não estão na janela**, e a saída custa 4 toques pelo teclado
  próprio. É o **mesmo caso** que quebra a régua de D, por um caminho oposto:
  em C o valor não existe no controle; em D existe e está fora da tela.
- **O limite de contraste.** C3 mediu: `.chip`, o botão mais tocado do produto,
  com preenchimento **1,00:1** — branco sobre branco (R-C1). E a inversão: os
  valores **fora** da faixa medem 3,55:1 e passam; os **dentro** medem 1,55:1.
  Isto é defeito de C, não da forma — mas é o que está medido dela.

**Portanto:** se a medição A reprovar, o que sobe à mesa dele é a escolha entre
três coisas, com o preço de cada uma escrito, e **nenhuma delas é "deixar como
está"**: (a) os sete botões fixos de C, perdendo valores e ganhando a
ausência de ambiguidade; (b) a régua com o alvo menor, cabendo mais valores e
piorando o erro de dedo — que é justamente a tensão que C3 nomeou como sem saída
fácil; (c) a régua como está, aceitando a taxa medida como custo declarado.
**A decisão é dele.**
