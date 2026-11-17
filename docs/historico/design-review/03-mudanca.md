# 03 · Mudança — o caso de que regras envelheceram

Agente 3. Minha posição está atribuída: construir o caso mais forte de que
regras do perímetro deixaram de servir. Os identificadores são os de
[`01-conformidade.md`](01-conformidade.md). A origem de cada regra vem de
[`02-origem.md`](02-origem.md), e tudo que eu afirmo por conta própria traz
`arquivo:linha`, commit ou seção.

**Tive caso em 32 das 161 regras. Em 129 escrevi "não tenho caso".**

**Das 32, todas são "a regra envelheceu". Nenhuma é "a identidade
envelheceu".** Testei a identidade de propósito, no lugar onde ela é mais
atacável — `nunca comemora` —, e ela ganhou. Está escrito no fim, com a
evidência que me derrotou.

---

## O mecanismo por trás de 15 dos 32 casos

D-03, D-04, D-09, D-10, D-11, D-14, D-16, D-19, D-24, D-28, D-29, D-30, D-34,
D-49 e U-10: em todas, o caso se apoia em algo que se perdeu, ficou velho ou foi
generalizado na passagem do handoff para o documento do Lastro.

O agente 2 achou que o `DESIGN.md` é uma tradução resumida de
`App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md`,
que nunca o cita. Confirmei, e achei o corolário que muda o peso do achado:

**O código não obedece ao `DESIGN.md`. Ele obedece ao handoff, e diz isso por
escrito — em nove linhas, espalhadas por quatro arquivos.**

| cita o handoff (`DESIGN_SYSTEM`, `§3.x`) | cita o `DESIGN.md` |
|---|---|
| `componentes.css:3` ("As medidas vêm do DESIGN_SYSTEM §3 e são exatas, não sugestão") | `palco.css:10` — e cita para dizer que **rompe** três dos seis |
| `componentes.css:121` ("O §3.3 pede uma…") | `main.jsx:3478` — e cita a regra que este relatório mostra ser falsa |
| `primitivos.jsx:3` ("as medidas vêm do DESIGN_SYSTEM §3") | |
| `timeline.jsx:7` ("Anatomia (DESIGN_SYSTEM §3.6)") | |
| `estilo.test.ts:88, 91, 92, 93, 94` — o teste que **bloqueia merge** lista as exceções "cada uma citada no DESIGN_SYSTEM" | |

Nove linhas contra duas, e as duas são o contraexemplo e o erro. O documento que
o repositório trata como lei é o handoff; o `DESIGN.md` é o resumo dele que
ninguém consulta.

Isso importa porque **resumir custou o critério de medição**. As quatro regras
que o agente 1 não conseguiu medir não são vagas por natureza: três delas eram
mensuráveis no original e ficaram vagas na tradução. E uma "violação" é erro de
digitação do resumo.

| id | o handoff dizia | o `DESIGN.md` guardou | o que se perdeu |
|---|---|---|---|
| D-04 | "'250 g arroz' is mono only when it is **data in a value column**; in a prose sentence the whole sentence is display" (handoff:14) | "Nunca misturar dentro de uma mesma string" | o desempate. Sem ele, os 8 seletores de prosa em mono não têm como ser julgados |
| D-09 | "At most one acid element **competing** per region **of the viewport**" (handoff:16) | "No máximo um elemento ácido por região" | as duas qualificações. `tokens.css:17` ainda guarda "região **da tela**" — o resumo perdeu até do comentário |
| D-10 | "A 10px tracked label **always introduces a section or names a value**" (handoff:17) | "Rótulo mono em caixa alta é estrutura, nunca ênfase" | a metade operacional. Sobrou a proibição, sem a definição |
| D-16 | decisão medida em `2e3ef75`: "O nível 5 fica para o **redundante**" | "Os dois últimos são para rótulo, nunca para prosa" | "rótulo" é mais largo que "redundante", e é por essa folga que passam os 22 `Vazio` |
| D-19 | `13 / 400 / **1.5**` (handoff:67) | `13 / 400 / 1.4` | nada: é erro de transcrição. O código está certo desde sempre |
| D-24 | a escala **mais** "List row vertical padding 13–16px. Gap between sibling controls 6–8px" (handoff:52) | só a escala | as duas medidas que governam listas e controles vizinhos |
| D-28 | `§3.5`, `§3.14`, `§3.10` são seções do handoff | as mesmas marcas, num documento que não tem `§3` | a fonte. Quem procurar no `DESIGN.md` não acha |

**Consequência que eu quero registrada:** em D-05 e D-07 o handoff também não
define nada — "genuinamente destacado" e "preenchimento para agrupar" nasceram
vagos e atravessaram dois apps assim. Ali o problema não é a tradução; é que a
regra nunca teve critério nenhum, em lugar nenhum.

---

## Índice — onde tenho caso e onde não tenho

### `DESIGN.md`

| id | veredicto meu | magnitude | uma linha |
|---|---|---|---|
| D-01 | não tenho caso | — | a cor solta é um literal do handoff; tokenizar é conserto de código, não de regra |
| D-02 | não tenho caso | — | o tema é a tese do produto e o código inteiro a sustenta |
| D-03 | **caso 8** | regra | a regra está certa; a **lista de exceções** tem três cópias divergentes e a bancada abriu uma quarta |
| D-04 | **caso 1** | regra | o critério de desempate foi cortado na tradução |
| D-05 | **caso 9** | regra | "genuinamente destacado" nunca foi definido em documento nenhum, e 70 caixas com borda passam |
| D-06 | não tenho caso | — | zero sombras no app; a regra governa e é obedecida |
| D-07 | **caso 9** | regra | "para agrupar" é intenção; a regra não consegue recusar nada |
| D-08 | **caso 6** | regra | o ácido ganhou um quinto sentido em 9 sítios, e o âmbar um segundo; nenhum está escrito |
| D-09 | **caso 1** | regra | "competindo" e "da viewport" foram cortados, e é o corte que a tornou imensurável |
| D-10 | **caso 1** | regra | "sempre introduz uma seção ou nomeia um valor" foi cortado |
| D-11 | **caso 2** | regra | a contagem já era falsa no dia em que foi escrita |
| D-12 | não tenho caso | — | origem inteira em `508cbc6`, e é o raciocínio mais bem escrito do repositório |
| D-13 | não tenho caso | — | os cinco valores batem; ninguém precisa de razão para um preto |
| D-14 | **caso 4** | regra | quatro linhas para um app que tem cinco classes de objeto |
| D-15 | não tenho caso | — | os cinco tokens existem e só eles; opacidade é conserto de código |
| D-16 | **caso 1** | regra | "rótulo" autoriza o que a decisão original ("redundante") excluía, e colide com U-50 |
| D-17 | não tenho caso | — | 12 de 12 |
| D-18 | não tenho caso | — | o par está em uso e a retirada da Archivo tem commit |
| D-19 | **caso 1** | regra | `1.4` é erro de digitação; o código sempre esteve certo |
| D-20 | não tenho caso | — | piso de 9px é acessibilidade; as 3 regras abaixo são defeito de código |
| D-21 | não tenho caso | — | idem, 13px |
| D-22 | não tenho caso | — | a melhor origem do perímetro; ver "onde eu queria ter caso" |
| D-23 | não tenho caso | — | idem |
| D-24 | **caso 5** | regra | existem três escalas — a do documento, a do teste e a do código — e quem decide é o teste |
| D-25 | não tenho caso | — | 20px, cumprida |
| D-26 | não tenho caso | — | fechar 24–26 em 24 tem motivo escrito em `componentes.css:32` |
| D-27 | **caso 3** | regra | 248 violações e zero razão registrada, em lugar nenhum |
| D-28 | **caso 5** | regra | as fontes apontam para fora do documento, e a frase "o teste cobra" é falsa |
| D-29 | **caso 4** | regra | "stepper" nomeia dois componentes; um deles não pode ter 46, com razão escrita |
| D-30 | **caso 4** | regra | o chip tomou `--ins-tap-dense` emprestado porque o `DESIGN.md` não tem anatomia de chip |
| D-31 | não tenho caso | — | 40px tem a razão mais concreta do documento (`treino.css:306`) |
| D-32 | não tenho caso | — | medida, escrita e travada por teste |
| D-33 | não tenho caso | — | anatomia cumprida, e a única revisão dela tem motivo |
| D-34 | **caso 7** | regra | descreve um componente que o projeto decidiu não construir, em commit datado |
| D-35 | não tenho caso | — | cumprida em quatro folhas |
| D-36 | não tenho caso | — | cumprida |
| D-37 | **caso 10** | regra | "o único modal" convive com 22 diálogos nativos há um ano sem ninguém tratar como defeito |
| D-38 | não tenho caso | — | o 14 não tem razão registrada, mas também não custa nada |
| D-39 | não tenho caso | — | o gesto tem razão escrita e é o desfazer que U-42 pede |
| D-40 | não tenho caso | — | dois problemas de iPhone resolvidos, nomeados em `tabbar.jsx:4-14` |
| D-41 | não tenho caso | — | o caminho curto está nomeado e recusado com cinco motivos |
| D-42 | não tenho caso | — | 62 contra 73 é o documento desatualizado, não a regra; conserto de uma linha |
| D-43 | não tenho caso | — | a licença é a coisa toda que a bancada tem a dizer |
| D-44 | não tenho caso | — | a terceira animação é da bancada e morre em `prefers-reduced-motion` como as outras |
| D-45 | não tenho caso | — | cumprida |
| D-46 | não tenho caso | — | cumprida e travada por teste |
| D-47 | não tenho caso | — | cumprida |
| D-48 | não tenho caso | — | cumprida |
| D-49 | **caso 2** | regra | a mesma regra escrita duas vezes no mesmo documento, errada nas duas |
| D-50 | não tenho caso | — | retirada concluída, com os dois commits conferidos |

