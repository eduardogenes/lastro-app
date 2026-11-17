# 08 · A rede

O inventário do que os testes de fluxo protegem.

Este documento existe por um motivo estreito. O app vai ser reconstruído com
uma interface nova. Os **372 testes de domínio** (`tests/dominio/`) sobrevivem
inteiros — importam módulo e testam regra, conta e migração, sem app montado.
Os testes de fluxo (`tests/fluxo/`) quebram todos, porque entram no app pela
interface que vai mudar. O dono decidiu reescrevê-los em bloco. A rede é a
lista do que cada grupo protege, para a reescrita ter contra o que conferir no
fim.

Quatro reescritas anteriores deste app perderam capacidade sem ninguém notar, e
foram esses testes que as pegaram. Se um teste some na reescrita e ninguém
sabia o que ele protegia, a capacidade some junto, em silêncio. Esta lista é o
que impede isso.

**Nada aqui é estimativa de prazo ou de esforço em horas.** Ninguém mediu isso,
e um número inventado aqui viraria promessa. Onde não há medida, está escrito
"não medido".

---

## O número de casos: 514, não 513

> **RETIFICAÇÃO (06/10) — este número envelheceu, e a conta que o produziu
> continua certa.** O **514** é a medição de 05/10 e vale para o commit que esta
> seção cita. **A linha de base de hoje, medida com `npm test` em 06/10, é: 965
> passando, 53 arquivos, `tests/fluxo/` 520 e `tests/dominio/` 445, zero
> rejeições não tratadas.** As cinco frentes e os consertos de dado entraram no
> meio. O número certo está na ONDA 5 de `00-coordenacao.md`; a divisão
> **517/440** que circulou em briefings era errada (ela saiu da seção 4 de
> `09-rede-endurecida.md`, já corrigida em `601159e`). **Nada do método desta
> seção muda** — só o total.

O plano fala em 513 testes de fluxo. **São 514.** Como foi contado:

```
npx vitest run --project fluxo --reporter=json
→ numTotalTests 514 | passed 514 | failed 0 | 33 arquivos
```

A contagem do relatório do Vitest casa exatamente com `grep -cE "^test\("`
somado nos 33 arquivos — todos os 514 casos são `test(` em coluna 0, sem
`describe`, sem `test.each`, sem `it`.

De onde vem a diferença de um: o 513 estava certo até o commit `4577b8c`. O
commit seguinte, `6035a5c` — *"fix(dados): importar um backup perdia seis
coisas, em silêncio"* — acrescentou um caso.

```
git grep -hcE "^test\(" <commit> -- 'tests/fluxo/*.test.js'
  4577b8c → 513
  6035a5c → 514   ← o caso novo entra aqui
  01155b1 → 514
  44b3676 → 514
  a2635e7 → 514   (HEAD)
```

Os 372 de domínio conferem: `grep -cE "^\s*(test|it)\("` somado em
`tests/dominio/*.test.ts` dá 372, em 20 arquivos.

**Um achado de lado, enquanto eu media.** Os 514 passam, mas a suíte de fluxo
termina com *"Vitest caught 4 unhandled errors during the test run"* — duas
rejeições em `createElementNS` e duas em `addEventListener`, todas com stack
dentro do bundle, depois do `a.fechar()`. É trabalho assíncrono do app chegando
numa janela jsdom já fechada. Não derruba teste nenhum hoje, e o próprio Vitest
avisa que *"might cause false positive tests"*. Não investiguei a causa — não era
a tarefa — mas registro aqui porque a reescrita vai mexer exatamente no
desligamento das telas, e é melhor herdar isso sabendo.

---

## 1 · Uma linha por arquivo

Trinta e três arquivos. A coluna "casos" é a contagem do relatório JSON do
Vitest, por arquivo.

