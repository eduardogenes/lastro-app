# Direção C · segunda entrega: seis telas que ninguém desenhou

Desenhos: `aula.html`, `comparar.html`, `sessao-fotos.html`, `corpo.html`,
`semana.html`, `prescricao.html`. Cada um abre no navegador, sem rede, em
viewport de telefone (414 × 896), com os estados de cada tela e a explicação ao
lado. A primeira tela de `aula`, `corpo`, `semana` e `prescricao` responde ao
toque; `comparar` troca de pose ao toque.

A gramática é a mesma da primeira entrega: **lápis** (o previsto), **tinta** (o
confirmado), **hachura** (o previsto cuja hora passou sem marca — não sabido,
não zero), e o contorno laranja do **agora**. Nenhum estado é dito só pela cor.

**Claro e escuro.** Os dois foram desenhados e os dois estão nos arquivos: o
último estado de cada tela põe a mesma tela nos dois temas, lado a lado, e o
botão do topo troca todas de uma vez. O documento em si abre claro e não segue o
tema de quem o abre — quem decide o tema das telas é quem está lendo, não o
sistema do leitor. No aparelho vale a decisão do dono: segue o aparelho, com
troca manual.

F = 01-fatos.md · U, K, D, M = 02-uso.md · P = resposta do dono em
02-perguntas.md · "decisão N" = as decisões do dono passadas pelo coordenador.

---

## 1 · O que cada tela resolve, e por que assim

### `aula.html` — a aula do box

**Resolve:** a 3ª situação mais difícil e a de maior falha de detalhe — 5 aulas
em 8 semanas, nenhuma com movimentos, nenhuma com lousa, 4 de 5 registradas
depois do dia (P1). A janela de registro é depois da aula, sentado, ofegante,
curta (F36).

**Por que assim:** a tela tem um alvo só, **“Fui”**, e diz que ele pode parar
ali. O detalhe serve a uma coisa só, que foi a que o dono pediu: chegar na
próxima aula sabendo qual peso ele costuma pegar (P4, D4). Por isso o detalhe é
uma **lista de cargas**, não um formulário de treino — carga é um valor que dura
meses no box (F123), e confirmar “a mesma” é um toque. A aula é a 6ª da
sequência e avança **por posição**, não por dia da semana (decisão 8; F81).
Nesta tela não existe RIR, não existe aquecimento, não existe descanso herdado,
não existe estação cobrada como pendente e não existe pergunta sobre incorporar
movimento ao programa — tudo isso já existiu aqui e não queria dizer nada (F281
a F286).

### `comparar.html` — comparar fotos antigas

**Resolve:** o que ele diz fazer mais (P8, U13) e que depende de rede e conta
justamente no par que interessa (F232, F238, F252).

**Por que assim:** abre no **par longo** — a mais nova contra a mais antiga da
mesma pose —, porque duas semanas são quase só água e sono (F230). E só compara
pose igual com geometria igual (F229): quando a câmera estava torta, a tela diz
e oferece endireitar até 6°, guardado como parâmetro, com a original intacta e
desfazer sempre (F231). A pergunta do nutricionista sobre a gordura visual mora
aqui, no lugar onde ele já está olhando por vontade própria — ela nunca foi
respondida nenhuma vez, e sem ela a regra não corta (F212, F220, P1). O par de
27 dias serve para a pergunta; o de agosto mostra mais e **não** serve, e a tela
diz os dois.

**Sobre as imagens:** onde entra a foto, o desenho mostra a identificação real
daquela foto — data, pose, estado do arquivo, peso da semana — e as linhas de
geometria de que a comparação depende. Não inventei nenhuma imagem de corpo.

### `sessao-fotos.html` — a sessão, sozinho, a ~3 m

**Resolve:** 9 poses em menos de 5 min, sozinho, a 3 m do aparelho, sem
alcançá-lo (F45, F226, F228).

**Por que assim:** ninguém sabe se ele lê a tela a 3 m, então fui pela
aritmética do aparelho: 414 pt são ~69 mm de papel, e uma letra confortável a
3 m pede 13 a 20 mm — cabem **4 a 8 caracteres por linha**, e as instruções de
pose têm 31 a 85 (F49, F227). Logo, o que carrega sentido a 3 m não é texto:
número gigante, mostrador de giro nos quartos da marca, anel de contagem, barra
de poses e **voz**. O estado 2 é a hipótese “ele não lê”; o estado 3 é a “ele
lê”, e nela cabe o nome da pose e só ele. A tela entregue é a 2 com o nome por
cima: funciona nas duas hipóteses, e nenhuma informação necessária existe só no
texto. O som é liberado dentro do toque de “Começar”, que é a única forma no
Safari (F58); e nada depende de a tela ficar acesa, porque manter o display
aceso falha sem aviso antes do iOS 18.4 e a versão do aparelho não é conhecida
(F59) — cada pose é gravada no disparo, e a sessão retoma na primeira sem foto
(F235).

