# 09 · A superfície de verbos — entrega (c) da frente 0

A frente 0 entregou a lista branca da importação (`6035a5c`), o inventário dos
testes (`08-rede.md`) e a migração única (`09-frente0.md`). Esta é a quarta
coisa, a que o próprio documento da frente 0 declarou não ter feito:

> *"Não acrescentei verbos novos ao `CTX`. (…) A superfície de verbos estável é
> a entrega (c) da frente 0, que não é esta."* — `09-frente0.md` §5

É a entrega em que todo o argumento de "reescrita reversível" se apoia. Sem ela,
os casos que não dependem de pixel não têm por onde entrar quando a interface
mudar, e a reescrita é um salto no escuro.

**Nenhuma linha deste arquivo tem estimativa de prazo.** Onde não houve medição,
está escrito que não houve.

## Convenção de prova

- **conferi** — abri o arquivo e contei nesta sessão, com o caminho ao lado.
- **medido** — rodei e li o número de saída, com o comando ao lado.
- **não medido** — ninguém mediu, e eu não invento número.

## A linha de base, confirmada antes de tocar em nada

**Medido**, `npm test`, 06/10: **965 passando** — `tests/fluxo/` **520**,
`tests/dominio/` **445** —, **53 arquivos**, **zero** rejeições não tratadas.
`npx tsc --noEmit` sai limpo. Bate com o que o briefing afirmava e com a
retificação de 06/10 do `08-rede.md`, nos cinco números.

**Medido ao fim desta entrega: os mesmos 965, os mesmos 53 arquivos, zero
rejeições, `tsc` limpo.** Nenhum caso foi apagado, pulado, renomeado, nem teve
asserção trocada por uma mais fraca. Os 445 de domínio nunca ficaram vermelhos.

---

## 1 · A superfície: o que é, e por que esta forma

### O problema não era `CTX` ser pequeno demais

`CTX` tem **181 chaves** e já é quase completo. O problema é que **ele não é
alcançável sem `eval`**, e que a `eval` alcança muito mais do que ele.

A ponte é `window.__escopo = function (codigo) { return eval(codigo); }`
(`src/main.jsx`). Três coisas sobre ela, e as três são razão para não construir
a rede nova em cima dela:

1. **O alcance dela não é `main.jsx` — é o escopo de topo do bundle inteiro.**
   Depois do rollup, todos os módulos de `src/` são achatados num escopo só, e a
   `eval` vê todos. **Conferi**: `tests/fluxo/fotos.test.js` chama
   `a.E('migraCache()')` pelo nome nu, e `migraCache` **não existe em
   `main.jsx`** — mora em `src/infra/fotos.js` e chega lá como
   `FOTO.migraCache`. A superfície que a suíte usa hoje não são as 341 funções
   de `main.jsx`: é tudo que o bundle declara no topo. **Nada disso prometeu
   nada a ninguém.**
2. **Nada é alcançado por referência, então nada é verificável.** Um nome errado
   só aparece como `ReferenceError` em tempo de execução. Renomear uma função
   interna quebra testes sem um aviso do compilador, do bundler ou do `tsc`.
3. **`treeshake: true` apaga o que só a string alcança.** Isto não é teoria, e eu
   **medi** nesta sessão. No commit das assinaturas novas (`499dcb6`),
   `anotaHoraAvulsa` — a única das onze que nenhuma casca chamava — **saiu do
   bundle**:

   ```
   grep -c "function anotaHoraAvulsa" dist/assets/index-*.js   → 0
   ```

   No commit seguinte, que só a nomeia dentro da tabela, ela voltou (→ 1). É o
   mesmo mecanismo que já enganou um agente aqui e inverteu a medição dele.

### A forma escolhida

`window.__modelo`, um objeto literal declarado em `src/main.jsx` ao lado de
`__escopo`, com quatro partes:

| parte | o que é | tamanho |
|---|---|---:|
| `contrato` | o número de versão da superfície | `1` |
| `ctx` | o próprio `CTX`, por referência | 181 chaves |
| `nuvem` | o próprio `NUVEM`, por referência | — |
| `verbos` | tabela de verbos por valor | **147** |
| `dado` | leituras nomeadas, todas `get` | **23** |

Mais três portas que existem só para atravessar o realm do jsdom: `chama`,
`chamaJSON` e `leJSON`.

**Por que em `window` e não em `CTX`.** O ponto da entrega é entrar **sem
`eval`**, e `CTX` só é alcançável por dentro do escopo do módulo. E a atribuição
`window.__modelo = SUPERFICIE` é, ela mesma, efeito colateral de topo: é o que
faz o rollup manter a tabela, e com ela cada função que a tabela nomeia. O
raciocínio que pôs `CTX.desliga` em `CTX` e não em `window` — *"`CTX` escapa como
prop e sobrevive ao treeshake"* — vale aqui pela via da atribuição, e **conferi
no bundle** que vale: `grep -c "__modelo" dist/assets/index-*.js` → 1, e a
tabela aparece inteira, `verbos:{anotaSerie,anotaSerieRapida,…`.

### O contrato, escrito

Está no fonte, em cima da tabela, e é o que torna a superfície reusável depois da
reescrita:

- **Nenhuma chave recebe elemento do DOM, nem devolve um.** Todo argumento é
  valor: número, texto, booleano ou dado puro. Quem lê campo é casca da
  interface, e casca não entra na tabela. **Duas exceções declaradas:**
  `tiraFoto` e `tiraFotoDoCorpo` recebem um pato `{ files, value }` — era
  convenção dos testes, e passou a estar escrita.
- **Chamar um verbo daqui faz o que o dedo faz.** A interface não tem rota
  paralela: ela lê o campo e chama o mesmo verbo.
- **`verbos` é verbo; `dado` é leitura.** `dado` é tudo `get`, porque `S`, `view`
  e `CAT` são **religados** em tempo de execução — importar um backup troca `S`
  inteiro, e `montaCatalogo()` troca `CAT`. Uma cópia por valor na tabela
  apontaria para o estado de antes.
- **Acrescentar chave é livre; tirar e renomear, não.** Quem depende disto é uma
  suíte que a reescrita não pode reescrever.
- **A superfície não escreve no estado.** É a decisão de desenho mais
  importante, e está no §4.

### A porta do harness

`tests/fluxo/harness.js` ganhou seis entradas, e nenhuma delas usa `eval`:

| porta | para quê |
|---|---|
| `a.v(nome, …args)` | chama um verbo e devolve **cru**. `a.v('toggle', 0)`, `a.v('ctx.setAgua', 3)`, `a.v('nuvem.sair')` |
| `a.vJ(nome, …args)` | o mesmo, com o resultado **desserializado** no realm do Node |
| `a.S()` | o estado inteiro, desserializado — no lugar de `a.J('S…')` |
| `a.vista()` | `view`, desserializado — no lugar de `a.J('view…')` |
| `a.dado(chave)` | uma leitura nomeada: `a.dado('CAT')`, `a.dado('PLANO_ATUAL')`, `a.dado('timer')` |
| `a.m` | a superfície crua, no realm do jsdom, para quem precisa do objeto |

**O nome é despachado por string, e isso é de propósito.** A tabela alcança as
funções por referência (é o que vence o treeshake); a string é só o endereço, e
um endereço errado estoura com o nome dentro da mensagem — *"verbo fora da
superfície: xyz"* —, que é o contrário do `ReferenceError` nu da `eval`. Quem
preferir acesso direto tem `a.m.verbos.toggle(0)`, com a ressalva de realm do §4.

---

## 2 · As assinaturas por valor, uma a uma

Onze funções novas, todas em `src/main.jsx`, commit `499dcb6`. O padrão é sempre
o mesmo: **a função passa a receber o valor, e quem lê o DOM vira uma casca fina
na interface.** O comportamento não muda, e **nenhum teste foi alterado neste
commit** — os 965 continuaram verdes com os testes de ontem.

### Os cinco de maior alavanca

