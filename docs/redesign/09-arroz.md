# 09 · O arroz — o desfazer que tirava comida do prato

O ajuste calórico somava 60 g de arroz em cada um dos dois pratos e, ao desfazer,
podia tirar 120 g de um só. O jantar ficava em **190 g** com a prescrição em
**250**, calado, e o prato trocado ficava com os **+60 para sempre**.

Este documento registra o defeito com a aritmética conferida, o conserto, a
migração, os seis portões, a prova de vermelho caso por caso — e o que **não**
foi medido.

**Nenhuma linha deste arquivo tem estimativa de prazo.**

## Convenção de prova

- **conferi** — abri o arquivo e li nesta sessão, com o caminho ao lado.
- **medido** — rodei e li o número de saída, com o comando ao lado.
- **não medido** — ninguém mediu, e eu não invento número.

---

## 1 · A linha de base

**Medido**, `npm test`, antes de tocar em nada: **1.080 passando** —
`tests/fluxo/` **629**, `tests/dominio/` **451** —, **53 arquivos**, **zero**
rejeições não tratadas, `npx tsc --noEmit` limpo. Bate com o briefing nos cinco
números, inclusive na divisão.

**Medido ao fim: 1.105 passando** — `tests/fluxo/` **635**, `tests/dominio/`
**470** —, os mesmos **53 arquivos**, **zero** rejeições, `tsc` limpo.
**Vinte e cinco casos novos**: 5 em `tests/fluxo/ajuste.test.js`, 1 em
`tests/fluxo/dados.test.js`, 7 em `tests/dominio/nutricao.test.ts`, 11 em
`tests/dominio/migracoes.test.ts`, 1 em `tests/dominio/sincronia.test.ts`.

**Nenhum caso existente mudou de asserção, foi apagado, pulado ou enfraquecido.**
O flake conhecido do `navegacao` não apareceu em nenhuma execução desta sessão:
**seis** da suíte inteira (duas delas em *worktree*, na §7) e **uma** só de
`tests/fluxo/`.

---

## 2 · O defeito

### A aritmética, conferida

Um passo vale 120 g de arroz pelo **dia inteiro**, e o passo se **reparte** entre
os itens marcados com `arroz` (`src/dominio/nutricao/calculo.ts`):

```
PASSO_ARROZ = 120
arrozDoAjuste(base, ajuste, refeicoes)
  passo = round((ajuste * 120) / max(1, refeicoes) / 15) * 15
  → max(0, round(base) + passo)
```

**Uma correção ao briefing:** o resultado passa por `Math.max(0, …)`. O briefing
omitiu o clamp, e ele é material — um corte que esbarra no zero dá **menos** do
que o passo pediu, e é o que ele deu que tem de voltar. A §4 trata disso.

`aplicaArroz(ajusteAntes)`, em `src/main.jsx`, fazia em cada item marcado:

```
base = arrozDoAjuste(i.q, -ajusteAntes, itens.length)   // DESFAZ o anterior
i.q  = arrozDoAjuste(base,  S.ajuste,   itens.length)   // aplica o novo
```

**O erro:** o desfazer divide por `itens.length`, que é a contagem **de agora**,
não a de quando somou. O comentário dizia *"com o passo na grade de 15 g, ida e
volta são exatas"* — verdade **só se a contagem for a mesma nas duas pontas**.

### Reproduzido, com os números

**Medido** (`tests/fluxo/ajuste.test.js`, pelos verbos do app): almoço 250 e
jantar 250, ajuste a zero. Sobe um passo → dois itens → +60 em cada → **310 e
310**. O arroz do almoço vira cuscuz → só o jantar tem marca. O saldo volta a
zero → o desfazer acha **um** item e tira **120** → jantar em **190**. E o
almoço fica com os **+60 para sempre**, porque perdeu a marca e o desfazer não
passa mais por ele.

### Quatro caminhos, não dois

