# Componentes

Cada componente com anatomia, variantes, tamanhos, estados, conteúdo,
acessibilidade e o que fazer e não fazer. Todos estão desenhados, com todos os
estados, na galeria da página viva (`lastro.html`, aba "Componentes"). Os
valores são tokens de [tokens.css](tokens.css).

Estados que todo controle tem, e que não se repetem abaixo salvo quando mudam:

| Estado | Como |
|---|---|
| repouso | o desenho base |
| toque | encolhe 3% em 120 ms (`--d-toque`) |
| foco (teclado) | anel de 2,5 px de `--foco`, afastado 3 px, contornando a forma (pílula vira pílula) |
| desabilitado | fundo transparente, contorno **tracejado** de 2 px em tinta, texto em `--texto`; e, quando cabe, uma frase do porquê ("travado até ficar verde"). Nunca cinza translúcido: sobre cor ele ficava ilegível (3,4:1 no lima) |
| carregando | o rótulo vira "Guardando…" ou "Lendo…", sem girar nada; o botão não muda de tamanho e não aceita segundo toque |
| erro | não é estado de botão: vira faixa ou aviso com frase |

---

## 1. Bloco do momento

O topo de cor do Hoje (e de Semana, Corpo, centro das fotos, fim de sessão).
Diz o que importa agora, com um botão só.

**Anatomia**, de cima para baixo: linha zero (data e hora à esquerda, um
ícone de ajuste à direita, 13 px, 600, 44 de altura) · quando (14 px, 700,
com o ponto que pulsa quando é "agora" ou "em andamento") · título
(`--t-heroi`) · apoio (`--t-texto`, até 2 linhas) · ações (um principal, no
máximo um de contorno) · saída discreta. Fundo da cor do assunto, quinas de
baixo de 34, margem 20, 8 em cima e 20 embaixo.

**Variantes**

| Variante | Cor | Quando |
|---|---|---|
| treino | treino | treino do dia, daqui a pouco ou agora |
| em andamento | treino | sessão aberta |
| parado há tempo | treino | sessão aberta e esquecida: "Continuo treinando" / "Já parei" |
| confirmar duração | corpo | sessão fechada sozinha: "Está certo" / "Corrigir" |
| aula | corpo | dia de aula do box: "Fiz a aula" |
| refeição | refeição | meia hora antes até 90 min depois |
| pergunta da noite | corpo | à noite, com refeição sem resposta. Título em 36 |
| livre / dia fechado | feito | nada para agora. **Encolhe para faixa**: título 30, sem botão |
| veredito | semana ou treino | Semana: "Não mexer." / "Pode subir." |
| fim de tarefa | feito, ou atenção se fora do padrão | sessão de fotos guardada, medidas guardadas |

**Conteúdo.** Título: o nome da coisa ("Treino B", "Almoço"), nunca uma
frase motivacional. Até 12 letras em 50; mais que isso, 36. Apoio: o que
tem, em números ("22 séries, perto de uma hora"). Quando: tempo relativo
("daqui a 10 min", "era às 12h30"), em caixa baixa.

**Movimento.** Ao mudar de momento, a cor troca em 450 ms e o conteúdo entra
em sequência. Redesenho do mesmo momento não anima.

**Ao rolar,** quando o bloco sai da tela, a ação gruda no topo: pílula de 56,
cor do assunto, contorno de tinta, nome e um botão de 44.

**Acessibilidade.** O título é o `h1` do lugar. O ponto que pulsa é
decorativo. O ícone de ajuste tem nome ("Escolher o que aparece").

**Faça:** um principal. **Não faça:** dois principais; cinza sobre a cor; um
quarto botão (o que não couber vai para a folha "Ver").

## 2. Doca e botão "+"

**Anatomia.** Pílula de tinta de 64, flutuando a 14 da borda de baixo e da
lateral, com os cinco lugares (Hoje, Dias, Corpo, Semana, Plano). O lugar
atual vira uma pílula de papel com ícone e nome; os outros são ícone de 52 ×
52 em `--texto-sobre-acao-2`. Ao lado, o "+": círculo de 64, lima, contorno
de tinta de 2.

**Estados.** Aberta · encolhida (ao rolar para baixo, só o lugar atual fica,
sem o nome, 64 de largura) · escondida (em destino, em tela de ação, com
campo em foco) · com a tira do treino aberto acima.

