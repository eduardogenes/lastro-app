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

Nenhuma linha deste arquivo tem estimativa de prazo. Onde não houve medição,
está escrito que não houve.

## Convenção de prova

- **conferi** — abri o arquivo e contei nesta sessão, com o caminho ao lado.
- **medido** — rodei e li o número de saída, com o comando ao lado.
- **não medido** — ninguém mediu, e eu não invento número.

## O estado da suíte

| | antes (`39d2fdb`) | depois (`HEAD`) |
|---|---:|---:|
| `tests/fluxo/` | 514 | 516 |
| `tests/dominio/` | 372 | 425 |
| total | 886 | 941 |
| *unhandled rejections* da suíte de fluxo | 4 | 4 |

**Medido** com `npm test` (que roda `vite build` no `pretest` — a suíte testa o
build, não o fonte). `npx tsc --noEmit` sai limpo. As quatro rejeições não
tratadas (`createElementNS` ×2, `addEventListener` ×2) são as mesmas de antes:
trabalho assíncrono chegando numa janela jsdom já fechada. Não mexi nelas.

Os 372 de domínio **não ficaram vermelhos em momento nenhum** — e os 53 novos
estão entre eles: `migracoes.test.ts` 27 → 41, `sincronia.test.ts` 36 → 51,
`diario.test.ts` 13 → 37. Em fluxo, `dados.test.js` 19 → 21.

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

1. **A ceia não existe no plano.** `PLANO_BASE`
   (`src/dominio/nutricao/alimentos.ts:96-101`) tem **seis** refeições — `pre`,
   `treino`, `pos`, `almoco`, `lanche`, `jantar` — e nenhuma ceia. A nota do
   jantar diz, literalmente: *"Sem ceia obrigatória: o dia já fecha proteína e
   energia com quatro refeições proteicas completas."* Então "a ceia conta na
   adesão" **não é mudança de código**: é o dono acrescentar a refeição ao plano
   (o app já tem `CTX.novaRefeicao`), e aí ela conta sozinha, inclusive para
   trás, porque o denominador é o plano. Deixei provado por teste e **não
   inventei a ceia**: ninguém prescreveu horário nem itens, e inventar a
   prescrição do nutricionista não é meu lugar. Ver §4.
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

**Quatro linhas, em dois arquivos de `tests/fluxo/`.** As duas migrações de forma
tornam isso inevitável: um teste que afirma a forma antiga de um campo
persistido fica vermelho quando a forma muda. Em cada caso mudei **só a
asserção de forma**, nunca o nome do teste nem o que ele protege.

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

**Conferi** com `grep` em toda a pasta que não havia outra linha afirmando as
formas antigas. Deixar a suíte vermelha para honrar a fronteira de arquivo
serviria à letra contra o propósito dela, que é não colidir com outro agente — e
a frente 1, que corre junto, só escreve em `docs/redesign/`. Fica registrado
aqui, com o diff descrito linha por linha, para o coordenador rever.

**O erro de staging, e o que mudou.** O commit `2a634b5` levou
`docs/redesign/09-frente1-lugares.md`, da frente 1, porque eu usei `git add -A`.
Nada se perdeu, e o coordenador apontou. **Parei com `git add -A`**: do commit
`967ec72` em diante eu listo os arquivos por nome e confiro `git status --short`
antes. O que estiver fora de `src/dominio/**`, `src/main.jsx`, `tests/dominio/**`,
`tests/fluxo/dados.test.js` — e, pelas quatro linhas acima, `fusao.test.js` e
`promocao.test.js` — fica de fora.

## 7 · Os commits

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
