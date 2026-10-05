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
   `setCarga` em `src/main.jsx:3822-3825`). São 11 casos em
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
(`programaDia` em `src/main.jsx:6423-6453`). Cada linha ganha a porta para o
histórico daquele exercício, e o renome e o tipo de carga vão com ela. A
correção de uma série passada ganha **duas** portas, porque são duas perguntas:
em **Dias › detalhe da sessão** a unidade é o **dia** (corrigir a duração,
apagar o treino — `src/ui/telas/sessao.jsx`, e o cabeçalho do arquivo diz
exatamente isso), e no **histórico do exercício** a unidade é a **série**.

### Achado 2 · As catorze regras de execução do treinador não têm lugar em nenhuma das duas direções

Elas existem, com texto escrito e procedência: `RULES` em
`src/dominio/programa.ts:136`, **catorze entradas** — contei as chaves: `regra
1` a `regra 5`, `volume`, `hyrox`, `fadiga`, `atenção`, `aquecimento`,
`deload`, `bike`, `prioridades`, `sucesso`. São servidas por
`src/main.jsx:5081` e desenhadas em `src/ui/telas/guia.jsx:139-155`, uma aberta
por vez, com a procedência da pegada dita **uma vez só** ali e não em cada
cartão. No mesmo modo mora **o alvo calórico por tipo de dia, calculado do
plano e nunca escrito à parte** (`src/ui/telas/guia.jsx:119-136`, com a
procedência explícita; o caso que o cobra é `tests/fluxo/fusao.test.js:209`).

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
`'treino'` (`tests/fluxo/harness.js:321`). O nome do caso e o comentário do
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
`src/main.jsx:4866`, conferi). Dessas três:

- **séries feitas de prescritas** está no cabeçalho da sessão da D ("série N de
  M") e no mapa da sessão — conferi em `prototipo.html:567-577`;
- **volume do dia** já tem casa: o detalhe da sessão mostra "volume · kg×reps"
  (`src/main.jsx:5932`, conferi), e o detalhe é de Dias;
- **ciclo** não aparece em desenho nenhum que eu tenha aberto.

**Proposta:** ciclo é leitura de Semana, ao lado da retrospectiva do bloco —
é a mesma pergunta ("em que ponto do bloco eu estou"). Não conferi os nove HTML
inteiros procurando o ciclo com outro nome.

### Achado 8 · O destrutivo segue sem desenho, e agora precisa de três endereços

`07-plano.md` §4 registra que nenhuma das duas direções trata apagar. Hoje:

- **apagar uma medida** passa por `confirm()` do sistema com o estrago
  delimitado em texto — "Sai da média da semana e do ritmo. As outras medidas
  ficam." (`delBody`, `src/main.jsx:3370-3383`, conferi);
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
