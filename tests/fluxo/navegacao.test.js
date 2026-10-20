// O Voltar do sistema, e a posição de leitura ao voltar.
//
// O app não punha NENHUMA entrada no histórico: `history.length` ficava em 2
// para sempre, e no Android — onde o Voltar é botão e é gesto — o primeiro
// Voltar em qualquer ponto fechava o app, com folha aberta ou no meio de uma
// série. Estes testes seguram as duas metades da correção: uma entrada por
// camada aberta, e uma camada fechada por Voltar.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { camadasAbertas } from '../../src/ui/navegacao.js';

/**
 * Dispara o Voltar do navegador e espera o `popstate` chegar.
 *
 * `history.back()` é assíncrono em qualquer motor, jsdom incluído: sem a espera
 * a asserção roda antes de o app ter fechado coisa nenhuma.
 */
async function voltar(a) {
  a.window.history.back();
  await a.esperar(60);
}

test('a pilha de camadas é derivada de view, de baixo para cima', () => {
  // Função pura: dá para cobrar sem navegador, e é o único pedaço disto que dá.
  assert.deepStrictEqual(camadasAbertas({}), []);
  assert.deepStrictEqual(camadasAbertas({ prog: {} }), ['prog']);
  assert.deepStrictEqual(
    camadasAbertas({ hist: {}, pilha: [{ k: 'dia' }] }),
    ['hist', 'folha:0'],
    'a folha fica por cima do destino'
  );
  // A ordem espelha `telaCheia()` de trás para frente: o que ela desenha
  // primeiro é o que está por cima, e portanto o último a entrar na pilha.
  assert.deepStrictEqual(
    camadasAbertas({ protocolo: {}, ajuste: {} }),
    ['protocolo', 'ajuste'],
    'ajuste abre POR CIMA do protocolo'
  );
});

test('abrir camada empurra uma entrada no histórico', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const antes = a.window.history.length;

  a.v('ctx.abreFolha', { k: 'dia' });
  await a.esperar();

  assert.ok(a.$('.ins-folha'), 'a folha está na tela');
  assert.strictEqual(a.window.history.length, antes + 1, 'uma entrada por camada');
  assert.strictEqual(a.window.history.state.lastro, 1, 'a entrada carrega a profundidade');
  a.fechar();
});

test('o Voltar do sistema fecha a folha em vez de sair do app', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreFolha', { k: 'dia' });
  await a.esperar();
  assert.ok(a.$('.ins-folha'), 'a folha abriu');

  await voltar(a);

  assert.ok(!a.$('.ins-folha'), 'o Voltar fechou a folha');
  assert.ok(a.$('.ins-tabbar'), 'e o app continua de pé');
  a.fechar();
});

test('folhas empilhadas fecham uma por Voltar', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreFolha', { k: 'editaRefeicao', id: null });
  await a.esperar();
  a.v('ctx.abreFolha', { k: 'seletor', ref: null, idx: 0 });
  await a.esperar();
  assert.strictEqual((a.vista().pilha || []).length, 2);

  await voltar(a);
  assert.strictEqual((a.vista().pilha || []).length, 1, 'fechou só a de cima');

  await voltar(a);
  assert.strictEqual((a.vista().pilha || []).length, 0, 'e depois a de baixo');
  assert.ok(a.$('.ins-tabbar'), 'o app continua de pé');
  a.fechar();
});

/**
 * Um Escape como o navegador entrega: no `document` e BORBULHANDO.
 *
 * `bubbles: true` não é detalhe de teste. Tecla real nasce no elemento com foco
 * e sobe até a janela; evento sem borbulha só alcança quem escuta exatamente no
 * alvo, e por isso ele passava com o arranjo antigo — um ouvinte POR FOLHA,
 * montado no próprio `document`. Despachar sem borbulhar era fixar esse
 * arranjo no teste.
 */
function escape(a) {
  a.doc.dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  return a.esperar();
}

