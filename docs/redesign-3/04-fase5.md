# Fase 5 — o visual antigo saiu (17/11/2026)

O dono pediu para apagar tudo do visual antigo e focar 100% no novo. Este
documento diz o que saiu, o que mudou de lugar e o que ficou para refazer na
direção 3. É registro: o que vale para construir continua no
[plano](00-plano.md), nos protótipos e no `DESIGN.md`.

## O que saiu

- **Telas, folhas e componentes do Instrumento:** `src/ui/telas/`,
  `src/ui/folhas/`, `src/ui/instrumento/`, `src/ui/exercicio.jsx`.
- **Estilos:** `src/base.css`, `src/componentes.css`, `src/treino.css`,
  `src/protocolo.css`, `src/tokens.css` e a fonte do Google que eles usavam.
- **O interruptor "Visual novo"** (`src/infra/visual.ts`, a chave
  `lastro-visual` do navegador e a linha de Ajustes). O `index.html` já nasce
  com `data-visual="3"` e tema claro.
- **A barra antiga do descanso** (`#timer` no `index.html`, e o código que a
  pintava e media). O descanso é a tela do treino em foco, que lê
  `ctx.descansoV3()`. O tique que avisa quando o descanso zera ficou
  (`pintaTimer`), sem depender de tela.
- **A tira de sessão aberta** nas outras abas (`FaixaDaSessao`). O Hoje mostra
  "Voltar ao treino"; ver "O que ficou para refazer".
- **53 funções do contexto** (`CTX.*`) e as internas que só elas chamavam, que
  nada do visual novo nem dos testes usava.

## O que mudou de lugar

- A trava do fundo, o isolamento e o foco das camadas foram de
  `src/ui/instrumento/folha.jsx` para `src/ui/v3/camada.js` (a classe do corpo
  travado passou de `ins-travado` para `travado`). O relógio de tela
  (`useAgora`) foi para `src/ui/v3/agora.js`.
- O que valia para a página inteira (documento, campos com 16 px, foco, a
  moldura do `#app`, o aviso curto com "Desfazer", "gire o telefone", o texto
  só para leitor de tela) foi para `src/v3/global.css`, com os tokens do
  visual novo. As transições de vista do navegador ficaram secas.
- A bancada (`src/palco.css`, `src/palco.js`) passou a usar os tokens novos.
- A casca (`src/ui/app.jsx`), `telaCheia()` e as folhas do `main.jsx` desenham
  só o visual novo (`TELAS_V3`, `DESTINOS_V3`, `FOLHAS_V3`).

## O que ficou para refazer

Nada disso tem tela no visual novo hoje:

1. **Tira de treino aberto nas outras abas.** No visual antigo, com uma sessão
   aberta, uma tira no rodapé de Dias, Corpo, Semana e Plano levava de volta ao
   treino. No novo, só o Hoje faz isso.
2. **Colar a cópia de segurança como texto.** Restaurar por arquivo continua
   em Ajustes; colar o texto existia só no visual antigo.

## Os testes

Seguiu a [estratégia](01-testes.md):

- **Saíram inteiros** os 14 arquivos de movimento do Instrumento (`aba`,
  `acende`, `aviso`, `cena`, `dedo`, `descanso`, `enche`, `frio`, `lugar`,
  `movimento`, `pouso`, `sobe`, `toque`, `troca`), `tests/dominio/estilo.test.ts`
  e `tests/ancestrais-de-fixo.js`.
- **Os testes do visual novo** deixaram de ligar o interruptor e passam todos.
- **Regras de dado que chegavam pela tela antiga foram convertidas** para a
  função do app ou para o dado: o fim da sessão por inatividade e a rotação, o
  deload, trocar de dia no meio do treino sem perder série, o fim do treino e
  dois treinos no dia, o descanso (instante-alvo, aviso uma vez, esticar e
  encurtar, de onde veio), a cópia de segurança (lida por `payload()`), a
  semana inteira de ponta a ponta e o lançamento de treino passado.
- **Saíram os casos que olhavam só a tela antiga** (cartões, relógio, régua,
  folhas, rótulos). As regras de tela que a direção 3 mantém estão nos
  `v3-*.test.js`. A lista completa está abaixo. Dela, o que é **regra de dado
  sem teste no visual novo** e vale refazer primeiro:
  - corrigir uma sessão passada: apagar uma série (com lápide quando é a
    única), marcar o RIR, a série não feita entrando na posição dela, e
    "tentar de novo" depois de uma falha (`sessao.test.js`);
  - o tipo de carga na tela (anilha por lado, halter, peso do corpo) e o
    histórico que plota repetições quando não há carga (`carga.test.js`);
  - a fila de mudanças do treino ("vira regra?") e o aviso de que ela vence
    (`agora.test.js`).