O briefing diz dois (`trocaItem` e `removeItem`). **São quatro** — todos medidos,
todos vermelhos antes do conserto:

| caminho | o que muda | o jantar ia para |
| --- | --- | --- |
| `CTX.trocaItem` | a marca cai (decisão de 08/10) | **190** |
| `CTX.removeItem` | o item sai do plano | **190** |
| `CTX.removeRefeicao` | a refeição leva o item junto, **sem passar por `removeItem`** | **190** |
| `CTX.duplicaRefeicao` | clona o item **com a marca**: a contagem SOBE | **265** |

`removeRefeicao` e `duplicaRefeicao` são os que o briefing não listou. A
duplicação é o único caminho do app que faz a contagem **crescer** — e `arroz`
não tem interruptor em tela nenhuma (**conferi**: em `src/main.jsx` a marca só é
lida e deletada; `CTX.refeicaoParaEditar` a devolve mas nenhum verbo a liga). Sem
`restauraPlano`, a marca só pode cair.

### Um bônus que ninguém pediu: a grade de 15 g não é exata sempre

**Medido**, em `node`, com a aritmética de hoje e a **contagem inalterada**:

```
n=1  250 → 370 → 250   exata
n=2  250 → 310 → 250   exata
n=3  250 → 295 → 250   exata
n=8  250 → 265 → 250   exata
n=16 250 → 265 → 265   DERIVA de 15 g
```

A causa: `Math.round(-0.5)` é `-0` e `-Math.round(0.5)` é `-1`. Com 16 itens
marcados e um passo, a ida arredonda 0,5 para cima e a volta arredonda −0,5 para
zero. **Não é alcançável no plano dele** (dois pratos; só `duplicaRefeicao`
faria a contagem subir, e seriam precisos 16). Fica registrado porque é um
contraexemplo ao comentário do fonte, e porque o conserto o elimina de lado: o
desfazer passou a subtrair o valor gravado, sem arredondar de novo.

---

## 3 · O caso que nasceu vermelho

Escrevi os cinco casos de fluxo **antes** do conserto e rodei contra o build
intocado (`npx vitest run --project fluxo tests/fluxo/ajuste.test.js`, com
`dist/` do `5108800`). **Medido, os cinco nasceram vermelhos:**

```
× trocar o arroz de um prato não tira comida do outro
    o jantar volta à PRESCRIÇÃO, não a 190 …          190 !== 250
× perder a marca do arroz devolve a parte daquele item
    devolve os 60 g que o ajuste lhe deu …            310 !== 250
× remover o arroz de um prato não tira comida do outro
    o jantar volta à prescrição, e não a 190          190 !== 250
× remover a refeição inteira não tira comida da outra
    o jantar volta à prescrição                       190 !== 250
× duplicar a refeição com arroz não tira comida de ninguém
    Almoço volta à prescrição                         265 !== 250
```

Esse vermelho é a prova de que o defeito é real, nos quatro caminhos, pelos
verbos do app e contra o build.

O caminho de volta do saldo nos casos usa o app de verdade, e não uma escrita em
`S`: o veredito vira **"Comer menos"** (série de peso + leitura das fotos) e
`ctx.aplicaAjuste` leva o saldo de +1 a 0. É o único jeito de o teste exercitar
o desfazer pelo mesmo caminho que o dono.

---

## 4 · A forma do campo, e por que essa

`Item.ajq` — **quanto de `q` veio do ajuste calórico**, nas unidades do item.

```ts
/** este item é a fonte de arroz que o ajuste calórico move */
arroz?: boolean;
/** só entra em dia de alta demanda */
alta?: boolean;
/** 1 quando o item é fonte de CAFEÍNA */
caf?: 1;
/** quanto de `q` veio do ajuste calórico */
ajq?: number;
```

