# 00 · Coordenação do motion — checklist e diário

Arquivo do coordenador. Serve para **retomar o trabalho em qualquer ponto**,
inclusive numa sessão nova, sem depender da memória de quem coordenava. O
pedido e as regras do time estão em [`00-briefing.md`](00-briefing.md).

Legenda: `[x]` feito · `[~]` em andamento · `[ ]` a fazer · `[!]` bloqueado ou
pede atenção do dono.

---

## ⏸ PONTO DE PARADA

**16/10, 02h — parecer (08) escrito, página das 13 decisões publicada;
esperando as respostas do dono. Revisor (07) ainda gravando o "antes".**
Página: https://claude.ai/artifact/HT7ZLyy9VVLPWQvHAVcfbM (respostas na coleção
`respostas` do banco da página, um documento por pergunta, `q1`…`q13`; ler com
o ArtifactData). Ninguém mexe em código antes das respostas. Ao retomar:
conferir se o `07-revisao-base.md` está completo; quem não escreveu o arquivo,
refazer.

O "antes" de tudo é o commit **`a22b09d`**. Há commits locais não publicados
desde `8ec19a4`: não enviar nada ao GitHub (o envio publica na Vercel).

---

## O time

| # | papel | documento | leva |
|---|---|---|---|
| 1 | **Coordenador** — divide, junta, escreve o parecer | `00-*`, `08-parecer.md` | — |
| 2 | **Auditor de movimento** — inventário de tudo o que se move, com arquivo e linha, e do que deveria se mover e não se move | `01-inventario.md` | 1 |
| 3 | **Coreografia da navegação** — abas, telas cheias, folhas empilhadas, Voltar e gesto de borda, entrar e sair do modo de sessão, posição de leitura | `02-navegacao.md` | 1 |
| 4 | **Micro-interações** — toque na série, régua, teclado, RIR, refeição, "+1 copo", toast, pare, "Não guardei", carregando e falha | `03-micro.md` | 1 |
| 5 | **Desempenho e motores** — 60 fps no WebKit, nada piscando no Blink, só transform e opacity, as armadilhas conhecidas | `04-desempenho.md` | 1 |
| 6 | **Acessibilidade do movimento** — reduced motion, vestibular, foco visível, nada que só se entenda pelo movimento | `05-acessibilidade.md` | 1 |
| 7 | **Sistema de motion** — tokens de duração, curva e distância em `src/tokens.css`, a regra de uso de cada um, o guarda de teste | `06-sistema.md` | 2 (lê 01–05) |
| 8 | **Revisor** — protocolo de verificação, scripts de captura e gravação a 414 × 896, o "antes" gravado | `07-revisao-base.md`, `_medicao/` | 2 (lê 01–03) |

## Checklist

### Fase 1 — leitura (ninguém mexe em código)
- [x] Pasta `docs/motion/`, `00-briefing.md`, `00-coordenacao.md`.
- [x] Leva 1: 01 inventário · 02 navegação · 03 micro · 04 desempenho · 05 acessibilidade.
  Disparada 15/10. `dist/` construído uma vez de `a22b09d`; ninguém reconstrói.
  Cada um serve o `dist` na própria porta (4721 a 4725).
  **15/10, 20h03:** os cinco caíram por limite de uso no meio do trabalho. No
  disco ficaram: 01 com 379 linhas; 02 a 05 só com o esqueleto, mais os scripts
  em `_medicao/`. **20h06:** retomados do ponto em que pararam (mesmos agentes,
  mesmo contexto), com os servidores das portas ainda de pé.
  - [x] **01 inventário** (379 linhas). Conferido por amostra: `teclado.jsx:59`
    (foco sem `preventScroll`), `main.jsx:5328` (avanço automático),
    `--ins-dur-toque` sem uso, rolagem suave removida em `926a549`, folha sem
    animação de entrada. Tudo bate.
  - [x] **05 acessibilidade** (520 linhas). Conferido: bloco universal
    `base.css:374-380`, `#timer` fora do `#app` (`index.html:88`), caso de
    `estilo.test.ts:1144` que exige o universal, tabela velha do `DESIGN.md:258`.
  - [x] **03 micro-interações** (765 linhas). Conferido: `voa()` citada em
    `index.html:61` e `main.jsx:5251` não existe em `src/`; nenhum `touchstart`
    no app (o `:active` provavelmente não dispara no iPhone).
  - [x] **04 desempenho** (743 linhas, 7 scripts `desempenho-*.mjs`).
    Conferido: `componentes.css:270` anima `left`; o WebKit 26.5 roda com as
    bibliotecas extraídas em `~/.cache/ms-playwright/webkit-deps-noble/` (receita
    no topo de `desempenho-comum.mjs`).
  - [x] **02 navegação** (676 linhas). Conferido: `fechaModoDeSessao` e
    `fechaAjustes` chamam `saiDoDestino` antes do `render()` — a rolagem volta
    cortada (Corpo em 1778 px volta em 1156).
