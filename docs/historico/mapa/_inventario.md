# Inventário mecânico do app (gerado em 14/10/2026)

Lista tudo o que existe no código, para conferir a cobertura do mapa. Cada documento de área declara, no índice técnico, os itens daqui que cobre. Linhas de `src/main.jsx` são as do commit `8ec19a4`.


## 1. Pontos de entrada da tela (`CTX.*`) — 277

| nome | linha |
|---|---|
| `abaAtual` | 2299 |
| `vaiPara` | 2303 |
| `telaCheia` | 2330 |
| `emTelaCheia` | 2332 |
| `cabecalhoDeHoje` | 2339 |
| `hoje` | 2362 |
| `ehLinhaDeTreino` | 2408 |
| `marcaRefeicao` | 2428 |
| `setAgua` | 2458 |
| `abreRefeicao` | 2464 |
| `agua` | 2472 |
| `maisUmCopo` | 2477 |
| `abreCorrecaoDaAgua` | 2492 |
| `linhaDaComida` | 2500 |
| `abreLinhaDaComida` | 2508 |
| `marcaLinhaDaComida` | 2518 |
| `editaRefeicao` | 2535 |
| `novaRefeicao` | 2536 |
| `setEscala` | 2540 |
| `abreSeletorDeDia` | 2547 |
| `setCadenciaDeHoje` | 2548 |
| `setAlta` | 2553 |
| `jaFizHoje` | 2559 |
| `setAderencia` | 2568 |
| `setTurno` | 2574 |
| `folhas` | 2582 |
| `abreRevisao` | 3294 |
| `fechaRevisao` | 3298 |
| `textoDaRevisao` | 3300 |
| `leRevisao` | 3301 |
| `respondeRevisao` | 3309 |
| `modeloDaRevisao` | 3314 |
| `revisao` | 3354 |
| `incorporaRevisao` | 3398 |
| `abreCardioNoDia` | 3732 |
| `cardioNoDiaSet` | 3737 |
| `gravaCardioNoDia` | 3742 |
| `pare` | 4473 |
| `respondePare` | 4474 |
| `naoGuardado` | 4477 |
| `falhou` | 4478 |
| `tentaGravar` | 4480 |
| `copiaRegistro` | 4485 |
| `dispensaFalha` | 4493 |
| `tiraFotoDaLousa` | 5265 |
| `mandaLousa` | 5279 |
| `desliga` | 6668 |
| `refeicao` | 6963 |
| `seletorDeDia` | 6984 |
| `planoCompleto` | 7116 |
| `resumoDoPlano` | 7150 |
| `enderecoVazio` | 7193 |
| `comecaAqui` | 7206 |
| `alimentosFiltrados` | 7208 |
| `compras` | 7215 |
| `setHorizonteCompras` | 7239 |
| `marcaCompra` | 7244 |
| `novoAlimento` | 7248 |
| `editaAlimento` | 7249 |
| `treino` | 7268 |
| `sessaoAberta` | 7428 |
| `acoesEx` | 7433 |
| `vaiParaDia` | 7434 |
| `iniciarSessao` | 7435 |
| `pausarSessao` | 7436 |
| `retomarSessao` | 7437 |
| `finalizarSessao` | 7438 |
| `modoEdicao` | 7439 |
| `abrePrograma` | 7440 |
| `abreHistorico` | 7441 |
| `dados` | 7535 |
| `setPerfManual` | 7641 |
| `aplicaAjuste` | 7670 |
| `desfazAjuste` | 7698 |
| `passoFalhou` | 7712 |
| `dispensaPassoFalhou` | 7728 |
| `guia` | 7770 |
| `alternaCadencia` | 7788 |
| `restauraPrograma` | 7795 |
| `restauraPlano` | 7796 |
| `corpoVazio` | 7841 |
| `corpo` | 7862 |
| `cardioDeHoje` | 7960 |
| `musculos` | 7968 |
| `tecladoDoCorpo` | 8042 |
| `abreTecladoDeCorpo` | 8048 |
| `tecla` | 8051 |
| `fechaTeclado` | 8052 |
| `setPeso` | 8054 |
| `setCintura` | 8055 |
| `abreDiaCorpo` | 8056 |
| `setDiaCorpo` | 8057 |
| `registraPeso` | 8082 |
| `registraCintura` | 8083 |
| `setMedida` | 8088 |
| `registraMedida` | 8092 |
| `ligaMedida` | 8093 |
| `setOnde` | 8102 |
| `bioimpedancia` | 8143 |
| `registraBio` | 8180 |
| `apagaMedida` | 8181 |
| `apagaCardio` | 8182 |
| `corrigeCardio` | 8183 |
| `abreCardio` | 8184 |
| `abreFolha` | 8200 |
| `trocaFolha` | 8209 |
| `fechaFolha` | 8210 |
| `fechaTudo` | 8211 |
| `refeicaoParaEditar` | 8250 |
| `salvaRefeicao` | 8271 |
| `duplicaRefeicao` | 8284 |
| `removeRefeicao` | 8297 |
| `setQuantidade` | 8314 |
| `removeItem` | 8322 |
| `alternaAlta` | 8341 |
| `adicionaItem` | 8349 |
| `trocaItem` | 8358 |
| `alimentoParaEditar` | 8388 |
| `salvaAlimento` | 8405 |
| `removeAlimento` | 8437 |
| `alimentosParaSeletor` | 8462 |
| `foto` | 8467 |
| `tiraFoto` | 8479 |
| `apagaFoto` | 8480 |
| `nuvem` | 8482 |
| `nuvemCampo` | 8508 |
| `loginExpirou` | 8520 |
| `entrarNaNuvem` | 8529 |
| `sairDaNuvem` | 8546 |
| `sincronizaAgora` | 8554 |
| `dadosDoApp` | 8556 |
| `exportar` | 8592 |
| `mostraJSON` | 8593 |
| `copiaJSON` | 8594 |
| `alternaColar` | 8595 |
| `importaTexto` | 8596 |
| `importaArquivo` | 8597 |
| `abreRetro` | 8598 |
| `setDeload` | 8599 |
| `apagaTudo` | 8600 |
| `cromoDoTreino` | 8604 |
| `abreSessaoDoDia` | 8636 |
| `cardioSet` | 8642 |
| `addCardio` | 8643 |
| `mes` | 8669 |
| `abreDia` | 8769 |
| `fechaDia` | 8773 |
| `abreCardioDoDia` | 8774 |
| `alternaDescansoDoDia` | 8775 |
| `diaAberto` | 8777 |
| `mudaMes` | 8880 |
| `detalheDaSessao` | 8883 |
| `fechaSessao` | 9087 |
| `abreSerieDaPassada` | 9088 |
| `repsDaPassada` | 9089 |
| `andaReguaDaPassada` | 9090 |
| `rirDaPassada` | 9091 |
| `abreCargaDaPassada` | 9092 |
| `apagaSerieDaPassada` | 9093 |
| `abreCorrecaoDoTempo` | 9094 |
| `editaSessao` | 9095 |
| `corrigeDuracao` | 9096 |
| `confirmaDuracao` | 9101 |
| `renomeiaExercicio` | 9104 |
| `historico` | 9106 |
| `fechaHist` | 9249 |
| `histKey` | 9250 |
| `editaLinha` | 9251 |
| `cancelaEdicao` | 9252 |
| `salvaEdicao` | 9253 |
| `apagaLinha` | 9254 |
| `editDor` | 9255 |
| `limpaNum` | 9256 |
| `respondeMudanca` | 9300 |
| `ultimaQueEntrou` | 9329 |
| `mudancasQueEsperam` | 9336 |
| `retrospectiva` | 9409 |
| `fechaRetro` | 9464 |
| `retroativo` | 9467 |
| `fechaAdicionar` | 9544 |
| `lancaTreino` | 9545 |
| `abreHoraDoLancamento` | 9546 |
| `semHoraNoLancamento` | 9547 |
| `horaDoLancamento` | 9548 |
| `grupoDoLancamento` | 9549 |
| `duracaoDoLancamento` | 9550 |
| `nomeDoLancamento` | 9551 |
| `guardaLancamento` | 9552 |
| `detalhaLancamento` | 9553 |
| `edicaoDoDia` | 9559 |
| `acoesDia` | 9710 |
| `acoesRapido` | 9727 |
| `acoesAulas` | 9734 |
| `acoesAdd` | 9744 |
| `programa` | 9757 |
| `acoesPrograma` | 9884 |
| `acoesProg` | 9898 |
| `abreProtocolo` | 9945 |
| `fechaProtocolo` | 9960 |
| `comecaSessaoDeFotos` | 9963 |
| `vaiParaPose` | 9964 |
| `posAnterior` | 9976 |
| `posProxima` | 9977 |
| `tiraFotoDoCorpo` | 10054 |
| `apagaFotoDoCorpo` | 10056 |
| `setNotaDaSessao` | 10084 |
| `sessaoDeFotos` | 10138 |
| `abreComparar` | 10201 |
| `fechaComparar` | 10210 |
| `abreEvolucao` | 10217 |
| `fechaEvolucao` | 10218 |
| `evolucao` | 10220 |
| `setPoseComparada` | 10257 |
| `tentaFotos` | 10259 |
| `setDataComparada` | 10267 |
| `setSobrepor` | 10272 |
| `setCortina` | 10279 |
| `setCorte` | 10280 |
| `setOpacidade` | 10281 |
| `voltaAoParLongo` | 10303 |
| `comparacao` | 10331 |
| `setGordura` | 10446 |
| `horaDeParede` | 10477 |
| `fatosDoDia` | 10510 |
| `guardando` | 10588 |
| `diasDeComidaFechados` | 10664 |
| `abrePoeODia` | 10692 |
| `poeODiaEmDia` | 10694 |
| `marcaNoDiaPassado` | 10821 |
| `decisaoNoAgora` | 10875 |
| `abreDecisao` | 10909 |
| `decideNoAgora` | 10911 |
| `esperandoDecisao` | 10916 |
| `cartaoDeCima` | 10948 |
| `faixaDaSessao` | 10950 |
| `continuaSessao` | 10980 |
| `encerraSessaoEsquecida` | 10990 |
| `voltaAoTreino` | 11001 |
| `linhasDoCorpo` | 11023 |
| `protocoloFotos` | 11069 |
| `abreModoDeSessao` | 11174 |
| `abreAjustes` | 11183 |
| `fechaAjustes` | 11189 |
| `abreHistoricoDaPrescricao` | 11280 |
| `quatorzeDias` | 11285 |
| `cicloDoBloco` | 11357 |
| `menuDaSessao` | 11366 |
| `abreTreinoDeHoje` | 11378 |
| `enquantoDescansa` | 11394 |
| `preNoDescanso` | 11415 |
| `abrePesoNoDescanso` | 11420 |
| `pesoRapido` | 11428 |
| `registraPesoRapido` | 11432 |
| `fechaModoDeSessao` | 11441 |
| `abreAjuste` | 11490 |
| `setDataDoFantasma` | 11511 |
| `fechaAjuste` | 11517 |
| `setGradeDoAjuste` | 11518 |
| `setFantasmaDoAjuste` | 11519 |
| `setGiroDoAjuste` | 11521 |
| `setZoomDoAjuste` | 11528 |
| `arrastaAjuste` | 11533 |
| `zeraAjuste` | 11538 |
| `salvaAjuste` | 11543 |
| `ajusteEmEdicao` | 11565 |
| `streamDaCamera` | 11596 |
| `abreCamera` | 11605 |
| `fechaCamera` | 11628 |
| `setGradeDaCamera` | 11634 |
| `setFantasmaDaCamera` | 11635 |
| `setOpacidadeDaCamera` | 11636 |
| `setTimerDaCamera` | 11637 |
| `setDataDoFantasmaDaCamera` | 11638 |
| `cancelaDisparo` | 11644 |
| `disparaCamera` | 11744 |
| `tentaFotoDaPose` | 11821 |
| `cameraViva` | 11834 |

