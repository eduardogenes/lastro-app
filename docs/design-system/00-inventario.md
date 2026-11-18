# Design system do Lastro — etapa 1: leitura e inventário

Escrito em 17/11/2026. É a base das etapas seguintes (fundamentos, componentes,
telas, auditoria). Nada aqui muda o app: `src/`, `DESIGN.md` e o contrato de UX
continuam como estão até o dono aprovar o design system.

## O que li

- **Os cinco protótipos**, HTML e CSS inteiros: `hoje.html`, `fotos.html`,
  `corpo.html`, `treino.html`, `resto.html`, e o `LEIA.md` da pasta. Cada um
  foi renderizado num Chromium a 414 × 896, e os tamanhos foram medidos na
  página e não só lidos no CSS.
- `PRODUCT.md`, `MARCA.md`, `DESIGN.md`, `docs/LASTRO_UX_CONTRACT.md`,
  `docs/redesign-3/00-plano.md` e `04-fase5.md`.
- **O código, só para fluxo e dado:** `camadasAbertas()` em
  `src/ui/navegacao.js`, `TELAS_V3`, `DESTINOS_V3` e `FOLHAS_V3` em
  `src/ui/v3/telas.js`, as 55 funções `ctx.*V3` de `src/main.jsx` e os
  componentes de `src/ui/v3/`. Nenhum valor visual foi tirado de lá.

## Como ler o inventário

Cada linha é uma coisa que a pessoa vê. As colunas:

- **Camada:** *lugar* (tem doca), *destino* (tela cheia com voltar),
  *ação* (tela cheia de uma tarefa só: treino, medir, câmera, responder dias),
  *folha* (sobe de baixo), *faixa* (aviso fixo) ou *estado* (uma variação da
  mesma tela).
- **Protótipo:** ● desenha · ◐ desenha em parte · ○ não desenha.
- **Dado:** a função do `ctx` que alimenta a tela hoje. Ela diz o que existe
  de verdade; o desenho não inventa campo que o dado não tem.

### Navegação e moldura

| Item | Camada | De onde se chega | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Doca: cinco lugares e o "+" | moldura | sempre, nos lugares | — | ● hoje | só no `hoje.html`; os lotes 1–4 não mostram a doca porque abrem em destinos |
| Doca encolhida ao rolar | estado | rolar para baixo num lugar | — | ● hoje | |
| Ação que gruda no topo quando o bloco do momento sai | estado | rolar o Hoje | `hojeV3` | ● hoje | |
| Tira de treino aberto, acima da doca | faixa | sessão aberta, fora do treino em foco | `focoV3` | ◐ hoje (`.vivo`) | **lacuna conhecida**: no código só o Hoje leva de volta |
| Faixa "sem rede" | faixa | qualquer tela, ao perder rede | — | ● resto | |
| Faixa "não guardei" e o painel do que falhou | faixa + folha | gravação recusada | `naoGuardado` | ● resto | |
| Confirmação de destrutivo (`pare`) | folha | apagar, descartar, restaurar | — | ◐ (só textos soltos nas folhas) | |
| Aviso curto com "Desfazer" | faixa | depois de uma ação reversível | — | ○ | **lacuna conhecida** (lixeira das fotos) |
| "Gire o telefone" (deitado) | estado | aparelho deitado | — | ○ | |

