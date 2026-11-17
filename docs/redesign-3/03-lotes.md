# Especificação dos lotes

Fase 0, item 6 do [plano](00-plano.md). Para cada tela: o protótipo de
referência, os componentes, **de onde vêm os dados** (as funções do app que já
existem) e **o que falta criar**. Quem constrói segue isto; o que não fechar,
pergunta ao dono em vez de inventar.

Convenções para todo lote:

- Tela nova mora em `src/ui/v3/telas/` (um arquivo por tela) e é só
  apresentação: recebe `ctx`, lê com as funções abaixo e chama as ações.
  Regra de dado nova vai para `src/dominio/`, com teste.
- Os dados de tela que já existem (`ctx.corpo()`, `ctx.comparacao()`…) foram
  feitos para as telas antigas. **Reaproveite o dado, não a forma**: se a tela
  nova precisa de outro recorte, crie uma função nova `ctx.xxxV3()` ao lado,
  em vez de mudar a antiga (ela continua servindo o visual antigo até a Fase 5).
- Lugar novo: registrar em `src/ui/v3/telas.js`. Destino e folha novos: ver
  "Camadas" abaixo.
- Testes: os da tabela 2 de [01-testes.md](01-testes.md) que a tela herda, com
  o interruptor ligado (`localStorage['lastro-visual'] = '3'`).

## Camadas: como destino e folha do visual novo entram

Primeira tarefa da Fase 1, antes de qualquer tela.

- **Destino** (tela cheia) e **folha** continuam sendo marcas em `view` e em
  `view.pilha`, derivadas por `camadasAbertas()` (`src/ui/navegacao.js`); o
  Voltar do sistema já funciona por isso.
- O que muda é **quem desenha**. `telaCheia()` e `folhaAberta()` (em
  `src/main.jsx`) passam a perguntar, com o visual novo ligado, se existe a
  versão nova daquele destino ou daquela folha (`TELAS_V3`, ganhando as
  chaves `destinos` e `folhas`) e a desenham no lugar da antiga.
- A folha nova usa `Folha` (`src/ui/v3/base.jsx`), que hoje é só aparência:
  ligar o véu ao `ctx.fechaFolha`, travar a rolagem do corpo e mandar o foco
  para dentro e de volta, como `src/ui/instrumento/folha.jsx` já faz.
- Teste: `navegacao` e `camadas` (01-testes.md) com uma folha e um destino do
  visual novo.

---

## Fase 1 · Fotos

Protótipo: [`prototipos/fotos.html`](prototipos/fotos.html). Decisões da
captura: [02-captura.md](02-captura.md).

| Tela | Dados | Ações | Falta criar |
|---|---|---|---|
| **Centro das fotos** (destino a partir de Corpo) | `ctx.corpo()` (bloco das fotos), `ctx.galeria()` | `ctx.abreProtocolo`, `ctx.abreComparar`, `ctx.abreGaleria` | "No tempo" como entrada; contagem "próxima em N dias" já sai de `diasDesde`/`CADENCIA_DIAS` |
| **Nova sessão: quem segura e "tudo como da última vez?"** | `ctx.protocolo()` (montagem por `QuemTira`) | `ctx.setQuemTira('alguem' \| 'sozinho')`, `ctx.comecaSessaoDeFotos` | o terceiro cenário, **alguém que nunca fez**: é `alguem` com a tela de três passos antes da câmera (só tela); gravar `SessaoFoto.muda` ao criar a sessão |
| **Para quem vai fotografar** (três passos) | texto fixo | segue para a câmera | só tela |
| **Câmera** | `ctx.cameraViva()`, `ctx.streamDaCamera` | `ctx.tiraFotoDoCorpo`, `ctx.repete`, `ctx.registraTorta`, `ctx.setFantasmaDaCamera`, `ctx.repeteFala`, `ctx.cancelaDisparo` | **a detecção do corpo** (`src/infra/pose.ts`, nova): luzes de altura e distância, destravar com três verdes, "tirar mesmo assim" gravando `Captura.fora`, disparo automático no modo sozinho, `Captura.det`; o caminho de volta para as linhas quando a detecção falha. Regras de tolerância em `src/dominio/enquadramento.ts`, com teste |
| **Foto torta** | `ctx.cameraViva().torta` | `ctx.repeteTorta`, `ctx.registraTorta` | marcar `fora: ['nivel']` ao registrar assim |
| **Fim da sessão** | `ctx.sessaoDeFotos()` | `ctx.medirDepoisDasFotos`, `ctx.fechaProtocolo` | a frase com a ressalva (`muda`, fotos `fora`) |
| **Comparar** (lado a lado, cortina, sobrepor) | `ctx.comparacao()` | `ctx.setPoseComparada`, `ctx.setDataComparada`, `ctx.setCortina`, `ctx.setSobrepor`, `ctx.setOpacidade`, `ctx.voltaAoParLongo` | a linha de sessões tocável; o selo de ressalva por data; **mandar para os agentes** (o par vai para a pasta do espelho; definir o formato com o espelho, `ferramentas/espelho/`) |
| **No tempo** | dados de `ctx.comparacao()` (as sessões da pose) | arrastar e "passar do começo" | `ctx.noTempoV3(pose)`: as sessões da pose, em ordem, com o peso da semana de cada uma |
| **Galeria, foto aberta, lixeira** | `ctx.galeria()`, `ctx.galeriaFoto()` | `ctx.abreFotoDaGaleria`, `ctx.apagaDaGaleria`, `ctx.abreLixeira`, `ctx.restauraDaLixeira`, `ctx.esvaziaLixeira` | o selo "no padrão" ou a ressalva por sessão |
| **Ajustar enquadramento** | `ctx.ajusteEmEdicao()` | `ctx.setGiroDoAjuste`, `ctx.setZoomDoAjuste`, `ctx.arrastaAjuste`, `ctx.salvaAjuste`, `ctx.zeraAjuste` | o **alinhamento automático** (02-captura.md §5), marcado como automático em `Enquadramento` |

