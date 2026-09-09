// Regra 4 do projeto: identidade visual fixa.
//
// Estes testes existem por uma regressão real, encontrada ao tokenizar o CSS:
// SEIS nomes de variável eram usados e nunca definidos (--sec, --amber, --txt,
// --card, --orange, --f), em 31 regras. CSS não reclama de `var()` sem dono —
// a regra simplesmente cai no valor herdado, e a tela fica quase certa. A tela
// de edição do dia e a de decisão do programa vinham renderizando assim.
//
// É o tipo de coisa que nenhum teste de DOM pega, porque o elemento existe e
// tem texto. Só o fonte denuncia.

import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// Todas as folhas, não uma amostra. Enquanto o sistema antigo existia, o teste
// lia `tokens.css` e `app.css`; com `app.css` aposentado, ler uma lista curta
// deixaria o teste cego justamente onde as regras passaram a morar.
const FOLHAS = ['tokens.css', 'base.css', 'componentes.css', 'treino.css', 'protocolo.css'];
const css = FOLHAS
  .map(f => fs.readFileSync(path.join(RAIZ, 'src', f), 'utf8'))
  .join('\n');

test('toda custom property usada tem dono', () => {
  const definidas = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map(m => m[1]));
  const usadas = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map(m => m[1]));
  const orfas = [...usadas].filter(v => !definidas.has(v));
  assert.deepStrictEqual(orfas, [], 'var() sem definição cai no valor herdado, em silêncio');
});

test('a paleta do Instrumento está inteira e mora nos tokens', () => {
  const tokens = fs.readFileSync(path.join(RAIZ, 'src', 'tokens.css'), 'utf8');
  const paleta = {
    '--ins-canvas': '#0C0E0C', '--ins-surface-low': '#0F120F',
    '--ins-surface': '#111411', '--ins-hairline': '#161A15',
    '--ins-rule': '#22271F', '--ins-border': '#2B302A',
    '--ins-border-strong': '#3A4137', '--ins-text': '#F2F4EF',
    '--ins-text-2': '#D6DAD0', '--ins-text-3': '#A8AFA1',
    '--ins-text-4': '#7C8478', '--ins-text-5': '#5E655A',
    '--ins-acid': '#CBF35E', '--ins-amber': '#FFC46B', '--ins-coral': '#FF8A6B'
  };
  Object.entries(paleta).forEach(([nome, hex]) => {
    assert.ok(new RegExp(nome + ':\\s*' + hex, 'i').test(tokens),
      'sumiu ou mudou na paleta: ' + nome + ' deveria ser ' + hex);
  });
});

