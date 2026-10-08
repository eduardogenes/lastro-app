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
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  await a.v('finalizarSessao');
  assert.ok(a.vista().promo, 'a decisão aparece');
  assert.match(a.texto('.htitle'), /programa/i);
  assert.ok(a.doc.getElementById('app').textContent.includes('Supino inclinado no Smith'),
    'e diz qual foi a mudança');
  a.fechar();
});

test('série a mais também vira pergunta', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');

  const P = a.vista().promo;
  assert.strictEqual(P.mods.length, 1);
  assert.strictEqual(P.mods[0].k, 'sets');
  assert.strictEqual(P.dec[0], 'hoje', 'o padrão é conservador: não mexe no oficial');
  a.fechar();
});

test('levar para o oficial muda o programa; só hoje não muda', async () => {
  const a = await app();
  const antes = a.S().prog.A.ex[0].s;

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  a.v('decidePromo', 0, 'oficial');
  await a.v('concluirPromo');
  await a.esperar();

  assert.strictEqual(a.S().prog.A.ex[0].s, antes + 1, 'o programa mudou');
  // coleção desde o plano 10; era documento, e "nada pendente" era `null`
  assert.deepStrictEqual(a.S().promoPendente, [], 'e nada ficou pendente');
  assert.ok(a.S().progLog.length > 0, 'a mudança fica registrada com data');
  a.fechar();
});

test('sessão que morre sozinha guarda a pergunta para a próxima abertura', async () => {
  // é o caso real: ele sai da academia sem tocar em finalizar
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  // quatro horas sem tocar em nada: o app encerra por conta própria
  a.E('S.sessao.ultima = Date.now() - 5 * 3600 * 1000');
  a.v('encerraSePreciso');
  await a.esperar();

  assert.strictEqual(a.S().sessao, null, 'a sessão fechou');
  const g = a.S().promoPendente[0];   // coleção desde o plano 10
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
  assert.ok(a.vista().promo, 'a decisão abre sozinha');
  assert.strictEqual(a.vista().promo.guardada, true);
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
  assert.ok(!a.vista().promo, 'a pergunta espera a sessão acabar');
  assert.ok(a.S().promoPendente, 'mas continua guardada');
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

  a.v('voltarDoPromo');
  await a.esperar();
  assert.strictEqual(a.vista().promo, null);
  assert.deepStrictEqual(a.S().promoPendente, [], 'não fica reaparecendo para sempre');
  assert.strictEqual(a.E('S.prog.A.ex[7] ? S.prog.A.ex[7].s : 0'), antes, 'e o oficial não mudou');
  a.fechar();
});

test('a decisão é um destino: entra no topo e devolve a posição ao voltar', async () => {
  // Ela abre no meio de um treino rolado até o sétimo exercício. Sem o par
  // entra/sai, voltar sem responder caía na rolagem da tela da decisão — que é
  // curta — e o exercício em que ele tinha parado sumia.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  a.E('window.scrollY = 980');            // jsdom não rola sozinho
  await a.v('finalizarSessao');
  assert.strictEqual(a.dado('scrollDoDestino')['promo'], 980, 'guardou antes de trocar a tela');

  a.v('voltarDoPromo');
  await a.esperar();
  assert.strictEqual(a.dado('scrollDoDestino')['promo'], undefined, 'devolveu, sem deixar lixo');
  a.fechar();
});

test('responder a decisão é fim de fluxo: não devolve posição nenhuma', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  a.E('window.scrollY = 980');
  await a.v('finalizarSessao');
  a.v('decidePromo', 0, 'oficial');
  a.v('motivoPromo', 'decisao');
  await a.v('concluirPromo');
  await a.esperar();

  // O dia girou e a sessão encerrou: a posição do treino de ontem não é a dele.
  assert.strictEqual(a.dado('scrollDoDestino')['promo'], undefined);
  a.fechar();
});

