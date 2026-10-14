// O ENDEREÇO VAZIO — a D, `prescricao.html`, estado 9.
//
// Os dados ficam presos ao endereço de onde o app é aberto (F56), e aparelho
// novo já ficaria sem plano para sempre (F271). O vazio de verdade oferece ACHAR
// o que existe antes de começar do zero.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, estadoVazio, CHAVE_NUVEM } from './harness.js';

test('sem registro nenhum, a Prescrição oferece achar o que existe antes de começar', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio() });
  await a.esperar();
  const v = a.vJ('ctx.enderecoVazio');
  assert.ok(v, 'o endereço está vazio');
  assert.ok(/^\d+ treinos na sequência · \d+ séries nela inteira$/.test(v.programa), v.programa);
  assert.ok(/^\d+ momentos · [\d.]+ kcal em dia de treino$/.test(v.plano), v.plano);
  const t = a.texto('main');
  assert.ok(t.indexOf('Este endereço está vazio') >= 0);
  // a ordem é a regra: achar vem antes de começar
  assert.ok(t.indexOf('Na sua conta') < t.indexOf('Começar com os dois'));
  assert.ok(t.indexOf('Numa cópia de segurança') < t.indexOf('Começar com os dois'));
  assert.ok(a.$('[data-a="vazio-copia"]').getAttribute('type') === 'file', 'a cópia se escolhe ali mesmo');
  a.fechar();
});

test('"Na sua conta" leva ao lugar de entrar', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio() });
  await a.esperar();
  a.clicar('[data-a="vazio-conta"]');
  await a.esperar();
  assert.ok(a.$('#nvemail'), 'o campo de e-mail da conta está na tela');
  a.fechar();
});

test('"Começar com os dois" tira o aviso, e o primeiro registro também', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio() });
  await a.esperar();
  a.clicar('[data-a="vazio-comeca"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.enderecoVazio'), null);
  assert.strictEqual(a.$('[data-a="vazio-comeca"]'), null);
  a.fechar();

  const b = await app({ aba: 'prescricao', estado: estadoVazio() });
  await b.esperar();
  b.m.ctx.setPeso(73.6);
  b.m.ctx.registraPeso();
  await b.esperar(60);
  assert.strictEqual(b.vJ('ctx.enderecoVazio'), null, 'com um peso, o endereço não está mais vazio');
  b.fechar();
});

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

test('sem rede, diz o que funciona offline', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio() });
  Object.defineProperty(a.window.navigator, 'onLine', { configurable: true, get: () => false });
  a.v('render');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.enderecoVazio').semRede, true);
  assert.ok(/começar do zero funciona offline/.test(a.texto('main')));
  a.fechar();
});

test('com a conta entrada, não é endereço vazio: a sincronia traz o que existe', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio(), chaves: {
    [CHAVE_NUVEM]: { token: 't', refresh: 'r', expira: Date.now() + 3600000, uid: 'u', email: 'a@b.c' }
  } });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.enderecoVazio'), null);
  a.fechar();
});
