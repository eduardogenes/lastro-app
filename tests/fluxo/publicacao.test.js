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
  assert.ok(/k !== CACHE/.test(sw) && /caches\.delete\(k\)/.test(sw),
    'sem limpeza, cada publicação deixaria um cache órfão no aparelho');
});

test('o cache de fotos sobrevive à publicação', () => {
  // O nome do cache do build muda a cada publicação. Apagar tudo que não é o
  // atual levaria junto as fotos que ele tirou dos aparelhos da academia — e
  // essas não têm como ser refeitas por um build.
  const sw = dist('sw.js');
  assert.ok(/k !== FOTOS/.test(sw), 'a limpeza precisa poupar o cache de fotos');
});

test('o precache não dispara tudo de uma vez', () => {
  // Requisição por arquivo no mesmo instante, com sinal ruim, derruba as do fim
  // da fila — e o catch de tolerância engole cada falha em silêncio. O app
  // instala, se declara pronto, e o buraco só aparece offline.
  const sw = dist('sw.js');
  assert.ok(!/Promise\.all\(LOCAIS\.map/.test(sw), 'o precache não pode ser em paralelo total');
  assert.ok(/guardaEmFila/.test(sw), 'busca em fila, com largura limitada');
});

test('os ícones e o manifesto chegam ao dist', () => {
  ['manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png',
   'icone-512-mascara.png'].forEach(function (f) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'dist', f)), 'faltou no build: ' + f);
  });
});

test('o vercel.json só usa chaves que o schema aceita', () => {
  // A Vercel valida o schema em modo estrito e RECUSA O BUILD com chave
  // desconhecida. Aconteceu com um "comment" que eu tinha posto para explicar
  // as regras: erro que só aparece no deploy, quando já é tarde. A explicação
  // mora no README; aqui só entra o que o schema conhece.
  const v = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));

  const raiz = ['$schema', 'cleanUrls', 'outputDirectory', 'buildCommand',
                'headers', 'redirects', 'rewrites', 'trailingSlash', 'framework',
                'installCommand', 'devCommand', 'regions'];
  Object.keys(v).forEach(function (k) {
    assert.ok(raiz.includes(k), 'chave desconhecida na raiz do vercel.json: ' + k);
  });

  v.headers.forEach(function (regra) {
    Object.keys(regra).forEach(function (k) {
      assert.ok(['source', 'headers', 'has', 'missing'].includes(k),
        'chave desconhecida numa regra de header: ' + k);
    });
    regra.headers.forEach(function (h) {
      assert.deepStrictEqual(Object.keys(h).sort(), ['key', 'value'],
        'um header só tem key e value');
    });
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
