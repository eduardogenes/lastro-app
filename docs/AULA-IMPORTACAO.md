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
- **`(20/15)` e `(10/5)` não foram interpretados.** Ficam no `quadro`, por
  extenso. Ver limites.

---

## Limites conhecidos

O que o quadro diz e o arquivo não carrega como dado:

| o quadro diz | por que fica só no texto |
|---|---|
| blocos (`PLIO + SPRINT`, `WOD`) | o modelo é lista plana, e estruturar não sobrevive ao segundo quadro |
| time cap (`T.C 20MIN`, `15MIN`) | não há campo, e inventar um sem saber o que o app faria com ele é campo morto |
| o par do round (`15 squat jump + 200 m`) | vira dois movimentos com `s: 3`. O número está certo, o acoplamento se perde |
| `(20/15)` · `(10/5)` | convenção do box que ainda não foi decifrada |

---

## Como o arquivo entra no app

No dia aberto (sábado), no painel **Montar a aula de hoje** → **Colar uma
aula**. É a quarta porta, ao lado de repetir o sábado passado, dos modelos
salvos e da lista rápida.

Entra como **modelo**, nunca como dia preenchido — pela mesma razão das outras
três: modelo é prescrição, e dia preenchido pareceria registro pronto. Depois
se aplica no dia com um toque, pelo caminho que já existe.

Mesmo nome **atualiza** em vez de duplicar: importar o quadro da semana
seguinte não pode encher a lista de "HYROX MZ" indistinguíveis.

O backup continua sendo outra coisa. `importText` substitui o estado inteiro —
exige `logs` e `done` e avisa que apaga o histórico. Aula é incremental e
funde; backup é restauração.
