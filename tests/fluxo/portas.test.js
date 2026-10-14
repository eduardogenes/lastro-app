// AS PORTAS QUE NENHUM CASO APERTAVA.
//
// Uma rodada instrumentada (13/10) registrou cada chave de `CTX` que a suíte
// aciona: 189 de 205. As 16 que sobraram são apelidos finos de verbos que já
// têm caso pelo NOME — `a.v('iniciarSessao')` —, e por isso a lógica estava
// coberta. O que não estava era a PORTA: o botão da tela que chama o apelido.
// Um botão desligado na reescrita de uma tela passaria verde, porque o caso
// entra pelo verbo e não pelo dedo. Estes casos apertam o botão.
//
// Fora daqui, com razão: `tiraFoto` e `tiraFotoDoCorpo` (o jsdom não deixa pôr
// arquivo num `<input type=file>`; os verbos têm caso por valor) e
// `abreHistorico`, que nenhuma tela usa — apelido morto, e tirá-lo é decisão
// escrita, não limpeza.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('iniciar, pausar, retomar e encerrar são botões que fazem o que dizem', async () => {
  const a = await app();
  assert.ok(a.vista().modoSessao, 'pré-condição: dentro do modo da sessão');
  assert.strictEqual(a.S().sessao, null, 'pré-condição: nada aberto');

  a.clicar('.day-ini');
  await a.esperar();
  assert.ok(a.S().sessao, '"iniciar treino" abre a sessão');

  a.clicar('.ctrl .ctrl-b:not(.fim)');
  await a.esperar();
  assert.ok(a.S().sessao.pausadoEm, '"pausar" pausa');

  a.clicar('.ctrl .ctrl-b.ini');
  await a.esperar();
  assert.ok(!a.S().sessao.pausadoEm, '"retomar" retoma');

  a.preencher(0, 0, 40, 10);
  await a.esperar();
  a.clicar('.ctrl .ctrl-b.fim');
  await a.esperar(60);
  assert.strictEqual(a.S().sessao, null, '"encerrar" encerra');
  assert.strictEqual(a.S().done.length, 1, 'e a sessão ficou registrada');
  a.fechar();
});

test('o "Encerrar o treino" do menu ··· encerra', async () => {
  const a = await app();
  a.clicar('.day-ini');
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  a.clicar('[data-a="menu-sessao"]');
  await a.esperar(60);
  a.clicar('[data-a="encerrar"]');
  await a.esperar(60);
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.$('.ins-folha'), null, 'e o menu fechou');
  a.fechar();
});

test('"editar treino de hoje" entra na edição', async () => {
  const a = await app();
  const b = a.$$('.tr-links button').filter(function (x) { return /Editar treino de hoje/.test(x.textContent); })[0];
  assert.ok(b, 'a porta está na tela');
  a.clicar(b);
  await a.esperar();
  assert.strictEqual(a.vista().editProg, true);
  a.fechar();
});

test('os botões do mês andam o calendário, e o de frente não passa de hoje', async () => {
  const a = await app({ aba: 'dias' });
  await a.esperar();
  const titulo = () => a.texto('.mes-nav .mes-t');
  const agora = titulo();
  const [antes, depois] = a.$$('.mes-nav .mes-b');
  assert.ok(depois.disabled, 'no mês corrente, não há mês à frente');

  a.clicar(antes);
  await a.esperar();
  assert.notStrictEqual(titulo(), agora, 'voltou um mês');
  assert.strictEqual(a.vista().mes, -1);

  a.clicar(a.$$('.mes-nav .mes-b')[1]);
  await a.esperar();
  assert.strictEqual(titulo(), agora, 'e voltou ao corrente');
  a.fechar();
});

