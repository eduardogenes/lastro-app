# 01 · Fatos

O único insumo do time que desenha sem ter visto o produto atual. Tudo aqui vem
do mundo, da prescrição de terceiros, do que o código hoje garante ou proíbe, ou
do que já deu errado com evidência. Nada aqui é escolha de apresentação, de
interação, de nome ou de voz.

Cada fato tem número (F) e fonte. A fonte é um caminho em `src/dominio/`,
`src/infra/`, `tests/`, `package.json`, `vite.config.js`, `src/sw.js`, um
hash de commit, ou uma resposta do dono em `02-perguntas.md` ("resposta do
dono, P11"). Onde está escrito **fonte à parte**, a prova existe, mas mora em
material que este time não lê; ela está registrada fora deste arquivo, com o
mesmo número.

As seções dizem a origem de cada bloco: **mundo** (a pessoa, o corpo, o lugar,
o aparelho), **prescrição** (o que o treinador e o nutricionista definiram),
**código** (o que o código atual calcula, guarda, garante ou proíbe) e **erro**
(o que já falhou de verdade).

---

## 1 · O produto, em fatos

**F1.** É uma ferramenta pessoal para registrar e executar duas prescrições
feitas fora do app: um programa de musculação de um treinador e um plano
alimentar de um nutricionista. — `src/dominio/programa.ts`,
`src/dominio/nutricao/alimentos.ts`

**F2.** O treinador e o nutricionista são dois agentes de IA que o próprio dono
criou, um para cada área. Ele fala com cada um quando quer; os dois não falam
entre si. O produto não cria prescrição: programa, regras de execução,
substitutos, prioridades e plano alimentar vêm desses agentes, de fora do app;
mudar qualquer um deles é decisão do dono, com ou sem o agente. — resposta do
dono, P9; `src/dominio/programa.ts`, `src/dominio/nutricao/alimentos.ts`

**F3.** A única mudança na comida que o produto calcula é um passo fixo de
±150 kcal definido pela regra escrita do nutricionista (§10). O passo não se
aplica sozinho: só entra no plano quando o usuário o aplica. —
`src/dominio/corpo.ts`, `0baad3d`

**F4.** O sinal de que a força está subindo, que a regra do nutricionista consome, é
calculável das cargas já registradas; não precisa ser declarado. Existe a
possibilidade de defini-lo à mão para quando o cálculo está cego (§10). —
`src/dominio/forca.ts`

**F5.** Há um único usuário, e ele é também quem mantém o código. —
`7cd6418`, `src/dominio/nutricao/alimentos.ts`

**F6.** Idioma: português do Brasil. Números com vírgula decimal, datas no
formato dia/mês, nomes de mês e de dia da semana em português. —
`src/dominio/formato.ts`, `tests/dominio/formato.test.ts`

**F7.** O usuário vive no fuso UTC−3. Datas tratadas como UTC jogam registros
feitos antes das 3h para o dia anterior. — `a4df1a6`

**F8.** O repositório começa em 07/08/2026; em 10/08 o programa tinha "quatro
dias de uso". O uso diário começou por volta de 06/08/2026. — `7cd6418`,
`063ecad`

**F9.** Não há outros usuários. A conta de sincronização existe só para ele, e a
criação pública de contas está desligada no serviço. — `4d3a5cb`

**F10.** O produto funciona inteiro sem conta e sem rede; sincronizar entre
aparelhos é opcional. — `src/infra/db.ts`, `7767d2b`,
`tests/fluxo/sincronia.test.js`

**F11.** É um aplicativo web servido como arquivos estáticos, sem servidor
próprio e sem dependência de rede em execução, instalado na tela de início do
iPhone e aberto pelo ícone. — `package.json`, `vite.config.js`, `src/sw.js`

---

## 2 · A pessoa, o corpo e o objetivo · mundo e prescrição

**F12.** Objetivo: hipertrofia com ganho de gordura controlado — ele está em
superávit calórico. — `tests/gerar-treino.js`, `src/dominio/formato.ts`

**F13.** Peso corporal na ordem de 71 a 74 kg (agosto de 2026); valores reais e
de exemplo nos registros do projeto: 70,0; 71,5; 73,4; 73,6; 73,8; 74,3. —
`cc8963f`, `e443697`, `tests/fluxo/corpo.test.js`

**F14.** O peso varia cerca de 1% em torno da média; a flutuação de água de um
dia para outro passa de 1 kg, enquanto o ganho que se quer enxergar é da ordem
de centenas de gramas por semana (intervalo-alvo do nutricionista: +0,15 a +0,30
kg/semana). — `cc8963f`, `src/dominio/nutricao/calculo.ts`, `src/dominio/corpo.ts`

**F15.** Prioridades estéticas definidas pelo treinador, em níveis: máxima —
peitoral superior e deltoide lateral; secundária — dorsal (largura),
panturrilha, posterior de coxa, glúteo; direcionada (trabalho direto em volume
controlado) — deltoide anterior; normal — peito, glúteo médio, adutores, bíceps,
tríceps, abdômen, costas (espessura), deltoide posterior; ponto forte —
quadríceps; estímulo indireto basta — trapézio, tibial. — `src/dominio/programa.ts`

**F16.** Dorsal é largura e "costas espessura" é espessura: objetivos diferentes
dentro do programa. — `src/dominio/programa.ts`

**F17.** Ressalva do treinador: prioridade não significa obrigatoriamente mais
séries brutas toda semana; também se expressa em seleção de exercício, posição
no treino, frequência, qualidade da série e estímulo indireto. Prioridade não é
permanente: quando uma região deixar de ser deficiência, a programação muda. —
`src/dominio/volume.ts`, `src/dominio/programa.ts`

**F18.** Critério de sucesso do treinador para os próximos meses: peso subindo
bem devagar, cintura estável, progressão clara em peito superior, deltoide
lateral, dorsal e panturrilha, e a mudança aparecendo relaxado, não só em pose.
Alvo visual: mais preenchimento clavicular, ombros mais largos, o V aparecendo
relaxado, panturrilha acompanhando a coxa. — `src/dominio/programa.ts`

**F19.** O risco que o produto existe para conter: músculo fica forte mais
rápido do que tendão se adapta. Tendão responde a tensão ao longo do tempo, não
a peso jogado. — `src/dominio/programa.ts`, `package.json`

**F20.** Dor muscular difusa no dia seguinte é normal; dor pontual em cotovelo,
ombro da frente ou joelho abaixo da patela é sinal de tendão. Esses três pontos
são os que se acompanham. — `src/dominio/programa.ts`

---

## 3 · Onde, quando e como o uso acontece · mundo

**F21.** Semana típica: musculação nos dias úteis e uma aula de condicionamento
(HYROX) num box por semana, na quinta ou no sábado, sem dia fixo — às vezes nos
dois dias, o que é raro; domingo de descanso. A prescrição conta seis dias
ativos, com a aula no sábado. — resposta do dono, P4; `src/dominio/programa.ts`,
`src/dominio/dia.ts`

**F22.** Com descanso fixo no domingo, qualquer contagem de dias seguidos de
treino zera toda semana. — `src/dominio/dia.ts`

**F23.** Horário habitual da musculação: 6h15 às cerca de 7h30. —
`src/dominio/nutricao/alimentos.ts`

**F24.** Em alguns dias o treino acontece à tarde (12h15) ou à noite (18h15). —
`src/dominio/nutricao/alimentos.ts`

**F25.** A academia de musculação fica num subsolo com sinal de celular ruim. —
`src/sw.js`, `vite.config.js`

**F26.** É uma academia grande, com várias máquinas parecidas para o mesmo
movimento ("qual das três puxadas desta academia"); máquina ocupada é situação
comum. — `src/infra/fotos.ts`, `src/dominio/programa.ts`

**F27.** Às vezes ele treina em outra academia, ou encontra máquina quebrada. —
`8b300ad`

**F28.** Durante a musculação ele está de pé, com uma mão livre, suado. —
`src/dominio/formato.ts`

**F29.** Entre séries há de 1:30 a 3 min de descanso prescrito. O critério real
do treinador é voltar quando der para fazer outra série de alta qualidade. —
`src/dominio/programa.ts`

**F30.** Entre séries, além de registrar, ele marca água, confere o que falta
comer e olha o peso. — `d6bfcc2`

**F31.** Uma sessão de musculação dura, em mediana, cerca de 75 min líquidos
(sem pausas). O treinador considera sinal de fadiga sessões passando
consistentemente de 90 min. — `src/dominio/nutricao/calculo.ts`,
`src/dominio/programa.ts`

**F32.** Exemplo real de horário de sessão: começo às 06:22, fim às 07:31. —
`5373381`

**F33.** Por sessão de musculação se registram de 14 a 22 séries prescritas,
cada uma com dois números (carga e repetições) e, opcionalmente, o RIR. —
`src/dominio/programa.ts`, `src/dominio/tipos.ts`

**F34.** Às vezes ele esquece de encerrar a sessão: guarda o celular e só reabre
o app no dia seguinte. — `893e2c3`

**F35.** Às vezes ele registra o treino errado e depois o certo no mesmo dia. —
`02077e3`

**F36.** Na aula do box não há pausa para registrar entre rounds: o coach chama
o próximo e o celular fica na mochila. A janela real de registro é depois da
aula, sentado, ofegante, e é curta. — `2d99365`

**F37.** O conteúdo da aula de HYROX não é conhecido de véspera: quem programa
é o box, e ele descobre o que vai ser quando chega, olhando a lousa. —
`a72e31d`, `a141811`

**F38.** Pré-treino às 5h45 nos dias de treino; a pessoa dorme por volta das
23h. — `src/dominio/nutricao/alimentos.ts`, `src/dominio/nutricao/calculo.ts`

**F39.** O café da manhã das 8h foi montado para não depender de fogão no
trabalho: ele come no trabalho. — `src/dominio/nutricao/alimentos.ts`

**F40.** Ao longo do dia, fora do treino, o uso é sentado e sem pressa: marcar
refeição, conferir o que falta comer, olhar peso. — fonte à parte

**F41.** Reorganizar o programa de treino é atividade feita sentado, em casa. —
`0f71a6d`

**F42.** Pesagem: sempre de manhã, antes de treinar, em semi-jejum (depois de
comer algo leve antes do treino), com o mesmo tipo de roupa. A prescrição pede
3 a 4 pesagens por semana. — resposta do dono, P6; `src/dominio/corpo.ts`,
`tests/gerar-treino.js`

**F43.** Cintura: medida com fita métrica, que erra de posicionamento mais do
que a balança varia de água. Até 21/09/2026 ela entrava na regra do
nutricionista, com limite de variação de 1,5 cm no mês e prioridade sobre o
peso. — `src/dominio/corpo.ts`, `ddec1f8`

**F44.** Até 01/10/2026 a cintura não era medida porque ele não tinha fita
métrica; ele comprou uma e passa a medir. — resposta do dono, P6

**F45.** As fotos de progresso do corpo são tiradas por ele sozinho, a
cerca de 3 m do celular apoiado; ele não alcança o aparelho para disparar. —
`a46f429`

**F46.** Cardio: duas vezes por semana, depois da musculação — segunda depois do
treino A (20 a 25 min) e quinta depois do treino D (25 a 30 min). Leve a
moderado: respirando mais forte, mas ainda conseguindo conversar. Nunca antes do
treino; evitar antes do treino de pernas (B) e da aula de HYROX. —
`src/dominio/programa.ts`

**F47.** Modalidades de cardio: bike, esteira inclinada, elíptico, remo. Cada
registro tem modalidade, minutos e intensidade (leve ou moderado). Exemplo: 25
min de bike, moderado. — `src/dominio/programa.ts`, `src/dominio/tipos.ts`,
`tests/fluxo/cardio.test.js`

**F48.** O cardio existe por saúde cardiovascular, capacidade de trabalho e
apetite; não é para queimar caloria, e não é HIIT. — `src/dominio/formato.ts`,
`tests/gerar-treino.js`

---

## 4 · Aparelho, navegador e rede · mundo

**F49.** Aparelho do dono: iPhone 11 Pro Max — display de 6,5 polegadas, 2688 ×
1242 pixels, área útil de 414 × 896 pontos em retrato, densidade 3×, com
entalhe no topo e indicador de início na base. — resposta do dono, P11;
especificação pública do modelo

**F50.** O dono usa bastante o app pela web, num notebook, sobretudo para
acompanhar os registros. Não tem iPad. — resposta do dono, P11;
`src/dominio/sincronia.ts`

**F51.** Navegador: Safari do iOS. O app é instalado pela opção "Adicionar à
Tela de Início" do Safari e aberto pelo ícone. — `7cd6418`, `src/infra/camera.ts`

**F52.** Instalado na tela de início, o histórico fica fora da regra do Safari
que apaga dados de sites depois de 7 dias sem uso; aberto como site comum, não
fica. — `7cd6418`

**F53.** O armazenamento local do navegador tem teto de cerca de 5 MiB no
Safari. — `src/infra/fotos.ts`, `src/dominio/tipos.ts`

**F54.** O armazenamento de arquivos do navegador (Cache Storage) pode ser
esvaziado pelo iOS sob pressão de disco. — `src/infra/corpo.ts`

**F55.** No modo privado do Safari o armazenamento local é recusado; o app ainda
roda, mas nada sobrevive ao fechar. — `src/infra/db.ts`

**F56.** Os dados locais pertencem ao endereço de onde o app é servido; um
endereço novo abre um app vazio, e o ícone antigo continua apontando para o
endereço velho. — `4c561ee`

**F57.** O iOS suspende o JavaScript com o aparelho bloqueado ou o app em segundo
plano: contadores param, só o relógio de parede continua. — `tests/fluxo/cronometro.test.js`

**F58.** O Safari do iOS não vibra pelo navegador. Som só toca se o contexto de
áudio tiver sido criado dentro de um toque do usuário. —
`tests/fluxo/cronometro.test.js`, `7cd6418`

**F59.** Manter o display aceso por pedido do app só funciona em app instalado a
partir do iOS 18.4; antes disso, falha sem aviso. — `7cd6418`

**F60.** O iOS não respeita a trava de orientação declarada por app web e não
oferece trava programática: o telefone pode ir para paisagem a qualquer momento.
— `aacb602`, `71287cb`

**F61.** O Safari dá zoom automático ao focar um campo de texto com fonte menor
que 16 px. — `2dfa938`

**F62.** No Safari existem zoom por toque duplo e por pinça (a pinça é gesto
próprio do WebKit), e segurar o dedo sobre texto seleciona e oferece copiar.
— `97395ec`

**F63.** No teclado do iPhone em português, a vírgula é o separador decimal
("22,5"); um campo numérico do tipo `number` descarta a vírgula e entrega vazio.
— `7cd6418`, `tests/fluxo/corpo.test.js`

**F64.** Digitar acento no teclado do iPhone exige segurar a tecla e escolher;
de pé, com uma mão e suado, isso não acontece. — `71112a6`

**F65.** O teclado numérico do iPhone cobre cerca de metade da altura do
aparelho. — `be11dcb`

**F66.** No iOS, elementos fixados na janela sobem junto com o teclado aberto e
passam a cobrir o conteúdo acima dele. — fonte à parte

**F67.** O seletor de data nativo do iPhone é uma roda de dia, mês e ano. —
`ccc6299`

**F68.** O aparelho reserva o topo (hora, sinal, bateria) e a base (indicador de
início) ao sistema. — `2105a2e`, resposta do dono, P11 (modelo)

**F69.** No Android (tecla e gesto de voltar) e no gesto de borda do Safari, "voltar" age
sobre o histórico do navegador; um app instalado que não registra histórico
fecha no primeiro "voltar". — `a00aaf1`

**F70.** Publicada uma versão nova, o iPhone ainda serve a anterior por uma ou
duas aberturas. — `028fab0`, `bc0bb17`

**F71.** O mecanismo que permite abrir sem rede (service worker) só existe em
HTTPS. — `src/infra/fotos.ts`

**F72.** Depois da primeira abertura com internet, o app abre e grava sem rede.
Rede só é necessária para sincronizar, para baixar foto feita em outro aparelho
e para receber atualização. — `src/sw.js`, `tests/fluxo/publicacao.test.js`,
`tests/fluxo/sincronia.test.js`

**F73.** O tempo de abertura é restrição declarada: ele abre o app às 6h15 no
subsolo, e o peso do código é orçamento de tempo de abertura (o runtime de
interface usado pesa cerca de 4 kB). — `vite.config.js`

**F74.** Uma foto de iPhone chega com cerca de 3 MB e cerca de 4000 × 3000 px. —
`src/infra/fotos.ts`, `tests/fluxo/dubles.js`

**F75.** Safari antigo não codifica WebP; nesse caso a imagem sai em JPEG. —
`src/dominio/tipos.ts`, `src/infra/fotos.ts`

**F76.** A câmera ao vivo do navegador entrega frames de vídeo, com menos
qualidade que a câmera nativa (sem HDR, sem fusão de exposições). A câmera
nativa entrega a melhor qualidade, mas durante a captura o app não existe e não
pode mostrar nada. — `src/infra/camera.ts`

**F77.** Pedir a câmera pode resultar em: navegador sem suporte; permissão
negada (resolve-se nos ajustes); câmera ocupada por outro app; nenhuma câmera
disponível; falha genérica. Enquanto a câmera fica ligada, o iOS mantém o
indicador aceso, mesmo com o app fora da frente. — `src/infra/camera.ts`

**F78.** Capturar antes de o vídeo ter o primeiro frame produz imagem preta. —
`src/infra/camera.ts`

**F79.** O app também pode rodar embutido no Claude.ai, usando o armazenamento
de lá com cópia no navegador. — `src/infra/db.ts`

---

## 5 · A prescrição de treino · prescrição

**F80.** Programa vigente (desde a revisão de 21/09/2026): cinco
treinos de musculação, identificados pelas letras A a E, mais a aula de HYROX,
em sequência fixa A → B → C → D → E → aula; a prescrição situa a aula no sábado.
— `src/dominio/programa.ts`

**F81.** A sequência avança pela ordem, não pelo dia da semana: o próximo treino
é sempre o seguinte ao último treino da prescrição registrado. Treino fora da
prescrição não move a sequência. — `src/dominio/dia.ts`

**F82.** A ordem carrega a prioridade: deltoide lateral na segunda e na quinta,
nunca em dias seguidos; a sexta é curta de propósito porque a prescrição conta
com a aula no dia seguinte, sábado.
— `src/dominio/programa.ts`

**F83.** Volume prescrito: 90 séries diretas por semana em 36 posições, com 31
exercícios distintos (cinco aparecem em dois treinos). Por treino: A — 8
exercícios, 20 séries; B — 9, 22; C — 7, 17; D — 6, 17; E — 6, 14; aula — sem
conteúdo prescrito. — `src/dominio/programa.ts`

**F84.** Treino A — Peito superior + dorsais + lateral + tríceps.
— `src/dominio/programa.ts`

| # | exercício | séries × repetições | RIR alvo | descanso | músculo | carregamento | composto |
|---|---|---|---|---|---|---|---|
| 1 | Chest press inclinado convergente | 3 × 6–10 | 1–2 | 3 min | peito superior | carga selecionada na máquina | sim |
| 2 | Pulldown convergente | 3 × 6–10 | 1–2 | 2:30 | dorsal | carga selecionada na máquina | sim |
| 3 | Crucifixo inclinado no cabo | 2 × 10–15 | 1 | 2 min | peito superior | carga selecionada na máquina | não |
| 4 | Pulldown unilateral | 2 × 8–12 | 1 | 2 min | dorsal | carga selecionada na máquina | sim |
| 5 | Elevação lateral na máquina | 3 × 10–15 | 1 | 1:45 | deltoide lateral | carga selecionada na máquina | não |
| 6 | Elevação lateral unilateral no cabo | 3 × 12–20 | 0–1 | 1:30 | deltoide lateral | carga selecionada na máquina | não |
| 7 | Extensão de tríceps acima da cabeça no cabo | 2 × 8–12 | 1 | 2 min | tríceps | carga selecionada na máquina | não |
| 8 | Pushdown | 2 × 10–15 | 0–1 | 1:45 | tríceps | carga selecionada na máquina | não |

**F85.** Treino B — Pernas completas + panturrilhas. — `src/dominio/programa.ts`

| # | exercício | séries × repetições | RIR alvo | descanso | músculo | carregamento | composto |
|---|---|---|---|---|---|---|---|
| 1 | Agachamento no Smith | 2 × 6–10 | 1–2 | 3 min | quadríceps | anilhas de um lado, sem barra | sim |
| 2 | Cadeira flexora sentada | 4 × 8–12 | 1 | 2 min | posterior de coxa | carga selecionada na máquina | não |
| 3 | Terra romeno no Smith | 3 × 6–10 | 1–2 | 3 min | posterior de coxa | anilhas de um lado, sem barra | sim |
| 4 | Leg press | 2 × 10–15 | 1–2 | 2:30 | quadríceps | anilhas de um lado, sem barra | sim |
| 5 | Cadeira extensora | 1 × 10–15 | 0–1 | 2 min | quadríceps | carga selecionada na máquina | não |
| 6 | Elevação pélvica na máquina | 3 × 8–12 | 1 | 2:30 | glúteo | anilhas de um lado, sem barra | sim |
| 7 | Adutora | 2 × 10–15 | 1 | 1:45 | adutores | carga selecionada na máquina | não |
| 8 | Panturrilha em pé | 3 × 6–10 | 1 | 2 min | panturrilha | carga selecionada na máquina | não |
| 9 | Panturrilha sentada | 2 × 10–15 | 1 | 1:45 | panturrilha | anilhas de um lado, sem barra | não |

**F86.** Treino C — Costas + deltoides + bíceps. — `src/dominio/programa.ts`

| # | exercício | séries × repetições | RIR alvo | descanso | músculo | carregamento | composto |
|---|---|---|---|---|---|---|---|
| 1 | Remada para dorsal com apoio de peito | 3 × 6–10 | 1–2 | 2:30 | dorsal | anilhas de um lado, sem barra | sim |
| 2 | High row com apoio de peito | 3 × 8–12 | 1–2 | 2:30 | costas (espessura) | anilhas de um lado, sem barra | sim |
| 3 | Pullover em máquina ou cabo | 2 × 10–15 | 1 | 2 min | dorsal | carga selecionada na máquina | não |
| 4 | Reverse pec deck | 3 × 12–20 | 0–1 | 1:45 | deltoide posterior | carga selecionada na máquina | não |
| 5 | Elevação frontal unilateral no cabo | 2 × 10–15 | 1 | 1:30 | deltoide anterior | carga selecionada na máquina | não |
| 6 | Rosca Scott na máquina | 2 × 8–12 | 1 | 1:45 | bíceps | carga selecionada na máquina | não |
| 7 | Rosca martelo | 2 × 10–15 | 1 | 1:45 | bíceps | um halter em cada mão | não |

**F87.** Treino D — Especialização: lateral + panturrilha + abdômen.
— `src/dominio/programa.ts`

| # | exercício | séries × repetições | RIR alvo | descanso | músculo | carregamento | composto |
|---|---|---|---|---|---|---|---|
| 1 | Elevação lateral na máquina | 3 × 10–15 | 1 | 1:45 | deltoide lateral | carga selecionada na máquina | não |
| 2 | Elevação lateral unilateral no cabo | 3 × 12–20 | 0–1 | 1:30 | deltoide lateral | carga selecionada na máquina | não |
| 3 | Panturrilha sentada | 3 × 8–15 | 1 | 1:45 | panturrilha | anilhas de um lado, sem barra | não |
| 4 | Panturrilha em pé | 2 × 8–12 | 1 | 1:45 | panturrilha | carga selecionada na máquina | não |
| 5 | Crunch no cabo ou máquina | 3 × 8–15 | 1 | 1:45 | abdômen | carga selecionada na máquina | não |
| 6 | Elevação de pernas ou reverse crunch | 3 × 10–15 | 1 | 1:30 | abdômen | peso corporal (+ carga opcional) | não |

**F88.** Treino E — Peito superior + costas + braços. — `src/dominio/programa.ts`

| # | exercício | séries × repetições | RIR alvo | descanso | músculo | carregamento | composto |
|---|---|---|---|---|---|---|---|
| 1 | Supino inclinado no Smith | 3 × 6–10 | 1–2 | 3 min | peito superior | anilhas de um lado, sem barra | sim |
| 2 | Remada convergente com apoio de peito | 3 × 8–12 | 1–2 | 2:30 | costas (espessura) | anilhas de um lado, sem barra | sim |
| 3 | Chest press horizontal convergente | 2 × 8–12 | 1 | 2:30 | peito | carga selecionada na máquina | sim |
| 4 | Crossover de baixo para cima | 2 × 10–15 | 1 | 1:45 | peito superior | carga selecionada na máquina | não |
| 5 | Rosca Bayesian no cabo | 2 × 10–15 | 1 | 1:45 | bíceps | carga selecionada na máquina | não |
| 6 | Extensão de tríceps acima da cabeça no cabo | 2 × 10–15 | 1 | 1:45 | tríceps | carga selecionada na máquina | não |

**F89.** Séries diretas por músculo na semana prescrita: deltoide lateral 12;
peito superior 10; dorsal 10; panturrilha 10; posterior de coxa 7; tríceps 6;
costas (espessura) 6; bíceps 6; abdômen 6; quadríceps 5; glúteo 3; deltoide
posterior 3; adutores 2; deltoide anterior 2; peito 2. — `src/dominio/programa.ts`,
`src/dominio/volume.ts`

**F90.** A contagem é de séries diretas. Tríceps também trabalha nos supinos,
bíceps nas puxadas, glúteo no terra e no leg press; o estímulo real desses é
maior que o número. — `src/dominio/volume.ts`

**F91.** Intervalos de repetição em uso: 6–10, 8–12, 10–15, 12–20, 8–15. Séries
por exercício: de 1 a 4. RIR alvo: 1–2 nos compostos, 1 ou 0–1 nos isoladores.
— `src/dominio/programa.ts`

**F92.** Descanso por categoria do treinador: grandes compostos 3 min; máquinas
multiarticulares 2:30; intermediários 2 min; isoladores 1:45; curtos 1:30. —
`src/dominio/programa.ts`

**F93.** Cada exercício prescrito traz uma orientação de execução na voz do
treinador, de 22 a 243 caracteres (mediana 88). Exemplos: "Pausa no topo com o
queixo para dentro." / "Joelho flexionado, para o sóleo. Pause no alongamento.
Nada de quicar." / "Primeiro exercício da semana, no melhor momento de
desempenho que existe. Banco a 20 ou 30° se a máquina permitir: mais que isso
vira desenvolvimento de ombro." — `src/dominio/programa.ts`

**F94.** Regra do treinador — RIR: compostos a 1–2 da falha; isoladores podem ir
a 0–1 nas últimas séries; falha é ferramenta, não definição de série eficiente;
o RIR registrado diz se ele está produzindo mais trabalho de qualidade com o
tempo ("55 kg × 10" sozinho não diz). — `src/dominio/programa.ts`

**F95.** Regra do treinador — dupla progressão: mantém a carga e sobe
repetições até bater o topo do intervalo em todas as séries (ex.: 55 kg em
9/8/7, depois 10/9/8, depois 10/10/10); só então sobe a carga no menor
incremento prático da máquina e recomeça perto da base (algo como 8/7/6). Não
sobe carga por uma repetição feia; a progressão precisa manter amplitude,
técnica, alvo muscular e o RIR planejado. — `src/dominio/programa.ts`

**F96.** Regra do treinador — excêntrica controlada em tudo: descer devagar é o
principal escudo contra lesão e aumenta o estímulo. — `src/dominio/programa.ts`

**F97.** Regra do treinador — descanso pelo desempenho: o tempo prescrito é
lembrete, não ordem. — `src/dominio/programa.ts`

**F98.** Regra do treinador — não trocar exercício toda semana: manter os
principais por 6 a 8 semanas, desde que não provoquem dor articular, ele sinta e
progrida no músculo alvo, a máquina siga disponível e a técnica esteja
melhorando. — `src/dominio/programa.ts`

**F99.** Regra do treinador — não acrescentar séries agora: extrair progresso
das 90 semanais; só considerar 1 a 2 séries a mais num músculo específico
estagnado, depois de várias exposições, com recuperação boa, sem dor e
desempenho não caindo. — `src/dominio/programa.ts`

**F100.** Regra do treinador — a aula de HYROX é o sexto treino, não um extra; as
estações da aula não são séries de hipertrofia e não contam no volume por
músculo; nada de musculação pesada depois dela. — `src/dominio/programa.ts`

**F101.** Regra do treinador — fadiga: sinais que aparecem juntos são queda de
repetições ou carga por 2 a 3 sessões, o mesmo exercício piorando, dor muscular
por mais de 72 h, queda de disposição, cotovelo, ombro ou joelho reclamando,
dificuldade de manter o RIR; e, nesta versão, a aula de HYROX comprometendo a terça e
sessões passando de 90 min. A primeira mexida é na dose, não em trocar
exercícios. — `src/dominio/programa.ts`

**F102.** Regra do treinador — dor de tendão: apareceu, tirar aquele exercício
por 2 semanas e substituir por outro ângulo; nunca empurrar por cima. —
`src/dominio/programa.ts`

**F103.** Regra do treinador — aproximação (aquecimento específico): antes do
primeiro exercício pesado, 3 a 4 séries (carga bem leve × 8–10; 50–60% da carga
de trabalho × 5; 70–80% × 2–4); no segundo exercício grande, 1 a 2; isoladores
no fim normalmente nenhuma. Séries de aproximação não entram no volume e não se
registram. — `src/dominio/programa.ts`

**F104.** Regra do treinador — deload por evidência, não por calendário: com
evidência clara de fadiga, 5 a 7 dias com 50–60% das séries habituais, mesmas
técnicas, 3 a 4 de RIR, sem falha; depois volta. Progredindo, segue treinando.
— `src/dominio/programa.ts`

**F105.** Bi-set (dois exercícios encadeados sem descanso entre eles) é
possível no formato do programa; a prescrição vigente não tem nenhum. —
`src/dominio/tipos.ts`, `src/dominio/programa.ts`

**F106.** Substitutos: cada exercício prescrito tem 2 ou 3 substitutos do mesmo
padrão de movimento, e cada substituto vem com uma frase do que muda ao trocar
(15 a 135 caracteres). No total, 48 exercícios têm substitutos e há 143
substituições. Substituto não é equivalente: mantém alvo e função com a
mecânica mais próxima disponível. — `src/dominio/programa.ts`,
`tests/dominio/volume.test.ts`

**F107.** Substitutos por exercício prescrito (marcados com * os indicados pelo
próprio treinador). — `src/dominio/programa.ts`

- Chest press inclinado convergente: Supino inclinado no Smith*; Máquina de supino inclinado*; Supino inclinado com halteres
- Pulldown convergente: Puxada neutra no cabo*; Puxada neutra na máquina; Barra fixa assistida pegada neutra
- Crucifixo inclinado no cabo: Pec deck*; Crossover de baixo para cima; Crucifixo inclinado com halteres
- Pulldown unilateral: Puxada neutra unilateral*; Puxada unilateral na polia alta; Remada unilateral na polia alta ajoelhado
- Elevação lateral na máquina: Elevação lateral unilateral no cabo*; Elevação lateral no cabo; Elevação lateral com halteres
- Elevação lateral unilateral no cabo: Elevação lateral na máquina*; Elevação lateral com halteres; Elevação lateral deitado no banco inclinado
- Extensão de tríceps acima da cabeça no cabo: Extensão acima da cabeça ou máquina de tríceps*; Tríceps francês com halter; Tríceps testa com barra W
- Pushdown: Tríceps corda na polia; Tríceps barra reta na polia; Mergulho na máquina assistida
- Agachamento no Smith: Agachamento hack*; Belt squat*
- Cadeira flexora sentada: Cadeira flexora sentada de outro modelo*; Mesa flexora deitada; Flexora unilateral em pé
- Terra romeno no Smith: Terra romeno com barra*; Terra romeno com halteres*; Good morning no Smith
- Leg press: Agachamento hack*; Leg press 45°; Leg press horizontal
- Cadeira extensora: Extensora unilateral; Sissy squat na máquina; Leg press com pé baixo
- Elevação pélvica na máquina: Hip thrust no Smith*; Elevação pélvica com barra; Coice na máquina
- Adutora: Adutora em pé na polia; Agachamento sumô no Smith; Leg press com pé afastado
- Panturrilha em pé: Panturrilha no Smith*; Panturrilha no hack*; Panturrilha na máquina em pé
- Panturrilha sentada: Panturrilha sentada na máquina*; Panturrilha sentada no Smith*; Panturrilha no leg press com joelho flexionado
- Remada para dorsal com apoio de peito: Remada unilateral apoiada*; Remada baixa na polia com triângulo; Remada sentada pegada neutra fechada
- High row com apoio de peito: Remada alta na máquina*; Remada na polia alta sentado; Remada cavalinho pegada larga
- Pullover em máquina ou cabo: Straight-arm pulldown*; Pullover na polia alta; Pullover com halter no banco
- Reverse pec deck: Crucifixo inverso no cabo; Crucifixo inverso com halteres no banco inclinado; Face pull na polia alta
- Elevação frontal unilateral no cabo: Elevação frontal na máquina*; Elevação frontal bilateral no cabo*; Elevação frontal com halteres
- Rosca Scott na máquina: Rosca Scott no cabo*; Rosca Scott com barra W; Rosca concentrada
- Rosca martelo: Rosca martelo na corda; Rosca inversa na barra W; Rosca martelo cruzada
- Crunch no cabo ou máquina: Máquina de abdominal*; Abdominal na polia alta ajoelhado; Crunch com anilha no colo
- Elevação de pernas ou reverse crunch: Elevação de pernas suspenso; Reverse crunch no banco declinado; Elevação de pernas no banco
- Supino inclinado no Smith: Chest press inclinado convergente*; Supino inclinado com halteres; Supino inclinado com barra
- Remada convergente com apoio de peito: Remada cavalinho; Remada na máquina com apoio de peito; Remada curvada com barra
- Chest press horizontal convergente: Supino reto na máquina; Supino reto com halteres; Supino no Smith
- Crossover de baixo para cima: Crucifixo inclinado no cabo*; Crossover na polia baixa; Peck deck com banco inclinado
- Rosca Bayesian no cabo: Rosca no cabo*; Rosca inclinada com halteres; Rosca Scott na máquina

**F108.** Exemplos da frase do que muda ao trocar: "Mesmo ângulo, trajetória
travada." / "Sem apoio: lombar entra na conta." / "Muito mais custo
sistêmico." / "Perde tensão embaixo, ganha no topo." — `src/dominio/programa.ts`

**F109.** Os substitutos são escolhidos sob pressão, com a máquina ocupada, e
quase nunca foram executados antes. — `7788df4`

**F110.** O exercício é definido pela máquina da academia dele, não pelo nome
genérico: "qual das três puxadas desta academia é a que o treinador quis
dizer". — `src/infra/fotos.ts`

**F111.** Alguns nomes da prescrição são ambíguos ("Pullover em máquina ou
cabo", "Crunch no cabo ou máquina", "Elevação de pernas ou reverse crunch").
Nomes de exercício do repertório têm de 5 a 49 caracteres (mediana 23); os
prescritos, de 7 a 43. — `src/dominio/programa.ts`

**F112.** Orientação de pegada ou de posição do pé: não vem do treinador. Foi
levantada por duas revisões independentes (uma de musculação, outra de educação
física). Onde o treinador já falou de pegada, a palavra dele vence. Onde uma
frase curta seria verdadeira e enganosa (terra romeno, supino no Smith, rosca
Scott, entre outros), não existe orientação. — `src/dominio/programa.ts`

**F113.** Dos 31 exercícios prescritos, 13 têm orientação de pegada, 7 têm
orientação de posição do pé (agachamento, flexora, leg press, extensora,
elevação pélvica, as duas panturrilhas) e 11 não têm nenhuma. No repertório
inteiro, 53 têm. Textos de 29 a 55 caracteres. Exemplos: "neutra nos pegadores
verticais, pronada nos horizontais"; "empurre com o cotovelo, não com a mão";
"punho neutro; pare na altura do ombro"; pé: "largura dos ombros, e a mesma
posição entre as sessões"; "antepé na borda, pés paralelos"; "mão sobre mão;
nunca enrole a corda no braço". — `src/dominio/programa.ts`

**F114.** Na perna, a decisão relevante é a posição do pé (é ela que interage
com o tendão patelar), não a da mão. — `src/dominio/programa.ts`

**F115.** Dezessete exercícios saíram do programa nas revisões e continuam
existindo, com músculo e histórico (ex.: Pendulum squat, Mesa flexora deitada,
Panturrilha no leg press, Ab wheel, Pec deck, Encolhimento na máquina,
Abdutora, Tibial anterior); vários seguem como substitutos indicados. —
`src/dominio/programa.ts`

**F116.** O repertório de exercícios conhecidos pelo código tem 182 itens: as
posições do programa, todos os substitutos, os que saíram, as 9 estações da
prova de HYROX e 17 movimentos comuns de box. Vinte e seis deles não têm músculo
atribuído (são condicionamento). — `src/dominio/programa.ts`

**F117.** Cada exercício é identificado para sempre por um código gerado do
nome na primeira vez (sem acento, minúsculas, hífens). Renomear depois muda só o
nome exibido, nunca o código; o histórico continua junto. — `src/dominio/programa.ts`,
`tests/fluxo/edicao.test.js`

---

## 6 · A aula de HYROX · mundo

**F118.** A aula é de HYROX, num box (academia de cross-training), uma vez por
semana, na quinta ou no sábado: condicionamento variado, que muda toda semana,
mas em que os mesmos 6 a 8 movimentos voltam. — `00e7fa3`, `src/dominio/programa.ts`, resposta do dono, P4

**F119.** As nove estações da prova HYROX, com a quantidade da prova: corrida 8 ×
1000 m; ski erg 1000 m; sled push 50 m; sled pull 50 m; burpee broad jump 80 m;
remo ergômetro 1000 m; farmers carry 200 m; lunges com sandbag 100 m; wall balls
100 repetições. A prova inteira não é o que se faz na aula. —
`src/dominio/programa.ts`

**F120.** Na prova o que pontua é o relógio: a distância e as repetições são
fixas, o tempo é o que melhora. Exemplo de registro: 1 km de corrida em 4:12 =
252 s. — `src/dominio/programa.ts`

**F121.** Movimentos comuns de aula, com a quantidade que o box costuma passar:
assault bike 15 cal; bike erg 15 cal; kettlebell swing 20; thruster 15; devil
press 10; clean and jerk 10; push press 12; snatch com halter 20; burpee 20; box
jump 20; double under 50; pula-corda 100; air squat 30; sit-up 25; mountain
climber 40; lunge 50 m; prancha 60 s. — `src/dominio/programa.ts`

**F122.** O que ele procura para registrar uma aula, em ordem de frequência: corrida, wall
balls, remo, ski erg, sled push, sled pull, farmers carry, lunges com sandbag,
burpee broad jump, kettlebell swing, box jump, burpee, assault bike, bike erg,
double under, thruster. — `src/dominio/programa.ts`

**F123.** Os pesos usados no box (wall ball, sandbag, kettlebell, farmers) ficam
os mesmos por meses; a melhor referência de carga é o próprio registro
anterior. — `src/dominio/programa.ts`, `4602039`

**F124.** A lousa do box é escrita para quem está na aula, cheia de
abreviações: RNDS (rounds), WB (wall ball), BBJ (burpee broad jump), FC
(farmers carry), WL (walking lunges), DB (halter), T.C (time cap), E5MIN e EMOM
(a cada 5 minutos, a cada minuto), # (libras: 50# ≈ 22,7 kg), (20/15) (peso
sugerido para homem/mulher, em kg). — `f642302`, `4602039`

**F125.** Formatos de aula em uso no mundo: AMRAP longo, blocos de AMRAP, EMOM,
E3MOM, compromised running, dupla dividindo repetições, engine, híbrido de
força. — `11981e2`

**F126.** Lousa real 1 — "HYROX MZ!", 20/09/2026: PLIO + SPRINT (15MIN): 3X 15
SQUAT JUMP + 200M (20/15) REST 1MIN; 3X 12 SPLIT JUMP + 300M (20/15) REST 1MIN ·
WOD — T.C 20MIN: 150 WALL BALL; 100M BURPEES BROAD JUMP; 80 ABD (REMADOR)
(10/5); 1KM RUN. Corrida aparece três vezes com distâncias diferentes; três dos
seis movimentos eram desconhecidos. — `11981e2`

**F127.** Lousa real 2 — "Hyrox Friday": 3 RNDS: 400 m Ski · 30 m Sled-Push · 25
m Walking Lunges / 3 RNDS: 400 m Row · 30 m Sled-Pull · 25 Wall Ball / 3 RNDS:
400 m Run · 30 m Farmers Carry · 25 m [ilegível] / E5MIN = 15 m Burpee Broad
Jumps. Nenhum movimento desconhecido. — `f642302`

**F128.** Até 21/09/2026 havia quatro lousas reais transcritas; só a primeira
trouxe movimento desconhecido. Peso já apareceu em kg e em libras. — `f642302`

**F129.** Num mesmo round, movimentos diferentes se medem em unidades
diferentes (ski em metros, wall ball em repetições). — `f642302`,
`tests/fluxo/aulaimport.test.js`

**F130.** A lousa é fotografada e transcrita por um assistente de IA, fora do
app, num arquivo JSON. — `11981e2`, `src/dominio/aula.ts`

**F131.** Formato do arquivo da aula: identificação de que é uma aula, versão,
nome da aula, data opcional (AAAA-MM-DD), a transcrição literal da lousa, e os
movimentos com nome, número de vezes, quantidade, unidade (rep, m, cal, seg),
descanso em segundos e, para movimento ainda desconhecido, a declaração do tipo
de carregamento e da unidade padrão. — `src/dominio/aula.ts`

**F132.** A interpretação do arquivo da aula recusa o arquivo inteiro, nunca pela metade, quando:
o JSON é inválido; não é uma aula; falta nome; a data está fora do formato; não
há movimento; um movimento não tem nome ou o nome não gera código; a unidade não
existe; a quantidade é inválida ou vem sem unidade; o número de vezes não é
inteiro positivo; o descanso é inválido; um movimento desconhecido não foi
declarado; o tipo de carregamento declarado não existe. Movimento já conhecido
com declaração: a declaração é ignorada, com aviso. Versão de arquivo maior que
1: aceita, com aviso. — `src/dominio/aula.ts`, `tests/dominio/aula.test.ts`

**F133.** O que a lousa diz e não vira dado: blocos, time cap, ordem dentro do
round, estrutura de tempo (EMOM), execução em dupla, peso sugerido. Tudo isso só
existe no texto transcrito. — `src/dominio/tipos.ts`, `11981e2`

**F134.** A transcrição da lousa do dia é guardada junto do dia e, quando a
sessão termina, passa a ser a nota daquela sessão; depois disso, uma lousa não
se reconstrói de outra forma. — `src/dominio/tipos.ts`,
`tests/fluxo/aulaimport.test.js`

**F135.** Aulas podem ser guardadas para reuso (até 60), com nome, guardando a
prescrição — movimentos, vezes, unidade, quantidade, descanso — e a lousa,
nunca as cargas. — `src/dominio/tipos.ts`, `src/dominio/sincronia.ts`,
`tests/fluxo/aula.test.js`

**F136.** A aula anterior pode ser remontada a partir dos registros dele
(movimentos e medidas), sem cargas. — `tests/fluxo/aula.test.js`

---

## 7 · O registro de treino · código

**F137.** Uma série é [carga, resultado, RIR opcional]; série não feita fica
vazia. Séries antigas podem ter só os dois primeiros números e continuam
válidas. — `src/dominio/tipos.ts`

**F138.** Carga: número decimal em kg (ex.: 22,5; 55; 127,5). Repetições:
inteiro. RIR: inteiro; a prescrição usa de 0 a 4 (alvos de 0 a 2 no treino
normal, 3 a 4 no deload). RIR registrado antigamente como faixa ("0–1", "1–2")
foi convertido pelo limite inferior. — `7cd6418`, `src/dominio/tipos.ts`,
`src/dominio/programa.ts`, `src/dominio/migracoes.ts`

**F139.** Maiores valores realistas de uma série: carga de três dígitos com
decimal (127,5 kg), repetições de dois dígitos (até 20 no maior intervalo
prescrito; até 150 numa estação de aula), RIR de um dígito; em movimento
cronometrado, segundos na casa das centenas (1 km de corrida em 252 s). —
`c748f57`, `src/dominio/programa.ts`, `11981e2`

**F140.** Tipos de carregamento, sete, declarados por exercício e corrigíveis
pelo usuário para aquele exercício: carga selecionada no pino da máquina (kg);
anilhas de um lado, sem barra — Smith, máquina de anilha, sled (kg por lado;
total = 2 × lado); barra olímpica livre (kg por lado; total = 2 × lado + 20 kg
da barra); um halter em cada mão (kg por mão; total = 2 ×); um único implemento
— halter, kettlebell, sandbag, bola, anilha (kg do implemento); peso corporal
(só o que foi acrescentado, pode ficar vazio); máquina assistida (o
contrapeso: menos ajuda é mais força). — `src/dominio/programa.ts`,
`src/dominio/carga.ts`, `tests/fluxo/carga.test.js`

**F141.** A carga é guardada como digitada. O código nunca converte entre tipos
de carregamento (barra W tem 10 kg, máquina articulada tem alavanca própria); o
peso da barra só entra no total onde foi declarado que há barra olímpica. —
`src/dominio/carga.ts`, `tests/dominio/carga.test.ts`

**F142.** Distribuição dos tipos no repertório: 105 carga selecionada na máquina,
42 anilhas de um lado, 22 peso corporal, 7 halter em cada mão, 4 implemento
único, 2 barra livre. — `src/dominio/programa.ts`

**F143.** Unidades de medida de um movimento, quatro e só quatro: segundos,
metros, calorias, repetições. Sem unidade declarada, é série de musculação
(carga × repetições). — `src/dominio/tipos.ts`, `tests/dominio/unidade.test.ts`

**F144.** Em metros e calorias, a quantidade é fixa (ex.: 500 m, 15 cal) e o
resultado guardado é o tempo em segundos. Em repetições e segundos, a janela é
fixa (ex.: 20 repetições, 60 s) e o resultado é quanto saiu. —
`src/dominio/tipos.ts`

**F145.** Direção da melhora: em metros e calorias, menos tempo é melhor; em
repetições e segundos, mais é melhor. A direção é da unidade, nunca do
exercício. — `src/dominio/carga.ts`, `tests/dominio/unidade.test.ts`

**F146.** Ritmo é segundos por unidade de trabalho, lido por 100 m ou por
caloria (ex.: 22 s/100 m). É o que torna comparáveis sessões de tamanhos
diferentes (5 × 500 m e 1 × 1000 m). — `src/dominio/carga.ts`

**F147.** Caloria não converte para metro: "1000 m de remo" e "20 cal de remo"
são séries históricas separadas. — `src/dominio/tipos.ts`

**F148.** A unidade e a quantidade são do dia, não do exercício: o mesmo remo é
500 m numa aula e 15 cal na outra. Cada registro guarda a sua. — `src/dominio/tipos.ts`

**F149.** Movimento medido em unidade não tem músculo atribuído, não entra no
volume por músculo, não produz força estimada e não recebe indicação de subir
carga. — `src/dominio/forca.ts`, `src/dominio/progressao.ts`,
`src/dominio/volume.ts`, `tests/dominio/unidade.test.ts`

**F150.** Cada exercício feito numa sessão gera um registro com: instante,
sessão, séries, unidade e quantidade (quando houver), observação em texto,
pontos de dor (cotovelo, ombro da frente, tendão patelar), se foi feito em deload, se
teve séries de aproximação, e de que posição do treino veio quando foi
substituto. — `src/dominio/tipos.ts`

**F151.** O histórico é por exercício, não por posição no treino: trocar,
reordenar, inserir ou remover exercícios não mexe no histórico de nenhum outro.
O mesmo aparelho usado em duas posições da mesma sessão gera dois registros
separados. — `src/dominio/programa.ts`, `src/dominio/sincronia.ts`,
`tests/dominio/sincronia.test.ts`

**F152.** Uma sessão guarda: o treino da sequência, o início, a duração líquida
(sem pausas), as pausas, os exercícios pulados, como começou (marcada antes do
aquecimento ou no instante da primeira série), como terminou (encerrada por ele:
duração exata; encerrada sem ele: duração até a última série, aproximada), se
foi em deload, se foi registrada depois do dia, se o horário é confiável, as
mudanças do dia em texto e uma nota. — `src/dominio/tipos.ts`, `c68cb0f`

**F153.** Estados de um exercício dentro de uma sessão: feito (todas as séries
previstas), parcial, pulado (decisão declarada), não feito (ausência de
registro). Só o pulado é gravado; o não feito é deduzido. — `src/dominio/sessao.ts`,
`c68cb0f`

**F154.** Pulado nunca volta a ser pendente: pular é decisão (máquina ocupada,
ombro doeu). — `src/dominio/sessao.ts`, `tests/dominio/sessao.test.ts`

**F155.** Treino fora da prescrição: registra presença, grupos musculares
trabalhados, nome opcional e duração; não tem séries, não move a sequência, não
entra na conta de horário típico. — `src/dominio/tipos.ts`, `src/dominio/dia.ts`,
`tests/fluxo/horario.test.js`

**F156.** Um dia passado pode ser marcado como descanso. Isso é dado separado
dos treinos: não conta como treino em contagem nenhuma, e um dia com treino
registrado não aceita a marca. — `src/dominio/tipos.ts`,
`tests/fluxo/sincronia.test.js`

**F157.** Um dia pode ter mais de um treino registrado. — `02077e3`

**F158.** Treinos podem ser registrados em data passada: da prescrição (com ou sem
detalhar exercícios e séries, que levam a data do treino) ou fora dela; a hora é
opcional, e sem hora o registro não tem horário confiável. —
`tests/fluxo/horario.test.js`, `00c22a6`

**F159.** Mudanças só do dia, sem tocar no programa: trocar exercício, mudar o
número de séries, as repetições, o descanso, remover, mover, mudar a unidade e a
quantidade do dia, adicionar. Ao fim da sessão, cada mudança pode virar
permanente ou não, com um motivo opcional; o que mudou no dia fica registrado
na sessão de qualquer forma. — `src/dominio/tipos.ts`, `8b300ad`, `tests/fluxo/edicao.test.js`

**F160.** O programa pessoal nasce como cópia do programa do treinador e diverge
conforme ele decide; o do treinador fica guardado como referência de comparação
e de restauração (por treino ou inteiro), sem tocar no histórico nem nos
exercícios cadastrados. — `src/dominio/programa.ts`, `0f71a6d`

**F161.** As diferenças entre o programa pessoal e o do treinador são
calculáveis: troca de exercício, séries, repetições, descanso, entrou,
saiu, ordem mudou, sequência mudou, treino criado por ele. — `0f71a6d`

**F162.** Cada posição do programa guarda desde quando aquele exercício está
nela; exercício vindo do treinador não conta. É o que permite verificar a regra
de 6 a 8 semanas. — `src/dominio/tipos.ts`, `src/dominio/programa.ts`

**F163.** Toda mudança permanente no programa fica registrada com data, treino,
descrição e motivo opcional (até 300 entradas). — `src/dominio/tipos.ts`,
`src/dominio/sincronia.ts`

**F164.** Ele pode criar treinos novos (entram na sequência, começam vazios) e
reordenar a sequência. — `0f71a6d`

**F165.** Ele pode cadastrar exercício novo (nome, músculo, tipo de
carregamento, se é composto e, se for medido em unidade, a unidade e a
quantidade padrão — nesse caso sem músculo) e renomear exercício existente
(nome com 3 letras ou mais, sem repetir nome de outro). — `d9757d5`,
`tests/fluxo/edicao.test.js`

**F166.** Mudar a prescrição do treinador dentro do código não alcança quem já
tem programa pessoal salvo, a não ser por conversão explícita do estado. —
`af17640`, `d832da4`

**F167.** Volume = soma de carga × repetições; sobe mesmo com a carga parada. —
`src/dominio/carga.ts`, `tests/dominio/carga.test.ts`

**F168.** Indicação de subir carga: só quando a última sessão daquele exercício
teve todas as séries previstas no topo do intervalo, com carga maior que zero.
Não vale para movimento medido em unidade, nem quando o exercício está há 14
dias ou mais sem registro (volta de pausa). — `src/dominio/progressao.ts`,
`tests/dominio/progressao.test.ts`

**F169.** Hoje o cálculo de subir carga não verifica o RIR planejado, embora a
regra do treinador o exija. — `src/dominio/progressao.ts`, `src/dominio/programa.ts`

**F170.** A referência de cada série é o valor da mesma série na última sessão
daquele exercício, buscando para trás quando a última teve menos séries; a
sessão em andamento nunca é referência de si mesma. — `src/dominio/progressao.ts`,
`tests/dominio/progressao.test.ts`

**F171.** Pela regra de progressão, na maior parte das séries a carga é a mesma
da série correspondente da sessão anterior; subir é a exceção. —
`src/dominio/programa.ts`, `src/dominio/progressao.ts`

**F172.** Dor marcada no mesmo exercício nas duas últimas sessões é detectável
(a regra do treinador manda tirar por 2 semanas e trocar o ângulo). —
`src/dominio/progressao.ts`, `tests/dominio/progressao.test.ts`

**F173.** Deload no código: metade das séries, arredondando para cima, mesmas
cargas; sessões e registros feitos assim ficam marcados. —
`src/dominio/progressao.ts`, `tests/fluxo/sessao.test.js`

**F174.** Força estimada (e1RM) pela fórmula de Epley: carga × (1 + repetições
/ 30). É estimativa, para comparar consigo mesma ao longo das semanas. —
`src/dominio/forca.ts`

**F175.** Tendência de força: compara o melhor e1RM de cada exercício nas
últimas 2 semanas com as 2 anteriores, só com exercícios presentes nas duas
janelas, exigindo pelo menos 3; variação abaixo de 1% é ruído (arredondamento
de anilha). Por isso a tendência precisa de cerca de 4 semanas de cargas em 3
exercícios. — `src/dominio/forca.ts`

**F176.** Exemplo real de tendência: e1RM subindo 2,3% em 2 semanas, sobre 7
exercícios. — `087af2c`

**F177.** Séries por músculo: atribuídas ao exercício efetivamente feito
(trocar elevação lateral por um aparelho de peito conta em peito); a semana em
curso se compara com o mesmo ponto das semanas anteriores, senão toda terça
pareceria queda. — `src/dominio/volume.ts`, `tests/dominio/volume.test.ts`

**F178.** Comparação cruzada da semana, calculável: dentro da mesma região do corpo
(peito, ombro, costas, perna, panturrilha, braço, abdômen), quando um músculo
menos prioritário levou mais séries que um mais prioritário (só a maior
inversão); e quantos dos músculos priorizados ficaram abaixo da própria média.
Comparar regiões diferentes não diz nada (dias diferentes do programa). —
`src/dominio/volume.ts`, `src/dominio/programa.ts`

**F179.** Ao mudar séries, o novo total semanal do músculo é calculável contra o
que o treinador prescreveu (ex.: deltoide lateral passaria de 12 para 13 séries
semanais, contra 12 prescritas). — `src/dominio/volume.ts`

**F180.** O código usa um bloco de 48 sessões de trabalho (sem deload) como
ciclo de revisão do programa; o treinador tirou a semana fixa de deload. —
`7cd6418`, `src/dominio/programa.ts`

---

## 8 · A comida · prescrição e código

**F181.** Plano alimentar do nutricionista, seis momentos (quantidades do
alimento pronto ou cozido). — `src/dominio/nutricao/alimentos.ts`,
`src/dominio/nutricao/calculo.ts`

| hora | momento | quando | itens | kcal |
|---|---|---|---|---|
| 05:45 | Pré-treino | só em dia de treino | pão Artesano 35 g; doce de leite 20 g; canela 1 g; café 200 ml | 163 |
| 06:15 | Treino | só em dia de treino | água 600 ml; maltodextrina 25 g só em dia de alta demanda | 0 (95 com a maltodextrina) |
| 08:00 | Café da manhã | todo dia | cuscuz 200 g; frango 70 g; requeijão light 30 g; leite integral 250 ml; uva 120 g | 629 |
| 12:30 | Almoço | todo dia | arroz 250 g; feijão 50 g; frango 80 g; legumes/verduras 100 g; azeite 15 g; kiwi 100 g | 719 |
| 16:00 | Lanche da tarde | todo dia | leite 250 ml; banana 120 g; aveia 40 g; pasta de amendoim 10 g; leite em pó 10 g; whey 30 g; pão 50 g; geleia light 20 g | 819 |
| 19:30 | Jantar | todo dia | arroz 250 g; feijão 50 g; lombo suíno 80 g; legumes/verduras 100 g; azeite 15 g | 678 |

**F182.** Cada momento traz uma nota do nutricionista (70 a 132 caracteres).
Exemplos: "Bata leite + banana + aveia + pasta + leite em pó + whey. Pão e geleia
ficam separados." / "Sem ceia obrigatória: o dia já fecha proteína e energia
com quatro refeições proteicas completas." — `src/dominio/nutricao/alimentos.ts`

**F183.** Totais do plano: dia de treino 3.007 kcal (proteína 158 g,
carboidrato 403 g, gordura 82 g); dia de treino de alta demanda 3.102 kcal; dia
de descanso 2.844 kcal (154 g, 374 g, 79 g). — `src/dominio/nutricao/alimentos.ts`,
`src/dominio/nutricao/calculo.ts`

**F184.** Base de alimentos do nutricionista: 36 alimentos, cada um com kcal,
proteína, carboidrato e gordura por 100 g ou 100 ml, unidade (g ou ml),
categoria de compra (mercearia, açougue, laticínios, padaria, hortifruti,
suplementos, livre) e fator de conversão pronto→cru quando existe (ex.: arroz
0,36; cuscuz 0,3625; feijão 0,43; macarrão 0,42; frango 1,3125; suíno 1,34;
peixe 1,25). Nomes de 3 a 29 caracteres. — `src/dominio/nutricao/alimentos.ts`,
`tests/dominio/nutricao.test.ts`

**F185.** Itens na categoria livre (café, canela, água, Coca Zero) não movem a
conta. — `src/dominio/nutricao/alimentos.ts`

**F186.** Uma refeição aparece todo dia, só em dia de treino ou só em dia de
alta demanda; um item pode entrar só em dia de alta demanda. —
`src/dominio/nutricao/tipos.ts`, `src/dominio/nutricao/calculo.ts`

**F187.** Hoje é dia de treino ou de descanso? A resposta segue esta
precedência: sessão já registrada hoje; sessão aberta agora; definição manual
para hoje; previsão pelo padrão semanal, que é palpite. — `src/dominio/dia.ts`

**F188.** O padrão semanal guarda só se é dia de treino ou de descanso, para cada dia da
semana (padrão: descanso no domingo); nunca diz qual treino. Qual treino vem é
sempre a sequência. O padrão serve para prever o dia e para projetar compras. —
`src/dominio/dia.ts`

**F189.** Horário do treino no dia: de manhã, o plano vale como está escrito; à
tarde (12h15) ou à noite (18h15), o pré e o intra-treino andam junto com a
sessão, mantendo o intervalo (pré = sessão − 30 min); a refeição principal que
cair dentro do treino vai para 15 min depois do fim estimado da sessão; as
demais ficam onde estão. Nenhuma refeição é criada, apagada ou fundida. Regra do
nutricionista. — `src/dominio/nutricao/calculo.ts`, `4089d3b`

**F190.** Resultado da regra com 75 min de sessão: à tarde — pré 11:45, treino
12:15, almoço 13:45; à noite — pré 17:45, treino 18:15, jantar 19:45. —
`src/dominio/nutricao/calculo.ts`

**F191.** O papel de pós-treino é da primeira refeição depois da sessão: de
manhã, o café da manhã; à tarde, o almoço; à noite, o jantar. Em dia de
descanso não há pós-treino. — `src/dominio/nutricao/calculo.ts`

**F192.** Cafeína: o café do pré-treino não entra em refeição a partir das 16h.
— `src/dominio/nutricao/calculo.ts`

**F193.** A duração usada para estimar o fim da sessão é a mediana das últimas
30 sessões, descartando as de menos de 20 ou mais de 180 min; sem histórico, 75
min. — `src/dominio/nutricao/calculo.ts`, `4089d3b`

**F194.** Água: meta de 3,5 l por dia, contada em copos de 250 ml (14 copos).
— `tests/dominio/formato.test.ts`, `d325c99`

**F195.** O dia de comida guarda: refeições marcadas como feitas; a porção do
dia por refeição (1 = tudo, 0,5 = metade); copos de água; se é dia de treino ou
descanso; se é dia de alta demanda; o horário do treino; e como o dia foi, em
três estados — seguiu o plano; saiu do plano mas sabe o que comeu; saiu e não
sabe quanto. — `src/dominio/nutricao/tipos.ts`, `c03df46`

**F196.** Mudar uma quantidade no plano vale para todos os dias; a porção do dia
vale só para aquele dia e some na virada da data. —
`src/dominio/nutricao/tipos.ts`, `src/dominio/nutricao/calculo.ts`

**F197.** Cada dia passado guarda: refeições marcadas (com o instante), água,
porções, tipo de dia, alta demanda, horário do treino, como foi, os totais
congelados contra o plano daquele dia, o carimbo da versão do plano e o ajuste
calórico em vigor. — `src/dominio/nutricao/tipos.ts`, `src/dominio/nutricao/calculo.ts`

**F198.** Dia sem nenhuma marca, sem água, sem tipo e sem horário não é
guardado. Dia sem refeição marcada não tem adesão: é desconhecido, não zero. —
`src/dominio/nutricao/calculo.ts`, `1e850ed`

**F199.** Adesão do dia é ponderada pela porção: comer metade conta metade. —
`src/dominio/nutricao/calculo.ts`, `1e850ed`

**F200.** Dia com consumo conhecido é o dia sobre o qual se sabe o que ele comeu:
tem refeição marcada e não é um dia em que ele saiu do plano sem saber quanto
comeu. O dia em que ele saiu do plano sabendo o que comeu conta. —
`src/dominio/nutricao/calculo.ts`, `tests/dominio/nutricao.test.ts`

**F201.** Padrões calculáveis do histórico de comida: por refeição (feita em X
de Y dias possíveis), por dia da semana, por horário do treino, dia de treino ×
descanso, dias inteiros cumpridos, adesão média por semana (vazia onde não houve
registro). — `src/dominio/nutricao/calculo.ts`, `1e5b07d`

**F202.** Para cada mudança do ajuste calórico, é calculável a adesão da semana
anterior a ela (se a regra mudou a comida sobre uma semana mal executada). —
`src/dominio/nutricao/calculo.ts`, `1e5b07d`

**F203.** Compras: derivadas do plano × número de dias de treino e de descanso
previstos pelo padrão semanal num horizonte de N dias à frente,
somadas por alimento, convertidas para cru onde há fator, com a origem de cada
número convertido. Ficam guardados: o que já foi comprado, o que ele tirou e o
que acrescentou à mão. — `src/dominio/nutricao/calculo.ts`,
`src/dominio/tipos.ts`, `src/dominio/dia.ts`

**F204.** Exemplo real (7 dias, 6 de treino e 1 de descanso, 22 alimentos):
arroz 3,5 kg pronto → 1,26 kg cru; cuscuz 1,4 kg → 508 g cru; feijão 700 g →
301 g cru; frango 1,05 kg → 1,38 kg cru; suíno 560 g → 750 g cru; leite 3,5 l;
banana 840 g; uva 840 g; kiwi 700 g; whey 210 g. — `src/dominio/nutricao/calculo.ts`

**F205.** Dias de alta demanda não entram na previsão de compras (a
maltodextrina não aparece). — fonte à parte

**F206.** Alimento do nutricionista pode ser editado, e ao ser removido fica
apenas oculto; alimento cadastrado por ele pode ser apagado; remover um
alimento em uso o tira das refeições que o citam. — `9914199`

**F207.** O plano do nutricionista fica guardado para restauração; restaurar
devolve a prescrição original e zera o ajuste acumulado. —
`0baad3d`, `9914199`

---

## 9 · O corpo e a regra do nutricionista · prescrição e código

**F208.** Peso em kg com uma casa decimal; uma medida por dia (registrar de novo
no mesmo dia substitui); a data pode ser qualquer dia passado, nunca futuro. —
`tests/fluxo/corpo.test.js`

**F209.** Pesagem esquecida pode ser descoberta semanas depois, não só no dia
seguinte. — `ccc6299`

**F210.** Cintura em centímetros, mesmas regras de data; hoje é informação
complementar, fora da regra. — `src/dominio/corpo.ts`

**F211.** O peso de um dia não decide nada (oscila com água, sal e intestino).
Decide a média da semana (domingo a sábado, pelo menos 2 pesagens) e a variação
entre semanas consecutivas. — `src/dominio/corpo.ts`, `tests/dominio/corpo.test.ts`

**F212.** Regra consolidada do nutricionista (21/09/2026), sobre as taxas de
duas semanas consecutivas — exige três semanas seguidas com média válida;
semana sem pesagens suficientes ou buraco entre semanas não conta como
sequência. — `src/dominio/corpo.ts`, `tests/dominio/corpo.test.ts`

- Abaixo de 0,10 kg/semana nas duas, com força não subindo e adesão registrada: **+150 kcal**.
- Abaixo de 0,10 nas duas, com força subindo: não mexer (é recomposição).
- Abaixo de 0,10 nas duas, sem adesão registrada suficiente: não mexer e registrar mais.
- Acima de 0,40 nas duas: abre revisão. Corta **−150 kcal** só com adesão registrada **e** avaliação visual de gordura "aumentou claramente". Fotos sem piora: manter (o ganho está comprando músculo). Sem avaliação, ou avaliação incerta: não mexer. Sem adesão: não mexer e registrar mais.
- Última semana entre 0,15 e 0,30: manter (intervalo-alvo).
- Qualquer outro caso, inclusive 0,30–0,40 e uma semana isolada fora do intervalo: não mexer, continuar observando.
- Sem semanas suficientes: pedir pesagens (3 a 4 por semana).

**F213.** Adesão registrada = pelo menos 11 dos últimos 14 dias com consumo conhecido
(cerca de 80%); 10 de 14 não basta. — `src/dominio/corpo.ts`,
`tests/dominio/corpo.test.ts`

**F214.** Limites exatos: 0,40 não é "acima de 0,40"; 0,10 não é "abaixo de
0,10". — `tests/dominio/corpo.test.ts`

**F215.** Cada saída da regra vem com os números que a produziram: as duas
taxas semanais, o limite cruzado e o que falta (adesão ou avaliação das fotos),
quando falta algo. — `src/dominio/corpo.ts`

**F216.** O passo é fixo (±150 kcal), nunca proporcional: ganhar 0,90 kg/semana
não gera corte maior que ganhar 0,41. — `tests/gerar-treino.js`,
`src/dominio/corpo.ts`

**F217.** O ajuste é acumulado: depois de aplicado, a nova ingestão vira a base;
o peso voltar ao intervalo-alvo não devolve o passo; dois cortes somam −300 kcal. Só
as saídas de aumentar e de reduzir produzem passo. — `src/dominio/tipos.ts`,
`0baad3d`

**F218.** O passo é executado no arroz cozido: ±120 g por dia (≈150 kcal a 128
kcal/100 g), repartidos entre as refeições com arroz — hoje almoço e jantar,
±60 g em cada —, arredondado em degraus de 15 g; o plano do nutricionista tem
250 g em cada uma. — `src/dominio/nutricao/calculo.ts`, `tests/dominio/nutricao.test.ts`

**F219.** Cada passo aplicado guarda: quando, de quanto para quanto, que saída
da regra o motivou, o texto completo da regra naquele momento e a adesão (dias
registrados nos 14 anteriores). — `src/dominio/tipos.ts`, `0baad3d`

**F220.** Avaliação visual de gordura: a pergunta do nutricionista é
"comparando com cerca de duas semanas atrás, a gordura visual aumentou
claramente?", com respostas sim, não ou incerto. Só vale para um par de fotos
com 10 a 28 dias de intervalo; vale por 14 dias contados da foto mais nova do
par; responder de novo o mesmo par substitui. — `src/dominio/corpo.ts`,
`8b7767d`

**F221.** A cintura saiu da regra: antes tinha prioridade e vetava o peso; saiu
porque medir parou de acontecer e as fotos respondem melhor a mesma pergunta. A
variação mensal da cintura só é calculável com médias semanais cobrindo 21 dias
ou mais. — `src/dominio/corpo.ts`, `tests/dominio/corpo.test.ts`

**F222.** O ritmo de ganho de peso só é calculável com base de 12 dias ou mais.
— `src/dominio/corpo.ts`, `tests/dominio/corpo.test.ts`

**F223.** O sinal de força usado pela regra pode ser definido à mão, como subindo
ou não subindo, quando o cálculo está cego — volta de pausa, troca de
exercício, semana de deload, doença; sem definição manual, vale o cálculo. —
`src/dominio/forca.ts`

---

## 10 · As fotos · mundo e código

**F224.** Foto do equipamento: uma por exercício, tirada por ele, do aparelho da
academia dele, para responder qual máquina o treinador quis dizer; serve
sobretudo nas primeiras semanas de um bloco e na hora de escolher substituto. —
`src/infra/fotos.ts`, `d7ef72c`, `7788df4`

**F225.** São cerca de 40 fotos de equipamento, que existem para sempre;
guardadas com lado maior de 1080 px, WebP qualidade 0,82 (cerca de 70 KB), ou
JPEG quando não há WebP. O que a foto precisa deixar legível é a etiqueta do
aparelho e o número do pino. Imagens capturadas do próprio display, em pé, também entram. —
`src/infra/fotos.ts`, `tests/fluxo/fotos.test.js`

**F226.** Rotina de fotos do corpo: a cada 14 dias, 9 poses, sempre na mesma
ordem, girando sempre para o mesmo lado sem sair da marca no chão (0°, 90°,
180°, 270°), em menos de 5 minutos: frente relaxado; frente duplo bíceps;
abdômen e coxa; perfil direito (braços estendidos à frente); perfil direito
natural; costas relaxado; costas duplo bíceps; costas mãos na cintura; perfil
esquerdo. — `a4df1a6`

**F227.** Cada pose tem: a que pergunta responde (referência, músculo ou
postura), posição dos braços, três instruções de execução (31 a 85 caracteres),
o que revela e o erro típico. Exemplo — perfil direito: "Gire 90° sobre a
marca, lado direito para a câmera. Os pés continuam no T." / revela "espessura
da cintura de perfil — onde a mudança aparece primeiro" / erro "girar 60° em vez
de 90° e achar que emagreceu". — `a4df1a6`

**F228.** Preparo que não muda entre sessões: câmera a 3,0 m da marca com a lente
2× (2,5 m com a 1×); lente na metade da altura dele (umbigo); corpo a 80 cm da
parede; uma fonte de luz, frontal, de preferência artificial, nada vindo de
cima; de manhã, em jejum, depois do banheiro, antes de comer e treinar; a mesma
roupa justa de cor lisa, descalço; marcas de fita no chão (pés em T) e na
parede. — `a4df1a6`

**F229.** Duas fotos só se comparam com a mesma pose e a mesma geometria de
câmera; a geometria depende das marcas de fita, e na prática a fita sai do lugar
e o celular encosta um grau torto (endireitar custa menos de 3°). —
`3c593ee`

**F230.** Comparar contra a sessão anterior engana: em duas semanas a diferença
é quase toda água e sono. O intervalo longo (a mais nova contra a mais
antiga na mesma pose) é o que mostra mudança. — `a4df1a6`

**F231.** Ajuste posterior de uma foto: só giro de até 6° e recorte com zoom de
até 2× (nunca abaixo do mínimo que impede borda vazia: a 6° numa imagem 3:4, 1,13×);
sem brilho, contraste nem filtro. O ajuste é guardado como parâmetro; a foto
original nunca é reescrita, e desfazer é sempre possível. —
`3c593ee`

**F232.** Fotos do corpo: lado maior de 1440 px (cerca de 150 KB em WebP), 9 por
sessão (cerca de 1,3 MB), 26 sessões por ano (cerca de 35 MB no primeiro ano). A
cópia permanente é a remota; o aparelho guarda os arquivos só das 4 sessões
mais recentes e busca as antigas quando precisa. — `src/infra/corpo.ts`

**F233.** O peso e a cintura associados a cada sessão de fotos são a média da
semana daquela sessão, vinda das pesagens e medidas. — `a4df1a6`

**F234.** Uma sessão de fotos por data. Ela começa na primeira foto e deixa de
existir quando a última é apagada; refazer uma pose substitui a anterior; cada
sessão pode ter uma nota de texto (para explicar, meses depois, um período fora
da curva). — `src/dominio/tipos.ts`, `src/dominio/sincronia.ts`

**F235.** A sessão de fotos pode ser interrompida e continuada no mesmo dia: a
próxima pose é a primeira ainda sem foto. — `a4df1a6`

**F236.** Foto de corpo é o corpo dele em roupa justa: fica num repositório
privado de arquivos, separado do das fotos de equipamento. — `a0be7a2`

**F237.** Os arquivos das fotos não entram na cópia de segurança em JSON; só as
referências. — `src/dominio/tipos.ts`, `src/infra/fotos.ts`

**F238.** Estados possíveis de uma foto do corpo num aparelho: presente; ausente
aqui mas existente na cópia remota (precisa baixar); ausente aqui e o aparelho
sem conta (não há como buscar); busca falhou (pode tentar de novo); nunca
tirada. — `src/infra/corpo.ts`, `fb15668`

**F239.** A câmera ao vivo é pedida traseira, em retrato, idealmente 1080 × 1440.
— `src/infra/camera.ts`

---

## 11 · Sincronização e cópia de segurança · código

**F240.** O aparelho é a fonte: tudo grava localmente primeiro. A cópia remota
(banco Postgres no serviço Supabase, falado por HTTP direto, sem SDK do
serviço) é réplica. — `src/infra/db.ts`, `4d3a5cb`

**F241.** Conta: e-mail e senha. A sessão de login pertence ao aparelho, renova
sozinha e, quando a renovação falha, exige entrar de novo. — `4d3a5cb`

**F242.** O estado inteiro é um documento por usuário, com número de versão.
Escrever exige dizer de que versão partiu; se outro aparelho escreveu antes, o
aparelho relê, combina e tenta de novo. — `4d3a5cb`,
`7767d2b`, `tests/fluxo/sincronia.test.js`

**F243.** A sincronização acontece ao abrir, ao voltar para o app, ao reconectar
e alguns segundos depois de cada mudança. — `7767d2b`

**F244.** Combinação entre aparelhos: o que tem chave natural (séries, sessões,
pesagens, cintura, cardio, dias de comida, sessões de fotos, avaliações visuais,
aulas guardadas, dias de descanso, mudanças de programa) se une sem perda. O
que se edita por cima (programa, plano alimentar, padrão semanal, ordem das
poses) vem inteiro do aparelho que alterou por último. — `src/dominio/sincronia.ts`,
`tests/dominio/sincronia.test.ts`

**F245.** Apagar num aparelho é respeitado no outro (a marca de apagado dura 90
dias); registro editado depois de apagado volta. — `src/dominio/sincronia.ts`,
`tests/dominio/sincronia.test.ts`

**F246.** No mesmo dia, refeições marcadas em dois aparelhos se somam e a água
fica com o maior valor. Poses fotografadas em aparelhos diferentes no mesmo dia
se somam. — `src/dominio/sincronia.ts`, `tests/dominio/sincronia.test.ts`

**F247.** Os arquivos de foto sobem um de cada vez, separados do estado; sem
rede, param e tentam depois. — `7788df4`, `tests/fluxo/fotos.test.js`

**F248.** Falhas possíveis da sincronização: sem rede (normal, silenciosa);
login expirado; conflito com outro aparelho; recusa do servidor. —
`4d3a5cb`

**F249.** Cópia de segurança: arquivo JSON com o estado inteiro (referências de
fotos, não arquivos), em UTF-8. — `121d1f0`, `5fcfdb0`

**F250.** Restaurar uma cópia substitui o estado inteiro (não combina) e passa
pelas mesmas conversões de formato do aparelho: aceita cópia de qualquer versão
anterior. JSON inválido ou arquivo que não é cópia não tocam no estado. —
`src/dominio/migracoes.ts`, `tests/fluxo/fluxo.test.js`, fonte à parte

**F251.** Hoje, restaurar uma cópia pelo próprio app não traz de volta os dias
de comida passados, as sessões de fotos do corpo, as aulas guardadas, as
avaliações visuais de gordura, o registro dos passos de ajuste e a lousa do dia,
e reduz o ajuste acumulado a no máximo um passo. — fonte à parte

**F252.** Hoje, a cada atualização publicada do app, a cópia local das fotos do
corpo é apagada pelo próprio app (só as fotos de equipamento são poupadas). Com
conta, elas voltam da cópia remota quando pedidas; sem conta, ou antes de terem
subido, se perdem. — `src/sw.js`, `src/infra/corpo.ts`,
`tests/fluxo/publicacao.test.js`

**F253.** Apagar todo o histórico preserva programa, exercícios cadastrados,
plano alimentar, padrão semanal, ajuste e avaliações visuais; apaga séries,
sessões, medidas, cardio, dias de comida, sessões de fotos e referências de
fotos. — fonte à parte

**F254.** O formato do estado está na versão 9; cada mudança de formato tem uma
conversão que lê a versão anterior. Nenhuma conversão apagou dado, exceto a que
zerou, a pedido dele, o histórico das estações de HYROX (a presença nas aulas
ficou). — `src/dominio/migracoes.ts`, `tests/dominio/migracoes.test.ts`

---

## 12 · Limites e volumes · código e mundo

**F255.** Tetos de quantidade: 500 registros por exercício; 3.000 sessões; 300
mudanças de programa; 400 pesagens e 400 medidas de cintura; 200 sessões de
cardio; 200 sessões de fotos; 200 avaliações visuais; 60 aulas guardadas; 4.000
dias de comida. — `src/dominio/sincronia.ts`

**F256.** O estado inteiro é regravado a cada série registrada e enviado inteiro
a cada sincronização. — `src/dominio/tipos.ts`

**F257.** Guardar uma cópia do plano em cada dia de comida custaria 1.907 bytes
por dia — 6,6 MiB em 10 anos, acima do teto do aparelho; por isso cada dia
guarda só um carimbo da versão do plano. — `src/dominio/nutricao/tipos.ts`

**F258.** Busca no repertório inteiro: cerca de 1 ms por tecla. — `71112a6`

**F259.** A busca ignora acento, maiúsculas e pontuação e aceita as palavras em
qualquer ordem ("push sled" acha "Sled push"); não corrige erro de digitação
("remmo" não acha "Remo"), porque registrar no exercício errado é pior que não
achar. — `src/dominio/formato.ts`, `tests/dominio/busca.test.ts`

**F260.** Volume real conhecido: em 24/08/2026 a cópia real do iPhone tinha 14
sessões e 43 exercícios com histórico. — `121d1f0`

**F261.** O repositório tem cerca de 885 casos de teste automatizados (cerca de
370 sobre regras puras e 510 sobre o app montado). — `tests/`

---

## 13 · Como a prescrição muda no tempo · mundo

**F262.** A prescrição de treino teve quatro versões em seis semanas: 07/08 (6
treinos, 41 exercícios); 10/08 (48 exercícios, 125 séries); 24/08 (cinco
treinos de musculação com 90 séries, mais a aula de HYROX); 21/09 (revisão do treino
B — agachamento no Smith 2 séries no lugar do pendulum squat 3; flexora 3 → 4;
extensora 2 → 1; elevação pélvica 2 → 3 — e hierarquia de prioridades em cinco
níveis). — `7cd6418`, `b6cc00f`, `0ce7f7f`, `e9b5049`, `d832da4`, `d56e5e7`

**F263.** As revisões chegam com nomes diferentes para o mesmo exercício
("Flexora sentada" = Cadeira flexora sentada; "Hip thrust máquina" = Elevação
pélvica na máquina). — `d832da4`

**F264.** O plano alimentar trocou o pré-treino em 24/08 (banana com mel → pão
com doce de leite e canela; 210 → 163 kcal). O nutricionista prescreveu a regra
de horários em 09/09 e consolidou a regra de ajuste em 21/09. — `bdfd7d7`,
`4089d3b`, `ddec1f8`

**F265.** Letras de treino já mudaram de significado: "F" foi o treino de
posteriores e glúteos até 2026; D e E trocaram de lugar em agosto. Registros
antigos guardam a letra da época. — `001b43d`, `c07bd27`, `src/dominio/migracoes.ts`

**F266.** Em 10/08, com quatro dias de uso do programa, o treinador pediu
explicitamente que nenhum número dele fosse alterado. — `063ecad`

---

## 14 · O que já deu errado · erro

**F267.** Trocar de treino no meio da sessão fazia sumir da digitação as séries
já gravadas; digitar de novo por cima apagaria as outras. O defeito passou por
seis rodadas de verificação antes de existir teste permanente. — `abcf559`,
`114c91c`

**F268.** Um registro de digitação vazio virou uma sessão inexistente, sem presença correspondente. —
`114c91c`

**F269.** Com o treino pausado, o relógio da sessão andava para trás. — `c68cb0f`

**F270.** Treino registrado em data passada sem hora ganhava 07:00 inventado e
sujava a média de horário. — `5373381`

**F271.** Aparelho novo ficaria sem plano alimentar para sempre; exportar e
reimportar perderia plano, padrão semanal e ajuste. — `5fcfdb0`

**F272.** Apagar o histórico de treino derrubava a base de alimentos. — `acd56e3`

**F273.** O carregamento inicial nunca terminava: o estado de carregando ficava
para sempre, junto com restos de valores indefinidos. — `c4e01c4`

**F274.** Com a cópia real do iPhone: sem semanas suficientes, a variação mensal
da cintura saía como pedaço de frase no lugar de número; o arquivo exportado
sem codificação declarada corrompia acentos ("tríceps" → "trÃ­ceps", "6–10" →
"6â10"). — `121d1f0`

**F275.** Registrar peso recusava um número válido como inválido, ou travava com
erro. — `74ea9e1`

**F276.** A sincronização podia deixar para trás uma alteração ainda não
gravada; estado remoto sem programa travava o app. — `7767d2b`

**F277.** Marcar um dia passado como descanso derrubava o app. — `f5e3011`

**F278.** Com sinal ruim, a instalação para uso sem rede ficava com buracos sem
aviso, que só apareciam offline no subsolo. — `baeaba4`

**F279.** Fotos de equipamento quebravam onde não havia service worker e saíam
borradas (redução de 4000 px para 400 ou 700 px de uma vez). — `bc0bb17`,
`d07b861`

**F280.** Mudanças do dia eram descartadas sem que ele decidisse quando a sessão
terminava sem ele encerrar. — `8ce5d11`

**F281.** O dia da aula foi tratado como a prova inteira: meta de 16 séries nunca
cumprida, RIR pedido num remo de 1000 m, nove exercícios cobrados como pendentes
toda semana e a decisão, a cada movimento registrado, de incorporá-lo ou não ao
programa permanente. — `a72e31d`

**F282.** Adicionar movimento no dia da aula não fazia nada; o movimento adicionado
se apresentava como substituto de um identificador interno sem sentido e
recebia prescrição de musculação (3 × 10–15). — `af17640`

**F283.** O histórico das estações de HYROX registrado quando o dia da aula era
tratado como hipertrofia não queria dizer nada e foi apagado a pedido dele. —
`74d36eb`

**F284.** Somar segundos fez 5 × 500 m de remo aparecer como +423% e como
melhora contra um 500 m sozinho; o remo mais lento era tratado como recorde. —
`23f3544`, `a1dceaf`

**F285.** Numa aula de 5 movimentos × 5 rounds havia 25 pedidos de RIR sem
sentido, carga pedida e deixada vazia em 15 de 25 registros e sugestão de aquecimento
num remo. — `1b24a7a`

**F286.** Movimento de circuito herdava 3 min de descanso entre um wall ball e
outro. — `00e7fa3`

**F287.** Sem acento, "macarrao", "feijao", "triceps" e "ergometro" não achavam
nada. — `71112a6`

**F288.** Nada do que ele comia sobrevivia à meia-noite; editar o plano
reescrevia dias passados (um dia vivido caiu de 1.348 para 1.220 kcal ao cortar
arroz). — `1e850ed`

**F289.** O choque do jantar das 19h30 com um treino às 18h15 não era
detectado. — `4089d3b`

**F290.** O app cortou comida por causa de uma semana só (+0,10 seguido de +0,75
deu média 0,425 e disparou o corte). — `ddec1f8`

**F291.** Um passo de +150 kcal movia cerca de 320 kcal (250 g de arroz); a
quantidade de arroz mostrada errava por um passo; e a regra convidava a
devolver um corte já feito. — `0baad3d`

**F292.** O dia em que ele saiu do plano sem saber quanto comeu contava como
registro e destravava o corte. — `c03df46`

**F293.** Encerrar a sessão por 4 h de inatividade nunca serviu: quem esquece
só reabre no dia seguinte. — `893e2c3`

**F294.** O "voltar" do sistema fechava o app de qualquer ponto, inclusive no
meio de uma série; o descanso só começava a contar na última série do exercício;
o descanso em curso se perdia ao reabrir; fechar o app logo depois de digitar
podia perder a série recém-digitada. — `a00aaf1`

**F295.** Treino da prescrição registrado por engano não podia ser apagado;
apagar só a presença deixaria séries órfãs contando volume; a duração de um
treino não podia ser corrigida (esquecer de encerrar deixava a duração ir até a
última série, às vezes horas depois). — `ad278dc`

**F296.** Escolher um alimento pela busca para pô-lo numa refeição não fazia
nada, sem erro, de 14/08 a 01/10/2026 — quase sete semanas sem ninguém notar. —
`ce46d2c`

**F297.** Foto que não chegou da cópia remota ficava indicando que ainda estava
sendo buscada, para sempre. — `fb15668`

**F298.** Publicar versão nova podia deixar o iPhone na versão velha sem aviso
nenhum (número de versão subido à mão; troca de ícone que não mudava a versão).
— `7c18963`, `1003956`

**F299.** Contas por semana e por dia erraram nas fronteiras: testes quebrando
às segundas, às sextas e sábados, entre 23h e meia-noite, e um registro de
terça caindo "no futuro" numa segunda. — `063ecad`, `89cb9ea`, `a46f429`, `f13a6eb`

**F300.** Conversões de formato erraram ao ler dado antigo com o código de hoje:
uma troca de letras aplicada duas vezes; uma cópia antiga que seria lida contra
o programa novo e mandaria o histórico para os exercícios errados. — `c07bd27`,
`0ce7f7f`

---

**F301.** Em quatro reescritas do código da interface, capacidades e informações
que existiam sumiram sem erro nenhum — entre elas apagar uma pesagem, apagar
uma sessão de cardio, a informação de que treino fora da prescrição não entra na
contagem de séries, o horário típico e a duração média do mês. Os testes
automatizados que sobem o app pegaram todas. — `dadd3e4`, `63c9e53`, `0ad1f13`,
`3283495`

## O que este arquivo não sabe

Não são fatos: são ausências. O repositório não registra:

- a versão do iOS do aparelho (o modelo é conhecido, F49; o código usa
  recursos do iOS 18.4);
- com que frequência cada tarefa acontece de fato, ou qualquer medida de uso
  depois de 24/08/2026;
- o horário e o lugar da aula de HYROX, e o lugar onde as fotos do corpo são
  tiradas;
- a hora exata da pesagem (é antes do treino e depois de comer algo leve; o
  código supõe 7h para pesagem de dia passado);
- a luz da academia, uso ao ar livre ou ao sol, uso de luva ou de magnésio;
- necessidades de acessibilidade do próprio usuário;
- como as revisões dos agentes de treino e de nutrição chegam ao registro, e se
  os agentes veem algo do que o usuário registra;
- quem criou a rotina de 9 poses e o preparo das fotos (não está atribuída ao
  treinador nem ao nutricionista);
- de onde vêm a suspensão de subir carga após 14 dias e o bloco de 48 sessões
  (não estão atribuídos ao treinador);
- com que frequência e em que condição a cintura passa a ser medida (o dono
  diz que vai medir sempre; a frequência não foi dita);
- de quantos em quantos dias ele de fato faz compras;
- se o usuário está hoje com a sincronização ligada.
