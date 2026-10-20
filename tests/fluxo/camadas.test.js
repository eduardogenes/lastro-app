// AS CAMADAS QUE ISOLAM — a folha, o painel de pare e o aviso "Não guardei" —,
// na árvore (jsdom). Peça 4 do motion.
//
// Três consertos que o parecer pôs nesta peça como precondição, porque a folha
// e o painel passam a subir, e o que sobe tem de ser a única coisa alcançável
// (docs/motion/05 §3.1, §3.4; 08 §4, peça 4):
//
//  - com o descanso contando, o Tab saía da folha para o −15: o cronômetro mora
//    FORA do `#app`, e a folha só marcava os irmãos dela. Agora o cronômetro
//    fica inerte junto;
//  - o painel de pare e o "Não guardei" não isolavam nada (o segundo Shift+Tab
//    caía na aba "Prescrição", o primeiro na barra de abas). Agora isolam como
//    a folha, pelo mesmo mecanismo, e o isolamento é DERIVADO da camada de cima
//    — a ordem de abrir e fechar não importa;
//  - e o defeito 5 (dono, 16/10, pergunta 13): o "Não guardei" chega sozinho
//    ~0,8 s depois do toque, com os botões na zona do polegar, e o toque que
//    era para outra coisa caía nele.
//
// E a troca da folha do topo ("cadastrar"), que nasce no lugar: a camada não
// se move (02 T8). O movimento como o motor o roda — o quique, o véu, o dedo
// que segura, o Tab de verdade — é `sobe.test.js`.
import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './harness.js';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** A janela do "Não guardei", lida da constante declarada no fonte — não um número deste teste. */
const JANELA = (() => {
  const m = /export const JANELA_DO_AVISO_MS = (\d+);/.exec(
    fs.readFileSync(path.join(RAIZ, 'src/ui/instrumento/pare.jsx'), 'utf8'));
  assert.ok(m, 'a janela do aviso deixou de ser uma constante declarada em pare.jsx');
  return Number(m[1]);
})();

/** O que está inerte agora: os filhos do `#app` e o cronômetro, por nome. */
function inertes(a) {
  const nome = el => (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).join('.') : '') || el.tagName.toLowerCase();
  return a.$$('#app > [inert], body > [inert]').map(nome).sort();
}
const vivos = (a, sel) => a.$$(sel).filter(el => !el.closest('[inert]'));
const falha = `view.naoGuardado = { oQue: 'a série 1 do Supino', motivo: 'cota', valor: '40 kg × 8' }; view.falhou = true; render();`;

test('com o descanso contando, a folha isola também o cronômetro, e solta tudo ao fechar', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('startTimer', 120);
  await a.esperar();
  assert.ok(!a.$('#timer').hasAttribute('inert'), 'sem camada, o cronômetro é alcançável');

  a.v('ctx.abreSeletorDeDia');
  await a.esperar(60);
  const folha = a.$('.ins-folha');
  assert.ok(folha, 'a folha abriu');
  assert.ok(a.$('#timer').hasAttribute('inert'),
    'o cronômetro mora fora do #app e tem de ficar inerte com a folha (antes: o 11º Tab saía para o −15)');
  assert.ok(!folha.closest('[inert]'), 'e a folha não');
  assert.deepStrictEqual(vivos(a, '#timer button'), [], 'nenhum botão do cronômetro alcançável');
  assert.ok(!a.$('#toast').hasAttribute('inert') && !a.$('#serie-dita').hasAttribute('inert'),
    'as regiões vivas ficam na árvore: um anúncio com a folha aberta não se perde');

  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.deepStrictEqual(inertes(a), [], 'fechada, nada fica inerte — o cronômetro inclusive');
  a.fechar();
});

test('o painel de pare isola o fundo como a folha, leva o foco à saída e o devolve a quem o tinha', async () => {
  const a = await app({ aba: 'agora', painelManual: true });
  await a.pronto();
  a.v('startTimer', 120);
  const acionador = a.$('[data-a="tipo-do-dia"]');
  acionador.focus();

  a.E(`pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`);
  await a.esperar(60);
  const w = a.$('.pare-w');
  assert.ok(w, 'o painel abriu');
  assert.ok(!w.closest('[inert]'), 'o painel é alcançável');
  const fundo = a.$$('#app > *').filter(el => el !== w);
  assert.ok(fundo.length >= 3, 'há cabeçalho, main e barra de abas atrás: ' + fundo.length);
  assert.deepStrictEqual(fundo.filter(el => !el.hasAttribute('inert')).map(el => el.tagName), [],
    'tudo atrás do painel fica inerte (antes: o segundo Shift+Tab caía na aba "Prescrição")');
  assert.ok(a.$('#timer').hasAttribute('inert'), 'e o cronômetro também');
  assert.strictEqual(a.doc.activeElement, a.$('[data-a="pare-nao"]'), 'o foco nasce na saída, não no verbo');

  a.clicar('[data-a="pare-nao"]');
  await a.esperar();
  assert.ok(!a.$('.pare-w'), 'o painel fechou');
  assert.deepStrictEqual(inertes(a), [], 'e soltou o fundo no mesmo desenho');
  assert.strictEqual(a.doc.activeElement, acionador, 'o foco voltou a quem o tinha (antes: o body)');
  a.fechar();
});

