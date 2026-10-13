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
  const nome = a.vJ('treino', a.vista().day).ex[0].n;

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
  const ultima = a.S().sessao.ultima;
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

test('máquina ocupada: vale só para hoje, o ★ tem palavra, e as saídas vão por preço', async () => {
  // §7.3: "Fazer antes o próximo" primeiro (não troca nada), os substitutos, e
  // "Pular hoje" por último; a dispensa é "Fechar e fazer mesmo assim".
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  await a.m.ctx.acoesEx.toggle(0);
  a.v('toggleSwap', 0);
  await a.esperar();

  assert.strictEqual(a.texto('.swap .swap-h'), 'Máquina ocupada');
  assert.strictEqual(a.texto('.swap-sub'), a.vJ('treino', 'A').ex[0].n, 'e de qual exercício, embaixo');
  assert.strictEqual(a.texto('.swap-regra'), 'Vale só para hoje. O programa não muda.');

  const opcoes = a.$$('.swap .swapopt').map(function (b) { return b.textContent.trim(); });
  assert.ok(/^Fazer antes o próximo/.test(opcoes[0]), 'a saída mais barata vem primeiro');
  assert.ok(/^Pular hoje/.test(opcoes[opcoes.length - 2]), 'pular é o último recurso');
  assert.strictEqual(opcoes[opcoes.length - 1], 'Fechar e fazer mesmo assim');
  assert.ok(opcoes.some(function (t) { return /★ .+ · indicado pelo treinador/.test(t); }),
    'o ★ do treinador vem com a palavra');
  a.fechar();
});

test('fazer antes o próximo troca a ordem só hoje, e diz isso', async () => {
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  const primeiro = a.vJ('treino', 'A').ex[0].n, segundo = a.vJ('treino', 'A').ex[1].n;
  a.v('toggleSwap', 0);
  await a.esperar();
  a.clicar(a.$('[data-a="faz-antes"]'));
  await a.esperar();
  assert.strictEqual(a.vJ('treino', 'A').ex[0].n, segundo, 'o próximo vem agora');
  assert.strictEqual(a.vJ('treino', 'A').ex[1].n, primeiro, 'e este logo depois');
  assert.ok(a.vJ('modsDoDia', 'A').some(function (m) { return m.k === 'mover'; }),
    'é uma mudança DO DIA — a mesma que mover já usa');
  // `S.prog` é o programa; `treino()` é ele com as mudanças do dia por cima.
  assert.strictEqual(a.v('nomeEx', a.S().prog.A.ex[0].id), primeiro, 'o programa não muda');
  assert.strictEqual(a.toast(), 'Só hoje: ' + segundo + ' agora, e ' + primeiro + ' logo depois. O programa não muda.');
  a.fechar();
});

test('dor repetida para a régua até a escolha, com as datas e a regra literal do treinador', async () => {
  // §7.4: o único estado ruim que não se dispensa sem responder. A régua só
  // volta depois da escolha, e "fazer mesmo assim" fica registrado no dia.
  const DIA = 86400000;
  const t1 = Date.now() - 9 * DIA, t2 = Date.now() - 2 * DIA;
  const id = 'chest-press-inclinado-convergente';
  const a = await app({ estado: { logs: { [id]: [
    { t: t1, sid: t1, sets: [[50, 8]], dor: ['ombro'] },
    { t: t2, sid: t2, sets: [[50, 8]], dor: ['ombro'] }
  ] } } });
  a.v('iniciarSessao');
  await a.esperar();
  if (a.vista().open !== 0) { a.v('toggle', 0); await a.esperar(); }

  const aviso = a.texto('.painbox');
  assert.ok(/nas duas últimas sessões deste exercício: \d\d\/\d\d e \d\d\/\d\d\./.test(aviso), 'com as duas datas — ' + aviso);
  assert.ok(aviso.indexOf('Treinador: “Apareceu: tire aquele exercício por 2 semanas e substitua por') >= 0,
    'a regra nas palavras dele, atribuída');
  assert.ok(/Escolha uma das três para a régua voltar/.test(aviso), 'e diz o que destrava');
  assert.strictEqual(a.$$('.ex.open .setrow').length, 0, 'a régua espera a escolha');

  a.clicar(a.$('[data-a="dor-mesmo"]'));
  await a.esperar();
  assert.ok(a.$$('.ex.open .setrow').length > 0, '"fazer mesmo assim" devolve a régua');
  assert.ok(/registrado no dia/.test(a.toast()), a.toast());
  assert.ok(/Feito mesmo assim/.test(a.texto('.painbox')), 'o aviso fica, dizendo a escolha');

  a.preencher(0, 0, 50, 8);           // sessão sem série seria descartada, e com razão
  await a.v('finalizarSessao');
  await a.esperar();
  const marca = a.S().done[a.S().done.length - 1];
  assert.deepStrictEqual(marca.dorMesmoAssim, [id], 'a escolha ficou escrita no dia, como o pulado');
  a.fechar();
});

