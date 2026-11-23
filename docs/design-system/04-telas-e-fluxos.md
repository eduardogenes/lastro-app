# Telas e fluxos

Todas as telas do app, como estão desenhadas na página viva (`lastro.html`, aba "Telas"), com a camada, os estados desenhados, de onde se chega e para onde levam. Gerado a partir da página: quando ela muda, este arquivo é refeito.

Camadas: **lugar** (tem doca), **destino** (tela cheia com voltar), **tela de ação** (uma tarefa, fundo de cor), **folha** (sobe de baixo). O Voltar desfaz uma camada.

## Moldura e estados

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Confirmação**<br>Só para o que não tem volta. O caminho seguro é o principal; o destrutivo é o contorno, com o verbo. Voltar, Esc e o véu respondem o seguro. | folha sobre Sessão passada | apagar sessão; descartar o treino de hoje; restaurar cópia; voltar ao começo | Sessão passada, Ajustes | — |
| **O que não foi guardado**<br>A faixa "não guardei" fica no topo até resolver. Esta folha diz o que era, por que, e oferece tentar de novo e copiar em texto. Nunca apaga o que a pessoa informou. | folha sobre Hoje | — | — | — |
| **Estados do app inteiro**<br>Os avisos que valem em qualquer tela. Ligue "sem rede", "falha ao guardar" e "treino aberto" no painel ao lado (no celular, nas fichas abaixo) para ver em cima de qualquer tela. | destino | — | — | — |

## Hoje

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Hoje**<br>O topo diz o que importa agora, com um botão só; a cor diz o assunto. Embaixo, o dia inteiro numa linha, o que está ligado e os últimos sete dias. Role para ver a ação grudar no topo e a doca encolher. | lugar | 06h05 · treino daqui a 10 min; dia de aula do box; treino em andamento; treino parado há tempo; confirmar a duração; 12h40 · almoço; 21h00 · pergunta da noite; livre, com lembrete das fotos; comida desligada; primeiro dia, sem treino | Fim do treino, Primeira vez: o que acompanhar | Uma série por tela, Aula do box, Registrar (o "+"), Uma refeição do dia, O que aparece, O tipo do dia, Cardio, Registrar treino passado, Sessão passada, Centro das fotos |
| **Registrar (o "+")**<br>O "+" da doca. O mais provável agora vem primeiro, em lima; o resto em areia. O texto livre entende frases simples e diz o que guardou, ou que não entendeu. | folha sobre Hoje | sugestões; texto: entendeu; texto: não entendeu | Hoje | Uma série por tela, Cardio, "Comi outra coisa", com o tamanho, Corpo |
| **Uma refeição do dia**<br>O que tem na refeição e marcar. "Não foi assim" abre as três respostas da exceção, em vez de "Pulei esta": o app separa quem comeu outra coisa de quem não comeu. | folha sobre Hoje | a refeição; não foi assim; já marcada | Hoje | "Comi outra coisa", com o tamanho |
| **"Comi outra coisa", com o tamanho**<br>Decisão do dono (17/11): o tamanho é guardado. Quatro respostas grandes, sem pesar nem listar. É dado novo: pede campo, migração e a pasta dos agentes. | folha sobre Hoje | — | Registrar (o "+"), Uma refeição do dia | — |
| **O que aparece**<br>O ícone de ajuste no bloco do Hoje. O treino fica sempre; o resto se liga e desliga. Desligar esconde, nunca apaga. | folha sobre Hoje | — | Hoje | — |
| **Cardio**<br>Lacuna do protótipo. Escolha do aparelho em fichas, minutos pela régua, intensidade em seletor. Um "Guardar". | folha sobre Hoje | — | Hoje, Registrar (o "+"), O dia aberto, Pôr o dia em dia | — |
| **O tipo do dia**<br>Tocar na data do bloco. Treino ou descanso, o turno (muda os horários das refeições) e "demanda alta" (dia de mais esforço, a regra do nutricionista sobe a comida). | folha sobre Hoje | — | Hoje | — |

