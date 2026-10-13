# 06 · Parecer — a mesa de decisão

Quem escreve é o curador. Eu não decido, não desenho e não invento. Eu li os dois
mundos — o que o time cego desenhou e o app que existe hoje — e montei o material
com que o dono escolhe.

**Estado deste arquivo:** completo. Seções 1 a 7 entregues.

---

## 0 · Como eu li, e o que vale como prova

**O que eu abri do time.** `01-fatos.md` e `01-fatos-cortes.md`; `02-perguntas.md`
(as respostas do dono) e `02-uso.md`; `03-direcao-C/` e `03-direcao-D/` inteiras,
com os quatro HTML abertos no código e no CSS; `04-critica.md`,
`04-viabilidade.md`, `04-acesso.md` e `04-voz.md` inteiros; o registro da Parada 2
em `00-coordenacao.md`, onde está literal o que o dono disse.

**O que eu abri do app de hoje**, que é a minha única prerrogativa sobre o resto
do time, e eu listo exatamente o que abri porque este documento cobra procedência
de todo mundo:

- os documentos: `DESIGN.md`, `MARCA.md`, `PRODUCT.md`,
  `docs/LASTRO_UX_CONTRACT.md` (inteiro);
- a interface: `src/ui/instrumento/tabbar.jsx`, `timeline.jsx`,
  `primitivos.jsx`, `faixasessao.jsx`; `src/ui/navegacao.js`;
  `src/ui/exercicio.jsx`; `src/ui/telas/hoje.jsx`, `decisao.jsx`,
  `edicaodia.jsx`, `comparar.jsx`, `retrospectiva.jsx`, `retroativo.jsx`,
  `comida.jsx`, `guia.jsx`, `dados.jsx`;
- o casco e o domínio: trechos de `src/main.jsx` (ciclo da sessão, promoção,
  dia de comida, medidas do corpo, `usaAnterior`), `src/dominio/corpo.ts`,
  `src/dominio/nutricao/calculo.ts`;
- um teste: `tests/fluxo/promocao.test.js`.

**O que eu não abri**, e por isso não afirmo nada sobre: `README.md`,
`docs/design-review/**`, `docs/ux-audit/**`, `index.html`, e os seis arquivos de
CSS. Onde eu cito `src/palco.js` e `src/palco.css`, medi só o tamanho deles (479
e 573 linhas) e a descrição vem de `DESIGN.md`, que eu li.

**As três etiquetas que eu uso, e elas valem para tudo:**

| etiqueta | o que significa |
|---|---|
| **conferi** | eu abri o arquivo, contei ou li a linha. Digo onde. |
| **de C1 / de C2 / de C3 / de C4** | número ou achado de um agente do cerco que eu **não** reconferi. O crédito é dele e a dúvida também. |
| **não medido** | não existe medida. Eu não estimo sem dizer que estou estimando. |

**O peso da convergência, e por que ele é real neste material.** Os quatro do
cerco trabalharam cegos entre si e cegos ao app atual. Nenhum leu o arquivo do
outro; nenhum sabia o que o outro ia medir. Então, quando dois ou mais chegam ao
mesmo achado por caminhos diferentes — um pelo número de uso, outro pela medida de
pixel, outro pelo conflito de texto —, isso é convergência de verdade, e eu marco
**[convergente]** com os nomes. Quando um achado é de um só, eu marco **[voz
única]**: ele vale pela prova que traz, não pelo número de vozes.

---

## 1 · As duas direções lado a lado

### 1.1 · A primeira coisa que o dono precisa saber: as duas teses são quase a mesma frase

Antes de comparar, isto, porque muda como tudo o que vem depois deve ser lido.

> **C:** "Como quase tudo o que este produto registra já está escrito antes de
> acontecer, na prescrição e no último registro, a interface mostra o previsto a
> lápis e faz de registrar passar a tinta: um toque confirma o previsto, e só a
> diferença dá trabalho."

> **D:** "Como quase tudo o que este produto registra já está escrito antes de
> acontecer, pela prescrição (o quê) e pelo histórico (quanto), a interface põe o
> previsto no lugar da resposta e pede só a diferença: um toque quando foi como
> previsto, um gesto a mais quando não foi, na hora ou depois, de memória."

**Conferi: as duas abrem com a mesma oração subordinada, palavra por palavra** —
"Como quase tudo o que este produto registra já está escrito antes de acontecer".
Os dois designers trabalharam cegos entre si, e o coordenador registrou no item
2.j de `00-coordenacao.md` que a frase não está em nenhum insumo, que não há canal
entre eles, e que três das quatro direções (A, C, D) chegaram à mesma tese. A
hipótese registrada — **e ela é hipótese, não medida** — é "mesmo modelo, mesmos
insumos".

**O que isso significa para a mesa.** O dono não está escolhendo entre duas
filosofias de produto. Ele está escolhendo entre **duas execuções da mesma
filosofia**. As duas afirmam que registrar é confirmar o que a prescrição e a
última vez já dizem. As duas tiram a decisão da academia. As duas recusam, por
escrito: alarme de descanso, sequência de dias, medalha, presumir o plano, teclado
do sistema para número, e abas por assunto como entrada. Isso não é defeito do
processo — é o resultado dele, e é informação: **o modelo "confirmar o previsto"
não é uma aposta de um designer, é a conclusão independente de três de quatro.**

Consequência prática: as decisões reais da Parada 3 não são "C ou D". São as
decisões numeradas da seção 5, e a maioria delas é **transversal às duas**.

### 1.2 · O que de fato difere

| | **C · Previsto e feito** | **D · O previsto já está escrito** |
|---|---|---|
| **A tese** | O previsto a lápis; registrar é passar a tinta. Três estados visuais: **lápis** (previsto), **tinta** (confirmado), **hachura** (passou sem marca). | O previsto ocupa o lugar da resposta; pede-se só a diferença. Pré-marca o esperado e lê de volta o que vai gravar. |
| **A entrada** | **O dia inteiro na tela**, em ordem de hora, com a ação de agora **fixa no pé**, ao alcance do polegar. | **A ação de agora**, num cartão único no topo, com a lista do dia abaixo. |
| **Os lugares** | **3** — Hoje · Semanas · Prescrição. Critério: tempo, nunca assunto. A sessão é camada, não lugar. | **4** — Agora · Dias · Evolução · Prescrição. Critério: o que se faz com a prescrição (executar, registrar, ler, mudar). |
| **Andar no tempo** | Setas ‹ › em Hoje, **um dia por toque**. O dia passado é o mesmo roteiro, com o mesmo toque. | Aba **Dias** própria, com grade de mês no notebook. O passado é um lugar, não um deslocamento. |
| **A série (um toque)** | 7 botões de repetição **fixos**, centrados na última marca. Carga já vem igual à da última vez. | **Régua rolável** de repetições (54 × 64 pt), centrada na última marca. Carga já vem igual. |
| **Correção do toque errado** | **Desenhada** (M1, estado 5), e nomeada como a proteção que paga o toque único: "toda linha a tinta se abre com um toque". | **Não desenhada** nos 14 estados. Existe "Desfazer", e ele é temporário (morre em 20 s fora do app). |
| **Pôr o dia em dia** | Mesma tela de Hoje, com as setas. Sai de hoje. Um toque por refeição. | Folha por cima de hoje, **pré-marcada como "tudo"**, mais um "Como no plano" de um toque por dia. |
| **Encerrar a sessão** | **Não existe momento de encerrar.** A sessão fecha sozinha na última série e o fim se confirma na abertura seguinte. | Existe cartão nomeado de fim ("Encerrar às 7h31"), descrito e não desenhado. A sessão também fecha sozinha. |
| **Densidade na sessão** | **12 blocos de informação** na tela base do M1 (de C1, não reconferido por mim). | **9 blocos** na tela base do M1 (de C1). |
| **Ajuda para cortar sob o relógio** | Lista "Falta", com a **prioridade do treinador** escrita, mais fim previsto com e sem o cardio. | Projeção aritmética de fim "no ritmo de hoje", mais o mapa da sessão com as séries de prioridade máxima que restam. |

### 1.3 · O que cada uma custa

**C custa:**

1. **A regra do "agora" erra na hora de maior frequência.** A arbitragem escrita
   põe "refeição do plano sem marca" (regra 3) **antes** de "manhã de dia de
   treino: começar o próximo" (regra 4). Como a comida quase nunca é marcada —
   1 dia em 22 (P1) —, o pré-treino sem marca dispara a regra 3 em praticamente
   todo dia de treino, e o cartão do polegar vira pão com doce de leite na porta
   da academia. *De C1 (C-1); eu conferi a ordem das seis regras no `direcao.md`
   §3 e ela é essa.* Conserto: **modelo**.
2. **Fechar um dia de comida vazio custa ~14 toques** (de C1; ~154 para os 11 dias
   em atraso). C assume o preço por escrito, na recusa 4 e na pergunta 8.
3. **A fila de pendências no topo de Hoje não tem regra de saída.** Com as taxas
   medidas, pelo menos cinco dos sete tipos são verdadeiros quase todo dia (de
   C1). O mesmo desenho que recusa vermelho e medalha entrega cobrança permanente
   por outro caminho.
4. **Perde o momento de encerrar**, e com isso a duração fica aproximada em quase
   metade das sessões — C assume isso na recusa 2 — e **E1 não tem onde morar**
   (seção 6).
5. **Quatro das nove tarefas mais difíceis não foram desenhadas**: a troca de
   exercício (2ª em dificuldade), a aula, a sessão de fotos e Semanas/Prescrição.
   C declara cinco partes não desenhadas, mas **a troca não está na lista** — ela é
   descrita e falta (de C1, C-8; conferi que a lista das cinco em `direcao.md` §9
   não inclui "Trocar").

**D custa:**

