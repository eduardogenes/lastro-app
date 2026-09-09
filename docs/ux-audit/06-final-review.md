# 06 · Revisão final

Feita depois da implementação, relendo o resultado como se outra pessoa o
tivesse escrito. O que segue inclui o que ficou torto no caminho.

## O que foi verificado, e como

Tudo abaixo foi medido em Chromium com emulação de telefone (toque, UA de iOS,
`?palco=0`), com estado semeado de 36 sessões, 40 exercícios com histórico e 15
pesagens, nos perfis 320×640 · 360×800 · 375×667 · 390×844 · 412×915 · 430×932 ·
844×390.

| Verificação | Antes | Depois |
|---|---|---|
| Voltar com folha aberta | fecha o app (`about:blank`) | fecha a folha |
| Voltar em destino de tela cheia | fecha o app | volta à aba |
| Voltar na raiz | fecha o app | fecha o app (correto) |
| `history.length` ao abrir camada | 2, sempre | +1 por camada |
| Fechar pelo `×` | entrada órfã no histórico | histórico volta junto |
| Scroll ao voltar (Dados → sessão) | 1200 → 0 | 1200 → 1200 |
| Scroll ao voltar (Guia → Programa) | 1500 → 0 | 1500 → 1500 |
| Scroll ao voltar (Treino → histórico) | 657 → 600 | 657 → 657 |
| Foco ao abrir folha | fica no acionador | entra na folha |
| Fundo atrás da folha | 39 elementos tabuláveis | `inert` |
| Tab dentro da folha | escapa em 3 Tabs | fica |
| Foco ao fechar folha | perdido | volta ao acionador |
| Descanso após série 1 de 3 | não começa | começa |
| Descanso após série 2 de 3 | não começa | começa |
| Coluna ANTERIOR | `div` inerte | botão de 44 px que registra a série |
| Controles sem nome no cartão | 6 de 18 | **0** |
| Controles sem nome no app inteiro | 8 | **0** |
| Descanso após reload | perdido | religa com o tempo restante e a procedência |
| Saber de qual série é o descanso | não dizia | "descanso · série 2 · Chest press…" |
| Esticar ou encurtar o descanso | só "parar" | `−15` e `+15`, alvo de 40 px |
| Série digitada + app oculto em 250 ms | perdida | em disco |
| Registrar 3 séries iguais | ~9 interações | **3 toques** |

Suíte: **626 → 649 testes**, todos verdes. `tsc --noEmit` limpo. Build limpo.

## Segunda rodada: a altura das telas

Levantada depois, por relato de uso — a auditoria original mediu largura,
overflow, alvo e contraste, e **não mediu altura**. Foi um buraco de método: as
duas telas mais longas do app passaram batido porque cada parte delas, isolada,
estava certa.

| Aba | Antes | Depois |
|---|---|---|
| Guia | 6.945px · **8,2 telas** | prescrição **1,8** · o app **2,1** |
| Dados | 3.955px · **4,7 telas** | corpo **1,9** · treino **3,2** |

**Guia.** Uma seção era 64% da tela inteira: as catorze regras de execução do
treinador, ~6.800 caracteres de prosa, sempre abertas. São referência — lê-se
uma vez e depois se volta procurando UMA regra, o que era rolar cinco telas.
Cada regra virou `LinhaExpansivel`: o título à vista, a prosa a um toque. A
lista fechada não esconde nada, porque o título **é** a regra; e de quebra ela
virou o índice das regras, que não existia.

**Dados.** Aqui não havia vilão — oito seções de tamanho parecido, todas
legítimas. Dividida por assunto em `corpo` e `treino` com o mesmo `Chips` que a
COMIDA já usava para caber em uma tela. `corpo` é o padrão porque é onde mora o
veredito, a única coisa da tela que pede uma ação.

**Terceira passada no guia, e aí veio o diagnóstico de verdade.** Encolher as
regras resolveu o sintoma; o problema era que a tela juntava **três naturezas**
sob um nome só: o que foi prescrito (que se lê), a máquina do app — nuvem,
backup, restaurar, apagar — (que se opera) e atalhos para outros destinos. O
índice interno "ir para" era a prova: uma tela que precisa de sumário está
dizendo que é mais de uma.

O que saiu, e por quê:

| Removido | px | Motivo |
|---|---|---|
| índice "ir para" | 138 | sintoma, não recurso — com dois modos de duas telas não há o que sumariar |
| bloco "Seus treinos" | 198 | `abrir o programa` já existia em TREINO e em DADOS; esta era a terceira porta, e a única embrulhada num parágrafo |
| bloco "Retrospectiva" | 177 | mudou de casa: foi para DADOS · treino, junto do resto do que é olhar para trás |
| primeira frase de "Exportar" | ~20 | repetia o rótulo do botão logo abaixo |
| `CTX.vaiParaSecao` e `.ins-secao[id]` | — | código morto assim que o índice saiu |

O que **não** saiu, e por quê: o modo deload continua escondido no guia em vez
de ir para o TREINO. Um interruptor que corta metade das séries não deve estar a
um toque no meio de uma sessão — o app existe em parte para frear, e o caminho
de menor esforço tem que ser o conservador. O estado dele já aparece no TREINO
quando ligado.

