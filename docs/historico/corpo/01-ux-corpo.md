# 01 · A página Corpo está longa: diagnóstico e proposta

Pedido do dono: *"Estou achando muito longa a página de Corpo, principalmente
quando todos os itens de todos os tipos de medidas estão ativos."* E as dobras
com adipômetro (pedido de poses e fita, §3) ainda vão entrar.

Este documento só diagnostica e propõe. Nada em `src/`, `tests/` ou nas regras
foi mexido.

---

## 1 · Resumo

1. Com tudo ligado, Corpo mede **6.326 px = 7,1 telas** do iPhone (8,2 contando a
   barra de status e a tab bar). Com as três dobras no mesmo formato, seriam
   **~9,5 telas**. O contrato manda justificar acima de 3 (§6.1).
2. A causa não é excesso de dado. Cada medida de fita repete **o bloco inteiro de
   registro** (≈ 740 px: stepper, teclado, data, instrução, regra, "como eu medi",
   curva, métricas, lista). As cinco fitas fora a cintura ocupam **59 % da página**.
3. O que se registra quase todo dia (o peso) divide a página com coisas de
   cadência quinzenal ou mensal, e todas aparecem como formulário aberto.
4. **Recomendação:** separar *registrar* de *ver*. Corpo fica com o peso inteiro,
   uma **lista compacta das medidas** (última e variação) e o resumo da
   bioimpedância e das fotos. Fita e dobras são medidas num **destino próprio,
   "Medidas"**, uma por vez, como as poses. Esse destino abre sozinho ou no fim da
   sessão de fotos. A bioimpedância vira **folha**. As curvas vão para Evolução.
5. Resultado estimado: **~1,9 tela com tudo ligado, dobras incluídas**. O peso
   continua a um toque, no mesmo lugar.

---

## 2 · Diagnóstico com números

### 2.1 · Como medi

Chromium do harness (`tests/fluxo/navegador.js`), viewport 414 × 896, build
atual (`npm run build` de 06/11). O estado foi semeado pelo escopo do app. O
script está em
`/tmp/claude-1000/-home-infraestrutura-imts-workspace-personal-lastro-app/694a20ea-e542-4bba-97ea-7cb799d66ae4/scratchpad/ux/mede.mjs`, e as capturas de página inteira (`a-peso-cintura-inteira.png`,
`b-tudo-inteira.png`) estão na mesma pasta.

"Tela" = 896 px. No aparelho de verdade sobram ≈ 771 px úteis (896 − 44 da
barra de status − 47 da tab bar − 34 do indicador de início), então o número
real é maior. Os dois aparecem abaixo.

### 2.2 · Altura total

| estado | altura | telas (896) | telas úteis (771) |
|---|---|---|---|
| **(a)** peso e cintura com dado (braço vem ligado e vazio; as outras quatro na lista "ligar") | 3.156 px | **3,5** | 4,1 |
| **(b)** tudo ligado: 5 fitas com 4 medidas cada, bio com 3 leituras, 3 sessões de fotos | 6.326 px | **7,1** | 8,2 |
| **(b) + 3 dobras** no formato de hoje (projeção: 3 × ~740) | ~8.550 px | **~9,5** | ~11,1 |

### 2.3 · Quanto cada bloco ocupa (estado b)

| bloco | altura | % da página |
|---|---|---|
| cabeçalho (Corpo + Evolução) | 82 | 1 % |
| peso da manhã | 485 | 8 % |
| cintura | 780 | 12 % |
| braço, coxa, panturrilha, peito, quadril | 738 + 738 + 738 + 759 + 738 = **3.711** | **59 %** |
| bioimpedância | 666 | 11 % |
| fotos | 415 | 7 % |

No estado (a), o braço **vazio** já ocupa 580 px, e a lista "ligar" ocupa mais 250.

### 2.4 · O que se repete: um bloco de fita, por dentro (738 px)

| parte | px | tipo |
|---|---|---|
| título + nota | 19 | — |
| stepper + Registrar | 46 | registrar |
| "Digitar o número" | 34 | registrar |
| "… de outro dia" | 34 | registrar |
| instrução do ponto + **regra da fita** | 159 (peito: 180) | instrução |
| "como você mediu" + "Mudar" | 89 | instrução |
| curva de 14 semanas | 48 | ver |
| última medida · desde a primeira | 65 | ver |
| últimas 4 medidas com Remover | 179 | ver / desfazer |
| vãos | ~65 | — |

