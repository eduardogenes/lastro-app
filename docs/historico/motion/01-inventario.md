# 01 · Inventário do movimento

Auditor de movimento, fase 1 (só leitura). Leitura feita no commit `a22b09d`
(15/10/2026). Toda linha citada foi conferida nesse commit; o comportamento foi
conferido no `dist/` construído dele, em Chromium a 414 × 896 ×2 (`isMobile`,
`hasTouch`), com três scripts em `docs/motion/_medicao/` (seção "Medições", no
fim).

**O que conta como movimento aqui:** algo que muda ao longo do tempo na tela
sem o dedo estar movendo (transição, animação, rolagem suave). O que troca de
um quadro para o outro é "estalo"; o que acompanha o dedo é "manipulação
direta". As três coisas estão inventariadas, separadas.

---

## Em números

| pergunta | resposta |
|---|---|
| Quantos movimentos existem | **7.** Dentro do app, **4**: o indicador de aba, a barra do cronômetro, o pulso do ponto ao vivo e o clarão da câmera. Na bancada do computador, **3**: o pouso do aparelho, o painel e as réguas pousando, a virada. |
| Quantos animam layout | **1**: o indicador de aba anima `left` (`src/componentes.css:270`). Fora da contagem, uma manipulação direta também move layout a cada toque: a divisa da cortina do Comparar, em `left` (`src/ui/telas/comparar.jsx:97`). |
| Quantos escapam do movimento reduzido | **0 de 7.** O portão é um só (`src/base.css:374-380`) e pega transição e animação por curinga; conferido no navegador. Sob `reduce`, a barra do cronômetro vira degraus de 250 ms (decisão escrita) e o clarão some. |
| Rolagens programáticas | **21 pontos**, **todos instantâneos**. Não existe hoje nenhuma rolagem suave: a que o `DESIGN.md` lista foi removida em `926a549` (13/10). |
| Movimento por JavaScript | **Nenhum.** Zero `.animate()`, zero `requestAnimationFrame` do app (os 4 do pacote são do agendador de efeitos do Preact), zero `scroll-behavior`. |
| Tokens de movimento usados | `--ins-dur` e `--ins-ease`: **um** consumidor (`src/componentes.css:270`). `--ins-dur-toque`: **zero**. As outras seis durações são número solto. |
| Mudanças de estado de estalo onde se perde o fio | **30** nomeadas na Parte B. |

---

## A doutrina escrita contra o código

O que os documentos dizem que existe e o código não tem, ou o contrário. Cada
linha foi conferida.

| # | o documento diz | onde | o código, hoje |
|---|---|---|---|
| D1 | "Quatro" movimentos, o quarto é a rolagem suave de `levaAsSessoesDoDia` | `DESIGN.md:255-258` | A função e o `'smooth'` saíram em `926a549` (13/10, "o mês e o dia aberto"). `grep smooth` em `src/` e no `dist/` devolve zero. **Hoje são três no app, mais o clarão.** |
| D2 | "As transições morrem pelo curinga de `base.css` e `componentes.css` … o pulso morre por seletor … um `@keyframes` novo **não** morre sozinho" | `DESIGN.md:275-279` | Falso desde 11/10 (`docs/redesign/10-tokens.md` §14.1). O portão é um só, `src/base.css:374-380`, e desliga `animation` e `transition` em `*, *::before, *::after` com `!important`. `componentes.css` só tem o bloco do clarão (`:1803`). Cobrado por `tests/dominio/estilo.test.ts:1144`. |
| D3 | "O portão é por ADESÃO — todo movimento mora dentro de `@media (prefers-reduced-motion: no-preference)` —, porque assim ele falha fechado" | `src/tokens.css:59-65` | Não existe nenhum `no-preference` em `src/`. O portão é por **exclusão** (`reduce` desliga). Funciona porque o curinga pega tudo que é CSS; um movimento feito por JS (`.animate()`, rolagem suave) escaparia, e hoje não há nenhum. |
| D4 | A folha "caiu" da proibição de entrada animada em 06/10 (decisão 14) **e**, oito parágrafos depois, a folha subir está na lista do "considerado e recusado" | `DESIGN.md:62-68` × `DESIGN.md:286-292` | O documento se contradiz. **O código não tem a subida:** `.ins-folha` (`src/componentes.css:203-215`) e `.ins-folha-w` (`:151`) sem `transition` nem `animation`; nenhum commit a escreveu (`git log -G "translateY\(100%\)"` vazio). Conferido no navegador: zero animações ao abrir; o véu nasce com opacidade 1. A decisão está em `docs/redesign/09-frente4-sistema.md:2314` (240 ms, `--ins-ease`, véu com *fade* de 200 ms). |
| D5 | `--ins-dur-toque: 120ms`, "o toque que afunda … é o único movimento que o dono tocou e aprovou" | `src/tokens.css:421-423` | **Nenhum consumidor.** Nenhuma das 21 regras `:active` usa `transform` ou `transition`. O "toque que afunda" (`scale(.95)` do protótipo, `09-frente4-sistema.md:2037`) não existe no app. |
| D6 | "`voa()` anima o valor até a tabela" (a confirmação visual da série) | `index.html:60-62`, `src/main.jsx:5251` | `voa()` **nunca existiu** em `src/`: `git log -S "voa("` só acha o commit que escreveu o comentário (`23e773e`). Era do protótipo (`09-frente4-sistema.md:2043`). A confirmação visual da série é o número aparecer na linha, de estalo. |
| D7 | O clarão do disparo | `DESIGN.md` §Movimento | Existe (`src/componentes.css:1801-1803`, commit `e07535c`) e **não está na tabela**. |
| D8 | "o disparo é obturador, clarão e o bloco da pose fechando" | commit `e07535c` | "Fechando" é troca de cor instantânea (`.cam-bloco.feita`, `src/componentes.css:1798`). |
| D9 | Linhas citadas em `docs/design-review/05-movimento.md` (`componentes.css:1399-1405`, `base.css:303-314`, `main.jsx:4223`, `:4265`, `:3477`) | — | Mudaram com o redesenho de 14/10: hoje `componentes.css:1184-1190`, `base.css:352-380`, `main.jsx:6742`, `:6804`, `:5037-5044`. Os argumentos continuam legíveis; as linhas não. |

