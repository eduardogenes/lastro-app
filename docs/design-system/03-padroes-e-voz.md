# Padrões e voz

Como o app se comporta (padrões) e como fala (voz). Os padrões substituem as
regras de comportamento do `docs/LASTRO_UX_CONTRACT.md` quando o dono aprovar;
onde mudam o contrato, está dito.

## Padrões

### Registro por exceção

O caminho comum custa **um toque e já vem preenchido**: a série com a carga e
as repetições da última vez, a refeição como o plano, a medida perto da
anterior. Só a exceção pede detalhe, e o detalhe mora atrás de uma saída
discreta ("Não foi assim", "Mudar") ou de uma folha.

Quem não anotou resolve depois, de uma vez: "Já fiz mais do que anotei" no
treino, "Responder os dias em branco" na comida. O que entra assim fica marcado
como **registrado depois**, e conta igual (decisão do dono, 16/11).

### Número pela régua

Peso, carga, repetição, medida, quantidade, minutos: régua, com os botões de
passo nas pontas. Teclado só para texto (nome, busca, texto colado, e-mail).
Exceção: a cópia de segurança colada como texto.

### Uma coisa por tela, onde se age

Treino: uma série. Medir: uma medida, com a segunda leitura sempre pedida.
Câmera: uma pose. Responder os dias: um dia. Bioimpedância nova: um número. A
tela de ação mostra em cima o que já foi feito daquela coisa, e embaixo o botão
que grava.

### Nada obrigatório

Comida, água, peso, cardio, medidas além das básicas, fotos e lembretes se
ligam e desligam (em "O que aparece", no ícone do bloco do Hoje, e em Ajustes).
Desligar esconde e **nunca apaga**. O desligado não aparece como pendência em
lugar nenhum; no Corpo e no Plano, aparece uma linha só, em cinza com "+", para
ligar de volta.

### Desfazer em vez de perguntar

| O que é | Como |
|---|---|
| ação comum, reversível (marcar refeição, somar copo, responder um dia) | grava na hora, sem aviso; tocar de novo desfaz |
| reversível mas com efeito longe da tela (apagar foto, pular exercício, aplicar no plano, tirar alimento) | grava na hora e mostra o **aviso com "Desfazer"** por 6 s |
| sem volta (apagar de vez, restaurar cópia, voltar ao começo, descartar treino) | **confirmação**, dizendo o que se perde e o que não se perde |

Não se confirma ação comum: confirmação repetida deixa de ser lida.

### Folha ou tela cheia

| Folha | Tela cheia |
|---|---|
| uma decisão ou um número | uma leitura que rola, ou uma tarefa de vários passos |
| cabe em 90% da altura sem rolar muito | tem cabeçalho, seções, histórico |
| some e devolve a tela de baixo como estava | tem endereço no Voltar |
| exemplos: registrar, refeição, mudar o exercício, ligar medidas, corrigir pesagem, uma série passada, tamanho do "comi outra coisa" | exemplos: progressão, um exercício, comparar, sessão passada, pôr em dia, aula, retrospectiva |

O protótipo fazia "Pôr em dia" em tela e o código em folha: fica **tela**
(destino), porque é uma lista com marcação e carga por exercício, e rola.

### O Voltar

**Voltar desfaz exatamente uma camada**, igual para a seta da tela, o toque no
véu, o Esc e o Voltar do sistema.

| Camada aberta | Voltar faz |
|---|---|
| folha | fecha a folha; a tela de baixo não mexe |
| confirmação | responde o caminho seguro |
| destino | volta à tela de onde veio, na posição de leitura em que estava |
| tela de ação sem nada a perder | recolhe; o treino continua aberto e a tira aparece |
| tela de ação com algo a perder (uma leitura não guardada, uma sessão de fotos pela metade) | não pergunta: o que foi confirmado já está guardado; recolhe, e a tela de onde veio mostra como retomar |
| lugar | sai do app |

Nunca: Voltar para ir ao Hoje, para trocar de lugar ou para descartar um
treino. Trocar de lugar leva ao topo; voltar de destino devolve a posição;
atualizar dado na mesma tela não mexe na posição.

### Sem rede

