# 04 · Permanência — o caso de que as regras continuam servindo

Agente 4. Posição atribuída: construir o caso mais forte de que cada regra do
perímetro ainda ganha o lugar que ocupa. Os identificadores são os de
[`01-conformidade.md`](01-conformidade.md); a origem de cada regra é a de
[`02-origem.md`](02-origem.md).

## Como ler

Três veredictos, e o do meio é o que conta como silêncio:

| veredicto | o que quer dizer |
|---|---|
| **defesa** | tenho evidência de que a regra ainda paga o que custa, e ela está citada |
| **não tenho caso** | procurei o argumento de permanência e não achei. Uma linha, sem consolo |
| **não disputada** | a regra é fato verificável ou recusa de custo zero; não consegui construir o ataque que ela teria de responder |

A terceira existe para não enganar o relator. Se eu jogasse "o SVG do ícone é
byte a byte igual à arte aprovada" no mesmo balde de "não tenho caso", ele leria
como advogado que tentou e falhou, quando ninguém acusou nada. Onde uso
"não disputada", digo qual teria de ser a acusação.

Contagem final, por id: **101 defesas · 20 "não tenho caso" · 10 defesas
parciais (caso para metade da regra, silêncio para a outra) · 30 não
disputadas.** Total 161.

**101 não quer dizer 101 argumentos do mesmo peso, e não quero que seja lido
assim.** Vinte estão marcadas **(forte)** — são as que eu sustento contra
qualquer ataque, e é nelas que o caso da permanência se apoia. As outras 81
passam por uma régua mais baixa e explícita: a regra consertou um problema
nomeado e datado, a fonte está citada, e o problema continua verdadeiro hoje.
É defesa, mas é defesa por procedência, não por argumento novo.

**O que li.** Os três documentos do perímetro, `PRODUCT.md`, os dois relatórios
da onda 1, o handoff
`App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md`,
`src/tokens.css`, `src/base.css`, `src/componentes.css`, `src/treino.css`,
`src/protocolo.css`, `src/ui/instrumento/folha.jsx`,
`src/ui/instrumento/faixasessao.jsx`, trechos de `src/main.jsx`, e
`docs/ux-audit/05-navigation-behavior-matrix.md` e `06-final-review.md`.
**Não renderizei o app em navegador nenhum.** Toda medida de tamanho aqui é
valor declarado em CSS, e está marcada como tal.

---

# Parte 1 · O achado principal: a suspeita é sintoma de outra coisa

O briefing me dá um ângulo que é meu por direito: se o app parece duro, a causa
pode não estar em regra nenhuma. Achei essa explicação, e ela é mais forte que
qualquer defesa regra a regra deste documento.

**Tese: o app tem quatro pontos de aspereza, e os quatro são violações de regra
que já existe. Nenhum deles é falta de movimento, e três deles pioram com
movimento por cima.**

## 1.1 · A rolagem que teleporta — 11 sítios

O item do backlog pede "mais fluidez às transições". O que o app faz hoje, onze
vezes, é saltar ao topo sem transição nenhuma: `window.scrollTo(0, 0)` chamado
sem trocar de camada (U-15, violada). A lista está em `01-conformidade.md`;
conferi os sítios em `src/main.jsx:519, 870, 913, 2098, 2659, 3468, 6459, 6460,
6467, 6517, 6785`.

O caso que dói mais é `andaPose` (`main.jsx:6467`): os botões `‹ anterior` /
`próxima ›` ficam no meio da página (`protocolo.jsx:141-146`) e cada toque
manda a rolagem ao topo — o controle some de baixo do polegar entre um toque e
o seguinte.

Isto importa para a decisão que a revisão vai tomar: **animar um salto de
rolagem não o transforma em transição, transforma num salto animado.** O
projeto já sabe disso por escrito. `main.jsx:2945-2957` documenta o mesmo
defeito no calendário, com o diagnóstico inteiro: *"O `scrollTo(0,0)` era o
idioma repetido de 'algo mudou, redesenha' — certo para destino, errado aqui."*
A correção foi remover o salto, não suavizá-lo.

## 1.2 · Os 22 diálogos que o Instrumento não desenha

Contei na mão: `grep -c "confirm("` em `src/main.jsx` dá **19**, e
`grep -c "prompt("` dá **3**. Vinte e duas superfícies modais que o sistema
operacional desenha — tipografia do iOS, canto arredondado, sem a linha ácida
de 1px, sem área segura, sem a anatomia da folha — e que param o app inteiro.

É a coisa menos fluida que existe nesta interface, e é a mais fácil de confundir
com "o app é duro". Não há regra velha aqui: D-37 proíbe isto desde 2026-08-11,
e o handoff §3.8 já dizia "the only modal pattern".

## 1.3 · A hierarquia de texto perdeu um degrau — e os dois extremos incharam

Este é o achado que eu não esperava, e é o mais direto.

**A classe `.ins-t2` não existe em folha nenhuma do app.** Conferi:
`src/base.css:223-225` define `.ins-t3`, `.ins-t4` e `.ins-t5`, e nenhuma linha
de `base.css`, `componentes.css`, `treino.css` ou `protocolo.css` define
`.ins-t2`. Ela é usada **15 vezes** no JSX — entre elas
`guia.jsx:62` (o corpo das catorze regras do treinador),
`guia.jsx:103`, `dados.jsx:224`, `dados.jsx:260`, `dados.jsx:484` e
`retrospectiva.jsx:50`. As quinze saem no nível 1, `#F2F4EF`, o mesmo branco do
título.

O token existe e é usado direto em CSS 18 vezes, então o nível 2 não está morto.
O que está quebrado é o degrau **onde ele mais importa**: a prosa longa das duas
telas mais longas do app sai no branco máximo, empatada com os títulos que
deveria estar um passo abaixo.

Do outro lado da escala, D-16 mede 24 sítios de prosa nos níveis 4 e 5 — os dois
que o `DESIGN.md:70` reserva a rótulo, e o nível 5 foi medido em 3,22:1, que
reprova em AA (`2e3ef75`, números em `base.css:137-139`).

Somando: a prosa do app está ou no branco máximo ou perto do invisível, e o
degrau do meio — o que o `DESIGN.md:67` chama literalmente de "prosa em cartão"
— é o que está faltando. **Uma escala de cinco níveis rodando efetivamente em
três não é uma regra velha. É uma regra não aplicada, e o efeito dela é
exatamente o que alguém descreveria como "o app parece duro".**

Contexto, com a ressalva de que a contagem mistura rótulo com prosa e não
separa os dois: das 260 declarações de cor de texto nas quatro folhas do app,
75 são nível 4 e 60 são nível 5 — 52% do texto pintado nos dois níveis mais
apagados.

## 1.4 · Onde o dedo cai

Quatro alvos abaixo do que o próprio sistema escreveu, todos em controle que se
usa de pé:

- stepper de séries, **38 × 38** (`componentes.css:933`) — nomeado na regra
  D-29 como exemplo do que precisa de 46;