- **Registrar: 114 px (15 %). Instrução: 248 px (34 %). Ver: 292 px (40 %).**
- A **regra da fita** (`REGRA_DA_FITA`, ≈ 70 px de texto) é **idêntica nos seis
  blocos**: são ~420 px de prosa repetida. Ela vale para todas e só precisa
  aparecer uma vez, na hora de medir.
- A instrução do ponto é lida **na hora de medir**, com a fita na mão. Fora
  disso, é peso morto na página.
- A curva e a lista de cada medida respondem "como está", mas para um dado sem
  regra e sem frequência (as fitas são leitura, `corpo.jsx:337-340`) bastam a
  última medida e a variação.

### 2.5 · Frequente × raro

| o quê | cadência | quem lê | hoje, na página |
|---|---|---|---|
| peso da manhã | 3–4× por semana | regra do nutricionista (média semanal) | bloco aberto, topo ✔ |
| cintura | 1× por semana | leitura (saiu do algoritmo) | bloco aberto |
| braço, coxa, panturrilha, peito, quadril | sem frequência | leitura | 5 blocos abertos |
| dobras (futuro) | parecida com a fita | leitura | — |
| bioimpedância | 1× por mês | leitura | formulário aberto de 5 campos |
| fotos | a cada 14 dias | Semana (o par) | resumo + botão ✔ |

Num dia comum, só o peso é registrado. **Os outros ~5.800 px são formulários de
coisas que se fazem a cada uma, duas ou quatro semanas.** Não existe dia em que
todas sejam registradas: elas formam dois momentos (a sessão de medir, junto ou
não das fotos; a leitura do mês na balança de bioimpedância).

As fotos já resolvem isso direito: na página aparecem o resumo e um botão, e a
sessão é um destino (`protocolo.jsx`). **A proposta é dar à fita e às dobras o
mesmo tratamento.**

### 2.6 · Onde o polegar trabalha

- O stepper e o "Registrar hoje" do peso ficam em **y = 127–173**, na faixa de
  cima. No iPhone 11 Pro Max, com uma mão só, é preciso esticar o dedo, mas é
  **um toque sem rolar**, e é o que a decisão D9 protege. Não proponho mudar.
- Todo o resto exige rolar. Para registrar o quadril, por exemplo, ele rola ~4.400 px
  (5 telas) e passa por quatro formulários iguais. Isso é procura, não leitura
  (contrato §6.1).
- Com o teclado próprio aberto num bloco, a página cresce mais 276 px no meio da
  rolagem.

---

## 3 · Opções

Todas as opções mantêm o peso igual a hoje e as fotos como estão.

### Opção A · Blocos recolhidos no lugar

Cada medida vira uma linha. O toque expande o bloco de hoje inteiro ali mesmo, e
só um fica aberto por vez.

```
┌──────────────────────────────────────────────┐ 414
│ como está                                    │
│ Corpo                            [Evolução]  │
│──────────────────────────────────────────────│
│ O PESO DA MANHÃ      3 pesagens nesta semana │
│ [ − ]    73,4 kg    [ + ]  [Registrar hoje]  │
│ Digitar o número · Peso de outro dia         │
│ ▁▁▂▂▃▄▅▆▇  média 73,4 kg · ritmo +0,11       │
│ 15/10 73,4  13/10 73,4 …          [Remover]  │
│──────────────────────────────────────────────│
│ AS MEDIDAS                                   │
│ cintura          85,0 cm   +0,9 no mês    ›  │
│ braço direito    35,9 cm   +0,9           ›  │
│ ▼ coxa direita   56,9 cm   +0,9              │
│   [ − ] 56,9 cm [ + ] [Registrar hoje]       │
│   Em pé, peso igual nas duas pernas…         │
│   Fita justa na pele… (regra)                │
│   como você mediu: um palmo acima…           │
│   ▁▂▃▄  última · desde a primeira            │
│   lista com Remover                          │
│ panturrilha      37,9 cm   +0,9           ›  │
│ dobra abdominal  14 mm     −1             ›  │
│ …                                            │
│──────────────────────────────────────────────│
│ A BIOIMPEDÂNCIA          06/10 · 18,0 %   ›  │
│ AS FOTOS  …                                  │
└──────────────────────────────────────────────┘
```

- **Melhora:** fechada, a página fica com ~1,9 tela, e as dobras são só mais três
  linhas. É a mudança mais barata.