| antes | agora | o que mudou |
|---|---|---|
| `inp(el, i, k, pos)` | **`anotaSerie(i, k, pos, valor)`** | registrar uma série — carga, repetição, RIR. `valor` aceita número ou texto, com vírgula ou ponto; `''` e `null` apagam a série, que é o gesto de "digitei errado" e continua existindo |
| `criarExercicio()` lia `#nxn #nxg #nxc #nxk #nxu #nxq` | **`criarExercicioCom({ nome, grupo, carga, composto, unidade, q })`** | `carga` cai em `'pino'` e `unidade` em `''` quando vêm vazias, como o formulário já fazia: o padrão é do campo, não do chamador |
| `guardaCamposEdicao()` lia `#ed{k}_0`, `#ed{k}_1`, `#edobs` | **`guardaEdicaoCom(sets, obs)`** | `sets` é a lista na ordem das séries, cada item `[carga, reps]`. Item `null`/ausente **não mexe** naquela série — é o `if (!a || !b) return` da leitura por id, que existia para o re-render dos chips não apagar o que ainda não estava na tela. `obs === undefined` também não mexe; `''` apaga |
| `atualizaPrescricao(i)` escrevia em `#presc{i}` | **`textoDaPrescricao(i)`** | devolve o texto (`3 × 10–15`, `5 × 400 m`) e `null` quando não há exercício ali. `atualizaPrescricao` ficou sendo só o `textContent =` |
| `buscaEx(q)` mexia em `document.activeElement` | **`setBuscaDeExercicio(q)`** | o estado e o `render()`. Devolver o foco — manter o teclado aberto — ficou na casca, porque é capacidade de tela e é o que o caso cobra |

### Dos sete que recebiam elemento, seis têm par por valor

| função | par por valor | feito? |
|---|---|---|
| `inp(el, i, k, pos)` | `anotaSerie(i, k, pos, valor)` | ✅ |
| `inpRapido(el, i, pos)` | `anotaSerieRapida(i, pos, valor)` | ✅ |
| `obsIn(el, i)` | `anotaObservacao(i, texto)` | ✅ |
| `addNome(el)` | `anotaNomeAvulso(nome)` | ✅ |
| `addHora(el)` | `anotaHoraAvulsa(txt)` + `mascaraDeHora(txt, digitando)` | ✅ |
| `limpaNum(el, dec)` | `soNumero(v, dec)` + `filtroNum(dec)` | ✅ |
| `importFile(input)` | — | ❌ **não fiz**, e o §4 diz por quê |

### Três cuidados que valem registro

1. **`inp`: a ordem do `classList.toggle('done')` mudou de lugar, e é
   inobservável.** No original a pintura vinha depois da escrita no rascunho;
   agora vem antes, porque a escrita mudou de função. **Conferi** que as duas
   são comutativas: a escrita não lê `classList`, a pintura não lê o rascunho, e
   tudo que corre depois (`segurarTela`, `projeta`, `atualizaEstado`,
   `atualizaAnilhas`, `queueSave`, `autoTimer`) corre depois das duas nas duas
   ordens.

2. **`inpRapido`: a guarda ficou duplicada de propósito.** No original, posição
   sem exercício saía **antes** de `limpaNum`, então o campo não era reescrito e
   o `done` não era pintado. A casca repete o `if (!treino(view.day).ex[i])
   return` para que isso continue verdade; o comentário no fonte diz isso.

3. **`mascaraDeHora` tem um segundo argumento, `digitando`.** O `:` automático
   depois do segundo dígito existe para poupar uma tecla de quem digita — não
   para reinterpretar `'06'` vindo por valor. `addHora` passa
   `el.value.length === 2`, que é exatamente a condição do original;
   `anotaHoraAvulsa` passa `false`.

### `tiraFoto` e `tiraFotoDoCorpo`: convenção virou contrato

A rede observou que os testes já os chamam com um objeto falso, *"então na
prática são verbo (…) hoje é convenção, não contrato."* Agora está escrito no
contrato da superfície, como as duas exceções declaradas. **Não dei a eles um
verbo novo** — ver §4.

---

## 3 · A reponta, arquivo por arquivo

### O número

**Medido** por varredura dos 33 arquivos de `tests/fluxo/`, contando as
ocorrências de `a.E(` e `a.J(`:

| | antes (`f985f74`) | agora |
|---|---:|---:|
| entradas por `eval` (`a.E` / `a.J`) | **1 928** | **394** |
| entradas pela superfície (`a.v`, `a.vJ`, `a.S`, `a.vista`, `a.dado`) | 0 | **1 538** |

**−80% da ponte de escopo.** Cinco arquivos ficaram **inteiramente** fora dela:
`cardio`, `leitura`, `migracaochave`, `navegacao` e `publicacao` (este último
nunca a usou — não abre o app).

### Tabela

As três últimas colunas classificam o que **ficou**, e o §3.3 explica cada
categoria.

| Arquivo | Casos | `a.E` antes | `a.E` agora | pela superfície | escreve `S` | DOM | composta | sobra simples |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `ajuste` | 14 | 56 | 6 | 50 | 5 | 1 | 0 | 0 |
| `aula` | 14 | 62 | 8 | 54 | 7 | 0 | 1 | 0 |
| `aulaimport` | 14 | 34 | 13 | 21 | 0 | 1 | 12 | 0 |
| `avanco` | 10 | 40 | 8 | 32 | 0 | 0 | 8 | 0 |
| `cardio` | 10 | 9 | **0** | 9 | 0 | 0 | 0 | 0 |
| `carga` | 11 | 29 | 3 | 26 | 0 | 0 | 3 | 0 |
| `ciclo` | 18 | 97 | 26 | 71 | 8 | 0 | 13 | 5 |
| `corpo` | 25 | 71 | 15 | 56 | 3 | 0 | 12 | 0 |
| `cronometro` | 12 | 43 | 4 | 43 | 2 | 2 | 0 | 0 |
| `dados` | 22 | 123 | 32 | 91 | 15 | 0 | 11 | 6 |
| `diario` | 9 | 31 | 5 | 26 | 4 | 0 | 1 | 0 |
| `edicao` | 27 | 164 | 33 | 131 | 2 | 2 | 21 | 8 |
| `esquecido` | 6 | 18 | 4 | 14 | 3 | 0 | 1 | 0 |
| `fluxo` | 5 | 82 | 8 | 74 | 1 | 2 | 4 | 1 |
| `fotos` | 20 | 69 | 33 | 36 | 4 | 25 | 2 | 2 |
| `fusao` | 24 | 93 | 30 | 63 | 6 | 0 | 22 | 2 |
| `horario` | 14 | 43 | 11 | 32 | 0 | 0 | 2 | 9 |
| `leitura` | 3 | 1 | **0** | 1 | 0 | 0 | 0 | 0 |
| `migracaochave` | 7 | 7 | **0** | 7 | 0 | 0 | 0 | 0 |
| `navegacao` | 9 | 23 | **0** | 23 | 0 | 0 | 0 | 0 |
| `programa` | 12 | 44 | 16 | 28 | 2 | 0 | 10 | 4 |
| `promocao` | 9 | 47 | 5 | 42 | 1 | 2 | 0 | 2 |
| `protocolo` | 58 | 238 | 39 | 199 | 8 | 13 | 14 | 4 |
| `publicacao` | 13 | **0** | **0** | 0 | 0 | 0 | 0 | 0 |
| `retro` | 9 | 53 | 7 | 46 | 1 | 0 | 4 | 2 |
| `ritmo` | 19 | 55 | 34 | 21 | **25** | 0 | 9 | 0 |
| `serie` | 9 | 24 | 8 | 16 | 0 | 8 | 0 | 0 |
| `sessao` | 26 | 86 | 12 | 74 | 0 | 0 | 2 | 10 |
| `sincronia` | 12 | 51 | 7 | 44 | 0 | 5 | 2 | 0 |
| `telaprograma` | 23 | 96 | 8 | 88 | 2 | 0 | 4 | 2 |
| `telas` | 39 | 56 | 8 | 48 | 4 | 0 | 1 | 3 |
| `trocaprograma` | 8 | 66 | 5 | 61 | 0 | 0 | 4 | 1 |
| `turno` | 9 | 17 | 6 | 11 | 0 | 0 | 5 | 1 |
| **TOTAL** | **520** | **1 928** | **394** | **1 538** | **103** | **61** | **168** | **62** |

