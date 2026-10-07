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
- **A animação de "voar" o valor até a tabela não é o risco, e eu fui conferir
  antes de pedir o conserto errado.** `voa()` (usada por `registraSerie` e por
  `corrigeSerie`) cria um `.ghost` **`position: fixed`** e o anima com
  `translate(calc(-50% + dx px), calc(-50% + dy px))` (conferi a função e a
  regra `:304`). Elemento fixo **não** contribui para o transbordo rolável da
  janela, então o defeito de `translateX(+N)` descrito na preferência do dono —
  transbordo pela direita, barra de rolagem horizontal transitória, o fixo
  centrado piscando no Blink — **não é este caso.** **Requisito, então, é de
  vigilância e não de conserto:** se a implementação trocar o fantasma fixo por
  um elemento no fluxo (o caminho mais curto num componente Preact), o defeito
  passa a existir, e a resposta é `overflow-x: clip` num ancestral — nunca
  `hidden`, que viraria `auto` no outro eixo. O `body` do app já tem
  `overflow-x: clip` e há um caso que o segura, mas ele olha **só o `body`**
  (§0.1, item 4) e a animação acontece dentro de `#app`.
- **E o que eu achei conferindo isso é maior do que o que eu fui conferir: as
  duas cascas são incompatíveis.** O protótipo rola por dentro —
  `html, body { height: 100% }`, `body { overflow: hidden }` e um
  `.scroll { flex:1; min-height:0; overflow-y:auto }` fazendo a rolagem
  (conferi `:42-44` e `:57`). O app rola pela **janela**, e o `body` dele é
  **proibido** de ter `overflow: hidden` — é o caso *nenhum ancestral do sticky
  vira scroll container*, que afirma `overflow-x: clip` no `body` e **nenhum**
  `hidden`, `auto` ou `scroll`, com a razão escrita: *"Um `overflow: hidden` no
  body derrubaria o sticky em silêncio — hidden vira `auto` no outro eixo e cria
  o container."* **Requisito:** quem portar o protótipo escolhe a casca do app,
  não a dele. Copiar `body { overflow: hidden }` junto com o resto deixa o caso
  **vermelho** — e, pior, por um motivo que parece arbitrário para quem não leu
  o comentário, o que convida a mexer na asserção em vez de na casca.

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

~~**Portanto:** se a medição A reprovar, o que sobe à mesa dele é a escolha entre
três coisas, com o preço de cada uma escrito, e **nenhuma delas é "deixar como
está"**: (a) os sete botões fixos de C, perdendo valores e ganhando a
ausência de ambiguidade; (b) a régua com o alvo menor, cabendo mais valores e
piorando o erro de dedo — que é justamente a tensão que C3 nomeou como sem saída
fácil; (c) a régua como está, aceitando a taxa medida como custo declarado.
**A decisão é dele.**~~

> **RECONCILIADO em 06/10 · ele já escolheu, antes da medição, e escolheu (a).
> Mas a medição AINDA TEM DE ACONTECER.**
>
> **Decisão 9 das quinze, literal no registro:** se a régua reprovar a medição,
> *"vai para os botões fixos da C"* — **pré-autorizado**, e o registro acrescenta
> que *"a medição ainda tem de acontecer: é condicional, não ordem de trocar
> agora"*.
>
> **Para não haver leitura torta, as três coisas que isto é e as duas que não
> é:**
>
> - **É** uma autorização prévia: se a medição A reprovar, a troca sai **sem
>   voltar à mesa dele**, e sai para os sete botões fixos da C.
> - **É** condicional: o gatilho é o número de reprovação escrito em §1.5 — mais
>   de **3 engolidas em 60**, ou **1 ou mais erros de alvo em 60**.
> - **É** uma escolha feita com o preço na mão: as duas perdas medidas de C
>   continuam valendo e estão escritas acima — sete valores em vez de 10 a 13
>   (com o 10 e o 11 fora da janela no caso que quebra) e `.chip` a **1,00:1** de
>   preenchimento, branco sobre branco.
> - **NÃO é** ordem de trocar agora. **A medição A não aconteceu**, e ela exige o
>   aparelho e o dedo dele, de pé, na academia, com a mão suada. Ninguém pode
>   substituí-la por conta. Enquanto ela não acontecer, **os sete requisitos de
>   §1.3 são o trabalho**, e a régua é o controle.
> - **NÃO é** o fim das opções (b) e (c): elas deixam de ser escolha dele e
>   passam a ser **caminhos que a decisão descartou**. Ficam escritas acima
>   porque, se a medição reprovar **e** os botões fixos também reprovarem no
>   mesmo teste, quem estiver ali precisa saber que elas existiram e por quanto.
>
> **E a frente 3 fechou a consequência de palavra**, para a troca não esperar por
> texto novo: o rótulo é **"Repetições · um toque guarda"** nos dois controles,
> porque o toque grava a mesma coisa. **O único texto que muda é o da faixa
> prescrita** — na régua é sublinhado sob o número (**alvo 8–12**), nos botões
> fixos é legenda (**alvo 8–12 · os seis valores da faixa**)
> (`09-frente3-palavras.md` §11.2).

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
   toque em qualquer linha a grava.
   ~~**Requisito:** a última refeição do dia nunca entra pré-marcada por
   passagem de horário; ela entra pré-marcada só quando o dia já está fechado
   (dia passado). Para hoje, a refeição cuja hora passou há menos de 30 minutos
   fica sem marca, pela mesma razão que a janela de 30 min existe na regra do
   cartão de cima (frente 1, §5.1, regra 4).~~

> **RECONCILIADO em 06/10 · o requisito acima foi DERRUBADO pelo dono, nas duas
> metades.**
>
> **O que ele decidiu (decisão 5 das quinze):** *"a última refeição continua
> pré-marcada como as outras"*. O requisito desta frente dizia o contrário, e
> cai inteiro.
>
> **A segunda metade cai por implicação, não por pergunta aberta.** O pedaço
> *"a refeição cuja hora passou há menos de 30 minutos fica sem marca"* nunca foi
> nomeado por ninguém na mesa dele, e o coordenador registrou em 06/10 que a
> decisão 5 o derruba junto: **se a passagem de horário pré-marca, pré-marca.**
> Não é pergunta pendente; é consequência resolvida. **Não a trate como aberta.**
>
> **O argumento desta frente fica registrado, porque ele era bom e o risco que
> ele nomeia continua existindo:** a folha aberta às 22h sugere que ele já tomou
> a ceia, e um toque em qualquer linha grava a sugestão inteira como registro
> (§4.3). Era disso que o requisito tentava defender.
>
> **O que paga a decisão é palavra, e a frente 3 a escreveu** (§4.1 dela): a
> pré-marcação passa a ser **sugestão declarada**, e o texto nomeia **a causa da
> marca** em vez de nomear a marca —
> *"Nada aqui está registrado até você tocar. A ceia vem marcada porque passou
> das 21h30, não porque o app sabe."* Mais a procedência linha por linha, com
> **"marcada pelo horário · 12h30"** como a palavra nova que distingue sugestão
> de declaração sem depender de cor — que era o outro requisito desta frente
> (§4.3), e esse **fica de pé**.
>
> **Ninguém mediu** se a frase segura o engano que o requisito derrubado
> segurava. É leitura em uso, de pé, às 22h.

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

> **RECONCILIADO em 06/10 · o quinto botão ENTRA** (decisão 1 das quinze). Este
> requisito foi aceito como estava escrito.
> **E o estado honesto dele:** `'nao'` existe no domínio, mas **nenhum chamador
> de `marcaRefeicao` passa `como`, em valor nenhum** — conferido pelo coordenador
> nos dois chamadores (`src/ui/folhas/refeicao.jsx` e `src/ui/telas/hoje.jsx`),
> que chamam com um argumento só. Então "Não comi" é **capacidade de domínio sem
> lugar onde morar**: o modelo o alcança, o dedo não. **A folha dos cinco botões
> é esta frente virando código, e isso ainda não começou.** Está na ordem certa
> — modelo antes de tela —, mas nada neste documento pode ser lido como "a folha
> já existe e funciona".

**2 · "Não sei" é por refeição na tela e por DIA no dado.** O protótipo trata
`nsei` como estado de uma refeição (`estado[m.k] = "nsei"`). No domínio não
existe: `ComoFoiARefeicao` tem dois valores. O que existe é
`aderencia: 'plano' | 'fora' | 'perdido'`, que é campo **do dia** (conferi em
`ComidaDoDia` e em `DiaComidaHist`). E o próprio texto do protótipo confirma que
a consequência é do dia: *"Não sei: o dia deixa de contar para a regra — e é
melhor assim do que um número inventado"* (`:1227`).

~~**Requisito:** o controle pode ficar na linha, mas **a tela tem de dizer que
ele vale o dia**. Marcar uma refeição como "não sei" tira o dia **inteiro** da
conta do nutricionista, e um controle por linha com efeito de dia que não
anuncia isso é a definição de consequência escondida.~~ A frase de leitura de
volta continua sendo o lugar certo para dizer a consequência, e ela já é região
viva.

> **RECONCILIADO em 06/10 · o requisito acima foi DERRUBADO, e a aritmética está
> decidida e implementada. NÃO é pergunta aberta, e não volta a ser.**
>
> **Decisão 2 das quinze:** "Não sei" **passa a valer por REFEIÇÃO de verdade**.
> Então a tela **não** deve dizer que ele vale o dia, porque ele não vale mais.
>
> **A aritmética, decidida pelo coordenador por delegação expressa do dono e já
> implementada** (`6e8a3fa`): a refeição em "não sei" pesa **0** e **NÃO sai do
> denominador**. `ComoFoiARefeicao` ganhou o terceiro valor `'nsei'`, e o peso
> zero virou uma função só, `semCumprimento`. **O dia continua interpretável**:
> `diaInterpretavel` só exige uma marca qualquer, e `'nsei'` é marca — a
> incerteza aparece no número baixo, conservadoramente, em vez de tirar o dia da
> janela de 14. **Nenhum limiar novo:** um dia inteiro em "não sei" é adesão 0 e
> continua contando para o portão de 11 em 14.
>
> **A razão, que é do próprio projeto:** subestimar **segura** o corte; inflar
> **autoriza** um corte que não devia acontecer, que é o mecanismo exato do F292.
> E o caminho de menor esforço tem de ser o conservador. Nenhuma migração foi
> precisa: `como` já era campo persistido opcional desde a 9→10, e **valor novo
> não é campo novo** — o que derruba também a previsão de "migração 11 → 12" que
> circulou junto com a decisão 2.
>
> **AUTORIZAÇÃO PERMANENTE, e ela é literal do dono:** *"nao quero mais qlqr
> pergunta sobre isso"*. **Nenhum documento deve voltar a listar a aritmética do
> "não sei" como pergunta aberta.** O mesmo vale para o lado em que cai o
> silêncio do "fora do plano" (item 4 abaixo).
>
> **O que esta frente escreveu e continua valendo:** o controle fica na linha, e
> a consequência tem de ser dita antes do toque — só que a consequência agora é
> outra. As palavras estão na **versão A** da frente 3 (§4.5 dela), que é a que
> esta decisão escolheu: *"O almoço fica desconhecido. A segunda continua
> contando, com uma refeição de cinco que a regra não sabe ler."*
>
> **E uma distinção que não pode se perder:** o "não sei" **do dia** continua
> existindo e continua sendo `aderencia: 'perdido'`, e continua sendo o único
> valor que derruba o dia inteiro (`diaInterpretavel`, primeira linha). São dois
> registros diferentes de propósito: um diz "não sei o que foi este almoço", o
> outro diz "não sei o que foi este dia". **Onde a folha oferece qual dos dois,
> ninguém especificou** — ver §13.2.

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

> **RECONCILIADO em 06/10 · aceito como estava** (decisão 3 das quinze): porção
> acima de 1 em dia passado, **sim**, com **os mesmos cinco valores da tela de
> hoje**. O requisito desta frente passa inteiro, inclusive a recusa de inventar
> valor novo.

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

> **RECONCILIADO em 06/10 · aceito, e a última frase deste requisito está
> ERRADA** — e isso é bom, porque barateia a decisão.
>
> **Decisão 4 das quinze:** a pergunta do "fora do plano" **deixa de bloquear**;
> um toque fecha o dia. O requisito desta frente passa: a pergunta continua e
> aparece **depois** da gravação.
>
> **O que não bate com o código, conferido pelo coordenador em 06/10 e
> reconferido aqui:** *"o que a resposta muda é se ele conta"* é falso.
> `aderencia` tem três valores (`'plano' | 'fora' | 'perdido'`) e **a única
> leitura lógica dele em todo o domínio é `=== 'perdido'`**
> (`src/dominio/nutricao/calculo.ts`, em `diaInterpretavel`). "Plano" contra
> "fora" **não alimenta cálculo nenhum**: é registro para ele ler. Então tirar o
> bloqueio **não infla conta nenhuma** — ele torna o **registro** menos
> completo, e esse é o preço que o dono escolheu pagar por fechar o dia num
> toque.
>
> **A armadilha, anotada para quem mexer nisso depois:** se algum dia "fora"
> passar a alimentar cálculo, **o ausente não pode cair em "plano"**. Quem mudar
> isso lê este parágrafo primeiro.
>
> **E para que lado cai o silêncio é decisão FECHADA**, sob a mesma autorização
> permanente do item 2: nada muda na aritmética, e **nenhum documento volta a
> listar isso como pergunta aberta.**

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

> **AS CINCO ESTÃO RESPONDIDAS, em 06/10. Esta mesa fechou.**
>
> | # | o que esta frente pediu | o que ele decidiu |
> |---|---|---|
> | 1 | o quinto botão "Não comi" | **entra** (decisão 1) — aceito como escrito |
> | 2 | "Não sei" vale o dia, e a tela diz isso | **DERRUBADO** (decisão 2): vale **por refeição** de verdade. Peso 0, dentro do denominador, o dia continua contando. Decidido e implementado; não volta à mesa dele |
> | 3 | porção acima de 1 no dia passado | **sim** (decisão 3), os mesmos cinco valores — aceito como escrito |
> | 4 | a pergunta do "fora do plano" deixa de bloquear | **deixa de bloquear** (decisão 4) — aceito como escrito; e tirar o bloqueio não infla conta nenhuma, porque "plano" contra "fora" não alimenta cálculo |
> | 5 | a última refeição não vem pré-marcada | **DERRUBADO** (decisão 5): **continua pré-marcada como as outras**. A metade dos 30 minutos cai por implicação |
>
> **Três das cinco passaram, duas caíram.** Os argumentos das duas que caíram
> ficam registrados nos itens de origem (§4.4 item 2 e §4.6 item 2), porque quem
> for implementar precisa saber que o ponto foi pesado e que havia argumento do
> outro lado.

