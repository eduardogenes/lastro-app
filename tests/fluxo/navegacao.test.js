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

