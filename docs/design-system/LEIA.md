# Design system do Lastro

O design system da direção 3, montado a partir dos protótipos em
`docs/redesign-3/prototipos/`. Aprovado pelo dono; é a referência de toda
tela. `DESIGN.md` e `docs/LASTRO_UX_CONTRACT.md` apontam para cá, e a
auditoria é o plano da implementação (o prompt dela está no `06`).

## O que tem aqui

| Arquivo | O quê |
|---|---|
| [00-inventario.md](00-inventario.md) | o inventário de telas e estados, as divergências entre os protótipos e as respostas do dono |
| [01-fundamentos.md](01-fundamentos.md) | cor (com os pares de contraste medidos), tipografia, espaço, forma, elevação, ícones, movimento, toque |
| [tokens.css](tokens.css) | os tokens, nomeados pelo papel, prontos para a implementação |
| [02-componentes.md](02-componentes.md) | 24 componentes: anatomia, variantes, estados, conteúdo, acessibilidade, o que não fazer |
| [03-padroes-e-voz.md](03-padroes-e-voz.md) | os padrões de comportamento e a voz |
| [07-fluidez-e-estabilidade.md](07-fluidez-e-estabilidade.md) | como as telas se movem, o que nunca sai do lugar, e as fontes (livros, Apple, Material, NN/g) |
| [04-telas-e-fluxos.md](04-telas-e-fluxos.md) | as 84 telas, com estados e de onde se chega (gerado da página viva) |
| [05-auditoria.md](05-auditoria.md) | o que o app construído faz diferente, com a correção (gerado de `ds-auditoria.js`) |
| `lastro.html` + `ds-*.js` | a página viva: galeria, telas navegáveis, mapa dos fluxos, auditoria. Abre sozinha no navegador (precisa de `tokens.css` e dos `ds-*.js` ao lado) |
| `inventario.html` | a página da etapa 1, com as perguntas |
| [06-prompt-implementacao.md](06-prompt-implementacao.md) | o prompt do chat que implementa o design system no app |
| `.claude/agents/revisor-de-design.md` (na raiz) | o agente que revisa cada peça implementada contra o design system |
| `.claude/agents/revisor-de-dado.md` (na raiz) | o agente que revisa, em esforço máximo, toda peça que mexe em dado salvo ou regra |

## Andamento

| Etapa | Estado |
|---|---|
| 1. Leitura e inventário | feita em 17/11/2026; o dono respondeu as três perguntas |
| 2. Fundamentos e tokens | feita |
| 3. Componentes, com a galeria | feita |
| 4. Telas e fluxos | feita: 84 telas, 174 estados |
| 5. Auditoria da implementação | feita: 39 achados, 3 de dado (4 de fluidez, acrescentados depois) |
| 6. Revisão final | feita: Chromium e WebKit a 414 × 896, sem erro, sem rolagem lateral, sem alvo abaixo de 44 nem texto abaixo de 12 |

## Implementação no app

As peças do `06-prompt-implementacao.md`, na ordem. Cada achado feito fica
marcado em `05-auditoria.md` com o commit.

