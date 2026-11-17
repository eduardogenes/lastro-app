# 02 · Coreografia da navegação

> Em uma frase: um modelo espacial só para o app inteiro — os cinco lugares
> lado a lado no chão, as telas cheias (o modo de sessão incluído) chegando pela
> direita por cima do lugar, as folhas subindo de baixo — e, para cada troca, de
> onde vem, para onde volta, quanto dura, o que acontece se ele tocar no meio e o
> que fica no lugar com movimento reduzido.

Especialista 3 do time de motion. Leitura e medição no commit `a22b09d`, contra
o `dist/` servido na porta 4722. Nada em `src/` foi tocado: o protótipo da seção
3 é injetado na página pelo `window.__escopo` (`src/main.jsx:7181`). Scripts em
`docs/motion/_medicao/navegacao-*.mjs`; capturas em
`docs/motion/_medicao/shots/navegacao/` (fora do git).

---

## A resposta, em seis linhas

1. **Horizontal é andar; vertical é camada temporária.** Telas cheias e o modo
   de sessão chegam da direita e voltam para a direita; folhas sobem e descem.
   Nada mais se move nesses eixos.
2. **A volta é a ida ao contrário**, pelo botão, pelo Esc, pelo Voltar do sistema
   e pelo gesto de borda — que no iPhone já puxa a página para a direita.
3. **O que é do aparelho não anda**: o cronômetro, o toast, as faixas e a barra
   de status ficam parados enquanto as páginas passam.
4. **O toque nunca espera**: tocar no meio pula a animação para o fim e o toque
   chega ao que está sob o dedo (medido no Chromium e no WebKit).
5. **A rolagem volta exata e antes do primeiro quadro.** Hoje ela corta em dois
   fechos (medido: Corpo em 1778 px volta em 1156) — conserto que vale com ou sem
   movimento.
6. **Técnica: View Transitions de mesmo documento**, com um ponto só no
   `render()`, e troca seca onde ela não existe ou com movimento reduzido.

---

## 0. O que existe hoje (medido em `navegacao-hoje.mjs`)

| troca | como está | o que a medição mostrou |
|---|---|---|
| Trocar de aba | `CTX.vaiPara` (`src/main.jsx:2578-2604`) troca a aba, `render()` e `window.scrollTo(0, 0)` (`:2601-2602`). O conteúdo troca seco. | O `main` e a barra de abas são **os mesmos nós** antes e depois (o Preact só troca o filho de `main`). O indicador anima `left` em 220 ms (`src/componentes.css:267-271`, posição escrita em `src/ui/instrumento/tabbar.jsx:70-73`) — propriedade de layout, contra a regra 4 do briefing. |
| Abrir tela cheia | A casca devolve **só** o destino e as folhas (`src/ui/app.jsx:49`); a ordem de quem fica por cima está em `telaCheia()` (`src/main.jsx:2869-2893`). | Com um destino aberto **não há aba montada**: 0 `main`, sem barra de abas, sem cabeçalho do Agora. Não existe "o lugar por baixo" para mostrar durante um movimento. |
| Fechar tela cheia | Cada fecho zera a flag e devolve a rolagem por `saiDoDestino` (`src/main.jsx:11845-11851`), sempre `instant`. | Volta exata em Programa (1015 → 1015), Evolução (1720 → 1720), Ajustes (379 → 379), modo pelo cartão (379 → 379). **Corta** no modo aberto pela faixa: Corpo 1778 → **1156**, Semana 1201 → **1143**. |
| Folha | `CTX.abreFolha` empilha e desenha (`src/main.jsx:8532`); a folha aparece seca. | `transition: all 0s` na folha e no véu. **A subida decidida em 06/10 (decisão 14, `docs/redesign/09-frente4-sistema.md` §8.5 item 5) não chegou ao código**: `.ins-folha` (`src/componentes.css:203-214`) não tem transição nem animação. |
| Três folhas | Cada `Folha` tem o próprio véu (`src/ui/instrumento/folha.jsx:137-140`). | 3 véus empilhados (`rgba(18,18,30,.42)` cada): o fundo escurece a cada nível. A pilha já diz profundidade pela cor; não pelo movimento. |
| Trocar a folha do topo | `CTX.trocaFolha` (`src/main.jsx:8541`), só pelo "cadastrar" (`src/ui/folhas/editores.jsx:167`). | A contagem fica em 3 e o histórico em 3: é troca, não camada. |
| Voltar do sistema | Uma entrada de histórico por camada (`src/ui/navegacao.js:114-136`); `popstate` fecha a diferença (`:198-206`); Esc pelo mesmo caminho (`:192-196`). | `history.back()` deixa o app no mesmo estado que o botão, nos seis casos medidos. |
| Abertura | O texto "Abrindo o registro…" de `index.html:52` é trocado pela primeira tela; com treino em andamento a primeira tela já é o modo (`src/main.jsx:556`). | Sem movimento. |
| Giro | Só CSS: fora do modo, o aviso "Gire o telefone" (`src/base.css`, bloco `#deitado`); dentro, duas colunas (`src/componentes.css`, bloco deitado). | O cartão aberto continua à vista ao deitar e ao voltar, nos dois motores (`navegacao-giro.mjs`). |

**A causa do corte da rolagem** (achado desta leitura, e é o "salto" que o pedido
proíbe): `CTX.fechaModoDeSessao` (`src/main.jsx:11830-11835`) e `CTX.fechaAjustes`
(`:11578-11583`) chamam `saiDoDestino` **antes** do `render()`. O `scrollTo` roda
com o modo ainda no DOM, e o navegador corta na altura máxima **dele** (1156 px no
modo medido). Os outros doze fechos fazem o contrário — desenham e depois rolam —,
como `fecharPrograma` (`:3551`). Em Ajustes não aparece hoje porque Ajustes é
mais alto que o Agora; aparece no dia em que o Agora crescer. Não é motion, mas
toda proposta abaixo depende de a rolagem voltar **antes** do primeiro quadro da
página que reaparece — então o conserto entra junto, ou antes.

---

## 1. O modelo espacial

