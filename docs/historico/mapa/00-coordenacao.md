# O mapa do Lastro — coordenação

Pedido do dono (14/10/2026): "um fluxograma completo do aplicativo, com TUDO
MESMO, ponta a ponta, parte por parte, funcionalidade por funcionalidade. O
objetivo é criar a documentação dele, com uma separação e entendimento muito
fácil de tudo, para depois focar em cada coisa e ir evoluindo como serviços
individuais. Junte um time pra isso e desenhe."

Regras do time e modelo dos documentos: `00-brief.md`. Inventário mecânico do
código: `_inventario.md` (277 pontos de entrada, 446 funções de `main.jsx`, os
campos do dado, as telas e os testes).

Legenda: `[x]` feito · `[~]` em andamento · `[ ]` a fazer.

## O time e as áreas

Cada área vira um documento e, depois, um candidato a serviço individual.

| doc | área | escopo (o que é dela) | onde começar a ler |
|---|---|---|---|
| `01-fundacao.md` | **Fundação e plataforma** | abertura do app (boot, a abertura com prazo), o dado guardado (`S`, `normalizaEstado`, chaves, `db.ts`), gravar (`save`, `queueSave`, cota cheia, o aviso de que uma gravação falhou), migrações (plano, chave antiga), cópia de segurança (exportar, importar, colar), apagar tudo, o endereço vazio, Ajustes (fora a nuvem), o painel de "pare", toast, a casca (abas, `app.jsx`, tab bar, folhas, tela cheia), navegação e Voltar do sistema (`navegacao.js`), posição de leitura, PWA (service worker, manifesto, publicação na Vercel), palco/bancada (`palco.js`), tela acesa, retrato, zoom, desligamento | `src/main.jsx` (estado, render, folhas, Voltar, abertura), `src/infra/db.ts`, `src/dominio/migracoes.ts`, `src/sw.js`, `src/ui/app.jsx`, `src/ui/navegacao.js`, `src/ui/instrumento/*`, `src/ui/telas/ajustes.jsx`, `src/palco.js`, `vite.config.js`, `vercel.json` |
| `02-sincronia.md` | **Sincronia e nuvem** | conta (entrar, sair, sessão expirada), puxar e empurrar o estado, a fusão campo a campo (coleções com chave, documentos, lápides, tetos), o estado da sincronia (`sync`), subir e baixar as fotos (aparelho e corpo), o que acontece sem rede e com conflito | `src/infra/nuvem.ts`, `src/dominio/sincronia.ts`, `sincroniza`, `reconciliaFotos`, `reconciliaCorpo`, `garanteBytesDoCorpo` em `main.jsx` |
| `03-sessao-de-treino.md` | **A sessão de treino** | o modo de sessão, começar/continuar/encerrar, a sessão que fecha sozinha e a esquecida, o cartão do exercício (régua, teclado, RIR, coluna anterior, + série, pular, dor, troca de exercício, aquecimento, anilhas e tipo de carga, foto do aparelho, anotação), o descanso (cronômetro, ±15, sobreviver ao fechar, bipe), "enquanto descansa", deload, a edição do treino de hoje, deitado em duas colunas | `ciclo de vida da sessão`, `projeção`, `finalizar`, `rascunho`, `substituição`, `view-model do cartão`, `cronômetro`, `deload`, `edição do treino de HOJE` em `main.jsx`; `src/ui/telas/sessaomodo.jsx`, `treino.jsx`, `src/ui/exercicio.jsx`, `regua.jsx`, `teclado.jsx`, `src/dominio/regua.ts`, `teclado.ts`, `sessao.ts`, `carga.ts` |
| `04-programa.md` | **Programa e prescrição de treino** | o programa dele (`S.prog`) e o do treinador (`progTreinador`, revisão colada), a sequência (próximo treino, a aula fora da ordem), a tela do programa (editar, criar treino, restaurar), a fila de mudanças que esperam decisão (vencimento, decidir), volume e alvo por músculo, o catálogo de exercícios (base, cadastrados, arquivados, ids), as regras do treinador na Prescrição, o histórico de um exercício e a progressão (subir carga, pausa), a retrospectiva de bloco | `tela de programa`, `ações do programa`, `a revisão do treinador`, `as perguntas de programa que esperam`, `decisão do fim da sessão`, `GUIA`, `retrospectiva` em `main.jsx`; `src/dominio/programa.ts`, `dia.ts`, `prescricao.ts`, `volume.ts`, `progressao*`, `revisao.ts`, `forca.ts` (só a parte de exercício); `src/ui/telas/programa.jsx`, `historico.jsx`, `retrospectiva.jsx`, `revisao.jsx`, `prescricao.jsx` (parte do programa) |
| `05-aula-do-box.md` | **A aula do box** | o dia aberto, os movimentos com grandeza (metros, calorias, repetições, segundos, ritmo), o registro rápido, os modelos de aula, repetir a aula anterior, a referência de cada movimento e "na última aula", o quadro colado/transcrito, a lousa fotografada | `aula de box` em `main.jsx`, `src/dominio/aula.ts`, `unidade`, `src/infra/lousa.ts`, `src/ui/telas/treino.jsx` (parte do dia aberto), `src/ui/instrumento/edicao.jsx` (adicionar movimento) |
| `06-comida.md` | **Comida** | o plano alimentar e a edição de refeições, as refeições do dia (marcar, porção, "fora do plano", "não comi", "não sei"), a folha da refeição e a do tipo do dia, a água, o turno, a alta demanda, a cadência (dia de treino/descanso), pôr um dia em dia, o histórico de comida e a adesão por refeição, o catálogo de alimentos, as compras | `COMIDA`, `edição de COMIDA`, `pôr um dia em dia` em `main.jsx`; `src/dominio/nutricao/*`; `src/ui/folhas/refeicao.jsx`, `editores.jsx`, `poeodia.jsx`; `src/ui/telas/prescricao.jsx` (comida, alimentos, semana) |
| `07-corpo.md` | **Corpo e medidas** | o peso da manhã (registrar, teclado, dia da medida, média da semana, ritmo, a semana sem média), a cintura e as medidas de fita (como mediu), a bioimpedância, o destino Evolução, o vazio do corpo, o peso rápido no descanso | `as medidas do corpo`, `a data da medida`, `DADOS` (corpo), `o destino EVOLUÇÃO` em `main.jsx`; `src/dominio/corpo.ts` (fora o veredito); `src/ui/telas/corpo.jsx`, `evolucao.jsx`, `src/ui/folhas/pesorapido.jsx` |
| `08-fotos-do-corpo.md` | **Fotos do corpo** | o protocolo (montagem, as nove poses), a sessão de fotos (câmera do app e do sistema, voz, contagem, clarão, foto preta, pose não guardada, fim), comparar (par padrão, par curto, recuou, lado a lado, cortina, sobrepor, ajustar a foto/enquadramento), a pergunta da gordura visual, onde os bytes moram (cache, poda, subida), as fotos no Agora e no Corpo | `o protocolo de fotos`, `comparar`, `ajustar uma foto`, `a câmera de dentro do app` em `main.jsx`; `src/dominio/protocolo.ts`, `enquadramento.ts`; `src/infra/corpo.ts`, `camera.ts`; `src/ui/telas/protocolo.jsx`, `camera.jsx`, `comparar.jsx`, `ajustefoto.jsx` |
| `09-semana.md` | **A Semana e a regra do nutricionista** | o veredito (ganho travado, rápido, na faixa), os portões, o passo de ±150 kcal (aplicar, desfazer, o arroz, um passo por evidência), a promessa da adesão, a força (tendência, "o app está cego"), a auditoria das trocas, a adesão dos 14 dias, o volume por músculo da semana, a tela Semana inteira | `DADOS` (veredito, ajuste), `marcos de adesão`, `forca` em `main.jsx`; `src/dominio/corpo.ts` (veredito, portões), `forca.ts`, `nutricao/calculo.ts` (ajuste no arroz, adesão); `src/ui/telas/semana.jsx` |
| `10-agora.md` | **O Agora (tela inicial)** | a composição do Agora: o cabeçalho (data, tipo do dia, palpite), o cartão de cima, a linha da comida, a água, o peso e as fotos (como linhas), os 14 dias, a decisão no Agora, os avisos (cópia, conta, gravação), o cardio (registrar, o de hoje, apagar), a faixa da sessão | `src/dominio/agora.ts`, `src/ui/telas/agora.jsx`, `cabeçalho de HOJE` e as funções do Agora em `main.jsx`, `src/ui/folhas/decidir.jsx` |
| `11-dias.md` | **Dias (o histórico por dia)** | o mês (células, leituras: dias com treino, cardio, horário de início), o dia aberto, a sessão passada (detalhe, corrigir no lugar, corrigir pelo histórico), registrar um treino passado, o cardio esquecido, a marca de descanso | `o MÊS em Dias`, `o DIA aberto`, `detalhe de uma sessão`, `corrigir no lugar`, `correção de sessão passada`, `registro retroativo`, `o lançamento de um treino passado` em `main.jsx`; `src/dominio/mes.ts`; `src/ui/telas/dias.jsx`, `dia.jsx`, `sessao.jsx`, `retroativo.jsx` |

