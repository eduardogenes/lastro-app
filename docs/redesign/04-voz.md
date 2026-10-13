# 04 · Voz e palavras

Quem escreve é C4. Mandato: propor, do zero, como este produto fala, e depois
escrever as palavras dos dois momentos de cada direção sobrevivente (C e D),
incluindo os casos ruins e as três exigências do projeto.

**O que não está aqui.** Não escolho entre C e D: as duas recebem o mesmo
tratamento e o mesmo número de estados. Não mexo em layout e não proponho tela:
onde uma palavra verdadeira não cabe no espaço que o desenho dá, eu digo que não
cabe e paro ali (§11). Nenhum tom foi herdado: as oito regras da §2 saem de quem
usa, de quando usa e do que está em jogo, e cada uma aponta a prova.

**Fontes.** F = `01-fatos.md`. U, K, D, M = `02-uso.md`. P = resposta do dono em
`02-perguntas.md`. "Conta minha" = aritmética sobre números citados ao lado.
**Não medido** marca o que não tem medida nenhuma.

**Como medi o que cabe.** Contei caracteres contra a largura do contêiner
calculada do CSS de cada desenho, na viewport de 414 pt (F49), usando 0,52 em de
avanço médio na fonte do sistema e 0,58 em no negrito. **Não rodei os desenhos
num aparelho.** Onde a conta ficou a menos de 10% da borda, escrevi "no limite".
As duas listas de §11 separam o que não cabe das minhas palavras (Lista A, a que
eu conto) do que já aperta nas palavras do desenho (Lista B).

---

## 1 · De onde esta voz sai

Seis fatos do uso decidem o tom antes de qualquer gosto.

1. **O produto não prescreve nada.** Ele executa duas prescrições feitas fora
   dele, por um treinador e um nutricionista que são agentes de IA do próprio
   dono (F1, F2). Logo o app não tem autoridade sobre treino nem sobre comida, e
   não pode falar como quem tem.
2. **A situação mais frequente acontece contra o relógio, de pé e com uma mão.**
   48 séries registradas por semana (P1-B), cerca de 16 por sessão, no descanso
   de 1:30 a 3 min (F29) que ainda divide espaço com água, comida e peso (F30),
   suado (F28), com o celular bloqueado, música tocando e WhatsApp na frente
   (P3, F57), e hora-limite por volta de 7h40 (P2). O orçamento de leitura por
   interação é um relance.
3. **A situação de maior falha medida não falha por dificuldade: falha por não
   acontecer.** 1 dia com refeição marcada em 22 (P1), 95% de falha, numa
   situação sentada e sem pressa física (F40, P5). O dono: "eu tenho muita
   dificuldade em salvar o que eu fiz" (P5).
4. **O registro alimenta uma regra que mexe na comida dele.** A regra do
   nutricionista precisa de 11 dos últimos 14 dias com consumo conhecido (F213) e
   já cortou comida por dado que ninguém declarou de verdade (F290, F292). Dado
   inflado custa caloria, não custa só precisão.
5. **O app não tem servidor, então não lembra ninguém de nada** (F11). Toda
   palavra que prometesse lembrete seria mentira.
6. **O app já falhou em silêncio.** Um toque que não fazia nada por quase sete
   semanas (F296), série perdida ao fechar (F294), carregamento infinito (F273),
   foto "sendo buscada" para sempre (F297). Silêncio é o modo de falha desta
   casa, e a voz tem que ser o antídoto.

Duas ausências que a voz respeita: as necessidades de acessibilidade do dono
**não são conhecidas** (01-fatos, "O que este arquivo não sabe"), e o produto
terá outros usuários (P3, D8). Então nada abaixo depende da rotina dele nem de
distinguir cor.

---

## 2 · As oito regras

### V1 · Quem manda se nomeia. O app não prescreve.

Toda instrução, alvo, limite ou regra aparece **atribuída** ao treinador, ao
nutricionista ou à prescrição. A voz própria do app se limita a três coisas: o
que ele fez, o que ele sabe e o que ele não sabe. Onde o autor de uma rotina é
desconhecido, o app **não inventa autor**.

*Motivo:* F1, F2 (o produto executa prescrição de terceiros; mudá-la é decisão
do dono). F93, F102, F93, F97 ("o tempo prescrito é lembrete, não ordem"). F266
(o treinador pediu que nenhum número dele fosse alterado). A rotina das 9 poses
não está atribuída a ninguém (01-fatos, ausências), por isso não ganha assinatura.

*Aceita:* "Treinador: apareceu dor de tendão, tirar este exercício por 2 semanas
e substituir por outro ângulo. Nunca empurrar por cima." · "a regra pede 11" ·
"no plano às 16h00" · "Duas semanas quase não mostram mudança: é água e sono."
(sem assinatura, porque o autor da rotina não é conhecido).

*Recusa:* "Você precisa descansar 2 minutos." · "Hora de treinar!" · "Beba mais
água." · "Recomendamos subir a carga." · "A rotina do seu treinador manda tirar
as fotos" (atribuição inventada).

### V2 · Todo toque diz onde guardou. O que não guardou diz que não guardou.

Nenhuma confirmação antes da gravação. Cada gravação boa diz o verbo e o
destino; cada gravação ruim fica **na linha do dado**, com palavra e forma, e
permanece até dar certo. Nenhum estado fica carregando sem prazo.

*Motivo:* F296 (sete semanas de toque sem efeito, sem erro), F294 (série perdida
ao fechar o app), F273 (carregando para sempre), F297 (foto buscada para
sempre), F240 (o aparelho é a fonte), F53/F55 (o armazenamento pode recusar).

*Aceita:* "Guardei neste aparelho · 45 × 10" · "Não guardei o lanche." · "Esperei
4 s. Nada foi apagado e nada saiu do aparelho." · "Tudo guardado neste aparelho".

*Recusa:* "Salvo!" · "Enviando…" sem fim · "Pronto ✓" antes da gravação · um
botão "Salvar" (o toque é a gravação) · sucesso que não diz onde.

### V3 · O não sabido e o estimado têm palavra própria. Nunca zero, nunca certeza falsa.

Três graus, três palavras. **Sem marca** (não há registro). **Desconhecido** (o
dia que a regra não pode ler). **Palpite / estimativa / aproximada / ~** (conta
do app que pode estar errada). Nenhum deles vira número redondo nem vira verdade.

*Motivo:* F198 ("é desconhecido, não zero"), F200, F213, F292 (o dia sem saber
quanto contou como registro e destravou um corte), F152 (duração aproximada
quando a sessão fecha sem ele), F187 (o tipo do dia é palpite enquanto não há
sessão), F193 (o fim é mediana das últimas sessões), F174 ("estimativa"), F211 (o
peso de um dia não decide nada), §8 de 02-uso (não se sabe se o cardio não
aconteceu ou só não foi registrado).

*Aceita:* "Almoço · sem marca" · "Água · não contei" · "Hoje ainda não tem
marca. Sem marca não é zero: o dia fica desconhecido." · "fim ~7h34 (estimado)"
· "cerca de 1h11, aproximada" · "Dia de treino, por palpite · mudar".

*Recusa:* "Água: 0 copos" · "Adesão: 0%" · "Almoço: não comido" · "Fim: 7h34" ·
"Duração: 1h11m32s" · "73.8" (F6: vírgula decimal).

### V4 · A consequência vem antes do toque, e vem em número.

Onde um toque muda o que uma regra vai decidir, o texto diz o que muda, com o
número, **antes**. Nenhum "tem certeza?".

*Motivo:* F215 (cada saída da regra vem com os números que a produziram), F212,
F213, F292, e a medida de que a regra está parada e o dono não sabe disso: 0
avaliações visuais e 0 passos aplicados (P1, U16); "não existe um momento de
rever as semanas" (P8).

*Aceita:* "Sem saber quanto, quarta deixa de contar para a regra: 9 dias
conhecidos passam a 8." · "Dias conhecidos nos últimos 14: 1. A regra pede 11." ·
"Pular é decisão: este exercício não volta como esperado hoje."

*Recusa:* "Tem certeza?" · "Esta ação não pode ser desfeita." · "Atenção!" · um
diálogo que pergunta sem dizer o que custa.

### V5 · Nem elogio, nem cobrança, nem placar.

Sem parabéns, sem sequência de dias, sem meta comemorada, sem vermelho de
julgamento, sem exclamação, sem emoji. O sujeito das frases de falha é o app ou
o dado, nunca ele.

*Motivo:* F22 (o descanso fixo de domingo zera qualquer contagem de dias
seguidos toda semana), F211, F290/F292 (pressão por número já produziu corte
errado), F2 (elogiar treino é da alçada do treinador, que não está nesta tela), e
a medida: 42% a 59% das sessões fecham sem ele (P1), 95% dos dias de comida sem
marca (P1). Uma voz que repreendesse isso repreenderia cerca de 20 vezes por
semana (conta minha).

*Aceita:* "Fechei o Treino A de ontem na última série · 6h20 → 7h31, cerca de
1h11, aproximada." · "+1 rep" ao lado do número · "Quarta só tem o lanche
marcado."

*Recusa:* "Parabéns, 3 dias seguidos!" · "Você esqueceu de encerrar." · "Não
desista!" · "Ops!" · "13 dias perdidos" · "Pôr em dia" como nome de lugar (nomeia
uma dívida; §3.3).

### V6 · No esforço, um relance: o rótulo é o verbo e a coisa que ele grava.

Na zona do polegar, nada passa de uma linha e de três palavras. Prosa fica
acima, onde ler é opcional. O rótulo diz o que o toque grava, não o que a tela
faz.

*Motivo:* M1 inteiro: ~16 registros por sessão (P1-B), descanso compartilhado
(F30), de pé, suado, uma mão (F28), aparelho que bloqueia e outro app na frente
(P3, F57), hora-limite (P2). O dono pede "na hora do treino pode ficar mais
limpa" e recusa "fluxos muito dificultosos".

*Aceita:* "Comi tudo" · "+ 1 série, só hoje" · "Pular" · "Máquina ocupada" ·
"Fui" · "Está certo".

*Recusa:* "Confirmar registro da série" · "Deseja adicionar uma série extra a
este exercício?" · texto explicativo dentro da régua de repetições · "Salvar e
continuar".

