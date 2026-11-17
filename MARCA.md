# MARCA.md — Lastro

As decisões de nome, voz e identidade. Revisto em 16/11/2026 com a direção 3:
a voz e o ícone continuam; o que falava do visual antigo (Instrumento) saiu.

Regra que vale para o documento inteiro: **toda promessa tem um arquivo e uma
linha.** Onde não tem, está escrito que não tem.

## A acepção

**Náutica primeiro. Financeira em segundo, e só onde o assunto já é
procedência.**

Lastro é o peso que impede de tombar, não o que faz andar. A acepção náutica
manda porque o produto é físico e o freio é a tese: peso, carga, quilo, e um app
cuja função principal é atrasar decisão — `shouldUp()` devolve `false` voltando
de pausa longa ([src/dominio/progressao.ts](src/dominio/progressao.ts)). A
financeira — moeda com lastro responde de onde vem o que ela vale — entra só
onde o texto já fala de número derivado, e o que a cumpre é a primitiva
`Procedencia` ([src/ui/instrumento/primitivos.jsx](src/ui/instrumento/primitivos.jsx)).

**Nunca as duas na mesma frase.** Duas leituras é força; duas leituras ao mesmo
tempo é diluição.

**Voto vencido.** A financeira deveria vir primeiro, porque é a rara: frear é
reivindicação comum na categoria — deload, RIR, gestão de fadiga —, enquanto
responder de onde saiu cada número quase ninguém faz. Perdeu porque a hierarquia
se decide pelo que ele encontra primeiro, e às 6h15 o que ele encontra é o selo
de subir carga que não apareceu. O argumento fica registrado porque pode voltar
a ganhar.

## Onde o nome aparece

**Onde ele é endereço, nunca onde ele é assinatura.**

| Endereço | Onde |
|---|---|
| `lastro-v1` | chave do estado, [src/main.jsx](src/main.jsx) |
| `lastro-nuvem-v1` | sessão da nuvem, [src/infra/nuvem.ts](src/infra/nuvem.ts) |
| `lastro-<hash>` | cache do service worker, [vite.config.js](vite.config.js) |
| `lastro-fotos` | cache das fotos, [src/infra/fotos.ts](src/infra/fotos.ts) |
| `lastro-bancada-v1` | aparelho escolhido no modo de mesa, [src/palco.js](src/palco.js) |
| `app: 'lastro'` · `lastro-AAAA-MM-DD.json` | backup exportado |
| símbolo da raiz | ícone da tela de início, favicon e aba do navegador |

Dentro do app o produto se chama **"o app"** — *"O app decide isso das cargas
que você registrou"*. Quem está lá dentro já entrou pela porta que tem o nome
escrito. **O nome não aparece em nenhuma tela, e isso é decisão.**

## Voz

Ela não foi escrita: já estava em 91 mensagens de commit e nas strings do app.
A coluna da direita é o que um app da categoria escreveria no mesmo lugar.

| Regra | O que o app diz | O que ele nunca diria |
|---|---|---|
| Diga o efeito visível, não o estado emocional. | *Treino pausado. O relógio parou.* | ~~Treino pausado! Volte quando estiver pronto.~~ |
| No fim de uma tarefa, devolva os números. **Nunca comemore.** | *Treino B encerrado · 58 min · 7 exercícios* | ~~Parabéns, treino B concluído.~~ |
| Fato consumado em uma frase, sem consolo. | *Sessão descartada.* | ~~Tudo bem, acontece.~~ |
| Número que pode ser lido como sequência, negue por escrito. | *média móvel das últimas 4 semanas, não sequência de dias* | ~~4 semanas seguidas. Mantenha o ritmo.~~ |
| Veredito traz o delta, a janela e o limite cruzado. | *A média semanal da cintura subiu 1,8 cm em 26 dias — acima do limite de 1,5 cm no mês.* | ~~Atenção: sua cintura aumentou.~~ |
| O freio cita a regra e diz de quem ela é. Conselho próprio, nunca. | *A regra do programa é tirar o exercício por 2 semanas e trocar o ângulo, não empurrar por cima.* | ~~Sentiu dor? Descanse e volte mais forte.~~ |
| Antes de perguntar, diga o que já está garantido. | *As séries que você registrou já estão no histórico. Isto decide só o treino B de amanhã.* | ~~Deseja salvar as alterações?~~ |
| Controle confundível explica o que ele **não** faz. | *isto diz só em que dias você costuma treinar. Qual sessão vem é sempre a rotação.* | ~~Monte a sua semana ideal.~~ |
| Ao oferecer um override, diga em que condição ele é legítimo. | *Assuma na mão só quando ele estiver cego — volta de pausa, troca de exercício, semana de deload.* | ~~Personalize do seu jeito.~~ |
| No destrutivo, delimite o estrago em vez de dramatizar. | *isto não tem volta, e não apaga o programa nem o plano — só o que você registrou.* | ~~Esta ação é irreversível. Tem certeza?~~ |
| Estado vazio diz o que falta, e a ação quando existe uma. Sem ilustração, sem mascote, sem consolo. | *Ainda não há carga registrada suficiente para estimar.* | ~~Nada por aqui ainda. Bora começar?~~ |
| Commit descreve o efeito visível, em português, minúscula, sem o diff. | *a decisão de fim de treino não se perde quando a sessão fecha sozinha* | ~~fix: corrige bug no handler de encerramento~~ |

