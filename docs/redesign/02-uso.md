# 02 · Uso

Quem escreve é o Pesquisador do uso. Este arquivo diz quais situações de uso
acontecem, quantas vezes, com que dificuldade, onde o uso falha, e nomeia os
dois momentos que todo designer do time vai desenhar.

**Resumo.** Os dois momentos são **M1 · Entre duas séries, na academia, com o
relógio contra** e **M2 · Depois de comer, no meio do dia**. O critério e as
medidas estão na seção 9.

---

## 0 · Como ler

**De quem são os números.** Há um usuário só hoje (F5, F9), e todo número de
uso é dele. O dono pede que esse caso seja lido como o maior exemplo, não como
regra absoluta, porque o produto terá outros usuários (P3). Onde uma condição
for só dele, o texto diz "no caso medido".

**O que o dono pede que não se perca.** O desenho novo não precisa se prender
ao que existia; os dados precisam se manter sempre (Orientação geral).

**Os dois períodos da P1.** Os números do registro real vêm da contagem que o
coordenador fez na cópia de segurança do dono de 01/10/2026 (P1).

- **P1-A**: de 06/08 a 30/09/2026, 56 dias, 8 semanas (conta minha).
- **P1-B**: de 03/09 a 30/09/2026, 28 dias, 4 semanas (conta minha).

A P1-B é a janela de referência: nela a prescrição de treino ficou em 90 séries
por semana, em 5 sessões e uma aula (F80, F83). A revisão de 21/09 trocou
séries de lugar dentro do treino B sem mudar o total (F262; conta minha: −1 +1
−1 +1). As taxas por semana são contas minhas sobre a P1: o total dividido por
8 ou por 4.

**Fontes.** F = 01-fatos.md. P = resposta do dono em 02-perguntas.md. "git"
= mensagem de commit, citada pelo hash; para ler, `git log --no-walk
--format='%ad %h %s%n%b' <hash>`. "Conta minha" = aritmética sobre os números
citados ao lado. **Prescrito, não medido** marca o número que vem do que o
treinador, o nutricionista ou o código mandam acontecer, e não do que
aconteceu.

**Desde quando cada dado existe.** Alguns contadores da P1 só começam no meio
da P1-A, e isso muda a leitura:

| dado | existe desde | fonte |
|---|---|---|
| pesagem com data passada | 24/08 | git e443697, ccc6299 |
| dia passado marcado como descanso | 24/08 | git f5e3011 |
| RIR por série (antes, um por exercício) | 24/08 | git 06a8cdb; F138 |
| marca de registro apagado | 24/08 | git 4d3a5cb |
| apagar uma sessão da prescrição | 02/09 | git ad278dc; F295 |
| dia de comida guardado depois da meia-noite | 09/09 | git 1e850ed; F288 |

As datas de cada linha saem de `git log --no-walk=sorted
--date=format:'%d/%m/%Y %H:%M' --format='%ad %h %s' e443697 ccc6299 f5e3011
06a8cdb 4d3a5cb ad278dc 1e850ed`.

---

## 1 · As situações de uso

Cada situação diz quem, onde, quando, em que estado do corpo, com o que na mão,
para fazer o quê, com quanto tempo e com que rede, e depois o que foi medido.
Quem: em todas, a pessoa que segue as duas prescrições (F1); no caso medido, o
dono.

### Na academia de musculação

**U1 · Entre duas séries: registrar a série.**
- Onde e quando: na academia, no descanso entre uma série e a próxima, de 1:30
  a 3 min prescritos (F29). No caso medido, 20 de 28 sessões ao vivo começaram
  às 6h (P1), com hora-limite para terminar por volta de 7h40, porque ele
  precisa estar no trabalho às 8h (P2). As outras 8 foram às 11h, 13h, 15h,
  17h, 17h, 18h, 18h e 20h (P1).
- Corpo: de pé, logo depois do esforço, suado (F28).
- Na mão: no caso medido, o celular fica na mão a maior parte do tempo; ele
  bloqueia sozinho no intervalo; há música, às vezes podcast ou livro em áudio;
  às vezes ele vai a um aplicativo de conversa e volta (P3). Com outro
  aplicativo na frente, o produto fica suspenso e só o relógio de parede anda
  (F57). Uma mão livre (F28).
- Para fazer o quê: deixar dois números, carga e repetições, e, se quiser, o
  RIR (F33, F137). Na maior parte das séries a carga é a mesma da série
  correspondente da última sessão (F171), e as repetições sobem aos poucos até o
  topo do intervalo (F95).
- Tempo: o que sobra do descanso, que também serve para beber água, conferir a
  comida e registrar o peso da manhã (F30) e para o resto do celular (P3).
- Rede: no caso medido, subsolo com sinal ruim (F25). O registro não depende de
  rede (F72).
- Medido: 192 séries em P1-B, 48 por semana (P1; conta minha: 192 ÷ 4). Cerca
  de 16 por sessão registrada ao vivo (conta minha: 192 ÷ 12), contra 18 por
  sessão na média prescrita (conta minha: 90 ÷ 5; prescrito, não medido). RIR
  em 126 das 192 séries, 66% (P1; conta minha).

**U2 · Ao chegar: começar a sessão.**
- Onde e quando: na entrada da academia, no caso medido às 6h, com o app aberto
  no subsolo (F73), antes do aquecimento ou na primeira série (F152).
