# 09 · Frente 4 — o sistema visual, os tokens e o movimento

Esta frente não desenha lugar, não escreve estado e não escreve código. Ela diz
**de que cor, de que tamanho, a que distância, com que alvo, com que anel de
foco e com que movimento** — para os cinco lugares que a frente 1 fixou e para
os estados que a frente 2 especificou.

É a última das cinco, e é a única que entrega uma coisa executável no fim: as
regras de CSS deste produto moram hoje em `tests/dominio/estilo.test.ts`, 38
casos, e **este documento é o que as substitui ou as confirma, caso por caso.**

**Movimento é seção deste documento, não frente.** A decisão é do curador
(`07-plano.md`, frente 4): "abrir uma frente para isso convidaria a inventar
movimento que a direção não pediu". A seção 8 especifica o que a direção tem, e
diz o que ela **não** tem.

**Nenhuma linha deste arquivo tem estimativa de prazo ou de horas.** Ninguém
mediu isso.

---

## 0 · A convenção de prova, e o que eu abri

Cinco etiquetas, e elas valem para tudo:

- **conferi** — abri o arquivo nesta sessão e li a linha. O caminho fica ao lado.
- **medi** — rodei um comando e colhi um número que está reproduzido aqui com o
  comando que o produziu. É a etiqueta que esta frente usa mais, porque cor,
  tamanho e contagem são as únicas coisas do redesenho que dão para medir sem
  aparelho e sem dedo.
- **conta** — aritmética sobre medidas do fonte. A conta fica escrita.
- **do plano / da rede / do parecer / da auditoria / da frente 1 / da frente 2** —
  repito sem reconferir. Fica marcado.
- **não medido** — ninguém mediu, e eu não invento número.

**O que eu abri inteiro:** `tests/dominio/estilo.test.ts` (os 38 casos, um a um,
e rodei a suíte: **38 passam** hoje), `src/tokens.css`, `src/base.css`,
`DESIGN.md` (Tema, Os seis inegociáveis, Paleta, Tipografia, Espaço, Toque,
Movimento), `docs/design-review/05-movimento.md` (as recusas e as armadilhas),
`docs/redesign/09-frente2-interacao.md` inteiro,
`docs/redesign/09-frente1-lugares.md` inteiro, `docs/redesign/07-plano.md`
(§3.5, §4 e a parte da frente 4), `docs/redesign/08-rede.md` §4,
`docs/redesign/04-acesso.md` (§0, §1, §3 inteiro, §7).

**Dos nove HTML da direção D eu abri o fonte, não o render**, e medi sobre eles:
`momento-1.html`, `momento-2.html`, `prototipo.html`, `aula.html`,
`comparar.html`, `corpo.html`, `prescricao.html`, `semana.html`,
`sessao-fotos.html`. Tudo que esta frente diz de cor, de tamanho, de raio, de
sombra, de contagem de ícone e de movimento saiu de medir esses nove arquivos.

**O que eu NÃO abri**, e por isso não afirmo nada sobre: `src/componentes.css`,
`src/treino.css` e `src/protocolo.css` por inteiro — deles eu **medi** o que
está citado (tamanho de fonte, raio, sombra, `font-family`, `overflow`,
`focus`, `transition`, `box-shadow`, as regras nomeadas pelos 38 casos) e li o
bloco em volta de cada linha que cito. `src/main.jsx` inteiro, `src/palco.js`,
e os nove HTML da direção C — deste último lado eu repito o parecer e a
auditoria sem reconferir.

**Por que eu cito nome de classe, de token e de caso de teste, e quase nunca
número de linha:** há outros agentes no repositório e os números andam. Nos nove
HTML da D — que ninguém está editando — eu mantenho o número.

**O número 04-critica/acesso.md do meu briefing não existe.** A auditoria de
acesso é `docs/redesign/04-acesso.md`, arquivo solto, e `docs/redesign/04-critica/`
não é diretório nenhum (conferi com `ls`). É o primeiro item da seção 10.

### 0.1 · Os 38 casos, reclassificados — e a conta de 10 contra 28 está errada

`08-rede.md` §4 diz: **10 casos citam nome concreto** e quebram junto com as
folhas; **28 são invariante genérica** e sobrevivem se o redesenho os respeitar.
Li os 38 e classifiquei um por um. **A conta não bate, e erra para o lado
perigoso: há 25 casos amarrados a nome concreto, não 10.**

| grupo | quantos | o que são |
|---|---:|---|
| **invariante pura** — nenhum nome do CSS de hoje | **13** | a regra é portável e o caso vai inteiro para o sistema novo |
| **cita nome do app de hoje** — a regra é portável, o caso precisa de renome | **16** | cada um casa um seletor literal por expressão regular |
| **da bancada** | **8** | `src/palco.css` e `src/palco.js`, que `07-plano.md` §4 manda trocar por coisa não desenhada |
| **afirma a paleta por valor hexadecimal** | **1** | 16 hexadecimais literais; morre com a troca de direção, por construção |

**Os 13 que vão inteiros** (e são a especificação mobile deste produto, como a
rede escreveu): *toda custom property usada tem dono*; *cor nova não entra solta
no meio das regras*; *a paleta antiga não existe mais, nem por apelido*; *tela
cheia usa svh, não vh*; *espaço vertical fica na escala de 4*; *a raiz recusa os
gestos de zoom*; *o viewport não deixa o navegador escalar a página*; *a pinça do
WebKit é recusada*; *segurar o dedo na interface não abre menu nem seleciona*; *a
barra deslizante toma o gesto*; *nenhum ancestral do sticky vira scroll
container*; *o toast é anunciado por leitor de tela*; *nada entre a folha e a
janela cria bloco de contenção*.

**Os 16 que citam nome**: *alvo de toque não é forçado duas vezes*
(`.ins-tl-toque`, `.ex-top`); *mas campo e prosa continuam selecionáveis*
(`p, .ins-prosa, input, textarea`, nessa ordem, numa linha); *o campo nunca fica
abaixo de 16px* (`input, textarea, select`, idem); *o voltar fica grudado no
topo* (`.tc-topo`); *controle pequeno estende o ALVO* (onze seletores); *o alvo
do tick cresce só na vertical* (`.ins-tick::after`); *a tela cheia tem título de
primeiro nível* (`class="ins-display tc-titulo` em
`src/ui/instrumento/telacheia.jsx`); *o relógio da sessão gruda no topo*
(`.day-rel`, `--sa-top`, `--ins-relogio`); *a barra de status tem fundo*
(`body::before`, `--sa-top`); *o cronômetro não divide o rodapé* (`#timer`,
`--ins-tabbar`); *o app avisa quando o telefone está deitado* (`id="deitado"`, o
manifesto); *a trava de retrato não pega janela de computador*; *a marca de
recorde não pinta ácido sobre ácido* (`.tc-res-sets .rec`, `--ins-acid`); *o
texto que se toca não usa o nível mais apagado* (cinco seletores,
`--ins-text-5`); *abrir um exercício sabe onde parar de rolar* (`.ex`,
`.day-rel`); *o cronômetro de descanso não anima largura* (`#tfill`, e a linha
`fill.style.transform = 'scaleX(` em `src/main.jsx`).

**A pergunta que a rede deixou como "não medido" — quantos dos acoplados
sobreviveriam renomeando só o seletor — tem resposta, e é zero.** Cada um deles
monta a expressão regular a partir do literal e afirma `assert.ok(m, 'sumiu do
CSS: ' + sel)`. Renomear o seletor **é** a falha. Não é estatística: é
construção.

### 0.2 · Nove buracos nas asserções — sete deles novos, e um é estrutural

A frente 2 achou quatro buracos nos 38 (§0.1 dela) e eles valem. Dois deles são
de asserção (os longhands da escala e as duas árvores de ancestral) e viram B1 e
B7 aqui; os outros dois — o acoplamento a seletor literal e o caso do `svh` que
não exige `svh` — estão em §0.1. **Conferi os quatro e achei sete mais**, e um
deles cancela a conta inteira de "quantos ficam vermelhos".

**B0 · Os 38 não ficam vermelhos: eles não rodam.** `estilo.test.ts` lê **nove
arquivos no escopo do módulo**, fora de qualquer `test()`: `src/tokens.css`,
`src/base.css`, `src/componentes.css`, `src/treino.css`, `src/protocolo.css`,
`index.html`, `src/main.jsx`, `src/palco.css`, `src/palco.js`. Um
`fs.readFileSync` que estoura ali derruba a carga do módulo, e nenhum dos 38
chega a executar.

**Medi.** Copiei o repositório para o diretório de rascunho, renomeei
`src/treino.css` para `src/treino-renomeado.css` e rodei a suíte:

```
Error: ENOENT: no such file or directory, open '.../src/treino.css'
 ❯ tests/dominio/estilo.test.ts:24:16
 Test Files  1 failed (1)
      Tests  no tests
```

**`Tests  no tests`.** Não 10 vermelhos, não 38 vermelhos: **zero de 38
executados**, e o relatório diz "erro de carga", que é o sinal menos informativo
que existe — ninguém lê isso como regressão de design.

**Consequência, e ela é requisito desta frente:** se o sistema novo distribuir o
CSS por outros arquivos (um por componente, por exemplo, que é o caminho natural
de uma reescrita), a primeira coisa que acontece é que **as regras de CSS deste
produto param de ser cobradas em silêncio.** Então:

> **Requisito 0.** Os cinco nomes de folha são parte do contrato enquanto
> `estilo.test.ts` os lê por nome. Mudar a divisão das folhas é mudar a lista
> `FOLHAS` **na mesma gravação**, e a lista tem de ser lida de um só lugar: ou
> as folhas são descobertas por varredura de `src/*.css`, ou a lista continua
> literal e muda junto. **Varredura é melhor**, porque é a forma que não tem
> como esquecer, e porque hoje o caso da escala já lê três das cinco por lista
> literal (`['base.css', 'componentes.css', 'treino.css']`) e é justamente ali
> que `protocolo.css` escapa (frente 2, buraco 3).

**B1 · A escala não vê longhand lateral.** Da frente 2, conferido: a expressão é
`(padding|margin|gap)(-top|-bottom)?:`, então `padding-left: 7px` e
`margin-inline: 7px` passam. **Medi em node**, com a expressão do caso:
`padding-left: 7px` → **não casa nada**.

**B2 · A escala exige ponto-e-vírgula no fim.** **Novo.** A expressão termina em
`([^;]+);`. Uma declaração que é a **última do bloco** e não leva `;` — que é
exatamente como CSS minificado escreve — **não casa**. Medi:

```
a{padding: 1px 7px;}   -> lidos: [1px, 7px]   => PEGA
b{padding: 1px 7px}    -> (NAO CASOU NADA)    => ESCAPA
```

E medi o tamanho do buraco nos dois lados: nas folhas de hoje, **0 de 501**
declarações de espaço são últimas sem `;` (as folhas são escritas à mão, com
`;` sempre). Nos nove HTML da D, **596 de 2067, 29%**. Portar o CSS da direção na
forma em que ele está desliga 29% da regra da escala, sem uma linha vermelha.

**B3 · A escala lê `7.5px` como `5px`.** **Novo, e é o pior dos três.** A
expressão interna é `(?<![\w-])(\d+)px`: o que vem antes do `5` em `7.5px` é um
ponto, que não é `\w` nem `-`, então ela casa `5px`. E `5` está na lista de
exceções. Medi:

```
e{padding: 7.5px;}     -> lidos: [5px]        => PASSA
```

Uma medida decimal de espaço passa **com leitura errada**. A D não usa espaço
decimal (medi: zero), mas usa `border: 1.5px` em 64 lugares e `font-size: 10.5px`
e `13.5px`, então o hábito do decimal está no material.

**B4 · Em CSS minificado a escala atravessa a fronteira da regra.** **Novo.** O
valor é `[^;]+`, que não para em `}`. Em minificado, `padding-bottom:2px}\n.ref
tbody th{font-size:13px;` é **um único casamento**, e o `13px` do `font-size` da
regra **seguinte** é atribuído ao `padding` da anterior. Medi isto portando o CSS
da D (§0.3): de 20 ofensores relatados, **nove apontam para a regra errada.** O
caso fica vermelho — e manda a próxima pessoa olhar para o lugar errado.

**B5 · `rgba()` escapa inteiro do teste de cor.** **Novo.** *Cor nova não entra
solta no meio das regras* casa `#[0-9A-Fa-f]{3,8}\b` e mais nada. `rgba()`,
`hsl()`, `color-mix()` e `oklch()` passam. Medi: as folhas de hoje usam **2**
`rgba()`; os nove HTML da D usam **308**, em **18 valores distintos** — entre
eles `rgba(0,0,0,.22)` 75 vezes, `rgba(0,0,0,.42)` 66 e `rgba(0,0,0,.3)` 66.
Portar a direção põe dezoito cores sem nome exatamente onde a regressão que
originou este arquivo de teste nasceu, **e nenhum caso diz nada.**

**B6 · O detector de `var()` órfã não vê bloco de tokens minificado.**
**Novo, e é o mais traiçoeiro de todos.** A expressão de definição é
`/^\s*(--[a-z0-9-]+)\s*:/gm`: ancorada no começo da linha. O bloco de tokens da
D é uma linha só por tema — `--page:#E7E3DB;--bg:#F5F3EE;--surface:#FFFFFF;…` —
então **só o primeiro token de cada linha é visto como definido.** Medi (§0.3):
o caso acusou **11 órfãs** que **têm dono no CSS** (`--bg`, `--ink-2`,
`--surface-2`, `--ink-3`, `--accent-soft`, `--surface`, `--accent-ink`,
`--line-2`, `--on-accent`, `--warn-ink`, `--warn-line`). Um vermelho **falso**,
com onze nomes dentro, e o conserto que ele sugere ("defina esses tokens") é
pedir para definir o que já está definido. O outro conserto que ele sugere —
afrouxar a asserção — mata a única rede que existe contra a regressão de seis
`var()` sem dono em 31 regras que fez este arquivo nascer (o comentário de
abertura dele).

**B7 · Os dois casos de ancestral olham árvores diferentes.** Da frente 2,
conferido e agora **medido** (§0.3): *nenhum ancestral do sticky vira scroll
container* inspeciona **só `body`**, e o `prototipo.html` da D declara
`#app{position:relative;height:100vh;height:100svh;width:100%;overflow:hidden}`
(`prototipo.html:53`). Portei e o caso ficou **verde**.

**B8 · A asserção da barra do cronômetro depende do nome de uma variável.**
*O cronômetro de descanso não anima largura* afirma
`!/fill\.style\.width/.test(mainJsx)` — o **nome literal da variável** `fill`.
A direção escreve `bar.style.width` (`prototipo.html:1412`). **Renomear a
variável desarma a asserção, e a direção já a renomeou sem saber.** O detalhe
inteiro está em §8.5, item 4, porque é lá que a regra vive.

### 0.3 · O que eu medi portando a direção: quatro vermelhos, e três verdes que deviam ser vermelhos

**Medi**, e este é o número mais útil deste documento. No diretório de rascunho:
copiei o repositório, extraí o `<style>` inteiro de
`03-direcao-D/prototipo.html` e o anexei a `src/componentes.css` — que é
literalmente o que faz quem porta a direção para dentro das folhas de hoje —, e
rodei os 38.

**Resultado: 4 vermelhos, 34 verdes.**

| caso | o que ele acusou |
|---|---|
| *toda custom property usada tem dono* | **11 órfãs falsas** (B6). Nenhuma é órfã de verdade |
| *cor nova não entra solta no meio das regras* | **37 hexadecimais** — as duas paletas inteiras, claro e escuro |
| *a paleta antiga não existe mais, nem por apelido* | **`line`**. O token `--line` da D tem o mesmo nome de um da paleta aposentada (§1.6) |
| *espaço vertical fica na escala de 4* | **20 ofensores**, nove deles com a regra errada apontada (B4) |

**E os três verdes que deviam ser vermelhos, medidos:**

1. **O cronômetro.** *O cronômetro de descanso não anima largura* ficou
   **verde** com `.bar i{transition:width 1s linear}` dentro do mesmo arquivo.
   O caso casa `#tfill` por nome; a barra de descanso da D é `.bar i`. A regra
   ("grandeza que repinta sem parar anima `transform`, nunca largura", `DESIGN.md`,
   Movimento, com o custo medido em `3ef9bb9`) **deixa de valer para a barra
   nova**, e nada avisa. Ver §8.6.
2. **O `sticky`.** *Nenhum ancestral do sticky vira scroll container* ficou
   **verde** com `#app{overflow:hidden}` dentro do mesmo arquivo (B7). É o
   defeito descrito na preferência global do dono — "header `sticky` que some sob
   a barra do navegador" — e ele entra por `#app`, que nenhum dos 38 olha. Ver
   §9.3.
3. **O raio e a sombra.** Nada ficou vermelho, porque **não existe caso nenhum
   sobre raio nem sobre sombra**: a direção traz 511 declarações de
   `border-radius` e 58 de `box-shadow` não-`none`, e os 38 passam por cima. Ver
   §2.

**Reproduzir:** copiar o repositório para fora, anexar o `<style>` do
`prototipo.html` a `src/componentes.css`, `npx vitest run --root <copia>
<copia>/tests/dominio/estilo.test.ts`. **Nada foi alterado no repositório para
produzir estes números.**

### 0.4 · O contrato de forma do CSS, e ele não é gosto

Três dos nove buracos (B2, B4, B6) têm a **mesma** causa: as regras deste
produto são cobradas por expressão regular escrita contra CSS formatado à mão, e
o material da direção é minificado. Então o primeiro requisito do sistema novo
não é de cor nem de tamanho:

> **Requisito 1 · A forma do CSS é parte do sistema.** Uma declaração por linha.
> Ponto-e-vírgula no fim de **toda** declaração, inclusive a última do bloco. Um
> token por linha no bloco de `:root`. Nada de minificação na fonte — se houver
> minificação, ela é passo de publicação e as asserções leem a fonte.
>
> **A razão, escrita para não precisar deste documento:** sem ela, três dos 38
> casos param de cobrar o que dizem cobrar, e um deles passa a acusar onze
> defeitos que não existem. É o único requisito deste documento que não tem nada
> a ver com o que aparece na tela, e é o que segura todos os outros.

### 0.5 · Enquanto eu escrevia, outro agente endureceu dez dos 38 — e cinco dos nove buracos fecharam

**Isto não é nota de rodapé: é o estado do repositório no momento em que eu
entrego.** Há uma mudança **não commitada** em `tests/dominio/estilo.test.ts` na
árvore de trabalho (conferi com `git diff`: 275 linhas acrescentadas, 53
removidas, **ainda 38 casos, os mesmos 38 nomes**). Ela endurece dez deles — o
`svh`, a escala, o seletor selecionável, a barra deslizante, o voltar grudado, o
`sticky`, o controle pequeno, o toast, onde parar de rolar e o bloco de
contenção — e acrescenta três ajudantes compartilhados (`blocos()`, `raizDe()` e
a constante `ANCESTRAL` hoisteada).

**Rodei os dois.** A medição de §0.3 foi feita contra a versão **commitada**
(conferi o horário de modificação do arquivo: ele mudou depois). Repeti o mesmo
experimento contra a versão **da árvore de trabalho**, e o resultado mudou:

| | commitada | na árvore de trabalho |
|---|---:|---:|
| vermelhos ao portar o CSS da direção | **4** | **5** |
| *nenhum ancestral do sticky vira scroll container* | **verde** com `#app{overflow:hidden}` | **vermelho**, e acusa os dois: `body → overflow:hidden` e `#app → overflow:hidden` |
| *espaço vertical fica na escala de 4* | 20 ofensores, **nove apontando a regra errada** | **6 ofensores, todos certos** — `padding:1px 7px` (o `.cellb`), `padding:11px 14px 12px`, `margin-top:7px`, `gap:7px`, `padding:11px 2px`, `padding:11px 13px` |

**O que isso faz com os nove buracos de §0.2:**

| buraco | estado |
|---|---|
| **B1** longhand lateral | **fechado** — a expressão agora cobre `-left`, `-right`, `-inline`, `-block`, os lógicos, e `row-gap`/`column-gap` |
| **B2** exige `;` no fim | **fechado** — o terminador passou a ser `[;}]` |
| **B4** atravessa a fronteira da regra | **fechado** — o valor passou a ser `[^;{}]+`, que não cruza `}` |
| **B7** as duas árvores de ancestral | **fechado** — o caso do `sticky` passou a usar a mesma constante `ANCESTRAL` do caso da folha. **É o meu requisito 22, já feito** |
| **B8** o nome da variável `fill` | **fechado, e melhor do que eu especifiquei** — o caso passou a achar no JS a variável que recebe `scaleX`, descobrir de qual `getElementById` ela veio, conferir que o id existe no HTML e cobrar a regra dele em **qualquer** folha. Renomear nos três lugares continua verde |
| **B0** a lista `FOLHAS` literal | **aberto** — a escala passou a ler `FOLHAS` em vez de três nomes, o que é melhor, mas a lista continua literal e os nove arquivos continuam lidos no escopo do módulo |
| **B3** `7.5px` lido como `5px` | **aberto** — a expressão interna continua `(?<![\w-])(\d+)px` |
| **B5** `rgba()` escapa do teste de cor | **aberto** — *cor nova não entra solta* não foi tocado |
| **B6** bloco de tokens minificado | **aberto** — *toda custom property usada tem dono* não foi tocado, e segue acusando **11 órfãs falsas** ao portar a direção |

**Duas correções à minha própria especificação, por causa disso:**

1. **O requisito 22 tem uma exceção que eu não vi, e quem o implementou viu.** A
   trava da folha é `body.ins-travado { position: fixed; inset: 0; overflow:
   hidden }` — um `overflow: hidden` **no `body`**, correto e necessário. Uma
   verificação ingênua da cadeia inteira ficaria **vermelha no código certo**. A
   versão nova nomeia o seletor da exceção e diz por quê: *"ali o scroll da
   página está desligado de propósito, não há sticky a ancorar, e a posição é
   devolvida ao fechar. Ela é nomeada por seletor para que um `overflow: hidden`
   NOVO em `body` ou `#app` continue sendo pego."* **Acrescento isso ao requisito
   22** (§9.4): a exceção é `body.ins-travado`, por nome, com a razão.
2. **A segunda metade do meu requisito 14 já existe**, e eu o deixo escrito como
   está porque a **primeira** metade continua necessária: o caso novo amarra a
   barra **do app** (aquela cujo id vem do `getElementById` que o JS escala). A
   barra **nova** da direção é `.bar i`, outro elemento, e nenhum caso a alcança.
   **O caso novo que eu proponho — *nenhuma `transition` menciona `width` nem
   `height`* — continua valendo**, e é o que pega qualquer barra futura.

**E a lição de método, porque ela vale mais do que o saldo:** eu medi, escrevi o
número, e o número andou enquanto eu escrevia. **O que não andou foi o nome do
caso.** É exatamente a razão pela qual o briefing manda citar nome de classe, de
token e de caso de teste em vez de número de linha — e aqui ela se provou dentro
de uma sessão.

---

## 1 · Os tokens, nos dois temas

### 1.1 · O que a direção entrega: vinte cores, e mais nada

**Medi os nove HTML da D.** O conjunto de `custom properties` da direção é este,
inteiro:

```
--page --bg --surface --surface-2
--ink --ink-2 --ink-3
--line --line-2
--accent --accent-ink --accent-soft --on-accent
--warn-bg --warn-ink --warn-line
--err-bg --err-ink --err-line
--scrim
```

**Vinte, e todas são cor.** Definidas: 20. Usadas em `var()`: 20. Órfãs: **zero**
— a direção já cumpre, por si, a regra de que não existe `var()` sem dono.

**E não há mais nada.** Zero token de espaço, de tipo, de alvo, de raio, de
duração, de curva, de área segura. Todo o resto do CSS da direção é número
literal na regra: `width:54px`, `height:64px`, `gap:6px`, `border-radius:14px`,
`.12s ease`. Medi: **zero** `font-family` declarado nos nove arquivos, e **29**
tamanhos de fonte distintos (§3.2).

Contra isso, `src/tokens.css` tem **51** tokens hoje (medi), dos quais 16 de
cor e 35 de espaço, geometria, toque, movimento e área segura. **Então a
direção me dá a paleta e eu tenho de construir o resto**, e construir o resto é
decisão, não extração. Onde eu decido, está dito.

**Um achado de passagem, do lado de hoje:** dos 51 tokens, **2 são definidos e
nunca usados** — `--ins-border-width` e `--ins-surface-acid2` (medi, varrendo
`var()` nas cinco folhas). O caso *toda custom property usada tem dono* cobra
uma direção só. Proponho a recíproca em §11.

### 1.2 · Os dois temas existem, e por três caminhos diferentes — o que o briefing não diz

Está certo que os dois temas existem desenhados. **Medi por qual mecanismo, e
são dois mecanismos diferentes, não um:**

