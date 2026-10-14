// Registro retroativo: treino do plano lançado em data passada, e treino
// avulso, que é presença sem ser o programa.
//
// Pela D (`dias.html`, estados 6 a 8), UM TOQUE GRAVA a presença: a folha não
// tem mais "Adicionar". Hora, séries, grupos e duração vêm depois, e cada um
// corrige o registro que já existe.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA, agoraEstavel } from './harness.js';

const ONTEM = () => Date.now() - DIA;

test('treino do plano lançado sem detalhar: um toque grava', async () => {
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  await a.v('lancaTreino', 'D');
  await a.esperar();

  const m = a.S().done[a.S().done.length - 1];
  assert.strictEqual(m.day, 'D');
  assert.strictEqual(m.retro, 1);
  assert.strictEqual(m.hora, undefined, 'sem hora inventada');
  assert.strictEqual(m.dur, undefined, 'nem duração');
  assert.ok(a.vista().add, 'a folha fica, dizendo o que gravou');
  assert.ok(/gravado às/.test(a.texto('.ln-gravado')), a.texto('.ln-gravado'));
  assert.ok(/dias com treino nas últimas 4 semanas: 1, eram 0/.test(a.texto('.ln-gravado')),
    'e o que mudou por causa dele: ' + a.texto('.ln-gravado'));
  // depois de D vem E desde o plano 5, quando as letras foram alfabetizadas
  assert.strictEqual(a.v('nextDay'), 'E', 'a rotação segue o treino lançado');
  assert.ok(/A sequência anda/.test(a.vJ('ctx.retroativo').sequencia), 'e a folha diz isso');

  await a.v('lancaTreino', 'B');
  assert.strictEqual(a.S().done.length, 1, 'a folha grava um só: o segundo toque não vira outro treino');
  a.fechar();
});

test('dois treinos sem hora no mesmo dia não colidem na chave', async () => {
  // Sem hora, o registro vai para a hora neutra do dia — e dois no mesmo dia
  // cairiam no MESMO instante, que é o `sid`: a chave da sincronia
  // (`done:<sid>`) e o que apagar procura. Um sumiria no outro aparelho, e
  // apagar um levaria os dois.
  const a = await app();
  const t = ONTEM();
  a.v('abrirAdicionar', t);
  await a.v('lancaTreino', 'E');
  a.v('ctx.fechaAdicionar');
  a.v('abrirAdicionar', t);
  await a.v('lancaTreino', 'D');
  a.v('ctx.fechaAdicionar');
  await a.esperar();

  const [x, y] = a.S().done;
  assert.notStrictEqual(x.t, y.t, 'instantes diferentes');
  assert.notStrictEqual(x.sid, y.sid, 'chaves diferentes');
  assert.strictEqual(new Date(x.t).toDateString(), new Date(y.t).toDateString(), 'no mesmo dia');
  await a.v('ctx.editaSessao', x.t);
  await a.esperar(60);
  assert.deepStrictEqual(a.S().done.map(function (m) { return m.day; }), ['D'], 'apagar um deixa o outro');
  a.fechar();
});

test('o previsto é o próximo da sequência NAQUELE dia, não o de hoje', async () => {
  const agora = Date.now();
  const tA = agora - 4 * DIA, tB = agora - DIA;
  const a = await app({ estado: { logs: {}, done: [
    { day: 'A', t: tA, sid: tA, dur: 3600000, fim: 'manual' },
    { day: 'B', t: tB, sid: tB, dur: 3600000, fim: 'manual' }
  ] } });
  a.v('abrirAdicionar', agora - 2 * DIA);
  assert.strictEqual(a.vJ('ctx.retroativo').previsto.k, 'B', 'depois do A daquele dia vinha o B');
  assert.strictEqual(a.v('nextDay'), 'C', 'mesmo com o próximo de hoje sendo o C');
  a.fechar();
});

test('done fica ordenado por data mesmo lançando para trás', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);          // sessão de hoje
  a.v('abrirAdicionar', (Date.now() - 3 * DIA));
  await a.v('lancaTreino', 'B');
  await a.esperar();

  assert.ok(a.S().done.every(function (x, i, arr) { return i === 0 || arr[i - 1].t <= x.t; }));
  assert.ok(/A sequência não muda/.test(a.vJ('ctx.retroativo').sequencia), 'lançar para trás não move a sequência');
  a.fechar();
});

