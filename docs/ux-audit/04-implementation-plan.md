# 04 · Plano de implementação

A divisão dos sete lotes genéricos do briefing não serve aqui, e vale dizer por
quê: **design system, área segura, viewport, estados vazios e movimento já estão
certos** (02 §O que a pesquisa NÃO manda mudar). Um lote "BATCH 5 — DESIGN
SYSTEM" seria churn sobre um sistema que a auditoria aprovou.

Os lotes abaixo seguem os 12 achados reais, na ordem em que se destravam.

## Regra dos lotes

Depois de cada um: `npm run tipos` · `npm test` · `npm run build` · roteiro no
navegador · captura. Componente compartilhado antes de tela individual.

---

## Lote 1 — Navegação e Voltar · resolve S-01, S-02, S-03

O lote que destrava os outros. Nada de router: o histórico passa a **espelhar**
a pilha derivada de `view`.

1. `src/ui/navegacao.js`, novo, dono de três coisas:
   - `camadasAbertas(view)` — deriva a pilha na ordem de prioridade de
     `telaCheia()`, mais as folhas. Uma função pura, testável.
   - `sincronizaHistorico(n)` — chamada depois de cada `render()`; empurra ou
     consome entradas até a profundidade do histórico bater com `n`.
   - `popstate` → `voltarUmaCamada()`.
2. `voltarUmaCamada()` em `main.jsx` fecha a camada do topo chamando a função de
   fechar que **já existe** para ela. Nada de caminho novo de fechamento.
3. Ligar `entraNoDestino`/`saiDoDestino` — que já existem e funcionam — aos seis
   destinos que faltam, num ponto único.

**Risco.** Médio: mexe no caminho de toda navegação. **Mitigação:** a pilha é
derivada, então nenhum estado novo pode divergir; e `telas.test.js` já cobre
navegação.

## Lote 2 — Foco na folha · resolve S-04

Tudo dentro de `ui/instrumento/folha.jsx`, um arquivo:

1. Ao montar: foco na folha (`tabindex="-1"` no contêiner, como `TelaCheia` já
   faz no `h1`).
2. Enquanto aberta: `inert` no que está atrás. Só na folha de nível mais baixo,
   para não tornar inerte uma folha por outra.
3. Ao desmontar: foco de volta ao `document.activeElement` guardado na abertura.

**Risco.** Baixo, e o mesmo padrão que as telas cheias já usam.

## Lote 3 — Treino ativo · resolve T-01, T-02, T-03, T-04, T-05

O lote de maior valor para o usuário.

1. **T-01** — tirar `if (k !== ult) return;` de `autoTimer()`; disparar em
   qualquer série completa, preservando bi-set e o anti-redisparo por série.
2. **T-02** — `setant` vira botão que preenche carga e reps daquela série.
   Alvo cheio, nome acessível, e o valor continua editável.
3. **T-03** — `aria-label` nos seis campos e nos botões de RIR.
4. **T-04** — persistir o instante-alvo do descanso e religar no boot.
5. **T-05** — descarregar a gravação represada em `pagehide` e em
   `visibilitychange` quando oculto.

**Risco.** T-01 e T-02 mudam interação de altíssima frequência; T-04 toca o
formato do estado (campo novo, opcional, com padrão em `normalizaEstado()` —
o caminho que o projeto já usa).

## Lote 4 — Rótulos que faltam · resolve G-01

`aria-label` em `#nvemail` e `#nvsenha`. Um arquivo, duas linhas.

## Lote 5 — Testes de comportamento

Testes de fluxo para o que a auditoria mediu, para que não volte:
Voltar fecha folha · Voltar sai de destino restaurando scroll · foco entra e
volta na folha · cronômetro dispara em série do meio · anterior preenche ·
cronômetro sobrevive ao reload.

## Fora deste ciclo, e por quê

| Item | Motivo |
|---|---|
| **T-06** cronômetro com contexto e ±30 s | Redesenha a barra `#timer`, que vive fora do Preact e repinta 4×/s. Mudança de forma, não correção de defeito — merece decisão de produto própria. |
| **D-01** alvos abaixo de 46 px | Não viola norma; são controles de um toque, dentro da exceção do DESIGN.md. |
| `visualViewport` | O app não tem CTA fixo competindo com o teclado; esconder a tab bar no foco já resolve. Complexidade sem problema medido. |
| Fila de sincronização offline | Os dados são locais; só a sincronização depende de rede, e ela já represa e tenta de novo. |
| Screen Wake Lock | **Já implementado** (`segurarTela`), com recuperação no `visibilitychange`. |
| Quebrar `main.jsx` | 5.779 linhas incomodam, mas refatorar por preferência é o que o briefing proíbe. O casco encolhe por tela convertida, como o projeto já vem fazendo. |
