// O ENDEREÇO VAZIO — a D, `prescricao.html`, estado 9.
//
// Os dados ficam presos ao endereço de onde o app é aberto (F56), e aparelho
// novo já ficaria sem plano para sempre (F271). O vazio de verdade oferece ACHAR
// o que existe antes de começar do zero.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, estadoVazio, CHAVE_NUVEM } from './harness.js';

test('com qualquer registro, não é endereço vazio', async () => {
  const t = Date.now() - 86400000;
  for (const extra of [
    { done: [{ day: 'A', t: t, sid: t }] },
    { cardio: [{ t: t, tipo: 'bike', min: 30 }] },
    { protocolo: { poses: null, sessoes: [{ d: '2026-01-01', t: 1, m: 1, fotos: {} }] } }
  ]) {
    const a = await app({ aba: 'prescricao', estado: estadoVazio(extra) });
    await a.esperar();
    assert.strictEqual(a.vJ('ctx.enderecoVazio'), null, JSON.stringify(extra));
    a.fechar();
  }
});

test('com a conta entrada, não é endereço vazio: a sincronia traz o que existe', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio(), chaves: {
    [CHAVE_NUVEM]: { token: 't', refresh: 'r', expira: Date.now() + 3600000, uid: 'u', email: 'a@b.c' }
  } });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.enderecoVazio'), null);
  a.fechar();
});
