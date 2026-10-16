# 09 · Implementação do motion

Fase 3. Uma seção por peça, escrita por quem implementou, antes de o
coordenador conferir o diff e fazer o commit. Cada seção diz o que mudou por
arquivo, as decisões tomadas no caminho (com o porquê), o que a guarda cobre e
como se provou que ela reprova, o que ficou de fora, e as saídas de
`npm run tipos`, `npm run build` e `npx vitest run`.

---

## Peça 0 · O sistema

Implementada em 16/10, sobre `a22b09d`, sem commit. Espec: `08-parecer.md` §4
(peça 0) e §5.1, as respostas do dono em `00-coordenacao.md` (16/10, 01h25),
`06-sistema.md` §1, §2, §4 e §5, `05-acessibilidade.md` §1.4 e
`04-desempenho.md` §1.6.

### Em uma página

- **O que ele vê de diferente: duas coisas, as duas previstas.** O fio da aba
  anda em `transform` em 160 ms (era `left` em 220 ms) e o clarão da câmera dura
  200 ms (era 320 ms). Nada mais muda na tela.
- **Sob "Reduzir movimento" o resultado é o de hoje**, medido no Chromium e no
  WebKit: o ponto ao vivo aceso e parado, o fio saltando para a aba, a barra do
  descanso em degraus de 250 ms. O clarão ficou melhor que hoje: antes ele ainda
  nascia a 90 % de branco e apagava em 0,01 ms; agora nem aparece.
- **Os tokens são os das respostas** (`src/tokens.css`), o princípio 6 e o
  `DESIGN.md` (inegociável 6 e §Movimento, com a tabela verdadeira) foram
  reescritos, o bloco universal saiu de `base.css`, e todo movimento que existe
  — os quatro do app e os três da bancada — mora no portão por adesão.
- **A porta** `src/ui/movimento.js` existe, tipada (`// @ts-check`, checada pelo
  `tsc`), e a bancada já passa por ela.
- **A guarda** tem os cinco casos (a)–(e), o caso da porta, a metade de DOM do
  (d) e o caso da lista de folhas contra o disco. Cada caso foi visto vermelho
  com a violação plantada (52 plantios: 47 que tinham de ficar vermelhos e 5
  controles que tinham de ficar verdes, todos com o resultado esperado), e a
  guarda nova, rodada contra o código de `a22b09d`, reprova exatamente o que a
  06 dizia que reprovaria.
- **`tipos` limpo, `build` ok, `vitest` com 1592 de 1593.** O vermelho que sobra
  é pré-existente e não é de motion (ver "O que ficou de fora").

### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/tokens.css` | Princípio 6 reescrito (a doutrina da 06 §1 com a 08 §5.1: ultrapassagem só no quique, o portão com a porta, o que caiu). O bloco "Movimento" substitui o de antes: `--ins-curva` (era `--ins-ease`), `--ins-curva-camada`, `--ins-curva-grandeza`, `--ins-curva-ciclo`; `--ins-dur-toque` 120 (sem o "aprovado"), `-lugar` 160, `-entra` 350, `-sai` 350, `-quique` 640, `-clarao` 200, `-dissolve` 120, `-amostra` 250, `--ins-ciclo-vivo` 2.4s; `--ins-pousa` 4px, `--ins-sobe-aviso` 8px. `--ins-dur` (220) saiu. Os `@keyframes ins-quique` moram aqui. Cada token com o que é, quando usar e quando não. |
| `src/base.css` | O bloco universal `*` sob `reduce` (`:374-380`) saiu, com o comentário que conta por quê. O pulso (`.ins-live-dot`) entrou no portão, em `var(--ins-ciclo-vivo) var(--ins-curva-ciclo) infinite`. O cabeçalho "um dos quatro que o app tem" saiu. |
| `src/componentes.css` | O fio da aba: `transform` no portão (`--ins-dur-lugar`, `--ins-curva`), invólucro da largura da barra e o fio no `<i>` de dentro (ver decisão 4); `overflow-x: clip` na `.ins-tabbar`. A barra `#tfill`: transição no portão (`--ins-dur-amostra`, `--ins-curva-grandeza`). O clarão: fora do portão `opacity: 0` (o último quadro), dentro `cam-clarao var(--ins-dur-clarao) var(--ins-curva) both`; o portão local de `reduce` (`1ms`) saiu. O comentário que apontava para o universal saiu. |
| `src/palco.css` | Os tempos e a curva da bancada viraram tokens no `:root` dela (`--pl-dur-pousa`, `--pl-dur-painel`, `--pl-atraso-painel`, `--pl-dur-vira`, `--pl-curva`), e as três animações entraram no portão por adesão; o bloco local de `reduce` saiu. A licença 3 do cabeçalho deixou de dizer "quase nenhum movimento… os quatro dele e mais nenhum". |
| `src/palco.js` | A leitura única de `matchMedia('(prefers-reduced-motion: reduce)')` ao montar saiu; o pouso e a virada perguntam `podeMover()` na hora. |
| `src/ui/movimento.js` (novo) | A porta: `podeMover()`, `podeDissolver()`, `tempo(nome)`. Por adesão, lida a cada chamada, `false`/`0` quando não sabe (sem `matchMedia`, `matchMedia` que lança, valor de token ilegível). `podeDissolver()` é `reduce` (resposta 2: esmaece ao chegar); `tempo()` devolve 0 sob a preferência, menos `--ins-dur-dissolve`. JSDoc com `// @ts-check`: o `tsc` do `npm run tipos` checa o arquivo (conferido plantando um erro de tipo). |
| `src/ui/instrumento/tabbar.jsx` | O fio sai de `left:N%` para `transform:translateX(i × 20%)` no invólucro, com o fio num `<i>` de um quinto da barra. |
| `src/main.jsx` | `clarao()` sem `setTimeout`: o disparo que guardou ganha um número (contador), que é a chave do nó; `capturaAgora()` limpa o clarão na próxima tentativa; `cameraViva()` expõe `disparo`. Comentários falsos: o `voa()` (`:5251`) e o "o sistema tem exatamente dois movimentos" de `mostraExercicio` (`:5037`). |
| `src/ui/telas/camera.jsx` | `<div key={d.disparo} class="cam-clarao">`: um nó por foto. |
| `src/ui/instrumento/folha.jsx` | O comentário do "sem portal" passa a citar o caso (d) pelo nome novo, e `.ins-modo`. |
| `index.html` | O comentário do `voa()` (`:61`) saiu. |
| `DESIGN.md` | Inegociável 6 reescrito; §Movimento reescrita inteira: os tokens, a tabela verdadeira dos movimentos depois da peça 0 (as peças seguintes acrescentam linhas), o que fica sem movimento, só transform e opacity, o portão e a porta, a saída do universal, **o pulso infinito descumprindo o 2.2.2 por decisão do dono de 16/10**, a barra em degraus sob `reduce`, a guarda, o que caiu e o que ficou. A linha 6 da tabela das licenças da bancada. |
| `tests/dominio/estilo.test.ts` | O caso de `:1028` (contenção) e o de `:1144` (o universal) saíram do meio do arquivo e voltaram reescritos na seção nova "O movimento", no fim: leitores `lida()` (regra a regra, com a pilha de `@media`, e os `@keyframes` quadro a quadro), e os casos (a)–(e), o da porta e o da lista de folhas. `ANCESTRAL` passou a ser montado da lista compartilhada, e `raizDe()` tira pseudo-elemento com parênteses. |
| `tests/ancestrais-de-fixo.js` (novo) | A lista `ANCESTRAIS_DE_FIXO` (`html`, `body`, `:root`, `*`, `#app`, `.ins-modo`, `.ins-travado`), uma só para as duas metades do (d). |
| `tests/fluxo/movimento.test.js` (novo) | A metade de DOM do (d). |
| `tests/fluxo/protocolo.test.js` | O caso do disparo deixa de cobrar "o clarão apaga sozinho em 400 ms" (era o relógio) e passa a cobrar que a segunda foto ganha um nó NOVO de clarão. |
| `tests/fluxo/serie.test.js` | O comentário do `voa()` (`:263`). |

### As decisões, com o porquê

