# 04 · Viabilidade

Quem escreve é o **Engenheiro de viabilidade (C2)**. Mandato: dizer o **preço** de
cada direção neste stack. Não julgo se a ideia é boa, não desenho alternativa e
não proponho interface. Onde algo é impossível, digo o motivo técnico e o que
seria preciso — e paro ali.

**O que eu li.** `00-briefing.md`, `01-fatos.md`, `02-uso.md`, `02-perguntas.md`,
`03-direcao-C/` e `03-direcao-D/` inteiras (os quatro HTML abertos e lidos), e a
minha exceção nomeada no briefing §2: `src/dominio/`, `src/infra/`, `tests/`,
`vite.config.js`, `package.json`, `src/sw.js`. Não abri CSS, `src/ui/**` nem
`index.html`. Não li as outras três entregas desta onda.

**Nota de vazamento.** Para precificar "o que quebra teste existente" eu tive de
ler testes que apertam a interface de hoje. Onde isso aconteceu, descrevo o
**mecanismo e a contagem**, nunca o nome, o rótulo, a cor ou a medida — e cito
`arquivo:linha` para que o coordenador e o curador confiram sem que eu reproduza
nada aqui.

**Convenção de prova.** Toda afirmação tem fonte: `F…` (01-fatos), `U/K/D/M…`
(02-uso), `P…` (resposta do dono), um caminho de arquivo que eu li, ou uma
contagem minha marcada como **medi**. Onde não houver medida, está escrito
**não medido**.

---

## 1 · A régua de preço

Quatro faixas, com âncora medível — não com impressão.

| faixa | o que qualifica |
|---|---|
| **barato** | função pura em `src/dominio/` + o teste dela, ou mudança só de render. Nenhum campo novo persistido. Nenhum comportamento hoje testado é contradito. |
| **caro** | modelo de leitura novo que cruza três ou mais coleções do estado; ou componente novo com contrato de acessibilidade próprio; ou contradiz comportamento hoje coberto por teste. |
| **exige migração** | campo persistido novo ou alterado. Passa pelos seis portões abaixo. |
| **impossível** | o artefato estático, sem servidor, no Safari do iOS não entrega. |

**Os seis portões de um campo persistido novo.** É isto que "exige migração"
quer dizer neste projeto, concretamente — e é o que faz a faixa não ser vaga:

1. o tipo em `src/dominio/tipos.ts` (ou `nutricao/tipos.ts`);
2. uma migração `migraPlanoN` + o bump de `PLANO_ATUAL`, hoje em **9**
   (`src/dominio/migracoes.ts:24`), com fixture em `tests/dominio/migracoes.test.ts`
   — a migração roda no boot **e** na importação de uma cópia de qualquer safra
   (`src/dominio/migracoes.ts`, cabeçalho);
3. uma regra de fusão em `src/dominio/sincronia.ts`: chave natural ou documento,
   mais a chave de lápide, mais um teto em `TETO` (`sincronia.ts:35`);
4. a lista branca da **exportação** da cópia de segurança — hoje travada por
   asserção em `tests/fluxo/dados.test.js:50-90` — e a da **importação**, que
   não tem asserção nenhuma (§2.5c);
5. `tsc --noEmit` (`npm run tipos`; TypeScript ^7.0.2);
6. se o campo alimenta a regra do nutricionista, a disciplina do total
   congelado e do carimbo `pv` (`src/dominio/nutricao/tipos.ts`,
   `DiaComidaHist.tot` e `.pv`).

Seis portões é pouco ritual para um projeto que tem nove migrações e nunca
apagou dado (F254). O caro aqui não é migrar: é esquecer um dos seis.

---

## 2 · O chão comum: o que as duas pagam igual

Isto não distingue C de D. Está aqui separado para não aparecer duas vezes e
inflar as duas contas.

### 2.1 · Os 513 casos de teste de fluxo · **caro** · igual nas duas

**Medi.** O repositório tem **885 casos** (F261), em dois níveis
(`vitest.config.js`): **372 em `tests/dominio/`**, que importam os módulos
direto, e **513 em `tests/fluxo/`**, em 33 arquivos, que sobem o app montado a
partir do `dist/` num jsdom.

Os 372 de domínio **sobrevivem inteiros às duas direções**: testam regra pura —
limites da dieta, dupla progressão, atribuição de série por músculo, unidades,
migrações. Nenhuma das duas direções muda uma regra.

Os 513 de fluxo **quebram nas duas**, e não por acaso: eles entram no app pelos
mesmos quatro mecanismos que as duas direções removem.

| mecanismo do harness | arquivos afetados (de 33) | por que as duas o removem |
|---|---|---|
| entrada por uma chamada que abre um lugar nomeado da navegação de hoje (`tests/fluxo/harness.js`, API `aba`) | **33 de 33** (é o caminho do `app()`) | C passa a ter 3 lugares, D passa a ter 4; nenhum dos conjuntos é o de hoje |
| digitação em dois campos de texto por série, identificados por posição (`harness.js`, API `preencher`/`digitar`) | **24 de 33** | as duas recusam o teclado do sistema para número (C §6; D "nenhum número passa pelo teclado do sistema") — os campos deixam de existir |
| seletores de CSS e `id` de elemento | **32 de 33** | reescrita de interface |
| chamada de função interna do módulo por string, via a ponte de escopo | **31 de 33** | reescrita de interface |

**Por que tecnicamente.** O harness testa o **build**, não o fonte
(`tests/fluxo/harness.js`, cabeçalho) — que é a decisão certa e a razão pela
qual os 513 pegaram todas as capacidades que sumiram em quatro reescritas
anteriores (F301). O preço disso é que eles estão amarrados ao DOM e aos nomes
internos do que existe hoje.

Além dos quatro mecanismos, há um grupo pequeno de casos que **asserta decisões
de forma** — quantos lugares a navegação mostra, qual lugar abre primeiro, e a
paleta. Esses não "quebram": eles **reprovam por construção**, porque as duas
direções decidem outra coisa. Têm de ser reescritos ou removidos com decisão
registrada, não consertados.

**O que destrava.** Nada, e é importante dizer: isto não é um custo evitável, é
o custo de trocar a interface num projeto que decidiu testar a interface
montada. O que dá para fazer é **preservar o invariante e trocar o acesso**:
reescrever o harness com uma API por **intenção** (registrar a série *n* do
exercício *i*; marcar a refeição *r* do dia *d*) em vez de por elemento, e
repassar os 513 casos um a um. É a onda 5, não a onda 3. **Estimativa: não
medida** — mas a ordem de grandeza é o maior item isolado das duas direções, e
nenhuma das duas o paga mais que a outra.

**O que não se pode fazer:** apagar os 513 e seguir. Eles existem porque os
defeitos que apagavam série apareceram na fronteira entre rascunho, DOM e log
(F267, F268, F294, F296), e essa fronteira só existe montada. F296 é a prova
viva: escolher um alimento pela busca não fazia nada **por 48 dias** sem
ninguém notar.

### 2.2 · O teclado numérico próprio · **caro** · igual nas duas

As duas recusam o teclado do sistema para número (C §6; D recusa 1).

**Por que tecnicamente isso compra muito.** Resolve de uma vez quatro fatos do
aparelho: o zoom automático em campo com fonte menor que 16 px (F61), a vírgula
decimal que um campo numérico descarta e devolve vazio (F63, e F275 — registrar
peso já recusou número válido), o teclado que cobre metade da altura (F65) e os
elementos fixados que sobem com ele e cobrem o conteúdo (F66). Nenhuma das duas
precisa de API do sistema para isso. É HTML e CSS.

**Por que custa caro mesmo assim**, e as duas direções já dizem parte:

- **acessibilidade à mão.** Um visor com cursor desenhado não é campo de texto:
  não há cursor de leitor de tela, não há `type`, não há seleção. O contrato de
  VoiceOver (papel, valor, anúncio de mudança) é escrito à mão, e as duas
  direções o prometem (C §8; D "VoiceOver").
- **não dá para colar** (as duas declaram o custo).
- **o teclado físico do notebook.** O dono usa bastante o app pela web, num
  notebook, "sobretudo para acompanhar os registros" (P11, F50, U14). Um visor
  que não é `<input>` não recebe dígito do teclado físico sem um tratador de
  `keydown` escrito de propósito. **Nenhuma das duas menciona isso.** É barato
  de acrescentar e invisível de esquecer: o sintoma é digitar e não acontecer
  nada, que é exatamente a família de F296.

**O que destrava:** o tratador de teclado físico no visor numérico, nas duas.

### 2.3 · A altura de tela cheia · **barato**, e invisível se esquecido · igual nas duas