## 2. Funções de `src/main.jsx` — 446

| nome | linha |
|---|---|
| `lapide` | 130 |
| `rot` | 134 |
| `modsDoDia` | 158 |
| `achaSlot` | 163 |
| `aplicaMods` | 170 |
| `diaAberto` | 205 |
| `podeEditar` | 207 |
| `bufferMods` | 211 |
| `poeMod` | 219 |
| `tiraMod` | 229 |
| `slotDe` | 237 |
| `montaCatalogo` | 248 |
| `exDe` | 249 |
| `nomeEx` | 250 |
| `nomeDoCodigo` | 253 |
| `renomeiaExercicio` | 270 |
| `treino` | 302 |
| `corpoVazio` | 327 |
| `corpoDoBackup` | 334 |
| `normalizaEstado` | 362 |
| `leBruto` | 440 |
| `interpreta` | 448 |
| `load` | 459 |
| `somaPausas` | 586 |
| `duracaoSessao` | 594 |
| `duracaoAtual` | 600 |
| `iniciarSessao` | 604 |
| `pausarSessao` | 618 |
| `retomarSessao` | 626 |
| `encerraSePreciso` | 637 |
| `paradaDaSessao` | 669 |
| `sessaoEsquecida` | 675 |
| `ligaBatida` | 688 |
| `guardaPromo` | 722 |
| `soltaPromo` | 746 |
| `oTreino` | 760 |
| `fraseDoFechoNaUltima` | 762 |
| `fechaSessao` | 772 |
| `abreSessao` | 833 |
| `setsDoRascunho` | 844 |
| `projeta` | 865 |
| `daSessao` | 918 |
| `removeProjecao` | 924 |
| `projetaTudo` | 936 |
| `entradaDaSessao` | 945 |
| `estadoEx` | 955 |
| `pendencias` | 969 |
| `estadosDoDia` | 984 |
| `ehPulado` | 994 |
| `pularEx` | 999 |
| `abreSessaoVazia` | 1023 |
| `finalizarSessao` | 1034 |
| `encerraDeVerdade` | 1091 |
| `historico` | 1112 |
| `carregaSync` | 1129 |
| `gravaSync` | 1136 |
| `sujou` | 1145 |
| `garanteProgramaERotacao` | 1168 |
| `sincroniza` | 1173 |
| `reconciliaFotos` | 1243 |
| `reconciliaCorpo` | 1290 |
| `chaveDaFalha` | 1337 |
| `marcaFalha` | 1338 |
| `limpaFalha` | 1343 |
| `avisoDaFoto` | 1355 |
| `podeTentarFoto` | 1361 |
| `garanteBytesDoCorpo` | 1365 |
| `temQueEmpurrar` | 1404 |
| `contaFusao` | 1410 |
| `declaraGravacao` | 1447 |
| `grava` | 1450 |
| `naoGuardou` | 1464 |
| `oQueEstaGuardado` | 1480 |
| `dispensaFalha` | 1490 |
| `save` | 1493 |
| `ultimaDoPlano` | 1506 |
| `nextDay` | 1512 |
| `id` | 1515 |
| `draftOf` | 1520 |
| `hidrataDraft` | 1532 |
| `draftPeek` | 1556 |
| `queueSave` | 1560 |
| `liberaSave` | 1573 |
| `altOf` | 1583 |
| `logKey` | 1596 |
| `altList` | 1601 |
| `variantsOf` | 1624 |
| `ultimoDe` | 1633 |
| `setsFor` | 1640 |
| `pausaGeral` | 1642 |
| `sessoesDeTrabalho` | 1643 |
| `diasSemBackup` | 1644 |
| `marcos` | 1650 |
| `pausaEx` | 1665 |
| `dorSeguida` | 1667 |
| `lastSet` | 1668 |
| `lastOf` | 1669 |
| `cargaTipo` | 1670 |
| `isCorpo` | 1674 |
| `shouldUp` | 1675 |
| `textoDaSerie` | 1685 |
| `fmtLast` | 1694 |
| `temHora` | 1702 |
| `horaDaSessao` | 1703 |
| `fimDaSessao` | 1704 |
| `sessoesDoDia` | 1706 |
| `ehDescanso` | 1709 |
| `alternaDescanso` | 1718 |
| `chartSVG` | 1734 |
| `textoTotal` | 1814 |
| `atualizaAnilhas` | 1825 |
| `abrirCardioRapido` | 1832 |
| `relogioTexto` | 1838 |
| `tickRelogio` | 1846 |
| `ajustaRelogio` | 1855 |
| `atualizaEstado` | 1877 |
| `vmExercicio` | 1898 |
| `opcaoDeTroca` | 2094 |
| `hojeISO` | 2172 |
| `diaDeComida` | 2182 |
| `fechaDiaDeComida` | 2206 |
| `duracaoDoTreino` | 2229 |
| `versaoDoPlano` | 2242 |
| `planoMudou` | 2255 |
| `catalogoAlimentos` | 2258 |
| `planoDeComida` | 2269 |
| `cadenciaDaSemana` | 2274 |
| `diaResolvido` | 2278 |
| `ehLinhaDeTreino` | 2283 |
| `seriesFeitasHoje` | 2286 |
| `telaCheia` | 2591 |
| `semanasDe` | 2618 |
| `baseTreinador` | 2627 |
| `rotTreinador` | 2630 |
| `alvo` | 2634 |
| `alvoTotal` | 2641 |
| `seriesDe` | 2644 |
| `impactoSeries` | 2646 |
| `modoEdicao` | 2650 |
| `mudaSeries` | 2656 |
| `maisUmaSerie` | 2673 |
| `aceitaDor` | 2691 |
| `fazAntesOProximo` | 2706 |
| `moverEx` | 2717 |
| `removerEx` | 2726 |
| `temRegistro` | 2745 |
| `slotOriginal` | 2752 |
| `descansoPadrao` | 2779 |
| `movimentosDoDia` | 2785 |
| `ultimaAulaDe` | 2801 |
| `poeMovimentos` | 2826 |
| `repetirUltimaAula` | 2837 |
| `salvarAulaComoModelo` | 2852 |
| `importaAulaColada` | 2891 |
| `aplicarModeloDeAula` | 2922 |
| `apagarModeloDeAula` | 2928 |
| `abrirAulas` | 2940 |
| `abrirAddEx` | 2942 |
| `fecharAddEx` | 2943 |
| `setBuscaDeExercicio` | 2952 |
| `buscaEx` | 2954 |
| `addExercicio` | 2962 |
| `abrirNovoEx` | 2992 |
| `criarExercicioCom` | 3005 |
| `criarExercicio` | 3031 |
| `desfazMod` | 3043 |
| `textoMod` | 3061 |
| `impactoDoMod` | 3095 |
| `seriesOficiais` | 3112 |
| `semanasNoPrograma` | 3121 |
| `aplicaAoOficial` | 3149 |
| `difDoDia` | 3187 |
| `difTotal` | 3233 |
| `seriesDoDia` | 3243 |
| `estacoesDoDia` | 3248 |
| `metaDoDia` | 3253 |
| `totalSeries` | 3263 |
| `abrirPrograma` | 3267 |
| `fecharPrograma` | 3272 |
| `modoPrograma` | 3273 |
| `impactoOficial` | 3276 |
| `catalogoParaRevisao` | 3316 |
| `seriesDoExercicio` | 3323 |
| `idsDaRevisao` | 3332 |
| `logProg` | 3451 |
| `progSeries` | 3457 |
| `moverProg` | 3467 |
| `progRemove` | 3477 |
| `progTroca` | 3487 |
| `progSetTroca` | 3489 |
| `progReps` | 3504 |
| `progDesc` | 3516 |
| `moverDia` | 3526 |
| `criarTreino` | 3537 |
| `restaurarDia` | 3554 |
| `restaurarTudo` | 3574 |
| `openHist` | 3586 |
| `editarSessao` | 3591 |
| `cancelarEdicao` | 3592 |
| `editDor` | 3594 |
| `guardaEdicaoCom` | 3613 |
| `guardaCamposEdicao` | 3632 |
| `salvarEdicao` | 3642 |
| `apagarSessao` | 3656 |
| `histKey` | 3675 |
| `closeHist` | 3676 |
| `cardioDoDia` | 3678 |
| `cardioSemana` | 3679 |
| `pernaHoje` | 3684 |
| `cardioSet` | 3688 |
| `addCardio` | 3693 |
| `corrigeCardio` | 3709 |
| `horaDoCardio` | 3723 |
| `delCardio` | 3765 |
| `mesRef` | 3797 |
| `mudaMes` | 3818 |
| `gruposDoPlano` | 3829 |
| `regioesDoCorpo` | 3840 |
| `horaNeutra` | 3854 |
| `instanteLivre` | 3864 |
| `abrirAdicionar` | 3870 |
| `fecharAdicionar` | 3876 |
| `registroDoLancamento` | 3883 |
| `previstoNoDia` | 3889 |
| `diasNasQuatroSemanas` | 3895 |
| `lancaTreino` | 3901 |
| `corrigeLancamento` | 3919 |
| `abreHoraDoLancamento` | 3929 |
| `horaDoLancamento` | 3935 |
| `horaDoLancamentoNoCampo` | 3948 |
| `grupoDoLancamento` | 3955 |
| `duracaoDoLancamento` | 3965 |
| `anotaNomeDoLancamento` | 3975 |
| `detalhaLancamento` | 3989 |
| `concluirRetro` | 4005 |
| `mascaraDeHora` | 4022 |
| `aplicaHora` | 4027 |
| `pesoRitmo` | 4037 |
| `cinturaMes` | 4039 |
| `forcaSubindo` | 4049 |
| `diasRegistrados` | 4061 |
| `sinaisDaRegra` | 4069 |
| `veredito` | 4082 |
| `parDaAvaliacao` | 4089 |
| `rotuloDoAjuste` | 4106 |
| `arrozAtual` | 4115 |
| `aplicaArroz` | 4139 |
| `seriesPorMusculo` | 4152 |
| `unidadeDoCorpo` | 4169 |
| `diaNormalizado` | 4185 |
| `diaDaMedida` | 4188 |
| `instanteDaMedida` | 4195 |
| `rotuloDoDia` | 4199 |
| `medidaDoDia` | 4206 |
| `acaoDaMedida` | 4211 |
| `diaDaMedidaVM` | 4217 |
| `baseDoCorpo` | 4241 |
| `valorDoCorpo` | 4261 |
| `gravaMarca` | 4276 |
| `addBody` | 4294 |
| `registraBio` | 4373 |
| `nomeNaFrase` | 4423 |
| `listaComE` | 4424 |
| `comUnidade` | 4434 |
| `pare` | 4452 |
| `respondePare` | 4466 |
| `delBody` | 4496 |
| `payload` | 4530 |
| `exportData` | 4534 |
| `showJSON` | 4556 |
| `pasteJSON` | 4563 |
| `copyJSON` | 4565 |
| `legacyCopy` | 4572 |
| `importFile` | 4579 |
| `importText` | 4588 |
| `toast` | 4691 |
| `diaDaSessaoAberta` | 4712 |
| `go` | 4716 |
| `mostraExercicio` | 4729 |
| `toggle` | 4734 |
| `dorName` | 4748 |
| `filtroNum` | 4755 |
| `soNumero` | 4763 |
| `limpaNum` | 4767 |
| `anotaSerie` | 4786 |
| `inp` | 4807 |
| `anotaSerieRapida` | 4831 |
| `abreTecladoRapido` | 4863 |
| `abrirRapido` | 4877 |
| `serieCheia` | 4886 |
| `serieJaRegistrada` | 4908 |
| `dizSerie` | 4948 |
| `autoTimer` | 4971 |
| `avancaExercicio` | 5016 |
| `proximoDoBiset` | 5028 |
| `usaAnterior` | 5051 |
| `anotaObservacao` | 5069 |
| `obsIn` | 5070 |
| `toggleAq` | 5071 |
| `abrirNota` | 5075 |
| `abrirCarga` | 5076 |
| `abrirMedida` | 5078 |
| `poeMedida` | 5093 |
| `textoDaPrescricao` | 5138 |
| `atualizaPrescricao` | 5148 |
| `numeroDoCampo` | 5157 |
| `setCarga` | 5163 |
| `abreFoto` | 5180 |
| `carregaFotosDoDia` | 5197 |
| `carregaFotos` | 5203 |
| `fotoAberta` | 5214 |
| `tiraFotoDaLousa` | 5225 |
| `lousaDoDia` | 5268 |
| `tiraFoto` | 5293 |
| `apagaFoto` | 5315 |
| `reguaDaLinha` | 5352 |
| `textoDoGuardado` | 5374 |
| `abreRegua` | 5387 |
| `andaRegua` | 5398 |
| `poeRep` | 5429 |
| `abreOutroValor` | 5445 |
| `teclaDoTeclado` | 5464 |
| `fechaTeclado` | 5497 |
| `abreTecladoDeCarga` | 5509 |
| `abreTecladoDeCorpo` | 5538 |
| `abreRir` | 5554 |
| `poeRir` | 5560 |
| `toggleDor` | 5570 |
| `toggleSwap` | 5576 |
| `abrirSubstituicao` | 5589 |
| `setAlt` | 5590 |
| `nSeries` | 5616 |
| `corteDoDeload` | 5619 |
| `itemDoDeload` | 5634 |
| `fraseDoDesligar` | 5654 |
| `remarcaSessao` | 5684 |
| `setDeload` | 5695 |
| `itensDaSessao` | 5714 |
| `resumoDaSessao` | 5765 |
| `apagaRegistroDeTreino` | 5789 |
| `corrigeDuracao` | 5868 |
| `confirmaDuracao` | 5892 |
| `registroPorChave` | 5914 |
| `serieDaPassada` | 5918 |
| `abreSerieDaPassada` | 5926 |
| `unidadeDoPrescrito` | 5947 |
| `referenciaDaSerie` | 5958 |
| `lancaSerieDaPassada` | 5977 |
| `gravaNaPassada` | 6015 |
| `textoDaSerieDaPassada` | 6036 |
| `repsDaPassada` | 6041 |
| `andaReguaDaPassada` | 6047 |
| `rirDaPassada` | 6065 |
| `abreCargaDaPassada` | 6074 |
| `cargaDaPassada` | 6091 |
| `apagaSerieDaPassada` | 6104 |
| `exDoRegistro` | 6130 |
| `editorDoNovo` | 6137 |
| `abreCorrecaoDoTempo` | 6159 |
| `abrirSessao` | 6161 |
| `fecharSessao` | 6162 |
| `inicioDoBloco` | 6167 |
| `retro` | 6174 |
| `abrirRetro` | 6228 |
| `fecharRetro` | 6229 |
| `wipe` | 6231 |
| `descOf` | 6357 |
| `alturaDoTimer` | 6378 |
| `gravaDescanso` | 6384 |
| `apagaDescanso` | 6389 |
| `retomaDescanso` | 6401 |
| `startTimer` | 6427 |
| `ajustaTimer` | 6452 |
| `pintaTimer` | 6472 |
| `ligaBotaoDoTimer` | 6503 |
| `stopTimer` | 6523 |
| `preparaAudio` | 6539 |
| `aviso` | 6548 |
| `segurarTela` | 6570 |
| `soltarTela` | 6580 |
| `descarregaAoSair` | 6596 |
| `naoAbriu` | 6879 |
| `arranca` | 6916 |
| `folhaAberta` | 6942 |
| `render` | 7048 |
| `voltarUmaCamada` | 7098 |
| `enderecoVazio` | 7182 |
| `volumeDoDia` | 7256 |
| `dadosDeComida` | 7452 |
| `semanasDoVazio` | 7621 |
| `gravaOPasso` | 7648 |
| `sinalDoPasso` | 7731 |
| `kcalDeTreinoCom` | 7739 |
| `passoEmVigor` | 7753 |
| `linhaDoAjuste` | 7759 |
| `serieSemanal` | 7812 |
| `medidasRecentes` | 7827 |
| `ehFita` | 8087 |
| `pilha` | 8198 |
| `idAlimento` | 8214 |
| `achaRefeicao` | 8222 |
| `idRefeicao` | 8237 |
| `maiuscula` | 8660 |
| `horaDeMinutos` | 8662 |
| `numeroCurto` | 8664 |
| `letraDoRegistro` | 8667 |
| `fraseDoVencimento` | 9400 |
| `trocaDoDia` | 9594 |
| `referenciaDoBox` | 9618 |
| `referenciaDaUltimaAula` | 9632 |
| `catalogoDeAdicao` | 9655 |
| `programaLista` | 9765 |
| `programaDia` | 9794 |
| `trocaDoPrograma` | 9827 |
| `programaDiff` | 9849 |
| `programaHist` | 9865 |
| `ordemDePoses` | 9921 |
| `sessaoFotoOuCria` | 9924 |
| `datasNecessarias` | 9935 |
| `andaPose` | 9966 |
| `marcaPoseNaoGuardada` | 10001 |
| `proximaComAdiadas` | 10009 |
| `guardaFotoDaPose` | 10016 |
| `tiraFotoDoCorpo` | 10041 |
| `fimDaSessaoDeFotos` | 10102 |
| `aplicaParPadrao` | 10249 |
| `vazioDeUmaSessao` | 10287 |
| `ladoDaComparacao` | 10306 |
| `fraseDoDia` | 10771 |
| `fotosSoAqui` | 11102 |
| `abreModo` | 11167 |
| `entraNoDestino` | 11448 |
| `esqueceDestino` | 11454 |
| `saiDoDestino` | 11456 |
| `fotosDoAjuste` | 11473 |
| `datasDoFantasma` | 11484 |
| `encerraCamera` | 11599 |
| `contaEDispara` | 11654 |
| `obturador` | 11672 |
| `clarao` | 11686 |
| `falaTexto` | 11696 |
| `giroEntre` | 11709 |
| `falaPose` | 11716 |
| `bipeDaContagem` | 11726 |
| `capturaAgora` | 11752 |
| `avisoDaPoseNaoGuardada` | 11808 |