```
   vertical: só folhas                ┌───────────────┐  folha 3   ↑ sobe / ↓ desce
                                      │   folha 2     │  véu sobre véu
                                      │   folha 1     │
   horizontal: andar         ┌────────┴───────────────┴──────┐
                             │  tela cheia 2 (ex.: Histórico) │ ◄── entra da direita
                             │  tela cheia 1 (ex.: Programa)  │ ◄── entra da direita
                             │  modo de sessão (a mais funda) │ ◄── entra da direita
                             └────────────────────────────────┘
   o chão:   Agora · Dias · Corpo · Semana · Prescrição     ◄── lado a lado, passo curto
   parados:  barra de status · cronômetro · toast · faixa da sessão · "não guardado"
```

**O chão são os cinco lugares, lado a lado, na ordem da barra.** Trocar de aba é
andar de lado: o indicador anda o caminho inteiro; o conteúdo dá só um passo
curto no mesmo sentido. Lugar não se empilha e não tem Voltar — e por isso não
pode parecer camada.

**Toda tela cheia é uma página que chega pela direita e se deita por cima do
lugar.** O que fica embaixo recua um terço, sem sumir: está lá, mais fundo, e é
para lá que o Voltar devolve, na mesma rolagem. Empilhar (Programa → Histórico,
Evolução → Comparar → Ajustar a foto, Dia → Sessão passada) é a mesma coisa de
novo. Três razões para a direita, e nenhuma é gosto:

- a saída de toda tela cheia é "‹ Voltar" no canto de cima à esquerda
  (`src/ui/instrumento/telacheia.jsx:29`) — a seta aponta para onde está o que
  ficou para trás;
- o gesto de borda do iPhone puxa a página de cima **para a direita** e mostra a
  de baixo vindo da esquerda — e ele existe no app instalado (seção 2, T5),
  então o sistema já conta essa história; o app só pode concordar com ela;
- é como o próprio telefone dele navega, então não há nada a aprender.

**O modo de sessão é uma tela cheia** — a primeira da pilha, como o código já diz
(`src/ui/navegacao.js:58`). Entra e sai como qualquer destino; o que se abre de
dentro dele (programa, histórico) empilha por cima, pela direita. Ajustes também
é tela cheia.

**O eixo vertical é só das folhas.** Elas sobem de baixo por cima de qualquer
coisa (inclusive de tela cheia), com o véu escurecendo atrás; a segunda sobe
sobre a primeira e o véu dela soma ao de baixo; Voltar é descer. Trocar a folha
do topo não é camada nova: o topo muda de conteúdo sem sair do lugar.

**O que é do aparelho, e não da página, não anda.** O cronômetro (`#timer`,
`index.html:88`), o toast (`index.html:58`), a faixa da sessão, a faixa "não
guardado" e a faixa da barra de status (`src/base.css:92`) ficam onde estão
enquanto as páginas passam por baixo deles. O descanso está correndo — ele não
"pertence" ao Corpo nem ao Agora.

**Dois eixos, dois significados, e mais nada se move.** Nenhum conteúdo desliza
dentro de uma tela, nenhuma lista entra animada, nenhum cartão cresce. A
recusa de "deslizar conteúdo" (`docs/design-review/05-movimento.md` §4) continua
de pé para o conteúdo; o que muda é que **camada** passa a se mover.

---

## 2. As transições, em ordem de valor

Valor = frequência × desorientação que o movimento evita. As classes de duração
são duas — **curta** (140–200 ms) e **média** (220–280 ms) — e as curvas, duas:
**saída suave sem ultrapassagem** para deslocamento (`--ins-ease`,
`cubic-bezier(.2, .8, .2, 1)`, `src/tokens.css:419`: chega rápido e assenta, sem
elasticidade) e **linear** para opacidade. Os valores finais são do especialista
de sistema (`06-sistema.md`); as faixas abaixo são o que sugiro e por quê. **Volta
é ~15 % mais curta que ida**: quem volta já sabe para onde vai.

### 2.0 As regras que valem para todas

- **Técnica**: View Transitions de mesmo documento, disparada num ponto só, o
  `render()` (seção 3).
- **O toque nunca espera.** O dado já foi gravado pelo verbo antes de qualquer
  desenho (o movimento não toca em `S`). Um `pointerdown` durante uma transição
  chama `skipTransition()` — a tela salta para o estado final — e o clique que
  nasceu nesse instante é reenviado ao elemento que está de fato sob o dedo.
  Sem isso o toque **se perde**: durante a transição o alvo do toque é o `html`
  (medido nos dois motores, com e sem `pointer-events: none` no
  `::view-transition`). Com o pulo e o reenvio, o "‹ Voltar" tocado a 40 % de uma
  entrada fechou o destino, no Chromium e no WebKit (`navegacao-prototipo.mjs`,
  bloco 5).
- **A rolagem é aplicada dentro do desenho novo**, nunca antes: a página que
  reaparece já nasce na posição. Toda chamada de `scrollTo`/`scrollIntoView`
  feita enquanto o desenho novo não entrou é adiada para logo depois dele.
- **Movimento reduzido: nenhuma transição.** O JS não chama
  `startViewTransition` sob `prefers-reduced-motion: reduce` e todo CSS de
  transição mora dentro de `no-preference` — falha fechado: o que sobra é a
  troca seca de hoje. O que diz "onde estou" sem movimento já existe: o título
  da tela cheia recebe o foco (`telacheia.jsx:22-24`), a folha o recebe
  (`folha.jsx:104-116`), a aba acesa tem `aria-current` (`tabbar.jsx:78`), e
  cada camada tem a sua saída visível ("‹ Voltar", ×, véu).
- **Primeira tela, nunca.** A abertura não anima (T9).
- **Sem `backdrop-filter`, sem sombra projetada**, sem `transform` em elemento
  real que seja ancestral de algo fixo: a transição anima as fotos que o
  navegador tira, não os elementos.

### T1 · Entrar e sair do modo de sessão

O valor mais alto: é a troca de camada que mais acontece num dia de treino (sair
para a água ou a comida e voltar pela faixa, entre séries), e a que mais
desorienta — "saí do treino ou encerrei?" é a dúvida que o rótulo da seta existe
para responder (`src/ui/telas/sessaomodo.jsx:20-23`).

