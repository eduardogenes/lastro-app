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
