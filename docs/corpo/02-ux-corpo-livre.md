# 02 · Corpo, redesenhada sem amarras

O dono leu o [01](01-ux-corpo.md) e pediu outra rodada: *"não quero que ele se
prenda tanto às regras criadas pro app… Quero que ache a melhor solução, sem
amarras exageradas."* As regras do app aqui são contexto, não limite. Quando
esta proposta muda uma regra, a §4 diz qual muda e qual entra no lugar.

As medidas do 01 (§2) continuam valendo. Com tudo ligado, **Corpo tem 6.326 px =
7,1 telas** no 414 × 896. Cada medida de fita repete um formulário de ~740 px.
Com as três dobras, a página passaria de 9 telas.

Restrições que continuam reais: os dados e as chaves de `S.body` não mudam (as
dobras entram como chaves novas); iPhone 11 Pro Max; modo claro; a rotina do dono
é um exemplo e não regra do produto; as dobras precisam caber.

---

## 1 · Resumo

1. **Corpo vira um painel de leitura.** Cada medida aparece como estado (último
   valor, variação, tendência). Nenhum formulário fica aberto na página.
2. **Cada tipo de registro tem a entrada certa para a cadência dele.**
   - Peso: uma folha que sobe de baixo, com o número grande e o teclado perto do polegar.
   - Fita e dobras: **um formulário só**, com todas as medidas ligadas, data no
     topo e "Salvar" no rodapé.
   - Bioimpedância: uma folha com os cinco números.
   - Fotos: ficam como estão.
3. **Tocar numa medida abre o detalhe dela:** gráfico, histórico, como medir,
   corrigir e apagar. A "Evolução" do peso passa a ser o detalhe do peso.
4. Estimativa: **~1,5 tela com tudo ligado, dobras incluídas**. Cada dobra soma
   uma linha de 44 px.
5. O registro de peso passa de 1 toque (+ ajustes no stepper) para **2 toques +
   digitação**. Em troca, a entrada fica na zona do polegar e o número é digitado
   direto.

---

## 2 · A solução

### 2.1 · De onde vem a ideia

Esta é a leitura que faço de apps de mercado, de memória e sem copiar nenhum:
- **Apple Saúde:** um resumo com as métricas fixadas. Cada uma abre uma tela de
  detalhe com gráfico e "Adicionar dado". A página não tem formulário.
- **MacroFactor:** o peso é o herói, mostrado como tendência e não como o número do
  dia. Pesar é um toque num botão que abre uma entrada numérica rápida.
- **Hevy:** as medidas corporais são registradas num formulário único, com
  todos os campos e a data no topo. Preenche o que mediu e salva.
- **Withings:** um painel de blocos por métrica, com o histórico no detalhe.

O que todos têm em comum é que **a página principal mostra estado, e registrar
fica a um toque dali, numa superfície própria.**

### 2.2 · A página Corpo

```
┌──────────────────────────────────────────────┐ 414
│ como está                                    │
│ Corpo                                        │
│──────────────────────────────────────────────│
│ PESO                                       › │
│ 73,4 kg   média da semana                    │
│ +0,11 kg/sem · dentro da faixa               │
│ ▁▁▂▂▃▃▄▅▅▆▇▇  (14 semanas)                   │
│ 3 pesagens nesta semana · hoje: 73,6         │
│ [          Registrar peso            ]       │
│──────────────────────────────────────────────│
│ MEDIDAS                  última: 01/10     ⋯ │
│ Cintura             85,0 cm   +0,9 mês  ▁▃▅› │
│ Braço direito       35,9 cm   +0,9      ▁▂▄› │
│ Coxa direita        56,9 cm   +0,9      ▁▃▄› │
│ Panturrilha dir.    37,9 cm   +0,9      ▂▃▄› │
│ Peito              100,9 cm   +0,9      ▁▂▅› │
│ Quadril             96,9 cm   +0,9      ▁▃▄› │
│ Dobra abdominal       14 mm   −1        ▅▃▂› │
│ Dobra suprailíaca     11 mm   −1        ▄▃▂› │
│ Dobra da coxa         12 mm    0        ▃▃▃› │
│ [        Registrar medidas           ]       │
│──────────────────────────────────────────────│
│ BIOIMPEDÂNCIA            13/10 · mensal    › │
│ gordura      18,0 %  │ músculo    34,1 kg    │
│ massa gord.  13,2 kg │ água       44,0 L     │
│ [          Nova leitura              ]       │
│──────────────────────────────────────────────│
│ FOTOS                    01/10 · 11 de 11  › │
│ há 14 dias · a cada 14                       │
│ [   Nova sessão   ]  [   Comparar   ]        │
└──────────────────────────────────────────────┘
```

