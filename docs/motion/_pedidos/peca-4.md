Você é o implementador da **peça 4 · A folha sobe** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 a 3 já estão no código (veja `git log`). Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` §5.1 (as respostas, que prevalecem) e a **Peça 4** em §4.
3. `docs/motion/00-coordenacao.md`, entrada "16/10, 01h25 — as respostas do dono". Para esta peça:
   - pergunta 1: **a folha chega com o quique** — os `@keyframes ins-quique` que a peça 0 deixou em `src/tokens.css`, em `--ins-dur-quique` (640 ms: passa 8 % do lugar aos 55 %, volta 3 % aos 80 %, assenta). É a ÚNICA ultrapassagem permitida no app, e a guarda de estilo só a aceita nesses quadros;
   - pergunta 11: **o painel de apagar ("pare") é igual à folha** — chega com o mesmo quique;
   - pergunta 2: sob "Reduzir movimento", folha, painel e véu **esmaecem em `--ins-dur-dissolve` (120 ms) ao chegar**; nada se desloca;
   - pergunta 13: o **defeito 5** ("Não guardei" chega ~0,8 s depois do toque com os quatro botões na zona do polegar) entra nesta peça.
4. `docs/motion/02-navegacao.md` T3 (folhas: subir, empilhar, o véu, o nome por posição na pilha) e T8 (a troca da folha do topo, "cadastrar": **a camada não se move**, só o conteúdo troca). Os tempos de lá foram substituídos pelos acima.
5. `docs/motion/03-micro.md` §5.2 (o painel de pare — a recomendação de lá foi "parado", e o dono escolheu "igual à folha") e §5.3 ("Não guardei…": **sem movimento**; o conserto é de comportamento — uma janela curta em que os botões do aviso recém-chegado não respondem a um toque que era para outra coisa; avalie e decida).
6. `docs/motion/05-acessibilidade.md` §3.1 (o foco: com o cronômetro ligado o Tab sai da folha para o −15; o painel de pare e o "Não guardei" não isolam o fundo como a folha isola).
7. `docs/motion/04-desempenho.md` §2.4 (o conteúdo da folha rola de lado com o dedo) e o que diz do véu e de `backdrop-filter`.
8. `docs/motion/09-implementacao.md`, seções das peças 0 a 3: o que já existe (tokens, a porta `src/ui/movimento.js`, o portão por adesão, a guarda de `tests/dominio/estilo.test.ts`, o pouso, o cronômetro que sobe).
9. `docs/motion/07-revisao-base.md` §1.2 e a linha da **peça 4** em §1.4 (fluxos 06, 13, 15): o que o revisor vai cobrar.
10. `docs/mapa/01-fundacao.md` (a casca: folhas, avisos) antes de mexer.

## O que a peça 4 entrega
1. **A folha sobe com o quique** ao nascer (`src/ui/instrumento/folha.jsx` e o CSS dela): animação no nó que nasce, por CSS, dentro do portão, com o último quadro escrito fora. O véu acende por opacidade **no tempo da camada** (`--ins-dur-entra`, 350 ms; o desenho que o dono viu usava `ease-out` — escolha o token de curva mais próximo e diga qual). O que está atrás não se move.
2. **A pilha**: a segunda e a terceira folha sobem sobre a primeira, e os véus somam. **A troca da folha do topo** ("cadastrar", `trocaFolha`) **não sobe**: só o conteúdo troca (02 T8).
3. **O painel de apagar** (`src/ui/instrumento/pare.jsx`, o `Pare`) chega igual à folha, com o quique e o véu. A frase continua inteira desde o primeiro quadro (é texto, não se anima à parte).
4. **A saída fica como hoje** (de uma vez) para folha e painel: a descida precisa da View Transition e é da peça 5. Não adiante isso.
5. **Sob "Reduzir movimento"**: folha, painel e véu esmaecem em `--ins-dur-dissolve` ao chegar; saem de uma vez.
6. **O toque nunca espera**: tocar no × ou no véu ~100 ms depois de abrir fecha a folha (fluxo 15 do revisor); o dado de qualquer ação na folha grava no toque. Nada escuta fim de animação.
7. **Defeito 5 — "Não guardei"**: o aviso continua sem movimento; resolva o toque mirado em outra coisa que cai num botão dele logo que ele chega (03 §5.3). Se usar uma janela de tempo, ela é uma constante declarada e comentada, não um número solto, e não pode deixar o aviso sem resposta a quem toca de propósito depois de lê-lo. Teste.
8. **Foco (precondição, 05 §3.1)**: com o cronômetro ligado, o Tab não pode sair da folha para o `#timer`; o painel de pare e o "Não guardei" passam a isolar o fundo como a folha isola (o mesmo mecanismo, `inert` ou o que a folha usa). Teste com teclado no estilo dos testes de fluxo que existem.
9. **Precondição (04 §2.4)**: o conteúdo da folha deixa de rolar de lado com o dedo, sem cortar nada que precise ser visto.
10. **Testes**: a animação de chegada só no portão e só com o quique; a troca do topo sem animação de camada; o painel igual à folha; sob "Reduzir", só opacidade; o × no meio fecha; os casos de foco e do "Não guardei". Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**. Os consertos de foco, da rolagem de lado e do defeito 5 são os que o parecer e o dono mandaram fazer aqui; fora deles, nada de comportamento muda.
- O toque nunca espera. Nada escuta fim de animação.
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde (os testes de fluxo rodam contra `dist/`). Cole as saídas no relatório. Se a máquina estiver carregada por outro projeto e algum arquivo que você não tocou estourar tempo, rode de novo antes de concluir que algo quebrou.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador, sirva o seu `dist/` na porta 4729 e desligue no fim.
- Armadilhas: nada de `transform`/`translate`/`will-change`/`filter` em ancestral de elemento fixo (a folha é `position: fixed` sem portal — `folha.jsx` explica); nada de `backdrop-filter` no véu; o quique para cima passa da borda de cima da folha por 8 %, confira que nada transborda na horizontal e que a folha alta (`max-height: 92dvh`) não sai da tela no pico.
- Se alguma ação sua for recusada no pedido de permissão, pare e diga no relatório qual foi.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 4 · A folha sobe"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo, as decisões (o token de curva do véu, a janela do "Não guardei", o mecanismo de isolamento), os números (o quique medido nos dois motores, se mediu), os testes e como provou que reprovam, e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
