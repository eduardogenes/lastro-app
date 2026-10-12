// "Isto fica no programa?"
//
// O plano vem do treinador, mas a academia tem as máquinas que tem, e alguns
// exercícios ele não quer fazer. Uma mudança do dia vira — ou não — mudança
// permanente, e estes casos guardam o MECANISMO que a carrega até a decisão.
//
// A PERGUNTA SAIU DO FIM DO TREINO (decisão D1). A tela de decisão existia e
// interrompia o fecho: finalizar abria uma tela cheia perguntando sobre o
// PROGRAMA, que é a pergunta menos urgente que existe neste produto, no momento
// em que ele acabou de treinar. Agora a mudança é CARREGADA para a fila de
// Prescrição, com a conta de volume e o vencimento ao lado, e lá ela é
// respondida com calma.
//
// O que estes casos passam a guardar é o carregador, nos DOIS fechos — e é o
// ponto que o §3.6 do plano nomeia: `fechaSessao` só copiava a mudança no fecho
// automático, então tirar a pergunta sem escrever o carregador no fecho manual
// faria finalizar no toque DESCARTAR a mudança em silêncio. O F280 nominal.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('finalizar pela porta da frente CARREGA a troca, sem interromper', async () => {
  // Reescrito pela D1, e é a asserção mais importante deste arquivo: ela dizia
  // "a decisão aparece", e o que a substitui é que a mudança NÃO SE PERDE.
  // Finalizar no toque deixou de abrir tela e passou a enfileirar — e sem esta
  // linha no fonte, a mudança seria descartada em silêncio.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  await a.v('finalizarSessao');
  await a.esperar(60);

  assert.strictEqual(a.S().sessao, null, 'a sessão encerrou de verdade, sem escala');
  const g = (a.S().promoPendente || [])[0];
  assert.ok(g, 'e a mudança ficou na fila');
  assert.strictEqual(g.day, 'A');
  assert.strictEqual(g.mods.length, 1);
  assert.ok(g.resumoMods.some(function (t) { return /Supino inclinado no Smith/.test(t); }),
    'dizendo qual foi: ' + g.resumoMods.join(' · '));
  a.fechar();
});

test('série a mais também é carregada, e o oficial fica intacto até a resposta', async () => {
  const a = await app();
  const antes = a.S().prog.A.ex[0].s;
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  await a.esperar(60);

  const g = (a.S().promoPendente || [])[0];
  assert.ok(g, 'a mudança está na fila');
  assert.strictEqual(g.mods.length, 1);
  assert.strictEqual(g.mods[0].k, 'sets');
  // O padrão continua conservador, e agora ele é o ESTADO e não um `dec` na
  // tela: enquanto ninguém responde, o oficial não mexeu.
  assert.strictEqual(a.S().prog.A.ex[0].s, antes,
    'o padrão é conservador: o oficial não muda sem resposta');
  a.fechar();
});

