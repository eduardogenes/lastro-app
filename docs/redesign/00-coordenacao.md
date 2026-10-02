# 00 · Coordenação — checklist de execução

Arquivo do coordenador. Serve para uma coisa: **retomar o trabalho em qualquer
ponto**, inclusive numa sessão nova, sem depender da memória de quem coordenava.

Não é insumo de ninguém do time. Nenhum agente cego recebe este arquivo, e ele
não cita nada do app atual — achados aparecem só pelo número do fato (F…).

Legenda: `[x]` feito · `[~]` em andamento · `[ ]` a fazer · `[!]` bloqueado ou
pede atenção do dono.

---

## Como retomar (ler primeiro)

1. Ler `00-briefing.md` inteiro. Ele manda mais que este arquivo.
2. Achar aqui o **primeiro item não marcado** e o bloco a que ele pertence.
3. **Conferir o disco antes de agir** (`ls docs/redesign/`, `wc -l`, `git status`):
   este checklist pode estar um passo atrás do que os agentes já escreveram.
4. Agente interrompido:
   - mesma sessão → retomar pelo ID (tabela abaixo) com `SendMessage`, dizendo
     o que existe no disco e o que falta;
   - sessão nova → novo agente do mesmo papel, com o prompt salvo no Anexo, mais
     um parágrafo "retome: no disco já existe X, falta Y".
5. Marcar o item **no momento em que conclui**, não em lote depois.
6. Nas três paradas, parar de verdade: não adiantar onda, não chutar resposta.

## Agentes

| Papel | ID | Estado | Observação |
|---|---|---|---|
| A1 · Escriba | `a101eac1b015f5e82` | [x] | caiu por limite em 01/10, retomado por `SendMessage`, entregou |
| A2 · Pesquisador do uso | `aea96f3007c18a6c9` | [x] | perguntas entregues e aprovadas (sessão de 01/10, primeira) |
| A2 · novo (uso) | `aa98c0ac48e29de74` | [x] | sessão nova, B1 + B2; 02-uso.md aprovado depois de uma devolução |
| D1 · pasta A | `a833d82e4cce88d95` | [x] | entregue e conferida |
| D2 · pasta B | `af436860cf1f32133` | [x] | entregue e conferida |
| D3 · pasta C | `a19c8199d8bb2abc2` | [x] | entregue e conferida |
| D4 · pasta D | `ae937a74dfef3fe2e` | [x] | entregue e conferida |
| C1 · Crítico | `a531da66b7c3b010a` | [~] | disparado 02/10, segundo plano |
| C2 · Viabilidade | `a718a3cfd8e179c93` | [~] | disparado 02/10, segundo plano |
| C3 · Acesso | `ad8473e0553894aba` | [~] | disparado 02/10, segundo plano |
| C4 · Voz | `aaa9339bc3e9a385a` | [~] | disparado 02/10, segundo plano |
| R · Curador | — | [ ] | |

---

## ONDA 1 · Os fatos

### 1.1 · A1 escreve os fatos

- [x] 1.1.a Prompt do A1 escrito e salvo (Anexo A)
- [x] 1.1.b A1 disparado
- [x] 1.1.c `01-fatos.md` escrito (F1–F300, 14 seções + lacunas)
- [!] 1.1.d A1 caiu por limite antes do cortes → retomado com `SendMessage`
- [x] 1.1.e Releitura de vazamento do A1 (passada separada) — em curso; o diff já
      mostra troca de vocabulário
- [x] 1.1.f `01-fatos-cortes.md` escrito (decisões removidas, nomes do app,
      fronteira, fontes em material proibido por número de F, o que a releitura pegou)
- [x] 1.1.g Relatório curto do A1 recebido: 300 fatos, 108 cortes (C1–C108),
      34 fronteiras (B1–B34), 8 fontes à parte + 8 por nome de arquivo

### 1.2 · Conferência do coordenador contra o §3 — antes do A2

O A2 também é cego e lê o `01-fatos.md`: a conferência vem antes dele, não só
antes da onda 2.

- [x] 1.2.a Leitura linha a linha da versão anterior à releitura do A1
- [x] 1.2.b Varredura: trechos entre aspas que existem como texto de interface
      (hoje ou no histórico)
- [x] 1.2.c Varredura: palavras de superfície, cor, medida, unidade de tela
- [x] 1.2.d Varredura: vocabulário de classe, token e nome de arquivo de
      interface → limpo (só palavras comuns da língua)
- [x] 1.2.e Re-conferir o **diff** do `01-fatos.md` depois da releitura do A1
- [x] 1.2.f Cruzar o `01-fatos.md` com os nomes que o A1 listar no cortes
      (cada nome do app → `grep` no fatos)
- [x] 1.2.g Ler o cortes procurando fato cortado por excesso (perda de fato
      também é defeito — "exaustivo em fato")
- [x] 1.2.h Veredito: **devolvido ao A1** (lista D1–D15 abaixo)
- [x] 1.2.j **`01-fatos.md` APROVADO** (F1–F301), depois da devolução; varreduras 1–4 limpas
- [x] 1.2.i Se devolvido: A1 corrige → re-conferir só os F devolvidos → aprovar

**Devolução ao A1** (depois da releitura dele; a anterior está no Diário):

| # | F | Tipo |
|---|---|---|
| D1 | F139 | notação de exibição de uma série |
| D2 | F200, F292 | rótulo de interface entre aspas |
| D3 | F274, F275, F281, F284 | texto de interface entre aspas |
| D4 | F233 | comportamento de interface como fato |
| D5 | F273 | estado descrito pela mensagem (leve) |
| D6 | F150 | nome do app (o A1 reconheceu em B20) |
| D7 | F218 | rótulo do app |
| D8 | F152, F158, F270 | verbo do app (tabela §2 do cortes) |
| D9 | F203, F138 | opções de controle apresentadas como fato |
| D10 | F108 | texto do app no exemplo |
| D11 | fontes (cortes §1.4) | critério estrito: nome de arquivo com vocabulário do app sai do fatos |
| D12 | F130 | mecanismo de entrada (fronteira → fora) |
| D13 | B28 | possível fato cortado em excesso: reformas que perderam conteúdo |
| D14 | F43 | atribuição a prescrição sustentada só por texto de interface |
| D15 | todos | releitura só dos F tocados |

**Achados preliminares** (versão anterior à releitura; mantidos como registro):

| F | Tipo |
|---|---|
| F139 | notação de exibição de uma série, tirada de commit de layout |
| F200, F292 | rótulo de interface citado entre aspas (voz em 1ª pessoa) |
| F274, F275, F281, F284 | texto de interface citado entre aspas |
| F273 | mensagem e posição na interface |
| F267, F285 | componente de interface nomeado |
| F233 | comportamento de interface apresentado como fato |
| F130 | fronteira: meio de transferência do arquivo da aula |

### 1.3 · A2 escreve as perguntas ao dono

- [x] 1.3.a Prompt do A2 escrito e salvo no Anexo B (B1) **antes** de disparar.
      Leitura permitida: `01-fatos.md` aprovado, `git log`, `tests/`. Lista do que
      é permitido, nunca do que é proibido.
- [x] 1.3.b A2 disparado com B1 (só depois de 1.2.j)
- [x] 1.3.c `02-perguntas.md` entregue: no máximo 12, cada uma com o que muda
      na resposta
- [x] 1.3.d Conferir o `02-perguntas.md` contra vazamento. Devolvido por duas
      palavras do app (P7, P1.6), corrigido, **aprovado**. O `git log` tem
      vocabulário de forma nas mensagens de commit; o A2 pode trazê-lo sem perceber.

### ═══ PARADA 1 · o dono responde ═══

- [x] P1.a Apresentar as perguntas ao dono, com um aviso: as respostas vão
      **palavra por palavra** aos quatro designers; se citarem o app de hoje,
      viram vazamento
- [x] P1.b Levar ao dono os riscos de processo em aberto (seção Riscos)
- [x] P1.c **Parar.** Não disparar nada até a resposta.
- [x] P1.d Registrar as respostas, literais, em `02-perguntas.md`, embaixo de
      cada pergunta. Feito para P3, P4, P5*, P7, P8*, P9*, P10, P11*, P12
      (*atribuído pelo assunto, marcado). Faltam: P1 (números do JSON, aguarda
      autorização), P2, P6, resto da P3 (o dono pode pular).
      → Completo: P1 (números autorizados), P2, P6 e "Orientação geral do dono"
      gravados; resto da P3 pulado pelo dono.
- [x] P1.e Conferir as respostas por vazamento; se houver, perguntar ao dono
      (o coordenador não reescreve a fala do dono). **Perguntado ao dono:**
      (1) cortar 6 trechos que descrevem o app atual (P4, P7, P8, P11, P12×2);
      (2) gosto/direção visual nas respostas → ficam ou vão para a onda 5;
      (3) "terão outros usuários" → fato novo ou horizonte.
      **Antes disso o A2 não é retomado.**
      → (1) 6 cortes aplicados ("pode tirar tudo que você achar que deve tirar").
      (3) Sem escolha explícita do dono: o `01-fatos.md` fica com os fatos de hoje, e as
      palavras dele seguem literais (§7 cobre a mudança de escopo).
      (2) **PENDENTE** — ver P1.g.
- [x] P1.f Correção do `01-fatos.md` pelo A1 (inclui F42–F44). Conferida: limpa.
      301 fatos, 118 cortes (C118 = o 402 × 874 do telefone simulado), 34 fronteiras. com fatos da resposta do dono:
      F49 (aparelho é iPhone 11 Pro Max, 414 × 896 pt — o 402 × 874 era o
      tamanho do telefone simulado no computador, decisão de `7fc8ddd`); F50
      (não tem iPad; usa o notebook para acompanhar); F21/F118 (aula quinta ou
      sábado, uma por semana, sem dia fixo); F1/F2 (treinador e nutricionista
      são agentes de IA criados pelo dono). Depois, re-conferir só o diff.