**A diferença está escrita no tipo:** `arroz`, `alta` e `caf` são **marcas** —
dizem o que o item é ou quando ele aparece, são booleanas, e quem as lê não faz
conta com elas. `ajq` é **valor**: tem sinal e unidade, soma e subtrai de `q`, e
a aritmética dele é a do prato. Por isso o nome não é adjetivo — é `aj` de
ajuste mais o `q` de quantidade: *a parte de `q` que o ajuste pôs lá*.

A invariante é uma só: **`q − ajq` é a prescrição**. Ausente = zero, que é o caso
dominante (todo item que o ajuste nunca tocou) e por isso não se grava — a mesma
disciplina de `como`, de `aguaNaoContada` e de `aderencia`.

### Por que valor, e não "lembrar a contagem"

A alternativa era guardar `nItens` no momento da soma e dividir por ela ao
desfazer. Rejeitada: continua sendo recálculo, e **não sobrevive ao clamp**. Um
corte de −120 num prato de 50 g só consegue tirar 50; o passo pedido e o passo
dado são números diferentes, e é o **dado** que tem de voltar. Por isso `ajq` é
gravado como `q − base` **depois** do clamp. **Medido**
(`tests/dominio/nutricao.test.ts`): 50 g, um corte, prato a 0, `ajq` = −50, volta
a 50 — e não a 120.

### O que NÃO mudou

**Aplicar continua dividindo pela contagem de agora.** O passo é do dia e se
reparte entre os pratos que existem hoje, que é o que o plano prescreve. Conferi
a aplicação e **não achei defeito nela**: o briefing pediu que eu parasse e
escrevesse se achasse, e não há o que escrever.

`CTX.setQuantidade` também não mudou. Quando o dono digita uma quantidade à mão
com um ajuste em vigor, `ajq` fica onde está — o número digitado é lido como "o
prato de hoje, ajuste incluído", que é exatamente a leitura de hoje. **Não
medido** se é a leitura que ele quer; é a que preserva o comportamento, e mexer
nela seria decidir no lugar dele.

---

## 5 · A migração, e por que ela não muda nada retroativamente

**A proposta do briefing se sustenta.** `migraPlano12` escreve, para cada item
com `arroz`, o valor que **o código de hoje usaria para desfazer**:

```
cada = round(S.ajuste * 120 / contagemAtual / 15) * 15
```

**Por que se sustenta:** esse é, byte a byte, o número que
`arrozDoAjuste(q, -S.ajuste, n)` subtrairia de cada prato no próximo ajuste. O
comportamento imediatamente depois da migração é **idêntico ao de hoje** —
nenhum prato muda, nenhum total congelado é tocado — e a partir dali todo
desfazer é exato. **Medido**, com uma asserção que compara os dois cálculos:
*"11→12 escreve o valor que o código de hoje usaria para desfazer"*.

**Por que a migração é necessária** (não é analogia, é o portão): sem `ajq`, o
desfazer novo subtrai **zero**. Um aparelho com saldo −1 e dois pratos a 190
levaria o próximo corte a **70 g** em vez de 130 — perda nova, no primeiro
ajuste depois do build. O campo é novo **e** persistido, dentro de um documento
que já está no aparelho dele: migração.

### O que ela deliberadamente não faz

- **Não reconstrói o passado.** Dava para inferir `ajq` comparando `q` com a
  quantidade do `PLANO_BASE` — 310 − 250 = 60 —, e isso até acertaria o jantar
  do caso medido. **Rejeitado:** o plano é editável e `setQuantidade` existe. Num
  plano em que ele cortou o arroz para 150 à mão, a inferência escreveria −100 e
  inventaria um ajuste que nunca houve, num campo que depois **sai do prato**. O
  teste da 10→11 já usa esse exato cenário (`plano[3].itens[0].q = 150`) para
  provar que migração não presume plano igual à base.
- **Não conserta a marca que já caiu.** Se ele JÁ trocou o arroz do almoço com um
  passo em vigor, aquele item levou os 60 g e não tem mais marca: a migração não
  o vê, escreve 120 no único prato que restou, e o primeiro desfazer ainda cai
  para 190. **Medido**, e é o preço de não adivinhar — *"11→12 não conserta a
  marca que já caiu, e o número diz isso"*, que também prova que **do segundo
  desfazer em diante não desce mais**.
