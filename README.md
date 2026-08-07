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
  //   dur     duração em ms, ausente em sessões anteriores ao registro contínuo
  //   dl      exclui da conta das 48 sessões
  //   retro   registrado depois, em data passada
  // Sessão avulsa (fora do plano) não tem `day` e traz:
  //   livre: 1, grupos: ['peito','tríceps'], nome: 'treino no hotel'
  deload: false,
  draft: null,                          // buffer de digitação da sessão aberta
  sessao: null,                         // { day, inicio, ultima, sid } ou null
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
