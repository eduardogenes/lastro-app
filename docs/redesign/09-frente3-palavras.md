# 09 · Frente 3 — as palavras

Esta frente não desenha tela, não decide lugar e não escreve código. Ela escreve
**o texto exato** das superfícies que a voz nunca cobriu, e **o nome dos cinco
lugares**.

A régua é `04-voz.md`: oito regras de voz, cada uma com motivo e prova, escritas
por C4. Eu não as reabro. Onde uma palavra minha contraria uma delas, **eu digo
qual regra e por quê**, no lugar onde a palavra aparece — e não passo por cima
em silêncio. São três casos no documento inteiro, e estão em §11.5.

**Nenhuma linha deste arquivo tem estimativa de prazo ou de horas.** Ninguém
mediu isso. E nenhuma frase daqui foi lida por ele numa tela: o protótipo foi
tocado por três minutos, não usado por semanas.

---

## 0 · A convenção de prova, e o que eu abri

Três etiquetas, iguais às das outras quatro frentes:

- **conferi** — abri o arquivo nesta sessão e li a linha ou a função. O caminho
  fica ao lado, **por nome de função, constante, classe ou tipo**, porque as
  frentes 0, 1, 2 e 4 mexeram nesses arquivos e os números de linha andaram.
- **do desenho / da frente N / do plano** — repito um documento sem reconferir
  no código. Fica marcado.
- **não medido** — ninguém mediu, e eu não invento número.

