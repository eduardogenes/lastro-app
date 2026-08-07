# Treino Eduardo — diagnóstico de fluxo ponta a ponta

Estado analisado: `treino-app/index.html`, 1.868 linhas, 90 KB, 41 exercícios,
5 abas, PWA instalável no iPhone.

O app foi construído em quatro fases, cada uma resolvendo um pedaço. Cada peça
funciona. A pergunta desta análise é outra: **como aplicação de treino, ele
acompanha uma pessoa do primeiro dia até o fim de um bloco de 48 sessões?**

A resposta curta é que ele acompanha muito bem a sessão, razoavelmente a semana,
e quase nada o bloco. Os buracos estão nas costuras entre os ciclos.

---

## A equipe

| Especialista | O que ele olha |
|---|---|
| **Coach de hipertrofia** | Dose semanal por músculo, progressão, adesão ao programa |
| **Fisioterapeuta esportivo** | Tendão, dor, o freio de carga que justifica o app existir |
| **Designer de produto mobile** | Uso real: de pé, uma mão, suado, 6h15 |
| **Engenheiro de confiabilidade** | Estado, persistência, comportamento do iOS |
| **Analista de dados aplicados** | Peso, cintura, qualidade da decisão de dieta |
| **Custódia de dados** | Perda silenciosa, backup, migração, longevidade |

---

## O fluxo, mapeado

### Ciclo 0 — a primeira vez (hoje: inexistente)

Você abre o app pela primeira vez e ele mostra o treino A com todos os campos
vazios e nenhum contexto. Não há uma tela que diga o que ele é, como a rotação
funciona, por que existe um freio de carga, ou que o histórico mora só naquele
aparelho até você exportar.

Para você isso não importa — você mandou construir. Importa se algum dia outra
pessoa usar, e importa como sinal: **o app não tem um momento em que se explica.**

> **Custódia de dados:** o pior é que ele também não avisa que o histórico é
> local. Alguém que use por três meses e troque de celular descobre a regra
> da pior maneira possível.

### Ciclo 1 — a sessão (6h15 → 7h30) · o mais bem resolvido

| Momento | O app faz | Buraco |
|---|---|---|
| Chega na academia, abre o app | Abre no dia certo, com rascunho se houve treino interrompido | — |
| Aquece | Nada | Regras mandam 2–3 séries de aproximação; não há onde registrar nem lembrete |
| Primeiro exercício | Mostra faixa, dica, placeholder da última vez, selo de subir carga | — |
| Máquina ocupada | Oferece 3 substitutos, histórico separado | — |
| Executa a série | Registra carga × reps, rascunho salvo a cada tecla | — |
| Descansa | Cronômetro 3 min / 90 s | **Congela quando a tela apaga.** Ver P0-1 |
| Dor no cotovelo | Chip de dor + observação, aviso na próxima vez | — |
| Bi-set (treino D) | Nada os distingue | Os dois exercícios do par são tratados como independentes |
| Salva | Volume total, rotação avança | Não há resumo da sessão: o que subiu, o que caiu, o que bateu recorde |
| Sai | — | Não sabe quanto tempo você levou |

> **Designer:** a sessão é o ponto forte do app e dá para sentir que foi
> desenhada por quem imaginou a pessoa suada de pé. O problema é o fim: você
> aperta salvar e o app te despeja no treino seguinte, que é daqui a 24 horas.
> O momento de maior atenção do usuário — acabei de terminar, o que eu fiz? —
> é justamente o que não tem tela.

### Ciclo 2 — a semana

O app rastreia cardio por semana (contador 2 de 3, reset na segunda) e conta
pesagens (X de 4). Funciona.

O que ele **não** conta é a única dose que a literatura de hipertrofia trata
como variável principal: **séries por grupo muscular por semana.**

> **Coach:** o programa inteiro foi escrito em torno de seis pontos fracos —
> deltoide lateral, deltoide posterior, dorsais, espessura de costas, peito
> superior, panturrilha. A elevação lateral aparece em três treinos diferentes
> justamente por isso, e a dica do treino E diz "terceira dose semanal, é
> acúmulo, não excesso". Ou seja: a intenção da dose semanal está escrita nas
> dicas, mas o app não sabe somar. Se você pular o treino D duas semanas
> seguidas, o deltoide lateral desaba de ~10 séries para ~6 e nada na tela
> registra isso.
>
> Não é prescrição nova. É medir a adesão à prescrição que já existe.

Buracos do ciclo semanal:

- Nenhuma noção de grupo muscular no modelo de dados (confirmado no código)
- Nenhuma visão de "como foi minha semana" — só o dia de hoje
- Rotação não fixa em semana é uma decisão certa, mas torna a dose semanal
  invisível justamente porque ela varia

