# 00 · Briefing do time de motion

Insumo de todo o time. Pedido do dono em 15/10/2026, resumido sem perder nada
que obrigue. Leitura feita no commit `a22b09d` (o "antes" de tudo o que este
processo mudar).

---

## 1. O pedido

> "Que o app se mova bem. Cada movimento tem de explicar alguma coisa: de onde
> a tela veio, para onde foi, o que mudou, que o toque foi aceito. Tem de ser
> rápido o bastante para não atrapalhar quem está treinando, e nunca pode
> piscar, travar ou atrasar o toque. Não quero enfeite."

Isso é o P12 dele, de setembro, agora como pedido de trabalho: "a coisa mais
chatinha… é a falta de fluidez no toque das coisas… ele não tem uma fluidez, um
motion, uma suavidade, sabe? Eu gosto disso" (`docs/redesign/06-parecer.md`
§4.3, item 1).

**É uma mudança de doutrina, não acabamento.** O `DESIGN.md` diz hoje "Quase
nenhum movimento" (inegociável 6) e lista quatro movimentos autorizados
(§Movimento). O `src/tokens.css` diz "Quatro funções autorizadas" (princípio 6).
A revisão de design de setembro **recusou por escrito**, com motivo, transição
entre abas, deslizar conteúdo, animar altura, esqueleto que cintila e
comemoração (`docs/design-review/05-movimento.md`). Em 06/10 a folha ganhou a
subida (decisão 14 do dono). O pedido novo manda; os motivos antigos são
argumentos que o time tem de **enfrentar**, não ignorar: onde um motivo técnico
continua de pé, diga; onde caiu, diga por quê.

## 2. O app e o uso

- PWA em Preact, sem rede; a nuvem é cópia. Telas em `src/ui/`, casca em
  `src/ui/app.jsx` e `src/ui/navegacao.js`, peças em `src/ui/instrumento/`,
  quase toda a lógica de tela em `src/main.jsx` (12 mil linhas). CSS em
  `src/*.css`, tokens em `src/tokens.css` (`--ins-*`), fontes Space Grotesk e
  IBM Plex Mono.
- Aparelho real: **iPhone 11 Pro Max, 414 × 896 pt, WebKit**, instalado na tela
  de início (sem barra do Safari). O 402 × 874 que aparece no código é o
  telefone simulado do computador. No notebook o app aparece pousado na
  "bancada" (`src/palco.js`, `src/palco.css`), que tem regras próprias.
- Uso: muitas vezes com uma mão, de pé na academia, entre séries. Outros
  usuários virão: a rotina do dono é exemplo, não regra. Nada de requisito
  "milimétrico" tirado dele (mão suada, luva, luz).

## 3. O mapa — leia antes de tudo

- `docs/mapa/00-visao-geral.md`: telas, caminhos, folhas, telas cheias, o que
  aparece por cima de tudo, o Voltar.
- Antes de mexer numa área, o documento dela (`docs/mapa/01` a `11`). A casca
  inteira (abas, telas cheias, folhas, avisos, toast, Voltar, posição de
  leitura, bancada) é da **01-fundacao**. O modo de sessão, a régua, o teclado,
  o RIR e o cronômetro são da **03**. A câmera é da **08**.
- Doutrina atual de movimento: `DESIGN.md` inegociável 6 e §Movimento;
  `src/tokens.css` princípio 6 e o bloco "Movimento: a curva e as durações";
  `docs/redesign/10-tokens.md` §14 (o portão de movimento reduzido);
  `docs/design-review/05-movimento.md` (o que foi recusado e por quê).

## 4. As regras

1. **Motion é apresentação.** Não muda comportamento nem dado: o que é gravado,
   a ordem dos toques e o que a tela promete continuam iguais.
2. **O toque nunca espera a animação.** O dado grava no toque; o movimento vem
   junto ou depois. Nenhum clique bloqueado "até a animação acabar".
3. **`prefers-reduced-motion` vale em tudo.** O portão atual é por adesão
   (movimento mora dentro de `no-preference`) e falha fechado.
4. **Só `transform` e `opacity`.** Nunca animar largura, altura, posição,
   margem ou nada que dispare layout.
5. **60 fps no iPhone (WebKit) e nada piscando no Chrome (Blink).**
6. **Sem enfeite.** Cada movimento diz uma coisa: de onde veio, para onde foi,
   o que mudou, que o toque pegou. O que não diz nada não entra.
7. **Fase 1 é só leitura.** Ninguém mexe em `src/`, `tests/`, `DESIGN.md`,
   `MARCA.md` nem `package.json`. Cada um escreve o próprio documento em
   `docs/motion/`. Scripts de medição vão em `docs/motion/_medicao/` e as
   capturas em `docs/motion/_medicao/shots/` (fora do git).
8. **O dono não testa à mão.** Nada de protocolo para ele executar: o que
   precisar de prova vira captura, gravação ou teste automático.
9. **Referência sempre com arquivo e linha** (`src/componentes.css:270`).

## 5. Armadilhas já conhecidas (do `~/.claude/CLAUDE.md` do dono)

- **`backdrop-filter` pisca no Blink** quando um vizinho anima ou a rolagem
  reseta; no iPhone real normalmente não. Correção: tirar o blur e compensar
  com fundo mais opaco. `transform`/`will-change` no ANCESTRAL do elemento com
  blur quebra o blur. O app hoje já não usa blur (`src/componentes.css:255`,
  `:594`, `:1279`).
- **`translateX(+N)` faz um fixo/centrado piscar no Blink**, só no sentido
  positivo: o conteúdo transborda pela direita, nasce uma barra de rolagem
  horizontal transitória, a viewport reflui. Correção: `overflow-x: clip` num
  ancestral do que anima. `overflow-x: hidden` não serve (vira `auto` no outro
  eixo e quebra o sticky).
- **`position: sticky` some** quando algum ancestral tem `overflow` diferente de
  `visible` (vira scroll container). Para cortar só em X mantendo o sticky:
  `overflow-x: clip`.
- **`100vh` no iPhone é a viewport grande** e deixa uma sobra rolável; tela
  cheia usa `100svh` (com `100vh` de fallback), e a cadeia inteira de
  ancestrais tem de concordar. `overscroll-behavior: none` em `html, body`.

## 6. Ferramentas

- Chromium do Playwright em `~/.cache/ms-playwright/chromium-1234/` e
  `ffmpeg-1011` (gravação em vídeo). `playwright-core` está no projeto.
- Molde de script de captura: `docs/redesign/_medicao/README.md` e os `.mjs`
  ao lado (414 × 896, ×2, contra o `dist` servido localmente).
- Testes: `npm run tipos`, `npm run build`, `npx vitest run` (os de fluxo rodam
  contra o `dist/`). Guarda de estilo: `tests/dominio/estilo.test.ts`.