test('o registro rápido do cardio grava pelos chips e pelo botão', async () => {
  const a = await app({ aba: 'agora', estado: { logs: {}, done: [], cardio: [] } });
  a.v('abrirCardioRapido');
  await a.esperar();
  const remo = a.$$('.cardq .chip').filter(function (c) { return /remo/i.test(c.textContent); })[0];
  assert.ok(remo, 'pré-condição: o chip do remo está lá');
  a.clicar(remo);
  await a.esperar();
  a.clicar('.cardq-b');
  await a.esperar(60);
  assert.strictEqual(a.S().cardio.length, 1, 'o botão gravou a sessão de cardio');
  assert.strictEqual(a.S().cardio[0].m, 'remo', 'com o que o chip escolheu');
  a.fechar();
});

test('o nome do treino avulso entra pelo campo, e grava ao sair dele', async () => {
  const a = await app();
  a.v('abrirAdicionar', Date.now() - DIA);
  a.clicar('[data-a="lanca-livre"]');
  await a.esperar();
  const campo = a.$('.add-nome');
  assert.ok(campo, 'pré-condição: o campo do nome está na tela');
  campo.value = 'pelada com os amigos';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  assert.strictEqual(a.S().done[0].nome, 'pelada com os amigos', 'o nome vai para o registro gravado');
  campo.dispatchEvent(new a.window.Event('change', { bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.gravado().done[0].nome, 'pelada com os amigos', 'e está guardado');

  // sem o `change` (o app fechou a folha antes de o campo perder o foco), sair
  // da folha também guarda
  campo.value = 'futevôlei';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  a.v('ctx.fechaAdicionar');
  await a.esperar();
  assert.strictEqual(a.gravado().done[0].nome, 'futevôlei', 'sair da folha guarda o nome');
  a.fechar();
});

test('"Fechar este aviso" fecha o painel e deixa a marca de não guardado', async () => {
  // A terceira saída da família "falhou" (§3.2 da frente 3): sair sem fazer
  // nada. O Esc já tinha caso; o botão, não.
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  assert.ok(a.$('.falhou-w'), 'pré-condição: o painel abriu');

  a.clicar('[data-a="falhou-fecha"]');
  await a.esperar();
  assert.strictEqual(a.$('.falhou-w'), null, 'o painel fechou');
  assert.ok(a.$('.ng-faixa'), 'e a marca ficou: dispensar o aviso não apaga o estado do dado');
  a.fechar();
});

test('"apagar a foto" passa pelo pare e apaga', async () => {
  const id = 'chest-press-inclinado-convergente';
  const a = await app({ estado: { logs: {}, done: [], fotos: { [id]: { v: 1, ext: 'jpg' } } } });
  a.v('abreFoto', 0);
  await a.esperar();
  const b = a.$('.foto-b2');
  assert.ok(b, 'pré-condição: com foto, a folha oferece apagar');
  a.clicar(b);
  await a.esperar(60);
  assert.strictEqual((a.S().fotos || {})[id], undefined, 'a foto saiu do estado');
  a.fechar();
});

test('tocar num alimento da lista abre o editor dele', async () => {
  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  await a.modo('alimentos');
  const linha = a.$('.cm-cat .ins-linha');
  assert.ok(linha, 'pré-condição: a lista de alimentos está na tela');
  a.clicar(linha);
  await a.esperar();
  const topo = (a.vista().pilha || []).slice(-1)[0];
  assert.ok(topo && topo.k === 'editaAlimento' && topo.id, 'abriu o editor daquele alimento: ' + JSON.stringify(topo));
  a.fechar();
});

test('o "pronto" do teclado do Corpo fecha o teclado', async () => {
  const a = await app({ aba: 'corpo' });
  await a.esperar();
  a.clicar('[data-a="tcl-abre-peso"]');
  await a.esperar();
  assert.ok(a.vista().teclado, 'pré-condição: o teclado abriu');
  a.clicar('[data-a="tcl-pronto"]');
  await a.esperar();
  assert.ok(!a.vista().teclado, 'e o "pronto" o fechou');
  a.fechar();
});