- **Hoje.** Três portas: o cartão do Agora (`CTX.abreTreinoDeHoje`,
  `src/main.jsx:11767-11773`), a faixa (`CTX.voltaAoTreino`, `:11390-11402`) e a
  abertura com treino em andamento (`:556`); mais "Detalhar" no lançamento de
  treino passado (`:4275-4278`). Saídas: a seta (`sessaomodo.jsx:32-35` →
  `CTX.fechaModoDeSessao`, `src/main.jsx:11830-11835`) e o Voltar do sistema
  (`FECHA_CAMADA.modoSessao`, `:7420`). Tudo seco; a volta pela faixa corta a
  rolagem (seção 0).
- **Proposta.** Entra da direita por cima; o lugar recua um terço. **Média, 240 ms
  (220–260)**, curva `--ins-ease`. Explica: o treino é uma camada **por cima** do
  lugar, e o lugar continua lá — exatamente o que "deixando a sessão aberta" diz
  em palavras.
- **Reverso.** Seta, Voltar, Esc e gesto de borda: o modo sai para a direita e o
  lugar volta do recuo. **Média-curta, 200 ms (180–220).** O lugar reaparece na
  rolagem de onde se entrou, já posicionado. A faixa "treino A em andamento"
  aparece parada no rodapé: é ela que diz, sem texto, que a sessão continua.
- **Toque no meio.** O caso que importa é sair pela seta e tocar logo na faixa
  para voltar: o primeiro toque pula a saída, o segundo entra. Nada espera.
- **Posição de leitura.** Entrar guarda a rolagem e sobe ao topo **dentro** do
  desenho novo (hoje `entraNoDestino`, `src/main.jsx:11837-11840`, rola o lugar
  ao topo **antes** de desenhar — a foto do lugar que sai mostraria o topo, um
  salto). Sair devolve a rolagem dentro do desenho novo; isto conserta o corte
  de `fechaModoDeSessao`. Medido no protótipo: Corpo 1778 → modo → 1778, pela
  seta e pelo Voltar, nos dois motores.
- **Abertura com treino em andamento**: sem movimento — a primeira tela já é o
  modo (T9). **"Detalhar"** troca a camada de cima sem mudar a profundidade
  (`add` sai, `modoSessao` entra): tratar como entrada.
- **Movimento reduzido.** Troca seca, como hoje.
- **Riscos.**
  - Um `transform` **real** em `.ins-modo` (o caminho por classes) faria dele o
    bloco de contenção da faixa da pergunta de 1h30, que é `position: fixed`
    (`sessaomodo.jsx:74`, `src/componentes.css:1149`): durante a animação ela
    cairia para o fim do modo, a 2000 px. O guarda de
    `tests/dominio/estilo.test.ts:1028` só olha `html`, `body` e `#app` e não
    pegaria. Com View Transitions nenhum elemento real recebe `transform`.
  - O cronômetro (`#timer`) mora fora do `#app` e entraria na foto da página —
    andaria junto. Ganha nome próprio e fica parado (medido: aparece imóvel nas
    capturas lentas).
  - `sticky` da barra da saída (`src/componentes.css:1284`) e do relógio
    (`src/treino.css:602`): a transição não mexe em `overflow` de ninguém.
  - `100vh × svh`: `.ins-modo` já usa `100svh` com recuo (`src/componentes.css:1237-1238`);
    a foto da página é a janela inteira, e no app instalado não há barra que
    mude a altura.
  - **O quadro a mais.** A transição tira a foto do estado velho antes de chamar
    o desenho novo: o desenho atrasa ~1 quadro (medido no Chromium: 2–18 ms do
    toque ao desenho; 12–49 ms até o primeiro quadro animado). É o "um frame a
    mais entre o toque e a próxima série" que a `MARCA.md:172` recusou para o
    splash. Aqui ele é pago na troca de camada, não no registro da série — mas é
    real, e é decisão (D4).

### T2 · Telas cheias: abrir, fechar, empilhar

Programa, histórico, sessão passada, dia aberto, retrospectiva, lançamento,
Evolução, comparar, protocolo de fotos, ajuste de foto, câmera, revisão.

- **Hoje.** `entraNoDestino` + flag + `render()` para abrir (ex.: `abrirPrograma`,
  `src/main.jsx:3546-3550`); flag + `render()` + `saiDoDestino` para fechar (ex.:
  `fecharPrograma`, `:3551`). Seco. A aba é desmontada (`app.jsx:49`).
- **Proposta.** Igual a T1: da direita, por cima, o de baixo recua um terço;
  **média, 240 ms**. Empilhar repete — só a camada imediatamente abaixo aparece
  recuando. Explica: de onde a tela veio e que o Voltar devolve à de baixo, não
  ao lugar.
- **A borda.** As duas páginas têm o mesmo fundo; sem sombra (inegociável), a
  borda da que chega precisa de um **fio de 1 px** (`--ins-fio`) do lado
  esquerdo durante o deslocamento — o mesmo papel da linha de acento no topo da
  folha (`src/componentes.css:211-213`). Ver D2.
- **Reverso.** Sai para a direita, 200 ms; a de baixo volta do recuo, na
  rolagem guardada.
- **Toque no meio.** Pula e reenvia (2.0). Toque duplo no "‹ Voltar" para descer
  duas camadas funciona porque todo destino tem a saída no mesmo canto.
- **Navegação composta.** "Ir para Semana" na Evolução fecha e troca de aba no
  mesmo toque (`src/ui/telas/evolucao.jsx:115`); "Peso de outro dia" troca de
  aba e abre (`src/ui/telas/semana.jsx:238`). Dois `render()` seguidos viram
  **uma** transição: enquanto o desenho novo está pendente, `render()` não faz
  nada, e o desenho lê o `view` mais recente. O sentido é o da primeira mudança.
- **Movimento reduzido.** Seco.
- **Riscos.** A câmera (`view.camera`) tem vídeo ao vivo: a foto do estado velho
  congela o quadro por 200 ms na saída — aceitável, e é a câmera que saiu. O
  resto como T1.