### Hoje (lugar)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Bloco do momento: treino ("daqui a N min") | estado | abrir o app de manhã | `hojeV3().bloco` k=`treino` | ● | |
| Bloco: aula do box ("Fiz a aula") | estado | dia de aula | k=`aula` | ○ | |
| Bloco: treino em andamento | estado | sessão aberta | k=`sessao` | ● | |
| Bloco: sessão parada há tempo ("Continuo treinando / Já parei") | estado | sessão esquecida aberta | k=`sessao` + `pergunta` | ○ | |
| Bloco: confirmar a duração do treino de antes | estado | sessão fechada sozinha | k=`confirmar` | ○ | |
| Bloco: refeição ("Comi / Ver / …") | estado | meia hora antes até 90 min depois | k=`refeicao` | ● | o protótipo tem "Pulei esta"; o código pergunta "Não foi assim" → comi outra coisa / não comi / não sei |
| Bloco: pergunta da noite | estado | à noite, com refeição sem resposta | k=`noite` | ● | |
| Bloco: livre / dia fechado (faixa fina) | estado | nada para agora | k=`livre` | ● | |
| A linha do dia | seção | — | `linha` | ● | |
| "Se quiser": água, peso, cardio | seção | só o que está ligado | `seQuiser` | ● | |
| Seu ritmo, 7 dias | seção | — | `ritmo` | ● | |
| Pergunta de ontem | seção | ontem em branco | `ontem` | ● | |
| Lembrete das fotos (véspera e dia) | seção | dia de fotos se aproximando | `lembrete` | ○ | decidido em 17/11; sem desenho |
| Primeira vez (aparelho vazio) | estado | primeiro uso | `enderecoVazio` | ● resto (três passos) | o código desenhou outra coisa; ver **pergunta 1** |
| Hoje com a comida desligada | estado | módulo comida desligado | `moduloLigado` | ○ | |
| Folha "Registrar" (o "+"), com texto livre | folha | "+" na doca | `registraTextoV3` | ● | |
| Eco do texto livre: entendeu / não entendeu | estado | enviar o texto | `textolivre.ts` | ● | |
| Folha da refeição | folha | toque na linha do dia, "Ver" | `refeicaoV3` | ● | |
| Folha "O que aparece" | folha | ícone de ajuste no bloco | `moduloLigado` | ● | |
| Folha do cardio | folha | "Cardio" no "se quiser", no "+" | `CamposDoCardio` | ○ | **lacuna conhecida** |
| Folha do tipo do dia (treino, descanso, turno, demanda alta) | folha | toque na data do bloco | `setCadenciaV3`, `setTurnoV3` | ○ | |
| Folha "Comi outra coisa" | folha | "+" | — | ● hoje (com tamanho) | ver **pergunta 3** |

### Treino (tela de ação, a partir do Hoje)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Uma série por tela (carga × repetição, régua) | ação | "Começar" | `focoV3`, `fazSerieV3` | ● hoje e treino | as duas versões divergem; ver D7 |
| Sugestão "Subir para X kg?" | estado | regra de progressão cumprida | `focoV3().sobe` | ● treino | |
| Aviso de intervalo longo ("Pôr em dia / Não, só parei") | estado | intervalo ≫ descanso | `intervaloLongo` | ● treino | |
| Exercício trocado hoje ("no lugar de…", sem histórico) | estado | trocar | — | ● treino | |
| Descanso enchendo a tela | ação | "Feito" | `descansoV3` | ● | |
| "Sobraram quantas?" no descanso (RIR) | estado | descanso | `rirDaUltimaV3` | ● hoje · ○ treino | ver D8 |
| Lista do treino (ir, reordenar, deload) | folha | ícone de lista | `listaV3` | ● | |
| Mudar este exercício (trocar, série, antes, pular, dor) | folha | "Mudar" | `mudarExV3` | ● | |
| Dor anotada, com a regra do treinador | folha | "Senti dor" | — | ● treino | |
| Opções da sessão (menu) | folha | — | `menuSessao` | ○ | |
| Pôr em dia ("Já fiz mais do que anotei") | destino | link no treino, aviso de intervalo | `porEmDiaV3` | ● treino | o código fez folha; o protótipo, tela |
| Fim do treino, com "vira regra?" | estado | última série, "Encerrar" | `fimV3`, `encerraTreinoV3` | ● treino | |
| Treino encerrado / "nada mais na fila" | estado | fila vazia | `TreinoEncerrado` | ○ | |
| Aula do box: repetir a última, modelos, texto colado, foto da lousa, lista rápida, série por série | ação | "Fiz a aula" | `aulaV3`, `anotaRapidaV3` | ○ | **lacuna conhecida** |
| Catálogo de exercícios (buscar, criar) | folha | "+ Exercício", "+ Movimento" | `catalogoV3` | ○ | **lacuna conhecida** |
| Foto do aparelho | folha | histórico, "O aparelho" no treino | `abreFotoDoAparelhoV3` | ○ | **lacuna conhecida** |

