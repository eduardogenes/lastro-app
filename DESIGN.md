# DESIGN.md — direção 3

O sistema visual do Lastro, aprovado em 16/11/2026. Substitui o **Instrumento**
(guardado em [docs/historico/DESIGN-instrumento.md](docs/historico/DESIGN-instrumento.md),
só como registro do código antigo, que sai na Fase 5 do
[plano](docs/redesign-3/00-plano.md)).

A referência de como cada tela é são os protótipos em
[docs/redesign-3/prototipos/](docs/redesign-3/prototipos/). Este documento dá
os valores e as regras que eles compartilham. Os valores moram em
`src/v3/tokens.css`; cor e medida soltas fora de lá são erro.

## A ideia

**A tela diz uma coisa por vez, em letra grande, com um botão só.** O que
importa agora ocupa um bloco de cor no topo. O resto é consulta, e fica
compacto embaixo.

Três consequências:

1. **Compacto onde se consulta, com respiro onde se age.** Lista, histórico e
   resumo cabem muito por tela. Registrar uma série, medir, fotografar e
   descansar tomam a tela inteira, com número gigante.
2. **Número se arrasta.** Peso, carga, repetição, medida e quantidade ficam
   numa régua. Teclado só para texto.
3. **Dá para ver o que é tocável.** Botão é pílula cheia ou de contorno. O que
   abre tem seta. O que liga tem chave. Texto solto não é botão, com uma
   exceção: a saída discreta, sublinhada ("Pulei esta", "Tirar mesmo assim").

## Tema

**Claro, sempre.** Não segue o tema do aparelho. Fundo de papel quente, tinta
quase preta, cores chapadas. Sem sombra para dar relevo, sem degradê, sem
vidro. A única sombra é a da doca de navegação e da folha, que flutuam sobre o
conteúdo.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#F6F3EC` | fundo |
| `--branco` | `#FFFDF8` | superfície de controle sobre o papel ou sobre cor |
| `--areia` | `#EBE6DA` | superfície quieta: bloco secundário, trilho, estado vazio |
| `--fio` | `#DFDACE` | divisória e contorno quieto, 1,5 px |
| `--tinta` | `#0F0F0D` | texto, botão principal, contorno forte (2 a 2,5 px) |
| `--tinta-2` | `#56554E` | texto de apoio |
| `--tinta-3` | `#77766D` | legenda; nunca sobre bloco de cor |
| `--lima` | `#D2F23A` | treino, a ação de agora, o que está selecionado |
| `--tanja` | `#FF9A4D` | refeição; e o que pede atenção ou está fora do padrão |
| `--lilas` | `#D3C6FF` | corpo, medidas, pergunta do dia |
| `--ceu` | `#BBDDFB` | semana, água, dobras |
| `--menta` | `#BEEBD2` | feito, guardado, em dia |

**A cor do bloco diz de que assunto é o momento**, não se está bom ou ruim.
Sobre qualquer bloco de cor, o texto é `--tinta` (nunca cinza) e o botão
principal é `--tinta` com texto `--papel`.

Atenção e erro usam `--tanja` com contorno de tinta e **sempre uma frase** que
diz o que houve. Não existe vermelho. Destrutivo se distingue pela palavra e
pela confirmação, não pela cor.

O ícone do app usa as cores da marca (lima `#D9FF16` sobre preto `#0E1112`),
que são outra coisa: ver [MARCA.md](MARCA.md).

## Tipografia

Duas famílias, servidas de dentro do app (funcionam sem rede):

- **Bricolage Grotesque** (`--f-titulo`): títulos, números, botões, rótulos
  curtos. Pesos 700 e 800. Entreletra de −0,01 a −0,05em, mais fechada quanto
  maior.
- **Instrument Sans** (`--f-texto`): texto corrido, apoio, legenda. Pesos 400 a
  700.

Número sempre com algarismos tabulares.