Decidido na construção, onde o código difere do protótipo de propósito:

- **Sem a pílula "lente 1×"** em "tudo como da última vez?": a câmera do app
  trava a 1×, e a lente não é coisa que mude. A frase de apoio diz isso.
- **No fim, o principal é "Medir agora"** e "Comparar" vem ao lado: as
  medidas são feitas na mesma noite das fotos (o fim antigo já era assim).
- **A câmera, com tudo tirado, troca o disparo por "Ver a sessão"**, e a
  miniatura com Refazer continua no canto: ir direto para o fim tirava o
  Refazer da última foto.
- **Os três passos são uma camada** (`passos`, em `camadasAbertas`): o Voltar
  do sistema devolve a nova sessão. "Entendi" a tira da pilha antes de abrir a
  câmera, para fechar a câmera voltar à sessão, e não aos passos.
- Sem câmera do app (permissão negada, aparelho sem `getUserMedia`), a sessão
  pela metade oferece a câmera do sistema na pose escolhida, como antes.
- **O centro das fotos é a camada `fotos`**, abaixo de tudo que abre dele
  (galeria, comparar, no tempo, sessão); **no tempo é a camada `noTempo`**.
- **Na comparação, tocar numa foto** do lado a lado abre uma folha com
  "Ajustar enquadramento" e "Apagar esta foto" (a segunda porta para apagar
  uma foto antiga, pedida pelo dono em 03/11).
- **A lixeira devolve com "Devolver"** e apaga de vez só por "Esvaziar a
  lixeira", que continua pedindo confirmação.

Testes a reescrever: `protocolo` (o maior da suíte, 137 casos). Mostrar ao dono
as decisões de captura antes de fechar a fase.

## Fase 2 · Corpo e evolução

Protótipo: [`prototipos/corpo.html`](prototipos/corpo.html). Base: a tela Corpo
de [`prototipos/hoje.html`](prototipos/hoje.html).

| Tela | Dados | Ações | Falta criar |
|---|---|---|---|
| **Corpo** (lugar) | `ctx.corpo()`, `ctx.painelDoCorpo()` | `ctx.registraPeso` (pela régua), `ctx.abreEvolucao`, `ctx.abreMedida`, `ctx.abreBio`, `ctx.abreProtocolo` | registrar `corpo` em `TELAS_V3`; "Mais N medidas" com `ctx.fitaLigada`/`ctx.ligaFita` e `ctx.moduloLigado('dobras')` |
| **Peso** (destino) | `ctx.evolucao()` | corrigir pesagem: `ctx.apagaMedida`, `ctx.registraPeso` | a faixa 4 semanas / tudo |
| **Uma medida** | `ctx.detalheDaMedida()` | `ctx.abrirMedida`, `ctx.apagaMedida` | o traço das sessões de fotos sob a linha |
| **Medir agora** (tela de ação, uma medida por tela) | `ctx.medidasForm()` (leituras, `pedeTerceira`) | `ctx.setLeitura`, `ctx.segundaLeitura`, `ctx.salvaMedidas` | o fluxo uma-por-tela; **a segunda leitura sempre pedida**, "guardar só esta" gravando `Marca.n = 1` (já sai de `salvaMedidas` quando só há uma leitura) |
| **Bioimpedância** | `ctx.bioimpedancia()` | `ctx.registraBio`, `ctx.apagaLeituraBio` | a nova leitura no fluxo uma-por-tela |
| **Tudo na mesma data** (destino) | `S.body`, `S.protocolo` | arrastar o cursor | `ctx.naMesmaDataV3(t)`: para uma data, a leitura mais recente de cada medida e a sessão de fotos mais próxima, com a data de cada uma. Regra em `src/dominio/corpo.ts`, com teste |

