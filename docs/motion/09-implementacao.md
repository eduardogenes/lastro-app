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

---

## Peça 1 · O toque que escurece

Implementada em 16/10, sobre `73df730`, sem commit. Espec: `08-parecer.md` §4
(peça 1) e §5.1 (resposta 7: **só escurece**, nenhum controle escala),
`00-coordenacao.md` (16/10, 01h25), `03-micro.md` §1.3, §1.4, §4.1 (a parte do
preenchimento), §4.10 e §10, o requisito 13 da frente 4
(`docs/redesign/09-frente4-sistema.md:2171-2182`) e a linha da peça 1 do
`07-revisao-base.md` §1.4.

### Em uma página

- **O que ele vê de diferente: todo controle escurece enquanto o dedo está
  nele, e nada encolhe.** Igual com "Reduzir movimento". No iPhone isso passa a
  acontecer de fato: o app ganhou o ouvinte vazio e passivo de `touchstart` sem
  o qual o Safari do iOS não aplica `:active`.
- **Antes:** de 115 controles do app, 78 não mudavam nada com o dedo pousado, e
  o mais forte dos outros media 1,24:1 (claro) e 1,31:1 (escuro); o "+1 copo"
  trocava para a cor exata do bloco em volta (1,00:1). Com o dedo de verdade no
  WebKit, 14 de 23 controles da sessão e do Agora não mudavam um pixel.
  **Depois:** os 115, nos dois temas, entre 1,56 e 1,72:1 contra o repouso **e**
  contra o fundo atrás (na árvore do teste, que abre também o verbo do pare
  destrutivo, o mais fraco é ele, 1,51); no WebKit, 80 a 99% dos pixels da caixa
  de cada um dos 23 mudam, a 1,70–1,73:1 — e igual sob "Reduzir movimento".
- **Uma camada, não uma cor.** A seção "O TOQUE" de `base.css` pinta uma camada
  translúcida (`background-image`) sobre o repouso de qualquer controle: o
  transparente escurece o fundo atrás dele, o preenchido escurece o próprio
  preenchimento. Os onze `:active` que trocavam o fundo saíram.
- **Na hora, sem transição.** O estado é a mensagem; uma soltura que apagasse
  aos poucos seria movimento novo (o dono escolheu "nenhum movimento novo") e só
  tocaria onde o nó sobrevive ao `render()`. `--ins-dur-toque` saiu com o
  afundar.
- **A régua é 1,5:1**, nos dois temas, contra o repouso e contra o fundo, coberta
  por dois testes: o caso (f) de `estilo.test.ts` (fonte) e
  `tests/fluxo/toque.test.js` (a árvore montada: 27 estados de tela, 9.192
  conferências). 26 plantios, todos com o resultado esperado; contra o build
  de antes os dois casos de árvore ficam vermelhos (0 ouvintes de
  `touchstart`; 9.188 de 9.192 conferências abaixo de 1,5).
- **`tipos` limpo, `build` ok, `vitest` 1596 de 1596.**

### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/tokens.css` | Três nomes novos na paleta: `--ins-toque-papel` (claro `rgba(21, 23, 26, .25)`, a tinta a 25%; escuro `rgba(242, 241, 238, .18)`, que CLAREIA), `--ins-toque-cheio` (claro `rgba(0, 0, 0, .42)`; escuro `rgba(0, 0, 0, .22)`), nos três blocos de tema, e `--ins-toque: var(--ins-toque-papel)` no `:root` — a camada DE CADA controle, que nasce papel. Comentário com a régua de 1,5 e o porquê de dois tons. "Vinte tokens" virou "Vinte e dois". `--ins-dur-toque` saiu (o comentário diz por quê), e saíram as duas menções a ele (`--ins-curva`, `--ins-dur-dissolve`). |
| `src/base.css` | A seção "O TOQUE", logo depois do reset de `button`: `button:active` numa regra, e `label:has(input[type="file"]):active`, `label:has(input[type="checkbox"]):active`, `.ex-top:active:not(:has(button:active))` noutra (decisão 7), as duas com `background-image: linear-gradient(var(--ins-toque), var(--ins-toque)) !important`, fora de toda `@media`. `.ins-btn-primary` e `.ins-chip.on` declaram `--ins-toque: var(--ins-toque-cheio)`. Saíram `.ins-btn-primary:active`, `.ins-btn-secondary:active`, `.ins-btn-add:active`, `.ins-stepper-btn:active`. |
| `src/treino.css` | `.rirop.on`, `.chip.on, .chip.sel`, `.day-ini`, `.ctrl-b.fim, .ctrl-b.ini` declaram a camada do cheio. Saíram `.rirop:active`, `.rest:active`, `.histbtn:active`, `.day-ini:active`, `.ctrl-b:active`. A miniatura do aparelho: `.exfoto:active .exfoto-p` ganha a camada (o quadrado cobre o botão), `.exfoto:active img { opacity: .6 }` (a foto apaga, como o "salvar" do ajuste), e a troca do quadrado para `--ins-acento-suave` (≈1,0:1) saiu; o ponto que vira acento ficou. |
| `src/componentes.css` | `.pare-sim`, `.edbar-b`, `.rot button.on`, `.regua-v.on` declaram a camada do cheio; `.dbtn`, que deixa o `.ins-btn-primary` transparente, devolve a do papel (decisão 6). Saíram `.regua-v:active, .regua-anda:active` e `.tcl-t:active`. |
| `src/main.jsx` | `document.addEventListener('touchstart', function () {}, { passive: true })`, no topo do módulo, logo depois da recusa da pinça, com o comentário do porquê. |
| `DESIGN.md` | Inegociável 6: o parágrafo "O toque se vê, e não se move". §Toque: o estado de toque inteiro (a camada, a régua e o porquê, só escurece e na hora, só o tocado, uma camada só, o iPhone, a guarda). §Movimento: a linha de `--ins-dur-toque` saiu da tabela de tokens, `--ins-curva` deixou de citar o toque, e "o que fica sem movimento" começa pelo toque. |
| `tests/dominio/estilo.test.ts` | Seção nova "O TOQUE", caso (f) (ver "O teste"). |
| `tests/fluxo/toque.test.js` (novo) | A árvore: todo controle de 27 estados de tela, com a cascata resolvida, e o ouvinte de `touchstart`. |
| `tests/fluxo/harness.js` | Opção `antesDoApp(w)`: recebe a janela antes de o app rodar (o espião do `addEventListener`). |
| `docs/motion/_medicao/micro-toque.mjs` | Passa a compor as camadas de fundo (cor e gradiente de cor única) da raiz até o nó, e a dar o contraste contra o repouso e contra o fundo. Sem isso o complemento da peça 1 do protocolo (07 §1.4) diria "NADA" para todo controle depois desta peça — a camada é `background-image`, e ele lia só `background-color`. Foi visto dizendo "NADA" nos 27 antes do conserto. |
| `docs/motion/_medicao/micro-toque-todos.mjs` (novo) | Os 116 nós tocáveis (115 controles e o véu) de 24 estados, `:active` forçado, nos dois temas. |
| `docs/motion/_medicao/micro-toque-dedo.mjs` (novo) | O dedo de verdade (ponteiro apertado, sem soltar em cima: sem `click`) em 23 controles, foto da caixa antes e com o dedo, nos dois motores, com e sem "Reduzir movimento". |

### Os contrastes, antes e depois

Medido no Chromium 1234 e no WebKit 26.5 (Playwright), 414 × 896 a ×2, contra
duas cópias do `dist/` em scratchpad — a de `73df730` (o antes) e a final —,
servidas uma de cada vez na porta 4729 (desligada no fim), com o mesmo registro
semeado (a semana anterior inteira, como em `micro-toque.mjs`). Nenhum erro de
página em nenhuma rodada.

**Os 28 controles do 03 §1.3** (`micro-toque.mjs`, Chromium, `:active`
forçado, tema claro; "repouso" é o tocado contra o repouso, "fundo" contra o
fundo de verdade atrás do controle; "—" é nenhuma mudança de fundo):