### 3.1 · A disciplina, cumprida

- **Um commit por arquivo.** Cada arquivo de teste tem commit próprio, e são
  cinco passadas: a reponta dos verbos, as leituras de estado, o idioma da
  concatenação, a chamada seguida de caminho, e o `JSON.stringify` dispensado.
  **A suíte está verde em cada commit** — os arquivos de teste são independentes
  entre si, então um commit que repontou só `A` carrega `A` verde e `B…Z`
  intocados.
- **Nenhum nome de caso mudou. Nenhuma asserção mudou.** O que mudou foi por
  onde o caso entra. **Conferi** no `git diff` de cada passada: as linhas
  trocadas são sempre a forma da chamada, nunca o valor esperado nem a mensagem.
- **Nenhuma asserção baixada, nenhum caso apagado ou pulado.** 520 casos de
  fluxo antes, 520 depois.
- **Os três arquivos de ponto único vieram primeiro**, na ordem pedida:
  `migracaochave` (`c79eaf5`), `navegacao` (`d5a1d79`), `cronometro`
  (`f3bf18e`).

### 3.2 · O que a reponta pegou de errado — e o que isso provou

A reponta foi feita por transformação mecânica, com a suíte do arquivo como
portão. **Ela ficou vermelha uma vez**, e a falha vale mais que o conserto:

```
tests/fluxo/telaprograma.test.js
  ✕ a lista mostra os seis dias e a conta contra o treinador
  ✕ adicionar exercício pela tela de programa é permanente
```

O original era `a.E('abrirPrograma(' + (d ? JSON.stringify(d) : 'null') + ')')`.
O `'null'` ali é **texto de código-fonte**, não valor: a string era costurada
dentro da expressão avaliada. A transformação mecânica virou
`a.v('abrirPrograma', (d ? JSON.stringify(d) : 'null'))`, que passa a **string
`"null"`** onde o app esperava `null` — e dois casos caíram na hora. Consertado à
mão para `a.v('abrirPrograma', d || null)`.

**Este é o modo de falha inteiro da ponte de escopo, num exemplo só:** quando o
argumento é texto de código, "o valor" e "a fonte do valor" se confundem, e nada
no caminho avisa. Por valor, `null` é `null`.

### 3.3 · O que ficou, e por quê — as quatro categorias

**103 · escrevem em `S` ou em `view`.** Cirurgia de fixture no meio do teste:
`a.E('S.ajuste = -2')`, `a.E('view.day = "HX"')`,
`a.E('S.sessao = {day:"HX", inicio:Date.now(), …}')`. **A superfície não cobre
isso de propósito** — ver §4. `ritmo` concentra 25 das 103, e é o arquivo mais
dependente de fixture da suíte.

**61 · alcançam o DOM de dentro do `a.E`.** `document.getElementById(…)` escrito
dentro da string, e os dublês instalados em `globalThis`. São os nove casos que a
rede achou **por leitura e não por medição** (`serie` 5, `cronometro` 2, `edicao`
1, `fluxo` 1) mais os dublês de câmera e de cache de `fotos` (25) e de
`protocolo` (13). São capacidade de tela e de plataforma: **esperam as telas
novas, e não são meus.**

**168 · expressão composta.** Coisas como
`a.J('Object.keys(S.logs).length')`,
`a.J('treino(view.day).ex.filter(…).map(…)')`,
`a.J('S.logs[id("A",0)].length')`. Repontáveis — a superfície tem todas as peças
—, mas cada uma pede que a expressão seja remontada em JavaScript do lado do
teste, e isso é julgamento caso a caso, não transformação. **É aqui que está o
próximo pedaço de trabalho barato.**

**62 · sobra simples.** Duas formas, as duas de conserto curto:
- leituras que a gramática de caminho da minha passada não cobriu —
  `a.E('S.sessao.pausadoEm > 0')`, `a.E('S.quadro ? S.quadro.texto : null')`,
  `a.E('CAT["' + k + '"]')` com concatenação;
- **16 chamadas de verbo** cujos argumentos são concatenados numa forma que a
  passada recusou de propósito: `a.J('periodoDe(…)')` em `horario` (6),
  `a.E('CTX.editaSessao(…)')` e `a.E('CTX.corrigeDuracao(…)')` em `sessao` (6) e
  `retro` (1), `a.E('exDe(…)')` e `a.J('seriesPorMusculo(…)')` em `telas` (2),
  `a.E('FOTO_GUARDA(…)')` em `fotos` (1).

### 3.4 · Onde parei, para o próximo continuar

**Não terminei, e a tabela do §3 é o mapa exato de onde parar.** Em ordem de
retorno por esforço:

1. **Os 62 da "sobra simples"** — mecânicos, e a maioria é uma linha. Começar por
   `horario` (9) e `sessao` (10), que são os dois maiores.
2. **Os 168 de "expressão composta"** — o maior bolo. `fusao` (22), `edicao`
   (21), `protocolo` (14), `ciclo` (13), `corpo` (12), `aulaimport` (12),
   `programa` (10). O padrão: `a.J('F(x).y.z')` já virou `a.vJ('F', x).y.z` nesta
   entrega; o que sobrou precisa de `Object.keys`, `filter` e `map` remontados do
   lado do teste.
3. **As 93 chaves de `CTX` que nenhum teste aciona** (§5) — não é reponta, é
   rede nova, e é a mais barata que existe: o verbo já está no contrato.

**Os cinco scripts da transformação não estão no repo**, de propósito: são
ferramenta de uma passada, não código do produto. O que eles fazem está descrito
acima com precisão suficiente para refazê-los, e o padrão de saída está em cada
commit.

---

## 4 · O que tentei e descartei

**Uma porta de escrita no estado.** Cheguei a desenhar duas formas —
`__modelo.escreve(jsonDoEstado)`, que troca `S` inteiro, e
`__modelo.comEstado(fn)`, que passa `S` para uma função do teste. **Descartei as
duas.** A primeira perde identidade de objeto, e há caminho no app que segura
referência para dentro de `S` (o rascunho, por `draftOf`); trocar `S` inteiro no
meio de um teste muda o que o app está olhando, e seria um modo de falha novo
inventado por mim. A segunda faz uma função do realm do Node escrever objetos do
realm do Node dentro do estado do jsdom — e aí `Array.isArray` sobrevive, mas
`instanceof` não, e o erro apareceria longe da causa.

E há uma razão de desenho acima das duas: **semear estado não é verbo.** Dar a
isso nome estável na superfície seria prometer o formato interno de `S` a uma
suíte que a reescrita não pode reescrever — exatamente a promessa que a
superfície existe para **não** fazer sobre o DOM. As 103 escritas ficam na ponte
de escopo, e isso está escrito no fonte, ao lado do `__escopo`.

**Um verbo por valor para `importFile(input)`.** Não fiz, e não acho que valha.
`importText(txt)` **já é** a porta por valor, está na superfície, e é o que a
suíte usa. O que `importFile` acrescenta é `FileReader` + `input.value = ''` —
plataforma, não modelo. Um `importaArquivo(arquivo)` teria de receber um `File`,
que **não atravessa o realm por JSON** (ver abaixo), e o teste continuaria tendo
de construí-lo dentro do jsdom. Ganharia nada.

**Um verbo por valor para `tiraFoto` / `tiraFotoDoCorpo`.** Mesmo motivo, e com
prova: **conferi** que as 11 chamadas de `tiraFoto` nos testes passam
`{ files: [new Blob(['foto'], { type: 'image/jpeg' })], value: '' }`, e o
`Blob` **tem de nascer no realm do jsdom** — a travessia por JSON o esvaziaria.
Essas chamadas continuaram em `a.E` e é onde elas pertencem. O que fiz foi
transformar a convenção em contrato escrito: duas exceções declaradas, em vez de
um acordo tácito entre o app e os testes.