### `corpo.html` — a tela própria do corpo

**Resolve:** a decisão 2 — peso, fita, bioimpedância e fotos num lugar só, onde
também se registra.

**Por que assim:** duas metades na mesma rolagem. Em cima o que se mede hoje,
com o teclado do app (vírgula de verdade, F63) e o último valor a lápis; embaixo
o que isso virou em semanas, porque o número de um dia não decide nada e a fita
erra de posição mais do que a balança varia de água (F43, F211). Corrigir é
tocar de novo no valor, sem prazo e sem confirmação (decisão 3). A fita guarda,
junto da primeira medida, **onde** ela foi tirada, com as palavras dele, e essa
linha volta em toda medida seguinte. A bioimpedância é transcrição mensal de uma
tela para outra: 13 campos, todos opcionais, e vazio fica vazio — nunca zero.

### `semana.html` — a leitura da semana e a régua

**Resolve:** a decisão que **nunca aconteceu nenhuma vez** (0 avaliações, 0
passos aplicados) e o desejo declarado de rever as semanas (D3, P8). Fica sempre
disponível, sem dia fixo (decisão 8).

**Por que assim:** a tela começa pela saída da regra, nas palavras do
nutricionista, e logo abaixo põe **os números que a produziram**: as duas taxas
semanais separadas, o limite cruzado, a adesão em x de 14, o sinal de força e a
avaliação visual (F215). As duas taxas nunca viram média — somar duas semanas já
fez este produto cortar comida por causa de uma só (F290). O passo de ±150
aparece **no prato antes do toque**: 120 g de arroz cozido por dia a 128
kcal/100 g, 60 g no almoço e 60 g no jantar, em degraus de 15 g, 250 → 310 g
(F218, F291). E nada se aplica sozinho. Quando falta algo, a tela diz o que
falta e leva até lá num toque — com os números medidos, o que falta é a comida
registrada, não o peso.

### `prescricao.html` — o que vem de fora, e a fila que espera

**Resolve:** a decisão 1 — nada é perguntado ao encerrar o treino; o que mudou
no dia espera numa fila para resolver sentado, e a espera vence.

**Por que assim:** terminar a sessão é a situação mais difícil do uso medido —
cinco condições adversas ao mesmo tempo, e 42% a 59% das sessões nem chegam a
ser encerradas por ele (U3, P1). Decisão de programa ali é decisão perdida. A
fila mostra, item a item, o que mudou, de que sessão veio, o motivo anotado e **a
conta que ele não faz de cabeça**: se a flexora passar de 4 para 5 séries, o
posterior de coxa vai de 7 para 8 por semana contra 7 prescritas (F179). Abaixo
da fila fica o resto do que vem de fora: o programa pessoal contra o do
treinador com as diferenças calculadas e a restauração (F160, F161), o relógio
de 6 a 8 semanas por posição (F98, F162), a chegada de uma revisão — que **não
se aplica antes de o dono dizer quem é quem**, porque os nomes mudam entre
versões e o código do exercício nasce do nome (F117, F263, F300) — e o plano
alimentar com o ajuste em vigor visível na linha do item.

---

## 2 · O que as decisões do dono mudam no que eu já tinha desenhado

**A pergunta do fim da sessão sai, e eu ganho a discussão que tinha perdido.** Eu
já tinha recusado decidir o programa na academia (recusa 3 da primeira entrega),
e tinha listado como custo que, se ele nunca decidisse, o programa ficaria como
estava, para sempre. A decisão 1 confirma a recusa e corrige o custo: agora a
espera **vence**. Em troca, a fila sai da lista de pendências do Hoje e vai para
a Prescrição, que é onde ele senta. Minha pergunta 9 (“ele aceita decidir só em
casa?”) está respondida; no lugar dela entra a do vencimento, abaixo.

