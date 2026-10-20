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

---

## Peça 2 · A série recebida

Escrita pelo coordenador a partir do relatório do implementador, que parou
antes de gravar a seção: uma gravação dele foi recusada no pedido de permissão
e ele interrompeu o trabalho, como manda a recusa. O código estava pronto e
verde; o coordenador conferiu e rodou de novo.

### O que mudou

| arquivo | o quê |
|---|---|
| `src/main.jsx` | **Defeito 1 (contador):** `atualizaEstado` só avisa; o valor vem de `contadorDoDia()`, que o componente lê — um escritor só. **Som:** `preparaAudioDepois()`, chamada em `abreModo`, cria o `AudioContext` 500 ms depois da entrada (no Chromium, ainda espera a página ociosa); `startTimer` continua retomando ou criando o contexto dentro do gesto, então o som e o momento do som não mudam. **Altura do cronômetro:** `alturaDoTimer` passou a ResizeObserver, sem o `offsetHeight` forçado dentro do toque. **Pouso:** a marca de "recém" (`marcaRecem`/`recemDaSerie`), estado de tela que não grava nem sincroniza, posta pela régua, pelo RIR, pela coluna anterior (as duas células) e pela carga do "+ série"; vence em 1 s, e abrir/fechar cartão ou entrar no modo a apaga. **Defeito 2 (dedo):** `depoisDoLayout` mede e rola no desenho seguinte, depois do layout e antes da pintura (entrega de um ResizeObserver na raiz), para a linha da série tocada, o teclado próprio e o "Pular" (que põe sob o dedo a frase "Pulado hoje…"). Rolagem de uma vez, nunca suave. |
| `src/ui/telas/treino.jsx` | O componente `Contador`, o escritor único do número, e `avisaOContador`. |
| `src/ui/exercicio.jsx` | O número da célula num `<span class="pousa">` com chave pelo valor (outro valor, outro nó, o pouso é do novo; o mesmo valor num `render()` é o mesmo nó, nada recomeça). Os três "Pular" passam o botão tocado. |
| `src/treino.css` | `.pousa.recem` anima `ins-pousa` em `--ins-dur-lugar`/`--ins-curva` no portão; sob "Reduzir movimento", `ins-acende` (só opacidade) em `--ins-dur-dissolve`. |
| `src/base.css` | `@keyframes ins-pousa` (`translate` de `--ins-pousa` a 0, opacidade .4 a 1) e `ins-acende` (só a opacidade). |
| `src/tokens.css` | Só comentário (o valor que pousa só acende sob "Reduzir"). |
| `DESIGN.md` | A linha do pouso na tabela de movimentos e o parágrafo "O dedo não perde o lugar". |
| testes | Novos: `tests/fluxo/contador.test.js` (3), `pouso.test.js` (4), `dedo.test.js` (9, num Chromium de verdade, pelo novo `tests/fluxo/navegador.js`); um caso de som em `cronometro.test.js`; `sessao.test.js` espera um tique antes de ler o contador (o componente se redesenha antes do próximo quadro). |

### Os números (antes → depois)

| medida | antes | depois |
|---|---|---|
| trabalho no toque da 1ª série a frio, Chromium 1× (fluxo 03b) | 56 / 66 / 83 ms | 8,4–12,3 ms, mediana 8,8 (meta ≤ 16) |
| o mesmo toque no WebKit | 159–179 ms | 11–12 ms |
| linha da série na 1ª série | y 323 → 375 | 323 → 323 |
| contador depois de ligar o deload | tela 1/20, dado 1/12 | 1/12 = 1/12 |
| sob o dedo depois de "Pular" | o nome do exercício seguinte | a frase "Pulado hoje…" |

A célula em repouso ficou idêntica pixel a pixel nos dois motores. Os testes
novos falham contra o build de antes, menos o da coluna anterior (ali a
ancoragem de rolagem do navegador já compensava).

### O que o coordenador anota

- **O plantio não rodou** (14 violações escritas em `scratchpad/peca2/plantio.py`):
  o implementador parou antes. A prova de que os testes pegam o defeito é
  eles reprovarem o build de antes.
- **O som depois da entrada** põe, no WebKit, um intervalo de `rAF` de ~50 ms
  meio segundo depois de entrar no modo (fluxo 01); o princípio 4 do revisor vai
  marcar quando o fluxo 01 for regravado na peça 5 — é esperado e fica
  explicado lá.
- **A régua que fecha** continua subindo a série seguinte para baixo do dedo,
  como em qualquer série; o critério do revisor (não a carga da MESMA série;
  linha ±2 px) está cumprido.
- **`dedo.test.js` depende do Chromium do cache do Playwright**; se não o achar,
  falha com a instrução de instalação, em vez de pular.
- **Para a peça 3:** a altura publicada pelo ResizeObserver depende de o
  cronômetro escondido ser `display: none`; quem trocar isso por
  `transform`/`visibility` tem de manter a altura publicada certa.

### Saídas (rodadas pelo coordenador, máquina livre)

```
npm run tipos   → tsc --noEmit (saída 0)
npm run build   → ✓ built in 1.64s (saída 0)
npx vitest run  → Test Files 77 passed (77) · Tests 1613 passed (1613)
```

---

## Peça 3 · O descanso

Implementada em 19/10, sobre `cf0e4e4`, sem commit. Espec: `08-parecer.md` §4
(peça 3) e §5.1; as respostas do dono em `00-coordenacao.md` (16/10, 01h25):
pergunta 9 "sobe da borda e desce", pergunta 1 (camada em 350 ms na curva do
iPhone, **sem quique**) e pergunta 2 (sob "Reduzir movimento" esmaece 120 ms ao
chegar e sai de uma vez); `03-micro.md` §4.3, §5.1 e §8 item 2; `04-desempenho.md`
§2.2–2.4 e R8; `05-acessibilidade.md` §2.2; a linha da peça 3 do
`07-revisao-base.md` §1.4.

### Em uma página

- **O que ele vê de diferente.** O cronômetro sobe da borda de baixo em 350 ms,
  na curva do iPhone, e desce por onde veio ao parar (ou ao zerar pelo −15).
  O toast e a faixa da sessão sobem e descem junto com ele, no mesmo tempo, na
  mesma curva e no mesmo instante, em vez de saltar 82 px. Um descanso que
  substitui outro troca no lugar. O fim do descanso continua parado ("vai" e o
  som). O descanso que volta na abertura do app aparece no lugar, sem subir.
- **Sob "Reduzir movimento"** nada desliza: o cronômetro esmaece em 120 ms ao
  chegar (`ins-esmaece`, só opacidade) e sai de uma vez; o toast e a faixa vão
  direto ao lugar novo.
- **O vão de 52 px acabou.** No modo, o cronômetro ia de y 762 a 844 numa tela
  de 896. Agora vai de 814 a 896, com o fundo na borda. Achado no caminho:
  com o descanso ligado, os dois botões da pergunta de 1h30 dentro do modo
  ("continuo treinando", "já parei") ficavam **por baixo** do cronômetro. Um
  toque no centro deles caía no rótulo do descanso. Agora o toque acerta os
  botões.
- **A altura publicada continua dizendo a verdade.** Fora de cena o cronômetro
  agora fica layoutado (82 px). Mesmo assim, `--ins-timer-h` é 0 fora de cena
  e a altura dele em cena. Um teste no motor cobra isso.
- **Testes.** São 10 casos novos: 5 na árvore (`cena.test.js`) e 5 no motor
  (`descanso.test.js`). A guarda (c) ganhou o sujeito composto. Plantei 17
  violações e as 17 ficaram vermelhas. Os 10 casos novos reprovam o build de
  `cf0e4e4`. Nos dois motores, os 5 casos do motor passam várias vezes seguidas.
- **`tipos` limpo, `build` ok, `vitest` 1623 de 1623.**

### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/componentes.css` | **`#timer`**: deixa de usar `display: none`. Fora de cena fica `display: flex`, `translate: 0 calc(100% + var(--ins-tabbar))` (abaixo da borda da tela) e `visibility: hidden`. `.on` vale `translate: none; visibility: visible`, e `.sai` segura `visibility: visible`. No portão, `#timer.anda` transiciona `translate` em `--ins-dur-sai` e `#timer.anda.on` em `--ins-dur-entra`, os dois na `--ins-curva-camada`. Sob `reduce`, `#timer.anda.on` usa `ins-esmaece` em `--ins-dur-dissolve`. O `transform: translateX(-50%)` continua intacto. **`#toast`**: a altura do cronômetro sai do `bottom` e entra em `translate: 0 calc(-1 * var(--ins-timer-h))`. **`.ins-faixa`**: o mesmo. **O acompanhamento**, no portão: `#toast, .ins-faixa` em `--ins-dur-sai`; `html:has(#timer.on) #toast`, `… .ins-faixa` em `--ins-dur-entra`; os dois na curva da camada. **`#tctx`**: fora de cena, o rótulo vazio guarda a linha dele (`::before` com um espaço duro), ver decisão 7. **A reserva do modo**: `#app:has(.ins-modo)` virou `html:has(.ins-modo)`, e o comentário que dizia alcançar os quatro consumidores foi reescrito (agora é verdade, e diz por quê). |
| `src/base.css` | `@keyframes ins-esmaece` (opacidade de 0 a 1): a chegada de camada sob "Reduzir movimento", que as peças 4 e 5 vão usar também. |
| `src/main.jsx` | `tempo` da porta importado como `tempoDoMovimento`. `alturaDoTimer` passa a guardar a altura que o observador entrega (`alturaMedida`), e `publicaAlturaDoTimer` publica essa altura em cena e 0 fora, sem medir no toque. O observador nasce com o nó (`ligaBotaoDoTimer`). Funções novas: `poeEmCena(box, anda)`, `tiraDeCena(box)`, `terminaDescida()` e `limpaProcedencia()`. `startTimer` põe em cena com `anda`. `retomaDescanso` põe em cena sem `anda`. `stopTimer` tira de cena, e o rótulo só sai quando a descida termina. `desliga` termina a descida pendente. |
| `src/tokens.css` | Só o comentário de `--ins-timer-h`: quem o lê, e que o toast e a faixa o leem no `translate`. |
| `src/palco.css` | Só o comentário da especificidade: o `#timer` não acende mais por `display`. |
| `DESIGN.md` | Duas linhas na tabela de movimentos: o descanso que sobe e desce, e o toast e a faixa que acompanham. Em "o que fica sem movimento" entram o fim do descanso (o cronômetro fica onde está), o descanso que substitui outro e o descanso que volta na abertura. |
| `tests/dominio/estilo.test.ts` | O caso "no modo, a reserva do rodapé…" passa a cobrar uma regra só, escrita na RAIZ (`html`/`:root`), e confere em `index.html` que `#timer` e `#toast` moram fora do `#app`, que é o motivo da regra. **Guarda (c)**: o "centrado não anima `transform`" passa a valer para toda regra cujo SUJEITO é o centrado (`sujeitoDe`, novo), e não só para o seletor exato. Era um buraco: `#timer.anda { transition: transform … }` passava verde (plantio P3). |
| `tests/fluxo/cena.test.js` (novo) | Na árvore: as classes e a ordem delas, o estado gravado antes do desenho, a descida que acaba pelo relógio da porta, a troca no lugar, ±15 e parar no meio, o caminho parado (com "Reduzir" e sem `matchMedia`) e a abertura parada. |
| `tests/fluxo/descanso.test.js` (novo) | No motor (Chromium; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit): o lugar no modo e fora dele, a subida e a descida, o acompanhamento, "Reduzir movimento" e a altura publicada. |

### As decisões, com o porquê

1. **A reserva do modo mora na raiz.** Custom property só desce pela árvore, e
   `#timer`/`#toast` são irmãos do `#app` no `body`. Escrita no `#app`, ela
   chegava ao fim da página e à faixa (que mora dentro do `.ins-modo`), mas
   não chegava aos dois. `html:has(.ins-modo)` alcança os quatro sem mudar
   nada fora do modo. A guarda (d) aceita a regra: ela declara só uma custom
   property, e nada que contenha fixo.
2. **A distância é `100% + --ins-tabbar`, e não só `100%`.** Só a borda inteira
   garante que nenhum pedaço do cronômetro fica à vista, parado, no primeiro
   quadro. No iPhone a reserva do modo é a área do indicador de home (34 pt),
   e com `100%` os 34 de cima apareceriam de estalo. Numa tela cheia sem barra,
   apareceriam 52. Fora do modo ele nasce abaixo da tela e sobe por trás da
   barra de abas, que é opaca e tem z 40 contra 35. Consequência dita: fora do
   modo o cronômetro anda 134 px e o toast anda 82 px, no mesmo tempo e na
   mesma curva. Os dois partem e chegam juntos. O vão entre eles abre até a
   altura da barra no começo, enquanto o cronômetro ainda está atrás dela, e
   fecha no fim. O toast fica acima do cronômetro em todo quadro. No modo
   (reserva 0 aqui) os dois andam juntos ao pixel.
3. **`translate` mais `visibility`, e não `@starting-style`.** `@starting-style`
   resolve só a entrada. A saída precisa do nó visível enquanto desce, e uma
   classe com transição inverte sozinha quando um "parar" chega no meio da
   subida, porque a transição nova parte de onde a velha estava. `visibility`
   fora de cena faz o que `display: none` fazia: tira os botões do toque, do
   Tab e do leitor de tela.
4. **Quem segura a visibilidade na descida é `.sai`, por um relógio que lê
   `tempo('--ins-dur-sai')`, e não uma transição de `visibility`.** A guarda
   (c) só deixa mover `transform`, `translate`, `scale` e `opacity`, e o
   pedido manda nesse sentido. Transicionar `visibility` exigiria abrir uma
   exceção na guarda. Sob "Reduzir" (e onde a porta não sabe) o tempo é 0, e
   `.sai` nem entra. Ressalva medida: o relógio começa na mudança de classe e
   a transição começa no estilo seguinte, até um quadro depois. Por isso o
   último pedaço da descida pode acontecer já escondido. Com a cauda da curva,
   aos 345 ms o cronômetro está a 0,02 px do fim (Chromium), então isso é
   invisível.
5. **`.anda`: só o toque move.** `startTimer` e `tiraDeCena` põem a classe, e
   `retomaDescanso` não põe. Na abertura o `render()` já desenhou, o estilo do
   cronômetro já existe e uma transição dispararia. A abertura não se move
   (08 §4).
6. **O toast e a faixa leem a mesma variável no `translate`.** A altura muda na
   hora em que ele entra ou sai, e quem anda é a propriedade, composta, na
   transição de cada um. O token da direção vem de `html:has(#timer.on)`: em
   cena vale `--ins-dur-entra`, fora vale `--ins-dur-sai`. Hoje os dois são
   350 ms, e se o dono mudar um, o acompanhamento segue o cronômetro.
   Medido: as três transições começam no mesmo instante (`startTime` igual)
   nos dois motores.
7. **Fora de cena, o rótulo vazio guarda a linha.** A publicação no toque usa a
   altura guardada, sem medir nada. Quando o rótulo sumia ao parar, o
   cronômetro escondido media 58 px e o próximo descanso (que sempre tem
   procedência) media 82. No Chromium a correção do observador chega antes da
   pintura. No WebKit chega um quadro depois: o toast e a faixa começavam a
   subir para o lugar errado e ficavam **até 10 px por baixo do cronômetro**
   no começo da subida (medido, faixa 890 contra cronômetro 888 aos 14 ms,
   860 contra 850 aos 62 ms). Com a linha guardada, a altura fora de cena é a
   de quando ele entra. O caso de altura cobra isso nos dois motores, porque
   no Chromium só o modo "Reduzir" mostrava o salto duplo (plantio P9).
8. **Ele desce inteiro.** O número e a procedência ficam no nó até a descida
   acabar, e só então o rótulo sai. Com tempo 0 (jsdom, "Reduzir") o rótulo
   sai na hora, como antes. O caso de `cronometro.test.js` "e o rótulo sai
   junto com o descanso" não mudou.
9. **A curva do esmaecer é a da camada.** O papel é "a camada que chega", e
   peça 2 usou `--ins-curva` para o número que acende, que é outra coisa.
   Mediu 120 ms, `cubic-bezier(0.32, 0.72, 0, 1)` nos dois motores.
10. **A porta é lida antes de mexer na classe.** Lida depois, a leitura do
    estilo computado resolveria o estilo novo do cronômetro no meio da tarefa,
    antes de a altura publicada mudar a do toast e da faixa. Medi os dois jeitos
    no WebKit e as três transições começaram no mesmo instante, então é
    cautela, e o comentário diz isso.
11. **Não mexi no lugar fora do modo** (fundo do cronômetro em 844, a reserva
    de 52 sobre a barra de 47 px que já existia). O pedido diz "sem quebrar o
    lugar dele fora do modo".

### Os números, antes e depois

Chromium 1234 e WebKit 26.5 (Playwright), 414 × 896 a ×2, sem preferência e
com "Reduzir movimento". O antes é o build de `cf0e4e4`, o depois é o final.
Os dois foram copiados para o scratchpad e servidos um de cada vez na porta
4729, que ficou desligada no fim. Scripts em scratchpad (`peca3/mede.mjs`,
`tabela.mjs`). Nenhum erro de página em nenhuma rodada. Os dois motores deram
os mesmos números, menos onde a tabela separa.

| medida | antes | depois |
|---|---|---|
| cronômetro no modo, em cena (y) | 761,8–844 (52 px acima do fundo de 896) | **813,8–896** |
| toast no modo, sem cronômetro · com | 787,3–830 · 705,3–748 | 839,3–882 · 757,3–800 |
| botões da pergunta de 1h30 com o descanso, no modo: quem o dedo acerta no centro | `#tctx` (o rótulo do descanso, por cima) | o próprio botão |
| cronômetro fora do modo (barra de abas em 849) | 761,8–844 | 761,8–844 (igual) |
| subida | num quadro | `translate` 350 ms, `cubic-bezier(0.32, 0.72, 0, 1)` nos dois motores; parte de `0 82,19px` (a borda) até `none`; 21 quadros amostrados com mudança |
| descida | some num quadro | `translate` 350 ms, a mesma curva; visível em 21 (Chromium) e 22 (WebKit) quadros amostrados; escondido aos ~390–410 ms |
| maior passo do toast entre dois quadros (subida · descida) | 82 · 82 | 16,1 · 16,0 (Chromium); 15,4 · 15,5 (WebKit) |
| maior passo da faixa na subida | 82 | 16,0 (Chromium); 15,2 (WebKit) |
| o toast e a faixa por baixo do cronômetro, em algum quadro | a faixa 52 px por baixo dele, parada | nunca: 0,19 px no máximo, que é o arredondamento da altura publicada (inteira) contra a caixa (82,19); era assim também fora do modo |
| início das três transições (`startTime`) | — | igual nos dois motores |
| largura rolável em todos os quadros | 414 | 414 |
| descanso que substitui outro | nada se move | nada se move |
| "parar" aos 120 ms da subida | — | inverte de onde estava, sem salto: Chromium 827,7 (`on`) → 823,9 → 833,5 (`sai`, descendo); WebKit 828,5 → 828,5 → 839,7 |
| "Reduzir": chegada | num quadro | `ins-esmaece` 120 ms, só opacidade (0 → 1), nada desliza; toast e faixa no lugar novo no primeiro quadro |
| "Reduzir": saída | num quadro | num quadro (escondido no primeiro, sem `.sai`) |

### Os testes, e como provei que reprovam

**`tests/fluxo/cena.test.js`** (jsdom, com `matchMedia` de mentira posto antes
do app). O jsdom resolve o token: `--ins-dur-sai` sai como `.35s`, e a porta lê
350.

