// OS ESTADOS RUINS — §7 da frente 3, e a forma comum da §7.1 da frente 2.
//
// Cada estado diz o que aconteceu, o que NÃO aconteceu, o que dá para fazer e
// como sair sem fazer nada. Estes casos leem as palavras.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

test('"já parei" diz que o fim é a última série, e que a duração é aproximada', async () => {
  // §7.7: é o único lugar do produto em que um TOQUE dele grava um tempo que
  // não é o do toque — e a frase tem de dizer isso, com a hora.
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.preencher(0, 0, 40, 10);
  const ultima = a.S().sessao.ultima;
  const h = new Date(ultima);
  const hora = h.getHours() + 'h' + String(h.getMinutes()).padStart(2, '0');
  await a.v('ctx.encerraSessaoEsquecida');
  await a.esperar();
  assert.ok(a.toast().indexOf('Encerrei o Treino A na última série, às ' + hora + '. A duração vai até ela: cerca de ') === 0, a.toast());
  assert.ok(/, aproximada\.$/.test(a.toast()), 'e diz que é estimativa: ninguém mediu o que houve depois dela');
  a.fechar();
});

test('o menu da sessão diz o fim que o toque grava, antes do toque', async () => {
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  const m = a.vJ('ctx.menuDaSessao');
  assert.strictEqual(m.encerrar.rotulo, 'Encerrar o treino', '"encerrar", e não "finalizar"');
  assert.ok(/^o fim é agora, \d+h\d\d$/.test(m.encerrar.detalhe), m.encerrar.detalhe);
  a.fechar();
});

test('a sessão fechada por inatividade é dita na abertura seguinte, com o dia', async () => {
  // Antes, o fecho na abertura acontecia em silêncio — e é o caminho comum.
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.preencher(0, 0, 40, 10);
  const estado = a.S();
  // ontem às 10h, e não "26 horas atrás": rodando logo depois da meia-noite,
  // 26 horas atrás é ANTEONTEM, e o toast diz a data em vez de "ontem"
  const d0 = new Date(); d0.setDate(d0.getDate() - 1); d0.setHours(10, 0, 0, 0);
  const ontem = d0.getTime();
  estado.sessao.inicio = ontem;
  estado.sessao.ultima = ontem + 40 * 60000;
  estado.done[estado.done.length - 1].t = ontem;
  a.fechar();

  const b = await app({ estado });
  await b.esperar();
  assert.strictEqual(b.S().sessao, null, 'a sessão vencida fechou na abertura');
  assert.ok(/^Fechei o Treino A de ontem na última série, às \d+h\d\d\. A duração vai até ela: cerca de .+, aproximada\.$/
    .test(b.toast()), b.toast());
  b.fechar();
});

test('o registro que não abre em 4 s é dito, e o "carregando" não fica para sempre', async () => {
  // §7.2 e F273: a mensagem de carregamento já ficou para sempre uma vez. O
  // armazenamento mudo do harness trava a leitura do registro.
  const a = await app({ armazenamentoMudo: true });
  assert.ok(/Lendo o registro deste aparelho\. Não precisa de rede\./.test(a.texto('#app')),
    'durante: diz o que está fazendo, e que não depende de rede');
  assert.strictEqual(a.$('#abertura-falhou'), null, 'antes do prazo, nada de falha');

  await a.esperar(4300);
  const aviso = a.$('#abertura-falhou');
  assert.ok(aviso, 'passado o prazo, a falha é dita');
  assert.strictEqual(aviso.getAttribute('role'), 'alert', 'e interrompe');
  assert.strictEqual(a.texto('.abertura-t'), 'O registro deste aparelho não abriu.');
  assert.strictEqual(a.texto('.abertura-c'),
    'Esperei 4 s. Nada foi apagado e nada saiu do aparelho. A rede não é a causa: o registro mora aqui.');
  assert.ok(a.$('[data-a="abertura-tenta"]'), 'com "Tentar de novo"');
  assert.ok(a.$('.abertura-d').hidden, 'o detalhe técnico fica guardado até ele pedir');
  a.clicar(a.$('[data-a="abertura-detalhe"]'));
  assert.ok(!a.$('.abertura-d').hidden, '"Ver o detalhe técnico" mostra');
  assert.ok(/^leitura local sem resposta há \d+ s · armazenamento: /.test(a.texto('.abertura-d')), a.texto('.abertura-d'));
  a.fechar();
}, 10000);

test('o app que abre a tempo nunca mostra a falha da abertura', async () => {
  const a = await app();
  await a.esperar(4300);
  assert.strictEqual(a.$('#abertura-falhou'), null, 'a primeira montagem desarma o prazo');
  a.fechar();
}, 10000);

test('deload: desligar sem nada registrado diz quantas voltaram, e fora da sessão diz só que voltaram', async () => {
  const a = await app({ estado: { logs: {}, done: [], deload: true } });
  await a.v('setDeload', false);
  await a.esperar();
  assert.strictEqual(a.toast(), 'Deload desligado. Séries completas de volta.', 'fora da sessão não há série a tranquilizar');

  await a.v('setDeload', true);
  a.v('iniciarSessao');
  await a.esperar();
  const volta = a.vJ('treino', a.vista().day).ex.reduce(function (n, x) { return n + x.s - Math.ceil(x.s / 2); }, 0);
  await a.v('setDeload', false);
  await a.esperar();
  assert.strictEqual(a.toast(), 'Deload desligado. As ' + volta + ' séries voltaram.');
  a.fechar();
});

