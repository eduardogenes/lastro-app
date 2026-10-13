# 00 · Briefing — o time que desenha este produto outra vez, do zero

Este arquivo é o contrato de trabalho de um time de design de produto contratado
para uma coisa só: **propor como este app poderia ser, sem herdar nada do que ele
é hoje.** Quem coordena não desenha. Quem desenha não vê o que já existe.

O dono do projeto decide no fim. Até lá, ninguém converge nada.

---

## 1 · A tarefa, e o que ela não é

**A tarefa.** Produzir direções de interface e de interação para este produto
como se ele nunca tivesse sido desenhado. Nenhuma regra visual, de interação, de
navegação, de voz ou de nome vigente tem autoridade aqui. Elas não são ponto de
partida, não são referência e não são limite.

**O que esta tarefa NÃO é:**

- Não é revisão, auditoria nem evolução do que existe. Já houve uma, e ela está
  em `docs/design-review/` — **material proibido** para quase todo o time (§2).
- Não é redesenho do produto. O que o app FAZ não está em questão; como ele se
  apresenta e como se opera está, inteiramente. Se uma direção precisar mudar o
  que o produto faz, isso não é decisão dela: vira pergunta ao dono (§7).
- Não é escolha. O time entrega direções e o custo de cada uma. Escolher é do
  dono, e ninguém deve fazer isso por ele — nem por omissão, nem por entusiasmo.
- Não é entrega de código no app. Nada em `src/` é tocado por este time.

---

## 2 · A regra da sala limpa

O risco número um desta tarefa é **ancoragem**: quem vê o sistema atual
redesenha o sistema atual. Por isso a leitura é racionada.

**Duas funções, e só duas, podem ver o mundo de hoje:**

| Função | Por que precisa |
|---|---|
| **Escriba dos fatos** (A1) | Precisa ler tudo para SEPARAR fato de decisão — e entrega só os fatos. |
| **Curador** (R) | Precisa dos dois mundos para medir o quanto cada direção é de fato diferente, e o que ela perderia. Ninguém mais consegue medir isso. |

**Todo o resto do time é cego.** Proibido abrir, citar, inferir ou pedir:

```
DESIGN.md · MARCA.md · PRODUCT.md · README.md
docs/LASTRO_UX_CONTRACT.md · docs/design-review/** · docs/ux-audit/** · docs/pegada/**
src/*.css · src/ui/** · src/palco.* · index.html
qualquer captura de tela, o app rodando, ou a pasta de handoff de design
```

Permitido ao time cego: **`docs/redesign/01-fatos.md`** e os arquivos que o
próprio time produzir. O engenheiro de viabilidade (C2) tem uma exceção
nomeada: pode ler `src/dominio/`, `src/infra/`, `tests/`, `vite.config.js`,
`package.json` e `src/sw.js` — nunca CSS, nunca JSX de interface.

**Vazamento conta como defeito de entrega.** Se um texto do time cego contém
cor, fonte, medida de componente, nome de tela, nome de classe ou vocabulário do
sistema atual, ele voltou de algum lugar que não devia. O coordenador recusa e
manda refazer.

E vale para o coordenador também: ao falar com qualquer agente cego, ele não
cita, não compara, não "corrige" para o que já existe.

---

## 3 · O teste de fato e forma

É o teste que o escriba aplica linha por linha, e o único critério que separa o
que entra em `01-fatos.md` do que fica de fora.

**É FATO** — vem do mundo, não de uma escolha de ninguém:

- o que o usuário precisa fazer, e em que momento do dia;
- os dados que existem, com unidade, faixa, quantidade e exemplo real;
- os estados em que cada dado pode estar, inclusive os ruins;
- de onde vem cada informação que o app não inventa;
- o aparelho, o navegador, a rede, a luz, a mão, o suor, o tempo disponível;
- o que o código já garante e o que ele proíbe;
- o que já deu errado de verdade, com evidência (`git log`, teste, bug).

**É FORMA, e fica fora** — alguém decidiu, e pode ser decidido outra vez:

- tela, aba, menu, rodapé, cartão, lista, modal — **o 01-fatos.md não nomeia
  superfície nenhuma**, e a palavra "aba" não aparece nele;
- cor, tipografia, medida, espaçamento, raio, sombra, grade, ícone;
- ordem, hierarquia, agrupamento, o que vem antes e o que vem depois;
- gesto, animação, transição, som;
- tom de voz, nome de coisa, rótulo, título, mensagem;
- qualquer frase que comece com "o app deve parecer".

**Caso de fronteira, resolvido:** "o aparelho tem 402 × 874 px" é fato; "o
controle tem 46 px" é forma. "A sessão de treino acontece com o aparelho na
mão, em pé, entre séries de 60 a 180 segundos" é fato; "o cronômetro fica no
rodapé" é forma. "O app não prescreve treino nem dieta — ele executa
prescrição de terceiros" é fato, porque é o que o produto é; "ele nunca
comemora" é forma, porque é um partido de voz que esta tarefa reabre.

---

## 4 · O time

Dez funções em cinco ondas. Cada uma recebe mandato, entradas, proibições e um
entregável. Ninguém faz o trabalho de outro.