---

## 5 · Corrigir no lugar, com alvo

Nasceu no protótipo (descoberta 4) e **não existe em nenhum dos oito HTML** — o
que quer dizer que ninguém mediu nada dele, nem o parecer nem a auditoria de
acesso, que são anteriores. Então esta seção especifica pela primeira vez, e
diz o que ficou sem medida.

### 5.1 · O alvo dentro da tabela, e ele é o menor da direção

Cada número guardado é um botão dentro da tabela do exercício. Conferi a forma
no fonte, e o rótulo acessível dela está certo:

```html
<button class="cellb" data-a="corrigir" data-ex="5" data-s="3" data-e="0"
        aria-label="Série 3: 55 por 9 repetições. Tocar para corrigir">55 × 9</button>
```

(`03-direcao-D/prototipo.html:635`.) O rótulo diz o número **e** o que o toque
faz — é exatamente o que 1.1.1 e 2.4.4 pedem, e é melhor do que a média do
arquivo.

**O problema é o tamanho, e ele nunca foi medido.** `.cellb` tem
`padding: 1px 7px; font-size: 17px` (`:94`), dentro de
`.ref td { line-height: 1.2 }` (`:89`). **Conta:** `17 × 1,2 + 1 + 1 ≈ 22 px de
altura`. A largura, com "55 × 9" em dígitos tabulares mais 14 px de
preenchimento, fica por volta de 64 px. **Cerca de 64 × 22 px.** Não há
`::after` estendendo a área (procurei `.cellb::after` no arquivo: não existe).

Por que ninguém mediu: C3 mediu os **nove HTML** e achou 12 alvos abaixo de
44 px — `.map` a 30 px (3 ocorrências) e `.daytype` a 36 px (9)
(`04-acesso.md`, D-7, conferi). **`.cellb` não está nessa lista porque nasceu
depois dela**, no protótipo. Pela minha conta ele é **o menor alvo interativo da
direção inteira**, 8 px abaixo do pior que a auditoria encontrou, e é um
**controle repetido** — um por série, até quatro por exercício, vinte por
sessão de Treino A.

**O requisito, e ele é o mesmo mecanismo que o repositório já tem:**

- `::after` com `position: absolute` e `inset: -Npx 0`, levando o **alvo** a
  46 px sem crescer o desenho. É o caso *controle pequeno estende o ALVO sem
  crescer o desenho*, e os quatro últimos seletores dessa lista entraram
  exatamente por isto: "o descanso, a anotação, o aquecimento e o RIR ficavam
  entre 34 e 40 px — todos apertados de pé, com uma mão, entre uma série e
  outra" (conferi o comentário em `tests/dominio/estilo.test.ts`). **`.cellb`
  está pior do que os quatro que motivaram a regra.**
- **O segundo valor do `inset` é zero**, e não é detalhe: o vizinho horizontal é
  o botão da **série seguinte**. É a mesma geometria do caso *o alvo do tick
  cresce só na vertical*, e a consequência aqui é mais branda — tocar errado
  abre a correção da série errada, e a tela diz qual série é, então ele desfaz —
  mas continua sendo um toque jogado fora numa ação que já é de correção.
- **Para cima e para baixo há espaço seguro:** a linha "Última" é `<td>` de
  texto, sem controle (conferi `:643-650`). Estender o alvo por cima dela não
  rouba toque de ninguém.

**E uma coisa que o rótulo acessível faz certo e que precisa sobreviver:** ele
carrega o valor. `aria-label="Série 3: 55 por 9 repetições. Tocar para
corrigir"` é o que permite achar a série errada sem ver a tabela. Numa reescrita
de componente, esse rótulo é a primeira coisa que se perde.

### 5.2 · O segundo estado da régua

A régua ganha um segundo estado: **o valor guardado em tinta cheia, marcado
"agora", ao lado da "última"**. Conferi a implementação, e ela é um quarto
argumento em `regua(ref, fx, marca, atual)` com duas classes:

- `.rep.last` — a referência, "última", borda de 2 px na cor de acento com fundo
  suave (`prototipo.html:140`);
- `.rep.now` — o guardado, fundo cheio e texto invertido (`:141`), com o
  `<small>` dizendo "agora" (`:142`, com a cor do texto invertida também);
- e `.rep.in` — o sublinhado da faixa prescrita (`:139`), que é ortogonal aos
  dois.

**Três requisitos que o estado novo traz, e nenhum deles está no protótipo:**

1. **A distinção não pode ser só de cor.** `.rep.now` troca fundo e texto;
   `.rep.last` troca borda e fundo. Em tinta cheia contra borda, a diferença é
   de **forma** além de cor, o que já satisfaz 1.4.1 — mas o `<small>` que
   carrega a palavra ("agora" / "última") é o que torna a diferença legível, e
   ele existe nos dois. **Requisito:** a palavra fica; ela não é redundância, é
   o conteúdo.
2. **Os dois estados caem no mesmo botão no caso mais comum, e aí a pintura e a
   palavra se contradizem.** Se o valor guardado for igual ao da última — que é
   o que acontece na maioria das séries —, `cls` recebe `last` **e** `now` ao
   mesmo tempo, e só **um** `<small>` é emitido. Conferi qual: a expressão é
   `(v===ref && marca ? marca : (atual!=null && v===atual ? 'agora' : ''))`,
   então quem ganha é **`marca`**, isto é, a palavra **"última"**. Mas no CSS
   `.rep.now` é declarada **depois** de `.rep.last`
   (`prototipo.html:140-141`), então a **pintura** que ganha é a de "agora", em
   tinta cheia. **O botão fica pintado como o valor guardado e rotulado como a
   referência.** Para quem lê a tela, é ambíguo; para quem ouve o `<small>`, é
   errado. **Requisito:** quando os dois coincidem, a palavra é
   **"agora, igual à última"** — as duas, porque as duas são verdade e nenhuma
   delas sozinha descreve o botão.
3. **`centrarStrip()` passa a centrar no guardado**, porque procura
   `.rep.now` antes de `.rep.last` (conferi). Isso está certo — na correção o
   foco é o valor que está lá, não a referência — e é mais uma razão para a
   posição da janela ser derivada do valor em foco (§1.3, R4), e não um
   `scrollLeft` guardado.

### 5.3 · Corrigir não reinicia o descanso — e a regra já existe, apoiada numa guarda que evapora

Esta é a regra que vale mais, e o briefing a trata como coisa a especificar.
**Conferi, e ela já existe no app de hoje** — pelo mecanismo errado.

**Como ela já vale.** `autoTimer(i, k, e)` dispara `startTimer` quando a série
fica completa, e tem duas guardas (conferi em `src/main.jsx`):

```js
if (!cheia) { view.fired[tag] = false; return; }
if (view.fired[tag]) return;
view.fired[tag] = true;
```

`tag` é `view.day + i + ':' + k` — dia, posição do exercício, número da série.
Corrigir 9 para 8 mantém `cheia` verdadeiro e `view.fired[tag]` verdadeiro, então
a função **retorna antes de `startTimer`**. O descanso não reinicia. ✔

**E o protótipo também não reinicia:** `corrigeSerie()` escreve `d.reps = v` e
**não toca** em `S.sess.restFrom` nem em `d.at` (conferi a função inteira). O
texto na tela diz as duas coisas: "o guardado está em tinta cheia · o horário
não muda" (`:757`). A descoberta 5 do protótipo está certa, e o desenho a honra.

**O problema é onde a guarda mora.** `view.fired` é campo de `view`, que é
`let view = { … fired:{} … }` em `src/main.jsx` — **memória, nunca disco**.
Conferi os três lugares que o zeram: `fechaSessao`, o descarte de sessão vazia
em `finalizarSessao`, e `wipe()`. Nada o persiste e nada o reconstrói no boot.

**Consequência, e é um defeito vivo no app de hoje:** ele registra a série 2 às
6h40, o iOS fecha o app em segundo plano (o estado M1-8 existe justamente para
isso), ele reabre às 6h55 e corrige a série 2 de 9 para 8. `view.fired` nasceu
vazio. `cheia` é verdadeiro. `view.fired[tag]` é `undefined`. **`startTimer`
dispara um descanso de 2 minutos para uma série que acabou quinze minutos
atrás.** Não há caso de teste para isto: os 12 casos de
`tests/fluxo/cronometro.test.js` cobram o descanso sobreviver ao fechamento — o
que ele faz, porque é recalculado pelo relógio de parede —, e os 8 de
`tests/fluxo/serie.test.js` cobram o disparo; nenhum cobra **corrigir depois de
reabrir**.

**Requisito, e ele é de modelo, não de tela:** a regra "corrigir não reinicia o
descanso" passa a ser derivada do **dado**, não de uma variável de sessão de
memória. O dado para isso já existe: cada série registrada tem o instante
(`entry.sets` por `projeta`, e no protótipo `reg.at`). A pergunta "este toque
inicia um descanso?" é respondida por "esta série está sendo **registrada agora**
ou **corrigida**?", e as duas são distinguíveis sem `view.fired`: registrar é
escrever uma série que não tinha valor; corrigir é mudar uma que tinha. A direção
D já separa os dois atos em dois estados de tela diferentes (`S.modo === "reg"`
contra `"corr"`), o que torna a distinção explícita em vez de inferida.

**E o caso de teste que falta tem de nascer com a mudança:** *"corrigir uma série
depois de reabrir o app não inicia descanso"*. Hoje ele ficaria **vermelho**, e
é por isso que ele vale.

### 5.4 · O que corrigir nunca muda

Quatro invariantes, e eu as escrevo porque cada uma é um jeito de a correção
mentir:

1. **O horário da série não muda.** Está no desenho ("o horário não muda") e no
   dado (`corrigeSerie` não toca `d.at`). O instante é medição; o valor é
   declaração.
2. **O descanso não reinicia** (§5.3), e o cronômetro continua contando de onde
   estava — ele é "agora menos o instante da série", e é isso que o faz
   sobreviver ao bloqueio e a outro app (`tests/fluxo/cronometro.test.js`).
3. **Corrigir não reabre sessão nem mexe na rotação.** Corrigir uma série de
   semanas atrás é ato de histórico; a frente 1 já deu dois endereços para ele
   (Dias › detalhe da sessão, para o dia; histórico do exercício, para a série —
   achado 1), e **essa porta depende da proposta dela** (§10).
4. **A tela diz que foi correção, não gravação.** O protótipo faz isso com uma
   palavra: `S.corrigida` troca "guardada" por "corrigida" na frase de
   confirmação (conferi em `zonaDepois`). **Requisito:** a palavra fica, e o
   anúncio de §1.3 R6 a carrega — "série 3 corrigida: 55 kg × 8" e não
   "guardada", porque guardada de novo soa como série nova.

---

## 6 · O teclado misto, campo por campo

**A regra, em uma frase:** teclado próprio onde a entrada acontece **de pé,
dentro da sessão, com uma mão, e o valor é um número curto de faixa conhecida**;
teclado do sistema onde a entrada é **texto**, ou longa, ou acontece sentado, ou
pode ser colada.

As duas metades têm preço medido, e os dois estão escritos:

**O que o teclado do sistema cobra**, e o app já conhece a conta:
`DESIGN.md` manda "campo de texto nunca abaixo de 16px — o Safari dá zoom ao
focar, e a tela fica torta no meio de uma série", e há caso que o segura (*o
campo nunca fica abaixo de 16px*). E o próprio fonte da série diz o resto, sobre
o RIR: *"Botão e não campo: um dígito não vale abrir o teclado numérico, que
cobre metade da tela no meio da série"* (conferi `src/ui/exercicio.jsx:99-101`).

**O que o teclado próprio cobra**, e aqui o defeito é nominal: **no notebook ele
não tem os dígitos do teclado físico.** C2 nomeou (do parecer, decisão 8), e eu
**conferi no fonte**: `grep -c "keydown\|keypress\|keyup"` no
`03-direcao-D/prototipo.html` devolve **0**. O teclado de doze teclas de
`folhaCarga()` existe só por `click`. Quem está no notebook, com teclado de
verdade na frente, tem de **mirar com o mouse** em 7-8-9-4-5-6-1-2-3-,-0-⌫.
**A frequência de uso no notebook é não medida** — o dono disse "bastante"
(P8, P11), e o parecer registra que ninguém contou.

E o que C3 mediu dos dois teclados, que é a ironia do material: **em D as 12
teclas têm preenchimento a 1,20:1 e borda zero** (D-5). O teclado construído
para ser mais seguro é o pior caso de contraste dos dois arquivos.

### 6.1 · A regra, campo por campo

