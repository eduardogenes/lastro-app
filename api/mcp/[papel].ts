// Uma porta do MCP por papel: /api/mcp/treinador, /api/mcp/nutricionista,
// /api/mcp/assistente (docs/mcp/00-desenho.md). Função da Vercel no formato Web
// (Request → Response); toda a lógica está em src/mcp/, testada sem rede.

import { ANON, URL_BASE } from '../../src/infra/supabase';
import { chavesDoProjeto, confereToken } from '../../src/mcp/jwt';
import { ehPapel } from '../../src/mcp/ferramentas';
import { atende } from '../../src/mcp/servidor';

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
    lerEstado
  });
}

export const GET = porta;
export const POST = porta;
export const OPTIONS = porta;
export const DELETE = porta;
