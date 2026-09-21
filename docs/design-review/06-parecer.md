# 06 · Parecer — o que a revisão muda, e o que ela devolve

Agente 6, relator. Li os cinco relatórios, os três documentos do perímetro, o
handoff `App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md`
(daqui em diante **handoff**) e o modelo `docs/pegada/00-parecer-cruzado.md`.
Conferi no código e no `git log` cada fato em que uma mudança se apoia. Onde
repito número de outro agente sem conferir, está dito.

Saíram três candidatos: [`DESIGN-candidato.md`](DESIGN-candidato.md),
[`UX-CONTRACT-candidato.md`](UX-CONTRACT-candidato.md) e
[`MARCA-candidato.md`](MARCA-candidato.md). Cada mudança neles traz um
comentário `A-nn` que aponta o achado deste parecer. Nenhum original foi
tocado.

---

## 1 · O diff, em prosa

**A identidade não muda.** Ninguém provou que ela envelheceu. O agente mandado
atacar voltou com zero casos de identidade, depois de testar o "nunca comemora"
na tela onde ele é mais fraco. O único achado de identidade da revisão vai no
sentido contrário: estender o "nunca comemora" ao movimento (A-03).

**`DESIGN.md` — onze achados, todos de regra.**
- **Sai:** "existem dois" (a contagem de movimento); "sempre `gap`, nunca margem
  entre irmãos"; "reusada por refeição e por exercício"; `1.4` em body-xs;
  procedência e aba inativa no nível 5; os 62px e o "dois" da bancada; "o teste
  cobra", como está escrito.
- **Entra:** para que serve movimento, a lista do que ele não pode ser (de volta
  do handoff) e os quatro que já rodam, escritos; os critérios de D-04, D-09 e
  D-10 que o resumo cortou; o limiar de contraste medido em `2e3ef75`; quatro
  papéis tipográficos que existem no código; a citação do handoff; "o único
  modal **que o app desenha**".
- **Fica:** tema, raio zero, fio e não cartão, o acento, pisos, escala, 46px,
  anatomias, bancada — e "quase nenhum movimento" como postura.

**Contrato de UX — oito achados, todos de regra.**
- **Sai:** "ação fixa não coexiste com a tab bar".
- **Muda:** ação primária por último vale para folha; "atualizar dado não mexe"
  ganha as exceções que o autor auditou; o inerte da folha ganha a exceção já
  decidida; a pilha do rodapé ganha a faixa; reversível prefere desfazer, e o
  que executa sem confirmar tem volta; os quatro estados valem para tela com
  E/S; o vazio segue a MARCA; `prefers-reduced-motion` desliga todo movimento.
- **Fica:** camadas, Voltar, cabeçalho, tab bar, folhas, altura, treino ativo,
  acessibilidade, viewport. Das oito regras sem origem, quatro ficam (§4).

**`MARCA.md` — três linhas, nenhuma de identidade.** O estado vazio deixa de ser
contado em frases; sai a promessa de um teste que não existe; "o prefixo de
toda classe" ganha a exceção que o código decidiu antes da MARCA nascer. Ficam
a acepção, o nome fora da tela, a voz, "nunca comemore", o símbolo, os
não-fazer e os três votos vencidos.

**O inegociável nº 6 fica, e muda de forma.** Deixa de ser censo e volta a ser o
que era no handoff: postura mais uma lista do que é proibido por forma, agora com
a função de cada movimento. Nenhum movimento novo entra por esta revisão (§5).

**A revisão achou causas nomeadas para o "app duro", e elas não são falta de
movimento:** `.ins-t2` usada 15 vezes sem existir, o estado vazio num cinza de
3,22:1, a paginação de poses que salta ao topo, prosa a 9px na faixa da sessão.
São defeitos de código (§6.3) e não entram em candidato.

---

## Como pesei

- **O desacordo entre os agentes 3 e 4 foi fabricado:** cada um recebeu um
  lado. Não conto divergência como evidência. Comparo a prova e leio o silêncio.
- **Silêncio do ataque** diz que a regra fica. **Silêncio da defesa** diz que ela
  não se sustenta. Ataque com prova própria mais defesa calada é o mais forte que
  esta revisão produz.
