# 07 · Revisão — protocolo da fase 4 e o "antes" gravado

> Em uma frase: como a fase 4 vai provar, princípio por princípio e peça por
> peça, que o movimento novo faz o que o dono decidiu em 16/10 — e não espera o
> toque, não pisca, não trava, não salta —, com qual script, em qual motor e qual
> número reprova; e o "antes" já gravado nos dois motores, com e sem "Reduzir
> movimento", para a página de antes e depois ter contra o que comparar.

Revisor do time de motion, leva 2. Leitura de `00-briefing.md`,
`00-coordenacao.md` (inclusive as respostas do dono de 16/10, 01h25), `01` a
`06`, `08-parecer.md` §4 e §5.1 e `docs/mapa/00-visao-geral.md`. Nenhum código
do app foi tocado.

> **16/10.** O dono respondeu as treze decisões. **O protocolo confere os
> valores dele** (08 §5.1), não os da recomendação: camada em 350 ms na curva do
> iPhone, quique de 640 ms só na chegada da folha e do painel de apagar, aba em
> carrossel de 350 ms, tela cheia pela direita com a de baixo parada, toque que
> só escurece, ponto ao vivo pulsando sem fim, os sete defeitos dentro das
> peças. O teto de 300 ms da 04 (R9) caiu por decisão dele.

**O "antes" é o commit `a22b09d`.** O `dist/` desse commit foi copiado inteiro
para `docs/motion/_medicao/shots/dist-antes/` (fora do git; conferido com
`diff -rq` contra o `dist/` antes da fase 3 começar) e é dele que saem todas as
gravações, servido em `localhost:4727` (servidor já desligado). Com o código
mudando na fase 3, essa cópia continua servindo o antes; se ela se perder,
constrói-se `a22b09d` numa árvore à parte.

**Onde está cada coisa.** Scripts em `docs/motion/_medicao/revisor-*.mjs` e
`revisor-tiras.py` (no git). Gravações em
`docs/motion/_medicao/shots/revisor/antes/<fluxo>/` (fora do git, 86 MB): o
vídeo `<rodada>.webm`, uma tira de quadros por passo `NN-<passo>-<rodada>.png`,
o quadro final `NN-<passo>-<rodada>-fim.jpg` e as medidas
`medidas-<rodada>.json`. Rodadas: `chromium`, `webkit`, `chromium-reduz`,
`webkit-reduz` (os 17 fluxos), `chromium-mouse` (03, 03b, 09, 12, 13: o dedo
como ponteiro, que acende o `:active`), `chromium-x3` e `webkit-x3` (01, 03,
03b, 07, na densidade ×3 do iPhone 11 Pro Max). São **81 vídeos e 216 tiras**.
O registro semeado (120 dias de uso, 104 kB) está em
`shots/revisor/antes/registro.json`; o depois roda com **o mesmo** registro. O
antes julgado pelo próprio protocolo (a linha de base) está em
`shots/revisor/antes-contra-protocolo/protocolo.json`.

---

## 1. O protocolo da fase 4

### 1.1 Como se mede

- **Ambiente.** 414 × 896, ×2, `isMobile`, `hasTouch`, quinta 15/10/2026 no
  relógio do app (andando; o `Date` inteiro é deslocado, não só o `Date.now`),
  o registro de `antes/registro.json` devolvido a cada fluxo por um script que
  roda antes do app (o app grava o pendente no `pagehide`, `src/main.jsx:6921`,
  e sobrescreveria um registro posto antes da recarga). Chromium 151
  (`chromium-1234`, o `chrome` do cache) e WebKit 26.5 (`webkit-2336`, com as
  quatro bibliotecas de `~/.cache/ms-playwright/webkit-deps-noble/` por
  `LD_PRELOAD`, receita no topo de `desempenho-comum.mjs`). Cada rodada também
  com `reducedMotion: 'reduce'`.
- **O dedo.** No Chromium, toque de verdade pelo CDP (`touchStart`, 100 ms
  pousado, `touchEnd`; o `click` nasce do gesto). No WebKit do Playwright não há
  toque com duração: o dedo é o ponteiro, apertado 100 ms. **Medido: com o toque
  emulado do Chromium o `:active` nunca acende com o dedo pousado** (nenhum
  elemento casa `:active` a 20, 80, 200 e 400 ms; com o ponteiro, acende) — o
  Chromium só o mostra depois de soltar, por ~150 ms (visto em
  `12-teclado/medidas-chromium.json`, `mudancasFinas` a +164 ms na caixa da
  tecla). Por isso o "toque que escurece" se confere no WebKit e na rodada
  `chromium-mouse`.
- **A gravação.** `page.screencast` do Playwright 1.62 entrega cada quadro que o
  compositor produz, com o carimbo de quando foi trocado, e grava o `.webm`
  junto. Cada rodada começa com uma **calibração**: seis trocas de cor numa
  página em branco dizem quanto a captura leva para entregar uma mudança
  (Chromium 3–6 ms, mediana 4–5; WebKit 20–62 ms, mediana 30–45). Todo tempo de
  quadro é descontado dessa mediana: "+20 ms" quer dizer 20 ms além do que uma
  mudança feita no instante do toque levaria para aparecer.
- **A folga em volta do zero.** Descontada a mediana, sobra um erro do tamanho
  da variação da latência (~20 ms no WebKit, 5 no Chromium). Um quadro até essa
  folga **antes** do zero ainda conta como resposta ao toque; por isso há
  números como "−1 ms" no WebKit. A mesma folga vale para o começo da janela do
  dedo pousado: o quadro do `:active` pode cair alguns ms antes do
  `pointerdown` (corrigido em 16/10, na conferência da peça 1, e recalculado em
  todas as gravações a partir da linha do tempo: seção 7).
- **A passada de aquecimento.** Cada fluxo roda uma vez sem gravar e depois é
  gravado. Sem ela, no WebKit desta máquina a primeira vez que uma tela aparece
  custa de 180 a mais de 800 ms (a fonte do sistema do app não existe no Linux,
  04 §1.3) e isso entraria na tira como atraso do app: medido, o treino aberto no
  Programa caiu de 184 para 4 ms e o pare de 209 para 29 ms com a passada. A
  navegação entre fluxos não esfria nada (10–23 ms depois de aquecido). **O
  fluxo `03b` é a exceção de propósito**: a primeira série a frio, sem passada,
  porque o `AudioContext` nascendo no toque é custo do app, real a cada abertura
  no iPhone, e a passada o esconde (Chromium: 80,6 ms a frio contra 10,9
  aquecido).
- **O instante zero** de cada passo é o `click` (quando o app age). A tira mostra
  o último quadro entregue até cada instante: antes do dedo, dedo pousado, +50,
  +100, +150, +250, +400 e +800 ms. A captura só manda quadro quando algo muda,
  então "quadro de +20 ms" embaixo do "+150" quer dizer que nada mudou de 20 a
  150 ms.
- **As medidas de cada passo** (`medidas-<rodada>.json`): o trabalho síncrono
  do click (`toque.handlerMs`); o quadro seguinte pelo `requestAnimationFrame`
  (`toque.ateOQuadroMs`); o **Event Timing** do click (`eventTimingClickMs`: do
  toque ao quadro apresentado, pela régua do próprio motor, arredondado a 8 ms;
  o Chromium e o WebKit 26.5 têm; vazio quer dizer "abaixo de 16 ms"; no
  Chromium traz ~20 ms do gesto de toque embutidos); o primeiro quadro da tela
  que muda (`primeiraMudancaMs`); quantos quadros carregam a mudança e até
  quando, em resolução cheia, com a caixa do que mudou (`quadrosComQualquerMudanca`,
  `ultimaQualquerMudancaMs`, `mudancasFinas`); o que muda com o dedo ainda
  pousado (`mudancaNoPousarMs`); quadros que aparecem e somem (`transitorios`);
  as animações vivas no quadro seguinte e aos 150 ms (propriedades, duração,
  repetições, curva); os fixos aos 120 ms (`meio`) e no fim (`depois`); a
  largura rolável; o foco; a rolagem; o que está sob o dedo antes e depois; e
  `confere`, a prova de que o passo produziu o efeito.
