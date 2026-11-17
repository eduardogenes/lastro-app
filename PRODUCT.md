# Lastro

Revisto em 16/11/2026, com a direção 3. O desenho está em
[DESIGN.md](DESIGN.md); o plano, em
[docs/redesign-3/00-plano.md](docs/redesign-3/00-plano.md).

## O que é

Um companheiro do dia para quem treina e come seguindo uma prescrição. O app
**executa** o treino e o plano alimentar que vieram de outra pessoa, registra o
que aconteceu e mostra a evolução do corpo. Ele não monta treino nem dieta.

É ferramenta de uso, não vitrine: toda tela serve a uma tarefa que acontece
num momento do dia.

**O nome.** Lastro é o peso que impede de tombar. As decisões de nome, voz e
ícone estão em [MARCA.md](MARCA.md).

## Quem usa

**Hoje, o dono. O produto vai ter outros usuários**, e a rotina dele é o maior
exemplo, não a regra: horário de treino, luz do quarto e hábitos dele não viram
requisito.

**Quem prescreve.** O treinador e o nutricionista do dono são agentes de IA
que ele criou. A prescrição chega como texto, que o app organiza. Os agentes
leem os dados por uma pasta montada no computador
(`ferramentas/espelho/`).

**Aparelho de referência:** iPhone 11 Pro Max, 414 × 896, app instalado na
tela de início.

## Os momentos de uso

| Momento | Como está a pessoa | O que o app precisa fazer |
|---|---|---|
| Treino, na academia | de pé, uma mão, entre uma série e outra | uma série por tela, já preenchida; um toque para confirmar |
| Ao longo do dia | de passagem | dizer o que vem agora e deixar marcar em um toque |
| À noite | sentada, sem pressa | uma pergunta que responde o dia |
| A cada 14 dias | com outra pessoa segurando o celular, ou sozinha | fotos no mesmo padrão, com o app carregando o trabalho |
| Quando quer ver evolução | com calma | peso, medidas e fotos na mesma linha do tempo |

## O que o produto faz de diferente

**Ele freia.** Músculo fica forte mais rápido do que tendão se adapta. O app
segura a mão: só sugere subir carga quando a regra do treinador foi cumprida,
e nenhuma mudança de hoje vira regra sem a pessoa dizer.

**Ele não pergunta o que já sabe.** O que dá para calcular não se digita, e a
tela diz de onde veio cada número.

**Ele não depende de a pessoa anotar tudo.** Quem esqueceu de registrar
resolve depois, de uma vez: o treino inteiro como da última vez, a comida de
14 dias em 14 toques.

## Princípios

1. **Responda "e agora?" antes de "como está?".** O topo do Hoje é a próxima
   ação, com um botão.
2. **Registro por exceção.** O caminho comum (fez como o plano, como da última
   vez) custa um toque. Só a exceção pede detalhe.
3. **Nada é obrigatório.** O treino é o centro; comida, água, peso, cardio,
   medidas e fotos se ligam e desligam (a comida desde 17/11/2026: quem só
   treina desliga). O app completo não assusta porque só
   aparece o que a pessoa ligou.
4. **Dia em branco não é falta.** Fica fora da conta, não vira zero, e o app
   não cobra.
5. **O padrão é obrigatório, a saída existe.** Fotos e medidas só servem se
   forem comparáveis. O app trava no padrão, oferece "fazer mesmo assim" e
   marca o registro que saiu fora dele.
6. **Mudar hoje não muda o programa.** Tudo que se altera durante o treino vale
   só naquele treino, até a pessoa dizer que passa a valer.
7. **Toda mudança no plano tem volta** e fica anotada: quando e por quê.
8. **Não inventar conselho.** A prescrição é de quem prescreveu. Quando o app
   freia, cita a regra e diz de quem ela é.

## Tom

Direto, em segunda pessoa, sem hype. O app devolve o número e deixa o
julgamento com a pessoa: sem "parabéns", sem sequência de dias, sem medalha.
A voz completa está em [MARCA.md](MARCA.md).

## O que não é

- **App de fitness motivacional.** Sem streak, sem badge, sem tela de parabéns.
- **Contador de calorias.** Ninguém pesa nem lista comida no dia a dia; o plano
  já diz o que comer, e o registro é "foi como o plano?".
- **Planilha.** Formulário de muitos campos é o que este desenho existe para
  evitar.
- **Dois apps numa barra.** Treino e comida são partes do mesmo dia.

## Acessibilidade e contexto físico

- Alvo de toque de 44 px no mínimo; 58 a 72 px no que se aperta durante o
  treino.
- Texto que se lê nunca abaixo de 12 px; campo de digitar nunca abaixo de
  16 px (o Safari dá zoom).
- Texto sobre bloco de cor é sempre tinta escura; contraste mínimo de 4,5:1.
- Estado nunca só por cor: vem com palavra ou ícone.
- "Reduzir movimento" desliga deslize e escala.