As duas montam a sessão como coluna de altura inteira com uma área de leitura
que rola por dentro e uma zona de polegar encostada embaixo (C: a área de
leitura com rolagem própria e a zona de registro com `margin-top:auto`; D: a
tela com `overflow:hidden` e o corpo rolando por dentro).

**Isto é a forma certa**, e vale registrar porque evita de graça uma armadilha
conhecida deste projeto: quando quem rola é um container interno, e não a
janela, **o cabeçalho pregado não se desancora** — o problema do sticky que
sobe junto com o scroll e desaparece sob a barra de URL não se apresenta,
porque não há ancestral com `overflow` criando o container errado entre a barra
e quem rola.

**O que as duas têm de pagar.** A altura de tela cheia precisa ser **`100svh`**
(com `100vh` só de fallback) **na cadeia inteira de ancestrais**, inclusive no
hospedeiro de rota. `100vh` no iOS é a viewport **grande** (barra recolhida), e
sobra uma faixa rolável da altura da barra, mostrando o fundo onde não devia.
Basta **um** ancestral em `100vh` para reintroduzir a sobra, mesmo com a tela
filha correta. Complementar: `overscroll-behavior: none` em `html, body` para
matar o rubber-band, e um fundo de `body` que não destoe.

Nos HTML entregues isto não aparece porque o telefone é uma maquete de altura
fixa (C: `height:896px`; D: idem) — então **não está nem resolvido nem
quebrado**: está fora do desenho, nas duas. É barato e tem de entrar na lista
da onda 5.

### 2.4 · O estado inteiro regravado a cada toque · **barato hoje, teto conhecido** · igual nas duas

As duas gravam no toque, sem botão de salvar (C §5; D regra 6). Isso já é como
o app funciona: o estado inteiro é reserializado a cada série registrada e
enviado inteiro a cada sincronização (F256), o armazenamento local do Safari
tem teto de ~5 MiB (F53), e o projeto já fez essa conta uma vez para recusar
guardar uma cópia do plano por dia (F257: 1.907 bytes/dia, 6,6 MiB em 10 anos).

**O que as duas acrescentam:** mais toques que gravam. Água copo a copo (14 por
dia na meta, F194), RIR por série, porção por refeição, correção de toque
errado. Cada um é um `JSON.stringify` do estado inteiro mais um
`localStorage.setItem` **síncrono** na thread principal (`src/infra/db.ts`).

**Por que ainda é barato:** os tetos de `sincronia.ts:35` (500 registros por
exercício, 3.000 sessões, 4.000 dias de comida, 400 pesagens) limitam o
envelope por construção, e o volume real medido é pequeno (F260: 14 sessões e
43 exercícios em 24/08).

**O que destrava, se um dia doer:** gravar em duas pistas — o caminho rápido do
toque num registro pequeno e incremental, e o estado inteiro com atraso. Não é
necessário agora, e nenhuma das duas direções o exige. **Não medido:** a
latência real de `setItem` no iPhone 11 Pro Max com o estado cheio.

### 2.5 · Três defeitos que já estão no código e que as duas pisam

Nenhum é criado por C ou por D. Os três são **pré-requisito** de coisas que as
duas desenham, então entram na conta das duas como obrigatórios.

**a) O estado "saiu do plano" não atravessa a fusão entre aparelhos · barato · obrigatório**

`src/dominio/sincronia.ts:307-312` copia, quando o lado remoto é mais novo,
`escala`, `tot`, `pv`, `cadencia`, `alta`, `turno`, `aj` e `m` — e **não copia
`aderencia`**. Medi: a palavra `aderencia` não aparece uma vez em
`sincronia.ts`, e nenhum teste cobre isso (grep em `tests/`).

Por que importa para as duas: `aderencia` é exatamente a resposta que C grava
em "outra coisa" (M2, estados 3 e 5) e que D grava na sua única pergunta
(M2-5). A regra do nutricionista a lê por `diaInterpretavel`
(`nutricao/calculo.ts:443`), e o dia marcado como "saiu e não sei quanto" é o
único que **derruba o dia da conta** de adesão. Um dia respondido "não sei
quanto" no telefone volta a contar como interpretável no notebook depois de uma
fusão — e adesão inflada é o que destrava o corte de −150 kcal (F212, F213).
**É a repetição exata de F292**, que é um defeito que já custou comida cortada
errado.

Com o notebook em uso declarado (P11, U14), dois aparelhos estão em jogo nas
duas direções. **Destrava:** copiar o campo no mesmo bloco, chave de lápide se
desmarcar tiver de ser possível, e um caso em `tests/dominio/sincronia.test.ts`.

**b) A cópia local das fotos do corpo é apagada a cada publicação · barato · obrigatório**

F252 diz isso, e o código mostra onde: `src/infra/corpo.ts:22` guarda os bytes
em `lastro-corpo`, e `src/sw.js:28` poupa da limpeza de ativação apenas dois
caches, que não incluem esse. Pior: `tests/fluxo/publicacao.test.js:70-78`
**fixa a lista por asserção literal**, então o teste passa verde enquanto as
fotos do corpo somem.

Por que importa para as duas: comparar foto antiga com a atual é o que o dono
diz que faz **bastante** (P8, U13), e as duas põem essa comparação no seu lugar
de leitura (C: Semanas › Fotos; D: Evolução › Fotos). Depois de cada
publicação, comparar com uma sessão antiga passa a depender de rede e de conta
(F232, F238) — e sem conta, ou antes de os bytes terem subido, a foto se perde.

**Destrava:** acrescentar o cache à lista poupada e corrigir a asserção do
teste. Uma linha e uma expressão regular. É o item de melhor relação
custo/benefício desta análise.

**c) Restaurar uma cópia de segurança perde coleções · barato a caro · obrigatório antes de oferecer restauração**

F251 lista o que a restauração não traz de volta hoje: dias de comida passados,
sessões de fotos do corpo, aulas guardadas, avaliações visuais, o registro dos
passos de ajuste e a lousa do dia — e reduz o ajuste acumulado a no máximo um
passo.

Medi, do meu lado: a **exportação** carrega tudo isso. `tests/fluxo/dados.test.js:50-90`
asserta a lista de chaves do arquivo e ela inclui, nominalmente,
`comidaHist`, `protocolo`, `gordura`, `ajusteHist`, `aulas`, `quadro`,
`descanso`, `fotos` e `promoPendente`. O problema é do outro lado: **nenhum
teste asserta que qualquer um desses campos sobrevive à importação.** Medi: dos
sete pontos do repositório que chamam a importação, nenhum verifica essas
coleções depois — os que verificam algo verificam o histórico de exercício e a
contagem de sessões. O comentário em `tests/fluxo/fusao.test.js:18-21` diz, com
precisão, que a importação é lista branca e que "campo novo só passa se alguém
lembrar de listar"; o teste que ele chama de "o alguém lembrar" confere a
**exportação**, não a importação.

Por que importa para as duas, e aqui é grave:

- **D oferece a cópia de segurança como saída do erro de gravação** (M1-10, com
  a série na tela e o armazenamento cheio). Aceitar essa oferta hoje
  destrói o histórico de comida, as sessões de foto, as aulas, as leituras de
  gordura e o ledger do ajuste — para salvar uma série.
- **C oferece trazer da cópia** quando o aparelho está sem plano alimentar
  (M2-8), com o mesmo efeito.

As duas estão oferecendo, como socorro, o caminho que apaga. Nenhuma das duas
tem como saber: F251 é o fato, e a prova dele mora em material que o time cego
não lê.

**Destrava:** completar a lista branca da importação e o clamp do ajuste, e —
isto é o que impede a recaída — um caso de teste por coleção, pelo mesmo
caminho da importação, não semeando o estado por fora.

### 2.6 · O que o iOS não entrega, e que nenhuma das duas pede

Registro para fechar o mandato: as duas direções chegaram, cegas, a recusar
exatamente o que o aparelho não dá.

| capacidade | estado no iOS | C | D |
|---|---|---|---|
| vibração pelo navegador | **impossível** (F58) | recusa, e não depende | recusa (recusa 4), e não depende |
| som sem toque do usuário antes | só com contexto criado dentro de um toque (F58) | nunca único sinal (§7) | não depende |
| trava de orientação | **impossível** (F60) | reorganiza em duas colunas (§7, estado 11) | reorganiza em duas colunas (M1-14) |
| manter o display aceso | só em app instalado, a partir do iOS 18.4; antes falha **sem aviso** (F59). A versão do aparelho não é conhecida (01-fatos, ausências) | não depende | recusa explicitamente (recusa 5) |
| lembrete com o app fechado | **impossível sem servidor** (F11) | recusa e diz o motivo (recusa 4) | recusa e diz o motivo (regra 3) |
| ler a balança de bioimpedância | **impossível**: sem API; é digitação | não promete | não promete |
| a câmera nativa mostrar algo durante a captura | **impossível** (F76) | não promete | não promete |
| garantir que os bytes da foto fiquem no aparelho | **impossível garantir**: o iOS pode esvaziar o armazenamento de arquivos sob pressão de disco (F54); a cópia permanente é a remota (F232) | diz o estado de cada foto (§7) | idem |