- **Não grava o padrão.** Saldo zero → nada escrito, porque ausente já quer
  dizer zero.

### Dois resíduos, ditos por extenso

1. **Prato clampado em zero.** Com saldo muito negativo e `q` em 0, a migração
   escreve o passo cheio e o primeiro desfazer sobe o prato **acima** da
   prescrição — exatamente como hoje faria. Fidelidade ao briefing escolhida de
   propósito; capar o valor seria mudar o prato retroativamente. Da primeira
   aplicação nova em diante o registro é o valor dado e o resíduo desaparece.
   **Não medido** contra o aparelho dele: exigiria saldo de −5 passos (−750 kcal),
   que não é estado que o ledger mostre.
2. **Plano mexido entre a migração e o próximo ajuste.** O valor gravado é a
   estimativa do instante da migração. É o melhor que o dado permite, e é exato
   da próxima aplicação em diante.

### A fixture

`tests/dominio/fixtures/estado-plano-11.json` — **o dado da época, não um objeto
com a forma de hoje**, pelo método das fixtures 9 e 10 (`fixtures/LEIA.md`):
build do **plano 11** numa *worktree* em `5108800` (o fonte da árvore de trabalho
já estava consertado, e o build tinha que ser o antigo), `Date.now` fixado em
08/10/2026 07h55, o dia de 07/10 vivido pelos verbos do app e fechado na virada
da data, o passo aplicado por `CTX.aplicaAjuste`, e `JSON.stringify(S)` do disco
gravado sem edição.

O que ela prova: `ajuste` 1 com o ledger; os dois pratos em **310 g**; a string
`ajq` **ausente do estado inteiro**; o dia fechado com `tot.kcal` congelado em
**2.632,06** e a meia porção do lanche dentro dele.

**Dito às claras no `LEIA.md`:** os catorze dias anteriores do histórico são
**andaime escrito à mão** — existem só para destravar a adesão de 11 em 14 que o
ajuste exige, porque viver catorze dias pelo app não é factível. O que a fixture
prova de verdade está no dia fechado pelo app e no plano.

**De passagem, a fixture registrou um defeito que não é meu:** `comida.v` é igual
ao `pv` do dia fechado, **mesmo com o ajuste tendo movido 120 g de arroz dentro
do plano depois do fechamento**. `CTX.aplicaAjuste` não chama `planoMudou()`.
Consequência: um dia fechado antes do passo parece calculado contra o plano
atual, e não está — o app **sub-relata** divergência. Está fora do escopo deste
conserto e **não foi mexido**; a asserção existe para que a próxima passada não
precise descobrir de novo.

---

## 6 · Os seis portões, um por um

### 1 · O tipo

**Feito.** `Item.ajq` em `src/dominio/nutricao/tipos.ts`, com a diferença entre
**marca** e **valor** escrita no comentário, a invariante `q − ajq`, o motivo
(o desfazer recalculado, com o número medido), a decisão do dono de 08/10 e a
razão dela (o caminho de menor esforço tem de ser o conservador), e a nota de
que `ajq` é gravado **depois** do clamp.

### 2 · `migraPlano12`, `PLANO_ATUAL` e fixture

**Feito.** `PLANO_ATUAL` de **11** para **12**, `migraPlano12` ligada nos
**dois** caminhos — boot (`load()`) e **importação** (`importText`) —, porque
`ARQUITETURA` manda e porque a 7 e a 8 já tinham ficado de fora da importação
uma vez. Fixture pelo método das 10 e 11 (§5). Os dois números do passo entram
**congelados** na migração (`PASSO_ARROZ_PLANO_12`, `GRADE_ARROZ_PLANO_12`), com
teste de paridade contra `PASSO_ARROZ` — o mesmo padrão de `CEIA_PLANO_11`, e com
a mesma instrução no teste: se ficar vermelho, a saída é uma migração nova, não
copiar o número.