- Corpo: ainda sem esforço, recém-saído de casa, depois do pré-treino (F38).
- Medido: 12 sessões ao vivo em P1-B, 3 por semana; 9 começadas antes do
  aquecimento e 3 na primeira série (P1). Em P1-A, 14 e 13 (P1).

**U3 · No fim, com o relógio contra: terminar a sessão.**
- Onde e quando: na academia, no caso medido antes de ~7h40 (P2), quando a
  sessão aperta e ele corta exercícios que não são prioridade naquele dia (P2).
  É aqui que se decide se o que mudou no dia vira permanente (F159).
- Corpo: no fim do treino, cansado e com pressa de sair.
- Medido: em P1-B, 7 sessões encerradas por ele e 5 fechadas sem ele, de 12 ao
  vivo, 42% sem ele; em P1-A, 10 por ele, 16 sem ele e 1 sem fim, de 27, 59%
  sem ele (P1; conta minha). Quando ela fecha sem ele, a duração vira
  aproximada (F152).

**U4 · Máquina ocupada, quebrada ou outra academia: trocar o exercício na hora.**
- Onde e quando: no meio da sessão, com a máquina prescrita ocupada (F26),
  quebrada ou numa academia diferente (F27).
- Para fazer o quê: escolher um substituto que quase nunca executou (F109),
  descobrir qual máquina desta academia corresponde ao nome (F110), e seguir com
  o histórico certo (F151).
- Medido: em P1-B, 4 exercícios feitos com substituto e 2 mudanças só do dia em
  17 sessões, 1,5 por semana; em P1-A, 8 e 2 em 35, 1,25 por semana (P1; conta
  minha). Exercícios pulados: 0 em P1-B, 2 em P1-A (P1).

**U5 · Uma série além das prescritas.**
- Quando: no meio de um exercício, quando ele decide fazer uma série a mais do
  que a prescrição tem (P12).
- Medido: a frequência não foi contada. O dono diz que hoje isso é trabalhoso e
  deveria ser direto (P12).

**U6 · Depois da musculação: o cardio.**
- Onde e quando: na academia, depois da sessão, 20 a 30 min, duas vezes por
  semana (F46; prescrito, não medido).
- Medido: 0 em P1-B, 1 em P1-A, contra 16 prescritos em 8 semanas (P1; conta
  minha: 2 × 8). A P1 não diz se o cardio não aconteceu ou se não foi
  registrado.

### No box

**U7 · A aula de HYROX: registrar que foi e, se quiser, o que fez.**
- Onde e quando: no box, uma vez por semana, na quinta ou no sábado, sem dia
  fixo; às vezes nos dois, o que é raro (P4, F21).
- Corpo: durante a aula ele não pega no celular (P3); ele fica na mochila
  (F36). A janela de registro é depois da aula, sentado, ofegante, e curta
  (F36).
- Para fazer o quê: marcar que fez a aula, sem ser obrigado a detalhar; se
  quiser, guardar os pesos usados e quanto correu (P4). O conteúdo só se
  conhece ao chegar, pela lousa (F37); no mesmo round há medidas em unidades
  diferentes (F129).
- Rede no box: não respondida (P4).
- Medido: 2 aulas em P1-B (1 registrada depois do dia) e 5 em P1-A (4
  registradas depois do dia), contra uma por semana (P1, F21). Nenhuma com
  movimentos e nenhuma com lousa transcrita, nos dois períodos (P1).

### Em casa, de manhã

**U8 · A pesagem.**
- Onde e quando: em casa, de manhã, antes de treinar, em semi-jejum (depois de
  comer algo leve), com o mesmo tipo de roupa (P6, F42).
- Medido: 11 pesagens em P1-B, 2,75 por semana; 20 em P1-A, 2,5 por semana,
  contra 3 a 4 por semana prescritas (P1, F42; conta minha). Com data passada:
  4 de 11 em P1-B, 36%; 10 de 20 em P1-A, 50% (P1; conta minha). Entre as que
  entraram no próprio dia, 7 de 11 entraram entre 6h28 e 7h52, e uma vez cada
  às 9h04, 10h50, 15h10 e 17h57 (P1). Essa é a hora em que entraram no
  registro, não necessariamente a hora da pesagem (P1). O intervalo 6h28–7h52 cai dentro da
  janela da musculação (P1, P2): o número sai de casa e entra no registro na
  academia ou depois dela (inferência minha; o lugar não está registrado). Por
  dia da semana, em P1-A: quinta 5, terça 4, segunda 3, quarta 3, sábado 2,
  domingo 2, sexta 1 (P1).

**U9 · A sessão de fotos do corpo.**
- Onde e quando: em casa, no mesmo canto, com a mesma luz, normalmente terça ou
  quinta, sem dia certo (P7); prescrita de manhã, em jejum, antes de comer e de
  treinar, a cada 14 dias (F226, F228; prescrito, não medido).
- Corpo: de roupa justa, descalço (F228), sozinho, a cerca de 3 m do celular
  apoiado, sem alcançá-lo (F45).