- **Uma limitação medida da captura do Chromium.** Com o cronômetro e o pulso
  rodando, a captura às vezes passa **~250 ms sem entregar quadro** logo depois
  de um toque, enquanto o motor diz que apresentou o quadro novo em 32–40 ms
  (Event Timing) e o `requestAnimationFrame` segue a 16 ms. Reproduzido em todas
  as rodadas no passo `03-serie-regua/abre-regua-2` (tela a +250–266 ms, Event
  Timing 40), com e sem gravar vídeo, no `chrome` e no `chrome-headless-shell`.
  O script marca isso (`capturaAtrasadaMs`, `lacunasDaCaptura`) e a tira escreve
  "LACUNA DA CAPTURA" em vermelho no quadro afetado
  (`03-serie-regua/03-abre-regua-2-chromium.png`). **Nesses passos vale o Event
  Timing, não a tira.**

### 1.2 O que o depois tem de mostrar — os valores do dono

| movimento | onde | tempo e curva | sob "Reduzir movimento" |
|---|---|---|---|
| **camada entra e sai** | tela cheia, modo de sessão (da direita, **a de baixo parada**); cronômetro (de baixo); a saída da folha e do painel de apagar | **350 ms**, `cubic-bezier(.32,.72,0,1)` (a curva do iPhone), sem quique | esmaece 120 ms ao chegar; sai de uma vez |
| **quique** | **só** a chegada da folha e do painel de apagar | **640 ms**: passa 8 % do lugar aos 55 %, volta 3 % aos 80 %, assenta; o véu em 350 ms `ease-out` | esmaece 120 ms; nada se desloca |
| **aba** | as cinco abas | **carrossel de 350 ms**: a página inteira desliza, na `--ins-curva`; o fio junto, em `transform` | o conteúdo novo esmaece 120 ms; o velho sai de uma vez |
| **no lugar** | o pouso da série, o copo que enche, a forma da refeição | 160 ms, `--ins-curva` (`cubic-bezier(.2,.8,.2,1)`) | só opacidade |
| **aviso** | o toast | 160 ms (sobe 8 px e acende; sai apagando); fica o tempo do texto (3,6 a ~8 s) | só opacidade |
| **toque** | todo controle | **só escurece**, nenhuma escala; o estado se vê com o dedo pousado | igual |
| **ponto ao vivo** | Agora e relógio da sessão | 2,4 s, **infinito** (decisão 12; descumpre o 2.2.2 por decisão escrita) | aceso e parado |
| outros que já existem | barra do descanso; clarão da câmera | 250 ms `linear`; 200 ms | degraus; nenhum |
| **nenhum movimento** | régua, teclado, RIR; números derivados; fim do descanso; abertura; giro; avanço automático para o próximo exercício | — | — |

**Durações que podem aparecer** numa animação do depois: 120 (só o esmaecer
sob "Reduzir movimento"), 160, 200, 250, 350, 640 e 2400 ms. Qualquer outra
reprova (é a guarda (a) da 06, conferida em tempo de execução). **O toque não
tem tempo**: escurece na hora, sem transição, e `--ins-dur-toque` saiu na peça
1 — uma transição no controle tocado reprova. Ultrapassagem — curva com y fora de [0, 1] ou quadro-chave
que passa do lugar — só na animação de 640 ms, e só nos passos de chegada de
folha e de painel.

### 1.3 Os princípios — como se confere, onde, o que reprova

Todos aplicados passo a passo por `revisor-compara.mjs`, que lê o esperado de
cada passo (`mov`, em `revisor-fluxos.mjs`). Os números "hoje" são deste antes
(seção 4; a linha de base inteira em `antes-contra-protocolo/protocolo.json`).

| # | princípio | como se confere | motor | reprova quando |
|---|---|---|---|---|
| 1 | **O toque nunca espera** (regra 2; 04 R2) | todos os passos: `confere`, trabalho no toque, primeiro quadro da tela, Event Timing. Fluxos **14–16**: um segundo toque **99–151 ms** depois do primeiro (no meio dos 350 ms) tem de chegar ao alvo sob o dedo. Complemento: `desempenho-toque.mjs` (04 §3.2) nas doze ações, Chromium 1× e 4× e WebKit | os dois | `confere` falso; segundo toque caindo fora de um botão (no `html`, que é onde a View Transition o joga, 04 §2.6); tela mudando **mais de 17 ms (um quadro) depois** do antes no mesmo passo (a decisão 6 aceita um quadro, não mais); trabalho no toque > max(16 ms, antes + 4); Event Timing > antes + 16; **1ª série com trabalho > 16 ms no Chromium 1×** (hoje 80,6 ms a frio, `03b`; 04 R8) |
| 2 | **Só `transform` e `opacity`** (regra 4; 04 R1) | as animações vivas de cada passo; traço do Chromium por movimento novo (`desempenho-movimentos.mjs`, uma janela por movimento: `compositeFailed: 0`) | os dois | qualquer animação de propriedade fora de `transform`, `translate`, `scale`, `rotate`, `opacity`; qualquer `compositeFailed ≠ 0`. **Hoje reprova** em 16 passos: o fio da aba anima `left` em 220 ms (07, 14, e o 05 "Ir para Semana") |
| 3 | **Nada pisca no Blink** (regra 5; 04 R3, R4, R7) | rodada `chromium`: quadro transitório entre o toque e +800 ms (além dos que o antes já tem); os fixos aos 120 ms contra o fim, fora os que se movem de propósito no passo (o cronômetro, o aviso e a faixa que o acompanham); largura rolável aos 120 ms; `desempenho-armadilhas.mjs` §0–§3 com a sonda no meio do movimento real; e o vídeo lento lado a lado, a olho | Chromium | 1 quadro transitório a mais; fixo fora do lugar > 1 px; página mais larga que a janela (o carrossel e a tela cheia deslizam a página inteira: é aqui que a armadilha do `translateX(+)` apareceria); `backdrop-filter` ≠ `none`; `will-change` fora do elemento que anima. Hoje: 0 em todos |
| 4 | **60 fps no WebKit** (regra 5; 04 §6) | rodada `webkit`: intervalos de `requestAnimationFrame` de 0 a +800 ms sem contar o primeiro (o do render); o maior intervalo da captura no movimento; `desempenho-compositor.mjs` com o elemento real e a thread presa 150 ms | WebKit | 1 intervalo > 34 ms fora o do render; parada > 0 ms com a thread presa. Buraco > 34 ms **só na captura**, com a página no ritmo, fica "a conferir". Hoje: 7 reprovações, quase todas na rodada ×3 e sob "Reduzir movimento" (pior 103 ms) — o WebKit desta máquina sem GPU, não o A13 |
| 5 | **"Reduzir movimento" vale em tudo** (regra 3; decisão 2) | rodadas `-reduz`, todos os passos | os dois | animação que não seja só opacidade; chegada de camada > 120 ms, pouso ou aviso > 160 ms; **qualquer animação numa saída** (sai de uma vez); qualquer infinita (o ponto fica aceso e parado); a tela ainda mudando 50 ms além do teto fica "a conferir". Hoje: 0 animações em todos os passos |
| 6 | **O foco não se perde** (05 M8–M10; peça 5) | `document.activeElement` aos 150 ms e no fim; `acesso-foco.mjs` (Tab, Shift+Tab, `inert`) nas duas preferências | os dois | foco no `body` depois de abrir ou fechar camada; piorar contra o antes. **Hoje reprova** em 45 passos (modo, telas cheias, pare: 05 §3.1) |
| 7 | **Nada que só se entenda pelo movimento** (05 §4) | rodadas `-reduz`: `confere` verdadeiro e a tela final igual à da rodada com movimento; o revisor lê a tira reduzida contra a tabela do 05 §4 | os dois | tela final diferente > 0,5 %; `confere` falso; item da tabela do 05 §4 ausente na tira reduzida |
| 8 | **Sem enfeite, e as decisões do dono** (regra 6; 08 §5.1) | cada passo contra o seu `mov` e a tabela 1.2 | os dois | duração fora da lista; infinito que não é o ponto; quique fora da chegada de folha e painel; movimento num passo "nenhum"; **camada que troca num quadro só** (o movimento decidido não aparece: < 3 quadros com mudança); **a de baixo se moveu** (decisão 4: a faixa 0–60 px da esquerda aos +50 ms difere > 1 % do antes, ao entrar, ou do fim, ao sair). A duração visível fora de 0,5×–1,5× do decidido fica "a conferir" (o pulso que chega também conta) |
| 10 | **O toque se vê** (decisão 7; peça 1) | todo passo de toque nas rodadas `webkit`, `chromium-mouse` e nas duas reduzidas (onde o `:active` acende com o dedo pousado, 1.1): o que muda com o dedo pousado, a caixa ou os pixels do que mudou contra a caixa do controle, as animações no controle; complemento `micro-toque.mjs` (contraste do estado de toque contra o repouso e contra o fundo, 28 controles) | WebKit e Chromium com ponteiro, com e sem "Reduzir" | nada muda com o dedo pousado; **qualquer animação no controle tocado** (o toque só escurece, na hora; escala é a decisão 7). "A conferir": a mudança passa da caixa do controle ou cobre menos de 25 % da área dele. **Hoje reprova** em 76 passos×rodadas |
| 9 | **Nada salta: a rolagem volta exata** (02 T6; peça 5) | 01, 02, 04, 05: a rolagem depois de sair contra a de antes de entrar | os dois, com e sem "Reduzir" | diferença > 1 px. **Hoje reprova**: o Corpo entra no modo em 1982 px e volta em **1091** |

