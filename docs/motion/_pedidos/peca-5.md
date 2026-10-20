Você é o implementador da **peça 5 · Telas cheias e modo de sessão** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 a 4 já estão no código (veja `git log`). É a maior peça e a de mais risco: ela monta a View Transition do app, que a peça 6 (a aba) vai reaproveitar. Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` §3 (a técnica), a **Peça 5** em §4, §5.1 (as respostas, que prevalecem) e §6 (riscos).
3. `docs/motion/00-coordenacao.md`, entradas "16/10, 01h25 — as respostas do dono" e "19/10, 21h — peça 3 conferida". Para esta peça:
   - pergunta 4: **a tela cheia chega da direita, a tela inteira, e a de baixo fica PARADA** (sem recuo — o `--ins-recuo` não existe);
   - pergunta 5: **o modo de sessão entra como qualquer tela cheia**;
   - pergunta 1: camada entra e sai em **350 ms** (`--ins-dur-entra`, `--ins-dur-sai`) na `--ins-curva-camada`, **sem quique** nas telas cheias e no modo; e **nenhuma saída tem quique** — a folha e o painel de apagar, que chegam com o quique desde a peça 4, **descem** em 350 ms sem quique, e o véu apaga junto;
   - pergunta 2: sob "Reduzir movimento", a camada **esmaece 120 ms ao chegar** (`--ins-dur-dissolve`, por CSS no nó que nasce, sem View Transition) e **sai de uma vez**;
   - pergunta 6: **aceito o ~1 quadro a mais** da View Transition em todas as camadas, inclusive o modo;
   - pergunta 13: os **defeitos 4** (a faixa "Não guardado" cobre a seta de saída do modo, a hora e o `···`) e **7** (o campo de importar arquivo em Ajustes não mostra foco com teclado) entram nesta peça.
4. `docs/motion/02-navegacao.md` inteiro, com atenção a §1 (o modelo espacial: o que é do aparelho não anda), §2.0 (as regras de todas — **o toque nunca espera: `pointerdown` durante a transição chama `skipTransition()` e reenvia o clique ao que está sob o dedo**; a rolagem aplicada dentro do desenho novo), T1 (modo), T2 (telas cheias, a borda de 1 px, a navegação composta), T3 (a descida da folha, o nome por posição na pilha), T5 (o Voltar do sistema e o gesto de borda, `hasUAVisualTransition`), T6 (a rolagem devolvida), T7 (Ajustes), §3.3–3.5 (View Transitions em Preact, a armadilha do `translateX(+)`, a recomendação). Os tempos e o "recuo" de lá foram substituídos pelas respostas acima.
5. `docs/motion/04-desempenho.md` §2.4–2.6 (a sonda das View Transitions no WebKit, o toque que se perde, a sobra de scroll do modo em `vh`) e o que diz de `backdrop-filter`/`will-change`.
6. `docs/motion/05-acessibilidade.md` §3.1 (ao fechar, tela cheia e modo devolvem o foco ao `body`; o modo nem recebe foco ao abrir) e §3.3 (o campo de importar).
7. `docs/motion/03-micro.md` §8 item 3 e §5.3 (a faixa "Não guardado").
8. `docs/motion/09-implementacao.md`, seções das peças 0 a 4: a porta `src/ui/movimento.js` (o ÚNICO lugar que pode chamar `startViewTransition`), o portão, a guarda de `tests/dominio/estilo.test.ts`, o cronômetro fora do `#app`, a folha e o painel que sobem.
9. `docs/motion/07-revisao-base.md` §1.2, §1.3 (princípios 1, 6, 8 e 9) e a linha da **peça 5** em §1.4 (fluxos 01, 02, 04, 05, 08, 16 e a descida do 06): o que o revisor vai cobrar.
10. `docs/mapa/01-fundacao.md` (a casca: abas, telas cheias, folhas, Voltar) e `docs/mapa/03-sessao-de-treino.md`.

## O que a peça 4 deixou e importa aqui (09, "Peça 4")
- A chegada da folha e do painel é animação CSS no nó que nasce, e **o `pointerdown` durante a chegada a pausa** (`seguraNoLugar` na porta `movimento.js`) para o toque chegar ao que o dedo mirou. A View Transition desta peça é outro mecanismo (o alvo do toque durante ela é o `html`): o pulo + reenvio de 02 §2.0. Os dois têm de conviver — por exemplo, fechar uma folha que ainda está subindo.
- O isolamento das camadas (`inert`) agora deriva da camada de cima (pare › "Não guardei" › folhas) e cobre o `#timer`. Tela cheia e modo entram nesse mesmo esquema, e o foco ao sair tem de ir a um lugar declarado.
- A guarda (b) cobra `getAnimations(` só na porta; `startViewTransition` também só lá.

## A condição de entrada (antes de qualquer outra coisa)
**Um teste de navegador do toque atravessando**, nos dois motores (Chromium e WebKit 26.5 desta máquina — a receita de rodar o WebKit está no topo de `docs/motion/_medicao/desempenho-comum.mjs`): para cada camada (tela cheia, modo, folha descendo, painel descendo), um segundo toque no meio da transição chega ao alvo que está sob o dedo. **Se uma camada reprovar num motor, ela troca seco naquele motor** (o app de hoje), e isso fica escrito no código e no 09. Escreva esse teste primeiro e mantenha-o na suíte.