- Medido: as sessões feitas na rotina foram em 04/09 (sexta), 15/09 (terça) e
  01/10 (quinta), com intervalos de 11 e 16 dias (P1; dias da semana por `date
  -d 2026-09-04 +%A` e as outras datas; conta minha). Do primeiro ao último
  disparo: 214 s, 129 s e 88 s (P1). As duas de setembro tiveram 8 e 9 poses;
  a de 01/10, 9 (P1). As cinco sessões até 24/08 são fotos antigas trazidas
  para o registro (P1).

### Ao longo do dia

**U10 · Depois de comer: marcar o que comeu e bebeu.**
- Onde e quando, no caso medido (P5): pré-treino em casa, umas 5h e pouco, quase
  6h; café da manhã entre 8h e 8h30, no trabalho (P5, F39); almoço (hora e
  lugar não ditos; o plano diz 12h30, F181); lanche por volta de 15h30; ele sai
  do trabalho às 18h; jantar por volta de 19h30–20h; às vezes uma ceia depois.
  Nos dias de treino fora da manhã, o pré e o intra-treino andam junto com a
  sessão (F189), o que aconteceu em 8 de 28 sessões (P1).
- Corpo: sentado, sem esforço (F40).
- Na mão: a comida. Com quem ele come e se o celular está à mão: não
  respondido (P5).
- Para fazer o quê: dizer que comeu cada refeição, se inteira ou só parte
  (F195, F199), quantos copos de água (F194) e como o dia foi: seguiu o plano,
  saiu sabendo o que comeu, ou saiu sem saber quanto (F195).
- Tempo: sem pressa física; a marcação disputa atenção com o trabalho e com o
  resto do dia. O dono diz que tem muita dificuldade em salvar o que fez (P5).
- Rede: não medida.
- Medido: 1 dia com refeição marcada em 22 dias possíveis, de 09/09 a 30/09
  (P1; antes de 09/09 o dia de comida não sobrevivia à meia-noite, F288). As
  marcações desse dia, 10/09, foram feitas em 11/09 às 13h41 e em 14/09 às 17h23
  (P1), ou seja, 1 e 4 dias depois. Dias de comida guardados: 2 (P1); como um
  dia sem nenhuma marca, sem água, sem tipo e sem horário não é guardado (F198),
  a água foi marcada em 2 dias no máximo (conta minha). A P1 não trouxe a média
  de copos.

### Depois, de memória

**U11 · Pôr em dia o que ficou para trás.**
- O que é: registrar num dia o que aconteceu noutro: a sessão de musculação, a
  pesagem, o dia que foi descanso, a aula, a comida.
- Onde e quando: não registrado. As únicas horas conhecidas são as das
  marcações de comida, às 13h41 de uma sexta e às 17h23 de uma segunda (P1;
  dias da semana por `date -d`).
- Medido em P1-B: 5 sessões registradas depois do dia, 4 pesagens com data
  passada, 3 dias passados marcados como descanso e 1 aula registrada depois do
  dia, 13 registros em 4 semanas, 3,25 por semana, além do único dia de comida
  (P1; conta minha). Em P1-A: 8, 10, 10 e 4, 32 em 8 semanas, 4 por semana (P1;
  conta minha). Em P1-B, chegaram depois do dia 29% das sessões (5 de 17), 36%
  das pesagens (4 de 11), 1 de 2 aulas e todas as marcações de comida (P1; conta
  minha).

**U12 · Apagar ou corrigir o que foi registrado errado.**
- Medido: no arquivo inteiro, 20 sessões, 16 registros de exercício (4 deles
  movimentos de aula), 7 pesagens, 4 fotos de equipamento e 1 medida de
  cintura apagados (P1). As marcas de apagado só existem desde 24/08 (git
  4d3a5cb). Substituir a pesagem do dia também deixa uma marca de apagado (git
  4d3a5cb), então as 7 pesagens não são todas erro. Os 4 movimentos de aula são
  compatíveis com a conversão de 09/09 que zerou, a pedido dele, o histórico das
  estações de HYROX (F254, F283; git 74d36eb). A causa das 20 sessões apagadas
  não está registrada. Elas são 20 contra 35 que ficaram (P1).

### Sentado, sem pressa

**U13 · Comparar as fotos antigas com a atual.**
- O dono diz que vê bastante as comparações entre as fotos antigas e a atual
  (P8). Lugar e aparelho não ditos.
- Rede: o aparelho guarda os arquivos só das 4 sessões de fotos mais recentes,
  e as antigas vêm da cópia remota (F232); a cada atualização publicada do app,
  a cópia local das fotos do corpo é apagada (F252). Comparar com uma sessão
  antiga depende de rede e de conta (F238).
- Medido: frequência não contada; "bastante" (P8).

**U14 · Acompanhar os registros no notebook.**
- O dono usa bastante o app pela web, num notebook, sobretudo para acompanhar
  os registros (P11, F50). Sentado, com teclado. Lugar não dito.
- Medido: frequência não contada; "bastante" (P11).

**U15 · Mudar o programa.**
- O que é: incorporar uma revisão de um dos agentes, reorganizar o programa ou
  voltar ao programa do treinador (F160, F163, F164). Feito sentado, em casa
  (F41). As revisões chegam com nomes diferentes para o mesmo exercício (F263).