### 1.4 O que cada peça tem de provar

A fase 3 entrega uma peça por commit (08 §4). Depois de cada commit, o
coordenador constrói o `dist/` e o revisor grava **só os fluxos da peça**
(`FLUXOS=`), nos dois motores e com "Reduzir movimento", e roda o comparador. No
fim, tudo de novo.

| peça | fluxos (`FLUXOS=`) | o que tem de aparecer no depois | o antes (número e arquivo) | complemento |
|---|---|---|---|---|
| **0 · o sistema** | 07, 14, 05 + todos sob `-reduz` | o fio da aba em `transform` (princípio 2); sob "Reduzir", nenhuma animação viva e o ponto parado (hoje o portão universal o deixa a 0,01 ms); o ponto pulsando 2,4 s sem fim sem a preferência; nenhuma duração fora da lista | fio em `left`, 220 ms, `cubic-bezier(.2,.8,.2,1)` (`07-abas/medidas-chromium.json`; 14 layouts e 26 pinturas por troca, 04 §2.7) | `npx vitest run` com as guardas (a)–(e) da 06 §5 (é do coordenador) |
| **1 · o toque escurece** | 03, 03b, 09, 12, 13 nas rodadas `webkit` e `chromium-mouse` (e, no fim, todos) | em **todo** passo de toque, com e sem "Reduzir movimento", mudança do tamanho do controle com o dedo pousado (`mudancaNoPousarMs`), **nenhuma animação no controle** (o toque não tem tempo; `--ins-dur-toque` saiu); o "+1 copo" passa a mostrar o toque; o ouvinte de `touchstart` existe | no WebKit, **25 de 41** passos de toque não mudam nada com o dedo pousado; os outros 16 mudam a 1,08–1,24:1 (03 §1.3), que a medida fina pega e o olho mal vê; o "+1 copo" não muda nada (`09-copo/01-mais-1-webkit.png`, quadros "antes" e "dedo" iguais) | `micro-toque.mjs` (03 §1.3: contraste do fundo pressionado em 28 controles) |
| **2 · a série recebida** + defeitos 1 e 2 | 03, 03b | o número pousa em 160 ms (só `transform`/`opacity` no `<span>` da célula); **1ª série a frio com trabalho ≤ 16 ms** no Chromium; depois da 1ª série, sob o dedo **não** pode estar a célula de carga da mesma série | a frio: Chromium 80,6 ms de trabalho, tela a +93 ms; WebKit 173 ms, tela a **+363 ms** com o botão "10" apertado o tempo todo (`03b-primeira-serie-fria/02-grava-1-webkit.png`); sob o dedo fica "Série 1: 40 quilos por lado" (`medidas-*.json`, `depois.sobODedo`) | `micro-serie.mjs` (a linha da série: y igual antes e depois, ±2 px; hoje 323 → 375); `micro-contador.mjs` (tela = dado; hoje 1/20 contra 1/12) |
| **3 · o descanso** | 03 (grava-1, grava-2) | o cronômetro sobe da borda em 350 ms e desce em 350, sem quique; o aviso e a faixa o acompanham (`translate`); **no modo, o fundo do cronômetro no fundo da tela** | nasce num quadro em y 762–844: **52 px acima do fundo** de 896, com o conteúdo do exercício seguinte aparecendo por baixo (`03-serie-regua/02-grava-1-chromium.png`, `depois.fixos.cronometro`) | `micro-avisos.mjs` (o toast não pula 82 px quando o cronômetro entra ou sai) |
| **4 · a folha sobe** + painel de apagar + defeito 5 | 06, 13, 15 | folha e painel chegam com o **quique de 640 ms** (a única ultrapassagem permitida), o véu em 350 `ease-out`; a segunda folha sobe sobre a primeira; o × tocado ~100 ms depois de abrir fecha a folha (15) | folha, segunda folha e painel nascem num quadro (+10 a +31 ms; `06-folhas/01-abre-*.png`, `13-pare/01-abre-*.png`: 82 % da tela troca de uma vez); o × no meio já funciona (`confere` verdadeiro, 2º toque a +99 ms) | `micro-avisos.mjs` ("Não guardei": quando chega e onde ficam os botões); `acesso-foco.mjs` (o Tab não sai da folha para o −15; pare isola o fundo) |
| **5 · telas cheias e modo** + defeitos 4 e 7 | 01, 02, 04, 05, 08, 16, 06 (descida) | chegam pela direita em 350 ms, **a de baixo parada** (faixa da esquerda igual ao antes aos +50 ms); saem pela direita em 350; folha e painel descem em 350; a rolagem volta exata; foco no título ao entrar (o modo também) e num lugar declarado ao sair; o Voltar do sistema faz o mesmo reverso; a seta tocada ~120 ms depois de entrar no modo fecha o modo (16) | tudo troca num quadro (+16 a +22 ms no Chromium); a faixa da esquerda muda 8–22 % aos +50 ms (a tela trocou); Corpo **1982 → 1091 px**; foco no `body` ao entrar e sair do modo e ao fechar tela cheia; o Voltar do sistema desenha em **dois quadros** (+8,6 e +19,7 ms, `08-voltar-sistema`) | `navegacao-hoje.mjs` (rolagem de cada fecho); `micro-avisos.mjs` (a faixa "Não guardado" não cobre a seta); `desempenho-armadilhas.mjs` §4 (a sobra de 24 px no modo curto) |
| **6 · a aba** | 07, 14 | o carrossel: a página inteira desliza em 350 ms, ≥ 3 quadros com mudança; a barra de abas parada aos 120 ms; **sem página mais larga que a janela**; a aba tocada no meio vence (14); sob "Reduzir", o novo esmaece 120 ms e o velho sai de uma vez | o conteúdo troca num quadro (+17,7 ms); só o fio anda, 220 ms (`07-abas/01-agora-corpo-chromium.png`: o fio a caminho de "Corpo" nos quadros +50 e +100) | `desempenho-armadilhas.mjs` §1 (transbordo lateral e rolagem de lado por programa) |
| **7 · o aviso** | 10 | sobe 8 px e acende em 160 ms; o texto novo refaz a entrada; sai apagando em 160; fica o tempo do texto; **no modo, deixa de flutuar 52 px** | aparece, troca de texto e some, cada um num quadro; no modo fica em y 787–830 com o conteúdo por baixo (`10-toast/01-chega-chromium.png`); 3,6 s fixos | `acesso-foco.mjs` / 05 M12 (a região viva nunca sai da árvore) |
| **8 · o resto** + defeitos 3 e 6 | 09, 11, 12 | o copo enche de baixo em 160; a forma da refeição pousa em 160; **"Comi tudo" não empurra a linha**; régua e teclado continuam sem movimento (princípio 8, "nenhum") | o copo e a forma trocam num quadro; depois de "Comi tudo" a leitura de volta nasce no topo e a própria linha do almoço desce até o dedo (`11-refeicao-linha/02-comi-tudo-chromium.png`) | `micro-agora.mjs` (a linha não desce; hoje 157 px); `micro-abertura.mjs` ("Abrindo o registro…" não pisca); o teste do defeito 6 é da peça |

