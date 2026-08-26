# Lastro

Registro de treino e comida que freia a carga no ritmo que o tendão aguenta.
Um artefato estático, sem dependência de runtime, sem servidor. Funciona offline.

Lastro é o peso que se carrega no fundo do casco para o navio não emborcar. Não
é o que faz andar: é o que impede de tombar, e deixa lento de propósito. É o que
este app faz com a carga — o selo de subir só aparece quando todas as séries
bateram o topo da faixa, e não aparece quando você voltou de duas semanas
parado. A segunda acepção é financeira, e vale onde o app fala de número: moeda
com lastro responde de onde vem o que ela vale, e aqui nada derivável é
digitado. O e1RM sai das cargas, o alvo calórico sai dos alimentos, a lista de
compras sai do plano × a semana.

Existe por um motivo específico: músculo fica forte mais rápido do que tendão
consegue se adaptar. Frear é metade do trabalho — avisar quando o volume passou
do prescrito, cobrar a regra de manter o exercício por 6 a 8 semanas, e fazer
com que a decisão de mudar o programa seja consciente em vez de automática.

A hierarquia entre as duas acepções, a voz e a identidade estão em
[MARCA.md](MARCA.md).

---

## Sumário

- [Começar](#começar)
- [Como se usa](#como-se-usa)
- [O programa](#o-programa)
- [Dados e backup](#dados-e-backup)
- [Desenvolver](#desenvolver)
- [Testes](#testes)
- [Publicar](#publicar)
- [Regras do projeto](#regras-do-projeto)

---

## Começar

```
npm install
npm run dev
```

Para valer, no iPhone:

1. Publique (ver [Publicar](#publicar)).
2. Abra o endereço **no Safari** — precisa ser o Safari.
3. Compartilhar → **Adicionar à Tela de Início**.
4. Abra sempre pelo ícone.

Aberto pelo ícone, o app roda em tela cheia e o histórico fica fora da regra da
Apple que apaga dados de sites depois de 7 dias sem uso. Na primeira abertura
com internet ele se guarda inteiro no aparelho; depois disso abre e salva sem
rede nenhuma.

---

## Como se usa

### Registrar

**Não existe botão de salvar.** Cada série entra no histórico assim que você
preenche carga e repetição. A sessão nasce sozinha na primeira série completa e
se encerra sozinha por inatividade ou na virada do dia.

O campo mostra a carga da última vez como placeholder. Quando todas as séries
batem o topo da faixa, aparece o selo **↑ subir carga** — dupla progressão:
primeiro repetição, depois carga.

O cronômetro de descanso vem do próprio exercício (3 min nos grandes compostos,
2:30 nas máquinas multiarticulares, 1:45 nos isoladores, 1:30 em lateral,
abdômen e panturrilha) e dispara sozinho ao completar a última série.

### Editar o treino de hoje

Botão **editar treino de hoje** no cabeçalho. Dá para mudar séries, trocar
exercício, reordenar, remover e adicionar — inclusive cadastrar um equipamento
que o app ainda não conhece, que passa a ter histórico próprio.

**Nada disso mexe no programa.** Ao finalizar, o app lista as mudanças uma a uma
e pergunta o que fica:

```
O que fica no programa?

  Elevação lateral na máquina: 3 → 4 séries
  delt lateral: 13 → 14 na rotação · o treinador prescreveu 13
  [só hoje]  [levar para o oficial]

  Chest press inclinado convergente → Supino inclinado no Smith
  [só hoje]  [levar para o oficial]

motivo (opcional): máquina ocupada · outra academia · decisão de programa
```

O padrão é **só hoje**. As séries que você registrou já estão no histórico de
qualquer forma — a tela decide apenas o programa de amanhã.

### Mudar o programa de verdade

Botão **programa**, ou ajustes → programa. Aqui a mudança é direta e vale a
partir do próximo treino: reordenar exercícios e a rotação, mudar faixa de
repetições e descanso, criar um treino novo.

A tela mostra quantas diferenças existem em relação ao que o treinador
prescreveu, permite ver cada uma em português e restaurar por treino ou o
programa inteiro. Restaurar não toca no histórico nem nos exercícios que você
cadastrou.

### Acompanhar

**Acompanhamento** tem o calendário do mês, dias treinados, tempo e volume, e a
média móvel de treinos por semana.

**Corpo** tem peso (3 a 4× por semana), cintura (1× por semana) e cardio. O
veredito usa **média semanal**, nunca o valor do dia:

| Situação | O que o app diz |
|---|---|
| Média subindo menos de 0,15 kg/semana por 2 semanas | Comer mais |
| Média subindo mais de 0,4 kg/semana por 2 semanas | Comer menos |
| Cintura +1,5 cm no mês | Comer menos |

Na mesma aba, séries por músculo na semana, comparadas com o **mesmo ponto** das
semanas anteriores, e um aviso quando o programa saiu do alvo do treinador.

### Esqueceu de registrar

Toque num dia vazio do calendário. Dá para lançar um treino do plano, com ou sem
detalhar os exercícios, ou um treino avulso — fora do programa, informando só o
grupo muscular. Treino avulso é presença: **não move a rotação nem entra na
conta das 48 sessões** até o deload.

---

## O programa

O programa do treinador está congelado no código como `PROGRAMA`, em
[src/dominio/programa.ts](src/dominio/programa.ts): 5 treinos de musculação com
90 séries diretas e o HYROX de sábado, rotação A → B → C → D → E → HX, cada
exercício com o RIR alvo. As estações do HYROX entram sem grupo muscular: são
sessão de verdade na rotação, mas não contam como série de hipertrofia — e o dia
se chama HX porque a letra F já significou outra coisa no histórico.

Ele é a semente do seu programa, o alvo de comparação e o que o botão de
restaurar devolve. O que abre na tela é o **seu** programa, que vai divergindo
conforme você decide.

Dois documentos gerados a partir do código, que por isso não têm como divergir:

- **[docs/TREINO.md](docs/TREINO.md)** — o programa inteiro por escrito: séries,
  faixa de repetição, tipo de carga, descanso, dica de execução e substituições
  de cada exercício, mais as regras de execução, o cardio e a dieta.
  Refaz com `npm run treino`.
- **[docs/ANALISE-VOLUME.md](docs/ANALISE-VOLUME.md)** — não *quantas* séries,
  mas **quais**: a composição de cada músculo por treino e exercício, agrupada
  pela hierarquia de prioridade. Refaz com `npm run volume`.

---

## Dados e backup

O histórico mora no navegador do aparelho, sob a chave `lastro-v1`, e é
de lá que o app lê e escreve. Quem vem da época em que o app se chamava "Treino"
tem `treino-eduardo-v1` no aparelho: no primeiro boot o app **funde** as duas
chaves com a mesma máquina da sincronização e só então apaga a velha — nunca
copia, porque copiar perderia uma série registrada no build antigo depois de a
chave nova já existir. `tests/fluxo/migracaochave.test.js` cobra os três casos. Isso não mudou com a sincronização: o aparelho
continua sendo a verdade, e o app funciona inteiro sem rede e sem conta.

**Sincronizar** (aba guia) replica esse estado num Postgres do Supabase, para o
mesmo registro existir no celular e no computador. A sessão da nuvem não entra
no estado — ela é do aparelho, mora sob `lastro-nuvem-v1`, e quem vinha de
`treino-nuvem-v1` é promovido no primeiro boot em vez de deslogado. O app fala HTTP direto com a
API REST — sem SDK e sem backend próprio, então continua sendo um artefato
estático. A `anon key` vai no bundle porque é pública por design; quem protege é
o RLS, que só devolve a linha do usuário autenticado.

O que faz isso ser seguro não é onde o dado mora, é a **fusão**
([src/dominio/sincronia.ts](src/dominio/sincronia.ts)): coleções com chave
natural — séries, sessões, medidas, cardio — são unidas pela chave, e apagar
deixa lápide para que um aparelho não ressuscite o que o outro apagou.
Sincronizar documento inteiro com "o último a escrever vence" comeria a sessão
que você acabou de registrar na academia.

**A foto do aparelho** segue a mesma lógica com uma diferença que importa: os
bytes nunca entram no estado. Eles vivem no Cache Storage do aparelho e chegam à
tela como endereço de objeto, sem passar pela rede — é o que faz a imagem
funcionar offline sem endereço externo no bundle — e replicam por um bucket
privado do Supabase Storage. No estado fica
uma referência de uns 25 bytes por exercício.

Ela existe para responder "qual das três puxadas desta academia é a que o
treinador quis dizer", e por isso é foto dele: o exercício é definido pela
máquina, e ilustração de acervo é outra máquina.

O esquema do banco e do bucket está em [supabase/schema.sql](supabase/schema.sql).

**Ajustes → Exportar** baixa tudo em JSON. O app cobra um backup a cada 30 dias.
Faça um antes de trocar de celular. É a única cópia que não depende deste
navegador.

A importação aceita backup de qualquer versão anterior: ele passa pelas mesmas
migrações que o estado em disco.

---

## Desenvolver

```
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # gera dist/
npm run preview    # serve o dist/, para conferir o service worker
npm run tipos      # tsc --noEmit
```

Estrutura:

```
index.html               a casca; o resto é montado
src/main.jsx             o casco: estado, roteamento por `view`, telas ainda em string
src/dominio/             as regras, sem DOM e sem estado global
  tipos.ts                 o formato do estado inteiro
  programa.ts              PROGRAMA, ALT, catálogo base, semeadura
  formato.ts               números, datas, semana
  carga.ts                 os seis tipos e as agregações de série
  volume.ts                alvo por músculo, impacto, séries registradas
  progressao.ts            histórico, dupla progressão, freio de pausa longa
  corpo.ts                 médias semanais e as três regras de ajuste
  migracoes.ts             1→2 e 2→3
src/infra/db.ts          storage: host → localStorage → memória
src/ui/                  componentes Preact
src/tokens.css           a paleta — o único lugar com cor escrita
src/base.css             reset, tipografia e a casca da tela
src/componentes.css      anatomia das primitivas do Instrumento
src/treino.css           o que é só da tela de treino
src/sw.js                molde do service worker; o build preenche versão e lista
public/                  ícones e manifesto
vite.config.js           build e o plugin que versiona o service worker
docs/ARQUITETURA.md      como o app funciona por dentro
tests/dominio/           testes rápidos, importando os módulos
tests/fluxo/             testes que sobem o app num jsdom
```

**[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** explica as decisões: as três
camadas do programa, por que a chave do histórico é o exercício e não a posição,
o formato do estado, as migrações e os detalhes que parecem bugs mas não são.

---

## Testes

```
npm test              # tudo
npm run test:dominio  # só as regras — roda em menos de meio segundo
```

**449 testes**, em dois níveis:

**`tests/dominio/`** importa os módulos direto e roda em milissegundos. É onde
moram as regras: limites exatos da dieta, atribuição de série por músculo, corte
de semana, dupla progressão, freio de pausa, as duas migrações contra fixture.
Custa tão pouco que não há desculpa para não cobrir caso de borda.

**`tests/fluxo/`** sobe o app inteiro num jsdom **a partir do build** e aperta
botão. É caro e existe pelo motivo certo: os bugs que apagavam série viviam na
fronteira entre rascunho, DOM e log, e essa fronteira só existe montada. Testar
o build, e não o fonte, é deliberado — o que vai para o iPhone é o build.

`tests/fluxo/harness.js` costura de volta o CSS e o JS que o Vite separou, expõe
`E()` para alcançar o escopo do módulo, e entra com dublês para áudio, wake
lock, vibração, `confirm` e `prompt`.

| Arquivo | Cobre |
|---|---|
| `dominio/corpo` | As três regras de ajuste nos limites exatos, médias semanais |
| `dominio/volume` | Alvo calculado do programa, atribuição por exercício, corte de semana |
| `dominio/progressao` | Dupla progressão, freio de pausa longa, placeholder, dor seguida |
| `dominio/migracoes` | 1→2 e 2→3, chave por chave, e a cadeia inteira |
| `dominio/carga` | Os seis tipos, total em anilhas, topo da faixa |
| `dominio/formato` | Datas, semana, período do dia, escapamento |
| `dominio/estilo` | Paleta intacta, nenhum `var()` órfão, tela cheia em `svh` |
| `fluxo/sessao` | Registro contínuo, encerramento automático, hidratação, deload |
| `fluxo/ciclo` | Iniciar, pausar, finalizar, os quatro estados, pendências |
| `fluxo/programa` | Catálogo, id estável, slots, rotação, migrações no app |
| `fluxo/edicao` | Mods da sessão, o oficial intocado, decisão no fim, regra das 6 a 8 semanas |
| `fluxo/telaprograma` | Edição direta, diferença para o treinador, restaurar, treino novo |
| `fluxo/fluxo` | Ponta a ponta: uma semana com tudo junto, e importação de backup antigo |
| `fluxo/retro` | Lançamento em data passada, do plano e avulso |
| `fluxo/carga` | Rótulo do campo, total exibido, correção persistida |
| `fluxo/corpo` | A ligação entre a regra e a tela, registro de peso, cardio |
| `fluxo/cardio` | Registro, contagem semanal, aviso de dia de perna |
| `fluxo/horario` | Horário do treino, período do dia, retroativo sem hora |
| `fluxo/dados` | Migração de formatos antigos, exportar e reimportar |
| `fluxo/migracaochave` | As duas chaves renomeadas: o histórico funde, a sessão da nuvem promove |
| `fluxo/cronometro` | Instante-alvo, tela apagada, aviso único, wake lock |
| `fluxo/telas` | Regras do projeto, as quatro abas, avisos de dor e pausa |
| `fluxo/publicacao` | Service worker versionado, precache, cabeçalhos de cache |

Os testes existem porque três bugs sérios apareceram por acidente, testando
outra coisa — entre eles um que apagava séries já registradas. **Cada regressão
encontrada virou um teste com o nome do que ela quebrava.**

---

## Publicar

```
npm run build      # gera dist/
```

Qualquer hospedagem estática serve o `dist/`. No Vercel, o `vercel.json` já traz
o `buildCommand`, o `outputDirectory` e os cabeçalhos de cache.

Os cabeçalhos fazem uma distinção que importa: `/assets/*` tem hash no nome, então
aquele conteúdo naquele nome nunca muda e pode ser guardado por um ano
(`immutable`) — é o que faz a segunda abertura ser instantânea. Já `index.html`,
`sw.js` e o manifesto **apontam** para os assets e são sempre revalidados; se
ficassem em cache, o aparelho continuaria pedindo arquivos que já mudaram de nome.

O `vercel.json` é validado em modo estrito e uma chave desconhecida **recusa o
build** — inclusive um campo de comentário. Por isso a explicação está aqui e não
lá, e há um teste que confere as chaves antes de você descobrir no deploy.

**Não há mais número de versão para subir à mão.** O service worker é gerado no
build com um cache nomeado pelo hash do conteúdo: mudou um byte, muda o cache.
Antes isso era um `const CACHE = 'treino-v28'` incrementado manualmente, e
esquecer significava publicar sem que o aparelho pegasse a versão nova — sem
erro nenhum, só o app parado no tempo.

Seus dados não correm risco nesse processo: eles não estão no cache do app,
estão no armazenamento do navegador.

No iPhone, feche o app e abra de novo duas vezes para pegar a versão nova.

---

## Regras do projeto

Não negociáveis, e a suíte verifica as que dá para verificar:

1. **Um artefato só, sem dependência de runtime.** O app tem build, mas o que
   chega no aparelho não busca nada na rede além da fonte do Google. Preact
   entra no bundle e pesa 4 kB — o orçamento é tempo de abertura às 6h15.
2. **Não quebrar dados salvos.** Mudança de formato exige migração que leia a
   versão antiga.
3. **Mobile-first de verdade.** Usado de pé, com uma mão, suado, às 6h15. Alvos
   de toque grandes, nada que exija precisão.
4. **Identidade visual fixa.** O sistema se chama **Instrumento** e a fonte
   canônica dos valores é [src/tokens.css](src/tokens.css): fundo `#0C0E0C`,
   elevado `#111411`, fio `#161A15`, régua `#22271F`, borda `#2B302A`, texto
   `#F2F4EF`, apoio `#A8AFA1`, rótulo `#7C8478`, ácido `#CBF35E` (acento),
   âmbar `#FFC46B` (atenção), coral `#FF8A6B` (só destrutivo). Raio zero. Space
   Grotesk para prosa e nome, IBM Plex Mono para todo número. **Cor só em
   [src/tokens.css](src/tokens.css)** — hexadecimal solto nas outras folhas
   reprova em `tests/dominio/estilo.test.ts`. O porquê está em
   [DESIGN.md](DESIGN.md).
5. **Tudo em português**, tom direto, sem emoji, sentence case. Única exceção
   autorizada: os marcadores de período no calendário, isolados em `PERIODOS`.
6. **Não inventar conselho de treino.** A prescrição está definida; isto aqui é
   a ferramenta, não o programa.
