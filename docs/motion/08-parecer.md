# 08 · Parecer do motion

Coordenador. Junta os sete documentos do time (`01` a `07`) num plano único:
os princípios, os tokens, o que muda tela por tela em ordem de valor, o que é
decisão do dono e como a entrega vai ser conferida. Leitura no commit `a22b09d`
(o "antes"). Cada afirmação aponta para o documento que a mediu; as linhas de
código estão lá.

---

## 0. Em uma página

> **16/10:** o dono respondeu as treze decisões; §5.1 diz o que mudou e
> prevalece sobre o resto deste documento.

- **Hoje o app quase não se move, e o pouco que diz se mover não existe.** São
  quatro movimentos dentro do app (o fio da aba, a barra do descanso, o ponto
  ao vivo, o clarão da câmera). O "toque que afunda" que o dono aprovou nunca
  foi portado; o "voo" da série que dois comentários descrevem nunca existiu; a
  subida da folha que o dono decidiu em 06/10 não está no código. Dos 28
  controles medidos, 16 não mudam nada no toque (01, 03).
- **A doutrina muda**: de "quase nenhum movimento" para **"movimento explica, e
  só explica"** — cada movimento diz de onde a camada veio, para onde se andou,
  o que mudou ou que o toque pegou. **Camada se move; conteúdo não.** Mola,
  comemoração, esqueleto e altura animada continuam proibidos (06 §1).
- **Quatro durações** de 40 em 40 ms (toque 120, no lugar 160, camada sai 200,
  camada entra 240), **uma curva** sem ultrapassagem, distâncias curtas em `px`.
  Tudo em `src/tokens.css`, e um teste reprova tempo ou curva escritos fora dele
  (06 §2, §5).
- **O toque nunca espera**: o dado grava no toque, nada escuta o fim de uma
  animação, e um toque no meio de um movimento pula para o fim e chega ao que
  está sob o dedo — medido nos dois motores (02 §2.0).
- **O motor do iPhone roda nesta máquina** (WebKit 26.5, sem sudo): tudo é
  verificado em Chromium e em WebKit, com vídeo e números, antes e depois (04 §4).
- **Nove peças**, a primeira só de fundação (sem movimento novo), depois em
  ordem de valor: o toque, a série, o descanso, a folha, telas cheias e modo, a
  aba, o aviso, o resto. Cada uma num commit, com teste.
- **Treze decisões do dono** vão numa página publicada. Doze são de gosto
  (quanto tempo, de onde vem, o que fica com "Reduzir movimento"); a décima
  terceira é de escopo: o que fazer com os sete defeitos que o time achou e que
  não são de movimento.

---

## 1. Os princípios

A doutrina nova, para substituir o princípio 6 de `src/tokens.css` e o
inegociável 6 do `DESIGN.md` na primeira peça (texto inteiro em 06 §1):

1. **Movimento explica, e só explica.** Uma de seis coisas: de onde a camada
   veio, para onde se andou, o que mudou, que o toque pegou — ou, no ambiente,
   que o tempo corre e que a tela está viva. O que não diz nenhuma não entra.
2. **Camada se move; conteúdo não.** Folha, tela cheia, modo de sessão,
   cronômetro e aviso chegam pela borda de onde vêm e voltam por ela. Lista,
   cartão, linha e o painel que nasce sob o polegar (régua, teclado, RIR)
   aparecem no lugar: alvo que se move sob o dedo é alvo errado.
3. **Dois eixos, dois significados.** Horizontal é andar (aba de lado, tela
   cheia pela direita); vertical é camada temporária (folha, cronômetro). O que
   é do aparelho — cronômetro, aviso, faixas, barra de status — não anda quando
   as páginas passam (02 §1).
4. **Proibido pela forma, não pela contagem**: ultrapassagem e mola; qualquer
   quadro, curva ou tempo diferente para "feito", "6/6" ou "14/14"; número que
   rola; esqueleto que cintila; altura, largura ou posição animadas (só
   `transform` e `opacity`); movimento infinito; movimento no fim do descanso.
5. **O toque nunca espera.** O dado grava no toque; nada trava a entrada
   enquanto algo anima; um toque no meio vence (04 R2).
6. **O portão é por adesão.** Todo movimento mora dentro de
   `@media (prefers-reduced-motion: no-preference)`, com o estado final escrito
   fora; o JavaScript pergunta a uma porta só. Assim falha fechado: sob
   "Reduzir movimento" nunca há mais movimento do que sem a preferência (05 §1.4,
   06 §4).