### 3 · Regra de fusão

**Não precisa de chave, lápide nem teto — e o portão é que diz isso, não a
analogia.** `ajq` mora dentro de `S.comida.plano`, que é **documento**: `funde()`
clona o lado com `mtime` maior inteiro e depois sobrescreve o que não é
documento (**conferi** `src/dominio/sincronia.ts`: fundem por chave natural
`logs`, `done`, `cardio`, `comidaHist`, o dia aberto, `aulas`, `promoPendente`,
`gordura`, `body`, `progLog`, `protocolo.sessoes`, `descanso` e `fotos`; e têm
regra própria `quadro` (o mais recente), `ex` e `carga` (união de mapas) e
`export` (o máximo). O plano **não está em nenhum dos dois grupos**, de
propósito — "documento se edita deliberadamente, num aparelho por vez").

Há **uma janela**, a mesma da ceia: o aparelho atrasado pode vencer o documento e
levar `ajq` embora junto com `plano`, e o boot seguinte reescreve os dois. Caso
novo em `tests/dominio/sincronia.test.ts`, ao lado do da ceia. **O que importa é
a direção da falha dentro da janela:** sem `ajq`, o desfazer subtrai zero e o
prato **fica onde está** — erra para cima, que é o lado conservador. O defeito
fazia o contrário.

### 4 · As duas listas brancas da cópia

**Conferi as duas, e nenhuma precisou de linha nova** — mas a leitura virou
teste, porque a promessa de um comentário já falhou duas vezes aqui:

- **importação** (`importText`, `src/main.jsx`): copia `comida` como objeto
  inteiro (`(d.comida && typeof d.comida === 'object') ? d.comida : null`). `ajq`
  viaja dentro.
- **apagar histórico** (`wipe`, `src/main.jsx`): reconstrói `S` à mão e preserva
  `comida: S.comida` de propósito — apagar histórico de treino não é apagar o
  plano nutricional.

A exportação não é lista branca: `payload()` é `JSON.stringify(S)` inteiro.

Caso novo em `tests/fluxo/dados.test.js`: *"o que o ajuste deu a cada prato sai e
volta nas duas listas brancas"* — escreve `ajq`, exporta, confere que saiu,
apaga o histórico, confere que o plano sobreviveu, zera o plano, importa e
confere que voltou. **Medido**: tirar `comida` de qualquer uma das duas listas
deixa o caso vermelho (§7, B13 e B14).

### 5 · `npx tsc --noEmit`

**Medido, limpo**, na árvore final e nas duas *worktrees* dos commits
intermediários.

### 6 · A disciplina do total congelado

**O campo não alcança a regra do nutricionista, e isso está provado, não
suposto.** `ajq` não entra em conta nenhuma: `totalDoItem` lê só `q`, e `q` já é
o prato de hoje. Dois casos novos:

- *"o registro do ajuste não entra em conta nenhuma"* — o mesmo prato soma o
  mesmo com e sem `ajq` (**medido**: 397 kcal para 310 g).
- *"11→12 não reescreve byte nenhum do histórico congelado"* — `comidaHist`
  idêntico antes e depois, contra um dia realmente fechado pelo app.

Se `ajq` entrasse em `totalDoItem`, o alvo calórico — e por ele o `tot` congelado
de cada dia — passaria a depender de um campo que existe para poder ser
desfeito. É o tipo de erro que o tipo chama de mentir sobre o passado.

---

## 7 · A prova de vermelho, caso por caso

Cada quebra foi aplicada no fonte, rodada, lida e **devolvida** (cópia guardada
fora do repositório — nenhum `git checkout` com conserto não commitado na
árvore). Para fluxo, `npx vite build` entre a quebra e a rodada.

