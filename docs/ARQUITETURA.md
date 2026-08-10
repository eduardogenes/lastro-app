# Arquitetura

Documento para quem for mexer no código — inclusive eu daqui a seis meses.
O [README](../README.md) cobre o uso; aqui está o porquê das decisões.

## Sumário

- [Forma do projeto](#forma-do-projeto)
- [Estado persistido](#estado-persistido)
- [O programa é dado, não código](#o-programa-é-dado-não-código)
- [A chave do histórico é o exercício](#a-chave-do-histórico-é-o-exercício)
- [Editar sem mexer no programa](#editar-sem-mexer-no-programa)
- [Migrações](#migrações)
- [Camada de storage](#camada-de-storage)
- [Registro contínuo](#registro-contínuo)
- [Ciclo da sessão](#ciclo-da-sessão)
- [Tipo de carga](#tipo-de-carga)
- [Séries por músculo](#séries-por-músculo)
- [Detalhes que parecem bugs](#detalhes-que-parecem-bugs)

---

## Forma do projeto

Um arquivo HTML com CSS e JS inline. Sem build, sem dependência externa fora da
fonte do Google. O render é baseado em string: `render()` reescreve o
`innerHTML` de `#app` e despacha para a tela certa conforme `view`.

Isso é uma escolha, não uma limitação aceita. O app tem um usuário, roda offline
por obrigação e precisa abrir em menos de um segundo às 6h15 no subsolo de uma
academia. Framework, bundler e servidor adicionariam dependência de rede e de
toolchain a um fluxo que hoje não tem nenhuma.

**Constantes principais:**

| | |
|---|---|
| `PROGRAMA` | O programa do treinador, congelado. Semente de `S.prog`, alvo de comparação e o que o botão de restaurar devolve. |
| `EX_BASE` | Catálogo que vem do código: os exercícios do `PROGRAMA` mais todos os substitutos de `ALT`. |
| `CAT` | Catálogo efetivo — `EX_BASE` mais `S.ex`, o que ele cadastrou. Remontado por `montaCatalogo()`. |
| `ALT` | Substitutos indicados pelo treinador, com o que muda em cada troca. |
| `ALVO` / `ALVO_TOTAL` | Séries por músculo prescritas pelo treinador. Calculados do `PROGRAMA` no boot, nunca transcritos. |
| `CARGAS` | Os seis tipos de carregamento. |
| `RULES` | Conteúdo da aba de execução. |
| `D_COMPOSTO` … `D_CURTO` | Descanso por categoria, em segundos. |

**Acessores — todo o app lê o programa por aqui, nunca do `PROGRAMA`:**

- `treino(d)` — o treino como aparece na tela: slot resolvido contra o catálogo,
  com os mods de hoje aplicados por cima.
- `rot()` — a rotação, que vem do estado.
- `id(d, i)` — o id do exercício naquela posição.
- `slotDe(d, i)` — o id **original** da posição, mesmo depois de uma troca.

---

## Estado persistido

Chave única `treino-eduardo-v1` no storage.

```js
S = {
  logs: {                               // por ID DE EXERCÍCIO, não por posição
    'chest-press-inclinado-convergente': [{
      t: 0, sid: 0,                     // instante e id da sessão
      sets: [[60, 8], [60, 8], null],   // [carga, reps]; null = série não feita
      sl: 'pendulum-squat',             // posição de origem, se houve troca
      u: 'seg',                         // exercício por tempo
      obs: '', dor: ['cotovelo'],
      dl: 1, aq: 1                      // feito em deload / com aproximação
    }]
  },

  done: [{                              // presença: uma entrada por sessão
    day: 'A', t: 0, sid: 0, dur: 0,
    ini: 'manual', fim: 'auto',         // como começou e terminou
    pausado: 0, pulados: [], hora: 1,
    dl: 1, retro: 1,
    mods: ['Pendulum squat → Agachamento hack'],
    livre: 1, grupos: ['peito'], nome: ''   // sessão avulsa, fora do plano
  }],

  prog: { A: { name, tag, ex: [ { id, s, r, d, desde } ] } },   // o programa dele
  rot: ['A','B','C','E','D','F'],
  ex:  { 'meu-aparelho': { n, g, car, c, cue, meu: 1 } },       // catálogo dele
  mods: { day: 'C', t: 0, list: [] },                           // mudanças de hoje
  progLog: [{ t, day, txt, motivo }],                           // decisões do programa

  sessao: { day, inicio, ultima, sid, manual, pausadoEm, pausas: [], pulados: [] },
  draft: null,                          // buffer de digitação da sessão aberta
  deload: false,
  cardio: [{ t, m: 'bike', min: 25, i: 'moderado' }],
  body: { peso: [{ t, v }], cintura: [{ t, v }] },
  carga: { 'pendulum-squat': 'lado' },  // correção do tipo, por exercício
  export: 0,                            // timestamp do último backup
  plano: 3                              // versão do formato
}
```

Campos novos entram sempre como opcionais e recebem padrão em
`normalizaEstado()`, que roda no boot **e na importação de um backup** — um JSON
de qualquer versão anterior chega às migrações pelo mesmo caminho que o disco.

---

## O programa é dado, não código

Três camadas.

**`PROGRAMA`** é a prescrição do treinador, imutável, no código.

**`S.prog`** é o programa dele, semeado do `PROGRAMA` e editável. Cada posição
de treino é um **slot**:

```js
{ id: 'chest-press-inclinado-convergente', s: 3, r: '6–10', d: 180, desde: 0 }
```

O slot diz **como o exercício está prescrito hoje**; o catálogo diz **o que o
exercício é**. Separar as duas coisas é o que permite ter o mesmo exercício em
dois treinos com prescrições diferentes, e trocar um pelo outro sem perder nada.

`desde` é quando aquele exercício entrou naquela posição — é o que sustenta a
regra do treinador de manter o exercício por 6 a 8 semanas. `desde: 0` significa
que veio do treinador e não conta nessa regra.

**`S.mods`** é a terceira camada: as mudanças do dia. Ver abaixo.

`treino(d)` devolve `S.prog[d]` com os mods aplicados por cima.

---

## A chave do histórico é o exercício

Era dia + posição (`A0`, `B3`). Isso significa que inserir um exercício na
segunda posição do A empurra todos os seguintes, e sete históricos passam a
apontar para o exercício errado. Com o programa editável, aconteceria toda
semana.

`S.logs` é indexado pelo **id do exercício**, derivado do nome uma vez só
(`slugEx`). Reordenar, inserir e remover viram operações inofensivas.

Dois efeitos que vieram de graça:

- **Substituto deixou de ser chave de segunda classe.** O crucifixo inclinado no
  cabo tem id e histórico próprios; usá-lo como substituto hoje e promovê-lo a
  titular no mês que vem não perde nada.
- **Uma entrada é identificada por sessão + posição**, não por sessão + chave. O
  campo `sl` guarda a posição de origem quando ela difere da chave. Sem isso, o
  mesmo aparelho usado em duas posições do mesmo dia colidiria numa entrada só —
  bug real, que existiu e ninguém tinha visto.

`daSessao(key, slot, sid)` é o ponto único que resolve essa identidade.

---

## Editar sem mexer no programa

Máquina quebrada, outra academia, uma série a mais que fez sentido: nem toda
mudança deve virar permanente. As edições do dia entram em `S.mods` como uma
lista de **intenções**, não como uma cópia do dia:

```js
S.mods = { day: 'C', t: 0, list: [
  { k: 'troca', slot: 'pendulum-squat', por: 'agachamento-hack' },
  { k: 'sets',  slot: 'elevacao-lateral-na-maquina', de: 4, para: 5 },
  { k: 'add',   id: 'remada-cavalinho', s: 3, r: '8–12', d: 150, pos: 3, n: 0 },
  { k: 'rm',    slot: 'tibial-anterior' }
]};
```

`slot` é sempre o id **original** da posição, mesmo depois de uma troca — é o
que mantém os mods encadeáveis. `aplicaMods()` resolve, e o slot resultante
carrega `orig` para o caminho de volta.

Guardar intenção e não uma cópia é o que permite a tela de decisão dizer "você
trocou pendulum por hack squat e subiu lateral de 4 para 5", em vez de mostrar
dois blocos de treino e pedir para escolher. Mods do mesmo tipo no mesmo slot se
colapsam, e voltar ao valor original apaga o mod em vez de registrar ida e volta.

`S.mods` vive fora de `S.sessao` para sobreviver a navegar entre os dias no meio
do treino, e morre quando a sessão fecha.

**No fim da sessão**, se houver mods, `renderPromo()` pede a decisão **uma a
uma**, com o impacto no volume ao lado e o padrão em "só hoje". O que for
promovido vai para `S.prog` e para `S.progLog`, com o motivo. Encerramento
automático não promove nada — o caminho de menor esforço é o conservador,
porque o app existe em parte para frear a progressão.

O que mudou no dia fica em `done[].mods` de qualquer forma, tenha virado
permanente ou não: daqui a um mês, "por que o volume desse dia foi outro?" tem
resposta.

**Editar o dia** só está disponível no dia da sessão aberta, ou no próximo da
rotação se não houver sessão. Outro dia é **edição de programa**, direta, pela
tela de programa — onde mexeu, mudou o oficial. As duas telas repetem qual das
duas coisas está acontecendo.

`difDoDia(d)` compara `S.prog[d]` com `PROGRAMA[d]` e devolve as diferenças em
português. Um exercício que sai e outro que entra na mesma posição é lido como
uma troca, não como duas mudanças.

---

## Migrações

`PLANO_ATUAL` governa a versão do formato. As migrações rodam em cadeia no
`load()` e também na importação.

**1 → 2** (`migraPlano`) — troca do programa do treinador. As chaves eram
posicionais, então o exercício novo herdaria a carga do antigo naquela posição.
Cada chave virou `antigo~<nome>`.

**2 → 3** (`migraPlano3`) — reindexação por exercício. Posição vira id;
`A1~Nome` vira o id daquele exercício, guardando a posição em `sl`;
`antigo~Nome` **volta para o histórico ativo** quando o exercício continua no
catálogo, e vira entrada arquivada em `S.ex` quando não. `S.carga` e os
`pulados` acompanham.

Trocar o programa de novo agora é edição, não migração. Mudar o `PROGRAMA` só
muda a semente e o alvo de comparação; quem já tem `S.prog` não é afetado, e o
botão de restaurar é o caminho para adotar a prescrição nova.

---

## Camada de storage

`DB` expõe `get`, `set` e `delete` assíncronos com cascata
`window.storage` → `localStorage` → memória. Toda escrita é espelhada no
`localStorage`, e se o host vier vazio mas houver espelho, o histórico é
recuperado dele. O app funciona abrindo o arquivo direto no navegador.

---

## Registro contínuo

**Não existe botão de salvar.** Cada série completa é projetada em `S.logs`
imediatamente por `projeta()`. O salvamento no storage é debounced em 700 ms.

- `historico(key)` devolve as entradas do exercício **excluindo a sessão
  aberta** — sem isso, a sessão em andamento viraria referência de si mesma e o
  placeholder mostraria o que você acabou de digitar.
- `hidrataDraft(dia)` reconstrói o rascunho a partir do que a sessão já
  registrou. É obrigatório: o rascunho é zerado ao trocar de dia na rotação, e
  sem hidratação os campos voltavam em branco com as séries gravadas — digitar
  por cima apagaria o resto.

Essa fronteira entre rascunho e log já produziu dois bugs que perdiam dados. É a
parte do código que mais merece cuidado.

---

## Ciclo da sessão

A sessão nasce na primeira série completa e se encerra sozinha por inatividade
(4 h) ou na virada do dia. `iniciarSessao` existe para marcar o começo antes do
aquecimento; `pausarSessao` e `retomarSessao` tiram a pausa da conta; digitar
estando pausado retoma sozinho.

`finalizarSessao` grava o tempo exato e marca `fim: 'manual'`. Sem ele, o
encerramento automático usa a última série e marca `fim: 'auto'`, e a interface
mostra a duração como aproximada.

**Quatro estados de um exercício:** feito, parcial, pulado, não feito. Só a
*decisão* de pular é gravada (`sessao.pulados`); a omissão é derivada da
ausência de registro.

---

## Tipo de carga

A ambiguidade "esse peso é de um lado ou dos dois?" é propriedade do
equipamento, não da série. Declara-se uma vez por exercício em `car`, e ele pode
corrigir na hora — a correção fica em `S.carga`, indexada pelo exercício.

Os seis tipos: `pino` (placa), `lado` (anilha por lado), `halter` (um em cada
mão), `halter1` (um só), `corpo` (peso do corpo mais carga), `assist`
(assistido).

**O app nunca converte, só rotula.** Converter seria mentira: barra olímpica tem
20 kg, a W tem 10, e articulada tem alavanca própria. O total exibido em anilhas
é só exibição, e nunca soma o peso da barra.

---

## Séries por músculo

`seriesPorMusculo()` atribui a série ao **exercício registrado**, não à posição
onde ele estava prescrito. Trocar elevação lateral por um aparelho de peito
conta em peito, que é onde o trabalho aconteceu. Substituto, exercício
adicionado no dia e equipamento cadastrado por ele entram pelo mesmo caminho.

`impactoSeries()` mostra o número do dia durante a edição; `impactoOficial()`
mostra o do programa, e aparece na aba corpo quando algum músculo saiu do alvo.

A contagem é de **séries diretas**. Tríceps também trabalha nos supinos, bíceps
nas puxadas, glúteo no terra e no leg press. A interface diz isso, porque
apresentar séries diretas como estímulo total foi a falha metodológica que o
treinador apontou.

---

## Detalhes que parecem bugs

- O cronômetro guarda o **instante** em que o descanso acaba, não um contador.
  O iOS suspende o JavaScript com a tela apagada; com contador, congelava.
- Os campos numéricos são `type="text"` com `inputmode`. `type="number"`
  descarta vírgula, e no teclado pt-BR "22,5" chegava como string vazia.
- `topReps()` não pode se chamar `top()`: `window.top` é read-only no escopo
  global de um documento, e o script inteiro morria antes de rodar.
- O aviso do cronômetro é um beep de Web Audio, não `navigator.vibrate`. Safari
  no iOS não vibra, e o `AudioContext` precisa nascer dentro do gesto do usuário.
- Séries por músculo comparam a semana corrente com o **mesmo ponto** das
  semanas anteriores. Contra semanas cheias, toda terça-feira o painel inteiro
  apareceria despencando.
- O acompanhamento mostra **média móvel de treinos por semana**, não sequência
  de dias. Quem treina 5 a 6 vezes por semana quebra sequência todo domingo, e o
  número viraria cobrança em vez de informação.
- Peso e cintura mantêm um toque para registrar. Uma série tem dois campos que
  se validam mutuamente; um campo numérico solto não tem isso, e sair do campo
  com "7" digitado por engano viraria 7 kg no histórico corporal.
- Os marcadores de período no calendário (☀️ 🌤️ 🌙) são a **única** exceção
  autorizada à regra de não usar emoji. Estão isolados em `PERIODOS` e o teste
  de regressão verifica que não escaparam de lá.