7. **Nada que só se entenda pelo movimento.** Todo movimento novo vem com o
   equivalente parado que diz a mesma coisa (foco, título, texto, cor), e com a
   asserção de fluxo dele (05 §4).
8. **Foco nunca se perde**: a camada que chega recebe o foco no quadro zero; a
   que sai devolve a um lugar declarado, nunca ao `body` (05 §3.4).

**O que cai da doutrina velha**: "quase nenhum movimento", a contagem de
"quatro funções", "nada de animação de entrada" (cai para camada, fica para
conteúdo), "nada de fade" (cai para quatro usos nomeados: véu, conteúdo velho da
aba, aviso que apaga, dissolver sob "Reduzir movimento"). **O que fica**: sem
mola, sem comemoração, só `transform` e `opacity`, fim do descanso parado, e
"movimento novo entra na tabela antes de entrar no código" (06 §1, tabela).

---

## 2. Os tokens

Bloco completo, com o comentário de cada token, em 06 §2.5.

| família | tokens | valor |
|---|---|---|
| duração | `--ins-dur-toque` · `--ins-dur-lugar` · `--ins-dur-sai` · `--ins-dur-entra` | 120 · 160 · 200 · 240 ms |
| duração de função própria | `--ins-dur-dissolve` (só sob "Reduzir movimento") · `--ins-dur-amostra` (período do cronômetro, igual ao `setInterval`) · `--ins-ciclo-vivo` (pulso) | 120 ms · 250 ms · 2,4 s |
| curva | `--ins-curva` (o valor de hoje de `--ins-ease`, renomeado) · `--ins-curva-grandeza` (só a barra do descanso) · `--ins-curva-ciclo` (só o pulso, se ficar) | `cubic-bezier(.2,.8,.2,1)` · `linear` · `cubic-bezier(.4,0,.6,1)` |
| distância | `--ins-afunda` · `--ins-afunda-largo` · `--ins-pousa` · `--ins-sobe-aviso` · `--ins-passo-aba` · `--ins-recuo` | .95 · .98 · 4px · 8px · 20px · 30% |

`--ins-dur` (220) sai. Os valores de duração dependem da decisão 1 do dono
(quanto tempo); a escala de 40 em 40 faz a troca ser de um número só.

---

## 3. A técnica

- **Mudança no lugar** (toque, série, copo, aviso, cronômetro): transição CSS
  por classe. O Preact reaproveita esses nós a cada `render()` — medido em dez
  telas, zero nós recriados —, então a transição dispara sozinha e um `render()`
  no meio não a reinicia (04 §1.2, 03 §2).
- **Troca de camada** (tela cheia, modo, aba, a saída da folha): **View
  Transitions de mesmo documento**, disparadas num ponto só, o `render()`. É o
  único jeito de animar a saída sem manter a tela velha montada: o Preact a
  desmonta no mesmo desenho (02 §3.1). Existe no iOS 18 em diante, e o iPhone 11
  Pro Max recebe iOS 18 e 26 (02 §3.3).
- **A condição** (divergência 1, 02 × 04): durante uma View Transition o toque
  cai no `<html>` e se perde, nos dois motores. O protótipo da 02 pula para o
  fim e reenvia o clique ao que está sob o dedo, e assim o toque chega — medido
  no Chromium e no WebKit. **A técnica só entra com um teste de navegador que
  prove isso em cada camada, nos dois motores.** Se uma camada reprovar num
  motor, ela troca seco naquele motor (o app de hoje), e isso fica escrito.
- **A entrada da folha** não precisa de View Transition: anima no nascimento,
  por CSS (02 §3.2).
- **Uma porta só para o JavaScript** (`src/ui/movimento.js`): `podeMover()`,
  `podeDissolver()` e `tempo(nome)`, lidas na hora e respondendo "não" quando
  não sabem. É o único lugar que pode chamar `startViewTransition`, `.animate()`
  ou `matchMedia` de movimento (06 §4.2). Os testes de fluxo rodam em jsdom, sem
  essas APIs, e por isso continuam no caminho parado de hoje.

---

## 4. O que muda, peça por peça, em ordem de valor

