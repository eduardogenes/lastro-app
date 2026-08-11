# Prompt para o Claude Code

Cole o texto abaixo na primeira mensagem, com a pasta `design_handoff_instrumento/` dentro do repositório do app de treinos.

---

Tenho um app de treinos neste repositório e quero fundir nele um app de nutrição que já existe como protótipo. A pasta `design_handoff_instrumento/` tem tudo.

**Comece lendo, nesta ordem, antes de escrever qualquer código:**

1. `design_handoff_instrumento/DESIGN_SYSTEM.md` — o design system ("Instrumento"): inegociáveis, tokens, anatomia de cada componente, 12 leis de UX e, na §5, o plano de fusão.
2. `design_handoff_instrumento/README.md` — o handoff: cada tela, comportamento, state.
3. `design_handoff_instrumento/tokens.css` — as variáveis.
4. `design_handoff_instrumento/Plano Eduardo.dc.html` — o app de nutrição funcionando. É **referência de design**, não código para copiar. Abra no navegador para ver o comportamento real.
5. `design_handoff_instrumento/Design System.dc.html` — o espécime visual do sistema.

**Depois disso, antes de codar, me responda:**

- Como o repositório está organizado hoje (framework, estrutura de telas, navegação, camada de estado, styling).
- Onde o design atual do app de treinos conflita com o Instrumento, e o que você propõe fazer em cada conflito.
- O plano de fusão em passos, com o que muda em cada arquivo.

**Não comece a implementar até eu aprovar o plano.**

---

## Regras da fusão

**Design system.** O Instrumento passa a valer para o produto inteiro, inclusive para as telas de treino que já existem. Transcreva `tokens.css` para o formato de tema da stack (não deixe hex solto no código). Os 6 inegociáveis do DESIGN_SYSTEM.md §1 valem sem exceção: raio zero, fio de 1px em vez de cartão, um único acento com significado, número em mono e prosa em display, rótulo mono como estrutura, quase nenhum movimento. Sem sombra, sem gradiente, sem emoji, sem tela de parabéns.

**Navegação.** Uma shell só, uma tab bar só, cinco abas: `HOJE · TREINO · COMIDA · DADOS · GUIA`. Nada de navegação aninhada ou de dois apps lado a lado.

**HOJE é a tela da fusão.** Uma timeline única com refeições e sessão de treino no mesmo eixo de tempo, ordenada por hora — o pré-treino das 5h45 e o treino das 6h15 são a mesma sequência. O cartão-foco no topo mostra a próxima coisa, seja ela comida ou treino.

**Estado compartilhado — é aqui que os dois viram um produto só.** Estes quatro precisam ter fonte única:
- `dayType` (A–F | descanso) e o calendário semanal de 7 posições — a nutrição tira as calorias dele, o treino tira a sessão. Um valor, um editor.
- `performance` — hoje é um toggle manual que alimenta a regra calórica. Passe a **calcular** a partir das cargas registradas (ex.: e1RM estimado subindo em 2 semanas) e mantenha o toggle como override manual.
- `pesos[]` — histórico de peso, move o veredito calórico e qualquer métrica relativa de força.
- `ajuste` (−1 | 0 | +1) — estado do ±150 kcal. O treino precisa ler: semana de corte não é semana de buscar PR.

**Reuso de componente (não recrie do zero).** Linha de timeline → linha de exercício. Grade de fios → carga/reps/RIR/volume. Linha expansível + stepper → registrar série (±2,5 kg, ±1 rep). Cartão-veredito → regra de progressão de carga. Sparkline → volume ou e1RM por semana. Ticks → séries concluídas. Pilha de sheets → exercício → seletor → editor.

**Modelo de dados do treino espelha o da nutrição.** A nutrição usa biblioteca + programa + log do dia:

```
foods:  { id, n, cat, u:'g'|'ml', kcal, p, c, g, cru }
plan:   [ { id, t:'HH:MM', n, tag, quando:'sempre'|'treino'|'alta', nota,
            itens: [ { f: foodId, q, arroz?, alta? } ] } ]
day:    { data, code, done{}, agua, escala{} }
```

Faça o mesmo para treino: `exercises` (biblioteca) + `program` (sessões com condições por exercício) + `session` (log de hoje). Mesma forma, mesmas afordâncias de edição, mesma regra de persistência.

**Comportamento que precisa sobreviver à migração:**
- Sem modo de edição. Todo objeto carrega o próprio jeito de editar (`···` no container, tap-para-expandir na folha).
- Destrutivo um nível para dentro, em coral, nunca na lista.
- Nada derivável é digitado duas vezes; onde um número é derivado, uma linha de procedência de 10px diz de onde veio.
- Edição muda o plano para sempre; ajuste de porção é explicitamente "só de hoje" — e o rótulo diz qual é qual.
- Toda mudança global tem um restaurar documentado.
- Persistência silenciosa a cada mutação; estado do dia é carimbado com a data e zera sozinho.
- Escopo por regra, não por duplicação: um programa com condições por objeto, não sete telas de dia.

**Copy:** português, segunda pessoa, imperativos curtos, sem hype. Estado vazio é uma frase, não uma ilustração.

**Toque:** 44–46px para qualquer controle numérico repetido; 26–30px só para toggle de um toque dentro de linha densa. Nada de texto abaixo de 13px em prosa ou 9px em rótulo mono.

## Definição de pronto

- As telas de treino existentes foram repintadas no Instrumento — não só as novas.
- `dayType`, `performance`, `pesos[]` e `ajuste` têm uma única fonte, sem duplicação de estado.
- HOJE mostra treino e comida na mesma timeline.
- Nenhum hex fora do arquivo de tema.
- Roda no Safari do iPhone em tela cheia, com `env(safe-area-inset-*)` respeitado em cima e embaixo.