Nenhum componente novo em nenhuma das passadas: `LinhaExpansivel` e `Chips` já
existiam no sistema.

**22 testes quebraram, e estavam certos em quebrar** — liam conteúdo que agora
mora num modo. O harness ganhou `a.modo()`, que toca no chip como o usuário
tocaria; ele devolve promessa porque `useState` do Preact agenda o render num
microtask, ao contrário do `render()` do casco. Dois testes precisaram ser
reescritos, não remendados: um afirmava que a regra da cintura e a do cardio
estavam na mesma tela, o que deliberadamente deixou de ser verdade.

## O que quebrei e consertei no caminho

**Regressão visual na coluna ANTERIOR.** Ao transformá-la em botão, o CSS novo
trazia `font: inherit; color: inherit` para desfazer o estilo de botão do
navegador. Como `.setant-b` vem depois de `.setant` com a mesma especificidade,
ele ganhou a cascata e a coluna saltou de 11 px em mono cinza para o tamanho do
texto da linha — visível na captura de comparação, não em nenhum teste. Corrigido
tirando `font` e `color` da regra: o elemento também é `.setant`, e é de lá que
os dois devem vir. A captura depois da correção é idêntica à de antes.

**`inert` como propriedade não é consultável.** A primeira versão fazia
`el.inert = true`. Funciona no Chromium, mas o jsdom não reflete a propriedade
no atributo, e o teste que cobrava o isolamento do fundo passava em branco.
Trocado por `setAttribute('inert', '')` — mesmo efeito no navegador, e
verificável por seletor.

**A restauração de scroll não pegava.** Estava certa e mesmo assim voltava a
zero: o navegador restaura, **depois** do `popstate`, a posição que ele associou
à entrada — e desfazia o `saiDoDestino()` meio quadro depois. Resolvido com
`history.scrollRestoration = 'manual'`.

## Duas medições minhas que estavam erradas

Registro porque uma auditoria que só publica os acertos do próprio método vale
menos:

1. **"Reload no meio do treino perde a série."** Falso. O `addInitScript` do meu
   driver ressemeava o `localStorage` a cada carregamento e apagava o que o app
   tinha gravado. Corrigido o driver, a persistência se mostrou sólida: a sessão
   volta, o dia volta, a aba volta. O que sobrou de real foi só a janela de
   700 ms do debounce — bem menor, e é o que T-05 fechou.
2. **"Finalizar sessão não encerra" e "só 2 de 3 séries registradas."** Ambas do
   meu roteiro: o Playwright dispensa `confirm()` por padrão (o app pergunta
   antes de finalizar com exercício pendente), e meu seletor `:nth-of-type`
   contava os elementos errados. Com o diálogo aceito e o seletor certo, a
   jornada inteira passa.

Um terceiro caso foi de fixture: o primeiro teste de série semeava a presença no
dia A, o que empurrava a rotação para o B — `iniciarSessao()` abria o treino de
pernas e os campos `w0_0` eram de outro exercício. A presença passou para HX.

## O que continua aberto, e por quê

| Item | Severidade | Por que não mexi |
|---|---|---|
| **D-01** alvos abaixo de 46 px | P3 | **Nenhum viola a WCAG 2.5.8** — a varredura nos sete perfis não achou violação de norma. O que se viola é o padrão interno, e todos são controles de um toque, dentro da exceção que o DESIGN.md já prevê. |
| `visualViewport` | — | Não há CTA fixo competindo com o teclado; esconder a tab bar no foco resolve. Complexidade sem problema medido. |
| Fila de sincronização offline | — | Os dados são locais. Só a sincronização depende de rede, e ela já represa e tenta de novo. |
| Quebrar `main.jsx` (5.779 linhas) | — | Refatorar por preferência é o que o briefing proíbe. O casco encolhe por tela convertida, como o projeto já vem fazendo. |
| `#timer` e `#toast` não ficam inertes com folha aberta | — | São irmãos de `#app`, fora do isolamento. Tornar o "parar" do cronômetro inalcançável durante uma folha seria pior que o vazamento de foco que resta. |

## Efeito colateral que valeu a pena

A bancada de mesa ganhou fidelidade de graça: com o histórico ligado, o Voltar
da janela do computador agora **fecha a folha dentro do aparelho**, em vez de
navegar a bancada para fora. Verificado.

## O que a auditoria decidiu NÃO tocar

Metade do valor está aqui. Tema, tipografia, escala de espaço, ausência de
sombra, a folha como único modal, o registro sem botão de salvar, a recuperação
de sessão, as áreas seguras, os estados vazios, o `svh`, o aviso de retrato, o
wake lock e a ergonomia de uma mão **já estavam no padrão que a pesquisa
recomenda** — e em dois pontos (registro sem salvar, coluna ANTERIOR por série)
acima do que as referências maduras fazem. Zero overflow horizontal em sete
perfis, antes e depois.

O produto não precisava de redesenho. Precisava de um Voltar.
