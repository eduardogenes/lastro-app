# Briefing — a revisão das regras escritas

Instruções para um time de seis agentes que revisa as regras do Lastro. Este
documento é o contrato: cada agente recebe o **contexto comum** mais o **bloco
do seu papel**, e nada além disso.

---

## Por que esta revisão existe

O backlog tem dois itens acorrentados:

> **Motion design em praticamente todo o app** — para dar mais fluidez às transições
> **Revisar as regras de design antes de atacar o motion** — suspeita de regras ultrapassadas

A ordem foi decidida por quem escreveu: revisar antes de mexer. E há uma
colisão frontal esperando:

> `DESIGN.md`, inegociável nº 6 — **"Quase nenhum movimento. Existem dois."**

Hoje o app tem exatamente uma animação (`ins-pulse`, o ponto ao vivo) e duas
transições, todas mortas por `prefers-reduced-motion`. As quatro animações de
`src/palco.css` são da bancada de mesa e não rodam no aparelho.

---

## O perímetro

Três documentos, 607 linhas, mais o código que deveria obedecê-los:

| documento | governa |
|---|---|
| `DESIGN.md` | o sistema visual: cor, tipo, espaço, toque, componentes, movimento |
| `docs/LASTRO_UX_CONTRACT.md` | comportamento: navegação, voltar, foco, folha, teclado |
| `MARCA.md` | identidade e voz: o que o produto é e como ele fala |

**Teto: tudo está na mesa, identidade inclusive.** Um agente pode concluir que
"nunca comemora" envelheceu, ou que a austeridade virou dogma. Pode — desde
que prove.

`MARCA.md` tem uma propriedade que muda o trabalho: ele guarda as decisões
**com o voto vencido**. Parte do argumento contrário a várias regras já está
escrita ali, por quem perdeu a discussão na época.

---

## O produto, em quatro fatos

Sem isto, nenhuma regra pode ser julgada.

1. **Um usuário, sem conta e sem servidor.** Os dados moram no navegador do
   aparelho dele. É decisão, não limitação.
2. **Dois contextos de uso que não se parecem.** Às 6h15, de pé, com uma mão,
   suado, no subsolo de uma academia com sinal ruim, entre uma série e outra.
   E ao longo do dia, sentado, sem pressa.
3. **O app freia.** Músculo fica forte mais rápido que tendão. Boa parte do que
   o app faz é atrasar decisão, e o caminho de menor esforço é sempre o
   conservador.
4. **Ele não pergunta o que já sabe.** Nada derivável é digitado, e onde um
   número é derivado a tela diz de onde ele veio.

---

## As regras que TODOS obedecem

**Procedência em toda afirmação.** `arquivo:linha`, hash de commit, ou seção de
documento. Uma frase sem origem conferível não entra no seu relatório. Este
projeto inteiro é construído sobre isso — um parecer sem procedência não teria
como ser auditado, que é exatamente o que ele existe para permitir.

**"Não tenho caso" é resposta válida, esperada e valiosa.** Você será cobrado
pelo que provar, nunca pelo volume. Inventar argumento onde não há é o único
erro grave possível aqui — e o relator foi instruído a tratar o seu silêncio
como o sinal mais forte do documento.

**Não invente.** Se não conseguir verificar, escreva que não conseguiu e por
quê. "Não consegui medir esta regra" é um achado, não uma falha.

**Escreva um arquivo só: o seu.** Está proibido editar `DESIGN.md`, `MARCA.md`,
`docs/LASTRO_UX_CONTRACT.md`, qualquer coisa em `src/` ou em `tests/`. Esta
revisão produz texto, não mudança.

**Não leia o relatório de agente nenhum, a menos que o seu bloco mande.**

**Escreva em português**, na voz do projeto: direto, sem emoji, sentence case,
sem hype. Frase curta. Nada de "é importante notar que".

---

## Onda 1 — o fato

### Agente 1 · Auditor de conformidade

Saída: `docs/design-review/01-conformidade.md`

Você mede o código contra o que está escrito. **Você não opina sobre mérito** —
nem uma frase sobre se a regra é boa, se envelheceu ou se deveria mudar. Outros
farão isso, e farão melhor sobre um chão que ninguém possa contestar.

**Sua primeira entrega é o índice.** Percorra os três documentos e numere toda
regra verificável, com um identificador estável que o time inteiro vai usar:
`D-01` a `D-nn` para o `DESIGN.md`, `U-01` a `U-nn` para o contrato de UX,
`M-01` a `M-nn` para a `MARCA.md`. Cada entrada traz o texto literal da regra e
onde ela está. Este índice é o vocabulário comum da revisão; sem ele os cinco
relatórios seguintes falam de coisas diferentes com o mesmo nome.

Depois, regra por regra, um destes três veredictos:

| veredicto | quando |
|---|---|
| **cumprida** | o código faz o que a regra manda, e você mostra onde |
| **violada** | o código faz diferente, e você mostra onde e quantas vezes |
| **não mensurável** | a regra é vaga demais para ter resposta, e você explica o que faltaria para medi-la |

