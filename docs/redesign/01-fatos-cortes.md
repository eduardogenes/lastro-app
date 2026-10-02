# 01 · Fatos — cortes

**Só para o dono e para o curador. Nunca para o time cego.**

Este arquivo registra o que o escriba (A1) reconheceu como decisão e tirou de
`01-fatos.md`, o nome que o app dá a cada coisa que lá aparece descrita pelo
mundo, os casos em que hesitou, as provas que moram em material que o time cego
não lê, e o que a releitura final pegou. Aqui o vocabulário do app é usado
livremente.

---

## 0 · Como foi feito

- **Lido:** o repositório inteiro rastreado pelo git — `src/dominio/**`,
  `src/infra/**`, `src/sw.js`, `src/main.jsx` (7.272 linhas, inteiro),
  `src/ui/**` (telas, folhas e primitivos, para conhecer o vocabulário e achar
  fatos embutidos), `src/*.css`, `src/palco.*`, `index.html`, `tests/**`
  (nomes de todos os casos e leitura dos que sustentam fatos), `package.json`,
  `vite.config.js`, `vitest.config.js`, `vercel.json`, `tsconfig.json`,
  `public/manifest.webmanifest`, `supabase/schema.sql`, `README.md`,
  `PRODUCT.md`, `DESIGN.md`, `MARCA.md`, `docs/ARQUITETURA.md`, `docs/TREINO.md`,
  `docs/ANALISE-VOLUME.md`, `docs/AULA-IMPORTACAO.md`, `docs/FICHAS-IMAGEM.md`,
  `docs/LASTRO_UX_CONTRACT.md`, `docs/ux-audit/**`, `docs/design-review/**`
  (00, 07 inteiros; 01–06 por índice e pelas seções com fato de uso),
  `docs/pegada/00-parecer-cruzado.md`, a pasta do handoff do Instrumento
  (README, PROMPT e os dados embutidos no protótipo "Plano Eduardo") e
  `Lastro_Identity_Approved_v2/` (README e guia de marca).
- **Git:** os 173 commits com o corpo inteiro das mensagens.
- **Números:** totais do plano alimentar, contagens do repertório, séries por
  músculo, compras de 7 dias, tamanhos de texto e deslocamentos de refeição
  foram **calculados executando o próprio domínio** (`vite-node` sobre
  `src/dominio/**`), não transcritos.
- **Critério:** é fato o que vem do mundo, da prescrição de terceiros, do que o
  código calcula/guarda/garante/proíbe, e de erro com evidência. É forma toda
  superfície, todo mecanismo de interação (o que acontece sozinho, quando, em
  que ordem), todo valor visual, todo movimento, toda palavra, rótulo e nome
  inventado, e todo limiar que só decide **quando mostrar** algo.

---

## 1 · Fontes à parte, indexadas pelo número do fato

### 1.1 · Prova em material proibido pelo §2 ou fora da lista permitida

| Fato | Onde está a prova | Por que veio para cá |
|---|---|---|
| **F40** | `PRODUCT.md`, tabela "Dois contextos de uso": "Ao longo do dia · Sentado, sem pressa. Marca refeição, confere o que falta comer, olha peso e veredito." | §2 (PRODUCT.md) |
| **F66** | `docs/LASTRO_UX_CONTRACT.md` §5 ("barra `fixed` no iOS flutua sobre o teclado"); `docs/ux-audit/02-research-principles.md`, "Teclado virtual" | §2 (contrato de UX, ux-audit) |
| **F205** | `src/main.jsx:4707` — `listaDeCompras(planoDeComida(), catalogoAlimentos(), prev, 0)`: dias de alta demanda passados como zero | fora da lista |
| **F250** (só a frase "JSON inválido ou arquivo que não é cópia não tocam no estado") | `tests/fluxo/dados.test.js:125-150` ("importar lixo não toca no estado"); `src/main.jsx:3444-3454` | o nome do arquivo de teste é o nome de uma aba ("DADOS") |
| **F251** | `src/main.jsx:3459-3486` — a lista branca de `importText` não inclui `aulas`, `quadro`, `comidaHist`, `ajusteHist`, `gordura` nem `protocolo`, e reduz `ajuste` a `-1`, `0` ou `1`. Lacuna de teste: `tests/fluxo/dados.test.js:51` só confere as chaves **exportadas**; `tests/fluxo/fusao.test.js:18` e `tests/fluxo/ajuste.test.js:115` restauram semeando o estado (`app({ estado })`), sem passar por `importText` | fora da lista |
| **F253** | `src/main.jsx:4176-4200` (`wipe()`) | fora da lista |

### 1.2 · Fatos cuja fonte natural tem nome com vocabulário do app

Nestes, `01-fatos.md` cita um hash de commit no lugar do arquivo. A fonte
natural está aqui.

| Fatos | Fonte natural | Termo do app no nome |
|---|---|---|
| F7, F42 (jejum, depois do banheiro), F226, F227, F228, F230, F233, F235 | `src/dominio/protocolo.ts` (UTC−3 em `dataLocal`; `MONTAGEM`; `PROTOCOLO`; `parPadrao`; `mediaDaSemana`; `proximaPose`; `CADENCIA_DIAS = 14`) — citado como `a4df1a6`, o commit que o criou | "protocolo" |
| F237, F249, F250 | `tests/fluxo/dados.test.js` — trocado por `src/infra/fotos.ts`, `121d1f0`, `5fcfdb0`, `src/dominio/migracoes.ts`, `tests/fluxo/fluxo.test.js` | "dados" (nome de aba) |
| F22, F81, F187, F188 (complemento) | `tests/dominio/fusao.test.ts` (rotação × dia da semana; precedência do dia) — citei só `src/dominio/dia.ts` | "fusão" (nome da junção treino+nutrição) |
| F189–F193 (complemento) | `tests/dominio/turno.test.ts`, `tests/fluxo/turno.test.js` — citei `src/dominio/nutricao/calculo.ts` e `4089d3b` | "turno" |
| F178 (complemento) | `tests/dominio/leitura.test.ts`, `tests/fluxo/leitura.test.js` | "leitura" |
| F9, F10, F240, F241, F242, F248 | `src/infra/nuvem.ts` — citado como `4d3a5cb` (o commit que o criou) e `7767d2b` | "nuvem" |
| F229, F231 | `src/dominio/enquadramento.ts`, `tests/dominio/enquadramento.test.ts` — citados como `3c593ee` | "enquadramento" |
| F3, F195, F207, F217, F219, F220 | `tests/fluxo/ajuste.test.js` — citado como `0baad3d`, `c03df46`, `8b7767d` (os commits que criaram cada caso) | "ajuste" |
| F198, F199, F201, F202 | `tests/dominio/diario.test.ts`, `tests/fluxo/diario.test.js` — citados como `1e850ed`, `1e5b07d` | "diário" |
| F152, F153, F157 | `tests/fluxo/ciclo.test.js` — citado como `c68cb0f`, `02077e3` | "ciclo" |