**A tabela do `DESIGN.md` §Movimento, contada:** lista 4; existem 3 dos 4, mais
1 que ela não lista (o clarão). Os 3 da bancada estão listados à parte, na
seção da bancada (`DESIGN.md:234`), e conferem.

---

## Parte A — tudo o que se move hoje

Legenda da coluna **função**: *de onde veio* · *para onde foi* · *o que mudou* ·
*toque aceito* · *tela viva* · *nenhuma*. **LAYOUT** marca propriedade que não é
`transform` nem `opacity`.

### A.1 · Transições CSS (2)

| # | onde | o que se move | propriedade | duração e curva | gatilho | função | movimento reduzido |
|---|---|---|---|---|---|---|---|
| 1 | `src/componentes.css:267-271`; posição escrita em `src/ui/instrumento/tabbar.jsx:72` | o fio de 2 px da aba acesa | `left` — **LAYOUT** | 220 ms, `cubic-bezier(.2,.8,.2,1)` — **tokens** `--ins-dur`, `--ins-ease` (`src/tokens.css:419-420`) | tocar numa aba (`CTX.vaiPara`, `src/main.jsx:2578`) | *para onde foi* | morre pelo curinga (`src/base.css:378`); conferido: `transition: none` |
| 2 | `src/componentes.css:1187-1190`; escala escrita em `src/main.jsx:6804` | a barra do descanso | `transform: scaleX` | 250 ms `linear` — **número solto** (é o período de `pintaTimer`) | `setInterval(pintaTimer, 250)` (`src/main.jsx:6742`, `:6762`, `:6791`, `:6927`); também ao somar ou tirar 15 s (`ajustaTimer`, `:6776`), quando a barra salta e a transição a leva | *tela viva* (interpola uma grandeza contínua) | morre pelo curinga; conferido: `transition: none`, zero animações; vira degraus de 250 ms, decisão em `DESIGN.md:281-284` |

**O indicador não anda sempre que a aba muda.** Ele só transiciona se a tab bar
já estava na tela. Ao sair de uma tela cheia ela **renasce** (conferido: nó
novo, zero animações), então `vaiPara` vindo do modo de sessão ou dos Ajustes
(`src/main.jsx:2592-2593`) troca de aba sem o fio andar.

### A.2 · Animações por `@keyframes` (4 regras, 5 usos)

| # | onde | o que se move | propriedade | duração e curva | gatilho | função | movimento reduzido |
|---|---|---|---|---|---|---|---|
| 3 | `@keyframes ins-pulse` `src/base.css:352`; `.ins-live-dot` `:354-358` | o ponto verde do cartão de cima do Agora (`src/ui/instrumento/primitivos.jsx:240`, **em todo cartão**, qualquer que seja o assunto) e o do relógio da sessão (`src/ui/telas/treino.jsx:75`, se não pausada) | `opacity` 1 → .25 → 1 | 2,4 s, infinito, curva padrão (`ease`) — **número solto** | montar o elemento | *tela viva* | curinga: duração .01 ms, 1 iteração (`src/base.css:376-377`); conferido: para em opacidade 1 |
| 4 | `.cam-clarao` + `@keyframes` `src/componentes.css:1801-1802`; montado por `clarao()` `src/main.jsx:12083-12086`, chamado em `:12190` | um véu branco sobre o quadro da câmera | `opacity` .9 → 0 | 320 ms `ease-out` — **número solto**; o nó sai por `setTimeout` de 320 ms (`:12086`) | o disparo (`capturaAgora`, `:12149`) | *toque aceito* | bloco próprio (`src/componentes.css:1803`: 1 ms, opacidade 0) **e** curinga: o clarão vira invisível; o som do obturador continua |
| 5 | `@keyframes pl-pousa` `src/palco.css:458-461`; `.pl-pousa` `:471` | o aparelho da bancada, na abertura | `opacity` 0→1 e `transform` `translateY(18px) scale(.985)` → nada | 520 ms `cubic-bezier(.16,1,.3,1)` — número solto (a bancada não usa `--ins-*` por regra) | `src/palco.js:275`, uma vez | *de onde veio* ("chegou") | `src/palco.js:207`/`:275` não liga a classe; `src/palco.css:476-477`; curinga |
| 6 | `.pl-painel, .pl-regua` `src/palco.css:474` (mesmo `pl-pousa`) | o painel lateral e as duas réguas da bancada | idem | 420 ms, 140 ms de atraso | sempre que a bancada monta (classe fixa) | *de onde veio* | `src/palco.css:477` (`animation: none`) e curinga |
| 7 | `@keyframes pl-vira` `src/palco.css:466-469`; `.pl-vira` `:472`; reinício em `assenta` `src/palco.js:308-314` (com `offsetWidth` para reiniciar) | o aparelho girando | `opacity` .35→1 e `transform` `rotate(±5deg) scale(.955)` | 300 ms `cubic-bezier(.16,1,.3,1)` | girar ou trocar de aparelho (`src/palco.js:279-292`; atalho alt+r `:267`) | *o que mudou* ("virou") | `src/palco.js:309` retorna antes; CSS e curinga |

