# 09 · Frente 3 — as palavras

Esta frente não desenha tela, não decide lugar e não escreve código. Ela escreve
**o texto exato** das superfícies que a voz nunca cobriu, e **o nome dos cinco
lugares**.

A régua é `04-voz.md`: oito regras de voz, cada uma com motivo e prova, escritas
por C4. Eu não as reabro. Onde uma palavra minha contraria uma delas, **eu digo
qual regra e por quê**, no lugar onde a palavra aparece — e não passo por cima
em silêncio. São **quatro** casos no documento inteiro, e eles estão reunidos em
§12.3.

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
documento é metáfora — "a lápis", "a tinta", "hachura", "visto", "passar a
caneta" não aparecem aqui nem como ilustração.

**A prova disso, e ela é mais fraca do que me foi dito.** Eu procurei uma recusa
literal de linguagem figurada pelo dono e **não achei**. O que o registro tem é
isto, em `00-coordenacao.md`, na linha de 02/10: *"Peça visual de comparação
feita para o dono (artefato publicado, em linguagem direta: o vocabulário dos
designers — lápis, tinta, hachura, visto — foi traduzido para o que acontece na
tela, **a pedido dele**)."* **Ele pediu a tradução, não escreveu a recusa.** A
régua é a mesma na prática, e eu a sigo; mas ela é um pedido registrado, não uma
proibição dele, e a diferença fica escrita (§13, item 6).

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

---

## 2 · O que substitui o rótulo em monoespaçada (decisão 12)

A decisão 12 derruba três inegociáveis, e a nota literal dele é **"sem
herancas"** — caem limpos. Dois são de forma e são da frente 4: o raio zero e o
par mono/display. **O terceiro é meu**, porque o que cai com ele é um canal de
leitura: *"rótulo mono em caixa alta é estrutura, nunca ênfase"* (inegociável 5,
`src/tokens.css`, pela frente 4 §2.2).

**O que o rótulo mono fazia, medido.** Conferi em `src/base.css`: `.ins-label` é
`font: 400 10px/1 var(--ins-font-mono); letter-spacing: .18em; text-transform:
uppercase; color: var(--ins-text-4)`, e `.ins-label-sm` é a mesma coisa a 9 px
com `.16em`. Contei no `src/ui/`: **76 ocorrências de `.ins-label` e 7 de
`.ins-label-sm`**, em 21 arquivos — 50 delas chegando por uma propriedade
`rotulo` ou `olho`.

**E ele fazia três trabalhos, não um.** Classifiquei lendo os lugares de
chamada, um por um — **não contei cada ocorrência para dentro de um dos três
baldes**, então os três são qualitativos:

| trabalho | exemplos que eu li | o que ele realmente diz |
|---|---|---|
| **o olho** — a linha acima do título de uma folha ou de uma tela cheia | `olho="pose 3 de 9"`, `olho="registrar treino passado"`, `olho="da prescrição"`, `olho="o aparelho"`, `olho="hoje é"` (`src/ui/instrumento/folha.jsx`, `telacheia.jsx`, `src/ui/telas/protocolo.jsx`, `retroativo.jsx`, `src/ui/folhas/editores.jsx`) | **procedência ou posição**, não estrutura: de onde vem, ou onde estou na série |
| **o rótulo de seção** | `"o que tem dentro"`, `"porção · só de hoje"`, `"turno do treino"`, `"como foi o dia"`, `"motivo (opcional)"`, `"por 100 g"` (`src/ui/folhas/refeicao.jsx`, `editores.jsx`, `src/ui/telas/decisao.jsx`) | **estrutura**: o que o bloco abaixo possui |
| **o rótulo de célula de número** | as células de `GradeMetricas` (`kcal`, `proteína`, `carboidrato`, `gordura`) e o de `HeroMetrica` (`src/ui/instrumento/primitivos.jsx`, conferi as duas) | **a unidade ou o nome do número**, que é conteúdo |

**Uma forma para três trabalhos funcionava porque a forma era forte.** Sem ela,
os três se misturam: "kcal" em caixa baixa, 10 px, ao lado de "o que tem
dentro" em caixa baixa, 10 px, são duas coisas que não se distinguem.

### 2.1 · A decisão: menos rótulos, cada um maior, e a palavra diz qual é qual

**A regra inteira em uma frase:** perdido o canal da forma da letra, a hierarquia
passa a ser carregada por **o que a palavra é** (unidade, procedência ou nome de
seção) e por **tamanho**, e isso só fecha se o número de rótulos cair — porque
rótulo maior ocupa mais lugar.

**R1 · O rótulo de seção só existe quando a seção tem mais de uma linha e a
primeira não a nomeia.** Onde ele repetiria a primeira linha, sai. Exemplos do
app de hoje:

| hoje | passa a ser | por quê |
|---|---|---|
| rótulo **"peso"** acima de "Peso de hoje · 73,8 · última: 73,4 em 29/09" | **sai** | a primeira linha já diz "Peso" |
| rótulo **"deload"** acima de "Modo deload · Mostra metade das séries…" (`src/ui/telas/guia.jsx`, conferi) | **sai** | idem |
| rótulo **"o que tem dentro"** acima da lista de itens de uma refeição | **fica** | as linhas são "leite 250 ml", "banana 120 g": nenhuma nomeia a lista |
| rótulo **"como foi o dia"** acima dos três estados | **fica** | as linhas são as três respostas; sem o rótulo, são três botões sem pergunta |
| rótulo **"motivo (opcional)"** acima dos chips | **fica** | idem |

**R2 · O que fica muda de forma, e fica maior.** O rótulo de seção passa para
`--ins-t-corpo-forte` (15 px, em `rem`), peso 600, **caixa de frase**, sem
`letter-spacing` extra, na tinta de leitura — e **não** em caixa alta: caixa alta
com tracking é o rótulo mono sem a mono, e a decisão dele é "sem herancas".

**E ele é frase nominal com artigo**, que é o que distingue estrutura de
conteúdo sem depender de forma: nenhuma linha de conteúdo deste app começa com
artigo isolado. "O que tem dentro", "A porção de hoje", "O turno do treino",
"Como foi o dia", "O motivo". Conteúdo é "Peso de hoje · 73,8", "Almoço · sem
marca" — nome e valor.

**O custo, declarado:** o rótulo sai de 10 px e vai a 15, e fica **maior do que a
prosa de apoio que ele introduz** (13 px) e maior do que a procedência (12 px).
Isso é proposital — um rótulo que organiza tem de ser pelo menos tão forte
quanto o que ele organiza, e com a forma fora, só o tamanho restou para dizer
isso. **O preço é altura de tela, e é por isso que R1 vem primeiro.** Quantas
linhas isso acrescenta a cada tela: **ninguém mediu, e é conta de layout, não de
palavra.**

**R3 · O olho deixa de ser rótulo e vira procedência, com a primitiva que já
existe.** Os cinco exemplos que eu li — "pose 3 de 9", "da prescrição", "o
aparelho", "registrar treino passado", "hoje é" — respondem "de onde veio isto"
ou "onde eu estou na série", e a frente 4 já decidiu que *se a frase responde "de
onde veio este número?", é `Procedencia`* (§7.3 dela, requisito 11). **Então o
olho é `Procedencia`:** 12 px, tinta-3, caixa de frase, uma forma só em todo
lugar. Um a mais do que a frente 4 previu, e sem token novo.

**Uma exceção, e é uma só:** `olho="pose 3 de 9"` e `olho={'pose ' + d.indice +
' de ' + d.total}` são lidos **a três metros** na sessão de fotos (C7; e se ele
lê a tela a essa distância **não foi medido** — `04-voz.md` §12, item 6). A 12 px
não se lê a três metros. **Ali o olho vira título**, na escada própria da foto
(`--ins-n-foto-1`, 32 px, frente 4 §3.2), e o nome da pose vem com ele:
**"Pose 3 de 9 · perfil direito"**.

**R4 · O rótulo de célula de número passa a ser a unidade escrita como ela se
escreve.** "kcal", "kg", "cm", "l", "g", "%" são unidades, e unidade não tem
caixa alta. `KCAL` era a mono fazendo trabalho de estrutura em cima de uma
unidade. **Passa a:** `--ins-t-meta` (12 px), caixa baixa, tinta-3, junto do
número — a mesma forma da procedência, porque é a mesma espécie de coisa: diz o
que o número é.

| hoje | passa a ser |
|---|---|
| `KCAL` · `3.007` | `3.007` **kcal** |
| `PROTEÍNA` · `186` | `186 g` de **proteína** |
| `CINTURA` · `81,0` | `81,0` **cm** |

**E o nome por extenso onde a unidade é ambígua:** "l" minúsculo ao lado de um
número é o pior caractere da tipografia do sistema. Na bioimpedância, a água
corporal total escreve **"litros"**, não "l" (§10).

### 2.2 · O que isto NÃO entrega, dito com todas as letras

**O canal que cai não é substituído por um igual.** A forma da letra era um
canal que funcionava **sem leitura** — dava para saber que aquilo era estrutura
sem ler a palavra, de relance, de pé. Tamanho e artigo exigem **ler**. Na zona do
polegar, entre duas séries, isso é pior, e V6 é explícita: ali o orçamento é um
relance.