### V7 · O nome é o do mundo dele. Nada de jargão novo, nada de abreviar o que ele não abrevia.

As palavras da prescrição passam intactas: RIR, deload, bi-set, Treino A,
"Pulldown unilateral", "Elevação lateral unilateral no cabo". As palavras do app
são português comum: carga, repetições, descanso, peso, copo, foto. O app não
renomeia o que o treinador nomeou, não abrevia o que ele não abreviou, e não
cunha palavra que o dono tenha de digitar.

*Motivo:* F110 (o exercício é definido pela máquina da academia dele), F111
(nomes prescritos de 7 a 43 caracteres, alguns ambíguos), F263 (as revisões
chegam com nomes diferentes para o mesmo exercício), F117 (renomear muda só o
nome exibido), F124 (a lousa do box abrevia; ele não), F64 (acento com uma mão
suada não acontece), F259/F287 (a busca ignora acento mas não corrige
digitação). E a palavra do dono vence a minha: "evolução" é dele (P6, P8).

*Aceita:* "RIR 1 · alvo" · "Extensão de tríceps acima da cabeça no cabo" ·
"Bioimpedância · uma vez por mês" · "Evolução".

*Recusa:* "Reps" · "Vol." · "Extensão de tríceps no cabo" (encurta um nome
prescrito) · "Intensidade percebida" no lugar de RIR · "Check-in da refeição" ·
"Treino de Empurrar" para o Treino A · "Antropometria".

### V8 · A pessoa é "você". O app é "eu" só sobre o que ele fez no registro. Os botões de declarar falam na voz dele.

Três vozes, sem mistura:
- **o app em primeira pessoa**, e só sobre os próprios atos no registro:
  guardei, não guardei, fechei, esperei, li, busquei;
- **impessoal** para tudo o mais que o app afirma: "sem marca", "a regra pede
  11", "no plano às 16h00";
- **primeira pessoa do dono nos botões que declaram um fato do corpo ou do
  dia**: "Comi tudo", "Metade", "Não sei quanto", "Fui", "Sei o que comi".

Nunca "nós": não há equipe nem serviço do outro lado (F5, F9, F11).

*Motivo:* F5 (há um usuário e ele mantém o código), F9/F11 (não há outra parte),
F240 (o registro mora no aparelho — nomear o agente evita que a culpa caia na
rede), F195 (os estados do dia são declarações dele: "seguiu o plano", "saiu do
plano mas sabe o que comeu"). O limite da primeira pessoa é V1: o app nunca diz
"eu" sobre o corpo, a comida ou o treino, porque nessas coisas ele não é ninguém.

*Aceita:* "Não guardei o lanche." · "Fechei na última série." · "Comi tudo" ·
"Não contei".

*Recusa:* "Nós guardamos sua série." · "Eu acho que você deveria subir a carga."
· "Seu registro foi salvo pelo sistema." · "Vamos lá!"

---

## 3 · O nome das coisas

### 3.1 · Os estados do registro

| coisa | palavra | por quê |
|---|---|---|
| unidade prevista sem registro | **sem marca** | É a ausência do registro, não do ato. Pareia com o verbo "marcar" que a refeição e a água já usam. F198, F200, F153 ("não feito = ausência de registro") |
| o dia que a regra pode ler | **dia conhecido** | A regra conta "dias com consumo conhecido" (F200, F213). Usar a palavra da regra evita a confusão que os dois desenhos tiveram de explicar: um dia com **uma** refeição marcada já é conhecido |
| o dia que a regra não pode ler | **desconhecido** | Palavra literal de F198 ("é desconhecido, não zero") |
| exercício que ele decidiu não fazer | **pulado** | É decisão declarada e não volta a ser esperado (F153, F154). Palavra diferente de "sem marca" porque o dado é diferente |
| água sem contagem | **não contei** | Ninguém passa o dia sem beber; o que falta é a conta (F194, F198). Água marcada em 2 dias no máximo (P1) |
| a ignorância dele sobre o que comeu | **não sei quanto** | Terceiro estado do dia, em F195, na voz dele (V8) |
| gravar no aparelho | **guardar** → "Guardei neste aparelho" | F240, F56: o destino importa. "Salvar" fica recusado porque nomeia um botão que não existe (V2) — embora seja a palavra do dono em P5 |
| o acervo | **o registro** | F240 ("o registro deste aparelho") |
| o ato dele sobre uma unidade prevista | **marcar** | F195, F198 |
| o ato dele sobre um dia inteiro | **dizer como foi** | F195 chama o campo de "como o dia foi", com três estados. É a frase do próprio dado |

### 3.2 · As três origens, que nunca usam a mesma palavra

Os dois desenhos põem num só traço duas coisas de origens diferentes: o que
**alguém prescreveu** e o que **ele mesmo registrou na última vez**. Como V1 só
atribui a primeira, as palavras separam as três origens:

| origem | palavra | exemplo | prova |
|---|---|---|---|
| prescrição | **no plano** (comida) · **na prescrição** / **do treinador** (treino) | "no plano às 16h00 · 819 kcal" · "na prescrição: 2 × 8–12 · RIR 1 · descanso 2:00" | F181, F80–F92 |
| histórico dele | **igual à última** · **última (21/09): 37,5 × 9** | "Carga 45 kg · igual à última" | F170, F171, F95 |
| conta do app | **~** · **estimado** · **aproximada** · **palpite** | "fim ~7h34 (estimado)" | F193, F152, F187, F174 |

**"Previsto" sozinho fica recusado**: não diz de quem, e o app de fato faz
previsões próprias (F193), que V3 obriga a marcar como estimativa. Onde o
desenho escreve "previsto · 819 kcal", a string passa a ser "no plano · 819
kcal" — mesmo comprimento, com autor.

### 3.3 · Os lugares

| direção | nome | decisão |
|---|---|---|
| C | **Hoje** | Mantido. Em dia passado o título carrega a data e a aba passa a significar destino ("voltar para hoje") |
| C | **Semanas** | Mantido: a semana da regra é de domingo a sábado (F211) |
| C · D | **Prescrição** | Mantido: é exatamente o que vem de fora (F1, F2) |
| D | **Agora** | Mantido (V6: é a próxima coisa a fazer) |
| D | **Dias** | Mantido |
| D | **Evolução** | Mantido **porque é a palavra do dono**: "quero registrar essa evolução" (P6), "eu gosto de acompanhar esse tipo de evolução" (P8). V7: a palavra dele vence a minha |
| C · D | **Corpo** | Nome novo, da exigência E2 (§4.2) |
| C · D | **Os 14 dias da regra** | Substitui "Pôr em dia" como **nome de lugar**: "em dia" nomeia uma dívida e apareceria em 13 das 14 células (V5). "Pôr em dia" sobrevive só como verbo numa linha de atalho |

### 3.4 · Palavras recusadas, com motivo

"pendente" e "pendência" (nomeiam dívida; o dado é "sem marca") · "faltou",
"esqueceu", "atrasado" (V5) · "progresso" como nome de lugar (é veredito, e o
veredito é do treinador — V1) · "meta batida", "sequência", "ofensiva" (F22) ·
"sincronizando" como estado permanente (F248: sem rede é silencioso) · "sem
rede" como letreiro fixo (F25: é o estado normal do subsolo; a frase só aparece
onde a rede é de fato necessária — foto na cópia remota, conta, atualização:
F238, F241, F70) · "erro inesperado" (F273, F296: o app precisa dizer a causa
provável e a saída) · "0" onde o dado é desconhecido (V3).

---

## 4 · As três exigências

Nenhuma das duas direções tem estas palavras escritas: a E1 porque as duas
recusam explicitamente perguntar ao fim da sessão, a E2 e a E3 porque nenhuma
nomeou o lugar nem a marca. As palavras abaixo são minhas.

### 4.1 · E1 · A decisão de tornar permanente uma mudança do dia

**Onde:** ao encerrar o treino, depois da última série; e, se a sessão fechou
sozinha, na abertura seguinte. Mais um atalho discreto na tela do dia.

**Conflito registrado, não resolvido por mim.** C recusa "decidir o programa na
academia" e D recusa "perguntar qualquer coisa sob o relógio". A exigência manda
o contrário. Escrevi as palavras da exigência; a recusa das direções continua
escrita nos documentos delas, e quem resolve isso é o dono. O dado já funciona
assim: F159 diz que "ao fim da sessão, cada mudança pode virar permanente ou
não, com um motivo opcional", e F280 registra o erro de descartar as mudanças
sem ele decidir.

**Três condições de voz, que saem do uso:** duas palavras por botão e nenhum
teclado no fim do treino (V6; P2, F64); a consequência antes do toque (V4); e a
pergunta tem de sobreviver a não ser respondida, porque 42% a 59% das sessões
fecham sem ele (P1).