### Onda 1 · Os fatos

**A1 · Escriba dos fatos.** Lê o repositório inteiro, inclusive o que é proibido
para os outros, e escreve `01-fatos.md`: tudo o que um designer precisa saber
para desenhar este produto sem nunca ter visto a versão atual. Tarefas, dados,
estados, origens, contextos, restrições do mundo, histórico de erro real.
Exaustivo em fato, zero em forma. Aplica o teste do §3 em cada linha e, no fim,
relê o próprio texto caçando vazamento. Entrega também `01-fatos-cortes.md`: a
lista do que ele reconheceu como decisão e removeu — essa lista é para o dono e
para o curador, **nunca para o time cego**.

**A2 · Pesquisador do uso.** Lê `01-fatos.md`, `git log` e `tests/`. Reconstrói o
uso real: quais tarefas acontecem quantas vezes, quais são caras, onde o uso
falha, o que acontece quando o usuário está com pressa, cansado ou sem rede.
Escreve as perguntas que só o dono pode responder — no máximo doze, cada uma com
o que muda na resposta — em `02-perguntas.md`, e depois `02-uso.md` com os
momentos ordenados por frequência e por dificuldade. **Dos momentos que ele
mapear, ele nomeia os dois que todo designer vai ter que desenhar** (§5), pelo
critério dele, escrito.

### Onda 2 · As direções

**D1 · D2 · D3 · D4 — quatro designers de produto sêniores, cegos entre si e
cegos ao app atual.** Recebem **exatamente a mesma mensagem**: `01-fatos.md`,
`02-uso.md`, as respostas do dono, os dois momentos obrigatórios. Nenhum recebe
ângulo, tema, estilo, referência ou restrição que os outros não recebam — se o
coordenador distribuir papéis diferentes ("um minimalista, um expressivo"), a
onda está contaminada e não vale.

Cada um entrega uma pasta `03-direcao-<letra>/` com:

- **a tese em uma frase** — o que esta direção afirma sobre este produto;
- **o modelo** — como o produto se organiza, e por que isso serve ao uso real;
- **os dois momentos obrigatórios, desenhados**, com todos os estados que
  `01-fatos.md` exige, inclusive vazio, carregando, erro e o caso ruim;
- **dois arquivos HTML autocontidos** (um por momento), que o dono abre e vê, em
  viewport de telefone, com conteúdo real tirado dos fatos — não lorem ipsum,
  não imagem de placeholder;
- **o que esta direção se recusa a fazer**, e o que ela custa ao usuário;
- **duas direções que ele mesmo considerou e descartou**, com o motivo;
- **as perguntas que ele não tem como responder** sozinho.

Sem moodboard. Sem referência de mercado como argumento. "Porque é moderno" não
é razão; "porque ele está com uma mão ocupada" é.

### Onda 3 · O cerco

Quatro especialistas, cegos entre si, trabalhando sobre as direções que
sobreviverem ao primeiro olhar do dono.

**C1 · Crítico adversarial.** Tenta derrubar cada direção pelo uso: o que
acontece às 6h15, no terceiro mês, com dado incompleto, com a mão suada, com
pressa. Não propõe substituto — quem ataca não desenha.

**C2 · Engenheiro de viabilidade.** Diz o custo de cada direção neste stack:
o que exige migração de dado, o que quebra teste, o que o iOS não entrega, o que
não funciona sem rede, o que é impossível. As armadilhas técnicas registradas em
`~/.claude/CLAUDE.md` são fato de engenharia e entram aqui — não são design.

**C3 · Acessibilidade e corpo.** WCAG 2.2 AA e mais: uma mão, suor, academia no
subsolo, sol na rua, leitor de tela, movimento reduzido, alvo, contraste, foco,
teclado. Mede cada direção e diz o que precisa mudar para ela existir.

**C4 · Voz e palavras.** Propõe, do zero, como este produto fala, e escreve as
palavras dos dois momentos de cada direção sobrevivente — rótulo, estado vazio,
erro, confirmação, o nome das coisas. Não herda tom nenhum.

### Onda 4 · O parecer

**R · Curador.** A única função, além do escriba, que vê os dois mundos. Lê
tudo, não inventa nada e entrega `06-parecer.md`:

- as direções lado a lado, com a tese, o custo e o que cada uma pede ao dono;
- **o quanto cada direção é de fato diferente do app atual** — a medida é dele,
  porque só ele pode comparar. Se uma direção chegou, cega, a algo parecido com
  o que já existe, isso é informação valiosa e tem que estar escrito, não
  escondido;
- **o que o app de hoje faz bem e cada direção perderia** — nominalmente;
- o que ficou provado, o que é hipótese e o que é gosto;
- as decisões que são do dono, numeradas, cada uma com o que a prova diz.

O curador não cria uma quinta direção e não funde duas. Se ele achar que a
resposta é uma mistura, ele escreve isso como pergunta ao dono.

### Onda 5 · O ofício (só depois da escolha)