test('o Escape fecha uma folha por vez, mesmo com três abertas', async () => {
  // O contrato manda que o Esc desfaça UMA camada, pelo mesmo caminho do
  // Voltar. Com a pilha cheia, um Escape já fechou duas de uma vez.
  // Refeição e o editor dela dividem o nível 50, então um desempate por
  // z-index dependia da ordem de desenho — e hoje quem decide é a pilha.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreFolha', { k: 'editaRefeicao', id: null });
  await a.esperar();
  a.v('ctx.abreFolha', { k: 'seletor', ref: null, idx: 0 });
  await a.esperar();
  a.v('ctx.abreFolha', { k: 'editaAlimento', id: null });
  await a.esperar();
  assert.strictEqual((a.vista().pilha || []).length, 3);

  const esc = () => escape(a);

  await esc();
  assert.strictEqual((a.vista().pilha || []).length, 2, 'fechou só a de cima');
  await esc();
  assert.strictEqual((a.vista().pilha || []).length, 1);
  await esc();
  assert.strictEqual((a.vista().pilha || []).length, 0);
  assert.ok(a.$('.ins-tabbar'), 'o app continua de pé');
  a.fechar();
});

test('o Escape sai de um destino de tela cheia, como o Voltar', async () => {
  // A metade do contrato que o Esc NÃO cumpria. O texto é uma lista só —
  // "vale para o `‹ voltar`, para o `×` da folha, para o toque no véu, para o
  // Esc e para o Voltar do sistema, todos pelo mesmo caminho" — e o Voltar, com
  // destino aberto, "volta à aba". O Esc não voltava: o único ouvinte dele
  // morava dentro da folha, então em tela cheia sem folha nenhuma a tecla não
  // tinha quem a escutasse.
  //
  // O destino aqui é o modo de sessão porque ele abre sem argumento nenhum, e
  // qualquer um serve: `camadasAbertas` trata os onze destinos igual, e o Esc
  // agora chama o MESMO verbo do Voltar, que já tem caso para cada um.
  const a = await app({ aba: 'agora' });
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.deepStrictEqual(camadasAbertas(a.vista()), ['modoSessao'], 'pré-condição: destino aberto');

  await escape(a);
  assert.deepStrictEqual(camadasAbertas(a.vista()), [], 'o Esc fechou o destino');
  assert.ok(a.$('.ins-tabbar'), 'e devolveu a casca das abas');
  a.fechar();
});

test('o Escape na raiz de uma aba não faz nada', async () => {
  // "Raiz de uma aba → sai do app. Não se intercepta isso" — mas o Esc não é o
  // Voltar do sistema: ele não tem para onde sair, e uma camada a menos que
  // zero não existe. O ouvinte único agora recebe TODA tecla do app, e sem esta
  // guarda ele chamaria o verbo de fechar sobre nada.
  const a = await app({ aba: 'agora' });
  assert.deepStrictEqual(camadasAbertas(a.vista()), [], 'pré-condição: nada aberto');
  const antes = JSON.stringify([a.vista().aba, a.vista().day]);

  await escape(a);
  await escape(a);

  assert.deepStrictEqual(camadasAbertas(a.vista()), [], 'continua sem camada');
  assert.strictEqual(JSON.stringify([a.vista().aba, a.vista().day]), antes,
    'e sem mexer na aba nem no dia: ' + antes);
  assert.ok(a.$('.ins-tabbar'), 'o app continua de pé');
  a.fechar();
});

test('o Voltar sai de um destino de tela cheia', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('abrirPrograma', null);
  await a.esperar();
  assert.ok(!!a.vista().prog, 'o programa abriu');

  await voltar(a);

  assert.ok(!!!a.vista().prog, 'o Voltar fechou o programa');
  assert.ok(a.$('.ins-tabbar'), 'e devolveu a shell com a tab bar');
  a.fechar();
});

