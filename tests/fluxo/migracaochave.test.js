// A migração da chave de storage, de `treino-eduardo-v1` para `lastro-v1`,
// quando o produto deixou de se chamar "Treino".
//
// Regra 2 do projeto: nenhuma mudança pode quebrar o que já está salvo. Trocar
// o nome da chave é a mudança com mais como quebrar que existe, e por isso ela
// não é um replace: o boot FUNDE os dois lados com a mesma `funde()` da
// sincronização e só apaga a chave velha depois de a nova estar gravada.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, CHAVE, CHAVE_LEGADO } from './harness.js';

const ONTEM = Date.now() - DIA;
const ANTEONTEM = Date.now() - 2 * DIA;

test('o histórico da chave velha entra, e a chave velha some', async () => {
  const a = await app({
    legado: {
      logs: { A0: [{ t: ANTEONTEM, sid: ANTEONTEM, sets: [[60, 8], [60, 8]] }] },
      done: [{ day: 'A', t: ANTEONTEM, sid: ANTEONTEM, dur: 40 * 60000 }]
    }
  });

  assert.strictEqual(a.E('S.done.length'), 1, 'a sessão da chave velha chegou');
  assert.ok(a.gravado(), 'o estado foi regravado na chave nova');
  assert.strictEqual(a.legado(), null, 'a chave velha foi apagada depois de gravar');
});

test('série registrada no build antigo depois da migração não se perde', async () => {
  // A janela real desta migração: publicada a versão nova, o iPhone ainda
  // serve o build antigo por uma ou duas aberturas. Uma sessão registrada
  // nessa janela cai na chave VELHA depois de a nova já existir. "Copiar se a
  // nova não existir" perderia essa sessão; fundir não.
  const a = await app({
    estado: { plano: 3, done: [{ day: 'A', t: ANTEONTEM, sid: ANTEONTEM, dur: 40 * 60000 }] },
    legado: { plano: 3, done: [{ day: 'B', t: ONTEM, sid: ONTEM, dur: 50 * 60000 }] }
  });

  const sids = a.J('S.done.map(function (x) { return x.sid; })').sort();
  assert.deepStrictEqual(sids, [ANTEONTEM, ONTEM].sort(),
    'a fusão manteve as duas sessões, uma de cada chave');
  assert.strictEqual(a.legado(), null);
});

test('apagar o histórico leva a chave velha junto', async () => {
  const a = await app({ legado: { done: [{ day: 'A', t: ONTEM, sid: ONTEM }] } });

  // o build antigo escreveu de novo, depois de a migração já ter rodado
  a.window.localStorage.setItem(CHAVE_LEGADO,
    JSON.stringify({ plano: 3, done: [{ day: 'A', t: ONTEM, sid: ONTEM }] }));

  a.aceitar();
  await a.E('wipe()');

  assert.strictEqual(a.window.localStorage.getItem(CHAVE), null);
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_LEGADO), null,
    'a chave velha ficou para trás, e o próximo boot ressuscitaria o que ele apagou');
});
