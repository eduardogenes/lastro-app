# 02 · Origem — por que cada regra existe

Agente 2. Este documento não julga regra nenhuma: reconstrói de onde ela veio,
que problema consertou, o que se tentou antes, o voto vencido quando há, e se
ela já foi revisada. Os identificadores são os de
[`01-conformidade.md`](01-conformidade.md), sem exceção.

## O achado que muda a leitura de tudo

**O Instrumento não nasceu no Lastro, e o documento que o define não é o
`DESIGN.md`.**

Existe no repositório, versionado, um documento de handoff que o `DESIGN.md`
nunca cita:

> `App de gestão de conteúdo PDF/design_handoff_instrumento/DESIGN_SYSTEM.md`
> — "INSTRUMENTO — Design System. Version 1.0 · **extracted from the Plano
> Nutricional app** · authored for reuse in the training app."

Entrou em `41bb122` (2026-08-11), junto com `tokens.css`, um espécime visual
(`Design System.dc.html`) e o app de nutrição que lhe deu origem. Ele traz os
**seis inegociáveis já numerados na ordem de hoje**, a tabela de superfícies, a
das quatro linhas, os cinco níveis de texto, a escala de espaço, a escala
tipográfica, os pisos, as anatomias `§3.1` a `§3.14` e doze "UX laws".

Três consequências práticas para quem for usar este relatório:

1. **A maioria das regras do `DESIGN.md` é transcrição, não decisão do Lastro.**
   O `DESIGN.md` só foi criado um dia depois, em `2e3ef75` (2026-08-12), e é
   uma tradução resumida do handoff. Julgar essas regras pelo contexto do Lastro
   é julgar fora do lugar onde elas foram tomadas: elas foram escritas para um
   app de dieta.
2. **As referências `§3.5`, `§3.14`, `§3.10` da linha 104-106 do `DESIGN.md`
   apontam para esse documento**, não para nenhuma seção do próprio `DESIGN.md`.
   Quem procurar a fonte das quatro exceções de espaço dentro do `DESIGN.md` não
   acha, porque ela não está lá.
3. **Onde o `DESIGN.md` resumiu, ele perdeu o critério de medição.** As quatro
   regras que o agente 1 marcou como não mensuráveis são, três delas, exatamente
   as frases que o resumo encurtou. Está documentado abaixo, em D-09 e D-10.

## As sete camadas de origem, em ordem

Toda procedência deste relatório cai numa destas.

| # | quando | o quê | commit |
|---|---|---|---|
| 0 | 2026-08-07 | O app anterior: HTML único de 5.279 linhas, paleta azul-marinho + âmbar, Archivo, cartões com raio | `7cd6418` |
| 1 | 2026-08-11 | O handoff do Instrumento, vindo do app de nutrição | `41bb122` |
| 2 | 2026-08-12 | `DESIGN.md` e `PRODUCT.md` nascem, depois de uma auditoria num iPhone | `2e3ef75` |
| 3 | 2026-08-24/26 | A retirada do sistema antigo se completa; o app passa a se chamar Lastro | `6f4dd12`, `3283495`, `028fab0`, `7634981` |
| 4 | 2026-08-26 | `MARCA.md` nasce, com os votos vencidos | `4c561ee` |
| 5 | 2026-09-03/08 | A bancada de mesa; o ícone troca o L pelo símbolo da raiz | `7fc8ddd`, `1003956` |
| 6 | 2026-09-09 | A auditoria de UX e o contrato que saiu dela | `a00aaf1`, mais `6a877ee`, `d180718`, `b1f4fad` |

## Como ler as tabelas

Cada regra recebe uma das três classificações:

| marca | o que quer dizer |
|---|---|
| **problema** | há um problema nomeado e datado que a regra consertou, e a fonte está citada |
| **procedência** | sei de onde ela veio e quando, mas **ninguém escreveu por quê** — a regra foi herdada, não argumentada |
| **sem origem** | não achei registro nenhum: nem commit, nem comentário, nem documento anterior |

"Procedência" não é acusação: é o estado de uma regra que atravessou dois apps
sem nunca ter sido defendida por escrito. Para os agentes 3 e 4, é a diferença
entre atacar uma decisão e atacar um hábito.

## Resumo

| documento | regras | problema nomeado | só procedência | sem origem |
|---|---|---|---|---|
| `DESIGN.md` | 50 | 23 | 27 | 0 |
| `docs/LASTRO_UX_CONTRACT.md` | 68 | 44 | 16 | 8 |
| `MARCA.md` | 43 | 34 | 9 | 0 |
| **total** | **161** | **101** | **52** | **8** |

**As oito sem origem estão todas no contrato de UX**, e sete delas em duas
seções: §7 (ação fixa) e §10 (estados). A lista fechada está no fim deste
documento.

---

# DESIGN.md · D-01 a D-50

