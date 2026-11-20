// Lê no computador os relatórios da sonda de tela (src/ui/sonda.js), que o
// app no iPhone manda para a pasta `diagnostico/` do dono na nuvem.
//
//   npm run sonda                 baixa os novos e mostra o resumo
//   npm run sonda -- --pasta DIR  outra pasta (padrão: ~/Lastro-sonda)
//
// Usa a sessão guardada pelo espelho (`npm run espelho`), em
// ~/.config/lastro/espelho.json. O refresh token gira a cada uso: o novo é
// gravado de volta ANTES de qualquer outra coisa, senão o espelho perderia a
// sessão.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { URL_BASE, ANON, BUCKET_APARELHOS } from '../../src/infra/supabase';

const CFG = join(homedir(), '.config', 'lastro', 'espelho.json');
const arg = process.argv.indexOf('--pasta');
const PASTA = arg > 0 ? process.argv[arg + 1] : join(homedir(), 'Lastro-sonda');

async function sessao(): Promise<{ token: string; uid: string }> {
  if (!existsSync(CFG)) throw new Error('Sem sessão. Rode `npm run espelho` uma vez para entrar.');
  const c = JSON.parse(readFileSync(CFG, 'utf8'));
  const r = await fetch(URL_BASE + '/auth/v1/token?grant_type=refresh_token', {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: c.refresh })
  });
  if (!r.ok) throw new Error('A sessão expirou. Rode `npm run espelho` para entrar de novo.');
  const j = await r.json();
  c.refresh = j.refresh_token;
  writeFileSync(CFG, JSON.stringify(c), { mode: 0o600 });
  return { token: j.access_token, uid: j.user?.id || c.uid };
}

async function main() {
  const s = await sessao();
  const h = { apikey: ANON, Authorization: 'Bearer ' + s.token };
  const r = await fetch(URL_BASE + '/storage/v1/object/list/' + BUCKET_APARELHOS, {
    method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: s.uid + '/diagnostico/', limit: 1000, sortBy: { column: 'name', order: 'asc' } })
  });
  if (!r.ok) throw new Error('A nuvem não listou os relatórios (' + r.status + ').');
  const lista: { name: string }[] = await r.json();
  mkdirSync(PASTA, { recursive: true });
  const ja = new Set(readdirSync(PASTA));
  let novos = 0;
  for (const o of lista) {
    if (!o.name.endsWith('.json') || ja.has(o.name)) continue;
    const b = await fetch(URL_BASE + '/storage/v1/object/' + BUCKET_APARELHOS + '/' + s.uid + '/diagnostico/' + encodeURIComponent(o.name), { headers: h });
    if (!b.ok) continue;
    writeFileSync(join(PASTA, o.name), await b.text());
    novos++;
  }
  console.log(lista.length + ' relatórios na nuvem, ' + novos + ' novos em ' + PASTA);
  for (const f of readdirSync(PASTA).filter(f => f.endsWith('.json')).sort().slice(-novos || -0)) {
    if (!novos) break;
    const j = JSON.parse(readFileSync(join(PASTA, f), 'utf8'));
    const tipos: Record<string, number> = {};
    for (const a of j.achados || []) tipos[a.tipo] = (tipos[a.tipo] || 0) + 1;
    console.log('- ' + j.quando + '  ' + j.tela + '  (' + j.motivo + ')  ' +
      (Object.entries(tipos).map(([t, n]) => n + ' ' + t).join(', ') || 'sem achados') +
      (j.rolagemLateral ? '  · ROLAGEM LATERAL' : '') +
      ((j.animacoes || []).some((a: { estado: string }) => a.estado === 'paused') ? '  · animação pausada' : ''));
  }
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