**Tira do treino aberto.** Pílula lima de 54, contorno de tinta, ponto que
pulsa, "Treino B · 8 de 22" e seta, 10 acima da doca. Aparece em Dias,
Corpo, Semana e Plano com sessão aberta. No Hoje, **não**: o bloco do momento
já diz que o treino está aberto, e ao rolar a ação gruda no topo ("Treino B ·
8 de 22 · Voltar"); a tira diria a mesma coisa duas vezes. Toque: volta ao
treino.

**Acessibilidade.** `nav` com nome "Lugares"; o atual com
`aria-current="page"`; cada ícone com o nome do lugar. O "+" se chama
"Registrar".

**Não faça:** ação na doca além do "+"; esconder o nome do lugar atual
quando aberta.

## 3. Régua

O número se arrasta, não se digita.

**Anatomia.** Valor grande acima (o tamanho depende do contexto: 96 no peso,
66 na série). A fita: marcas de 2 px, menores (22 de altura, tinta a 28%) a
cada passo e maiores (34, tinta) a cada "cada", com o número embaixo (13 px,
700). O ponteiro: traço de tinta de 3 × 44 no centro. A fita vaza 22 px para
além da margem dos dois lados.

**Variantes** (passo · marca grande · largura do passo)

| Para | Passo | Grande a cada | px por passo |
|---|---|---|---|
| peso (kg) | 0,1 | 1 | 12 |
| carga | 2,5 (halter: 2; placa: conforme o aparelho) | 10 | 16 |
| repetição | 1 | 5 | 30 |
| medida com fita (cm) | 0,1 | 1 | 12 |
| dobra (mm) | 0,5 | 5 | 14 |
| quantidade de alimento (g) | 5 | 50 | 14 |
| bioimpedância (% ou kg) | 0,1 | 1 | 12 |

**Estados.** Repouso (mostra o valor de partida: da última vez, ou o
anterior) · arrastando (o valor grande muda na hora, sem animação) · fora da
faixa (para no limite e não passa) · foco por teclado (setas mudam um passo;
Page Up/Down, uma marca grande).

**Sempre junto:** os botões "−" e "+" de passo, de 44, nas pontas, para quem
não arrasta (`aria-label` "menos 2,5 quilos"). A régua é um `slider` com
`aria-valuenow` e `aria-valuetext` ("60 quilos").

**A exceção é a série do treino:** ali a régua vem sem os passos, para a tela
caber sem rolar com "Feito" ao alcance do polegar. Quem não arrasta usa a
própria régua, que é `slider` (setas do teclado, e o gesto de ajustar do
leitor de tela); o par, logo acima, diz o valor com a unidade por extenso.

**Conteúdo.** Embaixo, a referência: "da última vez: 60 × 9", "primeira vez:
comece perto de 35 cm".

**Não faça:** teclado numérico para número; easing no valor; régua para
texto.

## 4. Botões

| Variante | Desenho | Altura | Onde |
|---|---|---|---|
| Principal | pílula de tinta, texto papel, `--t-botao` | 58 (68 no treino e na medição) | a ação da tela; um só |
| Contorno | pílula transparente, contorno de tinta de 2 | 58 | a segunda ação, ao lado do principal |
| Saída discreta | texto sublinhado, 14 px, 600, área de 44 | 44 | "Pulei esta", "Hoje não vou treinar", "Tirar mesmo assim" |
| Pequeno | pílula de tinta ou superfície, 15 px | 44 | dentro de faixa, de aviso, de "subir para?" |
| Ícone | 44 × 44, ícone de 24 | 44 | voltar, fechar, lista, lixeira |
| Disparo | círculo de 84, tinta, anel de papel e anel de tinta | 84 | câmera |

**Conteúdo.** Verbo no infinitivo ou a coisa feita: "Começar", "Comi",
"Guardar a 2ª", "Fiz a aula". Até 3 palavras no principal; no contorno, 2.
Seta → quando leva a outra tela; certo ✓ quando grava.

**Não faça:** dois principais; principal em cor que não seja tinta; texto
solto que é botão sem sublinhado.

## 5. Fichas e segmentos

- **Ficha de resposta**: pílula de superfície de 48, 15 px, 600. A escolhida
  fica em tinta com texto papel. Duas ou três lado a lado. Sobre o fundo,
  leva contorno de `--contorno`; sobre a pergunta (areia), não precisa.
- **Ficha de filtro** (poses, regiões): pílula de 44, contorno de 1,5; a
  escolhida em `--selecionado` com contorno de tinta de 2. Em fita
  horizontal que rola.
- **Seletor em pílula** (2 a 3 opções exclusivas: "Lado a lado · Cortina ·
  Sobrepor", "Dia de treino · Dia de descanso"): trilho de areia, 4 de
  dentro, opções de 44; a escolhida em tinta.
- **Selo**: pílula de 28, 12 px, 700, menta ("no padrão"), atenção ("outra
  luz", "fora do padrão"), areia ("abaixo do alvo"), lima ("pronto para
  subir"). Sempre com palavra; o ícone é opcional.
- **Segmentos** (progresso): traços de 5 de altura, 3 de vão, raio de pílula.
  Feito em tinta, em curso em tinta a 45%, a fazer no trilho. Na câmera, um
  vão maior separa as quatro posições. Em "responder os dias", traço de 8 e
  "não lembro" tracejado.

**Acessibilidade.** Fichas de resposta são `radio` num `radiogroup` com
nome; seletor, idem. Segmentos têm um texto equivalente ("série 3 de 22").

## 6. Linha de lista

**Anatomia.** 60 de altura mínima, fio de 1,5 em cima (exceto a primeira),
ícone opcional num círculo de 42, nome (`--t-nome`), apoio (`--t-rotulo` em
`--texto-legenda`), valor à direita (`--t-valor-linha`, com a unidade embaixo
em 12 px) e, à direita de tudo, a marca do que acontece ao tocar.

| Marca | Quer dizer |
|---|---|
| seta › | abre outra tela ou folha |
| "+" | liga ou cria (o nome fica em `--texto-legenda` enquanto desligado) |
| chave | liga e desliga ali mesmo |
| nenhuma | é só leitura |

**Variantes.** Simples · com valor · com mini gráfico (56 × 28) · de
histórico (data + "de manhã" à esquerda, valor, seta) · de escolha marcável
(círculo de 32 que vira tinta com certo; nome riscado nas compras) · de
editor (setas de ordem e passos de série).

**Conteúdo.** Nome até uma linha (corta com reticências só em nome de
alimento e exercício longo, e o nome inteiro está no destino). Apoio até uma
linha, em números.

**Não faça:** caixa em volta da lista; linha que abre algo sem seta.

## 7. Seção

Título (`--t-secao`) com uma nota opcional à direita (`--t-rotulo`,
`--texto-legenda`), 18 acima, 10 até o conteúdo. A nota diz o recorte ("últimos
7 dias", "toque para corrigir"), nunca repete o título.

## 8. Folha

**Anatomia.** Sobe de baixo sobre o véu. Fundo papel, quinas de cima de 36,
puxador (44 × 5, divisória) 10 do topo, título `--t-folha`, apoio
`--t-apoio` em `--texto-2`, conteúdo, ações embaixo. Margem 20; embaixo, 20 +
área segura. Até 90% da altura; passou, rola por dentro com o título fixo.

**Fecha** no véu, no Esc, no Voltar do sistema e no "Fechar"/"Cancelar" quando
há. Arrastar o puxador para baixo também fecha.

**Variantes.** De escolha (lista de opções) · de régua (um número) · de
confirmação (ver 10) · de leitura (como medir, dor anotada).

**Acessibilidade.** `role="dialog"`, `aria-modal`, nome pelo título; o foco
entra no título e volta para quem abriu.

**Não faça:** folha sobre folha mais de uma vez (a segunda substitui a
primeira, e o Voltar devolve a primeira); formulário longo em folha.

## 9. Tela cheia

Duas, com papéis diferentes:

- **Destino** (consulta que se abre de um lugar): fundo papel, cabeçalho fino
  com voltar (seta de 24 em área de 44, título `--t-destino`, nota à
  direita), conteúdo que rola. Sem doca.
- **Tela de ação** (treino, descanso, medir, câmera, responder os dias,
  aula): fundo da cor do assunto, a tela inteira, sem rolar quando der.
  Topo de 48 com recolher (seta para baixo) ou fechar (×) à esquerda, o que é
  e o relógio no meio, a lista à direita; segmentos embaixo do topo; o
  conteúdo empurrado para baixo, perto do polegar; o botão grande embaixo de
  tudo; as saídas sublinhadas embaixo dele.
- **Âncoras da tela de ação.** O botão principal é **um só, de largura toda**,
  e fica no mesmo lugar em todos os passos da tarefa (série, descanso, fim;
  cada leitura da medição; cada dia em "responder os dias"; cada pose). A linha
  das saídas é sempre reservada (44 px), mesmo vazia, para o principal não
  descer quando ela some. Ajuste (−15 s, +15 s) vai para a linha das saídas,
  nunca dividindo o lugar do principal. Ver
  [07-fluidez-e-estabilidade.md](07-fluidez-e-estabilidade.md).

## 10. Confirmação

Folha curta para o que é difícil de desfazer. Título é a pergunta ("Apagar
esta foto?"), apoio **delimita o estrago** ("Ela vai para a lixeira e fica 30
dias. A sessão passa a ter 10 de 11 poses."). Ações: o caminho seguro é o
**principal** ("Manter"), o destrutivo é o **contorno** com o verbo
("Apagar"). Voltar, Esc e véu respondem o caminho seguro.

Só para o que não tem volta: apagar de vez, restaurar cópia, voltar ao
programa do treinador, voltar ao começo. O reversível usa o aviso com
desfazer.

## 11. Faixas de estado

| Faixa | Desenho | Comportamento |
|---|---|---|
| Sem rede | pílula de areia, 48, sem contorno, ícone de nuvem | avisa uma vez e some em 4 s; nada é bloqueado |
| Não guardei | pílula de atenção, contorno de tinta de 2, "1 série não foi guardada" + botão "Ver" | **fica** no topo até resolver; o "Ver" abre a folha com o que falhou, "Tentar de novo" e "Copiar em texto" |
| Treino aberto | ver doca | |

Ficam a 8 do topo, sobre o conteúdo, com a área segura de cima.

## 12. Aviso com ação ("Desfazer")

Pílula de tinta, texto papel, 56 de altura, com o fato ("Foto na lixeira.")
e o botão "Desfazer" em lima. Onde fica: 10 acima da doca (e da tira do treino
aberto, se houver); a 14 da borda em destino; **10 acima do principal** na
tela de ação, para nunca cobrir o "Feito" nem as saídas; e **no alto, sobre o
véu**, com uma folha aberta, para nunca cobrir o que a folha pede. Entra em
200 ms, deslizando 10 px, sem empurrar nada. Some em 6 s ou no próximo toque
fora; com leitor de tela, é anunciado e fica até ser dispensado. Um de cada
vez; o novo substitui o velho.

## 13. Aviso dentro da tela

Caixa de raio 22, contorno de tinta de 2. Três tons:

- **atenção** (tangerina): "Faz 14 minutos desde a última série. Fez outras
  nesse tempo?", com dois botões pequenos;
- **sugestão** (superfície): "Subir para 62,5 kg?", com "Manter" e "Subir";
- **certo** (lima): "Tudo certo. Agora não saia do lugar."

## 14. Campo de texto e de busca

- **Campo**: 54 de altura, raio 18, superfície, contorno de `--contorno` de
  1,5; em foco, contorno de tinta de 2,5. Rótulo acima (13, 600, `--texto-2`),
  sempre visível; nunca só placeholder. Letra de 16. Erro: o contorno vira
  tinta de 2,5, e embaixo uma frase em `--texto` com o ícone de atenção
  ("Esse e-mail não tem conta. Confira ou crie uma.").
- **Texto longo** (colar o texto do treinador, a cópia): raio 22, contorno de
  tinta de 2, 150 de altura mínima, cresce.
- **Busca**: pílula de 52, contorno de tinta de 2, lupa à esquerda, "x" para
  limpar quando há texto.
- **Diga** (o texto livre do "+"): pílula de 60 com o botão de enviar de 48
  dentro; embaixo, o eco do que entendeu.

## 15. Seletor de data e hora

Não é calendário: é **régua de dias** e **régua de horas**. Data: fita de
fichas de 44 × 56 (dia da semana em 12 px, número em 17, 800), os últimos 14
dias, hoje no fim, rolando para trás. Hora: régua com passo de 5 min e marca
grande a cada hora. "Agora" e "ontem" são atalhos em ficha. O campo nativo de
data só aparece em "outra data…".

## 16. Gráfico

Linha de tinta de 3, pontas e junções redondas, sem grade, sem eixo Y. O
último ponto é uma bola de 6 da cor do assunto com contorno de tinta de 3. Os
pontos do dia (pesagens) em tinta a 28%, raio 2,6. A faixa do alvo em lilás
chapado. As sessões de fotos como traços de 8 embaixo. O cursor ("tudo na
mesma data") é tracejado com uma bola lima. Datas no eixo X em 12 px, 700,
`--texto-legenda`, só nas pontas.

**Acessibilidade.** `role="img"` com um nome que diz a conclusão ("Média
semanal do peso, de 74,3 para 77,6 kg em 8 semanas"), e a tabela de valores
na seção "Por semana" embaixo.

Mini gráfico: o mesmo traço, 56 a 64 de largura, sem bola.

## 17. Foto e comparação

- **Foto**: 3:4, raio 18 em leitura, 10 em miniatura. O ajuste aplicado
  sempre pelo mesmo `transform` do enquadramento. Foto fora do padrão leva um
  ponto de atenção de 20 com contorno de tinta no canto de cima.
- **Comparar**: seletor de três modos (lado a lado, cortina, sobrepor), fita
  de poses, as duas datas em quadros com peso e cintura, e a linha das
  sessões (pontos de 44 de área; o "de" em tinta, o "até" em lilás com
  contorno).
- **Cortina**: linha de tinta de 3 com a pega lima de 44 no meio.
- **Sobrepor**: controle deslizante de 44 de área, pega lima de 34.

## 18. Vazio

Caixa de areia, raio 28, 22 de dentro: título (26, 800) que diz o que falta,
uma frase do que fazer ou de quando vai aparecer, e o botão quando existe uma
ação. Sem ilustração, sem mascote, sem consolo. Sobre o bloco do momento, o
vazio é o próprio bloco ("Nada para agora.").

## 19. Escolha grande

Cartão de superfície, raio 26, contorno `--contorno` de 1,5, ícone num círculo
de 46, nome (19) e uma linha. O escolhido fica lima com contorno de tinta de
2,5 e o círculo vira tinta. Para decidir um cenário antes de começar ("quem
vai segurar o celular?", "de onde vem o seu treino?"). É `radio`.

## 20. Chave

Linha de 64 com nome e uma linha do que faz, e a chave à direita: trilho de
54 × 32. Desligada: trilho de superfície com contorno `--contorno` de 1,5 e a
bolinha de `--contorno`. Ligada: trilho de tinta, bolinha de superfície
deslizada 22. A linha inteira é o alvo (`role="switch"`, `aria-checked`).

## 21. Quadros

Grade de 2 a 4 números com legenda: superfície, contorno `--divisoria` de 1,5
(é agrupamento, não controle), raio 18 a 22, número `--t-quadro`, legenda em
12–13. Se toca, leva mini gráfico e abre o destino; se não, é só leitura.

## 22. Pergunta

Caixa de areia, raio 24, 14 × 16 de dentro: a pergunta (17, 700), uma linha
de por quê (13, `--texto-2`) e duas ou três fichas de resposta. Depois de
respondida, a pergunta vira a resposta ("Comida: foi como o plano") e as
fichas continuam ali para corrigir.

## 23. Luzes da câmera

Três, lado a lado (nível, altura, distância). No ajuste: blocos de 52, raio
18, atenção com contorno de tinta de 2, ícone e nome com "acertar"; certas,
lima com certo. Depois do ajuste, encolhem para pílulas de 36. A que o app
não mede é tocável ("toque ao conferir").

## 24. Linha do dia e ritmo

- **Linha do dia**: pontos de 44 numa linha de divisória, hora embaixo
  (12 px, 700, `--texto-legenda`). Feito: tinta com certo. Agora: cor do
  momento com contorno de tinta de 2,5 e 12% maior. Sem resposta depois de
  uma hora: tracejado de areia. Toque abre a refeição ou o treino.
- **Ritmo**: sete bolas de 36 com a letra do treino; dia de treino em tinta,
  comida "quase" metade areia, em branco tracejado, hoje com contorno de 2,5.
  Nunca conta sequência.