**Despachar o verbo por acesso direto em vez de por nome.** `a.m.verbos.toggle(0)`
funciona e está disponível, mas não virou a porta principal: argumento que é
objeto, criado no realm do Node, chegaria ao app como forasteiro. `a.v` existe
para atravessar isso (primitivo passa direto, inclusive `undefined` — que `JSON`
apagaria, e há verbo que distingue `undefined` de `null`, como `poeMedida` e
`guardaEdicaoCom`).

**Importar `src/dominio/*` direto nos testes de fluxo.** Sete nomes que a suíte
chama pelo nome nu são regra pura de `src/dominio/` (`funde`, `migraPlano`,
`migraPlano3`, `periodoDe`, `sameDay`, `slugEx`, `weekStart`). Um teste de fluxo
poderia importá-los como `tests/dominio/` faz. **Descartei:** o que esta suíte
cobra é o **BUILD**, e importar o módulo ao lado contornaria exatamente isso.
Entraram na tabela da superfície, e o comentário no fonte diz por quê.

**Mexer nas quatro rejeições não tratadas.** Já eram zero quando cheguei
(`09-desligamento.md` as fechou). Não toquei.

---

## 5 · As 93 chaves de `CTX` que nenhum teste aciona

A rede diz que são **as mais baratas de blindar, porque o verbo já existe**, e
está certa — e agora elas estão num contrato, com porta direta. **Medido** por
varredura dos 33 arquivos de teste contra as chaves de `CTX`:

| | quantas |
|---|---:|
| chaves de `CTX` | **181** |
| acionadas como `CTX.x(` ou `'ctx.x'` pelos **arquivos de teste** | **65** |
| acionadas só pela função de módulo homônima, pelo nome nu | **23** |
| **nenhum arquivo de teste aciona** | **93** |

As três linhas somam 181. Uma das 93, `vaiPara`, é acionada pelo **harness** —
é o `a.aba()` —, e é ela que recupera o **66** da rede. Então **92 chaves de
`CTX` não são acionadas por nada**, nem pelo teste nem pelo harness.

As 93, por assunto, para servir de lista de trabalho — a lista é literal, saída
da varredura, e por isso inclui as chaves de leitura (`dadosDoApp`,
`planoCompleto`) junto com as de ação:

- **Corpo, medidas e cardio**: `registraPeso`, `registraCintura`, `apagaMedida`,
  `abreDiaCorpo`, `setPerfManual`, `apagaCardio`, `abreCardio`.
- **Comida e plano**: `abreRefeicao`, `novaRefeicao`, `setAlta`, `setTurno`,
  `salvaRefeicao`, `duplicaRefeicao`, `removeItem`, `trocaItem`, `alternaAlta`,
  `refeicaoParaEditar`, `alimentosParaSeletor`, `planoCompleto`,
  `resumoDoPlano`, `alternaCadencia`, `marcaCompra`, `setHorizonteCompras`.
- **Custódia e nuvem**: `exportar`, `mostraJSON`, `copiaJSON`, `importaTexto`,
  `importaArquivo`, `alternaColar`, `apagaTudo`, `nuvemCampo`, `entrarNaNuvem`,
  `sairDaNuvem`, `sincronizaAgora`, `dadosDoApp`.
- **Sessão passada**: `editaLinha`, `salvaEdicao`, `apagaLinha`,
  `cancelaEdicao`, `editDor`, `histKey`, `setNotaDaSessao`.
- **Promoção e retroativo**: `concluiPromo`, `voltaDoPromo`, `abreRetro`,
  `retroativo`, `fechaAdicionar`, `gravaRetro`, `addNome`, `addHora`.
- **Câmera, comparação e ajuste de foto**: `setGradeDaCamera`,
  `setFantasmaDaCamera`, `setOpacidadeDaCamera`, `setDataDoFantasmaDaCamera`,
  `streamDaCamera`, `setGradeDoAjuste`, `setFantasmaDoAjuste`,
  `setZoomDoAjuste`, `arrastaAjuste`, `setSobrepor`, `setOpacidade`,
  `setPoseComparada`, `setDataComparada`, `posAnterior`, `tentaFotos`,
  `fechaProtocolo`.
- **Rota, shell e tabelas de ação**: `vaiPara`, `emTelaCheia`,
  `cabecalhoDeHoje`, `ehLinhaDeTreino`, `folhas`, `desliga`, `trocaFolha`,
  `sessaoAberta`, `vaiParaDia`, `abrePrograma`, `restauraPrograma`,
  `cromoDoTreino`, `abreSessaoDoDia`, `mes`, `edicaoDoDia`, `programa`,
  `retrospectiva`, `fechaRetro`, `voltaAoTreino`, `limpaNum`, `acoesEx`,
  `acoesDia`, `acoesRapido`, `acoesAulas`, `acoesAdd`, `acoesPrograma`,
  `acoesProg`.

Três delas **não deveriam** ganhar rede nova: `limpaNum`, `addNome` e `addHora`
são as cascas de DOM, e o que se blinda são os pares por valor do §2.

**Cuidado com a leitura errada desta lista**, que a rede já avisou e eu
confirmo: *"nenhum teste aciona a chave de `CTX`"* **não** quer dizer *"a
capacidade está sem teste"*. `apagaMedida` tem caso (`corpo` :: *pesagem errada
pode ser apagada*); o caso clica em `.crow-x` em vez de chamar o verbo. O que a
lista mede é onde a rede **depende de pixel sem precisar**.

---

## 6 · Onde o código discordou do que me foi dito

Oito afirmações. Em cinco o código me deu razão parcial, em três o número andou.

1. **`CTX` tem 180 chaves (19 + 161).** → **São 181: 19 no literal + 162
   atribuídas depois**, sem repetição. **Medido**: as chaves de
   `/const CTX = \{…\n\};/` mais `^CTX\.x =` em `src/main.jsx`, deduplicadas. A
   contagem da rede estava certa na data dela; `CTX` cresceu em uma chave desde
   então.

2. **98 chaves nenhum teste chama.** → **93**, e com `vaiPara` (que o harness
   aciona) de fora, **92**. A conta intermediária também difere: a rede diz
   *"as 66 mais 16 alcançadas pela função homônima"* = **82 acionadas**; eu medi
   **65 + 23 = 88** pelos arquivos de teste, **89** contando `vaiPara` pelo
   harness. A diferença está nas homônimas, 23 contra 16, e é explicável: o meu
   critério contou também a chave citada como texto num `a.v('ctx.x')` — forma
   que não existia quando a rede mediu, porque foi esta entrega que a criou.

3. **128 funções de módulo são chamadas pelo nome nu.** → **129.** **Medido** por
   varredura dos nomes chamados dentro de `a.E`/`a.J` cruzados com as
   declarações `^function x` de `src/main.jsx`. Diferença de um, e não sei dizer
   qual sem o script da rede; o método é o mesmo e o número é da mesma ordem.

4. **"`CTX`, em `src/main.jsx`, é a superfície por onde um teste entra sem passar
   pela tela (…) por ali os testes alcançam as 335 funções de módulo."** → **A
   ponte alcança muito mais que `main.jsx`.** Depois do rollup o bundle é um
   escopo só, e a `eval` vê o topo dele inteiro. **Conferi** com
   `a.E('migraCache()')` em `fotos.test.js`, que chama uma função de
   `src/infra/fotos.js`. Isso **aumenta** o argumento da rede em vez de
   diminuí-lo: a superfície de hoje é maior e menos governada do que o documento
   supõe.

5. **"Daí os 110 usos de `a.preencher` no harness."** → **111** ocorrências de
   `a.preencher(` nos arquivos de teste. **Medido** com `grep -ro`. Um de
   diferença; o ponto está intacto.

6. **"Sete funções recebem o elemento do DOM, não o valor."** → **Confere, as
   sete.** `inp`, `inpRapido`, `obsIn`, `addNome`, `addHora`, `importFile`,
   `limpaNum` — todas com o elemento como primeiro parâmetro. Seis têm par por
   valor nesta entrega; `importFile` não, e o §4 diz por quê.

7. **"`criarExercicio()` lê seis campos (`#nxn`, `#nxg`, `#nxc`, `#nxk`, `#nxu`,
   `#nxq`)."** → **Confere, os seis, com esses ids.** `#nxk` é lido por
   `.checked` e não por `.value`, que é o único detalhe que a lista não diz.

