# 04 · Crítica adversarial (C1)

Quem escreve é o crítico. O mandato é um só: tentar derrubar C e D pelo uso, nas
condições que o `02-uso.md` mede. Não há proposta aqui, não há conserto, não há
tela desenhada e não há escolha entre as duas. Onde eu não consegui derrubar,
está escrito na seção 6, que vale tanto quanto o resto.

**Fontes.** F = `01-fatos.md`. U, K, D, M = `02-uso.md`. P = resposta do dono em
`02-perguntas.md`. "Medido no arquivo" = o que eu li no HTML ou no CSS da
direção, com a linha. "Conta minha" = aritmética sobre os números citados ao
lado. **Não medido** = não existe medida, e eu não estimo sem dizer.

---

## 0 · Como li e como contei

**O que abri.** `03-direcao-C/direcao.md` e `03-direcao-D/direcao.md`, e os
quatro HTML por inteiro: marcação, CSS e JavaScript. Abri também as capturas que
cada direção deixou em `_trabalho/`, porque elas mostram o que a marcação sozinha
não mostra (o que cabe na largura).

**Como contei toque.** Um toque = um alvo distinto tocado dentro do app. Não
conto o desbloqueio do iOS, que é do sistema. **Não conto rolagem**: os quatro
arquivos desenham o telefone como um quadro de 414 × 896 com `overflow:hidden`
(medido: `momento-*.html` de C, linha 68; de D, linha 71), então o que está na
tela está a um toque e o que não está, não existe naquele estado. Onde uma tela
não foi desenhada, eu digo "não desenhado" e não invento o toque que ela teria.

**Um aviso sobre maquete.** Em HTML estático, uma linha pode ser `<li>` sem
controle só porque ninguém ligou o fio. Eu só trato a ausência de controle como
achado quando ela **também** é visível: quando linhas irmãs na mesma tela têm
botão e aquela não tem, ou quando a direção promete em texto um toque que o
desenho não oferece em lugar nenhum. Esse é o caso dos dois achados em que isso
aparece (C‑6 e D‑2).

---

## 1 · As duas medições que o dono pediu

### M‑a · Quanto custa contornar quando a D abre na coisa errada

**A cena, montada com a regra da própria D.** Sexta‑feira, um dia em que ele vai
treinar às 18h15. Enquanto não existe sessão registrada, o tipo do dia e o
horário do treino são palpite do padrão semanal — a D diz isso na própria tela
("Dia de treino? Palpite do padrão semanal · mudar", M2‑7; F187, F188). O palpite
põe o treino de manhã. Às 7h45 ele abre o app: é a janela em que o registro de
peso de fato acontece (7 de 11 pesagens do próprio dia entraram entre 6h28 e
7h52, P1). Pela regra do cartão de cima de D — "a próxima refeição do plano com
horário até 30 min à frente" — o cartão é o **café da manhã das 8h00**. É a cena
que o dono descreveu.

**Os números, por caminho, no desenho que existe:**

| o que ele quer fazer | toques até a tela certa | onde está desenhado |
|---|---|---|
| Registrar o peso da manhã (U8) | **1** ("Anotar", linha logo abaixo do cartão); **5** até o fim: Anotar + 3 dígitos + confirmar | M2‑7. Ressalva: a linha do peso só está desenhada às 5h20; às 7h45 ela caberia pela mesma regra (F42), mas não está desenhada nesse horário |
| Dizer ao app que o treino é à noite | **1** no "· mudar" do cabeçalho — **e a tela de destino não existe no desenho**. O M2‑13 mostra só o resultado ("Treino E às 18h15 hoje · mudar"). ≥2 no total | cabeçalho de M2‑7 e M2‑13 |
| Marcar qualquer refeição que não seja o cartão do topo | **2** ("Pôr em dia" → "Completar" no M2‑12 → a folha). **1** se já houver uma marca no dia ("Pôr hoje em dia", M2‑2). **0 caminhos pela lista do dia** | M2‑1, M2‑12 |
| Começar a sessão de musculação | **nenhum caminho desenhado**. O "Começar agora" só existe quando o próprio cartão do topo é o treino (M1‑13). O caminho mais curto por telas desenhadas sai pela aba Dias (1) → o dia (1) → uma superfície que a direção descreve como registro de data passada, não como abrir sessão ao vivo. ≥2 toques para fora do desenho | M1‑13, tabela de lugares |
| Só ler como está o dia | **0** | M2‑1 |

**Como contei a lista do dia.** Medido no arquivo: as linhas do roteiro em
`03-direcao-D/momento-2.html` são `<li>` sem botão, sem `role` e sem indicação
visual de toque (linhas 411–416 no M2‑1, 453–459 no M2‑2, 502–505 no M2‑3). Na
mesma tela, o cartão do topo, a água e o "Pôr em dia" **são** botões. Então a
inércia da lista é desenho, não descuido de maquete.

**A resposta, em uma frase.** Contornar custa **1 toque** quando o que ele quer é
a pesagem; **2 toques** (1 se já marcou algo hoje) quando é qualquer outra
refeição; **≥2 toques, um deles para uma tela que não existe**, quando é
consertar o horário do dia; e **não tem caminho desenhado** quando é começar a
sessão. O que faz o custo existir não é a regra que escolhe o cartão — é o
**cartão único com a lista do dia inerte**. Com a lista respondendo ao toque,
todos esses números cairiam para 1 sem mexer na regra.

**Controle, no mesmo instante, com a mesma conta (só para dar escala, não para
escolher).** Em C: peso 1 toque (linha "Peso de hoje … registrar", estado 10);
horário do dia 1 toque (o controle "palpite | Dia de treino | Descanso | manhã |
tarde | noite" está desenhado, estado 6); refeição passada sem marca 1 a 2 toques
("marcar" na própria linha). Mas **começar a sessão também não tem alvo
desenhado em C**: a linha "06:15 · Treino B · e água do treino" é uma linha de
lápis com `<span>` vazio (estado 6). O buraco de começar a sessão a partir da
tela do dia é **das duas**; os outros três são só de D.

### M‑b · Registrar ontem na C, e se mostrar o buraco sem baratear o fechamento é meio serviço

**Primeiro, o caso desenhado, contado por mim.**

- **C** (estado 5): "Completar ontem" (1) + "Metade" no almoço (1) + "Não foi o do
  plano" no jantar (1) + "Sei" (1) = **4 toques**, sem botão de salvar (cada toque
  grava). Muda de tela: a folha de ontem substitui Hoje, com "‹ Hoje" e "Voltar
  para hoje". Contando a volta, **5**.