- [x] Leva 2: 06 sistema · 07 revisão-base (o "antes" gravado).
  Disparada 15/10, 21h. O sistema lê os cinco da leva 1 e fecha tokens, portão
  e guarda (porta 4726 se rodar o app). O revisor copia o `dist/` de `a22b09d`
  para `_medicao/shots/dist-antes/` (fora do git), grava o antes nos dois
  motores (porta 4727) e deixa scripts `revisor-*.mjs` que regravam o depois.
  **16/10, 00h30:** os dois caíram por limite de uso logo no começo (só o
  esqueleto no disco; a cópia `dist-antes` ficou completa, conferida idêntica ao
  `dist/`). Retomados do ponto em que pararam.
  - [x] **06 sistema** (941 linhas). Conferido: a promessa de
    `estilo.test.ts:84-86` (comparar a lista de folhas com o disco) não tem
    caso; a guarda de `:1028` lista transform/filter/will-change mas não
    `translate`/`scale`/`rotate`.
- [x] Coordenador confere cada documento contra o código (amostra de linhas citadas). 01–07 conferidos.

### Fase 2 — parecer
- [x] `08-parecer.md`: princípios, tokens propostos, o que muda tela por tela em ordem de valor, o que é decisão do dono.
- [x] Página publicada (modo claro) com as decisões do dono: contexto curto, "como está hoje", múltipla escolha, botão de copiar o resumo.
- [x] Respostas do dono registradas no diário (16/10, 01h25).

### Fase 3 — implementação (só depois das respostas)
- [~] Peças em ordem de valor, uma peça inteira por commit (código + teste + checklist). Peças 0 e 1 feitas (16/10).
- [x] Guarda de durações e curvas fora dos tokens (equivalente ao de cor em `tests/dominio/estilo.test.ts`). Peça 0: casos (a)–(e) e a lista de folhas, 52 plantios.
- [x] `DESIGN.md` §Movimento e o princípio 6 de `src/tokens.css` reescritos com a doutrina nova (peça 0).
- [ ] Cada peça: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde.

### Fase 4 — revisão
- [ ] Revisor passa por tudo com capturas e gravações a 414 × 896 (Blink; WebKit se der).
- [ ] Página publicada com o antes e o depois.

---

## Diário

**15/10/2026.** Pedido recebido. Lidos `docs/mapa/00-visao-geral.md`, a doutrina
atual (`DESIGN.md` inegociável 6 e §Movimento, `src/tokens.css` princípio 6 e
`--ins-ease`/`--ins-dur`/`--ins-dur-toque`, `docs/redesign/10-tokens.md` §14,
`docs/design-review/05-movimento.md`) e o P12 do dono. Hoje o app tem quatro
movimentos autorizados mais a subida da folha (06/10), o clarão da câmera e os
três da bancada; o portão de movimento reduzido está em `src/base.css:374`.