| id | classe | origem | quando |
|---|---|---|---|
| D-01 | **problema** | `8156d26`: seis variáveis eram usadas e nunca definidas — `--sec`, `--amber`, `--txt`, `--card`, `--orange`, `--f` — em **31 regras**. "CSS não reclama de `var()` sem dono: a regra cai no valor herdado e a tela fica quase certa. A edição do dia e a decisão do programa vinham renderizando assim, e nenhum teste de DOM pegaria." | 2026-08-10 |
| D-02 | procedência | Parágrafo de abertura do handoff, traduzido quase literal: "An instrument panel, not a wellness app… It reads as precise rather than motivational, and it never celebrates" (handoff:5). A razão do escuro — "abre às 6h15 no subsolo de uma academia" — é adição do Lastro (`DESIGN.md:8`) | 2026-08-11 |
| D-03 | **problema** | Handoff rule 1 dava outra terceira exceção: "status dots, the slider thumb, and **the home indicator**". **Revisada** em `508cbc6`, com o motivo por extenso. E `componentes.css:1417` guarda o que se tentou antes: "havia uma regra que zerava o raio de TUDO dentro de `#app` — muleta enquanto as telas em string nasciam com 2 a 12px" | 2026-08-11 → 2026-08-25 |
| D-04 | procedência | Handoff rule 2. O handoff trazia o critério de desempate que o `DESIGN.md` cortou: *"'250 g arroz' is mono only when it is data in a value column; in a prose sentence the whole sentence is display"* (handoff:14) | 2026-08-11 |
| D-05 | procedência | Handoff rule 3, palavra por palavra ("a genuinely detached object — a verdict, a form, a summary block"). Nenhuma das duas versões define "genuinamente destacado" | 2026-08-11 |
| D-06 | procedência | Handoff rule 3. A única licença aberta desde então é a da bancada (D-43) | 2026-08-11 |
| D-07 | procedência | Handoff rule 3. A regra nunca foi justificada, mas foi **aplicada** com motivo escrito em dois lugares: `treino.css:151` ("um fundo alternado seria exatamente isso") e `DESIGN.md:41-47` via `508cbc6` ("um retângulo que não faz nada seria preenchimento para agrupar") | 2026-08-11 |
| D-08 | procedência | Handoff rule 4, com os três hexadecimais já fixados. `tokens.css:45-49` repete os sentidos | 2026-08-11 |
| D-09 | procedência | Handoff rule 4 dizia: "At most one acid element **competing** per region **of the viewport**". O `DESIGN.md` cortou as duas qualificações e ficou "no máximo um elemento ácido por região". **É o corte que tornou a regra não mensurável.** Aplicada com razão escrita em `treino.css:533` e `componentes.css:1122` | 2026-08-11 |
| D-10 | procedência | Handoff rule 5 trazia o critério operacional: "A 10px tracked label **always introduces a section or names a value**. It is never used for emphasis or flavour". O `DESIGN.md` guardou só a segunda metade. **Mesmo corte, mesmo efeito** | 2026-08-11 |
| D-11 | procedência | Handoff rule 6, integral — os dois movimentos, os dois números. O handoff ainda fechava com uma frase que o `DESIGN.md` não trouxe: "No entrance animations, no fades, no skeletons that shimmer, no springy sheets". **Ver o quadro "os dois movimentos" abaixo** | 2026-08-11 |
| D-12 | **problema** | `508cbc6`, inteiro: "Sem foto, a calha não fica vazia nem desenha imagem quebrada… É o que separa espaço reservado de decoração — um retângulo que não faz nada seria preenchimento para agrupar, que o sistema proíbe. O ponto repete o único elemento redondo que o produto já tinha, em vez de inventar um símbolo para dizer 'vazio'" | 2026-08-25 |
| D-13 | procedência | Handoff §2 Surfaces, tabela idêntica. **Nenhuma fonte explica por que `#0C0E0C` e não outro preto.** `tokens.css:24-30` dá o uso, não a razão | 2026-08-11 |
| D-14 | procedência | Handoff §2 Lines, idêntica, incluindo a frase "there are exactly four, and the choice is semantic" | 2026-08-11 |
| D-15 | procedência | Handoff §2 Text, idêntica | 2026-08-11 |
| D-16 | **problema** | **Não vem do handoff.** Nasceu de medição em `2e3ef75`: "Contraste medido: `--ins-text-5` dá 3,22:1 e reprova em AA para texto pequeno. Procedência e aba inativa, que carregam informação, subiram para `--ins-text-4` (5,01:1). O nível 5 fica para o redundante." Reaplicada em `3ef9bb9`. Os números moram em comentários: `base.css:137-139`, `base.css:209-211`, `componentes.css:218`, `treino.css:161`, `189`, `372-376` | 2026-08-12 |
| D-17 | procedência | Handoff §Signal | 2026-08-11 |
| D-18 | **problema** | O par vem do handoff (`tokens.css` original). O que é decisão do Lastro é a **saída da fonte anterior**: `7634981` — "Era a fonte da identidade anterior e não aparece em regra nenhuma de `src/`… Uma família inteira era baixada a cada primeira abertura, e a fonte do Google é a única coisa que o app busca na rede". A justificativa do par ("eixo de contraste real") foi escrita depois, no `DESIGN.md:79` | 2026-08-26 |
| D-19 | **problema, e ele é um erro de transcrição** | Handoff §Type scale. A divergência que o agente 1 achou em `body-xs` **não é do código**: o handoff escreve `13 / 400 / 1.5` (handoff:67), o código escreve `13px/1.5` (`base.css:194`), e só o `DESIGN.md` escreve `1.4`. O documento é que está errado, desde `2e3ef75`. O `DESIGN.md` também estreitou faixas em números fixos — `metric-l` era `34–38 / 500–600`, `metric-m` era `22–26` — e deixou de fora dois papéis que existem em código, `label-sm` e `data` | 2026-08-12 |
| D-20 | procedência | Handoff:73, "never below 9px for a mono label" | 2026-08-11 |
| D-21 | procedência | Handoff:73, "never below 13px for prose" | 2026-08-11 |
| D-22 | **problema** | **Não vem do handoff.** É do Safari do iPhone, e o comentário é explícito: "NUNCA abaixo de 16px: com fonte menor o Safari dá zoom ao focar o campo e a tela fica torta no meio de uma série. **É a regra que mais se quebra sozinha, porque no desktop nada acontece**" (`base.css:126-129`). Repetida em `treino.css:303`, `treino.css:474`, `treino.css:787`, `componentes.css:977` | 2026-08-12 |
| D-23 | procedência | Handoff:73, "never below 15px for a tappable item name" | 2026-08-11 |
| D-24 | procedência | Handoff:51, lista idêntica. **A razão dos degraus escolhidos não está escrita em lugar nenhum.** O handoff trazia ainda duas medidas que o `DESIGN.md` não copiou e que não estão na escala: "List row vertical padding **13–16px**. Gap between sibling controls **6–8px**" | 2026-08-11 |
| D-25 | procedência | Handoff:52, "Page gutter 20px" | 2026-08-11 |
| D-26 | **problema** | Handoff dizia "Between sections 24–26px"; o `DESIGN.md` fechou em 24. O motivo do fechamento está em `componentes.css:32`: "12 de margem + 12 de padding = 24 no limite, que é o que o sistema pede. **Estava 26 + 14 = 40, repetido cinco vezes por tela**" — provável colheita de `468f7d4`, "compacta o ritmo vertical em 22%" | 2026-08-12 |
| D-27 | procedência | Handoff:52, "Always `gap`, never margins between siblings". **Sem razão escrita em fonte nenhuma.** É a regra mais violada do sistema (248 declarações) e a que menos argumento tem a seu favor no registro | 2026-08-11 |
| D-28 | procedência | As três primeiras exceções citam seções **do handoff**: `§3.5` é a célula de métrica ("label-sm → 5px → metric-m"), `§3.14` é a sparkline (`gap:3px`), `§3.10` são os chips (`padding 9–12px`). A quarta, 17px, não tem `§`: o handoff §3.6 dizia "Dot at 20px from top, offset −4px", e o código traz outra razão, `componentes.css:162` — "alinhado com o centro da primeira linha do corpo" | 2026-08-11 |
| D-29 | **problema, e é revisão** | O handoff mandava `--ins-tap: 44px` ("minimum for any repeated numeric control") e UX law 11 dizia "44–46px". O Lastro subiu para 46 com razão escrita: "**46 e não 44 de propósito: ele usa de pé, suado, com uma mão**" (`tokens.css:87-88`) | 2026-08-11 → Lastro |
| D-30 | procedência, e é revisão | O handoff mandava `--ins-tap-dense: 26px` e UX law 11 dizia "26–30px". O Lastro fixou 28 — e **não escreveu por quê**. A primitiva `Caixa` acompanhou: handoff §3.7 especificava 26×26, `primitivos.jsx` documenta 28×28 | 2026-08-11 → Lastro |
| D-31 | **problema** | Não vem do handoff. `treino.css:306`: "40 e não 46: os 46 do sistema são para controle que se aperta repetido (stepper, botão primário). Este é campo de digitar uma vez, com 19px de conteúdo — 40 já é alvo confortável e **devolve 18px nas três séries**" | Lastro |
| D-32 | **problema** | Não vem do handoff. `componentes.css:184-188`: "forçar 46 aqui dentro **empilhava 16px de ar em cima de um conteúdo de 30**… Alvo pequeno é problema real; alvo grande duas vezes é só altura perdida". Repetido em `treino.css:29`. Cobrado por `estilo.test.ts:120-135` | Lastro |
| D-33 | procedência, com uma revisão | Handoff §3.3, "the signature component", anatomia idêntica. **Revisada** em `2e3ef75`: o handoff pedia "one-line summary" e o resumo tinha cinco linhas na tela; virou duas com corte (`componentes.css:121`, "duas é o meio-termo honesto para refeição com oito itens") | 2026-08-11 → 2026-08-12 |
| D-34 | procedência, e a divergência está datada | Handoff §3.6 marcava em negrito "**reuse for exercises**" — era **proposta de fusão**, não constatação. `timeline.jsx:3-6` repete a tese. A divergência que o agente 1 mediu tem motivo escrito em `508cbc6`: a miniatura do aparelho tomou a calha, "acrescentar uma coluna custaria largura ao nome do exercício, que é o que ele lê primeiro" | 2026-08-11 → 2026-08-25 |
| D-35 | procedência | Handoff §3.5 e §2 Lines | 2026-08-11 |
| D-36 | procedência | Handoff §3.12. `primitivos.jsx:242-245` repete: "é uma das poucas caixas com borda do sistema, porque é um objeto genuinamente destacado" | 2026-08-11 |
| D-37 | **problema** | Handoff §3.8, integral, incluindo os níveis "meal sheet (z 50) → picker (z 70) → editor (z 80). **Never more than three**". **O porquê do três é do Lastro**, e está em `folha.jsx:6-8`: "Três é o limite porque **na quarta ninguém sabe mais o que fechar leva de volta para onde**". A auditoria de setembro conferiu e não achou o que corrigir: "o teto de três níveis já está escrito e respeitado… **Nada a corrigir** — é um acerto do sistema atual" (`02-research-principles.md`) | 2026-08-11 |
| D-38 | procedência | Handoff §3.14, incluindo "Empty slots stay as tracks — the gaps in your logging are visible on purpose". **O número 14 não é justificado em fonte nenhuma**, nem no handoff, nem no código, nem em commit. O que ganhou razão depois foi a escala: `cc8963f` e `primitivos.jsx:248-259` ("Peso corporal varia ~1% em torno de 71 kg. Contra o zero, 70,0 e 71,5 viram 97,9% e 100% de altura — num gráfico de 48px isso é 1 pixel") | 2026-08-11 |
| D-39 | procedência | Handoff §3.13. A razão do gesto é do Lastro: "Tocar na última célula cheia remove ela — **é como se desfaz sem botão de desfazer**" (`primitivos.jsx:287-290`) | 2026-08-11 |
| D-40 | **problema** | As 5 abas e os nomes vêm do handoff §5, como proposta de fusão ("Proposed 5 tabs: HOJE · TREINO · COMIDA · DADOS · GUIA"), e o indicador de 2px/220ms vem de §3.11. Os dois problemas resolvidos são do iPhone e estão em `tabbar.jsx:4-14`: "Barra `position: fixed` no iOS não sobe com o teclado: ela fica flutuando POR CIMA dele, cobrindo justo o campo que você está digitando"; e a barra de gestos roubando o toque | 2026-08-11 |
| D-41 | **problema** | `7fc8ddd`, e o que se tentou antes está nomeado: "O caminho curto — `transform: scale()` e uma casca em volta — **mente em cinco lugares ao mesmo tempo**: `100svh` continua sendo a altura da janela, `@media (orientation)` lê a janela, `position: fixed` se ancora nela, `sticky` troca de âncora assim que a moldura vira scroll container, e a área segura não existe" | 2026-09-03 |
| D-42 | **problema** | `7fc8ddd` / `DESIGN.md:164`: "Mesma licença da miniatura de foto: forma que o mundo já tem, não caixa arredondada por gosto" | 2026-09-03 |
| D-43 | **problema** | `DESIGN.md:165`: "É ela que separa *objeto pousado numa superfície* de *desenho colado na página*, e é a coisa toda que a bancada tem a dizer. Pertence ao objeto; a tela continua sendo a única região plana da composição" | 2026-09-03 |
| D-44 | **problema** | `DESIGN.md:166`: "Ambos são estado — 'chegou', 'virou' —, e ambos morrem em `prefers-reduced-motion`" | 2026-09-03 |
| D-45 | **problema** | `DESIGN.md:167`: "São do iOS. Escrevê-los em Space Grotesk seria o app assinando o que não é dele — a mesma regra que faz `body::before` devolver o fundo sob a barra de status" | 2026-09-03 |
| D-46 | **problema** | `7fc8ddd`: "o prefixo é `pl-` porque `ins-` é a língua de dentro, e o titânio mora no bloco de tokens do palco, nunca em `tokens.css`". Cobrado por `estilo.test.ts:418-450` | 2026-09-03 |
| D-47 | **problema** | `7fc8ddd`: "O telefone nunca entra por aqui. `palco.js` recusa toque, PWA instalado, documento embutido e janela pequena; `?palco=0` devolve o app cru". E o motivo de o `main.jsx` importar o guarda: "com `window`, a ordem de avaliação seria detalhe de emissão do bundler, e dois documentos montando o app seriam duas sincronizações sobre o mesmo `localStorage`" | 2026-09-03 |
| D-48 | **problema** | `7fc8ddd`: "Oito testes novos… nenhum seletor do palco alcançando o app (**conferido injetando um `h2` e um `@media`, pega os dois**)" | 2026-09-03 |
| D-49 | procedência | Igual a D-11. A curva e a duração (`cubic-bezier(.2,.8,.2,1)`, 220ms) e o pulso de 2,4s chegaram **prontos** do handoff (`tokens.css` original, linhas 66-67 e 155) e nunca foram escolhidos aqui | 2026-08-11 |
| D-50 | **problema** | `7634981`: "O 'estado de retirada' do `DESIGN.md` também estava vencido: `src/app.css` saiu em `6f4dd12`, a ponte global morreu em `3283495`, e `minify` e `treeshake` estão ligados". O porquê de os dois estarem desligados antes está em `ARQUITETURA.md:96-104`: eles só podiam voltar quando nenhuma função fosse mais alcançada por string, e **religá-los era o sinal combinado de que a fase tinha acabado** | 2026-08-26 |