8. **"Onze `useState` em seis arquivos de `src/ui/`."** → **Confere.** 11 pontos
   de chamada, em `instrumento/tabbar.jsx`, `folhas/editores.jsx` (4),
   `telas/comida.jsx` (2), `telas/guia.jsx` (2), `instrumento/primitivos.jsx`,
   `telas/dados.jsx`. (`src/ui/raiz.jsx` cita `useState` sem chamar, e por isso
   aparece em sete arquivos num `grep` cru.)

**Sobre o canal de diagnóstico**, que o briefing avisou: `console.log` de dentro
do jsdom não aparece no relatório do Vitest — e **`console.error` do lado do
Node também não**, no reporter padrão. `fs.appendFileSync` num arquivo de
rascunho foi o que funcionou, e foi como medi as leituras de `dado` enquanto
desenhava a travessia de realm.

---

## 7 · O que não medi

- **Não re-medi a classificação de 220/294 casos** (sem tela / com tela) da seção
  2 do `08-rede.md`. Ela veio de uma execução instrumentada com os 514 casos de
  05/10, e a suíte está em 520. A reponta **não muda** essa classificação: ela
  troca por onde o caso entra, não o que ele toca. Mas o número exato por arquivo
  envelheceu, e eu não o refiz.
- **Não re-medi os 103 casos de ponto único** da seção 3 da rede, nem os 27 que
  tocam a tela sem chamar verbo. Usei a lista como dada para escolher a ordem.
- **Não medi o custo de tempo da superfície.** `a.S()` serializa o estado inteiro
  a cada chamada, e há casos que a chamam várias vezes. O `npm test` inteiro saiu
  em 28,2 s na linha de base e em 25,3 a 25,7 s nas três execuções seguintes —
  ou seja, dentro do ruído e, se algo, mais rápido. **Não isolei o efeito**, e
  não afirmo que a superfície melhorou nada: a variação pode ser da máquina.
- **Não medi a hipótese dos dois builds com hash idêntico** que o briefing cita
  como sinal do engano anterior. Medi o fato por baixo dela, que é o que
  importava: função alcançável só por string **sai** do bundle.
- **Não escrevi um só teste novo.** As 93 chaves do §5 continuam sem rede
  própria; o que esta entrega fez foi torná-las alcançáveis e nomeá-las.
- **Não toquei em `src/ui/`.** Os 11 `useState` continuam fora do alcance da
  ponte e da superfície, e é bom que continuem: o caminho para o modo de uma aba
  é o mesmo do usuário, tocar no chip. Isso é buraco (c) da seção 5 da rede, e
  é da frente 2.
- **Não medi nada no aparelho dele.** Tudo aqui rodou no jsdom, a partir do
  build.

---

## Como reusar este documento

- **Para continuar a reponta**: a tabela do §3 e a ordem do §3.4.
- **Para escrever teste novo depois da reescrita**: o contrato do §1 e as portas
  do harness. `a.v('verbo', valor)` é a entrada; `a.S()` é a leitura.
- **Para não quebrar a rede sem querer**: as cinco regras do contrato. A que mais
  importa é a quarta — **tirar ou renomear chave da superfície quebra testes que
  a reescrita não pode reescrever.**
- **Para saber o que a superfície deliberadamente não faz**: o §4. Escrever em
  `S` e construir `Blob` continuam na ponte de escopo, e isso é desenho, não
  dívida.

---

# 8 · A rede das 93 — primeira passada

O §5 deste documento deixou as 93 chaves de `CTX` nomeadas, alcançáveis e **sem
um único teste próprio**, e o §7 registrou isso em letras: *"Não escrevi um só
teste novo."* Esta seção é a primeira passada escrevendo-os.

**Nenhuma linha desta seção tem estimativa de prazo.** Onde não houve medição,
está escrito que não houve.

## 8.1 · A linha de base, antes e depois

**Medido**, `npm test` (que roda `vite build` no `pretest` — `npx vitest run`
sozinho testaria um `dist/` velho):

| | antes | depois |
|---|---:|---:|
| total | **965** | **1 002** |
| `tests/fluxo/` | 520 | **557** |
| `tests/dominio/` | 445 | **445** |
| arquivos | 53 | **53** |
| rejeições não tratadas | 0 | **0** |
| `npx tsc --noEmit` | limpo | **limpo** |

**+37 casos, em seis arquivos que já existiam. Nenhum arquivo novo, nenhum caso
existente alterado, nenhuma asserção baixada, nenhum caso apagado ou pulado.**
Os 445 de domínio nunca ficaram vermelhos.

### Uma ressalva sobre a linha de base, que o briefing não tinha

A **primeira** execução de `npm test` nesta sessão saiu com **964 passando e 1
falhando**, e a falha é pré-existente e intermitente:

```
tests/fluxo/navegacao.test.js
  ✕ a folha entra em foco, isola o fundo e devolve o foco ao sair
    assert.strictEqual(a.doc.activeElement, folha, 'o foco entrou na folha')
```

**Medido**: o arquivo sozinho passa (9/9), e a execução completa seguinte passou
965/965 — e todas as execuções completas depois disso também. É corrida de foco
sob carga da suíte inteira, não regressão: nada tinha sido tocado quando ela
apareceu. **Não investiguei a causa e não mexi nela** — não era a tarefa —, mas
o número "965, sempre" do briefing é **965 na maioria das execuções**, não em
todas.

## 8.2 · Quais chaves ganharam caso: 38 das 93

Cinco commits, um por assunto, **a suíte verde em cada um**, na ordem de dano:
o destrutivo, a custódia, o corpo, a sessão passada, a shell.

| Assunto | Chaves com caso próprio | Quantas | Arquivo |
|---|---|---:|---|
| **Destrutivo** | `apagaMedida` `apagaCardio` `apagaLinha` `apagaTudo` | 4 | `corpo` `dados` `sessao` |
| **Custódia e nuvem** | `exportar` `mostraJSON` `copiaJSON` `importaTexto` `importaArquivo` `alternaColar` `dadosDoApp` `nuvemCampo` `entrarNaNuvem` `sairDaNuvem` `sincronizaAgora` | 11 | `dados` `sincronia` |
| **Corpo e cardio** | `registraPeso` `registraCintura` `abreDiaCorpo` `setPerfManual` `abreCardio` `cromoDoTreino` | 6 | `corpo` |
| **Sessão passada** | `editaLinha` `cancelaEdicao` `salvaEdicao` `editDor` `histKey` | 5 | `sessao` |
| **Shell e tabelas de ação** | `acoesEx` `acoesDia` `acoesRapido` `acoesAulas` `acoesAdd` `acoesPrograma` `acoesProg` `emTelaCheia` `cabecalhoDeHoje` `ehLinhaDeTreino` `sessaoAberta` `trocaFolha` | 12 | `telas` `navegacao` |
| | | **38** | |

**Dois assuntos inteiros fecharam:** *Corpo, medidas e cardio* (7 de 7, contando
`apagaMedida` e `apagaCardio` do commit destrutivo) e *Custódia e nuvem* (12 de
12, contando `apagaTudo`).

**Conferi por varredura** dos 33 arquivos de teste contra as 93: 33 chaves
aparecem como `'ctx.x'` ou `a.m.ctx.x` literal. As outras 5 são tabelas de ação
alcançadas por acesso computado (`a.m.ctx[tabela]`) dentro do caso do
inventário, que a varredura textual não vê — mas a quebra deliberada de
`acoesEx` as derruba, e é isso que conta.

## 8.3 · A prova de vermelho, por grupo

**Toda prova é a mesma receita: quebrar o verbo no fonte, rodar `npm run build`,
ver o caso ficar vermelho, restaurar.** A quebra é sempre no `src/`, nunca no
teste. **Trinta e nove quebras, e cada um dos 37 casos novos ficou vermelho em
ao menos uma delas** — conferi caso por caso, e a última a ser escrita foi a de
`acoesDia.remover`, porque o caso dela tinha ficado sem prova na primeira volta.

### Destrutivo (8 quebras)