test('cor nova não entra solta no meio das regras', () => {
  const regras = FOLHAS.filter(f => f !== 'tokens.css')
    .map(f => fs.readFileSync(path.join(RAIZ, 'src', f), 'utf8'))
    .join('\n');
  const soltas = [...new Set((regras.match(/#[0-9A-Fa-f]{3,8}\b/g) || []))];
  assert.deepStrictEqual(soltas, [],
    'hexadecimal fora de tokens.css: dê um nome a ele antes de usar');
});

test('a paleta antiga não existe mais, nem por apelido', () => {
  // Enquanto havia tela em string, cada nome antigo apontava para um token do
  // Instrumento — remapear era o que fazia a superfície legada inteira falar a
  // língua nova de imediato. Com a última convertida, o atalho sai: dois nomes
  // para a mesma cor é a porta pela qual uma segunda paleta volta a entrar.
  const antigos = ['night', 'dusk', 'raise', 'line', 'paper', 'mist', 'dim',
    'dawn', 'dawn-soft', 'on-dawn', 'ember', 'ember-soft', 'ember-line',
    'ok', 'ok-line', 'info', 'info-line', 'f-m', 'f-d'];
  const vivos = antigos.filter(n => new RegExp('var\\(--' + n + '\\)').test(css));
  assert.deepStrictEqual(vivos, [], 'nome da paleta antiga ainda em uso');
});

test('tela cheia usa svh, não vh', () => {
  // 100vh no iOS é a viewport GRANDE, com a barra do navegador recolhida:
  // sobra um trecho rolável do tamanho da barra e o fundo do body aparece.
  const alturas = [...css.matchAll(/(?:min-)?height:\s*100vh/g)];
  alturas.forEach(m => {
    const depois = css.slice(m.index!, m.index! + 200);
    assert.ok(/100svh/.test(depois), '100vh sem 100svh logo abaixo como correção');
  });
});

test('espaço vertical fica na escala de 4', () => {
  // O sistema tem UMA escala — 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34 — e ela
  // é o que faz telas diferentes parecerem o mesmo produto. Valor solto no meio
  // não quebra nada visivelmente; só vai afrouxando o ritmo até a tela ficar
  // 20% mais alta sem ninguém saber por quê. Foi o que aconteceu.
  // Só ESPAÇO: padding, margin e gap. Altura de componente (ponto de 7px,
  // sparkline de 48, tick de 30) é anatomia, e a anatomia vem do §3.
  const ESCALA = [1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34, 46];

  // Exceções, cada uma citada no DESIGN_SYSTEM:
  //   5px  §3.5  label-sm -> 5px -> metric-m, dentro da célula de métrica
  //   3px  §3.14 vão das barras da sparkline
  //   9px  §3.10 padding do chip de CTA (a faixa é 9–12)
  //   17px      alinhamento óptico do ponto da timeline com a primeira linha
  const EXCECOES = [3, 5, 9, 17];

  const arquivos = ['base.css', 'componentes.css', 'treino.css'];
  const fora: string[] = [];

  arquivos.forEach(f => {
    // sem comentários: eles citam medidas em prosa e virariam falso positivo
    const s = fs.readFileSync(path.join(RAIZ, 'src', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /(padding|margin|gap)(-top|-bottom)?:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(s))) {
      (m[3].match(/(?<![\w-])(\d+)px/g) || []).forEach(px => {
        const n = Number(px.replace('px', ''));
        if (!ESCALA.includes(n) && !EXCECOES.includes(n)) {
          fora.push(`${f}: ${m![0].trim()}`);
        }
      });
    }
  });

  assert.deepStrictEqual([...new Set(fora)], [],
    'medida fora da escala; se for deliberada, cite a fonte e some às exceções');
});

test('alvo de toque não é forçado duas vezes', () => {
  // min-height numa linha que JÁ é alta empilha ar em cima de conteúdo que não
  // precisava. Foi o que engordou a timeline em 16px por linha e a lista de
  // exercícios em 7. Alvo pequeno é problema; alvo grande duas vezes é altura
  // perdida — e some no desktop, onde ninguém toca em nada.
  const css = ['componentes.css', 'treino.css']
    .map(f => fs.readFileSync(path.join(RAIZ, 'src', f), 'utf8'))
    .join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

  ['.ins-tl-toque', '.ex-top'].forEach(sel => {
    const bloco = css.match(new RegExp('\\' + sel + '\\s*\\{([^}]*)\\}'));
    assert.ok(bloco, 'sumiu do CSS: ' + sel);
    assert.ok(!/min-height/.test(bloco![1]),
      sel + ' voltou a forçar altura dentro de uma linha que já é o alvo');
  });
});


// ---------- comportamento de aplicativo, não de navegador ----------
// O app é instalado na tela de início e usado de pé, com uma mão, suado. Zoom
// acidental no meio de uma série custa mais do que zoom deliberado ganha, e
// cada regra abaixo tira um gesto que só faz sentido numa página.

const base = fs.readFileSync(path.join(RAIZ, 'src', 'base.css'), 'utf8');

/** Todas as declarações de um seletor, juntas — ele aparece em mais de um bloco. */
function regras(css: string, seletor: string): string {
  const re = new RegExp('(?:^|[,{}\\n])\\s*' + seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                        '\\s*(?:,[^{]*)?\\{([^}]*)\\}', 'g');
  return [...css.matchAll(re)].map(m => m[1]).join('\n');
}
const indexHtml = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const mainJsx = fs.readFileSync(path.join(RAIZ, 'src', 'main.jsx'), 'utf8');

test('a raiz recusa os gestos de zoom, e não só os botões', () => {
  // Estava só no `button`, e o toque duplo que incomoda é o dado num texto,
  // num cartão ou numa foto. O efetivo é a interseção com os ancestrais, então
  // declarar na raiz alcança a árvore inteira.
  const html = base.match(/\bhtml\s*\{([^}]*)\}/);
  assert.ok(html, 'a regra de html existe');
  assert.match(html![1], /touch-action:\s*pan-x\s+pan-y/,
    'pan-x pan-y: rolar sim, pinça e toque duplo não');
});

test('o viewport não deixa o navegador escalar a página', () => {
  assert.match(indexHtml, /user-scalable=no/);
  assert.match(indexHtml, /maximum-scale=1/);
  assert.match(indexHtml, /viewport-fit=cover/, 'a área segura continua contada');
});

test('a pinça do WebKit é recusada, que o touch-action não alcança', () => {
  // O Safari implementa a pinça como gesto próprio, acima do touch-action.
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => {
    assert.ok(mainJsx.includes(n), 'falta recusar ' + n);
  });
  assert.match(mainJsx, /passive:\s*false/,
    'sem passive:false o preventDefault é ignorado e o listener vira decoração');
});

test('segurar o dedo na interface não abre menu nem seleciona', () => {
  const corpo = regras(base, 'body');
  assert.ok(corpo, 'a regra de body existe');
  assert.match(corpo, /-webkit-touch-callout:\s*none/);
  assert.match(corpo, /user-select:\s*none/);
  assert.match(corpo, /-webkit-tap-highlight-color:\s*transparent/);
});

test('mas campo e prosa continuam selecionáveis', () => {
  // sem isto não se seleciona o que se digitou para corrigir, que é o oposto
  // de comportamento de aplicativo
  const m = base.match(/p,\s*\.ins-prosa,\s*input,\s*textarea\s*\{([^}]*)\}/);
  assert.ok(m, 'a exceção existe e alcança os campos');
  assert.match(m![1], /user-select:\s*text/);
});

test('a barra deslizante toma o gesto, em vez de disputá-lo com a rolagem', () => {
  assert.match(base, /input\[type="range"\]\s*\{[^}]*touch-action:\s*none/);
});

test('o campo nunca fica abaixo de 16px, que é o que faz o Safari dar zoom', () => {
  const m = base.match(/\ninput,\s*textarea,\s*select\s*\{([^}]*)\}/);
  assert.ok(m, 'a regra dos campos existe');
  assert.match(m![1], /font-size:\s*16px/);
});

