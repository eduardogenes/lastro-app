# 11 · Dias (o histórico por dia)

> Em uma frase: é a aba que responde "o que aconteceu em cada dia". Mostra o mês em células, três leituras do mês com a conta à vista, e o dia aberto, onde se vê, corrige, apaga ou acrescenta o que ficou registrado: sessões, cardio, a marca de descanso e um treino ou um cardio que ficaram sem registro.

Base da leitura: commit `8ec19a4` (as linhas citadas no índice técnico são desse commit). Onde o comportamento não pôde ser afirmado pelo código ou pelos testes, está escrito **a confirmar**.

Fronteiras, para não duplicar:
- **qual treino é o "previsto"** e como a sequência anda (a aula fora da ordem, o treino fora da prescrição que não conta) são da **área 04**; aqui só se usa a resposta.
- **a aula como dia aberto** (os movimentos, o quadro, a lousa) é da **área 05**; aqui ela aparece como presença ("Aula") e a foto da lousa no detalhe.
- **a comida do dia** e a folha "Pôr este dia em dia" são da **área 06**; aqui só o resumo que o dia mostra e a porta.
- **o modo de sessão** que abre ao "Detalhar exercícios e séries" é da **área 03**; aqui só a entrada e a saída.
- **o cardio de hoje** (registrar e apagar no Agora) é da **área 10**; aqui o cardio de dias passados.
- **a fusão entre aparelhos** é da **área 02**; aqui as chaves e carimbos que os dados desta área levam.

---

## 1. O que o usuário faz aqui

**O mês**

| funcionalidade | o que faz | onde fica | quando aparece / some |
|---|---|---|---|
| Ver o mês | Grade de domingo a sábado ("dom seg ter qua qui sex sáb") com uma célula por dia. Cada célula diz o que o dia teve por forma e palavra: a **letra** do treino ("A", "B D" se houve dois), **"aula"**, **"fora"** (treino fora da prescrição; "+fora" ao lado de uma letra), **"desc."** (descanso marcado), o **coração** do cardio ("♥", "♥2" com dois) e uma **barra** da comida (com marca / sem marca). | Aba **Dias**, cabeçalho "o que aconteceu · Dias". | Sempre. Dia futuro fica apagado e não abre. Hoje tem destaque. |
| Andar entre meses | Setas "‹" e "›" com o nome do mês anterior/seguinte como rótulo acessível ("Setembro", "Novembro"). Trocar de mês **não** sobe a página. | Linha do título, no topo da grade. | "›" fica desligada no mês corrente (não há mês futuro). "‹" não tem limite. Sair da aba e voltar devolve o mês corrente. |
| O título do mês | "outubro de 2026 · até ontem, 14/10" no mês corrente; só "setembro de 2026" nos passados. | Entre as setas. | O "até ontem" some no primeiro dia do mês (ainda não há dia passado no mês). |
| Abrir um dia | Toque na célula abre o **dia aberto** daquele dia. | Célula. | Dias passados. **Hoje abre o Agora** (área 10), não o dia. |
| O vazio do primeiro mês | "Ainda não há dias para ler", explicação e o botão **"Registrar um treino passado"** (abre o lançamento para **ontem**). | Abaixo da grade. | Só enquanto não existe nenhum treino, nenhum cardio e nenhum dia de comida com marca. |

**As três leituras do mês** (abaixo da grade, e só estas três)

| funcionalidade | o que faz | onde fica | quando aparece / some |
|---|---|---|---|
| Dias com treino por semana | Número grande em média móvel de 4 semanas ("4,75"), a linha da média dia a dia no mês com a linha tracejada da prescrição ("6 na prescrição") e a conta por extenso: "19 dias com treino nos últimos 28, divididos por 4. Dois treinos no mesmo dia contam um dia. Descanso não conta." | Seção "Dias com treino por semana". | Antes de completar 28 dias desde o primeiro treino, só a conta: "3 dias com treino em 9. A média usa as últimas 4 semanas, e ainda não há 4." Sem treino nenhum: "Aparece com o primeiro treino…". |
| O cardio do mês | Três números: quantas sessões, quantos minutos no total, quantas "em dia sem musculação". | Seção "Cardio em outubro". | Sem cardio no mês: "Nenhum cardio registrado." |
| Horário de início | Mediana, o mais cedo (com o dia, "qua 08/10") e o mais tarde; um eixo de 5h a 22h com um ponto por sessão e um triângulo na mediana; a nota com quantas sessões têm hora e **o que ficou de fora** ("Não entram as 2 aulas, sem hora de início, nem o treino registrado sem hora."). | Seção "Horário de início". | Sem nenhuma sessão com hora medida: "Aparece com a primeira sessão que tiver hora." |

**O dia aberto** (tela cheia, título "quarta, 8 de outubro")

| funcionalidade | o que faz | onde fica | quando aparece / some |
|---|---|---|---|
| A procedência do dia | Linha pequena acima do título: "dia de treino, pela sessão registrada", "descanso, marcado por você" ou "nada registrado". | Topo. | Sempre. |
| As sessões do dia | Uma linha por sessão, na ordem do horário: letra ("B", "aula", "•" para fora da prescrição), título ("Treino B", "Aula", o nome dado ou "Treino fora da prescrição") e detalhe ("6h22 → 7h31 · 14 de 22 séries", "sem hora", "fechou sem você", ou grupos e duração no fora da prescrição). Toque abre a **sessão passada**. | Lista de registros. | Quando o dia tem sessão. |
| O cardio do dia | Linha com coração, "Cardio · 25 min de bike" e "moderado · 7h35, depois do treino" ou "lançado depois, sem hora". Um segundo cardio igual a um anterior fica em âmbar com "· igual ao das 7h35" (ou "· igual a outro deste dia"). Toque **abre no lugar**: Modalidade, Minutos e Intensidade como botões, cada toque corrige; e "Apagar este cardio". | Mesma lista, intercalado com as sessões pela hora. | Quando o dia tem cardio. Um aberto por vez; tocar de novo fecha. |
| O descanso marcado | Linha "desc. · Descanso" com "marcado em 08/10, às 21h22 · não conta como treino em nenhuma conta" e o botão **"Tirar a marca"**. | Fim da lista. | Só quando o dia foi marcado e não tem sessão. |
| O dia vazio | "Nenhum treino, nenhum descanso" e o palpite: "Pelo padrão semanal, domingo é dia de descanso — é palpite." | No lugar da lista. | Dia sem sessão, sem descanso e sem cardio. |
| Registrar treino / Outro treino | Abre o **lançamento de um treino passado** naquele dia. | Linha de ações. | Sempre. O texto vira "Outro treino" quando o dia já tem sessão. |
| Foi descanso | Marca o dia como descanso, sem passar por folha. | Linha de ações. | Só em dia sem sessão e ainda sem a marca. Com sessão, aparece a nota "Este dia tem treino, então não aceita a marca de descanso." |
| Registrar cardio (o cardio esquecido) | Abre no lugar a escolha de modalidade, minutos (20, 25, 30, 40) e intensidade, e **"Gravar o cardio neste dia"**, com a nota "Entra sem hora: o dia é este, a hora não foi anotada." O botão vira "Fechar o cardio". | Linha de ações e logo abaixo. | Só em dia passado (hoje é pelo Agora). |
| A comida do dia | Os momentos do plano daquele dia, cada um com a **forma** da sua marca, nome e hora ("almoço 12h30"); "3 de 6 com marca"; "Água: 6 copos." ou "não contei"; se o dia conta para a regra dos 14 dias; e de que plano é a referência. Botão **"Pôr este dia em dia"** abre a folha da área 06. | Seção "a comida do dia". | Só em dia passado. |

**A sessão passada** (tela cheia, aberta de uma linha do dia, ou do cartão do Agora que pergunta pelo fim — área 10)

| funcionalidade | o que faz | onde fica | quando aparece / some |
|---|---|---|---|
| O cabeçalho | "Treino B" ou "Aula", com "da sequência · quarta, 08/10 · Superior" (a etiqueta do treino) ou "aula · sábado, 11/10". | Topo. | Sempre. |
| Começo e fim | "Começo 6h22" (com "marcado antes do aquecimento" quando ele tocou Iniciar), ou "sem hora · registrado depois, sem a hora de início". "Fim 7h31" com "declarado por você · 1h09" ou, em âmbar de aproximado, "aproximado: fechou sem você, na última série · 1h09". Sem hora de início: a duração no lugar do fim, ou "não medido". | Bloco do tempo. | O fim some com a sessão ainda em andamento. |
| Corrigir o tempo | "Corrigir" abre botões 30, 45, 60, 75, 90 min e a nota "Hoje está 1h09. Corrigir torna o tempo declarado, e o "aproximado" some." Um toque grava. | Ao lado do fim. | Não aparece na sessão em andamento. |
| As séries por exercício | Cada exercício com nome, a prescrição ("3 × 8-12 · RIR 2", ou "fora do treino") e uma célula por série: "40 × 8" com "RIR 2" embaixo, ou **"não feito"**. Dor e anotação do exercício aparecem embaixo ("dor em ombro · pegada aberta"). | Lista. | "Nenhuma série registrada neste dia. Só a presença." quando não há série. |
| Os não feitos | O que estava prescrito e não tem registro aparece como "não feito", na posição dele, sem cor de alarme. Tocar lança a série, "se você fez". | Na lista, na posição do programa. | Não aparece na sessão em andamento. Em movimento com grandeza própria (metros, segundos…) o "não feito" é só texto. |
| Corrigir uma série no lugar | Toque na série abre ali mesmo: "Série 3 · guardada: 40 × 8", a carga (abre o teclado do app, com vírgula), a **régua de repetições** (o valor guardado marcado como "era"), "RIR: 2 · mudar" e "Apagar esta série". **Cada toque grava** e diz "Gravado às 9h12: 40 × 9. Nada mais na sessão muda." | Abaixo do exercício. | Só para série de repetições (não para grandeza de aula). Uma série aberta por vez. |
| Lançar a série que faltou | Toque num "não feito" abre "Série 2 · não registrada · a carga vem da série de referência" (ou "sem referência"), a carga proposta e a régua sem valor. Um toque na régua lança: "Lançada às 9h12: 40 × 9. Entra no volume e no histórico deste dia." | Abaixo do exercício. | Só fora da sessão em andamento e fora do treino fora da prescrição. |
| Quando o aparelho recusa | A série volta ao que estava guardado; o toque fica marcado como "tocado" na régua e a linha diz "Não foi gravado: o aparelho recusou. A série continua 40 × 8, que é o que está guardado." com **"Tentar de novo"**. | No editor da série. | Só depois de uma gravação recusada. |
| As notas, a lousa e as mudanças | "25 min de pausa, fora da conta."; a foto da lousa da aula (ou "A foto da lousa não está neste aparelho.") com "foto da lousa · 11/10 9h40"; "As 2 mudanças do dia" com o texto de cada uma. | Abaixo da lista. | Cada uma só quando existe. |
| Apagar este treino | Painel de pare com o que vai, o que fica e o que acontece com a sequência. | Último botão. | Recusado com aviso se for o treino em andamento. |
| O treino fora da prescrição | Outra tela: "treino avulso", data, o nome ou os grupos como título, "tempo de treino" e "grupos musculares", os grupos como etiquetas, a nota "Fora do plano. Conta como dia treinado no calendário e na média semanal, mas não tem carga nem série registrada e não move a rotação." e **"Apagar este registro"**. | Mesma tela cheia. | Quando a sessão é fora da prescrição. Não há correção aqui (ver §9). |

**Registrar um treino passado** (tela cheia, título "quarta, 8 de outubro")

