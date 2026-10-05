# 09 · A rede endurecida

O que entrou entre a entrega da frente 2 e a da frente 4, para a rede aguentar
a reescrita que vem. **Dois defeitos vivos no app de hoje** e **oito buracos na
própria suíte**.

Este documento tem dois autores. O agente do endurecimento escreveu os quatro
primeiros commits e caiu por limite de sessão no meio do quinto; o coordenador
resgatou o trabalho não commitado, devolveu o arquivo de medição que tinha
ficado para trás, e fez a última parte. **Está dito onde cada coisa foi medida e
onde foi conferida por leitura**, porque as duas valem coisas diferentes.

## A linha de base

| | antes | depois |
|---|---:|---:|
| Testes passando | 954 | **957** |
| Arquivos | 53 | 53 |
| Unhandled rejections | 0 | **0** |

Três casos entraram, nenhum saiu. `npm test` rodado pelo coordenador em cada
etapa, não só no fim. Nenhuma asserção foi baixada, nenhum caso apagado ou
pulado.

---

## 1 · Os dois defeitos vivos

### 1.1 · Corrigir uma série depois de reabrir o app disparava um descanso

`fix(descanso)` — `src/main.jsx`, `tests/fluxo/serie.test.js`.

A guarda que separa **registrar** de **corrigir** era `view.fired[dia + i + ':' + k]`,
campo de `view`: memória, nunca disco. O iOS fecha o app em segundo plano no
meio do treino; ao reabrir, a marca nascia vazia, e corrigir uma série
registrada quinze minutos antes **disparava um descanso de dois minutos para
uma série que já tinha acabado**.

A resposta agora vem do dado, que sobrevive ao processo: o rascunho, que vai a
disco, e — como segunda fonte, para a janela em que o rascunho daquela posição
ainda não foi hidratado — a série já escrita no histórico desta sessão. As duas
espelham a mesma verdade, porque a projeção reescreve o histórico a partir do
rascunho.

**O caso novo nasceu vermelho**, com a sessão e o valor na tela conferidos antes
da asserção do descanso. É a prova de que o defeito era real e não hipótese.

**O que não se podia quebrar, e não quebrou:** o descanso começa em qualquer
série completada, não só na última; apagar o campo **rearma** o disparo daquela
série e só dela; e o descanso sobrevive a fechar e reabrir sem ressuscitar
vencido, porque conta a partir de um instante-alvo e não de um contador que
decrementa.

### 1.2 · Os dois fechos de sessão discordavam

`fix(sessao)` — `src/main.jsx`, `tests/fluxo/aula.test.js`.

O fecho pela porta da frente tinha uma guarda de dia aberto, com razão escrita:
num dia aberto o que foi adicionado **é** o dia, não uma emenda a ele, então não
há conteúdo permanente para aquilo virar. O fecho automático **não tinha essa
guarda**.

Resultado medido: uma aula de box que fechava **sozinha** por inatividade
enfileirava os movimentos como mudanças pendentes; a mesma aula encerrada no
toque não. Mesma situação, dois resultados.

Dois casos novos, e a assimetria está medida neles: **o do fecho automático
nasceu vermelho, o do fecho no toque já estava verde.**

---

## 2 · Os oito buracos na rede de CSS

`tests/dominio/estilo.test.ts` é a especificação de CSS deste produto em forma
executável. A `08-rede.md` classificou 28 dos 38 casos como invariante genérica
que sobreviveria ao redesenho. **Oito não seguravam o que prometiam.**

### 2.1 · O maior: arquivo que falta matava a coleta, não produzia vermelho

Achado pela frente 4, conferido pelo coordenador, consertado no trabalho
resgatado.

O arquivo tinha **nove `readFileSync` no escopo do módulo** — a lista de folhas
com o seu `.map`, mais as leituras soltas de `base.css`, `index.html`,
`main.jsx`, `telacheia.jsx`, `primitivos.jsx`, `palco.css` e `palco.js`. Leituras
no escopo do módulo rodam na **importação**, antes de qualquer caso se registrar.

Então renomear uma folha não dava dez vermelhos: **estourava na coleta e a suíte
respondia `Tests  no tests`. Zero de 38 executados.** A frente 4 mediu isso numa
cópia.

**Por que é pior que vermelho:** um teste vermelho grita. Um arquivo que não
coleta só **desaparece da contagem**, e quem olha "nenhuma falha" passa batido. E
a reescrita que vem **vai renomear folhas** — é exatamente o cenário.

O conserto: a leitura virou preguiçosa, com memória, e a ausência estoura
**dentro do caso**, nomeando o arquivo e dizendo o que fazer. O remédio errado
também foi fechado: **arquivo vazio reprova igual**, porque caso verde sobre nada
é pior que vermelho.

**Medido, não argumentado.** Renomeando `src/treino.css` e rodando só este
arquivo: **18 casos vermelhos**, cada um nomeando `src/treino.css`. Antes:
nenhum teste. A folha foi restaurada e a árvore ficou limpa.