- Medido: em P1-B, 4 mudanças permanentes e 5 voltas ao programa do treinador,
  2,25 por semana; em P1-A, 5 e 9, 1,75 por semana (P1; conta minha). Pelo git,
  as revisões dos agentes de treino e de comida entraram no registro em 10/08,
  24/08, 09/09 e 21/09, a cada 12 a 16 dias, três delas numa segunda-feira
  (`git log --no-walk=sorted --date=format:'%d/%m/%Y %a' --format='%ad %h %s'
  063ecad b6cc00f 0ce7f7f e9b5049 bdfd7d7 4089d3b ddec1f8 d56e5e7 d832da4`).
  Pelo menos uma das voltas ao programa do treinador foi o caminho para uma
  prescrição nova chegar ao aparelho: mudar a prescrição no código não alcança
  quem já tem programa salvo (F166; git af17640). A contagem não separa os dois
  motivos.

**U16 · Decidir o passo de ±150 kcal.**
- O que é: responder se a gordura visual aumentou claramente num par de fotos
  (F220) e aplicar ou não o passo que a regra do nutricionista indicar (F3,
  F212).
- Medido: 0 avaliações visuais e 0 passos aplicados (P1). O dono diz que hoje
  não existe um momento de rever as semanas (P8).

---

## 2 · Ordem por frequência

Ordem pela frequência medida por semana, na P1-B quando houver; a frequência
exigida fica ao lado. "Exigida" é quantas vezes a vida ou a prescrição pedem
aquele registro.

| # | situação | medida por semana | exigida por semana |
|---|---|---|---|
| 1 | U1 · entre duas séries | 48 séries (P1-B) | ~76 séries nas sessões que aconteceram (conta minha: 17 × 18 ÷ 4; prescrito, não medido) |
| 2 | U11 · pôr em dia | 3,25 registros (P1-B); 4 (P1-A) | — |
| 3 | U2 · começar a sessão | 3 ao vivo (P1-B) | 5 (F80; prescrito, não medido) |
| 4 | U3 · terminar a sessão | 3 ao vivo, 1,75 encerradas por ele (P1-B) | 5 (F80; prescrito, não medido) |
| 5 | U8 · pesagem | 2,75 (P1-B) | 3 a 4 (F42; prescrito, não medido) |
| 6 | U15 · mudar o programa | 2,25 (P1-B) | revisões a cada 12 a 16 dias (git) |
| 7 | U4 · trocar o exercício na hora | 1,5 (P1-B) | — |
| 8 | U7 · aula do box | 0,5 (P1-B); 0,6 (P1-A) | 1 (P4, F21) |
| 9 | U9 · fotos do corpo | ~0,5 (intervalos de 11 e 16 dias, P1; conta minha: 7 ÷ 13,5) | 0,5 (F226; prescrito, não medido) |
| 10 | U10 · depois de comer | 0,3 dia com marca (1 em 22 dias, P1) | 34 a 41 refeições (conta minha sobre P5, F181 e F21: 5 por dia em dia de treino, 6 com ceia, 4 em descanso porque o pré só existe em dia de treino, 6 dias de treino); 98 copos de água (F194; prescrito, não medido) |
| 11 | U6 · cardio | 0 (P1-B); 0,125 (P1-A) | 2 (F46; prescrito, não medido) |
| 12 | U16 · passo de ±150 kcal | 0 (P1) | — |
| — | U12 · apagar ou corrigir | 48 marcas desde 24/08, cerca de 9 por semana (P1, git 4d3a5cb; conta minha: 48 em 38 dias) | fora da ordem: a causa não está registrada e parte das marcas é substituição (§1, U12) |
| — | U5 · série além das prescritas | não contada (P12) | — |
| — | U13 · comparar fotos antigas | "bastante" (P8), não contada | — |
| — | U14 · acompanhar no notebook | "bastante" (P11), não contada | — |

Lida pela coluna da direita, a ordem muda: U1 (~76) e U10 (34 a 41, mais a
água) ficam muito à frente da terceira, com 5 por semana (U2 e U3).

---

## 3 · Ordem por dificuldade

**As condições.** A dificuldade de executar é contada pelas condições adversas
presentes no instante do registro. Cada uma vem de um fato ou de uma resposta:

- **C1 · relógio contra**: hora-limite dura (P2) ou janela curta (F36).
- **C2 · corpo em esforço**: de pé entre esforços, suado (F28), ofegante (F36).
- **C3 · mão e atenção disputadas**: uma mão (F28); aparelho que bloqueia,
  música, outro aplicativo na frente (P3), com o produto suspenso enquanto isso
  (F57).
- **C4 · rede fraca ou ausente**: subsolo com sinal ruim (F25).
- **C5 · longe do fato**: o registro acontece horas ou dias depois e depende da
  memória.
- **C6 · decisão nova sob pressão**: escolher o que quase nunca fez (F109);
  decidir o que muda no programa (F159); movimento desconhecido e unidades
  diferentes no mesmo round (F126, F129).
- **C7 · sozinho e longe do aparelho**: a cerca de 3 m, sem alcançá-lo (F45).

**A falha medida** é a fração do que era exigido que não chegou ao registro, ou
chegou incompleto.

**A regra da ordem**: mais condições primeiro; no empate, a falha medida maior
primeiro; falha não medida depois da medida.