Leia: os três documentos, `src/tokens.css`, `src/base.css`,
`src/componentes.css`, `src/treino.css`, `src/protocolo.css`, `src/palco.css`,
tudo em `src/ui/`, e `tests/dominio/estilo.test.ts` — que já cobra parte das
regras automaticamente, e saber quais é metade do seu trabalho.

Cuidados que mudam o resultado:

- **`src/palco.css` é a bancada de mesa**, o simulador de celular usado no
  desenvolvimento. Não roda no aparelho. Medir as animações dela como se
  fossem do app já produziu conclusão errada antes.
- **Regra vaga não é regra cumprida.** "Quase nenhum movimento" tem número:
  dois. "Nada de prosa abaixo de 13px" tem número. Se uma regra não tem,
  diga.
- **Conte as violações.** Uma exceção documentada e trinta exceções silenciosas
  são fatos diferentes.

### Agente 2 · Historiador das decisões

Saída: `docs/design-review/02-origem.md`
Lê antes: `docs/design-review/01-conformidade.md`, só para usar os mesmos ids.

Você reconstrói **por que cada regra existe**. Uma regra só pode ser julgada
velha por quem sabe que problema ela consertou — e neste repo essa informação
existe, espalhada.

Por regra do índice, quando houver:

- **o problema que ela resolveu**, e como se manifestava
- **quando ela nasceu**, com o commit ou o documento
- **o que foi tentado antes**, e por que não serviu
- **o voto vencido**, se estiver registrado
- **se ela já foi revisada** desde que nasceu, e o que mudou

Onde procurar, em ordem de densidade:

1. **Os comentários do código.** Este repo explica o porquê dentro do fonte, e
   não em documento à parte. `src/tokens.css` justifica cada cor; `src/ui/` e
   `src/dominio/` abrem quase todo arquivo explicando a decisão. É a sua fonte
   mais rica, e a mais fácil de ignorar.
2. **`MARCA.md`**, que guarda o voto vencido por escrito.
3. **`docs/ux-audit/06-final-review.md`**, que registra o que foi medido, o que
   quebrou e — vale ler — duas medições da própria auditoria que estavam erradas.
4. **`docs/ARQUITETURA.md`**, denso em decisões e nos seus motivos.
5. **`git log`**, com mensagens longas e explicativas neste projeto.

Você também não opina sobre mérito. Relato, não juízo. Mas **quando não achar
origem nenhuma para uma regra, diga em voz alta** — regra sem motivo registrado
é o achado mais útil que você pode produzir.

---

## Onda 2 — o argumento

Os três agentes desta onda leem `01-conformidade.md` e `02-origem.md`, e **não
leem um ao outro**. Isso é deliberado.

### Agente 3 · O caso da mudança

Saída: `docs/design-review/03-mudanca.md`

**Sua posição está atribuída:** construa o caso mais forte possível de que
regras envelheceram. Não é para você fingir convicção; é para garantir que este
lado seja defendido por alguém que tentou de verdade.

Regra por regra do índice, uma destas:

- **o caso**, com a evidência que o sustenta: o que mudou no produto, no uso ou
  na plataforma desde que a regra nasceu; onde ela hoje atrapalha; o que ela
  custa e o que devolve
- **"não tenho caso"**, em uma linha

Não tente ter caso em todas. Um relatório com seis casos sólidos e trinta "não
tenho caso" vale mais do que trinta e seis argumentos mornos — e o relator foi
instruído a ler o seu silêncio como sinal.

**Separe as duas magnitudes**, em todo achado:

| tipo | exemplo |
|---|---|
| **a regra envelheceu** | "raio zero" continua certo, mas a exceção da foto virou três exceções |
| **a identidade envelheceu** | "nunca comemora" deixou de servir ao produto |

A segunda é decisão de outra ordem. Misturá-las deixaria uma pergunta sobre
transição de tela virar uma virada de produto por acidente.

### Agente 4 · O caso da permanência

Saída: `docs/design-review/04-permanencia.md`

Espelho do agente 3, e cego a ele. **Sua posição está atribuída:** o caso mais
forte de que cada regra continua servindo.

Mesmo formato, mesma exigência de procedência, mesmo "não tenho caso" quando
não tiver. E mesma separação entre regra e identidade.

Um ângulo que é seu por direito, e que ninguém mais vai cobrir: **a suspeita
pode ser sintoma de outra coisa.** Se o app parece duro, a causa pode não estar
em regra nenhuma — pode estar em densidade de tela, em hierarquia, em onde o
dedo cai. Se você achar essa explicação alternativa, ela é o seu achado mais
forte.

### Agente 5 · O caso do movimento

Saída: `docs/design-review/05-movimento.md`

Você trata de um assunto só: **o inegociável nº 6 contra o item do backlog.**
Os outros vão tratá-lo como uma regra entre trinta; ele é o gatilho da revisão
inteira e merece fundo próprio.

Responda, nesta ordem:

