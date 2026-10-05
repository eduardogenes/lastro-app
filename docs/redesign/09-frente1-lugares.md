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

---

## 1 · Os cinco lugares, e o que cada um possui

A barra de baixo passa a ter cinco: **Agora · Dias · Corpo · Semana ·
Prescrição** (`docs/redesign/03-direcao-D/direcao-2.md` §2; conferi os cinco
no `tabbar()` de `docs/redesign/03-direcao-D/prototipo.html:1068`). A partição
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
| a marca de refeição **de hoje** e a porção **de hoje** | `S.dia.done` e `S.dia.escala`; `marcaRefeicao` em `src/main.jsx:2055-2059`, `setEscala` em `:2067` |
| a água de hoje | `S.dia.agua`; `setAgua` em `src/main.jsx:2060` |
| o tipo de dia e o turno do treino, na linha do cabeçalho | `S.dia.turno`; o botão de estado em `src/ui/app.jsx:39-43`, a regra em `tests/fluxo/turno.test.js` (9 casos) |
| a porta de entrada da sessão | hoje o cartão-foco aponta para a aba de treino (`src/ui/telas/hoje.jsx:68`) |
| o placar do cardio da semana e o registro dele sem sair da tela | hoje em `src/ui/telas/treino.jsx:114-146`; a regra em `tests/fluxo/cardio.test.js` (10 casos) |
| a contagem dos 14 dias que a regra lê | a `Sparkline` de 14 fatias, `src/ui/instrumento/primitivos.jsx:130` |
| o convite da sessão de fotos quando faz 14 dias, e o convite da pesagem da manhã | `S.protocolo.sessoes`, `S.body.peso` |
| a presença da aula, no dia da aula | `tests/fluxo/aula.test.js`, `tests/fluxo/aulaimport.test.js` |
| a faixa da sessão aberta e a pergunta de 1h30 | `src/ui/instrumento/faixasessao.jsx`; `CTX.faixaDaSessao` em `src/main.jsx:6894-6915` |
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
| os dias de comida já fechados | `S.comidaHist` (`src/dominio/tipos.ts:541`); a virada em `fechaDiaDeComida`, `src/main.jsx:1871` |
| as sessões registradas e o detalhe de uma sessão, com corrigir a duração e apagar o treino | `S.done`; `src/ui/telas/sessao.jsx` |
| o registro retroativo de treino, com e sem séries, com e sem hora | `src/ui/telas/retroativo.jsx`; `tests/fluxo/retro.test.js` (9 casos) |
| marcar um dia passado como descanso | `S.descanso` (`src/dominio/tipos.ts:600`) |
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
| o peso, com uma medida por dia, aceitando vírgula, substituindo a do mesmo dia e podendo ser lançado em data bem anterior (nunca futura) | `S.body.peso`; o seletor de data em `src/main.jsx:3288-3302`; `tests/fluxo/corpo.test.js` (25 casos) |
| a cintura, com data por medida e sem se misturar com o peso | `S.body.cintura` (`src/dominio/tipos.ts:481`) |
| as medidas com fita, e **como ele mediu**, em texto dele | não existe hoje: `S.body` é `{ peso, cintura }`, fechado no tipo (`src/dominio/tipos.ts:481`) e na fusão (`src/dominio/sincronia.ts`) — conferi as duas chaves |
| a bioimpedância, **cinco campos** (5.a', P3), com o **peso dela como registro separado** da pesagem da manhã (5.a''') | não existe hoje; é a migração da frente 0 |
| as fotos do corpo: a sessão de fotos, o ajuste de enquadramento, a comparação | `S.protocolo`; `tests/fluxo/protocolo.test.js` (58 casos), `tests/fluxo/fotos.test.js` (20 casos) |
| a leitura de gordura visual, respondida sobre o par de fotos | `S.gordura` (`src/dominio/tipos.ts:559`) |
| o destrutivo das medidas, com o estrago delimitado em texto | `delBody` em `src/main.jsx:3370-3383` |

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
| o veredito da regra, com os números que o produziram, e os três portões (taxa, força, adesão) | `veredito` em `src/dominio/corpo.ts:173-235`, com `MIN_REGISTRADOS = 11` em `:135` (conferi); a tela em `src/ui/telas/dados.jsx:346-356` |
| o passo de ±150 kcal e o saldo acumulado, com a procedência de cada passo | `S.ajuste` e `S.ajusteHist` (`src/dominio/tipos.ts:551-552`); `tests/fluxo/ajuste.test.js` (14 casos) |
| a média semanal do peso e a taxa entre semanas | derivado de `S.body.peso` por `src/dominio/corpo.ts`; a mesma leitura aparece em Corpo |
| a força estimada, a tendência e o sinal manual | `S.perfManual` (`src/dominio/tipos.ts:566`); `tests/fluxo/ritmo.test.js` |
| as séries por músculo e a leitura das linhas **em conjunto**, que nomeia a inversão | `seriesPorMusculo` e `leituraDaSemana` em `src/dominio/volume.ts:77` e `:153`; o painel em `src/ui/telas/dados.jsx:220-225`; `tests/fluxo/leitura.test.js` (3 casos) |
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
| o programa do treinador, congelado, e a diferença lida como troca | `PROGRAMA` em `src/dominio/programa.ts`; `difDoDia` em `src/main.jsx:2638` |
| o histórico de mudanças do programa, com o motivo | `S.progLog`; `aplicaAoOficial` em `src/main.jsx:2550-2583` |
| o catálogo de exercícios, o cadastro, o renome e o arquivado | `S.ex`; o renome em `src/ui/telas/historico.jsx:30-45`; `tests/fluxo/dados.test.js` |
| o plano alimentar, a base de alimentos e as compras | `S.comida.plano`, `S.comida.alimentos`, `S.compras`; `src/ui/telas/comida.jsx` |
| o padrão semanal (a cadência) | `S.cadencia`; hoje em `src/ui/telas/guia.jsx:160-182`, modo "o app" — conferi, e o teste diz por quê: "a cadência é ajuste, não prescrição" (`tests/fluxo/fusao.test.js:190`) |
| a revisão que chega com outro nome, perguntando antes de gravar | `tests/fluxo/aula.test.js`/`trocaprograma.test.js`; `prescricao.html`, estado 6 |
| **a lista das mudanças do dia que esperam decisão, e que vencem** | `S.promoPendente` (`src/dominio/tipos.ts:584`); hoje a pergunta é `src/ui/telas/decisao.jsx` |
| **a conta de volume de cada mudança que espera** (peça 3 da C) | seção 4 |

