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
5c. **Com carga na máquina, antes e depois intercalados.** Se a máquina estiver
   ocupada (outro projeto, build, testes), o número de tempo que decide uma peça
   se mede gravando antes e depois **intercalados**, três vezes, sob a mesma
   carga — não contra o antes gravado com a máquina quieta. A carga de cada
   etapa fica em `shots/revisor/carga-<dia>.txt` (seção 8).
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
| `revisor-comum.mjs` | o motor, a instrumentação na página (relógio, eventos, Event Timing, animações vivas, fixos, `requestAnimationFrame`), a calibração, o registro devolvido a cada fluxo, a passada de aquecimento, o dedo, a gravação e o manifesto. Reaproveita a `semeia` de `desempenho-comum.mjs` e a receita do WebKit. Desde a peça 6, os quadros do screencast vão na ordem do carimbo, não na de chegada (sob carga o Chromium entrega fora de ordem) |
| `revisor-tiras.py` | `tiras`: monta a tira de cada passo e mede quadro a quadro; `par`: empilha a tira do antes sobre a do depois; `faixa`: compara uma faixa vertical entre dois quadros da tira (a conferência "a de baixo parada"); `repousa`: recalcula o "dedo pousado" de manifestos já gravados pela linha do tempo (seção 7) |
| `revisor-aviso-passo.mjs` | o toast e a faixa acompanham o cronômetro, ou saltam? No modo, com um toast na tela, o descanso começa e para; a cada quadro anota onde estão o toast e o cronômetro (`getBoundingClientRect`, que inclui `transform` e `translate`) e mede o maior passo por quadro, o caminho e a posição final (escreve `aviso-passo-<rodada>.json`). Feito na peça 3, porque o `micro-avisos.mjs` lê as posições logo depois de ligar e desligar o descanso e, com o acompanhamento animado, pega o toast no meio do caminho. Na peça 7 mede a MENSAGEM (`#toast > .aviso`; antes, o próprio `#toast`) e ganhou dois casos — o cronômetro entrando e saindo 40 ms depois de um aviso chegar — e a saída quadro a quadro (opacidade, altura, animações) |
| `revisor-aviso-janela.mjs` | o "Não guardei" ignora o toque que vinha para outra coisa? (peça 4, defeito 5). Provoca a falha de gravação, grava uma série e, com o dedo de verdade, toca "Fechar este aviso" 150 ms depois de o aviso chegar (tem de ficar) e 600 ms depois (tem de fechar); anota também o fundo inerte e o foco (escreve `aviso-janela-<rodada>.json`). Feito porque o `micro-avisos.mjs` clica logo que o aviso chega e, depois da peça 4, esse clique é engolido de propósito |
| `revisor-regiao-viva.mjs` | a região viva do aviso fica na árvore de acessibilidade? (peça 7; 05 M12). No Agora, sem aviso, com um, com o mesmo texto de novo, com um texto novo e depois que ele some: o `display`, o `role`, o `aria-live`, o texto, as linhas da `ariaSnapshot` do Playwright que falam da região e, no Chromium, o nó da árvore do motor (`Accessibility.getPartialAXTree`); e o que está sob o centro da região. Escreve `regiao-viva-<rodada>.json` |
| `revisor-aviso-tempo.mjs` | quanto tempo o aviso fica pelo tamanho do texto (13, 50, 101 e 140 caracteres), do `toast()` ao começo da saída (peça 7). Escreve `aviso-tempo-<rodada>.json` |
| `revisor-cronometro.py` | onde o cronômetro está em cada quadro de uma troca (o fluxo 17, peça 6). Na transição o DOM não diz onde ele está na tela, então se lê nos quadros do screencast guardados com `QUADROS=1`: a linha azul do descanso, nas colunas x 90–200 e na faixa y 740–896. Escreve `cronometro-<rodada>.json` com a trilha [t, y], o maior passo por quadro e quantas alturas houve |
| `revisor-anel-e-cronometro.mjs` | dois itens da peça 5 que os fluxos não cobrem: com o teclado (Tab), o campo de importar dos Ajustes mostra o anel? (lê o contorno do rótulo e do `input` e fotografa o rótulo); e, com um descanso contando, onde fica o cronômetro no Agora, nos Ajustes e na Evolução (escreve `anel-e-cronometro-<rodada>.json` e `anel-<rodada>.png`) |
| `revisor-thread-presa.mjs` | o "não congela com a thread presa" do 04 §6 no elemento real: troca de aba, a thread principal presa 150 ms dois quadros depois de o fio começar a andar, o fio achado quadro a quadro pela cor de acento; mede a maior parada no meio do caminho (escreve `thread-presa-<rodada>.json`). As peças 3 a 6 acrescentam a cena delas (cronômetro, folha, tela cheia, carrossel) |
| (ambiente) | `PYTHON=` escolhe o Python que os scripts chamam (precisa de Pillow e numpy). Depois da atualização de 19/10 o `python3` do sistema é o 3.14, sem numpy; o 3.12 tem numpy mas não carrega mais o Pillow do sistema. Para a seção 8, o numpy foi posto numa pasta do scratchpad (`pip install --target`) e um invólucro aponta para ela — nada instalado no sistema |
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

---

## 8. Depois da peça 2

Conferida pela linha da peça 2 da tabela 1.4, contra o build congelado em
`docs/motion/_medicao/shots/dist-peca-2/` (commit `cf0e4e4`), servido na porta
4728 (desligada), com o mesmo `antes/registro.json`.

**As condições, ditas.** A gravação principal foi feita em 16/10, das 17h31 às
17h41, **com a máquina carregada** por outro projeto: carga média de 4,6 a 6,5
em 12 núcleos (`shots/revisor/carga-16-10.txt`). Por isso todo número de tempo
que decide alguma coisa abaixo foi medido de novo com antes e depois
**intercalados, três vezes**, sob a mesma carga (1.5, item 5c): a 1ª série a
frio em 16/10, e as reprovações de tempo do comparador em 19/10, das 18h15 às
18h23, com carga de 2,8 a 5,1 (`carga-19-10.txt`). Entre as duas datas a
máquina foi reiniciada e o `python3` do sistema passou ao 3.14, sem numpy (seção
3, "ambiente"): as tiras e as medidas foram feitas em 16/10 com o ambiente de
antes; os pares, as faixas e os protocolos de 19/10, com numpy 2.5.4 e Pillow
12.1.1, pelo mesmo código.

**O que se gravou.**
- Peça 2: o `03b` sozinho e primeiro, a frio, em cada rodada
  (`depois-2/rodada-*-03b.json`), e depois 01, 03 e 12 (`depois-2/rodada-*.json`),
  no Chromium e no WebKit, com e sem "Reduzir movimento". Nenhum erro de página,
  nenhum passo com falha.
- O `03b` reduzido do antes foi regravado sozinho, a frio
  (`antes/rodada-*-reduz-03b.json`): o anterior tinha rodado depois do 03 e não
  servia de par para a 1ª série a frio.
- A 1ª série a frio, antes e peça 2 intercalados, três vezes por motor
  (`repeticoes-peca-2/`), e as reprovações de tempo, três vezes
  (`repeticoes-peca-2-tempo/`).
- Complementos `micro-serie.mjs` e `micro-contador.mjs` dos dois lados
  (`antes-complementos/`, `depois-2/complementos/`).
- O comparador: `comparacao-2/` (48 pares de tiras, 96 vídeos lado a lado,
  `protocolo.json`).

### 8.1 As repetições pendentes da peça 1

| | trabalho no toque (ms) | mediana | primeira mudança na tela (mediana) |
|---|---|---|---|
| 03 `grava-2`, `chromium-reduz-mouse`, antes | 15,0 · 16,7 · 24,1 | **16,7** | +19,2 ms |
| o mesmo, peça 1 | 14,8 · 15,2 · 15,2 | **15,2** | +18,7 ms |

O 21,3 ms da seção 7.3 era ruído: na mediana a peça 1 não piora, e até a
dispersão é menor. **A peça 1 fica aprovada sem ressalva.** Arquivos:
`repeticoes-peca-1/{antes,peca-1}-{1,2,3}/03-serie-regua/medidas-chromium-reduz-mouse.json`
(carga 4,6–6,2 em 16/10).