## 3. Regras e funções do domínio e da infra (`export`)

- `src/dominio/agora.ts`: `SessaoNoTopo`, `FechamentoAConfirmar`, `TreinoDoDia`, `RefeicaoDoDia`, `FatosDoDia`, `Cartao`, `JANELA_REFEICAO`, `cartaoDeCima`
- `src/dominio/aula.ts`: `UNIDADES`, `CARREGAMENTOS`, `MovimentoNovo`, `AulaLida`, `Leitura`, `leAula`
- `src/dominio/carga.ts`: `totalAnilhas`, `isTime`, `unidadeDe`, `temUnidade`, `cronometrado`, `menosEhMelhor`, `ROTULO_UNIDADE`, `ritmoDe`, `ESCALA_RITMO`, `tutOf`, `volOf`, `maxLoad`, `repsOf`, `topReps`
- `src/dominio/corpo.ts`: `MedidaDoCorpo`, `MEDIDAS_DO_CORPO`, `MARCAS_DO_CORPO`, `MARCAS_DA_BIO`, `MEDIDAS_DE_FITA`, `medidaDoCorpo`, `ondeMediu`, `Semana`, `Ritmo`, `Cintura`, `Veredito`, `Ajuste`, `Sinais`, `LeituraDeGordura`, `VALIDADE_LEITURA`, `JANELA_MIN`, `leituraVigente`, `ALTO`, `BAIXO`, `ALVO_MIN`, `MIN_PESAGENS`, `MIN_REGISTRADOS`, `ajusteDoVeredito`, `TaxaSemanal`, `semRuido`, `taxasSemanais`, `veredito`, `Portao`, `FontesDosPortoes`, `portoesDaRegra`, `SemanaDaRegra`, `semanasDaRegra`, `TrechoDaSemana`, `SemanaEmCurso`, `semanaEmCurso`, `TaxaDaEvolucao`, `LeituraDaEvolucao`, `leituraDaEvolucao`, `mediasSemanais`, `pesoRitmo`, `cinturaMes`
- `src/dominio/dia.ts`: `Cadencia`, `CADENCIA_PADRAO`, `Origem`, `DiaDeHoje`, `rotacao`, `ultimaDoPlano`, `proximoTreino`, `cadenciaPrevista`, `diaDeHoje`, `previsaoDoHorizonte`
- `src/dominio/enquadramento.ts`: `ASPECTO`, `GIRO_MAX`, `ZOOM_MAX`, `IDENTIDADE`, `zoomMinimo`, `folga`, `normaliza`, `ehIdentidade`, `transform`, `arrasta`
- `src/dominio/forca.ts`: `e1rmDaSerie`, `e1rmDoLog`, `Tendencia`, `tendenciaDeForca`, `sinalDeForca`, `textoDaTendencia`, `melhorE1rm`, `e1rmPorSemana`
- `src/dominio/formato.ts`: `Periodo`, `fmtNum`, `fmtCarga`, `fmtInt`, `fmtLitros`, `fmtDec`, `fmtSig`, `fmtDec2`, `fmtSig2`, `fmtK`, `DIAS_CURTOS`, `DIAS_LONGOS`, `MESES`, `PERIODOS`, `periodoDe`, `fmtHoraDita`, `fmtHora`, `semanasDesde`, `fmtDur`, `diaExtenso`, `fmtDate`, `weekStart`, `sameDay`, `fmtDesc`, `escapeHTML`, `escAttr`, `normalizaBusca`, `casaBusca`, `caixaDeFrase`
- `src/dominio/mes.ts`: `SessaoDoMes`, `inicioDoDia`, `diasComTreino`, `mediaMovel`, `leituraDosDias`, `serieDaMediaMovel`, `medianaDosInicios`, `Inicio`, `iniciosDoPeriodo`
- `src/dominio/migracoes.ts`: `PLANO_ATUAL`, `Resultado3`, `ARQUIVO`, `PLANO_1`, `migraPlano`, `ROT_PLANO_3`, `PROGRAMA_PLANO_3`, `migraPlano3`, `Resultado4`, `migraPlano4`, `TROCA_4_5`, `trocaLetra`, `Resultado5`, `migraPlano5`, `Resultado6`, `migraPlano6`, `Resultado7`, `migraPlano7`, `NOME_POS_PLANO_7`, `Resultado8`, `migraPlano8`, `REVISAO_B_PLANO_8`, `Resultado9`, `migraPlano9`, `Resultado10`, `listaDePromo`, `migraPlano10`, `CEIA_PLANO_11`, `Resultado11`, `migraPlano11`, `PASSO_ARROZ_PLANO_12`, `GRADE_ARROZ_PLANO_12`, `Resultado12`, `migraPlano12`
- `src/dominio/nutricao/alimentos.ts`: `CATEGORIAS`, `ALIMENTOS_BASE`, `TURNOS`, `PLANO_BASE`
- `src/dominio/nutricao/calculo.ts`: `VAZIO`, `somaTotais`, `totalDoItem`, `itemEntra`, `refeicaoEntra`, `totalDaRefeicao`, `totalDoDia`, `totalRegistrado`, `minutosDe`, `horaDe`, `deslocamentoDoTurno`, `DURACAO_PADRAO`, `duracaoDaSessao`, `FOLGA_POS`, `CORTE_CAFEINA`, `refeicoesDeHoje`, `posTreinoDe`, `refeicoesMovidas`, `resumoDaRefeicao`, `PASSO_ARROZ`, `arrozDoAjuste`, `ajusteNoItem`, `quantidadePrescrita`, `aplicaAjusteNoArroz`, `tiraMarcaDeArroz`, `listaDeCompras`, `fmtKg`, `fechaDia`, `ComidaDoDia`, `PostoNoDia`, `poeComidaNoDia`, `aderenciaDoDia`, `excessoDoDia`, `PadraoDeRefeicao`, `padraoPorRefeicao`, `diaInterpretavel`, `diasInterpretaveis`, `janelaDoHistorico`, `aderenciaPorSemana`, `contagemDaRefeicao`, `Recorte`, `recorteDoHistorico`, `TrocaDeAjuste`, `trocasDeAjuste`
- `src/dominio/nutricao/tipos.ts`: `Alimento`, `Quando`, `Turno`, `Item`, `Refeicao`, `Totais`, `ComoFoiARefeicao`, `DiaComida`, `DiaComidaHist`, `LinhaCompra`
- `src/dominio/prescricao.ts`: `HORIZONTE_PADRAO`, `quandoAquelaVolta`, `SessaoRegistrada`, `venceuPorPosicao`
- `src/dominio/programa.ts`: `ExercicioPrescrito`, `Substituto`, `Regra`, `Nivel`, `Carga`, `ROT_BASE`, `D_COMPOSTO`, `PROGRAMA`, `RULES`, `ALT`, `LEGADO`, `slugEx`, `SIMULACAO_HYROX`, `MOVIMENTOS_DE_BOX`, `FREQUENTES_NO_BOX`, `EX_BASE`, `PRIORIDADES`, `NIVEIS`, `REGIOES`, `regiaoDe`, `ordemDe`, `ehPriorizado`, `nivelDe`, `PRIO`, `CARGAS`, `DORES`, `MODAIS`, `semeiaProg`, `montaCatalogo`, `exercicioFantasma`
- `src/dominio/progressao.ts`: `PAUSA_DIAS`, `diasDesde`, `historico`, `lastSet`, `pausaEx`, `dorSeguida`, `shouldUp`, `setsFor`
- `src/dominio/protocolo.ts`: `CADENCIA_DIAS`, `ItemDeMontagem`, `MONTAGEM`, `PROTOCOLO`, `ordemPadrao`, `poseDe`, `poses`, `dataLocal`, `instanteDaData`, `ordenadas`, `sessaoDe`, `ultima`, `diasDesde`, `Completude`, `completude`, `BRILHO_DO_PRETO`, `quaseTodoPreto`, `proximaPose`, `Referencia`, `referencia`, `comAPose`, `vizinhaComAPose`, `parPadrao`, `mediaDaSemana`
- `src/dominio/regua.ts`: `SLOTS`, `PASSO`, `Faixa`, `Regua`, `Slot`, `TETO_DE_VALORES`, `regua`, `pagina`, `anda`, `escolhiveis`, `faixaDoTexto`
- `src/dominio/revisao.ts`: `ExDaRevisao`, `DiaDaRevisao`, `LeituraDaRevisao`, `lerRevisao`, `parecenca`, `Correspondencia`, `ExDoCatalogo`, `casaNomes`, `MudancaDoDia`, `mudancasDaRevisao`, `MODELO_DA_REVISAO`
- `src/dominio/sessao.ts`: `EstadoEx`, `pendente`, `ondeEleEstava`, `proximoDepois`
- `src/dominio/sincronia.ts`: `LAPIDE_DIAS`, `ResumoDaFusao`, `chaveDeLog`, `chaveDeSessao`, `chaveDeMarca`, `chaveDeCardio`, `chaveDeDiaComida`, `chaveDeRefeicaoFeita`, `chaveDePromo`, `chaveDeAula`, `chaveDeDescanso`, `chaveDeLeitura`, `chaveDeFoto`, `chaveDeSessaoFoto`, `chaveDeFotoDoCorpo`, `chaveDeProgLog`, `lapidesDoApagamento`, `uneLapides`, `mtimeDe`, `funde`
- `src/dominio/teclado.ts`: `DECIMAL_FIXA`, `teclar`
- `src/dominio/tipos.ts`: `TipoCarga`, `Unidade`, `Dia`, `IdEx`, `Exercicio`, `Slot`, `SlotResolvido`, `Treino`, `Serie`, `Log`, `Sessao`, `Mod`, `Mods`, `SessaoAberta`, `EntradaProgLog`, `PromoPendente`, `Enquadramento`, `FotoRef`, `PoseId`, `Pose`, `SessaoFoto`, `Marca`, `QualMarca`, `Corpo`, `Cardio`, `RascunhoEx`, `Rascunho`, `ModeloDeAula`, `PassoDeAjuste`, `EstadoCompras`, `EstadoComida`, `Estado`
- `src/dominio/volume.ts`: `alvoDoPrograma`, `seriesDeGrupo`, `Impacto`, `impacto`, `ContextoDoImpacto`, `impactoDoMod`, `seriesPorMusculo`, `Leitura`, `Hierarquia`, `leituraDaSemana`
- `src/infra/camera.ts`: `temCamera`, `ErroDeCamera`, `Aberta`, `Resultado`, `abre`, `fecha`, `pronto`
- `src/infra/corpo.ts`: `CACHE_CORPO`, `SESSOES_NO_APARELHO`, `reduz`, `reduzDoVideo`, `urlDaFoto`, `carrega`, `solta`, `guarda`, `le`, `tem`, `esquece`, `poda`
- `src/infra/db.ts`: `Armazenamento`, `Modo`, `MotivoDeFalha`, `DB`
- `src/infra/fotos.ts`: `CACHE_FOTOS`, `CACHE_FOTOS_LEGADO`, `migraCache`, `urlDaFoto`, `carrega`, `solta`, `reduzPara`, `reduz`, `guarda`, `le`, `tem`, `esquece`
- `src/infra/lousa.ts`: `CACHE_LOUSA`, `reduz`, `guarda`, `le`, `esquece`, `urlDaLousa`, `carrega`
- `src/infra/nuvem.ts`: `SessaoNuvem`, `Falha`, `Resultado`, `LinhaDoEstado`, `NUVEM`
- `src/palco.js`: `ehBancada`
- `src/sw.js`
- `src/ui/navegacao.js`: `camadasAbertas`, `sincronizaHistorico`, `liga`, `_reinicia`

