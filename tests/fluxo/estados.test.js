// OS ESTADOS RUINS — §7 da frente 3, e a forma comum da §7.1 da frente 2.
//
// Cada estado diz o que aconteceu, o que NÃO aconteceu, o que dá para fazer e
// como sair sem fazer nada. Estes casos leem as palavras.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

test('pular diz o que guardou, pelo nome, e desfazer diz que voltou para a fila', async () => {
  // §7.5: pular é reversível a um toque, então não há pergunta antes — há a
  // frase do que ficou guardado, e o desfazer onde o dedo está.
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  const nome = a.J('treino(view.day).ex[0].n');

  await a.v('pularEx', 0);
  await a.esperar();
  assert.strictEqual(a.toast(),
    'Guardei como pulado hoje: ' + nome + '. Não volta a ser pedido nesta sessão; desfazer põe de volta na fila.');
  assert.ok(/Fica escrito como pulado e não volta a ser pedido/.test(a.texto('.puladobox')),
    'a linha diz as duas metades: não volta a ser pedido, e o caminho de volta existe');
  assert.ok(a.$('.puladobox button'), 'com o desfazer na própria linha');

  await a.v('pularEx', 0);
  await a.esperar();
  assert.strictEqual(a.toast(), 'Desfeito: ' + nome + ' voltou para a fila desta sessão.');
  assert.strictEqual(a.$('.puladobox'), null, 'e a linha deixa de dizer pulado');
  a.fechar();
});

test('"já parei" diz que o fim é a última série, e que a duração é aproximada', async () => {
  // §7.7: é o único lugar do produto em que um TOQUE dele grava um tempo que
  // não é o do toque — e a frase tem de dizer isso, com a hora.
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.preencher(0, 0, 40, 10);
  const ultima = a.E('S.sessao.ultima');
  const h = new Date(ultima);
  const hora = h.getHours() + 'h' + String(h.getMinutes()).padStart(2, '0');
  await a.v('ctx.encerraSessaoEsquecida');
  await a.esperar();
  assert.ok(a.toast().indexOf('Encerrei o Treino A na última série, às ' + hora + '. A duração vai até ela: cerca de ') === 0, a.toast());
  assert.ok(/, aproximada\.$/.test(a.toast()), 'e diz que é estimativa: ninguém mediu o que houve depois dela');
  a.fechar();
});

test('encerrar com pendentes pergunta sem a cor de pare, e "Voltar ao treino" não encerra', async () => {
  const a = await app({ painelManual: true });
  a.v('iniciarSessao');
  await a.esperar();
  a.preencher(0, 0, 40, 10);
  a.v('finalizarSessao');
  await a.esperar();

  assert.ok(a.$('.pergunta-w [role="alertdialog"]'), 'a pergunta é a variante neutra, não o painel de pare');
  assert.strictEqual(a.perguntas().length, 0, 'e não o diálogo do sistema');
  assert.ok(/^Encerrar com \d+ exercícios pendentes: .+\. Eles ficam marcados como não feitos no histórico\.$/
    .test(a.texto('.pare-t')), a.texto('.pare-t'));
  assert.strictEqual(a.texto('[data-a="pare-sim"]').trim(), 'Encerrar assim');
  assert.strictEqual(a.texto('[data-a="pare-nao"]').trim(), 'Voltar ao treino');

  a.clicar(a.$('[data-a="pare-nao"]'));
  await a.esperar();
  assert.ok(a.S().sessao, '"Voltar ao treino" deixa a sessão aberta');
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
  const ontem = Date.now() - 26 * 3600 * 1000;
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