Valor = quantas vezes acontece × o quanto ele perde o fio sem o movimento, no
momento de menor atenção (de pé, entre séries). Cada peça é um commit: código,
teste e checklist juntos. "Precondição" é conserto que não é movimento mas sem o
qual o movimento não funciona — entra na peça, não pergunta.

### Peça 0 · O sistema (sem movimento novo)

O chão de tudo, e a única peça que não muda o que ele vê — fora o fio da aba,
que passa a andar sem refazer layout.

- Tokens novos em `src/tokens.css` (§2), princípio 6 reescrito; `DESIGN.md`
  inegociável 6 e §Movimento reescritos, com a tabela de movimentos verdadeira.
- A porta `src/ui/movimento.js`.
- O portão por adesão; o bloco universal de `src/base.css:374` sai; os quatro
  movimentos que existem (fio da aba, barra, pulso, clarão) e os três da bancada
  entram no portão.
- O fio da aba anda em `transform` (hoje anima `left`: 14 layouts e 26 pinturas
  por troca contra 1 e 3, e congela quando a thread trava — 04 §1.6).
- As cinco guardas de `tests/dominio/estilo.test.ts` (06 §5): (a) tempo e curva
  só nos tokens, sem mola; (b) todo movimento no portão, fora dele o último
  quadro — reescreve o caso de `:1144` sem perder o que ele protege; (c) só
  `transform`, `translate`, `scale` e `opacity` se movem; (d) nenhum ancestral
  de elemento fixo cria bloco de contenção, agora com `.ins-modo` e uma metade
  de DOM que confere a lista; (e) nada escuta fim de animação. Junto, o caso que
  `estilo.test.ts:84-86` promete e não existe (a lista de folhas contra o disco).
- O clarão deixa de depender de `setTimeout` (06 §4.2) e passa a 200 ms.
- O ponto ao vivo conforme a decisão 12.
- Os comentários falsos saem (`voa()` em `index.html:61` e `src/main.jsx:5251`;
  o "aprovado" de `--ins-dur-toque`).

### Peça 1 · O toque que afunda

Toda interação. Hoje 16 de 28 controles não mudam nada e, no iPhone, `:active`
provavelmente nem dispara: o app não tem ouvinte de `touchstart` (03 §1.3, §1.4).

- Ouvinte passivo vazio de `touchstart` no documento (uma linha, sem esperar
  confirmação no aparelho).
- Controle pequeno afunda a `.95`, botão largo a `.98`, em 120 ms nos dois
  sentidos; linha inteira (topo do cartão, linha de refeição) só escurece.
- Todo controle ganha um estado de toque que se vê (hoje o "+1 copo" troca para
  um fundo igual ao do bloco, 1,00:1). O preenchimento é estado e mora fora do
  portão: com "Reduzir movimento" o toque continua visível, sem escala.
- Decisão 7 do dono.

### Peça 2 · A série recebida

O toque mais repetido do produto (~22 por sessão). Hoje a régua some, o número
aparece e o cronômetro nasce no mesmo quadro, e nada diz onde o valor entrou
(01 B1).

- O número **pousa** na célula que o recebeu: sobe 4 px e acende, em 160 ms, só
  sob uma marca de "recém" (03 §4.2). Vale para régua, RIR, coluna anterior e
  a carga do "+ série".
- Precondição: o `AudioContext` deixa de nascer dentro do toque da primeira
  série (hoje 74 ms no Chromium e 184 ms no WebKit; passa a nascer ao entrar no
  modo — 04 R8).
- Decisão 8 do dono (pouso ou voo).

### Peça 3 · O descanso

~22 por sessão. Hoje o cronômetro aparece de estalo e empurra o aviso e a faixa
82 px (01 B4).

- O cronômetro **sobe** da borda de baixo em 240 ms e **desce** em 200 ms; o
  aviso e a faixa acompanham no mesmo tempo, pela propriedade `translate` (que
  não desfaz o `translateX(-50%)` que os centra).
- O fim do descanso continua sem movimento: o canal é o som e o "vai".
- Precondição: no modo, cronômetro e aviso flutuam 52 px acima do fundo, com
  conteúdo aparecendo por baixo (03 §8.2). Conserto junto.
- Decisão 9 do dono.

### Peça 4 · A folha sobe

Decidida pelo dono em 06/10 e nunca feita (02 T3). Aparece no Agora, na comida,
na Prescrição e no meio do treino (peso no descanso, foto do aparelho, menu).

