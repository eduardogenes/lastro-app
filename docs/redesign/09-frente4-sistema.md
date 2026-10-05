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
