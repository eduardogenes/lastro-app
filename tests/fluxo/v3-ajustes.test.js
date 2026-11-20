// Ajustes, estados e primeira vez no visual novo (direção 3, Fase 4).

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

async function comVisual(estado) {
  const a = await app({ aba: 'agora', agora: agoraEstavel(15), estado: estado || { logs: {}, done: [] } });
  await a.pronto();
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  return a;
}

test('ajustes: a conta, o que aparece e o interruptor do visual', async () => {
  const a = await comVisual();
  a.v('ctx.abreAjustes');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Ajustes');
  assert.ok(a.$('#nuvem-email') && a.$('#nuvem-senha'), 'entrar na conta');
  a.clicar('[data-a="ajustes-entrar"]');
  await a.esperar();
  assert.ok(/e-mail e senha/.test(a.texto('.v3-erro')), 'sem preencher, diz o que falta');
  a.clicar('[data-a="ajustes-cardio"]');
  await a.esperar();
  assert.strictEqual(a.E(`ligado(S.modulos, 'cardio')`), false, 'desligou o cardio');
  assert.strictEqual(a.$('[data-a="visual-novo"]'), null, 'não há mais interruptor de visual: o novo é o único');
  a.fechar();
});

test('ajustes se alcançam pelo app: pela folha "O que aparece" e pelo fim do Plano', async () => {
  const a = await comVisual();
  await a.esperar();
  // o ícone de ajuste do bloco do Hoje abre a folha; a última linha dela leva aos Ajustes
  a.clicar('[data-a="hoje-aparece"]');
  await a.esperar();
  assert.ok(a.$('[data-a="aparece-ajustes"]'), 'a porta dos Ajustes na folha');
  a.clicar('[data-a="aparece-ajustes"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Ajustes', 'pela folha');
  assert.ok(!a.$('.v3-folha'), 'a folha fechou ao abrir os Ajustes');
  a.v('ctx.fechaAjustes');
  await a.esperar();
  // o fim do Plano
  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar();
  a.clicar('[data-a="plano-ajustes"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Ajustes', 'pelo Plano');
  a.v('ctx.fechaAjustes');
  await a.esperar();
  assert.ok(a.$('[data-a="plano-ajustes"]'), 'o Voltar devolve o Plano');
  a.fechar();
});

test('confirmação: a folha nova, com "Deixar como está" como principal e com o foco nele', async () => {
  const a = await app({ aba: 'agora', agora: agoraEstavel(15), estado: { logs: {}, done: [] }, painelManual: true });
  await a.pronto();
  a.v('ctx.fechaModoDeSessao');
  await a.esperar();
  a.E(`window.__r = 'nada'; pare({ texto: 'Apagar isto tira tudo.', sim: 'Apagar' }).then(r => { window.__r = r; });`);
  await a.esperar(80);
  assert.strictEqual(a.texto('.v3-pare-w .v3-pare-t'), 'Apagar isto tira tudo.');
  assert.ok(!a.$('.pare-w'), 'e não o painel antigo');
  const nao = a.$('[data-a="pare-nao"]');
  assert.ok(nao.classList.contains('p'), 'o caminho seguro é o principal');
  assert.strictEqual(a.window.document.activeElement, nao, 'o foco começa nele');
  a.clicar('[data-a="pare-sim"]');
  await a.esperar();
  assert.strictEqual(a.E('window.__r'), true);
  assert.ok(!a.$('.v3-pare-w'), 'e a folha fecha');

  a.E(`view.naoGuardado = { motivo: 'cota', oQue: 'a série 2', valor: '80 kg', salvo: '' }; view.falhou = true; render();`);
  await a.esperar(80);
  assert.ok(/Não guardei a série 2/.test(a.texto('#falhou-t')));
  assert.ok(/está cheio.*80 kg/.test(a.texto('.v3-pare-w .v3-folha-s')), a.texto('.v3-pare-w .v3-folha-s'));
  assert.ok(a.$('[data-a="falhou-copia"]') && a.$('[data-a="falhou-baixa"]'));
  const aviso = a.$('[role="alertdialog"]');
  assert.deepEqual([...aviso.querySelectorAll('.v3-acoes button')], [a.$('[data-a="falhou-tenta"]')]);
  assert.equal(a.window.document.activeElement, a.$('[data-a="falhou-tenta"]'));
  assert.equal(aviso.querySelectorAll('.v3-saidas button').length, 2);
  a.window.document.dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await a.esperar();
  assert.ok(!a.$('#falhou-t'), 'fechar só fecha o aviso');
  assert.ok(/a série 2/.test(a.texto('.v3-estados')), 'e a faixa fica');
  a.fechar();
});