- **D** (estados 3 a 6): "Pôr ontem em dia" (1) + "Metade" (1) + "Fora" (1) + "Sei
  o que comi" (1) + **"Guardar quarta" (1)** = **5 toques**. Verificado no
  JavaScript: `g('save')` é um passo obrigatório e fica desabilitado até a
  pergunta do "fora" ser respondida. Não muda de tela: é uma folha por cima de
  hoje.

Então, **no caso desenhado, C custa 4 e D custa 5** — ou 5 e 5 contando a volta.
A premissa de que C é a pior das quatro não se sustenta contra D **neste caso**.
O que separa as duas aqui não é toque, é tela: C sai de hoje, D não.

**Agora o caso que o registro real apresenta, que é outro.** O caso desenhado é
um dia que já tem 4 de 6 refeições marcadas. O medido é um dia com **zero**
marcas, 11 vezes em 14 (P1: 1 dia com refeição marcada em 22). Para esse dia:

| | toques para fechar **um** dia vazio | os 11 dias |
|---|---|---|
| **C** | **14**: chegar ao dia (1) + por refeição "marcar" (1) e a escolha (1) × 6 + "Como foi o dia" (1). Se "marcar" já gravar "tudo" num toque — o desenho não diz —, caem para 8 | **154** (conta minha: 14 × 11); 88 na leitura otimista |
| **D** | **1** ("Como no plano", M2‑12), ou 2 abrindo a folha e guardando | **12** (conta minha: 11 + 1 para abrir) |

**O julgamento.** Sim, é meio serviço — e C sabe disso e assume por escrito
(recusa 4: "não há um botão 'comi o plano todo' com as refeições fora de vista";
pergunta 8). A hachura de C mostra o buraco com honestidade exemplar, e o
fechamento custa cerca de treze vezes mais que em D para o dia que o registro
real apresenta. Com a adesão parada em 1 de 14 e a regra do nutricionista travada
em "não mexer e registrar mais" (F212, F213, P1), um fechamento de 143 toques não
vai acontecer: a direção que mostra o buraco e cobra 13 toques para tapá‑lo está
medindo o fracasso com mais precisão, não reduzindo‑o.

**Mas o outro lado não é vitória.** D compra o fechamento barato pagando com a
coisa que ela mesma recusa (achado D‑1): a folha abre **pré‑marcada como "tudo"
nas seis refeições** e o botão de guardar já nasce habilitado. Um toque declara
seis refeições inteiras comidas, de memória, dias depois. É a Direção A que a
própria D descartou ("Presumir o plano… porque mente para a regra"), voltando
pela porta do pôr em dia.

**E tem um buraco que nenhuma das duas fecha.** O caro em C e o perigoso em D têm
a mesma causa: não existe, em nenhuma das duas, uma forma **barata e honesta** de
dizer "este dia eu não lembro" por refeição. C levanta isso como pergunta 3
("separar 'não comi' de 'esqueci'") e D como pergunta 4. Enquanto for pergunta, o
usuário escolhe entre trabalhar muito e declarar o que não sabe.

---

## 2 · As três exigências, e o defeito que cada uma cria

As exigências não estão em votação. O que segue é só onde elas machucam.

**E1 · a decisão de tornar permanente aparece ao encerrar o treino.**

O defeito é o mesmo nas duas e tem número. "Ao encerrar" só alcança as sessões
que **ele** encerra: 7 de 12 em P1‑B (58%) e 10 de 27 em P1‑A (37%) (P1; conta
minha). Nas outras — 42% a 59% — a sessão fecha sozinha e a pergunta não tem
quando acontecer. Pior: encerrar a sessão é a situação **nº 1 em dificuldade** do
produto, com cinco condições adversas ao mesmo tempo, incluindo C6, "decisão nova
sob pressão" (02‑uso §3). E1 põe uma decisão nova exatamente onde a medida diz
que a tarefa já é abandonada em quase metade das vezes, e exatamente quando ele
está cortando exercícios por causa do relógio (P2).

Onde dói mais, por direção:

- **Em C, o conserto é de modelo.** O M1 de C **não tem um momento de encerrar**:
  "a sessão fecha sozinha na última série e o fim se confirma na abertura
  seguinte" (tabela de tarefas). Não há tela, botão nem estado de fim na sessão,
  nos 11 estados desenhados. E1 precisa inventar um momento que o modelo de C
  removeu de propósito.
- **Em D, o conserto é de regra.** Existe um lugar nomeado para pendurar: "depois
  da última série do último exercício, o cartão vira 'Encerrar às 7h31'"
  (descrito, não desenhado). É um cartão a mais num lugar que já existe.