| # | quebra | tipo | casos que ficaram vermelhos |
| --- | --- | --- | --- |
| **B1** | `quantidadePrescrita`: `q − ajq` → `q + ajq` | sinal | 7 (5 em nutrição, 2 em migrações) |
| **B2** | `ajusteNoItem`: fora a guarda de `isFinite` | guarda | *item sem registro de ajuste é prato intocado* |
| **B3** | `aplicaAjusteNoArroz`: grava o **passo pedido** em vez de `q − base` | o clamp | *o corte que esbarra no zero grava o que deu* |
| **B4** | `tiraMarcaDeArroz`: a marca cai **sem devolver** | omissão | *perder a marca devolve a parte daquele item* + *depois da 11→12 o desfazer é exato* |
| **B5** | `CTX.trocaItem`: **reaplica** o ajuste depois de tirar a marca | **sentido oposto** | *perder a marca do arroz devolve a parte daquele item* — `370 !== 310` |
| **B6** | `migraPlano12`: fora o portão do saldo, grava `ajq: 0` | **sentido oposto** | *11→12 sem saldo em vigor não escreve nada* |
| **B7** | `migraPlano12`: a varredura alcança o feijão | **sentido oposto** | 6, inclusive *11→12 não toca em item que não é fonte de arroz* |
| **B8** | `PASSO_ARROZ_PLANO_12` = 135 | divergência | 6, inclusive *o passo congelado é o mesmo de hoje* |
| **B9** | `totalDoItem`: passa a descontar `ajq` | **sentido oposto** | *o registro do ajuste não entra em conta nenhuma* |
| **B11** | `migraPlano12`: zera `tot.kcal` do histórico | **sentido oposto** | *11→12 não reescreve byte nenhum do histórico congelado* |
| **B12** | `funde`: o plano vem sempre do lado local | **sentido oposto** | *o registro atravessa a janela* + o caso da ceia |
| **B13** | `importText`: a lista branca perde `comida` | omissão | *sai e volta nas duas listas brancas* — `250 !== 310` |
| **B14** | `wipe`: a lista branca perde `comida` | omissão | *sai e volta nas duas listas brancas* — `undefined !== 60` |

As asserções **negativas** e a quebra que as prova:

- *"e o outro prato não é tocado"* (fluxo) → **B5**, sentido oposto: o verbo
  fazendo **mais**, não menos. Com o verbo inerte o caso **falha por outra
  asserção**, então ele não passaria morto de qualquer forma — mas a prova da
  negativa é a B5.
- *"não toca em item que não é fonte de arroz"* → **B7**. Registro de método: a
  primeira tentativa (fazer a varredura pegar **todos** os itens) deixou o caso
  **verde**: o plano da fixture tem **32** itens, e `round(120/32/15)*15` é
  **zero** — a migração não escrevia nada. Troquei por uma quebra que alcança só
  o feijão — quatro itens, passo de 30 g, escrita de verdade — e aí ficou
  vermelho. **Quebra que não fica
  vermelha não é prova; é outra quebra.**
- *"sem saldo em vigor não escreve nada"* → **B6**.
- *"não reescreve byte nenhum do histórico"* → **B11**.
- *"o registro do ajuste não entra em conta nenhuma"* → **B9**.

**Um caso foi descartado por ser infalsificável:** *"aplicar sem item marcado não
é erro"*. `aplicaAjusteNoArroz([])` é verde com a guarda, sem a guarda e com o
verbo inerte — `forEach` em lista vazia não faz nada. Em vez de deixar um caso
que não sabe ficar vermelho, **tirei o caso e tirei a guarda morta** do fonte.

### Os commits, e a prova de que cada um é verde

Três commits de código, verificados **no próprio commit** em *worktree*
separada (`vite build` + `vitest run` + `tsc --noEmit`):

