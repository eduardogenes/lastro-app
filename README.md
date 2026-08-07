# Treino

Aplicativo pessoal de registro de treino, cardio e acompanhamento corporal.
Arquivo único, sem build, sem dependências, funciona offline, instalável na tela
de início do iPhone.

Não é um produto. É uma ferramenta feita para um programa de treino específico,
e várias decisões de interface só fazem sentido dentro dele.

## Contexto de uso

Usado de pé, com uma mão, suado, às 6h15 da manhã, em academia com sinal ruim.
Isso governa quase tudo: alvos de toque grandes, nada que exija precisão,
nenhuma tela que dependa de rede, e o rascunho do treino salvo a cada tecla para
que fechar o app no meio não custe nada.

O app existe em parte para **frear** a progressão de carga, não só registrar:
tendão adapta mais devagar que músculo, então o selo de subir carga só aparece
quando todas as séries batem o topo da faixa, e fica suspenso depois de pausa
longa.

## Regras inegociáveis

Elas são load-bearing. Quebrar qualquer uma delas exige decisão consciente.

1. **Um arquivo só**, sem build e sem dependência externa — exceto a fonte do
   Google Fonts, que tem fallback de sistema.
2. **Não quebrar dados salvos.** Mudança de formato exige migração que leia a
   versão antiga. `load()` preenche campos novos com padrão.
3. **Mobile-first de verdade.** Ver contexto de uso acima.
4. **Identidade visual fixa.** Paleta e tipografia abaixo.
5. **Interface toda em português**, tom direto, sem emoji, sentence case.
6. **Não inventar prescrição de treino.** A ferramenta mede e freia; ela não
   reescreve o programa.

## Identidade visual

| Papel | Cor |
|---|---|
| Fundo | `#0D1520` |
| Cartão | `#15202E` |
| Elevado | `#1C2A3B` |
| Borda | `#26374C` |
| Texto | `#E9EFF6` |
| Secundário | `#8DA0B8` |
| Apagado | `#48607C` |
| Âmbar (acento) | `#F5A83C` |
| Laranja (só alertas) | `#E8734A` |

Archivo para títulos e corpo, IBM Plex Mono para números e rótulos. Número é
sempre monoespaçado.

## Arquitetura

CSS e JS inline em `index.html`. Render é baseado em string: `render()` reescreve
o `innerHTML` de `#app` e despacha para a tela certa conforme o estado de `view`.

- `PLAN` — os 6 treinos (A–F) e seus 41 exercícios
- `ALT` — substitutos por padrão de movimento, indexados por nome do exercício
- `RULES` — conteúdo da aba de execução
- `DORES`, `PRIO`, `MODAIS` — vocabulários fixos
- `S` — estado persistido
- `view` — estado de interface, não persistido

### Estado persistido

Chave única `treino-eduardo-v1`.

```js
S = {
  logs: {
    // 'A0' = treino A, exercício 0. 'A0~Nome' = substituto daquele exercício.
    // Carga de substituto nunca entra no histórico do original.
    'A0': [{
      t: 1712345678901,       // timestamp
      sets: [[peso, reps]],   // em exercício por tempo, [carga, segundos]
      u: 'seg',               // opcional, marca exercício por tempo
      obs: 'texto',           // opcional
      dor: ['cotovelo'],      // opcional: cotovelo | ombro | patelar
      dl: 1,                  // opcional, sessão feita em modo deload
      aq: 1                   // opcional, aquecimento marcado
    }]
  },
  done: [{ day: 'A', t: 0, dl: 1 }],   // dl exclui da conta das 48 sessões
  deload: false,
  draft: null,                          // treino em andamento, expira em 14h
  cardio: [{ t: 0, m: 'bike', min: 20, i: 'leve' }],
  body: { peso: [{ t: 0, v: 73.4 }], cintura: [{ t: 0, v: 80.5 }] },
  export: 0                             // timestamp do último backup
}
```

Campos novos entram sempre como opcionais e recebem padrão em `load()`. Nenhuma
migração destrutiva foi necessária até hoje.

### Camada de storage

`DB` expõe `get`, `set` e `delete` assíncronos com cascata
`window.storage` → `localStorage` → memória. Toda escrita é espelhada no
`localStorage`, e se o host vier vazio mas houver espelho, o histórico é
resgatado dele. Trocar de ambiente não zera nada.

### Detalhes que parecem bugs mas são propositais

- O cronômetro guarda o **instante** em que o descanso acaba, não um contador.
  O iOS suspende o JavaScript com a tela apagada; com contador, congelava.
- Os campos numéricos são `type="text"` com `inputmode`. `type="number"`
  descarta vírgula, e no teclado pt-BR "22,5" chegava como string vazia.
- `topReps()` não pode se chamar `top()`: `window.top` é read-only no escopo
  global de um documento e o script inteiro morria antes de rodar.
- Séries por músculo comparam a semana corrente com o **mesmo ponto** das
  semanas anteriores. Contra semanas cheias, toda terça-feira o painel inteiro
  apareceria despencando.

## Rodar

Abrir `index.html` no navegador. Não há passo de build.

Para testar o service worker é preciso `https` ou `localhost`:

```
npx serve .
```

## Publicar

Ver [COMO-PUBLICAR.md](COMO-PUBLICAR.md). Resumo: arrastar a pasta em qualquer
hospedagem estática, abrir no Safari, Adicionar à Tela de Início.

Ao publicar versão nova, subir o número de `CACHE` em `sw.js`. Isso importa
menos do que parece: o service worker já busca o `index.html` da rede primeiro e
só cai no cache sem sinal, então o app se atualiza sozinho. O número do cache
governa ícones e manifest.

## Dados e backup

O histórico mora no navegador do aparelho. A aba **dados** exporta e importa
tudo em JSON, e o app cobra um backup a cada 30 dias.

Não há servidor e não há sincronização. Foi decisão consciente: um usuário, um
escritor, dados minúsculos, offline obrigatório. Nesse perfil, um banco remoto
adiciona dependência de rede a um fluxo que hoje não tem nenhuma.

## Estado do roadmap

[DIAGNOSTICO-fluxo-ponta-a-ponta.md](DIAGNOSTICO-fluxo-ponta-a-ponta.md) tem o
fluxo mapeado ponta a ponta e o roadmap priorizado. P0, P1 e P2 concluídos.
