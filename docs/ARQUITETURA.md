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
- [Fotos: as do aparelho e as do corpo](#fotos-as-do-aparelho-e-as-do-corpo)
- [Registro contínuo](#registro-contínuo)
- [Ciclo da sessão](#ciclo-da-sessão)
- [Tipo de carga](#tipo-de-carga)
- [Séries por músculo](#séries-por-músculo)
- [Detalhes que parecem bugs](#detalhes-que-parecem-bugs)

---

## Forma do projeto

Fonte em módulos, build com Vite, saída em `dist/`: um HTML, um JS, um CSS e os
ícones. Preact para a interface — 4 kB de runtime.

Foi um HTML único de 5.279 linhas com CSS e JS inline, e a escolha tinha razões
boas: um usuário, offline obrigatório, e o app precisa abrir em menos de um
segundo às 6h15 no subsolo de uma academia. **Essas razões continuam valendo, e
nenhuma delas exigia arquivo único.** O que elas exigem é *um artefato estático
sem dependência de rede em runtime*, e isso o build entrega igual.

O que o arquivo único cobrava em troca:

- 452 funções num escopo só, alcançáveis só por `grep`.
- Nada importável: todo teste subia um jsdom sobre o app inteiro. Checar um
  limite de dieta custava o mesmo que checar uma tela.
- O formato do estado — com cadeia de migrações e vinte campos opcionais — só
  existia escrito neste documento.
- `render()` reescrevendo `innerHTML` a cada mudança, com o valor dos campos
  vivendo só no DOM. Foi daí que saíram dois bugs que apagaram série registrada.

### As três camadas de hoje

| | |
|---|---|
| `src/dominio/` | As regras. Não leem estado global, não tocam em DOM, são tipadas. Recebem dado e devolvem decisão. |
| `src/main.jsx` | O casco: estado `S`, roteamento por `view`, e os adaptadores finos que entregam o estado ao domínio. Encolhe a cada tela convertida. |
| `src/ui/` | Componentes Preact. |

Os adaptadores no casco existem de propósito: `seriesPorMusculo(de, ate)` no
casco chama `seriesPorMusculo(S.logs, grupoDe, de, ate)` no domínio. Mantêm o
nome e a aridade que o resto do app já usava, o que permitiu extrair o domínio
inteiro sem reescrever chamada nenhuma.

### A migração do render, concluída

A conversão para componente foi tela por tela. Durante a travessia, o que ainda
produzia string entrava por um `<Bruto html={...}>`, que montava o HTML e
deixava os `onclick=` inline funcionando. **Não sobrou nenhuma ocorrência** — e
com a última saíram as muletas que ela sustentava:

- `HANDLERS_INLINE`, que republicava 90 funções em `window` porque atributo
  `onclick` só enxerga o escopo global.
- `minify` e `treeshake`, que ficaram desligados enquanto essas funções eram
  alcançadas por string e o bundler não as enxergava. **Religar as duas era o
  sinal combinado de que a fase tinha acabado**, e é o estado de hoje em
  `vite.config.js`.

Religar o `treeshake` cobrou o preço na hora, e de graça: função só alcançada
por string some do bundle e o teste quebra na mesma rodada. Foi assim que
`tab()` apareceu — rota paralela a `view.aba`, viva só porque a ponte de
handlers a republicava em `window`.

O cartão de exercício foi convertido primeiro, de propósito: é a única parte da
tela com campo de digitação, e era ali que o `innerHTML` inteiro era reescrito.
Hoje o Preact toca só no atributo que mudou — abrir outro exercício ou marcar
dor não reconstrói mais os campos, e não há foco para devolver.

**A muleta que ficou** é uma só: `window.__escopo`, um `eval` que dá aos testes
de fluxo o alcance ao escopo do módulo que `window.eval` dava de graça quando
tudo era global. Ela também é o que segura os nomes de pé sob o minificador —
esbuild vê o `eval` direto e desiste de renomear o escopo inteiro. Duas
consequências para quem for mexer:

- O que os testes alcançam por nome (`S`, `view`, `render()`, `reconciliaCorpo()`)
  são as declarações de topo de `main.jsx`. Um `import * as X` **não** vira
  binding de topo no bundle: `CORPO.poda(...)` não existe para o `__escopo`, e o
  teste que precisa disso vai pelo caminho que o app usa.
- Enquanto ela existir, o build não é minificável de verdade em nomes. Tirá-la
  exige dar aos testes de fluxo outra porta para o escopo do módulo.

**Constantes principais** (em `src/dominio/programa.ts`):

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

Chave única `lastro-v1` no storage.

Ela já se chamou `treino-eduardo-v1`, de quando o produto se chamava "Treino".
A troca não é um replace: no boot, se a chave velha ainda estiver no aparelho,
o estado dela é **fundido** com o da nova por `funde()` — a mesma da
sincronização, com as mesmas lápides e a mesma chave natural por registro — e a
velha só é apagada depois de a gravação da nova dar certo.

Fundir em vez de copiar existe por uma janela concreta: publicada a versão
nova, o iPhone ainda serve o build antigo por uma ou duas aberturas, e uma
série registrada nessa janela cai na chave VELHA depois de a nova já existir.
Por isso a pergunta no boot é *"a chave velha existe?"*, e nunca *"eu já
migrei?"* — se o build antigo rodar de novo, a migração roda de novo. E por
isso `wipe()` apaga as duas: deixar a velha para trás faria o boot do dia
seguinte ressuscitar o histórico que ele acabou de mandar apagar.

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

  fotos: { 'pendulum-squat': { v: 0, ext: 'webp' } },   // REFERÊNCIA, nunca bytes
  protocolo: {                          // as fotos de acompanhamento
    poses: null,                        // a ordem dele; null = a do código
    sessoes: [{ d: '2026-09-01', t: 0, m: 0, obs: '',
                // `enq` é o ajuste NÃO DESTRUTIVO; ausente = a foto como saiu
                fotos: { 'frente-relaxado': { v: 0, ext: 'webp',
                                              enq: { r: 0, z: 1, cx: .5, cy: .5, m: 0 } } } }]
  },

  export: 0,                            // timestamp do último backup
  plano: 3                              // versão do formato
}
```

O formato acima é o tipo `Estado` em [src/dominio/tipos.ts](../src/dominio/tipos.ts),
verificado pelo compilador. Antes ele só existia escrito aqui.

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

### Renomear sem perder o histórico

O id nasce do nome por `slugEx`, mas **só uma vez**. Depois disso ele é
identidade, não rótulo — e é isso que torna o rename trivial: gravar `n` em
`S.ex[id]` sobrepõe o nome pelo `montaCatalogo()`, que mescla o catálogo do
usuário por cima do `EX_BASE` na mesma chave. Histórico, prescrição no programa,
foto do aparelho e correção de tipo de carga apontam todos para o id: **nada se
move.**

Recalcular o id a partir do nome novo seria o oposto: criaria um exercício vazio
e deixaria o passado órfão sob uma chave sem dono. É o mesmo erro que a migração
2→3 existiu para consertar, quando a chave era dia+posição.

O id fica com o slug do nome ANTIGO para sempre, e isso está certo: ninguém o lê.
Voltar ao nome do código **apaga** o override em vez de gravar uma cópia — o
estado não guarda o que já está no código.

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

**4 → 5** (`migraPlano5`) — as letras D e E trocam de lugar.

A SEQUÊNCIA dos treinos não mudou e não pode mudar: o grande treino de torso
vem antes do dia de ombros e braços, porque puxar e empurrar pesado no dia
seguinte a um treino de deltoide e bíceps é puxar com o músculo já queimado.
O que mudou foi o RÓTULO — até aqui a sequência era escrita como A B C E D F,
com o E fora de ordem, e isso parecia erro toda vez que a tela abria.

Trocar rótulo é migração de dado, não cosmética: toda sessão registrada guarda
a letra em `done[].day`. Sem a migração, cada treino de ombros do histórico
passaria a se chamar "espessura de costas", e o app estaria mentindo sobre
meses de registro. A troca alcança `done`, `prog`, `rot`, `sessao`, `draft`,
`mods` e `progLog` — tudo que guarda letra. `logs` e `carga` não entram: são
indexados por exercício, e essa é justamente a vantagem de indexar assim.

A troca é **involução**: aplicá-la duas vezes desfaz. O guarda de versão é a
única coisa entre isso e um histórico embaralhado.

Pelo mesmo motivo, a 2 → 3 semeia `S.prog` e `S.rot` com a rotulagem **da
época**, não com a de hoje. Se semeasse com as letras atuais, a 4 → 5 rodaria
em seguida e trocaria de novo. A regra que sai daqui vale para toda migração
futura: **cada uma devolve o estado como ele era naquela versão**, nunca como
ele é hoje. `semeiaProg()` e `ROT_BASE` são código de hoje, e usá-los dentro
de uma migração antiga é a armadilha que apareceu duas vezes nesta — no
`porPosicao` e na semeadura.

A revisão de agosto de 2026 cobrou essa regra pela terceira vez. A 2 → 3 lia o
`PROGRAMA` importado para saber que exercício ocupava cada posição antiga;
funcionava só enquanto o programa vivo fosse o mesmo daquela era. Quando o
treinador trocou a prescrição, ler um backup plano ≤ 2 contra o programa novo
mapearia meses de histórico para os exercícios errados. O programa daquela era
está congelado em `PROGRAMA_PLANO_3` e `ROT_PLANO_3`, dentro de
`migracoes.ts`, ao lado de `PLANO_1` — **migração lê dado congelado, nunca o
código de hoje**.

Trocar o programa é edição, não migração. Mudar o `PROGRAMA` só muda a semente,
o alvo de comparação do volume e o que o botão de restaurar devolve; quem já
tem `S.prog` não é afetado até tocar em restaurar. O que a troca de 2026 exigiu
além disso foi o `LEGADO`: exercício que sai do programa some do catálogo e o
histórico dele vira exercício fantasma, com o slug cru no lugar do nome. O
`LEGADO` os mantém nomeados, com o grupo muscular certo, e `sub:1` em vez de
`arq:1` para continuarem disponíveis nas listas de troca.

---

## Camada de storage

`DB` expõe `get`, `set` e `delete` assíncronos com cascata
`window.storage` → `localStorage` → memória. Toda escrita é espelhada no
`localStorage`, e se o host vier vazio mas houver espelho, o histórico é
recuperado dele.

O modo `mem` não é decoração: Safari em navegação privada e `file://` travado
recusam `localStorage`, e nesses casos o app tem que continuar funcionando até
o fim da sessão em vez de morrer no boot.

**Abrir o `index.html` direto por `file://` deixou de funcionar** com a
mudança para módulos ES — o navegador recusa módulo por `file://`. Era uma
propriedade real do arquivo único e foi perdida de propósito, porque o caminho
de uso é o ícone na tela de início do iPhone. Para conferir localmente,
`npm run preview`.

---

## Fotos: as do aparelho e as do corpo

São dois sistemas, e a única coisa que eles compartilham é a regra que os
define: **o byte nunca entra no estado.**

O estado é reserializado inteiro a cada série registrada e enviado inteiro a
cada sincronização, e o teto do Safari para esse armazenamento é de 5 MiB. No
estado fica a **referência** — `{ v, ext }`, onde `v` é o instante da captura e
serve de versão. Os bytes ficam no Cache Storage, e replicam por um bucket
privado do Supabase.

`v` na chave não é enfeite: refazer uma foto tem que trocar a imagem na tela, e
com chave sem versão o endereço de objeto antigo continuaria válido.

| | aparelho | corpo |
|---|---|---|
| responde | qual das três puxadas desta academia o treinador quis dizer | está funcionando? |
| onde | `src/infra/fotos.ts`, `S.fotos` | `src/infra/corpo.ts`, `S.protocolo` |
| quantas | umas 40, para sempre | 9 por sessão, a cada 14 dias |
| lado maior | 1080 px — é uma miniatura de 350 px | 1440 px — é olhada em tela cheia ao lado de outra |
| cache | `lastro-fotos` | `lastro-corpo` |
| bucket | `aparelhos` | `corpo` |
| quem é a fonte | **o aparelho**; o bucket é seguro contra troca de celular | **o bucket**; o aparelho é cache de verdade |

A última linha é a diferença que importa. Foto de aparelho cabe no aparelho e
fica lá. Foto de corpo são uns 35 MB no primeiro ano, num Cache Storage que o
iOS despeja sob pressão de disco — então o aparelho guarda só as
`SESSOES_NO_APARELHO` sessões mais recentes e **poda** o resto; abrir uma sessão
antiga busca os bytes de volta (`garanteBytesDoCorpo`).

**A poda é a parte perigosa do app.** É o único lugar que apaga byte de foto por
conta própria, e o erro que ela pode cometer não tem desfazer: apagar daqui o
que ainda não subiu para lá. Duas travas, e as duas são deliberadas:

- `CORPO.poda(manter)` recebe a lista do que **fica**, em vez de calculá-la.
  Quem sabe o que já subiu é o casco. A poda é burra de propósito.
- `reconciliaCorpo()` só a chama depois de **todas** as fotos estarem
  confirmadas no bucket. Uma foto que não subiu segura o cache inteiro por um
  ciclo, e é exatamente isso que se quer.

Subir é obrigação — enquanto um byte só existe aqui, ele está a um despejo de
cache de sumir. Baixar é sob demanda: puxar o histórico inteiro na primeira
sincronização de um aparelho novo seriam dezenas de megabytes pelo sinal da
academia.

Os dois buckets são **privados**, e as políticas estão em
[supabase/schema.sql](../supabase/schema.sql). A chave anônima é pública por
design e vai no bundle; quem protege é o RLS. O primeiro segmento do caminho é
sempre o uid do dono — `uid/pendulum-squat.webp` e
`uid/2026-09-01/frente-relaxado.webp` — e é isso que torna a política suficiente
e o nome do arquivo dispensável de ser secreto. Bucket público serviria qualquer
arquivo a quem adivinhasse o caminho, e o caminho é adivinhável: um id de
exercício, ou uma data mais um nome de pose vindo de um conjunto fechado que
está no bundle.

São dois buckets e não duas pastas porque um bucket é a unidade que o painel do
Supabase apaga, exporta e mede de uma vez. Foto de aparelho é a placa de uma
máquina; foto de corpo é o corpo dele em roupa justa.

### O protocolo

`src/dominio/protocolo.ts`. Mesmo desenho do programa de treino, pelo mesmo
motivo: **`PROTOCOLO` é a prescrição congelada no código e `S.protocolo.poses` é
a versão dele.** Trocar o conjunto é edição, nunca migração. `poses: null`
significa "a do código".

O que a foto exige do app não é uma média — é **comparabilidade**. Duas fotos só
se comparam quando a pose e a geometria da câmera são as mesmas. A geometria o
app não alcança: ela mora nas marcas de fita no chão, e é o que a tela de
montagem manda congelar. A pose ele alcança, e é o que o módulo garante — nove
poses, sempre na mesma ordem, e a foto anterior à vista na hora de disparar a
próxima. Enquadrar contra a anterior evita o desvio; alinhar depois só o
conserta, e mal.

A ordem das nove **não é agrupada por assunto** — é uma rotação contínua
0° → 90° → 180° → 270°. Ele gira sempre para o mesmo lado sem sair da marca, e a
sessão sai em menos de cinco minutos. Agrupar por bloco seria mais bonito de ler
e o faria girar seis vezes.

Três decisões que valem registrar:

- **A chave da sessão é a DATA**, não um id sorteado. É a chave natural do
  protocolo — duas sessões no mesmo dia não existem — e é o que faz a fusão
  convergir sem sorteio.
- **A sessão nasce na primeira foto** e não sobrevive à última, igual à sessão
  de treino. Não há botão de salvar e não há o que confirmar.
- **O par padrão da comparação é a mais nova contra a MAIS ANTIGA**, nunca
  contra a anterior. Entre duas sessões seguidas a diferença é quase toda água,
  sono e horário — e é assim que se desiste de um plano que estava funcionando.

Peso e cintura ao lado da foto são **média da semana** e saem de `S.body`: a
sessão de fotos não pede número nenhum. O protocolo manda fotografar de manhã em
jejum, que é o mesmo momento da pesagem.

### O enquadramento ajustado

`src/dominio/enquadramento.ts`. Endireitar e reenquadrar uma foto depois de
tirada — **giro pequeno e recorte, e mais nada**. Não há brilho, contraste nem
filtro: qualquer um dos três mudaria a aparência do corpo, e a foto passaria a
medir a edição em vez do corpo. Giro e recorte movem o enquadramento sem tocar
no que está dentro dele.

**Não destrutivo, e isso é a decisão que importa.** O ajuste é DADO
(`FotoRef.enq`), não pixel: os bytes no cache e no bucket continuam sendo os que
saíram da câmera, e o `transform` é aplicado na hora de desenhar. Três coisas
caem daí — editar é de graça e funciona sem rede, porque não há byte para subir;
reeditar não acumula perda de recompressão, e uma foto é reeditada justamente
quando a série cresce e o enquadramento antigo passa a destoar; e desfazer é
voltar para a identidade, sempre. Ajuste que é a identidade **sai** do estado em
vez de virar um objeto de zeros.

O giro é limitado a **6°**, e o limite baixo é deliberado. Endireitar um celular
torto custa menos de 3°; além disso não se está corrigindo a câmera e sim
recompondo a foto, que é o que destrói a comparabilidade. O limite também segura
o preço: girar sem abrir borda vazia obriga a aproximar, e o mínimo é

```
z = cos θ + max(a, 1/a) · sen θ
```

que a 6° num quadro 3:4 dá 1,13 — treze por cento do lado somem. `normaliza()`
sobe o zoom sozinho quando o giro passa a exigir mais, e prende o centro do
recorte dentro da foto. Tudo que entra passa por lá: o editor, o que veio do
outro aparelho e o de um backup antigo. **Ajuste impossível não vira erro, vira o
ajuste possível mais próximo** — e por isso não há passe de saneamento no boot.

Quem desenha é `<FotoAjustada>`, e **todas** as fotos passam por ele: a de hoje,
a referência da captura, os dois lados da comparação e as duas camadas da
sobreposição. Não é arrumação, é requisito — duas implementações da mesma conta
divergiriam, e a divergência apareceria na tela como uma diferença no corpo que
não existe.

A tela de ajuste abre com o **fantasma** de outra sessão por cima, já ligado.
Endireitar contra a borda do quadro conserta o horizonte; alinhar contra outra
foto conserta a COMPARAÇÃO, que é o que se quer.

Contra QUAL sessão alinhar é escolha dele: o seletor oferece todas as outras que
têm aquela pose. O padrão é `vizinhaComAPose()` — a anterior, porque alinhar
contra o passado é o que mantém a série coerente; e a SEGUINTE quando não há
anterior, senão a sessão mais antiga, justamente a que ancora o resto, seria a
única sem nada contra o que se alinhar. O padrão acerta quase sempre, mas quando
uma sessão antiga tem a geometria boa é contra ela que se quer alinhar as
outras, e isso o app não tem como saber.

### A câmera de dentro do app

`src/infra/camera.ts` e a tela `ui/telas/camera.jsx`. Dois caminhos de captura
convivem, e a diferença entre eles é **corrigir contra prevenir**:

| | `<input capture>` | `getUserMedia` |
|---|---|---|
| qualidade | a melhor que o aparelho sabe — HDR, fusão de exposições | quadro de vídeo, menos resolução |
| durante a captura | o app **não existe** | o app desenha por cima |
| alinhar antes | impossível | é o motivo de existir |

O `<input capture>` é cego: entre apertar e receber o arquivo o app sai do ar, e
por isso não há como pôr a foto anterior por cima na hora de enquadrar. A câmera
interna compra isso pagando resolução. **Para foto de acompanhamento a troca
vale**, porque o que ela mede é a silhueta e não a textura da pele — e nenhum
recorte posterior devolve o pé que saiu do quadro. Os dois ficam na tela; o do
sistema também é o que atende quando `getUserMedia` não está disponível, e
`temCamera()` decide qual é o principal.

Duas coisas fazem a tela funcionar, e as duas vêm de ele estar sozinho a três
metros do celular. O **temporizador** não é conveniência: a três metros ninguém
alcança o botão, e sem contagem a tela seria bonita e inútil. Ele conta com um
bipe por segundo, agudo no último — a três metros o ouvido é o único canal que
chega, porque a tela não se lê. E a sessão **continua dentro da câmera**: depois
do disparo ela avança para a próxima pose e troca a sobreposta sozinha, porque
sair e voltar nove vezes seria pior que o problema que a tela resolve.

O quadro do preview é 3:4 com `object-fit: cover`, o **mesmo** das fotos
guardadas. É o que faz o que se enquadra ser o que se grava: o vídeo é cortado
igual na exibição e na captura.

`CAM.fecha()` em toda saída não é higiene, é obrigação — faixa viva mantém o
indicador do iOS aceso e a câmera consumindo com o app fora da frente. O teste
de fluxo conta as faixas para provar que nenhuma sobra.

A captura vai direto do `<video>` para `reduzPara()`, que passou a aceitar
`ImageBitmapSource` em vez de só `Blob`: evita uma codificação a mais só para
virar arquivo, e mantém **um** caminho de redução para as duas câmeras.
`guardaFotoDaPose()` é o resto compartilhado — reduzir, guardar, lapidar a
anterior, avançar —, e ter um lugar só é o que impede as duas de divergirem no
que gravam.

### Fundir sessões de foto

`uneSessoesDeFoto()`, em `src/dominio/sincronia.ts`, não reusa `uneLista()`. Com
a mesma data nos dois lados, vencer pelo carimbo descartaria as poses que só
existem do outro — e o caso é real: a sessão é longa, e nada impede que quatro
poses saiam num aparelho e as outras cinco no outro. Então **a data une a sessão
e, dentro dela, cada pose une pela própria versão.**

Por isso há duas lápides, e não uma: `corpo:<data>` para a sessão e
`corpo:<data>:<pose>` para a foto. Refazer uma pose apaga a anterior, e sem a
lápide da foto o outro aparelho a traria de volta na fusão — a sessão continuaria
existindo, então a lápide da sessão não a alcançaria.

O **ajuste** precisa de um desempate próprio dentro disso. Recortar não gera
bytes novos e por isso não muda `v`: os dois lados continuam com a mesma foto, e
sem desempate o lado que não foi recortado empataria e o recorte sumiria na
volta. Quando `v` empata, vence o `enq.m` maior. E `resumo.ajustesCorpo` conta os
recortes que só existem deste lado — é o que obriga a empurrar depois de uma
fusão que, no resto, não trouxe nada. Refazer a foto (um `v` maior) descarta o
recorte junto, que é o certo: ele era do enquadramento velho.

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
- `topReps()` se chama assim porque não podia se chamar `top()`: `window.top` é
  read-only no escopo global de um documento, e o script inteiro morria antes de
  rodar. Em módulo a restrição não existe mais; o nome ficou, e o histórico também.
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