## Treino

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Uma série por tela**<br>A série já vem com a carga e as repetições da última vez. Igual? Um toque em "Feito". Toque em carga ou repetição para escolher o que a régua muda. Embaixo, ao alcance do polegar, tudo o que se aperta no treino. | tela de ação | série 1, como da última vez; sugestão: subir a carga; aviso: intervalo longo; exercício trocado hoje; série 2, com a 1ª feita; a série não foi guardada | Hoje, Registrar (o "+"), Descanso, Pôr em dia, Aula do box | Descanso, A lista do treino, Mudar este exercício, Pôr em dia, Um exercício, Fim do treino |
| **Descanso**<br>Começa sozinho ao confirmar a série. A cor enche a tela de baixo para cima no tempo do descanso: de longe, sem ler, dá para saber quanto falta. "Sobraram quantas?" grava o RIR da série que acabou, se quiser. | tela de ação | 1 min 50 s faltando; acabando | Uma série por tela | Uma série por tela |
| **A lista do treino**<br>O ícone de lista no topo. Ir a um exercício, mudar a ordem de hoje (só os que ainda vêm), deload, abrir as opções e encerrar. | folha sobre Uma série por tela | — | Uma série por tela | Opções do treino, Fim do treino |
| **Mudar este exercício**<br>"Mudar", embaixo da série. Tudo vale só neste treino; no fim, o app pergunta se vira regra. | folha sobre Uma série por tela | — | Uma série por tela | Dor anotada, Foto do aparelho, Um exercício, Catálogo de exercícios |
| **Dor anotada**<br>O freio cita a regra e de quem ela é. Nunca conselho do app. | folha sobre Uma série por tela | — | Mudar este exercício | — |
| **Opções do treino**<br>Lacuna do protótipo. O que vale para a sessão inteira, e não para um exercício. | folha sobre Uma série por tela | — | A lista do treino | Editor de um treino, Progressão, Fim do treino |
| **Pôr em dia**<br>Treinou e não anotou. Marque o que fez; cada um entra com as repetições da última vez, e a carga se acerta no passo. Fica marcado como "registrado depois" e conta igual para a progressão. É tela, não folha: é lista que rola. | destino | no meio do treino; depois: o treino que já fiz | Uma série por tela, Registrar treino passado | Uma série por tela, Fim do treino |
| **Fim do treino**<br>Devolve os números, sem comemorar. Se algo mudou hoje, pergunta de cada mudança se passa a valer; sem resposta, fica só hoje. | tela de ação | com mudanças: vira regra?; sem mudanças; nada mais na fila | Uma série por tela, A lista do treino, Opções do treino, Pôr em dia | Hoje, Plano |
| **Aula do box**<br>Lacuna do protótipo. A aula não tem prescrição fixa: começa vazia e se monta de quatro jeitos (repetir a última, um modelo, colar o texto, foto da lousa). Depois, a lista rápida: um número por movimento, no fim da aula. Cor lilás: aula é do corpo, não do programa. | tela de ação | começar a aula; lista rápida; foto da lousa lida | Hoje | Colar o texto da aula, Catálogo de exercícios, Uma série por tela |
| **Colar o texto da aula**<br>O texto do grupo do box. O app lê e mostra a lista para conferir; o que não entendeu fica de fora, dito. | folha sobre Aula do box | — | Aula do box | — |
| **Catálogo de exercícios**<br>Buscar e adicionar; o que não existe se cria com nome, grupo e unidade. Usado no editor, no "Trocar por outro" e na aula. | folha sobre Editor de um treino | buscando; nada com esse nome; criar um novo | Mudar este exercício, Aula do box, Editor de um treino | — |
| **Foto do aparelho**<br>Para achar o mesmo aparelho na academia. Uma foto por exercício. | folha sobre Um exercício | sem foto; com foto | Mudar este exercício, Um exercício | — |