| # | situação | condições | n | falha medida |
|---|---|---|---|---|
| 1 | U3 · terminar a sessão | C1 C2 C3 C4 C6 | 5 | 42% sem ele em P1-B, 59% em P1-A (P1) |
| 2 | U4 · trocar o exercício | C1 C2 C3 C4 C6 | 5 | não medida |
| 3 | U7 · aula do box | C1 C2 C5 C6 (C4 não respondida) | 4 | detalhe: 0 de 5 aulas; presença: 5 aulas em 8 semanas, 4 delas depois do dia (P1) |
| 4 | U1 · entre duas séries | C1 C2 C3 C4 | 4 | ~16 de 18 séries por sessão ao vivo (P1-B; conta minha), incluindo exercícios cortados de propósito (P2) |
| 5 | U5 · série além das prescritas | C1 C2 C3 C4 | 4 | não medida; "trabalhoso" (P12) |
| 6 | U2 · começar a sessão | C1 C3 C4 | 3 | nenhuma: as duas formas de começar são válidas (F152) |
| 7 | U6 · cardio | C1 C2 | 2 | 1 de 16 em P1-A, 94% (P1; conta minha); C1 por inferência, §6 |
| 8 | U8 · pesagem | C1 C5 | 2 | 2,75 de 3 a 4 por semana; 36% com data passada (P1-B) |
| 9 | U9 · fotos do corpo | C1 C7 | 2 | baixa: 8 e 9 poses nas sessões de setembro (P1); C1 vem da prescrição (F228) |
| 10 | U10 · depois de comer | C5 (C3 não respondida) | 1 | 21 de 22 dias sem refeição marcada, 95% (P1; conta minha) |
| 11 | U16 · passo de ±150 kcal | C6 | 1 | nunca aconteceu (P1) |
| 12 | U15 · mudar o programa | C6 | 1 | não medida; risco de nome diferente (F263) e de histórico no lugar errado (F300) |
| 13 | U11 · pôr em dia | C5 | 1 | não mensurável: o que não volta não deixa rastro |
| 14 | U12 · apagar ou corrigir | C5 | 1 | não medida |
| 15 | U13 · comparar fotos antigas | (C4 para sessões antigas) | 0 | não medida |
| 16 | U14 · acompanhar no notebook | — | 0 | não medida |

**Duas dificuldades diferentes.** A contagem de condições mede a dificuldade de
**executar**. A falha mede a de **sustentar** o registro ao longo dos dias. As
duas se separam mais em U10: uma condição só, e a maior falha medida do
produto. A dificuldade da comida não é de corpo nem de pressa. É de o registro
não acontecer.

---

## 4 · Onde o uso falha

Cada linha traz a evidência. As falhas do código que atingiram o uso estão em
F267 a F301 e não se repetem aqui; cito só as que mudam a leitura de um número.

1. **A comida quase não chega ao registro.** 1 dia em 22, marcado 1 e 4 dias
   depois (P1). Com isso, a adesão nunca alcança 11 dos últimos 14 dias (F213),
   a regra do nutricionista fica em "não mexer e registrar mais" (F212) e
   nenhum passo foi aplicado (P1). O dono confirma: "eu tenho muita dificuldade
   em salvar o que eu fiz" (P5). Antes de 09/09, nem o dia marcado sobrevivia à
   meia-noite (F288). De 14/08 a 01/10, pôr um alimento numa refeição pela busca
   não fazia nada, e isso passou 48 dias sem ser notado (F296; git 9914199,
   ce46d2c; conta minha).
2. **A sessão termina sem ser encerrada.** 16 de 27 em P1-A e 5 de 12 em P1-B
   (P1). Quem esquece guarda o celular e só reabre no dia seguinte (F34,
   F293).
3. **A sessão não termina completa.** Cerca de 16 de 18 séries por sessão ao
   vivo (P1-B; conta minha). O dono corta os exercícios que não são prioridade
   naquele dia: "acontece de eu não concluir" (P2). A P1 não separa série não
   feita de série feita e não registrada.
4. **Há menos sessões que a prescrição.** 17 de 20 em P1-B, 85%; 35 em 8
   semanas em P1-A (P1, F80; conta minha).
5. **Entre um quarto e um terço do treino é registrado depois do dia.** 5 de 17
   sessões em P1-B, 29%, e 8 de 35 em P1-A, 23% (P1; conta minha). A P1 não diz
   quantas delas têm séries.
6. **A aula do box fica só com a presença.** 0 de 5 com movimentos e 0 com
   lousa; 4 de 5 registradas depois do dia (P1). Por escolha, em parte: o dono
   não quer ser obrigado a detalhar (P4). Antes de 09/09, os registros de
   estação que ele fez não queriam dizer nada e foram apagados a pedido dele
   (F283).
7. **O cardio quase não aparece.** 1 em 8 semanas, contra 16 prescritos (P1,
   F46).
8. **A pesagem fica abaixo da prescrição e chega atrasada.** 2,5 a 2,75 por
   semana, contra 3 a 4; de 36% a 50% com data passada (P1). Registrar o peso
   já recusou um número válido ou travou (F275). A data passada só existe desde
   24/08 (git e443697), então as 6 pesagens com data passada que estão em P1-A
   e não em P1-B (conta minha: 10 − 4) foram registradas a partir de 24/08.
