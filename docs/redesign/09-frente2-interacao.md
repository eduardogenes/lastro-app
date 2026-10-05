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

---

## 2 · As linhas do dia como alvo (peça 1) — e o preço mudou de lugar

**A frente 1 derrubou a premissa e eu reconferi.** `ehLinhaDeTreino(r)` devolve
`r.id === 'treino'` (conferi em `src/main.jsx`) — é teste de **tipo de linha**,
não de sessão ativa. Toda linha de refeição do app de hoje tem as três
afordâncias com ou sem sessão aberta, e eu as li no componente:
`LinhaTimeline` monta a `Caixa` quando recebe `aoMarcar`, o corpo da linha como
`<button class="ins-tl-toque">` quando recebe `aoAbrir`, e o
`<button class="ins-tl-mais" aria-label="editar …">···</button>` quando recebe
`aoEditar` (conferi `src/ui/instrumento/timeline.jsx:45`, `:46-53` e `:60-62`).

**Então a peça 1 custa zero no Agora de hoje.** Onde ela custa é na lista que a
direção D desenhou, e eu fui conferir no fonte do protótipo. É pior do que "sem
controle":

```html
<li class="…"><svg class="si">…</svg><time>…</time>
  <span class="nm">…</span><span class="st">…</span></li>
```

(conferi, `03-direcao-D/prototipo.html:1029-1030`). **Nenhum botão, nenhum
`role`, nenhuma caixa de marcar, nenhum `···`, em nenhuma das linhas do dia.** A
única coisa tocável na região é a pílula "+1 copo" da água (`:1035`). E os 14
quadradinhos da regra do nutricionista são `<i class="cell">` vazios (`:1044`) —
sem nome acessível e sem `aria-hidden`, o que os põe entre os 178 ícones mudos
de §8.1; aqui são decorativos de verdade, porque a frase logo abaixo carrega o
número ("Dias com marca nos últimos 14: 11"), e por isso a resposta certa para
eles é `aria-hidden`, não rótulo.

**O requisito, então:** a linha do dia no Agora volta a ter as três afordâncias
que o app já tem, nas três situações em que a frente 1 já disse que elas valem —
hoje, com sessão aberta e sem. Nada de novo precisa ser inventado; o que precisa
é **não** nascer inerte.

**Três coisas que a volta das afordâncias arrasta, e que são interação:**

1. **O alvo não pode ser forçado duas vezes.** A linha da timeline **já é** o
   alvo, e o caso *alvo de toque não é forçado duas vezes* afirma que
   `.ins-tl-toque` não tem `min-height` — com a medida que motivou a regra
   escrita no teste: um `min-height` ali engordou a timeline em 16 px por linha
   (conferi, `tests/dominio/estilo.test.ts`). A caixa de marcar é que é
   pequena, e ela está na lista dos que estendem o alvo por `::after`
   (`.ins-caixa`, mesmo arquivo).
2. **O `···` precisa continuar com nome escrito.** Hoje tem
   (`aria-label="editar {nome}"`). Três reticências sem nome é o caso 1.1.1 em
   miniatura, e é o tipo de atributo que se perde numa reescrita de componente.
3. **A ordem dos três alvos na linha é a ordem de leitura.** `tabindex` positivo
   não existe no app e não pode nascer aqui — o caso *2.4.3* do
   `04-acesso.md` registra "zero `tabindex` positivo nos quatro arquivos; a
   ordem do DOM é a ordem de leitura". Caixa, corpo, `···`: é a ordem do
   componente de hoje e é a ordem certa, porque a mais frequente vem primeiro.

**O que NÃO aterrissa aqui:** pôr a timeline inteira dentro do modo de sessão. A
frente 1 já resolveu isso por outros dois caminhos (a seta e as entradas rápidas
do descanso) e citou o dono contra: *"na hora do treino pode ficar mais limpa"*
(do parecer, decisão 15). Eu não reabro.

---

## 3 · Cada toque grava (peça 2) — o requisito é NÃO construir o lote, e o protótipo construiu um