test('treino fora da prescrição grava no toque, e os grupos vêm depois', async () => {
  // Mudou de propósito, pela D (estado 8): antes a folha recusava gravar sem
  // grupo muscular; agora a presença é o registro, e o resto é opcional.
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  await a.v('lancaTreino', 'livre');
  await a.esperar();

  const m = a.S().done[0];
  assert.strictEqual(m.livre, 1, 'gravou a presença');
  assert.deepStrictEqual(m.grupos, [], 'sem grupo ainda');
  const carimbo = m.m;
  await new Promise(function (r) { setTimeout(r, 5); });
  await a.v('grupoDoLancamento', 'peito');
  assert.deepStrictEqual(a.S().done[0].grupos, ['peito'], 'o grupo corrige o mesmo registro');
  assert.ok(a.S().done[0].m > carimbo, 'e carimba, para a sincronia saber que mudou');
  await a.v('grupoDoLancamento', 'delt lateral');
  assert.deepStrictEqual(a.S().done[0].grupos, ['peito'], 'só as regiões que a folha oferece');
  a.fechar();
});

test('treino avulso é presença, não é o programa', async () => {
  const a = await app();
  a.v('abrirAdicionar', ONTEM());
  await a.v('lancaTreino', 'livre');
  await a.v('grupoDoLancamento', 'peito');
  await a.v('grupoDoLancamento', 'braço');
  await a.v('duracaoDoLancamento', 45);
  await a.esperar();

  const m = a.S().done.filter(function (x) { return x.livre; })[0];
  assert.deepStrictEqual(m.grupos, ['peito', 'braço']);
  assert.strictEqual(m.dur, 45 * 60000);
  assert.strictEqual(m.day, undefined, 'avulso não tem letra de treino');

  assert.strictEqual(a.v('nextDay'), 'A', 'rotação intocada');
  assert.strictEqual(a.v('sessoesDeTrabalho'), 0, 'fora da conta das 48');
  assert.ok(/Não mexe na sequência/.test(a.vJ('ctx.retroativo').nota), 'e a folha diz as duas coisas');
  a.fechar();
});

test('preencher os exercícios grava na data do treino, não na de hoje', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  await a.v('lancaTreino', 'B');
  await a.v('detalhaLancamento');
  await a.esperar();

  assert.strictEqual(a.S().sessao.retro, 1);
  assert.strictEqual(a.S().sessao.sid, a.S().done[0].sid, 'a sessão é a do registro gravado, não outra');
  assert.strictEqual(a.vista().day, 'B');
  assert.strictEqual(a.vista().add, null, 'a folha deu lugar à sessão');

  a.preencher(0, 0, 60, 12);
  const entrada = a.log('B',0)[0];
  assert.strictEqual(new Date(entrada.t).toDateString(), new Date(ontem).toDateString());

  await a.v('concluirRetro');
  await a.esperar();
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.S().done.length, 1, 'detalhar não cria um segundo registro');
  assert.strictEqual(a.S().done[0].dur, undefined,
    'encerrar a sessão retroativa não inventa duração com o relógio de hoje');
  a.fechar();
});

test('abrir retroativo com treino em andamento encerra o de hoje', async () => {
  // Antes disso a sessão de hoje ficava órfã e perdia a duração.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.E('S.sessao.inicio = Date.now() - 50*60000');

  a.v('abrirAdicionar', ONTEM());
  await a.v('lancaTreino', 'C');
  await a.v('detalhaLancamento');
  await a.esperar();

  const hoje = a.S().done.filter(function (x) { return x.day === 'A'; })[0];
  assert.ok(hoje.dur >= 49 * 60000 && hoje.dur <= 51 * 60000, 'duração de hoje foi gravada');
  assert.strictEqual(a.S().sessao.day, 'C');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1, 'séries de hoje preservadas');
  a.fechar();
});

test('sessão retroativa esquecida encerra na virada do dia de uso', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  await a.v('lancaTreino', 'C');
  await a.v('detalhaLancamento');
  await a.esperar();
  a.preencher(0, 0, 100, 8);

  const estado = a.S();
  estado.sessao.tocado = Date.now() - 5 * 3600 * 1000;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.S().sessao, null);
  assert.strictEqual(b.log('C',0)[0].sets.filter(Boolean).length, 1, 'o que foi preenchido fica');
  b.fechar();
});

test('dia vazio do mês é atalho para lançar, pelo dia aberto', async () => {
  const a = await app({ agora: agoraEstavel() });
  a.aba('dias');
  const vazios = a.$$('.dc').filter(function (c) {
    return !c.disabled && !c.classList.contains('hoje') && !c.querySelector('.dc-p');
  });
  assert.ok(vazios.length > 0);
  a.clicar(vazios[0]);
  await a.esperar();
  a.clicar('[data-a="dia-registrar"]');
  await a.esperar();
  assert.ok(a.vista().add, 'o dia vazio leva ao lançamento retroativo daquele dia');
  a.fechar();
});