| Quebra | Caso que caiu |
|---|---|
| tirar o `confirm` de `delBody` | *ctx.apagaMedida avisa antes* |
| `delBody` passa a apagar a medida de **todas** as grandezas daquele instante | *ctx.apagaMedida apaga só a medida nomeada* |
| comentar a lápide de `delCardio` | *ctx.apagaCardio sai da contagem da semana* |
| tirar o `confirm` de `wipe` | *ctx.apagaTudo pergunta antes* |
| `wipe` passa a levar `S.ex` | *leva o REGISTRADO e deixa o PRESCRITO* |
| `wipe` passa a **preservar** `S.aulas` | *leva junto quatro coisas que ninguém declarou* |
| tirar o `confirm` de `apagarSessao` | *ctx.apagaLinha avisa antes* |
| `apagarSessao` passa a levar o `sid` inteiro | *ctx.apagaLinha leva uma linha só* |

**A quebra mais importante desta entrega é a última da tabela**: alarguei `apagarSessao` para apagar **todas** as séries daquele
`sid`, em todos os exercícios, em vez de uma linha só. Rodei a suíte inteira de
`telas.test.js`, que é onde mora a guarda única *correção de sessão passada
altera e apaga*:

```
--- QUEBRA: apagarSessao leva o sid inteiro
tests/fluxo/telas.test.js    Tests  39 passed (39)
tests/fluxo/sessao.test.js   ✕ ctx.apagaLinha leva uma linha só
```

**A suíte de hoje não vê um apagamento que cresceu do exercício para o treino
inteiro.** O caso novo é a única coisa que a pega.

### Custódia e nuvem (11 quebras)

| Quebra | Caso que caiu |
|---|---|
| `showJSON` não carimba `S.export` | *ctx.mostraJSON* (e o caso que já existia) |
| `copyJSON` copia um resumo em vez do estado | *ctx.copiaJSON* |
| `exportData` não carimba o backup | *ctx.exportar* |
| `importText` sem o `confirm` | *ctx.importaTexto* |
| `importFile` não esvazia `input.value` | *ctx.importaArquivo* |
| `pasteJSON` só abre, nunca fecha | *ctx.alternaColar* |
| `entrarNaNuvem` sem a guarda dos dois campos | *cobra os dois campos* |
| `entrarNaNuvem` deixa `view.nuvemForm` montado | *não deixa a senha na memória* |
| erro genérico em vez do motivo da rede | *com senha errada mostra o motivo* |
| `sairDaNuvem` sem `confirm` | *pergunta, e o histórico continua* |
| `CTX.sincronizaAgora` vazia | *é a porta manual do mesmo ciclo* |

**Três dessas quebras não derrubam nenhum caso que já existia**: o `confirm` da
importação, o `input.value = ''` e o carimbo de backup do `exportar`.

### Corpo e cardio (6 quebras)

`registraCintura` gravando na série do peso · `addBody` aceitando zero ·
`abreDiaCorpo` só abrindo · `setPerfManual` lendo `false` como "sem resposta"
(`v || null`) · `abrirCardioRapido` só abrindo · **e `CORPO_PADRAO` ganhando
valor de partida para as cinco da bioimpedância**, que derruba o caso do §8.5.

### Sessão passada (6 quebras)

`cancelarEdicao` não fechando · `editDor` trocando em vez de acumular ·
`salvarEdicao` não carimbando `e.m` · `salvarEdicao` aceitando sessão sem série
· `histKey` **levando a edição aberta** para a outra lista · `cancelarEdicao`
ganhando rollback da dor (a única quebra que derruba o caso de escopo do §8.6).

### Shell e tabelas de ação (8 quebras)

`acoesDia` perdendo `desfaz` · `acoesEx` perdendo `usaAnterior` · **`acoesDia.remover`
apontando para `progRemove`, a tabela do oficial, em vez de `removerEx`** ·
`trocaFolha` empilhando em vez de trocar · `emTelaCheia` esquecendo `view.hist`
(derrubou **4** casos, três deles pré-existentes) · `ehLinhaDeTreino` dizendo sim
para tudo · `sessaoAberta` nunca reportando pausa · `cabecalhoDeHoje` afirmando
"hoje" sem ter medido.

A terceira é a que vale ler: **trocar uma tabela de ação pela outra é
exatamente o modo de falha que o §8.4 diz não estar coberto na tela**, e aqui
está coberto no modelo. O caso *acoesDia e acoesProg mexem em programas
diferentes* é o único que a pega.

### Uma asserção jogada fora por não saber ficar vermelha

Escrevi, no caso do login:

```js
assert.strictEqual(vm.senha, undefined,
  'a senha não fica pendurada na memória da tela depois de usada');
```

**Ela passava com a senha ainda guardada.** `CTX.nuvem` só devolve `senha`
quando `dentro: false`; logado, a chave simplesmente não existe na leitura, e
`undefined` era verdade pelo motivo errado. A quebra deliberada expôs isso —
**o caso ficou verde quando devia ficar vermelho**, que é exatamente o modo de
falha que esta disciplina existe para pegar. Trocada por
`assert.strictEqual(a.vista().nuvemForm, null, …)`, que a mesma quebra derruba.
**É a única asserção desta entrega que foi escrita e descartada**, e está
registrada aqui porque o acerto não vale nada sem o erro ao lado.

## 8.4 · O que estes 37 casos NÃO cobrem

**Eles cobrem o MODELO. Nenhum deles cobre a FIAÇÃO.**

Chamar `a.v('ctx.apagaMedida', 'peso', t)` prova que a **capacidade de apagar
uma medida existe no modelo, avisa antes, apaga só aquela e deixa lápide**. Não
prova — e não tem como provar — que a tela nova tem um botão ligado nessa
chave. Se o redesenho esquecer o `.crow-x`, **todos os 37 continuam verdes** e a
capacidade fica inalcançável pelo dedo.

Isto não é ressalva de rodapé: é a limitação central do que esta entrega
construiu, e já há prova viva dela neste repositório. Nenhum chamador de
`marcaRefeicao` passa `como`, e os três valores existem no dado sem lugar na
tela — a capacidade está no modelo, testada, e o dedo não a alcança. **Cada
grupo de casos carrega essa frase por escrito no comentário do bloco**, e não em
glosa: em texto que diz o que o grupo prova e o que ele deliberadamente não
prova.

O que fica descoberto, concretamente:

- **Que exista botão, menu ou campo para cada capacidade.** Nada aqui conta
  botões. O caso do inventário das sete tabelas é o mais perto que esta entrega
  chega — ele fixa os **64 nomes de ação** e fica vermelho quando um sai da
  tabela —, mas uma tabela completa com oito dos vinte e dois nomes ligados na
  tela passa verde.
- **Que o botão certo chame a tabela certa.** O caso *acoesDia e acoesProg
  mexem em programas diferentes* cobre a regra no modelo — e a quebra que
  aponta `acoesDia.remover` para `progRemove` o derruba. Mas ligar a tabela
  errada num **botão da tela nova** passa por toda a suíte sem um vermelho: o
  caso guarda qual tabela faz o quê, não qual tabela a tela chama.
- **Dois casos dependem do DOM por culpa do verbo, não minha.** `salvaEdicao` e
  `editDor` releem a tela por dentro (`guardaCamposEdicao`, os ids `ed{k}_0`), e
  a guarda "sessão sem nenhuma série" só é alcançável esvaziando os campos. São
  **os dois únicos casos desta entrega que não sobrevivem sozinhos ao
  redesenho**. O par por valor deles, `guardaEdicaoCom`, já está em `verbos`
  (§2) — ver o defeito (d) do §8.5.
- **Nada foi medido no aparelho dele.** Tudo rodou no jsdom, a partir do build.

## 8.5 · Os defeitos que achei

### (a) As cinco grandezas da bioimpedância não têm caminho de escrita nenhum

**Confirmado, e é pior do que o briefing supunha.** O briefing dizia que
`addBody('bioPeso')` recusa com *"Digite um número válido"*. **Recusa — conferi
nas cinco.** Mas a causa não é só `CORPO_PADRAO`:

