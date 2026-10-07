// Registro retroativo: treino do plano lançado em data passada, e treino
// avulso, que é presença sem ser o programa.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

const ONTEM = () => Date.now() - DIA;

test('treino do plano lançado sem detalhar', async () => {
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  a.v('addSet', 'tipo', 'D');
  a.v('addSet', 'dur', 60);
  await a.v('gravarRetro', false);
  await a.esperar();

  const m = a.J('S.done[S.done.length-1]');
  assert.strictEqual(m.day, 'D');
  assert.strictEqual(m.retro, 1);
  assert.strictEqual(m.dur, 60 * 60000);
  assert.ok(a.toast().includes('Treino D registrado'));
  // depois de D vem E desde o plano 5, quando as letras foram alfabetizadas
  assert.strictEqual(a.v('nextDay'), 'E', 'a rotação segue o treino lançado');
  a.fechar();
});

test('done fica ordenado por data mesmo lançando para trás', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);          // sessão de hoje
  a.v('abrirAdicionar', (Date.now() - 3 * DIA));
  a.v('addSet', 'tipo', 'B');
  await a.v('gravarRetro', false);
  await a.esperar();

  assert.ok(a.E('S.done.every(function (x,i,arr) { return i === 0 || arr[i-1].t <= x.t; })'));
  a.fechar();
});

test('treino avulso exige grupo muscular', async () => {
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  a.v('addSet', 'tipo', 'livre');
  await a.v('gravarRetro', false);
  await a.esperar();

  assert.ok(a.toast().includes('grupo muscular'));
  assert.strictEqual(a.S().done.length, 0);
  a.fechar();
});

test('treino avulso é presença, não é o programa', async () => {
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  a.v('addSet', 'tipo', 'livre');
  a.v('addSet', 'grupo', 'peito');
  a.v('addSet', 'grupo', 'tríceps');
  a.v('addSet', 'dur', 45);
  await a.v('gravarRetro', false);
  await a.esperar();

  const m = a.J('S.done.filter(function (x) { return x.livre; })[0]');
  assert.deepStrictEqual(m.grupos, ['peito', 'tríceps']);
  assert.strictEqual(m.dur, 45 * 60000);
  assert.strictEqual(m.day, undefined, 'avulso não tem letra de treino');

  assert.strictEqual(a.v('nextDay'), 'A', 'rotação intocada');
  assert.strictEqual(a.v('sessoesDeTrabalho'), 0, 'fora da conta das 48');
  a.fechar();
});

test('preencher os exercícios grava na data do treino, não na de hoje', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  a.v('addSet', 'tipo', 'B');
  a.v('addSet', 'dur', 50);
  await a.v('gravarRetro', true);
  await a.esperar();

  assert.strictEqual(a.S().sessao.retro, 1);
  assert.strictEqual(a.vista().day, 'B');

  a.preencher(0, 0, 60, 12);
  const entrada = a.log('B',0)[0];
  assert.strictEqual(new Date(entrada.t).toDateString(), new Date(ontem).toDateString());

  await a.v('concluirRetro');
  await a.esperar();
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.E('S.done.filter(function (x) { return x.day === "B"; })[0].dur'), 50 * 60000,
    'duração informada no formulário não é sobrescrita pelo encerramento');
  a.fechar();
});

test('abrir retroativo com treino em andamento encerra o de hoje', async () => {
  // Antes disso a sessão de hoje ficava órfã e perdia a duração.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.E('S.sessao.inicio = Date.now() - 50*60000');

  a.v('abrirAdicionar', ONTEM());
  a.v('addSet', 'tipo', 'C');
  await a.v('gravarRetro', true);
  await a.esperar();

  const hoje = a.J('S.done.filter(function (x) { return x.day === "A"; })[0]');
  assert.ok(hoje.dur >= 49 * 60000 && hoje.dur <= 51 * 60000, 'duração de hoje foi gravada');
  assert.strictEqual(a.S().sessao.day, 'C');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1, 'séries de hoje preservadas');
  a.fechar();
});

test('sessão retroativa esquecida encerra na virada do dia de uso', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  a.v('addSet', 'tipo', 'C');
  await a.v('gravarRetro', true);
  await a.esperar();
  a.preencher(0, 0, 100, 8);

  const estado = a.S();
  estado.sessao.tocado = Date.now() - 5 * 3600 * 1000;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.E('S.sessao'), null);
  assert.strictEqual(b.log('C',0)[0].sets.filter(Boolean).length, 1, 'o que foi preenchido fica');
  b.fechar();
});

test('dia vazio do calendário é atalho para lançar', async () => {
  const a = await app();
  a.aba('dados');
  await a.modo('treino');
  const vazios = a.$$('.cal-d:not(.feito):not(.futuro)');
  assert.ok(vazios.length > 0);
  a.clicar(vazios[0]);
  assert.ok(a.vista().add, 'tocar num dia vazio abre o lançamento retroativo');
  a.fechar();
});

test('apagar registro avulso', async () => {
  const a = await app();
  const t = Date.now() - 2 * DIA;
  a.v('abrirAdicionar', t);
  a.v('addSet', 'tipo', 'livre');
  a.v('addSet', 'grupo', 'dorsal');
  await a.v('gravarRetro', false);
  await a.esperar();

  const marca = a.S().done[0];
  a.v('abrirSessao', marca.t);
  assert.strictEqual(a.texto('.htitle'), 'dorsal');

  // pelo mesmo caminho da tela: o botão de apagar chama CTX.editaSessao
  await a.E('CTX.editaSessao(' + marca.t + ')');
  await a.esperar();
  assert.strictEqual(a.S().done.length, 0);
  a.fechar();
});
