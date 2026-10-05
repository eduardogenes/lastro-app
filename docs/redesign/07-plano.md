# 07 · Plano do detalhamento — para o dono aprovar

A escolha está feita: **vai a Direção D**, com três peças da C como requisito, a
régua de repetições da D com o defeito dela para consertar, a folha de pôr o dia
em dia abrindo pré-marcada mas **como sugestão até o toque**, e as 28 respostas da
parada 3. Este arquivo não detalha nada: ele diz **o que trava, quais são as
frentes, em que ordem, e como a troca chega ao app que existe** — a parte que só
quem vê os dois mundos pode escrever.

Não há estimativa de prazo em nenhuma linha. Ninguém mediu isso.

## 0 · A convenção de prova

- **conferi** — eu abri o arquivo nesta sessão e contei, com o caminho ao lado.
- **do cerco** — repito um agente (C1 a C4) sem reconferir. Fica marcado.
- **não medido** — ninguém mediu, e eu não invento número.

---

## 1 · O que está em aberto

### 1.1 · As oito que são dele

Ordenadas pelo que travam, não pelo tamanho.

| # | a pergunta | o que trava | o que muda conforme a resposta |
|---|---|---|---|
| 1 | **O vencimento da mudança do dia.** Ele disse "vence em alguns dias" (14.9); a D desenhou "vence quando aquele treino volta" (4 a 7 dias, por posição na sequência). E falta dizer **o que acontece no vencimento**: virar "só daquele dia", dito e desfazível (desenhado), ou não vencer nunca (o desenho anterior da D) | a tela de Prescrição inteira, e o aviso da manhã daquele treino | Se o prazo for número fixo de dias, a mudança vence num dia em que ele não vai àquela academia refazer nada — e o prazo precisa de um carimbo novo no dado. Se for por posição, sai de graça do que o modelo já sabe. **Sem resposta, F280 volta**: a mudança descartada em silêncio é o defeito que ele mesmo mandou recusar, e com a pergunta do fim do treino removida (D1) **nada mais consome a mudança pendente** — ver §3.6 |
| 2 | **A ceia conta na adesão do dia?** Ele respondeu "sim" à ceia e "é assunto do nutricionista" — as duas coisas, nenhuma delas esta | a contagem de adesão na tela de Semana, e a regra do nutricionista | Muda o **denominador** de todo dia: um dia com cinco de seis refeições deixa de ser o mesmo dia. E muda **para trás**, porque a adesão histórica já está congelada por dia (`DiaComidaHist.tot`/`.pv` — disciplina do total congelado, `src/dominio/nutricao/tipos.ts`, conferi) |
| 3 | **"Não comi" conta como dia de consumo conhecido?** Ele separou "não comi" de "esqueci" (14.3) sem dizer isto | a mesma contagem, e o portão de 11 de 14 (`MIN_REGISTRADOS = 11`, `src/dominio/corpo.ts`, conferi) | Se contar, o portão que **nunca abriu uma vez** passa a ser alcançável. Se não contar, um dia honesto vale menos que um dia esquecido |
| 4 | **Quais porções, além de tudo e metade?** Ele disse "sim" a mais de duas (14.5), sem dizer quais. "Comi mais que o plano" é a que pesa | a régua curta de porções, e a aritmética da adesão | Uma porção acima de 1 faz a adesão passar de 100% (ponderação por porção, F199, **do cerco**). **Não pede migração**: `escala` já é `Record<string, number>` no dia corrente e no histórico (conferi) |
| 5 | **A lista de campos da bioimpedância**, cada um com unidade e se aceita ficar vazio. A resposta de 14.11 veio em prosa, e "distribuição por segmento" é tabela, não número. A própria D entregou "treze números" com quinze campos, e o desenhista achou o próprio erro | **a única migração que abre `S.body`**, e com ela o maior bloco da tela de Corpo | `S.body` é `{ peso, cintura }` — duas chaves, fechadas no tipo (`src/dominio/tipos.ts:481`) **e na fusão** (`base.body = { peso: [], cintura: [] }`, `src/dominio/sincronia.ts:475-482`, conferi). Abrir essa forma é trabalho de uma vez; abrir duas vezes é pagar os seis portões duas vezes |
| 6 | **As linhas do dia tocáveis valem durante a sessão aberta?** Achado meu: hoje o app tira a caixa de marcar e o `···` de toda linha de refeição **enquanto o treino está ativo**, de propósito (`aoMarcar={treino ? null : …}`, `src/ui/telas/hoje.jsx:120`, conferi) | a regra do Agora durante a sessão, onde ela encontra "o treino ganha da refeição" (D4) | É a única parte do requisito das linhas tocáveis que não é "devolver o que o app já faz" (§3.3). Se valer durante a sessão, a tela que ele pediu mais limpa na hora do treino fica menos limpa |
| 7 | **A régua de repetições, se o conserto não bastar.** O defeito é dele por consequência: a alternativa medida como melhor nesse ponto era o controle de botões fixos da C, que ele recusou ao escolher a régua | nada agora; trava a frente 2 se a medição depois do conserto continuar ruim | Se o toque continuar sendo engolido como arrasto na ação mais frequente, a saída é um controle que ele já viu e não quis — e isso volta à mesa dele, não à do detalhamento |
| 8 | **A pesagem entre séries: só na tela nova, ou lá também?** Ele mandou tudo para a tela nova (D9) e, na mesma folha, escreveu "prefiro o mínimo de toques" | nada estrutural: a D desenhou o atalho do descanso abrindo Corpo | Custa ~1 toque a mais na pesagem da manhã, que é onde 7 de 11 pesagens aconteceram entre 6h28 e 7h52 (**do cerco**, P1). Ele já viu esse custo escrito e decidiu assim mesmo; fica aqui porque a nota dele contradiz a decisão dele |