## Os dois movimentos, e os outros dois

É a regra que disparou esta revisão. O que a história diz, com data:

**O terceiro movimento é mais velho que a regra que diz que há dois.** A
transição da barra do cronômetro (`#tfill`) está na **primeira linha de história
do repositório**: `7cd6418`, 2026-08-07, `index.html:601` —
`transition: width .25s linear`, ainda com `var(--dawn)` da paleta azul-marinho.
Isso é **quatro dias antes** de o Instrumento entrar (`41bb122`) e cinco antes
de o `DESIGN.md` existir (`2e3ef75`). A regra "existem dois" foi importada de
outro app e nunca foi conferida contra o que já estava na tela. Em `3ef9bb9`
(2026-09-08) a transição foi de `width` para `transform`, por custo de layout —
e nessa passagem `estilo.test.ts:378-386` passou a **exigir que ela exista**.

**O quarto entrou sem que ninguém mencionasse a regra.** A rolagem suave até a
sessão destacada (`main.jsx:5595`) entrou em `02077e3` (2026-09-02). A mensagem
do commit explica o recurso inteiro — célula com dois treinos leva à lista, fio
ácido que se apaga em 2,6s — e **não cita o inegociável 6 uma vez**.

**E existe o precedente contrário, escrito.** No mesmo arquivo,
`main.jsx:3477-3478`: *"`instant` e não `smooth`: o sistema tem exatamente dois
movimentos (§6 do DESIGN) e este não vira o terceiro."* Duas rolagens, sete dias
de diferença, decisões opostas — uma citando a regra, a outra não.

**O que a regra perdeu na tradução.** O handoff fechava a rule 6 com a lista do
que ela proíbe: *"No entrance animations, no fades, no skeletons that shimmer,
no springy sheets."* O `DESIGN.md` guardou só a contagem. Hoje a regra diz
quantos movimentos existem, e não diz mais que tipo de movimento é proibido —
que era a metade operacional dela.

**A auditoria de setembro passou por aqui e não achou nada.** `02-research-principles.md`,
§Movimento: *"já respeitado, e o sistema tem só dois movimentos declarados.
Nada a corrigir."* A auditoria contou os **declarados**, não os que rodam.

---

# docs/LASTRO_UX_CONTRACT.md · U-01 a U-68

