// Importar a aula do box escrita fora do app, com o primeiro quadro real.
//
// O formato está em docs/AULA-IMPORTACAO.md e a leitura em dominio/aula.ts.
// O que esta suíte cobra é o caminho inteiro: o arquivo entra, o vocabulário
// novo vira catálogo, o modelo aparece na lista e aplica no dia.
//
// Fica separado de aula.test.js, que cobre as três portas anteriores — repetir
// o sábado, salvar modelo e a lista rápida.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** O quadro de 20/09/2026, transcrito como está em docs/AULA-IMPORTACAO.md. */
const HYROX_MZ = {
  lastro: 'aula', v: 1, nome: 'HYROX MZ', data: '2026-09-20',
  quadro: 'HYROX MZ!\n· PLIO + SPRINT (15MIN)\n    3X 15 SQUAT JUMP + 200M (20/15) REST 1MIN\n· WOD — T.C 20MIN\n    150 WALL BALL\n    1KM RUN',
  mov: [
    { n: 'Squat jump', novo: { car: 'corpo', u: 'rep' }, s: 3, q: 15, u: 'rep', d: 60 },
    { n: 'Corrida', s: 3, q: 200, u: 'm', d: 60 },
    { n: 'Split jump', novo: { car: 'corpo', u: 'rep' }, s: 3, q: 12, u: 'rep', d: 60 },
    { n: 'Corrida', s: 3, q: 300, u: 'm', d: 60 },
    { n: 'Wall balls', s: 1, q: 150, u: 'rep' },
    { n: 'Burpee broad jump', s: 1, q: 100, u: 'm' },
    { n: 'Abdominal no remador', novo: { car: 'corpo', u: 'rep' }, s: 1, q: 80, u: 'rep' },
    { n: 'Corrida', s: 1, q: 1000, u: 'm' }
  ]
};

const cola = (a, o) => a.E(`importaAulaColada(${JSON.stringify(JSON.stringify(o))})`);

test('o quadro real entra: modelo salvo e vocabulário novo cadastrado', async () => {
  const a = await app();
  assert.strictEqual(a.E('!!CAT["squat-jump"]'), false, 'não existia antes');

  await cola(a, HYROX_MZ);
  await a.esperar();

  assert.strictEqual(a.J('S.aulas').length, 1);
  const m = a.J('S.aulas')[0];
  assert.strictEqual(m.nome, 'HYROX MZ');
  assert.strictEqual(m.mov.length, 8);
  assert.strictEqual(m.data, '2026-09-20');
  assert.ok(m.quadro.includes('T.C 20MIN'), 'o quadro atravessa literal');

  // os três que faltavam entraram, e declarando o que medem
  ['squat-jump', 'split-jump', 'abdominal-no-remador'].forEach(function (k) {
    assert.ok(a.E(`!!CAT[${JSON.stringify(k)}]`), k + ' não foi cadastrado');
    assert.strictEqual(a.E(`CAT[${JSON.stringify(k)}].u`), 'rep');
    assert.strictEqual(a.E(`S.ex[${JSON.stringify(k)}].meu`), 1, 'marcado como cadastrado por ele');
  });
  a.fechar();
});

test('corrida entra três vezes: é a mesma série histórica, distâncias diferentes', async () => {
  const a = await app();
  await cola(a, HYROX_MZ);
  await a.esperar();
  const corridas = a.J('S.aulas')[0].mov.filter(function (m) { return m.id === 'corrida'; });
  assert.deepStrictEqual(corridas.map(function (m) { return m.q; }), [200, 300, 1000]);
  a.fechar();
});

test('o modelo importado aplica no dia aberto', async () => {
  const a = await app();
  await cola(a, HYROX_MZ);
  await a.esperar();

  a.E('go("HX")');
  assert.ok(a.E('diaAberto(view.day)'), 'o sábado é o dia aberto');
  const id = a.J('S.aulas')[0].id;
  await a.E(`aplicarModeloDeAula(${JSON.stringify(id)})`);
  await a.esperar();

  assert.strictEqual(a.E('treino(view.day).ex.length'), 8, 'a aula inteira entrou no dia');
  assert.ok(a.E('treino(view.day).ex.some(function (e) { return e.id === "squat-jump"; })'));
  a.fechar();
});

test('o quadro fica à vista na lista de modelos', async () => {
  const a = await app();
  await cola(a, HYROX_MZ);
  await a.esperar();
  a.E('go("HX")');
  a.E('abrirAulas()');
  await a.esperar();
  const q = a.$('.aulal-q');
  assert.ok(q, 'o quadro aparece embaixo do nome');
  assert.ok(q.textContent.includes('WALL BALL'));
  a.fechar();
});

// ---------- o que o app recusa ----------

test('JSON torto não muda nada', async () => {
  const a = await app();
  await a.E('importaAulaColada("{ isso nao e json")');
  await a.esperar();
  assert.strictEqual(a.J('S.aulas').length, 0);
  assert.ok(a.toast().includes('JSON inválido'), a.toast());
  a.fechar();
});

test('movimento desconhecido sem declaração é recusado inteiro', async () => {
  // Recusa a AULA, não só a linha: importar metade seria plantar um modelo
  // que ele acha completo.
  const a = await app();
  await cola(a, { lastro: 'aula', v: 1, nome: 'X',
                  mov: [{ n: 'Corrida', s: 1, q: 400, u: 'm' },
                        { n: 'Sled drag', s: 1, q: 50, u: 'm' }] });
  await a.esperar();
  assert.strictEqual(a.J('S.aulas').length, 0);
  assert.strictEqual(a.E('!!CAT["sled-drag"]'), false, 'e nada foi cadastrado');
  assert.ok(a.toast().includes('não existe no catálogo'), a.toast());
  a.fechar();
});

test('o mesmo nome atualiza em vez de duplicar', async () => {
  const a = await app();
  await cola(a, HYROX_MZ);
  await a.esperar();
  const id = a.J('S.aulas')[0].id;

  const semana2 = Object.assign({}, HYROX_MZ, {
    data: '2026-09-27', quadro: 'HYROX MZ!\n· 100 BURPEES',
    mov: [{ n: 'Burpee broad jump', s: 1, q: 100, u: 'm' }]
  });
  await cola(a, semana2);
  await a.esperar();

  assert.strictEqual(a.J('S.aulas').length, 1, 'uma lista com dois "HYROX MZ" não diz qual é qual');
  assert.strictEqual(a.J('S.aulas')[0].id, id, 'e é o mesmo modelo, não um novo');
  assert.strictEqual(a.J('S.aulas')[0].mov.length, 1);
  assert.strictEqual(a.J('S.aulas')[0].data, '2026-09-27', 'o quadro novo substitui o velho');
  a.fechar();
});

test('o catálogo vence o arquivo: cadastro por cima é ignorado com aviso', async () => {
  const a = await app();
  const antes = a.E('CAT["corrida"].u');
  await cola(a, { lastro: 'aula', v: 1, nome: 'Y',
                  mov: [{ n: 'Corrida', novo: { car: 'corpo', u: 'cal' }, s: 1, q: 15, u: 'cal' }] });
  await a.esperar();
  assert.strictEqual(a.E('CAT["corrida"].u'), antes,
    'um arquivo colado não muda a grandeza de quem tem meses de histórico');
  assert.ok(a.toast().includes('já existe'), a.toast());
  a.fechar();
});
