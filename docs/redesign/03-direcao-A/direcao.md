# Direção A · Lápis e tinta

Desenhos: `momento-1.html` (17 estados) e `momento-2.html` (13 estados). Abrem
no navegador do telefone sem rede; o primeiro estado de cada um é interativo.

---

## A tese

**Como quase tudo o que este produto registra já estava escrito antes de
acontecer, na prescrição ou na última vez, a interface escreve o previsto a
lápis, e o trabalho de quem usa é passar a tinta: confirmar com um toque o que
foi igual e corrigir só o que foi diferente, na hora ou depois.**

---

## O modelo

### Por que esta tese serve ao uso medido

- **A série.** É a situação mais frequente: 48 registros por semana, com quatro
  condições adversas ao mesmo tempo (02-uso §3). Na maior parte das séries, a
  carga é a mesma da série correspondente da última sessão (F171), e as
  repetições sobem uma de cada vez (F95). Quase tudo o que ele digitaria já está
  guardado. Digitar dois números do zero custa de 6 a 8 toques e um teclado. Aqui,
  o caso de referência custa 2 toques: **+** e **Registrar**.
- **A comida.** É a maior falha medida do produto: 1 dia marcado em 22 (02-uso
  U10). O plano é fixo (F181), e a marca mais comum é “comi esta refeição
  inteira” (F195). Se a marca mais comum custar um toque, o que sobra entre ele e
  o registro é lembrar. Para lembrar, a direção não tem servidor que o chame
  (F11). Tem o dia anterior esperando a lápis no topo da tela que ele já abre.
- **Pôr em dia.** É a segunda situação mais frequente (U11): chegaram depois do
  dia 29% das sessões, de 36% a 50% das pesagens e toda a comida. Com o lápis, o
  que não foi marcado na hora continua escrito no dia certo. Pôr em dia é a mesma
  ação, num outro dia, na mesma tela.
- **A aula e o cardio.** O dono quer “saber qual é o wall ball que eu costumo
  pegar, ou o que eu peguei por último” (P4). Os pesos do box ficam os mesmos por
  meses (F123). Isso é, literalmente, o previsto a lápis vindo da última vez.

### Lápis e tinta: três regras que não se quebram

**A lápis** é o previsto: borda tracejada, texto grafite, sem hora. **A tinta**
é o registrado: fundo azul-tinta, ✓ e a hora. O leitor de tela diz “previsto” ou
“registrado às 6h55”: o estado nunca depende só da cor.

1. **Nada vira tinta sozinho.** Só um toque dele passa algo a tinta: nem a série,
   nem a refeição, nem o dia.
2. **A tinta só aparece depois de gravado.** Se a gravação falha, a linha
   continua a lápis, com borda de erro e o que fazer (M1 estado 15, M2 estado 12).
   Por 48 dias, escolher alimento não fez nada sem dar erro (F296). Fechar o app
   logo depois de digitar já perdeu série (F294). Aqui, a falha não tem como
   parecer sucesso.
3. **O lápis nunca é inventado.** Ele vem da prescrição, do plano ou da última
   vez. Sem fonte, fica vazio, e o botão diz o que falta (M1 estado 8).

**O que nunca vem a lápis** é o que mede o corpo ou a percepção: peso, cintura,
as medidas novas, a bioimpedância e o RIR. Para essas, o lápis marca só o lugar
(“pesagem da manhã: nenhuma nesta semana; a regra pede ao menos 2”), nunca o
número.

| o que | o lápis traz | de onde |
|---|---|---|
| série | carga e repetições da mesma série na última sessão, com a data | F170 |
| série a mais | o que ele acabou de fazer | P12 |
| refeição | itens, kcal, a nota do nutricionista, a hora do plano ou a hora movida pela regra | F181, F182, F189 |
| água | 14 copos vazios: “sem conta”, não zero | F194, F198 |
| treino do dia | o próximo da sequência, não o dia da semana | F81 |
| cardio | modalidade, minutos e intensidade do último registro, no dia previsto | F46, F47 |
| aula | “fiz a aula”; se quiser detalhar, os movimentos e pesos da última vez | F123, F136, P4 |
| pesagem | só o lugar e quantas faltam na semana | F42, F211 |
| fotos do corpo | as 9 poses vazias, no dia em que a sessão vence | F226 |
| como foi o dia | uma sugestão, quando tudo do dia já está a tinta | F195 |

