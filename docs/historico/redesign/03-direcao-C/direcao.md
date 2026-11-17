# Direção C · Previsto e feito

Desenhos: `momento-1.html` (entre duas séries) e `momento-2.html` (depois de
comer). Os dois abrem no navegador, sem rede, na largura do telefone. Cada estado
é uma tela, com a explicação e os fatos ao lado. A primeira tela de cada arquivo
responde ao toque.

F = 01-fatos.md · U, K, D, M = 02-uso.md · P = resposta do dono em 02-perguntas.md.

---

## Tese

Como quase tudo o que este produto registra já está escrito antes de acontecer,
na prescrição e no último registro, a interface mostra o previsto a lápis e faz
de registrar passar a tinta: um toque confirma o previsto, e só a diferença dá
trabalho.

---

## O modelo

### 1. Uma gramática só: lápis, tinta, hachura

Toda linha do produto está num de três estados. Cada estado tem uma forma e uma
palavra, e nunca é dito só pela cor.

| estado | o que é | forma | palavra na tela |
|---|---|---|---|
| **lápis** | O que a prescrição ou o último registro dizem que vai acontecer: a próxima série com a carga e as repetições da última vez (F170, F171); a refeição do plano no horário dela (F181, F189); a pesagem (F42); o cardio depois do A e do D (F46); o próximo treino da sequência (F81); a aula; as fotos a cada 14 dias (F226) | contorno tracejado | "previsto" |
| **tinta** | O que ele confirmou | preenchido | o valor: "37,5 × 10", "tudo", "metade" |
| **hachura** | O previsto cuja hora passou sem marca | listras | "sem marca" |

A hachura não é zero nem falha: é **não sabido**. A regra do nutricionista já
trata assim o dia sem marca (F198, F200). O 02-uso não sabe se o cardio que falta
não aconteceu ou só não foi registrado (§8), e a hachura diz exatamente isso.
Além dos três estados há duas marcas auxiliares: "pulado", que é decisão
declarada (F154), e "não gravado", que é erro, com borda e texto. Um contorno
laranja cheio marca o que é **agora**.

**Por que essa gramática serve ao uso medido:**

- As duas situações que a vida apresenta mais vezes por semana são confirmações
  de algo já escrito. Primeira: 48 séries registradas e cerca de 76 exigidas por
  semana, nas quais a carga é quase sempre a da última vez e as repetições sobem
  aos poucos (F171, F95). Segunda: 34 a 41 refeições por semana cujo conteúdo o
  plano fixou (F181). Nas duas, o app sabe o valor provável antes do toque.
- A segunda situação mais frequente medida, pôr em dia (U11, 3,25 por semana), é
  o mesmo ato num dia passado. Usa a mesma tela e o mesmo toque.
- A maior falha do produto é a comida que não chega ao registro (1 dia em 22,
  P1), e a regra precisa de 11 dias conhecidos em 14 (F213). A hachura mostra a
  diferença entre "não comi" e "não disse", que a regra já faz e a interface
  precisa mostrar.

### 2. Organizado por tempo, não por assunto

Três lugares, numa barra embaixo: **Hoje · Semanas · Prescrição**.

- **Hoje** mostra o roteiro do dia em ordem de hora: refeições, sessão, pesagem,
  água, cardio, aula, fotos. O que já é tinta encolhe numa linha; o que está a
  lápis ou hachurado fica à vista. As setas ‹ e › andam pelos dias. Um dia
  passado é o mesmo roteiro com o mesmo toque, e é assim que se faz o pôr em dia
  (U11), o treino em data passada (F158) e a marca de dia de descanso (F156). No
  pé de Hoje, ao alcance do polegar, fica **o agora**: o ato mais provável neste
  instante, com o botão de um toque.
- A **sessão** é o agora ampliado, quando o agora é um treino. Abre em tela
  inteira (Momento 1) e não é um quarto lugar. "‹ Hoje" volta ao dia e a sessão
  continua aberta.