| controle | antes | depois (repouso · fundo) |
|---|---|---|
| "+1 copo" (Agora) | 1,00 (troca para a cor do bloco) | 1,70 · 1,70 |
| a conta da água | — | 1,70 · 1,70 |
| linha de refeição | — | 1,71 · 1,71 |
| aba | — | 1,73 · 1,73 |
| ⚙ Ajustes | — | 1,71 · 1,71 |
| Comi tudo | 1,24 | 1,72 · 12,21 |
| Metade | 1,08 | 1,71 · 1,71 |
| seta de sair do modo | — | 1,69 · 1,69 |
| Iniciar treino | 1,24 | 1,72 · 12,21 |
| topo do cartão | — | 1,71 · 1,71 |
| célula de CARGA · de REPETIÇÃO · de RIR | — | 1,71 · 1,71 |
| coluna anterior (copia) | não achada pelo script (sem série anterior no estado dele) | na árvore: 1,71 · 1,71 |
| descanso 3min | só a cor do número | 1,71 · 1,71 (e o número continua mudando de cor) |
| + série | 1,09 | 1,71 · 1,71 |
| Trocar · Pular · Histórico | 1,08 | 1,71 · 1,71 |
| Anotar algo · Carga | — | 1,71 · 1,71 |
| valor da régua · seta da régua | 1,08 | 1,71 · 1,71 |
| outro valor | — | 1,71 · 1,71 |
| tecla | 1,08 | 1,71 · 1,71 |
| pronto (teclado) | — | 1,70 · 1,84 |
| valor do RIR | 1,08 | 1,71 · 1,71 |
| −15 · +15 · parar | — | 1,70 · 1,70 |
| chip "Água +1" do descanso | — | 1,71 · 1,71 |
| Pausar · Encerrar | 1,08 | 1,71 · 1,71 |

**Com o dedo de verdade** (`micro-toque-dedo.mjs`: o ponteiro apertado 100 ms,
foto da caixa do controle; "%" é a parte da caixa que muda, e o contraste é o
mediano dos pixels que mudam). No WebKit 26.5:

| controle | antes | depois | depois, "Reduzir movimento" |
|---|---|---|---|
| "+1 copo" | 0% | 88% · 1,70 | igual |
| a conta da água | 0% | 93% · 1,70 | igual |
| linha de refeição | 0% | 96% · 1,71 | igual |
| aba | 0% | 95% · 1,73 | igual |
| ⚙ Ajustes | 0% | 91% · 1,71 | igual |
| Iniciar treino | 97% · 1,24 | 97% · 1,71 | igual |
| topo do cartão | 0% | 87% · 1,71 | igual |
| miniatura do aparelho | 73% · 1,00 (só o matiz) | 95% · 1,70 | igual |
| célula de carga · repetição · RIR | 0% | 98–99% · 1,71 | igual |
| + série | 96% · 1,09 | 96% · 1,71 | igual |
| Trocar · Pular · Histórico | 88% · 1,08 | 89% · 1,71 | igual |
| valor da régua · seta da régua | 84–87% · 1,08 | 85–88% · 1,71 | igual |
| tecla | 91% · 1,08 | 91% · 1,71 | igual |
| pronto (teclado) | 0% | 94% · 1,70 | igual |
| valor do RIR | 86% · 1,08 | 87% · 1,71 | igual |
| −15 · +15 · parar | 0% | 80% · 1,70 | igual |
| chip "Água" do descanso | 0% | 87% · 1,71 | igual |
| Pausar | 92% · 1,08 | 93% · 1,71 | igual |

No Chromium (o mesmo script, ponteiro), os mesmos números a menos de 3 pontos
percentuais. Escala: `none / none` em todos, nos dois motores, antes e depois.

**Os 115 controles** (`micro-toque-todos.mjs`, 24 estados, `:active` forçado;
o script acha 116 nós tocáveis, e o véu da folha fica de fora, ver decisão 8):