A lista de folhas ficou **declarada e não descoberta**, e a razão é a direção da
reprovação: lista declarada reprova quando um arquivo esperado falta; lista
descoberta aceita qualquer conjunto e fica cega justamente quando as regras
mudam de lugar.

### 2.2 · Os outros sete

| o buraco | o que passava |
|---|---|
| **Definição de token só em começo de linha** | Num bloco sem espaços — o que qualquer minificador produz — só a primeira definição começa linha, e todas as outras viravam **órfãs falsas**: 21 medidas numa cópia. Reprovação em massa no código certo é tão ruim quanto aprovação em silêncio, porque a resposta é desligar o caso. |
| **O caso de cor olhava só hexadecimal** | Cor em `rgb()`, `rgba()`, `hsl()`, `oklch()` ou `color()` entrava solta sem ninguém pegar — e `rgba()` é justamente a forma de fundo translúcido, o caso mais frequente de cor nova. As duas translucidezes que existem hoje ficaram nomeadas uma a uma, com o motivo: mudar o alfa de uma delas fica vermelho, que é o que se quer. |
| **Decimal lido errado** | `(\d+)px` em `padding: 13.5px` falhava no `13` e casava `5px` no lance seguinte — e 5 estava nas exceções, então **a medida passava valendo outra coisa**. |
| **O `svh` não era exigido** | O caso exigia que `100vh` não aparecesse sozinho, o que deixa passar folha nova que não use nem um nem outro. |
| **A escala de 4 não olhava `protocolo.css`** | Nem olhava `padding-left`. Metade do espaçamento do app não passava pela régua. A frente 4 mediu o efeito: de **20 ofensores mal atribuídos para 6 certos**. |
| **Os dois casos de ancestral olhavam árvores diferentes** | O pior: **um `overflow: hidden` em `#app` mataria o sticky da única saída da sessão, e nenhum dos 38 pegaria.** Quem consertou viu uma exceção que a frente 4 não tinha visto — a classe de travar o corpo, que é um `overflow: hidden` legítimo no `body`; sem nomeá-la, a verificação da cadeia inteira fica vermelha no código certo. |
| **Seis casos presos a seletor literal** | Dois deles a uma **lista em ordem** numa regra só, então renomear ou reordenar quebrava o teste sem quebrar o produto. |

**A regra que guiou esta parte:** um caso que fica genérico tem de **continuar
pegando o defeito original**. Cada um foi provado quebrando o CSS de propósito,
vendo o vermelho e desfazendo.

---

## 3 · Os sete apps que nunca eram fechados

`tests/fluxo/migracaochave.test.js` subia **7 apps e chamava `fechar()` zero
vezes**. Sinalizado como consequência não medida no `09-desligamento.md`.

**Conferido por leitura, não instrumentado — e está dito assim de propósito.** O
fato decisivo é que `ligaBatida()` é chamada **sem guarda nenhuma** no boot: não
pergunta se existe sessão. A única proteção é contra ligar duas vezes na mesma
janela. Então cada um dos 7 apps ligava um `setInterval` que **nada desligava**,
porque a janela nunca era fechada nem desligada.

**O que a consequência NÃO é:** contaminação entre testes. Cada janela tem o seu
próprio estado e o seu próprio armazenamento, e o corpo do intervalo sai na
primeira linha quando não há sessão — e nenhum dos 7 testes abre sessão. Nenhuma
rejeição vinha deles, e a suíte não mentia por causa disto.

**O que a consequência é:** 7 relógios vivos e 7 janelas presas na memória
enquanto aquele arquivo roda. E, mais importante, **um gatilho a um passo de
armar**: o intervalo é o que chama o fecho automático da sessão, que grava e
redesenha. Hoje não há sessão para ele fechar. **Basta alguém acrescentar a este
arquivo um teste que semeie uma sessão aberta** para o intervalo passar a fechá-la
sozinho no meio do arquivo e mudar o resultado de outro caso.

Consertado, porque custa uma linha por teste: `a.fechar()` nos sete. Suíte
conferida depois — **957, zero rejeições.**

---

## 4 · O que não foi medido

- **Se o vermelho de 1 em 24 acabou.** O nome do caso foi perdido quando
  apareceu, e a causa suspeita (as quatro rejeições) foi removida antes de se
  poder correlacionar. Segue **suspeita, não medida**, e não dá mais para medir.
- **Memória.** Ninguém mediu quanto as 7 janelas custavam, nem quanto se
  ganhou. O conserto entrou pelo gatilho latente, não por número de memória.
- **Tempo da suíte**, antes e depois. Não medido.
- **O resto da suíte quanto a `fechar()`.** São 517 casos e vários arquivos
  embrulham a abertura do app em auxiliares locais, então contagem por busca de
  texto não é confiável. **Só este arquivo foi auditado**, por instrução. Pode
  haver outros.
- **Os 25 casos amarrados a nome concreto.** A frente 4 recontou e são 25, não
  10. Os oito buracos deste documento são sobre o que o caso **verifica**; quais
  dos 25 sobrevivem a um renome de seletor é trabalho da reescrita, e não foi
  feito aqui.

Nenhuma estimativa de prazo em nenhuma linha.
