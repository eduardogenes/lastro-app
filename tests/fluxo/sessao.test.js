// Registro contínuo: a mudança estrutural do app. Não existe botão de salvar,
// a sessão nasce na primeira série completa e morre sozinha.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, abrirApp, agoraEstavel, DIA } from './harness.js';

test('não existe mais função de salvar', async () => {
  const a = await app();
  assert.strictEqual(a.E('typeof finish'), 'undefined');
  assert.ok(a.texto('.tr-nota').includes('Não há nada para salvar'));
  a.fechar();
});

test('série incompleta não abre sessão', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, null);          // só a carga
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.S().done.length, 0);
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), []);
  a.fechar();
});

test('série completa abre a sessão e grava na hora', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);

  assert.ok(a.E('S.sessao !== null'), 'sessão deveria estar aberta');
  assert.strictEqual(a.S().done.length, 1);
  assert.strictEqual(a.S().done[0].sid, a.S().sessao.sid);

  const log = a.log('A',0)[0];
  assert.deepStrictEqual(log.sets[0], [40, 10]);
  assert.strictEqual(log.sid, a.S().sessao.sid);
  a.fechar();
});

test('apagar o campo remove a série do histórico', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 2);

  a.preencher(0, 1, '', '');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1);
  a.fechar();
});

test('a sessão aberta não vira referência de si mesma', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('render');

  // placeholder da série 2 não pode repetir o que acabou de ser digitado.
  // Vazio é o estado de 'sem referência': a unidade mora no rótulo ao lado.
  assert.strictEqual(a.doc.getElementById('w0_1').placeholder, '');
  assert.ok(a.texto('.ex.open .lastline').includes('primeira vez'));
  assert.deepStrictEqual(a.vJ('historico', 'A0'), []);
  a.fechar();
});

test('sessão encerra por inatividade, grava duração e avança a rotação', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const estado = a.S();

  // seis horas atrás, última série cinco horas atrás
  const agora = Date.now();
  estado.sessao.inicio = agora - 6 * 3600 * 1000;
  estado.sessao.ultima = agora - 5 * 3600 * 1000;
  estado.done[0].t = estado.sessao.inicio;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.E('S.sessao'), null, 'sessão deveria ter encerrado sozinha');
  assert.strictEqual(b.E('S.done[0].dur'), 3600 * 1000, 'uma hora de treino');
  assert.strictEqual(b.E('S.draft'), null);
  assert.strictEqual(b.texto('.ins-estado-v'), 'B', 'rotação deveria ter avançado');
  assert.strictEqual(b.log('A',0)[0].sets.filter(Boolean).length, 1, 'histórico preservado');
  b.fechar();
});

test('sessão do mesmo dia com pouca pausa continua aberta', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const estado = a.S();
  estado.sessao.ultima = Date.now() - 30 * 60 * 1000;   // 30 min de descanso
  a.fechar();

  const b = await app({ estado });
  assert.ok(b.E('S.sessao !== null'), 'não deveria encerrar por 30 minutos');
  assert.strictEqual(b.texto('.ins-estado-v'), 'A');
  b.fechar();
});

test('trocar de dia no meio do treino não perde nem sobrescreve série', async () => {
  // Regressão: o rascunho é zerado ao trocar de dia. Sem hidratação, os campos
  // voltavam em branco com as séries gravadas, e digitar por cima apagava o resto.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  a.preencher(0, 2, 40, 9);

  a.v('go', 'D');
  a.v('go', 'A');
  a.v('toggle', 0);

  assert.strictEqual(a.doc.getElementById('w0_0').value, '40', 'campo deveria voltar preenchido');
  assert.strictEqual(a.doc.getElementById('r0_2').value, '9');

  a.preencher(0, 0, 45, 10);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 3, 'as outras séries continuam');
  assert.deepStrictEqual(a.log('A',0)[0].sets[1], [40, 10]);
  a.fechar();
});