| Arquivo | Casos | O que protege |
|---|---:|---|
| `ajuste.test.js` | 14 | O ajuste calórico é um **saldo cumulativo**, não um destino: dois passos no mesmo sentido somam e a tela diz que são dois; cada passo guarda de onde veio; a ingestão nova vira a linha de base, então não existe "voltar ao plano base"; a leitura das fotos destrava um corte que o peso sozinho não autoriza; e semana sem registro de comida trava o corte mesmo com as fotos confirmando. |
| `aula.test.js` | 12 | Montar a aula de sábado sem redigitar tudo: repetir o sábado anterior traz os movimentos com a grandeza de cada um e **só a prescrição, nunca o resultado**; salvar com nome que já existe atualiza em vez de duplicar; apagar modelo deixa lápide, senão a sincronização o ressuscita; e a lista rápida registra a aula inteira sem abrir cartão. |
| `aulaimport.test.js` | 14 | Uma aula do box escrita fora do app entra colada **no DIA, nunca na biblioteca de modelos**, com o vocabulário novo cadastrado antes de o dia ser montado, a grandeza pertencendo ao movimento e não ao bloco, o mesmo movimento repetido mantendo séries históricas separadas, o quadro de rounds visível durante a aula e virando a nota da sessão ao encerrar; e JSON torto ou movimento desconhecido não mudam nada. |
| `avanco.test.js` | 10 | Ao completar o último set, **o próximo exercício abre pronto** — um toque a menos para quem está de pé, com uma mão; o avanço pula o que foi pulado de propósito, não anda com série faltando e fica onde está no último pendente; e com treino em andamento um atalho aparece nas outras abas dizendo para onde vai. |
| `cardio.test.js` | 10 | O cardio semanal, que é obrigação fácil de esquecer, tem **placar e registro na mesma tela, sem sair dela** (RETIFICADO em 05/10 pela frente 1: placar e registro estão na aba TREINO, `src/ui/telas/treino.jsx`, e não em HOJE — `hoje.jsx` não menciona cardio nenhuma vez. Os dois casos cujo nome diz "tela de hoje" rodam no padrão do harness, que é `'treino'`. Levar o cardio para o Agora é mudança, não restauração.); o calendário e a faixa da semana marcam o cardio sem competir com a letra do treino, inclusive em dia só de cardio; o aviso de perna aparece no momento em que importa; e nenhuma interface de cardio fala em caloria. |
| `carga.test.js` | 11 | O app **nunca converte o número digitado** — o total é só exibição: anilha por lado não conta a barra, dois halteres somam, um só não mostra total, barra livre é o único tipo que soma a barra, peso do corpo aceita carga vazia. A correção do tipo persiste e some ao voltar ao padrão, a chave interna antiga continua válida, e histórico de peso do corpo plota repetição em vez de carga. |
| `ciclo.test.js` | 18 | O botão de iniciar/pausar/finalizar **nunca é pré-condição para gravar série**: esquecer custa precisão de duração, nunca dado. Finalizar grava tempo exato e marcado como manual; o encerramento automático fica aproximado; pausado não morre por inatividade e digitar retoma sozinho; pular é decisão registrada e reversível; finalizar com pendência pergunta e sem série nenhuma oferece descartar; dois treinos no mesmo dia são possíveis; e o relógio anda sem re-render, congela na pausa e para fora da aba. |
| `corpo.test.js` | 25 | **O peso de um dia não decide nada** — decide a média semanal e o ritmo entre semanas; sem registro de comida a tela manda registrar em vez de cortar; cintura alta não sobrepõe peso na faixa. O registro aceita vírgula, substitui a medida do mesmo dia, recusa entrada inválida, e pode ser lançado em data bem anterior (nunca futura), com o seletor dizendo o que o dia já tem, partindo do valor dele e voltando para hoje depois de gravar — com data por medida, peso e cintura sem se misturar. |
| `cronometro.test.js` | 12 | O descanso conta **a partir de um instante-alvo, não de um contador que decrementa** — é o que o faz sobreviver ao iOS suspendendo o JavaScript com a tela apagada. Avisa uma vez só ao zerar; o AudioContext nasce dentro do gesto, como o iOS exige; a tela acesa é pedida ao começar a digitar e solta ao encerrar; o descanso padrão vem da categoria do exercício e o bi-set encadeia em vez de descansar; esticar e encurtar mexem no instante-alvo e não ficam negativos. |
| `dados.test.js` | 19 | Nenhuma mudança quebra o que já está salvo: estado do formato original carrega com padrões e **todas as telas renderizam com ele**; o backup leva todos os campos e a reimportação devolve dados idênticos, acento incluído; importar lixo não toca no estado; histórico longo não é truncado; abrir o JSON conta como backup; histórico de plano antigo é reindexado e não apagado; exercício que saiu do catálogo vira arquivado com nome e histórico; e a migração roda uma vez só. |
| `diario.test.js` | 9 | O dia de comida **fecha sozinho na virada da data** e vira linha de histórico que não se reescreve quando o plano muda; dia inteiramente mudo não vira linha; fechar duas vezes não duplica; o histórico atravessa o backup; e a fusão soma o que dois aparelhos marcaram no mesmo dia, fechado ou ainda aberto. |
| `edicao.test.js` | 27 | A regra central da edição no meio do treino: **mexer no treino de hoje não mexe no programa oficial**. A série registrada segue o exercício quando ele muda de posição; voltar ao valor original apaga o mod em vez de registrar ida e volta; a decisão vem no fim, uma a uma, com o padrão conservador; encerramento automático não promove nada; as mudanças sobrevivem a navegar entre dias e a fechar o app; o impacto no volume aparece na hora de mexer; e renomear grava só o nome sobre o mesmo id, sem mover histórico. |
| `esquecido.test.js` | 6 | Uma sessão **sem série nova por 1h30** vira pergunta na faixa — antes disso a faixa é atalho, não pergunta — e pergunta até na aba de treino; pausado não conta como esquecido, porque pausar é aviso e não ausência; "continuo treinando" zera o relógio; e "já parei" grava a duração **até a última série, não até agora**. |
| `fluxo.test.js` | 5 | O que só quebra quando as peças se encontram: uma semana de uso real com edição, promoção, cardio e corpo acontecendo junto; deload cortando pela metade **o que ele prescreveu**, não o do treinador; exercício removido do programa continuando a abrir no histórico antigo; o app não presumindo que hoje é o dia da sessão; e um backup do formato antigo reconstruindo tudo. |
| `fotos.test.js` | 20 | A foto do aparelho responde "qual das três puxadas desta academia é a que o treinador quis dizer": **os bytes vivem no cache do aparelho e só a referência entra no estado**; a tela recebe endereço de objeto sem passar pela rede e simplesmente não desenha quando os bytes não foram lidos; apagar deixa lápide e tira do bucket para o byte não ficar órfão; referência sem bytes locais busca do outro aparelho; sem rede a reconciliação para sem perder a conta; e PNG sai como WebP, reduzido em passos, com o teto no lado maior. |
| `fusao.test.js` | 24 | A fusão das duas metades do produto: comida e treino **na mesma timeline de HOJE, em ordem de relógio**, com um cartão-foco que responde "e agora?" antes de qualquer resumo; o alvo calórico calculado do plano e não escrito à parte; o dia de comida zerando na virada da data; apagar o histórico não apagando o plano nutricional; editar quantidade mudando o plano para todo dia enquanto a escala vale só hoje; remover alimento em uso saindo das refeições que o citam; e as folhas empilhando em três níveis e voltando uma a uma. |
| `horario.test.js` | 14 | O app registra o horário que aconteceu e **nunca inventa o que não mediu**: início e fim no detalhe, só o começo com sessão em andamento, hora embaixo da data na lista do mês, horário típico com o mais cedo e o mais tarde, retroativo sem horário não inventando hora, horário inválido ignorado sem quebrar, treino avulso fora da conta, e sem horário medido não há marcador de período. Também: trocar de mês não mexe na posição de leitura, e recorde não é pintado de ácido — o app não comemora por cor. |
| `leitura.test.js` | 3 | A ligação entre a leitura da semana e a tela: o painel de volume **lê as linhas em conjunto** e nomeia a inversão (ele sempre teve o dado e nunca lia junto), carrega a ressalva do treinador, e cala quando não há inversão. |
| `migracaochave.test.js` | 7 | As duas migrações de chave de storage do rename do produto, que se migram de jeitos diferentes de propósito: o histórico é **fundido com a mesma `funde()` da sincronização**, e a chave velha só é apagada depois de a nova estar gravada — inclusive quando o build antigo escreveu série depois de a chave nova já existir; apagar o histórico leva a velha junto; a sessão da nuvem é promovida quando é a única e apagada sempre; e sair apaga as duas. |
| `navegacao.test.js` | 9 | O Voltar do sistema **fecha uma camada do app em vez de sair dele** — no Android, onde Voltar é botão e é gesto, o primeiro Voltar fechava o app no meio de uma série. Uma entrada de histórico por camada aberta; folhas empilhadas fechando uma por Voltar e uma por Escape; o Voltar saindo de um destino de tela cheia; fechar pelo botão do app sem deixar entrada órfã; a posição de leitura devolvida ao voltar; e a folha entrando em foco, isolando o fundo e devolvendo o foco ao sair. |
| `programa.test.js` | 12 | **A chave do histórico é o exercício, nunca a posição dele no treino** — sem isso, editar o programa desloca o histórico. Inserir no meio não desloca o dos outros; o mesmo aparelho em duas posições da mesma sessão não se sobrescreve; o programa do treinador fica congelado e comparável; exercício cadastrado por ele aparece na troca com histórico próprio; id sem entrada no catálogo não derruba a tela; e a rotação vem do estado — o app não presume seis dias. |
| `promocao.test.js` | 9 | Uma mudança do dia **só vira mudança permanente depois de uma pergunta** — e a pergunta existe tanto para quem toca em finalizar quanto para a sessão que morre sozinha, caso em que fica guardada para a próxima abertura. Ela não interrompe treino em andamento; o padrão é conservador (não mexe no oficial); levar para o oficial fica registrado com data; sair sem responder mantém o conservador e não repete a pergunta para sempre; e a decisão é um destino que guarda e devolve a posição de leitura. |
| `protocolo.test.js` | 58 | O caminho completo do byte da foto de corpo — câmera, redução, Cache Storage, bucket, poda e volta — em torno da **única parte do app que apaga byte de foto por conta própria: a poda**, cujo erro não tem desfazer. Foto que ainda não subiu segura a poda do cache inteiro; sessão podada volta do bucket; refazer deixa lápide; o enquadramento ajustado grava recorte no estado sem tocar nos bytes e é o mesmo na captura e na comparação; a comparação abre numa pose que tem par, com a mais nova contra a mais antiga, e traz o peso da semana; e sair da tela desliga a câmera. |
| `publicacao.test.js` | 13 | O que é publicado **abre**: a versão do service worker vem do hash do build e não de um número incrementado à mão (esquecer publicava e o iPhone continuava servindo a versão antiga, sem erro e sem tela quebrada); o precache lista exatamente os assets emitidos; o index aponta só para arquivos que existem; o app resolve offline pelo index em cache; o cache velho é apagado ao ativar e o de fotos sobrevive à publicação; ícones e manifesto chegam ao dist; e o `vercel.json` só usa chaves que o schema aceita. |
| `retro.test.js` | 9 | O registro retroativo: treino do plano lançado em data passada sem detalhar, com `done` ordenado por data; **treino avulso é presença, não é o programa**, e exige grupo muscular; preencher os exercícios grava na data do treino e não na de hoje; abrir retroativo com treino em andamento encerra o de hoje; sessão retroativa esquecida encerra na virada do dia de uso; e dia vazio do calendário é atalho para lançar. |
| `ritmo.test.js` | 19 | Um movimento medido em distância **não mente na tela** — cinco tiros de 500 m contra um 500 m sozinho apareciam como `+423%` em ácido. O histórico fala em ritmo e não em soma de segundos; ficar mais lento não é pintado de verde; o eixo inverte onde menor é melhor; a retrospectiva não chama piora de evolução; o volume acumulado não conta movimento com grandeza; movimento de box fica fora do alvo por músculo e não pede RIR nem aproximação; o catálogo abre pela prioridade do dia aberto; e a busca ignora acento e ordem de palavra, no treino e na comida. |
| `serie.test.js` | 8 | A interação de maior frequência do produto, no pior contexto: **o descanso começa em qualquer série completada, não só na última**; apagar o campo rearma o disparo daquela série e só dela; tocar na coluna ANTERIOR registra a série inteira e fica inerte sem histórico; todo controle do cartão tem nome acessível; o descanso sobrevive a fechar e reabrir sem ressuscitar vencido; e sair do app descarrega a gravação represada. |
| `sessao.test.js` | 26 | **Não existe botão de salvar.** A sessão nasce na primeira série completa, grava na hora e morre sozinha por inatividade, gravando duração e avançando a rotação; série incompleta não abre sessão; apagar o campo remove a série do histórico; trocar de dia no meio do treino não perde nem sobrescreve; a hidratação recupera observação, dor e substituto; abrir o app com treino em andamento cai no treino e não em HOJE, e chegar na aba TREINO cai no dia da sessão sem congelar o dia; deload corta pela metade e marca a sessão; e o detalhe oferece corrigir e apagar, com lápide nas duas coisas e aviso de quantas séries vão junto — menos no treino em andamento. |
| `sincronia.test.js` | 12 | O ciclo da sincronização com a rede simulada — quando puxa, quando funde, quando empurra: sem conta o app não fala com a nuvem; o que o outro aparelho gravou desce e se junta ao daqui; **conflito no meio do caminho refaz o ciclo em vez de perder**; sem rede nada se perde e volta a sincronizar depois; nada mudou de nenhum lado não reescreve à toa; apagar aqui não é desfeito pelo que a nuvem ainda tem; e a marca de descanso viaja, não conta como treino e é recusada em dia com treino registrado. |
| `telaprograma.test.js` | 23 | A edição sentado em casa, que é **o oposto da edição do dia**: mexeu, mudou o oficial, e vale do próximo treino. Remover do programa não toca no histórico; trocar reinicia o relógio de 6 a 8 semanas do exercício e pede confirmação antes disso; a diferença lê uma troca como troca e separa série, repetição, descanso e ordem; restaurar um treino desfaz só aquele e restaurar tudo volta programa e rotação sem tocar no histórico nem no catálogo; criar e apagar treino mexe na rotação; o programa avisa quando um músculo sai do alvo do treinador; e o painel atribui a série ao exercício registrado, não à posição. |
| `telas.test.js` | 39 | As regras inegociáveis do projeto e a regressão das telas: **um artefato só, sem dependência de runtime** nem asset servido de fora, a nuvem não sendo pré-condição para abrir, paleta e tom preservados, nenhum handler inline no fonte. Mais: as cinco abas renderizando, o app abrindo em HOJE, o contexto de treino só na aba de treino, acompanhamento somando o mês sem avançar para o futuro, o RIR entrando na própria série em dois toques e limpando no mesmo toque, a tabela do cartão caindo na largura dela sem alcançar o formulário de corrigir, dia com dois treinos levando à lista em vez de abrir um em silêncio, e abrir um exercício já pondo o cartão no topo (`data-ex` é o endereço). |
| `trocaprograma.test.js` | 8 | A troca de programa de agosto de 2026 do ponto de vista do aparelho dele: **seis treinos viram cinco e meses de carga registrada atravessam intactos**; backup antigo cai nos ids da época e não no programa de hoje; o backup preserva o RIR do plano e o da série; o HYROX é sessão da rotação sem virar série de hipertrofia, não pede promoção nem cobra pendência; as estações da prova continuam no catálogo depois de sair da prescrição; e exercício por tempo não recebe linguagem de hipertrofia. |
| `turno.test.js` | 9 | Escolher o turno do treino **reordena o diário sem mover o plano**: o botão PREVISTO oferece os três turnos com a hora de cada um, cada opção diz de antemão qual refeição vira o pós-treino, o selo aparece na refeição certa, o almoço que não cabe dentro do treino vai para depois dele e volta ao desfazer, em dia de descanso o turno não é oferecido, e a migração 7→8 tira o papel do nome sem tocar em outro nome. |

