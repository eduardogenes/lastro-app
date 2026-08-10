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

test('a paleta do projeto está inteira e mora nos tokens', () => {
  const tokens = fs.readFileSync(path.join(RAIZ, 'src', 'tokens.css'), 'utf8');
  const paleta = {
    '--night': '#0D1520', '--dusk': '#15202E', '--raise': '#1C2A3B',
    '--line': '#26374C', '--paper': '#E9EFF6', '--mist': '#8DA0B8',
    '--dim': '#48607C', '--dawn': '#F5A83C', '--ember': '#E8734A'
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
