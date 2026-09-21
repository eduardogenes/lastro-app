# Importar aula de box a partir do quadro

Rascunho v0. Nasceu da ideia de fotografar a lousa do box e deixar o Claude
preencher, e serve também à etapa 6 do plano do time de especialistas — é o
mesmo formato nos dois lugares.

**Este documento evolui com exemplos.** Cada quadro novo que não couber aqui é
uma linha a mais na seção de limites, não uma exceção silenciosa.

---

## A decisão que rege tudo

**Lista plana de movimentos, mais o quadro transcrito como texto.**

A tentação é modelar a forma da aula — rounds, AMRAP, EMOM, time cap, blocos.
Ela não sobrevive ao segundo quadro. Um levantamento de programações
publicadas mostra pelo menos oito formatos em uso: AMRAP longo, blocos de
AMRAP, EMOM, E3MOM, compromised running, dupla dividindo reps, engine, híbrido
de força. Estruturar isso seria escrever uma linguagem de treino, e o app
existe para registrar carga e repetição, não para descrever competição.

Então: o que o app sabe medir entra como movimento; o resto **fica legível em
vez de virar estrutura**. É a mesma escolha que o ajuste calórico já faz ao
guardar o texto do veredito inteiro ao lado do número.

---

## O formato

```json
{
  "lastro": "aula",
  "v": 1,
  "nome": "HYROX MZ",
  "data": "2026-09-20",
  "quadro": "transcrição literal, com quebras de linha",
  "mov": [
    { "n": "Corrida", "s": 3, "q": 200, "u": "m", "d": 60 }
  ]
}
```

| campo | o que é |
|---|---|
| `nome` | como a aula é chamada no quadro |
| `data` | `AAAA-MM-DD`. O dia a que a aula pertence — nunca se assume hoje |
| `quadro` | a lousa transcrita, literal. É a procedência |
| `mov[].n` | nome do movimento. O id sai do nome, como em todo o resto do app |
| `mov[].s` | quantas passadas |
| `mov[].q` | quanto, na grandeza de `u` |
| `mov[].u` | `rep` · `m` · `cal` · `seg`. Sem quinta |
| `mov[].d` | descanso em segundos, quando o quadro manda |
| `mov[].novo` | só quando o movimento não existe no catálogo (ver abaixo) |

**O arquivo é recusado inteiro, nunca pela metade.** Um movimento sem
declaração derruba a aula toda — importar parte dela plantaria um modelo que
ele acha completo, e é o tipo de erro que só aparece no meio do sábado.

**O catálogo vence o arquivo.** Se o movimento já existe, o `novo` é ignorado
com aviso: um arquivo colado não pode mudar a grandeza de um exercício que tem
meses de histórico, porque isso fundiria duas séries históricas numa só, torta.

### Movimento que o app ainda não conhece

Metade do primeiro quadro real era vocabulário novo. O arquivo declara:

```json
{ "n": "Squat jump", "novo": { "car": "corpo", "u": "rep" }, "s": 3, "q": 15, "u": "rep", "d": 60 }
```

`car` é o tipo de carregamento (`corpo`, `halter`, `halter1`, `barra`, `pino`,
`lado`, `assist`) e `u` é a grandeza padrão. Cadastrar já declara grandeza, e é
a mesma regra de quando ele cadastra na mão.

**O peso não entra.** Wall ball, sandbag e kettlebell são carga fixa por meses
no mesmo box, e quem sabe qual é é o registro anterior — que a coluna ANTERIOR
devolve com um toque. O quadro em texto guarda o que a lousa dizia.

### `(20/15)` e `(10/5)` — os pesos sugeridos

A notação do box é **maior para homens, menor para mulheres**, em kg. Então
`3X 15 SQUAT JUMP (20/15)` sugere 20 kg para ele.

**Continua só no texto do quadro, de propósito.** A sugestão da lousa só ajuda
na PRIMEIRA vez que o movimento aparece: a partir do segundo registro, o que
ele de fato levantou é melhor informação do que o que o box sugeriu, e isso a
coluna ANTERIOR já devolve. Um campo próprio custaria atravessar o modelo, o
slot do dia e o cartão para um ganho que expira no primeiro sábado.

Se um dia ela for para o cartão, vai como **rótulo de prescrição** — anatomia
de `peg`, nunca preenchendo o campo de carga. Carga que aparece preenchida
sozinha é o jeito mais rápido de encher o histórico de número que ninguém fez.

---

## Exemplo 1 — HYROX MZ, 20/09/2026

O quadro:

```
HYROX MZ!
· PLIO + SPRINT (15MIN)
    3X 15 SQUAT JUMP + 200M   (20/15)   REST 1MIN
    3X 12 SPLIT JUMP + 300M   (20/15)   REST 1MIN
· WOD — T.C 20MIN
    150 WALL BALL
    100M BURPEES BROAD JUMP
    80 ABD (REMADOR) (10/5)
    1KM RUN
```

O arquivo:

```json
{
  "lastro": "aula",
  "v": 1,
  "nome": "HYROX MZ",
  "data": "2026-09-20",
  "quadro": "HYROX MZ!\n· PLIO + SPRINT (15MIN)\n    3X 15 SQUAT JUMP + 200M (20/15) REST 1MIN\n    3X 12 SPLIT JUMP + 300M (20/15) REST 1MIN\n· WOD — T.C 20MIN\n    150 WALL BALL\n    100M BURPEES BROAD JUMP\n    80 ABD (REMADOR) (10/5)\n    1KM RUN",
  "mov": [
    { "n": "Squat jump", "novo": { "car": "corpo", "u": "rep" }, "s": 3, "q": 15,  "u": "rep", "d": 60 },
    { "n": "Corrida",                                           "s": 3, "q": 200, "u": "m",   "d": 60 },
    { "n": "Split jump", "novo": { "car": "corpo", "u": "rep" }, "s": 3, "q": 12,  "u": "rep", "d": 60 },
    { "n": "Corrida",                                           "s": 3, "q": 300, "u": "m",   "d": 60 },
    { "n": "Wall balls",                                        "s": 1, "q": 150, "u": "rep" },
    { "n": "Burpee broad jump",                                 "s": 1, "q": 100, "u": "m" },
    { "n": "Abdominal no remador", "novo": { "car": "corpo", "u": "rep" }, "s": 1, "q": 80, "u": "rep" },
    { "n": "Corrida",                                           "s": 1, "q": 1000, "u": "m" }
  ]
}
```

O que este exemplo ensinou:

- **Corrida aparece três vezes**, com 200, 300 e 1000 m. É o mesmo movimento e
  a mesma série histórica — o que muda é a distância do dia. A lista é um
  array justamente por isso.
- **Três de seis movimentos não existiam** no catálogo. Sem `novo`, o formato
  não serve para quadro nenhum.
- **`(20/15)` e `(10/5)` são os pesos sugeridos** — maior para homens, menor
  para mulheres, em kg. Ficam no `quadro` por extenso, e não viram campo; o
  porquê está acima.

---

## Exemplo 2 — Hyrox Friday

O quadro, em blocos de round:

```
Hyrox Friday
3 RNDS:  400 m Ski · 30 m Sled-Push · 25 m Walking Lunges
3 RNDS:  400 m Row · 30 m Sled-Pull · 25 Wall Ball
3 RNDS:  400 m Run · 30 m Farmers Carry · 25 m [não lido]
E5MIN =  15 m Burpee Broad Jumps
```

**Zero cadastros.** Todos os nove movimentos já existem no catálogo — este é o
quadro que prova que `novo` é exceção.

```json
{
  "lastro": "aula",
  "v": 1,
  "nome": "Hyrox Friday",
  "quadro": "Hyrox Friday\n3 RNDS: 400m Ski · 30m Sled-Push · 25m Walking Lunges\n3 RNDS: 400m Row · 30m Sled-Pull · 25 Wall Ball\n3 RNDS: 400m Run · 30m Farmers Carry · 25m ?\nE5MIN = 15m Burpee Broad Jumps",
  "mov": [
    { "n": "Ski erg",           "s": 3, "q": 400, "u": "m" },
    { "n": "Sled push",         "s": 3, "q": 30,  "u": "m" },
    { "n": "Lunge",             "s": 3, "q": 25,  "u": "m" },
    { "n": "Remo ergômetro",    "s": 3, "q": 400, "u": "m" },
    { "n": "Sled pull",         "s": 3, "q": 30,  "u": "m" },
    { "n": "Wall balls",        "s": 3, "q": 25,  "u": "rep" },
    { "n": "Corrida",           "s": 3, "q": 400, "u": "m" },
    { "n": "Farmers carry",     "s": 3, "q": 30,  "u": "m" },
    { "n": "Burpee broad jump", "s": 1, "q": 15,  "u": "m" }
  ]
}
```

O que este exemplo ensinou:

- **Três blocos de round, três movimentos cada.** Viram nove entradas com
  `s: 3`, e os números ficam certos — ele faz três passadas de cada. É o que
  rebaixou o limite do round de "perda" para "ordem descritiva".