### A unidade é o dia

**Hoje** mostra o dia de hoje em ordem de hora: refeições, treino, pesagem, água,
cardio e fotos quando vencem. A refeição mais perto de agora vem aberta, com o
botão grande, mas é só um destaque: nada fica escondido (veja as descartadas,
abaixo). Cada dia passado é **a mesma tela**, com a data escrita. Se ontem ficou
a lápis, ele aparece no topo de Hoje, com o que falta dito por extenso.

### Quatro lugares

- **Hoje.** O dia. Leva à sessão (M1) e à comida (M2). Com uma sessão aberta, o
  app abre direto nela, sem a barra de abas. “‹ Hoje” volta, e “Dia ▾” traz peso,
  água e comida numa folha sem sair do treino (M1 estado 10).
- **Semana.** Domingo a sábado, que é a semana da regra (F211). Um quadro de dias
  por coisas, a lápis e a tinta (M2 estado 13, no notebook). Também ficam aqui:
  - o peso médio da semana;
  - a saída da regra do nutricionista, com os números que a produziram (F215);
  - o passo de ±150 kcal, que um toque aplica e que mostra o arroz mudando ±60 g
    no almoço e no jantar (F212, F218);
  - a avaliação visual, quando a regra a pede, com o par de fotos ao lado (F220);
  - a tendência de força (F175);
  - as séries por músculo contra as prescritas, com a maior inversão de
    prioridade da semana (F177, F178);
  - o sinal de força definido à mão (F223).

  Quando a regra fica em “registrar mais”, a frase leva direto à lista dos 14
  dias (M2 estado 7): a falha da comida e a decisão da regra ficam ligadas na
  tela. É aqui que mora “rever como têm sido as semanas” (D3). No notebook, é a
  tela principal (U14).
- **Prescrição.** A fonte do lápis:
  - os treinos A–E e a aula, com a sequência;
  - o plano alimentar, os alimentos e as compras (F203);
  - as diferenças contra o treinador e o nutricionista (F161), o histórico (F163)
    e há quanto tempo cada exercício está na posição (F162, a regra de 6 a 8
    semanas);
  - **A decidir**: as mudanças do dia que esperam virar permanentes ou não.

  Ao mudar séries, a tela mostra o novo total semanal do músculo contra o
  prescrito (F179).
- **Corpo.** O peso, numa curva em que a média semanal vem na frente e a pesagem
  do dia fica como ponto claro (o dia não decide, F211). A cintura, as medidas
  novas e a bioimpedância (D1, D2). As fotos do corpo e as fotos de aparelho.
  - **Comparar fotos** abre, por padrão, a mais nova contra a mais antiga na
    mesma pose, que é o intervalo que mostra mudança (F230). Uma foto que não
    está no aparelho mostra o estado dela: “na cópia remota, baixar”, “sem conta,
    não há como buscar” ou “a busca falhou, tentar de novo” (F238).
  - **A sessão de fotos** a 3 m do celular começa com um toque, que também
    habilita o som (F58). Cada pose é uma casa a lápis. A contagem vem em números
    que ocupam a tela inteira e com bipes curtos, porque ele não alcança o
    aparelho (F45). Se ele interromper, continua na primeira pose vazia (F235).
- **Ajustes**, no canto de Hoje: a conta e a sincronização, a cópia de
  segurança, restaurar e apagar o histórico. O login vencido aparece aqui como
  um ponto e nunca interrompe um treino.

### Regras de interação tiradas dos contextos dos fatos

- **Zona do polegar.** Tudo o que registra fica na metade de baixo. Os alvos têm
  pelo menos 44 pt. O botão diz o que vai gravar (“Registrar 40 kg × 10”), porque
  quem está suado e com pressa lê o botão, não o formulário (F28).
- **Teclado próprio para números**, na sessão e na pesagem. Ele aceita a vírgula
  de “22,5” (F63), não dá zoom (F61), cobre só a zona do polegar (F65) e não
  empurra o que está fixo na tela (F66).
- **O tempo vem do relógio da parede, nunca de um contador.** O descanso e a
  duração são “agora menos a hora da última série”, recalculados ao voltar.
  Isso sobrevive ao celular bloqueado e a outro aplicativo na frente (F57, F269,
  F294).