O contrato nasceu inteiro num commit, `a00aaf1` (2026-09-09), com §§1-12 e o
checklist. Três seções foram acrescentadas depois, e cada uma tem commit próprio
(ver "o que já foi revisado"). Ele mesmo se declara filho da auditoria de
`docs/ux-audit/` — o que é verdade para a maior parte, **e não para §7 e §10**.

| id | classe | origem | quando |
|---|---|---|---|
| U-01 | **problema** | `ARQUITETURA.md:661-690` e `navegacao.js:1-38`. As três camadas já existiam como três mecanismos empilhados e não nomeados (`01-screen-inventory.md:9-21`); o contrato fixou o teto | 2026-09-09 |
| U-02 | **problema** | `navegacao.js:16-26`: "não existe um segundo estado que possa divergir do primeiro — **que é o defeito clássico desta classe de solução**" | 2026-09-09 |
| U-03 | **problema** | O achado P0 da auditoria: "o app não chama `history.pushState` em lugar nenhum (`history.length` fica em 2 para sempre — **medido**). Um Voltar no meio do treino fecha o app" (`02-research-principles.md`). Antes/depois em `06-final-review.md:15-19` | 2026-09-09 |
| U-04 | **problema** | Idem. `06-final-review.md:15`: "Voltar com folha aberta — antes: fecha o app (`about:blank`)" | 2026-09-09 |
| U-05 | **problema** | Medido: "Dados y=1200 → volta em 0; Guia y=1500 → volta em 0" (`02-research-principles.md`). O mecanismo já existia e estava ligado em 4 dos 10 destinos | 2026-09-09 |
| U-06 | **problema** | `contrato:36-38`, com a razão escrita: "um app que não deixa sair com o Voltar é pior que um que sai cedo demais". `05-navigation-behavior-matrix.md`: "é o comportamento certo, e não se intercepta" | 2026-09-09 |
| U-07 | **problema** | Anti-padrões que o `a00aaf1` fechou junto com o histórico derivado | 2026-09-09 |
| U-08 | procedência | Consequência de U-06, sem registro próprio | 2026-09-09 |
| U-09 | procedência | `02-research-principles.md`, §"Voltar ≠ Fechar ≠ Cancelar ≠ Concluir" — e a auditoria **aprovou o que existia**: "as telas cheias dizem `‹ voltar` (correto)… as folhas dizem `×` (correto). Mantém-se" | 2026-09-09 |
| U-10 | procedência, com generalização não registrada | Handoff §3.8, sobre **folha**: "Primary action is the **last** element, full width". O contrato generalizou para toda tela sem dizer que estava generalizando — e é por isso que §4 ("ação opcional à direita" do destino) o contradiz, como o agente 1 achou | 2026-08-11 → 2026-09-09 |
| U-11 | **problema** | `a00aaf1`: "A posição de leitura, que já existia, foi ligada nos dez destinos em vez de só em quatro" | 2026-09-09 |
| U-12 | **problema** | Idem, com três medições em `06-final-review.md:20-22` | 2026-09-09 |
| U-13 | **problema** | `folha.jsx:12-40`: no iOS, `overflow: hidden` no body não segura o scroll de toque; `position: fixed` com o deslocamento gravado é "o único jeito confiável". E a razão do `instant` na devolução: "suave faz a página deslizar sozinha depois que a folha já sumiu, e parece bug" | 2026-09-09 |
| U-14 | procedência | Comportamento anterior, codificado sem achado | 2026-09-09 |
| U-15 | **problema** | **Acrescentada depois**, por `d180718`: "As setas do mês ficam no meio da página, e cada toque subia ao topo: comparar três meses custava rolar de volta até elas três vezes… O `render(); window.scrollTo(0,0)` tinha virado idioma de 'algo mudou, redesenha'". O commit registra a auditoria feita na hora: "Auditei as outras dezessete ocorrências: são troca de aba, de dia, de destino ou fim de fluxo, e nessas o topo está certo" | 2026-09-09 |
| U-16 | **problema** | `contrato:71-73`, com a razão: "nunca por pilha, **porque destino que abre outro por cima precisa devolver os dois**" | 2026-09-09 |
| U-17 | **problema** | `c0974b2`: "Tela cheia ganha `h1` em vez de `h2`, e o foco vai para ele ao entrar — antes o scroll ia para o topo e o cursor ficava na lista de onde se veio". `telacheia.jsx:16-22` repete e explica o `:focus-visible` | 2026-09-01 |
| U-18 | **problema** | `a6301a7` e `7167e38`. `treino.css:575-590`: "Quanto tempo faz que começou é a pergunta que se refaz o treino inteiro, e a resposta ficava no alto da tela — a uns dois exercícios de rolagem de onde o dedo estava". E o `top: var(--sa-top)`: "Grudar em 0 encostava o relógio da sessão no relógio do iPhone — dois números em cima um do outro". Travado por `2105a2e` | 2026-09-02 |
| U-19 | procedência | Handoff §5, proposta de fusão. As cinco abas e os nomes são de lá | 2026-08-11 |
| U-20 | procedência | Handoff §3.11 e a arquitetura da shell (`app.jsx:1`) | 2026-08-11 |
| U-21 | **problema** | `telacheia.jsx:3-6`: "Isso é **herdado do app antigo e continua certo** — em todas elas o assunto é uma coisa só, e a tab bar convidaria a sair no meio" | 2026-08-14 |
| U-22 | **problema** | `tabbar.jsx:7-9` e `26-29`: "Não existe evento de teclado no iOS; foco é o sinal mais confiável que dá para observar". A auditoria confirmou e deixou o `visualViewport` de fora por não haver problema medido (`06-final-review.md:143`) | 2026-08-12 |
| U-23 | **problema** | `contrato:98-101`, com a razão negativa escrita: "Esconder a navegação aqui **protegeria contra um risco que não existe**". `app.jsx:7-10` registra o uso que a sustenta | 2026-09-09 |
| U-24 | **problema** | `tabbar.jsx:11-14`: "sem isso, a aba fica na faixa onde o gesto de home rouba o toque" | 2026-08-12 |
| U-25 | **problema** | Igual a D-37: handoff §3.8 para os níveis, `folha.jsx:6-8` para o porquê do três | 2026-08-11 |
| U-26 | **problema** | Medido: "`role='dialog'` e `aria-modal='true'` estão declarados, mas **nada** disso é feito: o foco fica no botão que abriu, **39 elementos continuam tabuláveis** atrás da folha, três Tabs saem da folha". **A exceção que o agente 1 achou é decisão registrada**: `06-final-review.md:146` — "`#timer` e `#toast` não ficam inertes… Tornar o 'parar' do cronômetro inalcançável durante uma folha seria pior que o vazamento de foco que resta" | 2026-09-09 |
| U-27 | **problema** | Idem. E `06-final-review.md:107-111` registra o que quebrou no caminho: `el.inert = true` funciona no Chromium mas o jsdom não reflete, e o teste passava em branco — trocado por `setAttribute` | 2026-09-09 |
| U-28 | **problema** | `a00aaf1` + `folha.jsx:118-123`. É a regra em que o agente 1 mediu a falha do Esc | 2026-09-09 |
| U-29 | procedência | `02-research-principles.md`: "Não há modal virando miniaplicativo. **Nada a corrigir** — é um acerto do sistema atual" | 2026-09-09 |
| U-30 | **problema** | **Acrescentada depois**, por `6a877ee`. `06-final-review.md:40-50`: "Guia 6.945px · **8,2 telas**; Dados 3.955px · **4,7 telas**". A seção registra que a própria auditoria errou o método: "a auditoria original mediu largura, overflow, alvo e contraste, e **não mediu altura**. Foi um buraco de método: as duas telas mais longas do app passaram batido porque cada parte delas, isolada, estava certa" | 2026-09-09 |
| U-31 | **problema** | Idem: "Nenhum componente novo em nenhuma das passadas: `LinhaExpansivel` e `Chips` já existiam no sistema" | 2026-09-09 |
| U-32 | **problema** | `contrato:127-131`, com o exemplo que a fundamenta: "O título 'Dupla progressão: primeiro repetição, depois carga' **é** a regra; a prosa embaixo é a justificativa. Recolher a justificativa é divulgação progressiva. Recolher a resposta é esconder" | 2026-09-09 |
| U-33 | **problema** | Idem: "o guia tinha uma seção que era **64% da tela inteira**, e isso não se via rolando" | 2026-09-09 |
| U-34 | **sem origem** | Nasceu inteira em `a00aaf1`. **Não há achado de auditoria, commit ou comentário sobre "ação fixa que coexiste com a tab bar".** `05-navigation-behavior-matrix.md` tem uma coluna "Ação fixa" e ela vem "não" em todas as abas — ou seja, no dia em que a regra foi escrita não havia caso nenhum a resolver | 2026-09-09 |
| U-35 | **problema** | **Acrescentado depois**, por `b1f4fad`: "O toast estava em `bottom: 84px` com o cronômetro ocupando de 52px a 128px: durante um descanso a mensagem nascia INTEIRA atrás dele e, como o cronômetro tem z-index maior, **simplesmente não aparecia**… na tela de treino o que sumia era 'abrir o programa'". E: "O defeito era anterior, mas a linha de procedência que entrou no commit do cronômetro o agravou: de 57px o cronômetro passou a 76px" | 2026-09-09 |
| U-36 | **problema** | `02-research-principles.md`: "a série entra no histórico sem botão de salvar — o modelo certo, e **melhor que o de qualquer referência**… o 'desfazer' já existe: é apagar o campo. **Nada a corrigir**". Origem remota: handoff UX law 8, "Persist silently" | 2026-08-11 |
| U-37 | **problema** | Medido: "a coluna ANTERIOR já existe e é um acerto raro… Mas é uma `<div>` inerte. Torná-la tocável remove dois usos do teclado por série". `treino.css:167-175` explica por que ela não parece botão: "ela é REFERÊNCIA primeiro e atalho depois" | 2026-09-09 |
| U-38 | **problema** | Medido: "`autoTimer()` tem `if (k !== ult) return;` — só dispara na **última** série do exercício. Medido: séries 1 e 2 de 3 não iniciam nada" | 2026-09-09 |
| U-39 | **problema** | `contrato:163-164`, com o efeito nomeado: "sobrevive à tela apagada, ao segundo plano e ao reload". Confirmado em `06-final-review.md:32` | 2026-09-09 |
| U-40 | procedência | `02-research-principles.md`, §Ergonomia: "já obedecido — carga/reps ficam no meio do cartão, e configuração mora em Guia. **Nada a corrigir**" | 2026-09-09 |
| U-41 | **problema** | Medido: "`visibilitychange` sai cedo quando `document.hidden`, então não há descarga pendente ao fechar/mandar para segundo plano. Matar o app dentro de 700 ms da última tecla perde aquela série". **E é aqui que mora uma das duas medições que a auditoria admite ter errado** — ver o quadro abaixo | 2026-09-09 |
| U-42 | procedência, com generalização não registrada | `02-research-principles.md` dizia "Ação frequente e reversível prefere desfazer a confirmar" **e concluía que o Lastro já cumpria** ("nada a corrigir"), porque apagar o campo é o desfazer. O contrato transformou isso em "executa e oferece desfazer" — exigência de interface que a auditoria não pediu | 2026-09-09 |
| U-43 | **problema** | `c0974b2`: "Apagar foto do corpo passa a confirmar, como as outras 17 ações destrutivas. O aviso diz que a lápide viaja: não some só daqui" | 2026-09-01 |
| U-44 | procedência | Handoff UX law 4, quase literal: "Remove/delete never appears in a list. It lives inside the expanded row or the editor sheet, **in coral**, below the constructive options". Repetida em `PRODUCT.md` (princípio 3) e em `editores.jsx:9-10` como "Lei 4" | 2026-08-11 |
| U-45 | procedência | A razão está asserida na própria regra ("confirmação repetida deixa de ser lida") e não tem evidência no projeto. Parente da handoff UX law 8 | 2026-09-09 |
| U-46 | **sem origem** | Nasceu inteira em `a00aaf1`. **A auditoria que o contrato cita como fonte não fez achado nenhum sobre estados** — ao contrário: `04-implementation-plan.md:4` diz "design system, área segura, viewport, **estados vazios** e movimento **já estão certos**", e `03-screen-audit.md:87` registra "sem achados próprios" para eles. Nenhum dos doze achados da auditoria é sobre carregando/erro | 2026-09-09 |
| U-47 | **sem origem, e contradiz M-17** | Idem. E a contradição tem data: **M-17 é mais velha 29 dias.** Handoff UX law 10 (2026-08-11): "Empty states are **one sentence**. No illustrations, no mascots. *'Nenhuma medida registrada ainda.'*" O contrato (2026-09-09) passou a exigir três coisas de cada estado vazio — o que é a área, por que está vazia e **qual é a ação**. Ninguém registrou que estava mudando de regra. É por isso que o exemplo que a `MARCA.md:67` dá de estado vazio bom reprova no U-47, como o agente 1 achou | 2026-09-09 |
| U-48 | **sem origem** | Nasceu em `a00aaf1`. Sem achado na auditoria, sem commit, sem comentário | 2026-09-09 |
| U-49 | **sem origem** | Idem. E nunca foi medida: `06-final-review.md` não lista layout shift entre as verificações | 2026-09-09 |
| U-50 | procedência | Norma. `02-research-principles.md` cita SC 2.4.3, 2.1.1, 2.5.8, 4.1.2 e 3.3.2 como fonte | 2026-09-09 |
| U-51 | **problema** | Medido: "no cartão de exercício aberto — **6 dos 18 controles sem nome nenhum** (os campos de carga e reps das três séries), e os três botões de RIR anunciam '·'". Antes/depois: 8 → 0 no app inteiro (`06-final-review.md:30-31`) | 2026-09-09 |
| U-52 | **problema** | Idem, mais `#nvemail` e `#nvsenha` no Guia. `exercicio.jsx:3-6` registra a solução: "os campos não têm rótulo visível — quem rotula é o cabeçalho, **que é desenho e não semântica** —, então é aqui que o VoiceOver descobre a grandeza" | 2026-09-09 |
| U-53 | **problema** | Idem | 2026-09-09 |
| U-54 | procedência, com medição que a contradiz em parte | Handoff UX law 11 ("44–46px… 26–30px"), endurecida no Lastro (D-29, D-30). A norma entra por `02-research-principles.md` — que **mediu e não achou violação**: "**nenhuma violação de 2.5.8** em nenhuma tela… são raros e de um toque, dentro da exceção que o documento já prevê. Prioridade baixa". A solução de alvo sem engordar desenho tem razão escrita em `componentes.css:71-77`: "a expansão nunca passa do vão até o vizinho, senão dois controles disputam o mesmo pixel e o toque vira sorteio" | 2026-08-11 → 2026-09-09 |
| U-55 | procedência | Norma (WCAG 2.4.7). `componentes.css:742` explica a escolha de `:focus-visible` | 2026-09-09 |
| U-56 | **sem origem** | A metade "nunca escondido atrás de sticky" não aparece em achado nenhum da auditoria, em commit nenhum e em comentário nenhum. Só o sticky em si é justificado (`componentes.css:706-715`) | 2026-09-09 |
| U-57 | procedência | Norma (WCAG 1.4.1), por herança do "WCAG 2.2 AA onde aplicável" no topo do §11. Sem achado próprio no projeto | 2026-09-09 |
| U-58 | **problema** | Handoff rule 6 + `base.css:311-314`. `02-research-principles.md`, §Movimento: "já respeitado… Nada a corrigir" | 2026-08-11 |
| U-59 | **problema** | `8156d26`: "**`100vh` no iOS é a viewport grande e deixa sobra rolável do tamanho da barra do navegador**". Entrou junto com `overscroll-behavior`, cuja razão está em `base.css:42-45`: "puxar além do fim revelava uma faixa do fundo do body que não devia existir. Mata junto o puxar-para-recarregar, que num app instalado é só uma forma de perder o que estava na tela". Cobrado por `estilo.test.ts:72-80` | 2026-08-10 |
| U-60 | **problema** | `tokens.css:95-97`: "Em Safari fora de tela cheia o inset vem 0; o piso garante que o conteúdo nunca encoste na borda física nem suma sob a barra de gestos". E `base.css:62-69` explica o `body::before`: o app declara `black-translucent`, o conteúdo passa por baixo da barra do sistema, "bonito com a página parada, **ilegível rolando**" | 2026-08-12 |
| U-61 | **problema** | `componentes.css:706-715`, o caso concreto: o `‹ voltar` "rolava para fora em quatro dos cinco destinos, o que obrigava a rolar tudo de volta para conseguir sair". E a armadilha nomeada: "Trocar por `hidden` reintroduz `auto` no outro eixo e **derruba isto em silêncio**" (`base.css:84`). Cobrado por `estilo.test.ts:219-226`. Origem provável: `7f94b40`, "o voltar fica grudado no topo" | 2026-09-01 |
| U-62 | **problema** | `71287cb` e `aacb602`. `base.css:317-329`: "O manifesto já pede `'orientation': 'portrait'`, e o Android honra em PWA instalado. **O iOS não**". E a razão das duas condições da media query: "`orientation: landscape` sozinho pegaria qualquer janela de computador… abaixo de 520px de altura e deitado é telefone" | 2026-09-02 |
| U-63 | **problema** | Sete perfis medidos: "320×640 · 360×800 · 375×667 · 390×844 · 412×915 · 430×932 · 844×390. **Zero overflow horizontal** em sete perfis, antes e depois" | 2026-09-09 |
| U-64 | **problema** | Idem | 2026-09-09 |
| U-65 | procedência | Registrado como risco aceito, não como regra conquistada: "Não há uso de `visualViewport` — aceitável… **fica documentado como vulnerabilidade conhecida**" | 2026-09-09 |
| U-66 | **sem origem, e aponta para o lugar errado** | O item manda conferir "contraste conforme DESIGN.md", e **o `DESIGN.md` não fixa razão nenhuma**. Os números existem, mas moram em comentários de CSS e vêm de `2e3ef75`: 3,22:1 para o nível 5, 5,01:1 para o nível 4. O checklist aponta para um documento que não tem a informação | 2026-09-09 |
| U-67 | **sem origem** | Nunca foi conferido: `06-final-review.md:8-11` mediu em "Chromium com emulação de telefone", não em PWA instalado, e o próprio relatório lista "PWA instalado: exige aparelho" como limite | 2026-09-09 |
| U-68 | **problema, e é uma das medições que a auditoria corrigiu** | Ver quadro abaixo | 2026-09-09 |