**Corpo deixa de estar espalhado por Hoje e Semanas.** Na primeira entrega a
pesagem e as medidas eram linhas do roteiro do dia, e a lista histórica ficava em
Semanas › Peso; eu tinha recusado uma aba “Corpo” (recusa 7). A decisão 2
derruba metade dessa recusa: Corpo vira **tela própria**, com registro dentro
dela. Mantive as três abas (Hoje · Semanas · Prescrição) e fiz do Corpo um
destino alcançável num toque de qualquer uma das duas primeiras — o dono aceitou
o custo de sair de onde está, e o custo é exatamente esse: um toque a mais para
a pesagem que hoje entra entre 6:28 e 7:52, na academia (P1, K6).

**“Corrigir no lugar” deixa de ser um princípio meu e vira regra do produto.** Eu
já tinha escrito que o inverso do toque é a correção, não a confirmação. A
decisão 3 acrescenta duas coisas que mudam texto de tela: **não há prazo** e vale
em tudo, inclusive na comida. Some dali qualquer ideia de “o dia fecha”, e o
“Desfazer” do aviso de gravado deixa de ser o caminho principal — o caminho
principal é tocar no valor de novo, a qualquer hora.

**O teclado: minha recusa 1 cai pela metade, e fica melhor.** Eu tinha recusado o
teclado do sistema para números, em qualquer lugar. A decisão 4 corta isso onde
doía: teclado do app onde o do sistema atrapalha (treino, uma mão, suor, 3 m), e
teclado do sistema onde ele não atrapalha — notebook e campos de texto. Os custos
que listei (não dá para colar número, leitor de tela encontra um teclado
estranho) encolhem para o telefone, e desaparecem no notebook, que é onde ele
“acompanha bastante” (P11, U14).

**O agora inverte uma prioridade.** Na primeira entrega, a regra de escolha do
agora punha a refeição na janela (item 3) antes de começar o treino (item 4). A
decisão 7 inverte: em manhã de dia de treino, o treino ganha. A ordem passa a ser
sessão aberta → sessão de ontem não encerrada → **manhã de treino sem sessão** →
refeição na janela → dia de fotos → próximo previsto. O pré-treino das 5:45
continua visível na linha de cima, a um toque.

**A comida ganha estados que eu tinha deixado de fora por falta de resposta.**
“Não comi” passa a ser diferente de “esqueci de marcar” (minha pergunta 3):
“não comi” é tinta — declaração, dia conhecido — e “esqueci” continua hachura.
Guardar **qual** refeição saiu do plano (pergunta 2) deixa de ser dívida: a linha
da refeição carrega o “saiu do plano”, e some o ajuste constrangido que eu tinha
feito, em que a linha virava “sem marca” depois de reabrir. “Não contei a água”
continua como desenhei, e agora com respaldo. As porções passam de duas para
mais: “tudo” continua sendo o toque único do caso comum, e os outros degraus
ficam um toque abaixo — a régua do dono é “o mínimo de toques necessário”, não
“o mínimo de opções”. A ceia entra no plano como **sétimo momento**; os desenhos
mostram os seis da prescrição porque os itens e as calorias da ceia são do
nutricionista, não meus. O previsto continua no horário do plano (pergunta 6
respondida como eu tinha desenhado).

**O RIR e a subida de carga mudam de peso.** Eu oferecia o RIR na linha, sem
cobrar, e mostrava o aviso de subir carga com o RIR da última sessão ao lado
porque o cálculo não o conferia (F169). Com RIR em toda série e com o cálculo
passando a olhá-lo, esse aviso deixa de ser informativo e **vira condição**: o
convite para subir carga só aparece quando o RIR planejado foi cumprido. É menos
convite e mais verdade — e custa um toque a mais em cerca de 16 séries por
sessão, contra os 66% de RIR medidos hoje.

**A hora-limite não entra.** Minha pergunta 1 foi respondida: o app não sabe a
que horas ele precisa terminar. O “fim previsto, com e sem o cardio” do M1 fica
como está, e ele compara de cabeça.

**Paleta e movimento.** A paleta entregue continua — papel quente, tinta azul,
laranja do agora —, porque ela já atende ao pedido e trocá-la agora quebraria a
leitura entre as duas entregas. O que a decisão 6 acrescenta é um critério para
o movimento, que eu tinha só restringido: movimento é permitido quando **diz
alguma coisa** — a tinta assentando confirma o toque, a folha subindo diz para
onde se andou, o anel da foto mostra tempo passando. Nada se move para enfeitar,
e tudo some com “reduzir movimento”.

---