**Da régua e das outras frentes**, abri inteiros: `docs/redesign/04-voz.md` (as
doze seções), `docs/redesign/09-frente1-lugares.md`,
`docs/redesign/09-frente2-interacao.md`, `docs/redesign/09-frente4-sistema.md`,
`docs/redesign/07-plano.md` (§1, §2, §3.4, §3.5, §4, §5) e o registro literal
das quinze respostas dele em `docs/redesign/00-coordenacao.md` (o bloco "AS
QUINZE RESPONDIDAS em 06/10", mais 5.a', 5.a'' e 5.a''').

**Do desenho**, abri o conteúdo renderizado de
`docs/redesign/03-direcao-D/momento-1.html` (estados 1 a 13),
`momento-2.html` (os 13), `semana.html` (os 7), `prescricao.html` (os 7),
`corpo.html` (os 8) e o fonte de `prototipo.html` — `folhaPorEmDia()`,
`folhaRefeicao()`, `menuSessao()`, `regua()`, `frase()`, `corrigeSerie()`,
`tabbar()`, e as regras `.tab`, `.tabbar`, `.rep`, `.cellb`.

**Do app que existe**, abri e li: `src/dominio/nutricao/tipos.ts` (inteiro),
`src/dominio/nutricao/calculo.ts` (`poeComidaNoDia`, `pesoDaRefeicao`,
`aderenciaDoDia`, `excessoDoDia`, `padraoPorRefeicao`, `diaInterpretavel`,
`diasInterpretaveis`), `src/dominio/corpo.ts` (`veredito`, `MIN_REGISTRADOS`,
`taxasSemanais`, `ALTO`, `BAIXO`, `ALVO_MIN`, `ALVO_MAX`, `MIN_PESAGENS`),
`src/dominio/tipos.ts` (`PromoPendente`, `ComoFoiARefeicao`, `DiaComida`,
`DiaComidaHist`, `promoPendente`), `src/dominio/migracoes.ts` (`PLANO_ATUAL`,
`migraPlano10`, `migraPlano11`), `src/dominio/formato.ts` (`fmtDec`, `fmtDec2`,
`fmtSig`, `fmtDur`), `src/ui/instrumento/tabbar.jsx` (inteiro),
`src/ui/instrumento/faixasessao.jsx` (inteiro),
`src/ui/instrumento/primitivos.jsx` (`Procedencia`),
`src/ui/folhas/refeicao.jsx` (`PORCOES`, `FolhaRefeicao`),
`src/ui/telas/decisao.jsx` (inteiro), `src/ui/telas/guia.jsx` (a seção
`deload`), `src/ui/telas/treino.jsx` (os controles da sessão), `src/base.css`
(os papéis tipográficos, `.ins-label`, `.ins-label-sm`, `.ins-provenance`), e de
`src/main.jsx`: `textoMod`, `MOTIVOS`, `impactoDoMod`, `finalizarSessao`,
`encerraDeVerdade`, `fechaSessao`, `delBody`, `setDeload`, `togglePulado`,
`CTX.faixaDaSessao`, `CTX.encerraSessaoEsquecida`, e os 23 `confirm()` do
arquivo.

**O que eu não abri**, e por isso não afirmo nada sobre: os seis arquivos de
CSS fora de `src/base.css`, `src/palco.js`, `src/sw.js`, `src/dominio/aula.ts`,
`src/dominio/protocolo.ts`, `src/dominio/enquadramento.ts`, e as telas
`camera.jsx`, `comparar.jsx`, `protocolo.jsx`, `ajustefoto.jsx`.

**Como eu conto o que cabe.** Uso o método de C4 — caracteres contra a largura
do contêiner calculada do CSS, viewport de 414 pt, 0,52 em de avanço médio na
fonte do sistema e 0,58 em no semibold —, e escrevo **conta** em toda linha onde
calculei em vez de medir. **Não rodei nada em aparelho.** Onde a conta fica a
menos de 10% da borda, escrevo "no limite", como ela.

**Uma régua minha, que vale para tudo abaixo.** Se uma frase precisa de
explicação para ser entendida, ela está errada. E nenhuma palavra deste
documento é metáfora: o dono recusou linguagem figurada neste projeto por
escrito, e "a lápis", "passar a caneta", "no escuro" e afins não aparecem aqui
nem como ilustração.

---

## 1 · O nome dos cinco lugares

Os cinco vêm do desenhista (`03-direcao-D/direcao-2.md` §2; conferi os cinco no
`tabbar()` de `prototipo.html`): **Agora · Dias · Corpo · Semana ·
Prescrição**. Dois deles C4 já tinha confirmado para esta direção e um ela
inventou (`04-voz.md` §3.3): Agora, Dias e Corpo. Semana e Prescrição não
passaram pela voz.

**A régua do nome de aba, e ela não é gosto.** Cinco rótulos numa fileira, lidos
de relance, no meio de uma série: cada nome tem de (a) ser substantivo, porque
verbo numa fileira de cinco faz ler todos os cinco; (b) dizer o que se possui, e
não o que se faz lá; (c) não repetir palavra que apareça **dentro** daquele
lugar como dado; (d) caber numa fatia de 82,8 pt no degrau de 125% do controle de
texto (§1.6); (e) não ter acento onde dê para evitar, porque acento com uma mão
suada não acontece (F64) e a busca do app ignora acento mas não corrige
digitação (F259, F287).

### 1.1 · Agora — confirmado, com uma correção

**Fica Agora.** C4 o manteve com V6 ("é a próxima coisa a fazer") e V7 manda que
eu não troque palavra que funciona. Três razões para confirmar e não reabrir:

1. **É o único dos cinco que responde uma pergunta, e é a pergunta certa.** A
   frente 1 escreveu a pergunta de cada lugar, e a deste é *"e agora?"*
   (`09-frente1-lugares.md` §1.1). Nenhum substantivo de tempo diz isso.
2. **"Hoje" prometeria outra tela.** `hoje` é o nome da primeira aba do app de
   hoje (`ABAS` em `src/ui/instrumento/tabbar.jsx`, conferi: `{ k: 'hoje', t:
   'hoje' }`), e aquela aba é o dia inteiro em ordem de relógio. O lugar novo
   lidera com a próxima coisa a fazer e põe o dia abaixo. Reusar "hoje"
   prometeria a tela antiga.
3. **"Hoje · Dias" lado a lado se confundem de relance.** São duas palavras de
   tempo, de 4 letras cada, em fatias vizinhas de uma fileira de cinco. "Agora ·
   Dias" separa.

**A correção, e ela é minha:** hoje a palavra "agora" faz **quatro** trabalhos
diferentes, e três deles estão na mesma tela.

| onde | o que diz hoje | prova |
|---|---|---|
| a aba | o lugar | `tabbar()`, `prototipo.html` |
| a sobrancelha do cartão de cima | "Agora · no plano às 16h00" | `momento-2.html`, estados 1 e 13 |
| a linha do relógio na espinha do dia | "agora 15:34" | `04-voz.md` §6, C · M2 · 1 |
| o botão da régua com o valor guardado | o `<small>` "agora", ao lado de "última" | `.rep.now`, `prototipo.html`; frente 2 §5.2 |

Os dois últimos são verdade e ficam: um marca o instante na linha do dia, o
outro marca o valor que acabou de entrar. **O que sai é a sobrancelha do
cartão** — ela repete o nome da aba em que já se está, que é o único dos quatro
que não acrescenta nada.

**A sobrancelha do cartão de cima passa a ser a procedência do que ele mostra**,
que é a informação que falta:

| o cartão é | a sobrancelha |
|---|---|
| a refeição do momento | **no plano às 16h00** |
| o treino do dia | **na prescrição · Treino B** |
| a sessão aberta | **sessão aberta desde 6h20** |
| a pesagem da manhã | **na prescrição · 3 a 4 por semana** |
| a sessão de fotos que fez 14 dias | **na rotina · a cada 14 dias** |
| a mudança do dia que vence hoje | **esperando decisão desde 28/09** |
| o dia de descanso fora de qualquer janela | **descanso, pelo padrão semanal** |

Isto segue §3.2 de `04-voz.md` à risca: a origem se nomeia, e "previsto" sozinho
fica recusado. E resolve de graça o que a frente 1 declarou sem desenho — o
Agora de um dia de descanso fora de qualquer janela (§5.1, regra 7 dela): a
sobrancelha dele é a única que não aponta para fora, porque o tipo do dia é
palpite do app (F187), e por isso ela usa a palavra do palpite.

### 1.2 · Dias — confirmado

**Fica Dias.** C4 o manteve. Quatro letras, sem acento, substantivo, e nomeia
exatamente o que o lugar possui: todo dia que não é hoje
(`09-frente1-lugares.md` §1.2).

**O plural é a forma certa aqui, e o singular de Semana também — a assimetria
tem motivo.** Chega-se a Dias por uma lista e escolhe-se um; chega-se a Semana
pela semana corrente, que é a única que pode produzir decisão, e as outras são
leitura (`veredito` em `src/dominio/corpo.ts` roda sobre as últimas semanas e
só a corrente recebe o passo; `S.ajuste` e `S.perfManual` são as duas únicas
escritas de Semana, `09-frente1-lugares.md` §1.4). Dias é plural porque o
destino é a lista; Semana é singular porque o destino é uma.

**Recusados:** "Diário" (é nome de documento, e o produto não é um diário: o dado
de um dia pode ser escrito semanas depois — F209, `S.comidaHist`) · "Histórico"
(cobre treino e comida, mas deixa fora pôr um dia em dia, que é escrita e não
leitura) · "Calendário" (é uma das vistas de dentro, não o lugar; e tem 11
letras).

### 1.3 · Corpo — confirmado

**Fica Corpo**, com a justificação de C4 inteira (`04-voz.md` §4.2): é a palavra
que a prescrição e os fatos já usam ("fotos do corpo", F226; "o corpo dele em
roupa justa", F236), tem cinco letras, não tem acento, e cobre as cinco coisas
que dividem o assunto. Ela já recusou "Progresso", "Evolução" como nome deste
lugar, "Medidas", "Espelho", "Composição corporal", "Antropometria" e "Minhas
medidas", com motivo em cada uma. Não acrescento nada e não reabro.

### 1.4 · Semana — confirmado, no singular

**Fica Semana.** C4 havia escrito **"Semanas"**, no plural, para a direção C
(`04-voz.md` §3.3: "Mantido: a semana da regra é de domingo a sábado, F211"). O
desenhista usou o singular. **Vale o singular, e a razão é de dado:** o lugar
possui o veredito e o passo, e os dois são sobre **uma** semana — `taxasSemanais`
devolve as duas últimas taxas e `veredito` decide sobre elas (conferi as duas em
`src/dominio/corpo.ts`); o passo de ±150 kcal se aplica uma vez e vira a nova
base (`S.ajuste`, `S.ajusteHist`). O plural fica onde ele é verdade: no destino
de dentro que lista as semanas, que `semana.html` já chama de **Semanas** no
botão do cabeçalho (conferi).

**Uma coisa que o nome não cobre, e eu digo em vez de esconder:** três leituras
deste lugar não são semanais — a retrospectiva do bloco
(`src/ui/telas/retrospectiva.jsx`), a força estimada, que é tendência de duas
semanas (`S.perfManual`; `tests/fluxo/ritmo.test.js`), e o **ciclo**, que a
frente 1 propôs trazer para cá sem ter lugar em desenho nenhum (achado 7 dela).
O nome fica porque a semana é a unidade que **produz decisão**; as três são
destinos de dentro, e cada uma se nomeia por conta própria:

| o que | como se chama dentro de Semana | por quê |
|---|---|---|
| a lista das semanas | **Semanas** | já é o rótulo do desenho; plural onde é plural |
| a retrospectiva do bloco | **O bloco** | é a palavra do treinador para o ciclo de sessões (`src/ui/telas/retrospectiva.jsx`); e é onde o ciclo da frente 1 aterra, porque "em que ponto do bloco eu estou" é a mesma pergunta |
| a força estimada | **Força** | é o rótulo do portão (`semana.html`: "Força: não está subindo"), e a palavra é a mesma nos dois lugares de propósito |

**Recusados:** "Revisão" (é o nome do ato, não do lugar; e "revisão" já significa
outra coisa no produto — a revisão do programa que chega do treinador com outro
nome, `tests/fluxo/trocaprograma.test.js`, `prescricao.html` estado 6) ·
"Regra" (é a regra do nutricionista, de quem o app não é dono — V1) · "Leitura"
(abstrato, e Semana escreve duas coisas) · "Evolução" (§1.7).

### 1.5 · Prescrição — confirmado, e é o nome que aperta

**Fica Prescrição.** C4 o manteve para as duas direções ("é exatamente o que vem
de fora", F1, F2), e **é a palavra do app de hoje**: conferi 53 ocorrências de
"prescrição", 21 de "prescrito" e 17 de "prescritas" em `src/`, em domínio e em
tela — `src/dominio/volume.ts`, `src/dominio/carga.ts`, `src/dominio/dia.ts`,
`src/ui/telas/treino.jsx`, `src/ui/instrumento/edicao.jsx`. Nunca como nome de
lugar; sempre como origem de um número.

**É o único nome dos cinco que é preciso defender contra duas alternativas
curtas, e as duas colidem com dado de dentro:**

- **"Plano"** (5 letras) colide com **"no plano"**, que é a procedência da
  comida em toda linha do dia (`04-voz.md` §3.2). "Plano" na aba e "no plano"
  na linha, na mesma tela, são duas coisas: o lugar e a origem.
- **"Programa"** (8 letras) colide com `S.prog` — o programa do treinador é
  **uma** das coisas que moram lá, ao lado do plano alimentar, do catálogo de
  exercícios, da cadência e da lista das mudanças que esperam
  (`09-frente1-lugares.md` §1.5). Nomear o lugar pela maior parte dele deixa o
  plano alimentar fora do nome.

"Prescrição" é a única palavra que cobre as duas prescrições — a do treinador e a
do nutricionista —, e é por isso que ela aguenta o acento e as dez letras.

### 1.6 · A conta do rodapé, e o nome que decide o limite

`.tabbar` é `grid-template-columns: repeat(5, 1fr)` sem recuo lateral
(conferi em `prototipo.html`), então numa viewport de 414 pt **a fatia é de
82,8 pt**. `.tab` é `font-size: 11.5px; font-weight: 600`, e a frente 4 o move
para `--ins-t-rotulo` (11 px, em `rem`, §3.2 e §4.2 dela).

**Conta**, a 0,58 em de avanço no semibold:

| nome | letras | 11 px (100%) | 12,38 px (112,5%) | 13,75 px (125%) |
|---|---:|---:|---:|---:|
| Dias | 4 | 25,5 pt | 28,7 pt | 31,9 pt |
| Agora | 5 | 31,9 pt | 35,9 pt | 39,9 pt |
| Corpo | 5 | 31,9 pt | 35,9 pt | 39,9 pt |
| Semana | 6 | 38,3 pt | 43,1 pt | 47,9 pt |
| **Prescrição** | **10** | **63,8 pt** | **71,8 pt** | **79,8 pt** |

**No degrau de cima do controle de texto, "Prescrição" ocupa 79,8 dos 82,8 pt da
fatia: no limite**, pela régua de C4 (menos de 10% da borda). Os outros quatro
sobram folgados. **Isto é conta, não medida** — avanço médio não é avanço real, e
o `font-weight: 600` da pilha do sistema varia de aparelho.

**E o custo de passar é pequeno, o que é o que permite manter o nome.** `.tab` é
`flex-direction: column` com ícone de 24 px e `gap: 2px`, dentro de
`min-height: 52px` (conferi as três). Uma linha de 13,75 px dá 39,8 pt de altura
— sobra. Duas linhas dão 53,5 pt e **estouram o mínimo em 1,5 pt**: a barra
cresce um fio e nada quebra. **A quebra em duas linhas é, portanto, a saída
aceitável**, e não há nome mais curto que diga a mesma coisa (§1.5).

**O que isto diz para a decisão 15, que ele adiou para depois da medição:** a
320 px a fatia cai para **64 pt**, e "Prescrição" a 11 px dá 63,8 pt —
**exatamente na borda, já em 100%**. A 125% ela quebra em duas linhas
obrigatoriamente. **O nome mais longo dos cinco é o que amarra a barra a 320
px**, e isso é fato de palavra, não de layout: quem medir a 320 px (medição G da
frente 4, protocolo de §8.4 da frente 2) tem de medir a barra de cinco com estes
cinco nomes, e não com rótulos de exemplo. **Não medido.**

### 1.7 · A palavra do dono que a partição apagou — e isto sobe à mesa dele

**"Evolução" desaparece do produto, e ela é palavra dele.** C4 a manteve como
nome de lugar na direção D com uma razão explícita, e é a única das dez decisões
de nome dela que se apoia só nisso (`04-voz.md` §3.3): *"Mantido **porque é a
palavra do dono**: 'quero registrar essa evolução' (P6), 'eu gosto de acompanhar
esse tipo de evolução' (P8). V7: a palavra dele vence a minha."*

**Conferi as duas falas em `docs/redesign/02-perguntas.md`**, e elas são
literais: *"eu também quero registrar essa, evolu- essa evolução"* (P6, no
mesmo trecho em que ele fala da fita e da bioimpedância) e *"eu gosto de
acompanhar esse tipo de coisa esse tipo de evolução"* (P8, no trecho em que ele
fala de rever como tem sido, dos comparativos de foto e do gráfico de pesos).

**E conferi que ela saiu.** Contei "Evolução" nos nove HTML da direção D: **11
ocorrências em `momento-2.html` e 1 em `momento-1.html`** — as duas telas da
primeira rodada, onde a barra tinha quatro lugares e um deles era Evolução — e
**zero** em `corpo.html`, `semana.html`, `prescricao.html`, `prototipo.html`,
`comparar.html`, `aula.html` e `sessao-fotos.html`, que são as da segunda
rodada. A partição de Evolução em Corpo e Semana
(`09-frente1-lugares.md` §1) é decisão do desenhista, é boa pelo motivo que ela
dá — o corpo deixou de ser leitura e passou a ser registro — e **apagou a
palavra dele junto.**

**O que eu proponho, e não é um sexto lugar:** a palavra volta como **nome do
destino de leitura dentro de Corpo**, no lugar de "Histórico".

| onde | era | passa a ser | por quê |
|---|---|---|---|
| botão do cabeçalho de Corpo | **Histórico** (conferi: `<button class="act" data-a="beco" disabled>Histórico</button>`, `prototipo.html`, render de Corpo) | **Evolução** | "histórico" é a lista do que foi registrado; "evolução" é a leitura ao longo do tempo, e é a leitura que mora ali: nove semanas de médias, os pontos do dia, a faixa do alvo (`corpo.html`, estado 8) e o par de fotos comparadas |
| título do destino | **Peso · 9 semanas · 31 pesagens** | **Evolução · 9 semanas · 31 pesagens** | o destino tem o peso **e** o par de fotos (F229, F230); "Peso" deixa a foto fora |

**Por que em Corpo e não em Semana.** As duas falas dele apontam para cá: a de
P6 é sobre registrar bioimpedância e medidas, que são de Corpo; a de P8 cita
"os comparativos dos antepassados com o atual" e "um gráficozinho legal dos
pesos", que são as duas peças deste destino. Semana é o veredito e o passo — é
decisão, não acompanhamento.

**Isto sobe à mesa dele** (§11.1), porque é a palavra dele e a troca é de uma
palavra dele por outra minha. Enquanto não houver resposta, **o escrito é
"Evolução"**, porque V7 é explícita: a palavra dele vence a minha.

### 1.8 · Os cinco, numa linha, com o rótulo acessível de cada um

O nome visível é curto porque a fatia é curta. **O nome acessível diz o mesmo e
mais a pergunta que o lugar responde**, que na tela é implícita — é a obrigação 1
de `04-voz.md` §9.

| aba | nome visível | nome acessível |
|---|---|---|
| 1 | **Agora** | "Agora. O que fazer agora, e o dia de hoje." |
| 2 | **Dias** | "Dias. Qualquer outro dia, e o que falta dizer deles." |
| 3 | **Corpo** | "Corpo. Peso, medidas, bioimpedância e fotos." |
| 4 | **Semana** | "Semana. A regra do nutricionista e o que a semana andou." |
| 5 | **Prescrição** | "Prescrição. O programa do treinador, o plano do nutricionista, e as mudanças esperando decisão." |

**Com contagem, quando houver:** a aba que tem pendência diz o número no nome
acessível, nunca um ponto sem palavra — "Prescrição, 3 esperando decisão". É o
que `prescricao.html` já escreve no cabeçalho ("qui 01/10 · 3 esperando
decisão", conferi) subindo para o rótulo da aba, porque a forma — um ponto de
status — não se ouve (`04-voz.md` §9).

**Nunca:** emoji, "seção", "página", "aba" dentro do nome acessível, nem o
número sem a palavra que ele conta.