Depois das onze: `00-visao-geral.md` (o mapa inteiro: as telas e os caminhos,
o modelo de dados com o dono de cada campo, a matriz de ligações e a proposta
dos serviços), feito pelo coordenador com o que os onze trouxerem, e a página
publicada com tudo.

## Checklist

- [x] Inventário mecânico (`_inventario.md`).
- [x] Brief do time (`00-brief.md`).
- [x] 01 · Fundação e plataforma
- [x] 02 · Sincronia e nuvem
- [x] 03 · A sessão de treino
- [x] 04 · Programa e prescrição de treino
- [x] 05 · A aula do box
- [x] 06 · Comida
- [x] 07 · Corpo e medidas
- [x] 08 · Fotos do corpo
- [x] 09 · A Semana e a regra do nutricionista
- [x] 10 · O Agora
- [x] 11 · Dias
- [x] Conferência de cobertura contra o inventário: 277/277 pontos de entrada, 446/446 funções de `main.jsx`, 34/34 campos, 63/63 de estado de tela; os 20 utilitários comuns que nenhuma área citou ficaram na visão geral (§7.3 e §8).
- [x] 00 · Visão geral (telas, dados, ligações, serviços, riscos ao dado)
- [x] Página publicada: https://claude.ai/artifact/3qJ4jhUn5MFwHKhkGTEugz