## 3 · O que estas telas recusam fazer

1. **Obrigar detalhe na aula.** “Fui” é registro completo. Custo: enquanto ele
   não anotar nenhuma carga, a referência que ele pediu não existe — e hoje são
   zero aulas detalhadas. O vazio da tela diz isso, e não insiste mais que uma
   vez.
2. **Abrir a comparação no par curto.** O padrão é o par longo. Custo: é
   justamente o par que mais precisa de rede e de conta, porque o aparelho só
   guarda as 4 sessões mais recentes.
3. **Endireitar foto sozinho.** Custo: ele precisa tocar para corrigir 3°, e
   pode não tocar.
4. **Pôr instrução de execução em texto na tela de 3 m.** Custo: se ele ouvir
   mal, perde a instrução daquela pose — a tela não a repete em letra pequena,
   porque letra pequena a 3 m é a mesma coisa que nada.
5. **Aplicar o passo de ±150 sozinho, e tirar média entre as duas taxas
   semanais.** Custo: a régua fica parada enquanto ele não abrir a tela da
   semana. Prefiro parada a aplicada por engano.
6. **Inventar média de semana com uma pesagem só, e oferecer campo de “mais ou
   menos” no peso.** Custo: semanas ficam sem número, e a sequência que a regra
   exige demora mais a existir.
7. **Decidir o que acontece no vencimento de uma mudança.** Desenhei o mínimo
   defensável — o item muda de lugar, não de existência —, e levo a escolha ao
   dono. Uma mudança que some sozinha é um defeito que este produto já teve.
8. **Inventar imagem de corpo nos desenhos de foto.** Custo: ele vê molduras com
   dados em vez de fotos, e precisa imaginar o resto.
9. **Desenhar tendência de bioimpedância com dois pontos.** Custo: os primeiros
   dois meses não mostram evolução nenhuma, só os números do mês.

---

## 4 · Perguntas que eu não tenho como responder sozinho

1. **O vencimento da mudança do dia** — a que o coordenador pediu. São três
   saídas, e preciso de uma:
   **(a) arquivar sem decidir**, com o programa como estava (é o que desenhei);
   **(b) virar permanente sozinha**, o que muda o programa sem ninguém decidir e
   contraria o que o treinador pediu;
   **(c) voltar a perguntar quando aquela posição do treino reaparecer**, o que
   joga a pergunta de volta para a academia.
   E duas perguntas menores dentro dela: **quantos dias**, e se o prazo é igual
   para uma troca de exercício e para uma série a mais. Desenhei prazos
   diferentes (2 a 5 dias) sem base — isso é palpite meu, não dado.
2. **“Não comi” conta como dia conhecido para a adesão?** Declarar que não comeu
   é conhecimento, e isso deveria fazer o dia contar para os 11 de 14. Mas a
   adesão é ponderada pela porção, e uma refeição não comida pesa zero. Um dia
   inteiro declarado como “não comi” contaria como conhecido e com adesão zero —
   é isso que o nutricionista quer?
3. **A ceia:** o que ela tem, a que horas e quantas kcal. É prescrição, não
   desenho. Enquanto não vier, a linha existe sem conteúdo.
4. **As porções:** quais degraus além de tudo e metade — 3/4 e 1/4? E existe
   porção **acima** de 1, para quando ele comeu mais do que o plano?
5. **O som a 3 m.** Desenhei a sessão de fotos dependendo da voz do aparelho. Se
   o telefone estiver no silencioso, ou se a 3 m ele não ouvir bem, a sessão
   perde o guia. Ele ouve? O aparelho fica no silencioso de manhã?
6. **A balança de bioimpedância** entrega os 13 números numa tela só, ou tem
   aplicativo próprio? Se tiver, transcrever 13 campos talvez não seja o
   caminho, e a tela muda.
7. **As medidas com fita:** além de cintura e braço, quais? E com que frequência
   — “sempre” não é um número, e sem número não há previsto a lápis.
8. **As fotos de agosto**, anteriores à rotina, entram na comparação longa mesmo
   com geometria diferente? Desenhei que entram, marcadas. A alternativa é
   escondê-las, e perder o único par de mais de 50 dias que existe.
9. **A régua sempre disponível avisa?** Hoje a tela da semana só muda se ele
   abrir. Quando a saída da regra mudar — por exemplo, passar a indicar +150 —
   ele quer alguma marca em Hoje, ou prefere que a régua só fale quando
   procurada?