| Peça | Estado |
|---|---|
| 1. Documentos (`DESIGN.md` e o contrato apontam para cá) | feita |
| 2. O que se perde, e a fluidez | feita (`f5df85a`): Ajustes alcançável, a tira do treino aberto, o aviso com "Desfazer", a porta do movimento religada, as âncoras da tela de ação |
| 3. Tokens e componentes base | feita (`933171b`), depois da revisão: `src/v3/tokens.css` é cópia do design system (nomes por papel, guardada por teste), e o bloco, os botões, a saída, o seletor e as fichas como escolha única, a chave, os quadros, as faixas e a régua com as medidas de lá |
| 4. Treino | feita (`318532f`), depois da revisão: a série com o par e uma régua só, sem rolar; o descanso com o "a seguir" e "Água +1"; o fim; pôr em dia como tela; a aula do box como tela de ação. O principal tem o mesmo retângulo em série, descanso e fim |
| 5. Hoje, Dias, Corpo, Fotos, Semana, Plano, Ajustes | feita: Hoje feito (`1d2421d`) (o bloco em cada momento, a ação que gruda no topo, a exceção da refeição na folha, "Desfazer" no Comi, na noite e no lembrete, as faixas de estado com ícone e "Ver"); Dias (`12c15b0`, e o dia aberto, a sessão passada e a série passada, `e6a969c`); Corpo (`7418d77`); Semana (`0d32ca0`); Ajustes (`053e632`); Plano, e Semana e Fotos depois da revisão: o que vence hoje em destaque, o toque duplo nas respostas travado, "Aplicar no plano" com Desfazer, os dias de treino como círculos, a câmera sem rolar e com o disparo parado, apagar foto sem pergunta e com Desfazer, rádios e alvos de 44 |
| 6. Os três de dado | feita: o tamanho do "comi outra coisa" feito (`f3f82c0`: a folha com quatro respostas e "✓ Guardar", a marca `'fora'` com o tamanho, a fusão, a cópia, a pasta dos agentes; e, achados nas revisões, a lápide antes da união, a correção do pôr em dia pela lápide, a porção que segue a marca). A revisão do treinador mudança por mudança (o programa do treinador é a revisão inteira, o dele recebe as marcadas, o que fica de fora é diferença; desfazer). Parte 2 feita em `1aa7977`, depois de três rodadas das revisões de dado e de design (o toque duplo em Aplicar, "Tentar de novo" que aplica, os carimbos restaurados na falha, a aula e a lista numa chave só). Parte 3 (a primeira vez em três passos) feita, depois de seis rodadas da revisão de dado e três da de design (a primeira fusão com a conta: o trio de treino em bloco, plano e cadência decididos pelo conteúdo, catálogos unidos, o carimbo do aparelho que vence acima do da conta, entrar de novo sem desfazer edições; a âncora a 762 e o cabeçalho no WebKit). Peça 6 concluída em `f2fd688` |
| 7. Revisão final | feita (20/11/2026): varredura de cerca de 40 estados em Chromium e WebKit (`conferir-app.mjs`), 16 achados e o acabamento corrigidos, cinco divergências do design system decididas; depois de duas rodadas, as revisões de dado e de design aprovaram. Ficaram de fora, sem conferência no navegador: fotos e câmera, medidas, editor e catálogo, pôr em dia e dor. Pendente do dono: a leitura da foto da lousa |
| Calendário de Dias e ícones Phosphor | feita (`a4e2922`). O resumo e a legenda acompanham o mês inteiro. A sessão cobre a resposta até o último treino ser apagado. A cópia e a conta conservam o motivo, e o espelho conta as faltas visíveis. Voltar de um dia mantém a data escolhida. A galeria acompanha os 44 ícones regulares do app. Na rodada 1, a grade e a legenda foram conferidas no DOM do app e da página viva. A medição após as correções, a 414 × 896, segue pendente pelo bloqueio de IPC em Chromium e WebKit. |
| Registrar um treino | feita (23/11, `feat(registro)`). Dias, Hoje e + usam o mesmo cartão. A escolha final grava o turno, as séries ou a presença. O cardio pode ficar sozinho ou acompanhar qualquer resposta. Os testes cobrem a cópia, a fusão e o espelho. A comparação visual a 414 × 896 aguarda um ambiente com IPC liberado para Chromium e WebKit. |

