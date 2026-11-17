# 07 · As decisões, e onde elas foram parar

O [parecer](06-parecer.md) deixou dez perguntas para o dono do projeto e os três
candidatos prontos. Ele respondeu as dez de uma vez, em 1º de outubro de 2026, e
este arquivo é o registro: o que ficou decidido, e onde o texto ou o código
mudou. Os candidatos foram adotados sobre os originais no mesmo dia.

## As dez do parecer

| | Pergunta | Decisão | Onde |
|---|---|---|---|
| **H-01** | A folha sobe ao abrir? | **Não.** É animação de entrada, a categoria que a lista restaurada proíbe pelo nome, e o véu exigiria mais movimento ainda. | `DESIGN.md`, Movimento — "o que já foi considerado e recusado" |
| **H-02** | Ácido em "melhorou" é "feito" ou é comemorar por cor? | **Nem um nem outro: separar por tipo de afirmação.** *Dentro da regra* é estado e pode ser ácido; *melhor que antes* é comparação e fica cinza. Nove sítios perderam o ácido, dois ficaram. | `DESIGN.md`, inegociável 4 · `MARCA.md`, Voz · `main.jsx` |
| **H-03** | O 2px entra na escala ou sai do código? | **Entra, com o trabalho nomeado:** costura óptica dentro de um bloco de texto, nunca entre dois objetos. | `DESIGN.md`, Espaço |
| **H-04** | Qual é o alvo denso, e para quê? | **28px é desenho, não alvo.** Controle secundário em linha cheia, com a área estendida a ≥44 por `::after`; onde o vão não permite, o quanto deu está escrito na regra. | `tokens.css` · `treino.css` · `protocolo.css` · `DESIGN.md`, Toque |
| **H-05** | Stepper compacto: 38 ou 46? | **Os dois: 38 de desenho, 46 de alvo.** As duas razões escritas se chocavam, e a saída não era escolher uma. | `componentes.css` · `DESIGN.md`, Toque |
| **H-06** | O que define "genuinamente destacado"? | **Lista fechada:** veredito, formulário, resumo. Critério nunca existiu em documento nenhum; caixa nova passa a ser decisão. | `DESIGN.md`, inegociável 3 |
| **H-07** | Quem confere o PWA instalado? | **O dono, no aparelho dele**, depois de mudança de layout, área segura ou rodapé. O item sem responsável era o mesmo que não ter item. | Checklist do contrato de UX |
| **H-08** | `confirm()` e `prompt()` ficam do sistema? | **Ficam.** A regra os aprova, a MARCA regula o texto deles, e um commit os escolheu de propósito depois de a regra existir. | `DESIGN.md`, Componentes |
| **H-09** | A barra do cronômetro sob `reduce`? | **Fica em degraus de 250 ms, e isso está escrito.** Quem liga `reduce` pediu para não interpolar. | `DESIGN.md`, Movimento |
| **H-10** | Botão em mono caixa alta é um terceiro uso? | **É, e passa a ser declarado:** abre seção, nomeia valor, ou é rótulo de ação em botão. | `DESIGN.md`, inegociável 5 |

## A décima primeira, que o bloco de consertos achou

**A quarta folha** (refeição → `···` → trocar → cadastrar) não se resolvia
travando a pilha: o alimento seria criado e ficaria em lugar nenhum. Decidido o
redesenho pequeno — cadastrar **toma o lugar** da busca que não achou, e salvar
põe o alimento na refeição e volta para ela. A pilha fica nos três níveis do
contrato e o caminho ficou mais curto do que era.

No mesmo caminho apareceu um bug anterior a tudo isto: a folha de busca recebia
a refeição de destino numa prop chamada `ref`, reservada do Preact, que nunca
chega ao componente. Escolher um alimento na lista não fazia nada, sem erro e
sem aviso, desde `9914199` (14 de agosto). Nenhum teste pegava porque todos
chamavam `adicionaItem` direto, sem passar pela tela.

## Os defeitos de código

Os C-01 a C-12 do parecer foram consertados antes das decisões, em cinco
commits — legibilidade, toque, rolagem, destrutivo e folha, estado de erro das
fotos. Ficou de fora, por decisão, só o que exigia a redefinição acima.

O C-13 (comentários de código que a adoção tornaria falsos) saiu junto com a
adoção: `tokens.css`, `base.css`, `componentes.css` e `palco.css` deixaram de
dizer "existem dois" e de listar a aba inativa no nível 5.

## O que continua aberto

As quatro medições do parecer (§6.2) — altura das cinco abas, rodapé com sessão
aberta renderizado, as `.ins-t2` em tela e o contraste real dos 24 sítios de
D-16. Nenhuma delas é decisão: é medir.
