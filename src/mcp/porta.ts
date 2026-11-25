// Uma porta do MCP por papel: /api/mcp/treinador, /api/mcp/nutricionista,
// /api/mcp/assistente (docs/mcp/00-desenho.md). Função da Vercel no formato Web.
// A Vercel roda api/mcp/[papel].mjs, GERADO daqui por `npm run mcp:porta` (um arquivo só:
// o Node em ESM não resolve os imports sem extensão do resto de src/).

import { ANON, URL_BASE } from '../infra/supabase';
import { chavesDoProjeto, confereToken } from './jwt';
import { ehPapel } from './ferramentas';
import { atende } from './servidor';

const EMISSOR = URL_BASE + '/auth/v1';
const chaves = chavesDoProjeto(EMISSOR + '/.well-known/jwks.json');

async function lerEstado(token: string): Promise<unknown> {
  const r = await fetch(URL_BASE + '/rest/v1/estado?select=data&limit=1', {
    headers: { apikey: ANON, Authorization: 'Bearer ' + token, Accept: 'application/json' }
  });
  if (!r.ok) throw new Error('banco respondeu ' + r.status);
  const linhas = await r.json() as Array<{ data?: unknown }>;
  return Array.isArray(linhas) && linhas[0] ? linhas[0].data ?? null : null;
}

const cab = (token: string, extra: Record<string, string> = {}) => ({ apikey: ANON, Authorization: 'Bearer ' + token, ...extra });

// A chave "Pode ler" (tabela `agentes`, só da pessoa). Sem linha = ligado.
async function papelLigado(token: string, papel: string): Promise<boolean> {
  const r = await fetch(URL_BASE + '/rest/v1/agentes?select=ligado&papel=eq.' + encodeURIComponent(papel) + '&limit=1', { headers: cab(token, { Accept: 'application/json' }) });
  if (!r.ok) return true;
  const linhas = await r.json() as Array<{ ligado?: boolean }>;
  return !(Array.isArray(linhas) && linhas[0] && linhas[0].ligado === false);
}

// O rastro (tabela `acessos`): a pessoa grava a própria linha com o próprio token (RLS).
async function registra(token: string, a: { papel: string; ferramenta: string; resumo: string; cliente: string | null }): Promise<void> {
  await fetch(URL_BASE + '/rest/v1/acessos', {
    method: 'POST',
    headers: cab(token, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(a)
  });
}

async function porta(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const papel = url.pathname.replace(/\/+$/, '').split('/').pop() || '';
  if (!ehPapel(papel)) return new Response(JSON.stringify({ error: 'porta desconhecida' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  const urlDaPorta = url.origin + '/api/mcp/' + papel;
  return atende(req, {
    papel,
    urlDaPorta,
    urlDoMetadado: url.origin + '/.well-known/oauth-protected-resource/api/mcp/' + papel,
    servidorDeAutorizacao: EMISSOR,
    confere: t => confereToken(t, { chaves, emissor: EMISSOR, audiencia: 'authenticated' }),
    lerEstado,
    papelLigado,
    registra
  });
}

export const GET = porta;
export const POST = porta;
export const OPTIONS = porta;
export const DELETE = porta;
