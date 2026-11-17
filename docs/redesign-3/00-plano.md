# Redesenho, direção 3 — plano de implementação

Escrito em 16/11/2026. Os protótipos aprovados estão em
[`prototipos/`](prototipos/), com o roteiro em
[`prototipos/LEIA.md`](prototipos/LEIA.md). Este plano diz **o que** muda no
app, **em que ordem** e **qual modelo faz cada parte**.

## Os dois modelos, e por que a divisão é esta

| | Fable 5.2 | Opus 5.5 |
|---|---|---|
| Quanto tem | cota curta: já acabou uma vez no meio do trabalho | folga para o volume |
| Para que serve aqui | decisão que todo o resto herda, mexida em dado real, lógica onde um erro apaga registro, revisão final | construir tela seguindo um componente e uma especificação que já existem |

A regra que decide cada tarefa: **se errar ali custa dado do dono ou obriga a
refazer várias telas, é do Fable. Se o erro fica dentro de uma tela e aparece
olhando, é do Opus.**

Consequência prática: o Fable trabalha **antes** (fundação e especificação de
cada lote) e **depois** (revisão do lote pronto). No meio, o Opus constrói.
Assim a cota do Fable vai para o que só ele deve fazer, e não para escrever
CSS de tela.

Para o Fable gastar pouco na revisão, cada lote do Opus termina com um resumo
curto: o que mudou, onde, o que ficou de fora e qual teste cobre o quê. O
Fable revisa o diff do lote, não o app inteiro.

## Andamento

Atualizado a cada peça entregue. É por aqui que uma sessão nova retoma.

| Fase 0 | Estado |
|---|---|
| 1. Interruptor "visual novo" em Ajustes, por aparelho | **feito** (`src/infra/visual.ts`, `src/ui/app.jsx`) |
| 2. Tokens e fontes dentro do app | **feito** (`src/v3/tokens.css`, `src/v3/fontes.css`) |
| 3. Componentes base | **feito** (`src/ui/v3/`, estilos em `src/v3/componentes.css`); galeria em `/v3.html` com `npm run dev` |
| 4. Dado novo, fusão, cópia de segurança e espelho | **feito**, sem migração (ver abaixo) |
| 5. Estratégia de testes (classificar os 61 de fluxo e o `estilo.test`) | **feito**: [01-testes.md](01-testes.md); guarda do visual novo em `tests/dominio/estilo-v3.test.ts` |
| 6. Especificação de cada lote | **feito**: [03-lotes.md](03-lotes.md) |
| 7. O que a captura de fotos automatiza | **decidido**: [02-captura.md](02-captura.md); mostrar ao dono antes de fechar a Fase 1 |

### O dado novo (item 4), para quem constrói as telas

Nenhuma migração: todos os campos são opcionais e têm padrão na leitura, e
subir `PLANO_ATUAL` mudaria a regra da fusão entre aparelhos de versões
diferentes sem ganho nenhum. Os testes estão em
`tests/dominio/registro-v3.test.ts` (cada um conferido contra o defeito que
guarda) e nos casos novos de `tests/fluxo/diario.test.js` e `dados.test.js`.

| Para | Use | Onde |
|---|---|---|
| "A comida foi como o plano?" (sim, quase, não lembro) | `ctx.respondeODia(dataISO, 'sim' \| 'quase' \| 'naosei')` e `ctx.respostaDoDia(dataISO)` | grava no dia aberto ou no histórico; completa, nunca apaga marca |
| O que aparece | `ctx.moduloLigado(k)`, `ctx.ligaModulo(k, on)`, `ctx.fitaLigada(k)`, `ctx.ligaFita(k, on)` | `src/dominio/modulos.ts` |
| Medida com fita, "guardar só esta" | `Marca.n` (leituras); o formulário antigo já grava | `gravaMarca(…, leituras)` |
| Série posta em dia ("Já fiz mais do que anotei") | `Log.dp = 1` | **a gravar na Fase 3**, pelo registro da série |
| "Tudo como da última vez?" na sessão de fotos | `SessaoFoto.muda` (`luz`, `roupa`, `lugar`), por `ctx.setMudaDaSessao` | gravado ao criar a sessão (Fase 1) |
| Par de fotos mandado para os agentes | `S.paraAvaliar` (`pose` ou `todas`, `de`, `ate`, `t`), por `ctx.mandaParaOsAgentes` | fundido item a item (`chaveDePedido`); a pasta dos agentes lê em `corpo/para-avaliar.md` |
| Foto tirada fora do padrão | `Captura.fora` (`nivel`, `altura`, `distancia`, `tremida`) | gravado pela câmera do visual novo (o que não estava verde no disparo, e a tremida pelo giroscópio); nos dois visuais, a foto torta guardada assim leva `nivel` |

