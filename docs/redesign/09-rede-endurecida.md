# 09 · A rede endurecida

O que entrou entre a entrega da frente 2 e a da frente 4, para a rede aguentar
a reescrita que vem. **Dois defeitos vivos no app de hoje** e **oito buracos na
própria suíte**.

Este documento tem dois autores. O agente do endurecimento escreveu os quatro
primeiros commits e caiu por limite de sessão no meio do quinto; o coordenador
resgatou o trabalho não commitado, devolveu o arquivo de medição que tinha
ficado para trás, e fez a última parte. **Está dito onde cada coisa foi medida e
onde foi conferida por leitura**, porque as duas valem coisas diferentes.

## A linha de base

| | antes | depois |
|---|---:|---:|
| Testes passando | 954 | **957** |
| Arquivos | 53 | 53 |
| Unhandled rejections | 0 | **0** |

Três casos entraram, nenhum saiu. `npm test` rodado pelo coordenador em cada
etapa, não só no fim. Nenhuma asserção foi baixada, nenhum caso apagado ou
pulado.

---

## 1 · Os dois defeitos vivos

### 1.1 · Corrigir uma série depois de reabrir o app disparava um descanso

`fix(descanso)` — `src/main.jsx`, `tests/fluxo/serie.test.js`.

A guarda que separa **registrar** de **corrigir** era `view.fired[dia + i + ':' + k]`,
campo de `view`: memória, nunca disco. O iOS fecha o app em segundo plano no
meio do treino; ao reabrir, a marca nascia vazia, e corrigir uma série
registrada quinze minutos antes **disparava um descanso de dois minutos para
uma série que já tinha acabado**.

A resposta agora vem do dado, que sobrevive ao processo: o rascunho, que vai a
disco, e — como segunda fonte, para a janela em que o rascunho daquela posição
ainda não foi hidratado — a série já escrita no histórico desta sessão. As duas
espelham a mesma verdade, porque a projeção reescreve o histórico a partir do
rascunho.

**O caso novo nasceu vermelho**, com a sessão e o valor na tela conferidos antes
da asserção do descanso. É a prova de que o defeito era real e não hipótese.

**O que não se podia quebrar, e não quebrou:** o descanso começa em qualquer
série completada, não só na última; apagar o campo **rearma** o disparo daquela
série e só dela; e o descanso sobrevive a fechar e reabrir sem ressuscitar
vencido, porque conta a partir de um instante-alvo e não de um contador que
decrementa.

### 1.2 · Os dois fechos de sessão discordavam

`fix(sessao)` — `src/main.jsx`, `tests/fluxo/aula.test.js`.

O fecho pela porta da frente tinha uma guarda de dia aberto, com razão escrita:
num dia aberto o que foi adicionado **é** o dia, não uma emenda a ele, então não
há conteúdo permanente para aquilo virar. O fecho automático **não tinha essa
guarda**.

Resultado medido: uma aula de box que fechava **sozinha** por inatividade
enfileirava os movimentos como mudanças pendentes; a mesma aula encerrada no
toque não. Mesma situação, dois resultados.

Dois casos novos, e a assimetria está medida neles: **o do fecho automático
nasceu vermelho, o do fecho no toque já estava verde.**

---

## 2 · Os oito buracos na rede de CSS

`tests/dominio/estilo.test.ts` é a especificação de CSS deste produto em forma
executável. A `08-rede.md` classificou 28 dos 38 casos como invariante genérica
que sobreviveria ao redesenho. **Oito não seguravam o que prometiam.**

### 2.1 · O maior: arquivo que falta matava a coleta, não produzia vermelho

Achado pela frente 4, conferido pelo coordenador, consertado no trabalho
resgatado.

O arquivo tinha **nove `readFileSync` no escopo do módulo** — a lista de folhas
com o seu `.map`, mais as leituras soltas de `base.css`, `index.html`,
`main.jsx`, `telacheia.jsx`, `primitivos.jsx`, `palco.css` e `palco.js`. Leituras
no escopo do módulo rodam na **importação**, antes de qualquer caso se registrar.

