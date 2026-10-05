# Fixtures de estado congelado

Uma migração lê dado **escrito no passado**, pelo código do passado. Uma fixture
digitada à mão tem a forma que quem digita imagina — que é a forma de hoje, e é
justamente a que a migração não vai encontrar no aparelho.

Por isso o que está aqui não foi escrito à mão.

## `estado-plano-9.json`

O estado inteiro (as 32 chaves de topo), produzido pelo **build do plano 9**,
antes da migração 9 → 10 existir. Gerado assim:

1. `npm run build` no commit `39d2fdb` (`PLANO_ATUAL = 9`);
2. o app subiu no harness de `tests/fluxo/harness.js`, com `Date.now` fixado
   em 02/10/2026 08h12 local;
3. um dia foi vivido pelos verbos do app — `CTX.marcaRefeicao`, `CTX.setAgua`,
   `CTX.setEscala`, `CTX.setCadenciaDeHoje`, `CTX.registraPeso`,
   `CTX.registraCintura` —, o relógio andou 24 h e `diaDeComida()` fechou esse
   dia no histórico;
4. um segundo dia foi marcado e ficou **aberto**, com turno e enquadramento;
5. `JSON.stringify(S)` foi gravado aqui, sem edição.

O que ela prova, e que um objeto inventado não provaria:

- `dia.done` é `{"pos":1,"almoco":1,"lanche":1}` — o literal `1`, que é a forma
  que a migração 9 → 10 converte em instante;
- `comidaHist[0].done` já traz instantes, **todos iguais**: `fechaDia` carimbava
  as marcas com a hora do FECHAMENTO, porque o dia corrente não guardava a hora
  de cada uma. É o defeito que a convergência do `done` corrige daqui para a
  frente, e que a fixture registra para trás;
- `body` tem duas chaves e só duas — `peso` e `cintura`.