// ---------------------------------------------------------------------------
// As duas portas da decisão: `ctx.concluiPromo` e `ctx.voltaDoPromo`
// ---------------------------------------------------------------------------
//
// Por que estas duas primeiro, dentro do assunto: são as únicas chaves daqui
// que ESCREVEM no programa oficial. Uma regressão nelas não aparece no dia —
// aparece semanas depois, como um programa que mudou sem ninguém ter decidido,
// ou como uma decisão respondida que não valeu.
//
// O QUE ESTE GRUPO PROVA: que a chave `ctx.concluiPromo` leva ao oficial o que
// foi marcado 'oficial' e **só** isso, e que `ctx.voltaDoPromo` sai mantendo o
// conservador. Os casos acima provam o mesmo das funções de módulo
// (`concluirPromo`, `voltarDoPromo`); o que falta a eles é a CHAVE. Uma
// `CTX.concluiPromo` ligada na função errada — ou sumida — passa por todos
// eles e tira a decisão da tela sem um teste vermelho.
//
// O QUE ESTE GRUPO NÃO COBRE: que o botão da tela esteja ligado nelas. Chamar
// o verbo prova que a capacidade existe no MODELO, não que o dedo a alcança.

test('ctx.concluiPromo leva ao oficial só o que foi marcado oficial', async () => {
  const a = await app();
  const antes = a.S().prog.A.ex.map(function (x) { return x.s; });

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  a.v('mudaSeries', 1, 1);
  await a.esperar();
  await a.v('finalizarSessao');

  const P = a.vista().promo;
  assert.strictEqual(P.mods.length, 2, 'duas mudanças pendentes — pré-condição');
  assert.deepStrictEqual(P.dec, ['hoje', 'hoje'], 'e as duas no padrão conservador');

  a.v('decidePromo', 0, 'oficial');          // a primeira vai; a segunda fica
  a.v('ctx.concluiPromo');
  await a.esperar(60);

  const depois = a.S().prog.A.ex.map(function (x) { return x.s; });
  assert.strictEqual(depois[0], antes[0] + 1, 'a marcada subiu no oficial');
  assert.strictEqual(depois[1], antes[1],
    'e a que ficou em "hoje" NÃO subiu: a decisão é por mudança, não por sessão');
  assert.deepStrictEqual(depois.slice(2), antes.slice(2), 'o resto do dia intocado');

  assert.strictEqual(a.vista().promo, null, 'a pergunta fechou');
  assert.deepStrictEqual(a.S().promoPendente, [], 'e não ficou guardada para depois');
  assert.strictEqual(a.S().progLog.length, 1,
    'uma linha de log, para responder "por que isso mudou?" daqui a dois meses');
  // RESPONDER encerra o treino. É o que separa esta chave da outra: sem esta
  // asserção, trocar `concluiPromo` por `voltaDoPromo` no fonte deixa o caso
  // verde — com uma mudança marcada 'hoje' as duas chaves terminam no mesmo
  // lugar, e foi uma quebra deliberada que mostrou isso.
  assert.strictEqual(a.S().sessao, null, 'a sessão encerrou junto: responder é fim de fluxo');
  assert.ok(/mudança levada/.test(a.toast()), 'e o app diz o que levou: ' + a.toast());
  a.fechar();
});

test('ctx.voltaDoPromo sai sem responder e o oficial fica como estava', async () => {
  const a = await app();
  const antes = a.S().prog.A.ex[0].s;

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  assert.ok(a.vista().promo, 'a pergunta abriu — pré-condição');

  a.v('ctx.voltaDoPromo');
  await a.esperar(60);

  assert.strictEqual(a.vista().promo, null, 'a tela fechou');
  assert.strictEqual(a.S().prog.A.ex[0].s, antes,
    'sair sem responder mantém o conservador: o oficial não muda');
  assert.deepStrictEqual(a.S().promoPendente, [],
    'e a pergunta não fica reaparecendo para sempre');
  assert.strictEqual((a.S().progLog || []).length, 0, 'nada a registrar: nada mudou');
  // SAIR não encerra o treino: o fonte diz "a sessão continua aberta até ele
  // decidir". É esta asserção que distingue esta chave de `ctx.concluiPromo` —
  // sem ela, as duas passam o caso, e foi a quebra deliberada que mostrou.
  assert.ok(a.S().sessao, 'a sessão continua ABERTA: sair da pergunta não é finalizar');
  assert.strictEqual(a.S().sessao.day, 'A');
  assert.ok(!/encerrado/.test(a.toast() || ''), 'e o app não diz que encerrou: ' + a.toast());
  a.fechar();
});
