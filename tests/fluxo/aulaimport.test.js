// Importar a aula do box escrita fora do app, com os quadros reais.
//
// O formato está em docs/AULA-IMPORTACAO.md e a leitura em dominio/aula.ts.
//
// A aula do box NÃO SE SABE ANTES: ele descobre o que vai ser quando entra. Por
// isso a importação preenche o DIA, e não a biblioteca de modelos — reusar é
// decisão separada, para quando ele reconhecer uma aula repetida.
//
// Fica separado de aula.test.js, que cobre as três portas anteriores: repetir
// o sábado, salvar modelo e a lista rápida.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** O quadro de 20/09/2026, como em docs/AULA-IMPORTACAO.md. */
const HYROX_MZ = {
  lastro: 'aula', v: 1, nome: 'HYROX MZ', data: '2026-09-20',
  quadro: 'HYROX MZ!\n· PLIO + SPRINT (15MIN)\n· WOD — T.C 20MIN\n    150 WALL BALL\n    1KM RUN',
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

/** O segundo quadro: três blocos de round, e nenhum movimento novo. */
const HYROX_FRIDAY = {
  lastro: 'aula', v: 1, nome: 'Hyrox Friday',
  quadro: 'Hyrox Friday\n3 RNDS: 400m Ski · 30m Sled-Push · 25m Walking Lunges\nE5MIN = 15m Burpee Broad Jumps',
  mov: [
    { n: 'Ski erg', s: 3, q: 400, u: 'm' },
    { n: 'Sled push', s: 3, q: 30, u: 'm' },
    { n: 'Lunge', s: 3, q: 25, u: 'm' },
    { n: 'Remo ergômetro', s: 3, q: 400, u: 'm' },
    { n: 'Sled pull', s: 3, q: 30, u: 'm' },
    { n: 'Wall balls', s: 3, q: 25, u: 'rep' },
    { n: 'Corrida', s: 3, q: 400, u: 'm' },
    { n: 'Farmers carry', s: 3, q: 30, u: 'm' },
    { n: 'Burpee broad jump', s: 1, q: 15, u: 'm' }
  ]
};

const cola = (a, o) => a.E(`importaAulaColada(${JSON.stringify(JSON.stringify(o))})`);

/** O app no sábado, que é o dia aberto. */
async function noBox() {
  const a = await app();
  a.E('go("HX")');
  assert.ok(a.E('diaAberto(view.day)'), 'o sábado é o dia aberto');
  return a;
}

// ---------- o caminho ----------

test('a aula colada preenche o DIA, não a biblioteca de modelos', async () => {
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();

  assert.strictEqual(a.E('treino(view.day).ex.length'), 8, 'os oito movimentos entraram no dia');
  assert.strictEqual(a.J('S.aulas').length, 0, 'e nada virou modelo: reusar é decisão dele');
  a.fechar();
});

test('entra prescrição, nunca resultado', async () => {
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();
  assert.strictEqual(a.E('S.sessao'), null, 'colar não abre sessão');
  assert.strictEqual(a.E('Object.keys(S.logs).length'), 0, 'e não registra série nenhuma');
  a.fechar();
});

test('o vocabulário novo é cadastrado antes do dia ser montado', async () => {
  const a = await noBox();
  assert.strictEqual(a.E('!!CAT["squat-jump"]'), false);
  await cola(a, HYROX_MZ);
  await a.esperar();

  ['squat-jump', 'split-jump', 'abdominal-no-remador'].forEach(function (k) {
    assert.ok(a.E(`!!CAT[${JSON.stringify(k)}]`), k + ' não foi cadastrado');
    assert.strictEqual(a.E(`CAT[${JSON.stringify(k)}].u`), 'rep');
    assert.strictEqual(a.E(`S.ex[${JSON.stringify(k)}].meu`), 1);
  });
  a.fechar();
});

test('corrida entra três vezes: é a mesma série histórica, distâncias diferentes', async () => {
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();
  const qs = a.J('treino(view.day).ex.filter(function (e) { return e.id === "corrida"; }).map(function (e) { return e.q; })');
  assert.deepStrictEqual(qs, [200, 300, 1000]);
  a.fechar();
});

test('o quadro de blocos de round entra sem cadastrar nada', async () => {
  // As nove estações sobreviveram em SIMULACAO_HYROX quando o sábado deixou de
  // ser simulação, e é isto que faz `novo` ser exceção e não regra.
  const a = await noBox();
  const antes = a.E('Object.keys(S.ex).length');
  await cola(a, HYROX_FRIDAY);
  await a.esperar();

  assert.strictEqual(a.E('Object.keys(S.ex).length'), antes, 'nenhum cadastro novo');
  assert.strictEqual(a.E('treino(view.day).ex.length'), 9);
  a.fechar();
});

test('a grandeza é do movimento, nunca do bloco', async () => {
  // No mesmo round, ski vai em metro e a wall ball em repetição. Um campo de
  // grandeza no bloco teria feito a wall ball virar 25 metros.
  const a = await noBox();
  await cola(a, HYROX_FRIDAY);
  await a.esperar();
  const por = a.J('treino(view.day).ex.reduce(function (o, e) { o[e.id] = e.u; return o; }, {})');
  assert.strictEqual(por['ski-erg'], 'm');
  assert.strictEqual(por['wall-balls'], 'rep');
  a.fechar();
});

// ---------- o quadro ----------

test('o quadro aparece na tela enquanto a aula acontece', async () => {
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();
  const q = a.$('.tr-quadro-t');
  assert.ok(q, 'o quadro está no alto do dia');
  assert.ok(q.textContent.includes('T.C 20MIN'), 'com o que o app não modela');
  a.fechar();
});

test('ao encerrar, o quadro vira a nota da sessão', async () => {
  // É a única chance: o quadro não se reconstrói depois a partir da
  // prescrição, como o treino de musculação se reconstrói.
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();

  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  const sid = a.E('S.sessao.sid');

  await a.E('fechaSessao("manual")');
  await a.E('save()');
  await a.esperar();

  const marca = a.J(`S.done.filter(function (x) { return x.sid === ${sid}; })[0]`);
  assert.ok(marca.obs.includes('T.C 20MIN'), 'a lousa ficou no histórico: ' + marca.obs);
  assert.strictEqual(a.E('S.quadro'), null, 'e saiu do dia');
  a.fechar();
});

test('salvar como modelo leva o quadro junto', async () => {
  // Salvar é o gesto de quem reconheceu uma aula repetida — e o modelo sem a
  // lousa perderia o time cap e os pesos na próxima vez.
  const a = await noBox();
  await cola(a, HYROX_MZ);
  await a.esperar();
  a.E('window.prompt = function () { return "Chipper do MZ"; }');
  await a.E('salvarAulaComoModelo()');
  await a.esperar();

  const m = a.J('S.aulas')[0];
  assert.strictEqual(m.nome, 'Chipper do MZ');
  assert.ok(m.quadro.includes('T.C 20MIN'));
  a.fechar();
});

test('duas aulas coladas no mesmo dia somam, e nenhuma vira modelo', async () => {
  // O quadro da semana seguinte não sobrescreve nada: não há modelo para
  // sobrescrever, que era justamente o erro da primeira versão.
  const a = await noBox();
  await cola(a, HYROX_FRIDAY);
  await a.esperar();
  await cola(a, { lastro: 'aula', v: 1, nome: 'Extra',
                  mov: [{ n: 'Burpee', s: 1, q: 30, u: 'rep' }] });
  await a.esperar();
  assert.strictEqual(a.E('treino(view.day).ex.length'), 10);
  assert.strictEqual(a.J('S.aulas').length, 0);
  a.fechar();
});

// ---------- o que o app recusa ----------

test('fora do dia aberto a aula não entra', async () => {
  // Pôr a aula do box num dia de prescrição seria emendar o programa do
  // treinador por atalho.
  const a = await app();
  a.E('go("A")');
  await cola(a, HYROX_FRIDAY);
  await a.esperar();
  assert.ok(a.toast().includes('dia aberto'), a.toast());
  a.fechar();
});

test('JSON torto não muda nada', async () => {
  const a = await noBox();
  await a.E('importaAulaColada("{ isso nao e json")');
  await a.esperar();
  assert.strictEqual(a.E('treino(view.day).ex.length'), 0);
  assert.ok(a.toast().includes('JSON inválido'), a.toast());
  a.fechar();
});

test('movimento desconhecido sem declaração é recusado inteiro', async () => {
  // Recusa a AULA, não só a linha: importar metade seria montar um dia que ele
  // acha completo.
  const a = await noBox();
  await cola(a, { lastro: 'aula', v: 1, nome: 'X',
                  mov: [{ n: 'Corrida', s: 1, q: 400, u: 'm' },
                        { n: 'Sled drag', s: 1, q: 50, u: 'm' }] });
  await a.esperar();
  assert.strictEqual(a.E('treino(view.day).ex.length'), 0, 'nem a corrida entrou');
  assert.strictEqual(a.E('!!CAT["sled-drag"]'), false);
  assert.ok(a.toast().includes('não existe no catálogo'), a.toast());
  a.fechar();
});

test('o catálogo vence o arquivo: cadastro por cima é ignorado com aviso', async () => {
  const a = await noBox();
  const antes = a.E('CAT["corrida"].u');
  await cola(a, { lastro: 'aula', v: 1, nome: 'Y',
                  mov: [{ n: 'Corrida', novo: { car: 'corpo', u: 'cal' }, s: 1, q: 15, u: 'cal' }] });
  await a.esperar();
  assert.strictEqual(a.E('CAT["corrida"].u'), antes,
    'um arquivo colado não muda a grandeza de quem tem meses de histórico');
  assert.ok(a.toast().includes('já existe'), a.toast());
  a.fechar();
});
