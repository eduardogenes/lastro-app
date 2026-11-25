// O servidor MCP de leitura (src/mcp/), sem rede: JWKS falso, estado de fixture.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { confereToken, type Jwk } from '../../src/mcp/jwt';
import { atende, metadadoDaPorta, type Dependencias } from '../../src/mcp/servidor';
import { FERRAMENTAS, PAPEIS, type IdPapel } from '../../src/mcp/ferramentas';
import { ANON, URL_BASE } from '../../src/infra/supabase';

const EMISSOR = 'https://exemplo.supabase.co/auth/v1';
const ESTADO = JSON.parse(readFileSync(new URL('./fixtures/estado-plano-13.json', import.meta.url), 'utf8'));

function b64url(b: Uint8Array | string): string {
  const bytes = typeof b === 'string' ? new TextEncoder().encode(b) : b;
  let s = ''; bytes.forEach(x => { s += String.fromCharCode(x); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function chave() {
  const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = await crypto.subtle.exportKey('jwk', par.publicKey) as Jwk;
  return { par, jwk: { ...pub, kid: 'k1', alg: 'ES256' } as Jwk };
}

async function assina(par: CryptoKeyPair, corpo: Record<string, unknown>, cab: Record<string, unknown> = { alg: 'ES256', kid: 'k1', typ: 'JWT' }) {
  const ent = b64url(JSON.stringify(cab)) + '.' + b64url(JSON.stringify(corpo));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, par.privateKey, new TextEncoder().encode(ent)));
  return ent + '.' + b64url(sig);
}

const agora = Math.floor(Date.now() / 1000);
const reivindicacoes = (extra: Record<string, unknown> = {}) => ({ sub: 'u1', iss: EMISSOR, aud: 'authenticated', exp: agora + 600, role: 'authenticated', ...extra });

async function montagem(papel: IdPapel = 'treinador', estado: unknown = ESTADO) {
  const { par, jwk } = await chave();
  const leituras: string[] = [];
  const d: Dependencias = {
    papel,
    urlDaPorta: 'https://app.test/api/mcp/' + papel,
    urlDoMetadado: 'https://app.test/.well-known/oauth-protected-resource/api/mcp/' + papel,
    servidorDeAutorizacao: EMISSOR,
    confere: t => confereToken(t, { chaves: async () => [jwk], emissor: EMISSOR, audiencia: 'authenticated' }),
    lerEstado: async t => { leituras.push(t); return estado; },
    agora: () => Date.UTC(2026, 10, 24)
  };
  const token = await assina(par, reivindicacoes());
  return { d, par, token, leituras };
}

function pede(corpo: unknown, token?: string, extra: Record<string, string> = {}) {
  return new Request('https://app.test/api/mcp/treinador', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extra },
    body: JSON.stringify(corpo)
  });
}

describe('token', () => {
  it('aceita o token certo e recusa assinatura, emissor, audiência, validade e algoritmo errados', async () => {
    const { par, jwk } = await chave();
    const o = { chaves: async () => [jwk], emissor: EMISSOR, audiencia: 'authenticated' };
    expect((await confereToken(await assina(par, reivindicacoes()), o))?.sub).toBe('u1');
    const outro = await chave();
    expect(await confereToken(await assina(outro.par, reivindicacoes()), o)).toBeNull();
    expect(await confereToken(await assina(par, reivindicacoes({ iss: 'https://outro/auth/v1' })), o)).toBeNull();
    expect(await confereToken(await assina(par, reivindicacoes({ aud: 'anon' })), o)).toBeNull();
    expect(await confereToken(await assina(par, reivindicacoes({ exp: agora - 1 })), o)).toBeNull();
    expect(await confereToken(await assina(par, reivindicacoes(), { alg: 'HS256', kid: 'k1' }), o)).toBeNull();
    expect(await confereToken(await assina(par, reivindicacoes(), { alg: 'ES256', kid: 'outra' }), o)).toBeNull();
    expect(await confereToken('nao.e.jwt', o)).toBeNull();
    expect(await confereToken(ANON, o)).toBeNull();
  });
});