### `docs/LASTRO_UX_CONTRACT.md`

| id | veredicto meu | magnitude | uma linha |
|---|---|---|---|
| U-01 | não tenho caso | — | três camadas, e o teto é o que impede a quarta |
| U-02 | não tenho caso | — | "não existe um segundo estado que possa divergir" é a razão inteira |
| U-03 | não tenho caso | — | o Esc que fecha duas é defeito de código, não de regra |
| U-04 | não tenho caso | — | cumprida |
| U-05 | não tenho caso | — | um destino fora do padrão é defeito de código |
| U-06 | não tenho caso | — | "um app que não deixa sair com o Voltar é pior" |
| U-07 | não tenho caso | — | anti-padrões fechados com o histórico derivado |
| U-08 | não tenho caso | — | consequência de U-06 |
| U-09 | não tenho caso | — | o "Fechar" da retrospectiva é defeito de código, e eu o vi (`retrospectiva.jsx:59`) |
| U-10 | **caso 11** | regra | generalizada de uma regra de folha para toda tela, sem registro, e o §4 a contradiz |
| U-11 | não tenho caso | — | medida antes e depois |
| U-12 | não tenho caso | — | idem |
| U-13 | não tenho caso | — | o iOS obriga, e está escrito |
| U-14 | não tenho caso | — | cumprida |
| U-15 | **caso 12** | regra | a linha da tabela é um resumo do parágrafo abaixo dela, e 10 das 11 "violações" foram aprovadas por quem escreveu a regra |
| U-16 | não tenho caso | — | "por chave, nunca por pilha", com a razão |
| U-17 | não tenho caso | — | três formas, cumpridas |
| U-18 | não tenho caso | — | dois problemas medidos, um deles o relógio em cima do relógio |
| U-19 | não tenho caso | — | as cinco abas são a arquitetura do produto |
| U-20 | não tenho caso | — | cumprida |
| U-21 | não tenho caso | — | "herdado do app antigo e continua certo" |
| U-22 | não tenho caso | — | "não existe evento de teclado no iOS" |
| U-23 | não tenho caso | — | a razão negativa está escrita, e é rara |
| U-24 | não tenho caso | — | o gesto de home rouba o toque; medido |
| U-25 | não tenho caso | — | `folha.jsx:6-8` é a melhor frase do perímetro; a quarta folha é defeito de código |
| U-26 | não tenho caso | — | a exceção do cronômetro é decisão registrada em `06-final-review.md:146` |
| U-27 | não tenho caso | — | cumprida |
| U-28 | não tenho caso | — | cumprida |
| U-29 | não tenho caso | — | "nada a corrigir — é um acerto do sistema atual" |
| U-30 | não tenho caso | — | Guia em 8,2 telas é o número que a criou |
| U-31 | não tenho caso | — | nenhum componente novo foi preciso |
| U-32 | não tenho caso | — | "recolher a justificativa é divulgação progressiva; recolher a resposta é esconder" |
| U-33 | não tenho caso | — | "parece grande não é diagnóstico" sobrevive a qualquer revisão |
| U-34 | **caso 13** | regra | sem origem, sem caso a resolver no dia, e o componente de rodapé mais novo do app a desobedece obedecendo U-35 |
| U-35 | não tenho caso | — | o toast nascia inteiro atrás do cronômetro; é o §7 que funciona |
| U-36 | não tenho caso | — | "melhor que o de qualquer referência" |
| U-37 | não tenho caso | — | "remove dois usos do teclado por série" |
| U-38 | não tenho caso | — | medida: séries 1 e 2 de 3 não disparavam |
| U-39 | não tenho caso | — | instante-alvo sobrevive ao segundo plano |
| U-40 | não tenho caso | — | imensurável, mas a auditoria mediu e não achou violação |
| U-41 | não tenho caso | — | a janela de 700 ms é real, mesmo depois da correção do instrumento |
| U-42 | **caso 14** | regra | virou exigência de interface a partir de uma auditoria que concluiu "nada a corrigir" |
| U-43 | não tenho caso | — | 19 confirmações em português, com o objeto nomeado |
| U-44 | não tenho caso | — | conferi o "restaurar" em âmbar: é reuso da classe `.dlbtn` do deload, não decisão contrária |
| U-45 | não tenho caso | — | imensurável, mas a razão está asserida na própria regra |
| U-46 | **caso 15** | regra | sem origem, contra uma auditoria que aprovou os estados, e com a forma de um app que tem rede |
| U-47 | **caso 16** | regra | sem origem, 29 dias mais nova que M-17, e reprova o exemplo que a `MARCA.md` dá de estado vazio bom |
| U-48 | não tenho caso | — | sem origem, mas "erro perto do que causou, sem apagar o digitado" se defende sozinho |
| U-49 | **caso 15** | regra | sem origem, nunca medida, e governa uma transição só — o boot |
| U-50 | não tenho caso | — | norma externa |
| U-51 | não tenho caso | — | medida, 8 → 0, e regredida depois: defeito de código |
| U-52 | não tenho caso | — | idem |
| U-53 | não tenho caso | — | idem |
| U-54 | não tenho caso | — | norma; o alvo de 11px é defeito de código |
| U-55 | não tenho caso | — | cumprida |
| U-56 | **caso 17** | regra | sem origem, nunca medida, e o app não tem `scroll-padding-top` em folha nenhuma |
| U-57 | não tenho caso | — | norma; os 3 estados só por cor são defeito de código |
| U-58 | não tenho caso | — | cumprida, e o `CLAUDE.md` do dono confirma a lição |
| U-59 | não tenho caso | — | `100svh`; o dono do projeto escreveu a mesma lição por fora |
| U-60 | não tenho caso | — | o piso do inset tem razão escrita |
| U-61 | não tenho caso | — | a armadilha do `overflow-x: hidden` está nomeada e travada por teste |
| U-62 | não tenho caso | — | "o manifesto pede retrato, e o iOS não honra" |
| U-63 | não tenho caso | — | sete perfis medidos, zero overflow |
| U-64 | não tenho caso | — | idem |
| U-65 | não tenho caso | — | registrado como risco aceito, que é a forma honesta |
| U-66 | **caso 18** | regra | manda conferir contraste "conforme DESIGN.md", e o `DESIGN.md` não fixa razão nenhuma |
| U-67 | **caso 19** | regra | nunca foi executado uma vez, no único ambiente em que o produto roda |
| U-68 | não tenho caso | — | cumprida, e a severidade original já foi corrigida pela própria auditoria |

