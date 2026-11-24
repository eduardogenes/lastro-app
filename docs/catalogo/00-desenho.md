# Catálogo, academias e programas

Desenho aprovado pelo dono em 23/11/2026. Ainda não há código. Vem antes da etapa 1 do MCP ([docs/mcp/00-desenho.md](../mcp/00-desenho.md)), que passa a ler o que está descrito aqui.

## Por que

Três problemas apareceram juntos ao colar a v2.2 do treinador:

- **O programa não existe como coisa.** O app guarda uma lista de treinos (`S.prog`, `S.rot`) e uma revisão só soma ou muda treinos. A v2.2 renomeou tudo (A–E viraram SA, IA, SB, IB, SC) e entrou somada ao programa antigo: a rotação ficou com onze treinos. Para o dono, A–E é um programa e a v2.2 é outro; o antigo fica guardado, não apagado.
- **O exercício é identificado pelo nome.** Cada usuário tem o próprio catálogo (`S.ex` mais o `CAT` do código), e o texto do treinador casa por nome e parecença. Com mais usuários, "Puxada alta", "Pulldown" e "Lat pulldown" viram três exercícios, e o volume por músculo, a troca por equivalente e o coach passam a errar.
- **A máquina não existe.** A carga de um leg press não vale para o de outra academia, o Smith tem barra de peso diferente em cada lugar, e o app não sabe o que há onde a pessoa treina.

## Decisões do dono (23/11/2026)

1. **Programas são coisas separadas.** Um ativo por vez. Os antigos ficam guardados, desativados, e nada se apaga.
2. **O catálogo de exercícios fica fora da camada do usuário.** É do sistema, igual para todos.
3. **Academias e máquinas são cadastradas em conjunto.** Quem treina numa academia cadastra as máquinas que usa; quem chega depois reaproveita e completa; quem vai a uma academia que não existe a cria, e ela passa a aparecer para todos. O app é local, e a base cresce aos poucos.
4. **Toda academia é visível para todo usuário.**
5. **O que alguém cadastra vale na hora**, marcado como novo até ser confirmado. Erros se corrigem pelo histórico de edições. Só unir duplicatas e apagar ficam com o moderador, que no começo é o dono.
6. **O programa é um só, independente da academia.** A academia entra na hora do treino: o app escolhe a máquina presente e lembra a escolha por academia.

## O que a pesquisa confirmou (23/11/2026)

