# 06 · Sistema de motion

Especialista de sistema, leva 2 do time de motion. Fase 1: só leitura e
proposta, nenhum código do app. Leitura no commit `a22b09d`, a partir dos cinco
documentos da leva 1 (`01` a `05`), de `src/tokens.css`,
`docs/redesign/10-tokens.md` (§12, §14), `tests/dominio/estilo.test.ts` e
`DESIGN.md` (inegociável 6 e §Movimento). Não rodei o app: tudo o que aqui é
medida vem dos documentos da leva 1, que dizem como mediram.

---

## 0. Em uma página

- **A doutrina nova** troca "quase nenhum movimento" por "movimento explica, e
  só explica": cada movimento diz uma das quatro coisas do pedido (de onde a
  camada veio, para onde se andou, o que mudou, que o toque pegou) ou uma das
  duas de ambiente que já existem (o tempo correndo, a tela viva). **Camada se
  move; conteúdo não.** A proibição de mola, de comemoração, de esqueleto, de
  altura animada e de deslizar conteúdo **fica**. A contagem ("quatro funções",
  "quatro movimentos") **cai**.
- **Durações**: quatro degraus de 40 em 40 ms, nomeados pelo papel —
  `--ins-dur-toque` 120 · `--ins-dur-lugar` 160 · `--ins-dur-sai` 200 ·
  `--ins-dur-entra` 240 —, mais três de função própria: `--ins-dur-dissolve`
  120 (só sob movimento reduzido), `--ins-dur-amostra` 250 (o período do
  cronômetro) e `--ins-ciclo-vivo` 2,4 s (o pulso). A camada sai em 5/6 do tempo
  em que entra.
- **Curvas**: uma só para tudo que se desloca ou some — `--ins-curva`,
  `cubic-bezier(.2, .8, .2, 1)`, o mesmo valor de hoje, sem ultrapassagem —, e
  `--ins-curva-grandeza: linear`, só para o tempo do descanso. A mola fica como
  opção do dono (DS1-c), com o motivo da proibição.
- **Distâncias**: `px` para o sinal de direção (afundar, pousar, o aviso subir,
  o passo da aba), `%` para proporção de camada (o recuo), `100%` literal para
  "da borda", como `50%` é literal onde é círculo.
- **O portão**: um padrão só. CSS por adesão (`no-preference`), com o estado
  final escrito fora; JS por uma porta única que lê a preferência na hora e
  responde "não" quando não sabe. O bloco universal de `src/base.css:374-380`
  **sai** no mesmo commit em que a guarda nova entra. Sob movimento reduzido
  nunca há mais movimento do que sem preferência.
- **A guarda**: cinco casos em `tests/dominio/estilo.test.ts`, com o registro
  `carrega`/`fonte()` — (a) duração e curva só nascem em `tokens.css`; (b) todo
  movimento mora no portão; (c) só `transform`/`translate`/`scale`/`opacity`
  se movem; (d) nenhum ancestral de fixo cria bloco de contenção, com a lista
  de ancestrais conferida no DOM; (e) nada escuta o fim de uma animação. O caso
  de `:1144` é reescrito sem perder o que protege.
- **Decisões do dono**: doze pontos, todos absorvidos de 02, 03 e 05 sem
  duplicar; três deles com recomendação nova deste documento (§6).

---

## 1. Os princípios — a doutrina em uma página

Proposta para substituir o princípio 6 de `src/tokens.css:59-65` e o
inegociável 6 de `DESIGN.md:56-68` na fase 3. No tom do cabeçalho de
`tokens.css`, com o `(CAIU: …)` visível.

> **6. Movimento explica, e só explica.** Cada movimento diz uma coisa só: de
> onde a camada veio, para onde se andou, o que mudou, que o toque pegou — ou,
> no ambiente, que o tempo está correndo e que a tela está viva. O que não diz
> nenhuma das seis não entra.
>
> **Camada se move; conteúdo não.** Folha, tela cheia, modo de sessão,
> cronômetro e aviso chegam pela borda de onde vêm e voltam por ela. Lista,
> cartão, linha e painel que nasce sob o polegar (régua, teclado, RIR) aparecem
> no lugar: alvo que se move sob o dedo é alvo errado.
>
> **Proibido pela forma, e não pela contagem:** ultrapassagem e mola (a folha
> chega e para); comemoração — nenhum quadro, curva ou duração diferente para
> "feito", "6/6" ou "14/14"; número que rola; esqueleto que cintila; altura,
> largura ou posição animadas (só `transform` e `opacity`); movimento infinito;
> movimento no fim do descanso, quando ele não está olhando.
>
> **O toque nunca espera.** O dado grava no toque; o movimento vem junto ou
> depois, e nada escuta o fim de uma animação para gravar, desmontar ou mover o
> foco.
>
> **O portão é por ADESÃO** — todo movimento mora dentro de `@media
> (prefers-reduced-motion: no-preference)` e o JavaScript pergunta a uma porta
> só —, porque assim ele falha fechado. Sob `reduce` nunca há mais movimento do
> que sem preferência.
>
> (CAIU: "Quase nenhum movimento" e "quatro funções autorizadas". A contagem
> quebrou duas vezes em um mês com o código certo no mérito — `7cd6418`,
> `02077e3`, `docs/design-review/05-movimento.md` §6 — e o pedido de 15/10 pede
> o contrário dela.)

### O que cai da doutrina velha, e por quê

| o que estava escrito | onde | cai ou fica | por quê |
|---|---|---|---|
| "Quase nenhum movimento"; "quatro funções autorizadas"; a tabela que conta | `tokens.css:59-65`, `DESIGN.md:56-60`, `:251` | **cai** | O pedido do dono (briefing §1) é uma mudança de doutrina. E contagem só reprova quando o código acerta (05-movimento §6). O que fica no lugar é a função: cada linha da tabela diz qual das seis coisas o movimento diz. |
| "Nada de animação de entrada" | `DESIGN.md:62-68` | **cai para camada, fica para conteúdo** | A decisão 14 (06/10) derrubou para a folha com o argumento "chega por cima de outra coisa". O mesmo argumento vale para tela cheia, modo, cronômetro e toast (02 §4; 03 §4.3). Lista, cartão e tela que trocam no mesmo lugar continuam sem entrada. |
| "Nada de fade" | `DESIGN.md:58-59`; `DESIGN_SYSTEM.md:18` via 05-movimento | **cai para quatro usos nomeados** | O véu (decisão 14), o conteúdo velho da aba (02 T4: sem a opacidade o passo de 20 px é um salto), o toast que apaga (03 §5.1) e o dissolver sob `reduce` (§2.4). Fade de entrada em lista e cartão continua proibido. |
| "Transição entre abas", "deslizar conteúdo" recusados | `DESIGN.md:289-292`; 05-movimento §4 | **reaberto para a aba (decisão do dono, DS3); fica para conteúdo dentro de tela** | O motivo "custo alto" caiu: em `transform` o passo não toca layout (04 §1.6) e a armadilha do `translateX(+)` não abre neste app (02 §3.4). O motivo "o indicador já diz" ficou pela metade (02 §4). |
| "Movimento novo é `transition`, ou entra no bloco"; "o pulso morre por seletor" | `DESIGN.md:275-279` | **cai** | Descreve um portão que não existe desde 11/10 (01 D2). Fica o portão por adesão (§4). |
| O bloco universal `*` com `!important` | `base.css:374-380` | **cai** | Engole `transitionend`, não alcança JS nem `::view-transition-*`, impede o dissolver (05 §1.3). Ver §4.3. |
| Rolagem suave "quando o alvo estava fora de vista" | `DESIGN.md:258`, `:268-270` | **cai** (já saiu do código em `926a549`) | Rolagem é sempre `instant`: as razões de `src/main.jsx:11848-11849` e `folha.jsx:38-40` continuam de pé. |
| Folha sobe e "considerado e recusado" na mesma página | `DESIGN.md:62-68` × `:286-292` | **a contradição sai** | A decisão 14 vale; o parágrafo de recusa é reescrito. |
| Sem elasticidade, sem ultrapassagem | `tokens.css:414-417` | **fica** | Ver §2.2 e DS1. |
| Nada que comemore, por quadro e curva | 05-movimento §2; `MARCA.md`, `PRODUCT.md` | **fica, e passa a ser escrito** | Era só frase; vira forma proibida. |
| Só `transform` e `opacity`; o cronômetro em `scaleX` | `DESIGN.md:271-273` | **fica, e vira guarda geral** | 04 §1.6: `left` para 320 ms com a thread presa; `transform` não para. |
| Fim do descanso sem movimento | 05-movimento §2 | **fica** | Ele não está olhando; o canal é o som (03 §4.3). |
| A barra em degraus de 250 ms sob `reduce` | `DESIGN.md:280-284` | **fica** | Quem pediu menos pediu para não interpolar. |
| "Movimento novo entra na tabela antes de entrar no código" | `DESIGN.md:294-297` | **fica** | A tabela de §3 deste documento é a candidata. |

---

## 2. Os tokens propostos

### 2.1 Durações