- **A estimativa do fim** é o ritmo da sessão até ali vezes as séries que faltam
  (“~39 min → ~7h40”). Ela fica ao lado da prioridade que o treinador deu a cada
  exercício (F15). O app mostra o custo de cada escolha e não recomenda o que
  cortar (F2).
- **“Voltar” fecha folhas e muda de lugar**, mas nunca fecha o app no meio de uma
  série (F69, F294).
- **Toda linha que não é de hoje tem a data escrita**, e a marca vai para a data
  que está escrita nela (F7, F299). Até as 4h, o que sobrou de ontem fica no
  topo (M2 estado 10).
- **De lado, duas colunas** (F60).
- **Sem rede não gera aviso**: é o normal do subsolo (F25, F248). Só há aviso
  para o que põe dado em risco: modo privado, aberto como site, endereço vazio
  (F52, F55, F56).
- **Carregar tem prazo**: depois de alguns segundos a tela explica, e depois de
  mais alguns oferece uma saída. Ela nunca fica carregando para sempre (F273).

### Acessibilidade é estrutura, não acabamento

- **O estado nunca depende só da cor.** Lápis é tracejado, grafite e sem hora;
  tinta é cheia, com ✓ e hora; o rótulo de leitura diz “previsto” ou
  “registrado”.
- **O texto acompanha o tamanho de letra do iOS**, pela fonte de corpo do sistema,
  e o layout usa unidades relativas.
- **O contraste foi medido nos dois temas**: texto ≥ 4,5:1 e bordas tracejadas
  ≥ 3:1 (conta em `_trabalho/contraste.py`). O “mais tarde” se diz com texto, não
  com transparência.
- **A pinça de zoom fica liberada.** Só o toque duplo é desligado nos controles
  (F62).
- **Nenhum gesto é o único caminho, e nenhuma ação depende de prazo.** O aviso de
  desfazer some, mas qualquer registro se corrige tocando nele.
- **Movimento reduzido é respeitado.** A passagem do lápis à tinta (0,24 s) vira
  troca instantânea.
- **Claro e escuro seguem o sistema.** O teclado próprio tem nome em cada tecla.

### Cobertura das tarefas do 01-fatos

| tarefa | onde vive | desenhado? |
|---|---|---|
| começar a sessão (antes do aquecimento ou na 1ª série), deload, outro treino | Hoje | M1 estado 13 |
| registrar série, RIR, série a mais | sessão | M1 estados 1–6 |
| trocar, pular, fazer depois, mudanças do dia | sessão | M1 estados 2, 7, 8 |
| foto do aparelho, orientação do treinador, pegada e pé | cartão do exercício | M1 estados 1, 8, 13 (pegada e pé abrem no mesmo lugar da orientação) |
| subir carga, dor repetida, volta de pausa | cartão do exercício | M1 estado 9 |
| dor, nota, séries de aproximação | “Dor ou nota” | descrito |
| encerrar; não encerrada; corrigir a duração | sessão, Hoje | M1 estados 11, 12 |
| decidir se mudança do dia vira permanente | Prescrição › A decidir | descrito (M1 estados 4, 11, 12 levam até lá) |
| treino em data passada, fora da prescrição, descanso, apagar sessão, dois treinos no dia | o dia passado (mesma tela de Hoje) | descrito |
| aula: presença, detalhe opcional, pesos da última vez, transcrição da lousa, aulas guardadas | Hoje e o dia da aula | descrito |
| cardio | Hoje, a lápis, depois do A e do D | M1 estado 11 (menção) |
| marcar refeição, porção, água, tipo de dia, alta demanda, horário do treino, como foi o dia | Hoje e qualquer dia | M2 inteiro |
| plano, alimentos, compras, restaurar o plano | Prescrição | descrito |
| pesagem, cintura, medidas novas, bioimpedância | Hoje (o lugar) e Corpo | M1 estado 10, M2 estado 1; o resto descrito |
| fotos do corpo, comparação, ajuste, nota, avaliação visual | Corpo e Semana | descrito |
| regra do nutricionista, passo de ±150, sinal de força | Semana | descrito; a faixa de 14 dias está em M2 |
| programa: editar, criar treino, reordenar, cadastrar e renomear exercício, comparar, restaurar | Prescrição | descrito |
| sincronia, cópia, restaurar, apagar; avisos do aparelho | Ajustes e o topo das telas | M1 estado 16 |

