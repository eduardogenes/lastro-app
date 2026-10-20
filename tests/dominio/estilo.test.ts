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
import { ANCESTRAIS_DE_FIXO } from '../ancestrais-de-fixo.js';

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
 * body, e o modo de sessão no `.ins-modo` — e é por isso que dois casos podem
 * ser de FONTE em vez de DOM.
 *
 * UMA constante para os dois casos de ancestral de propósito. Eles olhavam
 * árvores diferentes: o do bloco de contenção via `html|body|:root|*|#app`, e o
 * do scroll container via só o `body`. Um `overflow: hidden` em `#app` matava o
 * `sticky` da única saída da sessão e nenhum dos 38 casos pegava.
 *
 * E a lista mora FORA deste arquivo (`tests/ancestrais-de-fixo.js`) porque uma
 * segunda metade, de DOM (`tests/fluxo/movimento.test.js`), confere na árvore
 * montada que ela é exata. Foi a falta dessa conferência que deixou o
 * `.ins-modo` de fora por um ano, com a faixa da pergunta morando dentro dele.
 */
const ANCESTRAL = new RegExp('^(' +
  ANCESTRAIS_DE_FIXO.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') +
  ')([.:[][^ >+~]*)?$');

/**
 * O seletor de um bloco, sem o pseudo-elemento, para casar com ANCESTRAL.
 * Com parênteses também: `html::view-transition-old(root)` passava inteiro.
 */