- os dois ajustes do cronômetro, **40 × 40** (`componentes.css:1413`), cujo
  próprio comentário diz que são "apertados no meio da série, de pé";
- `.cp-ajustar`, sem `padding` e com `font: 11px/1` (`protocolo.css:185-191`),
  ~11px de altura, renderizado duas vezes na comparação de fotos (U-54);
- o nome do exercício dentro da faixa da sessão, **12px**
  (`componentes.css:1377`), dentro de um botão que ocupa a largura da tela
  (D-23).

## 1.5 · E o rodapé cresceu

Valores declarados, não renderizados. Enquanto há sessão aberta, ficam fixos no
pé de **todas** as abas: a tab bar, `calc(52px + var(--sa-bottom))`
(`tokens.css:104`), e a faixa da sessão, `min-height: 46px`
(`componentes.css:1366`) — que na variante pergunta soma padding 10+10, gap 10,
rótulo de 9px/1.3, botões de `min-height: 40px` (`componentes.css:1386-1390`) e
dois fios de 1px, ou seja ~84px declarados. Com o descanso correndo entra ainda
o cronômetro, que `b1f4fad` registra em 76px.

A conta, supondo a área segura de 34px de um iPhone com indicador de home:
tab bar 86px + faixa-atalho ≥46px = **≥132px** fixos em qualquer aba com sessão
aberta; com a faixa-pergunta, ~170px; com o cronômetro por cima, ~246px. Numa
tela de 844px, isso vai de 16% a 29%. Não medi renderizado e não afirmo mais do
que a aritmética dos valores declarados permite. Mas é onde eu olharia antes de
olhar para qualquer regra.

## 1.6 · O precedente, e por que ele fecha o argumento

**Este projeto já percorreu este caminho uma vez, e a resposta não foi mudar
regra.**

`06-final-review.md:42-45`: *"Levantada depois, por relato de uso — a auditoria
original mediu largura, overflow, alvo e contraste, e não mediu altura. Foi um
buraco de método: as duas telas mais longas do app passaram batido porque cada
parte delas, isolada, estava certa."*

Guia tinha **6.945px, 8,2 telas**; Dados, **3.955px, 4,7 telas**
(`05-navigation-behavior-matrix.md:92-93`). O relato de uso era "parece grande".
O conserto foi `LinhaExpansivel` e `Chips` — componentes que já existiam — e as
duas abas caíram para 1,8/2,1 e 1,9/3,1 telas. **Nenhuma regra mudou.** O que
mudou foi que alguém mediu.

"Parece duro" está na mesma família de "parece grande". Merece a mesma resposta:
medir antes de reescrever.

## 1.7 · O contraexemplo que fecha: o componente mais novo do repositório

`src/ui/instrumento/faixasessao.jsx` entrou em `893e2c3` (2026-09-21), doze dias
depois de o contrato de UX ser escrito. É o pedaço de código mais recente do
perímetro. Ele faz duas coisas ao mesmo tempo:

**Obedece com precisão à regra mais nova do contrato.** U-35, a pilha do
rodapé, entrou em `b1f4fad` no dia 09-09. A faixa mede a própria altura num
`useLayoutEffect`, publica `--ins-faixa-h` na raiz e se posiciona lendo
`--ins-timer-h` — e o comentário de cabeçalho cita o motivo:
*"E escreve a própria altura em `--ins-faixa-h`, que o toast e o fim da página
leem pelo mesmo motivo — foi este bug que o cronômetro já causou uma vez."*
Uma regra de doze dias de idade foi cumprida à risca por quem nunca tinha visto
o bug, porque o bug veio anexado à regra.

**E quebra três regras do `DESIGN.md` de uma vez.** Prosa em mono a **9px**
(`componentes.css:1376`, `.ins-faixa-o`, carregando
*"Treino A sem série nova há 1h32."* — a string sai de `main.jsx:6757`); nome
tocável a **12px** (`:1377`); e ação fixa no rodapé convivendo com a tab bar
(U-34).

A diferença entre as regras que ele cumpriu e as que ele quebrou não é a idade.
É a forma: **a que veio com o problema do lado foi cumprida; as que vieram como
número solto foram quebradas.** Essa é a conclusão que eu gostaria que
sobrevivesse desta revisão, e ela é o oposto de "as regras envelheceram".

### Uma correção ao levantamento do agente 1

`.ins-faixa-o` a 9px carrega uma frase com verbo. O agente 1 a contou em D-04
(prosa em mono) e **não** a contou em D-21 (piso de 13px em prosa), cujo
veredito lista só duas regras a 12,5px. Pelo mesmo critério que ele usou em
D-04, D-21 tem uma terceira violação, e ela é a pior do app: 9px, quatro pontos
abaixo do piso. Isso não enfraquece D-21 — endurece.

---

# Parte 2 · Duas correções que mudam veredicto

## 2.1 · D-19 não é violação do código. É erro de digitação no documento

Conferi os três lugares:

- handoff, linha 67: `body-xs | display | 13 / 400 / 1.5`
- `src/base.css:194`: `.ins-body-xs { font: 400 13px/1.5 var(--ins-font-display); }`
- `DESIGN.md:91`: "body-xs | display | 13 / 400 / 1.4"

O código concorda com a fonte original. Só o `DESIGN.md` diverge, desde
`2e3ef75`. **O agente 1 mediu certo e o veredito "violada" aponta para o lado
errado**: quem está fora de linha é o resumo, não a folha de estilo.

A tabela de papéis também perdeu dois papéis que existem em código —
`label-sm` e `data` — e fechou em número fixo duas faixas que o handoff dava
como intervalo (`metric-l` 34–38, `metric-m` 22–26). D-19 não precisa ser
revisada. Precisa ser transcrita direito.

## 2.2 · Três regras "não mensuráveis" são mensuráveis no original

O agente 2 achou o fato estrutural: o `DESIGN.md` é resumo de um documento
anterior e mais completo, e onde ele resumiu perdeu o critério. Isto muda a
natureza de três veredictos de "não mensurável" — não são regras vagas, são
regras **truncadas**.

| id | o que o `DESIGN.md` diz | o que o handoff dizia | efeito de restaurar |
|---|---|---|---|
| D-04 | "Nunca misturar dentro de uma mesma string" | *"'250 g arroz' is mono only when it is data in a value column; in a prose sentence the whole sentence is display"* (handoff:14) | os 8 seletores de prosa em mono viram violação clara, e os 3 sítios de macro em display ganham o desempate |
| D-09 | "No máximo um elemento ácido por região" | *"At most one acid element **competing** per region **of the viewport**"* (handoff:16) | deixa de ser não mensurável. E o cartão-foco, que o agente 1 aponta com três elementos ácidos, **passa**: ponto, rótulo e chip não competem — são papéis diferentes em escalas diferentes. Sem "competing", a própria anatomia escrita do cartão (D-33) contradiz a regra |
| D-10 | "Rótulo mono em caixa alta é estrutura, nunca ênfase" | *"A 10px tracked label **always introduces a section or names a value**. It is never used for emphasis or flavour"* (handoff:17) | as 51 regras mono+caixa alta se separam sozinhas: rótulo que abre seção, rótulo que nomeia valor, e botão — que nomeia ação, terceiro caso que o handoff não previu e que é a única coisa a decidir |