test('fechar pelo botão do app não deixa entrada órfã no histórico', async () => {
  // Se a entrada continuasse lá, o Voltar seguinte não faria nada visível — o
  // usuário apertaria duas vezes para sair de uma tela que já tinha fechado.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreFolha', { k: 'dia' });
  await a.esperar();
  a.v('ctx.fechaFolha');
  await a.esperar(80);

  assert.strictEqual(
    a.window.history.state.lastro, 0,
    'o histórico voltou à profundidade zero junto com a pilha'
  );
  a.fechar();
});

test('voltar de um destino devolve a posição de leitura', async () => {
  // Guia é a tela mais longa do app: cair no topo dela ao voltar é perder o
  // lugar toda vez. O mecanismo já existia e estava ligado em 4 dos 10
  // destinos; este teste segura o Programa, que era um dos seis de fora.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.aba('ajustes');
  await a.esperar();

  // jsdom não tem layout, então `scrollY` não anda sozinho: o que se cobra aqui
  // é o contrato entre entrar e sair, que é onde estava o defeito.
  let y = 0;
  Object.defineProperty(a.window, 'scrollY', { get: () => y, configurable: true });
  a.window.scrollTo = (_x, top) => { y = typeof top === 'number' ? top : 0; };
  const pedidos = [];
  a.window.scrollTo = function (x, top) {
    if (x && typeof x === 'object') { pedidos.push(x.top); y = x.top; return; }
    pedidos.push(top); y = top || 0;
  };

  y = 1500;
  a.v('abrirPrograma', null);
  await a.esperar();
  assert.strictEqual(pedidos[pedidos.length - 1], 0, 'entrar no destino leva ao topo');

  a.v('fecharPrograma');
  await a.esperar();
  assert.strictEqual(pedidos[pedidos.length - 1], 1500, 'sair devolve onde se estava');
  a.fechar();
});

test('a folha entra em foco, isola o fundo e devolve o foco ao sair', async () => {
  // `aria-modal="true"` já estava declarado, e sozinho ele não faz nada: quem
  // impede o foco de vazar é o `inert`. Medido antes da correção: 39 elementos
  // continuavam tabuláveis atrás da folha e o foco ficava no botão que a abriu.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.aba('agora');
  await a.esperar();

  const acionador = a.$('[data-a="tipo-do-dia"]');
  assert.ok(acionador, 'o botão de estado do cabeçalho abre o seletor de dia');
  acionador.focus();

  a.v('ctx.abreFolha', { k: 'dia' });
  // 60 ms e não os 20 do padrão: o foco entra num `useLayoutEffect` que corre
  // depois do commit, e a cadeia de render ficou um passo mais longa quando a
  // casca passou a desenhar as folhas também sobre destino de tela cheia. Vinte
  // milissegundos pegavam o quadro anterior — e o caso falhava dizendo que o
  // foco não entrou, quando ele entrava um tique depois.
  await a.esperar(60);

  const folha = a.$('.ins-folha');
  assert.ok(folha, 'a folha abriu');
  assert.strictEqual(a.doc.activeElement, folha, 'o foco entrou na folha');
  assert.strictEqual(folha.getAttribute('role'), 'dialog');
  assert.strictEqual(folha.getAttribute('aria-modal'), 'true');

  const inertes = a.$$('#app > [inert]');
  assert.ok(inertes.length > 0, 'o que está atrás ficou inerte');
  assert.ok(
    inertes.every(el => !el.contains(folha)),
    'e a folha não foi tornada inerte junto'
  );

  a.v('ctx.fechaFolha');
  await a.esperar();

  assert.ok(!a.$('.ins-folha'), 'a folha fechou');
  assert.strictEqual(a.$$('#app > [inert]').length, 0, 'o fundo voltou a ser alcançável');
  assert.strictEqual(a.doc.activeElement, a.$('[data-a="tipo-do-dia"]'),
    'e o foco voltou para o botão que abriu');
  a.fechar();
});

