# Auditoria da implementação

O que o app construído (`src/ui/v3/`, `src/v3/`, `src/main.jsx`) faz diferente do design system, tela por tela, com a correção. Conferido no código em 17/11/2026. É o plano da implementação; o achado feito diz em que peça (as peças estão no `06-prompt-implementacao.md` e o andamento no `LEIA.md`).

39 achados. Os marcados **dado** (3) mexem em dado ou regra: pedem migração, fusão, cópia de segurança, espelho dos agentes e teste de domínio, como manda o `CLAUDE.md`. Os outros são de tela e se conferem olhando.

Ordem sugerida: primeiro o que se perde (Ajustes inalcançável, tira do treino aberto) e a fluidez (a porta do movimento religada aos tokens novos, as âncoras), depois os tokens e componentes base (corrigem dezenas de telas de uma vez), depois o treino, e por fim os três de **dado**, cada um com seu teste.

## Fluidez e estabilidade (07-fluidez-e-estabilidade.md)

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| fluxo | **Toda troca de tela é seca** (feito, peça 2) | src/v3/global.css:104 zera todas as animações de transição de vista. A porta do movimento (src/ui/movimento.js, trocaDeCamada, chamada por src/main.jsx:7806 em toda troca de camada) continua lá, mas lê tokens de duração que saíram na Fase 5 (--ins-dur-entra, --ins-dur-sai, --ins-dur-dissolve), então o tempo dá zero. | Reaproveitar a porta, não reescrever: trocar os tokens pelos de tokens.css (--d-navega, --d-sai, --d-passo, --d-acao, --d-fecha, --mola, --mola-sai), mapear os sentidos dela para a tabela do 07 (lugar, entra, sai, sobe, desce, passo, estado), escrever as animações ::view-transition-old/new por sentido e tirar o animation:none do global.css. O que a porta já resolve fica: o toque no meio da transição (aoDescer), o desenho atrasado e "reduzir movimento" por adesão. | src/ui/movimento.js, src/v3/global.css, src/main.jsx:7737-7806 |
| hierarquia | **O "Feito" muda de lugar** (feito, peça 2 (as âncoras; a série com uma régua só é da peça 4)) | Na série, as duas réguas empilhadas fazem a tela rolar e o botão fica onde o conteúdo acabar; no descanso, o principal ("Pular o descanso") está numa tela sem a linha de links da série, então fica em outra altura. | Âncoras da tela de ação: um principal de largura toda no mesmo y em série, descanso e fim; a linha das saídas sempre reservada (44 px); ajustes do descanso (−15 s, +15 s) na linha das saídas. Conferir com getBoundingClientRect nos três estados. | Serie, Descanso, FimDoTreino em treino.jsx; TelaDeAcao em base.jsx |
| hierarquia | **Nenhuma âncora com nome de transição** (feito, peça 2 (tela de ação e doca; os nomes por seção, para o estado da mesma tela, ficam para quando cada lugar for feito)) | Nenhum view-transition-name no app: numa troca, o botão principal, o topo e a doca seriam fotografados junto com o resto e se mexeriam. | view-transition-name dado por quem desenha: o principal da tela de ação, o topo, os segmentos, a doca; por seção nos estados da mesma tela. Um nome por âncora (nome repetido cancela a transição). | base.jsx (TelaDeAcao, Bloco, Secao, Doca) |
| estado | **Folha fecha no mesmo tempo em que abre** (feito, peça 2) | A folha só tem a animação de subir (v3-sobe); ao fechar, some. | Sobe em 340 ms com --mola; desce em 240 ms com --mola-sai. O véu acompanha. | .v3-folha, .v3-veu em componentes.css |

