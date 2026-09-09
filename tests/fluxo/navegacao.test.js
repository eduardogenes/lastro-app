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
  const a = await app();
  await a.pronto();
  const antes = a.window.history.length;

  a.E("CTX.abreFolha({ k: 'dia' })");
  await a.esperar();

  assert.ok(a.$('.ins-folha'), 'a folha está na tela');
  assert.strictEqual(a.window.history.length, antes + 1, 'uma entrada por camada');
  assert.strictEqual(a.window.history.state.lastro, 1, 'a entrada carrega a profundidade');
  a.fechar();
});

test('o Voltar do sistema fecha a folha em vez de sair do app', async () => {
  const a = await app();
  await a.pronto();
  a.E("CTX.abreFolha({ k: 'dia' })");
  await a.esperar();
  assert.ok(a.$('.ins-folha'), 'a folha abriu');

  await voltar(a);

  assert.ok(!a.$('.ins-folha'), 'o Voltar fechou a folha');
  assert.ok(a.$('.ins-tabbar'), 'e o app continua de pé');
  a.fechar();
});

test('folhas empilhadas fecham uma por Voltar', async () => {
  const a = await app();
  await a.pronto();
  a.E("CTX.abreFolha({ k: 'editaRefeicao', id: null })");
  await a.esperar();
  a.E("CTX.abreFolha({ k: 'seletor', ref: null, idx: 0 })");
  await a.esperar();
  assert.strictEqual(a.J('(view.pilha || []).length'), 2);

  await voltar(a);
  assert.strictEqual(a.J('(view.pilha || []).length'), 1, 'fechou só a de cima');

  await voltar(a);
  assert.strictEqual(a.J('(view.pilha || []).length'), 0, 'e depois a de baixo');
  assert.ok(a.$('.ins-tabbar'), 'o app continua de pé');
  a.fechar();
});

test('o Voltar sai de um destino de tela cheia', async () => {
  const a = await app();
  await a.pronto();
  a.E('abrirPrograma(null)');
  await a.esperar();
  assert.ok(a.J('!!view.prog'), 'o programa abriu');

  await voltar(a);

  assert.ok(!a.J('!!view.prog'), 'o Voltar fechou o programa');
  assert.ok(a.$('.ins-tabbar'), 'e devolveu a shell com a tab bar');
  a.fechar();
});

test('fechar pelo botão do app não deixa entrada órfã no histórico', async () => {
  // Se a entrada continuasse lá, o Voltar seguinte não faria nada visível — o
  // usuário apertaria duas vezes para sair de uma tela que já tinha fechado.
  const a = await app();
  await a.pronto();
  a.E("CTX.abreFolha({ k: 'dia' })");
  await a.esperar();
  a.E('CTX.fechaFolha()');
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
  const a = await app();
  await a.pronto();
  a.aba('guia');
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
  a.E('abrirPrograma(null)');
  await a.esperar();
  assert.strictEqual(pedidos[pedidos.length - 1], 0, 'entrar no destino leva ao topo');

  a.E('fecharPrograma()');
  await a.esperar();
  assert.strictEqual(pedidos[pedidos.length - 1], 1500, 'sair devolve onde se estava');
  a.fechar();
});

test('a folha entra em foco, isola o fundo e devolve o foco ao sair', async () => {
  // `aria-modal="true"` já estava declarado, e sozinho ele não faz nada: quem
  // impede o foco de vazar é o `inert`. Medido antes da correção: 39 elementos
  // continuavam tabuláveis atrás da folha e o foco ficava no botão que a abriu.
  const a = await app();
  await a.pronto();
  a.aba('hoje');
  await a.esperar();

  const acionador = a.$('.ins-estado');
  assert.ok(acionador, 'o botão de estado do cabeçalho abre o seletor de dia');
  acionador.focus();

  a.E("CTX.abreFolha({ k: 'dia' })");
  await a.esperar();

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

  a.E('CTX.fechaFolha()');
  await a.esperar();

  assert.ok(!a.$('.ins-folha'), 'a folha fechou');
  assert.strictEqual(a.$$('#app > [inert]').length, 0, 'o fundo voltou a ser alcançável');
  assert.strictEqual(a.doc.activeElement, a.$('.ins-estado'),
    'e o foco voltou para o botão que abriu');
  a.fechar();
});
