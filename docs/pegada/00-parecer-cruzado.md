# Pegada — o parecer cruzado

Levantamento feito em setembro de 2026 por duas revisões **independentes**: uma
com recorte de treino de musculação (o que muda o estímulo) e outra com recorte
de educação física (o que machuca). As duas leram a mesma lista — 45 exercícios
prescritos e 126 substitutos — sem ver o resultado da outra.

**Isto é pesquisa, não prescrição.** Nada aqui veio do treinador dele. Serve
para decidir o que o app pode dizer com segurança, e é o documento a levar para
o treinador quando a dúvida for de execução.

## O que as duas concordaram

- **Largura de pegada no pulldown não muda ativação de dorsal.** As duas citam
  Andersen et al. (2014), 6RM em três larguras. O que muda com a largura é carga
  suportada, participação do bíceps, amplitude e conforto do ombro — não o alvo.
  Consequência: uma instrução do tipo "pegada aberta pega mais dorsal" seria
  falsa, e o app não vai dizer isso.
- **Elevação lateral e frontal: punho neutro, polegar para cima, parar na altura
  do ombro.** Pronar (polegar para baixo) fecha o espaço subacromial. Vale o
  destaque porque cruza com a queixa de ombro anterior que o app já rastreia.
- **Na perna, a decisão não é da mão, é do pé.** Leg press, pendulum, hack,
  elevação pélvica, panturrilha: a posição do pé é o equivalente da pegada, e é
  ela que interage com o tendão patelar. Quanto mais flexão de joelho, mais
  força no tendão.
- **Nomes ambíguos existem e são muitos.** "Pullover em máquina ou cabo",
  "Crunch no cabo ou máquina", "Elevação de pernas ou reverse crunch", "Leg
  press" sem ângulo, "High row", "Remada cavalinho", "Rosca Bayesian". As duas
  revisões marcaram confiança baixa nos mesmos itens.
- **A panturrilha não tem decisão relevante de pé.** A revisão de musculação
  chegou a marcar `ESCOLHA` e depois se corrigiu: a evidência de que girar a
  ponta muda recrutamento é fraca. O que muda é joelho esticado (gastrocnêmio)
  vs dobrado (sóleo), e isso já está definido pelo exercício.

## Onde discordaram — e é aqui que está o valor

### 1 · Terra romeno, supino no Smith, rosca Scott, extensão de tríceps

A revisão de musculação deu instrução de pegada, com confiança alta. A de
educação física classificou os quatro como **NÃO RESUMIR**.

Não é contradição de fato: as duas frases são verdadeiras. É contradição de
**valor**. No terra romeno, "pegada pronada na largura dos ombros" está correto
e é inútil — o que protege a lombar é o quadril indo para trás com coluna
neutra, e quem lê a frase cumpre a frase e ainda arredonda a coluna. No supino
inclinado no Smith, o crítico é a posição do banco em relação ao trilho fixo,
não a mão.

**Resolução adotada:** onde a pegada é verdadeira mas não é a variável que
importa, o app **não mostra pegada**. Meia instrução dá a sensação falsa de que
a execução está coberta.

### 2 · Rosca Scott — o caso mais sério

Musculação: `MAQUINA`, confiança alta, "supinada nos pegadores, braço colado".
Educação física: **RISCO de cotovelo**, com relato de ruptura bilateral do
tendão distal do bíceps neste exercício e análise de vídeo apontando cotovelo
quase estendido + antebraço supinado como o mecanismo.

O ponto: a instrução curta esconde a única coisa que decide — **quanto** estender
no fim. "Estenda o cotovelo" pode induzir hiperextensão com carga; "não estenda"
apaga amplitude útil. Sem saber carga e histórico, o app não deve arbitrar.

### 3 · Remada alta — o que só uma das duas viu

A revisão de educação física a marcou como **o item de maior risco de ombro da
lista inteira**, com contraindicação relativa em literatura (abdução com rotação
interna fecha o espaço subacromial; o pico de impacto fica entre 70–120° de
elevação). A revisão de musculação a tratou como exercício comum, confiança
média, sem sinalizar risco.

Isto sozinho justifica ter rodado as duas.

### 4 · Leg press — discordância não resolvida

Musculação: a posição do pé é a decisão principal, confiança alta.
Educação física: **NÃO RESUMIR** — a posição do pé muda três coisas ao mesmo
tempo (alvo muscular, carga no tendão patelar, risco de a lombar descolar no
fundo), e uma frase escolhe uma e ignora duas.

**Não arbitrei.** Ver [decisões pendentes](#decisões-pendentes).

## As três queixas que o app já rastreia

- **Cotovelo** — extensão de tríceps acima da cabeça, rosca Scott, rosca
  Bayesian, pushdown com barra reta, tríceps testa, rosca direta/inversa com
  barra reta, straight-arm pulldown com cotovelo travado. Padrão comum: posição
  alongada + cotovelo migrando + pegada que força supinação ou pronação rígida.
- **Ombro anterior** — dois mecanismos distintos, que pedem dicas distintas:
  **(a)** alongamento excessivo da cápsula anterior (crucifixos, crossover,
  supinos, mergulho) → controle é *não passar da linha do tronco*;
  **(b)** fechamento do espaço subacromial (elevação lateral e frontal, remada
  alta) → controle é *punho neutro e parar na altura do ombro*.
- **Patelar** — extensora, pendulum, leg press, hack, sissy squat, belt squat,
  lunges com sandbag, aterrissagem do burpee. A variável é o ângulo de flexão do
  joelho, controlado pela posição do pé ou pela profundidade. Registro sem
  prescrever: tendinopatia patelar **não** contraindica esses exercícios —
  protocolos clínicos usam extensora e leg press de propósito, com amplitude
  controlada. Qual amplitude é decisão do treinador.

## Como foi resolvido

1. **Leg press e agachamentos guiados** — mostra posição neutra ("largura dos
   ombros, no meio da plataforma"). A objeção da revisão de educação física era
   à frase que ESCOLHE um alvo e ignora os outros dois efeitos; um ponto de
   partida neutro não faz isso.
2. **Autoria** — campo separado (`peg`), com rótulo próprio e anatomia visual
   diferente da `cue`: a dica é prosa na voz do treinador, a pegada é rótulo
   mono + valor na voz do app. A procedência está dita por extenso na seção de
   execução do GUIA, **uma vez**, em vez de em cada um dos 48 cartões.
3. **Onde o treinador já falou** — campo vazio. É o caso do pulldown
   convergente, que ele prescreve em neutra; a palavra dele vence.

**Cobertura:** dos 45 exercícios prescritos, **29 têm pegada e 16 calam** — os
que caem em "não resumir", os de nome ambíguo e os sem decisão real (rosca
martelo é neutra por definição). O vazio é o desenho funcionando, não uma
pendência.

**Uma deriva consciente da revisão de segurança:** o `Sled pull` foi
classificado como "não resumir", e mesmo assim o app diz *"mão sobre mão; nunca
enrole a corda no braço"*. A objeção era a resumos que induzem técnica errada;
esta metade é proibição pura, sem trade-off, e omiti-la seria mais arriscado que
dizê-la.

## Fontes

Andersen et al. 2014 (largura no pulldown) · EMG de elevação lateral em
fisiculturistas · StatPearls, síndrome do impacto · NSCA, remada alta e impacto
subacromial · relato de ruptura bilateral do tendão distal em rosca Scott ·
análise de vídeo de rupturas do bíceps distal · JOSPT, tendinopatia patelar ·
quantificação de deformação do tendão patelar no agachamento · técnica de sled
push e sled pull no HYROX.
