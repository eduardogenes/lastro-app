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
  assert.ok(/const CACHE = 'lastro-[0-9a-f]{12}';/.test(sw), 'a versão vem do hash do build');
});

test('o hash do cache cobre o que não passa pelo rollup', () => {
  // O `bundle` do rollup tem só o js e o css: o index.html e o `public/` — onde
  // vivem manifesto, ícones e metatags — ficam de fora. Enquanto o hash os
  // ignorava, publicar uma troca de ícone deixava o sw.js byte a byte igual ao
  // anterior, o navegador não via versão nova nenhuma, e o aparelho continuava
  // servindo o passado. É o mesmo silêncio que este arquivo existe para pegar.
  const cfg = fs.readFileSync(path.join(RAIZ, 'vite.config.js'), 'utf8');
  assert.match(cfg, /soma\.update\(readFileSync\('index\.html'\)\)/,
    'o index.html saiu do hash do cache');
  assert.match(cfg, /readdirSync\('public'/, 'o public/ saiu do hash do cache');
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
  assert.ok(/FOTOS\.indexOf\(k\) < 0/.test(sw), 'a limpeza precisa poupar os caches de fotos');
  assert.ok(/const FOTOS = \['lastro-fotos', 'treino-fotos'\];/.test(sw),
    'o nome antigo tem que sobreviver até a página migrar os bytes');
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
  ['manifest.webmanifest', 'icone.svg', 'icone-32.png', 'icone-180.png',
   'icone-192.png', 'icone-512.png', 'icone-192-mascara.png',
   'icone-512-mascara.png'].forEach(function (f) {
    assert.ok(fs.existsSync(path.join(RAIZ, 'dist', f)), 'faltou no build: ' + f);
  });
});

test('todo ícone declarado existe e está no precache', () => {
  // `public/` não passa pelo rollup, então a lista do precache é escrita à mão
  // em vite.config.js. Declarar um ícone no index ou no manifesto e esquecer
  // dessa lista não quebra nada online — deixa o buraco para o dia em que o
  // aparelho abrir sem rede, que é o dia para o qual este app foi feito.
  const sw = dist('sw.js');
  const html = dist('index.html');

  const doHtml = (html.match(/<link[^>]*>/g) || [])
    .filter(t => /rel="(icon|apple-touch-icon)"/.test(t))
    .map(t => (t.match(/href="\.?\/([^"]+)"/) || [])[1]);
  const doManifesto = JSON.parse(dist('manifest.webmanifest')).icons.map(i => i.src);

  const declarados = [...new Set(doHtml.concat(doManifesto))];
  assert.ok(declarados.length >= 7, 'o conjunto de ícones encolheu: ' + declarados.length);
  declarados.forEach(function (f) {
    assert.ok(f, 'link de ícone sem href legível');
    assert.ok(fs.existsSync(path.join(RAIZ, 'dist', f)), 'declarado e inexistente: ' + f);
    assert.ok(sw.includes('./' + f), 'fora do precache: ' + f);
  });
});

test('o manifesto separa o ícone comum do mascarável', () => {
  // O mesmo arquivo nos dois `purpose` é o erro clássico. A arte cheia chega a
  // 94% do raio da zona segura, e o recorte do sistema é uma forma qualquer —
  // não o círculo de referência: o símbolo encosta na borda. O mascarável recua
  // 18% e para em 77%, com folga. São dois arquivos porque são duas artes.
  const icons = JSON.parse(dist('manifest.webmanifest')).icons;
  ['any', 'maskable'].forEach(function (p) {
    ['192x192', '512x512'].forEach(function (t) {
      assert.ok(icons.some(i => i.purpose === p && i.sizes === t),
        'faltou ícone ' + p + ' de ' + t);
    });
  });
  const comuns = icons.filter(i => i.purpose === 'any').map(i => i.src);
  const mascaras = icons.filter(i => i.purpose === 'maskable').map(i => i.src);
  assert.deepStrictEqual(comuns.filter(s => mascaras.includes(s)), [],
    'o mesmo arquivo em any e maskable: um dos dois vai sair errado');
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
