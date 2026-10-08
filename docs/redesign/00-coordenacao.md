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
| C3 · Acesso | `a75c3e4329ac5af9a` | [~] | 3ª tentativa, 02/10. As duas anteriores (`ad8473e0553894aba`) morreram com a medição pronta e nada no disco: limite de sessão, depois fim do processo. Esta leva ordem de gravar em etapas |
| C4 · Voz | `aaa9339bc3e9a385a` | [~] | disparado 02/10, segundo plano |
| R · Curador | `aec33eb0f05ec83ca` | [x] | entregue e conferido em 02/10 |
| R · Curador, plano da onda 5 | `a21b25f7a62196e3a` | [~] | disparado 05/10 |
| D3 · pasta C, protótipo | `a3c49047b0d25eec2` | [x] | entregue 04/10, roteiro inteiro rodando |
| D4 · pasta D, protótipo | `a5c1301c7eaecc0ef` | [x] | entregue 04/10, roteiro inteiro rodando |
| D3 · pasta C, 2ª rodada | `a8ffe4511162060d4` | [x] | entregue 04/10: seis telas, 51 estados, mais `direcao-2.md` |
| D4 · pasta D, 2ª rodada | `a7336487485fa8580` | [x] | entregue 04/10: seis telas, 66 estados, mais `direcao-2.md`. Caiu uma vez e foi retomada pelo id |

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
- [!] 3.b′ **Os quatro caíram juntos por limite de sessão da API** (13h30, 02/10,
      conta trocada depois). C1, C2 e C4 já tinham gravado a entrega inteira; o C3
      caiu no meio da sonda mais funda, sem nada no disco. Retomado pelo id na
      mesma sessão; a sessão terminou antes de ele voltar. Terceira tentativa
      disparada como agente novo, com o prompt do Anexo D mais a ordem de gravar
      em etapas — a lição das duas quedas é que segurar a entrega para o fim
      perde a medição inteira.
- [x] 3.c `04-critica.md` (C1) — 766 l. Mede M-a e M-b, 9 achados em C e 8 em D,
      ordenados, mais "o que aguenta" com 11 itens. Derruba a premissa de M-b no
      caso desenhado (C 4 toques, D 5) e a confirma no caso real (dia vazio:
      C ~14 toques, D 1 — mas o 1 de D pré-marca "comi tudo", que é a direção que
      a própria D descartou).
- [x] 3.d `04-viabilidade.md` (C2) — 1097 l. Preço item por item nas duas, as três
      exigências em separado, o que é impossível, e tabela final de veredito.
- [x] 3.e `04-acesso.md` (C3) — 700 l., na 3ª tentativa. Mediu com Chromium:
      51 telefones, 1 526 elementos com texto, 525 controles. Achou e neutralizou
      um encaixe que encolhia os telefones (os botões da D saíam a 0,426 do
      tamanho declarado) antes de medir. C: 3 reprovações firmes em AA; D: 4 firmes
      + 1 limítrofe + 1 defeito de estado programático. As duas passam em contraste
      de texto (zero), em alvo mínimo (zero abaixo de 24) e em foco visível
      (525/525).
- [x] 3.f `04-voz.md` (C4) — 820 l. Oito regras de voz com motivo, o nome das
      coisas, as palavras das três exigências, as strings dos quatro momentos, o
      que o leitor de tela ouve, e as que não couberam no espaço do desenho.
- [x] 3.g Conferir os quatro contra vazamento e contra o mandato → **os quatro
      limpos**: zero vocabulário do app atual (busca por Instrumento, tokens
      `--ins`, raio zero, hairline, as duas fontes, sparkline, o hex do acento e
      os nomes dos arquivos proibidos); zero proposta de solução no C1; zero
      mexida em layout no C4; zero redesenho e zero escolha entre C e D no C3.
- [x] 3.h **Onda 3 fechada.** Achado convergente mais forte, e os três chegaram
      nele por caminhos diferentes, cegos entre si: **E1 é a única exigência que
      cria defeito novo, e nas duas direções.** C1 pelo número (só alcança as 37%
      a 58% de sessões que ele encerra; o instante é o nº 1 em dificuldade do
      produto); C3 pela medida ("discreto" é exatamente o que já reprova em alvo
      nos dois desenhos); C4 pelo conflito (as duas recusam por escrito perguntar
      sob o relógio). Vai para o parecer como decisão do dono, não como conserto.
- [x] 3.i **Notas de mobile devolvidas ao `~/.claude/CLAUDE.md`** e o arquivo
      lateral apagado (fecha o R1). Ressalva: se a onda 5 usar agente cego, elas
      precisam sair outra vez — o canal de vazamento volta com elas.

## ONDA 4 · O parecer

- [x] 4.a Prompt do R salvo no Anexo E (R vê os dois mundos). Acrescentei ao que
      o briefing pede: o peso da convergência do cerco é real, porque os quatro
      foram cegos entre si — e a instrução de separar o que ele conferiu do que
      repete de um agente.
- [x] 4.b `06-parecer.md` entregue → 1189 l., 7 seções, 15 decisões numeradas,
      16 achados marcados como convergentes e 6 como não medidos.
- [x] 4.c Conferido: **sem quinta direção, sem fusão, sem campeã** (busca por
      linguagem de escolha e de proposta: zero). §2 mede a diferença contra o app
      atual em 17 dimensões, §3 nomeia as perdas item por item, §5 tem as 15
      decisões numeradas. A pergunta da mistura (decisão 15) está escrita como
      pergunta, com a tabela dos defeitos que cada uma resolveria na outra, e sem
      desenho — como o briefing manda.
- [x] 4.d **Conferência minha das duas afirmações mais pesadas do parecer**, que
      são as que mudam a mesa do dono:
      - **E1 já existe no app.** Confirmo de primeira mão: `src/ui/telas/decisao.jsx`
        é a tela da decisão, e `S.promoPendente` guarda a pergunta quando a sessão
        fecha sozinha e a devolve na abertura seguinte, sem interromper treino novo.
        Trabalhei nesse fluxo nesta mesma semana (`1f53ec3`, posição de leitura da
        decisão). O número que o cerco usou contra E1 — alcançar só 37% a 58% das
        sessões — já tem resposta no código.
      - **Pôr comida em dia é impossível hoje.** Confirmo em `main.jsx:1847`:
        `diaDeComida()` fecha o dia velho na virada e nasce um novo vazio; `S.dia`
        é um objeto só, do dia corrente. Peso e treino aceitam data passada;
        comida não tem onde escrever. Isso reenquadra M-b: os ~14 toques de C não
        se comparam a um número menor, comparam-se à tarefa não existir.
      - **A divisão dos testes confere**: 372 de domínio e 513 de fluxo, 885 ao
        todo. Rodei as duas pastas em separado.
- [!] 4.e Transitório observado: uma rodada isolada de `tests/fluxo` acusou 1
      falha e as duas seguintes passaram 513/513. Combina com as 4 rejeições
      soltas já registradas (render que aterrissa depois de a janela fechar).
      Não bloqueia; fica anotado para não virar surpresa.

### ═══ PARADA 3 · o dono decide ═══ — FECHADA em 05/10

- [~] P3.a Apresentar o parecer ao dono (02/10). O achado que reenquadra tudo: as
      duas sobreviventes abrem a tese com a mesma oração, palavra por palavra, e
      essa oração é a tese do app que já existe. Ele não escolhe entre duas
      filosofias — escolhe entre duas execuções da mesma, que também é a de hoje.
- [x] P3.b **Parar.** Respondido em 04/10, na folha de decisões (artefato
      `E6Xz162eyGNjQgUWehq7KJ`, documento `folha/respostas`, versão 85).
- [x] P3.c Registrar, literal, o que ele decidiu:

  **A escolha entre C e D: NÃO FEITA.** Marcou "ainda não sei, quero responder o
  resto primeiro". Combinada com a decisão 12 ("quero ver desenhado antes de
  escolher"), fecha um círculo: a opção 12 dizia que quem desenha o que falta é a
  direção escolhida. **É o bloqueio a resolver antes de qualquer onda 5.**

  **Decidido (10):**

  | | decisão | resposta |
  |---|---|---|
  | D1 | pergunta ao encerrar o treino (E1) | **TIRA a exigência.** A mudança espera numa lista. Ele abre mão do que ele mesmo pediu na parada 2, e o produto perde uma capacidade que hoje tem e tem teste |
  | D4 | o que o app mostra na porta da academia | **o treino ganha da refeição** na manhã de dia de treino |
  | D6 | consertar um número errado | **corrigir no lugar, sempre**, série e comida. Alinha com a regra escrita do app de hoje |
  | D8 | teclado | **misto**: teclado próprio onde atrapalha, do sistema onde não (notebook, campos de texto) |
  | D10 | tema | "decido vendo" **+ nota que é a decisão**: "de acordo com o sistema, mas com a possibilidade de mudar qnd quiser" → segue o tema do aparelho, com troca manual |
  | D11 | paleta e movimento | **SIM**, e a regra vigente "quase nenhum movimento" muda de propósito |
  | D12 | o que ninguém desenhou | **quer ver desenhado antes de escolher** |
  | D13 | os 513 testes de fluxo | **reescrever em bloco** — a opção que o parecer nomeia como o modo de falha histórico do projeto |
  | D9 | lugar do corpo | "depende da direção" **+ nota: "eu nao entendi muito bem ql a questao, mas prefiro o minimo de toues necessario"** → não respondida de fato |
  | escolha | C ou D | "ainda não sei" |

  **Adiado para o detalhamento (4):** D2 (lista do dia da D tocável), D3 (fechar
  dia de comida passado), D5 (janela de repetições), D7 (até quando a marca
  aparece).

  **As catorze abertas, respondidas 14 de 14:**

  | | pergunta | resposta |
  |---|---|---|
  | 14.1 | hora-limite pessoal | não |
  | 14.2 | guardar qual refeição saiu do plano | sim (mexe nos dados) |
  | 14.3 | separar "não comi" de "esqueci" | **sim** |
  | 14.4 | "não contei a água" ≠ zero copos | sim, **como fato** (mexe nos dados) |
  | 14.5 | porções além de tudo e metade | sim |
  | 14.6 | previsto no horário real dele | **não: horário do plano** |
  | 14.7 | RIR | em toda série |
  | 14.8 | o aviso de subir carga olha o RIR | **sim, entra no cálculo** |
  | 14.9 | quanto a mudança do dia espera | **vence em alguns dias** |
  | 14.10 | lê a tela a 3 m | não sei → continua travando a sessão de fotos |
  | 14.11 | bioimpedância e fita | respondida em texto longo: percentual e massa de gordura (com visceral), massa magra, água intra e extracelular, taxa metabólica basal e idade metabólica, massa óssea, IMC ajustado e distribuição por segmento |
  | 14.12 | revisão da semana em dia fixo | não, sempre disponível |
  | 14.13 | ceia | **sim** e **é assunto do nutricionista** (as duas) |
  | 14.14 | vencimento da aula do box | por posição na sequência |

- [!] P3.d **Quatro conflitos entre respostas, para levar a ele antes da onda 5:**

  1. **O círculo da escolha.** `escolha` = "não sei" e D12 = "quero ver desenhado
     antes". Como só a direção escolhida desenharia o que falta, nada anda. Saídas:
     pedir às DUAS que desenhem (dobra o custo), ou escolher com o que existe.
  2. **14.3 decide a D3 sem dizer.** Ele adiou "como fechar um dia passado" e
     respondeu **sim** a "separar não comi de esqueci" — que é exatamente a
     terceira saída da D3. Na prática a D3 está respondida.
  3. **D1 + 14.9 criam uma pergunta nova.** Tirou a pergunta ao encerrar E disse
     que a mudança do dia **vence em alguns dias**. Mudança que vence sem ele
     decidir é o F280 nominal — o defeito que descartava a mudança do dia em
     silêncio. Falta dizer o que acontece no vencimento.
  4. **D10 custa o que ninguém desenhou.** "Segue o sistema, com troca manual"
     exige os DOIS temas; as duas direções desenharam só o claro, e o C3 mediu
     contraste nos dois temas mas não há desenho escuro.

- [x] P3.f **As três perguntas de desempate, respondidas em 04/10:**
  - **D9**: vai tudo para a tela nova — registrar e ler no mesmo lugar. Ele viu o
    custo escrito (~3 toques a mais na pesagem da manhã, que hoje é 1) e escolheu
    assim mesmo. A nota dele ("prefiro o mínimo de toques") fica como régua geral,
    não como resposta desta.
  - **D13**: em bloco, **com uma rede antes** — listar, em uma linha, o que cada
    grupo dos 513 testes de fluxo protege, para a reescrita ter contra o que
    conferir. **Tarefa do coordenador, antes de qualquer reescrita.**
  - **O laço**: as duas direções desenham o que falta, e ele escolhe vendo.
    Custa duas rodadas de desenho; ele aceitou.
- [~] P3.g Segunda rodada de desenho disparada (Anexo G). Seis telas por direção:
      aula, comparar fotos, sessão de fotos a 3 m, corpo, semana e prescrição —
      claro e escuro, mais `direcao-2.md` dizendo o que as decisões mudam no que
      já estava desenhado.
