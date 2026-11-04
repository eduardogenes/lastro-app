# Captura das fotos do corpo: o plano

Origem: em 04/11/2026, o agente de avaliação física, no Cowork, auditou as 70 fotos das 10 sessões e escreveu 40 recomendações (R1 a R40). Ele trabalhou sobre a pasta do espelho, e o relatório completo está em `~/Lastro/corpo/recomendacoes-de-captura.md`, fora do repositório. Ele inclui dados do corpo, e o repositório é público.

Este arquivo registra o que foi conferido, o que entrou no app e o que falta. Os números R remetem ao relatório.

## O que foi conferido antes de seguir

- **Pré-protocolo com hora preenchida.** As 5 sessões de antes do protocolo estão com 08:00, 08:01… porque foram lançadas depois, com hora preenchida. Confere com o estado.
- **A sessão de 12/10 é do meio-dia.** O relatório diz que ela "foi à noite", pela cor da luz. O estado diz 12:33, com fotos a 8–40 s uma da outra, capturadas pelo app, e 12/10 foi feriado. A cor igual vem da mesma lâmpada de teto acesa.
- **A conta das lentes.** "2,5 m com a 1× mostra 1,67× mais" vale para a dimensão linear, não para a área. A conclusão não muda: as duas montagens não equivalem.
- **A lente da câmera do app.** Em 03/11, com o celular parado, a câmera do app e a do sistema enquadraram quase igual (3–4% de diferença). Portanto, naquele teste, as duas usaram a mesma lente. Qual lente as sessões antigas usaram ninguém sabe; o registro novo (abaixo) passa a dizer.
- **A pose 8 (costas, mãos na cintura) fica.** O relatório recomenda tirá-la, porque na execução ela virou uma pinça que cobre a cintura (R15). O dono decidiu mantê-la (04/11). A execução dela continua como estava.

## Primeira leva (04/11/2026): entrou no app

Nesta leva entrou só o que não depende de detectar o corpo na imagem.

- [x] **Montagem corrigida** (seção 3 do relatório):
  - uma lente e uma câmera só, sem a falsa equivalência entre 2,5 m com a 1× e 3 m com a 2×;
  - lente na metade da altura, que é a linha do quadril, e não o umbigo;
  - a mesma luz sempre, com a frontal como ideal;
  - janela de horário de 2 h;
  - roupa de cor média.
- [x] **Poses** (R16 a R20):
  - braços afastados um palmo nas relaxadas;
  - no abdômen, cabeça olhando o celular e sempre a perna esquerda à frente;
  - pés juntos no T no duplo bíceps de costas;
  - "marque passo" no perfil natural;
  - "olhe para a frente" nos perfis.
- [x] **Voz** (roteiro da seção 2c): cada pose tem uma frase curta (`voz`), e o giro é dito como "para a sua esquerda, um quarto de volta. Pés na marca."
- [x] **Sessão contínua** (aprovada em 03/11; R24 e R25): um toque tira a sessão inteira. Depois de cada foto, a contagem curta começa quando a voz **acaba**: 3 s, ou 5 s quando há giro. O botão vira "Parar".
- [x] **Disparo sempre à vista** (aprovado em 03/11): o quadro encolhe para caber com o botão, e o botão gruda no fundo da tela.
- [x] **Nível do celular** (aprovado em 03/11; R8): fica na tela, verde até 1° nas duas direções, e é gravado em cada foto. Vale só o tamanho da inclinação: o sentido depende do aparelho (ver `src/infra/nivel.ts`).
- [x] **Guias de cabeça e pés** (aprovadas em 03/11; R10): linhas fixas a 4% das bordas. As guias tiradas da montagem dependem da segunda leva.
- [x] **Sobreposta sem o zoom do ajuste** (aprovada em 03/11).
- [x] **Lente gravada** (R30, parte):
  - câmera do app: o rótulo da câmera e o zoom, quando o Safari informa;
  - câmera do sistema: o LensModel e a focal em 35 mm, lidos do EXIF antes da redução.
  - O espelho mostra as duas colunas novas, "Câmera" (com a lente) e "Nível".

## Segunda leva: depende de ver o corpo na imagem

Pede um modelo de pontos do esqueleto rodando no aparelho, dentro do PWA e sem rede. É um projeto à parte, e o custo dele (tamanho do modelo, bateria, desempenho no iPhone 11) precisa ser medido antes.

- [ ] R9: detecção do corpo e dos pontos do esqueleto ao vivo.
- [ ] R12: correção por voz em passos ("um passo para trás").
- [ ] R22: disparo automático quando o corpo estiver alinhado e parado.
- [ ] R23: rajada, guardando o melhor quadro.
- [ ] R26 e R27: conferência automática depois do disparo, com refazer na hora.
- [ ] R3: encaixe pelo fundo, com as bordas da montagem sobre o vídeo.
- [ ] R10, completo: guias tiradas da montagem, e não fixas.
- [ ] R33: comparação normalizada, com mesma escala e pés alinhados.
- [ ] R14: contorno da referência no lugar da foto translúcida.

## Também falta, sem visão computacional

- [ ] R11: aviso de luz, com brilho e cor do quadro comparados com a montagem.
- [ ] R2: calibração da primeira sessão, com a altura informada uma vez e a "assinatura da montagem".
- [ ] R5: cor da roupa conferida pelo app.
- [ ] R29: "hora desconhecida" para sessões lançadas depois, no lugar de 08:00.
- [ ] R31 e R40: horas desde a última refeição e o último treino, tiradas dos registros, junto do par comparado.
- [ ] R34 e R35: pares padrão "esta × 14 dias antes" e "esta × primeira do protocolo", com selo de comparabilidade.
- [ ] R39: janela de horário escolhida na montagem, e a marca "fora da sua janela".
- [ ] R7: Wake Lock e teste de volume no começo da sessão.
- [ ] R32: guardar o original maior quando vier da câmera do sistema (custa espaço no bucket).

## Como saber se a primeira leva funcionou

Os dados respondem, sem teste à mão. Depois da próxima sessão, `npm run espelho` mostra:

- em `corpo/fotos.md`, a lente de cada foto: as da câmera do app e as do sistema devem ter a mesma, e entre sessões também;
- a coluna "Nível", com as fotos do app até 1°;
- o horário das fotos, em segundos de distância, mostrando a sequência correndo sozinha.