- **Peso:** o número grande é a **média da semana**, porque é o número que
  decide. O peso de hoje vai na linha de baixo. O botão abre a folha (§2.3).
  Tocar no bloco abre o detalhe (o que hoje é Evolução).
- **Medidas:** uma linha por medida ligada, com nome, último valor, variação e
  uma minicurva de ~40 px. Fita e dobras ficam na mesma lista, separadas pela
  unidade. O `⋯` abre "Escolher medidas" (ligar e desligar). A lista de "Ligar"
  sai da página.
- **Bioimpedância:** os quatro números principais em grade. O peso da balança de
  bioimpedância fica no detalhe, para não competir com o peso da manhã. A frase
  que explicava os "dois pesos" deixa de ser necessária.
- **Fotos:** iguais às de hoje, sem as duas linhas de procedência, que vão para
  dentro da sessão.
- **Vazio** (usuário novo): o bloco do peso diz "Registre a primeira pesagem" e a
  lista de medidas mostra só a cintura, com "Escolher medidas". A explicação das
  três semanas da regra continua, com uma linha só.

Altura estimada (tudo ligado, com dobras): cabeçalho 98 + peso ~260 + medidas
~520 + bio ~240 + fotos ~200 = **~1.320 px ≈ 1,5 tela**. Sem as dobras, ~1,35.

### 2.3 · Registrar peso: folha de baixo

```
┌──────────────────────────────────────────────┐
│ (Corpo escurecida atrás)                     │
├──────────────────────────────────────────────┤
│ Peso da manhã                             ×  │
│ hoje, 07:10 · trocar                         │
│                                              │
│      [ − ]      73,6 kg      [ + ]           │
│              última: 73,4 (ontem)            │
│                                              │
│   [ 1 ]  [ 2 ]  [ 3 ]                        │
│   [ 4 ]  [ 5 ]  [ 6 ]                        │
│   [ 7 ]  [ 8 ]  [ 9 ]                        │
│   [ , ]  [ 0 ]  [ ⌫ ]                        │
│ [               Salvar               ]       │
└──────────────────────────────────────────────┘
```

- O valor já vem com o último peso. Ajustar 100 g é um toque no −/+; um número
  diferente se digita. O teclado próprio já existe (`Teclado`).
- Fluxo: **Registrar peso → (ajusta ou digita) → Salvar**. O Salvar e o teclado
  ficam na metade de baixo, onde o polegar alcança. Hoje o stepper fica em
  y ≈ 130, na faixa de cima.
- "trocar" abre o seletor de data e hora nativo, para o retroativo.
- Se já existe peso no dia, a folha diz "substitui o de hoje (73,4)".
- A mesma folha serve para registrar **uma medida avulsa** a partir do detalhe
  dela (ex.: só a cintura nesta semana).

### 2.4 · Registrar medidas: um formulário, todas de uma vez

Tela cheia, porque o formulário é longo e é preenchido com a fita na mão (muitas
vezes outra pessoa mede e dita).

