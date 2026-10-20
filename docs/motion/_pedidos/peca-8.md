Você é o implementador da **peça 8 · O resto do lugar** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 a 7 já estão no código (veja `git log`). É a última peça de implementação. Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` a **Peça 8** em §4 e §5.1 (as respostas, que prevalecem).
3. `docs/motion/00-coordenacao.md`, entrada "16/10, 01h25 — as respostas do dono": a pergunta 13 manda os **defeitos 3** ("Comi tudo" insere 145 px acima da linha tocada e a linha desce) e **6** (dois "+1 copo" seguidos, com o aparelho recusando gravar, podem desfazer o segundo copo) para dentro desta peça. Pergunta 2: sob "Reduzir movimento", o que muda no lugar fica só na opacidade.
4. `docs/motion/03-micro.md` §4.4 (o copo que enche), §4.6 (marcar uma refeição pela linha: a forma pousa; o salto de 157 px é layout, não movimento), §6 (carregando: "Abrindo o registro…" pisca 3 a 4 quadros em toda abertura), §8 itens 5 e 7 (os defeitos).
5. `docs/motion/01-inventario.md` A.5 (o teclado próprio rola a página 178 px ao abrir: `focus()` sem `preventScroll`).
6. `docs/motion/09-implementacao.md`, seções das peças 0 a 7 — em especial a **peça 2** (o pouso do número, `@keyframes ins-pousa`/`ins-acende`, a marca de "recém" que sai sem `animationend`, e o `depoisDoLayout` que mede e rola no desenho seguinte para o dedo não perder o lugar).
7. `docs/motion/07-revisao-base.md` §1.2 e a linha da **peça 8** em §1.4 (fluxos 09, 11, 12): o copo e a forma em 160 ms; "Comi tudo" não empurra a linha; régua e teclado continuam sem movimento.
8. `docs/mapa/06-comida.md` e `docs/mapa/10-agora.md` antes de mexer no Agora e na comida.

## O que a peça 8 entrega
1. **O copo enche de baixo** (03 §4.4): a bolinha nova do "+1 copo" enche num `::after` de `scaleY(0)` a 1, origem embaixo, em `--ins-dur-lugar` (160 ms), dentro do portão; corrigir para menos esvazia pelo mesmo caminho; ao montar o Agora as bolinhas nascem cheias, sem animar. O número e os ml trocam sem movimento. Sob "Reduzir": a bolinha aparece cheia (ou só opacidade).
2. **A forma da refeição marcada pousa** (03 §4.6) com o mesmo gesto do número da série (`ins-pousa`, a marca de "recém" — `view.ultimaMarca` já existe pela metade). A leitura de volta não se move.
3. **Defeito 3**: "Comi tudo" deixa de empurrar a linha tocada para baixo (hoje 157 px) — a linha fica sob o dedo (o mesmo princípio do `depoisDoLayout` da peça 2, ou o que for mais certo aqui), e o retorno do toque é visto. Teste com a página no topo e rolada.
4. **Defeito 6**: dois "+1 copo" seguidos com o aparelho recusando não desfazem o copo do segundo toque (`CTX.maisUmCopo`, cada chamada guarda o seu `antes`). A tela nunca mostra copo que o disco recusou. Teste.
5. **O teclado próprio** deixa de rolar a página ao abrir (`focus({ preventScroll: true })`, 01 A.5), sem perder o foco nem o que o teclado mostra.
6. **"Abrindo o registro…"** passa a aparecer só se a abertura demorar (~300 ms, 03 §6): abertura rápida mostra só o fundo e o app. Não é movimento (é atraso de aparecer, em degrau, sem fade) e vale igual sob "Reduzir".
7. **Régua, teclado e RIR continuam sem movimento** (princípio: o que nasce sob o polegar aparece no lugar).
8. **Testes** de cada item, e a guarda verde. Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**. Os defeitos 3 e 6, o teclado que rola e a frase que pisca são os consertos que o parecer e o dono mandaram fazer aqui.
- O toque nunca espera: o copo grava antes de animar (o movimento começa no `render()` que já vem depois da gravação). Nada escuta fim de animação.
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde. Cole as saídas no relatório. Se a máquina estiver carregada por outro projeto, rode de novo o que estourar tempo antes de concluir que algo quebrou.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador, sirva o seu `dist/` na porta 4729 e desligue no fim. O `python3` do sistema está sem `numpy`; não instale nada no sistema.
- Se fizer plantio de violações, garanta (try/finally) que cada arquivo volta ao estado limpo mesmo se o processo cair.
- Se alguma ação sua for recusada no pedido de permissão, pare e diga no relatório qual foi.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 8 · O resto do lugar"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo, as decisões, os números antes e depois (a linha do "Comi tudo", a rolagem do teclado, quando a frase aparece), os testes e como provou que reprovam, e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