**Nenhuma dessas três precisa envelhecer para ser consertada.** Precisam de uma
frase de volta. E a mesma coisa vale para D-11, que perdeu a metade operacional
— *"No entrance animations, no fades, no skeletons that shimmer, no springy
sheets"* (handoff:18) — e ficou só com a contagem.

## 2.3 · Uma rebatida ao argumento "foram escritas para um app de dieta"

O agente 2 registra, com razão, que a maioria das regras do `DESIGN.md` é
transcrição de um documento de outro app, e que julgá-las pelo contexto do
Lastro é julgá-las fora do lugar onde foram tomadas.

A primeira parte é fato. A segunda merece a ressalva que o próprio handoff dá,
na sua terceira linha: *"Version 1.0 · extracted from the Plano Nutricional app
· **authored for reuse in the training app**"*. E a §5 inteira,
"Merging with the training app", é escrita **para este app** — ela propõe as
cinco abas com os nomes de hoje (handoff:161), mapeia componente a componente o
que o treino reusaria (handoff:173-181) e lista o estado compartilhado.

Não é um sistema de dieta aplicado por acidente a um app de treino. É um sistema
que foi escrito prevendo esta fusão, por quem tinha os dois problemas na cabeça.
Isso não torna nenhuma regra verdadeira. Tira do argumento "veio de outro app" a
força de ser, sozinho, motivo para aposentar.

---

# Parte 3 · DESIGN.md, regra a regra