- **A independência tem uma ressalva.** Os agentes 3, 4 e 5 não se leram, mas os
  três leram `01` e `02`. Onde convergem sobre algo que o agente 2 já apontava —
  "sem origem", "cortado na tradução" —, a entrada é comum, e o que pesa é a
  prova que cada um trouxe por conta própria. Por isso **não peso como
  independente** a correlação do agente 4 ("as 8 sem origem estão todas no meu
  silêncio", Parte 6): ele tinha a lista na mão.
- **Um número que conferi e que muda.** O agente 3 diz que o código cita o
  handoff em "nove linhas, em quatro arquivos". O nome `DESIGN_SYSTEM` aparece em
  4 linhas de 4 arquivos (`componentes.css:3`, `primitivos.jsx:3`,
  `timeline.jsx:7`, `estilo.test.ts:91`). Contando as marcas `§3.x`, que só
  existem no handoff, dá 9 linhas — mas cinco delas são um bloco só de
  comentário (`estilo.test.ts:88-94`). O certo é **cinco pontos de citação em
  quatro arquivos, contra dois ao `DESIGN.md`** (`palco.css:10`,
  `main.jsx:3477-3478`). A direção fica; o "nove" infla.

---

## 2 · Onde os advogados concordaram, e o que isso fecha

### 2.1 · [identidade] A identidade não envelheceu

- **Agente 3**, mandado atacar e com a identidade explicitamente na mesa: 32
  casos, todos de regra, zero de identidade. Atacou `M-08` pela retrospectiva, a
  tela que conta recordes, e perdeu pelo texto dela (`retrospectiva.jsx:3-9`,
  `33-35`: "Não quer dizer que esteja errado — quer dizer que você olhou").
- **Agente 4:** as regras de identidade são as mais cumpridas; as violações da
  MARCA são de voz, não de postura (Parte 6).
- **Agente 5**, cego aos dois: o único achado de identidade dele é de alcance —
  a proibição de comemorar governa string, e movimento pode comemorar sem uma
  palavra (`05-movimento.md` §2).

**Fecha:** a identidade sai ilesa. É o achado de maior peso da revisão, e ele é
negativo. O que se pode fazer com ela é estender o alcance (A-03, §3.5), não
mudar o conteúdo.

### 2.2 · [regra] O handoff é a fonte, e o `DESIGN.md` nunca o cita — A-01

O agente 2 achou; os agentes 3, 4 e 5 leram e usaram, cada um para o seu lado —
o 3 para mostrar o que o resumo perdeu, o 4 para rebater "foi escrito para um
app de dieta" com a terceira linha do próprio handoff ("authored for reuse in
the training app") e com a §5 dele, que propõe as cinco abas de hoje, o 5
para achar a lei 2 (`:140`). O coordenador conferiu. As marcas `§3.5`, `§3.14` e
`§3.10` de `DESIGN.md:104-106` apontam para lá, e o `DESIGN.md` não tem `§3`.

**Fecha:** o `DESIGN.md` passa a dizer de onde veio. Não passa a obedecer ao
handoff: onde o Lastro decidiu diferente — 46 e não 44, a miniatura no lugar do
indicador de home, 24 e não 24–26 entre seções —, a decisão do Lastro fica.

### 2.3 · [regra] O movimento: a contagem é falsa, e a metade que funcionava foi cortada — A-02

A convergência mais forte do documento, porque é tripla e porque a defesa cedeu.

- **Agente 3** (caso 2): a barra do cronômetro anima desde `7cd6418`
  (2026-08-07), quatro dias antes do handoff entrar (`41bb122`) e cinco antes do
  `DESIGN.md` (`2e3ef75`). Conferi: `transition: width .25s linear` em
  `index.html:601` daquele commit. Hoje `estilo.test.ts:376-386` **exige** a
  transição. O documento proíbe o que o teste obriga.
- **Agente 4**, mandado defender: "Não tenho caso para a **contagem**" (D-11).
  Defende a disciplina: zero entrada animada, zero fade, zero esqueleto, zero
  folha com mola — "a metade da regra que o resumo perdeu é a que a prática
  obedeceu".
- **Agente 5:** "o que sai: a contagem". E o handoff conta movimento duas vezes:
  a regra 6 (`handoff:18`) e a lei 2 (`handoff:140`), que nomeia "a ticking
  countdown" como movimento ambiente. A barra nunca contrariou a fonte.

Conferi o inventário: nas quatro folhas do app só há `ins-pulse`
(`base.css:303, 308`), o indicador (`componentes.css:333`) e `#tfill`
(`componentes.css:1404`); mais a rolagem `smooth` de `main.jsx:5595`. Quatro.

**Fecha:** a contagem sai, a lista do handoff volta, os quatro são escritos. E
U-58, que repete a contagem no contrato ("desliga os dois movimentos do
sistema", `contrato:194`), passa a dizer "todo movimento" — o que já é verdade
hoje, porque o curinga de `reduce` pegou os dois que ninguém declarou (A-19).

### 2.4 · [regra] O resumo perdeu o critério — A-04, A-06

Agente 3 (caso 1) e agente 4 (`04-permanencia.md` §2.1 e §2.2), com o texto
dos dois lados, que conferi no handoff:

| id | o handoff | o que se perdeu |
|---|---|---|
| D-04 | "'250 g arroz' is mono only when it is data in a value column" (`:14`) | o desempate |
| D-09 | "one acid element **competing** per region **of the viewport**" (`:16`) | as duas qualificações; `tokens.css:17` ainda diz "da tela" |
| D-10 | "always introduces a section or names a value" (`:17`) | a definição |
| D-19 | `13 / 400 / 1.5` (`:67`) | nada: `DESIGN.md:91` diz `1.4`, e o código (`base.css:194`) e o handoff dizem `1.5` |

O agente 4 acrescenta o efeito de D-09: com "competindo", o cartão-foco — três
elementos ácidos em papéis diferentes — passa, e a regra deixa de contradizer a
anatomia de D-33.

Achado meu em D-19: a tabela não tem **quatro** papéis que o código define, não
dois como o agente 2 contou — `metric-s` (`base.css:185`), `body` (`:192`),
`label-sm` (`:201-205`) e `data` (`:206`). Os quatro estão no handoff.

**Fecha:** três regras voltam a ser mensuráveis, e o documento para de
discordar do código em body-xs.

### 2.5 · [regra] O nível 5, e o limiar que o checklist procura — A-05

- **Agente 3** (casos 1 e 18): a decisão medida foi "o nível 5 fica para o
  **redundante**"; o documento escreveu "para **rótulo**", mais largo. E U-66
  manda conferir contraste num documento que não tem número nenhum.
- **Agente 4** (D-16, "a mais forte"; U-66): regra nascida de medição, 24
  violações; "tenho caso para o limiar; não tenho caso para o item como escrito".

Conferi a medição: `2e3ef75`, mensagem, "`--ins-text-5` dá 3,22:1 e reprova em
AA… Procedência e aba inativa… subiram para `--ins-text-4` (5,01:1)".

Achado meu: **`DESIGN.md:68` lista procedência e aba inativa no nível 5** — o
texto do handoff (`:45`) —, e o `DESIGN.md` nasceu no mesmo commit que as tirou
de lá. O código seguiu a medição (`base.css:209-211`, `componentes.css:325-326`);
o documento não.

**Fecha:** o critério de contraste entra na seção de texto, e U-66 passa a ter o
que conferir sem mudar uma palavra.

### 2.6 · [regra] Ataque com prova, defesa calada

| achado | agente 3 | agente 4 | o que conferi | vai para |
|---|---|---|---|---|
| **D-27** gap, nunca margem | caso 3: 248 violações, zero razão, teste não cobra | "não tenho caso… a regra com menos argumento a favor" | a primitiva de seção faz os 24px de D-26 — cumprida, com razão — por `margin-top` entre irmãos (`componentes.css:32-34`). A regra sem razão é desmentida pela regra com razão | **sai**, A-07 |
| **D-28** "o teste cobra" | caso 5: três escalas, o teste decide | "não tenho caso para a frase" | `estilo.test.ts:89` aceita 1, 2 e 46; `:96` aplica as exceções em qualquer lugar; `:98` lê três arquivos. O comentário do próprio teste (`:83`) lista a escala do documento, e o array logo abaixo a alarga | A-08 |
| **D-34** timeline reusada | caso 7 | "descreve algo que nunca foi verdade neste app" | um importador, `hoje.jsx:105`; o motivo da anatomia própria está em `508cbc6` | A-09 |
| **D-42, D-44** bancada | "documento desatualizado" | "o documento está simplesmente errado"; sem caso para "dois" | `palco.js:76-96` (corpo 73/66/46, vidro 62/55/2); três `animation` em `palco.css:470-473` | A-11 |
| **U-10** ação primária por último | caso 11: generalizada da folha | "não tenho caso" | `handoff:112` fala da folha. E a ordem de `historico.jsx` (salvar, cancelar, apagar) é a lei 4 do handoff: destrutivo "below the constructive options" (`:142`) | A-12 |
| **U-34** não coexiste com a tab bar | caso 13: `893e2c3`, zero commits com "ação fixa" | "a primeira metade eu defendo; a cláusula de coexistência, não" | `git log --grep="ação fixa"` vazio; a mensagem de `893e2c3` não cita o §7 | **sai a cláusula**, A-15 |
| **U-35** a pilha | "é o §7 que funciona" | forte: a faixa cumpriu doze dias depois | a faixa mede e publica `--ins-faixa-h` (`faixasessao.jsx:28`); o toast e a página a somam (`componentes.css:1337`, `base.css:176`). A lista de `contrato:147` não a tem | A-15 |
| **U-42** oferece desfazer | caso 14 | parcial: sem caso para "oferece"; com caso para as três exclusões sem volta | a auditoria escreveu "prefere desfazer a confirmar" e "nada a corrigir" (`02-research-principles.md:67-70`) | A-16 |
| **U-46** quatro estados em toda tela | caso 15: o dado é local | "não tenho caso" | os 11 erros que o app tem (a lista de U-48) são todos de E/S: nuvem (`main.jsx:1027`), arquivo e área de transferência (`3342-3388`), imagem e foto (`3816, 6519, 7102`), câmera (`7085`). `fetch` só em `sw.js` e `nuvem.ts` | A-17 |
| **U-47** vazio com ação | caso 16 | "não tenho caso" | ver §3.3 | A-18 |
| **M-25** o teste tranca o ícone | caso 20 | parcial: sem caso para a frase | o teste não cita `#D9FF16`, `#0E1112` nem `icone.svg` (agente 1). `MARCA.md:6-7`: "Onde não tem, está escrito que não tem" | A-20 |
| **M-28** "toda classe" | caso 21 | parcial: sem caso para "toda classe" | `componentes.css:1026-1036` e `treino.css:1-16` decidiram o contrário antes da MARCA, com motivo (114 asserções). O voto vencido (`MARCA.md:141-146`) repete "toda classe"; ficou intocado, porque é o registro do argumento que perdeu | A-21 |

Todas de **regra**. Nenhuma toca identidade: em M-28 os dois separam a fronteira
`ins-`/`lastro-`, que defendem, da palavra "toda", que não.

### 2.7 · [regra] A exceção que foi decidida e não foi escrita — A-14

U-26. O agente 1 mediu violação: o cronômetro e o toast ficam fora do inerte. O
agente 2 achou a decisão (`06-final-review.md:146`, conferida): "Tornar o
'parar' do cronômetro inalcançável durante uma folha seria pior que o vazamento
de foco que resta." O agente 3 não teve caso por isso; o agente 4 defendeu por
isso. **Fecha:** o contrato escreve a exceção que já decidiu.

### 2.8 · Onde a defesa defendeu e o ataque não achou caso — fica

- **D-22, 16px em campo.** O "onde eu queria ter caso" do agente 3: o comentário
  prevê o próprio modo de falha (`base.css:126-129`). Fica. Os oito campos
  abaixo são campos reais — entre eles e-mail, senha e data a 13px e um
  `textarea` a 11px — e estão em §6.3.
- **O teto de três folhas** (D-37, U-25), `folha.jsx:6-8`. Fica.
- **U-59, U-61**, viewport e sticky. Os dois agentes notaram que o
  `~/.claude/CLAUDE.md` do dono registra as mesmas lições por fora. Fica.
- **M-08, M-12, M-18.** Fica.
- **O 46 de D-29**, argumentado (`tokens.css:87-88`). Fica; o stepper compacto
  está em §3.4.
- **U-48 e U-65:** o ataque não achou caso. Ficam.
- **O 14 da sparkline** (D-38): sem razão escrita, e o ataque calou — "regra sem
  origem não é automaticamente regra velha". Fica.

### 2.9 · Convergem no diagnóstico, não no remédio — decisão humana

- **D-05**, "genuinamente destacado": ataque (caso 9) e defesa calada. Ninguém
  propõe critério que pare de pé. H-06.
- **D-30**, o 28: ataque (caso 4) e defesa calada no número, mas com caso "para
  existir **um** alvo denso restrito". H-04.
- **U-67**, PWA instalado: os dois concordam que nunca foi feito e que é o
  ambiente real. Não é a regra que está errada. H-07.

---

## 3 · Onde divergiram

### 3.1 · [regra] "O único modal" — A-10

- **Agente 3** (caso 10): U-43 aprova `confirm()` (cumprida, 19 de 19); em um ano
  ninguém tratou os 22 diálogos nativos como defeito; a leitura que concilia é "o
  único modal **desenhado pelo app**".
- **Agente 4** (`04-permanencia.md` §1.2): os 22 são "a coisa menos fluida
  que existe nesta interface", e o handoff diz "the only modal pattern"
  (`:112`).

**Leitura: a prova do agente 3 é mais forte, e há um fato que nenhum dos dois
citou.** `c0974b2` (2026-09-01), três semanas depois da regra, acrescentou um
`confirm()` nativo para apagar foto do corpo, "como as outras 17 ações
destrutivas" — conferi no diff. É diálogo do sistema escolhido depois de a regra
existir. E a MARCA regula o texto desses diálogos (M-13, M-16), o que só faz
sentido se eles são superfície aceita. O agente 4 descreve o que o diálogo
nativo não tem; não mostra que ele atrapalha o uso. Se um dia ele vira folha é
outra pergunta: H-08.

### 3.2 · [regra] "Atualizar dado na mesma tela: não mexe" — A-13

- **Agente 3** (caso 12): a célula da tabela é mais larga que o parágrafo abaixo
  dela, e o autor da regra auditou os outros sítios em `d180718`: "são troca de
  aba, de dia, de destino ou fim de fluxo, e nessas o topo está certo".
- **Agente 4** (`04-permanencia.md` §1.1; U-15 forte): onze saltos ao topo, e
  a fluidez que o backlog pede se consegue tirando o salto, não animando.

Conferi por `git blame`: dez das onze linhas existiam antes de `d180718`
(`5781161`, `508cbc6`, `a4df1a6`); `main.jsx:6785` ("já parei") veio com
`893e2c3`, doze dias depois, e nunca foi auditada.

**Leitura: no texto, ganha o agente 3; no defeito, o agente 4.** A célula ganha
as exceções que o autor auditou. Mas `andaPose` (`main.jsx:6467`, botões no meio
da página, `protocolo.jsx:141-146`) é "paginar", que o parágrafo nomeia, e a
auditoria do autor a deixou passar — é defeito de código (C-03). A tese do
agente 4 fica de pé sozinha: "animar um salto de rolagem não o transforma em
transição". O projeto já consertou o mesmo caso tirando o salto
(`main.jsx:2945-2957`, `mudaMes`).

### 3.3 · [regra] Estado vazio: "uma frase" — A-18

- **Agente 3** (caso 16): contar frases mede a coisa errada; o que M-17 protege é
  a falta de enfeite, e isso o app cumpre em 22 de 22.
- **Agente 4** (M-17, forte): veio literal do handoff, é 29 dias mais velha que
  U-47, "onde os dois documentos se batem, este tem origem e o outro não".

Conferi os sete estados vazios de mais de uma frase (lista do agente 1). **Nos
sete, a segunda frase é informação**: quando o vazio acaba
(`historico.jsx:82-85`, `retrospectiva.jsx:41-44`, `dados.jsx:399-402`), o que
fazer (`treino.jsx:195-198`), por que não há número (`dados.jsx:406-410`), o que
o estado é (`ajustefoto.jsx:144`, `protocolo.jsx:172`). Nenhuma consola. E dois
deles são **mais velhos que a MARCA** (`git log -S`: `5781161`, 2026-08-10;
`681f09f`, 2026-08-14; a MARCA é `4c561ee`, 2026-08-26).

**Leitura: agente 3.** A defesa do agente 4 é precedência e idade, não uso. E a
própria MARCA diz que a voz dela é descrição (`MARCA.md:52`) e que dúvida de tom
se resolve no `git log` (`:70`) — as strings já tinham duas frases quando ela foi
escrita. Uma regra só, nos dois documentos. "Sem ilustração, sem mascote" fica
intacto.

### 3.4 · [regra] O stepper compacto — sem mudança, H-05

- **Agente 3** (caso 4): o compacto tem 38px com razão escrita — os três
  controles cabem numa linha de 390px, ou a lista dobra de altura
  (`componentes.css:924-926`).
- **Agente 4** (D-29): "duas violações, ambas em controle que o próprio CSS
  descreve como apertado de pé".

Conferi: só o cronômetro diz isso (`componentes.css:1409-1411`). O comentário do
compacto é sobre largura. Ele serve à edição do dia e ao programa
(`edicao.jsx:1-6`), e a primeira pode acontecer na academia.

**Leitura:** o ± do cronômetro a 40px viola a regra pelo motivo dela mesma (C-05).
O compacto é troca real entre duas razões escritas, e a prova não decide.

### 3.5 · [identidade, com regra por baixo] O ácido de "melhorou" — sem mudança, H-02

Fato que os dois aceitam: em 7 sítios (agente 1) — 9, contando duas fronteiras
(agente 3) — o ácido pinta comparação favorável, que não é nenhum dos quatro
sentidos de `DESIGN.md:30-31`.

- **Agente 3** (caso 6), como **regra**: escrever um quinto sentido; "nunca
  comemora" continua de pé porque nenhum sítio diz parabéns.
- **Agente 4** (D-08, M-08), como **identidade**: é "o app dizendo 'você foi bem'
  por cor, a forma mais silenciosa de comemorar", e é a regra de cor que torna a
  deriva visível.

**Leitura:** nenhum dos dois prova a sua leitura da cor. Escrever um quinto
sentido decidiria uma pergunta de identidade de carona numa correção de tabela —
é o modo de falha que o briefing nomeia. D-08 fica como está e vai para o dono.

O que a divergência fecha, e com independência real: os agentes 4 (cor) e 5
(movimento), sem se lerem, acharam o mesmo buraco — "nunca comemora" está
escrito só para palavra. Para cor, H-02. Para movimento, que esta revisão
reescreve, **A-03 [identidade, só de alcance]**: o inegociável 6 candidato diz
que movimento "não decora e não comemora". Não muda a identidade; estende uma
proibição que já existe (`MARCA.md:58`, `DESIGN.md:12`, `handoff:201`) ao canal
que a revisão abre. Sem isto, a reescrita abriria por quadro e curva o que a
MARCA fechou para texto (`05-movimento.md` §2).

### 3.6 · Outras, sem mudança

- **D-07, preenchimento para agrupar** [regra]: o ataque diz que nunca teve
  critério; a defesa mostra que ela decidiu dois casos por escrito
  (`treino.css:151`, `508cbc6`), e o ataque concede que ela "funciona como
  argumento". Fica.
- **D-14, hairline em controle** [regra]: o ataque diz que o vocabulário é menor
  que o app; a defesa diz que controle em hairline perde afordância. Ninguém
  mediu afordância. Fica.
- **D-24, o 2px** [regra]: 16 usos que o documento proíbe e o teste aceita.
  Declarar ou banir é decisão. H-03.

---

## 4 · Regra sem origem registrada

As oito do agente 2. Sem origem não é sentença: é pergunta.

| id | regra | agente 3 | agente 4 | conclusão |
|---|---|---|---|---|
| U-34 | ação fixa não coexiste com a tab bar | caso | não tenho caso | **sai** (A-15) |
| U-46 | toda tela declara os quatro estados | caso | não tenho caso | **muda de escopo**: tela com E/S (A-17) |
| U-47 | vazio: área, porquê e ação | caso | não tenho caso | **funde** com M-17 (A-18) |
| U-48 | erro perto, tenta de novo, não apaga o digitado | não tenho caso | sem caso de origem | **fica**: o ataque não achou caso, e os erros do app são todos de E/S, que A-17 já alcança |
| U-49 | sem layout shift ao sair de carregando | caso, junto com U-46 | não tenho caso | **fica**, no escopo novo de U-46: o defeito dela era o escopo |
| U-56 | foco nunca escondido atrás de sticky | caso: "vira item ou sai" | não tenho caso | **fica, e tem origem.** É o critério 2.4.11 da WCAG 2.2, nível AA, que U-50 já adota. O repositório não o cita, e a correspondência é minha |
| U-66 | contraste conforme DESIGN.md | caso | não tenho caso | **fica**; A-05 põe no `DESIGN.md` o que ela manda conferir |
| U-67 | PWA instalado conferido | caso | não tenho caso | **fica**, e vai para o dono (H-07) |

**Uma sai, três mudam, quatro ficam.** Das que o agente 2 marcou só com
"procedência", aquelas em que a defesa calou: D-27 sai (A-07), D-34 e U-10 mudam
(A-09, A-12), D-05 e D-30 vão para decisão (H-06, H-04).

O padrão que os agentes 2 e 4 apontam — regra escrita com o problema do lado é
cumprida; número solto é violado — aparece no material: U-35 foi cumprida por um
componente de doze dias, D-27 tem 248 violações. Registro com a ressalva de §
"Como pesei": o agente 4 cruzou isso tendo a lista do agente 2.

---

## 5 · O caso do movimento, e a resposta ao inegociável nº 6

### A resposta

**Fica, e muda de forma.**

- **Fica** "quase nenhum movimento" — a postura. Ninguém a atacou: o agente 3
  diz que "não está em questão em lugar nenhum"; o agente 5, que "nada no que
  medi diz que este app quer mais movimento".
- **Sai** o censo, "existem dois". Era falso no dia em que foi escrito (§2.3).
- **Volta** a lista do handoff (`:18`): nada de animação de entrada, de fade, de
  esqueleto que cintila, de folha com mola.
- **Entra** a função: movimento só interpola grandeza contínua, diz que a tela
  está viva, ou mostra para onde se andou. Os quatro que rodam são escritos com
  parâmetro e motivo. E movimento não comemora (A-03).
- **Não entra** movimento novo.

### O item do backlog

"Motion design em praticamente todo o app" não achou sustentação, por três
caminhos que não se leram:

- **O agente 5**, procurando o que movimento faria tela por tela, achou uma
  função vazia — dizer de onde uma camada veio — e uma superfície onde ela dói:
  a folha. HOJE, TREINO, COMIDA, DADOS e GUIA "trocam conteúdo de um estado
  completo para outro", e a troca de aba já tem o seu sinal de direção. Rejeitou
  deslizar conteúdo, animar o cartão, animar altura, esqueleto, fim de descanso
  e conquista, cada um com motivo.
- **O agente 4**, procurando outra causa para o "duro", achou causas nomeadas
  (§6.3), e sustenta que três delas pioram com movimento por cima.
- **O agente 3**, mandado atacar, pediu de volta a lista de proibições — um
  remédio que deixa a regra **mais** estrita na forma.

### Os candidatos do agente 5

| | o quê | decisão |
|---|---|---|
| C1 | barra do cronômetro | **entra escrita**: já roda. 250 ms `linear`, porque é o intervalo de `pintaTimer` (`main.jsx:4223`) |
| C2 | rolagem até a sessão | **entra escrita**, com o critério: suave quando o alvo estava fora de vista; `instant` quando é o que se acabou de tocar |
| C3 | folha que sobe | **não entra.** H-01 |
| C4 | toast | **cortado**, como o próprio agente pediu: premissa não medida, é animação de entrada, exige mexer no casco |

C3 é o único lugar onde a revisão achou função para movimento novo, e é do dono.
Ela é animação de entrada — a categoria que o agente 5 usou para marcar C4 como
fraco e que a lista restaurada proíbe pelo nome —, e o próprio agente diz que o
véu "pode derrubar o candidato". Se o dono a aceitar, a regra ganha uma quarta
função e uma exceção escrita com ela.

### Onde corrigi o agente 5

1. **"Só `transform` e `opacity`"** tornaria violação um dos dois movimentos que
   a regra sempre teve: o indicador anima `left` (`componentes.css:333`). O
   candidato escreve a regra de custo que a prova sustenta — grandeza repintada
   sem parar anima `transform` (`3ef9bb9`, `estilo.test.ts:376-386`).
2. **A cláusula de função dele** guardou "dizer de onde uma camada veio" (só C3)
   e perdeu "mostrar para onde se andou" (o indicador, que está na tabela dele
   mesmo). O candidato descreve os quatro que rodam.
3. **C3 contra "nada de animação de entrada"** — o teste que ele aplicou a C4 e
   não a C3.

### Antes de alguém mexer em movimento

- **`prefers-reduced-motion` é assimétrico.** Mata `transition` por curinga
  (`base.css:313`, `componentes.css:1415`) e `animation` só em `.ins-live-dot`
  (`base.css:312`). Um `@keyframes` novo sobrevive calado. Conferido; está no
  candidato.
- **O teste prometido em `folha.jsx:126-129` não existe.** Nada impede
  `transform` num ancestral da folha, e transição de tela, se existir, só pode
  morar no `main` (`05-movimento.md` §5.4). C-11.
- **Nenhum teste cobre movimento**, a não ser o que exige o terceiro
  (`estilo.test.ts:376-386`). A rede é o curinga.
- As três armadilhas do `CLAUDE.md` já têm correção no repositório:
  `backdrop-filter` fora por decisão (`componentes.css:317, 722`),
  `overflow-x: clip` no `body` (`base.css:85`), e o `translateX(+N)` fica de fora
  porque a transição de aba foi rejeitada.

---

## 6 · O que continua aberto

### 6.1 · Decisão humana

| | pergunta | magnitude | o que a prova diz |
|---|---|---|---|
| **H-01** | A folha sobe (C3)? | regra | é o único lugar com função achada; é animação de entrada; o véu surgiria de uma vez ou exigiria um fade. Proposta: 220 ms, `translateY`, `--ins-ease`, morre em `reduce` |
| **H-02** | Ácido em "melhorou" é o "feito" ou é comemorar por cor? | **identidade** | nenhum lado provou a sua leitura (§3.5). Escolher "sentido novo" escreve um quinto sentido em D-08, e os 7 sítios passam a cumprir; escolher "comemoração" faz deles violação de identidade, a tirar do código |
| **H-03** | 2px entra na escala ou sai do código? | regra | 16 usos, o teste aceita, o documento proíbe |
| **H-04** | Qual é o alvo denso, e para quê? | regra | o 28 não tem razão escrita (`02-origem.md`, D-30); o chip tem a sua, 41px por `::after` (`base.css:279-281`) |
| **H-05** | Stepper compacto: 38 ou 46? | regra | duas razões escritas em choque (§3.4) |
| **H-06** | "Genuinamente destacado" vira lista fechada, critério, ou sai? | regra | sem critério em documento nenhum, handoff incluso |
| **H-07** | Quem confere o PWA instalado, e quando? | regra | nunca foi feito; exige o aparelho do dono |
| **H-08** | `confirm()` e `prompt()` ficam do sistema? | regra | A-10 escreve o que foi decidido; se viram folha é outra decisão, e a tese do agente 4 de que eles pesam não está medida |
| **H-09** | A barra do cronômetro sob `reduce` | regra | sem a transição ela vira escada de 4 degraus por segundo; talvez amostrar menos, e não matar a interpolação (agente 5, C1). Não medido |
| **H-10** | Botão em mono caixa alta é um terceiro uso declarado? | regra | A-04 devolve o critério do rótulo; todos os botões do sistema são mono em caixa alta (agente 1, D-10), e o agente 4 chama isso de "a única coisa a decidir" |

### 6.2 · Medir antes de decidir

Do agente 4 (Parte 8), e eu assino embaixo: a altura das cinco abas desde
09-09 (vieram dezessete commits depois); o rodapé com sessão aberta,
renderizado (os ≥132px dele são aritmética de valores declarados); as 15
`.ins-t2` renderizadas; o contraste real dos 24 sítios de D-16.

### 6.3 · Defeitos de código que a revisão achou

Não são regra e não entram em candidato. São, porém, a resposta mais concreta
ao "app parece duro".

| | defeito | onde | quem achou |
|---|---|---|---|
| **C-01** | `.ins-t2` usada 15 vezes e definida em lugar nenhum: a prosa de Guia, Dados e do veredito sai no branco do título. `base.css:214-225` diz "estas seis" e lista seis — a sétima nunca existiu | `base.css:223-225`; `primitivos.jsx:252`, `guia.jsx:62` | agente 4; conferido |
| **C-02** | `Vazio` no nível 5, 3,22:1, instanciado 22 vezes | `primitivos.jsx:71` | agentes 1, 3, 4 |
| **C-03** | `andaPose` salta ao topo a cada pose | `main.jsx:6467` | agentes 1, 3, 4 |
| **C-04** | a pergunta da faixa é prosa em mono a **9px** — "Treino A sem série nova há 1h32." —, e o nome no atalho, 12px | `componentes.css:1376, 1378`; `main.jsx:6757` | agente 4, corrigindo o D-21 do agente 1; conferido |
| **C-05** | ± do cronômetro a 40px, "apertados no meio da série, de pé" | `componentes.css:1409-1413` | agentes 1, 4 |
| **C-06** | `.cp-ajustar` com ~11px de altura | `protocolo.css:185-191` | agente 1 |
| **C-07** | oito campos abaixo de 16px, entre eles e-mail, senha e data | lista em `01-conformidade.md`, D-22 | agente 1; conferido pelo coordenador |
| **C-08** | Esc fecha duas com três folhas; a quarta folha é alcançável | `folha.jsx:118-123`; `main.jsx:5202` | agente 1, medido em jsdom |
| **C-09** | `promo` não guarda nem devolve a posição de leitura | `main.jsx:892, 2563, 2494-2500` | agente 1 |
| **C-10** | três exclusões sem confirmar e sem volta; seguem violando U-42 reescrita | `main.jsx:3313, 2893, 5293` | agentes 1, 4 |
| **C-11** | o teste que `folha.jsx:129` promete não existe | `tests/` | agente 5; conferido pelo coordenador e por mim |
| **C-12** | protocolo e comparação carregam foto e não têm estado de erro | `protocolo.jsx`, `comparar.jsx` | agente 3 |
| **C-13** | ao adotar os candidatos, estes comentários ficam falsos: `tokens.css:7-9` ("indicador de home"), `:18-20` e `:91` ("existem dois"), `base.css:210-211` (aba inativa no nível 5), `base.css:301`, `componentes.css:1417`, `palco.css:27`, `main.jsx:3477-3478` | — | `grep` meu |

O resto das violações do agente 1 continua valendo como está em `01`.

---

## 7 · Onde discordei dos agentes

- **Agente 2:** U-56 não é sem origem — é a WCAG 2.2, critério 2.4.11, AA,
  adotada em U-50. E a tabela tipográfica perdeu quatro papéis, não dois.
- **Agente 3:** "nove linhas em quatro arquivos" são cinco pontos de citação
  (ver "Como pesei"). Em U-15, "10 das 11 foram aprovadas" é generoso: entre as
  dez está `andaPose`, que o critério do próprio autor condena. E não adotei o
  estreitamento de D-27 ("quase já é cumprida"): ninguém contou.
- **Agente 4:** em D-29, o comentário "apertado de pé" é só do cronômetro. Em
  U-15, dez dos onze saltos passaram pela auditoria do autor da regra
  (`d180718`); o que dói é um, `andaPose`. Os 22 diálogos como "aspereza" são hipótese, e `c0974b2` mostra que o nativo foi
  escolha.
- **Agente 5:** "só `transform` e `opacity`" pega o indicador de aba; a cláusula
  de função deixou de fora a do indicador; C3 é animação de entrada e não foi
  medida contra a lista que ele mesmo recuperou.
- **Agente 1:** mediu certo, e três veredictos apontam para o lado errado —
  D-19 (o documento está errado, não o código), U-26 (exceção decidida) e D-21
  (faltou a faixa a 9px).
