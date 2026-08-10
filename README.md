# Treino

Aplicativo pessoal de registro de treino, cardio e acompanhamento corporal.
Arquivo único, sem build, sem dependências, funciona offline, instalável na tela
de início do iPhone.

Não é um produto. É uma ferramenta feita para um programa de treino específico,
e várias decisões de interface só fazem sentido dentro dele.

## Contexto de uso

Usado de pé, com uma mão, suado, às 6h15 da manhã, em academia com sinal ruim.
Isso governa quase tudo: alvos de toque grandes, nada que exija precisão,
nenhuma tela que dependa de rede, e o rascunho do treino salvo a cada tecla para
que fechar o app no meio não custe nada.

O app existe em parte para **frear** a progressão de carga, não só registrar:
tendão adapta mais devagar que músculo, então o selo de subir carga só aparece
quando todas as séries batem o topo da faixa, e fica suspenso depois de pausa
longa.

## Regras inegociáveis

Elas são load-bearing. Quebrar qualquer uma delas exige decisão consciente.

1. **Um arquivo só**, sem build e sem dependência externa — exceto a fonte do
   Google Fonts, que tem fallback de sistema.
2. **Não quebrar dados salvos.** Mudança de formato exige migração que leia a
   versão antiga. `load()` preenche campos novos com padrão.
3. **Mobile-first de verdade.** Ver contexto de uso acima.
4. **Identidade visual fixa.** Paleta e tipografia abaixo.
5. **Interface toda em português**, tom direto, sem emoji, sentence case.
   Exceção única e deliberada: os três marcadores de período do dia no
   calendário (`PERIODOS`). Foi decisão do dono do app, não descuido — não
   estender emoji para outros lugares sem ele pedir.
6. **Não inventar prescrição de treino.** A ferramenta mede e freia; ela não
   reescreve o programa.

## Identidade visual

| Papel | Cor |
|---|---|
| Fundo | `#0D1520` |
| Cartão | `#15202E` |
| Elevado | `#1C2A3B` |
| Borda | `#26374C` |
| Texto | `#E9EFF6` |
| Secundário | `#8DA0B8` |
| Apagado | `#48607C` |
| Âmbar (acento) | `#F5A83C` |
| Laranja (só alertas) | `#E8734A` |

Archivo para títulos e corpo, IBM Plex Mono para números e rótulos. Número é
sempre monoespaçado.

## Arquitetura

CSS e JS inline em `index.html`. Render é baseado em string: `render()` reescreve
o `innerHTML` de `#app` e despacha para a tela certa conforme o estado de `view`.

- `PLAN` — os 6 treinos (A–F) e seus 41 exercícios
- `ALT` — substitutos por padrão de movimento, indexados por nome do exercício
- `RULES` — conteúdo da aba de execução
- `DORES`, `PRIO`, `MODAIS` — vocabulários fixos
- `S` — estado persistido
- `view` — estado de interface, não persistido

### Estado persistido

Chave única `treino-eduardo-v1`.

```js
S = {
  logs: {
    // 'A0' = treino A, exercício 0. 'A0~Nome' = substituto daquele exercício.
    // Carga de substituto nunca entra no histórico do original.
    'A0': [{
      t: 1712345678901,       // timestamp
      sid: 1712345678901,     // sessão a que pertence, ausente em dado antigo
      sets: [[peso, reps]],   // em exercício por tempo, [carga, segundos]
      u: 'seg',               // opcional, marca exercício por tempo
      obs: 'texto',           // opcional
      dor: ['cotovelo'],      // opcional: cotovelo | ombro | patelar
      dl: 1,                  // opcional, sessão feita em modo deload
      aq: 1                   // opcional, aquecimento marcado
    }]
  },
  done: [{ day: 'A', t: 0, sid: 0, dur: 0, dl: 1, retro: 1 }],
  //   sid     liga a marca às entradas de logs da mesma sessão
  //   dur     duração líquida em ms, já sem as pausas
  //   ini     'manual' se você tocou em iniciar, 'auto' se nasceu na 1ª série
  //   fim     'manual' se você encerrou, 'auto' se o app fechou sozinho
  //   pausado ms de pausa, quando houve
  //   pulados exercícios que você decidiu pular
  //   hora    1 quando o horário foi informado num lançamento retroativo
  //   dl      exclui da conta das 48 sessões
  //   retro   registrado depois, em data passada
  // Sessão avulsa (fora do plano) não tem `day` e traz:
  //   livre: 1, grupos: ['peito','tríceps'], nome: 'treino no hotel'
  deload: false,
  draft: null,                          // buffer de digitação da sessão aberta
  sessao: null,                         // sessão aberta, ou null:
  //   { day, inicio, ultima, sid, manual, pausadoEm, pausas: [{de,ate}], pulados: ['A2'] }
  cardio: [{ t: 0, m: 'bike', min: 20, i: 'leve' }],
  body: { peso: [{ t: 0, v: 73.4 }], cintura: [{ t: 0, v: 80.5 }] },
  carga: { 'A1': 'lado' },              // correção do tipo de carga por exercício
  export: 0                             // timestamp do último backup
}
```

