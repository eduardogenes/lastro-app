# O mapa do Lastro — brief do time

## Para que serve

O dono quer a documentação completa do app, **ponta a ponta, parte por parte,
funcionalidade por funcionalidade**, com fluxogramas. O objetivo é que dê para
entender qualquer parte do app sem ler o código, e que cada parte possa depois
**evoluir como um serviço individual**. Por isso cada documento termina com a
proposta de fronteira daquela parte como serviço.

Quem lê: o dono primeiro (linguagem clara, sem jargão do código no corpo do
texto) e, depois, quem for evoluir cada serviço (o índice técnico no fim de
cada documento leva ao código).

O app: **Lastro**, um PWA em Preact para registrar treino de musculação, aula
de box (HYROX), cardio, comida, corpo (peso, medidas, bioimpedância, fotos) e
aplicar as regras de um treinador e de um nutricionista (que são agentes de IA
do dono). Funciona sem rede; a nuvem (Supabase) é cópia. Roda no iPhone do
dono, instalado na tela de início.

## Regras do time

1. **Leia o código para afirmar.** Cada fluxo, regra e número tem de sair do
   código (ou dos testes, que descrevem o comportamento esperado). Não deduza
   pelo nome da função. Quando não tiver certeza, escreva "**a confirmar:**" e
   o porquê. Nunca invente comportamento.
2. **Não mexa em código nem em teste.** Você só escreve o SEU documento, no
   caminho que o coordenador deu. Não toque nos documentos dos outros nem em
   `docs/redesign/`.
3. **Português, linguagem clara.** No corpo, nomes de tela e de botão como
   aparecem para o usuário ("Iniciar treino", "Pôr este dia em dia"); nomes de
   função só no índice técnico (e, se ajudar, entre crases e discretos).
4. **Cubra tudo da sua área**, inclusive o que é raro: estados vazios, erros,
   falta de rede, armazenamento cheio, desfazer, o que acontece se o app fechar
   no meio, o que acontece em dois aparelhos.
5. **Fronteiras:** quando sua área USA algo de outra (ex.: o Agora mostra a
   linha da comida), descreva só a ligação e diga a qual área o comportamento
   pertence. Não duplique o fluxo do vizinho.
6. **Cobertura:** `docs/mapa/_inventario.md` lista tudo o que existe no código
   (pontos de entrada `CTX.*`, funções de `main.jsx`, regras do domínio, campos
   do dado `S.*`, estado de tela `view.*`, telas e testes). No índice técnico,
   liste os itens do inventário que o seu documento cobre. Se achar um item que
   é da sua área e não está no inventário, inclua também.

## O documento (um arquivo `docs/mapa/NN-area.md`)

Use estas seções, nesta ordem, com estes títulos:

```
# NN · Nome da área

> Em uma frase: o que esta parte faz e para quê.

## 1. O que o usuário faz aqui
Lista de funcionalidades. Para cada uma: nome curto (como o usuário chamaria),
o que faz, onde fica (tela, aba, botão), e quando aparece/some.

## 2. Mapa da área
Um fluxograma de visão geral: as telas e os caminhos entre elas, de onde se
entra e para onde se sai.

## 3. Fluxos, um por funcionalidade
Para cada funcionalidade: um fluxograma do caminho do usuário até o dado
(toques → o que o app calcula → o que grava → o que a tela mostra depois),
com os desvios (vazio, erro, recusa do aparelho, sem rede, desfazer). Depois
do diagrama, um parágrafo curto com o que o diagrama não mostra.

## 4. Estados da tela
Tabela: estado | quando acontece | o que a tela mostra.

## 5. Dados
- O que esta área GUARDA (campos de `S.*`, cache de fotos, chaves locais),
  com o formato de cada um e quem mais lê.
- O que só LÊ de outras áreas.
- Como cada dado atravessa a sincronia entre aparelhos (se é coleção com chave
  e carimbo, documento inteiro, lápide ao apagar).

## 6. Regras
As regras de negócio, numeradas, com os números exatos (limites, prazos,
fórmulas) e de onde vêm (treinador, nutricionista, decisão do dono, desenho).

## 7. Ligações com as outras áreas
Tabela: área | o que esta recebe dela | o que esta entrega a ela.

## 8. Como serviço individual
A proposta de fronteira: o nome do serviço, o que ele possui (dados), as
operações que ofereceria (como uma API: verbo + o que recebe + o que devolve),
os eventos que emitiria e os que escutaria, e o que hoje está acoplado e
precisaria ser separado.

## 9. Riscos e dívidas que apareceram na leitura
Só registrar, sem consertar. Inclua o que parecer bug, com o caminho para
reproduzir.

## 10. Índice técnico
- Arquivos (com o papel de cada um).
- Funções de `main.jsx` com a linha, `CTX.*`, componentes, regras do domínio.
- Campos `S.*` e `view.*`.
- Testes que cobrem a área (arquivo e nome do caso, quando ajudar).
```

## Fluxogramas (Mermaid)

O documento será mostrado numa página que desenha Mermaid. Para não quebrar:

- Sempre `flowchart TD` (ou `LR` quando for uma sequência curta de telas).
- Ids dos nós só com letras e números (`A1`, `salva`, `erroCota`).
- **Todo rótulo entre aspas duplas**: `A1["Toca em Iniciar treino"]`,
  decisão `D1{"A sessão já existe?"}`, início/fim `F1(["Tela do Agora"])`.
  Dentro do rótulo, nada de aspas duplas, crases, `<`, `>` ou `|`. Para quebrar
  linha use `<br/>`.
- Texto nas setas: `A1 -->|"sim"| A2`.
- Cores por papel, com estas classes no fim de cada diagrama (use as que
  aparecerem):
  ```
  classDef tela fill:#E4EFE8,stroke:#24604A,color:#161A17
  classDef acao fill:#FFFFFF,stroke:#69716B,color:#161A17
  classDef dado fill:#FFF6D6,stroke:#9A7A12,color:#161A17
  classDef erro fill:#FBEAE2,stroke:#A63F17,color:#161A17
  classDef decisao fill:#F4F5F1,stroke:#434B45,color:#161A17
  ```
  `tela` para o que o usuário vê, `acao` para o que ele faz ou o app calcula,
  `dado` para gravar/ler (aparelho, nuvem, cache), `erro` para falhas e
  recusas, `decisao` para perguntas.
- No máximo ~30 nós por diagrama. Se crescer, divida em dois.
- Cada bloco Mermaid dentro de ` ```mermaid ` … ` ``` `.

## Entrega

Ao terminar, responda ao coordenador com: o caminho do arquivo, as
funcionalidades cobertas (lista curta), os itens "a confirmar", os possíveis
bugs encontrados e qualquer item do inventário que você achou que é de outra
área e ninguém deveria esquecer.