**O que existe hoje:** `--ins-dur: 220ms` com um consumidor (o indicador,
`src/componentes.css:270`) e `--ins-dur-toque: 120ms` com nenhum
(`src/tokens.css:420-423`). As outras seis durações do app são número solto
(01 "Em números"): 250 ms da barra, 2,4 s do pulso, 320 ms do clarão, e as três
da bancada.

**O que foi proposto na leva 1:**

| fonte | entra | sai | aba | no lugar | toque |
|---|---|---|---|---|---|
| 02 (navegação) | 240 (220–260) | 200 (180–220) | 180 novo · 90 velho | troca do topo da folha 120 | — |
| 03 (micro) | cronômetro 180–220 | cronômetro 140–180; toast 120–160 | — | pouso 140–180; copo 140–180; toast 140–180 | ≤ 80 ao pousar; 120 ao soltar |
| 04 (desempenho, R9) | ≤ 300 navegação | | | ≤ 200 resposta a toque | |
| 05 (acesso) | folha ≤ 280; deslocamento ≤ 250 | | | ≤ 220 no lugar | dissolver ≤ 150 |
| frente 4 / decisão 14 | folha 240, véu 200 | | | | 120 (aprovado no protótipo) |

**A escala: quatro degraus de 40 em 40 ms, mais três de função própria.**

| token | valor | papel | usa | NÃO usa |
|---|---|---|---|---|
| `--ins-dur-toque` | **120 ms** | o controle responde ao dedo, **nos dois sentidos** | o afundar ao pôr o dedo e a volta ao tirar | nada que não seja o próprio controle tocado |
| `--ins-dur-lugar` | **160 ms** | algo muda **onde está**, sem trocar de camada | o pouso do valor na célula; a forma da refeição; o copo que enche; o toast (entra, troca, sai); o passo da aba e o indicador; o conteúdo novo do topo da folha | camada que cobre a tela |
| `--ins-dur-sai` | **200 ms** | uma camada **sai** pela borda por onde veio | folha que desce, tela cheia e modo que saem, cronômetro que desce, o véu junto da folha, o clarão | o que só muda no lugar |
| `--ins-dur-entra` | **240 ms** | uma camada **entra** pela borda | folha que sobe, tela cheia e modo que chegam, cronômetro que sobe, o véu junto da folha | toque, aviso, número |
| `--ins-dur-dissolve` | **120 ms** | a camada chega **sob movimento reduzido**, só por opacidade (se o dono escolher DS2-b ou c) | só dentro de `@media (prefers-reduced-motion: reduce)` | fora do bloco `reduce` — sem preferência o que vale são `entra`/`sai` |
| `--ins-dur-amostra` | **250 ms** | o período de amostragem do cronômetro; a barra interpola entre duas amostras | só `#tfill`, com `--ins-curva-grandeza` | nada de "duração de transição": é um período, e é igual ao `setInterval(pintaTimer, 250)` de `src/main.jsx:6742`, `:6762`, `:6791`, `:6927` — a guarda (a) cobra a igualdade |
| `--ins-ciclo-vivo` | **2,4 s** | uma volta do pulso do ponto ao vivo | só `.ins-live-dot`, enquanto o pulso existir (DS12) | qualquer outra coisa: ciclo é ambiente, e ambiente novo não entra |

**Sai:** `--ins-dur` (220). O indicador passa a andar com `--ins-dur-lugar`,
junto com o conteúdo da aba.

**Por que estes valores, e não os das faixas soltas:**

1. **Um degrau por papel, de 40 em 40.** Quatro números que se distinguem a
   olho (cada degrau é 2,4 quadros a 60 Hz) e que cabem em todas as faixas da
   leva 1: 240 é o da decisão 14; 200 é o "volta" da 02; 160 está no meio das
   faixas de pouso, copo e toast da 03; 120 é o toque que o dono aprovou. O
   ritmo regular faz a escala escalar de uma vez se o dono escolher outro tempo
   (DS1): muda-se o passo, não doze números.
2. **A camada sai em 5/6 do tempo em que entra** (200 contra 240). Sim, a saída
   é mais curta, pelas duas razões da 02 — quem volta já sabe para onde vai — e
   por uma de desempenho: a saída é pedida pelo toque (‹, ×, véu, Voltar), e o
   que o dedo pediu tem de sair do caminho mais cedo. **A regra vale só para
   camada.** O que muda no lugar (toast, pouso) entra e sai no mesmo
   `--ins-dur-lugar`: é uma peça pequena, sem "de volta".
3. **O toque é 120 nos dois sentidos, e não ≤ 80 ao pousar como a 03 propôs.**
   Com `--ins-curva`, 120 ms chega a 80 % da profundidade em 33 ms — dois
   quadros — porque a curva é de saída forte (ponto `(.5 → .8)` da cúbica no
   meio do tempo). A 03 queria o afundar visível num toque curto; esta curva já
   entrega isso, e o valor fica o que o dono tocou e aprovou
   (`docs/redesign/09-frente4-sistema.md:2161-2163`). Um token a menos.
4. **A aba é troca no lugar, e não camada.** No modelo da 02 a aba é um lugar
   no chão (02 §1): o conteúdo troca no mesmo `main`, com um passo de direção.
   Por isso usa `--ins-dur-lugar` (160), dentro da faixa 150–200 da 02. O
   conteúdo velho some em `calc(var(--ins-dur-lugar) / 2)` (80 ms): a relação
   "a velha sai na metade do tempo da nova" fica escrita, sem um token só para
   ela (o fantasma da 02 T4).
5. **O véu dura o que a camada dele dura, com a mesma curva.** A 02 propôs véu
   200 linear na ida e 160 na volta; o sistema troca por "o véu é parte da
   folha": `entra`/`sai` e `--ins-curva`. Com a mesma curva, véu e folha chegam
   a 90 % no mesmo instante; com linear, o véu continuava escurecendo depois de
   a folha parar. Uma regra no lugar de dois números.
6. **O clarão fica em `--ins-dur-sai` (200).** A 03 me passou a divergência:
   o código diz 320 ms `ease-out` (`src/componentes.css:1801`), o requisito 17
   da frente 4 diz 140 (`09-frente4-sistema.md:2392-2397`). Nenhum dos dois foi
   medido a 3 m. O clarão é uma camada branca que sai; 200 com `--ins-curva`
   deixa o branco forte só nos primeiros ~50 ms (como um flash de câmera) e some
   antes da próxima instrução de voz. Não muda o 2.3.1 (um clarão por foto, 05
   §2.3).
7. **O dissolver é 120, não 150.** Dentro das duas faixas (02 D6-b: 100–120;
   05: ≤ 150). É o mesmo número de `--ins-dur-toque` e é outro token, como
   `--ins-10` e `--ins-n-m` são os dois 26 px com papéis diferentes
   (`tokens.css:343`, `:313`).
8. **O teto é 300.** Nenhum token de duração passa de 300 ms (R9 da 04); o
   ciclo do pulso é outra família (`--ins-ciclo-*`). Se o dono escolher DS1-c,
   o teto muda com a decisão escrita.

**Bancada.** As durações dela (520, 420 com 140 de atraso, 300) e a curva
`cubic-bezier(.16, 1, .3, 1)` (`src/palco.css:471-474`) ficam fora da escala do
app pela licença de `DESIGN.md:234`, mas **passam para o bloco `:root` do
próprio `palco.css`** como `--pl-dur-pousa`, `--pl-dur-painel`,
`--pl-atraso-painel`, `--pl-dur-vira` e `--pl-curva` — o mesmo tratamento que o
titânio recebeu (`tests/dominio/estilo.test.ts:931-938`). A curva dela tem
`y1 = 1`, sem ultrapassagem: passa na regra.

### 2.2 Curvas

**A pergunta foi "entrada, saída, padrão no lugar; e linear só para grandeza
contínua". A resposta é: os três primeiros papéis usam a mesma curva, e o
quarto é `linear`.**

| papel | curva | por quê |
|---|---|---|
| entrada (camada chega) | `--ins-curva` | chega rápido e assenta: 80 % do caminho na primeira metade do tempo |
| saída (camada sai) | `--ins-curva` | **não acelera**, e é escolha. Uma curva de aceleração (`cubic-bezier(.4, 0, 1, 1)` e parentes) parte de velocidade zero: aos 33 ms de 200, a camada andou 1–2 % — dois quadros sem resposta visível ao toque no "‹". O pedido proíbe "atrasar o toque" e a P12 é justamente "falta de fluidez no toque". E o gesto de borda do iPhone, que conta a mesma volta (02 T5), termina desacelerando. |
| no lugar (toque, pouso, copo, aba, toast) | `--ins-curva` | o mesmo motivo: a resposta aparece no quadro seguinte e assenta |
| opacidade sozinha (véu, conteúdo velho da aba, toast que apaga, dissolver) | `--ins-curva` | cai rápido no começo, que é o que tira o fantasma (02 T4) |
| grandeza contínua (a barra do descanso) | `--ins-curva-grandeza` (`linear`) | o tempo passa linear; qualquer outra curva faria a barra acelerar e frear quatro vezes por segundo |
| o pulso do ponto ao vivo | `--ins-curva-ciclo` (`cubic-bezier(.4, 0, .6, 1)`) | o único ciclo: ida e volta simétricas ("respira"). Hoje roda no `ease` padrão do navegador, por omissão (`src/base.css:357`). **Existe enquanto o pulso existir** (DS12): se o dono escolher o ponto parado, o token sai junto. |