Campos novos entram sempre como opcionais e recebem padrão em `load()`. Nenhuma
migração destrutiva foi necessária até hoje.

### Camada de storage

`DB` expõe `get`, `set` e `delete` assíncronos com cascata
`window.storage` → `localStorage` → memória. Toda escrita é espelhada no
`localStorage`, e se o host vier vazio mas houver espelho, o histórico é
resgatado dele. Trocar de ambiente não zera nada.

### Registro contínuo

**Não existe botão de salvar e não existe estado "não salvo".** O rascunho
(`S.draft`) continua sendo o buffer de digitação, e cada série com carga e
repetição preenchidas é projetada imediatamente para `S.logs` pela função
`projeta()`. Apagar o campo remove a série do histórico.

A sessão nasce na primeira série completa (`abreSessao`) e se encerra sozinha
(`encerraSePreciso`) após 4 horas de inatividade ou na virada do dia. O
encerramento grava a duração e avança a rotação — as duas coisas que o botão de
salvar fazia.

`historico(key)` devolve as entradas de um exercício **excluindo a sessão
aberta**. É o que impede a sessão em andamento de virar referência de si mesma
no placeholder, no selo de subir carga e na linha de última vez.

`hidrataDraft(dia)` reconstrói o rascunho a partir do que a sessão aberta já
registrou. É obrigatório: o rascunho é zerado ao trocar de dia na rotação, e sem
a reidratação os campos ficariam em branco com as séries já gravadas — e digitar
por cima apagaria o resto, porque `projeta()` reescreve o conjunto inteiro a
partir do rascunho.

### Ciclo da sessão

Salvar e encerrar são coisas diferentes, e a distinção é o que sustenta o
desenho. **Salvar era pré-condição**: sem clicar, o dado não existia. **Encerrar
não é pré-condição de nada** — as séries já estão gravadas desde a digitação. O
botão só acrescenta precisão à duração. Esquecer custa precisão, nunca dado.

- **Iniciar** é opcional e marca o tempo antes do aquecimento. Sem ele, a
  primeira série completa abre a sessão como sempre.
- **Pausar** para o relógio, não a sessão. Digitar uma série retoma sozinho —
  digitar é prova de que voltou. Sessão pausada não morre por inatividade, só na
  virada do dia.
- **Finalizar** grava o tempo até o toque (`fim: 'manual'`). Sem ele, o app fecha
  por inatividade e o tempo vai até a última série (`fim: 'auto'`), que é o melhor
  palpite quando ninguém disse "acabei". O detalhe da sessão diz qual dos dois foi.

### Horário

`done[].t` é o instante em que a sessão abriu, então o horário do treino sai de
graça — do toque em iniciar, ou da primeira série quando não houve toque. O fim
é derivado somando a duração e as pausas.

**O app não inventa horário.** Lançamento retroativo tem um campo opcional de
hora; em branco, `t` guarda um valor neutro só para ordenar e `temHora()` devolve
falso, então nada de horário aparece na interface. Sem isso, um 07:00 chutado
apareceria como se tivesse sido medido, e contaminaria a média do mês.

O acompanhamento mostra o horário típico do mês com o mais cedo e o mais tarde —
o número que responde "normalmente é 6h15, mas não é exato".

### Os quatro estados de um exercício