### T3 · Folhas: subir, descer, empilhar, o véu

- **Hoje.** Seco (seção 0). A subida foi decidida em 06/10 e não está no código;
  o `DESIGN.md` se contradiz sobre ela (`DESIGN.md:62-68` diz que caiu a
  proibição; `DESIGN.md:286-292` ainda a lista como recusada).
- **Proposta.** A decisão 14 como foi escrita: a folha sobe de
  `translateY(100%)`, **média, 240 ms**, `--ins-ease`, sem ultrapassagem; o véu
  aparece por opacidade, **curta, 200 ms, linear**. O lugar (ou a tela cheia)
  atrás não se move. Na pilha, cada folha nova sobe sobre a anterior e o véu dela
  soma ao de baixo — a profundidade fica dita pela forma e pela cor.
- **Reverso.** ×, véu, Voltar e Esc: a folha desce, **200 ms**; o véu some,
  **160 ms**. Com View Transitions a descida sai de graça: a folha já foi
  desmontada pelo Preact e o que desce é a foto dela — não é preciso manter a
  folha viva depois de fechada.
- **Toque no meio.** Pula e reenvia. Tocar no véu enquanto a folha sobe fecha
  a folha (é o que o véu faz).
- **Posição de leitura.** A trava de rolagem continua a de hoje
  (`folha.jsx:26-41`, `body.ins-travado` em `src/base.css:113`), com a devolução
  `instant` ao destravar.
- **Movimento reduzido.** Folha e véu no lugar no primeiro quadro.
- **Riscos.**
  - O nome de cada folha na transição tem de ser pela **posição na pilha**
    (`folha-0`, `folha-1`, `folha-2`; o índice já existe em `folhaAberta`,
    `src/main.jsx:7267-7284`), não pelo `nivel`: refeição e "editar refeição"
    têm os dois nível 50 (`folha.jsx:84`, `editores.jsx:58`), e nome repetido
    aborta a transição.
  - `max-height: 92dvh` na folha (`src/componentes.css:207`) não muda.
  - Folha aberta pelo gesto de borda do iOS: o sistema a tira para o lado, não
    para baixo (T5).

### T4 · Trocar de aba

A troca mais frequente do app, e a menos desorientadora: o rótulo aceso e o
indicador já dizem onde se está. Por isso é a mais curta.

- **Hoje.** Seco; o indicador anda `left` em 220 ms.
- **Proposta.** O conteúdo velho some rápido (opacidade 1 → 0, **~90 ms,
  linear**); o novo entra a **20 px** do lado de onde se veio — da direita quando
  se anda para a direita na barra — e assenta (`translateX(±20px)` → 0 com
  opacidade 0 → 1), **curta, 180 ms (150–200)**, `--ins-ease`. O cabeçalho do
  Agora vai com a página. A barra de abas fica parada, e o indicador anda na
  mesma duração — **em `transform: translateX()`**, não mais em `left`
  (`componentes.css:267-271`, `tabbar.jsx:70-73`). Explica: para que lado se
  andou, no lugar onde o olho está (o topo da tela), e não só numa risca de
  2 px na borda de baixo.
- **Reverso.** Não há Voltar entre lugares (aba não empilha nem tem entrada no
  histórico). A volta é tocar na outra aba, e o sentido se espelha pelo índice.
- **Toque no meio.** Toques rápidos em abas: cada transição nova encerra a
  anterior, e a barra está parada — o dedo acerta a aba que vê.
- **Posição de leitura.** Toda aba abre no topo (`src/main.jsx:2602`); esse
  `scrollTo(0, 0)` entra no desenho novo, senão a foto da aba que sai pularia
  para o topo antes de sumir.
- **Movimento reduzido.** Seco; o indicador salta.
- **Riscos.**
  - **Fantasma**: se as duas opacidades cruzam por igual, o meio da troca mostra
    as duas abas sobrepostas (visto em `folha-aba-dir.png`, a 25 %). Por isso a
    velha sai em metade do tempo.
  - A barra de abas tem nome próprio só nas trocas de aba; a foto velha dela
    fica escondida e a nova sem animação, para o indicador vivo aparecer
    andando — senão a barra faz um cruzamento de duas fotos.
  - `vaiPara('treino')` (`src/ui/telas/agora.jsx:391`) pede uma aba que não
    existe (risco 10 §9.2 do mapa): sem índice, sem animação.
  - `translateX(+20px)`: não cria rolagem horizontal (ver "A armadilha" em 3.4).

### T5 · O Voltar do sistema e o gesto de borda

- **Hoje.** `popstate` → `voltarUmaCamada` (`src/ui/navegacao.js:198-206`,
  `src/main.jsx:7423-7432`), o mesmo fecho do botão. O comentário de
  `src/componentes.css:578-586` diz que "em PWA instalado não existe botão do
  navegador nem gesto de borda": desatualizado duas vezes — o app passou a usar o
  histórico, e o app instalado no iOS tem o gesto de voltar pela borda desde o
  iOS 12.2. O que o gesto mostra é animação **do sistema**: a página de cima vai
  para a direita e a foto da entrada anterior vem da esquerda.
- **Proposta.** Voltar, Esc e × usam o mesmo reverso de T1–T3. **Quando o
  próprio sistema já animou** — `popstate` com `event.hasUAVisualTransition ===
  true` (Safari 18 e Chrome 118 em diante; confirmado no WebKit medido) —, o app
  fecha **sem** transição, senão a mesma volta aparece duas vezes. No Android, o
  botão Voltar chega com `false` e o app anima.
- **Coerência.** O gesto do iPhone e o reverso do app contam a mesma história
  para telas cheias e para o modo (saem para a direita). Para a folha, não: o
  gesto a tira de lado. Impedir o gesto exigiria cancelar toques na borda —
  frágil, e tira do usuário um gesto do sistema. Não recomendo.
- **Toque no meio / reduzido.** Como T1–T3.
- **Risco.** **A confirmar no aparelho dele**: que o gesto de borda existe no
  app instalado no iOS atual e que o evento chega com `hasUAVisualTransition`
  verdadeiro. Se não chegar, a volta pelo gesto aparece duas vezes (a do sistema
  e a nossa): a correção é tratar o `popstate` vindo de toque na borda como
  "sem transição".