test('estados: a gravação que falhou vira a faixa fixa, e sem rede avisa sem bloquear', async () => {
  const a = await comVisual();
  a.E(`view.naoGuardado = { motivo: 'recusa', oQue: 'a série 2', valor: null, salvo: '' }; render();`);
  await a.esperar();
  assert.ok(/Não foi guardado: a série 2/.test(a.texto('.v3-estados')), a.texto('.v3-estados'));
  // "Ver" abre o painel com o que era e o que fazer
  a.clicar('.v3-estados .v3-faixa button');
  await a.esperar(60);
  assert.ok(a.$('.v3-pare-w'), 'o painel da falha');
  a.v('ctx.dispensaFalha');
  await a.esperar(40);
  assert.ok(!a.$('.ng-faixa'), 'e não a faixa antiga');
  a.E(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); window.dispatchEvent(new Event('offline'));`);
  await a.esperar();
  assert.ok(/Sem rede/.test(a.texto('.v3-estados')));
  // avisa uma vez e some em 4 s; a falha ao guardar é a única que fica
  await a.esperar(4200);
  assert.ok(!/Sem rede/.test(a.texto('.v3-estados') || ''), 'a faixa sem rede sumiu');
  assert.ok(/Não foi guardado/.test(a.texto('.v3-estados')), 'a falha continua');
  // só volta se a rede voltar e cair de novo
  a.E(`window.dispatchEvent(new Event('offline'));`);
  await a.esperar();
  assert.ok(!/Sem rede/.test(a.texto('.v3-estados') || ''), 'cair de novo sem ter voltado não avisa');
  a.E(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true }); window.dispatchEvent(new Event('online'));`);
  a.E(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); window.dispatchEvent(new Event('offline'));`);
  await a.esperar();
  assert.ok(/Sem rede/.test(a.texto('.v3-estados')), 'voltou e caiu: avisa de novo');
  a.fechar();
}, 15000);   // espera os 4 s da faixa sumir

test('colar a cópia como texto: confere antes, diz o que tem, e restaura pela porta de sempre', async () => {
  const a = await comVisual();
  a.v('ctx.abreAjustes');
  await a.esperar();
  assert.ok(a.$('[data-a="ajustes-apaga"]').classList.contains('v3-lin'), '"Voltar ao começo" é uma linha, não saída sublinhada');
  a.clicar('[data-a="ajustes-colar"]');
  await a.esperar();
  const campo = a.$('[data-a="colar-texto"]');
  campo.value = 'isto não é json';
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="colar-confere"]');
  await a.esperar();
  assert.ok(/Não é uma cópia do app/.test(a.texto('.v3-folha')), 'texto que não é cópia: diz o que houve');
  const copia = JSON.stringify({ app: 'lastro', data: { logs: {}, done: [{ day: 'A', t: Date.now() - 86400000, sid: 1 }], body: { peso: [{ t: 1, v: 77 }] }, comidaHist: [] } });
  campo.value = copia;
  campo.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="colar-confere"]');
  await a.esperar();
  assert.ok(/1 sessão, 0 dias de comida, 1 pesagem/.test(a.texto('.v3-folha')), a.texto('.v3-folha'));
  a.clicar('[data-a="colar-restaura"]');
  await a.esperar(120);
  assert.ok(a.perguntas().some(q => /substitui o histórico atual/.test(JSON.stringify(q))), 'a mesma confirmação do arquivo, que diz o que se perde');
  a.fechar();
});