## A lista dos casos que saíram

Os 14 arquivos de movimento e `camadas.test.js` (que lia a fonte do painel antigo) saíram inteiros e não estão aqui. Por arquivo:

### `tests/fluxo/agora.test.js` (47)

- no Agora, o cartão da sessão aberta conta as séries e volta para ela
- no Agora a tira de baixo não é desenhada; em outra aba, é
- no Agora, a pergunta de 1h30 mantém o topo COM as duas respostas
- no Agora, o cartão do fim aproximado tem as duas respostas, e "está certo" fecha o assunto
- no Agora, o cartão do treino abre o MODO no dia de hoje — a porta 1
- a linha do treino na comida de hoje leva ao treino: na janela, ao modo; depois dela, ao registro de hoje
- em Dias, o dia de hoje abre como os outros, com o que já foi registrado nele
- no Agora, a refeição longe não é cartão; dentro da janela, diz "faltam"
- a linha acesa da timeline é o assunto do cartão
- no Agora, o cartão da aula é um botão só e leva ao modo
- no Agora, com o dia fechado o topo confirma em vez de ficar mudo
- aparelho que não está guardando avisa ACIMA do cartão
- a fila aparece na Prescrição com as quatro coisas da linha
- "Entra no Treino A" grava no programa, com o motivo
- "Fica só naquele dia" tira da fila e NÃO toca no programa
- responder UMA mudança deixa a outra esperando
- a última mudança respondida tira a sessão da fila DEIXANDO LÁPIDE
- o Agora avisa UMA LINHA na manhã em que a mudança vence
- com algo esperando e nada vencendo, o Agora INFORMA sem urgência
- a mudança cujo treino voltou aparece como vencida, e é DITO
- o que venceu ainda pode virar permanente — é a porta de volta
- o Agora mostra os 14 dias, e a janela é a MESMA que o portão lê
- encerrar o treino com mudança INFORMA no Agora — não é guardado em silêncio
- respondida a mudança, a linha do Agora some
- Dias mostra a comida de cada dia e abre a folha de pôr em dia
- a folha diz que nada está gravado, e nomeia a CAUSA da marca
- a frase de leitura de volta diz as SETE, e é região viva
- a porção acima de 1 se alcança pela folha, sem abrir folha nova
- o desfazer do vencido fecha quando aquele treino volta de novo, e o dado fica
- sem nada esperando, a Prescrição diz o estado, sem elogio
- o cartão do treino diz de onde vem, e o da sessão aberta diz desde quando
- a refeição que o treino empurrou não diz "no plano às": diz que veio depois do treino
- a pesagem da manhã é linha com "Anotar" enquanto não há peso hoje, e leva ao Corpo
- com peso hoje, a linha diz o valor e quando, e não pede nada
- a sessão de fotos vira linha quando faz 14 dias, e só então
- a linha abre no lugar, e só uma por vez
- "Metade" grava a marca com porção ½, como a folha de pôr em dia
- "Não comi isso" faz a única pergunta, com as três respostas
- "Desfazer" tira a marca, com lápide, e a linha volta a oferecer os botões
- a linha diz o estado de cada refeição: sem marca, agora, mais tarde
- as casas dos 14 dias: cheia, ontem sem marca, e hoje marcado sem mexer na conta do portão
- a folha do tipo do dia diz o efeito antes do toque, e "Já fiz" leva ao registro
- a pesagem segue a hora e some depois do café; as fotos não seguem, e dizem que a hora fica anotada
- "Decidir" mostra a conta do volume e a regra do treinador, e cada botão grava
- o cartão da refeição grava no toque, e a leitura de volta diz o que ficou, com Desfazer
- "Não comi isso" no cartão troca os botões pela pergunta, no lugar
- o treino de hoje fechado pela metade ganha a meia forma, e a conta inclui o exercício trocado no dia

### `tests/fluxo/ajuste.test.js` (8)

- o passo diz antes do toque o que vira base, e depois diz quem aplicou, quando e quanto
- com a adesão faltando, a Semana promete não cobrar em outro lugar — e o Agora não cobra
- peso parado mostra os três portões, e o da adesão leva a pôr os dias em dia
- peso subindo rápido mostra taxa, adesão e avaliação visual — sem força
- o vazio lista as semanas, e as duas saídas levam ao Corpo
- o vazio diz a saída quando um buraco separa duas semanas válidas
- "Desfazer" volta o plano ao saldo de antes, e o passo fica no registro marcado
- se o aparelho recusa, o passo não entra pela metade e a tela diz o que não mudou

