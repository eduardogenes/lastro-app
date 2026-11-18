// A GRAVAÇÃO QUE FALHOU — a família "falhou", decisão 13, §3.2 da frente 3.
//
// Até 13/10 a falha era SILENCIOSA: a camada de armazenamento engolia o erro do
// `setItem` e respondia "gravei" sempre. Com o aparelho cheio (o teto do Safari,
// F53, e o estado inteiro regravado a cada série, F256), o estado ficava só na
// memória e se perdia ao fechar o app sem uma palavra. Estes casos usam o
// aparelho cheio do harness (`encheCota`), que falha como o Safari falha.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const painel = a => a.$('.falhou-w [role="alert"]');

test('copiar o registro inteiro leva a cópia de segurança completa', async () => {
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  let copiado = null;
  Object.defineProperty(a.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: function (t) { copiado = t; return Promise.resolve(); } }
  });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  a.clicar(a.$('[data-a="falhou-copia"]'));
  await a.esperar(60);
  const c = JSON.parse(copiado);
  assert.strictEqual(c.app, 'lastro', 'é o envelope da cópia de segurança');
  assert.strictEqual(c.data.body.peso[0].v, 73.6, 'com o peso que o disco recusou');
  a.fechar();
});

test('no modo privado o painel não abre: o Agora já diz que nada vai ficar', async () => {
  const a = await app({ semArmazenamento: true, estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  assert.strictEqual(painel(a), null, 'um alerta a cada registro ensinaria a ignorar o alerta');
  assert.strictEqual(a.$('.ng-faixa'), null, 'nem a marca: o aviso de perda do Agora é o canal');
  a.fechar();
});