### Ciclo 3 — o mês

Peso vira média semanal, cintura compara última medida contra ~30 dias atrás,
e o app emite um dos três vereditos. Esse ciclo é o mais bem modelado depois
da sessão.

> **Analista de dados:** um detalhe incomoda. O peso é tratado com o rigor
> certo — média semanal, ritmo sobre duas semanas, porque o valor do dia é
> ruído. A cintura recebe tratamento oposto: **uma medida solta contra outra
> medida solta.** Fita métrica tem erro de posicionamento maior que a balança
> tem de variação de água. Se a regra dispara "comer menos" com base em duas
> medidas isoladas separadas por um mês, ela vai disparar errado às vezes.
> A correção é barata: aplicar a mesma média semanal na cintura.

### Ciclo 4 — o bloco (48 sessões) · o mais frágil

Aqui o app quase desaparece.

- O aviso de deload aparece nas últimas 6 sessões e o modo pode ser ativado
- Mas as sessões de deload **continuam contando** para as 48, então o contador
  não representa mais 48 sessões de trabalho
- Não há nenhuma retrospectiva de bloco: em 48 sessões, o que evoluiu? Quais
  exercícios travaram? Onde a dor apareceu mais?
- **O histórico guarda 12 sessões por exercício.** Com rotação de 6 dias, cada
  exercício aparece ~1 vez por semana. 12 sessões ≈ 3 meses. Depois disso o app
  **descarta silenciosamente** a sessão mais antiga — e o backup em JSON só
  carrega o que sobrou.

> **Custódia de dados:** essa é a mais grave da lista. Um bloco de 48 sessões
> dura cerca de 8 a 9 semanas por treino; dois blocos passam de 12. O app está
> programado para apagar a memória de longo prazo dele mesmo, sem avisar, e
> o backup não salva porque o dado já morreu antes de ser exportado.
> Não há razão técnica: o estado inteiro com anos de treino não passa de
> algumas centenas de KB.

### Eventos fora do trilho

| Evento | O app aguenta? |
|---|---|
| Máquina ocupada | Sim, bem resolvido |
| Dor de tendão aparece | Sim, marca e avisa depois |
| Dor persiste, tira o exercício por 2 semanas | **Não.** A regra existe nas RULES, mas não há como aposentar um exercício temporariamente |
| Viagem, doença, 10 dias parado | **Não.** Volta como se nada tivesse acontecido, com selo de subir carga baseado na sessão de 10 dias atrás |
| Erra a digitação e só percebe depois | **Não.** Não existe editar sessão passada |
| Troca de celular | Só se lembrou de exportar |
| Quer registrar no computador | **Não.** Estado é local ao aparelho |
| Termina o bloco de 48 | Nada acontece |

---

## Diagnóstico por especialista

### Coach de hipertrofia

**Vê:** um bom diário de treino. **Sente falta de:** um painel de dose.

1. Séries por grupo muscular na semana corrente, comparado com a média das
   últimas 4 semanas. Mede adesão, não prescreve nada novo.
2. Sinalizar quando um exercício está parado há N sessões — hoje o selo só
   avisa quando é hora de subir, nunca quando algo empacou.
3. Séries de aproximação: as regras pedem, o app ignora.
4. Bi-sets do treino D deveriam encadear o descanso, não oferecer 90 s em cada.

### Fisioterapeuta esportivo

**Vê:** o freio de carga funcionando — faixa de reps, selo condicionado a todas
as séries no topo, falha só em isolador, marcador de dor. Isso é melhor que a
maioria dos apps comerciais.

1. **A dor marcada não tem consequência.** Ela é registrada e mostrada, mas o
   app continua oferecendo o mesmo exercício, com a mesma carga de placeholder,
   e o selo de subir carga continua podendo aparecer. A regra escrita diz
   "tire por 2 semanas e substitua o ângulo" — o app tem substituição pronta e
   não a conecta com a dor.
2. Retorno de pausa longa: depois de 10+ dias parado, propor a carga anterior
   como placeholder é o oposto do que o resto do app defende.
3. Sugestão de baixo custo: quando a dor for marcada duas sessões seguidas no
   mesmo exercício, o app abre o painel de substituição sozinho.

### Designer de produto mobile

1. **O fim da sessão é vazio.** Falta a tela de "treino salvo" com 3 números.
2. Cinco abas em scroll horizontal já está no limite. `treino` / `corpo` /
   `dados` com cardio dentro de corpo seria mais honesto — cardio e corpo são
   o mesmo assunto: o que acontece fora da barra.
3. Para salvar, você rola por 7 exercícios até o botão no fim. Um botão fixo
   resolveria, mas conflita com o cronômetro que já ocupa o rodapé.
