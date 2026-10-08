# 09 · Apagar o histórico — a promessa que o código não cumpria

`wipe()` avisa *"Isso não tem volta."* e tinha volta. O dono apagava no celular,
o notebook sincronizava, e o histórico voltava inteiro.

Este documento registra o conserto, o que ele deliberadamente **não** decidiu, e
onde o código discordou do que me foi dito.

**Nenhuma linha deste arquivo tem estimativa de prazo.** Onde não houve medição,
está escrito que não houve.

## Convenção de prova

- **conferi** — abri o arquivo e li nesta sessão, com o caminho ao lado.
- **medido** — rodei e li o número de saída, com o comando ao lado.
- **não medido** — ninguém mediu, e eu não invento número.

---

## 1 · A linha de base

**Medido**, `npm test`, antes de tocar em nada: **1.028 passando** — `tests/fluxo/`
**583**, `tests/dominio/` **445** —, **53 arquivos**, **zero** rejeições não
tratadas, `npx tsc --noEmit` limpo. Bate com o briefing nos cinco números.

**Medido ao fim: 1.038 passando** — `tests/fluxo/` **587**, `tests/dominio/`
**451** —, os mesmos **53 arquivos**, **zero** rejeições, `tsc` limpo. Dez casos
novos. **Dois casos existentes mudaram de asserção**, e a §6 diz por quê, um a
um. Nenhum caso foi apagado, pulado nem teve asserção trocada por uma mais
fraca.

O flake conhecido do `navegacao` não apareceu em nenhuma das cinco execuções
completas desta sessão.

---

## 2 · O defeito

### Onde ele está

`wipe()` (`src/main.jsx`) reconstrói `S` a partir de um literal escrito à mão.
`apagados` — o mapa de lápides — **não está no literal**, e `normalizaEstado()`
o preenche com `{}` logo depois. **Conferi.**

Mas preservar as lápides velhas nunca foi o conserto, e o briefing está certo
nisso: o `wipe` esvazia as coleções **em bloco**, sem passar por `lapide()` em
registro nenhum. As lápides velhas falam dos registros apagados *antes*. Dos que
este gesto acabou de levar, não havia lápide nenhuma a preservar.

Sem lápide, `funde()` faz exatamente o que o topo de `src/dominio/sincronia.ts`
avisa que ela faz:

> *"Apagar precisa de LÁPIDE. Sem ela, unir por chave RESSUSCITA o que você
> apagou no outro aparelho — o registro ainda existe lá, e a união o traz de
> volta."*

### A guarda que estava numa porta e faltava na outra

O autor conhecia a classe do problema. No mesmo `wipe`, duas linhas abaixo:

> *"A velha vai junto. Deixá-la seria a migração do boot ressuscitar amanhã
> exatamente o histórico que ele acabou de mandar apagar."*

Ele blindou a ressurreição pelo **boot** (a chave de storage legada) e deixou
aberta a ressurreição pela **fusão**. Mesma guarda, duas portas, uma trancada.

E a mesma assimetria aparece numa terceira porta, que o briefing não mencionou:
`apagaFoto()` — apagar UMA foto de aparelho — solta o blob, chama `FOTO.esquece`
(cache do aparelho), chama `NUVEM.apagaFoto` (bucket) **e** deixa lápide. As
quatro coisas. O `wipe` não faz nenhuma das quatro para as fotos. **Conferi**
(`src/main.jsx`, `apagaFoto`).

### O caminho de reprodução, com dois aparelhos

1. Celular e notebook sincronizados: os dois têm o mesmo histórico, a nuvem
   também.
2. No celular: *apagar todo o histórico*. Local fica vazio.
3. O notebook registra qualquer coisa (um dia de descanso serve) e sincroniza.
   Ele ainda tem tudo, e sobe tudo.
4. O celular sincroniza. `funde` une por chave natural, não encontra lápide
   nenhuma, e **traz o histórico de volta** — séries, sessões, cardio e
   pesagens.

---

## 3 · O caso que nasceu vermelho

`tests/fluxo/sincronia.test.js` :: *apagar todo o histórico no celular não volta
pelo notebook*. Dois apps de verdade sobre **uma** linha de nuvem — `nuvemFalsa`
monta uma linha por aparelho, e duas linhas nunca se encontram, então o arquivo
ganhou `nuvemDeDois`, que guarda a linha no realm do Node e atravessa por string
nos dois sentidos, com a trava de versão de verdade.

Vermelho antes do conserto, **medido**:

