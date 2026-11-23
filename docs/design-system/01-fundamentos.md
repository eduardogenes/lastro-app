# Fundamentos

Os valores moram em [tokens.css](tokens.css). Este documento diz o papel de
cada um, quando usar e por quê. O `DESIGN.md` da raiz
aponta para cá.

## A ideia, em uma frase

**A tela diz uma coisa por vez, em letra grande, com um botão só.** O que
importa agora ocupa um bloco de cor no topo; o resto é consulta, compacta,
embaixo. Compacto onde se consulta, com respiro onde se age.

## Cor

Tema claro sempre: não segue o aparelho, não tem opção escura. Fundo de papel
quente, tinta quase preta, cores chapadas. Sem degradê, sem vidro, sem sombra
para dar relevo.

### Os papéis

| Token | Valor | Papel |
|---|---|---|
| `--fundo` | #F6F3EC | o papel: fundo de toda tela e de toda folha |
| `--superficie` | #FFFDF8 | controle sobre o papel ou sobre cor: cartão de escolha, campo, quadro, ficha de resposta |
| `--superficie-quieta` | #EBE6DA | bloco secundário: pergunta, trilho do seletor, vazio, círculo de ícone |
| `--divisoria` | #DFDACE | só divisória entre linhas, 1,5 px. **Não** é contorno de controle |
| `--contorno` | #858073 | contorno de controle sem preenchimento forte: campo, cartão de escolha, chave desligada, ficha de resposta sobre o fundo |
| `--texto` | #0F0F0D | texto, ícone, botão principal, contorno forte |
| `--texto-2` | #56554E | frase de apoio sobre fundo, superfície e quieta |
| `--texto-legenda` | #62615A | nota de seção e apoio de linha, 12 a 13 px |
| `--texto-sobre-acao` | #F6F3EC | o que está sobre a tinta |
| `--texto-sobre-acao-2` | #A9A79C | ícone inativo da doca |
| `--assunto-treino` | #D2F23A | treino, a ação de agora, o selecionado |
| `--assunto-refeicao` | #FF9A4D | refeição |
| `--assunto-corpo` | #D3C6FF | corpo, medidas, pergunta do dia, aula do box |
| `--assunto-semana` | #BBDDFB | semana, água, dobras |
| `--assunto-feito` | #BEEBD2 | feito, guardado, em dia, livre |
| `--atencao` | #FF9A4D | fora do padrão, falha. Mesmo valor da refeição, papel diferente: sempre com contorno de tinta e uma frase |

**Mudou em relação ao protótipo:**

- `--texto-legenda` escureceu de #77766D para #62615A. O cinza antigo dava
  4,1:1 no papel e 3,7:1 na areia, abaixo do mínimo de 4,5:1 para texto de
  13 px. O novo dá 5,6 e 5,0, e a diferença para o `--texto-2` continua
  visível (6,8 contra 5,6).