### `MARCA.md`

| id | veredicto meu | magnitude | uma linha |
|---|---|---|---|
| M-01 | não tenho caso | — | conferida uma a uma e verdadeira, exceto onde M-25 promete o que não existe |
| M-02 | não tenho caso | — | o voto vencido está registrado e é do dono decidir; não é envelhecimento |
| M-03 | não tenho caso | — | cumprida |
| M-04 | não tenho caso | — | o modo de falha que ditou a forma está no commit |
| M-05 | não tenho caso | — | cumprida |
| M-06 | não tenho caso | — | custa zero e o produto não tem onde assinar |
| M-07 | não tenho caso | — | zero exclamações em string de tela |
| M-08 | não tenho caso | — | testei a fundo e perdi; ver "onde eu queria ter caso" |
| M-09 | não tenho caso | — | cumprida |
| M-10 | não tenho caso | — | cumprida |
| M-11 | não tenho caso | — | 7 de 9 vereditos trazem os três; o oitavo é defeito de código |
| M-12 | não tenho caso | — | "conselho próprio, nunca" é a regra que separa este app da categoria |
| M-13 | não tenho caso | — | 12 perguntas sem garantia são defeito de código, e `decisao.jsx:28-30` mostra a forma certa |
| M-14 | não tenho caso | — | cumprida |
| M-15 | não tenho caso | — | cumprida |
| M-16 | não tenho caso | — | dois diálogos na forma recusada são defeito de código |
| M-17 | **caso 16** | regra | "uma frase" é contagem de palavras onde o que importa é a ausência de enfeite, e colide com U-47 |
| M-18 | não tenho caso | — | 71 commits, 1 desvio automático |
| M-19 | não tenho caso | — | dorme até existir um wordmark; dormir não é envelhecer |
| M-20 | não tenho caso | — | a delimitação está escrita, inclusive a admissão de escopo vazio |
| M-21 | não tenho caso | — | idem |
| M-22 | não tenho caso | — | cumprida |
| M-23 | não tenho caso | — | descrição de desenho, com a arte aprovada por trás |
| M-24 | não tenho caso | — | sha256 idêntico; a regra funciona |
| M-25 | **caso 20** | regra | promete cobertura de teste que não existe, contra a regra do topo do próprio documento |
| M-26 | não tenho caso | — | medido: 93,6% e 76,6%, como o texto promete |
| M-27 | não tenho caso | — | o argumento contrário está registrado e a decisão é do dono |
| M-28 | **caso 21** | regra | "o prefixo de toda classe e todo token" era falso no dia em que foi escrito, contra uma decisão anterior documentada |
| M-29 | não tenho caso | — | cumprida |
| M-30 | não tenho caso | — | cumprida |
| M-31 | não tenho caso | — | cumprida |
| M-32 | não tenho caso | — | cumprida |
| M-33 | não tenho caso | — | cumprida |
| M-34 | não tenho caso | — | cumprida |
| M-35 | não tenho caso | — | dorme com o wordmark |
| M-36 | não tenho caso | — | cumprida |
| M-37 | não tenho caso | — | cumprida |
| M-38 | não tenho caso | — | o voto vencido está registrado; é decisão, não envelhecimento |
| M-39 | não tenho caso | — | cumprida |
| M-40 | não tenho caso | — | cumprida |
| M-41 | não tenho caso | — | o hash substituiu o número à mão, com commit |
| M-42 | não tenho caso | — | "renomear é apagar dado de quem ainda não atualizou" |
| M-43 | não tenho caso | — | procedimento para um evento que não aconteceu |

---

# Os casos

## Caso 1 · O resumo que virou regra — D-04, D-09, D-10, D-16, D-19

**Magnitude: a regra envelheceu.** A identidade não entra: o handoff e o
`DESIGN.md` querem a mesma coisa. O que se perdeu foi como medir.

A tabela do topo deste documento traz as cinco, com o texto dos dois lados.
Três consequências que valem por si:

**D-19 é conserto de uma linha.** O agente 1 marcou violada porque o código traz
`13px/1.5` (`base.css:194`) e o documento escreve `1.4`. O handoff escreve
`13 / 400 / 1.5` (handoff:67). O código está certo desde `2e3ef75` e o documento
errado desde o mesmo commit. **Não é o código que precisa mudar.**

**D-16 é o caso com consequência de acessibilidade.** A decisão original, medida
em `2e3ef75`, foi "o nível 5 fica para o **redundante**". O `DESIGN.md` escreveu
"os dois últimos são para **rótulo**", que é mais largo. Conferi os números por
conta própria, e eles batem com os comentários do projeto:

| token | hex | contraste sobre `#0C0E0C` |
|---|---|---|
| `--ins-text-4` | `#7C8478` | 5,01:1 |
| `--ins-text-5` | `#5E655A` | **3,22:1** |

3,22:1 reprova em WCAG AA para texto normal (pede 4,5:1) e passa só para texto
grande. E a primitiva de estado vazio do sistema é exatamente isso:

```
primitivos.jsx:70-72   <p class="ins-body-sm ins-t5 ins-vazio">
base.css:193           .ins-body-sm { font: 400 14px/1.5 … }
base.css:225           .ins-t5.ins-t5 { color: var(--ins-text-5); }
```

14px em 3,22:1, instanciada **22 vezes** (`grep -c "<Vazio" src/ui/`). O texto
de um estado vazio é o único texto da área — não é redundante por definição
nenhuma. Três regras do perímetro apontam para direções diferentes no mesmo
elemento: D-16 (como escrito) permite, D-16 (como decidido) proíbe, U-50 exige
AA e U-47 quer que ele carregue três informações. **A folga entre "rótulo" e
"redundante" é o que deixou isso passar por um ano.**

**O que a mudança custa:** reescrever cinco frases. **O que devolve:** três
regras que voltam a ser mensuráveis, e um documento que para de discordar do
código em `body-xs`.

---

## Caso 2 · O inegociável 6 já era falso quando foi escrito — D-11, D-49

**Magnitude: a regra envelheceu.** A identidade — "quase nenhum movimento",
"lê como preciso, não como motivacional" — não está em questão em lugar nenhum
deste caso.

Este é o caso mais forte do relatório, e não é por opinião sobre movimento.

**O terceiro movimento é quatro dias mais velho que a regra.** Conferi no git:

```
7cd6418  2026-08-07  index.html:601
  #tfill { … transition: width .25s linear; }
41bb122  2026-08-11  o handoff do Instrumento entra
2e3ef75  2026-08-12  o DESIGN.md nasce, dizendo "existem dois"
```

A barra do cronômetro anima desde a **primeira linha de história do
repositório**, ainda com `var(--dawn)` da paleta azul-marinho. A frase "existem
dois" foi importada de um app de dieta que não tinha cronômetro, e nunca foi
conferida contra o que já estava na tela.

**E o projeto hoje exige que o terceiro exista.** `estilo.test.ts:376-386` é um
teste que falha se a transição for removida:

```
assert.ok(!/transition:[^;]*width/.test(m![1]), 'largura animada custa layout por quadro');
assert.match(m![1], /transition:\s*transform/);
```

O comentário do teste diz por quê: "Ele repinta 4× por segundo por até três
minutos. Animar `width` refaz o layout a cada quadro; a escala roda no
compositor". O mesmo raciocínio está em `componentes.css:1399-1401`. **O
documento proíbe o que o teste obriga.** Essa é a definição de regra que parou
de governar.

**O quarto entrou sem ninguém mencionar a regra**, e o contraexemplo está no
mesmo arquivo, a 2.100 linhas de distância:

| sítio | comportamento | cita a regra? |
|---|---|---|
| `main.jsx:3477-3478` | `behavior: 'instant'` | sim: "o sistema tem exatamente dois movimentos (§6 do DESIGN) e este não vira o terceiro" |
| `main.jsx:5595` | `behavior: parado ? 'auto' : 'smooth'` | não |

Sete dias de diferença, decisões opostas. E `main.jsx:3478` é **uma das duas
únicas menções ao `DESIGN.md` em todo o `src/`** — a outra é `palco.css:10`,
que o cita para dizer que o rompe.