### 8.2 A linha da peça 2: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **1ª série a frio sem o tranco, Chromium 1×** (meta ≤ 16 ms; 04 R8) | **passa** | trabalho no toque **10,1 ms** de mediana (9,8 · 10,1 · 21,3) contra **61,2** (57,7 · 61,2 · 67,0); Event Timing 96 → 48 ms; a tela muda a **+26 ms** contra +73 | `repeticoes-peca-2/{antes,peca-2}-chromium-{1,2,3}/03b-primeira-serie-fria/medidas-chromium.json` |
| **a mesma série a frio, WebKit** | **o toque passa; a tela fica "a conferir"** | trabalho **169 → 11 ms** de mediana (165–177 → 11–20); mas a tela ainda só muda a **+301 ms** (antes +352) e o Event Timing vai de 352 a 304. Os ~290 ms que sobram não são trabalho do toque: são o primeiro desenho do modo com o relógio e o cronômetro **neste WebKit sem a fonte do sistema** (04 §1.3) — aquecido, o mesmo toque aparece a **+18 ms** (antes +44; `depois-2/03-serie-regua/medidas-webkit.json`, `grava-1`). A parte que não é do toque passou de ≈180 para ≈290 ms; não dá para separar aqui se é a fonte ou o desenho seguinte que rola a página. **No iPhone não se mediu** | `repeticoes-peca-2/{antes,peca-2}-webkit-{1,2,3}/…/medidas-webkit.json` |
| **o número pousa** | **passa** | `ins-pousa` no `span.pousa.recem` da célula ("10"): `translate` + opacidade, **160 ms**, nos dois motores; sob "Reduzir movimento", `ins-acende`, só opacidade, **120 ms**. Na última série do exercício não há pouso (o cartão fecha e a célula some), como a 03 §4.2 previu | `depois-2/03-serie-regua/medidas-*.json` e `depois-2/03b-primeira-serie-fria/medidas-*.json` (passo `grava-1`, `animacoes`); tira dupla `comparacao-2/03-serie-regua/02-grava-1-chromium-par.png` |
| **a linha não desce e o dedo não cai na carga da mesma série** (defeito 2) | **passa** | `micro-serie.mjs`: a célula fica em **y 323 → 323** (antes 323 → 375). Nas gravações a página rola 52 px (363 → 415) no mesmo desenho, e a linha fica sob o dedo; sob o dedo fica a carga da **série 2** (`#w0_1`), não mais a da série 1 (`#w0_0`, antes), nos dois motores e com "Reduzir" | `depois-2/complementos/micro-serie-chromium.json` contra `antes-complementos/…`; `depois.sobODedo` nos `medidas-*.json`; tira dupla citada acima (a linha da série 1 desce no antes e fica no lugar na peça 2) |
| **o contador com um escritor só** (defeito 1) | **passa** | `micro-contador.mjs`: depois de uma série e de ligar o deload, **tela 1/12 = dado 1/12** (antes, tela 1/20 e dado 1/12) | `depois-2/complementos/micro-contador-chromium.json` contra `antes-complementos/…` |
| **o som fora do toque** | **passa, com a anotação do 09** | o `AudioContext` nasce 500 ms depois de entrar no modo. No WebKit isso aparece como um quadro mais longo depois da entrada: **23–33 ms** nas três repetições (antes 17–21), **44–45 ms** na gravação sob carga; o Chromium espera a página ociosa e não mostra nada | `repeticoes-peca-2-tempo/*/01-modo-cartao/medidas-webkit*.json` (`quadrosDaPagina.maiorIntervalo`) |
| **o toque nunca espera** (princípio 1) | **passa, depois de repetir** | as 4 reprovações de amostra única sob carga não se repetem: 01 `entra` no Chromium, mediana 4,4 → 3,9 ms; no WebKit, 6 → 7; no WebKit reduzido, 6 → 5; 03 `grava-2` no WebKit, **18 → 11 ms**, com a tela a +25 → +10 | `repeticoes-peca-2-tempo/{antes,peca-2}-{1,2,3}/` |
| só `transform`/opacidade, nada pisca, "Reduzir", nada só pelo movimento, a rolagem, o toque se vê (princípios 2, 3, 5, 7, 9, 10) | **passa** | 48/48; 24/24; 17 passam e 7 "a conferir" (os degraus do descanso, como sempre); 24/24; 4/4; 23 passam e 1 "a conferir" | `comparacao-2/protocolo.json` |
| o teclado (12) sem movimento novo | **passa** | nenhuma animação nova (princípio 8, "nenhum"); a página não rola ao abrir neste estado (363 → 363), como no antes | `depois-2/12-teclado/medidas-*.json` |

### 8.3 O que reprovou, e por que não é da peça 2

- **01 · entrar no modo troca num quadro e "a de baixo se move"; o foco vai ao
  `body`** (princípios 8 e 6): iguais ao antes — peça 5.
- **01 · um quadro de 44–45 ms no WebKit** (princípio 4), só na gravação sob
  carga: é o `AudioContext` da própria peça, avisado no 09, e nas três
  repetições fica em 23–33 ms, abaixo do limite de 34.

### 8.4 O que ficou "a conferir"

- **A 1ª série a frio no WebKit** aparece a +301 ms, com ~290 ms que não são
  do toque (8.2). No iPhone a fonte do sistema existe e esse custo não deveria
  aparecer; não se mediu no aparelho.
- **O cronômetro continua a 52 px do fundo no modo** (`micro-serie`:
  `vaoEmbaixoDoTimer` 52, nos dois lados): é da peça 3.
- **03 `abre-regua-2` no WebKit reduzido**: a primeira mudança com o dedo
  pousado foi um dígito do relógio (caixa 208,808,8,16), que virou no mesmo
  quadro; o controle mudou também (o passo passa no princípio 10 nas outras
  rodadas).
- **03 `abre-regua-2` no Chromium**: no antes, a lacuna da captura (tela a +263
  ms); na peça 2 a tela muda a +30 ms. Não é mérito da peça: é a captura que
  não falhou desta vez (1.1).

**Conclusão: a peça 2 passa na linha dela.** A 1ª série a frio cai de 61 para
10 ms de trabalho no Chromium e de 169 para 11 no WebKit; o número pousa em 160
ms (120 só em opacidade com "Reduzir"); a linha não sai de baixo do dedo e o
dedo não cai mais na carga da mesma série; o contador mostra o dado. A primeira
série a frio no WebKit desta máquina ainda leva ~300 ms para aparecer, por um
custo de primeiro desenho que não é do toque e fica a conferir no aparelho.

---

## 9. Depois da peça 3

Conferida em 19/10 pela linha da peça 3 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-3/` (commit `d1f1025`), servido na
porta 4728 (desligada), com o mesmo `antes/registro.json`. Gravação das 21h03 às
21h12, carga de 1,3 a 3,8 (`carga-19-10.txt`, linhas "peça 3"), com antes e peça
3 **intercalados** nas medidas de tempo e de passo (1.5, item 5c).

**O que se gravou.** O fluxo 03 (`grava-1`, a 1ª série, com o descanso
nascendo; `grava-2`, um descanso que substitui outro) no Chromium e no WebKit,
com e sem "Reduzir movimento" (`depois-3/`); o 03 e o passo do aviso, antes e
peça 3 intercalados, três vezes por motor, mais o passo do aviso sob "Reduzir"
(`repeticoes-peca-3/`); `micro-avisos.mjs` dos dois lados e o traço do
compositor do cronômetro (`depois-3/complementos/`). Nenhum erro de página.
Comparador em `comparacao-3/`.

### 9.1 A linha da peça 3: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **o cronômetro sobe da borda em 350 ms, sem quique** | **passa** | `translate` em `div#timer.anda.on`, **350 ms**, `cubic-bezier(0.32, 0.72, 0, 1)` (a curva da camada, sem ultrapassagem), nos dois motores; aos 120 ms ainda a caminho (y 828 no Chromium, 824 no WebKit) e no fim em y 814; o passo maior do cronômetro é **16 px por quadro** (antes: aparecia de uma vez) | `depois-3/03-serie-regua/medidas-{chromium,webkit}.json` (`grava-1`: `animacoes`, `meio`, `depois.fixos`); `repeticoes-peca-3/aviso/*/aviso-passo-*.json` |
| **e desce por onde veio** | **passa** | ao parar, o cronômetro desce em ~217 ms de movimento visível (o rabo da curva de 350 ms fica abaixo de meio pixel por quadro), passo de 16 px, e fica invisível no fim | `repeticoes-peca-3/aviso/peca-3-*/aviso-passo-*.json` (`desce`) |
| **o toast e a faixa acompanham, sem saltar 82 px** | **passa** | maior passo do toast por quadro: **15,9 px no Chromium e 14,8–16,4 no WebKit**, nas três repetições, subindo e descendo; no antes, **82 px num quadro**, sempre | `repeticoes-peca-3/aviso/{antes,peca-3}-{1,2,3}/aviso-passo-{chromium,webkit}.json` |
| **no modo, o cronômetro no fundo da tela** (o vão de 52 px) | **passa** | **y 814–896** (antes 762–844, 52 px acima do fundo), nos dois motores e com "Reduzir" | `depois-3/03-serie-regua/medidas-*.json` (`depois.fixos.cronometro`); `aviso-passo-*.json` (`fundoFim` 896) |
| **o toast também desce no modo** | **passa** (era da peça 7) | sem descanso, o toast no modo fica em y 839–882 (antes 787–830, flutuando), porque a reserva da barra de abas passou a valer para ele (`html:has(.ins-modo)`) | `depois-3/complementos/micro-avisos-chromium.json` (`toast1`) contra `antes-complementos/…` |
| **um descanso que substitui outro troca no lugar** | **passa** | `grava-2`: nenhuma animação no `#timer` (só a barra `#tfill`, como sempre); com "Reduzir", na região do cronômetro muda só o dígito "3:00" (279 px), não a caixa inteira | `depois-3/03-serie-regua/medidas-*.json` (`grava-2`) |
| **sob "Reduzir movimento": esmaece 120 ms ao chegar, sai de uma vez, nada desliza** | **passa** | `ins-esmaece`, só opacidade, **120 ms**; o maior passo do cronômetro é o caminho inteiro (82 px, sem deslizar) e o toast vai direto (82 px num quadro, como decidido); na saída o cronômetro some de uma vez | `depois-3/03-serie-regua/medidas-*-reduz.json`; `repeticoes-peca-3/aviso/peca-3-reduz/aviso-passo-*-reduz.json` |
| **no compositor** (princípio 2) | **passa** | traço do Chromium, 2 s de descanso: animações com `compositeFailed: 0`, 10 layouts e 23 pinturas, nenhum quadro perdido (antes 12, 24 e 1 quadro perdido, o do `AudioContext` que a peça 2 já tirou) | `depois-3/complementos/movimentos-chromium.json` contra `antes-complementos/movimentos-chromium.json` (janela `cronometro-2s`) |
| **o toque não ficou mais lento** (princípio 1, intercalado) | **passa** | medianas de trabalho no toque, antes → peça 3: Chromium `grava-1` 6,2 → 4,8 ms, `grava-2` 7,3 → 6,2; WebKit `grava-1` **29 → 4**, `grava-2` 19 → 13; nenhum intervalo de `requestAnimationFrame` acima do limite nos dois lados (o pior do WebKit caiu de 38–44 para 17–21 ms) | `repeticoes-peca-3/{antes,peca-3}-{1,2,3}/03-serie-regua/medidas-{chromium,webkit}.json` |
| princípios 2, 3, 7, 8 no comparador | **passa** | 16/16, 8/8, 8/8, 8/8; nenhuma reprovação em nenhum princípio | `comparacao-3/protocolo.json` |

