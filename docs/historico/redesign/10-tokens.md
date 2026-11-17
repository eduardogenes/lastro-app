# 10 · Os tokens — a primeira peça construída

**A reescrita começou aqui.** Depois de quatro ondas de design em quarto limpo,
cinco frentes de especificação e uma rede de mil e cem testes construída de
propósito, esta é a primeira linha de código novo.

Ela vem antes de qualquer tela porque **os tokens são o substrato em que toda
tela é desenhada** — tela construída antes deles é tela construída duas vezes.

## Procedência deste documento

**O agente que escreveu o CSS foi interrompido** quando a sessão anterior
terminou: ele deixou os seis arquivos de folha e o `index.html` modificados,
**sem nenhum commit** e sem este documento. Nada se perdeu — o diff foi salvo
antes de qualquer coisa ser tocada, e o trabalho estava coerente.

**O que eu fiz, e está marcado como meu:** salvei o diff, medi a suíte contra
ele, julguei a substância, atualizei as três guardas de paleta, provei que elas
sabem ficar vermelhas, e escrevi este documento. **O CSS é dele; o resto é meu.**

## O estado em que o trabalho interrompido foi encontrado

**Exatamente dois casos vermelhos, e eram dois dos três que o briefing nomeou
como "vão quebrar de propósito".** 1.105 de 1.107 passando.

Isso diz duas coisas. Primeiro, que **ele respeitou o escopo**: os 294 casos de
fluxo que dependem de tela continuaram verdes, porque a peça era CSS e token, não
estrutura. Segundo, que **o terceiro caso que eu nomeei ficou verde** — a guarda
contra a paleta antiga voltar —, o que significa que a paleta nova não
reintroduziu cor velha por descuido em nenhum canto.

## O que mudou, e o que cada decisão custou

**Três dos seis inegociáveis caíram**, pela decisão 12 do dono, com a nota
literal **"sem herancas"**. O cabeçalho de `tokens.css` registra cada queda com
um marcador `(CAIU: …)` — **o argumento derrubado fica visível, não apagado.**

| caiu | o que ficou no lugar |
|---|---|
| **Raio zero** | Seis degraus nomeados, e o degrau diz o que a coisa é: 4 marca, 8 valor, 14 controle, 20 bloco, 26 a folha, pílula o chip. `50%` segue literal onde é círculo. **Raio solto no meio das regras não entra** — nasce nomeado, como cor. |
| **Número em mono, prosa em display** | Uma família só, e **o dígito tabular no lugar da monoespaçada** — é `tabular-nums` que faz o número não dançar na coluna enquanto conta. A mono sobrevive para **uma** coisa: o quadro do box transcrito, onde o monoespaçado é o conteúdo. |
| **Rótulo mono em caixa alta é estrutura** | **Esta é a que deu trabalho de verdade.** O rótulo mono *era* a estrutura: era a forma da letra que dizia o que era rótulo, sem precisar ler. No lugar, a hierarquia passa a ser carregada pela **palavra e pelo tamanho** — 15px, peso 600, caixa de frase, frase nominal com artigo. E a armadilha ficou nomeada na própria folha: **nunca caixa alta com tracking, que é o rótulo mono sem a mono** — a herança entrando pela janela. |

**A paleta inverteu.** Saiu um conjunto escuro com acento ácido; entrou um de
**papel claro com acento azul-violeta**, e o escuro passou a ser o espelho dele
em vez da origem.

**E ele resolveu, no token, o problema de contraste que a frente 4 havia
medido:** a superfície de agrupamento difere da tela por **1,08:1** no claro,
então onde o preenchimento é o **único** canal de um controle ele vem com um fio
de 1,5px. O preenchimento deixou de ser o canal solitário.

**O terceiro sinal** passou a "pare", e a folha registra a consequência que a
frente 3 havia escrito: **o que distingue "falhou" de "vai destruir" é a palavra,
não a cor** — e só nove dos 23 avisos do app destroem dado que não se reconstrói.

## A quarentena, e por que ela é a melhor parte

Um nome da paleta aposentada **sobreviveu de propósito**, e a razão não é de
design.