- [~] P3.h Conferir as duas entregas contra vazamento e contra os requisitos
  - **C, conferida e limpa**: seis telas, zero dependência de rede nos oito HTML
    da pasta, zero vocabulário do app atual, os dois temas em todos. O desenhista
    resolveu a dúvida dos 3 m por aritmética do aparelho (69 mm de tela ⇒ 4 a 8
    caracteres legíveis por linha) e entregou a união das duas hipóteses, que não
    depende da resposta do dono — era exatamente o que o prompt pedia.
  - **D, conferida e limpa** depois da retomada: seis telas, 66 estados, sem rede,
    sem vazamento, os dois temas. Ao montar a última tela o desenhista achou uma
    colisão de nome de classe que atingia as cinco já commitadas — desenhava uma
    barra preta sobre o cabeçalho da semana — e reconstruiu as cinco. Conferi:
    a classe antiga sumiu dos seis e a nova está nos seis.
  - Tudo commitado antes de retomar, para a queda não custar nada. Funcionou.
- [x] P3.i.1 Comparação das seis telas entregue ao dono (artefato
      `8z5BBrZDbzP8WBNuxeMbho`): o que as duas fazem igual, onde se separam, o
      padrão somando as seis, e as perguntas que elas devolveram.
      **Leitura minha, registrada:** a D continua prevendo onde a C não prevê
      (peso em régua posicionada, bioimpedância pré-preenchida com o mês
      passado) — a mesma separação dos dois primeiros momentos, agora em telas
      novas, o que mostra que não era detalhe de desenho. A melhor ideia isolada
      da rodada é o vencimento da D, amarrado à volta do treino em vez de a um
      número de dias. A C ganha na conta de volume da prescrição e no conserto da
      foto torta. E as duas chegaram, cegas, ao mesmo desenho da sessão de fotos.
- [~] P3.i Apresentar ao dono e **registrar a escolha entre C e D**
  - 04/10, depois de ver a comparação das seis telas, ele perguntou se precisa
    escolher entre as duas e pediu protótipo. Respondido: escolher uma inteira
    não é obrigatório, mas a mistura precisa de um autor e é rodada nova — o
    coordenador não funde (briefing §4, Onda 4).
  - **Ele escolheu: protótipo tocável nas DUAS**, mesmo roteiro, e decide depois
    de usar. Disparados (Anexo H).
  - Dito a ele o que protótipo não responde: testa impressão em três minutos, não
    hábito ao longo de semanas — decide bem entre C e D, decide mal se a tese
    está certa.
- [x] P3.i.2 Conferidos os dois: zero dependência de rede, zero diálogo do
      sistema, `100svh` com área segura, os dois temas, `prefers-reduced-motion`
      desligando o movimento, e o script compila. Os dois declaram ter rodado o
      roteiro inteiro em Chrome sem janela (C: 33 passos de clique em três
      tamanhos de tela; D: 12 passagens a 414×896).
- [x] P3.i.3 Publicados para o dono abrir no celular:
      **C `AmCCbEGxynppVWhkqWXXBU`**, **D `Y17FJJ8ksFRpoaj3uSx4Gu`**.
      Duas intervenções minhas nas cópias publicadas, com os arquivos do
      repositório intactos:
      - **a D passou a abrir clara** (`tema:""` → `tema:"light"`). A C já abria
        assim por decisão do próprio desenhista. Com temas padrão diferentes a
        comparação começaria torta, e o dono tem regra de não receber tela
        escura. O seletor de três posições continua nas duas, então o tema que
        segue o aparelho — que é a decisão de produto dele — continua testável;
      - **o acolchoamento de área segura do invólucro do artefato foi zerado**
        (`:root{padding:0}`): as duas telas já tratam `env(safe-area-inset-*)`
        sozinhas, e o acolchoamento duplo deixaria um pedaço rolável embaixo,
        que é exatamente a armadilha registrada no CLAUDE.md do dono.
      O invólucro do artefato também substitui o `<meta viewport>` das duas, que
      traziam `user-scalable=no`/`maximum-scale=1`: no publicado dá para dar
      zoom. Não muda nenhum fluxo do roteiro.
- [x] P3.i.5 **A ESCOLHA, registrada em 05/10.** Depois de usar os dois
      protótipos: *"acho que gostei mais da d. achei mais organizado e
      intuitivo"*. Confirmada como decisão em pergunta de desempate, na forma
      **"D, com peças da C dentro"**.

      **Vai a D**, com três peças da C entrando como requisito — não como
      redesenho, e não por iniciativa minha; cada uma é um defeito que o cerco
      mediu na D e achou resolvido na C:
      - **as linhas do dia viram tocáveis** (resolve M-a: contornar custava 1 a 2
        toques e começar o treino não tinha caminho). Isso responde a decisão 2,
        que estava adiada;
      - **cada toque grava, sem botão de guardar no fim** (resolve o único ponto
        das duas em que fechar o app perde trabalho);
      - **a conta de volume semanal na prescrição** (subir uma série da flexora
        leva o posterior a 8 contra 7 prescritas).

      **Recusada:** a folha de pôr em dia abrir em branco. Ele manteve a da D,
      que abre pré-marcada como "comi tudo".

      **Repetições: fica a régua da D**, que responde a decisão 5, também
      adiada. O defeito medido dela — 6 de 12 valores sem arrastar, e toque
      engolido como arrasto na ação mais frequente — vai para o detalhamento.

      Escrito também na folha de respostas (documento `folha/respostas`, versão
      86), para a folha não ficar dizendo "ainda não sei".

- [x] P3.i.6 **Conflito entre duas respostas dele, levantado e resolvido na
      hora.** Manter a folha pré-marcada como "comi tudo" **e** tirar o botão de
      guardar não conviviam: sem o guardar, o pré-marcado viraria registro
      sozinho, e um dia inteiro contaria como consumo conhecido sem ele ter dito
      nada — o F290/F292, o dia chutado que destravou um corte de comida.

      **Resolvido por ele: o pré-marcado é sugestão até o toque.** A folha abre
      com o plano marcado como proposta, e nada daquilo é registro; **um** toque
      em qualquer linha — inclusive um "foi tudo isso mesmo" — fecha o dia
      inteiro. Fica barato (um toque por dia, não zero) e nada é declarado sem
      ele. Vai como requisito para o detalhamento.

- [!] P3.i.4 **Comparação torta num ponto, declarado pelas duas:** o salto de
      6h55 para 15h30 ao sair da sessão é ficção necessária (o lanche não existe
      de manhã). Conferir, quando o dono comparar, se as duas fazem o salto no
      mesmo lugar — a D avisou que faz ao sair da sessão.
- [ ] P3.j **A rede do D13**: inventário do que cada grupo de teste de fluxo
      protege, uma linha cada. Não bloqueia a escolha; bloqueia a reescrita.

- [!] P3.e **D13 = reescrever em bloco.** O parecer é explícito: é o único lugar
      onde se perde capacidade sem ninguém perceber, e é o modo de falha que já
      aconteceu quatro vezes neste projeto. Levar a ele uma vez, com a prova, e
      aceitar a resposta dele seja qual for.

- [ ] P3.a Apresentar o parecer
- [ ] P3.b **Parar.**

## ONDA 5 · O ofício ← AQUI

- [~] 5.a O escopo é definido pelo curador junto com o dono, não aqui.
      **Pedido ao curador em 05/10** (`a21b25f7a62196e3a`): `07-plano.md` com o
      que está em aberto e trava o quê, as frentes e o que cada uma produz,
      **como isto chega ao app que existe** — a parte que só quem vê os dois
      mundos escreve —, o que fica para depois e os riscos. Sem estimativa de
      prazo: ninguém mediu.
- [x] 5.a' **As oito do plano, respondidas em 05/10** (folha de respostas, versão
      101). Registro literal:

      | | pergunta | resposta |
      |---|---|---|
      | P1 | prazo da mudança do dia | **por posição: vence quando aquele treino voltar.** Sai de graça do modelo; nenhum carimbo novo no dado |
      | P2 | o que acontece ao vencer | **vira "só daquele dia", dito e desfazível.** Fecha o F280 que a D1 tinha reaberto |
      | P3 | campos da bioimpedância | **cinco, não treze:** peso (kg, obrigatório), massa muscular esquelética (kg, obrigatório), massa de gordura (kg, obrigatório), percentual de gordura (%, obrigatório), água corporal total (L, opcional) |
      | P4 | linhas tocáveis durante o treino | **sim, sempre** |
      | P5 | pesagem entre séries | **lá também: atalho no descanso** |
      | P6 | a ceia conta na adesão | **sim** |
      | P7 | "não comi" conta como dia conhecido | **sim** — o portão de 11 em 14, que nunca abriu, passa a ser alcançável |
      | P8 | porções | **com uma acima de 1**, para "comi mais que o plano" |

- [x] 5.a''' **Os dois pontos, respondidos em 05/10:**
      1. **O peso da bioimpedância é outro registro**, separado da pesagem da
         manhã: ele pesa numa balança e mede na outra, em horas diferentes. Os
         dois convivem de propósito, e a migração abre as cinco chaves.
      2. **A ceia e o "não comi" são posição do nutricionista**, não palpite
         dele. Seguem como regra, inclusive para trás — a adesão histórica pode
         ser recontada.
      3. Por onde começar: **pela rede**, que não depende de decisão nenhuma. O
         plano em linguagem direta vem depois dela andar.

- [x] 5.a'' **Dois pontos conferidos com ele em 05/10 — ver 5.a''' acima:**
      1. **O "peso" da lista da bioimpedância.** `S.body.peso` já existe e é a
         pesagem da manhã. Se o peso da balança de bioimpedância for o mesmo
         registro, a migração abre quatro chaves novas, não cinco — e a tela não
         pede o peso duas vezes. Se for outro, duplica de propósito. Não
         perguntado ainda.
      2. **P6 e P7 estavam marcadas como "resposta do nutricionista"** e vieram
         respondidas direto. A da ceia muda a adesão **para trás** (o total de
         cada dia está congelado no histórico), então vale confirmar se é
         posição dele ou do agente.

- [x] 5.b **O dono aprovou o plano inteiro em 05/10**, as cinco frentes na ordem
      proposta, sem cortar nenhuma. O plano lhe foi levado em página
      (`claude.ai/artifact/FdmHboU1fQ9H6HUesTHXbu`), com a rede medida, as cinco
      frentes, as três coisas que mudam de preço e a pergunta sozinha no fim.