function raizDe(sel: string): string { return sel.replace(/::[a-z-]+(?:\([^)]*\))?$/, ''); }
/** O último composto de um seletor — quem a regra pinta —, sem o que mora entre parênteses. */
function sujeitoDe(sel: string): string {
  let prof = 0, colchete = false, ini = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === '(') prof++; else if (c === ')') prof--;
    else if (c === '[') colchete = true; else if (c === ']') colchete = false;
    else if (!prof && !colchete && /[\s>+~]/.test(c)) ini = i + 1;
  }
  return sel.slice(ini).replace(/\([^)]*\)/g, '');
}
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
  // `.ins-caixa` e `.ins-tick` saíram com a timeline e os copos antigos do
  // Agora (a D desenhou a comida em linhas e a água em linha).
  ['.ins-chip', '.crow-x', '.cardl-b', '.dd-diabtn',
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

test('no modo e na tela cheia, a reserva do rodapé perde a barra de abas mas guarda a área segura', () => {
  // `--ins-tabbar` é a RESERVA que o rodapé fixo precisa vencer — não a altura
  // da barra, que se mede sozinha (`tokens.css` diz isso literalmente). Quatro
  // consumidores ancoram nela: o fim da página, o toast, o cronômetro e a faixa
  // da sessão. No modo a barra não é desenhada, e sem o ajuste sobra a altura
  // dela de espaço morto no fim do treino.
  //
  // E a regra mora NA RAIZ. Até a peça 3 do motion ela era
  // `#app:has(.ins-modo)`, e custom property só desce pela árvore: o
  // cronômetro e o toast moram FORA do `#app` (irmãos dele no `body`,
  // `index.html`), herdavam a reserva cheia da raiz e flutuavam 52 px acima do
  // fundo no modo, com o treino aparecendo por baixo — enquanto o comentário da
  // regra dizia que ela alcançava os quatro. A metade de geometria (o fundo do
  // cronômetro na borda da tela, no motor de verdade) é `tests/fluxo/descanso.test.js`.
  const comp = fonte('src/componentes.css');
  const redefinem = blocos(comp).filter(b => /--ins-tabbar\s*:/.test(b.corpo));
  assert.strictEqual(redefinem.length, 1,
    'uma regra só redefine a reserva do rodapé: ' + redefinem.map(b => b.sels.join(', ')).join(' | '));
  const [modo] = redefinem;
  // No modo e na tela cheia (`.tc`, a moldura de todo destino), que são as duas
  // camadas que tiram a barra de abas da tela. A tela cheia entrou na peça 5: o
  // cronômetro continuava 52 px acima do fundo nos Ajustes e nos outros destinos.
  assert.deepStrictEqual([...new Set(modo.sels.map(s => (/:has\(\.(ins-modo|tc)\)/.exec(s) || [])[1]))].sort(), ['ins-modo', 'tc'],
    'a reserva muda no modo e na tela cheia, e só neles: ' + modo.sels.join(', '));
  assert.deepStrictEqual(modo.sels.filter(s => !/^(html|:root):has\(\.(ins-modo|tc)\)$/.test(s)), [],
    'a reserva do modo tem de ser escrita na raiz: escrita no #app (ou abaixo), ela não chega ao ' +
    'cronômetro nem ao toast, que são irmãos do #app');
  // e os dois moram mesmo fora do #app — o motivo da regra
  const corpo = indexHtml().replace(/<!--[\s\S]*?-->/g, '');
  const app = corpo.match(/<div id="app">[\s\S]*?<\/div>\s*<\/div>/);
  assert.ok(app, 'o #app de index.html mudou de forma: o caso tem de mudar junto');
  ['timer', 'toast'].forEach(id => {
    assert.ok(new RegExp('id="' + id + '"').test(corpo) && !new RegExp('id="' + id + '"').test(app![0]),
      '#' + id + ' entrou no #app: confira se a reserva ainda precisa morar na raiz');
  });
  const valor = modo.corpo.match(/--ins-tabbar:\s*([^;]+);/);
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

test('deitado no meio da sessão não é aviso: é a mesma tela em duas colunas', () => {
  // A D, momento 1, estado 14: o iOS não trava a orientação de app web (F60), e
  // o telefone vira sozinho no banco. Fora do modo o aviso continua; dentro
  // dele, o aviso sai e o cartão aberto vira leitura | polegar. Na MESMA
  // condição do aviso, senão a janela de computador viraria duas colunas.
  const c = css();
  const blocos = [...c.matchAll(/@media\s*\(orientation:\s*landscape\)\s*and\s*\(max-height:\s*(\d+)px\)\s*\{/g)];
  const doModo = blocos.map(m => c.slice(m.index!, m.index! + 2000)).find(t => /\.ins-modo/.test(t));
  assert.ok(doModo, 'o bloco deitado do modo existe');
  assert.match(doModo!, /html:has\(\.ins-modo\)\s*#deitado\s*\{\s*display:\s*none/, 'o aviso sai no modo');
  assert.match(doModo!, /\.sets-ler\s*\{\s*grid-column:\s*1/);
  assert.match(doModo!, /\.sets-polegar\s*\{\s*grid-column:\s*2/);
  const alturas = blocos.map(m => m[1]);
  assert.strictEqual(new Set(alturas).size, 1, 'o aviso e as duas colunas valem na mesma altura: ' + alturas);
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


// ============================================================
// O MOVIMENTO
//
// A doutrina mudou em 16/10 (princípio 6 de `tokens.css`, DESIGN.md
// §Movimento): de "quase nenhum movimento" para "movimento explica, e só
// explica". Mais movimento quer dizer mais lugar para o defeito que nenhum
// teste de DOM vê, porque o jsdom não anima nada: o tempo escrito fora dos
// tokens, a animação que roda para quem pediu menos, o `left` que refaz o
// layout a cada quadro, o `transform` que arranca a folha da janela, o ouvinte
// do fim de uma animação que nunca chega. Os cinco casos abaixo, (a) a (e),
// são de FONTE, como os de cor, e leem as folhas regra a regra COM a pilha de
// `@media` de cada uma — o `blocos()` de cima joga o prelúdio fora e por isso
// não sabe se uma regra está no portão.
//
// Cada caso foi visto VERMELHO plantando a violação numa cópia e desfazendo
// (docs/motion/09-implementacao.md, peça 0).
// ============================================================

type Decl = { prop: string; valor: string };
type Regra = { arquivo: string; linha: number; sels: string[]; decls: Decl[]; midias: string[] };
type Quadro = { pos: number[]; decls: Decl[] };
type Quadros = { nome: string; arquivo: string; linha: number; quadros: Quadro[] };
type Lida = { arquivo: string; regras: Regra[]; quadros: Quadros[] };

/** Comentário vira espaço, e a quebra de linha fica: o número da linha não muda. */
function semComentariosCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
}

/** Parte em `sep` só no nível de fora — nem dentro de parênteses, nem de aspas. */
function partesNoTopo(txt: string, sep: string): string[] {
  const out: string[] = [];
  let prof = 0, aspas = '', ini = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) { if (c === aspas) aspas = ''; continue; }
    if (c === '"' || c === "'") aspas = c;
    else if (c === '(') prof++;
    else if (c === ')') prof--;
    else if (c === sep && prof === 0) { out.push(txt.slice(ini, i)); ini = i + 1; }
  }
  out.push(txt.slice(ini));
  return out;
}

/** As declarações de um corpo. O `!important` sai do valor: ele não muda o que se move. */
function declaracoes(corpo: string): Decl[] {
  return partesNoTopo(corpo, ';').map(p => {
    const i = p.indexOf(':');
    return i < 0 ? null : {
      prop: p.slice(0, i).trim().toLowerCase(),
      valor: p.slice(i + 1).replace(/\s*!important\s*$/i, '').trim()
    };
  }).filter((d): d is Decl => !!d && !!d.prop);
}

/** O índice da chave que fecha a que abre em `i`. */
function fechamento(txt: string, i: number): number {
  let prof = 0;
  for (let j = i; j < txt.length; j++) {
    if (txt[j] === '{') prof++;
    else if (txt[j] === '}' && --prof === 0) return j;
  }
  return txt.length;
}

/**
 * Uma folha lida regra a regra: cada regra com o arquivo, a linha, a lista de
 * seletores, as declarações e a PILHA de `@media`/`@supports` em volta dela; e
 * os `@keyframes`, quadro a quadro. É o que os casos de movimento precisam e o
 * `blocos()` não dá: ele joga o prelúdio fora.
 */
function lida(arquivo: string): Lida {
  const css = semComentariosCss(fonte('src/' + arquivo));
  const linhaDe = (pos: number) => css.slice(0, pos).split('\n').length;
  const regras: Regra[] = [];
  const quadros: Quadros[] = [];
  const pilha: string[] = [];
  let i = 0, ini = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '{') {
      const prelude = css.slice(ini, i).trim().replace(/\s+/g, ' ');
      if (/^@(-webkit-)?keyframes\b/.test(prelude)) {
        const fim = fechamento(css, i);
        const corpo = css.slice(i + 1, fim);
        quadros.push({
          nome: prelude.replace(/^@(-webkit-)?keyframes\s+/, '').trim(), arquivo, linha: linhaDe(i),
          quadros: [...corpo.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(m => ({
            pos: m[1].split(',').map(x => x.trim())
              .map(x => x === 'from' ? 0 : x === 'to' ? 100 : parseFloat(x)),
            decls: declaracoes(m[2])
          }))
        });
        i = fim + 1; ini = i; continue;
      }
      if (prelude.startsWith('@')) { pilha.push(prelude); i++; ini = i; continue; }
      const fim = css.indexOf('}', i);
      regras.push({
        arquivo, linha: linhaDe(i),
        sels: prelude.split(',').map(x => x.trim()).filter(Boolean),
        decls: declaracoes(css.slice(i + 1, fim)), midias: pilha.slice()
      });
      i = fim + 1; ini = i; continue;
    }
    if (c === '}') { pilha.pop(); ini = i + 1; }
    else if (c === ';') ini = i + 1;
    i++;
  }
  return { arquivo, regras, quadros };
}

const folhasDoApp = () => FOLHAS.map(lida);
const todasAsFolhas = () => FOLHAS.concat(FOLHA_BANCADA).map(lida);

/** O bloco de tokens da bancada é o `tokens.css` DELA. */
const ehTokens = (r: Regra) =>
  r.arquivo === 'tokens.css' || (r.arquivo === FOLHA_BANCADA && r.sels.length === 1 && r.sels[0] === ':root');

const ehMovimento = (prop: string) => /^(transition|animation)(-[a-z-]+)?$/.test(prop);
const ehNada = (valor: string) => /^none$/i.test(valor.trim());
const NO_PORTAO = (r: Regra) => r.midias.some(m => /prefers-reduced-motion\s*:\s*no-preference/.test(m));
const NO_REDUZ = (r: Regra) => r.midias.some(m => /prefers-reduced-motion\s*:\s*reduce/.test(m));

const TEMPO_SOLTO = /(?<![\w.-])\d*\.?\d+m?s(?![\w-])/;
const CURVA_FUNCAO = /(?<![\w-])(cubic-bezier|steps|linear)\(/;
const CURVA_PALAVRA = /(?<![\w-])(ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end)(?![\w(-])/;
const PALAVRAS_DE_ANIMACAO = new Set(['none', 'infinite', 'both', 'forwards', 'backwards', 'normal',
  'reverse', 'alternate', 'alternate-reverse', 'running', 'paused', 'ease', 'ease-in', 'ease-out',
  'ease-in-out', 'linear', 'step-start', 'step-end']);
const SE_MOVE = ['transform', 'translate', 'scale', 'opacity'];

const onde = (r: Regra, d: Decl) => r.arquivo + ':' + r.linha + ' ' + r.sels.join(', ') + ' → ' + d.prop + ': ' + d.valor;

/** Os `@keyframes` de todas as folhas, pelo nome. */
function quadrosPorNome(folhas: Lida[]): Map<string, Quadros[]> {
  const m = new Map<string, Quadros[]>();
  folhas.forEach(f => f.quadros.forEach(q => m.set(q.nome, (m.get(q.nome) || []).concat(q))));
  return m;
}

/** O nome da animação num item de `animation`: o identificador que não é palavra-chave. */
function nomeDaAnimacao(item: string): string | null {
  const toks = partesNoTopo(item.trim(), ' ').map(t => t.trim()).filter(Boolean);
  return toks.find(t => /^-?[a-z_][\w-]*$/i.test(t) && !PALAVRAS_DE_ANIMACAO.has(t.toLowerCase())) || null;
}

/** O que um item de `transition` move. Sem propriedade nomeada é `all`, o padrão. */
function propDaTransicao(item: string): string {
  const toks = partesNoTopo(item.trim(), ' ').map(t => t.trim()).filter(Boolean);
  return toks.find(t => /^-?[a-z_][\w-]*$/i.test(t) && !PALAVRAS_DE_ANIMACAO.has(t.toLowerCase()) &&
    t !== 'allow-discrete') || 'all';
}

/** As propriedades que uma regra move, de `transition` e dos `@keyframes` de `animation`. */
function oQueMove(r: Regra, porNome: Map<string, Quadros[]>): string[] {
  const out: string[] = [];
  r.decls.forEach(d => {
    if (ehNada(d.valor)) return;
    if (d.prop === 'transition') partesNoTopo(d.valor, ',').forEach(it => out.push(propDaTransicao(it)));
    if (d.prop === 'transition-property') partesNoTopo(d.valor, ',').forEach(p => out.push(p.trim()));
    const nomes = d.prop === 'animation' ? partesNoTopo(d.valor, ',').map(nomeDaAnimacao)
      : d.prop === 'animation-name' ? partesNoTopo(d.valor, ',').map(x => x.trim()) : [];
    nomes.forEach(n => (n && porNome.get(n) || []).forEach(q => q.quadros.forEach(f =>
      f.decls.forEach(fd => { if (fd.prop !== 'animation-timing-function') out.push(fd.prop); }))));
  });
  return [...new Set(out)];
}

/**
 * Os números de um valor de movimento, por componente, para comparar quadros:
 * `translateY(-8%)` → `ty: -8 %`; `none` → identidade. Componente que não se lê
 * (um `var()`, um `calc()`) fica de fora, e quem compara pula.
 */
type Num = { n: number; u: string };
function componentes(prop: string, valor: string): Map<string, Num> | null {
  const m = new Map<string, Num>();
  const v = valor.trim();
  const num = (x: string): Num | null => {
    const r = /^(-?\d*\.?\d+)([a-z%]*)$/i.exec(x.trim());
    return r ? { n: Number(r[1]), u: r[2] } : null;
  };
  const poe = (k: string, x: string) => { const n = num(x); if (n) m.set(k, n); };
  if (prop === 'opacity') { const n = num(v); return n ? new Map([['o', n]]) : null; }
  if (v === 'none') return m;
  if (prop === 'translate') { const p = v.split(/\s+/); poe('tx', p[0]); if (p[1]) poe('ty', p[1]); return m; }
  if (prop === 'scale') { const p = v.split(/\s+/); poe('sx', p[0]); poe('sy', p[1] || p[0]); return m; }
  if (prop === 'rotate') { poe('r', v); return m; }
  if (prop !== 'transform') return null;
  for (const f of v.matchAll(/([a-zA-Z0-9]+)\(([^()]*)\)/g)) {
    const a = f[2].split(/\s*,\s*|\s+/).filter(Boolean);
    const nome = f[1];
    if (nome === 'translateX') poe('tx', a[0]);
    else if (nome === 'translateY') poe('ty', a[0]);
    else if (nome === 'translate' || nome === 'translate3d') { poe('tx', a[0]); if (a[1]) poe('ty', a[1]); }
    else if (nome === 'scale') { poe('sx', a[0]); poe('sy', a[1] || a[0]); }
    else if (nome === 'scaleX') poe('sx', a[0]);
    else if (nome === 'scaleY') poe('sy', a[0]);
    else if (nome === 'rotate') poe('r', a[0]);
  }
  return m;
}
/** O valor de repouso de cada componente: o que `none` quer dizer. */
const IDENTIDADE: Record<string, number> = { tx: 0, ty: 0, sx: 1, sy: 1, r: 0, o: 1 };

/** Dois valores da mesma propriedade, comparados por componente. */
function mesmoValor(prop: string, a: string, b: string): boolean {
  const ca = componentes(prop, a), cb = componentes(prop, b);
  if (!ca || !cb) return a.replace(/\s+/g, '') === b.replace(/\s+/g, '');
  const chaves = new Set([...ca.keys(), ...cb.keys()]);
  for (const k of chaves) {
    const x = ca.get(k), y = cb.get(k);
    const nx = x ? x.n : IDENTIDADE[k], ny = y ? y.n : IDENTIDADE[k];
    if (Math.abs(nx - ny) > 1e-6) return false;
  }
  return true;
}

/**
 * Os quadros que passam do destino. Para cada componente, com o começo (0%) e o
 * fim (100%) diferentes, um quadro do meio fora do intervalo entre os dois é
 * ultrapassagem — ou antecipação, que é a mesma mola do outro lado. Ciclo (o
 * pulso: começa e termina no mesmo valor) não tem destino e não entra.
 */
function ultrapassa(q: Quadros): string[] {
  const out: string[] = [];
  const linha: { pos: number; decls: Decl[] }[] = [];
  q.quadros.forEach(f => f.pos.forEach(p => linha.push({ pos: p, decls: f.decls })));
  linha.sort((x, y) => x.pos - y.pos);
  const props = new Set(linha.flatMap(f => f.decls.map(d => d.prop)).filter(p => SE_MOVE.concat('rotate').includes(p)));
  props.forEach(prop => {
    const serie = linha.map(f => {
      const d = f.decls.filter(x => x.prop === prop).pop();
      return d ? { pos: f.pos, c: componentes(prop, d.valor) } : null;
    }).filter((x): x is { pos: number; c: Map<string, Num> } => !!x && !!x.c);
    const ini = serie.find(s => s.pos === 0), fim = serie.find(s => s.pos === 100);
    if (!ini || !fim) return;
    const chaves = new Set(serie.flatMap(s => [...s.c.keys()]));
    chaves.forEach(k => {
      const val = (s: { c: Map<string, Num> }) => { const x = s.c.get(k); return x ? x.n : IDENTIDADE[k]; };
      const a = val(ini), b = val(fim);
      if (Math.abs(a - b) < 1e-9) return;
      serie.filter(s => s.pos > 0 && s.pos < 100).forEach(s => {
        const v = val(s);
        if (v < Math.min(a, b) - 1e-9 || v > Math.max(a, b) + 1e-9) {
          out.push(q.arquivo + ':' + q.linha + ' @keyframes ' + q.nome + ' ' + s.pos + '% ' + prop + ' (' + k + ' ' + v + ', entre ' + a + ' e ' + b + ')');
        }
      });
    });
  });
  return out;
}

// ---------- o JavaScript ----------

/**
 * Comentário de JS vira espaço. Só o que COMEÇA comentário de verdade: `/*` e
 * `//` no começo da linha ou depois de espaço, `{`, `;`, `(`, `)` e `,`. Um
 * `accept="image/*"` ou um `https://` dentro de aspas não abrem nada — e um
 * tokenizador inteiro de JSX seria o tipo de heurística que esconde defeito.
 */
function semComentariosJs(js: string): string {
  const branco = (m: string) => m.replace(/[^\n]/g, ' ');
  return js
    .replace(/(^|[\s{;(),])\/\*[\s\S]*?\*\//g, (m, a) => a + branco(m.slice(a.length)))
    .replace(/(^|[\s{;(),])\/\/[^\n]*/gm, (m, a) => a + branco(m.slice(a.length)))
    .replace(/<!--[\s\S]*?-->/g, branco);
}

/** Todo JavaScript do app — `src/**` e o `index.html` —, lido pelo registro. */
function arquivosJs(): string[] {
  const achados = (fs.readdirSync(path.join(RAIZ, 'src'), { recursive: true }) as string[])
    .map(f => String(f).split(path.sep).join('/'))
    .filter(f => /\.(js|jsx|ts|tsx|mjs)$/.test(f))
    .map(f => 'src/' + f);
  assert.ok(achados.length > 20, 'o andador de src/ achou só ' + achados.length + ' arquivos de JS');
  return achados.concat('index.html');
}

/** Cada ocorrência de `re` no código (sem comentários), com arquivo e linha. */
function noCodigo(rels: string[], re: RegExp): string[] {
  const out: string[] = [];
  rels.forEach(rel => {
    const js = semComentariosJs(fonte(rel));
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of js.matchAll(g)) {
      out.push(rel + ':' + js.slice(0, m.index).split('\n').length + ' ' + m[0].trim());
    }
  });
  return out;
}

/** A PORTA do movimento: o único módulo que pode perguntar ao aparelho e mover por JS. */
const PORTA = 'src/ui/movimento.js';

/**
 * A ESPERA DA ABERTURA (peça 8): a frase "Abrindo o registro…" só aparece se a
 * abertura demorar, de uma vez, e igual sob "Reduzir movimento". É a única
 * declaração de `animation-*` fora do portão, e não é movimento — duração zero,
 * o atraso e mais nada —; a (b) a deixa passar SÓ nesta forma exata, e o caso
 * (k) cobra a forma inteira (os quadros, o token, que nada mais a mova).
 */
const ESPERA_DA_ABERTURA = '#app > .msg';
const DECL_DA_ESPERA: Record<string, string> = {
  'animation-name': 'ins-espera', 'animation-delay': 'var(--ins-espera-abertura)', 'animation-fill-mode': 'backwards'
};
const ehEsperaDaAbertura = (r: Regra, d: Decl) => !r.midias.length && r.sels.length === 1 &&
  r.sels[0] === ESPERA_DA_ABERTURA && DECL_DA_ESPERA[d.prop] === d.valor;

test('a lista de folhas é a do disco, nos dois sentidos', () => {
  // O comentário de FOLHAS prometia este caso desde a passada dos tokens, e ele
  // não existia: uma folha nova — um `movimento.css`, por exemplo — passaria
  // por fora de toda guarda de cor, de espaço e de movimento sem ficar vermelha
  // em lugar nenhum. A lista declarada reprova a folha que SUMIU (pelo
  // `fonte()`); este caso reprova também a NOVA que ninguém declarou.
  const noDisco = (fs.readdirSync(path.join(RAIZ, 'src'), { recursive: true }) as string[])
    .map(f => String(f).split(path.sep).join('/'))
    .filter(f => f.endsWith('.css')).sort();
  const declaradas = FOLHAS.concat(FOLHA_BANCADA).sort();
  assert.deepStrictEqual(noDisco.filter(f => !declaradas.includes(f)), [],
    'folha em src/ que nenhuma guarda lê: declare-a em FOLHAS (ou, se for da bancada, ' +
    'ao lado de FOLHA_BANCADA)');
  assert.deepStrictEqual(declaradas.filter(f => !noDisco.includes(f)), [],
    'folha declarada que não está mais em src/: tire-a da lista junto');
});

test('(a) duração e curva só nascem nos tokens, e ultrapassagem só no quique', () => {
  // Duração nasce NOMEADA PELO PAPEL, como cor. Antes de 16/10 havia seis
  // durações soltas no app (250 ms da barra, 2,4 s do pulso, 320 ms do clarão e
  // as três da bancada) e uma curva por omissão (o pulso rodava no `ease` do
  // navegador sem ninguém ter escrito isso). Mudar "o tempo do app" era caçar
  // números; agora é um bloco de `tokens.css`.
  const folhas = todasAsFolhas();
  const soltos: string[] = [];
  const DUR = (r: Regra) => r.arquivo === FOLHA_BANCADA ? /var\(--pl-dur-/ : /var\(--ins-(dur|ciclo)-/;
  const CURVA = (r: Regra) => r.arquivo === FOLHA_BANCADA ? /var\(--pl-curva/ : /var\(--ins-curva/;
  const TEMPO_OU_CURVA = /^(transition|transition-duration|transition-delay|transition-timing-function|animation|animation-duration|animation-delay|animation-timing-function)$/;

  folhas.forEach(f => {
    f.regras.forEach(r => {
      if (ehTokens(r)) return;
      r.decls.forEach(d => {
        // uma segunda fonte de tempo ou curva, com nome: também não
        if (d.prop.startsWith('--') &&
            (TEMPO_SOLTO.test(d.valor) || CURVA_FUNCAO.test(d.valor) || CURVA_PALAVRA.test(d.valor))) {
          soltos.push(onde(r, d) + ' (custom property de tempo ou curva fora dos tokens)');
        }
        if (!TEMPO_OU_CURVA.test(d.prop) || ehNada(d.valor)) return;
        if (TEMPO_SOLTO.test(d.valor) || CURVA_FUNCAO.test(d.valor) || CURVA_PALAVRA.test(d.valor)) {
          soltos.push(onde(r, d));
        } else if ((d.prop === 'transition' || d.prop === 'animation') &&
                   partesNoTopo(d.valor, ',').some(it => !DUR(r).test(it) || !CURVA(r).test(it))) {
          // sem a curva escrita, o navegador usa `ease` por omissão — a curva entra
          // solta sem estar escrita, que foi o caso do pulso
          soltos.push(onde(r, d) + ' (cada item precisa do token de tempo E do de curva)');
        }
      });
    });
    // dentro dos @keyframes, a curva de cada trecho: fora dos tokens, só por token
    if (f.arquivo !== 'tokens.css') f.quadros.forEach(q => q.quadros.forEach(fr => fr.decls.forEach(d => {
      if (d.prop === 'animation-timing-function' && !/^var\(--(ins|pl)-curva/.test(d.valor)) {
        soltos.push(f.arquivo + ':' + q.linha + ' @keyframes ' + q.nome + ' → ' + d.prop + ': ' + d.valor);
      }
    })));
  });
  assert.deepStrictEqual(soltos, [],
    'duração ou curva fora de tokens.css. Duração nasce nomeada pelo papel, como cor: use um ' +
    'dos tokens do bloco Movimento, ou dê um nome novo lá, com o que é, quando usar e quando não.');

  // Nos tokens: nenhuma curva quica. Ponto de controle fora de [0, 1] é mola, e a
  // mola só existe no quique, que mora em quadros e não em curva.
  const tokens = semComentariosCss(fonte('src/tokens.css'));
  const raizBancada = (semComentariosCss(palcoCss()).match(/:root\s*\{[^}]*\}/) || [''])[0];
  const molas: string[] = [];
  [['tokens.css', tokens], [FOLHA_BANCADA + ' :root', raizBancada]].forEach(([nome, txt]) => {
    for (const m of txt.matchAll(/cubic-bezier\(([^)]*)\)/g)) {
      const [x1, y1, x2, y2] = m[1].split(',').map(Number);
      if ([x1, y1, x2, y2].some(n => !(n >= 0 && n <= 1))) molas.push(nome + ': ' + m[0]);
    }
    if (/(?<![\w-])steps\(/.test(txt)) molas.push(nome + ': steps()');
    // `linear()` com pontos é como se escreve mola em CSS: só no token do quique
    for (const m of txt.matchAll(/(--[\w-]+)\s*:\s*[^;]*?linear\(([^)]*)\)/g)) {
      const saem = m[2].split(',').map(p => parseFloat(p)).filter(n => !(n >= 0 && n <= 1));
      if (saem.length && !/quique/.test(m[1])) molas.push(nome + ': ' + m[1] + ' (linear() passa de [0, 1])');
    }
  });
  assert.deepStrictEqual(molas, [], 'a curva ultrapassa: um ponto fora de [0, 1] é mola, e a mola só mora no quique');

  // Quadro que passa do destino: só os do quique, e o quique é UM, nos tokens —
  // um `@keyframes` de mesmo nome numa folha de depois venceria em silêncio.
  const QUIQUE = 'ins-quique';
  const porNome = quadrosPorNome(folhas);
  const passam = folhas.flatMap(f => f.quadros).filter(q => q.nome !== QUIQUE).flatMap(ultrapassa);
  assert.deepStrictEqual(passam, [],
    'quadro que passa do destino fora do quique: a camada chega e PARA, e quicar é só a chegada ' +
    'da folha e do painel de apagar (dono, 16/10)');
  const quiques = porNome.get(QUIQUE) || [];
  assert.deepStrictEqual(quiques.map(q => q.arquivo), ['tokens.css'],
    'o quique é um só e mora nos tokens: ' + quiques.map(q => q.arquivo).join(', '));
  assert.ok(ultrapassa(quiques[0]).length > 0,
    'o quique deixou de passar do destino: ou ele mudou de forma, ou esta guarda deixou de ler quadros');
  // e o tempo do quique e os quadros dele andam juntos, nos dois sentidos
  const casados: string[] = [];
  folhas.forEach(f => f.regras.forEach(r => r.decls.forEach(d => {
    if (d.prop !== 'animation') return;
    partesNoTopo(d.valor, ',').forEach(it => {
      if ((nomeDaAnimacao(it) === QUIQUE) !== /var\(--ins-dur-quique\)/.test(it)) casados.push(onde(r, d));
    });
  })));
  assert.deepStrictEqual(casados, [], 'o quique roda no tempo do quique, e o tempo do quique só no quique');

  // O período da barra e o do `setInterval` que a repinta são o MESMO número:
  // menos deixa vão parado, mais atrasa a barra em relação ao número.
  const amostra = /--ins-dur-amostra\s*:\s*(\d+)ms/.exec(tokens);
  assert.ok(amostra, '--ins-dur-amostra sumiu dos tokens, ou deixou de estar em ms');
  const periodos = [...mainJsx().matchAll(/setInterval\(\s*pintaTimer\s*,\s*([^)]+)\)/g)].map(m => m[1].trim());
  assert.ok(periodos.length > 0, 'nenhum setInterval(pintaTimer, …): a guarda perdeu o cronômetro de vista');
  assert.deepStrictEqual(periodos.filter(p => p !== amostra![1]), [],
    'o cronômetro repinta num período diferente de --ins-dur-amostra (' + amostra![1] + 'ms)');
});

test('(b) reduzir movimento falha fechado: todo movimento mora no portão por adesão, e fora dele o elemento está no último quadro', () => {
  // Este caso substitui o que EXIGIA o bloco universal de `base.css` (`*` com
  // `!important`, `.01ms`, uma volta). O universal saiu em 16/10 por quatro
  // motivos: engolia o evento de fim de transição (medido), não alcançava o
  // JavaScript nem os pseudo-elementos de transição de vista, proibia o
  // esmaecer que o dono escolheu para "Reduzir movimento", e convivia com o
  // princípio 6 de `tokens.css`, que já dizia "adesão" (docs/motion/06 §4.3).
  //
  // As três coisas que o caso antigo protegia ficam, e mais fortes:
  //  - ESTRUTURA, NÃO NOME: cada declaração de movimento de cada folha, de
  //    qualquer seletor, tem de estar dentro do portão — a próxima animação
  //    nasce lá ou fica vermelha;
  //  - O ÚLTIMO QUADRO, NÃO O PRIMEIRO: o `.01ms` existia para uma animação com
  //    `both` não deixar conteúdo invisível. Sob adesão, o risco é o elemento
  //    FORA do portão estar no primeiro quadro, e isso agora é conferido
  //    propriedade a propriedade;
  //  - A REGRA, NÃO PALAVRAS NO BLOCO: declaração por declaração, com o `@media`
  //    dela, e não "o bloco tem `*` em algum lugar e `animation` em outro".
  const folhas = todasAsFolhas();
  const porNome = quadrosPorNome(folhas);
  const fora: string[] = [];
  const animaNoPortao = new Set<string>();
  const animaNoReduz = new Set<string>();

  folhas.forEach(f => f.regras.forEach(r => r.decls.forEach(d => {
    if (d.prop === 'scroll-behavior' && d.valor.trim() !== 'auto') fora.push(onde(r, d) + ' (rolagem é sempre um salto)');
    if (!ehMovimento(d.prop) || ehNada(d.valor)) return;
    // o atraso da frase da abertura não é movimento, e vale com e sem a preferência (caso (k))
    if (ehEsperaDaAbertura(r, d)) return;
    if (NO_PORTAO(r)) { r.sels.forEach(s => animaNoPortao.add(s)); return; }
    if (NO_REDUZ(r)) {
      // a alternativa deliberada sob "Reduzir movimento": só esmaecer, só no tempo dele
      const soEsmaece = (d.prop === 'transition' || d.prop === 'animation') &&
        partesNoTopo(d.valor, ',').every(it => /var\(--ins-dur-dissolve\)/.test(it)) &&
        oQueMove({ ...r, decls: [d] }, porNome).every(p => p === 'opacity');
      if (soEsmaece) { r.sels.forEach(s => animaNoReduz.add(s)); return; }
    }
    fora.push(onde(r, d));
  })));
  assert.deepStrictEqual(fora, [],
    'movimento fora do portão. Ponha a regra dentro de @media (prefers-reduced-motion: ' +
    'no-preference); fora dele fica só o estado final. Sob reduce, só esmaecer, com --ins-dur-dissolve.');

  // Sob reduce nunca há MAIS movimento do que sem a preferência.
  //
  // A tela cheia e o modo que CHEGAM (peça 5) são a exceção de forma, e não de
  // regra: sem a preferência eles se movem pela transição de vista — a foto
  // `root` da tela nova, no mesmo `data-nav` —, e não por regra no próprio nó;
  // sob reduce, a porta não pede a transição e o nó que nasce esmaece. Conta
  // como movimento no portão quando a foto daquele sentido anima lá.
  //
  // A aba (peça 6) é a mesma forma: sem a preferência a página desliza pela foto
  // `root` de `aba-direita`/`aba-esquerda`; sob reduce, o `<main>` que nasce com
  // a aba (e o cabeçalho do Agora) esmaece.
  const pelaFoto = (sel: string) => {
    const m = /^(html\[data-nav="[a-z-]+"\])\s+([.#][\w-]+|main)$/.exec(sel);
    return !!m && animaNoPortao.has(m[1] + '::view-transition-new(root)');
  };
  assert.ok(pelaFoto('html[data-nav="entra"] .tc') || ![...animaNoReduz].includes('html[data-nav="entra"] .tc'),
    'a leitura da chegada pela foto mudou: o caso tem de mudar junto');
  assert.ok(pelaFoto('html[data-nav="aba-direita"] main') || ![...animaNoReduz].includes('html[data-nav="aba-direita"] main'),
    'a leitura da chegada da aba pela foto mudou: o caso tem de mudar junto');
  assert.deepStrictEqual([...animaNoReduz].filter(s => !animaNoPortao.has(s) && !pelaFoto(s)), [],
    'esmaece sob reduce e fica parado sem a preferência: quem pediu menos teria mais');

  // As FOTOS da transição de vista: fora do portão, nenhuma animação (06 §4.4).
  // Sem isto, uma transição começada por qualquer caminho rodaria o cruzamento
  // padrão do navegador — que anima largura e altura do grupo — para quem pediu
  // menos movimento.
  const FOTOS = ['::view-transition-group(*)', '::view-transition-image-pair(*)', '::view-transition-old(*)', '::view-transition-new(*)'];
  const paradas = folhas.flatMap(f => f.regras).filter(r => !NO_PORTAO(r) && !NO_REDUZ(r) &&
    r.decls.some(d => d.prop === 'animation' && ehNada(d.valor))).flatMap(r => r.sels);
  assert.deepStrictEqual(FOTOS.filter(f => !paradas.includes(f)), [],
    'fora do portão, as fotos da transição de vista sem animação: `' + FOTOS.join(', ') + ' { animation: none }`');

  // Fora do portão, o último quadro.
  const PADRAO: Record<string, string> = { opacity: '1', transform: 'none', translate: 'none', scale: 'none', rotate: 'none' };
  const foraDoPortao = folhas.flatMap(f => f.regras).filter(r => !NO_PORTAO(r) && !NO_REDUZ(r));
  const valorFora = (sel: string, prop: string) => {
    const ds = foraDoPortao.filter(r => r.sels.includes(sel)).flatMap(r => r.decls).filter(d => d.prop === prop);
    return ds.length ? ds[ds.length - 1].valor : PADRAO[prop];
  };
  const primeiroQuadro: string[] = [];
  // (o esmaecer sob reduce também: ele termina onde o elemento parado já está)
  //
  // As fotos da transição de vista (`::view-transition-*`) ficam de fora, e só
  // elas: elas não são estado de ninguém — existem durante a troca e somem com
  // ela —, o estado final é o DOM novo, e quem pediu menos movimento nunca as vê
  // (a porta não pede a transição; e fora do portão elas não animam, acima).
  folhas.forEach(f => f.regras.filter(r => NO_PORTAO(r) || NO_REDUZ(r)).forEach(r => r.decls.forEach(d => {
    if (r.sels.every(sel => /::view-transition/.test(sel))) return;
    const itens = d.prop === 'animation' ? partesNoTopo(d.valor, ',')
      : d.prop === 'animation-name' ? partesNoTopo(d.valor, ',') : [];
    itens.forEach(it => {
      const nome = d.prop === 'animation' ? nomeDaAnimacao(it) : it.trim();
      if (!nome || nome === 'none') return;
      const defs = porNome.get(nome);
      if (!defs) { primeiroQuadro.push(onde(r, d) + ' (não há @keyframes ' + nome + ')'); return; }
      const fim = /(?<![\w-])reverse(?![\w-])/.test(it) ? 0 : 100;
      const ultimo = new Map<string, string>();
      defs[defs.length - 1].quadros.filter(q => q.pos.includes(fim))
        .forEach(q => q.decls.forEach(qd => { if (qd.prop !== 'animation-timing-function') ultimo.set(qd.prop, qd.valor); }));
      r.sels.forEach(sel => ultimo.forEach((v, prop) => {
        const lado = valorFora(sel, prop);
        if (lado === undefined || !mesmoValor(prop, lado, v)) {
          primeiroQuadro.push(sel + ' fora do portão não está no último quadro de ' + nome +
            ' (' + prop + ': ' + lado + ' ≠ ' + v + ')');
        }
      }));
    });
  })));
  assert.deepStrictEqual(primeiroQuadro, [],
    'quem pediu menos movimento veria o elemento fora do resultado da animação — o primeiro ' +
    'quadro, ou nenhum. Escreva fora do portão o valor do último quadro.');

  // Movimento mora em FOLHA, onde esta guarda o vê — nunca em atributo `style`
  // nem escrito pelo JavaScript num elemento.
  const emLinha: string[] = [];
  arquivosJs().forEach(rel => {
    const js = semComentariosJs(fonte(rel));
    for (const m of js.matchAll(/\bstyle\s*=\s*/g)) {
      const ini = m.index! + m[0].length;
      const abre = js[ini];
      let fim = ini + 1;
      if (abre === '{') fim = fechamento(js, ini) + 1;
      else if (abre === '"' || abre === "'" || abre === '`') fim = js.indexOf(abre, ini + 1) + 1;
      const attr = js.slice(ini, fim);
      if (/(?<![\w-])(transition|animation)(-[a-z-]+)?\s*:/.test(attr)) {
        emLinha.push(rel + ':' + js.slice(0, ini).split('\n').length + ' style=' + attr.slice(0, 80));
      }
    }
  });
  emLinha.push(...noCodigo(arquivosJs(),
    /\.style\.(transition|animation)\w*\s*=|setProperty\(\s*['"`](transition|animation)/));
  assert.deepStrictEqual(emLinha, [],
    'movimento escrito no elemento, fora das folhas: aqui nenhuma guarda o vê, e nenhum portão o desliga');

  // E o JavaScript pergunta a UMA porta: só ela fala com o aparelho sobre
  // movimento e só ela move por JS. Sem ela a bancada lia a preferência uma vez,
  // ao montar, e continuava virando o aparelho para quem ligou a chave depois.
  // (`getAnimations` entrou na peça 4: segurar a camada sob o dedo é mexer
  // numa animação viva, e isso também é da porta.)
  const foraDaPorta = noCodigo(arquivosJs().filter(f => f !== PORTA),
    /matchMedia\([^)]*prefers-reduced-motion|startViewTransition|\.animate\s*\(|\.getAnimations\s*\(|requestAnimationFrame|['"`]smooth['"`]/);
  assert.deepStrictEqual(foraDaPorta, [],
    'movimento por JavaScript fora da porta (' + PORTA + '): pergunte a podeMover(), e mova por lá');
});

test('(b) a porta do movimento responde NÃO quando não sabe, e lê a preferência na hora', async () => {
  // Comportamento, não forma: o módulo importado aqui, em node, sem janela.
  const porta = await import('../../' + PORTA);
  const g = globalThis as Record<string, unknown>;
  const antes = { matchMedia: g.matchMedia, document: g.document, getComputedStyle: g.getComputedStyle };
  try {
    delete g.matchMedia;
    assert.strictEqual(porta.podeMover(), false, 'sem matchMedia (o jsdom dos fluxos): não move');
    assert.strictEqual(porta.podeDissolver(), false);
    assert.strictEqual(porta.tempo('--ins-dur-entra'), 0, 'e não espera nada');

    g.matchMedia = () => { throw new Error('quebrou'); };
    assert.strictEqual(porta.podeMover(), false, 'matchMedia que lança: não move');

    // a resposta muda entre duas perguntas: a segunda já sabe
    let pediuMenos = false;
    g.matchMedia = (q: string) => ({ matches: /no-preference/.test(q) ? !pediuMenos : /reduce/.test(q) && pediuMenos });
    const tokens: Record<string, string> = { '--ins-dur-entra': ' 350ms', '--ins-ciclo-vivo': '2.4s',
      '--ins-dur-dissolve': '120ms', '--torto': 'calc(1s)' };
    g.document = { documentElement: {} };
    g.getComputedStyle = () => ({ getPropertyValue: (n: string) => tokens[n] || '' });
    assert.strictEqual(porta.podeMover(), true);
    assert.strictEqual(porta.tempo('--ins-dur-entra'), 350, 'o tempo vem do token, lido agora');
    assert.strictEqual(porta.tempo('--ins-ciclo-vivo'), 2400, 'em segundos também');
    assert.strictEqual(porta.tempo('--torto'), 0, 'o que não se lê vira "não espere nada"');
    assert.strictEqual(porta.tempo('--nao-existe'), 0);
    tokens['--ins-dur-entra'] = '200ms';
    assert.strictEqual(porta.tempo('--ins-dur-entra'), 200, 'lido de novo a cada pergunta');

    pediuMenos = true;
    assert.strictEqual(porta.podeMover(), false, 'ligou "Reduzir movimento" com o app aberto: a próxima pergunta já sabe');
    assert.strictEqual(porta.podeDissolver(), true);
    assert.strictEqual(porta.tempo('--ins-dur-entra'), 0, 'sob a preferência, nenhuma camada desliza');
    assert.strictEqual(porta.tempo('--ins-dur-dissolve'), 120, 'só o esmaecer vale');
  } finally {
    (['matchMedia', 'document', 'getComputedStyle'] as const).forEach(k => {
      if (antes[k] === undefined) delete g[k]; else g[k] = antes[k];
    });
  }
});

test('(c) só transform, translate, scale e opacity se movem', () => {
  // `left` parou 320 ms com a thread presa e saltou 90 px; `transform` não parou
  // nenhum quadro (docs/motion/04 §1.6). O fio da aba andava em `left` — 14
  // layouts e 26 pinturas por troca contra 1 e 3 —, e era o único.
  //
  // As propriedades INDIVIDUAIS entram de propósito: `#toast`, `#timer` e
  // `.ins-faixa` se centram com `transform: translateX(-50%)`, e mover com
  // `translate` não reescreve o centramento.
  const folhas = todasAsFolhas();
  const porNome = quadrosPorNome(folhas);
  const proibidas: string[] = [];
  folhas.forEach(f => f.regras.forEach(r => {
    const pode = NO_REDUZ(r) && !NO_PORTAO(r) ? ['opacity'] : SE_MOVE;
    oQueMove(r, porNome).filter(p => !pode.includes(p)).forEach(p =>
      proibidas.push(r.arquivo + ':' + r.linha + ' ' + r.sels.join(', ') + ' anima ' + p));
  }));
  assert.deepStrictEqual(proibidas, [],
    'isso refaz layout ou pintura a cada quadro e congela quando a thread trava. Mova com ' +
    'transform, translate, scale ou opacity (sob reduce, só opacity). `all` inclui todas.');

  // E o centrado não anima `transform`: animar o `transform` dele desfaz o
  // `translateX(-50%)`, e ele salta para a direita no primeiro quadro.
  const regras = folhas.flatMap(f => f.regras);
  const centrados = new Set(regras.filter(r => r.decls.some(d => d.prop === 'transform' && /translateX\(\s*-50%\s*\)/.test(d.valor)))
    .flatMap(r => r.sels));
  assert.ok(centrados.has('#toast') && centrados.has('#timer'),
    'os centrados por translateX(-50%) mudaram de forma: o caso tem de mudar junto');
  // Centrado é toda regra cujo SUJEITO é ele, e não só o seletor exato: o
  // cronômetro sobe por `#timer.anda.on`, e o toast acompanha por
  // `html:has(#timer.on) #toast` (peça 3). Com o seletor exato, um
  // `#timer.anda { transition: transform … }` passava — plantado, ficou verde.
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ehCentrado = (sel: string) => [...centrados].some(c => new RegExp(esc(c) + '(?![\\w-])').test(sujeitoDe(sel)));
  assert.ok(ehCentrado('#timer.anda.on') && ehCentrado('html:has(#timer.on) #toast') && !ehCentrado('#timer button') &&
    !ehCentrado('.ins-faixa-o'), 'a leitura do sujeito mudou: o caso tem de mudar junto');
  const descentra = regras.filter(r => r.sels.some(ehCentrado) &&
    oQueMove(r, porNome).some(p => p === 'transform' || p === 'all'))
    .map(r => r.arquivo + ':' + r.linha + ' ' + r.sels.join(', '));
  assert.deepStrictEqual(descentra, [],
    'elemento centrado por translateX(-50%) anima transform: use a propriedade translate');
});

test('(d) nada entre um fixo e a janela cria bloco de contenção', () => {
  // A promessa que `src/ui/instrumento/folha.jsx` escreve: a folha é
  // `position: fixed` e sai da árvore visualmente de onde estiver, DESDE QUE
  // nenhum ancestral crie bloco de contenção. Qualquer um que crie prende o fixo
  // dentro do pai — ele deixa de cobrir a tela e passa a rolar com o conteúdo,
  // sem erro nenhum. Medido: um `transform` no `#app` leva a barra de abas de y
  // 849 a 1251; um no `.ins-modo` leva a faixa da pergunta de 805 a 1309
  // (docs/motion/04 §2.3).
  //
  // Três buracos fechados em 16/10: o `.ins-modo` ficou fora da lista por um ano
  // (a metade de DOM, em `tests/fluxo/movimento.test.js`, confere agora que a
  // lista é a árvore); `translate`, `scale`, `rotate`, `container-type` e
  // `content-visibility` contêm tanto quanto `transform` e não estavam no
  // padrão; e ANIMAÇÃO no ancestral não era lida — um `.ins-modo { animation }`
  // com `transform` nos quadros passava.
  const PRESO = /^(transform|translate|scale|rotate|filter|perspective|backdrop-filter|-webkit-backdrop-filter|will-change|contain|container|container-type|content-visibility)$/;
  const folhas = folhasDoApp();
  const porNome = quadrosPorNome(todasAsFolhas());
  const culpadas: string[] = [];
  folhas.forEach(f => f.regras.forEach(r => {
    // os pseudo-elementos de transição de vista moram numa árvore à parte, por
    // cima da página, e não contêm fixo nenhum.
    //
    // E o SUJEITO conta, não só o seletor inteiro (peça 5): `html[data-nav]
    // .ins-modo { transform: … }` pinta o `.ins-modo` — que contém a faixa fixa
    // — e passava, porque o seletor tem um descendente (visto ao montar o
    // plantio da peça 5; o plantio P27 prova que agora fica vermelho).
    const alcanca = r.sels.filter(s => !/::view-transition/.test(s) &&
      (ANCESTRAL.test(raizDe(s)) || ANCESTRAL.test(sujeitoDe(raizDe(s)))));
    if (!alcanca.length) return;
    r.decls.filter(d => PRESO.test(d.prop)).forEach(d => culpadas.push(onde(r, d)));
    oQueMove(r, porNome).filter(p => p !== 'opacity').forEach(p =>
      culpadas.push(r.arquivo + ':' + r.linha + ' ' + alcanca.join(', ') + ' anima ' + p));
  }));
  assert.deepStrictEqual(culpadas, [],
    'ancestral de um fixo com bloco de contenção: o fixo passa a rolar com o pai. Anime um ' +
    'invólucro que não contenha fixo, ou use a transição de vista, que move fotos e não elementos.');

  // `will-change` em lugar nenhum sem medida: os dois motores compõem transform e
  // opacity sem ele (docs/motion/04 R5), e no ancestral ele contém. A lista de
  // exceção começa vazia e só cresce com a medida que justifique.
  const EXCECOES_WILL_CHANGE: string[] = [];
  const willChange = todasAsFolhas().flatMap(f => f.regras).flatMap(r => r.decls
    .filter(d => d.prop === 'will-change' && !r.sels.every(s => EXCECOES_WILL_CHANGE.includes(s)))
    .map(d => onde(r, d)));
  assert.deepStrictEqual(willChange, [], 'will-change sem medida que o justifique');
});

test('(e) nada escuta o fim de uma animação', () => {
  // Sob "Reduzir movimento" o evento de fim de transição NÃO CHEGA (medido,
  // docs/motion/05 §1.3): quem esperasse por ele para desmontar, gravar ou mover
  // o foco deixaria a tela presa com o véu por cima. O toque nunca espera a
  // animação; monta-se, desmonta-se e move-se o foco pelo estado, no mesmo
  // desenho. Vale em todo lugar, a porta inclusive — ela não precisa.
  //
  // UMA exceção, estreita e conferida (peça 5): pular uma transição de vista
  // antes de ela começar a andar rejeita a `ready` dela (`AbortError`, medido
  // nos dois motores), e rejeição sem dono vira erro de página. A porta a marca
  // como tratada com `.ready.catch(semDono)`, e `semDono` tem de ser uma função
  // VAZIA — uma linha dentro dela já seria esperar o começo da transição.
  const porta = semComentariosJs(fonte(PORTA));
  const marca = porta.match(/\.ready\.catch\(semDono\)/g) || [];
  assert.ok(marca.length <= 1, 'a rejeição da transição é marcada uma vez só');
  if (marca.length) assert.match(porta, /function semDono\(\)\s*\{\s*\}/, '`semDono` faz alguma coisa: aí ela espera a transição começar');
  const escuta = noCodigo(arquivosJs(),
    /(transition|animation)(end|start|run|cancel|iteration)(?![a-z])|\.(finished|ready|updateCallbackDone)\b(?!\.catch\(semDono\))/i);
  assert.deepStrictEqual(escuta, [],
    'código que espera o fim (ou o começo) de uma animação: sob movimento reduzido o evento ' +
    'não chega, e a tela fica presa. Monte, desmonte e mova o foco pelo estado.');
});

test('(g) a folha e o painel de pare chegam com o quique, o véu acende no tempo da camada, e nada mais da pilha se move', () => {
  // Peça 4 (dono, 16/10: pergunta 1, a folha chega "com quique"; pergunta 11,
  // o painel de apagar "igual à folha"). O quique é a única ultrapassagem do app
  // — a guarda (a) cobra que os quadros dele moram nos tokens, casados com o
  // tempo dele. Esta cobra QUEM o usa e como: só a caixa da folha e a do pare,
  // nunca o invólucro (que é o fixo), nunca a folha que toma o lugar da de cima
  // (02 T8) nem o "Não guardei" (03 §5.3); o véu de cada uma acende no tempo da
  // CAMADA na curva do véu; sob "Reduzir movimento", os quatro só esmaecem.
  const regras = folhasDoApp().flatMap(f => f.regras);
  const porNome = quadrosPorNome(todasAsFolhas());
  const CAIXAS = ['.ins-folha-w:not(.troca) > .ins-folha', '.pare-w:not(.falhou-w) > .pare'];
  const VEUS = ['.ins-folha-w:not(.troca) > .ins-veu', '.pare-w:not(.falhou-w) > .ins-veu'];
  const ordena = (l: string[]) => [...new Set(l)].sort();
  const itens = (porta: (r: Regra) => boolean) => regras.filter(porta).flatMap(r => r.decls
    .filter(d => d.prop === 'animation' && !ehNada(d.valor))
    .flatMap(d => partesNoTopo(d.valor, ',').map(it => ({ r, it: it.trim(), nome: nomeDaAnimacao(it) }))));

  // o quique: só as duas caixas, só no portão
  const quique = itens(NO_PORTAO).filter(x => x.nome === 'ins-quique');
  assert.deepStrictEqual(ordena(quique.flatMap(x => x.r.sels)), ordena(CAIXAS),
    'o quique é só a chegada da folha e do painel de pare, na caixa deles — nem o invólucro (o fixo), nem a troca do topo, nem o "Não guardei"');
  quique.forEach(x => assert.ok(/var\(--ins-curva-camada\)/.test(x.it), onde(x.r, { prop: 'animation', valor: x.it }) +
    ': a curva da declaração do quique é a da camada (os trechos dele têm a sua)'));
  assert.deepStrictEqual(itens(NO_REDUZ).filter(x => x.nome === 'ins-quique').map(x => onde(x.r, { prop: 'animation', valor: x.it })), [],
    'sob "Reduzir movimento" nada quica');

  // o véu: acende no tempo da camada, na curva do véu — o `ease`, o mais perto do `ease-out` que o dono viu
  const veu = itens(NO_PORTAO).filter(x => x.r.sels.some(s => /\.ins-veu$/.test(s)));
  assert.deepStrictEqual(ordena(veu.flatMap(x => x.r.sels)), ordena(VEUS), 'o véu acende só na chegada da folha e do pare');
  veu.forEach(x => {
    assert.strictEqual(x.nome, 'ins-esmaece', 'o véu escurece; não se desloca: ' + x.it);
    assert.ok(/var\(--ins-dur-entra\)/.test(x.it) && /var\(--ins-curva-ciclo\)/.test(x.it),
      'o véu no tempo da camada (--ins-dur-entra) e na curva do véu (--ins-curva-ciclo): ' + x.it);
  });

  // sob "Reduzir": a caixa e o véu das duas, só o esmaecer, no tempo dele
  const reduz = itens(NO_REDUZ).filter(x => x.r.sels.some(s => CAIXAS.includes(s) || VEUS.includes(s)));
  assert.deepStrictEqual(ordena(reduz.flatMap(x => x.r.sels)), ordena(CAIXAS.concat(VEUS)),
    'sob "Reduzir movimento" a folha, o painel e os véus esmaecem ao chegar (resposta 2)');
  reduz.forEach(x => assert.ok(x.nome === 'ins-esmaece' && /var\(--ins-dur-dissolve\)/.test(x.it), 'só esmaecer, em --ins-dur-dissolve: ' + x.it));

  // e nada mais da pilha de camadas se move: só estas quatro regras mexem em folha, pare, véu ou aviso
  const DA_PILHA = /\.(ins-folha-w|ins-folha|ins-veu|pare-w|pare|falhou-w|ng-faixa)(?![\w-])/;
  const outras = regras.filter(r => (NO_PORTAO(r) || NO_REDUZ(r)) && r.sels.some(s => DA_PILHA.test(s)) &&
      r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor)))
    .flatMap(r => r.sels.filter(s => !CAIXAS.includes(s) && !VEUS.includes(s)).map(s => r.arquivo + ':' + r.linha + ' ' + s));
  assert.deepStrictEqual(outras, [], 'movimento na pilha de camadas fora da chegada da folha e do pare');

  // o pé da caixa: no pico do quique ela passa do lugar, e o vão que abriria
  // embaixo é coberto pelo mesmo fundo, do tamanho da ultrapassagem pelo menos
  const quadros = (porNome.get('ins-quique') || [])[0];
  assert.ok(quadros, 'os quadros do quique sumiram');
  const passa = Math.max(...quadros.quadros.flatMap(q => q.decls.filter(d => d.prop === 'transform')
    .map(d => -Number((/translateY\((-?[\d.]+)%\)/.exec(d.valor) || [0, 0])[1]))));
  const PES = ['.ins-folha::after', '.pare-w:not(.falhou-w) > .pare::after'];
  PES.forEach(sel => {
    const r = regras.find(x => x.sels.includes(sel) && !NO_PORTAO(x) && !NO_REDUZ(x));
    assert.ok(r, 'o pé de ' + sel + ' sumiu: no pico do quique a página apareceria por baixo da caixa');
    const v = (p: string) => (r!.decls.filter(d => d.prop === p).pop() || { valor: '' }).valor.trim();
    assert.strictEqual(v('position'), 'absolute', sel);
    assert.strictEqual(v('top'), '100%', sel + ': começa onde a caixa acaba');
    assert.strictEqual(v('background'), 'inherit', sel + ': o mesmo fundo da caixa, nas duas variantes do pare');
    const h = /^(\d*\.?\d+)%$/.exec(v('height'));
    assert.ok(h && Number(h[1]) >= passa, sel + ': da altura da ultrapassagem pelo menos (' + passa + ' %): ' + v('height'));
  });

  // o conteúdo da folha não rola de lado (docs/motion/04 §2.4)
  const corpo = regras.filter(r => r.sels.includes('.ins-folha-c') && !NO_PORTAO(r) && !NO_REDUZ(r)).flatMap(r => r.decls)
    .filter(d => d.prop === 'overflow-x').pop();
  assert.ok(corpo && /^(hidden|clip)$/.test(corpo.valor.trim()),
    'com `overflow-y: auto` o outro eixo vira `auto`, e o conteúdo da folha rolava de lado com o dedo');
});

test('(h) a troca de camada move só as fotos: a tela cheia pela direita com a de baixo parada, a folha e o painel descem, e o que é do aparelho não anda', () => {
  // Peça 5 (dono, 16/10): pergunta 4, a tela cheia chega da direita, a tela
  // inteira, e a de baixo fica PARADA; pergunta 5, o modo entra como qualquer
  // tela cheia; pergunta 1, camada entra e sai em 350 ms na curva do iPhone, sem
  // quique, e nenhuma saída quica — a folha e o painel de apagar DESCEM, e o véu
  // apaga junto; pergunta 2, sob "Reduzir movimento" nenhuma transição: o que
  // chega esmaece no nó que nasce. A guarda (c) já cobra que as fotos só se
  // movem por transform e opacity, e a (d) que nenhum elemento real que contém
  // fixo se move; esta cobra QUAIS fotos se movem, como, e quem tem nome.
  const regras = folhasDoApp().flatMap(f => f.regras);
  const porNome = quadrosPorNome(todasAsFolhas());
  const doPortao = regras.filter(NO_PORTAO);
  const animacoes = (sel: string, rs: Regra[]) => rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => d.prop === 'animation' && !ehNada(d.valor)).flatMap(d => partesNoTopo(d.valor, ','));
  const declDe = (sel: string, prop: string, rs: Regra[]) => (rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => d.prop === prop).pop() || { valor: '' }).valor.trim();
  /** O transform de cada ponta dos quadros de uma animação: [0 %, 100 %]. */
  const pontas = (nome: string) => {
    const q = (porNome.get(nome) || [])[0];
    assert.ok(q, 'não há @keyframes ' + nome);
    const em = (pos: number) => (q.quadros.filter(f => f.pos.includes(pos)).flatMap(f => f.decls).filter(d => d.prop === 'transform' || d.prop === 'opacity').pop() || { valor: '' }).valor.trim();
    return [em(0), em(100)];
  };

  // ENTRA: a foto nova chega da borda direita, a tela inteira, no tempo e na curva da camada, com o fio
  const ENTRA = 'html[data-nav="entra"]::view-transition-new(root)';
  const entra = animacoes(ENTRA, doPortao);
  assert.strictEqual(entra.length, 1, 'a tela que chega tem uma animação só: ' + entra);
  assert.strictEqual(nomeDaAnimacao(entra[0]), 'ins-da-direita');
  assert.ok(/var\(--ins-dur-entra\)/.test(entra[0]) && /var\(--ins-curva-camada\)/.test(entra[0]), 'entra em 350 ms na curva do iPhone: ' + entra[0]);
  assert.deepStrictEqual(pontas('ins-da-direita'), ['translateX(100%)', 'none'], 'da borda direita, a tela inteira, até o lugar');
  // SAI: a foto velha volta pela borda direita, por cima da que reaparece
  const SAI = 'html[data-nav="sai"]::view-transition-old(root)';
  const sai = animacoes(SAI, doPortao);
  assert.strictEqual(sai.length, 1, 'a tela que sai tem uma animação só: ' + sai);
  assert.strictEqual(nomeDaAnimacao(sai[0]), 'ins-para-direita');
  assert.ok(/var\(--ins-dur-sai\)/.test(sai[0]) && /var\(--ins-curva-camada\)/.test(sai[0]), 'sai em 350 ms na curva do iPhone: ' + sai[0]);
  assert.deepStrictEqual(pontas('ins-para-direita'), ['none', 'translateX(100%)'], 'do lugar até passar da borda direita');
  assert.strictEqual(declDe(SAI, 'z-index', doPortao), '1', 'a que sai passa POR CIMA da que reaparece');
  // a borda da que anda: um fio de 1 px (nunca sombra), fora da foto
  [ENTRA, SAI].forEach(sel => {
    assert.ok(/var\(--ins-fio-largura\)\s+solid\s+var\(--ins-fio\)/.test(declDe(sel, 'border-left', doPortao)), sel + ': o fio de 1 px na borda esquerda');
    assert.strictEqual(declDe(sel, 'margin-left', doPortao), 'calc(-1 * var(--ins-fio-largura))', sel + ': fora da foto, para nada saltar 1 px no fim');
    assert.strictEqual(declDe(sel, 'box-shadow', regras), '', sel + ': sem sombra (inegociável 3)');
  });

  // A DE BAIXO PARADA (pergunta 4): nenhuma regra anima a foto velha ao entrar,
  // nem a nova ao sair — e nenhuma outra regra mexe na foto da página
  const daRaiz = regras.filter(r => r.sels.some(sel => /::view-transition-(old|new|group|image-pair)\(root\)/.test(sel)) &&
    r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor)));
  assert.deepStrictEqual(daRaiz.flatMap(r => r.sels).sort(), [ENTRA, SAI, ...CARROSSEL].sort(),
    'só a tela que chega e a que sai se movem: a de baixo fica parada (dono, pergunta 4) — e, na troca de aba, as duas páginas do carrossel (o caso (i))');

  // A FOLHA E O PAINEL DESCEM: só a foto velha sem nova, no tempo e na curva da camada, sem quique
  const CAIXAS = ['folha-0', 'folha-1', 'folha-2', 'folha-3', 'painel'].map(n => '::view-transition-old(' + n + '):only-child');
  const VEUS = ['veu-0', 'veu-1', 'veu-2', 'veu-3', 'veu-painel'].map(n => '::view-transition-old(' + n + '):only-child');
  CAIXAS.forEach(sel => {
    const a = animacoes(sel, doPortao);
    assert.strictEqual(a.length, 1, sel + ': desce');
    assert.strictEqual(nomeDaAnimacao(a[0]), 'ins-desce', sel);
    assert.ok(/var\(--ins-dur-sai\)/.test(a[0]) && /var\(--ins-curva-camada\)/.test(a[0]), sel + ': em 350 ms na curva da camada, sem quique: ' + a[0]);
  });
  assert.deepStrictEqual(pontas('ins-desce'), ['none', 'translateY(100%)'], 'do lugar até passar da borda de baixo');
  VEUS.forEach(sel => {
    const a = animacoes(sel, doPortao);
    assert.strictEqual(a.length, 1, sel + ': o véu apaga junto');
    assert.strictEqual(nomeDaAnimacao(a[0]), 'ins-apaga', sel);
    assert.ok(/var\(--ins-dur-sai\)/.test(a[0]) && /var\(--ins-curva-ciclo\)/.test(a[0]), sel + ': no tempo da saída, na curva do véu: ' + a[0]);
  });
  assert.deepStrictEqual(pontas('ins-apaga'), ['1', '0'], 'o véu só apaga');
  // O RODAPÉ (peça 6, da conferência da peça 5, 07 §11.3): quando a troca tira
  // ou devolve a barra de abas, o cronômetro e o aviso — do aparelho, com foto
  // própria — saltavam a altura dela no primeiro quadro. Agora o par de imagens
  // deles muda de altura junto com a troca, no tempo e na curva da camada, e só
  // na vertical: não anda de lado com as páginas.
  // (o cronômetro só em cena: fora dela ele continua desenhado, invisível, e tem
  // foto; o aviso só com mensagem: desde a peça 7 o lugar dele nunca sai da
  // página, fica vazio, e também tem foto)
  const RODAPE = ['desce', 'sobe'].flatMap(p => ['html[data-pe="' + p + '"]:has(#timer.on)::view-transition-image-pair(cronometro)',
    'html[data-pe="' + p + '"]:has(#toast > .aviso)::view-transition-image-pair(aviso)']);
  RODAPE.forEach(sel => {
    const a = animacoes(sel, doPortao);
    const desce = /"desce"/.test(sel);
    assert.strictEqual(a.length, 1, sel + ': muda de altura com a troca');
    assert.strictEqual(nomeDaAnimacao(a[0]), desce ? 'ins-rodape-desce' : 'ins-rodape-sobe', sel);
    assert.ok(new RegExp('var\\(--ins-dur-' + (desce ? 'entra' : 'sai') + '\\)').test(a[0]) && /var\(--ins-curva-camada\)/.test(a[0]),
      sel + ': no tempo e na curva da camada que ' + (desce ? 'chega' : 'sai') + ': ' + a[0]);
  });
  [['ins-rodape-desce', 'calc(-1 * var(--ins-barra-de-abas))'], ['ins-rodape-sobe', 'var(--ins-barra-de-abas)']].forEach(([nome, de]) => {
    const q = (porNome.get(nome) || [])[0];
    assert.ok(q, 'não há @keyframes ' + nome);
    const em = (pos: number) => q.quadros.filter(f => f.pos.includes(pos)).flatMap(f => f.decls);
    assert.deepStrictEqual(em(0).map(d => d.prop + ': ' + d.valor.trim()), ['translate: 0 ' + de], nome + ': parte da altura da barra, só na vertical');
    assert.deepStrictEqual(em(100).map(d => d.prop + ': ' + d.valor.trim()), ['translate: none'], nome + ': e chega ao lugar novo');
  });
  assert.match(semComentariosJs(mainJsx()), /trocaDeCamada\(sentido, desenhaPendente, !jaAnimado, rodapeDaTroca\(camadasDesenhadas, pedidas\)\)/,
    'o casco diz à porta quando a troca muda a reserva do rodapé');
  assert.match(semComentariosJs(fonte(PORTA)), /setAttribute\('data-pe', rodape\)/, 'e a porta põe isso no html');

  // UM QUADRO ADIANTE (peça 6, da conferência da peça 5, 07 §11.2): toda foto que
  // anda começa um quadro adentro (`--ins-adianta`), senão o primeiro quadro
  // animado — o tempo 0 — sai igual ao anterior, e a troca anda dois quadros
  // depois do antes, quando o dono aceitou um. E só elas e o fio: o que nasce
  // por CSS não tem a foto antes.
  const fotosQueAndam = regras.filter(r => NO_PORTAO(r) && r.sels.some(sel => /::view-transition/.test(sel)));
  const semAdianta = fotosQueAndam.flatMap(r => r.decls.filter(d => d.prop === 'animation' && !ehNada(d.valor))
    .flatMap(d => partesNoTopo(d.valor, ',')).filter(it => !/var\(--ins-adianta\)/.test(it)).map(it => r.sels.join(', ') + ' → ' + it));
  assert.deepStrictEqual(semAdianta, [], 'foto que anda sem começar um quadro adiante');
  const usamAdianta = todasAsFolhas().flatMap(f => f.regras).filter(r => !ehTokens(r) && r.decls.some(d => /var\(--ins-adianta\)/.test(d.valor)))
    .flatMap(r => r.sels).filter(sel => !/::view-transition/.test(sel) && sel !== '.ins-tab-ind');
  assert.deepStrictEqual(usamAdianta, [], 'o quadro adiante é só das fotos da transição de vista e do fio, que anda com elas');
  const adianta = /--ins-adianta\s*:\s*(-?\d*\.?\d+)ms/.exec(semComentariosCss(fonte('src/tokens.css')));
  assert.ok(adianta && Number(adianta[1]) <= -16 && Number(adianta[1]) >= -17, '--ins-adianta é um quadro a 60 Hz, para trás: ' + (adianta && adianta[1]));

  // nenhuma saída quica, e nenhuma foto quica
  const quicaNaFoto = regras.filter(r => r.sels.some(sel => /::view-transition/.test(sel)) &&
    r.decls.some(d => /ins-quique/.test(d.valor)));
  assert.deepStrictEqual(quicaNaFoto.map(r => r.sels.join(', ')), [], 'nenhuma saída quica (dono, 16/10)');
  // e mais nenhuma foto se move: as que andam são exatamente estas
  const movem = regras.filter(r => r.sels.some(sel => /::view-transition/.test(sel)) && (NO_PORTAO(r) || NO_REDUZ(r)) &&
    r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor))).flatMap(r => r.sels);
  assert.deepStrictEqual([...new Set(movem)].sort(), [ENTRA, SAI, ...CAIXAS, ...VEUS, ...CARROSSEL, ...RODAPE].sort(),
    'uma foto se move fora da tabela das peças 5 e 6: o que é do aparelho não anda, e o que não está aqui troca seco');
  // sob "Reduzir", nenhuma foto: a porta nem pede a transição
  assert.deepStrictEqual(regras.filter(r => NO_REDUZ(r) && r.sels.some(sel => /::view-transition/.test(sel))).map(r => r.sels.join(', ')), [],
    'sob "Reduzir movimento" não há transição de vista');

  // O QUE É DO APARELHO TEM NOME, e só ele (mais a folha e o painel, que descem)
  const nomes = regras.filter(r => !NO_PORTAO(r) && !NO_REDUZ(r)).flatMap(r => r.decls.filter(d => d.prop === 'view-transition-name')
    .flatMap(d => r.sels.map(sel => sel + ' → ' + d.valor)));
  assert.deepStrictEqual(nomes.sort(), [
    '#timer → cronometro', '#toast → aviso', '.ins-faixa → faixa', '.ng-faixa → nao-guardado',
    '.pare-w:not(.falhou-w) > .ins-veu → veu-painel', '.pare-w:not(.falhou-w) > .pare → painel',
    ...BARRA_NA_ABA.map(sel => sel + ' → barra-de-abas')
  ].sort(), 'os nomes próprios da troca: o cronômetro, o aviso, as duas faixas e o painel de apagar — a barra de abas só na troca de aba (na de camada ela é do lugar), e nunca o "Não guardei" (não desce)');
  assert.ok(regras.some(r => !NO_PORTAO(r) && !NO_REDUZ(r) && FOTOS_PARADAS.every(f => r.sels.includes(f)) &&
    r.decls.some(d => d.prop === 'opacity' && d.valor === '0')),
    'o que é do aparelho e não está na tela nova sai de uma vez, no primeiro quadro');
  // O AVISO CURTO É SÓ O VIVO (peça 7): o lugar dele nunca sai da página, e a
  // foto velha — a mensagem parada no instante da foto — nunca aparece; por
  // baixo da viva, a mensagem que apaga ficaria acesa até o fim da troca
  // (visto nos quadros do compositor) e a que chega nasceria sobre a anterior.
  assert.ok(regras.some(r => !NO_PORTAO(r) && !NO_REDUZ(r) && r.sels.includes('::view-transition-old(aviso)') &&
    r.decls.some(d => d.prop === 'opacity' && d.valor === '0')),
    'a foto velha do aviso nunca aparece: `::view-transition-old(aviso) { opacity: 0 }`, fora do portão');
  // a folha e o véu, pela POSIÇÃO na pilha (o nível se repete: refeição e editar refeição são 50)
  const folha = fonte('src/ui/instrumento/folha.jsx');
  assert.match(folha, /class="ins-veu"[^>]*style=\{'view-transition-name:veu-' \+ lugar\}/, 'o véu da folha se nomeia pela posição');
  assert.match(folha, /class="ins-folha"[\s\S]{0,200}style=\{'view-transition-name:folha-' \+ lugar\}/, 'a folha se nomeia pela posição');
  assert.match(mainJsx(), /<LugarNaPilha\.Provider value=\{i\}>/, 'a posição é o índice na pilha, e não o nível');

  // SOB "REDUZIR": a tela cheia e o modo que chegam esmaecem no nó que nasce, e só eles
  const reduz = regras.filter(r => NO_REDUZ(r) && r.sels.some(sel => /data-nav/.test(sel)));
  assert.deepStrictEqual(reduz.flatMap(r => r.sels).sort(), ['html[data-nav="entra"] .ins-modo', 'html[data-nav="entra"] .tc', ...ABA_QUE_NASCE].sort(),
    'sob "Reduzir movimento", o que chega esmaece — só na chegada; o que reaparece já estava lá (a aba nova, o caso (i))');
  reduz.forEach(r => r.decls.filter(d => d.prop === 'animation').forEach(d => assert.ok(
    nomeDaAnimacao(d.valor) === 'ins-esmaece' && /var\(--ins-dur-dissolve\)/.test(d.valor), 'só esmaecer, em --ins-dur-dissolve: ' + d.valor)));

  // e o JavaScript pede a troca num ponto só: o `render()`, pela porta
  const mj = semComentariosJs(mainJsx());
  assert.strictEqual((mj.match(/trocaDeCamada\(/g) || []).length, 1, 'a troca de camada é pedida num ponto só');
  assert.match(mj, /function render\(\) \{[\s\S]{0,400}trocaDeCamada\(/, 'e esse ponto é o render()');
});

/** O que é do aparelho, na foto velha sem nova (`:only-child`): sai de uma vez. O aviso não: o lugar dele está sempre lá (peça 7). */
const FOTOS_PARADAS = ['cronometro', 'faixa', 'nao-guardado'].map(n => '::view-transition-old(' + n + '):only-child');

/** O carrossel da aba (peça 6): as duas fotos da página, nos dois sentidos do índice. */
const SENTIDOS_DA_ABA = ['aba-direita', 'aba-esquerda'];
const CARROSSEL = SENTIDOS_DA_ABA.flatMap(s => ['html[data-nav="' + s + '"]::view-transition-old(root)', 'html[data-nav="' + s + '"]::view-transition-new(root)']);
/** A barra de abas tem nome só na troca de aba. */
const BARRA_NA_ABA = SENTIDOS_DA_ABA.map(s => 'html[data-nav="' + s + '"] .ins-tabbar');
/** Sob "Reduzir movimento", o que nasce com a aba nova: o `<main>` (a chave é a aba) e o cabeçalho do Agora. */
const ABA_QUE_NASCE = SENTIDOS_DA_ABA.flatMap(s => ['html[data-nav="' + s + '"] main', 'html[data-nav="' + s + '"] .ag-cab']);

test('(i) a aba desliza a página inteira, as duas juntas, no sentido do índice; o fio anda junto; a barra e o que é do aparelho ficam', () => {
  // Peça 6 (dono, 16/10): pergunta 3, A PÁGINA INTEIRA DESLIZA, como um
  // carrossel — a velha sai pelo lado oposto e a nova entra pelo lado para onde
  // se andou na barra, as duas juntas, em 350 ms (`--ins-dur-entra`) na
  // `--ins-curva`, e o fio da aba anda junto, no mesmo tempo e na mesma curva;
  // pergunta 2, sob "Reduzir movimento" o conteúdo novo esmaece e o velho sai de
  // uma vez, e o fio salta. A (h) já cobra que só estas fotos se movem e que a
  // barra só tem nome aqui; esta cobra COMO, e o caminho no JavaScript. A metade
  // de motor — o que a tela mostra, nos dois motores — é `tests/fluxo/aba.test.js`.
  const regras = folhasDoApp().flatMap(f => f.regras);
  const porNome = quadrosPorNome(todasAsFolhas());
  const doPortao = regras.filter(NO_PORTAO);
  const fora = regras.filter(r => !NO_PORTAO(r) && !NO_REDUZ(r));
  const animacoes = (sel: string, rs: Regra[]) => rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => d.prop === 'animation' && !ehNada(d.valor)).flatMap(d => partesNoTopo(d.valor, ','));
  const declDe = (sel: string, prop: string, rs: Regra[]) => (rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => d.prop === prop).pop() || { valor: '' }).valor.trim();
  const pontas = (nome: string) => {
    const q = (porNome.get(nome) || [])[0];
    assert.ok(q, 'não há @keyframes ' + nome);
    const em = (pos: number) => (q.quadros.filter(f => f.pos.includes(pos)).flatMap(f => f.decls).filter(d => d.prop === 'transform').pop() || { valor: '' }).valor.trim();
    return [em(0), em(100)];
  };

  // as duas fotos da página, em cada sentido: a velha sai pelo lado oposto, a
  // nova chega do lado para onde se andou — a tela inteira, no tempo e na curva do carrossel
  const PELO_SENTIDO: Record<string, { velha: string, nova: string }> = {
    'aba-direita': { velha: 'ins-para-esquerda', nova: 'ins-da-direita' },
    'aba-esquerda': { velha: 'ins-para-direita', nova: 'ins-da-esquerda' }
  };
  SENTIDOS_DA_ABA.forEach(s => {
    (['velha', 'nova'] as const).forEach(qual => {
      const sel = 'html[data-nav="' + s + '"]::view-transition-' + (qual === 'velha' ? 'old' : 'new') + '(root)';
      const a = animacoes(sel, doPortao);
      assert.strictEqual(a.length, 1, sel + ': uma animação só');
      assert.strictEqual(nomeDaAnimacao(a[0]), PELO_SENTIDO[s][qual], sel + ': ' + (qual === 'velha' ? 'sai pelo lado oposto' : 'chega do lado para onde se andou'));
      assert.ok(/var\(--ins-dur-entra\)/.test(a[0]) && /var\(--ins-curva\)/.test(a[0]),
        sel + ': as duas juntas, em --ins-dur-entra na --ins-curva (o que o desenho que o dono viu tocava): ' + a[0]);
      // não é camada: nada fica por cima de nada, e a borda de uma encosta na da outra
      ['border-left', 'z-index', 'margin-left', 'box-shadow'].forEach(p => assert.strictEqual(declDe(sel, p, regras), '', sel + ': sem ' + p + ' — o carrossel não é camada'));
    });
  });
  assert.deepStrictEqual(pontas('ins-para-esquerda'), ['none', 'translateX(-100%)'], 'a velha sai a tela inteira pela esquerda');
  assert.deepStrictEqual(pontas('ins-da-esquerda'), ['translateX(-100%)', 'none'], 'a nova chega a tela inteira da esquerda');
  assert.deepStrictEqual(pontas('ins-da-direita'), ['translateX(100%)', 'none']);
  assert.deepStrictEqual(pontas('ins-para-direita'), ['none', 'translateX(100%)']);

  // o fio anda junto: no portão, só ele, em transform, no tempo e na curva do carrossel
  const fio = animacoesOuTransicoes('.ins-tab-ind', doPortao);
  assert.deepStrictEqual(fio, ['transform var(--ins-dur-entra) var(--ins-curva) var(--ins-adianta)'],
    'o fio anda em transform no tempo e na curva do carrossel, e um quadro adiante como as fotos — chegam ao lugar no mesmo quadro');
  // na troca seca (a aba sem índice) ele salta
  assert.strictEqual(declDe('html[data-nav="seca"] .ins-tab-ind', 'transition', fora), 'none', 'na troca seca o fio salta: não há para que lado andar');

  // a barra de abas: nome só na troca de aba, e a foto velha sem nova sai de uma vez
  const nomeiam = regras.filter(r => r.decls.some(d => d.prop === 'view-transition-name' && d.valor.trim() === 'barra-de-abas'));
  assert.deepStrictEqual(nomeiam.flatMap(r => r.sels).sort(), [...BARRA_NA_ABA].sort(), 'a barra de abas só tem nome na troca de aba');
  assert.ok(nomeiam.every(r => !NO_PORTAO(r) && !NO_REDUZ(r)), 'o nome não é movimento: mora fora do portão');
  assert.strictEqual(declDe('::view-transition-old(barra-de-abas):only-child', 'opacity', fora), '0', 'a barra que não está na tela nova sai de uma vez');
  assert.deepStrictEqual(regras.filter(r => r.sels.some(s => /\(barra-de-abas\)/.test(s)) && r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor))).map(r => r.sels.join(', ')), [],
    'a foto da barra não se move: o fio anda DENTRO dela, na foto nova, que é viva');

  // sob "Reduzir movimento": o que nasce com a aba esmaece no tempo dele, e mais nada
  ABA_QUE_NASCE.forEach(sel => {
    const a = animacoes(sel, regras.filter(r => NO_REDUZ(r) && !NO_PORTAO(r)));
    assert.strictEqual(a.length, 1, sel + ': esmaece ao chegar');
    assert.ok(nomeDaAnimacao(a[0]) === 'ins-esmaece' && /var\(--ins-dur-dissolve\)/.test(a[0]), sel + ': só esmaecer, em --ins-dur-dissolve: ' + a[0]);
  });

  // O JAVASCRIPT. O `<main>` nasce com a aba (a chave), que é o nó que esmaece
  const app = semComentariosJs(fonte('src/ui/app.jsx'));
  assert.match(app, /<main key=\{aba\}>/, 'o <main> tem a aba como chave: nasce com ela, e só com ela');
  // o sentido é o do ÍNDICE na barra; a aba sem índice troca seca
  const mj = semComentariosJs(mainJsx());
  const sentido = (/function sentidoDaTroca\([^)]*\) \{[\s\S]*?\n\}/.exec(mj) || [''])[0];
  assert.match(sentido, /ABAS\.findIndex/, 'o sentido da aba vem do índice na barra (ABAS, a mesma lista que a TabBar desenha)');
  assert.match(sentido, /'seca'/, 'a aba sem índice troca seca');
  assert.match(sentido, /para > de \? 'aba-direita' : 'aba-esquerda'/, 'andar para a direita na barra é aba-direita');
  assert.match(mj, /sentidoDaTroca\(camadasDesenhadas, pedidas, abaDesenhada, CTX\.abaAtual\(\)\)/,
    'a troca de aba se mede contra a aba DESENHADA, como a de camada contra as camadas desenhadas');
  const porta = semComentariosJs(fonte(PORTA));
  assert.match(porta, /sentido === 'seca'/, 'a porta não pede transição para a troca seca');
  // e o topo entra no desenho novo: `vaiPara` pede a troca ANTES de pedir o topo
  const vaiPara = (/vaiPara: function \(a\) \{[\s\S]*?\n {2}\},/.exec(mj) || [''])[0];
  assert.match(vaiPara, /render\(\);\s*rola\(0\);/, 'vaiPara: render() e depois rola(0) — rolar antes rolaria a foto da aba que sai');
});

/** As declarações de transição e animação de `sel` nas regras dadas, item a item. */
function animacoesOuTransicoes(sel: string, rs: Regra[]) {
  return rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => (d.prop === 'transition' || d.prop === 'animation') && !ehNada(d.valor))
    .flatMap(d => partesNoTopo(d.valor, ',').map(x => x.trim()));
}

// ============================================================
// O TOQUE
//
// O dono respondeu em 16/10 (pergunta 7): o toque SÓ ESCURECE — nenhum
// controle encolhe, "nenhum movimento novo; o toque se vê só pela cor". Até
// então 78 de 115 controles não mudavam nada com o dedo pousado, e o que mais
// mudava media 1,24:1 (docs/motion/09, peça 1). O estado mora numa camada só,
// em `base.css` ("O TOQUE"), pintada com `--ins-toque` sobre o repouso de
// qualquer controle.
//
// Este caso é a metade de FONTE: a forma da regra e a conta das camadas sobre
// a paleta. A metade de ÁRVORE — todo controle de verdade, com o fundo de
// verdade atrás dele, nos dois temas — é `tests/fluxo/toque.test.js`.
// ============================================================

test('(j) o aviso curto sobe e acende, sai apagando, compõe com o acompanhamento, e a região viva nunca sai da árvore', () => {
  // Peça 7 (dono, 16/10): pergunta 10, o aviso entra subindo `--ins-sobe-aviso`
  // e acendendo, sai apagando, em `--ins-dur-lugar` na `--ins-curva`, e o texto
  // novo refaz a entrada; pergunta 2, sob "Reduzir movimento" só a opacidade.
  // E a precondição da 05 §3.2: a região viva (`#toast`) deixa de usar
  // `display: none`, que a tirava da árvore de acessibilidade.
  //
  // A forma: DUAS caixas. `#toast` é o lugar — fixo, centrado por
  // `transform: translateX(-50%)`, acompanhando o cronômetro pelo `translate`
  // (peça 3) — e a mensagem é o nó de dentro (`#toast > .aviso`), que é quem
  // chega e sai. A mesma propriedade no mesmo nó teria dois donos, e o aviso
  // saltaria quando o cronômetro entrasse no meio da subida. Esta é a metade de
  // fonte; o tempo pelo texto e a ordem dos nós são `aviso.test.js` (árvore), e
  // o que a tela mostra, `acende.test.js` (motor).
  const regras = folhasDoApp().flatMap(f => f.regras);
  const porNome = quadrosPorNome(todasAsFolhas());
  const CAIXA = '#toast > .aviso', SAI = '#toast > .aviso.sai';
  const anim = (sel: string, rs: Regra[]) => rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls)
    .filter(d => d.prop === 'animation' && !ehNada(d.valor)).flatMap(d => partesNoTopo(d.valor, ',').map(x => x.trim()));
  const decl = (sel: string, prop: string) => (regras.filter(r => r.sels.includes(sel) && !NO_PORTAO(r) && !NO_REDUZ(r)).flatMap(r => r.decls)
    .filter(d => d.prop === prop).pop() || { valor: '' }).valor.trim();
  /** As declarações de um quadro (0 ou 100) de um `@keyframes`, como "prop: valor". */
  const quadro = (nome: string, pos: number) => {
    const q = (porNome.get(nome) || [])[0];
    assert.ok(q, 'não há @keyframes ' + nome);
    return q.quadros.filter(f => f.pos.includes(pos)).flatMap(f => f.decls)
      .filter(d => d.prop !== 'animation-timing-function').map(d => d.prop + ': ' + d.valor.trim()).sort();
  };

  // A REGIÃO VIVA NUNCA SAI DA ÁRVORE (05 §3.2, M12): nenhuma regra do app dá
  // `display: none`, `visibility: hidden` ou `content-visibility` ao toast, à
  // mensagem dele ou à série dita. A exceção é o documento de FORA da bancada,
  // onde o app não monta e o esqueleto cru sai de cena inteiro.
  const DA_REGIAO = /#toast(?![\w-])|#serie-dita(?![\w-])/;
  const tira: string[] = [];
  todasAsFolhas().flatMap(f => f.regras).forEach(r => r.sels.forEach(sel => {
    if (/^html\[data-palco="bancada"\]/.test(sel)) return;
    const ehDaRegiao = DA_REGIAO.test(sujeitoDe(sel)) || (/#toast(?![\w-])/.test(sel) && /\.aviso(?![\w-])/.test(sujeitoDe(sel)));
    if (!ehDaRegiao) return;
    r.decls.forEach(d => {
      if ((d.prop === 'display' && /^none$/i.test(d.valor)) || (d.prop === 'visibility' && /^(hidden|collapse)$/i.test(d.valor)) ||
          d.prop === 'content-visibility') tira.push(onde(r, d));
    });
  }));
  assert.deepStrictEqual(tira, [], 'a região viva sai da árvore de acessibilidade, e o aviso que entra junto não é anunciado');
  const div = (indexHtml().match(/<div id="toast"[^>]*>([\s\S]*?)<\/div>/) || []);
  assert.ok(div[0], 'o toast sumiu do index.html');
  assert.strictEqual(div[1], '', 'a região nasce vazia: a mensagem é posta por toast(), e só ela');
  assert.ok(!/\s(hidden|aria-hidden|inert)(=|\s|>)/.test(div[0]), 'nada esconde a região no HTML: ' + div[0]);

  // O LUGAR NÃO SE MOVE SOZINHO: no `#toast` só o acompanhamento (o `translate`
  // da peça 3, no tempo e na curva da camada), e nenhuma animação. E ele não
  // pega toque: quem pega é a mensagem enquanto está na tela.
  const doLugar = regras.filter(r => (NO_PORTAO(r) || NO_REDUZ(r)) && r.sels.some(s => /#toast$/.test(sujeitoDe(s))) &&
    r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor)));
  doLugar.forEach(r => r.decls.filter(d => ehMovimento(d.prop) && !ehNada(d.valor)).forEach(d => {
    assert.strictEqual(d.prop, 'transition', onde(r, d) + ': o lugar do aviso só acompanha o cronômetro');
    assert.match(d.valor, /^translate var\(--ins-dur-(entra|sai)\) var\(--ins-curva-camada\)$/, onde(r, d));
  }));
  assert.ok(doLugar.length >= 2, 'o acompanhamento do toast sumiu (peça 3)');
  assert.strictEqual(decl('#toast', 'pointer-events'), 'none', 'o lugar vazio, ou com a mensagem apagando, não pega toque');
  assert.strictEqual(decl(CAIXA, 'pointer-events'), 'auto', 'a mensagem na tela pega o toque como sempre pegou');
  assert.match(decl('#toast', 'transform'), /^translateX\(\s*-50%\s*\)$/, 'o lugar continua centrado pelo translateX(-50%)');

  // A ENTRADA: a caixa de dentro sobe `--ins-sobe-aviso` e acende, em
  // `--ins-dur-lugar` na `--ins-curva`, no portão — e só ela.
  const entra = anim(CAIXA, regras.filter(NO_PORTAO));
  assert.strictEqual(entra.length, 1, 'a mensagem chega com uma animação só: ' + entra);
  assert.strictEqual(nomeDaAnimacao(entra[0]), 'ins-chega-aviso', entra[0]);
  assert.ok(/var\(--ins-dur-lugar\)/.test(entra[0]) && /var\(--ins-curva\)(?![\w-])/.test(entra[0]), 'em --ins-dur-lugar, na --ins-curva: ' + entra[0]);
  assert.deepStrictEqual(quadro('ins-chega-aviso', 0), ['opacity: 0', 'translate: 0 var(--ins-sobe-aviso)'], 'de --ins-sobe-aviso abaixo, apagado');
  assert.deepStrictEqual(quadro('ins-chega-aviso', 100), ['opacity: 1', 'translate: none'], 'até o lugar, aceso');
  // A SAÍDA: só apaga, no mesmo tempo e na mesma curva; o toque passa por ela.
  const sai = anim(SAI, regras.filter(NO_PORTAO));
  assert.strictEqual(sai.length, 1, 'a mensagem sai com uma animação só: ' + sai);
  assert.strictEqual(nomeDaAnimacao(sai[0]), 'ins-apaga', sai[0]);
  assert.ok(/var\(--ins-dur-lugar\)/.test(sai[0]) && /var\(--ins-curva\)(?![\w-])/.test(sai[0]), 'em --ins-dur-lugar, na --ins-curva: ' + sai[0]);
  assert.deepStrictEqual(oQueMove({ arquivo: '', linha: 0, sels: [SAI], decls: [{ prop: 'animation', valor: sai[0] }], midias: [] }, porNome), ['opacity'],
    'sai só apagando: não vai a lugar nenhum');
  assert.strictEqual(decl(SAI, 'pointer-events'), 'none', 'a mensagem que apaga não pega toque');
  // SOB "REDUZIR": só a opacidade — acende em --ins-dur-dissolve, e sai de uma vez (nada para `.sai`).
  const reduz = anim(CAIXA, regras.filter(NO_REDUZ));
  assert.strictEqual(reduz.length, 1, 'sob "Reduzir movimento" a mensagem acende: ' + reduz);
  assert.ok(nomeDaAnimacao(reduz[0]) === 'ins-esmaece' && /var\(--ins-dur-dissolve\)/.test(reduz[0]), 'só esmaecer, em --ins-dur-dissolve: ' + reduz[0]);
  assert.deepStrictEqual(anim(SAI, regras.filter(NO_REDUZ)), [], 'sob "Reduzir movimento" a saída é de uma vez');
  // E nada mais move a mensagem.
  const daMensagem = (s: string) => /\.aviso(?![\w-])/.test(sujeitoDe(s));
  const outras = regras.filter(r => (NO_PORTAO(r) || NO_REDUZ(r)) && r.sels.some(daMensagem) &&
    r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor)))
    .flatMap(r => r.sels).filter(s => daMensagem(s) && s !== CAIXA && s !== SAI);
  assert.ok(daMensagem(CAIXA) && daMensagem(SAI) && !daMensagem('html[data-pe="sobe"]:has(#toast > .aviso)::view-transition-image-pair(aviso)'),
    'a leitura do sujeito mudou: o caso tem de mudar junto');
  assert.deepStrictEqual(outras, [], 'movimento na mensagem do aviso fora da entrada e da saída');

  // O RELÓGIO DA SAÍDA lê na porta o MESMO token da animação de saída — nunca um
  // número, nunca o fim da animação.
  const mj = semComentariosJs(mainJsx());
  const apaga = (/function apagaAviso\(\) \{([\s\S]*?)\n\}/.exec(mj) || [])[1] || '';
  assert.ok(apaga, 'apagaAviso sumiu do main.jsx');
  assert.match(apaga, /tempoDoMovimento\('--ins-dur-lugar'\)/, 'a saída segura o nó pelo tempo da porta, o mesmo da animação');
  assert.match(apaga, /classList\.add\('sai'\)/, 'e é a classe que apaga');
  const toastFn = (/function toast\(msg\) \{([\s\S]*?)\n\}/.exec(mj) || [])[1] || '';
  assert.match(toastFn, /className = 'aviso'/, 'a mensagem é um nó próprio, a caixa de dentro');
  assert.ok(!/classList\.(add|remove|toggle)\('on'\)|style\.display/.test(toastFn + apaga), 'a região não acende nem apaga por classe ou display: ela fica');
});

test('(f) o toque escurece: uma camada só, fora do portão, e nada no controle se move', () => {
  const regras = folhasDoApp().flatMap(f => f.regras);
  const CAMADA = /^linear-gradient\(\s*var\(--ins-toque\)\s*,\s*var\(--ins-toque\)\s*\)$/;
  // o último composto de um seletor: é ele que diz quem a regra pinta
  const sujeito = (sel: string) => {
    let prof = 0, colchete = false, ini = 0;
    for (let i = 0; i < sel.length; i++) {
      const c = sel[i];
      if (c === '(') prof++; else if (c === ')') prof--;
      else if (c === '[') colchete = true; else if (c === ']') colchete = false;
      else if (!prof && !colchete && /[\s>+~]/.test(c)) ini = i + 1;
    }
    return sel.slice(ini);
  };
  const noDedo = (sel: string) => /:active\b/.test(sujeito(sel).replace(/\([^)]*\)/g, ''));

  // 1. As regras do toque: em base.css, FORA de toda @media — é estado, não
  //    movimento, e com "Reduzir movimento" o toque continua visível. Duas, e
  //    `button:active` sozinho na dele: um navegador sem `:has()` descarta a
  //    regra inteira em que ele aparece, e o toque de todo botão iria junto.
  const doToque = regras.filter(r => r.decls.some(d => d.prop === 'background-image' && CAMADA.test(d.valor)) &&
    r.sels.every(s => noDedo(s)));
  const SELETORES = ['button:active', 'label:has(input[type="file"]):active',
    'label:has(input[type="checkbox"]):active', '.ex-top:active:not(:has(button:active))'];
  assert.deepStrictEqual(SELETORES.filter(s => !doToque.some(r => r.sels.includes(s))), [],
    'a regra do toque perdeu um dos controles');
  const u = doToque.find(r => r.sels.includes('button:active'))!;
  assert.deepStrictEqual(u.sels, ['button:active'],
    '`button:active` mora sozinho na regra dele: com `:has()` na mesma lista, um navegador sem `:has()` ' +
    'descarta a regra inteira, e nenhum botão mostraria o dedo');
  doToque.forEach(r => {
    assert.strictEqual(r.arquivo, 'base.css', 'a regra do toque mora em base.css, ao lado do reset de button: ' +
      r.arquivo + ':' + r.linha);
    assert.deepStrictEqual(r.midias, [], 'a regra do toque está dentro de ' + r.midias.join(' / ') +
      ': o toque é estado, e mora fora do portão — sob "Reduzir movimento" ele tem de continuar visível');
  });

  // 2. O `!important` só existe na camada do toque: ela fica por cima do
  //    `background:` abreviado de qualquer regra de controle. Outro brigaria.
  const importantes: string[] = [];
  FOLHAS.forEach(f => semComentariosCss(fonte('src/' + f)).split('\n').forEach((l, i) => {
    if (/!important/.test(l)) importantes.push(f + ':' + (i + 1) + ' ' + l.trim());
  }));
  assert.deepStrictEqual(importantes.filter(l => !(l.startsWith('base.css:') &&
    /^\S+ background-image\s*:\s*linear-gradient\(var\(--ins-toque\), var\(--ins-toque\)\) !important;$/.test(l))), [],
    '`!important` fora da camada do toque');
  assert.strictEqual(importantes.length, doToque.filter(r => r.arquivo === 'base.css').length,
    'cada regra do toque tem a camada com `!important`, e só elas: ' + importantes.join(' | '));

  // 3. A camada só existe com o dedo, e é a única imagem de fundo do app.
  const imagens = regras.flatMap(r => r.decls.filter(d => d.prop === 'background-image').map(d => ({ r, d })));
  assert.deepStrictEqual(imagens.filter(x => !CAMADA.test(x.d.valor) || !x.r.sels.every(s => /:active\b/.test(s)))
    .map(x => onde(x.r, x.d)), [],
    'imagem de fundo que não é a camada do toque, ou camada do toque sem o dedo: a regra do toque ' +
    'a apagaria no controle, ou o controle ficaria escuro parado');

  // 4. Nada no controle se move com o dedo, dentro ou fora do portão: nem
  //    escala, nem deslocamento, nem transição. Só escurece.
  const MEXE = /^(transform|translate|scale|rotate|zoom|transition(-[a-z-]+)?|animation(-[a-z-]+)?)$/;
  const mexe = regras.filter(r => r.sels.some(s => /:active\b/.test(s)))
    .flatMap(r => r.decls.filter(d => MEXE.test(d.prop)).map(d => onde(r, d)));
  assert.deepStrictEqual(mexe, [], 'o toque mexe no controle: ele só escurece (dono, 16/10, pergunta 7)');

  // 5. Um mecanismo só: fora da regra do toque, nenhuma regra com o dedo no
  //    próprio controle troca o fundo dele. Era assim que o "+1 copo" virava a
  //    cor do bloco em volta. (Um filho do controle pode mudar: a miniatura.)
  const outroFundo = regras.filter(r => !doToque.includes(r) && r.sels.some(noDedo))
    .flatMap(r => r.decls.filter(d => /^background(-color|-image)?$/.test(d.prop)).map(d => onde(r, d)));
  assert.deepStrictEqual(outroFundo, [],
    'segunda maneira de pintar o toque num controle: tire-a, a camada de base.css já escurece qualquer repouso');

  // 6. A camada troca na MESMA regra que pinta o preenchimento: para a do
  //    cheio onde ela pinta acento ou pare, de volta para a do papel onde ela
  //    devolve o controle ao papel. Nenhuma outra troca.
  const trocasTodas = regras.filter(r => r.arquivo !== 'tokens.css' && r.decls.some(d => d.prop === '--ins-toque'));
  const CHEIO = /^var\(--ins-(acento|pare-tinta)\)$/;
  const camadaDe = (r: Regra) => r.decls.filter(d => d.prop === '--ins-toque').pop()!.valor;
  const trocas = trocasTodas.filter(r => camadaDe(r) === 'var(--ins-toque-cheio)');
  assert.ok(trocas.length >= 5, 'só ' + trocas.length + ' regras trocam para a camada do cheio');
  assert.deepStrictEqual(trocasTodas.filter(r => {
    const fundo = r.decls.filter(d => d.prop === 'background' || d.prop === 'background-color').pop();
    if (!fundo) return true;
    if (camadaDe(r) === 'var(--ins-toque-cheio)') return !CHEIO.test(fundo.valor);
    if (camadaDe(r) === 'var(--ins-toque-papel)') return CHEIO.test(fundo.valor);
    return true;
  }).map(r => r.arquivo + ':' + r.linha + ' ' + r.sels.join(', ') + ' → --ins-toque: ' + camadaDe(r)), [],
    'regra que troca a camada do toque sem pintar ela mesma o preenchimento que a pede (a do cheio sobre ' +
    'acento ou pare, a do papel sobre o resto), ou trocando para outra coisa que não as duas camadas');

  // 8. E o contrário: todo preenchimento cheio que pinta um CONTROLE troca
  //    para a camada do cheio. Controle vem do código, não de uma lista: as
  //    classes que algum `<button>` ou `<label>` do JSX pode carregar. Basta
  //    uma regra de troca cujo sujeito alcance o mesmo controle (`.pare-sim`
  //    vale para `.pergunta-w .pare-sim`).
  const jsx: string[] = [path.join(RAIZ, 'src', 'main.jsx')];
  const anda = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const q = path.join(dir, e.name);
    if (e.isDirectory()) anda(q); else if (q.endsWith('.jsx')) jsx.push(q);
  });
  anda(path.join(RAIZ, 'src', 'ui'));
  const doControle: string[][] = [];
  jsx.forEach(arq => {
    for (const m of fs.readFileSync(arq, 'utf8').matchAll(/<(?:button|label)\b([^>]*?)(?:>|\/>)/gs)) {
      const c = m[1].match(/class=(?:"([^"]*)"|\{([^}]*)\})/);
      if (!c) continue;
      doControle.push(c[2] != null
        ? [...c[2].matchAll(/['"`]\s*([a-zA-Z][\w -]*?)\s*['"`]/g)].flatMap(x => x[1].split(/\s+/))
        : c[1].split(/\s+/).filter(Boolean));
    }
  });
  assert.ok(doControle.length > 100, 'o andador de JSX achou só ' + doControle.length + ' botões');
  const partesDoSujeito = (sel: string) => {
    let fora = '', prof = 0;
    for (const c of sujeito(sel)) { if (c === '(') prof++; if (!prof) fora += c; if (c === ')') prof--; }
    fora = fora.replace(/\[[^\]]*\]/g, '');
    return { tag: (/^[a-z][\w-]*/i.exec(fora) || [''])[0].toLowerCase(),
             classes: [...fora.matchAll(/\.([\w-]+)/g)].map(x => x[1]) };
  };
  const ehControle = (sel: string) => {
    if (/::|:(before|after)\b/.test(sel)) return false;
    const { tag, classes } = partesDoSujeito(sel);
    return tag === 'button' || (classes.length > 0 && doControle.some(cs => classes.every(c => cs.includes(c))));
  };
  const trocadores = trocas.flatMap(r => r.sels).map(partesDoSujeito);
  const semTroca = regras.filter(r => r.decls.some(d => (d.prop === 'background' || d.prop === 'background-color') && CHEIO.test(d.valor)))
    .flatMap(r => r.sels.filter(ehControle).filter(s => {
      const alvo = partesDoSujeito(s);
      return !trocadores.some(t => (!t.tag || t.tag === alvo.tag) && t.classes.every(c => alvo.classes.includes(c)) &&
        (t.tag || t.classes.length > 0));
    }).map(s => r.arquivo + ':' + r.linha + ' ' + s));
  assert.deepStrictEqual(semTroca, [],
    'controle de preenchimento cheio sem a camada do cheio: a camada do papel sobre o acento mede ~1,2:1. ' +
    'Declare `--ins-toque: var(--ins-toque-cheio)` na regra que pinta o preenchimento');

  // 7. A conta, da paleta como está na folha: a camada sobre cada papel, e a do
  //    cheio sobre cada cheio, passam de 1,5:1 nos dois temas. É a régua de
  //    `tokens.css`; a árvore confere de novo com o fundo de verdade.
  const tokens = semComentariosCss(fonte('src/tokens.css'));
  const iEscuro = tokens.indexOf('prefers-color-scheme: dark');
  const iManual = tokens.indexOf(':root[data-theme="dark"]');
  assert.ok(iEscuro > 0 && iManual > iEscuro, 'não achei os blocos de tema em tokens.css');
  const blocosDeTema = { claro: tokens.slice(0, iEscuro), escuro: tokens.slice(iEscuro, iManual), manual: tokens.slice(iManual) };
  const le = (txt: string, nome: string): number[] | null => {
    const m = new RegExp('--' + nome + '\\s*:\\s*(#[0-9A-Fa-f]{6}|rgba\\(([^)]*)\\))').exec(txt);
    if (!m) return null;
    if (m[2]) return m[2].split(',').map(Number);
    return [1, 3, 5].map(i => parseInt(m[1].substr(i, 2), 16)).concat(1);
  };
  assert.match(blocosDeTema.claro, /--ins-toque\s*:\s*var\(--ins-toque-papel\)\s*;/,
    'a camada de cada controle nasce como a do papel: `--ins-toque: var(--ins-toque-papel)` no :root');
  (['ins-toque-papel', 'ins-toque-cheio'] as const).forEach(n => {
    assert.ok(le(blocosDeTema.claro, n) && le(blocosDeTema.escuro, n) && le(blocosDeTema.manual, n),
      n + ' tem de existir nos três blocos de tema');
    assert.deepStrictEqual(le(blocosDeTema.manual, n), le(blocosDeTema.escuro, n),
      n + ' diverge entre os dois blocos escuros');
  });
  const lin = (c: number[]) => {
    const l = c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  };
  const razao = (a: number[], b: number[]) => { const x = lin(a), y = lin(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sobre = (base: number[], c: number[]) => base.slice(0, 3).map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
  const PAPEL = ['ins-fundo', 'ins-tela', 'ins-superficie', 'ins-superficie-2', 'ins-acento-suave',
    'ins-atencao-fundo', 'ins-pare-fundo'];
  const CHEIOS = ['ins-acento', 'ins-pare-tinta'];
  const fracos: string[] = [];
  (['claro', 'escuro'] as const).forEach(tema => {
    const txt = blocosDeTema[tema];
    const conta = (camada: string, fundos: string[]) => fundos.forEach(f => {
      const base = le(txt, f), c = le(txt, camada);
      assert.ok(base && c, 'token sem valor no tema ' + tema + ': ' + f + ' / ' + camada);
      const v = razao(base!, sobre(base!, c!));
      if (v < 1.5) fracos.push(tema + ' · ' + camada + ' sobre ' + f + ': ' + v.toFixed(2) + ':1');
    });
    conta('ins-toque-papel', PAPEL);
    conta('ins-toque-cheio', CHEIOS);
  });
  assert.deepStrictEqual(fracos, [],
    'a camada do toque não se vê o bastante: o mínimo é 1,5:1 entre o tocado e o repouso (tokens.css, "O toque")');
});

// ============================================================
// O RESTO DO LUGAR (peça 8)
//
// O que muda ONDE ESTÁ fora do treino, e o que continua parado: o copo do
// "+1 copo" enche de baixo, em `--ins-dur-lugar`, por transição (o Agora que
// monta nasce com os copos cheios, parados); a forma da refeição marcada pela
// linha pousa com o gesto do número da série, e a da leitura de volta não; a
// frase "Abrindo o registro…" só aparece se a abertura demorar, de uma vez e
// igual sob "Reduzir movimento"; e régua, teclado e RIR continuam sem movimento
// nenhum — o que nasce sob o polegar aparece no lugar —, com o teclado sem
// rolar a página ao receber o foco (docs/motion/03 §4.4, §4.6, §4.7, §6;
// 01 A.5; dono, 16/10, perguntas 2 e 13).
//
// Cada parte foi vista VERMELHA plantando a violação (docs/motion/09, peça 8).
// ============================================================

test('(k) o resto do lugar: o copo enche de baixo, a forma pousa, a frase da abertura só aparece se demora, e régua, teclado e RIR ficam parados', () => {
  const folhas = folhasDoApp();
  const regras = folhas.flatMap(f => f.regras);
  const porNome = quadrosPorNome(todasAsFolhas());
  const fora = regras.filter(r => !r.midias.length);
  /** o último valor de `prop` para o seletor exato, nas regras dadas */
  const valor = (sel: string, prop: string, rs: Regra[]) => {
    const ds = rs.filter(r => r.sels.includes(sel)).flatMap(r => r.decls).filter(d => d.prop === prop);
    return ds.length ? ds[ds.length - 1].valor : undefined;
  };
  const movem = (r: Regra) => r.decls.some(d => ehMovimento(d.prop) && !ehNada(d.valor));
  const naRegra = (re: RegExp) => regras.filter(r => r.sels.some(s => re.test(s)) && movem(r))
    .map(r => r.arquivo + ':' + r.linha + ' ' + r.sels.join(', ') + (r.midias.length ? ' @ ' + r.midias.join(' / ') : ''));

  // ---- 1. O COPO enche de baixo: um `::after` que escala na vertical a partir
  //      da base, cheio no `f`; a transição no portão, no tempo e na curva do
  //      lugar; nada sob "Reduzir" (ele aparece cheio) e nenhuma animação, que
  //      rodaria ao montar.
  const COPO = '.ag-copos i';
  assert.strictEqual(valor(COPO + '::after', 'transform', fora), 'scaleY(0)', 'o copo vazio: o preenchimento achatado');
  assert.strictEqual(valor(COPO + '::after', 'transform-origin', fora), 'bottom', 'e ele enche DE BAIXO');
  assert.strictEqual(valor(COPO + '::after', 'background', fora), 'var(--ins-tinta)');
  assert.strictEqual(valor(COPO + '::after', 'inset', fora), '0');
  assert.strictEqual(valor(COPO + '.f::after', 'transform', fora), 'none', 'o copo cheio: o preenchimento inteiro, parado');
  assert.strictEqual(valor(COPO, 'overflow', fora), 'hidden', 'o copo corta o preenchimento no contorno');
  assert.strictEqual(valor(COPO + '.f', 'background', fora), undefined,
    'o copo cheio pinta o fundo dele mesmo: o preenchimento apareceria de uma vez, por baixo do que enche');
  const doCopo = regras.filter(r => r.sels.some(s => s.includes('.ag-copos')) && movem(r));
  assert.deepStrictEqual(doCopo.filter(r => !NO_REDUZ(r)).map(r => [r.sels.join(', '), r.midias.join(' / '),
    r.decls.filter(d => ehMovimento(d.prop)).map(d => d.prop + ': ' + d.valor).join('; ')]),
    [[COPO + '::after', '@media (prefers-reduced-motion: no-preference)', 'transition: transform var(--ins-dur-lugar) var(--ins-curva)']],
    'o copo se move por UMA transição, no portão, só do preenchimento, no tempo e na curva do lugar');
  // sob "Reduzir", ele aparece cheio — ou, no máximo, só esmaece (o pedido aceita as duas)
  assert.deepStrictEqual(doCopo.filter(r => NO_REDUZ(r)).filter(r => r.decls.filter(d => ehMovimento(d.prop) && !ehNada(d.valor))
    .some(d => !(d.prop === 'transition' || d.prop === 'animation') ||
      !partesNoTopo(d.valor, ',').every(it => /var\(--ins-dur-dissolve\)/.test(it)) ||
      !oQueMove({ ...r, decls: [d] }, porNome).every(p => p === 'opacity'))).map(r => r.arquivo + ':' + r.linha),
    [], 'sob "Reduzir movimento" o copo não enche: aparece cheio, ou só esmaece');
  // os copos são o mesmo nó em todo render(): a transição dispara na troca do
  // `f`, e não ao montar
  assert.match(fonte('src/ui/telas/agora.jsx'), /<i key=\{i\} class=\{i < ag\.n \? 'f' : ''\} \/>/,
    'os copos mudaram de forma: a transição precisa de um nó por posição, que persiste');

  // ---- 2. A FORMA pousa: `.df.recem`, com `ins-pousa` no portão e
  //      `ins-acende` sob "Reduzir"; só a linha da refeição a recebe, com uma
  //      chave por estado; a leitura de volta e o dia aberto, não.
  const doNoPortao = (sel: string, re: (r: Regra) => boolean) =>
    animacoesOuTransicoes(sel, regras.filter(re));
  assert.deepStrictEqual(doNoPortao('.df.recem', NO_PORTAO), ['ins-pousa var(--ins-dur-lugar) var(--ins-curva) both'],
    'a forma pousa com o gesto do número da série, no tempo do lugar');
  assert.deepStrictEqual(doNoPortao('.df.recem', NO_REDUZ), ['ins-acende var(--ins-dur-dissolve) var(--ins-curva) both'],
    'sob "Reduzir movimento" a forma só acende');
  assert.deepStrictEqual(naRegra(/\.df\b/).filter(x => !/^\S+ \.df\.recem( @|$)/.test(x)), [],
    'outra regra move a forma da refeição');
  const agoraJsx = semComentariosJs(fonte('src/ui/telas/agora.jsx'));
  const formas = [...agoraJsx.matchAll(/<Forma\b[^>]*\/>/g)].map(m => m[0]);
  assert.deepStrictEqual(formas.filter(f => /\brecem\b/.test(f)),
    ['<Forma key={estado} marca={estado} recem={!treino && linha.recem === r.id} />'],
    'uma forma só pousa — a da linha —, num nó por estado');
  assert.ok(formas.some(f => /marca=\{volta\.estado\}/.test(f) && !/\brecem\b/.test(f)), 'a leitura de volta mostra a forma parada');
  assert.ok(!/\brecem\b/.test(fonte('src/ui/telas/dia.jsx')), 'o dia aberto não pousa nada');
  const mj = semComentariosJs(mainJsx());
  assert.match(mj, /recem: f && f\.data === d\.data && Date\.now\(\) - f\.t < VIDA_DO_RECEM_MS \? f\.id : null/,
    'a marca da forma vence sozinha, como a da série — sem ouvir o fim da animação');
  const vaiPara = (/vaiPara: function \(a\) \{[\s\S]*?\n {2}\},/.exec(mj) || [''])[0];
  const abreModo = (/function abreModo\(\) \{[\s\S]*?\n\}/.exec(mj) || [''])[0];
  assert.match(vaiPara, /view\.formaRecem = null;/, 'trocar de aba apaga a marca: a aba nasce inteira, e a forma pousaria de novo');
  assert.match(abreModo, /view\.formaRecem = null;/, 'entrar no modo também');

  // ---- 3. A FRASE DA ABERTURA espera para aparecer: duração zero, um atraso
  //      que é token, quadros só apagados — um degrau, sem esmaecer —, fora de
  //      toda `@media` (vale igual sob "Reduzir"), e só ela.
  const msg = regras.filter(r => r.sels.some(s => /(^|[\s>])\.msg\b/.test(s)));
  assert.deepStrictEqual(msg.filter(r => r.midias.length).map(r => r.arquivo + ':' + r.linha + ' ' + r.midias.join(' / ')), [],
    'a frase da abertura mora fora de toda @media: com e sem "Reduzir movimento" ela espera igual');
  const espera = msg.filter(r => r.sels.includes(ESPERA_DA_ABERTURA));
  assert.strictEqual(espera.length, 1, 'a espera da frase é uma regra só, `' + ESPERA_DA_ABERTURA + '`');
  assert.deepStrictEqual(espera[0].decls.filter(d => ehMovimento(d.prop)).map(d => d.prop + ': ' + d.valor).sort(),
    Object.keys(DECL_DA_ESPERA).map(p => p + ': ' + DECL_DA_ESPERA[p]).sort(),
    'a espera é o atraso e mais nada: sem duração (que esmaeceria), sem curva, sem transição');
  assert.deepStrictEqual(msg.filter(r => r !== espera[0] && movem(r)).map(r => r.arquivo + ':' + r.linha), [],
    'outra regra move a frase da abertura');
  const quadrosDaEspera = porNome.get('ins-espera') || [];
  assert.deepStrictEqual(quadrosDaEspera.map(q => q.arquivo), ['base.css'], 'os quadros da espera são um só, em base.css');
  const qs = quadrosDaEspera[0].quadros;
  assert.ok(qs.some(q => q.pos.includes(0)) && qs.some(q => q.pos.includes(100)) &&
    qs.every(q => q.decls.length === 1 && q.decls[0].prop === 'opacity' && q.decls[0].valor === '0'),
    'ins-espera: apagada do começo ao fim, e só opacidade — quando o atraso acaba ela aparece de uma vez');
  assert.deepStrictEqual(regras.filter(r => r.decls.some(d => /^animation(-name)?$/.test(d.prop) && /(?<![\w-])ins-espera(?![\w-])/.test(d.valor)))
    .flatMap(r => r.sels), [ESPERA_DA_ABERTURA], 'só a frase da abertura espera');
  const tok = /--ins-espera-abertura\s*:\s*(\d+)ms/.exec(semComentariosCss(fonte('src/tokens.css')));
  assert.ok(tok, '--ins-espera-abertura sumiu dos tokens, ou deixou de estar em ms');
  assert.ok(Number(tok![1]) >= 300 && Number(tok![1]) <= 400,
    'a frase aparece entre 300 e 400 ms (docs/motion/03 §6): menos volta a piscar, mais deixa a tela vazia numa espera de verdade (' + tok![1] + ')');
  assert.match(indexHtml(), /<div id="app"><div class="msg">Abrindo o registro…/,
    'a frase é o filho direto do #app, que o primeiro render() troca pelo app');

  // ---- 4. RÉGUA, TECLADO E RIR: nada se move neles, e o teclado recebe o foco
  //      sem rolar a página (01 A.5: a célula subia e uma tecla caía sob o dedo).
  assert.deepStrictEqual(naRegra(/\.(regua|tcl|rirscale|rirop|rirbtn)(?![\w])|\.(regua|tcl|rirscale)-/), [],
    'painel que nasce sob o polegar se move: o alvo tem de estar parado e tocável no primeiro quadro');
  const tecladoJsx = semComentariosJs(fonte('src/ui/instrumento/teclado.jsx'));
  const focos = [...tecladoJsx.matchAll(/\.focus\(([^)]*)\)/g)].map(m => m[1].trim());
  assert.deepStrictEqual(focos, ['{ preventScroll: true }'],
    'o teclado recebe o foco sem rolar a página: sem `preventScroll` o navegador o traz para a vista e a página salta');
  // ... e quem o traz inteiro para a tela, quando ele não cabe, é o casco: pelo
  // mínimo (`nearest`), de uma vez (`instant`), no desenho seguinte, e
  // descontando o que cobre a tela — o `scroll-margin` do `.tcl`
  const margem = valor('.tcl', 'scroll-margin-bottom', fora) || '';
  ['--ins-tabbar', '--ins-timer-h', '--ins-faixa-h'].forEach(v => assert.ok(margem.includes('var(' + v + ')'),
    'a área visível do teclado não desconta ' + v + ' (o rodapé cobriria a última fileira e o "pronto"): ' + margem));
  assert.ok(/var\(--ins-topo\)/.test(valor('.tcl', 'scroll-margin-top', fora) || ''), 'nem o que cobre o topo');
  const mostra = (/function mostraOTecladoInteiro\(\) \{[\s\S]*?\n\}/.exec(mj) || [''])[0];
  assert.match(mostra, /depoisDoLayout\(/, 'o teclado vem para a tela no desenho seguinte, depois do layout');
  assert.match(mostra, /scrollIntoView\(\{ block: 'nearest', inline: 'nearest', behavior: 'instant' \}\)/,
    'pelo mínimo, e de uma vez: rolagem programática é sempre um salto');
  const abrem = (mj.match(/view\.teclado = \{ alvo:/g) || []).length;
  const chamam = (mj.match(/\n\s*mostraOTecladoInteiro\(\);/g) || []).length;
  assert.ok(abrem >= 6 && chamam === abrem, 'todo lugar que abre o teclado o traz inteiro para a tela: ' + abrem + ' abrem, ' + chamam + ' chamam');
});