test('hidratação recupera observação, dor e substituto', async () => {
  const a = await app();
  a.v('toggle', 1);
  a.v('setAlt', 1, 'crucifixo-inclinado-no-cabo');
  a.v('abrirNota', 1);
  a.digitar('o1', 'ombro ok hoje');
  a.v('toggleDor', 1, 'ombro');
  a.preencher(1, 0, 32, 10);

  a.v('go', 'E');
  a.v('go', 'A');
  a.v('toggle', 1);

  assert.strictEqual(a.v('altOf', 1), 'crucifixo-inclinado-no-cabo');
  assert.strictEqual(a.v('logKey', 'A', 1), 'crucifixo-inclinado-no-cabo',
    'o registro vai para o histórico do substituto, não para uma chave derivada');
  assert.strictEqual(a.doc.getElementById('o1').value, 'ombro ok hoje');
  assert.strictEqual(a.texto('.ex.open .chip.on'), 'ombro anterior');
  a.fechar();
});

test('o contador de séries acompanha a digitação sem re-render', async () => {
  // inp() não chama render() de propósito: o campo é controlado pelo valor já
  // parseado, e redesenhar a cada tecla reescreveria "22," como "22" — deixando
  // impossível digitar decimal. O contador é escrito no DOM à mão, e este teste
  // é o que garante que ele não vire texto morto.
  const a = await app();
  assert.match(a.texto('#daymeta'), /^0\/\d+$/, a.texto('#daymeta'));

  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.match(a.texto('#daymeta'), /^1\//, a.texto('#daymeta'));

  a.preencher(0, 1, 40, 10);
  assert.match(a.texto('#daymeta'), /^2\//, 'contador acompanha a digitação');
  a.fechar();
});

test('troca de exercício move a projeção para o histórico do substituto', async () => {
  const a = await app();
  a.v('toggle', 1);
  a.preencher(1, 0, 60, 12);
  assert.ok(a.log('A',1), 'gravou no exercício original');

  const original = a.k('A',1);
  a.v('setAlt', 1, 'crossover-na-polia-baixa');
  assert.strictEqual(a.E('S.logs[' + JSON.stringify(original) + ']'), undefined,
    'sai do histórico do original');
  assert.strictEqual(a.k('A',1), 'crossover-na-polia-baixa', 'a posição passa a ser do substituto');
  const sub = a.log('A',1);
  assert.strictEqual(sub.length, 1, 'e entra no histórico do substituto');
  assert.strictEqual(sub[0].sl, original, 'guardando de que posição do treino veio');
  a.fechar();
});

test('substituto acumula histórico próprio entre treinos', async () => {
  // O ganho de indexar por exercício: usar o mesmo aparelho como substituto em
  // dias diferentes vira uma série histórica só, não duas chaves órfãs.
  const a = await app();
  a.v('toggle', 1);
  a.v('setAlt', 1, 'crossover-na-polia-baixa');
  a.preencher(1, 0, 20, 12);
  assert.strictEqual(a.S().logs["crossover-na-polia-baixa"].length, 1);

  a.v('go', 'E');
  a.v('toggle', 3);
  a.v('setAlt', 3, 'crossover-na-polia-baixa');
  a.preencher(3, 0, 22, 12);
  const h = a.S().logs["crossover-na-polia-baixa"];
  assert.strictEqual(h.length, 2, 'mesma chave, dois dias diferentes');
  assert.notStrictEqual(h[0].sl, h[1].sl, 'cada um sabe de que posição veio');
  a.fechar();
});

test('deload corta as séries pela metade e marca a sessão', async () => {
  const a = await app();
  await a.v('setDeload', true);
  a.v('go', 'A');
  a.v('toggle', 0);

  assert.strictEqual(a.$$('.ex.open .setrow').length, 2, 'quatro séries viram duas');
  assert.strictEqual(a.$('.up'), null, 'selo de subir carga fica suspenso');

  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.log('A',0)[0].dl, 1);
  assert.strictEqual(a.S().done[0].dl, 1);
  assert.strictEqual(a.v('sessoesDeTrabalho'), 0, 'deload não conta para as 48');
  a.fechar();
});

// ---------- a sessão aberta manda na CHEGADA ----------
// Chegar é abrir o app e é tocar na aba TREINO vindo de fora dela. Permanecer é
// já estar lá. A diferença é o que separa prioridade de prisão.

/** Um estado com treino em andamento no dia pedido, dentro do dia de hoje. */
function emTreino(dia, agora) {
  return {
    logs: {}, done: [],
    sessao: { day: dia, inicio: agora - 2 * 60000, ultima: agora - 30000,
              sid: agora - 2 * 60000, manual: 1, pausas: [], pulados: [] }
  };
}

test('abrir o app com treino em andamento cai no treino, não em HOJE', async () => {
  // sair e voltar no meio de uma série é a reabertura mais comum que existe
  // neste app, e devolvê-lo a HOJE cobrava dois toques com a mão suada
  const agora = agoraEstavel();
  const a = abrirApp({ agora: agora, estado: emTreino('B', agora) });
  await a.pronto();                    // sem a.aba(): é o boot que tem que decidir

  assert.strictEqual(a.v('ctx.abaAtual'), 'treino');
  assert.strictEqual(a.vista().day, 'B', 'e no dia da sessão');
  assert.strictEqual(a.E('S.sessao && S.sessao.day'), 'B', 'a sessão sobreviveu ao boot');
  a.fechar();
});

test('sem sessão, o app continua abrindo em HOJE', async () => {
  const a = abrirApp({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  await a.pronto();
  assert.strictEqual(a.v('ctx.abaAtual'), 'hoje');
  a.fechar();
});

test('sessão vencida não sequestra a abertura', async () => {
  // encerraSePreciso() roda ANTES de decidir a rota: se a sessão morreu de
  // ontem, ela não tem por que puxar ninguém para o treino
  const agora = agoraEstavel();
  const a = abrirApp({ agora: agora, estado: emTreino('B', agora - 2 * DIA) });
  await a.pronto();
  assert.strictEqual(a.S().sessao, null, 'foi encerrada no boot');
  assert.strictEqual(a.v('ctx.abaAtual'), 'hoje');
  a.fechar();
});

test('chegar na aba TREINO cai no dia da sessão, venha de onde vier', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });

  a.v('go', 'C');
  assert.strictEqual(a.vista().day, 'C', 'dentro da aba, o dia é livre');

  a.aba('comida');
  a.aba('treino');
  assert.strictEqual(a.vista().day, 'B', 'voltando de fora, cai na sessão de novo');
  a.fechar();
});

