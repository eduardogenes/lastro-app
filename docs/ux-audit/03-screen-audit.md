# 03 · Auditoria, tela por tela

Severidade: **P0** bloqueia tarefa ou arrisca perda · **P1** fricção grande ·
**P2** melhoria relevante · **P3** polimento.
Cada achado traz evidência medida no navegador, não impressão.

O achado sistêmico **S-01** aparece em todas as telas; está descrito uma vez, em
[09 · Problemas sistêmicos](#problemas-sistêmicos), e não repetido em cada uma.

---

## Problemas sistêmicos

### S-01 · O Voltar do sistema fecha o app · **P0 · frequência alta · confiança alta**

**Descrição.** O app não põe nenhuma entrada no histórico do navegador. Aba,
destino de tela cheia e folha mudam só `view` e re-renderizam.

**Evidência.** `history.length` medido: **2 no boot e 2 depois de trocar de aba
e abrir uma folha**. Um `goBack()` leva a `about:blank` e a árvore do app deixa
de existir (`.ins-tabbar` some).

**Impacto.** No Android — botão e gesto de Voltar — e no gesto de borda do
Safari, o primeiro Voltar em qualquer ponto **sai do app**. Se houver sessão de
treino aberta, o usuário volta a abrir o app e reencontra a sessão (a
persistência funciona), mas perdeu o cronômetro em curso e a posição na tela. É
o pior caso do produto: acontece de pé, no meio de uma série.

**Princípio violado.** Voltar desfaz a última camada (02 §Navegação).

**Recomendação.** Uma entrada de histórico por camada aberta; `popstate` fecha a
do topo. Sem router: o histórico espelha a pilha derivada de `view`.

**Comportamento esperado.** Folha aberta → Voltar fecha a folha. Destino aberto
→ Voltar volta à aba, na posição de leitura anterior. Na raiz de uma aba →
Voltar sai do app (correto).

### S-02 · `telaCheia()` é cadeia de prioridade, não pilha · **P1 · média · alta**

**Descrição.** Dez flags independentes em `view` resolvidas por uma cadeia `if`
de ordem fixa. Abrir um destino sem fechar o anterior não empilha: esconde.

**Evidência.** Com `view.prog` ligado, `abrirRetro()` liga `view.retro` mas a
tela continua sendo Programa — reproduzido no navegador.

**Impacto.** Um destino pode ficar ligado e invisível; ao fechar o de cima,
reaparece um que o usuário julgava fechado. É também o que impede implementar o
Voltar de forma confiável.

**Recomendação.** Derivar a pilha de camadas de `view` na mesma ordem de
prioridade e fechar sempre a do topo. Não exige trocar a forma do estado.

### S-03 · Restauração de scroll aplicada em 4 dos 10 destinos · **P1 · alta · alta**

**Evidência.** Dados y=1200 → abre sessão → volta em **y=0**. Guia y=1500 → abre
Programa → volta em **y=0**. Protocolo, comparar, ajuste e câmera restauram
certo, porque só eles chamam `entraNoDestino`/`saiDoDestino`.

**Impacto.** Guia é a tela mais longa do app; Dados tem calendário e listas.
Voltar ao topo obriga a reencontrar o lugar.

**Recomendação.** O mecanismo já existe e está certo — ligá-lo aos seis destinos
que faltam, de preferência num ponto único, não em cada `fecharX()`.

### S-04 · Folha modal sem gestão de foco · **P1 · alta · alta**

**Evidência.** Com a folha aberta: foco permanece no botão que a abriu; **39
elementos fora da folha continuam tabuláveis**; nenhum `inert`; três Tabs saem
da folha para a página atrás; ao fechar, o foco **não** volta ao acionador.

**Impacto.** Teclado e leitor de tela navegam atrás do modal e perdem o lugar.
WCAG 2.2 SC 2.4.3 e 2.1.1.

**Nota.** A trava de scroll do corpo já está correta, e as **telas cheias já
mandam o foco para o título ao entrar** — a folha é a exceção, não a regra.

**Recomendação.** Ao abrir: foco na folha. Enquanto aberta: `inert` no que está
atrás. Ao fechar: foco de volta ao acionador.

---

## HOJE

**Função.** Responder "e agora?" — a próxima ação do dia, com treino e comida no
mesmo eixo. **Tipo.** A · top-level. **Jornada.** Entrada do app.

Sem achados próprios. Cartão-foco, timeline, estados vazios e o botão de estado
do cabeçalho estão corretos. Herda S-01 e S-04 (folha de refeição, seletor de
dia).

## TREINO

**Função.** A sessão, dentro da academia. **Tipo.** H · treino ativo.
**Jornada.** Iniciar → registrar série → descansar → próximo exercício → fim.

### T-01 · O cronômetro só começa sozinho na ÚLTIMA série do exercício · **P1 · alta · alta**

**Evidência.** Exercício de 3 séries, preenchidas em ordem:
série 1 → `timer.on = false` · série 2 → `false` · série 3 → `true`, `3:00`.
A causa é `if (k !== ult) return;` em `autoTimer()`.

**Impacto.** O descanso entre séries é a espera mais frequente da sessão e é
justamente a que não é cronometrada. O usuário precisa achar e tocar "DESCANSO
3MIN" no topo do cartão — um toque a mais por série, de pé, com uma mão.

**Recomendação.** Disparar ao completar **qualquer** série, mantendo as duas
exceções que já existem (bi-set encadeia sem pausa; não redisparar a mesma série).

### T-02 · O valor anterior não preenche · **P1 · alta · alta**

**Evidência.** `<div class="setant">{linha.antes}</div>` — nó inerte.

**Impacto.** A coluna ANTERIOR mostra exatamente o que preencher na maioria das
séries, e mesmo assim os dois números são digitados no teclado virtual. Tocá-la
elimina duas aberturas de teclado por série — ~40 por sessão.

**Recomendação.** Tornar a célula um botão que preenche carga e reps daquela
série. Continua editável depois; nada é confirmado por isso.

### T-03 · Campos de carga e reps sem nome acessível · **P1 · alta · alta**

**Evidência.** Cartão aberto, 18 controles: **6 sem nome nenhum**
(`#w0_0`, `#r0_0`, `#w0_1`, `#r0_1`, `#w0_2`, `#r0_2`); os três botões de RIR
anunciam `·`. O cabeçalho SÉRIE/ANTERIOR/KG/REPS/RIR é `div`, não semântica de
tabela.

**Impacto.** Com VoiceOver o cartão principal do produto é seis campos idênticos
sem indicação de série nem de grandeza. WCAG 4.1.2 e 3.3.2.

**Recomendação.** `aria-label` por campo ("carga da série 1, kg" / "repetições
da série 1") e nos botões de RIR.

### T-04 · O cronômetro não sobrevive ao reload · **P1 · média · alta**

**Evidência.** Descanso rodando → reload → `timer.on = false`. `timerFim` é
estado de módulo, não persistido. A sessão em si **é** recuperada corretamente.

**Impacto.** Somado a S-01, o caminho mais provável de perda: um Voltar acidental
fecha o app, e ao reabrir o descanso sumiu.

**Recomendação.** Persistir o instante-alvo junto do estado e religar no boot se
ainda estiver no futuro. O cronômetro já é escrito por instante-alvo, então isso
é gravar um número.

### T-05 · Descarga pendente não acontece ao sair · **P2 · baixa · alta**

**Evidência.** `queueSave()` tem debounce de 700 ms; `liberaSave()` só é chamado
dentro de `sincroniza()`; o handler de `visibilitychange` **sai cedo quando
`document.hidden`**. Não há `pagehide`.

**Impacto.** Fechar ou mandar o app para segundo plano dentro de 700 ms da última
tecla perde aquela série. Janela estreita, consequência alta (o produto existe
para não perder registro). Com o debounce respeitado a persistência é sólida —
verificado.

**Recomendação.** Descarregar em `pagehide` e em `visibilitychange` quando ficar
oculto.

### T-06 · O cronômetro não diz a que série pertence, e só oferece "parar" · **P2 · média · alta**

**Evidência.** `#timer` contém `3:00` e `parar`. Nada mais.

**Impacto.** Com o app reaberto ou depois de rolar, o número flutua sem
referência. Não há +30 s / −30 s / pular, que é o ajuste que a academia real
cobra (máquina ocupada, série pesada demais).

**Recomendação.** Nomear a origem do descanso e oferecer ±30 s. Fora do escopo
deste ciclo se implicar redesenhar a barra; documentado no plano.

## COMIDA · DADOS · GUIA

**Tipo.** A · top-level, com sub-modos internos.

### G-01 · `#nvemail` e `#nvsenha` sem rótulo · **P2 · baixa · alta**

**Evidência.** Varredura das cinco abas: os únicos dois controles sem nome
acessível fora do treino, ambos em Guia (entrada da sincronização).

**Recomendação.** `aria-label` em ambos.

### D-01 · Alvos abaixo do padrão interno de 46 px · **P3 · baixa · alta**

**Evidência.** `crow-x` 60×32 (remover cardio, 9 ocorrências), `cal-d` 40×40
(dias do calendário), `ins-chip` 33 px de altura.

**Nota honesta.** **Nenhum viola a WCAG 2.2 SC 2.5.8** (mínimo 24×24) — a
varredura nos sete perfis não achou nenhuma violação de norma. O que se viola é
o padrão mais exigente do próprio DESIGN.md, e todos são controles de um toque,
dentro da exceção que aquele documento já prevê. Fica registrado, não corrigido.

## Destinos de tela cheia

Todos herdam S-01, S-02 e S-03. Individualmente estão bem construídos: `‹ voltar`
com alvo cheio, título `h1` que **recebe foco ao entrar**, sem tab bar
convidando a sair no meio. Nenhum achado próprio.

## Folhas

Herdam S-01 e S-04. O teto de três níveis é respeitado e a trava de scroll está
correta para iOS. Nenhum achado próprio.

---

## Resumo

| # | Achado | Sev. |
|---|---|---|
| S-01 | Voltar do sistema fecha o app | **P0** |
| S-02 | Destinos se escondem em vez de empilhar | P1 |
| S-03 | Scroll não restaura em 6 destinos | P1 |
| S-04 | Folha modal sem gestão de foco | P1 |
| T-01 | Cronômetro só na última série | P1 |
| T-02 | Valor anterior não preenche | P1 |
| T-03 | Campos de carga/reps sem nome | P1 |
| T-04 | Cronômetro não sobrevive ao reload | P1 |
| T-05 | Gravação pendente perdida ao sair | P2 |
| T-06 | Cronômetro sem contexto nem ±30 s | P2 |
| G-01 | Dois campos sem rótulo no Guia | P2 |
| D-01 | Alvos abaixo do padrão interno | P3 |

**12 achados em 26 superfícies.** Um P0, seis P1, três P2, um P3 — e uma lista
longa de coisas que foram auditadas e estão certas (02 §O que a pesquisa NÃO
manda mudar).