// ---------- a saída de uma tela cheia ----------

test('o voltar fica grudado no topo, porque é a única saída', () => {
  // O app não usa `history`: em PWA instalado não há botão do navegador nem
  // gesto de borda. Se este botão rolar para fora, sair exige rolar tudo de
  // volta — e ele rolava, em quatro dos cinco destinos.
  const comp = fs.readFileSync(path.join(RAIZ, 'src', 'componentes.css'), 'utf8');
  const topo = comp.match(/\.tc-topo\s*\{([^}]*)\}/);
  assert.ok(topo, 'a regra existe');
  assert.match(topo![1], /position:\s*sticky/);
  assert.match(topo![1], /top:\s*0/);
  assert.match(topo![1], /background:/, 'opaco: o conteúdo passa por baixo e precisa sumir');
});

test('nenhum ancestral do sticky vira scroll container', () => {
  // Um `overflow: hidden` no body derrubaria o sticky em silêncio — hidden
  // vira `auto` no outro eixo e cria o container. `clip` corta sem rolar.
  const corpo = regras(base, 'body');
  assert.match(corpo, /overflow-x:\s*clip/);
  assert.ok(!/overflow(-x)?:\s*(hidden|auto|scroll)/.test(corpo),
    'overflow que cria scroll container mata o voltar grudado');
});

// ---------- alvo de toque ----------

test('controle pequeno estende o ALVO sem crescer o desenho', () => {
  // O sistema é denso de propósito. Aumentar os controles engordaria telas
  // inteiras; o ::after estende só a área que o dedo alcança.
  const css = ['base.css', 'componentes.css', 'treino.css']
    .map(f => fs.readFileSync(path.join(RAIZ, 'src', f), 'utf8')).join('\n');
  ['.ins-caixa', '.ins-tick', '.ins-chip', '.crow-x', '.cardl-b', '.dd-diabtn'].forEach(sel => {
    const re = new RegExp('\\' + sel + '::after\\s*\\{([^}]*)\\}');
    const m = css.match(re);
    assert.ok(m, sel + ' perdeu a área de toque estendida');
    assert.match(m![1], /position:\s*absolute/);
    assert.match(m![1], /inset:\s*-/, sel + ': a área tem que ser MAIOR que o desenho');
  });
});

