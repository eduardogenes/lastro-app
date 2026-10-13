# 09 · Frente 0 — a migração única e a função que faltava

A frente 0 não tem interface. Ela é dado e prova, e existe para que o resto seja
reversível. Duas entregas dela já estavam feitas: a lista branca da importação
(`6035a5c`) e o inventário dos testes (`08-rede.md`). Este documento é a
terceira: **a migração 9 → 10, uma só, e a função pura que põe comida num dia de
data arbitrária.**

O `07-plano.md` §3.4 lista quatro mudanças de dado persistido. **São cinco:** a
frente 1 achou a quinta (`S.promoPendente`) e o coordenador a confirmou no
código no meio desta entrega. Ela entrou na **mesma** migração, pela regra que o
plano escreve — duas migrações pagam os portões duas vezes. Está no §1.5.

Depois disso o dono respondeu a ceia, que eu tinha recusado inventar, e ela
entrou numa **segunda** migração, a **10 → 11** — a 10 já estava gravada, e
migração não se reescreve. Está no §7, com o alvo calórico medido.

Nenhuma linha deste arquivo tem estimativa de prazo. Onde não houve medição,
está escrito que não houve.

## Convenção de prova

- **conferi** — abri o arquivo e contei nesta sessão, com o caminho ao lado.
- **medido** — rodei e li o número de saída, com o comando ao lado.
- **não medido** — ninguém mediu, e eu não invento número.

## O estado da suíte

| | antes (`39d2fdb`) | depois (a entrega desta frente) |
|---|---:|---:|
| `tests/fluxo/` | 514 | 517 |
| `tests/dominio/` | 372 | 437 |
| total | 886 | 954 |
| *unhandled rejections* da suíte de fluxo | 4 | 4 |

**Medido** com `npm test` (que roda `vite build` no `pretest` — a suíte testa o
build, não o fonte). `npx tsc --noEmit` sai limpo. As quatro rejeições não
tratadas (`createElementNS` ×2, `addEventListener` ×2) são as mesmas de antes:
trabalho assíncrono chegando numa janela jsdom já fechada. Não mexi nelas.

**RETIFICAÇÃO (06/10).** A coluna da direita dizia "`HEAD`", e `HEAD` andou
desde então. Os números acima são a medição **desta entrega** e continuam
válidos como tal. A linha de base de hoje, medida com `npm test` em 06/10, é
**965 passando, 53 arquivos, zero rejeições não tratadas** — `tests/fluxo/`
**520** e `tests/dominio/` **445**. As 4 rejeições não tratadas foram fechadas
depois desta entrega, dando ao app um desligamento: `09-desligamento.md` conta
como, e o registro da ONDA 5 em `00-coordenacao.md` o aceita. Qualquer número de
suíte deste arquivo vale para a data dele, não para hoje.

Os 65 testes de domínio novos: `migracoes.test.ts` 27 → 51, `sincronia.test.ts`
36 → 53, `diario.test.ts` 13 → 37. Em fluxo, `dados.test.js` 19 → 22.

**Os 372 de domínio nunca ficaram vermelhos por erro meu.** Dezessete casos
ficaram vermelhos uma vez, de propósito, quando a ceia entrou no plano: todos
afirmavam "seis refeições" ou a lista ordenada delas, e o plano passou a ter
sete. Era o alarme funcionando — ver §7.7 e §6.

---

## 1 · Os seis portões, um por um

### Portão 1 · O tipo

**`S.body` deixou de ser `{ peso, cintura }`.**

- `QualMarca` e `Corpo` — `src/dominio/tipos.ts:400` e `:405`. Sete chaves:
  `peso`, `cintura`, `bioPeso`, `bioMusculo`, `bioGordura`, `bioGorduraPct`,
  `bioAgua`.
- `Estado.body: Corpo` — `src/dominio/tipos.ts:537` (era `:481`, a linha que o
  plano cita).
- A tabela que diz o que cada uma é — `MEDIDAS_DO_CORPO`,
  `src/dominio/corpo.ts:42`: chave, nome, unidade, se sai da bioimpedância e se
  a entrada pode ficar vazia. `MARCAS_DO_CORPO` (`:53`) e `MARCAS_DA_BIO`
  (`:56`) derivam dela.

A tabela existe porque a forma estava fechada em **dois** lugares (o tipo e a
fusão), e abrir dois lugares à mão é como eles divergem. Agora a fusão, a
migração, o padrão do boot e a lista branca da importação **enumeram a mesma
tabela**; grandeza nova entra numa linha só. O prefixo `bio` não é enfeite: faz
a separação aparecer em qualquer JSON de backup.