## Dias

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Dias**<br>O resumo do mês vem antes da grade de sete colunas. A comida pinta o fundo em menta ou meia diagonal. A bola leva a letra do treino, com HX em lilás, arco de turno e anel de cardio. Câmera e régua indicam fotos e medidas. Embaixo, o dia escolhido reúne treino, peso, comida e os outros registros. Dia passado sem treino aceita descanso ou falta, com motivo opcional e a ação “Tirar a resposta”. Ao voltar do dia aberto, a grade mantém a escolha. | lugar | hoje, treino, dia em branco, falta com motivo, fotos e medidas | Responder os dias | O dia aberto, Responder os dias |
| **Responder os dias**<br>Um dia por tela, do mais recente para trás. Um toque por dia; "voltar um" desfaz o último; "todos os que faltam" responde de uma vez. | tela de ação | um dia; o fim | Dias, Semana | Semana, Dias |
| **O dia aberto**<br>Tudo o que aconteceu num dia, para conferir e corrigir: o treino (que abre a sessão), o cardio, o peso, a comida refeição por refeição. | destino | dia de treino; nenhum registro | Dias | Sessão passada, Pôr o dia em dia, Registrar treino passado, Cardio |
| **Pôr o dia em dia**<br>Para o dia que ficou em branco: o que foi, de uma vez. | folha sobre O dia aberto | — | O dia aberto | Registrar treino passado, Cardio |
| **Sessão passada**<br>Lacuna conhecida. Começo e fim corrigíveis; cada série corrigível na folha da série. "Registrado depois" e "não feita" aparecem marcados. Apagar a sessão pede confirmação. | destino | a sessão; uma série não foi guardada | Hoje, O dia aberto, Um exercício | Uma série passada, Confirmação |
| **Uma série passada**<br>As mesmas réguas da série de hoje, com o RIR, "não foi feita" e apagar. Se falhar ao guardar, o número fica na folha e o botão vira "Tentar de novo". | folha sobre Sessão passada | corrigir; não feita; falhou ao guardar | Sessão passada | — |
| **Corrigir a hora**<br>O seletor de hora é uma régua de cinco em cinco minutos. "Agora" é um atalho. | folha sobre Sessão passada | — | — | — |
| **Registrar treino passado**<br>"Já treinei e não anotei". Primeiro qual treino foi e quando (régua de dias), depois "Pôr em dia" com os exercícios. "Fora da prescrição" registra um treino livre. | destino | qual treino; fora da prescrição | Hoje, O dia aberto, Pôr o dia em dia | Pôr em dia |

## Corpo

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Corpo**<br>O peso de hoje se arrasta na régua, no próprio bloco lilás. Embaixo, a evolução em quadros, as medidas ligadas, a bioimpedância e a entrada das fotos. | lugar | ainda não pesou hoje; pesou hoje; conta sem dado | Registrar (o "+"), Medir agora | Peso, Uma medida, Bioimpedância, Tudo na mesma data, Medir agora, O que medir, Centro das fotos |
| **O que medir** | folha sobre Corpo | — | Corpo | — |
| **Medir agora**<br>Uma medida por tela, com o desenho de onde passar a fita. A segunda leitura é sempre pedida; se diferirem mais de 0,5, uma terceira decide. "Guardar só esta" existe e marca a medida. | tela de ação | 1ª leitura; pedindo a 2ª; as duas diferem; dobra com adipômetro; medidas guardadas | Corpo, Uma medida | Como medir, Corpo |
| **Como medir** | folha sobre Medir agora | — | Medir agora | — |
| **Peso**<br>A média da semana em linha, as pesagens do dia em pontos e a faixa do alvo. A taxa por semana embaixo, com o selo de acima ou abaixo do alvo. Cada pesagem se corrige. | destino | tudo; 4 semanas | Corpo, Semana | Corrigir uma pesagem, Semana |
| **Corrigir uma pesagem**<br>Lacuna conhecida. A mesma régua, a data e a hora; apagar manda o aviso com desfazer, porque é reversível. | folha sobre Peso | — | Peso | — |
| **Uma medida**<br>A linha da medida com as sessões de fotos marcadas embaixo, como medir e o histórico, que se corrige ou apaga. | destino | com histórico; ainda sem medida | Corpo | Medir agora, Corrigir ou apagar medida |
| **Corrigir ou apagar medida**<br>Lacuna conhecida. Igual à pesagem, com as leituras que deram a média à vista. | folha sobre Uma medida | — | Uma medida, Bioimpedância | — |
| **Bioimpedância**<br>Quatro quadros; a massa de gordura não se digita, sai do peso e do percentual. As leituras se corrigem como a medida. | destino | — | Corpo, Nova leitura de bioimpedância | Nova leitura de bioimpedância, Corrigir ou apagar medida |
| **Nova leitura de bioimpedância**<br>Lacuna conhecida. O mesmo fluxo de "Medir agora": um número por tela, na régua, partindo da leitura anterior. O peso da leitura o app preenche. | tela de ação | gordura; músculo; água | Bioimpedância | Bioimpedância |
| **Tudo na mesma data**<br>Arraste o cursor no tempo: peso, cintura, gordura, músculo e a foto mudam juntos. Cada número é a leitura mais recente até aquela data, com a data dela. | destino | — | Corpo | — |

