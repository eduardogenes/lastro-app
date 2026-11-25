// A Vercel roda api/mcp/[papel].mjs, gerado de src/mcp/porta.ts por `npm run mcp:porta`.
// Se alguém mudar src/mcp/ e esquecer de gerar, produção roda a versão velha: este teste pega.
import { describe, it, expect } from 'vitest';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

describe('porta do MCP gerada', () => {
  it('api/mcp/[papel].mjs está igual ao que src/mcp/porta.ts gera', async () => {
    const r = await build({ entryPoints: ['src/mcp/porta.ts'], bundle: true, platform: 'node', format: 'esm', target: 'node20', legalComments: 'none', write: false, outfile: 'api/mcp/[papel].mjs' });
    expect(r.outputFiles[0].text).toBe(readFileSync('api/mcp/[papel].mjs', 'utf8'));
  });
  it('a porta gerada roda sozinha no Node e recusa sem token com o metadado', async () => {
    const m = await import('../../api/mcp/[papel].mjs');
    const res = await m.POST(new Request('https://x.test/api/mcp/treinador', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' }));
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toContain('resource_metadata=');
  });
});