As duas estão certas, e nenhuma paga nada por isso. O que o código já sustenta
para o último caso: `src/infra/corpo.ts` distingue presente, ausente-mas-remoto
e falha de busca, e `protocolo.ts` tem o resto — então os cinco estados de F238
são render, não trabalho novo.

---

## 3 · Direção C — item por item

Tese: o previsto a lápis, registrar é passar a tinta, só a diferença dá trabalho.

### C1 · A gramática de três estados (lápis · tinta · hachura) · **barato**

**O que pede:** três estados visuais, mais "pulado", "não gravado" e "agora",
cada um com forma e palavra, nunca só cor.

**Tecnicamente:** é render puro sobre dado que já existe. "Tinta" é registro;
"hachura" é a ausência que o domínio já calcula (`diaInterpretavel`,
`nutricao/calculo.ts:443`; o estado `'nada'` de um exercício é **deduzido**, só
o pulado é gravado — F153, `src/dominio/sessao.ts`); "pulado" é
`Sessao.pulados`. A hachura é um gradiente repetido — custo zero de peso e
nenhum ativo para baixar, o que importa porque o tempo de abertura é orçamento
declarado (F73).

**Um detalhe que custa:** C põe texto **sobre** a hachura e resolve dando fundo
liso ao texto (§8). Funciona, e é a solução correta. Mas é o tipo de coisa que
some numa reescrita e volta como texto ilegível sobre listras; vale um teste de
regressão.

**Destrava:** nada.

### C2 · Três lugares, organizados por tempo e não por assunto · **barato**

**O que pede:** três lugares; a sessão é camada e não lugar.

**Tecnicamente:** número de lugares é entrada de roteamento. Nada no estado
depende disso. A escolha de tempo sobre assunto é sustentada pelo dado: o uso
real cruza assuntos no mesmo minuto (F30, K6 — 7 de 11 pesagens entraram no
registro entre 6h28 e 7h52, dentro da janela da sessão, P1), e `src/dominio/dia.ts`
já existe precisamente porque treino e comida modelavam o mesmo fato de formas
irreconciliáveis e a fusão exigiu uma fonte única do dia.

**Destrava:** nada. Mas ver **E2** (§5.2): a exigência leva C de 3 para 4 e
quebra o critério — o preço disso é de desenho, não meu.

### C3 · O roteiro do dia, em ordem de hora, para qualquer data · **caro** · é o maior item de C

**O que pede:** uma lista em ordem de relógio que reúne refeições, sessão,
pesagem, água, cardio, aula e fotos; setas ‹ › andando pelos dias; **um dia
passado é o mesmo roteiro com o mesmo toque**, e é assim que se faz o pôr em
dia (U11), o treino em data passada (F158) e a marca de dia de descanso (F156).

**Tecnicamente:** é um modelo de leitura novo — chame-o de projeção do dia —
que cruza **sete** coleções do estado para uma data arbitrária:

| o que a linha mostra | de onde sai | existe? |
|---|---|---|
| refeições, horários, itens, nota | `nutricao/calculo.ts` → `refeicoesDeHoje` (com o deslocamento do turno, F189, F190) | **sim** |
| o dia de comida de hoje × de um dia passado | `S.dia` (corrente) **ou** `S.comidaHist` (fechado) | **sim, mas são dois tipos diferentes** |
| sessão, séries, duração, pulados | `S.done` + `S.logs` + `src/dominio/sessao.ts` | **sim** |
| pesagem | `S.body.peso` | **sim** |
| água | `S.dia.agua` / `DiaComidaHist.agua` | **sim** |
| cardio | `S.cardio` | **sim (o registro)** |
| dia de descanso | `S.descanso` | **sim** |
| sessão de fotos | `S.protocolo.sessoes` + `protocolo.ts` | **sim** |
| **o cardio previsto** depois do A e do D | — | **não existe** (ver C7) |
| **a aula prevista** num dia | — | **não existe** (ver E3) |

Caro por três razões, nenhuma delas insuperável:

1. **São dois tipos para o mesmo fato.** O dia corrente é `DiaComida`
   (`nutricao/tipos.ts:95-130`) e o dia fechado é `DiaComidaHist`
   (`:135-200`): formas diferentes de propósito, porque o fechado congela os
   totais e carrega o carimbo da versão do plano. "O mesmo roteiro com o mesmo
   toque" exige uma projeção que normalize os dois numa leitura só — e que
   **não** unifique os tipos, porque a separação existe por um motivo bom
   (editar o plano reescrevia dias já vividos: medido, 1.348 → 1.220 kcal,
   F288).
2. **Falta o caminho de escrita de um dia de comida passado.** Medi: em
   `src/dominio/` a única função que produz um `DiaComidaHist` é `fechaDia`
   (`nutricao/calculo.ts:342`), e ela recebe o **dia corrente** e carimba
   **todas** as marcas com `agora`. Não existe função de domínio que crie ou
   edite um dia de comida de data arbitrária. C depende disso em dois estados
   (M2-5 e M2-10) e D em três (M2-4, M2-6, M2-12). É função pura nova + testes:
   **barato por unidade**, e já conta com o que precisa do lado da fusão — a
   lápide por refeição existe (`sincronia.ts:95`, `chaveDeRefeicaoFeita`) e a
   união de dias de comida já respeita instante e lápide (`sincronia.ts:275-320`).
3. **Boa notícia, e ela abate parte do preço:** a união de comida e treino numa
   mesma linha de tempo, em ordem de relógio, **já é exercitada por um teste de
   fluxo** (`tests/fluxo/fusao.test.js:59`). Parte do cálculo está feita e
   coberta.

**Destrava:** a projeção do dia como função pura, a função de escrita de dia de
comida por data, e os dois previstos que faltam (C7 e E3).

### C4 · O "agora" com seis regras de precedência · **barato**

**O que pede:** escolher o ato mais provável do instante, com janela de 45 min à
frente e 3 h atrás para a refeição.

**Tecnicamente:** é aritmética de relógio sobre `refeicoesDeHoje` e
`diaDeHoje`, as duas prontas (`nutricao/calculo.ts:158`, `dia.ts`).
`diaDeHoje` já devolve a **origem** da resposta (registrado / aberta / manual /
previsto) e a marca `previsto: boolean`, que é exatamente o que C pede para
etiquetar o palpite (§9, "etiqueta palpite enquanto não há sessão"). Pronto, de
graça.

**Risco baixo e nomeado:** C diz "errar o agora custa pouco, porque o roteiro
está logo acima e qualquer linha está a um toque" — e no desenho isso é
verdade só em parte. Medi no HTML: as linhas **hachuradas** (as que passaram
sem marca) têm um controle próprio de 44 pt na própria linha; as linhas a tinta
e a lápis são `<li>` sem controle, embora o texto prometa que "toda linha a
tinta se abre com um toque" (§5). **Destrava:** a linha virar alvo. As linhas
do roteiro já têm 50 pt de altura mínima, então não há conflito de alvo —
barato.

### C5 · Sete botões de repetição fixos em volta do valor provável · **barato** · e é uma vantagem técnica de C

**O que pede:** sete alvos de 64 pt de altura numa fileira que não rola, em
volta da última marca; "outro número" abre o teclado do app.

**Tecnicamente:** linha flex sem rolagem. Medi: a 414 pt, com 16 pt de margem
de cada lado e 6 pt entre botões, cada alvo fica com ~49 pt de largura por 64
de altura.

**Por que isto é uma vantagem e não só uma escolha:** **não há ambiguidade
entre toque e arrasto.** Numa fileira que não rola, o toque com a mão suada
(F28) ativa; não existe o caso em que o navegador interpreta o movimento
lateral como rolagem e engole o toque. Isso vale para a interação de maior
frequência do produto (48 séries registradas por semana medidas, ~76 exigidas,
U1) — ver D5, que paga exatamente esse preço.

O valor provável vem de `lastSet` (`progressao.ts`), que anda para trás no
histórico quando a última sessão teve menos séries, e exclui a sessão aberta
para não virar referência de si mesma. Pronto.

**Destrava:** nada.

### C6 · A fileira de dias para escolher data passada · **barato**