A bancada lê a preferência **uma vez** (`src/palco.js:207`); se ela mudar com a
página aberta, o JS não sabe, mas o CSS do curinga ainda pega.

### A.3 · Transform visual e o toque (`:active`): nada anima

- **O toque não tem movimento.** São **21** regras `:active`, todas troca
  instantânea de fundo, cor ou opacidade, nenhuma com `transform` nem
  `transition`: `src/base.css:293`, `:301`, `:310`, `:344`; `src/treino.css:179`,
  `:248`, `:293`, `:340`, `:367`, `:384`, `:574`, `:584`, `:705`, `:706`;
  `src/componentes.css:427`, `:607`, `:1450` (régua), `:1515` (teclado);
  `src/protocolo.css:148` (`opacity: .6`), `:153` (cursor), `:204`.
- **O realce nativo do iOS está desligado** (`-webkit-tap-highlight-color:
  transparent`, `src/base.css:76`, `:129`; `src/treino.css:34`), com o
  comentário "o estado ativo é desenhado por nós" (`src/base.css:128`). **A
  confirmar no WebKit de iPhone:** o app não registra nenhum `touchstart`
  (`grep` em `src/` e `index.html`: zero), e no Safari de iOS o `:active` é
  conhecido por não pintar no toque sem um. Se for o caso, no aparelho do dono
  o toque não tem retorno visual nenhum até a tela mudar. Medido só pela
  leitura; o Chromium do Playwright não reproduz o comportamento de iOS.
- **Transform estático, sem animação** (centrar ou desenhar, nunca mover):
  `#toast`, `#timer`, `.ins-faixa` em `translateX(-50%)`
  (`src/componentes.css:1119`, `:1136`, `:1151`); `src/protocolo.css:31`;
  `src/treino.css:255`, `:328`; a escala da bancada `src/palco.css:185`; o
  enquadramento das fotos `src/ui/instrumento/fotoajustada.jsx:38`.
- `will-change`: nenhum em `src/`.

### A.4 · Manipulação direta (o que acompanha o dedo)

Não é animação, mas é a tela se movendo sob o dedo, e cada passo é um
`render()` da árvore inteira.

| onde | o que se move | propriedade | caminho |
|---|---|---|---|
| Ajustar a foto: arrastar o quadro, `src/ui/telas/ajustefoto.jsx:47-58`, `:73-74` | a foto dentro do quadro 3:4 | `transform` (`src/dominio/enquadramento.ts:122`) | cada `pointermove` → `CTX.arrastaAjuste` (`src/main.jsx:11922-11925`) → `render()` |
| Ajustar a foto: zoom e giro, `src/ui/telas/ajustefoto.jsx:33-37` | idem | `transform` | `onInput` → `render()` |
| A cortina do Comparar, `src/ui/telas/comparar.jsx:95-97`, `:104-107` | a foto de cima recortada e a divisa | `clip-path` (pintura) e **`left` da divisa — LAYOUT** | `onInput` → `CTX.setCorte` (`src/main.jsx:10667`) → `render()` |
| Mistura das duas datas: `src/ui/telas/comparar.jsx:118`, `src/ui/telas/camera.jsx:81`, `src/ui/telas/ajustefoto.jsx:80` | a foto sobreposta | `opacity` | `onInput` → `render()` (`src/main.jsx:10668`, `:12032`) |

### A.5 · Rolagem programática: 21 pontos, todos instantâneos

Nenhum usa `smooth`; nenhum CSS declara `scroll-behavior`. Toda rolagem do app
é salto.