- **Atribuir um programa é copiar.** No TrainHeroic, o atleta recebe uma cópia do programa da biblioteca naquele momento, com data de início; mudar a cópia não muda o original. Fonte: [Comparably, TrainHeroic FAQ](https://www.comparably.com/companies/trainheroic/faqs).
- **Fase é um bloco de semanas com foco próprio**, com início ajustável. Fonte: [Bridge Athletic, fases](https://intercom.help/bridgeathletic/en/articles/7791475-how-to-add-a-phase).
- **O deload fica na última semana do mesociclo**, e mudar a duração o move. Fonte: [RP, deloads](https://help.rpstrength.com/hc/en-us/articles/33510413024279-Does-the-app-automatically-place-deloads). O RP também ganhou "copiar mesociclo" ([novidades](https://help.rpstrength.com/hc/en-us/articles/34725726510999-RP-Hypertrophy-App-What-s-new)), e usuários reclamam quando as cargas não passam de um mesociclo para o seguinte.
- **No Lastro, o histórico já é por exercício**, não por treino (`S.logs[idDoExercicio]`, [ARQUITETURA.md](../ARQUITETURA.md)). As cargas já atravessam programas. O que depende da letra do treino é a presença (`S.done[].day`) e a rotação.

## As três camadas

### 1. Do sistema: curada, ninguém edita pelo app

**Movimento.** O padrão: puxada vertical, supino inclinado, extensão de joelho, elevação lateral, ponte de quadril.

**Exercício.** Movimento, mais implemento, mais variação: `Supino inclinado · Smith · 30°`, `Elevação lateral · polia · unilateral`. Cada um tem:
- `id` estável, que nunca é derivado do nome depois de criado;
- nome principal e nomes alternativos, em português e em inglês, inclusive os de academia;
- músculos principais e secundários, com fração (para o volume por grupo);
- tipo de carga padrão (`pino`, `lado`, `barra`, `halter`, `halter1`, `corpo`, `assist`) e unidade padrão;
- se é unilateral;
- equivalentes, com o que muda;
- dica padrão.

**Tipo de equipamento.** Genérico: Smith, polia simples (1:1), polia dupla (2:1), máquina de pino, máquina articulada de anilha, leg press 45°, banco, halteres, barra livre, peso do corpo. Diz como a carga se lê.

**Por que não é coletivo:** é a base de toda conta. Um erro aqui quebra o volume, a troca por equivalente e o coach de todo mundo. Pedidos de inclusão chegam da camada pessoal (exercício pessoal) e entram por curadoria.

### 2. Coletiva: todo usuário vê e pode somar

**Academia.** Nome, localização aproximada (bairro e cidade, ou ponto no mapa), situação (aberta, fechou).

**Modelo de máquina.** Marca e modelo, quando alguém sabe (`Hammer Strength · Iso-Lateral Incline Press`), ligado a um tipo de equipamento. Quem cadastra numa academia ajuda as outras com o mesmo modelo: os dados de carga vêm junto.

**Máquina da academia.** Uma instância:
- o modelo, ou só o tipo genérico;
- o apelido local ("o leg press do fundo") e a quantidade;
- uma foto;
- o que muda a carga: peso da barra do Smith, passo do pino, polia 1:1 ou 2:1, peso inicial;
- os exercícios que ela serve;
- situação: confirmada, nova, não vista há tempo, saiu.

### 3. Pessoal e privada

- Em quais academias a pessoa treina, e qual é a de hoje.
- Ajustes dela em cada máquina: banco na posição 4, pino no 3. O app mostra na hora do exercício.
- Apelidos dela para exercícios do catálogo.
- Exercício pessoal, quando falta no catálogo. Vira pedido de inclusão.
- Programas, fases, histórico, presença: tudo o que já é do estado dela.

Ninguém vê quem treina onde, nem quem cadastrou o quê.

## Identidade

- **O nome nunca é a chave.** Exercício, modelo, academia e máquina têm `id` próprio.
- **Unir não quebra nada.** Quando duas academias, duas máquinas ou dois exercícios se mostram iguais, um vira o principal e o outro passa a redirecionar para ele. Todo histórico que apontava para o id antigo continua resolvendo. Um redirecionamento nunca é apagado.
- **Separar é possível.** Se a união foi errada, ela se desfaz pelo registro da união.
- **Ler um texto (do treinador, de uma revisão, de um agente):** nome → nomes alternativos do catálogo → apelidos da pessoa → parecença. Se houver dúvida, o app pergunta uma vez e guarda a resposta como apelido da pessoa. Pelo MCP, o agente usa o `id` e não há o que adivinhar; ele ganha uma ferramenta de busca no catálogo.

## A academia na hora do treino

O programa é escrito com exercícios do catálogo, sem máquina. Ao começar um treino:
1. o app sabe a academia de hoje: a última usada, ou a que a pessoa escolhe;
2. para cada exercício, se há na academia uma máquina que o serve, usa ela;
3. se não há, mostra os equivalentes presentes na academia, pelo catálogo;
4. a escolha fica lembrada para aquela academia, e na próxima vez já vem pronta.

O treinador marca cada exercício como **"aceita equivalente"** (o padrão) ou **"não trocar"**, por exemplo por causa da lombar. Um "não trocar" sem máquina na academia vira aviso, não troca silenciosa.

Sem academia escolhida, tudo funciona como hoje.

## A carga segue a máquina

- O histórico guarda o exercício e, quando houver, a máquina (`S.logs[id][].maq`).
- A sugestão de carga usa o histórico naquela máquina. Sem histórico nela, usa o de outra máquina do mesmo modelo; sem isso, o do exercício em qualquer máquina, e diz que a referência é de outro aparelho.
- O tipo de carga e o passo vêm da máquina, depois do modelo, depois do exercício, nessa ordem. A correção pessoal (`S.carga`) continua valendo sobre todos.

## Programas

**O programa é uma coisa própria**, no estado da pessoa:
- `id`, nome ("v2.2 · Lombar"), origem (treinador ou a pessoa), objetivo, notas;
- estado: rascunho, agendado, ativo, encerrado;
- início, e duração prevista em semanas;
- os treinos, com chave interna própria (a letra é só rótulo), e a ordem da rotação;
- o programa do treinador e o da pessoa, como hoje (`progTreinador` e `prog`), agora dentro de cada programa;
- as versões: cada revisão aplicada é uma versão, com o registro do que mudou (`progLog`).

**Um ativo por vez.** Os outros ficam guardados: consultar, reativar, duplicar para usar de base.

**Revisão ou programa novo.** Ao colar um texto, o app pergunta e sugere: se nenhum treino do texto casa com os do programa ativo, sugere "programa novo". O texto pode dizer no topo: `Programa · v2.2 Lombar · começa 01/12`.

**Agendado.** Um programa pode chegar antes e começar numa data. No dia, ele vira o ativo, e o anterior é guardado. Uma sessão em andamento nunca muda de programa.

**O passado não se reescreve.** Cada sessão grava o programa, a versão e a fase em que foi feita (`S.done[].prog`, `.ver`, `.fase`). Registrar depois um dia passado oferece os treinos do programa que valia naquele dia.

**Treinos fora de programa.** O HYROX aberto e os treinos avulsos não pertencem a um programa. Ficam disponíveis com qualquer programa ativo.

## Fases

Uma fase é um bloco dentro do programa, com:
- nome e foco ("Fase 1 · lombar");
- como termina: por semanas, por marco ("prancha lateral chega a 45 s") ou pelos dois;
- o que muda: séries, RIR, exercícios que entram ou saem.

O app avisa quando a fase parece encerrada e a pessoa confirma; ele não troca sozinho. O deload é uma fase curta, ou uma semana marcada, e substitui o `S.deload` de hoje. O formato do texto do treinador ganha um bloco `Fase` (a definir com ele).

## Balanço

Ao encerrar um programa ou uma fase, o app mostra:
- quantos treinos previstos foram feitos;
- o volume semanal por músculo, pelo catálogo;
- o que progrediu em cada exercício, por máquina;
- dores registradas no período.

O balanço é o que o treinador lê, pelo MCP, para montar o próximo.

## Moderação e confiança

- **Cadastrar e corrigir vale na hora.** O item novo aparece marcado como novo.
- **Confirmar:** quem treina na academia pode confirmar uma máquina ou um dado. Algumas confirmações tiram a marca de novo.
- **Histórico de edições**, como numa wiki: quem editou (só para o moderador), quando, o que era antes. Toda edição pode ser desfeita.
- **"Isso está errado"** chega ao moderador.
- **"Não vi mais"** em máquina: com algumas marcas, ela sai da lista da academia. O histórico de quem a usou continua.
- **Com o moderador:** unir duplicatas e apagar. No começo, o moderador é o dono.
- **Antes de criar:** o app busca academias por perto e pelo nome, e mostra as máquinas que a academia já tem.
- **Fotos:** só de máquina, sem rosto, com denúncia.

## Onde mora cada coisa

| O quê | Onde | Quem lê | Quem grava |
|---|---|---|---|
| Movimentos, exercícios, tipos de equipamento | tabelas novas no Supabase | todo usuário | só o moderador |
| Modelos, academias, máquinas, confirmações, edições | tabelas novas no Supabase | todo usuário | todo usuário, por funções que registram a edição |
| Uniões (redirecionamentos) | tabela nova | todo usuário | só o moderador |
| Programas, fases, ajustes, apelidos, histórico | o estado da pessoa (`estado.data`) | a pessoa (e os agentes dela) | a pessoa |

- O app guarda uma cópia do catálogo e das academias da pessoa para funcionar sem internet; a cópia tem versão e se atualiza ao abrir.
- Um cadastro feito sem internet fica na fila e sobe depois. Se, ao subir, já existir algo igual, o app oferece usar o que existe.
- As regras de acesso (RLS) seguem a tabela acima. Gravar na camada coletiva passa por funções do banco, que registram a edição; ninguém escreve direto nas tabelas.

## Migração do que existe

- **Exercícios.** O `CAT` do código e o `S.ex` de cada pessoa viram exercícios do catálogo. Os ids atuais (`slugEx`) são preservados como ids do catálogo ou viram redirecionamentos; nenhum `S.logs[id]` muda de chave. Exercício criado pela pessoa que não casa com o catálogo vira exercício pessoal.
- **Programa.** `S.prog`, `S.rot`, `S.progTreinador` e `S.progLog` viram o primeiro programa da pessoa, ativo.
- **Presença.** `S.done[].day` ganha o programa da sessão; a letra continua como rótulo.
- **O caso do dono.** A migração separa o que a v2.2 somou: A–E vão para um programa guardado ("até 23/11"), e SA, IA, SB, IB, SC e HX formam o ativo. Precisa de teste com a cópia real do estado.
- **Formato.** O `plano` NÃO sobe (lição da etapa 0: o build em produção funde pelo estado inteiro um plano que não conhece). Os campos novos são opcionais e as migrações são idempotentes, testadas contra o `funde` congelado do build anterior.

## O que o MCP ganha

- Ler o programa ativo, os guardados, a fase e o balanço.
- Buscar no catálogo por nome ou músculo, e receber ids.
- Ver as máquinas da academia da pessoa, para prescrever o que existe.
- Na etapa 2, propor um programa novo ou uma revisão já com ids, sem adivinhar nomes.

## Riscos

- **A camada coletiva é a primeira coisa compartilhada entre usuários.** Até aqui, cada um só via o próprio estado. Regras de acesso, abuso e moderação passam a existir.
- **Sincronia.** Dois aparelhos trocando o programa ativo ao mesmo tempo: o ativo leva carimbo, e a fusão escolhe sempre o mesmo resultado.
- **Telas que supõem um programa só:** Hoje, Semana, calendário, revisão, espelho.
- **Cópia offline velha:** um exercício unido enquanto o aparelho estava fora resolve pelo redirecionamento ao voltar.
- **Tamanho.** O catálogo e as academias não entram no estado da pessoa; só ids.

## Etapas

0. **Catálogo e migração.** Tabelas do sistema, cópia offline, exercícios atuais migrados, resolução de nomes. Sem tela nova além da busca.
1. **Programas.** Programa como coisa própria, ativo e guardados, "revisão ou programa novo", sessão grava o programa, registrar depois pelo programa vigente, a separação do caso do dono.
2. **Academias e máquinas.** Cadastro coletivo, academia de hoje, escolha de máquina lembrada, carga por máquina, ajustes pessoais. O dono como primeiro usuário e moderador.
3. **Moderação.** Confirmações, histórico de edições, "não vi mais", unir e separar.
4. **Fases e balanço.** Agendar início, fases com passagem sugerida, deload como fase, balanço.
5. **MCP.** As etapas do [desenho do MCP](../mcp/00-desenho.md), lendo tudo isto.

Cada etapa passa por protótipo antes de código quando muda tela, e pelos revisores no fim.

## Etapa 0: decidido na implementação (23/11/2026)

- **Os ids são os de sempre.** O catálogo do sistema usa o `slugEx` que o histórico já usa. Para todo id do código, o exercício que o sistema devolve é igual ao do `EX_BASE` (teste em `tests/dominio/catalogo.test.ts`).
- **A semente é gerada, não digitada.** `src/dominio/catalogo.ts` monta a semente a partir do `EX_BASE`: movimento, equipamento e músculos secundários saem do nome por regra (meia série para o sinergista), e os substitutos indicados pelo treinador viram os equivalentes de partida. Os dados à mão ficam em `catalogo-semente.ts`: movimentos, tipos de equipamento, nomes alternativos e os exercícios novos da v2.2. O SQL da semente é gerado dela (`npm run catalogo:sql`).
- **Da v2.2, dezessete nomes não tinham candidato** no catálogo (nem nome parecido, nem lugar: os treinos tinham letras novas). Doze entram no sistema como exercícios novos, com o id do próprio nome — o mesmo id que a revisão já tinha criado na pessoa. Os outros cinco são, com certeza, exercícios que já existiam, e entram como **nomes alternativos** deles. Mas no estado de quem colou a v2.2 (no build 13) esses cinco **já nasceram como exercícios pessoais**, com o id do próprio nome e histórico próprio; o id do nome vem antes do alternativo na leitura, então lá eles continuam pessoais. São candidatos a união na etapa 3 (lista para o moderador abaixo).
- **Os que tinham nome parecido ficam fora** (oito, por exemplo "Supino inclinado no Smith 30°", "Remada apoiada no peito"): a pessoa respondeu "é o mesmo" ou "é outro", o app não guardou a resposta, e pôr o nome deles no catálogo mudaria a próxima leitura do mesmo texto. Ficam para o moderador.
- **Nome alternativo é só o que é, com certeza, o mesmo exercício.** Leva ao id sem perguntar. Variação que muda a carga (outro ângulo, outra máquina) é outro exercício, ou um equivalente.
- **Ordem da leitura de um nome:** apelido da pessoa, id do próprio nome, nome atual de um exercício dela que foi renomeado ("Voador"), nome alternativo do sistema e, só então, parecença e lugar. O apelido vem primeiro porque é decisão dela; o id do nome e o nome renomeado vêm antes do alternativo para que um "é outro" já respondido, ou o nome que ela deu, continuem valendo.
- **Certeza não disputa id.** Os passos de certeza (apelido, id, renomeado, alternativo) podem levar dois nomes ao mesmo exercício — por exemplo o apelido "Supino inclinado no Smith 30°" num treino e "Supino inclinado no Smith" noutro. Só a parecença e o lugar, que são palpites, deixam de propor um id já levado. Dois nomes do MESMO treino no mesmo exercício viram aviso na revisão.
- **Os apelidos nascem da revisão:** a resposta "é o mesmo" vira apelido, com o nome como o treinador escreveu. Não vira apelido o nome que já é o id de um exercício vivo, nem o id criado ou desarquivado pela própria revisão, nem o que o nome alternativo já resolve. O Desfazer da revisão tira os apelidos que ela gravou, com lápide `apelido:<chave>`, e devolve o que ela tinha sobrescrito.
- **Sem plano novo.** Os apelidos (campo opcional) e a redução de `S.ex` a referência entram sem subir o plano: o build 13, nos outros aparelhos, funde pelo estado inteiro um plano que não conhece, e uma edição de programa feita aqui se perderia lá. A redução é idempotente e roda em toda abertura, importação e fusão.
- **Exercício pessoal é derivado**, não marcado: é o id que não está no sistema.
- **Moderador:** tabela `moderadores` sem política nenhuma (só o SQL Editor a mexe) e a função `eh_moderador()`. O uid do dono não está no repositório: incluí-lo é um passo manual.
- **Ninguém apaga pelo app.** Não há política de DELETE no catálogo nem nos redirecionamentos.
- **A cópia no aparelho guarda só a diferença para a semente**, para não tirar espaço do estado no armazenamento do Safari.
- **Servir e ser mais nova são duas perguntas.** A cópia do banco SERVE quando tem todos os ids da semente (direto ou por união) e não trocou carga nem grandeza de nenhum. É MAIS NOVA quando a versão do banco passa a que o aparelho já tem (0 = só a semente). A versão do conteúdo da semente é outro contador e não se compara com a do banco.
- **Versão:** o banco sobe `catalogo_versao` a cada LINHA gravada no catálogo (um comando que não muda nada não sobe). O app lê o catálogo paginado, em ordem de id, conferindo o total.
- **A semente só insere** (`on conflict do nothing`). Exercício que já existe no banco se corrige no banco, pelo moderador; mudar a semente não sobrescreve a curadoria.
- **Regra de curadoria: a carga e a grandeza de um exercício não mudam.** `car` e `u` dizem como ler a série guardada (40 em "anilha por lado" não é 40 na placa). Mudou a carga, é outro exercício: id novo, e o antigo como equivalente. O banco recusa a troca (gatilho) e o app recusa uma cópia que a traga (`validaCatalogo`).
- **União materializada.** O id antigo de uma união aparece com o exercício que ficou (nome, carga, grupo), mesmo que a linha antiga saia da tabela. E um id sem base nenhuma aparece como fantasma nomeado, nunca como exercício sem nome.

### Para o moderador: os cinco da v2.2 que nasceram pessoais

No estado de quem colou a v2.2, estes nomes viraram exercícios pessoais (id do próprio nome). No sistema, cada um é nome alternativo de um exercício que já existia. Candidatos a união na etapa 3:

| Nome da v2.2 (id pessoal) | Exercício do sistema |
|---|---|
| Crucifixo na polia baixa para alta (`crucifixo-na-polia-baixa-para-alta`) | Crossover de baixo para cima (`crossover-de-baixo-para-cima`) |
| Abdução de quadril na máquina (`abducao-de-quadril-na-maquina`) | Abdutora (`abdutora`) |
| Panturrilha sentado (`panturrilha-sentado`) | Panturrilha sentada (`panturrilha-sentada`) |
| Rosca bayesiana na polia (`rosca-bayesiana-na-polia`) | Rosca bayesian no cabo (`rosca-bayesian-no-cabo`) |
| Crucifixo inverso no peck deck (`crucifixo-inverso-no-peck-deck`) | Reverse pec deck (`reverse-pec-deck`) |

## Etapa 1: decidido na implementação (24/11/2026)

Protótipo aprovado pelo dono em 24/11/2026 (rodada 2, `~/lastro-rascunho/programas/`). As três perguntas dele ficaram com a recomendação, decididas pelo Opus:

1. **"começa dd/mm"** guarda o programa em "Próximo"; no dia, o Hoje pergunta se começa ("Começar hoje" ou "Depois"), sem troca automática.
2. **Reativar** recomeça a rotação pelo primeiro treino.
3. **O texto do treinador** pode trazer, antes do primeiro treino, `Programa · nome · começa dd/mm` e `Objetivo: …`. Sem a primeira, o nome é "Programa de dd/mm".

Na implementação:

- **O ativo continua em `prog`, `rot` e `progTreinador`**, e o documento novo `programas` guarda os outros (detalhe em [ARQUITETURA.md](../ARQUITETURA.md), "Os programas"). O plano não sobe.
- **A migração separa o caso do dono pela revisão que somou**: os treinos que ela criou (o registro "Treino X entra na rotação" no instante dela) formam o ativo; os outros, o guardado. O guardado se chama "Programa de <mês da primeira sessão>"; o ativo, "Programa de 23/11" (o texto não tinha título). O dono pode renomear.
- **Sem duração prevista.** O texto não diz quantas semanas o programa dura, então o número "semana 1 / 4" do protótipo ficou só "semana 1". Fica para a etapa 4 (fases).
- **A revisão aberta** mostra o que mudou, com o motivo, e o texto colado quando houver. O impacto em séries por músculo e em minutos, do protótipo, fica para depois.
- **"Foi de outro programa"**, no registro de um dia, não entrou: o dia oferece o programa que valia nele.
- **"Montar um do zero"** virou "Duplicar o de agora" (o rascunho em "Próximo"); montar do zero continua pelo editor do programa.
- **Aderência**: os treinos feitos sobre os previstos pelos dias de treino da cadência, limitados ao número de treinos do programa; cada semana conta no máximo os previstos dela (a semana de seis não cobre a de dois); o aberto conta como feito e não como previsto.

Depois das revisões de dado e de design (24/11/2026):

- **A fusão é por programa** e o ativo nunca se mistura; a migração se carimba pelo dado. Detalhe em [ARQUITETURA.md](../ARQUITETURA.md), "Os programas".
- **A separação só vale para revisões coladas antes de 28/11/2026** (`SEPARA_ATE`), espera um treino de antes aberto terminar, e guarda também as letras fora da rotação.
- **O texto colado fica guardado junto do programa novo**, e a revisão aberta mostra "Ver o texto colado".
- **"Montar um programa à mão"** (texto sem treinos) virou "Editar o programa de agora à mão": o editor só edita o programa ativo, e um programa vazio em "Próximo" não teria onde ser montado. **"Montar um do zero"** na linha do tempo ficou fora pelo mesmo motivo; no lugar, "Duplicar o de agora". Os dois voltam quando o editor puder editar um programa que não é o ativo.
- **O "começa hoje?"** é o próprio bloco do Hoje, antes de qualquer treino, com "Começar hoje", "Depois" e "Ver o programa".
- **"Foi de outro programa"** entrou no registro de um dia: troca para o outro programa que já foi o ativo, e "Voltar ao programa do dia" desfaz.
- **Na revisão, o botão continua "Aplicar N mudanças"** (e não "Aplicar como revisão" do protótipo): ele diz quantas mudanças entram, que é o que a pessoa escolhe nas chaves.
- **A revisão aberta** mostra uma linha por mudança, com o sinal, o que ficou de fora e o texto colado. O impacto em séries por músculo e em minutos, do protótipo, fica para a etapa 4 (balanço).
- **Os treinos de um programa guardado** abrem uma folha só de leitura com a prescrição, em vez de se abrirem na lista.

## Em aberto

- O formato da fase e do programa no texto do treinador: combinar com ele.
- Localização da academia: ponto no mapa ou só bairro e cidade.
- Quantas confirmações tiram a marca de novo, e quantas marcas de "não vi mais" tiram uma máquina.
- Base pública para completar o catálogo inicial: conferir licença antes de usar.
- Os doze exercícios da v2.2 e os secundários por regra estão marcados `cur` (curadoria). O moderador confere, e os oito da v2.2 com nome parecido esperam decisão (entrar no sistema, virar nome alternativo, ou ficar pessoais).
- Os novos da v2.2 que a pessoa já tem em `S.ex` ficam inteiros lá até não haver aparelho num build anterior a esta etapa; depois, a redução passa a incluí-los.
- Fotos de máquina: onde guardar (o mesmo armazenamento das fotos do exercício, ou um público).