- *entra já gravado, sai descendo, e o relógio da porta tira a classe*: o alvo
  já está gravado no mesmo tique do toque; as classes ficam `anda on`, depois
  `anda sai`; a altura publicada é 0 já na saída; o rótulo continua durante a
  descida; e depois de `--ins-dur-sai` sobra `anda`. O jsdom nunca dispara
  evento de fim de transição. Se a classe sai aqui, ninguém o esperava.
- *substitui no lugar; um descanso no meio da descida sobe dali*: nenhuma
  descida fica agendada, e a que foi desfeita não o tira de cena depois.
- *±15 e parar respondem no meio da subida*: os botões respondem, e o −15 que
  passa de zero desce como parar.
- *sob "Reduzir movimento", e sem `matchMedia`, sai de uma vez*.
- *o descanso da abertura aparece no lugar*: as classes ficam `on`, sem
  `anda`, e o primeiro "parar" já desce.

**`tests/fluxo/descanso.test.js`** (Chromium; o mesmo arquivo com
`LASTRO_MOTOR=webkit`). Os tempos e a curva vêm dos tokens, como o motor os
resolve.

- *o lugar*: no modo, o fundo do cronômetro na borda (±0,5 px), a faixa acima
  dele, o toast acima da faixa e os dois botões da pergunta tocáveis. Fora do
  modo, o fundo continua na reserva e não passa da barra de abas.
- *sobe e desce*: uma transição só, de `translate`, em `--ins-dur-entra`, na
  curva da camada, que parte da altura inteira abaixo e chega a `none`. Visível
  desde o primeiro quadro, só sobe e nunca passa do lugar (sem quique), em
  vários quadros, e o −15 é tocável no meio. Um descanso que substitui outro
  não move nada. Para a descida, todo evento de fim de transição ou animação é
  bloqueado na captura antes de chegar ao app, e mesmo assim o cronômetro desce
  em `--ins-dur-sai`, visível e com `.sai`, e termina escondido, sem `.sai`,
  inteiro abaixo da borda. "Parar" aos 120 ms volta de onde estava.
- *acompanham*: na subida e na descida, o toast e a faixa têm uma transição de
  `translate` com o tempo e a curva do cronômetro e o mesmo `startTime`. Em
  todo quadro, a faixa fica acima do cronômetro e o toast acima da faixa.
  Nenhum passo de quadro passa de metade da altura (antes, a altura inteira
  num quadro), e no fim os dois voltam ao lugar exato.
- *"Reduzir movimento"*: o cronômetro tem só `ins-esmaece` em
  `--ins-dur-dissolve`, só opacidade. Nada no toast nem na faixa, nada
  desliza, e os dois já estão no lugar no primeiro quadro. Na saída, escondido
  desde o primeiro quadro e nenhuma animação.
- *a altura publicada*: fora de cena, a caixa mede mais que 0 e está escondida,
  e a publicada é `0px`. Em cena publica a altura dele, e ela é a mesma de
  fora de cena (decisão 7). Descendo, ainda visível, a publicada já é 0, e
  continua 0 depois.

**A folga das caixas no motor.** Lido quadro a quadro, a caixa de um elemento
com transição no compositor às vezes vem ~1 px atrasada no WebKit. Medi duas
leituras do mesmo cronômetro no mesmo quadro com 0,92 px de diferença, e o
`currentTime` e o `translate` computado das três transições iguais. A ordem
quadro a quadro é cobrada com 1,5 px de folga (`FOLGA`). O que prova que andam
juntas é o instante, o tempo e a curva, cobrados exatos. Os defeitos que a
folga deixa passar seriam menores que 1,5 px. Os que ela pega são de 52 px
(o vão) e 10 px (decisão 7).

**Plantio** (`scratchpad/peca3/planta.py`: aplica, constrói quando o caso é de
árvore ou motor, roda só os casos da peça, registra e devolve o arquivo; o
último passo reconstrói o limpo). As 17 violações deram vermelho:

| # | a violação plantada | quem ficou vermelho |
|---|---|---|
| P1 | a reserva do modo de volta no `#app` | a reserva em `estilo.test.ts` e 4 casos do motor ("844 de 896 (antes do conserto, 844…)") |
| P2 | fora de cena por `display: none` de novo | 4 do motor (nenhuma transição; a caixa mede 0 fora de cena) |
| P3 | o cronômetro transiciona `transform` em `#timer.anda` | (c), **só depois do conserto da guarda** (antes, verde) |
| P4 | a transição do cronômetro fora do portão | (b) |
| P5 | o toast com a altura do cronômetro no `bottom`, sem `translate` | acompanhamento ("o toast anda pela propriedade `translate`…: []") |
| P6 | a faixa sem o acompanhamento | acompanhamento |
| P7 | sem o esmaecer sob "Reduzir" | "Reduzir movimento" (a guarda fica verde, como deve: ela não exige o esmaecer) |
| P8 | sob "Reduzir", `ins-pousa` (desliza) no lugar do esmaecer | (b) e (c) |
| P9 | sem a linha guardada do rótulo fora de cena | Chromium: altura publicada e "Reduzir" (o toast salta duas vezes); WebKit: também o acompanhamento ("a faixa por baixo do cronômetro") |
| P10 | a publicação lê a caixa, em cena ou não | altura publicada e acompanhamento |
| P11 | a descida acaba no `transitionend` | (e), `cena` e "sobe e desce" |
| P12 | sem segurar a visibilidade na descida | 6 casos (`cena` e motor) |
| P13 | a descida segura 350 ms sem perguntar à porta | "Reduzir" (árvore e motor) |
| P14 | o descanso da abertura sobe | a abertura (`cena`) |
| P15 | o descanso novo entra uma tarefa depois (desce e sobe) | 8 casos |
| P16 | parar sem pôr `.anda` (o descanso da abertura sumiria parado) | a abertura (`cena`) |
| P17 | a faixa acompanha por `transform` | (c) |

**Contra o build de antes** (a cópia de `cf0e4e4` posta no lugar do `dist/` e
reconstruída depois), os 10 casos novos deram vermelho, e os 5 do motor também
no WebKit. Nos do motor o motivo é o defeito: 844 de 896, nenhuma transição, o
toast sem acompanhamento, nenhum esmaecer, a caixa 0 fora de cena. Nos 5 da
árvore parte do vermelho é de forma: as classes `anda` e `sai` não existiam.
O de substância é a saída sem `.sai`, que antes sumia de uma vez.

### O que ficou de fora, e por quê