Não citei em lugar nenhum: `tests/dominio/estilo.test.ts`, `tests/dominio/spark.test.ts`,
`tests/fluxo/telas.test.js`, `tests/fluxo/telaprograma.test.js`,
`tests/fluxo/navegacao.test.js`, `tests/fluxo/avanco.test.js`,
`tests/fluxo/promocao.test.js`, `tests/fluxo/protocolo.test.js`,
`tests/fluxo/retro.test.js`, `tests/fluxo/esquecido.test.js`.

### 1.3 · Fatos provados por hash cujo conteúdo está em documento fora da lista

Informativo — o hash é fonte válida, mas o texto que prova está nestes arquivos:
F124–F128, F130, F133 (`docs/AULA-IMPORTACAO.md`, nos commits `11981e2`,
`4602039`, `f642302`); F56 (`MARCA.md`, "O que sobrou, e é caro", em `4c561ee`);
F51–F52, F59, F63 (README e casco do primeiro commit, `7cd6418`).

### 1.4 · Critério de fonte aplicado

Estrito, por decisão do coordenador (devolução D11): nenhum caminho cujo nome é
vocabulário do app aparece em `01-fatos.md`. Os que eu tinha mantido por serem
palavras comuns (`nuvem`, `enquadramento`, `ajuste`, `diario`, `ciclo`) estão
agora em §1.2, e o fato cita o hash do commit que criou o arquivo ou o caso.

---

## 2 · Os nomes que o app dá às coisas

O que está à esquerda é nome do app ou do código; à direita, como a mesma coisa
aparece em `01-fatos.md`.

| No app / no código | Em `01-fatos.md` |
|---|---|
| Lastro (nome do produto); "o app" como nome interno | "o produto", "o app" (genérico) |
| Instrumento (sistema visual), prefixo `ins-` | omitido |
| HOJE · TREINO · COMIDA · DADOS · GUIA (abas) | omitidos |
| HX (o sábado) | "a aula de sábado" |
| rotação, `rot()`, `ROT_BASE` | "sequência" |
| cadência, `S.cadencia`, botão PREVISTO, "folga" | "padrão semanal (treino ou descanso)" |
| turno (manhã/tarde/noite), `S.dia.turno` | "horário do treino no dia" |
| veredito, cartão de veredito, "a regra do plano" | "saída da regra do nutricionista" |
| procedência, `<Procedencia>` | "a origem do número" |
| selo "↑ subir carga", `shouldUp` | "indicação de subir carga" |
| mods, `S.mods`, edição do dia, "editar treino de hoje" | "mudanças só do dia" |
| oficial, "levar para o oficial", "só hoje", promoção, `promoPendente`, tela de decisão | "virar permanente ou não"; "programa permanente" |
| `progLog`, "histórico de mudanças" | "registro das mudanças de programa" |
| slot, `desde` | "posição do programa", "desde quando o exercício está nela" |
| catálogo, `CAT`, `EX_BASE`, `montaCatalogo` | "repertório de exercícios conhecidos" |
| `LEGADO`, arquivado (`arq`), `sumido`, exercício fantasma | "exercícios que saíram do programa" |
| `sub:1`, substituto, `ALT`, "indicado pelo treinador" | "substituto", "indicado pelo próprio treinador" (marcado com *) |
| dica, `cue` | "orientação de execução do treinador" |
| rótulos "pegada" / "pés", `peg`, `pegPe` | "orientação de pegada ou de posição do pé" |
| placa / anilha por lado / barra livre / halter em cada mão / um peso só / peso do corpo / assistida; chaves `pino`, `lado`, `barra`, `halter`, `halter1`, `corpo`, `assist` | "carga selecionada no pino da máquina", "anilhas de um lado, sem barra", "barra olímpica livre", "um halter em cada mão", "um único implemento", "peso corporal", "máquina assistida" |
| grandeza, `Unidade`, `u`, `q`, "medida do dia" | "unidade de medida", "quantidade" |
| passada ("2 passadas · o mesmo em todas") | "vezes", "rounds" |
| dia aberto, `aberto: 1`, "o que o box programar" | "o sábado não tem conteúdo prescrito" |
| quadro, `S.quadro`, "o que o box passou hoje" | "lousa", "transcrição da lousa" |
| modelo de aula, `S.aulas`, "salvar como modelo" | "aula guardada para reuso" |
| lista rápida; "repetir o sábado passado"; "colar uma aula"; "a quarta porta" | só a capacidade (F136); o mecanismo foi cortado |
| sessão avulsa, `livre:1`, "outro treino" | "treino fora da prescrição" |
| retroativo, `retro:1`, "lançar", "preenchendo treino passado" | "lançado em data passada" |
| feito · parcial · pulado · não feito | mantidos (palavras comuns) |
| bloco de 48, retrospectiva de bloco | "bloco de 48 sessões usado pelo código" |
| leitura da semana (inversão, abaixo da média) | "comparação cruzada da semana" |
| impacto, `impactoSeries`, `impactoOficial` | "novo total semanal contra o prescrito" |
| força estimada, sinal de força, `perfManual`, "o app decide / está subindo / não está" | "sinal de força", "definido à mão" |
| leitura de gordura, gordura visual, `S.gordura` | "avaliação visual de gordura" |
| aderência, `aderenciaDoDia`, dia interpretável, "segui o plano / saí, mas sei o que comi / saí e não sei quanto" | "adesão", "dia com consumo conhecido", os três estados descritos |
| escala, "só de hoje", controle de porção | "porção do dia" |
| alta demanda (`alta`) | mantido (termo do nutricionista) |
| ajuste, saldo, passo, `ajusteHist`, régua calórica, "plano base" | "ajuste acumulado", "passo" |
| `pv`, `planoMudou()` | "carimbo da versão do plano" |
| `comidaHist`, diário alimentar, dia fechado | "dias passados de comida" |
| compras: comprado, removidas, extras, horizonte | descritos por extenso (F203) |
| protocolo de fotos, montagem, poses, `MONTAGEM`, `PROTOCOLO` | "rotina de fotos do corpo", "preparo", "poses" |
| fantasma, sobreposta, `vizinhaComAPose`, par padrão, sobrepor/opacidade | omitidos; só o fato de que comparar contra a anterior engana (F230) |
| enquadramento ajustado, `FotoAjustada`, identidade, "ajustar" | "ajuste posterior de uma foto" |
| foto do aparelho, miniatura, "foto"/"aparelho" | "foto do equipamento" |
| câmera interna / câmera do sistema | "câmera ao vivo do navegador" / "câmera nativa" |
| nuvem, sincronizar, lápide, `funde`, documentos × coleções | "cópia remota", "combinação", "marca de apagado" |
| backup, exportar, importar, "apagar todo o histórico" | "cópia de segurança", "restaurar", "apagar todo o histórico" (descrição mantida) |
| bancada, palco | omitidos |
| faixa da sessão, atalho, pergunta de treino esquecido | omitidos |
| cronômetro de descanso, `#timer`, "vai" | omitido como objeto; só "descanso" |
| modo deload | "deload no código" |
| aproximação | mantido (termo do treinador) |
| "acompanhamento" (antiga aba); "fotos de acompanhamento" | "fotos de progresso do corpo" |
| "faixa de repetições", "faixa-alvo", faixas de prioridade | "intervalo de repetições", "intervalo-alvo", "níveis" |
| "regra 1" … "regra 5" e os títulos das 14 regras | omitidos; conteúdo parafraseado (F94–F104) |
| `tag` dos treinos ("os três alvos com você inteiro") | omitido (ver fronteira B3) |
| letras A–E | mantidas (o texto do treinador as usa) |
| `marcos()` | omitido (código morto, ver §5) |

