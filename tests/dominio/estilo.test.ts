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
  assert.match(rel, /top:\s*0/);
  assert.match(rel, /background:/, 'opaco: o conteúdo passa por baixo e precisa sumir');
});