**Não possui:**

- **nenhum registro.** Prescrição é o que vem de fora mais o que ele decide
  manter. O que aconteceu é de Dias.
- **a mudança enquanto a sessão está viva.** Enquanto a sessão existe, a
  mudança do dia é da sessão (`S.mods`). Prescrição a recebe depois.

### 1.6 · Os ajustes, que não são lugar

Um botão no canto do Agora. **Possui:** a conta e a sincronia (`S.mtime`,
`S.apagados`; `tests/fluxo/sincronia.test.js`, 12 casos), a cópia de segurança
e a restauração (`src/main.jsx:3458-3486`; `tests/fluxo/dados.test.js`, 19
casos), apagar o histórico (`wipe()`), a versão e a atualização
(`tests/fluxo/publicacao.test.js`, 13 casos), e a troca manual de tema (D10).

**Não possui** nenhuma decisão de treino ou de comida.

### 1.7 · O mesmo dado em dois lugares: quem é dono, quem é vista

| o dado | dono | vista |
|---|---|---|
| peso do dia (`S.body.peso`, `src/dominio/tipos.ts:481`) | **Corpo** | Agora (o convite da manhã, o atalho do descanso); Semana (a média e a taxa) |
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
| quadro da aula (`S.quadro`) | **a sessão**, e ao encerrar ele vira a nota em `S.done` (`src/main.jsx:645-651`) | Dias (a nota da sessão) |

**A regra que fecha esta seção:** se uma tela mostra um dado que não é dela,
ela mostra **e não escreve**. A única exceção autorizada é o atalho de peso
dentro do descanso, e ele não escreve: abre Corpo (seção 2, e é a resposta de
5.a' P5).
