# Fluidez e estabilidade

Como o app se move entre uma tela e outra, como as coisas aparecem e somem, e o
que nunca pode sair do lugar. Vale para toda tela; os valores estão em
[tokens.css](tokens.css) e a demonstração está na página viva (`lastro.html`):
navegue com o "+", as folhas, o Voltar e os estados para ver cada regra.

O resumo em duas frases: **o que se repete fica parado, para a mão aprender
onde está; o que muda se mostra mudando, rápido e com motivo, para o olho não
perder a mudança.** As duas coisas juntas fazem o app parecer calmo, mesmo
quando muita coisa acontece.

## Por que isto importa, segundo quem estudou

- **Hábito.** Jef Raskin (*The Humane Interface*, 2000) põe a habituação no
  centro: uma interface boa deixa a pessoa fazer o gesto sem pensar nele, e
  isso só acontece quando o mesmo gesto, no mesmo lugar, faz sempre a mesma
  coisa. "Quanto mais monótona a interface, mais depressa vira hábito." No
  Lastro, o hábito é o que deixa registrar uma série com o celular numa mão,
  sem olhar: o "Feito" tem de estar onde o polegar já espera.
- **Memória espacial.** O Nielsen Norman Group define a memória espacial como
  aprender onde estão os objetos usando-os repetidas vezes, e mostra que ela é
  aproximada ("a vizinhança", não o pixel). Mudar a posição de um controle
  conhecido quebra essa memória; mantê-lo no mesmo lugar é o que a sustenta.
- **Consistência.** Don Norman (*The Design of Everyday Things*) e Bruce
  Tognazzini (*First Principles of Interaction Design*) põem a consistência
  com a expectativa da pessoa acima de qualquer outra: o que parece igual deve
  se comportar igual, e estar onde estava.
