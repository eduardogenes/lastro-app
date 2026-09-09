# LASTRO — Contrato de UX

As regras de comportamento do app. [DESIGN.md](../DESIGN.md) diz como as coisas
se **parecem**; este documento diz como elas se **comportam**. Onde os dois se
tocam, DESIGN manda na forma e este manda na navegação.

Escrito depois da auditoria de setembro de 2026
([docs/ux-audit/](ux-audit/)). Vale para tela nova.

---

## 1 · As três camadas, e só três

| Camada | Estado | Tem tab bar? | O que o Voltar faz |
|---|---|---|---|
| **Aba** | `view.aba` | sim | sai do app (é a raiz) |
| **Destino** | flag em `view` | **não** | volta à aba, na posição anterior |
| **Folha** | `view.pilha[]` | irrelevante (cobre) | fecha a folha do topo |

Não existe quarta camada. Uma tela nova é uma destas três coisas; se não for
nenhuma, a pergunta está errada.

**A pilha de navegação é derivada, nunca escrita à mão.** `camadasAbertas()` lê
`view` e devolve a lista de camadas na ordem em que o usuário as vê. Quem abre
uma camada só liga a flag; quem fecha só desliga. O histórico se sincroniza
sozinho depois de cada render.

## 2 · Voltar

**Voltar desfaz exatamente uma camada.** Vale para o botão `‹ voltar`, para o
`×` da folha, para o toque no véu, para o Esc e para o **Voltar do sistema** —
todos passam pelo mesmo caminho.

- Folha aberta → fecha a folha (só a do topo).
- Destino aberto → volta à aba **e restaura a posição de leitura**.
- Raiz de uma aba → sai do app. Não se intercepta isso: um app que não deixa
  sair com o Voltar é pior que um que sai cedo demais.

**Nunca** usar Voltar para: ir para a Home, resetar rota, trocar de aba,
descartar sessão de treino.

**Proibido** pôr `‹ voltar` na raiz de uma aba.

### Voltar · Fechar · Cancelar · Concluir

| Rótulo | Significa | Onde |
|---|---|---|
| `‹ voltar` | sobe na hierarquia | topo de destino |
| `×` | encerra a superfície | cabeçalho de folha |
| cancelar | sai sem aplicar | só onde há alteração não aplicada |
| salvar / concluir | aplica | ação primária, último elemento |

Não misturar. Uma folha nunca diz "voltar"; um destino nunca diz "fechar".

## 3 · Posição de leitura

| Navegação | Comportamento |
|---|---|
| Entrar num destino | topo do destino |
| **Voltar de um destino** | **restaura a posição exata** |
| Fechar folha | mantém a posição, sem exceção |
| Trocar de aba | topo |
| Atualizar dado na mesma tela | não mexe |

Entrar guarda (`entraNoDestino`), sair devolve (`saiDoDestino`), por chave de
destino — nunca por pilha, porque destino que abre outro por cima precisa
devolver os dois.

## 4 · Cabeçalho

Três formas, e nenhuma quarta:

- **Raiz de aba** — `Cabecalho`: sobrancelha, título, no máximo **uma** ação de
  estado à direita. Sem Voltar.
- **Destino** — `TelaCheia`: `‹ voltar` primeiro, título `h1` que **recebe foco
  ao entrar**, ação opcional à direita.
- **Folha** — `Folha`: sobrancelha, título, meta opcional, `···` opcional, `×`
  sempre por último.

Tela cheia focada (treino ativo) pode trocar o título por contexto vivo — o
relógio sticky de TREINO é o caso, e é sticky com `top: var(--sa-top)`.

## 5 · Tab bar

Cinco destinos, fixos: HOJE · TREINO · COMIDA · DADOS · GUIA.

- É **navegação**, nunca ação. Nenhum item salva, adiciona, finaliza ou confirma.
- Some em destino de tela cheia (o assunto é um só, e ela convidaria a sair no
  meio).
- Some enquanto houver campo em foco (barra `fixed` no iOS flutua sobre o
  teclado).
- **Continua visível durante o treino ativo**: o treino acontece dentro da aba
  TREINO, e sair para conferir a comida e voltar é um caminho legítimo — a
  sessão não se perde. Esconder a navegação aqui protegeria contra um risco que
  não existe.
- `padding-bottom: env(safe-area-inset-bottom)`, com os 46 px de alvo **acima**
  dela.

## 6 · Folhas