test('o "Não guardei" isola o fundo; chegando por baixo de um pare aberto, nasce inerte e não rouba o foco', async () => {
  const a = await app({ aba: 'agora', painelManual: true });
  await a.pronto();
  a.v('startTimer', 120);

  // sozinho: isola como a folha
  a.E(falha);
  await a.esperar(60);
  let aviso = a.$('.falhou-w');
  assert.ok(aviso && !aviso.closest('[inert]'), 'o aviso abriu e é alcançável');
  assert.deepStrictEqual(a.$$('#app > *').filter(el => el !== aviso && !el.hasAttribute('inert')).map(el => el.tagName), [],
    'tudo atrás dele fica inerte (antes: o primeiro Shift+Tab já caía na barra de abas)');
  assert.ok(a.$('#timer').hasAttribute('inert'), 'o cronômetro também');
  assert.strictEqual(a.doc.activeElement, a.$('[data-a="falhou-tenta"]'), 'o foco em "Tentar de novo"');
  a.E(`view.falhou = false; render();`);
  await a.esperar();
  assert.deepStrictEqual(inertes(a), [], 'fechado, solta tudo');

  // por baixo de um pare: o pare (z 90) fica por cima do aviso (z 88)
  a.E(`pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`);
  await a.esperar(60);
  const saida = a.$('[data-a="pare-nao"]');
  assert.strictEqual(a.doc.activeElement, saida);
  a.E(falha);
  await a.esperar(60);
  aviso = a.$('.falhou-w');
  assert.ok(aviso.hasAttribute('inert'), 'o aviso que chega por baixo do pare nasce inerte');
  assert.ok(!a.$('.pare-w:not(.falhou-w)').closest('[inert]'), 'e o pare, que está por cima, continua alcançável');
  assert.strictEqual(a.doc.activeElement, saida, 'e o aviso não rouba o foco do pare');

  // o pare fecha primeiro: o aviso vira a camada de cima, e o resto continua preso
  a.clicar(saida);
  await a.esperar();
  aviso = a.$('.falhou-w');
  assert.ok(aviso && !aviso.closest('[inert]'), 'o aviso passou a ser a camada de cima');
  assert.deepStrictEqual(a.$$('#app > *').filter(el => el !== aviso && !el.hasAttribute('inert')).map(el => el.tagName), [],
    'e o fundo continua isolado: quem fechou foi o pare, não o aviso');
  assert.ok(a.$('#timer').hasAttribute('inert'));
  a.E(`view.falhou = false; render();`);
  await a.esperar();
  assert.deepStrictEqual(inertes(a), []);
  a.fechar();
});

test('uma folha aberta por baixo do pare fica presa sob ele, e o pare que fecha antes não solta o fundo dela', async () => {
  const a = await app({ aba: 'agora', painelManual: true });
  await a.pronto();
  a.E(`pare({ texto: 'Apagar o peso de 28/09 tira 1 medida.', sim: 'Apagar o peso de 28/09' })`);
  await a.esperar(60);
  a.v('ctx.abreSeletorDeDia');
  await a.esperar(60);
  const fw = a.$('.ins-folha-w');
  assert.ok(fw.hasAttribute('inert'), 'a folha que nasce por baixo do pare (z 50 contra 90) nasce inerte');
  assert.ok(!a.$('.pare-w').closest('[inert]'));

  a.clicar('[data-a="pare-nao"]');
  await a.esperar();
  assert.ok(!a.$('.ins-folha-w').closest('[inert]'), 'fechado o pare, a folha é a de cima');
  assert.deepStrictEqual(a.$$('#app > *').filter(el => el !== a.$('.ins-folha-w') && !el.hasAttribute('inert')).map(el => el.tagName), [],
    'e o fundo continua preso pela folha (com o isolamento acumulado de antes, o pare soltava o que ele mesmo tinha marcado)');

  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.deepStrictEqual(inertes(a), []);
  a.fechar();
});

test('a folha empilhada isola a de baixo, e ao fechar devolve o foco para dentro dela', async () => {
  const a = await app({ aba: 'prescricao' });
  a.v('ctx.abreFolha', { k: 'refeicao', id: 'almoco' });
  await a.esperar(60);
  const editar = a.$('.ins-folha-b[aria-label="editar"]');
  assert.ok(editar, 'a folha da refeição tem o ···');
  editar.focus();
  a.v('ctx.abreFolha', { k: 'editaRefeicao', id: 'almoco' });
  await a.esperar(60);
  const ws = a.$$('.ins-folha-w');
  assert.strictEqual(ws.length, 2);
  assert.ok(ws[0].hasAttribute('inert') && !ws[1].closest('[inert]'), 'a de baixo fica inerte; a de cima, não');
  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.ok(!a.$('.ins-folha-w').closest('[inert]'), 'a de baixo volta a ser a de cima');
  assert.strictEqual(a.doc.activeElement, editar, 'e o foco volta ao ··· que abriu a de cima');
  a.fechar();
});