Medi no HTML (estado 10): sete dias numa faixa horizontal, em vez da roda
nativa de dia-mês-ano (F67). Render puro. É também a resposta certa para F209
(pesagem esquecida descoberta **semanas** depois): sete dias não alcançam cinco
semanas atrás, e C põe o resto em Semanas › Peso. Consistente.

### C7 · "Fim previsto ~7:22 · com o cardio de hoje, ~7:45" · **barato, com dois defeitos de procedência**

**O que pede:** o fim calculado pela prescrição — descanso prescrito mais "uns
45 s por série" — e o mesmo número com o cardio do dia somado.

**Tecnicamente:** aritmética. Mas dois problemas, e os dois são do tipo que este
projeto trata como defeito, não como detalhe:

1. **Os ~45 s por série não têm fonte.** Não estão em `01-fatos.md` e não estão
   no código. O projeto tem uma disciplina explícita e repetida de que todo
   número derivado diz de onde veio (`dia.ts`, `previsaoDoHorizonte`;
   `nutricao/tipos.ts`, `pv`; `corpo.ts`, F215). Um número com constante
   inventada numa tela de pressa é o tipo de coisa que vira verdade por
   repetição. **Destrava:** derivar dos instantes das séries já gravadas da
   própria sessão (é o que D faz) ou da mediana histórica, que já existe
   (`duracaoDaSessao`, `nutricao/calculo.ts:122` — mediana das últimas 30
   sessões, descartando as de menos de 20 e mais de 180 min). Nota: a duração
   registrada é **líquida e muitas vezes aproximada** (F152, K1 — mediana
   medida de 51 min contra os 75 de F31, porque a sessão fecha sem ele em 42% a
   59% das vezes), então projetar fim de relógio de parede a partir dela
   **subestima**. Subestimar aqui é o lado errado: o número diz que cabe quando
   não cabe.
2. **O cardio previsto não existe como dado.** Medi: `cardio` aparece em
   `src/dominio/programa.ts` só em dois comentários; não há prescrição de
   cardio por treino em lugar nenhum. `S.cardio` guarda o que aconteceu
   (`Cardio` = instante, modal, minutos, intensidade), nunca o que era previsto.
   C precisa de "20 a 25 min depois do A e 25 a 30 depois do D" (F46) como
   dado. **Destrava:** uma tabela constante por letra de treino —
   **barato, sem migração**, porque as duas direções só a **mostram**. Se um
   dia ela puder ser editada (e o programa pessoal diverge do do treinador por
   desenho, F160), passa a ser campo do programa e **exige migração**.
   C acerta ao amarrar o cardio à **letra do treino**, não ao dia da semana: a
   sequência avança pela ordem e não pelo calendário (F81).

### C8 · A fila de pendências no topo do dia, nunca dentro do esforço · **barato**

Sete itens, e medi que os sete são **calculáveis hoje**:

| pendência de C | de onde sai | existe? |
|---|---|---|
| sessão não encerrada | `S.sessao` + `Sessao.fim` | sim |
| mudanças do dia esperando decisão | `S.promoPendente` (`tipos.ts`, `PromoPendente`) | **sim, e com nove casos de teste** |
| dia de comida incompleto dentro dos 14 | `diasInterpretaveis(hist, 14, hoje)` (`calculo.ts:455`) | sim |
| semana com menos de 2 pesagens | `mediasSemanais` + `MIN_PESAGENS` (`corpo.ts:133`) | sim |
| par de fotos esperando avaliação | `parPadrao` + `leituraVigente` (`protocolo.ts:329`, `corpo.ts:110`) | sim |
| dor no mesmo exercício duas sessões seguidas | `dorSeguida` (`progressao.ts`) | sim |
| passo de ±150 indicado | `veredito` (`corpo.ts:188`) | sim |

Uma correção pequena e verdadeira: o contador dos 14 dias lê `S.comidaHist`,
que **não inclui o dia corrente** (`janelaDoHistorico`, `calculo.ts:464`). C
mostra "9 de 14" com o dia de hoje dentro da faixa (estado 1) e D mostra
"hoje passa a contar" (M2-2) — as duas corretas pela regra (F200: um dia com
uma refeição marcada já conta), e as duas precisam que a projeção dobre o dia
corrente para dentro da janela. **Barato**, e é um erro de fronteira do tipo que
já quebrou este projeto nove vezes (F299).

### C9 · "Cada toque grava, e o inverso do toque é a correção" · **barato**, com um ganho sobre D

**Tecnicamente:** cada toque é uma escrita (§2.4) e, se falhar, a linha mostra
"não gravado" com borda e texto e fica na tela até gravar — o que é a resposta
direta a F294 (fechar o app logo depois de digitar podia perder a série) e a
F296 (toque que não fazia nada, sem erro).

**O ganho sobre D, no pôr em dia:** em C os quatro toques de refazer ontem são
quatro escritas imediatas. Fechar o app no meio deixa dois toques já gravados,
nunca zero. Em D a folha acumula escolhas e só grava no "Guardar" (§4, D9).
Ver §6.2.

**O custo:** quatro escritas do estado inteiro (F256) e quatro empurrões de
sincronização com atraso (F243). Irrelevante no envelope atual.

### C10 · A sessão de fotos guiada por voz e som, com o telefone a 3 m · **barato no domínio, bloqueado por uma pergunta**

**O que pede:** o telefone a 3 m com a tela virada para longe; a sessão guiada
por voz e som, ligados pelo toque de início (F58), e a pose em letra grande.

**Tecnicamente:** o domínio está todo pronto — `protocolo.ts` tem as nove poses,
`CADENCIA_DIAS = 14`, `proximaPose` (a primeira ainda sem foto, F235),
`completude`, `diasDesde`, `parPadrao` (o par longo, F230) e `mediaDaSemana`
(F233). A câmera ao vivo está pronta e com os cinco erros nomeados
(`src/infra/camera.ts`: sem suporte, negada, ocupada, nenhuma, falhou — F77),
pede retrato traseiro como **ideal e nunca como exigência** (porque constraint
exata faz o navegador recusar a câmera inteira) e tem a verificação de primeiro
quadro (F78, imagem preta).

**O que não está resolvido:** o som. Um contexto de áudio só toca se tiver sido
criado dentro de um toque do usuário (F58) — C sabe disso e diz "ligados pelo
toque de início". Isso funciona. O que **não** se sabe é se, a 3 m, ele lê a
tela: P7 ficou sem essa parte, e D registra a mesma pergunta (D8). Enquanto
isso, **nenhuma das duas depende da resposta**: C não desenhou a sessão de
fotos, D também não.

**Destrava:** a resposta de P7. Sem ela, é barato de qualquer lado — é
`speechSynthesis` (que existe no Safari do iOS e também exige gesto prévio) ou
texto grande.

### C11 · Paisagem em duas colunas · **barato**

F60 é inescapável. Duas colunas por consulta de mídia de orientação. Medi: no
HTML de C a paisagem está feita com uma maquete escalada por transformação —
artefato de maquete, não de app. Nada a pagar.

### C12 · Semanas: o lugar sentado, também no notebook · **barato**

Tudo o que C põe lá tem função pronta: `veredito` com os números que o
produziram (F215), `arrozDoAjuste` (o passo repartido entre as refeições com
arroz, ±60 g em cada, F218), `tendenciaDeForca` + `sinalDeForca` + `textoDaTendencia`,
`seriesPorMusculo` com o corte do mesmo ponto da semana (F177), `comparacao`
dentro da região (F178, `volume.ts:123-165`), `padraoPorRefeicao` e
`aderenciaPorSemana`, `parPadrao` e `leituraVigente`. **Nada novo.** É o lugar
mais barato das duas direções, e é o que o dono não tem hoje (P8, D3, U16: zero
avaliações e zero passos aplicados).

---

## 4 · Direção D — item por item

Tese: o previsto ocupa o lugar da resposta; pede só a diferença.

### D1 · Quatro lugares · **barato**

Entrada de roteamento. Zero custo de dado. E já satisfaz **E2** sem mexer em
critério nenhum (§5.2).

### D2 · "O previsto ocupa o lugar da resposta" · **barato**

A carga vem igual à da última vez (`lastSet`), a régua se centra no último valor
(`lastSet`), o plano vem marcado nos dias postos em dia de memória
(`refeicoesDeHoje`). Tudo pronto. A distinção visual entre "veio do previsto" e
"ele declarou" é render.

