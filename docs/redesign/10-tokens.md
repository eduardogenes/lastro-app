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