| | antes | depois |
|---|---|---|
| claro: sem mudança nenhuma | 78 | 0 |
| claro: o mais forte · o mais fraco | 1,24 · 1,00 | 1,72 · 1,56 (o dia do calendário, branco sobre a tela, contra a tela) |
| escuro: sem mudança nenhuma | 78 | 0 |
| escuro: o mais forte · o mais fraco | 1,31 · 1,00 | 1,72 · 1,57 (a seta de sair do modo, sobre o fundo) |
| abaixo de 1,5 (contra o repouso ou contra o fundo) | 115 | 0 |
| com `transform`/`scale` no toque | 0 | 0 |

**Na árvore do teste** (27 estados, os dois temas, as duas preferências), o mais
fraco de cada família: o verbo do painel de pare 1,51 (claro, `--ins-pare-tinta`
já quase preto) e 1,63 (escuro); o primário e o chip aceso 1,72 (claro) e 1,59
(escuro); o dia do calendário 1,56 contra a tela; o "Criar e adicionar" (o
primário transparente do `.dbtn`) 1,71 e 1,65 — era 1,03:1 no escuro antes da
decisão 6.

**O texto com o dedo em cima.** A camada é fundo e o texto continua por cima
dela, mas o fundo escurece: o nível mais apagado (`--ins-tinta-3`) vai de 5,6
para 3,3:1 sobre a tela tocada no claro (7,7 → 4,7 no escuro); o texto escuro do
chip aceso no escuro, de 7,2 para 4,5:1 — e é por ele que o cheio do escuro
para em 22% (a 24% cairia a 4,3). Branco sobre o acento tocado, no claro, sobe
para 13,5:1. Só enquanto o dedo está no controle, e quase sempre sob ele.

### As decisões, com o porquê

1. **Uma camada sobre o repouso, e não uma cor de destino.** A cor de destino
   (o que existia: `:active { background: X }`) precisa de um X por controle e
   erra em silêncio: o "+1 copo" trocava para `--ins-superficie-2`, que é a cor
   do bloco `.ag-agua` em volta dele (1,00:1), e quase todo o resto ia para o
   mesmo `--ins-superficie-2` sobre a tela (1,08:1). A camada translúcida
   pintada como `background-image` fica por cima de qualquer
   `background-color` de repouso, então o transparente escurece o fundo atrás
   dele e o preenchido escurece o próprio preenchimento — o tocado nunca é
   igual ao repouso nem ao fundo. Uma camada `::before` por cima do conteúdo
   escureceria também o texto e a foto, mas exigiria `position: relative` em
   todo botão, e isso muda quem pinta por cima de quem — e, com isso, quem
   ganha o toque nas áreas estendidas por `::after` (a da régua, a dos chips).
   Mudaria comportamento; ficou de fora.
2. **Na hora, nos dois sentidos, sem transição.** O brief permitia uma soltura
   em `opacity`, com `--ins-dur-toque`, no portão. Não fiz: (a) o dono marcou
   "Só escurece" cuja descrição na página era "Nenhum movimento novo. O toque
   se vê só pela cor"; (b) a soltura só tocaria onde o nó sobrevive ao
   `render()` — a régua, o RIR, o "pronto", o "Comi tudo" e a aba trocam no
   mesmo toque —, então seria desigual entre controles; (c) ela exigiria a
   camada num pseudo-elemento, com o custo da decisão 1; (d) o 07 §1.2 diz do
   toque "sob Reduzir movimento: igual", e estado instantâneo é igual por
   construção. Com isso `--ins-dur-toque` ficou sem papel — era o tempo do
   afundar (06 §2) — e saiu como `--ins-afunda` saiu na peça 0, em vez de
   ficar como token órfão com um comentário falso. **Para o revisor:** 120 ms
   continua na lista de durações do 07 §1.2 por causa de `--ins-dur-dissolve`;
   nenhuma animação de 120 ms nasce desta peça.