| a entrada | onde | hoje | o veredito | por quê |
|---|---|---|---|---|
| **repetições da série** | sessão | `input inputmode="numeric"` (`exercicio.jsx:93-97`) | **nenhum teclado** — a régua | é a ação de 48/semana, de pé; um toque é a tese da direção (§1) |
| **repetição fora da régua** | sessão | o mesmo campo | **próprio**, pela porta "Outro valor" | é a saída da régua, e é raro; o parecer mediu que em C ela custa 4 toques, e isso é o teto |
| **carga da série** | sessão | `input inputmode="decimal"` (`:84-90`) | **próprio, com vírgula e casa decimal fixa** | C2 marcou a casa decimal fixa ("736" → 73,6) como **ponto a favor**: mata F63 e F275 na entrada. E `limpaNum(el, dec)` já existe para normalizar vírgula — passa a ser a mesma conta, feita antes |
| **RIR** | sessão | **já é botão**, 0 a 4 (`:99-110`) | **nenhum teclado** — fica botão | a razão está escrita no fonte, e a D mantém (0–4 mais "sem RIR") |
| **peso da manhã** | Corpo, e o atalho do descanso | `registraPeso`, aceita vírgula | **próprio**, com a régua de 100 g na frente (§1.4) | é de pé, na balança, e é um número de faixa estreita. A régua resolve o caso comum e o próprio resolve o resto |
| **cintura** | Corpo | `registraCintura` | **próprio** | mesma situação do peso: de pé, com a fita na mão |
| **bioimpedância (5 campos)** | Corpo | não existe | **do sistema** | é **sentado**, com o papel da balança na mão, cinco números de uma vez. Quatro são obrigatórios (5.a' P3) e um deles é o **peso dela**, que é registro separado da pesagem da manhã (5.a''') — a tela mostra os dois de propósito |
| **medidas com fita** | Corpo | não existe | **próprio** para o número, **do sistema** para o "como ele mediu" | o número é de pé; o texto é texto |
| **lista rápida da aula** | sessão da aula | `inpRapido(el, i, pos)` | **próprio** | o fonte diz quando acontece: "DEPOIS da aula, ofegante, sentado, e ela é curta" — curta é o que define, não sentado |
| **observação do exercício** | sessão | `obsIn(el, i)` | **do sistema** | é texto |
| **nota da sessão** | sessão, pelo `···` | `setNotaDaSessao` | **do sistema** | é texto, e a D já põe no `···` com a razão: "teclado do sistema, fora do caminho rápido" (conferi em `menuSessao`) |
| **motivo da mudança** | Prescrição | `motivoPromo` | **do sistema** | é texto, e a frente 1 já escreveu por quê: "porque é texto e ele está sentado" |
| **hora do retroativo** | Dias | `addHora(el)`, máscara `hh:` | **do sistema**, `inputmode="numeric"` | a máscara já existe e funciona; teclado próprio com dois pontos é teclado novo para um caso raro |
| **nome de treino avulso** | Dias | `addNome(el)` | **do sistema** | é texto |
| **correção da duração** | Dias › detalhe | `guardaCamposEdicao` lê `#ed{k}_0`, `#ed{k}_1`, `#edobs` | **do sistema** | é sentado, e um dos três campos é texto livre |
| **criar exercício (6 campos)** | Prescrição | `criarExercicio()` lê `#nxn`, `#nxg`, `#nxc`, `#nxk`, `#nxu`, `#nxq` | **do sistema** | seis campos, dois deles texto; é cadastro, não registro |
| **quantidade de alimento** | Prescrição | `atualizaPrescricao(i)` escreve em `#presc{i}` | **do sistema** | muda o plano para **todo** dia (`tests/fluxo/fusao.test.js`); é decisão sentada |
| **busca (exercício e alimento)** | Prescrição, sessão | `buscaEx(q)` | **do sistema**, sempre | é texto, e há caso que cobra que o teclado **não feche a cada letra** — o que um teclado próprio tornaria impossível de garantir, porque o foco passaria a ser do app |
| **importar texto (backup, aula)** | Ajustes, Prescrição | `importaTexto` | **do sistema**, obrigatoriamente | **colar**. Teclado próprio não cola, e as duas direções assumiram esse custo por escrito |
| **água, porção, turno, cadência** | Agora, folhas | botões e chips | **nenhum teclado** | já são assim, e estão certos |

### 6.2 · Os quatro requisitos do teclado próprio, e um deles é o conserto do defeito medido

**T1 · Ele aceita o teclado físico.** `keydown` nos dígitos, na vírgula, no
ponto (mapeado para vírgula), em `Backspace` e em `Enter`. É o conserto do único
defeito nomeado por C2, e é a diferença entre o teclado próprio ser uma escolha
e ser uma perda no notebook. Sem isto, quem está no notebook digita com o mouse.
**E a frequência disso é não medida** — então o requisito não se justifica por
volume, se justifica por não haver razão para não o fazer.

**T2 · Ele é alcançável e operável por teclado, e anuncia o que tem.** Doze
botões numa grade de três colunas (conferi a ordem no protótipo:
`7 8 9 / 4 5 6 / 1 2 3 / , 0 ⌫`), com nome escrito nos dois que não são dígito —
e o protótipo já faz isso: `aria-label="Apagar o último número"` e
`aria-label="vírgula"` (conferi). **Requisito:** fica, e o visor passa a ser
região viva, porque hoje `<b data-k="d">` muda de texto sem anunciar nada
(conferi `folhaCarga`) — é o mesmo defeito do R-D1, num lugar onde o valor é a
única coisa que existe.

**T3 · O limite de contraste das teclas passa de 1,20:1.** É a medida de C3
(D-5). O critério é 1.4.11, **≥ 3:1** para limite de componente. É conserto de
token, e a frente 4 é que decide o valor — mas o requisito nasce aqui, porque é
um controle de interação.

**T4 · O cursor do visor não pisca sozinho se "reduzir movimento" estiver
ligado.** A D põe o movimento todo dentro de
`@media (prefers-reduced-motion: no-preference)` e o `.caret` dela não tem
animação nenhuma (conferi `prototipo.html:298`: é um retângulo estático). **A de
C pisca a 1 Hz, infinitamente** (`.caret` com `animation: blink 1s steps(1)
infinite`, conferi em `03-direcao-C/momento-1.html:148-149`), e o parecer
registra que está abaixo dos 3 Hz do critério 2.3.1 — passa, e é o único
movimento infinito dos dois arquivos. **Requisito:** a forma da D, estática.

---

## 7 · Os sete estados ruins, de pé

A regra desta seção é uma: **um estado sem saída é defeito.** O protótipo achou
esse defeito uma vez, da forma mais básica possível — a sessão não tinha saída —
e achou porque virou coisa tocável. As sete situações abaixo são as que podem
repetir o erro.

### 7.0 · Três dos sete não estão desenhados, e os becos não estão desabilitados

**O briefing diz que os sete "estão desenhados nos oito HTML e o protótipo os
deixou como becos desabilitados". Conferi, e as duas metades da frase estão
erradas.**

**Metade 1 · Quatro estão desenhados; três não.**

| estado | desenhado? | onde |
|---|---|---|
| **erro de gravação** | **sim**, em oito lugares | `momento-1` 9 e 10, `momento-2` 10 e 11, `corpo` 11, `aula` 12, `semana` 10, `prescricao` 11, `sessao-fotos` 9, `comparar` 10 |
| **carregando** | **sim** | `momento-1` 8, `momento-2` 9 |
| **máquina ocupada** | **sim** | `momento-1` 12 |
| **dor** | **sim** | `momento-1` 11 |
| **pular** | **não** | é **botão** em sete lugares do `momento-1` (seis na fileira `.acts` e um dentro do estado 11), e não tem estado nenhum: o que aparece depois do toque, o que ele pode fazer dali e como se desfaz não está em desenho nenhum |
| **deload** | **não** | **uma linha de texto** numa folha desabilitada do protótipo: `["Deload hoje", "metade das séries, mesmas cargas"]`. Zero ocorrências nos oito HTML (contei: `semana.html` menciona a palavra numa frase sobre o cálculo da força ficar cego, que é outro assunto) |
| **encerrar** | **não** | **uma linha de texto** na mesma folha: `["Encerrar a sessão", "fim igual à última série; não pergunta nada"]` |

Conferi as duas últimas em `menuSessao()`, `03-direcao-D/prototipo.html:855-861`.
A folha tem cinco itens e `b.disabled = true` em todos.

**Metade 2 · Os becos da sessão não estão desabilitados: eles são silenciosos.**
`data-a="beco"` aparece **oito vezes** no protótipo e **não tem ramificação
nenhuma** na cadeia de `else if` que trata os cliques — procurei `"beco"` em
todo o arquivo e as oito ocorrências são as do atributo. Das oito, **sete não
têm `disabled`**: "Máquina ocupada", "Dor" e "Pular" na zona do polegar
(`:725`), "Ver o aparelho" e "Nota do treinador" no cartão do exercício 4
(`:653`), o botão de tipo de dia no Agora (`:977`) e "Outro dia" em Corpo
(`:1289`). Só "Histórico" está desabilitado (`:1252`).

**O que isso significa de concreto:** esses sete botões recebem foco, escalam no
toque (`transform: scale(.95)`, `:307`) e **não fazem nada e não dizem nada**.
Isso é pior do que desabilitado em três sentidos: um botão desabilitado anuncia
que está desabilitado para um leitor de tela; não entra na tabulação; e não dá o
retorno tátil de "funcionou". Para quem usa VoiceOver, "Dor" é um botão normal
que não responde. **É a definição de falso sucesso**, numa doutrina que diz
"nada de falso sucesso" e num app cujo fonte afirma "não existe estado 'não
salvo'".

Isto não é crítica ao protótipo — ele diz por escrito que os deixou de fora e
por quê, e a escolha foi certa para a escolha do dono. **É aviso para quem
implementar**: o arquivo que vai ser lido como referência tem sete botões que
parecem prontos e não são, e três dos sete estados não têm um pixel.

### 7.1 · A forma comum: o que todo estado ruim precisa

Antes dos sete, o que vale para os sete. Cada um precisa de **quatro** coisas, e
a quarta é a que falta em todos os becos:

1. **O que aconteceu**, em palavra e não em código. As duas direções já fazem
   isso e o parecer confirmou (3.3.1: `role="alert"` em todo painel de falha, e a
   causa dita em palavra).
2. **O que NÃO aconteceu.** É a melhor coisa dos erros da D, e está no estado 9:
   *"Nada foi apagado e nada saiu do aparelho. A rede não é a causa: o registro
   mora aqui."* Um erro que não delimita o estrago faz o dono supor o pior.
3. **O que ele pode fazer dali**, com alvo de tamanho de dedo. Os erros da D têm
   duas saídas cada, e as duas são ações: "Tentar guardar de novo" e "Copiar o
   registro inteiro (cópia de segurança)".
4. **Como se sai sem fazer nada.** É o que falta. `04-acesso.md` já cobra isto
   em E1-a para um caso específico — "**descartável sem responder**, com alvo de
   dispensa ≥ 44 px, sem prender o foco". **Requisito:** vale para os sete. Todo
   estado ruim é dispensável sem responder, e dispensar não escolhe por ele.

E duas regras de forma que vêm da rede:

- **`role="alert"` só onde interrompe; `role="status"` onde informa.** O app tem
  uma região viva, `#toast`, com `aria-live="polite"` e a razão escrita
  ("polite: o toast informa, nunca interrompe"). Erro de gravação de série
  **interrompe** — é `alert`. Carregando **informa** — é `status`. Pôr tudo em
  `alert` treina o dono a ignorar o `alert`.
- **Nada do que aparece pode criar bloco de contenção acima da folha** nem
  `overflow` acima do `sticky` do cabeçalho (§0.1, item 4). Painéis de erro são
  justamente onde se põe `backdrop-filter` por reflexo — e a preferência do dono
  é explícita contra isso, com a razão medida: pisca no Blink ao animar um
  vizinho, e **não** pisca no iPhone real, o que engana.

### 7.2 · Erro de gravação

**O que aparece.** O desenho está pronto e é o melhor do arquivo. O estado 10 do
`momento-1`: a faixa da sessão passa a dizer "série 10 de 20 · **não
guardada**", a célula da série 2 na tabela diz "45 × 10 · **não guardada**" em
vez de só o número, e o painel diz: *"A série 2 não foi guardada. O espaço de
armazenamento deste aparelho recusou a gravação. A série continua aqui, 45 × 10,
enquanto o app estiver aberto."* Três lugares dizendo a mesma coisa, e o
terceiro diz **até quando** o valor vale.

**O que ele pode fazer dali.** Duas saídas: "Tentar guardar de novo" e "Copiar o
registro inteiro (cópia de segurança)". A segunda é a que não perde nada, porque
o estado inteiro é regravado a cada série (F256) — então a cópia é uma cópia
completa, não um remendo.

**Como se sai.** **Aqui está o que falta, e é a quarta coisa de §7.1:** o painel
não tem dispensa. **Requisito:** ele é dispensável, e dispensar **não** apaga a
marca de "não guardada" — a marca fica na faixa e na célula, porque é o estado
do dado, não o estado do aviso. Dispensar o painel e continuar treinando é
comportamento legítimo; perder a marca não é.

**Três requisitos que o dado impõe, e que o desenho não pode contrariar:**

1. **A confirmação só aparece depois de gravar no aparelho.** Já é a regra
   escrita da D (M1-2: "A confirmação só aparece depois de gravar no aparelho")
   e é doutrina do app ("Não existe estado 'não salvo'"). Com a régua, isso
   significa que **o toque no número não pode pintar o estado "guardada" antes
   do retorno da gravação** — e a animação de `voa()` do protótipo faz
   exatamente isso, chamando `render()` no fim do voo (conferi `registraSerie`).
   **Requisito:** o voo é decoração; quem autoriza a palavra "guardada" é o
   retorno do disco.
2. **O erro de gravação tem de alcançar o anúncio.** É o R6 de §1.3 pelo outro
   lado: se a confirmação passa a ser anunciada, a **falha** também passa, e com
   `role="alert"`, porque interrompe.
3. **O desligamento vale aqui também.** O caminho do erro de gravação é um
   `await` que volta para pintar — é o padrão exato que produziu as quatro
   rejeições não tratadas de `09-desligamento.md`, e a pilha delas passava por um
   render disparado por "o aviso de falha". **Requisito:** confere `desligado`
   antes de pintar o erro.

### 7.3 · Carregando

**O que aparece.** Um esqueleto **com a forma da tela que vem**, e um prazo de
**4 s** (M1-8 e M2-9). Passados os 4 s, a tela vira o estado 9 — "o registro
deste aparelho não abriu. Esperei 4 s" — com a causa dita e com a negativa
("a rede não é a causa: o registro mora aqui"). O motivo do prazo está no
fato: um carregamento que nunca terminava já aconteceu (F273).

