# Lastro — contrato de UX

As regras de comportamento do app moram no design system:
**[03-padroes-e-voz.md](design-system/03-padroes-e-voz.md)** (registro, Voltar,
desfazer, folha ou tela cheia, sem rede, falha ao guardar, primeira vez, voz) e
**[07-fluidez-e-estabilidade.md](design-system/07-fluidez-e-estabilidade.md)**
(movimento e âncoras). Cada tela, com o que o Voltar faz nela, está na página
viva [lastro.html](design-system/lastro.html). Este arquivo é o resumo e as
regras de engenharia que valem por baixo. Onde ele e o design system parecerem
discordar, vale o design system.

O texto anterior deste contrato está no histórico do git; o de antes da
direção 3, em [historico/UX-CONTRACT-ate-nov-2026.md](historico/UX-CONTRACT-ate-nov-2026.md).

## As camadas

| Camada | O que é | O que o Voltar faz |
|---|---|---|
| **Lugar** | Hoje, Dias, Corpo, Semana, Plano, com a doca | sai do app (é a raiz) |
| **Destino** | uma tela aberta de um lugar; cabeçalho com voltar, sem doca | volta, na posição de leitura em que estava |
| **Tela de ação** | treino, descanso, medir, câmera, responder os dias | recolhe; o que foi confirmado já está guardado |
| **Folha** | uma decisão ou um número, que sobe de baixo | fecha a folha de cima; a tela de baixo não mexe |

**Voltar desfaz exatamente uma camada**, igual para a seta, o véu, o Esc e o
Voltar do sistema. Nunca serve para ir ao Hoje, trocar de lugar ou descartar
um treino. Trocar de lugar leva ao topo; voltar de destino devolve a posição;
atualizar dado na mesma tela não mexe na rolagem.

## Regras de engenharia

- A pilha de navegação é **derivada do estado**, nunca escrita à mão
  (`src/ui/navegacao.js`): quem abre liga uma marca, quem fecha desliga, e o
  histórico do navegador acompanha.
- Toda troca de camada passa pela porta do movimento (`src/ui/movimento.js`,
  `trocaDeCamada`), que escolhe o movimento pelo tipo de troca e deixa o toque
  no meio da transição valer.
- Confirmar grava na hora; sair no meio nunca perde o que foi confirmado.
  Recarregar no meio da tarefa preserva tudo.
- Desligar um módulo esconde e **nunca apaga**.
- Altura de tela cheia em `100svh` com `100vh` de recuo, em toda a cadeia de
  ancestrais; `overscroll-behavior: none` em `html, body`; área segura em cima
  e embaixo.
- Nenhum ancestral com `overflow` diferente de `visible` entre um elemento
  grudado e quem rola; para cortar só na horizontal, `overflow-x: clip`.
- A página nunca rola na horizontal. Retrato é o cenário; deitado preserva o
  estado.

## Antes de dar uma tela por pronta

- [ ] coincide com a tela e cada estado dela no `lastro.html`, medida a 414 × 896
- [ ] é lugar, destino, tela de ação ou folha, e se comporta como tal
- [ ] um principal; saída discreta onde o caminho principal pode não servir
- [ ] nas tarefas de vários passos, o principal tem o mesmo retângulo em todos
- [ ] a troca tem o movimento do 07, e "reduzir movimento" o zera
- [ ] Voltar desfaz uma camada, e só uma; posição de leitura ao entrar e ao voltar
- [ ] estado vazio; erro com recuperação quando há câmera, arquivo ou conta
- [ ] nomes acessíveis, foco que entra e volta, alvos de 44 px
- [ ] recarregar no meio da tarefa preserva o que foi confirmado