**Uma coisa que D pede e que não existe no dado:** D mostra a hora da marca
("marcado às 15h41", M2-1; "na hora, 15h41", M2-4). Medi: o dia **corrente**
guarda `done: Record<string, 1>` (`nutricao/tipos.ts:99`) — não guarda instante
nenhum. O instante só existe no dia **fechado**, e `fechaDia`
(`calculo.ts:342`) carimba **todas** as marcas com o `agora` do fechamento. Ou
seja: hoje o instante de uma refeição no histórico é a hora em que o dia
**fechou**, não a hora em que ele marcou. Isso **exige migração**: `Record<string, 1>`
→ `Record<string, number>` no dia corrente, e `fechaDia` para de sobrescrever.
Pequeno, bem delimitado, e vale para as duas direções (C mostra "marcado às
15:34" no aviso, M2-2).

Observação de leitura, não de engenharia: isso provavelmente reinterpreta um
número do 02-uso. As marcações do único dia medido (10/09) aparecem com
instantes em 11/09 13h41 e 14/09 17h23, lidos como "1 e 4 dias depois" (P1,
U10). Com `fechaDia` carimbando o fechamento, um desses instantes é compatível
com "o dia foi fechado quando ele reabriu o app", não com "ele marcou quatro
dias depois". **Não medido:** qual das duas leituras é a verdadeira; os dois
instantes diferentes no mesmo dia pedem explicação (fusão entre aparelhos, ou
um caminho de escrita em dia já fechado). Quem decide o que isso significa para
o uso é o pesquisador, não eu — eu só digo que o dado atual não sustenta a
leitura forte.

### D3 · "O polegar é da próxima coisa a fazer" · **caro** · é o risco próprio de D

**O que pede:** a parte de baixo troca de função sozinha — registra a série,
depois pede o RIR, e **quando ele volta do bloqueio já é a régua da próxima
série** (M1-1 → M1-2 → M1-3), com a promessa explícita de que "nada some por
tempo: o pedido de RIR só dá lugar à próxima série quando ele volta de fora do
app, nunca enquanto está olhando".

**Tecnicamente:** a promessa inteira repousa sobre **detectar que ele saiu e
voltou**, e esse é o sinal mais fraco deste ambiente. O protótipo de D usa
`visibilitychange` (medi no script de `momento-1.html`). No iOS esse evento
dispara ao bloquear e ao ir para outro app, mas não é confiável em todas as
transições (o par `freeze`/`resume`, que existiria para isso, é de outro motor),
e o JavaScript é **suspenso** com o aparelho bloqueado ou o app em segundo plano
— só o relógio de parede continua (F57).

Dois modos de falha, os dois ruins no contexto medido:

- **o detector não dispara:** ele volta do aplicativo de conversa (P3, que é o
  caso declarado e desenhado em M1-3) e o polegar continua no RIR da série
  anterior. A próxima série exige procurar — exatamente o que a regra 2 de D
  existe para eliminar;
- **o detector dispara sem ele ter saído:** o pedido de RIR desaparece enquanto
  ele olha, quebrando a promessa de D, e o RIR é 66% das séries medidas (P1).

**Destrava, e é barato:** não depender do evento. Comparar relógio de parede
entre quadros (um intervalo que mede o próprio atraso) detecta o buraco de
suspensão sem depender de `visibilitychange`, e é o que o código já faz para o
descanso — `tests/fluxo/cronometro.test.js` tem "conta a partir do
instante-alvo" e "sobrevive à tela apagada" verdes hoje. Com isso, "voltou
depois de mais de 20 s fora" passa a ser uma inferência sobre o relógio, não
sobre um evento. D continua caro porque a troca automática do que o polegar faz
**é** um comportamento novo com dois modos de falha, não porque seja
inviável.

### D4 · A projeção de fim pelo ritmo de hoje · **barato** · e com procedência melhor que a de C

"O tempo até a última série guardada, dividido pelas séries guardadas, vezes as
séries que restam." Aritmética sobre instantes que o próprio desenho já diz
guardar ("o instante de cada série guardada fica guardado na memória da
sessão"). Não inventa constante e não supõe a hora-limite dele — que é correto,
porque a hora-limite não é dado do produto (P2 é resposta do dono, não campo) e
outros usuários terão outra manhã (P3).

**Um defeito de modelo a corrigir:** D amarra o cardio previsto ao **dia da
semana** ("na segunda e na quinta", §"o que o desenho não mostra"). Isso
contradiz F81: a sequência avança pela ordem, não pelo dia da semana, e treino
fora da prescrição não a move. Amarrado à letra do treino (A e D), como F46
também descreve e como C faz, é implementável e correto. **Barato de corrigir,
e tem de ser corrigido**, senão o previsto erra toda semana em que ele pular um
dia — e ele faz 17 sessões onde a prescrição pede 20 (U, §4 item 4).

### D5 · A régua de repetições que rola, com encaixe · **caro** · é o preço mais alto de D

**O que pede:** 12 alvos de 54 × 64 pt numa faixa horizontal com rolagem e
encaixe (`overflow-x:auto` + `scroll-snap-type: x proximity`, medi no CSS),
posicionada por código no último valor (`scrollLeft = target.offsetLeft`, medi
no script).

Dois problemas, nesta ordem de gravidade.

**a) Toque contra arrasto, na interação de maior frequência do produto.** Num
container que rola, um toque com deslocamento lateral de poucos pixels é
interpretado como rolagem, e a ativação do botão **não acontece**. O contexto é
o pior possível para isso: de pé, logo depois do esforço, suado, com uma mão
(F28). E a frequência é a mais alta que existe aqui: 48 séries registradas por
semana, ~76 exigidas, ~16 por sessão (U1, P1-B). Um toque engolido em cada
dezena é meia série por sessão que não chega ao registro — e o produto já perde
cerca de 16 de 18 séries por sessão ao vivo (U, §4 item 3), de modo que não há
folga nenhuma nesse número.

Comparação direta: C resolve o mesmo problema com sete alvos fixos sem rolagem
(C5), onde essa ambiguidade **não existe**. Esta é a diferença técnica mais
concreta entre as duas direções.

**Destrava:** `touch-action: pan-x` na faixa e ativação por `pointerup` com
limiar de movimento próprio, em vez de `click`; ou a faixa deixar de rolar. A
primeira é código que funciona e precisa de teste; a segunda é decisão de
desenho e não é minha.

**b) A posição da rolagem contra o render.** `scrollLeft` posicionado por código
volta a zero a cada remontagem do nó. No mesmo pedaço de tela mora um
cronômetro que avança a cada segundo (a faixa de descanso de M1-2). Se os dois
estiverem na mesma árvore de render, a régua "pula" para o começo uma vez por
segundo. **Destrava:** isolar o cronômetro em render próprio, ou preservar e
restaurar `scrollLeft`. Barato de fazer, caro de descobrir depois — e
rigorosamente invisível num HTML estático.

### D6 · O teclado de peso com uma casa decimal fixa ("736" vira 73,6) · **barato** · ponto a favor de D

É a resposta mais direta que eu vi às duas falhas reais de registrar peso: a
vírgula que o campo numérico descarta (F63) e o número válido recusado como
inválido (F275). Elimina a vírgula do problema em vez de tratá-la. Função pura,
teste trivial.

### D7 · A folha única de "pôr em dia", com Guardar no fim · **barato, com um modo de falha nomeado**

**O que pede:** uma folha só, com o plano daquele dia pré-marcado, quatro saídas
por refeição, a água não preenchida, a frase do que vai ficar registrado, e
**"Guardar quarta"** no fim. "Pôr hoje em dia" e "pôr ontem em dia" são a mesma
folha (bom: um caminho, não três).

**Tecnicamente:** precisa da função de escrita de dia de comida por data (a
mesma que C precisa, §3-C3, item 2). A folha única torna a escrita **atômica**:
um dia passado nunca fica num estado intermediário. Isso é melhor que C num
aspecto.

**E pior em outro, que é o modo de falha:** é o **único lugar das duas
direções** onde trabalho feito pode ser perdido por fechar o app. A folha
acumula escolhas e a regra de D é "só dá para guardar depois de responder"
(M2-5). Fechar antes do Guardar perde tudo. Isso é da mesma família de F294
(fechar o app logo depois de digitar podia perder a série recém-digitada) — um
defeito que este projeto já pagou.

**Destrava, e o padrão já existe no código:** um rascunho persistido, como
`S.draft` faz pela sessão aberta (`tipos.ts`, `Rascunho` — com o dia a que
pertence, zerado ao trocar de treino, justamente para não vazar entre
contextos). Replicar o padrão para a folha do dia é **barato** e não exige
migração se o rascunho for efêmero no mesmo campo-padrão; exige migração se
virar campo próprio.

### D8 · As linhas do dia não são alvo · **barato** · e é o que encarece M-a