### 1.5 A ordem da fase 4 — o que rodar

1. **Quando.** Depois do commit de cada peça, com o `dist/` construído pelo
   coordenador, e nunca ao mesmo tempo que `npm run build` ou `npx vitest run`
   (roubam CPU das medidas de latência).
2. **Servir e gravar.** O `dist/` novo numa porta própria e o mesmo
   `revisor-gravar.mjs`, com `REGISTRO=…/antes/registro.json`, para a pasta
   `depois/`, nas rodadas da seção 3 (só os fluxos da peça, com `FLUXOS=`; no
   fim, todos).
3. **Comparar.** `revisor-compara.mjs antes depois comparacao` aplica a tabela
   1.3 passo a passo e escreve `comparacao/protocolo.json`, os pares de tiras e
   os vídeos lado a lado.
4. **Os complementos** da coluna da direita da tabela 1.4 e do 04 §6, contra o
   `dist/` novo, nos dois motores.
5. **A olho.** Cada vídeo lento lado a lado (o pisca que nenhuma conta pega) e
   cada tira reduzida contra o 05 §4.
5a. **Reprovação de tempo se confirma.** Cada passo é uma amostra só. Um
   REPROVA nos princípios 1 ou 4 (trabalho no toque, Event Timing, primeiro
   quadro, ritmo) só vale depois de repetir aquele fluxo **três vezes nos dois
   lados** (antes e depois, mesmo motor, mesma rodada) e comparar as medianas.
   Na peça 0, as duas reprovações de tempo sumiram assim (seção 6).
5b. **O `03b` grava sozinho.** A primeira série a frio só é fria se for o
   primeiro fluxo da rodada: rodar `FLUXOS=03b` à parte, antes das outras (com
   `FLUXOS=03,…` ele vem depois do 03, que já esquentou o `AudioContext` e a
   fonte — foi o que aconteceu no `depois-1`, seção 7).
6. **O que não se mede aqui**, dito na página: o Core Animation do A13; o
   `:active` com o ouvinte de `touchstart` no iOS; o gesto de borda e o
   `popstate` com `hasUAVisualTransition`; o `svh` com a barra do Safari; se o
   quique de 640 ms se sente como chegada ou como atraso.

---

## 2. Os fluxos gravados no antes

Dezessete fluxos, 45 passos, na ordem de valor da 02 (T1 modo, T2 telas cheias,
T3 folhas, T4 abas, T5 Voltar) e da 03 (a série, o copo, o cronômetro, o toast,
depois a refeição, os painéis e o pare), mais três de "toque no meio" e a
primeira série a frio. Definidos em `revisor-fluxos.mjs`; cada um começa de uma
navegação nova, com o registro devolvido, o relógio na hora do fluxo e a passada
de aquecimento (menos o `03b`).

**Os arquivos de cada fluxo**, em `docs/motion/_medicao/shots/revisor/antes/<fluxo>/`:
vídeo `chromium.webm`, `webkit.webm`, `chromium-reduz.webm`, `webkit-reduz.webm`
(mais `chromium-mouse.webm` em 03, 03b, 09, 12, 13 e `chromium-x3.webm` /
`webkit-x3.webm` em 01, 03, 03b, 07); a tira de cada passo
`NN-<passo>-<rodada>.png`, com o quadro final em `NN-<passo>-<rodada>-fim.jpg`;
as medidas `medidas-<rodada>.json`. **Gravados em cada motor: 17 fluxos com e 17
sem "Reduzir movimento"** (Chromium e WebKit), mais 5 com o ponteiro no
Chromium e 4 em ×3 em cada motor.

| # | fluxo | o estado montado | o que o dedo faz (passos) |
|---|---|---|---|
| 01 | `01-modo-cartao` | 07h10, Agora no topo, dia de treino B sem sessão | `entra`: toca o cartão do treino → modo de sessão · `sai`: toca a seta "‹" → Agora |
| 02 | `02-modo-faixa` | 07h10, sessão aberta há 30 min sem série, Corpo rolado até o fim (1982 px) | `entra`: toca a faixa "treino em andamento" · `sai`: toca a seta "‹" → o Corpo volta |
| 03 | `03-serie-regua` | 07h10, modo do treino de hoje, 1º exercício aberto (2 séries), cargas de 40 kg anotadas | `abre-regua`: a célula de repetições da série 1 → a régua nasce · `grava-1`: o 3º valor → a 1ª série grava (relógio e cronômetro nascem) · `abre-regua-2` · `grava-2`: a última série do exercício (o cartão fecha, o próximo abre) |
| 03b | `03b-primeira-serie-fria` | o mesmo, **sem a passada de aquecimento** | `abre-regua` · `grava-1`: a 1ª série a frio, com o `AudioContext` nascendo no toque |
| 04 | `04-programa` | 07h10, Prescrição no topo | `abre`: "Abrir o programa" · `abre-treino`: o 1º treino da lista (troca dentro da tela cheia) · `empilha`: "histórico" do 1º exercício · `volta-1`, `volta-2`, `volta-3`: "‹ Voltar" até a Prescrição |
| 05 | `05-evolucao` | 07h10, Corpo no topo | `abre`: "Evolução" · `volta` · `abre-de-novo` · `ir-para-semana`: fecha a Evolução e troca de aba no mesmo toque |
| 06 | `06-folhas` | 13h10, Agora, a linha do almoço aberta | `abre`: "Outra porção" → folha da refeição · `empilha`: "···" → "editar refeição" por cima · `fecha-x`: o × de cima · `voltar`: o Voltar do sistema fecha a da refeição |
| 07 | `07-abas` | 07h10, Agora no topo | `agora-corpo` (2 à direita) · `corpo-semana` (1 à direita) · `semana-agora` (3 à esquerda) |
| 08 | `08-voltar-sistema` | 07h10, Prescrição → Programa → treino aberto → Histórico por cima (montado sem gravar) | `voltar-1`: `history.back()` → o Programa · `voltar-2`: → a Prescrição |
| 09 | `09-copo` | 13h10, Agora, nenhum copo | `mais-1`: "+1 copo" · `mais-2`: de novo |
| 10 | `10-toast` | 07h10, modo do treino de hoje, sessão não iniciada | `chega`: "Iniciar treino" → toast "Treino B iniciado…" · `troca`: "Pausar" com o toast na tela · `some`: ninguém toca; o toast some 3,6 s depois |
| 11 | `11-refeicao-linha` | 13h10, Agora no topo, almoço sem marca | `abre-linha`: a linha do almoço · `comi-tudo`: "Comi tudo" |
| 12 | `12-teclado` | 07h10, modo, 1º exercício aberto | `abre`: a célula de carga → o teclado · `tecla-4` · `tecla-0` · `pronto` |
| 13 | `13-pare` | 07h10, modo com sessão aberta sem série | `abre`: "Encerrar" → o pare "Descartar esta sessão…" · `deixa`: "Deixar como está" |
| 14 | `14-meio-abas` | 07h10, Agora | `corpo-e-semana`: Corpo e, 131 ms depois (WebKit 151), Semana; tem de acabar em Semana |
| 15 | `15-meio-folha` | 13h10, linha do almoço aberta | `abre-e-fecha`: "Outra porção" e, 99 ms depois (WebKit 107), o ×; a folha tem de fechar |
| 16 | `16-meio-modo` | 07h10, Agora | `entra-e-sai`: o cartão e, 116 ms depois (WebKit 124), a seta "‹"; tem de voltar ao Agora |