| o que faz | onde | comportamento |
|---|---|---|
| Ir ao topo depois de desenhar (15 pontos) | `src/main.jsx:652` (`iniciarSessao`), `:1152` (`finalizarSessao`), `:1205` (`encerraDeVerdade`), `:2602` (`vaiPara`, trocar de aba), `:2931` (`modoEdicao`), `:3552` (`modoPrograma`), `:4278` (`detalhaLancamento`), `:4289` (`concluirRetro`), `:5028` (`go`, trocar o dia do treino), `:6170` (`apagaRegistroDeTreino`), `:10326` (`comecaSessaoDeFotos`), `:10327` (`vaiParaPose`), `:10422` (`tiraFotoDoCorpo`), `:11384` (`encerraSessaoEsquecida`), `:11401` (`voltaAoTreino`) | `scrollTo(0, 0)`: salto |
| Entrar num destino de tela cheia guarda a rolagem e vai ao topo | `entraNoDestino`, `src/main.jsx:11837-11840`; chamado em `:3549`, `:3575`, `:3865`, `:4153`, `:6475`, `:6542`, `:9108`, `:10319`, `:10583`, `:10595`, `:10604`, `:11559`, `:11575`, `:11896`, `:12013` | salto. Conferido: entrar no modo de sessão leva de y=300 a y=0 |
| Sair do destino devolve a rolagem | `saiDoDestino`, `src/main.jsx:11845-11851` | `behavior: 'instant'`, de propósito ("suave faz a página deslizar sozinha depois que o destino já sumiu, e parece bug"). Conferido: sair do modo volta a y=300 |
| A trava da folha | `trava`/`destrava`, `src/ui/instrumento/folha.jsx:26-41`; `body.ins-travado` `src/base.css:113` | o corpo fica `position: fixed` com `top` negativo; ao destravar, `instant`, com o mesmo motivo |
| Trazer o exercício aberto para a tela | `mostraExercicio`, `src/main.jsx:5041-5044`; chamado em `:5058` (`toggle`), `:5337` (`avancaExercicio`), `:11400` (`voltaAoTreino`); para em `scroll-margin-top` `src/treino.css:25` | `instant`, com o argumento "o sistema tem exatamente dois movimentos" (`:5037-5038`). Conferido: abrir o 1º exercício salta de 0 a 363 |
| "Ver a força" na Semana | `src/ui/telas/semana.jsx:139-142` | `scrollIntoView` sem `behavior` num `setTimeout(0)`: salto |
| **Abrir o teclado próprio rola a página** | `src/ui/instrumento/teclado.jsx:59`: `focus()` **sem** `preventScroll` | não declarado em lugar nenhum. Conferido: abrir o teclado da carga com a página no topo salta para y=178, porque o navegador traz o painel em foco para a vista. É o único foco do app que rola (os de `TelaCheia` e `Folha` usam `preventScroll`) |
| Copiar o JSON à moda antiga | `legacyCopy`, `src/main.jsx:4864-4866` | `focus()` sem `preventScroll` num `<textarea>`: pode saltar (caminho raro) |
| Restauração do navegador | `src/ui/navegacao.js:156` | desligada (`manual`); o app devolve a rolagem sozinho |
| Trocar de mês em Dias **não** rola | `mudaMes`, `src/main.jsx:4084-4102` | declarado de propósito; conferido y=0 → y=0 |

Complementares, não rolagem: `overscroll-behavior: none` em `html, body`
(`src/base.css:67`) e `contain` no corpo da folha (`src/componentes.css:239`).

### A.6 · Foco programático e `:focus-visible`

Nenhum anel de foco anima. Os focos programáticos:

| onde | para onde vai | rola? |
|---|---|---|
| `src/ui/instrumento/telacheia.jsx:22-24` | o `h1` do destino, ao montar | não (`preventScroll`) |
| `src/ui/instrumento/folha.jsx:104-116` | a própria folha; ao fechar, volta ao acionador | não (`preventScroll`) |
| `src/ui/instrumento/teclado.jsx:59` | a raiz do teclado | **sim** (ver A.5) |
| `src/ui/instrumento/pare.jsx:30-32` | "Deixar como está" | não na prática: o painel é fixo (`src/componentes.css:158`) |
| `src/ui/instrumento/pare.jsx:71-73` | "Tentar de novo" do aviso de falha | idem |
| `src/main.jsx:3238` (`buscaEx`) | devolve o foco ao campo de busca | não (o campo já estava em foco) |
| `src/main.jsx:4866` (`legacyCopy`) | o `<textarea>` do JSON | pode |

Estilos de foco, todos instantâneos: `src/base.css:154-185` (campos e o anel
de todo controle, tokens `--ins-foco*` em `src/tokens.css:408-412`);
`src/componentes.css:616-617`, `:858`, `:1015`, `:1484-1485`;
`src/treino.css:319`, `:491`; `src/palco.css:445`.

### A.7 · As camadas: tudo aparece e some de estalo

Conferido no navegador: abrir e fechar cada uma destas não cria nenhuma
animação (`document.getAnimations()` vazio, fora o pulso que já estava rodando).

| camada | como aparece | onde |
|---|---|---|
| Toast | `display: none` ↔ `block`; some por `setTimeout` de 3.600 ms | `src/componentes.css:1118-1126`; `src/main.jsx:5002-5010`; `index.html:58` (fora do Preact) |
| Folha e véu | o componente monta e desmonta; véu opaco no primeiro quadro | `src/ui/instrumento/folha.jsx:137-159`; `src/componentes.css:151`, `:201`, `:203-215`; pilha em `src/main.jsx:8530-8543` |
| Tela cheia (14 destinos) | a casca troca de ramo inteiro | `src/ui/app.jsx:49`; ordem em `src/main.jsx:2869-2893` |
| Painel de pare e aviso de falha | montam no fim da árvore; "Aparece sem animação (frente 4)" | `src/ui/instrumento/pare.jsx:18-19`, `:28-48`, `:69-94`; `src/componentes.css:158-183` |
| Faixa "Não guardado" | monta no topo, fixa | `src/ui/instrumento/pare.jsx:101-108`; `src/componentes.css:184-200` |
| Cronômetro | `display: none` ↔ `flex` | `src/componentes.css:1135-1143`; `src/main.jsx:6757`, `:6856` (fora do Preact, `index.html:88-97`) |
| Faixa da sessão | monta; vira pergunta pela batida de 30 s | `src/ui/instrumento/faixasessao.jsx:22-28`; `src/main.jsx:726-744` |
| Toast, faixa e fim de página se reacomodando | quando o cronômetro entra ou sai, `--ins-timer-h` muda (`alturaDoTimer`, `src/main.jsx:6702-6706`) e quem está acima **salta** de altura | `src/componentes.css:1120`, `:1150` |
| Tab bar com o teclado do sistema | `display: none` enquanto há campo em foco | `src/componentes.css:257`; `src/ui/instrumento/tabbar.jsx:48-62`, `:69` |
| "Gire o telefone" | `display: none` ↔ `flex` por media query | `src/base.css:395-409`; `index.html:76-81` |