| funcionalidade | o que faz | onde fica | quando aparece / some |
|---|---|---|---|
| A pergunta | "Que treino foi na quarta, 08/10?" ("no" sábado/domingo). Em destaque, do tamanho do polegar, **o próximo da sequência naquele dia** (letra, "Treino C", "Superior · 6 exercícios, 20 séries"). Abaixo, "Outro da sequência" com um botão por letra (e "Aula"). À parte, **"Fora da prescrição"** ("presença, grupos trabalhados e duração · não mexe na sequência"). | Toda a tela. | Antes do toque. A procedência diz se o dia "já tem treino B" ou "nada registrado". |
| Um toque grava | Tocar qualquer opção já grava a presença. A tela passa a dizer "Treino C · quarta, 08/10" e "gravado às 21h04 · dias com treino nas últimas 4 semanas: 19, eram 18". | Topo. | Depois do toque. |
| A hora de início (opcional) | "Sem hora" / "Pôr a hora"; o campo aceita "06:15" (os dois-pontos entram sozinhos). A nota diz o efeito: "Começou às 19h30, e entra no horário de início do mês." ou "Sem hora, este treino conta como dia com treino, mas não entra no horário de início do mês. Nenhuma hora é inventada." | Bloco "A hora de início". | Só para treino da sequência. |
| Detalhar exercícios e séries | Abre o modo de sessão (área 03) daquele treino, na data dele, para preencher série a série. | Bloco "As séries". | Só para treino da sequência. |
| O que muda na sequência | "A sequência anda: este é o último registrado, e o próximo passa a ser o D." ou "A sequência não muda: o Treino B de hoje continua sendo o último registrado, e o próximo continua sendo o C." | Rodapé. | Treino da sequência, depois do toque. |
| Fora da prescrição: o que trabalhou | Botões das regiões do corpo: peito, ombro, costas, perna, panturrilha, braço, abdômen. Cada toque liga/desliga e grava. | Bloco "O que trabalhou". | Só no fora da prescrição, depois do toque. |
| Fora da prescrição: quanto tempo | 30 min, 45 min, 60 min, "outro" (abre campo em minutos). Tocar a que já está tira. | Bloco "Quanto tempo". | Idem. |
| Fora da prescrição: um nome | Texto livre ("futevôlei, academia do hotel…"), o único campo com o teclado do sistema. | Bloco "Um nome, se quiser". | Idem. Nota: "Sem séries. Não mexe na sequência — o próximo continua o C — e não entra no horário de início do mês." |

**Outras portas desta área**

- **Correção pelo histórico do exercício** (área 04): o histórico de um exercício mostra as 6 últimas sessões, cada uma corrigível e apagável. É outra porta para os mesmos registros de séries que a sessão passada corrige no lugar (§3.17).
- **"Já fiz alguma coisa hoje"** (folha do tipo do dia, área 06): "Aula" e "Treino fora da prescrição" abrem **este mesmo lançamento**, com a data de **hoje**.
- **O cartão do Agora que pergunta pelo fim** (área 10): abre a sessão passada direto.

---

## 2. Mapa da área

```mermaid
flowchart TD
  E1(["Barra de abas: Dias"])
  E2(["Agora: cartão do fim aproximado, área 10"])
  E3(["Folha do tipo do dia: Já fiz, área 06"])
  M["O mês<br/>células e três leituras"]
  V["O vazio do primeiro mês"]
  A(["Agora, área 10"])
  D["O dia aberto"]
  S["A sessão passada"]
  L["Registrar um treino passado"]
  C["Cardio no lugar<br/>corrigir e apagar"]
  CE["Cardio esquecido"]
  F["Folha Pôr este dia em dia, área 06"]
  MO(["Modo de sessão, área 03"])
  P["Painel de pare"]

  E1 --> M
  M -->|"toque em hoje"| A
  M -->|"toque num dia passado"| D
  M -->|"sem nada registrado"| V
  V -->|"Registrar um treino passado"| L
  D -->|"linha da sessão"| S
  D -->|"Registrar treino ou Outro treino"| L
  D -->|"linha do cardio"| C
  D -->|"Registrar cardio"| CE
  D -->|"Pôr este dia em dia"| F
  C -->|"Apagar este cardio"| P
  S -->|"Apagar este treino ou série"| P
  L -->|"Detalhar exercícios e séries"| MO
  E2 --> S
  E3 --> L
  S -->|"Voltar"| D
  L -->|"Voltar"| D
  D -->|"Voltar"| M

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  class E1,E2,E3,M,V,A,D,S,L,F,MO tela
  class C,CE acao
  class P erro
```

Cada tela cheia empilha sobre a anterior: o mês fica por baixo do dia, e a sessão passada e o lançamento ficam por cima do dia, porque abrem de dentro dele. O Voltar do sistema (e o Esc) fecha uma camada de cada vez e devolve a posição de leitura de onde se entrou (área 01). Quando a sessão passada ou o lançamento são abertos do Agora, da folha "Já fiz" ou do vazio do mês, não há dia por baixo e o Voltar devolve ao lugar de origem.

---

## 3. Fluxos, um por funcionalidade

### 3.1 Navegar no mês e tocar numa célula

```mermaid
flowchart TD
  A1(["Aba Dias"])
  A2["Calcula o mês: do dia 1 ao último"]
  A3{"Para cada dia:<br/>é futuro?"}
  A4["Célula apagada, sem marca, não abre"]
  A5["Junta as sessões do dia pela hora"]
  A6["Letras dos treinos da sequência,<br/>aula vira aula"]
  A7{"Só treino fora da prescrição?"}
  A8["Mostra fora, ou +fora ao lado da letra"]
  A9{"Sem sessão e com marca de descanso?"}
  A10["Mostra desc."]
  A11["Conta os cardios: coração, ou coração 2"]
  A12{"Dia passado?"}
  A13["Barra da comida: com marca ou sem marca"]
  A14["Rótulo falado: segunda, 6 de outubro: treino B, cardio, comida com marca"]
  A15(["Grade desenhada"])
  T1{"Toque na célula"}
  T2(["Agora, área 10"])
  T3(["Dia aberto"])
  N1["Seta anterior ou seguinte"]
  N2{"Passaria do mês corrente?"}
  N3["Recusa sem fazer nada"]
  N4["Troca o mês e redesenha,<br/>sem mexer na rolagem"]

  A1 --> A2 --> A3
  A3 -->|"sim"| A4 --> A15
  A3 -->|"não"| A5 --> A6 --> A7
  A7 -->|"sim"| A8 --> A11
  A7 -->|"não"| A9
  A9 -->|"sim"| A10 --> A11
  A9 -->|"não"| A11
  A11 --> A12
  A12 -->|"sim"| A13 --> A14
  A12 -->|"não, é hoje"| A14
  A14 --> A15
  A15 --> T1
  T1 -->|"hoje"| T2
  T1 -->|"dia passado"| T3
  A15 --> N1 --> N2
  N2 -->|"sim"| N3
  N2 -->|"não"| N4 --> A2

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class A1,A15,T2,T3 tela
  class A2,A4,A5,A6,A8,A10,A11,A13,A14,N1,N4 acao
  class N3 erro
  class A3,A7,A9,A12,T1,N2 decisao
```

O que o diagrama não mostra: **dia sem registro fica sem nada** — o domingo não vira descanso sozinho, e a segunda sem registro não vira treino (é decisão de desenho). A célula de hoje não mostra a barra da comida (hoje ainda está acontecendo). A barra "sem marca" aparece em **todo** dia passado que não tem dia de comida interpretável, inclusive dias de antes de o app ser usado (§9, R16). A marca de descanso só aparece se o dia não tem sessão: se um treino entrar depois num dia marcado, a marca fica escondida, não apagada (§9, R7). A grade começa no domingo. Trocar de mês não sobe a página, de propósito: as setas ficam no meio da tela e quem compara três meses perderia o lugar a cada toque. Sair da aba e voltar devolve sempre o mês corrente.

### 3.2 As três leituras do mês

```mermaid
flowchart TD
  B1(["Mês calculado"])
  B2["Até onde ler: o fim do mês,<br/>ou ontem no mês corrente"]
  B3{"Há dia passado no mês?"}
  B4["Sem leitura de treino nem de horário"]
  B5["Sessões até o dia final"]
  B6{"Alguma sessão?"}
  B7(["Aparece com o primeiro treino"])
  B8{"Já são 28 dias desde o primeiro treino?"}
  B9(["Conta sem média:<br/>3 dias com treino em 9"])
  B10["Dias distintos com treino nos 28 dias,<br/>divididos por 4"]
  B11(["Número, linha da média no mês<br/>e a linha tracejada da prescrição"])
  C1["Cardios do mês até o dia final"]
  C2(["Sessões, minutos no total<br/>e em dia sem musculação"])
  H1["Sessões do mês até o dia final"]
  H2{"Fora da prescrição?"}
  H3["Fica de fora: conta como fora"]
  H4{"Tem hora medida?"}
  H5["Fica de fora: aula sem hora,<br/>ou treino sem hora"]
  H6["Entra: minutos desde a meia-noite"]
  H7{"Algum início?"}
  H8(["Aparece com a primeira sessão que tiver hora"])
  H9(["Mediana, mais cedo, mais tarde,<br/>pontos no eixo e o que ficou de fora"])

  B1 --> B2 --> B3
  B3 -->|"não"| B4 --> B7
  B3 -->|"sim"| B5 --> B6
  B6 -->|"não"| B7
  B6 -->|"sim"| B8
  B8 -->|"não"| B9
  B8 -->|"sim"| B10 --> B11
  B1 --> C1 --> C2
  B1 --> H1 --> H2
  H2 -->|"sim"| H3 --> H7
  H2 -->|"não"| H4
  H4 -->|"não"| H5 --> H7
  H4 -->|"sim"| H6 --> H7
  H7 -->|"não"| H8
  H7 -->|"sim"| H9

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class B1,B7,B9,B11,C2,H8,H9 tela
  class B2,B4,B5,B10,C1,H1,H3,H5,H6 acao
  class B3,B6,B8,H2,H4,H7 decisao
```

O que o diagrama não mostra:
- **Hoje nunca entra** nas leituras do mês corrente: hoje é do Agora. Por isso, no dia 1 do mês, as leituras de treino e de horário mostram o texto de "ainda não há" mesmo com histórico (§9, R4).
- A leitura de **dias com treino** não é do mês de calendário: são os 28 dias que terminam no último dia lido, e podem entrar dias do mês anterior. A unidade é o **dia**, não a sessão: dois treinos no mesmo dia contam um. Aula e treino fora da prescrição contam; descanso não. É média semanal de propósito, **nunca sequência de dias** — quem treina 5 a 6 vezes por semana quebraria a sequência todo domingo (o teste cobra que nenhuma palavra de "sequência"/"streak" apareça).
- A linha da média é desenhada com um ponto por dia do mês até o dia lido (só a partir de dois pontos); a linha tracejada é o número de treinos da sequência do programa ("6 na prescrição"), que vem da área 04. O número aparece em quartos sem casa vazia ("4,75", "4,5", "5").
- O **horário de início** usa a **mediana** (decisão do dono, 14/10): a média de outubro dava 7h56, hora em que ele nunca começou, puxada pelos treinos à tarde. Com número par de inícios, o meio entre os dois do centro. Só entra sessão com hora **medida**: o treino passado lançado sem hora não tem horário, e um 07:00 inventado já sujou esta média uma vez. O eixo vai de 5h a 22h (o que cai fora encosta na ponta) com marcas em 6h, 9h, 12h, 15h, 18h e 21h.
- O cardio "em dia sem musculação" conta o cardio em dia **sem nenhuma sessão** — aula e fora da prescrição também tiram o cardio dessa conta (§9, R20).
- Volume, séries por músculo e força **não** estão aqui de propósito: são leituras de Semana (área 09), e repetir seria dois lugares para o mesmo número.

### 3.3 Abrir um dia

```mermaid
flowchart TD
  D1(["Toque numa célula passada"])
  D2["Guarda a posição de leitura do mês<br/>e abre o dia em tela cheia"]
  D3["Junta sessões e cardios do dia,<br/>pela hora"]
  D4["Para cada sessão: letra, título,<br/>hora ou sem hora, fechou sem você,<br/>séries feitas de prescritas"]
  D5["Para cada cardio: modalidade, minutos,<br/>intensidade, hora ou lançado depois"]
  D6{"Igual a um cardio anterior do dia?"}
  D7["Linha em âmbar: igual ao das 7h35"]
  D8{"Tem sessão?"}
  D9["Sem Foi descanso, com a nota<br/>Este dia tem treino"]
  D10{"Tem marca de descanso?"}
  D11["Linha Descanso com Tirar a marca"]
  D12{"Tem cardio?"}
  D13["Nenhum treino, nenhum descanso<br/>e o palpite pelo padrão semanal"]
  D14["Lê a comida do dia pela folha da área 06"]
  D15(["Dia aberto desenhado"])

  D1 --> D2 --> D3 --> D4 --> D5 --> D6
  D6 -->|"sim"| D7 --> D8
  D6 -->|"não"| D8
  D8 -->|"sim"| D9 --> D14
  D8 -->|"não"| D10
  D10 -->|"sim"| D11 --> D14
  D10 -->|"não"| D12
  D12 -->|"sim"| D14
  D12 -->|"não"| D13 --> D14
  D14 --> D15

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class D1,D9,D11,D13,D15 tela
  class D2,D3,D4,D5,D7 acao
  class D14 dado
  class D6,D8,D10,D12 decisao
```

