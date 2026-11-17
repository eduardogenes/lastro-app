// A aula do box no visual novo (direção 3, Fase 3): o dia aberto começa pela
// última aula (ou um modelo, ou o texto colado), e a lista rápida grava no fim
// da aula pela porta de sempre dela, o mesmo valor em todas as passadas.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/** Um sábado já registrado: quatro movimentos, cada um com a sua medida. */
function comSabadoAnterior() {
  const agora = agoraEstavel(8);
  const sid = agora - 7 * DIA;
  return {
    agora: agora,
    estado: {
      plano: 7,
      logs: {
        'corrida':         [{ t: sid,     sid: sid, u: 'm',   q: 400, sets: [[0, 105], [0, 108]] }],
        'remo-ergometro':  [{ t: sid + 1, sid: sid, u: 'm',   q: 500, sets: [[0, 110], [0, 112]] }],
        'wall-balls':      [{ t: sid + 2, sid: sid, u: 'rep', q: 20,  sets: [[9, 20], [9, 18]] }],
        'assault-bike':    [{ t: sid + 3, sid: sid, u: 'cal', q: 15,  sets: [[0, 62]] }]
      },
      done: [{ day: 'HX', t: sid, sid: sid, dur: 3600000 }]
    }
  };
}

async function naAula() {
  const a = await app(comSabadoAnterior());
  await a.pronto();
  a.E('CTX.alternaVisual()');
  a.E('view.day = "HX"');
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  // o dia foi trocado por fora do app: o desenho é pedido à mão, como no teste antigo da aula
  a.v('render');
  await a.esperar();
  return a;
}

test('o dia aberto começa pela aula de hoje: repetir a última monta os movimentos', async () => {
  const a = await naAula();
  assert.ok(a.$('[data-a="aula-repete"]'), 'repetir a última aula');
  assert.ok(/4 movimentos/.test(a.texto('[data-a="aula-repete"]')));
  a.clicar('[data-a="aula-repete"]');
  await a.esperar(60);
  assert.strictEqual(a.vJ('treino', 'HX').ex.length, 4, 'os quatro movimentos');
  assert.strictEqual(a.$$('.v3-rapida').length, 4, 'e a lista rápida, um por movimento');
  a.fechar();
});

test('a lista rápida grava o valor em todas as passadas, e "série por série" leva ao treino em foco', async () => {
  const a = await naAula();
  a.clicar('[data-a="aula-repete"]');
  await a.esperar(60);
  const wb = a.vJ('treino', 'HX').ex.findIndex(x => x.id === 'wall-balls');
  const campo = a.$('#rapida-v-' + wb);
  campo.value = '19';
  campo.dispatchEvent(new a.window.Event('change', { bubbles: true }));
  await a.esperar(60);
  const log = a.E(`JSON.stringify(S.logs['wall-balls'].slice(-1)[0].sets)`);
  const sets = JSON.parse(log);
  assert.ok(sets.length >= 2 && sets.every(s => s && s[1] === 19), 'as passadas todas com 19: ' + log);
  assert.ok(a.E('!!S.sessao'), 'a sessão abriu');

  a.clicar('[data-a="aula-por-serie"]');
  await a.esperar();
  assert.ok(a.$('[data-a="serie-feita"]'), 'série por série');
  a.fechar();
});