- [x] P1.g **Decisões do dono que precisam estar fechadas antes da mensagem dos
      designers (2.a):** (i) os pedidos de aparência nas respostas (aspecto
      Apple, paleta, movimento, gráfico, "por ali já") vão aos quatro ou ficam
      guardados para a onda 5; (ii) as medidas novas (braço, outras
      circunferências, bioimpedância mensal) entram como dado do produto ou
      como pergunta pelo §7.
      → **Decidido em 01/10:** (i) **a** — os pedidos vão aos designers; o dono
      esclareceu que "Apple" não era pedido de estilo (esclarecimento literal sob a
      P11). (ii) **a** — as medidas novas entram como dado do produto, e os
      designers pensam no todo (decisão literal sob a P6).
- [x] P1.h **SESSÃO NOVA antes de qualquer agente cego** (R1). O próximo passo,
      na sessão nova: rodar a sonda (Anexo F) e confirmar NÃO → disparar um A2
      novo com B1 + B2 → seguir a 1.4.
      → Sessão nova em 01/10: a sonda respondeu 1 SIM, 2 NÃO, 3 NÃO. Canal fechado.

### 1.4 · A2 escreve o uso e nomeia os dois momentos

- [x] 1.4.a Retomar o A2 (mesmo ID) ou novo A2 com o prompt do Anexo B + respostas
      → novo A2, B1 + B2 numa mensagem, sem edição
- [x] 1.4.b `02-uso.md` entregue: momentos por frequência e por dificuldade,
      falhas, pressa, cansaço, sem rede (648 linhas, U1–U16, K1–K9, D1–D8)
- [x] 1.4.c Os dois momentos obrigatórios nomeados, **com o critério escrito**
      (o coordenador não escolhe, não sugere, não troca)
      → M1 · entre duas séries, na academia, com o relógio contra; M2 · depois de
      comer, no meio do dia. Critério na §9 do 02-uso.
- [x] 1.4.d Conferir o `02-uso.md` contra vazamento
      → **devolvido ao A2** (L1–L3, abaixo); corrigido, diff conferido, **APROVADO**.
      O A2 tirou também, por conta própria, um período de 12 dias tirado da data
      de um commit de interface (`dadd3e4`; o F275 não tem datas). Fronteira que ficou,
      por decisão do coordenador: a frase do U15 sobre voltar ao programa do
      treinador para a prescrição nova chegar (é o F166, aprovado, mesma fonte;
      descreve o que o dono fez). Versão 1 guardada no scratchpad
      desta sessão para conferir o diff.

**Devolução ao A2** (02-uso.md, versão 1):

| # | linha | Tipo |
|---|---|---|
| L1 | 53 | número e mecanismo de encerramento automático (cortes C42) via `893e2c3` |
| L2 | 111 | nome de arquivo de teste com vocabulário do app (cortes §1.4, critério D11) |
| L3 | 384–387 | custo de interface antiga (66 interações, `00e7fa3`) e cobertura da busca (9 de 28, `d9757d5`, fronteira → fora) |

Passou: varredura de superfície (só "cardio" e "teclado", sentido comum), aspas
(todas do dono ou já no fatos), os 25 hashes citados contra o cortes, e as
contas 17,05 · ~76 · 34–41 · 48 · 16, refeitas pelo coordenador.

---

## ONDA 2 · As direções

- [x] 2.a Escrever a mensagem única dos designers no Anexo C. Corpo idêntico
      palavra por palavra; a única diferença permitida é a letra da pasta, na
      última linha.
- [x] 2.b Reler a mensagem caçando qualquer ângulo, tema, estilo, referência ou
      ideia de interface do coordenador → zero (relida duas vezes; a segunda
      depois de acrescentar a frase das fontes citadas, porque o 02-uso traz
      comandos de git prontos para rodar)
- [x] 2.c Disparar D1–D4 em paralelo, copiando o Anexo C sem editar
      → disparados juntos em 01/10, segundo plano, modelo padrão; o texto saiu da
      extração do Anexo C (md5 do corpo com X: `e1e32d2a…`)
- [!] 2.c′ **Os quatro caíram por limite de sessão da API** (~21:30, 01/10). Disco:
      A e C com `momento-1.html` completo; B e D com pasta vazia. Achado: os D
      gravavam arquivos de trabalho no **scratchpad compartilhado** da sessão, onde
      também estavam o script de conferência do coordenador (com o vocabulário do
      app) e a versão 1 do 02-uso (com o vazado). Conferido por contagem nas
      transcrições, sem lê-las: nenhum D leu conteúdo indevido; o D1 listou o
      scratchpad uma vez e viu só nomes de arquivo. Arquivos do coordenador
      movidos para `/tmp/claude-1000/-home-infraestrutura-imts-workspace-personal-lastro-app/coordenador-redesign/`;
      os do D1 (capturas) e do D2 (scripts e estilos) para o `_trabalho/` de cada
      um, sem alteração. Retomada com o adendo do Anexo C.
- [x] 2.d `03-direcao-A/` entregue (22:25). direcao.md 386 l.; momento-1 com 17
      estados, momento-2 com 13; os dois abrem a 414 × 896 com tela desenhada e
      conteúdo real. Valores ilustrativos marcados com † pelo próprio D1.
      2.h: tudo presente; **tese em duas frases** → pedida em uma; corrigida, conferida. **A fechada.**
      2.i: limpo. "dia aberto" é classe CSS no sentido comum; os três estados do
      dia saem do F195 em primeira pessoa; "só hoje" sai do fatos. Para o curador:
      "cartão de foco" (cortes C17), "barra de abas" e "Hoje" (C24, C39). O D1
      citou a P4 trocando "wobble" (transcrição de voz) por "wall ball" (F286):
      citação do dono alterada, sem efeito no desenho.
- [x] 2.e `03-direcao-B/` entregue (22:33). direcao.md 492 l.; momento-1 com 13
      estados, momento-2 com 12; os dois abrem a 414 × 896 com tela desenhada e
      conteúdo real. Cargas de exemplo declaradas.
      2.h: tudo presente; tese já em uma frase. **B fechada.**
      2.i: limpo. "instrumento" (nome que o D2 dá à sessão aberta) nasceu num
      comentário de CSS do próprio D2, sem canal; para o curador, coincide com o
      cortes C8/C95. "só hoje" e os três estados do dia saem do fatos.
- [x] 2.f `03-direcao-C/` entregue (22:22). direcao.md 402 l.; momento-1 com 11
      estados, momento-2 com 10; os dois abrem a 414 × 896 com tela desenhada e
      conteúdo real (capturas em `coordenador-redesign/shots/`).
      2.h: tudo presente; **tese em duas frases** → pedida em uma (só isso); corrigida, conferida. **C fechada.**
      2.i: limpo. `.cue` e `slot` são nomes de classe e de variável do próprio
      D3, em inglês comum. "WhatsApp" vem da P3. Para o curador, não para o D3:
      convergências possíveis com o cortes C24 e C39, e "só hoje" (paráfrase
      direta de "mudanças só do dia", que está no fatos).
- [x] 2.g `03-direcao-D/` entregue (22:26). direcao.md 453 l.; momento-1 com 14
      estados, momento-2 com 13; os dois abrem a 414 × 896 com tela desenhada e
      conteúdo real. Cargas ilustrativas e uma associação de frase do treinador
      marcadas pelo próprio D4.
      2.h: tudo presente; **tese em quatro frases** → pedida em uma; corrigida, conferida. **D fechada.**
      2.i: limpo. "força estimada" está no F174; "só hoje" sai do fatos. Para o
      curador: âmbar para aviso (cortes C12). Lugares: Agora · Dias · Evolução ·
      Prescrição.
- [x] 2.h Para cada pasta, conferir o que é formal e verificável (sem julgar
      gosto): tese em uma frase · modelo · os dois momentos · os estados vazio,
      carregando, erro e caso ruim · dois HTML que abrem em viewport de telefone
      com conteúdo real · recusas e custo · duas descartadas · perguntas
- [x] 2.i Conferir cada pasta contra vazamento
      → as quatro limpas. Auditoria das transcrições, por contagem, sem lê-las:
      nenhuma leu arquivo proibido; o padrão de base (`DESIGN.md`=8,
      `index.html`=2, `git log`=3, `00-coordenacao`=2) é igual nas quatro e vem do
      contexto comum (lista de skills e agentes, índice de memória). O D1 listou
      `docs/redesign/` uma vez (só nomes) e o scratchpad uma vez (só nomes).