A pasta dos agentes (`npm run espelho`) já mostra os seis: `registrado_depois`
em `series.csv`, `respondido_pelo_dia` em `dias.csv`, `leituras` em
`medidas.csv`, e a coluna "Padrão" e a linha "Mudou em relação à sessão
anterior" em `fotos.md`.

Como o visual novo entra no app: com o interruptor ligado, a navegação vira a
doca e cada lugar usa a tela registrada em `src/ui/v3/telas.js`; enquanto um
lugar não está lá, aparece a tela antiga dele. A folha do visual novo
(`Folha`, em `src/ui/v3/base.jsx`) é só aparência: ligá-la à pilha de camadas
do app (`view.pilha`) é a primeira tarefa da Fase 1 ([03-lotes.md](03-lotes.md), "Camadas").

| Fase 1 | Estado |
|---|---|
| Camadas: destino e folha do visual novo pela pilha do Voltar | **feito** (`DESTINOS_V3`, `FOLHAS_V3` em `src/ui/v3/telas.js`; folha de confirmação `aviso`; `tests/fluxo/v3-camadas.test.js`) |
| Sessão de fotos: nova sessão (quem segura, "tudo como da última vez?", o preparo), os três passos, a câmera com as três luzes e "tirar mesmo assim", a sessão pela metade e o fim com a ressalva | **feito** (`src/ui/v3/telas/sessaofotos.jsx` e `camera.jsx`; regras em `src/dominio/captura.ts` e `ressalvaDaSessao` em `protocolo.ts`; `tests/dominio/captura-v3.test.ts`, `tests/fluxo/v3-fotos.test.js`). Conferir altura e distância a olho ficou como o caminho de reserva da detecção |
| Centro das fotos, comparar (lado a lado, cortina, sobrepor, linha das sessões com a ressalva), no tempo, galeria com o selo por sessão, foto aberta, lixeira e ajustar | **feito** (`src/ui/v3/telas/consultafotos.jsx`; dados em `ctx.comparacaoV3`, `noTempoV3`, `galeriaV3`, `centroDasFotosV3`; `tests/fluxo/v3-consulta-fotos.test.js`). A entrada do centro é o Corpo novo (Fase 2); até lá, as telas abrem pelas portas antigas |
| "Mandar para os agentes" na comparação | **feito**: `S.paraAvaliar` (fundido item a item entre aparelhos, na cópia de segurança) e o arquivo `corpo/para-avaliar.md` na pasta dos agentes, com o par, o peso e a cintura da semana e a ressalva de cada sessão |
| Alinhamento sugerido do enquadramento | **feito**: o disparo com a detecção ativa guarda a sugestão (`FotoRef.sug`); na foto aberta da galeria, "Ver como fica", "Aceitar" (vira `enq` com `auto`) e "Agora não". A pasta dos agentes diz "sugerido, ainda não aceito" ou "alinhado pelo app" |
| Mostrar ao dono as decisões da captura | **respondido** em 17/11/2026: voz de ajuste só sozinho, tremida conta como fora do padrão, alinhamento só sugerido (ele aceita), sozinho conta 5, no fim "Medir agora". **Fase 1 fechada** |
| Detecção do corpo na câmera | **feito**: luzes de altura e distância sozinhas, frase do que mexer, disparo sozinho com a pessoa parada, `Captura.det`, queda para as linhas (ver [02-captura.md](02-captura.md), "Como ficou no código") |