**A resposta, e ela é a única honesta:** na zona do polegar **não há rótulo de
seção nenhum**, nem antes nem depois desta mudança. V6 já mandava isso ("nada
passa de uma linha e de três palavras; prosa fica acima, onde ler é opcional"), e
conferi que os rótulos que eu li vivem em folha, em editor e em tela cheia — não
na régua, não no descanso, não nos botões de declarar. **A perda de canal cai
onde ler é opcional, e não onde ler é caro.** É por isso que eu aceito a decisão
dele sem ressalva, enquanto a frente 4 a aceitou com ressalva.

**O que ninguém mediu:** se 15 px em caixa de frase se distingue de 14 px de
prosa a um braço de distância, na luz da academia. A frente 4 mediu contraste
contra vidro limpo em quarto neutro, e declarou que a luz da academia, o sol, a
luva e o magnésio não estão em `01-fatos.md`. **A mesma ausência vale para
tamanho.**

---

## 3 · "Falhou" contra "vai destruir" — as duas famílias de frase (decisão 13)

Esta é a seção mais importante deste documento, e é por uma razão de uma linha:
**o aviso mais forte do produto deixa de ser dito pela cor.**

**O que mudou.** O inegociável 4 dizia *"Coral = destrói dado"*
(`src/tokens.css`, pela frente 4 §2.4). A decisão 13 troca o significado do
terceiro sinal de "destrói dado" para **"pare"**, e a frente 4 escreveu a
consequência: as duas situações que param o dedo — **a gravação que falhou** e
**a ação que vai destruir** — passam a usar o mesmo painel, com a mesma moldura
(`--ins-pare-fundo`, `--ins-pare-tinta`, `--ins-pare-fio`), e **o que as
distingue é a palavra**. Ela declarou o custo: *"quem olhar só a cor não sabe se
falhou ou se vai destruir."*

**Então a palavra tem de fazer um trabalho que ela nunca fez sozinha.** Não
basta as duas frases serem diferentes: elas têm de ser **inconfundíveis de
relance**, e de relance ninguém lê a frase inteira — lê-se o começo e o botão.

### 3.1 · As quatro diferenças, e as quatro são audíveis

As duas situações já diferem em quatro coisas no **dado**, e a gramática das duas
famílias não inventa nada: ela expõe as quatro.

| | **falhou** | **vai destruir** |
|---|---|---|
| **quando** | já aconteceu | ainda não aconteceu |
| **de quem foi** | do app, ou do armazenamento | dele: foi um toque que pediu |
| **o que já se perdeu** | **nada ainda** — o valor está na tela | **nada ainda** — e é o toque seguinte que apaga |
| **a saída** | tentar outra vez a mesma coisa | não tocar |

Daí as quatro regras de gramática:

**G1 · Tempo verbal.** A família do falhou abre em **passado**, com verbo negado.
A família do destruir abre em **infinitivo**, com o verbo do estrago.

> **Não guardei a série 2.** · **Apagar este treino tira as 14 séries
> registradas nele.**

**G2 · Sujeito.** No falhou, o sujeito é o app ou o armazenamento. No destruir,
o sujeito é **a ação** — nunca ele. É V8 pelos dois lados, e V5 pelos dois: o
sujeito de uma frase de falha nunca é ele, e o sujeito de uma frase de estrago
também não, porque "você vai apagar" é acusação antes do ato.

**G3 · A primeira palavra, que é a única que se lê de relance.** A família do
falhou começa pelo verbo negado: **"Não guardei…"**, **"Não consegui…"**, **"O
armazenamento recusou…"**. A família do destruir começa pelo infinitivo:
**"Apagar…"**, **"Remover…"**, **"Descartar…"**, **"Substituir…"**. Um "não" na
frente contra um infinitivo na frente é distinção de uma palavra, e é a que
sobrevive ao relance.

**G4 · O botão, que é a segunda coisa que se lê.** No falhou, o botão principal
é **"Tentar de novo"** — repetir a mesma intenção — e há dispensa. No destruir, o
botão principal é **o verbo com o objeto por extenso**, e a saída é
**"Deixar como está"**.

> **Nunca, em nenhuma das duas famílias:** "OK" · "Confirmar" · "Sim" · "Tem
> certeza?" · "Atenção!" · "Erro inesperado" · "Ops" · um botão cujo rótulo não
> diga o que acontece ao tocar nele.

**Isto toca uma recusa de V4, e eu digo qual.** V4 recusa *"Esta ação não pode
ser desfeita."* O app de hoje escreve **"Isso não tem volta"** em quatro
`confirm()` (conferi: `apagarSessao`, o de apagar o registro de treino, `wipe()`
e o de apagar uma pose). Pela letra de V4, essa frase estaria recusada. **Ela
fica, e a razão é a decisão 13.** V4 recusa a frase **sozinha** — um diálogo que
afirma irreversibilidade e não diz o que custa. No app ela nunca aparece
sozinha: vem com o estrago em número ao lado. E agora que a cor deixou de dizer
"destrói dado", **essa frase passa de redundância a canal**: é ela que, em
palavra, diz o que o coral dizia. Quem tirá-la por causa de V4 tira o canal que
substituiu a cor.

### 3.2 · A família "falhou", escrita

A moldura tem quatro partes, e são as quatro que a frente 2 exige de todo estado
ruim (§7.1 dela); aqui elas ganham texto.

| parte | o que está escrito | por quê |
|---|---|---|
| 1 · o que aconteceu | **Não guardei a série 2.** | V8: o agente é o app (F296, F294) |
| 2 · a causa, em palavra | **O armazenamento deste aparelho recusou a gravação.** / **O Safari em modo privado recusa guardar.** | F53, F55. Nunca "erro inesperado" (§3.4 de `04-voz.md`) |
| 3 · o que **não** aconteceu | **Nada foi apagado e nada saiu do aparelho. O valor continua aqui, 45 × 10, enquanto o app estiver aberto.** | A melhor frase do desenho (`momento-1.html`, estado 10), e ela diz **até quando** |
| 4 · o que fazer | **Tentar de novo** · **Copiar o registro inteiro** | O estado é regravado inteiro a cada série (F256), então a cópia não perde nada (F249) |
| 5 · como sair sem fazer nada | **Fechar este aviso** | Frente 2 §7.2: o painel é dispensável, **e dispensar não apaga a marca de "não guardada"** — ela fica na faixa e na célula, porque é o estado do dado |

**A marca que fica na linha do dado**, e ela é palavra e não só cor
(V2): **não guardada**. Na faixa da sessão: **série 10 de 20 · não guardada**. Na
célula da tabela: **45 × 10 · não guardada**.

**As seis variantes, com o texto exato de cada uma:**

| o que falhou | o que está escrito |
|---|---|
| uma série | **Não guardei a série 2.** + causa + **Nada foi apagado. 45 × 10 continua aqui enquanto o app estiver aberto.** |
| uma refeição | **Não guardei o lanche.** + causa + **A contagem dos 14 dias não se mexeu.** |
| um dia posto em dia | **Não guardei a segunda.** + causa + **O que a segunda já tinha continua como estava.** |
| o peso | **Não guardei o peso de hoje.** + causa + **A média da semana não se mexeu.** |
| a foto | **Não consegui buscar esta foto.** + **Ela está na cópia remota, e o aparelho não alcançou.** + **Tentar de novo** |
| a abertura do app | **O registro deste aparelho não abriu.** + **Esperei 4 s. Nada foi apagado e nada saiu do aparelho. A rede não é a causa: o registro mora aqui.** |

**O que cada uma acrescenta que a tela sozinha não diria:** a tela mostra o
número na linha. Ela não diz que o número **não está no disco**, não diz
**até quando** ele continua existindo, e não diz **o que não se mexeu** — e a
terceira é a que impede o dono de supor que a conta da regra do nutricionista já
mudou (V2, V4).

### 3.3 · A família "vai destruir", escrita

**Primeiro: a família é menor do que parece, e isso importa.** Conferi os 23
`confirm()` de `src/main.jsx`. **Nove destroem dado que o aparelho não reconstrói
e, com lápide, a sincronia não ressuscita** — essas são "pare". As outras
**catorze** mexem em prescrição, em catálogo ou em conta, e o registro fica: elas
**não** são "pare", e pintá-las de "pare" treina o dono a ignorar o painel.

**As nove que são "pare":**

| ação | o que está escrito antes do toque | o botão |
|---|---|---|
| apagar o registro de um treino | **Apagar este treino tira as 14 séries registradas nele. Isso não tem volta, e vale para os outros aparelhos.** | **Apagar o treino e as 14 séries** |
| apagar uma série do histórico de um exercício | **Apagar esta série tira 45 × 10 de 21/09 do histórico do Pulldown unilateral. Isso não tem volta.** | **Apagar a série de 21/09** |
| descartar a sessão sem série registrada | **Descartar esta sessão apaga o horário de início e a duração. Nenhuma série foi registrada nela, então não há série para perder.** | **Descartar a sessão** |
| remover um exercício que já tem série hoje | **Tirar este exercício agora apaga as 2 séries que você registrou nele hoje. O histórico das outras sessões fica.** | **Tirar e apagar as 2 séries** |
| apagar uma medida de peso ou cintura | **Apagar o peso de 28/09 (73,8 kg) tira ele da média da semana e do ritmo. As outras medidas ficam.** | **Apagar o peso de 28/09** |
| remover um registro de cardio | **Apagar 30 min de corrida de 25/09 tira ele do placar da semana. Isso não tem volta.** | **Apagar o cardio de 25/09** |
| apagar uma foto do aparelho | **Apagar esta foto tira o perfil direito de 01/10 deste aparelho. Se houver cópia remota, ela continua lá.** | **Apagar a foto deste aparelho** |
| apagar uma pose do protocolo | **Apagar o perfil direito tira a foto de 01/10 e o par que a comparação usa. Isso não tem volta.** | **Apagar o perfil direito** |
| apagar todo o histórico | **Apagar todo o histórico tira 48 sessões, 22 dias de comida, 31 pesagens e 36 fotos deste aparelho. Isso não tem volta, e vale para os outros aparelhos.** | **Apagar todo o histórico** |

**E a saída das nove é a mesma, e é esta:** **Deixar como está.** Nunca
"Cancelar" — "cancelar" é a palavra de abandonar um formulário, e aqui não há
formulário: há um dado que continua existindo se ele não tocar.

**As catorze que NÃO são "pare", e o que elas são:**

| ação | por que não é "pare" | o que está escrito |
|---|---|---|
| tirar um exercício do treino | o histórico do exercício continua guardado (conferi a frase no `confirm()`) | **Tirar Pulldown unilateral do Treino A. O histórico do exercício continua guardado.** |
| apagar um treino que saiu do programa do treinador | é prescrição, não registro | **Apagar o Treino F do seu programa. As sessões já registradas com ele não mudam.** |
| desfazer N mudanças no treino | volta ao programa do treinador | **Desfazer 3 mudanças no Treino A: ele volta ao que o treinador prescreveu.** |
| apagar um modelo de aula | o registro das aulas fica | **Apagar o modelo "HYROX". As sessões já registradas com ele não mudam.** |
| restaurar o plano do nutricionista | o histórico fica | **Restaurar o plano do nutricionista. Seus alimentos cadastrados e todo o histórico ficam; volta só a prescrição.** |
| remover uma refeição do plano | vale para todo dia, para a frente | **Remover a ceia do plano. Isso vale para todo dia. O histórico do que você já marcou não muda.** |
| tirar um item de uma refeição | idem | **Tirar a geleia light do lanche. Isso vale para todo dia.** |
| remover um alimento da biblioteca | idem | **Remover "geleia light" da biblioteca.** |
| sair da conta | **nada é apagado** | **Sair da conta neste aparelho. O histórico continua aqui; só para de sincronizar.** |
| importar uma cópia de segurança | substitui, e o aviso diz o que havia | **Importar 48 sessões e 36 exercícios substitui o histórico atual, de 22 sessões.** + **Exporte antes se tiver dúvida.** |

(As quatro restantes são variações destas, sobre catálogo e sobre renome; não
escrevo texto novo para elas, e nenhuma é "pare".)

**A razão de separar, dita de uma vez:** se "pare" aparecer nas 23, ele vê o
painel forte duas vezes por semana por coisa que não apaga nada, e na vez em que
ele apaga 48 sessões o painel não diz mais nada. **Nove é o número que mantém o
painel significando.** E a conta é minha, por leitura dos 23 `confirm()`: ninguém
havia classificado isso.

### 3.4 · A regra de uma linha, para quem escrever a próxima

> **Se o toque seguinte apaga dado que o aparelho não reconstrói, a frase começa
> com o infinitivo do estrago, diz o número do que vai embora, e o botão repete o
> verbo com o objeto. Se já falhou, a frase começa com "Não" e um verbo no
> passado, diz o que não se mexeu, e o botão é "Tentar de novo". Nada mais usa o
> painel de "pare".**

E o caso que falta, e ele é de palavra e não de cor: **nenhum painel de "pare"
tem botão cujo rótulo seja "OK", "Confirmar", "Sim" ou "Cancelar".** É asserção
de fonte, de uma linha, e é a única que impede as duas famílias de voltarem a se
parecer.

---

## 4 · A folha de pôr o dia em dia

A frente 2 desenhou a folha e levou cinco mudanças de regra à mesa dele (§4.7
dela). **Ele respondeu as cinco em 06/10, e uma delas contraria o que a frente 2
havia especificado.** As palavras abaixo são do comportamento que ele decidiu, não
do que estava escrito.

**O que a folha mostra, de cima para baixo**, com o texto exato:

| onde | o que está escrito | o que isto diz que a tela sozinha não diria |
|---|---|---|
| título (`h1`, recebe foco) | **Segunda, 05/10** | A data é o título porque é o que distingue esta folha de todas as outras aberturas dela (frente 2 §4.2) |
| procedência, logo abaixo | **Contado contra o plano de hoje · descanso, 5 refeições** | `poeComidaNoDia` recalcula o dia contra o plano de HOJE e grava `pv` justamente para a tela poder dizer isto (frente 2 §4.1, limite 1). Sem esta linha, pôr em dia uma terça de antes da ceia entrar é um dia recontado contra um plano que não era o daquele dia, **e nada na tela diria** |
| instrução | **Nada aqui está registrado até você tocar.** | Decisão 5 (§4.1) |
| uma linha por refeição | nome · procedência · cinco botões | §4.2 |
| a água, separada | **Água** · **Não contei** / **Contar copos** | "não contei" é fato e não ausência (`aguaNaoContada?: 1` em `src/dominio/nutricao/tipos.ts`, com a razão escrita no comentário: "`agua: 0` é ambíguo") |
| a pergunta do fora do plano, **depois da gravação** | §4.4 | Decisão 4 |
| a frase de leitura de volta, em região viva | §4.3 | A melhor coisa do protótipo (`frase()` e o nó com `aria-live="polite"`, conferi) |
| o pé | **O primeiro toque guarda o dia inteiro como está aqui, com a linha que você tocou já corrigida.** | V4: a consequência antes do toque. É a consequência precisa de "um toque em qualquer linha fecha o dia" com a gravação a cada toque (frente 2 §4.3), e sem ela o dono não tem como saber que tocou sete refeições |
| nunca | "Cancelar" · "Guardar" · "Responda a pergunta para guardar" | Não existe lote (frente 2 §3 e §4.5): um cancelar que não cancela é falso, e o botão de guardar está proibido |

### 4.1 · Decisão 5 · A última refeição continua vindo pré-marcada

**Isto contraria a frente 2**, que havia escrito o requisito oposto: *"a última
refeição do dia nunca entra pré-marcada por passagem de horário"* (§4.4, item 2
dela). A decisão dele manda, e muda as palavras: a pré-marcação passa a ser
**sugestão declarada**, e o texto tem de dizer de onde ela vem.

**A frase que a decisão obriga, e ela é a mais importante da folha:**

> **Nada aqui está registrado até você tocar. A ceia vem marcada porque passou
> das 21h30, não porque o app sabe.**

**Por que esta frase e não outra.** O que torna a ceia o caso perigoso é que o
limite é a hora **do plano**, não a de agora: `m.h > agora` compara o horário do
plano com o relógio (conferi em `folhaPorEmDia`), e a ceia é 21:30
(`src/dominio/nutricao/alimentos.ts`, conferi). Entre 21:30 e a virada da data,
a ceia deixa de ser "por vir" e vem marcada como comida. A frase nomeia **a
causa da marca** — a passagem do horário — em vez de nomear a marca. Nomear a
causa é o que impede de ler a sugestão como conhecimento.

**E a procedência de cada linha diz a mesma coisa, linha por linha**, porque uma
frase no alto não sobrevive à rolagem:

| estado da linha | a segunda linha dela |
|---|---|
| ainda não aconteceu | **por vir · 21h30** (a palavra do protótipo, conferi, e está certa) |
| pré-marcada porque a hora passou | **marcada pelo horário · 12h30** |
| declarada na hora | **na hora · 13h02** (a palavra do protótipo) |
| declarada depois, de memória | **de memória · marcado em 06/10, 13h42** |
| sem marca | **no plano · 12h30** |

**"marcada pelo horário" é a palavra nova, e é ela que paga a decisão 5.** Ela
não aparece em desenho nenhum: o protótipo distingue sugestão de declaração só
por classe de CSS (`pv` contra `me`, conferi), e a frente 2 exigiu que a
distinção não fosse só de cor. **Esta é a palavra.**

### 4.2 · Decisão 1 e decisão 3 · Os cinco botões, e o que cabe neles

**Decisão 1: entra o quinto botão, "Não comi".** O protótipo tem quatro
(`Tudo · Metade · Fora · Não sei`, conferi em `folhaPorEmDia`), e `'nao'` é um
valor real do domínio — `ComoFoiARefeicao = 'fora' | 'nao'`, com a razão escrita
no tipo: *"`'nao'` é 'não comi esta refeição', e é diferente de não ter marcado
nada: um é fato declarado, o outro é silêncio"* (conferi
`src/dominio/nutricao/tipos.ts`). E `pesoDaRefeicao` devolve 0 para ele, de
propósito: é zero conhecido.

**Os cinco botões completam uma frase só, e a frase é na voz dele (V8):**

| botão | a frase inteira | o dado |
|---|---|---|
| **Tudo** | "Comi tudo" | `escala: 1` |
| **Metade** | "Comi metade" | `escala: 0.5` |
| **Outra coisa** | "Comi outra coisa" | `como: 'fora'` |
| **Não comi** | "Não comi" | `como: 'nao'` |
| **Não sei** | "Não sei" | §4.5 |

**A cabeça da frase aparece uma vez, no alto**, e nunca se repete nos botões:
**"Em cada refeição: comi…"**. É V6 pelo lado certo — a folha não é zona do
polegar, mas o botão continua sendo três palavras no máximo.

**"Outra coisa" no lugar de "Fora", e eu estou tocando uma decisão de C4.** Ela
recusou "Fora" por nome (§10 dela: *"V7: não se abrevia o conceito"*) e escolheu
**"Fora do plano", em duas linhas**, porque a fatia da direção D aceitava duas.
**Com o quinto botão, não aceita mais — e a conta é esta.** `.sheet` tem
`padding: 8px 16px`, então a largura útil é 382 pt; `.rr` é
`grid-template-columns: 86px minmax(0,1fr)` com `gap: 8px`, então a coluna dos
botões tem **288 pt**; `.seg` era `repeat(4, 1fr)` com `gap: 4px` e passa a
`repeat(5, 1fr)` (conferi as três regras em `prototipo.html`). **Conta:** cada
botão cai de 69 pt para **54,4 pt**, menos `padding: 0 2px`, dão **50,4 pt
úteis**; a 13 px em peso 700, a 0,58 em, são **6,7 caracteres por linha**.

| rótulo | linhas que ele pede | altura, a `line-height: 1.1` | cabe em `min-height: 44px`? |
|---|---|---|---|
| **Tudo** | 1 | 14,3 pt | sim |
| **Metade** | 1 (45,2 dos 50,4 pt) | 14,3 pt | sim, **no limite** |
| **Outra coisa** | 2 | 28,6 pt | sim |
| **Não comi** | 2 | 28,6 pt | sim |
| **Não sei** | 2 | 28,6 pt | sim |
| *"Fora do plano", de C4* | **3** ("Fora" / "do" / "plano") | 42,9 pt | **no limite, e com uma linha de artigo sozinha** |

**Por que "Outra coisa" não é o que V7 recusa.** "Fora" é o conceito abreviado —
um pedaço de "fora do plano". "Outra coisa" é o dado dito por inteiro, com
outras palavras: o tipo diz *"'fora' é 'comi, mas não foi isto'"*, e "comi outra
coisa" é exatamente isso em três palavras. **Não é abreviação; é outra nomeação
completa.** E ela ganha uma coisa que "Fora do plano" não tinha: completa a mesma
frase que os outros quatro, na voz dele.

**Decisão 3: a porção acima de 1 alcança dia passado**, com os cinco valores que
já existem — `PORCOES = [½, ¾, cheia, 1¼, 1½]` em `src/ui/folhas/refeicao.jsx`
(conferi, e são `0.5, 0.75, 1, 1.25, 1.5`). **Os cinco não entram como botões**:
seriam dez numa fileira de 288 pt, e nem a conta nem a leitura aguentam. Eles
são a régua que já existe, alcançada da linha — **como a frente 2 especificou**
(§4.6, item 3 dela), e por onde se chega a ela é interação, não palavra.

**As palavras da régua de porções dentro da folha**, que não existem em desenho
nenhum:

| onde | o que está escrito |
|---|---|
| título da régua | **Almoço · quanto do plano** |
| os cinco valores | **½** · **¾** · **cheia** · **1¼** · **1½** (os cinco literais do app, conferi) |
| sob o valor escolhido | **sua escolha** |
| sob o valor 1 | **cheia é o plano** |
| a procedência, se for dia passado | **de memória** |
| o que a régua **não** diz | nada sobre adesão nem sobre excesso — §4.6 |

### 4.3 · A frase de leitura de volta, e ela muda de tempo verbal