test('mas não congela: dentro da aba o dia continua livre', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  a.v('go', 'D');
  assert.strictEqual(a.vista().day, 'D');
  a.v('render');
  assert.strictEqual(a.vista().day, 'D', 'redesenhar não puxa de volta');
  a.fechar();
});

test('sem sessão, trocar de aba não mexe no dia escolhido', async () => {
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] }, aba: 'treino' });
  a.v('go', 'C');
  a.aba('comida');
  a.aba('treino');
  assert.strictEqual(a.vista().day, 'C', 'nada a priorizar, nada muda');
  a.fechar();
});

test('o relógio da sessão é filho direto do main, senão o sticky descola', async () => {
  // sticky se prende ao bloco que o contém: dentro da seção ele sairia da tela
  // junto com ela, a uns dois exercícios de rolagem
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  const rel = a.$('.day-rel');
  assert.ok(rel, 'o relógio está na tela');
  assert.strictEqual(rel.parentElement.tagName, 'MAIN',
    'saiu para o <main>: dentro da <section> o sticky se prenderia a ela');
  assert.ok(a.$('.ins-secao.continua'), 'e a seção partida não desenha fio');
  a.fechar();
});

// ---------- corrigir e apagar um treino registrado ----------
// Registrar o treino errado e esquecer de finalizar são os dois enganos que
// este app deixa acontecer sem atrito — e até aqui nenhum dos dois tinha saída:
// apagar só era oferecido no treino AVULSO, e o tempo não se editava.