**O que a regra perdeu na tradução é a metade que funcionava.** O handoff
fechava a rule 6 assim: *"No entrance animations, no fades, no skeletons that
shimmer, no springy sheets"* (handoff:18). O `DESIGN.md` guardou a contagem e
jogou fora a lista. Hoje a regra diz **quantos** movimentos existem — número que
está errado — e não diz mais **que tipo** de movimento é proibido, que era a
parte capaz de recusar uma proposta.

**O custo de manter como está:** a regra é citada em revisão (`main.jsx:3478`
prova que é), e o que ela recusa é aleatório — recusou uma rolagem e não recusou
a outra, e não recusa nenhuma das duas que já estavam lá. Um inegociável que
produz decisões opostas para o mesmo caso não está protegendo nada; está
transferindo a decisão para quem lembra dele naquele dia.

**O que devolve reescrever:** uma contagem verdadeira (quatro, ou a frase que
disser por que a barra e a rolagem não contam) e a lista do handoff de volta.
Com a lista, a revisão do motion do backlog tem contra o que ser medida. Sem
ela, tem só um número que já nasceu errado.

---

## Caso 3 · Sempre `gap`, nunca margem — D-27

**Magnitude: a regra envelheceu.**

248 declarações de margem positiva nas quatro folhas do app, mais quatro em
estilo embutido (agente 1). É a regra mais violada do sistema.

O que me fez ter caso não é a contagem — é o que procurei e não achei. O agente
2 registra: handoff:52, "Always `gap`, never margins between siblings", **sem
razão escrita em fonte nenhuma**. Conferi o perímetro inteiro: o `DESIGN.md` não
justifica, `tokens.css` não justifica, e `estilo.test.ts` não a cobra — o teste
de espaço (`:82-118`) olha o **valor** de `padding`, `margin` e `gap`, nunca a
escolha entre eles.

Então temos: uma regra herdada de outro app, sem argumento registrado em
lugar nenhum, violada 248 vezes, não coberta por teste, e cuja violação é o
idioma dominante do sistema (`margin-top` é a forma majoritária).

**O que ela custa:** ela é a única regra do perímetro que, aplicada, implicaria
tocar em 248 declarações de CSS estável. Enquanto ninguém faz isso, ela senta
no documento produzindo um veredicto "violada" que ninguém pode agir sobre — e
esse veredicto contamina a leitura das outras 49 violações, que são pequenas e
acionáveis.

**O que devolve tirá-la ou estreitá-la:** se o que se quer proteger é o colapso
de margem e o espaçamento pertencer ao contêiner, a regra estreita — "dentro de
um contêiner flex ou grid, `gap`" — é verdadeira, mensurável e quase já é
cumprida. A versão larga não é nenhuma das três.

---

## Caso 4 · O vocabulário de componentes ficou menor que o app — D-14, D-29, D-30

**Magnitude: a regra envelheceu.** O sistema visual não; ele cresceu, e o
documento não.

O `DESIGN.md` resumiu o §3 do handoff de catorze anatomias para oito bullets, e
deixou de fora justamente as que o Lastro mais usou. O resultado é que três
regras acusam de violação objetos que o documento não sabe que existem.

**Existem dois steppers, e a regra nomeia um.**

| | canônico | compacto |
|---|---|---|
| onde | `base.css:289-294`, primitiva `Stepper` (`primitivos.jsx:210`) | `componentes.css:926-937`, `.stepper` |
| alvo | `var(--ins-tap)` = **46px** | **38 × 38** |
| borda | `--ins-border-strong` | `--ins-hairline` |
| usado em | refeição, editores, dados | editor de programa (`edicao.jsx:31, 33`) |

D-29 diz "`--ins-tap: 46px` […] — stepper, botão primário, botão de ação", e o
compacto reprova. Mas o compacto tem razão escrita, e ela é boa
(`componentes.css:924-926`):

> Stepper compacto: os três controles do exercício têm de caber numa linha só
> num iPhone de 390px. Quebrar em duas dobra a altura de cada exercício, e a
> lista inteira deixa de caber numa tela.