---

## 2 · A classificação que decide o custo

A pergunta é se um caso **toca em elemento de tela**. Os que não tocam podem ser
repontados com a interface de hoje ainda de pé — se um ficar vermelho depois da
reponta, o erro é da reponta, não do redesenho. Os que tocam só existem depois
de a tela nova existir.

### Como foi medido

A classificação não é por leitura de código. Os 514 casos foram **executados
instrumentados**, e o que se mediu foi o toque de verdade.

1. `tests/fluxo/` foi copiado para um diretório fora do projeto (nada no repo
   foi alterado), com `src/`, `dist/`, `node_modules/` e os arquivos de
   configuração ligados por link simbólico.
2. Na cópia do `harness.js`, os ajudantes por onde um teste alcança a tela —
   `$`, `$$`, `texto`, `clicar`, `digitar`, `preencher`, `modo`, `toast` e o
   acessor `doc` — foram envolvidos num contador. **Só o que o teste faz conta:
   o DOM que o app mexe por dentro, ao renderizar, não entra.**
3. A suíte inteira rodou nessa cópia: **33 arquivos, 514 casos, 514 passando.**
   Cada caso gravou quantos toques fez.
4. Dois caminhos de DOM não passam pelos ajudantes e foram achados por leitura:
   `a.window.<Element|Document|…>`, e `document.getElementById(...)` escrito
   **dentro** de `a.E(...)`, que roda no escopo do app. Nove casos usam o segundo
   (`cronometro` 2, `edicao` 1, `fluxo` 1, `serie` 5), mas sete deles já tinham
   sido pegos na medição por também usarem ajudante. **A leitura acrescentou três
   casos à coluna de tela**, e só três: `cronometro` :: *encurtar abaixo de zero
   para o descanso*, `serie` :: *descanso já vencido não ressuscita* e `telas` ::
   *abrir um exercício traz a série para a tela*. Um `document.createElement`
   usado para instalar dublê de canvas **não** conta — é dublê, não leitura de
   tela; por isso `fotos` :: *print em pé não vira tira* ficou como verbo.

   Em números: **291 dos 294 dependentes de tela foram medidos em execução**, e
   3 por leitura.
5. Dos que não tocam a tela, a separação entre **verbo** e **leitura** é
   estática: o caso entra em "verbo" quando o corpo dele chama um nome que
   existe no escopo do módulo — 335 funções em `src/main.jsx` — ou uma chave de
   `CTX`, ou um método de `NUVEM`, inclusive quando a chamada está num ajudante
   local do próprio arquivo de teste (esses foram expandidos; sem isso,
   `importaAulaColada` apareceria falsamente como guarda única). `a.aba(...)`
   conta como verbo: é `CTX.vaiPara`.

### O resultado