| Estado | O que é | Como o app sabe |
|---|---|---|
| **feito** | Todas as séries prescritas | entrada com séries completas |
| **parcial** | Começou e não terminou | entrada com menos séries |
| **pulado** | Você disse não. É decisão | está em `sessao.pulados` |
| **não feito** | Zero séries, nenhuma decisão. É omissão | derivado da ausência |

**Só a decisão é gravada; a omissão é derivada.** Pular não cria entrada no
histórico daquele exercício — ele aparece na sessão, não na linha do tempo do
supino. Ao finalizar, a confirmação avisa sobre parcial e não feito; **pulado não
gera aviso**, porque perguntar de novo seria o app duvidando de você.

### Cardio

Ele está em superávit: o cardio existe por saúde cardiovascular, capacidade de
trabalho e apetite. **Nada na interface fala em caloria, gasto ou queima, e não
há opção de HIIT** — a justificativa do HIIT é eficiência de queima, que não é
objetivo aqui, e o custo é fadiga competindo com os treinos de perna.

Como é obrigação semanal e fácil de esquecer, o placar fica na tela de hoje, com
registro rápido no lugar. O aviso de treino de perna no mesmo dia aparece na hora
de registrar — sinaliza, nunca bloqueia.

No histórico, cardio é marcado por uma **barra fina** embaixo da célula, na faixa
da semana e no calendário. Barra em vez de letra ou cor de fundo porque a letra do
treino manda na célula; o cardio é informação secundária e não pode competir com
ela. Dia só de cardio fica marcado sem virar dia treinado.

### Registro retroativo

"Treinei ontem e não abri o app." Dois casos, e eles são diferentes de propósito:

- **Treino do plano.** Escolhe a data e a letra. Pode parar aí, ou abrir a
  sessão retroativa e preencher os exercícios — as entradas levam a data do
  treino, não a hora do toque. A sessão retroativa fecha por inatividade real ou
  na virada do dia de uso, nunca pela data do treino.
- **Treino avulso** (`livre: 1`). Só grupos musculares, nome opcional e duração.
  Conta como dia treinado no calendário e na média semanal, mas **não move a
  rotação nem entra na conta das 48 sessões** — é presença, não é o programa. O
  painel de séries por músculo avisa quando existem avulsos no período, para o
  número não parecer completo quando não é.

Entradas: tocar num dia vazio do calendário ou da faixa da semana, ou o botão no
acompanhamento. Abrir o preenchimento retroativo com um treino em andamento
fecha o de hoje antes, gravando a duração dele.

### Tipo de carga

"Esse peso que anotei é de um lado ou dos dois?" A ambiguidade é propriedade do
**equipamento**, não da série, então se declara uma vez por exercício em `car`
e o app lembra para sempre. `S.carga` guarda a correção quando o padrão erra.

| Tipo | O número significa | Mostra o total |
|---|---|---|
| `pino` | a carga selecionada na placa. Aparece como "placa" na interface | não |
| `lado` | o que tem de um lado, sem a barra | sim, em anilhas |
| `halter` | o peso de um halter, com um em cada mão. Campo rotulado `kg/lado` | sim, nas duas mãos |
| `halter1` | o peso do halter, quando é um só. Campo rotulado `kg` | não |
| `corpo` | o que foi acrescentado ao peso do corpo; pode ficar vazio | não |
| `assist` | o contrapeso que ajuda | não |

**O app nunca converte: guarda exatamente o que foi digitado.** Converter seria
mentira — barra olímpica tem 20 kg, a W tem 10, e articulada tem alavanca
própria. O total em anilhas é só exibição, sempre `2 ×` o lado e nunca somando a
barra. Volume só é comparado dentro do mesmo exercício, então a unidade não
precisa ser homogênea entre exercícios.

Em `corpo`, quem progride é a repetição: o gráfico plota repetições como série
principal e a carga adicionada como secundária, do mesmo jeito que o exercício
por tempo faz com segundos.

### Detalhes que parecem bugs mas são propositais

- O cronômetro guarda o **instante** em que o descanso acaba, não um contador.
  O iOS suspende o JavaScript com a tela apagada; com contador, congelava.
- Os campos numéricos são `type="text"` com `inputmode`. `type="number"`
  descarta vírgula, e no teclado pt-BR "22,5" chegava como string vazia.