**O que fica de fora.** Nenhuma tarefa sai do produto. Fica sem desenho, só
descrito: Semana, Prescrição, Corpo, a sessão de fotos, a aula, o cardio, as
compras. Duas coisas o modelo aceita sem que eu as tenha desenhado:

- o **bi-set** (F105): o cartão de foco alterna os dois exercícios; a prescrição
  vigente não tem nenhum;
- o app **embutido no Claude.ai** (F79): é a mesma interface, numa coluna
  estreita.

---

## Os dois momentos

### M1 · Entre duas séries, na academia, com o relógio contra

**O caso.** São 6h55, na décima série da sessão, que começou às 6h22. O descanso
prescrito é de 2 min, o celular está bloqueado com música e o sinal é fraco. A
série saiu com a mesma carga e uma repetição a mais. Ele desbloqueia e a tela
está onde ele parou. A série 2 do pulldown unilateral está a lápis com
“40 kg × 9, na última, ter 22/09”. Ele toca **+** e **Registrar 40 kg × 10**. A
série vira tinta, o descanso começa a contar pelo relógio e a próxima série
(elevação lateral, prioridade máxima) já está a lápis. O RIR é um toque a mais,
se ele quiser (hoje ele registra em 66% das séries).

| # | estado | o que a tela faz | fatos |
|---|---|---|---|
| 1 | o caso (interativo) | série a lápis com a referência; 2 toques | F95, F170, F171 |
| 2 | logo depois | tinta; descanso como lembrete, sem alarme; “+ outra série” no exercício que acabou; desfazer | F97, P12 |
| 3 | volta do WhatsApp, 6 min depois | tempo certo pelo relógio; “foi pausa?” opcional; estimativa do fim atualizada | F57, F152, F294 |
| 4 | série a mais | 1 toque; nasce com o que acabou de fazer; mudança só de hoje, decidida depois | F159, F179, P12 |
| 5 | mudar a carga | teclado próprio com vírgula, só na zona do polegar | F61, F63, F65, F66 |
| 6 | número improvável (caso ruim) | “140 repetições?” com duas saídas iguais; nunca bloqueia | F139 |
| 7 | máquina ocupada | substitutos com ★ do treinador, “o que muda”, última vez em outro treino, foto do aparelho; “fazer depois” | F106–F110, F151, F224 |
| 8 | sem referência (vazio do exercício) | nada inventado; o botão diz o que falta; fotografar o aparelho | F109, F224 |
| 9 | a regra do treinador fala | subir carga com o RIR da última vez; dor repetida; volta de pausa sem indicação | F102, F168, F169, F172 |
| 10 | o resto do dia | “Dia ▾”: pesagem, água, pré-treino e ontem, sem sair da sessão | F30, K6 |
| 11 | encerrar | 1 toque, sem questionário; não feito fica não feito; mudança vai para A decidir; cardio fica a lápis | F152–F154, F280 |
| 12 | não encerrou (caso ruim comum) | no dia seguinte, aviso de duração aproximada e corrigir o fim; nada se perdeu | F34, F152, F293 |
| 13 | antes de começar · vazio | o próximo da sequência; duas formas de começar; primeira vez de todas | F81, F93, F152 |
| 14 | carregando, lento, falhou | três prazos; nada é apagado | F72, F73, F273 |
| 15 | erro: não guardou | continua a lápis, com borda de erro; nada aparece azul sem estar gravado | F53, F294, F296 |
| 16 | avisos do aparelho | modo privado, aberto como site, endereço vazio, versão nova | F52, F55, F56, F70 |
| 17 | paisagem | duas colunas | F60 |

### M2 · Depois de comer, no meio do dia

**O caso, primeira parte.** É quarta, 15h34, no trabalho. Hoje está aberta, o
lanche das 16h é a refeição mais perto de agora e vem aberto, com os itens e a
nota do nutricionista. Ele dá um toque em **Comi tudo**. O lanche vira tinta, e o
quadrado de hoje na faixa dos 14 dias fica meio cheio: o dia já conta, mas ainda
tem refeição a lápis.

**Segunda parte.** É quinta, 13h41 (a mesma hora de uma das marcações reais
feitas depois, P1). No topo de Hoje: “Ontem, quarta 30/09, ficou a lápis”. Ele
abre a revisão e, na mesma tela de um dia qualquer, marca pré, intra e café como
**Tudo**, o almoço como **Metade** e o jantar como **Não**. Na água, toca **Não
contei**. Em “Como foi o dia”, escolhe **Saí do plano e sei o que comi**, e a
opção diz o efeito: “conta para a regra”. Ao voltar, o quadrado de ontem está
cheio, e a faixa diz quanto falta para a regra voltar a decidir.