### `tests/fluxo/aula.test.js` (8)

- a lista rápida registra a aula inteira sem abrir cartão
- a lista rápida não abre o teclado do sistema: carga e medida são botões
- a vírgula só existe na carga, e a carga entra em todas as passadas
- a vírgula no meio da digitação não apaga o que já estava registrado
- reabrir parte do valor registrado, porque o teclado é o único editor dele
- tocar noutro botão troca o painel, e fechar a lista fecha o teclado
- digitar num dia aberto não troca a métrica do topo por uma meta
- e a aula encerrada no toque também não — os dois fechos concordam

### `tests/fluxo/aulaimport.test.js` (1)

- o quadro aparece na tela enquanto a aula acontece

### `tests/fluxo/avanco.test.js` (3)

- com treino em andamento, o atalho aparece nas outras abas
- o atalho diz para onde vai, e leva até lá
- sem exercício começado, o atalho aponta o primeiro não tocado

### `tests/fluxo/cardio.test.js` (12)

- placar da semana aparece no AGORA
- registro rápido sem sair do AGORA
- feito hoje muda o estado da linha
- aviso de dia de perna aparece no momento em que importa
- o mês marca os dias com cardio, em DIAS
- o mês marca cardio sem competir com a letra do treino
- dia só de cardio fica marcado mesmo sem treino
- o dia mostra o cardio junto do treino, e o mês soma o cardio
- a divisão do DADOS em três lugares não engoliu regra nenhuma
- no descanso não há seção de cardio; ele entra pela folha do tipo do dia
- o cardio de hoje aparece no Agora e se apaga ali, com a pergunta antes
- se o aparelho recusa, o cardio esquecido não fica fingindo que gravou

### `tests/fluxo/carga.test.js` (9)

- anilha por lado mostra o total sem contar a barra
- halter em cada mão soma as duas
- um halter só não mostra total
- peso do corpo aceita carga vazia
- correção do tipo persiste e some ao voltar ao padrão
- histórico de peso do corpo plota repetições, não carga
- histórico por lado carrega a unidade no eixo e no resumo da série
- a barra livre é um tipo à parte, e só ela soma a barra
- o tipo de implemento único não se chama mais halter

### `tests/fluxo/ciclo.test.js` (6)

- iniciar marca o tempo antes da primeira série
- pausar para o relógio e retomar continua
- exercício pulado colapsa e dá para desfazer
- detalhe da sessão mostra o que não foi feito e a pausa
- o relógio anda sozinho, sem re-render
- relógio congela na pausa e não anda para trás

### `tests/fluxo/contador.test.js` (3)

- ligar e desligar o deload depois de uma série: a tela diz o que o dado diz
- mudar séries na edição do dia, e o "+ série": a tela diz o que o dado diz
- um escritor só: o contador continua sendo o mesmo nó de texto depois de cada série

### `tests/fluxo/corpo.test.js` (42)

- o veredito da regra é o que aparece na aba corpo
- cintura alta não sobrepõe mais o peso na faixa
- sem registro de comida, a tela manda registrar em vez de cortar
- cardio conta a semana e reseta na segunda
- cardio avisa quando houve treino de perna no mesmo dia
- pesagem errada pode ser apagada
- sessão de cardio registrada por engano pode ser apagada
- preencher treino passado avisa para onde as séries estão indo
- célula de métrica sem medida mostra traço, não a primeira palavra da frase
- o botão de registrar na tela chega até o histórico
- o seletor de data abre pelo link e aceita o campo nativo
- ctx.abreCardio abre e fecha o registro rápido, no cromo do treino
- a tela da bioimpedância tem os cinco campos, e diz qual é opcional
- registrar a leitura grava as cinco com o MESMO instante
- leitura incompleta é RECUSADA inteira, e não pela metade
- a água em branco não impede a leitura
- a tela oferece a data e nunca o futuro
- a tela diz quando foi a última leitura, e se não houve
- registrar DE MANHÃ funciona — o instante de hoje é agora, não meio-dia
- o peso tem porta para o teclado próprio, na folha
- a primeira pesagem deixa de custar catorze toques
- o teclado do corpo escreve no rascunho, e quem grava é o registrar
- o teclado do corpo aceita vírgula, e a régua de 100 g continua ali
- apagar tudo no teclado volta ao ponto de partida, e não a um pedaço
- o formulário de medidas segue a ordem do corpo, e as dobras esperam um toque
- campo vazio não grava, a medida anterior não aparece ao digitar, e o que mudou demais pede conferência
- o ponto onde mediu vai junto, e o detalhe mostra o ponto de cada medida
- apagar uma medida pede pelo painel de pare, e o Esc é "Deixar como está"
- a bioimpedância traz o mês passado no lugar, diz "era" ao lado de cada um e guarda os cinco
- a hora da bioimpedância é editável, e dia passado sem hora não vira 12:00
- cada medida mostra o ponto, abre como medir no lugar, e o ponto padrão já vem preenchido
- os dois pesos têm nome, e a frase diz o que cada um faz
- "Evolução" no cabeçalho do Corpo abre a leitura, e o Voltar fecha
- da Evolução, "Ir para Semana" leva para onde a regra decide
- sem pesagem, a Evolução diz o que vai aparecer, e não desenha eixo vazio
- o vazio de verdade do Corpo diz quanto custa sair dele, com os números da regra
- o número grande do peso é a média da semana, parcial, com a diferença para a última semana completa
- sem pesagem nenhuma, quem fala é o vazio, e não a cobrança da semana
- trocar a data da bioimpedância traz os números daquele dia, e guardar corrige só ele
- o detalhe da medida destaca quando o ponto mudou, e marca os dias de fotos
- o detalhe da bioimpedância tem o histórico das leituras, e apagar leva as cinco
- o peso guarda a hora escolhida, e hora no futuro é recusada