- **Semanas** é para usar sentado, sem pressa, também no notebook (F50, U14).
  Mostra as semanas de domingo a sábado (F211) lado a lado: peso médio e
  variação, dias de comida conhecidos, sessões, séries por músculo contra a
  prioridade (F177, F178) e força (F175). Traz também a saída da regra do
  nutricionista com os números que a produziram (F215), o passo de ±150 kcal
  pronto para aplicar no arroz (F218), as fotos em comparação longa (F230) e a
  avaliação visual quando há par válido (F220). É o lugar do desejo D3.
- **Prescrição** reúne o que vem de fora: o programa pessoal e o do treinador,
  com as diferenças e a restauração (F160–F166); o plano alimentar e a base de
  alimentos (F184, F206, F207); as regras escritas; o repertório; as fotos de
  aparelho (F224); as aulas guardadas (F135); as compras (F203); e os dados deste
  aparelho (conta, sincronia, cópia de segurança, F240–F253).

**Por que tempo e não assunto.** O uso real cruza assuntos no mesmo minuto.
Entre séries ele marca água, confere a comida e põe o peso (F30, K6): 7 de 11
pesagens entraram no registro entre 6:28 e 7:52, na academia (P1). O pré-treino
das 5:45 e a sessão das 6:15 são vizinhos. O pôr em dia mistura sessão, pesagem,
descanso, aula e comida (U11). Abas de Treino, Comida e Corpo espalhariam o
mesmo dia por três lugares e dariam ao pôr em dia três caminhos.

### 3. Como o agora escolhe

Na ordem:

1. Sessão aberta: a série da vez.
2. Sessão de ontem não encerrada: um cartão para confirmar o fim, que não bloqueia nada.
3. Refeição do plano sem marca, com horário entre 45 min à frente e 3 h atrás:
   essa refeição.
4. Manhã de dia de treino, sem sessão: começar o próximo da sequência (F81).
5. Dia de fotos, de manhã (14 dias desde a última, F226): a sessão de fotos.
6. Nenhum dos anteriores: o próximo previsto.

Errar o agora custa pouco, porque o roteiro está logo acima e qualquer linha
está a um toque. O lápis usa o horário do plano (F181), deslocado pela regra do
horário do treino (F189, F190). Ele come o lanche às 15:30 e o plano diz 16:00
(K4); a janela do agora absorve essa diferença.

### 4. Pendências, nunca no meio do esforço

O que ficou a lápis e pesa numa regra ou numa decisão entra numa fila curta no
topo de Hoje:

- sessão não encerrada (F34, F152);
- mudanças do dia esperando decisão (F159);
- dia de comida incompleto dentro dos 14 (F213);
- semana com menos de 2 pesagens (F211);
- par de fotos esperando avaliação (F220);
- dor marcada no mesmo exercício em duas sessões seguidas (F172), com a regra
  do treinador (F102);
- passo de ±150 indicado pela regra (F212).

As pendências nunca abrem por cima da tela e nunca aparecem dentro da sessão.
Elas surgem nos momentos calmos: na abertura antes do treino (9 de 12 sessões ao
vivo começaram antes do aquecimento, P1), em Hoje e em Semanas.

### 5. O toque grava e diz que gravou

Não existe botão "salvar". Cada toque grava neste aparelho na hora e mostra
"gravado". O que falha mostra "não gravado" na própria linha, com texto e borda,
e fica na tela até gravar (F294, F296). O inverso do toque é a **correção**, e
não a confirmação: toda linha a tinta se abre com um toque. Na comida, o aviso
de gravado traz também "Desfazer".

### 6. Números sem o teclado do sistema

Carga, repetições, RIR, peso, cintura e copos são escolhidos em botões em volta
do valor provável. Quando não há valor provável, entra o teclado do próprio app:
tem vírgula (F63), teclas grandes, não dá zoom (F61), não sobe por cima do
conteúdo (F66) e não cobre metade da tela (F65). Texto livre (nota, nome de
exercício) usa o teclado do sistema, sentado, em campo de 16 px ou mais.

