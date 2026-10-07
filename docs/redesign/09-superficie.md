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
