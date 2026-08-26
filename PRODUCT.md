# Lastro

## Register

**Product.** É ferramenta, não vitrine. Não existe página de venda, não existe
onboarding, não existe usuário além de um. Toda tela serve a uma tarefa que
acontece num momento específico do dia.

## Usuários e propósito

**Um usuário.** Eduardo. O app não tem conta, servidor nem sincronização — os
dados moram no navegador do aparelho dele, e isso é decisão, não limitação.

**Dois contextos de uso, e eles não se parecem:**

| | |
|---|---|
| **6h15, na academia** | De pé, com uma mão, suado, no subsolo com sinal ruim. Registra série entre uma e outra, com 60 a 180 segundos de descanso. Precisa ver carga anterior e digitar dois números sem pensar. |
| **Ao longo do dia** | Sentado, sem pressa. Marca refeição, confere o que falta comer, olha peso e veredito. |

**O trabalho que ele quer fazer:** ganhar músculo com ganho de gordura
controlado, seguindo prescrição de um treinador e de um nutricionista — sem
que o app opine sobre nenhuma das duas.

## O que o produto faz de diferente

**Ele freia.** Músculo fica forte mais rápido do que tendão consegue se
adaptar. Boa parte do que o app faz é atrasar decisão: avisar quando o volume
passou do prescrito, cobrar a regra de manter o exercício por 6 a 8 semanas,
exigir que promover uma mudança ao programa seja consciente em vez de
automática. O caminho de menor esforço é sempre o conservador.

**Ele não pergunta o que já sabe.** O sinal de "estou ficando mais forte" sai
do e1RM das cargas registradas, não de um interruptor. A lista de compras sai
do plano × a semana. O alvo calórico sai dos alimentos. Nada derivável é
digitado, e onde um número é derivado a tela diz de onde ele veio.

**Ele registra sem botão de salvar.** Cada série entra no histórico assim que
carga e repetição estão preenchidas. A sessão nasce e morre sozinha.

## Personalidade

**Preciso · direto · silencioso.**

Painel de instrumento, não app de bem-estar. Fala em segunda pessoa, imperativo
curto, sem hype. Nunca comemora: não há "parabéns", não há sequência de dias,
não há medalha. Quem treina 5 a 6 vezes por semana quebra sequência todo
domingo, e transformar isso em cobrança seria mentir sobre o programa.

## Anti-referências

O que este produto explicitamente **não** é:

- **App de fitness motivacional.** Sem streak, sem badge, sem tela de parabéns,
  sem gráfico com legenda e eixo. A sparkline é o gráfico.
- **Rastreador de calorias genérico.** O plano vem de um nutricionista e é
  dado congelado, igual ao programa do treinador. O app executa, não prescreve.
- **SaaS.** Sem cartão com sombra, sem gradiente, sem métrica-herói com número
  gigante e três estatísticas de apoio.
- **Dois apps dividindo uma tab bar.** Treino e comida são metades do mesmo
  dia; a tela HOJE existe para provar isso.

## Princípios de design

1. **Responda "e agora?" antes de "como está?".** O topo da tela principal é a
   próxima ação com contagem ao vivo, nunca um resumo.
2. **Não existe modo de edição.** Todo objeto carrega a própria afordância de
   editar. Nada é somente-leitura até você destravar.
3. **Destrutivo um nível para dentro**, em coral, nunca na lista.
4. **Editar é permanente, ajustar é de hoje — e o rótulo diz qual é qual.**
5. **Escopo por regra, não por duplicação.** Um plano com condições por objeto,
   não sete telas de dia.
6. **Toda mudança global tem um restaurar documentado.**
7. **Persistência silenciosa.** Reabrir devolve exatamente onde parou.
8. **Não inventar conselho.** A prescrição está definida; isto é a ferramenta.

## Acessibilidade e contexto físico

- **Alvo de 46px** para qualquer controle apertado repetidamente; 28px só para
  toggle de um toque dentro de linha densa.
- **Campo de texto nunca abaixo de 16px** — o Safari dá zoom ao focar, e a tela
  fica torta no meio de uma série.
- **Nada de prosa abaixo de 13px**, nem rótulo mono abaixo de 9px.
- **Contraste**: o corpo do texto vive entre `#F2F4EF` e `#A8AFA1` sobre
  `#0C0E0C`. Os dois níveis mais apagados (`#7C8478`, `#5E655A`) são só para
  rótulo e procedência, nunca para prosa que precisa ser lida.
- **`prefers-reduced-motion`** desliga as duas únicas animações do produto.
