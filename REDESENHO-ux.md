# Redesenho — revisão de UX

Revisão feita do zero, ignorando o roadmap anterior. O ponto de partida é o uso
que você descreveu, não o app que existe.

---

## O que eu entendi

Declarado por você:

- É seu, uso pessoal, contínuo
- Quer **acessar sempre**, não só na hora de treinar
- Quer ver **os dias que foi** e **quanto treinou**
- Quer que seja fácil de ver e acompanhar
- **Não quer botão de salvar.** Registro deve ser automático

Preenchido por mim, e marcado como tal para você poder discordar:

- **"Acessar sempre" implica dois usos diferentes.** Um é registrar, de pé na
  academia. O outro é conferir, sentado, em qualquer momento do dia. Hoje o app
  serve bem o primeiro e não serve o segundo: ele abre direto na lista de
  exercícios, que é a tela errada para quem só quer olhar.
- **"Quanto eu treinei" tem três respostas** e você provavelmente quer as três:
  quantos dias, quanto tempo, quanto peso movido. Volume existe. Dias estão
  enterrados. **Tempo não é medido em lugar nenhum.**
- **Sem botão de salvar, você precisa de desfazer.** Se todo toque registra, todo
  toque errado também registra.
- **Consistência importa mais que qualquer número por sessão.** Você pediu para
  ver os dias que foi — não os recordes. O desenho deve refletir essa ordem.

---

## A equipe

| Especialista | Lente |
|---|---|
| **Designer de interação mobile** | Custo por toque, uma mão, sequência de gestos |
| **Arquiteto de informação** | O que mora onde, quantos níveis, o que abre primeiro |
| **Designer comportamental** | Hábito, consistência, o que motiva e o que faz desistir |
| **Designer de visualização** | Legibilidade de relance, densidade, hierarquia numérica |
| **Ergonomia situacional** | 6h15, mão suada, luz baixa, atenção dividida |
| **UX writer** | Voz do app, microcopy, o que uma tela promete |

---

## O diagnóstico central

**O app foi desenhado como formulário. Você descreveu um diário.**

No modelo de formulário, existe um estado intermediário — "preenchido mas não
enviado" — e uma transação que o encerra: o botão `Salvar treino A`. Isso vem de
software de escritório e não tem nada a ver com o que acontece na academia.

No modelo de diário, não existe estado intermediário. Você fez a série, a série
aconteceu. O registro é consequência do fato, não um envio.

Tudo o que te incomoda desce daí:

1. **Existe algo "não salvo".** Você carrega isso na cabeça durante 75 minutos.
2. **A sessão só passa a existir depois do commit.** Se você esquecer de salvar,
   o rascunho expira em 14 horas e o treino inteiro desaparece.
3. **O app não sabe quando você começou nem quando terminou.** Não há duração,
   porque não há nada marcando o início.
4. **A rotação depende do botão.** Sem salvar, o app não avança para o próximo
   treino.
5. **Frequência é invisível.** A única informação sobre isso é `ciclo 3 · 47
   sessões` no canto do cabeçalho. Ela não te diz um único dia em que você foi.

> **Arquiteto de informação:** o app tem seis telas e nenhuma delas responde
> "como foi meu mês". Isso não é um recurso faltando, é uma ausência estrutural:
> o histórico existe por exercício, nunca por data. O app sabe tudo sobre supino
> inclinado e nada sobre novembro.

---

## As quatro mudanças estruturais

### 1. Registro contínuo, sem transação

Série com carga e repetição preenchidas vira registro sozinha, com uma pausa de
menos de um segundo depois da última tecla. A sessão nasce na primeira série
completa. Não há nada para enviar, e não existe mais estado não salvo.

A sessão se encerra sozinha: quatro horas sem nenhuma entrada, ou virada do dia.
No encerramento, o app grava a duração e avança a rotação — as duas coisas que o
botão fazia.

> **Ergonomia situacional:** esse é o ponto de maior risco do redesenho. Toque
> acidental com mão suada agora escreve no histórico. A resposta não é
> confirmação — confirmação é o botão de salvar disfarçado. A resposta é
> desfazer.

### 2. Uma tela para acompanhar, no mesmo nível das outras

Calendário do mês com a letra do treino em cada dia, três números do período
(dias, tempo, volume) e a lista dos últimos treinos com data, duração e volume.

É a tela que responde à sua frase "quero saber os dias que eu fui e quanto eu
treinei", e hoje ela simplesmente não existe.

### 3. Duração medida sozinha

Da primeira série da sessão até a última. Sai de graça do registro contínuo, e é
a peça que falta para o "quanto eu treinei" ficar completo. Também te diz se
está estourando sua janela de 6h15 às 7h30.

### 4. Desfazer no lugar de confirmar

Toda escrita automática mostra um aviso curto com **desfazer** por alguns
segundos. Passado isso, a correção continua existindo no histórico, que já tem
edição e exclusão de sessão.

---

## O desenho, tela a tela

### Hoje — a tela que abre