// ===========================================================================
// `ctx.trocaFolha` — a folha que SUBSTITUI o topo em vez de empilhar
// ===========================================================================
//
// `abreFolha`, `fechaFolha` e `fechaTudo` já têm rede aqui e em `fusao`.
// `trocaFolha` não tinha caso nenhum que a acionasse pelo nome: `fusao` ::
// *cadastrar a partir da busca não abre a quarta folha* chega nela por um
// CLIQUE no botão de cadastrar, então o caso prova a fiação daquele botão e
// não a capacidade.
//
// Ela existe por um caminho só — refeição → `···` → trocar → cadastrar, que
// chegava à QUARTA folha, a primeira em que ninguém sabe mais o que o fechar
// leva de volta. Cobre o modelo: que trocar o topo não cresce a pilha e que o
// fechar volta uma camada, não duas.

test('ctx.trocaFolha substitui o topo, e o Voltar devolve uma camada só', async () => {
  const a = await app({ aba: 'prescricao' });
  a.v('ctx.abreFolha', { k: 'editaRefeicao', id: null });
  a.v('ctx.abreFolha', { k: 'seletor', ref: null, idx: 0 });
  await a.esperar(60);
  assert.deepStrictEqual(a.vista().pilha.map(function (f) { return f.k; }),
    ['editaRefeicao', 'seletor'], 'duas camadas: editar a refeição e a busca');
  const entradas = a.window.history.length;

  a.v('ctx.trocaFolha', { k: 'editaAlimento', id: null });
  await a.esperar(60);

  assert.deepStrictEqual(a.vista().pilha.map(function (f) { return f.k; }),
    ['editaRefeicao', 'editaAlimento'],
    'o cadastro tomou o lugar da busca — continuar não é empilhar');
  assert.strictEqual(a.vista().pilha.length, 2, 'e a pilha não cresceu para três');
  assert.strictEqual(a.$$('.ins-folha').length, 2, 'na tela também são duas');
  assert.strictEqual(a.window.history.length, entradas,
    'nem uma entrada nova de histórico: trocar não é abrir');

  a.v('ctx.fechaFolha');
  await a.esperar(60);
  assert.deepStrictEqual(a.vista().pilha.map(function (f) { return f.k; }), ['editaRefeicao'],
    'e fechar volta para a refeição, que é a camada de baixo');
  a.fechar();
});

// ---------- a sessão como MODO ----------
//
// O protótipo achou o defeito mais básico do redesenho: instalado no iPhone não
// existe barra de navegador, e o dedo ficava preso dentro do treino, sem caminho
// para a comida. A sessão deixa de ser aba e passa a ser MODO, com saída própria.
//
// O modo é camada NOVA, e a mais funda das telas cheias. Não confundir com
// `view.sessao`, que já existia e é o DETALHE de uma sessão passada — foi a
// frente 1 que apontou a confusão, e é por isso que a flag tem outro nome.

test('o modo de sessão é a camada mais funda das telas cheias', () => {
  assert.deepStrictEqual(camadasAbertas({ modoSessao: true }), ['modoSessao']);
  assert.deepStrictEqual(
    camadasAbertas({ modoSessao: true, prog: {} }),
    ['modoSessao', 'prog'],
    'um destino aberto de dentro do modo fica POR CIMA dele'
  );
  assert.deepStrictEqual(
    camadasAbertas({ modoSessao: true, pilha: [{ k: 'dia' }] }),
    ['modoSessao', 'folha:0'],
    'e a folha por cima de tudo'
  );
  // E o detalhe de sessão passada continua sendo outra coisa, no lugar dele
  assert.deepStrictEqual(
    camadasAbertas({ modoSessao: true, sessao: {} }),
    ['modoSessao', 'sessao'],
    'o modo e o detalhe de uma sessão passada coexistem, e não são o mesmo'
  );
});