**O que não deu para gravar, e por quê.**
- **Comparar fotos** (Evolução → Comparar): o registro semeado não tem sessões
  de fotos e o botão só aparece com duas sessões da mesma pose; semear fotos
  pede imagens no armazenamento do app. O empilhar de telas cheias ficou
  provado pelo Programa → Histórico (04 e 08).
- **O gesto de borda do iPhone** e o `popstate` com `hasUAVisualTransition`:
  nada aqui os produz; o Voltar do sistema foi gravado como `history.back()`.
- **O "toque que escurece" com toque emulado no Chromium**: o `:active` não
  acende com o dedo pousado (seção 1.1); fica no WebKit e na rodada
  `chromium-mouse`.
- **O clarão da câmera**: a câmera precisa de `getUserMedia`; fora dos fluxos.
- **O painel "Não guardei…"**: fora da lista pedida; o `micro-avisos.mjs` do 03
  já o mede e é o complemento da peça 4.

---

## 3. Os scripts

Todos em `docs/motion/_medicao/`, com o "como rodar" no topo. Recebem a URL e a
pasta de saída por argumento: o mesmo script grava o antes e o depois.

| script | o que faz |
|---|---|
| `revisor-gravar.mjs` | o ponto de entrada: abre o motor, calibra a captura, semeia (ou carrega `REGISTRO=`), aquece as telas e grava os fluxos. Escreve `rodada-<rodada>.json` com a versão do motor, a calibração e os erros da página |
| `revisor-fluxos.mjs` | os 17 fluxos em ordem de valor: o estado montado (`hora`, `montar` por `window.__escopo`), os passos (alvo, tipo, tempos, `confere`) e **o esperado de cada passo pelo dono** (`mov`: tipo, duração, "a de baixo parada", de onde a rolagem volta). **É aqui que se conserta um seletor que a fase 3 renomear**, nos dois lados |
| `revisor-comum.mjs` | o motor, a instrumentação na página (relógio, eventos, Event Timing, animações vivas, fixos, `requestAnimationFrame`), a calibração, o registro devolvido a cada fluxo, a passada de aquecimento, o dedo, a gravação e o manifesto. Reaproveita a `semeia` de `desempenho-comum.mjs` e a receita do WebKit |
| `revisor-tiras.py` | `tiras`: monta a tira de cada passo e mede quadro a quadro; `par`: empilha a tira do antes sobre a do depois; `faixa`: compara uma faixa vertical entre dois quadros da tira (a conferência "a de baixo parada"); `repousa`: recalcula o "dedo pousado" de manifestos já gravados pela linha do tempo (seção 7) |
| `revisor-thread-presa.mjs` | o "não congela com a thread presa" do 04 §6 no elemento real: troca de aba, a thread principal presa 150 ms dois quadros depois de o fio começar a andar, o fio achado quadro a quadro pela cor de acento; mede a maior parada no meio do caminho (escreve `thread-presa-<rodada>.json`). As peças 3 a 6 acrescentam a cena delas (cronômetro, folha, tela cheia, carrossel) |
| `revisor-compara.mjs` | a fase 4: aplica a tabela 1.3 com o `mov` de cada passo, escreve `protocolo.json`, os pares de tiras e os vídeos lado a lado (H.264, 828 × 940, normal e 4× mais lento), alinhados no zero de cada passo. Testado: antes contra antes, em todos os fluxos (`antes-contra-protocolo/`), e com vídeo em 01, 07 e 16 |

**As rodadas do antes**, como foram gravadas (do raiz do projeto):

```
python3 -m http.server 4727 -d docs/motion/_medicao/shots/dist-antes &
O=docs/motion/_medicao/shots/revisor/antes
G="node docs/motion/_medicao/revisor-gravar.mjs http://localhost:4727/ $O"
L=~/.cache/ms-playwright/webkit-deps-noble
WK="MOTOR=webkit LD_LIBRARY_PATH=$L LD_PRELOAD=$L/libgav1.so.1:$L/libyuv.so.0:$L/libevent-2.1.so.7:$L/libavif.so.16"
CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome $G   # semeia e grava registro.json
env REGISTRO=$O/registro.json $WK $G
REGISTRO=$O/registro.json REDUZ=1 CHROME=… $G
env REGISTRO=$O/registro.json REDUZ=1 $WK $G
REGISTRO=$O/registro.json DEDO=mouse FLUXOS=03,09,12,13 CHROME=… $G
REGISTRO=$O/registro.json DPR=3 FLUXOS=01,03,07 CHROME=… $G
env REGISTRO=$O/registro.json DPR=3 FLUXOS=01,03,07 $WK $G
```

(O `03b` entrou depois das duas primeiras rodadas e foi gravado à parte, com
`FLUXOS=03b`, no Chromium e no WebKit: `rodada-*-complemento.json`. No WebKit,
06, 08 e 10 foram regravados no mesmo complemento, depois de uma correção na
medida dos passos sem dedo.)

**Para o depois:** o `dist/` novo em outra porta, `O=…/revisor/depois`, a mesma
lista com `REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json` em
todas as linhas e o `03b` numa rodada à parte, primeiro (1.5, item 5b), e então

```
node docs/motion/_medicao/revisor-compara.mjs \
  docs/motion/_medicao/shots/revisor/antes docs/motion/_medicao/shots/revisor/depois \
  docs/motion/_medicao/shots/revisor/comparacao "antes · a22b09d" "depois · <commit>"
```

---

## 4. O que já se vê no antes

**Em todo o app, uma regra só: a tela troca inteira num quadro, de 16 a 22 ms
depois do toque no Chromium, e nada se move** — fora o fio da aba (`left`,
220 ms) e o pulso. É o contraste que a página de antes e depois tem de mostrar.
O protocolo aplicado ao próprio antes
(`antes-contra-protocolo/protocolo.json`, refeito em 16/10 com o recálculo do
dedo pousado e a rodada `chromium-reduz-mouse`) reprova onde se esperava: 16
passos×rodadas no princípio 2 (o fio em `left`), 46 no 6 (foco no `body`), 4 no
9 (a rolagem), 67 no 8 (camadas que trocam num quadro, a de baixo que "se
move"), 76 no 10 (o dedo pousado que não mostra nada), 1 no 1 (a primeira série a
frio) e 7 no 4 (o WebKit sem GPU, sobretudo em ×3). Nenhum quadro transitório, nenhum fixo fora do lugar
e nenhuma página mais larga que a janela no Chromium; zero animações sob
"Reduzir movimento".

- **01 · modo pelo cartão.** O modo aparece inteiro num quadro (Chromium
  +17,6 ms, WebKit +39 ms) e some do mesmo jeito (+19 / +5). O foco fica no
  `body` ao entrar e ao sair. Nada diz de onde o modo veio
  (`01-modo-cartao/01-entra-chromium.png`, `02-sai-chromium.png`).
- **02 · modo pela faixa.** Do fim do Corpo (1982 px), o modo abre a 415 px, não
  no topo; ao sair, **o Corpo volta em 1091 px**: 891 px de salto, nos dois
  motores e com "Reduzir movimento" — a tira mostra a medida do braço, no meio
  da tela, onde antes estava o fim (`02-modo-faixa/02-sai-chromium.png`).
- **03 e 03b · a série.** A régua nasce num quadro sob o polegar. A 1ª série
  **a frio** trabalha 80,6 ms no toque e aparece a +93 ms no Chromium; no WebKit,
  173 ms e **+363 ms**, com o botão "10" apertado e nada mais mudando do dedo
  pousado até +250 (`03b-primeira-serie-fria/02-grava-1-webkit.png`). Aquecida,
  10,9 ms / +17 (Chromium) e 43 ms / +44 (WebKit). No quadro da resposta nascem
  ao mesmo tempo o relógio, o selo "parcial", o bloco "Enquanto descansa" e o
  cronômetro, e **sob o dedo fica a célula de carga da mesma série** (defeito 2).
  O cronômetro nasce em y 762–844: **52 px acima do fundo**, com o exercício
  seguinte aparecendo por baixo (`03-serie-regua/02-grava-1-chromium.png`). A
  última série do exercício fecha o cartão, abre o próximo e **a página salta
  132 px** (363 → 495), com o "+ série" do exercício seguinte sob o dedo
  (`04-grava-2-*.png`).