---

## 3 · Decisões reconhecidas e removidas

Numeradas para contagem. A fonte principal está entre parênteses.

### 3.1 · Identidade e marca

- **C1** — O nome Lastro, e a regra de que ele só aparece onde é endereço (chave, cache, backup, ícone); dentro, o produto se chama "o app" (`MARCA.md`, `PRODUCT.md`).
- **C2** — A acepção náutica primeiro e a financeira em segundo, nunca na mesma frase (`MARCA.md`).
- **C3** — O símbolo das raízes, lima `#D9FF16` sobre `#0E1112`, ícone mascarável recuado 18% (`MARCA.md`, `Lastro_Identity_Approved_v2/`).
- **C4** — O wordmark em Space Grotesk 700, caixa de frase (`MARCA.md`).
- **C5** — O que a marca decidiu não fazer: manifesto, tagline, tela "sobre", splash, lockup, nome em tela, versão na interface (`MARCA.md`).
- **C6** — A frase de descrição "Registro de treino e comida que freia a carga no ritmo que o tendão aguenta" (manifesto, `package.json`, `index.html`): usada só como fonte do fato do tendão, não como frase.
- **C7** — A bancada: no computador, o app dentro de um iPhone simulado (`src/palco.*`, `DESIGN.md`).
- **C8** — A fronteira Lastro × Instrumento e o voto vencido de absorver (`MARCA.md`).

### 3.2 · Sistema visual

- **C9** — Tema escuro, justificado pelo uso às 6h15 no subsolo e à noite (`DESIGN.md`).
- **C10** — Os seis inegociáveis: raio zero; número em mono e prosa em display; fio, não cartão; um acento que significa; rótulo mono em caixa alta é estrutura; quase nenhum movimento (`DESIGN.md`).
- **C11** — A paleta: `#0C0E0C`, cinco níveis de texto, quatro linhas, ácido `#CBF35E`, âmbar `#FFC46B`, coral `#FF8A6B` (`src/tokens.css`).
- **C12** — Ácido nunca pinta comparação favorável; âmbar para atenção; coral só destrutivo (H-02, `3f0c4d3`).
- **C13** — Tipografia Space Grotesk + IBM Plex Mono e a escala de 15 papéis; pisos de 9/13/15/16 px (`DESIGN.md`).
- **C14** — Escala de espaço base 4, goteira 20 px, 2 px como costura óptica, exceções 3/5/9/17 (`DESIGN.md`, H-03).
- **C15** — Alvos: 46 px para controle repetido, 40 para campo, 28 de desenho com área de 44, stepper 38/46 (H-04, H-05).
- **C16** — Raio de 10 px na miniatura do aparelho (`DESIGN.md`).
- **C17** — Os componentes: cartão-foco, linha de timeline, grade de fios, veredito, folha de baixo, sparkline de 14 fatias, ticks, tab bar com indicador (`DESIGN.md`, handoff).
- **C18** — Estado vazio sem ilustração; ausência de foto como superfície com ponto (`DESIGN.md`).
- **C19** — Nível 5 de texto (3,22:1) só para o redundante (`2e3ef75`, `2dfa938`).
- **C20** — Emoji só nos marcadores de período do calendário (☀️ 🌤️ 🌙), decisão do dono (`src/dominio/formato.ts`, `312df90`).
- **C21** — O estilo das ilustrações de exercício (traço, cores, 1024×1024) em `docs/FICHAS-IMAGEM.md`.
- **C22** — Lista fechada do que leva caixa com borda: veredito, formulário, resumo (H-06).

### 3.3 · Movimento

- **C23** — Quatro movimentos (pulso 2,4 s; indicador de aba 220 ms; barra do descanso 250 ms linear; rolagem suave até alvo fora de vista), todos desligados por `prefers-reduced-motion`; folha que sobe recusada (H-01); barra em degraus sob `reduce` (H-09) (`DESIGN.md`).

### 3.4 · Estrutura e navegação

- **C24** — Cinco abas fixas; a tab bar é navegação, nunca ação (`docs/LASTRO_UX_CONTRACT.md`).
- **C25** — Três camadas e só três (aba, destino de tela cheia, folha); folhas em três níveis (50 · 70 · 80); a quarta folha proibida (`LASTRO_UX_CONTRACT.md`, `ce46d2c`).
- **C26** — Voltar desfaz uma camada; na raiz sai do app; posição de leitura restaurada por destino; trocar de mês e paginar pose não rolam (`a00aaf1`, `d180718`, `1f53ec3`).
- **C27** — Três formas de cabeçalho; relógio da sessão sticky abaixo da barra de status (`a6301a7`, `2105a2e`).
- **C28** — Tab bar some com campo em foco e em tela cheia; fica visível durante o treino (`LASTRO_UX_CONTRACT.md`).
- **C29** — O rodapé como pilha: tab bar → descanso → faixa da sessão → toast, cada um medindo o de baixo (`b1f4fad`, `d6bfcc2`).
- **C30** — Modos internos por chips: COMIDA (plano · alimentos · compras), DADOS (corpo · treino · comida), GUIA (prescrição · o app) (`6a877ee`, `3c4590f`).
- **C31** — Retrospectiva em DADOS·treino; deload escondido no GUIA "para frear" (`3c4590f`).
- **C32** — Abrir o app com sessão aberta cai no TREINO; sem sessão, HOJE (`a6301a7`).
- **C33** — Mais de três telas de rolagem pede justificativa; regras do treinador como linhas expansíveis (`LASTRO_UX_CONTRACT.md` §6.1).
- **C34** — Tela de programa com quatro modos (lista, treino, diferenças, histórico) (`0f71a6d`).
- **C35** — Dia com dois treinos leva à lista do mês com destaque de 2,6 s (`02077e3`).
- **C36** — Aviso de telefone deitado em HTML, pedindo para girar (`71287cb`).
- **C37** — Checklist de tela nova (larguras 320/390/430, PWA conferido pelo dono — H-07) (`LASTRO_UX_CONTRACT.md`).
- **C38** — Diálogos nativos `confirm()`/`prompt()` para destrutivo e nome (H-08).
- **C39** — HOJE com uma timeline única de refeições e treino em ordem de relógio, e o cartão-foco que responde "e agora?" no topo (`6bf5558`, `PRODUCT.md`).

### 3.5 · Interação do registro de treino

