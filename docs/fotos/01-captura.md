# Captura das fotos do corpo: o plano

Origem: em 04/11/2026, o agente de avaliação física, no Cowork, auditou as 70 fotos das 10 sessões e escreveu 40 recomendações (R1 a R40). Ele trabalhou sobre a pasta do espelho, e o relatório completo está em `~/Lastro/corpo/recomendacoes-de-captura.md`, fora do repositório. Ele inclui dados do corpo, e o repositório é público.

Este arquivo registra o que foi conferido, o que entrou no app e o que falta. Os números R remetem ao relatório.

## O que foi conferido antes de seguir

- **Pré-protocolo com hora preenchida.** As 5 sessões de antes do protocolo estão com 08:00, 08:01… porque foram lançadas depois, com hora preenchida. Confere com o estado.
- **A sessão de 12/10 é do meio-dia.** O relatório diz que ela "foi à noite", pela cor da luz. O estado diz 12:33, com fotos a 8–40 s uma da outra, capturadas pelo app, e 12/10 foi feriado. A cor igual vem da mesma lâmpada de teto acesa.
- **A conta das lentes.** "2,5 m com a 1× mostra 1,67× mais" vale para a dimensão linear, não para a área. A conclusão não muda: as duas montagens não equivalem.
- **A lente da câmera do app.** Em 03/11, com o celular parado, a câmera do app e a do sistema enquadraram quase igual (3–4% de diferença). Portanto, naquele teste, as duas usaram a mesma lente. Qual lente as sessões antigas usaram ninguém sabe; o registro novo (abaixo) passa a dizer.
- **A pose 8 (costas, mãos na cintura) fica.** O relatório recomenda tirá-la, porque na execução ela virou uma pinça que cobre a cintura (R15). O dono decidiu mantê-la (04/11). A execução dela continua como estava. Em 06/11 a pinça acabou de vez: mãos só apoiadas, sem beliscar a pele, e o culote passou a ser lido pela pose nova de perfil com as mãos na nuca e pela fita no quadril. Na mesma revisão entrou a frente com os braços afastados, e o protocolo passou de 9 para 11 poses.

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

## Com alguém tirando (04/11/2026): entrou no app

Na vida real, quase sempre outra pessoa segura o celular. A primeira leva supunha o celular apoiado e a pessoa sozinha, e o dono apontou isso no mesmo dia. O modo com alguém tirando virou o padrão, e o sozinho ficou como estava.

O mesmo agente reviu a captura pelo lado de quem fotografa. O relatório está em `~/Lastro/corpo/recomendacoes-quem-fotografa.md`, fora do repositório. Nas fotos antigas, o fundo se mexe entre as fotos de todas as sessões medidas: todas foram tiradas com o celular na mão, sem lugar marcado para quem segurava. Os números F remetem a esse relatório.

O dono decidiu duas coisas antes do relatório:
- a foto nunca sai sozinha quando alguém tira: sai no toque;
- se o toque vier fora do nível, a foto sai, mas o app avisa que ela saiu torta e pergunta. "Repetir" leva o destaque; "Registrar assim" guarda a inclinação verdadeira junto.

- [x] **Escolha de quem tira:**
  - "Alguém tira para mim" (padrão) ou "Tiro sozinho", na montagem e na câmera;
  - a escolha fica no aparelho, e não no estado que sincroniza;
  - cada foto grava o modo (`Captura.modo`).
- [x] **Montagem de quem fotografa** (F1–F4, F6, F7, F11):
  - cadeira marcada com fita, com os cotovelos nos joelhos;
  - a altura pela regra do centro e a distância pelas linhas;
  - pegada com as duas mãos;
  - apoio como "melhor ainda", nunca como regra;
  - quem fotografa fora da frente da luz;
  - os punhos podem passar da linha de cima.
- [x] **Lente 1× sempre** (F5): a montagem dos dois modos diz isso, e a câmera do app pede o zoom 1 ao abrir e grava o que a câmera devolveu.
- [x] **Ajuste uma vez, na primeira pose** (F2, F3):
  - quatro passos na tela e o botão "Ajustado";
  - a voz pede para a pessoa esperar;
  - marcas de "quadril" no meio das bordas.
  - Câmera reaberta no meio da sessão não repete o ajuste.
- [x] **Um toque, uma foto** (F8): sem contagem e sem sequência. A foto é o quadro do instante em que o dedo encosta, e o nível e o giro são lidos antes de montar o quadro.
- [x] **Nível com uma régua para cada direção** (F9):
  - até 1° para a frente e até 2° de lado, nos dois modos;
  - o verde só apaga 0,3° depois da régua.
  - O agente aceita até 5° de lado porque a comparação endireitaria sozinha pelo ângulo gravado. Isso pede o sentido do giro, que o sensor não garante (ver `src/infra/nivel.ts`), e por isso a régua de lado ficou em 2°.