O protótipo monta a frase com `frase()` e a põe num nó com
`aria-live="polite"`, e diz até o que **não** foi marcado ("Fica sem marca:
jantar.") — conferi as duas coisas. **A frente 2 exigiu que ela passasse a dizer
também o que acabou de ser gravado**, porque agora a gravação acontece durante a
frase. As palavras são estas, e são duas frases, não uma:

| quando | o rótulo da região | o corpo |
|---|---|---|
| **antes do primeiro toque** | **Vai ficar registrado** | **Segunda: café da manhã, almoço e jantar inteiros; lanche pela metade. Não comi: ceia. Água: não contei. Fica sem marca: pré-treino.** |
| **depois de cada toque** | **Guardei neste aparelho** | mesma lista, e mais **Mudei o lanche de inteiro para metade.** |

**Três coisas que a frase tem de distinguir com palavras diferentes**, porque
são três estados diferentes no dado e o protótipo só tem palavra para dois:

| estado | a palavra na frase | o dado |
|---|---|---|
| ele declarou que não comeu | **Não comi: ceia.** | `como: 'nao'` — zero conhecido, e o dia **conta** |
| ninguém disse nada | **Fica sem marca: pré-treino.** | ausência — e o pré-treino não entra na conta |
| ele declarou que não sabe | **Não sei: almoço.** | §4.5 |

**É esta distinção que a decisão 1 existe para destravar**, e sem palavras
diferentes ela não chega ao dono: `diaInterpretavel` devolve verdadeiro com
**uma** marca qualquer (conferi em `src/dominio/nutricao/calculo.ts`:
`Object.keys(h.done || {}).length > 0`), e o comentário da função diz o que está
em jogo — *"declarar 'não comi' com um toque passa a produzir um dia contado, em
vez de silêncio"*. O portão é `MIN_REGISTRADOS = 11` em 14
(`src/dominio/corpo.ts`, conferi), **e ele nunca abriu uma vez.**

**Então a frase diz o portão, uma vez, no fim:**

> **A segunda passa a contar para a regra do nutricionista: 3 dias conhecidos
> nos últimos 14. A regra pede 11.**

### 4.4 · Decisão 4 · A pergunta do fora do plano deixa de bloquear

No protótipo, marcar qualquer refeição como "Fora" desabilita o botão de guardar
e o rótulo dele vira **"Responda a pergunta para guardar"** (conferi). **Com o
botão de guardar fora, o bloqueio não tem onde morar**, e ele decidiu que não
deve ter: um toque fecha o dia, e a pergunta fica para depois.

**As palavras, e elas mudam de lugar e de tempo:**

| onde | o que está escrito |
|---|---|
| a linha que aparece **depois** da gravação | **Você comeu outra coisa no almoço. Sabe o que foi?** |
| botão | **Sei o que comi** |
| botão | **Não sei quanto** |
| o estado antes de responder, dito | **Sem resposta, a segunda conta como se tivesse seguido o plano.** |
| depois de "Sei o que comi" | **A segunda continua contando para a regra.** |
| depois de "Não sei quanto" | **A segunda deixa de contar para a regra: 3 dias conhecidos passam a 2.** |
| nunca | "Responda a pergunta para guardar" · "Tem certeza?" |

**A frase do estado inicial é a que esta decisão obriga, e ela é desconfortável
de propósito.** Conferi o dado: `aderencia?: 'plano' | 'fora' | 'perdido'`, e o
comentário do tipo diz *"Ausente = `plano`"*. Então **não responder empurra o dia
para o lado que infla a adesão** — e adesão inflada é exatamente o que produziu
um corte de comida sem motivo neste produto (F290, F292). Com o bloqueio, a
pergunta nunca ficava sem resposta; sem o bloqueio, fica.

**Isso não reabre a decisão dele — o bloqueio sai.** O que muda é que a frase
tem de dizer para que lado o silêncio cai, e **essa frase sobe à mesa dele**
(§11.2), porque ela nomeia uma regra: *qual é a adesão de um dia em que ele
disse "comi outra coisa" e não respondeu se sabe o quê.*

### 4.5 · Decisão 2 · "Não sei" passa a valer por refeição — e o dado não faz isso hoje

**O que ele decidiu:** "Não sei" passa a valer **por refeição de verdade**, não
mais pelo dia inteiro.

**O que o dado faz hoje, conferido.** "Não sei" por refeição **não existe**:
`ComoFoiARefeicao` tem dois valores, `'fora'` e `'nao'`, e o que existe é
`aderencia?: 'plano' | 'fora' | 'perdido'`, que é campo **do dia**
(`DiaComida` e `DiaComidaHist`, conferi os dois). E `diaInterpretavel` começa
por `if (h.aderencia === 'perdido') return false` — ou seja, hoje **um "não sei"
derruba o dia inteiro da janela de 14 dias**, que é o que o próprio protótipo
escreve na tela: *"Não sei: o dia deixa de contar para a regra"* (conferi).

**O custo está registrado e é de dado, não de palavra:** é campo persistido novo,
pelos seis portões, na migração **11 → 12** (`PLANO_ATUAL = 11` hoje, conferi em
`src/dominio/migracoes.ts`, com `migraPlano11` sendo a da ceia). O registro das
quinze já diz isso (`00-coordenacao.md`, consequência 1). **Então as palavras
abaixo são do comportamento novo, e hoje o dado não faz isso.**

**E aqui está a pergunta que ninguém fez, e sem ela as palavras não existem:**
se "Não sei" é por refeição, **o dia continua contando?** E, se continua, **que
peso a refeição desconhecida tem na adesão?** `aderenciaDoDia` soma
`pesoDaRefeicao` sobre as refeições do plano e divide pelo total (conferi), então
a refeição desconhecida precisa de um número — e as duas respostas possíveis
erram para lados opostos:

- **peso 0** subestima a adesão: um almoço esquecido conta como almoço não
  comido;
- **peso 1** infla a adesão, e inflar adesão é literalmente o mecanismo do corte
  errado de F292.

**Como a instrução pediu, escrevo as duas versões**, e a escolha é dele (§11.2).

**Versão A — um "não sei" numa refeição não derruba o dia:**

| onde | o que está escrito |
|---|---|
| botão | **Não sei** |
| a consequência, antes do toque | **O almoço fica desconhecido. A segunda continua contando, com uma refeição de cinco que a regra não sabe ler.** |
| na frase de leitura de volta | **Não sei: almoço.** |
| na contagem | **A segunda conta para a regra: 3 dias conhecidos nos últimos 14. A regra pede 11.** |
| em Semana, ao lado da adesão | **Adesão: 11 dias de 14 · 1 refeição desconhecida na segunda** |

**Versão B — um "não sei" derruba o dia, como hoje:**

| onde | o que está escrito |
|---|---|
| botão | **Não sei** |
| a consequência, antes do toque | **Sem saber quanto foi o almoço, a segunda inteira deixa de contar para a regra: 3 dias conhecidos passam a 2.** |
| na frase de leitura de volta | **Não sei: almoço — e por isso a segunda fica desconhecida.** |
| na contagem | **A segunda fica desconhecida: 2 dias conhecidos nos últimos 14. A regra pede 11.** |

**A diferença entre as duas não é de tom: é de quantos dias o portão vê.** E o
portão é o que nunca abriu. A versão A é a que torna o portão alcançável num dia
com uma refeição esquecida; a versão B é a que nunca infla. **Enquanto não houver
resposta, o escrito é a versão B**, porque é o que o dado faz hoje e porque V3
manda nunca produzir certeza falsa.

### 4.6 · O que a folha nunca diz

| nunca | por quê |
|---|---|
| adesão em percentual, na folha ou na linha do dia | A frente 2 já amarrou: adesão e excesso moram **juntos, em Semana**. E o próprio domínio tem a razão escrita em `padraoPorRefeicao` — *"devolve CONTAGEM, nunca percentual… feedback que dirige a atenção para a autoavaliação piora o desempenho em cerca de um terço dos casos"* (conferi) |
| "limpar o dia" ou "apagar o dia" | `poeComidaNoDia` não faz isso, e apagar um dia do histórico não foi desenhado (frente 2 §4.1, limite 2) |
| um sucesso quando nada mudou | `poeComidaNoDia` devolve `'mudo'` para dia que continua mudo, e a linha anterior fica. A tela diz: **"Nada mudou na segunda. Ela continua desconhecida."** |
| "13 dias perdidos" · "você não marcou" · sequência de dias | V5, F22 |
| "0 refeições" | V3: desconhecido não é zero |

**E o que ela diz quando a data não serve**, porque `poeComidaNoDia` recusa duas
e a tela não pode inventar (conferi os dois retornos):

| retorno | o que está escrito |
|---|---|
| `'futuro'` | **Amanhã ainda não aconteceu. Não dá para registrar o que não foi comido.** |
| `'data'` | **Não consegui ler esta data.** (família "falhou", §3.2) |

---

## 5 · A lista das mudanças que esperam e vencem

Ela mora em Prescrição (`09-frente1-lugares.md` §1.5) e o mecanismo é
`S.promoPendente`, que a frente 0 transformou em coleção com chave natural e
lápide — `promoPendente: PromoPendente[]` em `src/dominio/tipos.ts`, conferi,
com o comentário contando por que deixou de ser documento.

**A pergunta do fim do treino saiu** (decisão D1 do dono), então **nada disto é
perguntado na academia.** Essa é a primeira coisa que as palavras têm de dizer,
porque uma lista que aparece sem ninguém ter sido perguntado parece um erro.

### 5.1 · O cabeçalho e a moldura

| onde | o que está escrito | por quê |
|---|---|---|
| cabeçalho | **Prescrição** · **qui 01/10 · 3 esperando decisão** | O desenho, conferido (`prescricao.html`, estado 1), e o número sobe para o nome acessível da aba (§1.8) |
| título da lista | **Esperando decisão** | O desenho. Substantivo, sem dívida (V5): não é "pendências", não é "a fazer" |
| a linha que explica a lista, uma vez | **Nada disto foi perguntado no treino. O que você mudou no dia ficou registrado na sessão e esperou aqui.** | É a decisão dele dita como fato (F159: a mudança fica escrita na sessão de qualquer jeito). Sem esta frase, a lista parece uma pergunta que ele não ouviu |
| título do segundo bloco | **Venceu sem você** | O desenho, conferido. E é a palavra certa: nomeia o prazo como agente, não ele |

### 5.2 · A linha de cada mudança, e os sete textos que o app já grava

**Cada linha diz quatro coisas**, e a ordem é esta: o que mudou, de que sessão
veio, quando vence, e a conta de volume se virar permanente.

**O que mudou** vem de `textoMod(d, m)` em `src/main.jsx` — e **conferi os sete
ramos dela, que não estão numa gramática só:**

| `m.k` | o que o app grava hoje | o que passa a gravar |
|---|---|---|
| `add` | *adicionou Leg press* | **Leg press: entrou no dia** |
| `rm` | *removeu Pullover em máquina* | **Pullover em máquina: saiu do dia** |
| `troca` | *Pullover em máquina → Pullover no cabo* | **Pullover no cabo no lugar de Pullover em máquina** |
| `sets` | *Elevação lateral na máquina: 3 → 4 séries* | **Elevação lateral na máquina: 4 séries, não 3** |
| `reps` | *Pulldown unilateral: 10 → 8 repetições* | **Pulldown unilateral: 8 repetições, não 10** |
| `desc` | *Pulldown unilateral: descanso 2:00 → 1:30* | **Pulldown unilateral: descanso de 1:30, não 2:00** |
| `mover` | *mudou Leg press de posição* | **Leg press: feito antes, fora da ordem** |

**Três dos sete tinham ele como sujeito** — "adicionou", "removeu", "mudou" —, e
V8 é explícita: a primeira pessoa é do app e só sobre os próprios atos no
registro; os atos **dele** não se narram em terceira pessoa. Os outros quatro
já eram frase nominal. **Uma gramática só: nome prescrito, dois-pontos, o que
passou a valer, e o que era depois.** "4 séries, não 3" em vez de "3 → 4": a
flecha é tabular e a lista não é tabela, e o que importa primeiro é o número que
vale.

**E um requisito de dado, porque senão as palavras velhas sobrevivem para
sempre.** `PromoPendente` guarda **as duas coisas**: `mods: Mod[]`, que é
estrutura, e `resumoMods: string[]`, que o tipo descreve como *"cada mudança já
em português, como a tela mostra"* (conferi). O `resumoMods` é escrito por
`textoMod` no momento em que a sessão fecha (conferi as duas chamadas, em
`fechaSessao` e em `finalizarSessao`), e `migraPlano10` o copia como está
(conferi: `resumoMods: Array.isArray(g.resumoMods) ? g.resumoMods : []`).

> **Requisito meu: a lista renderiza de `mods`, e `resumoMods` passa a ser
> reserva.** Senão, uma mudança que já está esperando continua escrita na
> gramática velha ao lado das novas, para sempre, e nenhuma reescrita de palavra
> alcança o que já está no disco. Renderizar de `mods` tem um segundo ganho de
> graça: o nome do exercício passa a seguir o renome (F117 — renomear muda só o
> nome exibido). `resumoMods` continua sendo a única coisa que resta quando o
> exercício saiu do catálogo, e aí ela é usada.

### 5.3 · A frase do vencimento — e ela conta em treinos, não em dias

**O desenho conta em dias, e isso é palpite.** Conferi em `prescricao.html`,
estado 1: *"vence 08/10"*, *"Vence quando o Treino D voltar, em 7 dias"*,
*"vence 05/10"*, *"em 4 dias"*, e a prosa da tela chega a dizer que o prazo "vai
de 4 a 7 dias sem precisar ser explicado".

**Mas o prazo não é de dias.** A decisão dele (5.a' P1) é **por posição**, e a
frente 2 derivou o predicado inteiro sem relógio nenhum (§9.3 dela):
`voltas(p) = (rot().indexOf(p.day) − rot().indexOf(nextDay()) + N) % N`. A
sequência avança **pela ordem, não pelo dia da semana** — F81, e conferi
`ROT_BASE = ['A','B','C','D','E','HX']` em `src/dominio/programa.ts`: são seis
posições, e nada no dado amarra uma posição a uma quarta-feira.

**Então uma data de vencimento é uma previsão do app**, e V3 obriga a marcar
previsão como previsão. **As palavras:**

| `voltas(p)` | o que está escrito na linha |
|---|---|
| 0 | **vence na próxima vez do Treino A — que é a próxima sessão** |
| 1 | **vence quando o Treino A voltar · falta 1 treino** |
| 2 ou mais | **vence quando o Treino D voltar · faltam 4 treinos** |
| já venceu | **venceu quando o Treino B voltou, em 29/09** |

**E a data, se a tela quiser mostrá-la, vem marcada:** **"por volta de 08/10, se
você treinar todo dia"**. Nunca "vence 08/10" seco, que afirma um dia que o dado
não conhece.

**A frase que nomeia a regra**, e é esta que sobe à mesa dele (§11.2):

> **Cada mudança vence quando aquele treino voltar. Se você não decidir até lá,
> ela fica como só daquele dia.**

Duas frases, dezoito palavras, e elas contêm a regra inteira: o prazo, o que
decide o prazo, e o que acontece no fim dele. **Nenhuma delas diz "permanente"**
— "permanente" é a palavra do dado e aparece só no histórico de mudanças do
programa (F163), como C4 já havia fixado.

### 5.4 · Os dois botões, e eles estavam no tempo errado

**O desenho põe os dois no passado**, conferi: **"Foi só naquele dia"** e
**"Virou permanente"**. V6 manda o contrário: *"o rótulo diz o que o toque
grava, não o que a tela faz"* — e um botão escrito no passado afirma um fato
consumado, que é precisamente o que ainda não aconteceu.

| era, no desenho | passa a ser | por quê |
|---|---|---|
| **Foi só naquele dia** | **Fica só naquele dia** | Presente: é o que o toque grava. E é o padrão conservador, que o fonte já defende por escrito ("o caminho de menor esforço tem que ser o conservador", acima de `MOTIVOS` em `src/main.jsx`) |
| **Virou permanente** | **Entra no Treino D** | Nomeia o **destino**, que é a informação que falta — é a decisão de C4 na E1, e ela tem razão: a próxima vez daquele treino volta sem a mudança se ele não decidir (F160, F162) |
| **Gravar no programa** (tela de confirmação) | **Gravar no Treino D** | O mesmo: o programa tem seis posições, e qual delas recebe é o que ele precisa saber (conferi "Onde entra | Treino D, posição 1 · não mexe no Treino A" no desenho — a informação está lá, no rótulo não estava) |
| **Tornar permanente agora** (no vencido) | **Entra no Treino B agora** | Idem |
| **Decidir depois** | **Decidir depois** | Fica. Sem decidir, nada se perde (F159) |

**E os dois botões do app de hoje**, que vão sair com a tela da pergunta
(`src/ui/telas/decisao.jsx`, conferi): **"só hoje"** e **"levar para o
oficial"**. O segundo usa **"o oficial"**, que é vocabulário interno — não
aparece em nenhuma prescrição e o dono nunca o disse. V7 recusa exatamente isso.
A substituição é a mesma: **Entra no Treino D**.

### 5.5 · A conta de volume na linha, e a unidade que o desenho errou

**O desenho diz "na semana" e o código diz "na rotação", e vale o código.**
Conferi `impactoDoMod` em `src/main.jsx`: ela monta
`g + ': ' + oficial + ' → ' + depois + ' séries na rotação'`, com
`oficial = seriesOficiais(g)`, e `seriesOficiais` soma o programa oficial sobre
`rot()` — as seis posições. O alvo vem de `ALVO = alvoDoPrograma(PROGRAMA,
ROT_BASE)` (conferi), também sobre as seis.

Uma rotação é uma semana **só quando ele fecha as seis em sete dias**, e os
números medidos dizem que isso não é confiável: 42% a 59% das sessões fecham sem
ele (P1). F179 chama o total de "semanal" e o desenho repetiu; **a função conta
rotação.** A palavra do app é a certa.

| onde | o que está escrito |
|---|---|
| na linha que espera | **Se entrar no Treino D: deltoide lateral passa de 12 para 13 séries na rotação. O treinador prescreveu 12.** |
| quando o alvo não existe para aquele músculo | **Se entrar no Treino D: deltoide lateral passa de 12 para 13 séries na rotação.** (sem segunda frase — V1: o app não inventa alvo que o treinador não deu) |
| a ressalva do treinador, onde ela couber | **Treinador: prioridade máxima não significa obrigatoriamente mais séries brutas toda semana.** |
| nunca | "séries na semana" · "+1 série" como elogio · a seta `→` |

**E uma coisa que a frente 2 mediu e que a palavra tem de respeitar:**
`impactoDoMod` tem **uma** ramificação testada de quatro (§9.1 dela). Das sete
espécies de mudança, **só `sets` produz conta de volume** — conferi: os outros
ramos devolvem `null`. Então **cinco das sete linhas da lista não têm conta
nenhuma**, e a tela não pode fingir que tem. **O escrito, nessas:** nada. Linha
sem conta é linha sem conta, e inventar "não altera o volume" seria afirmar o que
a função não calculou.

### 5.6 · Decisão 8 · O prazo do desfazer

**O que ele decidiu:** o desfazer do vencimento é oferecido **até a próxima
sessão daquele treino**. A frente 2 havia levado a pergunta à mesa dele porque a
decisão dizia "desfazível" sem dizer até quando, e porque a coleção tem teto de
60 entradas (`S.promoPendente.slice(-60)`, pela frente 2 §9.3).

**É prazo, e prazo precisa de palavra que o diga sem o dono ter de adivinhar.**
E a palavra é a mesma do vencimento, de propósito — a mesma leitura
(`voltas(p)`), a mesma unidade (treinos), o mesmo verbo:

| estado | o que está escrito |
|---|---|
| venceu, e o desfazer vale | **Ficou como só daquele dia quando o Treino B voltou, em 29/09. A sessão de 22/09 continua com as 3 séries registradas.** + **Dá para fazer entrar no Treino B até a próxima vez dele.** + botão **Entra no Treino B agora** |
| venceu, e o prazo do desfazer passou | **Ficou como só daquele dia em 29/09. O Treino B já voltou duas vezes desde então, e a decisão fechou.** + **Ver a sessão de 22/09** |
| o que nunca se escreve | "expirado" · "perdeu o prazo" · "você não decidiu" · um relógio contando |

**A segunda linha é a que a decisão 8 obriga, e ela não existe em desenho
nenhum.** O desenho só tem o estado em que o desfazer vale (`prescricao.html`,
estado 1, bloco "Venceu sem você", conferi) — porque antes da decisão dele o
desfazer não tinha fim.

**E uma consequência que ninguém escreveu:** se o desfazer fecha, a linha **sai
da lista**. A frente 1 já amarrou a disciplina — *"decidida ou vencida, a linha
sai da fila e deixa lápide, para a fusão não a ressuscitar"* (§8.1, passo 6
dela) —, e com a decisão 8 o momento de sair fica definido pela mesma leitura.
**O que a tela diz quando a lista esvazia:**

> **Nenhuma mudança esperando decisão.** · **O que você mudar num treino aparece
> aqui depois que a sessão fechar.**

Sem elogio e sem "tudo em ordem" (V5): é um estado, não um resultado.

---

## 6 · Os portões da semana

O lugar possui o veredito, os três portões e o passo de ±150 kcal
(`09-frente1-lugares.md` §1.4). **A regra é do nutricionista**, e V1 manda que
ela apareça atribuída — o desenho já faz isso e é a melhor coisa dele:
**"A regra do nutricionista diz"**, como sobrancelha do veredito
(`semana.html`, os sete estados, conferi). Fica como está.

### 6.1 · O veredito, e o app tem cinco saídas com três gramáticas

**Conferi `veredito` em `src/dominio/corpo.ts`**, inteira. Ela devolve
`k: 'mais' | 'menos' | 'manter' | 'observar' | 'faltam'`, um título curto `t`,
uma prosa `p` e, às vezes, `falta: 'aderencia' | 'gordura'`. **Os títulos de
hoje não estão numa gramática só:** dois são verbos dirigidos a ele ("Comer
mais", "Comer menos"), um é verbo sem objeto ("Observar"), um é verbo com
objeto errado ("Manter como está" — o que se mantém é a comida, não "está") e um
é um substantivo ("Faltam dados").

**E "Observar" nomeia três situações diferentes.** Conferi os nove retornos da
função: `t: 'Observar'` sai (a) quando falta a leitura das fotos, com
`falta: 'gordura'`; (b) quando a força está subindo e peso parado com carga
subindo é recomposição; (c) no caso omisso. **As três têm consequências
diferentes para ele** — na primeira existe uma coisa que ele pode fazer agora, nas
outras duas não existe nada a fazer —, e o título não as separa. Só a prosa
separa, e a prosa é o que ele não lê de relance.

**A gramática única: o veredito é sempre o que a regra faz com a comida, e o que
vem depois dos dois-pontos é por quê.**

| `k` + `falta` | o título hoje | passa a ser | tem algo a fazer? |
|---|---|---|---|
| `mais` | Comer mais | **Comer mais 150 kcal** | sim: aplicar |
| `menos` | Comer menos | **Comer menos 150 kcal** | sim: aplicar |
| `manter` | Manter como está | **Não mexer: a taxa está na faixa** | não |
| `observar` + `gordura` | Observar | **Não mexer: falta a sua leitura das fotos** | **sim: responder** |
| `observar` + `aderencia` | Registrar antes de mexer | **Não mexer: falta registro de comida** | **sim: pôr em dia** |
| `observar` (força subindo) | Observar | **Não mexer: peso parado com carga subindo** | não |
| `observar` (caso omisso) | Observar | **Não mexer: uma semana sozinha não decide** | não |
| `faltam` | Faltam dados | **Não mexer: faltam pesagens** | **sim: pesar** |

**Por que "Não mexer" e não "Manter":** "manter" é o que ele faria; "não mexer" é
o que a regra faz. A regra não tem autoridade sobre o que ele come — ela tem
autoridade sobre o plano, e o que ela decide é mexer ou não mexer nele. É a
distinção de V1 aplicada ao verbo.

**E a prosa `p` da função fica inteira.** Ela é das melhores coisas escritas
neste produto: já traz os números que a produziram, já atribui, e já diz o que
falta. Conferi quatro delas e não troco uma palavra — por exemplo *"Mas não há
registro suficiente dos últimos 14 dias para saber se o ganho veio da dieta ou de
saídas dela. Tirar comida do plano agora puniria os dias em que você seguiu."*
**Uma única emenda:** V3 proíbe certeza falsa, e a prosa de `faltam` diz
*"média de uma pesagem só não é média"* — perfeito. Nada a fazer.

### 6.2 · Os três portões, e o estado tem de estar na palavra

O desenho dá os três com o estado por **ícone** — `ok2` e `warn` dentro de
`.gate .ic2` — e a frente 4 achou que isso é o caso 3 dela: *o ícone diz mais do
que o nome do controle diz*, com a resposta sendo que **o texto passa a dizer a
palavra, e aí o ícone fica decorativo** (§6.2, caso 3). Ela escreveu os exemplos
dizendo que eram ilustração de formato. **São estes:**

| portão | o que está escrito |
|---|---|
| taxa, cumprido | **Taxa: cumprida — +0,07 e +0,03 kg/semana** · **duas semanas seguidas abaixo de 0,10 · três semanas com média válida (13/09, 20/09, 27/09)** |
| taxa, não cumprido | **Taxa: falta — duas semanas seguidas com média válida** · **a de 13/09 tem 1 pesagem, e uma semana vale com 2** |
| força, cumprido | **Força: cumprida — não está subindo** · **+0,4% em 2 semanas, sobre 7 exercícios — abaixo de 1%, que é ruído de anilha** |
| adesão, cumprido | **Adesão: cumprida — 11 dias de 14** · **o mínimo da regra. 10 de 14 não bastaria** |
| adesão, não cumprido | **Adesão: falta — 1 dia de 14** · **a regra pede 11. Faltam 10 dias com consumo conhecido, e 13 dos 14 ainda podem ser preenchidos** |

**"cumprida" e "falta", e não "ok" e "atenção".** Duas razões: o portão é da
regra do nutricionista, e o que ele pergunta é se a condição dela está satisfeita
— "cumprida" é a palavra dessa pergunta. E "falta" não acusa: o sujeito é a
condição, não ele. V5.

**"Força: cumprida — não está subindo" é a linha mais estranha do produto, e ela
está certa.** O portão da força é cumprido **quando a força não está subindo**,
porque é isso que a regra lê para liberar mais comida (`veredito`, ramo do ganho
travado: `if (sinais.forcaSubindo) return { k: 'observar' …}`, conferi). Uma
tela que escrevesse só "Força: cumprida" diria o contrário do que acontece. **As
duas metades ficam juntas, sempre**, e esta é a linha que mais precisa delas.

**O botão de cada portão que não está cumprido diz para onde ele leva**, e o
desenho já acerta: **"Pôr em dia"** na adesão, **"Responder"** na avaliação
visual, **"Pesar hoje"** / **"Peso de outro dia"** no vazio. Mantidos. E o da
força é **"Ver"** no desenho, que não diz o quê: passa a **"Ver a força"**.

### 6.3 · O passo, e a consequência antes do toque

O desenho faz isto certo e é o melhor exemplo de V4 do material inteiro: o botão
só aparece depois da conta, e a conta é em gramas de arroz
(`semana.html`, estado 3, conferi). Mantido, com três emendas de palavra:

| onde | o desenho | emenda |
|---|---|---|
| botão | **Aplicar +150 kcal** | fica |
| a tabela do prato | **Almoço · arroz cozido · 250 → 310 g** | fica: aqui a flecha é tabular e a tabela é tabela |
| a frase do que não volta | **Depois de aplicado, 3.157 vira a nova base. Se o peso voltar ao alvo, o passo não é devolvido sozinho.** | fica, e é a frase que impede o erro de F217/F291 |
| sobrancelha | **A regra do nutricionista diz** | fica |
| a linha do passo aplicado | **+150 kcal aplicado · 01/10 às 21h34 · 3.007 → 3.157 kcal em dia de treino** | passa a **Apliquei +150 kcal em 01/10, às 21h34 · 3.007 → 3.157 kcal em dia de treino** — V8: o agente é o app, e aplicar é ato do registro |
| desfazer | **Desfazer** | fica, e **sem prazo**: o desenho diz "Desfazer não tem prazo — corrigir no lugar vale aqui também", e isso é verdade no dado (`S.ajuste` e `S.ajusteHist`, com a linha de procedência de cada passo) |

**E uma frase que o desenho tem e que eu quero deixar marcada como obrigatória**,
porque é a única no produto inteiro que diz ao dono que uma tela não vai insistir:

> **Enquanto a adesão não chega a 11, o veredito não muda, por mais pesagem que
> entre. A tela não vai pedir isso de novo em outro lugar.**

A segunda metade é uma promessa sobre o produto, não sobre o dado, e ela só é
verdade se for cumprida: **o portão da adesão só cobra em Semana.** Em Agora
existe o contador dos 14 dias, que é número e não cobrança. **Se essa promessa
não for cumprida, a frase sai** — não há meia-promessa aqui.

### 6.4 · O vazio dos portões

| onde | o que está escrito |
|---|---|
| veredito | **Não mexer: faltam pesagens** |
| prosa | **Faltam semanas com média válida. Uma semana vale com 2 pesagens, e são três semanas seguidas para a regra decidir qualquer coisa.** (do desenho, e os números são da função: `MIN_PESAGENS = 2`, e `taxasSemanais` pede `quantas + 1` semanas, conferi) |
| a lista das semanas | **27/09 a 03/10 · em curso · faltam 2 dias · 1 pesagem** · **13/09 a 19/09 · buraco: quebra a sequência · 1 pesagem** |
| a saída | **Com a semana de 13/09 incompleta, as de 06/09 e 20/09 não formam sequência. Uma pesagem com data passada em 13/09 ainda resolve isso — se você souber o número.** |
| a recusa | **Não invente o peso de um dia que passou.** (do desenho, conferi; é V3 em cinco palavras, e é a única frase do material que pede ao dono para não registrar) |
| nunca | "0 pesagens" onde não houve pesagem · "Adesão: 0%" · um gráfico vazio com eixo |

---

## 7 · Os sete estados ruins

A frente 2 conferiu o briefing e achou que **quatro estão desenhados e três
não**, e que **sete dos oito becos do protótipo não fazem nem dizem nada** quando
tocados (§7.0 dela: `data-a="beco"` aparece oito vezes e não tem ramificação
nenhuma no tratador de cliques; sete das oito não têm `disabled`). **Então para
três estados as palavras não existem em lugar nenhum, e para os becos não existe
nem o retorno.**

**A moldura comum, em palavras.** A frente 2 exige quatro coisas de todo estado
ruim, e a quarta é a que falta em todos (§7.1 dela). As quatro, com texto:

| parte | a forma da frase | exemplo |
|---|---|---|
| 1 · o que aconteceu | verbo no passado, sujeito é o app ou a coisa | **Não guardei a série 2.** |
| 2 · o que **não** aconteceu | o que continua existindo, e até quando | **Nada foi apagado. 45 × 10 continua aqui enquanto o app estiver aberto.** |
| 3 · o que fazer dali | verbo com objeto, nunca "OK" | **Tentar de novo** |
| 4 · como sair sem fazer nada | **Fechar este aviso** | e dispensar não escolhe por ele |

**"Fechar este aviso" e não "Depois", "Ignorar" ou "Entendi".** "Depois" promete
que o aviso volta, e nenhum deles volta sozinho — o app não tem servidor e não
lembra ninguém de nada (F11). "Ignorar" nomeia o ato como descuido. "Entendi" é
uma declaração dele sobre o próprio entendimento, que o app não tem como saber.

### 7.1 · Erro de gravação — desenhado, e só falta a dispensa

Está em oito lugares dos nove HTML (frente 2 §7.0), e o texto é o melhor do
arquivo. As palavras estão escritas em §3.2 deste documento, na família
"falhou", porque é lá que elas pertencem agora: **o erro de gravação é uma das
duas situações que acendem o painel de "pare"**, e a outra é a destruição.

**O que falta, e é uma frase:** a dispensa. E a regra da dispensa, que a frente 2
fixou e que precisa estar dita na tela:

> **Fechar este aviso não apaga a marca: a série 2 continua escrita como não
> guardada na faixa e na tabela.**

### 7.2 · Carregando — desenhado

| onde | o que está escrito | por quê |
|---|---|---|
| durante, até 4 s | **Abrindo a sessão de hoje…** · **Lendo o registro deste aparelho. Não precisa de rede.** | Do desenho (`momento-1.html`, estado 8), com "Não usa rede" passando a "Não precisa de rede": o app **pode** usar rede para replicar, e dizer "não usa" seria falso; o que é verdade é que não depende dela (F72) |
| passados 4 s | **O registro deste aparelho não abriu.** · **Esperei 4 s. Nada foi apagado e nada saiu do aparelho. A rede não é a causa: o registro mora aqui.** | Do desenho, e é família "falhou" (§3.2). F273 |
| saídas | **Tentar de novo** · **Ver o detalhe técnico** | Do desenho |
| a saída de último recurso | **Se acontecer de novo: Ajustes › Cópia de segurança, a partir de outro aparelho com a conta.** | Do desenho |
| o detalhe técnico | **leitura local sem resposta há 6 s · versão 2026-10-06** | C4, §5 dela, estado 9: F5 — o usuário é quem mantém o código |
| nunca | "Carregando…" sem fim · "Sincronizando" · uma barra que não acaba | §3.4 de `04-voz.md`; F273, F297 |

**E o estado em que não há nada para carregar**, que o desenho de C tem e o da D
não (`04-voz.md` §5, estado 9 dela): **"Nenhum registro neste endereço."** +
**"Se você já usava o app, seu registro continua no endereço e no ícone onde foi
guardado. Abra por lá."** Mantido sem emenda: F56, e o vazio não pode parecer
perda.

### 7.3 · Máquina ocupada — desenhado, e as palavras ficam

O desenho ordena as saídas por preço e isso é a coisa certa (frente 2 §7.4).
Mantidas: **"Vale só para hoje. O programa não muda."** no alto, **"Fazer antes o
próximo"** como primeira saída com o efeito inteiro dito
(**"Elevação lateral unilateral no cabo agora; esta volta logo depois"**), os
substitutos com ★ nos indicados pelo treinador, a última carga de cada um, e
**"Pular hoje"** por último.

**Quatro emendas, e as quatro são de palavra:**

| o que | emenda | por quê |
|---|---|---|
| título | **Elevação lateral na máquina ocupada** → **Máquina ocupada** + **Elevação lateral na máquina** no subtítulo | C4 já tinha feito essa troca para a direção D (§10 dela): "ambiguidade de leitura" — o título de hoje se lê como se a máquina tivesse nome |
| o ★ | o ícone **e** a palavra | Frente 4 §6.2, caso 3: **em nenhum lugar diz "indicado"**. Passa a **Elevação lateral unilateral no cabo · indicado pelo treinador** |
| a dispensa | **Fechar e fazer mesmo assim** | A frente 2 exige: fechar volta à régua do exercício original sem registrar nada. "Cancelar" não serviria: ele não cancelou nada, ele decidiu fazer |
| a frase do treinador | **Treinador: o que muda é o ângulo, não o músculo.** (F106, atribuída) | V1. O desenho a tem sem assinatura, e a direção registra que a ligação dela a este substituto é ilustrativa |

### 7.4 · Dor — desenhado, e é o único que não se dispensa sem responder

Mantido: a detecção com as duas datas, a regra nas palavras do treinador
(*"dor de tendão apareceu, tirar este exercício por 2 semanas e substituir por
outro ângulo. Nunca empurrar por cima."* — F102, atribuída), as três saídas
(**"Ver os 3 substitutos"**, **"Pular hoje"**, **"Fazer mesmo assim"**) e a
regra que vale para as três: **"Qualquer escolha fica registrada no dia."**

**Duas coisas a acrescentar, e as duas são palavra:**

1. **A frase que distingue dor normal de sinal de tendão não cabe, e C4 já
   contou.** São 147 caracteres (F20), e o subtítulo da folha é de uma linha — é
   a A6 da Lista A dela. **Eu não a encurto e não a movo para depois:** ela é o
   que separa "dói porque treinei" de "dói porque é tendão", e dita depois não
   serve. **Fica como Lista A**, §12.2, e o que está escrito enquanto isso é a
   frase de F102, que é a da decisão.
2. **A exceção à dispensa precisa estar dita.** A régua só aparece depois da
   escolha (frente 2 §7.5), e isso quer dizer que este é o único estado ruim que
   não se dispensa sem responder. **A frase que o diz:**
   **"Escolha uma das três para a régua voltar. 'Fazer mesmo assim' também é
   escolha, e fica registrada."**

### 7.5 · Pular — as palavras não existiam, e a premissa do desenho estava errada

**Não está desenhado:** é botão em sete lugares do `momento-1` e não tem estado
nenhum (frente 2 §7.0). A única coisa escrita é a legenda
*"Pular é decisão e não volta como pendente (F154)."*

**E a premissa da frente 2 para pedir confirmação não se sustenta no código.**
Ela escreveu: *"pular não volta como pendente, logo é irreversível pela via
normal"*. **Conferi, e não é irreversível:** `togglePulado` em `src/main.jsx` tira
ou põe o id na lista, e o toast diz as duas direções —
`'Exercício de volta.'` quando sai e `'Exercício pulado nesta sessão.'` quando
entra. São 18 casos em `tests/fluxo/ciclo.test.js`, e a frente 1 já havia
registrado a capacidade como *"pular (decisão registrada e reversível)"* (§4.1
dela). A própria frente 2 nota isso dois parágrafos depois e escreve que "as
duas convivem" — **mas o requisito dela já estava escrito a partir da primeira
metade.**

**O que isto muda nas palavras:** V4 recusa "tem certeza?", e um diálogo de
confirmação para um ato reversível a um toque é exatamente isso. **Então não há
pergunta.** O que há é a frase do que ficou registrado, com o desfazer na própria
linha — que é V2 ("todo toque diz onde guardou") mais V4.

**E a razão que a frente 2 deu continua valendo, por outro caminho.** O
problema real que ela mediu não é a irreversibilidade: é que "Máquina ocupada",
"Dor" e "Pular" são três botões de 122 × 44 px lado a lado, sem limite visível
(contraste 1,08:1 contra os 3:1 exigidos — `04-acesso.md`, D-6), com
**consequências diferentes**, num instante de dificuldade. Toque errado é
provável. **A resposta de palavra para toque errado não é confirmar antes: é
dizer depois, alto, e deixar o desfazer onde o dedo está.**

| onde | o que está escrito |
|---|---|
| o botão | **Pular** |
| depois do toque, na linha do exercício | **Pulado hoje** · **Desfazer** |
| a frase de confirmação, na região viva | **Guardei: Elevação lateral na máquina, pulada hoje. Ela não volta a aparecer como esperada nesta sessão.** |
| o que a frase **não** diz | que o programa mudou — porque não mudou: `S.mods` não é tocado, e os pulados são da sessão (`marca.pulados = s.pulados.slice()` em `fechaSessao`, conferi) |
| a linha do exercício, dali para a frente | **Elevação lateral na máquina · pulada hoje** · **Desfazer** |
| no fim da sessão, no resumo | **1 pulado · Elevação lateral na máquina** (é o que `pendencias` já devolve, conferi o balde `pulado`) |

**E a frase que resolve a contradição aparente**, porque "reversível" e "não
volta como pendente" lidas juntas parecem se contradizer e são as duas verdade:

> **Pulada não é esquecida: ela fica escrita como pulada e não volta a ser
> pedida. Desfazer põe ela de volta na fila.**

Duas frases, e a diferença entre as duas metades é *o app não insiste* contra *o
caminho de volta existe*.

**E o requisito que vem de `04-voz.md` §3.1 e que eu confirmo:** **"pulado" e
"sem marca" nunca usam a mesma palavra**, porque o dado é diferente — `'pulado'`
é decisão declarada e `'nada'` é ausência (`estadoEx` devolve os quatro estados,
conferi: `'feito'`, `'parcial'`, `'pulado'`, `'nada'`).

### 7.6 · Deload — as palavras não existiam, e o lugar era o freio

**Não está desenhado:** uma linha de texto numa folha desabilitada do protótipo
(`["Deload hoje", "metade das séries, mesmas cargas"]` em `menuSessao()`), com
**zero** ocorrências nos oito HTML (frente 2 §7.0).

**E as duas decisões dele mudam o que as palavras têm de carregar.**

**Decisão 6 · o deload muda de lugar.** Hoje o interruptor mora em Ajustes, e o
comentário do fonte diz por quê, palavra por palavra: *"Fica AQUI, e não no
TREINO, de propósito: um interruptor que corta metade das séries não deve estar a
um toque no meio de uma sessão. O app existe em parte para frear, e o caminho de
menor esforço tem que ser o conservador."* (`src/ui/telas/guia.jsx`, conferi.)
Ele decidiu que muda, e que **"a razão escrita no fonte cai"**.

**O que cai com ela é o freio, e o freio era o lugar.** Então o freio passa a ser
a palavra — e isso é exatamente o que esta frente existe para escrever. **A
consequência: o item do menu da sessão não pode ser um interruptor com nome.** Ele
diz o corte, em número, antes do toque (V4):

| onde | o que está escrito |
|---|---|
| item do menu `···`, deload desligado | **Deload hoje** · **corta 20 séries para 10, nas mesmas cargas** |
| item do menu `···`, deload ligado | **Sair do deload** · **devolve 10 séries ao Treino A de hoje** |
| nunca | um interruptor com o nome sozinho · "Ativar deload" |

**Os números são do dado, não de exemplo:** `setsFor(ex)` chama
`_setsFor(ex, S.deload)` (conferi), e a lista de séries é derivada do prescrito
mais `S.deload` — então "de 20 para 10" é calculável na hora de abrir o menu,
para aquele treino, naquele dia.

**Decisão 7 · desligar no meio devolve as séries, e o que já foi registrado
fica.** Isto responde a pergunta que a frente 2 levou à mesa dele (§7.7 dela), e
as palavras têm de dizer **as duas metades**, porque a segunda é a que impede o
susto:

| quando | o que está escrito | o que acrescenta |
|---|---|---|
| ao ligar | **Deload ligado. Metade das séries, mesmas cargas.** | É o toast que o app já tem (`setDeload`, conferi), e está certo |
| ao ligar, a frase do histórico | **As sessões deste modo ficam marcadas, para a queda de volume não parecer regressão.** | É a frase do app de hoje, em `src/ui/telas/guia.jsx` (conferi). F: `abreSessao` grava `marca.dl = 1` |
| ao desligar no meio da sessão | **Deload desligado. As 10 séries voltaram: o Pulldown unilateral volta a pedir 4, e as 2 que você já registrou ficam.** | **É a decisão 7 inteira em uma frase.** O app de hoje diz só "Séries completas de volta", e não diz o que acontece com o que já foi registrado — que é a única coisa que ele teme |
| ao desligar fora da sessão | **Deload desligado. Séries completas de volta.** | O toast de hoje, e fora da sessão não há série registrada para tranquilizar |
| a marca na tabela, com deload ligado | **2 séries hoje · metade do prescrito, por deload** | Frente 2 §7.7: a tabela tem de dizer que o número de séries ali **não é o prescrito** |

**E a frase que o lugar antigo dizia sem palavra**, que agora tem de ser dita:

> **O deload corta séries, não cargas. Ele é para quando a força está caindo, a
> dor não passa em 72 h ou o RIR não se mantém — e não para um dia difícil.**

**Isto é citação do treinador e vai atribuída**, porque é a regra dele: o app já
a escreve no aviso de fim de bloco (*"Deload só se houver evidência de fadiga:
força caindo por 2 a 3 sessões, dor que não passa em 72 h, RIR difícil de
manter. Progredindo bem, siga treinando."*, conferi em `src/main.jsx`), e o
comentário acima do aviso diz que **não é contagem regressiva para um deload
obrigatório**. A frase sobe do aviso para o menu, porque é no menu que o toque
acontece agora. **Com assinatura: "Treinador:".**

### 7.7 · Encerrar — as palavras não existiam, e há quatro maneiras de a sessão acabar

**Não está desenhado:** uma linha numa folha desabilitada,
*"Encerrar a sessão · fim igual à última série; não pergunta nada"*.

**E "não pergunta nada" é decisão dele** (D1): a pergunta do programa sai. Então
o estado é curto de propósito. **Mas a linha do desenho está errada sobre o
dado**, e a frente 2 achou: no fecho **manual** o fim é o instante do toque, não
a última série.

**Conferi, e o quadro é mais largo do que a frente 2 escreveu: há quatro
maneiras de a sessão acabar, e três delas gravam um fim diferente.**

| como acaba | o fim gravado | `marca.fim` | onde está |
|---|---|---|---|
| ele toca **finalizar** dentro da sessão | **o instante do toque** | `'manual'` | `encerraDeVerdade` → `fechaSessao('manual')`; `const fim = comoFim === 'manual' ? Date.now() : (s.ultima \|\| s.inicio)` (conferi) |
| ele toca **"já parei"** na faixa da pergunta de 1h30 | **a última série** | `'auto'` | `CTX.encerraSessaoEsquecida` → `fechaSessao('auto')` (conferi), com o comentário em cima: *"'Já parei': encerra com a duração indo até a última série registrada"* |
| passa a graça depois de 1h30 e ninguém responde | **a última série** | `'auto'` | `encerraSePreciso` na abertura, e `ligaBatida` com o app aberto |
| ele toca **descartar** numa sessão sem série | **nada: a sessão sai** | — | `finalizarSessao`, primeiro ramo (conferi) |

**A segunda linha é a que ninguém escreveu.** A frente 2 escreveu que *"o 'fim
igual à última série' fica onde ele é verdade: na faixa do encerramento
automático"* — mas **"já parei" é um toque, não é automático**, e ele grava o fim
automático. É o único lugar do produto onde um toque dele grava um tempo que não
é o do toque, e está certo que grave: ele está respondendo depois do fato. **O
que falta é a palavra dizer isso**, e hoje — ironicamente — é o único dos quatro
que diz: o toast de `CTX.encerraSessaoEsquecida` é
*"Treino encerrado. A duração vai até a última série."* (conferi).

**As palavras dos quatro, e três delas são novas:**

| onde | o que está escrito |
|---|---|
| item do menu `···` | **Encerrar o treino** · **o fim é agora, 7h31** |
| … com exercício pendente | **Encerrar com 3 exercícios pendentes** · **eles ficam marcados como não feitos no histórico** · botões **Encerrar assim** / **Voltar ao treino** |
| … sem série nenhuma | **Descartar esta sessão** · **nenhuma série foi registrada nela. Sai o horário de início e a duração** · botões **Descartar a sessão** / **Deixar como está** (é a família "pare", §3.3) |
| depois de encerrar | **Encerrei o Treino A · 6h20 → 7h31 · 1h11 · 8 exercícios** |
| a pergunta de 1h30, na faixa | **Treino A sem série nova há 1h32.** · **continuo treinando** / **já parei** |
| depois de "já parei" | **Encerrei o Treino A na última série, às 7h24. A duração vai até ela: cerca de 1h04, aproximada.** |
| depois do fecho por inatividade, na abertura seguinte | **Fechei o Treino A de ontem na última série.** · **6h20 → 7h24 · cerca de 1h04, aproximada** · **Está certo** / **Corrigir o fim** |

**Quatro decisões de palavra embutidas aí, e cada uma tem razão:**

1. **"Encerrar" e não "finalizar".** O app usa as duas: o botão diz
   `finalizar` e o toast diz `encerrado` (conferi os dois em
   `src/ui/telas/treino.jsx` e `encerraDeVerdade`). Uma palavra só, e é
   "encerrar", porque é a que o desenho, a frente 1, a frente 2 e C4 já usam, e
   porque "finalizar" tem jeito de formulário (V7).
2. **"o fim é agora, 7h31" antes do toque.** É V4: o que o toque grava, com o
   número, antes. E é a frase que corrige a linha errada do desenho.
3. **"Encerrei" na primeira pessoa do app.** V8: encerrar é ato do registro, e o
   app pode dizer "eu" sobre isso. A frase de hoje — *"Treino A encerrado · 1h11
   · 8 exercícios"* — é passiva e esconde o agente.
4. **"aproximada" nos dois fechos automáticos, e nunca no manual.** V3: a
   duração que vai até a última série é estimativa, porque ninguém mediu o que
   houve depois dela (F152). A do toque não é.

**E "já parei" fica como está**, na voz dele, duas palavras, e é um dos melhores
rótulos do app de hoje (`src/ui/instrumento/faixasessao.jsx`, conferi). O par
**"continuo treinando" / "já parei"** também: as duas são declarações dele sobre
um fato, que é exatamente o que V8 reserva para a primeira pessoa dele.

### 7.8 · Os sete becos, e o que cada um passa a dizer

A frente 2 mediu: `data-a="beco"` oito vezes, **sete sem `disabled`**, nenhuma
com ramificação. *"Recebem foco, escalam no toque e não fazem nada e não dizem
nada."* Três deles — "Máquina ocupada", "Dor", "Pular" — ganham estado acima. Os
outros quatro ficaram sem palavra em lugar nenhum:

| beco | o que ele é | o que passa a dizer |
|---|---|---|
| **Ver o aparelho** (cartão do exercício) | a foto da máquina, que pode não existir | se existe: abre a foto. Se não: **Nenhuma foto desta máquina neste aparelho.** + **Fotografar o aparelho** (F224) |
| **Nota do treinador** (cartão do exercício) | a orientação de execução | abre a folha com a frase dele, atribuída. Se não houver: **o botão não existe** — V1: o app não inventa nota sem autor |
| **Histórico** (cabeçalho de Corpo) | a leitura ao longo do tempo | passa a **Evolução** (§1.7) |
| **Outro dia** (Corpo) | lançar peso com data passada | **Peso de outro dia** · e dentro: **Nunca uma data futura: o dia ainda não aconteceu.** (é o que `poeComidaNoDia` e o seletor de data do peso já recusam) |
| **o botão de tipo de dia** (Agora) | trocar treino/descanso | **Dia de treino, por palpite · mudar** (é a frase de C4, §10 dela) |

**E a regra que fecha a seção, e ela vale para os 1.069 usos de ícone que a
frente 4 contou:** **nenhum controle existe sem rótulo, e nenhum rótulo mente
sobre o que o toque faz.** Um botão que não faz nada é pior do que um botão
desabilitado, porque desabilitado se anuncia. **Se não há o que dizer, o botão
não existe** — e esta é a única frase deste documento que manda tirar um
controle da tela.

---

## 8 · Corrigir no lugar

Nasceu no protótipo (descoberta 4) e **não existe em nenhum dos oito HTML**, o
que quer dizer que ninguém mediu nada dele (frente 2 §5). As palavras abaixo são
as primeiras.

### 8.1 · O rótulo do número guardado, que já está certo e precisa sobreviver

```html
<button class="cellb" aria-label="Série 3: 55 por 9 repetições. Tocar para corrigir">55 × 9</button>
```

(`prototipo.html`, conferi.) **O rótulo diz o valor e o que o toque faz**, que é
V6 inteira, e a frente 2 avisou que *"numa reescrita de componente, esse rótulo é
a primeira coisa que se perde"*. **Fica, com uma emenda:** "por" vira "vezes"
quando o número é carga, porque "55 por 9" se ouve como razão e "55 quilos vezes
9 repetições" é o que está escrito. O padrão:

> **"Série 3: 55 quilos, 9 repetições. Tocar para corrigir."**

Unidade por extenso, porque número abreviado não se lê em voz
(`04-voz.md` §9, obrigação 1).

### 8.2 · O título e o que ele diz do estado

| onde | o que está escrito | por quê |
|---|---|---|
| título da correção | **Corrigir a série 3** | V6: o verbo e a coisa |
| subtítulo | **guardada: 55 kg × 9 · às 6h52** | V2: o que está no disco, com o instante. É `d.at`, que a correção não toca (`corrigeSerie` não mexe nele, conferi pela frente 2) |
| cabeça da régua | **Repetições · um toque corrige** | O rótulo diz o que o toque faz, e **não** "um toque guarda", que é o da primeira gravação |
| saídas | **Voltar** · **Apagar esta série** | "Apagar" é família "pare" (§3.3), e fica longe dos números (F28) |
| nunca | "Salvar" · "Confirmar correção" · "Cancelar" | V2; e não há lote a cancelar |

### 8.3 · O estado novo: o valor guardado marcado "agora", ao lado da "última"

A régua ganha um segundo estado — `.rep.now` em tinta cheia com o `<small>`
dizendo "agora", e `.rep.last` com borda de acento dizendo "última" (conferi as
três regras). **A frente 2 achou o defeito e eu mudo a resposta dela, com a
conta.**

**O defeito, dela:** no caso mais comum o valor guardado é igual ao da última, e
aí o mesmo botão recebe as duas classes. O ternário
`(v===ref && marca ? marca : (atual!=null && v===atual ? 'agora' : ''))` faz a
**palavra** ganhar ser "última"; o CSS, com `.rep.now` depois de `.rep.last`,
faz a **pintura** ganhar ser a de "agora". *"O botão fica pintado como o valor
guardado e rotulado como a referência."* O requisito dela: a palavra passa a ser
**"agora, igual à última"**.

**Conferi se cabe, e cabe mal.** `.rep` é `width: 54px; height: 64px`, com o
número a 26 px e `.rep small` a 11 px peso 600, `margin-top: 3px` (conferi as
três). **Conta:** 54 px de largura a 0,58 em dão **8,5 caracteres por linha**;
"agora, igual à última" tem 21 e pede **três linhas**. Em altura: 26 do número +
3 de margem + 33 de três linhas = **62 dos 64 px**. Cabe — **no limite** — e são
três linhas de 11 px embaixo de um número de 26 px numa caixa de 54 px.

**A minha resposta, e ela é mais barata:** **a palavra concorda com a pintura, e
o segundo fato sai do botão.**

| caso | o `<small>` | por quê |
|---|---|---|
| é a referência | **última** | 6 caracteres, uma linha |
| é o valor guardado | **agora** | 5 caracteres, uma linha |
| é os dois | **agora** | a pintura de `.rep.now` é a que aparece; a palavra tem de dizer o que a pintura diz, senão o botão mente para quem olha **e** para quem ouve |

**E o fato que sai do botão vai para onde já há espaço**, na frase de
confirmação, que a frente 2 já exige que seja anunciada (§1.3, R6 dela):

> **Corrigi a série 3: 55 kg × 9, igual à última.**

**Por que isto é melhor do que a resposta dela, em três linhas:** o botão fica
com uma palavra de uma linha, a contradição entre pintura e palavra morre, e o
"igual à última" é dito onde ele cabe **e** onde ele é mais útil — na frase que
é lida depois do toque, e não no alvo que se procura antes dele. A informação
não se perde: a linha "Última" da tabela está logo acima, e é `<td>` de texto
(conferi pela frente 2 §5.1).

**E "Corrigi", não "Guardei".** O protótipo já troca a palavra
(`S.corrigida` troca "guardada" por "corrigida" em `zonaDepois`, pela frente 2
§5.4), e a razão é de dado: guardar de novo soa como série nova, e série nova
reiniciaria o descanso — que é justamente o que corrigir **não** faz.

### 8.4 · As quatro coisas que corrigir não muda, e as quatro têm frase

A frente 2 escreveu as quatro invariantes (§5.4 dela). **Cada uma é um jeito de a
correção mentir, então cada uma precisa de uma frase que ninguém tenha de
procurar:**

| invariante | o que está escrito, e onde |
|---|---|
| o horário não muda | **às 6h52**, no subtítulo da correção, sem palavra nenhuma a mais. O instante é medição; o valor é declaração — e deixar o horário visível é o que diz isso sem explicar |
| o descanso não reinicia | **O descanso continua de onde estava.** · na própria tela da correção, uma linha. O desenho diz "o horário não muda", que é a invariante 1 e não esta |
| não reabre sessão nem mexe na rotação | **Esta série é de 21/09. Corrigir não reabre aquele treino.** · só aparece quando a série corrigida é de outro dia |
| a tela diz que foi correção | **Corrigi a série 3: 55 kg × 9.** · §8.3 |

**E a frase que o defeito vivo obriga.** A frente 2 achou que a regra "corrigir
não reinicia o descanso" se apoia em `view.fired[tag]`, que é memória e nunca
disco, e que **reabrir o app e corrigir dispara um descanso para uma série que
acabou minutos antes** (§5.3 dela). **Enquanto esse defeito existir**, a frase
"O descanso continua de onde estava" é **falsa depois de reabrir o app** — e uma
frase falsa é pior do que nenhuma.

> **Requisito de ordem, e é o único deste documento:** a frase "O descanso
> continua de onde estava" só entra na tela **depois** de a regra passar a ser
> derivada do dado, como a frente 2 especificou. Antes disso, a tela não diz
> nada sobre o descanso na correção — e o caso de teste que falta
> (*"corrigir uma série depois de reabrir o app não inicia descanso"*) é o que
> libera a frase.

---

## 9 · A saída da sessão — três saídas, e elas dizem três coisas

A frente 1 separou as três e disse que precisam de palavras diferentes (§4.5
dela). As três fazem coisas diferentes com **duas** coisas — o modo e a sessão —
e é essa a distinção que as palavras têm de carregar:

| saída | o que ela fecha | o que ela deixa aberto |
|---|---|---|
| **a seta** do cabeçalho | o **modo** | a **sessão** |
| **o Voltar do sistema** | **uma camada** — a folha, ou o destino, ou o modo | tudo o resto |
| **encerrar** | a **sessão** | o modo, que então não tem mais o que mostrar |

### 9.1 · A seta

| onde | o que está escrito |
|---|---|
| o rótulo acessível | **Voltar ao Agora, deixando a sessão aberta** |
| o que aparece ao sair | a faixa, com **treino A em andamento** + o exercício (é o que o app já tem, `FaixaDaSessao`, conferi) |
| o rótulo acessível da faixa | **voltar ao treino A: Pulldown unilateral, série 2** (é o que o app já monta, conferi) |

**O rótulo do desenho está certo e fica inteiro**, e a segunda metade é a que
importa: *"deixando a sessão aberta"*. Sem ela, uma seta num cabeçalho de treino
se lê como desistir do treino — e o protótipo achou que o defeito mais básico de
todos era não ter saída nenhuma (`prototipo.md`, descoberta 1).

**Uma colisão que eu registro e não conserto aqui:** o rótulo diz "Agora" e a
régua da correção diz "agora" no `<small>` (§8.3). Para quem ouve, as duas
palavras aparecem na mesma tela com dois sentidos. **A régua da correção e a seta
não são tocadas uma depois da outra**, então a colisão é de vocabulário e não de
leitura — mas ela existe, e se um dos dois tiver de mudar, **muda a da régua**,
porque a seta é a única saída visível do modo e o nome do destino não pode ser
aproximado.

**E uma coisa que a frente 2 achou conferindo o alcance, e que muda a frase "a
única saída":** o gesto de borda existe e funciona —
`src/ui/navegacao.js` foi escrito por causa dele (§11, item 4 dela). A seta é a
única saída **visível**, que é como a frente 1 a descreveu, e isso é exato.
**Nenhuma palavra do produto pode afirmar que ela é a única saída**, porque não
é.

### 9.2 · O Voltar do sistema

**Não tem palavra, e é por isso que ele está aqui.** Ele é botão no Android e
gesto de borda no Safari, e `src/ui/navegacao.js` resolve o comportamento por
camada. **O que a frente 3 escreve sobre ele é uma proibição:**

> **Nenhuma tela do produto escreve instrução sobre o Voltar do sistema.** Não
> existe "use o Voltar para sair", não existe "o Voltar fecha esta folha", não
> existe seta desenhada imitando o do sistema.

Duas razões: o gesto não existe em todo aparelho da mesma forma, e uma instrução
que depende do aparelho está errada em metade deles. E porque uma folha que
precisa explicar como se fecha está mal desenhada — o que ela precisa é de uma
saída visível, e a saída visível tem palavra própria.

**A exceção, e é uma:** a folha que **sobe** ao abrir (decisão 14) ganha uma
palavra para o gesto de baixar, porque esse gesto é do app e não do sistema:
**"Puxe para baixo para voltar à série"** — a frase de C4 (§5 dela, C · M1 · 7),
inteira, porque ela nomeia o destino e não só o gesto.

### 9.3 · Encerrar

As palavras estão em §7.7, com os quatro fins. **O que esta seção acrescenta é a
razão de encerrar não ser uma saída do modo:** encerrar mata a sessão e o modo
fica sem assunto, então a tela seguinte é o Agora — e é lá que a confirmação
aparece (**"Encerrei o Treino A · 6h20 → 7h31 · 1h11 · 8 exercícios"**).

**E a frase que não existe em desenho nenhum e que a arquitetura obriga:** se ele
encerrar com a folha do dia aberta, ou com a correção aberta, a camada fecha
junto. **A tela diz o que fechou:**

> **Encerrei o Treino A. Fechei a folha do dia sem registrar nada.**

É V2 pelos dois lados: o que guardou e o que não guardou.

### 9.4 · O que nenhuma das três diz

| nunca | por quê |
|---|---|
| "Salvar e sair" | Não existe estado "não salvo" — é doutrina do fonte (o comentário acima de `abreSessao`, conferi pela frente 1 §4.5), e `save()` é chamada em 59 lugares |
| "Sair sem salvar" | Idem, e é pior: afirma uma perda que não acontece |
| "Tem certeza que quer sair?" | V4. E sair não custa nada |
| "Treino cancelado" | Nada é cancelado: ou a sessão existe e fica, ou não existe e é descartada, e descartar tem palavra própria (§7.7) |

---

## 10 · A bioimpedância, e os dois pesos que convivem de propósito

**O que ele decidiu** (5.a' P3 e 5.a''', conferi o registro literal): **cinco
campos, quatro deles obrigatórios** — peso (kg), massa muscular esquelética (kg),
massa de gordura (kg), percentual de gordura (%), e água corporal total (L,
opcional). E **o peso da bioimpedância é outro registro**, separado da pesagem da
manhã: *"ele pesa numa balança e mede na outra, em horas diferentes. Os dois
convivem de propósito."*

**Três coisas que isto derruba no desenho, e eu as digo antes de escrever:**

1. **"Treze números" cai para cinco.** A frente 1 já achou que o desenho tem
   **quinze** campos dizendo treze, e que o próprio desenhista achou o erro
   (`09-frente1-lugares.md` §7, item 7; `prototipo.md`, descoberta 8).
2. **"Nada aqui é obrigatório" cai.** É a frase do estado 7 de `corpo.html`
   (conferi: *"Deixe em branco o que a sua balança não mostra. Nada aqui é
   obrigatório, e o que ficar vazio não vira zero."*) e é a recusa 4 da direção
   D. Quatro campos passam a ser obrigatórios.
3. **"Massa magra" cai, e é outro número.** O desenho pede **massa magra**; a
   decisão dele pede **massa muscular esquelética**. São dois números diferentes
   na mesma balança — a magra inclui osso, água e órgãos; a muscular esquelética
   não. **A palavra dele vence** (V7), e não é sinônimo: se a tela escrever
   "massa magra" e ele transcrever o número da massa muscular esquelética, a
   série fica errada para sempre. (Na resposta longa anterior, 14.11, ele havia
   dito "massa magra"; na resposta que **decidiu os cinco campos**, 5.a' P3, ele
   disse "massa muscular esquelética". Vale a última.)

### 10.1 · A folha, com o texto exato

| onde | o que está escrito | o que isto diz que a tela sozinha não diria |
|---|---|---|
| título | **Bioimpedância** | É a palavra dele (P6), por extenso, e C4 já a fixou (V7) |
| procedência | **uma vez por mês · anterior: 03/09** | D2, e o desenho |
| a instrução, na primeira vez | **Os cinco números saem da balança de bioimpedância, não da balança de casa.** | É a frase que a decisão dos dois pesos obriga, e §10.2 |
| a instrução, nas seguintes | **Os quatro números do mês passado estão no lugar. Toque só no que mudou.** | A premissa do desenho, com "treze" virando "quatro". Composição corporal muda devagar, e redigitar cinco números todo mês é o fluxo que ele recusa |
| campo 1 | **Peso** · **kg** · **o que esta balança mostrou** | §10.2 |
| campo 2 | **Massa muscular esquelética** · **kg** | A palavra dele |
| campo 3 | **Massa de gordura** · **kg** | A palavra dele |
| campo 4 | **Percentual de gordura** · **%** | A palavra dele |
| campo 5 | **Água corporal total** · **litros** · **pode ficar vazio** | "litros" por extenso: "l" minúsculo ao lado de um número é o pior caractere da pilha do sistema (§2.1, R4) |
| a variação, ao lado de cada campo | **era 17,4 · −0,6** | Do desenho, e é `fmtSig` (conferi: arredonda antes de decidir o sinal, "senão −0,04 vira −0,0") |
| a variação, quando não mudou | **era 3,1** · sem número de variação | Do desenho ("era 5 · sem mudança" passa a só "era 5": "sem mudança" é a ausência de diferença, e escrevê-la é afirmar uma medida de zero) |
| o teclado | **próprio, com vírgula** | F63: a vírgula é o separador decimal e um campo `number` a descarta |
| o obrigatório | **Quatro números são obrigatórios. A água corporal total pode ficar vazia — e vazia não é zero.** | Substitui "Nada aqui é obrigatório". V3: vazio não vira zero |
| o botão | **Guardar os cinco** | §10.3 |
| nunca | "IMC" · "idade metabólica" · "gordura visceral" · "por segmento" | Saíram na decisão dele. Um campo que a tela pede e o dado não guarda é um número que ele transcreve para o nada |

**E o que a tela diz quando falta um dos quatro obrigatórios:**

> **Falta a massa muscular esquelética. Os cinco números são uma medição só: com
> quatro, a série do mês fica sem comparação.**

**Não é "campo obrigatório".** A frase diz **por que** ele é obrigatório, que é a
única coisa que torna a exigência razoável num fluxo que ele faz sentado, uma vez
por mês, transcrevendo de um visor.

### 10.2 · Os dois pesos, e a frase que impede de ler como erro

**O problema de palavra, dito claro:** a tela de Corpo mostra **dois pesos do
mesmo dia, com números diferentes**. Sem uma palavra, isso se lê como duplicação
ou como erro de digitação — e o reflexo é apagar um dos dois, que é destruição
(§3.3).

**O que os separa no dado, conferido:** `veredito` recebe
`body: { peso: Marca[]; cintura: Marca[] }` e a média da semana sai de
`mediasSemanais(body.peso)` (conferi as duas em `src/dominio/corpo.ts`).
**Então a regra do nutricionista lê a pesagem da manhã, e só ela.** O peso da
bioimpedância é um dos cinco números daquela medição; ele não entra em
`mediasSemanais`, não entra em `taxasSemanais` e não chega ao veredito.

**A frase, e é a mais importante desta seção:**

> **O peso da manhã é o que a regra do nutricionista lê. O peso da balança de
> bioimpedância fica com os outros quatro números dela, e não entra na média da
> semana.**

**Duas frases curtas, e a segunda é a que desarma o reflexo de apagar.** Ela não
diz "não é erro" — dizer "não é erro" sugere que poderia ser. Ela diz o que cada
número faz, e a diferença deixa de ser um problema.

**E os rótulos mudam, porque "Peso de hoje" deixou de distinguir.** C4 escreveu
"Peso de hoje" e o app e o desenho usam variações disso. **Com dois pesos do
mesmo dia, "de hoje" não separa nada:** os dois são de hoje.

| em Corpo | o rótulo | a procedência |
|---|---|---|
| a pesagem da manhã | **Peso da manhã** | **da balança de casa, em semi-jejum, antes do treino** |
| o peso da bioimpedância | **Peso na bioimpedância** | **da outra balança · 01/10, 21h28** |

**A procedência da primeira é literal de P6** (*"eu me peso sempre antes de
treinar, de manhã, em jejum. Em semi-jejum, né?... com praticamente a mesma
roupa"*) e do desenho (*"da balança de casa, de manhã, antes do treino"*). V7: é
a descrição dele do próprio ato.

**E nos outros lugares onde o peso aparece, o rótulo segue:** em Agora, o convite
da manhã é **"Peso da manhã · sem marca"**; em Semana, a média é **"Média da
semana · 73,5 · 4 pesagens da manhã"**. **O qualificador vira parte do nome** nos
três lugares, porque o dia em que ele registra os dois é o dia em que o nome sem
qualificador mente.

**Isto renomeia uma palavra que funcionava, e eu digo por quê.** V7 manda não
trocar palavra que funciona. "Peso de hoje" funcionava enquanto havia um peso por
dia — e `S.body.peso` aceita **uma medida por dia**, substituindo a do mesmo dia
(`tests/fluxo/corpo.test.js`, 25 casos, pela frente 1). A decisão 5.a''' cria um
segundo peso no mesmo dia, de outra balança. **A palavra não parou de ser bonita:
parou de ser verdadeira.**

### 10.3 · O botão "Guardar", que contraria V2 — e por quê

**V2 recusa um botão "Salvar" por nome:** *"um botão 'Salvar' (o toque é a
gravação)"*. O desenho da bioimpedância tem **"Guardar"** no cabeçalho (conferi
em `corpo.html`, estados 6 e 7), e **eu o mantenho.** Digo a regra e a razão, em
vez de passar por cima:

**As cinco gravações sem botão do produto são todas de uma coisa só:** uma série,
uma refeição, um copo, um peso, uma porção. Um toque, um dado, e o dado faz
sentido sozinho.

**A bioimpedância não é isso.** Os cinco números são **uma medição** — saíram do
mesmo visor, no mesmo minuto, da mesma balança —, e quatro deles são
obrigatórios porque a série do mês só compara se os quatro estiverem lá
(§10.1). Gravar campo a campo guardaria uma medição de três números, que é um
registro que nenhuma leitura usa. **Aqui o lote é o dado, e não um atraso
inventado.**

**O que o rótulo tem de fazer para não ser o "Salvar" que V2 recusa:** dizer
quantos, e o que entra.

> **Guardar os cinco** · e, depois: **Guardei os cinco números de 01/10 neste
> aparelho.**

E a recíproca, que é o que torna a exceção honesta: **sair da folha sem tocar em
"Guardar os cinco" não grava nada, e a tela diz isso antes** —
**"Nada está registrado até você tocar em Guardar os cinco."** É a mesma frase da
folha de pôr em dia (§4.1), com o botão no lugar do toque.

---

## 11 · As frases que nomeiam uma regra

**Esta seção é separada das outras de propósito.** Tudo acima descreve tela: o
que está escrito, e o que isso diz ao dono. **O que está aqui define regra** — se
uma destas frases mudar, o comportamento do produto muda com ela, e nenhuma delas
é decisão de quem escreve palavras.

### 11.1 · As oito frases, e só estas

| # | a frase | a regra que ela define | onde |
|---|---|---|---|
| 1 | **Cada mudança vence quando aquele treino voltar. Se você não decidir até lá, ela fica como só daquele dia.** | O prazo da mudança do dia é por **posição**, não por data; e o vencimento resolve para "só daquele dia", não para permanente nem para o silêncio | §5.3 |
| 2 | **Dá para fazer entrar no Treino B até a próxima vez dele.** | O desfazer do vencimento tem prazo, e o prazo é mais um retorno daquele treino (decisão 8) | §5.6 |
| 3 | **A segunda passa a contar para a regra do nutricionista: 3 dias conhecidos nos últimos 14. A regra pede 11.** | Um dia com **uma** marca qualquer é dia conhecido — inclusive uma marca de "não comi". É o portão `MIN_REGISTRADOS = 11` e é a definição de adesão | §4.3 |
| 4 | **Sem resposta, a segunda conta como se tivesse seguido o plano.** | Com a pergunta do fora do plano deixando de bloquear, o silêncio empurra o dia para `aderencia: 'plano'` — o lado que **infla** a adesão | §4.4 |
| 5 | **O almoço fica desconhecido. A segunda continua contando, com uma refeição de cinco que a regra não sabe ler.** (versão A) **ou** **Sem saber quanto foi o almoço, a segunda inteira deixa de contar para a regra: 3 dias conhecidos passam a 2.** (versão B) | O que um "não sei" por refeição faz com a adesão do dia. **As duas versões estão escritas porque a regra não existe ainda** | §4.5 |
| 6 | **Taxa: cumprida** · **Força: cumprida — não está subindo** · **Adesão: falta — 1 dia de 14** | Os três portões da regra do nutricionista, e qual condição cada um verifica. "Força cumprida" significa força **não** subindo, e a frase tem de dizer as duas metades | §6.2 |
| 7 | **Enquanto a adesão não chega a 11, o veredito não muda, por mais pesagem que entre. A tela não vai pedir isso de novo em outro lugar.** | Uma promessa sobre o produto: o portão da adesão cobra num lugar só. Se não for cumprida, a frase sai | §6.3 |
| 8 | **O peso da manhã é o que a regra do nutricionista lê. O peso da balança de bioimpedância fica com os outros quatro números dela, e não entra na média da semana.** | Qual dos dois pesos alimenta `mediasSemanais` e o veredito — e, por consequência, qual dos dois decide comida | §10.2 |

**Três frases que parecem nomear regra e não nomeiam**, para a lista não crescer
sozinha:

- **"Pulada não é esquecida: ela fica escrita como pulada e não volta a ser
  pedida."** — descreve o que o dado já faz (`estadoEx` devolve `'pulado'`
  separado de `'nada'`, conferi), e a reversibilidade já é regra testada
  (`tests/fluxo/ciclo.test.js`, 18 casos). Nada a decidir.
- **"Deload desligado. As 10 séries voltaram… e as 2 que você já registrou
  ficam."** — é a decisão 7 dita; a regra já foi decidida por ele.
- **"o fim é agora, 7h31"** — descreve `fechaSessao('manual')`, que já é o
  código.

### 11.2 · O que sobe à mesa dele, e é só isto

| o que | onde | por que sobe |
|---|---|---|
| **Qual é a adesão de um dia com uma refeição em "não sei"** — versão A ou versão B | §4.5 | A decisão 2 moveu "Não sei" para a refeição e **não disse o que isso faz com o dia**. Peso 0 na refeição desconhecida subestima a adesão; peso 1 a infla, e inflar adesão é o mecanismo exato do corte errado de F292. A pergunta é de regra do nutricionista, não de palavra. **Escrito enquanto isso: a versão B**, porque é o que o dado faz hoje |
| **Para que lado o silêncio cai, na pergunta do fora do plano** | §4.4 | A decisão 4 tirou o bloqueio. Com o bloqueio, a pergunta nunca ficava sem resposta; sem ele, fica — e `aderencia` ausente é `'plano'`. **Isto é novo: nasceu da decisão dele, e nenhuma frente o nomeou** |
| **Se "Evolução" volta como nome do destino de leitura em Corpo** | §1.7 | É palavra dele, dita duas vezes (P6, P8), e a partição de Evolução em Corpo e Semana a apagou do produto: zero ocorrências nas sete telas da segunda rodada. V7 manda que a palavra dele vença a minha, então **o escrito é "Evolução"** — mas trocar "Histórico" por ela é troca de uma palavra dele por outra, e isso é dele |
| **Se a promessa "a tela não vai pedir isso de novo em outro lugar" é cumprível** | §6.3 | É a única frase do material que promete o que o produto **não** vai fazer. Se o portão da adesão cobrar em Agora também, a frase passa a ser falsa e sai |
| **"Massa muscular esquelética" contra "massa magra"** | §10 | Ele disse as duas, em respostas diferentes: "massa magra" na resposta longa (14.11) e "massa muscular esquelética" na que decidiu os cinco campos (5.a' P3). **São dois números diferentes na mesma balança**, não sinônimos. Vale a última, mas se a balança dele mostrar só um dos dois, a tela está pedindo o número errado — e isso estraga a série para sempre |

**E uma coisa que eu não levo à mesa dele**, porque não é dele: a decisão 9 diz
que, se a régua reprovar a medição, ela vai para os botões fixos da Direção C. **A
instrução me pedia as duas versões das palavras conforme o controle. Não há duas
versões:** o rótulo da régua é **"Repetições · um toque guarda"** e o de um botão
fixo é **"Repetições · um toque guarda"**, porque V6 manda que o rótulo diga o
que o toque grava, e o toque grava a mesma coisa nos dois controles. O que muda
com o controle é **quantos valores aparecem**, e isso é geometria. **As palavras
são as mesmas, e isto é resposta e não omissão.**

**O único texto que muda com o controle** é o da faixa prescrita, porque na régua
ela é um sublinhado e num conjunto de botões fixos ela é uma legenda:

| controle | o que está escrito |
|---|---|
| régua rolável | **alvo 8–12**, sob o número, e a faixa sublinhada |
| botões fixos da C | **alvo 8–12 · os seis valores da faixa** |

---

## 12 · Onde eu mudei a palavra do desenho, e o que não caiu de pé

### 12.1 · A lista curta, para o curador conferir sem reler as tabelas

| era | passa a ser | regra e prova |
|---|---|---|
| "Agora · no plano às 16h00" (sobrancelha do cartão, `momento-2.html`) | **no plano às 16h00** | A palavra "agora" fazia quatro trabalhos; o da sobrancelha é o único que repete o nome da aba (§1.1) |
| "Histórico" (cabeçalho de Corpo) | **Evolução** | V7: a palavra dele, apagada pela partição (§1.7) |
| "Fora" (botão da folha de pôr em dia) · "Fora do plano" (C4) | **Outra coisa** | Com o quinto botão a fatia cai a 50,4 pt, e "Fora do plano" pede três linhas (§4.2) |
| "Tudo · Metade · Fora · Não sei" (quatro botões) | **Tudo · Metade · Outra coisa · Não comi · Não sei** | Decisão 1, e os cinco completam "comi…" na voz dele (V8) |
| "Responda a pergunta para guardar" | **sai** | Decisão 4: a pergunta deixa de bloquear |
| "Foi só naquele dia" / "Virou permanente" | **Fica só naquele dia** / **Entra no Treino D** | V6: o rótulo diz o que o toque grava, e os dois estavam no passado (§5.4) |
| "levar para o oficial" (`src/ui/telas/decisao.jsx`) | **Entra no Treino D** | V7: "o oficial" é vocabulário interno |
| "vence 05/10 · em 4 dias" | **vence quando o Treino A voltar · faltam 2 treinos** | F81: a sequência avança pela ordem. Uma data é previsão, e V3 obriga a marcá-la (§5.3) |
| "deltoide lateral passa de 12 para 13 séries **na semana**" | **…na rotação** | `seriesOficiais` soma sobre `rot()`, e `ROT_BASE` tem seis posições. "Semana" é paráfrase (§5.5) |
| "adicionou Leg press" · "removeu Pullover" · "mudou Leg press de posição" (`textoMod`) | **Leg press: entrou no dia** · **Pullover em máquina: saiu do dia** · **Leg press: feito antes, fora da ordem** | V8: os atos dele não se narram em terceira pessoa. E os sete ramos passam a ter uma gramática só (§5.2) |
| "Observar" (três situações diferentes, `veredito`) | **Não mexer: falta a sua leitura das fotos** / **Não mexer: peso parado com carga subindo** / **Não mexer: uma semana sozinha não decide** | Duas das três não têm nada a fazer e uma tem; o título não separava (§6.1) |
| "Manter como está" | **Não mexer: a taxa está na faixa** | V1: a regra decide mexer no plano, não o que ele mantém (§6.1) |
| "Faltam dados" | **Não mexer: faltam pesagens** | Gramática única, e diz quais dados |
| "Ver" (botão do portão da força) | **Ver a força** | V6: o rótulo diz a coisa |
| "Elevação lateral na máquina ocupada" (título) | **Máquina ocupada** + o exercício no subtítulo | C4 já tinha feito a troca (§10 dela) |
| "finalizar" (botão, `src/ui/telas/treino.jsx`) | **Encerrar o treino** | O app diz "finalizar" no botão e "encerrado" no toast; uma palavra só (§7.7) |
| "Treino A encerrado · 1h11 · 8 exercícios" | **Encerrei o Treino A · 6h20 → 7h31 · 1h11 · 8 exercícios** | V8: a passiva esconde o agente |
| "Lendo o registro deste aparelho. Não usa rede." | **…Não precisa de rede.** | O app **pode** usar rede para replicar; o que é verdade é que não depende dela (F72) |
| "era 5 · sem mudança" (bioimpedância) | **era 5** | "Sem mudança" afirma uma medida de zero onde há ausência de diferença |
| "Nada aqui é obrigatório" (bioimpedância) | **Quatro números são obrigatórios. A água corporal total pode ficar vazia — e vazia não é zero.** | Decisão 5.a' P3 |
| "massa magra" (bioimpedância) | **Massa muscular esquelética** | É outro número, e é a palavra da decisão dele (§10) |
| "Peso de hoje" | **Peso da manhã** | Com dois pesos no mesmo dia, "de hoje" deixou de distinguir (§10.2) |
| "KCAL" · "PROTEÍNA" · "CINTURA" (`.ins-label`) | **kcal** · **proteína** · **cm** | Caixa alta era a mono fazendo estrutura em cima de uma unidade (§2.1, R4) |
| "pendente", "pendência", "a fazer" como nome da lista | **Esperando decisão** | V5, e é a palavra do desenho |

### 12.2 · As palavras verdadeiras que não cabem — Lista A, e são quatro

Mesma convenção de C4: palavras dentro das regras, que eu não encurto, e que a
conta diz que não entram no espaço que o desenho dá.

| # | a string | onde | a conta | por que eu não encurto |
|---|---|---|---|---|
| A1 | **"Dor muscular difusa no dia seguinte é normal; pontual no cotovelo, no ombro da frente ou no joelho abaixo da patela é sinal de tendão. — treinador"** (147 car., F20) | §7.4, a folha de Dor | É a A6 de C4, e eu herdo a conta dela: o subtítulo da folha é de uma linha a 13–14 px, cerca de 60 caracteres | É o que separa "dói porque treinei" de "dói porque é tendão", é frase do treinador (V1), e dita depois do toque não serve de nada |
| A2 | **"Fora do plano"** (13 car., a decisão de C4 em §10 dela) | §4.2, a folha de pôr em dia com cinco botões | A fatia cai de 69 pt para 54,4 (50,4 úteis) com o quinto botão; a 13 px em peso 700 são 6,7 caracteres por linha, e "Fora do plano" pede **três** — uma delas sendo o artigo "do" sozinho | Não encurto para "Fora", que V7 recusa. **Resolvi trocando a palavra** por "Outra coisa", que cabe em duas linhas e diz o mesmo dado — então esta é a única da lista que tem saída, e a saída está escrita |
| A3 | **"Massa muscular esquelética"** (26 car.) | §10.1, a folha de bioimpedância | **Não medi**: não abri o CSS das linhas de campo de `corpo.html`, e é o rótulo de campo mais longo do produto | É a palavra da decisão dele e **não é sinônimo de "massa magra"** (§10). Encurtar aqui é pedir outro número |
| A4 | **"Prescrição"** a 320 px | §1.6, a barra dos cinco lugares | A fatia cai a 64 pt; a 11 px em peso 600 o nome dá 63,8 pt — na borda em 100%, e três linhas no degrau de 125% | Nenhum nome mais curto cobre as duas prescrições sem colidir com dado de dentro (§1.5). **A quebra em duas linhas é a saída, e custa 1,5 pt de altura de barra** |

**E duas onde o espaço aceita a quebra**, e por isso não contam: "Outra coisa",
"Não comi" e "Não sei" em duas linhas na fatia de 50,4 pt da folha (§4.2); e
"igual à última" em duas linhas se alguém insistir em pô-la no botão da régua —
que é justamente o que eu recusei (§8.3).

### 12.3 · As quatro vezes em que eu contrario uma regra de voz, reunidas

| # | a regra | o que ela recusa | o que eu escrevo, e por quê |
|---|---|---|---|
| 1 | **V4** | *"Esta ação não pode ser desfeita."* | **"Isso não tem volta"** fica, nas nove frases de "pare". V4 recusa a frase **sozinha** — um diálogo que afirma irreversibilidade sem dizer o custo. No app ela nunca está sozinha: vem com o número do que vai embora. E com a decisão 13 tirando "destrói dado" da cor, **ela passa de redundância a canal** (§3.1) |
| 2 | **V7**, na decisão de C4 | "Fora" abreviado; a decisão dela foi **"Fora do plano"** | **"Outra coisa"**, porque com o quinto botão "Fora do plano" pede três linhas numa fatia de 50,4 pt. Não é abreviação: o tipo diz *"'fora' é 'comi, mas não foi isto'"*, e "comi outra coisa" é isso por inteiro (§4.2) |
| 3 | **V7** | "não troque palavra que funciona só para parecer nova" | **"Peso da manhã"** no lugar de **"Peso de hoje"**. Não é para parecer nova: a decisão 5.a''' cria um segundo peso no mesmo dia, de outra balança, e "de hoje" deixou de distinguir os dois (§10.2) |
| 4 | **V2** | *"um botão 'Salvar' (o toque é a gravação)"* | **"Guardar os cinco"** fica na bioimpedância, e só lá. Os cinco números são **uma medição**, quatro são obrigatórios, e gravar campo a campo guardaria uma medição de três números que nenhuma leitura usa. **Aqui o lote é o dado** (§10.3) |

**Nenhuma outra.** Onde uma palavra deste documento parece contrariar uma regra e
não está nesta lista, ou eu errei ou a regra não dizia o que parecia — e nos dois
casos vale a regra.

---

## 13 · O que eu fui conferir e não bateu

Onde o código ou o registro discorda do que estava escrito, **vale o código**.
Sete pontos, e os quatro primeiros mudam trabalho.

| # | o que estava escrito | o que eu achei |
|---|---|---|
| 1 | "A frente 1 achou cinco afirmações minhas erradas" (o meu briefing) | **Sete.** `09-frente1-lugares.md` §7 abre com *"Sete pontos"* e a tabela tem sete linhas: a caixa de marcar das linhas de refeição (`ehLinhaDeTreino(r)` é `r.id === 'treino'`, não sessão ativa), a conta de volume em quatro lugares e não dois, o `promoPendente` guardando uma mudança, o carregador não escrito no fecho manual, o placar do cardio na aba TREINO, o `view.sessao` de `camadasAbertas` não sendo a sessão ao vivo, e os quinze campos da bioimpedância dizendo treze. **As contas das outras duas batem:** a frente 2 achou **seis** (§11 dela) mais três correções a si mesma, e a frente 4 achou **nove** (§10 dela) |
| 2 | "O deload muda de lugar **como a frente 1 propôs**" (o meu briefing, e o registro das quinze) | **A frente 1 não propôs.** O achado 3 dela diz, literalmente: *"Não é decisão minha: é regra, e sobe com os dois argumentos escritos — o de hoje (frear) e o da D (o raro mora no ⋯, e deload é raro)."* Quem propôs o menu `···` foi a direção D (`03-direcao-D/direcao.md`, tabela de tarefas: "Deload | sessão, menu ⋯"). **Isto importa para as palavras:** a razão escrita no fonte não era "o lugar é ruim", era *"um interruptor que corta metade das séries não deve estar a um toque no meio de uma sessão"* — o lugar **era** o freio. Com ele fora, o freio tem de ser a palavra, e é por isso que o item do menu deixa de ser um interruptor com nome (§7.6) |
| 3 | "os sete estados ruins… o protótipo os deixou como becos desabilitados" (herdado do briefing da frente 2) | **A frente 2 já havia derrubado as duas metades**, e eu confirmei a parte que me toca: para **três** dos sete não existe palavra em desenho nenhum, e **sete dos oito** becos não têm `disabled`. O que eu acrescento é a consequência de palavra: desses sete, **quatro não aparecem em nenhum dos sete estados** — "Ver o aparelho", "Nota do treinador", "Histórico" e "Outro dia" —, e eu escrevo as palavras deles em §7.8, inclusive a única frase deste documento que manda **tirar** um controle da tela |
| 4 | "A frente 2 havia especificado o contrário" sobre a última refeição pré-marcada | **Confirmado, e é mais forte do que isso.** O requisito dela não é só sobre a última refeição: *"Para hoje, a refeição cuja hora passou há menos de 30 minutos fica sem marca"* (§4.4, item 2 dela). A decisão 5 derruba **as duas metades** — a da última refeição e a janela de 30 minutos —, e a segunda não está nomeada no registro das quinze. **Escrevi as palavras só da que ele decidiu** (a última refeição vem pré-marcada); a janela de 30 minutos **continua sem resposta**, e as palavras de §4.1 valem nos dois casos porque elas nomeiam a causa da marca (a passagem do horário), não qual refeição é |
| 5 | "A bioimpedância… as palavras não existem" (o meu briefing, e o plano) | **C4 já tinha escrito parte.** `04-voz.md` §4.2 traz **"Bioimpedância · uma vez por mês"** (com a razão: é a palavra do dono, V7), a pergunta literal da avaliação visual, a validade dela, e os cinco estados da foto. O que faltava eram **os cinco campos e os dois pesos** — e a E2 dela diz, explicitamente, que "quais números entram vai para §12", onde ela o declara não medido. **Não escrevi nada que ela já tivesse escrito**, e os cinco estados da foto e a pergunta da gordura ficam inteiros, dela |
| 6 | "O dono recusou explicitamente linguagem abstrata e metafórica neste projeto" (o meu briefing) | **Não achei a recusa literal dele.** O que o registro tem é a linha de 02/10 de `00-coordenacao.md`: a peça de comparação foi feita *"em linguagem direta: o vocabulário dos designers — lápis, tinta, hachura, visto — foi traduzido para o que acontece na tela, **a pedido dele**"*. É pedido registrado, não proibição escrita. **A régua é a mesma e eu a sigo**; a diferença é que ela não serve de argumento contra outra pessoa |
| 7 | "os portões da semana têm palavras escritas pelo desenhista" (o plano, §2, frente 3) | **Metade. As melhores palavras dos portões estão no domínio, não no desenho.** `veredito` em `src/dominio/corpo.ts` já devolve a prosa de cada saída, com os números que a produziram e a atribuição dentro — *"Mas não há registro suficiente dos últimos 14 dias para saber se o ganho veio da dieta ou de saídas dela. Tirar comida do plano agora puniria os dias em que você seguiu."* **Não troquei uma palavra dessa prosa.** O que era do desenhista eram os títulos e os rótulos dos três portões, e é só isso que eu reescrevi (§6) |

**E o que eu fui conferir e bateu**, para a lista não ser só de divergência: os
cinco nomes da barra no `tabbar()` do protótipo; `PORCOES` com os cinco valores
`0.5, 0.75, 1, 1.25, 1.5` em `src/ui/folhas/refeicao.jsx`;
`ComoFoiARefeicao = 'fora' | 'nao'` com a razão de `'nao'` escrita no tipo;
`aderencia?: 'plano' | 'fora' | 'perdido'` como campo **do dia**;
`diaInterpretavel` recusando o dia `'perdido'` e aceitando qualquer `done`;
`MIN_REGISTRADOS = 11`; `PLANO_ATUAL = 11` com `migraPlano11` sendo a da ceia;
`aguaNaoContada?: 1` com a razão no comentário; `promoPendente: PromoPendente[]`
já como coleção, com `sid` de chave; `resumoMods: string[]` sendo escrito por
`textoMod` nas duas chamadas; os quatro `confirm()` que dizem "Isso não tem
volta"; `delBody` com o estrago delimitado em texto; o par
`'continuo treinando'` / `'já parei'` em `FaixaDaSessao`; e `.ins-label` a 10 px
em mono, caixa alta e `.18em` de tracking, com 76 ocorrências em `src/ui/`.

**Uma correção que eu faço a mim mesmo**, porque é do mesmo tipo das sete de
cima: eu ia escrever que o requisito da frente 2 para o botão da régua
("agora, igual à última") **não cabia**. Fui fazer a conta e cabe — em três
linhas de 11 px, ocupando 62 dos 64 px de altura do botão. **Ele cabe e é ruim**,
que é uma afirmação mais fraca e mais honesta, e é por isso que a minha resposta
em §8.3 se justifica pela leitura e não pela borda.

---

## 14 · O que esta frente não decide, e o que ninguém mediu

**O que ela não decide**, por mandato: os cinco lugares e o fluxo entre eles
(frente 1 — eu só os **nomeio**), o estado e a interação dentro de cada um
(frente 2), e os tokens, a escala, a cor e o movimento (frente 4). Onde eu citei
um token (`--ins-t-corpo-forte`, `--ins-t-meta`, `--ins-tinta-3`), citei o que a
frente 4 já definiu; **não escolhi valor novo nenhum.**

E três coisas que são de palavra e que eu deliberadamente **não** decido:

- **Onde a régua de porções é alcançada da linha da folha** (§4.2). A régua tem
  palavras minhas; o gesto que a abre é da frente 2.
- **Se o rótulo de seção a 15 px cabe nas telas que o usam** (§2.1, R2). São 76
  lugares, e cada um ganha altura. **É olho em tela.**
- **A ordem dos cinco botões da folha** (§4.2). Eu escrevo os cinco rótulos; qual
  vem primeiro é alcance de polegar, e a frente 2 tem o protocolo.

**O que fica para depois, declarado:**

- **Dias não tem desenho** (achado 6 da frente 1) e é onde a folha de pôr em dia
  mora. **Eu escrevi as palavras da folha; a tela que a abre não existe**, e por
  isso o título dela ("Segunda, 05/10") é a única coisa que eu sei que vai estar
  no alto.
- **O destrutivo não tem desenho** (achado 8 da frente 1). **As palavras das nove
  frases de "pare" estão escritas** (§3.3) e o comportamento de hoje é
  `confirm()` do sistema — que `04-acesso.md` já reprovou, porque prende o foco e
  não é descartável sem responder. **As palavras existem antes do painel.**
- **A bancada e a superfície de conflito entre dois aparelhos** não têm lugar nem
  palavra (achado 9 da frente 1). Eu não escrevi nada para elas: sem saber o que
  a tela mostra quando dois aparelhos discordam, qualquer frase minha seria
  invenção.
- **O segundo usuário.** `PRODUCT.md` ainda diz que não existe usuário além de um
  (do plano, §4). **Toda palavra deste documento é para uma pessoa que conhece o
  próprio treino**, e nenhuma delas funcionaria para quem está vendo a
  prescrição pela primeira vez: não há onboarding, não há glossário, e "RIR" e
  "deload" entram sem explicação de propósito (V7).
- **A aula.** `aula.html` tem nove estados e eu **não abri** o conteúdo dela. O
  quadro do box transcrito é a única coisa do produto em monoespaçada por ser
  conteúdo (frente 4 §2.2), e as palavras da aula não são minhas até alguém
  conferir o que já está lá.

**O que ninguém mediu, e esta frente herda sem inventar número:**

- **Nenhuma frase deste documento foi lida por ele numa tela.** O protótipo foi
  tocado por três minutos (`prototipo.md`), e nenhuma das decisões que só
  aparecem em semanas — a lista que vence, o contador dos 14 dias, a frase de
  leitura de volta da folha — tem medida. **Hipótese, não fato**, e isso vale
  para tudo que eu escrevi a partir do protótipo.
- **Se "Prescrição" cabe na fatia da barra**, a 100% e a 125%, e a 320 px. A
  conta está em §1.6 e diz "no limite" no degrau de cima. **Conta, não medida**,
  e a medição é a G da frente 4 — que precisa ser feita **com estes cinco nomes**,
  e não com rótulos de exemplo.
- **Se o rótulo de seção a 15 px em caixa de frase se distingue da prosa a 14 px**
  a um braço de distância, na luz da academia. A frente 4 declarou que a luz da
  academia, o sol, a luva e o magnésio não estão em `01-fatos.md`. **A mesma
  ausência vale para tamanho de letra**, e é o canal que substitui a forma da
  mono (§2.2).
- **Se "Outra coisa" é lido como "comi outra coisa"** sem a cabeça da frase
  presente. A cabeça aparece uma vez, no alto da folha; depois da rolagem, o
  botão está sozinho. **Não medido**, e é a única palavra minha que depende de
  contexto na mesma tela.
- **Se três linhas de 11 px num botão de 54 px são legíveis** — é o que eu usei
  como razão para recusar o requisito da frente 2 em §8.3. A conta diz que cabe;
  **se é legível, ninguém mediu.**
- **Se ele lê a tela a três metros**, que decide se o olho da sessão de fotos
  vira título (§2.1, R3, exceção). C4 já declarou isso não medido (P7 ficou sem
  essa parte).
- **Quantas linhas a tela ganha com os rótulos maiores e quantas perde com os
  rótulos que saem** (§2.1, R1 e R2). As duas contas se compensam ou não se
  compensam, e **nenhuma das duas foi feita**: é layout.
- **VoiceOver no iOS de verdade.** Todos os rótulos acessíveis deste documento
  foram escritos contra a norma e contra a medida que C3 fez em Chromium, **não**
  contra o leitor que o dono usaria. É a mesma ausência que a frente 2 declarou.