O caso *a marca de recorde não pinta ácido sobre ácido* afirma
`color: var(--ins-acid)` **literalmente** — e esse caso **não era um dos três
que a passada podia mudar**. Em vez de violar o limite ou de quebrar o caso em
silêncio, ele pôs o nome numa seção chamada **QUARENTENA**, com um consumidor
só, apontando para o acento novo, e **nomeou a dívida**: quando a tela cheia do
histórico for reescrita, aquele caso muda de seletor e o nome entra na lista de
proibidos com os outros.

**É o comportamento certo diante de um limite:** achou a colisão, resolveu sem
atravessar a linha, e deixou escrito onde a dívida vence.

## As três guardas, atualizadas — e duas ficaram mais fortes

Os três casos que mudaram de assunto são **exatamente os três** que a decisão do
dono muda. Nenhum outro caso existente foi tocado.

1. **`estilo.test.ts` :: a paleta do Instrumento está inteira e mora nos
   tokens** — e **ficou mais forte**: a paleta nova vive nos **dois temas**,
   então cada nome é cobrado nos dois valores. Antes, um nome definido só num
   tema passava; agora não passa.
2. **`telas.test.js` :: paleta e tom preservados** — os hexadecimais novos, dos
   dois temas, conferidos no build.
3. **`estilo.test.ts` :: a paleta antiga não existe mais, nem por apelido** —
   **cresceu em vez de sumir.** Era a guarda contra a paleta pré-Instrumento
   voltar; passou a vigiar **as duas paletas mortas**, com os 24 nomes
   aposentados do Instrumento acrescentados e `ins-acid` excetuado em
   quarentena, com a razão escrita dentro do caso. **Apagá-la seria jogar fora a
   única guarda nomeada contra a cor velha reaparecer num canto.**

### A prova: as guardas sabem ficar vermelhas

Duas quebras deliberadas, aplicadas juntas e devolvidas depois: **mudar um
hexadecimal do claro** e **ressuscitar um nome aposentado** numa regra.

**Quatro casos ficaram vermelhos, não dois:**

- *paleta e tom preservados* — pelo hexadecimal.
- *a paleta do Instrumento está inteira* — pelo hexadecimal, **nomeando a metade
  clara**, o que prova que a cobrança nos dois temas funciona.
- *a paleta antiga não existe mais* — pelo nome ressuscitado.
- *toda custom property usada tem dono* — **também** pelo nome ressuscitado.