- A folha sobe em 240 ms e o véu escurece no mesmo tempo, com a mesma curva; a
  segunda e a terceira sobem sobre a primeira e os véus somam. A troca da folha
  do topo ("cadastrar") não sobe: só o conteúdo troca.
- A descida entra com a peça 5 (precisa da View Transition, porque a folha
  fechada sai do DOM no mesmo desenho).
- Precondições de foco (05 §3.1): com o cronômetro ligado, o Tab sai da folha
  para o −15 — o isolamento passa a incluir o `#timer`; o painel de pare e o
  aviso "Não guardei" passam a isolar o fundo como a folha já faz.
- Precondição: o conteúdo da folha rola de lado com o dedo (04 §2.4).
- O painel de pare continua parado (decisão 11).

### Peça 5 · Telas cheias e modo de sessão

Toda sessão de treino (entrar, sair para a comida ou a água, voltar pela faixa)
e os 14 destinos de tela cheia. Hoje a casca troca inteira, a rolagem salta
para o topo e volta (01 B9, B15).

- A tela cheia chega pela direita, por cima; a de baixo recua; a volta é a ida
  ao contrário, pelo "‹ Voltar", pelo Esc e pelo Voltar do sistema. Quando o
  gesto de borda do iPhone já animou a volta, o app não anima de novo
  (`hasUAVisualTransition`, 02 T5). O modo de sessão entra como qualquer tela
  cheia. A folha passa a descer.
- O teste de navegador do toque atravessando, nos dois motores (§3), é a porta
  de entrada desta peça.
- Precondição: a rolagem volta cortada em dois fechos (o Corpo em 1778 px volta
  em 1156), porque `fechaModoDeSessao` e `fechaAjustes` rolam antes de desenhar
  (02 §0). A rolagem passa a ser aplicada dentro do desenho novo, nunca antes.
- Precondição de foco: ao fechar, tela cheia e modo devolvem o foco ao `body`;
  o modo nem recebe foco ao abrir (05 §3.1). Passam a devolver a um lugar
  declarado, e o modo ganha alvo de foco.
- Precondição: o modo com conteúdo curto deixa 24 px roláveis (58 px no iPhone)
  — a "sobra de scroll" de altura em `vh` (04 §2.5).
- Decisões 4, 5 e 6 do dono; o tempo é a decisão 1; o que fica com "Reduzir
  movimento" é a decisão 2.

### Peça 6 · A aba

Muitas vezes por dia. Hoje o conteúdo renasce de estalo e só o fio de 2 px diz a
direção (01 B14).

- O conteúdo novo entra com um passo curto de 20 px no sentido em que se andou,
  em 160 ms; o velho apaga na metade do tempo. O fio anda junto.
- Decisão 3 do dono.

### Peça 7 · O aviso curto (toast)

Mais de cem mensagens no app. Hoje aparece, fica 3,6 s fixos e some de estalo;
as mensagens longas (até ~105 caracteres) somem antes de dar tempo de ler (03 §5.1).

- Entra subindo 8 px e acendendo, sai apagando, em 160 ms; um texto novo no
  meio refaz a entrada, para dizer que é outra mensagem.
- O tempo na tela passa a seguir o tamanho do texto, de 3,6 s a ~8 s.
- Precondição: a região deixa de usar `display: none`, que a tira da árvore de
  acessibilidade e torna o anúncio pouco confiável (05 §3.2).
- Decisão 10 do dono.

### Peça 8 · O resto do lugar

- O copo do "+1 copo" enche de baixo (160 ms); a forma da refeição marcada pousa
  como o número da série.
- O teclado próprio deixa de rolar a página 178 px ao abrir (`focus()` sem
  `preventScroll`, 01 A.5).
- A frase "Abrindo o registro…" passa a aparecer só se a abertura demorar
  (~300 ms): hoje ela pisca 3 a 4 quadros em toda abertura (03 §6). Não é
  movimento; é tirar um piscar.

### O que fica sem movimento, decidido pelo time

Painel que nasce sob o polegar (régua, teclado, RIR), números derivados
(contador, volume, kcal), fim do descanso, abertura e giro do telefone, toda
rolagem programática (sempre instantânea), e o **avanço automático para o
próximo exercício** (01 B2): continua um salto, porque rolagem animada roda na
thread principal e congela com o `render()` (04 §1.6); o que diz "a série
entrou" ali é o cronômetro subindo e o anúncio para leitor de tela (06 §7.3).

