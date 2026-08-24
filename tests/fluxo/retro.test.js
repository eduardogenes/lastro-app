// Registro retroativo: treino do plano lançado em data passada, e treino
// avulso, que é presença sem ser o programa.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

const ONTEM = () => Date.now() - DIA;

test('treino do plano lançado sem detalhar', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + ONTEM() + ')');
  a.E('addSet("tipo","D")');
  a.E('addSet("dur",60)');
  await a.E('gravarRetro(false)');
  await a.esperar();

  const m = a.J('S.done[S.done.length-1]');
  assert.strictEqual(m.day, 'D');
  assert.strictEqual(m.retro, 1);
  assert.strictEqual(m.dur, 60 * 60000);
  assert.ok(a.toast().includes('Treino D registrado'));
  // depois de D vem E desde o plano 5, quando as letras foram alfabetizadas
  assert.strictEqual(a.E('nextDay()'), 'E', 'a rotação segue o treino lançado');
  a.fechar();
});

test('done fica ordenado por data mesmo lançando para trás', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);          // sessão de hoje
  a.E('abrirAdicionar(' + (Date.now() - 3 * DIA) + ')');
  a.E('addSet("tipo","B")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  assert.ok(a.E('S.done.every(function (x,i,arr) { return i === 0 || arr[i-1].t <= x.t; })'));
  a.fechar();
});

test('treino avulso exige grupo muscular', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + ONTEM() + ')');
  a.E('addSet("tipo","livre")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  assert.ok(a.toast().includes('grupo muscular'));
  assert.strictEqual(a.E('S.done.length'), 0);
  a.fechar();
});

test('treino avulso é presença, não é o programa', async () => {
  const a = await app();
  a.E('abrirAdicionar(' + ONTEM() + ')');
  a.E('addSet("tipo","livre")');
  a.E('addSet("grupo","peito")');
  a.E('addSet("grupo","tríceps")');
  a.E('addSet("dur",45)');
  await a.E('gravarRetro(false)');
  await a.esperar();

  const m = a.J('S.done.filter(function (x) { return x.livre; })[0]');
  assert.deepStrictEqual(m.grupos, ['peito', 'tríceps']);
  assert.strictEqual(m.dur, 45 * 60000);
  assert.strictEqual(m.day, undefined, 'avulso não tem letra de treino');

  assert.strictEqual(a.E('nextDay()'), 'A', 'rotação intocada');
  assert.strictEqual(a.E('sessoesDeTrabalho()'), 0, 'fora da conta das 48');
  a.fechar();
});

test('preencher os exercícios grava na data do treino, não na de hoje', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.E('abrirAdicionar(' + ontem + ')');
  a.E('addSet("tipo","B")');
  a.E('addSet("dur",50)');
  await a.E('gravarRetro(true)');
  await a.esperar();

  assert.strictEqual(a.E('S.sessao.retro'), 1);
  assert.strictEqual(a.E('view.day'), 'B');

  a.preencher(0, 0, 60, 12);
  const entrada = a.log('B',0)[0];
  assert.strictEqual(new Date(entrada.t).toDateString(), new Date(ontem).toDateString());

  await a.E('concluirRetro()');
  await a.esperar();
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.E('S.done.filter(function (x) { return x.day === "B"; })[0].dur'), 50 * 60000,
    'duração informada no formulário não é sobrescrita pelo encerramento');
  a.fechar();
});

test('abrir retroativo com treino em andamento encerra o de hoje', async () => {
  // Antes disso a sessão de hoje ficava órfã e perdia a duração.
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('S.sessao.inicio = Date.now() - 50*60000');

  a.E('abrirAdicionar(' + ONTEM() + ')');
  a.E('addSet("tipo","C")');
  await a.E('gravarRetro(true)');
  await a.esperar();

  const hoje = a.J('S.done.filter(function (x) { return x.day === "A"; })[0]');
  assert.ok(hoje.dur >= 49 * 60000 && hoje.dur <= 51 * 60000, 'duração de hoje foi gravada');
  assert.strictEqual(a.E('S.sessao.day'), 'C');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1, 'séries de hoje preservadas');
  a.fechar();
});

test('sessão retroativa esquecida encerra na virada do dia de uso', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.E('abrirAdicionar(' + ontem + ')');
  a.E('addSet("tipo","C")');
  await a.E('gravarRetro(true)');
  await a.esperar();
  a.preencher(0, 0, 100, 8);

  const estado = a.J('S');
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
  const vazios = a.$$('.cal-d:not(.feito):not(.futuro)');
  assert.ok(vazios.length > 0);
  a.clicar(vazios[0]);
  assert.ok(a.E('view.add'), 'tocar num dia vazio abre o lançamento retroativo');
  a.fechar();
});

test('apagar registro avulso', async () => {
  const a = await app();
  const t = Date.now() - 2 * DIA;
  a.E('abrirAdicionar(' + t + ')');
  a.E('addSet("tipo","livre")');
  a.E('addSet("grupo","dorsal")');
  await a.E('gravarRetro(false)');
  await a.esperar();

  const marca = a.J('S.done[0]');
  a.E('abrirSessao(' + marca.t + ')');
  assert.strictEqual(a.texto('.htitle'), 'dorsal');

  await a.E('apagarMarca(' + marca.t + ')');
  await a.esperar();
  assert.strictEqual(a.E('S.done.length'), 0);
  a.fechar();
});