- Máximo três níveis: 50 · 70 · 80. Uma quarta é redesenho, não exceção.
- Ao abrir: trava o scroll do corpo (`position: fixed` com o deslocamento
  gravado), **manda o foco para dentro** e torna **inerte** o que está atrás.
- Ao fechar: destrava, devolve o scroll, **devolve o foco ao acionador**, e a
  rota por baixo não muda.
- Fecham por: `×`, véu, Esc e Voltar do sistema.
- Folha é tarefa curta. Fluxo de várias etapas é destino.

## 7 · Ação fixa no rodapé

Não usar por reflexo. Só quando concluir a tela depende dela.

Se existir: o conteúdo ganha `padding-bottom` equivalente, o último elemento
continua inteiro visível, `safe-area-inset-bottom` é respeitada, e ela **não
coexiste com a tab bar**. Se as duas forem necessárias ao mesmo tempo, a tela
está errada.

## 8 · Treino ativo

O contexto é: de pé, uma mão, cansado, olhando por segundos.

- **A série entra no histórico assim que carga e reps estão preenchidas.** Não
  existe botão de salvar, não existe confirmação. Apagar o campo desfaz.
- **O valor anterior é a referência e o ponto de partida** — visível na linha da
  série correspondente, e **tocável para preencher**.
- **O descanso começa sozinho ao completar qualquer série.** Exceções: bi-set
  encadeia sem pausa; a mesma série não redispara.
- **O cronômetro é escrito por instante-alvo**, nunca por contador — sobrevive à
  tela apagada, ao segundo plano e ao reload.
- Ação frequente não mora atrás de menu, `···` ou tela intermediária.
- Estado de treino grava por interação e **descarrega ao sair** (`pagehide`,
  `visibilitychange` oculto).

## 9 · Ações destrutivas

- Reversível → executa e oferece desfazer.
- Difícil de reverter → confirma, com o que se perde dito em português.
- Destrutivo mora **um nível para dentro**, em coral, nunca na lista.
- Não confirmar ação comum: confirmação repetida deixa de ser lida.

## 10 · Estados

Toda tela declara os quatro: **carregando · vazio · erro · conteúdo**.

- Vazio explica o que é a área, por que está vazia e qual é a ação.
- Erro aparece perto do que o causou, permite tentar de novo e **nunca apaga o
  que o usuário digitou**.
- Sem layout shift ao sair de carregando.

## 11 · Acessibilidade — piso

- WCAG 2.2 AA onde aplicável.
- **Todo controle tem nome acessível.** Campo sem rótulo visível leva
  `aria-label`. Botão cujo conteúdo é símbolo (`·`, `×`, `···`) leva `aria-label`.
- Alvo ≥ 24×24 (norma); ≥ 46 px para controle repetido (padrão interno);
  28 px só para toggle de um toque em linha densa.
- Foco sempre visível, e nunca escondido atrás de sticky.
- Estado nunca só por cor.
- `prefers-reduced-motion` desliga os dois movimentos do sistema.

## 12 · Viewport e área segura

- Altura de tela cheia: `100vh` só como recuo, `100svh` valendo.
- `env(safe-area-inset-*)` via tokens `--sa-*` em cabeçalho, tab bar, folha e
  sticky. Ação importante não encosta no Home Indicator.
- Sem `overflow` diferente de `visible` entre um sticky e quem rola — senão o
  sticky troca de âncora e some.
- Retrato é o cenário. Deitado mostra `#deitado`, que **preserva todo o estado**.

---

# Checklist de tela nova

Antes de considerar pronta:

- [ ] tipo definido: aba, destino ou folha
- [ ] cabeçalho na forma certa do tipo
- [ ] Voltar desfaz uma camada, e só uma
- [ ] tab bar conforme §5
- [ ] posição de leitura ao entrar e ao voltar definida
- [ ] ação fixa justificada (ou ausente)
- [ ] teclado: campo em foco continua visível
- [ ] área segura em cima, embaixo e nas laterais
- [ ] estado de carregando
- [ ] estado vazio que explica e aponta a ação
- [ ] estado de erro com recuperação, sem perder entrada
- [ ] foco entra ao abrir e volta ao fechar
- [ ] todo controle com nome acessível
- [ ] alvos conforme §11
- [ ] contraste conforme DESIGN.md
- [ ] 320 px de largura sem overflow horizontal
- [ ] 390 e 430 px conferidos
- [ ] deitado não quebra nem reinicia
- [ ] Voltar do sistema conferido
- [ ] PWA instalado conferido
- [ ] reload no meio da tarefa preserva o estado
