# 05 · O caso do movimento

Agente 5. Um assunto só: o inegociável nº 6 (`DESIGN.md:34-35`, indexado como
D-11 e D-49) contra o item do backlog, "motion design em praticamente todo o
app, para dar mais fluidez às transições".

Ids de [`01-conformidade.md`](01-conformidade.md). História de
[`02-origem.md`](02-origem.md).

---

## A resposta, em três linhas

**O inegociável nº 6 muda de forma.** Não cai: nada no que medi diz que este app
quer mais movimento. Não fica como está: ele é falso no código (quatro
movimentos, D-11) e é falso **contra a própria fonte de onde foi copiado** — o
documento de handoff conta movimento duas vezes, em dois lugares, e o
`DESIGN.md` só trouxe um deles. A regra deve deixar de ser um censo e voltar a
ser o que era na origem: uma cláusula que diz **para que serve** movimento aqui,
e uma lista do que é **proibido por forma**.

---

## O achado: a regra foi cortada ao meio, e a metade cortada autoriza o terceiro movimento

O agente 2 achou que o handoff fechava a rule 6 com uma lista que o `DESIGN.md`
não trouxe. Confirmo, e acrescento a peça que falta.

**São duas cláusulas sobre movimento no documento de origem, não uma.**

1. `App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md:18`
   — non-negotiable 6, a que virou o nosso nº 6:

   > "**Almost no motion.** There are two animations in the whole product: the
   > live dot pulse (2.4s) and the tab indicator slide (220ms). **No entrance
   > animations, no fades, no skeletons that shimmer, no springy sheets.**"

2. `DESIGN_SYSTEM.md:140` — UX law 2, que o `DESIGN.md` nunca citou e que o
   contrato de UX também não trouxe:

   > "**Present tense, real clock.** A ticking countdown and a pulsing dot are
   > the only **ambient motion**; they exist to make the screen feel current."

A rule 6 conta **animations**: duas. A UX law 2 conta **ambient motion**: a
contagem regressiva e o ponto. São conjuntos diferentes, e a contagem regressiva
só aparece no segundo.

Isso reclassifica o terceiro movimento. A transição da barra do cronômetro
(`#tfill`, `transition: transform .25s linear`, `componentes.css:1399-1405`) não
é uma violação do Instrumento. É movimento ambiente, nomeado pelo Instrumento,
na cláusula que o resumo do `DESIGN.md` deixou para trás. O agente 2 já mostrou
que ela é mais velha que a regra — `7cd6418`, 2026-08-07, quatro dias antes do
handoff entrar — e que `estilo.test.ts:378-386` hoje **exige** que ela exista.
Some-se a isto: ela nunca contrariou a fonte.

**E ela não é enfeite: é interpolação.** `pintaTimer` roda a cada 250 ms
(`main.jsx:4223`, `setInterval(pintaTimer, 250)`) e escreve
`fill.style.transform = 'scaleX(restante/total)'` (`main.jsx:4265`). A duração da
transição é **250 ms, exatamente o intervalo entre duas amostras**. A transição
não anima uma mudança de estado: ela preenche o vão entre quatro amostras por
segundo de uma grandeza que é contínua no mundo. Sem ela a barra não fica
parada — fica escadinha, 4 degraus por segundo, que é mais movimento aparente e
não menos.

---

## 1 · O que movimento faria por este app, tela por tela

Movimento tem quatro funções que desenho estático não cobre. Listei as quatro e
fui ver quais o app já usa.

| função | quem faz hoje | falta? |
|---|---|---|
| interpolar grandeza contínua amostrada | `#tfill`, 250ms (`componentes.css:1404`) | não |
| dizer que a tela está viva agora | `ins-pulse`, 2,4s (`base.css:303-309`) | não |
| manter constância do objeto atravessando uma troca | indicador de aba, 220ms (`componentes.css:330-334`) | não |
| dizer de onde uma camada veio e para onde o fechar devolve | ninguém | **sim** |