## As duas medições que a própria auditoria declarou erradas

`06-final-review.md:118-132`, e o relatório diz por que as publica: "uma
auditoria que só publica os acertos do próprio método vale menos".

1. **"Reload no meio do treino perde a série" era falso.** "O `addInitScript` do
   meu driver ressemeava o `localStorage` a cada carregamento e apagava o que o
   app tinha gravado. Corrigido o driver, a persistência se mostrou sólida." O
   que sobrou de real foi só a janela de 700 ms do debounce — que é o que U-41
   fechou, e é a razão de U-68 estar escrito como está.
2. **"Finalizar sessão não encerra" e "só 2 de 3 séries registradas" eram do
   roteiro.** "O Playwright dispensa `confirm()` por padrão… e meu seletor
   `:nth-of-type` contava os elementos errados."

Quem for argumentar sobre U-41 ou U-68 precisa destes dois parágrafos: a
severidade original dessas regras foi superestimada por erro de instrumento, e
está registrado.

---

# MARCA.md · M-01 a M-43

A `MARCA.md` nasceu em `4c561ee` (2026-08-26), 15 dias depois do handoff e
contra um README que estava vencido em três pontos. O commit diz o que ela veio
consertar: *"O README abria com etimologia: o que a palavra significa. Agora
abre com o que o código faz por causa dela."*