- **O bloco de round não precisa de campo.** Um `bloco: 1` aqui só serviria
  para desenhar na tela o que o texto já diz.
- **`25 Wall Ball` está em repetição, não em metro**, apesar de os vizinhos do
  bloco estarem em metro. A grandeza é do movimento, nunca do bloco — e é por
  isso que ela é declarada linha a linha.

## O glossário da lousa

O quadro é escrito para quem está na aula, não para um parser. Abreviação é a
norma, e quem transcreve precisa expandir — errar `FC` uma semana planta
farmers carry onde era outra coisa.

| na lousa | é |
|---|---|
| `RNDS` | rounds |
| `WB` | wall ball |
| `BBJ` | burpee broad jump |
| `FC` | farmers carry |
| `WL` | walking lunges |
| `DB` | dumbbell (halter) |
| `T.C` | time cap |
| `E5MIN` · `EMOM` | a cada 5 minutos · a cada minuto |
| `#` | libras. `50#` são ~22,7 kg |
| `(20/15)` | peso sugerido: homem / mulher |

**Duas unidades de peso já apareceram** — kg no primeiro quadro, libras no
terceiro. É mais uma razão para o peso ficar no texto: estruturá-lo obrigaria
a converter, e converter é o que este app não faz em lugar nenhum.

## O que o catálogo já cobre

O vocabulário do box vive em `SIMULACAO_HYROX` e `MOVIMENTOS_DE_BOX`, em
[src/dominio/programa.ts](../src/dominio/programa.ts). As nove estações
continuam lá mesmo depois de o sábado deixar de ser simulação, e é por isso
que `novo` é exceção e não regra:

| o quadro escreve | o catálogo tem | mede em |
|---|---|---|
| Run | Corrida | m |
| Ski | Ski erg | m |
| Row | Remo ergômetro | m |
| Sled push · Sled pull | iguais | m |
| BBJ | Burpee broad jump | m |
| FC | Farmers carry | m |
| Sandbag lunges | Lunges com sandbag | m |
| WB | Wall balls | rep |
| Walking lunges sem peso | Lunge | m |

Quatro quadros reais: o primeiro pediu três cadastros, o segundo e o terceiro
nenhum.

## Limites conhecidos

O que o quadro diz e o arquivo não carrega como dado:

| o quadro diz | por que fica só no texto |
|---|---|
| blocos (`PLIO + SPRINT`, `WOD`) | o modelo é lista plana, e estruturar não sobrevive ao segundo quadro |
| time cap (`T.C 20MIN`, `15MIN`) | não há campo, e inventar um sem saber o que o app faria com ele é campo morto |
| o bloco de round (`3 RNDS: 400 m Ski + 30 m sled + 25 m lunge`) | vira três movimentos com `s: 3`. **Menos grave do que parecia**: ele registra três passadas de cada, e os números ficam certos. O que se perde é a ordem descritiva, que o texto guarda |
| `E5MIN`, `EMOM`, `alternate w/ partner` | estrutura de tempo e de execução em dupla. Mesma razão dos blocos |
| peso sugerido (`20/15`) | decifrado, e ainda assim só no texto — ver acima o porquê |

---

## Como o arquivo entra no app

No dia aberto (sábado), no painel **Montar a aula de hoje** → **Colar uma
aula**. É a quarta porta, ao lado da lista rápida.

**Preenche o dia, não a biblioteca de modelos.** A aula do box não se sabe
antes: ele descobre o que vai ser quando entra. Então a porta certa é a da
entrada nova, e não a do reuso — as duas portas de reuso (repetir o sábado
passado, modelos salvos) continuam existindo para quando ele **reconhecer**
uma aula repetida, o que só dá para fazer no box, olhando a lousa.

Entra **prescrição sem carga**, como as outras portas. Carga que aparece
preenchida sozinha é o jeito mais rápido de encher o histórico de número que
ninguém fez.

### O quadro tem duas vidas

**Durante a aula**, ele fica no alto do dia: o time cap, o peso sugerido e o
que mais a lousa disse e o app não modela.

**Depois**, vira a nota da sessão no histórico. É a única chance — um quadro
não se reconstrói a partir da prescrição, como o treino de musculação se
reconstrói. Três meses depois, "3 × 400 m de ski" sem a lousa não explica por
que o tempo foi aquele.

Se ele salvar o dia como modelo, o quadro vai junto: salvar é justamente o
gesto de quem reconheceu uma aula que se repete.

O backup continua sendo outra coisa. `importText` substitui o estado inteiro —
exige `logs` e `done` e avisa que apaga o histórico. Aula é incremental e
funde; backup é restauração.