| id | veredicto | o caso, em uma linha |
|---|---|---|
| D-01 | defesa | `8156d26` nomeia o problema: seis variáveis usadas e nunca definidas em **31 regras**, e *"CSS não reclama de `var()` sem dono: a regra cai no valor herdado e a tela fica quase certa"*. As 2 violações são `rgba()`, que `estilo.test.ts` não vê porque procura hexadecimal. A regra serve; o teste é que é estreito |
| D-02 | defesa (identidade) | O escuro tem motivo de uso, não de gosto (`DESIGN.md:8`), e "nunca comemora" tem motivo aritmético — ver M-08 |
| D-03 | defesa | Cumprida integralmente; 11 `border-radius` e nenhum em caixa, botão ou campo. E foi **revisada uma vez**, em `508cbc6`, com a razão por extenso. Regra mantida não é regra congelada. Resíduo real: três comentários guardam listas de exceções diferentes (`tokens.css:8-9`, `componentes.css:1417`, `DESIGN.md:16-23`) — defeito de documentação |
| D-04 | defesa | Ver 2.2. E o maior violador é o toast: ~70 mensagens do app em 11,5px mono (`componentes.css:1340`), o que é prosa na fonte errada **e** perto do piso |
| D-05 | **não tenho caso** | "Genuinamente destacado" não é definido nem aqui nem no handoff, e 70 regras desenham borda de caixa |
| D-06 | defesa | Zero sombras projetadas em treze meses. A única licença aberta é a da bancada, e ela vem argumentada (`DESIGN.md:165`). `PRODUCT.md:65` a repete como anti-referência. Os 4 `box-shadow` são `inset` sem desfoque: fio por outra propriedade |
| D-07 | defesa | Não é estaticamente medível, mas **decidiu dois casos por escrito**, que é o teste de uma regra viva: `treino.css:151` (*"um fundo alternado seria exatamente isso"*) e `DESIGN.md:41-47` via `508cbc6` |
| D-08 | defesa (forte) | Coral e âmbar conferem 100%. Os 7 escapes do ácido são todos a mesma coisa — comparação favorável. Conferi quatro: `main.jsx:4953` (`t.subindo`), `5159` (`dif > 0`), `5808` (`x.bom`), `6048` (`x.dv` no sentido bom, conforme `x.ritmo`). Isso é o app dizendo "você foi bem" por cor, que é a forma mais silenciosa de comemorar e o único canal que as regras de voz não cobrem. **A regra é a única coisa que torna essa deriva visível** |
| D-09 | defesa | Ver 2.2: restaurar "competing… of the viewport" a torna mensurável e já cumprida |
| D-10 | defesa | Ver 2.2 |
| D-11 / D-49 | **defesa parcial** | Não tenho caso para a **contagem**: são quatro, o terceiro é mais velho que a regra (`7cd6418`) e o quarto entrou sem citá-la. Tenho caso para a **disciplina**: em treze meses sem enforcement nenhum, o app acumulou exatamente dois movimentos a mais, os dois **funcionais** (barra do cronômetro, rolagem até a sessão) e os dois mortos por `prefers-reduced-motion`. Zero entrada animada, zero fade, zero skeleton, zero folha com mola. A metade da regra que o resumo perdeu (handoff:18) é a que a prática obedeceu |
| D-12 | defesa | `508cbc6` inteiro, e a calha vazia é TOCÁVEL — é o que a separa de decoração |
| D-13 | defesa (ônus da prova) | Cinco superfícies, cinco valores, 100% cumpridas desde 2026-08-11 e através de dois apps. Ninguém escreveu por que `#0C0E0C` e não outro preto, e isso é verdade — mas trocar custa um repinte inteiro e o ataque precisa nomear o ganho, que ninguém nomeou |
| D-14 | defesa | As 11 bordas de controle em `--ins-hairline` (`#161A15`) onde o token escrito é `--ins-border-strong` (`#3A4137`) não são preciosismo de token: um controle desenhado com a linha mais apagada do sistema **deixa de parecer tocável**. É afordância perdida, e é a regra que permite chamá-la pelo nome |
| D-15 | defesa | Os cinco tokens existem e só eles (`tokens.css:39-43`). O que cria nível novo é opacidade em 7 regras — idioma de CSS vazando, não falta de regra. Ver 1.3 para o degrau que falta |
| D-16 | defesa (a mais forte) | **Não vem do handoff.** Nasceu de medição feita aqui, num iPhone: nível 5 dá 3,22:1 e reprova em AA; procedência e aba inativa subiram para o nível 4, 5,01:1 (`2e3ef75`, reaplicada em `3ef9bb9`, números em `base.css:137-139`, `209-211`, `componentes.css:218`, `treino.css:161`, `189`, `372-376`). Uma regra com número medido e 24 violações não é velha: é a mais necessária do documento |
| D-17 | não disputada | 12 preenchimentos ácidos, 12 em `--ins-on-acid`. O ataque teria de defender texto claro sobre ácido |
| D-18 | defesa | A decisão do Lastro aqui não é o par, é a **saída** da Archivo (`7634981`): uma família inteira baixada a cada primeira abertura, e a fonte do Google é a única coisa que o app busca na rede |
| D-19 | defesa | Ver 2.1: o veredito "violada" aponta para o documento, não para o código |
| D-20 | **defesa parcial** | Caso para o piso em rótulo de interface. Não tenho caso para estendê-lo a `.chart .axu` (`componentes.css:1192`), que é rótulo de eixo em unidades de SVG e é outra categoria |
| D-21 | defesa | Mesma família de D-16 e mesmo contexto de uso. Uma das violações é a observação que o **próprio usuário escreveu** (`.hs-obs`, 12,5px, `componentes.css:1223`). E ver 1.7: há uma terceira violação a 9px que não foi contada |
| D-22 | defesa (forte) | Problema de plataforma nomeado, com o modo de falha escrito em `base.css:126-129`: *"com fonte menor o Safari dá zoom ao focar o campo e a tela fica torta no meio de uma série. **É a regra que mais se quebra sozinha, porque no desktop nada acontece**"*. Cinco seletores a violam, e um deles é `.note` a 15px (`treino.css:488`), usado dentro do cartão do exercício (`exercicio.jsx:182`) — às 6h15, entre séries. **As violações provam o comentário** |
| D-23 | defesa | Três violações, e a pior é o nome do exercício a 12px dentro de um botão de largura total (`componentes.css:1378`, `faixasessao.jsx:50`). É alvo de toque que não se lê de pé |
| D-24 | **defesa parcial** | Caso para base 4 e para a goteira. **Não tenho caso** para "só estes degraus aparecem" como fecho: 16 das 22 violações são 2px, o handoff trazia duas medidas fora da escala que o `DESIGN.md` não copiou (row padding 13–16, gap entre irmãos 6–8, handoff:52), e a razão dos degraus escolhidos não está escrita em fonte nenhuma |
| D-25 | defesa | 20px é o número de que toda decisão de largura depende (`DESIGN.md:146`), e é cumprido em `base.css:167-168` |
| D-26 | defesa | Conserto medido: *"12 de margem + 12 de padding = 24 no limite… **Estava 26 + 14 = 40, repetido cinco vezes por tela**"* (`componentes.css:32`), colhido em `468f7d4`, "compacta o ritmo vertical em 22%". É o precedente mais próximo do meu achado da Parte 1: ritmo vertical consertado sem tocar em regra nenhuma |
| D-27 | **não tenho caso** | 248 violações e nenhuma razão escrita em fonte nenhuma, nem no handoff. É a regra do documento com menos argumento a favor |
| D-28 | **defesa parcial** | Caso para as quatro exceções: cada uma tem um lugar real e um motivo (`componentes.css:162`, "alinhado com o centro da primeira linha do corpo"). **Não tenho caso** para a frase "`tests/dominio/estilo.test.ts` cobra": o teste aceita escala maior que a escrita, aplica as exceções globalmente e não lê `protocolo.css` |
| D-29 | defesa (forte) | É a única regra de toque que o Lastro **argumentou em vez de herdar**: o handoff mandava 44, aqui subiu para 46 com razão de contexto escrita — *"46 e não 44 de propósito: ele usa de pé, suado, com uma mão"* (`tokens.css:87-88`). Duas violações, ambas em controle que o próprio CSS descreve como apertado de pé |
| D-30 | **não tenho caso** | O valor mudou de 26 para 28 e ninguém escreveu por quê (`02-origem.md`, D-30), e 4 dos 6 usos não são toggle em linha densa. Tenho caso para existir **um** alvo denso restrito; não tenho caso para o 28 |
| D-31 | defesa | Razão com aritmética, escrita e específica deste app: *"40 e não 46… Este é campo de digitar uma vez, com 19px de conteúdo — 40 já é alvo confortável e **devolve 18px nas três séries**"* (`treino.css:306`) |
| D-32 | defesa | Razão medida (`componentes.css:184-188`: *"forçar 46 aqui dentro empilhava 16px de ar em cima de um conteúdo de 30"*), cumprida, e cobrada por `estilo.test.ts:120-135`. E é a regra que impede a correção de D-29 de virar altura desperdiçada |
| D-33 | defesa | Cumprida, e revisada uma vez com razão (`2e3ef75`, resumo de uma linha para duas com corte: *"duas é o meio-termo honesto para refeição com oito itens"*) |
| D-34 | **não tenho caso** | O handoff marcava "reuse for exercises" como **proposta**; o `DESIGN.md` transcreveu como fato consumado, e `508cbc6` registra por que a fusão não aconteceu. A regra descreve algo que nunca foi verdade neste app |
| D-35 | não disputada | Cumprida em quatro folhas. O ataque teria de propor borda nas células |
| D-36 | não disputada | Cumprida, com a razão repetida em `primitivos.jsx:242-245` |
| D-37 | defesa (forte) | O porquê do três é do Lastro e é bom: *"Três é o limite porque **na quarta ninguém sabe mais o que fechar leva de volta para onde**"* (`folha.jsx:6-8`). A auditoria de setembro conferiu e escreveu "nada a corrigir". As duas violações — quarta folha alcançável e 22 diálogos nativos — são o buraco por onde entra a aspereza da Parte 1, não sinal de que o teto esteja errado |
| D-38 | **defesa parcial** | Caso para "fatia vazia continua como trilho": é tese de produto, não estética — *"os buracos no registro são visíveis de propósito"* (handoff:131), e o app não comemora nem esconde falha. **Não tenho caso** para o número 14, que não é justificado em fonte nenhuma |
| D-39 | defesa | Razão escrita e elegante: *"Tocar na última célula cheia remove ela — **é como se desfaz sem botão de desfazer**"* (`primitivos.jsx:287-290`). É também o contraexemplo vivo a U-42 |
| D-40 | defesa | Dois problemas de iPhone nomeados em `tabbar.jsx:4-14`: barra `fixed` no iOS flutua **por cima** do teclado cobrindo o campo, e a barra de gestos rouba o toque |
| D-41 | defesa | `7fc8ddd` nomeia o que se tentou antes e por que falhou: *"O caminho curto — `transform: scale()` e uma casca em volta — **mente em cinco lugares ao mesmo tempo**"*, com os cinco listados |
| D-42 | **não tenho caso** | Os 62px escritos são o raio do vidro, e o aparelho usa `--pl-rc` (73/66/46 conforme o modelo). O documento está simplesmente errado |
| D-43 | defesa | A licença é argumentada e delimitada: *"Pertence ao objeto; a tela continua sendo a única região plana da composição"* (`DESIGN.md:165`) |
| D-44 | **defesa parcial** | Caso para a licença e para o critério ("ambos são estado — 'chegou', 'virou'"). **Não tenho caso** para a contagem "dois": são três declarações de `animation`, e a terceira (420ms + 140ms) não está no documento. Mesma patologia de D-11 |
| D-45 | defesa | *"São do iOS. Escrevê-los em Space Grotesk seria o app assinando o que não é dele"* (`DESIGN.md:167`) — e é a mesma regra que governa `body::before` |
| D-46 | defesa | Cumprida e **cobrada por teste** (`estilo.test.ts:418-450`). Fronteira que não vaza por acidente: vaza por asserção |
| D-47 | defesa | `7fc8ddd` registra a razão de o `main.jsx` importar o guarda: *"com `window`, a ordem de avaliação seria detalhe de emissão do bundler, e dois documentos montando o app seriam duas sincronizações sobre o mesmo `localStorage`"* |
| D-48 | defesa | A cobertura foi conferida contra si mesma: *"conferido injetando um `h2` e um `@media`, pega os dois"* (`7fc8ddd`) |
| D-50 | não disputada | Fato verificável, e verificado: os dois commits existem e fazem o que diz |