## O app inteiro (tokens e componentes base)

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| cor | **Cinza de legenda sem contraste** (feito, peça 3) | --tinta-3 #77766D em toda nota de seção, apoio de linha e seta de linha: 4,1:1 no papel, 3,7:1 na areia. | Trocar por --texto-legenda #62615A (5,6:1 e 5,0:1). | src/v3/tokens.css; .v3-sec-h small, .v3-lin-t span, .v3-lin > svg em src/v3/componentes.css |
| cor | **Controles com contorno invisível** (feito, peça 3) | Chave desligada com trilho --fio, ficha e quadro com contorno --fio (1,3:1 no papel). | Nascer --contorno #858073 para contorno de controle (chave desligada: trilho de superfície com contorno e bolinha de contorno; ficha, campo, escolha). --fio fica só como divisória. | .v3-chave-k, .v3-ficha, .v3-esc em componentes.css e fotos.css |
| cor | **Botão desabilitado ilegível sobre cor** (feito, peça 3) | Fundo --tinta-18 com texto --tinta-2: 3,4:1 sobre lima. | Desabilitado = fundo transparente, contorno tracejado de 2 px em tinta, texto em tinta, e a frase do porquê quando cabe. | .v3-btn.p:disabled |
| cor | **Tokens nomeados pela cor** (feito, peça 3) | --lima, --tanja, --lilas… usados direto nas telas, inclusive como "atenção". | Adotar docs/design-system/tokens.css: papéis (--assunto-treino, --atencao, --texto-legenda…). Uma troca de nome, sem mudar valor, exceto legenda e contorno. | src/v3/tokens.css e todo src/v3 |
| tamanho | **Título do bloco do momento grande demais** (feito, peça 3) | 56/0,90 e médio 38/0,96 (o tamanho do hoje.html). | 50/0,92 e médio 36/0,98, médio quando passar de 12 letras. | .v3-bloco-t; Bloco em src/ui/v3/base.jsx (medio = titulo.length > 12 no Hoje, > 14 na Semana: unificar em 12) |
| tamanho | **Alvos abaixo de 44 px** (feito, peça 3) | Saída discreta 36, seletor em pílula 38, botão da faixa 36, ficha de resposta 46, links da tela de ação 40. | Saída e links com área de 44 (o texto não muda); seletor 44; botão de faixa 44; ficha de resposta 48. | .v3-saida, .v3-sel button, .v3-faixa button, .v3-perg-r button, .v3-acao-links button |
| tamanho | **Número do quadro** (feito, peça 3) | 20 px. | 22 px (--t-quadro). | .v3-quadro b |
| acessibilidade | **Escolha única anunciada como botão de alternar** (feito, peça 3) | Seletor em pílula e fichas de resposta usam aria-pressed em grupo. | role="radiogroup" com role="radio" e aria-checked; o leitor de tela passa a dizer "1 de 3, selecionado". | Seletor, Fichas e Pergunta em src/ui/v3/base.jsx |
| estado | **A faixa "sem rede" não some** (feito, peça 3) | Fica no topo enquanto não houver rede. | Avisa uma vez e some em 4 s; só volta se a rede voltar e cair de novo. A falha ao guardar é a única que fica. | src/ui/v3/estados.jsx |
| cor | **Ponto "agora" da linha do dia sempre tangerina** (feito, peça 3) | .v3-ld .agora .p usa --tanja, mesmo quando o agora é o treino. | A cor do momento atual (treino lima, refeição tangerina, noite lilás), como o protótipo. | src/v3/fotos.css:406 |

