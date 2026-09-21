# 01 · Conformidade — o código medido contra o que está escrito

Agente 1. Este documento não opina sobre nenhuma regra: só diz se o código a
cumpre, a viola ou se ela não tem como ser medida, e mostra onde.

## Como ler

Cada regra verificável dos três documentos recebeu um identificador estável:
`D-nn` para o `DESIGN.md`, `U-nn` para `docs/LASTRO_UX_CONTRACT.md`, `M-nn`
para a `MARCA.md`. **Os cinco relatórios seguintes citam estes ids.** A ordem é
a do documento de origem, de cima para baixo; ids não são reaproveitados.

Três veredictos, e só três:

| veredicto | o que quer dizer |
|---|---|
| **cumprida** | o código faz o que a regra manda, e a coluna de evidência mostra onde |
| **violada** | o código faz diferente, com contagem e `arquivo:linha` |
| **não mensurável** | a regra não tem critério que dê resposta, e está dito o que faltaria |

Onde a regra é literal mas admite duas leituras, o veredicto vem com o critério
de medição escrito na frente. Onde o código faz algo que a regra não previu sem
contradizê-la, isso aparece como **fronteira** dentro do detalhe, nunca como
violação escondida.

## Método, e os seus limites

Lidos por inteiro: `DESIGN.md`, `docs/LASTRO_UX_CONTRACT.md`, `MARCA.md`,
`src/tokens.css`, `src/base.css`, `src/componentes.css`, `src/treino.css`,
`src/protocolo.css`, `src/palco.css`, tudo em `src/ui/` (31 arquivos, 5.115
linhas) e `tests/dominio/estilo.test.ts`. Consultados quando a regra exigia:
`src/main.jsx` (7.136 linhas, onde mora o casco), `src/palco.js`, `index.html`,
`public/manifest.webmanifest`, `public/icone*.png|svg`, `vite.config.js`,
`src/dominio/corpo.ts`, `src/dominio/progressao.ts` e o `git log`.

O que sustenta cada número:

- **Contagens de CSS** saem de varredura por regex sobre as quatro folhas do app
  com os comentários removidos. `src/palco.css` **fica de fora de toda contagem
  do app**: é a bancada de mesa, não roda no aparelho, e as regras dela são
  medidas à parte (D-41 a D-48).
- **Uma medição foi feita em execução**: o Esc com folhas empilhadas (U-03,
  U-25), num jsdom sobre o `dist/` de 21/09 15:53, que corresponde ao fonte de
  `d832da4`. O roteiro rodou fora do repositório e nada foi escrito aqui.
- **Nada foi medido em navegador real.** Toda regra que depende de layout
  renderizado — altura de tela, overflow em 320 px, foco atrás de sticky — está
  marcada como não mensurável, com o motivo.
- O contrato de UX diz de si mesmo, na linha 8, que **"vale para tela nova"**.
  Medi todas as telas assim mesmo, porque é o que o briefing pede; quem for usar
  os veredictos de U para julgar telas antigas precisa contar com essa ressalva.

## Resumo

| documento | regras indexadas | cumpridas | violadas | não mensuráveis |
|---|---|---|---|---|
| `DESIGN.md` | 50 | 24 | 22 | 4 |
| `docs/LASTRO_UX_CONTRACT.md` | 68 | 35 | 21 | 12 |
| `MARCA.md` | 43 | 30 | 7 | 6 |
| **total** | **161** | **89** | **50** | **22** |

---

# Índice e veredictos · DESIGN.md

| id | regra (texto literal, abreviado com […]) | onde | veredicto | evidência |
|---|---|---|---|---|
| D-01 | "A fonte canônica dos valores é `src/tokens.css`" | DESIGN.md:3-4 | violada | 2 cores fora dos tokens |
| D-02 | "Escuro, e não por estilo. […] Superfície escura de leitura, dado em monoespaçada, estrutura desenhada com fio de 1px em vez de cartão, e exatamente um acento ácido […] nunca comemora." | DESIGN.md:8-12 | cumprida | tokens.css:25; index.html:12 (`color-scheme: dark`); partes em D-03…D-09 e M-08 |
| D-03 | "Raio zero. Tudo é quadrado. As exceções são três […] o ponto de status, o thumb do slider e a miniatura do aparelho (`--ins-raio-foto`, 10px)." | DESIGN.md:16-23 | cumprida | 11 declarações de `border-radius` no app; nenhuma em caixa, botão ou campo |
| D-04 | "Número em mono, prosa em display. […] Nunca misturar dentro de uma mesma string." | DESIGN.md:24-26 | violada | 8 seletores com prosa em mono; 1 com macro em display |
| D-05 | "Fio, não cartão. […] Caixa com borda é reservada a objeto genuinamente destacado — veredito, formulário, resumo." | DESIGN.md:27-29 | não mensurável | "genuinamente destacado" não tem critério |
| D-06 | "Nunca sombra." | DESIGN.md:29 | cumprida | zero sombras projetadas; 4 `box-shadow` `inset` sem desfoque (fronteira) |
| D-07 | "Nunca preenchimento para 'agrupar'." | DESIGN.md:29 | não mensurável | "para agrupar" é intenção, não forma |
| D-08 | "Um acento, e ele significa. Ácido `#CBF35E` = agora / feito / seu / aperte aqui. Âmbar `#FFC46B` = preste atenção. Coral `#FF8A6B` = destrói dado." | DESIGN.md:30-32 | violada | 7 atribuições de ácido por comparação favorável |
| D-09 | "No máximo um elemento ácido por região." | DESIGN.md:32 | não mensurável | "região" não é definida |
| D-10 | "Rótulo mono em caixa alta é estrutura, nunca ênfase." | DESIGN.md:33 | não mensurável | 51 regras mono + caixa alta, sem critério que separe as duas coisas |
| D-11 | "Quase nenhum movimento. Existem dois: o pulso do ponto ao vivo (2,4 s) e o indicador de aba (220 ms)." | DESIGN.md:34-35 | violada | 4 movimentos no app |
| D-12 | "Um exercício sem foto **não desenha moldura vazia**: a calha mostra uma superfície elevada com um ponto ao centro, e ela é TOCÁVEL" | DESIGN.md:41-47 | cumprida | treino.css:703-732; exercicio.jsx:304-313 |
| D-13 | Tabela de superfícies (`--ins-canvas` `#0C0E0C` […] `--ins-surface-warn` `#101408`) | DESIGN.md:50-56 | cumprida | tokens.css:25-30, os cinco valores batem |
| D-14 | "Linhas — são quatro, e a escolha é semântica" (`hairline` entre linhas de lista; `rule` entre seções; `border` em repouso; `border-strong` interativa) | DESIGN.md:58-64 | violada | 15 bordas de caixa inteira em `--ins-hairline`, 11 delas em controle |
| D-15 | "Texto — cinco níveis, nunca mais" | DESIGN.md:66-68 | violada | 7 regras de opacidade produzem níveis fora dos cinco |
| D-16 | "Os dois últimos são para rótulo, nunca para prosa que precisa ser lida." | DESIGN.md:70 | violada | 24 sítios de prosa em `--ins-text-4`/`-5` |
| D-17 | "texto sobre qualquer preenchimento ácido é sempre `#0C0E0C`" | DESIGN.md:73-74 | cumprida | 12 preenchimentos ácidos com texto, todos em `--ins-on-acid` |
| D-18 | "Space Grotesk (400/500/700) + IBM Plex Mono (400/500/600)" | DESIGN.md:78 | cumprida | index.html:28; zero pesos fora dos declarados nas folhas do app |
| D-19 | Tabela de papéis tipográficos (metric-xl 52/600/−.05 […] provenance mono 10/.06em) | DESIGN.md:81-93 | violada | 1 papel diverge: body-xs |
| D-20 | "Pisos: nunca abaixo de 9px em rótulo mono" | DESIGN.md:95 | violada | 3 regras abaixo de 9px |
| D-21 | "13px em prosa" | DESIGN.md:95 | violada | 2 regras de prosa abaixo de 13px |
| D-22 | "16px em campo de texto (Safari)" | DESIGN.md:95-96 | violada | 5 seletores, 8 campos na tela |
| D-23 | "15px em nome tocável" | DESIGN.md:96 | violada | 3 nomes tocáveis abaixo de 15px |
| D-24 | "Base 4. **Só estes degraus aparecem:** 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34." | DESIGN.md:100 | violada | 22 medidas de espaço fora da escala e das exceções |
| D-25 | "Goteira da página 20px." | DESIGN.md:101 | cumprida | base.css:167-168 |
| D-26 | "Limite entre seções 24px no total." | DESIGN.md:101 | cumprida | componentes.css:34 (12 + 12) |
| D-27 | "Sempre `gap`, nunca margem entre irmãos." | DESIGN.md:102 | violada | 248 declarações de margem positiva |
| D-28 | "Exceções autorizadas, cada uma com fonte: 5px […] 3px […] 9px […] 17px […]. `tests/dominio/estilo.test.ts` cobra." | DESIGN.md:104-106 | violada | 5 usos das exceções fora do lugar autorizado; e o teste não cobra a escala escrita |
| D-29 | "`--ins-tap: 46px` para controle apertado repetidamente — stepper, botão primário, botão de ação." | DESIGN.md:110-111 | violada | 2 steppers nomeados abaixo de 46px |
| D-30 | "`--ins-tap-dense: 28px` só para toggle de um toque dentro de linha densa." | DESIGN.md:111-112 | violada | 4 dos 6 usos não são toggle em linha densa |
| D-31 | "Campo de digitar uma vez usa 40px" | DESIGN.md:112-113 | violada | 3 campos declaram 46px |
| D-32 | "**Nunca forçar `min-height` dentro de uma linha que já é o alvo.**" | DESIGN.md:115 | cumprida | componentes.css:180-190; treino.css:31-35; cobrado em estilo.test.ts:120-135 |
| D-33 | "Cartão-foco — […] Ponto pulsante + `AGORA · HH:MM`, nome em 34px, contagem em 34px mono à direita, resumo, chip ácido. Sem borda e sem preenchimento" | DESIGN.md:123-125 | cumprida | primitivos.jsx:263-286; componentes.css:108-129 |
| D-34 | "Linha de timeline — […] **Reusada por refeição e por exercício**" | DESIGN.md:126-129 | violada | 1 importador; o exercício tem anatomia própria |
| D-35 | "Grade de fios — o vão de 1px É a régua. Sem borda nas células." | DESIGN.md:130 | cumprida | base.css:229-230; componentes.css:797, 1071; protocolo.css:78 |
| D-36 | "Veredito — recomendação calculada. Uma das poucas caixas com borda." | DESIGN.md:131 | cumprida | componentes.css:133-137; primitivos.jsx:247-257 |
| D-37 | "Folha de baixo — o único modal. […] a linha ácida de 1px no topo, não sombra. Empilha em três níveis, nunca mais." | DESIGN.md:132-133 | violada | 22 diálogos nativos; quarta folha alcançável (medido) |
| D-38 | "Sparkline — 14 fatias. Fatia vazia continua como trilho" | DESIGN.md:134-135 | cumprida | primitivos.jsx:140-164 |
| D-39 | "Ticks — quantidade que se toca. Tocar na última cheia remove." | DESIGN.md:136 | cumprida | primitivos.jsx:184 |
| D-40 | "Tab bar — 5 abas, indicador de 2px deslizando em 220ms. Some quando há campo em foco" | DESIGN.md:137-138 | cumprida | tabbar.jsx:17-23, 30-44; componentes.css:330-334 |
| D-41 | Bancada, "Como": iframe do mesmo documento, "sem uma linha de CSS condicional no app" | DESIGN.md:152-157 | cumprida | zero `data-palco` nas folhas do app; palco.js:124, 147 escreve `--sa-*` |
| D-42 | Licença 1: "O aparelho tem 62px de canto contínuo (`corner-shape: squircle` onde existe)." | DESIGN.md:164 | violada | o aparelho usa 73px no aparelho de referência |
| D-43 | Licença 2: "O aparelho projeta uma [sombra]." | DESIGN.md:165 | cumprida | palco.css:143-146; nada dentro do vidro ganha sombra |
| D-44 | Licença 3: "Dois: o pouso (520ms, uma vez) e a virada ao girar (300ms). […] ambos morrem em `prefers-reduced-motion`." | DESIGN.md:166 | violada | 3 declarações de `animation`, a terceira com 420ms + 140ms |
| D-45 | Licença 4: "Relógio, sinal e bateria vão na fonte do **sistema**." | DESIGN.md:167 | cumprida | palco.css:84 (`--pl-font-sistema`) |
| D-46 | "O prefixo é `pl-`, não `ins-`. […] O titânio dela […] mora no bloco de tokens de `palco.css`, nunca em `tokens.css`." | DESIGN.md:169-171 | cumprida | palco.css:44-58; cobrado em estilo.test.ts:418-450 |
| D-47 | "Não amplia […] Não aparece em telefone, em PWA instalado, em ponteiro grosso nem embutida em outro documento. `?palco=0` devolve o app cru" | DESIGN.md:173-176 | cumprida | palco.js:160, 426 (`Math.min(1, …)`), 447 |
| D-48 | "`tests/dominio/estilo.test.ts` cobra as recusas, a paleta presa nos tokens e que nenhum seletor do palco alcance o app." | DESIGN.md:178-179 | cumprida | estilo.test.ts:418-459 |
| D-49 | "Movimento — Dois, e só dois: `ins-pulse` no ponto ao vivo (2,4s) e o deslize do indicador de aba (220ms, `cubic-bezier(.2,.8,.2,1)`). `prefers-reduced-motion` desliga os dois." | DESIGN.md:183-185 | cumprida | parâmetros conferem: base.css:303-309; tokens.css:92-93; componentes.css:333; desligamento em base.css:311-314 e componentes.css:1415 (a contagem está em D-11) |
| D-50 | "Estado de retirada. Concluída. […] `src/app.css` foi apagado em `6f4dd12`, a ponte global […] em `3283495`, e `minify` e `treeshake` estão ligados" | DESIGN.md:189-194 | cumprida | os dois commits existem e fazem o que diz; vite.config.js:93, 103; zero `Archivo` no projeto |