Com uma direção escolhida, ela vira especificação completa e os documentos que
substituiriam os atuais — **sempre como candidatos, nunca sobrescrevendo nada.**
As funções: arquitetura de informação e fluxo; interação e estados; sistema
visual e tokens; movimento. O escopo exato sai do que a direção escolhida pedir,
e quem define isso é o curador junto com o dono — não o coordenador sozinho.

---

## 5 · As ondas e os pontos de parada

```
Onda 1  A1 → 01-fatos.md          A2 → 02-perguntas.md
        ════ PARADA 1 · o dono responde as perguntas ════
        A2 → 02-uso.md + os dois momentos obrigatórios
Onda 2  D1 D2 D3 D4 em paralelo, cegos → 03-direcao-A..D/
        ════ PARADA 2 · o dono abre os HTML e diz o que sobrevive ════
Onda 3  C1 C2 C3 C4 em paralelo, cegos → 04-critica · 04-viabilidade ·
                                          04-acesso · 04-voz
Onda 4  R → 06-parecer.md
        ════ PARADA 3 · o dono decide ════
Onda 5  o ofício detalha a escolhida
```

**Os dois momentos obrigatórios** existem por comparabilidade: quatro direções
desenhando coisas diferentes não se comparam. Quem os escolhe é A2, por
frequência e dificuldade medidas, com o critério escrito. O coordenador não
escolhe, não sugere e não troca.

**Nas paradas o trabalho para de verdade.** Não se adianta onda, não se chuta a
resposta do dono, não se "começa enquanto ele pensa".

---

## 6 · Como o coordenador se comporta

Quem roda este time tem uma função difícil: **não contribuir.**

- **Nenhuma ideia de interface sai do coordenador.** Nem sugestão, nem "e se",
  nem exemplo, nem correção de rumo. Se a melhor ideia do processo for dele, a
  tarefa falhou.
- Não responde pergunta de gosto. A resposta é "não é minha para dar".
- Não cita o sistema atual para ninguém cego, nem para elogiar, nem para evitar.
- Confere `01-fatos.md` contra o §3 antes da onda 2. Vazamento volta.
- Dá aos quatro designers a mensagem idêntica, palavra por palavra.
- Não funde direções, não escolhe campeã, não poupa o dono do que é dele.
- Ao relatar, separa o que ele conferiu no código do que está repetindo de um
  agente. Número de agente não confirmado é número suspeito.
- Para nas paradas e espera.

---

## 7 · A régua

**Uma direção é válida quando:**

1. serve a todas as tarefas de `01-fatos.md` — ou diz, explicitamente, qual
   deixou de fora e o que isso custa;
2. funciona nos contextos de uso que os fatos descrevem, e não só no melhor;
3. é desenhável e foi desenhada: os dois HTML abrem e mostram a coisa;
4. tem todos os estados ruins resolvidos, não só o caminho feliz;
5. diz o que recusa, e aguenta a recusa;
6. se sustenta por argumento de uso, não por gosto nem por referência.

**Uma direção é inválida quando:** é moodboard; é prosa sem desenho; muda
superfície sem mudar modelo; só funciona com dado que o produto não tem; exige
servidor, conta ou rede que o produto não tem; ou trata acessibilidade como
acabamento.

**Se uma direção mudar o que o produto faz**, ela não decidiu nada: escreve a
mudança como pergunta ao dono, com o que se ganha e o que se perde, e desenha a
versão que não depende da resposta.

---

## 8 · Os modos de falha, nomeados

Se o resultado tiver uma destas caras, foi este briefing que falhou:

1. **O deck bonito.** Cinquenta parágrafos de intenção e nada que se veja.
2. **O rebrand.** Cor e fonte novas por cima do mesmo modelo.
3. **A convergência.** Quatro direções iguais, porque alguém induziu — ou porque
   nenhuma arriscou. Quatro teses parecidas é um resultado a investigar, não a
   esconder.
4. **O vazamento.** Decisão de forma passando por fato no `01-fatos.md`, e aí
   todo o time cego desenha o app de hoje sem saber.
5. **A fantasia.** Proposta linda que este stack não entrega, descoberta na
   onda 5.
6. **A acessibilidade no fim.** Chegar ao detalhamento com alvo pequeno e
   contraste reprovado.
7. **O coordenador autor.** Ver §6.
8. **O produto trocado.** Mudar o que o app faz e chamar isso de redesenho.

---

## 9 · Onde as coisas moram

```
docs/redesign/
  00-briefing.md              este arquivo
  01-fatos.md                 A1 · o único insumo do time cego
  01-fatos-cortes.md          A1 · o que foi reconhecido como decisão e removido
  02-perguntas.md             A2 · para o dono, antes de tudo
  02-uso.md                   A2 · momentos, frequência, falhas, os dois obrigatórios
  03-direcao-A/ B/ C/ D/      D1..D4 · tese, modelo, estados, 2 HTML, recusas
  04-critica.md               C1
  04-viabilidade.md           C2
  04-acesso.md                C3
  04-voz.md                   C4
  06-parecer.md               R · o que vai à mesa do dono
```

Nada fora de `docs/redesign/` é criado ou alterado por este time. `src/`,
`tests/` e os documentos vigentes ficam intocados até o dono decidir.