| onde aparece | o que está escrito | por quê |
|---|---|---|
| Fim do treino · título | **2 mudanças só de hoje** | Conta neutra, sem veredito (V5). F159 |
| Fim do treino · subtítulo | **Cada uma fica só hoje, ou entra no Treino A.** | As duas saídas ditas antes do toque (V4). F159 |
| Fim do treino · linha da mudança | **Pulldown unilateral · 3 séries, não 2** | O nome prescrito intacto (V7, F111) e a mudança em números |
| Fim do treino · consequência | **Dorsal passaria de 10 para 11 séries na semana; o treinador prescreveu 10.** | F179 dá o método, F89 o número prescrito (conta minha). V4. **Precisa de 2 linhas; o desenho dá 1** (Lista A, §11) |
| Fim do treino · botão | **Só hoje** | A mudança já está guardada na sessão de qualquer forma (F159): este botão não descarta nada |
| Fim do treino · botão | **Entra no Treino A** | Nomeia o destino, que é a informação que falta: a próxima vez daquele treino volta sem a mudança se ele não decidir (F160, F162) |
| Fim do treino · segunda linha | **Tríceps corda no lugar do Pushdown · só hoje** | F106, F159 |
| … sua consequência | **O histórico fica no exercício que você fez, não na posição.** | F151: é o medo que a frase desarma. 58 car. ✓ |
| Fim do treino · saída | **Decido depois** | Sem decidir, nada se perde (F159) |
| … sua consequência | **Sem decidir, fica só de hoje e espera em Hoje.** (C) / **… e espera no Agora.** (D) | V4 e o nome do lugar de cada direção |
| Fim do treino · depois do toque | **Entrou no Treino A: Pulldown unilateral com 3 séries. Guardei neste aparelho.** + **Desfazer** | V2, V8. F163 (a mudança fica registrada com data, treino e descrição) |
| Atalho na tela do dia | **Mudanças só do dia: 2 · decidir** | Uma linha, sem borda e sem cor de alarme: o "discreto" da exigência é de palavra também (V5) |
| Atalho · subtítulo | **do Treino A de ontem** | Diz de qual sessão, porque pode haver mais de uma (F157) |
| Atalho · motivo | **Por quê? (opcional)** | F159, F163. Só aqui, nunca no fim do treino: é teclado do sistema, e a hora do treino fica limpa (F64, P2) |
| Sessão que fechou sozinha | **Fechei o Treino A de ontem na última série.** · **6h20 → 7h31 · cerca de 1h11, aproximada** · **Está certo** / **Corrigir o fim** | V8 (o agente é o app, não ele), V3 (aproximada), F152, F293, F295, K7 |
| … e a E1 em seguida | **2 mudanças de ontem ficaram só do dia.** + **Decidir** | F280: elas não se perdem e não viram programa sem ele |
| Leitor de tela | "2 mudanças de hoje, por decidir. Pulldown unilateral, 3 séries em vez de 2. Dorsal passaria de 10 para 11 séries na semana. Botões: só hoje; entra no Treino A." | V2: o nome acessível diz o mesmo e mais a consequência, que na tela é visual |
| Nunca | "Deseja tornar esta alteração permanente?" · "Salvar no programa?" · "Você mudou o treino!" | Jargão de formulário (V7), botão que não existe (V2), veredito (V5). "Permanente" é a palavra do dado e aparece só em Prescrição › histórico (F163) |

### 4.2 · E2 · O lugar do peso, das medidas e das fotos

**O nome é Corpo.**

Cinco coisas dividem um assunto só: peso (F13, F208, F211), cintura e as medidas
novas com fita (F210, F43, F44, D1), bioimpedância uma vez por mês (D2), fotos
de 9 poses a cada 14 dias (F226, F236) e a avaliação visual de gordura (F220); o
peso e a cintura de cada sessão de fotos são a média daquela semana (F233).
"Corpo" é a palavra que a prescrição e os fatos já usam ("fotos do corpo", F226;
"o corpo dele em roupa justa", F236), tem cinco caracteres (cabe no rodapé de
três lugares de C, 138 pt por fatia, e no de quatro de D, 103 pt a 12 px — em D
seria uma quinta fatia, e isso é layout, não minha decisão), e não tem acento,
que é o que sobrevive à busca e à mão suada (F259, F287, F64).

*Recusados:* "Progresso" e "Evolução" como nome deste lugar (veredito, V5; e em
D "Evolução" já é a leitura das semanas, que inclui força e séries por músculo —
Corpo é onde o registro do corpo se faz e se compara) · "Medidas" (deixa as
fotos fora) · "Espelho" (metáfora; as fotos são prova, não vaidade) ·
"Composição corporal" e "Antropometria" (jargão que nenhum dos dois
profissionais usou) · "Minhas medidas" (possessivo com um usuário só, F5).

| onde aparece | o que está escrito | por quê |
|---|---|---|
| Lugar | **Corpo** | Acima |
| Seções | **Peso** · **Medidas** · **Bioimpedância** · **Fotos** | Quatro dados com regras diferentes (F208, F210/D1, D2, F226). "Bioimpedância" por extenso: é a palavra do dono (P6, V7) |
| Peso · linha | **Peso de hoje** · **última: 73,8 em 28/09** | F208, F13. Referência sem veredito |
| Peso · teclado | **Uma casa decimal: 736 fica 73,6.** | F208 (uma casa), F63 (vírgula), F275 (já recusou número válido) |
| Peso · a semana | **Média da semana: 73,5 · 4 pesagens** | F211: decide a média, não o dia |
| Peso · sem média | **A semana precisa de 2 pesagens para ter média. — regra do nutricionista** | F211, V1. 70 car. → 2 linhas ✓ |
| Peso · nunca | "Você ganhou 0,4 kg!" | F211, V5 |
| Medidas · sub | **cintura, braço · com a fita, em centímetros** | P6 ("comprei uma fita legal, dá pra eu medir o braço"), F210, D1 |
| Medidas · nota | **A fita erra de posicionamento mais do que a balança varia de água.** | F43: é por que a medida isolada não decide. 66 car. ✓ |
| Medidas · frequência | — sem previsto — | A frequência das medidas novas **não foi dita** (P6, D1): não medido. Sem "previsto" até haver número (V3) |
| Bioimpedância | **Bioimpedância · uma vez por mês** | D2. Quais números entram vai para §12 |
| Fotos · linha | **Fotos do corpo · 9 poses, a cada 14 dias** | F226 |
| Fotos · durante | **Próxima pose: perfil direito · 3 de 9** | F235 (a próxima é a primeira sem foto) |
| Fotos · instrução | **Gire 90° sobre a marca, lado direito para a câmera. Os pés continuam no T.** | F227 literal. A 3 m, em tipo grande (F45); se ele lê a essa distância **não foi medido** (P7 ficou sem essa parte) |
| Fotos · comparação | **A mais nova contra a mais antiga, mesma pose** | F229, F230 |
| Fotos · nota | **Duas semanas quase não mostram mudança: é água e sono.** | F230. **Sem assinatura:** o autor da rotina não é conhecido (V1) |
| Foto · estados | **está neste aparelho** · **está na cópia remota · baixar** · **sem conta neste aparelho: não há de onde buscar** · **a busca falhou · tentar de novo** · **nunca tirada** | F238, cinco estados, cinco palavras. F297: nada fica buscando para sempre (V2) |
| Foto · rede | **Esta foto está na cópia remota. Sem rede agora: dá para tentar quando houver.** | O único lugar onde "sem rede" se escreve (§3.4). F232, F238, F252 |
| Avaliação visual | **Comparando com cerca de duas semanas atrás, a gordura visual aumentou claramente?** — pergunta do nutricionista · **Sim** / **Não** / **Incerto** | F220 literal, V1. **81 caracteres: não cabe em tipo grande ao fim de uma sessão de fotos** (Lista A, §11) |
| … validade | **Vale por 14 dias, contados da foto mais nova do par. Só vale para um par com 10 a 28 dias de intervalo.** | F220. 103 car. → 3 linhas em cartão ✓ |
| … consequência | **Sem esta resposta, a regra não corta: fica em "não mexer".** | F212 (corte exige adesão **e** avaliação), V4. 0 avaliações respondidas (P1) |

### 4.3 · E3 · O que passou sem registro

**A marca é "sem marca".** O gloss, uma vez por tela onde a marca aparece
primeiro: **"Sem marca não é zero: o dia fica desconhecido."**

Por que esta palavra não acusa: ela nomeia a falta de registro, não a falta de
ato, e o sujeito é o dado. F153 separa "não feito (ausência de registro)" de
"pulado (decisão declarada)", e F198 já diz em que estado isso deixa o dia.
Recusei "pendente" (dívida), "faltou"/"esqueceu" (culpa, e o produto não
distingue esquecer de não comer), "em branco" (formulário mal preenchido) e "não
registrado" (aponta para ele, não para o dado). "Não sabido" só serve de
explicação, nunca de rótulo.

| onde aparece | o que está escrito | por quê |
|---|---|---|
| Refeição | **Almoço · sem marca** | F198, F200 |
| Água | **Água · não contei** | F194, F198; água marcada em 2 dias no máximo (P1) |
| Cardio | **Cardio na prescrição · sem marca** | F46; 0 de 16 em oito semanas (P1, U6) |
| … e a honestidade que §8 pede | **O registro não sabe se não aconteceu ou se não foi marcado.** | 02-uso §8 em uma frase. 58 car. ✓ |
| Pesagem | **Peso de hoje · sem marca** | F42; 2,75 de 3 a 4 por semana (P1) |
| Aula | **Aula de HYROX · sem marca** · botão **Fui** · **Detalhar (opcional)** | F118; P4: "às vezes eu só vou marcar que eu fiz o Hyrox, pronto… quero poder detalhar se eu quiser" |
| Série / exercício | **sem marca** (ausência) vs **pulado** (declarado) | F137, F153, F154 |
| Dia inteiro | **Hoje ainda não tem marca. Sem marca não é zero: o dia fica desconhecido.** | F198. 63 car. → 1–2 linhas ✓ |
| Contador da regra | **Dias conhecidos nos últimos 14: 1 · a regra pede 11** | F200, F213. Usa a palavra da regra, o que remove a confusão de "um dia com uma refeição marcada já conta" |
| Consequência | **Com menos de 11, a regra do nutricionista fica em "não mexer e registrar mais".** | F212 literal, V1, V4. 80 car. → 2 linhas ✓ |
| Nunca | vermelho · "!" · "13 dias perdidos" · "você não marcou" · sequência de dias · a marca sumindo no fim do dia | V5, F22. Se a hachura deve sumir à meia-noite é pergunta do dono (§12) |

---

## 5 · Direção C · Momento 1 · Entre duas séries

**Moldura comum a todos os estados.** Onde o desenho escreve "Sem rede · tudo
gravado neste aparelho", a string passa a **"Tudo guardado neste aparelho"** (27
car. a 13 px ≈ 162 pt ✓): no subsolo a falta de rede é o estado normal (F25) e o
registro não depende dela (F72, F248); o que o dono precisa saber é o destino,
não a ausência (V2, §3.4). Cabeçalho: **"Treino A"** + **"desde 6:20 · série 10
de 20"** (27 car. ✓). Botão de volta: **"‹ Hoje"**. Botão da folha do dia:
**"Dia"**.

