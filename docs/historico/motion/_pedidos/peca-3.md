Você é o implementador da **peça 3 · O descanso** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 (o sistema), 1 (o toque que escurece) e 2 (a série recebida) já estão no código. Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` §5.1 (as respostas, que prevalecem) e a **Peça 3** em §4.
3. `docs/motion/00-coordenacao.md`, entrada "16/10, 01h25 — as respostas do dono": a pergunta 9 foi **sobe da borda e desce**; a 1 deu o tempo — **camada entra e sai em 350 ms na curva do iPhone (`--ins-dur-entra`, `--ins-dur-sai`, `--ins-curva-camada`), SEM quique** (o quique é só da folha e do painel de apagar); a 2 deu "Reduzir movimento": **esmaece `--ins-dur-dissolve` (120 ms) ao chegar e sai de uma vez**.
4. `docs/motion/03-micro.md` §4.3 (o descanso que sobe — inteiro, mas os tempos de lá foram substituídos pelos acima), §5.1 (o toast, que acompanha), §8 item 2 (o vão de 52 px no modo).
5. `docs/motion/04-desempenho.md` (o que diz do `#timer`, do toast e das armadilhas de fixo) e `docs/motion/05-acessibilidade.md` (o que diz do cronômetro e de esmaecer sob "Reduzir").
6. `docs/motion/09-implementacao.md`, seções das peças 0, 1 e 2: o que já existe (tokens, a porta `src/ui/movimento.js` com `podeMover()`/`podeDissolver()`/`tempo()`, o portão por adesão, a guarda de `tests/dominio/estilo.test.ts`).
7. `docs/motion/07-revisao-base.md` §1.2 e a linha da **peça 3** em §1.4: o que o revisor vai cobrar (no antes o cronômetro nasce num quadro em y 762–844, 52 px acima do fundo de 896).
8. `docs/mapa/03-sessao-de-treino.md` antes de mexer no descanso.

## O que a peça 3 entrega
1. **O vão de 52 px** (03 §8.2, precondição): no modo de sessão, o cronômetro e o toast flutuam 52 px acima do fundo porque `#app:has(.ins-modo)` não alcança `#timer`/`#toast`, irmãos do `#app`. Conserte para que, no modo, o fundo do cronômetro fique no fundo da tela (e o comentário que afirma o contrário saia), sem quebrar o lugar dele fora do modo, com a barra de abas.
2. **O cronômetro sobe da borda de baixo** ao começar, em `--ins-dur-entra` com `--ins-curva-camada`, e **desce por onde veio** ao parar, em `--ins-dur-sai`. Descanso novo substituindo outro troca no lugar (não desce e sobe). O fim do descanso continua **sem movimento** ("vai" e o som). Hoje ele usa `display: none`, que não transiciona: saia de cena por `transform` mais `visibility` (ou `@starting-style`), dentro do portão, com o último quadro escrito fora. O centramento `translateX(-50%)` não pode ser desfeito: use a propriedade **`translate`** individual (ou componha), como a peça 0 deixou previsto.
3. **O toast e a faixa da sessão acompanham** o cronômetro no mesmo tempo e curva, pela propriedade `translate` — hoje o toast pula 82 px no meio. Só o acompanhamento; a entrada e a saída do próprio toast são da peça 7.
4. **Sob "Reduzir movimento"**: o cronômetro esmaece em `--ins-dur-dissolve` ao chegar e sai de uma vez; nada desliza; o toast e a faixa vão direto ao lugar novo.
5. **O toque nunca espera**: o alvo do descanso já é gravado antes de qualquer desenho (`startTimer`); ±15 e parar são clicáveis durante a subida, onde estiverem; um "parar" no meio da subida inverte dali. Nada escuta fim de animação (se for preciso segurar a `visibility` pelo tempo da saída, leia o tempo com `tempo()` da porta, que dá 0 sob "Reduzir").
6. **Atenção ao que a peça 2 deixou** (09, "Peça 2", último bloco): `alturaDoTimer` passou a publicar a altura do cronômetro (`--ins-timer-h`, que o toast e a faixa leem) por um ResizeObserver, e isso hoje depende de o cronômetro escondido ser `display: none` (altura 0). Ao trocar para `transform` + `visibility`, a altura publicada tem de continuar dizendo a verdade: 0 quando o descanso não está na tela, a altura real quando está — senão o toast e a faixa ficam reservando 82 px para um cronômetro que não está ali. Cubra com teste.
7. **Testes**: o lugar do cronômetro no modo e fora dele (o fundo na borda da tela no modo); a classe/estado de entrada e saída sem `animationend`; o toast acompanhando; e a guarda continua verde (ela vai cobrar que o movimento está no portão e só usa `transform`/`translate`/`opacity`). Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**. O conserto do vão de 52 px é precondição mandada pelo parecer; fora dele, nada de comportamento muda.
- O toque nunca espera. Nada escuta fim de animação.
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde (os testes de fluxo rodam contra `dist/`). Cole as saídas no relatório.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador (por exemplo `micro-avisos.mjs`, `micro-serie.mjs`), sirva o seu `dist/` na porta 4729 e desligue no fim.
- Armadilhas: nada de `transform`/`translate`/`will-change`/`filter` em ancestral de elemento fixo; não desfaça o `translateX(-50%)` de `#timer`, `#toast` e `.ins-faixa`; `translateY` não cria a barra horizontal, mas confira a largura rolável.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 3 · O descanso"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo, as decisões, os números antes e depois (o vão no modo; o toast que não pula; a duração e a curva medidas nos dois motores, se mediu), os testes e como provou que reprovam, e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