| Arquivo | Casos | Não toca a tela: verbo | Não toca a tela: leitura | **Soma sem tela** | Depende da tela |
|---|---:|---:|---:|---:|---:|
| `ajuste.test.js` | 14 | 12 | 1 | **13** | 1 |
| `aula.test.js` | 12 | 10 | 0 | **10** | 2 |
| `aulaimport.test.js` | 14 | 6 | 2 | **8** | 6 |
| `avanco.test.js` | 10 | 0 | 0 | **0** | 10 |
| `cardio.test.js` | 10 | 0 | 0 | **0** | 10 |
| `carga.test.js` | 11 | 1 | 1 | **2** | 9 |
| `ciclo.test.js` | 18 | 3 | 0 | **3** | 15 |
| `corpo.test.js` | 25 | 12 | 0 | **12** | 13 |
| `cronometro.test.js` | 12 | 2 | 0 | **2** | 10 |
| `dados.test.js` | 19 | 3 | 5 | **8** | 11 |
| `diario.test.js` | 9 | 6 | 2 | **8** | 1 |
| `edicao.test.js` | 27 | 12 | 0 | **12** | 15 |
| `esquecido.test.js` | 6 | 0 | 1 | **1** | 5 |
| `fluxo.test.js` | 5 | 0 | 0 | **0** | 5 |
| `fotos.test.js` | 20 | 6 | 2 | **8** | 12 |
| `fusao.test.js` | 24 | 6 | 2 | **8** | 16 |
| `horario.test.js` | 14 | 2 | 1 | **3** | 11 |
| `leitura.test.js` | 3 | 0 | 0 | **0** | 3 |
| `migracaochave.test.js` | 7 | 5 | 2 | **7** | 0 |
| `navegacao.test.js` | 9 | 2 | 1 | **3** | 6 |
| `programa.test.js` | 12 | 7 | 0 | **7** | 5 |
| `promocao.test.js` | 9 | 1 | 1 | **2** | 7 |
| `protocolo.test.js` | 58 | 34 | 1 | **35** | 23 |
| `publicacao.test.js` | 13 | 0 | 13 | **13** | 0 |
| `retro.test.js` | 9 | 1 | 0 | **1** | 8 |
| `ritmo.test.js` | 19 | 13 | 2 | **15** | 4 |
| `serie.test.js` | 8 | 0 | 0 | **0** | 8 |
| `sessao.test.js` | 26 | 10 | 0 | **10** | 16 |
| `sincronia.test.js` | 12 | 4 | 0 | **4** | 8 |
| `telaprograma.test.js` | 23 | 16 | 0 | **16** | 7 |
| `telas.test.js` | 39 | 2 | 4 | **6** | 33 |
| `trocaprograma.test.js` | 8 | 1 | 1 | **2** | 6 |
| `turno.test.js` | 9 | 0 | 1 | **1** | 8 |
| **TOTAL** | **514** | **177** | **43** | **220** | **294** |

**220 casos não tocam em elemento de tela** — 177 por verbo, 43 por leitura de
dado, de estado ou do disco. **294 dependem da tela.** As duas colunas somam 514.

### O número de 203 não bate

Um agente anterior mediu 203 sem tela (161 por verbo, 42 por leitura). **A minha
medição dá 220 (177 + 43).** A parte de leitura é praticamente a mesma — 43
contra 42 —; a diferença está nos de verbo, 177 contra 161.

Onde está a divergência não dá para saber sem o método dele, e por isso não vou
afirmar o motivo. Duas hipóteses plausíveis, nenhuma verificada: ter contado
como dependente de tela os casos cuja única entrada é `a.aba(...)` (que é
navegação, mas é `CTX.vaiPara` — um verbo), ou ter contado como tela os casos que
instalam dublê com `document.createElement`, que é dublê e não leitura.

**Onde o meu número é mais confiável:** a coluna de tela foi medida em execução,
não inferida. Rodando o filtro apenas por leitura de código, antes de medir, eu
mesmo tinha obtido 230 sem tela. A execução achou **dez casos** que tocavam a
tela sem nenhum marcador textual óbvio — `avanco` subiu de 6 para 10 dependentes
de tela, `esquecido` de 1 para 5, `telas` de 32 para 33 e `turno` de 7 para 8 —
e nenhum no sentido contrário. A diferença entre 230 e 220 é exatamente a
correção que só a execução dá. Se o 203 saiu de leitura de código, ele carrega o
mesmo tipo de erro, no sentido oposto.

### Três ressalvas sobre a linha de corte

- **`confirm` e `prompt` não contam como tela.** Dez casos verificam o que o app
  perguntou (`a.perguntas()`, `a.recusar()`, `a.responder()`). É diálogo do
  sistema capturado por dublê, não seletor nem texto renderizado, então entraram
  como não-tela. Se a reescrita trocar `confirm` por uma folha do app, esses dez
  passam a depender da tela. Não medido: quantos dos dez a interface nova
  transformaria.
- **Três casos de `telas.test.js` leem o texto do build, não a tela**: `FONTE`
  (o fonte concatenado de `src/`) e `HTML` (o `dist/index.html` costurado). São
  "um artefato só, sem dependência de runtime", "paleta e tom preservados" e
  "nenhum handler inline sobrou no fonte". Entraram como leitura, mas o que eles
  afirmam é sobre o CSS e o HTML que o redesenho vai reescrever — então
  sobrevivem como teste e **mudam de assunto** junto com a interface.
- **`publicacao.test.js` (13 casos) não abre o app.** Lê `dist/`, `vercel.json` e
  `vite.config.js` do disco. É o único arquivo da pasta que a rigor não é teste
  de fluxo, e o único que a reescrita não precisa tocar.

---

## 3 · O ponto único de falha

**Esta é a seção mais importante do documento.** São as capacidades protegidas
por **um só caso de teste, em um arquivo só**. Se o caso some na reescrita, a
capacidade some com ele, e nada fica vermelho para avisar.

### Como foi achado

Dois cortes, os dois mecânicos:

1. **Por verbo.** Para cada um dos 193 nomes de verbo distintos que a suíte
   aciona (ajudantes locais dos arquivos de teste expandidos), contei quantos
   casos o acionam. **66 nomes têm um caso só**, e esses 66 estão concentrados em
   **57 casos de teste** — alguns guardam dois ou três verbos sozinhos.
2. **Por observável de dublê e de build.** Os verbos não cobrem o que só se vê
   num dublê (wake lock, bipe, vibração, faixa de câmera, `facingMode`) nem no
   disco (service worker, manifesto, `vercel.json`). Contei caso por caso, por
   marcador, e confirmei a unicidade com `grep -l` por arquivo.

Contando os dois cortes sem repetição, as subseções abaixo nomeiam **103 casos
de teste que são guarda única de ao menos uma capacidade** — 76 nomeados um a um
nas tabelas, mais os seis casos restantes de `migracaochave.test.js`, os oito
restantes de `navegacao.test.js` e os treze de `publicacao.test.js`, cada um
guarda única da capacidade dele dentro de um arquivo que nenhum outro cobre.
**São 20% da suíte carregando capacidade que ninguém mais protege.**

Uma ressalva honesta sobre esse número: o corte por verbo é mecânico e
reproduzível, mas "capacidade" não é. Dois casos podem acionar o mesmo verbo e
afirmar coisas diferentes sobre ele — e aí a capacidade de um deles também está
sozinha, sem aparecer nesta lista. **Este número é um piso, não um teto.**

### 3.1 · Sessão, ciclo e relógio

| Capacidade | Guarda única |
|---|---|
| "Continuo treinando" zera o relógio do esquecimento e devolve o atalho | `esquecido` :: *"continuo treinando" zera o relógio e devolve o atalho* |
| "Já parei" grava a duração **até a última série**, não até agora | `esquecido` :: *"já parei" grava a duração até a última série, não até agora* |
| Pausar para o relógio e retomar continua de onde parou | `ciclo` :: *pausar para o relógio e retomar continua* |
| A hidratação do rascunho recupera observação, dor e substituto | `sessao` :: *hidratação recupera observação, dor e substituto* |
| Corrigir e apagar uma sessão passada — os três verbos (`editarSessao`, `salvaEdicao`, `apagarSessao`) num caso só | `telas` :: *correção de sessão passada altera e apaga* |
| O relógio da sessão é filho direto do `main`, senão o `sticky` descola | `sessao` :: *o relógio da sessão é filho direto do main, senão o sticky descola* |
| A gravação represada é descarregada ao sair do app (`pagehide`) | `serie` :: *sair do app descarrega a gravação represada* |