Então renomear uma folha não dava dez vermelhos: **estourava na coleta e a suíte
respondia `Tests  no tests`. Zero de 38 executados.** A frente 4 mediu isso numa
cópia.

**Por que é pior que vermelho:** um teste vermelho grita. Um arquivo que não
coleta só **desaparece da contagem**, e quem olha "nenhuma falha" passa batido. E
a reescrita que vem **vai renomear folhas** — é exatamente o cenário.

O conserto: a leitura virou preguiçosa, com memória, e a ausência estoura
**dentro do caso**, nomeando o arquivo e dizendo o que fazer. O remédio errado
também foi fechado: **arquivo vazio reprova igual**, porque caso verde sobre nada
é pior que vermelho.

**Medido, não argumentado.** Renomeando `src/treino.css` e rodando só este
arquivo: **18 casos vermelhos**, cada um nomeando `src/treino.css`. Antes:
nenhum teste. A folha foi restaurada e a árvore ficou limpa.

A lista de folhas ficou **declarada e não descoberta**, e a razão é a direção da
reprovação: lista declarada reprova quando um arquivo esperado falta; lista
descoberta aceita qualquer conjunto e fica cega justamente quando as regras
mudam de lugar.

### 2.2 · Os outros sete

| o buraco | o que passava |
|---|---|
| **Definição de token só em começo de linha** | Num bloco sem espaços — o que qualquer minificador produz — só a primeira definição começa linha, e todas as outras viravam **órfãs falsas**: 21 medidas numa cópia. Reprovação em massa no código certo é tão ruim quanto aprovação em silêncio, porque a resposta é desligar o caso. |
| **O caso de cor olhava só hexadecimal** | Cor em `rgb()`, `rgba()`, `hsl()`, `oklch()` ou `color()` entrava solta sem ninguém pegar — e `rgba()` é justamente a forma de fundo translúcido, o caso mais frequente de cor nova. As duas translucidezes que existem hoje ficaram nomeadas uma a uma, com o motivo: mudar o alfa de uma delas fica vermelho, que é o que se quer. |
| **Decimal lido errado** | `(\d+)px` em `padding: 13.5px` falhava no `13` e casava `5px` no lance seguinte — e 5 estava nas exceções, então **a medida passava valendo outra coisa**. |
| **O `svh` não era exigido** | O caso exigia que `100vh` não aparecesse sozinho, o que deixa passar folha nova que não use nem um nem outro. |
| **A escala de 4 não olhava `protocolo.css`** | Nem olhava `padding-left`. Metade do espaçamento do app não passava pela régua. A frente 4 mediu o efeito: de **20 ofensores mal atribuídos para 6 certos**. |
| **Os dois casos de ancestral olhavam árvores diferentes** | O pior: **um `overflow: hidden` em `#app` mataria o sticky da única saída da sessão, e nenhum dos 38 pegaria.** Quem consertou viu uma exceção que a frente 4 não tinha visto — a classe de travar o corpo, que é um `overflow: hidden` legítimo no `body`; sem nomeá-la, a verificação da cadeia inteira fica vermelha no código certo. |
| **Seis casos presos a seletor literal** | Dois deles a uma **lista em ordem** numa regra só, então renomear ou reordenar quebrava o teste sem quebrar o produto. |

**A regra que guiou esta parte:** um caso que fica genérico tem de **continuar
pegando o defeito original**. Cada um foi provado quebrando o CSS de propósito,
vendo o vermelho e desfazendo.

---

## 3 · Os sete apps que nunca eram fechados

`tests/fluxo/migracaochave.test.js` subia **7 apps e chamava `fechar()` zero
vezes**. Sinalizado como consequência não medida no `09-desligamento.md`.

**Conferido por leitura, não instrumentado — e está dito assim de propósito.** O
fato decisivo é que `ligaBatida()` é chamada **sem guarda nenhuma** no boot: não
pergunta se existe sessão. A única proteção é contra ligar duas vezes na mesma
janela. Então cada um dos 7 apps ligava um `setInterval` que **nada desligava**,
porque a janela nunca era fechada nem desligada.