1. **O que movimento faria por este app, concretamente?** Nome do ganho, tela
   por tela. "Mais fluido" não é resposta. "Ao trocar de aba, a transição diz
   qual direção você andou, e isso some quando o app pisca" é.
2. **Onde ele atrapalharia.** Às 6h15, entre séries, animação é espera. O
   produto freia de propósito e nunca comemora — diga onde movimento colide com
   isso e onde não colide.
3. **O que custa.** Bateria, repaint, complexidade, e o risco de plataforma.
4. **Candidatos concretos**, no máximo cinco, cada um com: onde, duração,
   curva, o que comunica, e o que acontece sob `prefers-reduced-motion`.

**Leia antes de propor qualquer coisa: `~/.claude/CLAUDE.md`**, o arquivo de
preferências globais do dono do projeto. Ele registra três armadilhas de
movimento aprendidas na dor, com diagnóstico e correção:

- `backdrop-filter` que pisca no Blink e **não** no WebKit — "no celular tá ok,
  só no desktop pisca" engana, e já mandou gente remover a coisa errada;
- `translateX(+N)` que cria barra de rolagem horizontal transitória e faz
  elemento fixo centrado piscar **só no sentido positivo**;
- `overflow` de ancestral quebrando `position: sticky`, e por que
  `overflow-x: hidden` piora enquanto `overflow-x: clip` resolve.

Propor algo que caia numa dessas sem citar a lição é o pior resultado possível
do seu trabalho.

Considere também que o app é PWA em iOS Safari, aberto pelo ícone, e que
`DESIGN.md` já escolheu curva e duração para os dois movimentos que existem —
`220ms cubic-bezier(.2,.8,.2,1)` e `2,4s`. Um sistema de movimento novo ou
estende esse vocabulário ou explica por que o abandona.

---

## Onda 3 — a síntese

### Agente 6 · Relator

Saída: `docs/design-review/06-parecer.md`, mais os candidatos.
Lê: todos os cinco relatórios, e os três documentos originais.

Seu modelo é `docs/pegada/00-parecer-cruzado.md`, que já existe neste repo e
resolveu um problema da mesma forma. Leia antes de escrever.

**A instrução mais importante do seu bloco:** o desacordo entre os agentes 3 e
4 é **fabricado por construção**. Eles receberam posições atribuídas. Portanto
o desacordo entre eles **não vale como evidência por si** — não escreva "as
duas análises divergiram" como se isso significasse algo.

O que vale é outra coisa:

- **a qualidade da prova** que cada lado conseguiu juntar;
- **onde um dos lados não conseguiu juntar nenhuma.** Um advogado instruído a
  atacar uma regra, que leu o código e a história e escreveu "não tenho caso",
  disse mais do que qualquer argumento no documento. Trate cada um desses como
  achado de primeira linha;
- **onde os dois convergem apesar das posições opostas**, que é o achado mais
  forte que esta revisão pode produzir.

Estrutura do parecer:

1. **O diff em prosa, primeiro.** O que sai, o que entra, o que fica igual. Se
   a lista for curta, ela tem que caber na primeira tela — enterrada em 200
   linhas, ninguém a lê e tudo é aceito por inércia.
2. **Onde os dois advogados concordaram**, e o que isso fecha.
3. **Onde eles divergiram**, com a prova de cada lado lado a lado, e a sua
   leitura de qual prova é mais forte — e por quê.
4. **Regra sem origem registrada**, do agente 2. Regra que ninguém sabe por que
   existe é candidata natural a sair, e isso é conclusão sua a tirar.
5. **O caso do movimento**, e a resposta ao inegociável nº 6.
6. **O que continua aberto**, e o que precisa de decisão humana.

**Separe regra de identidade em todo achado.** Diga sempre de qual das duas se
trata. São magnitudes diferentes, e misturá-las é o modo de falha desta
revisão inteira.

### Os candidatos

Para cada documento que o parecer justificar mexer, escreva a versão candidata
em `docs/design-review/DESIGN-candidato.md`, `MARCA-candidato.md` ou
`UX-CONTRACT-candidato.md`.

Três regras, e nenhuma é negociável:

- **Nunca sobrescreva o original.** Quem move o arquivo é o dono do projeto.
- **Toda linha alterada aponta o achado que a motivou.** Mudança sem
  proveniência no parecer é proibida. Nada de melhoria que ninguém pediu
  entrando de carona numa revisão que o usuário vai ler com pressa.
- **Documento que sai ileso não ganha candidato.** Se a `MARCA.md` sobreviveu,
  não existe `MARCA-candidato.md`.

---

## A ordem de execução

```
1. Auditor            sozinho · produz o índice que todos usam
2. Historiador        depois do 1 · mesmos ids
3, 4, 5               em paralelo · cegos entre si · leem 1 e 2
6. Relator            depois de todos
```

O agente 2 espera o 1 porque o índice é o vocabulário comum: sem ele, cinco
relatórios falam de coisas diferentes com o mesmo nome, e o relator gasta o
trabalho dele fazendo tradução em vez de síntese.