## Fotos

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Centro das fotos**<br>A próxima sessão, a última, e as três consultas. Entra pelo Corpo e pelo lembrete do Hoje. | destino | com sessões; nenhuma sessão ainda; sessão pela metade | Hoje, Corpo, Fim da sessão | Nova sessão, Comparar, No tempo, Galeria, Sessão pela metade |
| **Nova sessão**<br>Quem vai segurar o celular (a pessoa de sempre é o padrão; sozinho é exceção) e "tudo como da última vez?". O que mudou fica escrito na sessão; a lente não pode mudar. | destino | a pessoa de sempre; algo mudou; outra lente | Centro das fotos | A câmera, Para quem nunca fotografou, O preparo |
| **O preparo** | folha sobre Nova sessão | — | Nova sessão | — |
| **Para quem nunca fotografou** | destino | — | Nova sessão | — |
| **A câmera**<br>Lacuna conhecida: a câmera real. O nível vem do sensor; altura e distância, da detecção do corpo, com a frase do que mexer. O disparo só destrava com as três luzes verdes (ou "Tirar mesmo assim", que marca a sessão). Depois do ajuste, as luzes encolhem e a voz fala com quem posa. | tela de ação | pedindo a câmera; câmera negada; abrindo; ninguém inteiro no quadro; ajuste: nível; ajuste: altura; tudo certo; uma pose; troca de posição; sozinho, contagem; saiu torta; fora do padrão | Nova sessão, Sessão pela metade | Tirar mesmo assim?, Fim da sessão |
| **Tirar mesmo assim?** | folha sobre A câmera | — | A câmera | — |
| **Sessão pela metade**<br>O que já saiu, o que falta, e retomar. Refazer uma pose é tocar nela. | destino | — | Centro das fotos | A câmera, Fim da sessão |
| **Fim da sessão**<br>Menta quando tudo no padrão; atenção quando fora. Devolve o número e a ressalva, e leva a comparar. | destino | todas no padrão; com ressalva; fora do padrão | A câmera, Sessão pela metade | Comparar, Centro das fotos |
| **Comparar**<br>Duas datas da mesma pose, de três jeitos. O par que abre é o mais longo: em duas semanas a diferença é quase toda água. A linha das sessões marca a que tem ressalva. | destino | lado a lado; cortina; sobrepor; uma sessão só | Centro das fotos, Fim da sessão, Foto aberta | Mandar para os agentes, Foto comparada, aberta |
| **Foto comparada, aberta** | folha sobre Comparar | — | Comparar | — |
| **Mandar para os agentes**<br>Sempre no mesmo formato, para a leitura ser comparável. Depende de rede: sem rede, diz que manda quando voltar. | folha sobre Comparar | com rede; sem rede | Comparar | — |
| **No tempo**<br>As sessões de uma pose como um filme. Como todas saem do mesmo lugar, o corpo fica parado e só a mudança aparece. | destino | — | Centro das fotos | — |
| **Galeria**<br>Por sessão, com o selo: no padrão (menta) ou a ressalva (atenção). A lixeira fica no canto. | destino | — | Centro das fotos | Foto aberta, Lixeira das fotos |
| **Foto aberta**<br>Andar entre as poses, ajustar, comparar daqui, apagar (vai para a lixeira, com desfazer). Quando a detecção sugeriu um alinhamento, a sugestão do app aparece: "Ver como fica", aceitar ou "Agora não". | destino | a foto; com alinhamento sugerido | Galeria | Ajustar o enquadramento, Comparar |
| **Ajustar o enquadramento** | destino | — | Foto aberta | — |
| **Lixeira das fotos**<br>Lacuna conhecida. Cada foto apagada fica 30 dias: restaurar volta para a sessão (com desfazer); apagar de vez pede confirmação, porque não tem volta. | destino | com fotos; vazia | Galeria | Apagar de vez |
| **Apagar de vez** | folha sobre Lixeira das fotos | — | Lixeira das fotos | — |

## Semana

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Semana**<br>O veredito da comida no topo, com o que a regra olha; as séries por região separando feitas de ainda vêm, para a segunda-feira não parecer alarme. | lugar | não mexer: faltam dias; pode subir; ainda cedo | Responder os dias, Peso | Responder os dias, Aplicar no plano, Os músculos de uma região, Retrospectiva do bloco, Progressão, Peso |
| **Aplicar no plano** | folha sobre Semana | — | Semana | — |
| **Os músculos de uma região** | folha sobre Semana | — | Semana | — |
| **Retrospectiva do bloco**<br>Lacuna conhecida. O bloco inteiro (desde a última revisão do treinador) em quatro respostas: quanto treinou, o que evoluiu, o que parou, a dor. É o que se leva para o treinador. | destino | bloco com dado; ainda cedo | Semana | Um exercício, Progressão |