Um scroll só, contexto em cima, trabalho embaixo.

```
┌──────────────────────────────────┐
│ quinta · 06:42                   │
│                                  │
│ Treino B  em andamento           │
│ 34 min · 9 séries · 4.120 kg     │
│                                  │
│ S  T  Q  Q  S  S  D              │
│ A  ·  C  B  ·  ·  ·              │   ← semana, letras nos dias que foi
├──────────────────────────────────┤
│ 01  Puxada aberta pronada        │
│     4 × 8–12                     │
│ ...                              │
```

O topo muda de estado sozinho: antes de começar mostra qual é o treino da vez;
durante, mostra o que já foi feito; depois de encerrado, o fechamento do dia.

> **Designer de interação:** a tentação aqui é criar uma home separada e empurrar
> os exercícios para dentro dela. Seria um toque a mais toda manhã, para servir a
> um uso que acontece uma vez por dia. Contexto e trabalho na mesma tela custam
> zero toques.

### Acompanhamento — a tela nova

```
┌──────────────────────────────────┐
│ agosto                           │
│                                  │
│  15 dias   11h20   142 mil kg    │
│                                  │
│  S  T  Q  Q  S  S  D             │
│           A  B  C  ·  ·          │
│  D  E  ·  A  B  C  ·             │
│  ·  D  E  F  A  ·  ·             │
│  B  C  D  ·  E  F  ·             │
│  A  B  ·  ·                      │
│                                  │
│  4,8 treinos por semana          │
│  média das últimas 4 semanas     │
├──────────────────────────────────┤
│ ontem      C   52 min   6.240    │
│ 04/08      B   61 min   7.980    │
│ ...                              │
```

Calendário com a letra em cada dia treinado. Um dia vazio é um ponto apagado, não
um buraco vermelho.

### Corpo

Peso, cintura e cardio como estão hoje, com o registro seguindo a mesma regra:
digitou, registrou, com desfazer.

### Ajustes

Regras de execução e a aba de dados juntas. As duas são referência, consultadas
raramente, e não precisam de espaço na barra principal.

**Quatro abas: hoje · acompanhamento · corpo · ajustes.**

---

## Onde a equipe discordou

**Sequência de dias versus média móvel.** O designer comportamental queria
contador de sequência — "12 dias seguidos" motiva. Os outros dois vetaram, e eu
concordo: sequência pune a quebra. Você treina 5 a 6 vezes por semana, então a
sequência quebra por definição todo domingo, e o número vira ou uma mentira ou
uma cobrança. **Decisão: média móvel de treinos por semana, mais o calendário.**
O calendário mostra a verdade sem opinar sobre ela.

**Registrar peso e cintura automaticamente.** Aqui a equipe travou. Uma série de
treino tem dois campos que se validam mutuamente — carga *e* repetição
preenchidas é um sinal forte de intenção. Um campo numérico solto não tem isso:
sair do campo com "7" digitado por engano viraria 7 kg no seu histórico corporal.
**Decisão: mantive um toque para peso e cintura**, mas um só, grande, sem nada
parecido com formulário. É a única exceção ao "sem botão", e é deliberada.

**O que acontece se você abandonar um treino no meio.** O comportamental queria
que a sessão sumisse se tivesse menos de três séries; o arquiteto argumentou que
apagar dado do usuário sozinho é sempre errado. **Decisão: a sessão fica.** Duas
séries num dia são um fato, e você tem exclusão no histórico se quiser limpar.

---

## Os gaps que preenchi

Decisões que tomei sem você ter dito, para você conferir:

1. Sessão encerra sozinha após **4 horas** de inatividade ou na virada do dia.
2. A **rotação avança no encerramento**, não no registro da primeira série.
3. **Duração conta da primeira à última série**, não do momento em que você abriu
   o app — abrir para conferir algo às 5h30 não deve inflar o tempo.
4. O app **abre na tela de hoje**, sempre, mesmo que você tenha saído em outra.
5. **Sem meta de frequência configurável.** Você treina 5 a 6 vezes por semana; o
   app mostra o número real e não inventa um alvo para comparar.
6. **Sem notificação, sem lembrete de treinar.** Você não pediu, e a manhã já tem
   alarme.
7. **Volume total do mês é somado apesar de misturar músculos.** Não serve para
   decisão de treino, serve para você ver movimento. O número por exercício, esse
   sim decisório, continua no histórico de cada um.

---

## Ordem de implementação

1. **Registro contínuo e duração.** É a mudança estrutural: muda o modelo de
   dados, exige migração e derruba o botão de salvar. Tudo o mais depende dela.
2. **Tela de acompanhamento.** É o que você pediu para ver.
3. **Tela de hoje e reorganização das abas.** Contexto no topo, quatro abas.
4. **Desfazer e ajustes finos** do registro automático.

O passo 1 é o único com risco real de regressão, porque toca em dado já salvo. A
migração mantém tudo o que existe: sessões antigas continuam válidas, apenas sem
duração — o app mostra um traço no lugar do tempo para elas.