**A gravação já é assim**, e o fonte diz por quê: *"Não existe estado 'não
salvo'"* (conferi em `src/main.jsx`, acima de `abreSessao`). Cada série completa
vai para o histórico na hora, por `projeta()`, que é chamada por `inp()` a cada
tecla (conferi as duas). `marcaRefeicao` grava no mesmo gesto. `save()` é
chamada em 59 lugares (**do plano** §3.3 — não recontei).

**Então o requisito é negativo, e eu o escrevo com todas as letras para ninguém
recomprar: não se constrói o lote.** Não é "não acrescentar um botão de
guardar" — é mais forte, porque **o protótipo já tem um**, e ele é a forma
canônica do lote:

- a folha de pôr em dia abre com um acumulador local, `var estado = {}`;
- cada toque escreve **só nesse acumulador**;
- o disco é tocado uma vez, no `click` de
  `el("button","primary", ontem ? "Guardar segunda" : "Guardar hoje")`, que vive
  no rodapé da folha;
- e esse botão fica **desabilitado** enquanto uma pergunta não é respondida, com
  o rótulo trocado para "Responda a pergunta para guardar".

Conferi as quatro coisas em `folhaPorEmDia()`,
`03-direcao-D/prototipo.html:1144-1245`.

**O que isso significa de concreto:** quem implementar a folha a partir do
protótipo vai copiar o lote junto, porque ele é a arquitetura do arquivo. A
decisão do dono é o contrário (P3.i.6: o pré-marcado é sugestão **até o toque**;
um toque em qualquer linha fecha o dia), e a frente 1 já tirou a consequência de
camada: **fechar a folha sem tocar em nada não grava nada**, e isso não é efeito
colateral a consertar — é a diferença entre sugestão e registro, e é o que
impede o F290/F292.

**Requisito, em três linhas:** sem acumulador local; cada toque chama
`poeComidaNoDia` e grava; o rodapé da folha não tem botão de guardar. O que
sobra no rodapé é a frase de leitura de volta (§4.3), que informa e não
comanda.

**E uma guarda que precisa ficar escrita, porque ela vem de graça e se perde de
graça:** `poeComidaNoDia` **não reescreve a linha nem adianta o `m`** quando a
chamada não muda nada (conferi o `JSON.stringify(... { m: 0 })` na função). Com
gravação a cada toque, isso deixa de ser detalhe e passa a ser o que impede o
aparelho de afirmar ser a cópia mais nova de um dia que ele não tocou, dezenas
de vezes por folha aberta.

---

## 4 · A folha de pôr o dia em dia

Esta é a peça que **muda regra**. Ela volta à mesa do dono **desenhada**, e esta
seção é o desenho.

### 4.1 · O chão que já existe, e os seus limites

A frente 0 entregou `poeComidaNoDia` (`src/dominio/nutricao/calculo.ts`), com 14
casos em `tests/dominio/diario.test.ts`. **Li o contrato inteiro antes de
desenhar.** O que ela aceita, o que ela recusa e o que ela faz:

| o que | o contrato |
|---|---|
| **recusa data futura** | `'futuro'` quando `data > hojeISO`. Dia que não aconteceu não se registra |
| **recusa data ilegível** | `'data'`. `d` é a chave natural do histórico **e** a da fusão |
| **recusa dia que continua mudo** | `'mudo'`. Dia vazio não vira linha: guardá-lo como zero diria que ele não comeu |
| **completa, não substitui** | `done`, `como` e `escala` se unem chave a chave, o que vem agora vencendo |
| **água só se vier** | `agua` escreve só com `c.agua != null`; sem isso, o que a linha tinha fica |
| **recongela o total, com `pv` novo** | o congelamento protege o passado de mudança no **plano**, não nas **marcas** |
| **não bumpa `m` sem mudança** | chamada que não muda nada devolve a linha anterior |
| **`ajuste` é de quem chama** | `null` preserva; a função não adivinha o que vigorava naquele dia |
| **o plano é o de HOJE** | o plano daquela data não existe em lugar nenhum; `pv` registra isso |