Decisões de coordenação:
- **O time é o do pedido, sem ajuste de papéis.** Sistema e revisor vão na
  leva 2 porque dependem do que a leva 1 achar: os tokens saem do inventário e
  das propostas, e o "antes" gravado precisa saber o que gravar.
- **O "antes" é o commit `a22b09d`.** Os scripts de captura ficam no git; as
  capturas não (`docs/motion/_medicao/shots/` no `.gitignore`). Se as capturas
  se perderem, o "antes" se regrava de `a22b09d` numa árvore de trabalho à parte.
- **WebKit:** o desempenho verifica se o WebKit do Playwright roda nesta
  máquina (instalar no cache do Playwright, sem tocar no `package.json`). Se
  não rodar, a prova de WebKit fica pela leitura e isso é dito no parecer.

**15/10, 20h10 — o inventário (01).** O app tem 4 movimentos dentro dele
(indicador de aba, barra do cronômetro, pulso do ponto ao vivo, clarão da
câmera) e 3 na bancada. Só o indicador de aba anima layout (`left`). Nada escapa
do movimento reduzido. A tabela do `DESIGN.md` §Movimento está velha (lista a
rolagem suave, que saiu em `926a549`, e não lista o clarão). A subida da folha,
decisão 14 do dono de 06/10, nunca foi feita. O achado que pesa para a técnica:
dentro de uma tela o Preact reaproveita o nó (transição CSS dispara sozinha),
mas tela, aba, folha, régua, teclado e pare nascem e morrem pelo render, e
toast, cronômetro e corpo do exercício somem por `display: none`. Nenhuma
entrada ou saída anima sem mudar como esses elementos entram e saem.

**15/10, 20h15 — acessibilidade (05).** Sob `reduce` nada anima hoje, pelo bloco
universal de `base.css`. Mas o bloco engole o `transitionend` (medido), não
alcança JavaScript nem `::view-transition-*` e impede dissolver. Proposta: portão
único por adesão (`no-preference`) com guarda de fonte, porta única em JS que
responde "não" quando não sabe, nada espera evento de fim de animação; sob
`reduce`, troca de camada dissolve até 150 ms e mudança no lugar é de estalo.
Foco medido com problemas: tela cheia e modo devolvem o foco ao `body`; pare e
"Não guardei" não deixam o fundo inerte; o Tab sai da folha para o cronômetro;
o toast some por `display: none`. Pergunta para o dono: o pulso infinito do
ponto ao vivo (WCAG 2.2.2).

**15/10, 20h25 — micro-interações (03).** O "toque que afunda" nunca foi portado
para a D: de 28 controles medidos, 16 não mudam nada no toque (célula da série,
RIR, ±15, parar, a água do descanso entre eles). Os comentários que dizem que a
série "voa" até a tabela descrevem uma função que não existe: a confirmação
visual da série não existe. As cinco de maior valor: afundar em todo controle;
o número pousa na célula da série; a bolinha do copo enche de baixo; o
cronômetro sobe pela borda; o toast entra subindo, sai apagando e dura o tempo
do texto. WebKit não abre nesta máquina (falta `libevent-2.1.so.7`).
Achados **fora de motion**, com prova, para o parecer decidir o destino:
contador "séries N/M" fica velho depois de ligar o deload; no modo, cronômetro e
toast flutuam 52 px acima do fundo; a faixa "Não guardado" cobre a saída do
modo; na primeira série a linha desce 52 px e a célula de carga cai sob o dedo.