- **C40** — Não existe botão de salvar: a série entra no histórico assim que carga e repetição existem; apagar o campo desfaz (`1247528`, `PRODUCT.md`).
- **C41** — A sessão nasce sozinha na primeira série completa (ou por "iniciar", antes do aquecimento); pausar; digitar retoma a pausa (`c68cb0f`).
- **C42** — Encerramento automático: 1h30 sem série vira pergunta na faixa, 10 min de graça e fecha; batida de 30 s; virada do dia fecha; pausada só fecha na virada (antes: 4 h) (`893e2c3`).
- **C43** — Descanso dispara sozinho ao completar **qualquer** série; bi-set encadeia; ±15 s; linha de procedência "descanso · série 2 · …"; bipe duplo 880 Hz + vibração; só toca com a tela à vista (`a00aaf1`, `aa01548`).
- **C44** — Tocar no valor da série anterior registra a série inteira (`a00aaf1`).
- **C45** — Ao completar o último set, o próximo exercício pendente abre sozinho, "pronto, não iniciado" (`d6bfcc2`).
- **C46** — RIR por escala inline de 0 a 4, em dois toques; tocar de novo limpa (`be11dcb`).
- **C47** — Nota e dor atrás de link; aproximação oferecida só no primeiro exercício e nunca em movimento com unidade (`1b24a7a`).
- **C48** — Tipo de carga corrigido por link; total em anilhas ao vivo durante a digitação (`62c77da`).
- **C49** — A medida do dia por link (chips de unidade + campo) (`1b24a7a`).
- **C50** — Editar o treino só no dia da sessão aberta ou no próximo da rotação; outro dia é edição de programa (`8b300ad`).
- **C51** — A decisão de fim: uma linha por mudança, controle segmentado "só hoje / levar para o oficial", padrão "só hoje", motivos "máquina ocupada · outra academia · decisão de programa"; a pergunta guardada para a próxima abertura quando a sessão fecha sozinha, nunca durante uma sessão aberta; sair sem responder mantém o conservador (`8b300ad`, `8ce5d11`, `681f09f`).
- **C52** — Confirmação ao finalizar com pendência; oferta de descartar sessão sem séries (`c68cb0f`).
- **C53** — Confirmação ao trocar exercício com menos de 6 semanas no programa (`0f71a6d`).
- **C54** — Lista de troca em camadas (indicados do treinador, depois mesmo grupo), com "última vez: 60 × 8" e miniatura de 56 px (`436a4db`, `7788df4`).
- **C55** — Renomear exercício na tela de histórico dele (`a4df570`).
- **C56** — Histórico do exercício com as últimas 6 sessões, gráfico SVG de duas faixas, eixo invertido no ritmo, correção de sessão passada (`c085e54`, `23f3544`).
- **C57** — Avisos "volta de pausa" (14 dias) e "fim de bloco chegando" (faltando ≤ 6 sessões) no treino (`src/main.jsx` `CTX.treino`).
- **C58** — A faixa da sessão em todas as abas, com o nome do exercício de destino (`d6bfcc2`).
- **C59** — Correção de duração em degraus 30/45/60/75/90 min; lançamento retroativo com 30/45/60/75 (`ad278dc`).
- **C60** — Marca de descanso com "–" e convite "+" na tira da semana e no calendário (`51fd848`).
- **C61** — Calendário do mês com a letra mandando na célula, marcador de período e barra de cardio (`0ad1f13`).
- **C62** — Média móvel de treinos por semana em vez de sequência; horário típico do mês com o mais cedo e o mais tarde (`5373381`).
- **C63** — Cardio: registro rápido com chips 20/25/30/40 min e leve/moderado; placar "n de 2"; aviso de dia de perna que sinaliza sem bloquear (`5195d09`, `063ecad`).
- **C64** — Sábado: as portas (repetir o sábado passado, modelos, colar aula) e a lista rápida "o mesmo em todas"; busca ordenada pelos frequentes só no sábado; a linha mostra a medida no lugar de "sem grupo" (`00e7fa3`, `2d99365`, `4ae469b`, `a141811`).
- **C65** — Salvar modelo pelo `prompt` do sistema; mesmo nome atualiza (`00e7fa3`).
- **C66** — A tela de treino com contador "séries feitas/prescritas" no topo; no sábado, "movimentos" e traço antes da aula (`a72e31d`).

### 3.6 · Comida

- **C67** — Folha de refeição com porção "só de hoje" e o padrão "feita em X dos últimos Y dias com registro", exibido a partir de 5 dias (`1e5b07d`).
- **C68** — Seletor de dia: cadência de hoje, alta demanda, turno com o pós-treino mostrado de antemão, como o dia foi (`1743482`, `c03df46`).
- **C69** — Editores em folhas; "não existe modo de edição", `···` no container, destrutivo um nível para dentro em coral; cadastrar alimento toma o lugar da busca (`9914199`, `ce46d2c`).
- **C70** — Água em 14 ticks, "1,75 / 3,5 l"; tocar na última cheia remove (`d325c99`).
- **C71** — Compras com horizonte em chips, procedência "cru · 3,4 kg prontos", quantidade ≥ 1000 virando kg/l (`src/dominio/nutricao/calculo.ts` `fmtKg`).
- **C72** — Padrões de comida: piso de 14 dias, janela de 90 dias, contagem e nunca percentual, nenhuma cor avaliativa, curvas de adesão e peso lado a lado sem coeficiente, auditoria escrita como "menos da metade das refeições" (limiar 55%) (`1e5b07d`, `src/main.jsx` `dadosDeComida`).
- **C73** — Dois totais do plano no fim da lista (`7f94b40`).
- **C74** — Selo de pós-treino e a procedência "Almoço foi para as 13:45, depois do treino" (`1743482`, `4089d3b`).

### 3.7 · Corpo e regra

- **C75** — Cartão de veredito com ação "aplicar ±150 kcal" só em "mais"/"menos"; linha de estado "plano base · arroz 250 g" (`087af2c`, `0baad3d`).
- **C76** — Stepper de peso (passo 0,1) e de cintura (passo 0,5); partida em 75 kg / 85 cm sem medida (`dadd3e4`, `src/main.jsx:3240`).
- **C77** — Data da medida atrás de link, seletor nativo, volta para hoje depois de gravar, linha "neste dia: … · registrar substitui" (`e443697`, `ccc6299`).
- **C78** — Sparkline de 14 semanas ancorada no intervalo com piso de amplitude (`cc8963f`).
- **C79** — As últimas 4 medidas à vista para corrigir; confirmação ao apagar (`d81793f`).
- **C80** — Cor do ritmo de peso: ácido entre 0,15 e 0,40, âmbar fora (`src/main.jsx:5131`).
- **C81** — Override de força em três opções e o texto "coletando · faltam 4 semanas de carga em 3 exercícios" (`087af2c`, `src/dominio/forca.ts` `textoDaTendencia`).
- **C82** — Painel de músculos em barras de fio por hierarquia, rótulo sem o prefixo "prioridade", média de 4 semanas, âmbar abaixo de −25% (`dadd3e4`, `src/main.jsx` `CTX.musculos`).
- **C83** — Aviso de treino avulso fora da contagem de séries (`00c22a6`).

### 3.8 · Fotos