O que o diagrama não mostra: o app **aponta e não corrige** — dois cardios iguais ficam lado a lado, o segundo em âmbar, e nada sai sem ele pedir. "fechou sem você" aparece quando a sessão tem duração e o fim não foi declarado. "14 de 22 séries" conta as séries registradas da sessão contra as séries do treino **como ele está hoje no programa** (§9, R3). "depois do treino" aparece quando o cardio tem hora e alguma sessão da sequência com hora começou antes dele. O palpite diz o tipo do dia pelo padrão semanal guardado (domingo descanso e o resto treino, se ele nunca mudou; a cadência é da área 06) e sempre se diz palpite. Um dia com só cardio mostra a procedência "nada registrado" (§9, R15). Dois treinos no mesmo dia aparecem os dois, e cada linha abre a sua sessão — o app não escolhe por ele.

### 3.4 Corrigir e apagar um cardio do dia

```mermaid
flowchart TD
  K1(["Dia aberto: linha do cardio"])
  K2["Toque abre o registro no lugar<br/>e fecha o outro aberto"]
  K3["Modalidade, Minutos e Intensidade<br/>como botões, o atual aceso"]
  K4["Toque num botão"]
  K5{"Valor aceito?<br/>modalidade conhecida, leve ou moderado,<br/>1 a 300 min"}
  K6["Nada muda"]
  K7["Troca o campo e carimba a correção"]
  K8["Grava no aparelho"]
  K9(["Linha redesenhada com o novo valor"])
  K10["Apagar este cardio"]
  K11["Pare: o que vai, o que fica no dia,<br/>se o treino muda, e o cardio do mês<br/>de antes e de depois"]
  K12{"Confirma?"}
  K13(["Deixar como está: nada muda"])
  K14["Lápide do cardio e tira da lista"]
  K15["Grava no aparelho"]
  K16(["Aviso: Sessão removida."])

  K1 --> K2 --> K3 --> K4 --> K5
  K5 -->|"não"| K6
  K5 -->|"sim"| K7 --> K8 --> K9
  K3 --> K10 --> K11 --> K12
  K12 -->|"não"| K13
  K12 -->|"sim"| K14 --> K15 --> K16

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class K1,K3,K9,K13,K16 tela
  class K2,K4,K7,K10 acao
  class K8,K14,K15 dado
  class K6,K11 erro
  class K5,K12 decisao
```

O que o diagrama não mostra: o **instante do cardio não muda** ao corrigir — é a chave dele entre aparelhos. Os minutos oferecem 20, 25, 30 e 40, e mais o valor atual se for outro (um cardio de 35 min mostra 20, 25, 30, 35, 40). O texto do pare é inteiro, por exemplo: "Apagar o cardio de qua 08/10 tira 1 sessão de cardio: 25 min de bike, moderado. Fica o cardio das 7h35, igual a este. O treino do dia não muda. O cardio de outubro passa de 3 para 2 sessões e de 75 para 50 min. Isso não tem volta." — a conta do mês nesse texto inclui o mês inteiro, e a leitura da tela vai só até ontem (§9, R5). O mesmo apagar serve ao cardio de hoje no Agora (área 10). Se a gravação falhar, a mudança fica na memória e o aviso geral de que uma gravação falhou aparece (área 01); esta tela não diz nada próprio. Não há desfazer depois do pare.

### 3.5 O cardio esquecido (registrar cardio num dia passado)

```mermaid
flowchart TD
  G1(["Dia aberto de um dia passado"])
  G2["Registrar cardio"]
  G3["Abre no lugar: bike, 25 min, moderado"]
  G4["Toques mudam modalidade,<br/>minutos e intensidade"]
  G5["Gravar o cardio neste dia"]
  G6{"O dia é hoje ou futuro?"}
  G7["Recusa: hoje é pelo Agora"]
  G8["Instante: meio-dia daquele dia"]
  G9{"Já existe cardio nesse instante?"}
  G10["Anda 1 milésimo de segundo"]
  G11["Cria o cardio sem hora,<br/>põe na ordem e corta em 200"]
  G12["Grava no aparelho"]
  G13{"Gravou?"}
  G14["Tira o cardio da memória"]
  G15(["Mensagem: O cardio não foi gravado.<br/>O dia continua como estava."])
  G16(["Fecha o formulário. Aviso:<br/>25 min de bike registrados em 08/10."])

  G1 --> G2 --> G3 --> G4 --> G5 --> G6
  G6 -->|"sim"| G7
  G6 -->|"não"| G8 --> G9
  G9 -->|"sim"| G10 --> G9
  G9 -->|"não"| G11 --> G12 --> G13
  G13 -->|"não"| G14 --> G15
  G13 -->|"sim"| G16

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class G1,G3,G15,G16 tela
  class G2,G4,G5,G8,G10 acao
  class G11,G12,G14 dado
  class G7 erro
  class G6,G9,G13 decisao
```

O que o diagrama não mostra: decisão do dono, 14/10. O meio-dia serve para a semana e o mês contarem o cardio no dia em que aconteceu; a hora **não foi medida**, então o cardio leva a marca "sem hora" e nenhuma tela mostra "12h00" — o dia diz "lançado depois, sem hora". Dois cardios esquecidos no mesmo dia não colidem (o segundo anda um milésimo) e o segundo diz "igual a outro deste dia". Fechar o formulário ("Fechar o cardio") ou abrir outro dia descarta a escolha, sem gravar. Só existem 20, 25, 30 e 40 min aqui; outro valor só depois, corrigindo. O teto de 200 cardios guarda os 200 mais recentes pela data: um cardio esquecido mais antigo que todos os 200 entra e sai no mesmo passo, com o aviso de sucesso (§9, R8). Hoje e o futuro não têm o botão.

### 3.6 A marca de descanso

```mermaid
flowchart TD
  R1(["Dia aberto"])
  R2{"O dia tem sessão?"}
  R3(["Sem o botão. Nota: Este dia tem treino,<br/>então não aceita a marca de descanso."])
  R4{"Já está marcado?"}
  R5["Foi descanso"]
  R6["Guarda o dia com o instante da marca"]
  R7["Grava no aparelho"]
  R8(["Linha Descanso: marcado hoje, às 21h22.<br/>Aviso: Dia marcado como descanso."])
  R9["Tirar a marca"]
  R10["Tira a marca e põe lápide da data"]
  R11["Grava no aparelho"]
  R12(["Volta ao dia vazio com o palpite.<br/>Aviso: Marca de descanso removida."])
  R13["Pedido por outro caminho<br/>num dia com treino"]
  R14(["Aviso: Este dia tem treino registrado.<br/>Nada muda"])

  R1 --> R2
  R2 -->|"sim"| R3
  R2 -->|"não"| R4
  R4 -->|"não"| R5 --> R6 --> R7 --> R8
  R4 -->|"sim"| R9 --> R10 --> R11 --> R12
  R13 --> R14

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class R1,R3,R8,R12 tela
  class R5,R9,R13 acao
  class R6,R7,R10,R11 dado
  class R14 erro
  class R2,R4 decisao
```

O que o diagrama não mostra: a regra é que **o fato vence** — se há treino registrado, o dia já respondeu, e as duas marcas juntas seriam o app afirmando duas coisas contrárias. Tirar a marca não passa por pare (é reversível com um toque). A marca é **só histórico**: não muda o tipo do dia da comida, a cadência, os 14 dias nem nenhuma conta ("não conta como treino em nenhuma conta"); nenhuma outra área a lê. Marcar ou desmarcar leva a página ao topo (§9, R6). Se a gravação falhar, a marca fica na memória, o aviso de sucesso aparece mesmo assim, e o aviso geral de gravação falhada (área 01) é quem diz. Entre aparelhos, desmarcar viaja como lápide e não é desfeito pelo outro aparelho que ainda tinha a marca (teste "dia marcado como descanso viaja e some quando desmarcado"). Marcas antigas sem instante (valor 1) aparecem sem o "marcado em…".

### 3.7 A comida do dia (ligação com a área 06)

```mermaid
flowchart TD
  F1(["Dia aberto de um dia passado"])
  F2["Pede à área 06 a leitura daquele dia<br/>como a folha Pôr este dia em dia veria"]
  F3["Cada momento do plano: a forma da marca,<br/>sugestão e vazio viram sem marca"]
  F4["Conta quantos têm marca"]
  F5["Água: N copos, ou não contei"]
  F6{"O dia é interpretável?"}
  F7["Conta para a regra dos 14 dias"]
  F8["Sem marca, o dia não conta para a regra:<br/>é desconhecido, não zero"]
  F9(["Seção a comida do dia,<br/>com de que plano é a referência"])
  F10["Pôr este dia em dia"]
  F11(["Folha da área 06"])

  F1 --> F2 --> F3 --> F4 --> F5 --> F6
  F6 -->|"sim"| F7 --> F9
  F6 -->|"não"| F8 --> F9
  F9 --> F10 --> F11

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class F1,F9,F11 tela
  class F3,F4,F5,F7,F8,F10 acao
  class F2 dado
  class F6 decisao
```

O que o diagrama não mostra: o dia mostra **a verdade do registro, nunca a sugestão da folha** — um momento que a folha pré-marcaria como sugestão aparece "sem marca". A frase do plano é "Plano de dia de treino, … É referência — o plano mora em Prescrição." O comportamento da folha, das marcas, do "dia interpretável" e da regra dos 14 dias é da área 06; a célula do mês usa o mesmo "interpretável" para a barra.

### 3.8 Abrir uma sessão passada

```mermaid
flowchart TD
  S1(["Linha da sessão no dia,<br/>ou cartão do Agora"])
  S2["Acha a sessão pelo instante<br/>e abre em tela cheia"]
  S3{"Fora da prescrição?"}
  S4(["Treino avulso: tempo, grupos,<br/>a nota e Apagar este registro"])
  S5{"É a sessão em andamento?"}
  S6["Sem fim, sem Corrigir, sem não feitos"]
  S7["Começo: hora, ou sem hora.<br/>Fim: declarado ou aproximado, com a duração"]
  S8["Junta as séries da sessão<br/>de cada exercício pela identidade dela"]
  S9["Ordena pela posição no treino de hoje no programa;<br/>o que não está nele vai para o fim"]
  S10["Cada série: carga por repetições e RIR,<br/>ou não feito"]
  S11["Exercício do treino sem registro:<br/>não feito em todas as séries, na posição dele"]
  S12["Notas: pausa, dor e anotação,<br/>lousa da aula, mudanças do dia"]
  S13{"Foto da lousa neste aparelho?"}
  S14["Busca no cache e redesenha quando chegar"]
  S15(["Sessão passada desenhada"])

  S1 --> S2 --> S3
  S3 -->|"sim"| S4
  S3 -->|"não"| S5
  S5 -->|"sim"| S6 --> S8
  S5 -->|"não"| S7 --> S8
  S8 --> S9 --> S10 --> S11 --> S12 --> S13
  S13 -->|"não"| S14 --> S15
  S13 -->|"sim"| S15

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class S1,S4,S15 tela
  class S2,S6,S7,S9,S10,S11,S12 acao
  class S8,S14 dado
  class S3,S5,S13 decisao
```

O que o diagrama não mostra: a sessão abre **como foi** — o começo e o fim, cada série na ordem em que aconteceu, com o RIR quando houve. "Não feito" **não é falha nem pendência**: não tem cor de alarme. Registros antigos sem identidade de sessão entram pela data e pelo treino. A duração descontada as pausas aparece no fim ("1h09"); o fim é o começo mais a duração mais as pausas. Saíram daqui, pelo desenho: a grade de tempo, volume e recordes, e a variação de cada exercício contra a vez anterior (são leitura de Semana e do histórico do exercício) — o app ainda os calcula e não os mostra (§9, R14) — e o cardio do dia (mora no dia aberto). A nota da aula (o quadro colado) não aparece aqui (§9, R13). Se a foto da lousa não está neste aparelho e também não vem do cache, a linha diz "A foto da lousa não está neste aparelho."

### 3.9 Corrigir o tempo da sessão passada