### 9.2 O que ficou "a conferir"

- **`micro-avisos.mjs` não serve mais para o salto do toast**: ele lê o toast
  logo depois de ligar e de desligar o descanso, e com o acompanhamento animado
  pega o toast no meio do caminho (y 771 nos dois casos). A medida que vale é
  a de `revisor-aviso-passo.mjs` (9.1). O "Não guardei" que ele também mede
  ficou igual ao antes (chega aos ~0,8 s, botões entre y 674 e 882): é da peça 4.
- **Os degraus da barra sob "Reduzir"** e um buraco de captura de 104 ms no
  `grava-2` do WebKit (princípios 4 e 5), com a página no ritmo: os mesmos de
  sempre.
- **Nas telas cheias o cronômetro continua 52 px acima do fundo**: não está nos
  fluxos desta peça e fica para a peça 5, como o coordenador anotou.

**Conclusão: a peça 3 passa na linha dela, sem nenhuma reprovação.** O
cronômetro sobe e desce em 350 ms na curva da camada, sem quique, e encosta no
fundo do modo; o toast e a faixa vão junto, de 16 em 16 px por quadro, em vez de
saltar 82 px; com "Reduzir movimento" nada desliza; e o toque ficou igual ou
mais rápido nos dois motores.

---

## 10. Depois da peça 4

Conferida em 19/10 pela linha da peça 4 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-4/` (commit `09ebd7c`), servido na
porta 4728 (desligada), com o mesmo `antes/registro.json`. Gravação das 23h28 às
23h42, carga de 1,1 a 2,6 (`carga-19-10.txt`, linhas "peça 4"), com antes e
peça 4 **intercalados** três vezes nas medidas de tempo (1.5, 5c).

**O que se gravou.** Os fluxos 06 (folhas), 13 (pare), 15 (o × tocado no meio da
subida) e o **15b novo** (o véu tocado no meio da subida) no Chromium e no
WebKit, com e sem "Reduzir movimento" (`depois-4/`). O 15b também foi gravado no
antes, nas quatro rodadas (`antes/rodada-*-15b.json`), para o comparador ter par.
Os mesmos fluxos, antes e peça 4 intercalados, três vezes por motor
(`repeticoes-peca-4/`). Os complementos `revisor-aviso-janela.mjs` (novo),
`micro-avisos.mjs` e `acesso-foco.mjs`, dos dois lados
(`antes-complementos/`, `depois-4/complementos/`). Nenhum erro de página.
Comparador em `comparacao-4/`.

**Duas regras do comparador corrigidas nesta conferência.** (1) O segundo toque
"se perde" quando cai no `html`, no `body` ou em lugar nenhum. Antes eu exigia
um botão, e o véu do 15b, que é o alvo certo, reprovava. (2) O quique tem dois
pontos de retorno (~352 e ~515 ms, 09). Ali a folha passa pelo mesmo lugar na
ida e na volta, e o quadro do retorno parecia "aparecer e sumir". Transitórios a
até 40 ms desses pontos não contam nos passos de quique. Foi o caso do
`06 empilha` a +534 ms no Chromium e do 15 a +367 ms no WebKit.

### 10.1 A linha da peça 4: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **a folha chega com o quique de 640 ms** | **passa** | `ins-quique` em `transform`, **640 ms**, na `.ins-folha`, nos dois motores; a mudança se espalha por 39–53 quadros até ~640–670 ms; na tira, a folha passa do lugar a +384 ms (o topo quase no alto da tela) e assenta a +668; no pico do quique não aparece a página por baixo (o "pé da caixa") | `depois-4/06-folhas/medidas-*.json` (`abre`, `empilha`); tira dupla `comparacao-4/06-folhas/01-abre-chromium-par.png` |
| **o véu acende em 350 ms** | **passa** | `ins-esmaece`, opacidade, **350 ms**, `ease` (no Chromium, `cubic-bezier(0.25, 0.1, 0.25, 1)`, o mesmo) | idem |
| **a segunda folha sobe sobre a primeira** | **passa** | `empilha`: o mesmo quique na folha nova, `confere` (2 folhas) verdadeiro em todas as rodadas | `depois-4/06-folhas/medidas-*.json` (`empilha`) |
| **o painel de apagar chega como a folha** | **passa** | `13 abre`: `ins-quique` 640 ms no `.pare`, véu 350 ms; o botão de apagar fica onde estava no antes | `depois-4/13-pare/medidas-*.json` |
| **a saída de tudo continua de uma vez** (a descida é da peça 5) | **passa, como combinado** | `fecha-x`, `voltar` e `deixa`: a tela troca num quadro, sem animação | idem (o princípio 8 marca "troca num quadro", que só vale a partir da peça 5) |
| **sob "Reduzir movimento", só esmaece em 120 ms** | **passa** | folha, véu e painel: `ins-esmaece`, só opacidade, **120 ms**; a mudança acaba em ~104–151 ms; nada se desloca; a saída é de uma vez | `depois-4/*/medidas-*-reduz.json`; `comparacao-4/protocolo.json` (princípio 5: 16/16) |
| **o toque no meio da subida chega** (15b, o véu) | **passa** | o véu tocado 97–105 ms depois de abrir fecha a folha: nas quatro rodadas e nas **3 de 3** repetições de cada motor (no antes também fechava: não havia subida) | `depois-4/15b-meio-folha-veu/medidas-*.json`; `repeticoes-peca-4/peca-4-*/15b-…/` |
| **o "Não guardei" ignora o toque que vinha para outra coisa** (defeito 5) | **passa** | o aviso chega a ~823–829 ms do toque da série. Com o dedo de verdade em "Fechar este aviso": a **~156 ms** o aviso **fica** (no antes, fechava) e a **~605 ms** fecha, nos dois motores | `depois-4/complementos/aviso-janela-{chromium,webkit}.json` contra `antes-complementos/…` |
| **o pare e o "Não guardei" isolam o fundo; o `#timer` entra no isolamento** | **passa** | com o aviso: **45 de 45** focáveis do fundo inertes e o `#timer` inerte (antes: 0 de 45). `acesso-foco.mjs`: com o pare e com o aviso, cabeçalho, `main`, barra de abas e `#timer` inertes (antes: nada); com a folha, o `#timer` entrou na lista (a fresta do Tab do 05 §3.1) | `aviso-janela-*.json` (`isolamento`); `depois-4/complementos/acesso/acesso-foco.json` contra `antes-complementos/acesso/…` |
| **o foco volta a quem o tinha** | **passa** | "Deixar como está" devolve o foco ao **"Encerrar"** (antes, ao `body`), nas quatro rodadas; a folha continua devolvendo ao "···" e ao "Outra porção" | `depois-4/13-pare/medidas-*.json` (`deixa`, `depois.foco`); comparador, princípio 6: 32/32 |
| **o toque não ficou mais lento** (5c) | **passa** | medianas de trabalho no toque, antes → peça 4, todas dentro de ±3 ms; a primeira mudança na tela igual ou mais cedo, fora o "Deixar como está" no WebKit (+13,8 → +21,4 ms, menos de um quadro); nenhum intervalo de `requestAnimationFrame` acima do limite durante o quique (pior 21 ms no WebKit) | `repeticoes-peca-4/{antes,peca-4}-{1,2,3}/` |
| princípios 2, 4, 10 | **passa** | 32/32, 16/16, 14/14 | `comparacao-4/protocolo.json` |

