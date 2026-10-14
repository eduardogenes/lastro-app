# Medição do coordenador

Scripts de captura em Chromium sem janela, 414×896, ×2. Rodam contra o `dist`
servido localmente:

```
npm run build
python3 -m http.server 4719 -d dist &
CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
  node docs/redesign/_medicao/<script>.mjs http://localhost:4719/ docs/redesign/_medicao/shots
```

As capturas (`shots/`) não vão para o git. Os scripts vão: em 14/10 a pasta
antiga, em `/tmp`, foi apagada pelo sistema, com scripts e capturas.

`camera.mjs` abre a câmera da sessão de fotos com a câmera falsa do Chromium
(`--use-fake-device-for-media-stream`): os blocos das poses e o clarão.

`deitado.mjs` abre o modo de sessão a 896×414: o cartão aberto em duas colunas,
com e sem a régua.