```mermaid
flowchart TD
  T1(["Sessão passada: Fim 7h31 aproximado"])
  T2["Corrigir"]
  T3["Abre 30, 45, 60, 75, 90 min,<br/>aceso o que bate com a duração"]
  T4["Toque numa duração"]
  T5["Duração entre 1 e 600 min,<br/>fim declarado, carimba a correção"]
  T6["Grava no aparelho"]
  T7(["Fim declarado por você.<br/>Aviso: Tempo corrigido."])
  T8["Corrigir de novo fecha a escolha"]

  T1 --> T2 --> T3 --> T4 --> T5 --> T6 --> T7
  T3 --> T8 --> T1

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  class T1,T3,T7 tela
  class T2,T4,T8 acao
  class T5,T6 dado
```

O que o diagrama não mostra: o caso é esquecer de encerrar — o app fecha sozinho e o tempo vai até a última série (área 03). Corrigir torna o tempo **declarado**, e o "aproximado" some. A outra metade da resposta, **"Está certo"** (tornar declarado sem mudar o número), mora no cartão do Agora (área 10) e usa a mesma marca de "declarado". Na sessão em andamento não há correção: o tempo ainda está correndo. Só cinco durações são oferecidas (§9, R10). Não há correção da **hora de início** aqui (§9, R9). Corrigir também vale para treino passado sem duração ("não medido").

### 3.10 Corrigir uma série no lugar

```mermaid
flowchart TD
  Q1(["Sessão passada: série 40 x 8"])
  Q2["Toque na série"]
  Q3{"Série de repetições?"}
  Q4["Célula desligada: grandeza da aula<br/>não se corrige aqui"]
  Q5["Abre o editor: guardada 40 x 8,<br/>carga, régua com o 8 como era, RIR"]
  Q6{"O que ele toca?"}
  Q7["Uma repetição na régua, 0 a 200"]
  Q8["Setas da régua: só andam a página"]
  Q9["Carga: teclado do app com vírgula,<br/>cada tecla que forma número grava"]
  Q10["RIR: 0 a 4 ou nenhum;<br/>o mesmo de novo tira"]
  Q11["Escreve na série e carimba o registro"]
  Q12["Grava no aparelho"]
  Q13{"Gravou?"}
  Q14(["Gravado às 9h12: 40 x 9.<br/>Nada mais na sessão muda."])
  Q15["A série volta ao que está guardado;<br/>o toque fica marcado como tocado"]
  Q16(["Não foi gravado: o aparelho recusou.<br/>A série continua 40 x 8. Tentar de novo"])
  Q17["Tocar a mesma série fecha o editor"]

  Q1 --> Q2 --> Q3
  Q3 -->|"não"| Q4
  Q3 -->|"sim"| Q5 --> Q6
  Q6 -->|"repetição"| Q7 --> Q11
  Q6 -->|"setas"| Q8 --> Q5
  Q6 -->|"carga"| Q9 --> Q11
  Q6 -->|"RIR"| Q10 --> Q11
  Q11 --> Q12 --> Q13
  Q13 -->|"sim"| Q14
  Q13 -->|"não"| Q15 --> Q16
  Q16 -->|"Tentar de novo"| Q7
  Q5 --> Q17

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class Q1,Q5,Q14 tela
  class Q2,Q7,Q8,Q9,Q10,Q17 acao
  class Q11,Q12,Q15 dado
  class Q4,Q16 erro
  class Q3,Q6,Q13 decisao
```

O que o diagrama não mostra: a régua é **a mesma da academia** (área 03), porque o dado é o mesmo; abre na vizinhança do valor guardado, com a faixa do treinador ("repetições · faixa 8-12"). **Cada toque grava** (decisão de desenho), e a tela nunca finge que gravou: na recusa, o número guardado continua o da tela e o valor tocado fica à parte, marcado como "tocado". O registro é achado **pela identidade da sincronia** (exercício, sessão e posição), não pela posição na lista — a lista do exercício pode ganhar uma entrada vinda do outro aparelho entre abrir e gravar (há teste). O teclado escreve a cada tecla: "42," não grava (é digitação no meio), "42,5" grava; carga zero ou vazia não grava (§9, R11). "Tentar de novo" repete a repetição tocada — depois de uma falha de RIR ou de carga, ele grava **0 repetições** (§9, R2). Abrir a carga fecha o RIR e vice-versa. Só uma série aberta por vez em toda a sessão.

### 3.11 Lançar a série que não foi registrada

```mermaid
flowchart TD
  N1(["Sessão passada: não feito"])
  N2{"Sessão fora da prescrição,<br/>ou movimento com grandeza própria?"}
  N3["Só texto, não abre"]
  N4["Procura a referência: a série anterior do mesmo registro,<br/>ou a mesma posição na última vez antes deste dia"]
  N5["Editor: não registrada, carga proposta,<br/>régua sem valor, marca última se houver referência"]
  N6["Pode trocar a carga pelo teclado:<br/>fica proposta, não grava"]
  N7["Toque numa repetição"]
  N8{"O exercício já tem registro nesta sessão?"}
  N9["Cria o registro no instante da sessão,<br/>entre os outros pela ordem do tempo"]
  N10["Põe a série na posição dela;<br/>as anteriores vazias continuam não feitas"]
  N11["Grava no aparelho"]
  N12{"Gravou?"}
  N13["Desfaz: tira o registro novo,<br/>ou volta as séries de antes"]
  N14(["Não foi gravado: o aparelho recusou.<br/>A série continua não feita."])
  N15(["Lançada às 9h12: 40 x 9.<br/>Entra no volume e no histórico deste dia."])
  N16["O editor passa a ser o de correção"]

  N1 --> N2
  N2 -->|"sim"| N3
  N2 -->|"não"| N4 --> N5
  N5 --> N6 --> N5
  N5 --> N7 --> N8
  N8 -->|"não"| N9 --> N10
  N8 -->|"sim"| N10
  N10 --> N11 --> N12
  N12 -->|"não"| N13 --> N14
  N12 -->|"sim"| N15 --> N16

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class N1,N5,N14,N15 tela
  class N4,N6,N7,N16 acao
  class N9,N10,N11,N13 dado
  class N3 erro
  class N2,N8,N12 decisao
```

O que o diagrama não mostra: o registro novo entra **na ordem do tempo** e não no fim da lista, porque o fim é a "última vez" que a próxima sessão usa como referência — uma entrada antiga no fim viraria a referência de amanhã. Sem referência nenhuma, a régua abre na base da faixa do treinador (ou em 10), a carga proposta é 0 e o editor diz "sem referência". Lançar a série 3 com a 2 vazia deixa a 2 "não feita" (há teste). Na série não registrada não há RIR nem apagar: só depois de lançada.

### 3.12 Apagar uma série, apagar o treino

```mermaid
flowchart TD
  X1(["Editor da série: Apagar esta série"])
  X2["Pare: Apagar a série 3 de Supino de 08/10<br/>tira 40 x 8 do histórico. As outras 2 séries ficam."]
  X3{"Confirma?"}
  X4(["Nada muda"])
  X5{"Era a única série do exercício?"}
  X6["Lápide do registro e tira o exercício da sessão"]
  X7["A série vira não feita na posição dela;<br/>carimba o registro"]
  X8["Grava. Aviso: Série apagada."]
  Y1(["Apagar este treino ou este registro"])
  Y2{"É o treino em andamento?"}
  Y3(["Aviso: Este treino está em andamento.<br/>Encerre ou descarte pelo ··· do treino."])
  Y4["Pare: o que vai, com as séries;<br/>o que fica no dia; o que acontece com a sequência"]
  Y5{"Confirma?"}
  Y6["Lápide da presença e de cada registro de série"]
  Y7["Tira a presença e as séries dela"]
  Y8(["Volta ao dia. Aviso: Treino e séries apagados,<br/>ou Registro apagado."])

  X1 --> X2 --> X3
  X3 -->|"não"| X4
  X3 -->|"sim"| X5
  X5 -->|"sim"| X6 --> X8
  X5 -->|"não"| X7 --> X8
  Y1 --> Y2
  Y2 -->|"sim"| Y3
  Y2 -->|"não"| Y4 --> Y5
  Y5 -->|"não"| X4
  Y5 -->|"sim"| Y6 --> Y7 --> Y8

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class X1,X4,Y1,Y8 tela
  class X7 acao
  class X6,X8,Y6,Y7 dado
  class X2,Y3,Y4 erro
  class X3,X5,Y2,Y5 decisao
```

O que o diagrama não mostra: todo apagar passa pelo pare (decisão de desenho), e o pare diz **o que fica**, com número, para ele conferir que está apagando o de cima e não o de baixo. O texto do treino é inteiro, por exemplo: "Apagar o Treino B de quarta, 08/10 tira 1 sessão, aberta às 6h22, com 14 séries. Fica a aula das 9h00, com 8 séries. A sequência volta um passo: o último registrado passa a ser o Treino A de 07/10. Isso não tem volta, e vale para os outros aparelhos." As variantes da sequência: "A sequência não muda: treino fora da prescrição não conta nela."; "A sequência não muda: o último registrado continua sendo…"; "…não sobra treino registrado, e o próximo volta a ser o primeiro." A **presença e as séries vão juntas**: apagar só a presença deixaria séries órfãs contando volume e puxando progressão. As lápides impedem que o outro aparelho traga de volta (área 02). As fotos da lousa daquela aula não são apagadas do aparelho (área 05). Não há desfazer.

### 3.13 Registrar um treino passado: o toque que grava

```mermaid
flowchart TD
  L1(["Registrar treino, Outro treino,<br/>Registrar um treino passado, ou Já fiz"])
  L2["Abre o lançamento com a data do dia<br/>e a hora neutra das 7h, que nunca aparece"]
  L3["Calcula o previsto: o próximo da sequência<br/>contando só o que veio antes daquele dia, área 04"]
  L4(["Que treino foi na quarta, 08/10?<br/>previsto, outros da sequência, Fora da prescrição"])
  L5["Toque numa opção"]
  L6{"Letra da sequência,<br/>ou fora da prescrição?"}
  L7["Recusa: nada gravado, a tela continua"]
  L8["Anota os dias com treino nas últimas 4 semanas, antes"]
  L9["Acha um instante livre: um minuto adiante<br/>enquanto outro treino ocupar"]
  L10["Cria a presença: treino passado,<br/>a letra e o deload se ativo,<br/>ou fora da prescrição sem grupos"]
  L11["Põe em ordem de data e grava no aparelho"]
  L12{"Fora da prescrição?"}
  L13(["Tela do fora da prescrição, 3.15"])
  L14(["Tela do treino da sequência, 3.14"])
  L15["Voltar antes do toque"]
  L16(["Sai sem gravar nada"])

  L1 --> L2 --> L3 --> L4 --> L5 --> L6
  L6 -->|"nenhum dos dois"| L7 --> L4
  L6 -->|"válido"| L8 --> L9 --> L10 --> L11 --> L12
  L12 -->|"sim"| L13
  L12 -->|"não"| L14
  L4 --> L15 --> L16

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class L1,L4,L13,L14,L16 tela
  class L2,L3,L5,L8,L9,L15 acao
  class L10,L11 dado
  class L7 erro
  class L6,L12 decisao
```

O que o diagrama não mostra: a folha pergunta **uma coisa só** — que treino foi — e o toque **já é o registro** (decisão 1: cada toque grava); hora, séries, grupos e duração vêm depois, se ele quiser, e cada um corrige o registro que já existe. A data é a do dia de onde abriu (o mês escolhe o dia); não há escolha de data aqui. "Foi descanso" não mora nesta folha: mora no próprio dia, com o mesmo peso de "Registrar treino" (e o verbo recusa "descanso" como letra; há teste). O previsto é calculado "naquele dia", não hoje: lançar a quarta passada propõe o que vinha depois do último treino antes da quarta (há teste). Dois treinos sem hora no mesmo dia não colidem: o segundo anda um minuto (o instante é a identidade do registro entre aparelhos). Pela porta "Já fiz" (área 06) a data é hoje, e o lançamento é o mesmo. Se a gravação falhar, a presença fica na memória e o aviso geral de gravação (área 01) aparece; esta tela não tem frase própria de falha.

### 3.14 Depois do toque: a hora, as séries e a sequência

