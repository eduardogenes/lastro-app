// A foto do aparelho.
//
// O que ela responde não é "como se faz uma puxada" — ele sabe. É "qual das
// três puxadas desta academia é a que o treinador quis dizer". Por isso é foto
// dele, e por isso os bytes nunca entram no estado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** Cache Storage de mentira: o jsdom não tem, e é onde os bytes moram. */
function cacheFalso(a) {
  a.E(`
    // o jsdom não traz Response, que o Cache Storage exige para embrulhar bytes
    if (typeof Response === 'undefined') {
      globalThis.Response = function (corpo) { this._c = corpo; };
      globalThis.Response.prototype.blob = async function () { return this._c; };
    }
    globalThis.__caches = {};
    globalThis.caches = {
      open: async function (nome) {
        const c = globalThis.__caches[nome] || (globalThis.__caches[nome] = {});
        return {
          put: async function (k, resp) { c[k] = resp; },
          match: async function (k) { return c[k] || undefined; },
          delete: async function (k) { const t = k in c; delete c[k]; return t; }
        };
      }
    };
    // createImageBitmap e canvas.toBlob não existem no jsdom
    globalThis.createImageBitmap = async function () {
      return { width: 1200, height: 900, close: function () {} };
    };
    const criar = document.createElement.bind(document);
    document.createElement = function (tag) {
      const el = criar(tag);
      if (tag === 'canvas') {
        el.getContext = function () { return { drawImage: function () {} }; };
        el.toBlob = function (cb, tipo) {
          cb(tipo === 'image/webp' ? new Blob(['x'.repeat(6000)], { type: 'image/webp' }) : null);
        };
      }
      return el;
    };
  `);
}
const guardadas = a => Object.keys(a.J('globalThis.__caches["treino-fotos"] || {}'));

test('o botão convida quando não há foto e mostra quando há', async () => {
  const a = await app();
  a.E('toggle(0)');
  const rotulos = () => a.$$('.ex.open .exacoes .histbtn').map(x => x.textContent.trim());
  assert.ok(rotulos().includes('foto'), rotulos().join(' | '));

  a.E('S.fotos["chest-press-inclinado-convergente"] = { v: 1, ext: "webp" }');
  a.E('render()');
  assert.ok(rotulos().includes('aparelho'), 'com foto, o rótulo muda: ' + rotulos().join(' | '));
  a.fechar();
});

test('a foto entra no cache do aparelho, e só a referência no estado', async () => {
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  assert.ok(a.$('.ins-folha'), 'a folha abriu');

  await a.E(`tiraFoto({ files: [new Blob(['foto'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(50);

  const ref = a.J('S.fotos["chest-press-inclinado-convergente"]');
  assert.ok(ref && ref.v > 0, 'a referência ficou no estado');
  assert.strictEqual(ref.ext, 'webp');
  assert.deepStrictEqual(guardadas(a), ['./foto/chest-press-inclinado-convergente.webp'],
    'e os bytes foram para o cache, não para o estado');

  // o estado não pode ter engordado com imagem
  const json = a.E('JSON.stringify(S.fotos)');
  assert.ok(json.length < 200, 'a referência é pequena: ' + json.length + ' bytes');
  a.fechar();
});

test('apagar tira a referência e deixa lápide', async () => {
  const a = await app();
  cacheFalso(a);
  a.E('window.confirm = () => true');
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['foto'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(50);

  await a.E('apagaFoto()');
  await a.esperar(50);
  assert.strictEqual(a.E('S.fotos["chest-press-inclinado-convergente"]'), undefined);
  assert.deepStrictEqual(guardadas(a), [], 'os bytes saíram do cache também');
  assert.ok(a.J('S.apagados')['foto:chest-press-inclinado-convergente'],
    'a lápide impede o outro aparelho de ressuscitar a referência');
  a.fechar();
});

test('a URL da foto é de mesma origem', async () => {
  // é o que a faz funcionar offline sem endereço externo no bundle
  const a = await app();
  a.E('S.fotos["pendulum-squat"] = { v: 123, ext: "webp" }');
  const url = a.E('CTX.foto("pendulum-squat").url');
  assert.strictEqual(url, './foto/pendulum-squat.webp?v=123');
  assert.ok(!/^https?:/.test(url), 'nada de endereço externo');
  a.fechar();
});

test('sem foto, a folha não desenha imagem nenhuma', async () => {
  // quadro vazio não informa: o sistema manda não desenhar nada
  const a = await app();
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  assert.strictEqual(a.$('.fotoex'), null, 'sem <img> e sem placeholder');
  assert.ok(a.texto('.foto-vazio').includes('Sem foto'));
  a.fechar();
});