---

# Parte 4 · Contrato de UX, regra a regra

Ressalva que vale para todas: o contrato diz de si mesmo, na linha 8, que "vale
para tela nova". Quatro dos arquivos onde o agente 1 achou violação de
acessibilidade são anteriores a ele — `ajustefoto.jsx` e `camera.jsx` de
2026-09-01, `retroativo.jsx` de 08-24, `retrospectiva.jsx` de 08-14. Não é
desculpa para o defeito; é precisão sobre o que o contrato prometeu.

| id | veredicto | o caso, em uma linha |
|---|---|---|
| U-01 | defesa | O teto de três camadas é o que torna a pilha derivável. Sem ele, U-02 não existe |
| U-02 | defesa (forte) | `navegacao.js:16-26` nomeia o defeito evitado: *"não existe um segundo estado que possa divergir do primeiro — **que é o defeito clássico desta classe de solução**"* |
| U-03 | defesa (forte) | Achado P0, medido: *"o app não chama `history.pushState` em lugar nenhum… Um Voltar no meio do treino fecha o app"*. A violação do Esc com três folhas é bug de implementação numa regra que consertou perda de dado |
| U-04 | defesa | Antes: *"Voltar com folha aberta — fecha o app (`about:blank`)"* (`06-final-review.md:15`) |
| U-05 | defesa | Origem medida: *"Dados y=1200 → volta em 0; Guia y=1500 → volta em 0"*. Hoje nove dos dez destinos cumprem; o décimo (`promo`) é resíduo, não refutação |
| U-06 | defesa | Razão escrita e contraintuitiva, que é o tipo que vale guardar: *"um app que não deixa sair com o Voltar é pior que um que sai cedo demais"* (contrato:36-38) |
| U-07 | não disputada | Cumprida. O ataque teria de defender usar Voltar para ir à Home ou descartar sessão |
| U-08 | não disputada | Consequência de U-06; cumprida com um único `‹ voltar` no app |
| U-09 | defesa | A auditoria **aprovou o que já existia** em vez de inventar: *"as telas cheias dizem `‹ voltar` (correto)… as folhas dizem `×` (correto). Mantém-se"*. Uma violação, em `retrospectiva.jsx:59` |
| U-10 | **não tenho caso** | O handoff §3.8 dizia isto de **folha**; o contrato generalizou para toda tela sem registrar que estava generalizando, e por isso o §4 ("ação opcional à direita" do destino) contradiz o §2. Cinco telas a violam, e uma delas é o caso em que as duas seções do contrato se batem |
| U-11 | defesa | `a00aaf1`: o mecanismo já existia e estava ligado em 4 dos 10 destinos; a regra o ligou nos dez |
| U-12 | defesa | Medido antes e depois, três vezes (`06-final-review.md:20-22`). O "antes" era y=1200 → volta em 0 |
| U-13 | defesa (forte) | Conhecimento de plataforma caro: no iOS `overflow: hidden` no body não segura scroll de toque, e `position: fixed` com o deslocamento gravado é *"o único jeito confiável"* (`folha.jsx:12-40`). E o `instant` na devolução tem razão: *"suave faz a página deslizar sozinha depois que a folha já sumiu, e parece bug"* |
| U-14 | não disputada | Cumprida; o ataque teria de propor que trocar de aba preserve rolagem |
| U-15 | defesa (forte) | Ver 1.1. Problema medido e nomeado, com onze violações vivas — e é a regra que mais diretamente responde ao item do backlog |
| U-16 | defesa | A razão é a que ninguém acerta por intuição: *"nunca por pilha, **porque destino que abre outro por cima precisa devolver os dois**"* |
| U-17 | defesa | `c0974b2`: antes o scroll ia ao topo e o cursor ficava na lista de onde se veio |
| U-18 | defesa | Duas razões medidas em `treino.css:575-590`: a pergunta que se refaz o treino inteiro estava a dois exercícios de rolagem, e *"Grudar em 0 encostava o relógio da sessão no relógio do iPhone — dois números em cima um do outro"* |
| U-19 | não disputada | Cumprida; as cinco abas vêm da proposta de fusão (handoff:161). Sobreviver intacta não é argumento, e ninguém propôs mudá-las |
| U-20 | não disputada | `tabbar.jsx:61` só chama `vaiPara` |
| U-21 | defesa | *"Isso é **herdado do app antigo e continua certo** — em todas elas o assunto é uma coisa só, e a tab bar convidaria a sair no meio"* (`telacheia.jsx:3-6`) |
| U-22 | defesa | Problema de plataforma nomeado: *"Não existe evento de teclado no iOS; foco é o sinal mais confiável que dá para observar"* (`tabbar.jsx:7-9`) |
| U-23 | defesa | Regra escrita como **razão negativa**, que é raro e valioso: *"Esconder a navegação aqui protegeria contra um risco que não existe"* |
| U-24 | defesa | *"sem isso, a aba fica na faixa onde o gesto de home rouba o toque"* (`tabbar.jsx:11-14`) |
| U-25 | defesa (forte) | Igual a D-37 |
| U-26 | defesa | Medido: *"39 elementos continuam tabuláveis atrás da folha"*. **E a exceção que o agente 1 conta como violação é decisão registrada**: `06-final-review.md:146` — *"Tornar o 'parar' do cronômetro inalcançável durante uma folha seria pior que o vazamento de foco que resta"*. Uma exceção documentada não é a mesma coisa que uma violação |
| U-27 | defesa | `06-final-review.md:107-111` registra o que quebrou no caminho: `el.inert = true` funciona no Chromium e o jsdom não reflete, então o teste passava em branco — trocado por `setAttribute` |
| U-28 | não disputada | Cumprida. O ataque teria de propor tirar uma das quatro saídas |
| U-29 | defesa | A auditoria mediu e aprovou: *"Não há modal virando miniaplicativo. **Nada a corrigir**"* |
| U-30 | defesa (forte) | Ver 1.6. A régua de três telas nasceu de duas medidas reais (8,2 e 4,7 telas) e de a auditoria admitir que tinha errado o método |
| U-31 | defesa | *"Nenhum componente novo em nenhuma das passadas: `LinhaExpansivel` e `Chips` já existiam"* — a regra resolveu densidade sem inventar sistema |
| U-32 | defesa | O critério é o mais afiado do contrato: *"Recolher a justificativa é divulgação progressiva. Recolher a resposta é esconder"*. Uma violação, em `editores.jsx:97-130` |
| U-33 | defesa | *"o guia tinha uma seção que era **64% da tela inteira**, e isso não se via rolando"*. É literalmente a regra que o meu achado da Parte 1 pede que se aplique de novo |
| U-34 | **não tenho caso** | Sem origem. `05-navigation-behavior-matrix.md` traz "Ação fixa: não" nas cinco abas — no dia em que a regra foi escrita não havia caso a resolver. A primeira metade do §7 ("não usar por reflexo") eu defendo; a cláusula de coexistência, não |
| U-35 | defesa (forte) | Bug medido e caro: *"durante um descanso a mensagem nascia INTEIRA atrás dele e, como o cronômetro tem z-index maior, **simplesmente não aparecia**"*. E ver 1.7: doze dias depois, um componente novo a cumpriu sozinho |
| U-36 | defesa | *"o modelo certo, e **melhor que o de qualquer referência**… o 'desfazer' já existe: é apagar o campo"* |
| U-37 | defesa | Medido: *"Torná-la tocável remove dois usos do teclado por série"*. E `treino.css:167-175` explica por que ela não parece botão: *"ela é REFERÊNCIA primeiro e atalho depois"* |
| U-38 | defesa | Medido: `autoTimer()` só disparava na última série; séries 1 e 2 de 3 não iniciavam nada |
| U-39 | defesa | Efeito nomeado: *"sobrevive à tela apagada, ao segundo plano e ao reload"* |
| U-40 | defesa (fraca) | Sem critério de "frequente". A auditoria mediu e escreveu "nada a corrigir" — o que é evidência de que a regra não está atrapalhando, não de que está trabalhando |
| U-41 | defesa | Problema real medido (a janela de 700ms do debounce), com a honestidade registrada: parte da severidade original era erro de instrumento (`06-final-review.md:118-132`), e o que sobrou foi o que a regra fechou |
| U-42 | **defesa parcial** | **Não tenho caso** para "oferece desfazer" como exigência de interface: a auditoria concluiu que o app já cumpria porque apagar o campo é o desfazer, e o contrato endureceu sem registrar. Tenho caso para as três exclusões que executam sem confirmar **e** sem oferecer volta (`main.jsx:3313`, `2893`, `5293`) — essas não têm desfazer de forma nenhuma |
| U-43 | não disputada | Cumprida, 19 de 19. O ataque teria de defender não confirmar o irreversível |
| U-44 | defesa | Três documentos independentes dizem a mesma coisa — handoff UX law 4, `PRODUCT.md` princípio 3, e `editores.jsx:9-10` a chama de "Lei 4". Seis violações não desfazem três concordâncias |
| U-45 | defesa | O agente 1 a marcou como não mensurável por falta de critério para "comum". O critério está na tela: **22 diálogos do sistema** num app de um usuário. Se "confirmação repetida deixa de ser lida" precisa de prova, ela é essa contagem |
| U-46 | **não tenho caso** | Sem origem, e a auditoria que o contrato cita como fonte **aprovou** os estados (`04-implementation-plan.md:4`, `03-screen-audit.md:87`). Zero de 15 telas cumprem. Exigência genérica sem problema atrás |
| U-47 | **não tenho caso** | Sem origem, e **contradiz M-17**, que é 29 dias mais velha e veio literal do handoff com exemplo. Defendo M-17 no lugar |
| U-48 | **não tenho caso (de origem)** | Nenhum achado, commit ou comentário. Registro só uma consequência conferível: 10 falhas saem pelo toast do rodapé, que é a pilha disputada de U-35 |
| U-49 | **não tenho caso** | Sem origem e nunca medida; não está entre as verificações de `06-final-review.md` |
| U-50 | defesa | O ataque óbvio é "WCAG para um usuário é overhead". Ele se responde sozinho com o `PRODUCT.md:25`: de pé, uma mão, suado, no subsolo com sinal ruim. Acessibilidade aqui não é para outra pessoa — é para **este** usuário nas piores condições que o próprio produto nomeia |
| U-51 | defesa | Origem medida: *"no cartão de exercício aberto — 6 dos 18 controles sem nome nenhum… e os três botões de RIR anunciam '·'"*. A auditoria registrou 8 → 0 no app (`06-final-review.md:30-31`) e o agente 1 conta 9 hoje — **mas isso não é regressão**: conferi por `git blame` e 8 dos 9 são de antes da auditoria (`guia.jsx:255` de 08-14; `edicao.jsx:276, 280` e `dados.jsx:39` de 08-24; `comparar.jsx:60, 65`, `ajustefoto.jsx:111` e `camera.jsx:101` de 09-01). Só `edicao.jsx:286` é de 09-09. A varredura da auditoria não os pegou. A regra serve; a medição que a declarou cumprida foi estreita |
| U-52 | defesa | Solução registrada e específica: *"os campos não têm rótulo visível — quem rotula é o cabeçalho, **que é desenho e não semântica**"* (`exercicio.jsx:3-6`) |
| U-53 | defesa | Os outros símbolos do sistema já têm rótulo (`folha.jsx:144,146`, `primitivos.jsx:202,219,221`); os 4 sem são omissão pontual |
| U-54 | defesa | A norma é o piso, o padrão interno é o teto, e D-29/D-30 fazem o trabalho fino |
| U-55 | não disputada | Cumprida: os 8 `outline: none` têm substituto desenhado (`componentes.css:742`). Norma sem ataque plausível |
| U-56 | **não tenho caso** | A metade "nunca escondido atrás de sticky" não aparece em achado, commit ou comentário nenhum, e não há `scroll-padding-top` em folha nenhuma do app |
| U-57 | defesa | Norma, e as três violações são baratas de fechar. Uma delas nem é bem violação de cor: o alimento cadastrado em ácido é exatamente o "seu" de D-08 |
| U-58 | defesa (forte) | E ela é a rede de segurança que funcionou: o bloco desliga `transition` com seletor universal (`componentes.css:1415`), então **os dois movimentos que ninguém declarou também morrem**. A regra protegeu o que a contagem de D-11 não viu |
| U-59 | defesa (forte) | Problema nomeado em `8156d26` — *"`100vh` no iOS é a viewport grande e deixa sobra rolável do tamanho da barra do navegador"* —, cumprida em `base.css:82-83` e cobrada por `estilo.test.ts:72-80`. **E o dono do projeto registrou a mesma lição, de forma independente, no seu `~/.claude/CLAUDE.md`**, com o mesmo diagnóstico (`svh` vale, `vh` só de recuo, conferir a cadeia inteira de ancestrais). Regra confirmada duas vezes por caminhos diferentes |
| U-60 | defesa | `tokens.css:95-97`: *"Em Safari fora de tela cheia o inset vem 0; o piso garante que o conteúdo nunca encoste na borda física"* |
| U-61 | defesa (forte) | Caso concreto: o `‹ voltar` *"rolava para fora em quatro dos cinco destinos"* (`componentes.css:706-715`). A armadilha está nomeada em `base.css:84` — *"Trocar por `hidden` reintroduz `auto` no outro eixo e **derruba isto em silêncio**"* — e o `~/.claude/CLAUDE.md` do dono registra a mesma lição com a mesma correção (`overflow-x: clip`). Cobrada por `estilo.test.ts:219-226` |
| U-62 | defesa | *"O manifesto já pede `'orientation': 'portrait'`, e o Android honra em PWA instalado. **O iOS não**"* (`base.css:317-329`) |
| U-63 | não disputada | Sete perfis medidos, zero overflow. O ataque teria de tolerar rolagem horizontal |
| U-64 | não disputada | Idem |
| U-65 | **não tenho caso** | Registrado como risco aceito, não como regra conquistada: *"fica documentado como vulnerabilidade conhecida"* |
| U-66 | **não tenho caso** | Aponta para um documento que não tem a informação. Os números existem (3,22:1 e 5,01:1) e moram em comentários de CSS. Tenho caso para o limiar; não tenho caso para o item como escrito |
| U-67 | **não tenho caso** | Nunca foi conferido: `06-final-review.md:8-11` mediu em Chromium com emulação, e o próprio relatório lista "PWA instalado: exige aparelho" como limite |
| U-68 | defesa | Cumprida, e é o caso em que a auditoria publicou o próprio erro de instrumento em vez de esconder (`06-final-review.md:118-132`). O que sobrou de real é o que a regra guarda |