```
┌──────────────────────────────────────────────┐
│ ‹ Corpo           Registrar medidas          │
│ hoje, 20:40 · trocar                         │
│──────────────────────────────────────────────│
│ FITA                     como medir ▾        │
│ Cintura · umbigo                   ⓘ         │
│ [  85,0  ] cm        era 85,0 (24/09)        │
│ Braço direito · meio do braço      ⓘ         │
│ [        ] cm        era 35,9                │
│ Coxa direita · um palmo acima      ⓘ         │
│ [        ] cm        era 56,9                │
│ …                                            │
│──────────────────────────────────────────────│
│ DOBRAS (adipômetro)      como medir ▾        │
│ Dobra abdominal · 2 dedos do umbigo ⓘ        │
│ [ 14 ] [ 15 ] [ 13 ] mm  → grava 14          │
│ Dobra suprailíaca                  ⓘ         │
│ [    ] [    ] [    ] mm  era 11              │
│ …                                            │
│──────────────────────────────────────────────│
│ Escolher medidas                             │
├──────────────────────────────────────────────┤
│ [        Salvar 2 medidas            ]       │ ← fixo, acima do teclado
└──────────────────────────────────────────────┘
```

- **Preenche o que mediu e salva.** Campo vazio não grava. O botão conta quantas
  medidas vão ser salvas.
- O campo fica vazio, com o valor anterior ao lado ("era 85,0"). Um valor anterior
  dentro do campo seria regravado por engano num formulário longo.
- **Teclado do sistema, numérico** (`inputmode="decimal"`), com "seguinte"
  passando ao próximo campo. Num formulário de 9 campos, o teclado do sistema e a
  navegação entre campos funcionam melhor que o teclado próprio.
- **"como medir ▾"** abre a regra da fita (ou do adipômetro) uma vez, no topo da
  seção. **ⓘ** abre a instrução do ponto daquela medida, no lugar.
- **Onde mediu:** o ponto padrão aparece ao lado do nome ("· umbigo"). Tocar nele
  permite trocar o texto, que é gravado com a medida (`onde`).
- **Dobras:** três campos pequenos, e o app grava **a do meio**, como diz o
  protocolo. Quem preferir pode preencher só o primeiro, que vale sozinho.
- **Fita:** um campo. Um "+ 2ª leitura" opcional faz o app tirar a média e avisar
  se a diferença passa de 0,5 cm. Não é obrigatório.
- Todas as medidas do lote recebem **a mesma data e hora**, que são editáveis.
- **De onde se chega aqui:** pelo botão em Corpo; pelo fim da sessão de fotos
  ("Registrar medidas agora · Depois"); e pelo detalhe de uma medida, que abre a
  tela já focada naquele campo.

### 2.5 · Bioimpedância: folha

É o formulário de hoje, em folha: cinco campos com a leitura anterior ao lado,
data e hora, e "Salvar leitura". A regra de dados continua a mesma: uma leitura,
um instante, quatro números obrigatórios e a água opcional.

### 2.6 · Detalhe de uma medida

```
┌──────────────────────────────────────────────┐
│ ‹ Corpo                      Coxa direita    │
│ 56,9 cm · +0,9 desde 03/09                   │
│ [ 3 meses ] [ 6 meses ] [ tudo ]             │
│ ┌─ gráfico ──────────────────────────────┐   │
│ │      •    •   •──•                     │   │
│ └────────────────────────────────────────┘   │
│ COMO MEDIR                                   │
│ Em pé, peso igual nas duas pernas…           │
│ você mede: um palmo acima do joelho          │
│ HISTÓRICO                                    │
│ 01/10 20:40   56,9 cm                     ›  │
│ 17/09 21:02   56,6 cm                     ›  │
│ …  (tocar: corrigir ou apagar)               │
│ [           Nova medida              ]       │
└──────────────────────────────────────────────┘
```

- O **detalhe do peso** é a Evolução de hoje (curva da média, pontos do dia,
  taxa semana a semana, link para Semana), mais o histórico com corrigir e apagar.
- O detalhe da bioimpedância mostra as cinco séries, com o peso da balança de
  bioimpedância separado e explicado.
- **Apagar** sai da página principal. Fica em cada linha do histórico, um nível
  para dentro, com o painel de confirmação que já existe.

### 2.7 · Os fluxos, resumidos