## Plano

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Plano**<br>O que espera decisão no topo (e o que vence), os treinos, os dias de treino, a comida do nutricionista, alimentos e compras. | lugar | com decisão pendente; decisão vencendo hoje; nada pendente; comida desligada | Fim do treino | Programa, Editor de um treino, Progressão, Revisão do treinador, Uma refeição do plano, Alimentos, Lista de compras, Nova refeição |
| **Programa**<br>Mudança aqui vale a partir do próximo treino. Os treinos, a ordem, as diferenças do treinador e o histórico de mudanças (quando e por quê, com desfazer). | destino | — | Plano, Revisão do treinador | Editor de um treino, O que está diferente do treinador, Histórico de mudanças, Revisão do treinador, Criar treino |
| **O que está diferente do treinador** | destino | — | Programa | Editor de um treino |
| **Histórico de mudanças** | destino | — | Programa | — |
| **Editor de um treino**<br>A faixa de cima mostra as séries por músculo e quanto saiu do que o treinador prescreveu, enquanto se mexe. Ordem pelas setas, séries pelo passo. | destino | — | Opções do treino, Plano, Programa, O que está diferente do treinador | Catálogo de exercícios, Um exercício, Trocar o nome |
| **Criar treino** | folha sobre Programa | — | Programa | — |
| **Trocar o nome** | folha sobre Um exercício | — | Editor de um treino, Um exercício | — |
| **Revisão do treinador**<br>Decisão do dono (17/11): mudança por mudança. Cola o texto, o app lê, mostra cada mudança com a chave; o que ficar de fora continua como diferença sua. Pede regra nova no app (aplicar parte de um treino). | destino | colar o texto; lendo; as mudanças; nada lido | Plano, Programa, Primeira vez: seu treino | Programa |
| **Progressão**<br>Prontos para subir, ganhando repetição, parados. A regra é a do treinador e está escrita embaixo. | destino | — | Opções do treino, Semana, Retrospectiva do bloco, Plano | Um exercício |
| **Um exercício**<br>O próximo passo em cor (lima: subir; atenção: parado; areia: falta pouco), a carga por sessão, e sessão a sessão com a série que bateu o topo em destaque. Tocar numa sessão abre a sessão passada. | destino | pronto para subir; parado; ganhando repetição | Uma série por tela, Mudar este exercício, Retrospectiva do bloco, Editor de um treino, Progressão | Sessão passada, Foto do aparelho, Trocar o nome |
| **Uma refeição do plano**<br>Macros somados dos alimentos; a quantidade de cada um muda na régua. A mudança vale daqui para a frente. | folha sobre Plano | — | Plano | Quantidade de um alimento, Escolher alimento |
| **Quantidade de um alimento** | folha sobre Plano | — | Uma refeição do plano | — |
| **Nova refeição**<br>Lacuna conhecida. Nome, hora pela régua, e em que dias vale. Os alimentos entram depois, um a um. | folha sobre Plano | — | Plano | — |
| **Alimentos** | folha sobre Plano | lista; busca sem resultado | Plano | Criar ou editar alimento |
| **Escolher alimento** | folha sobre Plano | — | Uma refeição do plano | — |
| **Criar ou editar alimento**<br>Lacuna conhecida. Quatro números do rótulo, por 100 g. É o único lugar do app com teclado numérico: o rótulo traz o número exato, e não há "de onde partir" para a régua. | folha sobre Plano | editar; novo; número que não fecha | Alimentos | — |
| **Lista de compras** | folha sobre Plano | — | Plano | — |

## Ajustes e primeira vez

| Tela | Camada | Estados | Chega-se de | Leva a |
|---|---|---|---|---|
| **Ajustes**<br>Conta, o que aparece, lembretes, cópia de segurança e o que apaga. Chega-se pelo "Ajustes" no fim da folha "O que aparece". | destino | com conta; sem conta; senha errada; entrando | Primeira vez: seu treino | Colar a cópia como texto, Confirmação |
| **Colar a cópia como texto**<br>Lacuna conhecida. Para quando o arquivo não abre: colar o texto do arquivo. O app confere antes e diz o que tem nele. | folha sobre Ajustes | colar; lido, antes de restaurar; texto que não é cópia | Ajustes | — |
| **Primeira vez: seu treino**<br>Decisão do dono (17/11): três passos, a pessoa começa vazia e traz o que é dela. Cada passo tem "pular". Restaurar ou entrar na conta é a saída para quem já usa o app. | destino | — | — | Primeira vez: sua comida, Revisão do treinador, Ajustes |
| **Primeira vez: sua comida** | destino | — | Primeira vez: seu treino | Primeira vez: o que acompanhar |
| **Primeira vez: o que acompanhar** | destino | — | Primeira vez: sua comida | Hoje |