3. **1,5:1, e não outro número.** 1,08:1 é o degrau que não se via (o dono se
   queixou disso no P12, e a frente 4 já o chamava de "fraco demais para ser o
   único canal"); o contraste é razão, e 1,5 são cinco desses degraus
   (1,08⁵ ≈ 1,47). É a ordem do que ele apertou e aprovou na página das
   decisões (o cinza `#D6D1C6` dela mede 1,52:1 sobre o branco; o primário de
   lá, 1,24, ficou abaixo e aqui subiu). Mais forte que isso escurece o texto
   mais apagado abaixo de 3:1 sob o dedo (no claro, a 30% a tinta-3 cairia a
   2,9 sobre a tela). A luz da academia ninguém mediu; o que a régua garante é
   que o toque não volte a encolher sem ficar vermelho.
4. **Dois tons, e o escuro CLAREIA o papel.** A conta do contraste não é
   linear: a mesma camada que dá 1,7:1 sobre o papel dá 1,2–1,3:1 sobre o acento
   e o pare do claro, que já são escuros — por isso o cheio tem camada própria,
   mais forte (preto a 42%). No escuro, escurecer o papel não tem para onde ir
   (a tela contra o preto puro mede 1,12:1): o papel clareia (a tinta clara a
   18%), e o cheio, que no escuro é claro, continua escurecendo (preto a 22%).
   "Só escurece" foi a resposta à pergunta "afunda ou só muda de cor"; onde
   escurecer não se vê, o menor desvio é ir para o lado que se vê.
5. **A troca para o cheio mora NA REGRA que pinta o preenchimento** (dez
   regras: `.ins-btn-primary`, `.ins-chip.on`, `.rirop.on`, `.chip.on/.sel`,
   `.day-ini`, `.ctrl-b.fim/.ini`, `.pare-sim`, `.edbar-b`, `.rot button.on`,
   `.regua-v.on`), para os dois não se separarem. `--ins-toque` é a camada de
   cada controle e nasce papel no `:root`; os tokens são `--ins-toque-papel` e
   `--ins-toque-cheio`.
6. **O `.dbtn` devolve a camada do papel.** Achado pelo teste de árvore ao abrir
   o "exercício novo": `ins-btn-primary dbtn` é transparente (o `.dbtn` vem
   depois e repinta), mas herdava a troca para o cheio do primário — preto a 22%
   sobre a tela escura, 1,03:1. A regra que devolve o controle ao papel devolve
   a camada junto. A guarda de fonte cobra que toda troca de camada esteja numa
   regra que pinta o preenchimento que a pede.
7. **O `!important` só existe na camada, e `button:active` mora sozinho.** Todo
   `background:` abreviado de uma regra de controle zera a imagem de fundo, e
   sem o `!important` a camada perdia para a regra mais específica: plantado,
   848 conferências reprovam, a primeira o −15 a 1,00:1 (`#timer button` tem um
   id). As alternativas eram trocar ~160
   `background:` abreviados por `background-color` (uma mudança larga em
   regras que não são do toque) ou inflar a especificidade com um id falso. A
   guarda cobra que ele só apareça nas duas declarações da camada. As regras
   são duas porque um navegador sem `:has()` (Safari antes do 15.4, Chrome
   antes do 105) descarta a regra INTEIRA em que ele aparece: com
   `button:active` na mesma lista, o toque de todo botão iria junto com o do
   rótulo e do topo do cartão. Assim, nesses, só esses dois ficam sem o estado.
8. **O que é controle vem da árvore**: todo `<button>`, todo nó com ouvinte de
   clique do Preact (`el.l`), o `<label>` que abre seletor de arquivo ou marca
   caixa (o "escolher arquivo json", "tirar a foto", "Fotografar a lousa",
   "é um composto"), `role="button"`. Um nó com clique ficou de fora, com o
   motivo escrito no teste: o véu da folha (`.ins-veu`) — tocar fora fecha a
   folha, mas escurecer o véu diria que o fundo reagiu ao dedo. Campos de texto,
   `select` e a barra deslizante têm foco ou interface nativa e não entram.
9. **Só o tocado escurece.** `:active` vale para o tocado e para todos os
   ancestrais. Controle dentro de controle só existe no topo do cartão, que é
   uma linha tocável com a miniatura dentro:
   `.ex-top:active:not(:has(button:active))` — o dedo na miniatura abre a
   câmera, e o cartão inteiro escurecendo diria que ele abre o cartão. A régua
   escurece o botão e nunca a faixa: a faixa não é controle e nenhuma regra a
   pinta com o dedo (o teste cobra: nenhum ancestral muda de camada).
10. **A miniatura do aparelho**: o quadrado de 44 px cobre o botão, então a
    camada vai também para o quadrado; com foto, a foto apaga a 60% (a camada
    não passa por cima de imagem). O caso com foto não foi medido: a foto vem do
    IndexedDB, que os scripts não semeiam. Os outros controles com imagem ou
    forma dentro (a troca de exercício com foto, a linha de refeição com a
    forma) têm a camada visível em volta.
11. **Os `:active` que sobraram** só mudam a cor de um filho ou do texto, e
    ficaram: `.setant-b`, `.restlinha:active b`, `.notabtn` (que repete a cor de
    repouso — inofensivo, fora do escopo), `.dd-diabtn/.dd-tclbtn/.co-ondebtn`,
    `.tc-back`, `.cp-ajustar`, `.aj-salvar` (`opacity: .6`) e o ponto da
    miniatura. Nenhum mexe em forma; a guarda proíbe fundo no sujeito.
12. **O ouvinte de `touchstart`** fica no topo de `src/main.jsx`, que roda uma
    vez, ao lado da recusa da pinça; passivo (não segura a rolagem), vazio (o
    `click` continua sendo quem age). No documento, que é ancestral de tudo.
13. **A bancada também ganhou o estado**: os botões dela (a lista de aparelhos,
    "girar") são `<button>` no documento de fora, que carrega `base.css`. Eles
    passam a escurecer com o mouse apertado. Nada muda no app dentro dela.

### O teste, e como provei que ele reprova

**`tests/dominio/estilo.test.ts`, caso (f)** — a forma e a conta, de fonte:
(1) as regras do toque moram em `base.css`, fora de toda `@media`, pintam a
camada e alcançam `button`, os dois rótulos e o topo do cartão, com
`button:active` sozinho na regra dele; (2) o `!important` do app só existe nas
duas declarações da camada; (3) toda `background-image` do app é a camada, e só com o
dedo; (4) nenhuma regra com `:active` declara `transform`, `translate`,
`scale`, `rotate`, `zoom`, `transition` ou `animation`; (5) fora da regra do
toque, nenhuma regra com o dedo no próprio controle troca o fundo dele; (6) toda
troca de `--ins-toque` mora numa regra que pinta o preenchimento que a pede
(cheio para acento e pare, papel para o resto); (7) `--ins-toque` nasce papel,
as duas camadas existem nos três blocos, os dois escuros iguais, e a camada
sobre cada papel (`fundo`, `tela`, `superficie`, `superficie-2`,
`acento-suave`, `atencao-fundo`, `pare-fundo`) e a do cheio sobre cada cheio
(`acento`, `pare-tinta`) passam de 1,5:1 nos dois temas; (8) todo preenchimento
cheio que pinta um controle — controle tirado do JSX: as classes que algum
`<button>` ou `<label>` pode carregar — tem a camada do cheio.

**`tests/fluxo/toque.test.js`** — a árvore, no build. Dois casos:

- *"todo controle do app escurece com o dedo…"*: abre 27 estados de tela (o
  Agora, a linha aberta, a correção da água, a folha do dia, os outros quatro
  lugares e os Ajustes, o modo de sessão com cartão, série anterior, régua,
  teclado, RIR, descanso, régua com valor aceso, troca, edição do dia,
  exercício novo e menu, o pare nas duas famílias, o aviso de falha e a faixa,
  histórico, programa, retroativo). Em cada um, acha os controles na árvore
  (decisão 8), lê as regras da folha embarcada como o jsdom as parseou e
  resolve a cascata — especificidade, ordem, `!important`, a pilha de `@media`
  (com e sem "Reduzir movimento"), `var()` com herança, o tema claro e o
  escuro por `data-theme` — e compõe as camadas de fundo da raiz até o
  controle, em repouso e com o dedo (o controle e os ancestrais casando
  `:active`). Cobra: tocado contra repouso ≥ 1,5; tocado contra o fundo atrás
  ≥ 1,5; a forma (`transform`, `translate`, `scale`, `rotate`) igual; nenhum
  ancestral mudando de camada; nenhum controle com imagem de fundo em repouso.
  E cobra que olhou o que importa: 25 controles nomeados (o "+1 copo", a
  régua, a célula, o −15, o pare, o rótulo de arquivo, a caixa de marcar…),
  ≥ 80 controles distintos, e a lista de exclusão exata. 9.192 conferências,
  ~13 s: quem casa com cada nó é calculado uma vez por tela e vale para os
  quatro contextos.
- *"o documento tem UM ouvinte de touchstart, vazio e passivo"*: um espião em
  `EventTarget.prototype.addEventListener`, instalado antes do app
  (`antesDoApp`), cobra um e só um ouvinte de `touchstart` no documento, com
  `{ passive: true }`, que chamado não devolve nada nem chama
  `preventDefault`/`stopPropagation`; e nenhum ouvinte de toque não passivo no
  app.

**Contra o build de antes** (a cópia de `dist/` de `73df730`, posta no lugar do
`dist/` só para isso e reconstruída depois): os dois casos ficam vermelhos — o
documento tem **0** ouvintes de `touchstart`, e **9.188 de 9.192** conferências
ficam abaixo de 1,5 (6.892 a 1,00:1 contra o repouso; o melhor dos outros,
1,31:1). As quatro que passavam são um achado: o "Criar e adicionar"
(`ins-btn-primary dbtn`) era transparente em repouso — o `.dbtn` repinta — e no
toque o `.ins-btn-primary:active` o enchia de `--ins-acento-tinta` (8,8 a 9,8:1):
um botão fantasma que piscava cheio. Agora ele escurece como os outros
(decisão 6).

**Plantio** (um script em scratchpad aplica cada violação, constrói quando o
caso é de árvore, roda só os casos do toque, registra e devolve o arquivo; o
último passo reconstrói o limpo). Os 26, rodados contra o código final, todos
com o resultado esperado — dois são controles que tinham de ficar verdes, e três
mostram de propósito o que só uma das metades vê:

| # | a violação plantada | (f), de fonte | a árvore | o ouvinte |
|---|---|---|---|---|
| F1 | as regras do toque somem (o app de antes, em CSS) | vermelho: os quatro controles sem regra | vermelho: 4.908 falhas, a primeira o ⚙ a 1,00:1 | — |
| F2 | as regras dentro do portão de movimento | vermelho: está dentro de `no-preference` | vermelho: 4.107 falhas, todas com "Reduzir movimento" | — |
| F3 | `button:active` sem o `!important` | vermelho: regra do toque sem `!important` | vermelho: 848 falhas, a primeira o −15 a 1,00:1 (`#timer button` tem id) | — |
| F4 | a camada do papel no claro a 10% | vermelho: 7 papéis abaixo, o pior 1,22:1 | vermelho: 4.546 falhas | — |
| F5 | a camada do papel no escuro a 8% (os dois blocos) | vermelho: 7 papéis abaixo, o pior 1,16:1 | vermelho: 4.526 falhas | — |
| F6 | o escuro manual diverge do escuro do aparelho | vermelho | — | — |
| F7 | o primário sem a camada do cheio | — | vermelho: 48 falhas, "Comi tudo" a 1,29:1 | — |
| F8 | o toque volta a afundar (`scale: .95` em `button:active`) | vermelho: `scale` com o dedo | vermelho: 3.580 falhas, "mexe na forma" | — |
| F9 | a faixa da régua escurece com o dedo no botão (`.regua-faixa:has(button:active)`, sem `:active` no sujeito) | verde, como devia: a fonte não vê | vermelho: 48 falhas, "escurece também div.regua-faixa" | — |
| F10 | o topo do cartão sem o `:not(:has(button:active))` | vermelho: a regra perdeu o seletor | vermelho: 44 falhas, a miniatura "escurece também div.ex-top" | — |
| F11 | a segunda maneira de pintar o toque (o `.ins-btn-secondary:active` de antes, de volta) | vermelho: segundo fundo no `:active` | verde, como devia: escurece ainda mais | — |
| F12 | o "+1 copo" apaga a camada dele (`--ins-toque: transparent`) | vermelho: troca sem o preenchimento que a pede | vermelho: 32 falhas, o "+1 copo" a 1,00:1 | — |
| F13 | o topo do cartão muda de classe no JSX (nó com clique que a regra não alcança) | — | vermelho: 88 falhas, `div.ex-top-novo` a 1,00:1 | — |
| F14 | uma transição de cor no toque | vermelho: `transition` com o dedo | — | — |
| F15 | o valor aceso da régua sem a camada do cheio | vermelho: `.regua-v.on` | vermelho: 4 falhas, 1,29:1 | — |
| F16 | o verbo do pare sem a camada do cheio | vermelho: `.pare-sim` e `.pergunta-w .pare-sim` | vermelho: 12 falhas, 1,21:1 | — |
| F17 | o "Pronto" da edição do dia sem a camada do cheio | vermelho: `.edbar-b` | vermelho: 8 falhas, 1,29:1 | — |
| F18 | o `.dbtn` não devolve a camada do papel | verde, como devia: a fonte não sabe o que vence | vermelho: 4 falhas, "Criar e adicionar" no escuro a 1,03:1 | — |
| F19 | a camada de cada controle sem valor no `:root` | vermelho | vermelho | — |
| F20 | `button:active` de volta na mesma lista dos `:has()` | vermelho: `button:active` mora sozinho | — | — |
| T1 | sem o ouvinte de `touchstart` | — | — | vermelho: 0 ouvintes |
| T2 | o ouvinte `{ passive: false }` | — | — | vermelho |
| T3 | o ouvinte chama `preventDefault()` | — | — | vermelho |
| T4 | o ouvinte posto duas vezes | — | — | vermelho: 2 ouvintes |
| V1 | controle: a camada do claro mais forte (30%) | verde | verde | — |
| V2 | controle: um filho do controle muda de cor no toque | verde | verde | — |

### O que ficou de fora, e por quê

- **Nada foi visto num iPhone.** O que o WebKit desta máquina prova é que o
  `:active` pinta a camada com o ponteiro apertado, e que a camada é a mesma
  sob "Reduzir movimento". Se o Safari do iOS, com o ouvinte, acende o `:active`
  na hora do toque ou depois de um atraso, e se ele o apaga quando o toque vira
  rolagem (uma linha de refeição escurecendo no começo de uma rolagem), fica
  pela leitura — é a ressalva do 08 §7.
- **No Chromium com toque emulado o `:active` não acende com o dedo pousado**
  (07 §1.1, medido pelo revisor): as rodadas `chromium` de toque vão continuar
  sem mudança "no pousar". A peça se confere no `webkit` e no `chromium-mouse`,
  como o 07 já diz.
- **A miniatura com foto** (decisão 10) e **os controles de telas que o teste não
  abre** (a câmera, o comparar, a revisão, a retrospectiva, a sessão de um dia
  passado): estão cobertos pela regra, que é por etiqueta (`button`), e pela
  guarda de fonte (8), não pela conta da árvore.
- **A luz da academia** continua sem medida, como em todo o sistema.
- **Os documentos dos especialistas** (`06-sistema.md`, `08-parecer.md`, o 07)
  ainda citam `--ins-dur-toque`; não são meus de editar (o 07 é proibido nesta
  fase). Ver decisão 2.

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
src/main.jsx (7191:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-P5csZKbI.css  103.05 kB │ gzip:  18.33 kB
dist/assets/index-BU9CAjWp.js   576.11 kB │ gzip: 179.79 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 1.90s
(saída 0)
```

`npx vitest run`:

```
 RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app


 Test Files  74 passed (74)
      Tests  1596 passed (1596)
   Start at  11:47:19
   Duration  66.25s (transform 6.08s, setup 0ms, import 55.95s, tests 638.29s, environment 18ms)

(saída 0)
```

Antes desta peça: 1593 de 1593 em `73df730` (conferido pelo coordenador). A
diferença (+3) são os casos novos: (f) em `estilo.test.ts` e os dois de
`toque.test.js`. O caso de árvore leva ~13 s sozinho; a suíte inteira levou 66 s
nesta rodada (56 s na da peça 0).