```css
--ins-curva:          cubic-bezier(.2, .8, .2, 1);  /* o valor de --ins-ease, renomeado */
--ins-curva-grandeza: linear;
--ins-curva-ciclo:    cubic-bezier(.4, 0, .6, 1);   /* só o pulso, se ficar */
```

**`--ins-ease` vira `--ins-curva`.** Um consumidor só (`componentes.css:270`),
que a fase 3 reescreve de qualquer jeito; o resto da família é português
(`--ins-dur-*`, `--ins-raio-*`, `--ins-foco-*`). O caso "toda custom property
usada tem dono" (`estilo.test.ts:95-108`) pega qualquer sobra.

**A proibição de ultrapassagem fica, e passa a ser cobrada** (guarda (a),
asserção 2): em `tokens.css`, toda `cubic-bezier` tem os dois `y` entre 0 e 1,
e `linear()` e `steps()` não entram (`linear()` com pontos é como se escreve
mola em CSS). Hoje isso é só um comentário (`tokens.css:415-417`).

**A mola (02 D5-c) fica como opção do dono, com o motivo da proibição:**
1. **Ultrapassagem é a forma da comemoração.** "Uma barra que se enche com
   elasticidade quando a última série registra é um congratulation state sem uma
   palavra de português dentro" (`docs/design-review/05-movimento.md` §2). A
   proibição de "folha com elasticidade" sobreviveu à decisão 14 por escrito
   (`09-frente4-sistema.md:2304-2306`).