### Dias (lugar)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| O mês em grade, com treino e comida | lugar | doca | `DiasV3` | ● hoje, resto | |
| O dia escolhido, com a pergunta da comida | seção | toque num dia | `respondeODia` | ● | |
| Responder os dias, um por tela | ação | "Responder os dias em branco", Semana | `responderDiasV3` | ● resto | |
| Responder: o fim (N dias respondidos) | estado | último dia | — | ● resto | |
| O dia aberto (registros, cardio, descanso, a comida) | destino | "Abrir o dia" | `DiaAbertoV3` | ◐ resto (folha curta) | |
| Pôr o dia em dia | folha | o dia aberto | `poeODia` | ○ | |
| Sessão passada, corrigida série a série | destino | o dia aberto, histórico do exercício, "Corrigir" no Hoje | `SessaoPassadaV3` | ○ | **lacuna conhecida** |
| Uma série passada (apagar, RIR, não feita, tentar de novo) | folha | toque numa série | `seriePassadaV3`, `guardaSeriePassadaV3`, `apagaSerieDaPassadaV3` | ○ | **lacuna conhecida** |
| Registrar treino passado ("Já treinei e não anotei") | destino | Hoje, o dia aberto | `RegistrarPassadoV3` | ◐ treino ("Treino que já fiz") | |

### Corpo (lugar)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Peso pela régua no bloco lilás | lugar | doca | `corpoV3`, `pesaHoje` | ● | |
| Evolução em quadros | seção | — | `corpoV3` | ● corpo | |
| Medidas ligadas e "Mais N medidas" | seção | — | `corpoV3` | ● corpo | |
| Ligar medidas | folha | "Mais N medidas" | `ligaFita` | ● corpo | |
| Medir agora, uma por tela (2ª leitura, 3ª, "guardar só esta") | ação | "Medir agora" | `medirV3` | ● corpo | |
| Como medir | folha | "Ver como medir" | — | ● corpo | |
| Medidas guardadas | estado | fim do medir | `Medido` | ● corpo | |
| Peso (gráfico, 4 semanas ou tudo, taxa por semana) | destino | quadro do peso | `pesoV3` | ● corpo | |
| Corrigir uma pesagem | folha | toque na pesagem | `corrigeMarca` | ○ | **lacuna conhecida** |
| Uma medida (linha, como medir, histórico) | destino | linha da medida | `medidaV3` | ● corpo | |
| Corrigir e apagar medida antiga | folha | histórico da medida | `corrigeMarca` | ○ | **lacuna conhecida** |
| Bioimpedância (quadros, leituras) | destino | quadro da gordura | `camposDaBioV3` | ● corpo | |
| Nova leitura de bioimpedância, um número por passo | folha | "Nova leitura" | `bio` | ◐ (só descrita) | **lacuna conhecida** |
| Tudo na mesma data | destino | "Ver tudo na mesma data" | `naMesmaDataV3` | ● corpo | |
| Corpo sem nenhum dado | estado | primeira vez | — | ◐ resto ("Uma pesagem não faz linha") | |