test('o alvo do tick cresce só na vertical', () => {
  // Na horizontal o vizinho é a repetição seguinte: crescer para o lado faria
  // um toque na borda registrar o número errado.
  const css = fs.readFileSync(path.join(RAIZ, 'src', 'componentes.css'), 'utf8');
  const m = css.match(/\.ins-tick::after\s*\{([^}]*)\}/);
  assert.match(m![1], /inset:\s*-\d+px\s+0/, 'o segundo valor tem que ser 0');
});

test('o toast é anunciado por leitor de tela', () => {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const m = html.match(/<div id="toast"[^>]*>/);
  assert.ok(m, 'o toast existe');
  assert.match(m![0], /role="status"/);
  assert.match(m![0], /aria-live="polite"/, 'polite: o toast informa, nunca interrompe');
});

test('a tela cheia tem título de primeiro nível, e ele recebe foco', () => {
  const tc = fs.readFileSync(path.join(RAIZ, 'src', 'ui', 'instrumento', 'telacheia.jsx'), 'utf8');
  assert.match(tc, /<h1[^>]*class="ins-display tc-titulo/, 'o destino precisa de h1');
  assert.match(tc, /tabindex="-1"/, 'alvo de foco sem entrar na tabulação');
  assert.match(tc, /\.focus\(\{ preventScroll: true \}\)/,
    'foco sem mexer no scroll, que já foi para o topo');
});

test('o relógio da sessão gruda no topo enquanto o treino corre', () => {
  const treino = fs.readFileSync(path.join(RAIZ, 'src', 'treino.css'), 'utf8');
  const rel = regras(treino, '.day-rel');
  assert.match(rel, /position:\s*sticky/);
  assert.match(rel, /background:/, 'opaco: o conteúdo passa por baixo e precisa sumir');
  // `top: 0` encostaria no relógio do iPhone: com `black-translucent` o
  // conteúdo passa por baixo da barra de status, e zero é o topo REAL da tela
  assert.match(rel, /top:\s*var\(--sa-top\)/,
    'tem que parar abaixo da barra de status, não em cima dela');
  assert.ok(!/top:\s*0\s*;/.test(rel), 'top: 0 põe o número embaixo do relógio do sistema');
});

test('a barra de status tem fundo, senão o conteúdo rola por baixo dela', () => {
  // `black-translucent` deixa a página passar sob o relógio e a bateria do
  // sistema — bonito parado, ilegível rolando.
  const faixa = base.match(/body::before\s*\{([^}]*)\}/);
  assert.ok(faixa, 'a faixa da barra de status sumiu');
  assert.match(faixa![1], /position:\s*fixed/);
  assert.match(faixa![1], /height:\s*var\(--sa-top\)/, 'zero onde não há entalhe');
  assert.match(faixa![1], /background:/);
  assert.match(faixa![1], /pointer-events:\s*none/, 'pintar não pode roubar toque');
});

test('o cronômetro de descanso não divide o rodapé com a tab bar', () => {
  // Ficava em `bottom: 0` com z-index 20; a tab bar mora no mesmo lugar com 40.
  // Dos 57px do cronômetro, 47 ficavam cobertos e os 10 restantes eram padding:
  // ele começava, contava certo, e não aparecia em canto nenhum. Os testes de
  // fluxo não pegam isto — jsdom não faz layout, e a classe `on` estava certa.
  const comp = fs.readFileSync(path.join(RAIZ, 'src', 'componentes.css'), 'utf8');
  const t = regras(comp, '#timer');
  assert.ok(t, 'a regra do cronômetro existe');
  assert.match(t, /bottom:\s*var\(--ins-tabbar\)/,
    'empilhado ACIMA da tab bar; --ins-tabbar já traz a área segura');
  assert.ok(!/bottom:\s*0/.test(t), 'bottom: 0 é onde a tab bar mora');
});

// ---------- só retrato ----------

test('o app avisa quando o telefone está deitado', () => {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  assert.match(html, /id="deitado"/, 'o aviso vive no HTML, não no Preact');
  assert.match(html, /role="alert"/);

  const manifesto = fs.readFileSync(path.join(RAIZ, 'public', 'manifest.webmanifest'), 'utf8');
  assert.match(manifesto, /"orientation":\s*"portrait"/,
    'o manifesto pede retrato; o Android honra em PWA instalado');
});