| registro | caminho | toques até gravar |
|---|---|---|
| peso, mesmo de ontem ±100 g | Registrar peso → −/+ → Salvar | 2–3 |
| peso, outro número | Registrar peso → 4 dígitos → Salvar | 6 |
| sessão de fita e dobras | Registrar medidas → digita → Salvar | 1 + digitação + 1 |
| só a cintura | toque na linha → Nova medida → digita → Salvar | 3 + digitação |
| depois das fotos | última pose → Registrar medidas agora | segue o formulário |
| bioimpedância | Nova leitura → toca no que mudou → Salvar leitura | 2 + digitação |
| corrigir ou apagar | linha → detalhe → item → corrigir/apagar | 3 |

---

## 3 · Por que é melhor que o 01

| | 01 (lista + destino passo a passo) | 02 |
|---|---|---|
| altura com tudo | ~1,9 tela | **~1,5 tela** |
| peso | stepper em cima (y ≈ 130), 1 toque | folha embaixo, 2 toques, número digitado direto |
| sessão de medidas | uma tela por medida, "Registrar e seguir" × 9 | **um formulário**, preenche e salva uma vez |
| dobras | 3 passos a mais | 3 linhas a mais, com mediana automática |
| leitura de cada medida | curvas espalhadas em Evolução | **detalhe por medida**, mesmo padrão para todas |
| apagar | lista com Remover em cada bloco | dentro do histórico, um nível para dentro |
| peso da bioimpedância | frase explicando "dois pesos" | fora da página, sem confusão |

O 01 tentou caber nas regras. Por isso manteve o peso com stepper na página, a
sessão de medidas como passo a passo (porque "fluxo de várias etapas é destino")
e o Remover na lista. O 02 parte de como as pessoas registram de fato. O peso é
um número que se digita ou ajusta, perto do polegar. As medidas são um lote
ditado em sequência. Ver e corrigir é uma tela por medida.

---

## 4 · Regras do app que esta proposta muda

| regra de hoje | onde | proposta |
|---|---|---|
| Peso a um toque, stepper na página (D9) | frente 1 §1.3, `corpo.jsx` | **O registro mais frequente fica a um botão da primeira tela, e a entrada fica na metade de baixo.** Dois toques são aceitáveis quando o segundo está perto do polegar. |
| Não recolher controle nem ação; a página mostra o registro inteiro | contrato §6.1 | **Página de lugar mostra estado; registrar é uma superfície própria** (folha para um valor ou uma leitura; tela cheia para um lote). |
| Folha só para tarefa curta; fluxo de várias etapas é destino | contrato §6 | Mantida no espírito: um lote de medidas é **um formulário** (tela cheia), não um fluxo de etapas. |
| Remover visível na lista de últimas medidas | `corpo.jsx` (`dd-medidas`) | Apagar e corrigir moram no **histórico do detalhe**. Isso já era o princípio 3 do PRODUCT ("destrutivo um nível para dentro"), que a tela atual não seguia. |
| Evolução é um destino só, do peso | frente 3 §1.7 | **Cada medida tem detalhe.** O do peso é a Evolução de hoje. A palavra "Evolução" pode continuar no título do detalhe do peso (ver P2). |
| Valor anterior dentro do campo da bio ("toque só no que mudou") | `corpo.jsx` | Mantido na bio, que é uma leitura completa. No formulário de medidas o campo fica vazio, com "era …" ao lado. |
| Teclado próprio para medidas do corpo | DESIGN §6.1, `teclado.jsx` | Continua no peso (folha). No formulário de várias medidas, teclado numérico do sistema. |
| Fio, não cartão | DESIGN inegociável 3 | Sem mudança: blocos separados por fios. A folha e o formulário já são "formulário". |

---

## 5 · Perguntas ao dono

Só o que é gosto ou decisão sua. O resto foi decidido acima.

### P1 · Fita e dobras: tudo numa tela ou uma por vez?

**Contexto:** na sessão de medidas são até 9 números (6 de fita, 3 dobras).
Muitas vezes outra pessoa mede e dita.
**Hoje:** cada medida é um bloco separado na página, e é preciso rolar até ela.

