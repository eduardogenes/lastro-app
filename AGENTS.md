# Trabalhar no Lastro

Comece pelo [CLAUDE.md](CLAUDE.md), o guia compartilhado do projeto. Para retomar uma peça, confira o Git e a seção **Implementação no app** do [andamento do design system](docs/design-system/LEIA.md). Ali ficam as entregas feitas e as pendências. O [plano da implementação](docs/design-system/06-prompt-implementacao.md) descreve a sequência.

## Como decidir

- Uma revisão de direção visual começa com protótipos completos e navegáveis. Mostre a tela atual e a proposta no tamanho do aparelho para o dono decidir antes de editar `src/`. Uma correção pontual pedida ou a implementação de uma tela já aprovada pode seguir direto.
- Para várias decisões abertas, o dono prefere uma página clara com o contexto de cada pergunta, como funciona hoje, as opções e suas consequências, uma recomendação quando fizer sentido, campo livre e botão para copiar o resumo. Quando ele delegar, decida, anote o motivo no checklist e prossiga.
- Respeite as pausas combinadas. Na peça 6 do design system, o acordo é fechar cada parte de dados e aguardar o OK antes da próxima.

## Como implementar e conferir

- A Direção 3 é a referência visual. Compare com a [página viva](docs/design-system/lastro.html) por tela e estado, inclusive em movimento. O aparelho de referência é o iPhone 11 Pro Max, 414 × 896. Em tarefas repetidas, o botão principal conserva a posição para o polegar. Uma decisão visual nova aprovada também entra no design system.
- O app registra e executa a prescrição recebida. A rotina do dono serve de exemplo para um produto com outros usuários. Consulte-o antes de retirar uma pose, medida ou passo do protocolo.
- Ao mudar dado salvo, confira a leitura de versões antigas, a migração, a fusão entre aparelhos, a cópia de segurança e a saída de `ferramentas/espelho/monta.ts`, usada pelos agentes do dono. Os critérios detalhados estão nos roteiros de [revisão de dados](.claude/agents/revisor-de-dado.md) e [revisão de design](.claude/agents/revisor-de-design.md).
- Feche a peça com `npm run tipos` e `npm test` (a suíte já faz o build). Assuma a verificação com testes, medições e capturas. Nas mudanças visuais, compare a referência e o app em Chromium e WebKit. O dono prefere receber o resultado conferido e dispensa roteiros de medição manual.
- O ramo de trabalho é a `main`. Agrupe código, testes e atualização da auditoria em um commit por peça fechada, em português, com prefixo e escopo, sem coautoria de IA. Abra branch só a pedido. Push na `main` publica em produção e exige pedido expresso.

## Notas do produto

As anotações do Lastro no Notion crescem conforme o uso. Quando o pedido envolver triagem, preserve os IDs dos itens e a ligação com a nota de origem. Registre o método, as fontes, a data de corte e a evidência no código para que a próxima nota possa entrar no mesmo índice.