4. O app nunca comemora nada. Recorde de carga, primeira vez batendo o topo da
   faixa em todas as séries, 10 semanas seguidas de adesão — tudo passa em
   branco. Não é enfeite: é o que sustenta uso diário por meses.

### Engenheiro de confiabilidade

1. **O cronômetro decrementa um contador a cada segundo.** Quando a tela do
   iPhone apaga ou você troca de app, o iOS suspende o JavaScript. Você volta
   e o cronômetro está congelado no ponto onde parou. Correção: guardar o
   instante-alvo e calcular a diferença contra `Date.now()` a cada tick.
2. **A vibração provavelmente não funciona no seu iPhone.** O Safari nunca
   adicionou suporte nativo à Vibration API — há relatos conflitantes recentes,
   mas não dá para contar com ela. Alternativa real: `AudioContext` com um bipe
   curto, que funciona e não depende de permissão.
3. **Screen Wake Lock** passou a funcionar em PWAs instalados a partir do
   iOS 18.4. Segurar a tela acesa durante o treino resolve o problema anterior
   e melhora o uso de mão suada — hoje a tela apaga entre séries.
4. Não há tratamento de quota cheia no `localStorage`; a escrita falha em
   silêncio dentro de um `catch` vazio.

### Analista de dados aplicados

1. Cintura sem média semanal (ver Ciclo 3).
2. O ritmo de peso usa duas médias semanais. Regressão linear sobre todos os
   pontos das últimas 3 semanas seria mais estável e não custa mais código.
3. O veredito não considera o treino: ganhar 0,5 kg/semana numa semana de
   deload significa algo diferente de ganhar na semana de maior volume. Os
   dados para cruzar isso já estão todos no estado.

### Custódia de dados

1. **Teto de 12 sessões apagando histórico** — o item mais grave (ver Ciclo 4).
2. Backup é manual e depende de lembrar. Nada no app pede.
3. Importar substitui tudo sem criar cópia do que estava lá.
4. Não há número de versão no estado. Se um dia o formato mudar de verdade,
   não há como saber de qual versão veio o backup.

---

## Onde a equipe discorda

**Coach × Designer sobre o painel de dose semanal.** O coach quer séries por
músculo visíveis. O designer argumenta que isso adiciona uma sexta aba a um app
que já tem cinco, para uma informação que se olha uma vez por semana e não às
6h15. *Encaminhamento: entra como bloco dentro da aba de corpo, não como aba
nova, e só aparece depois de 2 semanas de dados.*

**Fisioterapeuta × Coach sobre a dor abrir a substituição sozinha.** O
fisioterapeuta quer automático. O coach pondera que dor de cotovelo em rosca
direta não deveria mudar o supino, e que automação demais faz a pessoa parar de
marcar a dor para não ser incomodada. *Encaminhamento: sugerir, nunca trocar
sozinho — um aviso com botão "ver alternativas", que é um clique.*

**Engenheiro × regra do arquivo único sobre sincronizar entre aparelhos.** Só
existe com servidor ou conta em serviço externo. *Encaminhamento: não vale
agora. Exportar JSON resolve 90% do risco a custo zero. Reavaliar se você
começar a registrar do computador.*

---

## Roadmap priorizado

Ordem é impacto contra esforço. P0 são coisas que já estão custando dado ou
confiança hoje.

### P0 — consertar antes de qualquer novidade · **CONCLUÍDO**

| # | O quê | Por quê | Estado |
|---|---|---|---|
| 1 | Cronômetro baseado em instante-alvo | Congelava com a tela apagada — o recurso mais usado da sessão estava quebrado no iPhone | Feito |
| 2 | Remover o teto de 12 sessões | Apagava o histórico de longo prazo em silêncio, e o backup não salvava | Feito |
| 3 | Bipe por áudio no lugar da vibração | A vibração não é confiável no iPhone; o fim do descanso não avisava nada | Feito |
| 4 | Wake lock durante a sessão | Tela apagando entre séries, com mão suada | Feito |

Detalhes da implementação: o cronômetro guarda o instante em que o descanso
acaba e recalcula contra `Date.now()` a cada 250 ms, com um ouvinte de
`visibilitychange` que religa o intervalo e repinta ao desbloquear. O aviso é um
bipe duplo de 880 Hz por Web Audio, com o `AudioContext` nascendo dentro do
gesto do usuário (exigência do iOS) e a vibração mantida como bônus onde
existir. Se o descanso zerar com o app em segundo plano, ele não toca ao voltar
— avisar de um descanso que acabou há três minutos é pior que não avisar. O teto
por exercício foi de 12 para 500 sessões, só como trava de sanidade.

**Ressalva honesta sobre o bipe:** com o iPhone no modo silencioso, o Web Audio
pode não tocar. A combinação que resolve na prática é o wake lock mantendo a
tela acesa com o cronômetro à vista.