test('de Dias, um dia passado vira descanso pelo dedo, e o mês mostra a marca', async () => {
  // §1.2 da frente 1: marcar um dia passado como descanso é capacidade de Dias.
  // O caminho INTEIRO, do mês de volta à marca no mês: um lugar novo que
  // deixasse de ligar o botão passaria verde nos pedaços. Pela D, o "Foi
  // descanso" está no próprio dia, sem passar pelo lançamento.
  const a = await app({ agora: agoraEstavel() });
  a.aba('dias');
  const vazio = a.$$('.dc').filter(function (c) {
    return !c.disabled && !c.classList.contains('hoje') && !c.querySelector('.dc-p');
  })[0];
  assert.ok(vazio, 'pré-condição: há um dia passado sem registro no mês');
  const iso = vazio.getAttribute('data-dia');
  a.clicar(vazio);
  await a.esperar();

  a.clicar('[data-a="dia-descanso"]');
  await a.esperar(60);
  assert.ok(a.$('[data-a="dia-tira-descanso"]'), 'o dia mostra a marca, com a saída');
  assert.strictEqual(a.$('[data-a="dia-descanso"]'), null, 'e não oferece marcar de novo');

  a.v('ctx.fechaDia');
  await a.esperar();
  const cel = a.$('[data-dia="' + iso + '"]');
  assert.ok(cel.classList.contains('desc'), 'o mês mostra o dia ' + iso + ' como descanso');
  assert.strictEqual(Object.keys(a.S().descanso).length, 1, 'uma marca, e só uma');
  a.fechar();
});

test('apagar registro avulso', async () => {
  const a = await app();
  const t = Date.now() - 2 * DIA;
  a.v('abrirAdicionar', t);
  await a.v('lancaTreino', 'livre');
  await a.v('grupoDoLancamento', 'costas');
  a.v('ctx.fechaAdicionar');
  await a.esperar();

  const marca = a.S().done[0];
  a.v('abrirSessao', marca.t);
  assert.strictEqual(a.texto('.htitle'), 'costas');

  // pelo mesmo caminho da tela: o botão de apagar chama CTX.editaSessao
  await a.v('ctx.editaSessao', marca.t);
  await a.esperar();
  assert.strictEqual(a.S().done.length, 0);
  a.fechar();
});

// ---------------------------------------------------------------------------
// As chaves de `CTX` do lançamento retroativo: `retroativo`, `lancaTreino`,
// `horaDoLancamento`, `fechaAdicionar`
// ---------------------------------------------------------------------------
//
// Por que `lancaTreino` primeiro: é a chave daqui que ESCREVE em `S.done` — uma
// presença registrada numa data passada, que entra na rotação, na conta das 48
// e na cópia de segurança. Uma regressão nela perde um treino que aconteceu, e
// nada na tela diz que perdeu.
//
// O QUE ESTE GRUPO PROVA: que a leitura `ctx.retroativo` descreve a folha antes
// e depois do toque (e devolve `null` sem tela aberta); que `ctx.lancaTreino`
// grava e a hora posta por valor corrige o mesmo registro; e que
// `ctx.fechaAdicionar` sai devolvendo a posição de leitura. Os casos acima
// provam as funções de módulo; o que faltava eram as CHAVES, que são o que a
// tela usa.
//
// O QUE ESTE GRUPO NÃO COBRE: que algum botão esteja ligado nelas. Chamar o
// verbo prova que a capacidade existe no MODELO, não que o dedo a alcança.

