# 05 · Matriz de comportamento de navegação

A referência objetiva para não voltar a divergir. Tela nova preenche uma linha
aqui antes de ser considerada pronta ([checklist](../LASTRO_UX_CONTRACT.md#checklist-de-tela-nova)).

Legenda de saída: **Voltar** = ‹ voltar, botão do sistema e gesto fazem a mesma
coisa · **Fechar** = `×`, véu ou Esc · **Aba** = tocar em outro destino.

## Abas · top-level

| Tela | Tipo | Cabeçalho | Back | Tab bar | Ação fixa | Modal | Scroll ao entrar | Scroll ao voltar | Teclado | Área segura | Saída |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Hoje** | A | Raiz + botão de estado | não | sim | não | folha | topo | — | tab bar some | topo + base | Aba |
| **Treino** | A / H | Próprio, relógio sticky | não | sim | não | folha (foto) | topo | — | tab bar some | topo + base | Aba |
| **Comida** | A | Próprio, 3 modos | não | sim | não | folha | topo | — | tab bar some | topo + base | Aba |
| **Dados** | A | Próprio, 2 modos | não | sim | não | — | topo | — | tab bar some | topo + base | Aba |
| **Guia** | A | Próprio + índice | não | sim | não | — | topo | — | tab bar some | topo + base | Aba |

**Modos internos.** COMIDA (plano · alimentos · compras) e DADOS (corpo ·
treino) usam `Chips` e guardam o modo em estado do componente, não em `view`:
trocar de aba desmonta a tela e o modo volta ao padrão. É o comportamento
desejado — voltar ao DADOS é voltar ao veredito.

Na raiz de uma aba o Voltar **sai do app** — é o comportamento certo, e não se
intercepta.

## Destinos de tela cheia

Todos: `TelaCheia` · `‹ voltar` primeiro · `h1` recebe foco ao entrar · **sem
tab bar** · entra no topo · **volta na posição de leitura anterior** · área
segura no topo.

| Tela | Tipo | Abre a partir de | Ação no topo | Scroll ao voltar | Observação |
|---|---|---|---|---|---|
| Histórico do exercício | B | cartão de exercício | — | restaura | ao voltar, reabre o cartão de origem |
| Detalhe da sessão | B | Dados, listas | — | restaura | leitura primeiro |
| Programa | D | Guia, Treino | modo | restaura | 4 modos internos |
| Retrospectiva | B | Dados | — | restaura | só leitura |
| Registro retroativo | D | Treino, calendário | — | restaura | 2 caminhos |
| Decisão de fim | G | fim de sessão com mods | — | restaura | sair mantém o conservador |
| Protocolo de fotos | G | Dados | — | restaura | 9 poses em sequência |
| Comparar fotos | B | Protocolo, Dados | — | restaura | — |
| Ajuste de foto | D | Protocolo | salvar | restaura | sair descarta, nada a perder |
| Câmera | G | Protocolo | — | restaura | permissão pode faltar |

## Folhas

Todas: `Folha` · `role="dialog"` + `aria-modal` · **foco entra ao abrir** ·
**fundo fica `inert`** · **foco volta ao acionador ao fechar** · corpo travado
com `position: fixed` · scroll da página **preservado** · fecham por `×`, véu,
Esc e Voltar.

| Folha | Nível | Abre a partir de | Ação primária |
|---|---|---|---|
| Refeição | 50 | timeline de Hoje | marcar |
| Seletor de dia | 50 | botão de estado de Hoje | confirmar cadência |
| Editar refeição | 50/80 | ··· da refeição | salvar |
| Seletor de alimento | 70 | editar refeição | escolher |
| Editar alimento | 80 | seletor de alimento | salvar |
| Foto do aparelho | 50 | cartão de exercício | — |

Três níveis é o teto. Uma quarta folha é redesenho.

## O Voltar, em uma frase por caso

| Situação | O Voltar faz |
|---|---|
| Folha aberta (uma ou três) | fecha **uma**, a de cima |
| Destino aberto | volta à aba, restaurando a posição |
| Destino sobre destino (protocolo → ajuste) | volta ao de baixo |
| Folha sobre destino | fecha a folha, o destino fica |
| Raiz de aba | sai do app |
| Durante treino ativo, na aba | sai do app — a sessão está gravada e volta ao reabrir |

## Custo em toques

| Tarefa | Antes | Depois |
|---|---|---|
| Registrar uma série repetindo a carga anterior | 2 toques + 2 campos digitados no teclado virtual | **1 toque** |
| Iniciar o descanso entre a série 1 e a 2 | 1 toque (achar "DESCANSO 3MIN") | **0** — começa sozinho |
| Registrar 3 séries iguais de um exercício | ~9 interações | **3 toques** (medido) |
| Sair de uma folha | `×` | `×` **ou** Voltar do sistema |
| Voltar de uma lista longa e continuar de onde parou | reencontrar o lugar à mão | **0** — restaura |
| Esticar o descanso quando a máquina está ocupada | parar e recomeçar na mão | **1 toque** em `+15` |
| Achar uma regra do treinador no guia | rolar até cinco telas de prosa | ler 14 títulos, abrir uma |

## Altura das abas, em telas de 844px

| Aba | Antes | Depois |
|---|---|---|
| Guia | 6.945px · **8,2** | 3.623px · **4,3** |
| Dados | 3.955px · **4,7** | corpo 1.613px · **1,9** · treino 2.586px · **3,1** |
| Hoje | 1.317px · 1,6 | igual |
| Treino | 1.501px · 1,8 | igual |
| Comida | 844px · 1,0 | igual |