### 10.2 O que reprovou

- **15 · o × tocado ~115 ms depois de abrir não fecha a folha** (princípios 1 e
  7): Chromium 3 de 3, WebKit 2 de 3. **É a mira do robô, não o app.** O alvo
  que o `pointerdown` registrou foi o corpo da folha (`div.ins-grade-c`,
  `div.ins-folha-c`), não o ×. A caixa do × é lida um quadro antes de o dedo
  descer, e nesse intervalo o × sobe até 60 px. Sem movimento (as rodadas
  reduzidas) o × é acertado e fecha. A prova de que o toque no meio chega é o
  **15b**, que mira o véu parado no alto (`ponto2`, novo em `revisor-comum.mjs`).
  O 15 fica gravado como registro do que é mirar um alvo que sobe.
- **15 · no Chromium, a folha volta um quadro quando o dedo pousa nela**
  (princípio 3). **Achado, para o coordenador.** O quadro de +149,6 ms é quase
  idêntico ao de +69,6, e o de +166,6 ao de +84,1: a folha avança, volta um
  quadro quando o dedo pousa (~16 % da tela muda), fica parada 65 ms com o dedo
  e avança de novo ao soltar. É o "o dedo segura a camada que chega" pausando
  a animação no quadro do teste de toque, que fica um atrás do que estava na
  tela. No WebKit não aparece; no 15b (dedo no véu) também não. Arquivo:
  `depois-4/15-meio-folha/medidas-chromium.json` (`transitorios`,
  `linhaDoTempo`).
- **As saídas de uma vez** (`fecha-x`, `voltar`, `deixa`; princípio 8): é o
  combinado até a peça 5.

### 10.3 O que ficou "a conferir"

- **O `micro-avisos.mjs` não mede mais a faixa "Não guardado"**: o clique dele
  em "Fechar este aviso" cai dentro da janela de 400 ms e é engolido, o aviso
  fica e a faixa nunca aparece (`faixa: null`). É o conserto funcionando. A
  janela se confere pelo `revisor-aviso-janela.mjs`, e a faixa sobre a saída do
  modo (defeito 4) é da peça 5.
- **O "pé da caixa"** se conferiu a olho, na tira (10.1). Não há medida
  automática de vão sob a folha.

**Conclusão: a peça 4 passa na linha dela.** A folha e o painel de apagar chegam
com o quique de 640 ms, o véu em 350, e com "Reduzir movimento" só esmaecem; o
toque no meio da subida chega quando a mira é estável (o véu); o "Não guardei"
não se fecha mais com o toque que vinha para outra coisa; o fundo fica isolado,
inclusive o cronômetro; e o foco volta a quem o tinha. Fica um achado para o
coordenador decidir: no Chromium, a folha recua um quadro quando o dedo pousa
nela durante a subida.

---

## 11. Depois da peça 5