### `tests/fluxo/dados.test.js` (4)

- sessão sem sid abre no detalhe e mostra traço na duração
- a referência do exercício vem do histórico antigo
- abrir o JSON conta como backup
- exercício novo não herda a carga do que ocupava a posição

### `tests/fluxo/descansa.test.js` (7)

- o descanso traz os três, no cartão aberto, e só nele
- a refeição de antes do treino é a de ANTES: a condicional que vem depois não entra
- "comi" grava a refeição na hora, lê de volta, e o segundo toque desfaz
- "+1" grava o copo na hora; recusado, a conta volta e o cartão diz
- o peso de hoje abre a folha curta, grava HOJE mesmo com outro dia armado, e fecha
- número inválido não fecha a folha: o aviso é dito e nada é gravado
- parar o descanso tira os três; fora do modo eles não existem

### `tests/fluxo/edicao.test.js` (3)

- editar só aparece no treino do dia
- cadastrar equipamento novo cria exercício com histórico próprio
- o nome novo aparece no título e no cartão

### `tests/fluxo/endereco.test.js` (4)

- sem registro nenhum, a Prescrição oferece achar o que existe antes de começar
- "Na sua conta" leva ao lugar de entrar
- "Começar com os dois" tira o aviso, e o primeiro registro também
- sem rede, diz o que funciona offline

### `tests/fluxo/esquecido.test.js` (2)

- passando de 1h30 a faixa pergunta, e pergunta até dentro do modo
- dentro do modo a pergunta de 1h30 continua na tela

### `tests/fluxo/estados.test.js` (7)

- pular diz o que guardou, pelo nome, e desfazer diz que voltou para a fila
- encerrar com pendentes pergunta sem a cor de pare, e "Voltar ao treino" não encerra
- máquina ocupada: vale só para hoje, o ★ tem palavra, e as saídas vão por preço
- fazer antes o próximo troca a ordem só hoje, e diz isso
- dor repetida para a régua até a escolha, com as datas e a regra literal do treinador
- deload: ligar diz o corte e marca a sessão; desligar no meio devolve as séries e o registrado fica
- deload: o botão do aviso do treino diz as mesmas palavras do menu, com o número

### `tests/fluxo/fotos.test.js` (13)

- o botão convida quando não há foto e mostra quando há
- a foto entra no cache do aparelho, e só a referência no estado
- apagar tira a referência e deixa lápide
- sem foto, a folha não desenha imagem nenhuma
- foto registrada que não chegou a este aparelho não diz "sem foto"
- a foto tirada aqui sobe para a nuvem
- sem rede, a reconciliação para e não perde a conta
- apagar tira do bucket também, para o byte não ficar órfão
- a miniatura aparece na troca só quando há foto
- sem foto, o lugar dela é o caminho para tirar uma
- tocar na miniatura não abre o exercício junto
- o número do exercício continua visível, embaixo da miniatura
- a miniatura mostra a foto quando os bytes estão em memória

### `tests/fluxo/fusao.test.js` (20)

