# Direção C · o protótipo de pé

`prototipo.html` — um arquivo, sem rede, uma tela por vez em `100svh`, com as
áreas seguras respeitadas. Abre na terça, 6:55, na décima série do Treino A:
pulldown unilateral, série 2 de 2, última vez 45 × 9.

**Onde ficam os controles do protótipo.** Na faixa fininha do topo, no meio, há
um puxador. Ele abre o tema (Automático · Claro · Escuro) e o "Começar de novo".
É o único lugar do arquivo que fala do protótipo e não do produto.

**O tema.** A decisão do dono é seguir o aparelho, com troca manual, e é isso que
o "Automático" faz. O arquivo **abre claro** de propósito, para não entregar
uma tela escura a quem não pediu; os dois temas estão inteiros e a troca é
imediata, em qualquer tela.

**O que o protótipo guarda.** Tudo o que é tocado fica no `localStorage` deste
aparelho (leitura e escrita em `try/catch`, porque em aba privada isso falha) —
inclusive o relógio da ficção, que congela com o arquivo fechado e volta a andar
quando ele abre. "Começar de novo" apaga.

---

## 1 · O que ficou de fora, e por quê

- **Semanas e Prescrição** estão na barra, **visivelmente desabilitadas**. As duas
  foram desenhadas na segunda entrega (`semana.html`, `prescricao.html`) e nenhuma
  está no roteiro. Preferi uma aba apagada a uma aba que abre meia tela.
- **A aula, a sessão de fotos e a comparação de fotos** não entraram. A aula
  aparece como um fato do dia de ontem ("Aula de HYROX · fui"), porque o dia
  precisava de um treino registrado para a comida ser o único buraco — que é o
  retrato medido.
- **Trocar exercício, pular, dor, nota, aproximação, deload.** Tirei a fileira de
  botões do exercício (`Orientação · Aparelho · Trocar · ···`) em vez de deixá-la
  lá sem destino. O que sobrou na sessão toca em alguma coisa.
- **O cardio** é uma linha a lápis **sem botão**. Ele acontece depois da sessão,
  fora do roteiro; uma linha que não promete nada mente menos que um botão que
  não leva a lugar nenhum.
- **A fita** é um vazio que se lê e não se toca: a primeira medida depende de uma
  linha de texto ("onde você mediu"), e texto livre é teclado do sistema, que eu
  não quis fingir.
- **A distribuição por segmento da bioimpedância** aparece como tabela vazia. Os
  dez números principais se preenchem de verdade, um a um, com o teclado do app.
- **Erro de gravação, sem conta, espaço esgotado, paisagem em duas colunas.** Não
  há como provocá-los aqui. Estão desenhados nas entregas anteriores.
- **A nota do nutricionista** só aparece no lanche e no jantar, que são as duas
  frases que existem nos fatos (F182). Não inventei as outras quatro.
- **O horário do lanche** continua o do plano, **16:00**, e não o dele, 15:30.
  É a minha resposta à pergunta 6 da primeira entrega, e ela fica visível aqui.

---

## 2 · O que só apareceu quando virou coisa tocável

**1. O foco da tela tem que andar um passo atrás do cursor.** Na galeria, "entre
duas séries" e "gravada" eram duas fotos. No motor, assim que a última série
prescrita de um exercício é gravada, o cursor pula para o exercício seguinte — e
a **série a mais some junto com o exercício que acabou**, porque ela mora embaixo
da última linha dele. Tive que separar duas coisas que eu tratava como uma: o
**foco** (a metade de cima, que fica no exercício recém-fechado enquanto o
descanso corre) e o **cursor** (a metade de baixo, que já oferece o próximo). O
desenho da galeria mostrava exatamente isso, mas por acidente de enquadramento;
agora é regra. Sem ela, o passo 2 do roteiro é impossível.

**2. Espaço é o recurso escasso, e eu tinha duas coisas disputando o mesmo
lugar.** Corrigido o foco, o botão "+ 3ª série, além da prescrição" caiu abaixo
da dobra, empurrado pelo convite de subir carga do próximo exercício. Numa
galeria isso não aparece: a tela tem 896 px e eu escolho o que cabe. Juntei a
linha de "fim previsto" **dentro do bloco de descanso** e encurtei a regra do
treinador. A lição vale além do conserto: fim previsto e descanso são a mesma
informação — tempo que falta — e queriam estar juntos desde o começo.