| estado | onde aparece | o que está escrito | por quê |
|---|---|---|---|
| 1 · caso base | linha do fim | **Fim ~7:22 · com o cardio, ~7:45 · estimativa** | V3 obriga a marcar a conta como conta (F193). 44 car. ≈ 300 pt, uma linha ✓. A versão com "(estimado)" por extenso ia a 2 linhas |
| 1 | título do exercício | **Pulldown unilateral** | Nome prescrito intacto (V7, F111) |
| 1 | prescrição do exercício | **Na prescrição: 2 × 8–12 · RIR 1 · descanso 2 min · carga na máquina** | §3.2: a origem se nomeia. F84, F140 |
| 1 | linha da série 1 | **37,5 × 11** · **RIR 1** · **+1 rep** | Fato ao lado do número, sem elogio (V5). F137 |
| 1 | linha da série 2 | **agora** · **última (21/09): 37,5 × 9** | §3.2: histórico dele, não prescrição. F170 |
| 1 | cabeça da lista | **Falta, com a prioridade do treinador** | V1: a prioridade é dele (F15), e é o critério de corte do dono (P2) |
| 1 | linha de registro | **Série 2 de 2 · como saiu?** | Pergunta do mundo, não do formulário (V6) |
| 1 | carga | **Carga** · **37,5 kg** · **igual à última ✎** | §3.2, F171, F63 (vírgula) |
| 1 | cabeça da régua | **Repetições · um toque guarda** · **alvo 8–12** | V2 (o toque é a gravação, não há "salvar"), V6. F91 |
| 1 | sob o número | **última** / **alvo** | 6 e 4 car. a 12 px ≈ 38 e 25 pt, cabem nos 49 pt da fatia ✓ |
| 1 | saída | **Outro número** · **o RIR vem depois, se quiser** | F137 (RIR opcional); 66% das séries têm RIR (P1) |
| 2 · guardada | aviso na linha | **guardada** | V2. Só depois da gravação (F294) |
| 2 | descanso | **Descanso** · **0:12** · **lembrete aos 2:00** | F97: o tempo prescrito é lembrete, não ordem — e "lembrete" é a palavra do fato |
| 2 | sob o descanso | **Conta pelo relógio do aparelho.** | F57: o app para quando outro app entra na frente |
| 2 | RIR | **RIR desta série · opcional · alvo 1** | F94, F137, V6 |
| 2 | série extra | **+ 1 série, só hoje** | 18 car. ✓. A consequência no próprio rótulo (V4); P12 pede isso "direto, por ali já" |
| 2 | subir carga | **Topo da faixa nas 3 séries na última vez (RIR 1 · 0 · 0).** | F168, F95 |
| 2 | … regra | **Treinador: com o topo em todas, sobe no menor incremento da máquina e recomeça perto da base.** | F95 literal, V1. 94 car. → 2 linhas em `.cue` ✓ |
| 2 | … limite do app | **A conta não olha o RIR. Quem decide é você.** | F169 (o cálculo não verifica o RIR, embora a regra exija) e F2 (a decisão é do dono). O app admitindo o próprio limite: V2, V3 |
| 3 · volta do WhatsApp | descanso | **Descanso** · **2:12** · **passou do lembrete** | F97; sem vermelho, sem alarme (V5) |
| 3 | sob o descanso | **O tempo fora do app conta: este é o relógio da parede.** | F57, F58 (o Safari não vibra; som com aparelho bloqueado não é confiável) |
| 3 | … critério | **Treinador: volte quando der para fazer outra série de alta qualidade.** | F29 literal, V1. 70 car. → 2 linhas ✓ |
| 4 · série extra | cabeçalho | **desde 6:20 · série extra** | F159 |
| 4 | linha da série 3 | **agora · extra** · **só hoje · 2 → 3 séries** | V4: o que muda, em número |
| 4 | carga | **como a série 2 ✎** | Referência correta: é a série de hoje, não a última sessão (F170) |
| 4 | nota | **Mudança só de hoje. Se entra no Treino A, você decide ao encerrar.** | E1 (§4.1). Substitui "Vale para sempre só se você decidir, em casa", que contradiz a exigência |
| 5 · toque errado | título | **Corrigir a série 2** · **guardada: 37,5 × 11** | V2, F35, U12 |
| 5 | cabeça da régua | **Repetições · um toque corrige** | O rótulo diz o que o toque faz (V6) |
| 5 | sob o número | **guardado** | 8 car. a 12 px ≈ 50 pt contra 49 pt de fatia: **no limite** |
| 5 | saídas | **Cancelar** · **Apagar esta série** | F295 (apagar precisa existir); longe dos números (F28) |
| 6 · substituto novo | etiqueta | **só hoje · no lugar de Pushdown** | F159, F106 |
| 6 | linha da série | **agora** · **primeira vez: sem referência** | F109: quase nunca foi executado; V3: o app não inventa número |
| 6 | histórico | **O histórico da Elevação lateral na máquina continua dela, separado.** | F151. **Não cabe:** o desenho não tem linha para isso neste estado (Lista A, §11) |
| 6 | carga | **Série 1 de 2 · qual carga?** · **teclado do app** | F61, F63, F65, F66 |
| 6 | teclado | **,** · **⌫** · **Cancelar** · **OK · repetições** | F63: a vírgula é o separador decimal e um campo `number` a descarta |
| 6 | foto | **Fotografar o aparelho** · **O que muda** | F224, F110 ("qual das três puxadas desta academia"), F106 |
| 7 · folha do dia | título | **Segunda, 28/09** · **descanso 1:50 · contando** | F30, K6: o descanso não para quando a folha abre |
| 7 | pré-treino | **Pré-treino · 05:45** · **sem marca** · itens · **Comi tudo** / **Metade** / **Não foi o do plano** | E3; F181, F182, F195, F199. "Não foi o do plano" = 18 car. a 15 px bold ≈ 130 pt nos 122 pt da fatia: **quebra em 2 linhas** |
| 7 | água | **Água** · **meta: 14 copos de 250 ml** · **+1 copo** | F194 |
| 7 | peso | **Peso de hoje** · **sem marca** · **da balança de casa, de manhã, antes do treino** | F42, P6, E3. 7 de 11 pesagens entraram entre 6:28 e 7:52 (P1, K6) |
| 7 | próxima refeição | **Próxima no plano · 08:00** · **Café da manhã · no trabalho · 629 kcal** | §3.2, F39, F181 |
| 7 | saída | **Puxe para baixo para voltar à série** | V6 |
| 8 · não guardou | aviso | **Não guardei a série 2.** | V8: o agente é o app. F296, F294 |
| 8 | causa e saída | **O Safari em modo privado recusa guardar. Abra o app pelo ícone da Tela de Início.** | F55. Causa provável + caminho, nunca "erro inesperado" |
| 8 | variante espaço | **O armazenamento deste aparelho recusou a gravação.** + **Copiar o registro inteiro (cópia de segurança)** | F53, F249, F256 |
| 8 | linha da série | **37,5 × 10** · **só na tela** · **não guardada** | V2: palavra e forma, não só cor |
| 8 | botão | **Tentar de novo** | — |
| 8 | o que segue | **O descanso continua contando. A próxima série está pronta.** | O erro não bloqueia o treino (F294) |
| 9 · abrindo | rodapé | **Lendo o registro deste aparelho. Não precisa de rede.** | F72, F73 |
| 9 · travado | título | **A abertura está demorando mais que o normal.** | F273 |
| 9 | corpo | **Esperei 6 s. Nada foi apagado e nada saiu do aparelho. Recarregar costuma resolver.** | V8, V2. F240 |
| 9 | linha técnica | **leitura local sem resposta há 6 s · versão 2026-09-28** | F5: o usuário é quem mantém o código |
| 9 · endereço vazio | título | **Nenhum registro neste endereço.** | F56 |
| 9 | corpo | **Se você já usava o app, seu registro continua no endereço e no ícone onde foi guardado. Abra por lá.** | F56: o vazio não pode parecer perda |
| 9 | botões | **Restaurar uma cópia de segurança** · **Começar do zero** | F249, F250 |
| 10 · sessão esquecida | pendência | **Fechei o Treino A de ontem na última série.** · **6h20 → 7:24 · cerca de 1 h 04, aproximada** · **Está certo** / **Corrigir o fim** | V8, V3, V5. F34, F152, F293, F295, K7 |
| 10 | E1 | **2 mudanças de ontem ficaram só do dia.** + **Decidir** | §4.1 |
| 10 | cardio de ontem | **Cardio na prescrição · sem marca** + **O registro não sabe se não aconteceu ou se não foi marcado.** | E3, U6, §8 de 02-uso |
| 10 | pré-treino | **Pré-treino** · **no plano · 163 kcal** · **marcar** | §3.2, F181 |
| 10 | peso | **Peso de hoje** · **sem marca · 3 a 4 por semana na prescrição** | F42, E3 |
| 10 | o agora | **Agora · próximo na sequência** · **Treino B · pernas completas + panturrilhas** · **9 exercícios · 22 séries** | F81, F85. "o próximo treino é sempre o seguinte ao último registrado" |
| 10 | primeira série | **1º: Agachamento no Smith — última: 20 kg por lado (40 no total) × 8** | F140 (anilhas de um lado; total = 2 ×), F141 (o código nunca converte sozinho) |
| 10 | botões | **Começar agora** · **ou comece direto na primeira série** | F152: as duas formas de começar são válidas |
| 11 · paisagem | tudo | as mesmas strings, nenhuma nova | F60: a tela se reorganiza; a voz não muda |

---

## 6 · Direção C · Momento 2 · Depois de comer

**Moldura comum.** Cabeçalho **"Hoje"** + **"terça, 29/09 · dia de treino"**.
Contador: **"Dias conhecidos nos últimos 14: 9"** + **"a regra pede 11"** (30 +
15 car. ≈ 188 + 95 pt nos 382 pt ✓) — substitui "Comida conhecida em 9 de 14
dias" porque "conhecido" é a palavra da regra e o número que importa é o de dias
(F200, F213).