- estado migra para o plano 4 e a nutrição nasce semeada
- HOJE mostra comida e treino na MESMA timeline, em ordem de relógio
- o cartão-foco responde "e agora?" antes de qualquer resumo
- marcar uma refeição pela linha grava e persiste
- a água sobe no toque e se corrige tocando o número
- abrir uma refeição mostra o que tem dentro e o ajuste só de hoje
- o dia previsto se identifica como previsão, e confirmar muda o alvo
- a cadência da semana é editável e só fala de cadência
- o alvo calórico sai do plano, não de um número escrito à parte
- a unidade é rótulo de coluna; a referência é a coluna ANTERIOR
- o placeholder de carregamento some quando o app monta
- editar a quantidade de um item muda o plano para todo dia
- as folhas empilham em três níveis e voltam uma a uma
- escolher um alimento na busca põe ele na refeição
- cadastrar a partir da busca não abre a quarta folha, e já põe na refeição
- ctx.trocaItem troca o alimento, preserva a quantidade e não mexe em mais nada
- ctx.abreRefeicao e ctx.novaRefeicao empilham a folha certa, e nada mais
- ctx.duplicaRefeicao copia o conteúdo, e a cópia é independente do original
- o copo que não foi gravado não aparece como gravado
- a unidade se escreve junto do número, e some quando não há número

### `tests/fluxo/gravacao.test.js` (4)

- a gravação que falha diz que não guardou, por quê, e até quando o valor vale
- fechar o aviso não apaga a marca, e tentar de novo guarda quando houver espaço
- a série que não foi guardada é dita pelo número dela, com o valor
- no meio do detalhe, o aviso diz que a presença continua guardada — só quando continua

### `tests/fluxo/horario.test.js` (5)

- o relógio diz desde que horas
- detalhe da sessão mostra início e fim
- sessão em andamento mostra só o começo
- horário típico do mês, com o mais cedo e o mais tarde
- o período voltou às células, com a legenda; o horário de início continua com os pontos

### `tests/fluxo/leitura.test.js` (3)

- o painel lê as linhas juntas e diz a inversão
- a tela carrega a ressalva do treinador
- semana sem inversão não mostra o bloco

### `tests/fluxo/lousa.test.js` (3)

- um toque fotografa a lousa: a foto fica no dia, e os bytes no cache próprio
- quando a aula termina, a lousa vira parte da sessão
- "Mandar para transcrever" entrega a foto ao compartilhar do sistema; sem ele, diz o caminho

### `tests/fluxo/navegacao.test.js` (18)

- abrir camada empurra uma entrada no histórico
- o Voltar do sistema fecha a folha em vez de sair do app
- folhas empilhadas fecham uma por Voltar
- o Escape fecha uma folha por vez, mesmo com três abertas
- o Escape sai de um destino de tela cheia, como o Voltar
- o Escape na raiz de uma aba não faz nada
- o Voltar sai de um destino de tela cheia
- a camada aberta logo depois de um fecho pelo botão continua aberta: a volta do app não a fecha
- a folha entra em foco, isola o fundo e devolve o foco ao sair
- ctx.trocaFolha substitui o topo, e o Voltar devolve uma camada só
- o Voltar do sistema fecha o modo em vez de sair do app
- o modo desenha a saída visível, e tira a barra de abas
- folha aberta de DENTRO de um destino é desenhada
- os Ajustes são destino: abrem do canto do Agora e fecham pelo Voltar
- sair do modo e dos Ajustes rola DEPOIS de desenhar, e entrar num destino também
- trocar de aba rola ao topo DEPOIS de desenhar a aba nova
- o foco que um desenho tira da página vai ao título da tela: "Ir para Semana" e o treino aberto no Programa
- ao fechar um destino, o foco volta ao controle que o abriu — e não ao body

### `tests/fluxo/planoalimentar.test.js` (7)

- cada refeição diz o que tem dentro, e o condicional à alta demanda é dito
- o momento criado por ele aparece marcado como dele; os do nutricionista não
- o ajuste acumulado: nenhum passo, ou o saldo dos passos
- o horizonte das compras: 3, 7, 15 dias ou outro número
- um horizonte guardado fora dos três abre como "outro", com o número
- o que só entra em dia de alta demanda fica fora, e a tela diz
- nada esperando diz quando foi a última mudança que entrou no programa

### `tests/fluxo/portas.test.js` (10)

- iniciar, pausar, retomar e encerrar são botões que fazem o que dizem
- o "Encerrar o treino" do menu ··· encerra
- "editar treino de hoje" entra na edição
- os botões do mês andam o calendário, e o de frente não passa de hoje
- o registro rápido do cardio grava pelos chips e pelo botão
- o nome do treino avulso entra pelo campo, e grava ao sair dele
- "Fechar este aviso" fecha o painel e deixa a marca de não guardado
- "apagar a foto" passa pelo pare e apaga
- tocar num alimento da lista abre o editor dele
- o "pronto" do teclado do Corpo fecha o teclado

### `tests/fluxo/protocolo.test.js` (66)