- **(a) Uma tela com todas, preenche o que mediu e salva uma vez.** ✅
  *Recomendada.* É mais rápido. Dá para ver tudo e pular o que não mediu.
- **(b) Uma medida por tela, com a instrução grande e "Salvar e seguir".**
  Guia melhor quem está aprendendo, mas são 9 telas e 9 toques a mais.

### P2 · O gráfico de evolução: por medida ou tudo junto?

**Contexto:** hoje existe a tela "Evolução", só com o peso.
**Hoje:** botão "Evolução" no topo de Corpo.

- **(a) Tocar em cada medida abre o gráfico e o histórico dela; o do peso continua
  se chamando Evolução.** ✅ *Recomendada.* Cada gráfico fica a um toque de onde se
  olha o número.
- **(b) Manter uma tela "Evolução" única, com o peso e todas as medidas em
  sequência.** Bom para comparar tudo de uma vez, mas é uma tela longa, e o
  histórico para corrigir precisaria de outro lugar.

### P3 · O número grande do peso: média da semana ou peso de hoje?

**Contexto:** a balança oscila de um dia para o outro. A média da semana é o
número que o nutricionista usa.
**Hoje:** a página mostra o stepper com o peso do dia, e a média aparece menor,
mais abaixo.

- **(a) Média da semana grande e o peso de hoje pequeno embaixo.** ✅
  *Recomendada.* O número grande é o que decide, e a oscilação diária deixa de
  chamar atenção.
- **(b) Peso de hoje grande e a média pequena.** É o que a balança mostra, mas
  chama a atenção para a oscilação diária.

---

## 6 · Plano de implementação

Cinco peças inteiras, um commit cada, com os testes feitos junto e a verificação
geral no fim.

**Peça 1 · Dobras no domínio** (igual ao 01, §6 peça 1)
- `src/dominio/corpo.ts`: três chaves novas (`dobraAbdominal`,
  `dobraSuprailiaca`, `dobraCoxa`), `u: 'mm'`, `aparelho`
  (`fita` | `adipometro` | `balanca` | `bio`), `onde` e `como` do pedido §3,
  `REGRA_DA_DOBRA` e `doMeio(a, b, c)`. Liga e desliga continuam derivados do dado
  (as dobras nascem desligadas).
- `ferramentas/espelho/monta.ts` (~linha 759): coluna `aparelho = adipômetro`.
  Atualizar `ferramentas/espelho/LEIA.md`.
- Testes: `tests/dominio/corpo.test.ts` (tabela e `doMeio`), o espelho (CSV em mm),
  e um caso de fusão e cópia de segurança com as chaves novas.

**Peça 2 · Folha de registrar um valor** (peso e medida avulsa)
- `src/ui/folhas/registro.jsx` (novo, ~150 linhas): número grande, −/+,
  `Teclado`, data e hora, "substitui o de hoje", Salvar.
- `src/main.jsx`: `CTX.abreRegistro(k)` e a VM da folha. Reaproveita
  `valorDoCorpo`, `addBody`, `setDiaCorpo` (com hora) e o teclado (`abreTecladoDeCorpo`).
- Testes: refazer pela folha os casos de `tests/fluxo/corpo.test.js` 95–120,
  275–322, 346–472 e 1289–1349 (vírgula, substituir no dia, data retroativa e
  futura, às 6h, teclado). O comportamento é o mesmo e muda só o caminho até ele.

**Peça 3 · Tela "Registrar medidas" e "Escolher medidas"**
- `src/ui/telas/medidas.jsx` (novo, ~250 linhas): seções Fita e Dobras,
  instrução por ⓘ, regra uma vez, "onde mediu" editável, três campos nas
  dobras, "+ 2ª leitura" na fita, Salvar com contagem e lista de ligar/desligar.
- `src/main.jsx`: `view.medidas`, `CTX.abreMedidas(foco?)`,
  `CTX.registraMedidas(lote, quando)` (grava várias com o mesmo instante, pela
  mesma porta de `addBody`), rota, Voltar e `camadasAbertas`. "Ligar" passa a
  ter estado guardado (preferência por usuário) em vez de `view.fitaLigadas`. Esse
  é o único campo novo no estado, e precisa entrar na lista de normalização e
  de importação (o defeito F251 aconteceu exatamente aí).