**A voz tem uma origem que muda como ela deve ser lida.** `MARCA.md:52`:
*"Ela não foi escrita: já estava em 91 mensagens de commit e nas strings do
app."* E `MARCA.md:70`: *"Quando surgir dúvida de tom, a resposta está no
`git log` antes de estar aqui."* As doze linhas de M-07 a M-18 são **descrição
de prática existente**, não prescrição — com a ressalva de que parte delas já
vinha do handoff (UX laws 10 e 12).

| id | classe | origem | quando |
|---|---|---|---|
| M-01 | **problema** | `4c561ee`, e a regra é o antídoto do defeito que o commit conserta: o README descrevia "a paleta azul-marinho aposentada como se fosse a identidade fixa" e apontava para `src/app.css`, que não existia mais | 2026-08-26 |
| M-02 | **problema** | `PRODUCT.md:8-14` e `MARCA.md:14-20`, com o que a sustenta em código: `shouldUp()` devolvendo `false` voltando de pausa. **Tem voto vencido** — ver abaixo | 2026-08-26 |
| M-03 | **problema** | `MARCA.md:22-23`: "Duas leituras é força; duas leituras ao mesmo tempo é diluição" | 2026-08-26 |
| M-04 | **problema** | `028fab0`, com o modo de falha que ditou a forma: "publicada a versão nova, o iPhone ainda serve o build antigo por uma ou duas aberturas, e uma série registrada nessa janela cai na chave velha depois de a nova já existir" | 2026-08-26 |
| M-05 | **problema** | `MARCA.md:46-48`: "Quem está lá dentro já entrou pela porta que tem o nome escrito" | 2026-08-26 |
| M-06 | **problema** | Idem, e `PRODUCT.md`: "Assinatura dentro do prédio em que você já entrou" | 2026-08-26 |
| M-07 | procedência | Handoff UX law 12: "Portuguese, second person, no hype. Short imperatives. **Never exclamation marks**, never 'parabéns', never emoji". Extraída de strings que já existiam | 2026-08-11 |
| M-08 | **problema** | Handoff:5 ("it never celebrates") e law 12, mais a razão de produto, que é do Lastro e está em `PRODUCT.md`: "**Quem treina 5 a 6 vezes por semana quebra sequência todo domingo, e transformar isso em cobrança seria mentir sobre o programa**". Handoff §"What NOT to bring": "No streaks, badges, or congratulation states" | 2026-08-11 |
| M-09 | procedência | Extraída de string existente (`main.jsx:871`) | 2026-08-26 |
| M-10 | procedência | Idem (`dados.jsx:175`) | 2026-08-26 |
| M-11 | procedência | Extraída dos textos de veredito de `corpo.ts:188-231` | 2026-08-26 |
| M-12 | **problema** | `PRODUCT.md` princípio 8 e `README.md` regra 6: "**Não inventar conselho de treino.** A prescrição está definida; isto aqui é a ferramenta, não o programa". É a regra de produto mais antiga do repositório a alcançar a voz | 2026-08-12 |
| M-13 | procedência | Extraída de `decisao.jsx:28-30`, que é o exemplo que a própria tabela cita | 2026-08-26 |
| M-14 | procedência | Extraída de `guia.jsx:180-182` e `refeicao.jsx:67` | 2026-08-26 |
| M-15 | procedência | Handoff UX law 6 ("Edits are permanent, adjustments are temporary — and the UI says which"), aplicada a override | 2026-08-11 |
| M-16 | procedência | Extraída de `guia.jsx:318-321` | 2026-08-26 |
| M-17 | **problema** | Handoff UX law 10, **literal, exemplo incluído**: "Empty states are one sentence. No illustrations, no mascots. *'Nenhuma medida registrada ainda.'*" Vem do app de nutrição. Ver a colisão com U-47 | 2026-08-11 |
| M-18 | **problema** | Descritiva por declaração: `MARCA.md:52` e `:70`. O contraexemplo da tabela ("fix: corrige bug no handler de encerramento") é a forma que o projeto recusou | 2026-08-26 |
| M-19 | procedência | `4c561ee`. A razão da caixa de frase está escrita ("rótulo mono em caixa alta… seria lida como cabeçalho de seção"); **o tracking `−.045em` e o respiro de 24 não têm razão registrada** | 2026-08-26 |
| M-20 | **problema** | `MARCA.md:81-87`, com a delimitação: "a regra dele vale onde o Instrumento governa… Fora do app não existe Instrumento para confundir, e a prancha manda". E a admissão de escopo vazio: "**hoje a regra de dentro não tem onde se aplicar**" | 2026-08-26 |
| M-21 | **problema** | `MARCA.md:89-90`: "`#CBF35E` significa agora / feito / seu / aperte aqui, e um wordmark não é nenhum dos quatro" | 2026-08-26 |
| M-22 | **problema** | `MARCA.md:92-95`: "lockup é assinatura, e **este produto não assina nada**" | 2026-08-26 |
| M-23 | **problema** | `Lastro_Identity_Approved_v2/docs/BRAND_GUIDE.md`, §"Leitura do símbolo" e §Conceito: "O que cresce precisa ter de onde vir… resultado ← histórico, decisão ← dados". Entrou em `4f60a62` | 2026-09-08 |
| M-24 | **problema** | `1003956` e o `BRAND_GUIDE`: "Esta versão foi reconstruída **diretamente a partir da arte aprovada pelo usuário, sem reinterpretar a geometria**… Não redesenhar, simplificar, engrossar, arredondar ou reorganizar" | 2026-09-08 |
| M-25 | **problema** | `BRAND_GUIDE`, §"Cores aprovadas": lima `#D9FF16`, preto `#0E1112`. **A paleta do ícone é externa ao Instrumento por procedência, não por escolha do sistema visual** — ela vem da arte aprovada. A razão da separação é do Lastro: "O Instrumento governa o que se vê **dentro**; o ícone mora na tela de início, que é do sistema operacional" | 2026-09-08 |
| M-26 | **problema** | `1003956` e `MARCA.md:115-121`: "O mesmo arquivo servindo aos dois papéis é o erro clássico: a arte cheia chega a 94% do raio da zona segura e encosta na borda sob qualquer recorte real". `1003956` traz ainda o efeito colateral consertado junto: "o hash que nomeia o cache do service worker lia só o js e o css, então trocar um ícone deixava o `sw.js` idêntico ao anterior" | 2026-09-08 |
| M-27 | **problema, e guarda argumento vencido** | `MARCA.md:123-127`. Ver abaixo | 2026-09-08 |
| M-28 | **problema** | `4c561ee` e `MARCA.md:131`: "a fronteira **já estava no código antes de alguém decidir**". **Tem voto vencido** | 2026-08-26 |
| M-29 | **problema** | `MARCA.md:138-139`: "Nem endosso, nem absorção — duas nomeações com públicos diferentes" | 2026-08-26 |
| M-30 | **problema** | `MARCA.md:154`: "O software passa o dia se recusando a fazer discurso. Um texto que faz discurso desmente o software que descreve" | 2026-08-26 |
| M-31 | **problema** | `MARCA.md:155`: "Não há onde pendurar: sem página de venda, sem loja, sem onboarding, sem plateia". Ecoa `PRODUCT.md`: "É ferramenta, não vitrine" | 2026-08-26 |
| M-32 | **problema** | `MARCA.md:156`: "Tela nova para contar história" | 2026-08-26 |
| M-33 | **problema** | `MARCA.md:157` | 2026-08-26 |
| M-34 | **problema** | `MARCA.md:158`: "Um frame a mais entre o toque e a próxima série" | 2026-08-26 |
| M-35 | **problema** | `MARCA.md:159`, consequência de M-21 | 2026-08-26 |
| M-36 | **problema** | `MARCA.md:160` | 2026-08-26 |
| M-37 | **problema** | `MARCA.md:161`: "Ele é a moldura do lado de fora. Dentro, a estrutura já é a régua de 1px" | 2026-08-26 |
| M-38 | **problema** | `MARCA.md:162`. É a forma curta do voto vencido de M-28 | 2026-08-26 |
| M-39 | **problema** | `MARCA.md:163`: "Treino é o **domínio**. Todo escopo dizendo a mesma palavra é o mesmo que não ter escopo" | 2026-08-26 |
| M-40 | **problema** | `MARCA.md:164`, igual a M-03 | 2026-08-26 |
| M-41 | **problema** | `7c18963` e `README.md:380-386`: "Antes isso era um `const CACHE = 'treino-v28'` incrementado manualmente, e esquecer significava publicar sem que o aparelho pegasse a versão nova — **sem erro nenhum, só o app parado no tempo**" | 2026-08-10 |
| M-42 | **problema** | `028fab0`: "O cache das fotos (`treino-fotos`) fica como está: **o `activate` do service worker apaga todo cache que não reconhece, e renomeá-lo levaria as fotos junto**" | 2026-08-26 |
| M-43 | **problema** | `4c561ee`: "Também guarda o que sobrou caro: trocar o domínio de deploy troca a origem, e **a origem é onde o histórico mora**". `MARCA.md:178-179` data o que tornou isso sobrevivível: "A sincronização torna isso sobrevivível; **antes de `7767d2b` não era**" | 2026-08-26 |