- **C84** — Montagem antes da primeira foto do dia, e só então (`a4df1a6`).
- **C85** — Câmera interna como caminho principal e a do sistema como alternativa; fantasma ligado a 45%; temporizador padrão de 10 s com bipe por segundo e agudo no último; grade; a sessão continua dentro da câmera (`a46f429`).
- **C86** — Comparação: par padrão mais nova × mais antiga; sobreposição com opacidade 50; a pergunta da gordura dentro da comparação; nota da sessão e médias da semana ao lado (`a4df1a6`, `8b7767d`).
- **C87** — Ajuste com fantasma já ligado, seletor da data sobreposta e grade; sair descarta sem confirmar (`3c593ee`, `5b921a5`).
- **C88** — Resumo de fotos em DADOS entre cintura e força; dias desde a última em âmbar acima de 14 (`a0be7a2`).
- **C89** — Foto do aparelho atrás de botão ("foto"/"aparelho"); miniatura de 44 px na calha, ponto quando vazia; tocar na miniatura não abre o exercício (`d7ef72c`, `508cbc6`).
- **C90** — As mensagens de falha de foto e "tentar de novo" só quando a nuvem falhou (`fb15668`).

### 3.9 · A área de dados do app

- **C91** — GUIA·o app: cadência, deload, sincronizar antes do backup, backup, restaurar, onde ficam os dados, apagar tudo por último (`src/ui/telas/guia.jsx`).
- **C92** — Cobrança de backup a cada 30 dias; abrir o JSON conta como backup (`b84c1f1`).
- **C93** — Nome do arquivo `lastro-AAAA-MM-DD.json` e envelope `{ app: 'lastro', v: 1 }` (`MARCA.md`, `src/main.jsx`).
- **C94** — Parâmetros de sincronização: 4 s depois da mudança, 3 tentativas, gravação represada 700 ms (`src/main.jsx`) — retirados por estarem só em `main.jsx` e por serem afinação de mecanismo.

### 3.10 · Voz e palavras

- **C95** — Personalidade "preciso · direto · silencioso", painel de instrumento, segunda pessoa, imperativo curto (`PRODUCT.md`).
- **C96** — "Nunca comemora" — sem parabéns, streak, medalha; regra de sinal, valendo para cor e movimento (`PRODUCT.md`, `MARCA.md`).
- **C97** — A tabela de voz da `MARCA.md` (efeito visível, devolver números, fato consumado sem consolo, o freio cita a regra e de quem é, vazio diz o que falta…).
- **C98** — Todas as strings do app: toasts, títulos, rótulos, textos de confirmação, mensagens de erro da câmera e da nuvem, avisos.
- **C99** — Os títulos e textos das saídas da regra de comida ("Comer mais", "Registrar antes de mexer", "Faltam dados" e as justificativas por extenso) (`src/dominio/corpo.ts`).
- **C100** — "Descreve, nunca recomenda" como política de texto da leitura da semana, com palavras proibidas ("aumente", "reduza", "deveria") (`f13a6eb`).
- **C101** — Tudo em português, sentence case, sem emoji fora dos períodos (`README.md`, regra 5).

### 3.11 · Princípios de produto que são partido

- **C102** — "Ele não pergunta o que já sabe" / "nada derivável é digitado". Os fatos de derivabilidade ficaram (F4, F174–F178, F203); a proibição de perguntar saiu.
- **C103** — "Todo número derivado diz de onde veio" (procedência como obrigação de tela).
- **C104** — "Ele freia" como postura de interface; "o caminho de menor esforço é sempre o conservador". O fato de fundo (tendão, regras do treinador) ficou.
- **C105** — As oito leis do `PRODUCT.md`: responda "e agora?" antes de "como está?"; não existe modo de edição; destrutivo um nível para dentro; editar é permanente, ajustar é de hoje — e o rótulo diz qual; escopo por regra; restaurar documentado; persistência silenciosa; não inventar conselho (este último ficou como fato do produto em F2).
- **C106** — "Contagem, nunca percentual" e "silêncio não é falha" como regras de exibição. O fato de dado (dia sem registro é desconhecido, não zero — F198) ficou.
- **C107** — "Um usuário, sem conta e sem servidor, por decisão" (`PRODUCT.md`) — desatualizado: há sincronização opcional; ficou o fato atual (F9–F10).

### 3.12 · Limiares de exibição e de mecanismo

- **C108** — Números que só decidem quando ou como algo aparece: 1h30, 10 min, batida de 30 s, 4 h (antigo), 700 ms, 4 s, 3 tentativas, 5 dias (padrão da refeição), 14 dias (padrão de comida), 90 dias (janela), 55% (auditoria), 30 dias (backup), ≤ 6 sessões (fim de bloco), 2,6 s (destaque), ±15 s, 1–8 séries por exercício no editor, nome com ≥ 3 letras, duração corrigível de 1 a 600 min, opacidades 45 e 50, temporizador 10 s, bipes 880/660/1320 Hz, toast de 3,6 s, 6 sessões no histórico do exercício, 40 resultados de busca, 4 medidas recentes, 14 semanas nas sparklines.

---

- **C109** — As opções de horizonte das compras, 7, 14 ou 30 dias (`src/dominio/tipos.ts` `EstadoCompras.dias`, controle em `src/ui/telas/comida.jsx`). Em F203 ficou "um horizonte de N dias".
- **C110** — As opções de RIR na digitação: escala de 0 a 4 e campo que aceita de 0 a 5 (`src/main.jsx:3578-3580`, `:3908`). Em F138 ficou a faixa que a prescrição usa (0 a 4).
- **C111** — A notação com que uma série aparece ("127.5 × 12 @ 2", carga × repetições @ RIR) e a contagem de 14 caracteres que dimensionava uma coluna (`c748f57`). Em F139 ficaram os maiores valores.
- **C112** — Como a lousa transcrita entra no app: colar o JSON no painel de montar a aula, "a quarta porta" (`9d195ff`, `a141811`). Em F130 ficou só a origem.
- **C113** — "A sessão de fotos não pede número": é comportamento da interface (`a4df1a6`).
- **C114** — Textos que já foram interface e saíram dos erros de §14: "faltam" na célula da cintura (`121d1f0`), "digite um número válido" (`74ea9e1`), "9 exercícios pendentes?" (`a72e31d`), "recorde de tempo" (`23f3544`), "Carregando seu histórico…" e "undefined undefined" (`c4e01c4`), o identificador "remo-ergometro#1788963143430" exibido como "no lugar de" (`af17640`).
- **C115** — Rótulos dos estados do dia de comida ("segui o plano", "saí, mas sei o que comi", "saí e não sei quanto") e das saídas da regra ("comer mais", "comer menos") e do override de força ("está subindo", "não está") citados entre aspas em F200, F217, F223, F292 — reescritos como descrição.
- **C116** — O prefixo "Indicado pelo treinador." das frases de troca (marca de autoria exibida pelo app), retirado dos exemplos de F108.
- **C117** — Frequência e condição de medir a cintura ("1× por semana, em jejum", "meça sempre no mesmo ponto, em jejum, sem prender a barriga") — só existem como texto de interface (`src/ui/telas/dados.jsx:378`, `:391-392`); F43 foi rebaixado ao que a prova de domínio sustenta, e o resto foi para as lacunas.

