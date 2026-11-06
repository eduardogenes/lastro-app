# Espelho — a pasta de leitura dos dados

Monta no computador uma pasta com tudo o que o app registrou (treino, comida,
corpo e as fotos), organizada por assunto. Existe para os agentes (treinador,
nutricionista), que leem no Claude Cowork, e para quem quiser conferir os dados
sem abrir o app.

```
npm run espelho
```

Na primeira vez pede o e-mail e a senha da conta do app. A senha não fica
guardada: o que fica é o token da sessão, em `~/.config/lastro/espelho.json`,
que só o seu usuário consegue ler. Depois disso, cada execução só atualiza a
pasta. Ela reescreve apenas o que mudou, baixa só as fotos novas e apaga o que
saiu do app.

| Opção | O que faz |
|---|---|
| `-- --pasta DIR` | usa outra pasta (o padrão é `~/Lastro`) e passa a lembrar dela |
| `-- --de-arquivo F` | monta a partir da cópia baixada em Ajustes → Exportar, sem login e sem fotos |
| `-- --sair` | esquece o login guardado neste computador |

## O que sai

```
Lastro/
├── LEIA-ME.md                  índice, resumo e como ler cada arquivo
├── treino/
│   ├── programa.md             o programa de hoje
│   ├── programa-do-treinador.md
│   ├── mudancas.md             decisões registradas e mudanças esperando decisão
│   ├── historico/AAAA-MM.md    cada sessão, série por série
│   ├── series.csv              todas as séries, para análise
│   ├── cardio.csv
│   ├── exercicios.md
│   └── aparelhos/              fotos dos aparelhos
├── nutricao/
│   ├── plano.md
│   ├── dias.csv
│   ├── ajustes.md
│   └── alimentos.csv
├── corpo/
│   ├── medidas.csv             peso, bioimpedância, fita (cm) e dobras com adipômetro (mm)
│   ├── fotos.md                hora de cada foto e leituras de gordura visual
│   └── fotos/AAAA-MM-DD/       uma foto por pose
└── bruto/estado.json           o estado inteiro, sem tratamento
```

## No Claude Cowork

1. No Claude Desktop, abra o Cowork e conecte a pasta `~/Lastro`. Se o app
   oferecer acesso só de leitura, use esse: os agentes não têm o que gravar ali.
2. Nas instruções da pasta, escreva: "Comece lendo LEIA-ME.md. Os dados são do
   app Lastro; descreva o que eles mostram e não invente o que não está lá."
3. Rode `npm run espelho` antes de uma conversa com os agentes. A pasta mostra
   o que estava na nuvem naquela hora; o LEIA-ME diz quando foi.

## Para quem mexe no app

- A organização inteira está em `monta.ts`, que é puro e testado em
  `tests/dominio/espelho.test.ts`. Rede e disco ficam em `espelho.ts`.
- Mudou o formato do estado (campo novo, migração)? Confira se `monta.ts`
  precisa ler o campo novo. O `bruto/estado.json` sempre o leva, mas os
  arquivos organizados só mostram o que `monta.ts` conhece.
- A ferramenta só apaga o que ela mesma escreveu (o manifesto `.espelho.json`
  lembra o quê) e se recusa a usar uma pasta que já tenha arquivos de outra
  origem.
