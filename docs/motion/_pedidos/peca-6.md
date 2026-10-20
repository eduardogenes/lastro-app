Você é o implementador da **peça 6 · A aba** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 a 5 já estão no código (veja `git log`), e a peça 5 montou a View Transition do app — esta peça a reaproveita. Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` §3, a **Peça 6** em §4 e §5.1 (as respostas, que prevalecem).
3. `docs/motion/00-coordenacao.md`, entrada "16/10, 01h25 — as respostas do dono". Para esta peça:
   - pergunta 3: **a página inteira desliza, como um carrossel** — o conteúdo velho sai pelo lado oposto e o novo entra pelo lado para onde se andou na barra, os dois juntos, em **350 ms** (`--ins-dur-entra`) na **`--ins-curva`** (foi o que o desenho que o dono viu tocou); **o fio da aba anda junto, no mesmo tempo e curva** (hoje ele anda em `--ins-dur-lugar`, 160 ms — passa a 350, como o revisor anotou no 07 §6);
   - pergunta 2: sob "Reduzir movimento", **o conteúdo novo esmaece 120 ms** (`--ins-dur-dissolve`) **e o velho sai de uma vez**; o fio salta;
   - pergunta 6: aceito o ~1 quadro a mais da View Transition.
4. `docs/motion/02-navegacao.md` §1 (o que é do aparelho não anda), §2.0 (o toque nunca espera: pulo + reenvio), T4 (trocar de aba: a barra parada, o fio em `transform`, toda aba abre no topo DENTRO do desenho novo, `vaiPara('treino')` sem índice, os riscos) e §3.4 (a armadilha do `translateX(+)`, medida). O "passo curto" de lá foi trocado pelo carrossel.
5. `docs/motion/09-implementacao.md`, seções das peças 0 a 5: a porta `src/ui/movimento.js`, o fio da aba (o invólucro da largura da barra, da peça 0), a View Transition num ponto só e o pulo + reenvio (peça 5).
6. `docs/motion/07-revisao-base.md` §1.2, §1.3 e a linha da **peça 6** em §1.4 (fluxos 07 e 14): ≥ 3 quadros com mudança, a barra de abas parada aos 120 ms, **nenhuma página mais larga que a janela**, a aba tocada no meio vence.
7. `docs/mapa/01-fundacao.md` (a casca: abas).

## O que a peça 6 entrega
1. **O carrossel**: trocar de aba desliza a página inteira (a velha sai, a nova entra) em 350 ms na `--ins-curva`, pela View Transition da peça 5, no sentido do índice na barra. O cabeçalho do Agora vai com a página. **A barra de abas e tudo o que é do aparelho** (cronômetro, aviso, faixas) **ficam parados**.
2. **O fio** anda junto, em 350 ms e na mesma curva, em `transform` (o invólucro da peça 0).
3. **A rolagem**: toda aba abre no topo, e esse `scrollTo(0, 0)` entra no desenho novo (senão a foto da aba que sai pula para o topo antes de sumir).
4. **O toque nunca espera**: toques rápidos em abas — cada transição nova encerra a anterior (pulo + reenvio) e o dedo acerta a aba que vê (fluxo 14).
5. **Nada mais largo que a janela**: a página que entra pela direita é `translateX(+)` — confira a largura rolável em todo quadro e que nada fixo e centrado pisca no Blink; `overflow-x: clip` (nunca `hidden`) onde for preciso.
6. **Sob "Reduzir movimento"**: nenhuma View Transition; o conteúdo novo esmaece 120 ms por CSS no nó que nasce, o velho sai de uma vez, o fio salta.
7. **`vaiPara('treino')`** e qualquer aba sem índice: sem animação.
8. **Testes**: o sentido pelo índice; a barra parada; a rolagem no topo dentro do desenho novo; a largura rolável; a aba tocada no meio vence (navegador, dois motores); sob "Reduzir" só opacidade; a guarda verde. Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**.
- O toque nunca espera. Nada escuta fim de animação.
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde. Cole as saídas no relatório. Se a máquina estiver carregada por outro projeto e algum arquivo que você não tocou estourar tempo, rode de novo antes de concluir que algo quebrou.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador, sirva o seu `dist/` na porta 4729 e desligue no fim. O WebKit 26.5 roda sem sudo pela receita no topo de `docs/motion/_medicao/desempenho-comum.mjs`. O `python3` do sistema está sem `numpy`; não instale nada no sistema.
- Se fizer plantio de violações, garanta (try/finally) que cada arquivo volta ao estado limpo mesmo se o processo cair.
- Se alguma ação sua for recusada no pedido de permissão, pare e diga no relatório qual foi.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 6 · A aba"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo, as decisões, os números (quadros com mudança, largura rolável, a aba no meio), os testes e como provou que reprovam, e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
