// Monta a página "Mapa do Lastro" a partir de docs/mapa/*.md.
// Precisa do marked: `npm i --no-save marked@12.0.2` na raiz do repositório.
// uso: node docs/mapa/_pagina/monta.mjs . <saída.html> docs/mapa/_pagina/molde.html
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { marked } = require('marked');

const [raiz, saida, molde] = process.argv.slice(2);
const DOCS = [
  ['00', '00-visao-geral.md', 'Visão geral'],
  ['01', '01-fundacao.md', 'Fundação e plataforma'],
  ['02', '02-sincronia.md', 'Sincronia e nuvem'],
  ['03', '03-sessao-de-treino.md', 'A sessão de treino'],
  ['04', '04-programa.md', 'Programa e prescrição'],
  ['05', '05-aula-do-box.md', 'A aula do box'],
  ['06', '06-comida.md', 'Comida'],
  ['07', '07-corpo.md', 'Corpo e medidas'],
  ['08', '08-fotos-do-corpo.md', 'Fotos do corpo'],
  ['09', '09-semana.md', 'A Semana e a regra'],
  ['10', '10-agora.md', 'O Agora'],
  ['11', '11-dias.md', 'Dias'],
  ['inv', '_inventario.md', 'Inventário do código'],
];
const arquivoParaId = Object.fromEntries(DOCS.map(([id, f]) => [f, id]));

const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = s => semAcento(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'secao';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const diagramas = [];
const artigos = [];
const nav = [];

for (const [id, arquivo, nome] of DOCS) {
  let md = readFileSync(`${raiz}/docs/mapa/${arquivo}`, 'utf8');
  // Os blocos mermaid saem do markdown e viram um marcador; o texto vai numa lista à parte.
  md = md.replace(/^```mermaid\n([\s\S]*?)^```\s*$/gm, (_, src) => {
    const i = diagramas.length;
    diagramas.push(src.trimEnd());
    return `\n<figure class="diagrama" data-d="${i}"></figure>\n`;
  });
  const usados = new Map();
  const titulos = [];
  const r = new marked.Renderer();
  r.heading = (texto, nivel, cru) => {
    let base = `d${id}-${slug(cru)}`;
    const n = usados.get(base) || 0; usados.set(base, n + 1);
    const hid = n ? `${base}-${n + 1}` : base;
    if (nivel === 1) return `<h1 id="d${id}-topo">${texto}</h1>\n`;
    if (nivel <= 3) titulos.push({ nivel, hid, texto: texto.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') });
    return `<h${nivel} id="${hid}">${texto}</h${nivel}>\n`;
  };
  r.link = (href, titulo, texto) => {
    const m = /^([\w-]+\.md)(#.*)?$/.exec(href || '');
    if (m) {
      const alvo = arquivoParaId[m[1]];
      if (alvo) return `<a href="#d${alvo}" class="interno">${texto}</a>`;
      return `<code>${texto}</code>`;
    }
    if (/^https?:/.test(href)) return `<a href="${esc(href)}" target="_blank" rel="noopener">${texto}</a>`;
    return texto;
  };
  r.table = (cabeca, corpo) => `<div class="tabela"><table><thead>${cabeca}</thead><tbody>${corpo}</tbody></table></div>\n`;
  let html = marked.parse(md, { renderer: r, gfm: true });
  // "área 03" vira link para a área, fora de código, links, títulos e figuras.
  let dentro = 0;
  html = html.split(/(<[^>]+>)/).map(peca => {
    if (peca.startsWith('<')) {
      if (/^<(code|a|pre|figure|h[1-6])\b/i.test(peca)) dentro++;
      else if (/^<\/(code|a|pre|figure|h[1-6])>/i.test(peca)) dentro--;
      return peca;
    }
    if (dentro > 0) return peca;
    return peca.replace(/(?<![\p{L}\p{N}_])([áÁ]reas?) (0[1-9]|1[01])(?!\p{N})/gu,(t, p, n) => `<a href="#d${n}" class="interno area">${p} ${n}</a>`);
  }).join('');
  const frase = (/^>\s*Em uma frase:\s*([\s\S]*?)(?:\n\n|\n[^>])/m.exec(md) || [, ''])[1].replace(/\n>\s*/g, ' ').trim();
  artigos.push(`<article class="doc" id="d${id}" data-nome="${esc(nome)}"${id === '00' ? '' : ' hidden'}>\n${html}\n</article>`);
  nav.push({ id, nome, frase, titulos, diagramas: (html.match(/class="diagrama"/g) || []).length });
}

let pagina = readFileSync(molde, 'utf8');
const json = s => JSON.stringify(s).replace(/</g, '\\u003c');
pagina = pagina
  .replace('<!--ARTIGOS-->', () => artigos.join('\n'))
  .replace('/*DIAGRAMAS*/', () => json(diagramas))
  .replace('/*NAV*/', () => json(nav));
writeFileSync(saida, pagina);
console.log(`${artigos.length} documentos, ${diagramas.length} diagramas, ${(pagina.length / 1024).toFixed(0)} KB`);