**"Nunca comemore" não é regra de palavra: é regra de sinal.** Vale para
qualquer coisa que o app possa dizer sem falar: cor, movimento, som. Na direção
3 a cor do bloco diz **de que assunto é o momento** (treino, refeição, corpo),
nunca se o resultado foi bom; ver [DESIGN.md](DESIGN.md). O app devolve o
número; quem decide se foi bom é quem treinou.

Quando surgir dúvida de tom, a resposta está no `git log` antes de estar aqui.

## Identidade

**Dentro do app o nome não aparece.** O produto se chama "o app" nas telas.
Onde o nome precisar ser escrito (documento, página externa), é "Lastro" em
caixa de frase, na fonte de títulos do sistema ([DESIGN.md](DESIGN.md)).

**Símbolo ou palavra.** Símbolo só onde a moldura é um quadrado que o sistema
não controla: ícone, favicon, aba do navegador. Palavra em tudo que é texto.
Nunca os dois juntos.

**O símbolo.** Uma parte visível acima de uma linha de superfície e uma
estrutura de raízes maior abaixo dela: 30% aparece, 70% sustenta. Não é árvore
ecológica, âncora, halter nem seta.

**A geometria não se redesenha.** Vem da arte aprovada e está em
[public/icone.svg](public/icone.svg), igual a
`Lastro_Identity_Approved_v2/assets/svg/lastro-app-icon-approved.svg`, que é a
origem. A pasta `Lastro_Identity_Approved_v2/` guarda só isso: o ícone e as
cores dele.

**O ícone tem as cores da marca, não as do app:** lima `#D9FF16` sobre preto
`#0E1112`. Dentro do app valem os tokens do [DESIGN.md](DESIGN.md), em tema
claro. A separação é deliberada: o ícone mora na tela de início, que é do
sistema operacional.

**Máscara é arquivo próprio.** `icone-512-mascara.png` e `icone-192-mascara.png`
trazem o símbolo recuado 18% para caber no círculo seguro do Android;
`icone-512.png` e `icone-192.png` são de borda a borda. O arredondamento não é
queimado no arquivo: quem arredonda é o sistema.

**O símbolo não entra como elemento gráfico dentro do app.**

## Nomes no código

> **`lastro-` nomeia o que se guarda:** chave, cache, cópia de segurança.

O visual anterior se chamava Instrumento e usava o prefixo `ins-` em classes e
tokens. Esse prefixo pertence ao código antigo e sai com ele. O visual novo
vive em `src/v3/` e `src/ui/v3/` e não usa `ins-`.

## O que decidimos não fazer

A versão de marca das anti-referências do [PRODUCT.md](PRODUCT.md).

| Não | Por quê |
|---|---|
| Manifesto de marca | O software passa o dia se recusando a fazer discurso. Um texto que faz discurso desmente o software que descreve. |
| Tela "sobre" | Tela nova para contar história. |
| O nome em alguma tela | Assinatura dentro do prédio em que você já entrou. |
| Splash com o símbolo | Um frame a mais entre o toque e a próxima série. |
| Lockup símbolo + palavra | Lockup é assinatura. |
| Renomear os escopos de commit | Treino é o **domínio**. Todo escopo dizendo a mesma palavra é o mesmo que não ter escopo. |
| As duas acepções na mesma frase | Duas leituras é força; duas leituras ao mesmo tempo é diluição. |
| Versão do app na interface | O service worker se versiona pelo hash desde `7c18963`. O número existir de novo convidaria a incrementá-lo à mão outra vez. |
| Tocar nas constantes de legado | `treino-eduardo-v1`, `treino-fotos`, `treino-nuvem-v1` e as fixtures de backup antigo são o endereço do passado. Renomear é apagar dado de quem ainda não atualizou. |

## O que sobrou, e é caro

**Trocar o domínio de deploy apaga o histórico do aparelho.** `localStorage` e
Cache Storage pertencem à *origem*. Um domínio novo é uma origem nova, e o app
instalado na tela de início continua apontando para a velha: abrir o endereço
novo abre um app vazio, e continuar usando o ícone antigo faz os dois divergirem
em silêncio.

Se um dia for trocado, a ordem é: exportar o JSON, entrar na conta da nuvem no
endereço novo, conferir que o estado desceu, reinstalar pelo ícone e **apagar a
instalação antiga**. A sincronização torna isso sobrevivível; antes de `7767d2b`
não era.

O domínio é endereço, como o resto. Não trocar também é uma resposta.