test('entrar no modo não começa a sessão, e sair do modo não a encerra', async () => {
  const a = await app({ aba: 'agora' });

  // entrar no modo com nenhuma sessão viva: o modo abre e nada é gravado.
  // "Abre PRONTO, não INICIADO" — a sessão nasce na primeira série completa, e
  // o botão nunca foi pré-condição para gravar.
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, true, 'o modo abriu');
  assert.strictEqual(a.S().sessao, null, 'e nenhuma sessão foi criada');

  // agora com sessão viva: sair do modo deixa a sessão de pé
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  assert.ok(a.S().sessao, 'a série completa abriu a sessão');

  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, false, 'o modo fechou');
  assert.ok(a.S().sessao, 'e a sessão continua aberta — a seta não encerra nada');
  a.fechar();
});

test('fechar o modo devolve a aba de onde se entrou', async () => {
  const a = await app({ aba: 'agora' });
  a.aba('semana');
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'semana',
    'o modo é camada: fechá-la devolve onde o dedo estava, como todo destino');
  a.fechar();
});

test('o Voltar do sistema fecha o modo em vez de sair do app', async () => {
  // É o ponto todo de o modo ser CAMADA. Instalado na tela de início não há
  // barra de navegador: se o modo não empurrar uma entrada no histórico, o
  // primeiro Voltar dentro do treino fecha o app — que é o defeito que
  // `navegacao.js` nasceu para consertar, chegando por uma porta nova.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, true, 'o modo abriu');

  await voltar(a);

  assert.strictEqual(a.vista().modoSessao, false, 'o Voltar fechou o modo');
  assert.ok(a.$('.ins-tabbar'), 'e devolveu a casca com a barra de abas');
  a.fechar();
});

test('de dentro do modo, o Voltar fecha o que está por cima antes do modo', async () => {
  // A ordem importa e é a razão de o modo ser a camada mais FUNDA: quem abre o
  // programa de dentro do treino espera que o Voltar feche o programa, não que
  // o jogue fora do treino inteiro.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  a.v('abrirPrograma', null);
  await a.esperar();
  assert.ok(a.vista().prog, 'o programa abriu por cima do modo');

  await voltar(a);
  assert.ok(!a.vista().prog, 'o primeiro Voltar fechou o programa');
  assert.strictEqual(a.vista().modoSessao, true, 'e o modo continuou de pé');

  await voltar(a);
  assert.strictEqual(a.vista().modoSessao, false, 'o segundo Voltar fechou o modo');
  a.fechar();
});

test('o modo desenha a saída visível, e tira a barra de abas', async () => {
  // A seta é a ÚNICA saída visível do modo, e o rótulo dela diz o que ela faz
  // com todas as letras — porque o que ela faz não é obvio: fecha o modo e
  // DEIXA A SESSÃO ABERTA. Um "voltar" genérico aqui deixaria a dúvida de se
  // sair do treino encerra o treino.
  //
  // E a barra de abas sai. O contrato vigente mandava o contrário — que ela
  // continuasse visível durante o treino —, e a razão escrita dela era "sair
  // para conferir a comida e voltar é um caminho legítimo". A cláusula cai
  // porque a seta paga por ela: o caminho continua existindo, com um toque de
  // cada lado.
  const a = await app({ aba: 'agora' });
  a.v('ctx.abreModoDeSessao');
  await a.esperar();

  const seta = a.$('[data-a="sai-do-modo"]');
  assert.ok(seta, 'a seta de saída existe');
  assert.strictEqual(seta.getAttribute('aria-label'),
    'Voltar ao Agora, deixando a sessão aberta',
    'e o rótulo diz o que ela faz, não só que ela volta');
  assert.ok(!a.$('.ins-tabbar'), 'a barra de abas saiu');

  seta.click();
  await a.esperar();
  assert.strictEqual(a.vista().modoSessao, false, 'tocar na seta fecha o modo');
  assert.ok(a.$('.ins-tabbar'), 'e devolve a casca');
  a.fechar();
});