**O que ele pode fazer dali.** Nada, durante os 4 s — e isso está certo, é
espera. Depois dos 4 s: "Tentar de novo", "Ver o detalhe técnico", e a frase de
escape ("Se acontecer de novo: Ajustes › Cópia de segurança, a partir de outro
aparelho com a conta").

**Como se sai.** O estado se resolve sozinho, nos dois ramos. **Requisito:** o
esqueleto é `role="status"` e **não** `alert`, e não prende foco, porque não há
nada para focar.

**E um requisito de posição, que é meu:** ao abrir, **volta exatamente à série em
que parou** (está dito no M1-8). A frente 1 já fixou o mecanismo: a posição é
derivada, `ondeEleEstava(estadosDoDia(s.day))`, e a sessão manda na chegada. O
que esta frente acrescenta é a **janela da régua**: ela também volta derivada do
valor em foco (§1.3, R4), não restaurada de um `scrollLeft` guardado — porque um
`scrollLeft` guardado de uma sessão de ontem é pior do que nenhum.

### 7.4 · Máquina ocupada

**O que aparece.** M1-12, e o desenho ordena as saídas por preço, o que é a
coisa certa: primeiro "**Fazer antes o próximo**" — a saída mais barata, porque
não muda nada do programa (é mover, F159) e a tela diz o efeito inteiro
("Elevação lateral unilateral no cabo agora; esta volta logo depois"). Depois os
substitutos do treinador, com ★ nos indicados por ele, **o que já foi feito de
cada um** ("Última vez: 7,5 × 20 · 20 · 20") e se há foto do aparelho. Por
último, "Pular hoje". E no alto: "**Vale só para hoje. O programa não muda.**"

**O que ele pode fazer dali.** Quatro coisas: mover, trocar por um dos três
substitutos, pular, ou fechar e fazer mesmo assim.

**Como se sai.** **Requisito:** fechar o painel volta à régua do exercício
original, sem registrar nada. Hoje, no protótipo, o botão que abre isto não abre
nada (§7.0).

**Dois requisitos que a frente 1 amarra:**

1. **A troca é mudança do dia, e o dia morre com a sessão.** `S.mods` zera em
   `fechaSessao` — "as mudanças do dia não sobrevivem ao fim da sessão"
   (conferi). Então a frase "vale só para hoje" é verdade no dado, e **o
   carregador de §9.2 é o que a faz esperar decisão** em vez de desaparecer.
2. **O histórico de cada substituto é a capacidade que a frente 1 achou sem
   lugar** (achado 1, item 4): "cada substituto mostra a última carga registrada
   **nele**". Dentro da sessão isso continua existindo. Fora dela, depende da
   porta que a frente 1 propôs (§10).

**E um requisito de acesso que é desta frente:** C3 mediu os botões dessa região
e eles reprovam. **D-6:** os 16 botões de `.acts` — "Máquina ocupada", "Dor",
"Pular", "Trocar de novo", "Cancelar a série a mais" — e as 4 linhas de
substituto medem **122 a 382 × 44 px, borda 0, preenchimento 1,08:1**, contra o
mínimo de 3:1; e `.opt` tem divisória a 1,43:1 (`04-acesso.md`, conferi). O
parecer acrescenta o que isso significa aqui: são os controles de U4, **a
situação nº 2 em dificuldade**, e "Dor" e "Pular" **têm consequência diferente**
(F172 contra F154). Três botões lado a lado de 122 × 44 px sem nada entre eles,
num instante de dificuldade, com consequências diferentes. **Requisito:** limite
visível de 3:1 entre eles, e separação que não seja só o vão.

### 7.5 · Dor

**O que aparece.** M1-11. A detecção é real e vem do dado: dor marcada nas duas
últimas sessões **do exercício**, e as duas podem ter vindo de treinos
diferentes porque o histórico é do exercício (F151) — no desenho, uma do Treino
A e outra do E. A regra aparece **nas palavras do treinador** (F102): *"dor de
tendão apareceu, tirar este exercício por 2 semanas e substituir por outro
ângulo. Nunca empurrar por cima."* E as duas datas estão escritas.

**O que ele pode fazer dali.** Três, e a decisão é dele (F2): "Ver os 3
substitutos", "Pular hoje", "Fazer mesmo assim". E o desenho diz a regra que
vale para as três: *"Qualquer escolha fica registrada no dia."*

**Como se sai.** **A régua só aparece depois da escolha** — está na legenda do
estado, e é a parte mais importante do desenho: sem escolha não há como
registrar série, porque registrar série aqui seria "fazer mesmo assim" sem
dizer. **Requisito:** isto é a única exceção autorizada à regra de §7.1, item 4,
e ela precisa estar dita: **este estado não é dispensável sem responder.** Mas
"Fazer mesmo assim" **é** a resposta de dispensa, e por isso a exceção é
aparente: há três saídas, e uma delas é continuar.

**E um requisito que o dado impõe:** marcar dor é o que alimenta a detecção da
próxima vez. O app já guarda `dor` no rascunho do exercício
(`draftOf(i)` devolve `{ s, obs, dor, alt }`, conferi) e a hidratação recupera
dor e substituto (`tests/fluxo/sessao.test.js`). **Requisito:** o caminho de
marcar dor não pode ficar atrás do painel que a dor repetida abre — senão a
primeira dor não tem como ser marcada, e a segunda nunca é detectada.

### 7.6 · Pular — o estado que não existe

**Não está desenhado em lugar nenhum** (§7.0). O que existe é o botão, em sete
lugares, e **uma** frase de legenda que diz a regra: *"Pular é decisão e não
volta como pendente (F154)."*

Essa frase é tudo o que se sabe, e ela resolve metade de uma das três perguntas.
**Especificando, então:**

**O que aparece.** Confirmação, e não execução direta. A razão é a própria frase:
pular **não volta como pendente**, logo é irreversível pela via normal — e um
toque único numa fileira de três botões de 122 × 44 px sem limite visível
(§7.4), num momento de dificuldade, não é lugar para irreversível. **Requisito:**
o toque em "Pular" abre uma confirmação de uma linha que diz as três coisas: o
que vai ficar registrado ("Elevação lateral na máquina: pulada hoje"), que isto
**não volta a pedir** ("o exercício não reaparece como pendente nesta sessão"), e
que o programa não muda.

**O que ele pode fazer dali.** Confirmar, ou voltar. E — isto é requisito, não
escolha — **desfazer**, enquanto a sessão estiver aberta. O app de hoje já guarda
a lista: `S.sessao.pulados` nasce como array em `abreSessao` e é copiada para a
marca em `fechaSessao` (`if (s.pulados && s.pulados.length) marca.pulados =
s.pulados.slice()`, conferi). Tirar um id dessa lista é a operação inteira, e
`tests/fluxo/ciclo.test.js` (18 casos) já cobra pular como "decisão registrada e
reversível" — **então reversível já é a regra testada do app**, e "não volta como
pendente" fala de outra coisa: de ele não ser oferecido de novo sozinho. As duas
convivem, e o desenho precisa dizer as duas, porque juntas elas parecem
contraditórias.

**Como se sai.** O exercício pulado continua na lista do dia, marcado como
pulado, com o desfazer a um toque. Ele não some: um exercício que desaparece da
lista depois de pulado é um estado sem saída, porque o caminho de volta deixa de
existir na tela.

### 7.7 · Deload — o estado que não existe, e que muda de lugar contra uma razão escrita

**Não está desenhado** (§7.0): uma linha numa folha desabilitada,
"Deload hoje · metade das séries, mesmas cargas".

**E ele não é só desenho que falta: é regra que a frente 1 já mandou para a mesa
do dono** (achado 3). Hoje o interruptor mora em Ajustes, e o comentário do
fonte diz por quê, palavra por palavra: *"Fica AQUI, e não no TREINO, de
propósito: um interruptor que corta metade das séries não deve estar a um toque
no meio de uma sessão. O app existe em parte para frear, e o caminho de menor
esforço tem que ser o conservador."* A D o põe no `···` da sessão. **As duas não
podem valer ao mesmo tempo, e a decisão não é minha.**

**O que eu especifico é o estado, para os dois lugares**, porque ele falta nos
dois:

**O que aparece.** O app de hoje já tem a frase do efeito, e ela é boa:
"Deload ativo: metade das séries, mesmas cargas." / "Deload desligado. Séries
completas de volta." (conferi `toast()` em `src/main.jsx`). O que falta é o
**estado**, não a mensagem: com deload ligado, cada exercício mostra metade das
séries prescritas, e a tabela do exercício tem de dizer que o número de séries
que está ali **não é o prescrito**. Hoje o estado aparece no TREINO quando ligado
(está no mesmo comentário do fonte), e com a aba de treino virando modo isso
precisa de endereço novo.

**O que ele pode fazer dali.** Desligar. E — requisito — **ver quantas séries
ficaram de fora**, porque é o número que a conta de volume vai ler. A marca já
existe no dado: `abreSessao` grava `marca.dl = 1` quando `S.deload` está ligado
(conferi), então a sessão sabe que foi deload e o histórico também.

**Como se sai.** Desligando. E a pergunta que precisa de resposta antes de isto
virar código: **desligar no meio da sessão devolve as séries que faltam?** O dado
diz que sim por construção, porque a lista de séries é derivada do prescrito mais
`S.deload`; mas então uma série registrada na metade cortada reaparece como
pendente. **Isto é pergunta de regra, e eu não a respondo:** sobe junto do
achado 3, porque é a mesma decisão.

> **RECONCILIADO em 06/10 · as duas perguntas desta seção estão respondidas.**
>
> - **Onde mora o deload (decisão 6, confirmada na noite do mesmo dia):**
>   **muda** — vai para o menu `···` da sessão, como a Direcção D desenhou, e **a
>   razão escrita no fonte cai**. Ele manteve a decisão depois de saber que **o
>   lugar ERA o freio**. O argumento derrubado está inteiro em
>   `09-frente1-lugares.md`, achado 3; a mitigação é de palavra, e a frente 3 a
>   escreveu: o item do menu **diz o corte em número antes do toque** —
>   *"Deload hoje · corta 20 séries para 10, nas mesmas cargas"*.
>   **Então este estado precisa ser especificado para UM lugar, não dois**, e o
>   lugar é o menu da sessão. O que esta seção diz sobre "o estado falta nos dois"
>   continua valendo para o lugar que ficou.
> - **Desligar no meio (decisão 7):** **devolve as séries**, e **o que já foi
>   registrado fica**. A segunda metade é a que responde o que esta seção nomeou
>   como risco — a série registrada na metade cortada não reaparece como
>   pendente nem desaparece. A frase que diz as duas metades está em
>   `09-frente3-palavras.md` §7.6.
>
> **E o lugar novo do estado tem consequência que ninguém fechou:** o fonte diz
> que *"o estado dele já aparece no TREINO quando ligado"*, e com a aba de treino
> virando modo isso continua **sem endereço**. A decisão moveu o **interruptor**;
> **onde o estado "deload ligado" se lê fora da sessão ninguém especificou.**

### 7.8 · Encerrar — o estado que não existe, e o que o dono já decidiu dele

**Não está desenhado** (§7.0): uma linha numa folha desabilitada,
"Encerrar a sessão · fim igual à última série; não pergunta nada".

**E "não pergunta nada" é decisão do dono** (D1: a pergunta do fim do treino
sai). Então o estado é curto, e é curto de propósito.

**O que aparece.** Hoje, `finalizarSessao` faz **duas** perguntas por `confirm()`
do sistema, e conferi as duas: "Nenhuma série registrada neste treino. Descartar
a sessão?" quando não há nada feito, e "Finalizar com N exercícios pendentes?",
com a lista dos quatro primeiros e "e mais N", quando há. **As duas são sobre o
registro, não sobre o programa**, e a decisão do dono tira a **terceira** — a do
programa. **Requisito:** as duas primeiras ficam, e deixam de ser `confirm()` do
sistema, porque `confirm()` prende foco e não é descartável sem responder (é o
E1-a do `04-acesso.md`, literalmente: "não pode prender o foco nem cobrir o
elemento focado, e tem de ser descartável sem responder").

**O que ele pode fazer dali.** Encerrar, ou voltar. E o que o encerramento faz,
que precisa estar na tela antes do toque porque é o que o dono vai conferir:
grava a duração (até o **instante do toque**, não até a última série — é a
diferença entre `comoFim === 'manual'` e `'auto'`, conferi em `fechaSessao`),
marca o fim como manual, e **gira a rotação** (`view.day = nextDay()`).

**Aqui há uma contradição entre o desenho e o código, e vale o código.** A linha
do protótipo diz "fim igual à última série". Isso é o que o fecho **automático**
faz: `const fim = comoFim === 'manual' ? Date.now() : (s.ultima || s.inicio)`.
No fecho **manual** o fim é o instante do toque, e tem de ser — é o que a
palavra "acabei" significa, e é o que o comentário do fonte diz ("sem 'acabei', o
melhor palpite é a última série; com, é o instante do toque"). **Requisito:** a
linha do `···` passa a dizer o que o fecho manual faz, e o "fim igual à última
série" fica onde ele é verdade: na faixa do encerramento automático, que a
frente 1 já pôs como regra 2 da precedência ("Fechei na última série: 6h20 →
7h31, cerca de 1h11 (aproximada)").

**Como se sai.** Encerrar fecha a **sessão**, não o modo (frente 1, §4.5). O que
aparece depois é o Agora, com a confirmação do que foi registrado.

**E o requisito que vem de fora e é o mais caro desta seção:** tirada a pergunta,
**o fecho manual descarta a mudança do dia em silêncio.** É §9.2, e é o F280
nominal. Não dá para especificar "encerrar não pergunta nada" sem especificar,
na mesma mudança, onde a mudança vai parar.

---

## 8 · O portão de acesso — é portão desta frente, e não acabamento no fim

Portão quer dizer: um estado não está pronto antes disto, e não "isto se arruma
depois". A razão é aritmética — são 178 ícones e um padrão de alvo, e as duas
coisas se resolvem no componente, uma vez. Deixar para o fim é refazer 178 vezes.

### 8.1 · Os 178 ícones mudos

**Medido por C3:** **178 `<svg>`** na direção D, **0 de 178** com
`aria-hidden="true"`, `<title>` ou `aria-label`; **102 dos 178** ficam **fora**
de um controle já nomeado (`04-acesso.md`, R-D2 e a tabela D-2, conferi). O
critério é 1.1.1.

**A regra, e ela é binária:** todo `<svg>` é uma de duas coisas, e nunca uma
terceira.

1. **Decorativo** — `aria-hidden="true"`, e o nome vem do controle que o contém
   ou do texto ao lado. São os 76 que estão dentro de controle nomeado, mais os
   14 quadradinhos dos 14 dias (§2), que têm a frase logo abaixo carregando o
   número.
2. **Portador do nome** — `role="img"` com `aria-label` escrito, ou um `<title>`
   dentro do `<svg>`. São os 102 que estão sozinhos.

**E o padrão de ouro já está no material**, na outra direção: *"Os dez gráficos
sem texto da C têm `role="img"` **com rótulo escrito**, e o rótulo carrega o
número"* (do parecer). Carregar o número é a diferença entre um nome e uma
etiqueta: "Séries da semana" não serve; "Séries da semana: 12 de 12 prescritas"
serve.

**Requisito de implementação, e é ele que torna isto portão:** o ícone não é
escrito à mão 178 vezes. Ele entra por **um** componente, cuja assinatura **não
permite** omitir a escolha — ou recebe um rótulo, ou recebe a marca de
decorativo, e não existe terceira forma de chamá-lo. É a mesma disciplina que
`tests/dominio/estilo.test.ts` aplica à cor ("cor nova não entra solta no meio
das regras: dê um nome a ele antes de usar"), e o caso que a segura é do mesmo
tipo — de **fonte**, não de DOM, porque o defeito nasce de uma chamada nova e
não da árvore.

### 8.2 · Os 12 alvos, e o padrão de 46 — que é um token e não uma convenção

**Medido por C3:** **12 alvos abaixo de 44 px** na direção D — `.map` a **30 px**
(3 ocorrências) e `.daytype` a **36 px** (9) (`04-acesso.md`, D-7, conferi).
Contra 44, são 12. Contra o padrão interno, são muito mais.

**O padrão interno não é uma frase num documento: é um token com a razão
escrita.** Conferi em `src/tokens.css`:

```css
--ins-tap: 46px;   /* controle numérico repetido; 46 e não 44 de propósito:
                      ele usa de pé, suado, com uma mão */
--ins-tap-dense: 28px;
```

E o segundo token traz a saída para a densidade, também escrita: *"28px é
DESENHO, não alvo: controle secundário dentro de linha cheia… Quem usa este
degrau estende a ÁREA por `::after` até 44 no mínimo; onde o vão entre fileiras
não permite, o quanto deu está escrito na própria regra."* O contrato de UX
repete: *"Alvo ≥ 24×24 (norma); ≥ 46 px para controle repetido (padrão
interno)"* (`docs/LASTRO_UX_CONTRACT.md:197`, conferi).

**Então a régua desta frente é essa, e ela tem três degraus, não um:**

| degrau | quando | mecanismo |
|---|---|---|
| **46 px de alvo** | controle **repetido** — a régua, o `.cellb`, a caixa de marcar da linha do dia, o RIR, os pontos do mapa da sessão | desenho de 46, ou desenho menor com `::after` levando o alvo a 46 |
| **44 px de alvo** | controle não repetido, dentro de linha cheia | `::after` com `inset` negativo |
| **24 × 24** | o mínimo da norma, e nada do app desce até aqui | — |

**Os três alvos desta frente que estão abaixo e precisam subir:**

1. **`.cellb`**, cerca de **22 px** (§5.1) — nunca medido por ninguém, e é o
   menor da direção. É controle repetido: `--ins-tap`, por `::after` vertical.
2. **`.map`**, **30 px** — e aqui eu corrijo uma leitura minha antes de
   escrevê-la errado: o mapa da sessão **não** é um alvo por série. É **um**
   `<button class="map" data-a="mapa">` de largura cheia, com os pontos como
   conteúdo dentro dele e um rótulo que carrega o número — `aria-label="Ver a
   sessão inteira: 10 de 20 séries guardadas"` (conferi `prototipo.html:577`).
   Então é **um** alvo de 382 × 30 px: passa folgado na largura e reprova na
   altura, contra 44 e contra 46. Os três alvos de 30 px que C3 contou são três
   ocorrências deste mesmo botão, não três pontos.
   **Duas consequências disso, e as duas são boas de saber:** o rótulo já
   carrega o número, o que torna os pontos **decorativos** — eles são parte dos
   178 de §8.1, e a resposta para eles é `aria-hidden`, não nome. E o
   `overflow-x: auto` dele (um dos três de §1.2) deixa de ser problema de
   alcance e passa a ser de **leitura**: os pontos das últimas séries ficam fora
   da janela pela conta de §1.1, e quem precisa do número tem o rótulo. O que
   isso pede não é alvo maior na horizontal — é a altura em 46 e os pontos
   legíveis sem arrastar, ou a confissão de que o mapa é um atalho e o número
   mora no rótulo.
3. **`.daytype`**, **36 px** — nove ocorrências, e é o botão que diz o tipo de
   dia no Agora. No protótipo é um dos becos silenciosos (§7.0).

**E os sete que estão a exatamente 44 px**, que passam a norma e reprovam o
padrão interno, todos de controle repetido ou quase: `.ib` (44 × 44), `.lk`,
`.chip`, `.pill`, `.nav .act`, `.seg button` e `.acts button` (conferi as sete
regras em `03-direcao-D/prototipo.html`). **Conta de classes no CSS, não de
instâncias renderizadas** — eu não contei instância por instância, e C3 contou
contra 44, não contra 46. **O número de alvos que reprovam o padrão interno de
46 é, portanto, não medido.**

### 8.3 · A série guardada não é anunciada — a reprovação grave da D

É o **R-D1**, e o parecer o chama assim: *"a série guardada não é anunciada —
`<div class="saved">` sem `role`/`aria-live`; o ato mais frequente do produto é
mudo para leitor de tela."* Conferi o `<div class="saved">` em `zonaDepois()`, e
é isso: nenhum `role`, nenhum `aria-live`.

Já está em §1.3 como requisito R6, e repito aqui por uma razão: **é a única
reprovação dos dois arquivos que piora um comportamento que hoje funciona.** Os
outros defeitos de acesso da D são coisas que o app de hoje também não tem
(ícone sem nome, alvo pequeno). Este é diferente: hoje o valor mora num
`<input>`, e o campo ecoa o que foi digitado **por ser campo**
(`src/ui/exercicio.jsx:84-98`, conferi). Trocar o campo por um botão **remove um
anúncio que existe de graça**, e nada o repõe.

**E há um segundo lugar com o mesmo defeito, que ninguém listou:** o visor do
teclado próprio. `<b data-k="d">` tem o texto trocado a cada tecla, sem região
viva (conferi `folhaCarga`). Num teclado onde o visor é a única coisa que existe,
isso quer dizer que **digitar é mudo**. O requisito está em §6.2, T2.

**E um terceiro, que a D fez certo e que não pode se perder:** a frase de
leitura de volta da folha de pôr em dia **já** é região viva, com
`aria-live="polite"` (conferi `:1192`). É o único `aria-live` do arquivo inteiro.

### 8.4 · 320 px — o protocolo, e ninguém mediu

**Está no checklist de tela nova do contrato vigente** e **ninguém mediu**. O
parecer registra a razão: *"A régua de D rola na horizontal por projeto, e C3
mediu que 10 elementos do M1 saem pela direita do telefone de 414 px (ele
classificou isso, corretamente, como a régua funcionando e não como corte). A
320 px o problema é maior, e não foi medido por ninguém."*

**O critério é 1.4.10 Reflow (AA):** o conteúdo tem de servir a 320 px de
largura **sem exigir rolagem nos dois eixos**. Rolagem horizontal **de um
controle** (a régua) não viola; rolagem horizontal **da página** viola.

**O protocolo.** Não exige o aparelho do dono — dá para fazer com uma janela de
navegador —, mas exige olhar, e eu não o executei.

1. Abrir cada estado com a janela em **320 × 568** CSS px (o menor iPhone que já
   existiu, e o número que o critério usa).
2. Para cada estado, anotar **três** coisas: (a) existe rolagem horizontal da
   **página**? (b) existe conteúdo **cortado e inalcançável**? (c) existe texto
   que **sobrepõe** outro texto?
3. A pergunta (b) é a que importa mais aqui, e é por causa de uma regra do app:
   o `body` tem `overflow-x: clip`, posto de propósito para matar o rubber-band
   e proteger o `sticky` (é o caso *nenhum ancestral do sticky vira scroll
   container*, conferi). **`clip` corta sem rolar.** Então, a 320 px, conteúdo
   largo demais não ganha barra de rolagem: ele **desaparece**, sem erro nenhum.
   Isso é melhor que violar 1.4.10 por rolagem e **pior** para o dono, porque
   conteúdo cortado e inalcançável é perda de função. **O protocolo tem de
   distinguir os dois**, e é essa distinção que torna a medição necessária em
   vez de dedutível.
4. Rodar nos estados onde a conta de §1.1 prevê aperto: a régua (cada botão
   mantém 54 px fixos, então a 320 px cabem **4** e não 6 — `(320 − 32 − 54) ÷
   60 = 3,9`, **conta**), a fileira de três botões de `.acts`, a barra dos cinco
   lugares, a tabela do exercício com quatro séries, e os cinco campos da
   bioimpedância.

**O número que reprova:** **1 ou mais** estados com rolagem horizontal de página
**ou** com conteúdo cortado e inalcançável. Não há tolerância porque não é
estatística.

> **RECONCILIADO em 06/10 · 320 px NÃO É ALVO. O alvo é 414, e 320 fica
> declarado fora.**
>
> O dono respondeu primeiro *"primeiro a medição, depois ele decide"* (decisão 15
> das quinze) e, na noite do mesmo dia, **delegou a decisão ao coordenador**
> ("seguindo o contexto", pergunta 8 das oito). **A decisão registrada é: 414 é
> o alvo; 320 não é.** O contexto usado: o aparelho dele tem 414 px, o segundo
> usuário **não existe no dado**, e a frente 3 achou que o nome **"Prescrição"
> encosta na fatia da aba a 320 px já a 100% de texto** — atender 320 obrigaria
> a renomear um dos cinco lugares por um usuário que ainda não existe.
>
> **E uma precisão sobre esse número, porque o registro o endureceu demais:**
> `00-coordenacao.md` diz que a frente 3 *"mediu"* que "Prescrição" *"já
> transborda"* a fatia a 320 px. **Ela não mediu e não transborda:** §1.6 dela é
> explícito — *"Isto é conta, não medida"* e *"Não medido"* — e o número é
> **63,8 pt de avanço calculado numa fatia de 64 pt**, isto é, **exatamente na
> borda**. A 125% de texto ela quebra em duas linhas, e quebrar em duas linhas é
> a saída que a própria frente 3 declara aceitável. **A conclusão (320 fora) não
> muda** — ela se sustenta no aparelho de 414 px e no segundo usuário que não
> existe —, mas o argumento da aba é **conta na borda**, não transbordo medido.
>
> **O que FICA de pé, e é o que impede o estrago:** **nada pode ter largura fixa
> maior que a tela, e a página nunca rola na horizontal.**
>
> **E aqui eu corrijo o registro:** `00-coordenacao.md` diz que *"a rede já testa
> isso e custa zero"*. **Ela testa metade.** Fui ver os 38 casos de
> `tests/dominio/estilo.test.ts`: a página não rolar na horizontal está coberto
> **indiretamente**, por `assert.match(regras(base(), 'body'),
> /overflow-x:\s*clip/)` dentro do caso *nenhum ancestral do sticky vira scroll
> container* — e é asserção de **declaração**, não de layout, porque jsdom não faz
> layout. **"Nada com largura fixa maior que a tela" NÃO TEM CASO NENHUM:**
> nenhum dos 38 nomes fala de largura, e eu não achei asserção de `width` contra
> a tela em arquivo nenhum. **A invariante continua sendo a decisão certa e
> continua sendo barata — mas metade dela ainda precisa ser escrita como caso.**
>
> **Então o protocolo acima não é mais portão** — ele continua válido como
> **medição opcional** que produz a lista do que quebraria se um segundo usuário
> chegasse num telefone pequeno. O custo fica conhecido e **declarado, não
> esquecido**. A distinção que ele nomeia — **cortado não é rolável**, porque
> `body { overflow-x: clip }` corta sem rolar — continua sendo a parte mais útil
> dele, e ela vale a 414 px também.
>
> **E o checklist do contrato de UX vigente continua pedindo 320 px.** Esta
> decisão o contraria: quem reescrever o contrato tem de tirar 320 px do
> checklist e pôr a invariante no lugar. **Ninguém fez isso ainda.**

### 8.5 · 200% de texto — o protocolo, e o conflito que ninguém nomeou

**Também não medido** — o parecer o lista: *"o layout dos dois a 200% de texto"*.
Aqui eu achei uma coisa que muda a pergunta, e ela precisa ser dita antes do
protocolo.

**O critério é 1.4.4 Resize Text (AA):** o texto tem de poder ir a 200% sem
perda de conteúdo ou de função. E **o app de hoje bloqueia isso em três
camadas, todas de propósito e todas com caso de teste:**

1. `index.html:9` — `maximum-scale=1, user-scalable=no` (caso *o viewport não
   deixa o navegador escalar a página*).
2. `src/base.css`, na regra `html` — `touch-action: pan-x pan-y`, com o
   comentário que diz o que se perde: *"O que se perde é a pinça para enxergar
   melhor. É aceitável aqui porque nenhum texto do app é menor que 16px e a
   leitura não depende dela — e porque zoom acidental no meio de uma série, com a
   mão suada, custa mais que zoom deliberado ganha."* (Caso *a raiz recusa os
   gestos de zoom*.)
3. `src/main.jsx` — `gesturestart`, `gesturechange` e `gestureend` recusados com
   `passive: false`, porque o Safari implementa a pinça como gesto próprio,
   acima do `touch-action` (caso *a pinça do WebKit é recusada*).

**E há uma quarta camada, que é tipográfica e que ninguém mencionou:** eu contei
as cinco folhas e **`rem` aparece zero vezes** em todas as cinco
(`tokens.css`, `base.css`, `componentes.css`, `treino.css`, `protocolo.css`).
Toda a tipografia é em `px`. Isso quer dizer que, mesmo sem as três camadas
acima, o ajuste de tamanho de texto do sistema **não alcançaria** o texto deste
app — ele só é alcançado por zoom de página, que é justamente o que está
bloqueado.

**Então a afirmação honesta não é "não medido": é "bloqueado, de propósito, e
com a razão escrita".** 1.4.4 não é atingível no app como ele está, e isso é
decisão registrada em três casos de teste e dois comentários de fonte. O
`04-acesso.md` diz que "nenhuma das duas direções põe `maximum-scale` nem
`user-scalable=no`" — e está certo, porque ele mediu **os nove HTML**, que não
são o app. O app põe.

**O que ainda vale medir, e por isso o protocolo existe:** se o desenho
**sobreviveria** a 200%. Isso responde a uma pergunta de verdade — se o bloqueio
é uma escolha que pode ser revista, ou se é a única coisa que impede a tela de
quebrar. São respostas muito diferentes.

**O protocolo.**

1. Numa janela de **414 px** de largura, aplicar **200% de zoom de página** (não
   de fonte — com tipografia em `px`, zoom de fonte não faz nada).
2. Para cada estado, anotar: (a) algum texto some? (b) algum texto sobrepõe
   outro? (c) algum controle sai da tela sem caminho até ele? (d) a régua
   continua operável?
3. Rodar nos mesmos cinco estados apertados de §8.4, mais a frase de leitura de
   volta da folha (que é longa e cresce com o número de refeições — agora sete,
   com a ceia).

**O número que reprova:** **1 ou mais** respostas (a), (b) ou (c). A (d) é
informativa, porque a régua a 200% com botões de 108 px só mostra **2** valores
pela conta de §1.1 — o que é previsível e não é defeito novo, é o mesmo defeito
em escala.

**E o que o resultado decide:** se nada quebrar, o bloqueio de zoom passa a ser
uma escolha revisável, e o que a sustenta é só o argumento do toque acidental —
que é bom e é dele. Se quebrar, o bloqueio passa a ser a única coisa que segura
a tela de pé, e isso é um fato que ninguém sabe hoje. **Em nenhum dos dois casos
a decisão é minha:** o argumento escrito no fonte é do produto, e revê-lo é
decisão do dono.

> **RECONCILIADO em 06/10 · três coisas, e uma delas desmente esta seção.**
>
> **1 · O teto do texto é 125%, não 200%** (decisão 10 das quinze), *"e fica
> escrito que não cumpre 1.4.4"*. É o que a frente 4 recomendou, com a conta da
> régua desta frente dentro (a 200% a régua mostra 2 de 12 valores). Então o
> protocolo de 200% **deixa de ser portão**: ele fica como a passada G4 da
> medição G da frente 4, **informativa**, para dizer se 200% seria possível.
>
> **2 · O bloqueio de pinça FICA** (decisão 11). Nota literal dele: *"nem precisa
> desse argumento de mao suada. nao quero esses zoom automatico e pronto. nao
> gosto."* **A decisão é dele e não depende de nenhuma medição** — o que esta
> seção punha como "pode ser revisto se nada quebrar" não é mais pergunta.
> E o coordenador registrou o que a nota dele aponta: **o que ele recusa é o zoom
> AUTOMÁTICO** — o salto que o Safari dá ao focar campo menor que 16px —, e
> **isso é impedido pela regra dos 16px no campo**, não pelo `user-scalable=no`.
>
> **3 · E a MEDIÇÃO desmente a premissa desta seção: no PWA instalado a PINÇA
> FUNCIONA.** Ele mediu no aparelho em 06/10 (pergunta 7 das oito da noite:
> **sim**). Então, **onde ele usa o app**, nem o `user-scalable=no`, nem o
> `touch-action`, nem a recusa dos eventos de gesto impedem a pinça. As três
> camadas que esta seção lista existem como **declaração** e **não produzem o
> efeito** ali — o que elas ainda alcançam é o Safari fora da tela cheia.
> As duas coisas convivem e as duas têm de ser registradas: **a decisão de manter
> e a medição de que ali não faz efeito.**
>
> **E a citação de `src/base.css` nesta seção envelheceu.** A frase *"nenhum texto
> do app é menor que 16px"* era **falsa** e foi reescrita no fonte em 06/10
> (`d625147`). **Medido por mim agora, nas cinco folhas, com os comentários
> removidos:** são **27** declarações de `font-size`, **21** abaixo de 16px, a
> menor **7,5px** (o rótulo do eixo da sparkline), e **duas** abaixo do piso de
> 9px do próprio `DESIGN.md` (7,5 e 8). **Contando também o atalho `font:`** — que
> é como a frente 4 contou — são **221** declarações com valor em px, **183**
> abaixo de 16px (83%) e **três** abaixo de 9px (7,5 · 8 · 8,5). **Os dois pares
> de números medem coisas diferentes e os dois estão certos**; qualquer um deles
> derruba a frase antiga.
> *(Nota de precisão: o registro em `00-coordenacao.md` diz "28 declarações, 22
> abaixo de 16px". São 27 e 21 — a 28ª ocorrência de `font-size` no arquivo é a
> menção à palavra dentro do próprio comentário que escreve o número, em
> `src/base.css`. O comentário se contou.)*
> O comentário novo diz as duas correções e mantém a razão que de fato sustenta o
> bloqueio, que nunca dependeu daquela afirmação. Três nomes de caso em
> `estilo.test.ts` passaram a nomear **a declaração** em vez de prometer **o
> efeito**; nenhuma asserção mudou.

---

## 9 · Os três requisitos de ordem

Não são desenho, são **sequência**. Fora de ordem, alguma coisa desaparece entre
uma mudança e outra — é o que `07-plano.md` §3.6 chama de "a capacidade que sai
sem ninguém notar". Conferi os três no código.

### 9.1 · A conta de volume: a ordem é amarrada por uma função sem teste

**Confirmei o achado da frente 1, e acrescento a forma que a mudança precisa
ter.**

`impactoDoMod(d, m)` vive em `src/main.jsx` e **não** em
`src/dominio/volume.ts` (conferi as duas coisas). Ela é a única que produz a
forma **"antes → depois"** que a peça pede — por exemplo
`"deltoide lateral: 12 → 13 na rotação · o treinador prescreveu 12"`. `impacto()`,
que está em `volume.ts` com 13 casos em `tests/dominio/volume.test.ts`
(contei os `test(`), só afirma **o número de agora**.

**O único chamador de `impactoDoMod` em `src/` é `CTX.decisao`** — conferi com
grep: duas ocorrências em `src/main.jsx` (a definição e a chamada) e duas em
`tests/fluxo/edicao.test.js`. A tela que D1 remove é a única chamadora.

**E das quatro ramificações, só `troca` tem teste.** As duas chamadas do teste
são ambas de `troca` (conferi: `{ k:"troca", slot:"agachamento-no-smith",
por:"belt-squat" }`, uma afirmando o aviso das 6 a 8 semanas e outra afirmando
`null`). `sets`, `add` e `rm` — **as três que produzem o "antes → depois"** — não
têm asserção em lugar nenhum.

**O que a frente 1 não disse e que muda o tamanho do trabalho:** `impactoDoMod`
tem **sete colaboradores que leem estado de módulo**, e é isso que a torna não
pura hoje:

| colaborador | o que lê |
|---|---|
| `exDe(x)` | `CAT`, o catálogo de exercícios |
| `nomeEx(x)` | `CAT`, por `exDe` |
| `seriesOficiais(g)` | `S.prog` e `rot()` |
| `ALVO[g]` | já é puro: `alvoDoPrograma(PROGRAMA, ROT_BASE)`, derivado do programa congelado |
| `slotOriginal(d, slot)` | `S.prog` |
| `semanasNoPrograma(sl)` | `Date.now()` |
| `semanasDe(t)` | `Date.now()` |

**A forma que a função de domínio precisa ter**, pela disciplina que o módulo já
segue ("nenhuma função deste módulo lê relógio", e `agora` entra por parâmetro
em todo `calculo.ts`): programa, rotação, catálogo, mapa de alvos e `agora`
entram **por parâmetro**. É a mesma assinatura que `impacto(g, agora, alvo)` já
tem, estendida. E `seriesDeGrupo` já está em `volume.ts` (conferi), então metade
do caminho está feita.

**A ordem obrigatória, e ela não se inverte:**

1. **`impactoDoMod` vira função de domínio ao lado de `impacto()`**, com os
   parâmetros acima e **teste para as quatro ramificações** — `sets`, `add`,
   `rm` e `troca`. Três delas ficam vermelhas de nascença, porque hoje não têm
   asserção nenhuma, e é justamente por isso que elas vão primeiro.
2. **A lista de Prescrição passa a ser a chamadora.**
3. **Só então `src/ui/telas/decisao.jsx` sai.**

**E uma nota de leitura, para a reponta não se assustar:** `impactoDoMod`
devolve `null` para `reps`, `desc` e `mover`. Isso é **correto** — o formato de
`Mod` tem sete tipos (`{ k:'sets'|'reps'|'desc'|'troca'|'rm'|'add'|'mover' }`,
conferi o comentário em `src/main.jsx`), e mudar repetição, descanso ou ordem
não muda contagem de série por músculo. "Quatro ramificações" é certo; os três
`null` são decisão, não omissão, e o teste novo tem de afirmar os `null`
também — senão a próxima pessoa "conserta" o que está certo.

### 9.2 · O carregador da mudança pendente, nos DOIS fechos

**Confirmei o achado da frente 1, e a frente 0 já fez metade.**

O que a frente 0 entregou (conferi): `S.promoPendente` é
`PromoPendente[]`, com `guardaPromo(s, pendentes)` e `soltaPromo(sid)` em
`src/main.jsx`, chave natural `chaveDePromo(p) = 'promo:' + sid` em
`src/dominio/sincronia.ts`, lápide em `soltaPromo`, teto de 60 entradas, e regra
de fusão por coleção (`base.promoPendente = pp.itens.slice(-TETO.promo)`).

**E uma correção à frente 1, pequena e a favor:** ela pediu a chave como "o dia
mais o `sid`". A frente 0 a fez **`sid` sozinho**, e o comentário do tipo
explica por que isso é melhor: *"`day` é editável no meio do treino… uma chave
composta faria a MESMA pergunta fundir como duas entradas se os dois aparelhos
tivessem registrado letras diferentes para a mesma sessão. Ele responderia duas
vezes."* (conferi em `src/dominio/tipos.ts`.) **Vale a do código.**

**O que falta, e é o que me cabe especificar:**

**No fecho automático o carregador já escreve.** `fechaSessao` tem
`const pendentes = comoFim === 'auto' ? modsDoDia(s.day) : []` e chama
`guardaPromo` (conferi).

**No fecho manual não escreve nada, e o que existe faz o contrário.**
`finalizarSessao` chama **`soltaPromo(s.sid)`** — que tira da lista **e deixa
lápide** — e abre `view.promo` para a pergunta (conferi). Tirada a pergunta
(D1), o que sobra é `soltaPromo` sem nada em troca: **a mudança é descartada em
silêncio, e com lápide**, que é pior do que descartada, porque a lápide impede o
outro aparelho de a trazer de volta na fusão. **É o F280 nominal, e a lápide o
torna definitivo.**

**O requisito, em três linhas:**

1. `finalizarSessao` passa a chamar **`guardaPromo(s, mods)`** no lugar de
   `soltaPromo(s.sid)` + `view.promo`.
2. `soltaPromo` **continua existindo e continua sendo a única porta da lápide** —
   ela passa a ser chamada de **Prescrição**, quando ele decide, e do vencimento
   (§9.3), quando ele deixa vencer. Decidir e vencer deixam lápide; encerrar
   não.
3. **A guarda do dia aberto vai para os dois fechos.** `finalizarSessao` tem
   `if (mods.length && !diaAberto(s.day))`, com a razão escrita: *"Num dia
   ABERTO o que foi adicionado É o dia, não uma emenda a ele: não há conteúdo
   permanente para aquilo virar, e perguntar 'isto fica no programa?' a cada
   movimento do box seria uma pergunta por semana sem resposta certa."*
   **`fechaSessao` não tem essa guarda** (conferi: a única condição é
   `comoFim === 'auto'`). Hoje isso significa que uma aula de box que fecha
   **sozinha** enfileira os movimentos dela como mudanças esperando decisão, e
   uma que ele encerra **no toque** não. A assimetria é invisível e produz uma
   pergunta por semana sem resposta certa — exatamente o que o comentário diz
   que não se deve fazer. **Requisito:** `!diaAberto(s.day)` nos dois.

**E uma consequência de interação, que é o meu lado disto:** o encerramento
deixa de perguntar e passa a **informar**. Encerrar com mudança do dia produz
uma linha no Agora, não uma pergunta: *"A série a mais do Treino A está
esperando decisão em Prescrição."* Sem isso, a mudança some da vista dele no
mesmo instante em que o app passa a guardá-la — e "guardado em silêncio" é tão
ruim quanto "descartado em silêncio", porque ele não sabe que há algo a decidir.
O protótipo já tem a frase certa no cartão do exercício, e ela pode ser a mesma:
*"A série a mais é mudança só de hoje. Se vira permanente, você decide sentado —
ela espera em Prescrição até o Treino A voltar."* (conferi `:654`.)

### 9.3 · O vencimento por posição, como leitura derivada

**A frente 0 deixou `day` e `t` na coleção de propósito e não criou campo de
vencimento**, e o comentário do tipo diz por quê, com a resposta do dono dentro:
*"**Não há campo de vencimento**, e isto é resposta do dono, não omissão: a
mudança vence *por posição* — quando aquele treino voltar na sequência —, e isso
'sai de graça do modelo; nenhum carimbo novo no dado'. O que ela vira ao vencer
('só daquele dia') é o estado em que a mudança já está, porque nunca foi
promovida ao oficial: não há o que gravar."* (Conferi em `src/dominio/tipos.ts`.)

**Conferi que sai de graça mesmo, e aqui está a leitura inteira.** Ela usa três
coisas que já existem: `S.rot` (por `rot()`), `S.done` e `nextDay()`.

**Quando vence** — e isto é o predicado, não uma data:

> Uma mudança pendente `p` **venceu** quando existe em `S.done` uma sessão `x`
> com `x.day === p.day`, sem `x.livre`, e `x.t > p.t`.

Em palavra: aquele treino voltou e aconteceu depois que a mudança ficou
esperando. Nenhum campo novo, nenhuma data guardada, e **nada que dependa do
relógio** — o que a torna testável sem congelar tempo.

**Quando ela vai vencer** — e isto é o que a tela mostra como prazo:

> `voltas(p) = (rot().indexOf(p.day) − rot().indexOf(nextDay()) + N) % N`, com
> `N = rot().length`.

`voltas(p) === 0` quer dizer "a próxima sessão é aquele treino" — é o dia em que
o aviso da manhã aparece (frente 1, §5.1, regra 6: **uma vez**, no Agora, e
**nunca durante a sessão**). `voltas(p) === 2` quer dizer "faltam dois treinos".
**A tela diz em treinos, não em dias**, e isso não é escolha de palavra: a
sequência A→B→C→D→E→aula avança **pela ordem, não pelo dia da semana** (F81,
registrado no `prototipo.md`), então "quarta-feira" seria um palpite e "faltam
dois treinos" é um fato.

**As duas leituras concordam no instante da virada, e isso precisa ser dito**
porque é o que impede o aviso de aparecer depois de vencer: `nextDay()` sai de
`ultimaDoPlano()`, que é a última entrada de `S.done` com `day` e sem `livre`
(conferi as duas funções). No instante em que a sessão do Treino A entra em
`S.done`, `venceu(p)` passa a ser verdadeiro **e** `nextDay()` deixa de ser `A`.
Nunca há uma janela em que o aviso diga "hoje" e a mudança já esteja vencida.

**O que o vencimento faz na tela** — e aqui a decisão do dono (5.a' P2) é
literal: **vira "só daquele dia", dito e desfazível.**

- **Dito:** uma linha que nomeia o que aconteceu, sem passivo e sem culpa —
  *"Ficou como só daquele dia quando o Treino A voltou."* A forma está desenhada
  no bloco "Venceu sem você" da `prescricao.html`, estado 1.
- **Desfazível:** *"Tornar permanente agora."* E desfazer é possível porque
  **nada foi apagado**: a mudança nunca foi promovida ao oficial, e a sessão onde
  ela aconteceu continua com o que foi registrado.
- **Nada entra no programa em silêncio, e nada é descartado em silêncio.** As
  duas metades, e a segunda é a que o §9.2 paga.

**Por quanto tempo o desfazer continua oferecido — e isto é pergunta que eu não
respondo.** A coleção tem teto de 60 entradas (`S.promoPendente.slice(-60)`,
conferi), e a decisão do dono diz "desfazível" sem dizer até quando. Sessenta
mudanças vencidas acumuladas é uma lista que ninguém lê. **Isto sobe à mesa
dele**, com a observação de que a resposta não precisa de campo novo:
`voltas(p)` já diz quantos treinos passaram desde o vencimento, e um limite em
treinos — "o desfazer vale até aquele treino voltar outra vez" — usaria a mesma
leitura e a mesma palavra.

> **RECONCILIADO em 06/10 · RESPONDIDO, e ele respondeu exatamente a forma que
> esta seção propunha.**
>
> **Decisão 8 das quinze:** o desfazer do vencimento vale **até a próxima sessão
> daquele treino**. É limite **em treinos**, não em dias nem em número de
> entradas, e usa `voltas(p)` — nenhum campo novo, como esta seção havia
> previsto. A frase está escrita em `09-frente3-palavras.md` §5.6:
> *"Dá para fazer entrar no Treino B até a próxima vez dele."*
>
> **O teto de 60 entradas continua existindo e não foi tocado pela decisão.** Com
> o desfazer expirando em um retorno, a lista que ninguém lê para de crescer na
> prática — mas **ninguém mediu** quantas entradas vencidas ficam visíveis por
> vez, e o `slice(-60)` continua sendo o único limite real no dado.

---

## 10 · As duas coisas que a frente 1 deixou na minha mão

### 10.1 · A seta de saída da sessão — a conta, e o protocolo

A frente 1 a entregou assim: *"nasceu no protótipo, fica no canto de cima — o
ponto mais longe do polegar — e é a única saída visível do modo. Não medido, e é
medição da frente 2, com aparelho e dedo."*

**A conta, para o protocolo ter um número de onde partir.** Conferi a seta no
fonte:

```html
<button class="ib l" data-a="sair"
        aria-label="Voltar ao Agora, deixando a sessão aberta">…</button>
```

(`prototipo.html:566`.) Ela é `.ib`, **44 × 44 px** (`:66`), dentro de
`.sh { padding: 6px 16px 10px }` (`:60`), dentro de
`.top { padding-top: env(safe-area-inset-top) }` (`:55`).

Num iPhone 11 Pro Max, `safe-area-inset-top` é 44 px (o entalhe). **Conta:** o
centro da seta fica em cerca de **(38, 72)** numa janela de 414 × 896. Da quina
de baixo à direita — onde o polegar da mão direita pivota, com o telefone numa
mão — a distância é `√(376² + 824²) ≈ 906 px`. A diagonal inteira da tela é
`√(414² + 896²) ≈ 987 px`. **A seta está a 92% da diagonal da tela do ponto em
que o polegar gira.** É o ponto interativo mais distante do modo, e a conta diz
quanto.

**O alvo passa a norma e reprova o padrão interno:** 44 × 44 contra os
`--ins-tap: 46px` de controle repetido. E ela **é** repetida: sair da sessão e
voltar é o caminho que a própria frente 1 usou para cumprir "as linhas do dia
tocáveis valem sempre, inclusive durante o treino" (§6.1 dela). Quanto mais a
arquitetura depende da seta, mais vezes ela é tocada.

**O que a conta NÃO decide, e por isso o protocolo existe:** alcance de polegar
depende da mão. Eu não tenho a mão dele e não invento o número.

**O protocolo — Medição E · a seta.** Nas condições de §1.5, ao longo de
**dez sessões reais** (não um teste: uso):

Para cada vez que ele sai da sessão, anotar **uma** de quatro coisas:

| resultado | o que foi |
|---|---|
| **alcançou** | chegou na seta sem mudar a pega |
| **mudou a pega** | escorregou o telefone na mão, ou subiu o dedo pelo corpo do aparelho |
| **duas mãos** | precisou da outra mão |
| **não usou a seta** | saiu pelo gesto de borda, ou não saiu e desistiu |

E anotar junto: **quantas vezes ele saiu por sessão**, porque é esse número que
diz quanto a arquitetura cobra da seta.

**O número que reprova:** **"duas mãos" em mais de 1 de cada 10 saídas**, ou
**qualquer** "desistiu". Duas mãos num instante em que a outra está na barra, no
halter ou apoiada é a definição de alvo fora de alcance, e é pior do que um alvo
pequeno, porque um alvo pequeno se erra e se tenta de novo.

**O que o resultado decide**, e as três saídas estão desenhadas em outro lugar do
material, então nenhuma precisa de invenção: (a) a seta desce para a zona do
polegar, que é onde a D já põe tudo que é frequente; (b) a seta ganha um
segundo caminho na parte de baixo, duplicando o alvo sem mover o de cima; (c)
fica como está, com a taxa medida registrada como custo.

**E uma coisa que eu achei conferindo isto, que muda a frase "a única saída":**
ver §11, item 4. **O gesto de borda existe e funciona** — `src/ui/navegacao.js`
foi escrito por causa dele. A seta continua sendo a única saída **visível**, que
é como a frente 1 a descreveu, e isso é exato. Mas no protocolo o resultado
"saiu pelo gesto de borda" tem de ser contado separado, porque **ele existe**,
não é falha de registro.

### 10.2 · O cartão do exercício fora da sessão — a premissa de que eu dependo

A frente 1 achou que **o cartão do exercício fora da sessão não tem lugar** nos
cinco lugares, e que com ele vão quatro capacidades: o histórico de um exercício
(com o gráfico, a tabela em ordem inversa e **a correção de uma série de semanas
atrás**), o renome, a correção do tipo de carga por movimento, e a troca por
substituto com o histórico de cada opção. A proposta dela é **Prescrição ›
Programa › Treino X**, uma porta por linha.

**A minha especificação depende dessa porta em dois pontos, e eu declaro a
dependência:**

1. **§5 inteiro — corrigir no lugar — só cobre a sessão de hoje.** O alvo dentro
   da tabela (`.cellb`) existe dentro do modo, sobre `S.sess.done`. Corrigir a
   série de três semanas atrás é **outra tela**, e hoje ela abre **só** pelo
   botão "histórico" do cartão do exercício — a frente 1 conferiu com grep que
   `src/ui/exercicio.jsx:422` é o único chamador de `openHist` em `src/`. **Se a
   porta de Prescrição não existir, a correção de série passada não tem
   caminho**, e o alvo que eu especifiquei em §5.1 serve só ao dia corrente.
2. **§7.4 — máquina ocupada — mostra "o que já foi feito de cada substituto".**
   Isso é a quarta capacidade da lista dela. Dentro da sessão continua
   existindo, porque é o cartão aberto. Fora dela, não.

**Então, como premissa:** eu especifico a interação assumindo que a porta
existe, e **se ela não existir, §5 vale só para a sessão do dia e §7.4 perde o
histórico dos substitutos fora do modo.** Não é algo que eu possa consertar por
dentro da interação — é lugar, e lugar é da frente 1.

**E uma medida que falta para dimensionar isto**, que a frente 1 já declarou:
**a frequência com que ele corrige uma série de semanas atrás é não medida.**
Sem ela, não dá para dizer se perder essa porta é grave ou é teórico. Eu não a
inventei e não a medi.

---

## 11 · O que eu fui conferir e não bateu

Onde o código discorda do que estava escrito, **vale o código.** Seis pontos, e
os quatro primeiros mudam trabalho.

| # | o que estava escrito | o que o código diz |
|---|---|---|
| 1 | O `scrollLeft` da régua se perde "**a cada render do cronômetro vizinho**" (meu briefing, e `07-plano.md` §2, frente 2, item 1) | `tick()` roda a cada 1 s e escreve **só `textContent` e `style.width`** em três nós; ela **não chama `render()`** e não toca na faixa (conferi a função inteira). Quem derruba a posição é o **relógio de parede**: um segundo `setInterval`, de 5 s, chama `render()` quando o minuto vira, e `renderSessao()` faz `sc.innerHTML = h` e depois `centrarStrip(sc)`. **Consequência pior do que a descrita:** o arrasto tem validade de no máximo **um minuto**, a perda chega num instante que ele não controla, **vale com o cronômetro parado**, e o `innerHTML` derruba o **foco** junto (§1.2, causa 3) |
| 2 | Os sete estados ruins "**estão desenhados nos oito HTML** e o protótipo os deixou como **becos desabilitados**" | **Quatro** estão desenhados (erro de gravação, carregando, máquina ocupada, dor); **três não** — "pular" é só botão em sete lugares, e "deload" e "encerrar" são **uma linha de texto cada** numa folha desabilitada do protótipo, com **zero** ocorrências nos oito HTML. E os becos **não estão desabilitados**: `data-a="beco"` aparece 8 vezes e **não tem ramificação nenhuma** no tratador de cliques; **7 das 8 não têm `disabled`** — recebem foco, escalam no toque e não fazem nem dizem nada (§7.0) |
| 3 | "Corrigir não reinicia o descanso" é regra a especificar (meu briefing e `07-plano.md` §2) | **Já vale no app de hoje**, e o protótipo também a honra (`corrigeSerie` não toca `restFrom` nem `at`). Mas no app ela se apoia em `view.fired[tag]`, que é campo de `view` — **memória, nunca disco** (conferi a declaração e os três lugares que o zeram). **Defeito vivo:** reabrir o app e corrigir uma série daquela sessão dispara um descanso para uma série que acabou minutos antes, e **nenhum dos 20 casos de `cronometro` e `serie` cobra isso** (§5.3) |
| 4 | "Em PWA instalado não há botão do navegador **nem gesto de borda**" (comentário do caso *o voltar fica grudado no topo*, em `tests/dominio/estilo.test.ts`) | **O gesto de borda existe**, e o app foi consertado por causa dele: o cabeçalho de `src/ui/navegacao.js` diz, com a falha medida dentro, *"No Android — onde o Voltar é botão e é gesto — e **no gesto de borda do Safari**, o primeiro Voltar em qualquer ponto FECHAVA O APP… em todos, direto para fora"*. E o arquivo usa `history.pushState`, `history.go`, `popstate` e `history.scrollRestoration` (conferi as quatro). **O comentário do teste envelheceu**; a asserção dele continua certa, por outro motivo (a seta é a única saída **visível**, e ela rolava para fora em quatro dos cinco destinos). Isto importa para §10.1: o protocolo conta "saiu pelo gesto de borda" como **saída**, não como falha |
| 5 | A régua tem "12 valores", 6 alcançáveis (do cerco e do parecer) | Os **12** são a elevação lateral unilateral no cabo, que tem a faixa prescrita mais larga do treino. `regua()` monta de `min(ref−4, fx[0]−1)` a `max(ref+5, fx[1]+2)`, o que dá **10 a 13 valores** nas 20 séries do Treino A — 10 em quinze delas. **O "6" é o que não muda**: é teto da geometria (54 px de botão, 6 de vão, 382 de tela), e independe do exercício. O que varia é quantos ficam escondidos: **4 a 7** (§1.1). A medida do parecer está certa; o invariante é mais forte do que ela |
| 6 | A chave da coleção de mudanças pendentes é "o dia mais o `sid`" (`09-frente1-lugares.md` §6.4) | A frente 0 a fez **`sid` sozinho** (`chaveDePromo(p) = 'promo:' + sid`), e o comentário do tipo diz por que é melhor: *"`day` é editável no meio do treino… uma chave composta faria a MESMA pergunta fundir como duas entradas se os dois aparelhos tivessem registrado letras diferentes para a mesma sessão. Ele responderia duas vezes."* **Vale a do código** (§9.2) |

**E duas coisas que eu fui conferir e bateram**, para a lista não ser só de
divergência: `scroll-snap-type: x proximity` e não `mandatory`, e **três**
`overflow-x: auto` (`.map`, `.also`, `.strip`), com um quarto `overflow-x` que é
`hidden` em `.scroll` (§1.2). A folha de pôr em dia **abre pré-marcada** e as
refeições futuras **ficam desabilitadas**, com o rótulo "por vir" (§4.3 e §4.4).
`ehLinhaDeTreino(r)` é `r.id === 'treino'` e as linhas de refeição têm as três
afordâncias com ou sem sessão (§2). Os **178** `<svg>` com **0** nomeados e os
**12** alvos abaixo de 44 px — 3 a 30, 9 a 36 (§8). O padrão interno de
**46 px** é token com razão escrita, `--ins-tap` em `src/tokens.css` (§8.2). E
`impactoDoMod` tem **uma** ramificação testada de quatro, com **um** chamador em
`src/` (§9.1).

**Três correções que eu faço a mim mesmo**, porque elas são do mesmo tipo das
seis de cima e seria desonesto listar só as dos outros:

1. **Eu ia pedir `overflow-x: clip` por causa da animação de `voa()`**, pelo
   defeito de `translateX(+N)` que a preferência do dono descreve. Fui conferir:
   o `.ghost` é `position: fixed` (`prototipo.html:304`), e elemento fixo não
   contribui para o transbordo rolável. **O defeito não é este caso.** Virou
   requisito de vigilância, e no caminho eu achei a coisa que importava: as duas
   cascas são incompatíveis — o protótipo rola por dentro com
   `body { overflow: hidden }`, e o `body` do app é proibido de ter isso, com
   caso e razão escrita (§1.3, R7).
2. **Eu ia escrever que `.map` são vinte alvos de 30 px**, um ponto por série.
   Fui conferir: é **um** botão de largura cheia, com rótulo que carrega o
   número (`:577`). O defeito dele é de altura e de leitura, não de alcance, e
   os pontos são decorativos (§8.2, item 2).
3. **Eu ia escrever que, quando "última" e "agora" caem no mesmo botão, a
   palavra que ganha é "agora".** Fui ler o ternário: ganha **`marca`**, isto é
   "última" — enquanto a **pintura** que ganha é a de "agora", porque `.rep.now`
   vem depois no CSS. O botão fica pintado de uma coisa e rotulado de outra, e é
   o caso **mais comum** da régua (§5.2, item 2).

**E a nota sobre o método**, porque é o tipo de coisa que passa: eu escrevi
"**conta**" em todo lugar onde calculei geometria em vez de medir. A
conta reproduziu **três** medidas independentes que outros fizeram — os 714 px
de C3, os 49 × 64 px dos botões de C, e a captura de C1 com o 10 fora da tela —
e é por isso que eu confio nela para estender ao que ninguém mediu (a régua do
peso, o `.cellb`, a 320 px). **Mas ela não substitui dedo em vidro**, e nenhum
número de §1.5 pode ser preenchido por cálculo.

---

## 12 · O que esta frente não decide, o que sobe à mesa dele, e o que ninguém mediu

**O que ela não decide**, por mandato: os cinco lugares e o fluxo entre eles
(frente 1), as palavras — inclusive os rótulos que eu citei como exemplo, que são
ilustração e não proposta de voz (frente 3), e os tokens, a escala, a cor e o
movimento (frente 4). Onde eu disse "46 px" e "3:1", eu citei padrão existente e
critério de norma, não escolhi valor novo.

**O que sobe à mesa do dono — e as cinco linhas estão RESPONDIDAS desde 06/10.
Esta mesa fechou:**

| o que | onde | por quê subia | o que ele decidiu |
|---|---|---|---|
| **As cinco mudanças de regra da folha de pôr em dia** | §4.7 | a folha muda regra, e cada uma das cinco nasceu de uma diferença entre o desenho e o que o dado permite ou a decisão dele manda | **três aceitas, duas derrubadas** (decisões 1 a 5). A tabela está em §4.7 |
| **O que fazer se a régua reprovar a medição A** | §1.6 | a alternativa medida como melhor é o controle que ele recusou; a troca é dele, não minha | **pré-autorizou os botões fixos da C** (decisão 9) — condicional, e **a medição ainda não aconteceu** |
| **O deload: lugar e comportamento** | §7.7 | é o achado 3 da frente 1 (muda regra, com razão escrita no fonte contra), mais a pergunta nova: desligar no meio da sessão devolve as séries? | **muda de lugar** (decisão 6, mantida na noite sabendo que o lugar era o freio) e **devolve as séries, com o registrado ficando** (decisão 7) |
| **Por quanto tempo o desfazer do vencimento continua oferecido** | §9.3 | a decisão dele diz "desfazível" e não diz até quando; a coleção tem teto de 60 | **até a próxima sessão daquele treino** (decisão 8) — em treinos, sem campo novo |
| **Se o bloqueio de zoom pode ser revisto** | §8.5 | depende do resultado do protocolo de 200%, e o argumento que o sustenta é dele e está escrito no fonte | **mantém, e não depende de medição** (decisão 11). **Mas ele mediu que a pinça FUNCIONA no PWA instalado**, então ali a declaração não faz efeito |

**O que fica para depois, declarado:**

- **A folha de pôr em dia é a única superfície desta frente que tem desenho de
  verdade para conferir.** O protótipo a montou inteira. A régua consertada, o
  `.cellb` com alvo, os três estados que faltam e o teclado com teclado físico
  **não têm pixel**, e esta frente é texto.
- **Dias não tem desenho** (achado 6 da frente 1) e é onde a folha mora. Eu
  especifiquei a folha; a tela que a abre não existe.
- **O destrutivo** segue sem desenho (achado 8 da frente 1). A folha de pôr em
  dia **não** oferece apagar, e isso não é escolha minha: `poeComidaNoDia` não
  faz isso (§4.1, limite 2).
- **O mapa da sessão** (`.map`, 30 px, com `overflow-x: auto`) tem o mesmo
  defeito da régua, em miniatura, e eu só o nomeei (§8.2). Vinte pontos numa
  faixa de 382 px é a mesma conta.
- **Os quatro gestos com função que a D propôs** — a cortina, o clarão, o anel,
  o toque que afunda — são da frente 4, como seção de sistema visual. Eu só
  especifiquei o que o movimento **não** pode fazer: piscar o fixo (§1.3, R7) e
  rodar com "reduzir movimento" ligado (§6.2, T4).

**O que ninguém mediu, e esta frente herda sem inventar número:**

- **A taxa de toque engolido como arrasto.** É a pergunta central de §1, e exige
  aparelho e dedo. Protocolo em §1.5, medição A.
- **A régua do peso**, em nada: nem alcance, nem engolimento. Conta em §1.4,
  protocolo em §1.5, medição D.
- **O alvo de `.cellb`** (cerca de 22 px por conta) nunca foi medido por
  ninguém, porque nasceu depois da auditoria de acesso (§5.1).
- **Quantos alvos reprovam o padrão interno de 46 px.** C3 contou contra 44 e
  achou 12. Contra 46, eu achei **sete classes** de controle a exatamente 44, e
  **não contei instâncias** (§8.2).
- **320 px de largura.** Protocolo em §8.4. E a pergunta que o protocolo tem de
  distinguir — cortado ou rolável — é consequência do `overflow-x: clip` do
  `body`, e também não foi medida.
  **RECONCILIADO em 06/10: 320 px deixou de ser alvo** — o alvo é 414, e 320 fica
  declarado fora, com a invariante de que nada tem largura fixa maior que a tela
  e a página nunca rola na horizontal. Continua **não medido**, e agora isso é
  escolha e não dívida.
- **200% de texto.** Protocolo em §8.5. E o achado que muda a pergunta: está
  bloqueado em **três** camadas de propósito, e a tipografia é toda em `px`
  (`rem` aparece **zero** vezes nas cinco folhas), então nem o ajuste de texto
  do sistema a alcançaria.
  **RECONCILIADO em 06/10, em dois pontos:** o teto decidido é **125%** (decisão
  10), com 1.4.4 declarado não cumprido — então 200% virou passada
  **informativa** (G4 da frente 4) e não portão; e **"bloqueado em três camadas"
  é falso onde ele usa o app** — medido em 06/10, no PWA instalado **a pinça
  funciona**. As três camadas são declaração; o efeito, ali, não acontece.
- **A seta de saída da sessão.** Conta em §10.1 (92% da diagonal da tela do
  pivô do polegar), protocolo na medição E. Alcance de polegar depende da mão, e
  eu não tenho a mão dele.
- **A frequência de uso no notebook.** O dono disse "bastante" (P8, P11); o
  parecer registra que ninguém contou. É o que daria peso ao T1 de §6.2 — e o
  requisito se justifica sem ela, porque não há razão para o teclado próprio
  recusar o teclado físico.
- **A frequência com que ele corrige uma série de semanas atrás.** Declarada
  pela frente 1, e é o que daria peso à dependência de §10.2.
- **Se o aviso do vencimento aparecendo uma vez basta** para ele decidir antes
  do prazo. O protótipo testou impressão em três minutos, não hábito ao longo de
  semanas. **Hipótese, não fato** — e vale para tudo que eu escrevi a partir do
  protótipo.
- **A taxa de toque errado com a mão suada**, em qualquer controle. O parecer já
  a declarou não medida, e ela pesa nas decisões 5 e 6. A medição A a mede **só
  para a régua**.
- **VoiceOver no iOS de verdade.** C3 mediu a árvore em Chromium. Todos os
  requisitos de anúncio deste documento (§1.3 R6, §6.2 T2, §8.3) foram escritos
  contra a norma e contra a medida de Chromium, **não** contra o leitor que o
  dono usaria.

---

## 13 · Reconciliação com as decisões de 06/10

Este documento foi escrito em 05/10. As 23 decisões do dono vieram em **06/10**,
e a autoridade sobre elas é a ONDA 5 de `docs/redesign/00-coordenacao.md`, que
**não** é editada aqui. Esta seção diz o que foi alinhado, contra qual decisão, e
o que continua sem resposta.

### 13.1 · O que foi alinhado

| o que mudou aqui | contra qual decisão / medição | onde | sentido |
|---|---|---|---|
| **A última refeição CONTINUA pré-marcada**; o requisito oposto desta frente cai | decisão 5 | §4.4, item 2 | **derrubada** |
| **A metade dos 30 minutos cai por implicação** — não é pergunta aberta | consequência da decisão 5, registrada pelo coordenador | §4.4, item 2 | **derrubada** |
| **"Não sei" vale por REFEIÇÃO**, pesa 0, **não sai do denominador**, e o dia continua contando | decisão 2 + a aritmética delegada ao coordenador, já implementada em `6e8a3fa` | §4.6, item 2 | **derrubada** |
| **O quinto botão "Não comi" entra** | decisão 1 | §4.6, item 1 | aceita |
| **Porção acima de 1 alcança o dia passado**, com os cinco valores | decisão 3 | §4.6, item 3 | aceita |
| **A pergunta do "fora do plano" deixa de bloquear** — e tirar o bloqueio não infla conta nenhuma, porque "plano" contra "fora" não alimenta cálculo | decisão 4 + a verificação do coordenador em `calculo.ts` | §4.6, item 4 | aceita, com a última frase do requisito corrigida |
| **A régua: se a medição A reprovar, vai para os botões fixos da C — pré-autorizado, e a medição ainda não aconteceu** | decisão 9 | §1.6 | aceita como condicional |
| **O deload muda de lugar** (um lugar, não dois) e **desligar no meio devolve as séries** | decisões 6 e 7, mais a confirmação da noite | §7.7 | decidida |
| **O desfazer do vencimento vale até a próxima sessão daquele treino** | decisão 8 | §9.3 | aceita, e é a forma que esta frente previu |
| **320 px não é alvo; 414 é** | decisão 15 + a delegação da noite (pergunta 8) | §8.4, §12 | decidida |
| **O teto do texto é 125%**, com 1.4.4 declarado não cumprido | decisão 10 | §8.5, §12 | decidida |
| **O bloqueio de pinça fica** — e **a pinça funciona no PWA instalado**, medido | decisão 11 + a medição da noite (pergunta 7) | §8.5, §12 | decidida, com a premissa desta seção desmentida |
| **Os três valores de `como` são dado e ainda não são tela** | medição do coordenador: nenhum chamador de `marcaRefeicao` passa `como` | §4.6, item 1 | fato novo |

**Uma correção de número que eu faço aqui, contra o registro:** `00-coordenacao.md`
diz que a frente 3 *"mediu"* que "Prescrição" *"já transborda"* a fatia da aba a
320 px. **Ela não mediu e não transborda** — §1.6 dela diz *"Isto é conta, não
medida"* e o valor é **63,8 pt calculados numa fatia de 64 pt**, na borda. A
conclusão (320 fora) não depende disso. Detalhe em §8.4.

### 13.2 · O que esta reconciliação NÃO resolve

- **A medição A não aconteceu.** É a pergunta central de §1, exige o aparelho e o
  dedo dele, de pé, na academia, com a mão suada, e **nenhuma conta a
  substitui**. A decisão 9 só diz o que fazer com o resultado. Enquanto isso, os
  sete requisitos de §1.3 são o trabalho.
- **Nenhuma das medições deste documento foi executada** — A, B, C, D, E, nem o
  protocolo de 320 px, nem o de 200%. As decisões de 06/10 mudaram o **destino**
  de alguns resultados, não o fato de que ninguém mediu.
- **Onde a folha oferece o "não sei" DO DIA, e como ele se distingue do "não sei"
  da refeição.** Os dois existem no dado e querem dizer coisas diferentes
  ("não sei o que foi este almoço" contra "não sei o que foi este dia"); só o
  segundo derruba o dia. **Ninguém especificou se a folha oferece os dois, nem
  com que palavras.** Isto é especificação que falta, e eu não a invento.
- **Onde se lê "deload ligado" fora da sessão.** A decisão 6 moveu o
  interruptor para o menu `···` da sessão; o fonte dizia que o estado *"já
  aparece no TREINO quando ligado"*, e com a aba de treino virando modo isso
  **continua sem endereço**. Falta especificação.
- **O checklist do contrato de UX vigente continua pedindo 320 px.** A decisão o
  contraria, e ninguém reescreveu o contrato.
- **Se a frase de sugestão declarada segura o engano** que o requisito derrubado
  de §4.4 segurava — a folha aberta às 22h sugerindo que a ceia foi tomada.
  **Ninguém mediu**, e é leitura em uso.
- **A invariante que sobrou da decisão de 320 px só está metade testada.**
  "A página nunca rola na horizontal" está sob asserção como **declaração**
  (`overflow-x: clip` no `body`); **"nada com largura fixa maior que a tela" não
  tem caso nenhum** nos 38 de `estilo.test.ts`. O caso que falta é da frente 4, e
  ela não o tem na lista dos treze.