```mermaid
flowchart TD
  H1(["Treino C · quarta, 08/10<br/>gravado às 21h04 e o que mudou"])
  H2{"O que ele faz?"}
  H3["Pôr a hora: abre o campo"]
  H4["Digita: só dígitos, os dois-pontos<br/>entram sozinhos depois do segundo dígito"]
  H5{"Campo vazio?"}
  H6["Volta à hora neutra e tira a marca de hora;<br/>fecha o campo"]
  H7{"Hora válida, até 23:59?"}
  H8["Não grava nada ainda"]
  H9["Põe a hora no dia, num instante livre,<br/>marca hora medida e carimba"]
  H10["Grava no aparelho"]
  H11(["Começou às 19h30,<br/>e entra no horário de início do mês"])
  H12["Sem hora"]
  H13["Detalhar exercícios e séries"]
  H14{"Há sessão aberta hoje?"}
  H15["Encerra a de hoje com o fim no toque"]
  H16["Abre a sessão do treino passado na data dele<br/>e entra no modo de sessão, área 03"]
  H17(["Aviso: Preenchendo o treino de 08/10.<br/>Some sozinho quando você sair."])
  H18["Voltar"]
  H19(["Grava o que faltar e volta ao dia"])

  H1 --> H2
  H2 -->|"Pôr a hora"| H3 --> H4 --> H5
  H5 -->|"sim"| H6 --> H10
  H5 -->|"não"| H7
  H7 -->|"não"| H8 --> H4
  H7 -->|"sim"| H9 --> H10 --> H11
  H2 -->|"Sem hora"| H12 --> H6
  H2 -->|"Detalhar"| H13 --> H14
  H14 -->|"sim"| H15 --> H16
  H14 -->|"não"| H16
  H16 --> H17
  H2 -->|"Voltar"| H18 --> H19

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class H1,H11,H17,H19 tela
  class H3,H4,H8,H12,H13,H18 acao
  class H6,H9,H10,H15,H16 dado
  class H2,H5,H7,H14 decisao
```

O que o diagrama não mostra:
- **Nenhuma hora é inventada** (F270): sem hora, o treino conta como dia com treino e não entra no horário de início. A hora neutra das 7h só ordena e nunca é mostrada ("sem hora" no dia, nada de "7h00 fantasma"; há teste).
- A frase do que mudou só aparece quando o número das últimas 4 semanas mudou ("dias com treino nas últimas 4 semanas: 19, eram 18"); um treino lançado num dia que já tinha treino, ou há mais de 28 dias, ou hoje, não muda o número.
- "A sequência anda" quando este registro é o último treino da sequência registrado; senão "A sequência não muda" e diz qual continua o último. A regra é da área 04.
- **Detalhar** abre o modo de sessão (área 03) com uma sessão de treino passado: as séries entram na data dele, não hoje; o Agora e o modo mostram o aviso âmbar "preenchendo treino passado · As séries que você digitar entram em quarta, 08 de outubro, não em hoje." com **"Concluir"**. Concluir fecha a sessão sem inventar duração ("Treino de 08/10 concluído."). Sem Concluir, ela fecha sozinha depois de 90 minutos sem toque ou na virada do dia de uso, e o que foi preenchido fica. Só pode existir uma sessão aberta: a de hoje é encerrada antes, com o tempo gravado (há teste), e o aviso diz "Treino A de hoje encerrado. Agora preenchendo 08/10."
- Aberto a partir do dia aberto, o "Detalhar" deixa o dia por cima do modo de sessão (provável bug, §9, R1).
- A hora só se corrige aqui, logo depois do toque: a sessão passada não oferece correção da hora de início (§9, R9). Uma hora já ocupada por outro treino anda um minuto em silêncio.

### 3.15 Fora da prescrição: grupos, duração e nome

```mermaid
flowchart TD
  O1(["Treino fora da prescrição · 08/10<br/>gravado às 21h04 · conta como dia com treino"])
  O2{"O que ele toca?"}
  O3["Uma região do corpo"]
  O4["Liga ou desliga a região"]
  O5["30, 45 ou 60 min"]
  O6{"Já era essa?"}
  O7["Tira a duração"]
  O8["Põe a duração"]
  O9["outro: abre o campo em minutos"]
  O10["Ao sair do campo: 1 a 600 min,<br/>vazio ou zero tira"]
  O11["Carimba e grava no aparelho"]
  O12["Um nome: anota a cada tecla"]
  O13["Ao sair do campo, ou ao Voltar: grava"]
  O14(["Tela atualizada"])

  O1 --> O2
  O2 -->|"região"| O3 --> O4 --> O11
  O2 -->|"duração"| O5 --> O6
  O6 -->|"sim"| O7 --> O11
  O6 -->|"não"| O8 --> O11
  O2 -->|"outro"| O9 --> O10 --> O11
  O2 -->|"nome"| O12 --> O13
  O11 --> O14
  O13 --> O14

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class O1,O14 tela
  class O3,O4,O5,O7,O8,O9,O10,O12 acao
  class O11,O13 dado
  class O2,O6 decisao
```

O que o diagrama não mostra: as regiões são as do corpo que o produto já conhece (peito, ombro, costas, perna, panturrilha, braço, abdômen) e **não** os músculos finos do plano — de um treino fora dele ninguém sabe o "delt lateral". O fora da prescrição é **presença**: sem séries, não mexe na sequência, não entra na conta das 48 sessões do bloco e não entra no horário de início; conta como dia com treino na média e no calendário. Depois que a folha fecha, nada disso se corrige: a tela da sessão só oferece "Apagar este registro" (§9, R9).

### 3.16 O vazio do primeiro mês

```mermaid
flowchart TD
  V1(["Aba Dias"])
  V2{"Existe algum treino, algum cardio<br/>ou algum dia de comida com marca?"}
  V3(["Grade normal e as três leituras"])
  V4(["Ainda não há dias para ler,<br/>a explicação e Registrar um treino passado"])
  V5["Registrar um treino passado"]
  V6(["Lançamento com a data de ontem, 3.13"])

  V1 --> V2
  V2 -->|"sim"| V3
  V2 -->|"não"| V4 --> V5 --> V6

  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  class V1,V3,V4,V6 tela
  class V5 acao
  class V2 decisao
```

O que o diagrama não mostra: no vazio, **nada vira zero** — cada leitura diz quando aparece em vez de mostrar 0. A única oferta é a que o primeiro dia pede, e ela abre sempre ontem; para outra data, ele toca no dia na grade. Um descanso marcado sozinho não tira do vazio (não entra na pergunta).

### 3.17 A correção pelo histórico do exercício (ligação com a área 04)

O histórico de um exercício (área 04, §3.19 de lá) mostra as últimas 6 sessões e corrige uma delas inteira num formulário: carga e repetições de cada série, as dores e a observação, com "Salvar correção" (recusa deixar sem série: "Uma sessão sem nenhuma série. Use apagar se foi engano.") e "Apagar esta sessão" (pare "Apagar o registro de DD/MM tira N séries do histórico de X. Isso não tem volta."). É **o mesmo dado** que a sessão passada corrige no lugar — o registro daquele exercício naquela sessão —, com o mesmo carimbo e a mesma lápide. As diferenças: o histórico corrige por formulário e alcança só 6 sessões; a sessão passada corrige série a série, sem limite de data, e lança o que não foi registrado. Apagar pelo histórico tira só o exercício daquele dia; a presença continua (e o dia continua com treino). O fluxo completo está na área 04.

---

## 4. Estados da tela

**O mês**

| estado | quando acontece | o que a tela mostra |
|---|---|---|
| Vazio do primeiro mês | Nenhum treino, nenhum cardio, nenhum dia de comida com marca. | "Ainda não há dias para ler", a explicação, "Registrar um treino passado"; as leituras com o texto de quando aparecem. |
| Mês corrente | Mês de hoje. | Título "· até ontem, DD/MM"; "›" desligada; leituras até ontem; hoje com destaque, abre o Agora; futuro apagado. |
| Dia 1 do mês corrente | Ainda não há dia passado no mês. | Título sem "até ontem"; leituras de treino e horário com o texto de "ainda não há"; cardio "Nenhum cardio registrado." |
| Mês passado | Depois de "‹". | Título só com mês e ano; leituras até o último dia do mês; "›" ligada. |
| Menos de 4 semanas de histórico | Primeiro treino há menos de 28 dias do dia lido. | "3 dias com treino em 9. A média usa as últimas 4 semanas, e ainda não há 4." sem número grande nem linha. |
| Com média | 28 dias ou mais. | Número em quartos, linha da média com a da prescrição tracejada, a conta. |
| Sem cardio no mês | — | "Nenhum cardio registrado." |
| Sem sessão com hora | Só treinos sem hora, fora da prescrição, ou nenhum. | "Aparece com a primeira sessão que tiver hora." |
| Célula com dois treinos | Dois registros da sequência no dia. | "B D". |
| Célula com treino e fora | — | "B" e "+fora". |
| Célula com descanso | Marca e nenhuma sessão. | "desc." com o estilo do descanso. |

**O dia aberto**

| estado | quando acontece | o que a tela mostra |
|---|---|---|
| Dia de treino | Uma ou mais sessões. | Procedência "dia de treino, pela sessão registrada"; linhas das sessões; "Outro treino"; a nota de que não aceita descanso. |
| Dia de descanso | Marca e nenhuma sessão. | "descanso, marcado por você"; linha Descanso com "Tirar a marca"; "Registrar treino". |
| Dia vazio | Nada. | "nada registrado"; "Nenhum treino, nenhum descanso" e o palpite; "Registrar treino", "Foi descanso", "Registrar cardio". |
| Dia só com cardio | Cardio e nada mais. | "nada registrado" na procedência; a linha do cardio; sem o vazio. |
| Cardio aberto | Toque na linha. | Os três grupos de botões e "Apagar este cardio". |
| Cardio igual | Segundo cardio com mesma modalidade, minutos e intensidade. | Linha em âmbar com "igual ao das 7h35". |
| Cardio esquecido aberto | "Registrar cardio". | Os botões, "Gravar o cardio neste dia", a nota "Entra sem hora…"; botão vira "Fechar o cardio". |
| Cardio esquecido recusado | O aparelho recusou a gravação. | "O cardio não foi gravado: o armazenamento deste aparelho recusou. O dia continua como estava." |
| Comida do dia | Dia passado. | Os momentos com as formas, "N de M com marca" ou "nenhuma com marca", água, a regra, o plano de referência, "Pôr este dia em dia". |

**A sessão passada**

| estado | quando acontece | o que a tela mostra |
|---|---|---|
| Fim declarado | Encerrada no toque, ou já corrigida/confirmada. | "Fim 7h31 · declarado por você · 1h09". |
| Fim aproximado | O app fechou sozinho. | Fim em estilo de aproximado, "aproximado: fechou sem você, na última série · 1h09", "Corrigir". |
| Sem hora de início | Treino passado lançado sem hora. | "Começo sem hora · registrado depois, sem a hora de início"; fim com a duração ou "não medido · a duração não foi medida". |
| Em andamento | A sessão aberta agora. | Só o começo; sem Corrigir; sem os não feitos; apagar recusado. |
| Corrigindo o tempo | "Corrigir". | Botões 30 a 90 min e a nota "Hoje está…". |
| Sem séries | Presença sem registro de série. | "Nenhuma série registrada neste dia. Só a presença." e os não feitos do programa. |
| Série aberta | Toque numa série. | Editor com guardada, carga, faixa, régua, RIR, apagar. |
| Gravado | Toque gravou. | "Gravado às 9h12: 40 × 9. Nada mais na sessão muda." |
| Não feito aberto | Toque num não feito. | "não registrada · a carga vem da série de referência" ou "sem referência", régua sem valor, "um toque lança". |
| Lançado | Toque na régua do não feito gravou. | "Lançada às 9h12: 40 × 9. Entra no volume e no histórico deste dia." |
| Recusado | O aparelho recusou. | "tocado" na régua, "Não foi gravado: o aparelho recusou…", "Tentar de novo". |
| Teclado da carga | Toque na carga. | Teclado do app com vírgula, por baixo do cabeçalho do editor. |
| Lousa sem bytes | Foto da lousa de outro aparelho. | "A foto da lousa não está neste aparelho." |
| Treino avulso | Fora da prescrição. | Tempo, grupos, nota "Fora do plano…", "Apagar este registro". |

**Registrar um treino passado**