**O que a consequência NÃO é:** contaminação entre testes. Cada janela tem o seu
próprio estado e o seu próprio armazenamento, e o corpo do intervalo sai na
primeira linha quando não há sessão — e nenhum dos 7 testes abre sessão. Nenhuma
rejeição vinha deles, e a suíte não mentia por causa disto.

**O que a consequência é:** 7 relógios vivos e 7 janelas presas na memória
enquanto aquele arquivo roda. E, mais importante, **um gatilho a um passo de
armar**: o intervalo é o que chama o fecho automático da sessão, que grava e
redesenha. Hoje não há sessão para ele fechar. **Basta alguém acrescentar a este
arquivo um teste que semeie uma sessão aberta** para o intervalo passar a fechá-la
sozinho no meio do arquivo e mudar o resultado de outro caso.

Consertado, porque custa uma linha por teste: `a.fechar()` nos sete. Suíte
conferida depois — **957, zero rejeições.**

---

## 4 · O que não foi medido

- **Se o vermelho de 1 em 24 acabou.** O nome do caso foi perdido quando
  apareceu, e a causa suspeita (as quatro rejeições) foi removida antes de se
  poder correlacionar. Segue **suspeita, não medida**, e não dá mais para medir.
- **Memória.** Ninguém mediu quanto as 7 janelas custavam, nem quanto se
  ganhou. O conserto entrou pelo gatilho latente, não por número de memória.
- **Tempo da suíte**, antes e depois. Não medido.
- **O resto da suíte quanto a `fechar()`.** São 520 casos (eu escrevi 517 aqui
  primeiro, e estava errado — ver §5) e vários arquivos
  embrulham a abertura do app em auxiliares locais, então contagem por busca de
  texto não é confiável. **Só este arquivo foi auditado**, por instrução. Pode
  haver outros.
- **Os 25 casos amarrados a nome concreto.** A frente 4 recontou e são 25, não
  10. Os oito buracos deste documento são sobre o que o caso **verifica**; quais
  dos 25 sobrevivem a um renome de seletor é trabalho da reescrita, e não foi
  feito aqui.

Nenhuma estimativa de prazo em nenhuma linha.

---

## 5 · As duas de 06/10 (noite): o "não sei" por refeição e o comentário do zoom

Acrescentado depois, por um terceiro agente, sobre as decisões 3 e 7 da seção
"As oito de 06/10 (noite)" do `00-coordenacao.md`. **Nenhuma decisão foi
reaberta.** As duas entraram em commits separados (`6e8a3fa`, `d625147`).

### A linha de base

| | antes | depois |
|---|---:|---:|
| Testes passando | 957 | **965** |
| `tests/fluxo/` | 520 | 520 |
| `tests/dominio/` | 437 | **445** |
| Arquivos | 53 | 53 |
| Unhandled rejections | 0 | **0** |
| `tsc --noEmit` | limpo | limpo |

**Oito casos entraram, nenhum saiu, nenhum arquivo novo.** Todos em
`tests/dominio/`, que é o sinal mais confiável do repositório. `npm test` — que
reconstrói o `dist/` no `pretest` — rodado antes de mexer em nada, depois da
mudança de domínio e depois do comentário.

**Uma correção de número que este próprio documento carregava:** a seção 4 diz
"são 517 casos" sobre `tests/fluxo/`. **São 520**, medido com
`npx vitest run tests/fluxo`; a linha de baixo deste documento ficou com 957 no
total, que está certo, então o 517 vem com um 440 implícito em `tests/dominio/`
que também não bate — o domínio tinha **437**. Medido nos dois sentidos, com o
fonte da mudança guardado no `stash`.

### 5.1 · "Não sei" por refeição

**O que entrou.** `ComoFoiARefeicao` ganha um terceiro valor, `'nsei'`. O nome é
curto e sem acento, como os dois irmãos, e não é prefixo de `'nao'` — um
`grep 'nsei'` acha só ele.

