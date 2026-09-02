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
  a.E('toggle(0)');
  a.preencher(0, 0, 40, null);          // só a carga
  assert.strictEqual(a.E('S.sessao'), null);
  assert.strictEqual(a.E('S.done.length'), 0);
  assert.deepStrictEqual(a.J('Object.keys(S.logs)'), []);
  a.fechar();
});

test('série completa abre a sessão e grava na hora', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);

  assert.ok(a.E('S.sessao !== null'), 'sessão deveria estar aberta');
  assert.strictEqual(a.E('S.done.length'), 1);
  assert.strictEqual(a.E('S.done[0].sid'), a.E('S.sessao.sid'));

  const log = a.log('A',0)[0];
  assert.deepStrictEqual(log.sets[0], [40, 10]);
  assert.strictEqual(log.sid, a.E('S.sessao.sid'));
  a.fechar();
});

test('apagar o campo remove a série do histórico', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 2);

  a.preencher(0, 1, '', '');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1);
  a.fechar();
});

test('a sessão aberta não vira referência de si mesma', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.E('render()');

  // placeholder da série 2 não pode repetir o que acabou de ser digitado.
  // Vazio é o estado de 'sem referência': a unidade mora no rótulo ao lado.
  assert.strictEqual(a.doc.getElementById('w0_1').placeholder, '');
  assert.ok(a.texto('.ex.open .lastline').includes('primeira vez'));
  assert.deepStrictEqual(a.J('historico("A0")'), []);
  a.fechar();
});

test('sessão encerra por inatividade, grava duração e avança a rotação', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const estado = a.J('S');

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
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  const estado = a.J('S');
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
  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  a.preencher(0, 2, 40, 9);

  a.E('go("D")');
  a.E('go("A")');
  a.E('toggle(0)');

  assert.strictEqual(a.doc.getElementById('w0_0').value, '40', 'campo deveria voltar preenchido');
  assert.strictEqual(a.doc.getElementById('r0_2').value, '9');

  a.preencher(0, 0, 45, 10);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 3, 'as outras séries continuam');
  assert.deepStrictEqual(a.log('A',0)[0].sets[1], [40, 10]);
  a.fechar();
});

test('hidratação recupera observação, dor e substituto', async () => {
  const a = await app();
  a.E('toggle(1)');
  a.E('setAlt(1,"crucifixo-inclinado-no-cabo")');
  a.E('abrirNota(1)');
  a.digitar('o1', 'ombro ok hoje');
  a.E('toggleDor(1,"ombro")');
  a.preencher(1, 0, 32, 10);

  a.E('go("E")');
  a.E('go("A")');
  a.E('toggle(1)');

  assert.strictEqual(a.E('altOf(1)'), 'crucifixo-inclinado-no-cabo');
  assert.strictEqual(a.E('logKey("A",1)'), 'crucifixo-inclinado-no-cabo',
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

  a.E('toggle(0)');
  a.preencher(0, 0, 40, 10);
  assert.match(a.texto('#daymeta'), /^1\//, a.texto('#daymeta'));

  a.preencher(0, 1, 40, 10);
  assert.match(a.texto('#daymeta'), /^2\//, 'contador acompanha a digitação');
  a.fechar();
});

test('troca de exercício move a projeção para o histórico do substituto', async () => {
  const a = await app();
  a.E('toggle(1)');
  a.preencher(1, 0, 60, 12);
  assert.ok(a.log('A',1), 'gravou no exercício original');

  const original = a.k('A',1);
  a.E('setAlt(1,"crossover-na-polia-baixa")');
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
  a.E('toggle(1)');
  a.E('setAlt(1,"crossover-na-polia-baixa")');
  a.preencher(1, 0, 20, 12);
  assert.strictEqual(a.J('S.logs["crossover-na-polia-baixa"]').length, 1);

  a.E('go("E")');
  a.E('toggle(3)');
  a.E('setAlt(3,"crossover-na-polia-baixa")');
  a.preencher(3, 0, 22, 12);
  const h = a.J('S.logs["crossover-na-polia-baixa"]');
  assert.strictEqual(h.length, 2, 'mesma chave, dois dias diferentes');
  assert.notStrictEqual(h[0].sl, h[1].sl, 'cada um sabe de que posição veio');
  a.fechar();
});

test('deload corta as séries pela metade e marca a sessão', async () => {
  const a = await app();
  await a.E('setDeload(true)');
  a.E('go("A")');
  a.E('toggle(0)');

  assert.strictEqual(a.$$('.ex.open .setrow').length, 2, 'quatro séries viram duas');
  assert.strictEqual(a.$('.up'), null, 'selo de subir carga fica suspenso');

  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.log('A',0)[0].dl, 1);
  assert.strictEqual(a.E('S.done[0].dl'), 1);
  assert.strictEqual(a.E('sessoesDeTrabalho()'), 0, 'deload não conta para as 48');
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

  assert.strictEqual(a.E('CTX.abaAtual()'), 'treino');
  assert.strictEqual(a.E('view.day'), 'B', 'e no dia da sessão');
  assert.strictEqual(a.E('S.sessao && S.sessao.day'), 'B', 'a sessão sobreviveu ao boot');
  a.fechar();
});

test('sem sessão, o app continua abrindo em HOJE', async () => {
  const a = abrirApp({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  await a.pronto();
  assert.strictEqual(a.E('CTX.abaAtual()'), 'hoje');
  a.fechar();
});

test('sessão vencida não sequestra a abertura', async () => {
  // encerraSePreciso() roda ANTES de decidir a rota: se a sessão morreu de
  // ontem, ela não tem por que puxar ninguém para o treino
  const agora = agoraEstavel();
  const a = abrirApp({ agora: agora, estado: emTreino('B', agora - 2 * DIA) });
  await a.pronto();
  assert.strictEqual(a.E('S.sessao'), null, 'foi encerrada no boot');
  assert.strictEqual(a.E('CTX.abaAtual()'), 'hoje');
  a.fechar();
});

test('chegar na aba TREINO cai no dia da sessão, venha de onde vier', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });

  a.E(`go('C')`);
  assert.strictEqual(a.E('view.day'), 'C', 'dentro da aba, o dia é livre');

  a.aba('comida');
  a.aba('treino');
  assert.strictEqual(a.E('view.day'), 'B', 'voltando de fora, cai na sessão de novo');
  a.fechar();
});

test('mas não congela: dentro da aba o dia continua livre', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  a.E(`go('D')`);
  assert.strictEqual(a.E('view.day'), 'D');
  a.E('render()');
  assert.strictEqual(a.E('view.day'), 'D', 'redesenhar não puxa de volta');
  a.fechar();
});

test('sem sessão, trocar de aba não mexe no dia escolhido', async () => {
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] }, aba: 'treino' });
  a.E(`go('C')`);
  a.aba('comida');
  a.aba('treino');
  assert.strictEqual(a.E('view.day'), 'C', 'nada a priorizar, nada muda');
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