### T6 · A rolagem devolvida

- **Hoje.** Guardada por nome do destino (`src/main.jsx:11525`, `:11837-11851`),
  devolvida `instant`, restauração do navegador desligada
  (`src/ui/navegacao.js:156`). Corta em dois fechos (seção 0).
- **Proposta.** A ordem passa a ser uma só: **desenha, depois rola**, nos dois
  sentidos e em todos os fechos. Com transição, as duas coisas acontecem dentro
  do mesmo desenho novo, e a página de baixo aparece já posicionada no primeiro
  quadro do recuo. Nunca rolagem suave na volta: as razões escritas em
  `folha.jsx:38-40` e `src/main.jsx:11848-11849` continuam valendo.
- **Medido no protótipo.** Ajustes 374 → 374; modo pela faixa 1778 → 1778 (pela
  seta e pelo Voltar), no Chromium e no WebKit.
- **Este conserto é independente do movimento** e pode entrar antes dele.

### T7 · Ajustes

Uma tela cheia como as outras (T2), aberta pelo ⚙ no canto de cima à direita
(`src/ui/app.jsx:69-71`, `src/main.jsx:11572-11577`). Entra da direita — do lado
do botão que a abriu. Conserto da ordem em `fechaAjustes` (`:11578-11583`).

### T8 · A troca da folha do topo ("cadastrar")

- **Hoje.** `trocaFolha` tira a de cima e põe outra no mesmo índice
  (`src/main.jsx:8541`); o Preact desmonta o seletor e monta o editor.
- **Proposta.** **A camada não se move** — cadastrar é continuação da busca, não
  camada nova (`src/main.jsx:8533-8540`). O conteúdo troca no lugar; no máximo um
  cruzamento de opacidade **curto, 120 ms**. Sem animar o tamanho: o "morph"
  padrão da View Transition anima largura e altura do grupo, e isso não é
  `transform` nem opacidade.
- **Reverso.** O Voltar fecha a folha cadastrar (desce, T3) e devolve à de baixo.
- **Reduzido.** Seco.

### T9 · A abertura do app

- **Proposta: nenhum movimento.** A primeira tela é o lugar final — o Agora ou,
  com treino em andamento, o modo. Animar a chegada da primeira tela é um splash,
  e o splash foi recusado pelo quadro a mais (`MARCA.md:172`). A primeira
  chamada de `render()` (`abriu === false`, `src/main.jsx:7381`) nunca dispara
  transição.
- **Um pisca possível que não é movimento.** O manifesto declara fundo e tema
  escuros (`public/manifest.webmanifest:9-10`, `#0C0E0C`) e o tema claro do app é
  `#E7E3DB`: onde o sistema usa essa cor na tela de abertura, a abertura pisca de
  escuro para claro. É o risco 19 da `docs/mapa/01-fundacao.md` (Android); no
  iPhone, **a confirmar**. A correção é a cor do manifesto, não animação.

### T10 · O giro do telefone

- **Proposta: nenhum movimento do app.** O sistema já anima a rotação; um
  segundo movimento por cima seria o mesmo dito duas vezes. Fora do modo, o aviso
  "Gire o telefone" é CSS (`src/base.css`, `#deitado`) e aparece seco — certo,
  porque é aviso, não camada.
- **Medido.** O cartão aberto do terceiro exercício continua à vista ao deitar
  e ao voltar, no Chromium (topo do cartão 40 → 3 → 40 px) e no WebKit
  (40 → 3 → 96 px). Deitado, os 3 px deixam o topo do cartão sob a barra da
  saída; reancorar com `mostraExercicio` (`src/main.jsx:5041-5044`) no giro é
  ajuste de posição, não movimento — opcional.

---

## 3. Como fazer em Preact

### 3.1 O que a casca impõe

Duas coisas tornam "transição de página" difícil aqui, e as duas são boas
decisões que não devem mudar:

1. **A tela que sai deixa de existir.** Com um destino aberto, a aba não está
   montada (`app.jsx:49`); ao fechar, o destino é desmontado no mesmo `render()`
   síncrono (`src/ui/raiz.jsx`, `montaNoApp`). Para a tela velha aparecer durante
   o movimento, ou ela continua montada, ou alguém tira uma foto dela.
2. **Há uma rolagem só, a da janela**, para todas as camadas (`src/base.css:100-108`:
   nenhum ancestral pode virar container de rolagem, senão o `sticky` cai). A
   aba estava em 1778 px; o destino está em 0. Durante o movimento as duas
   precisariam aparecer cada uma na sua rolagem.

### 3.2 Classes CSS próprias

- **Abas**: fácil. Basta animar a **entrada** do conteúdo novo (`main` com uma
  classe pelo sentido); a velha some seca. Sem manter nada montado.
- **Telas cheias e modo**: caro. A ida precisa do lugar visível por baixo
  durante 240 ms — hoje ele está desmontado. Manter a aba montada sob todo
  destino custa um desenho dela a **cada** `render()` enquanto o destino estiver
  aberto. Medido (`navegacao-custo.mjs`, mediana de 30 renders no Chromium do
  computador): Agora 2,6 ms, Corpo 2,4 ms, modo 4,2 ms. Sob o modo, cada toque de
  série pagaria o Agora junto — no A13, provavelmente 2 a 4 vezes mais, dentro
  de um quadro de 16,7 ms. E a camada de baixo teria de ficar congelada em
  `position: fixed; top: -1778px` enquanto a janela está em 0.
- **A volta é pior**: o destino que sai já não tem dado (`view.prog = null`
  antes do `render()`), então o componente não sabe mais se desenhar. Restam
  guardar o último desenho (estado "saindo" na casca, em todos os 14 fechos) ou
  clonar o DOM (`cloneNode`) num sobreposto fixo — uma View Transition feita à
  mão, sem vídeo nem canvas, e com os campos perdendo o estado.
- **Folhas**: a subida é fácil (`@starting-style` ou animação na montagem); a
  descida pede manter a folha montada depois de fechada, com o Voltar já
  contando-a como fechada.