**Peça 6, parte 3.** O aparelho novo começa com os dois catálogos e traz a
própria prescrição. Os três passos aceitam pular. Conta e cópia ficam na saída
do primeiro passo. O campo opcional e a precedência dos documentos na fusão
estão em [Estado persistido](../ARQUITETURA.md#primeiro-acesso-e-prescrição-embutida).
A 414 × 896, o botão principal tem x 20, y 762, largura 374 e altura 58 px
nos três passos. O build e a página viva coincidem em Chromium e WebKit. No
build, a medida também se repete com movimento reduzido. A
[sonda de navegador](conferir-primeira-vez.mjs) confere os 12 retângulos.
O título mantém x 56 e Voltar ocupa x 8 nos passos 2 e 3, inclusive na volta.
Na quarta rodada, o programa da conta passou a trazer consigo a sequência e a
referência do treinador, inclusive a referência embutida do dono. O plano
alimentar da conta conserva os alimentos próprios que só o aparelho tem. Os
exercícios exclusivos mantêm nome, grupo e séries. Entrar de novo, inclusive
depois de a sessão expirar, respeita as edições feitas no intervalo. O texto colado pode ser
reaberto no aviso e no histórico. O dia de comida respeita a exclusão da última
marca e reúne marcas do dia aberto com o fechado na mesma versão do plano.
Na quinta e na sexta rodadas, o plano alimentar e a cadência da conta só vencem
com conteúdo (ao menos uma refeição, ao menos um dia de treino), a biblioteca de
alimentos se une nos dois sentidos e, quando o aparelho vence a primeira fusão,
o carimbo dele passa o da conta, para a fusão seguinte não desfazer a decisão.
As revisões de dado e de design aprovaram (20/11/2026).

**Peça 7, revisão final.** O Hoje ganhou a linha completa, os rótulos falados, o ritmo por treino, a estimativa em minutos e a linha única quando a comida está desligada. A folha de falha tem um principal (C1). A Bricolage inclui o eixo óptico (C2). Entraram as folhas de mudar o treino, anotar dor e colar a aula, o histórico por mês e os ajustes de Registrar, Dias, Progressão, Corpo e fim do treino. A foto da lousa serve para consulta. A importação de movimentos continua pelo texto de aula no formato do Lastro.

**Pendente para o dono · foto da lousa.** A página viva promete “o app lê os movimentos” e mostra “Lousa lida: 6 movimentos” no estado `aula--lousa`. O app guarda a foto para consulta. O dono decide entre ajustar a referência ao comportamento atual e abrir uma peça própria para ler os movimentos da foto.

Decisões incorporadas na revisão final:

- **Q1.** Às 12h40 o almoço das 12h30 continua no topo até receber resposta. A janela da próxima refeição tem prioridade. A mudança é de leitura.
- **Q2.** O denominador das gotas usa tinta, inclusive sobre o nível de água.
- **Q3.** A saída da troca de lugar dura 100 ms no app e na referência.
- **Q4.** Dias permite navegar pelos meses e escolher o dia também na página viva.
- **Q5.** No Corpo pesado, “Guardado hoje” é o principal. “Ver tudo na mesma data” usa contorno.

**Como conferir.** Depois do build, rode `node docs/design-system/conferir-app.mjs chromium` e repita com `webkit`. O [roteiro local do revisor](conferir-app.mjs) percorre os estados a 414 × 896 e mede rolagem, alvos e âncoras. A [sonda da primeira vez](conferir-primeira-vez.mjs) recebe os mesmos nomes de motor e mede o título e o botão dos três passos depois da troca da fonte.

**Pendências da revisão final.** Ficam a fita de treinos no Plano, o veredito e “O que a regra olha” na Semana, a folha do cardio, os quadros de bioimpedância, as miniaturas da última sessão de fotos, a apresentação de Medidas em Ajustes, o minigráfico da Progressão, “Comi o almoço” em Registrar fora da janela e Desfazer no histórico de mudanças. A varredura visual também deixou para outra passagem câmera e protocolo de fotos, medidas e bioimpedância, editores e catálogos, compras, registros passados, dor e menu da sessão, Hoje sem rede ou parado, listas e nomes longos e retorno do foco.

Pendências de dado da peça 6:

- **C3 · Módulos entre aparelhos pessoais.** As escolhas da primeira vez ficam
  sem carimbo. Uma sincronização pode esconder módulos escolhidos no outro
  aparelho. Os registros continuam guardados.
- **Riscos de dado aceitos** (revisão de dado, 20/11). Nenhum perde registro:
  um controle de sincronia antigo (sem `jaSincronizou`) num perfil pessoal trata
  a próxima entrada como a primeira, o que só uma reversão de versão reproduz;
  um alimento próprio apagado de propósito antes da primeira sincronia pode
  voltar à biblioteca (não há lápide de alimento); com nenhum dos lados tendo
  programa, uma referência do treinador guardada substitui a outra sem aviso (o
  texto colado continua no histórico).

Pendências que a revisão da peça 2 deixou para depois, de propósito:

- com leitor de tela, o aviso com "Desfazer" ainda some em 6 s (o 02 pede que
  fique até ser dispensado);
- Ajustes aberto pela folha "O que aparece": ao voltar, o foco cai no título
  do Hoje, e não no ícone que abriu a folha;
- "Encerrar" pela folha da lista do treino: duas trocas no mesmo toque viram
  uma só (`fica`), em vez de `passo`;
- (feito na peça 4) a série com uma régua só, o "Feito" e o topo do treino.

Pendências que a revisão da peça 3 deixou para a peça 5 (são de tela, não de
componente):

- Corpo: "Guardar 76,7 kg hoje" aparece tracejado mas funciona; a referência
  diz "Arraste a régua para pesar hoje" na espera e, já pesado, um principal
  cheio que desfaz;
- (feito com Dias) depois de responder, a pergunta fica, com a resposta
  marcada, para corrigir;
- Hoje: o cardio enche em céu (a cor da água); na referência, em lima;
- folha da refeição: "Comi outra coisa", "Não comi" e "Não sei" em menta (a cor
  de feito); a referência usa linhas de opção. No menu da sessão, o treino
  atual em atenção;
- faixas de estado: 8 do topo e 6 entre elas, com ícone, e "Ver" na de falha,
  como a referência.

Pendências que a revisão da peça 4 deixou, de propósito:

- a lista do treino ainda não muda a ORDEM de hoje (as setas de subir e
  descer da referência): pede uma regra nova de ordem do dia, que hoje só
  existe como "fazer depois"; entra com a peça do Plano ou como peça própria;
- a lista rápida da aula ainda tem dois campos digitados por movimento; a
  referência tem um número por movimento, numa pílula que abre a folha de
  quantidade (a régua);
- a série de um exercício trocado hoje ainda não diz "no lugar de …" (o dado
  do foco não traz o nome original).

Pendências que a revisão do Hoje deixou:

- a folha do cardio ainda é a antiga (minutos em fichas, duas intensidades,
  "Registrar 25 min de bike"); a referência tem régua de minutos, três
  intensidades e "Guardar". As opções são do dado (o que o cardio guarda), e
  mudar pede decidir com o dono;
- a folha da refeição já marcada não diz a hora da marca ("marcado às
  12h52"): o app não guarda essa hora;
- "Corrigir o que comi" continua na refeição marcada (a referência não tem):
  é o caminho para corrigir o registro;
- as camadas (`z-index`) do app ainda são números próprios, não os tokens
  `--camada-*`; a ordem entre elas está certa;
- a 414 × 896, o Hoje rola pouco, e a ação que gruda no topo quase nunca
  aparece (o mesmo na referência); aparece em tela menor.

Pendências que a revisão de Dias deixou (o dia aberto e o que se corrige nele
vêm em seguida, na mesma peça):

- a conta de "respondidos" é dos 13 dias fechados antes de hoje; a referência
  fala em 14. O design system precisa dizer se hoje entra na janela (é a regra
  do nutricionista, e muda nela pedem decidir com o dono);
- "voltar um" em responder os dias mostra a resposta já dada, mas não a apaga
  (apagar uma resposta não existe no dado ainda);
- a hora sem zero à esquerda ("6h08") vem de `horaDeMinutos`, usada em várias
  telas; o "No mês" já completa, as outras telas entram quando forem feitas.
- a hora da sessão passada ainda se corrige no painel (campo e fichas de
  duração), não na folha com a régua de cinco em cinco minutos;
- no dia aberto, as refeições ainda não abrem a folha da refeição (ela é do
  dia de hoje); "Corrigir refeição por refeição" leva à folha do dia passado;
- o quadro tocável tem contorno de divisória (1,3:1), na referência e no app;
  o design system precisa decidir o contorno de quadro que se toca.

Pendências que a revisão do Plano e da Semana deixou (desenho que ainda não é
o da referência; nada perde dado):

- os treinos ainda em lista vertical; a referência é a fita de cartões grandes,
  o de hoje em lima, com "· 1 diferença";
- criar treino ainda abre o `prompt()` do navegador; a referência é a folha
  com o nome e "Do zero / Copiando um" (copiar não existe no app);
- responder uma mudança "Passa a valer" ainda não tem Desfazer (desfazer
  mexe no programa: entra com a revisão mudança por mudança, peça 6); o toque
  duplo está travado;
- a linha da mudança não diz de que sessão veio ("no treino B de 09/11");
- a comida do Plano ainda com o número gigante e os botões Alimentos/Compras;
  a referência tem a nota de kcal e a linha "Lista de compras"; a comida
  desligada como linha apagada;
- a Semana: título do veredito curto ("Pode subir.") com o porquê no apoio,
  a saída "Ainda não", o alvo por região nas barras, os atalhos com o dado,
  "O que a regra olha" na voz da referência e nos três estados, a folha
  "Aplicar" dizendo o que muda no arroz;
- a retrospectiva sem o mini gráfico, o selo "parado" e "Copiar para o
  treinador";
- diferenças e histórico de mudanças do programa sem "Desfazer" por linha;
- editor, progressão e exercício: "Voltar ao do treinador", o mini gráfico, as
  datas no gráfico;
- quantidade da comida: título do alimento, kcal, "Usar esta quantidade"; o
  foco ainda cai no corpo da página ao abrir a régua; tirar alimento ainda
  pergunta em vez de desfazer;
- folhas da refeição, nova refeição (hora pela régua), alimentos (lupa,
  "Criar “tapioca”"), alimento (vírgula nos números) e compras (marca redonda,
  `checkbox`, "Copiar a lista").

Pendências da peça 6, parte 2, após a terceira rodada de revisão:

- Reconhecer a mudança de ordem que já está no programa pessoal. Hoje ela
  entra na contagem de aplicadas e pode bloquear um treino aberto.
- Durante os 6 s do Desfazer, uma fusão pode substituir o aviso por
  “Do outro aparelho: …”. O dado fica preservado.
- A fusão de `prog` usa o documento inteiro. Uma edição mais recente em
  outro aparelho depois da revisão pode substituir o programa pessoal inteiro.
- Medir o aviso compartilhado nas fotos e em “Pulado hoje”. O caminho do Hoje
  foi conferido.
- Antes do iOS 18.4, `match-element` não dá nomes às seções. A troca de
  estado usa a dissolução da página inteira.
- "Tentar de novo" sobre um estado mudado por fusão: se outra revisão chegou
  do outro aparelho entre a falha e o toque, pode entrar uma mudança que a
  pessoa não viu (marcada por padrão). O Desfazer funciona. Correção: guardar
  as chaves confirmadas no toque que falhou e, se as recalculadas forem
  outras, mostrar a lista em vez de aplicar.
- O Desfazer não arquiva de novo um exercício com histórico que a revisão
  desarquivou (`usado()` o protege); ele fica visível nas listas.

Pendências que a revisão da peça 6 (o tamanho do "comi outra coisa") deixou:

- o "+": o principal da referência é uma linha com o ✓ à direita ("Comi o
  almoço · 719 kcal · como o plano"); o do app é coluna, com outro texto
  ("Comi: Almoço · como o plano"). As medidas das sugestões já são as de lá;
- o dia aberto: hora sem o zero ("5h45"), linhas sem "· como o plano", a nota
  "5 de 7 com marca" em vez de "foi como o plano", e a linha do treino dentro de
  "A comida do dia";
- a 375 px, o apoio da folha do tamanho vai a três linhas com "café da manhã" e
  "lanche da tarde" (a 414, duas).

Questões para o design system (não são do app):

- as respostas grandes (`.sug`) são areia sobre papel, sem contorno (1,12:1); a
  lista de conferência pede contorno de controle a 3:1, e o 02 §5 dá contorno às
  fichas de resposta. Dizer se `.sug` leva `--contorno`;
- a página viva fecha as duas folhas no Voltar depois de uma troca; o 02 §8 diz
  que o Voltar devolve a primeira, e o app segue o 02 na folha do tamanho.

Pendências que a revisão de Fotos deixou:

- a câmera: a tela de permissão antes de pedir, "abrindo" e "bloqueada"
  dentro do visor com o mesmo esqueleto; o visor que absorve a altura (as luzes
  e a fala ainda andam conforme o aviso);
- o centro das fotos: o título grande, "Quinta, 26 de novembro.", a primeira
  vez com "Começar" e "Ainda sem foto", a sessão pela metade com título
  próprio ("6 de 11 fotos", "Continuar") e a grade de 11 com "Encerrar com 6
  de 11";
- o fim da sessão com "Comparar com 06/07" como principal, a duração, e o fim
  "Próxima";
- nova sessão: a ficha "lente 1×" e "O preparo" como linha antes do principal;
- comparar: quadros de data em 22, a foto dentro da folha da foto comparada,
  "Mandar" com Desfazer e o estado sem rede;
- galeria com 6 por sessão e "ver as 11"; lixeira com "Restaurar", "some em 27
  dias" e a folha "Apagar as 2 de vez?";
- a sugestão de alinhamento com o texto concreto e "Ver como fica / Aceitar /
  Agora não".

Protocolo (só apontado; nada sai sem o dono): as falas das poses, "O preparo"
e as guias do Ajustar divergem entre o app e a referência. O app segue o
protocolo atual (`docs/fotos/01-captura.md`); a referência parece mais velha.
É o design system que precisa ser corrigido, com o dono.

Pendências que a revisão do Corpo deixou. O que perdia registro foi corrigido,
com duas rodadas do revisor de dado: cada medida é gravada quando FECHA pela
regra (as leituras batem, a terceira decide, ou "Guardar só esta"); recolher
no meio não grava a medida em curso, incompleta, e o aviso diz que ela ficou de
fora; reabrir começa pela primeira medida que ainda não foi medida hoje, e a
que já foi diz "medida hoje às … · medir de novo substitui".

- a medida em curso não guarda rascunho para retomar depois de recolher (o 03
  pede que a tela de onde veio mostre como retomar);

- apagar pesagem, medida ou leitura de bioimpedância ainda pede confirmação;
  a referência apaga na hora com "Desfazer". Desfazer um apagar precisa de
  devolver o registro passando pela lápide da fusão: é peça de dado;
- uma leitura de bioimpedância ainda não se corrige (só se apaga);
- telas ainda no desenho antigo, para refazer como a referência: o cartão com
  o boneco e a fita desenhada em "Medir" e na medida; o Corpo vazio ("Uma
  pesagem não faz linha" e "Também dá para acompanhar"); a bioimpedância (4
  quadros, a mini-linha, os textos); a nova leitura de bioimpedância como tela
  de ação de 3 números; "Tudo na mesma data" com o gráfico, o cursor e a foto;
  as datas no eixo dos gráficos; a folha "O que medir";
- a hora com dois-pontos ("06:46") em pesagens e medidas;
- o número grande usa algarismo tabular (o 07 pede, para 57,5 virar 60 sem
  sacudir); a referência usa o proporcional. O design system precisa escolher;
- "Guardado hoje" no Corpo abre a correção da pesagem; na referência ele
  desfaz. Decisão de desenho tomada aqui: corrigir serve aos dois casos (o
  número errado e o apagar) sem precisar do desfazer de um apagar.

Pendências da Semana:

- as barras das séries mostram feitas e as que ainda vêm, na escala da maior
  região; o "alvo 28" da referência não aparece, porque o app calcula o alvo
  por rotação, não por semana (mostrar um como o outro enganaria). O design
  system precisa dizer qual alvo a Semana mostra;
- o terceiro critério da regra ("Força: ainda sem dado") só aparece se o dado
  da regra o trouxer.

## As páginas publicadas

O dono usa duas contas do claude.ai, e cada link só abre na conta em que foi
publicado. Os arquivos desta pasta são a fonte: se um link não abrir, tente o
da outra conta, ou republique a partir do arquivo.

| Página | Arquivo | Conta | Link |
|---|---|---|---|
| Design system (página viva) | `lastro.html` | conta 2 (a ativa no fim de 17/11) | https://claude.ai/artifact/PFrpbTTnk6s21oLbhHrmR7 |
| Inventário e perguntas | `inventario.html` | conta 2 | https://claude.ai/artifact/SnTxCM5zP8mzASQT4ukHGJ |
| Inventário e perguntas | `inventario.html` | conta 1 (a do começo de 17/11) | https://claude.ai/artifact/EKoMcaBWCBMfk69nT49pyo |

A página viva ainda não foi publicada na conta 1.

## Para conferir de novo

`node docs/design-system/conferir.mjs chromium /tmp/saida` (ou `webkit`) percorre
todas as telas e estados a 414 × 896 e lista erro de página, rolagem lateral,
alvo menor que 44 e letra menor que 12. Com `fotos` no fim, guarda uma imagem
de cada tela na pasta. O caminho do Chromium dentro do roteiro aponta para
`~/.cache/ms-playwright/chromium-1254`; ajuste se a versão mudar.
