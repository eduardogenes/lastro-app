# 02 · Princípios, e o que cada um cobra do Lastro

Só o que decide alguma coisa aqui. Cada entrada é
**PRINCÍPIO → POR QUE EXISTE → COMO SE APLICA AO LASTRO**, e a última linha é a
que vale.

## Navegação e Voltar

**Voltar do sistema desfaz a última camada.**
Existe porque no Android o Voltar (botão ou gesto) é o caminho principal de
navegação, e num PWA instalado ele opera sobre o histórico do documento. Se o
app não põe entradas no histórico, o primeiro Voltar sai do app.
→ **Lastro:** o app não chama `history.pushState` em lugar nenhum
(`history.length` fica em 2 para sempre — medido). Um Voltar no meio do treino
fecha o app. É o achado P0 desta auditoria. A correção é uma entrada de
histórico por camada aberta e um `popstate` que fecha a do topo.
*(WICG, MDN History API, padrão confirmado por implementações maduras.)*

**Voltar ≠ Fechar ≠ Cancelar ≠ Concluir.**
Semântica diferente, expectativa diferente: subir na hierarquia, encerrar uma
superfície, sair sem aplicar, aplicar.
→ **Lastro:** as telas cheias dizem `‹ voltar` (correto — subem na hierarquia).
As folhas dizem `×` (correto — encerram superfície). Mantém-se; falta só ligar
as duas ao Voltar do sistema.

**Restaurar a posição de leitura ao voltar.**
Existe porque a lista é o contexto: voltar ao topo obriga a reencontrar o lugar,
e o custo cresce com o tamanho da lista.
→ **Lastro:** o mecanismo já existe e está certo (`entraNoDestino` /
`saiDoDestino`), mas só está ligado em 4 dos 10 destinos. Medido: Dados y=1200 →
volta em 0; Guia y=1500 → volta em 0.

## Modais

**Ao abrir um diálogo modal o foco entra nele; o resto da página fica inerte; ao
fechar, o foco volta ao elemento que o abriu.**
Existe porque `aria-modal` só descreve a intenção — quem impede o foco de vazar
é `inert` ou um trap. Sem isso, teclado e leitor de tela continuam navegando
atrás do modal, e ao fechar o cursor está perdido. WCAG 2.2 SC 2.4.3 e 2.1.1.
→ **Lastro:** `role="dialog"` e `aria-modal="true"` estão declarados, mas
**nada** disso é feito: medido, o foco fica no botão que abriu, 39 elementos
continuam tabuláveis atrás da folha, três Tabs saem da folha, e ao fechar o foco
não volta. A trava de scroll (`position: fixed`) já está correta.
*(W3C WAI — Understanding SC 2.4.3; padrão `inert`.)*

**Modal é tarefa curta e delimitada; empilhar modal é sinal de redesenho.**
→ **Lastro:** o teto de três níveis já está escrito e respeitado
(refeição → seletor → editor). Não há modal virando miniaplicativo. **Nada a
corrigir** — é um acerto do sistema atual.

## Registro de treino

**O cronômetro de descanso começa quando a série é concluída — cada série.**
Existe porque o descanso relevante é o que separa duas séries; é a espera mais
frequente da sessão. Loggers maduros disparam a cada série marcada.
→ **Lastro:** `autoTimer()` tem `if (k !== ult) return;` — só dispara na
**última** série do exercício. Medido: séries 1 e 2 de 3 não iniciam nada. Entre
séries o usuário tem de achar e tocar "DESCANSO 3MIN".

**O valor anterior deve estar à vista e servir de ponto de partida.**
Existe porque a maior parte das séries repete ou incrementa a anterior; digitar
do zero é trabalho administrativo.
→ **Lastro:** a coluna ANTERIOR já existe e é um acerto raro — mostra a série
correspondente, não "a última vez" genérica. Mas é uma `<div>` inerte. Torná-la
tocável remove dois usos do teclado por série.

