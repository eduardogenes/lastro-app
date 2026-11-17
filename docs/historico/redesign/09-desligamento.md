# 09 · O desligamento

O app não tinha fim. Ganhou um, e as quatro rejeições não tratadas da suíte de
fluxo acabaram.

Este documento registra **o que foi medido**, com o comando ao lado de cada
número, e separa isso do que continua sendo suspeita. Onde não houve medida,
está escrito "não medido" — e isso inclui a pergunta que originou o trabalho.

**Nada aqui é estimativa de prazo ou de esforço.**

---

## 1 · A linha de base, medida aqui

```
npx vitest run --project fluxo 2>&1 | grep -c "Unhandled Rejection"
→ 4
```

As quatro, com `grep 'originated in'`, saem todas do mesmo arquivo:
`tests/fluxo/protocolo.test.js` — o caminho do byte da foto de corpo, 58 casos.
Duas de cada tipo:

| Erro | Último teste documentado antes dela |
|---|---|
| `Cannot read properties of undefined (reading 'createElementNS')` | referência sem bytes em lugar nenhum não quebra a tela |
| `Cannot read properties of undefined (reading 'createElementNS')` | comparar abre numa pose que tem par, não num vazio |
| `Cannot read properties of undefined (reading 'addEventListener')` | o mesmo recorte é aplicado na captura e na comparação |
| `Cannot read properties of undefined (reading 'addEventListener')` | andar entre poses não joga a sessão de fotos para o topo |

O `undefined` é o `document`: a janela do jsdom já foi fechada e algo ainda
desenha. Rodando só aquele arquivo, as quatro se reproduzem inteiras — não é
interferência entre arquivos.

Um dos quatro casos **já descrevia o bug no próprio comentário**, e tentava
contorná-lo esperando mais:

```js
// A busca de bytes continua em voo: fechar a janela no meio dela deixa o
// render que o aviso de falha dispara sem documento para desenhar.
await a.esperar(80);
a.fechar();
```

O `esperar(80)` não bastava. Esperar mais nunca ia bastar: o problema não é
tempo, é não haver desligamento.

---

## 2 · A causa, medida

O harness fechava a janela debaixo de um app que continuava trabalhando. O
desligamento inteiro eram duas linhas (`stopTimer()` e `w.close()`), e o app não
tinha nenhuma desmontagem — `grep -nE "render\(null|unmount" src/ -r` não achava
nada.

**A medida.** Instrumentei `garanteBytesDoCorpo` (um aviso depois de cada
`await`) e `render()` (um aviso na entrada), com um canal que só fala depois de a
janela ser marcada como fechada. Rodando `protocolo.test.js`:

| Aviso | Vezes depois do fechamento |
|---|---|
| `GARANTE-pos-tem` (volta do `CORPO.tem`, IndexedDB) | 9 |
| `GARANTE-pos-baixaCorpo` (volta da rede) | 3 |
| `GARANTE-fim mudou=true` | 6 |
| `RENDER-APOS-FECHAR` | 6 |

E a pilha de um desses renders, com build sem minificação:

```
at render (https://lastro.test/app.html:12355:3)
at garanteBytesDoCorpo (https://lastro.test/app.html:9098:14)
```

Então: `garanteBytesDoCorpo` volta de doze `await` depois do fechamento e chama
`render()` seis vezes sobre um documento que não existe mais. Ela é chamada
**sem `await`** — "os bytes vão por fora" —, então o erro não cai em `try` nenhum
do app: vira rejeição não tratada.

**A outra metade.** Os dois `addEventListener` têm pilha diferente: no fundo
dela está a fila de re-render do próprio Preact, e o quadro de cima é um efeito
de `useEffect` sendo executado durante `options._render`. Ou seja: além do
render direto, havia **trabalho já enfileirado dentro do Preact** — um
`useState` agenda o re-render num microtask, e um `useEffect` espera a pintura.
Os dois acordavam depois do `close()`. Os `addEventListener` em efeito são os de
`tabbar.jsx`, `folha.jsx` e `primitivos.jsx`.

**Por que desmontar resolve as duas metades.** No Preact 10.29.8, quem executa
o que ficou pendente confere uma coisa só — se o componente ainda tem
`_parentDom`:

```
node_modules/preact/src/component.js:124      if (component._parentDom && component._dirty) {
node_modules/preact/hooks/src/index.js:445    if (!component._parentDom || !hooks) continue;
node_modules/preact/src/diff/index.js:668     r.base = r._parentDom = r._globalContext = NULL;
```

A última linha é o `unmount`. Desmontar zera `_parentDom` em toda a árvore, e com
isso o re-render enfileirado e o efeito pendente são **descartados** em vez de
rodarem contra o vazio. Não é efeito colateral: é o mecanismo.

---

## 3 · O conserto

Três peças, nesta ordem.

**`src/ui/raiz.jsx` — `desmontaDoApp()`.** `render(null, raiz)` do Preact, mais
`raiz = null`. O contraponto do `montaNoApp()` que já existia.

**`src/main.jsx` — `CTX.desliga()`.** Marca `desligado`, para os **três**
relógios (o cronômetro por `stopTimer()`, o relógio da sessão, a batida de
sessão esquecida — o harness só parava o primeiro) e desmonta a árvore. A ordem
importa: travar o render **antes** de desmontar, senão uma continuação remonta a
árvore inteira e o desligamento desligou nada.

`render()` ganhou `if (desligado) return;` — como complemento, não como
mecanismo (§5). E `garanteBytesDoCorpo` sai cedo depois de cada `await`.

Exposto em `CTX` e não em `window`: `CTX` já é o saco de verbos que o harness
usa (`CTX.vaiPara`, `CTX.abreProtocolo`), e é um objeto que escapa como prop —
o que o mantém fora do alcance do `treeshake: true` (§5).

**`tests/fluxo/harness.js` — `fechar()`** chama `CTX.desliga()` antes de
`w.close()`, no lugar do `stopTimer()` solto.

---

## 4 · A medida depois

```
npx vitest run --project fluxo 2>&1 | grep -c "Unhandled Rejection"
→ 0

npm test
→ Test Files  53 passed (53)
→      Tests  954 passed (954)

npm run tipos
→ sem erro
```

**4 → 0.** Nenhum caso perdido: 954 antes, 954 depois. Nenhuma expectativa de
teste foi tocada — o diff em `tests/` é só o `fechar()` do harness.

### As dez execuções, uma por uma

`npx vitest run --project fluxo`, dez vezes seguidas:

| # | Rejeições não tratadas | Casos |
|---|---|---|
| 1 | 0 | 517 passando |
| 2 | 0 | 517 passando |
| 3 | 0 | 517 passando |
| 4 | 0 | 517 passando |
| 5 | 0 | 517 passando |
| 6 | 0 | 517 passando |
| 7 | 0 | 517 passando |
| 8 | 0 | 517 passando |
| 9 | 0 | 517 passando |
| 10 | 0 | 517 passando |

**Dez execuções limpas não provam que a intermitência acabou.** A falha original
apareceu **uma vez em 24** execuções. Dez limpas são compatíveis com uma suíte
consertada e também com uma suíte que continua mentindo numa frequência que dez
tentativas não alcançam. Ausência de prova não é prova.

---

## 5 · O que foi tentado e descartado

**Guarda de render como mecanismo — não foi o caminho.** Já se tentou neste
projeto, e foi medido: levou de 4 para 6 rejeições, e foi revertido. A hipótese
registrada — tornar o render inerte deixa o trabalho assíncrono seguir e bater
num `undefined` mais à frente — é consistente com o que se mediu agora: o render
direto era só metade do problema, e a outra metade (fila do Preact) **não** é
alcançada por uma guarda em `render()`, porque não passa por lá. Uma guarda
sozinha silencia o caminho visível e deixa o invisível. A guarda existe no
conserto, mas como complemento do desligamento. **Não re-medi o 4 → 6:** aceitei
a medida anterior.

**A primeira instrumentação mentiu, e quase me levou para o lado errado.**
Instrumentei `render()` e não recebi **nenhum** aviso — leitura que diz "o render
não é chamado depois do fechamento", que é o contrário do que se mediu depois. O
motivo: `vite.config.js` liga `treeshake: true` de propósito, e a função que
marcava o fechamento só era alcançável por string (via `__escopo`). O Rollup a
removeu; sem ela, a variável nunca era reatribuída; o Rollup então dobrou
`if (fechado)` em código morto e apagou o aviso inteiro. **Os dois builds saíram
com hash idêntico** — era o sinal, e a conferência honesta é `grep` da string de
diagnóstico no bundle.