| Fase 2 | Estado |
|---|---|
| Corpo (lugar): peso pela régua, evolução, medidas ligadas e "Mais N medidas", bioimpedância, fotos (a entrada do centro das fotos) | **feito** (`src/ui/v3/telas/corpo.jsx`, `ctx.corpoV3`, `ctx.pesaHoje`; `tests/fluxo/v3-corpo.test.js`) |
| Medir agora, uma medida por tela | **feito**: a segunda leitura sempre pedida, a terceira quando diferem, "guardar só esta" grava `Marca.n = 1`; dobra com três leituras e a do meio (`passoDaLeitura` em `src/dominio/corpo.ts`). Toda porta que abria o formulário antigo abre este no visual novo |
| Peso (média da semana em linha, pesagens em pontos, faixa do alvo, 4 semanas ou tudo, taxas por semana, corrigir pesagem pela régua) | **feito** (`src/ui/v3/telas/corpoconsulta.jsx`, `ctx.pesoV3`, `ctx.corrigeMarca`; gráfico em `src/ui/v3/grafico.jsx`) |
| Uma medida (linha com as sessões de fotos marcadas, como medir, histórico para corrigir) e bioimpedância (quadros, leituras, a leitura nova um número por passo) | **feito** (`ctx.medidaV3`, `ctx.camposDaBioV3`, folha `bio` nova) |
| Tudo na mesma data | **feito** (`naMesmaData` em `src/dominio/corpo.ts`, com teste; camada `naMesmaData`). **Fase 2 fechada**; `tests/fluxo/v3-corpo-consulta.test.js` |

| Fase 3 | Estado |
|---|---|
| Treino em foco, uma série por tela (carga e repetição pela régua, "da última vez", dor seguida) | **feito** (`src/ui/v3/telas/treino.jsx`, `ctx.focoV3`, `ctx.fazSerieV3`; `tests/fluxo/v3-treino.test.js`). A série grava por `anotaSerie`, a mesma porta do modo antigo, e a sessão nasce na projeção da primeira série |
| Descanso em tela cheia que enche de cor, ±15 s, "sobraram quantas?" gravando o RIR da série que acabou (`poeRir`) | **feito** |
| Sugestão "subir para X?" | **feito**: `proximaCarga` em `src/dominio/progressao.ts` (1,25 kg por lado, halter +2, placa +2,5), **regra de partida a revisar com o dono** |
| Lista do treino (com deload), mudar este exercício (trocar, mais uma série, fazer o próximo antes, pular, dor), opções da sessão | **feito** (folhas `listaTreino`, `mudarEx`, `menuSessao`) |
| Pôr em dia e aviso de intervalo longo | a fazer |
| Fim com "vira regra?", progressão, um exercício, programa, editor, revisão, aula do box | a fazer |

Observação de teste: `enche`, `sobe` e `troca` (os que abrem um navegador de
verdade) às vezes falham quando a suíte inteira roda em paralelo nesta
máquina e passam sozinhos. Antes de tratar como regressão, rodar o arquivo
isolado.

## Troca de modelo (17/11/2026)

O Fable 5.2 deixou de estar disponível no plano do dono no meio da Fase 0. O
**Opus 5.5 assume também as tarefas marcadas como do Fable** neste documento.
O que a divisão protegia continua valendo, e o Opus compensa com:

- **Teste antes de dar como feito**, em domínio, para todo dado novo e toda
  regra que possa perder registro; e **conferência de mutação**: desfazer a
  correção e ver o teste ficar vermelho, para não confiar num teste que passa
  de qualquer jeito.
- **Uma peça por vez**, inteira, com a suíte completa no fim de cada uma.
- **Nas decisões de produto que eram do Fable com liberdade total** (o que a
  captura de fotos automatiza), decidir, escrever o porquê no fim do lote e
  mostrar ao dono antes de fechar a fase.
- Revisão de lote: em vez da revisão do Fable, uma passada com `/code-review`
  no diff do lote antes do commit.

## O que o código tem hoje e pesa no plano

- `src/main.jsx` tem 14,5 mil linhas: estado, regras de tela e montagem dos
  dados de cada tela. As telas (`src/ui/telas`, 24) e folhas (`src/ui/folhas`,
  9) são componentes Preact que recebem esses dados prontos. O CSS são cinco
  folhas, cerca de 5 mil linhas.
- **Testes:** 31 de domínio (regras, rápidos) e 61 de fluxo (sobem o app
  montado e apertam botão). 40 dos de fluxo procuram classe CSS ou texto da
  tela. `tests/dominio/estilo.test.ts` tem 2.857 linhas que exigem as regras
  do desenho antigo (raio, fio de 1px, uma família de fonte). Boa parte disso
  quebra de propósito com o redesenho.
