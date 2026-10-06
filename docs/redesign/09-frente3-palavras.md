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