1. `const CORPO_PADRAO = { peso: 75, cintura: 85 }` — sem valor de partida para
   as cinco, então `baseDoCorpo('bioPeso')` devolve `undefined` com a série
   vazia, e `isNaN(undefined)` recusa.
2. **Não existe chave de `CTX` que escreva o rascunho delas.** Só `CTX.setPeso` e
   `CTX.setCintura` existem.
3. **Não existe `CTX.registraBioPeso` nem equivalente.** **Medido**: das 181
   chaves de `CTX`, **zero** mencionam bioimpedância — nem para escrever, nem
   para ler.

Enquanto isso, `MEDIDAS_DO_CORPO` declara as sete com nome, unidade e
obrigatoriedade; a migração 9 → 10 criou as cinco; `corpoDoBackup` as preserva
na lista branca; `chaveDeMarca` tem lápide para cada uma, com comentário
explicando por que; e `tests/dominio/sincronia.test.ts` funde as cinco.

**Toda a tubulação existe e não há torneira.** O dado atravessa backup, migração
e sincronização, e **nada no app grava a primeira leitura**.

O caso está escrito, **e fica VERDE** — ele grava a recusa, que é o que o app
faz hoje. Dar às cinco um valor de partida o derruba na hora, com o nome da
chave na mensagem. **A decisão de consertar é sua.** Se consertar, o conserto
provavelmente não é `CORPO_PADRAO`: é a porta de escrita, porque um padrão de
partida de `bioGorduraPct: 18` seria o app inventando uma leitura de balança.

**Uma correção ao briefing:** as cinco **não** são "cinco chaves novas de `CTX`"
e **não** estão entre as 93. A lista literal do §5 não as contém, e minha
varredura independente confirma. O que está entre as 93 é `registraPeso` e
`registraCintura`, que são as duas que existem.

### (b) `apagaTudo` leva quatro coisas que ninguém declarou

`wipe()` monta um `S` novo à mão. O que ele **não** carrega, `normalizaEstado()`
preenche vazio depois. **Medido**, campo por campo, com o estado mais cheio que
o app aceita:

| sobrevive (prescrito, ou criado por ele) | vai (registrado) | **vai, e ninguém declarou** |
|---|---|---|
| `prog` `rot` `ex` `progLog` `comida` `cadencia` `compras` `ajuste` `ajusteHist` `quadro` `plano` | `logs` `done` `cardio` `body` `carga` `export` `mods` `draft` `sessao` `deload` `comidaHist` | **`aulas`** **`protocolo`** **`fotos`** **`apagados`** |

As quatro, em ordem de dano:

- **`apagados` — toda lápide.** `wipe()` apaga a chave de storage **legada** de
  propósito, com comentário no fonte: *"Deixá-la seria a migração do boot
  ressuscitar amanhã exatamente o histórico que ele acabou de mandar apagar."*
  E no mesmo gesto joga fora **toda lápide**, que é a única coisa que impede a
  **fusão do outro aparelho** de ressuscitar o mesmo histórico pela outra porta.
  A guarda está numa porta e falta na outra. **Não medi** a ressurreição
  ponta-a-ponta com a nuvem simulada — o caso grava o estado de `apagados`
  vazio, não o ciclo; é o próximo pedaço óbvio de trabalho aqui.
- **`protocolo` — as sessões de foto de corpo.** São as referências aos bytes.
  `wipe()` apaga o índice e **não poda o cache nem o bucket**, então os bytes
  ficam órfãos. É o assunto dos 58 casos de `protocolo.test.js`, que existem em
  torno de *"a única parte do app que apaga byte de foto por conta própria: a
  poda, cujo erro não tem desfazer"*.
- **`aulas` — a biblioteca de modelos de aula.** Assimetria clara: `S.ex`, o
  catálogo de aparelhos que **ele** cadastrou, sobrevive; `S.aulas`, os modelos
  de aula que **ele** salvou, não. As duas são coisa que ele criou.
- **`fotos` — as referências de foto de aparelho.** Mesmo caminho do
  `protocolo`, mesmo órfão.

Os casos gravam isto **sem afirmar que está certo**, e o comentário no teste diz
isso em letras. Se você decidir que uma delas deve sobreviver, o caso fica
vermelho e aponta a linha — que é o contrário de descobrir meses depois que a
biblioteca de aulas sumiu num toque.

### (c) `dadosDoApp` não conta as cinco no resumo do acervo

`resumo` lista *sessões · exercícios com histórico · cardio · pesagens · medidas
de cintura*. É a leitura que diz ao dono **o tamanho do que ele tem a perder**,
e as cinco grandezas da bioimpedância não entram. Coerente com (a) — não há o
que contar hoje —, mas se (a) for consertado, isto precisa ser consertado junto,
senão o acervo passa a mentir por omissão. Está asseverado no caso.

### (d) `guardaEdicaoCom` seguido de `salvaEdicao` **perde** a escrita por valor

**Medido.** `salvarEdicao()` chama `guardaCamposEdicao()` como primeira linha, e
essa relê os ids `ed{k}_0` do DOM. Então:

```
guardaEdicaoCom([[65, 9], null])   →  sets [[65,9],[60,8]]
ctx.salvaEdicao()                  →  sets [[60,10],[60,8]]   ← voltou
```

O par por valor do §2 **não é commitável** pela porta de salvar: a tela
sobrescreve. Pior, é o que faz a guarda *"Uma sessão sem nenhuma série"* ficar
inalcançável por valor — zerar as séries por `guardaEdicaoCom` e salvar devolve
*"Sessão corrigida."*, porque os campos da tela restauraram tudo. **Não é
defeito de hoje** (a casca e o verbo estão coerentes entre si), mas é dívida
exatamente onde a §2 disse ter pago: `guardaEdicaoCom` existe e não tem por onde
chegar ao estado sem a tela. Um `salvarEdicao(sets, obs)` por valor fecharia.

### (e) `cancelaEdicao` não desfaz a dor já marcada

`editDor` escreve direto em `S.logs[key][edit].dor`; `cancelarEdicao` só faz
`view.edit = null`. **Não há rascunho para descartar**, então marcar uma dor e
cancelar deixa a dor. Pode ser intencional — a dor é fato, não rascunho — e por
isso o caso **grava sem julgar**, nomeando o escopo nos dois sentidos.

### (f) `setPerfManual` não valida nada

`CTX.setPerfManual = function (v) { S.perfManual = v; … }`. A tela oferece três
valores (`null`, `true`, `false`); o verbo aceita qualquer coisa, e só o
`normalizaEstado()` do **próximo boot** conserta (`if (S.perfManual !== true &&
S.perfManual !== false) S.perfManual = null`). Auto-cura, e por isso não escrevi
caso de lixo — mas é por isso que meu `estado: { perfManual: 1.5 }` chegou ao
app como `null`, e vale saber antes de alguém medir isso e se confundir.

## 8.6 · Dois achados sobre a própria superfície

### `a.v` não alcança as tabelas de ação

`chama` parte o nome no **primeiro** ponto:

```js
const ponto = String(nome).indexOf('.');
const dono = ponto < 0 ? SUPERFICIE.verbos : SUPERFICIE[String(nome).slice(0, ponto)];
const chave = ponto < 0 ? String(nome) : String(nome).slice(ponto + 1);
```

Então `a.v('ctx.acoesDia.subir', 0)` procura a chave **literal**
`"acoesDia.subir"` em `CTX`, não acha, e estoura *"verbo fora da superfície"*.
**Conferi**: as sete tabelas (`acoesEx` `acoesDia` `acoesRapido` `acoesAulas`
`acoesAdd` `acoesPrograma` `acoesProg`) e os **64 nomes de ação** dentro delas
são alcançáveis **só** por `a.m.ctx.acoes….nome(…)`.

Isso funciona e é por nome e sem `eval` — é a porta de acesso direto que o §4
documenta —, mas carrega a ressalva de realm: argumento que é objeto nasce no
realm do Node. Os casos desta entrega usam `a.m.ctx` onde precisam (as tabelas e
`importaArquivo`, que tem de receber um `Blob` do jsdom). **Fazer `chama`
caminhar o caminho inteiro** em vez de parar no primeiro ponto é mudança de
poucas linhas, e devolveria a travessia de realm a 64 ações mais os sete nomes
das tabelas. **Não fiz** — mexer no contrato da superfície não era a tarefa, e o
`contrato: 1` não precisa subir para isso (acrescentar alcance não tira nada).