| # | estado | o que a tela faz | fatos |
|---|---|---|---|
| 1 | o caso (interativo) | o dia em ordem de hora; a refeição de agora aberta; 1 toque | F181, F182, F195 |
| 2 | logo depois | tinta; faixa de 14 dias; água “sem conta”; cada copo é o seu total; como foi o dia | F194, F198, F200, F213 |
| 3 | comeu só parte | tudo, metade, outra fração, não comi; a porção vale só para o dia | F196, F199 |
| 4 | dia seguinte | ontem a lápis no topo; revisar item por item ou “foi tudo no plano” | F197, P1, U10 |
| 5 | pondo ontem em dia | três botões por linha; “como foi o dia” diz o efeito na regra | F195, F200 |
| 6 | ontem revisado | o resumo do que ficou; quanto falta para a regra decidir | F212, F213, F215 |
| 7 | nove dias atrás (caso ruim) | os 14 dias; “não lembro” deixa o dia a lápis: desconhecido, não zero | F198, F209 |
| 8 | treino à noite | o lápis segue a regra de horários; o café sai depois das 16h; cada mudança diz o porquê | F189–F192 |
| 9 | descanso e alta demanda | o tipo do dia, com o palpite dito como palpite; maltodextrina a lápis | F186–F188 |
| 10 | depois da meia-noite (caso ruim) | o que sobrou de ontem fica no topo, com a data | F7, F299 |
| 11 | vazio | o primeiro dia, todo a lápis; o aparelho sem plano | F56, F271 |
| 12 | carregando; erro: não guardou | a marca que falhou não fica azul | F288, F296 |
| 13 | no notebook | 14 dias numa tela, por clique e por teclado | F50, P11, U14 |

**A aposta, dita como aposta.** Esta direção não sabe se o dia conhecido vai
passar de 1 em 22 para 11 em 14. Ela tira tudo o que custa entre ele e a marca,
menos o lembrar. A medida que confere a aposta já existe no produto: os dias
conhecidos entre os últimos 14 (F213).

---

## O que esta direção se recusa a fazer, e quanto custa

1. **Passar a tinta sozinha.** O app não presume que ele seguiu o plano, não
   fecha o dia por ele e não registra série que não foi tocada.
   *Custo:* o buraco da comida não se fecha sozinho. Enquanto ele não marcar, a
   regra continua em “não mexer e registrar mais” (F212).
2. **Pôr número a lápis em medida e em percepção** (peso, cintura, medidas,
   bioimpedância, RIR).
   *Custo:* a pesagem sempre tem 4 ou 5 toques de digitação, e o RIR sempre tem
   1 toque a mais. Quem quer só confirmar o peso de ontem não pode.
3. **Tocar alarme de descanso** ou prometer aviso com o celular bloqueado. Com o
   app suspenso nada roda (F57), e som só toca em contexto criado por toque (F58).
   Um bipe que às vezes não toca ensina a confiar no que falha.
   *Custo:* quem quer o bipe dos 2:00 não tem; precisa olhar a tela.
4. **Segurar o fim da sessão com perguntas.** Encerrar é um toque, e a decisão
   sobre as mudanças do dia vai para “A decidir”.
   *Custo:* as decisões podem se acumular, e o programa pessoal fica para trás
   até ele sentar e decidir.
5. **Recomendar o que cortar ou o que mudar.** O app mostra o tempo, a prioridade
   do treinador e a regra escrita, mas não prescreve (F2).
   *Custo:* às 7h20, com a hora apertando, escolher o exercício que fica de fora
   continua sendo trabalho dele.
6. **Usar o teclado do sistema para número** na sessão e na pesagem.
   *Custo:* é um teclado a construir e a manter. Não tem colar nem ditado, e o
   suporte ao VoiceOver precisa ser feito à mão.
7. **Esconder ação atrás de gesto.** Todo deslizar tem um botão equivalente.
   *Custo:* as telas têm mais botões visíveis, e a sessão fica mais densa do que
   poderia.
8. **Abrir em gráfico.** A primeira tela é o dia, não a evolução.
   *Custo:* acompanhar, que o dono faz “bastante” no notebook (P8, P11), fica
   sempre a um toque, em Semana ou em Corpo.