Conferida em 20/10 pela linha da peça 5 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-5/` (commit `1a54bf3`), servido na
porta 4728 (desligada), com o mesmo `antes/registro.json`. Gravação das 03h00 às
03h23, carga de 0,7 a 4,3 (`carga-20-10.txt`), com antes e peça 5
**intercalados** três vezes nas medidas de tempo (1.5, 5c). Dois complementos
rodaram depois, com a máquina quieta: as armadilhas no WebKit às 07h49 (carga
0,5) e o anel e o cronômetro às 07h59 (carga 1,4; o antes na porta 4727 e a peça
5 na 4728, as duas desligadas).

**O que se gravou.** Os fluxos 01, 02, 04, 05, 06 (a descida), 08, 15, 15b e 16
no Chromium e no WebKit, com e sem "Reduzir movimento" (`depois-5/`). Antes e
peça 5 intercalados, três vezes por motor: 01, 04, 06, 08 e 16
(`repeticoes-peca-5/`). Os complementos `navegacao-hoje.mjs` (a rolagem de cada
fecho), `acesso-foco.mjs`, `desempenho-armadilhas.mjs` (as alturas do §4; o do
WebKit foi regravado, porque a primeira chamada não chegou a rodar o script),
`revisor-aviso-janela.mjs` com a medida nova da faixa (defeito 4) e
`revisor-anel-e-cronometro.mjs`, novo (defeito 7 e o cronômetro nas telas
cheias), dos dois lados (`antes-complementos/`, `depois-5/complementos/`).
Nenhum erro de página em nenhuma rodada. Comparador em `comparacao-5/`.

**Três regras do comparador corrigidas nesta conferência.**

1. *A de baixo parada.* A transição começa um quadro depois do toque, e a foto
   da tela de baixo guarda o controle apertado: o cartão fica escuro sob a tela
   que chega, como deve, porque o dedo estava nele. Comparar o quadro de +50 ms
   com o de antes do toque reprovava por isso. A conta agora compara a faixa da
   esquerda (0–60 px) dentro da própria troca: +50 contra +100 ms na chegada,
   +150 contra +800 na saída.
2. *O segundo toque.* Com a transição, o robô vê o `pointerdown` no `html` (a
   camada das fotos), e o app reenvia o clique ao nó que está sob o dedo. O robô
   passou a anotar todos os cliques do passo (`cliquesDepois`, em
   `revisor-comum.mjs`), e "o toque se perdeu" só vale quando o passo não faz o
   que devia (`confere`).
3. *Quando a troca anda.* O princípio 1 usava o primeiro quadro que muda depois
   do toque. Com a transição, esse quadro muitas vezes mostra só o controle
   apertado: a caixa da seta (`[40, 8, 47, 48]`) ou a do cartão. Nas trocas de
   camada (`mov` `entra` e `sai`), o princípio 1 passou a medir também o
   primeiro quadro em que a mudança encosta na borda direita e tem a altura da
   tela (`andaMs`, em `revisor-compara.mjs` e nos `numeros` do `protocolo.json`).
   Sem esta regra, a chegada pelo toque parecia custar só +4 a +7 ms; com ela,
   aparece o mesmo atraso do Voltar do sistema (11.2).

### 11.1 A linha da peça 5: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **a tela cheia e o modo chegam pela direita em 350 ms** | **passa** | `ins-da-direita`, em `transform`, no `::view-transition-new(root)`, **350 ms**, `cubic-bezier(0.32, 0.72, 0, 1)` (sem ultrapassagem), nos dois motores: 01 e 02 (o modo, pelo cartão e pela faixa), 04 (abre, empilha), 05 (abre, abre-de-novo) e 16; nenhum elemento real ganha animação | `depois-5/{01,02,04,05,16}-*/medidas-{chromium,webkit}.json` (`animacoes`) |
| **a de baixo parada** | **passa** | a faixa da esquerda (0–60 px) muda **0,0 %** entre +50 e +100 ms em toda chegada, e **0,0–0,1 %** entre +150 e +800 em toda saída; no antes, 8–22 % aos +50 (a tela trocava inteira) | `comparacao-5/protocolo.json` (princípio 8, "faixa da esquerda"); tiras `comparacao-5/*/*-par.png` |
| **e saem pela direita em 350: pela seta, pelo "‹ Voltar" e pelo Voltar do sistema** | **passa** | `ins-para-direita` no `::view-transition-old(root)`, 350 ms, a mesma curva, por cima da tela que reaparece: 01 e 02 (a seta), 04 (volta-1, volta-3), 05 (volta, e "Ir para Semana", uma transição só, `sai`). O Voltar do sistema (08) desenha a mesma saída: 9 a 13 quadros com mudança e a faixa da esquerda parada (no antes, dois quadros) | idem; `depois-5/08-voltar-sistema/medidas-*.json` (`medidasDosQuadros`) |
| **a folha desce em 350, e o véu apaga junto** | **passa** | `06 fecha-x`: `ins-desce` (`transform`) no `::view-transition-old(folha-1)` e `ins-apaga` (opacidade, `ease`) no `veu-1`, 350 ms; só a de cima desce (fica uma folha). Pelo Voltar do sistema, 18 a 20 quadros com mudança. No 15b, o véu tocado na subida faz a folha descer (`folha-0`, `veu-0`) | `depois-5/06-folhas/medidas-*.json` (`fecha-x`, `voltar`); `depois-5/15b-meio-folha-veu/medidas-*.json` |
| **nenhuma saída quica; só as durações da lista** | **passa** | nas saídas, só 350; no resto, 120 (o esmaecer sob "Reduzir"), 640 (a chegada da folha) e 2 400 (o ponto) | `comparacao-5/protocolo.json` (princípio 8) |
| **sob "Reduzir movimento", esmaece 120 ao chegar e sai de uma vez** | **passa** | `ins-esmaece`, só opacidade, **120 ms**, no nó que nasce (`div.ins-modo`, `div.tc`, a folha e o véu); nenhuma `::view-transition`; nas saídas, nenhuma animação nova (as que aparecem no `fecha-x` são as da chegada, já `finished`); a tela troca no mesmo quadro do antes (01 entra: 20,7 → 19,4 ms no Chromium) | `depois-5/*/medidas-*-reduz.json`; princípio 5: 46/46 |
| **a rolagem volta exata** | **passa** | 02 (o modo aberto pela faixa, com o Corpo rolado): **1982 → 1982** nas quatro rodadas (antes, 1982 → 1091). `navegacao-hoje.mjs`, pelo Voltar: a faixa no Corpo **1778 → 1778** (antes → 1156) e na Semana **1222 → 1222** (antes → 1156); Ajustes, modo, Programa e Evolução continuam exatos | `comparacao-5/protocolo.json` (princípio 9: 16/16); `depois-5/complementos/navegacao-hoje-chromium.json` contra `antes-complementos/…` |
| **o foco entra no título e sai num lugar declarado** | **passa**, fora "Ir para Semana" sob "Reduzir" (11.2) | ao entrar, o `h1` do destino ("Programa", "Evolução", o exercício) e o do modo ("Pernas completas + panturrilhas"); ao sair, o controle que abriu (o cartão `button.ins-foco`, a faixa, "histórico de…", o botão "Evolução"), e "Ir para Semana" no título "Semana"; a folha devolve ao "editar" e ao "Outra porção". No antes, `body` ao entrar e ao sair do modo e ao fechar a tela cheia. `acesso-foco.mjs`, com e sem "Reduzir": ao fechar a tela cheia e o pare, o ⚙; o modo entra no `h1` e sai no cartão (antes, `body` nos quatro) | princípio 6: 86 passos passam; `depois-5/complementos/acesso/acesso-foco.json` contra `antes-complementos/acesso/…` |
| **o Voltar do sistema faz o mesmo reverso** | **passa na forma** (o tempo, em 11.2) | 08: a faixa da esquerda parada; o foco em "histórico de…" e no título "Prescrição", como pelo "‹ Voltar" | `depois-5/08-voltar-sistema/medidas-*.json` |
| **a seta tocada no meio da chegada fecha o modo** (16) | **passa** | o dedo pousa no `html` (a camada das fotos) ~66 ms (Chromium) e ~88 ms (WebKit) depois do primeiro toque; o clique vai à seta (`button.ins-modo-sair`) e o modo fecha, nas quatro rodadas e em **3 de 3** repetições por motor. No 15b, o véu tocado na subida fecha a folha | `depois-5/16-meio-modo/medidas-*.json` (`segundoToque.cliquesDepois`); `repeticoes-peca-5/peca-5-*/16-meio-modo/` |
| **a folha não recua mais sob o dedo** (o achado da peça 4, 10.2) | **passa** | 15 no Chromium: nenhum quadro transitório (na peça 4, dois, a +84 e a +149,6 ms) | `depois-5/15-meio-folha/medidas-chromium.json` contra `depois-4/…` (`transitorios`) |
| **defeito 4: a faixa "Não guardado" não cobre a saída do modo** | **passa** | a faixa fica em 0–59 px e a barra do modo cresce por baixo dela (0–113 px, a seta em y 67–113; no antes, 8–54, debaixo da faixa); sob o centro da seta, da hora e do `···` está o próprio controle (no antes, a faixa). A janela de 400 ms segue valendo (o toque a ~155 ms não fecha o aviso, a ~605 fecha) e o fundo fica isolado (46 de 46 inertes) | `depois-5/complementos/aviso-janela-{chromium,webkit}.json` (`faixa`) contra `antes-complementos/…` |
| **defeito 7: o campo de importar mostra o foco** | **passa** | pelo Tab (6 toques nos dois motores), o rótulo "escolher arquivo json" ganha o anel, `solid 3px rgb(56, 51, 219)` com folga de 2 px (no antes, `none`) | `depois-5/complementos/anel-e-cronometro-*.json` (`anel`) e `anel-*.png`, contra `antes-complementos/…` |
| **o cronômetro no fundo nas telas cheias** | **passa** | com um descanso contando, nos Ajustes e na Evolução: **y 813,8–896** (antes, 761,8–844, 52 px acima do fundo); no Agora segue em 761,8–844, sobre a barra de abas | `anel-e-cronometro-*.json` (`cronometro`), dos dois lados |
| **o modo curto não sobra** | **passa** | com o conteúdo do modo encurtado, a página tem 896 px e **sobra 0** (antes, 920 px e 24 de sobra no Chromium; no WebKit a sonda do antes nem chegou a abrir o modo); nos Ajustes, o rodapé reservado cai de 76 para 24 px, sem a barra de abas | `depois-5/complementos/armadilhas-*.json` (`alturas`) contra `shots/desempenho/armadilhas-*.json` |
| **o trabalho no toque** (5c) | **passa** | medianas, antes → peça 5, no Chromium: 01 entra 4,3 → 0,3 ms, 16 6,3 → 0,3, 06 fecha-x 3,1 → 0,1 (o desenho saiu do toque e foi para a transição); no WebKit, 9 → 0, 6 → 1 e 6 → 0 | `repeticoes-peca-5/{antes,peca-5}-{1,2,3}/` |
| princípios 2, 3, 10 | **passa** | 92/92, 46/46, 40/40 | `comparacao-5/protocolo.json` |

### 11.2 O que reprovou

- **A troca começa a andar dois quadros depois do antes** (princípio 1;
  confirmado nas três repetições de cada lado). No Chromium, as medianas do
  primeiro quadro em que a troca anda, antes → peça 5: 01 entra 16,9 → 49,3 ms,
  sai 16,3 → 50,2; 04 abre 16,5 → 49,7, volta-3 15,8 → 50,1; 16 18,7 → 51,5; o
  Voltar do sistema, 08 15,4 → 49,7 e 06 12,5 → 50,9; a folha descendo pelo ×,
  17,5 → 53,7. São **+31 a +36 ms em toda troca**, pelo toque e pelo Voltar. Os
  quadros mostram por quê (`peca-5-1/01-modo-cartao`): a +22,6 ms muda só o
  cartão apertado; a +32,3 nada muda; a +49,2 a tela nova aparece, já com 54 px
  de largura. O primeiro desses quadros é a foto da tela velha, o quadro a mais
  que o dono aceitou (decisão 6). O segundo é o começo da animação: no tempo 0 a
  tela nova ainda está toda fora, à direita (na saída, a de cima ainda está
  inteira no lugar), e o quadro sai igual ao anterior. Esse segundo quadro existe
  em toda chegada que parte de fora da tela (a folha da peça 4 também tem um: no
  06 abre, 17,8 → 33,3 ms), mas a regra aceita um só. O 09 dá +18 ms do toque ao
  desenho novo; na tela, a troca anda +33 ms depois do antes. **Para o
  coordenador:** ou o dono aceita os dois quadros, ou a chegada começa um quadro
  adiante (a animação já fora do tempo 0 no primeiro quadro desenhado). Arquivos:
  `repeticoes-peca-5/{antes,peca-5}-{1,2,3}/*/medidas-chromium.json`
  (`medidasDosQuadros.mudancasFinas`); `comparacao-5/protocolo.json`
  (`numeros.andaMs`).
- **No WebKit desta máquina, o mesmo, em quadros mais longos** (princípios 1 e
  4). Durante a troca, o maior intervalo do `requestAnimationFrame` vai a 26–62
  ms nas repetições (35–92 ms na gravação principal, onde 15 passos reprovam no
  princípio 4), contra 17–22 ms nos passos sem transição da mesma rodada (06
  abre e empilha, o quique; 04 abre-treino e volta-2). Medianas de quando a troca anda, antes → peça 5: 01 entra 13,4 →
  58,8, sai 2 → 36,5; 04 abre 1,1 → 36,9; 16 13,9 → 55,7; 08 voltar-2 −0,1 →
  70,6; a folha pelo × 3 → 107,4 e pelo Voltar 5,7 → 108,1. Contados no quadro
  desta máquina (~40–60 ms durante a troca), são os mesmos dois quadros do
  Chromium. O Event Timing do × (16 → 56–72 ms) é o mesmo quadro lento. É o
  WebKit sem placa de vídeo compondo as fotos em software: **o ritmo e o atraso
  em milissegundos ficam a conferir no aparelho** (1.5, item 6). Arquivos:
  `repeticoes-peca-5/*/*/medidas-webkit.json` (`quadrosDaPagina`,
  `medidasDosQuadros`).
- **"Ir para Semana" sob "Reduzir movimento" deixa o foco no `body`** (princípio
  6, nos dois motores). Sem "Reduzir", o foco vai ao título "Semana"; com
  "Reduzir", fica no `body` aos 150 ms e no fim do passo. As duas rodadas só
  diferem na transição: sob "Reduzir" a troca não passa por ela (09, decisão
  19). O resto do fluxo 05 acerta nas duas. Arquivos:
  `depois-5/05-evolucao/medidas-{chromium,webkit}-reduz.json` (`ir-para-semana`:
  `focoAos150ms`, `depois.foco`).
- **15 · o × tocado na subida não fecha a folha** (princípios 1 e 7). É o mesmo
  caso da peça 4 (10.2), a mira do robô: o dedo pousa no corpo da folha
  (`div.ins-grade-c`), e com a mira nova o clique vai a esse nó, como deve. A
  prova de que o toque no meio chega são o 15b e o 16.

### 11.3 O que ficou "a conferir"

- **"A tela muda por ~700 ms"** em 01 sai e 02 entra (princípio 8): é o ponto
  ao vivo pulsando (`ins-pulse`, 2 400 ms, decidido) na tela que chega ou que
  reaparece. A troca em si acaba nos 350.
- **No 04, abrir um treino dentro do Programa deixa o foco no `body`, como no
  antes.** É troca de conteúdo dentro da mesma tela cheia, sem camada nova, e
  fica fora da linha da peça; mas o leitor de tela perde o lugar ali. O
  coordenador decide de quem é.
- **Os fixos durante a troca.** A conta "fixos no lugar aos 120 ms" lê o DOM, e
  na transição o que anda são as fotos: para a peça 5, ela não prova nada.
  Nenhum fluxo desta peça tem o cronômetro ou o aviso na tela durante uma troca.
  Pelo CSS do build (`dist-peca-5/assets/index-C1GjD3qP.css`), o cronômetro, o
  aviso e as duas faixas têm nome próprio e grupo sem animação: não deslizam com
  a página. Mas o cronômetro muda de lugar entre o Agora (o fundo em 844, sobre
  a barra de abas) e a tela cheia (896) (`anel-e-cronometro-*.json`). Com o grupo
  sem animação, ele deve saltar esses 52 px num quadro, no começo da troca. A
  conferir a olho na rodada final, com um fluxo novo (descanso contando, toque no
  ⚙).
- **O painel de apagar descendo** (13, "Deixar como está") não foi gravado nesta
  peça. Fica para a rodada final; o `troca.test.js` do implementador o cobre
  (caso 3).
- **As sondas do `desempenho-armadilhas.mjs` que leem o DOM logo depois do
  `render()`** (§1, §3 e §5). Com a transição, o desenho entra um quadro depois,
  e algumas não acharam o nó: `sem #app > main`, `.tc` e `.ins-modo`; o modo
  "ausente" na sonda do `sticky` no WebKit. Onde acharam, deram o mesmo que no
  antes (o `translateX` forçado no modo ainda rola a janela de lado, o que é da
  peça 6). A sonda crua de View Transition (§5) ainda perde o toque no `html`,
  porque não tem o pulo e o reenvio do app; com os do app, o toque chega (16,
  15b).

