# Redesenho: o programa vira dado, não código

Hoje o programa é uma constante no arquivo. Mudar uma série é mexer no código, e
o histórico está preso à posição do exercício dentro do treino. Isso precisa
mudar por um motivo prático — máquina quebrada, outra academia, uma série a mais
que faz sentido — e por um motivo estrutural, que é o assunto da primeira seção.

---

## 1. O problema que precisa ser resolvido primeiro

A chave do histórico é **dia + posição**: `A0`, `B3`, `C5`. Foi isso que quase
custou o histórico na troca de programa do treinador, e foi resolvido com um
arquivamento de emergência.

Se o programa passa a ser editável, essa chave quebra o tempo todo. Inserir um
exercício na segunda posição do A empurra todos os seguintes: o que era `A3`
vira `A4`, e o histórico de sete exercícios passa a apontar para o exercício
errado. Não dá para construir edição em cima disso.

**A chave passa a ser o exercício, não o lugar dele.**

Cada exercício ganha um id estável, derivado do nome uma única vez. `S.logs`
passa a ser indexado por esse id. Depois disso, reordenar, inserir, remover e
trocar viram operações inofensivas: o histórico segue o exercício, não a
posição. É essa mudança que destrava todo o resto.

Efeito colateral bom: substituto deixa de ser uma chave de segunda classe
(`A1~Crucifixo inclinado no cabo`). O crucifixo inclinado no cabo é um exercício
como qualquer outro, com id próprio e histórico próprio. Se você o usa como
substituto hoje e o promove a titular no mês que vem, o histórico é o mesmo.

---

## 2. Três camadas

### Camada 1 — o programa do treinador (código, imutável)

`PROGRAMA` continua no arquivo, exatamente como ele prescreveu: 48 exercícios,
125 séries diretas, a rotação A B C E D F. Não é editável. Serve para três
coisas: semear o seu programa na primeira vez, ser o alvo de comparação do freio
de volume, e permitir restaurar.

### Camada 2 — o seu programa oficial (`S.prog`, editável)

É o que abre todo dia. Nasce como cópia do programa do treinador e vai divergindo
conforme você decide. Cada posição de treino é um **slot**:

```js
{ id:'chest-press-inclinado-convergente', s:3, r:'6–10', d:180, desde:1754... }
```

O slot diz **como o exercício está prescrito hoje**. O catálogo diz **o que o
exercício é**. Separar as duas coisas é o que permite ter o mesmo exercício em
dois treinos com prescrições diferentes, e trocar um pelo outro sem perder nada.

`desde` é a data em que aquele exercício entrou naquela posição. É o que sustenta
a regra 5 do treinador: a tela mostra "está no programa há 3 semanas" e avisa
quando você quer trocar antes das 6 a 8.

### Camada 3 — a sessão de hoje (`S.sessao.mods`, efêmera por padrão)

Aqui está o ponto que você levantou. Editar durante o treino **não** mexe no
oficial. As mudanças entram como uma lista de intenções sobre o dia:

```js
S.sessao.mods = [
  { k:'troca', slot:'pendulum-squat', por:'agachamento-hack' },
  { k:'sets',  slot:'elevacao-lateral-na-maquina', de:4, para:5 },
  { k:'add',   id:'remada-cavalinho', pos:3 },
  { k:'rm',    slot:'tibial-anterior' }
]
```

O treino que aparece na tela é o oficial com os mods aplicados por cima.

Guardar **intenções** e não uma cópia do dia é deliberado: é o que permite ao app
dizer, no fim, "você trocou pendulum por hack squat e subiu lateral de 4 para 5",
em vez de mostrar dois blocos de JSON e pedir para você escolher.

---

## 3. O catálogo de exercícios

`S.ex` é um dicionário plano, `id → exercício`:

```js
'agachamento-hack': { n:'Agachamento hack', car:'lado', g:'quadríceps', c:1,
                      cue:'...', meu:0 }
```

Nasce com tudo que o app já conhece: os 48 do programa mais os substitutos da
tabela `ALT` (que hoje são só texto e passam a ser exercícios de verdade).
Aproximadamente 190 entradas, sem custo perceptível.

**Adicionar equipamento novo** é adicionar uma entrada com `meu:1`: nome, grupo
muscular, tipo de carga, composto ou isolador. A partir daí ele aparece na lista
de troca do grupo dele e mantém o próprio histórico, como qualquer outro.

A lista de substituição deixa de ser uma tabela fixa por exercício. Passa a ser:
os substitutos declarados pelo treinador primeiro, com a explicação do que muda,
depois o resto do catálogo do mesmo grupo muscular, depois busca por nome. Sem
isso, todo exercício novo que você criar ficaria invisível na hora da troca.

---

## 4. O momento em que a mudança pode virar permanente

Ao finalizar a sessão, se houver mods, entra uma tela antes do resumo. Uma linha
por mudança, com a decisão em dois botões grandes:

