// A COBERTURA DO VISUAL NOVO: toda camada que o app abre (`camadasAbertas`) e
// toda folha que ele empilha têm a sua versão em `src/ui/v3/telas.js`. É o
// prerrequisito da Fase 5 (docs/redesign-3/00-plano.md): apagar o visual
// antigo não pode deixar porta que abra para o nada. Uma camada ou folha nova
// sem versão nova reprova aqui.

import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.join(__dirname, '..', '..');
const ler = (rel: string) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

/** As chaves de um objeto literal `export const NOME = { … };` de telas.js. */
function chavesDe(fonte: string, nome: string): Set<string> {
  const ini = fonte.indexOf('export const ' + nome);
  const corpo = fonte.slice(fonte.indexOf('{', ini) + 1, fonte.indexOf('};', ini));
  return new Set([...corpo.replace(/\/\/.*$/gm, '').matchAll(/([a-zA-Z]+)\s*:/g)].map(m => m[1]));
}

const TELAS = ler('src/ui/v3/telas.js');
const DESTINOS = chavesDe(TELAS, 'DESTINOS_V3');
const FOLHAS = chavesDe(TELAS, 'FOLHAS_V3');

// O que o visual novo dispensa de propósito, com a razão (plano, "Antes da Fase 5").
const DISPENSADAS: Record<string, string> = {
  peso: 'a régua do Corpo pesa',
  pesoRapido: 'o peso no descanso: a régua do Corpo',
  decidir: 'decidir a mudança: a revisão, no Programa'
};

test('toda camada que o app abre tem tela no visual novo', () => {
  const nav = ler('src/ui/navegacao.js');
  const camadas = new Set([...nav.matchAll(/c\.push\('([a-zA-Z]+)'\)/g)].map(m => m[1]));
  // a folha, o pare e a falha não são destinos: têm o seu próprio desenho
  ['pare', 'falhou'].forEach(k => camadas.delete(k));
  const faltam = [...camadas].filter(k => !DESTINOS.has(k));
  assert.deepStrictEqual(faltam, []);
});

test('toda folha que o app empilha tem versão no visual novo', () => {
  const main = ler('src/main.jsx');
  const abertas = new Set([
    ...[...main.matchAll(/abreFolha\(\{\s*k:\s*'([a-zA-Z]+)'/g)].map(m => m[1]),
    ...[...main.matchAll(/trocaFolha\(\{\s*k:\s*'([a-zA-Z]+)'/g)].map(m => m[1]),
    ...[...main.matchAll(/pilha\(\)\.push\(\{\s*k:\s*'([a-zA-Z]+)'/g)].map(m => m[1])
  ]);
  // e as que as telas novas abrem
  const anda = (dir: string): string[] => fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })
    .flatMap(e => e.isDirectory() ? anda(dir + '/' + e.name) : /\.jsx?$/.test(e.name) ? [dir + '/' + e.name] : []);
  anda('src/ui/v3').forEach(f => {
    [...ler(f).matchAll(/(?:abreFolha|trocaFolha)\(\{\s*k:\s*'([a-zA-Z]+)'/g)].forEach(m => abertas.add(m[1]));
  });
  const faltam = [...abertas].filter(k => !FOLHAS.has(k) && !(k in DISPENSADAS));
  assert.deepStrictEqual(faltam, []);
});

test('as dispensadas não são abertas por nenhuma tela nova', () => {
  const anda = (dir: string): string[] => fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true })
    .flatMap(e => e.isDirectory() ? anda(dir + '/' + e.name) : /\.jsx?$/.test(e.name) ? [dir + '/' + e.name] : []);
  const abrem: string[] = [];
  const portas: Record<string, RegExp> = {
    peso: /abreRegistroDePeso/, pesoRapido: /abrePesoNoDescanso/, decidir: /abreDecisao/
  };
  anda('src/ui/v3').forEach(f => {
    const fonte = ler(f);
    Object.keys(portas).forEach(k => { if (portas[k].test(fonte)) abrem.push(f + ' → ' + k); });
  });
  assert.deepStrictEqual(abrem, []);
});