9. **A cintura nunca foi medida** (P1), porque não havia fita (F44, P6).
10. **A avaliação visual das fotos nunca foi respondida** (P1). Sem ela, a regra
    não corta (F212).
11. **Muito registro apagado, com causa desconhecida.** 20 sessões apagadas
    contra 35 que ficaram (P1). §1, U12.
12. **Duas contagens da P1 não fecham por um.** São 27 sessões ao vivo pelos
    contadores de começo e de fim, e 28 nos horários de início enumerados; são
    10 pesagens no próprio dia pela subtração (20 − 10) e 11 nas horas
    enumeradas (P1). Nenhuma das duas diferenças muda uma ordem deste arquivo.

---

## 5 · Com pressa, com cansaço, sem rede

### Com pressa

- **A pressa medida é a da manhã.** No caso medido, 20 de 28 sessões ao vivo
  começam às 6h (P1) e precisam terminar até ~7h40 (P2). Começando às 6h22
  (F32), sobram 78 min (conta minha).
- **O que ele corta primeiro**: os exercícios que não são prioridade naquele dia
  (P2). Depois, encerrar a sessão (§4, item 2). A P1 também mostra o cardio e o
  detalhe da aula quase ausentes (§4, itens 6 e 7), mas não diz se foi pela
  pressa.
- **O que mais chega ao registro**: as séries, 192 em 4 semanas, 66% com RIR
  (P1). Se alguma série feita fica sem registro, a P1 não diz. O dono não
  respondeu o que nunca deixa de registrar (P12 sem essa parte).
- **O cardio e o relógio.** A sessão mediana registrada tem 51 min (P1); somados
  20 a 30 min de cardio (F46), uma sessão que começa às 6h termina entre 7h11 e
  7h21, e passa de 7h40 quando a sessão vai além de 70 a 80 min (conta minha).
  A duração registrada é líquida e aproximada (P1, F152), então o relógio de
  parede anda mais. Que isso explique o cardio ausente é hipótese, não medida.

### Com cansaço

- **Depois da aula do box**: sentado, ofegante, janela curta, celular saindo da
  mochila (F36). O medido é só a presença, quase sempre registrada depois do dia
  (§4, item 6).
- **No fim da musculação**: a sessão fica aberta mais da metade das vezes em
  P1-A (§4, item 2).

### Sem rede

- **Na academia**: no caso medido, subsolo com sinal ruim (F25). Se o sinal some
  de todo ou é só fraco, e se há Wi-Fi, não foi respondido (P3). Registrar e
  abrir não dependem de rede depois da primeira abertura (F72). Já falhou: com
  sinal ruim, a instalação para uso sem rede ficou com buracos que só
  apareceram offline, no subsolo (F278).
- **No box**: não respondido (P4).
- **Olhando o passado**: comparar com fotos antigas depende de rede e de conta
  (F232, F238, F252). O dono diz que faz isso bastante (P8), e é a situação em
  que a falta de rede tira o que ele quer ver.
- **Sincronização**: se está ligada hoje, não foi respondido (P11 sem essa
  parte).

---

## 6 · Onde o dono contradiz o 01-fatos

Vale o dono; a contradição fica registrada.

- **K1 · Duração da sessão.** F31 diz cerca de 75 min líquidos em mediana. O
  registro dá mediana de 51 min, de 18 a 125 (P1). Quando a sessão fecha sem
  ele, a duração vai só até a última série e é aproximada (P1, F152), o que
  puxa o número para baixo. O 75 de F31 é o padrão que o código usa sem
  histórico (F193).
- **K2 · Horário fora da manhã.** F24 fala de treino às 12h15 ou às 18h15. Os 8
  treinos fora da manhã foram às 11h, 13h, 15h, 17h, 17h, 18h, 18h e 20h (P1), um
  por semana em P1-A (conta minha).
- **K3 · Hora de começar e de sair.** F23 diz das 6h15 às 7h30. O registro diz
  que a maioria começa às 6h (P1), e o dono diz que precisa acabar até ~7h40 e
  estar no trabalho às 8h (P2). Não é contradição, é o limite que faltava.
- **K4 · Horário real das refeições contra o do plano.** O plano diz café 8h00,
  lanche 16h00, jantar 19h30 e nenhuma ceia obrigatória (F181, F182). O dono diz
  café entre 8h e 8h30, lanche por volta de 15h30, jantar entre 19h30 e 20h e às
  vezes uma ceia (P5). O plano é prescrição; o horário do dono é o mundo.
- **K5 · A marcação da comida ao longo do dia.** F40 descreve o uso fora do
  treino como marcar refeição, conferir o que falta comer e olhar o peso. O
  registro tem 1 dia com refeição marcada em 22 (P1), e o dono diz que tem muita
  dificuldade em salvar o que comeu (P5).
- **K6 · O que acontece entre séries.** F30 diz que entre séries ele marca água,
  confere a comida e olha o peso. A pesagem confirma: 7 de 11 entraram entre
  6h28 e 7h52 (P1). A água foi marcada em 2 dias no máximo (P1, F198).
- **K7 · "Às vezes" esquece de encerrar.** F34 diz "às vezes". Em P1-A foi a
  maioria, 16 de 27; em P1-B, 5 de 12 (P1).