**Conclusão: a peça 5 passa na forma e reprova no tempo.** A tela cheia e o
modo chegam e saem pela direita em 350 ms na curva da camada, com a de baixo
parada; a folha desce; com "Reduzir movimento" só esmaece; a rolagem volta
exata; o foco entra no título e volta a quem abriu; a seta tocada no meio da
chegada fecha o modo; e estão consertados os defeitos 4 e 7, a sobra do modo
curto e o cronômetro nas telas cheias. Reprovam duas coisas. A troca começa a
andar dois quadros depois do antes (+31 a +36 ms no Chromium, em toda troca),
quando o dono aceitou um. E "Ir para Semana", sob "Reduzir", perde o foco. O
ritmo das transições no WebKit desta máquina (quadros de 40–60 ms) fica a
conferir no aparelho.

---

## 12. Depois da peça 6

Conferida em 20/10 pela linha da peça 6 da tabela 1.4 e pelos itens que a
peça 5 deixou (11.2 e 11.3), contra o build congelado em
`docs/motion/_medicao/shots/dist-peca-6/` (commit `b2d102a`), servido na porta
4728. O antes (`dist-antes`) ficou na 4727 e a peça 5 (`dist-peca-5`) na 4726,
só para o fluxo 17. As três portas estão desligadas. O registro é o mesmo
`antes/registro.json`. A gravação foi das 10h25 às 11h14, com carga de 1,0 a
4,6 e um pico de 16,4 às 10h44: o implementador da peça 7 rodava em paralelo
(`carga-20-10.txt`, linhas "peça 6"). Por isso as medidas de tempo vêm de antes
e peça 6 **intercalados** (1.5, 5c), e a mediana de cinco no Chromium.

**O que se gravou.** Os fluxos 07 e 14 (a linha da peça), 01, 02, 04, 05, 06,
08, 13 e 16, no Chromium e no WebKit, com e sem "Reduzir movimento"
(`depois-6/`). O **fluxo 17, novo** (o cronômetro numa troca de camada: o
descanso contando, Agora → Ajustes → Agora), com os quadros guardados, nos três
builds: antes, peça 5 e peça 6 (`antes/`, `depois-5/`, `depois-6/`,
`17-cronometro-troca/`, e as rodadas `rodada-*-17.json`). Antes e peça 6
intercalados, nos fluxos 01, 06, 07, 08, 13 e 14: três vezes por motor, mais
duas no Chromium, fluxo a fluxo, porque a carga mudou no meio da primeira
repetição. Também 07 e 14 sob "Reduzir", três vezes (`repeticoes-peca-6/`). E o
complemento `desempenho-armadilhas.mjs` nos dois motores
(`depois-6/complementos/`). Nenhum erro de página nos fluxos. Comparador em
`comparacao-6/`.

**Quatro correções na medida, nesta conferência.**

1. *A ordem dos quadros.* Sob carga, o screencast do Chromium entrega quadros
   fora de ordem (09, peça 6, decisão 17). `revisor-comum.mjs` passou a ordenar
   os quadros pelo carimbo, na calibração e na gravação.
2. *O fluxo 02 montado no meio de um carrossel.* O `montar` dele chama
   `vaiPara('corpo')`, que agora é transição, e o app rola ao topo quando o
   desenho novo entra. A rolagem até o fundo, feita logo depois, se perdia, e o
   modo abria com o Corpo em 0 px. O fluxo passou a esperar 700 ms antes de
   rolar, e o 02 foi regravado nas duas rodadas sem "Reduzir"
   (`depois-6/rodada-*-02.json`). Sem isso, o comparador acusava a tela final
   diferente com e sem "Reduzir" (princípio 7).
3. *Duas faixas paradas.* A barra no carrossel se confere pela faixa dos
   rótulos (y 856–896, sem o fio): de +50 contra +150 ms e de +250 contra
   +800. Entre +150 e +250, no Chromium, a aba tocada fica apertada depois de
   soltar (o dedo do CDP, 1.1), e isso não é a barra andar. No fluxo 17, a faixa
   da esquerda só vale até y 740 (`debaixoAte`), porque o cronômetro desce por
   ela de propósito. A ferramenta é `revisor-tiras.py faixa`, com `y0` e `y1`.
4. *Um quadro a mais, em quadros.* A medida cai no quadro, e onde o toque cai
   dentro do quadro muda de uma gravação para outra. "Um quadro depois do
   antes" aparece entre +8 e +25 ms; "dois", de +25 a +42. Nas trocas de camada
   e de aba, que a decisão 6 aceita com um quadro a mais, o limite do princípio
   1 passou de 17 para 25 ms (1,5 quadro). Nos outros passos continua 17. A
   conclusão da peça 5 não muda: +31 a +36 ms são dois quadros pelas duas
   réguas.

### 12.1 A linha da peça 6: o carrossel

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **a página inteira desliza em 350 ms, na `--ins-curva`** | **passa** | andando para a direita, `ins-para-esquerda` no `::view-transition-old(root)` e `ins-da-direita` no `-new(root)`; para a esquerda, `ins-para-direita` e `ins-da-esquerda`. As duas fotos em **350 ms**, `cubic-bezier(0.2, 0.8, 0.2, 1)`, nos dois motores | `depois-6/07-abas/medidas-{chromium,webkit}.json` (`animacoes`) |
| **o fio junto** | **passa** | transição de `transform` no `div.ins-tab-ind`, **350 ms**, a mesma curva, no mesmo passo (era 160 ms, sozinho) | idem |
| **≥ 3 quadros com mudança** | **passa** | 22 a 40 quadros, até ~366–439 ms (até ~700 no Semana → Agora, com o ponto ao vivo pulsando no Agora que chega) | `comparacao-6/protocolo.json` (princípio 8) |
| **a barra parada** | **passa** | faixa dos rótulos: **0,0 %** de diferença no Chromium e 0,0–0,6 % no WebKit, de +50 a +150 ms e de +250 a +800, nos três passos | idem ("a barra (rótulos, y 856–896)") |
| **largura 414** | **passa** | a largura rolável aos 120 ms é 414 em todo passo do 07 e do 14, nos dois motores. O carrossel não move elemento nenhum, só as fotos, que não contam para a largura | `depois-6/07-abas/medidas-*.json` (`meio.larguraRolavel`); princípio 3: 58/58 |
| **a aba tocada no meio vence** (14) | **passa** | o segundo toque pousa no `html` (as fotos) a ~67–74 ms e o clique vai à aba Semana (`cliquesDepois`), que fica acesa: nas quatro rodadas e em todas as repetições (5 de 5 no Chromium, 3 de 3 no WebKit) | `depois-6/14-meio-abas/medidas-*.json` (`segundoToque`, `confere`); `repeticoes-peca-6/peca-6-*/14-meio-abas/` |
| **sob "Reduzir", a aba nova esmaece 120 ms e a velha sai de uma vez** | **passa** | `ins-esmaece`, só opacidade, **120 ms**, no `<main>` que nasce, e no cabeçalho do Agora quando é ele que chega. Nenhuma transição de vista, nenhuma animação na velha nem no fio (o fio salta). A tela muda por 119–152 ms | `depois-6/07-abas/medidas-*-reduz.json`; princípio 5 |
| **o toque não ficou mais lento** (5c) | **passa** | trabalho no toque no Chromium, medianas antes → peça 6: 2,7 → 0,2 ms, 5,3 → 0,1 e 3,6 → 0,1 (o desenho foi para a transição). Sob "Reduzir": 2,7 → 4,6, 5,6 → 7,3 e 3,1 → 5,1 (o `<main>` nasce de novo), dentro do limite. O 18 ms do 14 sob "Reduzir" na gravação principal foi uma amostra só: nas três repetições, 4,5–4,9 | `repeticoes-peca-6/{antes,peca-6}-*/07-abas/`, `…/14-meio-abas/` |
| **quando a troca anda** (princípio 1) | **passa** no Chromium | medianas de cinco: Agora → Corpo 17,6 → 36,2 ms, Corpo → Semana 17,8 → 36,1, Semana → Agora 16,6 → 39,2; o 14 18,3 → 36. É o quadro seguinte ao do antes. O WebKit está em 12.3 | `repeticoes-peca-6/` |