- **04 e 05 · telas cheias.** Abrir, empilhar e voltar: um quadro cada, +16 a
  +22 ms; a faixa da esquerda já é a tela nova aos +50 ms (8–22 % diferente). O
  foco vai ao título ao abrir (certo) e ao `body` ao abrir um treino dentro do
  Programa e ao voltar à Prescrição ou ao Corpo. "Ir para Semana" fecha e troca de aba num
  quadro, e o fio da barra, que renasce, anda 220 ms em `left` depois
  (`05-evolucao/04-ir-para-semana-chromium.png`).
- **06 · folhas.** A folha da refeição e a de "editar" nascem num quadro (+18 e
  +20 ms; WebKit +13 e +16), o véu de cada uma escurece de uma vez; fechar pelo
  × e pelo Voltar também. A subida decidida em 06/10 não existe. O foco está
  certo: entra na folha, volta ao "···" e ao "Outra porção"
  (`06-folhas/01-abre-chromium.png`).
- **07 · abas.** O conteúdo troca num quadro (+17,7 ms); só o fio de 2 px anda,
  em `left`, por ~230 ms (a caixa do que muda fica em y 848, 8 px de altura, e
  anda da esquerda para a direita, `mudancasFinas`)
  (`07-abas/01-agora-corpo-chromium.png`).
- **08 · Voltar do sistema.** Igual ao botão, mas **em dois quadros**: a tela de
  baixo a +8,6 ms e uma faixa do topo (80 px) só a +19,7 ms; no WebKit, +14,8 e
  +31,9 (`08-voltar-sistema/medidas-*.json`).
- **09 · "+1 copo".** O número e a bolinha trocam num quadro (+22 ms no
  Chromium). **Com o dedo pousado, nada muda** no WebKit nem no Chromium com o
  ponteiro (`09-copo/01-mais-1-webkit.png`, quadros "antes" e "dedo" iguais) —
  o 1,00:1 do 03 §1.3, visto.
- **10 · toast.** Chega num quadro junto com o relógio e os controles da sessão,
  que empurram a lista ~46 px; no modo fica em **y 787–830**, a 66 px do fundo,
  com o exercício aparecendo por baixo; o texto novo troca na mesma caixa, sem
  sinal; some num quadro aos 3,6 s (`10-toast/01-chega-chromium.png`,
  `02-troca-*.png`, `03-some-*.png`).
- **11 · refeição pela linha.** A linha abre num quadro e empurra o resto. "Comi
  tudo" põe a leitura de volta no topo e **a própria linha do almoço desce até
  ficar sob o dedo** (`11-refeicao-linha/02-comi-tudo-chromium.png`).
- **12 · teclado.** Nasce e some num quadro, sem rolar a página neste estado
  (363 → 363 px); cada tecla só troca o dígito. No Chromium, o `:active` da
  tecla aparece **depois** de soltar e some a +164 ms (`12-teclado/medidas-chromium.json`).
- **13 · pare.** Véu e painel num quadro: 82 % da tela muda de uma vez; o
  botão de apagar não passa sob o dedo; "Deixar como está" some num quadro e
  devolve o foco ao `body` (`13-pare/01-abre-chromium.png`).
- **14–16 · toque no meio.** Sem movimento, o segundo toque sempre chega
  (`confere` verdadeiro nos dois motores). É a referência: no depois, com a
  View Transition, o toque cai no `<html>` se o pulo com reenvio faltar.
- **"Reduzir movimento".** Nenhuma animação viva em nenhum passo: o portão
  universal deixa o pulso a 0,01 ms; o fio da aba salta. Tudo o mais é igual ao
  sem preferência (os `-reduz` de cada fluxo).
- **×3.** No Chromium, os números são os mesmos de ×2. No WebKit a captura fica
  mais lenta (latência 45 ms) e aparecem intervalos de 36–57 ms no
  `requestAnimationFrame`: é a máquina sem GPU; as medidas de ritmo do depois
  ficam em ×2, e o ×3 serve para ver o desenho na densidade do aparelho.

---

## 5. O plano da página de antes e depois

**Forma.** Uma página publicada, em modo claro, com uma seção por peça na
ordem da 08 §4 (0 a 8). Cada seção tem:

1. uma linha com o que o dono decidiu para aquele movimento ("a folha chega com
   quique em 640 ms; o véu escurece em 350 ms");
2. **o vídeo lado a lado** (`comparacao/<fluxo>/NN-<passo>-<rodada>.mp4`: antes
   à esquerda, depois à direita, de 0,5 s antes a 1 s depois do toque, alinhados
   no `click`), em velocidade real e **4× mais lento** (`-lento.mp4`), mudo, em
   laço; H.264, para tocar no Safari do iPhone;
3. **a tira dupla** (`comparacao/<fluxo>/NN-<passo>-<rodada>-par.png`: a tira do
   antes em cima, a do depois embaixo, nos mesmos instantes); rola de lado
   dentro da própria caixa, a página não;
4. **o veredito** do `protocolo.json` para aquele passo, com o número que decidiu
   ("tela muda a +17,6 → +19 ms; 1 → 22 quadros com mudança em 350 ms; a de
   baixo parada: 0,2 % na faixa; foco no título").

No topo, o quadro dos nove princípios (quantos passos passam, reprovam e ficam
"a conferir", por princípio e por motor, **ao lado da linha de base do antes**),
a lista do que reprovou com o número, e **o que não se mediu** (1.5, item 6).

**Os pares, e o que cada um prova.** ~200 kB por vídeo e ~500 kB por tira; a
página leva os pares abaixo, não os 45 passos × 7 rodadas (o resto fica nas
pastas, citado pelo nome).

| peça | par | rodadas | o que prova |
|---|---|---|---|
| 5 | `01-modo-cartao` entra e sai | chromium, webkit | o modo chega da direita em 350 ms e volta para a direita, a de baixo parada; no antes, a troca é de um quadro só; **o primeiro quadro continua a ~1 quadro do toque** |
| 5 | `16-meio-modo` | chromium, webkit | a seta tocada ~120 ms depois de entrar fecha o modo: o toque no meio chega |
| 5 | `02-modo-faixa` sai | chromium, webkit, chromium-reduz | **a rolagem volta**: 1982 → 1091 no antes, 1982 → 1982 no depois — o par mais claro de "nada salta" |
| 2, 3 | `03b-primeira-serie-fria` grava-1 | webkit, chromium | a série grava sem esperar: no antes, a tela fica parada até **+363 ms** no WebKit; o número pousa; o cronômetro sobe da borda e encosta no fundo |
| 2 | `03-serie-regua` grava-1 | chromium | sob o dedo deixa de cair a célula de carga (defeito 2) |
| 5 | `04-programa` abre, empilha, volta-1 | chromium | tela cheia pela direita, a de baixo parada; a volta é o inverso |
| 5 | `08-voltar-sistema` | chromium, webkit | o Voltar do sistema faz o mesmo reverso (e num desenho só) |
| 4 | `06-folhas` abre, empilha, fecha-x | chromium, webkit | a folha chega com o quique de 640 ms, a segunda sobre a primeira, o véu soma; fechar desce em 350 |
| 4 | `13-pare` abre e deixa | chromium, webkit | o painel de apagar chega como a folha, e o botão de apagar não passa sob o dedo |
| 4 | `15-meio-folha` | chromium, webkit | o × tocado ~100 ms depois de abrir fecha a folha |
| 6 | `07-abas` agora-corpo e semana-agora | chromium, webkit | o carrossel nos dois sentidos, a barra parada, sem rolagem de lado; o fio em `transform` |
| 6 | `14-meio-abas` | chromium | a segunda aba tocada no meio vence |
| 1, 8 | `09-copo` mais-1 | webkit, chromium-mouse | o "+1 copo" escurece com o dedo pousado (antes: nada) e a bolinha enche de baixo |
| 7 | `10-toast` chega, troca, some | chromium | o aviso sobe, troca com sinal, apaga, e encosta no fundo do modo |
| 8 | `11-refeicao-linha` comi-tudo | chromium, webkit | a forma pousa e a linha deixa de descer até o dedo (defeito 3) |
| 8 | `12-teclado` abre | chromium | **nada novo se move** onde a doutrina decidiu "nenhum": o mesmo seco dos dois lados |
| 0 | os `-reduz` de 01, 06, 07, 13 | chromium-reduz, webkit-reduz | com "Reduzir movimento" a camada esmaece 120 ms ao chegar e sai de uma vez; a aba também; o ponto parado; a tela final igual à da rodada com movimento |

**Como a página é montada.** `revisor-compara.mjs` produz todos os arquivos; a
página só os referencia (publicação com `files`, um arquivo por par). O
`protocolo.json` do depois e o `antes-contra-protocolo/protocolo.json` viram o
quadro do topo. Nada é desenhado à mão: toda afirmação da página aponta para um
arquivo de `comparacao/` ou de `antes/`.

---

## 6. Depois da peça 0

Conferida em 16/10 pela linha da peça 0 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-0/` (commits `21dbdf2` e `73df730`),
servido na porta 4728 (desligada no fim), com o mesmo `antes/registro.json`.

**O que se gravou.** Chromium 151 e WebKit 26.5 nos fluxos 05, 07 e 14; os 17
fluxos sob "Reduzir movimento" nos dois motores. Nenhum erro de página e nenhum
passo com falha (`depois-0/rodada-*.json`). Pastas:
`docs/motion/_medicao/shots/revisor/depois-0/` (gravações),
`…/comparacao-0/` (106 pares de tiras e 212 vídeos lado a lado, normal e 4×
mais lento; `protocolo.json`), `…/depois-0/complementos/` e
`…/antes-complementos/` (os complementos, dos dois lados, nesta mesma sessão).

### 6.1 A linha da peça 0: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **o fio da aba em `transform`** (princípio 2) | **passa** | 0 reprovações em 106 passos×rodadas (no antes, 16); `transform` 160 ms `cubic-bezier(0.2, 0.8, 0.2, 1)` em `div.ins-tab-ind`, nos dois motores | `comparacao-0/protocolo.json`; `depois-0/07-abas/medidas-chromium.json` |
| **o fio no compositor** (traço do Chromium) | **passa** | trocar de aba: **1 layout e 1 pintura**, `compositeFailed: 0` (antes: 15 layouts, 27 pinturas, `compositeFailed: 8224` por `left`) | `depois-0/complementos/movimentos-chromium.json` contra `antes-complementos/movimentos-chromium.json` (janelas `aba-toque-*`) |
| **o fio não congela com a thread presa 150 ms** (04 §6) | **passa** | maior parada **0 ms** nos dois motores, o fio chegando em 108–135 ms; no antes, **148–162 ms** parado no Chromium e 147–155 no WebKit, e depois um salto até o fim | `depois-0/complementos/thread-presa-{chromium,webkit}.json` contra `antes-complementos/thread-presa-*.json` |
| **sob "Reduzir movimento", nenhuma animação viva e o ponto parado** | **passa** | **nenhuma** animação em nenhum dos 45 passos, nos dois motores (no antes sobrava o pulso registrado a 0,01 ms); o fio salta; a tela final igual à da rodada com movimento (princípio 7: 16 de 16) | `depois-0/*/medidas-*-reduz.json`; `comparacao-0/protocolo.json` |
| **o ponto pulsando sem fim, sem a preferência** | **passa** | `ins-pulse`, opacidade, 2400 ms, infinito, `cubic-bezier(0.25, 0.1, 0.25, 1)` — o `ease` de antes escrito por extenso | `depois-0/07-abas/medidas-chromium.json` (passo `semana-agora`) contra `antes/07-abas/…` |
| **nenhuma duração fora da lista** (princípio 8) | **passa** | 0 "duração fora dos tokens" (no antes, 16: `left` 220 ms); nenhum infinito novo, nenhum quique | `comparacao-0/protocolo.json` |
| **nada pisca no Blink** (princípio 3) | **passa** | 53 de 53 no Chromium: nenhum quadro transitório, a barra de abas parada aos 120 ms, página nunca mais larga que a janela | `comparacao-0/protocolo.json` |
| **armadilhas** (04 §2) | **passa** | `backdrop-filter` 0 e `will-change` 0 nos dois motores; o único `transform` novo é o do próprio fio (`.ins-tab-ind`), dentro da barra fixa, sem ser ancestral de nenhum fixo; transbordo lateral, fixos sob `transform` no ancestral, sticky e alturas idênticos ao antes | `depois-0/complementos/armadilhas-{chromium,webkit}.json` contra `shots/desempenho/armadilhas-*.json` |
| **o toque nunca espera** (princípio 1) | **passa, depois de repetir** | 102 passam; as 2 reprovações eram amostra única e não se repetiram em três rodadas de cada lado: 02 `entra` no Chromium reduzido, 12,7–13,0 ms no antes contra 12,0–13,1 na peça 0; 05 `ir-para-semana` no WebKit, 27–31 contra 27–28. No 14, a aba tocada no meio chega (2º toque a +99 ms no Chromium e +152 no WebKit, `confere` verdadeiro) | `comparacao-0/protocolo.json`; as repetições no scratchpad da sessão (não ficaram na pasta de capturas) |
| as guardas da 06 §5 e `tipos` | do coordenador | 1593/1593 verdes, `tipos` limpo (mensagem dele) | — |
| o clarão em 200 ms | **não gravado aqui** | a câmera precisa de `getUserMedia`, fora dos fluxos; medido pelo implementador (`09-implementacao.md`, "Medido no navegador": 320 → 200 ms; sob "Reduzir", nasce apagado) | — |

### 6.2 O que reprovou, e por que não é da peça 0

Tudo igual ao antes, no mesmo passo, e cada um é trabalho de uma peça que
ainda não entrou:

- **Foco no `body` ao abrir ou fechar camada** (princípio 6): 24 reprovações,
  as mesmas do antes — peça 5.
- **A rolagem do Corpo volta em 1091 px** em vez de 1982 (princípio 9): 02
  `sai`, nas duas rodadas reduzidas — peça 5.
- **Telas cheias que trocam num quadro e "a de baixo que se move"** (princípio
  8): 05 `abre`, `volta`, `abre-de-novo`, nos dois motores — peça 5.
- **Dedo pousado sem mudança no WebKit** (princípio 10, que nasceu depois desta
  seção, na peça 1): 05 e 07/14 — peça 1.
- **Um intervalo de 38 ms no WebKit** (princípio 4): 14 `corpo-e-semana`; o
  mesmo passo teve 42 ms no antes — é o WebKit desta máquina sem GPU.

### 6.3 O que ficou "a conferir"

- **07 · a tela muda por ~160 ms, e o decidido é 350**: é o fio, agora em
  `--ins-dur-lugar`. O carrossel de 350 ms é da peça 6, e a decisão 3 diz "o fio
  junto": **na peça 6 o fio tem de passar a andar em 350 ms com a página**, não
  nos 160 de hoje. Fica anotado para o implementador.
- **Sob "Reduzir", 03 e 03b**: "a tela muda por ~740 ms" e, no WebKit, "buraco
  de ~258 ms na captura". São os degraus de 250 ms da barra do descanso e o
  relógio, sem animação — iguais ao antes.
- **Foco no `body` em passos que não são camada** (03, 04 `abre-treino`, 10,
  11, 12): igual ao antes.
- **A 1ª série no WebKit reduzido**: 48–50 ms de trabalho (antes 45–57): a regra
  de ≤ 16 ms vale para o Chromium 1×, e a peça que a cobra é a 2.

### 6.4 Um incidente da gravação, corrigido

O vídeo `depois-0/09-copo/chromium-reduz.webm` saiu com **6,9 horas e 527 MB**.
Sob "Reduzir movimento" o Agora parado mandou só 6 quadros, e o gravador do
Playwright esticou o último até um carimbo absurdo. As tiras e as medidas usam
os quadros com carimbo e não foram afetadas (os zeros dos dois passos caem a
0,9 e 5,4 s do vídeo). O arquivo foi cortado em 10 s, sem recodificar; nenhum
outro vídeo do antes ou do depois passa de 60 s; e `revisor-comum.mjs` passou a
cortar sozinho todo vídeo mais longo que o intervalo dos quadros + 5 s.

**Conclusão: a peça 0 passa na linha dela, nos dois motores e com "Reduzir
movimento", sem nenhuma regressão.** O que reprova é o antes que as peças 1, 5 e
6 ainda vão tratar. Não houve build nem teste durante a gravação.

---

## 7. Depois da peça 1

Conferida em 16/10 pela linha da peça 1 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-1/` (commit `f2cdcf1`), servido na
porta 4728 (desligada), com o mesmo `antes/registro.json`.

**O que se gravou.** Os fluxos 03, 03b, 09, 12 e 13 (14 passos de toque) nas
rodadas `webkit` e `chromium-mouse` e nas duas reduzidas (`webkit-reduz`,
`chromium-reduz-mouse`). O antes não tinha a `chromium-reduz-mouse`: ela foi
gravada do `dist-antes` na mesma sessão (`antes/rodada-chromium-reduz-mouse.json`),
para o comparador ter par. Nenhum erro de página, nenhum passo com falha
(`depois-1/rodada-*.json`). Pastas: `…/revisor/depois-1/` (gravações),
`…/revisor/comparacao-1/` (56 pares de tiras e 112 vídeos lado a lado;
`protocolo.json`), `…/depois-1/complementos/` e `…/antes-complementos/`
(`micro-toque-chromium.txt` dos dois lados).

### 7.1 Uma correção na medida, antes do veredito

A primeira contagem dava a peça 1 visível em 14 de 14 passos no WebKit e no
Chromium com ponteiro, mas **em só 2 de 14 no `webkit-reduz`**. Não era a peça:
o quadro do dedo pousado estava lá, com o tamanho do controle (3.608 px mudam no
"abre" do teclado, que tem 90 × 40 = 3.600 px), só que, descontada a latência da
captura, caía de 0,4 a 5 ms **antes** do `pointerdown`, e a janela do dedo
pousado começava exatamente nele, sem a folga que o zero já tinha (1.1). Corrigi
a janela para (pousar − folga, −folga] em `revisor-tiras.py` e recalculei as
gravações já feitas pela linha do tempo, que guarda quadro a quadro quantos
pixels mudaram (`revisor-tiras.py repousa`): 13 passos no antes, 5 na peça 0 e
14 na peça 1 ganharam ou trocaram o valor (marcados `mudancaNoPousarRecalculada`,
com `mudancaNoPousarPx`; a caixa não se recupera, porque os quadros já foram
apagados). Em quase todos, os pixels são 80–100 % da área do controle — é o
controle apertado. Os três `protocolo.json` (linha de base, peça 0, peça 1)
foram refeitos com a regra nova; nada foi regravado.

### 7.2 A linha da peça 1: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **todo controle mostra o toque com o dedo pousado** (princípio 10) | **passa** | **14 de 14** passos de toque nas quatro rodadas — `webkit`, `webkit-reduz`, `chromium-mouse`, `chromium-reduz-mouse`; no antes, **5 de 14** em cada uma (o valor da régua e as teclas, a 1,08:1). Os pixels que mudam são 90–100 % da área de cada controle (o "pronto", 374 × 44, muda 15.536 px; o pare "Encerrar", 184 × 46, 7.924) | `comparacao-1/protocolo.json`; `depois-1/*/medidas-*.json` (`mudancaNoPousarMs`, `mudancaNoPousarCaixa`/`Px`) |
| **igual com "Reduzir movimento"** | **passa** | os mesmos 14 de 14 nas duas rodadas reduzidas | idem, `*-reduz*.json` |
| **o "+1 copo" passa a mostrar o toque** | **passa** | com o dedo pousado mudam 3.370–3.401 px na caixa do botão (80 × 46); no antes, nada (`09-copo/01-mais-1-*.png`, quadro "dedo pousado") | `depois-1/09-copo/medidas-webkit.json`; tira `depois-1/09-copo/01-mais-1-webkit.png`; par `comparacao-1/09-copo/01-mais-1-webkit-par.png` |
| **o contraste do estado de toque** (`micro-toque.mjs`, na versão do implementador, que compõe as camadas) | **passa** | **28 de 28** controles mudam, de **1,69 a 1,73:1** contra o repouso (contra o fundo atrás, de 1,69 a 12,21:1); no antes, **16 de 28 não mudavam nada** e os outros iam de 1,08 a 1,24:1 (o "+1 copo" a 1,00:1). "coluna anterior" não foi achada nos dois lados | `depois-1/complementos/micro-toque-chromium.txt` contra `antes-complementos/micro-toque-chromium.txt` |
| **nada escala, nada anima no controle** (o toque não tem tempo) | **passa** | nenhuma animação no controle tocado em nenhum passo; no CSS do build, o `button:active` é uma camada `background-image` sem `transition`, e as únicas transições continuam sendo a barra do descanso e o fio; `micro-toque` não acha `transform` em nenhum dos 28 | `comparacao-1/protocolo.json`; `dist-peca-1/assets/*.css` |
| **o ouvinte de `touchstart`** | **passa** | `addEventListener("touchstart", function(){…}, {passive})` no build; no `dist-antes`, nenhum | `dist-peca-1/assets/*.js` |
| só `transform` e opacidade; nada pisca; "Reduzir movimento" (princípios 2, 3, 5, 7) | **passa** | 56/56, 28/28, 21 passam e 7 "a conferir" (os degraus do descanso, como no antes), 28/28 | `comparacao-1/protocolo.json` |

### 7.3 O que reprovou, e o que fica para confirmar

- **Trabalho no toque, 03 `grava-2`, `chromium-reduz-mouse`: 21,3 ms contra
  14,7** (princípio 1). É amostra única e, pela regra 1.5 (5a), só vale depois de
  três repetições de cada lado — **que não fiz, porque a peça 2 está construindo
  e testando em paralelo**. O mesmo passo nas outras três rodadas não piorou
  (Chromium com ponteiro 14,2 → 14,3; WebKit 36 → 34; WebKit reduzido 35 → 32), e
  a peça 1 não toca o caminho do clique (só CSS e um ouvinte vazio). **Pedido:**
  repetir `FLUXOS=03 DEDO=mouse REDUZ=1` três vezes contra `dist-antes` e
  `dist-peca-1` quando a máquina estiver livre.
- **O pare (13) troca num quadro** e **"Deixar como está" devolve o foco ao
  `body`** (princípios 8 e 6): iguais ao antes; são das peças 4 e 5.

### 7.4 O que ficou "a conferir"

- **12 · `tecla-0` e `pronto` no Chromium com ponteiro**: a caixa do que muda
  com o dedo pousado passa da caixa do controle e cobre a tecla anterior. Com o
  ponteiro, o foco sai da tecla anterior no `mousedown`, e o anel dela some no
  mesmo quadro; o antes tem a mesma caixa (`antes/12-teclado/medidas-chromium-mouse.json`).
  No toque do iPhone o botão não recebe foco no toque. Não é da peça.
- **O `03b` do `depois-1` não está a frio**: com `FLUXOS=03,…` ele rodou depois
  do 03, que já tinha esquentado o `AudioContext` e a fonte (WebKit: 43 ms contra
  os 173 do antes a frio). A comparação da primeira série a frio fica para a
  peça 2, gravando o `03b` sozinho (1.5, 5b).
- **Os degraus do descanso sob "Reduzir"** (03): "a tela muda por ~740 ms" e,
  no WebKit, "buraco de ~258 ms na captura" — a barra em degraus de 250 ms e o
  relógio, sem animação; iguais ao antes.

**Conclusão: a peça 1 passa na linha dela.** O toque se vê em todos os 14
passos, nos dois motores e com "Reduzir movimento", a 1,69–1,73:1, sem tempo e
sem escala. A única reprovação é de tempo, numa amostra só, sem relação provável
com o que a peça mudou, e fica pedida a repetição. Não houve gravação depois do
aviso de que a peça 2 começou.
