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

// ============================================================
// O REGISTRO DE FONTES, e por que ele não é um `readFileSync` solto
//
// Os 38 casos liam os arquivos com `fs.readFileSync` no ESCOPO DO MÓDULO —
// nove leituras, fora de qualquer `test()`. Se qualquer um desses arquivos
// saísse, fosse renomeado ou mudasse de lugar, o módulo estourava na
// IMPORTAÇÃO e nenhum caso chegava a ser registrado: a suíte respondia
// `Tests  no tests` e a contagem caía de 38 para ZERO sem uma única falha.
//
// É o pior modo de falha que esta rede tinha. Um caso vermelho grita; um
// arquivo que não coleta só desaparece da contagem, e quem lê "nenhuma falha"
// passa batido. E a reescrita que vem VAI renomear folhas.
//
// O conserto tem duas metades, e as duas são necessárias:
//
//  1. a leitura aqui NUNCA estoura — ela guarda o conteúdo OU o motivo da
//     falha, e o módulo sempre termina de carregar, sempre com 39 casos;
//  2. quem estoura é `fonte()`, chamada DENTRO de cada caso. Lá um arquivo que
//     falta é um caso VERMELHO que diz qual arquivo faltou.
//
// Devolver string vazia em silêncio seria pior que a coleta morta: os casos
// ficariam VERDES sem olhar nada. Por isso `fonte()` também reprova arquivo
// vazio.
// ============================================================

type Fonte = { txt: string } | { erro: string };
const LIDOS = new Map<string, Fonte>();

function carrega(rel: string): Fonte {
  const achado = LIDOS.get(rel);
  if (achado) return achado;
  let f: Fonte;
  try { f = { txt: fs.readFileSync(path.join(RAIZ, rel), 'utf8') }; }
  catch (e) { f = { erro: (e as { code?: string; message?: string }).code
                           || (e as Error).message || String(e) }; }
  LIDOS.set(rel, f);
  return f;
}

/** O conteúdo de um fonte. Arquivo que falta é VERMELHO AQUI, com o nome dele. */
function fonte(rel: string): string {
  const f = carrega(rel);
  if ('erro' in f) {
    throw new Error('a rede de CSS espera o arquivo ' + rel + ' e não conseguiu lê-lo (' +
      f.erro + '). Se ele mudou de nome ou de lugar, é a lista deste arquivo de teste ' +
      'que tem de mudar junto — a ausência não pode passar calada.');
  }
  if (!f.txt.trim()) {
    throw new Error('o arquivo ' + rel + ' está vazio: caso verde sobre nada é pior que vermelho');
  }
  return f.txt;
}

/** Vários fontes juntos, na ordem declarada. */
function juntos(rels: string[]): string { return rels.map(fonte).join('\n'); }

// As folhas do APP, declaradas. Todas, não uma amostra: enquanto o sistema
// antigo existia, o teste lia `tokens.css` e `app.css`, e ler uma lista curta
// deixaria o teste cego justamente onde as regras passaram a morar.
//
// DECLARADA e não descoberta, e a razão é a direção da reprovação. Lista
// descoberta (`readdirSync`) não reprova a FALTA: se `protocolo.css` sair, a
// régua simplesmente passa a medir quatro folhas e fica verde. Lista declarada
// reprova a falta pelo `fonte()`, mas não vê folha NOVA. Então as duas coisas
// existem lado a lado: a lista manda, e um caso próprio compara a lista com o
// que está no disco e reprova nos dois sentidos — folha declarada que sumiu e
// folha nova que ninguém declarou.
const FOLHAS = ['tokens.css', 'base.css', 'componentes.css', 'treino.css', 'protocolo.css'];
// A folha da BANCADA é declarada separada: ela rompe três dos seis
// inegociáveis de propósito e tem os casos dela no fim deste arquivo. Entrar
// nas FOLHAS do app faria a régua do app medir a licença dela.
const FOLHA_BANCADA = 'palco.css';

const css = () => juntos(FOLHAS.map(f => 'src/' + f));