---

## Duas direções que considerei e descartei

**“Agora”: uma tela só, que adivinha o momento pela hora e pelo estado e esconde
o resto.** Às 6h mostraria a série; às 15h30, o lanche. Descartei porque a
adivinhação erra justamente nos casos frequentes dos fatos:

- 8 de 28 sessões fora da manhã, espalhadas das 11h às 20h (K2);
- refeições que andam com o treino (F189);
- a sessão de ontem ainda aberta (F34);
- o pôr em dia, que é a segunda situação mais frequente (U11) e não tem “agora”;
- o notebook (U14), onde não existe momento a adivinhar.

Quando o palpite erra, a pessoa luta contra a tela. Ficou só o destaque leve da
refeição mais perto de agora, que não esconde nada.

**“Ditado”: registrar falando ou escrevendo uma frase livre** (“almocei metade,
jantei fora”, “40 por 10”). Descartei por quatro motivos:

- interpretar linguagem pede um serviço que o produto não tem (F11), e no
  subsolo não há rede (F25);
- falar no meio da academia, com música, é pior do que tocar;
- uma interpretação errada registra no lugar errado, e os fatos consideram isso
  pior do que não achar (F259);
- mudaria o que o produto faz.

---

## Perguntas que eu não tenho como responder sozinho

Cada uma muda o que o produto faz. O desenho entregue não depende da resposta.

1. **Um dia sem marca deve ser presumido “seguiu o plano” depois de algum
   tempo?**
   - *Ganha:* a adesão chega a 11 de 14 e a regra volta a decidir.
   - *Perde:* a regra do nutricionista passaria a mover ±150 kcal sobre uma
     presunção, justamente o que ela foi escrita para não fazer (F198, F202,
     F213). E é regra de outro agente (F2).
   - *Desenhado sem isso:* o atalho “Foi tudo no plano”, que é uma declaração
     dele, num toque.
2. **O produto deve saber a hora-limite da sessão (no caso medido, ~7h40)?**
   - *Ganha:* o cabeçalho diria “cabe” ou “não cabe” e quantas séries ficariam
     de fora no ritmo de hoje.
   - *Perde:* é um dado novo, sem sentido para quem treina sem hora marcada (P3),
     e a tela passaria a soar como ordem de cortar.
   - *Desenhado sem isso:* a estimativa do fim (“~7h40”), que ele compara com a
     própria hora.
3. **Registrar por refeição “não comi” ou “comi outra coisa”?** Hoje, “saiu do
   plano” é do dia inteiro (F195).
   - *Ganha:* a reconstituição fica exata, e os padrões por refeição (F201) ficam
     verdadeiros.
   - *Perde:* é um dado novo e uma decisão a mais por refeição.
   - *Desenhado sem isso:* “Não” não grava nada; num dia já respondido em “Como
     foi o dia”, a refeição sem marca aparece como “não comida”.
4. **Aceitar um serviço de notificação, com servidor e conta, para lembrar das
   refeições?**
   - *Ganha:* seria a maior alavanca contra o 1 em 22.
   - *Perde:* servidor próprio, conta obrigatória para isso, custo e um terceiro
     sabendo dos horários dele (F9, F11).
   - *Desenhado sem isso:* o registro acontece onde ele já abre o app. Ontem
     aparece no topo de Hoje, e o resto do dia está na folha da sessão.
5. **A porção do dia aceita frações livres, ou só 1 e 0,5?** Os fatos dão 1 e
   0,5 como exemplos (F195). O desenho oferece “Outra porção” (¼, ¾); a opção sai
   se o dado não aceitar.
6. **Num dia com alguma marca, a refeição sem marca conta como não comida na
   adesão?** F199 e F200 sugerem que sim, mas não dizem. A resposta decide se a
   tela pode avisar “sem marca, conta como não comida”. Hoje ela não avisa.
7. **Quais medidas de fita e quais números da bioimpedância, e com que
   frequência?** (D1, D2: o dono não listou.) Sem isso, Corpo reserva o lugar,
   mas não dá para pôr a lápis o dia de medir.
8. **Manter a tela acesa durante a sessão?** Só funciona a partir do iOS 18.4,
   em app instalado, e antes disso falha sem aviso (F59). A versão do iOS do dono
   não é conhecida. O desenho não depende disso: voltar ao app cai exatamente na
   série, com o tempo certo.
