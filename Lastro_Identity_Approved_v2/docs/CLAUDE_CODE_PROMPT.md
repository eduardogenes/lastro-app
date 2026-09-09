# PROMPT MESTRE — CLAUDE CODE — LASTRO (IDENTIDADE APROVADA)

Você vai integrar a identidade visual **já aprovada** do app Lastro.

## Regra absoluta
NÃO redesenhe a marca. NÃO a interprete. NÃO recrie um símbolo semelhante.
A geometria oficial foi extraída diretamente da arte aprovada e está em:

`./Lastro_Identity_Approved_v2/assets/svg/lastro-symbol-approved.svg`

A referência visual que o usuário aprovou está em:

`./Lastro_Identity_Approved_v2/00_APPROVED_REFERENCE_BOARD.png`

Use esses dois arquivos como source of truth. Se qualquer outro arquivo, descrição ou implementação divergir visualmente deles, prevalece a arte aprovada e o SVG `lastro-symbol-approved.svg`.

## Contexto do produto
Lastro é um app pessoal, local, de treino de musculação e alimentação. Ele registra e deriva dados, executa prescrições de treinador/nutricionista e freia mudanças sem evidência. Não é motivacional, social, comercial ou gamificado.

A ideia da marca é: **fundamento**.

Resultado ← histórico.
Progressão ← consistência.
Decisão ← dados.
Mudança ← evidência.
Crescimento ← base.

O símbolo representa uma parte visível sobre uma linha de superfície e uma estrutura de raízes/fundamento maior abaixo. Não é árvore ecológica, âncora, halter, seta de performance ou símbolo financeiro.

## Cores
- Lime `#D9FF16`
- Black `#0E1112`
- Graphite `#2A2F33`
- Off White `#E8E8E3`

## Arquivos oficiais
- `assets/svg/lastro-app-icon-approved.svg` — app icon flat, full bleed.
- `assets/svg/lastro-symbol-approved.svg` — símbolo transparente.
- `assets/svg/lastro-symbol-approved-white.svg` — monocromático.
- `assets/svg/lastro-app-icon-approved-maskable.svg` — maskable.
- `assets/png/` — PNGs prontos.
- `assets/maskable/` — PNGs maskable.
- `manifest-icons.json` — referência de manifest.

## Processo
1. Antes de editar, audite framework, estrutura de assets, manifest, favicon, apple-touch-icon, PWA, metadata, service worker/cache e referências a logos/ícones antigos.
2. Informe resumidamente o que encontrou e quais arquivos serão alterados.
3. Continue a implementação sem aguardar autorização, exceto se houver risco real de perda de dados.
4. Preserve a UI existente por padrão. Esta tarefa é integração de identidade, NÃO redesign completo.
5. Não adicione logo em header, splash, slogans ou padrões decorativos sem necessidade funcional.
6. Substitua ícones antigos pelos assets oficiais nos tamanhos já fornecidos.
7. Use `purpose:any` para ícones normais e `purpose:maskable` para os maskable.
8. Não queime squircle/círculo dentro do arquivo; deixe o sistema aplicar a máscara.
9. Verifique precache/service worker para que instalações existentes recebam os novos ícones, sem limpar ou migrar dados locais.
10. Não altere storage keys, IndexedDB, localStorage, schemas, backups ou histórico por causa desta tarefa.

## Prioridades de UX
O app é usado às ~6h15 na academia, em pé, com uma mão, entre séries e possivelmente offline. Velocidade, legibilidade, área de toque, persistência e ausência de prompts vencem branding.

## Validação final
Valide: favicon, apple-touch-icon, 192, 512, maskable, manifest, metadata, build, lint/typecheck quando existirem, service worker/cache, ausência de 404s, ausência de assets antigos referenciados e preservação integral dos dados.

Ao terminar, entregue: (1) o que encontrou, (2) arquivos alterados, (3) decisões, (4) validações, (5) pendências reais. Se não houver pendência: “Identidade Lastro integrada e validada.”