A lição não é sobre instrumentação: é sobre o desligamento. Qualquer coisa
alcançável só por string **some do build**. É por isso que `desliga` entrou em
`CTX`, que é um objeto vivo, e não como função de módulo solta.

**`console.log` de dentro do jsdom não aparece no relatório do Vitest.** O canal
de diagnóstico virou `fs.appendFileSync` para um arquivo fora do projeto. Perdi
uma rodada nisso.

**Guardas em `reconciliaFotos` e `reconciliaCorpo` — medidas, e não entraram.**
São candidatas naturais (ambas `async`, ambas chegam a tocar a tela). Instrumentei
as duas depois de cada `await`, com o conserto já no lugar, e rodei o projeto
`fluxo` inteiro: **nenhuma das duas volta depois do desligamento, em nenhum dos
517 casos.** Guardá-las seria especulação. Ficaram sem guarda, de propósito, e
este parágrafo é o registro de que a ausência é medida e não esquecimento.

**`leBruto` — descartada por leitura, não por medida.** O corpo inteiro está
dentro de um `try/catch` que devolve `null`, não toca DOM e não chama `render()`.
Não pode produzir rejeição não tratada.

**Onde `desligado` é declarado — não é estilo, é um bug evitado.** A declaração
está no topo do arquivo, longe de quem a escreve, com comentário explicando.
`load()` pode rodar ainda na avaliação do módulo (script de módulo é diferido, e
aí `document.readyState` já é `'interactive'`), e o boot pinta a primeira tela;
um `let` ao lado de `CTX.desliga()`, 4.600 linhas abaixo, faria dessa primeira
pintura um erro de TDZ — **em produção, não nos testes**, porque no jsdom o
script é inline e o `readyState` ainda é `'loading'`. A suíte não pegaria.

---

## 6 · O que eu NÃO medi

**O caso vermelho intermitente.** A suspeita que originou todo este trabalho é
que as quatro rejeições causavam a falha de 1 em 24 — uma rejeição que pousa
durante a execução de outro arquivo explicando uma falha que muda de lugar e não
se reproduz. **Não medi isso, e não dá para medir agora:** o nome do caso foi
perdido, e a causa foi removida. O elo entre as quatro rejeições e aquele
vermelho continua suspeita. O que mudou é que a suíte deixou de ter a condição
que o Vitest chama de *"might cause false positive tests"*.

**Casos que nunca desligam.** `tests/fluxo/migracaochave.test.js` sobe 7 apps e
chama `fechar()` **zero** vezes. Essas janelas nunca são desligadas nem fechadas
— e por isso também não produzem render pós-fechamento, que é o bug daqui. Não
medi se isso tem outra consequência. Não auditei o conjunto todo (517 casos
contra 506 chamadas de `fechar()`): vários arquivos embrulham `app()` em
auxiliares locais, e a contagem por `grep` não é confiável.
`publicacao.test.js` não sobe app nenhum — lê o fonte — e não entra nessa conta.

**O desligamento em produção.** `CTX.desliga()` **nunca é chamado no app real**:
não há `pagehide` nem `beforeunload` ligado nele. Foi deliberado — desmontar em
`pagehide` deixaria o app em branco ao voltar do cache de navegação do iOS, que é
exatamente como este app é usado. O verbo existe, está correto, e hoje só o
harness o usa. Não medi nada sobre comportamento em navegador de verdade.

**Os três relógios.** `desliga()` para os três intervalos, mas **não medi** que
algum deles estivesse vazando: o `close()` do jsdom já limpa timers, e nenhum
deles aparecia nas quatro rejeições. Estão ali como disciplina de desligamento,
não como conserto medido.

**O ganho de tempo.** Não medi se o desligamento deixa a suíte mais rápida.

---

## 7 · Por que isto não é higiene de teste

A regra da rede (`08-rede.md`) é "se um teste ficar vermelho, o erro é de quem
mexeu". Uma suíte que mente uma vez em 24 destrói essa regra, porque a primeira
reação a um vermelho passa a ser rodar de novo.

E o conserto não ficou no teste. O app passou a ter um desligamento: um ponto em
que ele para de renderizar, para os relógios e devolve a árvore. A reescrita das
telas vai precisar disso em qualquer tela que espere algo e volte para pintar —
e a pergunta `if (desligado) return;` depois de um `await` é o hábito que faltava.