- **A favor**: o toque segue o `transform` (cai no que o dedo vê, mesmo no
  meio), e roda em qualquer iOS.
- **Contra, além do custo**: `transform` em elemento real que tenha um fixo
  dentro prende o fixo (T1, a faixa no `.ins-modo`); a regra de
  `docs/design-review/05-movimento.md` §5.4 — "só pode morar no `main`" —
  continua valendo para este caminho.

### 3.3 View Transitions de mesmo documento

- **Onde existe.** `document.startViewTransition` está no Safari 18.0 (iOS 18,
  setembro de 2024) e no Chrome 111. O iPhone 11 Pro Max recebe o iOS 18 e o
  iOS 26, então recebe a API. A versão entre documentos (Safari 18.2) não
  interessa: o app tem um documento só. Tipos e classes de transição também não
  são necessários: o sentido vai num atributo do `html` (`data-nav`).
- **Como ela convive com o `render()` síncrono** — um ponto só, no casco:
  1. `render()` (`src/main.jsx:7373`) compara a assinatura do que vai desenhar
     (`camadasAbertas(view)`, a aba, o tipo da folha do topo) com a última
     desenhada. Mudou, e pode animar → `document.startViewTransition(desenha)`;
     senão desenha agora, como hoje.
  2. Enquanto o desenho novo está pendente (a foto do estado velho leva ~1
     quadro), `render()` não faz nada: o desenho lê o `view` mais recente.
     `scrollTo` e `scrollIntoView` pedidos nesse meio são adiados para depois
     dele.
  3. `entraNoDestino` e `saiDoDestino` (`src/main.jsx:11837-11851`) deixam de
     rolar na hora: guardam o pedido, e o desenho aplica.
  4. Não anima: na primeira tela (`abriu`, `:7381`); sob movimento reduzido
     (verificação em JS, além do portão do CSS); no `popstate` com
     `hasUAVisualTransition`; quando a API não existe (iOS < 18, jsdom).
  5. Peças paradas ganham nome próprio: `#timer`, `#toast`, `.ins-faixa`,
     `.ng-faixa`; a barra de abas só nas trocas de aba. Folhas e véus, pelo
     índice na pilha.
  6. `pointerdown` em captura durante a transição → `skipTransition()`; o
     clique daquele toque é reenviado a `document.elementFromPoint(x, y)`.
- **Os testes de fluxo não mudam**: rodam no jsdom (`tests/fluxo/harness.js:18`),
  que não tem a API, então seguem pelo caminho síncrono de hoje. O caminho com
  transição precisa de verificação em navegador (o revisor, `07-revisao-base.md`)
  — os scripts deste documento são o molde.
- **O guarda de bloco de contenção** (`tests/dominio/estilo.test.ts:1028`) casa
  seletores como `html[data-nav="entra"]::view-transition-old(root)` como
  ancestral da folha. Nada de `transform`, `will-change` ou `contain` dentro
  dessas regras: o movimento vai nos `@keyframes`, que o guarda não olha — e
  está certo não olhar, porque o que se move é a foto, não o `html`.
- **Medido** (`navegacao-prototipo.mjs`, 240 ms, Chromium; WebKit do Playwright
  1.62, que se anuncia Safari 26.5):

  | | Chromium | WebKit (WPE, sem GPU) |
  |---|---|---|
  | do toque ao desenho novo | 2–18 ms | 2–70 ms (441 ms na primeira, a frio) |
  | do toque ao 1º quadro animado | 12–49 ms | 15–900 ms |
  | rolagem devolvida exata | 14 de 14 casos | 14 de 14 casos |
  | rolagem horizontal durante | nenhuma (`scrollWidth` 414) | nenhuma |
  | toque no meio, sem pulo | perdido (alvo `html`) | perdido (alvo `html`) |
  | toque no meio, com pulo e reenvio | chega ao "‹ Voltar" | chega ao "‹ Voltar" |

  O WebKit daqui é o motor do Safari rodando sem placa de vídeo, a 3–30 quadros
  por transição: prova **comportamento**, não fluidez. A fluidez no A13 é do
  `04-desempenho.md` e do aparelho.

- **Uma variante medida e descartada.** Não fotografar a página inteira (só
  `main`, `.tc` e `.ins-modo`, com `:root { view-transition-name: none }`)
  deixaria o resto da tela vivo, mas: (a) o toque continua perdido (alvo vira o
  `#app`); (b) as telas cheias não têm fundo próprio e a de baixo aparece através
  (`folha-semraiz-entra-ajustes.png`); (c) com o mesmo nome dos dois lados, o
  navegador "transforma" uma página na outra, de posição e tamanho
  (`folha-semraiz-sai-modo-seta.png`). Fotografar a página inteira e dar nome só
  ao que fica parado é mais simples e certo.

### 3.4 A armadilha do `translateX(+)`, medida

`navegacao-armadilha.mjs` (Chromium com barra de rolagem clássica, a do
computador e portanto a da bancada): nem `main` deslocado +44 px, com ou sem o
`overflow-x: clip` do body, nem a transição de página fizeram a janela mudar de
largura ou de altura, nem a barra de abas sair de 849 px. O app está protegido
**duas vezes**: `::-webkit-scrollbar { display: none }` (`src/base.css:198`) faz
a barra não ocupar lugar, e `overflow-x: clip` no body (`src/base.css:107`) tira
até a rolagem lateral. Com View Transitions o `scrollWidth` nem cresce: as fotos
moram numa camada à parte. **As duas linhas viram regra**: quem tirar uma delas
reabre a armadilha para o caminho por classes.

### 3.5 Recomendação: View Transitions

Pelas razões, em ordem:

1. **Resolve a saída sem manter nada montado** — a casca continua desmontando o
   que fecha, como hoje. Classes exigiriam estado "saindo" em 14 fechos ou um
   clone do DOM.
2. **Resolve as duas rolagens**: cada página aparece na sua posição porque é
   uma foto. A rolagem volta exata (medido), inclusive no caso que hoje corta.
3. **Um ponto só no código** (`render()`), e os verbos não mudam — só a ordem da
   rolagem em `entraNoDestino`/`saiDoDestino`, que é conserto de qualquer jeito.