---

# Os votos vencidos registrados

São **quatro no repositório**, três deles dentro do perímetro desta revisão.
Dois estão rotulados como tal; um não está e é igualmente um.

### 1 · A acepção financeira deveria vir primeiro — M-02, M-03, M-40

`MARCA.md:25-30`, literal:

> **Voto vencido.** A financeira deveria vir primeiro, porque é a rara: frear é
> reivindicação comum na categoria — deload, RIR, gestão de fadiga —, enquanto
> responder de onde saiu cada número quase ninguém faz. Perdeu porque a
> hierarquia se decide pelo que ele encontra primeiro, e às 6h15 o que ele
> encontra é o selo de subir carga que não apareceu. **O argumento fica
> registrado porque pode voltar a ganhar.**

### 2 · Absorver o Instrumento no Lastro — M-28, M-29, M-38

`MARCA.md:141-146`, literal:

> **Voto vencido.** Absorver: renomear Instrumento para Lastro, porque dois
> nomes para um usuário é um a mais. Perdeu por custo e por perda de
> significado — o prefixo `ins-` está em toda classe e todo token, a varredura
> tem risco real contra `tests/dominio/estilo.test.ts`, o usuário nunca lê a
> palavra "Instrumento", e ela carrega uma postura que "Lastro" não carrega:
> painel de instrumento, não app de bem-estar.

### 3 · O L, que saiu e cujo argumento continua de pé — M-27, M-37