**Os três limites que a tela tem de dizer em voz alta**, porque a função não
mente e a tela não pode:

1. **"Este dia foi contado contra o plano de hoje."** É o `pv`, e a própria
   frente 0 escreveu que existe para a tela poder dizer isso. Se ele puser em
   dia uma terça de antes da ceia entrar no plano, o dia é recalculado contra um
   plano de **sete** refeições. A folha precisa dizer qual plano usou — e
   `PLANO_DESCANSO`/`PLANO_TREINO` do dia também: o protótipo abre a segunda com
   o plano de descanso, de quatro refeições (**do protótipo**, nota da data), o
   que hoje seriam cinco, com a ceia.
2. **Pôr um dia em dia não apaga nada.** Marca nova vence marca velha chave a
   chave; o resto fica. A folha não oferece "limpar o dia", e **não pode**
   oferecer: apagar um dia do histórico é destrutivo, não foi desenhado
   (`07-plano.md` §4) e `poeComidaNoDia` não faz isso.
3. **Um dia que ficar mudo depois de ele mexer continua mudo.** Se ele abrir a
   folha, desmarcar tudo e sair, a função devolve `'mudo'` e a linha anterior
   fica como estava. A folha tem de dizer isso em vez de piscar um sucesso — é o
   caso em que o resultado da gravação é "nada mudou", e o app já tem doutrina
   contra falso sucesso.

### 4.2 · O que a folha mostra

Ela é uma **folha**, no sentido que este repositório dá à palavra: o único padrão
modal do sistema, `position: fixed`, com trava de scroll por
`position: fixed` no `body` (porque no iOS `overflow: hidden` não segura o
scroll de toque) e com `inert` nos irmãos, porque `aria-modal` descreve a
intenção e quem impede o foco de vazar é o `inert` — 39 elementos continuavam
tabuláveis atrás do modal antes disso (conferi
`src/ui/instrumento/folha.jsx:10-60`, e a medida está no comentário). **Ela
herda tudo isso e não reinventa nada.**

Três consequências de camada que já estão resolvidas e que o desenho não pode
contrariar:

- **Folhas empilham três níveis, nunca mais** — "na quarta ninguém mais sabe o
  que fechar leva de volta para onde" (`folha.jsx`, cabeçalho). A folha de pôr em
  dia é nível 1; se ela abrir a folha de uma refeição, é nível 2; o editor é
  nível 3. **Não há nível 4**, então a folha de pôr em dia não pode abrir uma
  refeição que abre um alimento que abre uma régua.
- **Nada entre a folha e a janela pode criar bloco de contenção** — nem
  `transform`, nem `filter`, nem `backdrop-filter`, nem `will-change`, nem
  `contain`, em `html`, `body`, `:root`, `*` ou `#app`. Há caso para isso
  (*nada entre a folha e a janela cria bloco de contenção*), e ele é de fonte e
  não de DOM, de propósito: "o defeito nasce de uma linha nova em `html`, `body`
  ou `#app`". Vale para a animação de entrada da folha também.
- **O Voltar do sistema fecha uma folha por vez** (`src/ui/navegacao.js`;
  `tests/fluxo/navegacao.test.js`). Fechar a folha é fechar uma camada, não
  confirmar nada.

**O conteúdo, de cima para baixo:**

1. **O título, que é a data, e é `h1` com foco.** O caso *a tela cheia tem
   título de primeiro nível, e ele recebe foco* vale para o destino de tela
   cheia; a folha precisa do equivalente, e `TelaCheia` mostra a forma:
   `tabindex="-1"` e `.focus({ preventScroll: true })`, "foco sem mexer no
   scroll, que já foi para o topo" (conferi `telacheia.jsx:19-40`). Sem isso,
   para teclado e VoiceOver a tela muda e o cursor fica atrás.
