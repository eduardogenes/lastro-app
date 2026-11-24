# Fixtures de estado congelado

Uma migração lê dado **escrito no passado**, pelo código do passado. Uma fixture
digitada à mão tem a forma que quem digita imagina — que é a forma de hoje, e é
justamente a que a migração não vai encontrar no aparelho.

Por isso o que está aqui não foi escrito à mão.

## `estado-plano-9.json`

O estado inteiro (as 32 chaves de topo), produzido pelo **build do plano 9**,
antes da migração 9 → 10 existir. Gerado assim:

1. `npm run build` no commit `39d2fdb` (`PLANO_ATUAL = 9`);
2. o app subiu no harness de `tests/fluxo/harness.js`, com `Date.now` fixado
   em 02/10/2026 08h12 local;
3. um dia foi vivido pelos verbos do app — `CTX.marcaRefeicao`, `CTX.setAgua`,
   `CTX.setEscala`, `CTX.setCadenciaDeHoje`, `CTX.registraPeso`,
   `CTX.registraCintura` —, o relógio andou 24 h e `diaDeComida()` fechou esse
   dia no histórico;
4. um segundo dia foi marcado e ficou **aberto**, com turno e enquadramento;
5. `JSON.stringify(S)` foi gravado aqui, sem edição.

O que ela prova, e que um objeto inventado não provaria:

- `dia.done` é `{"pos":1,"almoco":1,"lanche":1}` — o literal `1`, que é a forma
  que a migração 9 → 10 converte em instante;
- `comidaHist[0].done` já traz instantes, **todos iguais**: `fechaDia` carimbava
  as marcas com a hora do FECHAMENTO, porque o dia corrente não guardava a hora
  de cada uma. É o defeito que a convergência do `done` corrige daqui para a
  frente, e que a fixture registra para trás;
- `body` tem duas chaves e só duas — `peso` e `cintura`.

## `estado-plano-10.json`

O mesmo método, um plano depois: o estado inteiro produzido pelo **build do
plano 10**, antes da migração 10 → 11 existir (gerado em `ba03f95^`, com
`Date.now` fixado em 05/10/2026 07h40). Um dia de treino com as **seis**
refeições marcadas fechou no histórico, e um segundo dia ficou aberto.

O que ela prova:

- `comida.plano` tem **seis** refeições — `pre`, `treino`, `pos`, `almoco`,
  `lanche`, `jantar` — e **nenhuma ceia**. É o plano que a migração 10 → 11
  encontra no aparelho, e não o `PLANO_BASE` de hoje;
- `comidaHist[0]` é o dia **6/6** que a ceia transforma em **6/7** na leitura,
  com `tot.kcal` congelado em **3.007,1** — que é, em disco, o alvo calórico de
  um dia de treino ANTES da ceia;
- `dia.done` já traz instante de verdade, `dia.como.almoco` é `'fora'` e
  `dia.aguaNaoContada` é `1`: os três campos da migração 9 → 10 escritos pelos
  verbos do app, não à mão;
- `body` tem as sete chaves e `promoPendente` é lista — as duas formas que a
  9 → 10 abriu.

## `estado-plano-11.json`

O mesmo método, um plano depois: o estado inteiro produzido pelo **build do
plano 11**, antes da migração 11 → 12 existir. Gerado em `5108800`, numa
*worktree* separada — o build tinha que ser o do plano 11, e o fonte da árvore
de trabalho já estava consertado. `Date.now` fixado em 08/10/2026 07h55; o dia
de 07/10 foi vivido pelos verbos do app (`CTX.marcaRefeicao` nas sete
refeições, `CTX.setAgua`, `CTX.setEscala`), o relógio andou para o dia seguinte
e `diaDeComida()` o fechou no histórico; aí o veredito pediu **+150 kcal** e
`CTX.aplicaAjuste` aplicou o passo; e um segundo dia ficou **aberto**, com duas
refeições marcadas e quatro copos.

Os catorze dias anteriores do histórico são **andaime escrito à mão**, e ficam
declarados como tal: eles existem só para destravar a adesão de 11 em 14 que o
ajuste calórico exige. O que a fixture prova está no dia fechado pelo app e no
plano.