## O que a peça 5 entrega
1. **A View Transition num ponto só**: o `render()` de `src/main.jsx` pede a transição à porta `src/ui/movimento.js` quando a mudança é de camada (abrir/fechar tela cheia, modo, a saída de folha e painel), e só sem "Reduzir movimento". Dois `render()` seguidos durante a transição viram uma (02 T2, navegação composta). A primeira tela nunca anima (T9).
2. **Tela cheia e modo**: chegam da direita, a tela inteira, em 350 ms; a de baixo parada; saem pela direita em 350 ms. A borda da que chega fica dita por um fio de 1 px (`--ins-fio`) do lado esquerdo durante o deslocamento (sem sombra — inegociável). O que é do aparelho **não anda**: cronômetro, aviso, faixas e barra de abas ganham nome próprio e ficam parados (02 §1, T1 riscos).
3. **A folha e o painel de apagar descem** em 350 ms sem quique pela View Transition (a folha já saiu do DOM no mesmo desenho); o véu apaga junto. O nome de cada folha é pela posição na pilha (`folha-0`, `folha-1`…), nunca pelo `nivel`.
4. **O toque nunca espera** (02 §2.0): `pointerdown` durante a transição → `skipTransition()` + reenvio do clique ao elemento de fato sob o dedo. É a condição de entrada acima.
5. **O Voltar do sistema e o gesto de borda** (T5): o Voltar faz o mesmo reverso; quando o navegador já animou (`hasUAVisualTransition` no `popstate`), o app não anima de novo.
6. **A rolagem volta exata** (precondição; T1, T6): `fechaModoDeSessao` e `fechaAjustes` rolam ANTES de desenhar e a rolagem volta cortada (o Corpo entra a 1982 px e volta a 1091). Toda rolagem de troca de camada passa a ser aplicada dentro do desenho novo. Teste: a rolagem depois de sair = a de antes de entrar (±1 px), pela seta e pelo Voltar.
7. **O foco** (precondição, 05 §3.1): ao entrar, o título da tela cheia recebe o foco e o modo ganha um alvo de foco; ao sair, o foco volta a um lugar declarado (o controle que abriu, ou o título da aba), nunca ao `body`. Teste com teclado.
8. **A sobra de scroll do modo** (precondição, 04 §2.5): o modo com conteúdo curto deixa 24 px roláveis (58 px no iPhone) — altura em `vh` na cadeia. Corrija (`svh`, a cadeia inteira de ancestrais).
9. **O cronômetro nas telas cheias** (da peça 3): continua 52 px acima do fundo nas telas cheias — o mesmo conserto que o modo recebeu, `html:has(.tc)` (ou o seletor certo da tela cheia).
10. **Defeito 4**: a faixa "Não guardado" (`pare.jsx`, `.ng-faixa`, fixa no topo, z 86) deixa de cobrir a seta, a hora e o `···` do modo — sem esconder o aviso. **Defeito 7**: o campo de importar arquivo em Ajustes mostra o foco de teclado como os outros controles.
11. **Sob "Reduzir movimento"**: nenhuma View Transition; tela cheia, modo, folha e painel esmaecem 120 ms ao chegar (CSS no nó que nasce) e saem de uma vez.
12. **Testes**: o toque atravessando (navegador, dois motores); a rolagem devolvida; o foco; a sobra de scroll; o cronômetro nas telas cheias; os defeitos 4 e 7; e a guarda verde (só `transform`/`opacity` nas pseudo-camadas da transição, nada em elemento real que seja ancestral de fixo). Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**. Os consertos de rolagem, foco, sobra de scroll, cronômetro e os defeitos 4 e 7 são os que o parecer e o dono mandaram fazer aqui; fora deles, nada de comportamento muda.
- O toque nunca espera. Nada escuta fim de animação (nem `transition.finished` para liberar o toque).
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde (os testes de fluxo rodam contra `dist/`). Cole as saídas no relatório. Se a máquina estiver carregada por outro projeto e algum arquivo que você não tocou estourar tempo, rode de novo antes de concluir que algo quebrou.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador, sirva o seu `dist/` na porta 4729 e desligue no fim.
- Armadilhas: nada de `transform`/`translate`/`will-change`/`filter` em elemento REAL que seja ancestral de fixo (`#app`, `.ins-modo`) — a transição anima as fotos, não os elementos; a página que chega pela direita (`translateX(+)`) pode criar barra de rolagem horizontal transitória e fazer o que é fixo e centrado piscar no Blink — confira a largura rolável durante a transição e use `overflow-x: clip` (nunca `hidden`) onde precisar; nada de `backdrop-filter`.
- Se alguma ação sua for recusada no pedido de permissão, pare e diga no relatório qual foi.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 5 · Telas cheias e modo de sessão"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo; o resultado do teste do toque atravessando por camada e por motor (e qualquer camada que ficou seca num motor, com o porquê); as decisões; os números antes e depois (rolagem devolvida, foco, sobra de scroll, o quadro a mais medido); os testes e como provou que reprovam; e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