2. **A linha de procedência, que diz qual plano foi usado** (§4.1, item 1).
3. **Uma linha por refeição do plano daquele dia**, em ordem de relógio, com o
   horário **do plano** — a decisão 14.6 (o previsto usa o horário do plano) e a
   regra que a frente 1 confirmou.
4. **A água, separada das refeições**, porque "não contei a água" é fato e não
   ausência (é a terceira das cinco mudanças de dado do plano §3.4).
5. **A frase de leitura de volta**, numa região viva (§4.3).

### 4.3 · O que um toque faz, e o que a tela diz de volta

**Abre pré-marcada como sugestão.** Conferi a regra no protótipo e ela está
certa:

```js
estado[m.k] = ontem ? "tudo" : (S.ref[m.k] || (m.h > agora ? null : "tudo"));
```

(`prototipo.html:1149-1152`). Para um dia passado, tudo vem marcado como comido;
para hoje, o que já tem marca mantém a marca dele, o que já passou da hora vem
como "tudo", e **o que ainda não aconteceu vem sem marca.**

**Nada daquilo é registro.** A diferença entre o pré-marcado e o registrado tem
de ser visível sem leitura de texto, e o protótipo já distingue as duas no
desenho: a classe `me` para o que foi declarado na hora e `pv` para o que é
previsão (conferi `naHora` em `:1161` e as duas classes em `:1167-1174`).
**Requisito:** a distinção não pode ser só de cor — é 1.4.1, e o
`04-acesso.md` já cobra isso em outro ponto ("não pode ser marca só de cor").
Forma, peso ou palavra, junto com a cor.

**Um toque em qualquer linha fecha o dia.** É a decisão do dono (P3.i.6), e com
a gravação a cada toque (§3) ela tem uma consequência precisa que precisa estar
dita: **o primeiro toque grava o dia inteiro como está sugerido**, e cada toque
seguinte corrige uma linha. Não é "o toque grava aquela linha" — é "o toque
transforma a sugestão inteira em registro, com a linha tocada já corrigida".
Qualquer outra leitura exige um botão de guardar, e o botão está proibido.

**E é por isso que a frase de leitura de volta é obrigatória, não ornamento.** Se
um toque grava sete refeições, a tela tem de dizer **as sete**, com as palavras
que foram gravadas, antes e depois. O protótipo já faz isso certo, e esta é a
melhor coisa dele: a frase é montada por `frase()` e vive num nó com
`aria-live="polite"` (conferi `:1192` e `:1196-1198`), e ela diz inclusive o que
**não** foi marcado ("Fica sem marca: jantar."). **Requisito:** a frase fica, com
`aria-live="polite"`, e passa a dizer também **o que acabou de ser gravado** —
porque agora a gravação acontece durante a frase, não depois dela.

### 4.4 · As refeições que ainda não aconteceram

Ficam **desabilitadas** — é o achado 7 do protótipo, e conferi a implementação:
`var futuro = (!ontem && m.h > agora && !S.ref[m.k])` e, nos quatro botões da
linha, `if (futuro) b.disabled = true`, com o rótulo "por vir" no lugar do
horário (`:1161-1171`).

**Está certo e eu não mexo na regra.** Pré-marcar o jantar das 19h30 às 15h30
seria exatamente o erro que esta direção recusa. Duas coisas a acrescentar, e as
duas são de interação:

1. **Desabilitado precisa dizer por que, e "por vir" diz.** Um controle inerte
   sem explicação é o beco que §7 trata. Aqui a explicação existe e está na
   própria linha. **Requisito:** ela continua na linha, não num rodapé.
2. **O limite é a hora do plano, não a de agora, e isso tem um canto.** `m.h >
   agora` compara o horário **do plano** com o relógio. A ceia é 21:30
   (conferi `src/dominio/nutricao/alimentos.ts:126`), então entre 21:30 e a
   virada da data a ceia deixa de ser "por vir" e passa a vir pré-marcada como
   comida. Isso é o comportamento certo — mas significa que **a folha aberta às
   22h sugere que ele já tomou a ceia**, e o pré-marcado é sugestão: o primeiro
   toque em qualquer linha a grava. **Requisito:** a última refeição do dia
   nunca entra pré-marcada por passagem de horário; ela entra pré-marcada só
   quando o dia já está fechado (dia passado). Para hoje, a refeição cuja hora
   passou há menos de 30 minutos fica sem marca, pela mesma razão que a janela
   de 30 min existe na regra do cartão de cima (frente 1, §5.1, regra 4).

