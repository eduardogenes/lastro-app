Você é o implementador de um **último ajuste** do motion do Lastro (PWA em Preact, `/home/infraestrutura-imts/workspace/personal/lastro-app`), achado na rodada final do revisor. As peças 0 a 8 e os ajustes finais estão no código (o último commit é `28d5a21`; veja `git log`). Fale e escreva em português.

## O problema
**No WebKit, o toque da primeira série a frio voltou a gastar ~195 ms dentro do próprio handler.** A peça 2 tinha derrubado esse trabalho (de ~170 ms para 10–13 ms), e a medida por peça mostra onde ele voltou:

- peças 2 a 5: 10–13 ms no handler;
- **a partir da peça 6: ~195 ms no handler.**

O tempo até a tela mudar não piorou (~195 ms desde a peça 3, contra 351 no antes). Mas o toque passou a esperar trabalho, e a regra é que **o toque nunca espera**. No Chromium o trabalho no toque está em ~16 ms (15,0 / 16,1 / 16,5), no limite da meta de ≤ 16. A hipótese do revisor, que não foi confirmada: algo do toque passou a forçar o primeiro desenho (layout ou estilo) dentro do handler.

As medidas estão em `docs/motion/_medicao/shots/revisor/repeticoes-final/serie-fria/` (`antes-1..3`, `final-1..3`, `peca-2` … `peca-8`; os `rodada-*.json`). Os builds de cada peça estão congelados em `docs/motion/_medicao/shots/dist-peca-N/` e o final em `dist-final/`. O fluxo é o `03b-primeira-serie-fria` de `docs/motion/_medicao/revisor-fluxos.mjs`, gravado por `revisor-gravar.mjs` com `FLUXOS=03b`; a receita do WebKit sem sudo está no topo de `docs/motion/_medicao/desempenho-comum.mjs`.

## O que fazer
1. **Ache a causa, medida e não suposta.** Compare `dist-peca-5` com `dist-peca-6` no WebKit, na primeira série a frio. A peça 6 trouxe o carrossel, o `<main key={aba}>`, o `--ins-adianta`, `naoPerdeOFoco`, a mira e o foco (veja a seção "Peça 6 · A aba" do `docs/motion/09-implementacao.md`). Os ajustes finais também mexeram no foco devolvido (`focaComoOClique`). Pode ser, por exemplo, uma leitura de layout no toque, um `focus()` que força estilo, ou o `getAnimations()` da mira. Use trace ou `performance.now()` em volta das partes do handler.
2. **Tire do toque o que não precisa estar nele**, sem mudar o que se grava, a ordem dos toques ou o que a tela mostra. Metas: WebKit de volta aos 10–20 ms no handler; Chromium ≤ 16 ms com folga.
3. **Teste:** um caso de motor que meça o trabalho no toque da primeira série a frio nos dois motores. Ele tem de reprovar o build de `28d5a21` no WebKit (ou cobrar a causa achada de forma que reprove).

## Regras
- Motion é apresentação. O toque nunca espera. Nada escuta fim de animação. "Reduzir movimento" vale em tudo.
- `tipos`, `build` e a suíte completa verdes, duas vezes seguidas. No WebKit, rode um arquivo de motor por vez.
- Sem commit, ramo ou push.
- Use a porta 4729. Não mexa em `docs/motion/_medicao/shots/` nem no `07-revisao-base.md`: o coordenador está rodando o comparador final.
- Se plantar violações, use try/finally com conferência por hash.
- Desligue no fim qualquer processo seu.
- Se alguma ação for recusada no pedido de permissão, pare e diga qual.

Escreva a seção **"A primeira série a frio no WebKit"** no fim de `docs/motion/09-implementacao.md`, com a causa, o conserto, os números antes e depois (peça 5, final e o seu, nos dois motores) e as saídas, **antes** do relatório final.