A segunda metade de E1 — o atalho discreto na tela do dia — **já é nativa nas
duas** (C: a fila de pendências no topo de Hoje, estado 10, "2 mudanças de ontem
esperam decisão"; D: "Para decidir com calma", M1‑13). Essa metade não cria
defeito nenhum.

**E2 · peso, medidas e fotos com lugar próprio.**

- **Em C o dano é duplo, e um dos dois é de modelo.** Primeiro: a decisão do passo
  de ±150 kcal precisa, ao mesmo tempo, da saída da regra com os números que a
  produziram (F215) e da avaliação visual do par de fotos (F220) — e C põe as
  duas em Semanas, lado a lado. Tirando as fotos para o lugar novo, as duas
  metades de **uma** decisão passam a morar em dois lugares, e essa decisão nunca
  aconteceu nenhuma vez (0 avaliações, 0 passos, P1). Segundo: a pesagem medida
  acontece **dentro da sessão**, de manhã (7 de 11 entre 6h28 e 7h52, P1), e em C
  ela é uma linha do roteiro do dia mais a folha "Dia" da sessão. Se a linha do
  roteiro sair para o lugar novo, esse caminho medido passa a custar sair da
  sessão (1), ir ao lugar (1), registrar e voltar (2) — **~3 toques a mais numa
  tarefa que hoje é 1**. Terceiro, de argumento mas com consequência: o critério
  "organizado por tempo, não por assunto" é o que justifica C recusar abas por
  assunto (recusa 7); com E2 a barra passa a ter dois lugares de tempo, um lugar
  de assunto e um lugar de origem, e o critério deixa de explicar a barra. (A
  largura não quebra: 414 ÷ 4 = 103 pt por aba, acima de 44.)
- **Em D o custo é zero na leitura e não zero na escrita.** Evolução já reúne
  peso, medidas, bioimpedância e fotos — mas a própria tabela de D a declara
  "notebook, sobretudo (P11)", enquanto a **escrita** do peso fica espalhada por
  Agora, sessão e Dias. O lugar próprio existe para ler e não existe para
  escrever, e o que falha no medido é escrever: 36% das pesagens entraram com
  data passada em P1‑B (P1). Conserto de regra.

**E3 · o que passou sem registro aparece marcado.**

Nativo nas duas (hachura em C, "sem marca" em D), e é a parte mais bem resolvida
dos dois desenhos. O defeito que E3 cria é um só, e é **das duas**:

**E3 fabrica buraco onde não houve buraco.** Enquanto não existe sessão
registrada, o tipo do dia e o horário do treino são palpite do padrão semanal
(F187, F188; C estado 6, D M2‑7). Em ~1 dia por semana ele treina fora da manhã
(8 de 28 sessões, P1; K2) e em 3 de 20 dias prescritos de P1‑B a sessão não
aconteceu (17 de 20, P1). Nesses dias, o palpite põe pré‑treino às 5h45, treino
às 6h15 e água do treino na manhã, e E3 marca os três como buraco a manhã
inteira — três marcas falsas por dia, umas três por semana (conta minha sobre
P1). O que ele vive: abre o app e vê que "faltou" o que ele vai fazer daqui a
doze horas. Nenhuma das duas direções trata disso: nem C nem D têm regra que
diga quando um previsto que é palpite pode virar buraco. Conserto de regra nas
duas; de modelo se a resposta for que palpite não pode gerar buraco nenhum.

---

## 3 · Direção C — achados, do mais grave ao menos

### C‑1 · O "agora" escolhe a refeição e não deixa começar o treino — e é a regra da própria C que manda assim

**O caso.** 6h15, na porta da academia, no subsolo. Ele abre o app para começar a
sessão. A regra do agora de C é ordenada (modelo §3): depois da sessão aberta e
da sessão de ontem não encerrada vem **"3. Refeição do plano sem marca, com
horário entre 45 min à frente e 3 h atrás: essa refeição"**, e só depois **"4.
Manhã de dia de treino, sem sessão: começar o próximo da sequência"**. O
pré‑treino das 5h45 está sem marca e passou há 30 min — dentro da janela de 3 h.
A regra 3 dispara. O agora é o pré‑treino, e não "Começar agora".

**Por que isso não é exceção.** Porque a comida quase nunca é marcada: 1 dia com
refeição marcada em 22 (P1). Com o pré‑treino sem marca em praticamente todo dia
de treino, **a regra 4 de C é inalcançável no uso medido**. O cartão do agora —
que é o único lugar de ação da tela, no pé, ao alcance do polegar — é ocupado por
uma refeição nas manhãs em que ele precisa abrir um treino.

**O desenho confirma e contradiz ao mesmo tempo.** No estado 10, às 6h02, a tela
mostra o agora como "Treino B · Começar agora", embora a regra 2 (sessão de ontem
não encerrada, que está lá em cima na mesma tela) e a regra 3 (pré‑treino das
5:45, 17 min atrás) devessem ter disparado antes. Ou seja: a arbitragem escrita e
o desenho discordam, e a garantia que paga o cartão único não está demonstrada em
nenhum dos dois.

**E não há saída pela lista.** Na tela Hoje, a linha "06:15 · Treino B · e água do
treino" é uma linha de lápis com `<span>` vazio (medido: `momento-2.html`, linha
587). Linhas de lápis nunca recebem botão em C — medido: 7 linhas `row pencil` no
arquivo, nenhuma com controle. Então, quando o agora erra, começar a sessão não
tem alvo desenhado.

**A frequência.** U2 acontece 3 vezes por semana medidas e 5 prescritas (02‑uso
§2; P1: 12 sessões ao vivo em P1‑B). É a porta de entrada da situação mais
frequente do produto (U1, 48 séries por semana).

**O que ele vive.** Chega à academia, abre o app com pressa, e a coisa grande no
pé da tela é um cartão de pão com doce de leite.

**Quão fundo é o conserto.** Modelo. A tela de C mostra **um** ato por vez por
desenho ("No pé de Hoje… fica o agora: o ato mais provável neste instante"), e a
regra que elege esse ato produz, no uso medido, a resposta errada na hora de
maior frequência. Mexer na ordem das seis regras não resolve sozinho, porque a
refeição sem marca é o estado permanente do dado.

### C‑2 · Fechar um dia de comida vazio custa ~13 toques, e o caminho barato que C desenha não faz o dia contar

**O caso.** Quarta, 13h50. Ele resolve pôr em dia a semana. Escolhe a sexta
passada, em que não marcou nada. A única coisa que o desenho oferece de barato é
a linha "Como foi o dia · Seguiu o plano / Saiu, sei o que comi / Saiu, não sei
quanto" (estado 10). Ele toca "Seguiu o plano".

**O que acontece.** O número no topo da tela — "Comida conhecida em X de 14 dias ·
a regra pede 11" — **não se move**. Pela F200, dia com consumo conhecido é o que
"tem refeição marcada"; o estado do dia sozinho não basta. Para o dia contar, ele
precisa marcar refeição por refeição: "marcar" (1) + a escolha (1), seis vezes.

**O desenho piora isso no pior estado.** No estado 10, as três refeições sem marca
aparecem **colapsadas numa linha só** — "12:30 · Almoço · lanche · jantar · sem
marca" — e essa linha é a única `row hatch` do arquivo **sem** o botão "marcar"
(medido: `momento-2.html`, linha 736; as outras três hachuradas, linhas 389, 440
e 695, têm o botão). Na tela que C desenhou para o caso ruim, as refeições que
faltam não têm alvo nenhum.