- a montagem vem antes da primeira foto e sai do caminho depois
- quem já tem foto de hoje não vê a montagem de novo
- vídeo deitado sai no recorte 3:4 do meio, como a tela mostra, e nunca esticado
- a foto anterior da mesma pose aparece antes do disparo
- na primeira vez a tela diz que não há referência, sem quadro quebrado
- sem conta, as fotos do corpo dizem que existem só neste aparelho
- com conta, o que não subiu é contado, sobe num toque, e o aviso sai
- a foto que a nuvem não devolveu diz isso, e tentar de novo traz
- sem sessão nenhuma, o resumo convida e não oferece comparação
- comparar só aparece quando há duas sessões na mesma pose
- apagar uma foto antiga pela Comparar: sai da sessão dela, com lápide, e o par volta ao padrão
- cada lado da comparação diz a hora da foto; referência sem instante fica sem hora
- backup antigo, sem protocolo nenhum, entra sem quebrar
- ajustar grava o recorte no estado e não toca nos bytes
- a foto sobreposta pode ser trocada para qualquer outra data
- a tela de ajuste abre com o fantasma da sessão anterior
- na primeira sessão não há fantasma, e a tela não quebra
- ajustar não é oferecido onde não há foto
- a tela da pose oferece os dois caminhos de captura
- sem getUserMedia, a câmera do sistema volta a ser a principal
- abrir a câmera pede a traseira, no formato do sensor
- disparo sem temporizador guarda a foto e avança a pose
- o disparo é o obturador, um clarão e o bloco da pose fechando — não o alarme do descanso
- a pose que não coube não ganha obturador nem clarão: o bloco dela fica marcado na câmera
- a foto preta não é guardada: a pose volta no fim da fila, e a voz diz
- entre duas poses com giro, a tela mostra o giro grande e a voz diz
- a contagem diz os três últimos em voz
- o preparo mostra a ordem das poses e liga o som no toque de começar
- o fim da sessão diz o que ficou guardado, o tempo real e a próxima data
- a pose é dita em voz, ao abrir a câmera e a cada pose nova
- sem síntese de voz no aparelho, a câmera abre e dispara igual
- a contagem pode ser cancelada antes de disparar
- sem quadro ainda, a captura recusa em vez de gravar preto
- a câmera abre com a sobreposta da sessão vizinha
- depois do disparo a sobreposta acompanha a nova pose
- a foto da câmera interna entra pelo mesmo caminho da do sistema
- refazer pela câmera deixa lápide, como pelo sistema
- a pose que não coube para a sessão, fica marcada, e "Tentar de novo" a guarda
- a pose que não existe lá atrás: o par recua sozinho e diz que recuou
- a cortina: uma foto por cima da outra, e o dedo anda a divisa
- um toque tira a sessão inteira: a voz acaba, a contagem curta começa e dispara sozinha
- parar para a sequência: a voz acaba e nada mais dispara
- depois de um giro a contagem é mais longa, e a última pose fecha a sequência
- a foto da câmera do app leva a lente e o nível do celular no disparo
- sem sensor de movimento, a câmera abre e dispara igual, sem nível na foto
- a sobreposta da câmera vai crua, sem o zoom do ajuste que ela ganhou depois
- as guias da cabeça e dos pés estão no quadro da câmera
- o padrão é alguém tirando: a montagem é a de quem fotografa, e a escolha fica no aparelho
- com alguém tirando, a sessão começa pelo ajuste, e a voz pede para esperar
- com alguém tirando, um toque é uma foto: a miniatura fica no canto, e a pose seguinte espera 1,5 s
- o toque e o clique do mesmo dedo tiram uma foto só
- refazer na miniatura volta para a pose, e a fala da seguinte não sai
- refazer depois de a pessoa já ter girado manda girar de volta
- tocar fora do nível: a foto sai, o app avisa e pergunta, e Repetir não guarda nada
- registrar assim guarda a foto torta com a inclinação verdadeira, e o clique não toca duas vezes
- o giroscópio entra no registro, e a foto que pode ter tremido avisa na miniatura
- a câmera do app fica na 1× e grava o zoom que a câmera devolveu
- trocar para sozinho no meio larga a foto torta e volta à sessão num toque
- com conta, a foto de verdade guarda o original, que sobe e sai do aparelho
- sem conta, a foto de verdade vale para a tela, e o original não fica acumulando aqui
- foto de verdade que falha, chega deitada ou fora de 3:4: fica o quadro do vídeo, sem original
- refazer põe a anterior na lixeira, com o original dela, e o da nova sobe
- apagar de vez, da lixeira, leva a foto e o original, daqui e do bucket
- ao terminar as poses, o fim da sessão oferece medir a fita agora
- a lixeira restaura a foto na sessão dela
- a galeria mostra as sessões da mais nova para a mais antiga, e a foto abre em tela cheia

