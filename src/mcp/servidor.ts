// O servidor MCP de leitura do Lastro: uma porta por papel, sem estado
// (docs/mcp/00-desenho.md). Uma função pura de Request para Response, para
// rodar igual na Vercel (`api/mcp/[papel].ts`) e nos testes, sem rede.
//
// Transporte: HTTP "streamable" respondendo sempre JSON (sem SSE e sem sessão),
// o que serve às versões 2025-03-26, 2025-06-18 e 2025-11-25 do protocolo, que
// começam por `initialize`, e à 2026-07-28, que não tem `initialize` e manda a
// versão em cada requisição (`MCP-Protocol-Version`). Escrito à mão, sem SDK:
// são quatro métodos, e assim nenhuma troca de versão de pacote muda o
// comportamento da porta sem um teste ficar vermelho.
//
// Autorização (MCP 2025-06-18 em diante, RFC 9728): sem token válido, 401 com
// `WWW-Authenticate: Bearer resource_metadata="…"`; o metadado aponta o Supabase
// Auth como servidor de autorização. Nada aqui grava: só `lerEstado`.

import { FERRAMENTAS, PAPEIS, arquivosDoEstado, type IdPapel } from './ferramentas';
import type { Reivindicacoes } from './jwt';

export const VERSOES = ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26'];
export const VERSAO_PADRAO = '2025-06-18';
export const VERSAO_DO_SERVIDOR = '1.0.0';

export interface Dependencias {
  papel: IdPapel;
  /** a URL da porta, exatamente como o conector usa: é o `resource` do metadado */
  urlDaPorta: string;
  /** onde o metadado da porta é servido (RFC 9728) */
  urlDoMetadado: string;
  /** o emissor do Supabase Auth, `https://<ref>.supabase.co/auth/v1` */
  servidorDeAutorizacao: string;
  confere: (token: string) => Promise<Reivindicacoes | null>;
  /** o `estado.data` da pessoa, lido com o token dela (RLS) */
  lerEstado: (token: string) => Promise<unknown>;
  /**
   * Se o papel está ligado para a pessoa (a chave "Pode ler" de Ajustes ›
   * Agentes). Sem a função, ou se a leitura falhar, conta como ligado: a chave
   * é da própria pessoa, e um banco fora do ar não deve parecer "desligado".
   */
  papelLigado?: (token: string, papel: IdPapel) => Promise<boolean>;
  /** grava o rastro de uma leitura (tabela `acessos`); falhar não atrapalha a resposta */
  registra?: (token: string, r: Acesso) => Promise<void>;
  agora?: () => number;
}

/** Uma linha do rastro: quem leu o quê. Para sempre (decisão do dono, 23/11/2026). */
export interface Acesso { papel: IdPapel; ferramenta: string; resumo: string; cliente: string | null }

/** O que a ferramenta pediu, em poucas palavras, para a lista "o que leram". */
export function resumoDoPedido(args: Record<string, unknown>): string {
  const partes = Object.keys(args).filter(k => args[k] != null && args[k] !== '').map(k => k + ': ' + String(args[k]).slice(0, 40));
  return partes.join(', ').slice(0, 200);
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, MCP-Protocol-Version'
};

function json(corpo: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...extra } });
}

export function metadadoDaPorta(d: Dependencias): Record<string, unknown> {
  return {
    resource: d.urlDaPorta,
    authorization_servers: [d.servidorDeAutorizacao],
    bearer_methods_supported: ['header'],
    scopes_supported: ['email'],
    resource_name: 'Lastro · ' + PAPEIS[d.papel].nome
  };
}

function naoAutorizado(d: Dependencias, motivo: string): Response {
  return json({ error: 'invalid_token', error_description: motivo }, 401, {
    'WWW-Authenticate': 'Bearer resource_metadata="' + d.urlDoMetadado + '", error="invalid_token"'
  });
}

interface Pedido { jsonrpc?: string; id?: string | number | null; method?: unknown; params?: Record<string, unknown> }

function erro(id: Pedido['id'], code: number, message: string) { return { jsonrpc: '2.0', id: id ?? null, error: { code, message } }; }
function ok(id: Pedido['id'], result: unknown) { return { jsonrpc: '2.0', id, result }; }