/** Um dia com treino registrado e séries nele. */
function comTreinoRegistrado(agora) {
  const t = agora - 3 * 60 * 60000;
  return {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10], [40, 10], [40, 8]] }],
            A1: [{ t: t, sid: t, sets: [[20, 12], [20, 12]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3 * 60 * 60000, fim: 'auto' }],
    t: t
  };
}

test('o detalhe de um treino do plano oferece corrigir e apagar', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dados' });
  a.v('abrirSessao', f.t);

  const d = a.vJ('ctx.detalheDaSessao');
  assert.strictEqual(d.livre, false, 'é treino do plano, não avulso');
  assert.strictEqual(d.corrigivel, true);
  assert.ok(d.duracoes.length >= 4, 'os degraus de duração estão lá');
  const botoes = a.$$('.tc button').map(x => x.textContent.trim());
  assert.ok(botoes.includes('apagar este treino'), botoes.join(' | '));
  a.fechar();
});

test('corrigir o tempo torna a duração declarada, e o aproximado some', async () => {
  // esquecer de finalizar deixa o tempo correndo até a última série
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dados' });
  a.v('abrirSessao', f.t);
  assert.strictEqual(a.vJ('ctx.detalheDaSessao').exato, false, 'nasce aproximado');

  await a.E('CTX.corrigeDuracao(' + f.t + ', 45)');
  await a.esperar(60);

  const m = a.S().done[0];
  assert.strictEqual(m.dur, 45 * 60000);
  assert.strictEqual(m.fim, 'manual', 'passa a ser declarado, não estimado');
  assert.ok(m.m > 0, 'com carimbo, senão a fusão devolve o valor velho');
  assert.strictEqual(a.vJ('ctx.detalheDaSessao').exato, true);
  a.fechar();
});

test('a correção é presa a limites, e não aceita lixo', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dados' });

  await a.E('CTX.corrigeDuracao(' + f.t + ', 0)');
  await a.esperar(40);
  assert.strictEqual(a.S().done[0].dur, 60000, 'piso de um minuto');

  await a.E('CTX.corrigeDuracao(' + f.t + ', 9999)');
  await a.esperar(40);
  assert.strictEqual(a.S().done[0].dur, 600 * 60000, 'teto de dez horas');
  a.fechar();
});

test('apagar o treino leva as séries dele junto, com lápide nas duas coisas', async () => {
  // sem isso as séries ficariam órfãs no histórico de cada exercício: ainda
  // contando volume, ainda puxando progressão, sem dia a que pertencer
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dados' });
  assert.strictEqual(a.S().done.length, 1);
  const comHistorico = () => a.J('Object.keys(S.logs)').length;
  assert.strictEqual(comHistorico(), 2, 'dois exercícios com histórico');

  a.v('abrirSessao', f.t);
  await a.E('CTX.editaSessao(' + f.t + ')');
  await a.esperar(80);

  assert.deepStrictEqual(a.S().done, [], 'a marca do dia saiu');
  assert.strictEqual(comHistorico(), 0, 'e os exercícios ficaram sem histórico nenhum');
  const mortos = a.S().apagados;
  assert.ok(mortos['done:' + f.t], 'lápide da sessão');
  assert.ok(Object.keys(mortos).some(k => k.indexOf('log:') === 0), 'e das séries');
  assert.strictEqual(a.vista().sessao, null, 'a tela fechou sozinha');
  a.fechar();
});

test('o aviso diz quantas séries vão junto antes de apagar', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dados' });
  a.v('abrirSessao', f.t);

  a.recusar();
  await a.E('CTX.editaSessao(' + f.t + ')');
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 1, 'recusou: nada foi apagado');
  const p = a.perguntas().join(' ');
  assert.ok(/5 séries/.test(p), 'a conta das séries aparece: ' + p);
  assert.ok(/outros aparelhos/.test(p), 'e que vale para os outros: ' + p);
  a.fechar();
});