test('a trava de retrato não pega janela de computador', () => {
  // `orientation: landscape` sozinho pegaria qualquer janela de mesa, que é
  // deitada por natureza — e o app roda no navegador em desenvolvimento.
  // A ALTURA é o que separa telefone virado de janela de verdade.
  const m = base.match(/@media\s*\(orientation:\s*landscape\)([^{]*)\{/);
  assert.ok(m, 'a media query de deitado existe');
  assert.match(m![1], /max-height/,
    'sem teto de altura, o aviso cobriria o app no computador');
  const teto = Number((m![1].match(/max-height:\s*(\d+)px/) || [])[1]);
  assert.ok(teto > 0 && teto <= 560,
    'o teto tem que ficar abaixo de uma janela de mesa: ' + teto);
});


test('abrir um exercício sabe onde parar de rolar', () => {
  // Abrir passou a ROLAR até o cartão. Sem recuo, o nome do exercício para
  // embaixo do relógio grudado da sessão — e o recuo tem que sair do MESMO
  // token que dá altura ao relógio, senão os dois divergem em silêncio.
  const treino = fs.readFileSync(path.join(RAIZ, 'src', 'treino.css'), 'utf8');
  const ex = treino.match(/\n\.ex\s*\{([^}]*)\}/);
  assert.ok(ex, 'a regra do cartão existe');
  assert.match(ex![1], /scroll-margin-top:\s*calc\(var\(--sa-top\) \+ var\(--ins-relogio\)\)/);
  assert.match(regras(treino, '.day-rel'), /min-height:\s*var\(--ins-relogio\)/,
    'a altura do relógio e o recuo do scroll não podem divergir');
});


// ============================================================
// A BANCADA
//
// Ela rompe três dos seis inegociáveis de propósito (raio, sombra,
// movimento) e mora fora do `ins-`. O que estes testes seguram é que a licença
// seja SÓ dela: que o palco não vaze uma regra para dentro do app, que a
// segunda paleta que ele traz — o titânio — fique presa no bloco de tokens
// dele, e que as recusas que impedem a moldura de aparecer no telefone de
// alguém continuem escritas.
// ============================================================

const palcoCss = fs.readFileSync(path.join(RAIZ, 'src', 'palco.css'), 'utf8');
const palcoJs = fs.readFileSync(path.join(RAIZ, 'src', 'palco.js'), 'utf8');

/** Os seletores de uma folha — os de dentro de @media e @supports também. */
function seletores(css: string): string[] {
  const limpo = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // keyframes fora inteiros: 0%/100% não são seletor de nada
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    // de @media e @supports some só o PRELÚDIO, para que o que eles embrulham
    // seja cobrado como qualquer outra regra
    .replace(/@[a-z-]+[^{]*\{/g, '');
  return [...limpo.matchAll(/([^{}]+)\{/g)]
    .flatMap(m => m[1].split(','))
    .map(s => s.trim())
    .filter(Boolean);
}

test('nenhuma regra da bancada alcança o app', () => {
  // O palco desenha por FORA do vidro. Um seletor solto aqui — `body`, `h2`,
  // `iframe` — pintaria também dentro do telefone, onde estas regras não têm
  // nada a dizer, e o estrago apareceria só no aparelho de verdade.
  const soltos = seletores(palcoCss).filter(
    s => s !== ':root' && !s.includes('.pl') && !s.includes('[data-palco='));
  assert.deepStrictEqual(soltos, [],
    'seletor da bancada sem `.pl` nem `[data-palco=]`: isto pinta dentro do app');
});

test('o titânio da bancada não vira uma segunda paleta solta', () => {
  // Mesma regra de tokens.css, e pelo mesmo motivo: cor nova nasce nomeada.
  // O bloco `:root` do palco é o tokens.css DELE.
  const corpo = palcoCss.replace(/:root\s*\{[^}]*\}/, '');
  const soltas = [...new Set((corpo.match(/#[0-9A-Fa-f]{3,8}\b/g) || []))];
  assert.deepStrictEqual(soltas, [],
    'hexadecimal fora do bloco de tokens do palco: dê um nome antes de usar');
});

test('toda variável da bancada tem dono, e ela não redefine as do app', () => {
  const definidas = new Set([...palcoCss.matchAll(/^\s*(--pl-[a-z0-9-]+)\s*:/gm)].map(m => m[1]));
  // As geométricas nascem em JS, porque dependem do aparelho escolhido: umas
  // por `setProperty` na cena, outras escritas no atributo `style` de cada
  // botão e de cada traço de régua. As demais têm de estar no bloco de tokens.
  [...palcoJs.matchAll(/setProperty\('(--pl-[a-z0-9-]+)'/g)].forEach(m => definidas.add(m[1]));
  [...palcoJs.matchAll(/(--pl-[a-z0-9-]+)\s*:/g)].forEach(m => definidas.add(m[1]));
  const usadas = new Set([...palcoCss.matchAll(/var\((--pl-[a-z0-9-]+)/g)].map(m => m[1]));
  assert.deepStrictEqual([...usadas].filter(v => !definidas.has(v)), [],
    'var() do palco sem definição cai no valor herdado, em silêncio');

  assert.ok(!/^\s*--ins-[a-z0-9-]+\s*:/m.test(palcoCss),
    'a bancada redefiniu um token do Instrumento; a paleta do app mora em tokens.css');
});

test('a bancada recusa telefone, PWA instalado e embutido', () => {
  // Sem qualquer uma destas, a moldura de iPhone apareceria DENTRO do iPhone.
  ['display-mode: standalone', 'navigator.standalone', 'pointer: fine',
   'window.top !== window.self'].forEach(r => {
    assert.ok(palcoJs.includes(r), 'sumiu a recusa: ' + r);
  });
  assert.match(palcoJs, /innerWidth >= \d+/, 'falta o piso de largura de janela');
});

test('o app não monta duas vezes quando a bancada está de pé', () => {
  // Dois documentos sobre o mesmo estado seriam duas sincronizações
  // disputando a nuvem e dois wake locks. O `import` é o que garante a ordem:
  // com um global, a ordem seria detalhe de emissão do bundler.
  assert.match(mainJsx, /import \{ ehBancada \} from '\.\/palco\.js'/,
    'o guarda tem que vir por import, não por window');
  assert.match(mainJsx, /if \(ehBancada\(\)\) \{/);
  assert.ok(!/window\.__PALCO/.test(mainJsx + palcoJs), 'voltou a ponte global');
});

test('o aparelho simulado recebe as permissões que o app usa', () => {
  // Dentro de um iframe, câmera e wake lock precisam de `allow`. Sem isto o
  // protocolo de fotos e o cronômetro de descanso falham em SILÊNCIO — que é
  // exatamente o modo de falha que a bancada existe para não ter.
  const allow = palcoJs.match(/allow="([^"]+)"/);
  assert.ok(allow, 'o iframe perdeu o atributo allow');
  ['camera', 'screen-wake-lock'].forEach(p => {
    assert.ok(allow![1].includes(p), 'falta permissão no iframe: ' + p);
  });
});

test('a área segura simulada é escrita, e o app continua lendo --sa-*', () => {
  // É a ÚNICA coisa que o iframe não dá de graça: `env(safe-area-inset-*)` é
  // do sistema e num computador vem zero. Se isto sumir, a bancada mostra um
  // app sem faixa de status e sem folga para a barra de gestos — bonito e
  // mentiroso.
  ['--sa-top', '--sa-bottom', '--sa-left', '--sa-right'].forEach(v => {
    assert.ok(palcoJs.includes("'" + v + "'"), 'a bancada parou de escrever ' + v);
  });
  assert.match(palcoJs, /aplicaSeguranca\(document,/, 'o aparelho escreve na abertura');
  assert.match(palcoJs, /aplicaSeguranca\(el\.tela\.contentDocument/,
    'e a bancada reescreve ao trocar de aparelho, sem recarregar o iframe');
});

test('os aparelhos da prateleira são medidas de retrato, e plausíveis', () => {
  const tabela = [...palcoJs.matchAll(
    /w: (\d+), h: (\d+), dpr: (\d), raio: (\d+), rc: (\d+), mx: (\d+), my: (\d+), sat: (\d+), sab: (\d+)/g)]
    .map(m => m.slice(1).map(Number));
  assert.ok(tabela.length >= 3, 'a prateleira encolheu demais');
  tabela.forEach(([w, h, dpr, , , , my, sat, sab]) => {
    assert.ok(w < h, 'medida deitada na tabela: a coluna é retrato');
    assert.ok(dpr === 2 || dpr === 3);
    // Área segura maior que a moldura seria entalhe fora do vidro.
    assert.ok(sat >= 20 && sat <= 62, 'área segura de topo implausível: ' + sat);
    assert.ok(sab === 0 || sab === 34, 'a barra de gestos é 34, ou não existe');
    // Queixo grande só existe em aparelho sem entalhe.
    assert.ok(my > 40 ? sat === 20 : sat >= 20, 'queixo e entalhe no mesmo aparelho');
  });
});