function listaDeFerramentas(papel: IdPapel) {
  return PAPEIS[papel].ferramentas.map(n => {
    const f = FERRAMENTAS[n];
    return {
      name: f.nome, title: f.titulo, description: f.descricao, inputSchema: f.entrada,
      annotations: { title: f.titulo, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    };
  });
}

async function responde(p: Pedido, d: Dependencias, token: string, versao: string, quem: Reivindicacoes): Promise<unknown | null> {
  const temId = p.id !== undefined && p.id !== null;
  if (typeof p.method !== 'string') return temId ? erro(p.id, -32600, 'pedido inválido') : null;
  if (!temId) return null; // notificação (ex.: notifications/initialized): nada a responder

  switch (p.method) {
    case 'initialize': {
      const pedida = typeof p.params?.protocolVersion === 'string' ? p.params.protocolVersion : '';
      return ok(p.id, {
        protocolVersion: VERSOES.indexOf(pedida) >= 0 ? pedida : VERSAO_PADRAO,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'lastro-' + d.papel, title: 'Lastro · ' + PAPEIS[d.papel].nome, version: VERSAO_DO_SERVIDOR },
        instructions: PAPEIS[d.papel].descricao + ' Comece pela primeira ferramenta da lista. Os números são do app da pessoa; não invente o que não estiver lá.'
      });
    }
    case 'ping': return ok(p.id, {});
    case 'tools/list': return ok(p.id, { tools: listaDeFerramentas(d.papel) });
    case 'tools/call': {
      const nome = typeof p.params?.name === 'string' ? p.params.name : '';
      if (PAPEIS[d.papel].ferramentas.indexOf(nome) < 0) return erro(p.id, -32602, 'ferramenta desconhecida nesta porta: ' + nome);
      const args = p.params?.arguments && typeof p.params.arguments === 'object' ? p.params.arguments as Record<string, unknown> : {};
      let ligado = true;
      if (d.papelLigado) { try { ligado = await d.papelLigado(token, d.papel); } catch { ligado = true; } }
      if (!ligado) return ok(p.id, { content: [{ type: 'text', text: 'A pessoa desligou o acesso do ' + PAPEIS[d.papel].nome.toLowerCase() + ' em Ajustes › Agentes, no app. Peça para ela ligar de novo se precisar ler.' }], isError: true });
      let estado: unknown;
      try { estado = await d.lerEstado(token); } catch (e) {
        return ok(p.id, { content: [{ type: 'text', text: 'Não deu para ler o Lastro agora (' + String((e as Error)?.message || e) + '). Tente de novo em instantes.' }], isError: true });
      }
      if (estado == null) return ok(p.id, { content: [{ type: 'text', text: 'Esta conta ainda não tem nada salvo no Lastro.' }], isError: false });
      const arq = arquivosDoEstado(estado, (d.agora || Date.now)());
      const texto = FERRAMENTAS[nome].roda(arq, args);
      if (d.registra) {
        const cliente = typeof quem.client_id === 'string' ? quem.client_id : null;
        try { await d.registra(token, { papel: d.papel, ferramenta: nome, resumo: resumoDoPedido(args), cliente }); } catch { /* o rastro não derruba a leitura */ }
      }
      return ok(p.id, { content: [{ type: 'text', text: texto }], isError: false });
    }
    default:
      void versao;
      return erro(p.id, -32601, 'método não suportado: ' + p.method);
  }
}

export async function atende(req: Request, d: Dependencias): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method === 'GET' && url.searchParams.has('metadado')) return json(metadadoDaPorta(d), 200, { 'Cache-Control': 'public, max-age=300' });
  if (req.method !== 'POST') return json({ error: 'use POST' }, 405, { Allow: 'POST, OPTIONS' });

  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') || '');
  if (!m) return naoAutorizado(d, 'falta o token');
  const token = m[1].trim();
  const quem = await d.confere(token);
  if (!quem) return naoAutorizado(d, 'token inválido ou vencido');

  const versao = req.headers.get('mcp-protocol-version') || '';
  if (versao && VERSOES.indexOf(versao) < 0) return json(erro(null, -32600, 'versão do protocolo não suportada: ' + versao), 400);

  let corpo: unknown;
  try { corpo = await req.json(); } catch { return json(erro(null, -32700, 'JSON inválido'), 400); }

  const extra: Record<string, string> = versao ? { 'MCP-Protocol-Version': versao } : {};
  if (Array.isArray(corpo)) {
    const rs = (await Promise.all(corpo.map(p => responde(p as Pedido, d, token, versao, quem)))).filter(r => r != null);
    return rs.length ? json(rs, 200, extra) : new Response(null, { status: 202, headers: CORS });
  }
  const r = await responde(corpo as Pedido, d, token, versao, quem);
  return r == null ? new Response(null, { status: 202, headers: CORS }) : json(r, 200, extra);
}
