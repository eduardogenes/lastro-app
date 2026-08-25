// "Isto fica no programa?"
//
// O plano vem do treinador, mas a academia tem as máquinas que tem, e alguns
// exercícios ele não quer fazer. A tela de decisão é onde uma mudança do dia
// vira — ou não — mudança permanente.
//
// O buraco que estes testes fecham: a pergunta só existia para quem tocava em
// FINALIZAR. A sessão nasce e morre sozinha por decisão do produto, e quando
// morria sozinha com mudança pendente, a resposta era decidida em silêncio,
// sempre para o mesmo lado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('finalizar pela porta da frente pergunta sobre a troca', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.E('setAlt(0, "supino-inclinado-no-smith")');
  await a.esperar();

  await a.E('finalizarSessao()');
  assert.ok(a.E('view.promo'), 'a decisão aparece');
  assert.match(a.texto('.htitle'), /programa/i);
  assert.ok(a.doc.getElementById('app').textContent.includes('Supino inclinado no Smith'),
    'e diz qual foi a mudança');
  a.fechar();
});

test('série a mais também vira pergunta', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.E('mudaSeries(0, 1)');
  await a.esperar();
  await a.E('finalizarSessao()');

  const P = a.J('view.promo');
  assert.strictEqual(P.mods.length, 1);
  assert.strictEqual(P.mods[0].k, 'sets');
  assert.strictEqual(P.dec[0], 'hoje', 'o padrão é conservador: não mexe no oficial');
  a.fechar();
});

test('levar para o oficial muda o programa; só hoje não muda', async () => {
  const a = await app();
  const antes = a.E('S.prog.A.ex[0].s');

  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.E('mudaSeries(0, 1)');
  await a.esperar();
  await a.E('finalizarSessao()');
  a.E('decidePromo(0, "oficial")');
  await a.E('concluirPromo()');
  await a.esperar();

  assert.strictEqual(a.E('S.prog.A.ex[0].s'), antes + 1, 'o programa mudou');
  assert.strictEqual(a.E('S.promoPendente'), null, 'e nada ficou pendente');
  assert.ok(a.J('S.progLog').length > 0, 'a mudança fica registrada com data');
  a.fechar();
});

test('sessão que morre sozinha guarda a pergunta para a próxima abertura', async () => {
  // é o caso real: ele sai da academia sem tocar em finalizar
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.E('setAlt(0, "supino-inclinado-no-smith")');
  await a.esperar();

  // quatro horas sem tocar em nada: o app encerra por conta própria
  a.E('S.sessao.ultima = Date.now() - 5 * 3600 * 1000');
  a.E('encerraSePreciso()');
  await a.esperar();

  assert.strictEqual(a.E('S.sessao'), null, 'a sessão fechou');
  const g = a.J('S.promoPendente');
  assert.ok(g, 'e a pergunta ficou guardada');
  assert.strictEqual(g.day, 'A');
  assert.strictEqual(g.mods.length, 1);
  a.fechar();
});

test('a pergunta guardada aparece ao abrir o app de novo', async () => {
  const t = Date.now() - 2 * 3600 * 1000;
  const a = await app({ estado: {
    logs: {}, done: [],
    promoPendente: { day: 'A', t: t, mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } });
  await a.esperar();
  assert.ok(a.E('view.promo'), 'a decisão abre sozinha');
  assert.strictEqual(a.E('view.promo.guardada'), true);
  assert.ok(a.doc.getElementById('app').textContent.includes('Pushdown'));
  a.fechar();
});

test('a pergunta guardada não interrompe um treino em andamento', async () => {
  // perguntar sobre o programa enquanto ele registra série é atrapalhar a
  // única coisa que o app existe para não atrapalhar
  const agora = Date.now();
  const a = await app({ estado: {
    logs: {}, done: [{ day: 'A', t: agora, sid: agora, dur: 0 }],
    sessao: { day: 'A', inicio: agora, ultima: agora, sid: agora },
    promoPendente: { day: 'B', t: agora - 86400000, mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } });
  await a.esperar();
  assert.ok(!a.E('view.promo'), 'a pergunta espera a sessão acabar');
  assert.ok(a.E('S.promoPendente'), 'mas continua guardada');
  a.fechar();
});

test('sair sem responder mantém o conservador e não repete a pergunta', async () => {
  const t = Date.now() - 2 * 3600 * 1000;
  const a = await app({ estado: {
    logs: {}, done: [],
    promoPendente: { day: 'A', t: t, mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } });
  await a.esperar();
  const antes = a.E('S.prog.A.ex[7] ? S.prog.A.ex[7].s : 0');

  a.E('voltarDoPromo()');
  await a.esperar();
  assert.strictEqual(a.E('view.promo'), null);
  assert.strictEqual(a.E('S.promoPendente'), null, 'não fica reaparecendo para sempre');
  assert.strictEqual(a.E('S.prog.A.ex[7] ? S.prog.A.ex[7].s : 0'), antes, 'e o oficial não mudou');
  a.fechar();
});