| commit | peça | medido |
| --- | --- | --- |
| `d39cf1b` | a regra e o tipo (`tipos.ts`, `calculo.ts`, nutrição) | **1.087 passando**, 53 arquivos, `tsc` limpo |
| `205b2aa` | a migração, a fixture e a fusão (`PLANO_ATUAL` ainda **11**) | **1.099 passando**, 53 arquivos, `tsc` limpo |
| `4065d4c` | o conserto no app, o `PLANO_ATUAL` **12** e as duas listas brancas | **1.105 passando**, 53 arquivos, `tsc` limpo |

A ordem é forçada pelo `PLANO_ATUAL`: subi-lo antes de ligar a `migraPlano12` em
`main.jsx` deixaria vermelhos todos os casos que cobram *"a cadeia inteira
rodou"*. Por isso o commit da migração entra com `PLANO_ATUAL = 11` e o commit do
conserto o sobe junto com a ligação.

---

## 8 · Onde o código discordou do que me foi dito

1. **O clamp em zero não estava no briefing.** `arrozDoAjuste` termina em
   `Math.max(0, …)`. Material: define `ajq` como *o que foi dado*, e não *o passo
   pedido* (§4).
2. **São quatro caminhos de reprodução, não dois.** `removeRefeicao` e
   `duplicaRefeicao` também (§2). Os dois primeiros dão 190; a duplicação dá 265.
3. **Em `removeItem` não há o que devolver** — o briefing pede a devolução nos
   dois caminhos. O item **sai do plano** e leva os gramas; não existe prato para
   devolvê-los. O que o defeito tirava ali era comida dos **outros** pratos, e é
   isso que o conserto impede. Vale igual para `removeRefeicao`. A devolução só
   faz sentido onde o item **fica** e perde a marca: `trocaItem`.
4. **"Ida e volta são exatas" é falso para 16 itens marcados**, mesmo com a
   contagem inalterada (§2). Inalcançável no plano dele.
5. **Nenhuma regra de fusão era necessária** (§6.3) — e a razão não é analogia
   com campo antigo, é que o plano é documento e não coleção.
6. **Nenhuma linha nova nas duas listas brancas** (§6.4). As duas levam `comida`
   inteiro. O que faltava era teste, e agora existe.
7. **Um defeito novo, fora do escopo:** `CTX.aplicaAjuste` não chama
   `planoMudou()`, então mover 120 g de arroz no plano persistido **não carimba a
   versão do plano** — a fixture registra o número (§5). Não mexido.
8. **Um defeito menor, fora do escopo:** `CTX.restauraPlano` chama `planoMudou()`
   **antes** do `confirm`, então cancelar a restauração sobe a versão do plano de
   qualquer forma. **Conferi** no fonte; não mexido.

---

## 9 · O que eu não medi

- **O aparelho dele.** Toda medição é do build no `jsdom` do harness. Não rodei
  no iPhone, não conferi o estado real dele, e portanto **não sei se ele já
  perdeu alguma marca de arroz com um passo em vigor** — que é o único caso em
  que a migração não consegue consertar o passado (§5).
- **O resíduo do prato clampado em zero** (§5): exigiria um saldo de −5 passos,
  que o ledger dele não mostra.
- **Se "o número digitado à mão inclui o ajuste" é a leitura que ele quer**
  (§4). Mantive o comportamento de hoje.
- **O `caf`.** Continua intocado, de propósito, como o comentário do `trocaItem`
  já dizia: é da mesma natureza de `arroz`, mas o dono não a decidiu e ela não
  entra em tela nenhuma.
- **A tela.** `arrozAtual()` soma `q` e não foi tocado, então o rótulo
  *"arroz N g"* continua igual; mas **não há nada em tela que diga que um item
  devolveu gramas ao perder a marca**. O toast da troca não menciona. Se isso
  merece palavra na tela, é decisão de produto, e não medi nada sobre ela.
- **Mais de dois pratos de arroz na prática.** A aritmética de 3, 4, 8 e 16
  itens está medida em teste e em `node`, mas nenhum plano real foi observado com
  mais de dois.