## 4. Campos do dado guardado (`Estado`, `S.*`) — 34

`S.logs`, `S.done`, `S.deload`, `S.draft`, `S.sessao`, `S.cardio`, `S.body`, `S.carga`, `S.export`, `S.plano`, `S.prog`, `S.rot`, `S.ex`, `S.mods`, `S.progLog`, `S.aulas`, `S.quadro`, `S.lousa`, `S.progTreinador`, `S.cadencia`, `S.comida`, `S.dia`, `S.comidaHist`, `S.ajuste`, `S.ajusteHist`, `S.gordura`, `S.perfManual`, `S.compras`, `S.mtime`, `S.promoPendente`, `S.fotos`, `S.protocolo`, `S.descanso`, `S.apagados`

## 5. Estado de tela (`view.*`, não guardado) — 63

`view.aba`, `view.add`, `view.addEx`, `view.addQ`, `view.aguaCorrige`, `view.aguaFalhou`, `view.ajuste`, `view.ajustes`, `view.aulas`, `view.bodyDia`, `view.bodyDiaAberto`, `view.bodyForm`, `view.bodyOnde`, `view.camera`, `view.cardioAberto`, `view.cardioForm`, `view.cardioNoDia`, `view.cardioNoDiaFalhou`, `view.cardioRapido`, `view.carga`, `view.colaAula`, `view.comecouAqui`, `view.comparar`, `view.corrigeTempo`, `view.day`, `view.diaAberto`, `view.edit`, `view.editProg`, `view.evolucao`, `view.falhou`, `view.fired`, `view.fitaLigadas`, `view.hist`, `view.json`, `view.linhaComida`, `view.medida`, `view.mes`, `view.modoSessao`, `view.naoGuardado`, `view.nota`, `view.novoEx`, `view.nuvemEntrando`, `view.nuvemErro`, `view.nuvemForm`, `view.open`, `view.pare`, `view.passada`, `view.passoFalhou`, `view.paste`, `view.perguntaDe`, `view.pilha`, `view.prog`, `view.protocolo`, `view.rapido`, `view.regua`, `view.retro`, `view.revisao`, `view.rir`, `view.sessao`, `view.swapOpen`, `view.tab`, `view.teclado`, `view.ultimaMarca`