Isso é D-29 contra U-30 ("uma aba que passa de três telas de rolagem precisa de
justificativa") no mesmo controle. O código escolheu e escreveu por quê. **O
documento não registra nem a escolha nem o conflito.** E o mesmo objeto produz a
violação de D-14, porque o compacto usa `--ins-hairline` onde a tabela das
quatro linhas manda `--ins-border-strong`.

**O chip tomou emprestado um token que não é dele.** D-30 reserva
`--ins-tap-dense: 28px` a "toggle de um toque dentro de linha densa", e 4 dos 6
usos não são isso — `.ins-chip` (`base.css:270`) e `.chip` (`treino.css:465`)
são seletores de modo no topo de COMIDA, DADOS e GUIA. Não é descuido: o
`DESIGN.md` **não tem anatomia de chip**. O handoff tem (§3.10, "padding 9–12px,
1px `--ins-border`, mono 10–12px"), e o `DESIGN.md` cita `§3.10` em D-28 sem
trazer a seção. Sem token próprio, o chip pegou o mais próximo. E o tamanho que
ele acabou tendo tem razão escrita (`base.css:279-281`):

> 33 -> 41, e não 44: chips QUEBRAM linha, e o vão entre duas fileiras é o
> limite. Crescer além dele faria a fileira de baixo roubar o toque da de cima —
> pior que o alvo pequeno.

**O que custa manter:** três veredictos "violada" (D-14, D-29, D-30) que apontam
para decisões corretas e documentadas no código. Um auditor que os leia
literalmente vai subir o stepper compacto para 46 e quebrar a lista de
exercícios em duas linhas por item.

**O que devolve:** nomear os três controles que o Lastro tem e o handoff não
tinha — stepper compacto, chip/segmentado e a faixa da sessão — e dar a cada um
o seu alvo e a sua linha. É acréscimo ao documento, não subtração ao sistema.

---

## Caso 5 · Existem três escalas de espaço, e quem decide é o teste — D-24, D-28

**Magnitude: a regra envelheceu.**

| fonte | escala | exceções |
|---|---|---|
| `DESIGN.md:100` | 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34 | 5, 3, 9, 17 — "cada uma com fonte" |
| `estilo.test.ts:89` | **1, 2**, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34, **46** | as mesmas quatro, **aplicadas globalmente** |
| `tokens.css:56-67` | 4…34, sem 1, sem 2, sem 46 | — |

O teste aceita três degraus que o documento não lista, e é o teste que roda no
merge. Por isso as 22 medidas que o agente 1 achou fora da escala passam verdes:
16 delas são `2px`, que o documento proíbe e o teste autoriza. Conferi a
contagem por regex própria e cheguei a 18 ocorrências de `2px` em espaço, na
mesma ordem de grandeza.

**`2px` não é acidente: é um degrau do sistema que ninguém declarou.** Dezesseis
usos, distribuídos por `componentes.css` e `treino.css`, em lugares diferentes,
ao longo de meses.

E o teste lê três arquivos (`estilo.test.ts:98`), sem `protocolo.css`, e não olha
estilo embutido no JSX. A frase do `DESIGN.md:106` — "`tests/dominio/estilo.test.ts`
cobra" — é uma promessa de cobertura que o arquivo não cumpre como escrita.

**As quatro exceções apontam para fora do documento.** `§3.5`, `§3.14` e `§3.10`
são seções do handoff. O `DESIGN.md` não tem `§3`. O teste sabe disso e diz por
escrito (`estilo.test.ts:91`): "Exceções, cada uma citada no **DESIGN_SYSTEM**".
O documento de design do projeto é o único dos três que não sabe de onde vem a
própria regra.

**O que devolve:** uma escala só, com 1, 2 e 46 declarados ou banidos de verdade,
e as quatro exceções com a fonte que existe. Custa reconciliar um array.

---

## Caso 6 · O acento ganhou um quinto sentido, e ele não está escrito — D-08

**Magnitude: a regra envelheceu. A identidade NÃO.** Faço questão desta linha:
nenhum dos sítios abaixo diz "parabéns", nenhum desenha medalha, nenhum conta
sequência. `nunca comemora` continua de pé. O que não está de pé é a lista de
quatro sentidos do ácido.

D-08 escreve: ácido = **agora / feito / seu / aperte aqui**. Li os nove sítios
que o agente 1 apontou e nenhum é um dos quatro:

| `main.jsx` | o que decide a cor |
|---|---|
| `4953` | `t.subindo ? 'ins-acid' : 'ins-amber'` |
| `5159` | `dif > 0 ? 'ins-acid' : dif < -25 ? 'ins-amber' : ''` |
| `5781` | `recordes ? 'ins-acid' : ''` |
| `5808` | `x.bom ? 'ins-acid' : ''` |
| `5914` | `bom(dv) ? 'ins-acid' : ''` |
| `5938` | `bom(delta) ? 'ins-acid' : ''` |
| `6031` | `R.evol.length ? 'ins-acid' : ''` |
| `6037` | `deltaCor: 'ins-acid'` (fixo, na retrospectiva) |
| `6048` | `(x.ritmo ? x.dv < 0 : x.dv > 0) ? 'ins-acid' : ''` |

O sentido operante é **"isto melhorou"**. E há um par: em `4953` e `5159` o
âmbar é o polo oposto — "isto não melhorou" —, que também não é o sentido
escrito do âmbar ("preste atenção").

Nove sítios, em quatro telas diferentes, construídos ao longo de meses, todos
com a mesma semântica, nenhum registrado. Isso não é desvio; é uma dimensão do
sistema de cor que existe no código e não no documento.

**O que custa não escrever:** a regra seguinte de D-08 é "no máximo um elemento
ácido por região", e ela é imensurável em parte porque ninguém sabe quantos
sentidos o ácido tem. E qualquer revisor que aplique D-08 ao pé da letra vai
apagar as nove cores e tirar da retrospectiva a única informação que ela dá de
relance.

**O que devolve escrever:** ou um quinto sentido declarado ("comparação
favorável, em tela de olhar para trás"), ou um token próprio. E aí a pergunta
"o app comemora?" vira respondível, em vez de ficar suspensa entre a regra de
cor e a regra de voz.

---

## Caso 7 · A linha de timeline descreve um componente que não existe — D-34

**Magnitude: a regra envelheceu.**

`DESIGN.md:126-129` afirma um fato sobre o código: a linha de timeline é
"**Reusada por refeição e por exercício**, e é isso que faz o dia parecer uma
sequência só".

Não é. O componente é importado uma vez (`hoje.jsx:105`), e o exercício da tela
TREINO tem anatomia própria. E a divergência não é descuido — é decisão datada,
com motivo, em `508cbc6` (2026-08-25):

> Ela ocupa a calha que era só do número, e leva o número junto, embaixo e
> menor: acrescentar uma coluna custaria largura ao nome do exercício, que é o
> que ele lê primeiro.

A origem explica o resto: no handoff, "**reuse for exercises**" (§3.6) era uma
**proposta de fusão**, escrita antes de o app de treino existir. O `DESIGN.md`
copiou a proposta como se fosse descrição, e `timeline.jsx:3-6` repete a tese.

**O que custa:** o documento afirma como anatomia vigente algo que o projeto
decidiu contra, por escrito, treze dias depois de o documento nascer. Quem ler
D-34 para desenhar tela nova vai tentar encaixar exercício numa calha de hora
que já perdeu essa disputa.

**O que devolve:** duas frases — a linha de timeline é a espinha do dia em HOJE;
o exercício tem calha de miniatura, e o commit diz por quê.

---

## Caso 8 · A regra do raio está certa; a lista de exceções tem quatro versões — D-03

**Magnitude: a regra envelheceu (a lista, não o princípio).** "Raio zero"
continua sendo a decisão mais visível do sistema e eu não a ataco.

Quatro textos, quatro conteúdos:

| onde | a terceira exceção |
|---|---|
| `DESIGN.md:16-18` | ponto de status · thumb do slider · **miniatura do aparelho** |
| `tokens.css:7-9` | ponto de status · thumb do slider · **indicador de home** (o texto do handoff, já revisado em `508cbc6`) |
| `tokens.css:71-76` | ponto de status · thumb do slider · miniatura — correto |
| `componentes.css:1417` | ponto de status · **ponto ao vivo** · thumb do slider — e não cita a miniatura |

Conferi as onze declarações de `border-radius` do app. A regra é obedecida:
quatro zeram o raio (`base.css:105, 123`, `treino.css:301`, `componentes.css:660`),
cinco são `50%` em pontos de 4 a 9px (`base.css:307`, `componentes.css:163,
1256`, `treino.css:660, 729`), uma é o thumb (`componentes.css:1422`) e uma é
`--ins-raio-foto` (`treino.css:711`).

Mas a lista de "três" já cobre pelo menos **cinco** objetos redondos distintos —
ponto de status, ponto ao vivo, ponto da timeline, ponto da calha vazia, thumb —
e a bancada abriu a quarta categoria (`palco.css:133`, 73px no aparelho de
referência, licença declarada em `DESIGN.md:164`).

**O que custa:** quem for mexer lê `tokens.css:7-9` primeiro, porque é o
cabeçalho do arquivo de tokens, e encontra a versão revisada há um ano. **O que
devolve:** uma lista só, com os pontos agrupados como uma exceção ("todo ponto
de status é redondo") em vez de enumerados errado em três lugares.

---

## Caso 9 · Duas regras que nunca tiveram critério, em documento nenhum — D-05, D-07

**Magnitude: a regra envelheceu.**

D-05 ("caixa com borda é reservada a objeto genuinamente destacado") e D-07
("nunca preenchimento para agrupar") vêm do handoff rule 3, palavra por palavra,
e **nenhuma das duas versões define os termos**. Não é perda de tradução, como o
caso 1: é ausência de origem.

O agente 1 não conseguiu medi-las e deu o contexto: 70 regras do app desenham
borda de caixa inteira, controles inclusive, e 39 regras usam superfície
preenchida como fundo.

Uma regra que não consegue recusar nada não é uma regra. Mas o registro mostra
que ela **funciona como argumento** quando alguém a invoca: `508cbc6` usa D-07
para justificar a calha tocável ("um retângulo que não faz nada seria
preenchimento para agrupar, que o sistema proíbe") e `treino.css:151` a usa
contra fundo alternado ("um fundo alternado seria exatamente isso").

**O caso, então, é preciso:** as duas são boas frases de argumentação e ruins
como critério de conformidade. Custam dois veredictos "não mensurável" e a
ilusão de que o perímetro governa borda e preenchimento, que ele não governa.
Devolvem, se movidas de "inegociável" para o texto de abertura do tema, um
documento onde tudo que está listado como regra é medível.

---

## Caso 10 · "O único modal" convive com 22 diálogos nativos — D-37

**Magnitude: a regra envelheceu (a frase, não o teto de três níveis).**

Separo duas coisas que a mesma regra junta:

- **O teto de três folhas não tem caso contra si.** `folha.jsx:6-8` — "na quarta
  ninguém sabe mais o que fechar leva de volta para onde" — é a melhor
  justificativa do perímetro, e a quarta folha alcançável é defeito de código.
  Ver U-25, onde escrevi "não tenho caso".
- **"A folha de baixo — o único modal" é outra coisa.** O app tem 19 `confirm()`
  e 3 `prompt()` (agente 1, `main.jsx`, 22 sítios), e U-43 os aprova
  explicitamente: "difícil de reverter → confirma, com o que se perde dito em
  português", com veredicto **cumprida**.

Então o perímetro tem uma regra dizendo que a folha é o único modal e outra
regra premiando o uso de 19 modais do sistema. Nenhum commit, nenhuma auditoria
e nenhum comentário em um ano tratou os 22 como defeito.

A leitura que reconcilia é "a folha é o único padrão modal **desenhado pelo
app**; diálogo de sistema é superfície do sistema". Ela é quase certamente o que
se quis dizer. Mas não é o que está escrito, e a diferença entre as duas leituras
são 22 telas a reconstruir.

**O que devolve:** seis palavras a mais em `DESIGN.md:132` e um veredicto
"violada" que some sem ninguém tocar em código.

---

## Caso 11 · A ação primária como último elemento foi generalizada sem registro — U-10

**Magnitude: a regra envelheceu.**

A origem é handoff §3.8, e ela é sobre **folha**: "Primary action is the **last**
element, full width" — dentro da anatomia da bottom sheet, onde faz todo
sentido, porque a folha é uma tarefa curta que termina em um botão.

O contrato copiou para a tabela de rótulos do §2 e a aplicou a **toda tela**,
sem dizer que estava generalizando. O resultado é que o próprio contrato se
contradiz a duas seções de distância:

- §2 (contrato:51): "salvar / concluir | aplica | ação primária, **último
  elemento**"
- §4 (contrato:81-82): destino tem "`‹ voltar` primeiro, título `h1` […], **ação
  opcional à direita**"

`ajustefoto.jsx:68` põe "salvar" no cabeçalho do destino — obedece ao §4 e
reprova no §2. As outras quatro telas que o agente 1 achou (`historico.jsx`,
`retroativo.jsx`, `edicao.jsx`, `edicaodia.jsx`) são destinos ou painéis, não
folhas.

**O que custa:** cinco veredictos "violada" que são, em parte, o contrato
brigando consigo mesmo. **O que devolve:** devolver a regra ao escopo em que ela
nasceu — folha — e deixar o §4 governar destino, que é o que ele já faz.

---

## Caso 12 · A linha da tabela contradiz o parágrafo embaixo dela — U-15

**Magnitude: a regra envelheceu (a tabela, não o critério).**

A regra indexada é a célula: "Atualizar dado na mesma tela | **não mexe**". O
agente 1 mediu contra ela e achou 11 `scrollTo(0,0)`.

Mas o critério de verdade está no parágrafo imediatamente abaixo
(contrato:65-69), e é outro:

> O sinal é o controle — se ele fica no meio da página e é feito para ser tocado
> mais de uma vez (andar mês, trocar filtro, paginar), a rolagem não pode sair
> de baixo do polegar.

E quem escreveu a regra já auditou os mesmos sítios. `d180718`, o commit que
acrescentou o §3: *"Auditei as outras dezessete ocorrências: são troca de aba,
de dia, de destino ou fim de fluxo, e nessas o topo está certo."*

O próprio agente 1 registra que **só um** dos 11 bate com o exemplo escrito
(`andaPose`, `main.jsx:6467`). Os outros 10 são iniciar treino, descartar,
encerrar, entrar em modo de edição — fim de fluxo, que o autor da regra aprovou
por escrito.

**O que custa:** a célula da tabela é o que se cita, e ela produz dez falsos
positivos. **O que devolve:** trocar "atualizar dado na mesma tela" por "repintar
sob um controle que se toca mais de uma vez" — o critério que já está escrito
quatro linhas abaixo.

---

## Caso 13 · Ação fixa no rodapé — a regra sem caso, desobedecida pelo componente mais novo — U-34

**Magnitude: a regra envelheceu.** É o meu terceiro caso mais forte.

O agente 2 achou que U-34 é uma das oito **sem origem**, e mais: no dia em que
foi escrita não havia o que resolver — `05-navigation-behavior-matrix.md`
registra "Ação fixa: **não**" nas cinco abas. Conferi por conta própria e não
existe um commit no repositório inteiro que mencione "ação fixa"
(`git log --grep="ação fixa"`, zero resultados).

O que eu acrescento é o que aconteceu **depois**:

```
a00aaf1  2026-09-09  o contrato nasce, com "não coexiste com a tab bar"
893e2c3  2026-09-21  a faixa da sessão ganha o modo pergunta
```

Doze dias. O componente de rodapé mais recente do app
(`src/ui/instrumento/faixasessao.jsx`) traz dois botões de ação — "continuo
treinando" e "já parei" — e aparece, por decisão explícita do commit, em todas as
abas com a tab bar visível:

> Ela aparece em todas as abas, treino inclusive: quem esquece de finalizar
> costuma ter esquecido olhando justamente para ela.

O commit explica a decisão em seis parágrafos e **não menciona o §7 uma vez**.

E não é desleixo, porque o mesmo componente obedece ao §7 **com rigor** — à
segunda metade, U-35, que tem origem (`b1f4fad`):

```
faixasessao.jsx:15-18   Empilha ACIMA do cronômetro, como o toast: `--ins-timer-h`
                        é escrito pelo casco […] E escreve a própria altura em
                        `--ins-faixa-h`, que o toast e o fim da página leem
base.css:176            padding-bottom: calc(var(--ins-tabbar) + var(--ins-timer-h)
                                            + var(--ins-faixa-h) + var(--ins-9));
componentes.css:1337    bottom: calc(var(--ins-tabbar) + var(--ins-timer-h)
                                     + var(--ins-faixa-h) + var(--ins-6));
```

**As duas metades do §7 dizem coisas incompatíveis.** A primeira diz que ação
fixa no rodapé não coexiste com a tab bar e que "se as duas forem necessárias ao
mesmo tempo, a tela está errada". A segunda descreve o rodapé como uma **pilha
cuja camada de baixo é a tab bar**, e ensina a medir para empilhar mais uma.
A pilha da segunda metade já está desatualizada também: contrato:147 lista três
camadas — tab bar → cronômetro → toast — e a faixa é a quarta.

**O que custa manter U-34:** ela declara errada uma tela que resolveu um
problema real, com raciocínio escrito, obedecendo à outra metade da mesma seção.
É o único veredicto "violada" do relatório inteiro que acusa um acerto recente.

**O que devolve tirá-la:** o §7 passa a dizer uma coisa só, que é a que o sistema
faz e que foi medida: o rodapé é uma pilha, cada camada mede a de baixo, e a
página soma todas.

---

## Caso 14 · O desfazer que a auditoria não pediu — U-42

**Magnitude: a regra envelheceu.**

`02-research-principles.md` escreveu "Ação frequente e reversível prefere
desfazer a confirmar" e **concluiu que o Lastro já cumpria** — "nada a
corrigir" —, porque apagar o campo é o desfazer. O contrato transformou isso em
"Reversível → executa e **oferece** desfazer", que é exigência de interface.

O app tem o desfazer certo em três formas, nenhuma delas um botão em toast: a
lista "mudanças de hoje" (`edicaodia.jsx:31-38`), o "desfazer" do exercício
pulado (`exercicio.jsx:354`) e apagar o campo da série — que a auditoria, na
origem de U-36, chama de "melhor que o de qualquer referência"
(`02-research-principles.md`, via agente 2). E D-39 documenta o mesmo
gesto nos ticks: "é como se desfaz sem botão de desfazer"
(`primitivos.jsx:287-290`).

Ou seja: o perímetro tem três regras que celebram o desfazer sem botão e uma que
exige o botão.

**O que custa:** para fechar as 3 exclusões que o agente 1 achou, seria preciso
construir infraestrutura de toast-com-ação que o app não tem
(`main.jsx:3443-3450`: o toast é só texto) — e o toast é a superfície que U-48 já
critica por estar longe do que causou. Construir ação dentro dele é investir na
superfície errada.

**O que devolve:** voltar ao texto que a auditoria mediu — "reversível prefere
desfazer a confirmar" — e deixar a forma do desfazer com a tela.

---

## Caso 15 · Os quatro estados são forma de app com rede — U-46, U-49

**Magnitude: a regra envelheceu.** É o meu caso mais forte depois de D-11.

U-46 e U-49 estão entre as oito **sem origem**, e o agente 2 mostrou algo mais
forte que ausência: a auditoria que o contrato cita como fonte na linha 7
**aprovou** o que existia. `04-implementation-plan.md:4` — "design system, área
segura, viewport, **estados vazios** e movimento **já estão certos**";
`03-screen-audit.md:87` — "sem achados próprios". Nenhum dos doze achados é sobre
carregando ou erro.

O que eu acrescento é por que a regra não encaixa neste produto. Fato nº 1 do
briefing: **um usuário, sem conta e sem servidor; os dados moram no navegador.**
Conferi o que o app busca fora dele:

```
grep -rn "fetch(" src/
  src/sw.js:92, 105              — o service worker
  src/infra/nuvem.ts:102,169,190,205 — a sincronização opcional
```

Nenhum outro. Todo o resto sai de `src/infra/db.ts`, que lê `localStorage`. O
app carrega **uma vez**, no boot, e tem exatamente um estado de carregando, no
lugar certo:

```
index.html:39   <div id="app"><div class="msg">Carregando seu histórico…</div></div>
```

Depois disso, as telas leem um objeto em memória. Não há o que carregar e não há
o que falhar — exceto nos dois pontos de E/S que existem: a nuvem e as fotos.

E é exatamente aí que moram os estados que o código tem. Os quatro "carregando"
que o agente 1 achou são `guia.jsx:217, 238` (nuvem), `protocolo.jsx:99`,
`camera.jsx:131` e `comparar.jsx` via `FotoAjustada` (fotos). Os dois "erro" são
`guia.jsx:236` (nuvem) e `camera.jsx:43-54` (câmera). **Nenhum está numa tela que
lê só da memória — e nenhuma tela que lê só da memória precisa de um.** A regra
conta 15 telas porque foi escrita para um app onde cada tela é um endpoint.

Não é que o código esteja perfeito nos pontos de E/S: as telas de foto que
carregam (`protocolo`, `comparar`) não têm estado de erro desenhado. **Esse é o
defeito real, e a regra como está o esconde** — ele fica diluído num "0 de 15"
em que a maioria das telas não tem o que carregar.

**O que custa:** U-46 é o veredicto "violada" de maior alcance do relatório — 15
telas de 15 — e a maior parte dele é artefato de uma regra importada. Cumpri-la
ao pé da letra significa desenhar estado de carregando para telas que leem um
objeto já em memória, e estado de erro para leituras que não passam pela rede.
U-49 ("sem layout shift ao sair de carregando") herda o problema: fora dos
pontos de E/S, governa uma transição só, a do boot, e nunca foi medida
(`06-final-review.md` não a lista).

**O que devolve:** "toda tela que faz E/S declara carregando e erro; as outras
declaram vazio e conteúdo." Custa uma frase, e troca um veredicto de 15 em 15 por
um veredicto sobre as poucas telas que falam com a nuvem ou com as fotos — onde
ele ainda acha defeito de verdade, e por isso passa a valer alguma coisa.

---

## Caso 16 · O estado vazio tem duas regras que se anulam — U-47, M-17

**Magnitude: a regra envelheceu.** Nas duas, e elas precisam ser resolvidas
juntas.

A colisão está datada:

| | quando | o que exige |
|---|---|---|
| **M-17** | 2026-08-11, handoff UX law 10, literal, **com exemplo** | "Estado vazio é **uma frase**. Sem ilustração, sem mascote." |
| **U-47** | 2026-09-09, **sem origem** | "Vazio explica **o que é a área, por que está vazia e qual é a ação**" |

Vinte e nove dias, três exigências contra uma, e ninguém registrou que estava
trocando de regra. A prova de que elas se anulam está no próprio perímetro: o
exemplo que a `MARCA.md:67` dá de estado vazio **bom** — "Ainda não há carga
registrada suficiente para estimar." (`dados.jsx:496`) — reprova em U-47, porque
não aponta ação nenhuma.

**Contra U-47:** "qual é a ação" pressupõe que sempre há uma. Há estados vazios
no app em que não há: "Nenhuma série registrada neste dia" (`sessao.jsx:106`),
num dia que já passou; "Treino não encontrado." (`programa.jsx:81`); o limiar da
retrospectiva, que só se cumpre treinando mais três sessões. Não conferi os 19
que não apontam ação um a um, e em alguns deles existe ação possível — "Nenhuma
medida registrada ainda." (`dados.jsx:52`) fica na tela onde se registra a
medida, e ali U-47 acha defeito real. Mas a regra está escrita como "vazio
explica… qual é a ação", sem ressalva, e basta um estado sem ação disponível
para ela ser incumprível. O primeiro exemplo da lista acima basta.

**Contra M-17:** a contagem de frases é uma métrica que mede a coisa errada. O
que a regra quer é ausência de enfeite ("sem ilustração, sem mascote"), e isso o
app cumpre em 22 de 22 (agente 1: "Ilustração e mascote: zero, em todos"). As 7
que "violam" quebram só o limite de uma frase, e quebram para carregar um limiar
que o usuário precisa — `retrospectiva.jsx:41-44`:

> Ainda não há sessões suficientes neste bloco para comparar começo e fim. A
> retrospectiva fica útil a partir de três sessões por exercício.

A segunda frase é informação, não consolo. Cortá-la para cumprir M-17 tira do
usuário o número que ele precisa para saber quando voltar.

**O que devolve:** uma regra só, no lugar de duas — "estado vazio diz o que
falta, e diz a ação quando existe uma; sem ilustração, sem mascote, sem
consolo". Cumpre o que M-17 quer proteger, não exige o que U-47 não pode
entregar, e valida o exemplo que a própria `MARCA.md` publica.

---

## Caso 17 · Foco atrás de sticky — U-56

**Magnitude: a regra envelheceu.** Caso pequeno, e o digo.

A metade "e nunca escondido atrás de sticky" é uma das oito **sem origem**: sem
achado, sem commit, sem comentário. Nunca foi medida — o agente 1 a marcou não
mensurável porque exige teclado num navegador, e `06-final-review.md` não a lista
entre as verificações.

E o app não tem o mecanismo que a cumpriria: não há `scroll-padding-top` em folha
nenhuma; o único recuo é o `scroll-margin-top` de `.ex` (`treino.css:25`), que
existe por outro motivo (trazer o exercício aberto para a tela,
`main.jsx:3470-3476`).

Uma exigência nunca medida, para um risco nunca observado, num app cujo uso
principal é um dedo numa tela de telefone. **O que devolve:** ou vira item
verificável (`scroll-padding-top` nos contêineres sticky, cobrado por teste) ou
sai. Como está, é uma caixa que nunca foi marcada nem desmarcada.

---

## Caso 18 · O checklist aponta para um documento que não tem a informação — U-66

**Magnitude: a regra envelheceu.**

"contraste conforme DESIGN.md" (contrato:226). Conferi: a palavra "contraste"
aparece no `DESIGN.md` uma vez, na linha 79, e é sobre o par tipográfico ("o par
tem eixo de contraste real"). **Não há razão de contraste em lugar nenhum do
documento.**

Os números existem e eu os reproduzi (caso 1): 5,01:1 para `--ins-text-4`,
3,22:1 para `--ins-text-5`. Mas moram em comentários de CSS — `base.css:137-139`,
`componentes.css:325`, `treino.css:189-191`, `treino.css:372-376` — e vieram de
`2e3ef75`.

Um item de checklist que manda consultar um documento sem a informação não é
verificável por ninguém. **O que devolve:** pôr o limiar no `DESIGN.md`, na
seção de texto, onde a tabela dos cinco níveis já está — e aí U-66 passa a ter o
que conferir, e D-16 ganha o critério que perdeu na tradução. É o mesmo conserto.

---

## Caso 19 · O item que nunca foi executado, no único ambiente que importa — U-67

**Magnitude: a regra envelheceu.**

"PWA instalado conferido" (contrato:231). O agente 2 verificou que nunca foi
feito: `06-final-review.md:8-11` mediu em "Chromium com emulação de telefone", e
o próprio relatório lista "PWA instalado: exige aparelho" como limite. O agente 1
também não conseguiu, pelo mesmo motivo.

E é o ambiente em que o produto roda. O briefing diz: PWA em iOS Safari, aberto
pelo ícone. Metade das decisões mais caras do sistema existem por causa dele —
`--sa-*` com piso (`tokens.css:95-97`), `body::before` sob a barra de status
(`base.css:62-69`), a tab bar que some com o teclado (`tabbar.jsx:7-9`), o aviso
de deitado porque "o iOS não honra" o manifesto (`base.css:317-329`).

**O caso não é que a verificação não importa — é que ela está escrita como caixa
de checklist de tela nova, e nenhuma tela nova pode marcá-la.** Ela é um ritual
de release de aparelho, não um passo de desenho de tela. Enquanto estiver ali,
todo checklist do app fica permanentemente incompleto por um item que quem
desenha a tela não tem como cumprir. **O que devolve:** movê-la para onde ela é
executável.

---

## Caso 20 · Uma promessa de cobertura que não existe — M-25

**Magnitude: a regra envelheceu.**

`MARCA.md:113` fecha a regra do ícone assim: "Trocar um pelo outro em qualquer
direção quebra o que `tests/dominio/estilo.test.ts` tranca."

O agente 1 conferiu e não é verdade: o teste não cita `#D9FF16`, `#0E1112`,
`icone.svg` nem `public/` em asserção nenhuma. Ele tranca a paleta do Instrumento
dentro de `tokens.css` e proíbe hexadecimal solto nas folhas — pôr a paleta do
Instrumento dentro do ícone não quebra teste nenhum.

Isso importa mais aqui do que importaria em outro documento, porque a `MARCA.md`
abre com M-01: "**toda promessa tem um arquivo e uma linha.** Onde não tem, está
escrito que não tem." M-25 cita arquivo e linha para uma cobertura que o arquivo
não tem. É a única regra do perímetro que quebra a regra do topo do próprio
documento.

**O que devolve:** ou a asserção no teste (barato, o arquivo do ícone já é lido
por `publicacao.test.js:90-97`), ou a frase sai. Nas duas saídas M-01 volta a ser
verdadeira.

---

## Caso 21 · "O prefixo de toda classe e todo token" era falso no dia em que foi escrito — M-28

**Magnitude: a regra envelheceu. A fronteira Lastro × Instrumento, não.** Deixo
isso explícito: "`ins-` nomeia o que se vê, `lastro-` nomeia o que se guarda" é
uma boa fronteira, cumprida em todos os endereços (M-04, cumprida). O que
envelheceu é a segunda metade da frase.

`MARCA.md:135-137` diz que `ins-` é "o prefixo de **toda** classe e **todo**
token". A medição: 47 de 51 tokens têm (os 4 sem são os `--sa-*`, que são do
sistema operacional e não do Instrumento — a exceção é correta e não está
escrita); e **112 de 534 classes**. 422 não têm.

E não é dívida acumulada depois: a decisão contrária já estava tomada e escrita
**antes** da `MARCA.md` (`4c561ee`, 2026-08-26). `componentes.css:1026-1036` e
`treino.css:1-16`:

> Estas classes nasceram na paleta antiga e sobreviveram à fusão porque são o
> contrato que os testes de fluxo têm com o DOM — renomeá-las compraria churn sem
> comprar nada… O que muda aqui é só a língua: token do Instrumento, fio no lugar
> de cartão, raio zero.

Então a `MARCA.md` escreveu uma regra universal sobre 534 classes depois de o
projeto ter decidido, por escrito e com motivo, o contrário para 422 delas — e
não registrou a exceção.

**O que custa:** o veredicto "violada" de M-28 sugere 422 renomeações que o
projeto já recusou uma vez, contra um teste que depende dos nomes atuais. **O que
devolve:** escrever a exceção que já existe no código — `ins-` é a língua do que
nasce novo; as famílias herdadas ficam porque são contrato de teste, e a fusão já
passou por elas trocando token, fio e raio. A regra vira verdadeira sem mudar
uma linha.

---

# Onde eu queria ter caso e não tive

O briefing pede o lado da mudança, e estes são os lugares onde procurei com mais
vontade e saí de mãos vazias. Registro porque o silêncio é a parte do relatório
que eu não posso fabricar.

## M-08 · "Nunca comemore" — a identidade que eu tentei derrubar

É a regra que o briefing marca como o exemplo de identidade atacável, e eu a
ataquei pelo melhor ângulo que existe: **o app já tem uma tela cujo assunto é o
que melhorou.**

`src/ui/telas/retrospectiva.jsx`, nascida em `681f09f` (2026-08-14). Ela conta
recordes, lista "o que evoluiu", pinta nove deltas favoráveis em ácido (caso 6).
Se "nunca comemora" tivesse envelhecido, era aqui que apareceria.

Perdi, e perdi pelo texto da própria tela:

```
retrospectiva.jsx:3-9   A única tela do app que olha para trás sem pedir nada em
                        troca […] "Parados" não é acusação e o texto diz isso
                        explicitamente […] O valor da lista é ele ter olhado.

retrospectiva.jsx:33-35 Mesma carga do começo ao fim, com 3 ou mais sessões. Não
                        quer dizer que esteja errado — quer dizer que você olhou.
```

A tela que mais poderia comemorar é a que escreve a frase mais cuidadosamente
não-comemorativa do app. A regra não está sendo suportada a contragosto: está
sendo aplicada com esforço, num lugar onde a categoria inteira faria o
contrário. E a razão de produto continua verdadeira palavra por palavra
(`PRODUCT.md:53-55`): "Quem treina 5 a 6 vezes por semana quebra sequência todo
domingo, e transformar isso em cobrança seria mentir sobre o programa."

**Não tenho caso contra M-08, e não tenho caso de identidade em lugar nenhum
deste relatório.** O que achei perto dela é o caso 6, que é sobre a lista de
sentidos do ácido — regra, não identidade. Separar as duas foi o trabalho, e o
resultado é que a segunda coluna ficou vazia de propósito.

## D-22 · 16px em campo de texto — a regra que eu não encostaria

Cinco seletores a violam, oito campos na tela. É tentador. Mas a origem é a mais
forte do perímetro e ela explica por que a violação existe (`base.css:126-129`):

> NUNCA abaixo de 16px: com fonte menor o Safari dá zoom ao focar o campo e a
> tela fica torta no meio de uma série. **É a regra que mais se quebra sozinha,
> porque no desktop nada acontece.**

A regra prevê o próprio modo de falha, e as cinco violações são a previsão se
cumprindo. Isso é uma regra funcionando, não envelhecendo.

## U-59, U-61 · viewport e sticky

Não tenho caso, e tenho uma evidência externa que vale registrar: as preferências
globais do dono do projeto (`~/.claude/CLAUDE.md`, que o próprio briefing manda o
agente 5 ler) trazem, escritas na dor e por fora deste repositório, as mesmas
duas lições — `100svh` contra a sobra de rolagem (U-59), e `overflow-x: clip` em
vez de `hidden` para não quebrar o sticky (U-61). Uma regra que a mesma pessoa
reaprendeu e anotou duas vezes, em dois lugares independentes, não é candidata a
sair. U-60 não aparece lá, e fico sem caso nela pelo motivo próprio: o piso do
inset tem razão escrita em `tokens.css:95-97`.

## U-25 e `folha.jsx:6-8` · o teto de três folhas

Procurei um caso e não há: "na quarta ninguém sabe mais o que fechar leva de
volta para onde" é a frase mais bem calibrada do perímetro — diz o número, diz o
critério e diz a consequência. A quarta folha alcançável é defeito de código.

## D-38 · as 14 fatias da sparkline

O agente 2 registra que o número 14 não é justificado em fonte nenhuma — nem no
handoff, nem no código, nem em commit. É o tipo de achado que eu deveria poder
usar. Não consegui: a regra não custa nada e não atrapalha nada, e não achei
uma tela em que catorze fatias fossem pouco ou demais. **Regra sem origem não é
automaticamente regra velha**, e esta é a prova.

---

# O que eu não consegui verificar

1. **Nada foi medido em navegador.** Todas as minhas afirmações saem de leitura
   de fonte, de `git log` e de dois cálculos meus (contraste, contagem de `2px`
   por regex). Onde o caso dependeria de render — altura de tela, foco atrás de
   sticky, layout shift — eu disse que não mediria e não medi.
2. **Não reabri as medições do agente 1.** Onde cito contagem dele (248 margens,
   22 diálogos nativos, 22 `Vazio`, 22 estados vazios), estou usando o índice
   como combinado. Conferi por conta própria só o que era load-bearing para um
   caso: as 11 declarações de `border-radius`, os 9 sítios de ácido por
   comparação, os dois steppers, as duas escalas de espaço, os `fetch` do app e
   as citações de `DESIGN_SYSTEM` contra `DESIGN.md`.
3. **Não avaliei o mérito do motion proposto no backlog.** Este documento julga o
   inegociável 6 como regra escrita — a contagem, a origem, o teste que a
   contradiz. Se movimento novo deve entrar, e qual, é pergunta de outro agente.
4. **Não li `04-permanencia.md` nem `05-movimento.md`**, conforme o contrato.