```
Você mudou 3 coisas no treino C hoje.

  Pendulum squat → Agachamento hack
  [ só hoje ]  [ levar para o oficial ]

  Elevação lateral na máquina: 4 → 5 séries
  delt lateral vai de 13 para 14 na rotação · alvo do treinador: 13
  [ só hoje ]  [ levar para o oficial ]

  Tibial anterior removido
  [ só hoje ]  [ levar para o oficial ]

Motivo (opcional):  [máquina ocupada] [outra academia] [decisão de programa]
```

Decisões de projeto aqui:

- **O padrão é "só hoje".** Você disse que boa parte das mudanças é circunstancial.
  Além disso, o app existe em parte para frear, e o caminho de menor esforço tem
  que ser o conservador.
- **Cada mudança é decidida separadamente.** Trocar de máquina porque a sua
  quebrou e subir uma série de lateral são decisões sem nenhuma relação.
- **A consequência aparece na hora da decisão**, não depois. É o único momento em
  que "isso vira 14 séries de lateral por semana" chega em tempo de mudar de ideia.
- **O motivo é guardado.** Daqui a dois meses, "por que o pendulum virou hack?"
  tem resposta. O que for promovido entra em `S.progLog`, que é o histórico de
  decisões do programa e fica visível na tela de programa.
- **O registro de carga não depende dessa decisão.** As séries do hack squat já
  estão gravadas no histórico do hack squat desde a primeira que você digitou.
  A tela só decide o que acontece com o **programa de amanhã**.

Se você sair sem responder, vale o padrão: só hoje.

---

## 5. O freio

Você escolheu que o app mostra o impacto e avisa quando sai do alvo. O alvo é
calculado do `PROGRAMA`, nunca transcrito, então não tem como envelhecer.

Três avisos, todos não-bloqueantes:

1. **Ao mexer nas séries**, ali na linha: `delt lateral 13 → 14 · alvo 13`.
2. **Ao promover para o oficial**, mais forte se o grupo é um dos que o treinador
   mandou não reduzir nem inflar, e com a ordem de corte que ele deu: se o total
   subiu e a recuperação piorar, corta primeiro braço, deltoide posterior e
   espessura — nunca lateral, dorsal ou peito superior.
3. **Ao trocar um exercício com menos de 6 semanas de casa**, lembrando a regra e
   mostrando há quanto tempo ele está lá. Trocar por máquina ocupada é isento —
   é mod de sessão, não mexe no oficial.

Na tela de programa, um cabeçalho permanente: `127 séries · programa do treinador
125 · 4 exercícios diferentes`, com atalho para ver a diferença e restaurar.

---

## 6. Onde fica na interface

**No meio do treino** (o caso de 90%): um botão discreto no cabeçalho do dia liga
o modo de edição. Cada exercício troca os campos de carga por uma linha de
controles — `− 3 séries +`, `trocar`, `remover`, `↑ ↓` — em alvos de toque
grandes, porque é para funcionar de pé e com uma mão. Sai do modo, volta a
registrar. Um contador no cabeçalho mostra quantas mudanças estão pendentes de
decisão.

**Sentado em casa**: a tela de programa, com os seis treinos, reordenação livre,
adicionar e remover exercício, criar exercício novo, e a comparação com o
treinador. Entra por dois caminhos: pelo botão de edição do dia ("editar o
programa inteiro") e por ajustes.

Deixei de propósito como tela e não como quinta aba: a barra tem quatro itens e
cinco fica apertado no celular, e a tela de programa não é coisa de 6h15. Se você
preferir aba, é uma linha.

---

## 7. Migração (plano 3)

1. Monta o catálogo a partir do `PROGRAMA` e do `ALT`, id derivado do nome.
2. `S.prog` recebe uma cópia do programa do treinador.
3. Reescreve as chaves de `S.logs`:
   - `A0` → id do exercício que está em A0 hoje
   - `A1~Crucifixo inclinado no cabo` → id do crucifixo inclinado no cabo
   - `antigo~Mesa flexora deitada` → id da mesa flexora deitada, **recuperando
     para o histórico ativo** os exercícios do plano 1 que continuam no programa
     por nome exato
   - `antigo~Supino inclinado com halteres` → entra no catálogo como exercício
     arquivado, com id próprio e histórico intacto
4. Chaves que caem no mesmo id são fundidas e reordenadas por data.

Nada é apagado, `S.done` não é tocado, e o passo 3 recupera histórico que a
migração anterior tinha arquivado.

---

## 8. Fases

| | O quê | Visível? |
|---|---|---|
| **A** | Catálogo, ids estáveis, `S.prog`, migração. Todo o app passa a ler o programa do estado. | Não. É a fundação. |
| **B** | Modo de edição no dia, mods de sessão, tela de promoção ao finalizar. | Sim, é o miolo. |
| **C** | Tela de programa: reordenar, adicionar, remover, criar exercício, diferença e restaurar. | Sim. |
| **D** | Freio de volume ao vivo, tempo de casa, testes e documentos. | Sim. |

A fase A não muda nada na tela e é onde mora todo o risco de dados. Vai com a
suíte inteira verde e com testes novos de migração antes de qualquer coisa nova
aparecer.