**A frequência.** 11 dos últimos 14 dias sem marca é o estado permanente (P1: 1
dia em 22). Pôr em dia é a segunda situação mais frequente medida, 3,25 registros
por semana (02‑uso §2).

**O que ele vive.** Faz o que a tela pede — diz como foi o dia — e o contador que
a mesma tela põe em destaque não mexe. Nada explica por quê.

**Quão fundo é o conserto.** Modelo, e C assume o preço por escrito (recusa 4 e
pergunta 8). A parte do "Como foi o dia" que não move o contador, essa é regra: a
tela promete uma consequência ("Se lembrar o que comeu, 'sei o que comi' mantém o
dia contando") e não diz a que falta.

### C‑3 · A fila de pendências no topo de Hoje nunca esvazia

**O caso.** Terceiro mês de uso, uma terça qualquer, 6h02. Ele abre o app. O
primeiro bloco de Hoje é a fila de pendências (modelo §4), com sete tipos. Com as
taxas medidas, pelo menos estas são verdadeiras quase todo dia:

- "dia de comida incompleto dentro dos 14" — verdadeiro em 13 de 14 dias (P1);
- "par de fotos esperando avaliação" — 0 avaliações respondidas em 6 sessões de
  fotos (P1), e a partir da segunda sessão sempre há par válido de 10 a 28 dias
  (F220);
- "passo de ±150 indicado pela regra" / a regra parada — 0 passos aplicados (P1),
  saída fixa em "não mexer e registrar mais" (F212);
- "semana com menos de 2 pesagens" — 2,75 por semana medidas, contra 3 a 4
  prescritas (P1, F42), então verdadeiro em parte das semanas;
- "sessão não encerrada" — 42% a 59% das sessões (P1).

**A frequência.** Diária, por construção. O modelo diz **onde** as pendências
aparecem ("na abertura antes do treino, em Hoje e em Semanas") e nunca diz
**quando elas saem**.

**O que ele vive.** A primeira coisa que o app mostra, todo dia, por meses, é uma
lista do que ele não fez — para um usuário que já disse "eu tenho muita
dificuldade em salvar o que eu fiz" (P5) e que pediu telas sem poluição e sem
briga para contornar (régua do dono). O mesmo desenho que recusa vermelho,
sequência de dias e medalha (recusa 6) acaba entregando uma cobrança permanente
por outro caminho.

**Quão fundo é o conserto.** Modelo. Pendência sem regra de saída não é
pendência; é um aviso fixo. A hachura de C resolve isso com elegância na linha do
dia (ela é discreta e não cobra); a fila no topo faz o contrário com o mesmo
dado.

### C‑4 · A janela de 7 repetições se centra no valor errado exatamente quando a carga sobe

**O caso.** Ele subiu a carga da elevação lateral na máquina, porque a última
sessão bateu o topo do intervalo nas três séries (F168; é o que o próprio cartão
de C mostra: "25 × 15 · 15 · 15, RIR 1 · 1 · 1 — topo nas três"). A regra do
treinador diz o que vem depois: "sobe a carga no menor incremento prático e
**recomeça perto da base** (algo como 8/7/6)" (F95). O alvo é 10–15 e a série vai
sair com 10 ou 11.

**O que a tela oferece.** Sete botões centrados na última marca (15): **12, 13,
14, 15, 16, 17, 18** — medido no arquivo, linhas 399, 442, 482 e 689. Três dos
sete são acima da faixa prescrita (marcados tracejados, "fora"), e **10 e 11, que
estão dentro da faixa e são o valor provável, não estão na janela**. A saída é
"Outro número", que abre o teclado do app: 1 toque para abrir + 2 dígitos + OK =
**4 toques**, contra o 1 toque que é a tese inteira da direção.

**A frequência.** Não medida em P1 (a P1 não conta subidas de carga). No desenho
da própria C, 1 dos 8 exercícios da sessão está nesse estado; a 3 sessões por
semana medidas, isso dá da ordem de 3 exercícios por semana e ~9 séries (conta
minha sobre o desenho, não sobre o registro — **estimativa marcada**).

**O que ele vive.** Na única série em que o app tinha algo a dizer de verdade, ele
tem que digitar.

**Quão fundo é o conserto.** Regra: a janela se centra no último valor, e a regra
do treinador diz que depois da subida o valor despenca. As duas regras estão
escritas no mesmo cartão e se contradizem.

**Em D o mesmo caso quebra de outro jeito** (ver D‑4): a régua rola e o 10 cai
para fora da tela à esquerda.

### C‑5 · A fileira dos últimos 14 dias mostra 7 e não tem como chegar aos outros

**O caso.** Ele quer pôr em dia a quinta de duas semanas atrás, que ainda entra na
conta dos 14. A tela do dia passado traz uma fileira para escolher o dia (estado
10): "ter 22 · qua 23 · qui 24 · sex 25 · sáb 26 · dom 27 · seg 28". São **sete**.
Medido no CSS: `.daystrip{display:flex; … overflow:hidden}` (`momento-2.html`,
linha 313) — sem rolagem horizontal. Os outros sete dias da janela de 14 não têm
caminho desenhado nessa fileira.

**A alternativa desenhada.** As setas ‹ › de Hoje andam **um dia por toque**: 10
toques para um dia de 10 dias atrás. E a pendência de "Completar ontem" só cobre
ontem.

**A frequência.** Pôr em dia: 3,25 registros por semana medidos (02‑uso §2). A
janela que importa é de 14 dias (F213), e 11 deles estão sem marca (P1).

**O que ele vive.** A tela que existe para escolher um dia entre 14 mostra metade
deles.

**Quão fundo é o conserto.** Detalhe, se for só `overflow` de maquete; regra, se a
fileira de sete for a decisão (porque aí a janela de 14 da F213 e a fileira não
são a mesma coisa).

### C‑6 · Corrigir o que já está a tinta não tem sinal nenhum na tela do dia

**O caso.** 9h00. Ele marcou "comi tudo" no café às 8h05 e depois lembra que comeu
metade. Na tela Hoje, a manhã inteira está colapsada numa linha só — "manhã · 5
marcados · pré‑treino · treino B · água do treino · peso 73,8 kg · café" — e o
único elemento à direita é `<span class="ck">✓</span>` (medido: `momento-2.html`,
linhas 388, 439, 475, 512, 694). Não é botão e não há seta, lápis nem rótulo.

**Por que isso pesa mais em C do que pesaria em outra direção.** Correção é o que
C nomeia como a proteção que paga o toque único: "a proteção contra o toque errado
é a correção, não a confirmação" (modelo §8), "toda linha a tinta se abre com um
toque" (modelo §5). A correção está desenhada na série (M1, estado 5, bem feita) e
**não está desenhada na comida**: de quatro tipos de linha em Hoje (tinta, lápis,
hachura, agora), só a hachura não colapsada carrega alvo visível.

**A frequência.** U12 é ~9 marcas de apagado por semana desde 24/08 (48 em 38
dias, P1, git 4d3a5cb; conta minha), e parte delas é substituição, não erro.
Corrigir é ato real e recorrente.

**O que ele vive.** Vê o erro na tela, sabe qual é, e não há onde tocar.

**Quão fundo é o conserto.** Detalhe — dar à linha o sinal que as irmãs já têm.

### C‑7 · A linha "sem rede" ocupa o topo da tela mais limpa do produto em 100% do tempo em que ela é verdade

**O caso.** Toda série, de toda sessão. A academia é um subsolo com sinal ruim
(F25), e o registro não depende de rede (F72). Em C, uma linha fixa no topo da
sessão diz "Sem rede · tudo gravado neste aparelho" — presente em 7 dos 11 estados
desenhados do M1 (medido: 7 ocorrências em `momento-1.html`).

**A frequência.** Cerca de 16 aberturas por sessão (P1‑B; conta minha), 3 sessões
ao vivo por semana: ~48 exposições por semana a uma linha que nunca muda.

**O que ele vive.** O estado normal do lugar onde ele treina é anunciado como
notícia, toda vez, no alto da tela que ele pediu que ficasse mais limpa ("na hora
do treino pode ficar mais limpa", régua do dono).

**E não é só a linha.** Contando blocos separados de informação na tela base do
M1: C tem 12 (barra de status, cabeçalho com ‹Hoje/Treino A/Dia, linha de rede,
linha do fim previsto, faixa de grupo e prioridade, título e prescrição do
exercício, barra Orientação/Aparelho/Trocar/···, duas linhas de série, lista
"Falta" com 4 linhas, carga, 7 botões de repetição, descanso); D tem 9 (barra de
status, cabeçalho com projeção, mapa de pontos, cartão do exercício com a tabela
hoje/última, linha "série 1 guardada", linha "depois:", carga, régua,
ocupada/dor/pular). A lista "Falta, com a prioridade do treinador" é o que C
acrescenta, e ela serve a P2 — mas é leitura a mais nos 1:30 a 3 min de descanso.

**Quão fundo é o conserto.** Detalhe.

### C‑8 · A troca de exercício — a segunda situação mais difícil do produto — não foi desenhada

**O caso.** Máquina ocupada (U4), 5 condições adversas ao mesmo tempo, posição 2
na ordem de dificuldade (02‑uso §3). Em C, "Trocar" é um botão na barra do
exercício, e a direção descreve o que a tela mostraria ("indicados pelo treinador
primeiro, com a frase do que muda e a foto do aparelho desta academia; quem trocou
da última vez aparece primeiro"). O estado 6 desenha o **depois** (substituto já
escolhido, sem referência). A tela da escolha não existe em nenhum dos 11 estados,
e também não está na lista das cinco partes que C declara não desenhadas.

**A frequência.** 1,5 por semana em P1‑B (4 substitutos + 2 mudanças do dia em 17
sessões; P1, conta minha).

**O que ele vive.** Nada, por enquanto — mas quem julga a direção não tem como
verificar a parte mais cara dela.

**Quão fundo é o conserto.** Detalhe de entrega (a informação está toda
especificada); vira regra se, ao desenhar, os substitutos indicados, o histórico
de cada um e a foto do aparelho não couberem no tempo da situação.

### C‑9 · Marcar uma refeição bem antes da hora não tem controle desenhado

**O caso.** Ele janta às 17h30 porque vai sair. A janela do agora é de 45 min à
frente (modelo §3), e às 17h30 o jantar das 19h30 está fora dela. As linhas de
lápis não têm botão (medido: 7 linhas `row pencil`, nenhuma com controle).
Entretanto, a própria demonstração ao vivo de C termina dizendo "Nada a marcar
agora. Se já comeu, dá para marcar antes da hora" — uma saída que o desenho não
oferece.

**A frequência.** Não medida. Os horários do dono variam (K4: lanche às 15h30
contra 16h00 do plano; jantar entre 19h30 e 20h), e a janela de 45 min cobre essas
variações; o caso de comer 2 h antes não está medido.

**O que ele vive.** O app diz que dá, e não dá.

**Quão fundo é o conserto.** Detalhe.

---

## 4 · Direção D — achados, do mais grave ao menos

### D‑1 · O "pôr em dia" abre pré‑marcado como "comi tudo" e guarda com um toque — é a direção que D descartou, voltando pela porta dos fundos

**O caso.** Quinta, 13h45. Ele abre "Pôr em dia" e vê 11 dos últimos 14 dias sem
marca (M2‑12). Em cada dia há um botão "Como no plano". Ele toca. O dia fica
registrado com seis refeições inteiras. Onze toques depois, a semana inteira está
"no plano".

**A outra porta, medida no código.** No protótipo da folha (M2‑4), o estado
inicial é `S[m[0]] = {v:'tudo'}` para as seis refeições, e o botão de guardar só
fica desabilitado se houver um "fora" sem resposta (`var ok = !anyFora() ||
answer`). Quer dizer: **abrir a folha e tocar "Guardar quarta" — dois toques —
declara seis refeições inteiras**, sem que ele tenha dito nada sobre nenhuma
delas.

**Por que isso é grave e não é detalhe.** A adesão registrada é a tranca da regra
do nutricionista: ≥11 dos últimos 14 dias com consumo conhecido (F213), e é ela
que libera +150 ou −150 kcal (F212). O mesmo tipo de erro já aconteceu de
verdade: um dia em que ele saiu sem saber quanto comeu contou como registro e
destravou um corte (F292). A própria D descarta a Direção A com estas palavras —
"foi descartada porque mente para a regra" — e a recusa 3 diz "Recusa presumir".
O desenho entregue presume.

**E presume coisas impossíveis.** O tipo do dia passado é palpite do padrão
semanal quando não houve sessão (F187, M2‑7). Em 3 de 20 dias prescritos de P1‑B a
sessão não aconteceu (17 de 20, P1), e em ~1 dia por semana o treino foi à noite
(8 de 28, P1; K2). "Como no plano" nesses dias declara um pré‑treino e uma água de
treino que não existiram.

**A frequência.** Pôr em dia: 3,25 registros por semana medidos (02‑uso §2), com
um atraso permanente de 11 dias em 14 (P1). O caminho barato é o caminho que a
tela oferece primeiro.

**O que ele vive.** Em 12 toques ele "resolve" a semana, o contador salta de 3
para 14, a regra destrava — e o que destravou não foi medido por ninguém.

**Quão fundo é o conserto.** Regra, se for só o padrão da folha (abrir em branco
em vez de abrir em "tudo"). Modelo, se a resposta for que o plano não pode
pré‑marcar nada, porque aí cai a tese "o previsto ocupa o lugar da resposta" na
metade da comida — que é justamente a metade onde o dado é lembrança e não
observação.

### D‑2 · Quando o cartão do topo é a coisa errada, a lista do dia não responde ao toque

É o achado que M‑a mede; os números estão na seção 1.

**O caso.** 7h45, dia em que ele vai treinar às 18h15. O app abre no café da
manhã, porque o palpite do padrão semanal pôs o treino de manhã e o café das 8h00
está dentro da janela de 30 min. Ele queria dizer que hoje treina à noite, ou
começar a sessão mais tarde, ou marcar o pré que ele vai comer às 17h45.

**O que a tela oferece.** Um cartão com três botões, e abaixo uma lista do dia
inteiro que é só leitura — medido: `<li>` sem controle, linhas 411–416, 453–459 e
502–505 de `momento-2.html`, numa tela em que o cartão, a água e o "Pôr em dia"
são botões. Começar a sessão, a partir dessa tela, **não tem alvo desenhado**: o
"Começar agora" só existe quando o cartão do topo já é o treino (M1‑13).

**A frequência.** O gatilho (palpite errado do horário) é de ~1 dia por semana (8
de 28 sessões fora da manhã, P1; K2). Mas a inércia da lista vale **todo dia**:
qualquer refeição que não seja o cartão do topo custa 2 toques (1 depois que já
houver uma marca), e com 1 dia marcado em 22 (P1) a maior parte do dia está sempre
fora do cartão.

**O que ele vive.** A tela mostra exatamente o que falta e não deixa tocar no que
falta.

**Quão fundo é o conserto.** Regra, se as linhas virarem o controle — o custo cai
para 1 toque sem mexer na tese. Modelo, se o cartão único for inegociável, porque
aí todo contorno passa por "Pôr em dia", que é a folha do achado D‑1.

### D‑3 · O desfazer da série morre exatamente quando ele volta do WhatsApp

**O caso.** 6h55. Ele registra a série com o polegar suado e toca 11 em vez de 10.
A confirmação aparece com "Desfazer" (M1‑2). Ele bloqueia o telefone e vai ao
WhatsApp, que é o que ele faz ("fico mudando às vezes pro WhatsApp, aí volto",
P3). Volta 3 min depois. Medido no JavaScript: `if(st.view==='saved' && hiddenAt
&& Date.now()-hiddenAt > 20000){ … show('next'); }` — passados 20 s fora, a tela
troca para a próxima série e **o desfazer vai junto**. O que sobra da série
anterior é a linha "Pulldown unilateral: 45 × 10 · sem RIR", com dois botões: RIR
e "+ série". Não há corrigir.

**Por que isso é do modelo e não do acaso.** É a mesma regra que D celebra, e com
razão: "se ele voltou depois de mais de 20 s fora, o lugar do polegar já é da
próxima série" (contexto, M1‑3). Só que o instante em que ele volta e olha a tela
é também o instante em que um erro de toque é notado. A regra que acerta o avanço
erra a correção, com o mesmo gatilho.

**E a correção não está desenhada em lugar nenhum.** Os 14 estados do M1 de D não
têm o caso do toque errado. C desenhou esse caso (estado 5) e nomeou a correção
como a proteção que paga o toque único; D nomeia o desfazer, e o desfazer é
temporário.

**A frequência.** U1 são 48 séries por semana medidas (P1‑B). A taxa de toque
errado **não é medida**. Que a correção é ato real, o registro mostra: 16 registros
de exercício apagados no arquivo inteiro (P1).

**O que ele vive.** Sabe que o número está errado, vê o número errado na tela, e
não há onde tocar sem sair do caminho.

**Quão fundo é o conserto.** Regra (quanto tempo o desfazer vive, ou onde mora a
correção depois dele).

### D‑4 · A régua rola na horizontal, e a ponta da faixa prescrita cai para fora da tela

**O caso.** Elevação lateral na máquina, alvo 10–15, última vez 14. Medido no
CSS: `.rep{flex:none; width:54px; …}` com `gap:6px` numa faixa
`overflow-x:auto` (linhas 162 e 164 de `momento-1.html`). Em 414 pt de largura,
descontada a margem, cabem cerca de 6,3 botões. A captura que a própria direção
deixou (`_trabalho/t1b-c.png`) mostra o que isso dá: visíveis **11, 12, 13, 14,
15, 16** e um pedaço do 17 — e o **10, que está dentro da faixa prescrita, fora da
tela à esquerda**, com o sublinhado da faixa cortado.

**Quando o 10 é o número.** Logo depois de subir a carga: "sobe a carga no menor
incremento prático e recomeça perto da base" (F95). É a mesma armadilha de C‑4,
pelo caminho oposto: C não oferece o número, D o oferece atrás de um arrasto
horizontal — de pé, suado, com uma mão (F28), num descanso de 1:30 a 3 min (F29).

**A frequência.** Não medida em P1. Pelo desenho de D, 1 dos 8 exercícios da
sessão está nesse estado (estimativa marcada, conta minha sobre o desenho).

**O que ele vive.** O gesto que a direção vende como "um toque" vira arrastar e
tocar, com a mão molhada, no número que mais importa.

**Quão fundo é o conserto.** Regra (quantos números a janela mostra e onde ela se
centra). Não é detalhe: com 54 pt de alvo e 414 pt de tela, 12 números não cabem,
e os dois requisitos — alvo grande e faixa inteira à vista — não são
simultaneamente satisfeitos pela forma escolhida.

### D‑5 · A projeção de fim é mais frágil justamente cedo, que é quando cortar vale a pena

**O caso.** 6h30, segunda série da sessão. O cabeçalho traz "fim ~X no ritmo de
hoje", e a direção diz para que serve: "esta linha é a informação para cortar
cedo, e não só no fim" (M1). A conta é "o tempo até a última série guardada,
dividido pelas séries guardadas, vezes as séries que restam".

**Por que ela é frágil cedo.** Com 1 série guardada, a projeção é o tempo de uma
série vezes 19. Com 2, metade disso vezes 18. Conta minha, com os números do
próprio desenho (início 6h20): 1 série aos 6h25 projeta fim às 8h00; 2 séries aos
6h29 projetam 7h50. **Dez minutos de oscilação por série, no primeiro quarto da
sessão.** E ela é sistematicamente pessimista no começo, porque os exercícios
grandes vêm primeiro e têm descanso de 3:00 (M1‑7, chest press) contra 1:45 e
2:00 dos demais.

**O desenho não segue a própria fórmula em 2 de 6 estados.** Conta minha, pela
fórmula escrita: M1‑6 (7h01, 41 min, 10 guardadas, 10 restantes) dá 7h42, e a tela
diz ~7h34 — 8 min de diferença; M1‑3 (6h58, 38 min, 10 e 10) dá 7h36, e a tela diz
~7h33. Os outros quatro batem (M1‑1, M1‑2, M1‑5, M1‑11).

**A frequência.** Toda sessão ao vivo: 3 por semana medidas, 5 prescritas (02‑uso
§2). A hora‑limite é dura: ele precisa estar no trabalho às 8h e acabar por volta
de 7h40 (P2).

**O que ele vive.** Olha o número para decidir o que cortar, e o número muda dez
minutos a cada série enquanto ele ainda tem o que cortar.

**Quão fundo é o conserto.** Regra, para o estimador. Detalhe, para os dois números
errados do desenho.

### D‑6 · O lugar do corpo é declarado lugar de notebook, mas a pesagem acontece no telefone, dentro da sessão

**O caso.** 6h40, entre séries, no subsolo. Ele põe o peso da manhã. É o
comportamento medido: 7 das 11 pesagens do próprio dia entraram no registro entre
6h28 e 7h52 (P1). Em D isso é um chip no descanso ("Peso de hoje", M1‑2), e está
bem resolvido.

**O problema.** Evolução — o lugar de peso, medidas, bioimpedância e fotos — é
declarado "notebook, sobretudo (P11)" na tabela de lugares, enquanto a escrita do
peso mora em Agora, na sessão e em Dias. Com E2, o lugar próprio existe para
**ler** e não existe para **escrever**, e o que falha no medido é escrever: 36%
das pesagens de P1‑B entraram com data passada e 50% em P1‑A (P1), e a prescrição
pede 3 a 4 por semana contra 2,75 medidas (F42, P1).

**A frequência.** 2,75 pesagens por semana medidas (02‑uso §2); medidas com fita e
bioimpedância são desejo novo sem frequência definida (D1, D2).

**O que ele vive.** Três portas para o mesmo dado e nenhuma casa; a casa que
existe é a de ler, e está declarada para outro aparelho.

**Quão fundo é o conserto.** Regra.

### D‑7 · O contador da regra fica em zero por meses, na tela de entrada

**O caso.** Qualquer dia. A tela Agora termina com 14 quadradinhos e a frase "Dias
com marca nos últimos 14: 0. A regra precisa de 11." Com 1 dia marcado em 22
(P1), esse número fica em 0 ou 1 por meses.

**A frequência.** Aparece em 6 dos 13 estados desenhados do M2 (medido). Em C o
mesmo número aparece em 7 de 10 estados **e no topo da tela** — ali é pior, e já
entra no achado C‑3.

**O que ele vive.** Um placar de fracasso fixo, para quem já disse que tem muita
dificuldade de registrar (P5). D acerta ao pôr isso no pé da tela e ao escrever a
regra em vez de uma sequência; mas um número parado em 0 por 90 dias não é
informação, é cobrança.

**Quão fundo é o conserto.** Detalhe (onde fica, como se diz), já que a função —
mostrar por que marcar importa (F213) — é legítima e nenhuma das duas inventou.

### D‑8 · E1 colide de frente com a regra 4 de D

Está detalhado na seção 2. Resumo: a regra 4 de D é "nenhuma decisão nova sob o
relógio", e E1 põe uma decisão nova no fim do treino. Em D o conserto é de
**regra**, não de modelo, porque existe um cartão nomeado de fim de sessão para
pendurar ("Encerrar às 7h31", descrito e não desenhado). O número que E1 não
resolve: a pergunta só alcança as 58% de sessões que ele encerra (7 de 12 em
P1‑B; 10 de 27 em P1‑A, 37%).

---

## 5 · O que não consegui separar entre as duas (quebra igual nas duas)

- **A aula do box (U7) não foi desenhada por nenhuma das duas.** É a 3ª situação
  mais difícil (4 condições) e a de maior falha de detalhe: 0 de 5 aulas com
  movimentos e 0 com lousa, 4 de 5 registradas depois do dia (P1). As duas a
  descrevem bem e nenhuma a mostra. Conserto: entrega.
- **Comparar fotos antigas (U13) não foi desenhado por nenhuma das duas**, e é o
  que o dono diz fazer mais ("isso eu vejo bastante mesmo", P8). É também a única
  situação que depende de rede e de conta (F232, F238) e cuja cópia local é
  apagada a cada atualização publicada (F252). As duas o situam em Semanas/Evolução
  e nenhuma o resolve. Conserto: entrega, e possivelmente modelo, porque a
  restrição é de dado e não de tela.
- **A sessão de fotos a 3 m (U9, C7) não foi desenhada por nenhuma das duas.** C
  descreve voz e som; D diz explicitamente que não desenhou e levanta a pergunta
  ("A 3 m, ele lê a tela?"). Conserto: entrega, dependente de uma resposta do dono.
- **O cardio hachurado para sempre.** 0 de 16 prescritos em 8 semanas (P1, F46). As
  duas mostram a linha prevista e a marcam como buraco, duas vezes por semana,
  indefinidamente. C levanta isso como pergunta 7; D não levanta. Conserto: regra
  (quando um previsto que nunca acontece deixa de ser previsto).
- **Começar a sessão a partir da tela do dia não tem alvo desenhado em nenhuma das
  duas**, quando o cartão do "agora" escolheu outra coisa (C‑1 e D‑2).

---

## 6 · O que aguenta

Tentei derrubar isto e não consegui. Vale tanto quanto o resto.

1. **A volta de outro aplicativo no meio do descanso.** Nas duas, o descanso é
   recalculado pelo relógio do aparelho a partir do instante gravado no toque, e a
   tela volta exatamente onde estava (C estado 3, 2:12; D M1‑3, 3:10). É a resposta
   certa para F57 e para P3, e custa **zero toques** nas duas. Tentei quebrar com o
   app fechado pelo iOS: as duas abrem na mesma série (C estado 9; D M1‑8), com
   prazo para a leitura local não ficar girando (C: "leitura local sem resposta há
   6 s"; D: 4 s), o que responde a F273.
2. **O subsolo sem rede.** Nada do M1 e do M2 de nenhuma das duas usa rede, e os
   quatro arquivos são de fato autocontidos — medido: zero `src`, zero `href`
   externo, zero `@import` nos quatro HTML. A instalação com buracos que só
   apareceram offline (F278) não tem como se repetir nestes dois momentos.
3. **A sessão que ninguém encerrou.** 42% a 59% das sessões (P1). As duas se
   recusam a brigar com isso: a sessão fecha sozinha na última série, a duração vai
   marcada como aproximada (F152), e na manhã seguinte há **uma** pergunta, sem
   relógio em cima (C estado 10; D M1‑13). Nas duas, as mudanças do dia não se
   perdem nem viram programa sozinhas. Não achei por onde derrubar.
4. **"Desconhecido não é zero".** As duas levam a F198 e a F200 a sério e, melhor
   que isso, **escrevem a consequência antes do toque**: C mostra "9 → 8 de 14"
   dentro da folha de escolha, D mostra "sem saber quanto, hoje deixa de contar…".
   Isso é exatamente a proteção contra o erro que já aconteceu (F292). Em C a
   proteção é inteira; em D ela convive com a porta do D‑1, mas a parte desenhada
   da proteção está certa nas duas.
5. **Nenhum falso sucesso.** As duas desenham o erro de gravação na própria linha,
   com texto e borda, e mantêm o valor na tela até gravar (C estados 8 e 9; D M1‑10
   e M2‑10). É a resposta direta a F294 e a F296 — o toque que por 48 dias não fazia
   nada sem avisar ninguém. Tentei derrubar com espaço esgotado e com aba privada:
   as duas têm tela, causa e saída (F53, F55, F52, F56).
6. **O teclado.** Nenhum número passa pelo teclado do sistema em nenhuma das duas;
   as duas têm vírgula, teclas grandes, sem zoom e sem cobrir a tela (F61, F63,
   F65, F66). As duas assumem o custo por escrito. Não achei caso de uso medido em
   que isso quebre.
7. **A série além das prescritas** — o pedido explícito do dono, "deveria ser mais
   fácil, direto, por ali já" (P12). **Dois toques nas duas**, verificado nos dois
   protótipos: em C, "+ 3ª série" abre cinco botões no mesmo lugar; em D, "+ série"
   devolve a régua com a série anterior como referência. As duas resolvem sem menu,
   sem tela de edição e sem pergunta.
8. **O caso base do M1, que é a situação mais frequente do produto.** **Um toque**
   nas duas, verificado no JavaScript dos dois protótipos: a carga já vem igual à da
   última vez (F171), a referência é a mesma série da sessão anterior (F170), e
   tocar no número grava. Com 48 séries por semana medidas (P1‑B), é o acerto que
   mais vale, e as duas o têm.
9. **O caso base do M2.** **Um toque** nas duas para a refeição do momento, com a
   janela de horário absorvendo a diferença entre o plano (16h00) e o hábito dele
   (15h30) — K4 está tratado explicitamente nas duas.
10. **Paisagem.** As duas reorganizam em duas colunas, com a leitura à esquerda e o
    polegar à direita (C estado 11; D M1‑14), em vez de quebrar. O iOS não deixa
    travar a orientação de um app web (F60), e as duas sabem disso.
11. **O descanso não apita, não vibra e não fica vermelho.** As duas tratam o tempo
    como lembrete e não como ordem, que é o que o treinador manda (F97), e nenhuma
    depende de som ou vibração, que não são confiáveis (F58, F59). Tentei derrubar
    pela pressa — "ele perde tempo porque nada o chama" — e não consegui sustentar:
    a medida diz que ele volta ao app ~16 vezes por sessão (P1‑B) e que o problema
    medido é a sessão que não termina, não o descanso que estica.

---

## 7 · O que fica sem medida

- A taxa de toque errado com a mão suada (pesa em C‑6 e D‑3): **não medida**.
- A frequência de subida de carga (pesa em C‑4 e D‑4): **não medida** em P1; usei
  estimativa marcada, tirada do próprio desenho.
- A frequência de usar o produto no notebook (U14) e de comparar fotos antigas
  (U13): "bastante" (P8, P11), **não contada**. Isso limita o quanto eu posso
  cobrar das duas direções pelo que não desenharam ali.
- Se o sinal no subsolo some de todo ou é só fraco, e se há Wi‑Fi (P3 sem essa
  parte): não muda nenhum achado acima, porque as duas tratam "sem rede" como
  estado normal.
- O que ele nunca deixa de registrar sob pressão (P12 sem essa parte): sem isso,
  não dá para dizer qual das duas protege melhor o dado que ele mais quer.
- Qualquer uso depois de 30/09/2026.
