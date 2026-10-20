Você é o implementador da **peça 7 · O aviso curto (toast)** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`). Fase 3: o dono já respondeu as decisões; as peças 0 a 6 já estão no código (veja `git log`). Fale e escreva em português.

## Leia antes de tocar em nada
1. `docs/motion/00-briefing.md` (regras e armadilhas).
2. `docs/motion/08-parecer.md` a **Peça 7** em §4 e §5.1 (as respostas, que prevalecem).
3. `docs/motion/00-coordenacao.md`, entradas "16/10, 01h25 — as respostas do dono" e "19/10, 21h — peça 3 conferida". Para esta peça:
   - pergunta 10: **o aviso entra subindo `--ins-sobe-aviso` (8 px) e acendendo, sai apagando, em `--ins-dur-lugar` (160 ms) na `--ins-curva`, e fica na tela o tempo do texto** — de 3,6 s (o de hoje, piso) a ~8 s (teto), conforme o tamanho; um texto novo com o aviso na tela refaz a entrada, para dizer que é outra mensagem;
   - pergunta 2 e a leitura do coordenador: sob "Reduzir movimento", **o aviso fica só na opacidade** (sem subir), no máximo 160 ms;
   - **da peça 3**: a propriedade `translate` do `#toast` agora é do ACOMPANHAMENTO do cronômetro (ele sobe e desce junto). A entrada do aviso tem de compor com isso — sem desfazer o acompanhamento nem o centramento `translateX(-50%)`.
4. `docs/motion/03-micro.md` §5.1 (o toast: hoje 3,6 s fixos para mensagens de até ~105 caracteres; a proposta de entrada, saída e tempo).
5. `docs/motion/05-acessibilidade.md` §3.2 (a região viva do toast usa `display: none`, que a tira da árvore de acessibilidade e torna o anúncio pouco confiável — **precondição**: deixa de usar `display: none`) e o que diz de tempo de leitura.
6. `docs/motion/09-implementacao.md`, seções das peças 0 a 6 (a porta, o portão, a guarda, o acompanhamento do toast na peça 3).
7. `docs/motion/07-revisao-base.md` §1.2 e a linha da **peça 7** em §1.4 (fluxo 10).

## O que a peça 7 entrega
1. **A entrada e a saída** do aviso como acima, em `transform`/`translate`/`opacity`, dentro do portão, compondo com o acompanhamento do cronômetro. Texto novo no meio refaz a entrada. Nada escuta fim de animação: se o nó precisar ficar visível durante a saída, leia o tempo com `tempo()` da porta (0 sob "Reduzir").
2. **O tempo na tela pelo tamanho do texto**, de 3,6 s a ~8 s, numa regra só, comentada (não é movimento: é leitura) — teste com mensagens curta, média e longa reais do app.
3. **A região viva** deixa de usar `display: none` (05 §3.2): o aviso continua anunciado por leitor de tela, e o que está escondido não é focável nem lido duas vezes.
4. **Sob "Reduzir movimento"**: só opacidade; o tempo pelo texto vale igual.
5. **Testes**: a entrada e a saída no portão e só nas propriedades permitidas; o texto novo refazendo a entrada; o tempo por tamanho; a região viva na árvore; a composição com o acompanhamento do cronômetro (o aviso não pula quando o cronômetro entra ou sai durante a entrada dele); a guarda verde. Plante as violações e veja ficar vermelho.

## Regras (do dono, não negociáveis)
- Motion é apresentação: **não mude o que se grava, a ordem dos toques nem o que a tela promete**. O tempo pelo texto e a região viva são os consertos que o parecer e o dono mandaram fazer aqui.
- O toque nunca espera. Nada escuta fim de animação.
- `prefers-reduced-motion` vale em tudo.
- No fim: `npm run tipos` limpo, `npm run build`, `npx vitest run` verde. Cole as saídas no relatório. Se a máquina estiver carregada por outro projeto, rode de novo o que estourar tempo antes de concluir que algo quebrou.
- **Não faça commit, não crie ramo, não faça push.**
- Não toque em `docs/motion/_medicao/shots/`, em `docs/motion/07-revisao-base.md` nem use as portas 4726, 4727 e 4728. Para medir no navegador, sirva o seu `dist/` na porta 4729 e desligue no fim. O `python3` do sistema está sem `numpy`; não instale nada no sistema.
- Se fizer plantio de violações, garanta (try/finally) que cada arquivo volta ao estado limpo mesmo se o processo cair.
- Se alguma ação sua for recusada no pedido de permissão, pare e diga no relatório qual foi.
- Se algo da espec não couber no código, decida pelo menor desvio e escreva o porquê.

## Antes do relatório final
Acrescente a seção **"Peça 7 · O aviso curto"** em `docs/motion/09-implementacao.md`: o que mudou por arquivo, as decisões (a regra do tempo, como compôs com o acompanhamento), os números, os testes e como provou que reprovam, e as saídas de `tipos`/`build`/`vitest`. **Escreva o arquivo antes de responder.** O relatório final para mim: curto, com a lista de arquivos e o que eu preciso conferir.
