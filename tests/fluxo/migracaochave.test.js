// A migração das chaves de storage, de quando o produto deixou de se chamar
// "Treino". São DUAS, e elas se migram de jeitos diferentes de propósito.
//
// Regra 2 do projeto: nenhuma mudança pode quebrar o que já está salvo. Trocar
// o nome da chave do HISTÓRICO é a mudança com mais como quebrar que existe, e
// por isso ela não é um replace: o boot FUNDE os dois lados com a mesma
// `funde()` da sincronização e só apaga a chave velha depois de a nova estar
// gravada.
//
// A chave da SESSÃO DA NUVEM não funde: um par de tokens não tem o que fundir
// com outro, e errar ali custa um login, nunca uma série. Lá a regra é promover
// a velha quando ela é a única, e apagá-la sempre.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, CHAVE, CHAVE_LEGADO, CHAVE_NUVEM, CHAVE_NUVEM_LEGADO } from './harness.js';

/** Uma sessão da nuvem plausível, com token que ainda não expirou. */
function sessao(email) {
  return {
    token: 'tok-' + email, refresh: 'ref-' + email,
    expira: Date.now() + 3600000, uid: 'uid-1', email: email
  };
}

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

test('a sessão da nuvem é promovida da chave velha, e a velha some', async () => {
  const s = sessao('eu@exemplo.com');
  const a = await app({ chaves: { [CHAVE_NUVEM_LEGADO]: s } });

  assert.strictEqual(a.E('NUVEM.sessao() && NUVEM.sessao().email'), 'eu@exemplo.com',
    'quem já estava logado continua logado depois do rename');
  assert.deepStrictEqual(
    JSON.parse(a.window.localStorage.getItem(CHAVE_NUVEM)), s,
    'a sessão foi regravada na chave nova, inteira');
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM_LEGADO), null,
    'a chave velha só some depois de a nova estar gravada');
});

test('com as duas chaves, a nova manda e a velha some assim mesmo', async () => {
  // A janela real: publicada a versão nova, o iPhone ainda serve o build antigo
  // por uma ou duas aberturas, e ele regrava a chave velha depois de a nova já
  // existir. Aqui não há fusão possível — a nova é a que este build escreveu,
  // e a velha fica para trás em vez de ressuscitar na abertura seguinte.
  const a = await app({
    chaves: {
      [CHAVE_NUVEM]: sessao('nova@exemplo.com'),
      [CHAVE_NUVEM_LEGADO]: sessao('velha@exemplo.com')
    }
  });

  assert.strictEqual(a.E('NUVEM.sessao() && NUVEM.sessao().email'), 'nova@exemplo.com');
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM_LEGADO), null);
});

test('sem nenhuma das duas, ninguém está logado e nada é criado', async () => {
  const a = await app();

  assert.strictEqual(a.E('NUVEM.sessao()'), null);
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM), null,
    'ler a chave não pode criar a chave');
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM_LEGADO), null);
});

test('sair apaga as duas chaves da sessão', async () => {
  // A velha pode ter sobrado de uma migração interrompida. Sessão órfã com
  // token vivo é pior do que uma chave a mais.
  const a = await app({ chaves: { [CHAVE_NUVEM]: sessao('eu@exemplo.com') } });
  a.window.localStorage.setItem(CHAVE_NUVEM_LEGADO, JSON.stringify(sessao('eu@exemplo.com')));

  await a.E('NUVEM.sair()');

  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM), null);
  assert.strictEqual(a.window.localStorage.getItem(CHAVE_NUVEM_LEGADO), null);
});