O que ela prova:

- `ajuste` é **1** e `ajusteHist` tem a entrada do passo, com o veredito por
  extenso — o ledger da época, escrito pelo app e não à mão;
- os dois itens marcados com `arroz` estão em **310 g** cada: 250 g da
  prescrição mais metade do passo de 120 g. É o `q` **inflado** que a migração
  11 → 12 encontra no aparelho;
- e a string `ajq` **não aparece em lugar nenhum do estado**. Nada no dado de
  hoje diz QUANTO cada prato recebeu, que é a razão de a 11 → 12 existir: sem
  esse número, desfazer só sabe recalcular pela contagem de pratos de agora;
- `comidaHist` termina no dia **2026-10-07**, fechado pelo app, com `tot.kcal`
  congelado em **2.632,06** e `escala.lanche` em **0,5** — a meia porção que ele
  registrou, dentro do total. É o byte que nenhuma migração pode reescrever;
- `comida.v` é **igual ao `pv` desse dia fechado**, mesmo tendo o ajuste movido
  120 g de arroz dentro do plano DEPOIS do fechamento: `CTX.aplicaAjuste` não
  chama `planoMudou()`. Não é o que a 11 → 12 conserta — fica registrado aqui
  porque é o dado mostrando o defeito, e não uma leitura de código.

## `estado-plano-12.json`

Gerada em uma cópia do commit `54d45c0` com `vite build`. No harness desse
build, `app({ agora })` abriu o perfil já usado em 16/11/2026 às 10h locais.
`ctx.marcaRefeicao('almoco')` marcou o almoço. `alternaDescanso` marcou os
dias 14 e 15. Depois, `abrirAdicionar` e `lancaTreino('livre')` registraram
um treino no dia 15. O arquivo é o `JSON.stringify(a.gravado())` dessa sessão.

O plano 12 guardava os dois descansos, inclusive o do dia com treino. O campo
`falta` ainda não existia e `apagados` estava vazio.

## `estado-plano-13.json`

Gerada pelo **build do plano 13** em produção quando a etapa 0 do catálogo foi
feita: o commit `b0efd72`, numa *worktree* separada (em disco, fora do `/tmp`),
com `vite build` e o harness daquela árvore. `app({ agora })` abriu o perfil já
usado em 23/11/2026 às 10h locais. `ctx.marcaRefeicao('almoco')` marcou o
almoço, `ctx.respondeFrequencia` marcou falta (trabalho) no dia anterior,
`ctx.renomeiaExercicio('pushdown', 'Tríceps no pulley')` renomeou um exercício
do código, e a revisão v2.2 do treinador (`revisao-v22.txt`) foi colada com
todas as perguntas respondidas "é o mesmo" e aplicada. O arquivo é o
`JSON.stringify(a.gravado())` dessa sessão.

O que ela prova:

- `plano` é **13** e não há `apelidos`: o campo é opcional, e quem cria o padrão
  é `normalizaEstado`;
- o renome do 13 grava só `{ n, m }` em `S.ex.pushdown` — não uma cópia inteira;
- a v2.2 criou dezessete exercícios com o id do próprio nome, entre eles os
  cinco que no catálogo do sistema são nomes alternativos de exercícios que já
  existiam (`panturrilha-sentado`, `abducao-de-quadril-na-maquina`…): no estado
  de quem colou, eles são pessoais;
- `progTreinador` tem os onze treinos (A–E e HX, mais SA, IA, SB, IB, SC): a
  revisão soma, não substitui.

## `sincronia-build13.ts`

O `src/dominio/sincronia.ts` do mesmo commit `b0efd72`, congelado (só os
imports reapontados para `src/`). É o `funde` que roda nos aparelhos que ainda
não atualizaram. Prova, contra o código de hoje, que uma edição de documento
feita no build novo atravessa uma fusão no 13 e volta intacta, e que a lápide de
um apelido atravessa o 13 (`tests/dominio/catalogo.test.ts`).

## `catalogo-ids-v1.json`

Os 194 ids da semente do catálogo do sistema na versão 1, congelados. Um id
nunca sai do catálogo (o histórico dele ficaria sem nome); o teste confere que
todos continuam na semente.