- **Mudança não percebida.** A pesquisa sobre *change blindness* (Rensink,
  O'Regan e Clark, 1997) mostra que, quando uma cena troca de uma vez, as
  pessoas deixam de notar mudanças grandes. O NN/g mostra o mesmo em interface
  (o selo do carrinho que muda longe do botão passa despercebido) e indica a
  animação breve como o que torna a mudança visível. Troca seca de tela é onde
  a pessoa perde o que mudou.
- **Movimento com propósito.** Val Head (*Designing Interface Animation*,
  2016): toda animação precisa de um motivo que se consiga dizer; se não se
  consegue, ela não deveria existir. Os motivos que valem são orientar (de onde
  veio, para onde foi), dar continuidade (é a mesma coisa, só mudou) e dar
  retorno (o toque foi recebido). A Apple pede o mesmo: animação de retorno
  breve e precisa, e com "reduzir movimento" ligado, reduzir ou eliminar.
- **Duração.** O NN/g recomenda de 100 a 500 ms, conforme o tamanho da
  mudança: cerca de 100 ms para retorno simples (uma chave), 200 a 300 ms para
  uma mudança grande de tela (uma janela que entra), e trata 400 ms como
  lento, só para movimentos longos. Anota que é muito mais comum a animação
  pecar por longa do que por curta.
- **Curva.** O NN/g e o Material Design: movimento linear parece artificial;
  aceleração e desaceleração assimétricas parecem naturais. O que **entra**
  desacelera (chega rápido e pousa); o que **sai** acelera (parte devagar e
  some). É o "slow in, slow out" dos animadores da Disney (*The Illusion of
  Life*, Thomas e Johnston).
- **Direção diz hierarquia.** No iOS, ir mais fundo empurra a tela da
  direita; o que é temporário e fechado em si (uma tarefa, uma folha) sobe de
  baixo e desce ao fechar. O Material Design organiza o mesmo em padrões:
  eixo compartilhado (passos de um fluxo, ir e voltar), *fade through* (trocar
  entre lugares do mesmo nível, sem relação espacial) e transformação de
  contêiner (o elemento tocado vira a tela).
- **Layout que pula.** O Google mede isso como *Cumulative Layout Shift*:
  deslocamento que a pessoa não esperava faz perder o ponto da leitura e tocar
  no botão errado. Deslocamento logo após um toque é tolerado, porque a pessoa
  o causou; deslocamento sozinho, nunca.
- **Destino próximo e grande.** A lei de Fitts (1954): o tempo para alcançar
  um alvo cresce com a distância e cai com o tamanho. Manter o botão no mesmo
  lugar entre telas zera a distância do próximo toque.

## As regras

### 1. O que se repete não sai do lugar

Entre duas telas ou dois estados que pertencem à **mesma tarefa** (a série e o
descanso, uma leitura e a próxima, um dia e o próximo em "responder os dias",
uma pose e a próxima, os passos da primeira vez), a estrutura é a mesma e as
âncoras ficam paradas:

| Âncora | Onde | Regra |
|---|---|---|
| botão principal | embaixo, largura toda | mesma altura, mesma largura, mesmo `y`. Só o rótulo muda, em *crossfade* |
| linha das saídas | embaixo do principal | sempre reservada (44 px), mesmo vazia, para o principal não descer quando ela some |
| topo da tela de ação | recolher, título, lista | idêntico em todos os passos |
| segmentos | embaixo do topo | o traço muda de estado; a barra não se move |
| doca e "+" | rodapé | nunca se movem ao trocar de lugar; só o lugar atual muda |
| cabeçalho do destino | topo | o voltar está sempre no mesmo canto |

Consequência no desenho: na tela de ação, **o botão principal é sempre um só,
de largura toda**. O que for ajuste (−15 s, +15 s) vai para a linha das saídas
ou para perto do número que ele ajusta, nunca dividindo o lugar do principal.

### 2. O que foi tocado não se move

A resposta a um toque pode empurrar o que está **abaixo** do ponto tocado, mas
nunca o próprio controle nem o que está acima dele. Escolher "Cortina" no
seletor muda a foto embaixo; o seletor fica. Abrir uma folha não rola a tela
de trás.

### 3. Nada muda sozinho de lugar

O que chega sem toque (dado que carrega, sincronia que termina, um aviso)
**não desloca** o que a pessoa está lendo:

- espaço reservado para o que vai aparecer (o eco do texto livre tem duas
  linhas reservadas; a frase da medição também);
- texto que muda de comprimento não muda a largura do botão (o principal é de
  largura toda; "Guardando…" ocupa o mesmo lugar de "Guardar");
- números em algarismo tabular, para 57,5 virar 60 sem sacudir a linha;
- avisos entram **sobre** o conteúdo (faixa no topo, aviso com desfazer
  embaixo), nunca empurrando a página.

### 4. Cada troca tem um movimento, e o movimento diz o que aconteceu

| Navegação | Movimento | Entra | Sai | Por quê |
|---|---|---|---|---|
| trocar de lugar (doca) | *fade through* | some em 100 ms, entra em 180 ms | — | lugares são do mesmo nível, sem relação espacial: deslizar sugeriria uma ordem que não existe |
| entrar num destino | eixo horizontal | 260 ms, da direita, 24 px + opacidade, desacelerando, começando 40 ms depois | 100 ms, 24 px para a esquerda, acelerando | ir mais fundo; a direção ensina que o Voltar desfaz |
| voltar de um destino | o mesmo, ao contrário | 220 ms, da esquerda, 40 ms depois | 100 ms, para a direita | a saída curta e o atraso pequeno evitam as duas telas sobrepostas, legíveis ao mesmo tempo |
| abrir tela de ação | sobe de baixo | 380 ms, desacelerando | — | é uma tarefa fechada em si, como no iOS |
| recolher tela de ação | desce | 260 ms, acelerando | — | sair é mais rápido que entrar |
| passo seguinte na mesma tarefa | âncoras paradas, miolo em *crossfade* | 180 ms | 120 ms | é a mesma tela com outro conteúdo; mover o resto seria ruído |
| estado diferente na mesma tela | as partes que mudam se acomodam (posição e tamanho) | 220 ms | — | continuidade: a pessoa vê o bloco encolher, a seção subir |
| abrir folha | sobe | 340 ms | — | |
| fechar folha | desce | 240 ms, acelerando | — | |
| aviso com desfazer, faixa | entra deslizando 10 px + opacidade | 200 ms | 160 ms | entra sobre o conteúdo, sem empurrar |
| retorno de toque | encolhe 3% | 100 ms | 100 ms | |

As durações ficam entre 100 e 380 ms. Nada passa de 450 ms, exceto o
enchimento do descanso, que **é** o tempo do descanso.

Curvas (tokens): `--mola` `cubic-bezier(.2, .9, .25, 1)` para o que entra e
para o que muda; `--mola-sai` `cubic-bezier(.4, 0, 1, 1)` para o que sai.

### 5. O movimento nunca atrapalha

- **Nunca bloqueia.** O toque durante uma transição vale: a transição é
  interrompida e o app vai para onde o toque pediu.
- **Distâncias curtas.** O deslocamento de uma tela inteira é de 24 px, não da
  largura da tela: suficiente para dizer a direção, curto para não cansar.
- **Sem rolagem lateral.** Todo contêiner de algo que desliza na horizontal
  corta com `overflow-x: clip` (não `hidden`, que quebra o `sticky`), para o
  deslizamento não criar barra lateral nem fazer o que é fixo piscar.
- **Só `transform` e `opacity`.** Nada de animar altura, margem ou `top`, que
  fazem o navegador recalcular a página a cada quadro e engasgam no iPhone.
  Para "a seção subiu", usar a técnica de primeiro, último, inverter, tocar
  (FLIP) ou as *view transitions* do navegador.
- **Sem `backdrop-filter`.** Pisca no Chrome quando algo anima por perto.
- **Nunca anima:** o número que o dedo está mexendo (a régua responde na
  hora), dado que atualiza sem toque, e nada que comemore.

### 6. Reduzir movimento

Com a preferência do sistema ligada, **nada desliza nem escala**: as trocas
viram *crossfade* de 120 ms ou são secas, e as folhas aparecem sem subir. O
descanso continua enchendo, porque ali o movimento é a informação, mas em
passos de 10%.

## Como o app faz (implementação)

- **Navegação:** `document.startViewTransition()` em volta da troca de tela,
  com uma marca no `<html>` dizendo o tipo (`lugar`, `entra`, `sai`, `sobe`,
  `desce`, `passo`, `estado`) e as animações em CSS
  (`::view-transition-old/new`). Funciona no Safari do iPhone (desde o iOS 18)
  e no Chrome; onde não houver, a troca é seca e nada quebra.
- **Âncoras:** `view-transition-name` no botão principal da tela de ação, no
  topo, nos segmentos e na doca. Com o mesmo nome antes e depois, o navegador
  mantém o elemento no lugar e só troca o conteúdo.
- **Estados da mesma tela:** nomes por seção (bloco do momento, cada seção), e
  o navegador acomoda posição e tamanho.
- **Folha:** só a folha anima; a tela de trás não é redesenhada nem rolada.
- **Nomes únicos:** dois elementos com o mesmo nome ao mesmo tempo cancelam a
  transição; os nomes são dados por quem desenha a tela, um por âncora.

## Como conferir

- Em cada tarefa de vários passos, tirar a imagem de cada passo e conferir
  que o botão principal tem o mesmo `getBoundingClientRect()` em todos.
- Gravar a troca (a página viva e o app) e olhar quadro a quadro: nada pisca,
  nada salta, nada aparece fora do lugar e depois corre para ele.
- Ligar "reduzir movimento" e repetir.

## Fontes

- Raskin, J. *The Humane Interface*. Addison-Wesley, 2000 (habituação,
  monotonia); resumo em <https://en.wikipedia.org/wiki/The_Humane_Interface>.
- Norman, D. *The Design of Everyday Things*, edição revista. Basic Books, 2013.
- Tognazzini, B. *First Principles of Interaction Design*:
  <https://asktog.com/basics/firstPrinciplesOldEdition.html>.
- Head, V. *Designing Interface Animation*. Rosenfeld Media, 2016:
  <https://rosenfeldmedia.com/?p=187569>; <https://alistapart.com/article/designing-interface-animation>.
- Thomas, F.; Johnston, O. *The Illusion of Life: Disney Animation*, 1981
  (desaceleração na entrada e na saída).
- Fitts, P. M. "The information capacity of the human motor system in
  controlling the amplitude of movement", 1954.
- Rensink, R. A.; O'Regan, J. K.; Clark, J. J. "To see or not to see: the
  need for attention to perceive changes in scenes", 1997.
- Nielsen Norman Group: duração <https://nngroup.com/articles/animation-duration>;
  propósito <https://www.nngroup.com/articles/animation-purpose-ux/>;
  usabilidade <https://www.nngroup.com/articles/animation-usability/>;
  memória espacial <https://www.nngroup.com/articles/spatial-memory/>.
- Apple, Human Interface Guidelines, Motion:
  <https://developer.apple.com/design/human-interface-guidelines/motion>.
- Material Design, o sistema de movimento:
  <https://material.io/design/motion/the-motion-system.html>; duração e curva
  <https://m1.material.io/motion/duration-easing.html>.
- Google, Cumulative Layout Shift: <https://web.dev/articles/cls>.
- MDN, View Transition API:
  <https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using>.
