// As camadas do visual novo (direção 3): a folha e o destino novos entram pela
// MESMA pilha que o Voltar desfaz (`src/ui/navegacao.js`), com o mesmo
// isolamento do visual antigo. Contrato de UX, §1, §2 e §12; especificação em
// docs/redesign-3/03-lotes.md, "Camadas".

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** O app aberto com o visual novo ligado neste aparelho. */
async function comVisualNovo() {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.E(`CTX.alternaVisual()`);
  await a.esperar();
  return a;
}

function escape(a) {
  a.doc.dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return a.esperar();
}

const aviso = (extra = '') => `CTX.abreFolha({ k: 'aviso', titulo: 'Tirar mesmo assim?',
  texto: 'A sessão entra marcada como fora do padrão.', sim: 'Tirar fora do padrão'${extra} })`;

test('a folha nova abre pela pilha, isola o fundo, leva o foco e devolve tudo ao fechar', async () => {
  const a = await comVisualNovo();
  assert.ok(a.$('.v3-doca'), 'com o interruptor ligado a navegação é a doca');
  const acionador = a.$('.v3-doca-n button');
  acionador.focus();

  a.E(aviso());
  await a.esperar(60);

  const folha = a.$('.v3-folha');
  assert.ok(folha, 'a folha do visual novo abriu');
  assert.ok(!a.$('.ins-folha'), 'e não a antiga');
  assert.strictEqual(folha.getAttribute('role'), 'dialog');
  assert.strictEqual(a.doc.activeElement, folha, 'o foco entrou na folha');
  assert.ok(a.doc.body.classList.contains('ins-travado'), 'a rolagem do corpo travou');
  const inertes = a.$$('#app > [inert]');
  assert.ok(inertes.length > 0 && inertes.every(el => !el.contains(folha)), 'o fundo ficou inerte, e só ele');

  a.clicar('[data-a="aviso-nao"]');
  await a.esperar(60);
  assert.ok(!a.$('.v3-folha'), 'fechou');
  assert.strictEqual((a.vista().pilha || []).length, 0);
  assert.ok(!a.doc.body.classList.contains('ins-travado'), 'a rolagem destravou');
  assert.strictEqual(a.$$('#app > [inert]').length, 0, 'o fundo voltou a ser alcançável');
  assert.strictEqual(a.doc.activeElement, acionador, 'e o foco voltou para quem abriu');
  a.fechar();
});

test('o botão principal faz a ação e fecha; o Esc só fecha', async () => {
  const a = await comVisualNovo();
  a.E(aviso(`, aoSim: function () { window.__fez = (window.__fez || 0) + 1; }`));
  await a.esperar(40);
  a.clicar('[data-a="aviso-sim"]');
  await a.esperar(40);
  assert.strictEqual(a.E('window.__fez'), 1, 'a ação rodou uma vez');
  assert.ok(!a.$('.v3-folha'));

  a.E(aviso(`, aoSim: function () { window.__fez = (window.__fez || 0) + 1; }`));
  await a.esperar(40);
  await escape(a);
  assert.ok(!a.$('.v3-folha'), 'o Esc fecha, pelo mesmo caminho do Voltar');
  assert.strictEqual(a.E('window.__fez'), 1, 'e não faz a ação');
  a.fechar();
});

test('na confirmação segura, o principal é voltar e a ação arriscada é a saída discreta', async () => {
  const a = await comVisualNovo();
  a.E(aviso(`, seguro: true, nao: 'Voltar e acertar'`));
  await a.esperar(40);
  assert.strictEqual(a.$('.v3-folha .v3-btn.p').textContent, 'Voltar e acertar');
  assert.strictEqual(a.$('.v3-folha .v3-saida').textContent, 'Tirar fora do padrão');
  a.fechar();
});

test('com o interruptor desligado nada do visual novo aparece', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  assert.ok(a.$('.ins-tabbar') && !a.$('.v3-doca'));
  a.E(aviso());
  await a.esperar(40);
  assert.ok(!a.$('.v3-folha'), 'a folha nova não abre no visual antigo');
  a.fechar();
});