- **K8 · Dois treinos no mesmo dia.** F35 e F157 dizem que às vezes ele registra
  o treino errado e depois o certo no mesmo dia. O registro não tem nenhum dia
  com mais de um treino (P1), e tem 20 sessões apagadas (P1). A causa delas não
  foi dita.
- **K9 · "Sempre antes de treinar".** P6 e F42 põem a pesagem sempre antes de
  treinar. 2 das 20 pesagens caem no domingo (P1), o dia de descanso fixo (F21).
  A data pode ser a do registro com data passada, e não a da pesagem.

---

## 7 · Desejos declarados

Não são uso de hoje e não viram situação de uso. Ficam registrados para quem
desenha.

- **D1 · Medidas com fita.** Medir a cintura sempre e também o braço e outras
  medidas que dê para tirar sozinho, e acompanhar a evolução (P6). O dono decidiu
  que isso vai para os designers (P6, decisão). Unidade: centímetros (F210 para a
  cintura). Frequência: "sempre", sem número (P6).
- **D2 · Bioimpedância.** Registrar uma vez por mês os números de uma balança de
  bioimpedância e acompanhar a evolução (P6). Quais números: o dono não listou.
- **D3 · Rever como têm sido as semanas.** "Acho que não, mas eu gostaria que
  tivesse" (P8).
- **D4 · Aula com detalhe opcional.** Poder detalhar se quiser, sem ser obrigado;
  guardar os pesos usados e quanto correu, para, ao chegar à aula seguinte, saber
  qual peso costuma pegar ou pegou da última vez num movimento (P4).
  Fotografar a lousa e mandar transcrever "quando der" (P4).
- **D5 · Comida fácil de marcar.** Marcar o que come "da maneira mais fácil
  possível"; ele pretende passar a registrar (P5).
- **D6 · Compras.** Facilitar as compras e usar mais a parte de comida, que ele
  diz estar defasada no próprio uso (P10). A frequência das compras não está
  definida (P10).
- **D7 · Mais agentes.** No futuro, mais agentes especialistas dentro do
  produto, de vertentes diferentes, como hipertrofia, emagrecimento e treino que
  não dependa de academia (P9).
- **D8 · Mais usuários.** "Terão outros usuários" (P3). Hoje há um só (F5, F9).

Os pedidos de aparência das respostas P8, P11 e P12 são forma e ficam fora
deste arquivo.

---

## 8 · O que fica sem medida

- A frequência de comparar fotos antigas (U13), de acompanhar no notebook (U14) e
  de fazer série além das prescritas (U5).
- Se o cardio e as aulas que faltam deixaram de acontecer ou só deixaram de ser
  registrados (§4, itens 6 e 7).
- Quantas séries faltantes não foram feitas e quantas foram feitas sem registro
  (§4, item 3), e se as sessões registradas depois do dia têm séries.
- A causa das 20 sessões apagadas (U12).
- Onde e quando acontece o pôr em dia (U11), fora as duas horas da comida.
- Com quem ele come e se o celular está à mão nas refeições; a média de copos de
  água (P5, P1).
- O sinal na academia (fraco ou nenhum), o Wi-Fi, a rede no box, a sincronização
  ligada ou não (P3, P4, P11).
- O que ele nunca deixa de registrar; semanas fora da rotina desde agosto (P12
  sem essas partes).
- Se cada semana teve as 2 pesagens que a regra pede (F211): a P1 dá o total e os
  dias da semana, não a distribuição por semana.
- A hora da pesagem; só a hora do registro é conhecida (P1).
- A frequência das compras (P10) e das medidas novas (D1, D2).
- Qualquer uso depois de 30/09/2026.

---

## 9 · Os dois momentos que todo designer desenha

### O critério, por extenso

Primeiro, ordenei as situações pelo número de vezes por semana em que a vida as
apresenta. Cada série feita pede um registro; cada refeição comida pede um
registro. Usei a medida quando havia (P1, P2, P5) e a prescrição, marcada,
quando não havia. Duas situações ficam muito à frente: a série (48 registradas e
~76 exigidas por semana) e a refeição (34 a 41 comidas por semana, sem contar a
água). A terceira, começar ou terminar a sessão, tem de 3 a 5. Depois, exigi que
cada uma das duas mostrasse no uso medido uma dificuldade, de um dos dois tipos
da seção 3. A série acontece com quatro das sete condições adversas ao mesmo
tempo e não fecha completa. A refeição tem a maior falha medida do produto. As
duas passam.

**Em uma frase:** as duas situações que a vida apresenta mais vezes por semana,
cada uma mais de seis vezes acima da terceira, desde que cada uma mostre no uso
medido uma dificuldade: na série, a condição; na comida, a falha.

**Por que não as outras.** Terminar a sessão (U3) e trocar o exercício (U4) têm
mais condições adversas que a série, mas se apresentam de 1,5 a 5 vezes por
semana, e acontecem na mesma sessão que M1. A aula do box (U7) tem a falha de
detalhe mais alta, mas se apresenta uma vez por semana e o dono não quer o
detalhe obrigatório (P4). Pôr em dia (U11) é a segunda situação mais frequente
medida, mas a vida não a apresenta: ela é o que sobra quando outra situação não
chegou ao registro na hora. Na comida, é a única forma medida, e por isso entra
em M2.

### M1 · Entre duas séries, na academia, com o relógio contra