Medi no HTML: as seis linhas do dia (`.dl li`) são `<li>` de 36 pt de altura
mínima, **sem controle**, com o estado em texto. A única saída da folha para
marcar outra refeição são os botões de "pôr em dia" e a aba de dias. Ver §6.1.

**Destrava:** a linha virar alvo. Grátis em dado e em cálculo, mas força a linha
de 36 para 44 pt, o que muda a densidade da lista do dia em D — que é do
desenho dele, não minha.

### D9 · "Incorporar revisão com nomes diferentes": a pergunta antes de gravar · **barato a caro** · exclusivo de D

**O que pede:** ao incorporar uma revisão de um dos agentes, perguntar
"'Flexora sentada' é a 'Cadeira flexora sentada'?" antes de gravar (F263).

**Tecnicamente:** é capacidade nova. Hoje o código identifica exercício para
sempre por um código derivado do nome na primeira vez (`slugEx`,
`programa.ts:434`), e renomear depois muda só o nome exibido, nunca o código
(F117, `tests/fluxo/edicao.test.js`). Casar um nome que chega com um exercício
que existe exige ou um casamento aproximado — e a busca do projeto **recusa de
propósito** corrigir erro de digitação, porque registrar no exercício errado é
pior que não achar (F259, `formato.ts:151-167`) — ou um mapeamento declarado
pelo usuário.

O risco que isso cobre é real e medido: F300 (uma cópia antiga lida contra o
programa novo mandaria o histórico para os exercícios errados) e U15 (2,25
mudanças de programa por semana em P1-B, com revisões a cada 12 a 16 dias).

**Destrava:** a pergunta explícita, que é o caminho conservador e o que D
desenhou — casamento por candidato sugerido, decisão do usuário, nunca
automático. Função pura + testes. **Barato se for sugestão + confirmação; caro
se alguém tentar resolver por heurística de nome**, que é o caminho que este
projeto já recusou por escrito.

C não promete isso. É uma capacidade a mais de D, com preço a mais.

### D10 · Bi-set em dois cartões alternando, com um só descanso · **grátis**

`Slot.bi` existe (`tipos.ts`) e o comportamento está testado hoje
(`tests/fluxo/cronometro.test.js`, "bi-set encadeia em vez de descansar"). A
prescrição vigente não tem nenhum (F105), então é capacidade ociosa que
continua ociosa. Zero.

### D11 · "Só os 14 dias que a regra lê" no pôr em dia · **barato** · e é a decisão certa contra o teto

`janelaDoHistorico(hist, 14, hoje)` existe (`calculo.ts:464`). Não cobrar os
dias mais antigos também evita o caminho que infla adesão em massa, que é o que
D identifica na própria pergunta 4 e o que F292 já custou.

### D12 · Paisagem, voltar do sistema, modo privado, endereço novo · **barato**

Iguais a C em preço. O modo privado tem o fato pronto (`src/infra/db.ts`: a
sonda de `localStorage` já cai para memória quando a gravação é recusada — F55),
e "onde estão os dados antes de oferecer recomeço" (M2-8, F56) é render sobre
um fato que o módulo de armazenamento já sabe (`DB.mode`: host, local ou mem).

---

## 5 · As três exigências

Entram separadas porque valem para as duas. Faço o que o mandato pede: se a
exigência cria defeito técnico, digo **qual e onde** — e não a cancelo.

### 5.1 · E1 — a decisão de tornar permanente aparece ao encerrar o treino, e num atalho discreto na tela do dia

**Faixa: barato.** É a mais baixa das três, e por uma margem grande.

**Por que:** o mecanismo inteiro já existe e está testado. `S.promoPendente`
(`tipos.ts`, tipo `PromoPendente`: o treino, o instante em que a sessão fechou,
a lista de mudanças e **cada mudança já em português**), `S.mods` com o tipo
`Mod` de nove formas (troca, séries, repetições, descanso, remover, mover,
medida, acrescentar) e **nove casos de teste** em
`tests/fluxo/promocao.test.js`, que cobrem: perguntar ao encerrar pela porta da
frente; a série a mais também virar pergunta; levar para o permanente mudar o
programa e "só hoje" não mudar; a sessão que morre sozinha **guardar** a
pergunta para a próxima abertura; a pergunta guardada aparecer ao reabrir; a
pergunta guardada **não interromper** um treino em andamento; e sair sem
responder manter o conservador sem repetir a pergunta.

Ou seja: E1 não pede nada de novo ao estado, à fusão ou à migração. Pede render
em dois lugares e **a volta de um gatilho que as duas direções removeram de
propósito** — C recusa 3 ("decidir o programa na academia"), D recusa 2 e regra
4 ("nenhuma decisão nova sob o relógio"). Isso é contradição de tese, não
defeito técnico, e não é minha para resolver.

**O defeito técnico que E1 cria, e é concreto:** "ao encerrar o treino" só
acontece nas sessões que ele encerra. Medi contra P1: ele encerrou **7 de 12**
sessões ao vivo em P1-B (58%) e **10 de 27** em P1-A (37%) — ou seja, 42% a 59%
fecham **sem ele** (U3, P1). Nessas,
a sessão fecha sozinha na última série nas duas direções (C, §9 e estado 10; D,
M1-13), e o momento de encerrar nunca chega. Se E1 for implementada **só** como
pergunta no encerramento, ela não existe na maioria dos casos medidos — e
descartar a mudança do dia sem ele decidir é literalmente F280.