Decidido na construção:

- **Dobra não tem "guardar só esta"**: a regra dela é medir três vezes e
  gravar a do meio (`REGRA_DA_DOBRA`), e uma leitura só não é essa medida. A
  fita mantém a saída, como o lote pede.
- **"Medir agora" é a mesma porta (`ctx.abreMedidas`)**: no visual novo ela
  abre o fluxo de uma por tela, inclusive vindo do fim da sessão de fotos.
- **Pesar pela régua grava na hora**; pesar de novo no mesmo dia corrige a
  pesagem do dia, como sempre foi (uma por dia).
- **A régua posiciona a fita de forma síncrona** (`useLayoutEffect`): com o
  efeito no quadro seguinte, um toque rápido no "+" era desfeito.

Testes a reescrever: `corpo`.

## Fase 3 · Treino

Protótipo: [`prototipos/treino.html`](prototipos/treino.html). Base: o treino em
foco de [`prototipos/hoje.html`](prototipos/hoje.html).

| Tela | Dados | Ações | Falta criar |
|---|---|---|---|
| **Treino em foco** (tela de ação, uma série por tela) | `ctx.modoSessao()`, `ctx.treino()`, `ctx.contadorDoDia()` | `ctx.iniciarSessao`, `ctx.poeRep`, `ctx.poeRir`, `ctx.setCarga`, `ctx.pausarSessao`, `ctx.finalizarSessao` | o fluxo uma-série-por-tela sobre o rascunho que já existe. **Não criar outro caminho de gravação**: a série entra pelo mesmo `poeRep`/`setCarga` que o modo atual usa (é onde o app já perdeu série; ver `sessao` e `serie` nos testes) |
| **Descanso** | `ctx.descanso()`, `ctx.enquantoDescansa()` | `ctx.startTimer`, `ctx.copoNoDescanso`, `ctx.preNoDescanso`, `ctx.pesoNoDescanso` | a tela cheia que enche de cor; "sobraram quantas?" grava o RIR da série que acabou (`ctx.poeRir`) |
| **Sugestão de subir carga** | `shouldUp` (`dominio/progressao.ts`) já usado em `ctx.treino()` | aceitar = carga nova na série; manter = nada | a pergunta na série; série registrada depois conta igual |
| **Mudar este exercício** | `ctx.menuDaSessao()` | `ctx.abrirSubstituicao`, `ctx.escolheTroca`, `ctx.maisUmaSerie`, `ctx.pularEx`, `ctx.aceitaDor`, `ctx.toggleDor`, `ctx.fazAntesOProximo` | "deixar para o fim" se `fazAntesOProximo` não cobrir |
| **Lista do treino** (folha) | `ctx.treino()` | `ctx.vaiParaDia`, `ctx.setDeload`, `ctx.finalizarSessao` | reordenar o que falta |
| **Pôr em dia** ("Já fiz mais do que anotei", "Já treinei e não anotei") | as séries da última vez por exercício (`historico`) | **nova**: `ctx.poeEmDia(marcados)` grava as séries com os números da última vez e `Log.dp = 1`, pelo mesmo caminho de gravação; teste de domínio e de fluxo, com conferência de mutação |
| **Aviso de intervalo longo** | instante da última série | "Pôr em dia" ou "Não, só parei" | regra do limite (múltiplo do descanso) em `src/dominio/sessao.ts`, com teste |
| **Fim do treino com "vira regra?"** | `ctx.mudancasQueEsperam()`, `ctx.esperandoDecisao()` | `ctx.respondeMudanca` | usar o caminho que já existe (`promoPendente`), não um novo |
| **Progressão e um exercício** | `ctx.historico()` | `ctx.openHist`, `ctx.renomeiaExercicio` | agrupar em "prontos para subir", "ganhando repetição", "parados" (regra em `dominio/progressao.ts`, com teste) |
| **Programa, editor, revisão** | `ctx.programa()`, `ctx.revisao()` | `ctx.acoesPrograma`, `ctx.leRevisao`, `ctx.respondeRevisao`, `ctx.incorporaRevisao`, `ctx.restauraPrograma` | a faixa de séries por músculo no editor (`dominio/volume.ts` tem o cálculo) |
| **Aula do box** | `ctx.acoesAulas`, `ctx.tiraFotoDaLousa` | — | último item do lote, sem protótipo próprio: seguir o treino em foco |