- Nasceu `--contorno` (#858073). O fio bege (#DFDACE) dava 1,3:1 com o papel e
  era o único contorno do cartão de escolha, da chave desligada e do campo. O
  contorno de um controle precisa de 3:1 para ser visto. O fio continua
  existindo só como divisória entre linhas, onde ele é decoração.

### Os pares medidos

Razão de contraste (WCAG 2), texto sobre fundo:

| | fundo | superfície | quieta | treino | refeição | corpo | semana | feito |
|---|---|---|---|---|---|---|---|---|
| texto | 17,3 | 18,9 | 15,4 | 15,1 | 9,1 | 12,1 | 13,6 | 14,6 |
| texto-2 | 6,8 | 7,4 | 6,0 | 5,9 | **3,6** | 4,7 | 5,3 | 5,7 |
| texto-legenda | 5,6 | 6,1 | 5,0 | 4,9 | **3,0** | **3,9** | **4,4** | 4,7 |
| contorno (não é texto; pede 3) | 3,6 | 3,9 | 3,2 | 3,1 | 1,9 | 2,5 | 2,8 | 3,0 |
| (o cinza antigo) | 4,1 | 4,5 | 3,7 | 3,6 | 2,2 | 2,9 | 3,2 | 3,5 |

As regras que saem da tabela:

1. **Sobre cor de assunto, o texto é `--texto`. Sempre.** O `--texto-2` passa
   no lima, no céu, no menta e no lilás, mas a regra é uma só para ninguém
   precisar consultar a tabela. A legenda cinza sobre lima e lilás, que o
   roteiro pediu para medir, dá 4,9 e 3,9: proibida.
2. Apoio de linha e nota de seção usam `--texto-legenda` só sobre fundo,
   superfície e quieta.
3. Sobre tangerina, só tinta: é a superfície mais clara de luminância média, e
   tanto o apoio quanto a legenda reprovam.
4. O contorno de controle não vai sobre cor: sobre cor, o controle é
   `--superficie` cheio ou contorno de tinta.

### Cor não carrega estado sozinha

A cor do bloco diz **de que assunto é o momento**, nunca se foi bom ou ruim.
Não existe vermelho. Atenção é tangerina **com** contorno de tinta **e** uma
frase que diz o que houve. Destrutivo se distingue pela palavra e pela
confirmação, não pela cor. Feito é menta **com** o ícone de certo.

## Tipografia

Duas famílias, servidas de dentro do app (funcionam sem rede):

- **Bricolage Grotesque**, peso 700 e 800: títulos, números, botões, rótulos
  curtos. Entreletra fechada, mais fechada quanto maior.
- **Instrument Sans**, peso 500 a 700: texto corrido, apoio, legenda, campo.

Todo número usa algarismos tabulares (`font-variant-numeric: tabular-nums`),
para a carga não pular de lugar quando muda de 57,5 para 60.

### A escala

| Token | Tamanho / entrelinha | Peso, entreletra | Onde |
|---|---|---|---|
| `--t-contagem` | 120 / 0,85 | 800, −0,05em | o descanso, lido de longe |
| `--t-gigante` | 96 / 0,84 | 800, −0,05em | o número do lugar (peso no Corpo) e o da medição |
| `--t-gigante-m` | 76 / 0,84 | 800, −0,05em | a tela que é sobre um número: o exercício |
| `--t-valor` | 66 / 0,9 | 800, −0,045em | carga e repetição da série |
| `--t-gigante-p` | 64 / 0,86 | 800, −0,05em | cabeça de consulta: peso, medida, kcal |
| `--t-heroi` | 50 / 0,92 | 800, −0,04em | título do bloco do momento |
| `--t-heroi-m` | 36 / 0,98 | 800, −0,04em | o mesmo título com mais de 12 letras, ou quando é pergunta |
| `--t-lugar` | 34 / 1 | 800, −0,035em | cabeçalho dos cinco lugares |
| `--t-heroi-fino`, `--t-folha`, `--t-acao` | 30 / 1 | 800, −0,03em | bloco em faixa, título de folha, nome na tela de ação |
| `--t-destino` | 28 / 1 | 800, −0,03em | cabeçalho de destino |
| `--t-quadro` | 22 / 1,05 | 800, −0,02em | número do quadro |
| `--t-botao-g` | 22 | 700 | "Feito", "Guardar a 2ª" |
| `--t-valor-linha` | 19 | 800, −0,02em | número à direita da linha |
| `--t-botao` | 18 | 700, −0,01em | botão principal e de contorno |
| `--t-secao`, `--t-nome` | 17 / 1,1 | 700, −0,02em | título de seção; nome em lista |
| `--t-nome-p` | 16 / 1,2 | 700 | nome em lista densa |
| `--t-campo` | 16 | 500 | tudo que se digita (o Safari dá zoom abaixo de 16) |
| `--t-texto` | 15 / 1,38 | 500 | apoio do bloco, texto corrido |
| `--t-botao-p` | 15 | 700 | ficha de resposta, botão de faixa |
| `--t-apoio` | 14 / 1,4 | 500 | explicação sob seção, apoio da folha, saída discreta |
| `--t-rotulo` | 13 / 1,25 | 600 | nota de seção, apoio de linha, rótulo de campo |
| `--t-legenda` | 12 / 1,25 | 600 | **o piso.** Nada que se lê fica abaixo de 12 |

### Campo de texto longo

O rótulo fica a 5 px do campo (`--espaco-rotulo-campo`). A área de texto
começa com 150 px de altura (`--campo-longo`) e cresce com o conteúdo.
A letra segue `--t-campo`, com entrelinha de 1,45 (`--entrelinha-campo-longo`).

### Decisões de tipografia

- **O título do bloco é 50, não 56** (o `hoje.html` usava 56; os lotes, 50).
  Com 56 e um apoio de duas linhas, o bloco ocupa 380 px e a linha do dia sai
  da primeira tela no 414 × 896. Com 50, ele fica em 320 e a seção seguinte
  aparece. 50 continua sendo, de longe, a maior letra da tela.
- **Quando o título passa de 12 letras, ele cai para 36** ("Café da manhã",
  "A comida de hoje foi como o plano?"). A regra é de contagem, não de
  intuição, para a implementação não precisar decidir.
- **Lugar 34, destino 28.** É a camada, não o gosto, que decide: o lugar é
  raiz e não tem voltar; o destino tem a seta e um título menor. Saber onde se
  está pelo tamanho do título é de graça.
- **Sem rótulo pequeno em caixa alta** acima de título. O título diz o assunto
  sozinho; a linha de "quando" (14 px, 700, caixa baixa) é a única coisa acima
  dele, e só no bloco do momento.
- **Comprimento:** apoio do bloco até 32 caracteres por linha e no máximo duas
  linhas; texto de explicação até 62 caracteres por linha.

## Espaço e grade

Base de 2 px, ritmo de 4. Tudo que se repete usa os tokens `--e-*`.

| Medida | Valor | Onde |
|---|---|---|
| Margem lateral | 20 | toda tela, todo bloco, toda folha |
| Entre seções | 18 | do fim de uma seção ao título da próxima |
| Título de seção → conteúdo | 10 | |
| Dentro do bloco: quando → título | 6 | |
| Título → apoio | 8 | |
| Apoio → botões | 16 | |
| Botões lado a lado | 8 | |
| Botão → saída discreta | 8 | |
| Ícone → texto, numa linha | 14 | |
| Fim de lugar (folga sobre a doca) | 120 | o último item precisa passar inteiro acima da doca |

**A grade é de uma coluna**, com quadros em 2, 3 ou 4 colunas iguais e 6 a 8
de vão. No 414 × 896, a largura útil é 374 px. Fita horizontal (poses, cartões
de treino) vaza até a borda da tela, com 20 px de folga no começo, para dizer
que continua.

## Forma

| Token | Valor | Onde |
|---|---|---|
| `--r-pilula` | 999 | botão, ficha, faixa, seletor, chave, selo |
| `--r-bloco` | 34 | as duas quinas de baixo do bloco do momento (as de cima encostam na tela) |
| `--r-folha` | 36 | as duas quinas de cima da folha |
| `--r-cartao` | 26 | cartão de escolha, cartão de treino, sugestão |
| `--r-caixa` | 22 | pergunta, aviso dentro da tela, "subir para?" |
| `--r-quadro` | 18 | quadro de número, foto em tamanho de leitura, campo |
| `--r-miniatura` | 10 | foto pequena em fita ou grade |
| círculo | 50% | marca, passo, ícone em círculo, ponto da linha do dia |

Três espessuras de linha: **1,5** (divisória, contorno quieto), **2**
(botão de contorno, campo, aviso), **2,5** (o escolhido, o "agora", o foco).

## Elevação

Só o que flutua sobre o conteúdo tem sombra, e há três:

| Camada | Sombra | Por quê |
|---|---|---|
| Doca e "+" | `--sombra-flutua` | ficam sobre o conteúdo que rola |
| Ação que gruda no topo; tira do treino aberto | `--sombra-gruda` | idem, menor |
| Folha | nenhuma; o véu faz o trabalho | a folha separa por escurecer o resto, não por sombra |

Cartão branco com sombra sobre fundo cinza não existe. Separação entre
objetos vem de preenchimento (superfície sobre fundo) ou de contorno.

## Ícones

- Phosphor Icons, peso **regular**, licença MIT. Os caminhos em grade de 256
  usam o preenchimento `currentColor`. A doca, o “+” e a série usam o mesmo peso.
- Tamanhos: 20 (dentro de linha e de ficha), 22 (no bloco e no botão), 24
  (no cabeçalho e na tela de ação), 28 (no "+").
- Ícone nunca anda sozinho onde o sentido não é óbvio: botão só com ícone tem
  nome acessível, e os únicos assim são voltar, fechar, lista, ajustes, "+",
  lixeira e repetir a fala.
- Nunca emoji, nunca caractere no lugar de desenho (a seta ▶ do protótipo da
  câmera sozinho vira o ícone de tocar).
- Na grade de Dias, câmera e régua ocupam 13 px e têm o nome acessível no dia.

## Movimento

Duas curvas: `--mola` (`cubic-bezier(.2, .9, .25, 1)`) para o que entra e o
que muda, que chega rápido e pousa macio; `--mola-sai` (`cubic-bezier(.4, 0,
1, 1)`) para o que sai, que parte devagar e some. Durações de 100 a 380 ms;
nada passa de 450 ms, exceto o enchimento do descanso.

Como cada troca se move (trocar de lugar, entrar num destino, voltar, abrir e
recolher a tela de ação, passo da mesma tarefa, estado, folha, aviso), o que
**nunca** sai do lugar e as fontes de cada regra estão em
[07-fluidez-e-estabilidade.md](07-fluidez-e-estabilidade.md).

**Nunca anima:** o número que o dedo está mexendo, dado que atualiza sem
toque, e nada que comemore.

**Reduzir movimento:** nada desliza nem escala; troca seca ou *crossfade*
curto. O descanso continua enchendo, em passos de 10%.

## Toque

- **Piso de 44 × 44** para qualquer coisa que se toca, inclusive a saída
  sublinhada (a área de toque passa do texto; o sublinhado não muda).
- **48** para as fichas de resposta ("Foi, sim", "Quase") e os passos do
  editor.
- **58** para o botão principal e o de contorno.
- **68** para "Feito" no treino e "Guardar" na medição; a câmera dispara num
  círculo de 84.
- Entre dois alvos vizinhos, pelo menos 8 de vão.

### A área do polegar no 414 × 896

Com o celular numa mão, o polegar alcança fácil a faixa de baixo (de 560 a
860 px de altura), com esforço o meio (240 a 560) e mal o topo (0 a 240).
Disso:

- **O que se aperta durante o treino e a medição mora embaixo**: "Feito",
  "Guardar a 2ª", "+30 s", "Começar já". O topo da tela de ação só tem o que
  se toca raramente (recolher, a lista).
- **No Hoje, o botão principal mora no bloco do topo**, e por isso, ao rolar,
  ele gruda no topo pequeno *e* o "+" da doca, embaixo, sugere a mesma ação
  primeiro. Quem tem uma mão chega pelo "+".
- A doca fica a 14 px da borda de baixo, acima da barra de gestos.