4. **Falha fechada de graça**: sem a API, ou com movimento reduzido, o app é o
   de hoje, quadro por quadro.
5. **Não põe `transform` em elemento real**: nenhum fixo é capturado, nenhum
   `sticky` cai, o guarda de contenção continua verde.

O preço, dito: ~1 quadro antes do desenho novo, o toque no meio precisa do pulo
com reenvio (código próprio, ~15 linhas), e o comportamento no iPhone real ainda
não foi visto. **Exceção por classe**: o indicador de aba, que é um `transition`
de `transform` no próprio elemento e continua vivo dentro da foto nova.

Esboço do CSS (para o sistema de motion afinar; os valores são as faixas da
seção 2):

```css
@media (prefers-reduced-motion: no-preference) {
  #timer   { view-transition-name: cronometro; }
  #toast   { view-transition-name: toast; }
  .ins-faixa { view-transition-name: faixa; }
  html[data-nav^="aba"] .ins-tabbar { view-transition-name: tabbar; }

  html[data-nav="entra"]::view-transition-old(root) { animation: recua 240ms var(--ins-ease) both; }
  html[data-nav="entra"]::view-transition-new(root) { animation: da-direita 240ms var(--ins-ease) both; }
  html[data-nav="sai"]::view-transition-old(root)   { animation: para-direita 200ms var(--ins-ease) both; z-index: 1; }
  html[data-nav="sai"]::view-transition-new(root)   { animation: avanca 200ms var(--ins-ease) both; }
  /* aba, folha e troca do topo: idem, com os tempos de T3, T4 e T8 */
}
@keyframes da-direita   { from { transform: translateX(100vw); } }
@keyframes para-direita { to   { transform: translateX(100vw); } }
@keyframes recua        { to   { transform: translateX(-30vw); } }
@keyframes avanca       { from { transform: translateX(-30vw); } }
```

---

## 4. Os motivos antigos, um por um

| o motivo (onde está escrito) | ainda vale? | por quê |
|---|---|---|
| "O indicador já diz a direção; deslizar o conteúdo seria dizer duas vezes, e pela via mais cara" (`05-movimento.md` §1 e tabela do §4) | **Metade.** | O indicador diz, mas numa risca de 2 px na borda de baixo, longe do olho. O passo curto de 20 px diz no topo, onde se lê. "A via mais cara" caiu: é uma foto e uma animação no compositor, sem layout; do toque ao desenho, 2–18 ms. O que continua de pé: o conteúdo **não desliza a tela inteira** (D1). |
| "`translateX` positivo cai na armadilha do §5.2, com quatro vítimas fixas" (`05-movimento.md` §5.2) | **Não, neste app.** | Medido (3.4): sem barra de rolagem que ocupe lugar (`base.css:198`) e com `overflow-x: clip` (`base.css:107`), nada reflui. Fica como regra: não tirar as duas linhas. |
| "Transição de tela só pode morar no `main`; um nível acima prende a folha, a faixa e a tab bar" (`05-movimento.md` §5.4) | **Sim, para `transform` em elemento real.** | É por isso que a recomendação não usa `transform` em elemento nenhum. A View Transition anima fotos numa camada à parte. |
| "Às 6h15 ele não está olhando; um frame a mais entre o toque e a próxima série" (`05-movimento.md` §2; `MARCA.md:172`) | **Sim, e por isso nada disto toca a série.** | Registrar série, régua, teclado e descanso não trocam de camada e não passam por aqui. Entrar e sair do modo pagam ~1 quadro (D4). |
| "O véu ou aparece de uma vez ou pede um fade" (`05-movimento.md` C3) | **Caiu em 06/10** (decisão 14). | O véu escurece em 200 ms. |
| "Entrada animada enfeita a chegada de algo que já ia chegar" (`DESIGN.md:62-68`) | **Sim, para conteúdo; não para camada.** | Lista, cartão e tela que trocam no mesmo lugar continuam sem entrada. Camada que chega por cima tem de dizer de onde veio, porque é para lá que a saída devolve — o mesmo argumento que derrubou a proibição para a folha, estendido às telas cheias. |
| "Fade proibido pelo nome" (`DESIGN_SYSTEM.md:18`, citado em `05-movimento.md`) | **Caiu para o véu e para a troca de aba.** | O véu já foi decidido. Na aba, a opacidade é o que faz o passo de 20 px não ser um salto; sem ela, o conteúdo velho apareceria deslocado antes de sumir. |
| "Movimento novo entra na tabela antes de entrar no código" (`DESIGN.md:294-297`) | **Sim.** | Cada linha da seção 2 entra na tabela do `DESIGN.md` com a função antes do código. |
| "Uma transição entre lugares da barra" na lista do que continua recusado (`09-frente4-sistema.md` §8.6) | **Reaberto pelo pedido de 15/10**, e é decisão dele (D1). | |

---

## 5. Decisões que são do dono

**D1 · Trocar de aba se move?** (hoje: só o indicador)
- **(a) Só o indicador**, conteúdo seco. Zero custo; a direção fica dita só na
  borda de baixo.
- **(b) Passo curto** — o conteúdo novo entra a 20 px do lado de onde se veio,
  em 180 ms, e o velho some em 90 ms. Diz a direção onde se lê; não parece
  camada. **Recomendo.**
- **(c) A página inteira desliza**, como um carrossel. Promete um gesto de
  arrastar entre abas que o app não tem — e que brigaria com o gesto de borda do
  iPhone; de Agora a Prescrição "passaria" por três telas.

**D2 · De onde vem uma tela cheia?**
- **(a) Da direita, por cima; o lugar recua um terço, com um fio de 1 px na
  borda da que chega.** Igual ao gesto de borda do iPhone e à seta "‹".
  **Recomendo.**
- **(b) Igual a (a), e o lugar de baixo escurece um pouco** (um véu leve). Mais
  "camada"; é um terceiro véu no app e mais um fade.
- **(c) De baixo, como folha.** O eixo vertical deixaria de querer dizer "camada
  temporária"; folha e destino ficariam iguais.