Tudo funciona sem rede (o app guarda no aparelho e sincroniza depois). A faixa
de areia avisa **uma vez**, some em 4 s, e não volta enquanto a rede não voltar
e cair de novo. O que depende de rede (entrar na conta, mandar para os agentes,
a detecção do corpo na câmera) diz isso no lugar do botão ("Sem rede: manda
quando voltar") em vez de falhar depois.

### Falha ao guardar

O único aviso que não some sozinho, porque é o único em que se perde registro.
Faixa de atenção no topo: "1 série não foi guardada · Ver". A folha diz o que
era ("Leg press, série 2: 160 kg × 12"), por que ("o aparelho recusou a
gravação"), e oferece "Tentar de novo" e "Copiar o registro em texto". O número
continua na tela de onde veio até dar certo. Nunca apaga o que a pessoa
informou.

### Primeira vez

Decisão do dono (17/11/2026): **três passos, a pessoa começa vazia e traz o
que é dela.**

1. **Seu treino.** "De onde vem o seu treino?": colar o texto do treinador
   (abre a revisão do treinador) ou "Monto depois" (registra treino livre).
   Sem "modelo", que não existe ainda.
2. **Sua comida.** "E a comida?": "Tenho um plano alimentar" (por enquanto,
   monta-se refeição por refeição no Plano; colar o texto fica para depois,
   decisão de 17/11) ou "Não acompanho comida" (desliga o módulo).
3. **O que acompanhar.** As chaves de peso, água, cardio, fotos.

Cada passo tem "pular". No fim, o Hoje com o bloco "Nada para agora" e o
botão "Pôr o meu treino", até haver o que fazer. Restaurar uma cópia e entrar
na conta ficam como saída no primeiro passo ("Já uso o app em outro
aparelho"). Isto muda o que o código faz hoje (ver a auditoria).

## Voz e texto

A voz completa está no `MARCA.md`; aqui está o que toda tela segue.

- **Português do Brasil, segunda pessoa, "você".** "Você fez 10 repetições."
- **Curto.** Botão até 3 palavras. Apoio até duas linhas. Uma ideia por frase.
- **Devolva o número; não comemore.** "22 séries. Treino B fechado." Nunca
  "Parabéns", "Mandou bem", "Incrível", nem ponto de exclamação.
- **Diga o efeito, não o sentimento.** "Treino pausado. O relógio parou."
- **O freio cita a regra e de quem ela é.** "Treinador: tire o exercício por
  2 semanas e troque o ângulo."
- **Antes de perguntar, diga o que já está garantido.** "As séries que você
  registrou já estão no histórico. Isto decide só o treino B de amanhã."
- **No destrutivo, delimite o estrago.** "Isto não tem volta, e não apaga o
  programa nem o plano: só o que você registrou."
- **Vazio diz o que falta e a ação.** "Uma pesagem não faz linha. Com duas
  aparece a diferença."
- **Dia em branco não é falta.** "Fica fora da conta. Não vira zero." Nunca
  "você esqueceu", nunca sequência de dias.

### Números

- Vírgula decimal: 77,6 kg. Milhar com ponto: 3.204 kcal.
- Sempre com unidade, separada por espaço: 60 kg, 86,0 cm, 12,5 %, 25 min.
  Exceção: na régua e no número gigante, a unidade fica em letra menor ao lado.
- Carga × repetição com o sinal ×: 60 × 9.
- Hora com "h": 06h15, 21h30. Duração: 58 min, 1 h 05 min, 3 min 50 s.
- Data curta: 12/11. Data longa: "quinta, 26 de novembro". Relativa quando
  ajuda: "há 4 dias", "daqui a 10 min".
- Diferença com sinal: +1,5 cm, −0,37 kg (o sinal de menos tipográfico, −).

### Termos técnicos

Nenhum sem explicação na mesma tela.

| Termo | Como aparece |
|---|---|
| RIR | "sobrando 1–2" na série, e "Sobraram quantas repetições?" no descanso. A sigla só aparece no histórico, com legenda: "RIR = repetições que sobraram" |
| e1RM | não aparece. Onde a conta usa, a tela diz "força estimada" |
| deload | "Deload hoje: corta para 13 séries, nas mesmas cargas" |
| dupla progressão | "primeiro ganhar repetição até o topo da faixa, depois subir a carga" |
| bioimpedância | o nome fica (é o que está na balança), com os três números em português |
| dobra | "dobra abdominal, com adipômetro, em milímetros" |