---

# Parte 5 · MARCA.md, regra a regra

Separação que o briefing exige: as regras desta seção são em maioria **de
identidade**, não de sistema. Marco as que são de outra ordem.

| id | veredicto | o caso, em uma linha |
|---|---|---|
| M-01 | defesa (forte, identidade) | *"Toda promessa tem um arquivo e uma linha."* O agente 1 conferiu as dez referências uma a uma e **todas existem e dizem o que a tabela promete**. Esta revisão inteira só é possível porque esta regra foi obedecida — é a regra que se pagou aqui, nesta mesa |
| M-02 | **não tenho caso** | A palavra não aparece em tela nenhuma, e o voto vencido está registrado dizendo que a ordem pode voltar a ganhar. Não tenho como mostrar que a ordem atual continua servindo |
| M-03 / M-40 | não disputada | Cumprida: zero frases do app usam a palavra. Sem ataque que eu consiga montar |
| M-04 | defesa (não é identidade — é dado) | `028fab0` nomeia o modo de falha: *"publicada a versão nova, o iPhone ainda serve o build antigo por uma ou duas aberturas, e uma série registrada nessa janela cai na chave velha"*. Regra de nome com consequência de perda de dado |
| M-05 | defesa (identidade) | *"Quem está lá dentro já entrou pela porta que tem o nome escrito"* |
| M-06 | não disputada (identidade) | Cumprida: zero ocorrências em `src/ui/`. A razão está em M-05 |
| M-07 | não disputada | Cumprida: zero exclamações em string de tela |
| M-08 | defesa (forte, identidade) | O ataque previsível é "nunca comemora envelheceu". A razão não é estética, é aritmética sobre **este** programa: *"Quem treina 5 a 6 vezes por semana quebra sequência todo domingo, e transformar isso em cobrança seria mentir sobre o programa"* (`PRODUCT.md:53-55`). Comemorar aqui exigiria inventar uma meta que a prescrição não tem. E ver D-08: a comemoração já tentou entrar **por cor**, em 7 sítios, e foi a regra que permitiu ver |
| M-09 | não disputada | Cumprida (`main.jsx:871`) |
| M-10 | defesa | Cumprida, e é a forma mais concreta de M-08: o número que pode ser lido como sequência é negado por escrito (`dados.jsx:175`) |
| M-11 | defesa | Oito de nove vereditos trazem os três elementos. Uma regra de escrita com 89% de cumprimento e um critério conferível |
| M-12 | defesa (forte) | É o `PRODUCT.md` princípio 8 em forma de voz: *"Não inventar conselho de treino"*. As três violações são exatamente o app opinando — *"se ainda der, deixe para outro dia"* (`dados.jsx:529-532`) e *"Vale olhar se está concentrada em algum exercício"* (`retrospectiva.jsx:50-52`). A regra está fazendo o trabalho dela: tornar a deriva nomeável |
| M-13 | defesa | Sete de 19 cumprem, e as sete são visivelmente melhores. É também o antídoto certo para a fadiga de confirmação de U-45 |
| M-14 | não disputada | Cumprida (`guia.jsx:180-182`, `refeicao.jsx:67`) |
| M-15 | não disputada | Cumprida (`dados.jsx:508-512`) |
| M-16 | defesa | Duas violações, e o bom exemplo **existe no app** — só está na tela em vez de na pergunta (`guia.jsx:318-321`). Isso é a regra certa aplicada no lugar errado, não regra velha |
| M-17 | defesa (forte) | *"Estado vazio é uma frase."* Veio literal do handoff (law 10), com exemplo, e é 29 dias mais velha que U-47, que a contradiz sem registrar que estava trocando de regra. Sete de 22 estados vazios a violam — e o exemplo que a própria `MARCA.md:67` dá reprova em U-47. **Onde os dois documentos se batem, este tem origem e o outro não** |
| M-18 | defesa (forte) | 71 commits desde a `MARCA.md`, um desvio (merge automático). E esta regra também se pagou nesta mesa: o agente 2 reconstruiu a origem de dezenas de regras a partir de mensagens de commit que só são legíveis porque M-18 vale |
| M-19 | **não tenho caso** | Governa um artefato que não existe no repositório |
| M-20 | não disputada (identidade) | Esclarecimento que responde à própria objeção; o documento admite o escopo vazio (`MARCA.md:87`) |
| M-21 | **não tenho caso** | Não há wordmark |
| M-22 | não disputada (identidade) | Cumprida: símbolo só em ícone e favicon |
| M-23 | **não tenho caso** | Descrição de desenho, sem aplicação mensurável |
| M-24 | não disputada | Fato verificado: sha256 idêntico nos dois arquivos |
| M-25 | **defesa parcial** | Caso para a separação de paletas, com razão escrita: *"O Instrumento governa o que se vê **dentro**; o ícone mora na tela de início, que é do sistema operacional"*. **Não tenho caso** para a frase "quebra o que `tests/dominio/estilo.test.ts` tranca" — o teste não menciona `#D9FF16`, `#0E1112` nem `public/` |
| M-26 | não disputada | Medido: 93,6% e 76,6%, cantos opacos. Regra técnica de recorte, e o motivo de arquivos separados é o erro clássico nomeado |
| M-27 / M-37 | defesa (identidade) | Cumprida, e a `MARCA.md:123-127` faz o que quase nenhum documento de marca faz: mantém o argumento **contrário** de pé por escrito enquanto executa contra ele |
| M-28 | **defesa parcial** | Caso para a fronteira — *"`ins-` nomeia o que se vê. `lastro-` nomeia o que se guarda"* — que vale 100% no que importa: 47 de 51 tokens, e os 4 restantes são `--sa-*`, que são do sistema e não do app, o que é coerente com a regra. **Não tenho caso** para "o prefixo de toda classe": 422 de 534 classes não o têm, e `componentes.css:1026-1036` documenta que foi decidido assim **antes** de a regra ser escrita |
| M-29 | não disputada (identidade) | Cumprida |
| M-30 | defesa (identidade) | Razão que se aplica a si mesma: *"O software passa o dia se recusando a fazer discurso. Um texto que faz discurso desmente o software que descreve"* |
| M-31 | defesa (identidade) | *"Não há onde pendurar: sem página de venda, sem loja, sem onboarding, sem plateia."* É fato do produto, não postura |
| M-32 | não disputada (identidade) | Cumprida |
| M-33 | não disputada (identidade) | Ver M-06 |
| M-34 | defesa (não é identidade — é desempenho) | *"Um frame a mais entre o toque e a próxima série."* Custo real, em ms, no contexto que o produto nomeia |
| M-35 | **não tenho caso** | Não há wordmark |
| M-36 | não disputada (identidade) | Cumprida |
| M-38 | defesa | Voto vencido registrado com os custos contados: prefixo em toda classe e todo token, risco real contra `estilo.test.ts`, e o usuário nunca lê a palavra. Custo alto, ganho zero |
| M-39 | defesa | *"Treino é o **domínio**. Todo escopo dizendo a mesma palavra é o mesmo que não ter escopo."* Cumprida: 39 escopos distintos |
| M-41 | defesa | `7c18963`: antes era um `const CACHE = 'treino-v28'` incrementado à mão, e esquecer significava publicar sem o aparelho pegar a versão nova — *"sem erro nenhum, só o app parado no tempo"* |
| M-42 | defesa | `028fab0`: *"o `activate` do service worker apaga todo cache que não reconhece, e renomeá-lo levaria as fotos junto"*. Renomear é apagar dado de quem não atualizou |
| M-43 | não disputada | Procedimento para evento que não ocorreu; as referências conferem |