- **Piora:** contraria o contrato §6.1 ("não recolher controle, ação"). Aberta,
  volta a ter ~740 px no meio da lista. Na sessão de medir (seis a nove medidas
  seguidas), cada medida custa abrir, rolar, registrar, fechar e abrir a próxima. Também
  não atende o pedido de que "a tela de fita fica no fluxo da sessão de fotos".
- **Custo:** pequeno. `corpo.jsx` (estado de qual linha está aberta e a linha
  compacta), `componentes.css`, e ajustes em ~10 casos de `corpo.test.js` (abrir
  antes de tocar).

### Opção B · Registrar separado de ver: lista na página, destino "Medidas" para medir (recomendada)

**Na página Corpo:**

```
┌──────────────────────────────────────────────┐ 414
│ como está                                    │
│ Corpo                            [Evolução]  │
│──────────────────────────────────────────────│
│ O PESO DA MANHÃ      3 pesagens nesta semana │
│ [ − ]    73,4 kg    [ + ]  [Registrar hoje]  │
│ Digitar o número                             │
│ Peso da manhã de outro dia                   │
│ ▁▁▁▁▂▁▂▃▃▄▅▆▇▇                               │
│ média da semana      │ ritmo por semana      │
│ 73,4 kg              │ +0,11                 │
│ da balança de casa, em semi-jejum…           │
│ 15/10   73,4 kg                   [Remover]  │
│ 13/10   73,4 kg                   [Remover]  │
│ …                                            │
│──────────────────────────────────────────────│
│ AS MEDIDAS               última: 01/10       │
│ cintura           85,0 cm  +0,9 no mês    ›  │
│ braço direito     35,9 cm  +0,9           ›  │
│ coxa direita      56,9 cm  +0,9           ›  │
│ panturrilha dir.  37,9 cm  +0,9           ›  │
│ peito            100,9 cm  +0,9           ›  │
│ quadril           96,9 cm  +0,9           ›  │
│ dobra abdominal    14 mm   −1             ›  │
│ dobra suprailíaca  11 mm   −1             ›  │
│ dobra da coxa      12 mm    0             ›  │
│ [        Medir        ]   Ligar outra        │
│ leitura · nenhuma entra em regra             │
│──────────────────────────────────────────────│
│ A BIOIMPEDÂNCIA  uma vez por mês · ant. 13/10│
│ gordura 18,0 % · músculo 34,1 kg          ›  │
│ [  Nova leitura  ]                           │
│──────────────────────────────────────────────│
│ AS FOTOS               01/10 · 3 de 11       │
│ dias desde a última  │ cadência              │
│ 14                   │ a cada 14 dias        │
│ [   Nova sessão   ]  [Comparar]              │
└──────────────────────────────────────────────┘
```

- A linha mostra **a resposta** (última medida e variação). O toque na linha abre
  "Medidas" direto naquela medida. "Medir" abre na primeira medida ligada.
- Variação: "no mês" na cintura (como hoje). Nas outras, "desde a primeira" (como
  hoje, `CTX.corpo().fita[].desde`).

**O destino "Medidas"** (tela cheia, como a sessão de fotos):

```
┌──────────────────────────────────────────────┐
│ ‹ voltar                                     │
│ fita e adipômetro                            │
│ Medida 3 de 9 · Coxa direita                 │
│ ● ● ◉ ○ ○ ○ ○ ○ ○                            │
│ em 15/10/2026  às 20:40       (vale p/ todas)│
│──────────────────────────────────────────────│
│ Em pé, peso igual nas duas pernas, coxa      │
│ relaxada. Fita um palmo acima da borda de    │
│ cima da patela.                              │
│ como você mediu: um palmo acima do joelho    │
│ Mudar como eu medi                           │
│                                              │
│ [ − ]     56,9 cm      [ + ]                 │
│ Digitar o número                             │
│ era 56,6 em 17/09                            │
│                                              │
│ [   Registrar e seguir   ]   Pular           │
│──────────────────────────────────────────────│
│ A REGRA DA FITA (uma vez, recolhível)        │
│ Fita justa na pele, sem apertar…             │
│ ÚLTIMAS                                      │
│ 17/09  56,6 cm                    [Remover]  │
│ 03/09  56,3 cm                    [Remover]  │
└──────────────────────────────────────────────┘
```