| arquivo | como o escuro chega |
|---|---|
| `momento-1.html`, `momento-2.html`, `prototipo.html` | **os dois caminhos**: `@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]) }` **e** `:root[data-theme="dark"]` |
| `aula`, `comparar`, `corpo`, `prescricao`, `semana`, `sessao-fotos` | **uma classe no telefone de mentira**: `.phone.dark`. Zero `prefers-color-scheme`, zero `[data-theme]` |

**Consequência prática:** nas seis telas da segunda rodada, o documento **nunca
segue o tema do aparelho** — ele é claro sempre, e o escuro aparece porque cada
estado é desenhado **duas vezes**, lado a lado. Medi a contagem de telefones:
`aula` 24 (12 estados × 2), `comparar` 22, `corpo` 22, `prescricao` 22, `semana`
20, `sessao-fotos` 22 — metade escura em cada. Em `momento-1` (14 estados) e
`momento-2` (13) é o contrário: um telefone por estado, e o tema se troca na
página inteira pelos três botões `Sistema · Claro · Escuro`.

**Os valores do escuro são idênticos nos nove** (medi: o bloco escuro é o mesmo
byte a byte). Então não há duas paletas escuras — há uma, servida por dois
mecanismos. **O que isso custa:** o método da auditoria de acesso foi "escuro por
`data-theme="dark"`" (`04-acesso.md` §0), e nas seis telas da segunda rodada
`data-theme` **não existe**. Ver §1.4.

**O mecanismo que fica**, e é o dos três arquivos, porque é o que atende a
decisão D10 ("o tema segue o aparelho, com troca manual") sem JavaScript no
caminho da primeira pintura:

```css
:root            { color-scheme: light; /* os valores claros */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; /* os valores escuros */ }
}
:root[data-theme="dark"]          { color-scheme: dark; /* os valores escuros */ }
```

O `:not([data-theme="light"])` é o que faz a troca manual para claro vencer o
aparelho escuro, e o terceiro bloco é o que faz a troca manual para escuro vencer
o aparelho claro. **Os dois blocos escuros carregam os mesmos valores**, e isso é
repetição de propósito: uma camada de indireção (um bloco que só reatribui) daria
um terceiro lugar para o valor divergir.

**Duas coisas do `index.html` mudam na mesma gravação**, e as duas são de uma
linha (conferi as duas no arquivo de hoje):

- `<meta name="color-scheme" content="dark">` passa a `content="light dark"`.
  Hoje ele declara o app como escuro-apenas, e com ele assim o navegador pinta
  controles nativos e a barra de rolagem em escuro num tema claro.
- `<meta name="theme-color" content="#0C0E0C">` vira **duas** linhas, uma por
  tema, com `media="(prefers-color-scheme: light)"` e `dark`. É a cor da barra de
  status do sistema no PWA instalado; um valor só deixa a barra escura por cima
  de uma tela clara.

### 1.3 · A tabela, com dono, nos dois temas

Prefixo `--ins-`, como hoje. **Três razões, e nenhuma é gosto:**

1. O caso *toda variável da bancada tem dono* afirma
   `!/^\s*--ins-[a-z0-9-]+\s*:/m.test(palcoCss)` — "a bancada não redefine um
   token do Instrumento". Sem prefixo, essa asserção deixa de proteger coisa
   alguma.
2. `--line` da direção **colide pelo nome** com a paleta aposentada (§1.6). O
   prefixo mata a colisão de graça.
3. Já existem três namespaces no projeto — `--ins-`, `--sa-`, `--pl-` — e a
   disciplina é essa.

| token | claro | escuro | dono: quem pinta com ele |
|---|---|---|---|
| `--ins-fundo` | `#E7E3DB` | `#08090A` | `html` e `body`. É o que aparece atrás de tudo, na área segura e no rubber-band |
| `--ins-tela` | `#F5F3EE` | `#111214` | `#app` e cada tela. O fundo de leitura |
| `--ins-superficie` | `#FFFFFF` | `#1B1D21` | o elevado: lista fechada, folha, barra de lugares, cabeçalho |
| `--ins-superficie-2` | `#EDEAE3` | `#25282D` | preenchimento de controle e de linha de opção |
| `--ins-tinta` | `#15171A` | `#F2F1EE` | nome, valor, título |
| `--ins-tinta-2` | `#474C54` | `#BCC0C7` | prosa de apoio sob um título |
| `--ins-tinta-3` | `#5C6169` | `#A2A6AE` | rótulo, meta, **procedência** (§7) |
| `--ins-fio` | `#DCD7CD` | `#33363C` | divisória **dentro** de lista; borda de cartão. **Nunca identifica controle** |
| `--ins-fio-controle` | `#8C867A` | `#7C818A` | a borda que diz "isto é um controle" |
| `--ins-acento` | `#3833DB` | `#9E9BFF` | agora / feito / seu / aperte aqui |
| `--ins-acento-tinta` | `#2C28BE` | `#B6B4FF` | o acento como **texto** sobre fundo de leitura |
| `--ins-acento-suave` | `#E9E8FD` | `#272550` | preenchimento de selecionado |
| `--ins-sobre-acento` | `#FFFFFF` | `#14123F` | texto sobre preenchimento de acento |
| `--ins-atencao-fundo` | `#FBEFD6` | `#33270F` | fundo do painel de atenção |
| `--ins-atencao-tinta` | `#5E3B00` | `#F3CF85` | texto do painel de atenção |
| `--ins-atencao-fio` | `#D9A955` | `#7A5A1E` | borda do painel de atenção, **e o estado "vence agora"** |
| `--ins-pare-fundo` | `#FBE4E1` | `#3A1714` | fundo do painel de "pare": falhou, ou vai destruir |
| `--ins-pare-tinta` | `#7F1A12` | `#FFADA3` | texto do painel de "pare" |
| `--ins-pare-fio` | `#D98A80` | `#7E3129` | borda do painel de "pare" |
| `--ins-veu` | `rgba(18,18,30,.42)` | `rgba(0,0,0,.6)` | o véu atrás da folha |

**Vinte, os mesmos vinte da direção.** Os valores são os dela, sem um byte de
diferença; o que eu mudei é **nome e dono**. Duas mudanças de nome que são
decisão e não tradução:

- **`--err-*` vira `--ins-pare-*`.** Na direção, o terceiro sinal é "falhou". No
  app de hoje o terceiro sinal é **coral**, e o inegociável 4 diz o que ele
  significa: "Coral = destrói dado" (`src/tokens.css`). **Medi a direção e ela
  não tem cor nenhuma para destrutivo**: o único controle destrutivo dos nove é
  `<button class="sec">Descartar</button>` em `aula.html`, que é o botão
  secundário comum, sem distinção. É o que `07-plano.md` §4 registra ("as duas
  direções não tratam apagar") e o achado 8 da frente 1.

  **A decisão, e é minha:** o terceiro sinal **não ganha uma quarta cor**. Ele
  significa uma coisa só — **pare** — e as duas situações que param o dedo
  (gravação que falhou, ação que destrói dado) usam o mesmo painel, com a mesma
  moldura e a mesma tinta. **O que distingue as duas é a palavra, e a palavra já
  é obrigatória:** o contrato manda "estado nunca só por cor"
  (`docs/LASTRO_UX_CONTRACT.md` §11), e o destrutivo de hoje já delimita o
  estrago em texto — *"Sai da média da semana e do ritmo. As outras medidas
  ficam."* (`delBody`, em `src/main.jsx`).

  **Por que isto é mais fiel ao inegociável 4, e não menos:** "um acento, e ele
  significa". Dois vermelhos com significados diferentes na mesma tela são dois
  acentos. Um vermelho que significa "pare" é um. E eles nunca aparecem juntos:
  um erro de gravação e uma confirmação de apagar são estados excludentes.
  **O custo, declarado:** quem olhar só a cor não sabe se falhou ou se vai
  destruir. A resposta é que a cor nunca foi suficiente para isso — nem hoje,
  com coral: coral aparece em `.edx-b.rm`, em `.ins-btn-destructive` e em
  `.danger`, e em todos os três a palavra é que diz o que vai embora.
  **Isto sobe à mesa dele**, porque é mudança no inegociável 4 (§11).

- **`--line` vira `--ins-fio` e `--line-2` vira `--ins-fio-controle`.** O nome
  diz o dono, e o dono é a melhor decisão de acesso do material (§1.4).

### 1.4 · O contraste, medido — e é a primeira medida do escuro

A auditoria mediu **dois** dos nove arquivos da D: `momento-1.html` e
`momento-2.html`. Conferi as datas: `04-acesso.md` é de 02/10 e os sete arquivos
restantes — as seis telas da segunda rodada e o `prototipo.html` — são de 04/10.
**Sete dos nove nunca foram auditados, em nenhum dos dois temas.** A auditoria
diz, no que não mediu, que os lugares "descritos e não desenhados" ficaram de
fora; eles passaram a existir depois.

**`07-plano.md` §1.3 #1 está preciso e eu o confirmo:** *"O que não existe é
medida de contraste do escuro **nas telas novas**: não medido."* Confirmei a
leitura: a auditoria mediu os dois temas (*"claro, e escuro por
`data-theme='dark'`"*) nos dois arquivos que existiam quando ela rodou.

**O que eu acrescento são três coisas:**

1. **O buraco é de sete arquivos, não de seis, e nos dois temas.** O
   `prototipo.html` também é posterior à auditoria (04/10) e também nunca foi
   medido — nem no claro. O plano nomeia "as seis telas da segunda rodada"; o
   protótipo, que é a tela única e a que o dono tocou, não está na conta de
   ninguém.
2. **O método da auditoria não roda nos seis como está escrito.** Ele troca
   `data-theme="dark"`, e nos seis `data-theme` **não existe** — o escuro é
   `.phone.dark`, e cada estado já está desenhado nos dois temas lado a lado.
   Quem repetir a medição precisa saber disso antes, senão mede o claro duas
   vezes.
3. **A parte que é aritmética eu medi**, e está abaixo.

**O que eu posso medir sem aparelho e sem navegador, e medi:** a razão de
contraste **entre tokens**, pela luminância relativa da WCAG 2.x. Isto é
aritmética e se reproduz. **O que isto não cobre, dito antes da tabela:** a
composição real — texto sobre um fundo semitransparente sobre outro, `opacity`
acumulada, o que a auditoria chama de "fundo efetivo". Isso exige subir a árvore
no navegador, e eu não o fiz.

**Atestado da conta:** ela reproduz **sete** medidas independentes de C3, ao
centésimo — `--line-2` sobre `--bg` 3,26:1, sobre `--surface` 3,62:1, sobre
`--surface-2` 3,01:1, e no escuro 4,79:1 e 4,31:1; `--line` 1,29:1 e 1,43:1;
`--accent` sobre `--bg` 7,11:1; `#FFFFFF` sobre `--accent` 7,88:1; `--ink-3`
5,62:1 (o tracejado do quadradinho dos 14 dias). **Todas as sete batem.**

**Tema claro — razão sobre cada fundo:**

| | `fundo` | `tela` | `superficie` | `superficie-2` |
|---|---:|---:|---:|---:|
| `tinta` | 14,03 | 16,19 | 17,96 | 14,95 |
| `tinta-2` | 6,75 | 7,79 | 8,64 | 7,19 |
| `tinta-3` | 4,87 | 5,62 | 6,23 | 5,19 |
| `acento` | 6,16 | 7,11 | 7,88 | 6,56 |
| `acento-tinta` | 7,62 | 8,79 | 9,75 | 8,11 |
| `fio-controle` | 2,83 | **3,26** | **3,62** | **3,01** |
| `fio` | 1,12 | 1,29 | 1,43 | 1,19 |

**Tema escuro — a primeira medida:**

| | `fundo` | `tela` | `superficie` | `superficie-2` |
|---|---:|---:|---:|---:|
| `tinta` | 17,64 | 16,59 | 14,94 | 13,09 |
| `tinta-2` | 10,92 | 10,27 | 9,24 | 8,10 |
| `tinta-3` | 8,16 | 7,68 | 6,91 | 6,06 |
| `acento` | 8,15 | 7,66 | 6,90 | 6,05 |
| `acento-tinta` | 10,40 | 9,78 | 8,81 | 7,72 |
| `fio-controle` | 5,09 | **4,79** | **4,31** | **3,78** |
| `fio` | 1,65 | 1,55 | 1,39 | 1,22 |

**Leitura, em três linhas:**

1. **Os cinco níveis de texto da direção são três, e os três passam em AA nos
   dois temas, sobre os quatro fundos.** O pior caso é `tinta-3` sobre `fundo`
   no claro: **4,87:1**, acima de 4,5. Isso é melhor do que hoje: o app tem
   **cinco** níveis e o quinto mede **3,22:1** sobre o canvas (medi), que é
   abaixo de 4,5 — e é por isso que existe o caso *o texto que se toca não usa o
   nível mais apagado*, com cinco seletores presos nele. **Com três níveis que
   todos passam, esse caso deixa de precisar de lista de seletores:** ele vira
   "não existe nível abaixo de 4,5:1", que é afirmação sobre a paleta e não sobre
   quem a usa. É o único dos 16 casos acoplados que o sistema novo **apaga em vez
   de renomear**.
2. **`fio-controle` passa 1.4.11 nos dois temas, e `fio` não chega perto.** A
   separação dos dois é o que a auditoria chamou de "a melhor decisão de acesso
   das duas direções". **E ela conserta um defeito que o app tem hoje e que
   ninguém mediu:** `--ins-border-strong`, documentado como "borda interativa:
   stepper, botão secundário", mede **1,84:1** sobre o canvas e **1,76:1** sobre
   a superfície (medi). São **24 usos** nas folhas de hoje, entre eles
   `.ins-stepper-btn` e o controle de `componentes.css` que leva
   `min-height: var(--ins-tap)` — isto é, controles **repetidos**, de 46 px, cuja
   borda identificadora está a 1,84:1 contra os 3:1 de 1.4.11. A auditoria mediu
   as duas direções, não o app. **Então trocar para a D é ganho medido aqui, e
   não só mudança de gosto.**
3. **O acento como texto tem token próprio, e é por isso que ele existe.**
   `acento` sobre `tela` dá 7,11:1 e já passaria; `acento-tinta` dá 8,79:1. A
   razão do segundo token não é contraste contra o fundo — é contraste contra o
   **acento-suave**: `acento` sobre `acento-suave` dá 6,54:1 (claro) e 5,85:1
   (escuro), e `acento-tinta` sobre `acento-suave` dá 8,09:1 e 7,47:1. O par
   selecionado (fundo suave, texto de acento) é o que a régua usa em `.rep.last`.
   **Requisito: dentro de `--ins-acento-suave`, texto é `--ins-acento-tinta`,
   nunca `--ins-acento`.**

### 1.5 · Quatro pares que reprovam, e nenhum foi medido antes

**Medi, e são os únicos quatro números abaixo do limiar na paleta inteira:**

| par | claro | escuro | alvo |
|---|---:|---:|---|
| `atencao-fio` sobre `atencao-fundo` | **1,89** | **2,30** | 3:1 |
| `pare-fio` sobre `pare-fundo` | **2,19** | **1,80** | 3:1 |
| `atencao-fio` sobre `tela` | **1,94** | **2,95** | 3:1 |
| `pare-fio` sobre `tela` | **2,40** | **2,10** | 3:1 |

E o contexto, que é o que decide se isto é defeito de norma ou defeito de
leitura. Medi os preenchimentos contra a página:

- `atencao-fundo` sobre `tela`: **1,03:1** no claro, 1,28:1 no escuro.
- `pare-fundo` sobre `tela`: **1,10:1** no claro, 1,17:1 no escuro.

**Um painel de atenção que difere da página por 1,03:1 não se vê — vê-se o
texto dele.** O texto está ótimo: `atencao-tinta` sobre `atencao-fundo` dá
8,76:1 e `pare-tinta` sobre `pare-fundo` dá 8,40:1 (medi). Então:

**O que NÃO é reprovação de norma, e eu digo por quê:** `.warn` e `.err` são
painéis de texto, não controles. 1.4.11 cobra o limite de "informação visual
necessária para identificar componentes de interface e seus estados"; um painel
cuja mensagem está escrita é identificado pela palavra. **Não conto isto como
reprovação de 1.4.11.**

**O que É reprovação, e ninguém mediu:** os **estados** que a direção identifica
pela borda, e não pela palavra. Medi os quatro no fonte dos nove:

```
.item.due  { border: 2px solid var(--warn-line); background: var(--warn-bg) }
.gate .ic2.no { box-shadow: inset 0 0 0 1.5px var(--warn-line); … }
.pz2.hot   { box-shadow: inset 0 0 0 1.5px var(--warn-line); … }
.pl .n.bad { box-shadow: inset 0 0 0 1.5px var(--err-line);  … }
```

`.item.due` é **a mudança do dia que vence agora**, na Prescrição — a coisa que
a frente 1 pôs no centro do §8.1 dela e que a frente 2 amarrou ao carregador do
§9.2. Ela se distingue das irmãs por uma borda de 2 px a **1,94:1** contra a
página. Os outros três são pílulas de estado: o portão não cumprido, a semana
quente, a pose fora de enquadramento.

**Requisito, e é de token, não de desenho:** onde a borda é o **único** canal de
um estado, ela usa `--ins-fio-controle` (3,26:1 / 4,79:1), não
`--ins-atencao-fio` nem `--ins-pare-fio`. A cor de atenção e a de pare continuam
pintando **o fundo e o texto** do painel, que é onde elas passam folgado.
`--ins-atencao-fio` e `--ins-pare-fio` ficam como **moldura decorativa do
painel**, declarado assim — e um painel cuja moldura é decorativa precisa que o
fundo ou a palavra façam o trabalho.

**O que eu não decido:** se o preenchimento de 1,03:1 é visível na luz da
academia. `01-fatos.md` registra que a luz da academia, o sol, a luva e o
magnésio **não estão registrados**, e a auditoria repete isso no que não mediu.
**Não medido**, e o protocolo está em §1.7.

### 1.6 · `--line`: o nome colide com a paleta aposentada, e eu medi a colisão

O caso *a paleta antiga não existe mais, nem por apelido* proíbe 19 nomes, e a
razão está escrita no teste: *"dois nomes para a mesma cor é a porta pela qual
uma segunda paleta volta a entrar."* Um dos 19 é **`line`**.

**Medi** (§0.3): portando o CSS da direção, esse caso fica vermelho acusando
exatamente `line`, porque a direção usa `var(--line)` e o teste casa
`var\(--line\)`.

É coincidência de nome, não de cor — o `--line` aposentado era de outra paleta.
Mas a consequência é real e tem dois lados:

1. **Com o prefixo `--ins-fio`, o vermelho não existe.** É mais uma razão para o
   prefixo, e é de graça.
2. **Sem prefixo, o conserto mais curto é tirar `line` da lista dos 19** — e aí a
   lista deixa de proibir um nome que ela foi escrita para proibir, por um motivo
   que não tem nada a ver com o dela. É o tipo de conserto que parece certo e
   desarma a rede.

### 1.7 · Os 308 `rgba()` que nenhum caso vê, e as oito cores presas da câmera

**Duas famílias de cor escapam dos tokens, e as duas escapam também das
asserções.**

**Primeira: `rgba()`.** Medi: os nove HTML usam **308** `rgba()`, em **18**
valores distintos. Os cinco maiores: `rgba(0,0,0,.22)` 75 vezes,
`rgba(0,0,0,.42)` 66, `rgba(0,0,0,.3)` 66, `rgba(0,0,0,.6)` 24,
`rgba(255,255,255,.14)` 12. As folhas de hoje usam **2** (medi).

E o caso *cor nova não entra solta no meio das regras* casa
`#[0-9A-Fa-f]{3,8}\b`. **`rgba()` passa inteiro.** Então portar a direção põe
dezoito cores sem nome exatamente no lugar onde nasceu a regressão que fez este
arquivo de teste existir — e nada fica vermelho.

> **Requisito 2.** Cor é token em qualquer notação. A asserção passa a cobrar
> `#hex`, `rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(`, `lab(` e `color-mix(` fora
> de `tokens.css`. **Exceção única e declarada:** `rgba(0,0,0,α)` e
> `rgba(255,255,255,α)` dentro de uma `box-shadow` ou de um `text-shadow`, porque
> sombra não é cor de superfície e um token de sombra preto com alfa variável
> daria um token por alfa. Essas duas formas entram na lista de exceções do caso,
> com esta razão escrita ao lado.

**Segunda: as oito cores presas da câmera.** Medi: nas seis telas da segunda
rodada há **oito** hexadecimais soltos nas regras, e eles vivem todos na mesma
região — a tela cheia da foto:

```
.cheia        { background:#0C0B0A; color:#fff }
.cheia .frame { background:#CFC8BA }
.cheia .frame.vazio { background:#15161A }
.cheia .nine i.f { background:#fff }
.cheia .nine i.c { background:#9E9BFF }
.cheia .nine i.x { background:repeating-linear-gradient(45deg,#FFADA3 0 4px,…) }
.cheia .ring b { color:#fff; text-shadow:0 2px 14px rgba(0,0,0,.55) }
.cheia .flash { background:#fff }
.hip          { background:#15171A; color:#fff; border:1.5px dashed #fff }
.cort .hd     { background:#fff } .cort .hd i::before { border-right-color:#15171A }
```

**Eles são iguais nos dois temas, de propósito, e o propósito é certo:** uma tela
de câmera e um comparador de fotos são sempre escuros, porque o assunto é a
imagem e qualquer luz em volta falseia o que se vê. É a mesma razão pela qual o
visualizador de fotos de qualquer sistema não segue o tema.

**Mas três dos oito são o valor de um token com outro nome:** `#15171A` **é**
`--ins-tinta` no claro, `#9E9BFF` **é** `--ins-acento` no escuro, `#FFADA3` **é**
`--ins-pare-tinta` no escuro. É literalmente "dois nomes para a mesma cor", que
é a porta que o caso da paleta aposentada existe para fechar.

> **Requisito 3 · A câmera é um tema, não um punhado de cores soltas.** A região
> de foto em tela cheia (`.cheia`, o comparador, o enquadramento) declara um
> bloco próprio de tokens, com nome próprio, **fixo nos dois temas**:
> `--ins-foto-fundo`, `--ins-foto-vazio`, `--ins-foto-chapa` (o cinza do lugar
> da foto), `--ins-foto-tinta` (o branco em cima da imagem), `--ins-foto-marca`
> (o acento em cima da imagem), `--ins-foto-fora` (o hachurado de "fora de
> enquadramento"). Seis tokens, no `tokens.css`, com o comentário dizendo **por
> que** eles não trocam com o tema. É a mesma forma que a bancada já usa com
> `--pl-` e que tem caso próprio (*o titânio da bancada não vira uma segunda
> paleta solta*) — e por isso é forma conhecida deste projeto, não invenção.
>
> **Os três que repetem valor de token do tema escuro passam a referenciar o
> token**, não a repetir o hexadecimal: `--ins-foto-marca: #9E9BFF` fica escrito
> uma vez em `tokens.css`, com a nota de que é o mesmo valor de
> `--ins-acento` no escuro **e que a igualdade é coincidência de projeto, não
> dependência** — se o acento mudar, este não muda com ele.

**E o protocolo do contraste que falta**, porque a parte que eu não posso medir é
a que mais importa:

> **Medição F · o contraste composto, nos sete arquivos que ninguém auditou.**
> Repetir o método da auditoria (`04-acesso.md` §0: Chromium guiado por
> `playwright-core`, encaixe neutralizado com `.phone{transform:none}`,
> luminância relativa sobre o **fundo efetivo** subindo a árvore com alfa e
> `opacity` acumulada) em `aula.html`, `comparar.html`, `corpo.html`,
> `prescricao.html`, `semana.html`, `sessao-fotos.html` e `prototipo.html`.
>
> **Duas mudanças obrigatórias no método**, senão a medição não roda: nos seis da
> segunda rodada o escuro **não** é `data-theme="dark"`, é `.phone.dark` — e cada
> estado já está desenhado nos dois temas, então o que a medição varre é o
> conjunto inteiro de telefones, sem trocar atributo nenhum. No `prototipo.html`,
> que é tela única, o escuro é `data-theme` e **há estado por trás de toque**:
> a medição tem de percorrer o roteiro, não só a abertura.
>
> **O que reprova:** qualquer texto abaixo de 4,5:1 (ou 3:1 em texto grande),
> qualquer **controle** cujo único canal fique abaixo de 3:1, qualquer **estado**
> identificado só por borda abaixo de 3:1. Sem tolerância, porque não é
> estatística.
>
> **O que esta medição não resolve, e continua não medido:** a luz da academia, o
> sol na janela, a luva e o magnésio (`01-fatos.md`). Contraste calculado é contra
> um vidro limpo num quarto neutro.

### 1.8 · Os tokens que a direção não tem e o sistema precisa

Tudo abaixo é **decisão minha**, porque a direção não dá token nenhum fora da
cor. Cada família diz de onde o valor veio.

| família | tokens | de onde |
|---|---|---|
| **espaço** | `--ins-1` a `--ins-11` (4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34) | ficam como estão. §3.1 mostra que 93% do espaço da direção já cai nesta escala |
| **tipo** | um por papel, 16 papéis, em `rem` | §3.2 e §4 |
| **fonte** | `--ins-fonte` (uma só) e `--ins-fonte-quadro` (mono, só o quadro do box) | §2.2 |
| **toque** | `--ins-tap: 46px`, `--ins-tap-dense: 28px` | ficam como estão, com a razão escrita que já têm |
| **foco** | `--ins-foco`, `--ins-foco-largura: 3px`, `--ins-foco-folga: 2px` | §5.5. Hoje não existe token de foco |
| **raio** | `--ins-raio-1` a `--ins-raio-4` | §2.1. Hoje existe `--ins-radius: 0` |
| **fio** | `--ins-fio-largura: 1px`, `--ins-fio-largura-2: 1.5px` | a direção usa 1.5px em 64 lugares (medi) e 2px no selecionado |
| **movimento** | `--ins-dur: 220ms`, `--ins-ease`, mais `--ins-dur-toque: 120ms` | §8 |
| **área segura** | `--sa-top`, `--sa-bottom`, `--sa-left`, `--sa-right` | ficam. Quatro casos dependem deles |
| **alturas derivadas** | `--ins-tabbar`, `--ins-timer-h`, `--ins-faixa-h`, `--ins-relogio` | ficam. Cada um tem razão medida escrita no `tokens.css` de hoje, e três casos dependem deles |
| **câmera** | os seis `--ins-foto-*` | §1.7, requisito 3 |

**O que SAI, e por que:** `--ins-surface-acid2` e `--ins-border-width` (definidos
e nunca usados, medi); `--ins-text-5` (o nível a 3,22:1 que a paleta nova não
tem); `--ins-acid-hover` (não há `hover` num telefone, e o toque é `:active`);
`--ins-recuo-valor: 56px` (é medida de um componente do sistema velho — a coluna
de valores do histórico —, e a direção redesenha aquela tela).

**O que fica sem valor até alguém medir:** nada. Não deixei token sem valor, e
onde eu não tinha de onde tirar o valor, eu o derivei de uma medida que está no
fonte e escrevi a derivação.

---

## 2 · Os seis inegociáveis, e os três que a direção escolhida derruba

`src/tokens.css` abre com seis regras numeradas, e `DESIGN.md` as repete com a
razão de cada uma. **Medi a direção contra as seis.** Três caem, uma troca de
valor e duas ficam. **Nenhum dos 38 casos diz uma palavra sobre as três que
caem** — então, se este documento não disser, elas caem em silêncio.

> **RECONCILIADO em 06/10 · OS TRÊS CAEM, e a nota dele é "sem herancas".**
>
> **Decisão 12 das quinze:** os **três** inegociáveis caem — raio zero (§2.1),
> número em mono mais prosa em display (§2.2) e o rótulo mono como estrutura
> (§2.2, item 3). Nota literal dele: ***"sem herancas"*** — **caem limpos, sem
> meia-medida do sistema velho.**
>
> **E a ressalva deste documento foi DERRUBADA junto.** Eu recomendei a queda
> **declarando a perda**: que sem a monoespaçada a diferença entre rótulo de
> estrutura e ênfase passa a depender só de tamanho e de tracking, e que **isso é
> um canal mais fraco** (§2.2, item 3). **A ressalva não sobrevive à nota dele:**
> ele não pediu compensação nem exceção, pediu queda limpa. **O argumento fica
> escrito, porque continua verdadeiro e quem implementar precisa saber do custo**
> — mas ele não autoriza manter nada do sistema velho "por segurança". Nenhuma
> regra de dois pesos, nenhuma família mono de reserva para rótulo, nenhum raio
> zero preservado em algum canto "porque era inegociável".
>
> **O que "sem herancas" NÃO decide, e eu não invento:** ele não torna o canal
> mais forte. **Se caixa alta com tracking a 15 px se distingue da prosa a 14 px
> a um braço de distância, na luz da academia, ninguém mediu** — a frente 3
> declarou a mesma ausência (§14 dela). O custo foi aceito, não resolvido.
>
> **O que substitui o rótulo mono é da frente 3**, que escreveu a decisão 12 em
> palavras (§2 dela): menos rótulos, cada um maior, e a palavra dizendo qual é
> qual. **As duas frentes concordam**, e o que esta diz do canal mais fraco é o
> preço que aquela escreveu como se paga.

### 2.1 · Raio zero cai: 511 declarações contra 11

**Inegociável 1:** *"Raio zero. Só ponto de status, thumb do slider e a
miniatura do aparelho (10px) são redondos."*

**Medi os dois lados:**

| | declarações de `border-radius` | valores distintos |
|---|---:|---:|
| as folhas de hoje | **11** — 6 são `50%`, 3 são `0`, 1 é `var(--ins-radius)` (que é 0), 1 é `var(--ins-raio-foto)` (10px) | 3 |
| os nove HTML da D | **511** | **20** |

A regra de hoje não é frase num documento: ela é o estado do CSS. E o comentário
em `src/componentes.css` conta a história: *"Antes havia uma regra que zerava o
raio de TUDO dentro de `#app` — muleta enquanto as telas em string nasciam com 2
a 12px. Não é mais necessária: nenhuma regra do projeto declara raio."* **A
direção escolhida reinstala exatamente o que aquela muleta existia para matar.**

**A decisão, e ela é da direção, não minha: o raio entra.** O dono escolheu a D
depois de tocá-la, e a forma arredondada é parte do que ele tocou. O que eu
decido é que ele entra **como escala**, não como 20 valores soltos.

**A escala, derivada de medir os 84 seletores com raio dentro do telefone**
(exclui o chrome da galeria e a moldura `.phone`, de 52px, que não existe no app):

| token | valor | quem pinta com ele | medi |
|---|---:|---|---:|
| `--ins-raio-1` | `4px` | marca pequena: barra do descanso, puxador, ponto de pose, listra | **11** seletores (2, 3, 4, 5 px) |
| `--ins-raio-2` | `8px` | pílula de valor: `.cellb`, etiqueta de foto, selo, quadradinho | **19** seletores (6 a 11 px) |
| `--ins-raio-3` | `14px` | controle: botão, tecla do teclado próprio, campo, `.rep` | **32** seletores (12 a 16 px) |
| `--ins-raio-4` | `20px` | bloco: cartão, painel, faixa, o quadro da foto | **18** seletores (17 a 22 px) |
| `--ins-raio-5` | `26px` | **só a folha**, e só as duas quinas de cima | **1** seletor (`.sheet`) |
| `--ins-raio-pil` | `999px` | o chip, que é pílula de verdade | **1** seletor (`.chip`) |
| — | `50%` literal | ponto de status, ponto ao vivo, thumb do slider, o puxador da cortina | como hoje: fica literal, porque é círculo e não raio |

**Cobertura medida: 84 de 84.** Nenhum seletor da direção precisa de um valor
fora desta escala. Os 20 valores viram 6 degraus e o custo é de no máximo 2 px em
cada declaração — e **eu não medi se 2 px de diferença aparecem**: isso é olho em
tela, não aritmética.

**O inegociável 1 passa a ser:** *"Raio em seis degraus, e o degrau diz o que a
coisa é: 4 para marca, 8 para valor, 14 para controle, 20 para bloco, 26 só para
a folha, pílula para o chip. Raio solto no meio das regras não entra — ele nasce
nomeado, como cor."* E há um caso a escrever (§11), porque hoje não existe
nenhum.

### 2.2 · Mono mais display cai: a direção tem zero `font-family`

**Inegociável 2:** *"Número em mono, prosa em display."* Space Grotesk mais IBM
Plex Mono, com 16 papéis tipográficos repartidos entre as duas
(`DESIGN.md`, Tipografia).

**Medi os nove HTML: zero declarações de `font-family`.** Uma pilha de sistema
só, no `body`:

```
font: 16px/1.4 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
      Roboto, "Helvetica Neue", Arial, sans-serif
```

E **154** declarações de `font-variant-numeric: tabular-nums` (medi), que é o
mecanismo que substitui a monoespaçada: o número alinha em coluna **sem** trocar
de família.

**A única exceção nos nove, e é a certa:** `.board` em `aula.html` —
`font: 13px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace` — que é o quadro
do box transcrito. Ali o monoespaçado **é o conteúdo**: é a reprodução de uma
lousa escrita à mão, com colunas alinhadas por espaço.

**A decisão: uma família, e o dígito tabular no lugar da monoespaçada.** Três
razões, e duas são medidas neste produto:

1. **O app não baixa fonte nenhuma hoje e não pode começar.** `index.html` não
   carrega fonte externa (conferi), e `src/tokens.css` declara Space Grotesk e
   IBM Plex Mono com `system-ui` e `ui-monospace` de reserva — isto é, **no
   iPhone do dono, sem as fontes instaladas, o app já cai na pilha do
   sistema hoje.** A família "do sistema" não é mudança: é o que ele já vê.
2. **A razão do par era "eixo de contraste real"** (`DESIGN.md`): geométrica
   contra grotesca monoespaçada. `tabular-nums` entrega a parte que importava —
   dígito de largura fixa, para o número não dançar na coluna enquanto conta — e
   perde a parte que era identidade.
3. **E a perda é real, e eu a declaro:** o inegociável 5 ("rótulo mono em caixa
   alta é estrutura, nunca ênfase") **cai junto**, porque ele é um papel da
   monoespaçada. Sem mono, "rótulo de estrutura" passa a ser **caixa alta com
   tracking e peso**, no mesmo corpo de família, e isso é um canal mais fraco: a
   diferença entre rótulo e ênfase passa a depender só de tamanho e de tracking.
   **RECONCILIADO em 06/10:** o dono **confirmou a queda do inegociável 5 como
   uma das três** (decisão 12), com a nota *"sem herancas"*. **Esta ressalva foi
   derrubada:** o canal mais fraco é custo aceito, e não há exceção de mono para
   rótulo. **Ninguém mediu** se o canal novo se distingue em uso.

**Os dois tokens:** `--ins-fonte` (a pilha do sistema) e `--ins-fonte-quadro`
(`ui-monospace`, e **só** o quadro do box). Dois, não um, porque o quadro existe
e é conteúdo.

**O que vem de graça, e vale dizer:** `rem` (§4) é muito mais barato com uma
família de sistema do que com duas fontes baixadas, porque não há métrica de
fonte própria a reajustar a cada degrau de tamanho.

### 2.3 · "Nunca sombra" cai pela metade, e a metade que cai é uma só

**Inegociável 3:** *"Fio de 1px, não cartão… Nunca sombra. Nunca preenchimento
para 'agrupar'."*

**Medi:** as folhas de hoje têm **4** `box-shadow`, e **as quatro são fio
desenhado como sombra**: `inset 0 -1px 0 var(--ins-acid)` em `.rirbtn.on`,
`inset 0 -1px 0 var(--ins-border)`, `inset 0 -1px 0 var(--ins-acid)` e
`inset 0 0 0 1px var(--ins-text)` em `.cal-d.hoje`. **Zero sombra projetada.** A
regra é cumprida à risca.

Os nove HTML da D têm **58** `box-shadow` não-`none` (medi). A maioria é a mesma
coisa — `inset 0 0 0 1.5px <cor>`, fio desenhado como sombra, em pílula de
estado. **Mas há uma sombra projetada de verdade, e ela é da folha:**

```
.sheet { box-shadow: 0 -12px 40px rgba(0,0,0,.22) }
```

Mais `0 2px 8px rgba(0,0,0,.35)` no puxador da cortina e
`0 2px 14px rgba(0,0,0,.55)` como `text-shadow` no número do anel.

**A decisão: `inset` continua permitido e sombra projetada entra em UM lugar
só — a folha —, e a razão é de camada e não de estilo.** A folha é
`position: fixed` cobrindo a tela, e o que precisa ficar visível é **onde ela
acaba e onde o conteúdo de baixo começa**. Hoje isso é resolvido com `--ins-veu`
atrás dela; a sombra de 12 px acima da borda de cima é o segundo canal da mesma
informação, e com `--ins-raio-5` nas quinas de cima ela diz "esta coisa está por
cima". **As outras duas saem:** o puxador da cortina e o número do anel ficam com
o seu limite desenhado (borda, ou a diferença de cor contra `--ins-foto-fundo`),
porque ali a sombra é só para destacar de cima de uma fotografia, e fotografia é
o único lugar do app onde a cor de fundo é desconhecida — a resposta certa para
fundo desconhecido é **contorno**, não sombra.

**"Nunca preenchimento para agrupar" fica, e aqui o número é incômodo:** medi em
§1.5 que `--ins-superficie-2` difere de `--ins-tela` por **1,08:1** no claro e
1,27:1 no escuro. A direção usa esse preenchimento para agrupar em **muitos**
lugares (`.row`, `.sk`, `.kp button`, `.acts button`). **Então o preenchimento
quase não agrupa — e é exatamente o R-D7 da auditoria**, que mediu 32 controles cujo
único canal é esse preenchimento, a 1,08:1 a 1,20:1. A resposta está em §5.5 e
em §1.5: **onde o preenchimento é o único canal de um controle, ele ganha
`--ins-fio-controle` de 1,5 px.** O inegociável 3 fica inteiro nesta parte, e
consertar o R-D7 é cumpri-lo.

### 2.4 · O acento troca de cor e continua significando

**Inegociável 4:** *"Um acento, e ele significa. Ácido = agora / feito / seu /
aperte aqui. Âmbar = preste atenção. Coral = destrói dado. No máximo um elemento
ácido COMPETINDO em cada região da tela, e nunca ácido por comparação favorável."*

O acento passa de **ácido `#CBF35E`** (verde-limão) para **`#3833DB` / `#9E9BFF`**
(índigo). A estrutura fica: um acento, âmbar de atenção, e um terceiro sinal.
**O que muda é o significado do terceiro** (§1.3): de "destrói dado" para "pare".

> **RECONCILIADO em 06/10 · CONFIRMADO pelo dono** (decisão 13 das quinze): o
> terceiro sinal **muda para "pare"**, e *"a palavra carrega a diferença de
> 'destrói dado'"*. **Era recomendação deste documento (§1.3) e passou inteira.**
>
> **E ela tem uma consequência que a frente 3 nomeou:** com a cor deixando de
> dizer "destrói dado", a frase ***"Isso não tem volta"*** deixa de ser
> redundância e **passa a ser canal** — é ela que carrega a diferença agora.
> A frente 3 também conferiu os 23 `confirm()` do app e achou que **só nove
> destroem dado que o aparelho não reconstrói**: pintar os 23 de "pare" mataria o
> painel.

**As duas metades que ficam valendo sem emenda**, e as duas são as que mais
custam:

- **No máximo um elemento de acento competindo por região.** Esta é a que não tem
  caso de teste e não vai ter: ela é de composição, não de fonte. Fica no
  documento e no olho de quem revisa.
- **Nunca acento por comparação favorável.** "Melhor que antes" é elogio, e o app
  não comemora por cor — `MARCA.md`, `PRODUCT.md` e `DESIGN.md` dizem a mesma
  coisa em três lugares, e `docs/design-review/05-movimento.md` estendeu a
  proibição de comemorar a "quadro e curva, não só frase". **Vale para o índigo
  igual: a seta que sobe no gráfico de força não é da cor do acento.**

### 2.5 · O que fica inteiro

**Inegociável 6, "quase nenhum movimento", fica — e é a seção 8, que é onde ele
sangra.**

E uma coisa que a direção faz melhor do que o app e que eu quero deixar escrita,
porque é a única das seis onde a troca é ganho de graça: **a direção não usa
`backdrop-filter`.** Medi: zero nos nove arquivos, e zero `will-change`, zero
`contain`, zero `perspective`. As folhas de hoje têm duas ocorrências da palavra
`backdrop-filter` e **as duas são comentários dizendo que ele não é usado**, com
a razão escrita: *"Sem backdrop-filter: pisca no Blink ao rolar e o sistema não
tem vidro"* (`.ins-tabbar`) e *"opaco: o conteúdo passa POR BAIXO e precisa
sumir, não borrar"* (`.tc-topo`). **É a preferência global do dono, e os dois
lados já concordam com ela.** Fica como está: **zero vidro**, e o fundo
compensado com opacidade cheia.

E a consequência de camada vem junto, porque é o caso *nada entre a folha e a
janela cria bloco de contenção*: **zero `transform`, `filter`, `perspective`,
`backdrop-filter`, `will-change` e `contain` em `html`, `body`, `:root`, `*` e
`#app`.** A direção já cumpre (medi: o único `#app` dela declara
`position`, `height`, `width`, `overflow` e `background`). O caso vai inteiro.

---

## 3 · A escala

### 3.1 · Espaço: 93% da direção já cai na escala de hoje

**Medi todos os `padding`, `margin` e `gap` dos nove HTML: 2.599 ocorrências de
valor em px.** Contra a escala que o caso *espaço vertical fica na escala de 4*
já aceita — `1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34, 46` mais as quatro
exceções `3, 5, 9, 17`:

| | ocorrências |
|---|---:|
| **dentro da escala** | **2.410 (93%)** |
| fora | 189 (7%) |

**Os nove valores que ficam fora**, com a contagem de cada:
`7px` (26), `11px` (48), `13px` (29), `15px` (1), `18px` (16), `28px` (23),
`30px` (8), `36px` (6), `40px` (24), `56px` (8).

**Isto é a melhor notícia deste documento.** A escala de espaço do sistema velho
e a da direção nova são quase a mesma escala, e nove valores em 2.599 é o que
separa as duas. **Decisão: a escala fica exatamente como está**, e os 189
ocorrências fora dela são realocadas para o degrau vizinho:

| fora | vai para | quem usa, e o que muda |
|---|---|---|
| `7px` | **6** | `.cellb{padding:1px 7px}` e `gap:7px`. É o alvo de corrigir no lugar; 1 px de cada lado |
| `11px` | **12** | `.warn{padding:11px 13px}`, `.board`, `.kp`. Um pixel |
| `13px` | **12 ou 14** | idem |
| `18px`, `15px` | **16 ou 20** | — |
| `28px`, `30px`, `36px` | **26 ou 34** | são vãos de seção |
| `40px`, `56px` | **34 ou 46** | `46` já está na escala e é o token de toque |

**O que isto custa, dito:** nenhuma mudança passa de 2 px por declaração. **Não
medi se a soma delas muda a altura de alguma tela** — é olho em tela, e a lição
que motivou o caso está escrita nele: *"Valor solto no meio não quebra nada
visivelmente; só vai afrouxando o ritmo até a tela ficar 20% mais alta sem
ninguém saber por quê. Foi o que aconteceu."* **Então a realocação se faz uma
vez, com a tela aberta ao lado, e não a cada regra.**

**E os buracos de §0.2 se consertam na mesma gravação**, porque sem eles a
medição acima é a última vez que alguém sabe o número: o caso passa a ler as
cinco folhas (não três), a cobrar os longhands laterais e de eixo, a aceitar
decimal sem lê-lo errado, e a não atravessar `}`.

### 3.2 · Tipo: a direção não tem escala, e o app tem

**Medi os nove HTML: 28 tamanhos distintos**, incluindo meio pixel — 10,5, 11,5,
12,5, 13,5, 14,5 e 15,5 — e todos os inteiros de 11 a 26. **Isso não é escala, é
contínuo.** Na soma: 1.173 declarações de tamanho dentro do telefone.

**O app tem escala**, e é a melhor coisa que o sistema velho entrega para esta
frente: `DESIGN.md`, Tipografia, com **16 papéis**, cada um com fonte, tamanho,
peso e tracking, e com os pisos escritos:

> *"Pisos: nunca abaixo de 9px em rótulo mono, 13px em prosa, 16px em campo de
> texto (Safari), 15px em nome tocável."*

**A escala nova, derivada da distribuição medida da direção** — cada degrau
nasce do aglomerado maior da faixa, e o número de usos está ao lado para mostrar
que o degrau não foi escolhido por simetria:

| papel | px | usos medidos na faixa | quem pinta com ele, na direção |
|---|---:|---:|---|
| `--ins-t-rotulo` | 11 | 48 + 15 (11,5) | `.tab` (o rótulo da barra), `.foto .tag`, `.cort .mk`, `.hip` |
| `--ins-t-meta` | 12 | 157 + 41 (12,5) | `.alvo`, `.also-l`, `.dl .nm small` — meta e **procedência** (§7) |
| `--ins-t-apoio` | 13 | 223 + 12 (13,5) | `.ask p`, `.band2 .tx` — prosa de apoio |
| `--ins-t-corpo` | 14 | **274** + 3 (14,5) | `.band>p`, `.chip`, `.acts button` — **o degrau mais usado da direção** |
| `--ins-t-corpo-forte` | 15 | **154** + 10 (15,5) | `.ask>b`, `.cheia .vz`, `.ag-d .hr` |
| `--ins-t-nome` | 17 | 27 + 21 (16) + 9 (18) | `.cellb`, `.ref td`, `.band>b`, `.opt b`, `.primary` |
| `--ins-t-titulo` | 20 | 25 + 10 (19) + 21 (21) | `.sh-t`, `.sheet h3`, `.ghost`, `.nav h2` |
| `--ins-t-tela` | 24 | 18 (24) + 17 (23) + 18 (25) | `.ag-d`, `.ex`, `.now h3`, `.kp button` |
| `--ins-n-m` | 26 | 10 + 9 (22) | `.rep` — **o número da régua** — e `.rir button` |
| `--ins-n-l` | 34 | 11 | `.rest-t` (o descanso), `.band2 .n2` |
| `--ins-n-xl` | 40 | 9 + 6 (38) | `.disp b` (o visor do teclado próprio) e `.big .n1` (o número que a tela é sobre, em Corpo e Semana) |

E a família da **foto em tela cheia**, que tem escada própria porque é lida **a
três metros** (é a situação C7: sozinho, longe do aparelho, sem alcançá-lo — e a
auditoria registra que ninguém mediu se ele lê a tela a essa distância):
`--ins-n-foto-1: 32px`, `-2: 44px`, `-3: 76px` — `.cheia .giant.sm`,
`.cheia .giant` e `.cheia .ring b`. **Três degraus, 18 declarações medidas, e
nenhum deles encolhe**, porque encolher o número que ele lê de longe é a única
mudança desta seção que teria custo conhecido.

**Doze papéis mais três de foto, de 28 tamanhos.** Quatro dos doze são número,
e eles existem separados porque o número é o que o produto é sobre.

**O que a redução custa, e eu digo com números medidos:**

| movimento | declarações | quais |
|---|---:|---|
| meio pixel | **88** | 10,5 · 11,5 · 12,5 · 13,5 · 14,5 · 15,5 |
| um pixel | **96** | 16→17 (21), 18→17 (9), 19→20 (10), 21→20 (21), 23→24 (17), 25→24 (18) |
| dois pixels | **15** | 22→24 no `.rir button` (9) e 38→40 no `.big .n1` (6) |
| nenhum | **18** | a família da foto, que fica |

**Não medi se alguma delas quebra uma linha** — um nome que cabia em 23 px e não
cabe em 24 quebra para a segunda linha, e isso é layout, não aritmética. É a
única parte desta seção que precisa de olho em tela, e o lugar mais provável é
`.ex` e `.now h3` (25→24, que **encolhe**, então não quebra) contra `.ag-d` e
`.go` (23→24, que **cresce**).

**E o piso sobe, porque três declarações de hoje estão abaixo do piso escrito do
próprio projeto.** Medi nas folhas de hoje:

| | tamanho | quem |
|---|---:|---|
| `.chart .axu` | **7,5px** | a unidade do eixo do gráfico |
| `.cal-h` | **8,5px** | o cabeçalho de dia da semana no calendário (S T Q Q S S D) |
| `.cal-d .per` | **8px** | o marcador de período no dia do calendário |

O piso escrito é **9px em rótulo mono**. Estas três estão abaixo dele, e **nenhum
dos 38 casos olha tamanho de fonte fora de `input, textarea, select`.** A regra
existe, está escrita, e não tem rede.

> **Requisito 4 · O piso é 11px, e ele tem rede.** `--ins-t-rotulo: 11px` é o
> menor degrau, e nada desce abaixo dele. **Uma exceção, declarada:** texto
> dentro de `<svg>` de gráfico pode ir a **9px**, porque ali o texto é eixo
> — lido de perto, sentado, com o número grande ao lado dizendo a mesma coisa —
> e porque o degrau de 11 px no eixo rouba largura da área de desenho. A exceção
> é por seletor e com a razão na própria regra, como o projeto já faz com os
> chips que param em 37 e 41 px de alvo (`DESIGN.md`, Toque).
>
> **O caso que falta:** nenhum tamanho de fonte abaixo de 11px nas folhas, exceto
> dentro de uma regra que case `svg` ou `.chart`. Hoje ele ficaria **vermelho**
> em três lugares, e é por isso que ele vale.

**E uma nota de leitura, para a próxima pessoa não "consertar" o que está
certo:** medi que **183 das 221** declarações de tamanho nas quatro folhas de
regra estão abaixo de 16px. **Isso não é defeito** — a escala do projeto põe o
piso da prosa em 13 e o do rótulo em 9, de propósito, e 16px é o piso de
**campo de texto**, por causa do zoom do Safari. O que é defeito é outra coisa, e
está em §4.

---

## 4 · O texto a 200% — a decisão mais consequente deste documento, e ela é minha

A frente 2 mediu que `rem` aparece **zero** vezes nas folhas e concluiu que o
texto a 200% está "bloqueado em quatro camadas, de propósito". **Conferi as
quatro, medi a quinta, e achei que a razão escrita que sustenta a primeira é
falsa.**

### 4.1 · As camadas, conferidas — e a frase do fonte que o projeto desmente

| | camada | onde | o que o fonte diz |
|---|---|---|---|
| 1 | `maximum-scale=1, user-scalable=no` | `index.html` | *"o zoom do navegador não existe aqui. O Safari os ignora numa aba comum, mas os **respeita instalado na tela de início**, que é o único jeito como este app é usado"* |
| 2 | `touch-action: pan-x pan-y` na raiz | `src/base.css`, regra `html` | *"os únicos gestos dele nesta página são rolar. Some o zoom por toque duplo e some o de pinça"* |
| 3 | `gesturestart`, `gesturechange`, `gestureend` recusados com `passive: false` | `src/main.jsx` | o Safari implementa a pinça como gesto próprio, acima do `touch-action` |
| 4 | **zero `rem`** | as **seis** folhas | nada escrito: é consequência, não decisão declarada |

**Confirmei a quarta e estendi:** medi `rem` em `tokens.css`, `base.css`,
`componentes.css`, `treino.css`, `protocolo.css` **e `palco.css`** — **zero nas
seis**, e **toda** `font-size` e todo atalho `font:` em px, nas seis. O briefing
está certo, e vale para a sexta folha também.

**A quinta, que não é camada — é a ausência de controle.** O manifesto declara
`"display": "standalone"` (conferi, `public/manifest.webmanifest`). Instalado na
tela de início, **não existe interface de navegador**: não há o menu "aA" do
Safari, não há zoom de página, não há ajuste de tamanho de texto. **Mesmo que as
quatro camadas não existissem, não haveria onde tocar.** Isto é o argumento
decisivo desta seção, e nenhum documento do redesenho o nomeou.

> **RECONCILIADO em 06/10 · a razão escrita da CAMADA 1 também é falsa, e isto
> foi MEDIDO no aparelho.**
>
> O comentário de `index.html` citado na tabela acima afirma que o Safari
> *"respeita instalado na tela de início, que é o único jeito como este app é
> usado"*. **O dono mediu em 06/10: no PWA instalado, a PINÇA FUNCIONA.** Então
> `user-scalable=no` **não é honrado ali** — e, com ele, nem o `touch-action` da
> camada 2 nem a recusa dos eventos de gesto da camada 3 impedem a pinça nessa
> configuração, que é como o app é usado.
>
> **Isto fecha a única medição que §4.4 e §11.6 deixaram pendente** (*"é uma
> passada de dez segundos — pinçar a tela no app instalado — e ela decide se a
> camada 1 faz algo ou é decoração"*). **A resposta é: ali é decoração.** O que
> as três camadas ainda alcançam é o Safari **fora** da tela cheia.
>
> **E a decisão do dono é MANTER as três** (decisão 11), com nota literal:
> *"nem precisa desse argumento de mao suada. nao quero esses zoom automatico e
> pronto. nao gosto."* **As duas coisas ficam registradas: a decisão e a medição
> de que ali ela não faz efeito.**
>
> **E a nota dele aponta para outro mecanismo, que é real:** o que ele recusa é o
> zoom **automático** — o salto que o Safari dá ao focar campo com fonte menor
> que 16px —, e **isso é impedido pela regra dos 16px no campo**, que tem razão
> própria e correta, **não** pelo `user-scalable=no`.
>
> **A frase falsa da camada 2 já foi corrigida no fonte** (`d625147`), e o
> comentário novo de `src/base.css` diz as duas correções. **O comentário de
> `index.html` continua afirmando o que a medição desmentiu** — é conserto de
> comentário em `src/`, e esta reconciliação não toca em `src/`. Fica apontado.

**E a sexta declaração, que parece camada e não é:** `text-size-adjust: 100%`
em `html`, com a razão escrita — *"Safari infla texto ao girar para paisagem.
Isto desliga."*. A auditoria de acesso já leu isto certo: ela *"só desliga a
inflação automática do Safari e não impede o usuário de ampliar"*. **Não conto
como bloqueio**, e a direção D usa a mesma declaração.

**Agora o que não bate, e é o achado desta seção.** A camada 2 traz a razão de
ser do bloqueio inteiro, escrita em `src/base.css`:

> *"O que se perde é a pinça para enxergar melhor. É aceitável aqui porque
> **nenhum texto do app é menor que 16px** e a leitura não depende dela — e porque
> zoom acidental no meio de uma série, com a mão suada, custa mais que zoom
> deliberado ganha."*

**A frase do meio é falsa, e o próprio projeto a desmente em outro arquivo.**
`DESIGN.md`, Tipografia, escreve os pisos: *"nunca abaixo de 9px em rótulo mono,
13px em prosa, 16px em campo de texto (Safari), 15px em nome tocável."* Isto é,
o sistema **manda** texto de 9 px. E medi as quatro folhas de regra:

- **221** declarações de tamanho de texto (`font-size` mais o atalho `font:`);
- **183 delas abaixo de 16px** — 83%;
- o menor é **7,5px** (`.chart .axu`), e há **8px** (`.cal-d .per`) e **8,5px**
  (`.cal-h`), que estão abaixo do piso de 9 px do próprio documento;
- a distribuição: 9px em **30** declarações, 10px em 39, 11px em 33, 13px em 23,
  15px em 18.

**Então 83% do texto deste app é menor que 16px, e três declarações são menores
que o piso que o projeto escreveu para si.** A frase de `base.css` é de quando o
campo de texto era o único texto em que alguém pensou — o 16 px dela é o piso do
Safari para campo, não o piso do app —, e ela ficou sustentando uma decisão que
ela não sustenta.

**Isto não é defeito de tipografia.** O sistema tem rótulo de 9 px de propósito,
e `DESIGN.md` explica por quê. **É defeito de justificativa:** a única razão
escrita para bloquear o zoom é uma afirmação de fato, e o fato é outro.

### 4.2 · A decisão: `rem` no tipo, `px` na geometria, e um controle em Ajustes

**O sistema novo usa unidade relativa. Sim.** E usa de uma forma só, com uma
exceção nomeada.

> **Requisito 5 · Tipo em `rem`, geometria em `px`.**
>
> - **Todo token de tipo é `rem`**, com a raiz em 16 px: `--ins-t-rotulo:
>   0.6875rem` (11), `--ins-t-meta: 0.75rem` (12), `--ins-t-apoio: 0.8125rem`
>   (13), `--ins-t-corpo: 0.875rem` (14), e assim por diante. Em 100% a tela é
>   pixel por pixel o que a direção desenhou.
> - **Toda geometria continua `px`**: espaço, raio, largura de fio, `--ins-tap`,
>   `--ins-tap-dense`, as alturas derivadas, e `env(safe-area-inset-*)`, que é px
>   por natureza.
> - **Ajustes ganha um controle de tamanho de texto, de três degraus**, ao lado
>   da troca manual de tema — que é onde a frente 1 já pôs a decisão D10
>   (§1.6 dela). Ele escreve `font-size` na raiz: **100% (16px) · 112,5% (18px) ·
>   125% (20px)**. É um valor guardado, como o tema.
> - **A pinça continua recusada**, com as três camadas intactas. **A razão
>   escrita em `src/base.css` é reescrita na mesma gravação**, porque a que está
>   lá é falsa.

**A razão nova, escrita para não precisar deste documento:**

> *O gesto de pinça fica recusado porque, de pé, com a mão suada, entre duas
> séries, pinçar por acidente custa mais do que pinçar de propósito ganha — e
> isso é medida de uso deste app, não preferência. O que o produto deve em troca
> é o que a pinça daria: texto maior. Como o app é instalado na tela de início
> (`display: standalone`), **não existe interface de navegador para ampliar**;
> então quem entrega texto maior é o próprio app, por Ajustes, em três degraus,
> e é por isso que todo token de tipo é `rem` e nenhum é px. Tipo em `rem`,
> geometria em px: o texto cresce, o alvo não encolhe e a área segura não se
> move.*

**O que cada degrau entrega, em conta:**

| token | 100% | 112,5% | 125% |
|---|---:|---:|---:|
| `--ins-t-rotulo` (11) | 11,00 | 12,38 | **13,75** |
| `--ins-t-meta` (12) | 12,00 | 13,50 | **15,00** |
| `--ins-t-apoio` (13) | 13,00 | 14,63 | **16,25** |
| `--ins-t-corpo` (14) | 14,00 | 15,75 | **17,50** |
| `--ins-t-nome` (17) | 17,00 | 19,13 | **21,25** |

**Conta.** No degrau de cima, o rótulo de 11 px chega a 13,75 e a prosa de apoio
passa de 16 px. **Medi quantas declarações da direção isso alcança:** os três
degraus menores — 11, 12 e 13, somados aos meios-pixels que caem neles — são
**496 das 1.173** declarações de tamanho dentro do telefone, **42%**. É onde o
problema está e é onde o controle chega.

### 4.3 · O que isto NÃO entrega, dito com todas as letras

**Isto não satisfaz 1.4.4.** O critério pede 200% sem perda de conteúdo nem de
função, e o controle para em 125%. **Eu escrevo contra um critério de
acessibilidade conhecido, e a razão é esta:**

**A 200% a régua perde função, e o número é da frente 2.** `.rep` tem 54 px de
largura fixa e o número dentro dela é de 26 px. A 200% o número vai a 52 px e o
botão teria de crescer com ele; a frente 2 fez a conta e a 200% a régua mostra
**2** valores em vez de 6 (§8.5 dela). **Dois de doze não é "texto maior": é a
ação mais frequente do produto, 48 vezes por semana, deixando de funcionar.**

**E a 125% ela já aperta.** 26 px a 125% são 32,5 px, e dois dígitos tabulares a
32,5 px não cabem em 54 px de botão. Daí a exceção:

> **A exceção nomeada: `--ins-n-m` — o número da régua e o do RIR — é `px`, não
> `rem`.** A razão: a geometria da régua é a medida mais caro do redesenho
> inteiro (6 de 12 valores alcançáveis, 714 px de conteúdo em 382 px de tela,
> frente 2 §1.1), e crescer o número força crescer o botão, que encolhe a janela,
> que piora o defeito que a frente 2 está consertando. **E o número da régua é de
> 26 px**: não é texto pequeno, é o maior numeral de um controle no app. Ele não
> precisa do controle de tamanho. Os outros três números — `--ins-n-l` (34),
> `--ins-n-xl` (40) e a família da foto — pela mesma razão: já são grandes, e os
> três vivem em caixa de altura fixa.

**Então o que o produto entrega é isto, e é o que eu defendo:** o texto **de
leitura** vai a 125% e o texto **de número** fica. Quem precisa de 200% para ler
não é atendido, e **isso é um custo declarado, não um esquecimento.**

**O que sobe à mesa dele** (§11): se 125% é pouco, o caminho de verdade para
200% existe e tem um preço nomeado — a régua deixa de ser faixa de botões de
largura fixa e passa a ser outra coisa, que é a decisão que a frente 2 pôs na
mesa dele em §1.6 dela. **As duas perguntas são a mesma pergunta**, e é bom que
ele decida as duas juntas.

> **RECONCILIADO em 06/10 · 125% CONFIRMADO, e ele decidiu as duas juntas — como
> este documento pediu.**
>
> **Decisão 10 das quinze:** o teto do texto grande é **125%**, *"e fica escrito
> que não cumpre 1.4.4"*. **É exatamente a recomendação de §4.2 e a declaração de
> §4.3, aceitas como escritas** — inclusive a parte de escrever contra o
> critério, que é a coisa mais desconfortável deste documento.
>
> **E a régua, que era a outra metade da mesma pergunta** (decisão 9): ele
> **pré-autorizou** a troca para os botões fixos da Direcção C **se a medição A da
> frente 2 reprovar**. É condicional, e **a medição ainda não aconteceu** — ela
> exige o aparelho e o dedo dele. **Então o caminho para 200% não está fechado:
> ele está amarrado a um resultado que ninguém tem.** Se os botões fixos
> entrarem, a geometria que trava o teto em 125% muda, e **a pergunta "125% é
> pouco?" volta a fazer sentido** — com um número na mão, em vez de uma hipótese.
>
> **A exceção nomeada (`--ins-n-m` em px) continua valendo**, e a razão dela é
> geométrica, não de critério: ela não depende de qual controle vence.

### 4.4 · O que quebra, e o que ninguém mediu disso

**Quebra certo, e é conserto na mesma gravação:**

1. **Os 183 valores em px viram `rem`.** É varredura, não desenho.
2. **O caso *o campo nunca fica abaixo de 16px*.** Ele casa
   `font-size:\s*16px` literal em `input, textarea, select`. Com `rem`, a regra
   passa a ser `font-size: 1rem`, que **em 100% é 16px e nos outros dois degraus é
   mais** — isto é, a regra fica mais forte e o caso fica **vermelho**. A asserção
   passa a cobrar `font-size: 1rem` (ou `>= 1rem`), com a razão reescrita: o que o
   Safari exige é 16 px **computado**, e `1rem` com a raiz em 16 px é exatamente
   isso, com o piso subindo junto do controle.
3. **`.cal-h` a 8,5px, `.cal-d .per` a 8px e `.chart .axu` a 7,5px** sobem para
   o piso de 11 px (ou para a exceção de 9 px dentro de `svg`, §3.2).

**Não medido, e eu não invento número:**

- **Se alguma linha quebra a 112,5% e a 125%.** Cada nome fica 12,5% e 25% mais
  largo e a largura da tela não muda. O lugar mais provável é a linha do dia no
  Agora e a tabela do exercício, que já têm quatro colunas em 382 px. **É olho em
  tela, e está na medição G.**
- **Se o controle em três degraus basta.** Ninguém mediu se o dono precisa de
  texto maior. `04-acesso.md` §7 registra: *"As necessidades de acessibilidade
  do dono — o repositório não as registra."* Então este requisito **não** nasce
  de necessidade medida dele: nasce de piso para qualquer usuário, que é a
  decisão P3/D8 ("nada usa a rotina do dono como regra").
- **Se `user-scalable=no` continua honrado instalado.** O comentário do
  `index.html` afirma que sim, e eu **não** medi no aparelho. É uma passada de
  dez segundos — pinçar a tela no app instalado — e ela decide se a camada 1 faz
  algo ou é decoração. Entra na medição G.

### 4.5 · Os dois protocolos: 320 px e 200%, e cortado não é rolável

A frente 2 escreveu os dois (§8.4 e §8.5 dela) e eu os herdo. **Acrescento o que
é meu, e é a distinção que a frente 2 nomeou e que vale repetir porque ela muda o
que se olha:**

> **A 320 px, conteúdo largo demais não ganha barra de rolagem: ele desaparece.**
> `body { overflow-x: clip }` está em `src/base.css` com a razão escrita (matar o
> rubber-band e proteger o `sticky`), e há caso que o segura — *nenhum ancestral
> do sticky vira scroll container*. **`clip` corta sem rolar.** Então a 320 px
> o critério 1.4.10 **passa** (não há rolagem de página) e o dono **perde função**
> (há conteúdo inalcançável). **É melhor para a norma e pior para ele.**

**Medição G · o texto grande e a tela estreita, na mesma passada.** Não exige o
aparelho dele; exige uma janela de navegador e olhar. Eu não a executei.

**Para cada estado dos nove HTML, em cada um dos dois temas:**

| passada | janela | tamanho de texto |
|---|---|---|
| G1 | 414 × 896 | 100% (controle) |
| G2 | 414 × 896 | 112,5% |
| G3 | 414 × 896 | 125% |
| G4 | 414 × 896 | **200% de zoom de página** (o que 1.4.4 pede, para saber se dá) |
| G5 | **320 × 568** | 100% |
| G6 | 320 × 568 | 125% |

**Em cada passada, anotar quatro coisas, e a terceira é a que a frente 2
destacou:**

- (a) existe rolagem horizontal **da página**? → é violação de 1.4.10;
- (b) algum texto **sobrepõe** outro?
- (c) existe conteúdo **cortado e inalcançável**? → **não** é violação de 1.4.10,
  porque `clip` não rola, **e é perda de função.** As duas respostas vão em
  colunas separadas, e uma linha pode ter (c) sem ter (a);
- (d) algum controle sai da tela **sem caminho até ele**?

**Rodar nos estados que a conta prevê apertados:** a régua (a 320 px cabem
**4** botões e não 6 — `(320 − 32 − 54) ÷ 60 = 3,9`, **conta da frente 2**), a
fileira de três botões de `.acts`, a barra dos cinco lugares, a tabela do
exercício com quatro séries, os cinco campos da bioimpedância, e a frase de
leitura de volta da folha de pôr em dia, que é longa e cresce com o número de
refeições.

**O número que reprova:** **1 ou mais** respostas (a), (b) ou (d) em G1, G2, G3,
G5 e G6. Sem tolerância, porque não é estatística. **G4 é informativa**: ela
responde se 200% seria possível, e o resultado dela é o que sustenta ou derruba
a decisão de §4.2 — se a tela sobreviver a 200% inteira, o controle de três
degraus é teto escolhido e não teto necessário, e isso volta à mesa dele.

**E a resposta (c) não reprova nada: ela vira lista.** Cada conteúdo cortado e
inalcançável é uma linha com o estado, a janela e o que desapareceu. **A decisão
de cada linha é de desenho, não de sistema**, e é daí que sai se aquele estado
precisa de outra forma a 320 px ou se 320 px não é um alvo deste produto.

~~**O que decide se 320 px é alvo:** ninguém mediu.~~ O contrato de UX vigente
põe 320 px no checklist de tela nova (frente 2 §8.4), o aparelho do dono tem
414 px, e o segundo usuário não existe no dado (`PRODUCT.md`, e `07-plano.md`
§4).

> **RECONCILIADO em 06/10 · DECIDIDO: o alvo é 414, e 320 px fica declarado
> fora.**
>
> Ele respondeu primeiro *"primeiro a medição, depois ele decide"* (decisão 15) e,
> na noite do mesmo dia, **delegou a decisão ao coordenador** — "seguindo o
> contexto" (pergunta 8 das oito). **O contexto usado foi:** o aparelho dele tem
> **414 px**; o segundo usuário **não existe no dado**; e a frente 3 achou, **por
> conta e não por medição**, que o nome **"Prescrição" encosta na fatia da aba a
> 320 px já a 100% de texto** — 63,8 pt calculados numa fatia de 64 pt (§1.6
> dela, que diz *"Isto é conta, não medida"*). Atender 320 obrigaria a renomear
> um dos cinco lugares por um usuário que ainda não existe.
>
> **A invariante barata FICA, e ela é o que impede o estrago:** **nada pode ter
> largura fixa maior que a tela, e a página nunca rola na horizontal.** A rede já
> testa isso e custa zero.
>
> **O que isso faz com a medição G:** **G5 e G6 deixam de ser portão.** As duas
> passadas de 320 px continuam válidas como medição **opcional**, e o que elas
> produzem é **a lista do que quebraria** se um segundo usuário chegasse num
> telefone pequeno. **O custo fica conhecido e declarado, não esquecido.**
> **G1, G2 e G3 continuam portão** — são as passadas de 414 px, que é o alvo. E
> **G4** é informativa, como esta seção já dizia.
>
> **E a distinção que abre esta seção continua sendo a parte mais útil dela:**
> **cortado não é rolável.** `clip` corta sem rolar, e isso vale a 414 px
> também — não era um fato sobre 320.
>
> **O contrato de UX vigente continua pedindo 320 px no checklist de tela nova, e
> esta decisão o contraria.** Quem reescrever o contrato tem de tirar 320 px do
> checklist e pôr a invariante no lugar. **Ninguém fez isso ainda.**

---

## 5 · O alvo e o foco

### 5.1 · Os três degraus, e eles já são token com razão escrita

Nada a inventar aqui: `src/tokens.css` já traz os dois valores **com a medida
que os motivou escrita ao lado** (conferi):

```css
--ins-tap: 46px;        /* controle numérico repetido; 46 e não 44 de propósito:
                           ele usa de pé, suado, com uma mão */
--ins-tap-dense: 28px;  /* 28px é DESENHO, não alvo: … Quem usa este degrau
                           estende a ÁREA por ::after até 44 no mínimo */
```

E `docs/LASTRO_UX_CONTRACT.md` §11 fecha: *"Alvo ≥ 24×24 (norma); ≥ 46 px para
controle repetido (padrão interno)."*

**A régua desta frente, e ela é a da frente 2 (§8.2 dela), confirmada:**

| degrau | quando | mecanismo |
|---|---|---|
| **46 px de alvo** | controle **repetido**: a régua, o `.cellb`, a caixa de marcar da linha do dia, o RIR, o mapa da sessão, as cinco abas | desenho de 46, **ou** desenho menor com `::after` levando o alvo a 46 |
| **44 px de alvo** | controle não repetido dentro de linha cheia | `::after` com `inset` negativo |
| **24 × 24** | o mínimo da norma (2.5.8 AA). **Nada deste app desce até aqui** | — |

**E o mecanismo é o que o repositório já tem e já cobra:** `::after` com
`position: absolute` e `inset` negativo, estendendo a área sem mexer no desenho
— é o caso *controle pequeno estende o ALVO sem crescer o desenho*, com onze
seletores presos nele e a medida que o motivou escrita no teste: *"o descanso, a
anotação, o aquecimento e o RIR ficavam entre 34 e 40px — todos apertados de pé,
com uma mão, entre uma série e outra."*

### 5.2 · `.cellb`: 22 px, e a decisão é que ele cresce — por `::after`, para cima e para baixo

A frente 2 o achou e fez a conta: `padding: 1px 7px; font-size: 17px` dentro de
`.ref td { line-height: 1.2 }` → `17 × 1,2 + 1 + 1 ≈ 22 px` de altura. **Refiz a
conta do fonte e ela fecha** (`prototipo.html:94`, `:89`). É o menor alvo
interativo da direção inteira, 8 px abaixo do pior que a auditoria achou, e
**nunca foi auditado porque nasceu depois da auditoria** — `04-acesso.md` é de
02/10 e o `prototipo.html` é de 04/10 (conferi as datas).

**Fui ler o gerador dele, e achei duas coisas que a frente 2 não tinha**
(`prototipo.html:635-636`):

1. **A célula tem duas linhas, não uma.** O `<td>` leva o botão **e** um
   `<small>` embaixo: `'<small>'+(d.rir==null?'sem RIR':'RIR '+d.rir)+' · '+hhmm(d.at)+'</small>'`
   — o RIR e o horário da série. `.ref td small` é `display:block; font-size:12px`
   (`:90`). Então a conta da **célula** é outra: `6 px` de `padding-top` +
   `22,4 px` do botão + `≈16,8 px` do `<small>` + `6 px` de `padding-bottom`
   ≈ **51 px de linha**. **Conta.**
2. **Isso resolve o aperto, e resolve para baixo.** O alvo precisa crescer 24 px
   para chegar a 46; **ele tem 22,8 px de espaço só para baixo, dentro da própria
   célula** (o `<small>` mais o padding), e o `<small>` é texto sem controle. Para
   cima há 6 px de padding e depois `thead th` com `padding-bottom: 2px` (`:86`),
   também texto.

> **Requisito 6 · `.cellb::after { position: absolute; inset: -12px 0 }`.**
>
> - **46,4 px de alvo** (`22,4 + 24`), sem crescer um pixel do desenho. **Conta.**
> - **O segundo valor é zero, e não é detalhe:** o vizinho horizontal é o botão
>   da série **seguinte**, na mesma linha (`for(c=1;c<=cols;c++)` gera um `<td>`
>   por série). É literalmente a geometria do caso *o alvo do tick cresce só na
>   vertical*, com a razão que já está escrita lá: *"na horizontal o vizinho é a
>   repetição seguinte: crescer para o lado faria um toque na borda registrar o
>   número errado."* Aqui o erro é mais brando — abre a correção da série errada,
>   e a tela diz qual série é — mas continua sendo um toque jogado fora numa ação
>   que já é de correção.
> - **`.cellb` entra na lista do caso *controle pequeno estende o ALVO*.** Ele
>   está pior do que os quatro que motivaram aquela lista (34 a 40 px); com 22 px
>   ele é o caso mais forte que a regra já teve.
>
> **Por que não "a interação muda" e por que não "declara-se o custo":** mudar a
> interação significaria tirar o botão de dentro da tabela, e a correção no lugar
> é decisão do dono tocada no protótipo (descoberta 4). Declarar o custo
> significaria aceitar 22 px num controle repetido — um por série, até quatro por
> exercício, vinte por sessão de Treino A — enquanto o repositório tem o
> mecanismo pronto, testado, e com onze seletores já usando. **Não há terceira
> opção defensável.**

**E um achado que é meu e muda uma regra:** `.cellb.fix` — o estado "esta é a
série que está sendo corrigida" — é
`outline: 2px solid var(--accent); outline-offset: 2px` (`prototipo.html:95`).
**É exatamente a forma do anel de foco** (§5.5). Um `.cellb` focado por teclado
**e** em correção mostra o mesmo canal duas vezes, e quem navega por teclado não
tem como saber qual dos dois está vendo.

> **Requisito 7 · `outline` é do foco, e de mais nada.** O estado de correção usa
> outro canal: **preenchimento invertido** (o `.cellb` já é `background: tinta;
> color: tela`, então o corrigido fica vazado — borda de `--ins-fio-largura-2` em
> `--ins-acento`, fundo de `--ins-acento-suave`, texto em `--ins-acento-tinta`,
> que mede 8,09:1, §1.4). Forma, não só cor — é 1.4.1, e é a mesma disciplina que
> a frente 2 exigiu de `.rep.now` contra `.rep.last` (§5.2 dela).

### 5.3 · Os oito a exatamente 44, nomeados — e por que a conta é de classe

A frente 2 declarou "não medido: quantos alvos reprovam o padrão interno de
46 px", porque C3 contou contra 44 e ela achou **sete classes** a exatamente 44
sem contar instâncias.

**Medi, e são oito dentro do telefone, não sete.** A que falta na lista dela é
`.seg3 button`, que existe em seis dos nove arquivos:

| classe | altura | o que é |
|---|---:|---|
| `.ib` | 44 × 44 | o botão de ícone do cabeçalho — **inclusive a seta de saída da sessão** |
| `.lk` | 44 | o link em linha ("Ver o aparelho", "Desfazer") |
| `.chip` | 44 | o chip ("+1 copo") |
| `.pill` | 44 | a pílula de ação nas linhas do dia |
| `.nav .act` | 44 | a ação dentro da barra |
| `.seg button` | 44 | o segmento de porção (`Tudo · Metade · …`) |
| `.seg3 button` | 44 | o segmento de três — **o que a frente 2 não listou** |
| `.acts button` | 44 | "Máquina ocupada", "Dor", "Pular" |

**E uma classe que está na lista dela e não devia:** `.themes button` também mede
44, mas é o botão `Sistema · Claro · Escuro` **da galeria**, fora do telefone. Não
conta.

**Por que eu não dou número de instância, e isto é correção de método, não
desculpa.** Medi as instâncias e o número é **cerca de 370** nos nove arquivos
(`.ib` 27, `.lk` 27, `.chip` 34, `.pill` 27, `.nav` 121 botões, `.seg` 29,
`.seg3` 54, `.acts` 51). **Esse número não quer dizer nada**, por duas razões
que a medição mostra:

- **as seis telas da segunda rodada desenham cada estado duas vezes**, claro e
  escuro, então metade das 370 é a mesma coisa pintada de outra cor;
- **`.nav .act` com 121 botões é a barra dos cinco lugares repetida por estado**
  — no app são **cinco** controles, não 121.

**A unidade certa é a classe, e a resposta é oito.** E as oito juntas são o
chrome inteiro do produto: o cabeçalho, a barra, o chip, a pílula, o segmento e a
fileira de ação.

> **Requisito 8 · As oito sobem de 44 para `var(--ins-tap)`, que é 46.** Não por
> `::after` — por desenho, porque todas as oito já são `min-height` e subir dois
> pixels num `min-height` é trocar um número por um token. **Duas exceções, com
> a razão:**
>
> - **`.nav .act`** está dentro de `.tabbar`, cuja altura total é
>   `--ins-tabbar: calc(52px + var(--sa-bottom))` — e esse token tem três casos
>   dependendo dele (o cronômetro que se empilha acima, o `padding-bottom` do
>   `#app`, o toast). **Subir a aba para 46 cabe nos 52** e não muda o token.
>   Conferi: a `.tab` da direção já mede 50 ou 52 (`prototipo.html` usa 52).
> - **`.lk`**, que é o link em linha dentro de prosa, **fica em 44**: é o degrau
>   do meio da régua (controle não repetido em linha cheia), e forçar 46 nele
>   engorda a linha de prosa em dois pixels por ocorrência. É o mesmo raciocínio
>   do caso *alvo de toque não é forçado duas vezes*, que mediu 16 px por linha
>   de engorda na timeline.

### 5.4 · `.map` e `.daytype`: os doze da auditoria, com a conta do conserto

Os dois únicos controles abaixo de 44 px nos nove (medi, e bate com a auditoria):

**`.map` — `min-height: 30px`, 3 ocorrências.** A frente 2 já corrigiu a leitura
e eu confirmo no fonte: é **um** `<button class="map">` de largura cheia, com os
pontos como conteúdo dentro dele e um rótulo que carrega o número —
`aria-label="Ver a sessão inteira: 10 de 20 séries guardadas"`
(`prototipo.html:577`). Então **os pontos são decorativos** (§6) e o defeito é de
altura.

> `.map::after { position: absolute; inset: -8px 0 }` → **46 px de alvo**
> (`30 + 16`). **Conta.** O segundo valor em zero por consistência, embora aqui o
> vizinho horizontal seja a borda da tela: a régua é "zero onde o vizinho é
> controle", e manter zero sempre é uma regra em vez de duas.
>
> **E o que isto não resolve, dito:** `.map` tem `overflow-x: auto` (um dos três
> da direção), e os pontos das últimas séries ficam fora da janela pela conta da
> frente 2 (§1.1 dela). Alvo maior não traz ponto nenhum para dentro. **O que
> traz é o rótulo**, que já carrega o número — e é por isso que a resposta certa
> para os pontos é `aria-hidden`.

**`.daytype` — `min-height: 36px`, 9 ocorrências.** É o botão que diz o tipo de
dia no Agora, e trocá-lo reposiciona todas as refeições (F187, F189, M2-13).

> `.daytype::after { position: absolute; inset: -5px 0 }` → **46 px**
> (`36 + 10`). **Conta.** É **controle repetido** no sentido da régua: aparece
> em nove estados dos nove arquivos, e a auditoria registra por que ele é caro:
> *"Tocar o controle que reorganiza o dia inteiro num alvo de 36 px de altura,
> sentado no meio do trabalho, é barato; de pé e suado, não."*
>
> **E ele é um dos becos silenciosos do protótipo** (frente 2 §7.0): recebe foco,
> escala no toque e não faz nada. Alvo de 46 px num botão que não responde é pior
> do que alvo de 36 — então **este requisito só vale junto com o estado**, que é
> da frente 2.

### 5.5 · O foco — e o app não tem anel de foco para botão nenhum

**Isto é o maior buraco que eu achei do lado do app, e nenhum documento do
redesenho o nomeia.**

**Medi as quatro folhas de regra.** Regras de foco que existem:

| regra | onde |
|---|---|
| `.tc-titulo:focus { outline: none }` e `.tc-titulo:focus-visible { outline: var(--ins-indicator) solid var(--ins-acid); outline-offset: var(--ins-1) }` | `src/componentes.css` |
| `input:focus, textarea:focus, select:focus { outline: none; border-color: var(--ins-acid) }` | `src/base.css` |
| mais **seis** `outline: none` em campos específicos, cada um com um substituto visível (`border-color` ou `box-shadow: inset 0 -1px 0` em ácido) | `componentes.css`, `treino.css` |

**E é isso.** **Não existe nenhuma regra de `:focus-visible` para `button`, para
`a`, para `[role]` nem para `[tabindex]`.** Todo botão deste app depende do anel
padrão do navegador — e o app declara `<meta name="color-scheme" content="dark">`
com um canvas a `#0C0E0C`, que é onde o anel padrão tem menos chance de aparecer.

**O contrato manda o contrário:** *"Foco sempre visível, e nunca escondido atrás
de sticky"* (`docs/LASTRO_UX_CONTRACT.md` §11). **E nenhum dos 38 casos afirma
nada sobre anel de foco.** A regra existe escrita, não tem implementação geral e
não tem rede.

**A direção faz certo, e é a única das seis trocas em que ela é estritamente
melhor de graça.** Medi: todos os nove declaram, uma vez, no `button`:

```css
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px }
```

E a auditoria mediu o efeito: *"Dos 525 focáveis medidos, 525 recebem anel"* —
e **0** focáveis sem anel nas duas direções, contra a tabela 2.4.7 dela.

> **Requisito 9 · Três tokens de foco, e uma regra só.**
>
> ```css
> --ins-foco:         var(--ins-acento);
> --ins-foco-largura: 3px;
> --ins-foco-folga:   2px;
> ```
>
> ```css
> :focus-visible {
>   outline: var(--ins-foco-largura) solid var(--ins-foco);
>   outline-offset: var(--ins-foco-folga);
> }
> ```
>
> **`:focus-visible` e não `:focus`**, e a razão já está escrita no app de hoje,
> em `src/componentes.css`: *"no toque o anel apareceria em…"* — quem toca não
> quer anel; quem tabula quer.
>
> **Por que 3 px e não os 2 px de hoje** (`--ins-indicator`): é o valor da
> direção, e **medi que ele funciona** — `acento` sobre os quatro fundos dá 6,16 a
> 7,88:1 no claro e 6,05 a 8,15:1 no escuro (§1.4), muito acima dos 3:1 de
> 1.4.11. `--ins-indicator: 2px` continua existindo para o indicador de aba, que
> é outra coisa.
>
> **O caso que a folga de 2 px resolve, e é o único caso difícil:** num botão
> **preenchido de acento** (`.primary`), um anel de acento encostado no
> preenchimento seria invisível. Com `outline-offset: 2px` a folga mostra a
> **página** entre o anel e o botão, e página contra acento é 6,16:1 nos dois
> lados da folga. **Conta.** Por isso a folga não é estética: sem ela o anel
> desaparece no botão mais importante da tela.
>
> **Os sete `outline: none` dos campos ficam**, porque os sete têm substituto
> visível e porque campo focado com anel **e** borda de acento é dois canais para
> a mesma coisa. **Requisito:** cada `outline: none` continua obrigado a ter o
> substituto na mesma regra, e isso vira caso (§11) — hoje é disciplina sem rede.
>
> **E `outline` não serve para mais nada** (requisito 7): nenhum estado do
> sistema usa `outline`, porque `outline` é o foco.

---

## 6 · Os ícones — e não são 178

### 6.1 · A contagem, medida nos nove: 49 desenhos em 1.069 lugares

O briefing manda decidir a regra dos **178 `<svg>` sem nome** que vêm de
`04-acesso.md`. **Conferi a origem do 178 e medi o resto.**

**O 178 está certo e é de dois arquivos.** A auditoria mediu
`momento-1.html` (54 `<svg>`) e `momento-2.html` (124). Os outros sete arquivos
são posteriores a ela (§1.4). **Medi os nove:**

| | medi |
|---|---:|
| `<svg>` nos nove arquivos | **1.088** |
| deles, instâncias de ícone (`<svg><use href="#…"/></svg>`) | **1.069** |
| blocos de sprite (`<svg width="0" height="0" … aria-hidden="true">`) | 9 |
| gráficos desenhados em linha | 10 |
| **desenhos distintos** (`<symbol id="…">`) | **49** |
| `<svg>` com `role="img"` e `aria-label` | **2** |

**O número que importa para a regra é 49, não 1.069 e não 178.** A direção já
resolveu o problema de escala sozinha: ela desenha cada ícone **uma vez**, num
`<symbol>`, e o usa por `<use href="#id">`. Então **a decisão "decorativo ou
portador do nome" se toma 49 vezes, no lugar onde o desenho mora** — não 1.069
vezes no lugar onde ele aparece.

**E 314 dos 1.069 não portam.** Medi: `bat` (158 usos), `sig-c` (110) e `sig`
(46) são a **bateria e o sinal da barra de status do telefone de mentira**. O app
não desenha barra de status: ele declara
`apple-mobile-web-app-status-bar-style: black-translucent` (conferi,
`index.html`) e o **sistema** desenha o relógio, o sinal e a bateria; o
`body::before` do app só pinta o fundo atrás deles, com caso próprio (*a barra de
status tem fundo*). **Então a conta real do app é 46 desenhos em 755 usos.**

### 6.2 · A regra, e ela tem quatro casos — não dois

A auditoria dividiu em dois: 102 "soltos" e 76 "dentro de controle com nome, o
que atenua mas não resolve". **Fui ler os 49 desenhos um por um, e a divisão em
dois deixa duas situações sem resposta.** Os quatro casos:

**Caso 1 · Decorativo. `aria-hidden="true"`, e o nome vem de fora.**

O ícone repete o que o texto ao lado já diz, ou mora dentro de um controle cujo
nome já o cobre. Medi os que caem aqui, e é a maioria:

- os **seis ícones da barra de lugares** (`t-agora`, `t-dias`, `t-corpo`,
  `t-sem`, `t-presc`, `t-evo`) — cada um dentro de um botão com o nome escrito
  embaixo;
- `bk` (90 usos) e `dots` (15) — dentro de `.ib` com `aria-label` escrito
  (`aria-label="Voltar ao Agora, deixando a sessão aberta"`,
  `aria-label="Opções da sessão"`; conferi os dois);
- `ck` (17) — ao lado de *"Série 2 guardada neste aparelho"*;
- as **sete formas de estado** (`s-full`, `s-half`, `s-out`, `s-fut`, `s-now`,
  `s-nsei`, `s-open`) — em **todos** os usos a palavra está encostada: na legenda
  (`<li><svg><use href="#s-full"/></svg>comi tudo</li>`) e no cabeçalho da
  refeição (`<svg class="ico"><use href="#s-full"/></svg><b>Lanche da tarde ·
  comi tudo</b>`). Conferi os dois;
- os **ícones de afordância no fim da linha** — `fw`, `nuv`, `bal`, `rel`, `pen`,
  `down` — que dizem "esta linha abre algo" e cujo texto está à esquerda
  (`<div class="t">Continuar pesando<small>3 a 4 vezes por semana</small></div><svg…><use href="#bal"/>`);
- `cam`, `note`, `undo`, `lousa`, `som`, `fita` — dentro de botão com texto ao
  lado (`<button class="lk"><svg…><use href="#undo"/></svg>Desfazer</button>`);
- os **14 quadradinhos dos 14 dias** — e esses nem são `<svg>`: são
  `<i class="cell">` pintados por CSS, então não estão nos 1.069. A frente 2 já
  decidiu certo (§2 dela): `aria-hidden`, porque a frase logo abaixo carrega o
  número.

**Caso 2 · Portador do nome. `role="img"` com `aria-label` escrito, e o rótulo
carrega o número.**

O ícone é a única coisa que existe, e o que ele diz não está escrito em lugar
nenhum. Medi os que caem aqui:

- **as 11 poses do protocolo de fotos** (`p1` a `p9`, mais `p1b` e `p8b`, 55
  usos) — `<div class="frame"><svg viewBox="0 0 120 160"><use href="#p3"/></svg>`,
  sozinhas no quadro. A silhueta **é** a instrução de como se posicionar, e ela é
  lida **a três metros** (C7: sozinho, longe do aparelho, sem alcançá-lo). Nada
  escrito diz qual pose é;
- os **10 gráficos desenhados em linha**. Dois deles já estão certos: o gráfico
  de médias semanais de `corpo.html` leva
  `role="img" aria-label="Médias semanais de 71,5 a 73,5 kg, com achatamento nas
  últimas três semanas"` — e **são os únicos 2 `<svg>` nomeados dos nove**
  (medi). É o padrão de ouro que o parecer atribuiu à direção C, e a D o tem
  também: em um gráfico, desenhado duas vezes (claro e escuro).

**O rótulo carrega o número, e essa é a regra inteira:** "Séries da semana" não
serve; "Séries da semana: 12 de 12 prescritas" serve. É a diferença entre um nome
e uma etiqueta.

**Caso 3 · O ícone diz mais do que o nome do controle diz. O nome cresce, e o
ícone volta a ser decorativo.**

**Este caso não existe na divisão da auditoria**, e eu achei quatro instâncias
dele medindo os 49. Nos quatro, o ícone está dentro de um controle **com** nome —
logo cai no balde dos "76, atenuado" — **mas o nome não inclui o que o ícone
diz.** Então nem `aria-hidden` serve (perde informação) nem `role="img"` serve
(o controle passa a ter dois nomes).

| onde | o que o ícone diz | o que o nome diz |
|---|---|---|
| `star` em `.opt` | **"indicado pelo treinador"** | `<b>Elevação lateral unilateral no cabo</b>` mais a última carga. **Em nenhum lugar diz indicado** |
| `ok2` em `.gate .ic2.ok` | **"este portão está cumprido"** | *"Taxa: +0,07 e +0,03 kg/semana"* — os números, e não o veredito |
| `warn` em `.gate .ic2.no` | **"este portão não está cumprido"** | *"Adesão: 1 dia de 14"* — idem |
| `warn` em `.item.due` | **"esta mudança vence agora"** | o resumo da mudança |

**A resposta, e ela é melhor para todo mundo e não só para leitor de tela:** o
**texto** passa a dizer a palavra, e aí o ícone fica decorativo.
*"Elevação lateral unilateral no cabo · indicado pelo treinador"*.
*"Taxa: cumprida — +0,07 e +0,03 kg/semana"*. *"Adesão: falta — 1 dia de 14"*.
**É a mesma doutrina que o E3 da auditoria já aplicou à cor** ("não pode ser
marca só de cor") estendida à **forma**: estado nunca só por forma. Quem olha a
tela de pé, na luz da academia, também ganha — um asterisco e um triângulo são
duas formas de 16 px, e a palavra não depende de enxergá-las.

**As palavras são da frente 3**, e os exemplos acima são ilustração do formato,
não proposta de voz.

**Caso 4 · O controle não tem nome nenhum. Não é problema de ícone.**

Medi um, e são **28 usos**: `plus` dentro de
`<button class="add" style="width:44px;height:44px;…"><svg width="22" height="22"><use href="#plus"/></svg></button>`.
**Um botão de 44 × 44 px cujo único conteúdo é um ícone, sem `aria-label` e sem
texto.** Para leitor de tela é "botão", sem mais nada — é 1.1.1 e é 4.1.2, e é
pior do que os 102 soltos da auditoria, porque um ícone solto ao menos não finge
ser um controle operável anônimo.

**A resposta:** o **controle** ganha `aria-label` (é o padrão que a própria
direção usa em `.ib`, e ela o usa bem), e o ícone passa a ser caso 1.

### 6.3 · O requisito que torna isto portão, e não acabamento

A frente 2 escreveu o requisito e eu o assino, com a correção da escala:

> **Requisito 10 · O ícone entra por um componente cuja assinatura não permite
> omitir a escolha.** Ou ele recebe um rótulo, ou recebe a marca de decorativo, e
> **não existe terceira forma de chamá-lo**. Em Preact isso é um componente com
> dois modos e nenhum padrão: `<Icone nome="bk" decorativo />` ou
> `<Icone nome="p3" rotulo="Pose 3: perfil direito, braços ao lado do corpo" />`,
> e chamar sem um dos dois é erro de tipo, não aviso.
>
> **E a decisão mora no catálogo, não na chamada.** São **46 desenhos** que
> portam (49 menos os três da barra de status de mentira), e **42 deles são
> decorativos em todos os usos medidos** — então o componente tem um catálogo com
> o padrão de cada desenho, e a chamada só precisa falar quando foge do padrão.
> Os quatro que **nunca** são decorativos: as 11 poses (um id por pose), os
> gráficos em linha, e nada mais.
>
> **Por que isto é portão e não acabamento:** 755 usos. Se a decisão mora na
> chamada, ela se toma 755 vezes e se esquece algumas. Se mora no catálogo, são
> 46 linhas, uma vez. **A diferença entre as duas é a diferença entre uma regra e
> um esforço**, e é a mesma disciplina que o caso *cor nova não entra solta no
> meio das regras* aplica à cor: "dê um nome a ele antes de usar".
>
> **O caso que falta, e ele é de fonte e não de DOM**, pela mesma razão escrita
> no caso da folha ("o defeito nasce de uma linha nova"): nenhum `<svg>` nos
> componentes sem `aria-hidden`, `role="img"` com `aria-label`, ou `<title>`. Com
> o componente obrigatório, o caso pode ser mais forte e mais barato: **não
> existe `<svg>` escrito à mão fora do catálogo de ícones.** Uma asserção, um
> lugar.

---

## 7 · A `Procedencia` — ela já é primitiva, e a pergunta do plano está mal posta

`07-plano.md` §4 põe a alternativa assim: *"As duas carregam no conteúdo a
promessa de que todo número derivado diz de onde veio; nenhuma a mantém como
primitiva. Ou a frente 4 a reconstrói como token e componente, ou ela deixa de
ser regra e passa a depender de quem escreve cada tela — o que é a definição de
regra perdida."*

**Fui procurar para reconstruir, e ela já existe. A frase "nenhuma a mantém como
primitiva" é sobre as duas direções, e está certa sobre elas — mas não há nada a
reconstruir: há uma primitiva viva a preservar.**

### 7.1 · O que existe hoje, medido

| | onde |
|---|---|
| **o componente** | `export function Procedencia({ children })` em `src/ui/instrumento/primitivos.jsx`, com o comentário *"Linha de procedência: de onde veio um número derivado."* |
| **a classe** | `.ins-provenance` em `src/base.css` |
| **a forma** | `font: 400 10px/1.4 var(--ins-font-mono); letter-spacing: .06em; color: var(--ins-text-4)` |
| **quantos lugares a usam** | **47 chamadas de `<Procedencia>`, em 12 arquivos** (medi): `dados.jsx` 15, `guia.jsx` 6, `refeicao.jsx` 4, `protocolo.jsx` 4, `comparar.jsx` 4, `camera.jsx` 3, `editores.jsx` 3, `comida.jsx` 2, `ajustefoto.jsx` 2, `sessao.jsx` 2, `hoje.jsx` 1, `historico.jsx` 1 |
| **a razão da cor, escrita** | *"text-4, não text-5: procedência CARREGA informação ('cru · 3,4 kg prontos') e a 10px o nível 5 dá 3,2:1, que reprova em AA. O nível 5 fica para o redundante"* |

**Quarenta e sete lugares.** Ela não é uma ideia: ela é o segundo componente mais
usado do sistema depois dos de layout, e a razão da cor dela foi medida.

### 7.2 · O que a direção tem no lugar: quatro classes anônimas e 674 `<small>`

**Medi os nove HTML.** A promessa de procedência está no **conteúdo** — e é boa:
"o treinador prescreveu 12", "A regra do nutricionista diz", "marcado às 15h41,
neste aparelho", "contado contra o plano de hoje". Mas **a forma não tem dono**:

| classe | forma | onde |
|---|---|---|
| `.hint` | 13px, `--ink-2` | nos nove |
| `.sub` | 14px, `--ink-2` | nos nove |
| `.foot` | 12px, `--ink-3` | só no `prototipo.html` |
| `.k` | 12px, peso 800, caixa alta, `--accent-ink` | só no `semana.html`, e lá são **10** ocorrências da mesma frase: "A regra do nutricionista diz" |

**Quatro classes, três tamanhos, três cores, para um trabalho.** E o carregador
de verdade é outro: **674 `<small>`** nos nove (medi), estilizados por **27
regras de contexto diferentes** — `.gate .t small`, `.meal .t small`,
`.ref td small`, `.rep small`, `.dl .nm small`, `.fin .fr .v small`… **O mesmo
significado tem 27 aparências, cada uma herdada de onde ele caiu.**

**Isto é exatamente o que `07-plano.md` chama de regra perdida**, e não porque
alguém esqueceu: porque a direção é uma galeria de telas, e numa galeria cada
tela resolve a sua. Numa reescrita de componente, 674 `<small>` com 27
aparências não viram nada — viram 674 decisões.

### 7.3 · A decisão: ela fica, fica obrigatória, e muda de forma

> **Requisito 11 · `Procedencia` continua primitiva, e passa a ser a única forma
> de dizer de onde veio um número.**
>
> - **O componente fica**, com o nome e o contrato que já tem.
> - **A classe fica**, renomeada para o vocabulário do sistema novo:
>   `.ins-procedencia`.
> - **A forma muda**, porque a monoespaçada saiu (§2.2) e a escala é nova (§3.2):
>   `font-size: var(--ins-t-meta)` (12px, em `rem`), `letter-spacing: .04em`,
>   `color: var(--ins-tinta-3)`. **Medi que isto é melhor do que hoje**:
>   `tinta-3` dá **4,87 a 6,23:1** no claro e **6,06 a 8,16:1** no escuro, contra
>   os 5,01:1 de `--ins-text-4` sobre o canvas de hoje — e o degrau de 12 px em
>   vez de 10 px reforça, porque a razão escrita da cor de hoje era justamente a
>   de que a 10 px o nível de baixo reprovava.
> - **Ela não é `<small>`.** `<small>` é "letra miúda" em HTML e qualquer
>   container pode repintá-la; `.ins-procedencia` é um papel do sistema e tem uma
>   forma só, em qualquer lugar onde apareça.
> - **Ela não carrega número que não seja a origem.** A regra de uma linha:
>   *se a frase responde "de onde veio este número?", é `Procedencia`; se ela
>   responde outra coisa, é prosa de apoio (`--ins-t-apoio`).*
>
> **E o caso que falta, que é o que torna isto regra e não hábito:** nenhuma
> folha do sistema estiliza `small` por contexto. É asserção de fonte, de uma
> linha, e ela faz o que 27 regras de contexto desfazem.

### 7.4 · A consequência, dita como o plano pediu

**Se este requisito não for cumprido, a procedência deixa de ser regra** — e a
forma concreta de isso acontecer é esta, medida: a reescrita porta os 674
`<small>` da direção, cada um herdando a aparência do bloco onde caiu; os 47
`<Procedencia>` de hoje viram 47 `<div>` ou `<small>`; e a promessa de que "todo
número derivado diz de onde veio" passa a depender de cada tela nova lembrar.
**Não há nada que a segure**: não existe caso de teste sobre procedência hoje, e
é por isso que eu escrevo um.

**E uma coisa que eu decidi NÃO fazer, para não aumentar o problema:** não
proponho um **token** de procedência (`--ins-procedencia-*`). Ela é um **papel
tipográfico** — tamanho, tracking, cor —, e os três valores já são tokens
(`--ins-t-meta`, `--ins-tinta-3`). Um token a mais seria um quarto lugar onde a
mesma decisão mora. **A primitiva é o componente mais a classe, e é o
suficiente.**

---

## 8 · Movimento

Esta seção não é frente porque o curador cortou: *"abrir uma frente para isso
convidaria a inventar movimento que a direção não pediu"* (`07-plano.md`). Então
eu **não invento gesto nenhum**. O que eu faço é medir o que a direção tem, dizer
o que ela não tem, e decidir o que passa pelo portão.

### 8.1 · O inventário da direção, do fonte: são sete, não quatro — e um é CSS morto

**Medi os nove HTML. Existem exatamente dois `@keyframes` em cada arquivo**, e o
conjunto todo é este:

| # | o movimento | mecanismo | em quais arquivos | dentro do portão? |
|---|---|---|---|---|
| 1 | **o toque que afunda** | `transform: scale(.95)` em `:active`, com `transition: transform .12s ease, background-color .15s ease` | nos nove | **sim** (`no-preference`) |
| 2 | **o bloco que chega** (`.enter`) | `@keyframes enter` `.24s`/`.26s` — `opacity 0→1` e `translateY(10px)→0` | nos nove | **sim**, e no `prototipo` também por JS (`if(reduzido)`) |
| 3 | **o esqueleto pulsando** (`.sk`) | `@keyframes pulse 1.4s ease-in-out infinite` — opacidade até `.55` | **oito** dos nove (não no `prototipo`) | **sim** |
| 4 | **a barra do descanso** | `transition: width 1s linear`, com `bar.style.width = …%` escrito pelo JS | nos nove | **sim** |
| 5 | **o véu e a folha** | `transition: opacity .2s` no véu e `transform .24s cubic-bezier(.2,.8,.2,1)` na folha | **só** o `prototipo` | **sim**, e ele é o único com bloco `reduce` |
| 6 | **o fantasma que voa** (`voa()`) | `.ghost` `position: fixed`, animado por JS | **só** o `prototipo` | **sim**, por JS: `if(reduzido||!de){ achaDestino(); return; }` |
| 7 | **o relógio tiquetaqueando** (`.tick`) | `@keyframes tick .5s` — `opacity` e `translateY(-6px)` | declarado no `prototipo` | — |

**O número 7 é CSS morto.** Medi: a classe `tick` **nunca é aplicada** no markup
nem no JS do `prototipo.html` — as seis ocorrências da palavra são a função
`tick()` do relógio, que é outra coisa. A regra e o `@keyframes` existem e não
pintam nada.

### 8.2 · Dois dos quatro gestos nomeados não têm quadro nenhum

O briefing diz que a direção propôs **quatro gestos com função**: a cortina que
diz onde está o corte, o clarão do disparo, o anel que esvazia, o toque que
afunda. **Fui procurar os quatro no fonte, e só dois existem como movimento:**

| o gesto nomeado | o que está no fonte |
|---|---|
| **o toque que afunda** | **existe**, e é o número 1 da tabela acima |
| **a cortina que diz onde está o corte** | **existe, e não é animação.** `.cort .lay.nova { clip-path: inset(0 0 0 54%) }` com um puxador de 44 px, movido por **arrasto** (`document.querySelectorAll('.cort[data-drag]')` no JS de `corpo`, `comparar` e `sessao-fotos`). Zero `transition`, zero `@keyframes`, e **fora** do bloco `no-preference` |
| **o clarão do disparo** | **não existe como movimento.** `.cheia .flash { position: absolute; inset: 0; background: #fff }`, com `style="opacity:.62"` escrito no markup. **Um quadro estático.** Zero keyframes, zero transition |
| **o anel que esvazia** | **não existe como movimento.** `<circle … stroke-dasharray="276" stroke-dashoffset="166" …>` — os dois valores **fixos no markup**, em todos os usos. Um quadro estático |

**Então o briefing tem razão sobre a intenção e não sobre o material: dois dos
quatro foram desenhados como uma fotografia do meio do gesto.** E três
movimentos que **existem** não estão na lista dos quatro: o bloco que chega, o
esqueleto que pulsa e a barra do descanso.

**Isto muda o que esta seção faz.** Para o toque e a cortina eu especifico o que
está lá. Para o clarão e o anel eu especifico **a partir de um quadro parado**, e
digo que é isso que estou fazendo — não há o que portar, há o que escrever. E eu
não aumento a lista: os três que a prosa da direção não nomeia já estavam no
CSS dela, com a mão do desenhista.

### 8.3 · Quatro das seis formas vivas são proibidas pelo nome neste projeto

**Isto é a colisão de frente desta seção, e nenhum documento do redesenho a
nomeou.** O handoff do sistema, em `DESIGN_SYSTEM.md:18`, escreve o inegociável 6
assim (conferi):

> *"**Almost no motion.** There are two animations in the whole product: the live
> dot pulse (2.4s) and the tab indicator slide (220ms). **No entrance animations,
> no fades, no skeletons that shimmer, no springy sheets.**"*

E `docs/design-review/05-movimento.md` reafirma em português — *"nada de animação
de entrada em conteúdo, nada de fade, nada de esqueleto que cintila, nada de
folha com elasticidade"* — e recusa duas delas **uma por uma, com a razão**:

| ideia | a recusa escrita |
|---|---|
| **Skeleton, shimmer, fade de entrada em lista** | *"Proibidos pelo nome em `DESIGN_SYSTEM.md:18`. E U-46 mostra que o app quase não tem estado de carregando: o dado é local, não há espera a encenar."* |
| **A folha subir ao abrir** | *"era o único lugar onde a revisão de design achou função para movimento novo — dizer de onde a camada veio —, e perdeu **por ser animação de entrada**, que a lista acima proíbe pelo nome, e porque o véu atrás dela ou aparece de uma vez ou pede um fade, que é mais movimento ainda."* |

**Cruzando com o inventário:** o `.enter` é animação de entrada **e** fade; o
`.sk` é esqueleto que cintila; a folha e o véu são a folha subindo com fade do
véu. **São quatro das seis formas vivas da direção escolhida, e as quatro estão
na lista de proibidas.** A quinta forma proibida — "folha com elasticidade" — a
direção **não** comete: `cubic-bezier(.2,.8,.2,1)` é saída suave sem
ultrapassagem (medi a curva: nenhum ponto de controle acima de 1).

**E o app tem um inventário de quatro movimentos, com tabela e com regra de
entrada** (`DESIGN.md`, Movimento): o pulso do ponto ao vivo (2,4 s, infinito), o
indicador de aba (220 ms em `left`), a barra do cronômetro (250 ms em
`transform: scaleX`) e a rolagem até a sessão destacada. Medi e confirmei: **4
movimentos, 1 `@keyframes`, 2 `transition`, 1 `scrollIntoView`** nas folhas e no
`main.jsx`. A regra de entrada está escrita: *"Movimento novo entra nesta tabela,
com a função que cumpre, antes de entrar no código."*

**Então a decisão desta seção é: cada um dos movimentos da direção entra na
tabela com a função que cumpre, ou sai.** E onde eu derrubo uma proibição
escrita, eu digo qual e por quê.

### 8.4 · O portão: qual dos dois, e por que o da direção

Os dois lados resolvem `prefers-reduced-motion` por disciplinas **opostas**:

| | mecanismo | o que acontece com movimento novo |
|---|---|---|
| **o app** | `@media (prefers-reduced-motion: reduce) { .ins-live-dot { animation: none } * { transition: none !important } }` — **por exclusão** | `transition` morre sozinha. **`animation` NÃO morre** — o bloco desliga `animation` só em `.ins-live-dot`. `DESIGN.md` avisa com todas as letras: *"Um `@keyframes` novo **não** morre sozinho… Movimento novo é `transition`, ou entra no bloco."* |
| **a direção** | tudo dentro de `@media (prefers-reduced-motion: no-preference)` — **por adesão** | movimento novo **não roda** com `reduce` ligado, sem ninguém se lembrar de nada |

**A auditoria já deu o veredito e eu assino:** *"A afirmação da D confere, e é o
padrão certo (opção por adesão, não por exclusão)."*

> **Requisito 12 · O portão é por adesão, e ele é um só.** Todo movimento do
> sistema mora dentro de `@media (prefers-reduced-motion: no-preference)`. O
> curinga `* { transition: none !important }` **sai**: com o portão por adesão
> ele não tem o que matar, e `!important` num curinga é a regra mais difícil de
> depurar que existe num CSS.
>
> **A razão, escrita para não precisar deste documento:** *o portão é por adesão
> porque ele falha fechado. Com exclusão, quem escreve um `@keyframes` novo
> precisa lembrar de dois lugares; quem esquece entrega movimento a quem pediu
> para não ter. Com adesão, quem esquece entrega nada, que é o erro barato.*
>
> **E o `reduce` declara o estado final, não a ausência.** O `prototipo.html` já
> faz isto certo e é o modelo: `@media (prefers-reduced-motion: reduce) { .ov
> .scrim { opacity: 1 } .ov .sheet { transform: none } }`. Sem esse bloco, a
> folha ficaria parada **em `translateY(100%)`** — isto é, fora da tela. **Um
> portão que só tira o movimento, sem pôr o estado final, não desliga movimento:
> esconde a interface.** Isto vira caso (§11), porque é o modo de falha que mais
> se parece com "funcionou".
>
> **O que o portão NÃO alcança, e é por isso que ele não basta sozinho:**
> manipulação direta. A cortina (§8.5, item 8) é movida pelo dedo, e o dedo é o
> relógio — não há o que desligar. E as três chamadas de `scrollIntoView` e as
> animações feitas em JS precisam perguntar por conta própria: o app já faz
> (`matchMedia('(prefers-reduced-motion: reduce)')` em `src/main.jsx`) e o
> `prototipo` também (`var reduzido = …` na abertura, usado em cinco lugares).
> **Requisito: todo caminho de movimento em JS lê a preferência, e o portão de
> CSS não é desculpa para não ler.**

### 8.5 · Os movimentos, um por um, com o que sobra sob `reduce`

**1 · O toque que afunda. FICA, e ganha o que falta nele.**

Função: dizer que o toque chegou. **É o único movimento do produto que acontece
dezenas de vezes por sessão** — a régua é tocada 48 vezes por semana (do parecer,
decisão 8) — e é o único que o dono tocou e aprovou no protótipo.

Forma: `transform: scale(.95)` em `:active`, `transition: transform
var(--ins-dur-toque) ease` com `--ins-dur-toque: 120ms`, que é o valor da
direção.

**E aqui está o que falta, e é requisito:** medi as regras `:active` da direção e
**elas só mudam `transform`.** A `transition` menciona `background-color`, mas
nenhuma regra `:active` declara cor. **Então com `reduce` ligado, tocar um botão
deste app não mostra nada** — nem afundar, nem mudar de cor — até o render
chegar.

> **Requisito 13 · `:active` muda o preenchimento, fora do portão.** Todo
> controle tocável ganha, em `:active`, `background: var(--ins-superficie-2)` (ou
> um degrau acima do seu repouso), **declarado fora do bloco `no-preference`**,
> para que a troca aconteça com `reduce` ligado. **Isso não é movimento: é
> estado**, e é por isso que ele mora fora do portão. O `scale(.95)` continua
> dentro.
>
> **A medida que justifica:** `--ins-superficie-2` contra `--ins-tela` é 1,08:1
> (§1.5) — **fraco demais para ser o único canal.** Então em `:active` o
> preenchimento vem com `--ins-fio-controle` de `1.5px` (3,26:1 / 4,79:1), e aí
> o toque tem um canal que se vê. **Não medi na luz da academia.**

**2 · O bloco que chega (`.enter`). SAI.** É o único que eu removo, e a razão é
deste produto.

A forma é proibida por nome em dois documentos (§8.3). **E há uma razão medida
que vale mais que a proibição:** `.enter` é aplicada ao painel
`<div class="saved">` — a confirmação da série (conferi, `prototipo.html:734`,
pela flag `S.flash`). Uma animação de 240 a 260 ms na confirmação **atrasa em um
quarto de segundo o instante em que ele pode ler que a série foi guardada**, de
pé, entre duas séries. E o projeto já recusou exatamente esse custo, com
decisão registrada: `MARCA.md:158`, sobre o splash — *"Um frame a mais entre o
toque e a próxima série."*

**E há uma razão de doutrina que fecha:** a frente 2 (§7.2, requisito 1) exigiu
que *"o voo é decoração; quem autoriza a palavra 'guardada' é o retorno do
disco"*. Um painel que **chega animado** diz "apareci"; um painel que
**simplesmente está lá** diz "está guardado". O segundo é o que o app promete
("não existe estado 'não salvo'").

**O que fica no lugar:** nada, e é de propósito. O painel aparece. **A frente 2
já pôs ali o canal que importa e que a direção não tem:** `role="status"` com
`aria-live="polite"` e o valor dentro do anúncio (R6 dela, a reprovação R-D1 da
auditoria). **Um anúncio de leitor de tela entrega a mesma informação que a
animação entregava, e entrega para quem a animação nunca alcançou.**

**3 · O esqueleto pulsando. O esqueleto FICA; o pulso SAI.**

O esqueleto tem função e é medida: o estado de carregando existe por causa do
F273, um carregamento que nunca terminava, e a direção o resolve com um esqueleto
**na forma da tela que vem** mais um prazo de 4 s (frente 2 §7.3). **A forma do
esqueleto é informação** — diz o que está vindo e quanto é.

**O pulso é o que a proibição nomeia**, e a razão escrita em
`05-movimento.md` — *"o dado é local, não há espera a encenar"* — vale: a espera
aqui não é rede, é abrir o registro do próprio aparelho.

**E eu achei um argumento a mais, que é de norma e que ninguém aplicou.** O
critério relevante para o pulso não é 2.3.1 (três piscadas, 3 Hz) — a 1,4 s ele
está em 0,71 Hz, folgado. **É 2.2.2 Pause, Stop, Hide**, que cobra mecanismo de
pausa para conteúdo em movimento que (a) começa sozinho, (b) **dura mais de cinco
segundos** e (c) aparece em paralelo com outro conteúdo. O esqueleto da direção
cumpre (a) e (c), e escapa de (b) **por um segundo**: o prazo dela é 4 s.

**Então, como está, o pulso passa 2.2.2 só porque o carregamento tem teto de
4 s.** Se alguém afrouxar o teto para 6 s — e teto de espera é exatamente o
número que se afrouxa quando alguém reclama de telas piscando —, o critério
reprova, e **ninguém vai relacionar as duas mudanças.** Tirar o pulso corta essa
dependência.

**O que fica no lugar:** a forma do esqueleto, parada, em
`--ins-superficie-2`. E o prazo de 4 s, que passa a ser requisito de estado e não
de movimento.

**4 · A barra do descanso. FICA como movimento e TROCA de mecanismo.**

Função: **interpolar uma grandeza contínua amostrada.** É a primeira das três
funções que `DESIGN.md` autoriza, e é literalmente o mesmo movimento que o app já
tem (`#tfill`).

**O mecanismo da direção é o que o app proibiu, com custo medido.** Medi: a
direção tem `.bar i { transition: width 1s linear }` **e** `bar.style.width =
Math.min(100, …) + "%"` no JS (`prototipo.html:1412`). O caso *o cronômetro de
descanso não anima largura* existe por causa disso, com a razão no teste:
*"Ele repinta 4× por segundo por até três minutos. Animar `width` refaz o layout a
cada quadro; a escala roda no compositor e desenha a mesma barra."* — e com o
commit que pagou a conta (`3ef9bb9`).

**E medi que a asserção não pega a barra da direção, por dois motivos
independentes:**

- ela casa `#tfill` por nome, e a barra da direção é `.bar i`;
- ela afirma `!/fill\.style\.width/.test(mainJsx)` — **o nome literal da variável
  `fill`**. A direção escreve `bar.style.width`. **Renomear a variável desarma a
  asserção**, e a direção já a renomeou sem saber.

Foi o que a medição de §0.3 mostrou: portei o CSS da direção e o caso ficou
**verde** com `transition: width` dentro do mesmo arquivo.

> **Requisito 14 · A barra interpola em `transform: scaleX()`, e a duração é o
> período de amostragem.** `transform-origin: left center`,
> `transition: transform <período> linear`, e o JS escreve `scaleX`, nunca
> `width`. Se a amostragem for de 1 s (como na direção), a duração é 1 s; se for
> de 250 ms (como no app), 250 ms. É a regra que `DESIGN.md` já escreve:
> *"`linear` com duração igual ao período de amostragem"*.
>
> **E a asserção para de depender de dois nomes:** ela passa a cobrar que
> **nenhuma** regra das folhas tenha `transition` que mencione `width` ou
> `height`, e que **nenhum** JS do app escreva `.style.width` numa barra de
> progresso. A segunda metade é mais difícil de escrever bem do que a primeira,
> e a primeira já é a que vale: sem `transition: width`, escrever `width` custa
> um repaint e não um layout por quadro.
>
> **E o que `reduce` faz com ela, que já está decidido e eu não reabro:**
> `DESIGN.md` escreve que sob `reduce` *"a barra passa a andar em degraus de
> 250 ms — quatro por segundo —, e é assim que fica: quem liga `reduce` pediu
> para não interpolar."* Vale igual com 1 s: a barra anda em degraus de um
> segundo, e o número ao lado continua exato.

**5 · O véu e a folha. FICAM — e é aqui que eu derrubo uma proibição escrita.**

> **Decisão: a folha sobe ao abrir, e o véu aparece com fade de 200 ms.** Isto
> contraria `DESIGN_SYSTEM.md:18` ("no entrance animations") e contraria a recusa
> explícita de `docs/design-review/05-movimento.md`. **Digo por quê, e a razão
> está no próprio sistema:**
>
> 1. **A função é uma das três que o sistema autoriza.** `DESIGN.md` escreve que
>    movimento aqui faz três coisas, e a terceira é **"dizer de onde uma camada
>    veio"**. A folha subindo é essa coisa, exatamente. A revisão de design
>    **achou** a função — ela escreveu *"era o único lugar onde a revisão achou
>    função para movimento novo"* — e recusou **por forma**, não por função.
> 2. **A camada tem três níveis, e a profundidade é a informação que se perde.**
>    `src/ui/instrumento/folha.jsx` escreve a razão do teto: *"na quarta ninguém
>    mais sabe o que fechar leva de volta para onde."* Com três níveis vivos, o
>    movimento que diz de que lado a camada entrou é o que faz "fechar leva de
>    volta" ser legível. É a mesma informação que o indicador de aba dá — "para
>    que lado se andou" — e o indicador de aba **está** na tabela dos quatro.
> 3. **O dono escolheu a direção tocando-a**, e a folha subindo é uma das coisas
>    que ele tocou.
> 4. **A proibição é de forma e vem de fora.** `DESIGN_SYSTEM.md` é o handoff; a
>    lista de cinco formas proibidas foi escrita antes de existir uma pilha de
>    folhas de três níveis.
>
> **E a proibição de "folha com elasticidade" fica inteira:**
> `cubic-bezier(.2,.8,.2,1)` em 240 ms, sem ultrapassagem. A folha chega e para.
>
> **O que `reduce` deixa no lugar:** o estado final, que o `prototipo` já
> escreve. A folha está em posição e o véu está opaco **no primeiro quadro**.
> Nada de meia-animação.
>
> ~~**Isto sobe à mesa dele** (§11), porque derrubar uma proibição escrita não é
> decisão de quem escreve o documento.~~
>
> **RECONCILIADO em 06/10 · ELE DECIDIU: a folha SOBE** (decisão 14 das quinze),
> e *"a proibição escrita em dois documentos cai"*. **É a recomendação desta
> seção, aceita como escrita**, com as quatro razões de cima e com as duas
> contrapartidas intactas: a proibição de **elasticidade** fica
> (`cubic-bezier(.2,.8,.2,1)` em 240 ms, sem ultrapassagem), e `reduce` põe **o
> estado final no primeiro quadro**, sem meia-animação.
>
> **O que cai, nominalmente:** a linha 18 de `DESIGN_SYSTEM.md` ("no entrance
> animations") e a recusa explícita de `docs/design-review/05-movimento.md`,
> **nos dois casos apenas para a folha** — a decisão é sobre a folha subindo, e
> não autoriza animação de entrada em lista, em cartão nem em tela. **Os dois
> documentos continuam de pé para todo o resto**, e quem reescrevê-los tem de
> escrever a exceção, não apagar a regra.
>
> **Ninguém mediu** se 240 ms de subida se percebe como "de onde a camada veio"
> ou só como atraso. O protótipo foi tocado por três minutos.

**6 · O fantasma que voa. FICA, e é a quarta função, nomeada.**

Função: **dizer para onde um valor foi.** Não é nenhuma das três de `DESIGN.md`,
então ou eu a nomeio ou o movimento entra sem razão.

**A razão é medida, e é da frente 2.** O valor sai de um botão da régua e vai
para uma célula da tabela. A tabela tem **até quatro células lado a lado**
(`for(c=1;c<=cols;c++)`), e a célula é `.cellb`, **22 px de altura, o menor alvo
da direção**. Sem o voo, o dono tem de **achar** qual das quatro células recebeu
o número, lendo as quatro. Com o voo, ele vê. **É informação, e é a informação
mais caro de obter de outro jeito naquela tela.**

> **Requisito 15 · A quarta função autorizada é "dizer para onde um valor foi", e
> ela tem um usuário só: o registro de série.** Não vale para marcar refeição,
> para aplicar o passo de kcal nem para nada mais — porque em todos os outros o
> destino é a própria linha que ele tocou.
>
> **Duas restrições que vêm da frente 2 e da preferência do dono, e as duas são
> de vigilância:** o fantasma é `position: fixed` e **tem de continuar sendo**,
> porque elemento fixo não contribui para o transbordo rolável da janela — se ele
> virar elemento no fluxo (o caminho mais curto num componente Preact), o
> `translateX(+N)` passa a criar barra de rolagem horizontal transitória e o
> rodapé fixo centrado pisca no Blink. **A resposta então é `overflow-x: clip`
> num ancestral — nunca `hidden`**, que viraria `auto` no outro eixo e quebraria
> o `sticky`. E o `scale(.95)` do toque **não** cai na faixa como um todo, só no
> botão (frente 2, R7).
>
> **O que `reduce` deixa no lugar:** o valor aparece na célula, e a célula ganha
> o estado de "acabou de receber" por **forma**, não por movimento. O `prototipo`
> já faz: `if(reduzido){ render(); S.flash=false; }`.

**7 · O relógio tiquetaqueando. NÃO EXISTE.** CSS morto (§8.1). Não especifico,
e registro para ninguém "consertar" a ausência dele.

**8 · A cortina. FICA, e ela não entra no portão — com uma distinção que
importa.**

A cortina é `clip-path: inset(0 0 0 54%)` movido por arrasto. **Enquanto o dedo
está nela, não há movimento a desligar: o dedo é o relógio.** `reduce` não se
aplica a manipulação direta, e pôr `transition` ali seria **pior** — a cortina
atrasaria em relação ao dedo.

> **Requisito 16 · Zero `transition` na cortina enquanto ela é arrastada. E
> `transition: clip-path var(--ins-dur) var(--ins-ease)` quando a posição é
> **tocada** em vez de arrastada** — num toque num dos dois marcadores
> (`.cort .mk.l` / `.cort .mk.r`), que leva a cortina até a ponta. Aí a transição
> **é** a quarta função ("dizer para onde foi") e **entra** no portão, porque aí é
> movimento.
>
> **A distinção em uma frase, e ela vale para o sistema todo:** *o que o dedo
> move não tem transição; o que o app move tem.*

**9 · O clarão do disparo. ESPECIFICADO a partir de um quadro parado, e é um dos
dois que a direção não animou.**

Função: dizer que a foto foi tirada. **E é o único canal disponível**, por dois
fatos registrados: ele está a cerca de 3 m do aparelho, sem alcançá-lo (C7, F45),
e **o Safari do iOS não vibra** (F58). Som há — o `prototipo` tem o ícone `som`
e a locução "Perfil direito… três, dois, um" —, mas som num ambiente onde não se
sabe o ruído não é garantia.

> **Requisito 17 · O clarão é `opacity` de `.62` a `0` em 140 ms, `ease-out`,
> sobre `--ins-foto-tinta`.** O `.62` é o valor que o desenho já traz escrito no
> markup; os 140 ms são meus, e a razão é que ele precisa ser visto **de 3 m e de
> relance** — mais curto não se vê, mais longo esconde a foto que acabou de ser
> feita. **Não medido:** se 140 ms é visível a 3 m. É o mesmo buraco que a
> auditoria registra como *"o maior buraco de acesso que sobra"* — "A 3 m, ele lê
> a tela?", P7, sem resposta.
>
> **O que `reduce` deixa no lugar, e é o requisito que importa:** **o contador e
> a miniatura.** O desenho já tem `4 / 9` na barra de baixo e a foto entrando na
> tira; sob `reduce`, **o contador avançar é o que diz "tirou"**, e ele é estado,
> não movimento. **Requisito: o contador existe e avança nos dois casos**, com e
> sem movimento — senão quem liga `reduce` fica sem nenhum sinal de que a foto
> saiu, numa situação em que ele não está perto da tela.

**10 · O anel que esvazia. ESPECIFICADO a partir de um quadro parado, e é
interpolação — a primeira função.**

Função: **interpolar uma grandeza contínua amostrada** — a contagem de 3 s antes
do disparo. É o mesmo papel da barra do descanso, e a mesma regra se aplica.

> **Requisito 18 · O anel interpola em `stroke-dashoffset`, com `transition:
> stroke-dashoffset <período de amostragem> linear`.** O desenho já traz
> `stroke-dasharray="276"` (que é `2πr` para `r=44`: **conta** —
> `2 × π × 44 = 276,5`) e `stroke-dashoffset` é o que anda. **Não `transform`
> aqui**, e a exceção tem razão: `stroke-dashoffset` não refaz layout, e girar o
> anel por `transform` desenharia outra coisa.
>
> **O que `reduce` deixa no lugar:** **o número no meio, que já está lá, a 76 px**
> (`--ins-n-foto-3`), contando 3, 2, 1. Sob `reduce`, o anel fica **cheio e
> parado** e o número faz o trabalho inteiro. **E o número é melhor do que o anel
> a 3 m**: 76 px contra um arco de 9 px de espessura. **Requisito: o número
> existe nos dois casos.**

### 8.6 · A regra que fecha a seção, e ela é a do app

> **Requisito 19 · Movimento novo entra na tabela com a função que cumpre, antes
> de entrar no código.** É a regra que `DESIGN.md` já escreve, e ela já provou
> valer duas vezes neste repositório: *"A rolagem entrou sem que ninguém citasse
> a regra (`02077e3`); seis dias depois, outra rolagem foi recusada justamente
> por citá-la."*
>
> **As funções autorizadas passam a ser quatro**, e esta é a lista inteira:
>
> 1. **interpolar** uma grandeza contínua amostrada — a barra do descanso, o anel
>    do disparo;
> 2. **dizer que a tela está viva agora** — o ponto ao vivo, se ele sobreviver ao
>    redesenho (ele é do sistema velho e a direção não o tem);
> 3. **dizer de onde uma camada veio** — a folha e o véu (§8.5, item 5);
> 4. **dizer para onde um valor foi** — o fantasma do registro de série, e só ele
>    (§8.5, item 6).
>
> **E a tabela do sistema novo tem sete linhas**, contra as quatro de hoje: o
> toque que afunda, a barra do descanso, a folha, o véu, o fantasma, o clarão e o
> anel. **Não oito**: o `.enter` e o pulso do esqueleto saíram, e o `.tick` nunca
> existiu.
>
> **O que continua recusado, com a razão de cada um, para a próxima pessoa não
> recomprar:** transição entre lugares da barra, deslizar conteúdo, animar altura
> de linha expansível, animar a abertura do cartão de exercício (*"É o momento de
> 6h15"*, `main.jsx`), qualquer movimento no fim do descanso (*"Ele não está
> olhando. O canal é som"*), e **qualquer movimento que marque conquista** — que
> `05-movimento.md` estendeu a "quadro e curva, não só frase".

### 8.7 · As quatro armadilhas de mobile deste projeto, conferidas uma a uma

As quatro notas do dono valem como regra, e eu conferi se o sistema novo
reintroduz alguma. **Nenhuma, e três por medição:**

**1 · `100svh`, nunca `100vh` sozinho, e a cadeia inteira alinhada.**

A direção faz certo no único lugar que importa: `#app { height: 100vh; height:
100svh }` (medi, `prototipo.html:53`) — a forma dupla, na ordem certa, que é
exatamente o que o caso *tela cheia usa svh, não vh* pede (e a frente 2 achou que
o caso aceita `100svh` sozinho com zero iterações, o que também passa).

**Mas a cadeia não está alinhada, e é o defeito que a nota do dono descreve.**
Medi no `prototipo.html`: `html, body { height: 100% }` (`:42`) acima de um
`#app` em `100svh`. **`height: 100%` em `html` não é `100svh`**: ele resolve
contra o bloco contenedor inicial, que não é a viewport pequena. **É um ancestral
em outra unidade, que é o item 2 da nota do dono** ("Basta UM wrapper acima… pra
reintroduzir a sobra").

O app de hoje não tem esse problema porque a casca dele é outra: `body
{ min-height: 100vh; min-height: 100svh }` e **nada** com `height: 100%`
(conferi `src/base.css`).

> **Requisito 20 · Nenhum `height: 100%` em `html` nem em `body`.** A altura de
> tela cheia é `100svh`, com `100vh` só de recuo, e **em um lugar só** da cadeia.
> **Isto é da casca, e a casca é §9.**

**2 · `sticky` morre se qualquer ancestral tiver `overflow` diferente de
`visible`; e `overflow-x: hidden` sozinho também quebra.**

**Medi: `position: sticky` aparece ZERO vezes nos nove HTML da direção.** Ela não
usa `sticky` — e `overflow: hidden` aparece **67** vezes. É §9.

**3 · `backdrop-filter` pisca no Blink e não no WebKit.**

**Medi: zero `backdrop-filter`, zero `will-change`, zero `contain`, zero
`perspective` nos nove.** O app tem duas ocorrências da palavra e **as duas são
comentários dizendo que não se usa**, com a razão. **Os dois lados já concordam,
e o sistema novo mantém zero vidro** (§2.5).

**4 · `translateX(+N)` faz elemento fixo centrado piscar no Blink.**

**Medi os transforms da direção.** `.enter` usa `translateY`, não X — e sai
(§8.5). `.tick` usa `translateY` — e não existe. A cortina usa `clip-path`, não
`transform`. **O único `translateX` com valor positivo possível é o
`voa()`**, e ele é `position: fixed`, que não contribui para o transbordo rolável
— a frente 2 conferiu e eu confirmo no fonte (`.ghost { position: fixed }`,
`prototipo.html:304`). **A armadilha não é este caso**, e o requisito é de
vigilância, não de conserto (§8.5, item 6).

**E uma quinta, que não está nas notas do dono e que eu achei:** `overscroll-behavior`.
A direção declara `html, body { overscroll-behavior: none }` (medi, `:42`) e o app
declara o mesmo em `html, body` (conferi, `src/base.css`, com a razão escrita:
*"Mata o rubber-band… Mata junto o puxar-para-recarregar, que num app instalado é
só uma forma de perder o que estava na tela."*). **Os dois concordam.** E a
direção acrescenta `overscroll-behavior: contain` em `.scroll` e em
`.sheet .sbody`, que é o que impede o rolar de dentro de uma folha de virar
rolar da página atrás. **Isso fica**, e é a única coisa da casca da direção que
entra sem discussão.

---

## 9 · As duas cascas incompatíveis

A frente 2 achou isto conferindo outra coisa (§1.3, R7 dela) e me deixou:
*"quem portar o protótipo escolhe a casca do app, não a dele. Copiar `body
{ overflow: hidden }` junto com o resto deixa o caso **vermelho** — e, pior, por
um motivo que parece arbitrário para quem não leu o comentário, o que convida a
mexer na asserção em vez de na casca."*

**É maior do que uma linha de `body`.** Medi as duas cascas inteiras, e elas são
dois modelos de rolagem opostos.

### 9.1 · O que cada uma é, medido

| | **o app**: a janela rola | **a direção**: rola por dentro |
|---|---|---|
| `html, body` | `overscroll-behavior: none`, **sem altura** | `height: 100%`, `overscroll-behavior: none` |
| `body` | `min-height: 100vh; min-height: 100svh; overflow-x: clip` | **`overflow: hidden`** |
| o contêiner | `#app { max-width: 460px; margin: 0 auto; padding-bottom: calc(--ins-tabbar + --ins-timer-h + --ins-faixa-h + --ins-9) }`, **sem `overflow`** | `#app { position: relative; height: 100vh; height: 100svh; overflow: hidden }` |
| a tela | — | `.screen { position: absolute; inset: 0; display: flex; flex-direction: column; min-height: 0 }` |
| quem rola | **a janela** | `.scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain }` |
| o topo preso | `position: sticky` em `.tc-topo` (`top: 0`) e `.day-rel` (`top: var(--sa-top)`) | **irmão de flex**: `.top { flex: none; padding-top: env(safe-area-inset-top) }`. **Zero `position: sticky` nos nove arquivos** (medi) |
| o rodapé preso | `position: fixed; bottom: 0` na tab bar; `bottom: var(--ins-tabbar)` no cronômetro | **irmão de flex**: `.bot { flex: none; padding-bottom: env(safe-area-inset-bottom) }` |
| a folha | `position: fixed; inset: 0` (`.ins-folha-w`) | **`position: absolute; inset: 0`** dentro do `#app` (`.ov`) |
| a trava de rolagem da folha | `body.ins-travado { position: fixed; inset: 0; overflow: hidden }`, com `body.style.top = -scrollY` | nenhuma: o `body` já não rola |

**As duas funcionam. O que não funciona é a mistura**, e o problema não é
estético: é que **metade do app de hoje lê e escreve a rolagem da janela.**

### 9.2 · A decisão: a casca do app, e a razão é medida

**Medi o que depende de `window` rolar:**

| | quantos |
|---|---:|
| `window.scrollTo(…)` em `src/main.jsx` | **19** |
| `window.scrollY` lido | **3** (`saiDoDestino`, `folha.jsx`, e o comentário de `mudaMes`) |
| `scrollDoDestino[chave]` — a posição guardada por destino | 5 referências |
| `scrollIntoView` | 2 |
| `.focus({ preventScroll: true })` | 3 |
| `history.scrollRestoration = 'manual'` | 1, em `src/ui/navegacao.js`, **com a medição escrita no comentário** |
| `scroll-margin-top: calc(var(--sa-top) + var(--ins-relogio))` em `.ex` | 1, **com caso próprio** |

**E a trava da folha é o caso que decide**, porque ela falha em silêncio. Conferi
`src/ui/instrumento/folha.jsx`: ela lê `window.scrollY`, escreve
`body.style.top = -${y}px`, põe a classe `ins-travado` — que é `position: fixed;
inset: 0` — e devolve a posição ao fechar. **O comentário diz por que é assim:**
*"`position: fixed` é o único jeito confiável no iOS — `overflow: hidden` sozinho
não segura o scroll de toque."*

**Com a casca da direção, `window.scrollY` é sempre zero.** Então
`body.style.top = "-0px"` não faz nada, a trava não trava, e o conteúdo atrás da
folha continua rolando com o dedo no iOS — **que é exatamente o defeito que
aquele código existe para consertar.** E nada estoura: `window.scrollTo` num
`body` que não rola é uma função que retorna sem erro.

> **Requisito 21 · A casca é a do app. A JANELA é quem rola.** A tela da sessão
> **não** vira uma coluna de altura fixa com rolagem interna. O cabeçalho é
> `position: sticky`; a zona do polegar é `position: fixed; bottom: 0`, com a
> altura reservada por token no `padding-bottom` do `#app`, do mesmo jeito que a
> tab bar, o cronômetro e a faixa da sessão já fazem.
>
> **O token novo é um só, e segue o padrão que já existe e já tem razão escrita:**
> `--ins-regua-h`, nascendo `0px` no `tokens.css` e escrito pelo componente
> quando a zona do polegar está na tela — como `--ins-timer-h` e
> `--ins-faixa-h`. O `padding-bottom` do `#app` passa a somar as quatro parcelas.

### 9.3 · A razão, escrita de forma que a próxima pessoa não precise achar o comentário

Isto é o que a frente 2 pediu, e é o único bloco deste documento escrito para ser
copiado para dentro do CSS:

> **Por que o `body` deste app não pode ter `overflow`, e por que `clip` não é a
> mesma coisa que `hidden`.**
>
> *Quem rola nesta interface é a janela. O cabeçalho de cada destino fica preso
> no topo por `position: sticky`, e `sticky` se ancora no primeiro ancestral que
> for um contêiner de rolagem. Qualquer `overflow` diferente de `visible` em
> `html`, `body` ou `#app` cria esse contêiner — e aí o cabeçalho deixa de se
> ancorar na janela e passa a subir junto com o conteúdo, desaparecendo sob a
> barra do Safari. **Não há erro, não há aviso: o cabeçalho simplesmente some ao
> rolar, no telefone, e não no computador.** Como o cabeçalho é a única saída
> visível de um destino de tela cheia, perdê-lo é ficar preso.*
>
> *`overflow-x: hidden` não escapa disso: quando um eixo é `hidden`, o outro
> passa a valer `auto`, e `auto` é contêiner de rolagem. `overflow-x: clip` é a
> única forma que corta sem criar contêiner, e é por isso que o `body` tem `clip`
> e não `hidden`. O `clip` está aqui para matar o rubber-band — puxar além do fim
> revelava uma faixa do fundo que não devia existir — e não para esconder
> conteúdo.*
>
> *E `clip` tem um preço que precisa ficar dito: conteúdo mais largo que a tela
> **desaparece em vez de rolar**. Numa janela de 320 px isso satisfaz o critério
> de reflow (não há rolagem horizontal de página) e **perde função** (há conteúdo
> inalcançável, sem nenhum sinal). Quem medir larguras estreitas tem de anotar as
> duas coisas em colunas separadas: **cortado não é rolável.***
>
> *A folha depende da mesma escolha por outro caminho: ela é `position: fixed`, e
> a trava de rolagem do corpo enquanto ela está aberta lê `window.scrollY` e
> escreve `top: -Ypx` no `body`. Se a janela não rolar, `scrollY` é zero, a trava
> não trava, e no iOS o conteúdo atrás da folha volta a rolar com o dedo — sem
> erro nenhum.*
>
> *Em resumo: **`overflow-x: clip` no `body`, e mais nada.** Nem no `body`, nem no
> `html`, nem no `#app`. Se uma tela precisar de rolagem interna, ela declara o
> `overflow` **no elemento que rola**, e esse elemento não pode estar entre um
> `sticky` e a janela.*

### 9.4 · E o buraco que nenhum dos 38 casos pega — medido

O caso *nenhum ancestral do sticky vira scroll container* inspeciona **só
`body`**, e só em `base.css` (conferi a linha: `const corpo = regras(base,
'body')`). A frente 2 o achou (buraco 4 dela). **Eu medi, e a direção escolhida
já traz o defeito pronto:**

`prototipo.html:53` declara
`#app { position: relative; height: 100vh; height: 100svh; width: 100%; overflow: hidden; background: var(--bg) }`.

Portei esse CSS para dentro de `componentes.css` e rodei os 38 (§0.3): **o caso
ficou verde.** Um `overflow: hidden` em `#app` mataria o `sticky` do cabeçalho do
modo de sessão — que é onde mora a única saída visível (frente 1, §4.3, item 5) —
e **nenhum dos 38 casos diria uma palavra.**

> **Requisito 22 · O caso passa a inspecionar a cadeia inteira, e a cadeia é
> conhecida.** `html`, `body`, `:root`, `*` e `#app` — a mesma lista que o caso
> *nada entre a folha e a janela cria bloco de contenção* já usa, e é de fonte e
> não de DOM pela mesma razão escrita lá: *"o defeito nasce de uma linha nova em
> `html`, `body` ou `#app`, não da árvore."*
>
> **Com uma exceção nomeada por seletor, e eu não a tinha visto:**
> `body.ins-travado { position: fixed; inset: 0; overflow: hidden }` — a trava da
> folha. Ali o `overflow: hidden` **está certo**: o scroll da página está
> desligado de propósito, não há `sticky` a ancorar, e a posição é devolvida ao
> fechar. Sem nomear a exceção, a verificação da cadeia inteira fica **vermelha
> no código correto**. Nomeá-la **por seletor**, e não por arquivo, é o que faz
> um `overflow: hidden` **novo** em `body` ou em `#app` continuar sendo pego.
> **(Quem implementou isto na árvore de trabalho enquanto eu escrevia viu a
> exceção antes de mim — §0.5.)**
>
> **Os dois casos passam a olhar a mesma árvore**, e isso é o conserto do buraco
> 4 da frente 2: hoje um olha `body` e o outro olha cinco seletores, e o vão entre
> as duas listas é exatamente onde o `#app` cabe.
>
> **E `overflow-x: clip` continua autorizado, por nome, com a razão na própria
> asserção** — senão o conserto mata a regra que o `clip` serve.

---

## 10 · O que eu fui conferir e não bateu

Onde o código discorda do que estava escrito, **vale o código.** Nove pontos, e
os cinco primeiros mudam trabalho.

| # | o que estava escrito | o que o código diz |
|---|---|---|
| 1 | Os 38 casos se dividem em **10 acoplados** a nome concreto e **28 invariantes genéricas** (`08-rede.md` §4) | A divisão real é **13 invariantes puras, 16 presos a nome do app, 8 da bancada e 1 que afirma a paleta por valor hexadecimal** (§0.1). São **25** casos amarrados a nome concreto, não 10. **E a conta de "quantos ficam vermelhos" não existe:** os nove arquivos lidos no escopo do módulo derrubam a carga, e **medi** — renomeei `src/treino.css` numa cópia e a suíte respondeu `Tests  no tests`. **Zero de 38 executados**, e o relatório diz "erro de carga", que ninguém lê como regressão de design (§0.2, B0) |
| 2 | A direção D propôs **quatro gestos com função**, e o trabalho é especificá-los (meu briefing, e `07-plano.md`, frente 4) | A prosa propôs quatro; **o fonte tem sete movimentos**, e eles não são os quatro. **Dois dos quatro nomeados não têm quadro nenhum:** o clarão é um `<div>` branco estático com `opacity:.62` no markup, e o anel é `stroke-dashoffset="166"` **fixo**. Um sétimo é **CSS morto** — `@keyframes tick` existe e a classe `tick` nunca é aplicada. E três movimentos que **existem** não estão na lista: o bloco que chega, o esqueleto que pulsa e a barra do descanso (§8.1, §8.2) |
| 3 | A `Procedencia` "não é mantida como primitiva" por nenhuma das direções, e "ou a frente 4 a reconstrói como token e componente, ou ela deixa de ser regra" (`07-plano.md` §4) | A frase está certa **sobre as duas direções** e não há nada a reconstruir: ela **é** primitiva no app, com componente (`src/ui/instrumento/primitivos.jsx`), classe (`.ins-provenance`), razão de cor medida no comentário, e **47 chamadas em 12 arquivos** (medi). A alternativa não é "reconstruir ou perder": é **preservar ou perder** (§7) |
| 4 | Nenhum dos 38 casos cobre o que a direção derruba | **Três inegociáveis caem e nenhum caso diz uma palavra.** Medi: a direção traz **511** `border-radius` em 20 valores contra **11** declarações (seis delas `50%`) no app; **zero** `font-family` contra o par Space Grotesk + IBM Plex Mono com 16 papéis; **58** `box-shadow` contra 4, e as 4 do app são fio desenhado como sombra. **Não existe caso sobre raio, sobre sombra nem sobre família** (§2) |
| 5 | O cronômetro "não anima largura" é regra protegida por caso | **Medi: portei o CSS da direção e o caso ficou VERDE** com `.bar i { transition: width 1s linear }` e `bar.style.width = …%` dentro do mesmo arquivo. A asserção casa `#tfill` por nome **e** o nome literal da variável `fill` (`!/fill\.style\.width/`). A direção já escreve `bar.style.width` — **renomear a variável desarma a asserção, e ela já está renomeada** (§8.5, item 4) |
| 6 | "A única animação infinita é o cursor de texto do teclado próprio da C, a 1 Hz" (`04-acesso.md` §1), repetido pela frente 2 (§6.2, T4: "é o único movimento infinito dos dois arquivos") | **São duas.** `.sk { animation: pulse 1.4s ease-in-out infinite }` está em **oito dos nove** arquivos da D, `momento-1.html` incluído. As duas passam 2.3.1 (0,71 Hz e 1 Hz, abaixo de 3 Hz) — **mas o critério que vale para o pulso é 2.2.2**, e ninguém o aplicou: ele escapa de "dura mais de cinco segundos" **por um segundo**, porque o prazo de carregando da direção é 4 s (§8.5, item 3) |
| 7 | A frente 2 achou **sete classes** de controle a exatamente 44 px e declarou a contagem de instâncias como não medida | **São oito dentro do telefone**: falta `.seg3 button`, que existe em seis dos nove. E uma das sete que ela listou — `.themes button` — é o botão `Sistema · Claro · Escuro` **da galeria**, fora do telefone. **E a contagem de instâncias não é a medida certa:** medi ~370, mas metade é o mesmo estado pintado duas vezes (claro e escuro) e `.nav .act` com 121 botões é a barra de cinco lugares repetida por estado — no app são **cinco** controles. A unidade é a classe, e são oito (§5.3) |
| 8 | O contrato manda "foco sempre visível" (`docs/LASTRO_UX_CONTRACT.md` §11) | **O app não tem regra de `:focus-visible` para botão nenhum.** Medi as quatro folhas de regra: existe **uma** regra de anel para elemento não-campo (`.tc-titulo:focus-visible`) e **sete** `outline: none` em campos, todos com substituto. Todo botão do app depende do anel padrão do navegador, sobre um canvas `#0C0E0C`, e **nenhum dos 38 casos olha anel de foco**. A direção declara um `button:focus-visible` e a auditoria mediu **525 de 525** focáveis recebendo anel — é a única das trocas em que ela é estritamente melhor de graça (§5.5) |
| 9 | `DESIGN.md`, Espaço: o caso da escala "não lê `protocolo.css` nem **estilo embutido no JSX**" | A primeira metade está certa. A segunda **envelheceu**: medi **zero** `style={{…}}` em `src/ui/` e **zero** `style="` em `src/main.jsx`. Não há estilo embutido a cobrir. E a lista de ressalvas de lá não menciona os quatro buracos que eu medi — longhand lateral, ponto-e-vírgula no fim, decimal lido errado e fronteira de regra atravessada (§0.2) |

**E o que eu fui conferir e bateu**, para a lista não ser só de divergência:

- **`rem` aparece zero vezes nas seis folhas** — confirmei, e estendi: **toda**
  `font-size` e **todo** atalho `font:` das seis está em px.
- **O padrão interno de 46 px é token com razão escrita** (`--ins-tap`), e o
  contrato de UX o repete.
- **Os 12 alvos abaixo de 44 px da direção são dois de classe** — `.map` a 30 e
  `.daytype` a 36 —, e medindo os **nove** arquivos não aparece nenhum terceiro.
- **`.cellb` tem cerca de 22 px** e **não** tem `::after` (procurei: não existe).
- **O 178 da auditoria está certo** para `momento-1` (54) mais `momento-2` (124).
- **A direção não usa `backdrop-filter`, `will-change`, `contain` nem
  `perspective`** — zero de cada nos nove. A armadilha do dono não é
  reintroduzida.
- **A conta de contraste reproduz sete medidas independentes de C3**, ao
  centésimo (§1.4). É o que me deixa estender a conta ao escuro dos sete
  arquivos que ninguém mediu.
- **A direção já cumpre `tela cheia usa svh, não vh`**, na forma dupla
  (`height: 100vh; height: 100svh`).
- **`position: sticky` aparece zero vezes nos nove** — a direção pina por irmão
  de flex, e é por isso que §9 existe.

**Quatro correções que eu faço a mim mesmo**, porque são do mesmo tipo das nove
de cima e seria desonesto listar só as dos outros:

1. **Eu ia escrever que `.k` tem duas definições contraditórias na direção** —
   `.k{color:var(--ink-2)}` num arquivo e `.k{… caixa alta, acento}` em outro —
   e que o nome da classe significava duas coisas. Fui conferir arquivo por
   arquivo: `.k` como seletor de topo existe **só em `semana.html`**, com a
   definição de caixa alta; a outra era seletor descendente, de outro `.k`. **O
   achado continua sendo quatro classes para um trabalho, mas não há colisão de
   nome** (§7.2).
2. **Eu ia listar `.themes button` entre os alvos de 44 px do produto.** É o
   botão de troca de tema **da galeria**, fora do telefone. Não conta, e eu o
   tirei antes de somar (§5.3).
3. **Eu ia propor uma família de tokens `--ins-procedencia-*`.** Desisti: ela é
   um **papel tipográfico**, e os três valores que a definem já são tokens. Um
   token a mais seria um quarto lugar onde a mesma decisão mora — que é
   exatamente a doença que §7 descreve (§7.4).
4. **Eu ia escrever que "o contraste do tema escuro nunca foi medido".** Fui ler
   o método da auditoria e ela diz, com todas as letras, *"Medi os dois temas"*.
   O que não foi medido é **sete arquivos**, nos dois temas, porque são
   posteriores a ela — e `07-plano.md` §1.3 #1 já dizia isso com precisão ("nas
   telas novas"). Eu ia dar à frente 4 um crédito que era do plano (§1.4).

**E a nota sobre o método**, porque é o tipo de coisa que passa: **tudo que esta
frente afirma de cor, de tamanho, de contagem e de movimento foi medido com um
comando, e o comando está reproduzido ao lado do número.** A medição mais útil do
documento é a de §0.3 — portar o CSS da direção para dentro das folhas de hoje e
rodar os 38 —, e ela custa dois comandos. **Nada foi alterado no repositório para
produzi-la:** a cópia mora no diretório de rascunho da sessão.

**Mas medir cor não é ver cor.** Razão de contraste é aritmética sobre dois
hexadecimais; o que o dono vê é um painel de 1,03:1 na luz de um subsolo de
academia às 6h15, e **isso não está medido e não dá para calcular.**

---

## 11 · Os 23 requisitos, os casos, o que sobe à mesa dele, e o que ninguém mediu

### 11.1 · Os requisitos, numa lista

| # | o requisito | onde |
|---:|---|---|
| 0 | A lista `FOLHAS` passa a ser varredura de `src/*.css`, não literal | §0.2 |
| 1 | A forma do CSS é do sistema: uma declaração por linha, `;` sempre, um token por linha | §0.4 |
| 2 | Cor é token em qualquer notação — `rgba`, `hsl`, `oklch`, `color-mix` —, com a exceção de preto e branco com alfa dentro de `box-shadow` | §1.7 |
| 3 | A câmera é um tema, com seis `--ins-foto-*` fixos nos dois temas e a razão escrita | §1.7 |
| 4 | O piso de texto é 11 px, com a exceção de 9 px dentro de `svg` de gráfico | §3.2 |
| 5 | Tipo em `rem`, geometria em `px`, e um controle de três degraus em Ajustes | §4.2 |
| 6 | `.cellb::after { position: absolute; inset: -12px 0 }` — 46,4 px de alvo | §5.2 |
| 7 | `outline` é do foco e de mais nada; o estado de correção usa outro canal | §5.2 |
| 8 | As oito classes a 44 px sobem para `--ins-tap`, com duas exceções escritas | §5.3 |
| 9 | Três tokens de foco e uma regra global de `:focus-visible` | §5.5 |
| 10 | O ícone entra por um componente cuja assinatura não deixa esquecer a escolha | §6.3 |
| 11 | `Procedencia` continua primitiva, e é a única forma de dizer de onde veio um número | §7.3 |
| 12 | O portão de movimento é por adesão, e o `reduce` declara o estado final | §8.4 |
| 13 | `:active` muda o preenchimento, **fora** do portão | §8.5 |
| 14 | A barra do descanso interpola em `transform: scaleX()`, nunca em `width` | §8.5 |
| 15 | A quarta função autorizada é "dizer para onde um valor foi", com um usuário só | §8.5 |
| 16 | Zero `transition` na cortina arrastada; transição só quando o app a move | §8.5 |
| 17 | O clarão é `opacity .62 → 0` em 140 ms, e o contador avança nos dois casos | §8.5 |
| 18 | O anel interpola em `stroke-dashoffset`, e o número de 76 px existe nos dois casos | §8.5 |
| 19 | Movimento novo entra na tabela com a função que cumpre, antes do código | §8.6 |
| 20 | Nenhum `height: 100%` em `html` nem em `body`; `100svh` em um lugar da cadeia | §8.7 |
| 21 | A casca é a do app: a **janela** rola. Mais `--ins-regua-h`, o quarto token de altura reservada | §9.2 |
| 22 | O caso do `sticky` passa a inspecionar `html`, `body`, `:root`, `*` e `#app` | §9.4 |

### 11.2 · Os 38 casos, um destino para cada: 9 + 12 + 8 + 1 + 8

A classificação de §0.1 é por **acoplamento**. Esta é por **destino**, e as duas
contas fecham em 38.

**Vão inteiros, sem uma letra mudada — 9.** *tela cheia usa svh, não vh*; *a
paleta antiga não existe mais, nem por apelido*; *a raiz recusa os gestos de
zoom*; *o viewport não deixa o navegador escalar a página*; *a pinça do WebKit é
recusada*; *segurar o dedo na interface não abre menu nem seleciona*; *a barra
deslizante toma o gesto*; *o toast é anunciado por leitor de tela*; *nada entre a
folha e a janela cria bloco de contenção*. **São a especificação mobile deste
produto, e a rede estava certa sobre eles.**

**Mudam de seletor e de nada mais — 12.** *o voltar fica grudado no topo*; *o
relógio da sessão gruda no topo*; *a barra de status tem fundo*; *o cronômetro
não divide o rodapé com a tab bar*; *abrir um exercício sabe onde parar de
rolar*; *a tela cheia tem título de primeiro nível, e ele recebe foco*; *mas
campo e prosa continuam selecionáveis*; *alvo de toque não é forçado duas vezes*;
*o alvo do tick cresce só na vertical*; *a marca de recorde não pinta ácido sobre
ácido*; *o app avisa quando o telefone está deitado*; *a trava de retrato não
pega janela de computador*.

**Mudam de asserção, com a razão — 8:**

| caso | o que muda |
|---|---|
| *a paleta do Instrumento está inteira e mora nos tokens* | passa a afirmar os **20 tokens novos nos dois temas**, e a afirmar que **todo token de cor tem valor nos dois** — que é a asserção que a de hoje não faz, porque hoje há um tema só |
| *cor nova não entra solta no meio das regras* | cobra `rgba`, `hsl`, `oklch` e `color-mix` além de `#hex` (requisito 2) |
| *espaço vertical fica na escala de 4* | lê as cinco folhas, cobra os longhands laterais e de eixo, não exige `;`, lê decimal como decimal e não atravessa `}` (§0.2). **Quatro dos cinco já feitos na árvore de trabalho; falta o decimal (B3), §0.5** |
| *toda custom property usada tem dono* | vê bloco minificado (B6), e ganha a **recíproca**: todo dono é usado. Medi **2** tokens definidos e nunca usados hoje |
| *o campo nunca fica abaixo de 16px* | passa a cobrar `1rem`, com a razão: o que o Safari exige é 16 px **computado**, e o piso sobe junto do controle de tamanho |
| *o cronômetro de descanso não anima largura* | para de depender de `#tfill` e do nome da variável `fill` (requisito 14). **Já feito na árvore de trabalho, §0.5** — e o caso novo *nenhuma `transition` menciona `width` nem `height`* continua sendo necessário, porque o endurecimento amarra a barra **do app** e não uma barra nova |
| *nenhum ancestral do sticky vira scroll container* | inspeciona a cadeia inteira — `html`, `body`, `:root`, `*`, `#app` —, com `body.ins-travado` nomeada como exceção (requisito 22). **Já feito na árvore de trabalho, §0.5** |
| *controle pequeno estende o ALVO sem crescer o desenho* | `.cellb` entra na lista, e ele é o caso mais forte que a regra já teve |

**Morre, e é o único que o sistema novo apaga em vez de renomear — 1.** *O texto
que se toca não usa o nível mais apagado*. Ele existe porque `--ins-text-5` mede
**3,22:1** (medi) e cinco seletores precisavam ser proibidos de usá-lo. **A
paleta nova tem três níveis de texto e os três passam em AA nos dois temas, sobre
os quatro fundos** — o pior caso é 4,87:1 (§1.4). O caso vira uma afirmação sobre
a **paleta** e não sobre quem a usa: *não existe nível de texto abaixo de 4,5:1
sobre nenhum dos quatro fundos, em nenhum dos dois temas.* Uma asserção, e
nenhuma lista de seletores para envelhecer.

**Ficam em limbo — 8.** Os da bancada. `07-plano.md` §4 manda trocar
`src/palco.js` e `src/palco.css` "por outra coisa, não desenhada", e a frente 1
registrou isso como o achado 9 dela. **Enquanto a bancada existir, os oito valem
inteiros e eu não toco neles.** Quando ela sair, saem com ela — e é bom que isso
seja uma decisão e não um efeito colateral.

### 11.3 · Os treze casos novos, que é o que torna este documento executável

Cada um ficaria **vermelho hoje** se escrito agora, e é por isso que cada um vale.
O número de vermelhos de nascença está ao lado.

| o caso novo | vermelho hoje em | de onde |
|---|---|---|
| *o raio só anda na escala, e nenhum literal fora dos tokens* | nada hoje (o app não tem raio); **511 declarações** ao portar a direção | §2.1 |
| *nenhum tamanho de texto abaixo de 11px, exceto em `svg` de gráfico* | **3 lugares** (`.chart .axu` 7,5, `.cal-h` 8,5, `.cal-d .per` 8) | §3.2 |
| *todo tamanho de texto é `rem`, e px de tipo só em tokens.css* | **221 declarações** | §4.2 |
| *existe uma regra global de `:focus-visible`* | **1**: não existe | §5.5 |
| *nenhum `outline: none` sem substituto visível na mesma regra* | 0 hoje (os sete têm) — e é exatamente por isso que ele vale: ele segura o que já está certo | §5.5 |
| *`outline` só aparece em `:focus-visible`* | 0 hoje; **1** ao portar a direção (`.cellb.fix`) | §5.2 |
| *nenhum `<svg>` escrito à mão fora do catálogo de ícones* | n/a hoje; é o que torna a regra dos ícones barata | §6.3 |
| *nenhuma folha estiliza `small` por contexto* | 0 hoje; **27 regras** ao portar a direção | §7.3 |
| *todo movimento mora dentro de `no-preference`* | **4** hoje (1 `@keyframes` e 2 `transition` fora, mais o curinga) | §8.4 |
| *todo bloco `reduce` que anula um `transform` declara o estado final* | 0 hoje; é o modo de falha que mais se parece com "funcionou" | §8.4 |
| *nenhuma `transition` menciona `width` nem `height`* | 0 hoje; **1** ao portar a direção | §8.5 |
| *nenhum `height: 100%` em `html` nem em `body`* | 0 hoje; **1** ao portar a casca da direção | §8.7 |
| *a lista de folhas é varredura, e nenhum token é definido sem uso* | **2** tokens hoje | §0.2, §1.1 |

**E uma regra de método para quem os escrever:** todos são de **fonte**, não de
DOM, pela razão que o caso da folha já escreve — *"o defeito nasce de uma linha
nova em `html`, `body` ou `#app`, não da árvore."* Jsdom não faz layout; o fonte
denuncia.

### 11.4 · O que sobe à mesa dele — e as SEIS linhas estão respondidas

**Esta mesa fechou em 06/10.** Nenhuma linha desta tabela espera resposta.

| o que | onde | por que subia | o que ele decidiu |
|---|---|---|---|
| **Três dos seis inegociáveis caem** — raio zero, número em mono mais prosa em display, e o rótulo mono como estrutura | §2.1, §2.2 | são regras numeradas do sistema, com razão escrita, e a direção que ele escolheu as derruba. **Não é decisão de quem escreve o documento de sistema** | **OS TRÊS CAEM** (decisão 12), com nota literal ***"sem herancas"*** — limpos, sem meia-medida do sistema velho. **A ressalva deste documento** (o canal mais fraco do rótulo sem mono) **foi derrubada**: o custo foi aceito, não compensado |
| **O terceiro sinal passa de "destrói dado" para "pare"** | §1.3 | é mudança no inegociável 4, e o que distingue "falhou" de "vai destruir" passa a ser a palavra | **MUDA para "pare"** (decisão 13) — aceita como escrita; *"a palavra carrega a diferença"*. Consequência: *"Isso não tem volta"* passa de redundância a canal |
| **A folha sobe ao abrir** | §8.5, item 5 | derruba uma proibição escrita em dois documentos (`DESIGN_SYSTEM.md:18` e a recusa explícita de `05-movimento.md`), e eu a derrubo com a razão — mas derrubar proibição escrita não é minha | **SOBE** (decisão 14) — aceita como escrita, e *"a proibição escrita em dois documentos cai"*. Só para a folha: a proibição fica de pé para lista, cartão e tela |
| **O controle de tamanho de texto para em 125%, não em 200%** | §4.3 | **escrevo contra 1.4.4 de propósito**, e a razão é a régua: a 200% ela mostra 2 de 12 valores | **125%** (decisão 10), *"e fica escrito que não cumpre 1.4.4"* — aceita como escrita, inclusive a declaração contra o critério |
| **Se 320 px é alvo deste produto** | §4.5 | o contrato o põe no checklist, o aparelho dele tem 414, e o segundo usuário não existe no dado | **NÃO É. O alvo é 414, e 320 fica declarado fora** (decisão 15 + a delegação da noite). A invariante fica: nada com largura fixa maior que a tela, e a página nunca rola na horizontal. **G5 e G6 deixam de ser portão** |
| **Se o bloqueio de pinça pode ser revisto** | §4.1, §4.5 | depende de G4. Se a tela sobreviver a 200%, o bloqueio passa a ser teto escolhido; se não, ele é a única coisa que a segura de pé | **FICA, por decisão dele e sem depender de medição** (decisão 11): *"nao quero esses zoom automatico e pronto. nao gosto."* **E ele mediu que a pinça FUNCIONA no PWA instalado** — ali a declaração não faz efeito. As duas coisas valem |

**A mesma decisão 9 que fecha o lado da régua não é desta frente, mas amarra
este documento:** se a medição A da frente 2 reprovar a régua, ela vai para os
botões fixos da Direcção C — **pré-autorizado, e a medição ainda não
aconteceu**. É a geometria que trava o teto de texto em 125% (§4.3), então o
teto é firme **hoje** e amarrado a um resultado que ninguém tem.

### 11.5 · O que esta frente não decide

- **Os cinco lugares e o fluxo entre eles** (frente 1), **o estado e a interação
  dentro de cada um** (frente 2), e **as palavras** (frente 3) — inclusive os
  rótulos que eu citei como exemplo em §6.2, que são ilustração de formato e não
  proposta de voz.
- **Onde o controle de tamanho de texto mora.** Eu propus Ajustes, porque é onde
  a frente 1 já pôs a troca manual de tema (§1.6 dela) e é a mesma espécie de
  coisa. **É proposta ao território dela**, não decisão minha.
- **Se o piso de 11 px cabe no calendário e no gráfico.** Três declarações sobem
  (§3.2), e o calendário tem sete colunas em 382 px. **É olho em tela.**
- **O que acontece com a bancada.** Oito dos 38 casos vivem nela e
  `07-plano.md` §4 já a mandou para depois.

### 11.6 · O que ninguém mediu, e esta frente herda sem inventar número

**Do contraste e da cor:**

- **O contraste composto dos sete arquivos que a auditoria não alcançou** — as
  seis telas da segunda rodada e o `prototipo.html` —, **nos dois temas**.
  Protocolo na **medição F** (§1.7), com as duas mudanças de método que ele exige.
- **Se o preenchimento de 1,03:1 do painel de atenção se vê.** A conta diz que
  ele quase não difere da página; o que o olho faz com isso, não.
- **A luz da academia, o sol, a luva e o magnésio.** `01-fatos.md` não os
  registra e a auditoria repete. **Toda razão de contraste deste documento é
  contra um vidro limpo num quarto neutro.**
- **Daltonismo.** A auditoria não simulou, e a defesa medida é a mesma: nenhum
  estado é dito só por cor. Com a regra dos ícones (§6.2, caso 3), nenhum passa a
  ser dito só por **forma** tampouco.

**Do tamanho e da largura:**

- **320 px e 200%**, nas seis passadas da **medição G** (§4.5), nos dois temas. E
  a distinção que ela tem de registrar em colunas separadas: **cortado não é
  rolável.**
  **RECONCILIADO em 06/10:** 320 px **não é alvo** e o teto de texto é **125%**,
  então das seis passadas só **G1, G2 e G3 são portão**. G5 e G6 (320 px) viram
  medição opcional que produz a lista do que quebraria com um segundo usuário, e
  G4 (200%) continua informativa. **Nenhuma das seis foi executada.**
- **Se alguma linha quebra a 112,5% e a 125%.** Medi quantas declarações se
  movem; não medi o que o texto faz quando se move.
- **Se 2 px de raio e 1 a 2 px de tipo aparecem.** São 84 seletores de raio e
  199 declarações de tipo que andam no máximo 2 px (§2.1, §3.2). **Nenhuma
  aritmética responde isso.**
- ~~**Se `user-scalable=no` continua honrado no app instalado.** O comentário do
  `index.html` afirma que sim; eu não medi.~~ **MEDIDO em 06/10, pelo dono, no
  aparelho: a pinça FUNCIONA no PWA instalado.** Então a camada 1 **é decoração
  ali** — e, com ela, as camadas 2 e 3 também. O comentário do `index.html`
  continua afirmando o contrário, e isso é conserto de uma linha em `src/`.
  **A decisão de manter as três é dele e fica** (decisão 11).

**Do movimento:**

- **Se 140 ms de clarão se vê a três metros** (§8.5, item 9). E, atrás disso, a
  pergunta que a auditoria chama de *"o maior buraco de acesso que sobra"*: **a
  3 m, ele lê a tela?** (P7, sem resposta).
- **Se o toque que afunda, com o preenchimento do requisito 13, se vê com a mão
  suada.** O parecer já declarou não medida a taxa de toque errado com a mão
  suada, e a medição A da frente 2 a mede **só para a régua**.

**Do leitor de tela e do corpo:**

- **VoiceOver no iOS de verdade.** C3 mediu a árvore em Chromium. Toda a regra
  dos ícones (§6) foi escrita contra a norma e contra a medida de Chromium,
  **não** contra o leitor que o dono usaria.
- **As necessidades de acessibilidade do dono.** `04-acesso.md` §7: *"o
  repositório não as registra."* **Então o requisito 5 não nasce de necessidade
  medida dele** — nasce de piso para qualquer usuário, que é a decisão P3/D8
  ("nada usa a rotina do dono como regra"). Isso precisa ficar dito, porque é a
  diferença entre atender um fato e atender um critério.

**Do material:**

- **Os sete arquivos da direção que a auditoria não mediu nunca foram medidos em
  nada** — nem contraste, nem alvo, nem árvore de acessibilidade, nem foco. Eu
  medi deles o que é aritmética de fonte (cor, tamanho, raio, sombra, contagem de
  ícone, movimento). **Alvo, árvore e foco deles continuam não medidos.**
- **E o protótipo testou três minutos, não semanas.** Tudo que eu afirmei a partir
  dele — a geometria da régua, a casca, o movimento, o `.cellb` — é impressão de
  uso posta de pé por um desenhista num dia, não hábito. **Hipótese, não fato.**

---

## 12 · Reconciliação com as decisões de 06/10

Este documento foi escrito em 05/10. As 23 decisões do dono vieram em **06/10**,
e a autoridade sobre elas é a ONDA 5 de `docs/redesign/00-coordenacao.md`, que
**não** é editada aqui.

**As seis linhas que esta frente levou à mesa dele foram respondidas, e cinco
delas passaram como estavam escritas.** A única que mudou de natureza foi a dos
três inegociáveis: ela passou, mas **com a ressalva derrubada**.

### 12.1 · O que foi alinhado

| o que mudou aqui | contra qual decisão / medição | onde | sentido |
|---|---|---|---|
| **Os três inegociáveis caem, e a nota é "sem herancas"** | decisão 12 | §2 (bloco de abertura), §2.2 item 3, §11.4 | passou, **ressalva derrubada** |
| **O terceiro sinal muda para "pare"** | decisão 13 | §2.4, §11.4 | passou inteiro |
| **A folha sobe ao abrir**, e a proibição escrita cai — só para a folha | decisão 14 | §8.5 item 5, §11.4 | passou inteiro |
| **O teto do texto é 125%**, com 1.4.4 declarado não cumprido | decisão 10 | §4.3, §11.4 | passou inteiro |
| **320 px não é alvo; 414 é**, com a invariante de pé e G5/G6 fora do portão | decisão 15 + a delegação da noite (pergunta 8) | §4.5, §11.4, §11.6 | decidido |
| **O bloqueio de pinça fica, por decisão dele — e a pinça FUNCIONA no PWA instalado, medido** | decisão 11 + a medição da noite (pergunta 7) | §4.1, §11.4, §11.6 | decidido, **e a razão escrita da camada 1 cai** |

**A ressalva derrubada, dita uma vez com clareza**, porque é o único lugar deste
documento onde o dono andou além do que ele recomendava: eu recomendei a queda
dos três **declarando a perda** — sem monoespaçada, a diferença entre rótulo de
estrutura e ênfase passa a depender só de tamanho e de tracking, e **esse é um
canal mais fraco**. A nota dele é *"sem herancas"*: **a queda é limpa.** Nenhuma
família mono de reserva para rótulo, nenhum raio zero preservado num canto,
nenhuma regra de dois pesos como ponte. **O argumento fica escrito porque
continua verdadeiro e o custo continua real** — ele foi aceito, não resolvido.

### 12.2 · O que esta reconciliação NÃO resolve

- **A medição G não foi executada**, em nenhuma das seis passadas. As decisões
  mudaram o **destino** de três delas (G5 e G6 saíram do portão, G4 segue
  informativa), não o fato de que ninguém mediu.
- **Se o canal novo do rótulo se distingue da prosa em uso** — caixa alta com
  tracking a 15 px contra prosa a 14 px, a um braço, na luz da academia.
  **Ninguém mediu**, e a frente 3 declarou a mesma ausência (§14 dela). A decisão
  12 aceitou o custo; ela não o mediu.
- **O comentário de `index.html` continua afirmando que o Safari respeita
  `user-scalable=no` instalado na tela de início.** A medição de 06/10 o
  desmente. É conserto de uma linha em `src/`, e esta reconciliação não toca em
  `src/` — fica apontado. (O comentário equivalente em `src/base.css` já foi
  corrigido, em `d625147`.)
- **O contrato de UX vigente continua pedindo 320 px no checklist de tela nova.**
  A decisão o contraria, e ninguém reescreveu o contrato.
- **`DESIGN_SYSTEM.md:18` e `docs/design-review/05-movimento.md` continuam
  proibindo animação de entrada.** A decisão 14 abre **uma** exceção, para a
  folha. Quem reescrever os dois documentos escreve a exceção; **apagar a regra
  seria ir além do que ele decidiu.**
- **O teto de 125% é firme hoje e amarrado a um resultado que ninguém tem.** A
  geometria da régua é o que o trava, e a decisão 9 pré-autorizou trocar a régua
  **se a medição A reprovar** — medição que exige o aparelho e o dedo dele e que
  **não aconteceu**. Se os botões fixos entrarem, a pergunta "125% é pouco?"
  volta a fazer sentido.
- **Nenhuma das 23 decisões tocou os nove buracos de asserção de §0.2, os 13
  casos novos de §11.3, nem os oito casos em limbo na bancada.** Isso continua
  como estava.