**Só uma das quatro está vazia.** As outras três já estão ocupadas, e as duas
que estão escritas na regra são as duas que o app menos precisava — o ponto
pulsante e o indicador são exatamente os dois que vieram prontos do app de
nutrição sem nunca serem escolhidos aqui (agente 2, D-49: "chegaram prontos do
handoff e nunca foram escolhidos aqui").

Onde a função vazia dói, nominalmente:

**A folha de baixo, e só ela.** A folha empilha em três níveis — 50, 70, 80
(`editores.jsx:58, 159, 210`) —, e o limite de três tem razão escrita em
`folha.jsx:6-8`: *"Três é o limite porque na quarta ninguém sabe mais o que
fechar leva de volta para onde."* O sistema resolveu esse problema **proibindo a
quarta**, não mostrando as três. Hoje a folha aparece e some sem nada dizer sobre
a pilha, e o agente 1 mediu que a quarta é alcançável na interface por um caminho
real (D-37/U-25: refeição → `···` → trocar → cadastrar alimento novo). Uma folha
que sobe da borda de baixo e desce de volta ao fechar diz, sem texto, que aquilo
está **por cima** do que ficou, e a segunda subindo sobre a primeira mostra a
profundidade que a regra diz que se perde. É a única tela em que o movimento
carrega informação que o sistema hoje não tem como dar.

**O toast, com uma ressalva que é minha e não medi.** O toast é o único canal de
~70 mensagens (agente 1, D-04, `componentes.css:1340`), e dez erros saem por ele
longe do que os causou (U-48, `main.jsx:1027, 3342, 3366, 3374, 3379, 3382,
3388, 3816, 6519, 7085, 7102`). Ele aparece e some por `display: none` ↔ `block`
(`componentes.css:1341, 1343`), 3.600 ms (`main.jsx:3449`). O projeto **já pagou
um bug de toast que ninguém via**: `b1f4fad` (agente 2, U-35) registra que ele
nascia inteiro atrás do cronômetro e "simplesmente não aparecia". Esse caso era
oclusão e está consertado. Que o toast também seja perdido por *surgir sem
transição* na periferia do campo de visão é **hipótese minha, e não a medi** —
não há instrumento neste repositório que a meça. Registro como hipótese, não como
fato.

**Em nenhuma outra tela achei função que movimento cubra.** Não "não vale a
pena": não achei o que ele diria. HOJE, TREINO, COMIDA, DADOS e GUIA trocam
conteúdo de um estado completo para outro estado completo, sem ambiguidade de
origem — e a troca de aba já tem o único sinal direcional que ela precisa.

**"Ao trocar de aba, a transição diz qual direção você andou" já acontece.**
O indicador de 2px desliza `left` em 220 ms com `cubic-bezier(.2,.8,.2,1)`
(`componentes.css:330-334`, `tabbar.jsx:52-55`), e `left` é a posição do índice
da aba: o deslize é literalmente a direção em que você andou, na versão mais
barata que existe. Deslizar o conteúdo junto seria dizer duas vezes a mesma
coisa, e pela via mais cara. Rejeito o candidato mais óbvio do briefing, e a
razão técnica está no §3.

---

## 2 · Onde movimento atrapalha

### O caso mais forte: às 6h15 ele não está olhando para a tela

Movimento é um custo pago em atenção, e durante o treino a atenção não está no
aparelho. O app sabe disso e está construído em cima disso: o cronômetro
**segura a tela acesa** (`segurarTela()`, `main.jsx:4220`) e avisa por **som**
(`aviso()`, chamado em `main.jsx:4273-4275`), com a condição escrita de só tocar
se a tela estiver à vista. O telefone está no banco. Movimento não alcança quem
não está olhando; som alcança. Toda proposta de animar o fim do descanso morre
aqui, e não por gosto: por física do uso.

E onde ele **está** olhando — o cartão de exercício aberto, no intervalo entre
duas séries — existe precedente escrito contra, do próprio projeto:

> `main.jsx:3477-3478` — *"`instant` e não `smooth`: o sistema tem exatamente
> dois movimentos (§6 do DESIGN) e este não vira o terceiro. O cartão
> simplesmente já está lá."*

E o preço de um quadro já foi cobrado uma vez, com decisão registrada:
`MARCA.md:158`, sobre splash com o símbolo — *"Um frame a mais entre o toque e a
próxima série."* Foi recusado por isso. A mesma conta vale para abrir cartão,
expandir linha e trocar de aba durante a sessão.

### O caso que ninguém mais vai cobrir: "nunca comemora" não tem jurisdição sobre movimento

`DESIGN.md:12`, `MARCA.md:58` e `PRODUCT.md:53` proíbem comemorar. O handoff
proíbe junto: `DESIGN_SYSTEM.md:201`, "What NOT to bring — **No streaks, badges,
or congratulation states.**"

As três regras governam **string**. A tabela de voz da `MARCA.md:55-68` é uma
tabela de frases: o que o app diz e o que ele nunca diria. Nenhuma delas diz
nada sobre quadro, curva ou duração.

Isso abre uma porta que o texto não fecha: **uma barra que se enche com
elasticidade quando a última série registra é um congratulation state sem uma
palavra de português dentro.** Passaria por qualquer revisão de texto. O
inegociável nº 6, do jeito que está escrito hoje — uma contagem —, também não a
pega: bastaria que o total continuasse dois.

Isto é achado de **identidade**, não de regra: se movimento entrar no sistema, a
proibição de comemorar precisa passar a valer para movimento, e não só para
frase. Sem isso, a revisão abriria por quadro e curva o buraco que a `MARCA.md`
fechou para texto.

### Onde movimento **não** colide com o freio

O produto freia decisão (`PRODUCT.md`, `shouldUp()` devolvendo `false` voltando
de pausa). Freiar decisão e frear a tela são coisas diferentes: a folha que sobe
não atrasa nada, não adia número nenhum, não esconde dado. O freio do Lastro é
sobre **o que** a tela recomenda, não sobre quanto tempo ela leva para desenhar.
Confundir os dois seria usar a tese do produto como argumento de conveniência.

---

## 3 · O que custa

**Bateria e repaint.** O único ponto do app com custo de quadro já foi medido e
corrigido: a barra do cronômetro repinta 4× por segundo por até três minutos, e
`3ef9bb9` trocou `width` por `transform` por causa disso — `componentes.css:1399-1401`
("animar largura refaz o layout a cada quadro; a escala roda no compositor") e
`estilo.test.ts:377-386`, que hoje falha se alguém voltar a escrever largura.
Consequência para qualquer candidato: **só `transform` e `opacity`**. Nada que
anime `width`, `height`, `top` ou `margin`.

**`prefers-reduced-motion` é assimétrico neste repo, e isso é armadilha de
processo.** Os dois blocos existentes (`base.css:311-314` e
`componentes.css:1415`) matam `transition` com um curinga — `* { transition: none
!important; }` —, mas matam `animation` **só em `.ins-live-dot`**
(`base.css:312`). Ou seja: toda transição nova morre de graça e sem ninguém
lembrar; toda `@keyframes` nova **sobrevive em silêncio** e viola U-58 no dia em
que nascer. Regra prática: candidato deste sistema usa `transition`, nunca
`animation`. Se algum dia precisar de `animation`, o bloco tem que virar
`*, *::before, *::after { animation: none !important }`.

**Complexidade real, num caso.** O toast mora **fora da árvore do Preact**, em
`index.html:45`, e é ligado por classe em `main.jsx:3442-3450`. Ele é escondido
por `display: none`, que não transiciona. Animá-lo exige mexer no casco, não no
componente. Isso é custo de verdade e conta contra o candidato.

**Risco de plataforma.** O app é PWA em iOS Safari, aberto pelo ícone. As três
armadilhas do `~/.claude/CLAUDE.md` são todas de **Blink**, e as três se
manifestam no Chrome e no DevTools em modo celular sem se manifestar no iPhone
real. Na prática: "testei no celular e está ok" e "testei no DevTools" são dois
testes diferentes, e passar num não é passar no outro. Duas delas o repositório
já aprendeu sozinho — ver o §5.

---

## 4 · Os candidatos

Quatro, não cinco. Dois **regularizam o que já roda** (e portanto não custam um
quadro a mais); dois são novos, e o segundo deles eu marco como fraco.

Vocabulário: estendo o existente. `--ins-dur: 220ms` e
`--ins-ease: cubic-bezier(.2,.8,.2,1)` (`tokens.css:92-93`) são hoje usados por
**uma única regra** no projeto inteiro (`componentes.css:333`). Não abandono a
curva: ela não tem overshoot — os dois pontos de controle em y são .8 e 1, dentro
de [0,1] —, e portanto não produz nada "springy", que é o que a fonte proíbe pelo
nome. Não invento duração nova; onde 220 ms não serve, digo por quê.

### C1 · A barra do cronômetro — escrever o que já existe

- **Onde:** `#tfill`, `componentes.css:1399-1405`.
- **Duração e curva:** 250 ms `linear`, como hoje. Não é 220 ms de propósito:
  250 é o período de amostragem de `pintaTimer` (`main.jsx:4223`). Interpolação
  boa dura exatamente um intervalo — menos deixa vão parado, mais atrasa a
  barra em relação ao número. E `linear` porque tempo passa linear; uma curva
  com aceleração mentiria sobre a grandeza.
- **O que comunica:** a fração restante do descanso, de forma contínua, entre
  quatro amostras por segundo.
- **Sob `prefers-reduced-motion`:** morre hoje, por `componentes.css:1415`. **E
  isso merece uma segunda olhada que eu não consigo resolver aqui:** sem a
  transição a barra não para, vira escada de 4 degraus por segundo. Se a
  intenção de `reduce` é reduzir movimento percebido, a correção provável é
  baixar a taxa de amostragem em vez de matar a interpolação — mas isso é
  medição em aparelho, que não fiz. Registro como aberto.
- **Decisão que ele força:** hoje `estilo.test.ts:378-386` exige a transição e o
  `DESIGN.md` diz que ela não existe. Um dos dois está errado, e a fonte
  (`DESIGN_SYSTEM.md:140`) fica do lado do teste.

### C2 · A rolagem que atravessa — escrever o quarto, com o critério que falta

- **Onde:** `main.jsx:5595`, `levaAsSessoesDoDia`, `behavior: parado ? 'auto' : 'smooth'`.
- **Duração e curva:** as do sistema operacional. Não dá para escolher em
  `scrollIntoView`, e forçar um valor exigiria animar rolagem à mão, que é
  exatamente o tipo de código que o app não tem.
- **O que comunica:** que a lista moveu, e para onde. Este toque vem de uma
  célula do calendário com **duas** sessões, troca de aba, troca de mês e
  redesenha a lista inteira (`02077e3`, 2026-09-02): sem a rolagem, o dedo toca
  uma célula e o usuário aparece no meio de uma lista de mês, sem saber que a
  página andou.
- **Sob `prefers-reduced-motion`:** já cai para `'auto'` na própria linha
  (`main.jsx:5594`).
- **O critério que falta, e é o ponto:** o app tem hoje **duas rolagens com
  decisões opostas** e só uma delas registra a razão. `mostraExercicio`
  (`main.jsx:3481-3484`) usa `instant` porque o alvo **é o que você acabou de tocar**
  — já é o assunto, não há nada a apontar. `levaAsSessoesDoDia` usa `smooth`
  porque o alvo está numa lista que você não estava vendo. Isso é um critério
  honesto e não está escrito em lugar nenhum. Escrevê-lo vale mais do que
  contar movimentos.

### C3 · A folha que sobe

- **Onde:** `.ins-folha` (`componentes.css:267-276`). **Só ela** — ver o §5.
- **Duração e curva:** 220 ms, `var(--ins-ease)`, `transform: translateY(100%) → 0`.
  Sem `opacity` (seria fade, e fade a fonte proíbe pelo nome) e sem overshoot
  (seria springy, idem).
- **O que comunica:** que a folha está **por cima** do que ficou, e que o `×`,
  o véu e o Voltar devolvem para baixo — o modelo de camadas de U-01 e U-25 dito
  em forma em vez de em documento. Com duas folhas empilhadas, a segunda subindo
  sobre a primeira mostra a profundidade que `folha.jsx:6-8` diz que se perde na
  quarta.
- **Sob `prefers-reduced-motion`:** a folha simplesmente está lá, como hoje.
  Morre de graça, porque é `transition` e o curinga de `componentes.css:1415` a
  pega.
- **Custo, e é o ponto fraco:** o véu (`.ins-veu`, `rgba(6,8,6,.72)`,
  `componentes.css:265`) continuaria surgindo de uma vez enquanto a folha sobe.
  Fazer o véu acompanhar é um fade, que a fonte proíbe. Ou se aceita o véu
  batendo com a folha subindo — que é pior que os dois instantâneos —, ou se
  abre uma exceção nomeada para o véu. **Não tenho resposta boa para isto, e é
  honesto dizer que é o que pode derrubar o candidato.**
- **Onde ele toca as 6h15, e quanto:** só três arquivos usam `<Folha>`
  (`src/ui/folhas/editores.jsx`, `foto.jsx`, `refeicao.jsx`). Dois são de
  COMIDA. O terceiro, a foto do aparelho, **abre de dentro do cartão de
  exercício**, no meio da sessão (`main.jsx:4471`) — portanto C3 alcança,
  sim, o intervalo entre séries. O próprio comentário de `foto.jsx:3-10`
  limita a frequência: a dúvida de "qual aparelho" aparece no começo de um
  bloco, na volta de uma pausa ou quando entra um substituto, e não a cada
  série. São 220 ms numa folha rara, e não em toda série. Mesmo assim, é o
  único ponto em que um candidato novo encosta no treino.

### C4 · O surgimento do toast — fraco, e marcado como tal

- **Onde:** `#toast` (`componentes.css:1335-1343`, `index.html:45`), ligado em
  `main.jsx:3442-3450`.
- **Duração e curva:** 220 ms, `var(--ins-ease)`,
  `transform: translate(-50%, 6px) → translate(-50%, 0)`. O `-50%` é o
  centramento que já existe na regra e tem que ser preservado dentro do mesmo
  `transform`, senão ele é sobrescrito e o toast salta para a direita.
- **O que comunica:** que **acabou de acontecer**. Um elemento que só aparece
  não se distingue, na visão periférica, de um elemento que já estava lá.
- **Sob `prefers-reduced-motion`:** aparece direto, como hoje.
- **Por que é fraco, e eu não escondo:** (a) a premissa — que o toast é perdido
  por surgir sem transição — é **hipótese minha e não está medida**; o caso
  medido (`b1f4fad`) era oclusão, e está consertado; (b) exige trocar
  `display: none` por outro mecanismo no casco, fora do Preact; (c) é
  literalmente uma *entrance animation*, que a cláusula recuperada proíbe pelo
  nome. Se o relator cortar um candidato, corte este.

### O que eu rejeito, e por quê

| ideia | por que não |
|---|---|
| Deslizar o **conteúdo** ao trocar de aba | O indicador já diz a direção em 220 ms (`componentes.css:333`), e um `translateX` positivo cai na armadilha do §5.2 com quatro vítimas na tela. Custo alto para repetir uma informação que já está dada. |
| Animar a abertura do cartão de exercício | Precedente escrito contra, do projeto: `main.jsx:3477-3478`. É o momento de 6h15. |
| Animar altura na `LinhaExpansivel` | `height` refaz layout por quadro — a lição que `3ef9bb9` e `estilo.test.ts:377-386` já cobram. E o problema medido ali (U-32) é **o que** fica escondido, não como aparece. |
| Skeleton, shimmer, fade de entrada em lista | Proibidos pelo nome em `DESIGN_SYSTEM.md:18`. E U-46 mostra que o app quase não tem estado de carregando: o dado é local, não há espera a encenar. |
| Qualquer movimento no fim do descanso | Ele não está olhando. O canal é som (`main.jsx:4273-4275`), por decisão escrita. |
| Qualquer movimento que marque conquista | `DESIGN_SYSTEM.md:201`, `MARCA.md:58`, `PRODUCT.md:53`. Ver §2. |

---

## 5 · As armadilhas, nomeadas antes de alguém cair

As três do `~/.claude/CLAUDE.md`, mais uma que é deste repositório.

### 5.1 · `backdrop-filter` que pisca no Blink e não no WebKit

**Este repositório já aprendeu esta, duas vezes, e escreveu.**
`componentes.css:317` (tab bar): *"Sem backdrop-filter: pisca no Blink ao rolar e
o sistema não tem vidro."* `componentes.css:722` (topo de tela cheia): *"opaco: o
conteúdo passa POR BAIXO e precisa sumir, não borrar. Sem backdrop-filter, que
pisca no Blink ao rolar."* Os dois já usam fundo opaco, que é a correção que o
`CLAUDE.md` prescreve.

**Nenhum candidato meu introduz `backdrop-filter`**, e a folha que sobe (C3) é
o lugar onde a tentação vai aparecer — uma folha subindo sobre conteúdo pede
vidro. Não. O Instrumento não tem vidro por regra (inegociável 3, "nunca
sombra"), e o `CLAUDE.md` acrescenta o motivo de engenharia. Se alguém propuser
vidro na folha e testar no iPhone, vai parecer certo e vai piscar no Chrome.

Complemento que o `CLAUDE.md` dá e que vale registrar para C3: `will-change:
transform` vai no elemento **que anima** (a folha), nunca no ancestral do
elemento com blur — o que, aliás, é a mesma direção da armadilha 5.4.

### 5.2 · `translateX(+N)` e a barra de rolagem horizontal transitória

O sintoma do `CLAUDE.md`: animar um bloco com `translateX` **positivo** faz o
conteúdo transbordar pela direita, o navegador cria barra horizontal
transitória, a viewport reflui de largura e todo elemento fixo centrado pisca —
**assimétrico, só no sentido positivo**.

Este app é o cenário de laboratório dessa armadilha: **três elementos fixos
centrados por `left: 50%; transform: translateX(-50%)`** — `#toast`
(`componentes.css:1336`), `#timer` (`:1353`) e `.ins-faixa` (`:1367-1368`) —,
mais a tab bar fixa de ponta a ponta em `left: 0; right: 0` (`:311-312`), cuja
largura também reflui com a viewport. Uma transição de página com
`translateX(+N)` faria os quatro piscarem no Chrome e provavelmente não no
iPhone, que é exatamente o modo de falha que o `CLAUDE.md` diz que engana.

**A correção já está aplicada, por outro motivo:** `base.css:85` tem
`overflow-x: clip` no `body` — a correção exata que o `CLAUDE.md` prescreve,
escrita ali para segurar o sticky (§5.3) e cobrada por `estilo.test.ts:219-226`.
Não é sorte, mas também não é blindagem: ela cobre o transbordo, não o resto.

**Mesmo assim rejeito a transição de aba por `translateX`** — ver §4. Estar
protegido de uma armadilha não é motivo para andar na direção dela. E os dois
candidatos novos usam **translateY**, que transborda para baixo: o eixo que o
`CLAUDE.md` diz que não gera a barra.

### 5.3 · `overflow` de ancestral quebrando `position: sticky`

Também já aprendida e escrita aqui, com a distinção `clip` × `hidden` que o
`CLAUDE.md` faz: `base.css:83-85` (*"clip e não hidden: hidden vira `auto` no
outro eixo e quebra o sticky"*) e `componentes.css:712-714` (*"Trocar por
`hidden` reintroduz `auto` no outro eixo e derruba isto em silêncio"*), com o
caso concreto — o `‹ voltar` rolava para fora em quatro dos cinco destinos.
Cobrada por `estilo.test.ts:219-226` (U-61).

**Nenhum candidato meu acrescenta `overflow` a ancestral nenhum.** Para quem for
implementar C3: a folha já tem `overflow-y: auto` no próprio corpo
(`componentes.css:298`), que é o único lugar onde ele é o container de verdade —
e ela não tem sticky dentro.

### 5.4 · A armadilha que é deste repositório, e que mata a ideia de "transição de página"

Não está no `CLAUDE.md`. Está em `folha.jsx:126-129`:

> *"`position: fixed` sai da árvore visualmente de qualquer lugar — desde que
> **NENHUM ancestral tenha transform, filter ou perspective**, que criariam um
> bloco de contenção e prenderiam a folha dentro dele. O Instrumento não usa
> nenhum dos três, **e um teste cobra isso**."*

**Não achei esse teste.** Procurei `transform`, `filter`, `perspective`,
"ancestral" e "bloco de contenção" em todo `tests/`: o que existe é o teste do
sticky (`estilo.test.ts:219-226`, que cobra `overflow`, não `transform`) e o da
barra do cronômetro (`:377-386`). A garantia que o comentário anuncia não está
escrita em lugar nenhum que falhe.

O que a armadilha pega depende de **onde** o `transform` vai, e a casca foi
montada de um jeito que deixa isso nítido:

| `transform` em | prende no bloco de contenção | procedência |
|---|---|---|
| `main` | nada fixo hoje: `main` só contém a tela | `app.jsx:47-49` |
| `#app`, ou invólucro que abrace a casca | a folha (`.ins-folha-w`), a faixa da sessão e a tab bar | `app.jsx:51-60`; `componentes.css:264, 311-312, 1367` |
| `body` | tudo acima, mais o cronômetro e o toast — que moram fora do `#app` de propósito —, o `#deitado` e o `body::before` que devolve o fundo sob a barra de status | `index.html:45, 62-71`; `base.css:70-76, 334` |

Isto corrige a leitura literal do item de backlog ("motion em praticamente todo
o app"): **transição de tela, se um dia existir, só pode morar no `main`.** Um
nível acima, ela prende a folha, a faixa e a tab bar ao conteúdo que está
deslizando. E nada hoje impede alguém de subir esse nível, porque o teste
que devia impedir não existe.

Mesmo no `main`, rejeito a transição de tela pelos motivos do §4 — o indicador
já diz a direção, e o `translateX` a aproxima da armadilha do §5.2. Os
candidatos deste relatório são por isso **três elementos nomeados e uma
rolagem**, e nenhum deles põe `transform` em ancestral de nada que seja fixo.

---

## 6 · A regra candidata

Sem escrever no `DESIGN.md` — isto é matéria do agente 6. A forma que os fatos
sustentam:

**Movimento (inegociável 6).** Movimento aqui não decora e não comemora: ele só
faz três coisas — **interpolar** uma grandeza contínua amostrada, **dizer que a
tela está viva agora**, e **dizer de onde uma camada veio**. Fora disso, a tela
troca de estado sem transição.

**Proibido por forma**, recuperado de `DESIGN_SYSTEM.md:18`: nada de animação de
entrada em conteúdo, nada de fade, nada de esqueleto que cintila, nada de folha
com elasticidade. E acrescentado por este relatório: **nada que marque conquista**
— a proibição de comemorar (`MARCA.md:58`, `PRODUCT.md:53`) passa a valer para
quadro e curva, não só para frase.

**Vocabulário:** `--ins-dur: 220ms` com `--ins-ease: cubic-bezier(.2,.8,.2,1)`
para troca de estado; `linear` com duração igual ao período de amostragem para
interpolação; `2,4s` para o pulso ambiente. Só `transform` e `opacity`.
`transition`, nunca `animation`, enquanto o bloco de `prefers-reduced-motion`
matar transição por curinga e animação por seletor.

**O que sai:** a contagem. Ela quebrou duas vezes em um mês — uma por herança
mais velha que ela (`7cd6418`), outra por adição silenciosa (`02077e3`) — e nas
duas quem escreveu o código estava certo no mérito. Contagem que só produz
violações quando o código acerta não é regra: é inventário desatualizado.

---

## O que não consegui verificar

- **Se o toast é perdido por surgir sem transição.** É a premissa de C4 e não
  tem como ser medida neste repositório. Precisaria de teste com pessoa, em
  academia, com o aparelho na posição de uso.
- **Como a folha subindo se comporta no Safari de iPhone real.** Tudo que sei
  sobre Blink × WebKit aqui é o que o `CLAUDE.md` e os dois comentários de
  `componentes.css` registram. Nada foi rodado em aparelho.
- **Se matar a interpolação de `#tfill` sob `prefers-reduced-motion` ajuda ou
  atrapalha.** Levantei a dúvida em C1 e não a resolvo: depende de medir a
  escada de 4 degraus por segundo contra a barra contínua, com quem precisa da
  preferência.