Para as dobras, a mesma tela, em mm, com a instrução do adipômetro ("pinçar a
1 cm do ponto, esperar 2 s, medir 3 vezes e gravar a do meio") no lugar da regra
da fita. Ver a pergunta 3 sobre digitar uma ou três leituras.

**A bioimpedância** vira uma folha (o formulário de hoje, sem mudar nada dentro:
cinco campos com o mês passado no lugar, data, hora e "Guardar os cinco").

**As curvas** de cada medida (cintura, fitas, dobras, os quatro números da bio)
vão para **Evolução**, abaixo do peso, cada uma com sparkline, última e variação.
Evolução continua sendo só leitura. O Remover fica onde se registra, no destino
Medidas, que é dentro de Corpo (a regra de 1.7 da frente 1 continua valendo).

**Ponte com as fotos:** a última pose da sessão de fotos mostra
**"Medir agora · Pular"**, que abre o mesmo destino. Isso atende "no fluxo da
sessão de fotos" e "abrir sozinha" sem forçar quem não mede junto com as fotos.

- **Melhora:** a página cai para ~1,9 tela com tudo ligado e as dobras (~1,7 sem
  elas; ~1,4 no estado a). Cada dobra nova custa **uma linha de 48 px**. A sessão
  de medir passa a ser uma sequência sem rolar, com a regra dita uma vez, a data e
  a hora ditas uma vez e o polegar sempre no mesmo lugar. O padrão já é conhecido
  (é o das poses). A tela única de fita que o pedido descreve passa a existir.
- **Piora:** medir **só a cintura** custa um toque a mais (linha → destino), mas
  dispensa a rolagem até ela. A curva de cada medida sai da página e fica a um
  toque, em Evolução. Há uma tela nova para manter.
- **Custo:** médio. Tela nova `src/ui/telas/medidas.jsx` (~250 linhas, reaproveita
  `Stepper`, `Teclado` e `ComoMedi`), uma folha para a bio (o JSX é movido, não
  reescrito), `corpo.jsx` encolhe ~250 linhas, ~200 linhas em `main.jsx`
  (destino, VM, Voltar), seções novas em `evolucao.jsx`, um botão em
  `protocolo.jsx`. Ver §6.

**Regras tocadas:** nenhuma contrariada.
- Contrato §6: "fluxo de várias etapas é destino" (Medidas) e "folha é tarefa
  curta" (bio).
- Contrato §6.1: nada é recolhido. A resposta fica na linha e o controle mora no
  destino.
- Frente 1 §1.3: o registro continua sendo de Corpo (D9). Medidas é destino de
  Corpo, como Evolução e a sessão de fotos.
- DESIGN inegociável 3: a lista é de fios, sem caixa nova. A folha da bio é
  "formulário", que está na lista fechada.
- Frente 3 §1.3 recusou "Medidas" como nome **do lugar**. Aqui é título de
  destino dentro de Corpo, como "Evolução". Se o dono preferir, "Fita e
  adipômetro" serve.

### Opção C · Agrupar por momento, com chips

Chips no topo, "Manhã · Noite · Mês". Manhã mostra o peso. Noite mostra as fotos,
a fita e as dobras. Mês mostra a bio.

```
┌──────────────────────────────────────────────┐
│ Corpo                            [Evolução]  │
│ [ Manhã ]  [ Noite ]  [ Mês ]                │
│──────────────────────────────────────────────│
│ (Noite)                                      │
│ AS FOTOS …  [Nova sessão]                    │
│ AS MEDIDAS                                   │
│ cintura 85,0 · braço 35,9 · …   (linhas)     │
│ dobra abdominal 14 mm …                      │
└──────────────────────────────────────────────┘
```

- **Melhora:** cada chip cabe em ~1 tela. Para o dono, a página fica igual à rotina dele.
- **Piora:** **transforma a rotina do dono em estrutura do produto.** Outro
  usuário pesa à noite ou mede a fita de manhã. Os chips escondem o estado das
  fotos e da bio atrás de um toque. O contrato usa chips para "dois assuntos" (§6.1), e aqui o assunto é um só. Sem as
  linhas compactas da opção B, o chip "Noite" continuaria com ~6.000 px.
  Na prática, é a opção B com uma camada a mais.
- **Custo:** o da opção B mais os chips e o estado do chip escolhido.

### Onde as dobras entram, em cada opção

| | Corpo | onde registra |
|---|---|---|
| A | +3 linhas recolhidas (+144 px) | expandindo a linha |
| **B** | **+3 linhas na lista (+144 px)** | **destino Medidas, passos 7–9** |
| C | +3 linhas no chip Noite | destino Medidas |

Em todas, as dobras vêm **desligadas** (como coxa e peito hoje), porque o
adipômetro é opcional e outros usuários não terão um.

---

## 4 · Recomendação: opção B

**Por quê:**
1. Ataca a causa, que é o formulário repetido na página de ler, e não o sintoma.
   A página volta para menos de 2 telas e não cresce com medida nova.
2. Separa pela **cadência real**, sem amarrar a uma hora do dia: o que é
   quase diário fica aberto, e o resto vira resumo e destino.
3. Junta a sessão de medir num lugar só, com a regra dita uma vez, que é o que o
   pedido de fita descreve, e deixa a ligação com as fotos como **oferta**, não
   como obrigação.
4. Repete um padrão que o app já tem (fotos: resumo na página, sequência em tela
   cheia).

**O que NÃO muda:**
- O **peso continua a um toque**, no topo, com stepper, teclado, data, média,
  ritmo, procedência e as últimas pesagens com Remover. É o único dado que uma
  regra lê.
- O "como eu medi" continua por medida, preenchido com o ponto padrão.
- A bioimpedância continua sendo **uma leitura de cinco números com um instante
  só**, com "Guardar os cinco" e a hora editável. Muda o lugar, não a regra.
- Nenhuma medida ganha cobrança, frequência ou cor de estado. A lista diz
  "leitura · nenhuma entra em regra".
- Os dados, as chaves de `S.body`, o espelho e o CSV continuam iguais, exceto as
  três dobras, que entram como chaves novas.

---

## 5 · Perguntas para o dono

Só as que mudam a solução.

### P1 · Onde se registram as medidas de fita e as dobras?

**Contexto:** cada medida de fita ocupa quase uma tela inteira em Corpo, com
botões, instrução, gráfico e lista, mesmo nas semanas em que nada é medido.
**Hoje:** seis blocos assim, um embaixo do outro. Com tudo ligado são 7 telas, e
com as dobras seriam ~9,5.

- **(a) Lista curta em Corpo e uma tela de medir à parte, uma medida por vez,
  como as poses.** ✅ *Recomendada.* A página fica com ~2 telas, e medir vira uma
  sequência. Medir uma medida só custa um toque a mais.
- **(b) As medidas viram linhas que abrem no lugar.** Mais barato. Aberta, a
  linha volta a ocupar uma tela, e numa sessão de 6 a 9 medidas é preciso abrir e
  fechar cada uma.
- **(c) Separar a página por momento (manhã, noite, mês).** Combina com a sua
  rotina, mas fixa essa rotina para todo mundo e esconde as fotos e a bio atrás de
  um toque.

### P2 · A cintura continua com bloco próprio na página?

**Contexto:** a cintura é medida 1× por semana. Hoje ela não entra mais na
decisão de calorias, só na leitura.
**Hoje:** bloco completo logo abaixo do peso (780 px).

- **(a) Vai para a lista, junto com as outras, como a primeira linha.** ✅
  *Recomendada.* Toque na linha → abre a tela de medir já na cintura. A página
  ganha ~730 px.
- **(b) Fica com o bloco completo em Corpo.** Registrar a cintura não muda, mas a
  página fica com ~2,7 telas, e a cintura passa a ter dois lugares para
  registrar (o bloco e a tela de medir).

### P3 · Na fita e nas dobras, você digita cada leitura ou só o resultado?

**Contexto:** a regra da fita é "meça duas vezes; se diferirem mais de 0,5 cm,
meça uma terceira e registre a média das próximas". A das dobras é "meça 3 vezes
e grave a do meio". O app pode fazer essa conta.
**Hoje:** a fita aceita um número só e mostra a regra como dica. As dobras ainda
não existem.

- **(a) Um número só, com a regra escrita na tela, para as duas.** Mais rápido.
  A conta fica com quem mede.
- **(b) Dobras: três campos, e o app grava a do meio. Fita: um número, com
  "+ outra leitura" para quem quiser que o app tire a média.** ✅ *Recomendada.*
  Nas dobras a conta é sempre a mesma e o erro de cabeça é fácil. Na fita, a
  segunda leitura fica opcional. O arquivo de medidas continua com um valor por
  medida.
- **(c) Três campos para tudo.** O mais fiel à regra, mas triplica a digitação
  da fita.

### P4 · Onde ficam as curvas de cada medida?

**Contexto:** hoje cada medida tem a sua curva de 14 semanas na própria página.
**Hoje:** sete curvas em Corpo (peso, cintura e cinco fitas).

- **(a) Em Evolução, abaixo do peso, uma seção por medida.** ✅ *Recomendada.*
  Evolução já é o lugar de "ver o tempo passar". Corpo mostra a última e a
  variação.
- **(b) Uma curva mini dentro de cada linha da lista.** Fica tudo à vista, mas
  cada linha cresce de 48 para ~80 px (+300 px com tudo ligado), e uma curva de
  48 px de largura diz pouco.

---

## 6 · Plano de implementação (opção B)

Em peças inteiras, uma por commit, com testes ao final de cada peça e a
verificação geral no fim.

**Peça 1 · Dobras no domínio** (vale para qualquer opção)
- `src/dominio/corpo.ts`: três entradas em `MEDIDAS_DO_CORPO` (`dobraAbdominal`,
  `dobraSuprailiaca`, `dobraCoxa`), `u: 'mm'` (ampliar o tipo), um campo
  `aparelho: 'fita' | 'adipometro'` (ou `fita: false` + `dobra: 'desligada'`),
  `onde` e `como` do pedido §3, e `REGRA_DA_DOBRA`. Uma lista
  `MEDIDAS_DE_MEDIR` (fita + dobras) e a função `doMeio(a, b, c)`.
- `ferramentas/espelho/monta.ts:759`: coluna `aparelho` = `adipômetro`.
  `ferramentas/espelho/LEIA.md`.
- Testes: `tests/dominio/corpo.test.ts` (tabela e `doMeio`), teste do espelho
  (`medidas.csv` com `unidade=mm`, `aparelho=adipômetro`), fusão e cópia de
  segurança enumerando as chaves novas (já leem a tabela; um caso que confirme).

**Peça 2 · Destino "Medidas"**
- `src/ui/telas/medidas.jsx` (novo): sequência das ligadas, pontos de progresso,
  data e hora uma vez, instrução, `ComoMedi` (movido de `corpo.jsx`), `Stepper`,
  `Teclado`, "Registrar e seguir", "Pular", regra uma vez, últimas com Remover.
- `src/main.jsx`: `view.medidas = { k }`, `CTX.abreMedidas(k?)`,
  `CTX.fechaMedidas`, `CTX.medidas()` (VM), entrada em `camadasAbertas`, em
  `entraNoDestino`/`saiDoDestino`, na rota (perto da linha 3087) e no mapa do
  Voltar (perto da 8252). `ehFita` passa a ser `ehMedida`, e `addBody` aceita mm e
  `doMeio`.
- `src/componentes.css`: classes `me-*`. Reaproveitar `co-como` e `co-onde`.
- Testes novos em `tests/fluxo/corpo.test.js` (ou `medidas.test.js`): a sequência
  pula as desligadas; "Pular" não grava; a data e a hora valem para todas; a dobra
  grava a do meio; Voltar devolve a posição de Corpo.

**Peça 3 · Corpo enxuta e bio em folha**
- `src/ui/telas/corpo.jsx`: tirar o `.map` das fitas e o bloco da cintura (se P2 = a), e pôr
  a lista compacta com "Medir" e "Ligar outra". Bio vira resumo + "Nova leitura".
- `src/ui/folhas/bio.jsx` (novo): o formulário de hoje, movido.
- `src/main.jsx`: `CTX.corpo()` devolve `medidas: [{k, n, ultima, variacao}]`.
  `CTX.abreBio`.
- Testes a ajustar em `tests/fluxo/corpo.test.js`: 322 (stepper da cintura), 346–472
  (data por medida, quando a cintura sai), 1129–1249, 1518, 1556 e 1713 (a bio
  passa a abrir a folha antes), 1289 (teclado da cintura), 1385–1460 e 1584 (fita:
  ligar, como-eu-medi, instrução passam ao destino). Conferir os seletores de
  Corpo usados em `portas`, `toque`, `troca`, `enche`, `movimento`, `gravacao`
  e `promocao.test.js`.
- Teste novo no navegador: **Corpo com tudo ligado ≤ 2 telas** (896 px), medido
  como em §2.1. É a trava para a página não voltar a crescer.

**Peça 4 · Evolução e a ponte com as fotos**
- `src/ui/telas/evolucao.jsx` e `CTX.evolucao()`: seções por medida (sparkline,
  última, variação). Só leitura.
- `src/ui/telas/protocolo.jsx`: no fim da sessão, "Medir agora · Pular"
  abre o destino Medidas.
- Testes: Evolução mostra as medidas sem botão de escrever, e o fim da sessão
  de fotos oferece medir.

**No fim:** `npm run build`, a suíte inteira e a medição de altura repetida. O
contrato e o DESIGN.md não precisam mudar. Se a P1 sair diferente de (a),
esta seção muda inteira.