- [~] 5.c Frentes disparadas conforme o plano. **Duas em 05/10**; as outras três
      esperam, porque o próprio plano as encadeia — a frente 2 precisa dos
      lugares definidos, a 3 só corre quando os estados existem, e a 4 se apoia
      nas duas.
      - **Frente 0** (`a14cbd9eb1e8cb540`) → `09-frente0.md`. Entrega a migração
        única 9 → 10 com as quatro mudanças de dado persistido juntas (as cinco
        chaves da bioimpedância, com o peso **separado** da pesagem da manhã; o
        instante da marca por refeição convergindo o dia corrente na forma que
        `DiaComidaHist.done` já tem; qual refeição saiu do plano; "não contei a
        água" como fato), cada uma pelos seis portões, mais a função pura que
        põe comida em dia de data arbitrária — que o app não tem e é o chão da
        folha da frente 2.
        **O cuidado que eu pus por escrito:** a adesão histórica está congelada
        em `DiaComidaHist.tot`/`.pv` por invariante deliberada. "Pode ser
        recontada" não autoriza reescrever o histórico; a recontagem é leitura
        derivada sobre o total congelado. Se ele concluir que é impossível sem
        reescrever, para e escreve o porquê — essa decisão volta ao dono.
        Dono dos arquivos: `src/dominio/**`, `src/main.jsx`, `tests/dominio/**`
        e `tests/fluxo/dados.test.js` (só ele).
        **ENTREGUE em 05/10** (`fe369d7` → `f346923`, 9 commits, sem coautoria).
        `09-frente0.md`. **Conferi por conta própria antes de aceitar:** rodei
        `npm test` (**941 passando**, 53 arquivos, fluxo 514 → 516, domínio
        372 → 425, e os **mesmos 4** unhandled rejections de antes, não um a
        mais), `npx tsc --noEmit` limpo, `PLANO_ATUAL = 10` com `migraPlano10`,
        zero linha de coautoria, e li os diffs dos dois arquivos de fluxo fora
        do escopo dela.
        **A migração saiu com cinco mudanças numa só**, como o plano manda.
        A quinta (`promoPendente` → coleção) ela resolveu **rejeitando a chave
        natural que eu propus**: `day + sid` fundiria a mesma pergunta como duas
        entradas, porque `day` é editável no meio do treino e ele responderia
        duas vezes. Adotou `sid` sozinho. Conferi: `sid` é atribuído no
        nascimento da sessão e nunca reatribuído (`grep '\.sid ='` não acha
        nada). **A razão dela é melhor que a minha.**
        **O total congelado não precisou ser reescrito**, e ela não parou: a
        adesão já era leitura derivada (divide por `refeicoesDeHoje` do plano de
        hoje; o congelado é `tot`, que a adesão não usa). A regra nova reconta
        para trás sem tocar em byte, com teste — o mesmo dia fechado passa de
        6/6 para 6/7 e `tot.kcal` fica idêntico. Era exatamente o cuidado que eu
        pus no briefing, e ele se resolveu sozinho.
        **Quatro defeitos de dado já embarcados, achados e consertados** (conferi
        o primeiro contra `39d2fdb`, que não tinha `aderencia` em `sincronia.ts`
        nenhuma vez): `aderencia` sumia na fusão do dia aberto; o dia aberto não
        tinha carimbo nenhum; `fechaDia` perdia a hora da marca (carimbava todas
        com a hora do fechamento — foi a fixture que mostrou); e a lápide da
        refeição não tinha quem a escrevesse (`chaveDeRefeicaoFeita` existia na
        fusão e nada no app a gravava). Mais um na promo, da mesma família do
        bug da importação: **`finalizarSessao` apagava as perguntas guardadas de
        OUTRAS sessões**, porque `S.promoPendente = null` varria o documento
        inteiro.
        **A fixture não foi digitada:** gerada rodando o build do `39d2fdb` no
        harness, com relógio fixo, vivendo um dia pelos verbos do app e virando
        a data. É o dado da época, não um objeto com a forma de hoje. Registro
        em `tests/dominio/fixtures/LEIA.md`.
      - [ ] **5.a'''' PENDENTE COM O DONO — a ceia não existe no plano dele.**
        `PLANO_BASE` tem **seis** refeições (`pre`, `treino`, `pos`, `almoco`,
        `lanche`, `jantar`) e a nota do jantar diz, textualmente, *"Sem ceia
        obrigatória: o dia já fecha proteína e energia com quatro refeições
        proteicas completas."* Conferi em `src/dominio/nutricao/alimentos.ts`.
        Então **"a ceia conta na adesão" não é código**: é o dono acrescentar a
        refeição, e ninguém prescreveu horário nem itens. A frente 0 não a
        inventou, e fez certo.
        Pior: mudar `PLANO_BASE` **não alcança o aparelho dele**, porque o plano
        é documento persistido semeado da base. Para entrar no plano que já
        existe, precisa de **outra migração**, com o conteúdo congelado dentro
        dela. Perguntado a ele em 05/10.
      - [~] **5.a''''' Decisão que a frente 0 tomou e que ele pode derrubar:**
        **teto de 1 por refeição** na adesão (`Math.min(1, peso)`), com o
        excedente medido à parte em `excessoDoDia`. Sem o teto, comer mais que o
        plano aparecia como aderir *melhor* que aderir, e o recorte do histórico
        contava o dia como cumprido pelo excedente sozinho. Com duas leituras
        nada se perde. É aritmética que o nutricionista pode querer de outro
        jeito, então fica dito.
      - [x] **5.a'''' RESPONDIDA em 05/10: a ceia é copo de leite com duas
        colheres de Neston.** Entrou como **migração 10 → 11** (`ba03f95` →
        `038efb0`, 5 commits). **Conferi:** `npm test` → **954 passando**,
        `tsc --noEmit` limpo, `PLANO_ATUAL = 11` com `migraPlano11` e
        `CEIA_PLANO_11`, `neston` no catálogo, zero coautoria.
        Três coisas que eu decidi em cima do dado dele, não por palpite:
        **250 ml** porque `pos` e `lanche` já usam `q: 250` para leite — é a
        convenção dele; **30 g** porque é a porção que o rótulo do Neston usa;
        **21:30** que foi **suposição minha**, marcada como tal em dois lugares
        no código e no documento, porque ele não deu horário.
        **O alvo calórico, medido e sob asserção** (`migracoes.test.ts:694`):
        dia de treino 3.007,1 → 3.278,7; descanso 2.844,1 → 3.115,7; **+271,6
        kcal em todos, ~9%**. Confirmei a aritmética sozinho (152,5 do leite +
        119,1 do Neston). O "antes" não é só cálculo: é `tot.kcal` congelado na
        fixture, escrito pelo build da época.
        **Os 17 vermelhos revelaram um defeito real**, e é a rede funcionando: em
        `diario.test.ts` o "dia cheio" estava **escrito à mão**, então a ceia o
        transformou num dia com refeição faltando enquanto o teste continuava
        chamando aquilo de "comeu tudo". Passou a ser derivado do plano, e o
        mesmo foi feito em `fusao.test.js` — não envelhecem na próxima refeição.
        **Uma janela de sincronização achada e fechada:** o plano é documento, e
        um aparelho ainda no plano 10 podia vencer o documento e a ceia sair. A
        versão do formato viaja no **mesmo clone**, então o lado atrasado leva a
        versão de volta a 10 e o boot seguinte roda `migraPlano11`. Dois testes.
        **As duas cópias congeladas** (`CEIA_PLANO_11` e a do `PLANO_BASE`) não
        se referenciam de propósito, com um teste cobrando que descrevam a mesma
        ceia — é o que impede aparelho migrado e aparelho novo de nascerem
        diferentes. A mensagem do teste diz o que fazer se ficar vermelho:
        migração 11 → 12, nunca copiar o valor de um lado para o outro.
      - [ ] **5.a'''''' PENDENTE COM O DONO — duas coisas da ceia:**
        1. **Os valores do Neston** continuam **não conferidos contra a lata**.
           Fui eu que os passei de memória (397 kcal, 9,5 P, 78 C, 4,5 G por
           100 g) e estão marcados no código como pendentes. A frente 0 mediu o
           que podia: os macros fecham com o kcal declarado dentro de **1,7%**,
           folga normal de rótulo — e escreveu no código que consistência
           interna **não é** conferência. É a única coisa desta entrega que
           depende de alguém olhar um objeto físico.
        2. **O ledger do ajuste calórico foi construído sobre o alvo antigo**, e
           o alvo subiu ~9%. Ninguém mediu o efeito do alvo novo sobre as
           decisões de corte já registradas em `S.ajusteHist`. Declarado como
           não medido, e é decisão dele com o nutricionista.
      - [~] **Uma falha intermitente que EU vi e a frente 0 não reportou.** Na
        minha primeira execução da suíte: 953 passando, **1 vermelho**. Perdi o
        nome (cortei a saída). Nas **nove** execuções seguintes, 954/954. Caça
        em curso com relatório JSON por execução. Não atribuo à ceia sem prova —
        pode ser anterior —, mas fica registrado porque falha que se esconde é
        pior que falha fixa.
        **Caça encerrada sem nome: 1 falha em 24 execuções.** Depois da falha,
        23 execuções limpas (6 por `npm test` com build, 17 por `npx vitest run`
        sobre o dist já construído). Não reproduzi, e o nome do caso foi perdido
        na primeira saída.
        **A suspeita, com base e não medida:** as **4 unhandled rejections** que
        a suíte de fluxo já tinha antes de qualquer frente — `createElementNS`
        ×2 e `addEventListener` ×2, todas depois do `a.fechar()`, trabalho
        assíncrono do app chegando numa janela jsdom já fechada. O próprio
        Vitest avisa que elas *"might cause false positive tests"*, e uma
        rejeição que pousa durante outro arquivo explica exatamente uma falha que
        muda de lugar e não se reproduz. A `08-rede.md` já as havia registrado;
        o `07-plano.md` **não** as tem na lista de riscos.
        **Por que isto não é detalhe:** a rede é o mecanismo de segurança da
        reescrita em bloco. Uma suíte que mente uma vez em 24 é uma rede
        comprometida — se um vermelho da reponta puder ser ruído, a regra "se
        ficou vermelho, o erro é da reponta" deixa de valer. Tentativa anterior
        de mitigar (guarda de render) foi **medida e piorou** (6 rejeições em vez
        de 4) e foi revertida.
        **Vai à mesa do dono como escolha de ordem**, não como conserto
        silencioso: consertar o desligamento das telas antes de a reescrita se
        apoiar na rede, ou seguir sabendo do ruído. A frente 2 mexe exatamente
        nesse código.
      - [~] **O dono escolheu CONSERTAR primeiro, em 05/10** ("faça o conserto e
        depois continue"). Disparado (`abd0e945afe6a1570`) →
        `09-desligamento.md`.
        **O que eu localizei antes de passar, para o agente não começar do
        zero:** as quatro rejeições saem **todas de `protocolo.test.js`**, o
        caminho do byte da foto; o `undefined` é o `document`, e
        `createElementNS` é o Preact criando SVG no diff, então **é render, não
        efeito solto**; o `fechar()` do harness faz só `stopTimer()` e
        `w.close()`; e **o app não tem desmontagem nenhuma** —
        `grep -nE "render\(null|unmount" src/ -r` não acha nada. O harness
        fecha a janela por baixo de um app que continua trabalhando.
        **O aviso que pesa mais:** a tentativa anterior **piorou** (guarda de
        render levou de 4 para 6, foi medida e revertida). Então mandei **não**
        começar por guarda de render, e sim por **cancelar o trabalho em voo no
        desligamento** — com a direção marcada como sugestão, não ordem.
        **Protocolo obrigatório:** `grep -c "Unhandled Rejection"` antes (4) e
        depois (tem de ser 0; sobrar 1 ou 2 se declara, não se esconde), suíte
        em 954, e **dez execuções registradas uma por uma** — com a frase de que
        dez limpas **não provam** que a intermitência acabou, dado que a
        original aparecia uma vez em 24. Proibido mexer em expectativa de teste
        para a rejeição sumir.
        **Isto não é só higiene de teste:** é a disciplina de desligamento que a
        frente 2 vai precisar e que hoje não existe no app.
      - [x] **CONSERTADO em 05/10: 4 → 0** (`3d28db2`, `17ab671`).
        `09-desligamento.md`. **Conferi:**
        `npx vitest run --project fluxo | grep -c "Unhandled Rejection"` → **0**;
        `npm test` → **954 passando**, 53 arquivos, e a **linha de "Errors"
        desapareceu** do relatório (antes dizia "Errors 4 errors"); o diff em
        `tests/` é **só o `fechar()` do harness** (15 linhas), nenhuma
        expectativa tocada; zero coautoria.
        **A guarda de render era mesmo metade do problema, e agora se sabe por
        quê.** As duas rejeições de `createElementNS` vinham de
        `garanteBytesDoCorpo`, que volta de doze `await` depois do `close()` e
        chama `render()` seis vezes. Mas as duas de `addEventListener` vinham da
        **fila de re-render do próprio Preact** — `useState` agenda num
        microtask, `useEffect` espera a pintura — e **nenhuma guarda em
        `render()` alcança isso, porque não passa por lá**. É a explicação de por
        que a tentativa anterior piorou: silenciou o caminho visível e deixou o
        invisível. Desmontar alcança os dois, e por mecanismo: quem executa
        pendência no Preact confere `_parentDom`, que o unmount anula.
        O conserto: `desmontaDoApp()` em `raiz.jsx`, `CTX.desliga()` que trava o
        render, para os três relógios e desmonta, nessa ordem; bail depois de
        cada `await` em `garanteBytesDoCorpo`; e o `fechar()` chamando `desliga()`
        antes de `w.close()`.
        **Dois achados de método que valem mais que o conserto:**
        1. **A primeira instrumentação dele mentiu** e dizia o contrário do
           verdadeiro ("o render nunca é chamado depois do fechamento"). Causa: o
           `treeshake: true` do `vite.config.js` removeu a função marcadora,
           alcançável só por string via `__escopo`, e o Rollup dobrou o `if` em
           código morto. **O sinal era os dois builds saírem com hash idêntico.**
           Por isso `desliga` entrou em `CTX` e não em `window`. **Lição para
           toda instrumentação futura neste repo:** conferir a string de
           diagnóstico no bundle antes de acreditar na medida.
        2. **Um bug de produção que a suíte NÃO pegaria**, introduzido e pego por
           ele: `let desligado` tinha de ficar no topo do arquivo (linha 84), não
           ao lado de quem o escreve (4677). `load()` roda na avaliação do
           módulo quando `readyState` não é `'loading'` — script de módulo é
           diferido, então em produção já é `'interactive'` (conferi a condição
           em `main.jsx:4707`). Um `let` abaixo faria da primeira pintura um erro
           de TDZ **em produção e não nos testes**, porque no jsdom o script é
           inline e o `readyState` ainda é `'loading'`.
        **Dez execuções limpas, e ele escreveu que isso NÃO prova** que a
        intermitência acabou — a original aparecia uma vez em 24. O que mudou é
        que a suíte deixou de ter a condição que o Vitest chama de *"might cause
        false positive tests"*. O elo segue **suspeita, não medida**, e não dá
        mais para medir: o nome do caso foi perdido e a causa foi removida.
        **Descartado com medida, não por palpite:** `reconciliaFotos` e
        `reconciliaCorpo` ficaram **sem** guarda — instrumentadas depois de cada
        `await`, nenhuma volta depois do desligamento em nenhum dos 517 casos.
        **Não medido, e registrado:** `CTX.desliga()` **nunca é chamado no app
        real** — `pagehide`/`beforeunload` não foram ligados, de propósito, porque
        desmontar em `pagehide` deixaria o app em branco ao voltar do cache de
        navegação do iOS, que é como este app é usado. O verbo existe e hoje só o
        harness usa. E `migracaochave.test.js` sobe 7 apps e chama `fechar()`
        zero vezes — essas janelas nunca são desligadas; consequência não medida.
        **Detalhe operacional para sessões futuras:** `console.log` de dentro do
        jsdom **não aparece** no relatório do Vitest. Canal de diagnóstico tem de
        ser `fs.appendFileSync`.
      - **Frente 2 ENTREGUE em 05/10** (`ab4a13c2e9876c2e7`),
        `09-frente2-interacao.md`, 2.172 linhas, 12 seções, 9 commits só nesse
        arquivo. **Conferi os quatro pontos que mudam trabalho, e dois erros
        eram MEUS, não dele:**
        1. **O `scrollLeft` da régua não se perde pelo cronômetro.** `tick()`
           escreve só `textContent` e não chama `render()`. Quem derruba é o
           **relógio de parede**: no `prototipo.html`, um `setInterval` de
           **5000 ms** que, na virada do minuto, faz `save(); render()`, e o
           render faz `sc.innerHTML = h` seguido de `centrarStrip(sc)`
           (linhas 1418-1421, 609, 611 — conferi). **É pior que o plano dizia:**
           o arrasto tem validade de no máximo um minuto, a perda chega num
           instante que o dono não controla, **vale com o cronômetro parado**, e
           o `innerHTML` derruba o **foco** junto. Eu busquei em `src/` — lugar
           errado: a régua só existe no protótipo.
        2. **Os becos: 8 ocorrências, 1 com `disabled`, 7 sem.** A contagem dele
           está certa; a minha primeira contou **linhas** (5) e não ocorrências.
           E `data-a="beco"` não tem ramificação nenhuma no tratador de cliques:
           "Máquina ocupada", "Dor" e "Pular" recebem foco, escalam no toque e
           não fazem nem dizem nada. **É falso sucesso num app cuja doutrina o
           proíbe.** Também: "pular", "deload" e "encerrar" **não estão
           desenhados** — zero ocorrências nos oito HTML.
        3. **`view.fired` é memória, nunca disco** (`main.jsx:326`, resetado em
           739, 949, 4361). Então "corrigir não reinicia o descanso" vale só
           dentro da sessão viva: **reabrir o app e corrigir uma série daquela
           sessão dispara um descanso** para uma série que acabou minutos antes.
           Nenhum dos 20 casos de `cronometro`+`serie` cobra isso.
        4. **`rem` aparece ZERO vezes nas folhas** — conferi as seis, todas 0.
           Então 200% de texto não é "não medido": é **bloqueado, em quatro
           camadas**, e nem o ajuste de texto do sistema alcançaria.
        **Quatro buracos na própria rede**, que ele achou lendo os 38 casos de
        `estilo.test.ts`: seis dos "28 genéricos" estão presos a seletor
        literal; o caso do `svh` não exige `svh`, só que `100vh` não apareça
        sozinho; o da escala de 4 não olha `protocolo.css`; e os dois casos de
        ancestral olham árvores diferentes — **um `overflow: hidden` em `#app`
        mataria o sticky da única saída e nenhum dos 38 pegaria.** Isso corrige
        a leitura otimista que a `08-rede.md` fez dos 28.
        **Achados que ninguém tinha escrito:** a régua do **peso em Corpo** é
        pior que a de repetições (4 de 13 alcançáveis), e erro de dedo lá entra
        na média semanal que decide ±150 kcal; `.cellb`, o alvo de corrigir no
        lugar, tem **~22 px** — o menor da direção e 8 abaixo do pior que a
        auditoria achou, porque **nasceu depois dela**; a folha de pôr em dia
        **não oferece "Não comi"**, que é justamente o que torna o portão de 11
        em 14 alcançável; **o protótipo tem botão de guardar e constrói o
        lote**, contra o requisito; e `finalizarSessao` chama `soltaPromo`, que
        **deixa lápide** — então o descarte silencioso do fecho manual é
        **definitivo**, pior que descarte.
        **Cinco protocolos de medição escritos para o DONO executar**, nenhum
        executado, com o teto de confiança dito em cada um (ex.: zero engolidas
        em 60 tentativas só prova "abaixo de 5%").
      - [ ] **5.b' NOVE DECISÕES NA MESA DELE**, da frente 2: cinco mudanças de
        regra na folha de pôr o dia em dia (o botão "Não comi"; "Não sei"
        valendo o dia com a tela dizendo isso; porção acima de 1 alcançando dia
        passado; a pergunta do "fora do plano" deixando de bloquear; a última
        refeição não vindo pré-marcada por passagem de horário), mais o que
        fazer se a régua reprovar a medição, o lugar do deload e se desligá-lo
        no meio devolve as séries, por quanto tempo o desfazer do vencimento
        segue oferecido, e se o bloqueio de zoom pode ser revisto.
      - **Frente 4 ENTREGUE em 05/10** (`aec1a02379de40dab`),
        `09-frente4-sistema.md`, 2.778 linhas, 13 commits, só em
        `docs/redesign/`. Vinte tokens nos dois temas com dono por token, a
        escala, 23 requisitos numerados e 13 casos de teste novos.
        **O achado que corrige a `08-rede.md` E o que eu disse ao dono:**
        `estilo.test.ts` tem **nove `readFileSync` no escopo do módulo** — a
        lista `FOLHAS` com `.map(readFileSync)` na linha 23, mais `base.css`,
        `index.html`, `main.jsx`, `telacheia.jsx`, `primitivos.jsx`, `palco.css`
        e `palco.js`. Conferi uma por uma. **Então renomear uma folha não dá 10
        vermelhos: derruba a coleta do arquivo inteiro.** Ela mediu numa cópia:
        `Tests  no tests`, **zero de 38 executados**. A contagem "10 acoplados /
        28 genéricos" assumia falha por caso; a realidade é colapso por arquivo,
        e **um arquivo que não coleta só desaparece da contagem** — quem olha
        "nenhuma falha" passa batido. Ela também recontou os amarrados a nome
        concreto: **25, não 10.** Passado ao agente do endurecimento como a peça
        mais importante dele, com a regra de que arquivo faltando tem de
        produzir **vermelho nomeando o arquivo**.
        **Erro meu no briefing, confirmado:** `docs/redesign/04-critica/acesso.md`
        não existe — é `04-acesso.md`, e `04-critica/` não é diretório. Ela achou
        o arquivo sozinha.
        **A razão escrita que sustenta o bloqueio de zoom é FALSA**, e isso é
        decisão do dono com prova nova: `src/base.css:30` diz *"nenhum texto do
        app é menor que 16px"*. Conferi: há `font-size` a 7,5px, 8px, 9px, 9,5px
        e 10px nas folhas — e o `DESIGN.md` escreve piso de 9px, então três ficam
        abaixo do próprio piso. A regra dos 16px vale só para **campo de
        formulário** (`base.css:126`, com razão própria e correta: o Safari dá
        zoom ao focar campo menor). Alguém generalizou a regra do campo para o
        app inteiro, e **é essa generalização falsa que justifica bloquear a
        pinça.**
        **Quatro coisas que estavam mal contadas nos documentos anteriores:**
        os ícones **não são 178** — são **49 desenhos em 1.069 lugares**, e
        **314 desses usos são a barra de status do telefone de mentira, que não
        porta**; a `Procedencia` **já é primitiva** (componente, classe, razão de
        cor medida, 47 chamadas em 12 arquivos), então a pergunta do plano
        ("reconstruir ou perder") estava mal posta — o risco é **perdê-la**; os
        movimentos são **sete, não quatro**, um é CSS morto, e **dois dos quatro
        gestos nomeados não existem como movimento** (o clarão é um `<div>`
        branco estático, o anel é `stroke-dashoffset` fixo); e são **oito**
        classes a exatamente 44px, não sete.
        **Três inegociáveis do projeto caem com a direção e nenhum dos 38 diz
        uma palavra:** raio zero (**511** declarações de raio contra 11),
        mono+display (**zero** `font-family` na direção) e sombra (58 contra 4 —
        e as 4 do app são fio desenhado como sombra).
        **Um defeito de acesso no app de HOJE:** `--ins-border-strong`, a borda
        interativa, mede **1,84:1** em 24 usos, incluindo controles de 46px.
        Reprova hoje, e a auditoria mediu as direções, não o app.
        **Ela resolveu as três coisas difíceis que eu pus na mão dela:**
        `.cellb` cresce para 46,4px por pseudo-elemento, e ela achou que a célula
        já tem **22,8px de folga** porque o `<td>` tem duas linhas; o texto a
        200% recebe **sim para unidade relativa** (tipo em `rem`, geometria em
        `px`, três degraus em Ajustes até 125%) **com a declaração explícita de
        que isso não satisfaz o critério e por quê** — a 200% a régua mostra 2 de
        12 valores; e as duas cascas: fica a do app, com razão medida (19
        `window.scrollTo`, a posição por destino e a trava da folha leem a
        rolagem da janela; com a casca da direção **a trava da folha falha em
        silêncio**, que é o defeito que ela existe para consertar).
        **A medição mais útil dela:** portou o `<style>` do protótipo para dentro
        de `componentes.css` numa cópia e rodou os 38 → **4 vermelhos e três
        verdes que deviam ser vermelhos** (o cronômetro com `transition: width`,
        o `sticky` com `#app{overflow:hidden}`, e raio/sombra sem caso nenhum).
      - [ ] **5.b'' MAIS SEIS DECISÕES, da frente 4**, somando **15** com as nove
        da frente 2: os três inegociáveis caindo; o terceiro sinal passando de
        "destrói dado" para "pare"; a folha subindo ao abrir contra duas
        proibições escritas; o teto de 125% em vez de 200%; se 320px é alvo deste
        produto; e se o bloqueio de pinça pode ser revisto — este último agora
        **com a prova de que a razão escrita dele é falsa.**
      - [x] **A rede endurecida, em 05/10** (`a705b1399ed98e858` + resgate do
        coordenador) → `09-rede-endurecida.md`. **957 passando** (de 954), 53
        arquivos, zero rejeições. Conferi cada etapa.
        **O agente caiu por limite de sessão** (429, reset 19h40) com trabalho
        não commitado. **Resgate:** salvei o diff antes de tocar em nada;
        **devolvi `src/tokens.css`**, que ele tinha minificado como arquivo de
        medição e ia limpar quando caiu — a minificação havia destruído ~100
        linhas de comentário com as razões escritas (o 46px contra 44, a exceção
        do raio da foto, a derivação da coluna de valores, os pisos de área
        segura); e commitei o `estilo.test.ts` dele, que era bom e era
        justamente o conserto que faltava.
        **Os dois defeitos vivos, consertados, os dois com caso nascido
        vermelho:** corrigir uma série depois de reabrir o app disparava
        descanso (a guarda era `view.fired`, memória; passou a vir do rascunho
        em disco, com a série do histórico como segunda fonte); e os dois fechos
        de sessão discordavam — aula de box que fechava sozinha enfileirava os
        movimentos, a encerrada no toque não. Neste, **o caso do fecho
        automático nasceu vermelho e o do toque já estava verde**, que é a
        assimetria medida.
        **Os oito buracos da rede de CSS fechados**, e o maior era o da coleta:
        provei empiricamente que renomear `src/treino.css` agora dá **18
        vermelhos nomeando o arquivo**, onde antes dava `Tests no tests`. O
        remédio errado também ficou fechado — **arquivo vazio reprova igual**,
        porque caso verde sobre nada é pior que vermelho. A lista de folhas
        ficou **declarada e não descoberta**, com a razão escrita: lista
        declarada reprova quando falta arquivo; descoberta fica cega justamente
        quando as regras mudam de lugar.
        **A Parte 3 fiz eu**, porque o agente não chegou: `migracaochave`
        subia 7 apps e chamava `fechar()` zero vezes. Conferi por leitura (e
        está dito assim, não instrumentei): `ligaBatida()` é chamada **sem
        guarda** no boot, então os 7 ligavam intervalo que nada desligava.
        **Não contaminava nada hoje** — o corpo sai na primeira linha sem sessão
        e nenhum dos 7 abre uma —, mas o intervalo é quem chama o fecho
        automático: **bastava alguém semear uma sessão aberta ali** para ele
        fechá-la sozinho no meio da rodada e mudar outro caso. Consertado,
        custou uma linha por teste.
        **Não medido, e registrado:** se o vermelho de 1 em 24 acabou (o nome do
        caso foi perdido e a causa suspeita foi removida antes de se poder
        correlacionar); memória, antes e depois; tempo da suíte; e **o resto da
        suíte quanto a `fechar()`** — só este arquivo foi auditado, pode haver
        outros.
      - [x] **AS QUINZE RESPONDIDAS em 06/10** (folha
        `claude.ai/artifact/Rc4h3591T6UBaf44x31Euy`). Registro literal, por
        grupo. **Estas respostas mandam sobre os documentos das frentes**, que
        foram escritos antes delas.

      **A folha de pôr o dia em dia**
      | | pergunta | resposta |
      |---|---|---|
      | 1 | o quinto botão "Não comi" | **entra** |
      | 2 | "Não sei" vale refeição ou dia | **passa a valer por REFEIÇÃO de verdade** — e isto **custa migração**, ver abaixo |
      | 3 | porção acima de 1 em dia passado | **sim**, os mesmos cinco valores da tela de hoje |
      | 4 | a pergunta do "fora do plano" | **deixa de bloquear**; um toque fecha o dia |
      | 5 | a última refeição pré-marcada | **continua pré-marcada** como as outras |

      **O treino**
      | | pergunta | resposta |
      |---|---|---|
      | 6 | onde mora o deload | **muda** como a frente 1 propôs; a razão escrita no fonte cai |
      | 7 | desligar o deload no meio | **devolve as séries**; o que já foi registrado fica |
      | 8 | até quando o desfazer do vencimento | **até a próxima sessão daquele treino** |

      **A régua, o zoom e o texto grande**
      | | pergunta | resposta |
      |---|---|---|
      | 9 | se a régua reprovar a medição | **vai para os botões fixos da C** — pré-autorizado, mas **a medição ainda tem de acontecer**: é condicional, não ordem de trocar agora |
      | 10 | teto do texto grande | **125%**, e fica escrito que não cumpre 1.4.4 |
      | 11 | o bloqueio de pinça | **mantém.** Nota literal dele: *"nem precisa desse argumento de mao suada. nao quero esses zoom automatico e pronto. nao gosto."* |

      **O sistema visual**
      | | pergunta | resposta |
      |---|---|---|
      | 12 | os três inegociáveis | **os TRÊS caem** (raio zero, mono/display, rótulo mono como estrutura). Nota literal: *"sem herancas"* — caem limpos, sem meia-medida do sistema velho |
      | 13 | o terceiro sinal | **muda para "pare"**; a palavra carrega a diferença de "destrói dado" |
      | 14 | a folha sobe ao abrir | **sobe**; a proibição escrita em dois documentos cai |

      **O alcance**
      | | pergunta | resposta |
      |---|---|---|
      | 15 | 320 px é alvo | **primeiro a medição, depois ele decide** |

      - [ ] **DUAS CONSEQUÊNCIAS DAS RESPOSTAS, que são trabalho novo:**
        1. **A resposta 2 pede migração 11 → 12.** "Não sei" por refeição não
           existe no dado: hoje o que existe é a adesão **do dia** marcada como
           perdida, e `ComoFoiARefeicao` tem dois valores. Virar por refeição é
           **campo persistido novo**, pelos seis portões. Não estava previsto em
           nenhuma frente.
        2. **Os quatro documentos das frentes foram escritos ANTES destas
           respostas** e precisam ser reconciliados com elas antes de virarem
           candidatos a substituir `DESIGN.md`, `MARCA.md` e o contrato. Pelo
           menos: a frente 4 recomendou os três inegociáveis caindo **com
           ressalva** e ele mandou cair sem herança; a frente 2 especificou a
           última refeição **não** vindo pré-marcada e ele decidiu o contrário;
           e a frente 2 deixou o destino da régua aberto.
      - [ ] **A nota da pergunta 11 aponta para outro mecanismo, e vale dizer a
        ele.** O que ele recusa é **zoom automático** — o salto que o Safari dá
        ao focar campo menor que 16px. Isso é impedido pela regra dos 16px no
        campo (`base.css`, razão própria e correta), **não** pelo
        `user-scalable=no`. A decisão dele (manter o bloqueio) fica; mas **o
        comentário falso no fonte tem de ser corrigido** para dizer a razão
        verdadeira, e não "nenhum texto do app é menor que 16px".
      - [~] **As três tarefas marcadas como feitas sem resultado:** Neston,
        ledger do ajuste e a passada da pinça. Marcar feito não traz o número —
        **os três resultados foram pedidos a ele em 06/10.**
      - **Frente 3 ENTREGUE em 06/10** (`ab327d8807b2d792d`),
        `09-frente3-palavras.md`, 2.085 linhas, 14 seções, 7 commits. **Quinta e
        última frente.** Os cinco nomes confirmados; o rótulo mono substituído
        (decisão 12); "falhou" contra "vai destruir" escrito nas duas famílias; a
        folha, a lista que vence, os portões, os sete estados, corrigir no lugar,
        as três saídas e a bioimpedância; e oito frases que nomeiam regra em
        seção separada.
      - **DOIS ERROS MEUS que ela achou, e os dois confirmei:**
        1. **A frente 1 achou SETE afirmações erradas, não cinco.** O §7 dela
           abre com "Sete pontos" e a tabela tem sete linhas. Eu relatei cinco ao
           dono porque repassei o relatório de entrega dela, **não o documento**.
           As outras duas contas batem (frente 2 = seis, frente 4 = nove).
        2. **A frente 1 NÃO propôs o lugar novo do deload — ela recusou
           propor.** Literal: *"Não é decisão minha: é regra, e sobe com os dois
           argumentos escritos."* Quem propôs o menu `···` foi a **Direção D**.
           Eu escrevi "muda de lugar como a frente 1 propôs" no cartão da
           pergunta 6 **e** no briefing da frente 3.
           **E o cartão subestimou o que ele decidia.** A razão escrita em
           `src/ui/telas/guia.jsx` é: *"um interruptor que corta metade das
           séries não deve estar a um toque no meio de uma sessão. O app existe
           em parte para frear, e o caminho de menor esforço tem que ser o
           conservador."* **O lugar ERA o freio.** Levado de volta a ele em
           06/10, com a mitigação que a frente 3 escreveu: o item do menu deixa
           de ser interruptor com nome e passa a dizer o corte em número antes do
           toque — *"Deload hoje · corta 20 séries para 10, nas mesmas cargas"* —,
           o que põe o freio na palavra, já que ele saiu do lugar.
      - [ ] **O NOME DA MEDIDA DA BIOIMPEDÂNCIA, e é urgente porque já está no
        código.** Ele disse **"massa magra"** em 14.11 e **"massa muscular
        esquelética"** em P3 (`00-coordenacao.md:482` e `:638`). **São dois
        números diferentes na mesma balança**, não sinônimos: massa magra é tudo
        que não é gordura (osso, água, órgãos); massa muscular esquelética é só o
        músculo. A migração 10 seguiu o P3, que é a resposta mais recente e mais
        específica: `MEDIDAS_DO_CORPO` tem `bioMusculo` = *'massa muscular
        esquelética'* (`src/dominio/corpo.ts:46`, conferi). **Se ele quis massa
        magra, o campo está errado agora** — e, como a tela vai pedir o número
        pelo nome, a série fica errada para sempre. Barato hoje, caro depois.
      - **Resolvido por implicação, não vai à mesa dele:** a decisão 5 derrubou
        também a segunda metade do requisito da frente 2 — *"a refeição cuja hora
        passou há menos de 30 minutos fica sem marca"* (`09-frente2-interacao.md`
        linha 807, conferi), que ninguém tinha nomeado. Se a passagem de horário
        pré-marca, pré-marca. A frente 3 escreveu palavras que valem nos dois
        casos porque nomeiam a **causa** da marca: *"A ceia vem marcada porque
        passou das 21h30, não porque o app sabe."*
      - [ ] **5.b''' QUATRO da frente 3 na mesa dele**, duas nascidas das
        respostas de 06/10:
        1. **Qual é a adesão de um dia com uma refeição em "não sei".** A decisão
           2 moveu "Não sei" para a refeição e **não disse o que isso faz com o
           dia**. Peso 0 subestima; peso 1 **infla** — e inflar adesão é o
           mecanismo exato do corte errado do F292. As duas versões estão
           escritas; vale a B enquanto ele não disser, porque é o que o app já
           faz.
        2. **Para que lado o silêncio cai na pergunta do "fora do plano".** A
           decisão 4 tirou o bloqueio, e a ausência de resposta hoje cai no lado
           que **infla**. Com o bloqueio, a pergunta nunca ficava sem resposta.
        3. **Se "Evolução" volta.** A partição em Corpo e Semana apagou a palavra
           dele do produto: 12 ocorrências na primeira rodada, **zero** nas sete
           telas da segunda. Proposta: volta como nome do destino de leitura em
           Corpo, no lugar de "Histórico".
        4. **Se a promessa "a tela não vai pedir isso de novo em outro lugar" é
           cumprível.**
      - **Ela contraria quatro regras de voz, todas reunidas com a razão** — e a
        primeira é consequência direta da decisão 13: *"Isso não tem volta"*
        fica, e **passa de redundância a canal**, agora que a cor não diz mais
        "destrói dado". Também: conferiu os 23 `confirm()` do app e achou que
        **só nove destroem dado que o aparelho não reconstrói** — pintar os 23 de
        "pare" mataria o painel.
      - **Correção a uma régua minha:** a recusa de linguagem metafórica pelo
        dono **não existe como proibição escrita**; o que existe é o pedido dele
        de 02/10, registrado, de traduzir o vocabulário dos designers para o que
        acontece na tela. Vale como régua deste projeto, **não** como argumento
        contra outra pessoa. Eu a citei como proibição em três briefings.

      ## As oito de 06/10 (noite) — e três delas ele delegou a mim

      | | pergunta | resposta |
      |---|---|---|
      | 1 | massa magra ou muscular esquelética | **massa muscular esquelética** — é o que a migração 10 já gravou, nada a mudar |
      | 2 | o deload muda de lugar | **mantém**, agora sabendo que o lugar era o freio |
      | 3 | a adesão de um dia com "não sei" | **delegada a mim**, literal: *"faça com achar mais adequado. nao quero mais qlqr pergunta sobre isso. decida sozinho se alguma coisa aparecer"* |
      | 4 | para que lado cai o silêncio do "fora do plano" | **mesma resposta da 3** |
      | 5 | "Evolução" volta | **aceita a proposta**: volta como nome do destino de leitura em Corpo, no lugar de "Histórico" |
      | 6 | o ledger do ajuste | **recalculam** |
      | 7 | o zoom funcionou no app instalado | **sim** |
      | 8 | 320 px é alvo | **delegada a mim**, "seguindo o contexto" |

      **AUTORIZAÇÃO PERMANENTE sobre a 3 e a 4:** ele não quer mais nenhuma
      pergunta sobre a aritmética da adesão. Frente nenhuma deve levar isso de
      volta à mesa dele. Decido eu, e registro aqui.

      ### O que eu decidi na 3 e na 4, e com que razão

      **3 · "Não sei" por refeição pesa ZERO na adesão do dia, e NÃO sai do
      denominador.** A razão é do próprio projeto, escrita em dois lugares:
      `diasInterpretaveis` diz *"o denominador é a janela, não os dias
      registrados — senão uma semana com dois dias registrados daria 100%"*, e
      a mesma lógica vale dentro do dia; e a regra de que **o caminho de menor
      esforço tem de ser o conservador**. Subestimar **segura** o corte;
      inflar **autoriza** um corte que não devia acontecer, que é o mecanismo do
      F292. O mecanismo já existe: `pesoDaRefeicao` devolve 0 para
      `como[id] === 'nao'`, e "não sei" entra como um terceiro valor de `como`
      com o mesmo peso.
      **O dia continua interpretável**, porque `diaInterpretavel` só exige uma
      marca qualquer — a incerteza aparece no número baixo, conservadoramente, em
      vez de tirar o dia da conta. **Nenhum limiar novo inventado.**
      **E "não sei" fica distinguível de silêncio no registro:** silêncio não
      entra em `done` e dá `null` no dia inteiro ("ausência de registro não é
      aderência zero", está escrito); "não sei" é marca explícita que pesa 0.
      Mesmo número, registros diferentes — que é o certo.

      **4 · Nada muda na aritmética, e conferi por quê.** `aderencia` tem três
      valores (`'plano' | 'fora' | 'perdido'`) e **a única leitura lógica em todo
      o domínio é `=== 'perdido'`** (`calculo.ts:689`). "Plano" contra "fora"
      **não alimenta cálculo nenhum** hoje: é registro para ele ler. Então tirar
      o bloqueio não infla conta — ele torna o **registro** menos completo, e
      esse é o preço que ele escolheu pagar por fechar o dia num toque.
      **O que fica anotado como armadilha:** se algum dia "fora" passar a
      alimentar cálculo, **o ausente não pode cair em "plano"**. Quem mexer nisso
      lê este parágrafo primeiro.

      ### 8 · 320 px: o alvo é 414, e 320 fica declarado fora

      Contexto que usei: o aparelho dele tem **414 px**; o segundo usuário **não
      existe no dado**; e a frente 3 mediu que o nome **"Prescrição" já transborda
      a fatia da aba a 320 px, a 100% de texto** — atender 320 obrigaria a
      renomear um dos cinco lugares por um usuário que ainda não existe.
      **Decisão: 414 é o alvo. 320 não é.** Mas a invariante barata fica, e ela
      é o que impede o estrago: **nada pode ter largura fixa maior que a tela, e
      a página nunca rola na horizontal** — a rede já testa isso e custa zero.
      Se um segundo usuário chegar num telefone pequeno, a lista do que quebra já
      está escrita (medição G) e o custo é conhecido. **Declarado, não
      esquecido.**

      ### 6 · "Recalculam" já é automático — e revela o que importa de verdade

      Conferi a forma do ledger: `PassoDeAjuste` guarda `de` e `para` **em
      passos**, não em kcal absoluto (`src/dominio/tipos.ts`). O alvo efetivo é
      o alvo do plano **mais** o saldo de passos. Então o alvo novo já entra
      embaixo dos passos existentes, sem reescrever byte nenhum: a resposta dele
      está satisfeita pelo desenho que já existe. **Nada a construir.**
      **Mas a consequência de verdade é outra, e é dele com o nutricionista:**
      a ceia é comida que ele **já comia** e que o plano **não contava** — o
      plano dizia, textualmente, "Sem ceia obrigatória". Então o alvo subestimava
      a ingestão real em ~197 kcal, e **todos os cortes do ledger foram decididos
      contra um déficit ~197 kcal mais raso do que se acreditava.** Não é bug de
      código: é o plano ficando honesto. Levado a ele em 06/10.

      ### 7 · O zoom funciona no app instalado — então o bloqueio é decoração

      Ele mediu: **a pinça funciona.** Então `user-scalable=no` **não é honrado**
      no PWA instalado, que é como ele usa o app. O comentário em `src/base.css`
      estava errado **duas vezes**: a afirmação de que nenhum texto é menor que
      16px é falsa (há texto a 7,5px), e o bloqueio que ele justifica não bloqueia
      nada ali.
      **A decisão 11 dele (manter) fica** — tirar a meta tag é mudança que ele não
      pediu, e ela ainda vale no Safari fora da tela cheia. **O que muda é o
      comentário**, que passa a dizer a verdade. E o que de fato impede o "zoom
      automático" que ele recusa é a **regra dos 16px no campo**, que é real,
      funciona e tem razão própria escrita.

      ### Implementado em 06/10 (`a7432639ad8690062`) — e o estado honesto disto

      `6e8a3fa`, `d625147`, `31bca12`. **965 passando** (de 957; oito casos
      novos, nenhum saiu), 53 arquivos, zero rejeições, `tsc` limpo. Conferi a
      suíte e a divisão por conta própria.

      `ComoFoiARefeicao` ganhou **`'nsei'`** — peso 0, **dentro** do
      denominador, como eu decidi. E ele fez melhor que o pedido: a condição de
      peso zero saiu de quatro pontos à mão para **uma função só**
      (`semCumprimento`), porque bastava um esquecimento num deles para "não
      sei" voltar a contar como cumprido — ou seja, inflar adesão, que é o
      defeito que a decisão existe para evitar.

      **O achado dele, e é bom:** `totalRegistrado` tira do total quem tem
      `'nao'`, porque **zero conhecido é zero**. Mas `'nsei'` **fica**, com os
      números do plano — tirá-la faria o total afirmar **zero kcal** sobre uma
      refeição que ele não sabe descrever, que é a única das três coisas que se
      sabe **falsa**. Então `semCumprimento` existe e de propósito **não** é
      chamado ali, com a razão escrita na função, para ninguém "consertar" pela
      simetria depois.

      **Nenhuma migração, conferido portão por portão:** `como` já é campo
      persistido opcional desde a 9→10; **valor novo não é campo novo**. A fusão
      é `if (como)`, agnóstica ao valor, com a lápide da marca. As listas brancas
      são por chave de topo. `PLANO_ATUAL` fica em **11**. E ele nomeou a
      migração que seria **errada**: converter o `'perdido'` do dia em `'nsei'`
      por refeição afirmaria **quais** refeições ele não soube — o que o próprio
      `migracoes.ts` proíbe.

      - [ ] **O ESTADO HONESTO, e é o achado que mais importa:** **nenhum
        chamador de `marcaRefeicao` passa `como`, em valor nenhum** — conferi os
        dois (`src/ui/folhas/refeicao.jsx` e `src/ui/telas/hoje.jsx`), e os dois
        chamam com um argumento só. Então os três valores de `como` — `'fora'`,
        `'nao'` e `'nsei'` — são **capacidade de domínio sem lugar onde morar**:
        alcançáveis por `poeComidaNoDia` e pela fusão, **inalcançáveis pelo
        dedo**. É exatamente a espécie de coisa que a frente 1 catalogou.
        **Consequência para o dono:** o botão "Não comi" que ele aprovou e o
        "Não sei" por refeição estão **no dado e não na tela**. Construir a folha
        dos cinco botões é a frente 2 virando código, e isso ainda não começou.
        Está na ordem certa (modelo antes de tela), mas ele precisa saber que
        tocar nesses botões ainda não existe.

      **Três afirmações minhas que ele desmentiu, as três conferidas:**
      1. **"três ficam abaixo do piso de 9px" → são DOIS** (7,5px e 8px). O piso
         é "nunca abaixo de 9px", então 9 e 9,5 estão **dentro**. E a minha lista
         (7,5 · 8 · 9 · 9,5 · 10) era **parcial**: medido, são **28 declarações
         de `font-size` nas cinco folhas, 22 abaixo de 16px, a menor 7,5px** no
         eixo da sparkline. O ponto para o dono fica **mais** forte, não menos.
      2. **A divisão da linha de base: 520 fluxo / 445 domínio**, não 517/440.
         O 517 saiu da **seção 4 do `09-rede-endurecida.md`, que eu escrevi
         errada**, e de lá se propagou para os briefings. Corrigido na fonte
         (`601159e`).
      3. O rótulo "Não sei" ele tirou da frente 3 (§4.2 e §4.5, **versão A** — a
         que a minha decisão escolheu). Não inventou palavra.

      **Apontado e não resolvido, de propósito:** o `DESIGN.md` declara exceções
      citadas por fonte **só para a escala de espaço**; **7,5px e 8px furam o
      piso de tipo sem exceção declarada**, e o caso de escala do `estilo.test.ts`
      lê `padding`, `margin` e `gap`, **não `font-size`**. É decisão de design,
      não de rede.

      ## A entrega (c) da frente 0, finalmente feita — 07/10

      `a92468afbe40e8694` → `docs/redesign/09-superficie.md`, 556 linhas, **95
      commits**. Era a peça em que todo o argumento de reescrita reversível se
      apoia, e o documento da própria frente 0 dizia que ela "não é esta".
      **Conferi:** `npm test` → **965 passando** (520 fluxo + 445 domínio), 53
      arquivos, zero rejeições, árvore limpa.

      **A superfície existe:** `window.__modelo` (`src/main.jsx:5016`), com
      `contrato: 1`, **147 verbos**, **23 leituras** (todas `get`, porque `S`,
      `view` e `CAT` são religados em tempo de execução) e três portas de
      travessia de realm. O contrato está escrito no fonte: nenhuma chave recebe
      nem devolve elemento do DOM (duas exceções declaradas), chamar um verbo faz
      o que o dedo faz, acrescentar chave é livre e tirar ou renomear não é, e **a
      superfície não escreve no estado**.

      **A reponta, medida por mim:** **1931 → 396** entradas pela ponte de `eval`
      (contando `a.E` e `a.J`), **queda de 80%** — 1.535 casos passaram a entrar
      por nome e valor. Um commit por arquivo. **Cinco arquivos saíram
      inteiramente da ponte:** `cardio`, `leitura`, `migracaochave`, `navegacao`,
      `publicacao`. Nenhum nome de caso mudou, nenhuma asserção mudou.
      **As cinco assinaturas de maior alavanca entraram com os testes
      intocados:** `inp` → `anotaSerie(i,k,pos,valor)`, mais
      `criarExercicioCom`, `guardaEdicaoCom`, `textoDaPrescricao` e
      `setBuscaDeExercicio`. Seis das sete funções que recebiam elemento têm par
      por valor; `importFile` ficou de fora com razão escrita (o que ela
      acrescenta é `FileReader`, que é plataforma e não modelo).

      **O treeshake virou medida, não suposição.** No commit das assinaturas,
      `anotaHoraAvulsa` — a única que nenhuma casca chamava — **saiu do bundle**
      (`grep -c` → 0); no commit seguinte, que só a nomeia dentro da tabela,
      **voltou** (→ 1). É por isso que a tabela alcança as funções por
      **referência**. Era o buraco que já tinha enganado um agente aqui.

      **A falha que vale mais que o conserto, e ela é o modo de falha inteiro da
      ponte num exemplo:** `a.E('abrirPrograma(' + (d ? JSON.stringify(d) :
      'null') + ')')`. O `'null'` ali é **texto de código**, não valor. A reponta
      mecânica passou a string `"null"` e dois casos de `telaprograma` caíram na
      hora. **Quando o argumento é fonte, "o valor" e "a fonte do valor" se
      confundem e nada avisa.** Por valor, `null` é `null`.

      **A correção que AUMENTA o argumento da rede:** eu escrevi, e a `08-rede.md`
      supõe, que a ponte alcança "as 335 funções de módulo de `main.jsx`".
      **Ela alcança o escopo de topo do BUNDLE inteiro, atravessando arquivo.**
      Prova dele, que eu confirmei: um caso de `fotos.test.js` chamava
      `migraCache()` pelo nome nu, e `migraCache` mora em `src/infra/fotos.js` —
      há agora um comentário em `src/main.jsx:4870` dizendo isso com estas
      palavras. **A superfície ingovernada era maior e menos governada do que o
      inventário dizia**, e o caso passou a entrar por `a.v('migraCache')`.

      **Oito afirmações minhas corrigidas**, todas de contagem e todas para mais:
      `CTX` tem **181** chaves e não 180; **93** sem chamador de teste e não 98;
      **129** funções pelo nome nu e não 128; **111** usos de `a.preencher` e não
      110. As de forma conferiram: as sete funções que recebem elemento, os seis
      campos de `criarExercicio` (com `#nxk` por `.checked`) e os onze `useState`.

      - [ ] **O que falta da reponta**, com tabela por arquivo no §3 do documento
        dele: **396 entradas**, em quatro categorias — **103** escrevem em
        `S`/`view` (fora do contrato, por desenho); **61** alcançam o DOM de
        dentro do `a.E` e esperam as telas novas; **168** são expressão composta,
        repontáveis mas pedindo remontar a expressão em JS; **62** são sobra
        simples de conserto curto.
      - [ ] **E o lance mais barato que sobrou:** ele **não escreveu um só teste
        novo**, de propósito. As **93 chaves de `CTX` sem teste próprio** agora
        estão **alcançáveis e nomeadas** — o documento as lista por assunto. São
        as mais baratas de blindar, porque o verbo já existe e o teste novo só
        precisa chamá-lo em vez de clicar.
        **FEITO EM PARTE, 08/10** (`a1909741be5fb3c68`), §8 do
        `09-superficie.md`. **38 das 93** ganharam caso, em 37 casos novos, cinco
        commits por assunto. **Conferi:** `npm test` → **1.002 passando** (557
        fluxo + 445 domínio), 53 arquivos, zero rejeições, e
        `git diff -- src/` **vazio** — nenhuma linha de fonte tocada, nenhum caso
        existente alterado. Dois assuntos fecharam inteiros: corpo/medidas/cardio
        e custódia/nuvem.
        **A prova de vermelho foi cumprida:** 39 quebras deliberadas no `src/`, e
        cada um dos 37 casos ficou vermelho em ao menos uma. Ele **jogou uma
        asserção fora por não saber ficar vermelha** e escreveu por quê — era
        `assert.strictEqual(vm.senha, undefined)`, que passava com a senha ainda
        guardada porque a chave nem existe quando logado.
        **O achado que justifica a tarefa inteira:** ele alargou `apagarSessao`
        para apagar **todas** as séries daquele `sid` em vez de uma linha, e
        `telas.test.js` — que é a guarda única de "correção de sessão passada
        altera e apaga" — passou **39 de 39**. **A suíte de hoje não vê um
        apagamento que cresceu do exercício para o treino inteiro.** O caso novo
        é a única coisa que pega.
        **E o limite, dito e não glosado:** os 37 cobrem **o modelo, não a
        fiação**. Se o redesenho esquecer de ligar o botão, os 37 seguem verdes e
        a capacidade fica inalcançável pelo dedo. Dois casos (`salvaEdicao`,
        `editDor`) dependem do DOM **por culpa do verbo**, que relê a tela por
        dentro.
      - [ ] **DEFEITO (a) PARA O DONO DECIDIR — a bioimpedância não tem torneira.**
        Conferi: **zero das 181 chaves de `CTX` mencionam bioimpedância**
        (`grep -coE "CTX\.[a-zA-Z]*[Bb]io"` → 0). Não existe `registraBio*`,
        não existe setter de rascunho, e `CORPO_PADRAO` não tem valor de partida
        para as cinco. **Enquanto isso a tubulação inteira existe:**
        `MEDIDAS_DO_CORPO` declara as sete, a migração 9→10 criou as chaves, a
        lista branca as preserva e a fusão tem lápide para cada uma. **Toda a
        tubulação e nenhuma torneira.** O caso está escrito e **ficou verde**
        (grava a recusa); dar partida às cinco o derruba.
        Minha recomendação, quando ele decidir: **um verbo de modelo**
        (`registraBio(qual, valor)`), não um valor em `CORPO_PADRAO` — um padrão
        de `bioGorduraPct: 18` seria o app **inventando leitura de balança**. O
        verbo torna a capacidade alcançável e testável sem desenhar tela, que é a
        ordem do plano (modelo antes de tela).
      - [ ] **DEFEITO (b), e eu confirmei o mecanismo no fonte: apagar o
        histórico leva as LÁPIDES, e o outro aparelho ressuscita o que foi
        apagado.** `wipe()` reconstrói `S` de um literal com lista de chaves
        preservadas, e **`apagados` não está na lista** (nem `aulas`, nem
        `protocolo`, nem `fotos`). O comentário logo abaixo prova que o autor
        conhecia a classe do problema **na outra porta**: *"A velha vai junto.
        Deixá-la seria a migração do boot ressuscitar amanhã exatamente o
        histórico que ele acabou de mandar apagar."* **Guarda numa porta,
        faltando na outra:** apaga no celular, sincroniza com o notebook, e o
        histórico volta — porque sem lápide a fusão lê os registros do outro lado
        como registros que este aparelho simplesmente não tem.
        **E o conserto NÃO é só preservar `apagados`:** o `wipe` esvazia as
        coleções em bloco sem escrever lápide por registro, então guardar as
        lápides antigas não basta. O conserto é **o apagamento passar a ser
        representável para a fusão** — e isso é decisão de desenho de dado, não
        linha de código. Vai à mesa dele.
        Mais: `protocolo` e `fotos` fora da lista **orfanam bytes de foto** sem
        podar cache nem bucket, e `aulas` some enquanto `S.ex` sobrevive.
      - **Sete correções dele, e duas mudam o mapa:** as cinco grandezas da
        bioimpedância **não são chaves de `CTX`** e nunca estiveram entre as 93;
        **`a.v` não alcança as sete tabelas de ação** porque `chama` parte o nome
        no primeiro ponto, então os 64 nomes dentro delas só entram por
        `a.m.ctx` — conserto de poucas linhas que **não** precisa subir o
        contrato. Mais: são **91** sem chamador nenhum e não 92 (o harness aciona
        `vaiPara` e `desliga`); `setNotaDaSessao` está no assunto errado (é foto
        de corpo, não sessão de treino); `folhas` é a quarta que **não deve**
        ganhar rede, porque devolve VNode e o contrato proíbe devolver elemento.
      - **Flake pré-existente que ele viu e não mexeu, e vale registrar:** a
        **primeira** execução dele deu **964/1** — `navegacao` :: *a folha entra
        em foco* falhou no `activeElement`, com nada tocado. O arquivo sozinho
        passa 9/9 e todas as execuções seguintes deram 965. **É corrida de foco
        sob carga**, e é da mesma família do vermelho de 1 em 24 que eu persegui
        e não consegui nomear. Agora tem nome.
      - [ ] **Ficaram 55, das quais 51 são trabalho real** (quatro não devem
        ganhar rede). Por assunto, com casa indicada na §8.8: **comida e plano
        16** — e é por aqui que eu seguiria, porque `removeItem` e `trocaItem`
        são **destrutivos** e são a prioridade 1 ainda não paga; **câmera e foto
        17**; **rota e shell 12**; **promoção e retroativo 6**.
      - **Frente 1** (`a37eebea5e0f5982d`) → `09-frente1-lugares.md`. Os cinco
        lugares e o que cada um possui, conferidos **contra a seção 1 da rede** —
        capacidade de hoje sem lugar onde morar é o achado mais valioso que ele
        pode trazer; a sessão como modo com saída própria, encaixada no
        `src/ui/navegacao.js` que já está pronto e testado; a precedência do
        cartão de cima; e onde aterrissam as três peças da C, com o §3.6 do
        plano na mão por causa da ordem amarrada.
        Só escreve em `docs/redesign/`, para não colidir com a frente 0.
        **ENTREGUE em 05/10** (`a72f1fa` → `378cf6e`, 8 commits, só no arquivo
        dela — conferi commit a commit). `09-frente1-lugares.md`, nove seções.
        **Cinco afirmações minhas não bateram com o código, e eu confirmei as
        cinco uma por uma** antes de aceitar; as retificações estão no
        `07-plano.md` no ponto afetado, e a do cardio no `08-rede.md`:
        (1) a exceção das linhas do dia durante o treino **não existe** —
        `ehLinhaDeTreino` é tipo de linha, não sessão ativa, então P4 respondeu
        a um estado inexistente e a peça 1 custa zero no Agora;
        (2) a conta de volume alimenta **três** telas por `impacto()`, e a tela
        que a D1 remove usa **`impactoDoMod`**, que está em `src/main.jsx` e não
        em `volume.ts` — é a única que produz "antes → depois", só a ramificação
        `troca` tem teste, e por isso a peça 3 **não é render**;
        (3) `promoPendente` guarda **uma** mudança e **não tem regra de fusão** —
        quinto campo persistido, passado à frente 0;
        (4) no fecho **manual** não existe carregador nenhum, com a razão escrita
        no fonte — tirada a pergunta, a mudança é descartada em silêncio;
        (5) o placar do cardio está na aba TREINO, não em HOJE.
        **Nove achados de capacidade sem lugar**, e os três primeiros importam:
        o cartão do exercício fora da sessão não tem lugar em nenhum dos cinco e
        leva quatro capacidades consigo (histórico com correção de série antiga,
        renome, correção do tipo de carga, troca com histórico do substituto —
        `openHist` tem **um único chamador** em todo o `src/`); as **catorze
        regras de execução do treinador** (`RULES` em `src/dominio/programa.ts`)
        não têm lugar em nenhuma das duas direções nem no §4 do plano; e **Dias
        é o único dos cinco lugares sem desenho**, sendo o que recebe mais
        capacidade pronta.
        **Duas propostas que voltam à mesa dele:** a regra do palpite que vira
        buraco (o §1.2 do plano mandou esta frente propor), resolvida por três
        atos que o app já reconhece e sem carimbo novo; e o deload, que muda de
        lugar contra uma razão escrita no fonte.
        Também: a decisão de cinco campos de bioimpedância com quatro
        obrigatórios **derruba a recusa 4 da D** ("recuso campo obrigatório") —
        a decisão manda.
      - **Nota de processo:** a frente 0 commitou com `git add -A` e varreu o
        arquivo da frente 1 no `2a634b5` (nada perdido). Avisada, com a lista
        dos arquivos dela. Ela também entrou em `tests/fluxo/fusao.test.js`,
        fora do escopo que eu dei, mas a mudança é consequência correta de
        `done` virar instante e preserva o que o teste protege — eu teria
        autorizado.
- [x] 5.d A rede do D13 antes de qualquer reescrita → disparada em 05/10
      (`a0889f72cb2470c26`), entrega `08-rede.md`. Cinco seções: uma linha por
      arquivo em linguagem de capacidade (os nove nomes de `promocao.test.js`
      como régua); a classificação que decide o custo — quantos casos entram por
      verbo do modelo, e portanto podem ser repontados com a interface de hoje
      de pé, contra quantos dependem da tela; **o ponto único de falha**, que é
      a seção mais importante; o vão entre fluxo e domínio; e quais capacidades
      **não têm verbo no `CTX`**, porque são essas que obrigam a entrar pela
      tela e viram o trabalho de verdade.
      Mandado conferir por conta própria o número de 203 que o curador mediu.
      **Entregue em 05/10** (`1624952`), 672 linhas. Conferi por conta própria,
      antes de aceitar: 514 casos de fluxo, 372 de domínio, 38 em
      `estilo.test.ts`, 180 chaves de `CTX` (19 + 161), `inp(el, i, k, pos)`
      recebendo o elemento, `criarExercicio` lendo os seis campos, 110
      `a.preencher`, `apagaMedida` nunca chamado por nome com o teste clicando
      em `.crow-x`, `setDeload` pelo nome nu. Tudo confere.
      **Três correções que ele trouxe e que o plano herdava erradas:**
      (1) são **514** e não 513 — `6035a5c` acrescentou um caso;
      (2) são **220** sem tela e não 203 — ele mediu em execução, com os
      ajudantes do harness instrumentados, e achou dez casos que tocavam a tela
      sem marcador textual; rodando só o filtro textual ele mesmo obteve 230,
      então a execução corrige nos dois sentidos e o 203 carrega o erro oposto;
      (3) **38 dos 372 de domínio não sobrevivem inteiros** — `estilo.test.ts`
      lê as cinco folhas de CSS por nome, e 10 dos 38 citam classe, token ou
      hexadecimal concreto. Os outros 28 são a especificação mobile do produto
      em forma executável (`svh`, escala de 4, campo nunca abaixo de 16px,
      nenhum ancestral do `sticky` virando scroll container) e valem **antes**
      da primeira linha de CSS novo, não depois.
      **O ponto único de falha: 103 casos, 20% da suíte** — 66 dos 193 nomes de
      verbo são acionados por um caso só. Quatro arquivos são guarda única de
      uma área inteira: `cronometro` (wake lock, AudioContext, bipe, vibração),
      `navegacao` (History API), `publicacao` (service worker, manifesto,
      `vercel.json`), `migracaochave` (a chave legada).
      **As capacidades sem verbo**, que são o trabalho de verdade: sete funções
      que recebem o elemento e não o valor — a pior é `inp(el, i, k, pos)`,
      **registrar uma série**, a interação mais frequente do produto, sem porta
      por valor —, quatro verbos que leem os argumentos da tela
      (`criarExercicio`, `guardaCamposEdicao`, `atualizaPrescricao`, `buscaEx`),
      onze `useState` fora do alcance do `__escopo`, e 27 casos que tocam a tela
      sem chamar verbo nenhum. As 98 chaves de `CTX` que nenhum teste chama
      **não** estão sem teste: são as que a interface chama no clique, e são as
      mais baratas de blindar, porque o verbo já existe.

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

Disparado em 02/10, depois de fechada a onda 3.

> Você é **R · o Curador**, a última função do time que desenhou este produto outra vez, do zero.
>
> **Leia primeiro, inteiro: `docs/redesign/00-briefing.md`.** Ele manda mais que este prompt — em especial o §4 (o seu mandato) e o §7 (a régua).
>
> **Você é a única função, além do escriba, que vê os dois mundos.** Ao contrário de todo o resto do time, você PODE e DEVE ler o app que existe hoje: `DESIGN.md`, `MARCA.md`, `PRODUCT.md`, `README.md`, `docs/LASTRO_UX_CONTRACT.md`, `docs/design-review/**`, `docs/ux-audit/**`, `src/**`, `index.html`, `tests/**`. Você precisa deles para a única coisa que ninguém mais pode fazer: medir o quanto cada direção é de fato diferente do que existe, e dizer o que o app de hoje faz bem que cada uma perderia.
>
> **O que você lê do time:**
> - `docs/redesign/01-fatos.md` e `01-fatos-cortes.md` — os 300 fatos, e o que o escriba reconheceu como decisão de forma e removeu
> - `docs/redesign/02-perguntas.md` e `02-uso.md` — as respostas do dono (P…) e o uso medido (U, K, D, M…)
> - `docs/redesign/03-direcao-C/` e `03-direcao-D/` — as duas sobreviventes, com `direcao.md` e os dois HTML. **Abra os HTML**
> - `docs/redesign/04-critica.md`, `04-viabilidade.md`, `04-acesso.md`, `04-voz.md` — o cerco inteiro
>
> **O peso da convergência, e por que ele é real aqui.** Os quatro do cerco trabalharam cegos entre si e cegos ao app atual: nenhum leu o arquivo do outro, e nenhum sabia o que o outro ia medir. Então, quando dois ou mais chegam ao mesmo achado por caminhos diferentes, isso é convergência de verdade e pesa muito. Diga quando acontecer — e diga também quando um achado é de um só, porque aí ele vale pela prova que traz, não pelo número de vozes.
>
> **Onde a decisão está.** O dono abriu os quatro desenhos e escolheu **C e D**; A e B saíram. Não as ressuscite.
>
> **Três exigências entraram como dadas, não como opinião de designer:**
> - **E1** — a decisão de tornar permanente uma mudança do dia aparece **ao encerrar o treino**, mais um atalho discreto na tela do dia. É desenho do próprio dono.
> - **E2** — peso, medidas e fotos têm **lugar próprio**.
> - **E3** — o que passou sem registro **aparece marcado**.
>
> **Duas medições foram pedidas com número, e o cerco as devolveu:** M-a (quanto custa contornar quando a D abre na coisa errada) e M-b (registrar ontem na C). Leia o que cada agente achou e diga o que você confere.
>
> **Seu mandato: montar a mesa de decisão do dono.** Você não decide, não desenha e não inventa. Você lê tudo, confere o que dá para conferir, e entrega o material com que ele escolhe.
>
> **Entrega:** `docs/redesign/06-parecer.md`, em português, com:
>
> 1. **As duas direções lado a lado** — a tese de cada uma, o que ela custa, e o que ela pede ao dono.
> 2. **O quanto cada uma é de fato diferente do app de hoje.** A medida é sua, porque só você pode comparar. Se uma direção chegou, cega, a algo parecido com o que já existe, isso é informação valiosa e tem que estar escrito, não escondido.
> 3. **O que o app de hoje faz bem e cada direção perderia** — nominalmente, item por item.
> 4. **O que ficou provado, o que é hipótese e o que é gosto.** Separe os três. Um número medido por um agente é prova; uma previsão sobre o que o usuário vai sentir é hipótese; preferência é gosto, e gosto é do dono.
> 5. **As decisões que são dele, numeradas**, cada uma com o que a prova diz e o que muda conforme a resposta. Inclua as perguntas que cada direção deixou em aberto e as que o cerco levantou.
> 6. **O estado das três exigências depois do cerco** — o que cada uma custa nas duas direções, com o que os quatro mediram.
>
> **O que você NÃO faz.** Não cria uma quinta direção. Não funde C com D. Não escolhe campeã, nem por omissão, nem por entusiasmo. Se você achar que a resposta é uma mistura das duas, escreva isso **como pergunta ao dono**, com o que se ganha e o que se perde — nunca como proposta pronta. E não poupe o dono do que é dele.
>
> **Regras de prova.** Separe o que você conferiu no código e nos arquivos do que está repetindo de um agente do cerco. Número de agente que você não conferiu vai marcado como dele. Onde não houver medida, escreva "não medido".
>
> Não altere nada fora do seu arquivo de entrega. Ao terminar, devolva um relatório curto: as decisões numeradas, o quanto cada direção é diferente do app de hoje, e o que o cerco provou contra o que ficou como hipótese.

## Anexo G · Segunda rodada de desenho (C e D), 04/10

Corpo idêntico para os dois, com a letra da pasta na última linha. Nasceu da
resposta do dono ao laço da parada 3: ele quis ver desenhado antes de escolher,
e as duas desenham.

Decisões de transcrição, registradas:
- **o cerco NÃO vai para eles.** Os quatro relatórios são cegos ao app atual,
  mas contêm o desenho do outro designer, e a independência entre C e D é o que
  torna a comparação válida. Os defeitos medidos serão consertados no
  detalhamento, depois da escolha — não nesta rodada;
- as decisões do dono entram como requisito, sem dizer quem as propôs e sem
  citar regra nenhuma do app atual (a de movimento foi reescrita como permissão,
  não como mudança de doutrina);
- o vencimento da mudança do dia vai como **pergunta deles ao dono**, com o
  defeito nomeado sem fonte — é o conflito 3 da P3.d.

```text
Você é um designer de produto sênior, contratado para propor como um aplicativo poderia ser se nunca tivesse sido desenhado. O app existe, mas você não sabe como ele é, e o processo depende de que continue assim. Quem sabe é o coordenador, e ele não vai lhe contar nem comentar o seu trabalho.

Outro designer recebe esta mesma mensagem, palavra por palavra, e trabalha ao mesmo tempo que você, sobre outra direção. Vocês não veem o trabalho um do outro.

O QUE JÁ ACONTECEU. Uma direção inteira já foi desenhada e entregue na sua pasta: `direcao.md`, `momento-1.html` e `momento-2.html`. Ela é sua — releia antes de começar, e continue nela. O dono abriu os desenhos, manteve duas direções de pé e **ainda não escolheu entre elas**: ele quer ver o que ninguém desenhou antes de decidir. É o que você vai fazer agora.

O QUE VOCÊ PODE LER — só isto:
- a sua própria pasta (`direcao.md` e os dois HTML);
- docs/redesign/01-fatos.md — os fatos do produto;
- docs/redesign/02-uso.md — o uso real medido e os dois momentos já desenhados;
- docs/redesign/02-perguntas.md — as perguntas feitas ao dono e as respostas dele;
- os arquivos que você mesmo escrever.
Qualquer outro caminho do repositório — inclusive os outros arquivos e pastas de docs/redesign/, e a pasta do outro designer — fica fora. Se não está nesta lista, não abra. As fontes citadas dentro desses arquivos (caminhos, hashes, comandos) servem para conferência do coordenador: você não as abre nem as roda.

FERRAMENTAS. Leia e escreva arquivos, e rode comandos locais sobre os seus próprios arquivos. Não invoque skills, não dispare subagentes, não use conectores e não acesse a web. Não rode o app nem nenhum servidor do projeto. Para ver os seus próprios HTML há um Chrome sem janela em /usr/bin/google-chrome (--headless, --screenshot, --window-size); abrir nele os seus arquivos é permitido, e só eles.

AS DECISÕES DO DONO, tomadas depois da sua entrega. Valem como requisito, não como sugestão. Onde contradizem o que você escreveu, vale isto:

1. **Nada é perguntado ao encerrar o treino.** Terminar a sessão não pede decisão nenhuma. Uma mudança que você fez no dia — trocou de exercício, fez uma série a mais, mudou a carga — espera numa lista, para ele resolver sentado. **E essa espera vence em alguns dias.** O que acontece no vencimento é pergunta sua ao dono, não decisão sua: uma mudança que some sozinha sem ele decidir é um defeito que este produto já teve.
2. **Peso, medidas, fotos e bioimpedância ganham uma tela própria — e é lá que se registra também**, não só se lê. O dono aceitou o custo de sair de onde está para registrar.
3. **Corrigir no lugar é a regra, em tudo.** O valor errado continua na tela e se toca nele de novo para mudar, a qualquer hora, na série e na comida. Não há prazo para corrigir.
4. **Teclado misto:** o teclado próprio do app onde o do sistema atrapalha (registrar no meio do treino); o do sistema onde ele não atrapalha (computador, campos de texto).
5. **Tema: segue o aparelho, com troca manual.** Tudo o que você desenhar agora precisa existir **claro e escuro**, e os dois têm que ser desenhados.
6. **Paleta agradável e fluidez no toque entram.** O dono pediu isso por escrito. Movimento é permitido quando tem função — confirmar um toque, dizer para onde se andou. Decoração, não.
7. **Em dia de treino pela manhã, o treino ganha da refeição** na disputa pelo que o app oferece primeiro.
8. Das catorze perguntas abertas, estas foram respondidas e mudam o que você desenha:
   - separar "não comi" de "esqueci de marcar": **sim**, são estados diferentes;
   - guardar **qual** refeição saiu do plano: sim;
   - "não contei a água" é diferente de zero copos, e é guardado assim;
   - porções além de "tudo" e "metade": sim;
   - o previsto usa o **horário do plano**, não o horário real dele;
   - RIR em toda série;
   - a sugestão de subir carga **passa a olhar o RIR** registrado;
   - a revisão da semana fica **sempre disponível**, sem dia fixo;
   - ceia entra no plano;
   - a aula do box vence **por posição na sequência de treinos**, não por dia da semana;
   - sem hora-limite pessoal: o app não sabe a que horas ele precisa terminar;
   - da balança de bioimpedância entram: percentual e massa de gordura (inclusive visceral), massa magra, água intra e extracelular, taxa metabólica basal e idade metabólica, massa óssea, IMC ajustado e distribuição por segmento;
   - **se ele consegue ler a tela a 3 metros: ele não sabe.** Desenhe de um jeito que não dependa da resposta, ou desenhe as duas hipóteses e diga qual é qual.

O QUE ENTREGAR, na sua pasta. Cinco telas que ninguém desenhou e que o dono precisa ver para escolher:

- `aula.html` — a aula do box. É a 3ª situação mais difícil do uso medido e a de maior falha de detalhe. O dono não quer detalhe obrigatório.
- `comparar.html` — comparar fotos antigas. É o que ele diz fazer mais.
- `sessao-fotos.html` — a sessão de fotos, sozinho, com o aparelho a ~3 metros, sem alcançá-lo.
- `corpo.html` — a tela própria do corpo: onde se registra e se lê peso, medidas com fita, bioimpedância e fotos.
- `semana.html` — a leitura da semana e a régua do nutricionista, com os números que a produziram e o passo de ±150 kcal pronto para aplicar. É uma decisão que nunca aconteceu nenhuma vez no uso medido.
- `prescricao.html` — o que vem de fora: o programa do treinador, o plano alimentar, e a lista das mudanças do dia que esperam decisão e que agora vencem.

São seis arquivos, cada um autocontido, sem nenhuma dependência de rede, que o dono abre no navegador e vê em viewport de telefone — **claro e escuro, os dois**. Conteúdo real tirado dos fatos e do uso: nada de lorem ipsum, nada de imagem de placeholder. Com os estados que os fatos exigirem para cada tela, inclusive vazio e erro.

E `direcao-2.md`, curto, com:
- o que cada tela resolve, e por que assim nesta direção;
- **o que as decisões do dono mudam no que você já tinha desenhado** — em prosa, sem redesenhar os dois momentos;
- as perguntas novas que você não tem como responder sozinho, inclusive a do vencimento da mudança.

A RÉGUA. Vale a mesma de antes: sem moodboard; referência de mercado não é argumento; "porque é moderno" não é razão, "porque ele está com uma mão ocupada" é. Toda tela precisa dos estados ruins resolvidos, não só do caminho feliz. Diga o que você recusa fazer, e aguente a recusa.

E a régua que o dono deu, nas palavras dele: "fluxos muito dificultosos" não; "gosto de predição, mas não dá pra ser uma briga muito grande pra contornar"; "gosto das coisas visuais, mas sem exagerar e poluir demais as telas"; "na hora do treino pode ficar mais limpa". Numa das respostas ele acrescentou: "prefiro o mínimo de toques necessário".

Grave em etapas: escreva cada arquivo assim que ele estiver pronto, em vez de segurar tudo para o fim.

Sua pasta: docs/redesign/03-direcao-
```

## Anexo H · Protótipo tocável (C e D), 04/10

Corpo idêntico para os dois, com a letra da pasta na última linha. Nasceu da
pergunta do dono: "preciso decidir entre as duas? queria ver um protótipo".

Decisões de transcrição:
- **o roteiro é idêntico e obrigatório nas duas** — registrar a série do caso
  medido, errar e corrigir, ir à comida sem perder a sessão, pôr ontem em dia,
  registrar o peso, abrir a bioimpedância, voltar. Sem roteiro igual não há
  comparação, e é só isso que o protótipo serve para decidir;
- **proibido redesenhar.** É a direção que já existe, posta de pé. O que aparecer
  de errado ao tocar vira anotação, que é o achado mais valioso desta rodada;
- `100svh` e área segura vão no prompt como regra, não como dica: é a armadilha
  registrada no `~/.claude/CLAUDE.md` do dono, e ela some de um protótipo de
  tela cheia aberto no iPhone;
- nada de `alert`/`confirm`, porque ele vai abrir no celular e um diálogo do
  sistema trava a impressão;
- o protótipo pode guardar em `localStorage` (não é a opção "instalável" que ele
  recusou; é só não perder o estado ao trocar de aba).

```text
Você é o designer de produto sênior responsável por uma das direções deste app. Você já entregou duas rodadas: os dois momentos e, depois, seis telas. Agora vem a terceira, e é diferente das outras duas.

O QUE MUDA. Até aqui você desenhou **galerias**: telas lado a lado que o dono olha. Agora ele quer **usar**. Ele vai abrir o seu arquivo no celular, com o polegar, e tocar — e vai fazer o mesmo com a outra direção, no mesmo dia, para escolher entre as duas com o dedo em vez de escolher lendo.

Então o que você entrega é **um app de mentira que funciona de verdade**: um arquivo só, `prototipo.html`, autocontido, sem nenhuma dependência de rede. Uma tela por vez ocupando a janela inteira — nada de dois telefones lado a lado, nada de legenda explicando o estado. O toque faz a coisa acontecer, e a tela responde.

Você NÃO redesenha nada. Isto é a sua direção, do jeito que você já a desenhou, posta de pé. Se durante a montagem você perceber que alguma coisa não funciona quando tocada, conserte o mínimo e **anote** — essa anotação vale ouro, e vai no fim do arquivo que você escrever.

O ROTEIRO, IGUAL NAS DUAS DIREÇÕES. É o que torna a comparação possível. Ele precisa conseguir fazer isto, nesta ordem, sem instrução nenhuma na tela:

1. **Registrar a série.** O protótipo abre numa terça, 6h55, décima série da sessão: pulldown unilateral, série 2 de 2, e na última vez foi 45 kg × 9 repetições. Hoje saiu 45 × 10. Ele registra.
2. **Logo depois:** o descanso começa a contar sozinho; ele pode marcar o RIR se quiser; e pode fazer **uma série a mais** além das prescritas.
3. **Errar e consertar.** Ele toca o número errado — 11 em vez de 10 — e conserta. Este passo é obrigatório no protótipo: é uma das decisões do dono (corrigir no lugar, sempre).
4. **Ir para a comida sem perder a sessão.** Marcar o lanche das 15h30 como comido inteiro. E marcar o almoço de **ontem** como metade, que é o caminho de pôr em dia.
5. **Ir para o corpo.** Registrar o peso da manhã, 73,4 kg. E abrir a bioimpedância.
6. **Voltar para a sessão** e ver que nada se perdeu.

Tudo o que estiver fora desse roteiro pode ser um beco: o toque não precisa levar a lugar nenhum, desde que não pareça quebrado. Prefira desabilitar visivelmente a fingir que funciona.

AS REGRAS DO PROTÓTIPO:

- **Um arquivo, sem rede.** Nenhum `src` externo, nenhuma fonte baixada, nenhuma imagem de fora. Se precisar de ícone, desenhe em SVG inline.
- **Tela cheia de telefone.** Use `100svh` para a altura, não `100vh` — em iPhone o `100vh` é a janela com a barra recolhida, e sobra um pedaço rolável que mostra o fundo. Respeite a área segura de cima e de baixo.
- **Tema: segue o aparelho, com troca manual**, que foi decisão do dono. Então os dois temas de verdade, e um jeito de trocar dentro do protótipo.
- **O estado é real durante o uso.** Registrar muda a tela e continua mudado quando ele volta. Guardar no próprio navegador (localStorage) é bem-vindo, e um botão discreto de "começar de novo" ajuda — mas se guardar, trate a leitura e a escrita com try/catch, porque em aba privada isso falha.
- **Nada de alerta, confirmação ou pergunta do sistema.** Se precisar confirmar, desenhe dentro da página.
- **O movimento entra**, porque o dono pediu fluidez: o toque afunda, o que foi registrado aparece onde foi parar. Com função, não decoração. E morre em `prefers-reduced-motion`.
- **Conteúdo real** tirado dos fatos e do uso: os nomes dos exercícios, as refeições do plano, os números. Nada de lorem ipsum.

O QUE VOCÊ PODE LER — só isto:
- a sua própria pasta inteira (`direcao.md`, `direcao-2.md` e os oito HTML);
- docs/redesign/01-fatos.md, 02-uso.md e 02-perguntas.md;
- os arquivos que você mesmo escrever.
Qualquer outro caminho do repositório fica fora, inclusive a pasta do outro designer e os outros arquivos de docs/redesign/. As fontes citadas dentro desses arquivos servem para conferência do coordenador: você não as abre nem as roda.

FERRAMENTAS. Leia e escreva arquivos, e rode comandos locais sobre os seus próprios arquivos. Não invoque skills, não dispare subagentes, não use conectores e não acesse a web. Não rode o app nem nenhum servidor do projeto. Para ver o seu próprio HTML há um Chrome sem janela em /usr/bin/google-chrome (--headless, --screenshot, --window-size); use-o para conferir que a tela cabe e que os dois temas funcionam.

ALÉM DO `prototipo.html`, escreva `prototipo.md`, curto:
- o que ficou de fora do protótipo e por quê;
- **o que você descobriu ao pôr a sua direção de pé** — o que só apareceu quando virou coisa tocável;
- o que você consertou durante a montagem, se consertou.

Grave em etapas: o arquivo no disco cedo, e vá melhorando. Não segure para o fim.

Sua pasta: docs/redesign/03-direcao-
```

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