### P1 — buracos de fluxo, barato e alto impacto · **CONCLUÍDO**

| # | O quê | Estado |
|---|---|---|
| 5 | Tela de resumo ao salvar o treino: volume, o que subiu, recordes | Feito |
| 6 | Séries por grupo muscular na semana (bloco dentro de corpo) | Feito |
| 7 | Editar ou apagar uma sessão passada | Feito |
| 8 | Média semanal também para a cintura | Feito |
| 9 | Dor duas vezes seguidas → aviso com atalho para substituir | Feito |
| 10 | Pausa longa detectada → não sugerir subir carga, avisar sobre retomada | Feito |

Notas de implementação:

- Os 41 exercícios ganharam um campo de grupo muscular. O painel conta **séries
  registradas**, não prescritas — é medida de adesão, não prescrição nova.
  Substituto conta para o músculo do exercício que ele substituiu.
- O painel compara a semana corrente com o **mesmo ponto** das últimas 4
  semanas, não com semanas cheias. Sem isso, toda terça-feira o painel inteiro
  apareceria despencando e o número não significaria nada.
- Pausa longa: 14 dias sem registrar aquele exercício suspende o selo de subir
  carga e mostra o aviso. O app não propõe carga de retomada — isso seria
  prescrição nova, e não está no programa.
- Dor recorrente **sugere**, nunca troca sozinho: um aviso com botão que abre as
  alternativas. Automatizar faria você parar de marcar a dor para não ser
  incomodado.
- Correção de sessão passada permite mexer nas séries, na dor e na observação,
  ou apagar a sessão inteira.

### P2 — produto · **CONCLUÍDO**

| # | O quê | Estado |
|---|---|---|
| 11 | Retrospectiva de bloco ao completar 48 sessões | Feito |
| 12 | Deload não contar para o contador de 48 | Feito |
| 13 | Bi-set encadeando descanso | Feito |
| 14 | Registro de séries de aproximação no primeiro exercício | Feito |
| 15 | Recordes e marcos de adesão | Feito |
| 16 | Lembrete de backup a cada 30 dias | Feito |
| 17 | Reorganizar as abas | Feito — 4 em vez de 5 |

Notas de implementação:

- **Retrospectiva**: banner ao fechar as 48, e acesso permanente pela aba dados.
  Mostra treinos por semana, volume acumulado, o que subiu ordenado por
  evolução, o que ficou parado com 3 ou mais sessões na mesma carga, e a dor
  acumulada no bloco.
- **Deload**: sessões em modo deload são marcadas e ficam fora da conta das 48.
  O contador volta a significar 48 sessões de trabalho.
- **Bi-set**: o primeiro do par não oferece descanso — o botão vira "próximo" e
  abre o segundo exercício. O cronômetro só entra depois do par completo, que é
  o que a dica do treino D já mandava.
- **Aquecimento**: bloco só no primeiro exercício do dia, com marcação salva na
  sessão.
- **Abas**: cardio virou uma seção dentro de corpo. Ficaram quatro —
  treino de hoje, como executar, corpo, dados. "Como executar" foi mantida
  contra a proposta original de três: é referência de execução e some do radar
  se virar subseção.
- **Backup**: abrir o JSON já conta como backup, não só o download. Quem copia o
  texto na mão nunca passaria pelo caminho do clipboard e o lembrete pediria
  para sempre.

### Estado atual

P0, P1 e P2 concluídos. O app tem 118 KB, um arquivo, sem dependência externa
além da fonte. Resta apenas o P3, que continua não valendo a pena até haver
razão concreta para um servidor.

### P3 — só se quebrar as regras valer a pena

| # | O quê | O que custa |
|---|---|---|
| 18 | Notificação de pesagem e de cardio | Web push funciona em PWA instalado desde o iOS 16.4, mas exige servidor para enviar. Um servidor só para lembrar de subir na balança é caro demais |
| 19 | Sincronizar iPhone ↔ computador | Backend + conta, ou um serviço de terceiros. Só se você passar a registrar dos dois lugares |
| 20 | Versionar o estado e migrar | Barato, mas só faz sentido junto de alguma mudança estrutural |

---

## Recomendação

Fazer P0 inteiro numa tacada — são quatro correções pequenas, todas dentro das
regras do projeto, e três delas consertam coisas que hoje não funcionam no seu
iPhone. Depois P1, que é onde o app deixa de ser um bom diário de sessão e passa
a acompanhar o bloco.

P3 não deveria ser tocado até você ter uma razão concreta: se em três meses você
ainda estiver registrando só pelo celular e ainda exportando o JSON de vez em
quando, ele não precisa de servidor nenhum.