test('toda custom property usada tem dono', () => {
  // A definição era reconhecida só no COMEÇO DE LINHA (`/^\s*--x\s*:/m`). Num
  // bloco sem espaços — `:root{--a:#000;--b:#111}`, que é o que qualquer
  // minificador produz e o que uma folha gerada pode trazer — só a PRIMEIRA
  // definição começa linha, e todas as outras viram órfãs falsas: medi 21 numa
  // cópia com o `:root` minificado. Reprovação em massa no código certo é tão
  // ruim quanto aprovação em silêncio, porque a resposta é desligar o caso.
  // `[{;]` reconhece a definição no lugar onde ela realmente pode começar.
  const DEFINE = /(?:^|[{;])\s*(--[a-z0-9-]+)\s*:/gm;
  const definidas = new Set([...css().matchAll(DEFINE)].map(m => m[1]));
  const usadas = new Set([...css().matchAll(/var\((--[a-z0-9-]+)/g)].map(m => m[1]));
  const orfas = [...usadas].filter(v => !definidas.has(v));
  assert.deepStrictEqual(orfas, [], 'var() sem definição cai no valor herdado, em silêncio');
});

test('a paleta do Instrumento está inteira e mora nos tokens', () => {
  const tokens = fonte('src/tokens.css');
  // A paleta foi substituída inteira em 11/10, por decisão do dono — a 12 das
  // quinze, com a nota literal "sem herancas". Era um conjunto escuro com
  // acento ácido; é um conjunto de papel claro com acento azul-violeta, e o
  // escuro passou a ser o espelho dele em vez da origem.
  //
  // E o caso ficou MAIS FORTE, não só atualizado: a paleta nova vive nos DOIS
  // temas, então cada nome é cobrado nos dois valores. Antes um nome definido
  // só num tema passava; agora não passa.
  const paleta = {
    '--ins-fundo':         ['#E7E3DB', '#08090A'],
    '--ins-tela':          ['#F5F3EE', '#111214'],
    '--ins-superficie':    ['#FFFFFF', '#1B1D21'],
    '--ins-superficie-2':  ['#EDEAE3', '#25282D'],
    '--ins-tinta':         ['#15171A', '#F2F1EE'],
    '--ins-tinta-2':       ['#474C54', '#BCC0C7'],
    '--ins-tinta-3':       ['#5C6169', '#A2A6AE'],
    '--ins-fio':           ['#DCD7CD', '#33363C'],
    '--ins-fio-controle':  ['#8C867A', '#7C818A'],
    '--ins-acento':        ['#3833DB', '#9E9BFF'],
    '--ins-acento-tinta':  ['#2C28BE', '#B6B4FF'],
    '--ins-acento-suave':  ['#E9E8FD', '#272550'],
    '--ins-sobre-acento':  ['#FFFFFF', '#14123F'],
    '--ins-atencao-fundo': ['#FBEFD6', '#33270F'],
    '--ins-atencao-tinta': ['#5E3B00', '#F3CF85'],
    '--ins-atencao-fio':   ['#D9A955', '#7A5A1E'],
    '--ins-pare-fundo':    ['#FBE4E1', '#3A1714'],
    '--ins-pare-tinta':    ['#7F1A12', '#FFADA3'],
    '--ins-pare-fio':      ['#D98A80', '#7E3129']
  };
  Object.entries(paleta).forEach(([nome, [claro, escuro]]) => {
    assert.ok(new RegExp(nome + ':\\s*' + claro, 'i').test(tokens),
      'sumiu ou mudou no CLARO: ' + nome + ' deveria ser ' + claro);
    assert.ok(new RegExp(nome + ':\\s*' + escuro, 'i').test(tokens),
      'sumiu ou mudou no ESCURO: ' + nome + ' deveria ser ' + escuro);
  });
});

test('cor nova não entra solta no meio das regras', () => {
  // O caso olhava só HEXADECIMAL. Cor escrita em `rgb()`, `rgba()`, `hsl()`,
  // `oklch()` ou `color()` entrava solta no meio das regras sem ninguém pegar —
  // e `rgba()` é justamente a forma que se alcança quando se quer um fundo
  // translúcido, que é o caso mais frequente de cor nova.
  const fora = juntos(FOLHAS.filter(f => f !== 'tokens.css').map(f => 'src/' + f));

  // As DUAS translucidezes que existem hoje, nomeadas uma a uma com o motivo.
  // Elas não são paleta: são véu sobre o que está atrás, e o alfa é o conteúdo
  // da declaração. Ficam aqui em vez de virar token porque o inventário de
  // tokens é da frente 4, e nomear cor por fora dele seria criar uma segunda
  // paleta. Mudar o alfa de uma delas fica VERMELHO, que é o que se quer: é
  // decisão, não ajuste.
  const VEUS = [
    'rgba(6, 8, 6, .72)',    // o véu da folha de baixo (componentes.css)
    'rgba(12, 14, 12, .35)'  // o véu do protocolo de fotos (protocolo.css)
  ];

  const hex = (fora.match(/#[0-9A-Fa-f]{3,8}\b/g) || []);
  const FUNCAO = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\([^)]*\)/g;
  const funcional = (fora.match(FUNCAO) || []).filter(c => VEUS.indexOf(c) < 0);

  const soltas = [...new Set(hex.concat(funcional))];
  assert.deepStrictEqual(soltas, [],
    'cor fora de tokens.css: dê um nome a ela antes de usar (ou, se for véu, nomeie o motivo aqui)');
});

test('a paleta antiga não existe mais, nem por apelido', () => {
  // Enquanto havia tela em string, cada nome antigo apontava para um token do
  // Instrumento — remapear era o que fazia a superfície legada inteira falar a
  // língua nova de imediato. Com a última convertida, o atalho sai: dois nomes
  // para a mesma cor é a porta pela qual uma segunda paleta volta a entrar.
  // DUAS paletas mortas desde 11/10: a pré-Instrumento (nomes em inglês) e a
  // do Instrumento, aposentada pela decisão 12. Esta lista é a única guarda
  // contra qualquer das duas voltar por um canto.
  //
  // `ins-acid` fica FORA da lista de propósito, e a razão não é de design: o
  // caso *a marca de recorde não pinta ácido sobre ácido* afirma
  // `color: var(--ins-acid)` LITERALMENTE, e ele não era um dos três casos que
  // a passada dos tokens podia mudar. O nome sobrevive em quarentena com UM
  // consumidor, apontando para o acento novo — a razão inteira está em
  // `tokens.css`. Quando a tela cheia do histórico for reescrita, aquele caso
  // muda de seletor e `ins-acid` entra aqui junto com os outros.
  const antigos = ['night', 'dusk', 'raise', 'line', 'paper', 'mist', 'dim',
    'dawn', 'dawn-soft', 'on-dawn', 'ember', 'ember-soft', 'ember-line',
    'ok', 'ok-line', 'info', 'info-line', 'f-m', 'f-d',
    // a paleta do Instrumento, aposentada — menos `ins-acid`, em quarentena
    'ins-canvas', 'ins-surface', 'ins-surface-low', 'ins-surface-acid',
    'ins-surface-acid2', 'ins-surface-warn', 'ins-hairline', 'ins-rule',
    'ins-border', 'ins-border-strong', 'ins-border-width', 'ins-text',
    'ins-text-2', 'ins-text-3', 'ins-text-4', 'ins-text-5', 'ins-acid-hover',
    'ins-amber', 'ins-coral', 'ins-on-acid', 'ins-radius', 'ins-raio-foto',
    'ins-font-display', 'ins-font-mono'];
  const vivos = antigos.filter(n => new RegExp('var\\(--' + n + '\\)').test(css()));
  assert.deepStrictEqual(vivos, [], 'nome da paleta antiga ainda em uso');
});

test('tela cheia usa svh, não vh', () => {
  // 100vh no iOS é a viewport GRANDE, com a barra do navegador recolhida:
  // sobra um trecho rolável do tamanho da barra e o fundo do body aparece.
  // `lvh` é essa mesma viewport por nome próprio, e `dvh` muda de tamanho
  // enquanto se rola: os três têm o mesmo defeito e o mesmo conserto.
  //
  // O caso cobrava só metade. Ele iterava as ocorrências de `height: 100vh` e
  // pedia `100svh` nos 200 caracteres seguintes — então uma folha reescrita SEM
  // nenhum dos dois passava com ZERO iterações, e a tela cheia voltava a não
  // ter altura estável sem ninguém ficar vermelho. A regra do projeto é
  // `height: 100vh; height: 100svh;`, nessa ordem, e as três metades dela agora
  // são cobradas: o `svh` existe, o fallback nunca fica sozinho, e o `svh`
  // nunca fica sem o fallback antes dele (invertida, a ordem faz o fallback
  // vencer em quem suporta os dois).
  //
  // TELA CHEIA é o que o caso promete, então o alcance é a altura de 100 da
  // viewport, em qualquer das quatro unidades. Teto ABAIXO de 100 fica fora de
  // propósito: o `max-height: 92dvh` da folha de baixo não é tela cheia, é
  // limite, e tem a razão escrita ao lado dele ("com a barra do Safari aberta,
  // 92vh passa da tela e o botão primário fica fora do alcance").
  const sem = css().replace(/\/\*[\s\S]*?\*\//g, '');
  const ALTURA = /(?<![\w-])((?:min-|max-)?height)\s*:\s*([^;{}]+)[;}]/g;
  const GRANDE = /(?<![\w-])100(?:vh|lvh|dvh)(?![\w-])/;
  const ESTAVEL = /(?<![\w-])100svh(?![\w-])/;
  const PERTO = 200;

  const decls = [...sem.matchAll(ALTURA)].map(m => ({
    prop: m[1], valor: m[2], i: m.index!, texto: m[0].trim()
  }));
  // uma declaração que já traz os dois (um `min()`, por exemplo) se resolve
  const grandes = decls.filter(d => GRANDE.test(d.valor) && !ESTAVEL.test(d.valor));
  const estaveis = decls.filter(d => ESTAVEL.test(d.valor));
  const soEstaveis = estaveis.filter(d => !GRANDE.test(d.valor));

  assert.ok(estaveis.length > 0,
    'nenhuma altura de tela cheia em svh: a folha nova sem nenhum dos dois passava calada');

  assert.deepStrictEqual(
    grandes.filter(g => !estaveis.some(e => e.prop === g.prop && e.i > g.i && e.i - g.i < PERTO))
           .map(d => d.texto), [],
    'viewport de 100 sem a MESMA propriedade em 100svh logo abaixo');

  assert.deepStrictEqual(
    soEstaveis.filter(e => !grandes.some(g => g.prop === e.prop && g.i < e.i && e.i - g.i < PERTO))
              .map(d => d.texto), [],
    '100svh sem o fallback em 100vh antes dele: invertida, a ordem faz o fallback vencer');
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
  //   3px  também: o vão óptico do sufixo de unidade ao lado do volume
  const EXCECOES = [3, 5, 9, 17];

  // TODAS as folhas, e não as três que o caso lia. `protocolo.css` estava nas
  // FOLHAS dos outros casos e fora desta lista: metade do espaçamento do app
  // não passava pela régua. E o padrão casava só `-top|-bottom`, então
  // `padding-left: 7px` e `margin-inline: 7px` passavam — os longhands
  // laterais e os lógicos entram agora, com `row-gap`/`column-gap`.
  const arquivos = FOLHAS;
  const fora: string[] = [];

  arquivos.forEach(f => {
    // sem comentários: eles citam medidas em prosa e virariam falso positivo
    const s = fonte('src/' + f).replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /(?<![\w-])(padding|margin|gap|row-gap|column-gap)(-top|-bottom|-left|-right|-inline|-block|-inline-start|-inline-end|-block-start|-block-end)?:\s*([^;{}]+)[;}]/g;
    let m;
    while ((m = re.exec(s))) {
      // `(\d+)px` lia DECIMAL errado em vez de não ler: em `padding: 13.5px`
      // o `13` falha (vem um ponto onde se espera `px`) e o casamento seguinte
      // pega `5px` — 5 está nas exceções, e a medida passava valendo outra
      // coisa. O ponto entra no número, e a borda recusa um ponto à esquerda.
      (m[3].match(/(?<![\w.-])(\d*\.?\d+)px/g) || []).forEach(px => {
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
  const duas = juntos(['src/componentes.css', 'src/treino.css'])
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // A linha da timeline saiu com o corpo do Agora da D; a linha da comida que
  // a substituiu é o alvo do mesmo jeito.
  ['.ag-l-b', '.ex-top'].forEach(sel => {
    const bloco = duas.match(new RegExp('\\' + sel + '\\s*\\{([^}]*)\\}'));
    assert.ok(bloco, 'sumiu do CSS: ' + sel);
    assert.ok(!/min-height/.test(bloco![1]),
      sel + ' voltou a forçar altura dentro de uma linha que já é o alvo');
  });
});


// ---------- comportamento de aplicativo, não de navegador ----------
// O app é instalado na tela de início e usado de pé, com uma mão, suado. Zoom
// acidental no meio de uma série custa mais do que zoom deliberado ganha, e
// cada regra abaixo tira um gesto que só faz sentido numa página.
//
// O QUE ESTES CASOS GUARDAM É A DECLARAÇÃO, NÃO O EFEITO, e a diferença foi
// medida: em 06/10, no PWA instalado na tela de início, a PINÇA FUNCIONA. Nem
// o `user-scalable=no`, nem o `touch-action`, nem a recusa dos eventos de gesto
// a impedem ali. A decisão é manter as três — elas ainda valem no Safari fora
// da tela cheia, e o bloqueio é do dono —, mas nenhum nome de caso abaixo pode
// prometer que o zoom não acontece. O que de fato impede o zoom AUTOMÁTICO, o
// que o Safari dá sozinho ao focar campo, é o piso de 16px do campo, e esse
// caso está mais abaixo.

const base = () => fonte('src/base.css');

/** Todas as declarações de um seletor, juntas — ele aparece em mais de um bloco. */
function regras(folha: string, seletor: string): string {
  const re = new RegExp('(?:^|[,{}\\n])\\s*' + seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                        '\\s*(?:,[^{]*)?\\{([^}]*)\\}', 'g');
  return [...folha.matchAll(re)].map(m => m[1]).join('\n');
}

/**
 * As regras de uma folha, cada uma com a sua LISTA de seletores separada.
 *
 * Existe para que um caso possa perguntar "existe regra que alcança `input` e
 * declara 16px?" em vez de casar `input, textarea, select` nessa ordem, numa
 * linha só. A ordem e o agrupamento de uma lista de seletores não são contrato
 * de produto: renomear ou reordenar quebrava o teste sem quebrar nada na tela.
 *
 * O prelúdio de `@media`/`@supports` sai e o que eles embrulham é cobrado como
 * qualquer outra regra — como em `seletores()`, logo abaixo. `@keyframes` sai
 * inteiro: `0%`/`100%` não são seletor de nada.
 */
function blocos(folha: string): { sels: string[]; corpo: string }[] {
  const limpo = folha
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .replace(/@[a-z-]+[^{]*\{/g, '');
  const out: { sels: string[]; corpo: string }[] = [];
  limpo.split('}').forEach(bloco => {
    const p = bloco.split('{');
    if (p.length !== 2) return;
    const sels = p[0].split(',').map(x => x.trim()).filter(Boolean);
    if (sels.length) out.push({ sels: sels, corpo: p[1] });
  });
  return out;
}

/**
 * Os ancestrais de tudo que o app desenha: a folha, o cabeçalho do modo, a
 * faixa, o cronômetro. São poucos e fixos — o app mora no `#app`, dentro do
 * body — e é por isso que dois casos podem ser de FONTE em vez de DOM.
 *
 * UMA constante para os dois casos de ancestral de propósito. Eles olhavam
 * árvores diferentes: o do bloco de contenção via `html|body|:root|*|#app`, e o
 * do scroll container via só o `body`. Um `overflow: hidden` em `#app` matava o
 * `sticky` da única saída da sessão e nenhum dos 38 casos pegava.
 */
const ANCESTRAL = /^(html|body|:root|\*|#app)([.:[][^ >+~]*)?$/;

/** O seletor de um bloco, sem o pseudo-elemento, para casar com ANCESTRAL. */
function raizDe(sel: string): string { return sel.replace(/::[a-z-]+$/, ''); }
const indexHtml = () => fonte('index.html');
const mainJsx = () => fonte('src/main.jsx');
// Os componentes de onde saem os SELETORES de quatro casos. Seis dos 28 casos
// "genéricos" estavam presos a um seletor literal — renomear a classe quebrava
// o teste sem quebrar o produto. Onde dá, o seletor passa a vir de quem o usa.
const telacheia = () => fonte('src/ui/instrumento/telacheia.jsx');
const primitivos = () => fonte('src/ui/instrumento/primitivos.jsx');

/** O trecho de UM componente exportado, para não casar a marcação do vizinho. */
function trechoDeComponente(fonte: string, nome: string): string {
  const i = fonte.indexOf('export function ' + nome);
  if (i < 0) return '';
  const resto = fonte.slice(i);
  const fim = resto.indexOf('export function', 1);
  return fim > 0 ? resto.slice(0, fim) : resto;
}

test('o `touch-action` que recusa o zoom está na RAIZ, e não só nos botões', () => {
  // Estava só no `button`, e o toque duplo que incomoda é o dado num texto,
  // num cartão ou numa foto. O efetivo é a interseção com os ancestrais, então
  // declarar na raiz alcança a árvore inteira.
  const html = base().match(/\bhtml\s*\{([^}]*)\}/);
  assert.ok(html, 'a regra de html existe');
  assert.match(html![1], /touch-action:\s*pan-x\s+pan-y/,
    'pan-x pan-y: rolar sim, pinça e toque duplo não');
});

test('o viewport DECLARA que o navegador não escala a página', () => {
  // "Declara" e não "impede": no app instalado a declaração não é honrada
  // (medido em 06/10). Ela fica porque ainda vale no Safari fora da tela cheia.
  assert.match(indexHtml(), /user-scalable=no/);
  assert.match(indexHtml(), /maximum-scale=1/);
  assert.match(indexHtml(), /viewport-fit=cover/, 'a área segura continua contada');
});

test('a pinça do WebKit tem recusa própria, que o touch-action não alcança', () => {
  // O Safari implementa a pinça como gesto próprio, acima do touch-action.
  // A recusa está escrita; ela não é suficiente no app instalado, onde a pinça
  // funciona (medido em 06/10). O caso guarda que os três eventos continuam
  // sendo recusados, não que o gesto não aconteça.
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => {
    assert.ok(mainJsx().includes(n), 'falta recusar ' + n);
  });
  assert.match(mainJsx(), /passive:\s*false/,
    'sem passive:false o preventDefault é ignorado e o listener vira decoração');
});

test('segurar o dedo na interface não abre menu nem seleciona', () => {
  const corpo = regras(base(), 'body');
  assert.ok(corpo, 'a regra de body existe');
  assert.match(corpo, /-webkit-touch-callout:\s*none/);
  assert.match(corpo, /user-select:\s*none/);
  assert.match(corpo, /-webkit-tap-highlight-color:\s*transparent/);
});

test('mas campo e prosa continuam selecionáveis', () => {
  // sem isto não se seleciona o que se digitou para corrigir, que é o oposto
  // de comportamento de aplicativo
  //
  // Casava `p, .ins-prosa, input, textarea` — quatro seletores, nessa ordem,
  // numa regra só. Separar a exceção em duas regras deixava tudo selecionável e
  // o caso VERMELHO. Agora a pergunta é por ELEMENTO, em qualquer agrupamento e
  // qualquer ordem. `.ins-prosa` saiu do casamento de propósito: é nome de
  // classe, e o redesenho renomeia classe — a metade da prosa fica cobrada pelo
  // `p`, que é elemento e não se renomeia, mais a exigência de que a liberação
  // continue alcançando ALGUMA classe de prosa, qualquer que seja o nome.
  const LIBERA = /(?<![-\w])user-select:\s*text/;
  const livres = blocos(css()).filter(b => LIBERA.test(b.corpo));

  ['p', 'input', 'textarea'].forEach(el => {
    assert.ok(livres.some(b => b.sels.some(sel => sel === el)),
      el + ' deixou de ser selecionável: não se corrige o que não se seleciona');
  });

  assert.ok(livres.some(b => b.sels.some(sel => /^\.[\w-]+$/.test(sel))),
    'a prosa por classe também continua selecionável');
});

test('a barra deslizante toma o gesto, em vez de disputá-lo com a rolagem', () => {
  assert.match(base(), /input\[type="range"\]\s*\{[^}]*touch-action:\s*none/);
});

test('o campo nunca fica abaixo de 16px, que é o que faz o Safari dar zoom', () => {
  // Com fonte menor o Safari dá zoom ao focar o campo, e a tela fica torta no
  // meio de uma série. É a regra que mais se quebra sozinha, porque no desktop
  // nada acontece.
  //
  // Casava `/\ninput,\s*textarea,\s*select\s*\{/`: a regra tinha de existir
  // com os três elementos, nessa ordem, numa linha só. Separar por elemento
  // deixava o 16px honrado em tudo e o caso VERMELHO. Agora são duas perguntas,
  // as duas por elemento e as duas indiferentes a ordem e agrupamento: cada
  // campo tem uma regra que o alcança INTEIRO com 16px ou mais, e nenhuma regra
  // que alcance campo desce abaixo de 16.
  const CAMPOS = ['input', 'textarea', 'select'];
  const PX = /font-size:\s*(\d+(?:\.\d+)?)px/g;
  const todos = blocos(css());

  CAMPOS.forEach(el => {
    // seletor que é o elemento cru: alcança TODO campo daquele tipo. Narrar com
    // pseudo ou atributo deixaria algum campo fora do piso.
    const piso = todos.filter(b => b.sels.some(sel => sel === el))
      .flatMap(b => [...b.corpo.matchAll(PX)].map(m => Number(m[1])));
    assert.ok(piso.length > 0, el + ' ficou sem font-size numa regra que o alcance inteiro');
    assert.ok(Math.max(...piso) >= 16,
      el + ': o maior font-size declarado é ' + Math.max(...piso) + 'px, abaixo do piso de 16');
  });

  // e nenhuma regra que alcance campo — por classe, por atributo, por ancestral
  // — baixa o piso depois
  const ALCANCA = new RegExp('(?:^|[\\s>+~])(' + CAMPOS.join('|') + ')(?![\\w-])');
  const pequenas: string[] = [];
  todos.forEach(b => {
    if (!b.sels.some(sel => ALCANCA.test(sel))) return;
    [...b.corpo.matchAll(PX)].forEach(m => {
      if (Number(m[1]) < 16) pequenas.push(b.sels.join(', ') + ' → ' + m[0]);
    });
  });
  assert.deepStrictEqual(pequenas, [], 'campo abaixo de 16px: o Safari dá zoom ao focar');
});

// ---------- a saída de uma tela cheia ----------

test('o voltar fica grudado no topo, porque é a única saída', () => {
  // O app não usa `history`: em PWA instalado não há botão do navegador nem
  // gesto de borda. Se este botão rolar para fora, sair exige rolar tudo de
  // volta — e ele rolava, em quatro dos cinco destinos.
  //
  // Casava `.tc-topo` literal, numa folha nomeada. O nome da classe não é
  // contrato de produto: renomeá-la quebrava o teste sem quebrar nada. Agora o
  // seletor vem de QUEM O USA — a barra que envolve o botão de voltar na casca
  // da tela cheia — e a regra é procurada em todas as folhas.
  const barra = telacheia().slice(0, telacheia().indexOf('onClick={aoVoltar}'));
  assert.ok(telacheia().includes('onClick={aoVoltar}'),
    'a casca da tela cheia perdeu o botão de voltar, que é a única saída');
  const envolve = [...barra.matchAll(/<div[^>]*class="([^"]+)"/g)].pop();
  assert.ok(envolve, 'o voltar não está dentro de nenhuma barra');

  const classes = envolve![1].trim().split(/\s+/);
  const grudada = classes.filter(c => /position:\s*sticky/.test(regras(css(), '.' + c)));
  assert.ok(grudada.length > 0,
    'a barra do voltar (' + classes.join(' ') + ') não gruda: sair exigiria rolar tudo de volta');

  const corpo = regras(css(), '.' + grudada[0]);
  assert.match(corpo, /top:\s*0/);
  assert.match(corpo, /background:/, 'opaco: o conteúdo passa por baixo e precisa sumir');
});

test('nenhum ancestral do sticky vira scroll container', () => {
  // O `sticky` morre se QUALQUER ancestral tiver `overflow` diferente de
  // `visible`: ele passa a se ancorar nesse ancestral, e se quem rola é a
  // janela, o cabeçalho acompanha o conteúdo e some sob a barra do Safari.
  // `overflow-x: hidden` sozinho também quebra, porque o outro eixo vira
  // `auto`; `clip` corta sem criar scroll container.
  //
  // O caso olhava SÓ o `body`. Um `overflow: hidden` em `#app` mataria o sticky
  // do cabeçalho do modo — que é onde mora a única saída da sessão — e nenhum
  // dos 38 casos pegaria. Agora a árvore é a MESMA de 'nada entre a folha e a
  // janela cria bloco de contenção' (a constante ANCESTRAL): os dois casos
  // olham os mesmos ancestrais, porque a folha e o cabeçalho moram os dois no
  // `#app`, dentro do body.
  //
  // A única exceção é o corpo TRAVADO enquanto uma folha está aberta: ali o
  // scroll da página está desligado de propósito (`position: fixed; inset: 0`),
  // não há sticky a ancorar, e a posição é devolvida ao fechar. Ela é nomeada
  // por seletor para que um `overflow: hidden` NOVO em `body` ou `#app`
  // continue sendo pego.
  const TRAVA = 'body.ins-travado';
  const SEGURO = /:\s*(?:visible|clip)(?:\s+(?:visible|clip))?\s*$/;

  const culpadas: string[] = [];
  blocos(css()).forEach(b => {
    const alcanca = b.sels.filter(sel => ANCESTRAL.test(raizDe(sel)) && sel !== TRAVA);
    if (!alcanca.length) return;
    (b.corpo.match(/overflow(?:-x|-y)?\s*:[^;}]+/g) || []).forEach(d => {
      if (!SEGURO.test(d.trim())) culpadas.push(alcanca.join(', ') + ' → ' + d.trim());
    });
  });
  assert.deepStrictEqual(culpadas, [],
    'overflow que cria scroll container num ancestral mata o voltar grudado');

  // e a goteira lateral continua cortada por `clip`, que não cria o container
  assert.match(regras(base(), 'body'), /overflow-x:\s*clip/);
});

// ---------- alvo de toque ----------

test('controle pequeno estende o ALVO sem crescer o desenho', () => {
  // O sistema é denso de propósito. Aumentar os controles engordaria telas
  // inteiras; o ::after estende só a área que o dedo alcança.
  const tres = juntos(['src/base.css', 'src/componentes.css', 'src/treino.css']);
  // Os quatro últimos entraram depois de medir o cartão de exercício aberto:
  // o descanso, a anotação, o aquecimento e o RIR ficavam entre 34 e 40px —
  // todos apertados de pé, com uma mão, entre uma série e outra.
  ['.ins-caixa', '.ins-tick', '.ins-chip', '.crow-x', '.cardl-b', '.dd-diabtn',
   '.restlinha', '.notabtn', '.aqbtn', '.rirbtn', '.histbtn'].forEach(sel => {
    // O seletor pode estar numa LISTA, e a §0.1 da frente 2 nomeia este
    // acoplamento: "a ordem e o agrupamento de uma lista de seletores não são
    // contrato de produto". Casava `\.x::after\s*\{`, e agrupar a regra com um
    // vizinho — o que eu fiz ao dar uma classe própria à porta do teclado em
    // Corpo — deixava o caso vermelho sem nada ter mudado na tela.
    const re = new RegExp('(?:^|[,{}\\n])\\s*\\' + sel +
                          '::after\\s*(?:,[^{]*)?\\{([^}]*)\\}');
    const m = tres.match(re);
    assert.ok(m, sel + ' perdeu a área de toque estendida');
    assert.match(m![1], /position:\s*absolute/);
    assert.match(m![1], /inset:\s*-/, sel + ': a área tem que ser MAIOR que o desenho');
  });
});

test('o alvo do tick cresce só na vertical', () => {
  // Na horizontal o vizinho é a célula seguinte da mesma contagem: crescer para
  // o lado faria um toque na borda registrar o número errado.
  //
  // Casava `.ins-tick::after` literal. Agora as duas classes vêm do componente
  // que desenha a contagem, e o teste cobra também a PREMISSA que torna a regra
  // necessária: que os ticks fiquem em linha. Se um dia eles virarem coluna, é
  // este caso que tem de ser reescrito — e ele diz isso ficando vermelho.
  const corpoTicks = trechoDeComponente(primitivos(), 'Ticks');
  const antesDoBotao = corpoTicks.slice(0, corpoTicks.indexOf('<button'));
  const fila = [...antesDoBotao.matchAll(/<div[^>]*class="([^"]+)"/g)].pop();
  const tick = corpoTicks.match(/<button[\s\S]*?class=\{'([a-z0-9-]+)'/);
  assert.ok(fila && tick, 'o componente da contagem mudou de forma');

  assert.match(regras(css(), '.' + fila![1].trim().split(/\s+/)[0]), /display:\s*flex/,
    'os ticks ficam em LINHA: é por isso que o alvo não pode crescer para o lado');
  const alvo = regras(css(), '.' + tick![1] + '::after');
  assert.ok(alvo, '.' + tick![1] + '::after perdeu a área de toque estendida');
  assert.match(alvo, /inset:\s*-[\d.]+px\s+0(?![\d.])/, 'o segundo valor tem que ser 0');
});

test('a régua toma o gesto horizontal, em vez de disputá-lo', () => {
  // R1 da frente 2, e o precedente está logo acima: a barra deslizante declara
  // `touch-action: none` com a mesma razão. A raiz do app diz `pan-x pan-y` —
  // "o gesto desta página é rolar" —, e num contêiner que role na horizontal
  // qualquer deslocamento do dedo durante o toque vira pan: o `click` não
  // dispara, e o toque é ENGOLIDO. É a causa 2 da §1.2.
  //
  // A régua de hoje não rola (a janela mostra só os slots da página), então a
  // declaração é cinto além do suspensório. Ela fica porque é de graça e porque
  // é o que impede que uma mudança de layout devolva o arrasto em silêncio.
  const comp = trechoDeComponente(fonte('src/ui/instrumento/regua.jsx'), 'Regua');
  const faixa = comp.match(/<div class="([a-z-]+)" role="group"/);
  assert.ok(faixa, 'a faixa da régua mudou de forma: o caso tem de mudar junto');
  const r = regras(css(), '.' + faixa![1]);
  assert.match(r, /display:\s*flex/, 'os valores ficam em LINHA, que é a premissa de R1 e R3');
  assert.match(r, /touch-action:\s*pan-y/,
    'sem isto, um arrasto horizontal volta a competir com o toque');
});

test('o alvo da régua cresce só na vertical, e tem 46px', () => {
  // Mesma geometria e mesmo risco do tick, e aqui vale com mais força: o vizinho
  // horizontal é a repetição seguinte, e erro de alvo tem tolerância ZERO na
  // medição A da frente 2. Então `inset: -Npx 0`, com o segundo valor em zero, e
  // nunca o contrário.
  //
  // E 46px porque a régua é o primeiro nome da lista de "controle repetido" da
  // §8.2 da frente 4 — o `.rirop` vizinho ainda está em 44, e isso é da passada
  // dela, não desta.
  const comp = trechoDeComponente(fonte('src/ui/instrumento/regua.jsx'), 'Regua');
  const valor = comp.match(/class=\{'([a-z-]+)' \+ \(s\.naFaixa/);
  assert.ok(valor, 'o botão de valor da régua mudou de forma');
  const alvo = regras(css(), '.' + valor![1] + '::after');
  assert.ok(alvo, '.' + valor![1] + '::after perdeu a área de toque estendida');
  assert.match(alvo, /inset:\s*-[\d.]+px\s+0(?![\d.])/, 'o segundo valor tem que ser 0');
  assert.match(regras(css(), '.' + valor![1]), /min-height:\s*4[6-9]px|min-height:\s*5\dpx/,
    'o alvo visível não pode ficar abaixo de 46px');
});

test('o cursor do teclado próprio não se move', () => {
  // T4 da §6.2. A Direção C pisca a 1 Hz, infinitamente, e é o único movimento
  // infinito dos dois arquivos de direção — passa o critério 2.3.1 (que é 3 Hz)
  // e mesmo assim é a única coisa no app que nunca pararia. A forma da D é um
  // retângulo estático, e é ela que fica.
  //
  // Estático é mais forte que "dentro de prefers-reduced-motion": não há o que
  // desligar. Então o caso cobra a AUSÊNCIA de animação, e não a presença da
  // consulta de mídia.
  const r = regras(css(), '.tcl-cursor');
  assert.ok(r, '.tcl-cursor saiu da folha');
  assert.doesNotMatch(r, /animation|transition/,
    'o cursor voltou a se mover: a forma escolhida é a estática');
});

test('o limite das teclas do teclado próprio é o do sistema', () => {
  // T3 da §6.2, e o número vem de C3: as doze teclas da Direção D têm
  // preenchimento a **1,20:1** e borda zero — o teclado construído para ser mais
  // seguro era o pior caso de contraste dos dois arquivos. O critério 1.4.11 pede
  // 3:1 para limite de componente.
  //
  // O conserto é de token, e o valor é da frente 4: aqui se cobra que a tecla use
  // o token de LIMITE DE CONTROLE do sistema, em vez de um valor próprio que
  // ninguém mede depois.
  const r = regras(css(), '.tcl-t');
  assert.ok(r, '.tcl-t saiu da folha');
  assert.match(r, /border:[^;]*var\(--ins-fio-controle\)/,
    'a tecla tem de usar o token de limite de controle');
});

test('o toast é anunciado por leitor de tela', () => {
  const html = indexHtml();
  const m = html.match(/<div id="toast"[^>]*>/);
  assert.ok(m, 'o toast existe');
  assert.match(m![0], /role="status"/);
  assert.match(m![0], /aria-live="polite"/, 'polite: o toast informa, nunca interrompe');
});

test('a tela cheia tem título de primeiro nível, e ele recebe foco', () => {
  // Casava `class="ins-display tc-titulo` — dois nomes de classe, nessa ordem,
  // dentro da tag. O que não pode mudar é o h1 existir, ser alvo de foco e
  // receber o foco sem mexer no scroll; como ele se chama é assunto do CSS.
  //
  // E de quebra as três asserções passam a ser sobre o MESMO elemento: antes,
  // `tabindex="-1"` e o `.focus()` casavam em qualquer lugar do arquivo, então
  // um tabindex num botão qualquer já satisfazia o caso.
  const h1 = telacheia().match(/<h1\b[^>]*>/);
  assert.ok(h1, 'o destino precisa de h1: sem a shell das abas não há título de primeiro nível');
  assert.match(h1![0], /tabindex="-1"/, 'alvo de foco sem entrar na tabulação');

  const ref = h1![0].match(/ref=\{([A-Za-z_$][\w$]*)\}/);
  assert.ok(ref, 'o h1 não é a referência que recebe o foco');
  assert.match(telacheia(),
    new RegExp(ref![1] + '\\.current\\.focus\\(\\{\\s*preventScroll:\\s*true\\s*\\}\\)'),
    'foco sem mexer no scroll, que já foi para o topo');
});

test('o relógio da sessão gruda no topo enquanto o treino corre', () => {
  const treino = fonte('src/treino.css');
  const rel = regras(treino, '.day-rel');
  assert.match(rel, /position:\s*sticky/);
  assert.match(rel, /background:/, 'opaco: o conteúdo passa por baixo e precisa sumir');
  // `top: 0` encostaria no relógio do iPhone: com `black-translucent` o
  // conteúdo passa por baixo da barra de status, e zero é o topo REAL da tela
  assert.match(rel, /top:\s*var\(--sa-top\)/,
    'tem que parar abaixo da barra de status, não em cima dela');
  assert.ok(!/top:\s*0\s*;/.test(rel), 'top: 0 põe o número embaixo do relógio do sistema');
});

test('no modo, a reserva do rodapé perde a barra de abas mas guarda a área segura', () => {
  // `--ins-tabbar` é a RESERVA que o rodapé fixo precisa vencer — não a altura
  // da barra, que se mede sozinha (`tokens.css` diz isso literalmente). Quatro
  // consumidores ancoram nela: o fim da página, o toast, o cronômetro e a faixa
  // da sessão. No modo a barra não é desenhada, e sem o ajuste sobra a altura
  // dela de espaço morto no fim do treino.
  const comp = fonte('src/componentes.css');
  const no_modo = regras(comp, '#app:has(.ins-modo)');
  const valor = no_modo.match(/--ins-tabbar:\s*([^;]+);/);
  assert.ok(valor, 'o modo precisa redefinir a reserva do rodapé');
  // `0` tiraria junto o espaço do indicador de home, e o último cartão
  // encostaria nele. O que sai é a barra, não a área segura.
  assert.strictEqual(valor![1].trim(), 'var(--sa-bottom)',
    'guarda a área segura: zerar a reserva encosta o conteúdo no indicador');
});

test('a saída do modo gruda no topo, e a cadeia acima dela não cria scroll', () => {
  // A frente 1 escreveu a regra com todas as letras: "a seta não some em nenhum
  // estado do modo" (§4.3, item 5). Barra não-sticky some ao rolar — e o modo
  // existe justamente porque o dedo ficava preso numa tela sem saída. Uma
  // saída que rola para fora é a mesma armadilha com um passo a mais.
  const comp = fonte('src/componentes.css');
  const topo = regras(comp, '.ins-modo-topo');
  assert.match(topo, /position:\s*sticky/, 'a barra da saída gruda');
  assert.match(topo, /background:/,
    'e é opaca: o conteúdo passa por baixo dela e precisa sumir');
  // Nada de `backdrop-filter` aqui: ele pisca no Blink ao animar vizinho ou
  // resetar o scroll, e fundo um pouco mais opaco resolve sem o efeito.
  assert.ok(!/backdrop-filter/.test(topo), 'sem blur: ele pisca no Blink');

  // A metade que já quebrou este app mais de uma vez: sticky se ancora no
  // primeiro ANCESTRAL com overflow ≠ visible, e aí acompanha o conteúdo e
  // some. `overflow-x: hidden` sozinho também serve de armadilha — a outra
  // direção vira `auto`. Só `clip` corta sem criar container.
  const modo = regras(comp, '.ins-modo');
  const over = [...modo.matchAll(/overflow(-[xy])?:\s*([a-z-]+)/g)];
  assert.deepStrictEqual(
    over.filter(m => m[2] !== 'visible' && m[2] !== 'clip').map(m => m[0]), [],
    'o invólucro do modo não pode criar scroll container: ' +
    'overflow hidden/auto/scroll aqui mata o sticky da saída');
});

test('dentro do modo o relógio para ABAIXO da saída, não por baixo dela', () => {
  // Duas barras grudadas no mesmo topo: a saída do modo e o relógio da sessão,
  // que fora do modo gruda em `var(--sa-top)`. Sem deslocar o segundo, ele
  // encosta embaixo do primeiro e os dois ocupam a mesma faixa.
  const comp = fonte('src/componentes.css');
  const dentro = regras(comp, '.ins-modo .day-rel');
  assert.match(dentro, /top:\s*var\(--ins-modo-topo-h\)/,
    'o deslocamento é a ALTURA da barra, em token — somar à mão aqui ' +
    'desencontra na primeira vez que o padding da barra mudar');
  assert.match(regras(comp, '.ins-modo'), /--ins-modo-topo-h:/,
    'e a altura é declarada onde a barra é montada, com as mesmas parcelas');
});

test('a barra de status tem fundo, senão o conteúdo rola por baixo dela', () => {
  // `black-translucent` deixa a página passar sob o relógio e a bateria do
  // sistema — bonito parado, ilegível rolando.
  const faixa = base().match(/body::before\s*\{([^}]*)\}/);
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
  const comp = fonte('src/componentes.css');
  const t = regras(comp, '#timer');
  assert.ok(t, 'a regra do cronômetro existe');
  assert.match(t, /bottom:\s*var\(--ins-tabbar\)/,
    'empilhado ACIMA da tab bar; --ins-tabbar já traz a área segura');
  assert.ok(!/bottom:\s*0/.test(t), 'bottom: 0 é onde a tab bar mora');
});

// ---------- só retrato ----------

test('o app avisa quando o telefone está deitado', () => {
  const html = indexHtml();
  assert.match(html, /id="deitado"/, 'o aviso vive no HTML, não no Preact');
  assert.match(html, /role="alert"/);

  const manifesto = fonte('public/manifest.webmanifest');
  assert.match(manifesto, /"orientation":\s*"portrait"/,
    'o manifesto pede retrato; o Android honra em PWA instalado');
});

test('a trava de retrato não pega janela de computador', () => {
  // `orientation: landscape` sozinho pegaria qualquer janela de mesa, que é
  // deitada por natureza — e o app roda no navegador em desenvolvimento.
  // A ALTURA é o que separa telefone virado de janela de verdade.
  const m = base().match(/@media\s*\(orientation:\s*landscape\)([^{]*)\{/);
  assert.ok(m, 'a media query de deitado existe');
  assert.match(m![1], /max-height/,
    'sem teto de altura, o aviso cobriria o app no computador');
  const teto = Number((m![1].match(/max-height:\s*(\d+)px/) || [])[1]);
  assert.ok(teto > 0 && teto <= 560,
    'o teto tem que ficar abaixo de uma janela de mesa: ' + teto);
});


test('a marca de recorde não pinta ácido sobre ácido', () => {
  // Ela saía como um bloco sólido e mudo. Uma regra `.rec` sobrando do sistema
  // antigo punha `background: var(--ins-acid)`, e a regra específica punha a
  // MESMA cor no texto: "recorde de carga" ficava invisível dentro do próprio
  // selo — 1:1 de contraste, na única coisa que o app marca como conquista.
  const m = css().match(/\.tc-res-sets \.rec\s*\{([^}]*)\}/);
  assert.ok(m, 'a regra do recorde existe');
  assert.match(m![1], /color:\s*var\(--ins-acid\)/);
  assert.ok(!/background/.test(m![1]), 'o chip é VAZADO: fundo é o que ele não põe');
  assert.ok(!/(^|\n)\.rec\s*\{/.test(css()), 'a regra solta `.rec` voltou, e com ela o fundo ácido');
});

test('o texto que se toca não usa o nível mais apagado', () => {
  // O nível 5 dá 3,2:1 sobre o papel, e o próprio sistema o reserva para o
  // redundante — aba inativa, dica que repete o que já está na tela. Um
  // controle não é redundante: se não dá para ler, não dá para achar. Vale
  // também para o cabeçalho da tabela de série, que é o que separa a coluna
  // de kg da de repetição no meio do treino.
  const bloco = (nome: string) => {
    // Mesma razão do caso do ::after: o seletor pode estar em lista.
    const m = css().match(new RegExp('(?:^|[,{}\\n])\\s*' +
      nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*(?:,[^{]*)?\\{([^}]*)\\}'));
    return m ? m[1] : null;
  };
  ['.restlinha', '.notabtn', '.dd-diabtn', '.crow-x', '.sethead > *'].forEach(sel => {
    const b = bloco(sel);
    assert.ok(b, 'sumiu do CSS: ' + sel);
    assert.ok(!/--ins-text-5/.test(b!), sel + ' voltou ao nível 5, que é 3,2:1');
  });
});

test('abrir um exercício sabe onde parar de rolar', () => {
  // Abrir passou a ROLAR até o cartão. Sem recuo, o nome do exercício para
  // embaixo do relógio grudado da sessão — e o recuo tem que sair do MESMO
  // token que dá altura ao relógio, senão os dois divergem em silêncio.
  const treino = fonte('src/treino.css');
  const ex = treino.match(/\n\.ex\s*\{([^}]*)\}/);
  assert.ok(ex, 'a regra do cartão existe');
  assert.match(ex![1], /scroll-margin-top:\s*calc\(var\(--sa-top\) \+ var\(--ins-relogio\)\)/);
  assert.match(regras(treino, '.day-rel'), /min-height:\s*var\(--ins-relogio\)/,
    'a altura do relógio e o recuo do scroll não podem divergir');
});

test('o cronômetro de descanso não anima largura', () => {
  // Ele repinta 4× por segundo por até três minutos. Animar `width` refaz o
  // layout a cada quadro; a escala roda no compositor e desenha a mesma barra.
  //
  // Casava `#tfill` literal, numa folha nomeada. O id vem agora de QUEM ESCALA:
  // o teste acha no JS a variável que recebe `scaleX`, descobre de qual
  // `getElementById` ela veio, confere que esse id existe no HTML e cobra a
  // regra dele em qualquer folha. Renomear o id nos três lugares continua
  // verde; animar largura em qualquer um deles fica vermelho.
  const escala = mainJsx().match(/(\w+)\.style\.transform = 'scaleX\(/);
  assert.ok(escala, 'o JS deixou de escalar a barra');
  const achado = mainJsx().match(new RegExp(
    '(?:const|let|var)\\s+' + escala![1] + "\\s*=\\s*document\\.getElementById\\('([\\w-]+)'\\)"));
  assert.ok(achado, 'a barra escalada não vem de um getElementById com id achável');

  const id = achado![1];
  assert.ok(new RegExp('id="' + id + '"').test(indexHtml()), 'o elemento ' + id + ' existe no HTML');
  const corpo = regras(css(), '#' + id);
  assert.ok(corpo, 'a barra do cronômetro (#' + id + ') perdeu a regra dela');
  assert.ok(!/transition:[^;]*width/.test(corpo), 'largura animada custa layout por quadro');
  assert.match(corpo, /transition:\s*transform/);
  assert.ok(!new RegExp(escala![1] + '\\.style\\.width').test(mainJsx()),
    'o JS voltou a escrever largura');
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

const palcoCss = () => fonte('src/' + FOLHA_BANCADA);
const palcoJs = () => fonte('src/palco.js');

/** Os seletores de uma folha — os de dentro de @media e @supports também. */
function seletores(folha: string): string[] {
  const limpo = folha
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
  const soltos = seletores(palcoCss()).filter(
    s => s !== ':root' && !s.includes('.pl') && !s.includes('[data-palco='));
  assert.deepStrictEqual(soltos, [],
    'seletor da bancada sem `.pl` nem `[data-palco=]`: isto pinta dentro do app');
});

test('o titânio da bancada não vira uma segunda paleta solta', () => {
  // Mesma regra de tokens.css, e pelo mesmo motivo: cor nova nasce nomeada.
  // O bloco `:root` do palco é o tokens.css DELE.
  const corpo = palcoCss().replace(/:root\s*\{[^}]*\}/, '');
  const soltas = [...new Set((corpo.match(/#[0-9A-Fa-f]{3,8}\b/g) || []))];
  assert.deepStrictEqual(soltas, [],
    'hexadecimal fora do bloco de tokens do palco: dê um nome antes de usar');
});

test('toda variável da bancada tem dono, e ela não redefine as do app', () => {
  const definidas = new Set([...palcoCss().matchAll(/^\s*(--pl-[a-z0-9-]+)\s*:/gm)].map(m => m[1]));
  // As geométricas nascem em JS, porque dependem do aparelho escolhido: umas
  // por `setProperty` na cena, outras escritas no atributo `style` de cada
  // botão e de cada traço de régua. As demais têm de estar no bloco de tokens.
  [...palcoJs().matchAll(/setProperty\('(--pl-[a-z0-9-]+)'/g)].forEach(m => definidas.add(m[1]));
  [...palcoJs().matchAll(/(--pl-[a-z0-9-]+)\s*:/g)].forEach(m => definidas.add(m[1]));
  const usadas = new Set([...palcoCss().matchAll(/var\((--pl-[a-z0-9-]+)/g)].map(m => m[1]));
  assert.deepStrictEqual([...usadas].filter(v => !definidas.has(v)), [],
    'var() do palco sem definição cai no valor herdado, em silêncio');

  // `[{;]` e não só começo de linha, pelo mesmo motivo do caso das órfãs: num
  // `:root` minificado, uma redefinição de token do app escaparia — e aqui o
  // modo de falha é o pior dos dois, porque o caso ficaria VERDE.
  assert.ok(!/(?:^|[{;])\s*--ins-[a-z0-9-]+\s*:/m.test(palcoCss()),
    'a bancada redefiniu um token do Instrumento; a paleta do app mora em tokens.css');
});

test('a bancada recusa telefone, PWA instalado e embutido', () => {
  // Sem qualquer uma destas, a moldura de iPhone apareceria DENTRO do iPhone.
  ['display-mode: standalone', 'navigator.standalone', 'pointer: fine',
   'window.top !== window.self'].forEach(r => {
    assert.ok(palcoJs().includes(r), 'sumiu a recusa: ' + r);
  });
  assert.match(palcoJs(), /innerWidth >= \d+/, 'falta o piso de largura de janela');
});

test('o app não monta duas vezes quando a bancada está de pé', () => {
  // Dois documentos sobre o mesmo estado seriam duas sincronizações
  // disputando a nuvem e dois wake locks. O `import` é o que garante a ordem:
  // com um global, a ordem seria detalhe de emissão do bundler.
  assert.match(mainJsx(), /import \{ ehBancada \} from '\.\/palco\.js'/,
    'o guarda tem que vir por import, não por window');
  assert.match(mainJsx(), /if \(ehBancada\(\)\) \{/);
  assert.ok(!/window\.__PALCO/.test(mainJsx() + palcoJs()), 'voltou a ponte global');
});

test('o aparelho simulado recebe as permissões que o app usa', () => {
  // Dentro de um iframe, câmera e wake lock precisam de `allow`. Sem isto o
  // protocolo de fotos e o cronômetro de descanso falham em SILÊNCIO — que é
  // exatamente o modo de falha que a bancada existe para não ter.
  const allow = palcoJs().match(/allow="([^"]+)"/);
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
    assert.ok(palcoJs().includes("'" + v + "'"), 'a bancada parou de escrever ' + v);
  });
  assert.match(palcoJs(), /aplicaSeguranca\(document,/, 'o aparelho escreve na abertura');
  assert.match(palcoJs(), /aplicaSeguranca\(el\.tela\.contentDocument/,
    'e a bancada reescreve ao trocar de aparelho, sem recarregar o iframe');
});

test('os aparelhos da prateleira são medidas de retrato, e plausíveis', () => {
  // `dpr: (\d)` era UM dígito. Um aparelho com `dpr: 2.75` — que existe — não
  // falhava: o casamento da LINHA INTEIRA falhava, a linha saía da tabela e o
  // caso passava verde sobre os outros três. Decimal lido errado aqui é
  // aparelho que ninguém verificou. Agora o número aceita ponto, e a contagem
  // de linhas lidas é comparada com a de aparelhos no fonte: nenhuma linha
  // pode sair da tabela em silêncio.
  const N = '([\\d.]+)';
  const LINHA = new RegExp(['w', 'h', 'dpr', 'raio', 'rc', 'mx', 'my', 'sat', 'sab']
    .map(k => k + ': ' + N).join(', '), 'g');
  const tabela = [...palcoJs().matchAll(LINHA)].map(m => m.slice(1).map(Number));
  const aparelhos = (palcoJs().match(/(?:^|[\s{,])dpr:\s*[\d.]+/g) || []).length;
  assert.ok(tabela.length >= 3, 'a prateleira encolheu demais');
  assert.strictEqual(tabela.length, aparelhos,
    'aparelho na prateleira que a tabela não conseguiu ler: ' + aparelhos +
    ' no fonte, ' + tabela.length + ' lidos — um deles sairia da verificação calado');
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

test('nada entre a folha e a janela cria bloco de contenção', () => {
  // A promessa que `src/ui/instrumento/folha.jsx` escreve e que não tinha
  // teste: a folha é `position: fixed` e sai da árvore visualmente de onde
  // estiver, DESDE QUE nenhum ancestral declare transform, filter,
  // perspective, backdrop-filter, will-change ou contain. Qualquer um deles
  // cria bloco de contenção e prende a folha dentro do pai — ela deixa de
  // cobrir a tela e passa a rolar com o conteúdo, sem erro nenhum.
  //
  // Os ancestrais são poucos e fixos: a folha mora no `#app`, dentro do body.
  // Por isso o teste é de FONTE e não de DOM: o defeito nasce de uma linha
  // nova em `html`, `body` ou `#app`, não da árvore.
  //
  // A árvore é a constante ANCESTRAL, compartilhada com 'nenhum ancestral do
  // sticky vira scroll container'. Os dois casos olhavam árvores diferentes, e
  // era por isso que `#app` ficava sem rede num dos dois.
  const PRESO = /(transform|filter|perspective|backdrop-filter|will-change|contain)\s*:/g;

  const culpadas: string[] = [];
  blocos(css()).forEach(b => {
    if (!b.sels.some(sel => ANCESTRAL.test(raizDe(sel)))) return;
    const achados = b.corpo.match(PRESO);
    if (achados) culpadas.push(b.sels.join(', ') + ' → ' + achados.join(' '));
  });

  assert.deepStrictEqual(culpadas, [],
    'ancestral da folha com bloco de contenção: a folha para de ser fixa');
});

test('todo controle tem anel de foco próprio, e o anel não encosta no botão', () => {
  // O contrato manda "foco sempre visível". O sistema anterior não tinha UMA
  // regra de `:focus-visible` para botão: todo botão dependia do anel padrão do
  // navegador, num canvas quase preto, onde ele tem menos chance de aparecer.
  // E nenhum caso dizia uma palavra sobre isso — então a ausência nunca ficou
  // vermelha. Este caso nasceu vermelho em 11/10, com os tokens de foco já
  // definidos e sem um único consumidor.
  //
  // Três coisas são cobradas, e a terceira é a que se perde primeiro:
  //
  // 1. a regra existe e alcança os quatro tipos de controle;
  // 2. a cor vem do TOKEN, não de um literal — senão o anel não segue o tema,
  //    e no escuro um anel escuro sobre fundo escuro é o mesmo que nenhum;
  // 3. há FOLGA entre o anel e o botão. Num botão preenchido de acento, um anel
  //    de acento encostado no preenchimento é invisível; com a folga, o que
  //    aparece entre os dois é a PÁGINA, e página contra acento mede 6,16:1 nos
  //    dois lados. Sem ela o anel desaparece justamente no botão mais
  //    importante da tela.
  const alvos = ['button', 'a', '[role="button"]', '[tabindex]'];

  const comAnel = blocos(fonte('src/base.css')).filter(b =>
    b.sels.some(s => /:focus-visible\s*$/.test(s.trim())) &&
    /outline:[^;]*var\(--ins-foco\)/.test(b.corpo) &&
    /outline-offset:[^;]*var\(--ins-foco-folga\)/.test(b.corpo));

  assert.ok(comAnel.length > 0,
    'nenhuma regra de `:focus-visible` em base.css desenha o anel com ' +
    '`var(--ins-foco)` E `var(--ins-foco-folga)` — sem os dois o anel não ' +
    'segue o tema ou desaparece no botão de acento');

  const semAnel = alvos.filter(a =>
    !comAnel.some(b => b.sels.some(s => s.trim().startsWith(a + ':focus-visible'))));
  assert.deepStrictEqual(semAnel, [],
    'controle que fica sem anel de foco próprio, dependendo do navegador');
});

test('controle menor que o alvo estende a área, ou está na lista de dívida', () => {
  // O padrão interno é 46px para controle repetido, e `--ins-tap-dense: 28px` é
  // DESENHO e não alvo: quem usa o degrau pequeno estende a ÁREA por `::after`
  // até 44 no mínimo. Seis controles fazem isso. **Onze não.**
  //
  // A auditoria de acesso mediu os HTML DESENHADOS, não o app — então esta
  // dívida nunca tinha sido medida aqui. Medida em 11/10: onze controles entre
  // 32 e 44px sem extensão de área.
  //
  // Eles não foram consertados às cegas de propósito, e a razão é que o
  // conserto errado é PIOR que o defeito: área estendida pode fazer controles
  // vizinhos roubarem o toque um do outro, e a adjacência não se vê no CSS —
  // vê-se na tela, que ninguém abriu ainda.
  //
  // Então a lista abaixo é dívida nomeada, e ela **só pode encolher**: um
  // controle pequeno NOVO sem extensão reprova na hora. Quando as telas forem
  // reescritas e alguém puder olhar a adjacência, os nomes saem daqui.
  const DIVIDA = ['#timer button', '.dlbtn', '.edbtn', '.edmod button', '.edx-b',
    '.edx-mv button', '.ins-faixa-b', '.ins-folha-b',
    '.progd-mv button', '.setant-b'];

  const todo = juntos(FOLHAS.map(f => 'src/' + f)).replace(/\/\*[\s\S]*?\*\//g, '');
  const pequenos: string[] = [];
  for (const b of blocos(todo)) {
    const alt = b.corpo.match(/(?:min-height|height)\s*:\s*([0-9.]+)px/);
    if (!alt) continue;
    const v = parseFloat(alt[1]);
    if (v >= 46 || v <= 20) continue;                  // alvo cheio, ou fio/barra
    for (const sel of b.sels) {
      const s = sel.trim();
      // `-b` no fim é o sufixo de botão deste CSS (`.ins-folha-b`,
      // `.setant-b`): sem ele a detecção fica mais estreita que a lista, e a
      // asserção de exatidão abaixo pega a discordância — foi como este caso
      // achou que o meu padrão original deixava quatro de fora.
      if (!/button|btn|tap|chip|toque|-b$/i.test(s)) continue;
      const base = s.split(':')[0];
      if (new RegExp(base.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&') +
                     '(?::[a-z-]+)?::after').test(todo)) continue;   // estende
      pequenos.push(s);
    }
  }
  const novos = [...new Set(pequenos)].filter(s => !DIVIDA.includes(s));
  assert.deepStrictEqual(novos, [],
    'controle abaixo do alvo e sem `::after` que estenda a área — e fora da ' +
    'lista de dívida: ou ele cresce, ou estende, ou entra na lista com a razão');

  const saiu = DIVIDA.filter(d => !pequenos.includes(d));
  assert.deepStrictEqual(saiu, [],
    'nome na lista de dívida que já não corresponde a um controle pequeno: ' +
    'se ele foi consertado, tire-o da lista — ela só serve se for exata');
});

test('reduzir movimento desliga animação por estrutura, não por nome', () => {
  // O portão existe e hoje funciona — mas por COINCIDÊNCIA: há exactly uma
  // animação no app (`ins-pulse`, no ponto ao vivo), e o bloco de
  // `prefers-reduced-motion` a desliga **pelo nome do seletor**. A próxima
  // animação que nascer em qualquer outro lugar não será desligada, e ninguém
  // vai notar: quem pede movimento reduzido não está aqui para reclamar.
  //
  // Então a regra é sobre a GRAMÁTICA do portão, não sobre a lista de hoje: ele
  // tem de alcançar por seletor universal. Transição já era assim; animação
  // não era.
  //
  // `animation-duration` quase zero com uma iteração, e não `animation: none`:
  // zerar a animação deixa o elemento no estado INICIAL, e uma animação com
  // `both` que termina visível ficaria invisível. Pular para o último quadro é
  // o que respeita a intenção de quem pediu menos movimento sem apagar
  // conteúdo.
  const todo = juntos(FOLHAS.map(f => 'src/' + f));

  const portoes = [...todo.matchAll(
    /@media[^{]*prefers-reduced-motion[^{]*\{([\s\S]*?)\n\}/g)].map(m => m[1]);
  assert.ok(portoes.length > 0, 'nenhum bloco de `prefers-reduced-motion`');

  // A REGRA do `*`, não o bloco: uma primeira versão deste caso perguntava se o
  // bloco tinha `*` em algum lugar E a palavra `animation` em outro, e passava
  // por acidente — havia `.ins-live-dot { animation: none }` ao lado de
  // `* { transition: none }`. Duas regras diferentes, nenhuma universal sobre
  // animação. O que se cobra é a regra universal declarando animação.
  const regraUniversal = portoes.flatMap(p =>
    [...p.matchAll(/([^{}]+)\{([^}]*)\}/g)]
      .filter(r => r[1].split(',').some(s => s.trim() === '*' ||
                                             /^\*::?[a-z-]+$/.test(s.trim())))
      .map(r => r[2]));

  assert.ok(regraUniversal.some(c => /animation/.test(c)),
    'o portão de movimento reduzido não desliga ANIMAÇÃO por seletor ' +
    'universal: desligar por nome funciona só para as animações que já ' +
    'existem, e a próxima nasce fora do portão');

  if (/@keyframes/.test(todo)) {
    assert.ok(regraUniversal.some(c => /animation[^;]*!important/.test(c)),
      'o portão alcança por `*` mas sem `!important`: a regra do componente ' +
      'é mais específica e ganha, então o movimento continua rodando');
  }
});

test('a paleta atende contraste nos dois temas, medido do que está na folha', () => {
  // A frente 4 mediu o contraste da paleta que ela DESENHOU. Nada garantia que
  // a paleta EMBARCADA atendesse, nem que continuasse atendendo quando alguém
  // encostasse numa cor — e encostar numa cor é a coisa mais fácil de fazer num
  // sistema de design.
  //
  // Os hexadecimais são lidos da FOLHA, não transcritos aqui: transcrever
  // faria este caso testar a minha transcrição em vez do produto.
  //
  // A medida é a da norma: luminância relativa linearizada, e o contraste é
  // `(claro + .05) / (escuro + .05)`.
  const tokens = fonte('src/tokens.css');

  function paletaDe(dentro: string): Record<string, string> {
    const p: Record<string, string> = {};
    for (const m of dentro.matchAll(/--(ins-[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
      if (!(m[1] in p)) p[m[1]] = m[2];
    }
    return p;
  }
  // o `:root` de abertura é o CLARO; o primeiro bloco de `prefers-color-scheme:
  // dark` é o ESCURO. A terceira cópia (`[data-theme="dark"]`) existe para a
  // troca manual e repete os mesmos valores — há caso próprio cobrando isso.
  const iEscuro = tokens.indexOf('prefers-color-scheme: dark');
  assert.ok(iEscuro > 0, 'não achei o bloco do tema escuro');
  const claro = paletaDe(tokens.slice(0, iEscuro));
  const escuro = paletaDe(tokens.slice(iEscuro));

  function lum(hex: string): number {
    const c = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255)
      .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a: string, b: string): number {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  // 4,5 para texto; 3,0 para o que é FORMA e não letra — fio de controle e anel
  // de foco, que a norma mede como componente de interface.
  const pares: [string, string, string, number][] = [
    ['ins-tinta', 'ins-tela', 'texto principal', 4.5],
    ['ins-tinta-2', 'ins-tela', 'prosa', 4.5],
    ['ins-tinta-3', 'ins-tela', 'texto de apoio', 4.5],
    ['ins-acento-tinta', 'ins-tela', 'acento como texto', 4.5],
    ['ins-sobre-acento', 'ins-acento', 'texto sobre acento', 4.5],
    ['ins-pare-tinta', 'ins-pare-fundo', 'o painel de pare', 4.5],
    ['ins-atencao-tinta', 'ins-atencao-fundo', 'o painel de atenção', 4.5],
    ['ins-fio-controle', 'ins-tela', 'fio de controle', 3.0],
    ['ins-foco', 'ins-tela', 'anel de foco', 3.0]
  ];

  const falhas: string[] = [];
  for (const [tema, pal] of [['claro', claro], ['escuro', escuro]] as const) {
    for (const [a, b, rotulo, minimo] of pares) {
      // `--ins-foco` aponta para o acento por `var()`, então resolve-se o apelido
      const hexA = pal[a] || pal[a === 'ins-foco' ? 'ins-acento' : a];
      const hexB = pal[b];
      assert.ok(hexA && hexB, 'token sem valor no tema ' + tema + ': ' + a + ' / ' + b);
      const v = contraste(hexA, hexB);
      if (v < minimo) falhas.push(
        tema + ' · ' + rotulo + ': ' + v.toFixed(2) + ':1, mínimo ' + minimo);
    }
  }
  assert.deepStrictEqual(falhas, [],
    'par de cores abaixo do contraste mínimo — e isto não se vê olhando: ' +
    'uma cor encostada em outra parece bem e mede mal');

  // E o mais apertado fica nomeado, porque é o que quebra primeiro: o fio de
  // controle no claro tem 3,26:1 contra um mínimo de 3,0 — 0,26 de folga.
  const fio = contraste(claro['ins-fio-controle'], claro['ins-tela']);
  assert.ok(fio >= 3.0 && fio < 3.6,
    'o fio de controle no claro saiu da faixa conhecida (' + fio.toFixed(2) +
    ':1). Se subiu, ótimo — atualize esta asserção. Se desceu abaixo de 3, ' +
    'a asserção de cima já pegou. Ela existe para que a folga de 0,26 não ' +
    'desapareça sem ninguém notar.');
});

test('a linha da lista rápida quebra, para o teclado próprio abrir embaixo dela', () => {
  // O jsdom não calcula layout, então nenhum caso de DOM vê isto. A linha é
  // flex: sem a quebra, o painel entrava como TERCEIRA coluna, espremido ao lado
  // do nome do movimento — e todos os casos de fluxo continuavam verdes.
  const t = fonte('src/treino.css');
  assert.match(regras(t, '.rapl'), /flex-wrap\s*:\s*wrap/,
    'a linha precisa quebrar para o teclado descer');
  assert.match(regras(t, '.rapl > .tcl'), /flex\s*:\s*1 0 100%/,
    'e o teclado ocupa a largura inteira, embaixo do nome e dos dois botões');
});

test('todo botão tem estilo de base, e não só o reset mais um modificador', () => {
  // Achado de 13/10, MEDIDO no Chromium a 414×896: a carga e a repetição da
  // série viraram botão (o teclado próprio e a régua), e nenhuma regra os
  // alcançava. O botão herdou só o reset de `button` e media **5 × 18 px**
  // vazio — o "·" e nada em volta — no controle de maior frequência do produto.
  //
  // A guarda de alvo de toque não podia ver: ela lê altura DECLARADA, e um
  // botão sem regra nenhuma não declara nada. E `.vazio` existe no CSS — mas
  // como `.rirbtn.vazio`, modificador colado em outra classe, que não estiliza
  // um `repbtn`. Então a pergunta é de princípio, sem lista: alguma classe do
  // botão aparece no CSS como seletor de BASE — no começo de um seletor ou
  // depois de um combinador?
  const seletores = (css().replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+(?=\{)/g) || []).join(' ');
  const deBase = (c: string) =>
    new RegExp('(^|[\\s,>+~(])\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(seletores);

  const arquivos: string[] = [path.join(RAIZ, 'src', 'main.jsx')];
  const anda = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p); else if (p.endsWith('.jsx')) arquivos.push(p);
  });
  anda(path.join(RAIZ, 'src', 'ui'));

  const semBase: string[] = [];
  for (const arq of arquivos) {
    const fonteJsx = fs.readFileSync(arq, 'utf8');
    for (const m of fonteJsx.matchAll(/<button\b([^>]*?)(?:>|\/>)/gs)) {
      const c = m[1].match(/class=(?:"([^"]*)"|\{([^}]*)\})/);
      if (!c) continue;
      const classes = c[2] != null
        ? [...c[2].matchAll(/['"`]\s*([a-zA-Z][\w -]*?)\s*['"`]/g)].flatMap(x => x[1].split(/\s+/))
        : c[1].split(/\s+/);
      if (classes.length && !classes.some(deBase)) {
        const linha = fonteJsx.slice(0, m.index).split('\n').length;
        semBase.push(path.relative(RAIZ, arq) + ':' + linha + ' ' + classes.join('.'));
      }
    }
  }
  assert.deepStrictEqual(semBase, [],
    'botão sem estilo de base: ele herda só o reset — sem altura, sem alvo, do ' +
    'tamanho do texto que carrega');
});

test('a carga e a repetição da série têm o alvo do RIR, e o fio reto', () => {
  // Os três números do conserto de 13/10, cada um com a razão: 40px de desenho
  // como o RIR vizinho; a área estendida só na VERTICAL, porque o vizinho
  // horizontal é outro valor da mesma série e crescer para o lado faria um
  // toque na borda abrir o editor errado; e raio zero, porque o estado aberto é
  // um fio embaixo, e com raio o fio sai curvo.
  const t = fonte('src/treino.css');
  const r = regras(t, '.repbtn');
  assert.match(r, /min-height\s*:\s*40px/, 'a célula inteira é alvo, com 40px de desenho');
  assert.match(r, /border-radius\s*:\s*0/, 'raio zero: o fio do estado aberto é reto');
  assert.match(t, /\.repbtn::after[^{]*\{[^}]*inset\s*:\s*-3px 0\s*;/,
    'a área cresce 3px para cima e para baixo, e zero para os lados');
});
