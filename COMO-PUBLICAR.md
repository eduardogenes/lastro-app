# Como pôr o app no iPhone

Tudo o que precisa está nesta pasta. São 7 arquivos, 148 KB no total.

## 1. Publicar (uma vez, ~2 minutos)

1. No computador, abra **app.netlify.com/drop**
2. Arraste a pasta `treino-app` inteira para dentro da janela
3. Espere alguns segundos. Ele devolve um endereço tipo
   `https://algo-aleatorio-123.netlify.app`
4. Copie esse endereço

Não precisa criar conta para publicar. Vale criar depois (de graça) se
quiser guardar o endereço e trocar por um nome melhor — sem conta, o site
fica no ar mas você perde o controle sobre ele.

Alternativa equivalente: **pages.cloudflare.com**, mesma ideia.

## 2. Instalar no iPhone (uma vez)

1. Abra o endereço **no Safari** — precisa ser o Safari, não Chrome nem
   o navegador de dentro do Instagram ou do WhatsApp
2. Toque no botão de compartilhar (quadrado com seta para cima)
3. Role e toque em **Adicionar à Tela de Início**
4. Confirme

Vai aparecer um ícone escuro com a linha âmbar. Abra por ele, sempre.

## 3. Por que abrir sempre pelo ícone

Aberto pelo ícone, o app roda em tela cheia, sem a barra do Safari, e o
histórico fica fora da regra da Apple que apaga dados de sites depois de
7 dias sem uso. Aberto pelo Safari comum, funciona igual, mas você depende
de usar toda semana para não perder nada.

## 4. Offline

Na primeira abertura com internet, o app se guarda inteiro no aparelho.
Depois disso abre e salva sem rede nenhuma — modo avião, subsolo da
academia, tanto faz. Só as fontes podem não carregar na primeira vez
offline; o app cai para a fonte do sistema e continua funcionando.

## 5. Backup

Aba **dados** → **Baixar arquivo JSON**. Faça isso uma vez por mês e
antes de trocar de celular. É a única cópia que não depende do navegador.

## 6. Publicar uma versão nova

Quando o app mudar:

1. Abra `sw.js` e troque `treino-v1` por `treino-v2` (v3, v4...)
2. Arraste a pasta de novo no Netlify Drop, no mesmo lugar
3. No iPhone, feche o app e abra de novo — duas vezes

Sem trocar o número em `sw.js`, o aparelho continua servindo a versão
antiga do cache. Seus dados não se perdem nesse processo: eles não estão
no cache do app, estão no armazenamento do navegador.
