# Design system do Lastro

O design system da direção 3, montado a partir dos protótipos em
`docs/redesign-3/prototipos/`. Enquanto o dono não aprovar, nada daqui muda
`src/`, `DESIGN.md` ou o contrato de UX. Quando aprovar, `DESIGN.md` e
`docs/LASTRO_UX_CONTRACT.md` passam a apontar para cá, e a auditoria vira o
plano da próxima fase.

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