- **Quem**: quem segue um programa de musculação e registra cada série. No caso
  medido, o dono; outros usuários terão outras rotinas (P3).
- **Onde**: na academia. No caso medido, um subsolo com sinal ruim (F25), numa
  academia grande, com máquinas parecidas e máquina ocupada como situação comum
  (F26).
- **Quando**: no descanso entre duas séries, de 1:30 a 3 min (F29), cerca de 16
  vezes por sessão (P1-B; conta minha). No caso medido, a sessão começa às 6h e
  precisa acabar até ~7h40 (P1, P2).
- **Corpo**: de pé, logo depois do esforço, suado (F28).
- **Na mão**: o celular, que bloqueia sozinho no intervalo, com música tocando e
  às vezes outro aplicativo na frente, de onde ele volta (P3); uma mão livre
  (F28).
- **Para fazer o quê**: deixar a carga e as repetições, e o RIR se quiser (F33,
  F137). Na maior parte das vezes a carga é a da última sessão e as repetições
  mudam pouco (F95, F171).
- **Com quanto tempo**: o que sobra do descanso, dividido com a água, a comida, o
  peso da manhã (F30, P1) e o resto do celular (P3).
- **Rede**: fraca ou ausente no caso medido (F25); o registro não pode depender
  dela (F72).
- **A medida que o pôs aqui**: 48 séries registradas por semana (P1-B), mais que
  todas as outras situações medidas somadas (conta minha sobre §2: 3,25 + 3 + 3
  + 2,75 + 2,25 + 1,5 + 0,5 + 0,5 + 0,3 = 17,05; 26 somando as ~9 marcas de
  apagado de U12); ~76 exigidas (prescrito, não medido);
  condições C1, C2, C3 e C4 ao mesmo tempo (§3); ~16 de 18 séries por sessão ao
  vivo e 42% a 59% das sessões sem encerramento (P1).
- **Caso para comparar as direções**: a décima série de uma sessão começada por
  volta das 6h20 (F32); são 6h55, faltam 45 min para a hora-limite (P2), o
  descanso prescrito é de 2 min (F92), o celular está bloqueado na mão com música
  tocando (P3), o sinal é fraco (F25), e a série saiu com a mesma carga da última
  vez e uma repetição a mais (F95, F171). Duas variações do mesmo caso: ele volta
  de um aplicativo de conversa no meio do descanso (P3, F57); ele decide fazer
  uma série além das prescritas (P12).

### M2 · Depois de comer, no meio do dia

- **Quem**: quem segue um plano alimentar e precisa que o dia chegue ao registro.
  No caso medido, o dono; outros usuários terão outros planos (P3, P9).
- **Onde**: onde ele come. No caso medido: em casa, de madrugada, o pré-treino;
  no trabalho, o café da manhã e o lanche; o almoço em lugar não dito; em casa,
  à noite, o jantar (P5, F39).
- **Quando**: de 5 a 6 vezes por dia, nos horários do dono: pré entre 5h e 6h,
  café entre 8h e 8h30, almoço, lanche por volta de 15h30, jantar entre 19h30 e
  20h, às vezes uma ceia (P5). Nos dias de treino fora da manhã, o pré e o
  intra-treino andam com a sessão (F189), cerca de uma vez por semana (P1; conta
  minha).
- **Corpo**: sentado, sem esforço (F40).
- **Na mão**: a comida. Com quem ele está e se o celular está à mão: não
  respondido (P5).
- **Para fazer o quê**: dizer que comeu cada refeição, inteira ou em parte (F195,
  F199), quantos copos de água (F194), e como o dia foi: seguiu o plano, saiu
  sabendo o que comeu, ou saiu sem saber quanto (F195). Um dia sem marca é
  desconhecido, não zero (F198). A regra do nutricionista precisa de 11 dos
  últimos 14 dias com consumo conhecido (F213).
- **Com quanto tempo**: sem pressa física; a marcação disputa atenção com o
  trabalho e com o resto do dia (P5).
- **Rede**: não medida.
- **As duas formas em que o momento acontece**: logo depois de comer, de 5 a 6
  vezes por dia, que é a exigida e nunca foi medida; e de memória, dias depois,
  que é a única medida: as marcações do único dia foram feitas 1 e 4 dias depois,
  às 13h41 e às 17h23 (P1).
- **A medida que o pôs aqui**: 34 a 41 refeições por semana (P5, F21; conta
  minha) e 98 copos de água (F194; prescrito, não medido); 1 dia com refeição
  marcada em 22 possíveis, 95% de falha (P1; conta minha); adesão que nunca
  chega a 11 de 14 e 0 passos aplicados (P1, F213); o dono diz que é onde tem
  muita dificuldade (P5).
- **Marcar a comida é tarefa de hoje, não desejo.** O plano, a marcação e a regra
  de adesão já existem (F181, F195, F213), e o dono marcou um dia. O desejo
  declarado é outro: que fique fácil e que ele passe a marcar (D5).
- **Caso para comparar as direções**: o lanche de por volta de 15h30, no
  trabalho, comido inteiro (P5, F181); e, no dia seguinte, o dia anterior
  reconstituído de memória: o almoço comido pela metade, o jantar fora do plano
  sabendo o que comeu, e a água sem conta (F195, F199).
