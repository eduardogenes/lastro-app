# Treino

App pessoal de registro de treino, cardio e acompanhamento corporal.
Um arquivo HTML, sem build, sem dependência, sem servidor. Funciona offline.

Existe por um motivo específico: músculo fica forte mais rápido do que tendão
consegue se adaptar. O app registra, mas boa parte do que ele faz é **frear** a
progressão de carga — avisar quando o volume passou do prescrito, cobrar a regra
de manter o exercício por 6 a 8 semanas, e fazer com que a decisão de mudar o
programa seja consciente em vez de automática.

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

Abrir `index.html` no navegador. É isso — não há passo de build nem instalação.

Para valer, no iPhone:

1. Publique a pasta em qualquer hospedagem estática (ver [Publicar](#publicar)).
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

O programa do treinador está congelado no código como `PROGRAMA`: 6 treinos,
48 exercícios, 125 séries diretas, rotação A → B → C → E → D → F.

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

O histórico mora no navegador do aparelho, sob a chave `treino-eduardo-v1`.
Não há servidor e não há sincronização — decisão consciente: um usuário, um
escritor, dados minúsculos, offline obrigatório.

**Ajustes → Exportar** baixa tudo em JSON. O app cobra um backup a cada 30 dias.
Faça um antes de trocar de celular. É a única cópia que não depende deste
navegador.

A importação aceita backup de qualquer versão anterior: ele passa pelas mesmas
migrações que o estado em disco.

---

## Desenvolver

```
npx serve .        # necessário para testar o service worker (precisa de https ou localhost)
```

Estrutura:

```
index.html               o app inteiro — CSS e JS inline
sw.js                    service worker; suba CACHE ao publicar versão nova
manifest.webmanifest     PWA
icone-*.png              ícones de instalação
vercel.json              headers de cache
docs/ARQUITETURA.md      como o app funciona por dentro
docs/TREINO.md           gerado
docs/ANALISE-VOLUME.md   gerado
tests/                   suíte + geradores dos documentos
```

**[docs/ARQUITETURA.md](docs/ARQUITETURA.md)** explica as decisões: as três
camadas do programa, por que a chave do histórico é o exercício e não a posição,
o formato do estado, as migrações e os detalhes que parecem bugs mas não são.

---

## Testes

```
npm install     # uma vez; instala só o jsdom, e só para os testes
npm test
```

**190 testes**, runner nativo do Node. O app continua sem dependência nenhuma —
o jsdom vive fora dele.

`tests/harness.js` sobe o `index.html` num DOM de mentira e expõe `E()` para
avaliar expressões dentro do escopo do app, que é como se chega em `S`, `view` e
nas funções internas. Áudio, wake lock, vibração, `confirm` e `prompt` entram
como dublês, e o que eles registram é observável.

| Arquivo | Cobre |
|---|---|
| `sessao.test.js` | Registro contínuo, abertura e encerramento automático, hidratação do rascunho, deload |
| `ciclo.test.js` | Iniciar, pausar, finalizar, os quatro estados do exercício, pendências |
| `programa.test.js` | Catálogo, id estável, slots, rotação vinda do estado, migrações em cadeia |
| `edicao.test.js` | Mods da sessão, o oficial intocado, decisão no fim, freio de volume, regra das 6 a 8 semanas |
| `telaprograma.test.js` | Edição direta do programa, diferença para o treinador, restaurar, rotação, treino novo |
| `fluxo.test.js` | Ponta a ponta: uma semana com tudo junto, e a importação de um backup antigo |
| `retro.test.js` | Lançamento em data passada, do plano e avulso |
| `carga.test.js` | Os seis tipos, total exibido, peso do corpo, correção persistida |
| `corpo.test.js` | As três regras de ajuste nos limites exatos, médias semanais, cardio |
| `cardio.test.js` | Registro, contagem semanal, aviso de dia de perna |
| `horario.test.js` | Horário do treino, período do dia, retroativo sem hora |
| `dados.test.js` | Migração de formatos antigos, exportar e reimportar, histórico não truncado |
| `cronometro.test.js` | Instante-alvo, tela apagada, aviso único, wake lock, descanso por categoria |
| `telas.test.js` | Regras do projeto, as quatro abas, avisos de dor e pausa, correção de sessão |

Os testes existem porque três bugs sérios apareceram por acidente, testando
outra coisa — entre eles um que apagava séries já registradas. **Cada regressão
encontrada virou um teste com o nome do que ela quebrava.**

---

## Publicar

Qualquer hospedagem estática serve. Arraste a pasta em
[app.netlify.com/drop](https://app.netlify.com/drop) ou use o Vercel — o
`vercel.json` já traz os headers de cache certos.

**Ao publicar versão nova, suba o número de `CACHE` em `sw.js`.** Sem isso, o
aparelho continua servindo a versão antiga. Seus dados não correm risco nesse
processo: eles não estão no cache do app, estão no armazenamento do navegador.

No iPhone, feche o app e abra de novo duas vezes para pegar a versão nova.

---

## Regras do projeto

Não negociáveis, e a suíte verifica as que dá para verificar:

1. **Um arquivo só.** Sem build, sem dependência externa além da fonte do Google.
2. **Não quebrar dados salvos.** Mudança de formato exige migração que leia a
   versão antiga.
3. **Mobile-first de verdade.** Usado de pé, com uma mão, suado, às 6h15. Alvos
   de toque grandes, nada que exija precisão.
4. **Identidade visual fixa.** Fundo `#0D1520`, cartão `#15202E`, elevado
   `#1C2A3B`, borda `#26374C`, texto `#E9EFF6`, secundário `#8DA0B8`, apagado
   `#48607C`, âmbar `#F5A83C` (acento), laranja `#E8734A` (só alertas).
   Archivo para texto, IBM Plex Mono para números. Números sempre monoespaçados.
5. **Tudo em português**, tom direto, sem emoji, sentence case. Única exceção
   autorizada: os marcadores de período no calendário, isolados em `PERIODOS`.
6. **Não inventar conselho de treino.** A prescrição está definida; isto aqui é
   a ferramenta, não o programa.