- **Dado:** o estado tem migração versionada (plano 12), sincroniza entre
  aparelhos pela conta (com fusão) e é lido pelos agentes através de
  `ferramentas/espelho/monta.ts`. Mudar a forma do dado mexe nos três.
- **Câmera:** o app mede de verdade só o **nível** do celular. Altura e
  distância são conferidas a olho, pelas linhas. O protótipo simulou as três
  como detectadas. O dono garante que **sempre vai ter rede** na hora das
  fotos, então a câmera pode depender de rede se isso ajudar.
- **Publicação:** push no `main` vai direto para produção.

## O que é tela nova e o que é dado novo

Só tela (o dado já existe ou não muda): o bloco do momento, a régua, o treino
uma série por tela, comparar e "no tempo", tudo na mesma data, progressão
(a regra `shouldUp` já existe), editor de programa, revisão do treinador,
comida e compras, ajustes, estados vazios.

Dado novo ou mudado (exige migração, fusão e espelho):

1. **Resposta da comida por dia** ("foi como o plano?" sim, quase, não lembro)
   como registro principal. Hoje já existem a marca por refeição e um "como
   foi o dia" (`segui o plano`, `saí, mas sei o que comi`); é preciso decidir
   como os dois convivem e como a regra dos 11 de 14 dias passa a contar.
2. **Série "registrada depois"** (o "pôr em dia" do treino). Fica marcada no
   histórico, mas **conta normalmente** para a sugestão de subir carga
   (decisão do dono).
3. **Sessão de fotos com ressalva:** o que mudou (luz, roupa, lugar) e "fora do
   padrão" (tirada sem acertar).
4. **Medida "uma leitura só".**
5. **Módulos ligados e desligados** (água, peso, cardio, medidas extras,
   lembretes).
6. **"Vira regra?" no fim do treino.** Já existe algo parecido nas mudanças
   que esperam decisão; é preciso ligar a pergunta nova a isso, e não criar
   um segundo caminho.

## Fases

Cada fase termina com uma verificação só (tipos, build, a suíte) e um commit
por peça inteira, direto no `main`. Push só quando o dono pedir.

### Fase 0 — Fundação · **Fable**

Nada de tela começa antes disto: tudo depende daqui.

1. **Convivência do visual novo com o antigo.** Um interruptor por aparelho
   (em Ajustes) liga o visual novo, para o `main` poder ir para produção sem
   que uma tela pela metade apareça no uso real. No fim do projeto ele some.
   *(decidido pelo dono)*
2. **Tokens e fontes.** As cores, a escala de tipo e os raios da direção 3
   viram o novo `tokens`. As duas fontes (Bricolage Grotesque e Instrument
   Sans) ficam **dentro do app**, guardadas para funcionar sem rede, e não
   carregadas do Google.
3. **Componentes base**, com a interface que o Opus vai usar: o bloco do
   momento, a régua, a folha de baixo, os botões (principal, contorno, link),
   a lista com seta, o liga e desliga, a barra de progresso em segmentos, a
   doca de navegação e o cabeçalho fino. Cada um com estados de toque, foco e
   desabilitado, e com "reduzir movimento".
4. **O dado novo.** Forma dos seis itens acima, a migração para o plano 13, a
   fusão na sincronia e o espelho dos agentes. Testes de domínio para cada um,
   incluindo a migração a partir das fixtures guardadas.
5. **Estratégia de testes.** Classificar os 61 testes de fluxo e o
   `estilo.test`: o que continua valendo (regra de dado, de gravação, de
   navegação), o que se reescreve junto com a tela nova e o que sai porque
   cobrava o desenho antigo. Resultado: uma lista que o Opus segue tela a tela.
6. **Especificação curta de cada lote**, a partir dos protótipos: quais
   componentes, quais dados do `main.jsx` cada tela usa e quais testes
   reescrever. É o que permite ao Opus trabalhar sem reabrir decisões.
7. **O que a captura de fotos automatiza** (ver Fase 1).

### Fase 1 — Fotos (a prioridade do dono)