test('folha aberta de DENTRO de um destino é desenhada', async () => {
  // O conserto de um buraco antigo que a reestruturação trouxe para o alcance.
  // A casca devolvia `ctx.telaCheia()` seco, então uma folha aberta de dentro
  // de um destino simplesmente NÃO era desenhada: a pilha existia em
  // `view.pilha`, `camadasAbertas` já a contava por cima do destino, o Voltar já
  // a fechava — e a tela não mostrava nada.
  //
  // Estava fora de alcance porque a tela do treino era uma ABA. Com ela virando
  // modo, a foto do aparelho, o histórico do exercício, a nota e o seletor de
  // troca passaram todos a abrir no vazio: quatro capacidades mudas.
  const a = await app({ aba: 'agora' });
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.deepStrictEqual(camadasAbertas(a.vista()), ['modoSessao'], 'pré-condição: no modo');

  a.v('ctx.abreFolha', { k: 'dia' });
  await a.esperar(60);

  assert.deepStrictEqual(camadasAbertas(a.vista()), ['modoSessao', 'folha:0'],
    'a pilha diz que há folha por cima do modo');
  assert.ok(a.$('.ins-folha'), 'e a TELA concorda: a folha está desenhada');
  assert.ok(a.$('.ins-veu'), 'com o véu, que é o que diz que o resto não responde');

  // E a seta do modo não pode ficar tocável por cima do véu: ela fecharia o
  // modo por baixo de uma folha aberta. Quem garante isso é o NÍVEL da folha,
  // escrito inline por `Folha` — e ele tem de ficar acima dos três que a casca
  // tem no rodapé e no topo: a barra de abas (40), o cronômetro (35) e a barra
  // da saída do modo (30).
  const seta = a.$('[data-a="sai-do-modo"]');
  const folha = a.$('.ins-folha-w');
  assert.ok(seta, 'a seta continua no DOM, atrás');
  assert.ok(Number(folha.style.zIndex) > 40,
    'a folha pinta acima de tudo o que a casca tem: z-index ' + folha.style.zIndex);

  await voltar(a);
  assert.deepStrictEqual(camadasAbertas(a.vista()), ['modoSessao'],
    'o Voltar fecha a folha e deixa o modo de pé');
  a.fechar();
});

test('os Ajustes são destino: abrem do canto do Agora e fecham pelo Voltar', async () => {
  // Ajustes não é lugar — é um botão no canto do Agora (§1.6). Entrou como
  // CAMADA, e é isso que faz o Voltar do sistema e o Esc fecharem por ele em
  // vez de saírem do app: conta, sincronia e backup não respondem nenhuma das
  // cinco perguntas, mas também não são um beco sem saída.
  const a = await app({ aba: 'agora' });
  const botao = a.$('[data-a="ajustes"]');
  assert.ok(botao, 'o botão está no canto do Agora');
  assert.ok(botao.getAttribute('aria-label'),
    'com nome acessível: um ⚙ sozinho não é nome');

  botao.click();
  await a.esperar();
  assert.deepStrictEqual(camadasAbertas(a.vista()), ['ajustes'], 'abriu como camada');
  assert.ok(a.$('.gu-apagar'), 'e a máquina do app está lá dentro');
  assert.ok(!a.$('.ins-tabbar'), 'sem barra de abas: é destino, não lugar');

  await voltar(a);
  assert.deepStrictEqual(camadasAbertas(a.vista()), [], 'o Voltar fechou');
  assert.strictEqual(a.vista().aba, 'agora', 'e devolveu o lugar de onde se entrou');
  assert.ok(a.$('.ins-tabbar'), 'com a casca de volta');
  a.fechar();
});

// ---------- peça 5 do motion: desenha, depois rola; e o foco devolvido ----------