test('deload: ligar diz o corte e marca a sessão; desligar no meio devolve as séries e o registrado fica', async () => {
  // §7.6 e a decisão 7. O freio saiu do lugar e foi para a palavra, e a frase
  // de desligar tem as duas metades — a segunda é a que impede o susto.
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  const nome = a.vJ('treino', a.vista().day).ex[0].n;
  const pede = a.vJ('treino', a.vista().day).ex[0].s;
  const corta = Math.ceil(pede / 2);
  const volta = a.vJ('treino', a.vista().day).ex.reduce(function (n, x) { return n + x.s - Math.ceil(x.s / 2); }, 0);
  assert.ok(pede > corta && corta === 2, 'pré-condição: o deload deixa 2 de um prescrito maior (' + pede + ')');

  await a.v('setDeload', true);
  await a.esperar();
  assert.strictEqual(a.toast(),
    'Deload ligado. Metade das séries, mesmas cargas. As sessões deste modo ficam marcadas, para a queda de volume não parecer regressão.');
  const marca = () => a.S().done.filter(function (x) { return x.sid === a.S().sessao.sid; })[0];
  assert.strictEqual(marca().dl, 1, 'ligar no meio marca a sessão aberta, não só as próximas');

  a.v('toggle', 0);
  await a.esperar();
  assert.ok(a.texto('.ex.open .ex-sub').indexOf('2 séries hoje · metade do prescrito, por deload') >= 0,
    'a linha diz que o número ali não é o prescrito — ' + a.texto('.ex.open .ex-sub'));
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  const estado = () => a.v('estadoEx', a.vista().day, 0, a.S().sessao.sid, []);
  assert.strictEqual(estado(), 'feito', 'pré-condição: as 2 do deload fecham o exercício');

  await a.v('setDeload', false);
  await a.esperar();
  assert.strictEqual(a.toast(),
    'Deload desligado. As ' + volta + ' séries voltaram: ' + nome + ' volta a pedir ' + pede +
    ', e as 2 que você já registrou ficam.');
  assert.strictEqual(estado(), 'parcial', 'e volta a pedir mesmo: a tela não pode dizer "feito" com 2 de ' + pede);
  const e = a.log(a.vista().day, 0).filter(function (x) { return x.sid === a.S().sessao.sid; })[0];
  assert.strictEqual(e.sets.filter(Boolean).length, 2, 'o registrado fica');
  assert.strictEqual(e.dl, undefined, 'e a entrada deixa de dizer deload');
  assert.strictEqual(marca().dl, undefined, 'a sessão também: ela volta à conta das 48');
  a.fechar();
});

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

test('deload: o botão do aviso do treino diz as mesmas palavras do menu, com o número', async () => {
  // A segunda porta do interruptor. "sair do deload" sozinho era o nome sem o
  // freio — a linha "nunca" da tabela da §7.6.
  const a = await app({ estado: { logs: {}, done: [], deload: true } });
  await a.esperar();
  const b = a.$('.dlbtn');
  assert.ok(b, 'o aviso de deload ativo está no treino');
  assert.match(b.textContent, /^Sair do deload · devolve \d+ séries ao Treino [A-Z]+ de hoje$/, b.textContent);
  a.fechar();
});