- `topReps()` não pode se chamar `top()`: `window.top` é read-only no escopo
  global de um documento e o script inteiro morria antes de rodar.
- Séries por músculo comparam a semana corrente com o **mesmo ponto** das
  semanas anteriores. Contra semanas cheias, toda terça-feira o painel inteiro
  apareceria despencando.
- O acompanhamento mostra **média móvel de treinos por semana**, não sequência
  de dias. Quem treina 5 a 6 vezes por semana quebra sequência todo domingo, e o
  número viraria cobrança em vez de informação.
- Peso e cintura mantêm um toque para registrar. Uma série tem dois campos que
  se validam mutuamente; um campo numérico solto não tem isso, e sair do campo
  com "7" digitado por engano viraria 7 kg no histórico corporal.

## Rodar

Abrir `index.html` no navegador. Não há passo de build.

Para testar o service worker é preciso `https` ou `localhost`:

```
npx serve .
```

## O programa por escrito

[TREINO.md](TREINO.md) tem o programa inteiro: os seis treinos com séries, faixa
de repetição, tipo de carga, dica de execução e substituições de cada exercício,
mais as regras de execução, o cardio e as regras de ajuste da dieta.

**É gerado a partir do `PLAN` do próprio app**, então não tem como divergir. Ao
mexer no plano, rode `npm run treino` para refazer.

[ANALISE-VOLUME.md](ANALISE-VOLUME.md) responde a outra pergunta: não *quantas*
séries, mas **quais**. Composição de cada músculo por treino e exercício,
agrupada pela hierarquia de prioridade, com aviso de exercício repetido em mais
de um treino. `npm run volume` refaz.

## Testes

```
npm install     # uma vez; instala só o jsdom, e só para os testes
npm test
```

80 testes em `tests/`, com o runner nativo do Node. **O app continua sem
dependência nenhuma** — o jsdom vive fora dele.

`tests/harness.js` sobe o `index.html` num DOM de mentira e expõe `E()` para
avaliar expressões dentro do escopo do app, que é como se chega em `S`, `view` e
nas funções internas. Áudio, wake lock e vibração entram como dublês, e o que
eles registram é observável.

| Arquivo | Cobre |
|---|---|
| `sessao.test.js` | Registro contínuo, abertura e encerramento automático, duração, hidratação do rascunho, deload |
| `retro.test.js` | Lançamento em data passada, do plano e avulso, e o encerramento do treino de hoje |
| `carga.test.js` | Os seis tipos, total exibido, peso do corpo, correção persistida |
| `corpo.test.js` | As três regras de ajuste nos limites exatos, médias semanais, cardio |
| `dados.test.js` | Migração de formatos antigos, exportar e reimportar, histórico não truncado |
| `cronometro.test.js` | Instante-alvo, tela apagada, aviso único, wake lock, bi-set |
| `telas.test.js` | Regras inegociáveis, as quatro abas, avisos de dor e pausa, correção de sessão |

Os testes existem porque três bugs sérios apareceram por acidente, testando
outra coisa — entre eles um que apagava séries já registradas. Cada regressão
encontrada virou um teste com o nome do que ela quebrava.

## Publicar

Ver [COMO-PUBLICAR.md](COMO-PUBLICAR.md). Resumo: arrastar a pasta em qualquer
hospedagem estática, abrir no Safari, Adicionar à Tela de Início.

Ao publicar versão nova, subir o número de `CACHE` em `sw.js`. Isso importa
menos do que parece: o service worker já busca o `index.html` da rede primeiro e
só cai no cache sem sinal, então o app se atualiza sozinho. O número do cache
governa ícones e manifest.

## Dados e backup

O histórico mora no navegador do aparelho. A aba **dados** exporta e importa
tudo em JSON, e o app cobra um backup a cada 30 dias.

Não há servidor e não há sincronização. Foi decisão consciente: um usuário, um
escritor, dados minúsculos, offline obrigatório. Nesse perfil, um banco remoto
adiciona dependência de rede a um fluxo que hoje não tem nenhuma.

## Estado do roadmap

[DIAGNOSTICO-fluxo-ponta-a-ponta.md](DIAGNOSTICO-fluxo-ponta-a-ponta.md) tem o
fluxo mapeado ponta a ponta e o roadmap priorizado. P0, P1 e P2 concluídos.