1. **O "pôr em dia" abre pré-marcado como "comi tudo".** Dois toques declaram seis
   refeições inteiras, de memória, dias depois; e há um "Como no plano" de um
   toque por dia. É a Direção A que **a própria D descartou por escrito** ("mente
   para a regra"), voltando pela porta dos fundos. *De C1 (D-1), com a linha do
   JavaScript citada: `S[m[0]] = {v:'tudo'}` e `var ok = !anyFora() || answer`.*
   Conserto: regra, se for só o padrão da folha; **modelo**, se a resposta for que
   o plano não pode pré-marcar nada.
2. **A lista do dia não responde ao toque.** É o que encarece M-a. Quando o cartão
   único escolhe errado, todo contorno passa por "Pôr em dia" — que é a folha do
   item 1 acima.
3. **A correção do toque errado não existe depois de 20 s.** O desfazer morre
   exatamente no instante em que ele volta do WhatsApp e nota o erro (de C1, D-3,
   com a linha do JS). A mesma regra que acerta o avanço erra a correção.
4. **A régua rola, e a ponta da faixa prescrita cai para fora da tela.** Em 414 pt
   cabem ~6,3 botões de 54 pt; o 10 — que é o número provável logo depois de subir
   a carga (F95) — fica fora à esquerda (de C1, D-4, com a captura da própria D
   como prova).
5. **A projeção de fim oscila ~10 min por série no primeiro quarto da sessão**, que
   é justamente quando cortar vale a pena (de C1, D-5, conta dele sobre os números
   do próprio desenho).
6. **O lugar do corpo é declarado "notebook, sobretudo"**, mas a pesagem acontece
   no telefone, dentro da sessão (7 de 11 entre 6h28 e 7h52, P1). O lugar próprio
   existe para ler e não para escrever (de C1, D-6).

### 1.4 · O que cada uma pede ao dono

**C pede** que ele aceite:

- decidir o programa **só em casa** — a pergunta sai da academia, que é o inverso
  do que o produto faz hoje (a direção levanta isso como pergunta 9);
- **um toque por refeição**, sempre, sem atalho de dia inteiro — e, portanto, que
  pôr os 11 dias em dia **não vai acontecer** com esse preço;
- **não ter momento de encerrar** o treino;
- que a lista de todas as pesagens não tenha aba própria (recusa 7) — **e é
  exatamente aqui que E2 bate** (seção 6);
- que ele veja "previsto 16:00" quando come às 15:30 (recusa 8).

**D pede** que ele aceite:

- **confiar no palpite** do cartão único, e pagar o contorno quando ele erra —
  "mas não dá pra ser uma briga muito grande pra contornar" é a régua literal
  dele, e M-a é a medida disso (seção 5, decisão 2);
- que o atalho barato de pôr em dia **exista**, com o risco de adesão inflada que
  já cortou comida errado uma vez (F292) — a direção levanta isso como pergunta 4;
- que a **correção** more num desfazer temporário, não numa linha que reabre;
- que o número do dia fique um nível abaixo da média semanal (recusa 6);
- que compras e base de alimentos fiquem um nível mais fundo, dentro de Prescrição
  (recusa 7).

**As duas pedem**, igualmente, que ele aceite: nenhum número pelo teclado do
sistema; nenhum alarme, vibração ou vermelho no fim do descanso; nenhuma sequência
de dias nem medalha; e que a sessão possa fechar sozinha sem ele.

---

## 2 · O quanto cada direção é de fato diferente do app de hoje

Esta é a seção que só eu podia escrever, e ela tem uma conclusão desconfortável
que eu não vou esconder: **a parte do modelo que as duas direções têm em comum é,
em boa medida, o que o app já faz hoje.** O que muda de verdade é mais estreito do
que os dois documentos fazem parecer — e, em três pontos, as direções **perdem**
coisa que hoje está pronta e funcionando.

Eu medi dimensão por dimensão. Em cada linha: o que o app faz hoje (com o arquivo
onde eu conferi), e o veredito para cada direção.

### 2.1 · A tabela

| # | dimensão | o app de hoje | C | D |
|---|---|---|---|---|
| 1 | **"Registrar é confirmar o previsto"** | **Já é a tese.** `PRODUCT.md`: "Ele não pergunta o que já sabe… Nada derivável é digitado". Na série, a coluna **anterior** é um botão que copia carga **e** repetições da sessão anterior num toque e já dispara o descanso — conferi em `src/main.jsx:3710` (`usaAnterior`) e `src/ui/exercicio.jsx:61-80`. | **mesma ideia, execução outra** | **mesma ideia, execução outra** |
| 2 | **Entrada organizada por tempo, fundindo comida e treino** | **Já é.** `src/ui/telas/hoje.jsx` é literalmente "a tela da fusão": uma timeline ordenada por relógio com refeição e treino na mesma espinha. O comentário do arquivo diz: "ver as duas coisas em eixos separados era o que fazia parecerem dois apps". | **igual em critério**, estendido ao produto todo | **igual em critério**, estendido ao produto todo |
| 3 | **"E agora?" antes de "como está?"** | **Já é lei 1.** `PRODUCT.md`, princípio 1: "O topo da tela principal é a próxima ação com contagem ao vivo, nunca um resumo". É o `CartaoFoco`. | **igual, mas no pé da tela** (ver #6) | **igual, e no topo — como hoje** |
| 4 | **Registrar sem botão de salvar** | **Já é.** `PRODUCT.md`: "Cada série entra no histórico assim que carga e repetição estão preenchidas". Em `src/main.jsx`: "O rascunho continua sendo o buffer, mas cada série completa é escrita no histórico imediatamente. **Não existe estado 'não salvo'**." | **igual** (modelo §5) | **igual** (regra 6) |
| 5 | **Nunca comemorar: sem sequência, sem medalha, sem vermelho de julgamento** | **Já é regra dura, em dois arquivos.** `MARCA.md` ("'Nunca comemore' não é regra de palavra: é regra de **sinal**") e `DESIGN.md` inegociável 4 ("ácido nunca pinta comparação favorável"). Em `src/ui/telas/dados.jsx`, a justificativa está escrita na fonte: "Contagem, e nunca percentual… Nenhuma cor avaliativa… vermelho de 'falhou' num diário alimentar é o caminho conhecido para culpa." | **igual** (recusa 6) | **igual** (recusa 6) |
| 6 | **A ação de agora ao alcance do polegar** | **Não.** O `CartaoFoco` é o **primeiro** filho de `Hoje` — está no alto da tela, e a barra de abas é que fica embaixo. Conferi a ordem em `src/ui/telas/hoje.jsx`. | **muda de verdade** — o agora fixo no pé | **igual ao de hoje** — cartão no topo |
| 7 | **A barra: por assunto ou por tempo** | **Por assunto: 5 abas** — `hoje · treino · comida · dados · guia` (`src/ui/instrumento/tabbar.jsx`), com submodos por assunto dentro de `dados` (corpo/treino/comida) e de `comida` (biblioteca/plano/compras). | **muda de verdade** — 3 lugares por tempo | **muda de verdade** — 4 lugares por papel |
| 8 | **Número pelo teclado do sistema** | **Sim, hoje é o do sistema.** `<input type="text" inputmode="decimal">` para carga e repetições (`src/ui/exercicio.jsx:84-98`). O produto já sabe o preço: `DESIGN.md` manda "campo de texto nunca abaixo de 16px — o Safari dá zoom ao focar, e a tela fica torta no meio de uma série". | **muda de verdade** — teclado próprio | **muda de verdade** — teclado próprio |
| 9 | **A sessão como grade de preencher (planilha)** | **Sim, é exatamente isso.** `src/ui/exercicio.jsx`: cabeçalho `série · anterior · kg · reps · rir` e uma `setrow` por série, com dois campos de digitar. | **muda de verdade** — 7 botões fixos na zona do polegar | **muda de verdade** — régua rolável. **E D descartou a planilha por escrito, cega** (descartada B, "A sessão como planilha"): ela descreveu e recusou o desenho que existe hoje, sem nunca o ter visto |
| 10 | **Três estados: previsto · feito · passou sem marca (E3)** | **Metade.** A marcação de refeição é binária (`d.done[id] = 1` ou ausente, `src/main.jsx:2055`); não há forma nem palavra para "sem marca" na linha. Mas o buraco **é** mostrado: a `Sparkline` tem 14 fatias e "as fatias vazias continuam como trilho — os buracos no registro são visíveis de propósito" (`src/ui/instrumento/primitivos.jsx:130`). 14 é exatamente a janela da regra. | **muda de verdade** — lápis/tinta/hachura, com forma **e** palavra em toda linha | **muda de verdade** — "sem marca" com forma e palavra |
| 11 | **Tema** | **Escuro, e declarado "não por estilo"**: `DESIGN.md`, "o app abre às 6h15 no subsolo de uma academia e de novo à noite". | **muda de verdade** — claro e escuro, contraste medido nos dois | **muda de verdade** — "fundo claro e quente de dia; o tema escuro segue o sistema" |
| 12 | **Tipografia e forma** | **Seis inegociáveis**: raio zero, número em IBM Plex Mono e prosa em Space Grotesk, fio de 1px em vez de cartão, um acento ácido `#CBF35E` com quatro sentidos, rótulo mono em caixa alta como estrutura, quase nenhum movimento. | **não decide** — C não escreve tipografia, raio nem paleta nominal; fala de forma só onde é estado (tracejado, preenchido, listras) | **muda de verdade** — **fonte do sistema**, "sem nada para baixar, porque o tempo de abertura é orçamento (F73)", números tabulares, uma cor de destaque (anil) |
| 13 | **Procedência: todo número diz de onde veio** | **É promessa de marca com primitiva própria.** `MARCA.md` prende a acepção financeira a `Procedencia` (`src/ui/instrumento/primitivos.jsx`), e ela aparece em quase toda tela — "cru · 3,4 kg prontos", "comparado com o mesmo ponto das N semanas anteriores". | **carrega no conteúdo, não como regra** (a saída da regra com os números que a produziram) | **carrega no conteúdo, não como regra** (idem, mais o arroz antes/depois) |
| 14 | **Modo de mesa no notebook** | **A bancada**: um iPhone pousado numa superfície de titânio, dentro de um iframe com viewport de verdade (`src/palco.js`, `src/palco.css`, 1052 linhas somadas). Rompe três dos seis inegociáveis, com licença escrita para cada um. | **muda de verdade** — "a tela larga do notebook", **não desenhada** (C declara) | **muda de verdade** — Dias como grade de mês, Evolução e Prescrição em colunas; **não desenhado** |
| 15 | **Um usuário, ou mais de um** | **Um.** `PRODUCT.md`: "Um usuário. Eduardo. Não existe usuário além de um." (O código já tem conta e sincronia; a doutrina não acompanhou.) | **muda de verdade** — "Esta lista é o piso para qualquer usuário (P3, D8)" | **muda de verdade** — "Nada usa a rotina do dono como regra" |
| 16 | **O Voltar do sistema por camada** | **Resolvido e documentado** em `src/ui/navegacao.js`, com o histórico sincronizado à pilha de camadas. | **especifica o mesmo** (§7) | **especifica o mesmo** ("a sessão registra a sua posição no histórico") |
| 17 | **A decisão de tornar permanente, ao encerrar (E1)** | **Já existe, e é tela própria** — ver 2.3, que é o achado mais importante desta seção. | **perde** | **perde** |

### 2.2 · O veredito, em número

Contei as 17 dimensões acima:

| | **C** | **D** |
|---|---|---|
| igual, ou a mesma ideia com outra execução | **7** — 1, 2, 3, 4, 5, 10†, 16 | **7** — 1, 2, 3, 4, 5, 16, e o **#6 é *literalmente* o de hoje** |
| muda de verdade | **8** — 6, 7, 8, 9, 10†, 11, 14, 15 | **8** — 7, 8, 9, 10, 11, 12, 14, 15 |
| não decide | **1** — 12 (tipografia, raio, paleta, movimento) | **0** |
| **perde o que hoje existe** | **2 nominais** — dimensões 13 e 17 — **mais 4 buracos de entrega** (§3.1, linhas 5, 6, 7 e 13 daquela tabela) | **2 nominais** — dimensões 13 e 17 — **mais 3 buracos de entrega** (§3.1, linhas 5, 6 e 13) |

† o #10 conta nas duas colunas em C porque metade dele (mostrar o buraco) já existe
na sparkline de 14 fatias e a outra metade (forma e palavra em cada linha) é nova.

**A leitura honesta.** As duas direções são **mudanças reais de superfície e de
interação**, e não um rebrand: a barra, o teclado, a forma de registrar a série e
o tema mudam nas duas. Mas **o modelo — o que o app afirma sobre si — quase não
muda**, porque o app de hoje já afirma a mesma coisa. Quem ler o `06-parecer`
esperando duas propostas novas de produto vai encontrar duas propostas novas de
**interface** sobre o produto que já existe.

Isso tem um lado bom que vale dizer: **o time cego, com 300 fatos e nenhuma pista
da forma, reconstruiu a tese do app atual três vezes em quatro** (A, C e D). Essa
é a validação mais forte que este processo podia produzir, e ela não estava
encomendada. O modelo vigente não é hábito nem inércia: é a resposta que os fatos
dão.

E tem um lado que precisa ficar escrito: **nas duas direções, as diferenças mais
visíveis são as que o briefing chamou de forma** (barra, tema, tipografia, o lugar
do polegar), e **as duas convergem com o app atual exatamente nos pontos em que
ele é mais duro** (não comemorar, não pedir o que já sabe, não ter botão de
salvar, mostrar o buraco).

### 2.3 · O achado que o cerco não podia ver: **E1 não é novo. É o que o app faz hoje.**

Isto é meu, conferido no código, e muda a leitura do achado convergente mais forte
da Onda 3.

**O que existe hoje.** `src/ui/telas/decisao.jsx` é uma tela cheia chamada **"O que
fica no programa?"**. O cabeçalho do arquivo diz, palavra por palavra:

> "A pergunta do fim da sessão: o que fica no programa? Aparece só quando houve
> mudança no dia, e **interrompe o encerramento de propósito** — é o único momento
> em que ele lembra por que mudou. Perguntar depois seria perguntar para alguém que
> já esqueceu."

Cada mudança é uma decisão independente, com o par **"só hoje" / "levar para o
oficial"** repetido em cada linha e um motivo opcional em chips. O padrão é "só
hoje" em todas. Conferi o gatilho em `src/main.jsx:885-901`: ao finalizar, se há
mudanças no dia e o dia não é aberto, `view.promo` abre a tela antes de encerrar.

**E1 é, portanto, a restauração de um comportamento vigente** — e o dono pediu
exatamente ele, com as palavras dele: "ao final do treino seria o ideal… mas
também ter a opção na própria tela, bem sutil".

**E agora a parte que importa para a mesa.** O achado convergente mais forte do
cerco é que E1 é a única exigência que cria defeito novo, nas duas direções — C1
pelo número (a pergunta só alcança as 37% a 58% de sessões que ele encerra), C3
pela medida ("discreto" reprova em alvo), C4 pelo conflito de voz. **O número de C1
está certo, e o app de hoje já o resolveu** — por um mecanismo que nenhum dos
quatro podia conhecer:

Conferi em `src/main.jsx:627-643` (`fechaSessao`) e `:2611` (`abrePromoGuardada`).
O comentário na fonte é o argumento inteiro:

> "A pergunta 'isto fica no programa?' não pode depender de ele ter tocado em
> FINALIZAR. A sessão nasce e morre sozinha por decisão do produto — então quando
> morre sozinha com mudança pendente, **a pergunta fica guardada e aparece na
> abertura seguinte.** Descartar em silêncio era decidir por ele, sempre para o
> mesmo lado."

E `abrePromoGuardada` tem a guarda que faltava: `if (… || S.sessao) return false` —
a pergunta guardada **nunca** aparece no meio de um treino novo, "porque perguntar
sobre o programa enquanto ele registra série é interromper a única coisa que o app
existe para não atrapalhar".

**O que isso faz com o achado do cerco.** Ele não cai: em **C e D como desenhadas**,
E1 realmente cria defeito, e em C o conserto é de modelo (C não tem momento de
encerrar). O que muda é a conclusão. A pergunta na mesa deixa de ser *"vale pagar o
defeito que E1 cria?"* e passa a ser:

> *As duas direções recusam, por escrito, perguntar sob o relógio. O app de hoje
> pergunta, e já tem o atalho de contorno para as 42% a 59% de sessões que fecham
> sozinhas. Adotar C ou D significa trocar um mecanismo pronto e testado por uma
> recusa de princípio. É isso que o dono quer?*

Essa pergunta está numerada na seção 5 (decisão 1), e ela não é minha para
responder.

---

## 3 · O que o app de hoje faz bem, e o que cada direção perderia

Nominalmente, item por item. Cada um tem o arquivo onde eu conferi. Classifiquei
a perda em três graus: **perde** (o desenho entregue não tem), **não desenhou**
(está especificado no texto da direção, mas ninguém pode conferir), e **troca por
outra coisa** (perde isto e põe aquilo, e o dono julga a troca).

### 3.1 · As perdas nominais

| # | o que hoje funciona | onde conferi | **C perde** | **D perde** |
|---|---|---|---|---|
| 1 | **A pergunta "o que fica no programa?" ao encerrar, decisão por decisão, com motivo opcional** | `src/ui/telas/decisao.jsx`; gatilho em `src/main.jsx:885-901` | **perde (modelo).** C não tem momento de encerrar nos 11 estados do M1 | **perde (regra).** Há cartão nomeado de fim, descrito e não desenhado |
| 2 | **A pergunta que sobrevive à sessão que fecha sozinha** — fica guardada e volta na abertura seguinte, nunca dentro de um treino novo | `src/main.jsx:627-643` + `:2611` (`abrePromoGuardada`) | **perde.** O estado 10 confirma o *fim* da sessão, não a *decisão* sobre o programa | **perde.** O M1-13 manda a mudança para "decidir com calma", sem regra de quando ela volta (a própria D pergunta isso, pergunta 7) |
| 3 | **Toda linha do dia responde ao toque: caixa de marcar, corpo e `···` de editar** | `src/ui/instrumento/timeline.jsx` (`aoMarcar`/`aoAbrir`/`aoEditar`); `src/main.jsx:2055` | **perde em parte.** As 7 linhas `row pencil` do M2 não têm controle; a linha colapsada do caso ruim é a única `row hatch` sem "marcar" (de C1, C-2 e C-6, com as linhas do arquivo) | **perde.** As linhas do roteiro são `<li>` sem controle e sem `role`, numa tela em que o cartão, a água e o "Pôr em dia" são botões (de C1, D-2) |
| 4 | **"Não existe modo de edição": todo objeto carrega a própria afordância de editar** | `PRODUCT.md`, princípio 2 | **nomeia e não entrega na comida.** C faz disso a proteção que paga o toque único ("toda linha a tinta se abre com um toque") e desenha na série (estado 5), não na comida | **troca por outra coisa**: um "Desfazer" que morre 20 s depois de ele sair do app (de C1, D-3, com a linha do JS) |
| 5 | **Comparar fotos: par padrão = a mais nova contra a mais antiga, com peso e cintura da semana sob cada foto, e a pergunta de gordura visual na mesma tela** | `src/ui/telas/comparar.jsx` | **não desenhou** (declara) | **não desenhou** |
| 6 | **A saída da regra do nutricionista com os números que a produziram, e o botão de aplicar o passo** | `src/dominio/corpo.ts:173-235` (`veredito`, com `MIN_REGISTRADOS = 11`); `src/ui/telas/dados.jsx:346-356` (`podeAplicar`, `acaoTxt`) | **não desenhou.** E **E2 parte a decisão em dois lugares** (de C1) | **não desenhou** |
| 7 | **O painel de troca de exercício: indicados primeiro, outros do grupo depois, foto do aparelho, o que já foi feito de cada um, e "voltar para o original"** | `src/ui/exercicio.jsx:140-168` (`Troca`) | **não desenhou — e não declarou que não desenhou** (de C1, C-8; conferi que a lista das cinco partes não desenhadas de C não inclui "Trocar") | **desenhou** (M1-12) |
| 8 | **A `Procedencia` como primitiva e como promessa de marca: todo número derivado diz de onde veio** | `MARCA.md` ("o que a cumpre é a primitiva `Procedencia`"); `src/ui/instrumento/primitivos.jsx` | **carrega no conteúdo, perde como regra** | **carrega no conteúdo, perde como regra** |
| 9 | **A bancada**: o app pousado num iPhone numa superfície de mesa, com viewport de verdade por iframe, três licenças escritas e testes que cobram as recusas | `src/palco.js`, `src/palco.css`, `DESIGN.md` §A bancada | **troca por outra coisa**, não desenhada | **troca por outra coisa**, não desenhada |
| 10 | **O tema escuro, justificado pelo uso** (6h15 no subsolo, e de novo à noite) | `DESIGN.md` §Tema | **troca** por claro + escuro | **troca** por claro de dia, escuro seguindo o sistema |
| 11 | **Colar e digitar rápido um número** (`inputmode="decimal"`, teclado do sistema) | `src/ui/exercicio.jsx:84-98` | **recusa, por escrito** (recusa 1) | **recusa, por escrito** (recusa 1) |
| 12 | **A coluna "anterior" como referência primeiro e atalho depois** — "continua parecendo texto de propósito: um botão desenhado como botão pediria atenção que a linha não tem para dar" | `src/ui/exercicio.jsx:61-67` | **troca** por 7 botões proeminentes na zona do polegar | **troca** por uma régua proeminente |
| 13 | **A tabela de séries que se adapta à aula de box** (a coluna de RIR sai: "25 botões numa aula de cinco movimentos em cinco rounds"), e a medida própria por movimento (m, cal, seg) | `src/ui/exercicio.jsx:42-46`, `:209-240` (`Medida`) | **não desenhou a aula** | **não desenhou a aula** |
| 14 | **O destrutivo com `confirm()` do sistema e o estrago delimitado em texto** ("Sai da média da semana e do ritmo. As outras medidas ficam.") | `src/main.jsx:3370-3383` (`delBody`); `DESIGN.md` §Folha de baixo | **não trata** | **não trata** |

### 3.2 · O que as duas **ganham** sobre hoje, e é nominal também

Para a mesa ser mesa, isto tem o mesmo peso. Aqui eu conferi no código que o app
de hoje **não** faz:

1. **Pôr a comida em dia é impossível hoje.** Conferi em `src/main.jsx:1847-1859`
   (`diaDeComida`): o dia de comida é carimbado com a data e, quando a data vira,
   `fechaDiaDeComida` congela o dia no histórico e o novo nasce vazio. `marcaRefeicao`
   escreve sempre em `S.dia.done`, que é sempre **hoje**. **Não existe superfície
   para marcar uma refeição de um dia que passou.** Peso e treino, sim — peso tem
   seletor de data com "registrar ontem / registrar em ter 14" e a linha "neste
   dia: … · registrar substitui" (`src/main.jsx:3288-3302`); treino passado tem
   tela própria (`src/ui/telas/retroativo.jsx`). **Comida, não.**

   **Isto reenquadra M-b por inteiro** (seção 5, decisão 3). O custo de C para
   fechar um dia vazio — ~14 toques, de C1 — não se compara com um número menor do
   app atual: compara-se com **a tarefa não existir**. U11 é a segunda situação
   mais frequente medida (3,25 registros por semana), e hoje ela não tem onde
   acontecer na metade da comida.

2. **O estado "sem marca" na linha, com forma e palavra.** Hoje o buraco aparece
   na sparkline de 14 fatias (`src/ui/instrumento/primitivos.jsx:130`) e o domínio
   já distingue silêncio de zero com clareza exemplar — `fechaDiaDeComida`:
   "guardá-lo como zero seria dizer que ele não comeu, que é o erro de medição que
   confunde silêncio com falha". Mas **na linha da refeição não há esse estado**:
   `done[id]` é 1 ou ausente. As duas direções põem forma e palavra em cada linha,
   e **essa é a entrega de E3 que o app não tem.**

3. **Nenhum número pelo teclado do sistema.** O app de hoje conhece o problema e o
   contorna (16px para não dar zoom); as duas direções o eliminam.

4. **O agora ao alcance do polegar** — só C. Hoje o `CartaoFoco` está no topo.

5. **A porção "metade" como estado do registro.** Hoje há ajuste de escala de
   porção (`setEscala`, só de hoje), mas a marca é binária; as duas gravam a porção
   (1 ou 0,5) como parte do registro.

6. **Mais de um usuário.** `PRODUCT.md` ainda diz "não existe usuário além de um".
   As duas desenham para quem não é o dono (P3, D8), o que está alinhado com a
   direção que o dono já declarou para o produto.

### 3.3 · O contrato de UX vigente, e os quatro lugares onde as duas direções o contrariam

`docs/LASTRO_UX_CONTRACT.md` é o documento que diz como as coisas **se comportam**
no app de hoje (`DESIGN.md` manda na forma; este manda na navegação). Eu o li
inteiro, e ele contém um piso declarado que, em quatro pontos, as duas direções
não cumprem. Isto não é perda de capacidade: é **conflito de regra**, e cada um
tem um argumento escrito do lado de hoje que o dono precisa ver antes de decidir.

**1 · A barra de navegação durante o treino.** O contrato, §5, decide o contrário
das duas, e diz por quê:

> "**Continua visível durante o treino ativo**: o treino acontece dentro da aba
> TREINO, e sair para conferir a comida e voltar é um caminho legítimo — a sessão
> não se perde. **Esconder a navegação aqui protegeria contra um risco que não
> existe.**"

As duas direções fazem o oposto: em **C** a sessão "abre em tela inteira" e é
"uma camada a mais"; em **D** ela "abre daqui em modo próprio e ocupa a tela
inteira enquanto está aberta". **Mas as duas resolvem o mesmo problema por outro
caminho, e melhor**: elas trazem água, pré-treino e peso **para dentro** da
sessão — C pela folha "Dia", D pelos chips do "enquanto descansa" —, a 1 toque. A
resposta de hoje é sair e voltar, e eu medi: isso custa ~3 toques (trocar de aba,
registrar, voltar pela `FaixaDaSessao`). **As duas são melhores na tarefa medida e
pagam com a navegação desaparecendo.** A troca é real e é dele.

**2 · Nome acessível em todo controle.** O contrato, §11: "Todo controle tem nome
acessível… Botão cujo conteúdo é símbolo (`·`, `×`, `···`) leva `aria-label`."
C3 mediu **178 `<svg>` em D sem nome e sem `aria-hidden`**, 102 deles fora de
controle nomeado (R-D2). O piso que o produto já se impôs por escrito **reprova**
esse item de D, independentemente da WCAG.

**3 · O alvo de 46 px para controle repetido.** O contrato, §11: "Alvo ≥ 24×24
(norma); **≥ 46 px para controle repetido (padrão interno)**", com a distinção
entre desenho e alvo e a extensão por `::after`. C3 mediu, contra 44: em **C**,
`.gb` a **40 × 44** (o único abaixo de 44 do arquivo); em **D**, 12 alvos abaixo
de 44 — `.map` a 30 px e `.daytype` a 36 px. Pelo padrão interno de 46, a conta
piora nas duas. E é justamente o que C3 nomeou como o lugar onde E1 bate.

**4 · Largura de 320 px sem overflow horizontal.** Está no checklist de tela nova
do contrato. A régua de **D** rola na horizontal por projeto, e C3 mediu que 10
elementos do M1 saem pela direita do telefone de 414 px (ele classificou isso,
corretamente, como a régua funcionando e não como corte). A 320 px o problema é
maior, e **não foi medido por ninguém**.

**E duas coisas do contrato que as duas direções cumprem melhor do que o app
cumpre hoje**, para a seção não ser só cobrança: o contrato manda que "ação
frequente não mora atrás de menu, `···` ou tela intermediária" (§8) — e as duas
põem a ação mais frequente do produto no terço de baixo da tela, ao alcance do
polegar, o que hoje não acontece (§2.1, #6). E o contrato manda que toda tela com
E/S declare "carregando · vazio · erro · conteúdo" (§10) — as duas declaram os
quatro nos dois momentos, e C1 não conseguiu derrubar isso (item 5 do "o que
aguenta").

### 3.4 · A convergência mais barata de todas, e ela é um aviso

Quatro coisas as duas direções **especificam como se fossem novas** e o app já
resolveu, com documentação e teste:

- o **Voltar do sistema** por camada (`src/ui/navegacao.js`);
- o **descanso calculado pelo relógio de parede** a partir do instante gravado,
  sobrevivendo ao bloqueio e ao app fechado (é o item 1 do "o que aguenta" de C1);
- **nenhum falso sucesso** / nada de estado "não salvo";
- **mostrar o buraco** em vez de preencher com zero.

Isso é bom sinal sobre o modelo e é mau sinal sobre o custo: **parte do que as duas
direções entregam como ganho é trabalho já feito**, e a Onda 5 não deve recomprá-lo.
Quem detalhar a direção escolhida precisa saber disso, ou vai reescrever
`navegacao.js` do zero.

---

## 4 · O que ficou provado, o que é hipótese e o que é gosto

Três colunas, e elas não se misturam. **Prova** é número medido, com fonte e
método. **Hipótese** é previsão sobre o que vai acontecer — inclusive previsão
competente, feita por especialista. **Gosto** é preferência, e gosto é do dono.

### 4.1 · Provado

Cada item traz quem mediu e como. Onde eu reconferi, está escrito.

**Do uso (C1, contando toques nos quatro HTML):**

| o que foi medido | número | eu reconferi? |
|---|---|---|
| O caso base da série, nas duas direções | **1 toque** | sim, no JS dos dois protótipos |
| A série além das prescritas (pedido explícito do dono, P12) | **2 toques nas duas** | sim |
| A refeição do momento, nas duas | **1 toque** | sim |
| M-b, caso desenhado: registrar ontem | **C = 4 toques · D = 5** (5 e 5 contando a volta) | sim; o `g('save')` de D é passo obrigatório |
| M-b, caso real (dia vazio) | **C ≈ 14 · D = 1** (e o 1 de D pré-marca "comi tudo") | sim; `S[m[0]] = {v:'tudo'}` está no arquivo |
| M-a: contornar o cartão errado em D | **1** (peso) · **2** (outra refeição) · **≥2 para tela que não existe** (horário) · **sem caminho** (começar a sessão) | sim, as linhas `<li>` sem controle |
| Começar a sessão a partir da tela do dia | **sem alvo desenhado nas duas** | sim |
| E1 só alcança as sessões que ele encerra | **58% (7/12) e 37% (10/27)** | não — é conta de C1 sobre P1 |
| Densidade da tela base do M1 | **C = 12 blocos · D = 9** | não |

**Do stack (C2, lendo `src/dominio/`, `src/infra/`, `tests/`):**

| o que foi medido | número |
|---|---|
| Casos de teste no repositório | **885** — 372 de domínio, 513 de fluxo em 33 arquivos |
| Casos de domínio que sobrevivem às duas | **372, inteiros.** Nenhuma das duas muda uma regra |
| Casos de fluxo que quebram nas duas | **513.** Acoplamento: 33/33 pela entrada de navegação, 32/33 por seletor ou `id`, 31/33 por função interna, 24/33 pelos campos de texto por série |
| Impossível no stack, em C ou D | **nada.** "Nada que C ou D desenharam é impossível neste stack" |
| Migrações já feitas no projeto | **9** (`PLANO_ATUAL = 9`) |
| Defeitos técnicos **do app de hoje** que C2 achou de passagem | **3**, todos baratos: "saiu do plano" não atravessa a fusão (`sincronia.ts:307-312`); o cache das fotos do corpo é apagado a cada publicação (`src/sw.js:28`) — que é o que de fato bloqueia U13; e restaurar cópia perde coleções (F251) |

**Do acesso (C3, com Chromium e `playwright-core`, encaixe neutralizado):**

| o que foi medido | C | D |
|---|---|---|
| telefones · elementos com texto · controles | 24 · 725 · 218 | 27 · 801 · 307 |
| **1.4.3** contraste de texto reprovado, nos dois temas | **0** | **0** |
| **2.5.8** alvos abaixo de 24 px | **0** | **0** |
| **2.4.7** focáveis sem anel de foco | **0 de 218** | **0 de 307** |
| reprovações firmes | **3** | **4** + 1 limítrofe + 1 defeito de estado programático |
| a reprovação grave | **R-C1:** 119 controles com limite desenhado e imperceptível; `.chip` (o botão mais tocado do produto) tem preenchimento **1,00:1** — branco sobre branco | **R-D1:** a série guardada **não é anunciada** — `<div class="saved">` sem `role`/`aria-live`; o ato mais frequente do produto é mudo para leitor de tela |
| a inversão de hierarquia | em C, `.chip.out` (valores **fora** da faixa) mede 3,55:1 e **passa**; os valores **dentro** medem 1,55:1 | — |
| ícones sem nome e sem `aria-hidden` | — | **178 de 178** `<svg>`; 102 fora de controle nomeado |
| a régua de D | — | **6 de 12** valores alcançáveis sem arrastar (714 px de conteúdo em 382 px) |

**[convergente — C1 e C3, cegos entre si, caminhos diferentes]** O mesmo caso
quebra nas duas direções por motivos opostos, e os dois acharam: **o valor
provável de repetições logo depois de uma subida de carga.** C1 pela aritmética
da janela (em C, 10 e 11 não estão nos 7 botões, e a saída custa 4 toques; em D, o
10 fica fora da tela à esquerda); C3 pela medida de pixel (em D, 714 px de régua
em 382 px de tela). A regra do treinador é F95: "sobe a carga no menor incremento
prático e recomeça perto da base".

**[convergente — C1 e C4]** A linha "sem rede" fixa no topo da sessão de C. C1 por
frequência (presente em 7 dos 11 estados; ~48 exposições por semana a uma linha
que nunca muda, na tela que o dono pediu "mais limpa"); C4 por regra de voz
("'sem rede' como letreiro fixo" está na lista de palavras recusadas, porque é o
estado normal do subsolo).

**[convergente — C1, C2, C3, C4: todos os quatro]** **E1 cria defeito nas duas
direções como elas foram desenhadas**, e cada um chegou por um caminho:

- **C1, pelo número:** a pergunta só alcança 37% a 58% das sessões; e o instante é
  o nº 1 em dificuldade do produto, com 5 das 7 condições adversas ao mesmo tempo.
- **C2, pelo mecanismo:** "sem o gatilho da abertura seguinte, E1 não existe na
  maioria dos casos de P1-A — e descartar a mudança sem ele decidir é F280".
- **C3, pela medida:** "'discreto' é a palavra que produz o defeito" — o que é
  discreto nos dois desenhos é exatamente o que já reprova (em C, `.gb` 40 × 44 e
  borda 1,38:1; em D, `.map` a 30 px e `.daytype` a 36 px).
- **C4, pelo conflito escrito:** as duas recusam por escrito perguntar sob o
  relógio, e a exigência manda o contrário.

**[convergente — eu e C2, por caminhos diferentes]** **O mecanismo que resolve o
número de E1 já existe no app.** C2, lendo só `tests/`, escreveu: "manter os três
gatilhos; **o código já tem dois, com nove casos de teste**". Eu, lendo
`src/ui/telas/decisao.jsx` e `src/main.jsx`, achei a tela e os dois gatilhos.
Conferi a contagem dele: `tests/fluxo/promocao.test.js` tem **exatamente nove
casos**, e três deles nomeiam o que falta às duas direções — "sessão que morre
sozinha guarda a pergunta para a próxima abertura", "a pergunta guardada aparece
ao abrir o app de novo", "a pergunta guardada não interrompe um treino em
andamento". **Nenhum de nós dois podia ter visto o arquivo do outro.**

### 4.2 · Hipótese

Previsão sobre o que o usuário vai sentir ou fazer. Nada aqui é falso; nada aqui
é medido.

1. **Que o toque único vai fazer o registro de comida acontecer.** É a tese
   central das duas. O que está medido é o **custo** (1 toque) e a **falha atual**
   (1 dia em 22). Que baixar o custo levante a taxa é **hipótese** — e o próprio
   material contém o contra-argumento: o app de hoje **já** marca refeição em um
   toque na linha do dia (conferi, `src/main.jsx:2055` + `timeline.jsx`), e a taxa
   é de 1 em 22. **O gargalo medido é abrir o app, não o toque dentro dele**, e
   nenhuma das duas direções pode resolver isso, porque lembrete sem servidor é
   impossível (F11, confirmado por C2 como impossibilidade dura).
2. **Que a fila de pendências de C vira cobrança permanente** (C-3) e que **o
   contador parado em 0 vira placar de fracasso** (D-7). O raciocínio é forte e os
   insumos são medidos; a reação dele, não. Não medido.
3. **Que o palpite errado do cartão de D custa pouco na prática.** M-a mede o
   contorno (1 a 2 toques nos casos comuns), mas a frequência do gatilho (~1 dia
   por semana) é conta sobre P1, e o quanto isso incomoda é hipótese.
4. **Que "discreto" inevitavelmente produz alvo pequeno.** C3 mediu que, **nestes
   dois desenhos**, é o que aconteceu. Que seja inevitável é hipótese dele — e o
   requisito que ele escreve (≥ 44 px, limite ≥ 3:1, nome escrito) é a prova de
   que não é.
5. **Que a projeção de fim de D ajuda a cortar cedo.** A oscilação de ~10 min por
   série é conta de C1 sobre os números do desenho; que ele consiga decidir com um
   número que oscila é hipótese, nos dois sentidos.
6. **Que mais de um usuário vai usar isto.** O dono disse "terão outros usuários"
   (P3) e isso governa as duas direções. Quantos, quando e com que prescrição:
   não medido.
7. **Que o tema claro serve às 6h15 no subsolo.** As duas direções são claras
   (C3 mediu `--paper #F5F2EB` em C e `--surface-2 #EDEAE3` em D) e o app de hoje
   é escuro **com justificativa de uso escrita** (`DESIGN.md`: "o app abre às 6h15
   no subsolo de uma academia e de novo à noite"). Nenhum dos dois lados tem
   medida: a luz da academia **não está registrada** (C3, §7, citando
   `01-fatos.md` linha 1474). As duas coisas são hipótese, inclusive a de hoje.

### 4.3 · Gosto — e é do dono

Isto não é fraqueza do material. São as perguntas que nenhum número responde, e
que ele já começou a responder com palavras dele.

1. **A paleta e o movimento.** P12, literal: "as cores precisam ser agradáveis.
   É, escolha uma paleta gostosa, que dê vontade de usar, moderno também… Eu
   quero essas decisões tomadas com muito, muito, muita atenção e cuidado e
   carinho." E: "a coisa mais chatinha… é a falta de fluidez no toque das coisas…
   ele não tem uma fluidez, um motion, uma suavidade, sabe? Eu gosto disso, eu
   gosto de um X bonito, um I bonito."

   **Aqui as duas direções não empatam, e isso é informação, não opinião minha.**
   **D responde a P12 por escrito e nominalmente** (§"Forma, com o motivo de uso":
   uma cor de destaque anil, fonte do sistema, números tabulares, "o toque afunda,
   o que confirma que pegou com a mão suada… É a 'fluidez no toque' que o dono
   pediu (P12), aplicada onde ele toca 48 vezes por semana"). **C não decide
   forma**: não escreve paleta, tipografia, raio nem movimento além de "as
   transições são curtas e somem com 'reduzir movimento'". Se a paleta e a fluidez
   pesam na escolha, **C deixa essa resposta para a Onda 5 e D já a deu.**

   Nota de contexto que é minha, conferida: o app de hoje decide o contrário em
   documento — `DESIGN.md` inegociável 6, "Quase nenhum movimento… Movimento aqui
   não decora e não comemora", com quatro movimentos autorizados e um registro
   escrito do que foi recusado. **O pedido de P12 é um pedido de mudança de
   doutrina, não um detalhe de acabamento.**

2. **Tema claro ou escuro.** Ver 4.2, item 7: sem medida dos dois lados.
3. **Se a decisão de programa pode voltar para a academia.** É E1, e C2 marcou
   isso como "fora do meu alcance: é dele".
4. **Se o produto deve mostrar o buraco todo dia.** As duas mostram; C levanta
   como pergunta (7); C4 levanta como pergunta (1). Honestidade contra sensação de
   cobrança — e não há medida de nenhum dos dois lados.
5. **Três lugares ou quatro.** Não é gosto puro — E2 decide parte —, mas a parte
   que sobra é dele.

### 4.4 · Uma coisa que o dono já decidiu, e que relativiza toda a seção 3

Está na orientação geral de `02-perguntas.md`, literal:

> "Então eu quero realmente fazer algo que não se preocupe tanto com o que já
> tinha. Então, a coisa que eu quero que tome cuidado é só mesmo **os dados. Os
> dados tem que manter sempre.**"

Eu registro isso aqui porque é a régua que ele mesmo deu, e ela se aplica
diretamente à minha seção 3: **das 14 perdas que eu nomeei, nenhuma é de dado.**
São perdas de forma, de mecanismo e de entrega. Pela régua dele, elas custam
trabalho e não custam histórico.

A contrapartida tem número, e é de C2: a preservação de dado passa pelos **seis
portões** de cada campo persistido novo, e os **372 casos de domínio** —
exatamente os que protegem a regra e a migração — **sobrevivem inteiros às duas
direções.** O risco de dado nesta troca é baixo e está mapeado. O risco de
regressão de capacidade está nos **513 casos de fluxo**, que quebram nas duas.

---

## 5 · As decisões que são dele, numeradas

Quinze. Cada uma traz **o que a prova diz** e **o que muda conforme a resposta**.
Eu não respondo nenhuma, e nenhuma ordem aqui é recomendação: estão ordenadas por
quanto muda o resto, não por importância.

Três delas (1, 2, 3) decidem **modelo** e precisam ser respondidas antes das
outras. Seis (4 a 9) são transversais: a resposta vale para C e para D igualmente.

---

### Decisão 1 · A decisão de programa volta para a academia, ou não? (E1)

**O que a prova diz.** Os quatro agentes do cerco, cegos entre si, convergiram:
E1 é a única exigência que cria defeito novo, e nas duas direções (§4.1). C1 tem
o número (alcança 37% a 58% das sessões), C2 o mecanismo, C3 a medida, C4 o
conflito escrito — as duas direções **recusam por escrito** perguntar sob o
relógio.

**E o que só eu podia acrescentar.** E1 **já existe no app de hoje**, como tela
própria (`src/ui/telas/decisao.jsx`), e o app **já resolveu** o número que C1
levanta: quando a sessão fecha sozinha, a pergunta fica guardada e volta na
abertura seguinte, nunca dentro de um treino novo (`src/main.jsx:627-643` e
`:2611`; nove casos em `tests/fluxo/promocao.test.js`). C2 detectou dois dos três
gatilhos lendo só os testes.

**O que muda conforme a resposta.**

- **Se sim (mantém E1):** em **C o conserto é de modelo** — C não tem momento de
  encerrar nos 11 estados do M1, e seria preciso inventar um que a direção removeu
  de propósito. Em **D é conserto de regra** — existe o cartão "Encerrar às 7h31",
  descrito e não desenhado. Nos dois casos, a Onda 5 deve **portar o mecanismo dos
  três gatilhos que já existe**, e não reinventá-lo; e vale o requisito de C3
  (E1-a: descartável sem responder, sem prender foco, alvo de dispensa ≥ 44 px).
- **Se não:** as duas direções ficam como foram desenhadas, e o produto **perde
  uma capacidade que hoje tem e que tem teste**. A mudança do dia espera numa fila
  que, pela pergunta 7 de D, não tem prazo. O risco nomeado é F280: descartar a
  mudança sem ele decidir.
- **Se parcial** (só a segunda metade de E1, o atalho na tela do dia): C1 diz que
  essa metade **já é nativa nas duas** e **não cria defeito nenhum**. É a resposta
  mais barata das três, e é a que mais se afasta do que ele pediu.

---

### Decisão 2 · O cartão único de D é inegociável, ou as linhas do dia viram alvo? (M-a)

**O que a prova diz.** Medido: as seis linhas do roteiro de D são `<li>` sem
controle e sem `role`, **numa tela em que o cartão, a água e o "Pôr em dia" são
botões** — então a inércia é desenho, não descuido de maquete (C1; eu conferi as
linhas). O custo de contornar: 1 toque para o peso, 2 para outra refeição, ≥2 para
uma tela que não existe (consertar o horário do dia), e **nenhum caminho desenhado**
para começar a sessão. C1 e C2 chegam à mesma conclusão por caminhos diferentes
**[convergente]**: "com a lista respondendo ao toque, todos esses números cairiam
para 1 sem mexer na regra" (C1); "o conserto é de graça em dado e em cálculo"
(C2), e o preço real é de densidade — as linhas têm 36 pt e precisam de 44, o que
tira uma linha e meia da lista.

**E o que só eu podia acrescentar.** **O app de hoje já faz isso.** Toda linha da
timeline tem caixa de marcar, corpo tocável e `···` de editar
(`src/ui/instrumento/timeline.jsx`). A inércia da lista de D é uma **regressão**
em relação ao vigente, não uma escolha nova.

**O que muda conforme a resposta.**
- **Linhas viram alvo:** M-a deixa de ser um custo (tudo a 1 toque), o atalho
  perigoso de pôr em dia deixa de ser a única saída, **e a regra do cartão de topo
  de D continua intacta** — ela é a melhor das duas neste ponto, porque cobre o
  descompasso medido entre o plano (16h00) e a vida dele (15h30, K4) sem supor a
  rotina do dono (C2). Preço: 1,5 linha de altura.
- **Cartão único inegociável:** todo contorno passa pela folha do achado D-1, que é
  a decisão 3.

---

### Decisão 3 · Fechar um dia passado: honesto e caro, barato e arriscado, ou a terceira saída que ninguém desenhou? (M-b)

**O que a prova diz.** Três números, todos medidos:

- **No caso desenhado, a premissa cai:** C custa **4 toques** e D custa **5**
  (C1; eu conferi que o `Guardar` de D é passo obrigatório). C não é a pior.
- **No caso que o registro real apresenta** — um dia com zero marcas, 11 vezes em
  14 — **C custa ~14 toques e D custa 1**. Para os 11 dias: ~154 contra 12.
- **O 1 toque de D é a direção que D descartou por escrito.** A folha abre com
  `S[m[0]] = {v:'tudo'}` nas seis refeições e o botão de guardar nasce habilitado:
  **dois toques declaram seis refeições inteiras**, de memória, dias depois. A
  própria D descarta a Direção A com as palavras "mente para a regra".
- **O risco tem precedente real:** F290/F292 — um dia em que ele saiu sem saber
  quanto comeu contou como registro e destravou um corte de comida.
- **Nenhuma das duas fecha o buraco do meio:** não existe, em nenhuma, uma forma
  **barata e honesta** de dizer "este dia eu não lembro" por refeição. C levanta
  como pergunta 3, D como pergunta 4, C4 como item 2 do que não decide
  **[convergente — C1, C4, e as duas direções]**.

**E o que só eu podia acrescentar, e muda o enquadramento inteiro.** **Hoje a
tarefa não existe.** Conferi: `diaDeComida()` carimba o dia com a data; na virada,
`fechaDiaDeComida` congela o dia no histórico e o novo nasce vazio;
`marcaRefeicao` escreve sempre em `S.dia.done`, que é sempre hoje. **Não há
superfície alguma para marcar uma refeição de um dia que passou.** Peso tem
("registrar ontem / registrar em ter 14", com a linha "neste dia: … · registrar
substitui"); treino passado tem tela própria; **comida, não.** U11 é a segunda
situação mais frequente medida (3,25 registros por semana), e hoje ela só existe
para metade do dia.

Então **os ~14 toques de C não se comparam a um número menor de hoje: comparam-se
à tarefa ser impossível.** E C2 registra que a função de escrita por data é
**barata** e é pré-requisito **das duas**.

**O que muda conforme a resposta.**
- **Honesto e caro (C como está):** a regra do nutricionista continua travada, e C
  assume isso por escrito (recusa 4). C1 é duro: "um fechamento de 143 toques não
  vai acontecer: a direção que mostra o buraco e cobra 13 toques para tapá-lo está
  medindo o fracasso com mais precisão, não reduzindo-o."
- **Barato (D como está):** a adesão pode inflar, e adesão inflada mexe na comida
  dele. Conserto de **regra** se for só o padrão da folha (abrir em branco em vez
  de em "tudo"); de **modelo** se a resposta for que o plano não pode pré-marcar
  nada — e aí cai a tese de D na metade da comida, que é justamente a metade onde
  o dado é lembrança e não observação.
- **A terceira saída** ("não lembro" por refeição, barato, sem virar adesão): é
  dado novo e **exige migração** (C2). Nenhuma das duas a desenhou, e as três
  vozes do cerco que a mencionam a tratam como a pergunta certa.

---

### Decisão 4 · Transversal · O que o "agora" escolhe quando ele está na porta da academia

**O que a prova diz.** Em C, a arbitragem escrita põe "refeição do plano sem marca"
(regra 3) **antes** de "manhã de dia de treino: começar o próximo" (regra 4) — eu
conferi a ordem no `direcao.md` §3. Como a comida quase nunca é marcada (1 dia em
22), o pré-treino sem marca dispara a regra 3 em praticamente todo dia de treino:
**a regra 4 de C é inalcançável no uso medido** (C1). O próprio desenho de C
contradiz a regra escrita no estado 10. E **nas duas direções, começar a sessão a
partir da tela do dia não tem alvo desenhado** (C1 **[o único achado que C1 marca
como igual nas duas]**).

**O que muda conforme a resposta.** Se a resposta é "treino ganha da refeição na
manhã de dia de treino", é conserto de regra nas duas e grátis. Se a resposta é
que o modelo de um-ato-por-vez de C não aguenta a ambiguidade, é conserto de
modelo em C — porque a refeição sem marca é o **estado permanente** do dado, não
uma exceção.

---

### Decisão 5 · Transversal · A janela de repetições depois de uma subida de carga

**O que a prova diz.** **[convergente — C1 e C3]** O mesmo caso quebra nas duas,
por caminhos opostos. A regra do treinador é F95: depois de subir a carga, "recomeça
perto da base (algo como 8/7/6)". Em **C**, os 7 botões se centram no último valor
(15) e mostram 12–18: **o 10 e o 11, que são o valor provável e estão dentro da
faixa prescrita, não estão na janela**; a saída custa 4 toques, contra o 1 toque
que é a tese da direção. Em **D**, a régua rola: **6 de 12 valores alcançáveis sem
arrastar**, e o 10 fica fora da tela à esquerda, com o sublinhado da faixa cortado
(C1 com a captura da própria D; C3 com a medida: 714 px de conteúdo em 382 px).
C3 classifica isso como 2.5.7 **limítrofe** e diz por quê.

C2 acrescenta o lado técnico, e ele **favorece C**: os sete botões fixos de C são
"vantagem técnica — sem ambiguidade toque/arrasto na ação mais frequente"; a régua
de D é "**o preço mais alto de D**: toque engolido como arrasto na ação mais
frequente (48/semana medidas)". A taxa de toque engolido: **não medida**.

**O que muda conforme a resposta.** É conserto de regra nas duas (onde a janela se
centra, e quantos valores mostra), mas C3 nomeia a tensão que não tem saída fácil:
"com 54 pt de alvo e 414 pt de tela, 12 números não cabem, e os dois requisitos —
alvo grande e faixa inteira à vista — não são simultaneamente satisfeitos pela
forma escolhida".

---

### Decisão 6 · Transversal · Correção, ou desfazer?

**O que a prova diz.** Em **C**, a correção é o princípio que paga o toque único
("a proteção contra o toque errado é a correção, não a confirmação") — e está
desenhada na série (estado 5, bem feita) e **não está desenhada na comida**: de
quatro tipos de linha em Hoje, só a hachura não colapsada carrega alvo visível
(C1). Em **D**, não há correção nos 14 estados: há "Desfazer", e ele **morre 20 s
depois de ele sair do app** (`Date.now()-hiddenAt > 20000` → `show('next')`) —
exatamente o instante em que ele volta do WhatsApp e nota o erro. E C3 mediu que
esse mesmo aviso **não é região viva** (R-D1): o Desfazer não chega a quem usa
leitor de tela.

A taxa de toque errado com a mão suada: **não medida** (C1, §7). Que corrigir é
ato real, o registro mostra: 16 registros de exercício apagados, e ~9 marcas de
apagado por semana desde 24/08.

**E o que só eu podia acrescentar.** `PRODUCT.md`, princípio 2: "**Não existe modo
de edição.** Todo objeto carrega a própria afordância de editar. Nada é
somente-leitura até você destravar." É doutrina vigente, e as duas direções a
perdem em parte.

---

### Decisão 7 · Transversal · O buraco aparece todo dia, ou some? (E3, e a cobrança)

**O que a prova diz.** E3 está bem resolvido nas duas, e C3 provou que **nenhuma
das duas marca estado só por cor**. Mas:

- **E3 fabrica buraco onde não houve buraco** (C1, e é das duas): enquanto não há
  sessão registrada, o tipo e o horário do dia são palpite; em ~1 dia por semana
  ele treina fora da manhã e em 3 de 20 dias prescritos a sessão não aconteceu.
  Nesses dias o palpite põe pré-treino às 5h45 e treino às 6h15, e E3 marca os
  três como buraco a manhã inteira — ~3 marcas falsas por semana. **Nenhuma das
  duas tem regra que diga quando um previsto que é palpite pode virar buraco.**
- **O cardio hachurado para sempre:** 0 de 16 prescritos em 8 semanas. As duas
  mostram a linha e a marcam, duas vezes por semana, indefinidamente. C levanta
  como pergunta 7; **D não levanta**.
- **E3 não cria defeito de acesso; revela um que C já tinha** (C3): a hachura de C
  mede **1,48:1** e, em dois lugares, é o **único** canal (os 14 quadradinhos e a
  fileira de dias), o que reprova pelo critério recebido. D cumpre E3 com três
  canais e o canal gráfico a 5,62:1.
- **A cobrança permanente:** a fila de pendências de C não tem regra de saída
  (C-3) e o contador parado em 0 aparece em 6 dos 13 estados de D e em **7 de 10 e
  no topo** em C (C-7/D-7). C4 proíbe pela voz: "faltou", "esqueceu", "atrasado",
  "pendente" e "pendência" estão na lista de palavras recusadas, e "Pôr em dia"
  está recusado **como nome de lugar** — ele propõe "Os 14 dias da regra"
  **[convergente — C1 pelo número, C4 pela palavra]**.

**O que muda conforme a resposta.** Se palpite não pode gerar buraco: conserto de
modelo nas duas. Se a hachura deve sumir no fim do dia: conserto de regra, e C
perde o retrato honesto que é a melhor coisa do desenho dela.

---

### Decisão 8 · Transversal · Nenhum número pelo teclado do sistema: ele aceita?

**O que a prova diz.** As duas recusam e **assumem o custo por escrito**: não dá
para colar, quem digita rápido perde o hábito, e quem usa leitor de tela encontra
um teclado que não conhece. C1 tentou derrubar e não conseguiu: "não achei caso de
uso medido em que isso quebre". C2 precifica como **caro** nas duas, com um
defeito que ele nomeia: **faltam os dígitos do teclado físico, para o notebook**
(U14, P11 — "eu utilizo bastante na web sim").

Mas C3 mediu o teclado que as duas construíram, e é a ironia do material: **em C,
as 13 teclas de 123 × 54 px têm como única separação uma linha de 1 px a 1,55:1**
(R-C1, item 3: "o teclado que a direção construiu para ser mais seguro é o pior
caso"); **em D, as 12 teclas têm preenchimento a 1,20:1 e borda zero** (D-5).
**[convergente — o mesmo defeito, nas duas, achado por um só agente, com medida.]**

**E o que só eu podia acrescentar.** O app de hoje usa o teclado do sistema e
**conhece o preço**: `DESIGN.md` manda "campo de texto nunca abaixo de 16px — o
Safari dá zoom ao focar, e a tela fica torta no meio de uma série". A troca é
real, e o ganho de D é nominal: C2 marca o teclado de peso com casa decimal fixa
("736" → 73,6) como "**ponto a favor**: mata F63 e F275 na entrada".

---

### Decisão 9 · Transversal · Três lugares ou quatro (E2)

Detalhado na seção 6. A decisão em uma frase: **em D o lugar próprio já existe e
custa zero em acesso; em C ele custa o critério que organizava a barra**, e C1
achou um dano de modelo que é só de C.

---

### Decisão 10 · O tema: claro ou escuro

**O que a prova diz.** **Nada, de nenhum dos dois lados.** As duas direções são
claras e passam contraste de texto nos dois temas (C3: zero reprovações em 1 526
elementos). O app de hoje é escuro e tem justificativa de uso **escrita** mas não
medida. A luz da academia **não está registrada** no repositório (C3, §7).

**O que muda conforme a resposta.** Nada no modelo. Tudo na forma. É gosto
informado, e é dele.

---

### Decisão 11 · A paleta e o movimento: quem decide, e quando

**O que a prova diz.** P12 é explícito e enfático, e as duas direções não empatam:
**D responde nominalmente** (anil, fonte do sistema, números tabulares, "o toque
afunda, o que confirma que pegou com a mão suada", declarado como resposta a P12);
**C não decide forma.** Ver §4.3, item 1.

**O que muda conforme a resposta.** Se ele escolher C, a resposta a P12 **não vem
na direção**: vem na Onda 5, com as funções de sistema visual e movimento. Se
escolher D, ela já está proposta e pode ser aceita ou recusada. E vale o aviso que
só eu podia dar: **o pedido de P12 contraria a doutrina vigente** (`DESIGN.md`
inegociável 6, "Quase nenhum movimento", com o que já foi recusado registrado em
`docs/design-review/05-movimento.md`). Atender P12 é mudar essa regra de
propósito, não por descuido.

---

### Decisão 12 · O que ninguém desenhou: aceita assim, ou exige antes de escolher?

**O que a prova diz.** Quatro coisas não foram desenhadas por **nenhuma** das duas
**[convergente — C1 e C3 listaram as mesmas]**:

| o que | por que pesa | o app de hoje |
|---|---|---|
| **A aula do box** (U7) | 3ª situação mais difícil; maior falha de detalhe (0 de 5 aulas com movimentos, 4 de 5 registradas depois do dia) | tem tabela de séries própria, com a coluna de RIR removida e medida por movimento |
| **Comparar fotos antigas** (U13) | é o que o dono diz fazer mais: "isso eu vejo bastante mesmo" (P8) | **pronto e no ar** (`src/ui/telas/comparar.jsx`), com o par mais nova × mais antiga e a pergunta de gordura na mesma tela |
| **A sessão de fotos a 3 m** (U9) | C3: "é o maior buraco de acesso que sobra"; depende de P7, sem resposta | existe |
| **Semanas (C) / Evolução (D) e Prescrição** | é onde vive a decisão de ±150 kcal, que nunca aconteceu (0 avaliações, 0 passos) | **pronto e no ar**: o veredito com os números que o produziram e o botão de aplicar |

C também **não desenhou a troca de exercício** (2ª situação mais difícil) **e não
a declarou** entre as cinco partes não desenhadas; D desenhou (M1-12). C3
acrescenta: dos lugares não desenhados, "não há pixel para medir", e C classifica
cinco partes como não desenhadas.

**O que muda conforme a resposta.** Se ele aceita decidir com isso em aberto, a
Onda 5 detalha — e deve **reaproveitar** o que já está no ar em três dos quatro
casos (§3.4). Se ele quer ver antes, o caminho que não contamina nada é pedir à
direção escolhida que desenhe o que falta, antes da Onda 5.

---

### Decisão 13 · Como pagar os 513 casos de teste de fluxo

**O que a prova diz** (C2, medido). Os **372 casos de domínio sobrevivem inteiros
às duas** — nenhuma direção muda uma regra. Os **513 de fluxo quebram nas duas**,
porque entram no app pelos quatro mecanismos que as duas removem (33/33 pela
entrada de navegação, 32/33 por seletor ou `id`, 31/33 por função interna, 24/33
pelos campos de texto por série). O esforço em horas: **não medido** — C2 diz isso
explicitamente. O destravamento que ele propõe: "harness por intenção, não por
elemento; repassar caso a caso".

**E o que só eu podia acrescentar.** Esses 513 são o que pegou as capacidades que
sumiram em quatro reescritas anteriores (F301). Reescrevê-los **é o risco real
desta troca**, e é o único lugar onde a régua do dono ("os dados têm que manter
sempre") pode ser violada sem ninguém perceber: perde-se capacidade, não byte.

**O que muda conforme a resposta.** Se forem repassados caso a caso, a troca é
segura e lenta. Se forem reescritos em bloco, é rápida e é o modo de falha
histórico deste projeto.

---

### Decisão 14 · As perguntas que as duas direções deixaram abertas, e que ainda são dele

As duas levantaram praticamente as mesmas, o que por si é informação. Nenhuma
precisa de resposta para a Onda 5 começar; todas mudam o que ela entrega.

| # | pergunta | quem levantou | o que está desenhado enquanto isso |
|---|---|---|---|
| 14.1 | **Hora-limite pessoal e opcional** (7h40, P2) | C (1), D (1) — e C1 nota que é o que tornaria a projeção de D útil | C: fim previsto com e sem cardio. D: projeção pelo ritmo de hoje, sem limite |
| 14.2 | **Guardar qual refeição saiu do plano** | C (2), D (2), C4 (3) **[as três vozes]** | o estado do dia; a refeição fica sem marca. **Exige migração** (C2) |
| 14.3 | **Separar "não comi" de "esqueci"** | C (3), D (4), C1, C4 (2) **[quatro vozes]** | os dois ficam "sem marca". É a terceira saída da decisão 3 |
| 14.4 | **"Não contei a água" diferente de zero copos** | C, D (3), C4 | leitura, não fato. **Barato como leitura, migração como fato** (C2) |
| 14.5 | **Porções além de tudo e metade** | C (5) | tudo e metade |
| 14.6 | **O previsto no horário real dele** (15h30 contra 16h00 do plano) | C (6) | horário do plano com janela larga. **A regra de D já resolve isso melhor** (C2) |
| 14.7 | **RIR em toda série ou só na última?** | D (5), C4 (7) — "é pergunta para o agente treinador" | em toda série, opcional |
| 14.8 | **O aviso de subir carga com o RIR fora do cálculo** | D (6), C4 (8) | a frase com o RIR da última vez ao lado |
| 14.9 | **Quanto tempo uma mudança do dia espera decisão?** | D (7) | espera indefinidamente. **A decisão 1 muda esta** |
| 14.10 | **Ele lê a tela a 3 m?** (P7 ficou sem esta parte) | D (8), C3, C4 (6) **[três vozes]** | nada desenhado nas duas. **Trava a sessão de fotos** (C2) |
| 14.11 | **Quais números da bioimpedância, e com que frequência as medidas com fita** | C (10), D, C2, C4 (5) **[quatro vozes]** | sem previsto. **C2: "a bioimpedância está bloqueada"** |
| 14.12 | **Revisão da semana num dia fixo (domingo)?** | D (9) | sempre disponível, sem convite |
| 14.13 | **Ceia** | C (4) | sem linha de ceia. É assunto do nutricionista (F2) |
| 14.14 | **O vencimento da aula**, que não existe no modelo | C2 (E3) | as duas a põem num dia; o dono pediu "nada muito fixo" (P4). **Barato por posição na sequência, migração por dia da semana** |

---

### Decisão 15 · A pergunta que eu devo fazer e não devo responder: a resposta é uma mistura?

O briefing me proíbe de fundir as duas e de propor uma quinta. Então isto vai como
**pergunta**, com o que se ganha e o que se perde, e sem desenho.

**Por que a pergunta é legítima aqui, e não seria em outro material.** As duas
teses abrem com a **mesma frase** (§1.1); as duas organizam por tempo e não por
assunto; as duas recusam a mesma lista de seis coisas. O cerco achou, nas duas, que
**os maiores defeitos de uma têm a solução desenhada na outra**:

| o defeito | em quem | está resolvido em |
|---|---|---|
| A lista do dia inerte (M-a) | D | **C** — três controles de 44 pt medidos nas linhas hachuradas (C2) |
| A correção do toque errado não existe | D | **C** — desenhada e nomeada como princípio (estado 5) |
| Fechar o app no meio do pôr em dia perde tudo | D | **C** — cada toque grava (C2: "único ponto das duas onde fechar o app perde trabalho") |
| A série guardada não é anunciada (R-D1) | D | **C** — 3 regiões vivas no M1 e 5 no M2, contra 2 e 2 em D, com a de M1 desligada por projeto (C3) |
| 178 `<svg>` sem nome e sem `aria-hidden` (R-D2) | D | **C** — o defeito não existe nela (C3) |
| O toque engolido como arrasto na ação mais frequente | D | **C** — os 7 botões fixos são "vantagem técnica: sem ambiguidade toque/arrasto" (C2) |
| O pôr em dia pré-marcado como "tudo" (D-1) | D | **C** — nada vira tinta sem um toque; proteção inteira (C1, item 4 do "o que aguenta") |
| Fechar um dia vazio custa ~14 toques (M-b) | C | **D** — mas pelo atalho que D mesma descartou por escrito |
| A hachura como canal gráfico único a 1,48:1 | C | **D** — tracejado a 5,62:1 (C3) |
| A regra do cartão do momento supõe o horário do plano | C | **D** — janela que cobre K4 sem supor a rotina do dono (C2) |
| E1 não tem onde morar | C (modelo) | **D** (regra) — e no app de hoje, pronto |
| A barra com lugar próprio para o corpo (E2) | C (quebra o critério) | **D** — zero custo de acesso, medido (C3) |
| A resposta a P12 (paleta, fluidez, movimento) | C (não decide) | **D** — proposta nominalmente |
| O valor provável não está na janela depois da subida de carga | **as duas** | **em nenhuma** (decisão 5) |

**O que se ganha** se a resposta for uma mistura: cada um dos treze itens
resolvidos acima tem solução **provada no material**, e não em especulação. A conta
é **7 defeitos de D com solução em C** e **6 de C com solução em D** — e o
décimo-quarto não tem solução em nenhuma, o que também é informação.

**O que se perde**, e é o que o briefing teme: **as duas direções são coerentes, e
a coerência é o que as torna julgáveis.** O "um ato por vez, no polegar" de C paga
a densidade menor que ela escolheu; a lista inerte de D é o preço do cartão único
que paga a tela mais limpa durante o treino — que é o que o dono pediu ("na hora do
treino pode ficar mais limpa"). Misturar sem um autor responsável pela coerência é
exatamente o modo de falha 2 do briefing, o rebrand: peças novas por cima de um
modelo que ninguém assinou.

**Então a pergunta, nestes termos:** *ele quer escolher uma direção inteira e
mandar consertar os defeitos dela com os números que o cerco deu — ou quer
encomendar uma direção que assuma as duas, com um autor, sabendo que isso é uma
Onda 2 nova e não uma Onda 5?* **Não é minha para responder, e eu não desenhei
nenhuma das duas saídas.**

---

## 6 · O estado das três exigências depois do cerco

As três entraram como dadas. Nenhum dos quatro as cancelou, e eu também não. O que
segue é o que elas custam em cada direção, com o que os quatro mediram — e, onde eu
pude conferir no app de hoje, o que isso acrescenta.

### E1 · A decisão de tornar permanente aparece ao encerrar o treino, mais um atalho discreto na tela do dia

**Veredito do cerco: é a única exigência que cria defeito novo, e nas duas
direções. Os quatro chegaram nisso, cegos entre si, por quatro caminhos.**

| quem | por que caminho | o que achou |
|---|---|---|
| **C1** | número de uso | Alcança **37% a 58%** das sessões (7/12 em P1-B; 10/27 em P1-A). E o instante é o **nº 1 em dificuldade** do produto: 5 das 7 condições adversas ao mesmo tempo, incluindo "decisão nova sob pressão" |
| **C2** | mecanismo e teste | **barato — "a mais barata" das três.** Mas: "sem o gatilho da abertura seguinte, E1 não existe na maioria dos casos de P1-A — e descartar a mudança sem ele decidir é F280". **Destrava: manter os três gatilhos; o código já tem dois, com nove casos de teste** |
| **C3** | medida de pixel | "**'Discreto' é a palavra que produz o defeito.**" O que é discreto nos dois desenhos é exatamente o que já reprova: em C, `.gb` a **40 × 44** e borda a 1,38:1 (o único alvo abaixo de 44 do arquivo); em D, `.map` a **30 px** e `.daytype` a **36 px**, 12 alvos abaixo de 44 |
| **C4** | conflito de texto | "As duas recusam explicitamente perguntar ao fim da sessão." E registra sem resolver: "é decisão do dono" |

**O custo por direção.**

- **Em C é conserto de modelo.** O M1 de C **não tem momento de encerrar** nos 11
  estados: "a sessão fecha sozinha na última série e o fim se confirma na abertura
  seguinte". E1 precisa inventar um momento que C removeu de propósito.
- **Em D é conserto de regra.** Existe lugar nomeado para pendurar — "depois da
  última série do último exercício, o cartão vira 'Encerrar às 7h31'" —, descrito e
  não desenhado.
- **A segunda metade de E1 — o atalho na tela do dia — já é nativa nas duas e não
  cria defeito nenhum** (C1): em C é a fila de pendências no topo de Hoje; em D é
  "Para decidir com calma" (M1-13).

**O que eu acrescento, conferido no código, e que nenhum dos quatro podia ver.**
E1 não é uma ideia nova a ser avaliada: é **a restauração de um comportamento
vigente, testado**. A tela é `src/ui/telas/decisao.jsx` ("O que fica no programa?",
decisão por decisão, "só hoje" / "levar para o oficial", motivo opcional). E o
número de C1 **já está resolvido** no app: quando a sessão fecha sozinha, a
pergunta é guardada em `S.promoPendente` e volta na abertura seguinte, **com guarda
explícita para nunca aparecer no meio de um treino novo**. Conferi os nove casos de
`tests/fluxo/promocao.test.js`, que é a contagem exata que C2 citou sem ter visto o
código de interface.

**As palavras já existem também**, e C4 as reescreveu do zero quase iguais: ele
propõe "**Só hoje**" / "**Entra no Treino A**" e "Por quê? (opcional)"; o app diz
"só hoje" / "levar para o oficial" com "motivo (opcional)". **[convergente — C4 e o
app de hoje, sem canal entre eles.]**

**Requisitos que ficam de pé, de C3**, qualquer que seja a resposta da decisão 1:
a decisão ao encerrar não pode prender o foco nem cobrir o elemento focado, tem de
ser descartável sem responder, com alvo de dispensa ≥ 44 px (2.1.2, 2.4.11, 3.3.4);
e o atalho "discreto" tem de ficar ≥ 44 × 44, com limite ≥ 3:1, **com nome
escrito** e nunca como ícone sem rótulo — porque em D há 178 `<svg>` sem nome "à
espera".

---

### E2 · Peso, medidas e fotos têm lugar próprio

**Veredito do cerco: em D sai de graça; em C custa o critério que organizava a
barra, mais um dano de modelo que é só de C.**

| quem | o que mediu em **C** | o que mediu em **D** |
|---|---|---|
| **C1** | **Dano duplo, e um é de modelo.** (a) A decisão de ±150 kcal precisa **ao mesmo tempo** da saída da regra com os números (F215) e da avaliação visual do par de fotos (F220); C põe as duas em Semanas, lado a lado. Tirando as fotos, **as duas metades de uma decisão passam a morar em dois lugares** — e essa decisão nunca aconteceu nenhuma vez (0 avaliações, 0 passos). (b) A pesagem medida acontece **dentro da sessão** (7 de 11 entre 6h28 e 7h52): se a linha do roteiro sair para o lugar novo, o caminho medido passa a custar **~3 toques a mais numa tarefa que hoje é 1**. (c) O critério "por tempo, não por assunto" deixa de explicar a barra | **Custo zero na leitura, não zero na escrita.** Evolução já reúne peso, medidas, bioimpedância e fotos — mas a própria tabela de D a declara "**notebook, sobretudo**", enquanto a escrita do peso fica espalhada por Agora, sessão e Dias. "O lugar próprio existe para ler e não existe para escrever, e o que falha no medido é escrever": **36%** das pesagens com data passada em P1-B, **50%** em P1-A |
| **C2** | **barato no lugar, exige migração no conteúdo.** `S.body` é fechado em duas chaves (`tipos.ts:481`, `sincronia.ts:88`, `:476`, `:35`): quatro pontos mais os seis portões. **A bioimpedância está bloqueada** porque o dono não disse quais números (P6/D2). E o alerta: "**o lugar próprio não pode tirar a entrada rápida de dentro da sessão**" | idem; "**já satisfaz E2 sem mexer em critério**" |
| **C3** | **A barra de 3 vai a 4 e não cria reprovação de alvo**: medi `138 × 50 px` hoje; com 4 colunas em 414 px, `103,5 × 50` — acima de 24 (norma) e de 44 na altura (corpo). O que aperta é o **texto**: com o texto do sistema ampliado, **não medido** — o quarto lugar não existe no HTML. E **E2 agrava o R-C3**: a barra de C não tem `aria-current`, então passa de 3 para 4 links iguais | **Passa e está medido**: `repeat(4,1fr)`, 4 itens de **104 × 50 px**, `aria-label="Lugares"` e `aria-current="page"`. "**E2 não custa acesso nenhum à D**" |
| **C4** | **O nome é "Corpo"** — cinco caracteres, cabe nas fatias de 138 pt de C e de 103 pt de D. A palavra sai dos próprios fatos ("fotos do corpo", F226) | idem. E mantém "**Evolução**" em D "porque é a palavra do dono": "quero registrar essa evolução" (P6), "eu gosto de acompanhar esse tipo de evolução" (P8) |

**O que eu acrescento, conferido.** Duas coisas.

1. **O nome que C4 propôs do zero já é o nome vigente.** A aba `dados` do app de
   hoje tem três modos — `corpo · treino · comida` — e o comentário na fonte diz
   por que corpo é o padrão: "**CORPO é o padrão porque é onde mora o veredito** —
   a única coisa desta tela que pede uma AÇÃO, e a que responde 'e agora?' antes de
   'como está?'" (`src/ui/telas/dados.jsx`). **[convergente — C4 e o app, sem canal.]**
   Ou seja: E2 não cria um lugar novo no produto; ele **promove a submodo que já
   existe** à barra.
2. **Eu posso dar a linha de base que C1 não tinha para o item (b).** Hoje, pôr o
   peso durante a sessão **já custa cerca de 3 toques**: sair para outra aba (1),
   registrar (1) e voltar pela faixa da sessão (1) — a `FaixaDaSessao` existe
   exatamente para isso, e o comentário dela diz o porquê: "Registrar é só metade
   do uso da academia: entre séries ele marca água, confere o que falta comer, olha
   o peso. Voltar custava achar a aba e depois achar o exercício"
   (`src/ui/instrumento/faixasessao.jsx`). **As duas direções levam isso para 1
   toque dentro da própria sessão** — C pela folha "Dia", D pelos chips do
   "enquanto descansa". Então o risco que C1 e C2 nomeiam é concreto: **E2 pode
   desfazer o maior ganho medido das duas direções nessa tarefa e devolver o custo
   ao que ele é hoje.**

**A saída que os dois agentes apontam, por caminhos diferentes [convergente — C1 e
C2]: o lugar próprio é para ler; a escrita rápida fica onde o uso medido
acontece.** Nenhum dos dois propõe tela, e eu também não.

---

### E3 · O que passou sem registro aparece marcado

**Veredito do cerco: é a parte mais bem resolvida dos dois desenhos, e a única
exigência que não cria defeito de acesso. Mas ela revela um defeito em C e fabrica
um buraco falso nas duas.**

| quem | o que achou |
|---|---|
| **C1** | "Nativo nas duas, e é a parte mais bem resolvida dos dois desenhos." O defeito que E3 cria é um só e é das duas: **E3 fabrica buraco onde não houve buraco.** Enquanto não há sessão registrada, o tipo e o horário do dia são palpite; em ~1 dia por semana ele treina fora da manhã (8 de 28) e em 3 de 20 dias prescritos a sessão não aconteceu. Nesses dias, E3 marca pré-treino, treino e água do treino como buraco a manhã inteira: **~3 marcas falsas por semana.** "Nenhuma das duas direções trata disso" |
| **C2** | **barato em 4 dos 6 casos**, com três defeitos nomeados: (a) **a aula não tem vencimento no modelo** — a sequência diz qual treino, nunca quando (F81), a cadência não guarda letra, e o dono pediu "nada muito fixo" (P4); as duas a põem num dia. Destrava barato por posição na sequência, ou **exige migração** por dia da semana, e aí **contraria P4**. (b) **o cardio previsto não existe como dado** — é preciso uma tabela por letra de treino. (c) **a água não distingue zero de não contado** — barato como leitura, migração como fato |
| **C3** | "**Nenhuma das duas marca estado só por cor**" — isso as duas resolveram. Mas **C marca por textura só**, em dois lugares (os 14 quadradinhos e a fileira de dias), e a textura mede **1,48:1** no claro e 1,67:1 no escuro: **reprova** pelo critério recebido (R-C2/C-4/C-5). **D cumpre E3 com três canais** e o canal gráfico a **5,62:1**. "O E3 não cria defeito de acesso em nenhuma das duas. Ele revela um que já existia na C" |
| **C4** | Dá as palavras, e elas são o antídoto da cobrança: "**sem marca**" (é a ausência do registro, não do ato), "**dia conhecido**" / "**desconhecido**" (palavras literais da regra), "**pulado**" para decisão declarada, "**não contei**" para a água, "**não sei quanto**" para a ignorância dele. E recusa, com motivo: "pendente", "pendência", "faltou", "esqueceu", "atrasado", "0" onde o dado é desconhecido, e **"Pôr em dia" como nome de lugar** — "nomeia uma dívida e apareceria em 13 das 14 células" |

**O que eu acrescento, conferido.** **Metade de E3 já é doutrina vigente, e a
melhor metade.** O domínio do app de hoje distingue silêncio de zero com uma
clareza que as duas direções não superam — `fechaDiaDeComida`, em
`src/main.jsx:1871-1875`: "Dia sem NADA… não vale uma linha no histórico — **e guardá-lo
como zero seria dizer que ele não comeu, que é o erro de medição que confunde
silêncio com falha**". E o buraco **é** mostrado: a `Sparkline` tem 14 fatias — a
janela exata da regra — e "as fatias vazias continuam como trilho: **os buracos no
registro são visíveis de propósito**" (`primitivos.jsx:130`). A regra de 11 em 14
está em código, nomeada: `MIN_REGISTRADOS = 11` (`src/dominio/corpo.ts:135`).

**O que falta hoje, e é o que E3 de fato entrega:** o estado "sem marca" **na linha
da refeição**, com forma e palavra. Hoje a marca é binária (`done[id]` é 1 ou
ausente) e a linha não tem como dizer a diferença entre "não comi" e "não disse".
**As duas direções entregam isso, e é um ganho real sobre o vigente** (§3.2, item 2).

---

## 7 · O que eu não conferi, e o que fica sem medida

Para não deixar número sem procedência, que é a regra desta casa.

**Números de agente que eu não reconferi** (estão marcados assim no texto): as
contas de C1 sobre P1 (37%/58% de encerramento, ~3 marcas falsas por semana, os
~10 min de oscilação da projeção, os 12 contra 9 blocos de densidade); as
contagens de contraste e de alvo de C3 (eu confiei no método, que ele descreveu,
inclusive a neutralização do encaixe que falseava os botões de D em 0,426); e as
contagens de acoplamento de C2 (33/33, 32/33, 31/33, 24/33). **Eu reconferi** os
toques dos protótipos nos pontos de M-a e M-b, a ordem das seis regras do "agora"
de C, a lista das cinco partes não desenhadas de C, e a contagem de nove casos em
`tests/fluxo/promocao.test.js`.

**Não medido, por ninguém:**

- a taxa de toque errado com a mão suada (pesa nas decisões 5 e 6);
- a taxa de toque engolido como arrasto na régua de D (C2: "precisaria de aparelho
  e de dedo — idealmente suado");
- a frequência de subida de carga (decisão 5): C1 usou estimativa, **marcada**;
- as horas-pessoa dos 513 casos de fluxo (decisão 13);
- a luz da academia, a luva, o magnésio (`01-fatos.md` linha 1474) — o que torna a
  decisão 10 gosto informado e não escolha técnica;
- as necessidades de acessibilidade do dono (`01-fatos.md` linha 1475): tudo em
  C3 é **piso para qualquer usuário**, não resposta a uma necessidade conhecida;
- VoiceOver no iOS de verdade (C3 mediu a árvore em Chromium);
- o layout dos dois a 200% de texto, e o quarto lugar da barra de C com E2;
- a frequência de uso no notebook (U14) e de comparar fotos antigas (U13): o dono
  disse "bastante" (P8, P11), **não contado**;
- o que ele nunca deixa de registrar sob pressão (P12 ficou sem essa parte) — sem
  isso, C1 registra que "não dá para dizer qual das duas protege melhor o dado que
  ele mais quer".

**O que eu não fiz, por mandato:** não criei uma quinta direção, não fundi C com D,
não escolhi campeã e não respondi nenhuma das quinze decisões. Onde eu achei que a
resposta podia ser uma mistura, está escrito como pergunta (decisão 15), com o que
se ganha e o que se perde, e sem desenho.
