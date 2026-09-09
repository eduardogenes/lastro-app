// O turno na tela: escolher no botão PREVISTO e ver o diário responder.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function noHoje(estado) {
  const a = await app(estado ? { estado: estado } : {});
  a.aba('hoje');
  await a.esperar();
  return a;
}

/** Garante que hoje é dia de treino, e abre a folha do botão PREVISTO. */
async function abreFolha(a) {
  a.E('diaDeComida().cadencia = "treino"');
  a.E('render()');
  await a.esperar();
  a.clicar('.ins-estado');
  await a.esperar();
}

test('o botão PREVISTO oferece os três turnos, com a hora de cada um', async () => {
  const a = await noHoje();
  await abreFolha(a);
  const ops = a.$$('.fd-turno-op').map(b => b.textContent.replace(/\s+/g, ' ').trim());
  assert.strictEqual(ops.length, 3);
  assert.ok(ops[0].indexOf('manhã') >= 0 && ops[0].indexOf('06:15') >= 0,
    'a manhã mostra a hora do PLANO: ' + ops[0]);
  assert.ok(ops[1].indexOf('12:15') >= 0, ops[1]);
  assert.ok(ops[2].indexOf('18:15') >= 0, ops[2]);
  a.fechar();
});

test('cada opção diz de antemão qual refeição vira o pós-treino', async () => {
  const a = await noHoje();
  await abreFolha(a);
  const t = a.J('CTX.seletorDeDia().turnos');
  assert.strictEqual(t[0].pos, 'Café da manhã');
  assert.strictEqual(t[1].pos, 'Almoço');
  assert.strictEqual(t[2].pos, 'Jantar',
    'ver a consequência antes de tocar é o que torna isto uma decisão');
  a.fechar();
});

test('escolher o turno reordena o diário', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);          // noite
  await a.esperar();

  const linhas = a.$$('.ins-tl-hora, .tl-hora').map(e => e.textContent.trim());
  const ordem = a.J('CTX.hoje().refs.map(function(r){return r.t+" "+r.id})');
  assert.deepStrictEqual(ordem, [
    '08:00 pos', '12:30 almoco', '16:00 lanche', '17:45 pre', '18:15 treino', '19:30 jantar'
  ], 'o pré e o treino andam; o café continua às 8h');
  assert.ok(linhas.length === 0 || linhas.length === 6);
  a.fechar();
});

test('o selo de pós-treino aparece na refeição certa', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);
  await a.esperar();
  // O selo tem elemento próprio: colado no nome ele virava "Almoço · pós-tr…",
  // porque o nome corta com reticências e o papel é o que não pode ser cortado.
  const comSelo = a.$$('.ins-tl').filter(function (l) { return l.querySelector('.ins-tl-selo'); });
  assert.strictEqual(comSelo.length, 1, 'um papel, uma refeição');
  assert.strictEqual(comSelo[0].querySelector('.ins-tl-nome').textContent, 'Jantar',
    'à noite o jantar recebe o papel');
  assert.strictEqual(comSelo[0].querySelector('.ins-tl-selo').textContent, 'pós-treino');
  assert.strictEqual(a.J('CTX.hoje().posTreino'), 'jantar');
  a.fechar();
});

test('o turno é ajuste de HOJE: o plano não se move', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[1]);          // tarde
  await a.esperar();
  assert.strictEqual(a.J('S.dia.turno'), 'tarde', 'mora no dia, que zera com a data');
  const plano = a.J('planoDeComida().map(function(r){return r.t+" "+r.id})');
  assert.deepStrictEqual(plano.slice(0, 2), ['05:45 pre', '06:15 treino'],
    'em COMIDA a edição vale para todo dia — e ela não aconteceu');
  a.fechar();
});

test('o almoço caindo dentro do treino é apontado, não movido', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[1]);          // tarde: treino 12:15, almoço 12:30
  await a.esperar();
  const aviso = a.texto('.hj-conflito');
  assert.ok(aviso && /Almoço/.test(aviso) && /dentro do treino/.test(aviso), aviso);
  assert.strictEqual(a.J('CTX.hoje().refs.filter(function(r){return r.id==="almoco"})[0].t'),
    '12:30', 'o app não escolhe um horário que ninguém prescreveu');
  a.fechar();
});

test('voltar para a manhã desfaz o deslocamento', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);
  await a.esperar();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[0]);
  await a.esperar();
  // `E` e não `J`: JSON.stringify(undefined) não é JSON, e ausência é o ponto
  assert.strictEqual(a.E('S.dia.turno'), undefined, 'manhã é a ausência de deslocamento');
  assert.strictEqual(a.E('"turno" in S.dia'), false, 'a chave sai, não fica como null');
  assert.strictEqual(a.J('CTX.hoje().refs[0].t'), '05:45');
  a.fechar();
});

test('em dia de descanso o turno não é oferecido', async () => {
  const a = await noHoje();
  a.E('diaDeComida().cadencia = "descanso"');
  a.E('render()');
  await a.esperar();
  a.clicar('.ins-estado');
  await a.esperar();
  assert.strictEqual(a.$$('.fd-turno-op').length, 0,
    'sem treino não há turno de treino a escolher');
  a.fechar();
});

test('a migração 7→8 tira o papel do nome, e só do nome que era dela', async () => {
  const a = await app({ estado: { plano: 7, comida: {
    plano: [{ id: 'pos', t: '08:00', n: 'Café da manhã / pós-treino',
              tag: '', quando: 'sempre', itens: [] }],
    alimentos: {}, ocultos: {} } } });
  assert.strictEqual(a.J('S.comida.plano[0].n'), 'Café da manhã');
  assert.strictEqual(a.J('S.plano'), a.E('PLANO_ATUAL'));
  a.fechar();

  const b = await app({ estado: { plano: 7, comida: {
    plano: [{ id: 'pos', t: '08:00', n: 'Meu café',
              tag: '', quando: 'sempre', itens: [] }],
    alimentos: {}, ocultos: {} } } });
  assert.strictEqual(b.J('S.comida.plano[0].n'), 'Meu café',
    'se ele já tinha renomeado, o nome dele fica');
  b.fechar();
});