### Fotos (destinos a partir do Corpo)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Centro das fotos | destino | Corpo, "Fotos"; lembrete no Hoje | `centroDasFotosV3` | ● | |
| Nova sessão: quem segura, "tudo como da última vez?" | destino | "Nova sessão" | `novaSessaoV3` | ● | |
| O preparo | folha | nova sessão | `preparo` | ○ | |
| Três passos para quem nunca fez | destino | "Alguém que nunca fez" | `passos` | ● | |
| A câmera: ajuste, três luzes, frase, disparo, foto anterior | ação | "Abrir a câmera" | `cameraV3`, `cameraViva` | ◐ (manequim, luzes por toque) | **lacuna conhecida**: sensor real, detecção, sem pessoa no quadro |
| Câmera: sozinho, com contagem | estado | "Eu, sozinho" | — | ● | |
| Câmera: foto torta ("Repetir / Guardar assim") | estado | disparo inclinado | — | ● | |
| Câmera: "Tirar mesmo assim" | folha | link da câmera | — | ● | |
| Câmera: permissão negada, sem câmera, carregando | estado | abrir a câmera | `cameraViva` | ○ | |
| Sessão pela metade (as poses, retomar) | destino | sair da câmera no meio | `PelaMetade` | ○ | |
| Fim da sessão (no padrão, com ressalva, fora do padrão) | estado | última foto | `fimDaSessaoV3` | ● | |
| Comparar: lado a lado, cortina, sobrepor, a linha das sessões | destino | centro, fim da sessão, foto aberta | `comparacaoV3` | ● | |
| Comparar sem par (uma sessão só) | estado | — | — | ○ | |
| Foto comparada aberta | folha | toque numa das duas | `fotoComparada` | ○ | |
| Mandar para os agentes | folha | comparar | `mandaParaOsAgentes` | ● | |
| No tempo | destino | centro | `noTempoV3` | ● | |
| Galeria, com o selo por sessão | destino | centro | `galeriaV3` | ● | |
| Foto aberta, com a sugestão de alinhamento | destino | galeria | `galeriaFoto`, `FotoRef.sug` | ◐ (sem a sugestão) | |
| Ajustar o enquadramento | destino | foto aberta | `ajuste` | ● | |
| Lixeira com itens, restaurar, apagar de vez | destino | galeria | `galeria.lixeira` | ◐ (só vazia) | **lacuna conhecida** |

### Semana (lugar)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| O veredito da comida ("Não mexer" / "Pode subir") | lugar | doca | `semanaV3` | ● | |
| Aplicar no plano, com desfazer | folha | "Aplicar no plano" | `aplicaAjuste` | ● resto | |
| O que a regra olha | seção | — | `semanaV3` | ● | |
| Séries da semana por região (feitas e ainda vêm) | seção | — | `somaPorGrupo` | ● resto | |
| Os músculos de uma região | folha | toque na região | `musculos` | ○ | |
| Retrospectiva do bloco | destino | "Retrospectiva do bloco" | `RetrospectivaV3` | ○ | **lacuna conhecida** |

### Plano (lugar)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| O Plano: esperando você, treinos, dias de treino, comida, alimentos, compras | lugar | doca | `planoV3` | ● hoje, resto | |
| Aviso de mudança esperando decisão ou vencendo | seção | mudança "só hoje" pendente | `vence`, `venceHoje`, `venceu` | ○ | **lacuna conhecida** |
| Programa (treinos, ordem, diferenças, histórico de mudanças) | destino | "Programa inteiro" | `faixaDoTreinoV3` | ● treino | |
| O que está diferente / Mudanças | destino | programa | — | ○ | |
| Editor de um treino (ordem, séries, faixa por músculo) | destino | tocar num treino | `EditorV3` | ● treino | |
| Criar treino, trocar o nome | folha | programa, exercício | `renomeiaEx` | ○ | **lacuna conhecida** |
| Revisão do treinador (colar, ler, aplicar) | destino | Plano, primeira vez | `RevisaoV3` | ● treino | ver **pergunta 2** |
| Progressão (prontos, ganhando repetição, parados) | destino | Plano, opções da sessão | `progressaoV3` | ● treino | |
| Um exercício (próximo passo, sessão a sessão) | destino | progressão, "Histórico" no treino | `exercicioV3` | ● treino | |
| Comida do dia (dia de treino / descanso) | seção | — | `planoV3` | ● resto | |
| Uma refeição (macros, quantidades) | folha | linha da refeição | `refeicaoDoPlanoV3` | ● resto (destino) | |
| Quantidade de um alimento pela régua | folha | toque na quantidade | `editaRefeicao` | ● resto | |
| Nova refeição | folha | "+ Refeição" | `editaRefeicao` | ○ | **lacuna conhecida** |
| Alimentos, buscar | folha | "Alimentos" | `alimentos` | ● resto | |
| Escolher alimento para a refeição | folha | "+ Alimento" | `seletor` | ○ | |
| Criar e editar alimento | folha | "Novo alimento" | `editaAlimento` | ○ | **lacuna conhecida** |
| Compras | folha | "Compras" | `comprasV3` | ● resto | |

### Ajustes (destino)