- **Fable, com liberdade total:** o núcleo da câmera e **todas as decisões de
  facilidade e automação da captura**. O dono quer que seja impecável e deixou
  a escolha com o Fable: o que o app detecta sozinho (altura, distância, pose,
  quando disparar), o que fica para quem fotografa conferir e o quanto o app
  guia cada um dos três cenários (a pessoa de sempre, alguém novo, sozinho).
  Pode usar rede. Os limites que continuam: a padronização vem primeiro,
  "tirar mesmo assim" existe e marca a sessão como fora do padrão, nenhuma
  das 11 poses sai do protocolo sem perguntar ao dono, e o resultado precisa
  funcionar no iPhone 11 Pro Max. O Fable registra no fim do lote o que
  decidiu e por quê.
- **Opus:** o resto do lote sobre o núcleo pronto. Centro das fotos, "quem vai
  fotografar" e "tudo como da última vez", a tela para quem nunca fez, o fim da
  sessão, comparar (lado a lado, cortina, sobrepor), "no tempo", galeria, foto
  aberta, ajustar enquadramento, lixeira, mandar para os agentes. Reescreve os
  testes de fotos e protocolo conforme a lista da Fase 0.
- **Fable:** revisão do lote.

### Fase 2 — Corpo e evolução · **Opus**, revisão do Fable

Corpo com a régua do peso, peso e taxa por semana, uma medida, medir agora
(uma por tela, segunda leitura sempre pedida), bioimpedância, tudo na mesma
data, ligar e desligar medidas. Todo o dado já está pronto da Fase 0.

### Fase 3 — Treino

- **Fable:** o registro da série no modo novo. Uma série por tela, o descanso
  em tela cheia, "pôr em dia" (no meio e depois) e o aviso de intervalo
  longo. É onde o app já perdeu série no passado: a fronteira entre rascunho,
  tela e histórico. Também é do Fable a regra de quando sugerir subir carga;
  a série registrada depois conta como as outras.
- **Opus:** as telas em volta do registro. A sugestão "subir para X?" na série,
  "mudar este exercício" (trocar, pular, mais uma série, deixar para o fim,
  dor), a lista do treino com deload, o fim com "vira regra?", a tela de
  progressão, a tela de um exercício, o programa, o editor do treino e a
  revisão do treinador.
- **Fable:** revisão do lote.

### Fase 4 — Hoje e o restante · **Opus**, revisão do Fable

Hoje (o bloco do momento, a linha do dia, "se quiser", o ritmo, o botão "+"),
Dias e "responder os dias", Semana, Comida, alimentos, compras, Ajustes,
primeira vez e os estados (vazio, sem rede, falha ao guardar). A regra de "o
que fazer agora" já existe em `dominio/agora.ts` e muda pouco; o Opus ajusta
com os testes que ela já tem.

### Fase 5 — Virar a chave

- **Opus:** apagar o interruptor, as telas e o CSS antigos que nada mais usa.
  Atualizar `DESIGN.md`, `PRODUCT.md` e `docs/LASTRO_UX_CONTRACT.md` para a
  direção 3.
- **Fable:** revisão final do app inteiro com os dados reais, a 414 × 896, e
  a lista do que fica para depois.

## O que não muda de mãos

Estas regras valem para os dois modelos, em qualquer fase:

- **Não sair do que foi decidido.** Quem constrói segue o protótipo e a
  especificação. Se algo não fecha, para e pergunta ao dono; não inventa
  outra solução no meio.
- **Nunca tirar pose, medida ou passo do protocolo sem perguntar.**
- **Dado real é intocável fora da migração.** Nenhuma tela grava dado em
  forma nova antes de a Fase 0 ter a migração pronta e testada.
- **Commits** em português, com prefixo e escopo, sem linha de coautoria.
  Um por peça inteira, no `main`, sem criar branch. Push só a pedido.
- **Testar no fim** de cada fase, uma vez, e não a cada ajuste.

## O que o dono decidiu (16/11)

1. **Convivência:** interruptor em Ajustes, por aparelho.
2. **Câmera:** sempre vai ter rede. O que automatizar e como facilitar a
   captura fica com o Fable, com liberdade total (Fase 1).
3. **Nomes das abas:** Hoje e Plano.
4. **Série registrada depois:** conta igual para a sugestão de subir carga.