### 4.5 · Fechar sem tocar, e o que o Voltar faz

**Fechar a folha sem tocar em nada não grava nada.** Nem o pré-marcado, nem a
água, nem nada. Três caminhos levam a isso, e os três têm de ter o mesmo
resultado: o véu, o Voltar do sistema, e o botão de fechar da folha.

E a recíproca, que é o que torna a regra honesta: **se ele tocou uma linha, o
dia está gravado, e fechar não desfaz.** Não existe "cancelar" depois do
primeiro toque, porque não existe lote. O que existe é **reabrir e corrigir**,
que é o caso de uso que `poeComidaNoDia` foi escrita para atender ("corrigir a
porção de um dia passado é o caso de uso", frente 0). **Requisito:** a folha não
tem "Cancelar". Oferecer um cancelar que não cancela é falso.

### 4.6 · O que a folha precisa e o chão não permite — quatro coisas

Aqui eu segui a instrução ao pé da letra: **não especificar comportamento que a
função não permite sem dizer que precisa mudar.** Quatro achados, e o terceiro é
o mais grave.

**1 · "Não comi" não está na folha, e é a capacidade que destrava o portão.**
O domínio tem `ComoFoiARefeicao = 'fora' | 'nao'` (conferi,
`src/dominio/nutricao/tipos.ts:110`), e `'nao'` é **"não comi esta refeição",
dito como fato**. A frente 0 escreveu por que ele importa: *"declarar 'não comi'
com um toque passa a produzir um dia **contado**, em vez de silêncio — que é o
que torna o portão alcançável"* (o portão é `MIN_REGISTRADOS = 11` em 14). E
`pesoDaRefeicao` devolve **0** para `'nao'`, de propósito: é zero conhecido, não
ausência.

**A folha do protótipo não o oferece.** Os quatro botões por linha são
`Tudo · Metade · Fora · Não sei` (conferi `:1165`). "Não comi" não está lá, e
"sem marca" — que é o que sobra para quem pulou uma refeição — é **silêncio**, e
silêncio não conta para o portão. Ou seja: **a folha, como desenhada, não
alcança a única razão pela qual o dono ganharia dias contados ao pôr um dia em
dia.** Isto não exige mudar a função; exige um quinto botão. **Requisito:** a
linha oferece **"Não comi"**, e a frase de leitura de volta o distingue de "fica
sem marca" com palavras diferentes, porque são coisas diferentes no dado.

**2 · "Não sei" é por refeição na tela e por DIA no dado.** O protótipo trata
`nsei` como estado de uma refeição (`estado[m.k] = "nsei"`). No domínio não
existe: `ComoFoiARefeicao` tem dois valores. O que existe é
`aderencia: 'plano' | 'fora' | 'perdido'`, que é campo **do dia** (conferi em
`ComidaDoDia` e em `DiaComidaHist`). E o próprio texto do protótipo confirma que
a consequência é do dia: *"Não sei: o dia deixa de contar para a regra — e é
melhor assim do que um número inventado"* (`:1227`).

**Requisito:** o controle pode ficar na linha, mas **a tela tem de dizer que ele
vale o dia**. Marcar uma refeição como "não sei" tira o dia **inteiro** da conta
do nutricionista, e um controle por linha com efeito de dia que não anuncia isso
é a definição de consequência escondida. A frase de leitura de volta é o lugar
certo para dizê-lo, e ela já é região viva.

**3 · Porção acima de 1 não existe na folha, e o dono disse que ela existe.** O
app de hoje tem cinco porções — `½ · ¾ · cheia · 1¼ · 1½` — em
`src/ui/folhas/refeicao.jsx:14-15` (conferi), e duas delas estão **acima de 1**,
que é o "comi mais que o plano". A folha de pôr em dia oferece só
`Tudo · Metade`, isto é, `escala: 1` e `escala: 0.5`. **Conclusão:** hoje "comi
uma vez e meia o almoço" só se diz no dia corrente, pela folha da refeição —
pôr um dia em dia não alcança a porção que o dono pediu. **Requisito:** a linha
da folha abre a régua de porções quando ele quiser mais que Tudo/Metade, e a
régua é a que já existe, com os cinco valores. Não é campo novo nem função nova:
`escala` é `Record<string, number>` em `ComidaDoDia`, e aceita 1,5.
`prototipo.md` registra que o desenhista **não** inventou os valores de
propósito ("inventar os valores seria pior") — eles existem, e são esses cinco.

**E é aqui que os dois números da adesão têm de aparecer.** A frente 0 pôs teto
de 1 por refeição em `pesoDaRefeicao` e mediu o excedente à parte em
`excessoDoDia`, com a razão escrita: sem teto, "comer mais que o plano aparecia
como aderir MELHOR do que aderir", e um dia de excesso era contado como dia
cumprido **pelo excedente**. E o excesso não compensa a falta: `{almoco: 1.5,
jantar: 0.5}` dá adesão 5,5/6 e excesso 0,5/6 (**da frente 0** — não refiz a
conta). **Requisito de onde mostrar:** os dois moram **juntos, em Semana**, que
é o lugar do veredito e dos três portões (frente 1, §1.4) — "100% e +8%" é um
dia cumprido com sobra, "100%" sozinho é um dia cumprido. Na folha e na linha do
dia aparece **só a porção**, que é o que ele acabou de dizer; a adesão e o
excesso são leitura de semana, e pô-los na folha seria pôr nota em cima de
registro, que é precisamente o que `padraoPorRefeicao` existe para não fazer
("devolve CONTAGEM, nunca percentual… feedback que dirige a atenção para a
autoavaliação piora o desempenho em cerca de um terço dos casos").

**4 · A pergunta do "fora do plano" bloqueia, e não pode bloquear.** No
protótipo, marcar qualquer refeição como "Fora" desabilita o botão de guardar até
ele responder "Sei o que comi" ou "Não sei quanto" (conferi `:1218-1231`). Com o
botão de guardar removido (§3), o bloqueio não tem onde morar — e não deve ter:
"um toque em qualquer linha fecha o dia" e "responda a pergunta para guardar"
são regras contrárias. **Requisito:** a pergunta continua, porque a distinção que
ela faz é real e tem consequência no portão, mas ela aparece **depois** da
gravação, como uma linha a mais na folha, com o estado inicial dito —
`aderencia` sem resposta é `'plano'`, e `'plano'` é o padrão de quem não
respondeu. O dia já está gravado; o que a resposta muda é se ele conta.

### 4.7 · O que sobe à mesa dele, e é só isto

Esta peça muda regra, então o que vai à mesa do dono é **uma lista curta de
mudanças de regra**, não a folha inteira:

1. **O quinto botão, "Não comi"** (§4.6, item 1) — porque é o que faz pôr um dia
   em dia produzir dia contado, e sem ele a peça não entrega o que a decisão dele
   prometeu.
2. **"Não sei" vale o dia, e a tela passa a dizer isso** (§4.6, item 2).
3. **A porção acima de 1 alcança o dia passado** (§4.6, item 3), com a régua de
   cinco valores que já existe.
4. **A pergunta do "fora do plano" deixa de bloquear** (§4.6, item 4).
5. **A última refeição do dia não vem pré-marcada por passagem de horário**
   (§4.4, item 2).

As cinco são pequenas de desenho e nenhuma delas é de gosto: cada uma nasceu de
uma diferença entre o que o desenho faz e o que o dado permite ou a decisão dele
manda.