| Item | Camada | De onde | Dado | Protótipo | Nota |
|---|---|---|---|---|---|
| Conta (entrar, sincronizado, sair) | seção | — | — | ● resto | |
| Conta: entrando, senha errada, sem rede | estado | — | — | ○ | |
| O que aparece, lembretes | seção | — | `moduloLigado` | ● | |
| Cópia de segurança: guardar, restaurar por arquivo | seção + folha | — | `payload`, `importaArquivo` | ● resto | |
| Colar a cópia como texto | folha | Ajustes | — | ○ | **lacuna conhecida** |
| Voltar ao programa e ao plano, voltar ao começo | folha | Ajustes | — | ○ | destrutivo; precisa da confirmação |
| De onde se chega aos Ajustes | — | — | — | ◐ | o `hoje.html` usa o ícone do bloco para "O que aparece"; o código usa o mesmo canto para Ajustes. Decisão na etapa 4 |

### Estados que valem para o app inteiro

| Estado | Onde aparece | Protótipo |
|---|---|---|
| Vazio de lugar ("Uma pesagem não faz linha") | Corpo, Semana, Dias, Progressão, Galeria | ◐ resto (um exemplo) |
| Vazio de busca | Alimentos, Catálogo | ● resto |
| Carregando | câmera, fotos, conta, cópia | ○ |
| Sem rede | todos | ● |
| Falha ao guardar | todos | ● |
| Primeira vez | Hoje | ● resto |
| Conta sem dado (entrou numa conta vazia) | Hoje | ○ |
| Dado demais (nome longo, 40 pesagens, 30 sessões, 12 refeições) | listas, títulos | ○ |
| Módulo desligado | Hoje, Corpo, Plano | ◐ |

**Somando:** na página, agrupados em 82 itens, 35 estão desenhados, 11 em
parte e 36 sem desenho. Os que faltam são o grosso das etapas 3 e 4.

## Divergências entre os protótipos, e a decisão de cada uma

O `hoje.html` é a base mais antiga; os lotes 1 a 4 vieram depois e são mais
compactos. Medido na tela, a 414 × 896:

| # | O quê | `hoje.html` | lotes 1–4 | Decisão |
|---|---|---|---|---|
| D1 | Título do bloco do momento | 56 px / 0,90; médio 38 | 50 px / 0,92; médio 36 | **50 e 36.** O bloco de 56 empurra a linha do dia para fora da primeira tela no 414 × 896 com apoio de duas linhas; 50 ainda é a maior coisa da tela e deixa o resto aparecer. |
| D2 | Botão principal | 19 px | 18 px | **18 px**, 58 de altura; no treino e na medição, 20 a 22 px e 66 a 72 de altura. |
| D3 | Cabeçalho fino | 34 px, sem voltar (lugares) | 28 px, com voltar (destinos) | **Os dois, com papéis diferentes:** lugar 34 px sem voltar; destino 28 px com voltar. Não é divergência de tamanho, é de camada, e a diferença ajuda a saber onde se está. |
| D4 | Linha de lista | 68 px, nome 18 → reescrita para 60 / 17 | 62 px, nome 17 | **60 px, nome 17**, valor 19–20. |
| D5 | Título da folha | 32 px, margem 22, até 88% | 30 px, margem 20, até 90% | **30 px, margem 20, até 90%.** A margem lateral do app inteiro é 20. |
| D6 | Número gigante | 112 → 96 (Corpo) | 92 (Corpo), 76 (exercício), 64 (peso, medida) | **Três degraus com papel:** 96 (o número do lugar: peso no Corpo, medir), 76 (um destino que é sobre um número: exercício), 64 (cabeça de destino de consulta: peso, medida, kcal). |
| D7 | Treino em foco | nome 30, valor 76, Feito 72; links "Pular esta série · Trocar exercício" | nome 30, valor 66, Feito 68; links "Mudar · Já fiz mais do que anotei · Histórico" | **O do lote 3.** 66 cabe com a sugestão "Subir para X?" e o aviso de intervalo; os três links cobrem o que o código faz. Feito em 68. |
| D8 | Descanso | 132 px; "Sobraram quantas?" e "Água +1" | 120 px; sem o "sobraram" | **120 px, com o "Sobraram quantas?"** (o código grava o RIR por ele) e o "Água +1" só com água ligada. Os botões do RIR vão de 48 para 52 de altura. |
| D9 | Segmentos | em curso: tinta a 45% | câmera: em curso em tangerina | **Tinta a 45% em todos.** A tangerina quer dizer "atenção"; a pose em curso não é atenção. |
| D10 | Selo | 30 px, 13 px de letra (fotos) | 28 px, 12 px | **28 px, 12 px, peso 700.** |
| D11 | Cartão de treino (tile) | 150 × 168, letra 58 | 150 × 160, letra 56 | **150 × 160, letra 56.** |
| D12 | O que mora no centro do treino | — | `treino.html` tem um "centro do treino" lima com Progressão, Programa, Revisão | **Não existe como lugar.** Decisão do dono em 16/11: as abas ficam Hoje e Plano. O início é o bloco do Hoje; o resto mora no Plano, como o código já fez. |
| D13 | Parede e chão das fotos | — | `--parede`, `--chao` | Ficam só como recheio de exemplo da página viva. No app, a foto é a foto. |

