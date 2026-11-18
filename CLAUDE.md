# Lastro — leia antes de mexer no front

O app tem **um visual só**, a direção 3. O anterior (Instrumento) saiu do código
na Fase 5, em 17/11/2026.

## O que vale

**Direção 3**, aprovada pelo dono em 16/11/2026. É a única referência para
qualquer decisão de tela, UX, design, texto de interface e componente.

| Para saber | Leia |
|---|---|
| O que construir, em que ordem e quem faz | [docs/redesign-3/00-plano.md](docs/redesign-3/00-plano.md) |
| Como cada tela é e se comporta | os protótipos em [docs/redesign-3/prototipos/](docs/redesign-3/prototipos/) (abrem no navegador) e o `LEIA.md` de lá |
| Cores, tipografia, componentes, movimento | [DESIGN.md](DESIGN.md) |
| Quem usa, para quê, princípios | [PRODUCT.md](PRODUCT.md) |
| Navegação, camadas, acessibilidade | [docs/LASTRO_UX_CONTRACT.md](docs/LASTRO_UX_CONTRACT.md) |
| Nome, voz e ícone | [MARCA.md](MARCA.md) |

Quando o protótipo e um documento discordarem, vale o protótipo, e o documento
é corrigido na mesma mudança.

## O que não vale mais

O visual anterior se chamava **Instrumento** (escuro e claro, fio de 1px,
uma fonte, "painel de instrumento"). Saiu do código na Fase 5. Ainda aparece em
dois lugares que **não orientam nada novo**:

- **`docs/historico/`** — todo o processo anterior: o redesenho de outubro
  (direções A a D, frentes, tokens), a revisão de regras, a auditoria de UX, o
  trabalho de motion, o mapa das telas e o `DESIGN.md` antigo. É registro. Não
  cite como regra, não retome plano de lá.
- **Comentários em `src/main.jsx`** que falam em "inegociáveis", "frente 1 a
  4", "direção D", "Instrumento", "o modo", "a tab bar", `docs/redesign/…` ou
  `docs/motion/…`. Descrevem a regra de dado por trás de uma tela que já não
  existe; a regra vale, a tela citada não. Os caminhos mudaram para
  `docs/historico/…`.

As telas moram em `src/ui/v3/` (a casca em `src/ui/app.jsx`), e os estilos em
`src/v3/` (`global.css` é o que vale para a página inteira). Classe `ins-*` não
existe mais. O que a Fase 5 tirou, e o que ficou para refazer, está em
[docs/redesign-3/04-fase5.md](docs/redesign-3/04-fase5.md).

## O que continua valendo, de qualquer época

Isto não é desenho; é regra de dado e de engenharia:

- [docs/ARQUITETURA.md](docs/ARQUITETURA.md) (estado, migração, sincronia,
  fotos, navegação), [docs/TREINO.md](docs/TREINO.md),
  [docs/fotos/01-captura.md](docs/fotos/01-captura.md) (por que o protocolo de
  fotos é como é) e os demais em `docs/` fora de `historico/`.
- Não quebrar dado salvo: mudança de formato exige migração testada.
- Nenhuma pose, medida ou passo sai do protocolo sem perguntar ao dono.
- O produto vai ter mais usuários; a rotina do dono é exemplo, não regra. O
  treinador e o nutricionista são agentes de IA dele.
- Aparelho de referência: iPhone 11 Pro Max, 414 × 896. Visual claro, sempre.

## Como trabalhar aqui

- Commits em português, com prefixo e escopo, sem linha de coautoria, direto
  no `main`, um por peça inteira. Não criar branch.
- **Push no `main` publica em produção.** Só a pedido do dono.
- Testar uma vez, no fim da peça: `npm run tipos`, `npm test`.