A aritmética é a que o coordenador fechou: **a refeição pesa 0 na adesão do dia
e NÃO sai do denominador.** Reusa o mecanismo que já existia —
`pesoDaRefeicao` devolvia 0 para `'nao'`.

**A condição de peso zero passou a morar numa função só**, `semCumprimento`, em
vez de ficar escrita à mão em quatro pontos. É a doutrina que o `main.jsx` já
escreve sobre a lista das medidas do corpo ("que NENHUM lugar do app escreva
essa lista à mão"), e aqui ela paga: escrita à mão, bastava um esquecimento num
dos quatro para o "não sei" voltar a contar como refeição cumprida — que é
inflar adesão, o mecanismo exato do corte errado.

**Os quatro pontos onde `'nsei'` zera**, e por que em cada um:

| leitura | o que faz | razão |
|---|---|---|
| `pesoDaRefeicao` → `aderenciaDoDia` | 0, no denominador | a decisão |
| `excessoDoDia` | ignora a refeição | sem isto o mesmo dado diria 0 de adesão e +½ porção de excesso sobre a mesma refeição |
| `padraoPorRefeicao` | entra em `possiveis`, não em `feitas` | a frase é "feita em X dos últimos Y dias"; um desconhecido não é acerto |
| `contagemDaRefeicao` | igual | a mesma frase, na outra tela |

**E o ponto onde ele NÃO é "não comi", que é o achado desta parte.**
`totalRegistrado` tira do total a refeição marcada com `'nao'`, porque zero
conhecido é zero. **`'nsei'` fica**, pelo caminho de `'fora'`, com os números do
plano. Tirá-la faria o total afirmar **zero kcal** sobre uma refeição que ele
não sabe descrever — a única coisa que se sabe falsa das três. `semCumprimento`
existe e **de propósito não é chamado ali**, com a razão escrita na função.
Os dois pesam 0 na adesão, e **só nisso** eles se encontram.

**`diaInterpretavel` não precisou de uma linha.** Ele exige uma marca qualquer, e
`'nsei'` é marca em `done`. Está agora escrito lá que isso é decisão e não
efeito colateral, com o "não há limiar" explícito — e que o "não sei" **do dia**
continua sendo `aderencia: 'perdido'`, o único valor que derruba o dia.

**O setter** (`marcaRefeicao`, `src/main.jsx`) aceita o terceiro valor.

**O rótulo da tela é "Não sei"**, e é da frente 3 — `09-frente3-palavras.md`,
§4.2 (o quinto botão, na fatia de 50,4 pt, em duas linhas) e §4.5 **versão A**,
que é a que a decisão do coordenador escolheu. Não inventei palavra nenhuma.

**O que NÃO entrou, e é o mais importante desta parte:** a folha dos cinco
botões não existe. **Hoje nenhum chamador de `marcaRefeicao` passa `como`, em
valor nenhum** — nem `'fora'`, nem `'nao'`. Os dois chamadores
(`src/ui/folhas/refeicao.jsx`, `src/ui/telas/hoje.jsx`) chamam com um argumento
só. Então os três valores de `como` são **capacidade de domínio sem lugar onde
morar**, exatamente o tipo de achado que a frente 1 catalogou: alcançáveis por
`poeComidaNoDia` e pela fusão, inalcançáveis pelo dedo. Construir a folha é
redesenho, não isto.

### 5.2 · A migração: não precisa, e aqui está o porquê

**Conferido em vez de presumido, portão por portão.** `PLANO_ATUAL` fica em
**11**.

| portão | precisa? | o que foi conferido |
|---|---|---|
| tipo | **sim, e é só isso** | `ComoFoiARefeicao` passa a ter três valores; `tsc --noEmit` limpo |
| `migraPlanoN` + bump + fixture | **não** | `como` **já é** campo persistido opcional desde a migração 9→10, que o diz com estas palavras: campo "cuja ausência já tem o significado certo… não há byte a reformatar". Valor novo não é campo novo: **dado antigo simplesmente não tem o valor novo**, e não existe byte antigo que signifique "não sei o almoço" esperando conversão |
| regra de fusão + chave + lápide | **não** | a regra de `como` em `sincronia.ts` é `if (como)`, **agnóstica ao valor**; a lápide é a da marca (`chaveDeRefeicaoFeita`), e a invariante "`como` só para id em `done`" já é aplicada nos dois lados. Um caso novo prova isso e fica vermelho se alguém enumerar valores ali |
| as duas listas brancas da cópia | **não** | a importação é **por chave de topo**: `dia: (d.dia && typeof d.dia === 'object') ? d.dia : null` e `comidaHist: Array.isArray(…)`. Nenhuma das duas enumera subcampo de `dia`, e `normalizaEstado` **não valida** valor de `como` |
| `tsc --noEmit` | sim | limpo antes e depois |
| total congelado | **nada a fazer** | `tot` sai de `totalRegistrado`, onde `'nsei'` entra com os números do plano. A adesão não lê `tot` ("o que está congelado é `tot`… e a aderência não o usa") |

**E a migração que seria errada fazer.** Converter o `aderencia: 'perdido'` dos
dias antigos em `'nsei'` por refeição afirmaria **quais** refeições ele não
soube, que ninguém registrou. É o que o próprio `migracoes.ts` proíbe:
"inventar um aqui seria afirmar sobre o passado o que ninguém registrou". Os
dois registros coexistem de propósito — um diz "não sei o que foi este almoço",
o outro diz "não sei o que foi este dia".

### 5.3 · O comentário do bloqueio de zoom

**As duas metades estavam erradas, e as duas foram remedidas aqui.**

**1. "Nenhum texto do app é menor que 16px" é falso.** Contado nas cinco folhas
de `src/*.css`: **28 declarações de `font-size` em px, 22 delas abaixo de
16px**. A menor é **7,5px** (`componentes.css`, rótulo do eixo da sparkline).
Não há `font-size` em token (`var()`), em `rem`, nem inline em JSX — as folhas
são a história inteira, conferido.

**Uma afirmação da instrução que não bateu:** ela diz que **três** valores ficam
abaixo do piso de 9px do `DESIGN.md`. **São dois** — 7,5px e 8px. O piso é
"nunca abaixo de 9px em rótulo mono", então 9px e 9,5px estão dentro dele. A
lista de valores da instrução (7,5 · 8 · 9 · 9,5 · 10) também é parcial: há
ainda 11, 11,5, 12, 13, 14 e 15px abaixo de 16. **Vale o código: a menor é 7,5px
e duas furam o piso.**

O comentário agora diz isso, e diz que o "nunca abaixo de 16px" é regra **dos
campos de formulário**, mais abaixo no mesmo arquivo, onde ela tem razão própria
e correta — o Safari dá zoom ao focar campo com fonte menor.

**2. O bloqueio não funciona onde ele usa o app.** A pinça funciona no PWA
instalado, medido pelo dono em 06/10. Então `user-scalable=no` não é honrado
ali, e o comentário passa a dizer que nesta configuração — que é **a** de uso —
a declaração não faz efeito. O que ela ainda alcança é o Safari fora da tela
cheia.

**O que ficou de pé, e é dele:** zoom acidental no meio de uma série, com a mão
suada, custa mais que zoom deliberado ganha. Essa razão nunca dependeu das duas
afirmações erradas. **A meta tag e o `touch-action` ficam** — remover é mudança
que ele não pediu.

**Três casos em `estilo.test.ts` prometiam o EFEITO no nome**, e o efeito foi
medido ausente no app instalado:

| antes | depois |
|---|---|
| `a raiz recusa os gestos de zoom, e não só os botões` | `o 'touch-action' que recusa o zoom está na RAIZ, e não só nos botões` |
| `o viewport não deixa o navegador escalar a página` | `o viewport DECLARA que o navegador não escala a página` |
| `a pinça do WebKit é recusada, que o touch-action não alcança` | `a pinça do WebKit tem recusa própria, que o touch-action não alcança` |

**Nenhuma asserção mudou**, e o cabeçalho da seção passou a carregar a medição
de 06/10 — para que ninguém leia os três como prova de que o zoom não acontece.
O caso do piso de 16px no campo não foi tocado: ele é o único dali que descreve
um efeito real e continua verdadeiro.

**Nenhuma mudança de comportamento nesta parte.** Só comentário e nome de caso.

### 5.4 · Os oito casos novos

Todos em `tests/dominio/`. Sete em `diario.test.ts`, um em `sincronia.test.ts`.

| caso | o que trava |
|---|---|
| `"não sei" numa refeição pesa zero e o dia CONTINUA contando` | a decisão inteira: adesão `(n−1)/n` e `diaInterpretavel` verdadeiro |
| `não há limiar: o dia inteiro em "não sei" é adesão zero e ainda conta` | contra a tentação de inventar "se mais da metade for não sei, o dia cai" |
| `"não sei" é distinguível de silêncio, com o mesmo número` | mesmo número, registros diferentes; e o silêncio do dia inteiro dá `null`, não zero |
| `"não sei" NÃO é "não comi": o total do dia não afirma zero kcal` | o único ponto onde os dois se separam, e que `'nsei'` segue `'fora'` |
| `o excesso ignora a refeição em "não sei"…` | que adesão e excesso não digam coisas opostas sobre o mesmo dado |
| `"não sei" não conta como cumprida em nenhuma das duas contagens…` | `padraoPorRefeicao` **e** `contagemDaRefeicao` com a mesma régua |
| `pôr "não sei" num dia passado é o caso de uso…` | `poeComidaNoDia`, que é por onde ele volta à terça esquecida |
| `"não sei" atravessa a fusão sem regra nova, porque é valor e não campo` | a prova de que não migrar está certo: fica vermelho se a fusão enumerar valores |

### 5.5 · O que eu não medi

- **Nada no aparelho.** A pinça no PWA instalado é medição do dono, de 06/10,
  aceita como dada. Não tenho aparelho e não a reproduzi — e o que o comentário
  agora afirma sobre o app instalado repousa inteiramente nela.
- **Se o `touch-action: pan-x pan-y` ainda bloqueia o toque duplo** no app
  instalado, com a pinça furando. A medição do dono é sobre a **pinça**. O toque
  duplo pode estar bloqueado e provavelmente está; **não foi medido**, e o
  comentário não afirma nem nega.
- **Legibilidade do 7,5px.** Contei a declaração; não medi se aquele rótulo é
  legível no aparelho dele. A decisão de manter o bloqueio é dele e não foi
  reaberta, mas o custo real do que se perde segue **sem medição**.
- **Se os dois valores abaixo do piso de 9px são deliberados.** Conferi o
  `DESIGN.md`: a lista de exceções citadas por fonte existe **só para a escala
  de espaço**, e não há equivalente para tipografia — então 7,5px e 8px furam o
  piso **sem exceção declarada**. E a escala de tipo do documento não tem 8,
  11, 11,5 nem 12, que também estão nas folhas. Nada disso é cobrado: o caso de
  escala do `estilo.test.ts` lê `padding`, `margin` e `gap`, **não
  `font-size`**. **Fica apontado, não resolvido** — é decisão de design, não de
  rede, e não estava na instrução.
- **A folha dos cinco botões.** Não construída, por ser redesenho. Então o
  `'nsei'` **nunca foi exercitado pelo dedo** — só por domínio, fusão e
  `poeComidaNoDia`. O mesmo valia e vale para `'fora'` e `'nao'`.
- **Tempo da suíte**, antes e depois.
- **O resto da suíte quanto a nome de caso que promete efeito.** Só a seção de
  comportamento de aplicativo do `estilo.test.ts` foi auditada, por instrução.
  Pode haver outros nomes assim em outros arquivos.

Nenhuma estimativa de prazo em nenhuma linha.