**O nome aposentado foi pego por duas guardas independentes**, e isso vale
registrar: a que eu cresci dá uma falha **nomeada** ("nome da paleta antiga ainda
em uso"), e a de órfãs dá uma genérica. A primeira diz **o que** está errado; a
segunda só diz que algo está. **Não é redundância — é a diferença entre um
vermelho que se entende e um que se investiga.**

## O que não foi medido

- **Nada em aparelho de verdade.** Todo este trabalho é CSS lido por teste de
  domínio e por um build em jsdom. **Nenhum olho viu nenhuma destas cores numa
  tela.** A primeira medição de contraste do escuro nas telas novas segue sem
  acontecer, como a frente 4 já declarava.
- **A divisão por peça se perdeu com a interrupção.** O agente planejou um commit
  por peça — tokens, escala, alvo e foco, sinal, movimento — e a sessão terminou
  antes. Entrou como um commit só, e está dito.
- **As quatro notas de mobile do projeto** (`svh` com a cadeia de ancestrais
  alinhada, `sticky` morrendo com `overflow` no ancestral, `backdrop-filter` que
  pisca no Blink e não no WebKit, `translateX` positivo) **não foram violadas** —
  os casos que as cobram estão verdes. Mas verde em jsdom não é olho em tela.

---

## 11 · O anel de foco — a segunda peça, e uma dívida que a rede não via

**Feita pelo coordenador em 11/10.** Os tokens de foco entraram na passada
anterior **com zero consumidores**: estavam definidos, com a razão escrita, e
nenhuma regra os usava.

### A dívida, e por que ela era pior do que parecia

**Zero regras de `:focus-visible` para `button`, `a`, `[role]` ou
`[tabindex]`** — em folha nenhuma. Todo botão do app dependia do anel padrão do
navegador, **num canvas quase preto**, onde ele tem menos chance de aparecer.

O contrato de UX manda o contrário: *"foco sempre visível, e nunca escondido
atrás de sticky"*.

**E nenhum dos 38 casos de CSS dizia uma palavra sobre isso.** É essa a parte que
importa: a dívida era invisível **para a rede**, não só para o olho. Não havia
como ela ficar vermelha, então não havia como alguém descobri-la sem ir olhar.

**Os campos já estavam cobertos** e ficaram fora da regra nova, de propósito:
eles perdem o `outline` e ganham **borda de acento**, que é sinal no lugar onde o
olho já está.

### O caso cobra três coisas, e a terceira é a que se perde primeiro

1. **A regra existe e alcança os quatro tipos de controle.**
2. **A cor vem do token, não de um literal** — senão o anel não segue o tema, e
   no escuro um anel escuro sobre fundo escuro é o mesmo que nenhum.
3. **Há folga entre o anel e o botão.** Num botão preenchido de acento, um anel
   de acento **encostado** no preenchimento é invisível; com a folga, o que
   aparece entre os dois é a **página**, e página contra acento mede 6,16:1 nos
   dois lados. **Sem ela o anel desaparece justamente no botão mais importante
   da tela.**

### A prova: duas quebras, e a segunda diz qual controle perdeu o anel

| quebra | o que ficou vermelho |
|---|---|
| **A folga removida** | A primeira asserção, com a mensagem explicando por que a folga carrega peso. |
| **`button` fora da lista de seletores** | A segunda, **nomeando `button`** — o caso não só detecta, diz **qual** controle passou a depender do navegador. |

Fonte restaurado e conferido limpo nas duas. **1.108 passando.**

### O que não foi medido

**O anel não foi visto.** A largura de 3px, a folga de 2px e os contrastes de
6,16 a 8,15:1 vêm da especificação da frente 4 e da aritmética — **nenhum olho
viu este anel em tela nenhuma**, e em particular ninguém verificou a parte do
contrato que diz *"nunca escondido atrás de sticky"*: `outline` não é cortado por
`overflow` a menos que um ancestral corte, e **isso não foi medido.**

---

## 12 · As palavras do aviso — a dívida que os tokens criaram

**Feita pelo coordenador em 11/10**, e ela existe por causa da peça anterior.

Quando os tokens entraram, **a cor do terceiro sinal mudou de "destrói dado"
para "pare"**, pela decisão 13. A partir daí a gravação que falhou e a ação que
vai destruir passaram a usar **a mesma moldura**, e o que as distingue é a
palavra. A frente 4 declarou o custo com estas palavras: *"quem olhar só a cor
não sabe se falhou ou se vai destruir."*

**A cor mudou e a palavra não tinha assumido.** Era uma lacuna que eu mesmo abri
ao embarcar os tokens, e ela durou um commit.

### De relance ninguém lê a frase inteira

Lê-se **a primeira palavra** e o botão. Cinco avisos não abriam pelo verbo:

| o que abria | o problema |
|---|---|
| *"Nenhuma série registrada neste treino. Descartar a sessão?"* | abre por um **fato**; o verbo chega na quinta palavra |
| *"Este exercício já tem série registrada hoje… Continuar?"* | abre por um fato **e** termina em "Continuar?", que a voz recusa porque não diz o que o toque faz |
| *`nomeEx(de) + ' está no programa há…'`* | abre pelo **nome do exercício**: de relance se sabe de quem se fala, não o que vai acontecer |
| *`'O treino ' + d + ' não existe…'`* | abre pelo nome do treino |
| *`oQue + '…'`* | abre por **variável**: o verbo estava legível na declaração, não no ponto do aviso |

Os cinco foram reescritos abrindo pelo infinitivo, com o resto depois.

### A regra virou caso, e é morfológica

**Infinitivo em português termina em `-ar`, `-er` ou `-ir`.** A guarda usa isso em
vez de uma lista de verbos autorizados, e **por isso se mantém sozinha**: um
verbo novo passa sem ninguém precisar atualizar o caso.

Mais a lista do que a voz recusa — *"Tem certeza"*, *"Continuar?"*, *"Atenção!"*,
*"Erro inesperado"*, *"Ops"*, *"Confirmar?"* — porque nenhuma delas diz o que
acontece ao tocar.

### Um erro meu de método, e a correção vale mais que o caso

A primeira versão do caso flagrou `oQue` e **estava errada**: ela checava a forma
sintática (abre com variável) em vez da propriedade (a primeira palavra é um
verbo). O `oQue` era montado por um ternário cujos dois braços abriam com
"Apagar" — **o código estava certo e o teste estava errado.**

Eu então fiz o teste **resolver uma indireção** para entender o código. Funcionou
e **joguei fora**: teste esperto o bastante para entender código esperto é o
caminho errado — ele passa a ter heurística, e heurística em teste é lugar onde
um defeito se esconde.

**O código mudou para abrir com literal**, e o verbo passou a ficar legível no
ponto onde o aviso é dado. A regra ficou de duas linhas.

### A prova

Devolvi um aviso a abrir por um fato: **vermelho, nomeando a frase ofensora.**
Fonte restaurado e conferido limpo. **1.109 passando.**

### O que não foi medido

Nenhum destes avisos foi **visto**. O `confirm()` do sistema não recebe a moldura
do produto — então a frase é tudo que existe ali, e é exatamente por isso que a
primeira palavra carrega tanto. **A família "falhou" — a do painel de gravação
que não deu — não foi escrita nesta passada:** ela não vive em `confirm()`, e
entra com os sete estados ruins.

---

## 13 · Duas guardas de acesso, e uma dívida que ninguém tinha medido aqui

**Feitas pelo coordenador em 11/10.** Nenhuma muda comportamento: as duas
transformam em regra cobrada o que estava só em documento.

### 13.1 · O nome acessível sai de um cartão para o app inteiro

Havia guarda — `serie.test.js` :: *todo controle do cartão de exercício tem nome
acessível* — e ela cobria **um cartão**. Um `···` ou um `×` novo em qualquer
outra tela nasceria sem nome, e quem usa leitor de tela ouviria **"botão"** e
nada mais.

Os três botões de símbolo que existem hoje **já têm** `aria-label`, então o caso
nasceu verde. **E por isso eu o provei antes de commitar** — guarda verde de
nascença é exatamente o que este projeto passou a semana exigindo que se prove.
Tirando o rótulo de um deles, o vermelho mostra **o símbolo e os atributos**, o
que basta para achar o botão.

### 13.2 · O alvo pequeno estende a área, ou entra na dívida nomeada

O padrão interno é **46px para controle repetido**, e `--ins-tap-dense: 28px` é
**desenho e não alvo**: quem usa o degrau pequeno **estende a área** por
`::after` até 44 no mínimo.

**Medido em 11/10, e ninguém tinha medido isto aqui:** a auditoria de acesso
mediu os **HTML desenhados**, não o app. No app:

| | |
|---|---:|
| Controles pequenos que **estendem** a área | **6** |
| Controles pequenos que **não** estendem | **11** |

Os onze estão entre **32 e 44px**, sem extensão — abaixo do padrão interno e,
dez deles, abaixo do mínimo da norma.

**Não foram consertados às cegas, e a razão é que o conserto errado é pior que o
defeito.** Área estendida pode fazer controles vizinhos **roubarem o toque um do
outro**, e a adjacência **não se vê no CSS** — vê-se na tela, que ninguém abriu
ainda. Um alvo de 40px que funciona é melhor que um de 46 que rouba o toque do
vizinho.

Então a lista é **dívida nomeada, e só pode encolher**: um controle pequeno novo
sem extensão reprova na hora. Quando as telas forem reescritas e alguém puder
olhar a adjacência, os nomes saem.

**E há uma segunda asserção que cobra a exatidão da lista** — nome que já não
corresponde a um controle pequeno tem de sair dela. **Foi ela que pegou um erro
meu:** o meu padrão de detecção deixava quatro controles de fora, discordando da
própria lista que eu havia escrito a partir de outra medição. Lista de dívida que
não é exata é pior que nenhuma, porque passa a acobertar.

### O que não foi medido

**A adjacência dos onze.** É a única coisa que decide se eles podem crescer, e
ela depende de ver a tela. **E nada nesta seção foi visto** — as duas guardas
leem fonte, não pixel.

---

## 14 · O portão de movimento e o contraste — duas regras que passaram a ser cobradas

**Feitas pelo coordenador em 11/10.**

### 14.1 · O portão de movimento reduzido alcançava por nome

Ele desligava a animação do ponto ao vivo **pelo seletor dela**. Funcionava — e
**por coincidência**: há uma animação só no app. A próxima a nascer em qualquer
outro lugar ficaria rodando, e **ninguém notaria, porque quem pede movimento
reduzido não está aqui para reclamar.**

Agora alcança por `*, *::before, *::after` com `!important` — sem o `!important`
a regra do componente é mais específica e ganha, e o portão não faz nada.

**E `animation-duration` quase zero em vez de `animation: none`:** zerar a
animação deixa o elemento no **estado inicial**, e uma animação com `both` que
termina visível ficaria **invisível**. Pular para o último quadro respeita quem
pediu menos movimento **sem apagar conteúdo**. No pulso do ponto ao vivo, o
último quadro é opacidade 1 — o ponto fica visível e parado.

**O caso teve uma primeira versão que passava por acidente.** Ela perguntava se o
bloco tinha `*` em algum lugar **e** a palavra `animation` em outro — e havia
duas regras diferentes, nenhuma universal sobre animação. O que se cobra agora é
**a regra do `*` declarando animação**. É o mesmo erro da §12: checar a forma em
vez da propriedade.

### 14.2 · O contraste da paleta embarcada

A frente 4 mediu a paleta que **desenhou**. Nada garantia que a **embarcada**
atendesse, nem que continuasse atendendo quando alguém encostasse numa cor — e
encostar numa cor é a coisa mais fácil de fazer num sistema de design.

Os hexadecimais são lidos **da folha**, não transcritos no caso: transcrever
faria o caso testar a transcrição em vez do produto.

**Nove pares, nos dois temas, todos passam:**

| | claro | escuro |
|---|---:|---:|
| texto principal | 16,19:1 | 16,59:1 |
| prosa | 7,79:1 | 10,27:1 |
| texto de apoio | 5,62:1 | 7,68:1 |
| acento como texto | 8,79:1 | 9,78:1 |
| texto sobre acento | 7,88:1 | 7,23:1 |
| o painel de pare | 8,40:1 | 8,96:1 |
| o painel de atenção | 8,76:1 | 9,79:1 |
| **fio de controle** | **3,26:1** | 4,79:1 |
| anel de foco | 7,11:1 | 7,66:1 |

**O mais apertado ficou nomeado numa asserção própria**, porque é o que quebra
primeiro: o fio de controle no claro tem **0,26 de folga** sobre o mínimo. Se
subir, ótimo — a asserção pede que se atualize. Se descer, a de cima pega. Ela
existe para que a folga não desapareça sem ninguém notar.

**A prova, e o que ela revelou sobre as três guardas juntas.** Clareando o fio,
**três casos caem** — e eles dizem coisas diferentes. As duas guardas de paleta
dizem *"um valor mudou"*; a de contraste diz **"e a mudança custou 2,43:1 contra
um mínimo de 3"**. Não é redundância: é a diferença entre saber que algo mexeu e
saber o que isso cobrou.

### O que não foi medido

**Nada disto foi visto.** Contraste calculado é contraste contra um vidro limpo
num quarto neutro — a luz da academia, o sol, a luva e o magnésio não entram na
conta, e a auditoria de acesso já havia declarado isso.


---

## 15 · O dono olhou — a primeira confirmação visual

**11/10, palavras dele: "já abri e parece ok".**

Vale registrar pelo que é, e não por mais do que é. **O que isso confirma:** a
inversão da paleta — de um conjunto escuro com acento ácido para papel claro com
acento azul-violeta, atravessando seis folhas e mais de mil linhas de CSS — **não
quebrou o app visualmente.** Para uma mudança desse tamanho, feita inteira contra
teste em memória, isso é mais do que parece.

**O que isso NÃO confirma**, e segue na lista de não medido:

- o contraste na **luz da academia**, no sol, com luva e magnésio — a conta é
  contra um vidro limpo num quarto neutro;
- o **anel de foco**, que só aparece com teclado e não com o dedo;
- a **adjacência dos onze alvos pequenos**, que é o que decide se podem crescer;
- as cinco medições de alcance e de toque engolido;
- o app **instalado**, que é o único jeito como ele é usado de verdade.

Um olhar diz que nada está visivelmente quebrado. É um sinal real, e é diferente
de uma medida.