### 3.2 · O cronômetro de descanso e o que o iOS exige

`cronometro.test.js` é o **único arquivo da pasta** que menciona wake lock,
`AudioContext`, bipe ou vibração.

| Capacidade | Guarda única |
|---|---|
| A tela acesa é pedida ao começar a digitar e **solta** ao encerrar | `cronometro` :: *tela acesa é pedida ao começar a digitar e solta ao encerrar* |
| O aviso de fim de descanso toca uma vez só — bipe e vibração | `cronometro` :: *avisa uma vez só ao zerar* |
| O `AudioContext` nasce dentro do gesto, exigência do iOS para tocar som | `cronometro` :: *AudioContext nasce dentro do gesto, exigência do iOS* |
| Cada categoria de exercício declara o descanso dela | `cronometro` :: *cada categoria de exercício declara seu descanso* |
| O cronômetro publica a própria altura para quem se empilha nele | `cronometro` :: *o cronômetro publica a própria altura para quem se empilha nele* |

### 3.3 · Programa, edição e promoção

| Capacidade | Guarda única |
|---|---|
| A série registrada segue o exercício quando ele muda de posição | `edicao` :: *a série registrada segue o exercício quando ele muda de posição* |
| Desfazer uma mudança volta o dia ao programa | `edicao` :: *desfazer uma mudança volta o dia ao programa* |
| Promover uma troca reinicia o relógio do exercício no programa | `edicao` :: *promover uma troca reinicia o relógio do exercício no programa* |
| O aviso da regra de 6 a 8 semanas ao trocar algo recém-promovido | `edicao` :: *trocar exercício recém-promovido avisa da regra de 6 a 8 semanas* |
| O impacto no volume aparece **na hora** de mexer | `edicao` :: *o impacto no volume aparece na hora de mexer* |
| O alvo do treinador é calculado do programa, nunca transcrito | `edicao` :: *o alvo do treinador é calculado do programa, nunca transcrito* |
| O programa avisa quando um músculo sai do alvo do treinador | `telaprograma` :: *o programa avisa quando um músculo sai do alvo do treinador* |
| A diferença separa série, repetição e descanso | `telaprograma` :: *a diferença separa série, repetição e descanso* |
| Todas as telas internas do programa renderizam (`modoPrograma`) | `telaprograma` :: *todas as telas do programa renderizam* |
| O painel compara séries por músculo contra o mesmo ponto das semanas anteriores | `telas` :: *séries por músculo compara com o mesmo ponto das semanas anteriores* |
| O dia aberto não pede promoção nem cobra pendência | `trocaprograma` :: *o dia aberto não pede promoção nem cobra pendência* |
| O HYROX é sessão da rotação sem virar série de hipertrofia | `trocaprograma` :: *o HYROX é sessão da rotação sem virar série de hipertrofia* |

### 3.4 · Comida, plano e turno

Esta é a área com mais ponto único por caso — a metade de comida é nova e cada
capacidade dela nasceu com um teste, não com três.

| Capacidade | Guarda única |
|---|---|
| Adicionar alimento a uma refeição entra no plano **e** no total do dia | `fusao` :: *adicionar alimento a uma refeição entra no plano e no total do dia* |
| Cadastrar alimento cria id próprio e aparece na biblioteca | `fusao` :: *cadastrar alimento cria id próprio e aparece na biblioteca* |
| Remover alimento em uso o tira das refeições que o citam | `fusao` :: *remover alimento em uso tira ele das refeições que o citam* |
| Alimento da prescrição é editável mas não some do código | `fusao` :: *alimento da prescrição é editável mas não some do código* |
| Remover uma refeição limpa o que era do dia junto (`removeRefeicao` **e** `setEscala`) | `fusao` :: *remover uma refeição limpa o que era do dia junto* |
| Confirmar a cadência do dia previsto muda o alvo | `fusao` :: *o dia previsto se identifica como previsão, e confirmar muda o alvo* |
| As folhas voltam todas de uma vez (`fechaTudo`) | `fusao` :: *as folhas empilham em três níveis e voltam uma a uma* |
| A água do dia sobe e desce, e entra no dia que fecha | `diario` :: *o dia vivido vai para o histórico na virada da data* |
| A folha da refeição mostra o padrão dela antes de ele marcar | `diario` :: *a folha da refeição mostra o padrão dela antes de ele marcar* |
| Cada opção de turno diz de antemão qual refeição vira o pós-treino | `turno` :: *cada opção diz de antemão qual refeição vira o pós-treino* |
| O turno é ajuste de hoje: o plano não se move | `turno` :: *o turno é ajuste de HOJE: o plano não se move* |
| Os três estados de aderência do dia, e a escolha persistindo | `ajuste` :: *a folha do dia oferece os três estados, e a escolha persiste* |
| Dois passos de ajuste no mesmo sentido somam (e o arroz acompanha) | `ajuste` :: *dois passos no mesmo sentido somam, e a tela diz que são dois* |
| Restaurar o plano é o caminho documentado para zerar o saldo | `ajuste` :: *restaurar o plano é o caminho documentado para zerar* |

### 3.5 · Corpo, cardio e medidas

| Capacidade | Guarda única |
|---|---|
| O veredito da regra de ajuste é o que aparece na aba corpo | `corpo` :: *o veredito da regra é o que aparece na aba corpo* |
| A cintura usa o stepper dela, não o do peso | `corpo` :: *cintura usa o stepper dela, não o do peso* |
| Apagar uma medida de corpo não é desfeito pelo que a nuvem ainda tem | `sincronia` :: *apagar aqui não é desfeito pelo que a nuvem ainda tem* |
| O painel de volume lê as linhas em conjunto e nomeia a inversão | `leitura` :: *o painel lê as linhas juntas e diz a inversão* |

### 3.6 · O byte da foto

| Capacidade | Guarda única |
|---|---|
| Referência sem bytes locais busca a foto do outro aparelho (`reconciliaFotos`) | `fotos` :: *referência sem bytes locais busca a foto do outro aparelho* |
| A miniatura aparece na troca só quando há foto | `fotos` :: *a miniatura aparece na troca só quando há foto* |
| As fotos mudam de cache junto com o nome do app | `fotos` :: *as fotos mudam de cache junto com o nome do app* |
| Abrir uma sessão podada traz os bytes de volta do bucket | `protocolo` :: *abrir uma sessão podada traz os bytes de volta do bucket* |
| Sair da tela **desliga** a câmera (nenhuma faixa viva) | `protocolo` :: *sair da tela DESLIGA a câmera* |
| A câmera é aberta pedindo a traseira, em retrato | `protocolo` :: *abrir a câmera pede a traseira, e em retrato* |
| Permissão negada vira o que fazer a respeito, não tela quebrada | `protocolo` :: *permissão negada não vira tela quebrada, vira o que fazer a respeito* |
| Sem quadro ainda, a captura recusa em vez de gravar preto | `protocolo` :: *sem quadro ainda, a captura recusa em vez de gravar preto* |
| A contagem do temporizador pode ser cancelada antes de disparar | `protocolo` :: *a contagem pode ser cancelada antes de disparar* |
| Sair do ajuste sem salvar descarta, e o original nunca foi tocado | `protocolo` :: *sair sem salvar descarta: o original nunca foi tocado* |
| O ajuste que não faz nada sai do estado em vez de virar zeros | `protocolo` :: *o ajuste que não faz nada sai do estado em vez de virar zeros* |
| A foto sobreposta pode ser trocada para qualquer outra data | `protocolo` :: *a foto sobreposta pode ser trocada para qualquer outra data* |
| Andar entre poses não joga a sessão de fotos para o topo | `protocolo` :: *andar entre poses não joga a sessão de fotos para o topo* |