| estado | quando acontece | o que a tela mostra |
|---|---|---|
| Antes do toque | Ao abrir. | A pergunta, o previsto, "Outro da sequência", "Fora da prescrição", "Um toque grava a presença…"; procedência "já tem treino B" ou "nada registrado". |
| Treino da sequência gravado, sem hora | Depois do toque. | "gravado às…", "Sem hora" aceso, "Sem hora, este treino conta como dia com treino…", "Detalhar…", a frase da sequência. |
| Com hora | Hora válida digitada. | "Pôr a hora" aceso, o campo com "19:30", "Começou às 19h30, e entra no horário de início do mês." |
| Fora da prescrição gravado | Depois do toque em "Fora da prescrição". | Regiões, durações, nome, a nota de que não mexe na sequência. |
| Duração "outro" | Toque em "outro", ou duração fora de 30/45/60. | "outro" aceso e o campo em minutos. |

---

## 5. Dados

### O que esta área GUARDA

| campo | formato | quem mais lê |
|---|---|---|
| `S.descanso` | Mapa de data local para o instante da marca: `{ '2026-10-08': 1760000000000 }`. Valor `1` em marcas antigas (sem instante). | Ninguém além de Dias (mês e dia aberto). Sincronia (área 02) funde. |

### O que esta área ESCREVE em dados de outras

| campo | o que escreve aqui | dono e outros leitores |
|---|---|---|
| `S.done[]` (a presença) | Lançamento: `{ t, sid: t, retro: 1, m, day, dl?: 1 }` ou `{ t, sid: t, retro: 1, m, livre: 1, grupos: [região], dur?, nome? }`; `hora: 1` quando a hora foi medida (então `t` é a hora real); correção do tempo: `dur` (ms, 1 a 600 min), `fim: 'manual'`, `m`; apagar: remove e põe lápide. | Dono: área 03 (sessão). Leem: 04 (sequência, 48 sessões), 09, 10, 06 (duração do treino). |
| `S.logs[exercício][]` (as séries) | Correção no lugar: a série `[carga, reps, rir?]` e `m`; série apagada vira `null`; a última série leva o registro (lápide); série lançada cria `{ t: início da sessão, sid, sets, dl?, m }` na ordem do tempo. Apagar o treino remove todos os registros daquela sessão (lápides). | Dono: área 03. Leem: 04 (histórico, progressão), 09 (força, volume), 05 (aula). |
| `S.cardio[]` | Cardio esquecido: `{ t: meio-dia do dia (+1 ms se ocupado), m: modalidade, min, i: intensidade, alt: carimbo, semHora: 1 }`; correção: `m`, `min` ou `i` e `alt`; apagar: remove e lápide. Teto de 200 (os mais recentes pela data). | Dono comum com a área 10 (cardio de hoje). Leem: 09 (semana), 10. |
| `S.apagados` | Lápides: `done:<sid>`, `log:<exercício>:<sid>:<posição>`, `cardio:<t>`, `descanso:<data>`. | Área 02. |
| `S.sessao` | "Detalhar exercícios e séries" cria `{ day, inicio: t do registro, ultima, sid, retro: 1, tocado, pausas: [], pulados: [] }` e zera `S.draft`. | Dono: área 03. |

### O que esta área só LÊ

| dado | para quê | dono |
|---|---|---|
| `S.prog`, `S.rot`, `S.mods`, catálogo (`S.ex`) | Letra e nome do treino, se é aula, a prescrição de cada exercício, a ordem, os não feitos, "X de Y séries", o número de treinos da sequência (linha tracejada), as faixas da régua. | 04 (e `S.mods` da 03) |
| `proximoTreino`, `ultimaDoPlano` | O previsto naquele dia; se a sequência anda ou volta. | 04 |
| `S.comidaHist`, a leitura da folha "pôr em dia", "dia interpretável" | A barra da célula e a comida do dia. | 06 |
| `S.cadencia` | O palpite do dia vazio. | 06 |
| `S.deload` | Marca o treino lançado como deload. | 03 |
| `S.carga` | A unidade da carga no editor ("kg"). | 03 |
| `S.done[].lousa`, cache da lousa | A foto no detalhe. | 05 |
| `S.done[].mods`, `pausado`, `ini`, `fim`, `dur` | Notas, começo e fim. | 03 |

### Estado de tela (não guardado)

`view.mes` (0 = mês corrente, negativo = meses atrás; volta a 0 ao trocar de aba), `view.diaAberto` (instante do meio-dia do dia aberto), `view.cardioAberto` (instante do cardio aberto no lugar), `view.cardioNoDia` (`{ m, min, i }` do cardio esquecido em escolha), `view.cardioNoDiaFalhou` (frase da recusa), `view.sessao` (a presença aberta no detalhe), `view.corrigeTempo` (instante da sessão com a correção do tempo aberta), `view.passada` (a série aberta: `{ idEx, chave, k, foco, era, novo?, carga?, ref?, gravado, tocado, rir }`), `view.teclado` com alvo `passada`, `view.add` (o lançamento: `{ t, sid, antes, horaAberta, hora, durAberta, gravadoEm }`). Da ligação com a 04: `view.hist`, `view.edit`.

Nada disso sobrevive a fechar o app: reabrir cai no lugar inicial (área 01). O que já foi tocado já está gravado — cada toque grava —, então fechar no meio de um lançamento ou de uma correção não perde o registro; perde só a escolha ainda não tocada (o cardio esquecido em escolha, a hora digitada pela metade). O nome do fora da prescrição é gravado ao sair do campo e, por garantia, ao fechar a folha.

### Como cada dado atravessa a sincronia (área 02)

| dado | forma | chave | carimbo | apagar |
|---|---|---|---|---|
| Presença `S.done` | Coleção com chave; vence o carimbo maior; teto 3000. | `done:<sid>` (o `sid` não muda quando a hora é corrigida). | `m` | Lápide `done:<sid>`. |
| Séries `S.logs` | Coleção por exercício; vence o registro inteiro com carimbo maior; teto 500 por exercício. | `log:<exercício>:<sid>:<posição de origem>` | `m` | Lápide. |
| Cardio `S.cardio` | Coleção com chave; teto 200. | `cardio:<t>` (o instante nunca muda na correção). | `alt` (porque `m` é a modalidade) | Lápide `cardio:<t>`. |
| Descanso `S.descanso` | Mapa de data; vence o instante maior. | `descanso:<data>` | o próprio instante da marca | Lápide `descanso:<data>`; marcar de novo depois da lápide vence. |

Lápides valem 90 dias (área 02): um aparelho que ficar mais tempo sem sincronizar pode trazer de volta o que foi apagado. Corrigir duas séries diferentes do mesmo exercício na mesma sessão em dois aparelhos: vence o registro com carimbo maior, inteiro, e a outra correção se perde (§9, R19). Sem rede, tudo funciona igual: grava no aparelho e a nuvem recebe depois.

---

## 6. Regras

1. **O dia é a unidade, não a sessão.** "Dias com treino" conta dias distintos; dois treinos no mesmo dia contam um (o caso comum de abrir um treino por engano e depois o certo). Aula conta (é o sexto treino); fora da prescrição conta (é presença); descanso não conta. *Desenho, F21/F35/F157.*
2. **Média móvel de 4 semanas, nunca sequência de dias.** Dias com treino nos últimos 28 dias (o dia final incluso) divididos por 4. Quem treina 5 a 6 vezes por semana quebraria sequência todo domingo, e o número puniria o descanso que o programa manda. *Desenho, F22.*
3. **Sem média antes de 4 semanas.** Até 28 dias desde o primeiro treino, a conta vem sem média ("3 dias com treino em 9"), porque dividir 9 dias por 4 semanas diria que ele treinou menos. Sem treino, nenhuma leitura vira zero. *Desenho, estado 15.*
4. **As leituras do mês corrente vão até ontem.** Hoje ainda está acontecendo, e é do Agora. *Desenho.*
5. **Horário de início pela mediana.** Com número par, o meio entre os dois do centro. *Decisão do dono, 14/10.*
6. **Só hora medida entra no horário.** Treino passado sem hora, aula sem hora e fora da prescrição ficam de fora, e a tela diz quantos. Nenhuma hora é inventada (o 07:00 inventado já sujou a média). *Desenho, F270.*
7. **Tem hora** = não é fora da prescrição e (foi aberto ao vivo, ou foi lançado com a hora posta).
8. **Dia sem registro fica vazio.** Nada de presumir descanso no domingo ou treino na segunda. O tipo do dia pelo padrão semanal só aparece como **palpite** e se diz palpite. *Desenho.*
9. **O fato vence a marca.** Dia com treino não aceita marca de descanso, e diz por quê. *Desenho, F156.*
10. **O descanso não conta em nenhuma conta.** É histórico, não muda tipo do dia, cadência, 14 dias nem leitura. *Desenho.*
11. **Hoje abre o Agora; o futuro não abre.** O cardio esquecido e o lançamento pela grade são para dias passados (o lançamento de hoje vem do "Já fiz", área 06). *Desenho; decisão do dono 14/10 para o cardio.*
12. **Cardio esquecido: meio-dia, sem hora.** Instante ao meio-dia (a semana e o mês contam no dia certo), marca "sem hora", +1 ms se ocupado. Opções: modalidade bike, esteira inclinada, elíptico, remo; 20, 25, 30, 40 min; leve ou moderado; começa em bike, 25, moderado. *Decisão do dono, 14/10.*
13. **Correção do cardio no lugar**: modalidade da lista, intensidade leve ou moderado, minutos inteiros de 1 a 300. O instante não muda. *Desenho, estado 12.*
14. **O app aponta e não corrige.** Cardio igual a outro do mesmo dia (mesma modalidade, minutos e intensidade) fica marcado em âmbar; nada sai sem ele. *Desenho.*
15. **Todo apagar passa pelo pare** e diz o que vai, o que fica (com número) e o efeito (no mês, na sequência). Não tem volta e vale para os outros aparelhos. *Decisão 8 do desenho.*
16. **Apagar o treino leva a presença e as séries juntas.** Séries órfãs contariam volume e puxariam progressão. *F295.*
17. **O treino em andamento não se apaga nem se corrige o tempo** pelo detalhe. *Desenho.*
18. **Corrigir o tempo**: 30, 45, 60, 75 ou 90 min na tela; a função aceita 1 a 600 min; o fim passa a declarado. *F152, F295.*
19. **Cada toque grava** — na série passada, no lançamento, no cardio. A tela diz o que foi gravado, com a hora. *Decisão 1 do desenho.*
20. **Na recusa do aparelho, a tela não finge.** A série volta ao guardado e o toque fica dito como "tocado"; o cardio esquecido sai da memória. *Desenho, estado 14.*
21. **Régua da série passada**: repetições inteiras de 0 a 200; RIR de 0 a 4 (o mesmo de novo, ou "nenhum", tira); carga pelo teclado do app com uma casa decimal, maior que zero.
22. **Não feito não é falha nem pendência**: fica na posição, sem cor de alarme, e pode ser lançado "se você fez". Referência da carga: a série anterior do mesmo registro, ou a mesma posição na última vez antes daquele dia, ou a última série dela. *Desenho, P2.*
23. **A série que nasce entra na ordem do tempo**, para não virar a "última vez" de amanhã.
24. **Apagar uma série deixa as outras na posição**; a única leva o registro do exercício (com lápide).
25. **Lançamento: um toque grava a presença.** O previsto é o próximo da sequência **naquele dia** (contando só o que veio antes dele). Só letras da sequência ou "fora da prescrição" são aceitas. *Desenho, estados 6 a 8.*
26. **Hora neutra das 7h**, nunca mostrada, para ordenar o treino sem hora; dois registros no mesmo instante andam um minuto.
27. **Hora do lançamento**: "HH:MM" de 00:00 a 23:59; vazio volta a sem hora; inválida não grava.
28. **Fora da prescrição** grava presença, regiões do corpo, duração (30/45/60 ou outro, 1 a 600 min) e um nome; não mexe na sequência, não entra nas 48 e não entra no horário. *F155, F178.*
29. **Treino lançado em deload** ganha a marca de deload (fica fora da conta das 48, área 04).
30. **Sessão de treino passado** (Detalhar) fecha por "Concluir", por 90 minutos sem toque ou na virada do dia de uso, sem gravar duração. Abrir uma encerra a de hoje antes, com o tempo. *Área 03 para o ciclo; aqui a entrada.*

---

## 7. Ligações com as outras áreas