Testes a reescrever: `serie`, `regua`, `teclado`, `descansa`, `contador`,
`fotos`, `telaprograma`, `revisao`, `aula`, `lousa`.

## Fase 4 · Hoje e o restante

Protótipos: [`prototipos/hoje.html`](prototipos/hoje.html) e
[`prototipos/resto.html`](prototipos/resto.html).

| Tela | Dados | Ações | Falta criar |
|---|---|---|---|
| **Hoje** (lugar) | `ctx.cartaoDeCima()` (regra em `dominio/agora.ts`), `ctx.fatosDoDia()`, `ctx.hoje()`, `ctx.cabecalhoDeHoje()` | `ctx.marcaRefeicao`, `ctx.setAgua`, `ctx.registraPeso`, `ctx.abreTreinoDeHoje`, `ctx.respondeODia` | o bloco do momento; a linha do dia; "se quiser" com `ctx.moduloLigado`; a pergunta da noite com `ctx.respondeODia(hoje, …)` |
| **Registrar ("+")** (folha) | `ctx.fatosDoDia()` | as mesmas | o texto livre: **novo**, `src/dominio/captura.ts` (entende refeição, copos, peso), com teste. Só o que tem certeza; o resto devolve "não entendi" |
| **Dias** (lugar) | `ctx.mes()`, `ctx.diaAberto()` | `ctx.mudaMes`, `ctx.abreDia`, `ctx.respondeODia`, `ctx.lancaTreino`, `ctx.marcaNoDiaPassado` | a marca "comida respondida" no calendário via `ctx.respostaDoDia` |
| **Responder os dias** (tela de ação) | os 14 dias da janela (`janelaDoHistorico`) | `ctx.respondeODia` | a sequência um-por-tela, "voltar um" e "todos os que faltam" |
| **Semana** (lugar) | `ctx.dados()`, `ctx.corpo()`, `ctx.cicloDoBloco()` | `ctx.aplicaAjuste`, `ctx.desfazAjuste`, `ctx.abreRetro` | as séries por músculo separando **feitas** de **ainda vêm na semana** (`dominio/volume.ts`, com teste) |
| **Plano: comida, alimentos, compras** | `ctx.planoCompleto()`, `ctx.compras()`, `ctx.alimentosFiltrados()` | `ctx.editaRefeicao`, `ctx.setQuantidade`, `ctx.salvaAlimento`, `ctx.marcaCompra`, `ctx.copiaRegistro` | quantidade pela régua |
| **Ajustes** | `ctx.dadosDoApp()`, `ctx.nuvem()` | `ctx.entrarNaNuvem`, `ctx.sairDaNuvem`, `ctx.exportar`, `ctx.importaArquivo`, `ctx.ligaModulo`, `ctx.alternaVisual` | lembretes: as chaves existem (`noite`, `vesperaFotos`), o aviso em si não; decidir com o dono se entra (iPhone exige o app instalado e permissão de notificação) |
| **Primeira vez** | — | `ctx.ligaModulo` | colar o texto do treinador e do nutricionista: usar `leRevisao` e o importador de plano que existirem; se não existir importador de plano, perguntar ao dono antes de criar |
| **Estados** (vazio, sem rede, falha ao guardar) | `ctx.falhou()`, `ctx.naoGuardado()`, `ctx.nuvem()` | `ctx.tentaGravar`, `ctx.copiaRegistro`, `ctx.dispensaFalha` | `Faixa` do visual novo no lugar do aviso antigo |

Testes a reescrever: `agora` (a parte de tela), `cardio`, `turno`,
`planoalimentar`, `estados`, `pare`.

## Fase 5 · Virar a chave

Ver [00-plano.md](00-plano.md). A lista do que sai está em
[01-testes.md](01-testes.md), seção 3, e em "O que não vale mais" do
[CLAUDE.md](../../CLAUDE.md).