### `tests/fluxo/regua.test.js` (14)

- a repetição é botão, e o toque abre a régua
- tocar num número registra a série e fecha a régua
- a régua diz qual número foi a última vez
- sem histórico a régua não mente sobre a última vez
- a seta anda uma JANELA, e não um valor
- a seta não mostra número nenhum
- a janela sobrevive a um repinte
- fechar o cartão e reabrir não herda a janela de antes
- tocar de novo no valor escolhido apaga
- o valor registrado aparece escolhido na régua
- a porta "outro valor" abre o teclado próprio
- só uma coisa abre embaixo da linha
- "+ série" vira mudança do dia, traz a carga de hoje e abre a régua com a série anterior
- o cartão aberto tem as duas metades: a leitura e o polegar

### `tests/fluxo/retro.test.js` (2)

- dia vazio do mês é atalho para lançar, pelo dia aberto
- de Dias, um dia passado vira descanso pelo dedo, e o mês mostra a marca

### `tests/fluxo/revisao.test.js` (8)

- lê, pergunta antes de gravar, e não grava enquanto falta resposta
- "É a mesma": o histórico fica com o exercício, e o programa passa a ser o da revisão
- "É outro exercício": entra um exercício novo, e o histórico do antigo não vai junto
- as mudanças dele no treino que a revisão substitui são ditas antes
- se o aparelho recusa, nada da revisão fica
- depois da revisão, restaurar volta ao programa da revisão, e não ao antigo
- treino novo na revisão entra no fim da sequência; linha não entendida é dita
- o Voltar do sistema fecha a revisão

### `tests/fluxo/ritmo.test.js` (3)

- o cartão de um movimento com grandeza não pede RIR nem aproximação
- exercício cadastrado por ele pode declarar grandeza
- o cabeçalho acompanha a quantidade enquanto ele digita

### `tests/fluxo/serie.test.js` (10)

- o descanso começa em QUALQUER série, não só na última
- apagar o campo rearma o disparo daquela série, e só dela
- tocar na coluna ANTERIOR registra a série inteira
- todo controle do cartão de exercício tem nome acessível
- o descanso sobrevive a fechar e reabrir o app
- descanso já vencido não ressuscita
- corrigir uma série depois de reabrir o app não inicia descanso
- o anúncio é invisível, e isso é decisão e não descuido
- corrigir pela régua diz que é correção: o guardado, "agora" no botão e "Corrigi" no anúncio
- registrar pela primeira vez não diz "corrigir"

### `tests/fluxo/sessao.test.js` (21)

- o contador de séries acompanha a digitação sem re-render
- o relógio da sessão é filho direto do main, senão o sticky descola
- dentro do modo o relógio continua filho direto de um main
- a barra do modo não repete a hora do iPhone: tem a saída e o ···
- entrar no modo de outra aba não congela o relógio da sessão
- o detalhe de um treino do plano oferece corrigir e apagar
- corrigir uma sessão de outro dia diz que não reabre aquele treino
- ctx.salvaEdicao fecha a linha, carimba a correção e recusa deixá-la sem série
- tocar a série abre a régua, e o toque grava a correção
- a carga abre o teclado do app, com vírgula
- o RIR da série passada marca e desmarca
- apagar uma série passa pelo painel e deixa as outras na posição
- apagar a única série leva o registro do exercício, com lápide
- se a gravação falha, a série continua a guardada e o toque fica dito como tocado
- "Tentar de novo" depois de o RIR falhar grava o RIR, e não zera as repetições
- "Tentar de novo" depois de a carga falhar grava a carga
- a correção acha o registro pela chave, mesmo com a lista do exercício mudando
- a série não feita entra pela régua, na posição dela, com a carga da anterior
- exercício inteiro não feito ganha registro, entre os outros pela ordem do tempo
- se lançar a série falha, ela continua não feita
- lançar a série 3 com a 2 não feita deixa a 2 não feita

### `tests/fluxo/sincronia.test.js` (2)

- o descanso aparece no mês e no dia, e do mesmo jeito
- login expirado não é sem rede: o Agora diz, e sem rede continua em silêncio

### `tests/fluxo/teclado.test.js` (13)

- a ordem das teclas é a da calculadora, não a do telefone
- o teclado FÍSICO digita, e era o único defeito nomeado do próprio
- Enter e Escape fecham o painel
- o painel recebe o foco ao abrir
- o visor é região viva, e informa sem interromper
- as teclas que não são dígito têm nome acessível
- o visor nasce com o valor que já estava, e não do zero
- o pronto fecha, e o que foi digitado fica
- a carga é botão, e o toque abre o teclado próprio
- a vírgula existe na carga, e o visor diz a unidade
- a carga com vírgula entra como número
- a segunda casa decimal não entra
- o teclado da carga e a régua não ficam abertos juntos