| estado | onde aparece | o que está escrito | por quê |
|---|---|---|---|
| 1 · caso base | manhã encolhida | **5 marcados** · **pré-treino · treino B · água do treino · peso 73,8 · café** | F197 (cada marca guarda o instante) |
| 1 | almoço que passou | **Almoço** · **sem marca · 719 kcal** · **marcar** | E3; F198: ainda dá para marcar, e não é zero |
| 1 | linha do agora | **agora 15:34** | — |
| 1 | lanche | **Lanche da tarde** · **no plano · 819 kcal** | §3.2, F181 |
| 1 | água | **Água · não contei** · **meta: 14 copos de 250 ml** · **+1 copo** | E3, F194 |
| 1 | cartão | **Agora · no plano às 16:00 · 819 kcal** | F181; ele come por volta de 15:30 (K4) e a janela cobre os dois |
| 1 | itens | **leite 250 ml · banana 120 g · aveia 40 g · pasta de amendoim 10 g · leite em pó 10 g · whey 30 g · pão 50 g · geleia light 20 g** | F181 literal |
| 1 | nota | **"Bata leite + banana + aveia + pasta + leite em pó + whey. Pão e geleia ficam separados." — nutricionista** | F182 literal, V1 |
| 1 | botões | **Comi tudo** · **Metade** · **Não foi o do plano** | V8 (voz dele), F195, F199. "Metade" = porção 0,5 |
| 2 · marcado | aviso | **Guardei: lanche, tudo, às 15:34, neste aparelho.** + **Desfazer** | V2, V8, F197 |
| 2 | linha | **Lanche da tarde** · **tudo · 15:34** | — |
| 2 | pergunta única | **O almoço das 12:30 ficou sem marca. Como foi?** | F199: num dia conhecido, refeição sem marca pesa como não comida |
| 2 | respostas | **Tudo** · **Metade** · **Não foi o do plano** · **Depois** | 4 fatias de 91 pt; "Não foi o do plano" quebra em 2 linhas ✓ |
| 2 | nota | **Pergunto uma vez. Depois não volto a perguntar hoje.** | V5: a pergunta não vira cobrança |
| 3 · não foi o do plano | título da folha | **Lanche · não foi o do plano** · **o que houve?** | F195 |
| 3 | opção 1 | **Comi outra coisa e sei o que foi** — **O dia fica "saiu do plano, sabendo o que comeu" e continua contando para a regra.** | F195, F200, V4 |
| 3 | opção 2 | **Comi outra coisa e não sei quanto** — **O dia inteiro deixa de contar para a regra: 9 dias conhecidos passam a 8.** | F200, F292 (foi exatamente isto que destravou um corte errado), V4 |
| 3 | opção 3 | **Não comi nada disso** — **O lanche fica sem marca. O resto do dia continua valendo.** | F198; o produto não separa "não comi" de "esqueci" e esta direção não inventa a diferença (§12) |
| 3 | saída | **Cancelar** | — |
| 4 · dia seguinte | pendência | **Ontem, terça, ficou sem parte das marcas.** · **Almoço sem marca · jantar sem marca · água não contei** | E3, V5 (substitui "ficou a lápis em parte", que é vocabulário interno do desenho) |
| 4 | botões | **Dizer como foi ontem** · **Mais tarde** | F195 ("como o dia foi" é o nome do campo). 20 + 10 car. ≈ 172 + 102 pt nos 382 ✓ |
| 4 | nota | **Não bloqueia o almoço de hoje.** | U11: pôr em dia é a única forma medida da comida (P1) |
| 5 · ontem de memória | título | **Terça, 29/09** · **de memória · cada toque guarda** | V2, U11, F197 |
| 5 | almoço | **metade · marcado em 30/09, 13:42** | F197: o instante é o do registro, e isso fica visível |
| 5 | jantar | **Não foi o do plano** → **Sabe o que comeu no lugar?** → **Sei** / **Não sei quanto** | F195, V8 |
| 5 | água | **Água de ontem** · **não contei: não é zero** · **Não contei** / **Contar copos** | E3, F194, F198 |
| 5 | resultado | **Terça é dia conhecido: saiu do plano, sabendo o que comeu.** | F200, V4. Sem elogio (V5) |
| 5 | botão | **Voltar para hoje** | §3.3: a aba "Hoje" como destino |
| 6 · palpite do dia | etiqueta | **palpite** · **Dia de treino** / **Descanso** · **manhã** / **tarde** / **noite** | F187 (precedência: sessão registrada, sessão aberta, definição manual, previsão), V3 |
| 6 | nota | **Enquanto não há sessão registrada, o tipo do dia vem do padrão semanal.** | F187, F188 |
| 6 | treino | **Treino B · e água do treino** · **na prescrição pela sequência · água 600 ml** | F81, F181. 37 car. a 13 px ≈ 222 pt em 228 pt: **no limite** |
| 6 | horário mudado | **Treino às 18:15: o pré vai para 17:45 e o jantar para 19:45. — regra do nutricionista** | F189, F190, V1. 86 car. → 2 linhas ✓ |
| 7 · vazio | contador | **Dias conhecidos nos últimos 14: 1** · **a regra pede 11** | P1: o retrato real |
| 7 | consequência | **Com menos de 11, a regra do nutricionista fica em "não mexer e registrar mais".** | F212 literal, V1 |
| 7 | linha do vazio | **Hoje ainda não tem marca. Sem marca não é zero: o dia fica desconhecido.** | E3, F198 |
| 7 | domingo | **domingo, 27/09 · descanso** · **sem pré-treino e sem água do treino hoje** | F186 (refeição só em dia de treino), F188 (domingo é descanso por padrão) |
| 8 · sem plano | título | **Este aparelho não tem plano alimentar.** | F271 |
| 8 | corpo | **O plano vem do seu nutricionista. Sem ele não há o que marcar.** | F2: o app não cria prescrição (V1) |
| 8 | botões | **Restaurar o plano do nutricionista** · **Trazer de uma cópia de segurança** | F207, F250 |
| 8 · abrindo | rodapé | **Lendo o dia deste aparelho. Não precisa de rede.** | F72 |
| 9 · não guardou | linha | **Lanche da tarde · tudo** · **só na tela · não guardado** | V2 |
| 9 | aviso | **Não guardei o lanche.** · **O Safari em modo privado recusa guardar. Abra o app pelo ícone da Tela de Início.** · **Tentar de novo** | V8, F55, F296 |
| 9 | o que não mudou | **A contagem dos 14 dias não se mexeu.** | V2, V4: nada de falso sucesso na conta da regra |
| 10 · caso ruim | título | **Sexta, 25/09** · **de memória · 5 dias atrás** | F209: a falta pode ser descoberta semanas depois |
| 10 | fileira de dias | **ter 22 · qua 23 · qui 24 · sex 25 · sáb 26 · dom 27 · seg 28** | F67: a roda de data do iPhone não serve aqui |
| 10 | o que havia | **Café da manhã** · **tudo · marcado na sexta** · **Almoço · lanche · jantar** · **sem marca** | E3 |
| 10 | como foi o dia | **Seguiu o plano** · **Saiu do plano · sei o que comi** · **Saiu do plano · não sei quanto** | F195 literal. 30 car. em 123 pt: **quebra em 2 linhas** |
| 10 | consequência | **Sexta sai da conta: 10 dias conhecidos passam a 9.** · **Para a regra do nutricionista, "não sei quanto" é dia desconhecido. Se você lembrar o que comeu, "sei o que comi" mantém a sexta contando.** | F200, F292, V4 |
| 10 | botões | **Desfazer** · **Voltar para hoje** | — |

---

## 7 · Direção D · Momento 1 · Entre duas séries