- **(d) Seco**, só a folha se move. A volta pelo gesto do iPhone continua
  animada pelo sistema, e o resto do app não — duas histórias.

**D3 · O modo de sessão entra como?**
- **(a) Como qualquer tela cheia, da direita.** Um modelo só; o Voltar e o
  gesto contam a mesma história. **Recomendo.**
- **(b) Sobe de baixo, como "modo"** que cobre o resto. Diferencia o treino dos
  destinos, mas a seta "‹" e o gesto de borda passariam a desfazer um movimento
  vertical com um horizontal.
- **(c) Cresce da faixa ou do cartão** que o abriu. Diz de onde veio com
  precisão, mas a volta precisa de um lugar para "encolher" — e no Agora a faixa
  não existe. Mais caro e anima tamanho, não só `transform`.

**D4 · O quadro a mais na troca de camada** (entrar e sair do modo inclusive)
- **(a) Aceitar ~1 quadro** antes do desenho novo, em troca da animação com
  ida e volta coerentes. **Recomendo** — não toca em registrar série, e o toque
  no meio pula.
- **(b) Animar tudo menos o modo**: o modo troca seco, as outras camadas se
  movem. Zero quadro no treino; o modelo perde a coerência justamente na camada
  mais usada.
- **(c) Não animar camada nenhuma além da folha** (a doutrina de 06/10).

**D5 · Quanto tempo?** (os números finais são do `06-sistema.md`; o gosto é dele)
- **(a) Rápido: 200 ms ida, 170 volta, aba 150.** Quase não se vê; diz menos.
- **(b) Médio: 240 ida, 200 volta, aba 180.** O que a direção D tinha para a
  folha (240). **Recomendo.**
- **(c) Como o iPhone: ~350 ms, com mola.** Familiar, mas a mola é a
  "elasticidade" que a doutrina proíbe, e 350 ms é tempo que se espera.

**D6 · O que o movimento reduzido deixa?** (a palavra final é do `05-acessibilidade.md`)
- **(a) Troca seca**, como hoje. Falha fechado. **Recomendo.**
- **(b) Só opacidade, 100–120 ms, sem deslocamento.** Ainda diz "mudou", sem
  movimento que incomode o vestíbulo; mas é animação para quem pediu menos.

---

## 6. Notas para os outros documentos

- **Inventário (01) e sistema (06):** a subida da folha (decisão 14) não está no
  código de `a22b09d`; `DESIGN.md:286-292` ainda a lista como recusada, contra
  `DESIGN.md:62-68`. `src/tokens.css:58-65` diz que o portão é por adesão
  (`no-preference`), mas o que existe é por exclusão (`src/base.css:374-380`).
  O indicador anima `left` (`componentes.css:270`).
- **Fundação:** a ordem rolar-antes-de-desenhar em `fechaModoDeSessao` e
  `fechaAjustes` corta a rolagem (seção 0) — conserto independente do motion.
  O comentário de `src/componentes.css:578-586` sobre o gesto de borda está
  desatualizado.
- **Desempenho (04):** custo do `render()` por tela em `navegacao-custo.mjs`;
  o WebKit do Playwright roda nesta máquina com um invólucro que acrescenta
  `~/.cache/ms-playwright/webkit-deps-noble` ao `LD_LIBRARY_PATH` (o
  `MiniBrowser` do cache sobrescreve a variável).
- **Revisor (07):** `navegacao-prototipo.mjs` com `LENTO=1` grava capturas a
  25/50/75 % de cada transição; serve de molde para o "depois".

---

## 7. O que não consegui verificar

- **A transição no iPhone real.** O WebKit medido é o do Playwright no Linux,
  sem placa de vídeo: confirma o comportamento (rolagem, toque, nada
  transbordando), não a fluidez nem a barra de status sob a foto no app
  instalado.
- **O gesto de borda no app instalado do dono** e se o `popstate` dele chega
  com `hasUAVisualTransition` verdadeiro. A fonte do gesto em PWA é o iOS 12.2;
  nada aqui o roda.
- **A cor da tela de abertura no iPhone** com o manifesto escuro (T9).
- **Se 20 px e 240 ms se percebem como direção ou só como atraso.** Ninguém
  tocou; é o mesmo buraco que a frente 4 registrou para a folha.

---

## 8. As medições

Todas contra `python3 -m http.server 4722 -d dist`, a 414 × 896, ×2, `isMobile`,
`hasTouch`, com `CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`.

| script | o que mede |
|---|---|
| `navegacao-hoje.mjs` | o comportamento de `a22b09d`: altura das abas, rolagem antes/dentro/depois de cada destino (botão e Voltar), histórico, folhas e véus, o que fica montado sob tela cheia, o corte pela faixa |
| `navegacao-prototipo.mjs` | o protótipo injetado: tempos, rolagem devolvida, transbordo por quadro, toque no meio (`MOTOR=webkit WK=<invólucro>`, `RAIZ=0` para a variante descartada, `LENTO=1` para capturas) |
| `navegacao-armadilha.mjs` | `translateX(+)` e transição de página com barra de rolagem clássica, com e sem o `clip` do body |
| `navegacao-giro.mjs` | o cartão aberto ao deitar e ao voltar, nos dois motores |
| `navegacao-custo.mjs` | o custo de um `render()` com cada tela na frente |

Fontes externas: [WebKit Features in Safari 18.0](https://webkit.org/blog/15865/webkit-features-in-safari-18/)
(View Transitions de mesmo documento); [Safari 18.2 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-18_2-release-notes)
(entre documentos); [MDN, `PopStateEvent.hasUAVisualTransition`](https://developer.mozilla.org/docs/Web/API/PopStateEvent/hasUAVisualTransition);
[Firtman, "What's new on iOS 12.2 for PWAs"](https://medium.com/@firt/whats-new-on-ios-12-2-for-progressive-web-apps-75c348f8e945)
(gesto de borda no app instalado); ["View Transitions: careful not to make stuff unclickable"](https://blog.master.dev/view-transitions-careful-not-to-make-stuff-unclickable/)
(o toque durante a transição); lista de aparelhos do iOS 26 (iPhone 11 em diante).