## Navegação

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| fluxo | **Não há como chegar aos Ajustes** (feito, peça 2) | CTX.abreAjustes existe em src/main.jsx, mas nenhuma tela do visual novo o chama. Conta, cópia de segurança, lembretes e "voltar ao começo" estão inalcançáveis pelo app. | Uma linha "Ajustes" no fim da folha "O que aparece" (o ícone do bloco do Hoje) e no fim do Plano. Teste de fluxo que abre Ajustes pelos dois caminhos. | src/ui/v3/telas/hoje.jsx (FolhaOQueAparece), plano.jsx |
| fluxo | **Sem a tira do treino aberto nos outros lugares** (feito, peça 2) | Saiu na Fase 5; só o Hoje leva de volta ao treino. | A tira lima acima da doca em Dias, Corpo, Semana e Plano com sessão aberta (e no Hoje quando o bloco rolou para fora). | src/ui/v3/doca.jsx, app.jsx |
| estado | **Sem aviso com "Desfazer" padronizado** (feito, peça 2 (o componente, a foto e o pular; tirar alimento e aplicar no plano entram com o Plano)) | Há frase de feito em alguns pontos (global.css), mas apagar foto, pular exercício e aplicar no plano não oferecem desfazer do mesmo jeito. | Um componente só (pílula de tinta, 6 s, "Desfazer" em lima, acima da doca) para tudo que é reversível com efeito longe da tela. | src/v3/global.css, src/ui/v3/base.jsx |

## Hoje

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| dado | **Primeira vez começa com o programa do dono** | "Comece pelo que já está aqui" oferece o programa e o plano que vêm embutidos no app. | Decisão do dono (17/11): três passos (seu treino, sua comida, o que acompanhar), cada um pulável; a pessoa nova começa vazia. O aparelho do dono não muda. Pede decidir o que o app embute para quem é novo (teste de domínio do estado inicial). | PrimeiraVez em hoje.jsx; enderecoVazio e o estado padrão em src/main.jsx |
| dado | **"Comi outra coisa" sem o tamanho** | Marca só "fora". | Decisão do dono (17/11): guardar o tamanho (parecido, bem mais, bem menos, não sei). Campo novo na marca da refeição, com fusão, cópia de segurança e a pasta dos agentes; teste de domínio e do espelho. | marcaLinhaDaComida em src/main.jsx; ferramentas/espelho/monta.ts |
| hierarquia | **A exceção da refeição dentro do bloco** (feito, peça 5, Hoje) | "Não foi assim" troca os botões do bloco por dois de contorno e uma saída (sem principal). | O bloco fica com "Comi" e "Ver"; "Não foi assim" abre a folha com as três respostas (outra coisa, não comi, não sei). Um principal por bloco, sempre. | Momento em hoje.jsx |
| espaço | **Lembrete das fotos fora do padrão de aviso** (feito, peça 5, Hoje) | Bloco próprio (.v3-lembrete) com duas saídas sublinhadas. | Caixa lilás (aviso dentro da tela) com "Abrir as fotos" pequeno cheio e "Agora não" de contorno. | hoje.jsx, src/v3/registro.css |