- [x] 2.j Registrar, sem opinar, se as teses se parecem (§8.3: é resultado a
      investigar, não a esconder)
      → **A e C convergiram**: a mesma metáfora (previsto "a lápis", registrado "a
      tinta"), quase a mesma tese, a mesma organização por tempo com "Hoje" e
      "Prescrição" e "Semana(s)", e apresentação dos HTML muito parecida.
      **Investigado:** "lápis" não aparece em nenhum insumo; nenhuma transcrição
      de D menciona a pasta de outro; a mensagem do coordenador não tem metáfora;
      os dois escreveram o primeiro HTML no mesmo minuto (21:27), antes da queda.
      Não há canal entre eles. Hipótese, não medida: mesmo modelo, mesmos
      insumos. No B, "tinta" é só nome de variável de cor.
      → **D também**: a tese abre com quase a mesma frase ("quase tudo o que este
      produto registra está escrito antes de acontecer"), sem a metáfora do
      lápis. Três de quatro com a mesma tese. Canais procurados de novo: a frase
      não está nos insumos; a memória automática não recebeu arquivo desde antes
      dos D; o `MEMORY.md` aparece igual nas quatro transcrições (é o índice
      carregado por todo agente) e não tem forma; nenhuma menção cruzada de pasta.
      → **B**: a mesma família ("registrar é dar visto na prescrição"), com "duas
      tintas" (grafite = previsto, azul = feito), como a A (grafite, azul-tinta).
      **Resumo para o dono, sem opinião:** as quatro afirmam que registrar é
      confirmar o que a prescrição e a última vez já dizem; as quatro tiram a
      decisão da academia; as quatro recusam alarme de descanso, sequência de dias,
      presumir o plano e o teclado do sistema para número; as perguntas ao dono se
      repetem (hora-limite, qual refeição saiu do plano). **Diferem** na
      organização: A = Hoje · Semana · Prescrição · Corpo; B = Dia · Mesa (pela
      postura do corpo); C = Hoje · Semanas · Prescrição (por tempo, "agora"
      embaixo, hachura para o não sabido); D = Agora · Dias · Evolução ·
      Prescrição. E no toque da série: A com − / + e "Registrar" (2 toques); B, C, D
      com fileira de números (1 toque). Sem canal entre eles. Hipótese, não medida:
      mesmo modelo, mesmos insumos.

### ═══ PARADA 2 · o dono abre os HTML e diz o que sobrevive ═══

- [x] P2.a Apresentar as quatro pastas e os caminhos dos HTML (01/10, ~22:40),
      com a convergência do 2.j por extenso e a única alavanca de processo que
      não contamina a onda (outro modelo, mesma mensagem), como opção dele.
- [x] P2.b **Parar.** Respondido em 02/10, por múltipla escolha, em outra sessão.
- [x] P2.c Registrar, literal, o que sobrevive:

  **Sobrevivem C e D.** Fora: A e B.

  - **C** — o dia inteiro na tela, com a ação de agora fixa ao alcance do polegar;
    não aposta em nada, então não há palpite errado a contornar.
  - **D** — abre direto na ação de agora; a mais limpa durante o treino, e a que
    mais depende de acertar o palpite.
  - **A fora**: abre o dia inteiro sem deixar a ação de agora ao alcance.
  - **B fora**: divide por postura, e isso não apareceu em resposta nenhuma dele.
    A peça dela que ele quis entrou como exigência E1, sem a direção inteira.

  **Três exigências, que vão nos prompts do cerco e não são escolha do designer:**

  - **E1 · a decisão sobre tornar permanente aparece ao ENCERRAR o treino**, mais
    um atalho discreto na tela do dia. Não é de nenhuma das quatro; é dele, dito
    assim: "ao final do treino seria o ideal… mas também ter a opção na própria
    tela, bem sutil". Separa registrar de decidir sem criar um lugar que ele pode
    nunca abrir.
  - **E2 · peso, medidas e fotos com lugar próprio.** Na D já é assim. Na C sai de
    3 para 4 lugares e quebra o critério que organizava a barra (tudo por tempo),
    porque "Evolução" não é recorte de tempo. O cerco diz se o preço compensa.
  - **E3 · o que passou sem registro aparece marcado.** Nativo nas duas.

  **Duas medições que ele recusou cravar, e que o cerco devolve com número:**

  - **M-a · quanto custa contornar o palpite errado na D** (treino à noite, app
    abrindo no café da manhã): quantos toques até a tela certa. Ele respondeu
    "quero ver a proposta antes de fixar".
  - **M-b · registrar ontem na C custa 4 toques**, o pior das quatro (A, B e D
    resolvem na mesma tela). Como E3 exige mostrar o buraco, mostrar sem baratear
    o fechamento é meio serviço: ou melhora, ou justifica.

  **O que ele disse sobre o preço, e que o cerco deve usar como régua** (resposta
  livre, literal): "fluxos muito dificultosos" não; gosta de predição, "mas não dá
  pra ser uma briga muito grande pra contornar"; gosta do visual "sem exagerar e
  poluir demais as telas"; "na hora do treino pode ficar mais limpa".

---

## ONDA 3 · O cerco (só sobre as sobreviventes)

- [x] 3.a Prompts C1–C4 salvos no Anexo D (o C2 com a exceção de leitura
      nomeada no §2 e as armadilhas técnicas, coladas inteiras do
      `~/.claude/CLAUDE.notas-mobile.md`). Os quatro recebem C e D, as exigências
      E1–E3 como dadas, e as medições M-a e M-b como pedido explícito de número.
      E1 vai escrito como requisito do projeto, sem autor — é desenho do dono, e
      dizer isso a um cego não ajuda e pode intimidar a crítica.
- [x] 3.a′ Sonda do Anexo F rodada nesta sessão nova antes de qualquer cego:
      **1 SIM, 2 NÃO, 3 NÃO** — as notas técnicas estão fora do contexto deles.
- [~] 3.b Disparar C1–C4 em paralelo, cegos entre si → disparados em 02/10
- [ ] 3.c `04-critica.md` (C1)
- [ ] 3.d `04-viabilidade.md` (C2)
- [ ] 3.e `04-acesso.md` (C3)
- [ ] 3.f `04-voz.md` (C4)
- [ ] 3.g Conferir os quatro contra vazamento e contra o mandato (quem ataca
      não desenha)

## ONDA 4 · O parecer

- [ ] 4.a Prompt do R salvo no Anexo E (R vê os dois mundos)
- [ ] 4.b `06-parecer.md` entregue
- [ ] 4.c Conferir: sem quinta direção, sem fusão, decisões numeradas, a
      diferença em relação ao app atual medida e escrita, as perdas nominais

### ═══ PARADA 3 · o dono decide ═══

- [ ] P3.a Apresentar o parecer
- [ ] P3.b **Parar.**

## ONDA 5 · O ofício

- [ ] 5.a O escopo é definido pelo curador junto com o dono, não aqui

---

## Riscos de processo em aberto

- [~] R1 · **MITIGADO em 01/10, com autorização do dono:** as notas técnicas foram
  movidas, palavra por palavra, para `~/.claude/CLAUDE.notas-mobile.md`. Mas a sessão
  guarda o CLAUDE.md de quando abriu: uma segunda sonda, depois da troca, ainda
  respondeu SIM. **Vale só em sessão nova.** **DEVOLVER as notas ao `~/.claude/CLAUDE.md`
  ao fim da onda 3** (copiar de volta tudo abaixo do comentário do topo e apagar o
  arquivo lateral). O C2 recebe o texto pelo prompt.
- [x] R1 (histórico) · **CONFIRMADO em 01/10 por sonda (subagente respondeu SIM a: há
  instruções globais; mencionam os dois termos técnicos perguntados).** Instruções globais carregadas por todo subagente. O
  `~/.claude/CLAUDE.md` traz notas técnicas de mobile que descrevem padrões de
  interface. Se ele entra no contexto de cada subagente, é um canal de
  vazamento que nenhum prompt fecha. Precisa ser confirmado e decidido pelo dono
  **antes da onda 2**. O coordenador não mexe nesse arquivo.
- [x] R2 · O A2 lê `git log`, que carrega vocabulário de forma → conferência
  dos `02-*` com o mesmo rigor do `01-fatos.md`. **Aconteceu** no 02-uso (L1–L3 e
  `dadd3e4`); corrigido.
- [ ] R3 · O briefing não diz onde ficam as respostas do dono; ficam em
  `02-perguntas.md`, embaixo de cada pergunta (P1.d).
- [~] R8 · **Novo em 02/10, por minha causa:** o dono pediu para gravar na
  memória global que artefato nunca sai em modo escuro, e eu escrevi isso no
  `~/.claude/CLAUDE.md` — que todo subagente carrega. O texto fala de artefato,
  não da interface do app, e os quatro do cerco não escolhem paleta; julgo o
  risco baixo e deixo registrado em vez de esconder. Se incomodar, o lugar dele é
  o arquivo lateral, junto das notas de mobile.
- [ ] R4 · Este arquivo não está na lista do §9; existe por pedido do dono,
  para dar continuidade entre sessões.
- [x] R5 · **O briefing não vai a agente cego.** Não está na lista permitida do
  §2, e três exemplos do §3 são decisões do app atual (cortes C15, C29, C96).
  Cada agente cego recebe o seu mandato transcrito no prompt, sem esses
  exemplos. Informar o dono na Parada 1.

- [ ] R6 · **O nome do produto chega a todo agente pelo caminho do diretório**
  (`lastro-app`, e o scratchpad leva o mesmo nome). Conferido nas transcrições
  dos D: todas as ocorrências estão em caminhos. Inevitável sem mudar o
  diretório. Se uma direção usar esse nome, a origem é o caminho: o curador
  registra, não conta como vazamento de decisão.
- [ ] R7 · Arquivos do coordenador nunca no scratchpad da sessão (é o mesmo dos
  subagentes). Lugar: `.../coordenador-redesign/` (ver 2.c′).

## Diário

- 01/10 · Briefing lido. Ordem decidida: conferir o fatos antes do A2.
- 01/10 · A1 disparado; caiu por limite de sessão com o `01-fatos.md` completo e
  sem o cortes. Retomado por `SendMessage`.
- 01/10 · Conferência preliminar feita (1.2.a–d). A1 em releitura.
- 01/10 · A1 entregou o cortes (C1–C108, B1–B34). Diff conferido; a releitura
  resolveu F267, F285 e parte de F273; os textos entre aspas ficaram. Devolvido
  (D1–D15).
- 01/10 · Conferido no código pelo coordenador, a partir do cortes §5: F251
  (restaurar não traz aulas, lousa, comida passada, histórico de ajuste,
  avaliações de gordura, fotos do corpo; ajuste vira ±1 — `src/main.jsx:3459-3486`)
  e F252 (a ativação de versão nova apaga o cache das fotos do corpo — `src/sw.js:28,71`). Os itens
  3 a 10 do §5 **não** foram conferidos pelo coordenador.
- 01/10 · A1 corrigiu D1–D15 sem recusar nenhum, e mais quatro pontos na
  própria releitura (F4, F188, F217, F223). Entrou o F301 (reescritas que
  perderam capacidades). Contagem: 301 fatos, 117 cortes, 34 fronteiras.
  Diff e varreduras conferidos. Ficaram, por decisão do coordenador: a frase
  das três puxadas em F26/F110 (é comentário de `src/infra/fotos.ts`, fato do
  mundo) e "faixa" em F138 (sentido comum de intervalo). **Aprovado.**
- 01/10 · A2 entregou 12 perguntas. Conferido: duas palavras do app (P7,
  P1.6) → devolvido. A contradição da P4 procede (20/09/2026 foi domingo).
- 01/10 · Sonda descartável (fora do time) confirmou o R1.
- 01/10 · A2 corrigiu as duas palavras; perguntas aprovadas. **Parada 1 aberta**:
  perguntas, R1 e R5 levados ao dono. Nada mais é disparado até a resposta.
- 01/10 · O dono trouxe a cópia de segurança (`~/Downloads/lastro-2026-10-01.json`).
  Contagens tiradas por script (no scratchpad desta sessão; refazer se cair),
  mostradas ao dono. **O JSON não vai a agente cego** (vocabulário do app em
  campos e textos). Pendente do dono: (1) se houve restauração ou troca de
  aparelho em ago/set (zeros podem ser o defeito F251); (2) autorização para
  gravar os números no `02-perguntas.md` como resposta, marcados como "do
  registro, contado por script", separados das palavras dele.
- 01/10 · Respostas ditadas por voz chegaram (P3, P4, P5, P7–P12) e foram
  gravadas literalmente. Achados: trechos que descrevem o app atual; pedidos
  de gosto (paleta, movimento, aspecto); escopo (outros usuários, transcrição
  dentro do app, agentes especialistas no futuro); F49 errado. O dono pediu
  ideias ao coordenador → respondido "não é minha para dar" (§6).
- 01/10 · Segunda rodada do dono: P1 autorizada (números gravados), P2, P6,
  orientação geral (só os dados precisam ser preservados; "não se preocupe com
  o que já tinha"; o trabalho vai para uma branch nova, quando houver código).
  R1 autorizado. Cortes aplicados. A1 corrigindo F1/F2, F21/F118, F42–F44,
  F49, F50. Decisões (i) e (ii) da P1.g pedidas ao dono.
- 01/10 · A1 entregou as correções; conferidas e aprovadas. **Fim do trabalho
  desta sessão.** Próximo: o dono abre uma sessão nova → P1.h. Se as decisões
  da P1.g não tiverem vindo, perguntar de novo antes do item 2.a.
- 01/10 · Decisões da P1.g: 1a e 2a. Nada mais pendente do dono. Falta só a sessão nova.
- 01/10 · Sessão nova. Disco conferido (bate com o checklist). Sonda: SIM / NÃO / NÃO.
  A2 novo disparado com B1 + B2, copiados do Anexo B sem edição.
- 01/10 · Canais de vazamento para a onda 2 conferidos: a skill de design instalada
  imprime os documentos do projeto (o hook dela não está ativo); o app está
  publicado e há conectores de hospedagem e de notas. Viram regra de ferramentas
  no Anexo C. Rascunho do Anexo C escrito e relido (2.b) — sem ideia do coordenador.
- 01/10 · A2 entregou o 02-uso.md (M1, M2). Devolvido por L1–L3, todos do R2.
- 01/10 · A2 corrigiu L1–L3 e mais um (`dadd3e4`). Diff conferido. **02-uso.md
  aprovado** (cópia da versão aprovada no scratchpad). Onda 1 fechada.
- 01/10 · Anexo C fechado (frase das fontes citadas acrescentada, relido). D1–D4
  disparados em paralelo. Se a sessão cair: novos D com o Anexo C + "retome: na
  sua pasta já existe X, falta Y"; nunca mostrar a um D a pasta de outro.
- 01/10 · Os quatro D caíram por limite de sessão da API (troca de conta pelo dono
  depois). Incidente do scratchpad compartilhado conferido e isolado (2.c′, R6, R7).
  Retomados pelo ID com o adendo do Anexo C, a pedido do dono ("reative os agentes
  e comece de onde parou").
- 01/10 · As quatro pastas entregues e conferidas (2.d–2.j). Teses pedidas em uma
  frase em A, C e D (só isso). Convergência forte registrada no 2.j. **Parada 2
  aberta.**
- 02/10 · Peça visual de comparação feita para o dono (artefato publicado, em
  linguagem direta: o vocabulário dos designers — lápis, tinta, hachura, visto —
  foi traduzido para o que acontece na tela, a pedido dele).
- 02/10 · **Parada 2 fechada por múltipla escolha, em outra sessão.** Sobrevivem
  **C e D**; A e B fora. Três exigências (E1–E3) e duas medições (M-a, M-b) em
  P2.c. Correção registrada: na primeira rodada de perguntas o coordenador tratou
  a pergunta de entrada como binária e eliminou a C indevidamente — o dono
  apontou, e a C voltou. **Próximo: onda 3, item 3.a** — escrever os prompts
  C1–C4 com C, D, E1–E3 e M-a/M-b dentro.

---

## Anexo A · Prompt do A1 (texto enviado)

> Você é A1, o Escriba dos fatos, num time de design de produto que vai propor
> este app outra vez, do zero.
>
> O contrato de trabalho inteiro está em
> `docs/redesign/00-briefing.md`. Leia esse arquivo inteiro antes de qualquer
> outra coisa. Ele manda mais que este recado. A sua função está no §4 (Onda 1,
> A1), e o único critério que você aplica é o teste de fato e forma do §3, linha
> por linha.
>
> Mandato resumido: ler o repositório inteiro, inclusive o que é proibido para o
> resto do time, e escrever `01-fatos.md` (único insumo do time cego; exaustivo
> em fato, zero em forma) e `01-fatos-cortes.md` (o que foi reconhecido como
> decisão e removido; para o dono e o curador, nunca para o time cego).
>
> Pedidos do coordenador, sobre o processo:
> 1. Rastreabilidade — fatos numerados (F1, F2…), cada um com fonte. No fatos,
>    a fonte só aponta para `src/dominio/`, `src/infra/`, `tests/`,
>    `package.json`, `vite.config.js`, `src/sw.js` ou hash de commit. Prova em
>    material proibido, ou nome de arquivo com vocabulário do app → a fonte vai
>    ao cortes, pelo número do fato. Número sem fonte não entra.
> 2. Fronteira — na dúvida entre fato e forma, fora do fatos; vai ao cortes com
>    o motivo em uma linha.
> 3. Nomes — nome de coisa é forma, inclusive os nomes que o app inventou e o
>    vocabulário interno do código que não é do mundo. Descrever pelo que a
>    coisa é no mundo; registrar no cortes o nome que o app dá.
> 4. Releitura — passada separada no fim, caçando vazamento; anotar no cortes o
>    que ela pegou.
> 5. Limites — nada fora de `docs/redesign/`, nenhum outro arquivo, nenhum
>    commit, não precisa rodar o app.
>
> Relatório final curto: quantos fatos, cortes, casos de fronteira e fontes no
> cortes; o que a releitura pegou; as lacunas.

## Anexo B · Prompt do A2

Duas mensagens: B1 dispara a etapa das perguntas; B2 vai depois da Parada 1
(retomando o mesmo A2 pelo ID ou, em sessão nova, B1 + B2 juntas a um A2 novo).
O A2 **não** recebe o `00-briefing.md`: ele não está na lista permitida do §2, e
três exemplos do §3 são decisões do app atual. O mandato vai transcrito aqui.

### B1 · Etapa das perguntas

```text
Você é A2, o Pesquisador do uso, num time de design de produto que vai propor
um aplicativo outra vez, do zero. Você é cego ao app atual: não sabe como ele
é, e o processo depende de que continue assim. Quem sabe é o coordenador, e
ele não vai lhe contar.

O QUE VOCÊ PODE LER — só isto:
- docs/redesign/01-fatos.md
- as mensagens do `git log` deste repositório (autor, data, assunto e corpo).
  Não abra diffs (`git show -p`, `git log -p`) nem listas de arquivos tocados
  (`--stat`, `--name-only`): mostram código de interface.
- a pasta tests/
- os arquivos que você mesmo escrever.
Qualquer outro caminho do repositório — inclusive os outros arquivos de
docs/redesign/ —, o app rodando e capturas de tela ficam fora. Se não está
nesta lista, não abra.

AVISO SOBRE O QUE VOCÊ VAI LER. As mensagens de commit e os testes foram
escritos por quem construiu o app atual e carregam decisões de forma: nomes de
partes da interface, rótulos, cores, medidas, gestos, sequências de toque.
Para o seu trabalho isso é ruído a descartar. Use o git log e os testes para
medir o uso: o que aconteceu, quando, quantas vezes, o que custou, o que
quebrou.

O TESTE QUE TUDO O QUE VOCÊ ESCREVE PRECISA PASSAR.
É fato — vem do mundo, não de uma escolha de ninguém: o que o usuário precisa
fazer e em que momento do dia; os dados, com unidade, faixa, quantidade e
exemplo; os estados de cada dado, inclusive os ruins; de onde vem cada
informação; o aparelho, o navegador, a rede, a luz, a mão, o suor, o tempo
disponível; o que o código garante e proíbe; o que já deu errado, com
evidência.
É forma, e fica fora: qualquer superfície (tela, aba, menu, rodapé, cartão,
lista, modal, painel, botão…); cor, tipografia, medida, espaçamento, ícone;
ordem, hierarquia, agrupamento; gesto, animação, transição, som; tom de voz,
nome de coisa, rótulo, título, mensagem.
Um "momento", para você, é uma situação de uso — quem, onde, quando, em que
estado do corpo, com o que na mão, para fazer o quê, com quanto tempo — e
nunca uma parte da interface.

O SEU MANDATO. Reconstruir o uso real: quais tarefas acontecem e quantas vezes,
quais são caras, onde o uso falha, o que acontece quando o usuário está com
pressa, cansado ou sem rede. Depois disso você vai escrever docs/redesign/02-uso.md,
com os momentos ordenados por frequência e por dificuldade, e nomear os dois
momentos que todo designer do time vai ter que desenhar — por frequência e
dificuldade medidas, com o critério escrito. Esses dois existem para que as
direções possam ser comparadas entre si; quem escolhe é você, e o coordenador
não sugere nem troca.

NESTA ETAPA, porém, você escreve só docs/redesign/02-perguntas.md: as perguntas
que só o dono do produto pode responder. No máximo doze. Cada uma com o que
muda no seu trabalho conforme a resposta. As perguntas e as respostas do dono
vão, palavra por palavra, aos designers cegos — então elas passam pelo mesmo
teste acima.
Depois de escrever o 02-perguntas.md, pare. Não escreva o 02-uso.md ainda: o
dono responde primeiro, e o coordenador volta a você.

LIMITES. Não crie nem altere nada fora de docs/redesign/, nem outro arquivo
além do 02-perguntas.md. Não faça commit. O coordenador confere o seu texto
contra o teste acima antes de ele chegar a alguém; vazamento volta.

Responda ao coordenador em poucas linhas: quantas perguntas, e o que você já
consegue medir com segurança e o que não consegue.
```

### B2 · Etapa do uso (depois da Parada 1)

Em sessão nova (A2 novo), enviar **B1 + B2 numa mensagem só**, nessa ordem.

```text
ETAPA DO USO. As perguntas já foram escritas e o dono já respondeu. Se você é
um A2 novo, saiba que o docs/redesign/02-perguntas.md foi escrito por outro A2:
não o reescreva nem o altere. Ele agora entra na sua lista de leitura.

O QUE MUDOU NA SUA LEITURA. Além do que já era permitido, você lê o
docs/redesign/02-perguntas.md inteiro: as respostas do dono estão embaixo de
cada pergunta, em transcrição de voz literal, e há uma "Orientação geral do
dono" no fim. Os números da P1 foram contados pelo coordenador na cópia de
segurança do dono, com autorização dele. Trechos retirados estão marcados.
Leia com atenção a resposta da P3 e a orientação geral: o dono diz ali como
quer que os detalhes dele sejam tratados.

COMO LER AS RESPOSTAS.
- Onde a resposta do dono contradiz o 01-fatos.md, vale o dono, e você
  registra a contradição.
- O que o dono diz querer que o produto passe a fazer não é uso de hoje:
  registre separado, como desejo declarado, sem transformar em momento de uso.
- Pedidos de aparência (cor, movimento, estética) são forma pelo teste que você
  já conhece, e não entram no seu texto.

O QUE ESCREVER: docs/redesign/02-uso.md, com
- as situações de uso ordenadas por frequência e, em separado, por
  dificuldade — cada uma descrita como situação (quem, onde, quando, estado do
  corpo, com o que na mão, para fazer o quê, com quanto tempo, com ou sem rede);
- onde o uso falha, e o que acontece com pressa, cansaço e sem rede;
- para cada número, de onde ele veio: F do 01-fatos, resposta P do dono, ou a
  contagem que você fez (com o comando, se veio do git log ou dos testes).
  Número prescrito e não medido vem marcado como "prescrito, não medido";
- os DOIS momentos que todo designer vai ter que desenhar, com o critério
  escrito por extenso e a medida que levou a cada um.

LIMITES. Só o 02-uso.md. Nenhum outro arquivo, nenhum commit. O coordenador
confere contra o teste antes de o texto chegar a alguém.

Responda em poucas linhas: os dois momentos, o critério em uma frase, e o que
ficou sem medida.
```

## Anexo C · Mensagem única dos designers D1–D4

Corpo idêntico para os quatro. A única diferença é a letra na última linha
(A, B, C, D). Transcreve o mandato do briefing (§1, §4 Onda 2, §7, §8.1), sem o
briefing (R5). Decisões de transcrição do coordenador, registradas:
- o exemplo "porque ele está com uma mão ocupada" (fim do §4, Onda 2) saiu: é um
  detalhe do corpo do dono, e na P3 ele pediu que detalhes dele não virem
  requisito. A regra ficou, sem o exemplo;
- do §7 saiu "muda superfície sem mudar modelo", e do §8 saíram o rebrand, o
  vazamento e o coordenador autor: os três pressupõem conhecer o app atual;
- ferramentas: nada de skill, subagente, conector ou web. A skill de design
  instalada imprime os documentos do projeto no contexto, o app está publicado
  na web e há notas do projeto num conector. Os três canais foram conferidos
  em 01/10 (sessão nova).

```text
Você é um designer de produto sênior, contratado para propor como um
aplicativo poderia ser se nunca tivesse sido desenhado. O app existe, mas você
não sabe como ele é, e o processo depende de que continue assim. Quem sabe é o
coordenador, e ele não vai lhe contar nem comentar o seu trabalho.

Outros designers recebem esta mesma mensagem, palavra por palavra, e trabalham
ao mesmo tempo que você. Nenhum vê o trabalho do outro. Ninguém recebeu
ângulo, tema, estilo ou referência — nem você.

A TAREFA. Propor uma direção de interface e de interação para este produto.
O que o produto FAZ não está em questão; como ele se apresenta e como se opera
está, inteiramente. Se a sua direção precisar mudar o que o produto faz, ela não
decide isso: escreve a mudança como pergunta ao dono, com o que se ganha e o que
se perde, e desenha a versão que não depende da resposta. Você não escolhe pelo
dono. Ele escolhe no fim, entre as direções, e cada uma precisa mostrar o que
custa.

O QUE VOCÊ PODE LER — só isto:
- docs/redesign/01-fatos.md — os fatos do produto: tarefas, dados, estados,
  origens, contextos, restrições, o que já deu errado;
- docs/redesign/02-uso.md — o uso real, ordenado por frequência e por
  dificuldade, e os DOIS momentos que todo designer tem que desenhar;
- docs/redesign/02-perguntas.md — as perguntas feitas ao dono e as respostas
  dele, em transcrição de voz literal, com as decisões dele embaixo de algumas
  e uma orientação geral no fim;
- os arquivos que você mesmo escrever.
Qualquer outro caminho do repositório — inclusive os outros arquivos e pastas
de docs/redesign/ — fica fora. Se não está nesta lista, não abra.
As fontes citadas dentro desses arquivos (caminhos, hashes de commit, comandos)
servem para conferência do coordenador: você não as abre nem as roda.
Onde as respostas do dono contradizem os fatos, vale o dono.

FERRAMENTAS. Leia e escreva arquivos, e rode comandos locais sobre os seus
próprios arquivos. Não invoque skills, não dispare subagentes, não use
conectores (de documentos, de design, de hospedagem, de publicação de páginas)
e não acesse a web: cada um desses abre caminho a material fora da sua lista.
Não rode o app nem nenhum servidor do projeto. Para ver os seus próprios HTML
há um Chrome que roda sem janela em /usr/bin/google-chrome (--headless,
--screenshot, --window-size); abrir nele os seus arquivos é permitido, e só
eles.

O QUE ENTREGAR, na sua pasta (última linha desta mensagem):
1. direcao.md, com, nesta ordem:
   - a tese em uma frase — o que esta direção afirma sobre este produto;
   - o modelo — como o produto se organiza, e por que isso serve ao uso real;
   - os dois momentos obrigatórios, desenhados, com todos os estados que o
     01-fatos.md exige, inclusive vazio, carregando, erro e o caso ruim;
   - o que esta direção se recusa a fazer, e o que isso custa ao usuário;
   - duas direções que você considerou e descartou, com o motivo;
   - as perguntas que você não tem como responder sozinho.
2. momento-1.html e momento-2.html — um por momento, na ordem em que o
   02-uso.md os nomeia. Autocontidos: um arquivo cada, sem nenhuma dependência
   de rede, que o dono abre no navegador e vê em viewport de telefone. Conteúdo
   real tirado dos fatos e do uso — não lorem ipsum, não imagem de placeholder.
   Os estados do momento têm que estar visíveis no HTML, não só descritos.

A RÉGUA. Uma direção é válida quando:
1. serve a todas as tarefas do 01-fatos.md — ou diz, explicitamente, qual
   deixou de fora e o que isso custa;
2. funciona nos contextos de uso que os fatos descrevem, e não só no melhor;
3. é desenhável e foi desenhada: os dois HTML abrem e mostram a coisa;
4. tem todos os estados ruins resolvidos, não só o caminho feliz;
5. diz o que recusa, e aguenta a recusa;
6. se sustenta por argumento de uso, não por gosto nem por referência.
Uma direção é inválida quando: é moodboard; é prosa sem desenho; só funciona
com dado que o produto não tem; exige servidor, conta ou rede que o produto não
tem; ou trata acessibilidade como acabamento.
Sem moodboard. Sem referência de mercado como argumento. "Porque é moderno"
não é razão; um motivo tirado do uso descrito nos fatos é. Cinquenta parágrafos
de intenção e nada que se veja é a falha mais comum deste tipo de trabalho.

LIMITES. Escreva só dentro da sua pasta. Não altere os arquivos que você lê.
Nada fora de docs/redesign/, nenhum commit. O coordenador confere a pasta antes
de ela chegar ao dono: se aparecer algo que só poderia ter vindo de fora da sua
lista de leitura, ela volta.

Responda ao coordenador em poucas linhas: a tese, os caminhos dos dois HTML e
o que a sua direção deixou de fora.

A sua pasta é docs/redesign/03-direcao-X/.
```

### Adendo de retomada (01/10, depois da queda por limite) — igual para os quatro

Enviado por `SendMessage` a cada D, seguido de um parágrafo "na sua pasta" que
só diz o que existe e o que falta. Num D novo (sessão nova), vai depois do
Anexo C, na mesma mensagem.

```text
Retome o trabalho. Você parou por limite de sessão da API, não por erro seu. A
mensagem original continua valendo inteira, palavra por palavra.

Uma regra nova, igual para todos os designers: o scratchpad desta sessão é
compartilhado com os outros designers e com o coordenador. Não grave nem leia
nada lá. Todo arquivo de trabalho (rascunho, script, folha de estilo, captura
de tela) fica dentro da sua pasta, numa subpasta _trabalho/. Se em algum
momento você viu no scratchpad um arquivo que não era seu, não o procure nem o
abra: ele já foi retirado de lá.
```

## Anexo D · Prompts C1–C4

Disparados em 02/10, em paralelo, cegos entre si. O corpo é comum, com três
variações: a exceção de leitura do C2 (mais as notas técnicas inteiras), o
mandato e a entrega de cada um.

### C1 · Crítico adversarial

> Você é **C1 · o Crítico adversarial**, do time que desenha este produto outra vez, do zero.
>
> **Leia primeiro, inteiro: `docs/redesign/00-briefing.md`.** Ele manda mais que
> este prompt. Obedeça em especial a regra da sala limpa (§2) e a régua (§7).
>
> **VOCÊ É CEGO AO APP ATUAL.** Não abra, não cite, não infira e não peça:
> `DESIGN.md`, `MARCA.md`, `PRODUCT.md`, `README.md`,
> `docs/LASTRO_UX_CONTRACT.md`, `docs/design-review/**`, `docs/ux-audit/**`,
> `docs/pegada/**`, `src/*.css`, `src/ui/**`, `src/palco.*`, `index.html`,
> nenhuma captura de tela e nenhum app rodando.
>
> **Você também é cego aos outros três desta onda.** Não leia `04-critica.md`,
> `04-viabilidade.md`, `04-acesso.md` nem `04-voz.md` — só o seu. Se outro já
> existir no disco, ignore.
>
> **O que você lê:**
> - `docs/redesign/01-fatos.md` — os fatos do produto (F…)
> - `docs/redesign/02-uso.md` — o uso medido (U, K, D, M…) e os dois momentos
> - `docs/redesign/02-perguntas.md` — as respostas do dono (P…)
> - `docs/redesign/03-direcao-C/` e `docs/redesign/03-direcao-D/` — as duas
>   direções que sobreviveram: `direcao.md` e os dois HTML. **Abra os HTML**;
>   eles são o desenho, e o texto sozinho não mostra o que você precisa julgar.
>
> **As duas sobreviventes.** O dono abriu os quatro desenhos e escolheu **C e
> D**. A e B saíram. Não as ressuscite, não as use de comparação, não pergunte
> por elas.
>
> **Três exigências. São dadas, não são escolha de designer e não estão em
> votação:**
> - **E1** — a decisão sobre tornar permanente uma mudança do dia aparece **ao
>   encerrar o treino**, e também num atalho discreto na tela do dia. Requisito
>   do projeto; nenhuma das direções o tem escrito assim.
> - **E2** — peso, medidas e fotos têm **lugar próprio**. Na D já é assim; na C
>   isso a leva de 3 para 4 lugares e quebra o critério que organizava a barra
>   dela (tudo em ordem de tempo), porque evolução não é recorte de tempo.
> - **E3** — o que passou sem registro **aparece marcado**. Já é nativo nas duas.
>
> Se uma exigência criar defeito, você **diz qual e onde** — mas não a cancela.
>
> **Duas medições que o dono recusou cravar no abstrato e quer com número:**
> - **M-a** — quanto custa contornar quando a D abre na coisa errada (ele treina
>   à noite e a tela abriu no café da manhã): quantos toques até a tela certa,
>   por caminho, no desenho que existe.
> - **M-b** — registrar ontem na C custa 4 toques, o pior das quatro (A, B e D
>   resolvem na mesma tela). Como E3 obriga a mostrar o buraco, mostrar sem
>   baratear o fechamento é meio serviço.
>
> **A régua do dono, nas palavras dele** (resposta livre, literal): "fluxos muito
> dificultosos" não; "gosto de predição, mas não dá pra ser uma briga muito
> grande pra contornar"; "gosto das coisas visuais, mas sem exagerar e poluir
> demais as telas"; "na hora do treino pode ficar mais limpa".
>
> **Regras de prova.** Toda afirmação sua se apoia num fato (F…), numa medida do
> uso (U, K, M…), numa resposta do dono (P…) ou em algo que você mediu — e você
> diz qual. Onde não houver medida, escreva "não medido" em vez de estimar sem
> dizer. Número que você contou, diga como contou.
>
> **Seu mandato: derrubar C e D pelo uso.** Pegue cada direção e tente
> quebrá-la nas condições que o 02-uso mede: 6h55 com a hora apertando, a volta
> de outro aplicativo no meio do descanso, o subsolo sem rede, a mão suada, a
> máquina ocupada, o dia que passou sem registro, a sessão que ninguém encerrou,
> o terceiro mês de uso, o dia em que ele está com pressa ou cansado. Ataque
> também o que cada direção declara que recusa: o custo que ela assume está
> escrito, e você julga se ele se paga.
>
> Meça **M-a** e julgue **M-b** — são seus, porque são custo de uso.
>
> **Entrega:** `docs/redesign/04-critica.md`, em português. Uma seção por direção, os achados **ordenados do mais
> grave ao menos**, e cada um com: o caso concreto (quem, quando, o que
> acontece), a frequência com a fonte, o que o usuário vive quando quebra, e
> **quão fundo está o conserto** — detalhe, regra ou modelo. No fim, uma seção
> curta "o que aguenta": onde você tentou derrubar e não conseguiu, que é
> informação tão útil quanto o resto.
>
> **O que você NÃO faz:** não propõe substituto, não conserta, não desenha
> tela, não escolhe entre C e D. Quem ataca não desenha. Dizer "isto quebra
> aqui, com esta frequência, e o conserto é de modelo" é o seu trabalho
> inteiro.

### C2 · Engenheiro de viabilidade

> Você é **C2 · o Engenheiro de viabilidade**, do time que desenha este produto outra vez, do zero.
>
> **Leia primeiro, inteiro: `docs/redesign/00-briefing.md`.** Ele manda mais que
> este prompt. Obedeça em especial a regra da sala limpa (§2) e a régua (§7).
>
> **VOCÊ É CEGO AO APP ATUAL.** Não abra, não cite, não infira e não peça:
> `DESIGN.md`, `MARCA.md`, `PRODUCT.md`, `README.md`,
> `docs/LASTRO_UX_CONTRACT.md`, `docs/design-review/**`, `docs/ux-audit/**`,
> `docs/pegada/**`, `src/*.css`, `src/ui/**`, `src/palco.*`, `index.html`,
> nenhuma captura de tela e nenhum app rodando.
>
> **Sua exceção de leitura, nomeada no briefing §2:** você PODE ler
> `src/dominio/`, `src/infra/`, `tests/`, `vite.config.js`, `package.json` e
> `src/sw.js` — é onde moram o domínio, a persistência e as provas. Continua
> proibido todo CSS, todo `src/ui/**` e o `index.html`: você precisa saber o que
> o programa faz, não como ele se parece hoje. E o que você aprender ali não
> volta para o seu texto como descrição de interface.
>
> **Você também é cego aos outros três desta onda.** Não leia `04-critica.md`,
> `04-viabilidade.md`, `04-acesso.md` nem `04-voz.md` — só o seu. Se outro já
> existir no disco, ignore.
>
> **O que você lê:**
> - `docs/redesign/01-fatos.md` — os fatos do produto (F…)
> - `docs/redesign/02-uso.md` — o uso medido (U, K, D, M…) e os dois momentos
> - `docs/redesign/02-perguntas.md` — as respostas do dono (P…)
> - `docs/redesign/03-direcao-C/` e `docs/redesign/03-direcao-D/` — as duas
>   direções que sobreviveram: `direcao.md` e os dois HTML. **Abra os HTML**;
>   eles são o desenho, e o texto sozinho não mostra o que você precisa julgar.
>
> **As duas sobreviventes.** O dono abriu os quatro desenhos e escolheu **C e
> D**. A e B saíram. Não as ressuscite, não as use de comparação, não pergunte
> por elas.
>
> **Três exigências. São dadas, não são escolha de designer e não estão em
> votação:**
> - **E1** — a decisão sobre tornar permanente uma mudança do dia aparece **ao
>   encerrar o treino**, e também num atalho discreto na tela do dia. Requisito
>   do projeto; nenhuma das direções o tem escrito assim.
> - **E2** — peso, medidas e fotos têm **lugar próprio**. Na D já é assim; na C
>   isso a leva de 3 para 4 lugares e quebra o critério que organizava a barra
>   dela (tudo em ordem de tempo), porque evolução não é recorte de tempo.
> - **E3** — o que passou sem registro **aparece marcado**. Já é nativo nas duas.
>
> Se uma exigência criar defeito, você **diz qual e onde** — mas não a cancela.
>
> **Duas medições que o dono recusou cravar no abstrato e quer com número:**
> - **M-a** — quanto custa contornar quando a D abre na coisa errada (ele treina
>   à noite e a tela abriu no café da manhã): quantos toques até a tela certa,
>   por caminho, no desenho que existe.
> - **M-b** — registrar ontem na C custa 4 toques, o pior das quatro (A, B e D
>   resolvem na mesma tela). Como E3 obriga a mostrar o buraco, mostrar sem
>   baratear o fechamento é meio serviço.
>
> **A régua do dono, nas palavras dele** (resposta livre, literal): "fluxos muito
> dificultosos" não; "gosto de predição, mas não dá pra ser uma briga muito
> grande pra contornar"; "gosto das coisas visuais, mas sem exagerar e poluir
> demais as telas"; "na hora do treino pode ficar mais limpa".
>
> **Regras de prova.** Toda afirmação sua se apoia num fato (F…), numa medida do
> uso (U, K, M…), numa resposta do dono (P…) ou em algo que você mediu — e você
> diz qual. Onde não houver medida, escreva "não medido" em vez de estimar sem
> dizer. Número que você contou, diga como contou.
>
> **Seu mandato: dizer o preço de C e D neste stack.** Para cada
> direção: o que é barato, o que é caro, o que exige migração de dado guardado,
> o que quebra teste existente, o que o iOS/Safari dentro do navegador não
> entrega, o que não funciona sem rede, e o que é impossível. As três exigências
> entram na conta separadas, porque elas valem para as duas.
>
> **Armadilhas técnicas conhecidas deste projeto**, que são fato de engenharia e
> não decisão de interface. Elas saíram das instruções globais do dono de
> propósito, para não contaminarem o time cego, e chegam a você por aqui:
>
> ```markdown
> ## Mobile — "sobra" de scroll / fundo aparecendo onde não deveria
> Sintoma recorrente (sobretudo iOS Safari): numa tela cheia, dá pra rolar um pouco e
> aparece um fundo (geralmente do `body`) que não deveria. Causa quase sempre é altura em
> `100vh`. Diagnóstico e correção:
> - **`100vh` no mobile = viewport GRANDE (`lvh`, barra recolhida)**, maior que a área
>   visível com a barra aberta (`svh`). Aí sobra um trecho rolável ≈ altura da barra. Trocar
>   alturas de tela cheia por **`100svh`** (estável), com `100vh` só de fallback:
>   `height: 100vh; height: 100svh;`.
> - **Conferir a cadeia inteira de ancestrais.** Basta UM wrapper acima (ex.: um
>   `min-height: 100vh` num host de rota / container do `router-outlet`) pra reintroduzir a
>   sobra, mesmo com a tela filha já em `svh`. Alinhar todos a `svh`.
> - **`overscroll-behavior: none` em `html, body`** mata o rubber-band (revela faixa ao
>   "puxar"); não resolve scroll real, mas é complementar.
> - Combinar com `overflow: hidden` na tela única; e dar ao `body` um fundo que não destoe.
> - Último recurso (blindar): travar o scroll só naquela rota (`position: fixed; inset: 0`
>   no host, ou `overflow: hidden` no `body` via classe na rota).
>
> ## Mobile — header `position: sticky` que "some" sob a barra do navegador ao rolar
> Sintoma: topbar sticky (`position: sticky; top: 0`) sobe junto com o scroll e desaparece
> (no iOS Safari, sob a barra de URL), em vez de ficar fixa.
> - Causa: algum **ancestral** tem `overflow` ≠ `visible` (ex.: `overflow: hidden` ou
>   `overflow-y: auto`). Isso cria um *scroll container*, e o sticky passa a se ancorar nesse
>   ancestral em vez da janela. Se quem rola é a janela, a topbar acompanha o conteúdo e some.
> - Correção: o ancestral entre a topbar e o elemento que rola precisa ser `overflow: visible`
>   (não pode ser hidden/auto/scroll). Deixar o clip/scroll só onde ele é o container real
>   (ex.: painel desktop com altura fixa + `overflow-y: auto`).
> - Cuidado: `overflow-x: hidden` "sozinho" também quebra — a outra direção vira `auto`. Se
>   precisar cortar só no eixo X mantendo o sticky, usar `overflow-x: clip` (não cria scroll
>   container).
>
> ## `backdrop-filter` (blur translúcido) que "pisca" no Chrome/Blink ao animar/rolar
> Sintoma: barra/elemento com `backdrop-filter: blur(...)` (topbar, rodapé, card de vidro) pisca
> ao trocar conteúdo, animar um vizinho ou resetar o scroll. Acontece no **Blink (Chrome desktop
> e DevTools em modo mobile)**; no **WebKit (iPhone real) normalmente NÃO** — engana ("no
> celular tá ok, só no desktop/devtools pisca").
> - Causa: o `backdrop-filter` re-amostra o que está ATRÁS dele a cada frame; quando um vizinho
>   anima (transform/opacity) ou a rolagem reseta, o Blink re-renderiza e pisca.
> - Correção confiável cross-engine: **remover o `backdrop-filter`** e compensar com fundo
>   translúcido um pouco mais opaco (gradiente `rgba(...)` mais forte). Perde o "frost", fica estável.
> - Complementar: `will-change: transform` no elemento QUE ANIMA (não no que tem o blur) isola a
>   animação em camada própria e reduz o repaint do elemento sobreposto.
> - NÃO resolve pôr `transform/translateZ/will-change` no ANCESTRAL do elemento com
>   `backdrop-filter`: vira "backdrop root" e o blur passa a amostrar nada (quebra o efeito).
> - ATENÇÃO: se remover o blur NÃO resolver E o piscar for **assimétrico** (só num sentido da
>   navegação/animação), o culpado é outro — barra de rolagem horizontal de um `translateX(+)`
>   (vê seção abaixo). Não saia removendo blur por reflexo.
>
> ## Animação `translateX(+N)` que faz elemento FIXO/centrado "piscar" (Blink)
> Sintoma: ao animar um bloco com `transform: translateX(+44px)` (ex.: "passar página" pra
> frente), um `position: fixed`/`sticky` centrado (rodapé, barra) PISCA. **Assimétrico: só no
> sentido POSITIVO (+X); no negativo (−X) não pisca** — pista decisiva (vale instrumentar com
> console.log a direção pra confirmar).
> - Causa: o `+X` faz o conteúdo transbordar pela DIREITA → o navegador cria uma BARRA DE
>   ROLAGEM HORIZONTAL transitória → a viewport reflui de largura → o fixo/centrado (centrado por
>   margem na viewport) é reposicionado a cada frame = pisca. O `−X` transborda pra esquerda, que
>   não gera barra → não pisca. Aparece no Blink (Chrome/DevTools); WebKit/iPhone real costuma não.
> - Correção: **`overflow-x: clip`** num ancestral do conteúdo animado — clipa o transbordo SEM
>   criar scroll container (não quebra `sticky`). `overflow-x: hidden` NÃO serve: vira `auto` no
>   outro eixo e quebra o sticky.
> ```
>
> **Entrega:** `docs/redesign/04-viabilidade.md`, em português. Uma seção por direção, mais uma das exigências.
> Cada item com: o que a direção pede, o que isso custa em faixas (barato /
> caro / exige migração / impossível), por quê tecnicamente, e o que seria
> preciso para destravar. Uma tabela final com o veredito por item.
>
> **O que você NÃO faz:** não redesenha e não propõe interface. Se algo é
> impossível, você diz o motivo técnico e o que seria preciso — não desenha a
> alternativa. Também não julga se a ideia é boa: só o que ela custa.

### C3 · Acessibilidade e corpo

> Você é **C3 · Acessibilidade e corpo**, do time que desenha este produto outra vez, do zero.
>
> **Leia primeiro, inteiro: `docs/redesign/00-briefing.md`.** Ele manda mais que
> este prompt. Obedeça em especial a regra da sala limpa (§2) e a régua (§7).
>
> **VOCÊ É CEGO AO APP ATUAL.** Não abra, não cite, não infira e não peça:
> `DESIGN.md`, `MARCA.md`, `PRODUCT.md`, `README.md`,
> `docs/LASTRO_UX_CONTRACT.md`, `docs/design-review/**`, `docs/ux-audit/**`,
> `docs/pegada/**`, `src/*.css`, `src/ui/**`, `src/palco.*`, `index.html`,
> nenhuma captura de tela e nenhum app rodando.
>
> **Você também é cego aos outros três desta onda.** Não leia `04-critica.md`,
> `04-viabilidade.md`, `04-acesso.md` nem `04-voz.md` — só o seu. Se outro já
> existir no disco, ignore.
>
> **O que você lê:**
> - `docs/redesign/01-fatos.md` — os fatos do produto (F…)
> - `docs/redesign/02-uso.md` — o uso medido (U, K, D, M…) e os dois momentos
> - `docs/redesign/02-perguntas.md` — as respostas do dono (P…)
> - `docs/redesign/03-direcao-C/` e `docs/redesign/03-direcao-D/` — as duas
>   direções que sobreviveram: `direcao.md` e os dois HTML. **Abra os HTML**;
>   eles são o desenho, e o texto sozinho não mostra o que você precisa julgar.
>
> **As duas sobreviventes.** O dono abriu os quatro desenhos e escolheu **C e
> D**. A e B saíram. Não as ressuscite, não as use de comparação, não pergunte
> por elas.
>
> **Três exigências. São dadas, não são escolha de designer e não estão em
> votação:**
> - **E1** — a decisão sobre tornar permanente uma mudança do dia aparece **ao
>   encerrar o treino**, e também num atalho discreto na tela do dia. Requisito
>   do projeto; nenhuma das direções o tem escrito assim.
> - **E2** — peso, medidas e fotos têm **lugar próprio**. Na D já é assim; na C
>   isso a leva de 3 para 4 lugares e quebra o critério que organizava a barra
>   dela (tudo em ordem de tempo), porque evolução não é recorte de tempo.
> - **E3** — o que passou sem registro **aparece marcado**. Já é nativo nas duas.
>
> Se uma exigência criar defeito, você **diz qual e onde** — mas não a cancela.
>
> **Duas medições que o dono recusou cravar no abstrato e quer com número:**
> - **M-a** — quanto custa contornar quando a D abre na coisa errada (ele treina
>   à noite e a tela abriu no café da manhã): quantos toques até a tela certa,
>   por caminho, no desenho que existe.
> - **M-b** — registrar ontem na C custa 4 toques, o pior das quatro (A, B e D
>   resolvem na mesma tela). Como E3 obriga a mostrar o buraco, mostrar sem
>   baratear o fechamento é meio serviço.
>
> **A régua do dono, nas palavras dele** (resposta livre, literal): "fluxos muito
> dificultosos" não; "gosto de predição, mas não dá pra ser uma briga muito
> grande pra contornar"; "gosto das coisas visuais, mas sem exagerar e poluir
> demais as telas"; "na hora do treino pode ficar mais limpa".
>
> **Regras de prova.** Toda afirmação sua se apoia num fato (F…), numa medida do
> uso (U, K, M…), numa resposta do dono (P…) ou em algo que você mediu — e você
> diz qual. Onde não houver medida, escreva "não medido" em vez de estimar sem
> dizer. Número que você contou, diga como contou.
>
> **Seu mandato: medir C e D contra a norma e contra o corpo.** A
> norma é a WCAG 2.2 AA. O corpo é o que o 02-uso descreve: uma mão livre, em
> pé, suado, logo depois do esforço, no subsolo com pouca luz, e também sentado
> no meio do trabalho. Mais: leitor de tela, movimento reduzido, teclado, foco
> visível, alvo, contraste, tamanho de texto, estado dito por mais de um canal.
>
> **Meça nos HTML, não no texto.** Os desenhos existem e abrem no navegador —
> contraste é conta sobre cor declarada, alvo é medida em px, ordem de foco é
> leitura do DOM. Pode escrever script para medir. Diga o que mediu e como.
>
> **Entrega:** `docs/redesign/04-acesso.md`, em português. Uma seção por direção. O que já passa (com o
> número), o que reprova (com o número e o critério da WCAG), e o que o corpo
> cobra além da norma. No fim, por direção, a lista curta do **que precisa mudar
> para ela existir** — requisito, não desenho.
>
> **O que você NÃO faz:** não redesenha. Você diz "este alvo tem 28 px e
> precisa de 44" e não "ponha o botão aqui". Também não escolhe entre C e D.

### C4 · Voz e palavras

> Você é **C4 · Voz e palavras**, do time que desenha este produto outra vez, do zero.
>
> **Leia primeiro, inteiro: `docs/redesign/00-briefing.md`.** Ele manda mais que
> este prompt. Obedeça em especial a regra da sala limpa (§2) e a régua (§7).
>
> **VOCÊ É CEGO AO APP ATUAL.** Não abra, não cite, não infira e não peça:
> `DESIGN.md`, `MARCA.md`, `PRODUCT.md`, `README.md`,
> `docs/LASTRO_UX_CONTRACT.md`, `docs/design-review/**`, `docs/ux-audit/**`,
> `docs/pegada/**`, `src/*.css`, `src/ui/**`, `src/palco.*`, `index.html`,
> nenhuma captura de tela e nenhum app rodando.
>
> **Você também é cego aos outros três desta onda.** Não leia `04-critica.md`,
> `04-viabilidade.md`, `04-acesso.md` nem `04-voz.md` — só o seu. Se outro já
> existir no disco, ignore.
>
> **O que você lê:**
> - `docs/redesign/01-fatos.md` — os fatos do produto (F…)
> - `docs/redesign/02-uso.md` — o uso medido (U, K, D, M…) e os dois momentos
> - `docs/redesign/02-perguntas.md` — as respostas do dono (P…)
> - `docs/redesign/03-direcao-C/` e `docs/redesign/03-direcao-D/` — as duas
>   direções que sobreviveram: `direcao.md` e os dois HTML. **Abra os HTML**;
>   eles são o desenho, e o texto sozinho não mostra o que você precisa julgar.
>
> **As duas sobreviventes.** O dono abriu os quatro desenhos e escolheu **C e
> D**. A e B saíram. Não as ressuscite, não as use de comparação, não pergunte
> por elas.
>
> **Três exigências. São dadas, não são escolha de designer e não estão em
> votação:**
> - **E1** — a decisão sobre tornar permanente uma mudança do dia aparece **ao
>   encerrar o treino**, e também num atalho discreto na tela do dia. Requisito
>   do projeto; nenhuma das direções o tem escrito assim.
> - **E2** — peso, medidas e fotos têm **lugar próprio**. Na D já é assim; na C
>   isso a leva de 3 para 4 lugares e quebra o critério que organizava a barra
>   dela (tudo em ordem de tempo), porque evolução não é recorte de tempo.
> - **E3** — o que passou sem registro **aparece marcado**. Já é nativo nas duas.
>
> Se uma exigência criar defeito, você **diz qual e onde** — mas não a cancela.
>
> **Duas medições que o dono recusou cravar no abstrato e quer com número:**
> - **M-a** — quanto custa contornar quando a D abre na coisa errada (ele treina
>   à noite e a tela abriu no café da manhã): quantos toques até a tela certa,
>   por caminho, no desenho que existe.
> - **M-b** — registrar ontem na C custa 4 toques, o pior das quatro (A, B e D
>   resolvem na mesma tela). Como E3 obriga a mostrar o buraco, mostrar sem
>   baratear o fechamento é meio serviço.
>
> **A régua do dono, nas palavras dele** (resposta livre, literal): "fluxos muito
> dificultosos" não; "gosto de predição, mas não dá pra ser uma briga muito
> grande pra contornar"; "gosto das coisas visuais, mas sem exagerar e poluir
> demais as telas"; "na hora do treino pode ficar mais limpa".
>
> **Regras de prova.** Toda afirmação sua se apoia num fato (F…), numa medida do
> uso (U, K, M…), numa resposta do dono (P…) ou em algo que você mediu — e você
> diz qual. Onde não houver medida, escreva "não medido" em vez de estimar sem
> dizer. Número que você contou, diga como contou.
>
> **Seu mandato: propor, do zero, como este produto fala — e depois
> escrever as palavras.** Nenhum tom é herdado: você decide a voz a partir de
> quem usa, de quando usa e do que está em jogo, e justifica cada regra com o
> uso medido, não com gosto.
>
> Depois, escreva as strings dos **dois momentos de cada direção**: rótulo de
> botão, estado vazio, confirmação, erro, o nome das coisas, o que o leitor de
> tela ouve. Inclua os casos ruins que os desenhos trazem — erro ao gravar, sem
> rede, sessão que ninguém encerrou, dia sem registro. E escreva as palavras das
> três exigências, que são novas e não têm texto em lugar nenhum.
>
> **Entrega:** `docs/redesign/04-voz.md`, em português. Primeiro as regras de voz — poucas, cada uma com
> o motivo e um exemplo do que ela aceita e do que ela recusa. Depois as
> strings, organizadas por direção e por estado, em tabela: onde aparece, o que
> está escrito, por quê. Marque toda string que não couber no espaço que o
> desenho dá.
>
> **O que você NÃO faz:** não mexe em layout e não propõe tela. Se uma palavra
> não cabe no desenho, você diz que não cabe — e não resolve mudando o desenho.
> Também não escolhe entre C e D.


## Anexo E · Prompt do R

_(a escrever em 4.a)_

## Anexo F · Sonda de contexto (rodar no início de cada sessão nova, antes de agente cego)

Subagente `general-purpose`, modelo `haiku`, em primeiro plano. Resposta esperada
enquanto as notas estiverem fora: 1 SIM, 2 NÃO, 3 NÃO.

```text
Pergunta de verificação, sem tarefa nenhuma além desta. Não use ferramentas: não leia arquivo, não rode comando.

Olhe só para o que já está no seu contexto, isto é, as instruções que você recebeu antes desta mensagem (system prompt, instruções do usuário, instruções de projeto). Responda a três perguntas, cada uma só com SIM ou NÃO, sem citar nem resumir nenhum conteúdo:

1. Existe no seu contexto um bloco de instruções globais do usuário (por exemplo, vindo de um arquivo CLAUDE.md)?
2. Esse bloco menciona o termo "backdrop-filter"?
3. Esse bloco menciona o termo "position: sticky"?
```
