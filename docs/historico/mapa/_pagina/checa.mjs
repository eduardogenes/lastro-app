// Renderiza cada bloco mermaid dos documentos e relata os que quebram.
// Precisa do mermaid: `npm i --no-save mermaid@11.12.0` na raiz do repositório.
// uso: node docs/mapa/_pagina/checa.mjs docs/mapa/*.md
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const arquivos = process.argv.slice(2);
const blocos = [];
for (const f of arquivos) {
  const linhas = readFileSync(f, 'utf8').split('\n');
  let dentro = false, ini = 0, buf = [];
  linhas.forEach((l, i) => {
    if (!dentro && l.trim() === '```mermaid') { dentro = true; ini = i + 1; buf = []; return; }
    if (dentro && l.trim() === '```') { dentro = false; blocos.push({ f, linha: ini, src: buf.join('\n') }); return; }
    if (dentro) buf.push(l);
  });
}
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ path: require.resolve('mermaid/dist/mermaid.min.js') });
await page.evaluate(() => mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' }));
let ruins = 0;
for (const [i, b] of blocos.entries()) {
  const r = await page.evaluate(async ([src, i]) => {
    try { await mermaid.render('g' + i, src); return null; } catch (e) { return String(e && e.message || e).slice(0, 400); }
  }, [b.src, i]);
  const nos = (b.src.match(/^\s*[A-Za-z0-9_]+\s*[\[\(\{]/gm) || []).length;
  if (r) { ruins++; console.log(`QUEBRA ${b.f}:${b.linha}\n  ${r.replace(/\n/g, '\n  ')}`); }
  else if (nos > 34) console.log(`GRANDE ${b.f}:${b.linha} (${nos} nós)`);
}
console.log(`${blocos.length} blocos, ${ruins} quebrados`);
await browser.close();