---

# Parte 6 · Regra e identidade, separadas

O briefing pede que as duas magnitudes não se misturem. A minha leitura:

**A identidade não está em disputa que eu consiga defender ou atacar com prova.**
As regras de identidade (M-05, M-06, M-08, M-20 a M-40, D-02) são as **mais
cumpridas do perímetro**: a `MARCA.md` tem 30 cumpridas em 43, e as violações
que existem são de voz (M-11, M-12, M-13, M-16, M-17) — regras de escrita, não
de postura. Um produto cuja identidade tivesse envelhecido teria deriva na
postura. Este tem deriva na execução.

A única deriva de postura que achei é a de D-08: em 7 sítios o ácido vira "você
foi bem" (`main.jsx:4953, 5159, 5808, 5914, 5938, 6037, 6048`). Comemoração
entrando pelo único canal que as regras de voz não cobrem. Isso é argumento
**a favor** de M-08, não contra.

**O que está em disputa é forma de regra, não conteúdo de regra.** O padrão que
o meu trabalho inteiro aponta:

- regras escritas **com o problema anexado** são cumpridas, mesmo as novas, mesmo
  por quem nunca viu o defeito (U-35 cumprida doze dias depois de nascer, por
  `faixasessao.jsx`; D-22 com o modo de falha no comentário; U-61 com a
  armadilha do `hidden` nomeada);