### 12.2 O que a peça 5 deixou: refeito

| o item | resultado | o número | arquivo |
|---|---|---|---|
| **o quadro a mais** (11.2) | **passa no Chromium, fora a folha fechada pelo ×** | medianas de cinco de quando a troca anda, antes → peça 6: 01 entra 17,2 → 35,4 ms, sai 17,3 → 39,2; 13 deixa 15,9 → 35,3; o Voltar do sistema 08 voltar-1 15,3 → 31,6 e 06 voltar 15,8 → 25,1. É o segundo quadro depois do toque, onde na peça 5 era o terceiro (01 entra 49,3; 08 49,7). O primeiro quadro que anda mostra a tela nova com os mesmos 54 px da peça 5, um quadro mais cedo. **O 08 voltar-2 fica no limite**: 5,5 → 32,4 ms (+27) com as cinco, +22 sem a da carga alta | `repeticoes-peca-6/{antes,peca-6}-{1..5}/*/medidas-chromium.json` (`mudancasFinas`) |
| **"Ir para Semana" sob "Reduzir"** | **passa** | o foco vai ao título "Semana" aos 150 ms e no fim, nas quatro rodadas (na peça 5, `body` sob "Reduzir") | `depois-6/05-evolucao/medidas-*.json` (`ir-para-semana`) |
| **o treino aberto no Programa** | **passa** | o foco vai ao título do treino ("Peito superior + dorsais + later…"), nas quatro rodadas (antes e peça 5, `body`) | `depois-6/04-programa/medidas-*.json` (`abre-treino`) |
| **o cronômetro numa troca de camada** (fluxo 17) | **passa** | a linha azul do descanso, quadro a quadro: na peça 5, **815 → 867 num quadro** (a +33 ms no Chromium, +70 no WebKit) e de volta do mesmo jeito; na peça 6, **10 a 14 quadros**, no máximo 10 px por quadro no Chromium e 13 no WebKit, de +34 ms até ~200–320 ms, junto com a tela. É `ins-rodape-desce`/`-sobe` no par de imagens do `cronometro`, 350 ms, na curva da camada. No antes ele nem mudava de lugar (815 nas duas telas, 52 px acima do fundo). Sob "Reduzir", troca de altura de uma vez | `{antes,depois-5,depois-6}/17-cronometro-troca/cronometro-*.json`; `depois-6/17-cronometro-troca/medidas-*.json` (`animacoes`) |
| **o painel de apagar descendo** (13) | **passa** | "Deixar como está": `ins-desce` no `::view-transition-old(painel)` e `ins-apaga` no `veu-painel`, 350 ms, nos dois motores; sob "Reduzir", sai de uma vez. A chegada segue com o quique de 640 ms. O foco volta ao "Encerrar". A troca anda no quadro seguinte ao do antes (+19 ms) | `depois-6/13-pare/medidas-*.json`; `repeticoes-peca-6/*/13-pare/` |
| princípios 2, 3, 7, 9 no comparador | **passa** | 116/116, 58/58, 58/58, 16/16. A rolagem do 02 volta exata, 1982 → 1982, nas quatro rodadas | `comparacao-6/protocolo.json` |

### 12.3 O que reprovou

- **A folha de cima fechada pelo × anda dois quadros depois** (06 `fecha-x`,
  princípio 1, confirmado nas cinco repetições). No Chromium, mediana de 16,9
  → 50,2 ms (+33). O primeiro quadro depois do toque chega só a +34–45 ms e
  mostra apenas o × apertado. Há um quadro longo: o maior intervalo de
  `requestAnimationFrame` vai a 23,8 ms (mediana; até 33 ms), contra 16,8 no
  antes, e o Event Timing do toque vai de 32 a 56 ms. O `--ins-adianta` não
  mexe nisso, porque o atraso não é o tempo 0 parado: é o quadro da foto que
  demora. Na peça 5 era o mesmo (53,7). As outras descidas não têm isso: o
  Voltar do sistema na mesma folha anda a 25,1 ms, e o painel de apagar a
  35,3. A diferença deste passo é que ele fecha a folha de cima com outra
  embaixo (duas folhas e dois véus com nome na foto). **Para o coordenador.**
  Arquivos: `repeticoes-peca-6/{antes,peca-6}-{1..5}/06-folhas/medidas-chromium.json`
  (`fecha-x`: `linhaDoTempo`, `quadrosDaPagina`, `toque`).
- **No WebKit desta máquina, toda transição custa um quadro longo** (princípios
  1 e 4). O primeiro movimento vem a 38–75 ms do toque nas trocas de camada e
  de aba (medianas: 01 entra 53,8, sai 39,6; 07 47,4, 63,9 e 46,9; 08 62,8 e
  57,1; 13 deixa 67,7; 14 68,6). O maior intervalo de `requestAnimationFrame`
  nesses passos vai a 26–48 ms. O × da folha é o pior: 175,6 ms, com um quadro
  de 118 ms. Os passos sem transição da mesma rodada ficam em 17–23 ms (06
  abre e empilha, 13 abre). Medido no quadro desta máquina, é o mesmo um quadro
  do Chromium, mais longo: a foto tirada em software (09). Não mudou da peça 5
  para a 6, fora o × (107 → 176 ms, sob carga maior). **A conferir no
  aparelho** (1.5, item 6). Arquivos: `repeticoes-peca-6/*/*/medidas-webkit.json`.

### 12.4 O que ficou "a conferir"

- **No WebKit, a tela volta um quadro no fim da transição.** Um quadro
  diferente dos dois vizinhos aparece a +361–435 ms em 13 de 26 passos com
  transição na peça 6, e a +377–437 ms em 12 de 21 na peça 5 (eu não tinha visto, porque o
  princípio 3 só olha o Blink). No Chromium, nenhum. O implementador achou o
  mesmo numa página mínima sem o app (09, decisão 14): é do motor daqui. A
  conferir no aparelho. Arquivos: `depois-{5,6}/*/medidas-webkit.json`
  (`medidasDosQuadros.transitorios`).
- **14 no WebKit: depois do toque no meio, o foco fica no `body`** (princípio
  6). No antes ficava na aba Semana. O segundo toque desce no `html` (as fotos),
  o que tira o foco da aba Corpo, e o clique reenviado à Semana não a foca. Com
  o teclado o caso não existe, e o Safari do iPhone não foca o botão tocado
  (09). Fica registrado, sem reprovação: o leitor de tela não toca no meio de
  uma troca.
- **13 no WebKit, com o dedo pousado em "Encerrar"** (princípio 10): some
  também o anel de foco do título do modo, que o `montar` abriu por programa.
  É da montagem do fluxo. Aberto pelo toque, o título não mostra anel (01
  entra, quadro final).
- **"A tela muda por ~700 ms"** (princípio 8) em 01 sai, 02 entra, 07
  Semana → Agora e 17: é o ponto ao vivo pulsando, ou o relógio do descanso
  contando no 17. A troca acaba nos 350.