### A.8 · Régua, teclado, RIR, cronômetro, câmera

- **Régua** (`src/ui/instrumento/regua.jsx`): abre embaixo da linha por
  renderização condicional (`src/ui/exercicio.jsx:521-531`), fecha na escolha
  (`poeRep`, `src/main.jsx:5743-5749`). As setas trocam a janela inteira de
  números: os botões são chaveados pelo valor (`regua.jsx:69`), então andar
  troca nós. Nenhum movimento; `touch-action: pan-y` declarado
  (`src/componentes.css:1435`).
- **Teclado próprio** (`src/ui/instrumento/teclado.jsx`): sem movimento; o
  cursor é retângulo estático por decisão (`teclado.jsx:33-38`,
  `src/componentes.css:1498-1503`, cobrado por `tests/dominio/estilo.test.ts:635-645`).
  O único efeito móvel é o salto de rolagem do foco (A.5).
- **Escala de RIR**: abre e fecha por renderização condicional
  (`src/ui/exercicio.jsx:543`; `abreRir`/`poeRir` `src/main.jsx:5868`, `:5874`).
- **Cronômetro**: a barra (#2) é o único movimento. O número `#tval` troca de
  texto 4× por segundo (`src/main.jsx:6818-6819`); o "vai" do fim muda a cor
  de estalo (`:6806-6808`, `src/componentes.css:1182`).
- **Câmera**: o clarão (#4) é o único movimento. A contagem troca o número a
  cada segundo (`contaEDispara`, `src/main.jsx:12051-12060`); os nove blocos
  trocam de cor de estalo (`src/componentes.css:1796-1800`); o "↻ gire 90°" é
  texto (`src/ui/telas/camera.jsx:73`).

### A.9 · Relógios e temporizadores que mudam a tela

Nenhum anima; todos trocam texto ou estado de estalo.

| intervalo | o que muda | onde |
|---|---|---|
| 250 ms | número e barra do descanso | `src/main.jsx:6742`, `:6762`, `:6791`, `:6927` |
| 1 s | relógio da sessão e hora do modo, fora do Preact | `tickRelogio` e `ajustaRelogio`, `src/main.jsx:2103-2124` |
| 1 s | hora do cabeçalho do Agora | `useAgora`, `src/ui/instrumento/primitivos.jsx:283-291` |
| 1 s | contagem da câmera | `src/main.jsx:12059` |
| 30 s | a faixa da sessão vira pergunta; fecha a sessão esquecida | `ligaBatida`, `src/main.jsx:726-744` |
| 3,6 s | o toast some | `src/main.jsx:5009` |
| 320 ms | o clarão sai da árvore | `src/main.jsx:12086` |
| 0 ms | "ver a força" rola | `src/ui/telas/semana.jsx:141` |
| até o minuto | relógio de sistema da bancada | `src/palco.js:461` |

---

## Parte B — o que deveria se mover e não se move

Mudanças de estado que hoje acontecem de estalo e em que a pessoa pode perder o
fio. Não é desenho de movimento: é a lacuna, com a prova. **Explicação** é qual
das quatro do dono o movimento daria (*de onde veio*, *para onde foi*, *o que
mudou*, *toque aceito*). **Frequência**: *por série* (dezenas por sessão; a
régua é tocada 48 vezes por semana, `src/tokens.css:421-422`), *por sessão*
(algumas por treino), *por dia*, *rara*.

### B.1 · No treino

| # | a mudança | onde acontece | hoje | explicação | frequência |
|---|---|---|---|---|---|
| B1 | **Série gravada pela régua**: a régua some, o número aparece na linha, o cronômetro nasce embaixo | `poeRep` `src/main.jsx:5743-5749` → `anotaSerie` `:5098` → `autoTimer` `:5283-5310` → `startTimer` `:6751-6763` | tudo no mesmo quadro; o comentário que dizia que `voa()` levava o valor até a tabela é falso (D6) | *toque aceito* e *o que mudou* | por série |
| B2 | **O app abre sozinho o próximo exercício** e rola até ele, depois da última série | `avancaExercicio` `src/main.jsx:5328-5338` → `mostraExercicio` `:5041-5044` | o cartão feito fecha (`display: none`, `src/treino.css:97-98`), o próximo abre e a página salta, sem o dedo ter pedido | *para onde foi* — é a única troca de lugar que acontece **sem toque** | por exercício (6–8 por sessão) |
| B3 | Abrir e fechar o cartão de um exercício | `toggle` `src/main.jsx:5045-5059`; `src/ui/exercicio.jsx:407` | `display: none` ↔ `block` e salto de rolagem (medido 0 → 363) | *de onde veio* | por sessão |
| B4 | O cronômetro entra e sai, e o que está acima dele pula | `startTimer` `src/main.jsx:6757`, `stopTimer` `:6847-6858`, `alturaDoTimer` `:6702-6706` | `display` ↔; toast e faixa saltam pela altura `--ins-timer-h` | *de onde veio* e *o que mudou* | por série |
| B5 | Fim do descanso: "0:01" vira "vai" em verde | `pintaTimer` `src/main.jsx:6806-6815` | troca de texto e cor; o canal escrito é o som (`aviso()`, `:6814`) | *o que mudou* — com o argumento de pé de `05-movimento.md` §2: no fim do descanso ele não está olhando | por série |
| B6 | Abrir o teclado próprio | `abreTecladoDeCarga` `src/main.jsx:5823`; `src/ui/instrumento/teclado.jsx:59` | o painel nasce e a página **salta 178 px** sem explicação (A.5) | *de onde veio* | por sessão |
| B7 | Andar a janela da régua (‹ ›) | `andaRegua` `src/main.jsx:5712`; `src/ui/instrumento/regua.jsx:57-66` | os números trocam todos de uma vez; nada diz para que lado | *para onde foi* | rara (a régua já abre na vizinhança certa) |
| B8 | Escala de RIR: abre, grava, fecha | `abreRir`/`poeRir` `src/main.jsx:5868-5889`; `src/ui/exercicio.jsx:543` | renderização condicional | *toque aceito* | por série, quando há RIR |
| B9 | **Entrar e sair do modo de sessão** | `abreModo` `src/main.jsx:11556-11561`, `CTX.fechaModoDeSessao` `:11830-11835`; `CTX.voltaAoTreino` `:11390-11401`; `src/ui/app.jsx:49` | a casca troca inteira, a rolagem salta para 0 e volta; a tab bar renasce e o fio não anda | *de onde veio* e *para onde foi* | por sessão (entrar, ir à comida ou à água, voltar) |
| B10 | "+ série": linha nova e régua aberta nela | `maisUmaSerie` `src/main.jsx:2951`; `src/ui/exercicio.jsx:550-554` | renderização condicional | *o que mudou* | rara |
| B11 | Pular e desfazer o pulo | `pularEx` `src/main.jsx:1101`; `.ex.pulado .sets` `src/treino.css:99`; `src/ui/exercicio.jsx:468-477` | as séries somem de estalo e nasce o aviso de pulado | *o que mudou* | rara |
| B12 | Trocar o exercício (substituir) | `toggleSwap`/`setAlt` `src/main.jsx:5890`, `:5904` | o nome do cartão troca no lugar | *o que mudou* | rara |
| B13 | "Gire o telefone" ou as duas colunas do modo deitado | `src/base.css:395-409`; `src/componentes.css:1258-1270` | o layout inteiro troca no giro | *o que mudou* | rara (o telefone vira sozinho no banco, `componentes.css:1252-1256`) |

### B.2 · No resto do dia

| # | a mudança | onde acontece | hoje | explicação | frequência |
|---|---|---|---|---|---|
| B14 | **Trocar de aba** | `CTX.vaiPara` `src/main.jsx:2578-2604`; `src/ui/app.jsx:51-52`, `:79-81` | o conteúdo inteiro renasce de estalo (conferido) e a página salta ao topo; só o fio de 2 px anda (220 ms, `left`) | *para onde foi* | por dia, muitas |
| B15 | **Abrir e fechar uma tela cheia** (14 destinos) | `entraNoDestino`/`saiDoDestino` `src/main.jsx:11837-11851`; `src/ui/app.jsx:49`; moldura `src/ui/instrumento/telacheia.jsx:26-44` | troca de casca inteira; a tab bar some e renasce | *de onde veio* e *para onde foi* | por dia |
| B16 | **Abrir, empilhar e fechar uma folha** | `CTX.abreFolha`/`trocaFolha`/`fechaFolha` `src/main.jsx:8532-8543`; `src/ui/instrumento/folha.jsx:137-159` | véu e folha no primeiro quadro; **a decisão 14 do dono (a folha sobe) não está implementada** (D4) | *de onde veio* (e a profundidade da pilha) | por dia; no treino também (peso no descanso, foto do aparelho, menu da sessão) |
| B17 | **O toast aparece e some** | `toast` `src/main.jsx:5002-5010`; `src/componentes.css:1118-1126` | `display` ↔; some em 3,6 s sem aviso; um toast novo troca o texto no lugar | *o que mudou* (e *toque aceito* quando responde a um toque) | por dia (112 ocorrências de `toast(` em `src/main.jsx`) |
| B18 | Marcar uma refeição na linha do Agora | `CTX.marcaLinhaDaComida` `src/main.jsx:2796`; `marcaRefeicao` `:2703-2723`; `src/ui/telas/agora.jsx:387-400` | a linha fecha e muda de estado; o cartão de cima pode trocar de assunto | *toque aceito* e *o que mudou* | por dia (5–7) |
| B19 | "+1 copo" | `CTX.maisUmCopo` `src/main.jsx:2753-2769`; copos `src/ui/telas/agora.jsx:470-471`; também do descanso (`:2410`) | o número e um copo trocam de estalo; se a gravação falha, voltam de estalo | *toque aceito* | por dia (8–14) |
| B20 | O cartão de cima do Agora troca de assunto | `CTX.cartaoDeCima` → `src/dominio/agora.ts`; `src/ui/telas/agora.jsx:76`, `:302`; `CartaoFoco` `src/ui/instrumento/primitivos.jsx:231` | o mesmo nó recebe outro conteúdo (conferido: nó reaproveitado) | *o que mudou* | por dia |
| B21 | Linha que abre no lugar (comida, linhas expansíveis) | `CTX.abreLinhaDaComida` `src/main.jsx:2786-2790`; `LinhaExpansivel` `src/ui/instrumento/folha.jsx:170-176` | renderização condicional; a lista abaixo salta | *de onde veio* | por dia |
| B22 | Pesar hoje / registrar medida | `CTX.registraPeso` `src/main.jsx:8414` → `addBody` `:4586`; `CTX.registraPesoRapido` `:11821-11827` | número e lista mudam de estalo; a folha do peso rápido some | *toque aceito* e *o que mudou* | por dia |
| B23 | A sincronia traz o que o outro aparelho gravou | `sincroniza` `src/main.jsx:1283`, `render()` em `:1317` e `:1327` | a tela muda sob o dedo, sem nada dizer o quê | *o que mudou* | por dia (toda volta ao app, `:6932`) |
| B24 | A tab bar some e volta com o teclado do sistema | `src/ui/instrumento/tabbar.jsx:48-62`, `:69`; `src/componentes.css:257` | `display: none` ↔ | *o que mudou* | por dia, ao digitar |
| B25 | A faixa da sessão vira pergunta ("continuo treinando / já parei") | `ligaBatida` `src/main.jsx:726-744`; `src/ui/instrumento/faixasessao.jsx` | troca de conteúdo de estalo, numa batida de 30 s, sem toque | *o que mudou* | rara (1h30 parado) |
| B26 | **Item que some de uma lista** depois do pare | `CTX.apagaMedida` `src/main.jsx:8513` (`delBody` `:4788`), `CTX.apagaCardio` `:8514` (`delCardio` `:4044`), `CTX.removeRefeicao` `:8629`, `CTX.removeItem` `:8659`, `CTX.apagaLinha` `:9603` (`apagarSessao` `:3935`) | o item some e o de baixo sobe para o lugar de estalo | *o que mudou* | rara |
| B27 | O painel de pare e o aviso de falha | `src/ui/instrumento/pare.jsx:28-48`, `:69-94` | sem animação **por decisão escrita** (`pare.jsx:18-19`: "um painel que chega animado diz 'apareci'") | *de onde veio* — argumento a enfrentar | rara |
| B28 | Trocar de mês em Dias | `mudaMes` `src/main.jsx:4097-4102`; células `src/ui/telas/dias.jsx:81-83` | as células são **reaproveitadas** (chave = número do dia; conferido 36 de 40 nós) e o conteúdo troca no lugar; nada diz se foi para trás ou para a frente | *para onde foi* | por semana |
| B29 | Os chips treino/comida da Semana | `src/ui/telas/semana.jsx:134`, `:139-142` | metade da tela troca de conteúdo de estalo; "ver a força" ainda salta a página | *o que mudou* e *para onde foi* | por semana |
| B30 | Câmera: a pose fecha e a seguinte entra | `capturaAgora` `src/main.jsx:12149-12195`; blocos `src/ui/telas/camera.jsx:64-68`, `src/componentes.css:1796-1800` | o clarão (320 ms) diz o disparo; o bloco feito troca de cor e o próximo acende de estalo, a três metros | *toque aceito* e *o que mudou* | a cada 14 dias, 9 vezes |

### As cinco lacunas mais importantes

Ordenadas por frequência vezes o risco de perder o fio, no momento em que a
atenção é menor (de pé, entre séries):

1. **B1 · A série gravada.** É o toque mais repetido do app, e a confirmação
   que os comentários dizem existir (`voa()`) não existe. O número aparece na
   linha, a régua some e o cronômetro nasce no mesmo quadro; somado à dúvida do
   `:active` no iPhone (A.3), o toque pode não ter retorno nenhum além da troca
   de tela.
2. **B2 · O app troca de exercício sozinho.** É a única mudança de lugar sem
   toque, e vem com um salto de rolagem. Quem olha a tela depois da série vê
   outro cartão, sem saber de onde ele veio nem para onde foi o anterior.
3. **B16 · A folha.** A decisão 14 do dono mandou a folha subir em 06/10 e o
   código não a tem. Ela abre por cima de tudo, inclusive no meio do treino, e
   empilha até três.
4. **B9 e B15 · Entrar e sair do modo de sessão e das telas cheias.** A casca
   troca inteira, a rolagem salta para 0 e volta, e a tab bar renasce (o fio
   não anda nem quando a aba de destino é outra).
5. **B14 · Trocar de aba.** O conteúdo inteiro renasce e a página salta ao
   topo; só um fio de 2 px diz a direção, e ele anima `left`, que é layout.

Logo atrás: **B17** (o toast, canal de mais de cem mensagens, que aparece e some
sem transição) e **B4** (o cronômetro entrando e empurrando o toast e a faixa).

---

## Parte C — como o app renderiza

1. **Cada `render()` diffa a árvore inteira, mas não recria o DOM.**
   `render()` (`src/main.jsx:7373-7390`) chama `montaNoApp(<App ctx={CTX} />)`
   (`src/ui/raiz.jsx:21-34`), que é o `render` do Preact 10.29.8 sobre `#app`.
   Não há `memo`, `useMemo` nem `shouldComponentUpdate` em `src/` (zero), então
   todos os componentes rodam de novo a cada um dos 275 `render()` de
   `src/main.jsx`. O Preact só toca no DOM que mudou, e **um nó que fica na
   mesma posição, com o mesmo tipo e a mesma chave, sobrevive**: nele uma
   transição CSS dispara.
2. **As listas têm chave.** Das 144 listas em JSX (`.map` com elemento), todas
   as de dado têm `key`; as 6 que um script acusou sem chave são falso alarme
   (a chave está na função ao lado, ou não é lista). 21 usam o **índice** como
   chave. As que importam para movimento: exercícios por `vm.id`
   (`src/ui/telas/treino.jsx:214`), séries por posição (`src/ui/exercicio.jsx:519`),
   refeições por `r.id` (`src/ui/telas/agora.jsx:389`), copos por índice
   (`:471`), células do mês pelo **número do dia** (`src/ui/telas/dias.jsx:83`,
   por isso o 15 de setembro reaproveita o nó do 15 de outubro), botões da
   régua pelo valor (`src/ui/instrumento/regua.jsx:69`) e **folhas pelo
   índice na pilha** (`src/main.jsx:7268-7283`: trocar a folha do topo por
   outra de tipo diferente remonta).
3. **O que sobrevive e o que renasce**, conferido no navegador
   (`auditor-nos.mjs`):

   | mudança | nó |
   |---|---|
   | trocar de aba | `<main>` sobrevive; **a tela dentro dele renasce** (cada aba é outro componente, `src/ui/app.jsx:29`, `:52`, `:80`) |
   | tab bar e o fio, entre abas | sobrevivem (por isso o fio transiciona) |
   | aba ↔ tela cheia | **a casca troca de ramo** (`src/ui/app.jsx:49` × `:55-101`): tab bar, faixa e `<main>` saem e renascem na volta |
   | um destino de tela cheia para outro | renasce (outro componente; o `h1` é nó novo) |
   | abrir, gravar série, fechar o cartão do exercício | o cartão sobrevive; a linha da série sobrevive |
   | marcar refeição (cartão de cima), +1 copo, abrir a linha da comida | sobrevivem |
   | fechar a folha de cima com duas abertas | a de baixo sobrevive |
   | toast, cronômetro | sobrevivem sempre: moram **fora** do Preact (`index.html:58`, `:88-97`) e são ligados por classe (`src/main.jsx:5006-5009`, `:6757`) |

4. **Três obstáculos para uma transição disparar**, que os especialistas vão
   encontrar: (a) **`display: none` não transiciona**, e é como o toast
   (`src/componentes.css:1124-1126`), o cronômetro (`:1141-1143`), o corpo do
   exercício (`src/treino.css:97-98`) e a tab bar com teclado
   (`src/componentes.css:257`) somem; (b) **renderização condicional** (`{x &&
   …}`) cria e destrói o nó, então não há "antes" para a entrada nem nó para a
   saída: é o caso de folhas, régua, teclado, RIR, pare e telas cheias;
   (c) **os efeitos rodam depois da pintura** (o Preact agenda `useEffect` com
   `requestAnimationFrame`, `node_modules/preact/hooks/src/index.js:457-461`),
   então um componente que liga uma classe no efeito já pintou um quadro sem
   ela. Gráficos e o total de anilhas entram por `dangerouslySetInnerHTML`
   (`src/ui/instrumento/telacheia.jsx:76-79`, `src/ui/exercicio.jsx:559-561`) e
   renascem a cada mudança de texto.
5. **Onde um `transform` de tela pode morar.** `tests/dominio/estilo.test.ts:1028-1053`
   proíbe `transform`, `filter`, `perspective`, `will-change` e `contain` em
   `html`, `body` e `#app` (prenderiam a folha, que é `position: fixed` sem
   portal, `src/ui/instrumento/folha.jsx:129-135`). Abaixo disso está
   liberado: `<main>` nas abas, `.tc` e `.ins-modo` nas telas cheias, que são
   filhos diretos de `#app`.

**Em uma frase:** o Preact reaproveita o nó quando a mudança é dentro da mesma
tela (cartão, linha, copo, fio da aba), e aí uma transição CSS dispara de
graça; mas tela, aba, folha, régua, teclado e pare nascem e morrem por
renderização condicional ou troca de componente, e toast, cronômetro e corpo do
exercício somem por `display: none`, então nenhuma entrada ou saída anima sem
mudar como o elemento entra e sai.

---

## Medições

Scripts em `docs/motion/_medicao/` (capturas em
`docs/motion/_medicao/shots/auditor/`, fora do git):

```
python3 -m http.server 4721 -d dist &
CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node docs/motion/_medicao/auditor-movimento.mjs http://localhost:4721/ docs/motion/_medicao/shots/auditor
CHROME=… node docs/motion/_medicao/auditor-reduz.mjs http://localhost:4721/
CHROME=… node docs/motion/_medicao/auditor-nos.mjs http://localhost:4721/
```

| script | o que conferiu | resultado |
|---|---|---|
| `auditor-movimento.mjs` | `document.getAnimations()` em repouso e depois de cada mudança; rolagem antes e depois; a bancada a 1440 × 960 | em repouso no Agora: só o pulso. Trocar de aba: uma `CSSTransition` em `left`, 220 ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`. Tela cheia, folha, toast, mês, régua, modo: **nenhuma**. Barra do descanso: `CSSTransition` em `transform`, 250 ms `linear`. Rolagem: modo 300→0→300; exercício 0→363; teclado 0→178. Bancada: 4 `CSSAnimation` `pl-pousa` (aparelho 520 ms; painel e réguas 420 ms com 140 ms de atraso). Zero erros de página |
| `auditor-reduz.mjs` | o mesmo com `reducedMotion: 'reduce'` | fio da aba `transition: none`; pulso `1e-05s`, 1 iteração, opacidade 1; barra `transition: none`, zero animações |
| `auditor-nos.mjs` | se o nó sobrevive a cada mudança | tabela da Parte C, item 3 |

**O que não foi medido:** nada em WebKit (o `:active` do iOS, A.3, fica pela
leitura), a bancada sob `reduce`, a câmera com vídeo (o clarão está pela
leitura e pelo `dist`), e frequências de uso reais (as da Parte B vêm do
desenho do fluxo e dos comentários do código, não de contagem).