### 7. Restrições do aparelho resolvidas no modelo

- **Sem rede** é o estado normal na academia. Aparece numa linha cinza ("Sem rede
  · tudo gravado neste aparelho") e nunca como erro (F25, F72, F248).
- **App suspenso:** todo tempo é calculado pelo relógio do aparelho a partir de
  instantes gravados (F57). Voltar do WhatsApp não perde nada.
- **Som e vibração** nunca são o único sinal (F58, F59).
- **Voltar do sistema:** a sessão é uma camada a mais. Voltar leva a Hoje com a
  sessão aberta, e o app nunca fecha no meio de uma série (F69, F294).
- **Paisagem:** a tela se reorganiza em duas colunas (F60).
- **Topo e base** ficam reservados ao sistema (F68). A área de toque termina
  acima do indicador de início.
- **Modo privado, espaço esgotado, endereço novo:** cada um tem uma tela que diz
  a causa e o caminho (F53, F55, F56).
- **Versão nova:** uma linha discreta em Hoje, "versão nova pronta, vale na
  próxima abertura", e o número da versão sempre visível em Prescrição › Este
  aparelho (F70, F298).
- **Fotos antigas sem rede ou sem conta:** cada foto diz em texto o seu estado:
  presente, na cópia remota (baixar), sem conta, ou busca que falhou (tentar de
  novo) (F238). Nada fica "carregando" para sempre (F297).

### 8. Acessibilidade como estrutura

- **Alvos:** 44 pt no mínimo em tudo. Os botões de repetição medem 64 pt de
  altura, com 6 pt entre eles, porque a mão está suada (F28) e a proteção contra
  o toque errado é a correção, não a confirmação.
- **Nenhum estado só por cor:** o lápis é tracejado e diz "previsto"; a tinta é
  preenchida e mostra o valor; a hachura é listrada e diz "sem marca"; o erro tem
  borda e diz "não gravado".
- **Contraste:** texto com 4,5:1 ou mais, no tema claro e no escuro. O tracejado
  do lápis tem 3:1 ou mais contra o fundo. O texto sobre a hachura tem fundo liso.
- **Leitor de tela:** cada botão diz o que grava ("10 repetições, gravar"). Cada
  gravação é anunciada ("Série 2 gravada neste aparelho").
- **Texto maior do sistema:** as fileiras de botões quebram em duas linhas; nada
  depende de largura fixa.
- **Movimento:** as transições são curtas e somem com "reduzir movimento".
- **Gestos:** nada depende de pinça nem de toque duplo (F62).

As necessidades de acessibilidade do próprio dono não são conhecidas (01-fatos,
"O que este arquivo não sabe"). Esta lista é o piso para qualquer usuário (P3, D8).

### 9. Cada tarefa do 01-fatos, e onde ela mora

| tarefa | onde | como |
|---|---|---|
| Começar a sessão, antes do aquecimento ou na 1ª série (F152) | Hoje › agora | "Começar agora", ou tocar direto nas repetições da 1ª série |
| Registrar a série: carga, repetições, RIR opcional (F137) | Sessão | Momento 1 |
| Série além das prescritas (U5, P12) | Sessão | linha tracejada sob a última série |
| Pular exercício (F153, F154) | Sessão › ··· | "Pular", motivo opcional; vira linha "pulado" |
| Trocar por substituto (F106–F110, F224) | Sessão › Trocar | indicados pelo treinador primeiro, com a frase do que muda e a foto do aparelho desta academia; quem trocou da última vez aparece primeiro |
| Mudanças só do dia (F159) | Sessão › ··· | gravam na sessão; tornar permanente vira pendência, em casa |
| Dor pontual (F150, F172, F102) | Sessão › ··· › Dor | três pontos; repetida em duas sessões, vira pendência com a regra |
| Aproximação, deload, pausa, nota (F150, F152, F173) | Sessão | aproximação no 1º exercício pesado; deload ao começar; pausa e nota no ··· |
| Encerrar (F152) | Sessão | opcional; a sessão fecha sozinha na última série e o fim se confirma na abertura seguinte |
| Cardio (F46, F47) | Hoje | linha a lápis depois do A e do D; modalidade, minutos e intensidade em botões |
| Aula de HYROX (F118–F136) | Hoje | linha a lápis "aula"; "Fui" marca presença; o detalhe é opcional: importar o arquivo da lousa (se recusado, diz o motivo, F132) e, por movimento, a última carga usada (F123, P4) |
| Treino fora da prescrição (F155) | Hoje › + | presença, grupos, nome, duração |
| Treino em data passada, dia de descanso, apagar e corrigir (F156, F158, F295, U12) | Hoje › dia passado | o mesmo roteiro; cada linha se abre |
| Pesagem (F42, F208) | Hoje, e a folha "Dia" na sessão | teclado do app; data de hoje por padrão; dia passado pelas setas |
| Cintura e medidas novas (F210, D1) | Hoje › + Medida | centímetros, teclado do app |
| Bioimpedância (D2) | Hoje › + Medida, uma vez por mês | quais números é pergunta |
| Fotos do corpo (F226–F235, F45) | Hoje › agora, no dia previsto | o telefone fica a 3 m, com a tela virada para longe dele: a sessão é guiada por voz e som, ligados pelo toque de início (F58), e a pose aparece em letra grande |
| Ajuste, comparação e avaliação visual das fotos (F220, F229–F231) | Semanas › Fotos | comparação longa por padrão (F230) |
| Passo de ±150 kcal (F212–F219) | Semanas › Regra do nutricionista | a saída com os números; "aplicar" mostra o arroz antes e depois |
| Sinal de força à mão (F223) | Semanas › Força | quando o cálculo está cego |
| Refeição, porção, água, como foi o dia (F195) | Hoje | Momento 2 |
| Tipo do dia, alta demanda, horário do treino (F187, F189) | Hoje, no cabeçalho | etiqueta "palpite" enquanto não há sessão |
| Plano, alimentos, restaurar (F206, F207) | Prescrição › Plano | sentado |
| Compras (F203–F205, D6) | Prescrição › Compras | por categoria de compra; marcar comprado |
| Programa: editar, comparar, restaurar, criar treino, reordenar, cadastrar e renomear exercício, histórico, regra das 6 a 8 semanas (F98, F160–F165) | Prescrição › Programa | em casa, também no notebook |
| Conta, sincronia, cópia de segurança, restaurar, apagar histórico (F240–F253) | Prescrição › Este aparelho | — |
| Força, séries por músculo, comparações, padrões de comida (F175–F179, F201, F202) | Semanas | — |

**Nenhuma tarefa fica de fora.** Nesta entrega, cinco partes estão descritas mas
não desenhadas: a aula, a sessão de fotos, Semanas, Prescrição e a tela larga do
notebook.

---

## Os dois momentos

### M1 · Entre duas séries, na academia, com o relógio contra — `momento-1.html`

**O caso, em toques.** Ele desbloqueia o telefone; o desbloqueio é do iOS, e o
app já está na série. Depois toca "10". **No app, é um toque.** O RIR, se ele
quiser, é mais um, durante o descanso. A volta do WhatsApp custa zero toques. A
série extra custa dois: a linha tracejada e o número.

**O que a tela mostra, de cima para baixo.** Primeiro, a linha de rede ("sem
rede · tudo gravado neste aparelho"). Depois, o progresso das 20 séries, agrupado
por exercício, e o fim previsto. O fim é calculado pela prescrição (descanso
prescrito mais uns 45 s por série) e mostrado também com o cardio de segunda:
"~7:22 · com o cardio de hoje, ~7:45". O app não sabe da hora-limite das 7:40
(pergunta 1); ele vê os dois números e decide. Em seguida vem o exercício, com a
série 1 a tinta e a 2 como "agora". Por último, a lista do que falta, com a
prioridade do treinador, que é o critério dele para cortar exercícios (P2, F15).
Embaixo, onde o polegar alcança, ficam a carga igual à da última vez e sete
botões de repetição em volta da última marca. Os botões do alvo têm borda cheia;
os de fora, tracejada.

| # | estado | o que resolve |
|---|---|---|
| 1 | Caso base (funciona ao toque) | um toque grava (F170, F171, F95) |
| 2 | Gravada | o descanso conta para cima a partir do instante gravado (F97); RIR oferecido na linha, sem cobrança (F137); próxima série a lápis; aviso de subir carga com o RIR da última sessão ao lado, porque o cálculo não confere o RIR (F168, F169) |
| 3 | Volta de outro app aos 2:12 | descanso recalculado pelo relógio; passou do lembrete muda de cor e de texto, sem alarme (F57, F58, F97) |
| 4 | Série extra | dois toques; marcada "extra, só hoje"; tornar permanente fica para casa (U5, P12, F159) |
| 5 | Toque errado (11 em vez de 10) | correção no mesmo lugar, um toque; apagar fica longe dos números (F28) |
| 6 | Vazio: substituto nunca feito | sem histórico não há lápis; teclado do app com vírgula; fotografar o aparelho (F109, F110, F63, F224) |
| 7 | O dia no descanso | água, pré-treino e peso em meia tela, sem sair da sessão (F30, K6, U8) |
| 8 | Erro: não gravou | causa e saída na linha e no aviso; o treino segue (F55, F53, F294) |
| 9 | Abrindo, travado, endereço sem registros | abre sem rede; não fica carregando para sempre; vazio que não parece perda (F73, F273, F56) |
| 10 | Caso ruim: sessão nunca encerrada | fecha sozinha na última série; confirma-se na manhã seguinte; mudanças do dia preservadas; cardio de ontem hachurado (F34, F293, F280, K7) |
| 11 | Paisagem | duas colunas, ler à esquerda e tocar à direita (F60) |

### M2 · Depois de comer, no meio do dia — `momento-2.html`

**O caso, em toques.** O lanche das 15:30: ele abre o app, e o agora já é o
lanche. "Comi tudo". **É um toque.** No dia seguinte, refazendo de memória:
"Completar ontem", "Metade" no almoço, "Não foi o do plano" no jantar e "Sei".
**São quatro toques.** A água fica "sem conta", com zero toques, porque é a
verdade.

**O que a tela mostra.** No topo, os 14 dias da regra (11 em 14), em tinta e
hachura. É a consequência na língua do nutricionista, e não uma sequência a
manter. Abaixo vêm a água e o roteiro do dia. Embaixo fica o agora, com os itens
do plano, a nota do nutricionista e o botão de um toque, para a mão que não
segura a comida.

| # | estado | o que resolve |
|---|---|---|
| 1 | Caso base (funciona ao toque) | um toque; o almoço que passou aparece hachurado e não em vermelho (F181, F182, F198) |
| 2 | Marcado | aviso de gravado e "Desfazer"; o almoço pendente é perguntado uma vez, com "Depois" (F199, F296) |
| 3 | Outra coisa | três saídas, cada uma com a consequência escrita antes do toque; "não sei quanto" mostra o 9 → 8 (F195, F200, F292) |
| 4 | No dia seguinte | a pendência de ontem não bloqueia o almoço de hoje (U11, P1) |
| 5 | Ontem, de memória | o mesmo roteiro; cada toque grava; o rodapé diz "terça conta para a regra" (F195, F197, F199) |
| 6 | O dia ainda é palpite | dia de treino ou descanso como palpite, trocável; horário do treino move o pré e a refeição dentro do treino (F187, F189, F190) |
| 7 | Vazio | 1 dia em 14, o retrato do registro real; a regra parada em "não mexer e registrar mais" (P1, F212) |
| 8 | Sem plano; abrindo | sem plano não há lápis: restaurar o do nutricionista ou trazer da cópia (F271, F207); abertura local |
| 9 | Erro: não gravou | nenhum toque fica sem resposta (F296, F55) |
| 10 | Caso ruim: cinco dias depois, "não sei quanto" | escolher o dia numa fileira, sem a roda de data (F67); o dia sai da conta, 10 → 9, com "Desfazer" (F200, F292) |

**Dois ajustes honestos ao dado que existe.**

- "Não foi o do plano" grava o que o produto guarda: o estado do dia, "saiu e
  sei" ou "saiu e não sei" (F195). A refeição fica sem marca. Na hora a linha
  mostra "não foi o do plano"; depois de reabrir, mostra "sem marca", e o dia
  mostra "saiu do plano". Guardar qual refeição saiu é a pergunta 2.
- A água sem nenhum copo marcado aparece como "sem conta", e não como "0". Ninguém
  passa o dia sem beber água, e a regra trata o dia sem água como sem marca
  (F198).

---

## O que esta direção recusa, e o que isso custa

1. **O teclado do sistema para números.** Custo: uma carga fora do comum pede o
   teclado do app, com um toque a mais para abri-lo. Quem usa leitor de tela
   encontra um teclado que não conhece. Não dá para colar um número.
2. **Encerrar a sessão como obrigação.** Custo: em quase metade das sessões a
   duração fica aproximada, só até a última série (F152). O sinal de fadiga
   "sessões passando de 90 min" (F101) fica menos confiável, e a mediana já
   aparece puxada para baixo (K1).
3. **Decidir o programa na academia.** As mudanças do dia vão para a pendência,
   em casa. Custo: se ele nunca decidir, o programa fica como estava, e a próxima
   sessão do mesmo treino volta a propor a máquina original. O atenuante é que o
   "Trocar" mostra primeiro a troca da última vez.
4. **Presumir comida.** Nada vira tinta sem um toque, e não há um botão "comi o
   plano todo" com as refeições fora de vista. Custo: o dia em que ele não abre o
   app continua não sabido e a regra continua parada. O produto também não tem
   como lembrar sozinho: lembrete fora do app exigiria servidor, que ele não tem
   (F11).
5. **Contagem regressiva, alarme e vibração no descanso.** Custo: nada avisa que
   o descanso acabou. Quem quer um bip não tem.
6. **Sequência de dias, pontos, medalhas e vermelho de julgamento.** Custo: o app
   não dá nenhum empurrão de motivação além da regra e da evolução em Semanas.
   Uma contagem de dias seguidos, de qualquer forma, zeraria todo domingo (F22).
7. **Abas por assunto.** Custo: quem procura "Comida" como lugar não acha. A
   lista de todas as pesagens fica em Semanas › Peso, e não numa aba Corpo.
8. **Adivinhar o horário pessoal das refeições.** O lápis segue o plano. Custo:
   ele vê "previsto 16:00" quando come às 15:30.

---

## Duas direções consideradas e descartadas

### A · O cronômetro manda

A sessão giraria em torno de uma contagem regressiva grande: o app diria quando
voltar, com som. A comida teria lembretes nos horários do plano. Parecia servir
ao descanso prescrito (F29, F92).

**Descartada** porque falha exatamente nas condições medidas do Momento 1.
Celular bloqueado com música e WhatsApp na frente (P3) param o app (F57). O
Safari não vibra (F58). Manter a tela acesa falha sem aviso antes do iOS 18.4, e
a versão do aparelho não é conhecida (F59). Lembrete de comida com o app fechado
exige servidor (F11). E o treinador diz o contrário do que um cronômetro ensina:
o tempo é lembrete, não ordem, e o critério é voltar quando der para fazer outra
série de qualidade (F29, F97).

### B · O diário da noite

O app seria um diário único. Na academia, só anotações rápidas; à noite, uma
revisão juntaria séries, comida, água e peso. Parecia servir à única forma medida
da comida, que é de memória (U11, M2), e ao desejo de rever as semanas (D3).

**Descartada** por três motivos. Primeiro, a série precisa de carga × repetições
exatas e da referência da última sessão no instante em que acontece (F94, F170).
Refazer 16 séries de memória perde justamente o dado em que a progressão se apoia
(F95, F168). Segundo, nada indica um momento fixo à noite: as marcas medidas
foram às 13:41 e às 17:23, um e quatro dias depois (P1). Terceiro, um ritual que
falha perde o dia inteiro de uma vez. A Direção C fica com a parte boa da ideia:
refazer de memória é a mesma tela de marcar na hora, a qualquer hora.

---

## Perguntas que esta direção não responde sozinha

Para cada pergunta: o que se ganha, o que se perde, e a versão desenhada, que não
depende da resposta.

1. **Hora-limite pessoal e opcional** (por exemplo, "preciso sair às 7:40"). É
   dado novo.
   - Ganha: a sessão mostraria o que cabe e onde o cardio estoura.
   - Perde: é mais um ajuste por usuário, e a linha pode virar pressão.
   - Desenhado: fim previsto com e sem cardio, e ele compara de cabeça (M1, estado 1).
2. **Guardar qual refeição saiu do plano.** É dado novo por refeição, com
   conversão de formato (F254).
   - Ganha: os padrões por refeição (F201) ficariam verdadeiros.
   - Perde: um formato novo e um estado a mais por refeição.
   - Desenhado: grava o estado do dia e deixa a refeição sem marca (M2, estados 3 e 5).
3. **Separar "não comi" de "esqueci".**
   - Ganha: a adesão do dia ficaria mais justa (F199).
   - Perde: mais um estado e mais um toque.
   - Desenhado: os dois ficam sem marca.
4. **Ceia.** O plano não tem ceia obrigatória (F182), e ele às vezes come uma
   (P5). Marcá-la como "saiu do plano, sabendo" é verdadeiro, mas tira o dia de
   "seguiu o plano". É assunto do nutricionista (F2).
   - Desenhado: sem linha de ceia.
5. **Porções além de tudo e metade.** O F195 cita 1 e 0,5.
   - Ganha: precisão.
   - Perde: uma escolha a mais em todo toque.
   - Desenhado: tudo e metade.
6. **O lápis no horário real dele** (15:30 em vez de 16:00).
   - Ganha: o agora acertaria mais.
   - Perde: o horário do nutricionista deixa de ser a referência visível.
   - Desenhado: horário do plano com janela larga.
7. **O previsto que não acontece** (o cardio: 0 de 16 em oito semanas, U6).
   Ele prefere ver a linha hachurada a cada dia previsto, ou que ela suma no fim
   do dia?
   - Ganha: honestidade.
   - Perde: pode parecer cobrança.
   - Desenhado: hachura discreta, sem vermelho.
8. **"Comi o plano todo hoje" em um toque.**
   - Ganha: o dia chegaria à regra com um toque.
   - Perde: abre o risco de declarar o que não aconteceu, que é o que a regra
     precisa evitar (F292).
   - Desenhado: um toque por refeição, e a refeição pendente perguntada logo
     depois de cada marca.
9. **Mudanças do dia decididas só em casa.** Hoje o produto pergunta ao fim da
   sessão (F159), e esta direção tira a pergunta da academia. Ele aceita?
10. **Medidas novas.** Quais números da bioimpedância (D2)? Com que frequência as
    medidas com fita (D1)? Sem resposta, a direção traz a cintura e o braço em
    centímetros, sem previsto a lápis até haver frequência.
