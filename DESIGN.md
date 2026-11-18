# DESIGN.md — direção 3

O sistema visual do Lastro mora em **[docs/design-system/](docs/design-system/)**.
Este arquivo é só a porta: o resumo abaixo e onde está cada coisa. Onde ele e o
design system parecerem discordar, vale o design system.

O texto anterior deste arquivo (os valores da aprovação de 16/11/2026, antes
do design system) está no histórico do git. O visual antigo (Instrumento) está
em [docs/historico/DESIGN-instrumento.md](docs/historico/DESIGN-instrumento.md),
só como registro.

## A ideia

**A tela diz uma coisa por vez, em letra grande, com um botão só.** O que
importa agora ocupa um bloco de cor no topo; o resto é consulta, compacta,
embaixo. Compacto onde se consulta, com respiro onde se age. Número se arrasta
numa régua; teclado só para texto. Dá para ver o que é tocável.

Tema claro sempre, sem tema escuro nem como opção. Papel quente, tinta quase
preta, cores chapadas, que dizem o **assunto** (treino, refeição, corpo,
semana, feito), não se está bom ou ruim. Sobre cor, só tinta.

O que se repete fica parado, para a mão aprender onde está; o que muda se
mostra mudando, rápido e com motivo.

## Onde está cada coisa

| Para saber | Leia |
|---|---|
| como cada tela é, estado por estado | a página viva [docs/design-system/lastro.html](docs/design-system/lastro.html) (as telas em `ds-telas.js` e `ds-telas2.js`) |
| cor, letra, espaço, forma, sombra, movimento (os valores) | [docs/design-system/tokens.css](docs/design-system/tokens.css), copiados em `src/v3/tokens.css` |
| por que cada valor (contraste medido, escala, toque, polegar) | [01-fundamentos.md](docs/design-system/01-fundamentos.md) |
| os componentes, com estados e acessibilidade | [02-componentes.md](docs/design-system/02-componentes.md) |
| como o app se comporta e como fala | [03-padroes-e-voz.md](docs/design-system/03-padroes-e-voz.md) |
| como as telas se movem e o que nunca sai do lugar | [07-fluidez-e-estabilidade.md](docs/design-system/07-fluidez-e-estabilidade.md) |
| o que o app ainda faz diferente, e a correção | [05-auditoria.md](docs/design-system/05-auditoria.md) |

## Regras de engenharia do visual

- Cor e medida soltas fora de `src/v3/tokens.css` são erro (a guarda está em
  `tests/dominio/estilo-v3.test.ts`).
- Toda classe começa com `v3-`. Os componentes moram em `src/ui/v3/base.jsx` e
  `src/v3/componentes.css`; tela não inventa componente.
- Texto que se lê nunca abaixo de 12 px; campo de digitar com 16 px.
- Ícone é desenho (`src/ui/v3/icones.jsx`), nunca emoji nem caractere.
- Sem `backdrop-filter`, sem degradê, sem sombra fora da doca, da folha e da
  câmera.