| área | o que esta recebe dela | o que esta entrega a ela |
|---|---|---|
| 01 · Fundação | Gravar (`save`), o aviso de gravação falhada, o painel de pare, o aviso curto, a tela cheia, a pilha de camadas e o Voltar, a posição de leitura. | Os destinos "dia", "sessão" e "lançamento" na pilha; os textos de pare de apagar treino, série e cardio. |
| 02 · Sincronia | A fusão das coleções e das lápides; o cardio e as presenças vindos do outro aparelho. | Lápides `done`, `log`, `cardio`, `descanso`; carimbos `m` e `alt` das correções; o mapa de descanso. |
| 03 · Sessão de treino | A presença e as séries que a sessão grava; o fim aproximado ou declarado; a régua e o teclado; o modo de sessão. | A sessão de treino passado aberta por "Detalhar"; a correção do tempo depois do fecho automático; as correções das séries passadas. |
| 04 · Programa | O treino de cada letra (nome, etiqueta, exercícios, faixas, se é aula), o tamanho da sequência, o próximo treino e o último da sequência; o histórico do exercício (a outra porta de correção). | Treinos passados lançados (que movem ou não a sequência), séries corrigidas e lançadas que entram no histórico e na progressão. |
| 05 · Aula do box | A presença da aula, a foto da lousa e o cache dela. | O detalhe mostra "Aula" e a lousa; a aula pode ser lançada num dia passado. |
| 06 · Comida | A leitura de um dia passado (a folha de pôr em dia), o histórico de comida, "dia interpretável", a cadência para o palpite, a porta "Já fiz" que abre o lançamento de hoje. | A porta "Pôr este dia em dia" no dia aberto; a barra da comida na célula. |
| 09 · Semana | — | Presenças, séries e cardios corrigidos ou acrescentados (entram no volume, na força e no cardio da semana). |
| 10 · Agora | A porta da célula de hoje; o cartão do fim aproximado que abre a sessão passada; o cardio de hoje (mesma lista). | O detalhe da sessão para corrigir o fim; o apagar de cardio com pare (usado também no Agora); "Está certo" (confirmar a duração) é verbo comum. |

---

## 8. Como serviço individual

**Nome:** Diário (o histórico por dia).

**O que ele possui (dados):**
- O mapa de descanso (`S.descanso`) e as lápides dele.
- As leituras do mês (projeções calculadas, sem dado próprio): dias com treino, cardio do mês, horário de início.

**O que ele não possui, mas é o único escritor de correções de passado:** presenças passadas, séries passadas e cardio de dias passados pertencem aos serviços de Sessão (03) e de Cardio (hoje dividido entre 10 e 11). O Diário pede as escritas a eles; hoje escreve direto no estado.

**Operações (como uma API):**

| verbo | recebe | devolve |
|---|---|---|
| `lerMes` | mês (ano, mês), "hoje" | células (dia, letras, fora, descanso, cardios, comida, rótulo, abre) e as três leituras com as contas em texto |
| `lerDia` | data | registros (sessões e cardios pela hora, com "igual a"), descanso, palpite, permissões (pode descanso, pode cardio), comida do dia |
| `lerSessaoPassada` | id da sessão | começo, fim (declarado/aproximado), exercícios com séries e não feitos, notas, lousa, mudanças |
| `marcarDescanso` / `tirarDescanso` | data | o dia atualizado, ou recusa "dia com treino" |
| `lancarTreinoPassado` | data, letra ou "fora" | a presença criada, o efeito na conta das 4 semanas e na sequência |
| `corrigirLancamento` | id, hora / regiões / duração / nome | a presença corrigida |
| `abrirPreenchimento` | id da presença | a sessão de treino passado aberta (delegado à Sessão) |
| `corrigirDuracao` / `confirmarDuracao` | id, minutos | a presença com fim declarado |
| `corrigirSerie` | id do registro, posição, carga / reps / RIR | a série gravada, ou "recusado" com o valor guardado |
| `lancarSerie` | sessão, exercício, posição, carga, reps | o registro criado ou estendido |
| `apagarSerie` | id do registro, posição | o efeito (as que ficam, ou o exercício que sai) |
| `apagarTreino` | id da presença | o efeito (séries que vão, o que fica, a sequência) |
| `lancarCardioPassado` | data, modalidade, minutos, intensidade | o cardio criado, ou recusa |
| `corrigirCardio` / `apagarCardio` | id do cardio, campo, valor | o cardio corrigido / o efeito no mês |
| `textoDoApagar` | o que se quer apagar | a frase do pare (para a interface pedir confirmação antes) |

**Eventos que emitiria:** `DescansoMarcado`, `DescansoDesmarcado`, `TreinoPassadoLancado`, `LancamentoCorrigido`, `DuracaoDeclarada`, `SeriePassadaCorrigida`, `SeriePassadaLancada`, `SeriePassadaApagada`, `TreinoApagado`, `CardioPassadoLancado`, `CardioCorrigido`, `CardioApagado`.

**Eventos que escutaria:** `SessaoEncerrada` e `SerieRegistrada` (03), `ProgramaMudou` e `SequenciaMudou` (04), `DiaDeComidaGravado` (06), `CardioRegistrado` (10), `FusaoConcluida` (02) — para refazer as leituras.

**O que hoje está acoplado e precisaria ser separado:**
- O dia aberto pede à área 06 **o modelo de tela de uma folha** (`poeODiaEmDia`) para saber a comida do dia; precisaria de uma leitura própria "comida de um dia passado".
- O detalhe e o dia leem o **programa atual** (com as mudanças de hoje da mesma letra) para prescrição, ordem e não feitos; um serviço precisaria da prescrição **daquele dia** (versão do programa na data).
- O previsto naquele dia chama `proximoTreino` com um estado falso (as presenças cortadas na data); a área 04 deveria oferecer "próximo treino na data X".
- O cardio está dividido entre o Agora (hoje) e Dias (passado), com o mesmo apagar e listas separadas de opções; um serviço de Cardio único resolveria.
- A correção da série passada reusa a régua e o teclado do modo de sessão pelo mesmo `view.teclado` (alvo "passada"); a interface de entrada numérica deveria ser componente sem estado global.
- A ordem de desenho das telas cheias e a pilha de camadas estão em `main.jsx` e `navegacao.js` (área 01), e é por isso que "Detalhar" a partir do dia deixa o dia por cima (§9, R1).
- O detalhe calcula campos que a tela não usa (estatísticas, recordes, itens, pendências): um contrato de leitura enxuto separaria o que é do Diário do que é da Semana e do histórico.
- Gravar é o estado inteiro de uma vez (`save`); cada operação acima viraria uma escrita da coleção do dono.

---

## 9. Riscos e dívidas que apareceram na leitura

- **R1 · "Detalhar exercícios e séries" a partir do dia aberto mostra o dia, não o modo de sessão (provável bug; a confirmar no aparelho).** O lançamento fecha e o modo abre, mas o dia aberto continua aberto e é desenhado por cima do modo (na ordem das telas cheias e na pilha de camadas, o dia fica acima do modo). Caminho: Dias → tocar num dia passado → "Registrar treino" → tocar no previsto → "Detalhar exercícios e séries". Esperado: o modo de sessão do treino passado. Pelo código: volta ao dia (com o aviso "Preenchendo o treino de…"), e o modo só aparece depois do Voltar. Os testes chamam "Detalhar" sem dia aberto, por isso não pegam.
- **R2 · "Tentar de novo" depois de falhar o RIR ou a carga grava 0 repetições (bug).** O botão repete a repetição tocada; quando o toque recusado foi o RIR ou a carga, não há repetição tocada e o valor vira 0. Caminho: sessão passada → tocar numa série → marcar um RIR com o armazenamento recusando → "Tentar de novo" com o armazenamento de volta: a série fica "40 × 0".
- **R3 · O detalhe usa o programa de hoje, não o daquele dia.** Prescrição ("3 × 8-12"), ordem dos exercícios, os não feitos e o "14 de 22 séries" do dia vêm do treino da letra como ele está agora — inclusive com as mudanças só de hoje, se a sessão aberta hoje é da mesma letra. Uma sessão antiga mostra "não feito" de exercícios que entraram depois. **A confirmar** quando as mudanças de hoje são limpas (área 03).
- **R4 · No dia 1 do mês corrente, as leituras somem.** Sem dia passado no mês, a tela diz "Aparece com o primeiro treino" e "Aparece com a primeira sessão que tiver hora" mesmo com meses de histórico.
- **R5 · O pare do cardio e a leitura do mês contam períodos diferentes.** O pare conta o mês inteiro (inclui hoje); a leitura vai até ontem. Com cardio hoje, "passa de 3 para 2" convive com "2 sessões" na tela.
- **R6 · "Foi descanso" e "Tirar a marca" levam a página ao topo.** O verbo ainda fecha o lançamento (resto de quando o descanso morava na folha), e fechar um destino que não estava aberto devolve a posição zero.
- **R7 · A marca de descanso fica escondida, não apagada.** Marcar descanso e depois lançar um treino no mesmo dia (ou receber um do outro aparelho) esconde a marca; apagar o treino faz o descanso reaparecer.
- **R8 · Cardio esquecido muito antigo some no teto.** Com 200 cardios guardados, um esquecido mais antigo que todos entra e sai no mesmo passo, e o aviso diz que foi registrado.
- **R9 · Algumas correções não existem depois que a folha fecha.** A hora de início de um treino (passado ou ao vivo) não se corrige na sessão passada; o fora da prescrição não corrige grupos, duração nem nome — só apagar e lançar de novo.
- **R10 · A duração só tem 30, 45, 60, 75 e 90 min.** Uma sessão de 2h não pode ser declarada exata pela tela (a função aceita 1 a 600).
- **R11 · A carga da série passada não volta a zero nem a vazio** pelo teclado (zero é recusado), e cada tecla grava um valor intermediário ("1", "10", "100").
- **R12 · Movimentos de aula com grandeza (metros, segundos, calorias) não se corrigem no lugar** e o "não feito" deles não lança; o caminho é o histórico do exercício (área 04).
- **R13 · A nota da aula (o quadro colado) é gravada na presença e não aparece no detalhe** — confirma o R5 da área 05.
- **R14 · O detalhe calcula e não mostra**: estatísticas de tempo, volume e recordes, itens com variação, pendências, cardio, dores, o título "N séries registradas". O escopo pedia "stats e recordes": para a sessão da sequência eles **não** aparecem na tela (só o treino avulso mostra tempo e grupos). Custo e confusão para quem evoluir.
- **R15 · Dia só com cardio diz "nada registrado"** na procedência.
- **R16 · A barra "sem marca" aparece em todo dia passado**, inclusive antes de o app existir para ele; ela não distingue "não usava o app" de "não marcou".
- **R17 · A hora do lançamento colide em silêncio** (anda um minuto) e aceita hora futura quando o lançamento é de hoje (pela porta "Já fiz").
- **R18 · Falhas de gravação tratadas de dois jeitos.** O cardio esquecido e a série passada desfazem na memória e dizem; marcar descanso, corrigir e apagar cardio, lançar treino, apagar série e corrigir a duração deixam a mudança na memória, mostram o aviso de sucesso e dependem só do aviso geral (área 01).
- **R19 · Duas correções no mesmo exercício em dois aparelhos**: vence o registro inteiro com carimbo maior; a correção de outra série feita no outro aparelho se perde (regra da área 02).
- **R20 · "em dia sem musculação"** conta cardio em dia sem nenhuma sessão: aula e fora da prescrição também contam como "musculação" nessa conta.
- **R21 · Lápides de 90 dias** (área 02): aparelho parado mais tempo pode ressuscitar treino, série, cardio ou descanso apagado.
- **R22 · Apagar uma aula não apaga a foto da lousa** do aparelho (área 05, R14).
- **R23 · Código morto ou só para testes:** `gruposDoPlano` (ninguém chama), o campo `volta` do dia aberto (a tela não usa), `periodoDe` (o marcador de período saiu das células; só os testes o chamam).
- **R24 · O dia aberto aceita data futura** se chamado por código (a célula futura está desligada, mas o verbo não recusa), e então ofereceria "Registrar treino" e "Foi descanso" no futuro. O cardio esquecido, sim, recusa.

---

## 10. Índice técnico

### Arquivos

