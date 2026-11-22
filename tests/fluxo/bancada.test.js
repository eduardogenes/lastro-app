import { test } from 'vitest';
import assert from 'node:assert/strict';
import { abrirApp } from './harness.js';

async function abreBancada() {
  const a = abrirApp({ antesDoApp(w) {
    w.matchMedia = consulta => ({ matches: consulta === '(pointer: fine)' });
    w.ResizeObserver = class { observe() {} }; // o jsdom não desenha a mesa
  } });
  await a.pronto();
  return a;
}

test('Option e o algarismo físico escolhem o iPhone no teclado do Mac', async () => {
  const a = await abreBancada();
  try {
    a.doc.dispatchEvent(new a.window.KeyboardEvent('keydown', { altKey: true, code: 'Digit2', key: '™' }));
    assert.equal(a.doc.querySelector('.pl-item[aria-pressed="true"]').dataset.id, '16');
  } finally {
    a.fechar();
  }
});

test('ao girar, a ficha dá os pontos e pixels em paisagem e o app conserva o documento', async () => {
  const a = await abreBancada();
  try {
    const documento = a.doc.querySelector('.pl-tela').contentDocument;
    a.clicar('.pl-item[data-id="16"]');
    a.clicar('.pl-girar');
    const ficha = a.doc.querySelector('.pl-leitura').textContent;
    assert.ok(ficha.includes('852 × 393'), 'a tela em pontos acompanha o giro');
    assert.ok(ficha.includes('2556 × 1179 px'), 'a resolução física acompanha a mesma orientação');
    assert.equal(a.doc.querySelector('.pl-cota').textContent, '852 pt');
    assert.equal(a.doc.querySelector('.pl-tela').contentDocument, documento);
    assert.deepEqual(JSON.parse(a.window.localStorage.getItem('lastro-bancada-v1')), { aparelho: '16', deitado: true });
  } finally {
    a.fechar();
  }
});
