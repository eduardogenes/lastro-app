# Lastro — contrato de UX

As regras de comportamento do app na direção 3 (16/11/2026).
[DESIGN.md](../DESIGN.md) diz como as coisas se parecem; este documento diz
como se comportam. A versão anterior está em
[historico/UX-CONTRACT-ate-nov-2026.md](historico/UX-CONTRACT-ate-nov-2026.md)
e vale só para as telas antigas enquanto existirem.

## 1 · As camadas

| Camada | O que é | Navegação visível | O que o Voltar faz |
|---|---|---|---|
| **Lugar** | Hoje, Dias, Corpo, Semana, Plano | doca | sai do app (é a raiz) |
| **Destino** | uma tela aberta de um lugar (uma medida, comparar fotos, um exercício) | cabeçalho fino com voltar; sem doca | volta, na posição em que estava |
| **Tela de ação** | treino, descanso, medir, câmera, responder dias | só a saída própria | pergunta se há algo a perder; senão, sai |
| **Folha** | tarefa curta que sobe de baixo | cobre o que houver | fecha a folha de cima |

A pilha de navegação continua **derivada do estado**, nunca escrita à mão
(`src/ui/navegacao.js`): quem abre liga uma marca, quem fecha desliga, e o
histórico do navegador acompanha.

## 2 · Voltar

**Voltar desfaz exatamente uma camada.** Vale igual para o botão de voltar, o
toque no véu, o Esc e o Voltar do sistema.

Nunca usar Voltar para ir ao Hoje, trocar de lugar ou descartar um treino.
Não existe botão de voltar na raiz de um lugar.

| Rótulo | Significa |
|---|---|
| seta para a esquerda | sobe uma camada |
| × ou seta para baixo | recolhe a tela de ação ou sai dela, sem perder o que foi feito |
| Cancelar | sai sem aplicar; só onde há alteração não aplicada |

## 3 · Posição de leitura

| Navegação | Comportamento |
|---|---|
| Entrar num destino | topo |
| Voltar de um destino | a posição exata de antes |
| Fechar folha | não mexe |
| Trocar de lugar | topo |
| Atualizar dado na mesma tela | **não mexe** |

## 4 · A doca

Cinco lugares, fixos: **Hoje · Dias · Corpo · Semana · Plano**. Ao lado, o
botão **"+"**.

- A doca é navegação. O "+" é a única ação que mora nela: abre "Registrar",
  que sugere o mais provável agora e aceita texto livre.
- Some em destino, em tela de ação e enquanto houver campo em foco.
- Encolhe ao rolar para baixo e volta ao rolar para cima.
- Com treino em andamento e fora dele, uma faixa acima da doca leva de volta
  ao treino.

## 5 · Uma ação principal por tela

- No Hoje, ela mora no bloco do momento. Quando o bloco rola para fora, a ação
  gruda no topo, pequena.
- Em tela de ação, é o botão grande embaixo.
- A saída discreta ("Pulei esta", "Hoje não vou treinar", "Tirar mesmo assim",
  "Guardar só esta") fica embaixo do botão principal, sublinhada. Sempre
  existe quando o caminho principal pode não servir.

## 6 · Registro

- **Por exceção.** O caminho comum custa um toque e já vem preenchido: a série
  com a carga e as repetições da última vez, a refeição como o plano, a medida
  perto da anterior.
- **Número na régua**, não no teclado.
- **Confirmar grava na hora.** Não existe "salvar" separado no fim de um
  fluxo: "Feito", "Comi", "Guardar" já são o registro. Sair no meio não perde
  o que foi confirmado.
- **Quem não anotou resolve depois, de uma vez:** "Já fiz mais do que anotei"
  no treino, "Responder os dias em branco" na comida. O que entra assim fica
  marcado como registrado depois.
- **Em branco não é zero.** Dia ou medida sem registro fica fora das contas e
  é mostrado como em branco, sem cobrança.

## 7 · Padrão com saída

Fotos e medidas precisam ser comparáveis. O app conduz ao padrão e trava a
ação enquanto ele não é atingido. A saída existe ("Tirar mesmo assim",
"Guardar só esta"), pede uma confirmação curta na primeira vez e **marca o
registro**; a marca aparece onde ele é comparado.

## 8 · Treino

- Uma série por tela. O que foi feito no exercício fica à vista em cima.
- O descanso começa sozinho ao confirmar a série, ocupa a tela e mostra a
  próxima. O cronômetro é escrito por instante-alvo: sobrevive a tela apagada
  e a recarregar.
- **Mudar hoje não muda o programa.** Trocar, pular, série a mais, ordem e
  deload valem só neste treino. No fim, o app pergunta de cada mudança se
  passa a valer; sem resposta, não passa.
- A sugestão de subir carga segue a regra do treinador, aparece na série e a
  pessoa escolhe subir ou manter.
- Dor registrada mostra a regra do treinador, nas palavras dele.

## 9 · Nada obrigatório

Água, peso, cardio, medidas além das básicas, fotos e lembretes se ligam e
desligam. Desligar esconde, **nunca apaga**. O que está desligado não aparece
como pendência em lugar nenhum.

## 10 · Ações destrutivas

- Reversível: prefere desfazer a confirmar.
- Difícil de reverter: confirma, dizendo em português o que se perde e o que
  não se perde.
- Apagar foto manda para a lixeira por 30 dias.
- Não confirmar ação comum: confirmação repetida deixa de ser lida.

## 11 · Estados

Toda tela tem estado vazio que diz o que falta e, se houver, a ação. Sem
ilustração, sem consolo.

- **Sem rede:** uma faixa quieta avisa uma vez; nada é bloqueado.
- **Falha ao guardar:** é o único aviso que não some sozinho. Fica no topo
  até resolver, mostra o que não foi guardado e nunca apaga o que a pessoa
  informou.
- Tela que depende de câmera, arquivo ou conta declara carregando, vazio,
  erro e conteúdo, sem pulo de layout entre eles.

## 12 · Acessibilidade — piso

- Todo controle tem nome acessível; botão só com ícone leva `aria-label`.
- Alvo de 44 px ou mais; ver [DESIGN.md](../DESIGN.md).
- Foco sempre visível. Ao abrir folha ou destino, o foco entra; ao fechar,
  volta para quem abriu.
- Estado nunca só por cor.
- "Reduzir movimento" troca deslize e escala por troca seca.
- A régua tem alternativa sem arrastar: setas do teclado e botões de passo.

## 13 · Viewport e área segura

- Altura de tela cheia em `100svh`, com `100vh` só de recuo.
- Área segura respeitada em cima, embaixo e dos lados; nada importante encosta
  na barra de gestos.
- Nenhum ancestral com `overflow` diferente de `visible` entre um elemento
  grudado e quem rola (para cortar na horizontal, `overflow-x: clip`).
- A página nunca rola na horizontal.
- Retrato é o cenário. Deitado preserva todo o estado.

## Antes de dar uma tela por pronta

- [ ] é lugar, destino, tela de ação ou folha, e se comporta como tal
- [ ] uma ação principal; saída discreta onde o caminho principal pode não servir
- [ ] Voltar desfaz uma camada, e só uma; o Voltar do sistema também
- [ ] posição de leitura ao entrar e ao voltar
- [ ] o caminho comum custa um toque e vem preenchido
- [ ] estado vazio, e erro com recuperação quando há câmera, arquivo ou conta
- [ ] nomes acessíveis, foco, alvos de 44 px
- [ ] 414 × 896 conferido; sem rolagem horizontal
- [ ] recarregar no meio da tarefa preserva o que foi confirmado
