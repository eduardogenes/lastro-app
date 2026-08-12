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
const css = ['tokens.css', 'app.css']
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
  const app = fs.readFileSync(path.join(RAIZ, 'src', 'app.css'), 'utf8');
  const soltas = [...new Set((app.match(/#[0-9A-Fa-f]{6}\b/g) || []))];
  assert.deepStrictEqual(soltas, [],
    'hexadecimal fora de tokens.css: dê um nome a ele antes de usar');
});

test('tela cheia usa svh, não vh', () => {
  // 100vh no iOS é a viewport GRANDE, com a barra do navegador recolhida:
  // sobra um trecho rolável do tamanho da barra e o fundo do body aparece.
  const app = fs.readFileSync(path.join(RAIZ, 'src', 'app.css'), 'utf8');
  const alturas = [...app.matchAll(/(?:min-)?height:\s*100vh/g)];
  alturas.forEach(m => {
    const depois = app.slice(m.index!, m.index! + 200);
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

test('a paleta antiga só existe apontando para a nova', () => {
  // O bloco legado sobrevive porque as telas ainda não convertidas usam os
  // nomes dele. Mas nenhum deles pode carregar VALOR próprio: se carregasse, o
  // produto voltaria a ter duas paletas, e foi assim que ele parecia dois
  // sistemas colados. Cada nome antigo aponta para um token do Instrumento.
  const tokens = fs.readFileSync(path.join(RAIZ, 'src', 'tokens.css'), 'utf8');
  const legado = tokens.slice(tokens.indexOf('LEGADO'));
  const comValor = [...legado.matchAll(/(--[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,8})/g)];
  assert.deepStrictEqual(comValor.map(m => m[1] + ':' + m[2]), [],
    'token legado com cor própria: aponte para o Instrumento');
  assert.ok(/--dawn:\s*var\(--ins-acid\)/.test(legado), 'o acento antigo vira ácido');
});