**3. Uma linha que se abre fora da vista não existe.** O roteiro do dia é longo.
Tocar no lanche abria a refeição abaixo da dobra: a tela parecia não ter
respondido. O protótipo agora rola o que abriu para dentro da vista. Numa
galeria, cada estado é uma foto já enquadrada; num app, quem enquadra é o app, e
isso é trabalho que o desenho não mostra.

**4. A consequência precisa viajar junto com o toque.** Marcar o lanche move o
contador dos 14 dias da regra do nutricionista — que fica no **topo** da tela,
longe do dedo. A galeria dizia a consequência pelo desenho (a célula mudando de
cor); aqui ninguém vê. Pus o número dentro do aviso de gravado: *"Lanche da
tarde: tudo, gravado aqui. Comida conhecida: 10 de 14 dias."* Quando ele põe
ontem em dia, o mesmo aviso diz 11 — e o topo deixa de pedir.

**5. O relógio achou um buraco meu: marcar antes da hora.** O roteiro atravessa o
dia (6:55 → 15:30) e o protótipo tem um relógio só. Com ele em 6:55, marcar o
lanche das 16:00 é **marcar o futuro** — e a minha gramática não tem estado para
isso: lápis vira tinta ao toque, sem perguntar que horas são. Desenhei a saída
mínima (uma linha dentro da folha: *"Previsto para as 16:00. Marcar antes grava
como comido, com a hora do toque"*) e deixo a pergunta: **marcar refeição antes
da hora deve ser possível?** Hoje é — e nada impede declarar o que não aconteceu,
que é exatamente o risco contra o qual eu tinha recusado o botão "comi o plano
todo" (recusa 4 da primeira entrega).

**6. Corrigir no lugar é barato de desenhar e caro de acertar.** Toda linha a
tinta abre, e a correção acontece embaixo, com os mesmos botões, com o valor
gravado destacado. Ao vivo apareceu uma perda que o desenho escondia: **durante a
correção não existe "série da vez"**, então a barra das 20 séries fica sem a
marca laranja e ele perde, por alguns segundos, onde estava. A linha diz
"corrigindo esta série", o que atenua; mas é um custo real da decisão 3 do dono,
e só aparece quando se toca.

**7. O teclado do app é uma peça só servindo a quatro lugares** — carga, "outro
número" de repetições, peso e os dez números da bioimpedância. Nas galerias eram
quatro desenhos; aqui é um componente com rótulo trocável. A decisão 4 do dono
sai barata de construir, e não só confortável de usar.

**8. O descanso atravessa tudo sem truque nenhum.** Sair para a comida, para
ontem, para o corpo, para a bioimpedância e voltar: o número continua certo,
porque ele é a subtração de dois instantes e não um contador que precisa de vida.
Era a aposta da primeira entrega contra o app suspenso pelo iOS (F57), e ela se
paga aqui, inteira — é o que faz o passo 6 do roteiro não ter graça nenhuma, no
bom sentido.

**9. O leitor de tela perde o foco a cada toque**, porque a tela se repinta
inteira. Remendei guardando o foco pelo mesmo botão quando ele sobrevive à
repintura, e todo registro é anunciado por `aria-live`. Num produto de verdade,
isso é repintura por pedaço — mais trabalho do que parece numa galeria, onde cada
estado já nasce pronto.

---

## 3 · O que consertei durante a montagem

Tudo o que segue é conserto mínimo, dentro da direção, sem redesenhar nada:

1. **Foco e cursor separados** na sessão (descoberta 1). Sem isso, a série a mais
   não existe.
2. **"Fim previsto" entrou no bloco do descanso** e a regra do treinador encurtou,
   para a série a mais caber na tela (descoberta 2).
3. **A linha que abre rola para dentro da vista** (descoberta 3).
4. **O aviso de gravado passou a carregar o número da regra** (descoberta 4).
5. **Uma linha honesta sobre marcar antes da hora** na folha da refeição
   (descoberta 5).
6. **"Comi tudo" voltou a ser um toque.** As porções novas (decisão do dono:
   tudo, metade, saiu-e-sei, saiu-e-não-sei, não comi) saíram como cinco botões
   iguais — o que contradiz a régua do dono, "o mínimo de toques necessário". Pus
   "Comi tudo" em botão inteiro e os outros quatro um degrau abaixo, como a
   segunda entrega já dizia e o desenho não tinha obedecido.
7. **A semana sem média** mostrava um travessão gigante que parecia uma barra
   preta. Virou frase: "Sem média: falta uma pesagem".