**15/10, 20h40 — desempenho (04).** **O WebKit roda nesta máquina** (26.5), sem
sudo: quatro bibliotecas baixadas com `apt-get download` e carregadas por
`LD_PRELOAD`. O revisor usa a mesma receita. Todo toque frequente responde no
quadro seguinte (15 a 18 ms até a pintura, Chromium 1×). A primeira série custa
74 ms (184 ms no WebKit) porque cria o `AudioContext` dentro do toque. Com a
thread presa 300 ms, animação em `left` congela e salta; em `transform`, não
para. O indicador de aba custa 14 layouts e 26 pinturas por troca contra 1 e 3
em `transform`. Trocar de aba ou sair de tela cheia tira a camada velha do DOM
na hora: nada sobra para animar a saída. Armadilhas presentes: `transform` em
`#app` ou `.ins-modo` arranca os fixos (barra de abas vai de y 849 a 1251) e a
guarda de estilo não cobre `.ins-modo`; a página rola de lado por programa
(140 a 160 px) apesar do `overflow-x: clip`; o modo curto deixa 24 px roláveis
(58 px no iPhone); uma View Transition engole o toque no Chromium.

**15/10, 20h55 — navegação (02) e o fim da leva 1.** Modelo espacial: os cinco
lugares lado a lado no chão (aba é passo curto de lado), toda tela cheia chega
pela direita por cima do lugar (inclusive modo de sessão e Ajustes), folhas
sobem de baixo, o que é do aparelho não anda. Técnica recomendada: View
Transitions de mesmo documento, um ponto só no `render()`, medida em Chromium e
WebKit (rolagem volta exata, sem barra horizontal, 2–18 ms de atraso no desenho
novo); o toque durante a transição se perde, e o protótipo pula para o fim e
reenvia o clique. Achado fora de motion: a rolagem volta cortada ao fechar o
modo e os Ajustes.

**As divergências que a leva 2 e o parecer precisam resolver:**
1. **View Transitions × o toque.** Navegação recomenda; desempenho mediu que
   ela engole o toque no Chromium e foi inconsistente no WebKit. O protótipo da
   navegação contorna (pula para o fim e reenvia o clique). Precisa de prova nos
   dois motores antes de virar técnica.
2. **Movimento reduzido nas trocas de camada.** Acessibilidade: dissolver até
   150 ms, só opacidade. Navegação: troca seca. É decisão do dono (D6 da 02).
3. **O portão.** Hoje é um bloco universal de `reduce` em `base.css`, que engole
   `transitionend` e não alcança JS nem `::view-transition-*`. Acessibilidade
   propõe portão por adesão + porta única em JS; o caso de `estilo.test.ts:1144`
   precisa ser reescrito.
4. **Durações.** Navegação propõe 240/200/180/90 ms; micro propõe por classe;
   tokens hoje `--ins-dur` 220 ms e `--ins-dur-toque` 120 ms (sem uso). O
   sistema (06) fecha a escala.
5. **Mola.** A doutrina proíbe ultrapassagem ("a folha chega e para"); a 02 põe
   "~350 ms com mola" como opção D5. Fica como opção, com o motivo da proibição.

**Achados fora de motion (para o parecer decidir o destino):** rolagem cortada
ao fechar modo/Ajustes; contador de séries velho depois do deload; cronômetro e
toast flutuando 52 px no modo; faixa "Não guardado" cobrindo a saída do modo;
linha que desce 52 px na primeira série; foco devolvido ao `body`; pare e "Não
guardei" sem fundo inerte; Tab saindo da folha para o cronômetro; teclado que
rola a página 178 px; `AudioContext` criado dentro do primeiro toque; modo curto
com 24–58 px roláveis; conteúdo da folha rolando de lado.

**16/10, 00h50 — sistema (06).** Durações: toque 120 · no lugar 160 · camada
sai 200 · camada entra 240 (de 40 em 40); à parte, dissolver 120 (só sob
reduce), período do cronômetro 250 (igual ao `setInterval`, cobrado), volta do
pulso 2,4 s. `--ins-dur` (220) sai. Uma curva só, `--ins-curva` (o valor atual
de `--ins-ease`, renomeado); `linear` só na barra do descanso; ultrapassagem
proibida e cobrada. Portão: tudo dentro de `no-preference` com o estado final
escrito fora; JS pergunta a uma porta só (`podeMover`/`tempo`); o bloco
universal de `base.css:374` sai no mesmo commit em que as guardas entram. Guarda
em cinco casos (a–e). As decisões do dono foram consolidadas em DS1–DS12, cada
uma dizendo o que absorve da 02/03/05. Achado novo: a 02 e a 05 divergem no
tamanho do deslize da tela cheia (virou DS4); o avanço automático do exercício
(01 B2) ficou sem dono.