## As violações de DESIGN.md, uma a uma

**D-01 · a fonte canônica dos valores.** Duas cores nascem soltas, fora de
`tokens.css`, e o teste não as pega porque procura só hexadecimal:
`componentes.css:265` (`.ins-veu`, `rgba(6, 8, 6, .72)`) e `protocolo.css:219`
(`.cam-contagem`, `rgba(12, 14, 12, .35)`). Todo o resto do app usa `var()`.

**D-04 · número em mono, prosa em display.** Critério de medição: frases
inteiras — com verbo — renderizadas em `--ins-font-mono` fora dos dois papéis
que o próprio DESIGN atribui ao mono (`label` e `provenance`), e cadeias de
quantidade renderizadas na display.

Prosa em mono, 8 seletores: `componentes.css:1340` (`#toast`, 11,5px — passam
por ali as ~70 mensagens do app, entre elas "Treino pausado. O relógio parou.",
`main.jsx:528`), `componentes.css:1323` (`.msg`, "Carregando seu histórico…",
`index.html:39`), `componentes.css:1376` (`.ins-faixa-o`, "Treino A sem série
nova há 1h32.", `main.jsx:6758`), `componentes.css:793` (`.tc-res-nota`),
`treino.css:342` (`.segnote`, "Carga opcional: deixe o campo vazio…",
`exercicio.jsx:396`), `treino.css:349` (`.lastline`), `treino.css:509`
(`.painflag`, "dor em … na última sessão deste exercício"), `treino.css:664`
(`.cwarn`, a frase da regra de cardio, `main.jsx:5555`), `treino.css:443`
(`.swaptxt > span`, "Guarda os movimentos e como cada um se mede…",
`edicao.jsx:204`).

Macro na display, 1 seletor e 3 sítios: `componentes.css:351` (`.ins-linha-s`)
carrega "P 2.5 · C 28 · G 3 · por 100 g" (`comida.jsx:32-34`,
`editores.jsx:185`) e "{q} {u} · plano diz …" (`refeicao.jsx:124-125`) — os
mesmos macros que em HOJE saem em mono (`componentes.css:221`, `.ins-tl-meta`).

**D-06 · fronteira (a regra está cumprida).** Critério: sombra é deslocamento ou
desfoque diferente de zero. Nenhuma existe no app. Existem 4 `box-shadow`, todos
`inset`, sem desfoque, desenhando fio de 1px: `componentes.css:1088`
(`.cal-d.hoje`), `treino.css:223` (`.rirbtn.on`), `treino.css:302` e
`treino.css:319` (`.setrow input`). O comentário de `treino.css:298` chama a
técnica de "por sombra e não por borda" — quem ler a regra pela propriedade, e
não pelo efeito, vai chamar isto de quatro violações.

**D-08 · um acento, e ele significa.** Coral e âmbar conferem: das 7 regras com
`--ins-coral`, 5 pintam ação que apaga dado (`.ins-btn-destructive`,
`.gu-acoes .ins-btn-destructive`, `.edx-b.rm`, `.danger`, `.aulal-x`) e 2 são
utilitários que o JSX não usa hoje (`.ins-coral.ins-coral`,
`.ins-tl-ponto.coral`); nenhuma cor é atribuída a coral por cálculo. O ácido escapa: em 7 sítios ele é decidido por uma comparação
favorável, que não é nenhum dos quatro sentidos escritos —
`main.jsx:4953` (força "subindo"), `5159` (`dif > 0`), `5808` (`x.bom`), `5914`
e `5938` (`bom(delta)`), `6037` (delta da retrospectiva, fixo em ácido) e `6048`
(`x.dv > 0`). Fronteira, não contada: `main.jsx:5781` e `6031` pintam contagens
de recorde e de exercícios que subiram, que ainda podem ser lidas como "feito".

**D-11 · quase nenhum movimento.** São quatro, não dois:

1. `ins-pulse`, 2,4 s — `base.css:303, 308`. Escrito.
2. indicador de aba, 220 ms — `componentes.css:333`. Escrito.
3. `#tfill`, `transition: transform .25s linear` — `componentes.css:1404`. Não
   está escrito em lugar nenhum do DESIGN, e `estilo.test.ts:383` **exige** que
   esta transição exista.
4. rolagem suave até a sessão destacada — `main.jsx:5595`,
   `behavior: parado ? 'auto' : 'smooth'`. Morre em `prefers-reduced-motion`,
   como os outros.

Os dois primeiros e o terceiro morrem no bloco `prefers-reduced-motion`
(`base.css:311-314`, `componentes.css:1415`), que desliga `transition` em tudo.
O comentário de `main.jsx:3480-3481` diz, sobre outra rolagem, que "o sistema tem
exatamente dois movimentos e este não vira o terceiro" — e usa `instant`; o de
`5595` não.

**D-14 · as quatro linhas e a semântica.** `--ins-hairline` está escrito como
"entre linhas **dentro** de uma lista", e aparece 15 vezes como borda de caixa
inteira, o que não é "entre linhas". Onze delas são controle, onde o token
escrito é `--ins-border-strong` ("borda interativa"): `componentes.css:823`
(`.pmod-b button`), `874` (`.ins-btn-primary:disabled`), `916` (`.edx-mv
button`), `928` (`.stepper`), `943` (`.edx-b`), `966` (`.edmod button`), `1018`
(`.crow-x`), `1065` (`.mesnav button`), `1230` (`.edbtn`), `1278` (`.progd-mv
button`), `1406` (`#timer button`). As outras quatro são caixas inertes:
`componentes.css:815`, `991`, `1143`, `1216`.

**D-15 · cinco níveis, nunca mais.** Os cinco tokens existem e só eles
(`tokens.css:39-43`). O que cria níveis novos é a opacidade aplicada a elemento
com texto, 7 regras: `base.css:116` (`button:disabled`, .4),
`componentes.css:631` (`.mes-b:disabled`, .25), `componentes.css:1091`
(`.cal-d.futuro`, .35), `treino.css:104` (`.ex.pulado .chev`, .3),
`treino.css:603` (`.day-rel.pausado`, .6), `treino.css:628` (`.wd.futuro`, .4),
`protocolo.css:139` (`.aj-salvar:active`, .6). Fronteira: a classe `ins-t2`
é usada 15 vezes no JSX (por exemplo `primitivos.jsx:252`, no veredito) e **não
existe em folha nenhuma** — a prosa em cartão, que o DESIGN descreve como
`#D6DAD0`, sai no nível 1 herdado.

**D-16 · os dois últimos são para rótulo, nunca para prosa.** Critério: texto em
fonte display, com frase, pintado em `--ins-text-4` ou `-5`. São 24 sítios:

- `primitivos.jsx:71` — o componente `Vazio` é `ins-body-sm ins-t5`, e é
  instanciado **22 vezes** (contagem por `<Vazio`), incluindo as frases que
  explicam o estado vazio de sete telas.
- `fotoajustada.jsx:24` — "sem foto" / "buscando a foto…" em `ins-t5`.
- `dados.jsx:284` — "Tríceps também trabalha nos supinos…" em `ins-body-xs
  ins-t5`.

Em CSS, mais três regras de prosa em nível 4: `treino.css:390` (`.aquec`,
"Aproximação: 2 a 3 séries subindo carga…"), `treino.css:407` (`.puladobox`,
"Pulado nesta sessão.") e `base.css:348` (`#deitado p`, o aviso de telefone
deitado). Fronteira não contada: `.ins-tl-resumo` (`componentes.css:215`) e
`.ins-linha-s` (`componentes.css:351`) são nível 4 em display, mas carregam
resumo e meta, não frase.

**D-19 · a tabela de papéis.** Dez dos onze papéis batem com `base.css:182-213`.
O que diverge: `body-xs` está escrito "13 / 400 / 1.4" e o código traz
`13px/1.5` (`base.css:194`).

**D-20 · piso de 9px em rótulo mono.** Três regras abaixo: `componentes.css:1074`
(`.cal-h`, 8,5px — a segunda definição vence a de `componentes.css:641`, que
tinha 9px), `componentes.css:664` (`.cal-d .per`, 8px) e `componentes.css:1192`
(`.chart .axu`, 7,5px em unidades de SVG: com `viewBox` de 320
(`main.jsx:1464`) e a coluna de 362px do aparelho de referência, sai a 8,5px —
e menor ainda num aparelho de 320px).

**D-21 · piso de 13px em prosa.** Duas regras: `componentes.css:1223`
(`.hs-obs`, 12,5px — a observação que o usuário escreveu na sessão) e
`componentes.css:1305` (`.dgroup p`, 12,5px — "Seu programa está igual ao que o
treinador prescreveu.", `programa.jsx:64-69`).

**D-22 · piso de 16px em campo de texto.** Cinco seletores vencem a regra de
elemento de `base.css:118-130` por especificidade, e chegam a oito campos na
tela: `treino.css:825` (`.aulac-t`, 11px, `edicao.jsx:219`),
`componentes.css:616` (`.gu-json`, 11px, `guia.jsx:255` e `:282`),
`componentes.css:493` (`.gu-campo`, 13px, `guia.jsx:226` e `:231` — e-mail e
senha), `componentes.css:498` (`.dd-data`, 13px, `dados.jsx:39`) e
`treino.css:488` (`.note`, 15px, `exercicio.jsx:182` e `historico.jsx:197`).

**D-23 · piso de 15px em nome tocável.** `componentes.css:1275` (`.progd-t b`,
14px, dentro do botão `progd-b`, `programa.jsx:42-47`), `componentes.css:988`
(`.addlist .swapopt b`, 14px, os resultados da busca do catálogo,
`edicao.jsx:266-268`) e `componentes.css:1378` (`.ins-atalho-v`, 12px — o nome
do exercício dentro da faixa da sessão, que é um botão inteiro,
`faixasessao.jsx:50`).

**D-24 · a escala de espaço.** 22 medidas fora dos degraus escritos e fora das
quatro exceções autorizadas, todas em `padding`, `margin` ou `gap`:

- **2px, 16 ocorrências** — `componentes.css:215, 349, 351, 458, 533, 545, 571,
  647, 680, 702, 907, 909, 1121, 1144`, `treino.css:85, 615`.
- **1px fora da grade, 1 ocorrência** — `componentes.css:1080` (`.cal-d`, vão
  interno de uma célula, não o vão da grade). Os outros seis `gap: 1px`
  (`base.css:229`, `componentes.css:635, 797, 1071, 1169, 1249`,
  `protocolo.css:78`) são a grade de fios e estão escritos no inegociável 3.
- **exceções fora do lugar, 5 ocorrências** — ver D-28.

**D-27 · sempre gap, nunca margem entre irmãos.** 248 declarações de margem com
valor positivo nas quatro folhas do app (163 `margin-top`, 45 `margin`, 34
`margin-bottom`, 4 `margin-left`, 2 `margin-right`), distribuídas em
`componentes.css` (166), `treino.css` (57) e `protocolo.css` (25). Mais quatro
em estilo embutido no JSX: `exercicio.jsx:158, 188, 237, 265`. A contagem não
distingue margem entre irmãos de margem de primeiro filho — nenhuma ferramenta
estática faz isso —, mas a ordem de grandeza é essa, e o idioma dominante do
sistema é `margin-top`, não `gap`.

**D-28 · as exceções autorizadas, e o teste que as cobraria.** Cinco usos fora
da fonte citada: 5px está autorizado "dentro da célula de métrica" e aparece em
`componentes.css:22` (`.ins-estado`, o botão de estado do cabeçalho); 3px está
autorizado no "vão da sparkline" e aparece em `componentes.css:1130`
(`.sess-o`), `1211` (`.hs-vol em`), `1276` (`.progd-t span`) e `1317`
(`.painbox b`). Os usos no lugar certo são `componentes.css:61` e `805` (5px),
`componentes.css:66` (3px), `base.css:264` (9px) e `componentes.css:162` (17px).

E a frase "`tests/dominio/estilo.test.ts` cobra" não se sustenta como escrita:
o teste aceita uma escala **maior** que a do DESIGN — `estilo.test.ts:89` inclui
1, 2 e 46, que o documento não lista —, aplica as quatro exceções globalmente em
vez de no lugar citado (`:96`), lê só três arquivos (`:98`, sem
`protocolo.css`) e não olha estilo embutido no JSX. É por isso que as 22 medidas
de D-24 passam verdes.

**D-29 · 46px para controle repetido.** O stepper é nomeado na regra e aparece
a 38 × 38: `componentes.css:933` (`.stepper button`, usado em `edicao.jsx:31` e
`:33`, e nesses dois botões falta também o nome acessível — ver U-53). O par de
ajuste do cronômetro, que o próprio CSS descreve como "apertados no meio da
série", fica em 40 × 40: `componentes.css:1413`. Fronteira, por depender de
classificar o que é "repetido": `.edx-mv button` e `.progd-mv button` (38px),
`.ins-tick` (30px, estendido a 44 pelo `::after`), `.rirbtn` (40 → 46),
`.notabtn`, `.restlinha`, `.aqbtn` (34 → 46), `.crow-x` (32 → 44), `.dd-diabtn`
(34 → 44), `.cardl-b` (28 → 44).

**D-30 · 28px só para toggle de um toque em linha densa.** Seis usos de
`--ins-tap-dense`. Dentro do escrito: `componentes.css:96` (`.ins-caixa`, o
marcar da linha da timeline) e, com boa vontade, `treino.css:651` (`.cardl-b`,
na linha de cardio). Fora: `base.css:271` (`.ins-chip`, que é o seletor de modo
no topo de COMIDA, DADOS e GUIA — não é linha densa), `treino.css:466`
(`.chip`), `treino.css:237` (`.rirop`, opção da escala de RIR) e
`protocolo.css:22` (`.pr-ponto`, que é navegação entre poses, não toggle).

**D-31 · campo de digitar uma vez usa 40px.** Só `.setrow input` usa
(`treino.css:309`). Três campos declaram 46: `componentes.css:975` (`.addq`),
`treino.css:479` (`.medq input`) e `treino.css:790` (`.rapl-f input`).

**D-34 · a linha de timeline reusada por refeição e por exercício.** O
componente é importado uma vez só, em `hoje.jsx:105`, e ali a sessão de treino
entra como **uma** linha entre as refeições. O exercício da tela TREINO tem
anatomia própria e diferente: calha de 44px com miniatura em vez de 46 com hora
(`treino.css:703-707`), sem espinha e sem ponto (`exercicio.jsx:298-349`).

**D-37 · a folha é o único modal, e empilha em três níveis.**

- **Modal nativo, 22 sítios.** `confirm()` 19 vezes e `prompt()` 3 vezes em
  `main.jsx` (`863, 879, 2124, 2243, 2318, 2701, 2716, 2728, 2766, 2778, 2788,
  2799, 2853, 3391, 3823, 4005, 4111, 5009, 5272, 5374, 5454, 6531`). São
  superfícies modais que o sistema desenha, sem a linha ácida e sem a anatomia
  da folha.
- **Quarta folha.** `CTX.abreFolha` empilha sem teto (`main.jsx:5202`), e o
  caminho existe na interface: refeição (`hoje.jsx:121`) → `···`
  (`refeicao.jsx:30`) → "trocar" (`editores.jsx:123`) → "+ cadastrar alimento
  novo" (`editores.jsx:162`). Medido em jsdom: com quatro `abreFolha`, a pilha
  fica em 4 e as quatro folhas existem no DOM.
- A linha ácida de 1px está lá (`componentes.css:275`), e os níveis declarados
  são 50, 70 e 80 (`editores.jsx:58, 159, 210`) — duas folhas, porém, dividem o
  nível 50 quando empilhadas (refeição e editar refeição).

**D-42 · os 62px da bancada.** `.pl-aparelho` usa `--pl-rc`
(`palco.css:133`), que é 73 no aparelho de referência e no Pro Max, 66 no 16 e
46 no SE (`palco.js:76-96`). Os 62 escritos são o raio do **vidro**
(`--pl-raio`, `palco.css:170`), e só em dois dos quatro aparelhos.

**D-44 · os dois movimentos da bancada.** Dois `@keyframes` (`palco.css:457`,
`465`) e três declarações de `animation`: pouso 520ms (`:470`), virada 300ms
(`:471`) e uma terceira, que o documento não menciona — painel e régua pousam
com 420ms e 140ms de atraso (`:473`). As três morrem em
`prefers-reduced-motion` (`:475-477`).

## As não mensuráveis de DESIGN.md

**D-05 · caixa com borda só para objeto destacado.** Falta o critério de
"genuinamente destacado", e a lista ("veredito, formulário, resumo") não diz se
é exemplo ou fecho. Para dar contexto a quem for argumentar: 70 regras do app
desenham `border` de caixa inteira, controles inclusive.

**D-07 · nunca preenchimento para agrupar.** O que é medível é quantas
superfícies preenchidas existem (`--ins-surface`, `-low`, `-acid`, `-warn`
aparecem como fundo em 39 regras); o que a regra proíbe é a **intenção** de
agrupar, que o CSS não registra.

**D-09 · no máximo um elemento ácido por região.** "Região" não está definida em
lugar nenhum dos três documentos. Dois fatos para quem for definir: o cartão-foco
tem três elementos ácidos ao mesmo tempo — o ponto (`base.css:307`), o rótulo
(`primitivos.jsx:272`) e o chip (`primitivos.jsx:283`) —, e a própria anatomia
escrita do cartão (D-33) já pede dois deles; e no bloco de sessão pausada saem
dois preenchimentos ácidos lado a lado, "retomar" e "finalizar"
(`treino.css:572-574`, `treino.jsx:77-79`).

**D-10 · rótulo mono em caixa alta é estrutura, nunca ênfase.** 51 regras do app
combinam `--ins-font-mono` com `text-transform: uppercase`. Entre elas estão
rótulos de seção (`.ins-label`), selos (`.tag`, `.ex-sub .up`) e **todos os
botões do sistema** (`.ins-btn-primary`, `.ins-btn-secondary`, `.ins-btn-add`,
`.dbtn`, `.ctrl-b`, `.day-ini`, `.tc-back`…). Faltaria uma definição que
separasse rótulo de estrutura, rótulo de ação e ênfase.

---

# Índice e veredictos · docs/LASTRO_UX_CONTRACT.md

Ressalva de escopo, escrita no próprio contrato (linha 8): "Vale para tela
nova."

| id | regra (texto literal, abreviado com […]) | onde | veredicto | evidência |
|---|---|---|---|---|
| U-01 | "As três camadas, e só três" (aba / destino / folha) e "Não existe quarta camada." | contrato:12-21 | cumprida | navegacao.js:50-67; app.jsx:26; folha.jsx:84 |
| U-02 | "A pilha de navegação é derivada, nunca escrita à mão. […] O histórico se sincroniza sozinho depois de cada render." | contrato:23-26 | cumprida | navegacao.js:50-67, 89-111; main.jsx:4543-4549 |
| U-03 | "**Voltar desfaz exatamente uma camada.** Vale para o botão `‹ voltar`, para o `×` da folha, para o toque no véu, para o Esc e para o **Voltar do sistema**" | contrato:30-32 | violada | Esc fecha duas camadas com três folhas (medido) |
| U-04 | "Folha aberta → fecha a folha (só a do topo)." | contrato:34 | cumprida | main.jsx:5203, 4575 |
| U-05 | "Destino aberto → volta à aba **e restaura a posição de leitura**." | contrato:35 | violada | 1 destino sem restauração |
| U-06 | "Raiz de uma aba → sai do app. Não se intercepta isso" | contrato:36-38 | cumprida | navegacao.js:136, 146 — em profundidade 0 nada é consumido |
| U-07 | "**Nunca** usar Voltar para: ir para a Home, resetar rota, trocar de aba, descartar sessão de treino." | contrato:40-41 | cumprida | main.jsx:4556-4567; `voltarDoPromo` (2494-2500) mantém a sessão aberta |
| U-08 | "**Proibido** pôr `‹ voltar` na raiz de uma aba." | contrato:42 | cumprida | o único `‹ voltar` está em telacheia.jsx:29 |
| U-09 | Tabela de rótulos e "Não misturar. Uma folha nunca diz 'voltar'; um destino nunca diz 'fechar'." | contrato:46-53 | violada | 1 destino diz "Fechar" |
| U-10 | "salvar / concluir \| aplica \| ação primária, último elemento" | contrato:51 | violada | 5 telas com a ação primária fora do fim |
| U-11 | "Entrar num destino \| topo do destino" | contrato:58 | violada | 1 destino em 10 |
| U-12 | "**Voltar de um destino** \| **restaura a posição exata**" | contrato:60 | violada | 1 destino em 10 |
| U-13 | "Fechar folha \| mantém a posição, sem exceção" | contrato:61 | cumprida | folha.jsx:33-41 |
| U-14 | "Trocar de aba \| topo" | contrato:62 | cumprida | main.jsx:1930-1936 |
| U-15 | "Atualizar dado na mesma tela \| **não mexe**" | contrato:63-69 | violada | 11 `scrollTo(0,0)` sem troca de camada |
| U-16 | "Entrar guarda (`entraNoDestino`), sair devolve (`saiDoDestino`), por chave de destino — nunca por pilha" | contrato:71-73 | cumprida | main.jsx:6840-6856 |
| U-17 | "Cabeçalho — Três formas, e nenhuma quarta" (raiz de aba, destino, folha) | contrato:77-85 | cumprida | primitivos.jsx:18-28; telacheia.jsx:26-41; folha.jsx:136-147 |
| U-18 | "Tela cheia focada (treino ativo) pode trocar o título por contexto vivo […] e é sticky com `top: var(--sa-top)`." | contrato:87-88 | cumprida | treino.jsx:65-71; treino.css:589 |
| U-19 | "Cinco destinos, fixos: HOJE · TREINO · COMIDA · DADOS · GUIA." | contrato:91 | cumprida | tabbar.jsx:17-23 |
| U-20 | "É **navegação**, nunca ação. Nenhum item salva, adiciona, finaliza ou confirma." | contrato:93 | cumprida | tabbar.jsx:61 chama só `vaiPara` |
| U-21 | "Some em destino de tela cheia" | contrato:94 | cumprida | app.jsx:26 |
| U-22 | "Some enquanto houver campo em foco" | contrato:96 | cumprida | tabbar.jsx:30-44, 51 |
| U-23 | "**Continua visível durante o treino ativo**" | contrato:98-101 | cumprida | app.jsx:60, o treino é aba |
| U-24 | "`padding-bottom: env(safe-area-inset-bottom)`, com os 46 px de alvo **acima** dela." | contrato:102 | cumprida | componentes.css:316, 322 |
| U-25 | "Máximo três níveis: 50 · 70 · 80. Uma quarta é redesenho, não exceção." | contrato:107 | violada | quarta folha alcançável (medido) — ver D-37 |
| U-26 | "Ao abrir: trava o scroll do corpo […] **manda o foco para dentro** e torna **inerte** o que está atrás." | contrato:108-109 | violada | o cronômetro e o toast ficam fora do inerte |
| U-27 | "Ao fechar: destrava, devolve o scroll, **devolve o foco ao acionador**, e a rota por baixo não muda." | contrato:110-111 | cumprida | folha.jsx:33-41, 110-115 |
| U-28 | "Fecham por: `×`, véu, Esc e Voltar do sistema." | contrato:112 | cumprida | folha.jsx:134, 146, 118-123; main.jsx:4575 |
| U-29 | "Folha é tarefa curta. Fluxo de várias etapas é destino." | contrato:113 | cumprida | os fluxos de etapas (protocolo, câmera, ajuste, retroativo) são destinos |
| U-30 | "Uma aba que passa de **três telas de rolagem** precisa de justificativa." | contrato:117-118 | não mensurável | exige render |
| U-31 | "Duas ferramentas […] `Chips` no topo, um modo por assunto […] `LinhaExpansivel`" | contrato:120-126 | cumprida | comida.jsx:104-112; dados.jsx:338; guia.jsx:115; folha.jsx:164 |
| U-32 | "só se o que fica visível já responder à pergunta sozinho […] Não recolher: controle, ação, número que se acompanha, aviso." | contrato:128-132 | violada | 1 lista recolhe controle e ação |
| U-33 | "Medir antes e depois, em pixels." | contrato:134-136 | não mensurável | processo, sem medição registrada no código |
| U-34 | "Ação fixa no rodapé. Não usar por reflexo. […] **não coexiste com a tab bar**." | contrato:139-144 | violada | a faixa-pergunta coexiste |
| U-35 | "O rodapé é uma pilha, não um lugar disputado. […] Cada camada nova **mede** a de baixo […] e o `padding-bottom` da página soma todas" | contrato:146-151 | cumprida | componentes.css:1337, 1353, 1367; base.css:176; faixasessao.jsx:25-30 |
| U-36 | "**A série entra no histórico assim que carga e reps estão preenchidas.** Não existe botão de salvar […] Apagar o campo desfaz." | contrato:157-158 | cumprida | main.jsx:3506-3520, 696-707 |
| U-37 | "**O valor anterior é a referência e o ponto de partida** […] **tocável para preencher**." | contrato:159-160 | cumprida | exercicio.jsx:74-82; treino.css:174-182 |
| U-38 | "**O descanso começa sozinho ao completar qualquer série.** Exceções: bi-set encadeia sem pausa; a mesma série não redispara." | contrato:161-162 | cumprida | main.jsx:3573-3591 |
| U-39 | "**O cronômetro é escrito por instante-alvo**, nunca por contador" | contrato:163-164 | cumprida | main.jsx:4215, 4238-4243 |
| U-40 | "Ação frequente não mora atrás de menu, `···` ou tela intermediária." | contrato:165 | não mensurável | "frequente" não tem critério |
| U-41 | "Estado de treino grava por interação e **descarrega ao sair** (`pagehide`, `visibilitychange` oculto)." | contrato:166-167 | cumprida | main.jsx:3520 (`queueSave`), 4376-4381 |
| U-42 | "Reversível → executa e oferece desfazer." | contrato:171 | violada | 3 exclusões sem desfazer e sem confirmação |
| U-43 | "Difícil de reverter → confirma, com o que se perde dito em português." | contrato:172 | cumprida | 19 `confirm()` em português, com o objeto nomeado |
| U-44 | "Destrutivo mora **um nível para dentro**, em coral, nunca na lista." | contrato:173 | violada | 6 sítios |
| U-45 | "Não confirmar ação comum" | contrato:174 | não mensurável | "comum" não tem critério |
| U-46 | "Toda tela declara os quatro: **carregando · vazio · erro · conteúdo**." | contrato:178 | violada | 0 de 15 telas declara os quatro |
| U-47 | "Vazio explica o que é a área, por que está vazia e qual é a ação." | contrato:180 | violada | 3 de 22 estados vazios apontam ação |
| U-48 | "Erro aparece perto do que o causou, permite tentar de novo e **nunca apaga o que o usuário digitou**." | contrato:181-182 | violada | 10 erros saem no toast do rodapé |
| U-49 | "Sem layout shift ao sair de carregando." | contrato:183 | não mensurável | exige render |
| U-50 | "WCAG 2.2 AA onde aplicável." | contrato:187 | não mensurável | regra por referência; exige auditoria própria |
| U-51 | "**Todo controle tem nome acessível.**" | contrato:188 | violada | 9 controles sem nome nenhum |
| U-52 | "Campo sem rótulo visível leva `aria-label`." | contrato:188-189 | violada | 13 campos |
| U-53 | "Botão cujo conteúdo é símbolo (`·`, `×`, `···`) leva `aria-label`." | contrato:189 | violada | 4 botões |
| U-54 | "Alvo ≥ 24×24 (norma); ≥ 46 px para controle repetido (padrão interno); 28 px só para toggle de um toque em linha densa." | contrato:190-191 | violada | 1 alvo de 11px; o resto em D-29 e D-30 |
| U-55 | "Foco sempre visível" | contrato:192 | cumprida | os 8 `outline: none` têm substituto desenhado |
| U-56 | "e nunca escondido atrás de sticky" | contrato:192 | não mensurável | exige navegação por teclado num navegador |
| U-57 | "Estado nunca só por cor." | contrato:193 | violada | 3 estados só por cor, mais os seletores sem estado ARIA |
| U-58 | "`prefers-reduced-motion` desliga os dois movimentos do sistema." | contrato:194 | cumprida | base.css:311-314; componentes.css:1415; main.jsx:5594 |
| U-59 | "Altura de tela cheia: `100vh` só como recuo, `100svh` valendo." | contrato:198 | cumprida | base.css:82-83; cobrado em estilo.test.ts:72-80 |
| U-60 | "`env(safe-area-inset-*)` via tokens `--sa-*` em cabeçalho, tab bar, folha e sticky. Ação importante não encosta no Home Indicator." | contrato:199-200 | cumprida | componentes.css:8, 302, 316, 719; treino.css:589 |
| U-61 | "Sem `overflow` diferente de `visible` entre um sticky e quem rola" | contrato:201-202 | cumprida | base.css:85; cobrado em estilo.test.ts:219-226 |
| U-62 | "Retrato é o cenário. Deitado mostra `#deitado`, que **preserva todo o estado**." | contrato:203 | cumprida | base.css:330-349; index.html:50-55 |
| U-63 | Checklist: "320 px de largura sem overflow horizontal" | contrato:227 | não mensurável | exige render |
| U-64 | Checklist: "390 e 430 px conferidos" | contrato:228 | não mensurável | processo de verificação |
| U-65 | Checklist: "teclado: campo em foco continua visível" | contrato:218 | não mensurável | exige teclado de sistema |
| U-66 | Checklist: "contraste conforme DESIGN.md" | contrato:226 | não mensurável | o DESIGN.md não fixa razão de contraste |
| U-67 | Checklist: "PWA instalado conferido" | contrato:231 | não mensurável | processo de verificação |
| U-68 | Checklist: "reload no meio da tarefa preserva o estado" | contrato:232 | cumprida | main.jsx:3520, 4376-4381; rascunho em `S.draft` |

Os outros 17 itens do checklist repetem regras de §§1-12 e estão indexados lá.

## As violações do contrato de UX, uma a uma

**U-03 · Voltar desfaz exatamente uma camada — o Esc não.** Cada folha montada
registra o seu próprio ouvinte de `keydown` (`folha.jsx:118-123`), e todos
chamam `ctx.fechaFolha`, que tira a do topo. Medido num jsdom sobre o `dist/`:

| folhas abertas | pilha depois de UM Esc |
|---|---|
| 1 | 0 |
| 2 | 1 |
| 3 | **1** |
| 4 | **2** |

Com três folhas, um Esc fecha duas. O `×`, o véu e o Voltar do sistema fecham
uma só. Fronteira: com duas folhas o comportamento é o certo, porque o ouvinte
da de cima é removido no mesmo quadro em que ela desmonta.

**U-05, U-11, U-12 · a decisão de fim de sessão é o destino fora do padrão.**
Nove dos dez destinos entram por `entraNoDestino` e saem por `saiDoDestino`
(`main.jsx:2656, 2658, 2808, 2865, 2984, 2986, 4040, 4041, 4107, 4108, 6454,
6458, 6622, 6624, 6900, 6910, 7009, 7023`). O `promo` não: abre em
`main.jsx:892` e `2563` sem guardar a posição nem ir ao topo, e fecha em
`voltarDoPromo` (`2494-2500`) sem devolvê-la.

**U-09 · um destino nunca diz "fechar".** `retrospectiva.jsx:59` põe um botão
"Fechar" no fim de um destino — e ele chama a mesma função do `‹ voltar` do
topo. Fronteira, não contada: "Fechar" também aparece dentro do destino Programa,
mas fechando painéis embutidos e não a tela (`edicao.jsx:78` e `:303`, via
`programa.jsx:94` e `:105`); e `camera.jsx:52` repete o voltar no rodapé com o
rótulo "voltar à pose".

**U-10 · a ação primária é o último elemento.** Cinco telas põem outra coisa
depois dela: `historico.jsx:201-205` ("Salvar correção" seguido de "cancelar" e
de "apagar esta sessão"), `retroativo.jsx:96-104` ("Adicionar" seguido de
"Adicionar e preencher os exercícios"), `edicao.jsx:223-227` ("importar"
seguido de "cancelar"), `edicaodia.jsx:23` ("pronto" na barra do topo) e
`ajustefoto.jsx:68` ("salvar" no cabeçalho do destino — que o §4 autoriza como
"ação opcional à direita", e é o caso em que as duas seções do contrato se
contradizem).

**U-15 · atualizar dado na mesma tela não mexe na rolagem.** 11 chamadas de
`window.scrollTo(0, 0)` acontecem sem trocar de camada: `main.jsx:519`
(iniciar treino), `870` (descartar sessão), `913` (encerrar), `2098` (entrar e
sair do modo de edição), `2659` (trocar de modo no Programa), `3468` (trocar o
dia da rotação), `6459` (começar a sessão de fotos), `6460` e `6467` (andar de
pose), `6517` (depois de guardar a foto) e `6785` ("já parei", que pode ser
tocado de qualquer aba). O caso que bate com o exemplo escrito — "paginar", com
o controle no meio da página — é `andaPose` (`main.jsx:6467`), acionado pelos
botões `‹ anterior` / `próxima ›` de `protocolo.jsx:141-146`.

**U-26 · inerte o que está atrás.** `isolaOResto` marca os irmãos da folha
dentro de `#app` (`folha.jsx:58-72`). O cronômetro de descanso e o toast moram
**fora** do `#app` (`index.html:62-71` e `:45`), então os três botões do
cronômetro (`#tmenos`, `#tmais`, `#tstop`) continuam tabuláveis atrás da folha
enquanto um descanso corre. O teste que cobre a regra só olha `#app > [inert]`
(`tests/fluxo/navegacao.test.js:172`).

**U-32 · o que pode ser recolhido.** `editores.jsx:97-130`: dentro da
`LinhaExpansivel` de cada item da refeição ficam escondidos o `Stepper` da
quantidade (controle) e os botões "trocar" e "remover" (ação) — as duas coisas
que a regra lista como não recolhíveis. O cabeçalho visível responde "qual
alimento, quanto", que é a metade que a regra exige.

**U-34 · ação fixa no rodapé não coexiste com a tab bar.** Lendo "ação fixa" como
botão de ação dentro de elemento fixo no rodapé: a faixa da sessão em modo
pergunta traz dois ("continuo treinando", "já parei") e fica acima da tab bar,
com ela visível (`faixasessao.jsx:36-42`, `componentes.css:1366-1375`). O
cronômetro também tem botões ali, mas o próprio §7 o coloca na pilha do rodapé
(contrato:148), então não conta.

**U-42 · reversível executa e oferece desfazer.** O toast é só texto
(`main.jsx:3443-3450`): não existe caminho de desfazer em mensagem nenhuma. Três
exclusões executam sem confirmar e sem oferecer volta: `delBody`
(`main.jsx:3313-3318`, "Medida removida.", chamada por `dados.jsx:66`),
`delCardio` (`main.jsx:2893-2899`, "Sessão removida.", chamada por
`dados.jsx:541`) e `CTX.removeItem` (`main.jsx:5293-5299`, item de refeição, sem
toast). Onde o desfazer existe, ele não está no toast: é a lista "mudanças de
hoje" (`edicaodia.jsx:31-38`), o "desfazer" do exercício pulado
(`exercicio.jsx:354`) e apagar o campo da série.

**U-44 · destrutivo um nível para dentro, em coral, nunca na lista.** Seis
sítios:

| onde | o que foge |
|---|---|
| `dados.jsx:66` e `:541` (`.crow-x`) | está na lista **e** não é coral: `componentes.css:1020` pinta em `--ins-text-4` |
| `edicao.jsx:36` (`.edx-b.rm`, "remover") | coral, mas em cada linha da lista de exercícios |
| `edicao.jsx:193` (`.aulal-x`, "apagar") | coral, mas em cada linha da lista de modelos |
| `programa.jsx:89` e `:120` (`.dlbtn`, "restaurar") | desfaz mudanças promovidas e sai em âmbar (`componentes.css:1158-1162`), enquanto a mesma ação em `programa.jsx:74` sai em coral |

**U-46 · os quatro estados.** Nenhuma das 15 telas (5 abas + 10 destinos)
declara os quatro. Carregando aparece em 4 (`guia.jsx:217, 238`,
`comparar.jsx` via `FotoAjustada`, `protocolo.jsx:99`, `camera.jsx:131`); erro
em 2 (`guia.jsx:236`, `camera.jsx:43-54`); vazio em 11; conteúdo em 15.

**U-47 · o vazio explica e aponta a ação.** 22 estados vazios. Três apontam uma
ação: `treino.jsx:195-198`, `dados.jsx:468` e `historico.jsx:82-85`. Os outros
19 dizem o que falta, não o que fazer — entre eles "Nenhuma medida registrada
ainda." (`dados.jsx:52`), "Nenhuma série registrada neste dia."
(`sessao.jsx:106`) e "Treino não encontrado." (`programa.jsx:81`). Fato que o
relator vai querer: o exemplo que a `MARCA.md:67` dá de estado vazio bom —
"Ainda não há carga registrada suficiente para estimar." (`dados.jsx:496`) —
também não aponta ação nenhuma. Os dois documentos pedem coisas diferentes.

**U-48 · erro perto do que o causou.** Onde há estado de erro desenhado, a regra
é cumprida e o digitado não se perde (`guia.jsx:236`, com e-mail e senha vindos
do estado; `camera.jsx:43-54`). Mas 10 falhas saem pelo toast fixo no rodapé,
longe do que as causou: `main.jsx:1027, 3342, 3366, 3374, 3379, 3382, 3388,
3816, 6519, 7085, 7102`.

**U-51, U-52, U-53 · nomes acessíveis.** Levantamento de todos os 40 campos e de
todos os botões de símbolo do `src/ui/`:

- **Sem nome acessível nenhum (U-51), 9 controles**: sete `<select>` sem rótulo
  e sem `aria-label` — `edicao.jsx:276, 280, 286`, `ajustefoto.jsx:111`,
  `camera.jsx:101`, `comparar.jsx:60, 65` —, o campo de data `dados.jsx:39` e o
  `<textarea readonly>` `guia.jsx:255`.
- **Sem rótulo visível e sem `aria-label` (U-52), 13 campos**: os 9 acima mais
  `editores.jsx:167`, `edicao.jsx:259`, `edicao.jsx:275`, `edicao.jsx:289`,
  `comida.jsx:160`, `guia.jsx:282`, `historico.jsx:197` e `retroativo.jsx:64` —
  neles o `placeholder` é o único texto, e ele some ao digitar.
- **Botão de símbolo sem `aria-label` (U-53), 4**: `edicao.jsx:31` e `:33` (o
  `−` e o `+` do stepper de séries) e `retroativo.jsx:22` e `:24` (o `‹` e o `›`
  de andar o dia). Os outros símbolos do sistema têm rótulo — `folha.jsx:144,
  146`, `dados.jsx:137, 139`, `exercicio.jsx:110`, `primitivos.jsx:202, 219,
  221`, `index.html:67-68`.

Fronteira: 10 campos têm texto visível perto, mas não associado por `<label>` —
`exercicio.jsx:182`, `editores.jsx:83`, `ajustefoto.jsx:111`, `camera.jsx:101`,
`comparar.jsx:60, 65`, `historico.jsx:173, 180`, `protocolo.jsx:151`,
`retroativo.jsx:79`.

**U-54 · alvo ≥ 24×24.** Um controle fica abaixo em altura: `.cp-ajustar`
(`protocolo.css:185-191`), sem `padding` e com `font: 11px/1` — cerca de 11px de
altura, renderizado duas vezes na tela de comparação (`comparar.jsx:40`).

**U-57 · estado nunca só por cor.** Três estados são só cor: o alimento
cadastrado pelo usuário, marcado por texto ácido e explicado na nota da seção
"o que você cadastrou aparece em ácido" (`comida.jsx:31, 159`;
`editores.jsx:184`); o item cujo alimento sumiu, marcado por texto âmbar
(`editores.jsx:104`); e o dia de hoje na faixa da semana, marcado só pelo fundo
(`treino.css:626`). Some-se que os seletores de estado não publicam estado
nenhum para leitor de tela: `Chips` (`primitivos.jsx:227-239`), `.chip`
(`exercicio.jsx:190-196` e outros), `.tr-dia` (`treino.jsx:86-93`), `.fd-op`
(`refeicao.jsx:111-128`) e `.pmod-b` (`decisao.jsx:41-45`) trocam preenchimento
sem `aria-pressed` nem `aria-current`. Onde há estado ARIA, está certo:
`tabbar.jsx:60`, `primitivos.jsx:202`, `protocolo.jsx:27-28`.

## As não mensuráveis do contrato de UX

**U-30, U-33, U-49, U-63, U-64, U-65, U-67** dependem de renderizar o app num
navegador com dados reais (altura de tela, medição em pixels, layout shift,
320/390/430 px, teclado, PWA instalado). Nenhuma delas tem registro no código
que permita conferir sem isso.

**U-40 · ação frequente atrás de menu.** Sem definição de "frequente". Para quem
for defini-la: ficam atrás de um toque a anotação, a carga e a medida do
exercício (`exercicio.jsx:176, 212, 249`), e atrás do `···` da linha da timeline
a edição da refeição (`timeline.jsx:60-62`).

**U-45 · não confirmar ação comum.** Sem definição de "comum". O inventário está
em D-37: 19 `confirm()` e 3 `prompt()`.

**U-50 · WCAG 2.2 AA.** Regra por referência a uma norma inteira; auditá-la é
trabalho de outra natureza. Dois achados que apareceram no caminho e que quem
for fazer essa auditoria vai querer: a linha do exercício abre por `onClick` num
`<div>` sem `role` nem `tabindex` (`exercicio.jsx:299`), e o véu da folha é um
`<div>` clicável (`folha.jsx:134`) — o primeiro não é alcançável por teclado.

**U-56 · foco nunca escondido atrás de sticky.** Não há `scroll-padding-top` em
folha nenhuma do app; o único recuo de rolagem é o `scroll-margin-top` de `.ex`
(`treino.css:25`). Se o foco por teclado para embaixo de `.tc-topo` ou de
`.day-rel` é coisa que só se vê tabulando num navegador.

**U-66 · contraste conforme DESIGN.md.** O `DESIGN.md` não fixa razão nenhuma —
a palavra "contraste" aparece lá só a respeito do par tipográfico
(`DESIGN.md:79`). Os números de contraste do projeto moram em comentários de
CSS (`base.css:137-139`, `componentes.css:325`, `treino.css:189-191`,
`treino.css:372-376`), sempre para justificar a troca do nível 5 pelo 4. Sem um
limiar escrito, não há o que medir.

---

# Índice e veredictos · MARCA.md

| id | regra (texto literal, abreviado com […]) | onde | veredicto | evidência |
|---|---|---|---|---|
| M-01 | "**toda promessa tem um arquivo e uma linha.** Onde não tem, está escrito que não tem." | MARCA.md:6-7 | cumprida | as 10 referências de arquivo conferem (detalhe abaixo) |
| M-02 | "**Náutica primeiro. Financeira em segundo, e só onde o assunto já é procedência.**" | MARCA.md:11-20 | não mensurável | a palavra não aparece em tela nenhuma |
| M-03 | "**Nunca as duas na mesma frase.**" | MARCA.md:22 | cumprida | zero frases do app usam a palavra |
| M-04 | "**Onde ele é endereço, nunca onde ele é assinatura.**" + tabela de endereços | MARCA.md:34-44 | cumprida | main.jsx:90; nuvem.ts:37; fotos.ts:26; palco.js:100; vite.config.js:66; main.jsx:3321-3326 |
| M-05 | "Dentro do app o produto se chama **'o app'**" | MARCA.md:46-47 | cumprida | dados.jsx:509; guia.jsx:224; refeicao.jsx:67 |
| M-06 | "**O nome não aparece em nenhuma tela, e isso é decisão.**" | MARCA.md:48 | cumprida | zero ocorrências em `src/ui/`; fronteira: index.html:25 e o manifesto |
| M-07 | "Diga o efeito visível, não o estado emocional." | MARCA.md:57 | cumprida | main.jsx:528; zero exclamações em string de tela |
| M-08 | "No fim de uma tarefa, devolva os números. **Nunca comemore.**" | MARCA.md:58 | cumprida | main.jsx:914; zero "parabéns"/medalha/sequência |
| M-09 | "Fato consumado em uma frase, sem consolo." | MARCA.md:59 | cumprida | main.jsx:871 ("Sessão descartada.") |
| M-10 | "Número que pode ser lido como sequência, negue por escrito." | MARCA.md:60 | cumprida | dados.jsx:175 |
| M-11 | "Veredito traz o delta, a janela e o limite cruzado." | MARCA.md:61 | violada | 1 veredito sem o limite |
| M-12 | "O freio cita a regra e diz de quem ela é. Conselho próprio, nunca." | MARCA.md:62 | violada | 3 freios sem dono, ou com conselho do app |
| M-13 | "Antes de perguntar, diga o que já está garantido." | MARCA.md:63 | violada | 12 de 19 perguntas não dizem |
| M-14 | "Controle confundível explica o que ele **não** faz." | MARCA.md:64 | cumprida | guia.jsx:180-182; refeicao.jsx:67 |
| M-15 | "Ao oferecer um override, diga em que condição ele é legítimo." | MARCA.md:65 | cumprida | dados.jsx:508-512 |
| M-16 | "No destrutivo, delimite o estrago em vez de dramatizar." | MARCA.md:66 | violada | 2 diálogos na forma recusada |
| M-17 | "Estado vazio é uma frase. Sem ilustração, sem mascote." | MARCA.md:67 | violada | 7 de 22 com mais de uma frase |
| M-18 | "Commit descreve o efeito visível, em português, minúscula, sem o diff." | MARCA.md:68 | cumprida | 71 commits desde a MARCA, 1 desvio (merge automático) |
| M-19 | "**Wordmark.** Space Grotesk 700, tracking `−.045em` […]" | MARCA.md:74-79 | não mensurável | não há wordmark no repositório |
| M-20 | "**A caixa alta da prancha não é exceção: é outro lugar.**" | MARCA.md:81-87 | cumprida | zero `LASTRO` em `src/`; a prancha existe |
| M-21 | "**O wordmark não é ácido.**" | MARCA.md:89-90 | não mensurável | não há wordmark |
| M-22 | "**Símbolo ou palavra.** […] Nunca os dois juntos" | MARCA.md:92-95 | cumprida | símbolo só em ícone e favicon (index.html:22-24) |
| M-23 | "**O símbolo.** Uma parte visível acima de uma linha de superfície e uma estrutura de raízes maior abaixo dela: 30% aparece, 70% sustenta." | MARCA.md:97-100 | não mensurável | descrição de desenho; o que dá para medir está em M-24 |
| M-24 | "**A geometria não se redesenha.** […] byte a byte igual a `Lastro_Identity_Approved_v2/assets/svg/lastro-app-icon-approved.svg`" | MARCA.md:102-106 | cumprida | sha256 idêntico nos dois arquivos |
| M-25 | "**O ícone não usa a paleta do Instrumento** […] lima `#D9FF16` sobre preto `#0E1112` […] Trocar um pelo outro em qualquer direção quebra o que `tests/dominio/estilo.test.ts` tranca." | MARCA.md:108-113 | violada | as cores conferem; o teste não tranca o ícone |
| M-26 | "**Máscara é arquivo próprio.** […] a arte cheia chega a 94% do raio da zona segura […] enquanto o mascarável para em 77%. **O squircle não é queimado no arquivo**" | MARCA.md:115-121 | cumprida | medido: 93,6% e 76,6%; cantos opacos |
| M-27 | "o símbolo, como o L antes dele, **não** volta como elemento gráfico dentro do app." | MARCA.md:123-127 | cumprida | zero referências a `icone` em `src/ui/` e `src/main.jsx` |
| M-28 | "**`ins-` nomeia o que se vê. `lastro-` nomeia o que se guarda.**" + "o prefixo de toda classe e todo token" | MARCA.md:131-137, 143-144 | violada | 422 de 534 classes não têm o prefixo |
| M-29 | "Não existe superfície onde os dois apareçam juntos." | MARCA.md:138-139 | cumprida | "Instrumento" não aparece em string de tela nenhuma |
| M-30 | Não fazer: "Manifesto de marca" | MARCA.md:154 | cumprida | não existe no repositório |
| M-31 | Não fazer: "Tagline" | MARCA.md:155 | cumprida | nenhuma frase pendurada no nome; fronteira: a `description` do manifesto |
| M-32 | Não fazer: "Tela 'sobre'" | MARCA.md:156 | cumprida | as 15 telas estão indexadas em U-46; nenhuma é sobre o produto |
| M-33 | Não fazer: "O nome em alguma tela" | MARCA.md:157 | cumprida | ver M-06 |
| M-34 | Não fazer: "Splash com o símbolo" | MARCA.md:158 | cumprida | index.html não declara `apple-touch-startup-image` |
| M-35 | Não fazer: "Wordmark em ácido" | MARCA.md:159 | não mensurável | não há wordmark |
| M-36 | Não fazer: "Lockup símbolo + palavra" | MARCA.md:160 | cumprida | não existe arquivo nem tela com os dois |
| M-37 | Não fazer: "O símbolo como elemento gráfico dentro do app" | MARCA.md:161 | cumprida | ver M-27 |
| M-38 | Não fazer: "Renomear Instrumento" | MARCA.md:162 | cumprida | o prefixo `ins-` segue em 112 classes e 47 tokens |
| M-39 | Não fazer: "Renomear os escopos de commit" | MARCA.md:163 | cumprida | `treino` segue como escopo em 15 commits, entre 39 escopos distintos |
| M-40 | Não fazer: "As duas acepções na mesma frase" | MARCA.md:164 | cumprida | ver M-03 |
| M-41 | Não fazer: "Versão do app na interface" | MARCA.md:165 | cumprida | zero ocorrências em `src/ui/` e `index.html` |
| M-42 | Não fazer: "Tocar nas constantes de legado" | MARCA.md:166 | cumprida | main.jsx:91; fotos.ts:36; nuvem.ts:38; sw.js:28 |
| M-43 | "**Trocar o domínio de deploy apaga o histórico do aparelho.** […] Se um dia for trocado, a ordem é […]" | MARCA.md:170-181 | não mensurável | procedimento condicional; não houve troca a medir |

## As violações de MARCA.md, uma a uma

**M-11 · o veredito traz delta, janela e limite.** São nove textos de veredito
(`src/dominio/corpo.ts:188-231`). Sete trazem os três: "A média subiu 0,52 e
depois 0,61 kg — duas semanas seguidas acima de 0,5." (`:202`) é o padrão. Um
não tem delta porque não há dado ("Faltam dados", `:194`), o que a regra não
alcança. Um tem delta e janela e **não diz o limite**: "A média está em X kg por
semana. Não é motivo para mexer na comida — uma semana isolada fora da faixa é
ruído, e a regra pede duas seguidas." (`:230`) — a faixa existe no código
(`ALVO_MIN`/`ALVO_MAX`) e não entra na frase.

**M-12 · o freio cita a regra e diz de quem ela é.** O freio de dor cumpre, com
a mesma frase da MARCA, em dois lugares (`exercicio.jsx:276-277`,
`historico.jsx:110-112`). Três não cumprem: a regra de cardio aparece sem dono e
com conselho próprio colado — "A regra é não pôr cardio no mesmo período de
treino de perna — se ainda der, deixe para outro dia." (`dados.jsx:529-532`) e
"A regra é não pôr cardio no mesmo período de treino de perna."
(`main.jsx:5555`) — e a retrospectiva dá conselho do app sem citar regra
nenhuma: "Vale olhar se está concentrada em algum exercício antes de começar o
próximo." (`retrospectiva.jsx:50-52`).

**M-13 · antes de perguntar, diga o que já está garantido.** Das 19 perguntas
nativas, 7 dizem o que continua de pé: `main.jsx:2318` ("As sessões já
registradas com ele não mudam."), `2701` ("O histórico do exercício continua
guardado."), `3391`, `5009`, `5272`, `5374`, `5454`. As outras 12 perguntam sem
garantir nada: `863, 879, 2124, 2716, 2778, 2788, 2799, 2853, 3823, 4005, 4111,
6531`. Onde a regra é cumprida à risca é fora do `confirm()`: `decisao.jsx:28-30`
("As séries que você registrou já estão no histórico. Isto decide só o treino B
de amanhã.").

**M-16 · no destrutivo, delimite o estrago.** Dois diálogos seguem a forma que a
MARCA recusa — irreversibilidade mais pergunta, sem dizer o que fica:
`main.jsx:2853` ("Apagar esta sessão do histórico? Isso não tem volta.") e
`main.jsx:4111` ("Apagar todo o histórico? Isso não tem volta."). No segundo, a
delimitação que a MARCA cita como exemplo bom existe — mas na tela, embaixo do
botão (`guia.jsx:318-321`), não na pergunta.

**M-17 · estado vazio é uma frase.** Critério: contagem de frases terminadas em
ponto. Sete dos 22 estados vazios têm mais de uma: `historico.jsx:82-85` (2),
`retrospectiva.jsx:41-44` (2), `treino.jsx:195-198` (2), `ajustefoto.jsx:144`
(2), `protocolo.jsx:172` (2), `dados.jsx:399-402` (2) e `dados.jsx:406-410` (3).
Ilustração e mascote: zero, em todos.

**M-25 · o ícone e o que o teste tranca.** As cores conferem: `public/icone.svg`
tem exatamente `#D9FF16` e `#0E1112`, e nada mais. O que não confere é a
promessa de cobertura — `tests/dominio/estilo.test.ts` não cita `#D9FF16`,
`#0E1112`, `icone.svg` nem `public/` em asserção nenhuma. O teste tranca a
paleta do Instrumento dentro de `tokens.css` (`:34-49`) e proíbe hexadecimal
solto nas folhas (`:51-58`); pôr a paleta do Instrumento dentro do ícone não
quebra teste nenhum. O único teste que toca nos arquivos do ícone é
`tests/fluxo/publicacao.test.js:90-97`, e ele só confere que eles entram no
precache.

**M-28 · `ins-` é o prefixo de toda classe e todo token.** Dos 51 tokens de
`tokens.css`, 47 têm o prefixo; os 4 que não têm são `--sa-top`, `--sa-bottom`,
`--sa-left` e `--sa-right`. Das 534 classes distintas das quatro folhas do app,
112 têm `ins-` e 422 não — entre elas as famílias inteiras herdadas do sistema
antigo (`.ex`, `.tag`, `.setrow`, `.cal-*`, `.dd-*`, `.gu-*`, `.tc-*`, `.pr-*`,
`.cp-*`, `.aj-*`), que o `componentes.css:1026-1036` documenta como mantidas de
propósito, por serem o contrato dos testes de fluxo com o DOM.

## As não mensuráveis de MARCA.md, e uma verificação que deu certo

**M-02, M-19, M-21, M-23, M-35** não têm onde se aplicar no código de hoje: o
nome não aparece em tela, não existe wordmark no repositório, e a descrição do
símbolo é sobre desenho, não sobre arquivo. A própria `MARCA.md:87` diz isso de
uma delas ("hoje a regra de dentro não tem onde se aplicar").

**M-43** é um procedimento para um evento que não aconteceu.

**M-01 · a verificação que deu certo.** Todas as referências de arquivo e commit
da `MARCA.md` foram conferidas uma a uma e todas existem e dizem o que a tabela
promete: `progressao.ts:61-67` (`shouldUp` devolve `false` voltando de pausa),
`primitivos.jsx:75-77` (`Procedencia`), `main.jsx:90` (`lastro-v1`),
`nuvem.ts:37` (`lastro-nuvem-v1`), `vite.config.js:66` (`lastro-<hash>`),
`fotos.ts:26` (`lastro-fotos`), `palco.js:100` (`lastro-bancada-v1`),
`main.jsx:3321, 3326` (`app: 'lastro'` e `lastro-AAAA-MM-DD.json`),
`public/icone.svg`, e os commits `7c18963` e `7767d2b`. Os commits citados pelo
`DESIGN.md` também existem e fazem o que ele diz (`6f4dd12`, `3283495`).
Fronteira: a tabela de endereços não lista `lastro-corpo` (`corpo.ts:22`), a
profundidade `{ lastro: k }` do histórico (`navegacao.js:97`) nem o marcador
`{"lastro":"aula"}` do arquivo de aula (`edicao.jsx:220`) — todos coerentes com
a regra, nenhum listado. E as 12 linhas da tabela de voz não trazem
`arquivo:linha` nenhum, que é o que a regra do topo do documento pede.

---

# O que não consegui medir, e por quê

1. **Tudo que depende de layout renderizado.** Altura de aba em telas de
   rolagem (U-30), medição em pixels antes e depois (U-33), layout shift
   (U-49), 320/390/430 px sem overflow (U-63, U-64), campo em foco visível com o
   teclado aberto (U-65), foco atrás de sticky (U-56). Não subi navegador: o
   `playwright-core` está nas dependências, mas não há navegador instalado nem
   roteiro de captura no projeto, e rodar um mudaria o repositório.
2. **PWA instalado** (U-67): exige aparelho.
3. **Regras cuja palavra-chave não está definida em documento nenhum**:
   "região" (D-09), "genuinamente destacado" (D-05), "para agrupar" (D-07),
   "estrutura x ênfase" (D-10), "ação frequente" (U-40), "ação comum" (U-45),
   "contraste conforme DESIGN.md" (U-66, porque o DESIGN.md não fixa razão
   nenhuma).
4. **WCAG 2.2 AA** (U-50): regra por referência a uma norma inteira; medi só os
   pontos que o próprio contrato destaca (U-51 a U-58).
5. **A medição em execução foi uma só** — o Esc com folhas empilhadas — e ela
   rodou sobre o `dist/` já existente (build de 21/09 15:53, correspondente a
   `d832da4`), não sobre um build novo. Se o `dist/` estiver velho em relação a
   alguma mudança posterior em `src/ui/instrumento/folha.jsx`, aquele número
   precisa ser refeito; o fonte lido bate com o comportamento observado.