## 6. Telas, folhas e peças de interface

- `src/ui/app.jsx`: `App`
- `src/ui/exercicio.jsx`: `Exercicio`
- `src/ui/folhas/decidir.jsx`: `FolhaDecidir`
- `src/ui/folhas/editores.jsx`: `FolhaEditaRefeicao`, `FolhaSeletor`, `FolhaEditaAlimento`
- `src/ui/folhas/foto.jsx`: `FolhaFoto`
- `src/ui/folhas/menusessao.jsx`: `FolhaMenuDaSessao`
- `src/ui/folhas/pesorapido.jsx`: `FolhaPesoRapido`
- `src/ui/folhas/poeodia.jsx`: `FolhaPoeODia`
- `src/ui/folhas/refeicao.jsx`: `FolhaRefeicao`, `FolhaDia`
- `src/ui/instrumento/edicao.jsx`: `LinhaEditavel`, `Troca`, `RegistroRapido`, `Aulas`, `AddEx`
- `src/ui/instrumento/faixasessao.jsx`: `FaixaDaSessao`
- `src/ui/instrumento/folha.jsx`: `Folha`, `LinhaExpansivel`
- `src/ui/instrumento/forma.jsx`: `Forma`
- `src/ui/instrumento/fotoajustada.jsx`: `FotoAjustada`
- `src/ui/instrumento/pare.jsx`: `Pare`, `Falhou`, `NaoGuardado`
- `src/ui/instrumento/primitivos.jsx`: `Cabecalho`, `BotaoEstado`, `Secao`, `Vazio`, `Procedencia`, `GradeMetricas`, `Sparkline`, `Stepper`, `Chips`, `Veredito`, `CartaoFoco`, `useAgora`
- `src/ui/instrumento/regua.jsx`: `Regua`
- `src/ui/instrumento/tabbar.jsx`: `TabBar`
- `src/ui/instrumento/teclado.jsx`: `Teclado`
- `src/ui/instrumento/telacheia.jsx`: `TelaCheia`, `Stats`, `Grafico`, `LinhaResumo`
- `src/ui/raiz.jsx`: `montaNoApp`, `desmontaDoApp`
- `src/ui/telas/agora.jsx`: `Agora`
- `src/ui/telas/ajustefoto.jsx`: `AjusteFoto`
- `src/ui/telas/ajustes.jsx`: `Ajustes`
- `src/ui/telas/camera.jsx`: `Camera`
- `src/ui/telas/comparar.jsx`: `Comparar`
- `src/ui/telas/corpo.jsx`: `Corpo`
- `src/ui/telas/dia.jsx`: `Dia`
- `src/ui/telas/dias.jsx`: `Mes`, `Dias`
- `src/ui/telas/edicaodia.jsx`: `EdicaoDoDia`
- `src/ui/telas/evolucao.jsx`: `Evolucao`
- `src/ui/telas/historico.jsx`: `Historico`
- `src/ui/telas/prescricao.jsx`: `Prescricao`
- `src/ui/telas/programa.jsx`: `Programa`
- `src/ui/telas/protocolo.jsx`: `Protocolo`
- `src/ui/telas/retroativo.jsx`: `Retroativo`
- `src/ui/telas/retrospectiva.jsx`: `Retrospectiva`
- `src/ui/telas/revisao.jsx`: `Revisao`
- `src/ui/telas/semana.jsx`: `Semana`
- `src/ui/telas/sessao.jsx`: `Sessao`
- `src/ui/telas/sessaomodo.jsx`: `SessaoModo`
- `src/ui/telas/treino.jsx`: `Treino`