- **No iPhone, no modo, o cronômetro fica acima dos 34 pt do indicador de
  home**, como a faixa e o fim da página já ficavam: a reserva do modo é
  `var(--sa-bottom)` por decisão escrita ("o que sai é a barra, não a área
  segura"). O conteúdo que rola continua visível nessa tira. Se o dono quiser
  o cronômetro cobrindo até a borda física, o caminho é `bottom: 0` mais
  `padding-bottom: var(--sa-bottom)` no modo, com o toast e a faixa
  descontando a área segura da altura publicada. Não fiz, porque é uma escolha
  de layout além do vão, e aqui o `sa-bottom` é 0 (nada mede).
- **Nas telas cheias (Ajustes e as outras), o cronômetro continua 52 px acima
  do fundo**, igual antes e depois (medido: 761,8–844 com `.tc` e sem barra
  de abas). É o mesmo defeito do modo: a reserva vale 52 + área segura onde a
  barra não é desenhada. O pedido limita o conserto ao modo ("fora dele, nada
  de comportamento muda"), então fica para a peça 5 (telas cheias), onde o
  conserto seria o mesmo: `html:has(.tc)`.
- **A entrada e a saída do próprio toast são da peça 7.** Aviso para ela: o
  `translate` do toast agora é do acompanhamento. Uma entrada que anime
  `translate` sozinha brigaria com ele. Os quadros dela têm de partir de
  `calc(var(--ins-sobe-aviso) - var(--ins-timer-h))`, ou a entrada mora num
  invólucro. `transform` não serve: a guarda (c) proíbe no centrado.
- **O fim da página, ao parar**, encolhe `--ins-timer-h` de uma vez (é
  `padding`, layout). Quem está rolado até o fim vê o conteúdo descer 82 px no
  primeiro quadro da descida, enquanto o cronômetro ainda desliza por cima.
  Antes, o mesmo salto acontecia junto com o sumiço. Animar a reserva seria
  animar layout.
- **O arredondamento de 0,19 px** (a altura publicada é `offsetHeight`,
  inteiro, e a caixa tem 82,19) já existia e não muda nada que se veja.
- **O Tab com uma folha aberta e o descanso ligado** ainda sai da folha para o
  −15 (05 §3.1). É precondição da peça 4. Fora de cena o problema não existe
  (`visibility: hidden`).
- **Nada foi visto num iPhone de verdade.** O WebKit desta máquina prova lugar,
  tempo, curva e ordem, e não fluidez.

### Para o revisor

- Fluxo 03 (grava-1, grava-2): o cronômetro, o toast e a faixa se movem **de
  propósito** aos +120 ms (07 §1.3, princípio 3, "fora os que se movem de
  propósito"). O cronômetro nasce em y 896 e assenta em 813,8–896.
- As durações que aparecem são 350 (subida e descida, a do toast e a da faixa)
  e 120 (o esmaecer sob "Reduzir"), as duas da lista do 07 §1.2.
- `micro-avisos.mjs`: o toast deixa de pular 82 px. No modo, com o conserto, a
  posição dele mudou (839–882 sem cronômetro, 757–800 com).

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
src/main.jsx (7531:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-C7D0ZV4K.css  104.34 kB │ gzip:  18.59 kB
dist/assets/index-CU8gQVd2.js   580.37 kB │ gzip: 181.24 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 773ms
(saída 0)
```

`npx vitest run`:

```
 RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app

 Test Files  79 passed (79)
      Tests  1623 passed (1623)
   Start at  20:55:23
   Duration  39.12s (transform 2.66s, setup 0ms, import 28.98s, tests 384.40s, environment 9ms)

(saída 0)
```

Antes desta peça: 1613 de 1613 (peça 2, conferido pelo coordenador). A
diferença, +10, são os casos novos: 5 em `cena.test.js` e 5 em
`descanso.test.js`. Os casos de `estilo.test.ts` continuam 58: um foi
reescrito e a guarda (c) ganhou uma conferência dentro do caso que já existia.

---

## Peça 4 · A folha sobe

Implementada em 19/10, sobre `d1f1025`, sem commit. Espec: o pedido em
`_pedidos/peca-4.md`; `08-parecer.md` §4 (peça 4) e §5.1; as respostas do dono
em `00-coordenacao.md` (16/10, 01h25): pergunta 1 (a folha chega com o quique),
11 (o painel de apagar igual à folha), 2 (sob "Reduzir movimento" esmaece ao
chegar) e 13 (o defeito 5 entra aqui); `02-navegacao.md` T3 e T8; `03-micro.md`
§5.2 e §5.3; `05-acessibilidade.md` §3.1 e §3.4; `04-desempenho.md` §2.4; a
linha da peça 4 do `07-revisao-base.md` §1.4.

### Em uma página

- **O que ele vê de diferente.** A folha sobe da borda com o quique que ele
  escolheu: 640 ms, passa 8 % do lugar aos ~352 ms, volta 3 % aos ~515 ms e
  assenta. O véu acende junto, em 350 ms. A segunda e a terceira folha sobem
  por cima da primeira, que fica onde está, e os véus somam. A folha que toma o
  lugar da de cima ("cadastrar") aparece no lugar, sem subir. O painel de pare
  (as duas variantes, a de apagar e a pergunta) chega igual à folha. O "Não
  guardei" continua parado. A saída de tudo isso continua de uma vez.
- **Sob "Reduzir movimento"** nada se desloca: folha, painel e véu esmaecem em
  120 ms ao chegar e saem de uma vez.
- **Um achado, e o conserto dele: o toque no meio da subida se perdia.**
  Medido nos dois motores, com o × e o véu tocados de 60 a 220 ms depois de
  abrir: nenhum toque fechava a folha. O dedo descia no × e o clique saía no
  cabeçalho, porque a folha andou entre descer e soltar. Agora **o dedo segura
  a camada que chega**: enquanto ele está nela, a chegada para no quadro em que
  o toque foi testado, e o clique cai no que o dedo tocou (decisão 6).
- **Foco (precondição).** Com o descanso contando, o Tab não sai mais da folha
  para o −15. O painel de pare e o "Não guardei" isolam o fundo como a folha,
  pelo mesmo mecanismo, e devolvem o foco a quem o tinha.
- **Defeito 5.** O "Não guardei" só aceita o toque que começou nele e pelo
  menos 400 ms depois de chegar. O toque que já vinha para outra coisa não o
  fecha antes de lido. O teclado age na hora.
- **Rolagem de lado (precondição).** O corpo da folha não rola mais de lado.
  Medido: nada de hoje passa da largura, então nada ficou cortado.
- **Testes.** 16 casos novos: 1 em `estilo.test.ts`, 8 em `camadas.test.js`
  (árvore) e 7 em `sobe.test.js` (motor, Chromium e WebKit). Plantei 22
  violações e as 22 ficaram vermelhas; o controle ficou verde. Contra o build
  de `d1f1025`, 14 dos 16 ficam vermelhos (os 2 verdes guardam o que já
  funcionava).
- **`tipos` limpo, `build` ok, `vitest` 1639 de 1639.**

### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/componentes.css` | Bloco novo "A CAMADA QUE CHEGA COM O QUIQUE", logo depois de `.ins-folha`. No portão: `.ins-folha-w:not(.troca) > .ins-folha` e `.pare-w:not(.falhou-w) > .pare` com `ins-quique var(--ins-dur-quique) var(--ins-curva-camada) both`; os véus irmãos com `ins-esmaece var(--ins-dur-entra) var(--ins-curva-ciclo) both`. Sob `reduce`: os quatro com `ins-esmaece var(--ins-dur-dissolve) var(--ins-curva-camada) both`. Fora do portão: o pé da caixa (`::after` com `top: 100%`, `height: 10%`, `background: inherit`, decisão 3). `.ins-folha-c` ganhou `overflow-x: hidden`. Os comentários do pare ("sem animação de entrada") foram reescritos. |
| `src/ui/instrumento/folha.jsx` | `ChegadaDaFolha` (contexto: `'sobe'` ou `'troca'`), lido no nascimento e posto como classe `troca` no invólucro. O isolamento virou `isolaACamadaDeCima` (derivado da camada de cima, com o `#timer`) e `abreCamada` (isola, foca, devolve o foco), usados pela folha, pelo pare e pelo aviso; `isolaOResto` saiu. `seguraSobODedo`: o dedo segura a camada que chega. |
| `src/ui/instrumento/pare.jsx` | O `Pare` desenha um `PainelDePare` interno, que nasce e morre com o pedido: isola e devolve o foco por `abreCamada`, segura sob o dedo, e foca a saída a cada pedido novo. O `Falhou` desenha um `AvisoDeFalha` interno, que isola, registra onde o dedo desceu (`pointerdown`, na captura) e só deixa agir o toque que era para ele (`JANELA_DO_AVISO_MS`, `eraParaOutraCoisa`). Os comentários do cabeçalho dizem o que mudou e por quê. |
| `src/ui/movimento.js` | `seguraNoLugar(elementos)`: pausa as animações que correm, neste instante (pausa e repõe o tempo atual), e devolve a função que as solta; `null` sem movimento pedido ou sem nada correndo. O cabeçalho da porta passa a dizer que mexer numa animação viva (`getAnimations`) também é dela. |
| `src/main.jsx` | `folhaAberta` embrulha cada folha num `ChegadaDaFolha.Provider` (com a chave da posição); o corpo do antigo `map` virou `folhaDe(f, i)`, sem outra mudança. `trocaFolha` marca a folha que entra num `WeakSet` (`TROCADAS`), fora de `view.pilha`. |
| `src/tokens.css` | Só comentários: `--ins-curva-ciclo` passa a ser também a curva do véu (com a conta de por que é a mais perto do `ease-out`), e `--ins-dur-entra` diz que o véu da folha e do pare acende nele. |
| `src/base.css` | Só o comentário de `ins-esmaece`: o cronômetro, a folha e o painel o usam sob "Reduzir", e é também o véu acendendo. |
| `DESIGN.md` | Tokens (`--ins-curva-ciclo`, `--ins-dur-entra`). Três linhas na tabela de movimentos: a folha sobe, o véu acende, o pare chega igual. Em "o que fica sem movimento": a saída da folha e do pare (até a peça 5), a troca do topo e o "Não guardei". Dois parágrafos novos: "O dedo segura a camada que chega" e "A camada de cima é a única alcançável" (com a janela do aviso). O quique é da caixa, nunca do invólucro. A guarda (g). A folha de baixo, em Componentes. |
| `tests/dominio/estilo.test.ts` | Caso novo (g). A guarda (b) passou a cobrar `getAnimations(` só na porta. |
| `tests/fluxo/camadas.test.js` (novo) | A árvore: isolamento com o cronômetro, pare e aviso em qualquer ordem, foco devolvido, a troca do topo, a janela do aviso. |
| `tests/fluxo/sobe.test.js` (novo) | O motor (Chromium; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit): o quique, o véu, a pilha, a troca, o pare, o aviso parado, "Reduzir", o toque no meio, o Tab com o descanso contando, a largura das folhas. |

### As decisões, com o porquê

1. **A curva do véu é `--ins-curva-ciclo`.** O desenho que o dono viu
   acendia o véu em `ease-out`. A maior distância entre as curvas (no
   progresso, ao longo do tempo) mede: `--ins-curva-ciclo` (o `ease`) 0,12;
   `--ins-curva-grandeza` (linear) 0,19; `--ins-curva` 0,39;
   `--ins-curva-camada` 0,41. O `ease-out` chega a 90 % aos 259 ms de 350; o
   `ease` aos 218; as curvas da camada e do lugar aos ~130, quando a folha
   ainda está lá embaixo. O token ganhou um segundo papel, escrito nele e no
   `DESIGN.md`, em vez de nascer um token novo: o pedido manda escolher o
   mais próximo. No motor, 90 % do véu chega aos 221–238 ms (os quadros
   arredondam).
2. **A animação é do nó que nasce, na caixa.** O quique mora na `.ins-folha`
   e na `.pare`, por CSS, no portão. O invólucro é o fixo, e nada acima de um
   fixo pode conter (guarda (d)); nenhum fixo mora dentro da caixa. O véu é
   irmão da caixa, então a folha empilhada tem véu próprio, e os véus somam.
3. **O pé da caixa (`::after`), um desvio pequeno.** No pico do quique a caixa
   está 8 % acima do lugar, e o pé dela sairia da borda de baixo. Por esse vão
   a página escurecida apareceria (na folha alta, 66 px). O iPhone não abre
   esse vão, e "como o iPhone" foi a resposta. O pé é o mesmo fundo
   continuando abaixo da caixa, com 10 % da altura dela (a guarda cobra pelo
   menos a ultrapassagem dos quadros). Em repouso ele fica fora da tela, num
   fixo, e não soma rolagem. É anatomia, não movimento. O desenho da página
   das decisões tinha o vão; se o dono o quiser de volta, é uma regra a
   menos.
4. **A troca do topo diz que é troca pela pilha, e fora dela.** Para o Preact,
   "cadastrar" é outro componente na mesma posição: nó novo, e a animação de
   chegada rodaria. Quem sabe a diferença é `trocaFolha`, que marca a folha
   que entra num `WeakSet`. A pilha passa isso à folha por contexto, e a folha
   o lê uma vez, no nascimento. A marca é estado de tela: fica fora de
   `view.pilha` (navegação, que o Voltar lê, e que três testes comparam por
   igualdade) e morre com a folha. Na troca o véu também não acende: um véu
   novo partindo de 0 piscaria o fundo.
5. **"Igual à folha" é o `Pare` inteiro, e não o "Não guardei".** O
   componente serve às duas famílias (apagar e a pergunta neutra), e as duas
   chegam com o quique. O aviso de falha usa a mesma moldura e não se move
   (03 §5.3; o pedido). Um pedido novo com outro aberto reaproveita o nó, como
   antes: a frase troca no lugar, sem subir de novo.
6. **O dedo segura a camada que chega.** O pedido manda: o × ou o véu tocados
   ~100 ms depois de abrir fecham a folha. Com a folha subindo, medi o
   contrário (`scratchpad/peca4/meio.mjs`, o × e o véu lidos na hora e
   tocados com 30 e 90 ms de dedo, a 60, 100, 150 e 220 ms): **0 de 16 toques
   fechavam, nos dois motores**, e parada ela fechava sempre. O clique saía
   noutro nó. O Chromium entrega o clique de um toque ao que está sob o dedo
   quando ele SOLTA. O WebKit com ponteiro o entrega ao ancestral comum dos
   dois alvos. E o Safari do iPhone, pelo que se sabe do WebKit do iOS (não
   verificado aqui), cancela o toque quando o nó sob o dedo muda entre descer
   e soltar. O conserto:
   `pointerdown` numa camada que ainda chega a segura (`seguraNoLugar`, na
   porta) até o clique ser entregue, até o toque virar rolagem
   (`pointercancel`) ou, se o clique não vier, 300 ms depois de o dedo sair
   (`SOLTA_SEM_CLIQUE_MS`). Depois a subida segue de onde parou. Duas
   tentativas antes desta não funcionaram: `animation-play-state: paused`
   numa classe, e `pause()` sozinho. As duas deixam a pausa pendente até o
   próximo quadro, e a folha ainda andava até ~60 px sob o dedo. Pausar e
   repor o tempo atual completa a pausa na hora, no tempo do quadro em que o
   toque foi testado. Isso é mexer em animação por JavaScript, então mora na
   porta, e a guarda (b) passou a cobrar `getAnimations(` só lá. Nada espera
   nada: o clique age quando chega, e nada escuta fim de animação. Sob
   "Reduzir" (e no jsdom) a porta responde `null` e nada é segurado.
7. **O isolamento é derivado da camada de cima.** Antes, cada folha marcava os
   próprios irmãos e desmarcava ao sair. Com três camadas que isolam, isso
   quebrava em duas ordens possíveis. Um aviso que chega com o pare aberto
   (z 88 sob 90) se isolaria por cima dele e mataria o pare. Um pare que fecha
   antes de uma folha aberta depois dele soltaria o fundo que a folha ainda
   precisa preso. Agora toda camada que nasce ou sai recalcula: a de cima é a
   primeira que existir na ordem pare › aviso › folhas (entre folhas, a que
   veio depois). Tudo o mais fica `inert`: os irmãos dela no `#app` e o
   `#timer` (`FORA_DO_APP`). O toast e a série dita ficam de fora: são regiões
   vivas sem nada focável, e inertes sairiam da árvore de acessibilidade. Só o
   que este isolamento marcou (`data-isolado`) é desmarcado. A camada que
   nasce por baixo de outra não rouba o foco. Ao sair, o foco volta a quem o
   tinha, se ainda estiver na página e alcançável. O foco entra com
   `preventScroll` (no quadro zero a caixa ainda está abaixo da borda).
8. **O pare e o aviso viraram componente interno.** Antes eles eram o mesmo
   componente, que devolvia `null`. Uma limpeza com dependência rodaria depois
   da pintura, um quadro depois de o painel sair, e um toque logo depois de
   "Deixar como está" cairia num fundo ainda inerte. Como componente que
   desmonta, a limpeza é síncrona, no mesmo desenho, como a da folha.
9. **A janela do "Não guardei": 400 ms, e só para o dedo.** Um toque de dedo
   só aciona um botão do aviso se o dedo DESCEU no aviso, e pelo menos
   `JANELA_DO_AVISO_MS` depois de ele chegar. Ninguém freia um toque já a
   caminho em menos de ~250 ms, e 400 dá a margem; ler a frase leva segundos.
   O toque engolido não faz nada, e o aviso fica. O clique de teclado e o de
   programa (`detail` 0) agem na hora, porque não há polegar a caminho. Num
   navegador sem Pointer Events não há como saber onde o dedo desceu: o aviso
   age como antes e nunca fica sem resposta. O registro de onde o dedo desceu
   é um ouvinte de `pointerdown` posto no efeito, e não `onPointerDown`: o
   Preact só liga o nome em minúsculas onde o elemento conhece
   `onpointerdown`, e no jsdom o ouvinte ficava como `PointerDown`.
10. **`overflow-x: hidden` no corpo da folha, e não `clip`.** Com
    `overflow-y: auto`, `clip` vira `hidden` do mesmo jeito. Medido nas sete
    folhas que abrem sem estado especial, nos dois motores: largura rolável
    igual à visível. Nada ficou cortado. O anel de foco (5 px) cabe na
    goteira de `--ins-8`.

### Os números

Chromium 1234 e WebKit 26.5 (Playwright), 414 × 896 a ×2, sem preferência e com
"Reduzir movimento". O `dist/` final foi copiado para o scratchpad e servido na
porta 4729 (desligada no fim). Scripts em `scratchpad/peca4/` (`mede.mjs`,
`meio.mjs`). Nenhum erro de página em nenhuma rodada.

| medida | antes (`d1f1025`) | Chromium | WebKit |
|---|---|---|---|
| a folha chega | num quadro | `ins-quique` 640 ms, só `transform` | igual |
| passa do lugar (8 folhas e o pare) | — | 8,00 % aos 338–355 ms | 8,00 % aos 351–357 ms |
| volta | — | 2,99 % aos 505–521 ms | 2,99–3,00 % aos 512–518 ms |
| topo da folha alta (824 px = 92dvh) no pico | — | 5,75 px | 5,73–5,75 px |
| o véu | aceso num quadro | `ins-esmaece` 350 ms, `ease`; 50 % aos 105–121 ms, 90 % aos 221–238 | 50 % aos 110–114, 90 % aos 222–227 (aquecido) |
| largura rolável, todo quadro | 414 | 414 | 414 |
| a primeira folha, com a segunda subindo | — | parada (71,69 → 71,69), véus 1 e 1 | igual |
| a troca do topo | — | nenhuma animação, véu aceso, nenhum deslocamento | igual |
| o "Não guardei" | parado | parado | parado |
| "Reduzir": chegada | num quadro | só `ins-esmaece` 120 ms na caixa e no véu, 0 px | igual |
| corpo da folha (largura rolável / visível) | 414 / 414, `overflow-x: auto` | 414 / 414, `hidden` | igual |

**O toque no meio da subida** (`meio.mjs`: o × e o véu lidos na hora, 30 e 90
ms de dedo; o véu 30 px acima do topo da folha):

| | sem segurar | com o dedo que segura |
|---|---|---|
| fechou (Chromium) | 0 de 16 | todo toque que desceu no × ou no véu: o × aos 220 ms (2 de 2), o véu aos 220 (2 de 2) |
| fechou (WebKit) | 0 de 16 | todo toque que desceu no × ou no véu: o × aos 150 (1) e 220 (2), o véu aos 100, 150 e 220 (4) |
| descer, soltar e clicar no mesmo nó | raro: o × descia no × e clicava no cabeçalho | Chromium 16 de 16; WebKit 14 de 16 (as duas aos 100 ms, nenhuma no ×) |
| o dedo desceu fora do alvo lido | — | o × aos 60–150 ms, e o véu rente ao topo da folha aos 60–150 ms |

A última linha não é do app, e é ela que importa para o fluxo 15 do revisor.
Entre o robô ler a caixa do × e o dedo descer passa ~um quadro. No começo do
quique o × anda até ~4 px/ms (60 px por quadro), mais que os 40 px dele, e o
dedo desce abaixo do ×, no conteúdo da folha. O toque chega a esse conteúdo,
inteiro (descer, soltar e clicar no mesmo nó), e a folha não fecha. Com o ×
mais lento (220 ms) ou o véu longe da borda da folha, fecha sempre. O teste da
peça toca o véu rente ao topo da tela aos ~100 ms (a folha nunca chega lá) e o
× aos 220 ms. Ver "Para o revisor".

### Os testes, e como provei que reprovam

**`tests/dominio/estilo.test.ts`, caso (g)** — de fonte. O quique é só das duas
caixas (`.ins-folha-w:not(.troca) > .ins-folha`, `.pare-w:not(.falhou-w) >
.pare`), no portão, com a curva da camada na declaração; sob `reduce` nada
quica. O véu acende só nas duas, com `ins-esmaece` em `--ins-dur-entra` e
`--ins-curva-ciclo`. Sob `reduce`, as quatro regras só esmaecem, em
`--ins-dur-dissolve`. Nenhuma outra regra de movimento toca folha, invólucro,
véu, pare, aviso ou faixa. O pé existe nas duas caixas, com `top: 100%`,
`background: inherit` e altura de pelo menos a ultrapassagem lida dos quadros.
E `.ins-folha-c` tem `overflow-x` `hidden` ou `clip`. A guarda (b) cobra
`getAnimations(` só na porta.

**`tests/fluxo/camadas.test.js`** (jsdom, 8 casos):

- com o descanso contando, a folha isola também o cronômetro (e não o toast
  nem a série dita), e fechada solta tudo;
- o pare isola o fundo e o cronômetro, foca a saída e devolve o foco;
- o "Não guardei" isola; chegando por baixo de um pare aberto, nasce inerte e
  não rouba o foco; o pare que fecha primeiro deixa o aviso como camada de
  cima, com o fundo ainda preso;
- a folha aberta por baixo do pare nasce inerte, e o pare que fecha antes não
  solta o fundo dela;
- a folha empilhada isola a de baixo, e ao fechar devolve o foco ao ··· que a
  abriu;
- a troca nasce com `troca`, a que empilha não, e a marca morre com a folha
  (fora de `view.pilha`);
- o aviso não aceita o toque que desceu nele logo que chegou, nem o clique de
  um dedo que desceu antes de ele existir; aceita o de propósito depois da
  janela (lida da constante no fonte, e cobrada entre 250 e 600 ms);
- o teclado e um navegador sem Pointer Events não esperam a janela.

**`tests/fluxo/sobe.test.js`** (motor, 7 casos; os tempos, a curva e os quadros
lidos dos tokens):

- a folha (a alta e a curta): uma animação só, `ins-quique`, no tempo e com
  os quadros dos tokens. O véu `ins-esmaece` no tempo da camada e na curva do
  véu, só opacidade. O invólucro parado. Nasce abaixo do lugar, passa e
  volta. O pico fica dentro da tela, e rente à borda de baixo o dedo acha a
  caixa (o pé). O véu vai de apagado a aceso. Nenhum quadro mais largo que a
  janela, e o `main` atrás não se move;
- a segunda sobre a primeira (a primeira não se move nem volta a animar; os
  véus 1 e 1); a troca sem animação, sem deslocamento e com o véu aceso;
- o pare igual à folha, e a frase sem animação própria; o "Não guardei"
  parado;
- sob "Reduzir", folha, pare e véus só `ins-esmaece` em `--ins-dur-dissolve`,
  só opacidade, nenhum deslocamento; sai no mesmo desenho;
- o toque no meio: o véu rente ao topo aos ~100 ms fecha. Com o dedo pousado
  aos ~120 ms a folha não anda (80 ms depois, mesmo topo; a animação
  `paused`), descer, soltar e clicar são o mesmo nó, e solto o dedo a subida
  segue. O × aos 220 ms, até 6 tentativas: pelo menos uma desce no ×, todo
  toque que desceu no × fecha, e todo toque sai no nó em que desceu;
- com o descanso contando, 14 Tabs e 14 Shift+Tabs na folha, no pare e no
  aviso: o foco nunca sai da camada (só para a barra do navegador, o `body`);
- as sete folhas: nada passa da largura, e `overflow-x` não é `auto`.

Cada camada é aberta e fechada uma vez antes de medir. No WebKit desta
máquina a primeira vez que ela aparece custa centenas de ms, e o primeiro
quadro amostrado já vinha perto do fim (é a passada de aquecimento do
revisor). Rodei o arquivo três vezes no Chromium e duas no WebKit, todas
verdes.

**Plantio** (`scratchpad/peca4/planta.py`: aplica, constrói quando o caso é de
árvore ou motor, roda só os casos da peça, registra e devolve o arquivo; o
último passo reconstrói o limpo). Os 22 ficaram vermelhos; o controle, verde:

| # | a violação plantada | quem ficou vermelho |
|---|---|---|
| P1 | o quique fora do portão | (b) |
| P2 | o invólucro (o fixo) quica | (g); motor: a folha, a pilha, o toque no meio |
| P3 | a troca do topo sobe | (b), (g); motor (Chromium e WebKit): a troca |
| P4 | o "Não guardei" sobe | (b), (g); motor: o pare e o aviso |
| P5 | o véu na curva da camada | (g); motor: a folha, a pilha, o pare |
| P6 | o véu no tempo do quique | (a), (g) |
| P7 | sob "Reduzir", o quique | (b), (c), (g); motor: "Reduzir" |
| P8 | sem o pé da caixa | (g); motor (Chromium e WebKit): a folha, a pilha, o pare ("nenhum vão") |
| P9 | o cronômetro fora do isolamento | árvore: folha, pare e aviso; motor: o Tab |
| P10 | o pare sem isolar | árvore: pare, aviso sob o pare, folha sob o pare; motor: o Tab |
| P11 | a ordem das camadas trocada (a folha por cima) | árvore: aviso sob o pare, folha sob o pare |
| P12 | a camada que nasce por baixo rouba o foco | árvore: aviso sob o pare |
| P13 | sem a janela do aviso | árvore: a janela |
| P14 | a janela que nunca abre (o dedo não é registrado) | árvore: a janela ("depois da janela, o toque de propósito fecha") |
| P15 | a janela vale também para o teclado | árvore: teclado e sem Pointer Events |
| P16 | sem o dedo que segura | motor (Chromium e WebKit): o toque no meio |
| P17 | a pausa pendente (`pause()` sem repor o tempo) | motor (Chromium e WebKit): o toque no meio |
| P18 | a troca sem a marca | árvore: a troca; motor: a troca |
| P19 | mexer na animação fora da porta | (b) |
| P20 | o corpo da folha volta a rolar de lado | (g); motor: a largura |
| P21 | o véu da folha não acende | (b), (g); motor: a folha, a pilha |
| P22 | o quique no tempo da camada | (a) |
| V1 | controle: a janela em 500 ms (ainda de toque a caminho) | nenhum: o caso lê a constante |

**Contra o build de antes.** A árvore de `d1f1025` (`git archive`, no
scratchpad, construída lá) com os três arquivos de teste novos. O de árvore
leu a janela como 400, porque lá a constante não existe. Ficam vermelhos 14
dos 16 casos novos, todos pelo defeito:

- a guarda (g): o quique não é de ninguém;
- na árvore: o cronômetro alcançável com a folha; o fundo do pare e do aviso
  não inerte; a folha sob o pare não inerte; a troca sem a marca; o aviso
  fechado pelo toque que chegou junto;
- no motor: nenhuma animação na folha, no pare nem sob "Reduzir"; nada para
  segurar; o Tab saindo da folha; o corpo com `overflow-x: auto`.

Os dois verdes guardam o que já funcionava: a folha empilhada que devolve o
foco, e o clique de teclado no aviso.

### O que ficou de fora, e por quê

- **A descida** da folha e do painel é da peça 5 (transição de vista). As duas
  saem de uma vez, sob "Reduzir" ou não.
- **"Não guardei" como `alertdialog`** (05 §3.4, regra 7) não entrou. O
  pedido manda isolar, e o papel continua `alert`: `gravacao.test.js` o lê, e
  trocar o anúncio é outra conversa.
- **O foco quando a camada de baixo vira a de cima** (o pare fecha e o aviso
  que estava por baixo dele fica): o foco volta a quem o pare guardou. Se esse
  elemento está inerte (atrás do aviso), o foco não vai a lugar nenhum, e o
  aviso não o puxa. É um caso raro (aparelho cheio durante um pare aberto) e
  ficou dito.
- **O botão de apagar passando sob o polegar** durante a subida do pare
  (03 §5.2) é o risco que o dono aceitou na pergunta 11. O dedo que segura
  garante que o toque vai para onde desceu, e não para onde a camada foi.
- **Nada foi visto num iPhone.** Ficam pela leitura: se o "pausa e repõe o
  tempo" para a camada no mesmo quadro também com o Core Animation do A13 (o
  WebKit desta máquina, sem placa de vídeo, parou: 14 de 16 toques no mesmo
  nó); e o cancelamento do toque quando o nó sob o dedo muda, que é o motivo
  de o segurar importar mais lá do que aqui — conhecido do WebKit do iOS, não
  medido.

### Para o revisor

- **Fluxo 15** (o × a +99 ms): veja a última linha da tabela do toque no meio.
  Com o quique, o × anda até 60 px por quadro nessa hora, e o robô lê a caixa
  um quadro antes de o dedo descer. Ele deve descer abaixo do ×, no corpo da
  folha, e a folha não fecha (`confere` falso). O toque não se perde: chega,
  inteiro, ao que estava sob o dedo (`alvoDoPousar` = `alvoDoClique`). Para
  provar "o toque no meio fecha", o segundo toque precisa cair no véu longe
  da borda da folha (rente ao topo da tela a folha nunca chega) ou no × mais
  tarde (~220 ms). Se o fluxo continuar no × a +99 ms, a reprovação é da
  mira, não do app. Não mexi em `_medicao/`.
- **`micro-avisos.mjs`** clica "Fechar este aviso" logo que o aviso chega
  (entre detectar e clicar há uma foto de tela). Se isso acontecer antes de
  400 ms, o clique agora é engolido, por desenho (defeito 5), e a faixa "Não
  guardado" não aparece na medida seguinte. O script precisa esperar a
  janela. Não editei (`_medicao/` é do revisor).
- **As durações que aparecem**: 640 (o quique da folha e do pare, só na
  chegada), 350 (o véu) e 120 (o esmaecer sob "Reduzir"), todas da lista do
  07 §1.2. A ultrapassagem só nos 640, só na chegada da folha e do pare.
- **WebKit desta máquina, a frio**: a primeira vez que uma camada aparece, o
  primeiro quadro chega a ~280 ms (medido no seletor de dia, também sob
  "Reduzir"). Aquecido, é imediato.

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
src/main.jsx (7532:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-B6r7CKSb.css  105.05 kB │ gzip:  18.70 kB
dist/assets/index-cHaoqgWu.js   585.23 kB │ gzip: 182.63 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 782ms
(saída 0)
```

`npx vitest run`:

```
 RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app

 Test Files  81 passed (81)
      Tests  1639 passed (1639)
   Start at  23:19:53
   Duration  43.09s (transform 3.23s, setup 0ms, import 31.54s, tests 424.15s, environment 13ms)

(saída 0)
```

Antes desta peça: 1623 de 1623 (peça 3). A diferença, +16, são os casos novos:
1 em `estilo.test.ts` (59), 8 em `camadas.test.js` e 7 em `sobe.test.js`.

---

## Peça 5 · Telas cheias e modo de sessão

Implementada em 19 e 20/10, sobre `5a6fced`, sem commit. Espec: o pedido em
`_pedidos/peca-5.md`; `08-parecer.md` §3, §4 (peça 5), §5.1 e §6; as respostas do
dono em `00-coordenacao.md` (16/10, 01h25) — pergunta 4 (da direita, a tela
inteira, a de baixo PARADA), 5 (o modo como qualquer tela cheia), 1 (350 ms na
curva do iPhone, sem quique; nenhuma saída quica), 2 (sob "Reduzir" esmaece ao
chegar, sai de uma vez), 6 (o quadro a mais, aceito) e 13 (defeitos 4 e 7);
`02-navegacao.md` §1, §2.0, T1–T3, T5–T7, §3.3–3.5; `04-desempenho.md` §2.4–2.6;
`05-acessibilidade.md` §3.1 e §3.3; `03-micro.md` §5.3 e §8 item 3; a linha da
peça 5 do `07-revisao-base.md` §1.4. E o item que o coordenador mandou no meio,
da conferência da peça 4 (07 §10): no Chromium, o dedo pousado na folha que sobe
a fazia VOLTAR um quadro.

O implementador caiu no limite de uso logo depois de reescrever a parte do toque
da porta. Retomado às 02h00: a reescrita estava inteira (de `SEGURA NO LUGAR` até
o fim de `trocaDeCamada`); faltava um tipo (`tsc`: `[].concat` dava `never[]` em
`miraDoDedo`), corrigido.

### Em uma página

- **A condição de entrada passou nas quatro camadas, nos dois motores.** Um
  segundo toque no meio da troca chega ao que está sob o dedo: o "‹ Voltar" no
  meio da chegada dos Ajustes, a seta no meio da chegada do modo (o fluxo 16), o
  ⚙ do Agora no meio da descida da folha e no meio da descida do painel de
  apagar — com o dedo (toque de verdade) e com o ponteiro, no Chromium e no
  WebKit 26.5. Nenhuma camada ficou seca. O teste é `troca.test.js`, o primeiro
  caso, e fica na suíte.
- **O que ele vê.** A tela cheia (os 14 destinos e os Ajustes) e o modo chegam
  da borda direita, a tela inteira, em 350 ms na curva do iPhone, com um fio de
  1 px na borda esquerda; a de baixo fica parada. Saem pela direita, por cima da
  que reaparece, no mesmo tempo — pela seta, pelo "‹ Voltar", pelo Esc e pelo
  Voltar do sistema. A folha e o painel de apagar DESCEM em 350 ms, sem quique,
  e o véu apaga junto; a folha de baixo de duas fica onde está. O cronômetro, o
  aviso curto, a faixa da sessão e a faixa "Não guardado" ficam parados enquanto
  as páginas passam. Sob "Reduzir movimento", nenhuma transição: a tela cheia e o
  modo esmaecem 120 ms ao chegar e tudo sai de uma vez.
- **A técnica** é a transição de vista de mesmo documento, pedida num ponto só:
  o `render()` compara as camadas desenhadas com as que `view` pede e, se a troca
  é de camada, desenha dentro de `trocaDeCamada` (a porta). As FOTOS se movem;
  nenhum elemento real ganha `transform`.
- **O toque nunca espera.** O `pointerdown` no meio da troca pula para o fim
  (`skipTransition()`), o desenho pendente entra na hora, e o clique vai ao que
  ficou sob o dedo. Nada espera `finished`, `ready` ou `updateCallbackDone` (da
  `ready`, só a rejeição do pulo é marcada como tratada — decisão 21).
- **A folha que sobe não volta mais um quadro.** O dedo deixou de pausar a
  chegada: o clique do toque vai ao nó em que o dedo desceu ("a mira"), e a
  subida segue. Nos quadros do compositor do Chromium, antes a borda da folha
  parava ~200 ms sob o dedo e voltava 56 px de 2× (28 px) ao soltar; agora só
  sobe, quadro a quadro, até o pico do quique.
- **As precondições.** A rolagem volta exata (o Corpo entrava a 1778 e voltava a
  24 nesta semente; agora 1778 → 1778, pela seta e pelo Voltar); o foco entra no
  título do destino e do modo e volta ao controle que abriu (antes, `body` ao
  sair de toda tela cheia e ao entrar e sair do modo); o modo curto não sobra
  (24 px, 58 com a área segura → 0); o cronômetro nas telas cheias no fundo da
  tela (761,8–844 → 813,8–896). Defeito 4: a faixa "Não guardado" deixou de
  cobrir a seta, a hora, o `···`, o "‹ Voltar" e o ⚙. Defeito 7: o campo de
  importar mostra o anel com o teclado (antes, nada).
- **O quadro a mais, medido:** do toque ao desenho novo, Chromium +18 ms
  (10,3 → 28 ms, mediana de 9); WebKit desta máquina, +31 ms (1 → 32).
- **Testes.** 13 casos novos: 10 em `troca.test.js` (motor, Chromium e
  WebKit), 2 em `navegacao.test.js` (árvore) e a guarda (h); o caso do toque na
  subida de `sobe.test.js` reescrito para a mira; (b), (d) e (e) ajustados, e um
  buraco da (d) fechado. Plantei 35 violações e as 35 ficaram vermelhas; o
  controle, verde. Contra o build de antes, os 16 casos novos ou reescritos ficam
  vermelhos.
- **Dois defeitos achados no caminho, e consertados.** Com o desenho pendente, o
  `popstate` atrasado de um fecho anterior fechava a camada recém-aberta (visto no
  WebKit); e pular uma transição antes de ela andar deixava uma rejeição sem dono
  (erro de página, nos dois motores). Ver as decisões 20 e 21.
- **`tipos` limpo, `build` ok, `vitest` 1652 de 1652.**


### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/ui/movimento.js` | **`trocaDeCamada(sentido, desenha, anima)`**: põe o sentido em `html[data-nav]` (`entra`, `sai`, `fica`) e, com movimento pedido e a API, desenha dentro de `startViewTransition`; senão, na hora. `desenha` é idempotente; um relógio de 1 s (`DESENHO_ATRASADO_MS`) desenha se o navegador nunca chamar (página escondida no meio). **O toque**: `aoDescer` (pula e desenha), `aoSoltar`/`aoCancelar`/`aoClicar` e `entregaOClique`, na janela, na captura. **A mira** (`miraDoDedo`, para a camada que chega por CSS): o alvo do `pointerdown`; o clique que cair em outro nó é engolido e reenviado a ele, e o que não vier em `SEM_CLIQUE_MS` (300) depois de soltar o app entrega. **`seguraNoLugar` saiu** (a pausa da peça 4). A transição ainda corre? `document.activeViewTransition`, ou o relógio do token onde ele não existe. A rejeição do pulo antes de a transição andar é marcada como tratada (`ready.catch(semDono)`, `semDono` vazia). |
| `src/main.jsx` | **O `render()` num ponto só**: `sentidoDaTroca(desenhadas, pedidas)`, `desenhaAgora`, `desenhaPendente`; com o desenho pendente, `render()` não faz nada. **A rolagem dentro do desenho**: `rolagemPendente`, `rola(y)` (todas as 15 chamadas `window.scrollTo(0, 0)` do casco passaram por ela), `noDesenho(f)` (`mostraExercicio`, `rolaPor`). `entraNoDestino` guarda a posição (ou a já pedida) e pede o topo para o desenho; `saiDoDestino` rola com `rola`; `saiDoDestinoNoDesenho` para o "Detalhar" (um destino sai e outro entra no mesmo desenho). **A ordem** em `fechaModoDeSessao`, `fechaAjustes` e no fecho da revisão incorporada: desenha, depois rola. **O foco devolvido**: `focoDoDestino`, `chaveDoAcionador` (o controle tocado há menos de 1 s, ou o focado: `data-a`, ou tag e primeira classe, e a posição entre os iguais, e o texto), `devolveOFoco` (o controle, ou o `h1[tabindex]` da tela que reaparece). **O Voltar já animado**: `voltarUmaCamada({ jaAnimado })` desenha sem transição. Com o desenho pendente, a navegação conta as camadas da tela desenhada (decisão 20). `LugarNaPilha` em volta de cada folha. |
| `src/ui/navegacao.js` | O `popstate` lê `hasUAVisualTransition` e passa `{ jaAnimado }` ao fecho. |
| `src/ui/instrumento/folha.jsx` | `seguraSobODedo` virou `miraSobODedo` (sem pausa). `LugarNaPilha` (contexto): o véu e a caixa se nomeiam `veu-N` e `folha-N` no `style`, pela posição na pilha. |
| `src/ui/instrumento/pare.jsx` | O painel usa `miraSobODedo`. A faixa "Não guardado" virou um componente interno (`FaixaNaoGuardado`) que publica a altura em `--ins-ng-h` (efeito de layout) e a zera ao sair. Comentários do cabeçalho. |
| `src/ui/instrumento/telacheia.jsx` | O foco no título passou de `useEffect` a `useLayoutEffect`: no mesmo desenho, e sem roubar depois o foco que o casco devolve. |
| `src/ui/telas/sessaomodo.jsx` | O modo foca o `h1` do treino ao montar (efeito de layout, `preventScroll`). |
| `src/ui/instrumento/primitivos.jsx`, `src/ui/app.jsx` | `tabindex="-1"` no `h1` do `Cabecalho` e no do Agora: o título da aba é o lugar declarado do foco quando o controle que abriu não existe mais (e o do treino é o alvo do modo). |
| `src/componentes.css` | Bloco novo **"A TROCA DE CAMADA"** depois das telas cheias: fora do portão as quatro fotos `animation: none`; os nomes do que é do aparelho (`#timer` → `cronometro`, `#toast` → `aviso`, `.ins-faixa` → `faixa`, `.ng-faixa` → `nao-guardado`) e do painel (`painel`, `veu-painel`); o que é do aparelho e sai da tela some no primeiro quadro (`:only-child`, `opacity: 0`); no portão, `entra` (foto nova, `ins-da-direita`, 350 ms, curva da camada, fio de 1 px na borda esquerda com margem −1 px), `sai` (foto velha, `ins-para-direita`, por cima, `z-index: 1`, o mesmo fio), a descida (`folha-0`…`folha-3` e `painel`, só `:only-child`, `ins-desce`) e o véu (`veu-0`…`veu-3`, `veu-painel`, `ins-apaga`, curva do véu); sob `reduce`, `html[data-nav="entra"] .tc` e `.ins-modo` esmaecem em `--ins-dur-dissolve`. **`.ins-modo`**: `min-height: calc(100svh - var(--ins-pe))` (com o fallback em `vh`). **A reserva do rodapé** também em `html:has(.tc)`. **`--ins-topo`** no padding de `.ins-cab`, `.tc-topo`, `.ins-modo-topo` e em `--ins-modo-topo-h`. Comentários da camada que chega (a mira, a descida) e do topo da tela cheia (o Voltar do sistema existe). |
| `src/base.css` | `--ins-pe` nomeado no `#app` (o pé da página, que o modo desconta). O anel do campo de arquivo: `label:has(> input[type="file"]:focus-visible)`. Os quadros `ins-da-direita`, `ins-para-direita`, `ins-desce`, `ins-apaga`. |
| `src/tokens.css` | `--ins-ng-h` (0) e `--ins-topo: max(var(--sa-top), var(--ins-ng-h))`. |
| `DESIGN.md` | Quatro linhas na tabela de movimentos (a tela cheia e o modo chegam, saem; a folha e o painel descem; o véu apaga). "O que fica sem movimento": o que é do aparelho na troca, o Voltar já animado, a primeira tela; a saída da folha deixou de estar lá. "O dedo segura a camada" virou "O toque chega ao que o dedo mirou" (com a troca de camada). Parágrafo novo: a troca num ponto só, a rolagem e o foco dentro dela. A guarda (h). |
| `tests/dominio/estilo.test.ts` | Caso novo **(h)**. **(b)**: as fotos ficam fora do "último quadro" (só existem durante a troca), mas fora do portão têm de estar `animation: none`; o esmaecer da tela cheia e do modo sob `reduce` conta como movimento no portão quando a foto `root` daquele sentido anima lá. **(d)**: o SUJEITO do seletor também conta (um buraco: `html[data-nav] .ins-modo { transform }` passava, porque o seletor tem descendente — visto ao montar o plantio; o P27 prova que agora reprova). **(e)**: a exceção única de `.ready.catch(semDono)`, com `semDono` conferida vazia. A reserva do rodapé: no modo e na tela cheia. |
| `tests/fluxo/troca.test.js` (novo) | O motor (Chromium; `LASTRO_MOTOR=webkit` os mesmos no WebKit), 10 casos. |
| `tests/fluxo/navegacao.test.js` | 2 casos de árvore: a ordem da rolagem (desenha, depois rola) e o foco devolvido. |
| `tests/fluxo/sobe.test.js` | O caso do toque no meio da subida foi reescrito para a mira (sem pausa, nenhum quadro volta); `fecha` espera a descida acabar (`document.activeViewTransition`), e a folha fechada é esperada sair do DOM (o desenho vem ~1 quadro depois). |
| `tests/fluxo/navegador.js` | `treinoDeHoje` espera a troca de camada acabar antes de devolver (entrar no modo passou a ser transição). |

### As decisões, com o porquê

1. **Um ponto só, e a troca é de CAMADA, medida contra o desenhado.** O
   `render()` guarda as camadas da tela desenhada (`camadasDesenhadas`) e compara
   com `camadasAbertas(view)`. Muda o destino do topo: `entra` se o novo não
   estava na pilha, `sai` se estava (ou se não há destino: a aba volta). O mesmo
   destino e menos folhas, ou o pare que fecha: `fica`. O resto não é troca de
   camada — a folha e o pare que ABREM sobem por CSS (peça 4), a troca do topo e
   o "Não guardei" não se movem, trocar de aba é da peça 6 —, e desenha na hora.
   A primeira tela nunca (`abriu`). O "Detalhar" (o lançamento sai e o modo entra
   no mesmo desenho) é `entra`, como 02 T1 pede.
2. **Enquanto o desenho está pendente, `render()` não faz nada.** O desenho que
   vem lê o `view` mais novo: "Ir para Semana" na Evolução (fecha e troca de
   aba) é UMA transição, no sentido da primeira (`sai`), medida no motor. É a
   regra da 02 T2.
3. **A rolagem é um valor pendente, e não uma fila de `scrollTo`.** `rola(y)`,
   com o desenho pendente, guarda `y`; o desenho aplica o último, logo depois de
   montar. `entraNoDestino` pede o topo SEMPRE para o próximo desenho (ele é
   chamado antes do `render()`) e guarda como posição de baixo a que está na
   tela — ou a já pedida, quando um destino fecha e outro abre no mesmo toque
   (`saiDoDestinoNoDesenho`, o "Detalhar": rolar o lançamento cortaria na altura
   dele). Os fechos que rolavam antes do `render()` (o modo, os Ajustes, a revisão
   incorporada) passaram a desenhar e depois rolar, como os outros onze. No
   caminho sem transição (jsdom, "Reduzir") o resultado final é o de antes; o que
   muda é a ordem, que era o defeito.
4. **A página inteira é UMA foto, e o que é do aparelho tem nome.** A variante de
   fotografar só as páginas foi medida e descartada pela 02 (§3.3). A barra de
   abas NÃO tem nome nas trocas de camada: ela é do lugar, fica parada embaixo da
   tela que chega e é descoberta pela que sai; nomeada, ela ficaria por cima da
   tela cheia que chega. O que é do aparelho e sai da tela (a faixa da sessão, que
   o modo cobre) some no primeiro quadro (`:only-child`, `opacity: 0`) em vez de
   ficar 350 ms por cima da página que chega; o que chega (a faixa, ao sair do
   modo) aparece parado no lugar — 02 T1.
5. **O fio de 1 px é borda da FOTO, com margem −1 px.** Sem sombra (inegociável
   3). Com a margem, o fio fica além da borda da tela no último quadro, e nada
   salta 1 px quando a foto dá lugar à página. Nas duas fotos que andam (a que
   chega e a que sai).
6. **A descida só na foto velha sem nova (`:only-child`).** A folha que continua
   aberta debaixo da que fecha tem foto velha e nova, e não se move. Quatro
   posições na pilha têm regra (o desenho para em três); uma quinta sairia de uma
   vez. Os nomes vêm do `style` da `Folha`, pela posição (`LugarNaPilha`), nunca
   pelo nível (refeição e "editar refeição" são 50, e nome repetido aborta a
   transição). Medido: o `:only-child` nas fotos funciona nos dois motores.
7. **O véu apaga na curva do véu (`--ins-curva-ciclo`)**, no tempo da saída: a
   mesma curva em que ele acende (peça 4), e "junto" com a caixa.
8. **O toque no meio: pula e mira.** Sonda nos dois motores (página mínima): sem
   o pulo, o toque cai no `html` e se perde (o toque de dedo no WebKit nem gera
   clique); com o pulo, o DOM final responde ao teste de toque no mesmo
   instante, o dedo (touch) chega sozinho ao alvo nos dois, e o ponteiro (mouse)
   cai na raiz (ancestral comum) nos dois. Por isso: pula, desenha o pendente,
   fixa a mira no que ficou sob o dedo, e só reenvia o clique que cair fora da
   mira — o que chegou certo segue como veio, sem clique em dobro. O clique que
   não vier (o iPhone, que cancela o toque quando o nó sob o dedo muda — não
   verificado aqui) o app entrega 300 ms depois de soltar; o que virar rolagem
   (`pointercancel`) não clica.
9. **A camada que chega por CSS usa a mesma mira, e nada pausa** (o item do
   coordenador). A pausa da peça 4 (`pause()` e repor `currentTime`) caía no
   tempo da thread principal, e no Chromium o compositor já estava um quadro à
   frente: a folha voltava. A forma que ele preferiu: guardar o alvo do
   `pointerdown` e reenviar a ele o clique que cair em outro nó. É a mesma função
   da troca de camada (`arma`, `aoClicar`), e por isso a "mira" é uma só. Medido
   nos quadros do compositor (abaixo): antes, a borda parava ~200 ms sob o dedo e
   VOLTAVA ao soltar; agora só sobe até o pico.
10. **A transição ainda corre?** `document.activeViewTransition` (existe no
    Chromium 151 e no WebKit 26.5); onde não existir (iOS 18), o tempo da
    camada mais 150 ms depois do desenho. Nunca `finished`.
11. **O desenho atrasado.** Se o navegador fotografar e nunca chamar o desenho
    (a página escondida no meio da troca), o app pula e desenha em 1 s. Não é
    esperar animação: é não deixar o app sem desenho.
12. **O Voltar que o navegador já animou desenha seco.** `hasUAVisualTransition`
    no `popstate`, passado ao fecho (`jaAnimado`, só durante a chamada). O botão
    Voltar do Android chega com `false` e anima o mesmo reverso. Provado com um
    `popstate` sintético com o campo (o gesto de borda não se produz aqui).
13. **O foco volta a um lugar declarado.** A chave do controle que abriu é
    guardada ao entrar, por nome do destino, como a rolagem: o tocado há menos de
    1 s (o Safari não foca botão no toque) ou o focado (o teclado); `data-a`, ou a
    tag e a primeira classe, mais a posição entre os iguais e o texto. Ao sair
    para uma camada que já estava lá, o foco vai a ele, redesenhado; se ele não
    existe, ao `h1[tabindex]` da tela que reaparece (o título da aba, que ganhou
    `tabindex="-1"`, ou o da tela cheia de baixo). Com uma folha, o pare ou o
    aviso por cima, eles ficam com o foco deles. O título da tela cheia passou a
    receber o foco no efeito de LAYOUT: no mesmo desenho (quadro zero), e sem
    roubar, depois da pintura, o foco que o casco devolveu à tela de baixo.
14. **O modo ganha foco no título do treino**, o `h1` do cabeçalho do `Treino`
    (05 §3.4, regra 5), uma vez por montagem.
15. **A sobra do modo: o pé tem nome.** `#app` soma por baixo `--ins-pe` (a
    reserva do rodapé, o cronômetro, a faixa e 24 px); o modo desconta o mesmo
    pé da altura dele. A cadeia acima concorda (`body` em `100svh`, `#app` e
    `html` na altura do conteúdo).
16. **O cronômetro nas telas cheias: `html:has(.tc)`.** Todos os 14 destinos e os
    Ajustes desenham a moldura `.tc` (conferido um a um). Consequência dita: o fim
    da página de toda tela cheia perde os 52 px mortos da barra que ela não
    desenha, como o modo perdeu na peça 3.
17. **Defeito 4: as barras do topo começam abaixo do que cobre o topo.** A faixa
    "Não guardado" publica a altura (`--ins-ng-h`, como a faixa da sessão
    publica a dela), e `--ins-topo = max(--sa-top, --ins-ng-h)` substitui
    `--sa-top` no padding da barra do modo (e em `--ins-modo-topo-h`, onde o
    relógio da sessão para), da barra da tela cheia e do cabeçalho das abas. A
    faixa não se esconde nem se move; as barras crescem para baixo dela, e o
    fundo delas continua passando por trás. **Desvio dito:** o defeito nomeava o
    modo; o mesmo mecanismo cobria o "‹ Voltar" de toda tela cheia (a única saída
    à vista) e o ⚙ do Agora — medido: os três cobertos antes —, e o conserto é
    uma variável só. Consertei os três.
18. **Defeito 7: o anel vai no rótulo.** O `input` de arquivo é transparente
    sobre o rótulo, e a regra dos campos tira o contorno dele. `label:has(>
    input[type="file"]:focus-visible)` desenha o anel do sistema no rótulo, que é
    o botão que se vê. Vale para os outros campos de arquivo do mesmo desenho (a
    foto do aparelho, a lousa): o mesmo defeito, e a mesma regra.
19. **Sob "Reduzir movimento", o esmaecer da tela cheia e do modo é por CSS no nó
    que nasce, só na chegada** (`html[data-nav="entra"]`): a porta põe o sentido
    no `html` também sem transição, e a tela de baixo que reaparece não esmaece
    (ela já estava lá). O `data-nav` fica até a próxima troca (06 §4.4): limpo a
    cada `render()`, cortaria a animação das fotos de uma transição em curso.
20. **O `popstate` se mede contra a tela desenhada, com o desenho pendente.**
    Achado no WebKit (o caso 10 de `troca.test.js` ficou vermelho só lá): o
    desenho que fecha uma camada pelo botão consome a entrada dela
    (`history.go(-1)`), e o `popstate` disso chega depois; se uma camada nova
    abre nesse meio, o desenho dela está pendente e a entrada dela ainda não foi
    empurrada — e o `popstate`, comparando com o `view` pendente, via uma camada a
    mais e FECHAVA a recém-aberta (sair do modo e abrir a Evolução logo depois: a
    Evolução não abria). A janela existia antes, mas era de microtarefas; com o
    desenho um quadro adiante (ou centenas de ms, no WebKit a frio), ela se
    alcança. Com o desenho pendente, a navegação passa a contar as camadas da tela
    DESENHADA, que são as que o histórico tem. Caso próprio no motor, determinístico
    (a Evolução abre na microtarefa logo depois do desenho que fecha os Ajustes).
21. **A rejeição do pulo é marcada como tratada.** Pular uma transição antes de
    ela começar a andar — o toque no primeiro quadro, ou uma troca nova logo
    depois do desenho — rejeita a `ready` dela (`AbortError`) nos dois motores
    (sonda: `pulo-antes-do-desenho`, `pulo-no-desenho` e `nova-no-desenho`
    rejeitam; depois de andar, não), e a rejeição sem dono vira erro de página.
    A porta faz `ready.catch(semDono)` com uma função VAZIA — nada espera nada — e
    a guarda (e) abre essa exceção, uma só, conferindo que `semDono` continua
    vazia (plantios P33 e P34).

### O toque atravessando, por camada e por motor

`troca.test.js`, primeiro caso: a troca começa, aos ~120 ms (no relógio da
página) confere-se que alguma foto se move, e o alvo — lido no DOM final — é
tocado. Com o dedo (toque de verdade: `touchscreen.tap`) e com o ponteiro
(mouse). Cada camada é aquecida antes (a primeira vez no WebKit desta máquina é
lenta).

| camada | o segundo toque | Chromium, dedo · ponteiro | WebKit 26.5, dedo · ponteiro |
|---|---|---|---|
| tela cheia (Ajustes chegando) | o "‹ Voltar" | fecha · fecha | fecha · fecha |
| modo de sessão (chegando pelo cartão; o fluxo 16) | a seta "‹" | fecha · fecha | fecha · fecha |
| folha descendo (o seletor de dia) | o ⚙ do Agora, que estava atrás dela | abre os Ajustes · abre | abre · abre |
| painel de apagar descendo ("Deixar como está") | o ⚙ do Agora | abre · abre | abre · abre |

Nenhuma camada ficou seca, em nenhum motor. Sem o pulo (plantio P2), as quatro
perdem o toque nos dois motores; sem o reenvio (P3), o ponteiro perde nos dois.
Na exploração (`scratchpad/peca5/explora.mjs`), o mesmo resultado com o dedo pelo
CDP no Chromium.

### Os números, antes e depois

Chromium 1234 e WebKit 26.5 (Playwright), 414 × 896 a ×2. O antes é o build de
`5a6fced` (`git archive`, construído no scratchpad: os mesmos arquivos da peça
4, `index-cHaoqgWu.js`); o depois, o final (`index-D8nGJrXY.js`). Os dois servidos da mesma porta, 4729, desligada no fim.
Scripts em `scratchpad/peca5/` (`mede.mjs`, `extra.mjs`, `recuo.mjs`). Nenhum
erro de página. Os dois motores deram os mesmos números, menos onde a tabela
separa.

| medida | antes | depois |
|---|---|---|
| a rolagem devolvida: o Corpo rolado até o fim → a faixa → o modo → a seta | 1778 → **24** | 1778 → 1778 |
| o mesmo, pelo Voltar do sistema | 1778 → **24** | 1778 → 1778 |
| o Agora rolado → Ajustes → "‹ Voltar" e Voltar | 334 → 334 | 334 → 334 |
| o foco, ao entrar no modo pelo cartão | `body` | o `h1` do treino |
| ao sair do modo pela seta | `body` | o cartão que abriu (`button.ins-foco`) |
| ao entrar nos Ajustes (dedo e teclado) | o `h1` | o `h1` |
| ao sair dos Ajustes ("‹ Voltar" com o dedo; Esc com o teclado) | `body` | o ⚙ |
| a Evolução → "Ir para Semana" (o controle que abriu sumiu) | — | o título "Semana" |
| a sobra rolável do modo curto · com a área segura de 34 pt | **24 px · 58 px** | 0 · 0 |
| o cronômetro nos Ajustes (y, numa tela de 896) | 761,8–**844** | 813,8–896 |
| a faixa "Não guardado" (59 px), sob o centro da seta, da hora e do `···` do modo | a faixa | os três |
| … do "‹ Voltar" dos Ajustes, do ⚙ do Agora | a faixa | os dois |
| o campo de importar focado pelo Tab | focado, anel `none` | focado, anel `solid 3px` |
| do toque ao desenho novo (abre os Ajustes), mediana de 9 | Chromium 10,3 ms · WebKit 1 ms | Chromium 28 · WebKit 32 |
| do toque ao primeiro quadro depois dele | Chromium 25,1 · WebKit 16 | Chromium 41,8 · WebKit 38 |
| … abrindo o modo pela faixa (desenho / quadro) | Chromium 8,1 / 19,9 · WebKit 10 / 13 | Chromium 22,7 / 32,7 · WebKit 44 / 46 |

**O quadro a mais**, que o dono aceitou (pergunta 6): no Chromium, +13 a +18 ms
do toque ao desenho e ao primeiro quadro — um quadro, a foto da tela velha. No
WebKit desta máquina (sem placa de vídeo), +22 a +34 ms. Só nas trocas de
camada: registrar série, régua, teclado e descanso não passam por aqui.

**A forma**, nos dois motores (`troca.test.js`): ao entrar, uma animação só,
`ins-da-direita` em `::view-transition-new(root)`, 350 ms, `cubic-bezier(0.32,
0.72, 0, 1)`, de `translateX(100%)` a `none`; ao sair, `ins-para-direita` em
`::view-transition-old(root)`. Nenhuma outra foto anima — a de baixo, o
cronômetro, o aviso e a faixa parados (medido com o descanso contando e um aviso
na tela). A borda: 1 px, margem −1 px (estilo computado da foto, onde o motor o
dá). Largura rolável 414 em todo quadro, na chegada e na saída. A folha e o
painel: `ins-desce` (350 ms, curva da camada, `none` → `translateY(100%)`) e
`ins-apaga` (1 → 0), só as duas fotos; com duas folhas, só `folha-1` e `veu-1`.

**A folha que sobe, com o dedo pousando nela** (o item do coordenador). Os
quadros do COMPOSITOR do Chromium (`Page.startScreencast`, um por quadro), a
borda de cima da folha (o fio de acento que atravessa a tela) em cada um, 3
rodadas, o dedo descendo aos ~114 ms e soltando 200 ms depois (`recuo.mjs`, em
pixels do aparelho, ×2):

| | antes (a pausa da peça 4) | depois (a mira) |
|---|---|---|
| a borda, quadro a quadro, do toque em diante | 278 → 222, e **parada em 222 por ~200 ms**; ao soltar, um quadro **volta a 278** e só então segue (175, 136…) | 278 → 222 → 175 → 136 → 105 → 79 → … → 1 no pico (~362 ms), sem um quadro para trás; depois do pico, o quique (3 % de volta) |
| quadros que voltam antes do pico | 1 em 1 das 3 rodadas, 56 px (28 pt) | 0 em 3 |

A pausa recuava no SOLTAR nesta medida (a animação retomada do tempo da thread
principal, atrás do compositor); o revisor a viu no pousar. As duas saíram
juntas: nada pausa.

### Os testes, e como provei que reprovam

**`tests/fluxo/troca.test.js`** (motor, 10 casos; os tempos e a curva lidos dos
tokens; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit — os 10 verdes nos dois):

1. *o toque no meio de cada troca chega ao que está sob o dedo* — as quatro
   camadas, dedo e ponteiro (a tabela acima). Cobra também que havia foto se
   movendo quando o dedo desceu: sem isso o caso não provaria nada.
2. *a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de
   baixo parada, e o que é do aparelho não anda* — com o descanso contando e um
   aviso na tela, nos Ajustes e no modo (pela faixa): o sentido no `html`, uma
   foto só se movendo, o tempo, a curva, os quadros, o fio, e a largura rolável
   em todo quadro.
3. *a folha e o painel de apagar descem…* — já fora do DOM no primeiro quadro;
   só a caixa e o véu se movem; `ins-desce` e `ins-apaga` no tempo da saída; com
   duas folhas, só a de cima, pelo nome da posição.
4. *o Voltar do sistema faz o mesmo reverso; quando o navegador já animou…* —
   `history.back()` sai pela direita; um `popstate` com `hasUAVisualTransition`
   (a entrada do histórico descida uma profundidade, como o gesto faz) fecha no
   mesmo tique, sem pedir transição.
5. *a rolagem volta exata* — o Corpo pelo modo (a faixa) e o Agora pelos
   Ajustes, pela seta e pelo Voltar, ±1 px.
6. *o foco* — com o teclado (Enter no ⚙ e no cartão, Esc): entra no título,
   volta ao controle; com o dedo, o mesmo; a Evolução → "Ir para Semana": o
   título da tela que reaparece. Nunca o `body`.
7. *o modo curto não sobra, e o cronômetro no fundo nas telas cheias* — sobra 0
   sem descanso, com descanso e com a área segura de 34 pt; o cronômetro na
   borda nos Ajustes e na Evolução, e fora delas sobre a barra de abas, como
   antes.
8. *defeitos 4 e 7* — sob o centro da seta, da hora, do `···` (também rolado), do
   "‹ Voltar" e do ⚙ está o próprio controle, e a faixa continua à vista no
   topo; o Tab até o campo de importar: o rótulo com o anel de 3 px.
9. *sob "Reduzir movimento"* — a tela cheia e o modo nascem com `ins-esmaece` em
   `--ins-dur-dissolve`, só opacidade; saem no mesmo desenho; a tela que
   reaparece não esmaece; a folha sai de uma vez; nenhuma transição pedida.
10. *a primeira tela não anima, nem quando é o modo, e dois desenhos seguidos são
    uma troca só* — o app reaberto com treino em andamento abre no modo sem
    pedir troca; a Evolução → "Ir para Semana" é uma transição só, `sai`, e a
    Semana no topo.

**`tests/fluxo/navegacao.test.js`** (árvore, 2 casos novos): *sair do modo e dos
Ajustes rola DEPOIS de desenhar, e entrar num destino também* (em cada pedido de
rolagem, o que está no DOM) e *ao fechar um destino, o foco volta ao controle que
o abriu* (o ⚙; o modo entra com o foco no título; aberto por programa, a volta é
o título da aba).

**`tests/fluxo/sobe.test.js`**, o caso *o toque no meio da subida chega ao que o
dedo mirou, e a folha não para nem volta* (reescrito): o véu aos ~100 ms fecha;
com o dedo pousado 120 ms na folha que sobe, quadro a quadro, a chegada nunca
fica `paused`, o tempo dela só anda para a frente, e no trecho que sobe a caixa
só sobe; um clique só, no nó em que o dedo desceu; o × aos 220 ms fecha. Verde
nos dois motores.

**`tests/dominio/estilo.test.ts`**: o caso **(h)** (as fotos que se movem, como,
e quem tem nome; a de baixo parada; nada quica; sob `reduce` nenhuma foto; o
esmaecer só na chegada; a troca pedida num ponto só, o `render()`); **(b)** e
**(d)** ajustados (acima, na tabela de arquivos); a reserva do rodapé.

**Plantio** (`scratchpad/peca5/planta.mjs`: guarda as cópias limpas em
`scratchpad/peca5/limpo/`, aplica a violação, constrói quando o caso é de motor,
roda só os casos que a cobram, registra em `plantio.json` e devolve o arquivo num
`finally` — e também em SIGINT, SIGTERM, SIGHUP, exceção e saída; no fim,
confere cada arquivo contra a cópia limpa e reconstrói o `dist/`; `restaura.mjs`
devolve as cópias se tudo o mais falhar):

| # | a violação plantada | quem ficou vermelho | o arquivo voltou ao limpo |
|---|---|---|---|
| P1 | o render() desenha sempre seco (nenhuma transição) | o toque no meio de cada troca chega ao que está sob o dedo; a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda; a folha e o painel de apagar descem em 350 ms sem quique, o véu apaga junto, e a folha de baixo de duas fica; o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo; o foco; sob "Reduzir movimento"; a primeira tela não anima, nem quando é o modo, e dois desenhos seguidos (Evolução → "Ir para Semana") são uma troca só | sim |
| P2 | o toque no meio NÃO pula a transição | o toque no meio de cada troca chega ao que está sob o dedo · WebKit: o toque no meio de cada troca chega ao que está sob o dedo | sim |
| P3 | pula, mas não reenvia o clique que caiu na raiz | o toque no meio de cada troca chega ao que está sob o dedo · WebKit: o toque no meio de cada troca chega ao que está sob o dedo | sim |
| P4 | dois render() seguidos viram duas trocas (o desenho pendente não segura) | a primeira tela não anima, nem quando é o modo, e dois desenhos seguidos (Evolução → "Ir para Semana") são uma troca só | sim |
| P5 | o Voltar que o navegador já animou é animado de novo | o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo | sim |
| P6 | a primeira tela (o modo, na abertura com treino) anima | a primeira tela não anima, nem quando é o modo, e dois desenhos seguidos (Evolução → "Ir para Semana") são uma troca só | sim |
| P7 | fechaModoDeSessao rola ANTES de desenhar (o corte de antes) | sair do modo e dos Ajustes rola DEPOIS de desenhar, e entrar num destino também · a rolagem volta exata | sim |
| P8 | entrar num destino rola ao topo na hora, antes do desenho | sair do modo e dos Ajustes rola DEPOIS de desenhar, e entrar num destino também | sim |
| P9 | a rolagem pedida com o desenho pendente rola a foto velha | a rolagem volta exata | sim |
| P10 | ao fechar um destino, o foco não é devolvido | ao fechar um destino, o foco volta ao controle que o abriu — e não ao body · o foco | sim |
| P11 | o modo entra sem alvo de foco | ao fechar um destino, o foco volta ao controle que o abriu — e não ao body · o foco | sim |
| P12 | sem a chave do acionador, o foco vai sempre ao título | ao fechar um destino, o foco volta ao controle que o abriu — e não ao body · o foco | sim |
| P13 | o modo volta a 100svh, sem descontar o pé (a sobra de 24 px) | o modo com conteúdo curto não deixa sobra rolável, e o cronômetro fica no fundo da tela também nas telas cheias | sim |
| P14 | a reserva do rodapé só no modo (o cronômetro 52 px acima nas telas cheias) | no modo e na tela cheia, a reserva do rodapé perde a barra de abas mas guarda a área segura · o modo com conteúdo curto não deixa sobra rolável, e o cronômetro fica no fundo da tela também nas telas cheias | sim |
| P15 | a barra do modo volta a começar na barra de status (a faixa cobre a seta) | defeito 4 | sim |
| P16 | a faixa "Não guardado" não publica a altura | defeito 4 | sim |
| P17 | o campo de arquivo sem o anel no rótulo | defeito 4 | sim |
| P18 | a tela de baixo recua (a resposta 4 era "parada") | (h) a troca de camada move só as fotos · a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda | sim |
| P19 | a folha sai com o quique | (h) a troca de camada move só as fotos · a folha e o painel de apagar descem em 350 ms sem quique, o véu apaga junto, e a folha de baixo de duas fica | sim |
| P20 | a barra de abas ganha nome (anda separada do lugar) | (h) a troca de camada move só as fotos | sim |
| P21 | a folha se nomeia pelo nível, e não pela posição | (h) a troca de camada move só as fotos · a folha e o painel de apagar descem em 350 ms sem quique, o véu apaga junto, e a folha de baixo de duas fica | sim |
| P22 | uma foto anima fora do portão | (b) reduzir movimento falha fechado | sim |
| P23 | fora do portão as fotos ficam com a animação do navegador | (b) reduzir movimento falha fechado | sim |
| P24 | sob "Reduzir", a tela que reaparece também esmaece | (b) reduzir movimento falha fechado; (h) a troca de camada move só as fotos | sim |
| P25 | sob "Reduzir", sem o esmaecer da chegada | sob "Reduzir movimento" | sim |
| P26 | a borda da tela que chega sem o fio | (h) a troca de camada move só as fotos | sim |
| P27 | o .ins-modo anima transform (contém fixo) | (d) nada entre um fixo e a janela cria bloco de contenção | sim |
| P28 | a porta passa a esperar o fim da transição | (e) nada escuta o fim de uma animação | sim |
| P29 | a pausa volta: o dedo segura a camada que chega | o toque no meio da subida chega ao que o dedo mirou, e a folha não para nem volta · WebKit: o toque no meio da subida chega ao que o dedo mirou, e a folha não para nem volta | sim |
| P30 | sem a mira: o clique da camada que chega cai onde cair | o toque no meio da subida chega ao que o dedo mirou, e a folha não para nem volta · WebKit: o toque no meio da subida chega ao que o dedo mirou, e a folha não para nem volta | sim |
| P31 | a folha de baixo de duas também desce (sem o :only-child) | (h) a troca de camada move só as fotos · a folha e o painel de apagar descem em 350 ms sem quique, o véu apaga junto, e a folha de baixo de duas fica | sim |
| P32 | o popstate compara com o view pendente (a camada recém-aberta é fechada) | o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo · WebKit: o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo | sim |
| P33 | a porta espera a transição começar (`ready.then`) | (e) nada escuta o fim de uma animação | sim |
| P34 | a função que marca a rejeição passa a fazer alguma coisa | (e) nada escuta o fim de uma animação | sim |
| P35 | sem marcar a rejeição: o pulo antes de a transição andar vira erro de página | o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo | sim |
| V1 | controle: o clique que não vem é entregue em 350 ms (e não 300) | nenhum (verde, como devia) | sim |

Os 35 ficaram vermelhos; o controle V1, verde. Cada arquivo voltou à cópia limpa
(conferido por hash depois de cada passo e no fim), e o `dist/` foi reconstruído
do limpo nas duas rodadas. A primeira rodada (P1–P31 e V1) correu sobre o código
de antes das duas correções tardias (a corrida do histórico e a rejeição
marcada, decisões 20 e 21); a segunda (P32–P35 e V1 de novo), sobre o final, com
cópias limpas novas. O estado de cada passo está em `scratchpad/peca5/plantio.json`
(`plantando` → `plantado` → resultado, e `restaurado`).

**Contra o código e o build de antes.** A árvore de `5a6fced` (`git archive`, no
scratchpad, construída lá) com os arquivos de teste finais: ficam vermelhos os
16 casos novos ou reescritos — na guarda, (b) (as fotos sem `animation: none`
fora do portão), (h) e a reserva do rodapé; na árvore, os dois de
`navegacao.test.js` (o topo pedido sem o destino no DOM; o foco); no motor, o do
toque na subida (`paused` sob o dedo) e os 10 de `troca.test.js`, cada um pelo
defeito: nenhuma foto se move, a rolagem 1778 → 24, o foco no `body`, a sobra de
24 px, a faixa sobre os controles, nenhum esmaecer sob "Reduzir", nenhuma troca
pedida.

### O que ficou de fora, e por quê

- **Nada foi visto num iPhone de verdade.** Ficam pela leitura: o Core
  Animation do A13 movendo as fotos; o gesto de borda no app instalado e se o
  `popstate` dele chega com `hasUAVisualTransition` (o caso o prova com um evento
  sintético; se não chegar, a volta pelo gesto aparece duas vezes — a do sistema
  e a nossa —, e o conserto seria tratar o `popstate` de toque na borda como já
  animado, 02 T5); se o iOS entrega o clique de um toque que pulou a transição (o
  WebKit daqui entrega com o dedo; se não entregar, a porta o entrega 300 ms
  depois de soltar); `document.activeViewTransition` no iOS 18 (onde não houver,
  vale o relógio do token).
- **A troca de aba** continua seca: é a peça 6, que reaproveita `trocaDeCamada`
  (o sentido, a foto, o pulo e a mira) — a barra de abas ganha nome só nela.
- **Empilhar sobre o modo e entre telas cheias** (Programa → Histórico, a
  Evolução → comparar) usa a mesma regra (`entra`/`sai` pelo topo da pilha) e foi
  visto na exploração; o teste cobre os Ajustes, o modo e a Evolução. O foco ao
  voltar a uma tela cheia de baixo vai ao controle que abriu a de cima (o título
  dela foca primeiro, no layout, e o casco o troca); não há caso próprio.
- **A câmera** (`view.camera`, vídeo ao vivo): a foto da tela velha congela o
  quadro durante a saída, como a 02 T2 aceitou. Não medido (precisa de
  `getUserMedia`).
- **A folha aberta pelo gesto de borda** sai de lado pelo sistema (02 T5); o app
  não a anima de novo (`jaAnimado`).
- **O fundo do `body` atrás da tela cheia curta** (04 §2.5, "mostra o fundo do
  body") não era pedido e não mudou; sob "Reduzir", a tela cheia que esmaece
  parte desse fundo.
- **Os fluxos do revisor** (`_medicao/`) não foram tocados.

### Para o revisor

- **As durações que aparecem**: 350 (a tela cheia e o modo, chegando e saindo;
  a folha e o painel descendo; o véu apagando) e 120 (o esmaecer da chegada sob
  "Reduzir"). Nenhum quique em saída.
- **O quadro a mais** é esperado nos passos de troca de camada (01, 02, 04, 05,
  08, 16 e a descida do 06): no Chromium, o desenho novo ~+18 ms depois do antes
  (um quadro, a decisão 6). No WebKit desta máquina, até +36 ms (sem GPU).
- **O alvo de toque durante a troca é o `html`** — é a camada das fotos. Um
  `elementFromPoint` do robô no meio da troca dá `HTML`; o toque de verdade
  chega (o pulo). Os fixos (cronômetro, aviso, faixas) ficam parados aos 120 ms
  de propósito; a barra de abas fica com o lugar.
- **A "de baixo parada"** (princípio 8, a faixa da esquerda aos +50 ms): na
  chegada a foto velha não se move; na saída, a tela que reaparece já está na
  rolagem de antes, parada, e a de cima sai por cima dela.
- **A rolagem** dos fluxos 02 e 04 volta exata; o foco nunca fica no `body` ao
  entrar e sair do modo e das telas cheias.
- **O fluxo 15** (o × a ~115 ms): o toque agora vai ao nó em que o dedo desceu,
  sem pausa. Se a mira do robô ler o × um quadro antes e o dedo cair abaixo dele,
  o clique vai a esse nó (o conteúdo da folha), e a folha não fecha — chega ao
  que o dedo tocou. O `15b` (o véu num ponto fixo) fecha.
- **A folha que sobe sob o dedo não para mais** (era parada e voltava um quadro):
  quem gravava "a folha parada sob o dedo" como esperado deixa de ver isso.

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
src/main.jsx (7536:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-C1GjD3qP.css  107.41 kB │ gzip:  19.10 kB
dist/assets/index-D8nGJrXY.js   590.96 kB │ gzip: 184.78 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 806ms
(saída 0)
```

`npx vitest run`:

```
RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app


 Test Files  82 passed (82)
      Tests  1652 passed (1652)
   Start at  02:53:14
   Duration  57.83s (transform 2.96s, setup 0ms, import 31.67s, tests 498.35s, environment 10ms)

(saída 0)
```

Antes desta peça: 1639 de 1639 (peça 4). A diferença, +13, são os casos novos:
10 em `troca.test.js`, 2 em `navegacao.test.js` e a guarda (h) em
`estilo.test.ts` (60 casos ali, com os ajustes de (b), (d), (e) e da reserva
dentro dos que já existiam). O caso do toque na subida de `sobe.test.js` foi
reescrito, não somado. Os casos de motor no WebKit (`LASTRO_MOTOR=webkit`), um
arquivo por vez com a máquina menos carregada: `troca` 10/10, `sobe` 7/7,
`descanso` 5/5, `dedo` 9/9. Com os quatro arquivos ao mesmo tempo (carga 7,5) três
casos caíram por tempo de quadro e por esperas fixas; as esperas passaram a ser
pelo fim da troca (`document.activeViewTransition`) e pelo movimento da foto, e
foi isso que destapou a decisão 20.

---

## Peça 6 · A aba

Implementada em 20/10, sobre `1a54bf3`, sem commit. Espec: o pedido em
`_pedidos/peca-6.md`; `08-parecer.md` §3, §4 (peça 6) e §5.1; as respostas do dono
em `00-coordenacao.md` (16/10, 01h25) — pergunta 3 (**a página inteira desliza,
como um carrossel**, 350 ms na `--ins-curva`, o fio junto), 2 (sob "Reduzir" o
novo esmaece 120 ms e o velho sai de uma vez; o fio salta) e 6 (o quadro a mais);
`02-navegacao.md` §1, §2.0, T4 e §3.4; as seções das peças 0 a 5 deste documento;
a linha da peça 6 do `07-revisao-base.md` §1.4 (fluxos 07 e 14). E os quatro itens
que o coordenador mandou no meio, da conferência da peça 5 (07 §11): o segundo
quadro parado no começo de toda troca, o foco do "Ir para Semana" sob "Reduzir", o
cronômetro que podia saltar 52 px, e o foco do treino aberto no Programa.

O implementador caiu no limite de uso logo depois do primeiro build; retomado, a
exploração no Chromium seguiu de onde parou. O primeiro plantio foi interrompido
quando chegaram os quatro itens (eles mexem no mesmo código), com o `main.jsx` no
meio de um plantio: devolvido pela cópia limpa (`restaura.mjs`), conferido por
`cmp` arquivo a arquivo, e o `dist/` reconstruído do limpo. O plantio todo foi
refeito sobre o código final.

### Em uma página

- **O carrossel.** Trocar de aba desliza a página inteira: a velha sai pelo lado
  oposto e a nova entra pelo lado para onde se andou na barra, as duas juntas e
  encostadas, em 350 ms (`--ins-dur-entra`) na `--ins-curva`. O cabeçalho do Agora
  vai com a página. O fio anda junto, no mesmo tempo, na mesma curva e a partir do
  mesmo quadro (era 160 ms, sozinho). É a transição de vista da peça 5, pedida
  pelo mesmo `render()`, com o sentido do índice na barra.
- **O que não anda.** A barra de abas ganha foto própria só na troca de aba e fica
  parada, com o fio andando dentro dela; o cronômetro, o aviso e as faixas, também.
  Nos quadros do compositor, a faixa dos rótulos da barra não muda de um quadro
  para o outro enquanto as páginas passam, nos dois motores.
- **A rolagem.** Toda aba abre no topo, e o topo entra no desenho novo: a foto da
  aba que sai é tirada onde ela estava (o `scrollY` na hora da foto é o de antes
  do toque, e no fim é 0), nos dois motores.
- **O toque nunca espera.** A aba tocada no meio da troca vence — com o dedo e com
  o ponteiro, ida e volta, nos dois motores —, pelo pulo e pela mira da peça 5.
- **Nada mais largo que a janela.** Largura rolável 414 em todo quadro, nos dois
  sentidos, nos dois motores.
- **Sob "Reduzir movimento"**, nenhuma transição: o `<main>` que nasce com a aba (a
  chave dele é a aba) e o cabeçalho do Agora esmaecem 120 ms, a velha sai no mesmo
  desenho, o fio salta. A aba que não está na barra (`vaiPara('treino')`) troca
  seca, com e sem a preferência.
- **Os quatro itens do coordenador** (07 §11): (1) toda foto que anda — e o fio —
  começa um quadro adiante (`--ins-adianta`, −17 ms): no Chromium a troca passa a
  andar no máximo um quadro depois do desenho seco (era dois); no WebKit desta
  máquina o atraso é a foto da tela velha tirada em software, e não mudou. (3) O
  cronômetro e o aviso saltavam 52 px no primeiro quadro de uma troca que tira ou
  devolve a barra (visto, nos dois motores); agora mudam de altura junto com ela,
  na curva da camada. (2) e (4), um mecanismo só: o foco que um desenho tira da
  página vai ao título da tela — "Ir para Semana" sob "Reduzir" e o treino aberto
  no Programa, nos dois motores, com o teclado e com o dedo.
- **Um achado do motor, não do app.** O WebKit desta máquina volta um quadro no fim
  de transições de vista (no carrossel, em quase toda rodada) — também na troca de
  camada da peça 5 e numa página mínima sem o app; o Chromium, nunca. Registrado,
  não contornado.
- **O fio que voltava na suíte completa é da captura, não da tela** (a conferência
  do coordenador; decisão 17). Sob carga, o screencast ENTREGA quadros fora de
  ordem — o quadro de 87 ms antes do de 75 ms —, e lidos na ordem de chegada o fio
  parecia ir a 90 e voltar a 34. Na ordem do carimbo do compositor, o fio só anda
  para a frente: 0 voltas em 40 trocas com a suíte rodando junto (2 de 40 na
  ordem de chegada, as duas com o carimbo fora de ordem). Os casos que leem os
  quadros passaram a ordená-los pelo carimbo; um recuo de verdade (P25) e o quadro
  que volta no WebKit continuam aparecendo.
- **Testes.** 7 casos de motor novos (`aba.test.js`), 1 no `troca.test.js` e 3
  ajustados, 2 de árvore e a guarda (i); 25 violações plantadas, as 25 vermelhas, e
  o controle verde. `tipos` limpo, `build` ok, `vitest` 1663 de 1663 duas vezes
  seguidas (a segunda começando com carga 7,8); no WebKit, os cinco arquivos de
  motor verdes, um por vez.

### O que mudou, arquivo por arquivo

| arquivo | o que mudou |
|---|---|
| `src/main.jsx` | **A troca de aba no mesmo ponto da de camada**: `abaDesenhada` (a aba da tela desenhada, posta em `desenhaAgora`), e `sentidoDaTroca(antes, agora, abaAntes, abaAgora)` devolve também `aba-direita`/`aba-esquerda` pelo índice em `ABAS` (importada de `tabbar.jsx`, a lista que a barra desenha) e `seca` para a aba sem índice — só com o lugar à vista dos dois lados. A ordem: camada, depois aba, depois a folha que fecha. **O rodapé** (item 3): `rodapeDaTroca(antes, agora)` — `desce`/`sobe`/`null` — vai à porta no mesmo pedido. **O foco que o desenho perdeu** (itens 2 e 4): `desenhaAgora` guarda o nó focado antes de montar, e `naoPerdeOFoco` o manda ao título da tela desenhada quando ele saiu da página e o foco caiu no `body`. Comentários: o `render()`, o `vaiPara` (a ordem `render(); rola(0)` é a que põe o topo dentro do desenho novo). |
| `src/ui/movimento.js` | `trocaDeCamada(sentido, desenha, anima, rodape)`: os sentidos `aba-direita`, `aba-esquerda` e `seca` (desenha na hora, sem transição); `data-pe` no `html` quando a troca muda a reserva do rodapé. Comentário da troca de aba. |
| `src/ui/app.jsx` | `<main key={aba}>`: o `<main>` nasce com a aba (o nó que esmaece sob "Reduzir"). |
| `src/componentes.css` | O fio em `--ins-dur-entra` · `--ins-curva` · `--ins-adianta` (era `--ins-dur-lugar`). Bloco novo **"A TROCA DE ABA"**: o nome `barra-de-abas` só em `html[data-nav="aba-direita"]` e `[data-nav="aba-esquerda"] .ins-tabbar`; a foto velha dela sem nova sai de uma vez (`:only-child`); `html[data-nav="seca"] .ins-tab-ind { transition: none }`; no portão, as quatro fotos do carrossel (velha e nova, nos dois sentidos) em `--ins-dur-entra` · `--ins-curva` · `--ins-adianta`; sob "Reduzir", `main` e `.ag-cab` esmaecem em `--ins-dur-dissolve`. Na "TROCA DE CAMADA": `--ins-adianta` nas fotos que andam (a tela cheia que chega e a que sai, a folha e o painel que descem, os véus), e o rodapé — `html[data-pe="desce"\|"sobe"]` no par de imagens do `cronometro` (só com `#timer.on`) e do `aviso`. |
| `src/base.css` | Os quadros `ins-para-esquerda` e `ins-da-esquerda` (o carrossel, do outro lado) e `ins-rodape-desce`/`ins-rodape-sobe` (`translate` vertical de `--ins-barra-de-abas`). |
| `src/tokens.css` | `--ins-adianta: -17ms` (um quadro a 60 Hz; não é duração), `--ins-barra-de-abas: 52px` (e `--ins-tabbar` passa a somar ele à área segura, o mesmo valor). Os comentários de `--ins-curva` (o carrossel), `--ins-dur-lugar` (o fio saiu) e `--ins-dur-entra` (o carrossel e o fio). |
| `DESIGN.md` | Tokens (`--ins-curva`, `--ins-dur-entra`, `--ins-adianta`, `--ins-barra-de-abas`); a linha do fio (350 ms, junto, um quadro adiante); duas linhas novas — "A aba desliza (o carrossel)" e "O cronômetro e o aviso mudam de altura com a troca"; "O que fica sem movimento" (a barra na troca de aba, a aba sem índice); o toque no meio da aba; a troca num ponto só agora inclui a aba, o topo e o foco perdido; o quadro adiante; a guarda (h) e a nova (i). |
| `tests/fluxo/aba.test.js` (novo) | O motor (Chromium; `LASTRO_MOTOR=webkit` os mesmos no WebKit), 7 casos. |
| `tests/fluxo/troca.test.js` | Um caso novo (o cronômetro não salta, nos quadros do compositor); o caso da forma cobra o rodapé e o quadro adiante; a descida, o quadro adiante; esperas pelo fim da troca depois de trocar de aba (trocar de aba passou a ser transição). |
| `tests/fluxo/navegacao.test.js` | Dois casos de árvore: a ordem da rolagem na troca de aba; o foco que o desenho tira da página ("Ir para Semana" e o Programa). |
| `tests/dominio/estilo.test.ts` | Caso novo **(i)**; **(h)** conhece as fotos do carrossel, o nome da barra, o rodapé e o quadro adiante; **(b)** lê a chegada da aba pela foto (`html[data-nav="aba-…"] main`). |

### As decisões, com o porquê

1. **A aba passa pelo mesmo ponto da camada, medida contra a aba DESENHADA.** O
   `render()` já comparava as camadas desenhadas com as pedidas; agora compara
   também `abaDesenhada` com `view.aba`. Só conta como troca de aba com o lugar à
   vista dos dois lados (nenhum destino desenhado nem pedido): com uma tela cheia
   aberta a aba de baixo nem está montada, e o que andaria seria a tela cheia. A
   ordem é camada, aba, folha: "Ir para Semana" (fecha a Evolução e troca de aba no
   mesmo toque) continua UMA troca, `sai`, como a peça 5 mediu (02 T2); uma folha
   que fecha junto com uma troca de aba desce sozinha (a foto dela é `:only-child`
   em qualquer transição) enquanto o lugar anda por baixo.
2. **O sentido é o índice na barra.** `ABAS` vem de `tabbar.jsx` — a mesma lista
   que a barra desenha —, e andar para a direita (índice maior) é `aba-direita`: a
   velha sai pela esquerda, a nova chega da direita. A volta é tocar na outra aba,
   e o espelho sai do índice; aba não tem Voltar nem entrada no histórico.
3. **350 ms na `--ins-curva`, com os tokens que já existiam.** `--ins-dur-entra` nas
   duas fotos (as duas juntas: um token só, para nunca desencontrarem) e no fio, e
   a `--ins-curva`, como o pedido diz e o desenho que o dono escolheu tocava.
   Nenhum token de duração novo; mudaram os comentários: a `--ins-curva` dizia
   "NÃO para camada que cobre a tela" — continua certo, porque o carrossel não é
   camada, é andar de lado no chão —, e o fio saiu de `--ins-dur-lugar`.
4. **As duas fotos andam a tela inteira, encostadas, sem fio nem sombra.** Mesma
   distância, mesma curva, mesmo quadro de partida: a borda direita de uma toca a
   esquerda da outra em todo quadro. Não há o que ficar por cima, então nada de
   `z-index` nem do fio de 1 px da tela cheia (a guarda (i) cobra).
5. **A barra de abas tem foto própria só na troca de aba, e a velha fica embaixo
   da nova.** Sem nome ela andaria com a página; com nome nas trocas de camada,
   ficaria por cima da tela cheia que chega (peça 5, decisão 4). O nome vem de
   `html[data-nav="aba-…"]`, que a porta põe ANTES de o navegador fotografar. A
   foto nova é viva — o fio anda dentro dela, pela transição dele. A primeira
   versão escondia a foto velha (`opacity: 0`), como a 02 T4 sugeria; troquei por
   esconder só a velha SEM nova (`:only-child`, a regra do que é do aparelho), por
   uma medida: o `page.screenshot` do WebKit desta máquina não pinta a foto nova
   de elemento com nome (nem a barra, nem o cronômetro, o controle), e a barra
   sumia das capturas no meio da troca. Nos quadros do COMPOSITOR (o screencast),
   a nova pinta, nos dois motores, e cobre a velha, que é opaca
   (`--ins-superficie`): o que se vê é igual. Com a velha embaixo, se algum
   caminho de desenho não pintar a viva, a barra continua lá (com o fio parado),
   em vez de sumir.
6. **O fio: 350 ms, na mesma curva, no mesmo quadro.** Medido: a transição do fio
   começa no primeiro quadro em que as fotos andam, nos dois motores. Na troca
   seca ele salta (`html[data-nav="seca"] .ins-tab-ind { transition: none }`):
   uma regra fora do portão que só DESLIGA, de especificidade maior que a do
   portão.
7. **A rolagem já estava na ordem certa; a transição é que a põe dentro do
   desenho.** O `vaiPara` já fazia `render(); rola(0)`. Com o carrossel, o
   `render()` deixa o desenho pendente e `rola(0)` vira `rolagemPendente` (peça 5):
   o topo entra no desenho novo, e a foto da aba que sai é tirada onde ela estava.
   O caso de motor confere o `scrollY` na hora em que o navegador chama o desenho
   (logo depois de fotografar); o plantio P3 (`rola(0); render()`) o deixa
   vermelho. Comentário no `vaiPara` para ninguém inverter.
8. **Sob "Reduzir", o nó que nasce é o `<main>` — por isso ele ganhou a chave
   `aba`.** Sem a chave, o Preact reaproveitava o `<main>` e trocava só os filhos
   (medido na 02 §0), e um esmaecer em `main > *` pegaria também todo filho que
   nascesse DENTRO da aba por um toque (uma seção que aparece), enquanto o
   `data-nav` continuasse `aba-…` — movimento num passo que é "nenhum". Com a
   chave, o `<main>` nasce com a aba e só com ela; o cabeçalho do Agora nasce
   quando se chega ao Agora. A aba que reaparece quando uma tela cheia sai também
   nasce, mas com `data-nav="sai"`: não esmaece (ela já estava lá). Plantado sem a
   chave (P8): o `<main>` não nasce, e o caso de "Reduzir" e a guarda (i) reprovam.
9. **A aba sem índice troca seca, e deixa no `html` um sentido que nada lê.**
   `vaiPara('treino')` (risco 10 do mapa) pede uma aba que não existe: não há para
   que lado andar. `seca` não pede transição (a porta) e não casa nenhuma regra de
   esmaecer — senão o `<main>` novo esmaeceria com o `data-nav="aba-…"` que sobrou
   da troca anterior —, e o fio salta. O que `vaiPara('treino')` faz na tela (o
   Agora sem cabeçalho e nenhuma aba acesa) é de antes e não é movimento: não mexi.
10. **O toque no meio da troca é o da peça 5, sem nada novo.** A barra está parada
    e o pulo com a mira (`aoDescer`, `arma`, `aoClicar`) leva o clique à aba que
    está sob o dedo; a troca nova parte da tela que o pulo desenhou. Plantado sem o
    pulo (P12): vermelho nos dois motores.
11. **Item 1 do coordenador — um quadro adiante: um atraso negativo de um quadro,
    com token próprio.** O revisor viu (07 §11.2) que toda troca anda DOIS quadros
    depois do antes: o primeiro é a foto da tela velha (o aceito), o segundo é o
    tempo 0 da animação, em que a tela que chega ainda está inteira fora da borda
    (e a que sai, inteira no lugar) — um quadro igual ao anterior. Das duas formas
    que ele sugeriu, escolhi o atraso: `--ins-adianta: -17ms`, nos tokens, com o
    porquê escrito, como terceiro tempo da declaração (`animation: ins-da-direita
    var(--ins-dur-entra) var(--ins-curva-camada) var(--ins-adianta) both`). O
    caminho continua o mesmo, da borda até o lugar — só o primeiro quadro desenhado
    já é o de um quadro adentro —, e a duração continua a do token (a guarda (a) e
    a lista de durações do revisor leem a duração, não o atraso). O quadro-chave
    "um passo para dentro" mudaria a forma que o dono viu, e um passo pequeno
    demais (1 px) passaria na régua sem a tela andar de verdade. Vale para TODA
    foto que anda — a tela cheia e o modo que chegam e saem, a folha e o painel que
    descem, os véus, o carrossel, o rodapé — e para o fio, que senão ficaria um
    quadro atrás das páginas. NÃO vale para o que nasce por CSS (a folha e o painel
    que sobem, o cronômetro): não há foto antes, e a régua já aceita o quadro
    deles. Um quadro a 60 Hz porque é o do iPhone 11 Pro Max; a guarda (h) cobra o
    valor entre −16 e −17 ms e que só as fotos e o fio o usam.
12. **Item 3 — o cronômetro saltava, e agora muda de altura com a troca.** Visto,
    não deduzido: com um descanso contando, ao abrir os Ajustes a barra azul do
    descanso ia de y 814 a 866 de um quadro para o outro, no primeiro quadro da
    troca, e voltava de uma vez ao fechar — nos dois motores; o aviso também
    (705 → 757). É o grupo da foto deles, que vai direto ao lugar novo (o de
    todos os grupos é `animation: none`, peça 5). A forma: o par de imagens
    (`::view-transition-image-pair`) do `cronometro` e do `aviso` parte do lugar
    velho e chega ao novo em `translate` vertical da altura da barra
    (`--ins-barra-de-abas`, um token novo, que `--ins-tabbar` passou a somar à área
    segura: o mesmo valor), no tempo e na curva da camada, um quadro adiante.
    Continuam do aparelho: não andam de lado com as páginas, só mudam de altura
    junto com a troca, que mudou a reserva do rodapé. Quando: o `render()` sabe se
    a troca tira a barra (chega uma tela cheia ou o modo) ou a devolve, e manda à
    porta, que põe `data-pe="desce"|"sobe"` no `html` (ou o tira). Só o cronômetro
    EM CENA (`:has(#timer.on)`): fora de cena ele continua desenhado, abaixo da
    borda e invisível, e tem foto — a primeira versão o movia mesmo assim, e o caso
    do Voltar do `troca.test.js` pegou uma animação a mais. A faixa da sessão não
    precisa: ela nunca está nas duas telas da troca.
13. **Itens 2 e 4 — o foco que um desenho tira da página, um mecanismo só.** Sob
    "Reduzir", "Ir para Semana" são dois desenhos: o primeiro fecha a Evolução e
    `devolveOFoco` põe o foco no "Evolução" do Corpo; o segundo troca de aba, e
    esse botão sai da página — o foco caía no `body`. Abrir um treino da lista do
    Programa é o mesmo: o conteúdo troca dentro da mesma tela cheia e o botão
    tocado sai. Nenhum dos dois é troca de camada, e por isso `devolveOFoco` não
    age. `naoPerdeOFoco`, depois de cada desenho: se o nó que tinha o foco antes de
    montar saiu da página e o foco caiu no `body`, ele vai ao título da tela
    desenhada (`#app h1[tabindex]`, o lugar declarado de `devolveOFoco`); com uma
    folha, o pare ou o aviso por cima, eles ficam com o foco deles. É o mesmo
    mecanismo dos dois itens, e por isso consertei o 4 junto. O alcance é estreito
    de propósito: só age quando havia um nó focado — o teclado, o Chromium que foca
    o botão tocado, ou o foco que `devolveOFoco` pôs. No Safari, que não foca botão
    no toque, o `body` já era o foco antes do toque, e nada muda.
14. **O WebKit desta máquina volta um quadro no fim das transições de vista — e não
    é do app.** Achado nos quadros do compositor: no último quadro da troca, a
    tela inteira volta, por um quadro, a um estado do meio dela (no carrossel, o
    fio em x ≈ 90 depois de ter chegado a 0; a página pela metade), e então assenta.
    Em 3 de 3 rodadas do carrossel (5 das 6 trocas; e em 8 de 9 rodadas no
    `mede.mjs`), e também na troca de camada
    da peça 5 — no build de `1a54bf3`, antes de qualquer mudança minha (2 de 3
    rodadas abrindo os Ajustes) — e numa página mínima, sem nada do app, com a
    mesma transição de 350 ms (1 de 6 rodadas sem nome, 2 de 6 com uma barra
    nomeada). No Chromium, nunca (0 de 6, e 0 nos quadros do app). É o WebKit sem
    placa de vídeo; não contornei no app um defeito que pode não existir no iPhone.
    No `aba.test.js`, "nenhum quadro volta" é cobrado no Chromium (07 §1.3:
    "nada pisca" se confere no Blink); no WebKit o quadro isolado que volta é
    contado (no `console`) e fica fora da conta do fio.
15. **Os casos da peça 5 que trocam de aba passaram a esperar a troca.** Trocar de
    aba era seco; agora é uma transição de 350 ms, e um `scrollTo` do teste no meio
    dela rolaria a página que ainda vai ser trocada. Cinco esperas no
    `troca.test.js` (`assenta` depois do `vaiPara`), sem mudar o que eles cobram.
16. **Nada largo, nada que pisca.** As fotos moram numa camada à parte e não somam
    à largura rolável (a 02 §3.4 e a peça 5 já tinham medido): 414 em todo quadro,
    nos dois sentidos, nos dois motores. O plantio P17 mostra que a conferência é
    real: a página DE VERDADE deslizando (sem transição de vista) com o `clip` do
    `body` tirado faz a largura passar da janela, e o caso reprova nisso.
17. **O fio que voltava um quadro na suíte completa: artefato da captura, provado
    nos quadros.** O coordenador viu, na suíte inteira (carga 4–8), 2 de 2 vezes, o
    caso da barra reprovar com o fio "90 34 110 136 …" — para a frente e para trás
    num quadro, antes de andar. A suspeita era o fio vivo com o `--ins-adianta`
    andar um quadro antes da foto da barra assumir. Investiguei com a máquina
    carregada (`scratchpad/peca6/carga.mjs`: 12 laços ocupados de CPU, ou a suíte
    inteira rodando junto), lendo em cada quadro do compositor o lugar do fio, a
    borda da página e o CARIMBO (a hora em que o compositor fez o quadro), e na
    página o `currentTime` do fio e das fotos a cada quadro:
    - com 12 laços ocupados (carga 8,5): 0 voltas em 16 trocas;
    - com a suíte rodando junto: **2 voltas em 40 trocas na ordem de chegada — e
      as duas com o carimbo fora de ordem.** Na rodada 10 chegaram, nesta ordem,
      os quadros de 55,1 ms (fio em 34), **87,1 ms (fio em 90)** e **75,2 ms (fio
      em 64)**; na rodada 0, os de 307,8 ms (164) e 298,1 ms (160). Na ordem do
      carimbo, o fio só anda para a frente: **0 voltas em 40**. A sequência do
      coordenador (90 antes de 34) é a mesma coisa;
    - a suspeita não se confirma: o registro da página mostra, em todo quadro, a
      transição do fio e as fotos com o MESMO `currentTime` (por exemplo, "73 ms:
      fio 17 / fotos 17,17"); o fio nunca anda à frente delas.
    É o screencast do Chromium entregando quadros fora de ordem quando a máquina
    está ocupada; a tela não voltou. Conserto no teste, não no app: os dois casos
    que leem os quadros do compositor (`aba.test.js`, a barra e o fio; o
    `troca.test.js`, o cronômetro) os ordenam pelo carimbo antes de qualquer conta.
    Isso não esconde um quadro que volta de verdade: (a) o P25 (o fio com uma curva
    que passa da aba e volta) reprova nos dois motores com os quadros já
    ordenados ("84 150 192 212 220 220 216 210 …" no Chromium); (b) o quadro que
    volta no fim da transição no WebKit (decisão 14) chega com o carimbo em ordem e
    continua aparecendo — 7 de 8 trocas, igual nas duas ordens, 0 carimbos fora de
    ordem. Depois do conserto: a suíte completa duas vezes seguidas, 1663 de 1663
    (a segunda começando com carga 7,8); `aba` e `troca` três vezes com 12 laços
    ocupados (carga até 15), 18 de 18 nas três; no WebKit, 7/7 e 11/11.

### Os números, antes e depois

Chromium 1234 e WebKit 26.5 (Playwright), 414 × 896 a ×2, o registro semeado com
quatro semanas de treino e de peso, cada aba aquecida antes (a primeira pintura de
uma aba no WebKit desta máquina prende a thread). O antes é o build de `1a54bf3`
(a peça 5, `index-D8nGJrXY.js`, guardado no scratchpad antes da primeira mudança);
o depois, o final (`index-B3-7Hevd.js`), servido na 4729. Scripts em
`scratchpad/peca6/` (`mede.mjs`, `anda.mjs`, `cronometro.mjs`, `minima.mjs`,
`quadros.mjs`). Nenhum erro de página.

**A troca de aba** (o fluxo 07: Agora → Corpo → Semana → Agora; 3 rodadas de cada,
nos quadros do compositor):

| medida | antes | depois |
|---|---|---|
| quadros em que a página muda | Chromium 1 · WebKit 1 (a troca seca) | Chromium 21 · WebKit 21–25 |
| a barra de abas nesses quadros (diferença média por canal contra o último, na faixa dos rótulos) | 0,05–0,06 (o ruído do JPEG) | Chromium 0,05–0,06 · WebKit 0,03–0,06: parada |
| o fio | 160 ms, `cubic-bezier(.2,.8,.2,1)`, sozinho; 9–15 posições | 350 ms, a mesma curva, a partir do quadro em que as páginas andam, −17 ms; 14–22 posições |
| a largura rolável, em todo quadro | 414 | 414, nos dois sentidos e nos dois motores |
| quadros que voltam (um quadro diferente dos dois vizinhos, iguais entre si) | 0 | Chromium 0 em 9 rodadas · WebKit 1 em 8 de 9 (o motor: decisão 14) |
| do toque ao desenho novo · ao primeiro quadro depois dele (mediana de 6) | Chromium 5,2 · 16,8 ms; WebKit 12 · 29 | Chromium 7,8 · 17,3; WebKit 43 · 49 |
| a aba tocada no meio (o fluxo 14: Corpo e, ~132 ms depois, Semana), 5 com o dedo e 5 com o ponteiro | 10/10 na Semana, sem nada andando | 10/10 na Semana, com as fotos andando no segundo toque, nos dois motores |
| sob "Reduzir" | o `<main>` reaproveitado, nada anima, o fio salta | o `<main>` nasce com `ins-esmaece` 120 ms (só opacidade), o cabeçalho do Agora também; a velha sai no mesmo desenho; o fio salta; nenhuma transição pedida |

**A forma**, nos dois motores (`aba.test.js`): andando para a direita,
`ins-para-esquerda` no `::view-transition-old(root)` e `ins-da-direita` no
`-new(root)`; para a esquerda, `ins-para-direita` e `ins-da-esquerda`; 350 ms,
`cubic-bezier(0.2, 0.8, 0.2, 1)`, atraso −17 ms, as duas com o mesmo
`currentTime`; a transição do fio em `transform`, 350 ms, a mesma curva, no
mesmo quadro (ou no seguinte); a barra com `view-transition-name: barra-de-abas`
durante a troca e `none` fora dela.

**A rolagem**: com a aba de onde se sai rolada até o fim (Corpo, Semana, Agora), o
`scrollY` na hora em que o navegador chama o desenho — logo depois de fotografar —
é o de antes do toque, e a aba na tela ainda é a velha; no fim, 0, nos dois motores.

**Item 1, quando a troca anda** (a régua do revisor, `andaMs`: o primeiro quadro em
que a mudança, contra o quadro de antes do toque, encosta na borda direita e tem a
altura da tela; para a aba, o primeiro quadro que muda, porque a troca seca não
chega à borda). Mediana de 5, os três lados intercalados; "seco" é o build novo
sem `startViewTransition` (o desenho na hora: o caminho de antes da peça 5). Duas
rodadas no Chromium (carga 0,6 e 3,7) e duas no WebKit:

| troca | seco | peça 5 | depois |
|---|---|---|---|
| abre os Ajustes, Chromium | 17,1 · 12 ms | 46,6 · 41,7 | **30,3 · 27,5** |
| fecha os Ajustes, Chromium | 9,8 · 10,4 | 29,8 · 37,2 | **17,9 · 14,7** |
| aba Agora → Corpo, Chromium | 17,1 · 14,6 | (seca) | **25,9 · 27,6** |
| aba Corpo → Agora, Chromium | 9,1 · 8,2 | (seca) | **18,6 · 18** |
| abre os Ajustes, WebKit | 34,3 · 45 | 94,9 · 110,8 | 113,8 · 121,9 |
| fecha os Ajustes, WebKit | 21,2 · 23,8 | 86,9 · 100 | 86,9 · 89,7 |
| aba Agora → Corpo · Corpo → Agora, WebKit | 35,2 · 47,9 / 21,6 · 20,5 | (seca) | 136,4 · 113 / 85,5 · 95,7 |

No Chromium a troca passou a andar **no máximo um quadro depois do seco** (+4 a
+16 ms; na peça 5, +20 a +30): o alvo. No WebKit desta máquina, não mudou: os
quadros entre o toque e o primeiro movimento mostram a página velha intacta (só o
ponto ao vivo pulsando, a caixa de 8 × 4 px dele), por 60 a 100 ms — é a foto da
tela velha sendo tirada em software, e não o tempo 0 parado. Fica a conferir no
aparelho, como o revisor já deixou (07 §11.2).

**Item 3, o cronômetro** (a barra azul do descanso, numa coluna, em cada quadro do
compositor; o descanso contando, o Agora → os Ajustes → o Agora):

| | antes (peça 5) | depois |
|---|---|---|
| abre os Ajustes, Chromium | 814 814 814 **866** 866 … (um quadro) | 814 814 814 820 828 836 846 854 858 860 862 864 865 866 (14 quadros) |
| fecha os Ajustes, Chromium | 866 866 866 **814** 814 … | 866 866 866 860 852 844 834 826 822 820 818 816 815 814 |
| abre, WebKit | 814 **866** 866 … | 814 833 839 848 852 856 858 860 861 862 863 864 865 866 |
| fecha, WebKit | 866 866 **814** … | 866 838 829 826 823 821 819 818 817 816 815 814 |

O aviso (`#toast`, 705 → 757 no DOM) vai junto, pela mesma regra. Sem o descanso
na tela, nada se move no rodapé (o cronômetro fora de cena não ganha animação).

**Itens 2 e 4, o foco** (`aba.test.js`, com e sem "Reduzir", com o teclado e com o
dedo, nos dois motores): "Ir para Semana" deixa o foco no título "Semana" nas oito
combinações (antes, `body` sob "Reduzir"); o treino aberto na lista do Programa,
no título da tela cheia (antes, `body`).

**O quadro que volta, no WebKit** (decisão 14), com o detector de "quadro
diferente dos dois vizinhos, iguais entre si": o carrossel, 5 de 6 trocas em 3
rodadas (e 8 de 9 rodadas no `mede.mjs`); a troca de camada no build de `1a54bf3`, 2 de 3 abrindo os Ajustes; a
página mínima sem o app, 1 de 6 sem nome e 2 de 6 com uma barra nomeada. No
Chromium, 0 em todos.

### Os testes, e como provei que reprovam

**`tests/fluxo/aba.test.js`** (novo; motor, 7 casos; os tempos e as curvas lidos dos
tokens; `LASTRO_MOTOR=webkit` roda os mesmos no WebKit — os 7 verdes nos dois):

1. *trocar de aba desliza a página inteira no sentido do índice, em 350 ms na
   curva do lugar, e o fio anda junto* — com a sessão aberta (a faixa), um descanso
   e um aviso na tela, cinco trocas (três para a direita, duas para a esquerda),
   quadro a quadro: largura rolável igual à janela em todo quadro; pelo menos 3
   quadros com a troca viva; o sentido no `html`; exatamente as duas fotos da
   página, com os quadros de borda a borda de cada sentido, o tempo, a curva e o
   quadro adiante; as duas com o mesmo `currentTime`; a transição do fio em
   `transform`, no tempo, na curva e com o atraso delas, a partir do mesmo quadro
   (ou do seguinte); a barra com o nome dela; a aba acesa e o fio no lugar no fim. E,
   numa troca de camada, a barra SEM nome.
2. *a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela
   mostrou* — os quadros do compositor (`page.screencast`), na ordem do carimbo
   (decisão 17), decodificados: a página
   anda em pelo menos 3; a faixa dos rótulos da barra é a do fim em todos eles; o
   fio só anda para o lado da aba nova, em pelo menos 3 posições, e chega a ela. No
   Chromium, nenhum quadro volta.
3. *toda aba abre no topo, e o topo entra no desenho novo* — três trocas, cada uma
   com a aba de onde se sai rolada até o fim: o `scrollY` e a aba na tela na hora da
   foto, e o topo no fim.
4. *a aba tocada no meio da troca vence* — o dedo e o ponteiro, três pares (ida e
   volta), o segundo toque com as fotos já ~110 ms andadas: acaba na aba do segundo
   toque, acesa, com o fio nela; o caso cobra que havia foto andando.
5. *sob "Reduzir movimento"* — nenhuma transição pedida; o `<main>` nasce e só
   esmaece, em `--ins-dur-dissolve`; o velho sai no mesmo desenho; o cabeçalho do
   Agora esmaece; o fio salta e já está no lugar; um desenho dentro da aba não
   esmaece de novo; a aba que reaparece quando uma tela cheia sai não esmaece.
6. *a aba que não está na barra troca seca* — com e sem "Reduzir": `vaiPara('treino')`
   e a volta dela, sem transição, sem esmaecer, o fio sem animação.
7. *o foco não cai no body quando um desenho tira da página o controle* (itens 2 e
   4) — com e sem "Reduzir", com o teclado e com o dedo: "Ir para Semana" acaba no
   título "Semana"; o treino aberto no Programa não deixa o foco no `body`.

**`tests/fluxo/troca.test.js`**: um caso novo, *o cronômetro não salta quando a
troca tira ou devolve a barra de abas* (item 3) — os quadros do compositor (na
ordem do carimbo), a barra
azul do descanso ao abrir e ao fechar os Ajustes: muda 52 px no DOM, passa pelo meio
do caminho em pelo menos 2 quadros e só para o lado do lugar novo; no Chromium, sem
passo de 40 px e sem quadro que volta (no WebKit o primeiro quadro animado pode
chegar tarde sob carga, e o fim volta um quadro, decisão 14); a captura vazia se
repete até 3 vezes, o salto visto reprova na hora. O caso da forma (o 2) passou a
cobrar que o cronômetro e o aviso só mudam de altura, no tempo e na curva da
camada, e que toda foto que anda começa um quadro adiante; o da descida (o 3), o
quadro adiante da folha e do véu. Cinco esperas pelo fim da troca depois de trocar
de aba (decisão 15).

**`tests/fluxo/navegacao.test.js`** (árvore, 2 casos): *trocar de aba rola ao topo
DEPOIS de desenhar a aba nova* (em cada pedido de rolagem, a aba acesa já é a nova)
e *o foco que um desenho tira da página vai ao título da tela* ("Ir para Semana",
que no jsdom — sem transição — são os mesmos dois desenhos de "Reduzir"; e o treino
aberto no Programa).

**`tests/dominio/estilo.test.ts`**: o caso **(i)** (as quatro fotos do carrossel,
nos dois sentidos, com os quadros de borda a borda, `--ins-dur-entra`,
`--ins-curva` e sem `border-left`, `z-index`, `margin-left` nem `box-shadow`; o fio;
a troca seca; o nome da barra só na troca de aba e fora do portão; a foto velha sem
nova; nenhuma foto da barra se move; o esmaecer sob "Reduzir"; a chave do `<main>`;
o índice, o `seca` e a aba desenhada no `main.jsx`; o `seca` na porta; e o
`render(); rola(0)` do `vaiPara`). **(h)**: as fotos do carrossel e do rodapé na
lista do que anda, o nome da barra na lista dos nomes, o esmaecer da aba na lista
de "Reduzir", o rodapé (só na vertical, da altura da barra, no tempo e na curva da
camada), o casco e a porta dizendo `data-pe`, e o quadro adiante (toda foto que
anda o tem; só as fotos e o fio o usam; o valor é um quadro a 60 Hz). **(b)**: a
chegada da aba lida pela foto (`html[data-nav="aba-…"] main`).

**Plantio** (`scratchpad/peca6/planta.mjs`, como o da peça 5: guarda cópias limpas
em `limpo/`, aplica a violação, constrói quando o caso é de motor, roda só os
casos que a cobram — cada arquivo de motor sozinho —, registra em `plantio.json` e
devolve o arquivo num `finally`, e também em SIGINT, SIGTERM, SIGHUP, exceção e
saída; no fim confere cada arquivo contra a cópia limpa por hash e reconstrói o
`dist/`; `restaura.mjs` devolve as cópias se tudo o mais falhar):

| # | a violação plantada | quem ficou vermelho | o arquivo voltou ao limpo |
|---|---|---|---|
| P1 | o render() não vê a troca de aba: troca seca, como antes | trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto (Chromium e WebKit) · a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou (Chromium e WebKit) · toda aba abre no topo, e o topo entra no desenho novo: a foto da aba que sai fica onde estava (Chromium e WebKit) · a aba tocada no meio da troca vence: o dedo acerta a aba que vê (o fluxo 14) (Chromium e WebKit) · sob "Reduzir movimento": nenhuma transição de vista; o conteúdo novo esmaece 120 ms, o velho sai de uma vez, e o fio salta (Chromium e WebKit) · a aba que não está na barra (vaiPara("treino")) troca seca: sem transição, sem esmaecer, e o fio salta (Chromium e WebKit) | sim |
| P2 | o sentido ao contrário do índice | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto · sob "Reduzir movimento": nenhuma transição de vista; o conteúdo novo esmaece 120 ms, o velho sai de uma vez, e o fio salta | sim |
| P3 | vaiPara rola ao topo ANTES de pedir a troca (a foto da que sai pula para o topo) | trocar de aba rola ao topo DEPOIS de desenhar a aba nova · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · toda aba abre no topo, e o topo entra no desenho novo: a foto da aba que sai fica onde estava (Chromium e WebKit) | sim |
| P4 | a barra de abas sem nome: anda com a página | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto (Chromium e WebKit) · a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou (Chromium e WebKit) | sim |
| P5 | o fio fica em --ins-dur-lugar (160 ms), sozinho | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto | sim |
| P6 | o carrossel na curva da camada, e não na --ins-curva | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto | sim |
| P7 | só a nova anda (camada por cima, e não carrossel): a velha parada | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto | sim |
| P8 | o `<main>` sem a chave da aba: o nó não nasce | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · sob "Reduzir movimento": nenhuma transição de vista; o conteúdo novo esmaece 120 ms, o velho sai de uma vez, e o fio salta | sim |
| P9 | sob "Reduzir", a página nova não esmaece | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · sob "Reduzir movimento": nenhuma transição de vista; o conteúdo novo esmaece 120 ms, o velho sai de uma vez, e o fio salta | sim |
| P10 | a porta pede transição também para a troca seca | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · a aba que não está na barra (vaiPara("treino")) troca seca: sem transição, sem esmaecer, e o fio salta | sim |
| P11 | na troca seca o fio anda | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · a aba que não está na barra (vaiPara("treino")) troca seca: sem transição, sem esmaecer, e o fio salta | sim |
| P12 | o toque no meio NÃO pula a transição | a aba tocada no meio da troca vence: o dedo acerta a aba que vê (o fluxo 14) (Chromium e WebKit) | sim |
| P13 | a foto velha da barra sempre escondida (some se a nova não pintar) | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam | sim |
| P14 | a foto da barra anda (com a página) | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto · a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou | sim |
| P15 | sob "Reduzir", a página nova DESLIZA (só que no tempo do esmaecer) | (b) reduzir movimento falha fechado: todo movimento mora no portão por adesão, e fora dele o elemento está no último quadro · (c) só transform, translate, scale e opacity se movem · (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam | sim |
| P16 | o carrossel vira camada: a nova com o fio e por cima | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam | sim |
| P17 | a página REAL desliza (sem transição de vista) e o body perde o clip: a armadilha do translateX(+) | nenhum ancestral do sticky vira scroll container · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto · a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou · toda aba abre no topo, e o topo entra no desenho novo: a foto da aba que sai fica onde estava · a aba tocada no meio da troca vence: o dedo acerta a aba que vê (o fluxo 14) | sim |
| P18 | a tela cheia chega sem o quadro adiante (o tempo 0 parado: dois quadros a mais) | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda | sim |
| P19 | o fio sem o quadro adiante (um quadro atrás das páginas) | (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto | sim |
| P20 | o cronômetro e o aviso não mudam de altura com a troca (o salto de 52 px) | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda (Chromium e WebKit) · o cronômetro não salta quando a troca tira ou devolve a barra de abas: muda de altura junto com ela, nos quadros que a tela mostrou (Chromium e WebKit) | sim |
| P21 | o casco não diz à porta que o rodapé mudou | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · a tela cheia e o modo chegam da direita e saem pela direita em 350 ms, a de baixo parada, e o que é do aparelho não anda · o cronômetro não salta quando a troca tira ou devolve a barra de abas: muda de altura junto com ela, nos quadros que a tela mostrou | sim |
| P22 | o cronômetro FORA de cena também anda (movimento que ninguém vê) | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda · o Voltar do sistema faz o mesmo reverso; quando o navegador já animou a volta, o app não anima de novo | sim |
| P23 | o quadro adiante também na chegada da folha por CSS (que não tem a foto antes) | (h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda | sim |
| P24 | o foco que o desenho tira da página fica no body ("Ir para Semana" sob "Reduzir", o treino no Programa) | o foco que um desenho tira da página vai ao título da tela: "Ir para Semana" e o treino aberto no Programa · o foco não cai no body quando um desenho tira da página o controle: "Ir para Semana" (com e sem "Reduzir") e o treino aberto no Programa (Chromium e WebKit) | sim |
| P25 | o fio passa da aba e VOLTA (um recuo de verdade, nos quadros na ordem do carimbo) | (a) duração e curva só nascem nos tokens, e ultrapassagem só no quique · (i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam · trocar de aba desliza a página inteira no sentido do índice, em 350 ms na curva do lugar, e o fio anda junto (Chromium e WebKit) · a barra de abas fica parada e o fio anda dentro dela, nos quadros que a tela mostrou (Chromium e WebKit) | sim |
| V1 | controle: o esmaecer sob "Reduzir" na curva da camada (permitido) | nenhum (verde, como devia) | sim |

Os 25 ficaram vermelhos; o controle V1, verde; em todos os passos os arquivos voltaram ao limpo
(conferido por hash depois de cada passo e no fim, e por `cmp` contra as cópias), e
o `dist/` foi reconstruído do limpo. Três notas:

- **A primeira rodada foi interrompida** quando chegaram os itens do coordenador
  (eles mudam os mesmos trechos). O `SIGTERM` não chegou ao tratador — o processo
  estava preso no `spawnSync` do vitest —, e eu o encerrei à força com o `main.jsx`
  no meio do P1. Devolvi pelo `restaura.mjs`, conferi os seis arquivos por `cmp`
  contra as cópias limpas e reconstruí o `dist/` antes de seguir. Essa rodada não
  conta; a tabela é a da rodada sobre o código final.
- **O P12** (sem o pulo), na rodada com carga ~5, reprovou também o caso 1 do
  `aba.test.js`, que não toca na tela. Repetido com carga 1,5, só o caso do toque no
  meio reprova (nos dois motores); o caso 1 no limpo passa 3 de 3. A tabela mostra
  a repetição. **O P17** reprova o carrossel exatamente em "nenhum quadro mais
  largo que a janela" (a conferência da largura é real), e a guarda do `sticky`,
  pelo `clip` do `body`.
- **O P20** foi repetido depois do último ajuste do caso do cronômetro (a forma por
  motor): reprova nos dois motores — no Chromium, "nenhum salto" (814 814 814 814
  866 …); no WebKit, "passa pelo meio do caminho".
- **O P25** entrou com a decisão 17, depois de os casos do compositor passarem a
  ordenar os quadros pelo carimbo: prova que a ordenação não esconde um recuo de
  verdade.

Na exploração, além dos testes: os quadros do compositor nos dois motores
(`quadros.mjs`), a captura no meio com as animações pausadas (`explora.mjs`), as
variações da barra no WebKit (`barra-wk.mjs`, decisão 5) e a página mínima
(`minima.mjs`, decisão 14).

### O que ficou de fora, e por quê

- **Nada foi visto num iPhone de verdade.** Ficam pela leitura: o Core Animation
  do A13 movendo as duas fotos inteiras e a barra viva por cima; se o iOS pinta a
  foto viva da barra (aqui, os quadros do compositor do WebKit pintam; o
  `page.screenshot` não); se o quadro que volta no fim da transição (decisão 14)
  existe lá; o atraso do toque à troca em milissegundos (item 1, abaixo).
- **O item 1 no WebKit desta máquina.** No Chromium o alvo foi cumprido (a troca
  anda no máximo um quadro depois do desenho seco). No WebKit daqui, entre o toque
  e o primeiro quadro animado passam 60 a 100 ms de quadros com a página velha
  intacta (só o ponto ao vivo pulsando): é a foto da tela velha sendo tirada em
  software, e não o tempo 0 parado. O quadro adiante não muda isso, e nada no app
  muda; é o mesmo "a conferir no aparelho" do revisor (07 §11.2).
- **O que `vaiPara('treino')` desenha** (o Agora sem o cabeçalho e nenhuma aba
  acesa; risco 10 do mapa): é de antes e não é movimento. Só garanti que nada se
  move nela.
- **O foco no Safari depois de um toque.** O Safari não foca o botão tocado, e o
  `body` já tem o foco antes do toque; `naoPerdeOFoco` não inventa um foco que não
  existia (decisão 13). O que o VoiceOver faz com isso é dele.
- **A troca de aba e a folha que abre no mesmo desenho** (nenhum caminho do app
  faz isso hoje; "Peso de outro dia" na Semana troca de aba e muda só um estado
  do Corpo): a folha nova teria foto só nova, sem animação, e subiria pelo CSS
  dela dentro da foto viva. Não medido.
- **Os fluxos do revisor** (`_medicao/`) não foram tocados. Não usei as portas
  dele; meus servidores foram a 4729 e portas efêmeras do próprio script (como o
  `navegador.js` dos testes), desligados no fim.

### Para o revisor

- **As durações que aparecem na troca de aba**: 350 (as duas fotos do carrossel e
  o fio) e, sob "Reduzir", 120 (o `<main>` que nasce e o cabeçalho do Agora). O
  fio deixou de ser 160. Em toda foto que anda e no fio, um atraso de −17 ms (o
  quadro adiante): a duração continua 350.
- **A barra de abas na troca de aba é uma foto própria** (`barra-de-abas`), parada;
  a conta "fixos aos 120 ms" lê o DOM e não prova isso — a prova são os quadros
  (`aba.test.js`, segundo caso). Na troca de camada ela segue sem nome, com o lugar.
- **A tela muda no primeiro quadro animado** em toda troca agora (o quadro adiante):
  no Chromium, a régua `andaMs` fica a no máximo um quadro do desenho seco.
- **O cronômetro e o aviso descem e sobem 52 px em 350 ms** quando uma tela cheia
  ou o modo chegam ou saem com o descanso na tela: é de propósito (item 3).
  Continuam sem andar de lado. No carrossel, não se movem.
- **O quadro que volta no fim da transição, no WebKit** (decisão 14): vale também
  para as gravações da peça 5. No Chromium não existe.
- **O screencast do Chromium entrega quadros fora de ordem sob carga** (decisão
  17): uma tira montada na ordem de chegada pode mostrar um "quadro que volta" que
  a tela não mostrou. Na ordem do `timestamp` de cada quadro, não.
- **O `page.screenshot` do WebKit não pinta a foto viva de elemento com nome**
  durante a troca (a barra e o cronômetro somem da captura). As tiras feitas do
  screencast não têm esse problema.
- **Sob "Reduzir", "Ir para Semana" e o treino aberto no Programa** deixam o foco no
  título da tela ("Semana"; o título do Programa), nos dois motores, com o teclado
  e com o dedo.

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
src/main.jsx (7542:45): Use of eval in "src/main.jsx" is strongly discouraged as it poses security risks and may cause issues with minification.
rendering chunks...
computing gzip size...
dist/sw.js                        5.24 kB
dist/index.html                   5.81 kB │ gzip:   2.72 kB
dist/assets/index-bsLIfZLg.css  109.44 kB │ gzip:  19.37 kB
dist/assets/index-B3-7Hevd.js   591.98 kB │ gzip: 185.10 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 980ms
(saída 0)
```

`npx vitest run`, duas vezes seguidas, depois da decisão 17 (a carga no começo de
cada uma, pelo `uptime`):

```
10:10:01 up 16:11,  1 user,  load average: 2,09, 4,04, 5,13

 RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app


 Test Files  83 passed (83)
      Tests  1663 passed (1663)
   Start at  10:10:02
   Duration  68.33s (transform 3.17s, setup 0ms, import 32.61s, tests 542.92s, environment 11ms)

(saída 0)
```

```
10:11:10 up 16:12,  1 user,  load average: 7,83, 5,59, 5,61

 RUN  v4.1.10 /home/infraestrutura-imts/workspace/personal/lastro-app


 Test Files  83 passed (83)
      Tests  1663 passed (1663)
   Start at  10:11:10
   Duration  65.53s (transform 3.28s, setup 0ms, import 33.24s, tests 555.98s, environment 11ms)

(saída 0)
```

Antes desta peça: 1652 de 1652 (peça 5). A diferença, +11, são os casos novos: 7
em `aba.test.js`, 1 em `troca.test.js`, 2 em `navegacao.test.js` e a guarda (i) em
`estilo.test.ts` (61 casos ali). Os casos de motor no WebKit (`LASTRO_MOTOR=webkit`),
um arquivo por vez: `aba` 7/7, `troca` 11/11, `sobe` 7/7, `descanso` 5/5, `dedo`
9/9. Com dois arquivos de motor ao mesmo tempo no WebKit (carga ~3–5), caíram por
tempo o caso novo do cronômetro (a captura sem quadros) e o da corrida do histórico
da peça 5 (decisão 20 dela; provavelmente o relógio do desenho atrasado, de 1 s,
entrando antes do navegador sob carga — não verifiquei); sozinhos, os dois passam. A máquina esteve com carga de 1,5 a 10 durante a peça (o
revisor gravando em paralelo).