- **C118** — 402 × 874 pontos como tamanho do aparelho: é o tamanho do telefone simulado no computador (a bancada, `7fc8ddd`), escolhido no projeto, e não o aparelho do dono, que é um iPhone 11 Pro Max (414 × 896 pontos, resposta do dono, P11). Saiu de F49 e das lacunas.

## 4 · Casos de fronteira

Cada um em uma linha, com o motivo. Onde ficou dentro, está dito.

- **B1** — "rotação" virou "sequência": a palavra também é do treinador, mas o app a usa como conceito e nome de controle.
- **B2** — Letras A–E mantidas (o texto do treinador as usa); a troca D↔E foi decisão do app (`c07bd27`) e "HX" é nome do app (`001b43d`) — HX cortado.
- **B3** — Nomes dos treinos ("Peito superior + dorsais + lateral + tríceps") mantidos como conteúdo da prescrição; subtítulos (`tag`: "os três alvos com você inteiro", "compacto: amanhã tem HYROX") cortados: autoria incerta e tom de voz.
- **B4** — Títulos das 14 regras de execução cortados; conteúdo parafraseado: os títulos podem ser redação do app.
- **B5** — Instruções das 9 poses e o preparo das fotos mantidos como conteúdo (F226–F228), embora a autoria não esteja atribuída a nenhum profissional: podem ser texto do app.
- **B6** — Semana de domingo a sábado mantida como regra de código (F211) porque muda as médias; a justificativa "é assim que o calendário se lê no Brasil" cortada.
- **B7** — Limites do ajuste de foto (6°, 2×) mantidos como regra de código (F231): são decisão justificada e reabrível.
- **B8** — Bloco de 48 sessões mantido como fato de código (F180), sem origem atribuída.
- **B9** — Suspensão da indicação de subir carga após 14 dias mantida (F168), sem origem atribuída ao treinador.
- **B10** — Janela de 10 a 28 dias e validade de 14 dias da avaliação visual mantidas (F220): a pergunta é do nutricionista ("duas semanas atrás"); os limites são do app.
- **B11** — Limiar de 1% e mínimo de 3 exercícios da tendência de força mantidos (F175): regra do código que alimenta a regra de comida.
- **B12** — F152 diz que a sessão pode começar "no instante da primeira série" e terminar "até a última série": revela que a sessão hoje nasce e morre sozinha; mantido porque explica o dado (duração exata × aproximada); o mecanismo saiu (C41–C42).
- **B13** — F3 e F207 ("o passo não se aplica sozinho"; "restaurar zera o ajuste") mantidos como capacidade, sem o controle.
- **B14** — F135 "aula guardada nunca guarda carga" mantido como garantia do código; é política reabrível ("prescrição, nunca resultado").
- **B15** — F259, busca sem correção de digitação, mantido como garantia do código, com a justificativa; é comportamento de interação reabrível.
- **B16** — Precisão de 0,1 kg no peso mantida (F208); o passo de 0,5 cm da cintura cortado (é o passo do controle).
- **B17** — Categorias de compra mantidas (F184); a ordem "em que a compra percorre o mercado" cortada.
- **B18** — Modalidades e intensidades de cardio mantidas (F47); opções de 20/25/30/40 min cortadas.
- **B19** — Água: meta de 3,5 l e copo de 250 ml mantidos (F194); a autoria da meta não está confirmada (o protótipo do nutricionista tinha `alvoAgua` 3,5 com faixa 2–5).
- **B20** — Os três pontos de dor mantidos (F20, F150) porque vêm da regra do treinador, descritos com as palavras do treinador ("ombro da frente", "joelho abaixo da patela"); o rótulo "ombro anterior" é do app.
- **B21** — O código diz "ganho de 200 a 400 g por semana" (`calculo.ts`) e "intervalo-alvo 0,15–0,30" (`corpo.ts`); em F14 ficou "centenas de gramas" com o intervalo do nutricionista.
- **B22** — Larguras 320/390/430 da checklist cortadas (decisão de suporte). O 402 × 874 tinha ficado como "aparelho real"; a resposta do dono (P11) mostrou que não é — ver C118.
- **B23** — "Durante o descanso o telefone está no banco e a atenção não está na tela" (`docs/design-review/05-movimento.md`) cortado: inferência de agente, sem evidência.
- **B24** — "Abrir em menos de 1 s" (`docs/ARQUITETURA.md`) cortado como número; ficou a restrição de tempo de abertura (F73).
- **B25** — O que o plano original do nutricionista tem e o app não carrega (refeições alternativas, regra "fora de casa", suplementos e rotina, preparo antecipado, base científica, perfil 72,4 kg / 1,74 m) — só no protótipo do handoff; cortado porque mudaria o que o app faz e a fonte é proibida.
- **B26** — "Digitou 400 no lugar de 40", "743 no lugar de 74,3" (`main.jsx`) cortados de §14: erros previstos, sem evidência de terem acontecido.
- **B27** — Medições da auditoria de UX e do design-review (alturas de abas, 36 sessões semeadas, sete perfis de viewport, rodapé de até 246 px) cortadas: medem a forma atual.
- **B28** — Erros reais que só se descrevem nomeando superfície ficaram fora de §14: descanso escondido sob a tab bar (`e027b4a`); toast nascendo atrás do descanso e fim de página inalcançável (`b1f4fad`); série nascendo atrás da tab bar em y=826 (`bb7e97c`); voltar rolando para fora (`7f94b40`); trocar de mês indo ao topo (`d180718`); três exclusões sem confirmação (`d81793f`); classe de prosa inexistente e campos abaixo de 16 px (`2dfa938`); `var()` órfãos (`8156d26`, `6f4dd12`); marca de recorde invisível (`3ef9bb9`); veredito duplicado e listas sem empilhar (`2e3ef75`).
- **B29** — F40 (uso sentado ao longo do dia) vem de um documento de posição (`PRODUCT.md`); mantido porque descreve o mundo.
- **B30** — Nomes de arquivo comuns que o app também usa como conceito ficaram como fonte (ver §1.4).
- **B31** — Em F109 saiu "reconhecer o aparelho pela imagem é mais rápido que ler o nome" (`7788df4`): é argumento de solução, não medida.
- **B32** — Cardio: `tests/gerar-treino.js` (e, por ele, `docs/TREINO.md`) diz "quinta, no dia de recuperação" e "nunca no mesmo período dos treinos B ou E", contra a regra no código ("quinta, depois do D"; "evite antes de B ou do HYROX"). Em F46 ficou a regra do código.
- **B33** — Os textos de cada pose e da preparação (F227–F228) e as orientações do treinador (F93) são citados literalmente porque são conteúdo da prescrição, não voz do app; as instruções de pose podem ser voz do app (ver B5).
- **B34** — F238 lista estados de uma foto do corpo; as palavras que o app usa para cada um ("buscando a foto…", "a nuvem não devolveu a foto") ficaram fora (C90).

---

## 5 · Achados para o dono

Não são forma, e alguns entraram como fato com aviso; ficam aqui com o detalhe.