- `src/ui/telas/protocolo.jsx`: no fim da sessão, "Registrar medidas agora · Depois".
- Testes: refazer 1385–1460 e 1584 e acrescentar: campo vazio não grava; o lote
  tem um instante só; a dobra grava a do meio; o ponto editado vai para `onde`.

**Peça 4 · Detalhe por medida, e bio em folha**
- `src/ui/telas/medida.jsx` (novo), generalizando `evolucao.jsx`: gráfico,
  como medir, histórico com corrigir e apagar, "Nova medida". O peso usa a
  Evolução atual como cabeça do detalhe.
- `src/ui/folhas/bio.jsx` (novo): o formulário de `corpo.jsx:395-497`, movido.
- Testes: os de apagar (162, 507–545, 1060, 1478) passam pelo histórico. Os da
  bio na tela (1129–1249, 1518, 1556, 1713) abrem a folha antes. Os de
  Evolução (1615–1652) passam pelo detalhe do peso.

**Peça 5 · A nova página Corpo**
- `src/ui/telas/corpo.jsx` reescrita (~200 linhas, de 502): blocos Peso,
  Medidas, Bioimpedância e Fotos, como em §2.2. Vazio de uma linha.
- `src/main.jsx`: `CTX.corpo()` passa a devolver o resumo (média, hoje, ritmo,
  linhas das medidas com minicurva, grade da bio).
- `src/componentes.css`: classes `co-*` novas; saem `dd-registro`, `dd-medidas`
  e `co-bio` da página.
- Testes: vazio (1661–1712); conferir os seletores de Corpo em
  `portas`, `toque`, `troca`, `enche`, `movimento`, `gravacao` e `promocao.test.js`.
  Teste novo no navegador: **Corpo com tudo ligado, dobras incluídas, ≤ 2
  telas de 896 px**.

**No fim:** `npm run build`, a suíte completa e a medição de altura repetida
(script do 01, §2.1). Em seguida, atualizar `DESIGN.md` e o contrato de UX com as
regras novas da §4.

---

## 7 · Decisões do dono e o que foi feito (06/11/2026)

Respostas às três perguntas, todas na recomendada, com acréscimos:

1. **Fita e dobras numa tela só.** Ordem do corpo, de cima para baixo: peito,
   braço, cintura, quadril, coxa, panturrilha; depois as dobras. Cada campo mostra
   o ponto numa linha curta, e "como medir" abre a instrução ali mesmo. Campo
   vazio não grava. **A medida anterior não aparece enquanto se digita** (puxa o
   número de quem mede). Depois de salvar, mais de 2 cm na fita ou 3 mm na dobra
   desde a última pede "confira esta medida".
2. **Cada medida abre o seu gráfico e histórico**, também a bioimpedância; o do
   peso continua se chamando Evolução. O histórico mostra o ponto de cada medida
   e destaca quando ele mudou. O gráfico marca os dias de sessão de fotos.
3. **Média da semana grande**, de domingo a sábado, "parcial · N pesagens" até
   fechar, e a diferença para a última semana completa. Toda pesagem conta, em
   qualquer horário e quantidade. É leitura: a regra do nutricionista continua
   com o mínimo de pesagens dela.

E mais: dobras só em mm, nunca em percentual; no fim das 11 poses, "Medir fita
agora"; a hora de qualquer medida é editável (peso, medidas, bioimpedância).

Onde ficou: `src/ui/telas/corpo.jsx` (painel), `src/ui/folhas/peso.jsx`,
`src/ui/folhas/bio.jsx`, `src/ui/telas/medidas.jsx` (formulário),
`src/ui/telas/medida.jsx` (detalhe), `src/dominio/corpo.ts` (dobras, `doMeio`,
`mediaDaFita`, `pesoDaSemana`). Com tudo ligado e dobras, a página Corpo mede
~2 telas no 414 × 896 (antes, 7,1).
