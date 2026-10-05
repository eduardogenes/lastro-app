# 09 · Frente 1 — os lugares e o fluxo entre eles

Esta frente não desenha tela e não escreve código. Ela diz **onde cada coisa
mora**, **quem é o dono de cada dado**, **como se entra e se sai da sessão** e
**o que ganha o topo do Agora quando duas coisas competem**.

O que ela produz é o chão das outras: a frente 0 precisa dos lugares definidos
para repontar a entrada dos testes de fluxo (33 de 33 entram pela navegação,
`08-rede.md`), a frente 2 só desenha estado dentro de um lugar que existe, e a
frente 3 nomeia o que esta frente delimitou.

**Nenhuma linha deste arquivo tem estimativa de prazo ou de horas.** Ninguém
mediu isso.

---

## 0 · A convenção de prova, e o que eu abri

Três etiquetas, e elas valem para tudo:

- **conferi** — eu abri o arquivo nesta sessão e li a linha. O caminho fica ao
  lado.
- **do plano / da rede / do parecer** — repito `07-plano.md`, `08-rede.md` ou
  `06-parecer.md` sem reconferir no código. Fica marcado.
- **não medido** — ninguém mediu, e eu não invento número.

**Do desenho novo**, abri inteiros: `docs/redesign/07-plano.md`,
`docs/redesign/06-parecer.md`, `docs/redesign/08-rede.md` (seções 1 e 2),
`docs/redesign/03-direcao-D/direcao.md`, `.../direcao-2.md`,
`.../prototipo.md`, a PARADA 3 e os itens 5.a', 5.a'' e 5.a''' da ONDA 5 em
`docs/redesign/00-coordenacao.md`. Dos nove HTML da D abri a estrutura e o
conteúdo renderizado de `momento-1.html` (estado 13), `momento-2.html` (os 13
estados), `prescricao.html` (estados 1 a 7), `corpo.html` (os 7 estados),
`semana.html` (os 7 estados), `aula.html` (os 9 estados) e `prototipo.html`
(render da sessão, do Agora e da barra). De `03-direcao-C/` abri `direcao-2.md`
na parte da Prescrição, que é de onde vem a terceira peça.

**Do app que existe**, abri e li: `src/ui/navegacao.js` (inteiro, 151 linhas),
`tests/fluxo/navegacao.test.js` (os nove nomes), `src/ui/app.jsx`,
`src/ui/instrumento/tabbar.jsx`, `src/ui/instrumento/faixasessao.jsx`,
`src/ui/instrumento/timeline.jsx`, `src/ui/instrumento/edicao.jsx`,
`src/ui/telas/hoje.jsx`, `src/ui/telas/treino.jsx`, `src/ui/telas/decisao.jsx`,
`src/ui/telas/sessao.jsx`, `src/ui/telas/historico.jsx`,
`src/ui/telas/programa.jsx`, `src/ui/telas/guia.jsx`,
`src/ui/telas/retrospectiva.jsx`, `src/dominio/volume.ts`,
`src/dominio/tipos.ts` (o tipo `Estado`), e os trechos de `src/main.jsx` do
ciclo da sessão, da promoção, do dia de comida, do volume e da rota. Os
caminhos estão ao lado de cada afirmação.

**O que eu não abri**, e por isso não afirmo nada sobre: os seis arquivos de
CSS, `src/palco.js` e `src/palco.css` (só sei o que `07-plano.md` §4 diz
deles), `src/ui/telas/comparar.jsx`, `src/ui/telas/protocolo.jsx`,
`src/ui/telas/camera.jsx` e `src/ui/telas/retroativo.jsx` — destes eu li a
linha correspondente da rede e o cabeçalho citado no parecer, não o arquivo.

**Por que eu cito por nome e não por número de linha em parte dos arquivos.**
Enquanto eu escrevia, a frente 0 estava mexendo em `src/main.jsx`,
`src/dominio/**` e `tests/**` — ela commitou duas vezes no meio desta sessão, e
os números de linha que eu havia anotado já tinham andado quando fui conferir.
Então, nesses três caminhos, **eu cito o nome da função, da constante ou do
tipo**, que é estável: `fechaSessao`, `impactoDoMod`, `SESSAO_LIMITE`,
`PromoPendente`. Em `src/ui/**`, nos nove HTML da D e nos documentos — que
ninguém está editando — eu mantenho o número de linha. Qualquer número de linha
deste arquivo vale para o estado do repositório em `80607b9`, que é o último
commit meu antes de a frente 0 publicar.

---

## 1 · Os cinco lugares, e o que cada um possui

A barra de baixo passa a ter cinco: **Agora · Dias · Corpo · Semana ·
Prescrição** (`docs/redesign/03-direcao-D/direcao-2.md` §2; conferi os cinco
no `tabbar()` de `docs/redesign/03-direcao-D/prototipo.html:1067-1076`). A partição
de "Evolução" em Corpo e Semana é a decisão do desenhista depois das respostas
do dono, e ela tem um motivo de uma linha: **o corpo deixou de ser leitura e
passou a ser registro.**

Duas coisas que **não são lugar** e precisam de nome, porque capacidade real
mora nelas:

- **A sessão** é um **modo**, não uma aba. Está na seção 2.
- **Os ajustes** são um botão no canto do Agora (`direcao.md`, "Os ajustes… não
  são lugar"; conferi o botão de engrenagem no cabeçalho do Agora em
  `prototipo.html:978`). Está em 1.6.

A régua que usei para decidir o dono de um dado é uma só: **o dono é o lugar
onde o dado se escreve.** Quem só mostra é vista. Onde isso produz um resultado
contraintuitivo, eu digo por quê.

### 1.1 · Agora

**A pergunta que responde:** *e agora?*

**Possui:**

| o que | o dado, hoje |
|---|---|
| o cartão de cima — a próxima coisa a fazer, e a regra que o escolhe (seção 3) | `CartaoFoco` em `src/ui/telas/hoje.jsx:59-70` |
| a linha do dia de hoje, em ordem de relógio, com refeição e treino na mesma espinha | `src/ui/telas/hoje.jsx:100-127` + `src/ui/instrumento/timeline.jsx` |
| a marca de refeição **de hoje** e a porção **de hoje** | `S.dia.done` e `S.dia.escala`; `marcaRefeicao` em `src/main.jsx`, `setEscala` no mesmo arquivo |
| a água de hoje | `S.dia.agua`; `setAgua` em `src/main.jsx` |
| o tipo de dia e o turno do treino, na linha do cabeçalho | `S.dia.turno`; o botão de estado em `src/ui/app.jsx:39-43`, a regra em `tests/fluxo/turno.test.js` (9 casos) |
| a porta de entrada da sessão | hoje o cartão-foco aponta para a aba de treino (`src/ui/telas/hoje.jsx:68`) |
| o placar do cardio da semana e o registro dele sem sair da tela | hoje em `src/ui/telas/treino.jsx:114-146`; a regra em `tests/fluxo/cardio.test.js` (10 casos) |
| a contagem dos 14 dias que a regra lê | a `Sparkline` de 14 fatias, `src/ui/instrumento/primitivos.jsx:130` |
| o convite da sessão de fotos quando faz 14 dias, e o convite da pesagem da manhã | `S.protocolo.sessoes`, `S.body.peso` |
| a presença da aula, no dia da aula | `tests/fluxo/aula.test.js`, `tests/fluxo/aulaimport.test.js` |
| a faixa da sessão aberta e a pergunta de 1h30 | `src/ui/instrumento/faixasessao.jsx`; `CTX.faixaDaSessao` em `src/main.jsx` |
| o botão de Ajustes, no canto | `prototipo.html:978` |

**Não possui:**

- **nenhum dia que não seja hoje.** Pôr ontem em dia é uma folha que abre
  **sobre** o Agora (`momento-2.html`, estados 4 a 6), e o lugar de onde se
  alcança qualquer dia é Dias.
- **nenhuma média, taxa ou tendência.** O Agora só tem números do dia. A média
  semanal e o ritmo são de Semana, e aparecem em Corpo como vista.
- **nenhuma prescrição editável.** Mexer no plano ou no programa é Prescrição.
- **o registro do peso.** O Agora convida e atalha; quem escreve é Corpo
  (decisão do dono, P3.f/D9).