Não está rotulado "voto vencido", mas é um, e é o único dos três cuja decisão
**já foi executada contra ele**. `MARCA.md:123-127`, literal:

> **O L saiu.** O monograma foi o ícone até esta versão: duas hastes em ângulo
> reto, raio zero, o mesmo canto da régua de 1px do Instrumento. **O argumento a
> favor dele continua de pé — o ângulo reto já está em toda tela como
> estrutura —** e é por isso que o símbolo, como o L antes dele, **não** volta
> como elemento gráfico dentro do app.

### 4 · Fora do perímetro: a barra livre

`docs/ARQUITETURA.md:841-843`. É decisão de domínio, não de design, e está aqui
só como prova de que a prática de registrar o voto vencido existe fora da
`MARCA.md`:

> O voto vencido: não somar nada e escrever "+ a barra" no texto. Perde-se um
> número certo para não arriscar um errado numa academia de barra atípica.
> Ficou para o dia em que aparecer uma — aí o peso vira campo, não constante.

---

# O que já foi revisado desde que nasceu

Onze revisões com commit. Três delas deixaram o código e o documento
divergindo, e essas estão marcadas.

| regra | o que mudou | onde | resíduo |
|---|---|---|---|
| **D-03** | A terceira exceção ao raio zero trocou: "indicador de home" (handoff rule 1) → "miniatura do aparelho, 10px em 44px" | `508cbc6`, 2026-08-25 | **Sim.** Dois comentários de código guardam listas diferentes e desatualizadas: `tokens.css:8-9` ainda diz "indicador de home"; `componentes.css:1417` diz "ponto de status, ponto ao vivo, thumb do slider". **Três listas, três conteúdos** |
| **D-29** | `--ins-tap` de 44 para 46 | `tokens.css:87-88` | não |
| **D-30** | `--ins-tap-dense` de 26 para 28; `Caixa` de 26×26 para 28×28 | `tokens.css:89`, `primitivos.jsx` | **Sim.** O valor mudou e **a razão não foi escrita** |
| **D-26** | "24–26px entre seções" virou "24 no total"; o valor operante caiu de 40 | `componentes.css:32`, provável `468f7d4` | não |
| **D-33** | Resumo do cartão-foco de uma linha (handoff §3.3) para duas com corte | `2e3ef75`, `componentes.css:121` | não |
| **D-19** | `body-xs` transcrito errado do handoff: `1.5` virou `1.4` no documento | `2e3ef75` | **Sim.** Nunca corrigido; o código segue em 1.5, como o handoff mandava |
| **D-16** | Regra nova, não herdada: os dois níveis mais apagados saem de prosa, por contraste medido | `2e3ef75`, reaplicada em `3ef9bb9` | não |
| **D-18 / D-50** | A Archivo sai do `index.html`; o "estado de retirada" é reescrito porque estava vencido | `7634981`, 2026-08-26 | não |
| **D-41 a D-48** | A bancada entra e abre licença a três dos seis inegociáveis — raio, sombra e movimento | `7fc8ddd`, 2026-09-03 | não |
| **U-15** | Acrescentada ao §3 depois da criação do contrato | `d180718`, 2026-09-09 | não |
| **U-30 a U-33** | §6.1 inteira acrescentada depois | `6a877ee`, 2026-09-09 | não |
| **U-35** | Parágrafo do rodapé-pilha acrescentado ao §7 depois | `b1f4fad`, 2026-09-09 | não |
| **M-19 a M-27** | O ícone trocou o monograma L pelo símbolo da raiz | `1003956`, 2026-09-08 | não |
| **M-04 / M-42** | A chave de estado migrou de `treino-eduardo-v1` para `lastro-v1`; as constantes antigas ficaram de propósito | `028fab0`, 2026-08-26 | não |

**E uma regra que nunca foi revisada, embora o mundo dela tenha mudado duas
vezes:** D-11 / D-49. Ganhou um terceiro movimento por herança (`7cd6418`, mais
velho que ela) e um quarto por adição silenciosa (`02077e3`), e segue escrita
como estava em 2026-08-11.

---

# Regra sem origem registrada

Oito, todas no contrato de UX, e **sete delas em duas seções**. Nenhuma tem
commit, comentário de código, achado de auditoria ou documento anterior que
explique o que ela veio consertar.

| id | regra | o que procurei, e não achei |
|---|---|---|
| **U-34** | "Ação fixa no rodapé… **não coexiste com a tab bar**" | Sem achado na auditoria. `05-navigation-behavior-matrix.md` registra "Ação fixa: não" em todas as cinco abas — no dia em que a regra foi escrita não havia caso a resolver. A segunda metade do §7 (U-35) tem origem; esta não |
| **U-46** | "Toda tela declara os quatro: carregando · vazio · erro · conteúdo" | A auditoria que o contrato cita como fonte **aprovou** os estados: `04-implementation-plan.md:4` e `03-screen-audit.md:87`. Nenhum dos doze achados é sobre estado de carregamento ou de erro |
| **U-47** | "Vazio explica o que é a área, por que está vazia e qual é a ação" | Idem — e **contradiz M-17**, que é 29 dias mais velha e veio literal do handoff ("Empty states are one sentence"). Ninguém registrou a troca de regra |
| **U-48** | "Erro aparece perto do que o causou…" | Nada |
| **U-49** | "Sem layout shift ao sair de carregando" | Nada, e nunca foi medida: não está entre as verificações de `06-final-review.md` |
| **U-56** | "…e nunca escondido atrás de sticky" | O sticky é justificado (`componentes.css:706-715`); o foco atrás dele não aparece em lugar nenhum |
| **U-66** | "contraste conforme DESIGN.md" | **Aponta para um documento que não tem a informação.** O `DESIGN.md` não fixa razão de contraste nenhuma. Os números existem e vêm de `2e3ef75` (3,22:1 e 5,01:1), mas moram em comentários de `base.css`, `componentes.css` e `treino.css` |
| **U-67** | "PWA instalado conferido" | Nunca foi feito: `06-final-review.md:8-11` mediu em Chromium com emulação de telefone, e o próprio relatório lista "PWA instalado: exige aparelho" como limite |

**Um padrão que vale registrar, e que não é meu para julgar:** o contrato de UX
tem duas naturezas dentro do mesmo documento. §§1-8 e §12 saíram de coisas
medidas, com número e antes/depois. §§9-11 e o checklist trazem, no meio de
regras medidas, itens genéricos de boa prática que não passaram pela auditoria
que o próprio documento declara como fonte na linha 7.

---

# Duas coisas que a origem explica e que parecem defeito

Ficam aqui porque o agente 1 as registrou como violação ou fronteira, e a
história muda o que elas são.

**A cor solta que viola D-01 veio do handoff, literal.** `componentes.css:265`,
`.ins-veu`, `rgba(6, 8, 6, .72)` — é exatamente o que o handoff §3.8 especifica:
"scrim `rgba(6,8,6,.72)`". Não é descuido recente: é um literal que atravessou a
tokenização de `8156d26` porque `estilo.test.ts` procura hexadecimal, e este
nunca foi um.

**As classes sem prefixo `ins-` que violam M-28 são contrato de teste, por
decisão escrita.** `componentes.css:1026-1036` e `treino.css:1-16`: "Estas
classes nasceram na paleta antiga e sobreviveram à fusão porque são o contrato
que os testes de fluxo têm com o DOM — renomeá-las compraria churn sem comprar
nada… O que muda aqui é só a língua: token do Instrumento, fio no lugar de
cartão, raio zero." A `MARCA.md` escreveu a regra depois de o projeto já ter
decidido o contrário para 422 classes, e não registrou a exceção.