- **As sondas do `desempenho-armadilhas.mjs`.** O §1 (`translateX` forçado
  num elemento real) deu o mesmo que na peça 5: no modo forçado, a janela ainda
  rola 160 px de lado. Isso só vale se uma peça futura mover um elemento real;
  o carrossel move fotos. A sonda crua de View Transition (§5) agora acaba em
  erro de página das duas transições dela, que o app pula ou substitui ("Transition
  was skipped" no Chromium, "Old view transition aborted" no WebKit). Os erros
  são da sonda: nos fluxos, zero. Arquivos: `depois-6/complementos/armadilhas-*.json`.

**Conclusão: a peça 6 passa na linha dela, e dos itens da peça 5 só um não
passou.** O carrossel desliza a página inteira em 350 ms na `--ins-curva`, com o
fio junto e a barra parada. Nada fica mais largo que a janela, a aba tocada no
meio vence, e sob "Reduzir movimento" só esmaece. No Chromium, toda troca anda
agora no quadro seguinte ao do antes, o que o dono aceitou. O foco não cai mais
no `body`, e o cronômetro desce com a camada em vez de saltar 52 px. O painel de
apagar desce. Reprova uma coisa: fechar pelo × a folha de cima, com outra
embaixo, ainda leva dois quadros, por um quadro longo que o adiantamento não
cobre. O WebKit desta máquina segue a conferir no aparelho: os quadros longos
da foto em software e o quadro que volta no fim.

---

## 13. Depois da peça 7

Conferida em 20/10 pela linha da peça 7 da tabela 1.4, contra o build congelado
em `docs/motion/_medicao/shots/dist-peca-7/` (commit `d6199eb`), servido na
porta 4728, com o antes na 4727. As duas estão desligadas. O registro é o mesmo
`antes/registro.json`. A gravação foi das 13h40 às 13h56, com carga de 0,7 a 3,0
(`carga-20-10.txt`, linhas "peça 7"). O implementador da peça 8 trabalhava em
paralelo; as medidas de tempo vêm de antes e peça 7 **intercalados** três vezes
(1.5, 5c).

**O que se gravou.** O fluxo 10 (o aviso chega, troca de texto, some) no
Chromium e no WebKit, com e sem "Reduzir movimento" (`depois-7/`). Antes e peça
7 intercalados três vezes por motor (`repeticoes-peca-7/`). Os complementos, dos
dois lados e nas quatro rodadas onde cabe (`depois-7/complementos/`, com o antes
em `depois-7/complementos/aviso/antes/` e em `antes-complementos/`):
`revisor-aviso-passo.mjs`, com o descanso ligado e desligado no meio da entrada
do aviso; `revisor-regiao-viva.mjs`, novo, para a árvore de acessibilidade;
`revisor-aviso-tempo.mjs`, novo, para o tempo pelo texto; e `acesso-foco.mjs`.
Nenhum erro de página. Comparador em `comparacao-7/`.

**Dois ajustes na medida.**

1. *O passo `some` do fluxo 10.* O `#toast` não fica mais `display: none`. O
   zero do passo passou a ser o começo da saída: no antes, o `#toast` some; na
   peça 7, a mensagem (`#toast > .aviso`) ganha `.sai` e começa a apagar.
2. *O princípio 1 não vale para passo de espera.* Ninguém toca: o "atraso" de
   +16 ms do `some` era só onde o zero cai (o começo da saída em vez do fim). O
   comparador deixou de cobrar esse passo.

### 13.1 A linha da peça 7: o que passou

| o que a peça tinha de provar | resultado | o número | arquivo |
|---|---|---|---|
| **o aviso sobe 8 px e acende em 160 ms** | **passa** | `ins-chega-aviso` no `div.aviso`, **160 ms**, `cubic-bezier(0.2, 0.8, 0.2, 1)` (a `--ins-curva`), nos dois motores. A mensagem nasce 8 px abaixo (y 847,3 → 839,3) com opacidade 0 e chega a 0,41, 0,70, 0,84, 0,91… nos quadros seguintes. A mudança se espalha por 31–38 quadros (no antes, o aviso aparecia num quadro) | `depois-7/10-toast/medidas-*.json` (`chega`: `animacoes`); `depois-7/complementos/aviso/peca-7/aviso-passo-*.json` (`trilhasNoMeio.entra`) |
| **o texto novo refaz a entrada** | **passa** | "Pausar" com o aviso na tela: um nó novo, "Treino pausado. O relógio parou.", com a mesma entrada de 160 ms; 11–13 quadros com mudança (no antes, a troca de texto num quadro só) | `depois-7/10-toast/medidas-*.json` (`troca`) |
| **o mesmo texto não refaz** | **passa** | o mesmo "Ajuste salvo." de novo: continua uma mensagem só | `depois-7/complementos/regiao-viva-*.json` ("o mesmo texto de novo": `mensagens` 1) |
| **sai só apagando, em 160 ms** | **passa** | `ins-apaga`, 160 ms, no `.aviso.sai`: opacidade 1 → 0,59 → 0,30 → 0,16 → … → 0 em ~133 ms, **sem sair do lugar** (y 839,3 em todos os quadros), e o nó sai da página no fim. No fluxo 10, 8–12 quadros com mudança em 110–116 ms (no antes, um quadro) | `aviso-passo-{chromium,webkit}.json` (`saida`); `depois-7/10-toast/medidas-*.json` (`some`) |
| **fica o tempo do texto** | **passa** | do `toast()` ao começo da saída: 13 caracteres **3,6 s**; 50, **4,35 s**; 101, **7,75 s**; 140, **8,01 s** — a regra (1 s + 15 caracteres por segundo, de 3,6 a 8 s) a ±15 ms, nos dois motores. No antes, 3,61 s para qualquer tamanho | `depois-7/complementos/aviso-tempo-{chromium,webkit}.json` contra `antes-complementos/aviso-tempo-chromium.json` |
| **no modo, o aviso não flutua** | **passa** (desde a peça 3) | y 839–882, no fundo; no antes, 787–830 | `depois-7/10-toast/medidas-*.json` (`depois.fixos.toast`) |
| **o cronômetro no meio da entrada não faz o aviso saltar** | **passa** | o cronômetro entra 40 ms depois de o aviso chegar: o maior passo da mensagem por quadro é **16,1 px** no Chromium e **15,4** no WebKit; saindo, 15,8 e 15,3. A mensagem sobe os 8 px dela enquanto o lugar anda com o cronômetro (839 → 757). No antes, **82 px num quadro** nos dois casos | `depois-7/complementos/aviso/{antes,peca-7}/aviso-passo-{chromium,webkit}.json` (`cronometroEntraNoMeio`, `cronometroSaiNoMeio`) |
| **sob "Reduzir": só acende, em 120 ms, e sai de uma vez** | **passa** | `ins-esmaece`, só opacidade, **120 ms**, também no texto novo (opacidade 0 → 0,53 → 0,80 → 0,91); a saída não tem quadro nenhum de apagar. Com o cronômetro, o aviso vai junto de uma vez (82 px num quadro), como decidido na peça 3 | `depois-7/10-toast/medidas-*-reduz.json`; `aviso-passo-*-reduz.json`; princípio 5: 6/6 |
| **a região viva nunca sai da árvore** (05 M12) | **passa** | sem aviso, o `#toast` fica `display: block`, vazio, e está na árvore: no Chromium o nó `status` **não é ignorado** (no antes, ignorado, `notRendered`); o Playwright vê a região `- status` nos dois motores (no antes, não). Depois que o aviso some, a região fica **vazia** (no antes, escondida com o texto velho dentro). Vazia, ela tem altura 0 e não pega toque. `acesso-foco.mjs`: `displayEscondido` `none` → `block`, e o resto (foco, isolamento) igual ao da peça 5 | `depois-7/complementos/regiao-viva-{chromium,webkit}.json` contra `antes-complementos/regiao-viva-*.json`; `depois-7/complementos/acesso/acesso-foco.json` |
| **o toque não ficou mais lento** (5c) | **passa** | medianas de três, antes → peça 7: a primeira mudança no mesmo quadro (Chromium: "Iniciar treino" 16,9 → 17,5 ms, "Pausar" 15,5 → 16,8; WebKit 1,1 → 3,1 e 6,7 → 17); trabalho no toque 2,8 → 4,1 e 4,3 → 3,2 ms no Chromium, 4 → 8 e 7 → 9 no WebKit, dentro do limite; nenhum intervalo de `requestAnimationFrame` acima do limite | `repeticoes-peca-7/{antes,peca-7}-{1,2,3}/10-toast/` |
| princípios 2, 3, 4, 6, 7, 8 | **passa** | 12/12, 6/6, 6/6, 12/12, 6/6, 6/6 | `comparacao-7/protocolo.json` |

### 13.2 O que ficou "a conferir"

- **No WebKit, com o dedo pousado em "Iniciar treino"** (princípio 10): some
  também o anel de foco do título do modo, que o `montar` abriu por programa. É
  a mesma montagem do 13 na peça 6 (12.4), não o toque.
- **A foto velha do aviso escondida na troca de camada** (09, peça 7, decisão
  5): nenhum fluxo desta peça tem um aviso na tela durante uma troca. O fluxo 17
  (o cronômetro na troca) pode ganhar um aviso na rodada final.

**Conclusão: a peça 7 passa na linha dela, sem nenhuma reprovação.** O aviso sobe
8 px e acende em 160 ms. O texto novo refaz a entrada e o mesmo texto não. Ele
sai só apagando, no lugar, e fica o tempo de ler: de 3,6 a 8 s pelo tamanho do
texto. Com o cronômetro entrando ou saindo no meio da entrada, a mensagem anda
no máximo 16 px por quadro, onde antes saltava 82. Sob "Reduzir movimento" só
acende e sai de uma vez. E a região viva fica sempre na árvore de
acessibilidade, vazia quando não há aviso.