**Ação frequente e reversível prefere desfazer a confirmar.**
→ **Lastro:** a série entra no histórico sem botão de salvar — o modelo certo, e
melhor que o de qualquer referência. Como o campo continua editável, o "desfazer"
já existe: é apagar o campo. **Nada a corrigir.**

**Estado de treino é crítico: autosave por interação.**
→ **Lastro:** grava com debounce de 700 ms e **recupera a sessão no reload**
(verificado). A falha é estreita e real: `visibilitychange` sai cedo quando
`document.hidden`, então não há descarga pendente ao fechar/mandar para segundo
plano. Matar o app dentro de 700 ms da última tecla perde aquela série.

## Ergonomia e alvos

**Alvo de toque ≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8, AA); o confortável para uso
repetido é bem maior.**
→ **Lastro:** o próprio DESIGN.md manda 46 px para controle repetido, o que é
mais exigente que a norma. Medido: **nenhuma violação de 2.5.8** em nenhuma tela.
Alguns controles ficam abaixo do padrão *interno* (`crow-x` 60×32, `cal-d`
40×40, chips 33 px de altura) — são raros e de um toque, dentro da exceção que o
documento já prevê. Prioridade baixa.

**Ação muito frequente perto do polegar; ação rara no topo ou em overflow.**
→ **Lastro:** já obedecido — carga/reps ficam no meio do cartão, e configuração
mora em Guia. **Nada a corrigir.**

## Teclado virtual

**O campo em foco e a ação relevante continuam visíveis com o teclado aberto.**
→ **Lastro:** a tab bar some no `focusin` (solução simples e adequada, porque
barra `fixed` no iOS flutua sobre o teclado). Não há uso de `visualViewport` —
aceitável, já que o app não tem CTA fixo competindo com o teclado. **Sem ação
neste ciclo**; fica documentado como vulnerabilidade conhecida.

## Nomes acessíveis

**Todo controle precisa de nome acessível (WCAG 4.1.2); campo precisa de rótulo
programático (3.3.2).**
→ **Lastro:** medido no cartão de exercício aberto — **6 dos 18 controles sem
nome nenhum** (os campos de carga e reps das três séries), e os três botões de
RIR anunciam "·". O cabeçalho da tabela é visual, não semântico. Fora do treino,
`#nvemail` e `#nvsenha` no Guia também não têm rótulo.

## Viewport e área segura

**Usar `svh`/`dvh` em vez de `100vh`; respeitar `env(safe-area-inset-*)`.**
→ **Lastro:** já feito, e bem: `min-height: 100vh; min-height: 100svh`, tokens
`--sa-*` em cabeçalho, tab bar, folhas e sticky. Medido: **zero overflow
horizontal** em todos os perfis. **Nada a corrigir.**

## Movimento

**Respeitar `prefers-reduced-motion`.**
→ **Lastro:** já respeitado, e o sistema tem só dois movimentos declarados.
**Nada a corrigir.**

---

### O que a pesquisa NÃO manda mudar

Vale registrar, porque metade do valor de uma auditoria é não mexer no que está
certo: tema escuro, tipografia, escala de espaço, ausência de sombra, folha como
único modal, registro sem botão de salvar, recuperação de sessão, área segura,
estados vazios e o aviso de retrato **já estão no padrão que a pesquisa
recomenda**, e em dois pontos (registro sem salvar, coluna ANTERIOR por série)
acima do que as referências fazem.

**Fontes:**
[W3C WAI — SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html) ·
[W3C WAI — F85](https://www.w3.org/WAI/WCAG21/Techniques/failures/F85) ·
[Accessible Dialog & Modal Guide](https://accessibility.build/guides/accessible-dialog) ·
[WICG — Set back button URL in PWAs](https://discourse.wicg.io/t/set-back-button-url-in-pwas/4112/) ·
[Closing dialogs by going back](https://dev.to/maikmichel/closing-dialogs-by-going-back-46pe) ·
[Hevy — Automatic Workout Rest Timer](https://www.hevyapp.com/features/workout-rest-timer/) ·
[Hevy — Track Workouts](https://www.hevyapp.com/features/track-workouts/)
