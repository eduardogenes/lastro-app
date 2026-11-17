# Protótipos do redesenho do Lastro — direção 3

Estado em 16/11/2026. Os protótipos são **só visual**: mostram como cada tela
é e se comporta. O que construir a partir deles está em `../00-plano.md`.

## Os arquivos

Cada `.html` abre sozinho no navegador. No celular ocupa a tela; no
computador aparece dentro de um aparelho, com um texto ao lado.

As páginas existem nas duas contas do claude.ai que o dono usa. Cada link
abre só na conta em que foi publicado.

| Arquivo | Lote | Conta principal (a de 16/11) | Conta secundária (republicada em 17/11) |
|---|---|---|---|
| `hoje.html` | base: Hoje, Treino em foco, Corpo, Dias, Semana, Plano, botão "+" | https://claude.ai/artifact/QZcnUuZmEsB24AoUB2gAEN | https://claude.ai/artifact/WVcNEX3ifCh2JctGG3qYY6 |
| `fotos.html` | 1 · Fotos | https://claude.ai/artifact/GxmcE6dq1uoU1qBf5oVNJp | https://claude.ai/artifact/KNvYxCWcXwiNNfGtUP5uB3 |
| `corpo.html` | 2 · Corpo e evolução | https://claude.ai/artifact/AKWdEXpZmQ9eiaHgu67iQG | https://claude.ai/artifact/WSvR1zqfZFxRo7wdHwMWgh |
| `treino.html` | 3 · Treino | https://claude.ai/artifact/LxK55rabgpPZNM8d6H9kDU | https://claude.ai/artifact/HvGNaVtdWwEmnNa2JPspXt |
| `resto.html` | 4 · Dias, Semana, Comida, Compras, Ajustes, primeira vez, estados | https://claude.ai/artifact/RfzhQHzoKHaQyaEZiZ5798 | https://claude.ai/artifact/TPo8peQPGzrdR2QtL4Ccvn |
| decisões da câmera (fase 1) | página de perguntas ao dono | https://claude.ai/artifact/EntxrWGb8esXjWYsXc5YwL | https://claude.ai/artifact/GDLK3U4pqYHQRcWhFjGTTU |

Os arquivos daqui são a fonte das duas: se um link não abrir, a conta ativa é
a outra.

Os roteiros `ver*.mjs` (guardados em `~/Lastro-prototipos/testes/`, fora do
repositório) são os que percorreram cada protótipo num
Chromium a 414 × 896 (o tamanho do iPhone 11 Pro Max). Rodam com
`node testes/verN.mjs <pasta>`, mas apontam para a pasta temporária onde os
protótipos foram feitos: ajustar o caminho do `goto` antes de usar. Todos
terminaram sem erro de página e sem rolagem lateral. **Nenhum foi testado
num iPhone de verdade.**

## A direção, em uma frase cada

- Um bloco de cor no topo diz o que importa agora, com um botão só; a cor muda
  com o momento (treino, refeição, pergunta do dia, livre).
- Registro por exceção: a comida se responde com "foi como o plano?", por dia,
  e não refeição por refeição.
- Número se arrasta numa régua (peso, carga, repetição, medida, quantidade de
  alimento), sem teclado.
- Treino uma série por tela, já preenchida com a da última vez.
- Nada é obrigatório: água, peso, cardio, medidas extras e lembretes se ligam
  e desligam; dia em branco fica fora da conta, não vira zero.
- Tipografia: Bricolage Grotesque (títulos e números) e Instrument Sans
  (texto). Paleta clara: papel `#F6F3EC`, tinta `#0F0F0D`, lima `#D2F23A`,
  tangerina `#FF9A4D`, lilás `#D3C6FF`, céu `#BBDDFB`, menta `#BEEBD2`.

## O que o dono decidiu no caminho

1. Fotos: existe "tirar mesmo assim" quando nível, altura ou distância não
   estão certos; a sessão fica marcada como fora do padrão e aparece assim ao
   comparar.
2. Fotos: a foto anterior sobreposta começa ligada.
3. Medidas com fita: a segunda leitura é sempre pedida; "guardar só esta"
   existe e a medida fica marcada como "uma leitura só".
4. Treino: precisa cobrir quem treinou e esqueceu de anotar. Feito com "Já fiz
   mais do que anotei" (no meio), "Já treinei e não anotei" (depois) e um
   aviso quando o intervalo passa muito do descanso.

Decidido depois, em 16/11: exercício "registrado depois" **conta igual** para
a sugestão de subir carga; as abas ficam **Hoje** e **Plano**; o que a captura
de fotos automatiza fica com o Fable, com liberdade total, e sempre há rede.
O plano de implementação está em `../00-plano.md`.

## O que ficou de fora ou simulado (para a revisão)

- **Hoje (base):** a faixa "simular hora" é do protótipo. O campo de texto do
  "+" entende só palavras simples.
- **Fotos:** o manequim desenhado substitui as fotos. Os três indicadores da
  câmera se acertam por toque, para simular. A foto torta é simulada na
  5ª pose.
- **Corpo:** pesagens do dia a dia e variações das semanas antigas são
  ilustrativas (peso atual, cintura e bioimpedância são reais). Nova leitura
  de bioimpedância só está descrita. Corrigir ou apagar medida antiga não
  abre nada.
- **Treino:** cargas e históricos de vários exercícios são ilustrativos. Só o
  Treino B abre no editor. A revisão do treinador usa 5 mudanças de exemplo.
  Adicionar exercício, criar treino, foto do aparelho e trocar nome são linhas
  sem ação. Aula do box ficou de fora, por decisão dele.
- **Lote 4:** respostas de comida e veredito são simulados; "Aplicar no plano"
  e "Restaurar cópia" só mostram a confirmação. Retrospectiva do bloco, cardio
  e criar alimento ou refeição são linhas sem ação.
- **Telas do app atual sem desenho novo:** câmera real com sensor, aula do
  box, retrospectiva do bloco, histórico de sessão passada (corrigir série a
  série), lixeira com itens.

## O que conferir numa revisão minuciosa

- Coerência entre os cinco arquivos: o `hoje.html` é a base mais antiga e tem
  pequenas diferenças de tamanho de título e de bloco em relação aos lotes
  1 a 4 (que vieram depois e são mais compactos).
- Textos: português, segunda pessoa, sem "parabéns". Procurar frase longa
  demais em botão e qualquer termo técnico ("RIR", "e1RM") sem explicação.
- Alvos de toque: tudo que se aperta durante o treino tem pelo menos 44 px.
- Contraste das legendas cinza sobre os blocos de cor (lilás e lima).
- Cada regra do app atual que os protótipos mudaram: está listada em
  `docs/LASTRO_UX_CONTRACT.md` e `DESIGN.md`, que ainda descrevem o visual
  antigo. Atualizar esses documentos faz parte da passagem para código, não
  desta etapa.