### 1.2 · O que pode ser decidido durante o trabalho

Cada um com quem decide, e nada aqui volta à mesa dele a menos que mude uma regra.

- **Até quando um previsto que é palpite pode virar buraco** — ele adiou isto
  para o detalhamento (decisão 7). **Nenhuma das duas direções tem essa regra**, e
  sem ela o dia fabrica marca de buraco onde não houve buraco (~3 marcas falsas por
  semana, **do cerco**) e o cardio fica hachurado para sempre (0 de 16 prescritos
  em 8 semanas). A frente 1 **propõe** a regra; como ela decide quando um palpite
  vira dado declarado, a proposta volta a ele — como proposta, não como pergunta.
- **A janela visível e a política de encaixe da régua** — frente 2, com medição.
- **Onde mora o relógio** nos cabeçalhos. O protótipo descobriu que o app não
  tinha relógio nenhum e que a projeção de fim de sessão não se confere sem ele.
- **O cabeçalho da sessão aberta fora do horário** ("aberta desde 6h20 · última
  série às 6h57"): desenhado no protótipo, é regra de render.
- **As palavras das superfícies novas** — frente 3. Sobem à mesa dele só as que
  nomeiam uma regra (vencimento, adesão, portões da semana).
- **Quais dos quatro movimentos sobrevivem a `prefers-reduced-motion`** — frente 4.
- **Se a frase da conta de volume muda de texto** ao sair da folha de edição para
  a Prescrição. É função de domínio com 13 casos de teste (§3.3).
- **A ordem interna da tela de Corpo** depois que a lista de campos existir.

### 1.3 · Quatro pendências que eu destravei conferindo o código

Estavam registradas como conflito ou bloqueio e não são.

1. **O tema escuro da D existe, desenhado.** O registro da parada 3 diz que as
   duas direções desenharam só o claro. Conferi: `momento-1.html` e
   `momento-2.html` da D trazem o conjunto escuro completo, nos dois caminhos
   (`@media (prefers-color-scheme: dark)` e `:root[data-theme="dark"]`), e as seis
   telas da segunda rodada mostram claro e escuro em cada estado. O que **não**
   existe é medida de contraste do escuro nas telas novas: **não medido**.
2. **Ler a tela a 3 m não trava a sessão de fotos.** A D desenhou a hipótese "não
   lê" como padrão e a leitura como camada por cima; nenhum estado precisa ser
   redesenhado se a resposta vier. A pergunta segue aberta e **custa nada** —
   sai da lista de bloqueios.
3. **A foto do corpo não é apagada a cada publicação.** O registro da onda 1 diz
   que a ativação de versão nova apaga o cache das fotos. Conferi: hoje
   `src/sw.js:28` tem `const FOTOS = ['lastro-fotos', 'treino-fotos']` e a limpeza
   os poupa (`FOTOS.indexOf(k) < 0`), com três asserções em
   `tests/fluxo/publicacao.test.js:70-78`. Foi corrigido em `c7899c0`. **Não é
   pendência.**
4. **As porções acima de 1 não pedem migração** (ver 1.1 #4).

---

## 2 · As frentes

O briefing nomeia quatro: arquitetura de informação e fluxo, interação e estados,
sistema visual e tokens, e movimento. **O escopo sai do que a D pediu**, e o que
a D pediu não é essa lista: **movimento não se sustenta como frente** e faltam
duas. Ficam cinco, nesta ordem.

### Frente 0 · A rede — prova e dado

**Produz:** (a) a lista branca da importação fechada e sob asserção — **feita em
`6035a5c`**; (b) o inventário dos casos de fluxo, um grupo por linha — **feito em
`08-rede.md`**; (c) a superfície de verbos
estável, com os casos que não dependem de pixel repontados e verdes **ainda sobre
a interface de hoje**; (d) uma migração única, com fixture.

**Primeira, inteira.** Nenhuma das quatro depende de desenho — só a (d) espera a
lista de campos da bioimpedância (1.1 #5). É a frente que faz todo o resto ser
reversível, e é o §3 deste arquivo.

### Frente 1 · Arquitetura de informação e fluxo

**Produz:** os cinco lugares (Agora, Dias, Corpo, Semana, Prescrição) e o que
cada um possui; a sessão como modo com **saída própria**; a regra de precedência
do cartão de cima; e onde aterrissam as três peças da C.

**Por que ela é a primeira de desenho:** a D partiu "Evolução" em Corpo e Semana
porque o corpo deixou de ser leitura e passou a ser registro — quatro lugares
viraram cinco. E porque o protótipo achou o defeito mais básico de todos: **a
sessão não tinha saída.** Na janela inteira, instalado no iPhone, não há barra de
navegador, e o dedo ficava preso dentro do treino, sem caminho para a comida. O
conjunto de lugares também é por onde todo teste de fluxo entra no app (33 de 33,
**do cerco**), então a frente 0 precisa dela definida para repontar a entrada.

### Frente 2 · Interação e estados

**Produz, e é a maior:**

1. **A régua de repetições consertada e medida** — o defeito é o preço mais alto
   da D: 6 de 12 valores sem arrastar e o toque engolido como arrasto na ação mais
   frequente (**do cerco**; a frequência do engolimento é **não medida**, e exige
   aparelho e dedo). Conferi no protótipo: `scroll-snap-type: x proximity` — não
   `mandatory` — e três `overflow-x: auto`. Soma-se a isso o `scrollLeft` perdido
   a cada render do cronômetro vizinho (**do cerco**).
2. **As linhas do dia como alvo** (peça 1 da C), com a resposta de 1.1 #6.
3. **Cada toque grava, sem botão de guardar no fim** (peça 2 da C).
4. **A folha de pôr o dia em dia**: abre pré-marcada **como sugestão**, nada é
   registro até o toque, um toque em qualquer linha fecha o dia, e as refeições
   que ainda não aconteceram ficam desabilitadas (achado do protótipo).
5. **Corrigir no lugar com alvo**: cada número guardado vira botão dentro da
   tabela, e a régua ganha um segundo estado — o valor guardado em tinta cheia,
   marcado "agora", ao lado da "última". **Esse estado não existe em nenhum dos
   oito HTML**: nasceu no protótipo. E a correção **não reinicia o descanso**.
6. **O teclado misto** (D8): próprio onde atrapalha, do sistema onde não.
7. **Os estados ruins de pé** — erro de gravação, carregando, máquina ocupada,
   dor, pular, deload, encerrar. Estão desenhados nos oito HTML e o protótipo os
   deixou como becos desabilitados: nunca foram tocados por ninguém.

**O piso de acesso é portão desta frente, não acabamento.** Alvo de 46 px para
controle repetido (padrão interno do contrato vigente), nome acessível em todo
controle, e as duas medidas que **ninguém fez**: 320 px de largura e 200% de
texto.

### Frente 3 · As palavras — a frente que faltava

C4 propôs a voz do zero e escreveu as palavras **dos dois momentos**. As seis
telas da segunda rodada, as três peças da C, o vencimento e os portões da semana
têm palavras escritas pelo desenhista, não pela voz. **Produz:** as palavras das
superfícies novas contra a voz, e o nome dos cinco lugares. Corre em paralelo com
a frente 2 a partir do momento em que os estados existem. Sobem à mesa do dono só
as frases que nomeiam uma regra.

### Frente 4 · Sistema visual, tokens — e movimento como seção dela

**Produz:** os tokens extraídos dos nove HTML da D, nos dois temas (que existem,
1.3 #1); a escala, o alvo e o foco; e o movimento.

**Movimento não é frente.** A D propôs quatro gestos com função — a cortina que
diz onde está o corte, o clarão do disparo, o anel que esvazia, o toque que
afunda — e a regra de que nada se mexe sozinho sem dizer alguma coisa. É uma
seção de um documento de sistema visual, com `prefers-reduced-motion` como
portão. Abrir uma frente para isso convidaria a inventar movimento que a direção
não pediu.

---

## 3 · Como isto chega ao app que existe

A régua do dono é uma: **os dados têm que manter sempre.** Tudo nesta seção
serve a ela.

### 3.1 · A primeira coisa a construir

**Fechar a lista branca da importação, e pô-la sob a mesma asserção que a
exportação já tem.** Antes de qualquer linha de interface.

Conferi, contando os três lugares: o `Estado` tem **32 chaves de topo**
(`src/dominio/tipos.ts:472`); a **exportação** carrega as 32, e essa lista está
travada por asserção em `tests/fluxo/dados.test.js:50-90`; a **importação**
(`src/main.jsx:3458-3486`) lista 26 e **derruba 6**:

```
ajusteHist   o ledger do ajuste calórico — de onde veio cada passo
aulas        os modelos de aula do box
comidaHist   TODOS os dias de comida já fechados
gordura      as leituras de gordura visual — o sinal que destrava o corte
protocolo    a ordem das poses e as sessões de fotos
quadro       a lousa do dia em curso
```

A exportação é protegida por teste; **a importação não tem asserção nenhuma.**
Então hoje a cópia de segurança carrega os seis para fora e restaurá-la os joga
no lixo — e **sem erro nenhum na tela**: logo depois, `normalizaEstado()`
(`src/main.jsx:311`) devolve os seis vazios, cada um na sua linha (`S.aulas = []`,
`S.comidaHist = []`, `S.quadro = null`, …), conferi. O app abre inteiro, limpo, e
não diz nada. É o F251, agora com a lista exata e com o mecanismo.

Isto é a primeira coisa porque o trabalho inteiro vai para o aparelho dele por
cima do app que ele usa, e **o caminho de volta é exportar e importar.** Enquanto
esses seis não entrarem, o caminho de volta perde o histórico de comida inteiro.
Custa uma lista e um teste, não depende de nenhuma resposta dele, e não é
desenho.

### 3.2 · O inventário dos 513, e a forma que ele precisa ter

> **Retificado em 05/10 por `08-rede.md`, que mediu em execução em vez de por
> leitura de código.** São **514** casos, não 513 — o commit `6035a5c`
> acrescentou um. E são **220** que não tocam a tela (177 por verbo, 43 por
> leitura), não 203: rodando a suíte instrumentada, dez casos tocavam a tela sem
> marcador textual nenhum. Os números abaixo são os da medição por leitura e
> ficam como registro; os que valem estão em `08-rede.md`.

O dono escolheu reescrever em bloco **com uma rede antes**: uma linha por grupo,
dizendo o que o grupo protege. Medi a pasta para a rede ter forma:

- **513 casos em 33 arquivos** (`tests/fluxo/`), e **372 em `tests/dominio/`** —
  contei os dois. Os 372 **sobrevivem inteiros**: nenhuma decisão do dono mudou
  uma regra.
- Dos 513, **203 não mencionam elemento de tela nenhum** dentro do caso (sem
  `$`, `texto`, `clicar`, `digitar`, `preencher`, `querySelector`). Deles, **161
  chamam um verbo do modelo por nome** — `marcaRefeicao`, `diaDeComida`,
  `addSet`, `mudaSeries`, `progSeries`, `abreProtocolo` — e **42 só leem dado,
  estado ou o próprio fonte**. Os outros 310: 35 só tocam em tela, 276 tocam nas
  duas coisas, 15 em nenhuma (são asserções sobre o build).
- **O verbo já é a intenção, e já existe:** `CTX`, em `src/main.jsx:1962`, tem
  **180 verbos** (19 no literal, 161 acrescentados depois), e **66 deles são
  chamados por 17 dos 33 arquivos**.

Isso dá a forma da rede: **uma linha por arquivo — 33 linhas —, e em cada linha
o que ele protege mais quantos dos seus casos sobrevivem como intenção.** Não
"uma linha por tela": tela é exatamente o que vai mudar.

O modelo de como essas linhas se escrevem já está no repositório. Os nove nomes
de `tests/fluxo/promocao.test.js` são, eles mesmos, o inventário daquele grupo —
"sessão que morre sozinha guarda a pergunta para a próxima abertura", "a pergunta
guardada não interrompe um treino em andamento". Quem escrever a rede copia esse
padrão.

### 3.3 · O que pode ser feito por partes, com o app de hoje de pé

Isto é o que impede a reescrita em bloco de ser um salto no escuro: quatro coisas
que entram **antes** de existir tela nova, com os 513 ainda verdes.

1. **A lista branca da importação** (§3.1).
2. **A superfície de verbos.** `CTX` já é o arrame por intenção que o cerco pediu
   — só não é estável nem alcançável sem a ponte de escopo do harness. Dar a ela
   nome, contrato e entrada direta, e **repontar os 203 casos que não dependem de
   pixel**, é trabalho que acontece com a interface de hoje na tela: se um desses
   casos fica vermelho, o erro é da reponta, não do redesenho. Depois, a reescrita
   em bloco só precisa manter os verbos.
3. **A função pura que escreve um dia de comida de data arbitrária.** Hoje isso
   não existe: conferi que `diaDeComida()` (`src/main.jsx:1847`) carimba o dia com
   a data, `fechaDiaDeComida` (`:1871`) congela o dia velho na virada, e
   `marcaRefeicao` (`:2055`) escreve sempre no dia corrente. **Pôr comida em dia é
   a tarefa que o app não tem** — e é o chão da folha de pôr o dia em dia. É
   função de domínio com o seu teste, sem superfície: entra antes.
4. **A migração** (§3.4), com fixture, atrás das telas de hoje.

E duas coisas que o detalhamento **não constrói, porque já estão construídas** —
achado meu, e ele muda o preço das três peças da C:

- **"As linhas do dia viram tocáveis" é devolver o que o app já faz.** Conferi
  `src/ui/instrumento/timeline.jsx`: toda linha tem três afordâncias — caixa de
  marcar, corpo e `···` —, e `src/ui/telas/hoje.jsx:120` as liga. A exceção é de
  propósito e é a pergunta 1.1 #6.
- **"Cada toque grava" também.** Conferi: `save()` (`src/main.jsx:1219`) escreve o
  estado inteiro e é chamada em **59 lugares**. O que a D introduziu foi a folha
  em lote; o requisito é **não construir o lote**, não construir a gravação.
- **A terceira peça é uma mudança de lugar, não capacidade nova.** A conta de
  volume existe em `src/dominio/volume.ts` (`seriesDeGrupo`, `alvoDoPrograma`,
  `impacto`, com 13 casos em `tests/dominio/volume.test.ts`) e **já aparece na
  tela** — em `src/ui/instrumento/edicao.jsx:41` e em `src/ui/telas/decisao.jsx:36`.
  A frase "o treinador prescreveu 7" sai pronta de `impacto()`. Levá-la à
  Prescrição é render. **Mas ver §3.6**: uma das duas telas onde ela aparece hoje
  é justamente a que a decisão D1 remove.

### 3.4 · O que exige migração de dado guardado

Quatro mudanças, e a disciplina deste repositório as encarece uma a uma: campo
persistido novo passa por **seis portões** — tipo, `migraPlanoN` com o bump de
`PLANO_ATUAL` (hoje **9**, conferi em `src/dominio/migracoes.ts:24`, com sete
funções nomeadas, de `migraPlano3` a `migraPlano9`) e fixture, regra de fusão com chave e lápide e teto em
`sincronia.ts`, as duas listas brancas da cópia, `tsc --noEmit`, e a disciplina
do total congelado se o campo alimentar a regra do nutricionista.

| o que | por quê | nota |
|---|---|---|
| **o instante da marca por refeição no dia corrente** | `DiaComida.done` é `Record<string, 1>` e não guarda hora | **Achado meu que a encurta:** `DiaComidaHist.done` **já é** `Record<string, number>`, e o comentário no tipo já explica por quê ("instante e não `1` porque é o que permite fundir… e desmarcar precisa de lápide"). Não é campo novo: é **convergir o dia corrente numa forma que o histórico já tem** |
| **qual refeição saiu do plano** | 14.2 = sim | o estado do dia hoje não aponta refeição |
| **"não contei a água" como fato** | 14.4 = sim, **como fato** | barato se fosse só leitura; fato pede campo |
| **abrir `S.body`** para bioimpedância e fita | 14.11 | **bloqueada** por 1.1 #5. Forma fechada em dois lugares (§1.1 #5) |

**Que sejam uma só migração, 9 → 10.** O caro aqui não é migrar; é esquecer um
dos seis portões — e duas migrações pagam os portões duas vezes. Se a lista de
campos da bioimpedância não chegar, as três primeiras seguem sem ela e a quarta
vira a migração 11, **declarada como custo da espera**.

### 3.5 · O que não pode ser tocado

- **`src/dominio/` e os 372 casos de domínio.** Nenhuma decisão do dono mudou uma
  regra. Se um caso de domínio ficar vermelho no detalhamento, o detalhamento
  errou — e esse é o sinal mais confiável que existe nesta troca.
- **A asserção da lista branca da exportação** (`tests/fluxo/dados.test.js:50-90`).
  É a única garantia escrita da régua dele. Campo novo entra na lista; a asserção
  não sai.
- **O histórico de migrações.** Sete nomeadas, `PLANO_ATUAL` em 9, e o projeto
  nunca apagou dado. Migração se acrescenta; não se reescreve.
- **As chaves de fusão e as lápides de `src/dominio/sincronia.ts`.** É o que faz
  dois aparelhos somarem em vez de um ressuscitar o que o outro apagou.
- **`src/ui/navegacao.js`** (151 linhas): o Voltar do sistema por camada. As duas
  direções o especificaram como se fosse novo. Quem detalhar precisa saber que
  está pronto, ou reescreve de graça — e com ele o descanso pelo relógio de
  parede, o "nada de falso sucesso" e o mostrar o buraco em vez de zero.
- **O cache de fotos poupado pela ativação** (`src/sw.js:28` + as asserções de
  `publicacao.test.js:70-78`). Ver 1.3 #3.

### 3.6 · A capacidade que sai sem ninguém notar — e a única coisa que a segura

Este é o ponto em que a troca pode perder capacidade sem violar byte nenhum.

A decisão D1 tira a pergunta do fim do treino. Essa pergunta é uma capacidade
viva e testada: **9 casos em `tests/fluxo/promocao.test.js`** (contei), e os nomes
deles dizem o que protegem — a sessão que morre sozinha guarda a pergunta para a
próxima abertura, e a pergunta guardada não interrompe um treino em andamento. O
carregador disso é `S.promoPendente` (7 ocorrências em `src/main.jsx`, conferi).

Duas consequências, e as duas são requisito:

1. **`promoPendente` não se apaga junto com a tela.** Ele é exatamente o mecanismo
   que a lista de mudanças que espera e **vence** precisa. Tirar a pergunta e
   apagar o carregador é como F280 volta — a mudança descartada em silêncio.
2. **A conta de volume tem que chegar à Prescrição na mesma mudança que remove a
   tela de decisão**, porque `src/ui/telas/decisao.jsx:36` é um dos dois lugares
   onde ela aparece hoje. Fora de ordem, a conta desaparece entre uma coisa e
   outra, e o requisito que o dono pediu é precisamente o que repara a perda que a
   resposta dele mesmo cria.

---

## 4 · O que fica para depois, declarado

**O que nenhuma das duas desenhou, e segue sem desenho:**

- **O destrutivo.** Hoje apagar uma medida passa por `confirm()` do sistema com o
  estrago delimitado em texto ("Sai da média da semana e do ritmo. As outras
  medidas ficam.", `src/main.jsx:3370-3383`). **As duas direções não tratam
  apagar.** Enquanto não houver desenho, o comportamento de hoje fica — e fica
  dito, não por esquecimento.
- **A `Procedencia` como regra.** As duas carregam no conteúdo a promessa de que
  todo número derivado diz de onde veio; nenhuma a mantém como primitiva. Ou a
  frente 4 a reconstrói como token e componente, ou ela deixa de ser regra e passa
  a depender de quem escreve cada tela — o que é a definição de regra perdida.
- **A bancada** (`src/palco.js`, `src/palco.css`): o app pousado num telefone,
  com viewport de verdade e licenças escritas. As duas trocam por outra coisa, não
  desenhada.
- **O notebook.** A D disse que no notebook tudo é teclado do sistema, e o teclado
  próprio do app **não tem os dígitos do teclado físico** (**do cerco**). A
  frequência de uso no notebook é **não medida**.
- **A superfície de conflito entre dois aparelhos.** A fusão existe e é testada;
  nenhuma direção desenhou o que se vê quando ela decide.
- **O segundo usuário.** `PRODUCT.md` ainda diz que não existe usuário além de um.
  As duas desenham para quem não é o dono, mas nada desenha o dado de um segundo.
- **A medida por movimento na aula** (m, cal, seg) e a tabela de séries que se
  adapta a uma aula de cinco movimentos: o app de hoje tem. Se as telas de aula da
  segunda rodada a cobrem, **não conferi**.

**As medições que ninguém fez, e que o detalhamento herda:** 320 px de largura,
200% de texto, VoiceOver no iOS de verdade, o contraste do tema escuro nas telas
novas, o tamanho real do estado hoje, a latência de gravar o estado cheio no
aparelho dele, e a taxa de toque engolido como arrasto. Todas **não medidas**.

**Os documentos candidatos.** As frentes 1 a 4 produzem os candidatos que
substituiriam `DESIGN.md`, `MARCA.md` e `docs/LASTRO_UX_CONTRACT.md`. Eles ficam
**candidatos até existir código que os obedeça** — nenhum sobrescreve nada agora,
e a hora de promovê-los é dele.

---

## 5 · Os riscos desta etapa

1. **A reescrita em bloco dos 513.** É o modo de falha histórico deste projeto:
   os 513 são o que pegou as capacidades que sumiram em quatro reescritas
   anteriores. **O cuidado:** a rede antes (§3.2), os 203 casos repontados
   enquanto a interface de hoje ainda está de pé (§3.3), os 372 de domínio como
   alarme, e a asserção da exportação intocada. O que se perde aqui não é byte: é
   capacidade, e ninguém percebe no dia.
2. **Esquecer um dos seis portões de uma migração.** O caro não é migrar; é
   migrar pela metade. **O cuidado:** uma migração só, 9 → 10, com fixture, e a
   lista branca da importação já fechada antes dela (§3.1).
3. **O rebrand** — três peças da C entrando na D sem um autor da coerência. **O
   cuidado:** cada peça tem um defeito medido que ela repara, e duas das três são
   capacidade que o app já tem (§3.3); quem detalhar escreve o que cada uma custa
   na gramática da D, e a única que muda regra — a folha pré-marcada como
   sugestão — volta à mesa dele desenhada, antes de virar código.
4. **A acessibilidade no fim.** Já há dívida medida: 178 `<svg>` sem nome e sem
   `aria-hidden` na D e 12 alvos abaixo de 44 px (**do cerco**), contra um padrão
   interno de 46 px para controle repetido. **O cuidado:** portão por frente, com
   o método de medida de C3, e não uma passada no fim.
5. **A régua.** É o preço mais alto da D, na ação mais frequente do produto, e a
   alternativa medida como melhor nesse ponto é o controle que ele recusou. **O
   cuidado:** medir depois do conserto, em aparelho e com dedo; e se não ceder,
   isso é 1.1 #7 e volta a ele — não se troca o controle por conta própria.
6. **Decidir hábito com prova de impressão.** O protótipo testou três minutos,
   não semanas; isso foi dito a ele antes de usar. As decisões que **só aparecem
   em semanas** — a lista do dia, o vencimento, a contagem de adesão — não têm
   medida nenhuma. **O cuidado:** marcá-las como hipótese no detalhamento, para
   não endurecerem como fato.
7. **Recomprar trabalho que já existe.** As duas direções especificam como novo o
   Voltar por camada, o descanso pelo relógio de parede, o "nada de falso sucesso"
   e o mostrar buraco em vez de zero. **O cuidado:** §3.5 na mão de quem detalha,
   antes da primeira linha.
8. **A ficção do protótipo virando requisito.** O salto de 6h55 para 15h30 é a
   única mentira do arquivo, e foi ela que produziu um achado bom (o cabeçalho da
   sessão aberta o dia inteiro). **O cuidado:** separar, no detalhamento, o que
   veio do uso medido do que veio do salto.

---

**O que este plano não faz:** não desenha, não decide no lugar dele e não
reabre o que ele já escolheu. Onde uma frente depende de uma resposta dele, a
resposta está nomeada em §1.1 com o que muda conforme ela.
