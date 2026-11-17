# Histórico — não orienta nada novo

Tudo nesta pasta é registro do que veio **antes da direção 3** (aprovada em
16/11/2026). Fica guardado para explicar por que o código antigo é como é.
**Nenhum arquivo daqui é regra, plano ou referência de design em vigor.** O que
vale está no [CLAUDE.md](../../CLAUDE.md) da raiz.

| Pasta ou arquivo | O que foi |
|---|---|
| `DESIGN-instrumento.md` | o sistema visual anterior ("Instrumento") |
| `UX-CONTRACT-ate-nov-2026.md` | o contrato de UX anterior |
| `redesign/` | o redesenho de outubro de 2026: briefing, direções A a D, frentes 0 a 4, tokens, coordenação |
| `design-review/` | a revisão de regras por seis agentes (setembro de 2026) |
| `ux-audit/` | a auditoria de UX de setembro de 2026 |
| `motion/` | o trabalho de movimento, fechado em 21/10/2026 |
| `mapa/` | o mapa das telas e áreas como eram em novembro de 2026 |
| `corpo/` | propostas de UX para a tela Corpo anterior |

Os comentários em `src/` e em `tests/` que citam `docs/redesign/…`,
`docs/motion/…`, `docs/ux-audit/…` ou `docs/design-review/…` apontam para cá.

Os scripts de medição dentro de `redesign/_medicao` e `motion/_medicao` usavam
caminho relativo até `node_modules`; depois da mudança de pasta precisam de
ajuste para rodar. Não foram ajustados porque medem o visual antigo.
