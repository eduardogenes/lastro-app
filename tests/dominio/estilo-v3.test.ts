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

test('a porta do movimento lê só tokens que existem, e cada sentido tem o seu movimento', () => {
  const tokens = semComentarios(ler('src/v3/tokens.css'));
  const porta = ler('src/ui/movimento.js') + ler('src/main.jsx');
  const lidos = [...porta.matchAll(/(?:tempo|tempoDoMovimento)\('(--[a-z0-9-]+)'\)/g)].map(m => m[1]);
  assert.ok(lidos.length > 0, 'a porta lê algum token');
  lidos.forEach(t => assert.ok(new RegExp(t + ':').test(tokens), t + ' não existe em src/v3/tokens.css'));
  const mov = semComentarios(ler('src/v3/movimento.css'));
  ['lugar', 'entra', 'sai', 'sobe', 'desce', 'passo', 'fica'].forEach(s =>
    assert.ok(mov.includes('html[data-nav="' + s + '"]'), 'sem movimento para o sentido ' + s));
  // os valores do movimento vêm dos tokens: nenhuma duração solta
  assert.deepStrictEqual(mov.match(/\b\d+m?s\b/g) || [], []);
});

test('nada zera as transições de vista: o movimento entre telas está ligado', () => {
  FOLHAS_V3.filter(f => !f.endsWith('/movimento.css')).forEach(f => {
    assert.ok(!/::view-transition/.test(semComentarios(ler(f))), f + ' mexe na transição de vista fora de movimento.css');
  });
});

test('os tokens do app são os do design system: os mesmos nomes e valores', () => {
  // só os nomes das fontes mudam: o app usa as variáveis que ele carrega
  const pares = (css: string) => new Map([...semComentarios(css).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)]
    .filter(m => !/^--f-/.test(m[1])).map(m => [m[1], m[2].trim()] as [string, string]));
  const ds = pares(ler('docs/design-system/tokens.css'));
  const app = pares(ler('src/v3/tokens.css'));
  assert.deepStrictEqual([...app.entries()].sort(), [...ds.entries()].sort());
});

test('a nota dos lugares usa o espaço disponível e a do cabeçalho com Voltar ocupa até 45%', () => {
  const css = semComentarios(ler('src/v3/fotos.css'));
  assert.match(css, /\.v3-cab \.v3-cab-n\s*\{[^}]*max-width:\s*45%;/);
  assert.match(css, /\.v3-cab\.raiz \.v3-cab-n\s*\{[^}]*max-width:\s*none;/);
});

test('a página viva usa as mesmas regras da grade e da legenda de Dias que o app', () => {
  const grade = (fonte: string) => fonte.match(/\.v3-cal \{[\s\S]*?(?=\.v3-dias \.v3-cal-det \{)/)?.[0];
  const app = grade(ler('src/v3/fotos.css'));
  assert.ok(app);
  assert.equal(grade(ler('docs/design-system/lastro.html')), app);
});

test('a primeira vez reserva a saída no rodapé e usa os tokens de espaço da referência', () => {
  const app = semComentarios(ler('src/v3/componentes.css'));
  const referencia = ler('docs/design-system/lastro.html');
  assert.match(app, /\.v3-inicio \.v3-saida\s*\{[^}]*margin-top:\s*0;/);
  assert.match(app, /\.v3-escolha\s*\{[^}]*padding:\s*var\(--e-7\) var\(--lateral-escolha\)/);
  assert.match(app, /\.v3-escolha small\s*\{[^}]*margin-top:\s*var\(--e-0\)/);
  assert.match(referencia, /\.esc\{[^}]*padding:var\(--e-7\) var\(--lateral-escolha\)/);
  assert.match(referencia, /\.tela\{[^}]*padding-bottom:var\(--respiro-inferior\)/);
});

test('escolha única é radiogroup: o seletor, as fichas com escolha e a pergunta', () => {
  const base = ler('src/ui/v3/base.jsx');
  assert.match(base, /role="radiogroup"/);
  assert.match(base, /'aria-checked'/);
  const css = semComentarios(ler('src/v3/componentes.css'));
  assert.ok(!/\.v3-sel button\[aria-pressed/.test(css), 'o seletor não usa mais aria-pressed');
});

test('a galeria oferece os mesmos caminhos Phosphor regular do app, com preenchimento na grade de 256', () => {
  const desenhos = (s: string) => Object.fromEntries([...s.matchAll(/^  (\w+): I\('([^']+)'\)/gm)].map(m => [m[1], m[2]]));
  const app = ler('src/ui/v3/icones.jsx'), pagina = ler('docs/design-system/ds-base.js');
  const icones = desenhos(app);
  for (const k of ['hoje', 'dias', 'corpo', 'semana', 'plano', 'mais', 'ok', 'pula', 'troca', 'tripe', 'nivel',
    'agua', 'peso', 'medida', 'cardio', 'manha', 'tarde', 'noite']) assert.match(icones[k], /^M/);
  assert.deepEqual(desenhos(pagina), icones);
  assert.match(app, /viewBox="0 0 256 256" fill="currentColor"/);
  assert.doesNotMatch(app, /\bstroke[=-]/);
});
