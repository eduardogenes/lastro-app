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