- **a correção de uma série passada.** Isso é da sessão e de Dias.
- **a lista das mudanças que esperam.** O Agora mostra **uma linha** ("Para
  decidir com calma", conferi em `momento-1.html:802`) e o aviso da manhã do
  treino que volta; o dono da lista é Prescrição.

### 1.2 · Dias

**A pergunta que responde:** *o que aconteceu em cada dia, e o que falta dizer?*

**Possui:**

| o que | o dado, hoje |
|---|---|
| o calendário do mês e o dia a dia | `src/ui/telas/dados.jsx` (o calendário é o que sobrou em string, cabeçalho do arquivo) |
| os dias de comida já fechados | `S.comidaHist` (`src/dominio/tipos.ts`); a virada em `fechaDiaDeComida`, `src/main.jsx` |
| as sessões registradas e o detalhe de uma sessão, com corrigir a duração e apagar o treino | `S.done`; `src/ui/telas/sessao.jsx` |
| o registro retroativo de treino, com e sem séries, com e sem hora | `src/ui/telas/retroativo.jsx`; `tests/fluxo/retro.test.js` (9 casos) |
| marcar um dia passado como descanso | `S.descanso` (`src/dominio/tipos.ts`) |
| a hora de cada registro, e o "nunca inventa o que não mediu" | `tests/fluxo/horario.test.js` (14 casos) |
| a folha de pôr o dia em dia — **o lugar**; a folha é da frente 2 | `momento-2.html`, estados 4 a 6 e 12 |
| o dia com dois treinos levando à lista, em vez de abrir um em silêncio | `tests/fluxo/telas.test.js` |
| a faixa da semana com a marca de cardio, e o atalho para abrir a sessão de um dia | hoje em `src/ui/telas/treino.jsx:97-112` |

**Não possui:**

- **nada prescrito.** O que o plano diz daquele dia aparece como referência; o
  plano é de Prescrição.
- **nenhuma média.** Dias é por dia, por definição.
- **o cartão de agora.** Um dia que passou não tem "agora".

**Um fato que precisa ficar escrito:** **Dias é o único dos cinco lugares que
não tem desenho nenhum.** Conferi os nove HTML da D: `momento-1`, `momento-2`,
`aula`, `comparar`, `corpo`, `prescricao`, `semana`, `sessao-fotos` e
`prototipo`. Nenhum deles é a tela de Dias — o estado 12 do `momento-2` é a
**folha** de pôr em dia, e o próprio `prototipo.md` diz que "Dias, Semana e
Prescrição" ficaram de fora e aparecem desabilitadas. Semana e Prescrição
ganharam tela na segunda rodada; Dias não. E Dias é justamente o lugar que
recebe mais capacidade pronta do app de hoje: o calendário, o histórico de
comida, o detalhe da sessão, o retroativo, o descanso, a correção e o apagar.

### 1.3 · Corpo

**A pergunta que responde:** *como está o corpo, e o que eu registro hoje?*

**Possui:**

| o que | o dado, hoje |
|---|---|
| o peso, com uma medida por dia, aceitando vírgula, substituindo a do mesmo dia e podendo ser lançado em data bem anterior (nunca futura) | `S.body.peso`; o seletor de data em `src/main.jsx`; `tests/fluxo/corpo.test.js` (25 casos) |
| a cintura, com data por medida e sem se misturar com o peso | `S.body.cintura` (`src/dominio/tipos.ts`) |
| as medidas com fita, e **como ele mediu**, em texto dele | não existe hoje: `S.body` é `{ peso, cintura }`, fechado no tipo (`src/dominio/tipos.ts`) e na fusão (`src/dominio/sincronia.ts`) — conferi as duas chaves |
| a bioimpedância, **cinco campos** (5.a', P3), com o **peso dela como registro separado** da pesagem da manhã (5.a''') | não existe hoje; é a migração da frente 0 |
| as fotos do corpo: a sessão de fotos, o ajuste de enquadramento, a comparação | `S.protocolo`; `tests/fluxo/protocolo.test.js` (58 casos), `tests/fluxo/fotos.test.js` (20 casos) |
| a leitura de gordura visual, respondida sobre o par de fotos | `S.gordura` (`src/dominio/tipos.ts`) |
| o destrutivo das medidas, com o estrago delimitado em texto | `delBody` em `src/main.jsx` |

**Não possui:**

- **o veredito da regra do nutricionista nem o botão do passo.** Corpo mostra a
  média da semana e a taxa contra o alvo no topo (conferi em
  `corpo.html`, estado 1), porque é o que diz se o peso do dia significa algo —
  mas o veredito e o passo de ±150 kcal são de Semana.
- **a força, as séries por músculo e os padrões de comida.** São de Semana
  (`direcao-2.md` §2).
- **nenhuma prescrição.** O calendário de pesagem e de fotos vem de fora.

**O dono aqui venceu uma discussão com custo escrito.** Em D9 ele mandou tudo
para a tela nova — registrar e ler no mesmo lugar — vendo que a pesagem da
manhã passava de um toque para dois a partir do descanso (`00-coordenacao.md`,
P3.f). Em 5.a' P5 ele acrescentou que a pesagem entre séries **vale lá
também**, por atalho. As duas respostas convivem: o dono do dado é Corpo, e o
descanso tem um atalho que abre Corpo (seção 2).

### 1.4 · Semana

**A pergunta que responde:** *a semana andou para onde, e dá para mexer na
comida?*

**Possui:**

| o que | o dado, hoje |
|---|---|
| o veredito da regra, com os números que o produziram, e os três portões (taxa, força, adesão) | `veredito` em `src/dominio/corpo.ts`, com `MIN_REGISTRADOS = 11` no mesmo arquivo (conferi); a tela em `src/ui/telas/dados.jsx:346-356` |
| o passo de ±150 kcal e o saldo acumulado, com a procedência de cada passo | `S.ajuste` e `S.ajusteHist` (`src/dominio/tipos.ts`); `tests/fluxo/ajuste.test.js` (14 casos) |
| a média semanal do peso e a taxa entre semanas | derivado de `S.body.peso` por `src/dominio/corpo.ts`; a mesma leitura aparece em Corpo |
| a força estimada, a tendência e o sinal manual | `S.perfManual` (`src/dominio/tipos.ts`); `tests/fluxo/ritmo.test.js` |
| as séries por músculo e a leitura das linhas **em conjunto**, que nomeia a inversão | `seriesPorMusculo` e `leituraDaSemana` em `src/dominio/volume.ts`; o painel em `src/ui/telas/dados.jsx:220-225`; `tests/fluxo/leitura.test.js` (3 casos) |
| a retrospectiva do bloco | `src/ui/telas/retrospectiva.jsx` |
| os padrões de comida | `direcao-2.md` §2 |

**Não possui:**

- **nenhum registro de medida.** Semana não escreve peso, cintura nem foto.
- **nenhum dia.** O dia é de Dias e de Agora.

**Duas exceções honestas:** Semana **escreve** duas coisas, e as duas são
decisão e não medida — aplicar o passo (`S.ajuste`, com a linha em
`S.ajusteHist`) e virar o sinal manual de força (`S.perfManual`). Chamar Semana
de "só leitura" seria mentir sobre essas duas.

### 1.5 · Prescrição

**A pergunta que responde:** *o que foi prescrito, e o que eu mudo?*

**Possui:**

| o que | o dado, hoje |
|---|---|
| o programa dele e a rotação | `S.prog`, `S.rot`; `src/ui/telas/programa.jsx`; `tests/fluxo/telaprograma.test.js` (23 casos) |
| o programa do treinador, congelado, e a diferença lida como troca | `PROGRAMA` em `src/dominio/programa.ts`; `difDoDia` em `src/main.jsx` |
| o histórico de mudanças do programa, com o motivo | `S.progLog`; `aplicaAoOficial` em `src/main.jsx` |
| o catálogo de exercícios, o cadastro, o renome e o arquivado | `S.ex`; o renome em `src/ui/telas/historico.jsx:30-45`; `tests/fluxo/dados.test.js` |
| o plano alimentar, a base de alimentos e as compras | `S.comida.plano`, `S.comida.alimentos`, `S.compras`; `src/ui/telas/comida.jsx` |
| o padrão semanal (a cadência) | `S.cadencia`; hoje em `src/ui/telas/guia.jsx:160-182`, modo "o app" — conferi, e o teste diz por quê: "a cadência é ajuste, não prescrição" (`tests/fluxo/fusao.test.js`) |
| a revisão que chega com outro nome, perguntando antes de gravar | `tests/fluxo/aula.test.js`/`trocaprograma.test.js`; `prescricao.html`, estado 6 |
| **a lista das mudanças do dia que esperam decisão, e que vencem** | `S.promoPendente` (`src/dominio/tipos.ts`); hoje a pergunta é `src/ui/telas/decisao.jsx` |
| **a conta de volume de cada mudança que espera** (peça 3 da C) | seção 4 |

**Não possui:**

- **nenhum registro.** Prescrição é o que vem de fora mais o que ele decide
  manter. O que aconteceu é de Dias.
- **a mudança enquanto a sessão está viva.** Enquanto a sessão existe, a
  mudança do dia é da sessão (`S.mods`). Prescrição a recebe depois.

### 1.6 · Os ajustes, que não são lugar

Um botão no canto do Agora. **Possui:** a conta e a sincronia (`S.mtime`,
`S.apagados`; `tests/fluxo/sincronia.test.js`, 12 casos), a cópia de segurança
e a restauração (a lista da importação em `src/main.jsx`, do plano §3.1;
`tests/fluxo/dados.test.js`, 19
casos), apagar o histórico (`wipe()`), a versão e a atualização
(`tests/fluxo/publicacao.test.js`, 13 casos), e a troca manual de tema (D10).

**Não possui** nenhuma decisão de treino ou de comida.

### 1.7 · O mesmo dado em dois lugares: quem é dono, quem é vista

| o dado | dono | vista |
|---|---|---|
| peso do dia (`S.body.peso`, `src/dominio/tipos.ts`) | **Corpo** | Agora (o convite da manhã, o atalho do descanso); Semana (a média e a taxa) |
| média semanal e taxa | **ninguém guarda** — é derivado por `src/dominio/corpo.ts` | Corpo (no topo) e Semana (no veredito) |
| dias com marca nos últimos 14 | **Agora** (o dia corrente, `S.dia`) e **Dias** (`S.comidaHist`) | Agora (os 14 quadradinhos) e Semana (o portão da adesão) |
| marca de refeição | **Agora** para hoje; **Dias** para qualquer outro dia | — |
| mudanças só do dia (`S.mods`) | **a sessão** enquanto ela vive; **Prescrição** depois | Agora (uma linha) |
| séries por músculo contra o alvo do treinador (`src/dominio/volume.ts`) | **a conta é de domínio**, sem dono de tela | sessão (ao mexer), Prescrição (a fila e o programa), Semana (o painel) |
| fotos (`S.protocolo`) | **Corpo** | Agora (o convite dos 14 dias); Semana (o par que a regra pede) |
| leitura de gordura visual (`S.gordura`) | **Corpo** (responde-se olhando o par) | Semana (o portão do corte) |
| programa e rotação (`S.prog`, `S.rot`) | **Prescrição** | sessão (o treino do dia); Agora (qual é o próximo) |
| plano alimentar (`S.comida.plano`) | **Prescrição** | Agora e Dias (as linhas do dia) |
| cardio (`S.cardio`) | **Agora** (é onde se registra) | Dias (a marca no calendário e na faixa); Semana (o placar) |
| duração da sessão | **Dias** (o registro em `S.done`) | sessão (o relógio ao vivo) |
| ajuste calórico (`S.ajuste`) | **Semana** | Agora e Prescrição (o alvo do dia já ajustado) |
| turno do treino (`S.dia.turno`) | **Agora** | Dias (o horário das refeições daquele dia) |
| quadro da aula (`S.quadro`) | **a sessão**, e ao encerrar ele vira a nota em `S.done` (`fechaSessao` em `src/main.jsx`) | Dias (a nota da sessão) |

**A regra que fecha esta seção:** se uma tela mostra um dado que não é dela,
ela mostra **e não escreve**. A única exceção autorizada é o atalho de peso
dentro do descanso, e ele não escreve: abre Corpo (seção 2, e é a resposta de
5.a' P5).

---

## 2 · A conferência contra a seção 1 da rede

Trinta e três arquivos, 514 casos. Para cada um: o lugar que recebe o que ele
protege. A régua é a da rede — capacidade, não tela.

| arquivo (casos) | onde mora |
|---|---|
| `ajuste.test.js` (14) | **Semana** — o saldo cumulativo, o ledger, o passo. O portão da foto é vista; o dono da leitura é Corpo |
| `aula.test.js` (12) | **Agora** (presença no dia da aula) + **sessão** (movimentos, lista rápida) + a biblioteca de modelos, desenhada em `aula.html`, estado 9 |
| `aulaimport.test.js` (14) | **sessão** (o quadro visível durante a aula, virando nota ao encerrar) + **Prescrição › Exercícios** (o vocabulário novo, cadastrado antes de o dia ser montado) |
| `avanco.test.js` (10) | **sessão** + a faixa fora dela (seção 3) |
| `cardio.test.js` (10) | **Agora** (placar e registro) + **Dias** (calendário e faixa da semana) + **sessão** (fim das sessões A e D). Ver achado 4 |
| `carga.test.js` (11) | **sessão** (o total como exibição) + a correção do tipo, que é por movimento. Ver achado 1 |
| `ciclo.test.js` (18) | **sessão**. O deload é achado 3 |
| `corpo.test.js` (25) | **Corpo** (as medidas, a data por medida) + **Semana** (a média, o ritmo, o "sem registro de comida registre em vez de cortar") |
| `cronometro.test.js` (12) | **sessão** |
| `dados.test.js` (19) | **Ajustes**. Dois casos atravessam: "todas as telas renderizam com o formato antigo" é invariante dos cinco lugares, e o exercício arquivado é de **Prescrição** |
| `diario.test.js` (9) | **Dias** (o histórico fechado) + **Agora** (o dia corrente) |
| `edicao.test.js` (27) | **sessão** (mexer no dia sem mexer no oficial, o impacto no volume na hora) + **Prescrição** (a decisão, que agora é lista) |
| `esquecido.test.js` (6) | atravessa: a faixa, nos quatro lugares e **dentro** do modo (seção 3) |
| `fluxo.test.js` (5) | atravessa. "O app não presume que hoje é o dia da sessão" é regra do **Agora** |
| `fotos.test.js` (20) | **Corpo** |
| `fusao.test.js` (24) | **Agora** (a timeline em ordem de relógio, o cartão-foco antes de qualquer resumo) + **Prescrição** (quantidade muda o plano para todo dia; remover alimento sai das refeições que o citam) + a pilha de folhas em três níveis, que é navegação |
| `horario.test.js` (14) | **Dias** (a hora de cada registro, o horário típico, a posição de leitura ao trocar de mês) + **sessão** (só o começo, com sessão em andamento) |
| `leitura.test.js` (3) | **Semana** |
| `migracaochave.test.js` (7) | nenhum lugar: é infra de armazenamento |
| `navegacao.test.js` (9) | atravessa (seção 3) |
| `programa.test.js` (12) | **Prescrição** — a chave do histórico é o exercício, a rotação vem do estado |
| `promocao.test.js` (9) | **Prescrição** — e é a seção 5 inteira |
| `protocolo.test.js` (58) | **Corpo** |
| `publicacao.test.js` (13) | nenhum lugar: é publicação |
| `retro.test.js` (9) | **Dias** |
| `ritmo.test.js` (19) | **Semana** (ritmo, eixo invertido, retrospectiva, volume acumulado) + **sessão** (o catálogo abre pela prioridade do dia aberto) + **Prescrição** (a busca sem acento, no treino e na comida; o movimento de box fora do alvo por músculo) |
| `serie.test.js` (8) | **sessão** |
| `sessao.test.js` (26) | **sessão** + **Dias** (o detalhe, com corrigir e apagar). A regra de pouso é a seção 3 |
| `sincronia.test.js` (12) | **Ajustes**. A marca de descanso que viaja é dado de **Dias** |
| `telaprograma.test.js` (23) | **Prescrição** + **Semana** (o painel atribui a série ao exercício registrado, não à posição) |
| `telas.test.js` (39) | atravessa. "As cinco abas renderizando" vira "os cinco lugares"; "o app abre em HOJE" vira a regra de pouso do **Agora**; "abrir um exercício põe o cartão no topo" é da **sessão**; "o contexto de treino só na aba de treino" é o achado 5 |
| `trocaprograma.test.js` (8) | **Prescrição** |
| `turno.test.js` (9) | **Agora** |

**Uma nota de leitura, e não é achado.** O fluxo de importar a aula **escreve
no catálogo de exercícios**, que é de Prescrição (`tests/fluxo/aulaimport.test.js`:
"o vocabulário novo cadastrado antes de o dia ser montado"). Isso é legítimo:
cadastrar é ato, não vista, e o ato acontece onde a necessidade aparece. A regra
de 1.7 continua inteira — quem mostra não escreve; quem cadastra, cadastra.

---

## 3 · Os nove achados: capacidade de hoje que fica sem lugar

Ordenados por quanta capacidade perdem, não por tamanho.

### Achado 1 · O cartão do exercício fora da sessão não tem lugar — e com ele vão quatro capacidades

Hoje a aba TREINO desenha os cartões do treino **de qualquer dia da rotação**,
com ou sem sessão aberta. Conferi: o seletor de dia está em
`src/ui/telas/treino.jsx:27-31`, a fila da rotação em `:85-93` (`vaiParaDia`), e
os cartões vêm de `t.exercicios` em `:200-203`, sem consultar `S.sessao`.
Dentro de cada cartão moram quatro coisas que não têm segunda porta:

1. **O histórico de um exercício** — o gráfico que responde "estou ficando mais
   forte nisto?", a tabela em ordem inversa e **a correção de uma série de
   semanas atrás** (`src/ui/telas/historico.jsx`). Ele abre **só** pelo botão
   "histórico" do cartão: `src/ui/exercicio.jsx:422` é o único chamador de
   `openHist` em `src/` — conferi com grep. A métrica muda com o tipo de
   exercício (tempo na prancha, repetição na barra fixa, volume no resto), e o
   arquivo diz por quê.
2. **O renome do exercício**, que vive dentro dessa mesma tela
   (`src/ui/telas/historico.jsx:30-45`): troca o rótulo sobre o mesmo id, sem
   mover histórico.
3. **A correção do tipo de carga** por movimento — anilha por lado, dois
   halteres, barra livre, peso do corpo (`src/ui/exercicio.jsx:247-258`;
   `setCarga` em `src/main.jsx`). São 11 casos em
   `tests/fluxo/carga.test.js`, e o comentário do fonte diz que é "decisão de
   uma vez por movimento".
4. **A troca por substituto com o histórico de cada opção**
   (`src/ui/exercicio.jsx:140-168`): cada substituto mostra a última carga
   registrada **nele**.

Na D, a sessão é o treino de **hoje** e entra-se nela pelo Agora. **Nenhum dos
cinco lugares abre o cartão de um exercício de outro dia.** Consequência
concreta: "corrigir a série de três semanas atrás" e "consertar o tipo de carga
da flexora numa quinta" perdem o caminho, e a perda não aparece no dia — aparece
quando ele for corrigir.

**Proposta da frente 1** (proposta, não decisão): Prescrição › Programa ›
Treino X já lista os exercícios com séries, repetições e descanso
(`programaDia` em `src/main.jsx`). Cada linha ganha a porta para o
histórico daquele exercício, e o renome e o tipo de carga vão com ela. A
correção de uma série passada ganha **duas** portas, porque são duas perguntas:
em **Dias › detalhe da sessão** a unidade é o **dia** (corrigir a duração,
apagar o treino — `src/ui/telas/sessao.jsx`, e o cabeçalho do arquivo diz
exatamente isso), e no **histórico do exercício** a unidade é a **série**.

### Achado 2 · As catorze regras de execução do treinador não têm lugar em nenhuma das duas direções

Elas existem, com texto escrito e procedência: `RULES` em
`src/dominio/programa.ts`, **catorze entradas** — contei as chaves: `regra
1` a `regra 5`, `volume`, `hyrox`, `fadiga`, `atenção`, `aquecimento`,
`deload`, `bike`, `prioridades`, `sucesso`. São servidas por
`CTX.guia` em `src/main.jsx` e desenhadas em `src/ui/telas/guia.jsx:139-155`, uma aberta
por vez, com a procedência da pegada dita **uma vez só** ali e não em cada
cartão. No mesmo modo mora **o alvo calórico por tipo de dia, calculado do
plano e nunca escrito à parte** (`src/ui/telas/guia.jsx:119-136`, com a
procedência explícita; o caso que o cobra é `tests/fluxo/fusao.test.js`).

Conferi as tabelas de tarefas das duas direções: **nem a D nem a C têm linha
para as regras do treinador.** `07-plano.md` §4 também não as lista entre o que
fica para depois — ou seja, elas não estavam nem na lista do que se sabe que
falta.

**Proposta:** Prescrição, que é por definição "o que vem de fora" (`direcao.md`,
"O produto não cria prescrição"). As regras são do treinador, como o programa,
e o alvo por tipo de dia é derivado do plano, que também mora lá.

### Achado 3 · O deload muda de lugar contra uma razão escrita no fonte

Hoje o interruptor mora em Ajustes (GUIA › o app) e o comentário diz por quê,
palavra por palavra: *"Fica AQUI, e não no TREINO, de propósito: um interruptor
que corta metade das séries não deve estar a um toque no meio de uma sessão. O
app existe em parte para frear, e o caminho de menor esforço tem que ser o
conservador. O estado dele já aparece no TREINO quando ligado."*
(`src/ui/telas/guia.jsx:186-192`, conferi.)

A D o põe no menu ⋯ da sessão (`03-direcao-D/direcao.md`, tabela de tarefas:
"Deload | sessão, menu ⋯"). As duas coisas não podem valer ao mesmo tempo. Não
é decisão minha: é regra, e sobe com os dois argumentos escritos — o de hoje
(freiar) e o da D (o raro mora no ⋯, e deload é raro).

### Achado 4 · O placar do cardio não está onde a rede diz que está

A linha de `cardio.test.js` em `08-rede.md` fala em "placar na tela de hoje e
registro sem sair dela". Conferi: o placar (`.cardl`) e o registro rápido
(`.cardq`) estão na aba **TREINO** — `src/ui/telas/treino.jsx:114-146` —, e os
dois casos cujo nome diz "tela de hoje" rodam no padrão do harness, que é
`'treino'` (`tests/fluxo/harness.js`). O nome do caso e o comentário do
arquivo de teste envelheceram; o código não.

Levar o cardio para o Agora — que é o que a D manda (`direcao.md`: "Cardio |
fim das sessões A e D; Agora") — é portanto **mudança de lugar**, não
restauração. Muda onde o placar aparece no pouso, e é bom que a reponta saiba
disso, porque o caso que falar em "tela de hoje" vai passar a falar a verdade
pela primeira vez.

### Achado 5 · "O contexto de treino só na aba de treino" deixa de existir como regra

É um dos 39 casos de `tests/fluxo/telas.test.js`. Com a sessão virando modo e a
aba de treino desaparecendo, essa regra não tem como ser reescrita igual. O que
a substitui está na seção 4: o contexto de treino existe **dentro do modo**, e
fora dele só a faixa. Quem repontar esse caso precisa trocar a asserção de
propósito, e não por acidente — é exatamente o tipo de caso que se apaga sem
ninguém notar.

### Achado 6 · Dias é o único dos cinco lugares sem desenho

Já dito em 1.2, e repetido aqui porque é o lugar que recebe mais capacidade
pronta do app de hoje — o calendário do mês, o histórico de comida fechado, o
detalhe da sessão com corrigir e apagar, o retroativo, o descanso, a hora de
cada registro — e é o único dos cinco sem um pixel para conferir. Semana e
Prescrição ganharam tela na segunda rodada; Dias não.

### Achado 7 · O "ciclo" não tem lugar

O cabeçalho do TREINO traz três células: séries feitas de prescritas, volume do
dia e **ciclo**, com o número de sessões (`src/ui/telas/treino.jsx:34-53`;
`ciclo` é `Math.floor(S.done.length / rot().length) + 1` em
`CTX.treino`, em `src/main.jsx` — conferi). Dessas três:

- **séries feitas de prescritas** está no cabeçalho da sessão da D ("série N de
  M") e no mapa da sessão — conferi em `prototipo.html:563-576` e `:577-589`;
- **volume do dia** já tem casa: o detalhe da sessão mostra "volume · kg×reps"
  (`CTX.detalheDaSessao` em `src/main.jsx`, conferi), e o detalhe é de Dias;
- **ciclo** não aparece em desenho nenhum que eu tenha aberto.

**Proposta:** ciclo é leitura de Semana, ao lado da retrospectiva do bloco —
é a mesma pergunta ("em que ponto do bloco eu estou"). Não conferi os nove HTML
inteiros procurando o ciclo com outro nome.

### Achado 8 · O destrutivo segue sem desenho, e agora precisa de três endereços

`07-plano.md` §4 registra que nenhuma das duas direções trata apagar. Hoje:

- **apagar uma medida** passa por `confirm()` do sistema com o estrago
  delimitado em texto — "Sai da média da semana e do ritmo. As outras medidas
  ficam." (`delBody`, `src/main.jsx`, conferi);
- **apagar uma sessão ou uma série** é oferecido no detalhe da sessão e no
  histórico do exercício, com lápide nas duas coisas e aviso de quantas séries
  vão junto — menos no treino em andamento (`src/ui/telas/sessao.jsx`;
  `tests/fluxo/sessao.test.js`);
- **apagar o histórico inteiro** é o único botão que destrói, e mora em
  Ajustes.

Os três endereços nos cinco lugares: **Corpo** (medida), **Dias** e a **sessão**
(registro), **Ajustes** (tudo). Enquanto não houver desenho, o comportamento de
hoje fica — e fica dito, não por esquecimento.

### Achado 9 · A bancada e a superfície de conflito seguem sem lugar

`src/palco.js` e `src/palco.css` — que eu **não abri** — são trocados por outra
coisa não desenhada nas duas direções (`07-plano.md` §4). E a fusão de dois
aparelhos decide sem tela nenhuma: existe e é testada (`tests/fluxo/sincronia.test.js`,
12 casos), e nenhuma direção desenhou o que se vê quando ela decide. Nenhum dos
cinco lugares as recebe. Declarado.

---

## 4 · A sessão como modo, com saída própria

O protótipo achou o defeito mais básico de todos: **a sessão não tinha saída.**
Instalado no iPhone não existe barra de navegador (`prototipo.md`, descoberta
1), e o dedo ficava preso dentro do treino, sem caminho para a comida.

Esta seção define o modo. Ela **se encaixa** em `src/ui/navegacao.js`, que já
está pronto e testado, e não o reinventa.

### 4.1 · O que entra em modo de sessão

| o que | onde está hoje |
|---|---|
| o registro da série — carga, repetições, RIR — e a régua | `src/ui/exercicio.jsx:84-98` (hoje dois campos de texto com `inputmode="decimal"`) |
| o teclado próprio da carga, com vírgula | não existe hoje; é D8, teclado misto |
| o descanso: começa em qualquer série completada, conta do instante-alvo | `tests/fluxo/cronometro.test.js` (12 casos), `tests/fluxo/serie.test.js` (8 casos) |
| o mapa da sessão e a projeção de fim pelo ritmo do dia | `prototipo.html:577-589` |
| as mudanças só do dia: séries, repetições, descanso, remover, mover, acrescentar, trocar | `src/ui/telas/edicaodia.jsx` + `src/ui/instrumento/edicao.jsx`; `CTX.edicaoDoDia` em `src/main.jsx` |
| a conta de volume na hora de mexer | `impactoSeries` em `src/main.jsx`, renderizado em `src/ui/instrumento/edicao.jsx:41-45` |
| a troca por máquina ocupada, com o histórico de cada substituto, e a foto do aparelho | `src/ui/exercicio.jsx:140-168`; `S.fotos` |
| a dor, e o aviso de dor repetida | `tests/fluxo/sessao.test.js` (a hidratação recupera dor e substituto) |
| pular (decisão registrada e reversível), aproximação, bi-set | `tests/fluxo/ciclo.test.js` (18 casos), `src/ui/exercicio.jsx:410` |
| pausar, retomar, finalizar, corrigir a duração, a nota da sessão | `src/ui/telas/treino.jsx:74-81`; `finalizarSessao` em `src/main.jsx` |
| o quadro do box durante a aula, e a lista rápida | `S.quadro` (`src/dominio/tipos.ts`); `src/ui/telas/treino.jsx:166-178` |
| a correção no lugar: cada número guardado é botão dentro da tabela | não existe hoje; nasceu no protótipo (`prototipo.md`, descoberta 4) |
| as entradas rápidas do descanso: pré‑treino, água, e o **atalho** de peso | `direcao.md`, M1‑2; o atalho **abre Corpo** e não escreve (5.a' P5) |
| o histórico de um exercício, hoje alcançável só daqui | `src/ui/telas/historico.jsx`; achado 1 |

### 4.2 · O que a sessão esconde

| o que | por quê |
|---|---|
| **a barra dos cinco lugares** | O contrato de UX vigente manda o contrário — "**Continua visível durante o treino ativo**… Esconder a navegação aqui protegeria contra um risco que não existe" (`docs/LASTRO_UX_CONTRACT.md:98-101`, conferi). Mas o mesmo contrato, duas linhas acima, já manda que a barra "**some em destino de tela cheia** (o assunto é um só, e ela convidaria a sair no meio)" (`:94-95`). A sessão virando tela cheia cai na segunda regra, e a primeira cai — **e o que paga por ela é a saída.** A razão escrita da primeira regra era "sair para conferir a comida e voltar é um caminho legítimo"; a seta e a faixa entregam esse caminho, com um toque para cada lado |
| o resumo do dia, as médias, os placares | é "como está?", e o modo responde "e agora?" |
| **o aviso do vencimento da mudança do dia** | desenhado para aparecer no Agora da manhã daquele treino, "uma vez, e **nunca durante a sessão**" (`direcao-2.md` §3, pergunta 1) |
| **a pergunta guardada sobre o programa**, enquanto houver sessão | já é assim, com guarda explícita: `abrePromoGuardada` tem `if (… \|\| S.sessao) return false` (`src/main.jsx`, conferi), e o comentário diz por quê — "perguntar sobre o programa enquanto ele registra série é interromper a única coisa que o app existe para não atrapalhar" |
| a atualização do app | "nunca durante a sessão" (`direcao.md`, tabela de tarefas) |

### 4.3 · O que ela **não** pode esconder

1. **A pergunta de 1h30.** Hoje ela aparece em **todas** as abas, treino
   inclusive, e a ordem do código é deliberada: `CTX.faixaDaSessao` devolve a
   pergunta **antes** do `if (view.aba === 'treino') return null`
   (`CTX.faixaDaSessao` em `src/main.jsx`, conferi). O comentário: "quem esqueceu de
   finalizar costuma ter esquecido olhando justamente para ela". São 6 casos em
   `tests/fluxo/esquecido.test.js`. **Dentro do modo, a pergunta continua.**
2. **As linhas do dia tocáveis.** 5.a' P4: "sim, sempre". Seção 6.
3. **O relógio de parede.** O protótipo descobriu que o app não tem relógio
   nenhum e que a projeção de fim não se confere sem ele (`prototipo.md`,
   descoberta 2). Dentro do modo, a hora fica no cabeçalho.
4. **O erro de gravação.** A confirmação só aparece depois de gravar no
   aparelho; se não gravou, a tela diz e guarda a escolha (M1‑10 e a regra 6 da
   D). É o "nada de falso sucesso", que já é doutrina (`src/main.jsx`, "Não
   existe estado 'não salvo'").
5. **A própria saída.** A seta não some em nenhum estado do modo.

### 4.4 · Como se entra — e entrar no modo não é começar a sessão

Esta distinção é a espinha da seção, e ela é regra de produto, não detalhe:

- **Entrar no modo é navegação.** Pode-se entrar e sair sem que exista sessão
  nenhuma. É o estado M1‑7, "vazio da sessão: antes da primeira série".
- **A sessão nasce na primeira série completa.** `abreSessao(dia)` é chamada
  pela projeção quando carga e repetição ficam preenchidas, e a marca entra com
  `ini: 'auto'` (`src/main.jsx`, conferi). Série incompleta não abre
  sessão (`tests/fluxo/sessao.test.js`).
- **O botão de iniciar nunca é pré‑condição para gravar série.** Ele só
  acrescenta precisão ao tempo — está escrito no fonte, acima de `somaPausas`
  (`src/main.jsx`, conferi), e são 18 casos em
  `tests/fluxo/ciclo.test.js`. Quando ele é tocado, a marca entra com
  `ini: 'manual'` (`iniciarSessao`, `src/main.jsx`).

Portas de entrada:

1. **O cartão de cima do Agora**, quando o treino ganha o topo: "Começar
   agora", com a linha "Ou comece direto na primeira série" embaixo — conferi
   em `momento-1.html:807-808`.
2. **A faixa**, quando a sessão já existe: "Voltar à sessão" (conferi em
   `prototipo.html:988`; hoje é `FaixaDaSessao` com `onVolta`,
   `src/ui/app.jsx:53-58`).
3. **O pouso do app.** Abrir o app com treino em andamento **cai na sessão, não
   no Agora**. Isso já existe e tem razão escrita: `view.aba = 'treino'` quando
   `diaDaSessaoAberta()` devolve algo (`src/main.jsx`, conferi) —
   "sair e voltar no meio de uma série é o caso mais comum de reabertura que
   existe neste app, e devolvê-lo a HOJE cobrava dois toques com o celular na
   mão suada". **Requisito: a regra fica, e o destino passa a ser o modo.** E
   ela roda **depois** de `encerraSePreciso()`, que fecha a sessão vencida
   antes de decidir a rota — a ordem importa e não se inverte.

### 4.5 · Como se sai — três saídas, e elas não são a mesma coisa

| saída | o que faz | onde está |
|---|---|---|
| **a seta do cabeçalho** | fecha o **modo** e deixa a **sessão aberta**. O rótulo acessível diz isso com todas as letras: "Voltar ao Agora, deixando a sessão aberta" | `prototipo.html:566`, com `go("agora")` em `:787` — conferi |
| **o Voltar do sistema** | fecha **uma camada**: a folha aberta, ou o destino aberto de dentro do modo, ou o modo. Nunca fecha o app | `src/ui/navegacao.js`; 4.7 |
| **encerrar** | mata a **sessão**, não o modo: grava a duração, marca o fim como manual, gira a rotação | `finalizarSessao` em `src/main.jsx`; `fechaSessao` no mesmo arquivo |

E duas coisas que **não** são saída:

- **Não existe botão de salvar.** Sair do modo não guarda nada porque tudo já
  está guardado: `save()` é chamada em 59 lugares (`07-plano.md` §3.3) e cada
  série completa vai para o histórico na hora (o comentário acima de
  `abreSessao`, em `src/main.jsx`: "Não
  existe estado 'não salvo'"). São 26 casos em `tests/fluxo/sessao.test.js`.
- **A sessão morre sozinha**, e isso é regra de produto. Sem série nova por
  1h30 (`SESSAO_LIMITE = 90*60*1000`, `src/main.jsx`) a faixa **pergunta**;
  passados mais 10 min de graça (`GRACA_ENCERRAMENTO`) ela encerra
  sozinha, com a duração indo **até a última série** e o fim marcado como
  aproximado (`fechaSessao`). A batida que faz a pergunta aparecer
  sem reabrir o app está em `ligaBatida`, e `encerraSePreciso`
  fecha o que já passou da graça na abertura. Pausado não conta
  como esquecido, porque pausar é aviso e não ausência
  (`paradaDaSessao`).

### 4.6 · O que acontece ao voltar

1. **Cai na mesma série.** A posição é derivada, não guardada:
   `ondeEleEstava(estadosDoDia(s.day))` é o que alimenta o texto da faixa
   (`CTX.faixaDaSessao` em `src/main.jsx`, conferi), e é a mesma leitura que o modo usa para
   abrir onde ele parou. É o estado M1‑8.
2. **O descanso é recalculado, nunca retomado de um contador.** É "agora menos
   o instante da série", e é por isso que sobrevive ao bloqueio, a outro app e
   ao fechamento (`tests/fluxo/cronometro.test.js`, 12 casos). `retomaDescanso()`
   roda depois do render, porque a barra do cronômetro vive fora da árvore do
   Preact (`retomaDescanso` no boot de `src/main.jsx`, conferi).
3. **A posição de leitura volta.** Quem manda nela é o app, não o navegador:
   `history.scrollRestoration = 'manual'` em `src/ui/navegacao.js:131`, com a
   medição que motivou isso escrita no comentário. O caso que cobra está em
   `tests/fluxo/navegacao.test.js` ("voltar de um destino devolve a posição de
   leitura").
4. **Se a sessão morreu enquanto ele estava fora**, a faixa não está mais lá e
   o Agora diz o que aconteceu, com a duração dita como aproximada e uma
   pergunta só — "Está certo" / "Corrigir o fim" (conferi o estado M1‑13 em
   `momento-1.html:797-801`).
5. **O que ele registrou continua registrado.** Voltar não é confirmar.

### 4.7 · O encaixe em `src/ui/navegacao.js` — uma camada nova, e nada mais

Li o arquivo inteiro (151 linhas) e os nove casos de
`tests/fluxo/navegacao.test.js`. O mecanismo é este: `camadasAbertas(view)` é
uma **leitura** de `view`, feita na mesma ordem de prioridade que `telaCheia()`
usa para escolher o que desenhar, só que ao contrário — `telaCheia()` devolve o
primeiro `if` que casa, que é o que está **por cima**, então `camadasAbertas`
empurra de baixo para cima (`src/ui/navegacao.js:41-42` e `:53-66`). Depois de
cada `render()`, `sincronizaHistorico(n)` empurra uma entrada por camada nova e
consome as que o botão do app fechou. Cada entrada carrega a própria
profundidade (`{ lastro: k }`), e no `popstate` a pergunta é "em que
profundidade o histórico está agora?" — sem contador de eventos, de propósito.

**O que a sessão como modo exige, e é só isto:**

1. **Uma camada nova, a mais funda das telas cheias.** Hoje a sessão ao vivo
   **não é** camada: ela vive dentro da aba de treino, e o `view.sessao` que
   aparece em `camadasAbertas` (`:55`) é **outra coisa** — é o detalhe de uma
   sessão passada (`src/ui/telas/sessao.jsx`, cabeçalho: "O detalhe de uma
   sessão passada"; e `telaCheia()` em `src/main.jsx` confirma a
   cadeia). O modo entra como uma chave própria, empurrada **antes** de todas
   as outras na lista — porque tudo que se abre de dentro dele (o histórico do
   exercício, a câmera, o ajuste de foto, as folhas) fica **por cima** dele.
   Em `telaCheia()`, pelo espelho, o modo é o **último** `if` antes do
   `return null`.
2. **Nada mais.** Quem abre uma camada continua só ligando a flag; quem fecha,
   só desligando (`src/ui/navegacao.js:17-22`). A seta do cabeçalho desliga a
   flag do modo, e `sincronizaHistorico` consome a entrada órfã sozinho — é
   exatamente o caso que `tests/fluxo/navegacao.test.js` já cobra ("fechar pelo
   botão do app não deixa entrada órfã no histórico").

**O caso que a frente 0 precisa repontar, e o que ele passa a dizer:** "o
Voltar sai de um destino de tela cheia" (`tests/fluxo/navegacao.test.js`)
ganha o modo como destino. E o caso de `promocao.test.js` que diz "a decisão é
um destino que guarda e devolve a posição de leitura" deixa de ser sobre uma
camada: com a tela de decisão removida (D1), a lista mora em Prescrição, e
guardar a posição de leitura passa a ser assunto de `vaiPara` — não de
`camadasAbertas`.

**Uma consequência que vale dizer em voz alta:** hoje a faixa da sessão
**não** aparece dentro de destino de tela cheia, porque `src/ui/app.jsx:26`
devolve `ctx.telaCheia()` antes de montar a faixa e a barra — conferi. Com o
modo sendo tela cheia, a faixa não apareceria lá; é por isso que a pergunta de
1h30 tem de ser desenhada **dentro** do modo (4.3, item 1), e não herdada da
faixa.

---

## 5 · A regra de precedência do cartão de cima

O Agora responde "e agora?" com **um** cartão. Esta é a regra inteira, com as
colisões resolvidas uma a uma. A decisão do dono é que **o treino ganha da
refeição** (D4, PARADA 3), e ela entra como a regra 3.

### 5.0 · Acima do cartão, e não é cartão: o aviso de que nada vai ficar

Se o aparelho não está guardando — aba privada, armazenamento bloqueado —, o
aviso fica **acima** do cartão e diz até quando vale o que ele tocar. Conferi em
`prototipo.html:982` ("Este aparelho não está guardando… O que você marcar vale
até fechar esta aba — e não entra na conta dos 14 dias") e nos estados M2‑11 e
M2‑8. Não disputa o topo porque não é uma ação: é a condição de validade de
todas as outras.

### 5.1 · A ordem

**1 · A sessão aberta ganha de tudo.** Havendo sessão, a primeira coisa do Agora
é a faixa — "Treino A está aberto · N de M séries guardadas · Voltar à sessão".
Conferi a ordem no protótipo: a faixa (`prototipo.html:987-988`) vem antes do
cartão da refeição (`:995`). Razão: é o único estado em que o topo competiria
com um modo que já está aberto, e é o estado mais comum medido — de 42% a 59%
das sessões fecham sem ele (do parecer).

- **Colisão com a pergunta de 1h30:** se a sessão está parada há 1h30, a faixa
  **vira a pergunta** e mantém o topo. Já é assim:
  `CTX.faixaDaSessao` devolve a pergunta antes de qualquer outra coisa
  (`CTX.faixaDaSessao` em `src/main.jsx`, conferi).

**2 · A sessão de ontem que fechou sozinha ganha do treino de hoje.** Conferi o
estado M1‑13: a faixa "A sessão de ontem ficou aberta. Fechei na última série:
6h20 → 7h31, cerca de 1h11 (aproximada)" com "Está certo" / "Corrigir o fim"
(`momento-1.html:797-801`) está **acima** do cartão "Agora · treino das 6h15"
(`:803-808`). Razão: é uma confirmação sobre um registro **já escrito**, e o
número escrito está aproximado até ele dizer.

**3 · Enquanto o treino do dia não aconteceu, o treino ganha da refeição.** É a
decisão do dono. O pré‑treino desce para a linha de baixo e reaparece dentro do
descanso, que é onde ele de fato é marcado (`direcao-2.md` §2, e conferi as
linhas "Peso de hoje" e "Pré‑treino · 5h45" abaixo do cartão em
`momento-1.html:810-811`).

- **O que define "enquanto não aconteceu", sem usar a rotina do dono** — e isto
  é **proposta minha**, porque a decisão diz "manhã de dia de treino" e "manhã"
  não é um dado: o treino ganha o topo **enquanto a janela do treino previsto
  daquele dia não passou**. A janela vem do turno do dia (`S.dia.turno`,
  `tests/fluxo/turno.test.js`) e, sem turno declarado, do padrão semanal —
  **dito como palpite**, que já é a regra da D ("sessão registrada manda; sem
  ela, o palpite do padrão semanal, dito como palpite", `direcao.md`). Nenhum
  usuário precisa ter a manhã do dono (P3/D8: "Nada usa a rotina do dono como
  regra").
- **Colisão: treino à noite.** A mesma regra vale sem emenda — o treino ganha
  enquanto a janela dele não passou, e o dia se reorganiza sozinho em volta
  dela: conferi o estado M2‑13 (treino às 18h15, o pré anda, o café sai depois
  das 16h, o jantar fica e vira pós‑treino).
- **Colisão: dia de descanso.** Não há treino, então a refeição ganha **por
  ausência**, não por regra. E o turno não é oferecido em dia de descanso
  (`tests/fluxo/turno.test.js`).
- **Colisão: dia da aula.** A aula **é** a sessão daquele dia — é a 6ª posição
  da sequência, não "o sábado" (`direcao-2.md`). Entra por esta mesma regra 3, e
  o cartão dela é um botão só: "Fiz a aula" (conferi `aula.html`, estado 1).
- **Colisão: o treino já foi feito hoje.** A regra 3 se encerra, e vale a 4.
  Dois treinos no mesmo dia são possíveis (`tests/fluxo/ciclo.test.js`), e o
  segundo volta a ganhar pela mesma regra quando ele o começa.

**4 · Passada a janela do treino, a refeição do momento ganha o topo** — e a
regra dela tem duas metades:

- **A próxima refeição do plano cuja hora esteja a até 30 min à frente.**
- **O cartão de cima é só para frente.** Se não houver nada à frente, **não há
  cartão de refeição**: o que passou sem marca vira a linha "Pôr hoje em dia".
  Isto **corrige a regra escrita da D** ("se não houver, é a última que passou
  sem marca"), que se virava contra si mesma um segundo depois de marcar —
  marcado o lanche das 15h30, ela jogava o almoço das 12h30 para o topo como se
  fosse agora (`prototipo.md`, descoberta 6). Conferi a correção no protótipo:
  `momento()` em `prototipo.html:1059-1065` e a guarda `adiante` em `:993`.
- **A hora é a do plano, não a dele.** Decisão 14.6: o previsto usa o horário do
  plano. O lanche das 16h00 é o previsto mesmo que ele coma às 15h30; a janela
  de 30 min cobre os dois, e a marca grava o instante real do toque (conferi
  `prototipo.md`, "O lanche das 15h30").

**5 · Pesagem, sessão de fotos e cardio não disputam o topo: são linhas.** Cada
um tem um dia em que é previsto, e nenhum deles é "a próxima coisa a fazer" no
sentido que o cartão responde. Conferi: em M1‑13, "Peso de hoje" e "Pré‑treino"
são linhas com um botão de pílula, abaixo do cartão. O convite da sessão de
fotos quando faz 14 dias segue a mesma forma.

**6 · O vencimento da mudança do dia é aviso, não cartão.** Aparece **uma vez**,
no Agora da manhã daquele treino, e **nunca durante a sessão** (`direcao-2.md`
§3, pergunta 1). É a linha "Para decidir com calma", com o resumo da mudança e
um "Ver" — conferi em `momento-1.html:802`.

**7 · Quando nada compete, a tela não fica muda.** Três subcasos:

- **Dia já resolvido** (tudo marcado, treino feito): o topo passa a ser a
  **confirmação do que acabou de ser marcado**, com "Corrigir" — conferi
  `section.done` em `prototipo.html:1005-1013`. O app de hoje faz algo
  equivalente por outro caminho: `src/ui/telas/hoje.jsx:47-49` tem três
  recursos em cascata e o comentário diz por quê — "se tudo foi feito, o foco
  passa a ser a última, para a tela não ficar muda" (conferi).
- **Dia que ainda não começou** (5h20, nada marcado): o cartão é a primeira
  coisa do dia, o tipo de dia é dito como palpite, e a pesagem fica abaixo —
  conferi o estado M2‑7.
- **Dia de descanso, fora de qualquer janela:** ficam a linha do dia, a água e a
  contagem dos 14 dias, e **não há cartão**. Este estado **não está desenhado**
  em nenhum dos nove HTML que eu abri.

### 5.2 · O que a regra nunca faz, e a proposta que falta

**A regra nunca inventa.** Enquanto não há sessão registrada, o tipo e o horário
do dia são palpite, e o parecer mediu o preço de tratar palpite como fato: ~3
marcas falsas de buraco por semana, e o cardio prescrito hachurado
indefinidamente (do parecer, decisão 7). **Nenhuma das duas direções tem regra
que diga quando um previsto que é palpite pode virar buraco**, e `07-plano.md`
§1.2 diz que esta frente **propõe** a regra.

**A proposta.** Um previsto que é palpite aparece como **"por vir"** e nunca
como "sem marca". Ele vira dado declarado quando o dia se confirma, e o dia se
confirma por **um de três atos**:

1. **uma sessão registrada naquele dia** — que manda sobre o palpite, e isso já
   é a regra escrita da D;
2. **o dia marcado como descanso** (`S.descanso`, `src/dominio/tipos.ts`);
3. **a virada da data** — que é o instante em que o app já fecha o dia de comida
   e decide se ele vale uma linha de histórico (`fechaDiaDeComida`,
   `src/main.jsx`, com a frase que vale a regra inteira: "guardá‑lo
   como zero seria dizer que ele não comeu, que é o erro de medição que confunde
   silêncio com falha").

Por que esta e não outra: ela não precisa de carimbo novo no dado, usa os três
atos que o app **já** reconhece, e o terceiro é exatamente o momento em que o
domínio já distingue silêncio de zero. Consequências diretas: as marcas falsas
de buraco da manhã desaparecem, e a linha do cardio só vira "sem marca" quando a
semana fecha.

Como ela decide quando um palpite vira dado declarado, **ela volta ao dono como
proposta, não como pergunta** — é o que `07-plano.md` §1.2 manda.

---

## 6 · Onde aterrissam as três peças da C

### 6.1 · Peça 1 · As linhas do dia tocáveis — e a exceção que eu fui conferir não existe

**Existe hoje, inteira.** `src/ui/instrumento/timeline.jsx` dá a cada linha três
afordâncias: a caixa de marcar (`:45`), o corpo da linha como botão (`:46-53`) e
o `···` (`:60-62`). `src/ui/telas/hoje.jsx:120-122` liga as três.

**O que não bate.** O briefing desta frente e `07-plano.md` (§1.1 #6 e §3.3)
dizem que "hoje o app tira a caixa de marcar e o `···` de toda linha de refeição
**enquanto o treino está ativo**, de propósito", citando
`aoMarcar={treino ? null : …}` em `src/ui/telas/hoje.jsx:120`. **Conferi, e não
é isso.** A variável `treino` daquela linha vem de
`const treino = ctx.ehLinhaDeTreino(r);` (`src/ui/telas/hoje.jsx:101`), e
`ehLinhaDeTreino(r) { return r.id === 'treino'; }` (`src/main.jsx`,
conferi). É um teste de **tipo de linha**, não de sessão ativa.

O que o app tira é a caixa de marcar e o `···` **da linha do treino** — a linha
que não tem refeição para marcar e cuja edição é outro ato (ela abre o treino).
As linhas de refeição mantêm as três afordâncias **com ou sem sessão aberta**:
conferi `CTX.hoje()` (`src/main.jsx`) e nada ali muda `refs` nem as
afordâncias por causa de `S.sessao`; a única coisa que a sessão aberta muda é o
rótulo `sessao.meta` ("sessão aberta").

**O que isso faz com a peça.** Ela continua sendo "devolver o que o app já faz",
como `07-plano.md` §3.3 diz — mas **não há exceção para cair**, e a pergunta
1.1 #6 do plano (respondida pelo dono em 5.a' P4 com "sim, sempre") era sobre um
estado que não existe. A resposta do dono continua valendo como requisito, e ela
agora custa **zero** no Agora.

**Onde ela custa, então.** Em dois lugares, e só:

1. **No Agora da D.** É ali que está a regressão: as linhas do roteiro da D são
   `<li>` sem controle e sem `role` (do parecer §3.1 #3), e o protótipo as
   manteve inertes — conferi `prototipo.html:1029-1030`: `<li>` com `<svg>`,
   `<time>` e dois `<span>`, nenhum botão. **A peça aterrissa aqui**: a linha do
   dia no Agora volta a ter as três afordâncias.
2. **Durante o treino**, que na arquitetura nova não é mais "na aba de hoje com
   a barra visível". O modo esconde o resumo do dia (4.2), e "sempre, inclusive
   durante o treino" se cumpre por **dois** caminhos, não por pôr a timeline
   inteira dentro do modo: a **seta** devolve o Agora com um toque e a sessão
   aberta (4.5), e as **entradas rápidas do descanso** — pré‑treino, água, e o
   atalho de peso — resolvem o que é frequente sem sair (`direcao.md`, M1‑2).
   Pôr a timeline inteira dentro do modo contrariaria o que o próprio dono
   pediu: "na hora do treino pode ficar mais limpa" (do parecer, decisão 15).

### 6.2 · Peça 2 · Cada toque grava — o requisito é **não construir o lote**

**Já é assim.** Cada série completa entra no histórico na hora, e o fonte diz
"**Não existe estado 'não salvo'**" (`src/main.jsx`, conferi).
`marcaRefeicao` grava no mesmo gesto (`src/main.jsx`: `queueSave()` na
linha seguinte à marca, conferi). `save()` é chamada em 59 lugares
(`07-plano.md` §3.3, **do plano** — não recontei).

**O requisito, então, é negativo:** a folha de pôr o dia em dia **não** ganha um
botão de guardar, e o lote **não** se constrói. O dono já resolveu o conflito que
isso cria, e a resolução dele é literal (P3.i.6): **o pré‑marcado é sugestão até
o toque**; a folha abre com o plano marcado como proposta, nada daquilo é
registro, e **um** toque em qualquer linha — inclusive um "foi tudo isso mesmo" —
fecha o dia inteiro.

**O que isso exige de mim, e é consequência de camada:** a folha é uma `folha`
na pilha (`view.pilha`, `src/ui/navegacao.js:65`), e o Voltar do sistema fecha
uma folha por vez (`tests/fluxo/navegacao.test.js`). Então **fechar a folha
sem tocar em nada não grava nada** — e isso não é um efeito colateral a
consertar, é a diferença entre sugestão e registro, e é o que impede o F290/F292
(o dia chutado que destravou um corte de comida). O lugar onde a folha vive é
**Dias**, e ela é alcançável do Agora pelas linhas "Pôr hoje em dia" e "Pôr
ontem em dia" — que são a mesma folha (`direcao.md`, "o que o desenho não
mostra"). A folha em si é da frente 2.

### 6.3 · Peça 3 · A conta de volume na Prescrição — e a ordem é amarrada por uma função que ninguém testou

**A conta existe** em `src/dominio/volume.ts`, com **13 casos** em
`tests/dominio/volume.test.ts` (contei as 13 chamadas de `test(`).

**O que não bate, e muda o preço.** `07-plano.md` §3.3 diz que ela "já aparece
na tela — em `src/ui/instrumento/edicao.jsx:41` e em
`src/ui/telas/decisao.jsx:36`". Conferi: ela aparece em **quatro** lugares de
render, e as duas funções **não são a mesma**:

| onde | por qual função |
|---|---|
| a edição do treino de hoje — `src/ui/instrumento/edicao.jsx:41-45`, montado de `CTX.edicaoDoDia` | `impactoSeries` → `impacto()` de `volume.ts`, via `CTX.edicaoDoDia` em `src/main.jsx` |
| **o editor de programa** — o **mesmo** componente, montado de `programaDia` | `impactoOficial` → `impacto()` (`programaDia` em `src/main.jsx`) |
| **o painel de volume**, "fora do alvo do treinador" — `src/ui/telas/dados.jsx:220-225` | `impactoOficial` → `impacto()`, via `CTX.musculos` em `src/main.jsx` |
| a tela de decisão — `src/ui/telas/decisao.jsx:36-38` | **`impactoDoMod`**, que **não** está em `volume.ts`: está em `src/main.jsx` |

**E é aqui que a ordem fica amarrada.** A forma que a peça pede é a
**transição** — "subir uma série da flexora leva o posterior a 8 contra 7
prescritas" (`00-coordenacao.md`, P3.i.5) —, e a própria D desenhou exatamente
isso na Prescrição: "deltoide lateral passa de 12 para 13 séries na semana,
contra 12 prescritas pelo treinador" (conferi `prescricao.html`, estado 1).
**`impacto()` não produz transição**: ela afirma o número de agora — "peito: 12
na rotação · o treinador prescreveu 10" (`src/dominio/volume.ts`, com as
três formas asseridas em `tests/dominio/volume.test.ts`). A transição sai
**só** de `impactoDoMod`, e o **único chamador** dela é `CTX.decisao`
(`src/main.jsx`) — a tela que a D1 remove.

**Pior, e é o achado:** das quatro ramificações de `impactoDoMod` (`sets`,
`add`, `rm`, `troca`), **só `troca` tem teste** —
`tests/fluxo/edicao.test.js`, que cobra o aviso das 6 a 8 semanas. As
três ramificações que produzem o número "antes → depois" **não têm asserção em
lugar nenhum**: procurei a flecha e a frase "na rotação" nos testes e só achei
`volume.test.ts` (a forma do número de agora) e `telaprograma.test.js`, nos dois casos que cobram
`impactoOficial`. Ou seja: **a peça que o dono pediu descansa hoje numa
função sem teste, com um chamador só, e o chamador está marcado para sair.**

**O requisito, na ordem:**

1. `impactoDoMod` sai de `src/main.jsx` e vira função de domínio ao lado de
   `impacto()`, com teste para as quatro ramificações — `sets`, `add`, `rm` e
   `troca`;
2. a lista de Prescrição passa a ser o chamador dela;
3. **só então** `src/ui/telas/decisao.jsx` sai.

Fora dessa ordem, a conta desaparece entre uma coisa e outra — e é exatamente o
que `07-plano.md` §3.6 avisa.

### 6.4 · O outro lado do §3.6: o carregador da mudança pendente, e o que falta nele

`07-plano.md` §3.6 exige que `promoPendente` **não** se apague junto com a tela,
porque é o mecanismo de que a lista que espera e vence precisa. Conferi o
mecanismo, e ele tem **três buracos** para o uso novo:

1. **No fecho manual não existe carregador nenhum.** `fechaSessao` só escreve
   `S.promoPendente` quando `comoFim === 'auto'` (`src/main.jsx`,
   conferi, e o comentário diz por quê: "Pela porta da frente quem pergunta é
   `finalizarSessao`"). E `finalizarSessao` faz o oposto — `S.promoPendente =
   null` e abre a pergunta (conferi). Tirada a pergunta, **o fecho
   manual descarta a mudança em silêncio**, que é o F280 nominal. **Requisito:**
   o carregador se escreve nos **dois** fechos.
2. **A mudança do dia morre com a sessão.** `fechaSessao` termina com
   `S.mods = null` e o comentário "as mudanças do dia não sobrevivem ao fim da
   sessão" (`src/main.jsx`, conferi). Isso é correto para `S.mods` — o que
   vale o dia é do dia — e é justamente por isso que o carregador é
   obrigatório: sem ele não sobra cópia de nada.
3. **`promoPendente` guarda UMA, e a decisão do dono pede uma LISTA.** O tipo é
   `promoPendente: PromoPendente | null` (`src/dominio/tipos.ts`), e
   `PromoPendente` tem um `day` só (conferi). A escrita é atribuição
   direta (`src/main.jsx`), então o próximo fecho automático **sobrescreve**
   o anterior. A Prescrição da D mostra **três** mudanças esperando, de três
   treinos diferentes, cada uma com o seu vencimento (conferi
   `prescricao.html`, estado 1), mais uma quarta em "Venceu sem você". Isso não
   cabe no dado de hoje.
   E há um segundo lado, pior: **`promoPendente` não tem regra na fusão.**
   Procurei em `src/dominio/sincronia.ts` e não há nenhuma ocorrência — e o
   `funde()` trata **tudo que não é coleção** como documento, vindo inteiro do
   lado de `mtime` mais novo (`src/dominio/sincronia.ts`, conferi, com o
   comentário "clone do lado que manda nos documentos"). Para uma pergunta de um
   dia isso passa; para uma **lista de mudanças que vence**, significa que o que
   o celular registrou pode sumir porque o notebook sincronizou depois.
   **Requisito:** a lista vira **coleção com chave natural** (o dia mais o `sid`
   da sessão, que é o que distingue dois treinos no mesmo dia), com lápide para
   a decisão tomada não ressuscitar — a mesma disciplina de `comidaHist`,
   `protocolo.sessoes` e `aulas` (`src/dominio/tipos.ts`).

   **E isto é uma quinta mudança de dado persistido, que `07-plano.md` §3.4 não
   lista.** As quatro de lá são o instante da marca por refeição, qual refeição
   saiu do plano, "não contei a água" como fato e abrir `S.body`. Esta é a
   quinta, ela passa pelos mesmos seis portões, e ela carrega a decisão do
   próprio dono (5.a' P1 e P2). **Isto é da frente 0, não minha** — eu só a
   nomeio, porque descobri o buraco conferindo o lugar.

**O que o vencimento *não* precisa.** 5.a' P1 diz que vencer por posição "sai de
graça do modelo; nenhum carimbo novo no dado", e conferi que é verdade: a
posição de cada treino na sequência é `S.rot`, e o app já calcula qual é o
próximo e monta a fila com a marca de "próximo" (`src/main.jsx`). "O
dia em que aquele treino volta" é derivável de `day` + `S.rot`, sem campo novo.
O que **não** é de graça é guardar mais de uma mudança pendente, que é o ponto 3
acima.

---

## 7 · O que eu fui conferir e não bateu

Onde o código discorda do que estava escrito, **vale o código**. Sete pontos.

| # | o que estava escrito | o que o código diz |
|---|---|---|
| 1 | O app tira a caixa de marcar e o `···` das linhas de refeição **enquanto o treino está ativo** (`07-plano.md` §1.1 #6 e §3.3) | A variável daquele `if` é **tipo de linha**, não sessão ativa: `ehLinhaDeTreino(r) { return r.id === 'treino'; }` (`src/main.jsx`). As linhas de refeição mantêm as três afordâncias com ou sem sessão. **Não há exceção para cair** (§6.1) |
| 2 | A conta de volume "já aparece na tela — em **duas** telas" (`07-plano.md` §3.3) | Aparece em **quatro** lugares de render, e a tela que a D1 remove usa **outra função**: `impactoDoMod` (`src/main.jsx`), que não está em `volume.ts` e tem **uma** ramificação testada de quatro (§6.3) |
| 3 | `promoPendente` é o mecanismo de que a lista que vence precisa (`07-plano.md` §3.6) | É o mecanismo certo, mas guarda **uma** mudança (`src/dominio/tipos.ts`) e **não tem regra na fusão** — `funde()` a trata como documento (`src/dominio/sincronia.ts`). A lista da decisão do dono não cabe nele: é uma **quinta** mudança de dado, que `07-plano.md` §3.4 não lista (§6.4) |
| 4 | Tirar a pergunta e manter o carregador basta | No fecho **manual** o carregador nem é escrito: `fechaSessao` só o escreve em `'auto'` (`src/main.jsx`) e `finalizarSessao` o zera. Sem a pergunta, o fecho manual descarta em silêncio — o F280 nominal (§6.4) |
| 5 | "Placar na tela de hoje e registro sem sair dela" (`08-rede.md`, linha do `cardio.test.js`) | Placar e registro estão na aba **TREINO** (`src/ui/telas/treino.jsx:114-146`), e os casos que dizem "tela de hoje" rodam no padrão do harness, que é `'treino'` (`tests/fluxo/harness.js`). Levar o cardio para o Agora é mudança, não restauração (achado 4) |
| 6 | As duas direções especificam o Voltar por camada como novo, e ele está pronto (`07-plano.md` §3.5) | Pronto, e eu me encaixo nele. Mas o `view.sessao` que já está em `camadasAbertas` (`src/ui/navegacao.js:55`) **não é** a sessão ao vivo: é o detalhe de uma sessão passada (`src/ui/telas/sessao.jsx`). O modo é camada **nova**, e a mais funda (§4.7) |
| 7 | A bioimpedância "aceita ficar vazio" em todo campo, e são "treze números" (`corpo.html`, estado 6, e `direcao-2.md` recusa 4) | O desenho tem **quinze** campos dizendo treze — o próprio desenhista achou o erro (`prototipo.md`, descoberta 8). E a decisão do dono (5.a' P3) é **cinco** campos, **quatro deles obrigatórios**, o que **derruba a recusa 4 da D**. A decisão manda |

**O que eu fui conferir e bateu**, para a lista não ser só de divergência: as
151 linhas de `src/ui/navegacao.js` e os 9 casos de
`tests/fluxo/navegacao.test.js`; os 9 casos de `tests/fluxo/promocao.test.js`;
os 13 casos de `tests/dominio/volume.test.ts`; as 32 chaves de topo do `Estado`
sob asserção em `tests/fluxo/dados.test.js`; `MIN_REGISTRADOS = 11` em
`src/dominio/corpo.ts`; a guarda `|| S.sessao` de `abrePromoGuardada`
(em `src/main.jsx`); e as 14 regras de `RULES` em
`src/dominio/programa.ts`.

---

## 8 · As decisões do dono, e o fluxo que as obedece

Nenhuma destas se reabre aqui.

| a decisão | o fluxo que a obedece |
|---|---|
| **A mudança do dia vence por posição**, quando aquele treino voltar (5.a' P1) | §8.1, passos 3 e 5. Não pede carimbo novo: a posição é `S.rot`, e o app já calcula o próximo (`src/main.jsx`) |
| **Ao vencer, vira "só daquele dia", dito e desfazível** (5.a' P2) | §8.1, passo 5. O bloco "Venceu sem você" da `prescricao.html` é a forma |
| **A pergunta do fim do treino sai; o mecanismo fica** (D1 + §3.6) | §6.4 — e o mecanismo precisa de três consertos antes de servir |
| **A pesagem entre séries vale lá também, por atalho** (5.a' P5) | O descanso tem a tecla "Peso de hoje", que **abre Corpo** com a mesma régua. O dono do dado é Corpo (1.3, 1.7) |
| **Cinco campos de bioimpedância, e o peso dela é registro separado** (5.a' P3, 5.a''') | Corpo possui os dois registros, e eles convivem na tela de propósito (1.3). A migração é da frente 0 |
| **A folha de pôr em dia abre pré‑marcada como sugestão** (P3.i.6) | §6.2: nada é registro até o toque, um toque fecha o dia, fechar a folha sem tocar não grava. A folha vive em **Dias**, alcançável do Agora |
| **O treino ganha da refeição** (D4) | §5.1, regra 3, com a janela do treino previsto como definição operacional |
| **As linhas do dia tocáveis valem sempre** (5.a' P4) | §6.1: no Agora elas já valem; durante o treino valem pela seta e pelas entradas rápidas |
| **Cada toque grava, sem botão de guardar** (peça 2) | §6.2: o requisito é não construir o lote |
| **O tema segue o aparelho, com troca manual** (D10) | A troca manual é de **Ajustes** (1.6). O resto é da frente 4 |
| **Reescrever os testes de fluxo em bloco, com a rede antes** (D13) | §2 e §3 são a lista contra a qual a reescrita se confere. Três casos trocam de asserção de propósito: achado 4, achado 5 e o de `promocao.test.js` citado em §4.7 |

### 8.1 · O fluxo do vencimento, passo a passo

1. **Na sessão**, ele muda algo do dia — séries, repetições, descanso, remover,
   mover, trocar, acrescentar. A mudança é de `S.mods`, vale o dia, e a conta de
   volume aparece na hora de mexer (`impactoSeries`,
   `src/ui/instrumento/edicao.jsx:41-45`).
2. **A sessão morre** — por encerrar (toque) ou por inatividade (1h30 + 10 min
   de graça). **Nos dois casos** a mudança é copiada para a lista que espera, e
   `S.mods` zera como já zera (`fechaSessao` em `src/main.jsx`). Nenhuma
   pergunta é feita.
3. **A lista mora em Prescrição.** Cada linha diz: o que mudou, de que sessão
   veio, **quando vence** — o dia em que aquele treino volta —, e **a conta de
   volume se virar permanente**. Duas respostas do tamanho do polegar, "Foi só
   naquele dia" / "Virou permanente", e um motivo opcional no teclado do
   sistema, porque é texto e ele está sentado (conferi `prescricao.html`,
   estado 1).
4. **Na manhã do dia em que aquele treino volta**, o Agora mostra **um** aviso:
   a linha "Para decidir com calma", uma vez, e **nunca durante a sessão**.
5. **Se ele não decidir até lá, a mudança vence** e não some: vira "só daquele
   dia", **dito** ("Ficou como só daquele dia quando o Treino B voltou") e
   **desfazível** ("Tornar permanente agora"), e a sessão onde ela aconteceu
   continua com o que foi registrado (conferi o bloco "Venceu sem você" em
   `prescricao.html`, estado 1). Nada entra no programa em silêncio, e nada é
   descartado em silêncio.
6. **Decidida ou vencida, a linha sai da fila e deixa lápide**, para a fusão não
   a ressuscitar — a mesma disciplina das outras coleções com chave natural.

---

## 9 · O que esta frente não decide, o que fica para depois, e o que ninguém mediu

**O que ela não decide**, por mandato: o estado e a interação dentro de cada
lugar (frente 2), as palavras — inclusive os nomes dos cinco lugares (frente 3),
e os tokens, a escala e o movimento (frente 4).

**O que fica para depois, declarado:**

- **Dias não tem desenho** (achado 6). É o lugar que recebe mais capacidade
  pronta e o único dos cinco sem pixel para conferir.
- **O Agora de um dia de descanso fora de qualquer janela** não está desenhado
  em nenhum dos nove HTML (§5.1, regra 7).
- **O destrutivo** segue sem desenho, com três endereços (achado 8). O
  comportamento de hoje fica, e fica dito.
- **A bancada e a superfície de conflito entre dois aparelhos** não têm lugar
  (achado 9).
- **O "ciclo"** não tem lugar em desenho nenhum que eu abri (achado 7). Proposta:
  Semana.
- **As catorze regras do treinador e o alvo por tipo de dia** não tinham lugar
  (achado 2). Proposta: Prescrição. Não muda regra nenhuma, então não volta à
  mesa do dono.
- **O deload** muda de lugar contra uma razão escrita no fonte (achado 3). **Isto
  muda uma regra**, e por isso volta à mesa dele com os dois argumentos.
- **A regra do palpite que vira buraco** (§5.2) é proposta desta frente, e
  `07-plano.md` §1.2 manda que volte a ele como proposta.

**O que ninguém mediu, e esta frente herda sem inventar número:**

- **A seta de saída da sessão nunca foi medida em aparelho.** Ela nasceu no
  protótipo (`prototipo.md`, "o que consertei"), fica no canto de cima do
  cabeçalho — o ponto mais longe do polegar numa tela de iPhone 11 Pro Max — e
  é a única saída visível do modo. C3 mediu os alvos dos HTML, não este. **Não
  medido**, e é medição da frente 2, com aparelho e dedo.
- **Quantas camadas o uso real empilha**, e portanto quantas vezes o Voltar é
  apertado numa sessão. **Não medido.**
- **Se o aviso do vencimento aparecendo uma vez é suficiente** para ele decidir
  antes do prazo. O protótipo testou impressão em três minutos, não hábito ao
  longo de semanas (do plano, risco 6). **Hipótese, não fato.**
- **A frequência com que ele corrige uma série de semanas atrás** — o que daria
  o peso do achado 1. **Não medido.**
