// O que é publicado.
//
// Existe por um modo de falha específico e silencioso: o service worker tinha
// um `const CACHE = 'treino-v28'` que precisava ser incrementado à mão a cada
// publicação. Esquecer significava publicar e o iPhone continuar servindo a
// versão antiga — sem erro, sem tela quebrada, só o app parado no tempo. O
// número agora vem do hash do build, e estes testes cobram isso.

import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = f => fs.readFileSync(path.join(RAIZ, 'dist', f), 'utf8');

test('o service worker sai do build com versão e lista preenchidas', () => {
  const sw = dist('sw.js');
  assert.ok(!sw.includes('__CACHE__'), 'molde não substituído');
  assert.ok(!sw.includes('__LOCAIS__'), 'molde não substituído');
  assert.ok(/const CACHE = 'treino-[0-9a-f]{12}';/.test(sw), 'a versão vem do hash do build');
});

test('o precache lista exatamente os assets que o build emitiu', () => {
  const sw = dist('sw.js');
  const emitidos = fs.readdirSync(path.join(RAIZ, 'dist', 'assets'))
    .filter(f => !f.endsWith('.map'));
  assert.ok(emitidos.length > 0, 'o build não emitiu asset nenhum');
  emitidos.forEach(function (f) {
    assert.ok(sw.includes('./assets/' + f), 'fora do precache: ' + f);
  });
  assert.ok(!/\.map"/.test(sw), 'sourcemap não vai para o cache do aparelho');
});

test('o index publicado aponta para os assets que existem', () => {
  const html = dist('index.html');
  const refs = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(refs.length >= 2, 'esperado ao menos o js e o css');
  refs.forEach(function (r) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'dist', r)), 'referência quebrada: ' + r);
  });
});

test('o app abre offline: navegação resolve para o index em cache', () => {
  const sw = dist('sw.js');
  assert.ok(/req\.mode === 'navigate'/.test(sw));
  assert.ok(/caches\.match\('\.\/index\.html'\)/.test(sw),
    'sem isso, abrir sem rede no subsolo da academia dá tela de erro');
});

test('o cache velho é apagado ao ativar a versão nova', () => {
  const sw = dist('sw.js');
  assert.ok(/ks\.filter\(k => k !== CACHE\)\.map\(k => caches\.delete\(k\)\)/.test(sw),
    'sem limpeza, cada publicação deixaria um cache órfão no aparelho');
});

test('os ícones e o manifesto chegam ao dist', () => {
  ['manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png',
   'icone-512-mascara.png'].forEach(function (f) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'dist', f)), 'faltou no build: ' + f);
  });
});

test('os cabeçalhos de cache distinguem o que tem hash do que não tem', () => {
  const v = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));
  const regra = s => v.headers.find(h => h.source === s);
  const valor = (s, k) => regra(s).headers.find(h => h.key === k).value;

  assert.ok(/immutable/.test(valor('/assets/(.*)', 'Cache-Control')),
    'asset com hash pode ser guardado para sempre');
  ['/sw.js', '/index.html', '/manifest.webmanifest'].forEach(function (s) {
    assert.ok(/must-revalidate/.test(valor(s, 'Cache-Control')),
      s + ' aponta para os assets e não pode ficar preso em cache');
  });
});