### `tests/fluxo/telaprograma.test.js` (8)

- a lista mostra os seis dias e a conta contra o treinador
- todas as telas do programa renderizam
- exercício cadastrado por ele conta no painel
- o painel de corpo avisa quando o programa saiu do alvo do treinador
- músculo que saiu do programa mas foi treinado continua aparecendo
- a Prescrição abre o programa — o lugar que o possui tem a porta
- cada linha do programa abre o histórico daquele exercício
- o histórico abre POR CIMA do programa, e o Voltar devolve o programa

### `tests/fluxo/telas.test.js` (44)

- paleta e tom preservados
- os cinco LUGARES da shell renderizam, e nenhum é a sessão
- todo chip de um lugar abre, e não só os que algum caso visita
- o app abre no AGORA, não na sessão
- o modo tem a ROTAÇÃO e não tem placar nenhum
- o mês marca os dias, e um dia vazio abre o dia com "Registrar treino"
- dor em duas sessões seguidas sugere trocar o ângulo
- pausa longa suspende o selo de subir carga
- anotação e dor ficam atrás de um link
- correção de sessão passada altera e apaga
- corrigir uma série pelo histórico não apaga o RIR de nenhuma série da sessão
- a carga com vírgula no campo de correção volta igual ao salvar
- séries por músculo compara com o mesmo ponto das semanas anteriores
- painel de músculos avisa quando há treino avulso no período
- o gráfico do histórico é desenho, não comportamento
- cada série tem carga, repetição e RIR, com o anterior ao lado
- o RIR entra na própria série, em dois toques
- tocar de novo no valor escolhido limpa o RIR
- a escala abre só na série tocada
- o descanso é um por exercício, não um por série
- a tabela do cartão não alcança o formulário de corrigir sessão
- o RIR vazio não desenha fio: o ponto já ocupa o lugar
- o cabeçalho da tabela cabe nas próprias colunas
- a tabela usa a largura do cartão, sem recuo herdado
- o pior caso do "anterior" cabe sem cortar
- dia com dois treinos abre o dia com os dois, em vez de abrir um deles em silêncio
- dia com um treino só abre o dia, e a linha abre a sessão
- abrir um exercício traz a série para a tela
- o cartão de exercício tem endereço no DOM
- as regras de execução nascem fechadas e abrem uma por vez
- a prescrição e a máquina do app são LUGARES diferentes
- as portas do programa são três, e cada uma responde outra pergunta
- a retrospectiva mudou de casa e continua abrindo
- a pegada aparece onde há decisão, e cala onde resumir seria pior
- as sete tabelas de ação entregam o inventário inteiro, e tudo nelas é chamável
- ctx.cabecalhoDeHoje nomeia o dia e diz de onde vem o tipo do dia, sem inventar
- ctx.abreSessaoDoDia sem célula não abre nada
- todo aviso que para o dedo diz o que acontece, e diz na primeira palavra
- antes de ligar, o menu traz a regra do treinador LITERAL e assinada
- o INTERRUPTOR do deload não está mais em Prescrição nem em Ajustes
- o ciclo saiu do cabeçalho da sessão e mora em Semana, ao lado da retrospectiva
- o ··· tem o treino no título, e os itens que cabem sem sessão
- "Descartar esta sessão" diz quantas séries apaga, e apaga sessão e séries
- recusar o pare do descartar deixa a sessão e as séries

### `tests/fluxo/trocaprograma.test.js` (5)

- restaurar o programa novo preserva o histórico do antigo
- backup exportado e reimportado preserva o RIR do plano e o da série
- o HYROX é sessão da rotação sem virar série de hipertrofia
- adicionar movimento no dia aberto abre o catálogo e entra sem virar troca
- exercício por tempo não recebe linguagem de hipertrofia

### `tests/fluxo/turno.test.js` (9)

- o botão PREVISTO oferece os três turnos, com a hora de cada um
- cada opção diz de antemão qual refeição vira o pós-treino
- escolher o turno reordena o diário
- o selo de pós-treino aparece na refeição certa
- o turno é ajuste de HOJE: o plano não se move
- o almoço que não cabe no treino vai para depois dele
- voltar para a manhã desfaz o deslocamento
- em dia de descanso o turno não é oferecido
- ctx.setTurno grava o turno de hoje e fecha a folha, e a manhã apaga a chave