---

## 5. As decisões do dono

Vão numa página publicada
(https://claude.ai/artifact/HT7ZLyy9VVLPWQvHAVcfbM), com o contexto em linguagem
clara, um desenho do app que toca cada opção, o "como está
hoje", as opções com a consequência, a recomendação e um campo livre. As doze
primeiras vêm de 06 §6 (cada uma diz de que documento veio); a décima terceira é
deste parecer.

| # | pergunta | recomendação |
|---|---|---|
| 1 | Quanto tempo leva uma camada | médio: entra 240, sai 200, no lugar 160 |
| 2 | O que fica com "Reduzir movimento" nas camadas | a camada chega dissolvendo (120 ms) e sai de estalo |
| 3 | A aba se move | passo curto de 20 px |
| 4 | De onde vem uma tela cheia, e quanto anda | da direita, a página inteira; a de baixo recua um terço |
| 5 | Como entra o modo de sessão | como qualquer tela cheia |
| 6 | Aceitar ~1 quadro a mais ao trocar de camada | aceitar |
| 7 | O toque que afunda | em todo controle; linhas inteiras só escurecem |
| 8 | A série recebida | pouso |
| 9 | O cronômetro | sobe da borda e desce |
| 10 | O aviso curto | sobe, apaga ao sair, fica o tempo do texto |
| 11 | O painel de pare | parado |
| 12 | O ponto ao vivo | pulsa duas vezes e fica aceso |
| 13 | Os sete defeitos que não são de movimento | consertar em peças próprias, separadas das de movimento |

**A pergunta 13.** O pedido diz "motion é apresentação: não mude comportamento
nem dado". O time achou, com prova, defeitos fora disso. Os que impedem o
movimento de funcionar já entram nas peças como precondição (rolagem cortada,
vão de 52 px, foco, teclado que rola, o tranco da primeira série). Sobram estes,
que mudam comportamento:

1. O contador "séries N/M" mostra número velho depois de ligar o deload ou mudar
   séries na edição do dia (tela 1/20, dado 1/12) — dois escritores no mesmo nó
   (03 §8.1).
2. Na primeira série da sessão a linha desce 52 px e a célula de carga cai sob o
   dedo; depois de "Pular", o nome do exercício seguinte (03 §8.6).
3. "Comi tudo" insere 145 px acima da linha tocada e a linha desce (03 §8.5).
4. A faixa "Não guardado" cobre a seta de saída do modo, a hora e o `···`
   (03 §8.3).
5. O aviso "Não guardei" chega ~0,8 s depois do toque, com os quatro botões na
   zona do polegar: um toque mirado em outra coisa cai nele (03 §5.3).
6. Dois "+1 copo" rápidos com o aparelho recusando podem desfazer o segundo
   copo (03 §8.7).
7. O campo de importar arquivo em Ajustes não mostra foco com teclado
   (05 §3.3).

Dois outros achados, de teste (o caso da lista de folhas que
`estilo.test.ts:84-86` promete e não existe, e a guarda de contenção que não
conhece `translate`/`scale`) entram na peça 0 sem pergunta, porque são a rede
de segurança do próprio motion.

---

### 5.1 As respostas (16/10) e o que elas mudam neste parecer

O dono respondeu as treze. Seis contra a recomendação: 1 (como o iPhone, **com
quique**), 3 (**carrossel**), 4 (**a de baixo parada**), 7 (**só escurece**),
11 (**painel igual à folha**), 12 (**pulsa para sempre**) e 13 (**consertar
dentro das peças**). As outras seguem a recomendação. A tabela completa e a
leitura técnica de cada uma estão no diário (`00-coordenacao.md`, 16/10 01h25).
O que muda aqui, e prevalece sobre o texto acima:

- **Princípios.** O 4 perde "ultrapassagem e mola": a ultrapassagem fica
  permitida só no token do quique, que só a chegada da folha e do painel de
  apagar usam. Nenhuma saída tem quique.
- **Tokens (§2).** Camada entra e sai em 350 ms na curva do iPhone
  (`cubic-bezier(.32,.72,0,1)`); o quique da folha e do painel, 640 ms
  (passa 8 % aos 55 %, volta 3 % aos 80 %). No lugar continua 160 ms na
  `--ins-curva`, o toque 120 ms. Saem `--ins-afunda`, `--ins-afunda-largo`,
  `--ins-passo-aba` e `--ins-recuo`.
- **Peça 1** fica só com o preenchimento visível e o ouvinte de `touchstart`;
  nenhum controle escala.
- **Peça 2** ganha os defeitos 1 e 2 da pergunta 13; **peça 4** ganha o painel
  de apagar subindo com quique e o defeito 5; **peça 5**, a tela cheia pela
  direita com a de baixo parada, a descida da folha e do painel, e os defeitos 4
  e 7; **peça 6**, o carrossel de 350 ms; **peça 8**, os defeitos 3 e 6.
- **Peça 0**: o ponto ao vivo continua pulsando sem fim, dentro do portão; o
  `DESIGN.md` registra que isso descumpre o 2.2.2 por decisão do dono.

---

## 6. Riscos e o que ninguém verificou

- **Nada foi visto num iPhone de verdade.** O WebKit desta máquina é o motor do
  Safari sem placa de vídeo: prova comportamento (toque, rolagem, foco, nada
  transbordando), não fluidez. O Core Animation do A13, o `:active` com o
  ouvinte de `touchstart`, o gesto de borda no app instalado e se 240 ms se
  sente como direção ou como atraso ficam pela leitura (02 §7, 04 §6, 06 §8). O
  dono não testa à mão; se a prova no aparelho for necessária, o caminho é uma
  página de diagnóstico que grava os números sozinha — decisão do coordenador
  depois da fase 4, não antes.
- **View Transitions no WebKit** foram inconsistentes numa sonda da 04 (o toque
  chegou sem o pulo, e se perdeu com `pointer-events: none`). Por isso o teste
  dos dois motores é porta de entrada, e o pulo com reenvio vale para os dois.
- **O ~1 quadro a mais** na troca de camada (a foto do estado velho) inclui
  entrar e sair do modo de sessão. Não toca em registrar série.
- **Sensibilidade vestibular**: a tela cheia deslizando a página inteira é o
  risco mais alto que a 05 classifica; fica coberto pelo portão (decisão 2) e
  é a razão de a decisão 4 ter a opção de passo curto.

---

## 7. Como a entrega vai ser conferida

O protocolo inteiro está em `07-revisao-base.md` §1; aqui, o resumo que o
coordenador cobra de cada peça.

- **O antes está gravado** no `a22b09d` (cópia do `dist/` em
  `_medicao/shots/dist-antes/`): 17 fluxos, 45 passos, em Chromium e WebKit
  26.5, com e sem "Reduzir movimento", mais densidade ×3 e ponteiro de mouse —
  81 vídeos e 216 tiras em `_medicao/shots/revisor/antes/`. O próprio protocolo
  já julgou o antes (`antes-contra-protocolo/protocolo.json`): é a linha de base.
- **Depois de cada commit**, o coordenador constrói o `dist/` (nunca ao mesmo
  tempo que uma gravação) e o revisor grava **só os fluxos da peça**
  (07 §1.4), nos dois motores e com "Reduzir movimento", e roda
  `revisor-compara.mjs` contra o antes. No fim da fase 3, tudo de novo.
- **Os nove princípios conferidos passo a passo** (07 §1.3): o toque nunca
  espera (o segundo toque no meio do movimento chega ao alvo; a tela não muda
  mais de um quadro depois do antes, que é o que a decisão 6 aceitou); só
  `transform` e `opacity`; nada pisca no Blink; 60 fps no WebKit; "Reduzir
  movimento" em tudo; o foco não se perde; nada que só se entenda pelo
  movimento; sem enfeite e com as decisões do dono; a rolagem volta exata.
- **As durações que podem aparecer** são 120, 160, 200, 250, 350, 640 e
  2400 ms; qualquer outra reprova. Ultrapassagem só nos 640 ms de chegada da
  folha e do painel.
- **Os complementos** de cada peça (`micro-*`, `acesso-*`, `desempenho-*`)
  rodam contra o `dist/` novo. Ninguém mede à mão.
- **O que fica sem prova nesta máquina** e vai dito na página do antes e
  depois: o Core Animation do A13; o `:active` com o ouvinte de `touchstart` no
  iOS; o gesto de borda e o `hasUAVisualTransition`; o `svh` com a barra do
  Safari; se o quique de 640 ms se sente como chegada ou como atraso.