### 3.7 · Custódia dos dados e migração de chave

| Capacidade | Guarda única |
|---|---|
| O backup sai em UTF-8 e o acento sobrevive à volta | `dados` :: *o backup sai em UTF-8, e o acento sobrevive à volta* |
| Abrir o JSON conta como backup (zera os dias sem backup) | `dados` :: *abrir o JSON conta como backup* |
| A migração roda uma vez só | `dados` :: *a migração roda uma vez só* |
| Sair da nuvem apaga **as duas** chaves de sessão | `migracaochave` :: *sair apaga as duas chaves da sessão* |

Os outros seis casos de `migracaochave.test.js` também são guarda única cada um
— é o único arquivo da suíte que semeia a chave legada e verifica a fusão do
boot. Nenhum outro arquivo escreve em `treino-eduardo-v1` ou `treino-nuvem-v1`.

### 3.8 · O Voltar do sistema

`navegacao.test.js` é o **único arquivo da pasta que toca na History API**. Os
nove casos dele são guarda única de nove coisas diferentes, e a mais frágil é
esta:

| Capacidade | Guarda única |
|---|---|
| A folha entra em foco, isola o fundo com `inert` e devolve o foco ao sair | `navegacao` :: *a folha entra em foco, isola o fundo e devolve o foco ao sair* |

### 3.9 · Aula de box e movimento com grandeza

| Capacidade | Guarda única |
|---|---|
| Aplicar um modelo de aula põe os movimentos no dia | `aula` :: *aplicar um modelo põe os movimentos no dia* |
| Apagar um modelo deixa lápide, senão a sincronização o ressuscita | `aula` :: *apagar um modelo deixa lápide, senão a sincronização o ressuscita* |
| Exercício cadastrado por ele pode declarar grandeza | `ritmo` :: *exercício cadastrado por ele pode declarar grandeza* |
| O cabeçalho acompanha a quantidade enquanto ele digita | `ritmo` :: *o cabeçalho acompanha a quantidade enquanto ele digita* |
| Trocar a medida do dia alcança o que já foi digitado | `ritmo` :: *trocar a medida do dia alcança o que já foi digitado* |
| O tipo de implemento único não se chama mais halter | `carga` :: *o tipo de implemento único não se chama mais halter* |
| A chave interna continua `pino`, para não quebrar correção antiga | `carga` :: *chave interna continua pino para não quebrar correção antiga* |
| Preencher os exercícios de um retroativo grava na data do treino | `retro` :: *preencher os exercícios grava na data do treino, não na de hoje* |
| O nome novo de um exercício renomeado aparece no título e no cartão | `edicao` :: *o nome novo aparece no título e no cartão* |

### 3.10 · O que é publicado

`publicacao.test.js` é o único arquivo que lê o service worker, o manifesto ou o
`vercel.json`. **Os treze casos são, cada um, guarda única da capacidade dele.**
Em ordem: versão e lista do SW saindo preenchidas; o hash cobrindo o que não
passa pelo rollup; o precache listando exatamente os assets emitidos; o index
apontando só para arquivos que existem; o app resolvendo offline pelo index em
cache; o cache velho apagado ao ativar; o cache de fotos sobrevivendo à
publicação; o precache não disparando tudo de uma vez; ícones e manifesto no
dist; todo ícone declarado existindo e no precache; o manifesto separando o
ícone comum do mascarável; o `vercel.json` só com chaves do schema; e os
cabeçalhos de cache distinguindo o que tem hash do que não tem.

**Nenhum deles passa pela interface.** São os treze casos de menor risco e maior
retorno da reescrita: repontam direto, hoje.

### 3.11 · As regras inegociáveis do projeto

| Capacidade | Guarda única |
|---|---|
| Um artefato só, sem dependência de runtime nem script buscado à parte | `telas` :: *um artefato só, sem dependência de runtime* |
| A nuvem não é pré-condição para o app abrir | `telas` :: *a nuvem não é pré-condição para o app abrir* |
| Paleta e tom preservados | `telas` :: *paleta e tom preservados* |
| Nenhum handler inline no fonte | `telas` :: *nenhum handler inline sobrou no fonte* |
| Um asset servido do Storage não passa despercebido | `telas` :: *um asset servido do Storage não passa despercebido* |
| O cartão de exercício tem endereço no DOM (`data-ex`), que é como o casco rola até ele | `telas` :: *o cartão de exercício tem endereço no DOM* |
| O app não comemora por cor: recorde não é pintado de ácido | `horario` :: *recorde não é pintado de ácido: o app não comemora por cor* |

---

## 4 · O que os testes de fluxo protegem e os de domínio não

A pergunta desta seção é quanto da rede é mesmo insubstituível. A resposta curta:
**a divisão já está feita, e está escrita nos cabeçalhos dos próprios arquivos.**
Os testes de fluxo não duplicam o domínio por acidente — dez deles declaram, em
comentário, o que deixaram para lá.

### A divisão declarada

Dez pares têm o mesmo nome nas duas pastas, e o de fluxo diz o que o de domínio
já cobre:

| Par | Domínio cobre | Fluxo cobre |
|---|---|---|
| `carga` (11 fluxo / 9 domínio) | os seis tipos de carregamento e as agregações; "o app nunca converte, só rotula" | o rótulo e o total **na tela**, a persistência da correção, e o histórico plotando repetição. O cabeçalho é explícito: *"a integridade do catálogo virou tests/dominio/carga.test.ts"* |
| `leitura` (3 / 14) | as linhas do painel lidas em conjunto, e a frase não virando conselho | *"as regras estão em tests/dominio/leitura.test.ts, onde custam microssegundos. O que sobra aqui é a ligação"* — o painel tinha o dado e não lia junto |
| `sincronia` (12 / 36) | a fusão de dois estados, caso de borda à vontade | *"a fusão em si é testada em dominio/sincronia.test.ts, sem app. Aqui é o ciclo"* — quando puxa, quando funde, quando empurra, e o conflito no meio do caminho |
| `protocolo` (58 / 29) | ordem de poses, continuidade e comparabilidade — função pura | *"o que esta suíte cobra é o caminho completo — câmera, redução, Cache Storage, bucket, poda e volta"*. O byte |
| `corpo` (25 / 26) | as três regras de ajuste nos limites exatos — *"antes cada um destes casos custava subir o app inteiro para ler um parágrafo da tela"* | o veredito chegando à aba, o registro com vírgula, a data passada, o stepper |
| `sessao` (26 / 9) | qual exercício vem agora — as duas perguntas | o registro contínuo sem botão de salvar: nascer, gravar na hora, morrer sozinha, hidratar, apagar |
| `aula` (12 / 16) | ler uma aula escrita fora do app, e o arquivo plausível que planta dado errado | as portas: repetir o sábado, modelo, lista rápida |
| `turno` (9 / 17) | o que anda com a sessão e o que fica preso ao relógio | o botão PREVISTO e o diário respondendo |
| `diario` (9 / 13) | o histórico do dia alimentar | o fechamento na virada, dentro do app, e a fusão de dois aparelhos |
| `fusao` (24 / 20) | os dois conflitos de modelo do estado compartilhado | as duas metades na mesma tela, e as folhas |

### Onde está o vão