test('o treino EM ANDAMENTO não se apaga por aqui', async () => {
  // o tempo dele ainda está correndo; apagar por baixo deixaria a sessão viva
  // apontando para um dia que não existe mais
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  f.sessao = { day: 'A', inicio: f.t, ultima: agora, sid: f.t, manual: 1, pausas: [], pulados: [] };
  const a = await app({ agora: agora, estado: f, aba: 'dados' });

  await a.E('CTX.editaSessao(' + f.t + ')');
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 1, 'continua lá');
  assert.ok(/em andamento/.test(a.toast()), a.toast());
  a.fechar();
});

// ===========================================================================
// `ctx.apagaLinha` — o apagamento ESTREITO, que não é o do detalhe do mês
// ===========================================================================
//
// O app tem dois apagamentos de sessão passada, e eles têm alcances
// diferentes de propósito:
//
//   - o do DETALHE DO MÊS leva a marca do dia e TODAS as séries daquele `sid`,
//     em todos os exercícios. É o caso *apagar o treino leva as séries dele
//     junto* , logo acima.
//   - `ctx.apagaLinha`, aqui, leva UMA linha do histórico de UM exercício. A
//     marca do dia fica, e as séries do mesmo treino nos outros exercícios
//     ficam.
//
// O segundo alcance não tinha nenhuma asserção. `telas` :: *correção de sessão
// passada altera e apaga* chama `apagarSessao` e confere que a linha sumiu —
// não que **só** ela sumiu. Um apagamento que crescesse do exercício para o
// treino passaria naquele caso. Daí este.
//
// Cobre o modelo, não a fiação: prova que a capacidade existe e onde ela para,
// e nada sobre a tela nova ter um botão ligado em `ctx.apagaLinha`.

test('ctx.apagaLinha avisa antes, e recusar deixa a linha onde estava', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[400, 10]] }] },
    done: [{ day: 'A', t: t, sid: t }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);
  a.v('ctx.editaLinha', 0);

  a.recusar();
  await a.v('ctx.apagaLinha');
  await a.esperar();

  assert.strictEqual(a.log('A', 0).length, 1, 'recusar não apaga');
  const q = a.perguntas().join(' | ');
  assert.ok(/não tem volta/.test(q), 'e o aviso diz que não tem volta: ' + q);
  a.fechar();
});

test('ctx.apagaLinha leva uma linha só — o dia e os outros exercícios ficam', async () => {
  const velho = Date.now() - 9 * DIA, novo = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    logs: {
      // duas sessões no MESMO exercício, e uma terceira em outro exercício
      // dentro do MESMO treino da sessão nova
      A0: [{ t: velho, sid: velho, sets: [[60, 10]] },
           { t: novo, sid: novo, sets: [[400, 10]] }],
      A1: [{ t: novo, sid: novo, sets: [[20, 12]] }]
    },
    done: [{ day: 'A', t: velho, sid: velho }, { day: 'A', t: novo, sid: novo }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);

  const antes = a.log('A', 0);
  const alvo = antes.findIndex(function (l) { return l.sid === novo; });
  assert.ok(alvo >= 0, 'a sessão nova está no histórico da posição 0');

  a.v('ctx.editaLinha', alvo);
  await a.v('ctx.apagaLinha');
  await a.esperar();

  assert.deepStrictEqual(a.log('A', 0).map(function (l) { return l.sid; }), [velho],
    'a linha nomeada saiu, e a outra sessão do MESMO exercício ficou');
  assert.strictEqual(a.log('A', 1).length, 1,
    'e o mesmo treino no exercício VIZINHO ficou: o alcance é a linha, não o `sid`');
  assert.strictEqual(a.S().done.length, 2,
    'a marca do dia fica — quem leva o dia junto é o detalhe do mês, não esta porta');

  assert.ok(a.S().apagados['log:' + a.k('A', 0) + ':' + novo + ':' + a.k('A', 0)] > 0,
    'com lápide da linha, senão a fusão do outro aparelho a devolve');
  assert.strictEqual(a.S().apagados['done:' + novo], undefined,
    'e sem lápide do dia, que não foi apagado');
  a.fechar();
});
