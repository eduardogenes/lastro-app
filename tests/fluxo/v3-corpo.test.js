// O Corpo no visual novo (direção 3, Fase 2): pesar pela régua, ligar e
// desligar medidas, e o "medir agora" de uma medida por tela, com a segunda
// leitura sempre pedida e a terceira quando as duas diferem.
// Especificação: docs/redesign-3/03-lotes.md, Fase 2.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function corpo(antes) {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  if (antes) antes(a);
  a.v('render');
  await a.esperar();
  return a;
}
const hojeNoPeso = a => a.S().body.peso.filter(x => new Date(x.t).toDateString() === new Date(Date.now()).toDateString());
// a régua do bloco não tem os passos (como a referência): a seta do teclado anda um passo
const mais = async (a, n = 1) => {
  for (let i = 0; i < n; i++) {
    a.E(`document.querySelector('.v3-acao .v3-regua-r, .v3-bloco .v3-regua-r').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
    await a.esperar(5);
  }
};
const leituras = (a, k) => a.S().body[k].slice(-1)[0];

test('pesar pela régua: guarda a de hoje, e mexer de novo corrige a mesma', async () => {
  const a = await corpo(x => x.E(`S.body.peso = [{ t: Date.now() - 3 * 86400000, v: 77.6, m: 1 }]`));
  assert.ok(a.$('.v3-bloco'), 'o Corpo novo');
  assert.strictEqual(a.texto('.v3-gigante'), '77,6kg');
  await mais(a, 2);
  await a.esperar();
  assert.strictEqual(a.texto('.v3-gigante'), '77,8kg');
  a.clicar('[data-a="corpo-pesa"]');
  await a.esperar(60);
  assert.deepStrictEqual(hojeNoPeso(a).map(x => x.v), [77.8]);
  assert.ok(/Guardado hoje/.test(a.texto('[data-a="corpo-pesa"]')));

  await mais(a);
  await a.esperar();
  assert.ok(/Corrigir para 77,9/.test(a.texto('[data-a="corpo-pesa"]')));
  a.clicar('[data-a="corpo-pesa"]');
  await a.esperar(60);
  assert.deepStrictEqual(hojeNoPeso(a).map(x => x.v), [77.9], 'uma pesagem por dia: corrigiu, não somou');
  a.fechar();
});

test('mais medidas: ligar a coxa e as dobras as põe na lista e na fila de medir', async () => {
  const a = await corpo();
  const antes = a.$$('[data-a^="corpo-medida-"]').length;
  a.clicar('[data-a="corpo-ligar"]');
  await a.esperar(40);
  a.clicar('[data-a="ligar-coxa"]');
  a.clicar('[data-a="ligar-dobras"]');
  await a.esperar(40);
  a.v('ctx.fechaFolha');
  await a.esperar();
  assert.ok(a.$('[data-a="corpo-medida-coxa"]'), 'a coxa entrou');
  assert.ok(a.$('[data-a="corpo-medida-dobraAbdominal"]'), 'e as dobras');
  assert.strictEqual(a.$$('[data-a^="corpo-medida-"]').length, antes + 4);
  a.clicar('[data-a="corpo-medir"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').total, antes + 4, 'a fila de medir é a das ligadas');
  a.fechar();
});

test('medir agora: a segunda sempre pedida, a terceira quando diferem, e "guardar só esta" grava uma leitura', async () => {
  const a = await corpo(x => x.E(`S.body.cintura = [{ t: Date.now() - 20 * 86400000, v: 85, m: 1 }]; S.body.braco = [];`));
  a.clicar('[data-a="corpo-medir"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').m.k, 'braco', 'a ordem de medir do protocolo');
  assert.ok(a.$('.v3-acao'), 'tela de ação');
  assert.ok(/primeira vez: comece perto de 35/.test(a.texto('.v3-medir-f')), a.texto('.v3-medir-f'));

  a.clicar('[data-a="medir-guarda"]');                      // 1ª: 35,0
  await a.esperar();
  assert.ok(/Guardar a 2ª/.test(a.texto('[data-a="medir-guarda"]')), 'a segunda é pedida');
  assert.ok(a.$('[data-a="medir-so-esta"]'), 'com a saída de guardar só esta');
  await mais(a, 10);                                               // 36,0: difere 1,0
  await a.esperar();
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').passo, 3, 'diferem mais de 0,5: a terceira');
  assert.ok(/diferem 1/.test(a.texto('.v3-medir-f')), 'frase: ' + a.texto('.v3-medir-f'));
  a.clicar('[data-a="medir-guarda"]');                      // 3ª: 36,0 — fecha a medida, grava e já segue
  await a.esperar(450);                                     // o "Guardar" ignora o toque logo depois de seguir
  assert.strictEqual(a.S().body.braco.length, 1, 'o braço foi gravado quando fechou, antes do fim da fila');

  assert.strictEqual(a.vJ('ctx.medirV3').m.k, 'cintura', 'a próxima medida');
  assert.ok(/da última vez: 85/.test(a.texto('.v3-medir-f')), 'parte da última: ' + a.texto('.v3-medir-f'));
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  a.clicar('[data-a="medir-so-esta"]');
  await a.esperar(80);

  assert.strictEqual(leituras(a, 'braco').n, 3, 'braço com três leituras');
  assert.strictEqual(leituras(a, 'cintura').n, 1, 'cintura com uma só');
  assert.ok(a.texto('.v3-medido').includes('uma leitura só'), 'e o resumo diz');
  a.clicar('[data-a="medido-fecha"]');
  await a.esperar();
  assert.strictEqual(a.vista().medidas, null);
  a.fechar();
});

test('dobra: três leituras sempre, sem "guardar só esta", e grava a do meio', async () => {
  const a = await corpo(x => x.E(`S.modulos = { dobras: 1, fita: { cintura: 0, braco: 0 } }`));
  a.v('ctx.abreMedirAgora');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').m.dobra, true);
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  assert.ok(!a.$('[data-a="medir-so-esta"]'), 'na dobra não há guardar só esta');
  await mais(a, 2);
  await a.esperar();
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').passo, 3, 'a terceira, mesmo batendo');
  await mais(a, 4);
  await a.esperar();
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  // a terceira fecha a dobra e a tela já segue para a próxima; a que fica é a do meio
  assert.strictEqual(a.vJ('ctx.medirV3').i, 1, 'seguiu para a próxima dobra');
  assert.strictEqual(a.E('doMeio(view.medidas.leituras[view.medidas.v3.fila[0]].map(Number))'), 13, 'a do meio de 12, 13 e 15');
  const k0 = a.E('view.medidas.v3.fila[0]');
  assert.strictEqual(a.S().body[k0].slice(-1)[0].v, 13, 'e é a do meio que foi gravada, quando a dobra fechou');
  a.fechar();
});

test('o fim das fotos leva ao medir agora do visual novo', async () => {
  const a = await corpo();
  a.v('ctx.abreProtocolo');
  a.v('ctx.medirDepoisDasFotos');
  await a.esperar();
  assert.ok(a.vJ('ctx.medirV3'), 'o mesmo fluxo de uma por tela');
  assert.ok(a.$('.v3-acao'));
  a.fechar();
});

test('recolher "Medir agora" no meio: o que fechou já está gravado, e o incompleto não vira registro', async () => {
  const manha = new Date(); manha.setHours(7, 0, 0, 0);
  const a = await corpo(x => x.E(`S.body.cintura = [{ t: ${manha.getTime()}, v: 85, m: 1, n: 2 }]; S.body.braco = [];`));
  a.clicar('[data-a="corpo-medir"]');
  await a.esperar();
  a.clicar('[data-a="medir-guarda"]');                      // braço: 1ª
  await a.esperar();
  a.clicar('[data-a="medir-guarda"]');                      // braço: 2ª, bate: fecha, grava e segue
  await a.esperar(60);
  assert.strictEqual(a.S().body.braco.length, 1, 'o braço fechado já está gravado, antes de sair');
  assert.strictEqual(a.gravado().body.braco.length, 1, 'e no disco, não só na memória');
  assert.strictEqual(a.vJ('ctx.medirV3').m.k, 'cintura', 'na segunda medida');
  // um toque duplo logo depois de seguir não vira a 1ª leitura da cintura
  a.clicar('[data-a="medir-guarda"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.medirV3').leituras.length, 0, 'o segundo toque do toque duplo foi ignorado');
  await a.esperar(450);
  a.clicar('[data-a="medir-guarda"]');                      // cintura: só a 1ª, e sai
  await a.esperar();
  a.clicar('[data-a="medir-sair"]');
  await a.esperar(60);
  assert.strictEqual(a.vista().medidas, null, 'recolheu');
  assert.strictEqual(a.S().body.braco.length, 1, 'o braço continua');
  const cint = a.S().body.cintura;
  assert.strictEqual(cint.length, 1, 'a leitura solta da cintura não virou registro');
  assert.strictEqual(cint[0].t, manha.getTime(), 'a medida da manhã continua a mesma (não foi substituída)');
  assert.strictEqual(cint[0].n, 2, 'com as duas leituras dela');
  assert.ok(/Cintura ficou com uma leitura e não foi guardada/.test(a.toast()), 'e o aviso diz o que ficou de fora: ' + a.toast());
  a.fechar();
});