## Problemas dos próprios protótipos

Não são divergências: valem nos cinco arquivos e o design system corrige.

1. **Legenda cinza não passa no contraste.** `--tinta-3` (#77766D) dá 4,1:1
   sobre o papel, 3,7:1 sobre a areia, 3,6:1 sobre lima e 2,9:1 sobre lilás. O
   mínimo para texto de 12 a 13 px é 4,5:1. É a cor de toda nota de seção e
   todo apoio de linha. Os protótipos só o usam sobre papel e branco, mas
   nem ali passa. Correção na etapa 2: escurecer o cinza de legenda até
   passar sobre papel e areia, e continuar proibido sobre cor.
2. **`--tinta-2` sobre tangerina dá 3,6:1.** Sobre tangerina, só tinta.
3. **Contorno quieto quase invisível.** O fio (#DFDACE) dá 1,3:1 sobre o
   papel. Serve para divisória, mas é o único contorno do cartão de escolha,
   da chave desligada e do campo de texto, que são controles e pedem 3:1.
4. **Alvos de toque abaixo de 44 px:** fichas de pose (40), seletor em pílula
   (38–40), saída discreta (32–36), setas de ordem do editor (36 × 30), passos
   de série (40), pontos da linha das sessões (28 de largura).
5. **Ícone de dúvida** com coordenadas quebradas (`1.300-2 2.500`), herdadas de
   um arredondamento: desenha torto.
6. **Botão desabilitado** em cinza translúcido sobre cor fica com texto a
   3,4:1 sobre lima. Precisa de outra solução.

## Perguntas de produto

Três decisões que não são de desenho. Estão também na página, com opções e
recomendação; enquanto não vierem respostas, vale a coluna "se não responder".

| # | Pergunta | Como está hoje | Se não responder |
|---|---|---|---|
| 1 | O que uma pessoa nova vê na primeira vez? | O app já nasce com o programa e o plano do dono, e oferece "Comece pelo que já está aqui". | desenho os três passos do protótipo (de onde vem o treino, a comida, o que acompanhar), sem "modelo" até existir um |
| 2 | Revisão do treinador: escolher mudança por mudança, ou treino inteiro? | O código aplica os treinos inteiros; o protótipo deixava ligar e desligar cada mudança. | desenho treino por treino, mostrando cada mudança dentro dele |
| 3 | "Comi outra coisa": guardar o tamanho (parecido, bem mais, bem menos)? | Só fica marcado "fora do plano". O protótipo pedia o tamanho, que não existe no dado. | desenho sem o tamanho |

## As respostas do dono (17/11/2026)

1. Primeira vez: **três passos, como o protótipo.**
2. Revisão do treinador: **mudança por mudança.** Pede regra nova no app.
3. "Comi outra coisa": **guardar o tamanho.** Pede dado novo, com migração.

As três estão desenhadas na página viva e entram na auditoria.

## O que vem depois

Etapa 2, fundamentos e tokens, aplicando as decisões D1 a D13 e as correções
de contraste e de toque. Daí em diante, sigo sem perguntar o que é desenho e
mostro cada etapa numa página.