```
AssertionError: o histórico apagado NÃO volta pela fusão
+ actual - expected
  {
+   cardio: 1,  exercicios: 1,  pesagens: 1,  sessoes: 1
-   cardio: 0,  exercicios: 0,  pesagens: 0,  sessoes: 0
  }
```

As quatro famílias voltaram. Não é hipótese.

Os outros dois casos novos de fluxo também nasceram vermelhos, e os dois foram
conferidos com quebra deliberada depois do conserto (tirar a linha → vermelho →
devolver):

- *o apagamento sobrevive a fechar o app, que é onde ele morria* — falha em
  `o apagamento FICOU gravado, em vez de só na memória`.
- *a refeição marcada HOJE não volta; a água volta, porque é contador* — falha
  em `a marca de hoje não volta pela fusão`.

---

## 4 · A semântica: é uma só, e por quê

A pergunta é o **alcance** do apagamento. Li a fusão inteira antes de escolher.
Havia uma bifurcação real, e ela se resolve por um critério, não por gosto.

### As quatro candidatas

**S1 — lápide por registro, limitada ao que ESTE aparelho conhecia.** É a
escolhida. Cada registro que saiu ganha uma lápide com a mesma chave natural que
`funde` usa para uni-lo. Consequência: morre nos dois lados tudo que este
aparelho tinha no instante do gesto. Registro que só existe no outro aparelho —
porque nunca subiu — **sobrevive**. Registro que o outro aparelho criar ou
corrigir depois **sobrevive**, pela regra que a fusão já tem escrita (*"a lápide
só mata o que é mais velho que ela: registro editado DEPOIS de apagado é
ressurreição deliberada, e o app tem que respeitar"*).

**S2 — marca d'água: um "tudo antes de T morreu".** Consequência: mata, no outro
aparelho, registros que este nunca viu. Um aparelho três semanas atrasado
apagaria três semanas de trabalho do outro. Precisa de campo novo em `Estado`,
migração, regra de fusão nova, e **quebra o modelo de lápide por chave** que o
módulo inteiro é.

**S3 — apagar só aqui, sem propagar.** Não é implementável neste modelo: sem
lápide, "não propagar" não é "apagar só aqui", é **não apagar** — a fusão
seguinte traz tudo de volta para este aparelho também. É literalmente o defeito.
Apagar só num aparelho exige parar de sincronizar, que é um gesto que já existe
(`sairDaNuvem`) e cujo aviso promete o contrário: *"o histórico continua aqui"*.

**S4 — marcar para apagar, e o outro lado confirma.** Não há mecanismo. `funde`
é função pura de dois estados, sem rodada de confirmação em lugar nenhum. A
lápide **já é** a marca, e a convergência **já é** a confirmação. S4 seria
conceito novo sem precedente no arquivo.

### O critério que decide

**S1, e por três razões, em ordem de peso:**

1. **O erro de S1 se conserta; o de S2 não.** S1 pode apagar de menos (aparelho
   atrasado). Conserto: repetir o gesto no outro aparelho. S2 pode apagar de
   mais. Conserto: nenhum. O briefing nomeia esse como o erro caro, e é o
   próprio critério do projeto.
2. **S1 não inventa conceito.** Usa a chave natural e a lápide que `funde` já
   lê. S2 precisaria dos seis portões de migração; S1 de nenhum (§8).
3. **Todo apagamento deste app já é S1.** `apagaRegistroDeTreino`,
   `apagarSessao`, `delBody`, `gravaMarca` (medida do mesmo dia substituída),
   `delCardio`, `alternaDescanso`, `apagarModeloDeAula`, `apagaFoto`,
   `CTX.apagaFotoDoCorpo`, `marcaRefeicao` (desmarcar), `soltaPromo`,
   `removeProjecao` e `finalizarSessao` — **conferi as dezesseis chamadas de
   `lapide()` do arquivo**: todas por registro, todas com a chave que a fusão
   usa. O `wipe` era a única porta destrutiva sem lápide, e não por desenho: por
   omissão.

E o aviso do apagamento de UM treino já dizia o alcance em palavras: *"Isso não
tem volta, **e vale para os outros aparelhos**."* A semântica S1 não é uma
escolha nova — é a que o produto já tem, escrita na tela, faltando numa porta.

### O que NÃO é escolha minha

*"O que fazer com registros que o outro aparelho criou depois do apagamento"* não
é bifurcação: **a fusão já decidiu**. Registro novo tem chave nova, e nenhuma
lápide fala dele. Registro corrigido depois tem carimbo maior que a lápide, e a
regra escrita manda respeitar. Os dois casos têm teste próprio
(`tests/dominio/sincronia.test.ts`), e os dois passam sem eu ter escrito uma
linha de política.

### A bifurcação que eu NÃO resolvi

O **escopo** do gesto — *quais campos* o apagamento leva — é decisão de produto
com mais de uma resposta defensável, e ela sobe para o dono inteira, na §7. Eu
não mexi em nenhum campo.

---

## 5 · O conserto, peça por peça

### (a) `lapidesDoApagamento(antes, depois, agora)` — `src/dominio/sincronia.ts`

Pura, exportada, testada sem app. Devolve o mapa de lápides de um apagamento em
bloco.

**É uma DIFERENÇA entre dois estados, e não "lápide para tudo que havia".** Essa
forma é a peça de desenho que importa: a decisão de escopo fica num lugar só — o
estado novo que o `wipe` monta. Se amanhã o dono decidir que os modelos de aula
sobrevivem, basta nomear `aulas:S.aulas` no literal: a coleção deixa de aparecer
no diff e nenhuma lápide a persegue. Nenhuma segunda lista para manter em
sincronia — que é a doença que este repositório já pegou três vezes (a lista
branca da importação, o próprio literal do `wipe`, as duas listas de
`MARCAS_DO_CORPO`).

Ela **espelha `funde` coleção por coleção, guardas inclusive**. Chave que existe
aqui e não lá é lápide que não mata nada; chave que existe lá e não aqui é
registro que o apagamento não alcança. As duas formas de errar são silenciosas.
Por isso ela não filtra "registro estranho" por conta própria: se a fusão une um
registro malformado sob `aula:undefined`, é `aula:undefined` que a lápide precisa
ter.

Cobre as treze famílias que `funde` sabe enterrar: `logs`, `done`, `cardio`,
`progLog`, `aulas`, `promoPendente`, `gordura`, `comidaHist` (dia **e** refeição
marcada), `body` (as sete grandezas, enumeradas de `MARCAS_DO_CORPO`),
`descanso`, `fotos`, `protocolo.sessoes` (sessão **e** pose), e as marcas do dia
de comida **aberto**.

`chaveDeProgLog` saiu da concatenação escrita à mão dentro de `funde` e virou
função exportada, pelo mesmo motivo que as outras chaves já moravam ali: *"a
chave de lápide e a chave de fusão precisam ser a MESMA string"*. Era a única que
não cumpria a própria regra do módulo.

### (b) `wipe()` deixa as lápides — `src/main.jsx`

```js
S.apagados = uneLapides(antes.apagados || {}, lapidesDoApagamento(antes, S, agora), agora);
```

As velhas entram junto, por `uneLapides`: lápide de registro que **este** gesto
não apagou continua sendo a única coisa que impede o outro aparelho de
ressuscitá-lo. Jogá-la fora era um apagamento desfeito de graça. De `uneLapides`
vem, de quebra, a poda dos 90 dias.

### (c) `wipe()` GRAVA o resultado — `src/main.jsx`

`await save()` no fim, depois do `DB.delete(KEY)`. Antes o gesto removia a chave
e **não escrevia nada no lugar**. Três consequências, as três medidas:

- **As lápides ficavam só na memória.** Abrir, apagar, guardar o telefone: a
  abertura seguinte não achava chave nenhuma, nascia um estado limpo sem lápide,
  e a primeira sincronização reenchia o aparelho. O caso *o apagamento sobrevive
  a fechar o app* cobre isso e **nasce vermelho** sem esta linha.
- **A prescrição preservada ia junto.** O programa, o plano nutricional e o
  catálogo que o gesto promete preservar existiam só em RAM. **Medido:** sem
  `save()`, `S.mtime` fica **0** depois do apagamento, e na fusão seguinte
  *"tudo que não é coleção vem do lado que manda nos documentos"* entrega os
  documentos ao OUTRO aparelho. Com o plano editado no celular e ainda não
  subido, o número volta ao do notebook: **`q=35` em vez de `q=777`**. Com
  `save()`: `q=777`. Medido nos dois sentidos, com dois apps e o debounce
  liberado.
- **O apagamento não marcava sujeira.** `save()` chama `sujou()`. Sem ele, o
  gesto só subia a reboque de um toque sem relação nenhuma com ele.

A ordem é deliberada: `DB.delete(KEY)` **antes** do `save()`. Uma escrita que
falhe (cota) não pode deixar o histórico velho de pé na chave; o pior caso passa
a ser um aparelho vazio sem lápide, que é o comportamento de hoje, não uma
regressão.

### (d) O dia de comida ABERTO

**Medido antes de consertar:** o almoço marcado hoje, apagado no celular,
**voltava** do notebook. O dia aberto não está em `comidaHist` — só fecha lá na
virada da data — e a fusão une as marcas dele pela mesma `chaveDeRefeicaoFeita`.
O `wipe` zerava o dia e não deixava lápide de marca nenhuma.

`lapidesDoApagamento` passou a incluir as marcas do dia aberto. **Só as marcas, e
não o dia:** `S.dia` é documento, e documento vem do lado com `mtime` mais novo.

A guarda contra o efeito colateral óbvio já existia e **conferi** que basta:
`marcaRefeicao` faz `d.done[id] = Math.max(Date.now(), morta + 1)`, então marcar
o almoço de novo depois do apagamento funciona.

### (e) O aviso passou a dizer o alcance

`'Apagar todo o histórico? Isso não tem volta, e vale para os outros aparelhos.'`

A frase é a que `apagaRegistroDeTreino` já usava, palavra por palavra. Agora ela
é verdade aqui também. Antes a promessa era *menor* que a verdade pelo motivo
errado — o apagamento era desfeito —, e o dono tocava sem saber que o notebook
obedeceria.

**É a única mudança de texto da tela nesta entrega, e é a que o dono mais
facilmente desfaz** se discordar: uma linha, sem nada de lógica pendurado nela.

---

## 6 · Os dois casos existentes que mudaram, e por quê

O briefing manda parar e escrever. Aqui está. Em nenhum dos dois o **assunto** do
caso mudou; nos dois a asserção que caiu era sobre o defeito, não sobre o
assunto.

### (i) `dados` :: *ctx.apagaTudo leva junto quatro coisas que ninguém declarou*

Caiu `assert.deepStrictEqual(d.apagados, {})`.

**O caso pediu para quebrar, em letras.** O comentário dele diz: *"ESTE CASO NÃO
AFIRMA QUE ESTÁ CERTO… Se alguém decidir que um deles deve sobreviver, este caso
fica vermelho e aponta a linha"*. Era exatamente este o quarto campo, e o
documento que o escreveu (`09-superficie.md` §8.5 b) já o nomeava como *"o mais
pesado dos quatro"*, com a ressalva de que a ressurreição ponta-a-ponta **não
tinha sido medida** e era *"o próximo pedaço óbvio de trabalho aqui"*. Esta
entrega é esse pedaço.

A diferença entre o quarto campo e os outros três é de natureza, e é o que
justifica tratá-lo separado: `aulas`, `protocolo` e `fotos` são **escopo de
produto** — decisão sobre o que o dono quer apagar. `apagados` não era escopo
nenhum: era a ressurreição pela fusão. Não havia o que o dono decidir.

O título passou de "quatro coisas" para "três". As três asserções que sobraram
estão **byte por byte** como estavam. A lápide ganhou caso próprio ao lado:
*ctx.apagaTudo deixa uma LÁPIDE por registro que saiu, na chave da fusão*.

### (ii) `migracaochave` :: *apagar o histórico leva a chave velha junto*

Caiu `assert.strictEqual(a.window.localStorage.getItem(CHAVE), null)`.

O **assunto** do caso é `CHAVE_LEGADO`, e essa asserção — a última do caso, com
a mensagem que explica o porquê — está intacta. A que caiu era uma **premissa**:
"depois do apagamento a chave nova está vazia". Com o §5 (c) ela não está mais:
a chave nova recebe o estado apagado, com as lápides dentro. No lugar entraram
duas asserções mais fortes sobre a mesma premissa — que a chave nova ficou com o
estado apagado, e que tem lápide dentro — e as duas sabem ficar vermelhas
(conferido com quebra deliberada).

**Não havia como ter as duas coisas.** Ou o `wipe` grava (e a chave não está
vazia), ou o apagamento não sobrevive a fechar o app. A asserção antiga
descrevia, sem saber, o segundo caso.

---

## 7 · O veredito sobre `aulas`, `protocolo` e `fotos` — e três que o briefing não listou

**Primeiro, o aviso que importa:** antes desta entrega, o apagamento desses
campos era **desfeito pela próxima sincronização** — o mesmo defeito que eu
consertei era o que os protegia. Agora eles morrem nos dois aparelhos, de
verdade. **O conserto tornou a decisão de escopo mais urgente, não menos.**

Considerei a alternativa de deixar os três **fora** do conjunto de lápides até o
dono decidir, e descartei: sem lápide eles voltam do outro aparelho, então o
resultado do gesto passaria a depender de haver outro aparelho com o dado e de
uma sincronização acontecer. Não dá para o dono prever o que o gesto faz — e
imprevisível é pior que qualquer um dos dois extremos. Desfazer a decisão depois
custa **uma palavra no literal**, pela forma de diff da §5 (a).

### O método do veredito

O literal do `wipe` cresce **um campo por vez, no commit que cria o campo**.
Verificado com `git log -S`:

| campo | nasceu em | esse commit tocou o literal do `wipe`? |
|---|---|---|
| `gordura` | `8b7767d` (21/09) | **sim** — adicionou `gordura:S.gordura` |
| `quadro` | `a141811` (09/09, família aula) | **sim** — adicionou `quadro:S.quadro` |
| `aulas` | `00e7fa3` (09/09) | **não** |
| `protocolo` | `a4df1a6` (01/09) | **não** |

Quem lembrou, listou. É o teste de intenção mais direto que este repositório
oferece.

### Os vereditos

**`aulas` — ESQUECIMENTO, com confiança alta.** Nasceu num commit que não abriu o
literal. E há uma assimetria que nenhuma leitura de produto sustenta: `S.ex`, o
catálogo de aparelhos que **ele** cadastrou, sobrevive com o comentário *"não é
registro, é catálogo"*; `S.aulas`, os modelos de aula que **ele** salvou, não. As
duas são coisa que ele criou. Pior: `quadro`, que é o rascunho **do dia** e morre
sozinho quando a sessão encerra, sobrevive ao apagamento — e a biblioteca
durável, não. Se fosse hierarquia deliberada, seria a inversa.

**`protocolo` — ESQUECIMENTO, e o campo tem duas metades com vereditos
diferentes.**
- `protocolo.sessoes` são **registro** (as sessões de foto). Irem junto é
  coerente com o resto do gesto. Mas: elas são as **referências aos bytes**, e os
  bytes ficam órfãos. **Conferi a linha exata:** `reconciliaCorpo` termina em
  `if (recentes.length === sessoes.length) return;` — depois do apagamento as
  duas são **zero**, a igualdade é verdadeira, e `CORPO.poda` **nunca é
  alcançada**. O cache do aparelho e o bucket da nuvem ficam com todas as fotos
  de corpo, para sempre, sem nada no estado que as referencie.
- `protocolo.poses` é **prescrição** (a ordem das poses do protocolo), e ir junto
  contradiz a simetria que o próprio `wipe` declara. **Conferi** que hoje isso
  não custa nada: **nada no app escreve `protocolo.poses`** — só
  `normalizaEstado` a anula quando inválida, e `posesDo(null)` cai no
  `PROTOCOLO` do código. É um slot dormente. Custará no dia em que ganhar
  escritor.

**`fotos` — ESQUECIMENTO, e é o mais claro dos três.** São as fotos dos
aparelhos: uma por exercício, para reconhecer a máquina na academia. É
**atributo do catálogo**, não registro de treino — exatamente paralelo a `S.ex`,
que sobrevive com comentário dizendo que sobrevive porque é catálogo. E o mesmo
órfão: `wipe` não chama `FOTO.esquece` nem `NUVEM.apagaFoto`, que é precisamente
o que `apagaFoto()` chama quando apaga **uma**.

### Três que o briefing não listou, e caem também

A tabela da §8.5 (b) do `09-superficie.md` fala de quatro campos. São **seis**.
**Medido** com o app:

- **`descanso`** — os dias marcados como descanso. É registro; ir junto é
  coerente. Mas não estava em nenhuma das três colunas daquela tabela, nem na de
  "vai (registrado)". Agora leva lápide (`descanso:2026-10-07`, medido).
- **`promoPendente`** — as perguntas de programa que esperam resposta. Ir junto é
  **coerente**, e por um motivo bom: a chave natural dela é o `sid` da sessão, e
  as sessões acabaram de ser apagadas. Pergunta sobre sessão que não existe mais
  não tem o que responder. Agora leva lápide (`promo:1`, medido).
- **`mtime`** — ia a zero, com as consequências da §5 (c). **Consertado** nesta
  entrega, porque não era escopo de produto: era a fusão entregando os
  documentos ao aparelho errado.

### Uma incoerência de conteúdo, que sobe junto

`gordura` **sobrevive** (está no literal, alguém digitou) e `protocolo.sessoes`
**vai**. As leituras de gordura visual são respostas sobre **pares de fotos**, e
`chaveDeLeitura` é a data da sessão mais nova do par. Depois do apagamento, as
leituras descrevem fotos que o estado não tem mais. São registro, como as
sessões, e sobrevivem às suas próprias fontes.

### As opções, para o dono

1. **Encolher o escopo**: nomear `aulas`, `fotos` e `protocolo` (ou só
   `protocolo.poses`) no literal do `wipe`. Custo: uma palavra cada; a lápide
   desaparece sozinha pela forma de diff. Consequência: o gesto passa a apagar só
   o que foi registrado em treino e comida, coerente com o comentário que ele já
   tem.
2. **Manter o escopo e dizer o que vai**, no aviso. Consequência: o dono decide
   sabendo; e aí falta a poda dos bytes (hoje nenhuma porta do `wipe` poda, e
   `apagaFoto` mostra como se faz).
3. **Dividir o gesto em dois**: apagar o histórico de treino/comida, e apagar as
   fotos e os modelos, separados. Consequência: mais superfície, menos chance de
   levar junto o que não se queria.

Não escolhi nenhuma. Nada do código mudou nesses campos.

---

## 8 · Migração: conferi, e não precisou

Os seis portões, um a um:

| portão | precisou? | por quê |
|---|---|---|
| tipo novo em `tipos.ts` | **não** | `apagados` já é `Record<string, number>` no estado, há migrações. Nenhum campo novo nasceu: o conserto escreve **valor** num campo que já existe |
| `migraPlanoN` + bump de `PLANO_ATUAL` (11) + fixture | **não** | migração reformata dado **existente**. Nenhum dado existente mudou de forma — estado de ontem tem `apagados` e é lido igual |
| regra de fusão com chave e lápide | **não** (já existia) | `funde` já consulta lápide nas treze famílias. `chaveDeProgLog` virou função exportada, mas a string é a mesma: `'prog:' + t + ':' + day` |
| as duas listas brancas da cópia | **não** | **conferi**: a importação já lista `apagados`, `mtime`, `descanso`, `fotos`, `promoPendente`, `protocolo`, `aulas`, com o comentário *"sem estes, importar um backup zeraria o carimbo do estado e as lápides"*. A exportação é `data: S` inteiro |
| `tsc --noEmit` limpo | **sim**, e está | rodado a cada peça |
| total congelado | **sim** | 1.028 → 1.038, dez casos novos, nenhum apagado |

O briefing avisava que *"valor novo em campo que já existe não é campo novo"*.
Confirmo: era esse o caso, e não precisou de migração nenhuma.

---

## 9 · O que medi

### O volume das lápides — e é o custo real desta escolha

`lapidesDoApagamento` contra um estado sintético, com os ids de exercício de
verdade do programa. **Medido** (`npx vite-node`, script em scratchpad):

**Um ano no ritmo do programa** (6 sessões/semana × 8 exercícios, 365 dias de
comida com 7 refeições, 365 pesagens, 104 cardios, 12 sessões de foto × 9 poses,
40 fotos de aparelho):

| família | lápides | tamanho |
|---|---:|---:|
| `comida:<dia>:<refeição>` | 2.555 | 102 KiB |
| `log:<ex>:<sid>:<slot>` | 2.496 | 205 KiB |
| `comida:<dia>` | 365 | 12 KiB |
| `peso:<t>` | 365 | 13 KiB |
| `done:<sid>` | 312 | 11 KiB |
| `corpo:…` | 120 | 5 KiB |
| `cardio:<t>` | 104 | 4 KiB |
| `descanso:<iso>` | 53 | 2 KiB |
| `foto:<ex>` | 40 | 1 KiB |
| **total** | **6.410** | **349 KiB** |

**O mapa de lápides é maior que o estado que ele enterra** (302 KiB). Ele sobe
para a nuvem e vive **90 dias** (`LAPIDE_DIAS`), depois `uneLapides` o poda
sozinho.

**No teto que os limites do próprio app permitem** (`TETO`: `done` 3.000,
`comida` 4.000, `logs` 500 por exercício): **40.000 lápides, 1.711 KiB**, contra
1.371 KiB de estado. As refeições marcadas são 28.000 delas, 1.117 KiB.

Três coisas honestas sobre isso:

- É o preço de S1 contra S2. S2 custaria **um** inteiro. Paguei de propósito,
  pelo critério da §4.
- As lápides de **refeição marcada** são 40% do mapa, e o benefício delas é
  estreito: a lápide do **dia** já mata o dia inteiro. Elas só agem quando o dia
  sobrevive por edição posterior no outro aparelho — e aí o dia volta como casca
  vazia. Mantive porque a alternativa é pior: o dia que ressuscita traria de
  volta marcas que o dono apagou, que é o defeito desta entrega em miniatura. **É
  a peça mais fácil de reverter** se o volume incomodar: tirar duas linhas de
  `chavesDoEstado`.
- **`apagados` não tem teto.** Toda coleção tem o seu em `TETO`; o mapa de
  lápides não tem nenhum. Não inventei um: descartar lápide é ressuscitar
  registro, e um teto errado aqui é do tipo de erro que não se desfaz.

### O comportamento, medido

- Sem `save()`: `S.mtime = 0` depois do apagamento, e o plano editado e não
  subido volta ao do outro aparelho (`q=35` em vez de `q=777`). Com `save()`:
  `q=777`.
- A marca de comida de hoje voltava do outro aparelho; agora não volta. A **água**
  do outro aparelho continua chegando (`agua: 3`), porque é contador que fica com
  o maior dos dois, sem carimbo — exceção declarada no topo de `sincronia.ts`, e
  agora afirmada em caso próprio em vez de virar surpresa.
- `descanso` e `promoPendente` caem no apagamento, e agora com lápide.
- `protocolo.poses` é `null` por padrão e ninguém escreve nele.

---

## 10 · O que NÃO medi

- **Nada em aparelho de verdade.** Zero toques no iPhone e no notebook. Toda a
  prova é jsdom sobre o build, com a nuvem simulada. Em particular, não medi o
  tempo de subir um mapa de 349 KiB de lápides pelo sinal da academia, nem se o
  Supabase recusa alguma coisa nesse tamanho.
- **O limite do `localStorage` com o mapa grande.** No teto do `TETO`, estado +
  lápides passam de 3 MiB numa chave só. Não medi onde o navegador recusa, nem o
  que o app faz quando `DB.set` falha por cota **depois** do `DB.delete(KEY)` —
  o caminho de falha novo que a §5 (c) introduziu. O desenho prevê o pior caso
  (aparelho vazio, igual a hoje); não exercitei.
- **Os bytes órfãos.** Não medi quantos megabytes ficam no cache e no bucket
  depois de um apagamento, nem escrevi caso para isso. A poda não é alcançada —
  isso **conferi** na linha —, mas o tamanho do que sobra, não.
- **Conflito de verdade entre os dois aparelhos.** A linha compartilhada dos
  casos novos tem a trava de versão, mas nenhum caso novo força um conflito **no
  meio** de um apagamento. O caso antigo *conflito no meio do caminho refaz o
  ciclo* cobre o conflito, não o apagamento.
- **A poda dos 90 dias no ciclo completo.** `LAPIDE_DIAS` é testado em
  `tests/dominio/sincronia.test.ts`, não com um apagamento atravessando os 90
  dias com dois aparelhos.
- **Se `apagados` grande deixa `funde` lento.** `uneLapides` e `uneLista` são
  O(n) sobre o mapa, e o mapa chegou a 40.000 chaves no teto. Não cronometrei
  nada.
- **O que o dono acha do escopo.** A §7 é pergunta, não resposta.

---

## 11 · Onde o código discordou do que me foi dito

O briefing acertou o essencial — o defeito existe, a causa é a que ele diz, e a
guarda está numa porta e falta na outra. Seis divergências, nenhuma fatal:

1. **A linha do aviso.** O briefing diz `src/main.jsx:4514`. Está em **4613**
   (agora 4618). A linha 4514 é do `apagaRegistroDeTreino` — por coincidência o
   outro apagamento, o que **tem** lápide.
2. **`tests/fluxo/sincronia.test.js` tinha 17 casos, não 12.** A §8.3 do
   `09-superficie.md` acrescentou os de custódia e nuvem. Agora tem 20.
3. **Os campos fora da lista preservada são seis, não quatro.** Faltavam
   `descanso`, `promoPendente` e `mtime` na tabela do `09-superficie.md`, que o
   briefing herdou. **Medido** (§7).
4. **`protocolo` tem duas metades**, e o briefing só falou dos bytes órfãos. A
   metade `poses` é **prescrição**, e perdê-la contradiz a simetria que o `wipe`
   declara — mas hoje é inofensivo, porque ninguém escreve nela.
5. **A ressurreição não é só da fusão: há uma terceira porta.** `apagaFoto()`
   apaga os bytes do cache **e** do bucket; o `wipe` não apaga byte nenhum. A
   mesma assimetria "guarda numa porta, faltando na outra", num assunto
   diferente.
6. **O `wipe` não gravava nada.** O briefing não menciona, e é metade do
   conserto: sem isso as lápides novas não sobrevivem a fechar o app, e a
   prescrição preservada também não.

Duas coisas que o briefing afirmou e **conferi que estão certas**, contra minha
primeira leitura: `migracaochave.test.js` **é** o único arquivo que semeia a
chave legada (o outro casamento do meu `grep` era a palavra "legado" num
comentário), e `PLANO_ATUAL` **é** 11.

### Um achado fora do assunto, para não se perder

A lista branca da importação clampa `ajuste` a `-1 | 0 | 1`:

```js
ajuste: (d.ajuste === -1 || d.ajuste === 1) ? d.ajuste : 0,
```

E o tipo diz o contrário, com ênfase: *"Quantos passos de ±150 kcal estão em
vigor, ACUMULADOS. Não é estado ternário… Dois cortes seguidos são −300 kcal…
não cabe em `-1 | 0 | 1`, que descreve um destino e não um saldo."* Um backup com
saldo de dois passos importa como **zero**, calado, no único caminho de volta que
o dono tem. **Não é desta entrega e não mexi.**

---

## 12 · Onde parei, para o próximo continuar

### Fechados

- A ressurreição do histórico pela fusão, nas treze famílias de coleção. ✅
- A durabilidade do apagamento (sobrevive a fechar o app). ✅
- O carimbo que decide os documentos depois do apagamento. ✅
- As marcas do dia de comida aberto. ✅
- O aviso dizendo o alcance. ✅

### Abertos, em ordem de peso

1. **O escopo do gesto** — `aulas`, `protocolo` (as duas metades), `fotos`. §7, com
   três opções. **É decisão do dono, e agora ela propaga.**
2. **Os bytes órfãos** — nem cache nem bucket são podados, e `CORPO.poda` não é
   alcançada depois de um apagamento. `apagaFoto()` é o modelo de como se faz.
   Sai de pé junto com (1), porque poda errada é o erro que não se desfaz.
3. **A água de hoje atravessa o apagamento.** Inerente ao desenho do contador.
   Consertar exige carimbar a água, que o módulo rejeitou de propósito
   (*"Carimbar um inteiro custaria mais que o risco"*). Fica como fato declarado
   em caso.
4. **`apagados` sem teto**, e capaz de passar do estado em tamanho. §9. Um teto
   precisa de regra que não ressuscite nada, e eu não tenho essa regra.
5. **A incoerência `gordura` × `protocolo.sessoes`**: leituras sobrevivem às
   fotos que elas descrevem. §7.
6. **`ajuste` clampado na importação.** §11.

### Acréscimos à receita da §8.8 do `09-superficie.md`

1. **Dois aparelhos sobre UMA nuvem** não sai de `nuvemFalsa`: ela monta uma
   linha por app, e duas linhas nunca conflitam. `nuvemDeDois`
   (`tests/fluxo/sincronia.test.js`) guarda a linha no realm do Node e atravessa
   **por string** nos dois sentidos — objeto do Node desserializado dentro do
   jsdom chega com o protótipo errado, e é o app que vai fundi-lo. Instalar
   função do Node em `a.window.__x` e chamá-la de dentro por `globalThis.__x`
   funciona.
2. **"Reabrir o aparelho"** se faz com `app({ estado: a.gravado() })`: pega o que
   ficou no disco e sobe um jsdom novo com ele. É o jeito de testar durabilidade
   sem reusar o `localStorage`.
3. **`await a.v('sincroniza')` pode não empurrar nada** e isso não é falha: o
   ciclo sai cedo em `jaVisto && !sujo`. Quem testa apagamento precisa olhar as
   **versões** da linha, não só o estado — instrumentei com
   `fs.appendFileSync` e a conta de empurros, e foi o que desfez uma dedução
   minha errada sobre quem empurra em que ordem.
4. **`liberaSave()` no topo de `sincroniza` mascara o `mtime`.** Um `save`
   represado pelo debounce é liberado ali e **recarimba o estado**. Medir efeito
   de `mtime` exige liberar o debounce antes (`esperar(900)`), senão a medição
   mede o `liberaSave`. Custou duas voltas e uma afirmação quase errada.
5. **Quebra deliberada que não compila não é quebra.** `void 0 && S.x = y` é
   *Invalid assignment target* e derruba o build inteiro — o esbuild recusa, e o
   vermelho que você lê é do build, não do caso. Quebre com uma atribuição
   válida (`S.apagados = {}`).