- regras escritas **como número solto ou como boa prática genérica** são
  violadas em massa, independentemente da idade (D-27 com 248 violações e
  nenhuma razão escrita; U-46 com 0 de 15; D-24 com 22).

A correlação com o levantamento do agente 2 é exata, e eu não a procurei: fui
regra a regra e só depois cruzei. **As 8 regras que ele achou sem origem
nenhuma estão, todas as oito, entre as 20 que eu não consegui defender.** As
outras 12 do meu silêncio se dividem assim na classificação dele: 7 de "só
procedência" (D-05, D-27, D-30, D-34, U-10, U-65, M-19) e 5 de "problema"
(D-42, M-02, M-21, M-23, M-35).

E as 5 com problema nomeado que eu não defendi não contradizem o padrão: D-42 é
um número errado no documento, e as outras quatro governam um wordmark que não
existe ou uma palavra que não aparece em tela. **Não há, no meu silêncio,
nenhuma regra cujo problema de origem tenha deixado de ser verdadeiro.** Não
achei regra envelhecida no sentido de "consertou algo que não acontece mais".
Achei regra sem problema anexado, e regra sem onde se aplicar.

---

# Parte 7 · O resumo dos meus silêncios

Vinte regras onde procurei o argumento de permanência e não achei. O relator foi
instruído a ler isto como sinal, e é para ser lido inteiro:

**`DESIGN.md` (5):** D-05 (sem definição de "genuinamente destacado"),
D-27 (248 violações, zero razão escrita), D-30 (o 28 nunca foi justificado),
D-34 (transcreve uma proposta como fato), D-42 (o número está errado).

**Contrato de UX (10):** U-10 (§2, generalização não registrada que faz o §2
contradizer o §4), e nove concentradas em §7, §10, §11 e no checklist: U-34,
U-46, U-47, U-48, U-49, U-56, U-65, U-66, U-67.

**`MARCA.md` (5):** M-02, M-19, M-21, M-23, M-35 — todas sobre um wordmark que
não existe ou sobre a ordem de uma palavra que não aparece em tela nenhuma.

**As dez parciais (nove linhas)**, onde defendo metade e me calo na outra:
D-11/D-49 (disciplina sim, contagem não), D-20 (rótulo de interface sim, eixo de
gráfico não), D-24 (base 4 sim, "só estes degraus" não), D-28 (as exceções sim,
"o teste cobra" não), D-38 (fatia vazia sim, o 14 não), D-44 (licença sim,
contagem não), U-42 (as exclusões sem volta sim, "oferece desfazer" como
exigência de interface não), M-25 (separação sim, cobertura de teste não), M-28
(fronteira sim, "toda classe" não).

**O padrão das listas:** nenhuma das vinte é regra de **postura**. As cinco da
`MARCA.md` são da camada de identidade, mas governam artefato ausente — não
dizem como o produto se comporta nem como ele fala. Se esta revisão concluir
que alguma coisa precisa sair, ela sai de quatro seções do contrato de UX e de
meia dúzia de números do `DESIGN.md`. Não da voz, e não do "nunca comemora".

---

# Parte 8 · O que eu recomendaria medir antes de decidir

Não é parecer, é o que o meu ângulo deixou pendente e que só um navegador
responde:

1. **A altura das cinco abas hoje**, com o mesmo método de
   `05-navigation-behavior-matrix.md:88-95`. A última medição é de 09-09, e
   depois dela vieram dezessete commits, todos em 09-21 — dez deles `feat`
   (`git log --after=2026-09-09`). Se alguma aba voltou a passar de três telas,
   U-30 já tem a resposta, e ela não é movimento.
2. **O rodapé fixo com sessão aberta**, renderizado. Calculei ≥132px por valores
   declarados, supondo 34px de área segura, e não conferi.
3. **As 15 ocorrências de `.ins-t2`**, renderizadas. Se a prosa de Guia e Dados
   sai mesmo no branco máximo, falta uma linha em `base.css`, ao lado das outras
   três (`base.css:223-225`) — e é a mudança de maior efeito por caractere que
   este documento consegue apontar.
4. **O contraste real dos 24 sítios de D-16.** Os números de 2026-08-12 foram
   medidos num iPhone; nada garante que os sítios novos foram.