test('ctx.retroativo descreve a folha antes e depois do toque, e é null sem tela aberta', async () => {
  const a = await app();
  assert.strictEqual(a.v('ctx.retroativo'), null,
    'sem lançamento aberto não há o que descrever — e sai por valor, não estoura');

  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  const antes = a.vJ('ctx.retroativo');
  assert.strictEqual(antes.gravado, false, 'antes do toque, a pergunta');
  assert.strictEqual(antes.procedencia, 'nada registrado', 'e o dia não tem sessão nenhuma ainda');
  assert.strictEqual(antes.previsto.k, 'A', 'o previsto é o próximo da sequência naquele dia');
  assert.ok(/·/.test(antes.previsto.detalhe), 'descrito pelo treino do plano: ' + antes.previsto.detalhe);
  assert.ok(antes.outros.every(function (x) { return x.k !== 'A'; }), 'os outros não repetem o previsto');
  assert.ok(antes.outros.every(function (x) { return x.k !== 'descanso'; }),
    'o descanso não está aqui: mora no dia, com o mesmo peso');
  assert.ok(/^Que treino foi n[ao] /.test(antes.pergunta), antes.pergunta);

  await a.v('ctx.lancaTreino', 'C');
  const depois = a.vJ('ctx.retroativo');
  assert.strictEqual(depois.gravado, true);
  assert.strictEqual(depois.livre, false);
  assert.ok(/^Treino C · /.test(depois.titulo2), depois.titulo2);
  assert.strictEqual(depois.comHora, false, 'sem hora até ele pôr');
  assert.ok(/Nenhuma hora é inventada/.test(depois.notaHora));
  assert.strictEqual(depois.procedencia, 'dia de treino, pela sessão registrada');
  a.fechar();

  const b = await app();
  b.v('abrirAdicionar', ONTEM());
  await b.v('ctx.lancaTreino', 'livre');
  const fora = b.vJ('ctx.retroativo');
  assert.strictEqual(fora.livre, true);
  assert.deepStrictEqual(fora.grupos.map(function (g) { return g.k; }),
    ['peito', 'ombro', 'costas', 'perna', 'panturrilha', 'braço', 'abdômen'], 'as regiões do corpo (F178)');
  assert.deepStrictEqual(fora.duracoes.map(function (g) { return g.k; }), [30, 45, 60, 'outro']);
  b.fechar();
});

test('ctx.lancaTreino grava a presença, e a hora posta por valor corrige o mesmo registro', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  await a.v('ctx.lancaTreino', 'D');
  const sid = a.S().done[0].sid;
  await a.v('horaDoLancamento', '19:30');
  await a.esperar();

  const m = a.S().done[a.S().done.length - 1];
  assert.strictEqual(a.S().done.length, 1, 'a hora corrige, não cria outro');
  assert.strictEqual(m.sid, sid, 'e a identidade do registro não muda — é a chave da sincronia');
  assert.strictEqual(m.day, 'D');
  assert.strictEqual(m.retro, 1, 'marcada como lançamento retroativo');
  assert.strictEqual(m.hora, 1, 'e com hora informada, não presumida');
  const q = new Date(m.t);
  assert.strictEqual(q.getHours() + ':' + String(q.getMinutes()).padStart(2, '0'), '19:30',
    'o instante é 19:30 do dia escolhido, não a hora em que ele digitou');
  assert.strictEqual(new Date(m.t).toDateString(), new Date(ontem).toDateString());
  assert.ok(/19h30/.test(a.vJ('ctx.retroativo').notaHora), 'e a folha diz a hora');

  await a.v('ctx.semHoraNoLancamento');
  assert.strictEqual(a.S().done[0].hora, undefined, '"Sem hora" desfaz');
  assert.strictEqual(a.v('temHora', a.S().done[0]), false);
  a.fechar();
});

test('ctx.fechaAdicionar sai sem gravar e devolve a posição de leitura', async () => {
  const a = await app();
  a.E('window.scrollY = 510');            // jsdom não rola sozinho
  a.v('abrirAdicionar', ONTEM());
  assert.strictEqual(a.dado('scrollDoDestino')['add'], 510, 'guardou antes de trocar a tela');

  a.v('ctx.fechaAdicionar');
  await a.esperar();

  assert.strictEqual(a.vista().add, null, 'a tela fechou');
  assert.strictEqual(a.S().done.length, 0, 'e nada foi gravado: sair sem tocar não é gravar');
  assert.strictEqual(a.dado('scrollDoDestino')['add'], undefined, 'devolveu, sem deixar lixo');

  a.v('abrirAdicionar', ONTEM());
  await a.v('lancaTreino', 'B');
  a.v('ctx.fechaAdicionar');
  await a.esperar();
  assert.strictEqual(a.S().done.length, 1, 'e sair depois do toque não desfaz o que gravou');
  a.fechar();
});

// ---------------------------------------------------------------------------
// A retrospectiva de bloco: `ctx.abreRetro`, `ctx.retrospectiva`,
// `ctx.fechaRetro`
// ---------------------------------------------------------------------------
//
// O QUE ESTE GRUPO PROVA: que a tela cheia da retrospectiva abre e fecha como
// destino (posição de leitura devolvida), e que a leitura `ctx.retrospectiva`
// conta as sessões do bloco e põe entre os que subiram quem subiu. `retro()`,
// a regra por baixo, já tem casos em `ritmo.test.js`; o que faltava era a
// LEITURA DA TELA, que é outra coisa — ela formata, ordena e corta em oito.
//
// O QUE ESTE GRUPO NÃO COBRE: o desenho. Nada aqui afirma que o número chegou
// a um pixel; afirma que a leitura que a tela consome está certa.

