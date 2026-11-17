# Direção D · o protótipo

[prototipo.html](prototipo.html) — um arquivo, sem rede, uma tela por vez na
janela inteira. Abre na terça 06/10, 6h55, série 10 de 20 do Treino A. O estado
é real: o que for registrado continua lá ao voltar e sobrevive a fechar a aba
(localStorage, com try/catch; se falhar, a tela diz que não está guardando).
Tema do aparelho por padrão, com troca manual em **⋯ › Protótipo** (na sessão) e
em **Ajustes › Protótipo** (no Agora), onde também fica "começar de novo".

Nada foi redesenhado. É a direção que já estava desenhada, de pé.

---

## O que ficou de fora, e por quê

- **Dias, Semana e Prescrição.** O roteiro não passa por elas. Estão na barra de
  baixo, visivelmente desabilitadas, em vez de abrirem uma tela de mentira.
- **Fotos, comparação, medidas com fita, aula.** Aparecem como linhas em Corpo,
  escrito "fora do protótipo". Preferi a linha apagada à porta que não abre.
- **Os estados ruins** (erro de gravação, carregando, máquina ocupada, dor,
  pular, deload, encerrar) ficam como becos desabilitados — eles estão
  desenhados nos oito HTML e montá-los aqui não ajudaria na escolha. A única
  exceção é real: se o armazenamento falhar, o aviso aparece de verdade.
- **A régua de porções.** A direcao-2 diz que as porções passam de duas para
  mais de duas, numa régua curta — mas **quais** valores é pergunta aberta
  (minha pergunta 3, e "comi mais que o plano" mexe na adesão). Usei o controle
  de quatro botões que está desenhado no M2‑4. Inventar os valores seria pior
  do que entregar o controle antigo.
- **Paisagem** (M1‑14) e o embutido no Claude.ai.

---

## O que só apareceu quando virou coisa tocável

1. **A sessão não tinha saída.** Nos desenhos, sair da sessão era o "voltar" do
   sistema. Na janela inteira, sem barra de navegador — e instalado no iPhone
   não há barra nenhuma (F55) — o dedo fica preso: não existe caminho visível
   para a comida. Foi o primeiro defeito, e o mais básico.
2. **O app não tinha relógio.** Nos desenhos, a hora vinha da barra de status do
   iOS, que eu mesmo desenhei em cima do telefone. Na janela inteira o relógio é
   o do aparelho, e marca a hora de verdade — a ficção fica muda. A sessão tem
   "35 min" e "fim ~7h31", mas nenhuma tela dizia que horas são. Tive que pôr a
   hora no cabeçalho. Vale para o produto: quem registra às 6h55 com o relógio
   do sistema escondido pela imersão não tem como conferir a projeção.
3. **O protótipo precisou pular no tempo** (6h55 → 15h30 ao sair da sessão para
   o Agora), porque o lanche não existe de manhã e marcar refeição do futuro é
   inventar. O salto é a única mentira do arquivo. Ele ensinou uma coisa: uma
   sessão aberta o dia inteiro é caso comum (42% a 59% fecham sem registro), e
   o cabeçalho que diz "550 min · fim ~7h27" fica ridículo. Na tarde ele passa a
   dizer "aberta desde 6h20 · última série às 6h57".
4. **Corrigir no lugar precisa de alvo.** "Toca o número errado e conserta" é
   simples de dizer e tem duas perguntas escondidas: *qual* série, e *como se
   volta à régua*. Resolvi com o que já estava no desenho: cada número guardado
   virou botão dentro da tabela do exercício, e a régua ganhou um segundo
   estado — o valor guardado em tinta cheia, marcado "agora", ao lado do
   "última" em anil. Esse estado não existia em nenhum dos oito arquivos.
5. **Corrigir não pode reiniciar o descanso.** Só se vê com as duas coisas na
   mesma tela: o cronômetro conta desde o instante da série, e trocar o número
   não muda o instante. Está escrito na régua de correção.
6. **A regra do cartão de cima se vira contra si mesma um segundo depois de
   marcar.** "A próxima refeição até 30 min à frente; se não houver, a última
   que passou sem marca." Marcado o lanche às 15h30, a regra joga o **almoço das
   12h30** para o topo — como se fosse agora. O M2‑2 já mostrava a saída certa
   (o cartão de feito ocupa o lugar, e o que passou vira a linha "pôr hoje em
   dia"), mas a regra escrita não dizia isso. Agora diz: o cartão de cima é só
   para frente.
7. **"Pôr hoje em dia" tem refeições que ainda não aconteceram.** Pré‑marcar o
   jantar das 19h30 às 15h30 seria exatamente o erro que esta direção recusa.
   As linhas futuras ficam desabilitadas e a frase de leitura de volta termina
   com "fica sem marca: jantar".
8. **A bioimpedância diz "treze números" e tem quinze campos** — erro que
   atravessou o corpo.html sem ser visto. Aqui o número é contado.

---

## O que consertei durante a montagem

- Uma seta de voltar no cabeçalho da sessão (descoberta 1). É o mínimo, e muda
  o cabeçalho desenhado no M1.
- A hora no cabeçalho da sessão e no título do dia, no Agora (descoberta 2).
- O cabeçalho da sessão aberta fora do horário (descoberta 3).
- O botão "+ série" voltou para a linha do exercício anterior, ao lado de
  "Corrigir". Quando troquei desfazer por corrigir, ele tinha sumido do M1‑3 —
  e aí "uma série a mais" só existia na janela curta entre registrar e marcar o
  RIR.
- A tabela do exercício com números tocáveis e o estado novo da régua
  (descoberta 4).
- A regra do cartão de cima e as linhas futuras do "pôr em dia"
  (descobertas 6 e 7).
- A contagem dos 14 dias passou a dizer **por que** mudou, em vez de repetir uma
  frase que valia só para o caso do M2‑6.

---

## Notas

- **Conteúdo real.** Exercícios, séries, faixas, RIR, descansos e músculos do
  Treino A são F84; prioridades, F15; plano alimentar, F181 e F183; água, F194;
  adesão, F213; alvo de peso, F14; casa decimal do peso, F208. **Ilustrativos:**
  as cargas (o 01‑fatos não traz carga por exercício, menos o 55 kg em 9/8/7 do
  próprio treinador, F95), os números da bioimpedância, as médias semanais de
  peso e os horários das séries já feitas.
- **A data.** Terça 06/10/2026 com Treino A não contradiz a prescrição: a
  sequência A→B→C→D→E→aula avança pela ordem, não pelo dia da semana (F81).
  Ontem, segunda 05/10, é dia sem treino registrado — por isso o "pôr em dia"
  abre com o plano de descanso, de quatro refeições.
- **O lanche das 15h30.** O plano diz 16h00 (F181) e ele come por volta de
  15h30 (K4). O protótipo mantém o horário do plano na tela e marca a hora real
  do toque — às 15h30 o cartão de cima já é o lanche, porque a janela é de 30
  min à frente.
- **O peso da manhã registrado às 15h30.** Consequência do salto no tempo: quem
  entra em Corpo depois do salto registra com a hora da tarde. Pelo caminho da
  academia (a tecla "Peso de hoje" dentro do descanso, que abre Corpo) ele
  registra com a hora da manhã. Os dois caminhos estão no protótipo.
- **Para conferir os dois temas sem tocar em nada:** `prototipo.html?tema=light`
  e `?tema=dark`.