**O que destrava:** manter os **dois** gatilhos que o código já tem — a pergunta
no encerramento **e** `promoPendente` na abertura seguinte — e tratar o atalho
na tela do dia como a terceira porta para o mesmo campo. As duas direções já
desenharam a terceira porta (C: a fila de pendências; D: "para decidir com
calma", M1-13). Com os três, E1 sai quase de graça.

### 5.2 · E2 — peso, medidas e fotos têm lugar próprio

**Faixa: barato na navegação · exige migração no conteúdo.** É preciso separar
as duas coisas, porque elas têm preços muito diferentes.

**O lugar: barato, nas duas.** Em D já é assim (Evolução). Em C é uma entrada de
roteamento a mais; o custo dela é de critério, não de código, e o critério é da
direção.

**O conteúdo: aqui está o preço.** O que E2 passa a hospedar inclui as medidas
novas que o dono pediu e decidiu mandar para os designers (P6, D1, D2), e essas
**exigem migração**. Medi os quatro pontos que travam:

1. `S.body` é um registro **fechado de duas chaves**:
   `body: { peso: Marca[]; cintura: Marca[] }` (`tipos.ts:481`);
2. a chave de lápide é uma **união de dois valores**:
   `chaveDeMarca(qual: 'peso' | 'cintura', …)` (`sincronia.ts:88`);
3. a fusão percorre uma **tupla literal de dois elementos**:
   `(['peso','cintura'] as const).forEach(…)` (`sincronia.ts:476`);
4. `TETO.body = 400` é **por série**, não total (`sincronia.ts:35`).

Generalizar para um registro aberto de séries de marca toca esses quatro pontos,
mais a migração 9→10 com fixture, mais as duas listas brancas da cópia de
segurança, mais os testes de `tests/dominio/corpo.test.ts`,
`tests/dominio/sincronia.test.ts` e `tests/fluxo/corpo.test.js`. É trabalho
conhecido e de baixo risco — o projeto fez isso nove vezes sem perder dado
(F254) — mas são os seis portões, não um campo.

**A bioimpedância é diferente, e está bloqueada.** Uma pesagem é um número por
data (`Marca` = instante, valor, alterado em). Uma leitura de bioimpedância é
**vários** números por data, e o dono não disse quais (P6, D2; as duas direções
registram a pergunta: C, pergunta 10; D, linha de tarefa). Sem a lista, não há
tipo a definir. **Destrava:** a resposta do dono. Até lá, o que é implementável
é a parte com fita (centímetros por ponto do corpo), que cabe no mesmo registro
aberto de séries de marca.

**O defeito técnico que E2 cria, e vale para as duas:** mover peso para um lugar
próprio não pode **tirar** a entrada rápida de onde ela de fato acontece. Medi
em P1: **7 de 11** pesagens registradas no próprio dia entraram entre 6h28 e
7h52 — dentro da janela da sessão (U8, K6, F30). Se o peso passar a existir só
no lugar de leitura, a exigência custa justamente o registro que já funcionava.
As duas direções preservam a entrada rápida por dentro da sessão (C, estado 7,
"o dia no descanso"; D, M1-2, "enquanto descansa"), e **essa parte não pode
sair**. E2 é satisfeita com "lugar próprio para **ler** e acompanhar, mais a
entrada rápida onde ela já acontece" — a dois lugares de escrita para o mesmo
dado, que a fusão já suporta (chave natural por instante,
`chaveDeMarca`).

### 5.3 · E3 — o que passou sem registro aparece marcado

**Faixa: barato para quatro das seis coisas · uma precisa de dado novo · uma não
é calculável hoje.** E3 é nativo nas duas, como o briefing diz — mas "nativo"
vale para o que o modelo sabe prever, e há duas exceções.

| o que pode passar sem registro | existe para marcar? | faixa |
|---|---|---|
| refeição e dia de comida | `diaInterpretavel` + `done` por refeição + `janelaDoHistorico` (`calculo.ts:443-470`) | **barato** |
| série e exercício da sessão | o estado `'nada'` é **deduzido**; só o pulado é gravado (F153, `sessao.ts`) | **barato** |
| pesagem da semana | `mediasSemanais` + `MIN_PESAGENS = 2` (`corpo.ts`) | **barato** |
| sessão de fotos | `diasDesde` + `CADENCIA_DIAS = 14` + `completude` (`protocolo.ts`) | **barato** |
| **cardio** | **nada**: não existe cardio previsto no programa (ver §3-C7) | **barato, mas é dado novo** |
| **a aula do box** | **nada**: não existe data esperada para ela | **não calculável hoje** |

**O defeito que E3 cria, e é real: a aula não tem vencimento no modelo.** Para
dizer "a aula passou sem registro" é preciso saber **quando** ela era esperada,
e o estado não tem essa informação por nenhum caminho:

- a sequência diz **qual** vem (a aula é a sexta posição, F80, F81,
  `dia.ts`, `proximoTreino`), mas **não diz em que dia** — e de propósito: ela
  avança por ordem, não por calendário;
- a cadência da semana (`S.cadencia`, `dia.ts`) guarda **só** treino ou
  descanso por dia da semana, e nunca qual treino. O comentário do módulo é
  explícito sobre por que: o mapa não pode mais discordar da sequência sobre
  qual sessão vem, porque não fala mais sobre isso;
- e o mundo confirma que não deve falar: a aula é quinta **ou** sábado, sem dia
  fixo, e o dono pede que fique registrado como "nada muito fixo" (P4, F21).

As duas direções, porém, põem a aula num **dia** (C: linha a lápis no roteiro de
Hoje; D: "Agora no dia da aula"). As duas estão supondo um vencimento que o dado
não tem.

**Destrava, e são dois caminhos com preços diferentes:**

- **marcar por posição da sequência, sem data** — a aula fica pendente a partir
  do momento em que o quinto treino é registrado, e a hachura diz "pendente na
  sequência", não "passou de hoje". **Barato**, nenhum campo novo, e é o único
  caminho coerente com F81 e com P4;
- **dar um dia da semana à aula** — campo novo em `S.cadencia` ou ao lado dela,
  **exige migração**, e contradiz o que o dono pediu em P4.

**O segundo defeito de E3, menor, e as duas já o viram: a água.** `agua: number`
(`nutricao/tipos.ts:101` e `:157`) não distingue "zero copos" de "não contei":
`fechaDia` escreve `agua: dia.agua || 0`. As duas direções resolvem **na
leitura** — C mostra "sem conta" e não "0"; D mostra "nenhum copo marcado" — e
as duas registram que transformar isso em fato seria dado novo (C, "dois ajustes
honestos"; D, pergunta 3). Minha leitura: **barato como convenção de leitura**
(é o que está desenhado e é honesto, porque a regra já trata o dia sem marca
como sem marca, F198); **exige migração** se um dia tiver de ser fato. Não há
pressa: nada na regra do nutricionista lê a água.

---

## 6 · As duas medições, pelo lado técnico

Quem mede o uso é outro. A mim interessa se o caminho é implementável sem
gambiarra, e quanto custa o conserto.

### 6.1 · M-a — quando a D abre na coisa errada

**O que a regra de D faz:** o cartão de cima é a próxima refeição do plano com
horário até 30 min à frente; se não houver, a última que passou sem marca
(M2, "a regra do cartão de cima"). A regra é implementável de graça
(`refeicoesDeHoje` + relógio) e é **melhor que a de C** num ponto: ela cobre o
descompasso medido entre o plano e a vida (plano às 16h00, ele come por volta
de 15h30 — K4) sem supor a rotina do dono.

**O que custa contornar, medido no desenho de D:** as seis linhas do dia são
texto, não alvo (§4-D8). As saídas de um cartão errado são:

1. **"Pôr hoje em dia"** → abre a folha das seis refeições → mudar a refeição
   certa → **"Guardar"**. São **3 toques** depois de aberta a folha, ou 4 se a
   resposta for "fora do plano" e a pergunta de consequência aparecer. Em
   M2-1, antes de qualquer marca, esse botão não está no cartão: o atalho
   "Pôr em dia" fica no bloco dos 14 dias, no pé da tela;
2. **a aba de dias** → o dia → "Detalhar" → a mesma folha. Mais longo.

**Então, tecnicamente: nenhuma saída de um toque existe no desenho, e as de
três a quatro toques passam por uma folha de seis refeições.** Isso não é um
limite do stack: é um alvo que falta.

**O conserto é de graça em dado e em cálculo:** a linha do dia vira alvo e leva
direto à refeição. O preço real do conserto é de **densidade**: as linhas têm
36 pt e precisam de 44, o que tira uma linha e meia da altura da lista no
aparelho do dono (414 × 896 pt, F49). Essa é a troca, e ela é do desenhista de
D, não minha.

Para comparação, no mesmo caso: **C tem o alvo na linha que passou sem marca** —
medi três controles de 44 pt nas linhas hachuradas do roteiro — e portanto um
toque. As linhas já a tinta, que C promete abrir ao toque (§5), **não estão
ligadas** no desenho; é o mesmo conserto, e também grátis, com folga de altura
(as linhas de C têm 50 pt).

### 6.2 · M-b — registrar ontem na C custa 4 toques

**Implementável?** Sim, e os quatro toques são os quatro que a direção diz. O
que falta é a função de escrita de dia de comida por data (§3-C3, item 2), que
é pré-requisito de **C e D** igualmente.

**O que a diferença de arquitetura implica**, e é o que me cabe dizer:

| | C: grava a cada toque | D: grava uma vez, no Guardar |
|---|---|---|
| fechar o app no meio | o que foi tocado **está gravado** | **perde tudo** (§4-D7) |
| dia num estado intermediário | possível (dois de quatro toques dados) | impossível: é atômico |
| escritas do estado inteiro | 4 (F256) | 1 |
| empurrões de sincronização | 4 com atraso (F243) | 1 |
| defeito de família conhecida | — | **F294** |

Nenhum dos dois é errado. C compra robustez contra abandono e paga em escritas;
D compra atomicidade e paga com o único ponto das duas direções onde fechar o
app perde trabalho. **Destrava para D:** rascunho persistido, com o padrão que
`S.draft` já estabelece para a sessão aberta — barato.

E uma observação que vale para as duas: **o pôr em dia não aumenta a contagem
dos 14 dias** quando o dia já tinha uma refeição marcada, porque um dia com uma
marca já conta (F200). D diz isso com estas palavras (M2-6); C diz o
equivalente no rodapé do estado 5. As duas estão corretas contra
`diaInterpretavel`, e isso me importa porque é o lugar onde uma interface
otimista mentiria para a regra que mexe na comida.

---

## 7 · O que é impossível

Curto de propósito. **Nada que C ou D desenharam é impossível neste stack.** O
que é impossível está em §2.6, e as duas direções já o recusam ou não dependem
dele. Repito o que fecha o mandato:

1. **Lembrete ou notificação com o app fechado** — impossível sem servidor
   (F11, F72). As duas recusam e dizem o motivo. Nenhuma pede.
2. **Vibração pelo navegador** — impossível (F58). Nenhuma depende.
3. **Travar a orientação** — impossível (F60). As duas desenham a paisagem.
4. **Garantir que a tela fique acesa** — não entregável de forma verificável:
   só em app instalado a partir do iOS 18.4, e antes disso **falha sem aviso**
   (F59), com a versão do aparelho desconhecida. D recusa; C não depende.
5. **Garantir que os bytes das fotos do corpo fiquem no aparelho** — impossível
   garantir (F54, F232). O que é entregável é dizer o estado de cada foto
   (F238), e isso já existe no código.
6. **Ler a bioimpedância da balança** — impossível automaticamente; é digitação.
   Nenhuma das duas promete outra coisa.

Uma coisa que **não** é impossível e merece registro, porque o 02-uso a trata
como limite: comparar fotos antigas **sem rede** é possível para as quatro
sessões mais recentes (`SESSOES_NO_APARELHO = 4`, `src/infra/corpo.ts`) e seria
possível para mais, se o cache não fosse apagado a cada publicação (§2.5b). O
que hoje bloqueia U13 não é o iOS: é um nome que falta numa lista de três
elementos.

---

## 8 · Tabela final — veredito por item

Faixas: **B** barato · **C** caro · **M** exige migração · **X** impossível ·
**!** defeito técnico que eu nomeei e que precisa de conserto.

### Chão comum (as duas pagam igual)

| # | item | faixa | destrava |
|---|---|---|---|
| 2.1 | 513 casos de teste de fluxo a reescrever | **C** | harness por intenção, não por elemento; repassar caso a caso |
| 2.1 | 372 casos de domínio | — | **sobrevivem inteiros nas duas** |
| 2.2 | teclado numérico próprio | **C** | contrato de leitor de tela à mão; **!** faltam dígitos do teclado físico, para o notebook (U14, P11) |
| 2.3 | altura de tela cheia | **B** | `100svh` na cadeia inteira; `overscroll-behavior: none` |
| 2.4 | estado inteiro regravado a cada toque | **B** | nada hoje; teto conhecido (F53, F257) |
| 2.5a | "saiu do plano" não atravessa a fusão | **B !** | copiar o campo em `sincronia.ts:307-312` + um caso de teste |
| 2.5b | cache das fotos do corpo apagado a cada publicação | **B !** | um nome em `src/sw.js:28` + a asserção em `publicacao.test.js:70-78` |
| 2.5c | restaurar cópia perde coleções (F251) | **B–C !** | completar a lista branca da importação + um teste por coleção |
| — | instante da marca por refeição no dia corrente | **M** | `Record<string,1>` → `Record<string,number>` + `fechaDia` para de sobrescrever |
| — | escrever dia de comida de data arbitrária | **B** | função pura nova; a lápide por refeição já existe |
| — | cardio previsto por **letra de treino** | **B** | tabela constante; vira **M** se for editável |
| — | meta de água como constante de domínio | **B** | uma constante |

### Direção C

| # | item | faixa | nota |
|---|---|---|---|
| C1 | gramática de três estados | **B** | render sobre dado existente |
| C2 | três lugares, por tempo | **B** | `dia.ts` já é a fonte única do dia |
| C3 | roteiro do dia para qualquer data | **C** | maior item de C; 7 coleções; dois tipos para o mesmo fato; a união comida+treino em ordem de relógio **já tem teste** |
| C4 | o "agora" com precedência | **B !** | `diaDeHoje` já devolve origem e palpite; as linhas a tinta precisam virar alvo |
| C5 | sete botões fixos de repetição | **B** | **vantagem técnica**: sem ambiguidade toque/arrasto na ação mais frequente |
| C6 | fileira de dias em vez da roda nativa | **B** | F67 |
| C7 | fim previsto | **B !** | os ~45 s/série **não têm fonte**; derivar da própria sessão ou da mediana (que subestima, K1) |
| C8 | fila de pendências (7 itens) | **B !** | os 7 são calculáveis hoje; dobrar o dia corrente na janela de 14 |
| C9 | cada toque grava | **B** | ganho sobre D no abandono |
| C10 | sessão de fotos a 3 m | **B** | domínio e câmera prontos; **bloqueada pela resposta de P7** |
| C11 | paisagem em duas colunas | **B** | F60 |
| C12 | Semanas | **B** | **nada novo**; é o item mais barato das duas direções |

### Direção D

| # | item | faixa | nota |
|---|---|---|---|
| D1 | quatro lugares | **B** | já satisfaz E2 sem mexer em critério |
| D2 | o previsto no lugar da resposta | **B** + **M** | a hora da marca exige a migração do dia corrente |
| D3 | o polegar troca de função ao voltar de fora | **C !** | depende de `visibilitychange`, o sinal mais fraco do iOS; dois modos de falha. **Destrava:** detectar o buraco pelo relógio de parede, como o descanso já faz |
| D4 | projeção pelo ritmo de hoje | **B !** | procedência melhor que C; **mas** o cardio amarrado ao dia da semana contradiz F81 — amarrar à letra |
| D5 | régua que rola, com encaixe | **C !** | **o preço mais alto de D**: toque engolido como arrasto na ação mais frequente (48/semana medidas); e `scrollLeft` perdido a cada render do cronômetro vizinho |
| D6 | teclado de peso com decimal fixa | **B** | **ponto a favor**: mata F63 e F275 na entrada |
| D7 | folha única de pôr em dia | **B !** | escrita atômica; **único ponto das duas onde fechar o app perde trabalho** (família de F294). Destrava: rascunho, como `S.draft` |
| D8 | linhas do dia não são alvo | **B !** | grátis em dado; força 36 → 44 pt (ver M-a) |
| D9 | pergunta de nome ao incorporar revisão | **B–C** | capacidade nova, exclusiva de D; barato como sugestão + confirmação, caro se virar heurística (F259 recusa) |
| D10 | bi-set | — | **grátis**: já existe e está testado |
| D11 | só os 14 dias no pôr em dia | **B** | `janelaDoHistorico` pronto; evita adesão inflada (F292) |
| D12 | paisagem, voltar, modo privado, endereço novo | **B** | `DB.mode` já sabe o que precisa ser dito |

### As três exigências

| # | exigência | faixa | defeito que ela cria, e onde |
|---|---|---|---|
| E1 | decisão ao encerrar + atalho no dia | **B** · a mais barata | **!** "ao encerrar" só acontece nas sessões que ele encerra: 7 de 12 em P1-B (58%) e 10 de 27 em P1-A (37%) — U3, P1. Sem o gatilho da abertura seguinte, E1 não existe na maioria dos casos de P1-A — e descartar a mudança sem ele decidir é F280. **Destrava:** manter os três gatilhos; o código já tem dois, com nove casos de teste |
| E2 | peso, medidas e fotos com lugar próprio | **B** no lugar · **M** no conteúdo | **!** `S.body` é fechado em duas chaves (`tipos.ts:481`, `sincronia.ts:88`, `:476`, `:35`): quatro pontos + os seis portões. A **bioimpedância está bloqueada** — o dono não disse quais números (P6/D2). **!** o lugar próprio não pode tirar a entrada rápida de dentro da sessão: 7 de 11 pesagens entraram entre 6h28 e 7h52 (P1) |
| E3 | o que passou sem registro aparece marcado | **B** em 4 de 6 casos | **!** **a aula não tem vencimento no modelo**: a sequência diz qual, nunca quando (F81, `dia.ts`), a cadência não guarda letra, e o dono pede "nada muito fixo" (P4). As duas direções a põem num dia. **Destrava:** marcar por posição na sequência, sem data (**B**), ou dar dia da semana à aula (**M**, e contraria P4). **!** o cardio previsto não existe como dado (ver chão comum). **!** a água não distingue zero de não contado — **B** como leitura, **M** como fato |

---

## 9 · O que eu não medi

Para não deixar número sem procedência, que é a regra deste repositório:

- **Não medido:** quantas horas-pessoa custam os 513 casos de fluxo. Eu medi a
  contagem e o acoplamento (33 arquivos; 33/33 pela entrada de navegação, 32/33
  por seletor ou `id`, 31/33 por função interna, 24/33 pelos campos de texto por
  série). Esforço não.
- **Não medido:** a latência real de `JSON.stringify` + `localStorage.setItem`
  do estado cheio no iPhone 11 Pro Max. Só o envelope (F53, F255, F257) e a
  forma do código (`src/infra/db.ts`).
- **Não medido:** a taxa de toque engolido como arrasto na régua de D. O
  mecanismo é certo; a frequência, não. Precisaria de aparelho e de dedo —
  idealmente suado.
- **Não medido:** o tamanho do estado real hoje. O que existe é F260 (14 sessões
  e 43 exercícios com histórico em 24/08/2026) e os tetos.
- **Não medido:** se `visibilitychange` basta no aparelho do dono. Depende da
  versão do iOS, que o repositório não registra (01-fatos, ausências).
- **Fora do meu alcance:** se o dono aceita que a decisão de programa volte para
  a academia (E1 contra as recusas das duas direções). É dele.
- **Fora do meu alcance:** quais números da bioimpedância (P6/D2) e se ele lê a
  tela a 3 m (P7). As duas travam itens que eu precificaria melhor com a
  resposta.
- **Fora do meu alcance:** o que a hora da marca do dia fechado significa para o
  uso (§4-D2). Eu digo que o dado atual carimba o fechamento, não a refeição;
  o que isso faz com a leitura de U10 é do pesquisador.