Vinte e três arquivos de fluxo **não têm arquivo de mesmo nome no domínio**.
Esses 325 casos são a parte insubstituível da rede. Uma exceção de nome:
`aulaimport.test.js` (14) tem par por assunto, não por nome — a leitura do
arquivo de aula está em `dominio/aula.test.ts`, e o cabeçalho dele é explícito
sobre o que deixou lá. Fora essa, o vão tem quatro formas:

1. **A fronteira entre rascunho, DOM e log** — é o motivo declarado na
   `vitest.config.js` para a suíte de fluxo existir: *"os bugs que apagavam série
   apareceram na fronteira entre rascunho, DOM e log, e essa fronteira só existe
   montada"*. `serie` (8), `sessao` (26), `edicao` (27), `avanco` (10),
   `ciclo` (18). Nenhuma função pura tem o que dizer sobre apagar um campo e a
   série sair do histórico.
2. **O que o aparelho faz e o jsdom não tem** — wake lock, `AudioContext`,
   vibração, Cache Storage, `getUserMedia`, `createImageBitmap`, `canvas.toBlob`,
   `visibilitychange`, History API. `cronometro` (12), `fotos` (20), a metade de
   byte de `protocolo`, `navegacao` (9). O domínio não tem onde pendurar isto: a
   regra é pura, a plataforma não.
3. **O boot e o disco** — a migração do estado ao abrir, as duas chaves de
   storage, o backup e a reimportação. `dados` (19), `migracaochave` (7),
   `programa` (12), `trocaprograma` (8). `dominio/migracoes.test.ts` (27) cobre a
   transformação; o fluxo cobre **que ela roda, uma vez, no boot, e com o estado
   que está no iPhone dele**. São coisas diferentes, e é a segunda que custa
   histórico.
4. **O que é publicado** — `publicacao` (13). Nada no domínio lê o service
   worker, o manifesto ou o `vercel.json`.

E há dois arquivos de fluxo que são sobre **o que a tela diz, não sobre o que a
conta dá**: `ritmo` (19) — *"estes testes leem a TELA, não a função, porque era
na tela que a mentira aparecia"* — e `telas` (39). `dominio/unidade.test.ts` (13)
já prova que o remo não melhorou; `ritmo` prova que o app **não pinta de verde**
o que não melhorou. Se a reescrita perder o segundo, a mentira volta com a conta
certa por baixo.

### A exceção que ninguém contou: `estilo.test.ts` também quebra

O plano diz que os 372 de domínio sobrevivem inteiros. **Trinta e oito deles não
são sobre regra: são sobre CSS.** `tests/dominio/estilo.test.ts` lê as cinco
folhas de `src/` por nome — `tokens.css`, `base.css`, `componentes.css`,
`treino.css`, `protocolo.css` — e afirma coisas sobre o conteúdo delas.

Contando caso por caso, por citação de nome concreto (classe, token ou
hexadecimal do CSS de hoje):

- **10 casos citam nome concreto** e quebram junto com as folhas: a paleta do
  Instrumento inteira por valor, o alvo de toque, o controle pequeno, o relógio
  grudado no topo, o cronômetro no rodapé, a marca de recorde, o texto que se
  toca, onde parar de rolar, a bancada não alcançando o app, a área segura
  simulada.
- **28 casos são invariante genérica** e sobrevivem **se o redesenho os
  respeitar**: toda `var()` com dono, tela cheia em `svh` e não `vh`, escala
  vertical de 4, campo nunca abaixo de 16px, nenhum ancestral do `sticky` virando
  scroll container, o toast anunciado por leitor de tela, a tela cheia com título
  de primeiro nível que recebe foco, nada entre a folha e a janela criando bloco
  de contenção.

Esses 28 não são teste de regressão da interface velha — são **a especificação
mobile do produto, em forma executável**. Vale ler os 28 antes de escrever a
primeira linha de CSS novo, e não depois: eles já contêm o `svh`, o `sticky` e o
`touch-action` que o redesenho vai redescobrir.

Não medido: quantos dos 10 acoplados sobreviveriam renomeando só o seletor.

---

## 5 · Os verbos do modelo

`CTX`, em `src/main.jsx`, é a superfície por onde um teste entra sem passar pela
tela. Ele tem **180 chaves**: 19 no literal (`const CTX = {` na linha 1962) e 161
atribuídas depois, ao longo do arquivo. Além dele, `window.__escopo` (linha 4514)
é um `eval` dentro do escopo do módulo, e por ali os testes alcançam as **335
funções de módulo** direto pelo nome nu — `toggle(0)`, `finalizarSessao()` — sem
passar por `CTX`.

### Quanto disso os testes acionam

| | Quantos | Como foi contado |
|---|---:|---|
| Chaves de `CTX` | **180** | chaves do literal + `^CTX\.x =` em `src/main.jsx` |
| Chaves de `CTX` chamadas como `CTX.x(...)` | **66** | ocorrências de `CTX.x(` dentro de `a.E`/`a.J`, mais `a.aba()` que é `CTX.vaiPara` |
| Chaves de `CTX` acionadas de algum jeito | **82** | as 66 mais 16 alcançadas pela função de módulo homônima, chamada pelo nome nu |
| Chaves de `CTX` que nenhum teste aciona | **98** | — |
| Funções de módulo (alcance do `__escopo`) | **335** | `^function x` e `^const x = function\|(` em `src/main.jsx` |
| Funções de módulo chamadas pelo nome nu | **128** | nome nu seguido de `(` dentro de `a.E`/`a.J` |
| Nomes de verbo distintos que a suíte aciona | **193** | união das duas listas, `CTX.x` e `x` colapsados |

**As 98 chaves de `CTX` que nenhum teste chama não estão sem teste.** São as que
a interface chama no clique: `apagaMedida` tem caso (`corpo` :: *pesagem errada
pode ser apagada*), só que o caso clica em `.crow-x` em vez de chamar o verbo.
Essas 98 são **as mais baratas de blindar na reponta**: o verbo já existe, basta
o teste novo usá-lo em vez do clique. Entre elas: `apagaCardio`, `apagaLinha`,
`apagaMedida`, `apagaTudo`, `registraPeso`, `registraCintura`, `editaLinha`,
`salvaEdicao`, `salvaRefeicao`, `importaArquivo`, `importaTexto`, `exportar`,
`copiaJSON`, `mostraJSON`, `entrarNaNuvem`, `sairDaNuvem`, `sincronizaAgora`,
`setTurno`, `setNotaDaSessao`, `marcaCompra`, `setHorizonteCompras`,
`vaiParaDia`, `concluiPromo`, `voltaDoPromo`, `restauraPrograma`, e todas as de
câmera e ajuste (`setGradeDaCamera`, `setOpacidadeDaCamera`, `setZoomDoAjuste`,
`setFantasmaDaCamera`, `setSobrepor`, `arrastaAjuste`, …).

Cuidado com uma leitura errada desta linha: `setDeload`, `decidePromo`,
`motivoPromo` e `mudaMes` **não** estão entre as 98 — os testes os chamam pela
função de módulo homônima, pelo nome nu. "Não chamado como `CTX.x`" e "não
acionado" são contagens diferentes, e a tabela acima separa as duas.

### As capacidades que não têm verbo

Estas são o trabalho de verdade da reescrita: **não existe nome para chamar, só
elemento para tocar.** Quatro grupos, por razão diferente.

#### a) Entrada de valor: o manipulador recebe o elemento, não o valor

Sete funções de `src/main.jsx` recebem o elemento do DOM como primeiro
argumento. Não há como passar um número para elas:

| Função | Capacidade sem verbo |
|---|---|
| `inp(el, i, k, pos)` | **Registrar uma série** — carga, repetição e RIR. É a interação de maior frequência do produto, e a única porta é pôr o valor no campo e disparar `input`. Daí os 110 usos de `a.preencher` no harness |
| `inpRapido(el, i, pos)` | O mesmo pela lista rápida da aula de box |
| `obsIn(el, i)` | A observação de um exercício |
| `addNome(el)` | O nome de um treino avulso no lançamento retroativo |
| `addHora(el)` | O horário informado no lançamento retroativo, com a máscara `hh:` |
| `importFile(input)` | Importar um backup de arquivo (`input[type=file]`) |
| `limpaNum(el, dec)` | A normalização de vírgula e decimal (ajudante dos de cima) |

`tiraFoto(el)` e `tiraFotoDoCorpo(el)` também recebem o elemento, mas os testes
já os chamam com um objeto falso — `a.E("tiraFoto({ files: [...], value: '' })")`
—, então na prática são verbo. Vale manter esse formato de entrada ou dar a eles
um verbo de verdade; hoje é convenção, não contrato.

#### b) Verbo que existe mas lê os argumentos da tela

| Função | O que lê |
|---|---|
| `criarExercicio()` | **Seis campos**: `#nxn` (nome), `#nxg` (grupo), `#nxc` (carga), `#nxk` (composto), `#nxu` (grandeza), `#nxq` (quantidade). Por isso `edicao`, `fluxo` e `ritmo` escrevem `document.getElementById("nxg").value = …` antes de chamar o verbo |
| `guardaCamposEdicao()` | `#ed{k}_0`, `#ed{k}_1` e `#edobs` — a correção de uma sessão passada |
| `atualizaPrescricao(i)` | escreve em `#presc{i}`: o cabeçalho que acompanha a quantidade enquanto ele digita |
| `buscaEx(q)` | recebe o texto, mas devolve o foco pelo `document.activeElement` — o que o teste verifica é o teclado não fechar a cada letra |

Chamar o verbo não é suficiente nesses quatro: **a entrada mora no DOM.** Dar a
eles uma assinatura por valor é a mudança de maior alavanca da reescrita —
converte, de uma vez, os casos de `edicao`, `fluxo`, `ritmo` e `telas` que hoje
só existem pela tela.

#### c) Estado de componente, fora do alcance do `__escopo`

Onze pontos de `useState` em seis arquivos de `src/ui/` guardam estado que não
está em `view` e por isso **não tem como ser lido nem escrito pelo `__escopo`**.
O próprio `harness.js` documenta o caso mais usado:

> *"O modo é estado do componente, não de `view`, então não dá para alcançá-lo
> pelo `__escopo` — e é bom que não dê: o caminho é o mesmo do usuário, tocar no
> chip."*

| Arquivo | Estado sem verbo |
|---|---|
| `ui/telas/dados.jsx` | o modo da aba DADOS (`'corpo'` \| `'treino'`) — é o `a.modo()` do harness, usado 40 vezes |
| `ui/telas/comida.jsx` | o modo da COMIDA (`'plano'`) e o texto da busca |
| `ui/telas/guia.jsx` | qual regra de execução está aberta, e a aba interna do guia |
| `ui/folhas/editores.jsx` | o rascunho das folhas de refeição e de alimento (4 estados) |
| `ui/instrumento/tabbar.jsx` | um estado próprio da tab bar |
| `ui/instrumento/primitivos.jsx` | a semente de `Date.now()` de um primitivo |

#### d) O que é capacidade de tela por natureza

Vinte e sete casos tocam a tela e **não chamam verbo nenhum** — porque o que eles
afirmam é a tela. Nenhum verbo os substitui, e nenhuma reescrita os evita:

- **Ordem e posição**: HOJE mostrando comida e treino na mesma timeline em ordem
  de relógio; o cartão-foco antes de qualquer resumo; o diário reordenado pelo
  turno; a lista dos seis dias do programa.
- **Presença e ausência**: o placar de cardio na tela de hoje; a faixa da semana
  marcando os dias; o quadro da aula visível enquanto ela acontece; o lugar da
  foto sendo o caminho para tirar uma; *"não existe mais função de salvar"*.
- **Endereço e empilhamento**: `data-ex` no cartão; o relógio como filho direto
  do `main`; a montagem do protocolo saindo do caminho depois.
- **Em qual tela o app abre**: em HOJE e não no treino; dia com dois treinos
  levando à lista em vez de abrir um em silêncio.

Os 27, por arquivo, para poder conferir um a um:

| Arquivo | Casos que só existem pela tela |
|---|---|
| `aulaimport` (2) | o quadro aparece na tela enquanto a aula acontece · o catálogo vence o arquivo: cadastro por cima é ignorado com aviso |
| `cardio` (3) | placar da semana aparece na tela de hoje · feito hoje muda o estado da linha · faixa da semana marca os dias com cardio |
| `fotos` (3) | sem foto, o lugar dela é o caminho para tirar uma · tocar na miniatura não abre o exercício junto · o número do exercício continua visível, embaixo da miniatura |
| `fusao` (6) | estado migra para o plano 4 e a nutrição nasce semeada · HOJE mostra comida e treino na MESMA timeline, em ordem de relógio · o cartão-foco responde "e agora?" antes de qualquer resumo · marcar uma refeição soma no registrado e persiste · a água sobe e desce no toque · a cadência da semana é editável e só fala de cadência |
| `promocao` (1) | a pergunta guardada aparece ao abrir o app de novo |
| `protocolo` (2) | a montagem vem antes da primeira foto e sai do caminho depois · backup antigo, sem protocolo nenhum, entra sem quebrar |
| `serie` (2) | o descanso sobrevive a fechar e reabrir o app · descanso já vencido não ressuscita |
| `sessao` (2) | não existe mais função de salvar · o relógio da sessão é filho direto do main, senão o sticky descola |
| `telaprograma` (1) | a lista mostra os seis dias e a conta contra o treinador |
| `telas` (4) | o app abre em HOJE, não no treino · dia com dois treinos leva à lista, em vez de abrir um deles em silêncio · dia com um treino só continua abrindo direto · o cartão de exercício tem endereço no DOM |
| `turno` (1) | o botão PREVISTO oferece os três turnos, com a hora de cada um |

Esses 27 — mais os 294 que dependem da tela em geral — são a conta que a
interface nova paga. O restante, **220 casos, pode ser repontado antes de ela
existir**, e os 13 de `publicacao.test.js` podem ser repontados hoje.

---

## Como reusar este documento

- **Para conferir a reescrita no fim**: a tabela da seção 1 é a lista de
  verificação. Cada linha é uma pergunta: *a suíte nova ainda afirma isto?*
- **Para decidir a ordem**: a coluna "soma sem tela" da seção 2 diz o que dá para
  fazer já.
- **Para não perder capacidade em silêncio**: a seção 3. Um caso dela que
  desaparecer sem substituto é uma capacidade perdida, e não haverá vermelho.
- **Antes da primeira linha de CSS**: os 28 casos genéricos de
  `tests/dominio/estilo.test.ts`, na seção 4.
- **Para baratear a reponta**: a seção 5 — as 98 chaves de `CTX` já existentes, e
  os quatro verbos cujos argumentos ainda moram no DOM.

### Reprodutibilidade

Todo número deste documento sai de um destes comandos:

```
npx vitest run --project fluxo --reporter=json      # 514 casos, 33 arquivos
grep -cE "^\s*(test|it)\(" tests/dominio/*.test.ts  # 372 casos, 20 arquivos
git grep -hcE "^test\(" <commit> -- 'tests/fluxo/*.test.js'
```

A coluna "depende da tela" veio de uma execução instrumentada da suíte numa cópia
fora do repositório, descrita em "Como foi medido" na seção 2. **Nada em
`tests/`, `src/` ou na configuração foi alterado para produzir este documento.**