test('responder "virou permanente" muda o programa; não responder não muda', async () => {
  const a = await app();
  const antes = a.S().prog.A.ex[0].s;

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  await a.esperar(60);
  // A resposta é de Prescrição agora, por mudança, e com o motivo opcional.
  const sid = a.S().promoPendente[0].sid;
  await a.v('ctx.respondeMudanca', sid, 0, true, null);
  await a.esperar(60);

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

test('a mudança guardada ESPERA em Prescrição, e o boot não interrompe', async () => {
  // Reescrito de propósito, e a frente 1 nomeou este caso. Ele dizia "a decisão
  // abre sozinha" e afirmava `view.promo` no boot — uma tela cheia em cima de
  // quem acabou de abrir o app, para perguntar sobre o PROGRAMA, que é a
  // pergunta menos urgente que existe neste produto.
  //
  // O que substitui é mais forte: a mudança não se perde, ela ESPERA, com a
  // conta de volume e o vencimento ao lado (§8.1, passo 3). O mecanismo que a
  // carrega continua inteiro — é ele que o §3.6 do plano manda não apagar.
  const t = Date.now() - 2 * 3600 * 1000;
  const a = await app({ aba: 'agora', estado: {
    logs: {}, done: [],
    promoPendente: { day: 'A', t: t, mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } });
  await a.esperar();

  assert.strictEqual(a.v('ctx.emTelaCheia'), false,
    'o boot NÃO abre tela cheia nenhuma — e a tela de decisão nem existe mais');
  const fila = a.vJ('ctx.mudancasQueEsperam');
  assert.strictEqual(fila.length, 1, 'e a mudança está na fila, não perdida');
  assert.ok(/Pushdown|pushdown/.test(fila[0].mudancas[0].txt), fila[0].mudancas[0].txt);
  assert.ok(fila[0].vence != null, 'com o dia em que aquele treino volta');

  a.aba('prescricao');
  await a.esperar();
  assert.ok(a.doc.getElementById('app').textContent.includes('Pushdown'),
    'e ela está na tela de Prescrição, que é o dono da lista');
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

test('sair da lista sem responder deixa a mudança ESPERANDO', async () => {
  // Reescrito, e a propriedade virou de lado por uma razão. Ele dizia "não fica
  // reaparecendo para sempre": a tela abria sozinha a cada boot, então SOLTAR a
  // fila ao sair era a válvula de escape — sem ela a pergunta voltava toda vez
  // que o app abria.
  //
  // Sem a interrupção, a válvula não é mais necessária e passa a ser dano: a
  // mudança tem de esperar até ser respondida ou VENCER (§8.1, passo 5), e
  // "nada é descartado em silêncio". Navegar não é responder.
  const t = Date.now() - 2 * 3600 * 1000;
  const a = await app({ aba: 'prescricao', estado: {
    logs: {}, done: [],
    promoPendente: { day: 'A', t: t, mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }],
                     resumoMods: ['Pushdown: 2 → 3 séries'] }
  } });
  await a.esperar();
  const antes = (a.S().prog.A.ex[7] || { s: 0 }).s;
  assert.strictEqual(a.vJ('ctx.mudancasQueEsperam').length, 1, 'pré-condição: na fila');

  a.aba('corpo');
  await a.esperar();
  a.aba('prescricao');
  await a.esperar();

  assert.strictEqual(a.vJ('ctx.mudancasQueEsperam').length, 1,
    'sair e voltar não responde nada: ela continua esperando');
  assert.strictEqual((a.S().prog.A.ex[7] || { s: 0 }).s, antes, 'e o oficial não mudou');
  a.fechar();
});
// ---------------------------------------------------------------------------
// O QUE SAIU COM A TELA DE DECISÃO, e onde cada propriedade foi parar
// ---------------------------------------------------------------------------
//
// Quatro casos moravam aqui e foram embora com a tela (decisão D1). Nenhum
// deles cobria capacidade que desapareceu — cobriam a MECÂNICA da tela:
//
//  · "a decisão é um destino: entra no topo e devolve a posição ao voltar" e
//    "responder a decisão é fim de fluxo": eram o par `entraNoDestino` /
//    `saiDoDestino` daquele destino. Sem destino, não há posição a guardar — e
//    o caso abaixo cobra que finalizar não deixa resíduo nenhum;
//  · "ctx.concluiPromo leva ao oficial só o que foi marcado oficial" e
//    "ctx.voltaDoPromo sai sem responder": eram as duas portas da tela. A
//    propriedade que elas guardavam — que SÓ o que foi respondido chega ao
//    oficial — está nos dois casos abaixo, agora por `ctx.respondeMudanca`, que
//    é a porta da fila.

test('finalizar é fim de fluxo: nada de destino, nada de resíduo', async () => {
  // Antes finalizar abria um destino e guardava a posição de leitura para
  // devolvê-la a quem saísse sem responder. Sem a tela não há escala: a sessão
  // encerra, o dia gira, e a posição do treino de ontem não é mais a dele.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('setAlt', 0, 'supino-inclinado-no-smith');
  await a.esperar();

  a.E('window.scrollY = 980');            // jsdom não rola sozinho
  await a.v('finalizarSessao');
  await a.esperar(60);

  assert.strictEqual(a.S().sessao, null, 'encerrou');
  assert.strictEqual(a.dado('scrollDoDestino')['promo'], undefined,
    'e não guardou posição de um destino que não existe mais');
  assert.ok((a.S().promoPendente || []).length, 'com a mudança na fila');
  a.fechar();
});

test('responder uma mudança leva ao oficial SÓ ela', async () => {
  // A propriedade que `ctx.concluiPromo` guardava, e ela é a que importa: uma
  // regressão aqui não aparece no dia — aparece semanas depois, como um programa
  // que mudou sem ninguém ter decidido.
  const a = await app();
  const antes = a.S().prog.A.ex.map(function (x) { return x.s; });

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  a.v('mudaSeries', 1, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  await a.esperar(60);

  const g = a.S().promoPendente[0];
  assert.strictEqual(g.mods.length, 2, 'duas mudanças na fila — pré-condição');

  await a.v('ctx.respondeMudanca', g.sid, 0, true, null);
  await a.esperar(60);

  const depois = a.S().prog.A.ex.map(function (x) { return x.s; });
  assert.strictEqual(depois[0], antes[0] + 1, 'a respondida subiu no oficial');
  assert.strictEqual(depois[1], antes[1], 'e a OUTRA não: só o que foi respondido chega lá');
  assert.strictEqual(a.S().promoPendente[0].mods.length, 1, 'a outra continua esperando');
  a.fechar();
});

test('não responder mantém o conservador: o oficial fica como estava', async () => {
  // A propriedade que `ctx.voltaDoPromo` guardava. Sem a tela, "não responder" é
  // o estado natural — e é o que tem de não mexer em nada.
  const a = await app();
  const antes = a.S().prog.A.ex.map(function (x) { return x.s; });

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.v('mudaSeries', 0, 1);
  await a.esperar();
  await a.v('finalizarSessao');
  await a.esperar(60);

  assert.deepStrictEqual(a.S().prog.A.ex.map(function (x) { return x.s; }), antes,
    'o oficial não mudou um byte');
  assert.strictEqual((a.S().progLog || []).length, 0, 'nada a registrar: nada mudou');
  assert.ok((a.S().promoPendente || []).length, 'e a mudança continua esperando resposta');
  a.fechar();
});