**Moldura comum.** Cabeçalho: **"Treino A"** + **"seg 28/09"** + a linha de
estado. A linha de estado do desenho ("série 10 de 20 · 35 min · fim ~7h34 no
ritmo de hoje", 52 car.) **não cabe** nos 338 pt livres ao lado do botão ⋯
(Lista B); a string passa a **"10 de 20 · 35 min · fim ~7h34 (estimado)"** (40
car. ≈ 291 pt ✓), que mantém a marca de estimativa que V3 exige (F193). Mapa da
sessão: **"restam 11 séries · 6 de prioridade máxima"** (F15, P2).

| estado | onde aparece | o que está escrito | por quê |
|---|---|---|---|
| M1‑1 | cartão | **4 de 8 · dorsal · prioridade secundária** · **Pulldown unilateral** | F15, F111, V7 |
| M1‑1 | prescrição | **Na prescrição: série 2 de 2 · 8–12 rep · RIR 1 · descanso 2:00** | §3.2, F84 |
| M1‑1 | tabela | **Hoje** / **Última · seg 21/09** | §3.2: a referência é o histórico dele (F170) |
| M1‑1 | células | **45 × 10 · RIR 1** / **?** / **45 × 9** | F137, F170 |
| M1‑1 | links | **Ver o aparelho** · **Nota do treinador** | F224, F93, V1 |
| M1‑1 | última gravação | **Guardei a série 1 às 6h52.** | V2, V8 (substitui "Série 1 guardada às 6h52", que esconde o agente) |
| M1‑1 | o que vem | **Depois: Elevação lateral na máquina · 25 kg · 3 × 10–15** | F84, F170 |
| M1‑1 | carga | **Carga** · **45 kg** · **igual à última** | §3.2, F171 |
| M1‑1 | régua | **Repetições da série 2: toque no que saiu** | V6: o rótulo diz o que o toque grava |
| M1‑1 | faixa | **sublinhado: a faixa prescrita, 8–12** | F91, V1 |
| M1‑1 | ações | **Máquina ocupada** · **Dor** · **Pular** | V6: três rótulos de uma palavra ou duas (F26, F150, F153) |
| M1‑2 | confirmação | **Guardei a série 2 neste aparelho · 45 × 10** · **+1 rep** · **Desfazer** | V2, V8, F294 |
| M1‑2 | descanso | **Descanso** · **0:04** · **lembrete aos 2:00** | F97 |
| M1‑2 | critério | **Treinador: volte quando der para fazer outra série de alta qualidade.** | F29 literal, V1 (substitui "Volte quando der para outra série boa", que parafraseia o treinador) |
| M1‑2 | RIR | **RIR desta série · opcional · alvo 1** · **0 1 2 3 4** · **sem RIR** | F94, F137; 66% têm RIR (P1) |
| M1‑2 | enquanto descansa | **ENQUANTO DESCANSA** · **Pré-treino: comi** · **Água 1/14 · +1** · **Peso de hoje** | F30, K6; 7 de 11 pesagens entraram entre 6:28 e 7:52 (P1) |
| M1‑2 | série extra | **+ 1 série, só hoje** | 18 car. ✓. V4 no rótulo; P12 |
| M1‑3 | descanso | **Descanso** · **3:10** · **o lembrete era aos 2:00** | F97, V5: passar não é falha |
| M1‑3 | explicação | **O tempo fora do app conta: este é o relógio da parede.** | F57 |
| M1‑3 | linha de cima | **Pulldown unilateral: 45 × 10 · sem RIR** · **RIR** · **+ série** | F137: o RIR que ficou para trás continua a um toque |
| M1‑4 | cartão | **4 de 8 · dorsal · série a mais hoje** · **Série 3 · além das 2 da prescrição · 8–12 rep · RIR 1** | F159 |
| M1‑4 | carga | **igual à série 2** | A referência de hoje, não a da última sessão (F170) |
| M1‑4 | nota | **Mudança só de hoje. Se entra no Treino A, você decide ao encerrar.** | E1 (§4.1), substituindo "você decide depois, sentado" |
| M1‑4 | saída | **Cancelar a série a mais** | — |
| M1‑5 | aviso | **Última vez, seg 21/09: 7,5 × 20 · 20 · 20 (RIR 1 · 0 · 0). Topo da faixa em todas as séries.** | F168, F95 |
| M1‑5 | regra | **Dupla progressão do treinador: com o topo em todas, sobe no menor incremento da máquina e recomeça perto da base.** | F95 literal, V1 |
| M1‑5 | limite do app | **A conta não olha o RIR. Quem decide é você.** | F169, F2 |
| M1‑5 | folha | **Carga** · **kg na máquina · vale para esta série e as seguintes** · **antes 7,5 kg** · **Já usadas aqui: 6,25 · 7,5** | F140, F141, F171 |
| M1‑5 | teclado | **,** · **⌫** · **Cancelar** · **Usar 8,75 kg** | F63, F61, F65, F66 |
| M1‑6 · vazio | cartão | **5 de 8 · só hoje, no lugar de Elevação lateral na máquina** · **Elevação lateral no cabo** | F106, F159 |
| M1‑6 | sem referência | **Primeira vez neste exercício. Ainda não há "última vez". O histórico da Elevação lateral na máquina continua dela, separado.** | F109, F151, V3 |
| M1‑6 | carga | **Dizer a carga** · **kg na máquina** | V3: o app não inventa número |
| M1‑6 | régua desligada | **Repetições: primeiro a carga, depois o que saiu** | V6 |
| M1‑6 | foto | **Fotografar este aparelho** | F224, F110 |
| M1‑7 · vazio da sessão | cabeçalho | **Peito superior + dorsais + lateral + tríceps** · **comecei às 6h20, antes do aquecimento · 20 séries** | F84, F152, V8 |
| M1‑7 | nota do treinador | **"Primeiro exercício da semana, no melhor momento de desempenho que existe. Banco a 20 ou 30° se a máquina permitir: mais que isso vira desenvolvimento de ombro." — treinador** | F93 literal, V1. **A orientação mais longa do repertório tem 243 caracteres e não cabe aqui** (Lista A, §11) |
| M1‑7 | aproximação | **Aproximação antes (não entra no volume, não se registra)** · **bem leve × 8–10** · **28–33 kg × 5 (50–60% de 55)** · **39–44 kg × 2–4 (70–80%)** | F103 literal |
| M1‑7 | marca | **Fiz a aproximação** | F150: só se marca que houve |
| M1‑8 · carregando | título | **Abrindo a sessão de hoje…** | — |
| M1‑8 | rodapé | **Lendo o registro deste aparelho. Não usa rede.** | F72, F73 |
| M1‑9 · erro | título | **O registro deste aparelho não abriu.** | F273 |
| M1‑9 | corpo | **Esperei 4 s. Nada foi apagado e nada saiu do aparelho.** · **A rede não é a causa: o registro mora aqui.** | V8, V2, F240 |
| M1‑9 | botões | **Tentar de novo** · **Ver o detalhe técnico** | F5 |
| M1‑9 | saída | **Se acontecer de novo: Ajustes › Cópia de segurança, a partir de outro aparelho com a conta.** | F249, F241 |
| M1‑10 · erro | célula | **45 × 10** · **não guardada** | V2 |
| M1‑10 | aviso | **Não guardei a série 2.** · **O armazenamento deste aparelho recusou a gravação. A série continua aqui, 45 × 10, enquanto o app estiver aberto.** | V8, F53, F256 |
| M1‑10 | botões | **Tentar guardar de novo** · **Copiar o registro inteiro (cópia de segurança)** | F249 |
| M1‑11 · dor | aviso | **Cotovelo marcado neste exercício nas duas últimas vezes** · **seg 21/09 (Treino A) e sex 25/09 (Treino E)** | F172, F151 |
| M1‑11 | regra | **Treinador: apareceu dor de tendão, tirar este exercício por 2 semanas e substituir por outro ângulo. Nunca empurrar por cima.** | F102 literal, V1 |
| M1‑11 | botões | **Ver os 3 substitutos** · **Pular hoje** · **Fazer mesmo assim** | F2: a decisão é dele |
| M1‑11 | nota | **Qualquer escolha fica no registro do dia. Pular é decisão: este exercício não volta como esperado hoje.** | F150, F154, V4 |
| M1‑11 | os três pontos | **Cotovelo** · **Ombro da frente** · **Joelho** | F150; "joelho abaixo da patela" é como F20 o descreve |
| M1‑11 | gloss dos pontos | **Dor muscular difusa no dia seguinte é normal; pontual no cotovelo, no ombro da frente ou no joelho abaixo da patela é sinal de tendão. — treinador** | F20 literal, V1. **147 caracteres: não cabe na folha de "Dor"** (Lista A, §11) |
| M1‑12 · máquina ocupada | título da folha | **Máquina ocupada** | Substitui "Elevação lateral na máquina ocupada", que se lê como se a máquina fosse "a ocupada" |
| M1‑12 | subtítulo | **Elevação lateral na máquina · vale só para hoje, o programa não muda.** | F159, V4 |
| M1‑12 | saída barata | **Fazer antes o próximo** — **Elevação lateral unilateral no cabo agora; esta volta logo depois.** | F159 (mover é mudança do dia) |
| M1‑12 | grupo | **SUBSTITUTOS DO TREINADOR · ★ INDICADO POR ELE** | F107, V1 |
| M1‑12 | por substituto | **Última vez: 7,5 × 20 · 20 · 20** / **Nunca feito** · **com foto do aparelho** / **sem foto do aparelho** | F109, F123, F224, V3 |
| M1‑12 | o que muda | **"Perde tensão embaixo, ganha no topo."** | F108 literal, V1. A ligação a este substituto é ilustrativa (F108 não diz de qual é) |
| M1‑12 | saída | **Pular hoje** | F153 |
| M1‑13 · sessão aberta | cabeçalho | **terça, 29 de setembro** · **Dia de treino · o próximo é o Treino B** | F81, F187 |
| M1‑13 | sessão | **Fechei o Treino A de ontem na última série.** · **6h20 → 7h31 · cerca de 1h11, aproximada** · **Está certo** / **Corrigir o fim** | V8, V3, V5, F152, F293, F295 |
| M1‑13 | E1 | **Mudanças só do dia: 2** · **do Treino A de ontem** · **Decidir** | §4.1, F159, F280 |
| M1‑13 | o agora | **Agora · treino das 6h15** · **Treino B** · **Pernas completas + panturrilhas · 9 exercícios · 22 séries · ~51 min pela sua mediana** | F85, F193, K1 (mediana 51 min), V3 |
| M1‑13 | botões | **Começar agora** · **Ou comece direto na primeira série.** | F152 |
| M1‑13 | peso | **Peso de hoje** · **antes de treinar, depois do pré** · **Anotar** | F42, P6 |
| M1‑13 | pré-treino | **Pré-treino · 5h45** · **pão, doce de leite, canela, café · 163 kcal** · **Comi tudo** | F181, V8 |
| M1‑14 · paisagem | tudo | as mesmas strings | F60 |

---

## 8 · Direção D · Momento 2 · Depois de comer

**Moldura comum.** Cabeçalho do dia: **"quarta, 30 de setembro"** +
**"Dia de treino · Treino C, 6h18–7h12"** (35 car. ✓). Legenda das formas:
**comi tudo** · **metade** · **fora do plano** · **sem marca: desconhecido, não
zero** · **agora** · **ainda por vir** (E3, F195, F198, F199). Contador:
**"Dias conhecidos nos últimos 14: 0 · a regra pede 11"** — substitui "Dias com
marca", porque a regra conta dias **conhecidos** e um dia com uma refeição
marcada já é um deles (F200, F213).

| estado | onde aparece | o que está escrito | por quê |
|---|---|---|---|
| M2‑1 | cartão | **Agora · no plano às 16h00** · **Lanche da tarde** | §3.2, F181; ele come por volta de 15h30 (K4) |
| M2‑1 | itens | **leite 250 ml · banana 120 g · aveia 40 g · pasta de amendoim 10 g · leite em pó 10 g · whey 30 g · pão 50 g · geleia light 20 g · 819 kcal** | F181 literal |
| M2‑1 | botões | **Comi tudo** · **Metade** · **Não foi o do plano** | V8, F195, F199. Substitui "Não comi isso", que confunde "comi outra coisa" com "não comi nada" |
| M2‑1 | pergunta do fora | **Sabe o que comeu no lugar?** · **Sei (ou não comi)** / **Não sei quanto** | F195, F200 |
| M2‑1 | consequência | **Sem saber quanto, hoje deixa de contar para a regra do nutricionista. É melhor isso do que um número inventado.** | F200, F292, V4 |
| M2‑1 | roteiro | **Hoje · dia de treino · 3.007 kcal no plano** | F183 |
| M2‑1 | linhas | **Pré-treino** · **sem marca** / **Treino · água 600 ml** · **sem marca** / **Café da manhã** · **sem marca** / **Almoço** · **sem marca** / **Lanche da tarde** · **agora** / **Jantar** · **678 kcal** | E3, F181, F186 |
| M2‑1 | água | **Água** · **não contei · meta: 14 copos de 250 ml** · **+1 copo** | E3, F194 |
| M2‑1 | atalho | **Ver os 14 dias** | §3.3: substitui "Pôr em dia" como nome de lugar (V5). 14 car. ≈ 99 pt ✓ |
| M2‑2 | confirmação | **Lanche da tarde · comi tudo** · **Guardei às 15h41, neste aparelho** · **Desfazer** | V2, V8, F197 |
| M2‑2 | o que ficou | **Antes dele, sem marca hoje: pré-treino, treino, café e almoço** · **Dizer como foi hoje** | E3, F198, F195 |
| M2‑2 | o que vem | **Próximo no plano: jantar às 19h30** | §3.2 |
| M2‑2 | contador | **Dias conhecidos nos últimos 14: 1. Hoje passou a contar.** | F200: um dia com uma refeição marcada já conta — dito, não escondido |
| M2‑3 | o que ficou de ontem | **Ontem, quarta, tem só o lanche marcado.** · **A água ficou sem conta.** · **Dizer como foi a quarta** | E3, V5 (substitui "Ontem ficou pela metade", que soa veredito), F195 |
| M2‑3 | marcas da academia | **Pré-treino** · **comi tudo · 6h31** / **Treino** · **comi tudo · 7h02** | F30, M1‑2: a pendência vai até onde o app já está aberto |
| M2‑4 · a folha | título | **Quarta, 30/09 · dia de treino** | — |
| M2‑4 | instrução | **O plano daquele dia vem marcado como comido. Mude só o que foi diferente. O que você não lembra, marque "não sei".** | V3, V4; e a razão pela qual presumir seria mentira está no estado 12 |
| M2‑4 | por refeição | **Tudo** · **Metade** · **Fora do plano** · **Não sei** | F195, F199. "Fora do plano" em 68 pt de fatia: **quebra em 2 linhas** ("Fora do" / "plano") ✓. Recusei a abreviação "Fora" porque V7 não abrevia conceito |
| M2‑4 | rótulos das linhas | **Pré-treino · 5h45** · **Treino · 6h15** · **Café · 8h00** · **Almoço · 12h30** · **Lanche · na hora, 15h41** · **Jantar · 19h30** | F181, F197: a marca feita na hora diz que foi na hora |
| M2‑4 | água | **Água** · **Não contei** / **Contar copos** | E3, F194 |
| M2‑4 | leitura de volta | **VAI FICAR REGISTRADO** · **Quarta: pré-treino, treino e café inteiros; almoço pela metade; jantar fora do plano, sabendo o que comeu; lanche inteiro. Água: não contei.** · **Quarta conta para a regra do nutricionista.** | V2, V4: a frase é o contrato do toque. É o único lugar onde uma frase longa é certa, porque se lê sentado |
| M2‑4 | botão | **Guardar quarta** | — |
| M2‑5 | pergunta | **Jantar fora do plano: você sabe o que comeu?** · **Sei o que comi** / **Não sei quanto** | F195, V8 |
| M2‑5 | consequência | **Sei: quarta continua contando para a regra. Não sei: quarta deixa de contar, o que é melhor do que um número inventado.** | F200, F292, V4 |
| M2‑5 | botão travado | **Responda o jantar para guardar** | 30 car. ≈ 270 pt ✓ (a versão com "fora do plano" entre aspas vai a 38 car. ≈ 342 pt nos 350: **no limite**) |
| M2‑6 | guardado | **Quarta guardada** + a frase lida de volta + **Desfazer** | V2 |
| M2‑6 | contador | **Dias conhecidos nos últimos 14: 2. Quarta já contava desde o lanche; agora diz o que aconteceu.** | F199, F200, V4. Explica o número que surpreende |
| M2‑7 · vazio do dia | tipo do dia | **Dia de treino, por palpite · mudar** | F187, V3. Substitui "Dia de treino? Palpite do padrão semanal · mudar" (48 car. ≈ 349 pt nos 338: Lista B) |
| M2‑7 | cartão | **Daqui a 25 min · no plano às 5h45** · **Pré-treino** | §3.2 |
| M2‑7 | vazio | **Hoje ainda não tem marca. Sem marca não é zero: o dia fica desconhecido.** | E3, F198 |
| M2‑7 | peso | **Peso de hoje** · **antes de treinar, depois do pré · última: 73,8 em 28/09** · **Anotar** | F42, P6, F13 |
| M2‑7 | ontem | **Ontem: só o lanche tem marca** · **quarta, 30/09** · **Dizer como foi** | E3 |
| M2‑8 · sem plano | título | **Este endereço ainda não tem plano alimentar.** | F56, F271 |
| M2‑8 | corpo | **O plano é o do seu nutricionista. Os dados moram no endereço de onde o app abre: se você usava o app por outro endereço, ou pelo ícone antigo da Tela de Início, o seu registro está lá, intacto.** | F56, F2 (o app não cria plano). O vazio não pode parecer perda |
| M2‑8 | botões | **Restaurar o plano original do nutricionista** · **Trazer de uma cópia de segurança** · **Entrar na conta e sincronizar** | F207, F250, F241 |
| M2‑8 | nota | **Nada aqui apaga o que existe em outro endereço.** | F56 |
| M2‑9 · carregando | título | **Abrindo o dia de hoje…** · **Lendo o registro deste aparelho. Não usa rede.** | F72, F273 |
| M2‑10 · erro | aviso | **Não guardei o lanche.** · **O armazenamento deste aparelho recusou a gravação. Sua escolha ficou aqui: comi tudo, 15h41.** | V8, V2, F53 |
| M2‑10 | linha | **Lanche da tarde** · **agora · não guardado** | V2 |
| M2‑10 | contagem | **Dias conhecidos nos últimos 14: 0.** | Nada de falso sucesso na conta da regra |
| M2‑10 | botões | **Tentar guardar de novo** · **Copiar o registro inteiro (cópia de segurança)** | F249 |
| M2‑11 · aba privada | aviso | **Aberto numa aba privada do Safari** · **O que você marcar aqui some quando a aba fechar. Para guardar de verdade, abra o app pelo ícone da Tela de Início.** | F55, F52 |
| M2‑11 | marca | **Lanche da tarde · comi tudo** · **15h41 · vale só até fechar esta aba** | V2: a marca vale, e a tela diz até quando |
| M2‑12 · caso ruim | título | **Os 14 dias da regra** · **sex 18/09 a qui 01/10** | §3.3, F213 |
| M2‑12 | situação | **11 dos últimos 14 dias estão sem marca. A regra do nutricionista precisa de 11 dias conhecidos; agora são 3.** | F213, V4, sem acusação (V5) |
| M2‑12 | instrução | **Marque só o que você lembra. Dia sem marca fica desconhecido: não vira zero e não vira "no plano".** | F198, E3, V3 |
| M2‑12 | por dia | **qui 01/10 · hoje** · **Treino D · pré e treino marcados** · **Completar** | F197 |
| M2‑12 | … sem marca | **ter 29/09** · **Treino B · sem marca** · **Como no plano** · **Detalhar** | E3; "Como no plano" existe com desfazer e com a frase do que foi gravado (§12, pergunta 4) |
| M2‑12 | … já posto | **seg 28/09** · **Como no plano: 6 momentos inteiros** · **Desfazer** | V2: o atalho diz o que gravou |
| M2‑12 | … aula | **sáb 26/09** · **Aula de HYROX · sem marca** | F118, E3 |
| M2‑13 · treino à noite | tipo do dia | **Treino E às 18h15 hoje · mudar** | F189 |
| M2‑13 | pré-treino | **Pré-treino** · **andou com o treino · sem o café, depois das 16h** | F189, F192 |
| M2‑13 | treino | **Treino** · **água 600 ml · fim estimado ~19h06** | F193, V3 |
| M2‑13 | jantar | **Jantar** · **fica no horário · é o pós-treino** | F189 (nenhuma refeição é criada, apagada ou fundida), F191 |
| M2‑13 | atribuição | **Horários movidos pela regra do nutricionista.** | V1, F189 |

---

## 9 · O que o leitor de tela ouve

As necessidades de acessibilidade do dono **não são conhecidas** (01-fatos,
ausências) e o produto terá outros usuários (P3, D8): isto é piso, não enfeite.
Três obrigações de texto.

1. **O nome acessível diz o mesmo que o visível, mais o que a tela mostra por
   forma, posição ou cor.** Unidade por extenso, porque número abreviado não se
   lê em voz.
2. **Toda gravação é anunciada uma vez**, com o destino (V2).
3. **Nada é anunciado a cada segundo**: o cronômetro do descanso não fala.

| onde | o que se ouve | por quê |
|---|---|---|
| Botão de repetição (C e D) | **"10 repetições, guardar"** · **"9 repetições, igual à última, guardar"** | V6: o rótulo é o que o toque grava. Em D os botões da régua hoje têm só o número: sem unidade, ouve-se "dez" |
| Carga | **"Carga 45 quilos na máquina, igual à última. Toque para mudar."** | F140, F171 |
| Teclado próprio | **"vírgula"** · **"apagar"** · **"usar 8,75 quilos"** | F63 |
| Depois de guardar | **"Série 2 guardada neste aparelho: 45 quilos, 10 repetições, uma repetição a mais que na última."** | V2 |
| RIR | grupo **"RIR da série 2, opcional, alvo 1"**; itens **"RIR 0"**… **"sem RIR"** | F94, F137 |
| Descanso | **"Descanso, 2 minutos e 12 segundos, passou do lembrete de 2 minutos."** — só quando o foco entra | F97, e nada a cada segundo |
| Mapa da sessão | **"Sessão inteira: 8 exercícios, 10 de 20 séries guardadas, 6 séries de prioridade máxima restantes."** | F15: o sublinhado é visual |
| Estado da refeição | **"Almoço, 12h30, sem marca"** · **"Lanche da tarde, comi tudo, às 15h41"** | E3; a forma (círculo tracejado, hachura) não se ouve |
| Contador dos 14 dias | **"Últimos 14 dias: 1 dia conhecido. A regra pede 11."** | F213; a grade de quadradinhos não se ouve |
| Erro de gravação | **alerta: "Não guardei a série 2. O armazenamento deste aparelho recusou a gravação. A série continua na tela."** | V2, F53 |
| Sessão fechada sozinha | **"Fechei o Treino A de ontem na última série, às 7h31. Duração aproximada: 1 hora e 11 minutos."** | F152, V3 |
| E1 | **"2 mudanças de hoje, por decidir. Pulldown unilateral, 3 séries em vez de 2. Dorsal passaria de 10 para 11 séries na semana."** | §4.1 |
| Foto do corpo | **"Pose 3 de 9, perfil direito. Falta 6."** · **"Esta foto está na cópia remota. Toque para baixar."** | F235, F238 |
| Nunca se ouve | "botão", "imagem", "✓", "···" sem nome | Nome genérico não diz o que o toque faz (V6) |

---

## 10 · Onde eu mudei a palavra do desenho, e por quê

Lista curta, para o curador conferir sem reler as tabelas.

| era | passa a ser | regra e prova |
|---|---|---|
| "Sem rede · tudo gravado neste aparelho" (C, toda tela de M1) | **Tudo guardado neste aparelho** | F25 (sem rede é o estado normal), F72, F248; "sem rede" só onde a rede é necessária (§3.4) |
| "previsto" (C e D, todas as linhas do dia) | **no plano** / **na prescrição** | §3.2, V1: "previsto" não diz de quem, e o app também faz previsões próprias |
| "Comida conhecida em 9 de 14 dias" (C) · "Dias com marca nos últimos 14" (D) | **Dias conhecidos nos últimos 14: 9 · a regra pede 11** | F200, F213: a regra conta dias conhecidos; um dia com uma refeição marcada já é um |
| "Pôr em dia" como nome de lugar (D) | **Os 14 dias da regra** | V5: "em dia" nomeia dívida e apareceria em 13 de 14 células |
| "Ontem ficou pela metade" (D) · "ficou a lápis em parte" (C) | **Ontem, quarta, tem só o lanche marcado.** | V5 (veredito) e V7 (vocabulário interno do desenho na tela do usuário) |
| "Não comi isso" (D) | **Não foi o do plano** | F195: o registro é sobre a refeição do plano; "não comi isso" confunde dois casos |
| "Volte quando der para outra série boa" (D) | **Treinador: volte quando der para fazer outra série de alta qualidade.** | F29 literal, V1: a frase é dele |
| "Série 1 guardada às 6h52" (D) | **Guardei a série 1 às 6h52.** | V8: o agente aparece |
| "Elevação lateral na máquina ocupada" (D, título) | **Máquina ocupada** + exercício no subtítulo | Ambiguidade de leitura |
| "Extensão de tríceps no cabo" (C, lista do que falta) | **Extensão de tríceps acima da cabeça no cabo** | V7: não se abrevia nome prescrito. **Não cabe** (Lista A) |
| "série 10 de 20 · 35 min · fim ~7h34 no ritmo de hoje" (D) | **10 de 20 · 35 min · fim ~7h34 (estimado)** | V3 mantida, e a linha passa a caber (Lista B) |
| "Dia de treino? Palpite do padrão semanal · mudar" (D) | **Dia de treino, por palpite · mudar** | V3 mantida, e a linha passa a caber (Lista B) |
| "Fora" (D, fatia de 68 pt) | **Fora do plano**, em duas linhas | V7: não se abrevia o conceito; a fatia aceita duas linhas |
| "Vale para sempre só se você decidir, em casa" (C) · "você decide depois, sentado" (D) | **Se entra no Treino A, você decide ao encerrar.** | Exigência E1 |

---

## 11 · As strings que não couberam

### Lista A · minhas palavras, verdadeiras e dentro das regras, que não cabem — **7**

| # | string | onde | a conta | por que não encurto |
|---|---|---|---|---|
| A1 | **"Comparando com cerca de duas semanas atrás, a gordura visual aumentou claramente?"** (81 car., F220) | E2 · Corpo › Fotos, oferecida ao fim de uma sessão de fotos | A 3 m do aparelho (F45) a pergunta precisa de tipo grande; a 22 px em 382 pt são 24 car. por linha → 4 linhas, e o fim da sessão de fotos não tem esse espaço | É a pergunta literal do nutricionista (V1). Encurtada, deixa de ser a pergunta dele e a resposta deixa de valer para a regra (F212, F220) |
| A2 | **"Extensão de tríceps acima da cabeça no cabo"** (43 car., F111) | C · M1 · 1, lista "Falta, com a prioridade do treinador" | `.falta li` a 14 px tem ~205 pt úteis ao lado da prioridade sem quebra; o nome pede ~225 pt, e as linhas da lista são de uma linha só (min-height 27) | V7: nome prescrito não se abrevia. O desenho de C já o encurtou para "Extensão de tríceps no cabo" |
| A3 | **A orientação de execução mais longa do treinador** (243 car., F93) | D · M1‑7, citação no cartão do primeiro exercício | A 15 px em 350 pt são ~45 car. por linha → 6 linhas ≈ 125 pt; somados a prescrição, aproximação e o botão de marca, o cartão empurra a régua fora da zona do polegar | É a voz do treinador (V1) e o primeiro exercício é exatamente onde ela serve (F93) |
| A4 | **"Dorsal passaria de 10 para 11 séries na semana; o treinador prescreveu 10."** (74 car.; F179 + F89, conta minha) | E1, fim do treino, em C e em D | A 14 px em 382 pt são ~60 car. por linha → 2 linhas; o cartão de fim de treino dá uma linha por mudança | É a consequência que V4 exige antes do toque, e sem o número prescrito ela não diz nada |
| A5 | **A E1 com mais de duas mudanças do dia** | E1, fim do treino, em C (`.entry`) e em D (`.band`) | Cada mudança pede ~76 pt (nome + consequência em 2 linhas + 2 botões). Duas cabem; F159 permite oito tipos de mudança no mesmo dia, e uma manhã ruim produz quatro | Nenhuma mudança pode ficar sem pergunta: foi descartá-las em silêncio que gerou F280 |
| A6 | **"Dor muscular difusa no dia seguinte é normal; pontual no cotovelo, no ombro da frente ou no joelho abaixo da patela é sinal de tendão. — treinador"** (147 car., F20) | C · M1, folha de "Dor" (Sessão › ··· › Dor) | O subtítulo da folha é de uma linha a 13–14 px (~60 car.) | É o que distingue dor normal de sinal de tendão, e é a frase do treinador (V1, F19, F20) |
| A7 | **"O histórico da Elevação lateral na máquina continua dela, separado."** (66 car., F151) | C · M1 · 6, substituto nunca feito | O estado tem `.tagline` (uma linha, badge) e `.meta` (uma linha, ~49 car. a 15 px); 66 car. não entram em nenhuma das duas, e não há terceira | É o medo que a frase desarma na hora da troca sob pressão (F109, U4); dito depois, não serve |

### Lista B · onde as palavras do próprio desenho já passam da borda — 4

Registradas porque são defeito de ajuste, não minha escolha; as minhas versões
estão na §10.

1. **D · M1, linha de estado do cabeçalho**: 52 car. a 14 px ≈ 378 pt nos 338 pt
   livres ao lado do botão ⋯ → quebra em duas linhas e empurra o mapa da sessão.
2. **D · M2‑7, tipo do dia**: 48 car. a 14 px semibold ≈ 349 pt nos 338 pt.
3. **C · M1 · 1, linha do fim previsto**: 60 car. a 13 px ≈ 366 pt nos 382 pt —
   **no limite**, e com qualquer marca de estimativa a mais passa de uma linha.
4. **D · M2‑5, botão travado com "fora do plano" entre aspas**: 38 car. a 18 px
   bold ≈ 342 pt nos 350 pt — **no limite**.

### Quebras em duas linhas que o espaço aceita (não contadas)

"Não foi o do plano" na fatia de 122 pt de C; "Fora do plano" na fatia de 68 pt
de D; "Saiu do plano · não sei quanto" na fatia de 123 pt de C; a consequência de
A4 onde houver duas linhas. Todas cabem em altura (2 × 14 px dentro de 44 pt de
alvo).

---

## 12 · O que eu não decido

Perguntas de palavra que dependem do dono ou de outro papel. Cada uma diz o que
está escrito enquanto não houver resposta.

1. **A hachura do previsto que não aconteceu deve sumir no fim do dia?** Mantê-la
   é honesto (§8 de 02-uso não sabe se o cardio aconteceu); apagá-la evita a
   sensação de cobrança. *Escrito:* "sem marca", sem vermelho, sem contagem de
   dias perdidos, sem desaparecer.
2. **Separar "não comi" de "esqueci"?** O dado não separa (F195). *Escrito:* os
   dois ficam "sem marca", e a folha oferece "Não comi nada disso" como escolha
   que não cria dado novo.
3. **Guardar qual refeição saiu do plano?** Hoje o estado é do dia (F195).
   *Escrito:* o estado do dia, e a refeição fica sem marca.
4. **"Como no plano" em um toque para um dia passado** (D · M2‑12): é o atalho
   mais fácil para adesão inflada, e adesão inflada já deu corte sem motivo
   (F212, F292). *Escrito:* existe, sempre com a frase do que foi gravado e com
   "Desfazer" na própria linha.
5. **Quais números da bioimpedância** (D2) e **com que frequência as medidas com
   fita** (D1). Não medido (P6). *Escrito:* "Bioimpedância · uma vez por mês" e
   as medidas sem previsto, porque sem frequência não há o que prever (V3).
6. **Ele lê a tela a 3 m?** P7 ficou sem esta parte; não medido. Decide se a
   sessão de fotos fala por texto grande ou por som — e som exige um toque antes
   (F58). *Escrito:* o texto da pose em tipo grande, e nada que dependa de som.
7. **A palavra do RIR em toda série ou só na última de cada exercício?** É
   pergunta para o agente treinador (F94). *Escrito:* "RIR desta série ·
   opcional · alvo 1", em toda série.
8. **O aviso de subir carga, com o RIR fora do cálculo** (F169): mantenho a
   frase "A conta não olha o RIR. Quem decide é você.", ou o aviso espera o
   cálculo conferir o RIR? *Escrito:* a frase, com o RIR da última vez ao lado.
9. **A E1 ao encerrar, contra a recusa escrita das duas direções.** As duas
   recusam perguntar sob o relógio; a exigência manda perguntar. Escrevi as
   palavras da exigência e não resolvi o conflito: é decisão do dono, e o custo
   está em A4 e A5.