**16/10, 01h — o parecer (08) em rascunho.** Decidido pelo coordenador (técnico,
não vai ao dono): mudança no lugar por classe CSS; troca de camada por View
Transitions de mesmo documento num ponto só do `render()`, **com o teste de
navegador do toque atravessando como porta de entrada da peça 5** — se uma
camada reprovar num motor, ela troca seco naquele motor; a entrada da folha por
CSS no nascimento, a descida com a peça 5; porta única `src/ui/movimento.js`;
portão por adesão e o universal fora (contra a R10 da 04, pelos motivos da 06
§4.3); o avanço automático do exercício continua salto (rolagem animada congela
com o `render()`); a frase "Abrindo o registro…" só aparece se a abertura
demorar. As precondições (rolagem cortada, vão de 52 px, foco, isolamento,
teclado que rola, `AudioContext` no toque, sobra de scroll do modo, folha que
rola de lado, região viva do toast) entram nas peças sem pergunta. Ao dono vão
13 perguntas: as 12 da 06 §6 e uma de escopo, sobre sete defeitos que não são de
movimento.

**16/10, 02h — a página das decisões no ar.** "Decisões do movimento"
(https://claude.ai/artifact/HT7ZLyy9VVLPWQvHAVcfbM), tema claro, mesmo formato
da página de 14/10 que ele respondeu: contexto sem jargão, "como está hoje",
opções com consequência, recomendação, campo livre, resumo para copiar, e as
respostas salvas no banco da página (coleção `respostas`). Novidade: cada
pergunta de movimento tem um desenho do app (proporção do iPhone 11 Pro Max,
cores de `tokens.css`) com botões que tocam cada opção na velocidade real,
pelos tokens propostos; a pergunta 7 é para ele apertar. As demonstrações
seguem o tempo que ele marcar na 1 e a 5 segue a 4. Conferido no Chromium a
414 px: sem erro no console, sem rolagem lateral, os 38 botões tocam. A 6 e a
13 não têm desenho (não são movimento que se veja). Pergunta sem resposta fica
como está hoje.

**16/10, 01h25 — as respostas do dono** (colou o resumo no chat; vale o que ele
marcou, mesmo contra a recomendação):

| # | pergunta | resposta | recomendação era |
|---|---|---|---|
| 1 | tempo da camada | **como o iPhone, com quique** | médio |
| 2 | "Reduzir movimento" nas camadas | esmaece ao chegar, sai de uma vez | = |
| 3 | aba | **a página inteira desliza** (carrossel) | passo curto |
| 4 | tela cheia | **da direita, a tela inteira; a de baixo parada** | a de baixo recua |
| 5 | modo de sessão | como qualquer tela cheia | = |
| 6 | o quadro a mais | aceitar | = |
| 7 | toque | **só escurece** | afunda em todo controle |
| 8 | série recebida | pouso | = |
| 9 | cronômetro | sobe da borda e desce | = |
| 10 | aviso curto | sobe, apaga, fica o tempo do texto | = |
| 11 | painel de apagar | **igual à folha** | parado |
| 12 | ponto ao vivo | **pulsa para sempre, como hoje** | duas vezes e aceso |
| 13 | os sete defeitos | **consertar junto, dentro das peças de movimento** | em peças próprias |

**O que eu decidi para ler as respostas** (técnico; registrado, não reabro):

- **Onde vai o quique (1).** O que ele viu e aprovou: na pergunta 1, a folha
  chegando com ultrapassagem (640 ms: passa 8 % do lugar aos 55 %, volta 3 %
  aos 80 %, assenta) e saindo em 350 ms sem quique; nas perguntas 4, 5, 9 e
  11, com a 1 marcada, os desenhos tocavam 350 ms na curva do iPhone **sem**
  quique. Fica assim: **quique só na chegada da folha e do painel de apagar**
  ("igual à folha", 11); tela cheia, modo e cronômetro chegam e saem em 350 ms
  na curva do iPhone, sem quique; nenhuma saída tem quique. Digo a ele em uma
  linha, para corrigir se quiser.
- **Tokens que mudam** (a 06 §2 ajusta na peça 0): `--ins-dur-entra` e
  `--ins-dur-sai` 350; `--ins-curva-camada` `cubic-bezier(.32,.72,0,1)`;
  `--ins-dur-quique` 640 com os quadros acima; `--ins-dur-lugar` 160 e
  `--ins-curva` ficam (pouso, aviso, copo, toque); o véu da folha em 350
  `ease-out`. **Saem** `--ins-afunda`, `--ins-afunda-largo` (7: só escurece),
  `--ins-passo-aba` (3: carrossel), `--ins-recuo` (4: a de baixo parada).
  `--ins-ciclo-vivo` 2,4 s fica, infinito (12).
- **A aba (3)** desliza a página inteira em 350 ms na `--ins-curva`, o fio
  junto — o que o desenho tocou. Sob "Reduzir movimento", segue a 2: o
  conteúdo novo esmaece 120 ms e o velho sai de uma vez.
- **Sob "Reduzir movimento"** (2), toda camada — folha, painel, tela cheia,
  modo, cronômetro — esmaece 120 ms ao chegar e sai de uma vez; o pouso e o
  aviso ficam só na opacidade; o quique e todo deslocamento somem; o ponto
  fica aceso e parado (como hoje com a chave).
- **Doutrina.** O princípio 4 da 08 ("proibido: ultrapassagem e mola") e o
  teto de 300 ms da 04 caem por decisão do dono: a ultrapassagem passa a ser
  permitida **só** no token do quique, e a guarda (a) confere isso. O 2.2.2 da
  WCAG fica descumprido para quem não ligou "Reduzir movimento" (12), por
  decisão dele, escrito no `DESIGN.md`.
- **Os sete defeitos (13) por peça:** 1 (contador velho) e 2 (linha que desce
  52 px) na peça 2; 5 ("Não guardei" na zona do polegar) na peça 4, junto do
  painel; 4 (faixa sobre a saída do modo) e 7 (foco do campo de importar) na
  peça 5; 3 ("Comi tudo" que empurra 145 px) e 6 (dois "+1 copo") na peça 8.
  Cada um com teste próprio dentro do commit da peça.

**Como a fase 3 roda.** Uma peça por vez, na ordem da 08 §4, por um agente
implementador com o documento do especialista daquela área como espec; ele não
faz commit. Eu confiro o diff, rodo `npm run tipos`, `npm run build` e
`npx vitest run`, e faço o commit. Em paralelo, nada que mexa nos mesmos
arquivos. Começa quando o revisor terminar de gravar o "antes" (para o build e
os testes não roubarem CPU das medidas de latência dele).

**16/10, 01h40 — fase 3 começa.** O revisor caiu no limite de uso às ~01h25,
com a gravação do "antes" já terminada (cadeia com FIM e saída 0; 17 fluxos e
as rodadas Chromium/WebKit, normal, ×3, "Reduzir movimento", complemento e
mouse em `shots/revisor/antes/`). Retomado para fechar o 07 com o protocolo do
"depois" ajustado às respostas do dono; sem build e sem servir `dist/` enquanto
o implementador trabalha. Peça 0 disparada para um implementador (pedido em
texto, a partir da 08 §4 e §5.1, da 06 §2, §4 e §5 e das respostas), sem commit:
eu confiro e faço o commit.

**16/10, 02h — o revisor fechou o 07** (431 linhas). Conferido: a rolagem do
Corpo que volta cortada (`02-modo-faixa/medidas-chromium.json`: `y` 1982 antes
de entrar, 1091 depois de sair) e o fio em `left` 220 ms batem com 02 e 04. O
protocolo já usa os valores do dono (07 §1.2) e diz o que cada peça tem de
provar com o número do antes ao lado (07 §1.4). Ressalva de método dele: a
captura do Chromium às vezes fica ~250 ms sem quadro com a página já desenhada;
esses trechos saem marcados e vale o Event Timing. Não gravou: Comparar fotos
(registro sem fotos), gesto de borda, clarão, "Não guardei" (o `micro-avisos`
mede). Parecer §7 escrito a partir do 07. Fases 1 e 2 fechadas.

**16/10, 02h25 — peça 0 conferida.** Relatório do implementador em
`09-implementacao.md`. Conferi o diff: tokens com os valores das respostas
(camada 350 na curva do iPhone, quique 640 em `@keyframes ins-quique` dentro de
`tokens.css`, `--ins-curva-ciclo` = o `ease` de hoje, para o pulso não mudar);
o universal saiu; pulso, barra, clarão e bancada no portão; o fio num invólucro
da largura da barra (o WebKit arredondava o `%` do fio de 82,8 para 83 px), com
`overflow-x: clip` na barra; a porta `movimento.js` com `@ts-check`; o clarão
sem relógio, um nó por disparo, `pointer-events: none`. Aceito o token
`--ins-dur-clarao` (200) que ele criou: nenhum outro ficou em 200 depois das
respostas, e a lista de durações do 07 §1.2 já tem 200.
Um vermelho que não era da peça: `agora.test.js` "os 14 dias… a MESMA que o
portão lê" falhava também no `a22b09d`, porque `diasRegistrados()` lia
`new Date()` e o resto do app lê `Date.now()` (o relógio que os testes fixam no
dia 15; hoje é 16). Corrigido em commit à parte, sem efeito no aparelho (os dois
relógios são o mesmo fora dos testes). Depois: `tipos` limpo, build, 1593/1593.

**16/10 — peça 0 conferida pelo revisor** (07 §6, "Depois da peça 0"). Passa
na linha dela nos dois motores e sob "Reduzir movimento", sem regressão: o
fio em `transform` 160 ms (0 reprovações em "só transform e opacity", eram 16);
no traço do Chromium 1 layout e 1 pintura por troca (eram 15 e 27); com a
thread presa 150 ms o fio não para (antes parava 148–162 ms e saltava); sob
"Reduzir", nenhuma animação viva em 45 passos e o ponto aceso e parado; o
pulso igual. O que reprova é do antes e tem peça: foco no `body` e a rolagem
1982 → 1091 (peça 5), o dedo pousado sem mudança no WebKit (peça 1). Regra
nova do protocolo: reprovação de tempo só vale repetida três vezes (duas
sumiram assim). O clarão não entra nos fluxos (vale o número do 09). Para a
peça 6: o fio passa a 350 ms junto com o carrossel. Peça 1 disparada.

**16/10, 11h50 — peça 1 conferida.** O toque só escurece: uma camada
(`background-image` com `--ins-toque`, `!important` só nela) pintada sobre
qualquer preenchimento de repouso no `:active`, fora do portão e sem transição;
o ouvinte passivo vazio de `touchstart` no topo de `main.jsx`. Antes, 78 de 115
controles não mudavam com o dedo pousado; depois os 115 medem 1,56–1,72:1 contra
o repouso e o fundo, nos dois temas e sob "Reduzir". Conferi o risco da camada
`!important`: nenhum controle do app pinta imagem de fundo (a guarda (f) cobra);
os botões metálicos da bancada perdem o gradiente só enquanto apertados (é
ferramenta, não app). `--ins-dur-toque` saiu (não há movimento no toque); 08
§5.1 ajustado; o 07 ainda cita, o revisor ajusta. `micro-toque.mjs` passou a
compor as camadas (lia só `background-color`). `tipos` limpo, build, 1596/1596.