## Treino

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| hierarquia | **A série mostra duas réguas ao mesmo tempo** (feito, peça 4) | Carga e repetição empilhadas, cada uma com número de 64 e régua própria; a tela rola. | O par carga × repetição lado a lado (66 px), uma régua só embaixo, para o que estiver escolhido (repetição por padrão). Cabe sem rolar, com "Feito" ao alcance do polegar. | Serie em src/ui/v3/telas/treino.jsx |
| texto | **Sigla RIR na série** (feito, peça 4) | "série 1 de 2 · 6–10 reps · RIR 1–2". | "6–10 repetições, sobrando 1–2". RIR só no histórico, com legenda. | treino.jsx, .v3-serie-q |
| texto | **Botão principal longo** (feito, peça 4) | "Feita: 60 × 9" (e "Corrigir: …"). | "Feito", com o certo. O número já está no par, grande, logo acima. | treino.jsx |
| fluxo | **Links da série incompletos** (feito, peça 4) | "Mudar este exercício" e "Lista do treino". "Já fiz mais do que anotei" só aparece pela lista ou pelo aviso. | "Mudar · Já fiz mais do que anotei · Histórico" embaixo de "Feito". A lista fica no ícone do topo. | treino.jsx |
| hierarquia | **"Subir para X?" como pergunta de areia** (feito, peça 4) | Componente Pergunta, depois do aviso de dor. | Aviso de sugestão (caixa de superfície com contorno de tinta) logo abaixo das séries feitas, com o porquê e "Manter" / "Subir". | treino.jsx |
| tamanho | **Nome do exercício** (feito, peça 4) | 38 px. | 30 px (--t-acao); a dica do treinador acima, em 14. | .v3-serie-n em src/v3/fotos.css |
| tamanho | **Contagem do descanso** (feito, peça 2) | 112 px. | 120 px. | .v3-desc-t |
| hierarquia | **Descanso sem a próxima série** (feito, peça 4) | "a seguir: nome, série 2" em texto solto; sem a carga; sem "Água +1". | Cartão "a seguir" com o nome, série e a carga × repetição sugerida, e "Água +1" quando a água está ligada. | Descanso em treino.jsx |
| texto | **Descanso: recolher e começar** (feito, peça 2) | Seta para a esquerda ("Voltar") e "Pular o descanso". | Seta para baixo (recolhe, o treino continua aberto) e "Começar já". | treino.jsx |
| cor | **Segmentos da câmera em tangerina** (feito, peça 3) | .v3-cam .v3-segs i.a com --tanja. | Em curso em tinta a 45%, como em todo lugar. Tangerina é atenção. | src/v3/fotos.css:89 |
| fluxo | **Pôr em dia como folha** (feito, peça 4) | FolhaPorEmDia. | Tela (destino): é lista com marcação e carga por exercício e rola; "Fiz tudo como da última vez" no topo. | treino.jsx, FOLHAS_V3 |
| cor | **Faixa do editor com a cor trocada** (feito, peça 3) | Menos séries que o treinador em tangerina. | Mais em tangerina (atenção: passou do prescrito), menos em céu. | src/v3/fotos.css:381 |

## Plano e revisão

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| dado | **Revisão aplica treinos inteiros** | Cada treino que muda entra todo ou não entra. | Decisão do dono (17/11): mudança por mudança, com a chave em cada uma; o que ficar de fora continua como diferença sua. Pede a regra de aplicar parte de um treino (teste de domínio: aplicar 4 de 5 e conferir o programa e as diferenças). | RevisaoV3 em programa.jsx; a leitura da revisão em src/main.jsx |
| estado | **O que vence hoje não se destaca** | O prazo aparece na linha pequena de cada mudança (g.vence), mas uma que vence hoje tem o mesmo peso das outras; venceHoje não é usado na tela. | Vencendo hoje, um aviso de atenção acima da mudança ("Vence hoje, no treino B"), e as respostas como fichas ("Só aquele dia" / "Passa a valer"). | plano.jsx; src/main.jsx:10716 |

## Dias, Corpo, Fotos

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| fluxo | **Responder os dias em menta durante a tarefa** | TelaDeAcao cor="menta" do começo ao fim. | Lilás (a pergunta do dia) durante; menta só na tela final ("13 dias respondidos"). | ResponderDias em dias.jsx |
| estado | **Colar a cópia como texto** | Só restaurar por arquivo. | Folha "Colar a cópia" em Ajustes: campo de texto longo, "Conferir o texto", o resumo do que tem nela, e a confirmação de restaurar. | ajustes.jsx |

## Ajustes

| Tipo | O quê | Hoje | Correção | Onde |
|---|---|---|---|---|
| fluxo | **Apagar tudo como saída sublinhada** | "Apagar todo o histórico deste aparelho" em saída discreta. | Linha "Voltar ao começo" na seção Recomeçar, que abre a confirmação dizendo o que se perde e o que não se perde. | ajustes.jsx |
| texto | **Interruptor de visual que não existe mais** | A seção "Visual" ainda é desenhada (titulo="Visual"). | Tirar: o visual antigo saiu na Fase 5. | ajustes.jsx:61 |