1. **Restaurar backup perde dados (F251).** A lista branca de `importText` (`src/main.jsx:3459-3486`) nunca incluiu `aulas`, `quadro`, `comidaHist`, `ajusteHist`, `gordura` nem `protocolo`, e trunca `ajuste` em ±1. Os commits `8b7767d` e `a141811` e o `docs/ARQUITETURA.md` afirmam que esses campos "entram na whitelist do backup"; só entram na **exportação**. Nenhum teste passa por `importText` com eles.
2. **Atualização apaga a cópia local das fotos do corpo (F252).** `src/sw.js` poupa só `['lastro-fotos', 'treino-fotos']` na ativação, e `tests/fluxo/publicacao.test.js:76` trava essa lista; `lastro-corpo` (`src/infra/corpo.ts:22`) é apagado a cada versão publicada. Foto tirada sem conta, ou antes de subir, se perde; a referência fica no estado e a tela passa a dizer que "a foto está na nuvem".
3. **"Apagar todo o histórico" não deixa lápide (F253).** Inferência não testada: com dois aparelhos, a fusão seguinte no outro aparelho devolve tudo; com um só, o estado vazio sobe por cima sem fusão (`src/main.jsx:4176-4200` e `sincroniza`, `:981-1036`).
4. **A indicação de subir carga ignora o RIR planejado (F169)** — `shouldUp` em `src/dominio/progressao.ts`, contra a regra 2 do treinador.
5. **`restauraPlano` carimba a versão do plano antes do `confirm`** (`src/main.jsx:5079-5081`): cancelar ainda marca o plano como mudado; e zerar o ajuste não entra em `ajusteHist`.
6. **Chave de controle da sincronização ainda `treino-sync-v1`** (`src/main.jsx:932`), fora da renomeação.
7. **Cor do ritmo de peso usa 0,15–0,40 como "dentro"** (`src/main.jsx:5131`); a regra usa 0,15–0,30.
8. **`tests/gerar-treino.js` tem o texto de cardio desatualizado** (B32), e por isso `docs/TREINO.md` também.
9. **`marcos()`** (`src/main.jsx:1379-1393`): "Sessão número N" a cada 25 e "N semanas seguidas com 4 ou mais treinos" — código morto, e comemoração por construção.
10. **Documentos desatualizados:** `PRODUCT.md` diz "sem conta, servidor nem sincronização"; `README.md` diz 449 testes (há cerca de 885); `docs/ARQUITETURA.md` ainda descreve o encerramento por 4 h de inatividade.

---

## 6 · O que a releitura pegou

Passada separada, depois de escrito, caçando vazamento palavra a palavra
(lista de termos de superfície, de nomes do app e de verbos de exibição) e
conferindo cada número contra a fonte citada. Corrigido em `01-fatos.md`:

1. "tela apagada", "tela acesa", "prints de tela" (tela como superfície) → "aparelho bloqueado", "display aceso", "imagens capturadas do display". "Tela de Início" ficou: é o nome do sistema.
2. "menu de copiar" → "oferece copiar"; "botão" do Android → "tecla".
3. "faixa-alvo", "faixas" de prioridade e da revisão de setembro → "intervalo-alvo", "níveis" (faixa é nome de superfície do app).
4. "fotos de acompanhamento" → "fotos de progresso do corpo" (acompanhamento foi nome de aba).
5. "quadro de vídeo", "quadro 3:4" → "frame", "imagem 3:4" (quadro é o nome do app para a lousa).
6. "leitura da aula", "leitura cruzada da semana" → "interpretação", "comparação cruzada" (leitura é termo do app).
7. "dia interpretável" (nome de função) → "dia com consumo conhecido".
8. "sessão fantasma" (fantasma é termo do app) → "sessão inexistente"; "rascunho" → "registro de digitação".
9. "sem biblioteca do serviço" (biblioteca é o nome do app para alimentos) → "sem SDK".
10. F179 copiava a string do app ("· o treinador prescreveu 12") → reescrito sem a string.
11. F215 reproduzia a frase-modelo da justificativa da regra (voz) → "os números que a produziram".
12. F187 "(que é palpite e se identifica como tal)" dizia como a interface se comporta → cortado.
13. F233 "ao lado de cada sessão de fotos" (posição) → "associados a cada sessão".
14. F267, F273, F285 falavam em "campos", "no topo", "campo de carga" → reescritos sem superfície.
15. F280–F281 descreviam o mecanismo atual de decisão ("sem pergunta", "pergunta a cada movimento") → reescritos.
16. F109 tinha frase-argumento sobre reconhecer aparelho por imagem → cortada (B31).
17. F159 listava as três opções de motivo da interface → cortadas (C51); o fato do mundo continua em F26–F27.
18. Fontes: `tests/fluxo/dados.test.js` (nome de aba) trocado em F237 e F249, e a parte de F250 que dependia dele veio para §1.1.
19. Precisão contra a fonte: F13 (70,0, não 71,0); F14 (o código diz duas coisas — B21); F230 ("e horário" não estava na fonte citada); F243 (4 s e 3 tentativas só existem em `main.jsx` → "alguns segundos", tentativas sem número); F262 ("mudou quatro vezes" → "quatro versões", que é o que as datas mostram); F266 (generalização indevida → o pedido exato de 10/08); F294 (700 ms só em material fora da lista → retirado); F42 ganhou `tests/gerar-treino.js` como fonte da frequência.
20. F138 tinha "fonte à parte" quebrado em duas linhas → unido, para a conferência mecânica achar.

### Devolução do coordenador

A conferência contra o §3 devolveu o arquivo com quinze itens. O que foi feito:

- **D1 · F139** — saíram a notação "127.5 × 12 @ 2" e a contagem de caracteres; ficaram os maiores valores reais (carga 127,5 kg; repetições até 20 no maior intervalo prescrito e até 150 numa estação de aula; RIR de um dígito; segundos na casa das centenas), com fontes `c748f57`, `src/dominio/programa.ts`, `11981e2`. Notação para C111.
- **D2 · F200, F292** — estados do dia de comida descritos sem aspas, como em F195. Rótulos para C115.
- **D3 · F274, F275, F281, F284** — saíram "faltam", "digite um número válido", "9 exercícios pendentes" e "recorde de tempo"; ficaram os defeitos. Fiz o mesmo, sem ser pedido, em F282 (o identificador "remo-ergometro#…" era texto exibido). Textos para C114. Mantive em F274 os exemplos de acento corrompido ("tríceps" → "trÃ­ceps", "6–10" → "6â10"): são dado (nome de músculo e intervalo de repetições), não texto de interface.
- **D4 · F233** — saiu "a sessão de fotos não pede número"; ficou a origem (média da semana, das pesagens e medidas). Para C113.
- **D5 · F273** — descrito o estado (o carregamento nunca terminava; restos de valores indefinidos), sem a mensagem.
- **D6 · F150** — "ombro anterior" → "ombro da frente" e "tendão patelar", como em F20; B20 atualizado.
- **D7 · F218** — "o plano base" → "o plano do nutricionista".
- **D8 · F152, F158, F270** — "lançar" → "registrar depois do dia", "registrados em data passada", "registrado em data passada".
- **D9 · F203, F138** — F203: "num horizonte de N dias à frente"; as opções 7/14/30 foram para C109 (não há fato de mundo sobre de quantos em quantos dias ele compra — entrou nas lacunas). F138: ficou a faixa que a prescrição usa, de 0 a 4 (alvos de 0 a 2 e RIR 3 a 4 no deload, com `src/dominio/programa.ts`), e a conversão das faixas antigas (`src/dominio/migracoes.ts`); as opções do controle e o limite de digitação 0–5 foram para C110. F138 deixou de ser "fonte à parte" e saiu de §1.1.
- **D10 · F108** — exemplos trocados por quatro frases só do que muda; o prefixo "Indicado pelo treinador." para C116.
- **D11 · Fontes** — critério estrito aplicado: `src/infra/nuvem.ts` (F9, F10, F240, F241, F242, F248), `src/dominio/enquadramento.ts` e seu teste (F229, F231), `tests/fluxo/ajuste.test.js` (F3, F195, F207, F217, F219, F220), `tests/dominio/diario.test.ts` (F198, F199, F201, F202) e `tests/fluxo/ciclo.test.js` (F152, F153, F157) saíram de `01-fatos.md` e entraram em §1.2; no fatos ficaram os hashes `4d3a5cb`, `7767d2b`, `3c593ee`, `0baad3d`, `c03df46`, `8b7767d`, `1e850ed`, `1e5b07d`, `c68cb0f`, `02077e3`.
- **D12 · F130** — ficou só a origem (lousa fotografada, transcrita por IA fora do app, em JSON); o "colado no app" e a fonte `9d195ff` saíram. Para C112.
- **D13 · B28** — as quatro conversões cabem sem forma e entraram como **F301** (capacidades e informações que sumiram em reescritas da interface, pegas pelos testes de fluxo), sem nomear superfície e sem dizer onde estavam. Saíram de B28. O fatos tem agora 301 fatos.
- **D14 · F43** — não há fonte de prescrição para a frequência e a condição de medir a cintura. F43 foi rebaixado ao que o domínio prova: fita métrica, que erra de posicionamento mais que a balança varia de água, e o papel que a cintura teve na regra até 21/09 (limite de 1,5 cm no mês, prioridade sobre o peso), com `src/dominio/corpo.ts` e `ddec1f8`. A frequência foi para as lacunas, sem citar o texto de interface; o texto para C117. F43 saiu de §1.1.
- **D15 · Releitura dos fatos tocados** — reli F3, F4, F9, F10, F43, F108, F130, F138, F139, F150, F152, F153, F157, F158, F188, F195, F198–F203, F207, F217–F220, F223, F229, F231, F233, F240–F242, F248, F270, F273–F275, F281, F282, F284, F292, F301 e as lacunas. Pegou e corrigiu: F4 e F188 ainda punham entre aspas valores que também são rótulos ("a força está subindo"; "treino"/"descanso"); F217 citava "comer mais"/"comer menos" e F223 "está subindo"/"não está" (rótulos de interface → C115); F301 dizia "o aviso de" (aviso é tipo de superfície) → "a informação de"; a nova lacuna da cintura citava entre aspas o texto de interface → reescrita sem citação.

Recusado: nada.

### Respostas do dono

O dono respondeu às perguntas do A2 (`02-perguntas.md`, 01/10/2026, transcrição
de voz). Elas passaram a valer como fonte ("resposta do dono, Pn"), e a
introdução de `01-fatos.md` diz isso. O que mudou:

- **F49 (P11)** — o aparelho é um iPhone 11 Pro Max: display de 6,5 polegadas, 2688 × 1242 pixels, área útil de 414 × 896 pontos em retrato, densidade 3×, com entalhe no topo e indicador de início na base (especificação pública do modelo). O 402 × 874 era o telefone simulado no computador (`7fc8ddd`), decisão de projeto: foi para C118, e B22 foi corrigido. F68 perdeu a fonte `7fc8ddd` e ganhou a resposta do dono (modelo). A lacuna do modelo virou só a da versão do iOS.
- **F50 (P11)** — ele usa bastante o app pela web, num notebook, sobretudo para acompanhar; não tem iPad. A lacuna sobre o uso do notebook e do iPad saiu.
- **Aula de HYROX (P4)** — a aula é na quinta ou no sábado, sem dia fixo, em geral uma por semana, raramente nas duas. Reescritos: F21 (a semana real, mantendo que a prescrição conta a aula no sábado), F37, F46, F80, F82 (a sexta curta continua sendo raciocínio da prescrição, que conta com sábado), F83, F100, F101, F118, F119, F122, F136, F148, F254, F262, F281, F282, F283, o título da seção 6 e a lacuna do horário da aula. Ficaram com "sábado" só F21, F80, F82 e F118 (onde a prescrição o fixa ou onde a resposta o cita), a semana de cálculo de domingo a sábado (F211), o protocolo de fotos (F228) e as datas de testes (F299).
- **F1, F2 (P9)** — treinador e nutricionista são agentes de IA que o próprio dono criou, um por área; ele fala com eles quando quer e os dois não se falam. A prescrição continua vindo de fora do app. "Profissionais" saiu do arquivo. A lacuna das revisões virou "como as revisões dos agentes chegam ao registro, e se eles veem o registro".
- **F42, F43, F44 (P6)** — F42: pesagem sempre de manhã, antes de treinar, em semi-jejum (come algo leve antes do treino), com o mesmo tipo de roupa; os 3 a 4 por semana continuam como prescrição. Saiu de F42 a fonte `a4df1a6` (o protocolo de fotos diz "em jejum, antes de comer", e isso não é o que ele faz; F228 continua descrevendo o protocolo). F44: a cintura não era medida porque não havia fita; ele comprou uma e passa a medir. F43 não mudou (fatos de domínio). A lacuna da hora da pesagem e a da frequência da cintura foram reescritas com o que a resposta diz e o que ela não diz.
- **Fora do arquivo, de propósito** — o que o dono diz querer que o produto passe a fazer não entrou em `01-fatos.md`, por ser desejo e não fato de hoje: transcrição da lousa dentro do app (P4), mais agentes especialistas dentro do app (P9), novas medidas como braço e bioimpedância mensal (P6), outros usuários além dele (P3), um momento de revisão periódica (P8) e o reforço do uso da comida e das compras (P5, P10). Também não entraram as preferências de forma das respostas (P8, P11, P12) nem os números de uso do P1, que são do A2.
- **Releitura dos fatos tocados** — reli F1, F2, F21, F37, F42–F44, F46, F49, F50, F68, F80, F82, F83, F100, F101, F118, F119, F122, F136, F148, F254, F262, F281–F283 e as lacunas. Pegou: F50 dizia só "acompanha", e a resposta diz "bastante"; a lacuna sobre a frequência do notebook contradizia isso e saiu. F118 ficou com quebra de linha solta e foi recomposto. Nenhuma palavra de superfície ou de vocabulário do app entrou com as correções.

