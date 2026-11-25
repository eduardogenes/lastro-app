// Confere o token que o agente manda para uma porta do MCP (docs/mcp/00-desenho.md).
//
// O token é o access token do Supabase Auth: JWT ES256, assinado com a chave do
// projeto, publicada no JWKS (`/auth/v1/.well-known/jwks.json`). Conferimos aqui,
// sem dependência: WebCrypto faz ECDSA P-256 e a assinatura JWS ES256 já vem no
// formato cru (r‖s) que o WebCrypto espera.
//
// O que se exige: alg ES256, `kid` que exista no JWKS, assinatura válida,
// `iss` do projeto, `aud` "authenticated", `exp` no futuro e `sub` presente.
// Quem decide o que o dono pode ler é o RLS do banco, com este mesmo token;
// a conferência aqui só evita gastar uma ida ao banco com token ruim e dá ao
// cliente o 401 que inicia o login.

export interface Jwk { kty: string; crv?: string; x?: string; y?: string; kid?: string; alg?: string; use?: string }
export interface Reivindicacoes { sub: string; exp: number; iss?: string; aud?: string | string[]; client_id?: string; email?: string; role?: string; [k: string]: unknown }

export interface OpcoesDoToken {
  /** devolve as chaves; a implementação de produção busca e guarda por um tempo */
  chaves: () => Promise<Jwk[]>;
  emissor: string;
  audiencia: string;
  /** em segundos; o padrão é o relógio */
  agora?: number;
}

function b64urlBytes(s: string): Uint8Array<ArrayBuffer> {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b.length % 4 ? '='.repeat(4 - (b.length % 4)) : '';
  const bin = atob(b + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlJson(s: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(new TextDecoder().decode(b64urlBytes(s)));
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch { return null; }
}

/** O token conferido, ou `null`. Nunca lança: token ruim é só "não autenticado". */
export async function confereToken(token: string, o: OpcoesDoToken): Promise<Reivindicacoes | null> {
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  const cab = b64urlJson(partes[0]);
  const corpo = b64urlJson(partes[1]);
  if (!cab || !corpo || cab.alg !== 'ES256' || typeof cab.kid !== 'string') return null;

  let chaves: Jwk[];
  try { chaves = await o.chaves(); } catch { return null; }
  const jwk = chaves.find(k => k.kid === cab.kid && k.kty === 'EC' && k.crv === 'P-256');
  if (!jwk || !jwk.x || !jwk.y) return null;

  try {
    const chave = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, ext: true },
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, chave,
      b64urlBytes(partes[2]), new TextEncoder().encode(partes[0] + '.' + partes[1]));
    if (!ok) return null;
  } catch { return null; }

  const agora = o.agora ?? Math.floor(Date.now() / 1000);
  const aud = corpo.aud;
  const audOk = aud === o.audiencia || (Array.isArray(aud) && aud.indexOf(o.audiencia) >= 0);
  if (corpo.iss !== o.emissor || !audOk) return null;
  if (typeof corpo.exp !== 'number' || corpo.exp <= agora) return null;
  if (typeof corpo.nbf === 'number' && corpo.nbf > agora + 60) return null;
  if (typeof corpo.sub !== 'string' || !corpo.sub) return null;
  return corpo as Reivindicacoes;
}

/** JWKS com cache em memória (a função da Vercel reaproveita a instância). */
export function chavesDoProjeto(url: string, ttlMs = 10 * 60 * 1000, busca: typeof fetch = fetch): () => Promise<Jwk[]> {
  let cache: { em: number; k: Jwk[] } | null = null;
  return async function () {
    if (cache && Date.now() - cache.em < ttlMs) return cache.k;
    const r = await busca(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('jwks ' + r.status);
    const j = await r.json() as { keys?: Jwk[] };
    cache = { em: Date.now(), k: Array.isArray(j.keys) ? j.keys : [] };
    return cache.k;
  };
}
