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

// ---------------------------------------------------------------------------
// As chaves de `CTX` do lançamento retroativo: `retroativo`, `gravaRetro`,
// `fechaAdicionar`
// ---------------------------------------------------------------------------
//
// Por que `gravaRetro` primeiro: é a chave daqui que ESCREVE em `S.done` — uma
// presença registrada numa data passada, que entra na rotação, na conta das 48
// e na cópia de segurança. Uma regressão nela perde um treino que aconteceu, e
// nada na tela diz que perdeu.
//
// O QUE ESTE GRUPO PROVA: que a leitura `ctx.retroativo` descreve o formulário
// que `addSet` montou (e devolve `null` sem tela aberta); que `ctx.gravaRetro`
// grava a marca com a hora que `anotaHoraAvulsa` pôs por valor; e que
// `ctx.fechaAdicionar` sai devolvendo a posição de leitura. Os casos acima
// provam o comportamento das funções de módulo (`gravarRetro`); o que faltava
// eram as CHAVES, que são o que a tela usa.
//
// O QUE ESTE GRUPO NÃO COBRE: que algum botão esteja ligado nelas. Chamar o
// verbo prova que a capacidade existe no MODELO, não que o dedo a alcança.

test('ctx.retroativo descreve o formulário montado, e é null sem tela aberta', async () => {
  const a = await app();
  assert.strictEqual(a.v('ctx.retroativo'), null,
    'sem lançamento aberto não há o que descrever — e sai por valor, não estoura');

  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  const vazio = a.vJ('ctx.retroativo');
  assert.strictEqual(vazio.pode, false, 'sem tipo escolhido não dá para gravar');
  assert.strictEqual(vazio.jaTem, null, 'e o dia não tem sessão nenhuma ainda');
  assert.strictEqual(vazio.hoje, false, 'ontem não é hoje');
  assert.ok(vazio.tipos.every(function (x) { return !x.on; }), 'nenhum tipo aceso');
  assert.deepStrictEqual(vazio.tipos.map(function (x) { return x.k; }).slice(-2),
    ['livre', 'descanso'], 'as letras da rotação, mais "outro treino" e "foi descanso"');

  a.v('addSet', 'tipo', 'C');
  a.v('addSet', 'dur', 45);
  const cheio = a.vJ('ctx.retroativo');
  assert.strictEqual(cheio.pode, true, 'com tipo escolhido já dá para gravar');
  assert.ok(cheio.tipos.filter(function (x) { return x.on; }).length === 1 &&
            cheio.tipos.filter(function (x) { return x.on; })[0].k === 'C', 'o C está aceso');
  assert.ok(cheio.duracoes.filter(function (x) { return x.on; })[0].k === 45, 'e os 45 min');
  assert.ok(/·/.test(cheio.doPlano), 'e a leitura diz que treino do plano é esse: ' + cheio.doPlano);
  assert.strictEqual(cheio.livre, false, 'C não é avulso, então não pede grupo muscular');

  // trocar para avulso muda a pergunta: deixa de ter treino do plano e passa a
  // pedir grupo — é a leitura que decide o que a tela mostra
  a.v('addSet', 'tipo', 'livre');
  const avulso = a.vJ('ctx.retroativo');
  assert.strictEqual(avulso.livre, true);
  assert.strictEqual(avulso.doPlano, null, 'avulso não tem treino do plano para descrever');
  assert.ok(avulso.grupos.length > 0, 'e oferece os grupos do plano');
  a.fechar();
});

test('ctx.gravaRetro grava a presença com a hora posta por valor', async () => {
  const a = await app();
  const ontem = ONTEM();
  a.v('abrirAdicionar', ontem);
  a.v('addSet', 'tipo', 'D');
  a.v('addSet', 'dur', 60);
  // `anotaHoraAvulsa` é o par por valor de `addHora`, que recebe elemento: é
  // por aqui que a hora entra sem passar pelo campo.
  a.v('anotaHoraAvulsa', '19:30');
  assert.strictEqual(a.vJ('ctx.retroativo').hora, '19:30', 'a leitura já mostra a hora');

  await a.v('ctx.gravaRetro', false);
  await a.esperar();

  const m = a.S().done[a.S().done.length - 1];
  assert.strictEqual(m.day, 'D');
  assert.strictEqual(m.retro, 1, 'marcada como lançamento retroativo');
  assert.strictEqual(m.hora, 1, 'e com hora informada, não presumida');
  assert.strictEqual(m.dur, 60 * 60000);
  const q = new Date(m.t);
  assert.strictEqual(q.getHours() + ':' + String(q.getMinutes()).padStart(2, '0'), '19:30',
    'o instante é 19:30 do dia escolhido, não a hora em que ele digitou');
  assert.strictEqual(new Date(m.t).toDateString(), new Date(ontem).toDateString());
  assert.strictEqual(a.vista().add, null, 'e a tela fechou sozinha');
  a.fechar();
});

test('ctx.fechaAdicionar sai sem gravar e devolve a posição de leitura', async () => {
  const a = await app();
  a.E('window.scrollY = 510');            // jsdom não rola sozinho
  a.v('abrirAdicionar', ONTEM());
  assert.strictEqual(a.dado('scrollDoDestino')['add'], 510, 'guardou antes de trocar a tela');

  a.v('addSet', 'tipo', 'B');
  a.v('ctx.fechaAdicionar');
  await a.esperar();

  assert.strictEqual(a.vista().add, null, 'a tela fechou');
  assert.strictEqual(a.S().done.length, 0, 'e nada foi gravado: sair não é gravar');
  assert.strictEqual(a.dado('scrollDoDestino')['add'], undefined, 'devolveu, sem deixar lixo');
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
