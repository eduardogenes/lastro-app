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

### 0.2 · Sete buracos nas asserções — quatro deles novos, e um é estrutural

A frente 2 achou quatro buracos nos 38 (§0.1 dela) e eles valem. Conferi os
quatro e achei três mais, **e um deles cancela a conta inteira de "quantos ficam
vermelhos".**

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

Três dos sete buracos (B2, B4, B6) têm a **mesma** causa: as regras deste
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

**Então corrijo o meu briefing em dois pontos:** o escuro **foi** medido — a
auditoria diz "medi os dois temas: claro, e escuro por `data-theme='dark'`" — e o
que não foi medido é **sete arquivos, nos dois temas**. E nos seis da segunda
rodada o método da auditoria não funcionaria como está: `data-theme` não existe
neles, o escuro é `.phone.dark`.

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
quase não agrupa — e é exactly o R-D7 da auditoria**, que mediu 32 controles cujo
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