- [x] **Foto torta:** o aviso com "Repetir" e "Registrar assim". O espelho marca "(fora do nível)".
- [x] **O que conferir** (F15–F18):
  - o erro comum em cima do quadro;
  - embaixo, a linha fixa «nível verde · cabeça e pés nas linhas» e a linha da pose (`Pose.confira`).
- [x] **Miniatura** (F17): 3 s no canto, com Refazer. Com a miniatura à vista, a linha de conferência é a da foto que saiu.
- [x] **Tremor e apoio pelo giroscópio** (F12, F13): `Captura.mov` grava o giro no toque e o maior do segundo antes. A miniatura avisa «pode ter tremido» acima de 4°/s, e o espelho diz "apoiado" ou "na mão".
- [x] **Voz** (F19–F22):
  - fala só com a pessoa fotografada e não se repete sozinha; há um botão "repetir a fala";
  - a pose seguinte espera 1,5 s depois do clique;
  - Refazer diz "Vamos repetir a pose N" e manda girar de volta se a pessoa já tinha girado;
  - o fim diz "Pronto. Sessão completa.", nos dois modos.
- [x] **Frases revistas, nos dois modos** (F21, F22):
  - abdômen: "olhe para a frente", não "para o celular", que baixava a cabeça uns 28°;
  - "pés juntos" no duplo bíceps de costas;
  - "mãos só apoiadas, sem apertar" na das mãos na cintura.

### Depois, no mesmo dia (aprovado pelo dono em 04/11)

- [x] **F27, a foto de verdade:**
  - A câmera do app usa o `takePhoto()` da câmera aberta, com o processamento da câmera do sistema. A tela continua com as linhas, o nível, a sobreposta e a voz.
  - A imagem ao vivo passou a ser pedida no sensor inteiro (4032×3024), como na página de teste que funcionou no iPhone.
  - O quadro do vídeo é pego no instante do toque e fica de reserva: vale quando a foto falha, não responde em 5 s, chega deitada ou fora de 3:4.
  - `Captura.origem` diz qual dos dois ficou, e o tremor passa a valer do toque até a foto voltar.
- [x] **O original:**
  - É o JPEG como veio, sem recomprimir, guardado à parte (`FotoRef.orig`) com a versão no nome: `<pose>.orig.<v>.jpeg`.
  - Sobe ao bucket na reconciliação e sai do aparelho quando o servidor confirma.
  - Refazer, apagar a foto ou apagar o histórico tiram o original do bucket também.
  - Só fica quando há conta na nuvem. Sem conta, uns 43 MB por sessão se acumulariam no aparelho sem destino; a cópia da tela, reduzida da foto de verdade, vale igual.
  - O espelho baixa o original como `<pose>.original.jpeg`, ao lado da cópia.
- [x] **D1:** com alguém tirando, a sobreposta só vem de foto tirada com as linhas: pela câmera do app, de 04/11 em diante. Sem nenhuma assim, não há sobreposta. Sozinho, continua a vizinha.
- [x] **D2:** no cômodo pequeno, a montagem manda encurtar a distância da parede até 40 cm, nunca usar a 0,5×.

### Falta, com alguém tirando

- [ ] F14: na comparação, desfazer a inclinação para a frente pelo ângulo gravado. Precisa do sentido do giro.
- [ ] F23–F26: selos e avisos da comparação:
  - sessão antiga sem nível gravado;
  - modos diferentes;
  - inclinações diferentes;
  - foto que pode ter tremido.
- [x] `public/teste-camera.html` saiu (04/11, pedido do dono): cada foto já grava o que a página media.
- [ ] A primeira sessão com a foto de verdade confirma, pelos dados, se ela tem o mesmo enquadramento que a tela mostrava (`cap.origem`, `cap.l` × `cap.a` e as fotos no espelho).

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
- [ ] R32: guardar o original maior quando vier da câmera do sistema (custa espaço no bucket). Na câmera do app, já entrou com a F27.

## Como saber se a primeira leva funcionou

Os dados respondem, sem teste à mão. Depois da próxima sessão, `npm run espelho` mostra:

- em `corpo/fotos.md`, a lente de cada foto: as da câmera do app e as do sistema devem ter a mesma, e entre sessões também;
- a coluna "Nível", com as fotos do app até 1°;
- o horário das fotos, em segundos de distância, mostrando a sequência correndo sozinha.
