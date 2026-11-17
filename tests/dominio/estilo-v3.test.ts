// A guarda de estilo do visual novo (direção 3). As regras são do DESIGN.md;
// a estratégia, de docs/redesign-3/01-testes.md. O visual antigo tem a guarda
// dele em `estilo.test.ts`, e as duas não se misturam.

import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.join(__dirname, '..', '..');
const ler = (rel: string) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const semComentarios = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const FOLHAS_V3 = fs.readdirSync(path.join(RAIZ, 'src', 'v3')).filter(f => f.endsWith('.css')).map(f => 'src/v3/' + f);
// as telas ficam em `src/ui/v3/telas/`: a guarda olha a pasta inteira
const JSX_V3 = (function anda(dir: string): string[] {
  return fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? anda(dir + '/' + e.name) : /\.(jsx|js)$/.test(e.name) ? [dir + '/' + e.name] : []);
})('src/ui/v3');

test('cor só nos tokens: fora de src/v3/tokens.css, nenhum hexadecimal, rgb ou hsl solto', () => {
  const soltas: string[] = [];
  FOLHAS_V3.filter(f => !f.endsWith('/tokens.css')).forEach(f => {
    const css = semComentarios(ler(f));
    (css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g) || []).forEach(m => soltas.push(f + ': ' + m));
  });
  JSX_V3.forEach(f => {
    (ler(f).match(/#[0-9a-fA-F]{6}\b|rgba?\(/g) || []).forEach(m => soltas.push(f + ': ' + m));
  });
  assert.deepStrictEqual(soltas, []);
});

test('o visual novo não usa classe do antigo, e o antigo não usa classe do novo', () => {
  const misturas: string[] = [];
  JSX_V3.forEach(f => { if (/class(Name)?=\{?["'`][^"'`]*\bins-/.test(ler(f))) misturas.push(f); });
  const antigos: string[] = [];
  const anda = (dir: string) => fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).forEach(e => {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) { if (e.name !== 'v3') anda(rel); }
    else if (/\.jsx$/.test(e.name)) antigos.push(rel);
  });
  anda('src/ui');
  antigos.forEach(f => { if (/class(Name)?=\{?["'`][^"'`]*\bv3-/.test(ler(f))) misturas.push(f); });
  assert.deepStrictEqual(misturas, []);
});

test('sem tema escuro: o visual novo é claro sempre', () => {
  FOLHAS_V3.forEach(f => {
    const css = semComentarios(ler(f));
    assert.ok(!/prefers-color-scheme:\s*dark/.test(css), f + ': tema escuro');
    assert.ok(!/data-theme="?dark/.test(css), f + ': tema escuro');
  });
});

test('texto que se lê nunca abaixo de 12 px', () => {
  const pequenos: string[] = [];
  FOLHAS_V3.forEach(f => {
    const css = semComentarios(ler(f));
    for (const m of css.matchAll(/(?:font-size:\s*|font:\s*\d{3}\s+)(\d+(?:\.\d+)?)px/g)) {
      if (Number(m[1]) < 12) pequenos.push(f + ': ' + m[0]);
    }
  });
  assert.deepStrictEqual(pequenos, []);
});

test('ícone é desenho: nenhum emoji nem símbolo de texto fazendo papel de ícone', () => {
  const achados: string[] = [];
  JSX_V3.filter(f => !f.endsWith('galeria.jsx')).forEach(f => {
    const txt = ler(f).replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    (txt.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}⚙✓✔✕✖›‹→←↑↓]/gu) || []).forEach(m => achados.push(f + ': ' + m));
  });
  assert.deepStrictEqual(achados, []);
});

test('"reduzir movimento" desliga animação e transição do visual novo', () => {
  const base = semComentarios(ler('src/v3/base.css'));
  const bloco = base.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(bloco, 'há um bloco de reduzir movimento');
  assert.match(bloco![1], /animation:\s*none/);
  assert.match(bloco![1], /transition-duration:\s*\.01ms/);
});
