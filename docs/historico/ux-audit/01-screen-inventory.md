# 01 · Inventário de telas e estados

Levantado do roteador (`view` em `src/main.jsx`), de `telaCheia()`, de
`folhaAberta()` e da navegação real no navegador. Não confia no que a interface
mostra: telas alcançáveis só com sessão aberta ou só com histórico foram
semeadas com estado de teste e auditadas do mesmo jeito.

## Como a navegação funciona hoje

Não há router nem URL. Três mecanismos empilhados:

| Camada | Onde mora | Quem decide |
|---|---|---|
| **Aba** | `view.aba` | `TabBar` → `CTX.vaiPara` |
| **Destino de tela cheia** | 10 flags independentes em `view` | `telaCheia()`, por **ordem de prioridade** |
| **Folha (bottom sheet)** | `view.pilha`, array | `CTX.abreFolha` / `fechaFolha` |

`telaCheia()` é uma cadeia `if` em ordem fixa (câmera → ajuste → protocolo →
comparar → promo → prog → retro → add → sessão → hist). Duas flags ligadas ao
mesmo tempo não empilham: a de maior prioridade **esconde** a outra. Ver
[03-screen-audit](03-screen-audit.md) §S-01.

## A. Abas (top-level destinations)

| Tela | `view.aba` | Componente | Entra por | Sai por | Rolável | Cabeçalho | Tab bar | Ação fixa |
|---|---|---|---|---|---|---|---|---|
| **Hoje** | `hoje` | `telas/hoje.jsx` | tab bar; boot | tab bar | sim | `Cabecalho` + botão de estado | sim | não |
| **Treino** | `treino` | `telas/treino.jsx` | tab bar; cartão-foco de Hoje | tab bar | sim | próprio (relógio sticky) | sim | não |
| **Comida** | `comida` | `telas/comida.jsx` | tab bar | tab bar | sim | próprio, 3 modos | sim | não |
| **Dados** | `dados` | `telas/dados.jsx` | tab bar | tab bar | sim | próprio | sim | não |
| **Guia** | `guia` | `telas/guia.jsx` | tab bar | tab bar | sim (a mais longa) | próprio + índice "IR PARA" | sim | não |

**Estados por aba**

- **Hoje** — primeiro uso (sem histórico), dia de treino, dia de folga, sessão
  aberta, sessão encerrada, refeições marcadas/não marcadas, dia previsto vs.
  confirmado.
- **Treino** — sem sessão · sessão aberta · sessão pausada · deload · dia
  editado (mods) · exercício aberto/fechado · exercício pulado · bi-set ·
  primeiro uso (`0 sessões`) · modo edição do dia.
- **Comida** — modos `PLANO` · `ALIMENTOS` · `COMPRAS`; plano vazio; item sumido
  do catálogo.
- **Dados** — sem medida ("Faltam dados") · com peso e cintura · veredito
  calculado · calendário do mês · cardio da semana.
- **Guia** — sempre cheia (é referência); sub-blocos: A SEMANA, ALVO DO DIA,
  EXECUÇÃO, O PROGRAMA, SINCRONIZAR, BACKUP, RESTAURAR, SEUS DADOS.

## B. Destinos de tela cheia

Todos usam `instrumento/telacheia.jsx`: `‹ voltar` no topo, título `h1` que
**recebe foco ao entrar**, sem tab bar.

| Tela | Flag | Componente | Entra por | Estados |
|---|---|---|---|---|
| **Histórico do exercício** | `view.hist` | `telas/historico.jsx` | botão HISTÓRICO no cartão | com/sem registro; em edição; troca de chave |
| **Detalhe da sessão** | `view.sessao` | `telas/sessao.jsx` | calendário de Dados; lista | sessão do plano; avulsa; retroativa |
| **Programa** | `view.prog` | `telas/programa.jsx` | Guia; Treino | 4 modos: lista · treino aberto · diferenças · log |
| **Retrospectiva** | `view.retro` | `telas/retrospectiva.jsx` | Dados | bloco completo; dados insuficientes |
| **Registro retroativo** | `view.add` | `telas/retroativo.jsx` | Treino/calendário | treino do plano; sessão avulsa |
| **Decisão de fim** | `view.promo` | `telas/decisao.jsx` | fim de sessão **com mods** | uma decisão por mod; motivo opcional |
| **Protocolo de fotos** | `view.protocolo` | `telas/protocolo.jsx` | Dados | montagem; sessão em curso (9 poses) |
| **Comparar fotos** | `view.comparar` | `telas/comparar.jsx` | Protocolo/Dados | duas sessões na mesma pose |
| **Ajuste de foto** | `view.ajuste` | `telas/ajustefoto.jsx` | Protocolo | com/sem fantasma de alinhamento |
| **Câmera** | `view.camera` | `telas/camera.jsx` | Protocolo | permissão negada; sem câmera; capturando |

## C. Folhas (bottom sheets)

`instrumento/folha.jsx`. Empilham em três níveis (50 · 70 · 80). Travam o
scroll do corpo com `position: fixed` (correto para iOS).

| Folha | `k` | Nível | Entra por |
|---|---|---|---|
| Refeição | `refeicao` | 50 | linha da timeline de Hoje |
| Seletor de dia | `dia` | 50 | botão de estado do cabeçalho de Hoje |
| Editar refeição | `editaRefeicao` | 50/80 | ··· da refeição; nova refeição |
| Seletor de alimento | `seletor` | 70 | dentro de editar refeição |
| Editar alimento | `editaAlimento` | 80 | dentro do seletor |
| Foto do aparelho | `foto` | 50 | botão FOTO no cartão de exercício |

## D. Superfícies dentro de tela (não são destinos)

- **Cartão de exercício aberto** (`view.open`) — carga, reps, RIR, troca, pular,
  histórico, foto, carga, nota. É a superfície de maior frequência do produto.
- **Edição do dia** (`instrumento/edicao.jsx`) — no lugar da lista, dentro de Treino.
- **Escala de RIR** (`view.rir`) — expande sob a linha da série.
- **Painel de troca** (`view.swapOpen`) — expande dentro do cartão.
- **Cronômetro de descanso** (`#timer`) — **fora da árvore Preact**, em
  `index.html`; repinta 4×/s.
- **Toast** (`#toast`) — `role="status"`.
- **Aviso de retrato** (`#deitado`) — só CSS, `role="alert"`.

## E. Estados transversais

| Estado | Onde aparece | Situação |
|---|---|---|
| Loading | `#app .msg` "Carregando seu histórico…" | trocado pelo Preact no primeiro render |
| Vazio | Dados, Treino, Comida | **bem resolvido** — texto explica e aponta a ação |
| Erro | `toast()` | genérico, sem retry |
| Offline | nenhuma indicação dedicada | dados são locais; só a sincronização depende de rede |
| Landscape | `#deitado` | bloqueia com explicação; **estado preservado** (verificado) |
| Sessão recuperada | boot | **funciona** — reload devolve à sessão aberta (verificado) |

## Cobertura

**5 abas · 10 destinos de tela cheia · 6 folhas · 5 superfícies internas = 26
superfícies**, mais os estados listados acima. Todas foram abertas no navegador
com estado semeado (36 sessões, 40 exercícios com histórico, 15 pesagens) nos
perfis 320×640, 360×800, 375×667, 390×844, 412×915, 430×932 e 844×390.