2. **Oscilação é o pior caso vestibular** (05 §2.1: "Mola, ricochete,
   ultrapassagem — risco alto").
3. **350 ms é tempo que se espera** (02 D5-c), acima do teto de 300 (04 R9).
4. **Nota justa sobre o iPhone:** a navegação do iOS anda numa mola
   *criticamente amortecida*, que não quica. O que dá a sensação de "mola" lá é
   a duração (~350–500 ms) e a cauda longa, não um quique. Se o dono quiser "como
   o iPhone", a versão sem quique é uma curva de cauda longa e um degrau mais
   lento — possível sem violar a proibição; a versão com quique, não.

### 2.3 Distâncias

**A unidade segue a lógica do app: "tipo em `rem`, geometria em `px`"
(`tokens.css:284-286`).** Deslocamento é geometria, e um sinal de direção não
tem de crescer com o texto: quem usa 125 % de fonte não precisa de mais
caminho. Então:

- **`px`** para sinal de direção pequeno e constante (afundar não, que é
  escala; pousar, subir o aviso, o passo da aba).
- **`%`** para proporção de camada: o recuo de "um terço" acompanha a largura
  da tela.
- **`100%` literal** para "da borda" (a folha de `translateY(100%)`, a tela
  cheia de `translateX(100%)`, o cronômetro de baixo, o indicador andando N
  larguras): não é escolha de desenho, é o significado — exatamente como `50%`
  continua literal onde é círculo (`tokens.css:360-361`). `100%` e não `100vw`:
  é a largura do que anda, e a mesma conta serve dentro da bancada.
- **Escala sem unidade** para o afundar, porque mantém o centro e encolhe a
  área tocável junto com o desenho (a área estendida por `::after` encolhe e
  continua maior que o desenho, 03 §4.1).

| token | valor | o que é | usa | NÃO usa |
|---|---|---|---|---|
| `--ins-afunda` | **.95** | o quanto um controle pequeno afunda sob o dedo | célula da série, valor e seta da régua, tecla, RIR, ±15, parar, chip, `···`, × | botão de largura cheia; linha inteira (topo do cartão, linha de refeição, conta da água) — esta só troca o preenchimento |
| `--ins-afunda-largo` | **.98** | o mesmo, para botão largo | "Iniciar treino", "Comi tudo", Pausar/Encerrar, botões primários de folha | controle pequeno (.98 num 46 px é 0,5 px: não se vê) |
| `--ins-pousa` | **4px** | de quanto abaixo o valor sobe até assentar | o número na célula da série; a forma da refeição | qualquer coisa maior que uma linha de texto |
| `--ins-sobe-aviso` | **8px** | de quanto abaixo o toast chega | o toast, ao entrar e ao trocar de texto | cronômetro e folha, que vêm da borda (`100%`) |
| `--ins-passo-aba` | **20px** | o passo curto do conteúdo novo ao trocar de aba, no sentido em que se andou na barra | só o conteúdo da aba | tela cheia (camada), e nada dentro de uma tela |
| `--ins-recuo` | **30%** | o quanto a camada de baixo recua quando outra chega por cima (e volta quando ela sai) | tela cheia e modo, se o dono escolher DS4-a | folha (o que fica atrás da folha não se move, 02 T3) |

Notas:
- **Por que .95 e .98, e não um só valor.** Escala é proporcional: .95 num
  botão de 374 px recolhe 9 px de cada lado e lê como empurrão (03 §4.1); num
  de 46 px, 1,15 px. CSS não deriva escala de `px` sem saber a largura, então
  são dois degraus, nomeados pelo tamanho do controle.
- **Pouso e forma da refeição usam o mesmo gesto.** A 03 propôs escala .85 para
  a forma (§4.6) e translação de 4 px para o número (§4.2). O sistema unifica em
  "pousar" (4 px de baixo, de opacidade .4 até 1): um gesto, um significado —
  "o valor entrou aqui". A opacidade inicial `.4` vive uma vez, no `@keyframes`
  compartilhado (§4.1), e não vira token.
- **20 px cabe nas duas** (02: 20 px; 05: ≤ 1/10 da largura, ~40 pt), e está
  na escala de espaço (`--ins-8`). Não reuso o token de espaço: espaço é
  `padding`/`margin`/`gap` (`estilo.test.ts:254-300`); deslocamento é outra
  coisa.
- **O copo enche por `scaleY(0 → 1)`**: é grandeza (o copo enchendo), não
  distância; sem token.

### 2.4 O que muda sob movimento reduzido, token a token

O portão é por adesão (§4): **nenhuma regra que usa estes tokens vale sob
`reduce`**. Os tokens não são zerados — zerar seria um segundo portão, que
discorda do primeiro sobre o dissolver e engole o `transitionend` do mesmo jeito
(05 §1.3). Na porta do JS, `tempo(nome)` devolve **0** para todo token sob
`reduce`, menos `--ins-dur-dissolve`.

| token | sem preferência | sob `reduce` |
|---|---|---|
| `--ins-dur-toque`, `--ins-afunda`, `--ins-afunda-largo` | o controle afunda e volta | **estalo**: sem escala. O preenchimento do `:active` (estado, **fora** do portão) diz a mesma coisa — requisito 13 da frente 4 |
| `--ins-dur-lugar`, `--ins-pousa`, `--ins-passo-aba` | pouso, copo, forma, passo da aba, indicador | **estalo**: o número aparece no lugar; o indicador salta; a aba troca seca. Dissolver um número mostra dois valores ao mesmo tempo (05 §2.2) |
| `--ins-dur-lugar`, `--ins-sobe-aviso` (toast) | sobe 8 px e acende | **conforme DS2**: estalo, ou dissolve em `--ins-dur-dissolve` |
| `--ins-dur-entra`, `--ins-dur-sai`, `--ins-recuo` (camadas) | desliza pela borda; o de baixo recua | **conforme DS2** — a divergência 2 da coordenação |
| `--ins-dur-dissolve` | não se usa | a única duração que vale, e só com `opacity` |
| `--ins-dur-amostra`, `--ins-curva-grandeza` | a barra interpola | **degraus de 250 ms**, como `DESIGN.md:280-284` decidiu |
| `--ins-ciclo-vivo`, `--ins-curva-ciclo` | o pulso (conforme DS12) | **parado e aceso** (opacidade 1, que é o estado fora do portão) |
| clarão (`--ins-dur-sai`) | o branco apaga | **não aparece**: o JS nem o monta (`podeMover()` falso) e o estado fora do portão é opacidade 0; a foto é dita pelo obturador, pela voz e por "Pose N de 9" (05 §2.3) |
| painel de pare e "Não guardei" | parados (DS11) | **parados**: sob `reduce` nunca há mais movimento do que sem preferência |

**A divergência 2 (dissolver × troca seca), registrada como decisão do dono:**
é a DS2 da §6, com três opções. A minha recomendação é uma terceira via que a
leva 1 não tinha: **dissolver só na chegada, sair de estalo** — pelos motivos de
lá.

### 2.5 O bloco proposto para `tokens.css`

Substitui `src/tokens.css:414-424` na fase 3. O comentário segue o dos tokens de
cor: o que é, quando usar, quando não.

```css
/* ---- Movimento: a curva, as durações e as distâncias ----
   Movimento explica, e só explica (princípio 6). Duração nasce NOMEADA PELO
   PAPEL, como cor: número solto numa regra não entra — a guarda de estilo
   reprova tempo e curva escritos fora daqui.

   Quatro degraus de 40 em 40 ms. A camada SAI em 5/6 do tempo em que ENTRA:
   quem volta já sabe para onde vai, e o que o dedo pediu sai do caminho mais
   cedo. O que muda no lugar entra e sai no mesmo degrau.

   Sob `prefers-reduced-motion: reduce` NENHUMA regra que usa estes tokens vale:
   elas moram no portão por adesão. Os tokens não são zerados aqui — zerar seria
   um segundo portão. */
:root {
  /* A CURVA. Uma só para o que chega, o que sai e o que muda no lugar: chega
     rápido e assenta, 80% do caminho na primeira metade do tempo. A saída NÃO
     acelera: curva que acelera parte parada, e a resposta ao "‹" levaria dois
     quadros para aparecer. SEM ULTRAPASSAGEM — nenhum ponto de controle fora de
     [0, 1]: a folha chega e para, e mola é a forma da comemoração. */
  --ins-curva: cubic-bezier(.2, .8, .2, 1);
  /* Linear é a curva do TEMPO, e de mais nada: a barra do descanso, que
     interpola entre duas amostras. Em qualquer outra coisa, linear parece
     mecânico e o véu continua escurecendo depois de a folha parar. */
  --ins-curva-grandeza: linear;
  /* Só o pulso do ponto ao vivo, ida e volta simétricas. Sai junto com o pulso,
     se o pulso sair. */
  --ins-curva-ciclo: cubic-bezier(.4, 0, .6, 1);

  /* O controle responde ao dedo, nos DOIS sentidos: afunda ao pousar, volta ao
     sair. Com a curva acima chega a 80% da profundidade em dois quadros. É o
     valor que o dono tocou e aprovou no protótipo. NÃO é para nada além do
     controle tocado. */
  --ins-dur-toque: 120ms;
  /* Algo muda ONDE ESTÁ, sem trocar de camada: o valor que pousa na célula, o
     copo que enche, o toast, o passo da aba e o indicador, o conteúdo novo do
     topo da folha. NÃO é para camada que cobre a tela. */
  --ins-dur-lugar: 160ms;
  /* Uma camada SAI pela borda por onde veio: folha, tela cheia, modo,
     cronômetro — e o véu junto da folha dele. */
  --ins-dur-sai: 200ms;
  /* Uma camada ENTRA pela borda: os mesmos. O valor da decisão 14 para a folha.
     NÃO é para toque, aviso nem número. */
  --ins-dur-entra: 240ms;
  /* SÓ dentro de `@media (prefers-reduced-motion: reduce)`, e só com opacity:
     a camada que chega dissolve em vez de deslizar. Mesmo número do toque e
     outro papel, como `--ins-10` e `--ins-n-m` são os dois 26px. */
  --ins-dur-dissolve: 120ms;
  /* NÃO é duração de transição: é o PERÍODO de `pintaTimer`. A barra interpola
     entre duas amostras; menos deixa vão parado, mais atrasa a barra em relação
     ao número. A guarda cobra que o `setInterval` use o mesmo número. */
  --ins-dur-amostra: 250ms;
  /* Uma volta do pulso do ponto ao vivo. Ciclo é ambiente, e ambiente novo não
     entra. */
  --ins-ciclo-vivo: 2.4s;

  /* AS DISTÂNCIAS. Geometria, então `px` — o sinal de direção não cresce com o
     texto. Proporção de camada em `%`. E `100%` continua LITERAL onde quer
     dizer "da borda" (a folha, a tela cheia, o cronômetro), como `50%` continua
     literal onde é círculo. */
  /* O controle pequeno afunda sob o dedo: célula, régua, tecla, RIR, ±15, chip.
     NÃO em linha inteira (topo do cartão, refeição): ela só troca o
     preenchimento, que é estado e mora fora do portão. */
  --ins-afunda: .95;
  /* O botão largo afunda bem menos: .95 em 374px recolhe 9px de cada lado e lê
     como empurrão. */
  --ins-afunda-largo: .98;
  /* De quanto abaixo o valor sobe até assentar na célula que o recebeu. */
  --ins-pousa: 4px;
  /* De quanto abaixo o toast chega. Cronômetro e folha não: vêm da borda. */
  --ins-sobe-aviso: 8px;
  /* O passo curto do conteúdo novo, no sentido em que se andou na barra. Aba é
     lugar, não camada: anda pouco. NÃO em tela cheia. */
  --ins-passo-aba: 20px;
  /* Quanto a camada de baixo recua quando outra chega por cima. NÃO atrás da
     folha: o que fica atrás dela não se move. */
  --ins-recuo: 30%;
}
```

---

## 3. A regra de uso — este movimento, estes tokens

Cobre tudo o que a 02 e a 03 propuseram e o que já existe. A coluna "diz" é a
função; um movimento sem ela não entra.

| movimento | o que se move, de → para | duração | curva | diz | sob `reduce` | de quem |
|---|---|---|---|---|---|---|
| **Entrar no modo de sessão** (cartão, faixa, abertura não) | a página nova `translateX(100%) → 0`; a de baixo `0 → translateX(calc(-1 * var(--ins-recuo)))`; fio de 1 px na borda (02 D2) | `--ins-dur-entra` | `--ins-curva` | de onde veio: da direita, por cima do lugar | DS2 | 02 T1 |
| **Sair do modo** (seta, Voltar, Esc) | a de cima `0 → 100%`; a de baixo volta do recuo, já na rolagem guardada | `--ins-dur-sai` | `--ins-curva` | para onde foi: o lugar continua lá | DS2 | 02 T1 |
| **Abrir, empilhar, fechar tela cheia** (14 destinos, Ajustes incluído) | como o modo | `entra` / `sai` | `--ins-curva` | de onde veio; que o Voltar devolve à camada de baixo | DS2 | 02 T2, T7 |
| **Voltar pelo gesto de borda do iPhone** (`popstate` com `hasUAVisualTransition`) | **nada**: o sistema já animou | — | — | — | — | 02 T5 |
| **Folha sobe** (e a 2ª e a 3ª sobre ela) | `.ins-folha` `translateY(100%) → 0`; o véu `opacity 0 → 1` | `--ins-dur-entra` (folha e véu) | `--ins-curva` | de onde veio: de baixo, por cima de tudo; a profundidade pela soma dos véus | DS2 | 02 T3; decisão 14 |
| **Folha desce** (×, véu, Voltar, Esc) | `0 → translateY(100%)`; o véu `1 → 0` | `--ins-dur-sai` | `--ins-curva` | para onde foi | DS2 | 02 T3 |
| **Troca da folha do topo** ("cadastrar") | a camada **parada**; o conteúdo cruza opacidade | `--ins-dur-lugar` | `--ins-curva` | o que mudou (continuação, não camada nova) | estalo | 02 T8 |
| **Trocar de aba** | conteúdo novo `translate: ±var(--ins-passo-aba) 0 → 0` com `opacity 0 → 1`; conteúdo velho `opacity 1 → 0`; o indicador `translate: N×100% → M×100%` | novo e indicador `--ins-dur-lugar`; velho `calc(var(--ins-dur-lugar) / 2)` | `--ins-curva` | para onde se andou, no topo da tela e na barra | estalo; o indicador salta | 02 T4 (DS3) |
| **Toque que afunda** — controle pequeno | `scale: 1 → var(--ins-afunda)` no `:active`, e volta | `--ins-dur-toque` nos dois sentidos | `--ins-curva` | que o toque pegou | só o preenchimento (estado) | 03 §4.1 (DS7) |
| **Toque que afunda** — botão largo | `scale: 1 → var(--ins-afunda-largo)` | `--ins-dur-toque` | `--ins-curva` | que o toque pegou | só o preenchimento | 03 §4.1 |
| **Toque** — linha inteira | **nada**: só o preenchimento | — | — | que o toque pegou (por cor) | igual | 03 §4.1 |
| **Pouso da série** (régua, RIR, coluna anterior, carga do "+ série") | o `<span>` do número `translate: 0 var(--ins-pousa) → 0` e `opacity .4 → 1`, só sob a marca de recém | `--ins-dur-lugar` | `--ins-curva` | o que mudou, e onde: "o valor entrou aqui" | estalo; `#serie-dita` anuncia | 03 §4.2 (DS8) |
| **Voo da série** (se o dono escolher DS8-b) | o fantasma fixo da régua à célula, com o destino sempre visível | `--ins-dur-entra` | `--ins-curva` | idem, mais literal | estalo | 03 D2-b |
| **Forma da refeição** ("Comi tudo") | o mesmo pouso, na forma | `--ins-dur-lugar` | `--ins-curva` | o que mudou nesta linha | estalo | 03 §4.6 |
| **Copo que enche** ("+1 copo") e esvazia | `::after` `scaleY(0 → 1)`, origem embaixo; o contrário ao corrigir | `--ins-dur-lugar` | `--ins-curva` | que o toque pegou, e qual copo | estalo | 03 §4.4 |
| **Cronômetro sobe** (descanso começa) | `#timer` `translate: 0 100% → 0` — pela propriedade `translate`, que **não reescreve** o `translateX(-50%)` que o centra (`componentes.css:1136`) | `--ins-dur-entra` | `--ins-curva` | de onde veio: o descanso mora aqui embaixo | estalo | 03 §4.3 (DS9) |
| **Cronômetro desce** (parar, zerar pelo −15) | `0 → translate: 0 100%` | `--ins-dur-sai` | `--ins-curva` | para onde foi | estalo | 03 §4.3 |
| Toast e faixa da sessão acompanhando o cronômetro | o mesmo deslocamento, no mesmo tempo | `entra` / `sai` | `--ins-curva` | nada novo: só não saltam 82 px no meio | estalo | 03 §4.3 |
| Descanso novo substituindo outro | **nada**: troca no lugar | — | — | — | — | 03 §4.3 |
| **Barra do descanso** | `#tfill` `scaleX` | `--ins-dur-amostra` | `--ins-curva-grandeza` | o tempo passando | degraus de 250 ms | existe (`componentes.css:1189`) |
| **Fim do descanso** ("vai") | **nada** | — | — | o som e a cor dizem | — | 03 §4.3 |
| **Toast entra** | `translate: 0 var(--ins-sobe-aviso) → 0` e `opacity 0 → 1` (sem `display: none`: fica na árvore, 05 §3.4 item 8) | `--ins-dur-lugar` | `--ins-curva` | acabou de acontecer | DS2 | 03 §5.1 (DS10) |
| **Toast troca de texto** | só o texto refaz a entrada | `--ins-dur-lugar` | `--ins-curva` | é outra mensagem | estalo | 03 §5.1 |
| **Toast sai** | `opacity 1 → 0` | `--ins-dur-lugar` | `--ins-curva` | (não puxa o olho com um sumiço brusco) | estalo | 03 §5.1 |
| **Painel de pare, "Não guardei", faixa "Não guardado"** | **nada** | — | — | a frase inteira no primeiro quadro | nada | 03 §5.2, §5.3 (DS11) |
| **Pulso do ponto ao vivo** | `opacity 1 → .25 → 1`; quantas voltas, conforme DS12 | `--ins-ciclo-vivo` | `--ins-curva-ciclo` | a tela está viva | parado e aceso | existe (`base.css:352-358`) |
| **Clarão do disparo** | `opacity .9 → 0` sobre o quadro | `--ins-dur-sai` | `--ins-curva` | que a foto foi tirada (a 3 m) | não aparece | existe (`componentes.css:1801`) |
| **Bancada** (pouso, painel, virada) | como hoje | `--pl-dur-*` | `--pl-curva` | chegou; virou | nada | existe (`palco.css:458-478`) |
| Régua, teclado, RIR abrindo; linha da comida; linha nova do "+ série"; setas da régua | **nada** | — | — | — | — | 03 §4.7, §4.8 |
| Números derivados (contador, volume, anilhas, kcal, ml), relógio, hora | **nada**; contagem animada proibida | — | — | — | — | 03 §4.5 |
| Abertura do app; giro do telefone | **nada** | — | — | — | — | 02 T9, T10 |
| Rolagem programática (todas) | **salto** (`instant`) | — | — | — | — | 02 T6; `main.jsx:11848-11849` |

**Orçamento** (R6 da 04): no máximo duas coisas animando ao mesmo tempo por
tela, mais a barra e o pulso. Na regra acima o pior caso é a folha com o véu, ou
a aba com o indicador — dentro.

---

## 4. O portão

### 4.1 CSS: por adesão, e o estado final fora

```css
/* FORA do portão: o estado final, parado. É o que quem pediu menos
   movimento vê, e o que um navegador sem a media feature vê. */
.ins-folha { /* posição de repouso; nada de opacity: 0 aqui */ }
.cam-clarao { opacity: 0; pointer-events: none; }   /* o último quadro */

/* DENTRO do portão: só o caminho até ele. */
@media (prefers-reduced-motion: no-preference) {
  .ins-folha { animation: ins-sobe var(--ins-dur-entra) var(--ins-curva) both; }
  .cam-clarao { animation: cam-clarao var(--ins-dur-sai) var(--ins-curva) both; }
}

/* A alternativa sob reduce, SE o dono escolher dissolver (DS2-b ou c):
   só opacity, só com o token de dissolver. */
@media (prefers-reduced-motion: reduce) {
  .ins-folha { animation: ins-dissolve var(--ins-dur-dissolve) var(--ins-curva) both; }
}

/* @keyframes moram em qualquer lugar: sem quem os use, não fazem nada.
   Os compartilhados (ins-sobe, ins-pousa, ins-dissolve…) ficam juntos em
   base.css, na seção de movimento. */
```

Regras do padrão:
1. Toda declaração `transition*` e `animation*` (que não seja `none`) mora em
   `@media (prefers-reduced-motion: no-preference)` — ou, como alternativa
   deliberada, em `@media (prefers-reduced-motion: reduce)` só com `opacity` e
   `--ins-dur-dissolve`.
2. **Fora do portão, o elemento está no último quadro.** É o que o caso de
   `:1144` protegia com `.01ms` (pular para o fim, nunca ficar invisível); sob
   adesão, isso vira propriedade conferida (guarda (b), asserção 3).
3. **Sob `reduce` nunca há mais movimento do que sem preferência**: um seletor
   que anima no bloco `reduce` também anima no `no-preference`. O pare, que é
   parado sem preferência, não pode dissolver sob `reduce`.
4. `@starting-style` (se a fase 3 usar para a entrada de nó que nasce) mora
   dentro do portão também, para o movimento de uma peça ler junto.
5. `will-change`: **não se usa** (04 R5: os dois motores compõem `transform` e
   `opacity` sem ele, medido). Se uma medida mostrar um quadro perdido no começo
   de um movimento, ele entra no próprio elemento que anima, dentro do portão,
   pela lista de exceção da guarda (d) — nunca ligado e desligado por JS,
   porque desligar "no `transitionend`" (como a R5 sugeria) é o que a guarda
   (e) proíbe.
6. `scroll-behavior`: só `auto`. Rolagem suave não volta.

### 4.2 JS: uma porta só

Um módulo só (nome sugerido `src/ui/movimento.js`), e é o único lugar do app
que pode chamar `matchMedia('(prefers-reduced-motion…')`,
`document.startViewTransition`, `.animate(`, `requestAnimationFrame` para mover
algo, ou rolar com `'smooth'`. Ele exporta três perguntas:

| função | responde | quando não sabe |
|---|---|---|
| `podeMover()` | `matchMedia('(prefers-reduced-motion: no-preference)').matches`, **lido na hora de cada chamada** (nada de guardar na montagem, como `src/palco.js:207` faz) | `false` — sem `matchMedia` (jsdom, navegador velho) ou se ela lançar |
| `podeDissolver()` | `matchMedia('(prefers-reduced-motion: reduce)').matches` **e** a escolha do dono em DS2 ser dissolver | `false` |
| `tempo(nome)` | os ms do token `nome` lidos de `getComputedStyle(document.documentElement)` — uma fonte só, `tokens.css`; `0` se `podeMover()` for falso (menos `--ins-dur-dissolve` sob `podeDissolver()`) | `0` — valor ilegível vira "não espere nada" |

Pergunta-se por adesão (`no-preference`), não por exclusão (`!reduce`): é o
mesmo "falha fechado" do CSS. Os testes de fluxo rodam em jsdom, sem
`matchMedia` (`tests/fluxo/harness.js:18`), e por isso passam pelo caminho
parado — que é o de hoje, quadro por quadro (02 §3.3).

Quem passa a usar a porta: `startViewTransition` (o `render()`, se a técnica da
02 ficar); a bancada (`palco.js:207`, `:275`, `:309`); o clarão, se ainda
precisar de JS. **O clarão não precisa de timer**: em vez de montar e tirar o
nó em 320 ms (`src/main.jsx:12083-12087`), ele fica montado com a câmera,
chaveado pelo instante do disparo (nó novo por foto, a animação recomeça),
termina em opacidade 0 com `both`, e sob `reduce` nem aparece. Sem
`setTimeout`, sem `render()` 320 ms depois.

### 4.3 O bloco universal de `base.css:374`

**Sai, no mesmo commit em que as guardas (a)–(e) entram e o caso de `:1144` é
reescrito.** Com ele saem os dois portões locais redundantes
(`componentes.css:1803`, `palco.css:476-478`), que viram o próprio portão por
adesão das regras deles, e a leitura única de `palco.js:207`, que passa pela
porta. Os quatro movimentos que existem (pulso, indicador, barra, clarão) e os
três da bancada entram no portão nesse mesmo commit.

**Por que não fica como "segunda rede"**, contra a R10 da 04 (que pedia mantê-lo):
1. Ele **engole o `transitionend`** (medido, 05 §1.3) — uma armadilha para
   quem um dia escutar o evento.
2. Ele **não alcança** JavaScript nem `::view-transition-*`, que eram a
   preocupação da R10. Quem alcança JS é a porta e a guarda (b) da fonte.
3. Ele **proíbe o dissolver** sem uma briga de `!important`.
4. Duas redes que discordam sobre o dissolver são pior que uma que concorda com
   a doutrina (05 §1.4).

O que a R10 queria — que um movimento esquecido não chegue a quem pediu menos —
passa a ser pego **antes** do aparelho, no `npx vitest run`, pela guarda (b).

**A primeira peça da fase 3 é o sistema sozinho**: tokens novos, porta, as
cinco guardas, o universal fora e os movimentos existentes dentro do portão —
nenhum movimento novo, tudo verde. As peças de valor vêm depois, cada uma já
dentro das guardas.

### 4.4 A View Transition pelo mesmo portão

Se a técnica da 02 ficar (a divergência 1 não é deste documento; a condição da
04 §2.6 vale: **só entra com um teste de navegador que prove que o toque
atravessa, nos dois motores**), ela passa pelo portão assim:

1. **JS**: o `render()` só chama `startViewTransition` pela porta. Sob `reduce`
   não chama — a não ser que o dono escolha DS2-b (dissolver nos dois
   sentidos), e aí a porta abre o dissolver pelo mesmo caminho. Na opção que eu
   recomendo (DS2-c) a View Transition **nunca roda sob `reduce`**: a chegada
   dissolve por CSS no nó que nasce, e a saída é de estalo.
2. **CSS, fora do portão**: os pseudo-elementos ficam **sem animação**:
   ```css
   ::view-transition-group(*), ::view-transition-image-pair(*),
   ::view-transition-old(*), ::view-transition-new(*) { animation: none; }
   ```
   Sem isso, se uma transição começar por qualquer caminho, o navegador roda o
   cruzamento padrão dele (~250 ms, com o "morph" que anima largura e altura do
   grupo, 02 T8) — movimento fora do portão e fora das regras. Com isso, o
   padrão do navegador nunca roda.
3. **CSS, dentro do portão**: as animações de `html[data-nav="…"]::view-transition-*`,
   com os tokens de §2 e `@keyframes` só de `transform`/`opacity`. Os nomes
   próprios das peças paradas (`#timer`, `#toast`, `.ins-faixa`, `.ng-faixa`)
   são `view-transition-name`, que não é movimento: pode morar fora.
4. **O toque**: o pulo com reenvio (02 §2.0) mora na porta, junto do
   `startViewTransition`, e nada espera `finished`/`ready`/`updateCallbackDone`
   (guarda (e)). O `data-nav` é posto no começo de cada transição e não precisa
   ser limpo no fim: fora de uma transição os pseudo-elementos não existem.

---

## 5. A guarda de teste (especificada, não escrita)

No molde de `tests/dominio/estilo.test.ts`: lê fonte, nunca transcreve valor,
usa o registro `carrega`/`fonte()` (`:45-74`) para que arquivo que falta seja
caso **vermelho com o nome dele**, e falha nomeando arquivo, seletor e
declaração.

### 5.0 O que a guarda precisa antes dos casos

- **As fontes.** CSS: `FOLHAS` (`:87`) e `FOLHA_BANCADA` (`:91`), esta com o
  bloco `:root` tirado, como o caso do titânio faz (`:934`). JS e JSX: todo
  `src/**/*.{js,jsx,ts}` e o `index.html` — pelo registro (`carrega`), não por
  `fs.readFileSync` solto como o andador de `:1294-1299` faz hoje.
- **O caso que o comentário promete e não existe.** `estilo.test.ts:84-86` diz
  que "um caso próprio compara a lista com o que está no disco e reprova nos dois
  sentidos". Ele **não está no arquivo** (os 52 casos de `test(` do arquivo; o
  único `readdirSync` é o andador de JSX). Sem ele, uma folha nova — um
  `movimento.css`, por exemplo — passa por fora de todas as guardas de
  movimento. Entra junto: `src/*.css` no disco = `FOLHAS` + `FOLHA_BANCADA`,
  reprovando folha nova não declarada e folha declarada que sumiu.