test('a folha que toma o lugar da de cima ("cadastrar") nasce no lugar; a que empilha, sobe', async () => {
  const a = await app({ aba: 'prescricao' });
  a.v('ctx.abreFolha', { k: 'editaRefeicao', id: null });
  a.v('ctx.abreFolha', { k: 'seletor', ref: null, idx: 0 });
  await a.esperar(60);
  assert.deepStrictEqual(a.$$('.ins-folha-w').map(w => w.classList.contains('troca')), [false, false],
    'abrir é camada nova: as duas sobem');

  a.v('ctx.trocaFolha', { k: 'editaAlimento', id: null });
  await a.esperar(60);
  assert.deepStrictEqual(a.$$('.ins-folha-w').map(w => w.classList.contains('troca')), [false, true],
    'a do cadastro nasce no lugar da busca (a camada não se move, só o conteúdo troca — 02 T8)');
  assert.ok(!('troca' in a.vista().pilha[1]), 'e isso é estado de tela, fora da pilha que o Voltar lê');

  a.v('ctx.fechaFolha');
  a.v('ctx.abreFolha', { k: 'seletor', ref: null, idx: 0 });
  await a.esperar(60);
  assert.deepStrictEqual(a.$$('.ins-folha-w').map(w => w.classList.contains('troca')), [false, false],
    'a folha aberta de novo na mesma posição da pilha sobe: a marca morre com a folha que a tinha');
  a.fechar();
});

// ---------- o defeito 5: o toque que era para outra coisa ----------

/** Um navegador com Pointer Events: o jsdom não tem o construtor, e o app pergunta por ele. */
const comPonteiro = { antesDoApp: w => { w.PointerEvent = function PointerEvent() {}; } };
/** O dedo: desce (no aviso, se `desce`) e o clique sai com `detail` 1, como de um toque de verdade. */
function dedo(a, sel, desce = true) {
  const b = a.$(sel);
  if (desce) b.dispatchEvent(new a.window.Event('pointerdown', { bubbles: true }));
  b.dispatchEvent(new a.window.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
}

test('o "Não guardei" não aceita o toque que já vinha para outra coisa, e aceita o de quem o leu', async () => {
  assert.ok(JANELA >= 250 && JANELA <= 600, 'a janela é a de um toque já a caminho, não de leitura: ' + JANELA);
  const a = await app(Object.assign({ aba: 'agora' }, comPonteiro));
  await a.pronto();
  a.E(falha);
  await a.esperar(20);
  assert.ok(a.$('.falhou-w'), 'o aviso chegou');

  // logo que chega: o dedo que desce nele agora é de um gesto que já estava a caminho
  dedo(a, '[data-a="falhou-fecha"]');
  await a.esperar();
  assert.ok(a.$('.falhou-w'), 'o toque que desceu no aviso logo que ele chegou não o fecha (antes: fechava antes de lido)');
  dedo(a, '[data-a="falhou-copia"]');
  await a.esperar();
  assert.ok(!/Copiei o registro/.test(a.toast() || ''), 'nem copia o registro');

  await a.esperar(JANELA + 40);
  // o dedo que desceu ANTES de o aviso existir (em outra coisa) e só soltou aqui
  dedo(a, '[data-a="falhou-fecha"]', false);
  await a.esperar();
  assert.ok(a.$('.falhou-w'), 'o clique de um dedo que desceu antes de o aviso chegar também não o fecha');

  // quem leu e toca de propósito
  dedo(a, '[data-a="falhou-fecha"]');
  await a.esperar();
  assert.ok(!a.$('.falhou-w'), 'depois da janela, o toque de propósito fecha o aviso');
  assert.ok(a.$('.ng-faixa'), 'e a marca de "não guardado" fica, como sempre');
  a.fechar();
});

test('o teclado e um navegador sem Pointer Events não esperam a janela: o aviso nunca fica sem resposta', async () => {
  let a = await app(Object.assign({ aba: 'agora' }, comPonteiro));
  await a.pronto();
  a.E(falha);
  await a.esperar(20);
  // Enter ou espaço no botão focado: clique com `detail` 0, sem polegar a caminho
  a.$('[data-a="falhou-fecha"]').dispatchEvent(new a.window.MouseEvent('click', { bubbles: true, detail: 0 }));
  await a.esperar();
  assert.ok(!a.$('.falhou-w'), 'o clique de teclado age na hora');
  a.fechar();

  a = await app({ aba: 'agora' });
  await a.pronto();
  a.E(falha);
  await a.esperar(20);
  dedo(a, '[data-a="falhou-fecha"]');
  await a.esperar();
  assert.ok(!a.$('.falhou-w'), 'sem Pointer Events não há como saber onde o dedo desceu: age como antes');
  a.fechar();
});