| arquivo | papel |
|---|---|
| `src/ui/telas/dias.jsx` | A aba: `Mes` (grade, setas, células), `Dias` (vazio, as três leituras), `Celula`, `LinhaDaMedia` (a linha da média e a tracejada), `EixoDosInicios` (eixo 5h a 22h). |
| `src/ui/telas/dia.jsx` | `Dia`: o dia aberto (sessões, cardio no lugar, descanso, vazio, ações, cardio esquecido, comida). |
| `src/ui/telas/sessao.jsx` | `Sessao`: a sessão passada e o treino avulso; `Editor` da série (carga, régua, RIR, apagar). |
| `src/ui/telas/retroativo.jsx` | `Retroativo`: o lançamento (`Antes`, `Gravado`, `DoPlano`, `Fora`). |
| `src/dominio/mes.ts` | Regras das leituras: `inicioDoDia`, `diasComTreino`, `mediaMovel`, `leituraDosDias`, `serieDaMediaMovel`, `medianaDosInicios`, `iniciosDoPeriodo`, tipos `SessaoDoMes`, `Inicio`. |
| `src/main.jsx` | Os modelos de tela e os verbos (abaixo). |
| `src/ui/navegacao.js` | `camadasAbertas`: a ordem "dia" abaixo de "sessão" e "add" (área 01). |
| `src/dominio/sincronia.ts` | `chaveDeSessao`, `chaveDeLog`, `chaveDeCardio`, `chaveDeDescanso`; a fusão do descanso (área 02). |
| `src/ui/instrumento/regua.jsx`, `teclado.jsx`, `forma.jsx`, `telacheia.jsx`, `primitivos.jsx` | Peças reusadas (régua, teclado, forma da marca de comida, tela cheia, `Stats`, `Procedencia`, `Vazio`, `Secao`, `Cabecalho`). |

### `CTX.*` (linhas do inventário)

O mês: `mes` 8669, `mudaMes` 8880, `abreDia` 8769, `abreSessaoDoDia` 8636.
O dia: `diaAberto` 8777, `fechaDia` 8773, `abreCardioDoDia` 8774, `alternaDescansoDoDia` 8775, `corrigeCardio` 8183, `apagaCardio` 8182 (também do Agora, área 10), `abreCardioNoDia` 3732, `cardioNoDiaSet` 3737, `gravaCardioNoDia` 3742; ligação: `abrePoeODia` 10692 e `poeODiaEmDia` 10694 (área 06).
A sessão passada: `detalheDaSessao` 8883, `fechaSessao` 9087, `abreSerieDaPassada` 9088, `repsDaPassada` 9089, `andaReguaDaPassada` 9090, `rirDaPassada` 9091, `abreCargaDaPassada` 9092, `apagaSerieDaPassada` 9093, `abreCorrecaoDoTempo` 9094, `editaSessao` 9095 (apaga o treino), `corrigeDuracao` 9096, `confirmaDuracao` 9101 (usado pelo Agora, área 10); compartilhados: `tecla` 8051, `fechaTeclado` 8052.
O lançamento: `retroativo` 9467, `fechaAdicionar` 9544, `lancaTreino` 9545, `abreHoraDoLancamento` 9546, `semHoraNoLancamento` 9547, `horaDoLancamento` 9548, `grupoDoLancamento` 9549, `duracaoDoLancamento` 9550, `nomeDoLancamento` 9551, `guardaLancamento` 9552, `detalhaLancamento` 9553; ligação: `jaFizHoje` 2559 (área 06).
Ligação com a 04 (correção pelo histórico): `historico` 9106, `editaLinha` 9251, `cancelaEdicao` 9252, `salvaEdicao` 9253, `apagaLinha` 9254, `editDor` 9255, `histKey` 9250, `fechaHist` 9249.

### Funções de `main.jsx`

- Dia e descanso: `temHora` 1702, `horaDaSessao` 1703, `fimDaSessao` 1704, `sessoesDoDia` 1706, `ehDescanso` 1709, `alternaDescanso` 1718.
- Cardio: `cardioDoDia` 3678, `cardioSemana` 3679, `corrigeCardio` 3709, `horaDoCardio` 3723, `delCardio` 3765.
- Mês: `mesRef` 3797, `mudaMes` 3818, `maiuscula` 8660, `horaDeMinutos` 8662, `numeroCurto` 8664, `letraDoRegistro` 8667.
- Lançamento: `gruposDoPlano` 3829 (morto), `regioesDoCorpo` 3840, `horaNeutra` 3854, `instanteLivre` 3864, `abrirAdicionar` 3870, `fecharAdicionar` 3876, `registroDoLancamento` 3883, `previstoNoDia` 3889, `diasNasQuatroSemanas` 3895, `lancaTreino` 3901, `corrigeLancamento` 3919, `abreHoraDoLancamento` 3929, `horaDoLancamento` 3935, `horaDoLancamentoNoCampo` 3948, `grupoDoLancamento` 3955, `duracaoDoLancamento` 3965, `anotaNomeDoLancamento` 3975, `detalhaLancamento` 3989, `concluirRetro` 4005, `mascaraDeHora` 4022, `aplicaHora` 4027.
- Detalhe e apagar: `itensDaSessao` 5714, `resumoDaSessao` 5765, `apagaRegistroDeTreino` 5789, `corrigeDuracao` 5868, `confirmaDuracao` 5892, `abreCorrecaoDoTempo` 6159, `abrirSessao` 6161, `fecharSessao` 6162.
- Corrigir no lugar: `registroPorChave` 5914, `serieDaPassada` 5918, `abreSerieDaPassada` 5926, `unidadeDoPrescrito` 5947, `referenciaDaSerie` 5958, `lancaSerieDaPassada` 5977, `gravaNaPassada` 6015, `textoDaSerieDaPassada` 6036, `repsDaPassada` 6041, `andaReguaDaPassada` 6047, `rirDaPassada` 6065, `abreCargaDaPassada` 6074, `cargaDaPassada` 6091, `apagaSerieDaPassada` 6104, `exDoRegistro` 6130, `editorDoNovo` 6137; compartilhadas: `teclaDoTeclado` 5464, `fechaTeclado` 5497, `numeroDoCampo` 5157.
- Correção pelo histórico (ligação, área 04): `editarSessao` 3591, `cancelarEdicao` 3592, `editDor` 3594, `guardaEdicaoCom` 3613, `guardaCamposEdicao` 3632, `salvarEdicao` 3642, `apagarSessao` 3656, `histKey` 3675, `closeHist` 3676, `openHist` 3586.
- Usadas daqui, de outras áreas: `save` 1493 e `lapide` 130 (01/02), `pare` 4452 (01), `toast` 4691 (01), `treino` 302, `diaAberto` 205, `rot` 134, `ultimaDoPlano` 1506, `nextDay` 1512, `exDe` 249, `nomeEx` 250 (04), `cadenciaDaSemana` 2274 (06), `fechaSessao` 772, `encerraSePreciso` 637, `abreModo` 11167 (03), `entraNoDestino` 11448, `saiDoDestino` 11456, `telaCheia` 2591 (01).
- Constantes: `RIR_ESCALA` 5342 (0 a 4), `CARDIO_ALVO` 138 (2, área 10), `SESSAO_LIMITE` 571 (90 min, área 03), `DIA_MS` (bloco do mês).

### Regras do domínio

- `src/dominio/mes.ts`: todas as exportações (`SessaoDoMes`, `inicioDoDia`, `diasComTreino`, `mediaMovel`, `leituraDosDias`, `serieDaMediaMovel`, `medianaDosInicios`, `Inicio`, `iniciosDoPeriodo`).
- Usadas: `proximoTreino`, `ROT_BASE`, `CADENCIA_PADRAO` (`dia.ts`, área 04/06); `regua`, `pagina`, `anda`, `faixaDoTexto` (`regua.ts`, área 03); `MODAIS`, `REGIOES`, `CARGAS`, `PRIO` (`programa.ts`); `chaveDeSessao`, `chaveDeLog`, `chaveDeCardio`, `chaveDeDescanso` (`sincronia.ts`); `diaInterpretavel` (`nutricao/calculo.ts`, área 06); `fmtDate`, `fmtHoraDita`, `fmtHora`, `fmtDur`, `diaExtenso`, `sameDay`, `DIAS_CURTOS`, `DIAS_LONGOS`, `MESES`, `periodoDe` (só testes) (`formato.ts`); `cronometrado`, `ritmoDe`, `tutOf`, `volOf`, `maxLoad` (`carga.ts`, para o resumo calculado e não mostrado).

### Campos `S.*` e `view.*`

- `S.descanso` (dono), e escreve em `S.done`, `S.logs`, `S.cardio`, `S.apagados`, `S.sessao`, `S.draft`; lê `S.prog`, `S.rot`, `S.mods`, `S.ex`, `S.comidaHist`, `S.cadencia`, `S.deload`, `S.carga`, `S.mtime` (via `save`).
- `view.mes`, `view.diaAberto`, `view.cardioAberto`, `view.cardioNoDia`, `view.cardioNoDiaFalhou`, `view.sessao`, `view.corrigeTempo`, `view.passada`, `view.teclado` (alvo `passada`), `view.add`; ligação: `view.hist`, `view.edit`, `view.modoSessao`, `view.day`, `view.open`.

### Testes que cobrem a área

- `tests/dominio/mes.test.ts` (7): conta dias e não sessões; janela de 28 dias com o dia final; aula e fora contam; a série tem um valor por dia; o horário só lê sessão com hora e diz o que ficou de fora; sem média antes de quatro semanas; a mediana.
- `tests/fluxo/horario.test.js`: detalhe mostra início e fim; sessão em andamento mostra só o começo; o dia aberto mostra a hora; horário típico com mais cedo e mais tarde; retroativo sem horário não inventa hora; com horário registra; horário inválido ignorado; avulso fora do horário; o período saiu das células; sem horário medido não há ponto; trocar de mês não mexe na posição; recorde não pintado; a mediana contra o treino à tarde.
- `tests/fluxo/retro.test.js`: um toque grava; dois sem hora não colidem; o previsto naquele dia; ordem por data lançando para trás; fora da prescrição grava no toque; avulso é presença; preencher grava na data do treino; abrir retroativo encerra o de hoje; sessão retroativa esquecida fecha na virada; dia vazio é atalho para lançar; descanso pelo dedo e o mês mostra; apagar registro avulso; `ctx.retroativo` antes e depois; hora por valor corrige o mesmo registro; `fechaAdicionar` sai sem gravar.
- `tests/fluxo/sessao.test.js`: o detalhe oferece corrigir e apagar; corrigir o tempo torna declarado; limites da correção; apagar o treino leva as séries com lápide; o aviso conta as séries; o treino em andamento não se apaga; tocar a série abre a régua e grava; a carga abre o teclado com vírgula; o RIR marca e desmarca; apagar uma série pelo painel; a única leva o registro; a falha deixa a guardada e o "tocado"; acha pela chave com a lista mudando; o não feito entra pela régua; exercício inteiro não feito entra na ordem do tempo; falha ao lançar continua não feita; lançar a 3 com a 2 vazia. Ligação com a 04: a correção pelo histórico (`editaLinha`, `salvaEdicao`, `apagaLinha`, outro dia).
- `tests/fluxo/cardio.test.js` (parte do dia): o mês marca os dias com cardio; sem competir com a letra; dia só de cardio; o dia mostra o cardio junto do treino e o mês soma; o cardio mora no dia; o cardio esquecido sem hora no dia certo; dois esquecidos não colidem; a recusa não finge; hoje e o futuro não ganham o lançamento.
- `tests/fluxo/corpo.test.js`: cardio apagado por engano; o cardio se corrige no lugar campo a campo (e recusa valor fora); preencher treino passado avisa para onde vão as séries; `apagaCardio` sai da semana e não mexe no treino.
- `tests/fluxo/sincronia.test.js`: descanso viaja e some quando desmarcado; descanso não conta como treino; dia com treino recusa o descanso; a folha não grava "descanso" como treino; o descanso no mês e no dia do mesmo jeito.
- `tests/fluxo/telas.test.js`: o mês marca e o dia vazio abre com "Registrar treino"; as leituras contam dias (tempo e volume saíram); média semanal, não sequência; correção de sessão passada pelo histórico; dois treinos no dia abrem o dia com os dois; um treino abre o dia e a linha abre a sessão; `abreSessaoDoDia` despacha os dois tipos e não abre sem célula.
- `tests/fluxo/ciclo.test.js`: o dia aberto diz qual sessão fechou sozinha; dois treinos no mesmo dia.
- `tests/fluxo/navegacao.test.js`: a pilha de camadas derivada de `view` (dia abaixo de sessão e lançamento); Voltar e Esc saem de destino; posição de leitura ao voltar.