## Diário

- 14/10 · Pedido do dono; inventário e brief escritos; time de onze montado, os onze em paralelo, cada um escrevendo só o seu documento.
- 14/10 · Os onze pararam no limite de uso da conta, ainda lendo, sem escrever nada. Retomados em duas levas (01–06, depois 07–11) para não estourar de novo.
- 15/10 · A primeira leva escreveu os seis documentos e caiu no limite semanal só no relatório final; a segunda leva terminou inteira. Os 203 diagramas renderizam (conferidos com o Mermaid de verdade, `_pagina/checa.mjs`). Corrigido no 01 e no 02 o número de séries do corpo (são 12, não 7). Visão geral escrita e página publicada.

- 15/10 · O dono pediu para consertar os riscos ao dado. Os 17 (D1 a D17) e os 4 da regra calórica (R1 a R4) da visão geral foram corrigidos, um commit por peça, cada um com teste que falha no código anterior. A visão geral marca o commit de cada um.

## Como refazer a página

Quando um documento mudar, refaça a página e publique no mesmo endereço:

1. `npm i --no-save marked@12.0.2 mermaid@11.12.0` na raiz.
2. `node docs/mapa/_pagina/checa.mjs docs/mapa/*.md` — todo diagrama tem de renderizar.
3. `node docs/mapa/_pagina/monta.mjs . <saída.html> docs/mapa/_pagina/molde.html`.
4. Publicar o HTML gerado no artefato acima (o mesmo endereço).