### `folhas` é a quarta chave que **não** deve ganhar rede

O §5 diz que três das 93 não deveriam ganhar rede nova — `limpaNum`, `addNome` e
`addHora`, as cascas de DOM cujos pares por valor são o que se blinda. **São
quatro.** `CTX.folhas` é `function () { return folhaAberta(); }`, e
`folhaAberta()` devolve **VNodes do Preact**:

```jsx
if (f.k === 'refeicao') return <FolhaRefeicao key={i} ctx={CTX} id={f.id} />;
```

É função de **render**, não verbo, e devolver elemento é justamente o que o
contrato do §1 proíbe. O que se blinda da pilha de folhas é `abreFolha`,
`trocaFolha`, `fechaFolha` e `fechaTudo` — as quatro são dado puro, e
`trocaFolha` ganhou caso nesta passada.

## 8.7 · Onde mais o código discordou do que me foi dito

Além de (a) acima — as cinco da bioimpedância não serem chaves de `CTX`:

1. **"92 chaves de `CTX` não são acionadas por nada, nem pelo teste nem pelo
   harness"** (§5). → **91.** O harness aciona **duas**, não uma: `vaiPara`, que
   é o `a.aba()`, e **`desliga`**, que é o `a.fechar()` —
   `w.__escopo('CTX.desliga()')`. **Medido** pela mesma varredura que reproduz os
   outros números do §5 (181 chaves, 65 + 23 + 93) nos quatro.
2. **`setNotaDaSessao` está no assunto errado no §5.** A lista a põe em *Sessão
   passada*, ao lado de `editaLinha` e `apagaLinha`. **Ela não é disso**: escreve
   `obs` numa sessão de **foto de corpo** (`S.protocolo.sessoes`), com o mesmo
   debounce de 700 ms do rascunho, e sai pela porta se não houver sessão de fotos
   ainda. Pertence ao grupo *Câmera, comparação e ajuste de foto*. Não a cobri, e
   quem continuar deve procurá-la lá.
3. **`CTX.corpo` não tem `forca`, e `CTX.dados` não tem `cardio`.** Perdi duas
   voltas supondo pela leitura do fonte que o bloco `forca` (com as três opções
   de `setPerfManual`) estava em `CTX.corpo` e o `cardio.aberto` em `CTX.dados`.
   **Medido**: `ctx.dados` → `veredito, comida, forca`; `ctx.corpo` → `peso,
   cintura, cardio, musculos`; e o `cardio.aberto` que `abreCardio` alterna vive
   em **`ctx.cromoDoTreino`**, na aba TREINO — o que confirma, por outra via, a
   retificação de 05/10 do `08-rede.md` sobre o cardio estar no TREINO e não em
   HOJE.
4. **`ehLinhaDeTreino` recebe uma LINHA, não um dia.** É `function (r) { return
   r.id === 'treino'; }` — a pergunta é sobre a linha da timeline de HOJE.
   Passar `'A'` devolve `false`, silenciosamente, e um caso escrito supondo a
   letra do dia passaria verde afirmando o contrário do que queria.

## 8.8 · Onde parei, para o próximo continuar

**55 das 93 ficaram sem caso próprio.** Quatro delas **não devem** ganhar
(`limpaNum` `addNome` `addHora` `folhas` — §8.6), então **51 são trabalho real**.
A lista é literal, por assunto, na forma do §5:

### Fechados — nada a fazer

- **Corpo, medidas e cardio**: 7 de 7. ✅
- **Custódia e nuvem**: 12 de 12. ✅

### Abertos

- **Comida e plano — 16, nenhuma.** `abreRefeicao` `novaRefeicao` `setAlta`
  `setTurno` `salvaRefeicao` `duplicaRefeicao` `removeItem` `trocaItem`
  `alternaAlta` `refeicaoParaEditar` `alimentosParaSeletor` `planoCompleto`
  `resumoDoPlano` `alternaCadencia` `marcaCompra` `setHorizonteCompras`.
  **É o maior bolo aberto, e é onde eu começaria.** O §3.4 do `08-rede.md` diz
  que comida é *"a área com mais ponto único por caso"*, e `removeItem` e
  `trocaItem` são destrutivos — a prioridade 1 do briefing, ainda não paga neste
  assunto. Casa: `fusao.test.js` (24 casos) e `turno.test.js` (9).
- **Câmera, comparação e ajuste de foto — 16, nenhuma.** `setGradeDaCamera`
  `setFantasmaDaCamera` `setOpacidadeDaCamera` `setDataDoFantasmaDaCamera`
  `streamDaCamera` `setGradeDoAjuste` `setFantasmaDoAjuste` `setZoomDoAjuste`
  `arrastaAjuste` `setSobrepor` `setOpacidade` `setPoseComparada`
  `setDataComparada` `posAnterior` `tentaFotos` `fechaProtocolo` — mais
  `setNotaDaSessao`, que pertence aqui (§8.7). **17 no total.** Casa:
  `protocolo.test.js` (58 casos) e `fotos.test.js` (20), que já têm os dublês de
  câmera e de cache montados. **Aviso**: é onde moram as 25 + 13 entradas de DOM
  dentro de `a.E` do §3.3, e as quatro rejeições não tratadas que o
  `09-desligamento.md` fechou — mexer aqui sem cuidado as traz de volta.
- **Rota e shell — 12.** `vaiPara` `desliga` `vaiParaDia` `abrePrograma`
  `restauraPrograma` `abreSessaoDoDia` `mes` `edicaoDoDia` `programa`
  `retrospectiva` `fechaRetro` `voltaAoTreino`. Duas notas medidas: `vaiPara` e
  `desliga` são acionadas pelo **harness** em todo caso da pasta, mas nenhum caso
  **afirma** nada sobre elas — `desliga` para os relógios e desmonta a árvore do
  Preact, e é o que mantém a suíte em zero rejeições, sem um único caso de
  guarda. `ctx.programa` e `ctx.retrospectiva` **estouram** se chamadas sem
  `view.prog` / `view.retro` armados (`abrePrograma` / `abreRetro` primeiro) —
  conferi, custou uma volta.
- **Promoção e retroativo — 6.** `concluiPromo` `voltaDoPromo` `abreRetro`
  `retroativo` `fechaAdicionar` `gravaRetro`. (`addNome` e `addHora` são cascas.)
  Casa: `promocao.test.js` (9) e `retro.test.js` (9).

### Receita, para não redescobrir nada

1. **Ler a forma da leitura antes de escrever a asserção.** Supor pelo fonte me
   custou quatro voltas (§8.7 itens 3 e 4). Um `Object.keys(a.vJ('ctx.x'))` num
   caso de rascunho resolve em segundos.
2. **`console.log` e `console.error` não aparecem** no reporter do Vitest, dos
   dois lados do realm. `fs.appendFileSync` num arquivo de rascunho funciona — é
   o que o §6 já dizia, e confirmo.
3. **`a.v` devolve CRU.** `deepStrictEqual` contra objeto vindo de `a.v` falha
   com *"Compared values have no visual difference"*, que é o protótipo do outro
   realm. Use `a.vJ` para objeto e lista. Custou uma volta.
4. **Verbo `async` chamado por `CTX` não devolve a promessa.** `CTX.apagaMedida`
   é `function (k, t) { delBody(k, t); }` — `await a.v(…)` espera `undefined`.
   `await a.esperar()` depois. E **cuidado ao fechar**: `a.v('retomarSessao')`
   sem `await` deixa um `toast` em voo que acorda sem `document` e **vira
   rejeição não tratada** — aconteceu nesta sessão, e foi consertado antes do
   commit. A suíte sai em zero rejeições; se subir, foi isto.
5. **A quebra deliberada é o portão, não a opinião.** Duas das minhas quebras não
   casaram o padrão no fonte e eu só soube porque o `diff` acusou — se a quebra
   não aplica, a prova não existe. Confira que ela aplicou antes de ler o
   vermelho.