- **Dois leitores novos**, irmãos de `blocos()` (`:356-369`), que hoje joga
  fora o prelúdio do `@media` e por isso não sabe se uma regra está no portão:
  - `regrasComMidia(folha, arquivo)` → `{ arquivo, linha, sels, corpo,
    midias: string[] }`, com a pilha de `@media`/`@supports` que envolve a
    regra;
  - `quadros(folha)` → `nome do @keyframes` → `{ props: Set, ultimo: {prop:
    valor} }`.
- **O seletor de pseudo-elemento de transição não é ancestral.** `raizDe()`
  (`:384`) só tira `::nome` sem parênteses; `html::view-transition-old(root)`
  passa inteiro e casa com `ANCESTRAL` (`:381`). A guarda (d) exclui
  `::view-transition*` explicitamente: esses pseudo-elementos moram numa árvore
  à parte, por cima da página, e não contêm nenhum fixo.

### (a) "duração e curva só nascem em `tokens.css`"

- **Lê**: as folhas do app menos `tokens.css`; `palco.css` sem o `:root`; os
  atributos `style` e blocos `<style>` de `index.html` e do JSX.
- **Reprova**, em toda declaração `transition`, `transition-duration`,
  `transition-delay`, `transition-timing-function`, `animation`,
  `animation-duration`, `animation-delay`, `animation-timing-function` (e esta
  dentro de `@keyframes`):
  - número de tempo (`/(?<![\w.-])\d*\.?\d+m?s(?![\w-])/`);
  - `cubic-bezier(`, `steps(`, `linear(`;
  - palavra de curva: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`,
    `step-start`, `step-end` — **só nessas declarações**, para não pegar
    `linear-gradient` (`componentes.css:1727`, `palco.css:124`);
  - transição ou animação **sem** uma `var(--ins-dur-…)`/`var(--ins-ciclo-…)` e
    uma `var(--ins-curva…)` em cada item da lista (na bancada, `--pl-`): sem
    isso o navegador usa `ease` por omissão, e a curva entra solta sem estar
    escrita — é o caso do pulso hoje (`base.css:357`);
  - definição de custom property com valor de tempo ou de curva fora de
    `tokens.css` (e do `:root` da bancada): seria uma segunda fonte.
- **Aceita**: `none`; `calc()` sobre tokens (`calc(var(--ins-dur-lugar) / 2)`).
- **Asserção 2, em `tokens.css`**: toda `cubic-bezier` tem `y1` e `y2` em
  [0, 1]; nenhum `linear(` nem `steps(`; todo `--ins-dur-*` ≤ 300 ms (R9 da
  04). É a proibição de mola saindo do comentário para a regra.
- **Asserção 3**: todo `setInterval(pintaTimer, N)` de `src/main.jsx` tem `N`
  igual a `--ins-dur-amostra` — o período e a interpolação não podem divergir
  (o motivo está em `DESIGN.md:260-266`).
- **Exceções**: nenhuma no app. O `.01ms` do portão (`base.css:376`) sai com o
  universal; o `1ms` do clarão (`componentes.css:1803`) sai com o portão local.
  A bancada não é exceção: os números dela vão para o `:root` dela.
- **Hoje reprovaria**: `base.css:357` (2,4 s, curva por omissão), `:376`;
  `componentes.css:1189` (`.25s linear`), `:1801` (`320ms ease-out`), `:1803`;
  `palco.css:471-474`.
- **Frase de falha**: *"duração ou curva fora de tokens.css: {arquivo} · {seletor}
  → {declaração}. Duração nasce nomeada pelo papel, como cor: use um dos tokens
  do bloco Movimento, ou dê um nome novo lá, com o que é, quando usar e quando
  não."* — e na asserção 2: *"{token} ultrapassa: um ponto de controle fora de
  [0, 1] é mola, e a folha chega e para."*

### (b) "todo movimento mora no portão" — e a reescrita de `:1144`

- **Lê**: as mesmas folhas, por `regrasComMidia`; os `@keyframes` por
  `quadros`; o JS e o JSX inteiros.
- **Reprova**:
  1. declaração `transition*`/`animation*` (não `none`) sem `prefers-reduced-motion:
     no-preference` na pilha de `@media` — a não ser que esteja em
     `prefers-reduced-motion: reduce` e anime **só `opacity`** com
     `--ins-dur-dissolve`;
  2. seletor que anima no bloco `reduce` sem animar no `no-preference` — *sob
     reduce, nunca mais movimento que sem preferência*;
  3. **o elemento fora do portão não está no último quadro**: para cada
     animação dentro do portão, o valor de cada propriedade no último quadro
     (`to`/`100%`) tem de ser igual ao do mesmo seletor fora do portão (o padrão,
     se não declarado: `opacity: 1`, `transform`/`translate`/`scale: none`). O
     clarão termina em 0 e fora está em 0: passa. Uma entrada que termina em 1
     com o repouso em `opacity: 0`: reprova — é a tela invisível para quem pediu
     menos;
  4. `scroll-behavior` diferente de `auto`, em qualquer lugar;
  5. `transition`/`animation` em atributo `style` (JSX ou `index.html`): todo
     movimento mora em folha, onde a guarda o vê;
  6. em JS: `matchMedia` com `prefers-reduced-motion`, `startViewTransition`,
     `.animate(`, `requestAnimationFrame` e `'smooth'`/`"smooth"` **fora do
     módulo da porta** (caminho declarado no caso, pelo registro). Hoje: o
     `palco.js:207`.
- **Asserção da porta** (comportamento, não forma — a lição da §12 do
  `10-tokens.md`): o módulo importado em node, sem `window`, responde
  `podeMover() === false` e `tempo('--ins-dur-entra') === 0`; com um
  `matchMedia` falso que lança, `false`; trocando a resposta do falso entre duas
  chamadas, a segunda muda (lê na hora).
- **Hoje reprovaria**: `base.css:357`, `componentes.css:270`, `:1189`, `:1801`,
  `palco.css:471-474` (o M1 da 05), e `palco.js:207`.
- **Frase de falha**: *"movimento fora do portão: {arquivo}:{linha} {seletor} →
  {declaração}. Ponha a regra dentro de @media (prefers-reduced-motion:
  no-preference); fora dele fica só o estado final."* — para o item 3: *"{seletor}
  fora do portão não está no último quadro de {keyframes} ({prop}: {fora} ≠
  {último}): quem pediu menos movimento veria o primeiro quadro, não o resultado."*

**Como reescrever o caso de `:1144` sem perder o que ele protege.** Ele
protege três coisas, e as três ficam:

| o que `:1144` protege | como era | como fica |
|---|---|---|
| **Estrutura, não nome**: a próxima animação nasce dentro do portão sem ninguém lembrar | exige uma regra universal `*` declarando animação com `!important` | (b)-1 olha **cada declaração** de movimento de todas as folhas, de qualquer seletor, e exige o portão em volta dela. Mais forte: o universal não pegava JS, `::view-transition-*` nem `::backdrop`; (b)-5 e (b)-6 pegam |
| **O último quadro, não o primeiro**: `.01ms` em vez de `animation: none`, para uma animação com `both` não deixar conteúdo invisível | uma escolha de valor no bloco universal | (b)-3 cobra a **propriedade**: fora do portão, o elemento já está no último quadro. Sob adesão, é a única forma de esse risco existir, e ela é conferida |
| **Cobrar a regra, não a presença de palavras no bloco** (a primeira versão passava por acidente, `10-tokens.md` §14.1) | `regraUniversal` olha a regra do `*` | (b) lê declaração por declaração com o `@media` dela; nada de "o bloco tem `*` em algum lugar e `animation` em outro" |

O nome passa a ser: *"reduzir movimento falha fechado: todo movimento mora no
portão por adesão, e fora dele o elemento está no último quadro"*. O
comentário do caso conta a troca: por que o universal saiu (os quatro motivos
de §4.3), e que o portão novo é cobrado por declaração.

### (c) "só `transform`, `translate`, `scale` e `opacity` se movem"

- **Lê**: as propriedades de cada `transition` (o primeiro termo de cada item
  da lista, ou `transition-property`) e as de cada `@keyframes` referenciado
  por `animation`/`animation-name`.
- **Aceita**: `transform`, `translate`, `scale`, `opacity`. As propriedades
  individuais entram de propósito: `#toast`, `#timer` e `.ins-faixa` se centram
  com `transform: translateX(-50%)` (`componentes.css:1119`, `:1136`, `:1150`),
  e mover com `translate` não reescreve o centramento — o salto para a direita
  que a C4 de `05-movimento.md` e a 03 §4.3 avisavam fica impossível, em vez de
  depender de lembrar de compor `translate(-50%, Y)`. No bloco `reduce`: só
  `opacity`.
- **Reprova**: qualquer outra (`left`, `top`, `right`, `bottom`, `width`,
  `height`, `max-height`, `margin*`, `padding*`, `inset*`, `grid-template-*`,
  `flex*`, `font-*`, `border-width`, `background*`, `color`, `filter`,
  `backdrop-filter`, `clip-path`, `box-shadow`, `visibility`), e `all` — que
  inclui todas.
- **Asserção 2**: seletor que declara `transform: translateX(-50%)` (os
  centrados fixos) não anima `transform` — só `translate` e `opacity`.
- **Hoje reprovaria**: `componentes.css:270` (`left`) — o único (01, "Em
  números").
- **Frase de falha**: *"{seletor} anima {propriedade}: isso refaz layout ou
  pintura a cada quadro e congela quando a thread trava — `left` parou 320 ms
  com a thread presa, `transform` não parou nenhum (04 §1.6). Mova com
  transform, translate, scale ou opacity."*

### (d) "nenhum ancestral de fixo cria bloco de contenção" — o caso de `:1028`, estendido

Hoje o caso olha `html`, `body`, `:root`, `*` e `#app` (`:381`) e procura
`transform|filter|perspective|backdrop-filter|will-change|contain` (`:1043`).
Três buracos, todos medidos ou lidos na leva 1:

1. **`.ins-modo` fica de fora**, e a faixa da pergunta de 1h30 é fixa dentro
   dele (`src/ui/telas/sessaomodo.jsx:74`): um `transform` no `.ins-modo` leva a
   faixa de y 805 a 1309 (04 §2.3).
2. **A lista de propriedades está curta**: `translate`, `scale` e `rotate`
   (individuais) criam bloco de contenção tanto quanto `transform`, e a §(c)
   passa a usá-las; `container-type` e `content-visibility` também.
3. **Animação no ancestral não é vista**: `blocos()` tira os `@keyframes`, então
   um `.ins-modo { animation: entra … }` com `transform` nos quadros passaria.

O caso novo tem duas metades.

- **Metade de fonte** (`estilo.test.ts`). `ANCESTRAL_DE_FIXO` = `html`, `body`,
  `:root`, `*`, `#app`, `.ins-modo`. Para todo bloco cujo seletor (sem
  pseudo-elemento, e **excluídos** os `::view-transition*`) é um deles:
  - reprova `transform`, `translate`, `scale`, `rotate`, `filter`,
    `perspective`, `backdrop-filter`, `will-change`, `contain`,
    `container-type`, `content-visibility`;
  - reprova `transition`/`animation` que mova outra coisa que `opacity`
    (opacidade abaixo de 1 cria contexto de empilhamento, não bloco de contenção).
  - E em qualquer folha: `will-change` só nos seletores de uma lista de exceção
    **vazia hoje**, que só cresce com a medida que justifica (04 R5).
- **Metade de DOM** (`tests/fluxo`, com o harness): a lista tem de ser
  **exata**, como a da dívida de alvo (`:1138-1141`). Os seletores fixos vêm da
  fonte (todo bloco com `position: fixed`); o fluxo abre o Agora com descanso e
  toast, uma tela cheia, o modo com a faixa da pergunta, uma folha e o pare; para
  cada elemento que casa um seletor fixo, sobe até `html` e anota id e classes
  de cada ancestral. Reprova ancestral que a lista não cobre, e nome da lista
  que nenhum fixo teve como ancestral. É isso que impede o próximo `.ins-modo`:
  ninguém precisa lembrar que um fixo foi morar dentro de um invólucro novo.
- **Hoje**: a metade de fonte passa (nenhum `transform` em `.ins-modo`); a de
  DOM acharia `.ins-modo` (que hoje falta na constante) — e a sonda da 04 mostra
  o que acontece se alguém animar a entrada do modo nele.
- **Frase de falha**: *"{seletor} é ancestral de um fixo e declara {propriedade}:
  isso cria bloco de contenção e o fixo passa a rolar com o pai — a faixa do modo
  pula de 805 para 1309 (04 §2.3). Anime um invólucro que não contenha fixo, ou
  use a View Transition, que move fotos e não elementos."* — e na metade de DOM:
  *"o fixo {seletor} tem um ancestral que a guarda não olha: {cadeia}. Ponha-o
  em ANCESTRAL_DE_FIXO."*

### (e) "nada escuta o fim de uma animação"

- **Lê**: todo `src/**/*.{js,jsx,ts}` e os `<script>` de `index.html`.
- **Reprova**: `transitionend`, `transitionstart`, `transitionrun`,
  `transitioncancel`, `animationend`, `animationstart`, `animationiteration`,
  `animationcancel`; os nomes Preact `onTransitionEnd`, `onAnimationEnd` (e as
  outras sete formas `on…`); `.finished`, `.ready` e `.updateCallbackDone` —
  as promessas de `Animation` e de `ViewTransition`. Em lugar nenhum, **nem na
  porta**: a porta não precisa (o `data-nav` não se limpa, §4.4).
- **Hoje**: passa — zero ocorrências (conferido: `grep` em `src` e
  `index.html`). É guarda de nascença, e por isso entra com a prova de que sabe
  ficar vermelha (`10-tokens.md` §13.1): um `addEventListener('transitionend', …)`
  numa cópia tem de reprovar nomeando a linha.
- **O que ela não vê, dito**: um `setTimeout` com o mesmo número da animação
  para desmontar (o clarão de hoje, `main.jsx:12086`). Não há como separar
  esse 320 de um 700 de gravação sem heurística, e heurística em teste é onde o
  defeito se esconde (`10-tokens.md` §12). A proteção é de estrutura: o clarão
  deixa de precisar de timer (§4.2), e o tempo de qualquer saída que precise
  segurar um nó vem de `tempo()` — que é 0 sob `reduce`. O teste de navegador
  M11 da 05 (a camada que sai é inerte desde o primeiro quadro) pega o resto.
- **Frase de falha**: *"{arquivo}:{linha} escuta {evento}: sob movimento reduzido
  o evento não chega (medido, 05 §1.3) e a tela fica presa com o véu por cima.
  Monte, desmonte e mova o foco pelo estado, no mesmo desenho."*

### Casos vizinhos, que não são deste documento mas moram no mesmo arquivo

Da 05 §5, entram com as peças a que pertencem: M2 (nada infinito — depende de
DS12), M12 (a região viva do toast nunca sai da árvore). E fora de
`estilo.test.ts`, no navegador (do revisor, `07`): M6/M7 (sob `reduce` só
opacidade ≤ `--ins-dur-dissolve`; sem preferência só `transform`/`opacity`,
nada infinito), o toque atravessando a View Transition nos dois motores (04 §2.6)
e o "nenhuma animação composta falhou" do traço (04 §6). Esses testes de
navegador **falham, não pulam**, quando o Chromium falta (05 §5).

---

## 6. Os pontos em aberto — só o dono decide

Doze, e cada um diz o que absorve. Nenhum repete outro: os números e as curvas
de cada opção já estão em §2, então aqui só fica o gosto e a doutrina.

**DS1 · Quanto tempo leva uma camada** — absorve **02 D5**.
Como está hoje: camada nenhuma se move; o indicador anda 220 ms.
- (a) **Rápido**: entra 200, sai 170, no lugar 140 (toque fica 120). Quase não
  se vê; diz menos.
- (b) **Médio: entra 240, sai 200, no lugar 160** (§2.1). O que a decisão 14
  tinha para a folha. **Recomendo.**
- (c) **Como o iPhone**: ~350 ms, cauda longa. *Sem quique* cabe na doutrina
  (é só curva e tempo, §2.2 nota 4) e passa do teto de 300 da 04 — a guarda
  muda com a decisão. *Com quique* não: é ultrapassagem, a forma da comemoração
  e o pior caso vestibular.

**DS2 · O que fica sob "Reduzir movimento" nas camadas** — absorve **02 D6** e
**a divergência 2** (02 × 05).
Como está hoje: tudo troca seco.
- (a) **Estalo nos dois sentidos** (02). Exatamente o app de hoje para quem
  pediu menos; o véu escurece meia tela num quadro.
- (b) **Dissolver nos dois sentidos**, 120 ms, só opacidade (05). É o que o
  próprio iOS faz com a chave ligada, e a WCAG não conta opacidade como
  movimento. Mas a saída dissolvida exige o mesmo mecanismo da saída animada (a
  View Transition), e quem pediu menos passa a pagar o quadro a mais e o toque
  no meio da transição (DS6).
- (c) **Dissolver só na chegada, sair de estalo.** A chegada dissolve por CSS
  no nó que nasce, sem View Transition: tira o tranco de luminância e mantém
  "chegou algo por cima"; a saída é a de hoje, imediata. **Recomendo** — fica
  com o ganho da 05 e com a segurança da 02.

**DS3 · Trocar de aba se move?** — absorve **02 D1**.
- (a) Só o indicador (agora em `transform`). (b) **Passo curto** de 20 px em
  160 ms, o velho some em 80 — **recomendo**, como a 02. (c) A página inteira
  desliza, como carrossel: promete um arrasto que o app não tem.

**DS4 · De onde vem uma tela cheia, e quanto ela anda** — absorve **02 D2** e
**uma divergência que a coordenação não listou**: a 02 propõe a página inteira
(100 %) com a de baixo recuando um terço; a 05 §2.1 classifica "deslizar a tela
inteira" e "camadas em velocidades diferentes" como risco vestibular **alto** e
pede, mesmo sem preferência, passo curto (≤ 40 pt) com opacidade.
- (a) **Da direita, a página inteira; a de baixo recua 30 %** (02). Igual ao
  gesto de borda do iPhone, que já faz isso no app instalado (02 T5): a volta
  do app e a do sistema contam a mesma história. Quem tem sensibilidade
  vestibular está coberto pelo portão (DS2). **Recomendo.**
- (b) Da direita, a página inteira; a de baixo **parada**. Sem a paralaxe; a de
  baixo não "fica mais funda", e o gesto do sistema continua mostrando o recuo.
- (c) **Passo curto** de 40 px com opacidade, a de baixo parada (05). O mais
  manso; a tela cheia passa a parecer uma aba, e "por cima" fica dito só pelo
  título e pelo "‹".
- (d) De baixo, como folha; ou (e) seco — as duas como em 02 D2-c/d.

**DS5 · O modo de sessão entra como?** — absorve **02 D3**, sem mudança: (a)
como qualquer tela cheia (**recomendo**); (b) sobe de baixo; (c) cresce da
faixa ou do cartão (anima tamanho).

**DS6 · O quadro a mais na troca de camada** — absorve **02 D4**, sem mudança:
(a) aceitar ~1 quadro (**recomendo**, como a 02); (b) animar tudo menos o modo;
(c) só a folha. Condição que não é gosto: a técnica só entra com o teste do toque
nos dois motores (divergência 1, 04 §2.6).

**DS7 · O toque que afunda** — absorve **03 D1**: (a) todo controle, pequeno
.95 e largo .98, linhas só escurecem (**recomendo**, como a 03); (b) só no
treino; (c) só escurece. Em todas, o preenchimento visível entra fora do portão
(requisito 13), e o ouvinte de `touchstart` (03 §1.4) também.

**DS8 · A série recebida** — absorve **03 D2**: (a) **pouso** em 160 ms
(**recomendo**); (b) voo, em `--ins-dur-entra`, com o destino sempre visível;
(c) nada.

**DS9 · O cronômetro** — absorve **03 D3**: (a) **sobe da borda** em 240 e desce
em 200, com toast e faixa acompanhando (**recomendo**; exige o conserto do vão
de 52 px); (b) como hoje.

**DS10 · O toast** — absorve **03 D4**: (a) **entra subindo 8 px, sai apagando,
160 ms, e fica o tempo do texto** (**recomendo**); (b) só o tempo pelo texto;
(c) como hoje.

**DS11 · O painel de pare** — absorve **03 D5**: (a) **parado, na entrada e na
saída, também sob `reduce`** (**recomendo**); (b) igual à folha (o "Apagar" passa
sob o polegar durante a subida).

**DS12 · O ponto ao vivo** — absorve **05 D1**: (a) **pulsa duas voltas (4,8 s)
e fica aceso** (**recomendo**, como a 05: resolve o 2.2.2; `--ins-curva-ciclo`
fica); (b) aceso e parado sempre (o pulso e os dois tokens de ciclo saem); (c)
como hoje, infinito.

**O que eu decidi e registro** (técnico, não é do dono — "delegou, decida"):
curva única para entrada, saída e lugar (§2.2); toque 120 nos dois sentidos
(§2.1, 3); a aba em `--ins-dur-lugar`; o véu no tempo da camada dele; o clarão em
200; pouso e forma da refeição no mesmo gesto; dissolver 120; `translate`/`scale`
individuais para não reescrever o centramento; `will-change` proibido sem medida;
os números da bancada no `:root` dela; `--ins-ease` → `--ins-curva`, `--ins-dur`
sai; o universal sai (contra a R10 da 04); clarão sem timer.

---

## 7. Achados no caminho

1. **`estilo.test.ts:84-86` promete um caso que não existe** (a lista de folhas
   comparada com o disco). Sem ele, uma folha nova escapa de toda guarda de
   estilo, não só das de movimento. Entra junto com a guarda (§5.0).
2. **A guarda de contenção de `:1028` não conhece `translate`, `scale`,
   `rotate`, `container-type` nem `content-visibility`**, e não lê animação em
   ancestral (§5 (d)). Hoje nada disso está no app; a proposta de usar
   `translate` torna o buraco real.
3. **Ninguém ficou com o avanço automático do exercício** (01 B2, segunda das
   cinco lacunas mais importantes): a 03 §4.11 o passou à navegação, e a 02 não o
   trata. Posição do sistema: **sem rolagem suave** (ela é do navegador, sem
   token de duração nem curva, e uma rolagem por `requestAnimationFrame` roda na
   thread principal e congela com o `render()`, 04 §1.6); o que diz "a série
   entrou" ali é o cronômetro subindo e o anúncio (03 §4.11). Fica para o
   parecer decidir se é gosto do dono.
4. **Duas regras da 04 contradizem a 05 e caem aqui**: R5 (tirar `will-change`
   no `transitionend`) e R10 (manter o universal). Resolvidas em §4.1 e §4.3.
5. **A 05 põe "aviso de pare e Não guardei" na lista do que dissolve sob
   `reduce`** (05 §2.2), e a 03 os quer parados sem preferência. Pela regra
   "sob `reduce` nunca mais movimento", ficam parados nos dois (DS11).

---

## 8. O que não verifiquei

- **Nada rodou**: este documento não mediu; os números de desempenho, foco e
  `reduce` são da leva 1, com os métodos que ela descreve.
- **Se 120/160/200/240 se percebem como direção ou só como atraso** no iPhone 11
  Pro Max. Ninguém tocou; é o mesmo buraco que a frente 4 registrou para a
  folha.
- **O clarão de 200 ms a 3 m**, como o de 140 e o de 320 antes dele.
- **`getComputedStyle` lendo `--ins-dur-*` no WebKit do iPhone** para
  `tempo()`: é API padrão, mas não foi medida aqui. Se vier vazio, a porta
  responde 0 — o app fica parado, nunca preso.
- **As propriedades individuais `translate`/`scale`** estão no Safari 14.1 e no
  Chrome 104; o iPhone dele (iOS 18/26) tem as duas. Não conferi se o WebKit as
  compõe no Core Animation como faz com `transform`; o revisor (`07`) mede pelo
  método da 04 §6 (parada de 0 ms com a thread presa).
