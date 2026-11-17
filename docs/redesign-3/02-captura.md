# O que a captura de fotos automatiza

Fase 0, item 7 do [plano](00-plano.md). O dono deixou a decisão com liberdade
total ("quero que seja impecável") e garantiu que **sempre há rede** na hora
das fotos. Decidido em 17/11/2026; mostrar a ele antes de fechar a Fase 1.

## O que precisa dar certo

1. **A padronização vem primeiro**: mesma distância, mesma altura, celular no
   nível. É o que torna duas sessões comparáveis
   ([docs/fotos/01-captura.md](../fotos/01-captura.md)).
2. **Quem fotografa não pode precisar saber nada**: pode ser a pessoa de
   sempre, alguém novo ou o próprio dono sozinho.
3. **As 11 poses não mudam** sem perguntar ao dono.
4. **"Tirar mesmo assim" existe**, e a foto sai marcada como fora do padrão
   (`Captura.fora`).

## O que o app faz hoje

Mede de verdade só o **nível** do celular, pelo sensor de movimento. Altura e
distância são conferidas a olho, pelas linhas da tela (cabeça na de cima, pés
na de baixo). Depois de cada foto, a voz diz o giro e a pose seguinte.

## A decisão

### 1 · O app detecta o corpo na imagem

Com **MediaPipe Pose Landmarker** (`@mediapipe/tasks-vision`, Apache 2.0), modelo
**lite** (5,8 MB), rodando no próprio navegador sobre o vídeo da câmera. Ele
devolve 33 pontos do corpo, cada um com nota de confiança, em coordenadas da
imagem. É o que permite medir, sem ninguém conferir a olho:

| Medida | Como sai dos pontos | Vira |
|---|---|---|
| **Distância** | altura do corpo no quadro: dos olhos e orelhas (topo estimado da cabeça) aos calcanhares | luz de distância: "chegue para a frente" ou "para trás" |
| **Altura** | sobra acima da cabeça contra sobra abaixo dos pés | luz de altura: "suba as mãos" ou "desça" |
| **Centro** | o meio dos quadris contra o meio do quadro | dica de lado, sem travar |
| **Pessoa no quadro** | todos os pontos-chave visíveis | sem ela, nada destrava |

O modelo não tem ponto no **topo da cabeça**. O topo é estimado acima dos olhos
e das orelhas, e calibrado na primeira sessão com a pessoa. A régua de
tolerância nasce da que o protocolo já usa (os pés a 2–5% da borda) e fica num
lugar só, para ajustar com o dado real.

### 2 · O que destrava o disparo

As três luzes (nível, altura e distância) ficam verdes **sozinhas** quando
estão certas. O botão destrava com as três verdes. Quem fotografa não toca
em nada para "confirmar o ajuste": o app vê.

### 3 · Quem dispara

| Cenário | Disparo |
|---|---|
| **A pessoa de sempre** e **alguém novo** | quem segura toca. O app mostra "pronto" com as três luzes verdes; a pessoa fotografada pode estar no meio da pose, e só quem vê sabe |
| **Sozinho** | **automático**: com as três verdes e o corpo parado por cerca de 1 s, o app conta 3 e dispara. Substitui a contagem fixa: não dispara com a pessoa ainda andando para a marca |

### 4 · O que o app marca sozinho na foto

- `fora`: o que não estava verde no disparo ("Tirar mesmo assim").
- `tremida`: pelo giroscópio, que o app já lê (`Captura.mov`), quando o
  celular girava acima do limite no toque.

### 5 · O enquadramento se alinha sozinho depois

Com os pontos do corpo de cada foto, o app calcula o ajuste que põe cabeça e
pés nas mesmas linhas e guarda como ajuste da foto (`FotoRef.enq`), **marcado
como automático**. O arquivo original não muda, e "Original" desfaz como hoje.

É a automação que mais ajuda a comparar: mesmo uma foto um pouco fora sai
alinhada com as outras no lado a lado, na cortina e no "no tempo".