**O peso da manhã continua sendo `peso`**, intocado, e é ele que alimenta
`mediasSemanais`, `taxasSemanais` e `veredito` (`src/dominio/corpo.ts`). O da
balança de bioimpedância é `bioPeso`, outro registro, com data própria — a
resposta literal do dono (`00-coordenacao.md`, 5.a''' item 1). Não unifiquei,
não dedupliquei, e `src/dominio/tipos.ts:384-399` escreve por quê.

**O dia de comida ganhou três campos** — `src/dominio/nutricao/tipos.ts`:

| campo | linha | o que é |
|---|---|---|
| `done: Record<string, number>` | `:126` | o INSTANTE da marca, convergido na forma que `DiaComidaHist.done` (`:198`) já tinha |
| `como?: Record<string, ComoFoiARefeicao>` | `:146`, tipo em `:110` | `'fora'` = comi, mas não foi isto; `'nao'` = não comi esta refeição |
| `aguaNaoContada?: 1` | `:137` | "não contei a água" como **fato**, e não como zero copo |

Os três também em `DiaComidaHist` (`:198`, `:202`, `:206`), que é o ponto: a
forma do dia corrente e a do dia fechado passaram a ser a mesma.

`como` cobre as duas respostas de uma vez — 14.2 ("guardar qual refeição saiu do
plano") e 14.3 ("separar não comi de esqueci") — porque são a mesma pergunta
sobre a mesma marca: o que aconteceu naquela refeição. Dois mapas separados
teriam duas regras de fusão e duas lápides para a mesma coisa.

**`S.promoPendente` deixou de ser documento** — a quinta mudança. Está no §1.5,
porque ela tem portão próprio em cada um dos seis.

### Portão 2 · `migraPlano10`, o bump, e a fixture

- `PLANO_ATUAL = 10` — `src/dominio/migracoes.ts:26` (era `:24`).
- `Resultado10` e `migraPlano10` — `:586` e `:621`.
- Ligada nas **duas** cadeias, como manda o `ARQUITETURA`: boot em
  `src/main.jsx:441`, importação de backup em `src/main.jsx:3641`.

**Das cinco mudanças, duas são reformatação de dado existente** — e é por elas
que a migração precisa existir:

1. **`S.dia.done`: `1` → instante.** Dado antigo com forma nova. É migração.
2. **`S.promoPendente`: documento → coleção.** Dado antigo com forma nova
   também, e com um `sid` a sintetizar. É migração. Ver §1.5.
3. **As cinco chaves da bioimpedância.** Pelo contrato escrito em
   `normalizaEstado()` (`src/main.jsx:360-365`), campo novo e vazio recebe
   padrão lá e dispensa migração — foi assim que `aulas`, `quadro`, `comidaHist`
   e `protocolo` entraram. Entram na migração de propósito, para o bump de
   versão ser a prova de que as cinco existem e para a fixture cobri-las.
4. **`como`** e 5. **`aguaNaoContada`** são opcionais cuja **ausência já
   significa o certo**: "comeu o que estava prescrito" e "a água foi contada".
   Não há byte a reformatar, e semear um valor aqui seria afirmar sobre o
   passado o que ninguém registrou. Há teste disso
   (`tests/dominio/migracoes.test.ts`, *"9→10 não inventa `como` nem
   `aguaNaoContada`"*).

**A hora que a marca antiga não tem.** O literal `1` não carrega nada. A
migração usa a **meia-noite local do dia**, não o instante da migração. O motivo
é a lápide: `chaveDeRefeicaoFeita` mata a marca cujo instante é `<=` o dela, e
carimbar a marca com "agora" a faria nascer mais nova que qualquer lápide
escrita antes — ressuscitando o que o outro aparelho desmarcou. Meia-noite é o
instante mais antigo compatível com a data, e portanto o conservador.
**Conferi** que, hoje, nenhum caminho do app escrevia lápide de
`chaveDeRefeicaoFeita` (a chave existia só em `src/dominio/sincronia.ts`), então
para o dado que existe no aparelho a escolha é **inobservável**; ela vale para
quando a lápide passar a ser escrita — o que este trabalho também fez (portão 3).

Data ilegível não vira instante inventado: a marca fica como está e a versão
avança (teste *"9→10 não quebra em dia com data ilegível"*).

#### A fixture, e por que ela é o dado da época

`tests/dominio/fixtures/estado-plano-9.json` — 631 linhas, o estado inteiro (as
32 chaves de topo). **Não foi digitado.** Foi gerado assim, e o registro está em
`tests/dominio/fixtures/LEIA.md`:

1. `npm run build` em `39d2fdb`, onde `PLANO_ATUAL` era 9;
2. o app subiu no harness de `tests/fluxo/harness.js` com `Date.now` fixado em
   02/10/2026 08h12 local;
3. um dia foi **vivido pelos verbos do app** — `CTX.marcaRefeicao`,
   `CTX.setAgua`, `CTX.setEscala`, `CTX.setCadenciaDeHoje`, `CTX.registraPeso`,
   `CTX.registraCintura`;
4. o relógio andou 24 h e `diaDeComida()` fechou esse dia no histórico;
5. um segundo dia foi marcado e ficou aberto, com turno e enquadramento;
6. `JSON.stringify(S)` foi gravado, sem edição.

A forma exata do que importa:

```json
"plano": 9,
"body": { "peso": [ {"t":1790939520000,"v":79.4,"m":1790939520000},
                    {"t":1791025920000,"v":79.1,"m":1791025920000} ],
          "cintura": [ {"t":1790939520000,"v":86.5,"m":1790939520000} ] },
"dia": { "data":"2026-10-03",
         "done": {"pos":1,"almoco":1,"lanche":1},
         "agua":4, "escala":{"lanche":1.5},
         "cadencia":null, "alta":0, "aderencia":"fora", "turno":"noite" },
"comidaHist": [ { "d":"2026-10-02",
                  "done": {"pre":1791025920000,"treino":1791025920000,
                           "pos":1791025920000,"almoco":1791025920000,
                           "jantar":1791025920000},
                  "agua":9, "escala":{"jantar":0.5},
                  "tot":{"kcal":1849.7,"p":95.47,"c":251.55,"g":48.705},
                  "pv":1791025920000, "m":1791025920000,
                  "cadencia":"treino" } ]
```

Uma fixture digitada à mão teria a forma que quem digita imagina — que é a forma
de hoje, e é justamente a que a migração não vai encontrar no aparelho. Esta
prova três coisas que um objeto inventado não provaria:

- `dia.done` é `{"pos":1,"almoco":1,"lanche":1}` — **o literal `1`**, duas chaves
  em `body` e nada mais;
- `comidaHist[0].done` já traz instantes, **e todos iguais**: `fechaDia`
  carimbava as marcas com a hora do **fechamento**, porque o dia corrente não
  tinha a hora de cada uma. Um dia inteiro aparecia marcado na mesma hora. **Foi
  a fixture que mostrou isso**, e foi por isso que o `fechaDia` entrou nesta
  entrega;
- `escala: {"lanche": 1.5}` saiu dos verbos do app, não de mim — a régua de
  porções **já tem** valores acima de 1 (ver §3).

A fixture é lida do disco pelos testes (`readFileSync`), não importada como
módulo: ela é dado, e dado se lê.

E ela entra pelo **boot do app**, não só pela função: `tests/fluxo/dados.test.js`,
*"o estado congelado do plano 9 entra pelo boot e sai migrado"*. Os testes de
domínio exercitam `migraPlano10` direto; esse prova que ela está **ligada** na
cadeia, que as cinco chaves nascem, que a pesagem da manhã atravessa intocada,
que o histórico não é reescrito, e que as cinco telas abrem com ele.

### Portão 3 · A regra de fusão — chave, lápide e teto

Tudo em `src/dominio/sincronia.ts`.

- **Chave.** `chaveDeMarca` recebe `QualMarca` e não `'peso' | 'cintura'`
  (`:98`). Sem isso, a chave da lápide não casava com a da fusão para uma
  grandeza nova, e a medida apagada voltava do outro aparelho.
- **A enumeração.** `base.body` é montado varrendo `MARCAS_DO_CORPO` (`:577-578`),
  no lugar de `base.body = { peso: [], cintura: [] }` com o laço
  `['peso','cintura']`. **Teto** inalterado: `TETO.body = 400` por grandeza.
- **`como` viaja com a marca** (`:324-347`). É atributo dela, não registro
  próprio: o lado cuja marca entrou traz o atributo junto, a lápide que mata a
  marca mata o atributo, e um `como` que sobrasse sem marca é varrido no fim
  (`:368-375`) — solto, ele afirmaria "saiu do plano" sobre uma refeição que o
  dia não diz ter acontecido.
- **`aguaNaoContada`**: é o único campo em que **contar vence** (`:348-350`).
  Declarar que não contou e, no outro aparelho, ter contado são afirmações sobre
  o mesmo dia, e a segunda tem dado por trás. Se os dois lados declararam, o
  fato sobrevive — senão o dia voltaria a parecer um dia de zero copo.
- **O instante atravessa** a conversão interna do dia aberto (`:502-515`). Antes
  ela achatava a marca em `1` nos dois sentidos, porque era a forma do dia
  corrente; `1` é 1970, e qualquer lápide mataria a marca.

**A lápide passou a ser escrita.** `chaveDeRefeicaoFeita` existia na fusão desde
que o dia aberto passou a fundir campo a campo, e **ninguém a escrevia**:
desmarcar uma refeição aqui era desfeito pelo outro aparelho, que ainda tinha a
marca. `CTX.marcaRefeicao` (`src/main.jsx:2142`) agora grava o instante, aceita
`como` opcional e deixa lápide ao desmarcar — e a marca nova nunca nasce igual
ou anterior à lápide, senão marcar, desmarcar e marcar de novo no mesmo
milissegundo faria a fusão apagar o que ele acabou de marcar.

#### Três defeitos de fusão que achei de passagem, e consertei

Não eram a tarefa; são do mesmo tipo (campo do dia perdido em silêncio) e
estavam no caminho.

1. **`aderencia` não entrava na conversão do dia aberto**, e a reconstrução de
   `base.dia` não a devolvia: **fundir dois aparelhos no mesmo dia apagava o
   enquadramento** ("saí do plano", "dia perdido"), sem dizer nada.
   `src/dominio/sincronia.ts:511` e `:528`.
2. **`aderencia` não estava na lista dos campos que vêm do lado com carimbo mais
   novo** nos dias fechados (`:359`): o lado local vencia sempre, mesmo quando o
   outro aparelho respondeu depois.
3. **O dia aberto não tinha carimbo nenhum.** `DiaComida` não tem campo de
   alteração, então `carimboM` devolvia 0 dos dois lados e o desempate nunca
   acontecia: `escala`, `cadencia`, `turno` e `aderencia` vinham **sempre** do
   lado local. Passou a usar o `mtime` do estado (`:495-516`), que é o mesmo
   sinal que já decide os documentos. Foi um teste meu que achou isto — o que
   afirmava "dos dois lados".

Quinze testes novos em `tests/dominio/sincronia.test.ts` (36 → 51).

### Portão 4 · As duas listas brancas da cópia de segurança

**A asserção da exportação não saiu.** `tests/fluxo/dados.test.js`, teste
*"exportar carrega todos os campos do estado"*: as 32 chaves de topo continuam
travadas, e nenhuma chave de topo foi acrescentada — as quatro mudanças são
aninhadas (cinco dentro de `body`, três dentro de `dia`).

**E é exatamente aí que estava o buraco.** A asserção tranca o topo; `body` é uma
chave só, e a importação copia as grandezas **por nome**
(`src/main.jsx:3586`, antes `body: { peso: …, cintura: … }` escrito à mão). Uma
grandeza nova fora dessa lista sumiria — e **sumiria em silêncio**, porque
`normalizaEstado()` roda depois da importação e devolve a chave como lista
vazia. É o mesmo mecanismo que escondeu os seis campos de topo do F251.

O que entrou:

- `corpoVazio()` e `corpoDoBackup()` — `src/main.jsx:297` e `:304`. Os quatro
  lugares que escreviam a forma à mão (estado inicial `:315`, `normalizaEstado`
  `:364`, `wipe()` `:4322`, lista branca `:3586`) passam por elas.
- O teste de paridade *"reimportar devolve TODOS os campos"* passou a **semear
  as cinco chaves com conteúdo** — sem conteúdo a perda seria muda — e a afirmar
  cada uma pelo nome, mais os três campos do dia.
- Um teste novo: *"as sete medidas do corpo saem e voltam pelo nome, uma a uma"*,
  com valor diferente por grandeza, para uma troca de nomes também ficar
  vermelha.

**Conferi que as asserções podem falhar**: reescrevi `corpoDoBackup` com
`['peso','cintura']` à mão e rodei — duas falharam (*"campos perdidos na
importação"* e *"bioPeso voltou"*). Depois restaurei. Teste que não sabe falhar
não é prova.

### Portão 5 · `npx tsc --noEmit`

Limpo. **Medido** depois de cada peça. Nota: `tsconfig.json` inclui só `src`, e
`checkJs` é `false` — então `tsc` **não** checa `src/main.jsx` nem os arquivos de
teste. O que ele garante é o domínio, que é onde erro de formato custa
histórico. Quem foi pego por ele: o `base.body` da fusão, que é o segundo lugar
onde a forma estava fechada.

### Portão 6 · A disciplina do total congelado

**Não reescrevi o histórico, e não precisei.** A conclusão é curta e é a mais
importante deste documento:

> **A adesão já é leitura derivada.** `aderenciaDoDia`
> (`src/dominio/nutricao/calculo.ts:585`) lê `done` e `escala` do dia congelado
> e divide por `refs`, que **sai de `refeicoesDeHoje(plano, …)` com o plano de
> HOJE, a cada chamada** — em `aderenciaPorSemana`, `recorteDoHistorico`,
> `contagemDaRefeicao`, `padraoPorRefeicao` e `trocasDeAjuste`, **conferi os
> cinco**. O que está congelado em `DiaComidaHist` é `tot` — calorias e macros —
> e a adesão **não o usa**.

Logo, a regra nova "reconta para trás" **sem tocar em byte nenhum**: ela recalcula
na leitura, em cima do dado congelado, que continua gravado como registro do que
foi contado na época. Não cheguei na situação de ter de parar e devolver a
decisão ao dono.

Há teste disso, e ele é o teste da ceia: *"uma refeição que entra no plano muda o
denominador de todo dia, sem tocar no congelado"*
(`tests/dominio/diario.test.ts`) — o mesmo dia fechado passa de 6/6 para 6/7 na
leitura, e `tot.kcal` fica idêntico.

### 1.5 · A quinta mudança: `S.promoPendente` como coleção

Achada pela frente 1, confirmada pelo coordenador e por mim. Entrou na **mesma**
migração 9 → 10 — não numa 11 — porque é a regra que o próprio plano escreve.

**O que era.** `promoPendente: PromoPendente | null`
(`src/dominio/tipos.ts:659`, interface em `:289`): **uma** pergunta guardada,
com um `day` só, escrita por **atribuição direta** em `fechaSessao`. Dois
defeitos independentes, e os dois são perda de dado hoje:

1. **O fecho seguinte sobrescrevia o anterior.** A pergunta da terça sumia
   quando a quinta fechou sozinha.
2. **Não havia regra de fusão.** `promoPendente` não era coleção, e
   `src/dominio/sincronia.ts:431` diz: *"clone do lado que manda nos documentos:
   tudo que não é coleção vem dele"*. **Conferi.** O que o celular registrou
   sumia porque o notebook sincronizou depois.

**A chave natural é o `sid` da sessão** — `chaveDePromo`,
`src/dominio/sincronia.ts:122`. Não `day + sid`, e o motivo está escrito no
código:

- **`sid` já é a identidade de uma sessão neste repositório.** `chaveDeSessao`
  usa **só** ele, para o `S.done`. **Conferi** que é estável e único: é
  atribuído no nascimento da sessão (`src/main.jsx:543`, `:738`, `:918`, e
  `:3240` na sessão retroativa) e **nunca reatribuído** (`grep '\.sid = '` no fonte não
  acha nada). `normalizaEstado` descarta sessão sem `sid`, então ele é garantido.
- **`day` na chave seria ativamente ruim.** O dia é editável no meio do treino —
  é capacidade protegida ("trocar de dia no meio do treino não perde nem
  sobrescreve", `tests/fluxo/sessao.test.js`). Se dois aparelhos tivessem
  registrado letras diferentes para a mesma sessão, a **mesma** pergunta
  fundiria como **duas entradas**, e ele responderia duas vezes. Há teste:
  *"a chave da pergunta é o `sid`, e não o dia — que é editável no treino"*.

**Os seis portões, para ela:**

| portão | onde |
|---|---|
| tipo | `PromoPendente` ganhou `sid?` e `m?`; `Estado.promoPendente: PromoPendente[]` — `src/dominio/tipos.ts:289` e `:659` |
| migração | `listaDePromo` (`src/dominio/migracoes.ts:617`), chamada em `migraPlano10`, com `Resultado10.promos`; quatro testes, um deles contra a fixture |
| fusão | `chaveDePromo` (`sincronia.ts:122`), `uneLista` com lápide (`:546-553`), `TETO.promo = 60` (`:37`); quatro testes |
| listas brancas | topo inalterado (a chave de topo é a mesma, de propósito); `src/main.jsx:3616` passa o documento antigo intacto para a migração converter; sob asserção nominal em `dados.test.js` — **conferi que falha** se eu tirar a chave da lista |
| `tsc` | limpo |
| total congelado | não se aplica: não alimenta a regra do nutricionista |

**O nome ficou no singular.** Renomear para `promoPendentes` obrigaria a lista
branca da cópia a conhecer **dois** nomes para sempre, por causa dos backups
antigos. `S.gordura`, `S.cardio` e `S.done` já são coleções com nome singular —
é a casa.

**Não inventei campo de vencimento.** A resposta do dono (P1, `00-coordenacao.md`
5.a') é literal: vence **por posição**, quando aquele treino voltar na sequência,
e isso *"sai de graça do modelo; nenhum carimbo novo no dado"*. E o que a mudança
vira ao vencer — "só daquele dia" (P2) — é o estado em que ela **já está**,
porque nunca foi promovida ao oficial: não há o que gravar. Um campo `vencida`
aqui seria eu decidindo no lugar dele.

**A forma serve aos dois fechos, não só ao automático.** `guardaPromo(s,
pendentes)` (`src/main.jsx:658`) e `soltaPromo(sid)` (`:682`) recebem a sessão e
o `sid` — **nenhuma das duas sabe se o fecho foi manual ou automático**. Hoje só
o automático guarda, porque pela porta da frente quem pergunta é
`finalizarSessao`; quando a pergunta do fim do treino sair (decisão D1), o fecho
manual guarda pelo mesmo caminho, **sem mexer na forma do dado**. O achado que o
coordenador me passou — de que no fecho manual não existe carregador nenhum, e
que tirada a pergunta a mudança é descartada em silêncio — **não foi consertado
aqui**: é fluxo, é da frente 2, e está no §5.

**Um defeito a mais que a coleção expôs, e consertei.** `finalizarSessao` fazia
`S.promoPendente = null` (hoje `src/main.jsx:963`) com o comentário "a pergunta é
agora, e não fica guardada". Enquanto era documento, **essa linha apagava
qualquer pergunta guardada de OUTRA sessão junto**: a da terça sumia porque ele
finalizou a quinta. Agora `soltaPromo(s.sid)` tira só a desta sessão.

E `soltaPromo` **deixa lápide**, sempre: sem ela, o outro aparelho traria de
volta a pergunta que ele acabou de responder — é a mesma regra das outras
coleções, e aqui é o F280 pelo avesso. `abrePromoGuardada` (`:2728`) passou a
abrir **a mais antiga**, na ordem em que as sessões fecharam; as outras seguem
esperando.

---

## 2 · O que não bateu com o que me foi dito

**O que vale é o código.** Cinco coisas:

0. **O §3.4 do plano lista quatro mudanças de dado persistido; são cinco.**
   `S.promoPendente` é a quinta — achada pela frente 1, confirmada pelo
   coordenador e por mim no código. Entrou na mesma migração. §1.5.

1. **A ceia não existia no plano.** `PLANO_BASE` tinha **seis** refeições —
   `pre`, `treino`, `pos`, `almoco`, `lanche`, `jantar` — e nenhuma ceia. A nota
   do jantar dizia, literalmente: *"Sem ceia obrigatória: o dia já fecha proteína
   e energia com quatro refeições proteicas completas."* Então "a ceia conta na
   adesão" não era mudança de aritmética: o denominador é o plano, e faltava a
   refeição. **Não a inventei** — ninguém tinha prescrito horário nem itens. O
   dono respondeu depois (copo de leite com duas colheres de Neston), e aí ela
   entrou, pela migração 10 → 11: **§7**.
2. **As porções acima de 1 já estão na tela.** `PORCOES` em
   `src/ui/folhas/refeicao.jsx:14` oferece ½, ¾, cheia, **1¼ e 1½**. O plano
   dizia certo que não pedem migração, mas não dizia que **já existem** — então a
   adesão acima de 100% não era um risco futuro: era o comportamento vigente, e
   o dado do aparelho pode já ter escala 1,5. A fixture gerada do build de ontem
   tem `escala: {"lanche": 1.5}` justamente porque o app aceitou.
3. **A lápide da refeição não tinha quem a escrevesse.** O plano trata a fusão da
   comida como pronta. A chave existia (`chaveDeRefeicaoFeita`) e a fusão a
   respeitava, mas **nenhum caminho do app a gravava** — desmarcar era desfeito
   pelo outro aparelho.
4. **`fechaDia` perdia a hora da marca** — carimbava todas com a hora do
   fechamento. O plano descreve a convergência do `done` como "não é campo novo,
   é convergir a forma"; é verdade, e a convergência também **conserta uma perda
   que já acontecia**.

Os números de linha que me foram dados batiam todos — inclusive os dois que o
coordenador mandou junto com a quinta mudança (`PromoPendente` perto de
`tipos.ts:270`, `promoPendente` perto de `:613`, e o `comoFim === 'auto'` de
`fechaSessao`): `PLANO_ATUAL` em
`migracoes.ts:24`, `S.body` em `tipos.ts:481`, `base.body` em
`sincronia.ts:475-482`, `DiaComida.done` em `nutricao/tipos.ts:99`,
`DiaComidaHist.done` em `:155`, `MIN_REGISTRADOS` em `corpo.ts:135`,
`diaDeComida()` em `main.jsx:1847`, `fechaDiaDeComida` em `:1871`,
`marcaRefeicao` em `:2055`, a importação em `main.jsx:3459-3500`. As contagens
também: 514 e 372, e as 4 rejeições.

---

## 3 · A aritmética da adesão, e a decisão sobre passar de 100%

> **RECONCILIAÇÃO (06/10) · o estado honesto desta seção inteira.** Toda a
> aritmética abaixo é alcançável pelo **modelo** e **inalcançável pelo dedo**:
> **nenhum chamador de `marcaRefeicao` passa `como`, em valor nenhum.** Conferi
> os dois chamadores — `src/ui/folhas/refeicao.jsx` e `src/ui/telas/hoje.jsx` —,
> e os dois chamam com um argumento só. Então os três valores de `como` hoje
> existentes (`'fora'`, `'nao'` e, desde 06/10, `'nsei'`) são **capacidade de
> domínio sem lugar onde morar**: `poeComidaNoDia` e a fusão os alcançam, o dedo
> do dono não. Onde esta seção diz "declarar com um toque", leia **"quando
> houver onde tocar"**: a folha dos cinco botões é a frente 2 virando código, e
> isso não começou. Está na ordem certa — modelo antes de tela —, mas não pode
> ficar implícito.
>
> **E um valor novo entrou depois desta entrega:** `'nsei'` — "não sei" por
> refeição —, com **peso 0 e dentro do denominador**, pela decisão 2 do dono de
> 06/10 e pela aritmética que o coordenador decidiu por delegação dele. Não
> custou migração: `como` já era campo persistido opcional desde a 9→10, e valor
> novo não é campo novo. A condição de peso zero saiu de quatro pontos à mão
> para uma função só, `semCumprimento` (`src/dominio/nutricao/calculo.ts`).

**A decisão: a adesão tem teto de 1 por refeição, e o que passou do plano é
medido à parte.**

`pesoDaRefeicao` (`src/dominio/nutricao/calculo.ts:558`) devolve de 0 a 1;
`excessoDoDia` (`:612`) devolve o excedente, com o mesmo denominador.

Por que teto, e não deixar passar de 100%:

- Adesão responde **"quanto do prescrito foi cumprido"**. Cumprir uma refeição é
  cumpri-la; mais que ela não é mais cumprimento. Sem teto, `escala: 1.5` fazia
  **comer mais que o plano aparecer como aderir melhor do que aderir** — o
  oposto do que o número quer dizer.
- `recorteDoHistorico` (`:785`) conta "dia cumprido" com o limiar `a >= 0.999`.
  Sem teto, **um dia de excesso era contado como dia cumprido pelo excedente, e
  não pelo cumprimento** — bastava uma porção de 1½ para compensar uma refeição
  pulada e o dia entrar como inteiro.
- `trocasDeAjuste` (`:819`) é a auditoria da régua calórica: ela existe para
  perguntar se o ajuste disparou sobre semanas bem executadas. Uma semana de
  excesso lendo 110% esconderia um problema que é o oposto de adesão baixa e
  igualmente invalidante.

Por que **não** basta o teto, e o excesso precisa existir: senão o "comi mais que
o plano" — que é a porção que o dono disse que pesa — **sairia do sistema**.
Ninguém saberia a diferença entre o dia seguido à risca e o dia em que ele comeu
uma vez e meia o almoço. Então são **duas leituras que se leem juntas**: 100% e
+8% é um dia cumprido com sobra; 100% sozinho é um dia cumprido. É a mesma razão
pela qual a função pondera em vez de contar — o dado existe, e jogar fora o mais
informativo seria o erro.

E o excesso **não compensa a falta**: `escala: {almoco: 1.5, jantar: 0.5}` dá
adesão 5,5/6 e excesso 0,5/6. Há teste.

**As outras duas regras:**

- **"Não comi" conta como dia de consumo conhecido.** Vem de graça da forma do
  dado: `como: 'nao'` é **marca em `done` com atributo**, não ausência de marca,
  então `diaInterpretavel` (`:688`) já conta o dia. A alternativa — guardar o
  "não comi" fora de `done` — faria o dia honesto valer menos que o dia
  esquecido, que é exatamente o defeito que a regra existe para corrigir. E
  "conhecido" aqui é **zero**: a refeição vale 0 na adesão, porque o app sabe
  exatamente o que entrou ali.
- **`MIN_REGISTRADOS` não mudou.** Segue 11 em 14,
  `src/dominio/corpo.ts:178`. É limiar do nutricionista, não meu. O que muda é
  que declarar "não comi" com um toque passa a produzir um dia **contado**, em
  vez de silêncio — que é o que torna o portão alcançável. **Se ele fica
  alcançável de fato é comportamento ao longo de semanas, e isso não foi
  medido.**

**Três defeitos de contagem que isso expôs**, e que consertei:

1. `totalRegistrado` (`:79`) somava as calorias de refeição marcada "não comi" —
   o total congelado afirmaria o contrário do que ele declarou. Agora ela fica
   fora. Refeição com `'fora'` **entra** com os números do plano, porque são os
   únicos que o app tem: ele comeu, só não foi isto, e a marca é a procedência
   dizendo que o número é do prescrito. O app não adivinha a diferença e não
   finge saber.
2. `padraoPorRefeicao` (`:645`) e 3. `contagemDaRefeicao` (`:763`) contavam o
   pulo declarado como acerto — e essas duas leituras respondem **"qual refeição
   eu mais falho"**. Apontavam para o lado errado.

---

## 4 · A função pura que o app não tinha

`poeComidaNoDia` — `src/dominio/nutricao/calculo.ts:478`, com `ComidaDoDia`
(`:415`) e `PostoNoDia` (`:430`).

**Conferi** que não existia: `diaDeComida()` (hoje `src/main.jsx:1921`) carimba o
dia com a data e zera na virada; `fechaDiaDeComida` (`:1945`) congela o dia velho; e
`CTX.marcaRefeicao` escreve **sempre** no dia corrente. Não havia caminho para a
terça que ele esqueceu de marcar.

Função de domínio, **sem superfície nenhuma**: não lê relógio (`agora` e
`hojeISO` entram por parâmetro, como em todo este módulo), não lê estado, não
toca em tela, e devolve um histórico **novo** em vez de mexer no que recebeu.
Catorze testes em `tests/dominio/diario.test.ts`. As decisões:

- **Data futura é recusada.** Dia que não aconteceu não se registra — é a mesma
  regra que a tela de corpo já aplica ("nunca futura",
  `tests/fluxo/corpo.test.js`).
- **Data ilegível é recusada**, em vez de virar linha com chave torta: `d` é a
  chave natural do histórico **e** a chave da fusão, e uma linha com data
  inválida nunca mais seria alcançada por lápide nenhuma.
- **A linha que existe é completada, chave a chave**, não substituída. "Marquei o
  jantar que esqueci" não pode virar "apaguei o resto da terça". O que vem agora
  vence em conflito — corrigir a porção de um dia passado é o caso de uso.
- **Dia que continua mudo não vira linha.** Mesma regra de `fechaDiaDeComida`:
  guardar um dia vazio como zero seria dizer que ele não comeu. Se a linha já
  existia, ela fica — **apagar um dia do histórico é destrutivo, não foi
  desenhado (§4 do plano) e não é isto que esta função faz.**
- **Chamada que não muda nada não reescreve a linha nem adianta o `m`**, que é o
  carimbo de desempate da fusão: bumpá-lo sem mudança faria este aparelho
  afirmar ser a cópia mais nova de um dia que ele não tocou. É a mesma regra do
  `identicos` da sincronização.
- **O total é recongelado, com `pv` novo.** O congelamento protege o passado de
  mudança no **plano**, não de mudança nas **marcas** — e elas mudaram agora, de
  propósito. É o mesmo que `fechaDiaDeComida` já faz ao reabrir um dia.
- **O limite honesto, escrito no contrato:** para um dia passado, `plano` é o
  plano de **hoje** — o plano daquela data não existe em lugar nenhum, porque
  `pv` guarda *quando* ele era aquele e não *o que* era. Então o dia posto em dia
  é contado contra o plano atual, e `pv` registra isso para a tela poder dizer
  "este dia foi calculado contra um plano diferente". Não há como fazer melhor
  sem um snapshot por dia, e o custo disso já está calculado no comentário de
  `DiaComidaHist.pv`: 1.907 bytes × 3.650 dias = 6,6 MiB, que estoura o teto do
  Safari.
- **`ajuste` é de quem chama**, e `null` preserva o que a linha tinha — para um
  dia passado o valor honesto é o que estava em vigor **naquele** dia, e a função
  não adivinha.

Um teste fecha o laço: *"o dia posto em dia entra nas leituras como qualquer
outro"* — três dias postos em dia movem `diasInterpretaveis` de 0 para 3, e um
quarto dia de "não comi" o move para 4. Se registrar o passado não movesse o
portão, não serviria para nada.

**A folha de pôr o dia em dia não está aqui.** É da frente 2. Entreguei o chão.

---

## 5 · O que eu não fiz, e por quê

- **Não criei a ceia no plano.** Ninguém prescreveu horário nem itens, e inventar
  a prescrição do nutricionista não é meu lugar. Além disso, mudar `PLANO_BASE`
  **não alcançaria o aparelho dele**: o plano é documento persistido em
  `S.comida.plano`, semeado só em estado novo (`src/main.jsx:340`) — para
  acrescentar uma refeição ao plano que já existe no iPhone seria preciso **outra
  migração**, com o conteúdo da refeição congelado nela, como a 7→8 fez com o
  nome. Está provado que, quando ela entrar, a adesão a conta sozinha, para trás
  inclusive. **Decisão do dono, não minha.**
- **Não construí nenhuma tela de bioimpedância**, nem verbo de leitura para ela.
  A frente 0 não tem interface. `MEDIDAS_DO_CORPO` já carrega nome, unidade e
  obrigatoriedade de cada grandeza, então a frente 2 não precisa de tabela nova
  — e `addBody(k)`/`delBody(k, t)` (`src/main.jsx:3459` e `:3491`) já são
  genéricos na chave. **Mas três coisas na borda deles ainda são de duas chaves,
  e são da frente 2:** `CORPO_PADRAO` (`:3361`) não tem valor de partida para as
  cinco novas, e o rótulo e a unidade dos avisos saem de `k === 'peso' ? … : …`
  em `diaDaMedidaVM`, `addBody` e `delBody`. Nenhum caller existe hoje, então
  nada está quebrado; chamar `addBody('bioPeso')` hoje recusaria com "Digite um
  número válido" em vez de gravar. Deixo dito para não ser descoberto depois.
- **Não acrescentei verbos novos ao `CTX`.** `como` entrou como segundo argumento
  opcional de `marcaRefeicao`, e "não contei a água" como `setAgua(null)` — zero
  nome novo na superfície. A superfície de verbos estável é a entrega (c) da
  frente 0, que não é esta.
  **RECONCILIAÇÃO (06/10):** e esse segundo argumento **nunca é passado**.
  Conferi os dois chamadores de `marcaRefeicao` (`src/ui/folhas/refeicao.jsx` e
  `src/ui/telas/hoje.jsx`): os dois chamam com um argumento só. Então `'fora'`,
  `'nao'` e `'nsei'` são alcançáveis por `poeComidaNoDia` e pela fusão e
  **inalcançáveis pelo dedo** — é a mesma espécie de coisa que a frente 1
  catalogou como "capacidade sem lugar onde morar", e aqui foi esta frente que a
  criou. O botão "Não comi" que o dono aprovou (decisão 1) e o "Não sei" por
  refeição (decisão 2) estão **no dado e não na tela.**
- **Não escrevi o ajuste em vigor numa data passada.** `poeComidaNoDia` recebe o
  `ajuste` por parâmetro e deixa o contrato dito. Um ajudante
  `ajusteNaData(ajusteHist, data)` seria curto e cabe em `src/dominio`, mas é
  leitura que ninguém pediu e que a folha da frente 2 pode querer de outra forma.
- **Não consertei o fluxo do fecho manual.** `fechaSessao` segue com
  `const pendentes = comoFim === 'auto' ? modsDoDia(s.day) : []`
  (`src/main.jsx:712`), e `finalizarSessao` segue abrindo a pergunta na hora.
  **Conferi** que é como o coordenador descreveu: tirada a pergunta do fim do
  treino (D1), **o fecho manual passa a descartar a mudança em silêncio** — é o
  F280 nominal. Não é meu: é fluxo, e é da frente 2. O que eu devia garantir era
  que a forma do dado servisse aos dois fechos, e serve: `guardaPromo` recebe a
  sessão, não o modo de fecho. A frente 2 muda uma linha de `fechaSessao`, não a
  forma do dado nem a migração.
- **Não escrevi a regra de vencimento por posição.** É leitura derivada sobre
  `day` + a rotação, que o dono disse sair de graça do modelo, e é a tela da
  frente 2 que a lê. A coleção tem o que ela precisa (`day`, `t`).
- **Não investiguei as 4 rejeições não tratadas.** Não eram minhas, continuam 4.
- **Não medi** se o portão de 11 em 14 passa a abrir de fato — é comportamento ao
  longo de semanas. **Não medi** o tamanho do estado depois das cinco chaves
  novas (nascem vazias; o custo aparece quando ele registrar). **Não medi** nada
  no aparelho dele: tudo aqui rodou no jsdom a partir do build.

## 6 · O que toquei fora do que era meu, e o erro de staging

**Nove linhas removidas e catorze acrescentadas, em três arquivos de
`tests/fluxo/`** — `fusao.test.js`, `promocao.test.js` e `turno.test.js`;
`dados.test.js` é meu e não conta aqui. **Medido** com
`git diff --stat 39d2fdb..HEAD`. Mudar a forma de um campo persistido — ou o
conteúdo da prescrição — torna isso inevitável: um teste que afirma a forma
antiga fica vermelho. Em cada caso mudei **só a asserção**, nunca o nome do teste
nem o que ele protege.

1. **`tests/fluxo/fusao.test.js`, uma linha.** *"remover uma refeição limpa o que
   era do dia junto"* afirmava `S.dia.done.lanche === 1`. Trocado pela
   pré-condição equivalente (`> 1`, "ficou marcada, com a hora da marca"). As
   **duas** asserções que o teste protege — a marcação e a escala saindo junto
   com a refeição removida — ficaram intactas.
2. **`tests/fluxo/promocao.test.js`, três linhas.** Duas afirmavam
   `S.promoPendente === null` para "nada ficou pendente" e "não fica
   reaparecendo para sempre" → passaram a `deepStrictEqual([], …)`, com a mesma
   mensagem. Uma lia `const g = a.J('S.promoPendente')` como documento → passou a
   `[0]`, e as três asserções seguintes (`g`, `g.day`, `g.mods.length`) ficaram
   **idênticas**. Este é o arquivo que o §3.6 do plano nomeia como guarda de
   nove capacidades, então não toquei em mais nada dentro dele: os 9 casos
   continuam 9, verdes.

3. **`tests/fluxo/fusao.test.js`, três linhas** (as outras três, da ceia).
   Afirmavam `S.comida.plano.length === 6` em "plano nutricional semeado", "a
   nutrição nasce da prescrição" e "apagar o histórico não apaga o plano
   nutricional". Passaram a comparar com `a.E('PLANO_BASE.length')` — o que elas
   protegem é *"o plano nasce da prescrição inteira"*, e contra a prescrição é
   que elas devem medir. **Não voltam a envelhecer** na próxima refeição.
4. **`tests/fluxo/turno.test.js`, uma linha e meia.** A lista ordenada do turno
   da noite ganhou `'21:30 ceia'`, e o `linhas.length === 6` passou a
   `=== ordem.length`. O que o teste protege — o pré e o treino andam, o café
   fica às 8h, o jantar sai de dentro da sessão — está intacto, e a ceia das
   21:30 comprova de lado que ela não é empurrada pela sessão da noite.

**E seis asserções em três arquivos de `tests/dominio/`, que são meus:**
`nutricao.test.ts` (seis refeições → sete, 36 alimentos → 37, e a semente
comparada com `PLANO_BASE.length`), `turno.test.ts` (as três listas ordenadas) e
`diario.test.ts`. Neste último fiz mais que adaptar: o **"dia cheio" estava
escrito à mão** (`{ pre, treino, pos, almoco, lanche, jantar }`) e a ceia o
transformou num dia com uma refeição faltando, enquanto o teste continuava
chamando aquilo de "comeu tudo". Passou a ser derivado do plano
(`todoOPlano(treino)`), e os denominadores saem de `refs.length` em vez de `6`
literal. **Esse era o defeito real**: não o número, mas a lista congelada à mão
num teste que afirma "tudo".

**Conferi** com `grep` em toda a pasta que não havia outra linha afirmando as
formas antigas nem a contagem antiga. Deixar a suíte vermelha para honrar a
fronteira de arquivo serviria à letra contra o propósito dela, que é não colidir
com outro agente — e a frente 1, que corre junto, só escreve em
`docs/redesign/`. Fica registrado aqui, com o diff descrito linha por linha,
para o coordenador rever.

**O erro de staging, e o que mudou.** O commit `2a634b5` levou
`docs/redesign/09-frente1-lugares.md`, da frente 1, porque eu usei `git add -A`.
Nada se perdeu, e o coordenador apontou. **Parei com `git add -A`**: do commit
`967ec72` em diante eu listo os arquivos por nome e confiro `git status --short`
antes. O que estiver fora de `src/dominio/**`, `src/main.jsx`, `tests/dominio/**`,
`tests/fluxo/dados.test.js` — e, pelas quatro linhas acima, `fusao.test.js` e
`promocao.test.js` — fica de fora.

## 7 · A ceia — a migração 10 → 11

Chegou depois do resto desta frente: o dono respondeu **copo de leite com duas
colheres de Neston**. Eu tinha recusado inventá-la (§2 item 1), e a recusa
estava certa — `PLANO_BASE` tinha seis refeições e a nota do jantar dizia "Sem
ceia obrigatória".

Entra numa migração própria, **10 → 11**, e não na 9 → 10: a 10 já estava
gravada e migração não se reescreve (§3.5 do plano).

### 7.1 · O que entrou

| | onde |
|---|---|
| `neston` no catálogo | `src/dominio/nutricao/alimentos.ts:45` |
| a refeição `ceia` no `PLANO_BASE` | `src/dominio/nutricao/alimentos.ts:126` |
| a nota do jantar, que ficou falsa | `src/dominio/nutricao/alimentos.ts:114` |
| `CEIA_PLANO_11` e `migraPlano11` | `src/dominio/migracoes.ts:734` e `:746`, com `PLANO_ATUAL = 11` |
| ligada nas duas cadeias | `src/main.jsx:442` (boot) e `:3643` (importação) |
| fixture do plano 10 | `tests/dominio/fixtures/estado-plano-10.json` |

A ceia: `{ id: 'ceia', t: '21:30', n: 'Ceia', tag: 'ANTES DE DORMIR', quando:
'sempre', itens: [{ f: 'leite', q: 250 }, { f: 'neston', q: 12 }] }`.

> **RECONCILIADO em 06/10 · a porção era 30 g e passou a 12 g.** O dono pediu a
> conferência do rótulo, e ela derrubou a quantidade: **o rótulo declara 30 g em
> CINCO colheres de sopa**, logo duas colheres são **12 g**, não 30. O `q: 30`
> deste documento era a leitura errada da mesma fonte não conferida que deu os
> macros. Está corrigido no código (`bb17c43`), na cópia congelada da migração e
> na cópia do `PLANO_BASE` — e não virou migração 11 → 12 porque a branch nunca
> foi publicada e nenhum aparelho rodou o plano 11. **O teste das duas cópias
> congeladas pegou a divergência** quando só uma foi alterada, que é exatamente
> o que §7.6 escreveu que ele existe para fazer.

**O que é de onde, para ninguém confundir base com suposição:**

- **250 ml de leite** — é a porção que o próprio plano dele já usa, em `pos` e em
  `lanche`, as duas com `q: 250`. **Conferi** nas duas.
- ~~**30 g de Neston** — a porção que o rótulo chama de "2 colheres de sopa".~~
  **ERRADO, e corrigido em 06/10: são 12 g.** O rótulo declara 30 g em **cinco**
  colheres de sopa — 6 g por colher —, então duas colheres são 12 g. Eu li "30 g
  = 2 colheres" de uma fonte de segunda mão e não tinha como conferir: não achei
  fonte melhor dentro do repositório, porque nenhuma outra refeição tem convenção
  de colher (`aveia` 40 g, `pasta` 10 g, `leitepo` 10 g são quantidades, não
  colheres). **Continua verdade que ninguém pesou uma colher**: o 6 g por colher
  é o rótulo dividido por cinco, não medição de balança.
- **`t: '21:30'`** — **SUPOSTO pelo coordenador, não prescrito pelo dono.** Ele
  disse o que come, não a que horas. Está dito no comentário do código
  (`alimentos.ts:118-122`) e é trivial de trocar, porque o horário só decide a
  posição da linha na timeline, que `refeicoesDeHoje` ordena por relógio. **Não
  medido, não prescrito: suposto.**
- **`tag: 'ANTES DE DORMIR'`** — escolhida por mim na gramática das outras
  (`RÁPIDO E FUNCIONAL`, `REFEIÇÃO FORTE`, `PRATO PRINCIPAL`, `GRANDE
  REFEIÇÃO`, `INTRA-TREINO`). Palavra de superfície; a frente 3 é dona da voz.
- **A `nota`** também é minha, e descritiva de propósito: diz o que é e de onde
  vêm as duas quantidades. **Não inventei razão nutricional nenhuma** — nenhum
  profissional escreveu por que a ceia entrou.

**Os valores do Neston estavam marcados no código como PENDENTES DE CONFERÊNCIA
contra a embalagem**, com o motivo ao lado: ~397 kcal, ~9,5 g de proteína,
~78 g de carboidrato, ~4,5 g de gordura por 100 g. Vieram de segunda mão e
**ninguém leu o rótulo**. O que eu pude medir, e medi: os macros fechavam com o
kcal declarado dentro de **1,7%** (9,5×4 + 78×4 + 4,5×9 = 390,5 contra 397), que
é a folga normal de arredondamento e fibra num rótulo. **Consistência interna
não é conferência**, e o comentário no código dizia isso.

> **RECONCILIADO em 06/10 · conferido, e os quatro números estavam errados.**
> O dono pediu a conferência. Duas fontes que concordam — Open Food Facts pelo
> EAN 7891000098950 e a tabela do produto no varejo — dão, por 100 g: **373 kcal
> (não 397), 13 g de proteína (não 9,5), 70 g de carboidrato (não 78), 2,3 g de
> gordura (não 4,5)**, mais 9,67 g de fibra, que o catálogo não guarda. Os
> valores velhos vinham da memória de um agente.
> **E a consistência interna não teria achado isto:** os números errados
> fechavam dentro de 1,7%, e os certos também fecham (13×4 + 70×4 + 2,3×9 =
> 352,7 contra 373, dentro de 5,5% com a fibra fora da conta). Era por isso que
> a linha ficou marcada como pendente, e é a prova de que a marca valia.
> Está no código em `bb17c43` (`src/dominio/nutricao/alimentos.ts`).

Importa porque o alvo calórico é **calculado** do plano: valor errado aqui
contamina o alvo do dia e, por ele, o ledger do ajuste calórico — que audita
decisões de corte contra a ingestão da época.

**A nota do jantar.** Era *"Sem ceia obrigatória: o dia já fecha proteína e
energia com quatro refeições proteicas completas."* Ficou falsa. Reescrita para
*"Quatro refeições proteicas completas já fecham proteína e energia até aqui. A
ceia entrou depois e é acréscimo, não substituição: nada aqui foi reduzido para
ela caber."* — a razão nutricional que ela registrava continua lá, e a frase
nova é verificável: **não reduzi nada** em refeição nenhuma.

### 7.2 · O alvo calórico, medido

O coordenador pediu medido e não suposto. **Medido** com `totalDoDia` do próprio
domínio, sobre `ALIMENTOS_BASE`, e sob asserção em
`tests/dominio/migracoes.test.ts`, partindo da fixture do plano 10.

> **RECONCILIADO em 06/10 · o número é 197,26 e não 271,6.** Os dois erros do
> Neston — 397 kcal por 100 g em vez de 373, e 30 g de porção em vez de 12 —
> inflavam o delta em 74 kcal. O teste é a fonte e está verde: ele se chama hoje
> *"a ceia sobe o alvo do dia em 197,3 kcal — medido contra o rótulo"* e afirma
> `197,26 ± 0,05`, `3.204,36` no dia de treino e `3.041,36` no descanso. A tabela
> abaixo é a medição nova, e eu a refiz com `totalDoDia` sobre `PLANO_BASE` em
> 06/10, com e sem a ceia:

| dia | alvo antes | alvo depois | delta |
|---|---:|---:|---:|
| treino | 3.007,1 kcal | 3.204,36 kcal | **+197,26 (+6,56%)** |
| descanso | 2.844,1 kcal | 3.041,36 kcal | **+197,26 (+6,94%)** |
| treino + alta demanda | 3.102,1 kcal | 3.299,36 kcal | **+197,26 (+6,36%)** |

Os dois primeiros estão sob asserção no teste; **o terceiro não**, e é conta
medida por execução — a alta demanda acrescenta 95 kcal fixos ao dia de treino,
antes e depois.

A ceia sozinha: **197,26 kcal · 9,56 g P · 20,15 g C · 8,53 g G** — 152,5 do
leite (250 ml × 61 kcal/100 ml) e 44,76 do Neston (12 g × 373 kcal/100 g).
**A conta grosseira do coordenador (~272 kcal, 152 + 119) batia com os números
errados, e errava com os certos** — ela reproduzia a aritmética, não o rótulo.
Os valores que esta tabela dava antes eram: 271,6 kcal · 10,85 g P · 35,15 g C ·
9,6 g G, com +9,03% / +9,55% / +8,76%. **Ficam registrados para quem já tinha
lido o número velho em algum lugar.**

O 3.007,1 não é só cálculo: é o número **congelado na fixture**, em
`comidaHist[0].tot.kcal`, escrito pelo build do plano 10 num dia de treino com
as seis refeições marcadas. O alvo "antes" está gravado em disco, e **esse lado
da tabela não mudou**: o erro era todo do lado "depois".

**Este número é decisão dele e do nutricionista, não nossa.** O ledger do ajuste
calórico (`S.ajusteHist`) foi construído sobre o alvo antigo, e um salto de
~6,6% no alvo muda o que "seguir o plano" significa. **Não medi** nenhuma
consequência disso sobre as decisões de corte já tomadas — é leitura do
`trocasDeAjuste` que ninguém pediu.

#### 7.2.1 · O que o número revelou, e é o achado que mais vale desta parte

**RECONCILIAÇÃO (06/10).** Ao responder "o ledger do ajuste recalcula" (decisão
6 da noite de 06/10), o coordenador conferiu a forma do ledger e achou que não
havia nada a construir: `PassoDeAjuste` guarda `de` e `para` **em passos**, não
em kcal absoluto, e o alvo efetivo é o alvo do plano **mais** o saldo de passos.
O alvo novo entra embaixo dos passos existentes sem reescrever byte nenhum.

**Mas a consequência de verdade não é de código, e é esta:** a ceia é comida que
o dono **já comia** e que o plano **não contava**. A nota do jantar dizia,
textualmente, *"Sem ceia obrigatória"* (§2, item 1 deste documento, conferido).
Então o alvo **subestimava a ingestão real** em ~197 kcal, e **todos os cortes já
registrados em `S.ajusteHist` foram decididos contra um déficit ~197 kcal mais
raso do que se acreditava.**

**Não é bug: é o plano ficando honesto.** Quem lê isto como defeito de dado erra
duas vezes — o dado está certo, e o que mudou é o que o plano diz que ele come.
Levado ao dono em 06/10. **Ninguém mediu** quanto esse déficit mais raso muda
cada decisão de corte já tomada: isso é leitura dele com o nutricionista, e
continua não medida.

### 7.3 · Os portões

| portão | como |
|---|---|
| **tipo** | **nada a mudar, e conferi por quê:** a ceia usa só campos que `Refeicao` já tem e o Neston só campos de `Alimento`. Nenhum campo novo, nenhuma forma nova |
| **migração + fixture** | `migraPlano11` (`migracoes.ts:746`) e `estado-plano-10.json`, gerado pelo build do plano 10 em `ba03f95^` com o app em execução — mesma técnica da fixture do plano 9 |
| **fusão** | **nada a mudar, e isso é decisão:** o plano é documento, e documento não vira coleção por causa de uma refeição. Mas a janela entre aparelhos está sob teste — ver 7.5 |
| **listas brancas** | **nenhuma chave de topo nova.** `comida` já está na asserção da exportação e na lista branca da importação, e o objeto inteiro passa. A migração roda na importação também, e isso está sob asserção: um backup do plano 10 restaurado sai com a ceia |
| **`tsc --noEmit`** | limpo |
| **total congelado** | nada reescrito — ver 7.4 |

### 7.4 · O denominador, e o histórico intocado

O denominador da adesão **vai de 6 para 7**, pelo caminho que o §6 já provava:
`aderenciaDoDia` divide por `refeicoesDeHoje(plano de HOJE, …)`. Agora está
provado com a ceia de verdade e sobre o dia congelado da fixture
(`tests/dominio/migracoes.test.ts`, *"a ceia entra na conta do dia e muda o
denominador do histórico congelado"*): o mesmo dia passa de **6/6 para 6/7**, e
`tot.kcal` fica **idêntico**. **Nenhum byte do histórico foi reescrito.**

Em dia de treino são 7 refeições; em dia de descanso, 5 — `pre` e `treino` são
`quando: 'treino'`, e a ceia é `sempre`. **Conferi** executando
`refeicoesDeHoje`: `pos almoco lanche jantar ceia` no descanso. E a ceia das
21:30 **não é empurrada** por nenhum dos três turnos, inclusive o da noite, cuja
sessão acaba por volta das 19:30 — está nas três listas ordenadas de
`tests/dominio/turno.test.ts`.

**O que a forma do dado NÃO distingue, e eu não escolhi calado:** remover uma
refeição do plano a tira do array e **não deixa lápide**, então o dado não
separa "nunca teve ceia" de "tirou de propósito". O que impede a migração de
devolvê-la é o **portão de versão** — ela roda uma vez e nunca mais —, e isso
está sob teste nominal (*"10→11 roda uma vez só, e por isso respeita quem apagou
a ceia depois"*). **É garantia da versão, não da forma**, e a diferença importa
num caso: restaurar um backup tirado **antes** da migração reinsere a ceia,
porque aquele backup é do plano 10. Isso é o esperado de restaurar um backup
antigo — ele traz o plano antigo —, mas fica dito em vez de descoberto.

### 7.5 · A janela entre dois aparelhos, e por que ela se fecha sozinha

O plano é documento: vem inteiro do lado com `mtime` mais novo. Durante a
atualização, um aparelho ainda no plano 10 pode vencer o documento e o plano
voltar a não ter a ceia. **Conferi o que acontece, e tem saída:** `plano` — a
versão do formato — vem no **mesmo clone** que o documento, então o lado
atrasado leva a versão de volta a 10, e o boot seguinte roda `migraPlano11` e
devolve a ceia. Dois testes em `tests/dominio/sincronia.test.ts`.

E a marca da ceia já feita **não se perde** nessa janela: o dia e o histórico são
coleções e fundem por chave. `aderenciaDoDia` apenas ignora o id enquanto ele
não está no plano ("refeição que não existe mais") e volta a contá-lo depois.

### 7.6 · As duas cópias congeladas, e o teste que as amarra

`CEIA_PLANO_11` (na migração) e a ceia do `PLANO_BASE` são **duas cópias que não
se referenciam**, de propósito: migração lê o dado da época, nunca o código de
hoje — é a mesma disciplina de `NOME_POS_PLANO_7` e `REVISAO_B_PLANO_8`.

O risco disso é as duas populações nascerem diferentes: quem migrou recebe a
cópia da migração, quem instala agora recebe a da base. Então há um teste que
cobra que as duas descrevam a **mesma** ceia hoje — *"a ceia do aparelho migrado
é a MESMA do aparelho novo"* —, e a mensagem dele diz o que fazer se ficar
vermelho: **migração nova (11 → 12), não copiar o valor de um lado para o
outro.**

### 7.7 · O que não fiz, nesta parte

- **Não conferi os valores do Neston contra a embalagem.** Não tenho a lata.
  Ficaram marcados como pendentes, no código e aqui. É a única coisa desta
  entrega que depende de alguém olhar um objeto físico.
  **RESOLVIDO em 06/10:** conferido por pedido do dono, em duas fontes de rótulo
  que concordam, e **os quatro números estavam errados** (§7.1). A marca de
  pendente valeu.
- ~~**Não medi colher de sopa de Neston.** 30 g é a porção do rótulo, por
  transitividade da mesma fonte não conferida.~~ **E era 12 g, não 30** — o
  rótulo declara 30 g em cinco colheres. **Continua não medido:** ninguém pesou
  uma colher; o 6 g por colher é o rótulo dividido por cinco.
- **Não escolhi o horário da ceia** — o 21:30 é suposição do coordenador, e está
  marcada como tal nos dois lugares.
- **Não escrevi razão nutricional** na nota da ceia: ninguém prescreveu uma.
- **Não medi** o efeito do alvo novo sobre as decisões de corte já registradas em
  `S.ajusteHist`. **Continua não medido em 06/10**, e agora com o nome do que
  está em jogo: o déficit contra o qual cada corte foi decidido era ~197 kcal
  mais raso do que se acreditava (§7.2.1). O ledger não precisa de conserto — ele
  guarda passos, não kcal absoluto —, mas **a leitura dele contra o alvo novo
  ninguém fez.**
- **Não mexi em `S.comida.ocultos` nem em `S.comida.alimentos`.** Se ele tiver
  cadastrado um `neston` próprio, o dele vence em `catalogoAlimentos()`, e isso é
  o certo. **Não medi** nem posso saber se é o caso no aparelho dele.
- **Dezessete casos ficaram vermelhos uma vez**, todos afirmando "seis
  refeições" ou a lista ordenada delas — em dois arquivos de `tests/fluxo/` que
  não são meus e três de `tests/dominio/` que são. Adaptei as asserções e, onde
  dava, fiz com que derivassem do plano em vez de contar à mão, para não
  envelhecerem na próxima refeição. Ver §6, que tem a lista linha por linha.

## 8 · Os commits

| | |
|---|---|
| `fe369d7` | a fixture do plano 9, escrita pelo build do plano 9 |
| `b38d3e9` | a migração 9 → 10: o corpo aberto, o tipo, a fusão, as listas brancas |
| `f5808bc` | as sete medidas do corpo sob asserção na volta do backup |
| `65175fa` | o instante da marca, `como` e a água não contada atravessam |
| `2a634b5` | a aritmética da adesão sob as três regras do nutricionista |
| `79372e5` | `poeComidaNoDia` |
| `279c791` | o estado congelado do plano 9 entra pelo boot e sai migrado |
| `967ec72` | `promoPendente` vira coleção com chave natural, na mesma migração |
| `f346923` | esta entrega escrita |
| `ba03f95` | a ceia no plano, e a migração 10 → 11 |
| `df27e1b` | a migração 10 → 11 sob prova, com a fixture do plano 10 |
| `e76a963` | a janela da ceia entre dois aparelhos se fecha sozinha |

---

## 9 · Reconciliação com as decisões de 06/10

Este documento foi escrito em 05/10. As decisões do dono de **06/10** vieram
depois, e a autoridade sobre elas é a ONDA 5 de `docs/redesign/00-coordenacao.md`
— que **não** é editada aqui. Esta seção diz o que foi alinhado, contra qual
decisão, e o que não dá para alinhar sem alguém decidir.

### 9.1 · O que foi alinhado

| o que mudou aqui | contra qual decisão / medição | onde |
|---|---|---|
| **A porção da ceia: 30 g → 12 g de Neston** | o dono pediu a conferência do rótulo; o rótulo declara 30 g em **cinco** colheres de sopa | §7.1 |
| **Os macros do Neston: 373 kcal, 13 P, 70 C, 2,3 G por 100 g** (eram 397 / 9,5 / 78 / 4,5) | conferido em 06/10 contra o rótulo, duas fontes que concordam; os velhos vinham da memória de um agente | §7.1, §7.7 |
| **O delta do alvo: +271,6 → +197,26 kcal/dia**, e a tabela de antes/depois refeita | `tests/dominio/migracoes.test.ts`, verde e sob asserção (197,26 ± 0,05; 3.204,36 treino; 3.041,36 descanso) | §7.2 |
| **O percentual: ~9% → ~6,6%** | consequência aritmética do acima, medida por execução | §7.2 |
| **O achado novo: o plano não contava a ceia, e por isso o alvo subestimava a ingestão real** | decisão 6 da noite de 06/10 ("o ledger recalcula") e a leitura do coordenador em cima dela | §7.2.1 (seção nova) |
| **Os três valores de `como` são dado e não são tela** | medição do coordenador em 06/10: nenhum chamador de `marcaRefeicao` passa `como`, em valor nenhum — conferido nos dois chamadores | §3 (bloco no topo), §5 |
| **`'nsei'` existe desde 06/10, com peso 0 dentro do denominador, e sem migração** | decisão 2 do dono; a aritmética delegada ao coordenador e decidida por ele; implementado em `6e8a3fa` | §3 (bloco no topo) |
| **Os números de suíte deste arquivo são da data dele** | linha de base de 06/10 medida: 965 passando, 53 arquivos, 520 fluxo / 445 domínio, zero rejeições | "O estado da suíte" |

### 9.2 · O que esta reconciliação NÃO resolve

- **O efeito do alvo novo sobre cada corte já registrado em `S.ajusteHist`**
  continua **não medido**. O ledger não precisa de conserto (ele guarda passos,
  não kcal absoluto), mas ninguém releu as decisões de corte contra o alvo novo.
  É decisão do dono com o nutricionista.
- **Ninguém pesou uma colher de sopa de Neston.** Os 6 g por colher são o rótulo
  dividido por cinco.
- **O `t: '21:30'` da ceia continua suposição do coordenador**, não prescrição.
  Nada em 06/10 mexeu nisso.
- **O comentário de `src/dominio/nutricao/alimentos.ts` diz duas coisas de uma
  vez.** O bloco abre com *"ATENÇÃO · VALORES PENDENTES DE CONFERÊNCIA CONTRA A
  EMBALAGEM"* e, oito linhas abaixo, com *"CONFERIDO em 06/10 contra o rótulo"*.
  As duas afirmações convivem no mesmo comentário, e a primeira ficou falsa. **É
  conserto de uma linha em `src/`, e esta reconciliação não toca em `src/`** —
  fica apontado.