test('ctx.abreRetro / ctx.retrospectiva / ctx.fechaRetro: o bloco, lido e fechado', async () => {
  const a = await app();
  const k = a.k('A', 0);
  const t0 = Date.now() - 20 * DIA, t1 = Date.now() - 6 * DIA;
  // Cirurgia de fixture pela ponte de escopo, como manda o §4 da superfície:
  // semear `S` não é verbo e não entra na tabela.
  a.E('S.logs[' + JSON.stringify(k) + '] = [' +
      '{ t: ' + t0 + ', sets: [[60,8],[60,8],[60,8]] },' +
      '{ t: ' + t1 + ', sets: [[70,8],[70,8],[70,8]] }]');
  a.E('S.done = [{ day:"A", t:' + t0 + ', sid:' + t0 + ', dur: 3600000 },' +
      '{ day:"A", t:' + t1 + ', sid:' + t1 + ', dur: 3600000 }]');

  a.E('window.scrollY = 320');
  a.v('ctx.abreRetro');
  assert.strictEqual(a.vista().retro, true, 'a tela cheia abriu');
  assert.strictEqual(a.dado('scrollDoDestino')['retro'], 320,
    'e entrou como destino, guardando de onde veio');

  const R = a.vJ('ctx.retrospectiva');
  assert.strictEqual(R.olho, 'retrospectiva de bloco');
  assert.ok(/^2 sessões em /.test(R.titulo), 'conta as sessões do bloco: ' + R.titulo);
  assert.strictEqual(R.stats.filter(function (x) { return x.k === 'c'; })[0].valor, '1',
    'um exercício subiu');
  assert.strictEqual(R.evol.length, 1, 'e ele está na lista dos que subiram');
  assert.strictEqual(R.evol[0].delta, '+17%', '60 kg → 70 kg, com o sinal explícito');
  assert.deepStrictEqual(R.evol[0].series, ['60kg → 70kg'], 'o par de → para, na unidade');
  assert.strictEqual(R.evol[0].meta[0], '2 sessões');
  assert.strictEqual(R.evol[0].deltaCor, '',
    'e sem cor: comparação favorável não é elogio, e o app não comemora');
  assert.strictEqual(R.dores, null, 'nenhuma dor marcada no bloco');
  assert.strictEqual(R.deloads, null, 'nem sessão em deload');

  a.v('ctx.fechaRetro');
  await a.esperar();
  assert.strictEqual(a.vista().retro, false, 'a tela fechou');
  assert.strictEqual(a.dado('scrollDoDestino')['retro'], undefined, 'devolveu, sem deixar lixo');
  a.fechar();
});

test('ctx.retrospectiva sem sessão nenhuma abre com a janela na época zero', async () => {
  // ESTE CASO NÃO AFIRMA QUE ESTÁ CERTO. Ele grava um defeito achado ao cercar
  // a chave: `inicioDoBloco()` devolve `0` quando `S.done` está vazio, e a
  // leitura da tela não trata esse caso — o botão "abrir retrospectiva" do
  // DADOS não tem porteiro nenhum, então uma instalação nova mostra
  // "0 sessões em 2962,1 semanas", com a janela começando em 31/12/1969.
  //
  // Não consertei: o que a tela deve dizer sem bloco nenhum é decisão de
  // produto, não de código. O caso existe para quem decidir ter o vermelho que
  // aponta a linha.
  const a = await app();
  assert.deepStrictEqual(a.S().done, [], 'instalação nova, nenhuma sessão — pré-condição');

  const R = a.vJ('ctx.retrospectiva');
  assert.ok(/^0 sessões em /.test(R.titulo), 'conta zero, o que está certo: ' + R.titulo);
  assert.strictEqual(new Date(a.vJ('retro').de).getUTCFullYear(), 1970,
    'e a janela do bloco começa na época zero, o que não está: ' + R.meta);
  assert.ok(/milhares de semanas/.test(R.titulo) === false &&
            Number(R.titulo.replace(/.* em ([\d.,]+) semanas/, '$1').replace(',', '.')) > 2000,
    'o número de semanas é a idade da época, não a de um bloco: ' + R.titulo);
  a.fechar();
});