### 6 · A voz continua

Fala com a pessoa fotografada (pose e giro), como hoje. Ganha uma frase de
ajuste quando uma luz apaga ("um passo para trás"), dita uma vez por mudança,
não repetida.

## Quando a detecção não funciona

Funcionar no iPhone 11 dentro do app instalado **não está confirmado**. A
documentação não dá números de desempenho nem fala do Safari, e daqui não há
iPhone para medir. Por isso a detecção é uma camada por cima do que já
funciona, e nunca uma dependência:

- **Caiu, demorou para carregar ou está lenta** (abaixo de uns 8 quadros por
  segundo): as luzes de altura e distância viram o modo de hoje, as linhas da
  tela e um "conferi" por luz para quem fotografa. Nível continua pelo sensor.
  Nada trava por causa da detecção.
- **O dado diz se funcionou**, sem ninguém testar à mão: cada foto guarda se a
  detecção estava ativa e a quantos quadros por segundo
  (`Captura.det`, campo novo da Fase 1). A pasta dos agentes mostra.
- O modelo e os arquivos do motor ficam **dentro do app**, servidos e
  guardados como as fontes. A versão do pacote fica fixa e com pelo menos
  duas semanas de publicada no momento da instalação: instalada a **1.2.2**
  (03/11/2026), porque a 1.2.3 (11/11) ainda não tinha duas semanas.

## Como ficou no código (17/11/2026)

- **Regra** em `src/dominio/deteccao.ts` (`leCorpo`, `parado`,
  `alinhamentoAutomatico`), com as tolerâncias todas em `REGUA`; as três luzes
  em `src/dominio/captura.ts`. Testes em `tests/dominio/deteccao.test.ts` e
  `tests/fluxo/v3-deteccao.test.js` (com um dublê do motor).
- **Motor** em `src/infra/pose.ts`, carregado só quando a câmera do visual
  novo abre. Os arquivos (`pose/`: o modelo de `public/pose/` e o MediaPipe,
  copiado do pacote no build) não entram na instalação do app: baixam na
  primeira câmera e moram no cache `lastro-pose-<versão>` do service worker,
  que publicar o app não apaga. O detector lê o mesmo quadro 3:4 que vira a
  foto, no máximo 15 vezes por segundo.
- **Caiu para as linhas** quando o motor não carrega, falha, ou fica abaixo de
  8 leituras por segundo depois de 2,5 s. A tela diz, e as luzes de altura e
  distância voltam a ser tocadas por quem confere.
- **Conferido em navegador de verdade** (Chromium e WebKit, nesta máquina): o
  motor carrega pelo caminho do build e roda. A velocidade no iPhone continua
  sem medida; `Captura.det` vai dizer.

Decidido na construção:

- **Sozinho, o toque no play pede só o nível**: quem toca está ao lado do
  celular, fora do quadro. Com a detecção ativa, o app espera as três luzes
  com a pessoa na marca e o corpo parado por 1 s, e conta 3. Sem a detecção,
  ou depois de 20 s esperando, a contagem fixa de antes.
- **A frase de ajuste falada** ("um passo para trás") só no modo sozinho,
  enquanto o app espera a pessoa: acompanhado, quem segura lê a tela, e mandar
  a pessoa fotografada andar tiraria ela da marca no chão.
- **O alinhamento automático só aproxima e centraliza**, sem girar: corpo
  grande demais no quadro não tem conserto (afastar não existe), e o giro já
  vem medido pelo nível no disparo.

## O que fica de fora, de propósito

- **Conferir a pose** (braços no lugar certo, pés no T). Os pontos permitiriam,
  mas um aviso errado no meio da sessão custa mais que a frase da voz que já
  existe. Fica para depois, se o dado mostrar que pose errada é problema.
- **Trocar a lente ou o zoom sozinho.** A lente é fixa na 1×, e isso não muda.
- **Disparo automático no modo acompanhado.** Ver o quadro 3.