test('sair do modo e dos Ajustes rola DEPOIS de desenhar, e entrar num destino também', async () => {
  // `fechaModoDeSessao` e `fechaAjustes` rolavam ANTES do `render()`: o
  // `scrollTo` corria com o destino ainda no DOM, o navegador cortava na altura
  // máxima DELE, e o Corpo que entrou a 1982 px voltava a 1091 (docs/motion/02
  // §0; 07 §1.3, princípio 9). Agora todo fecho desenha e depois rola, e a
  // entrada pede o topo para o desenho que mostra o destino — com a transição
  // de vista, dentro dele (a metade de motor é `troca.test.js`). Aqui, no
  // caminho sem transição, cobra-se a ORDEM: em cada pedido de rolagem, o que
  // está no DOM.
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  let y = 0;
  Object.defineProperty(a.window, 'scrollY', { get: () => y, configurable: true });
  const pedidos = [];
  a.window.scrollTo = function (x, top) {
    const alvo = x && typeof x === 'object' ? x.top : top;
    pedidos.push({ alvo, modo: !!a.$('.ins-modo'), tc: !!a.$('.tc') });
    y = alvo || 0;
  };
  for (const [abre, fecha, sel] of [['ctx.abreModoDeSessao', 'ctx.fechaModoDeSessao', 'modo'], ['ctx.abreAjustes', 'ctx.fechaAjustes', 'tc']]) {
    if (sel === 'tc') { a.v('ctx.vaiPara', 'agora'); await a.esperar(); }
    y = 1500; pedidos.length = 0;
    a.v(abre);
    await a.esperar();
    const entrada = pedidos.pop();
    assert.ok(entrada && entrada.alvo === 0 && entrada[sel], abre + ': o topo é pedido com o destino já desenhado: ' + JSON.stringify(entrada));
    pedidos.length = 0;
    a.v(fecha);
    await a.esperar();
    assert.deepStrictEqual(pedidos, [{ alvo: 1500, modo: false, tc: false }],
      fecha + ': a posição volta com o destino já fora do DOM — senão ela corta na altura dele');
  }
  a.fechar();
});

test('trocar de aba rola ao topo DEPOIS de desenhar a aba nova', async () => {
  // Toda aba abre no topo (peça 6 do motion, 02 T4). Com o carrossel, o
  // `render()` só pede a troca e o desenho fica pendente; o topo entra DENTRO
  // dele (`rola`). Rolar antes rolaria a página que ainda está na tela, e a foto
  // da aba que sai pularia para o topo antes de sumir (a metade de motor é
  // `aba.test.js`). Aqui, no caminho sem transição, cobra-se a ORDEM: em cada
  // pedido de rolagem, a aba que está desenhada.
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  let y = 0;
  Object.defineProperty(a.window, 'scrollY', { get: () => y, configurable: true });
  const pedidos = [];
  a.window.scrollTo = function (x, top) {
    const alvo = x && typeof x === 'object' ? x.top : top;
    const on = a.$('.ins-tab.on');
    pedidos.push({ alvo, acesa: on ? on.textContent : null });
    y = alvo || 0;
  };
  for (const [para, rotulo] of [['semana', 'Semana'], ['agora', 'Agora'], ['prescricao', 'Prescrição']]) {
    y = 1500; pedidos.length = 0;
    a.v('ctx.vaiPara', para);
    await a.esperar();
    assert.ok(pedidos.length >= 1, para + ': a aba nova abre no topo');
    assert.deepStrictEqual(pedidos[0], { alvo: 0, acesa: rotulo }, para + ': o topo é pedido com a aba nova já desenhada');
  }
  a.fechar();
});

