// Gera supabase/migrations/20261123120100_catalogo_semente.sql a partir da
// semente do app (src/dominio/catalogo.ts). A semente é a fonte; o SQL é
// derivado e não se edita à mão.
//
//   npm run catalogo:sql
//
// `on conflict do nothing`, escolhido (docs/catalogo/00-desenho.md): rodar de
// novo não desfaz o que o moderador curou no banco. Exercício NOVO na semente
// entra; exercício que já existe se corrige NO BANCO, pelo moderador — mudar a
// semente não chega a quem já tem a linha. A versão do banco sobe sozinha a
// cada linha gravada (gatilho), e não tem relação com a versão da semente.

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EQUIPAMENTOS, MOVIMENTOS, SEMENTE, VERSAO_DA_SEMENTE, paraLinha } from '../../src/dominio/catalogo';
import { CURADORIA } from '../../src/dominio/catalogo-curadoria';

const DESTINO = resolve(__dirname, '../../supabase/migrations/20261123120100_catalogo_semente.sql');
const DESTINO_CURADORIA = resolve(__dirname, '../../supabase/migrations/20261125120000_catalogo_curadoria.sql');

function lit(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return "'" + v.replace(/'/g, "''") + "'";
  throw new Error('valor sem SQL: ' + JSON.stringify(v));
}
function arr(v: string[]): string { return v.length ? 'array[' + v.map(lit).join(', ') + ']::text[]' : "'{}'::text[]"; }

const linhas: string[] = [];
linhas.push('-- GERADO por ferramentas/catalogo/gera-sql.ts a partir da semente (conteúdo versão ' + VERSAO_DA_SEMENTE + ').');
linhas.push('-- Não edite à mão: mude src/dominio/catalogo-semente.ts e rode `npm run catalogo:sql`.');
linhas.push('-- Rode DEPOIS de 20261123120000_catalogo.sql, no SQL Editor do Supabase.');
linhas.push('');
linhas.push('begin;');
linhas.push('');
linhas.push('insert into public.catalogo_movimento (id, nome) values');
linhas.push(Object.keys(MOVIMENTOS).map(id => '  (' + lit(id) + ', ' + lit(MOVIMENTOS[id]) + ')').join(',\n'));
linhas.push('on conflict (id) do nothing;');
linhas.push('');
linhas.push('insert into public.catalogo_equipamento (id, nome, carga) values');
linhas.push(Object.keys(EQUIPAMENTOS).map(id => '  (' + lit(id) + ', ' + lit(EQUIPAMENTOS[id].n) + ', ' + lit(EQUIPAMENTOS[id].car) + ')').join(',\n'));
linhas.push('on conflict (id) do nothing;');
linhas.push('');
const COLS = ['id', 'nome', 'alt', 'movimento', 'equipamento', 'grupo', 'musculos', 'carga', 'unidade', 'quantidade',
  'composto', 'unilateral', 'equivalentes', 'dica', 'pegada', 'pegada_pe', 'substituto', 'curadoria'];
linhas.push('insert into public.catalogo_exercicio (' + COLS.join(', ') + ') values');
const ids = Object.keys(SEMENTE.ex).sort();
linhas.push(ids.map(function (id) {
  const r = paraLinha(SEMENTE.ex[id]);
  return '  (' + COLS.map(function (c) {
    const v = r[c];
    if (c === 'alt' || c === 'equivalentes') return arr(v as string[]);
    if (c === 'musculos') return lit(JSON.stringify(v)) + '::jsonb';
    return lit(v);
  }).join(', ') + ')';
}).join(',\n'));
linhas.push('on conflict (id) do nothing;');
linhas.push('');
linhas.push('commit;');
linhas.push('');

writeFileSync(DESTINO, linhas.join('\n'));
console.log('escrito', DESTINO, '(' + ids.length + ' exercícios)');

// A curadoria (catalogo-curadoria.ts) chega ao banco por UPDATE: a semente não
// sobrescreve linha que já existe. Só as colunas que a curadoria toca, com o
// valor final da semente: rodar de novo dá o mesmo resultado. Carga, grandeza e
// id nunca entram aqui (o gatilho catalogo_carimba recusaria a troca).
const up: string[] = [];
up.push('-- GERADO por ferramentas/catalogo/gera-sql.ts (curadoria, conteúdo versão ' + VERSAO_DA_SEMENTE + ').');
up.push('-- Rode como moderador no SQL Editor do Supabase, DEPOIS da semente. Pode rodar de novo.');
up.push('-- Muda só alt, musculos, dica, equivalentes e a marca de curadoria dos exercícios abaixo.');
up.push('');
up.push('begin;');
up.push('');
Object.keys(CURADORIA).sort().forEach(function (id) {
  const r = paraLinha(SEMENTE.ex[id]);
  up.push('update public.catalogo_exercicio set alt = ' + arr(r.alt as string[]) +
    ', musculos = ' + lit(JSON.stringify(r.musculos)) + '::jsonb' +
    ', dica = ' + lit(r.dica) +
    ', equivalentes = ' + arr(r.equivalentes as string[]) +
    ', curadoria = ' + lit(r.curadoria) +
    ' where id = ' + lit(id) + ';');
});
up.push('');
up.push('commit;');
up.push('');
writeFileSync(DESTINO_CURADORIA, up.join('\n'));
console.log('escrito', DESTINO_CURADORIA, '(' + Object.keys(CURADORIA).length + ' exercícios)');