describe('porta', () => {
  it('sem token: 401 com o endereço do metadado, e o metadado aponta o Supabase com o resource da porta', async () => {
    const { d } = await montagem();
    const r = await atende(pede({ jsonrpc: '2.0', id: 1, method: 'tools/list' }), d);
    expect(r.status).toBe(401);
    expect(r.headers.get('www-authenticate')).toContain('resource_metadata="https://app.test/.well-known/oauth-protected-resource/api/mcp/treinador"');
    const m = await atende(new Request('https://app.test/api/mcp/treinador?metadado=1'), d);
    expect(m.status).toBe(200);
    const meta = await m.json();
    expect(meta).toEqual(metadadoDaPorta(d));
    expect(meta.resource).toBe('https://app.test/api/mcp/treinador');
    expect(meta.authorization_servers).toEqual([EMISSOR]);
  });

  it('token inválido: 401, e o estado nem é lido', async () => {
    const { d, leituras } = await montagem();
    const r = await atende(pede({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'programa' } }, 'abc.def.ghi'), d);
    expect(r.status).toBe(401);
    expect(leituras).toEqual([]);
  });

  it('initialize devolve a versão pedida quando suportada, e notificação recebe 202', async () => {
    const { d, token } = await montagem();
    const r = await (await atende(pede({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 't', version: '1' } } }, token), d)).json();
    expect(r.result.protocolVersion).toBe('2025-11-25');
    expect(r.result.capabilities.tools).toBeTruthy();
    const desconhecida = await (await atende(pede({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '1999-01-01' } }, token), d)).json();
    expect(desconhecida.result.protocolVersion).toBe('2025-06-18');
    const n = await atende(pede({ jsonrpc: '2.0', method: 'notifications/initialized' }, token), d);
    expect(n.status).toBe(202);
  });

  it('sem initialize (2026-07-28, sem estado): tools/list responde direto', async () => {
    const { d, token } = await montagem();
    const r = await atende(pede({ jsonrpc: '2.0', id: 3, method: 'tools/list' }, token, { 'MCP-Protocol-Version': '2026-07-28' }), d);
    expect(r.status).toBe(200);
    expect((await r.json()).result.tools.length).toBe(PAPEIS.treinador.ferramentas.length);
    const ruim = await atende(pede({ jsonrpc: '2.0', id: 4, method: 'tools/list' }, token, { 'MCP-Protocol-Version': '1999-01-01' }), d);
    expect(ruim.status).toBe(400);
  });

  it('cada papel só vê e só chama as próprias ferramentas, todas só de leitura', async () => {
    for (const p of ['treinador', 'nutricionista', 'assistente'] as IdPapel[]) {
      const { d, token } = await montagem(p);
      const tools = (await (await atende(pede({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, token), d)).json()).result.tools;
      expect(tools.map((t: { name: string }) => t.name)).toEqual(PAPEIS[p].ferramentas);
      for (const t of tools) expect(t.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    }
    const { d, token } = await montagem('nutricionista');
    const r = await (await atende(pede({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name: 'series', arguments: {} } }, token), d)).json();
    expect(r.error.code).toBe(-32602);
    expect(PAPEIS.nutricionista.ferramentas).not.toContain('series');
    expect(PAPEIS.assistente.ferramentas).not.toContain('series');
  });

  it('todas as ferramentas rodam sobre o estado de fixture, sem lançar e dentro do teto', async () => {
    for (const p of ['treinador', 'nutricionista', 'assistente'] as IdPapel[]) {
      const { d, token } = await montagem(p);
      for (const nome of PAPEIS[p].ferramentas) {
        const r = await (await atende(pede({ jsonrpc: '2.0', id: nome, method: 'tools/call', params: { name: nome, arguments: {} } }, token), d)).json();
        expect(r.result.isError, p + '/' + nome).toBe(false);
        expect(typeof r.result.content[0].text).toBe('string');
        expect(r.result.content[0].text.length).toBeLessThanOrEqual(24000 + 200);
      }
    }
  });

  it('o programa ativo sai com os treinos, e a busca do catálogo acha pelo nome alternativo', async () => {
    const { d, token } = await montagem();
    const prog = await (await atende(pede({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'programa', arguments: {} } }, token), d)).json();
    expect(prog.result.content[0].text).toMatch(/Programa/);
    const cat = await (await atende(pede({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'catalogo', arguments: { busca: 'voador' } } }, token), d)).json();
    expect(cat.result.content[0].text).toContain('pec-deck');
  });

  it('nada grava: a porta só chama lerEstado, e o estado lido sai intacto', async () => {
    const copia = JSON.parse(JSON.stringify(ESTADO));
    const { d, token, leituras } = await montagem('treinador', copia);
    for (const nome of PAPEIS.treinador.ferramentas)
      await atende(pede({ jsonrpc: '2.0', id: nome, method: 'tools/call', params: { name: nome, arguments: {} } }, token), d);
    expect(leituras.length).toBe(PAPEIS.treinador.ferramentas.length);
    expect(JSON.stringify(copia)).toBe(JSON.stringify(ESTADO));
    expect(Object.keys(d)).not.toContain('gravaEstado');
  });

  it('banco fora do ar vira resposta de erro da ferramenta, não exceção', async () => {
    const { d, token } = await montagem();
    d.lerEstado = async () => { throw new Error('banco respondeu 503'); };
    const r = await (await atende(pede({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'programa' } }, token), d)).json();
    expect(r.result.isError).toBe(true);
    expect(r.result.content[0].text).toContain('503');
  });

  it('GET sem metadado é 405 (sem SSE)', async () => {
    const { d } = await montagem();
    expect((await atende(new Request('https://app.test/api/mcp/treinador'), d)).status).toBe(405);
  });
});

it('a página /autorizar usa o mesmo projeto do app', () => {
  const html = readFileSync(new URL('../../public/autorizar.html', import.meta.url), 'utf8');
  expect(html).toContain(URL_BASE);
  expect(html).toContain(ANON);
});

it('cada ferramenta tem nome igual à chave e esquema fechado', () => {
  for (const [k, f] of Object.entries(FERRAMENTAS)) {
    expect(f.nome).toBe(k);
    expect(f.entrada.additionalProperties).toBe(false);
  }
});