test('o foco que um desenho tira da página vai ao título da tela: "Ir para Semana" e o treino aberto no Programa', async () => {
  // Da conferência da peça 5 (docs/motion/07 §11.2 e §11.3), consertado na 6.
  // Sem transição de vista — o jsdom, e "Reduzir movimento" no aparelho —,
  // "Ir para Semana" são DOIS desenhos: o primeiro fecha a Evolução e devolve o
  // foco ao controle do Corpo; o segundo troca de aba e tira esse controle da
  // página, e o foco caía no `body`. E abrir um treino da lista do Programa troca
  // o conteúdo dentro da mesma tela cheia: o botão tocado sai, e o foco caía no
  // `body` (igual ao antes). Agora vai ao título da tela que está desenhada.
  const DIA = 86400000;
  const a = await app({ aba: 'corpo', estado: { logs: {}, done: [], body: { peso: [{ t: Date.now() - DIA, v: 73 }], cintura: [] } } });
  await a.pronto();
  const abre = a.$('[data-a="abre-evolucao"]');
  abre.focus(); abre.click();
  await a.esperar();
  const ir = a.$('[data-a="evolucao-semana"]');
  assert.ok(ir, 'a Evolução abriu, com o "Ir para Semana"');
  ir.focus(); ir.click();
  await a.esperar();
  assert.strictEqual(a.E('view.aba'), 'semana');
  assert.notStrictEqual(a.doc.activeElement, a.doc.body, '"Ir para Semana": o foco não cai no body');
  assert.ok(a.doc.activeElement && a.doc.activeElement.matches('main h1') && a.doc.activeElement.textContent === 'Semana',
    '"Ir para Semana": o foco vai ao título "Semana", como com a transição: ' + (a.doc.activeElement && a.doc.activeElement.outerHTML.slice(0, 80)));

  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar();
  a.v('ctx.abrePrograma');
  await a.esperar();
  const treino = a.$('.progd-b');
  assert.ok(treino, 'a lista do Programa tem treinos');
  treino.focus(); treino.click();
  await a.esperar();
  assert.ok(!a.$('.progd-b') || !a.$('.progd-b').isConnected || a.doc.activeElement !== a.doc.body, 'o treino abriu');
  assert.notStrictEqual(a.doc.activeElement, a.doc.body, 'o treino aberto no Programa: o foco não cai no body');
  assert.strictEqual(a.doc.activeElement, a.$('.tc h1'), 'o treino aberto no Programa: o foco vai ao título da tela cheia');
  a.fechar();
});

test('ao fechar um destino, o foco volta ao controle que o abriu — e não ao body', async () => {
  // O destino SUBSTITUI a casca: ao fechar, o ⚙ que abriu os Ajustes é
  // desenhado de novo, nó novo, e o foco caía no `body` (docs/motion/05 §3.1).
  // Agora ele volta ao controle redesenhado (achado pela chave dele), ou, se ele
  // não existe mais, ao título da tela de volta.
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.$('[data-a="ajustes"]').click();
  await a.esperar();
  assert.strictEqual(a.doc.activeElement, a.$('.tc h1'), 'ao entrar, o foco está no título dos Ajustes');
  a.$('.tc-back').click();
  await a.esperar();
  assert.ok(a.$('[data-a="ajustes"]') && a.doc.activeElement === a.$('[data-a="ajustes"]'),
    'ao sair, o foco volta ao ⚙ redesenhado: ' + (a.doc.activeElement && a.doc.activeElement.outerHTML.slice(0, 80)));

  // o modo: ganha o foco no título ao entrar, e devolve ao sair. Aberto por
  // programa, sem controle nenhum com o foco, a volta é o título da aba.
  a.doc.activeElement.blur();
  await a.esperar(1100);
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.doc.activeElement, a.$('.ins-modo main h1'), 'o modo entra com o foco no título do treino');
  a.$('.ins-modo-sair').click();
  await a.esperar();
  assert.notStrictEqual(a.doc.activeElement, a.doc.body, 'ao sair do modo, o foco não cai no body');
  assert.strictEqual(a.doc.activeElement, a.$('h1.ag-cab-d'),
    'aberto por programa (sem controle), o foco volta ao título da aba');
  a.fechar();
});