1. **O quique é `@keyframes ins-quique` em `tokens.css`, e não um token
   `linear()`.** São os quadros exatos que o dono viu e escolheu na página das
   decisões (de `translateY(100%)` a `-8%` aos 55 %, `3%` aos 80 %, `0` aos
   100 %, com `cubic-bezier(.3,.7,.4,1)` no primeiro trecho e `ease-in-out` nos
   outros dois, em 640 ms). Um `linear()` seria uma aproximação amostrada da
   mesma forma, ilegível na revisão e sem os números que o dono aprovou à vista;
   e um navegador sem `linear()` descartaria a declaração inteira. Os quadros
   moram nos tokens porque cada trecho traz a curva dele — e curva nasce nos
   tokens —, e a guarda (a) lê os quadros: ultrapassagem só é aceita neles, o
   quique é definido uma vez só (um `@keyframes` de mesmo nome numa folha de
   depois venceria em silêncio) e anda casado com `--ins-dur-quique` nos dois
   sentidos. A curva da declaração que o usar não vale para ele (os três trechos
   têm a sua); o comentário diz para escrever `var(--ins-curva-camada)`, e a
   guarda exige uma curva por item como em todo o resto.
2. **`--ins-dur-clarao: 200ms` é um token a mais.** O pedido diz "o clarão passa
   a 200 ms" (06 §4.2), e na 06 os 200 eram `--ins-dur-sai`. Com as respostas a
   saída passou a 350, e nenhum token da lista ficou em 200. O menor desvio é
   um token próprio, com o papel escrito ("só o clarão; com o tempo da camada o
   branco ficaria o dobro na tela"), em vez de usar 350 contra o pedido ou um
   `calc()` sem sentido. A curva é `--ins-curva` (era `ease-out`), como a 06
   pedia.
3. **`--ins-curva-ciclo` é `cubic-bezier(.25, .1, .25, 1)`**, o `ease` do
   navegador escrito por extenso: o pulso sempre rodou nele por omissão, e o
   pedido era manter o que se vê. Medido: no mesmo instante, o ponto mede
   0,5871 de opacidade antes e depois no Chromium, 0,5626 nos dois no WebKit.
4. **O fio anda num invólucro da largura da barra.** A primeira versão
   (`width: 20%; transform: translateX(i × 100%)`) ficou certa no Chromium e
   errada no WebKit: ele resolve a porcentagem do `translate` contra a caixa
   arredondada para o pixel inteiro (82,8 → 83), e na quinta aba o fio parava
   0,8 px à direita (medido: x 332 em vez de 331,19). Contra a barra inteira
   (414, inteiro) a conta fecha: o invólucro anda `i × 20%` dela e o fio é o
   `<i>` de dentro, com um quinto. Medido a 3× com fotos pixel a pixel da faixa
   do fio, contra o build de `a22b09d`: o centro do fio fica a no máximo 0,13 px
   (WebKit) e 0,4 px (Chromium) de onde ficava, e a diferença que sobra é de
   borda — com `left` o layout encaixava o fio no pixel do aparelho; em
   `transform` ele fica na posição exata (82,8 × i) e a borda sai suavizada numa
   coluna. Na aba Agora (i = 0) as fotos são idênticas byte a byte nos dois
   motores. Duas proteções junto: `overflow-x: clip` na barra (o invólucro anda
   para a direita e passa da borda; fixo não soma rolagem, medido — largura
   rolável 414 com o fio na quinta aba, no meio e no fim da transição, nos dois
   motores —, mas o corte fica escrito, e `clip` não cria contêiner de rolagem);
   e `pointer-events` (o invólucro deixa o toque passar e o fio, como antes,
   cobre a borda de cima da aba acesa — o alvo de toque é o mesmo de hoje).
   Uma variante com `scaleX(.2)` foi medida e descartada: suavizava a borda até
   na aba Agora.
5. **O clarão: chave por contador, limpo na próxima tentativa, sem gate no
   JavaScript.** Um nó por foto (`key`) é o que faz a animação recomeçar sem
   relógio. Contador e não `Date.now()`: com o relógio fixo (os testes fixam), dois
   disparos teriam a mesma chave e o segundo não clarearia. O nó fica montado
   depois de apagar (opacidade 0, sem toque) até a próxima tentativa de foto,
   que o limpa: a pose que não coube não herda o clarão. A 06 §2.4 sugeria
   também "o JS nem o monta sob `reduce`"; não fiz, porque fora do portão o nó já
   nasce apagado (é o último quadro), e o gate no JS faria os testes de fluxo
   (jsdom, sem `matchMedia`) só verem o caminho parado. Consequência dita:
   `cameraViva().clarao` agora fica verdadeiro até a próxima tentativa (antes
   voltava a falso em 320 ms). É estado de apresentação; nada da câmera grava
   diferente, e o caso de fluxo foi ajustado a isso.
6. **A lista de ancestrais mora em `tests/ancestrais-de-fixo.js`**, e inclui
   `.ins-travado`. A metade de DOM anota id e classes de cada ancestral, e a
   classe que o `body` ganha com folha aberta apareceu ali; uma regra escrita só
   com ela alcançaria o ancestral de todo fixo, então ela é nome da lista, como
   `body`. Os nomes que a árvore mostrou: `html`, `body`, `body.ins-travado`,
   `#app`, `div.ins-modo` — e só.
7. **O teto de 300 ms da 04 não é cobrado.** Caiu com a resposta 1 (camada em
   350, quique em 640), e o coordenador registrou isso. A guarda cobra o que
   ficou de pé: nenhuma curva quica, e quadro que passa do destino só no quique.
8. **`will-change`: proibido em toda folha, com uma lista de exceção vazia.**
   Os dois motores compõem `transform` e `opacity` sem ele (04 R5), e no
   ancestral de um fixo ele contém.
9. **`!important` sai do valor antes de a guarda ler.** Sem isso o
   `transition: none !important` do universal lia como "anima `all`" — achado ao
   rodar a guarda contra `a22b09d`.

### O que a guarda cobre, e como provei que ela reprova

Os casos estão em `tests/dominio/estilo.test.ts`, seção "O movimento", e em
`tests/fluxo/movimento.test.js`. Cada um falha nomeando arquivo, linha, seletor
e declaração.

| caso | cobra |
|---|---|
| a lista de folhas é a do disco | `src/**/*.css` = `FOLHAS` + `FOLHA_BANCADA`, nos dois sentidos (o caso que `:84-86` prometia) |
| (a) | `transition*`/`animation*` sem número de tempo, sem `cubic-bezier`/`steps`/`linear()` e sem palavra de curva; cada item com o token de tempo **e** o de curva (`--ins-dur-`/`--ins-ciclo-` e `--ins-curva`; na bancada, `--pl-`); curva literal dentro de `@keyframes` só nos tokens; custom property de tempo ou curva só nos tokens; nos tokens, nenhum ponto de controle fora de [0, 1], nenhum `steps()`, `linear()` fora de [0, 1] só num token de nome "quique"; quadro que passa do destino só em `ins-quique`, definido uma vez, em `tokens.css`, e casado com `--ins-dur-quique`; `setInterval(pintaTimer, N)` com N = `--ins-dur-amostra` |
| (b) | toda declaração de movimento dentro de `no-preference` — ou, sob `reduce`, só esmaecer em `--ins-dur-dissolve`, e só onde sem a preferência também há movimento; fora do portão, o elemento no último quadro de cada animação (propriedade a propriedade, por componente); toda animação com `@keyframes`; `scroll-behavior` só `auto`; nada de movimento em atributo `style` nem escrito pelo JS; `matchMedia` de movimento, `startViewTransition`, `.animate(`, `requestAnimationFrame` e `'smooth'` só na porta |
| (b) a porta | em node, sem janela: `podeMover()` falso e `tempo()` 0; `matchMedia` que lança: falso; a resposta muda entre duas perguntas e a segunda sabe; `tempo()` lê o token na hora, em ms e em s, e 0 para o ilegível; sob `reduce`, 0 para tudo menos `--ins-dur-dissolve` |
| (c) | só `transform`, `translate`, `scale`, `opacity` se movem (sob `reduce`, só `opacity`); transição sem propriedade é `all` e reprova; o centrado por `translateX(-50%)` não anima `transform` |
| (d) fonte | regra de `ANCESTRAIS_DE_FIXO` (fora os `::view-transition*`) sem `transform`, `translate`, `scale`, `rotate`, `filter`, `perspective`, `backdrop-filter`, `will-change`, `contain`, `container*`, `content-visibility`, e sem animar outra coisa que opacidade; `will-change` em lugar nenhum |
| (d) DOM | abre o Agora com descanso e aviso, uma folha, os Ajustes, o modo com a pergunta de 1h30, o painel de pare, o aviso de falha e a faixa de não guardado, e a abertura que falhou; todo fixo das folhas foi visitado; todo ancestral de fixo está na lista; todo nome da lista foi visto |
| (e) | nenhum `transition`/`animation` + `end`/`start`/`run`/`cancel`/`iteration` (com e sem `on`), nenhum `.finished`, `.ready`, `.updateCallbackDone`, em todo o JS, a porta inclusive (comentários não contam) |

**Plantio.** Um script em scratchpad aplicou cada violação no arquivo, rodou
só o caso, registrou e devolveu o arquivo original. Os 52, todos com o
resultado esperado:

- **Lista de folhas** — vermelho com `src/movimento.css` novo e com
  `protocolo.css` sumido.
- **(a)** — vermelho com: `160ms` solto; `ease-out` solto; item sem curva;
  `--minha-dur: 200ms` numa regra; `--ins-curva` com `y` 1,4; um
  `@keyframes ins-mola` que passa do destino; um segundo `ins-quique` em
  `componentes.css`; `setInterval(pintaTimer, 200)`; `linear(0, 1.2 50%, 1)`
  num token que não é o quique; `ease-in` dentro de `@keyframes cam-clarao`;
  `520ms` na bancada; `ins-quique` em `--ins-dur-entra`.
- **(b)** — vermelho com: a animação do pulso fora do portão; uma transição
  dentro de `@media (orientation…)` sem o portão; o pulso no bloco `reduce`;
  um esmaecer sob `reduce` num seletor que fica parado sem a preferência;
  `.cam-clarao` sem o `opacity: 0` de fora; `scroll-behavior: smooth`;
  `transition` no `style` da `TabBar`; `style.transition` no JS; a
  `matchMedia` de movimento de volta em `palco.js`; `behavior: 'smooth'`; uma
  animação sem `@keyframes`. **A porta** — vermelho com: "sim" sem
  `matchMedia`; a resposta guardada na primeira pergunta; tempo devolvido sob
  `reduce`. Verde, como devia: o esmaecer legítimo (`.ins-tab-ind`, que também
  anima no portão).
- **(c)** — vermelho com: o fio de volta em `left`; transição sem propriedade;
  `height` num `@keyframes`; `#toast` animando `transform`; esmaecer sob
  `reduce` que move `transform`. Verde, como devia: `#toast` animando
  `translate`.
- **(d)** — vermelho com: `transform` no `.ins-modo`; `translate` no `#app`;
  animação de `transform` no `.ins-modo` dentro do portão; `will-change` num
  elemento qualquer; `content-visibility` no `body.ins-travado`; e
  `overflow-y: auto` no `.ins-modo` (o caso do sticky, que usa a mesma lista).
  Verde, como devia: `html::view-transition-new(root)` animando (árvore à
  parte) e `#app` animando só opacidade. **Metade de DOM** — vermelho com: a
  lista sem `.ins-modo` (como era até hoje); a lista sem `.ins-travado`; um
  nome que nenhum fixo tem (`.tc`); um fixo novo nas folhas que o caso não abre.
- **(e)** — vermelho com: `addEventListener('transitionend', …)`;
  `onAnimationEnd` no JSX; `.finished.then(…)`; e um `onAnimationEnd` posto
  logo depois de um `accept="image/*"` (prova que o `/*` dentro de aspas não
  abre comentário e esconde o resto do arquivo). Verde, como devia: o nome do
  evento num comentário.

**Contra o código de antes.** A guarda nova, rodada numa cópia de `a22b09d`
(`git archive`, em scratchpad): (a) reprova o pulso (2,4 s, curva por
omissão), o universal (`.01ms`), o fio (`--ins-dur`/`--ins-ease`), a barra
(`.25s linear`), o clarão (`320ms ease-out` e o `1ms`) e os três da bancada;
(b) reprova os mesmos por estarem fora do portão; (c) reprova o fio em `left` —
o único; (d) e (e) passam. É a lista "hoje reprovaria" da 06 §5, linha a linha.

### Medido no navegador

Chromium 1234 e WebKit 26.5 (Playwright), 414 × 896, o build de `a22b09d`
contra o novo, sem preferência e com "Reduzir movimento" (scripts em
scratchpad, servidos nas portas 4741 e 4742).

| | antes | depois |
|---|---|---|
| fio, lugar final nas cinco abas (Chromium; x / largura) | 0 · 82,8 · 165,59 · 248,39 · 331,19 / 82,8 | 0 · 82,8 · 165,6 · 248,4 · 331,2 / 82,8 (o fio) |
| fio, transição | `left 220ms cubic-bezier(.2,.8,.2,1)` | `transform 160ms cubic-bezier(.2,.8,.2,1)` |
| fio sob `reduce` | salta | salta |
| ponto ao vivo | `ins-pulse` 2400 ms, infinito | igual (mesma opacidade no mesmo instante) |
| ponto sob `reduce` | aceso (1), parado | aceso (1), parado |
| barra do descanso | `transform .25s linear` | igual |
| barra sob `reduce` | sem transição | sem transição |
| clarão | 320 ms, .9 → 0 | 200 ms, .9 → 0 |
| clarão sob `reduce` | nasce a .9 e apaga em 0,01 ms | nasce apagado (0), sem animação |
| erros de página | nenhum | nenhum |

No WebKit, os mesmos resultados; o lugar do fio, pela foto pixel a pixel
(decisão 4).

### O que ficou de fora, e por quê

- **As regras de `::view-transition-*` fora do portão** (06 §4.4, item 2): são
  da peça 5, que traz o `startViewTransition`. Hoje nada chama a transição de
  vista, e a guarda (b) já proíbe chamá-la fora da porta.
- **Tokens sem consumidor ainda**: `--ins-curva-camada`, `--ins-dur-toque`,
  `-entra`, `-sai`, `-quique`, `-dissolve`, `--ins-pousa`, `--ins-sobe-aviso`
  e `ins-quique` esperam as peças 1 a 5; `tempo()` e `podeDissolver()` também.
  Nada no app escala, desliza nem esmaece por eles hoje.
- **"Nenhuma saída tem quique"** não se cobra por fonte (a fonte não sabe a
  direção de uma animação). Fica na doutrina; a guarda cobra o que dá: o
  quique só nos quadros dele, casado com o tempo dele.
- **Atributos em ancestrais** (`[data-theme]`, `[data-palco]` no `html`): a
  metade de DOM confere id e classes, não atributos. Uma regra só de atributo
  com `transform` alcançaria o `html` sem ser pega. Nenhuma existe; ficou dito.
- **O andador de JSX do caso "todo botão tem estilo de base"** continua com
  `fs.readFileSync` solto (a 06 §5.0 sugeria o registro). Não é de motion; os
  casos novos leem pelo registro.
- **Comentários de JS**: a guarda tira `/* */` e `//` só quando começam
  comentário de verdade (depois de espaço, `{`, `;`, `(`, `)`, `,`, ou no começo
  da linha). É heurística; o plantio E5 prova o caso que importava
  (`accept="image/*"`).
- **O vermelho que sobra na suíte** — `tests/fluxo/agora.test.js`, "o Agora
  mostra os 14 dias, e a janela é a MESMA que o portão lê" (10 ≠ 11) — já
  falhava antes de qualquer mudança desta peça (01h45, a primeira rodada) e
  falha igual numa cópia de `a22b09d` construída à parte. O caso fixa o relógio
  no dia 15 do mês e algo na janela dos 14 dias lê o dia de verdade (hoje, 16);
  não é motion, e não mexi.
- **Nada foi visto num iPhone de verdade.** O WebKit desta máquina prova
  comportamento e lugar, não fluidez.

### As saídas

`npm run tipos`:

```
> lastro-app@2.0.0 tipos
> tsc --noEmit

(saída 0)
```

`npm run build`:

```
> lastro-app@2.0.0 build
> vite build

vite v7.3.6 building client environment for production...
transforming...
✓ 84 modules transformed.
src/main.jsx (7182:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-CHAVzhBx.css  102.66 kB │ gzip:  18.21 kB
dist/assets/index-DRSB6EVf.js   576.17 kB │ gzip: 179.82 kB

(!) Some chunks are larger than 500 kB after minification. […]
✓ built in 1.60s
(saída 0)
```

`npx vitest run`:

```
 ❯ |fluxo| tests/fluxo/agora.test.js (77 tests | 1 failed) 33697ms
   × o Agora mostra os 14 dias, e a janela é a MESMA que o portão lê 312ms

 FAIL  |fluxo| tests/fluxo/agora.test.js > o Agora mostra os 14 dias, e a janela é a MESMA que o portão lê
AssertionError: e a contagem é a do portão: 10 — 10 de 14 dias com registro
10 !== 11

 Test Files  1 failed | 72 passed (73)
      Tests  1 failed | 1592 passed (1593)
   Start at  02:17:06
   Duration  56.15s
(saída 1)
```

Antes desta peça, no mesmo dia: `Tests 1 failed | 1586 passed (1587)`, o mesmo
caso. A diferença (+6) são os casos novos: na `estilo.test.ts` saíram dois e
entraram sete; em `movimento.test.js`, um.