| Papel | Tamanho | Onde |
|---|---|---|
| Gigante | 92 a 132 px | o número que se lê de longe: peso, medida, descanso |
| Valor em foco | 56 a 76 px | carga e repetição da série; o título do bloco do momento |
| Título de tela | 28 a 38 px | cabeçalho fino; bloco do momento quando o texto é longo |
| Título de seção | 17 px, 700 | uma linha, caixa de frase, com nota opcional à direita |
| Nome em lista | 16 a 19 px, 700 | |
| Texto | 14 a 16 px | |
| Legenda | 12 a 13 px | **piso: 12 px** para qualquer coisa que se lê |

Sem rótulo pequeno em caixa alta acima de título. O título diz o assunto
sozinho.

## Forma e espaço

- **Raio:** pílula (`999px`) para botão, chip e trilho; 24 a 34 px para bloco;
  36 px só nas duas quinas de cima da folha; círculo para marca e passo.
- **Margem lateral:** 20 px. **Entre seções:** 18 px. **Divisória:** fio de
  1,5 px entre linhas de lista; sem caixa em volta da lista.
- **Alvo de toque:** 44 px no mínimo. Botão principal 58 px; no treino e na
  medição, 66 a 72 px.

## Os componentes

Vivem em `src/ui/v3/`. Tela nova se monta com eles; se faltar um, ele nasce lá
e entra nesta lista. Para ver todos funcionando com dados de exemplo:
`npm run dev` e abrir `/v3.html`.

| Componente | O que é |
|---|---|
| **Bloco do momento** | o topo de cor: quando, título grande, uma frase, um botão principal, no máximo um de contorno e uma saída discreta. Encolhe para uma faixa quando não há o que fazer. |
| **Cabeçalho fino** | telas de consulta e destinos: voltar, título de 28 a 34 px, uma nota ou ação à direita. Uma linha. |
| **Botões** | principal (tinta cheia), contorno (2 px de tinta), saída discreta (sublinhada). Um principal por tela. |
| **Régua** | número arrastável com passo, marcas e valor grande acima. |
| **Lista com seta** | linha de 60 px: nome, apoio, valor à direita, seta se abre algo. |
| **Chave** | liga e desliga, com nome e uma linha do que faz. |
| **Segmentos** | progresso em traços: séries do treino, poses da sessão, dias respondidos. |
| **Seletor em pílula** | duas ou três opções lado a lado. |
| **Quadro** | número com legenda, em grade de 2 a 4, para resumo. |
| **Pergunta** | bloco de areia com uma pergunta e duas ou três respostas em pílula. |
| **Folha** | sobe de baixo, com véu; tarefa curta. Fecha no véu, no Esc e no Voltar. |
| **Doca** | a navegação: pílula escura flutuante com os cinco lugares e, ao lado, o botão "+" de registrar. Encolhe ao rolar para baixo. |
| **Tela cheia de ação** | treino, descanso, medir, câmera, responder dias: fundo de cor, uma coisa por tela, botão grande embaixo. |
| **Faixa de aviso** | sem rede (areia, some sozinha) e falha ao guardar (tangerina, fica até resolver). |

## Movimento

Curva única, `cubic-bezier(.2, .9, .25, 1)`. Durações de 120 ms (toque) a
450 ms (troca de cor do bloco).

- Folha e tela cheia sobem de baixo.
- O conteúdo do bloco do momento entra em sequência curta **só quando o
  momento muda**, não a cada redesenho.
- Botão encolhe 3% ao toque.
- O descanso enche a tela de cor, de baixo para cima, no tempo do descanso.
- A doca encolhe ao rolar para baixo e volta ao rolar para cima.

Com "reduzir movimento" ligado, nada desliza nem escala: troca seca.

## O que não fazer

- Cartão branco com sombra sobre fundo cinza.
- Cinza sobre bloco de cor.
- Dois botões principais na mesma tela.
- Texto que é botão sem parecer botão.
- Formulário com vários campos numa tela quando cabe uma pergunta por tela.
- Cobrança: sequência de dias, medalha, "você esqueceu". Dia em branco é dia
  em branco.
- Ícone feito de caractere ou emoji. Ícone é desenho, traço de 2 a 2,8 px.
- Tema escuro.
