# Estratégia de testes da direção 3

Fase 0, item 5 do [plano](00-plano.md). Diz, para cada arquivo de teste, o que
fazer quando a tela que ele cobre for refeita.

## O princípio

Os testes cobram três coisas diferentes, e cada uma tem um destino:

1. **Regra de dado e de gravação** (não perder série, fundir aparelhos,
   migrar, o dia que fecha sozinho). O dado é o mesmo nos dois visuais.
   **Fica como está** e continua valendo depois da Fase 5.
2. **Comportamento que a direção 3 mantém, sobre uma tela que muda** (o Voltar
   desfaz uma camada, a régua grava a repetição, o destrutivo confirma). A
   intenção fica; o seletor e o texto mudam. **Reescrever junto com a tela
   nova**, no mesmo commit, com a mesma intenção e o nome do teste dizendo a
   regra, não a tela.
3. **Desenho e movimento do visual antigo** (o fio da aba, o pouso do número,
   a folha que sobe em X ms, o toque que escurece). **Não se porta.** Continua
   rodando enquanto a tela antiga existir e sai na Fase 5, junto com ela. O
   movimento da direção 3 tem regras próprias (DESIGN.md, Movimento) e ganha
   testes próprios quando for construído.

Regra de convivência até a Fase 5: **o visual novo não pode quebrar teste do
antigo.** Com o interruptor desligado o app é o de antes, e a suíte inteira
roda contra ele. Os testes das telas novas ligam o interruptor
(`localStorage['lastro-visual'] = '3'`) antes de abrir o app.

## Os 61 arquivos de `tests/fluxo/`

### 1 · Ficam como estão (regra de dado e gravação)

`ajuste`, `aulaimport`, `carga`, `ciclo`, `cronometro`, `dados`, `diario`,
`edicao`, `endereco`, `esquecido`, `fluxo`, `fusao`, `gravacao`, `horario`,
`leitura`, `migracaochave`, `portas`, `programa`, `promocao`, `publicacao`,
`retro`, `ritmo`, `sessao`, `sincronia`, `trocaprograma`, `avanco`.

Alguns abrem uma tela para chegar ao dado. Quando a tela antiga sair (Fase 5),
o caminho troca para a função do app (`CTX.*`) ou para a tela nova; a
asserção sobre o dado não muda.

### 2 · Reescrever com a tela nova (mesma regra, tela nova)

| Arquivo | A regra que fica | Fase |
|---|---|---|
| `protocolo` (137 casos) | as 11 poses, a ordem, o ajuste uma vez, a foto torta, a sessão que não perde pose, o modo sozinho | 1 · Fotos |
| `fotos` | a foto do aparelho por exercício | 3 · Treino |
| `corpo` (78) | média semanal, as regras de ajuste, medir com segunda leitura | 2 · Corpo |
| `serie`, `regua`, `teclado` | a série grava ao confirmar; o número vem da última vez; corrigir não perde | 3 · Treino |
| `descansa`, `contador` | o que se faz no descanso; o contador diz o que o dado diz | 3 · Treino |
| `telaprograma`, `revisao` | mexer no programa vale a partir do próximo treino; revisão escolhe o que entra | 3 · Treino |
| `aula`, `lousa` | aula do box (último item do lote 3) | 3 · Treino |
| `agora` (81) | a regra do cartão de cima mora em `dominio/agora.ts` e fica; a parte de tela vira o bloco do momento | 4 · Hoje |
| `cardio`, `turno`, `planoalimentar` | registro do cardio, turno do dia, o que tem em cada refeição | 4 |
| `navegacao`, `camadas` | Voltar desfaz uma camada; folha isola o que está atrás e devolve o foco | 0 · com a folha nova, e em cada fase |
| `estados`, `pare` | estado ruim diz o que houve e não perde entrada; destrutivo confirma com o que se perde | em cada fase |
| `telas` (67) | separar: regras de dado ficam; regras do visual antigo saem na Fase 5 | 5 |

### 3 · Saem na Fase 5 com o visual antigo

`aba`, `acende`, `aviso`, `cena`, `dedo`, `descanso`, `enche`, `frio`,
`lugar`, `movimento`, `pouso`, `sobe`, `toque`, `troca`.

São medidas do movimento do Instrumento (docs/historico/motion). Dois
princípios deles valem para o visual novo e ganham teste novo quando a tela
existir:

- **O toque nunca espera** (`frio`): o primeiro toque na série não monta o
  desenho dentro dele.
- **O dedo não perde o lugar** (`dedo`): a linha tocada fica onde estava
  depois do toque.

`enche`, `sobe` e `troca` às vezes falham quando a suíte inteira roda em
paralelo nesta máquina e passam sozinhos; antes de tratar como regressão,
rodar o arquivo isolado.

## `tests/dominio/estilo.test.ts`

Mede as folhas do visual antigo (`FOLHAS`) e fica como está até a Fase 5,
quando sai junto delas. As folhas novas (`src/v3/`) estão declaradas em
`FOLHAS_V3` só para não passarem sem ser vistas.

As regras do visual novo têm guarda própria em
`tests/dominio/estilo-v3.test.ts`:

- cor só em `src/v3/tokens.css`; fora dele, só `var()`;
- nenhuma classe `ins-` em `src/ui/v3/`, nenhuma classe `v3-` nas telas antigas;
- sem tema escuro (`prefers-color-scheme: dark`, `data-theme="dark"`);
- texto nunca abaixo de 12 px nas folhas novas;
- ícone desenhado: nenhum emoji nem símbolo de texto como ícone em `src/ui/v3/`;
- "reduzir movimento" desliga animação e transição.

## Os testes das telas novas

Cada tela nova leva, no mesmo commit:

- os casos da tabela 2 que ela herda, reescritos;
- um caso por estado que o contrato de UX pede (vazio, e erro quando há
  câmera, arquivo ou conta);
- **conferência de mutação** nos casos que guardam dado: desfazer a correção
  e ver o caso ficar vermelho antes de dar a tela como pronta.