## 7. Testes

- `tests/dominio/agora.test.ts` — 21 casos
- `tests/dominio/ajuda.ts` — 0 casos
- `tests/dominio/aula.test.ts` — 16 casos
- `tests/dominio/busca.test.ts` — 10 casos
- `tests/dominio/campos.test.ts` — 4 casos
- `tests/dominio/carga.test.ts` — 9 casos
- `tests/dominio/corpo.test.ts` — 46 casos
- `tests/dominio/diario.test.ts` — 44 casos
- `tests/dominio/enquadramento.test.ts` — 23 casos
- `tests/dominio/estilo.test.ts` — 52 casos
- `tests/dominio/formato.test.ts` — 17 casos
- `tests/dominio/fusao.test.ts` — 24 casos
- `tests/dominio/leitura.test.ts` — 14 casos
- `tests/dominio/mes.test.ts` — 7 casos
- `tests/dominio/migracoes.test.ts` — 62 casos
- `tests/dominio/nutricao.test.ts` — 36 casos
- `tests/dominio/prescricao.test.ts` — 13 casos
- `tests/dominio/progressao.test.ts` — 11 casos
- `tests/dominio/protocolo.test.ts` — 29 casos
- `tests/dominio/regua.test.ts` — 18 casos
- `tests/dominio/revisao.test.ts` — 8 casos
- `tests/dominio/sessao.test.ts` — 9 casos
- `tests/dominio/sincronia.test.ts` — 64 casos
- `tests/dominio/spark.test.ts` — 5 casos
- `tests/dominio/teclado.test.ts` — 8 casos
- `tests/dominio/turno.test.ts` — 17 casos
- `tests/dominio/unidade.test.ts` — 13 casos
- `tests/dominio/volume.test.ts` — 23 casos
- `tests/fluxo/agora.test.js` — 77 casos
- `tests/fluxo/ajuste.test.js` — 31 casos
- `tests/fluxo/aula.test.js` — 19 casos
- `tests/fluxo/aulaimport.test.js` — 14 casos
- `tests/fluxo/avanco.test.js` — 10 casos
- `tests/fluxo/cardio.test.js` — 16 casos
- `tests/fluxo/carga.test.js` — 11 casos
- `tests/fluxo/ciclo.test.js` — 18 casos
- `tests/fluxo/corpo.test.js` — 70 casos
- `tests/fluxo/cronometro.test.js` — 12 casos
- `tests/fluxo/dados.test.js` — 34 casos
- `tests/fluxo/descansa.test.js` — 7 casos
- `tests/fluxo/diario.test.js` — 9 casos
- `tests/fluxo/dubles.js` — 0 casos
- `tests/fluxo/edicao.test.js` — 30 casos
- `tests/fluxo/endereco.test.js` — 6 casos
- `tests/fluxo/esquecido.test.js` — 11 casos
- `tests/fluxo/estados.test.js` — 13 casos
- `tests/fluxo/fluxo.test.js` — 5 casos
- `tests/fluxo/fotos.test.js` — 21 casos
- `tests/fluxo/fusao.test.js` — 45 casos
- `tests/fluxo/gravacao.test.js` — 6 casos
- `tests/fluxo/harness.js` — 0 casos
- `tests/fluxo/horario.test.js` — 15 casos
- `tests/fluxo/leitura.test.js` — 3 casos
- `tests/fluxo/lousa.test.js` — 7 casos
- `tests/fluxo/migracaochave.test.js` — 7 casos
- `tests/fluxo/navegacao.test.js` — 20 casos
- `tests/fluxo/pare.test.js` — 6 casos
- `tests/fluxo/planoalimentar.test.js` — 7 casos
- `tests/fluxo/portas.test.js` — 10 casos
- `tests/fluxo/programa.test.js` — 12 casos
- `tests/fluxo/promocao.test.js` — 10 casos
- `tests/fluxo/protocolo.test.js` — 92 casos
- `tests/fluxo/publicacao.test.js` — 14 casos
- `tests/fluxo/regua.test.js` — 15 casos
- `tests/fluxo/retro.test.js` — 17 casos
- `tests/fluxo/revisao.test.js` — 8 casos
- `tests/fluxo/ritmo.test.js` — 21 casos
- `tests/fluxo/serie.test.js` — 15 casos
- `tests/fluxo/sessao.test.js` — 50 casos
- `tests/fluxo/sincronia.test.js` — 21 casos
- `tests/fluxo/teclado.test.js` — 13 casos
- `tests/fluxo/telaprograma.test.js` — 29 casos
- `tests/fluxo/telas.test.js` — 62 casos
- `tests/fluxo/trocaprograma.test.js` — 8 casos
- `tests/fluxo/turno.test.js` — 15 casos
