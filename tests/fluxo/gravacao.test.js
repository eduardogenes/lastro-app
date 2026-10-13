// A GRAVAÇÃO QUE FALHOU — a família "falhou", decisão 13, §3.2 da frente 3.
//
// Até 13/10 a falha era SILENCIOSA: a camada de armazenamento engolia o erro do
// `setItem` e respondia "gravei" sempre. Com o aparelho cheio (o teto do Safari,
// F53, e o estado inteiro regravado a cada série, F256), o estado ficava só na
// memória e se perdia ao fechar o app sem uma palavra. Estes casos usam o
// aparelho cheio do harness (`encheCota`), que falha como o Safari falha.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const painel = a => a.$('.falhou-w [role="alert"]');

test('a gravação que falha diz que não guardou, por quê, e até quando o valor vale', async () => {
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);

  assert.ok(painel(a), 'o painel de falha abriu, com role="alert": ele interrompe');
  const frase = a.texto('.falhou-w .pare-t');
  assert.strictEqual(frase.indexOf('Não guardei o peso de hoje.'), 0, 'abre pelo verbo negado no passado — ' + frase);
  assert.ok(/recusou a gravação: ele está cheio/.test(frase), 'diz a causa em palavra');
  assert.ok(/Nada foi apagado e nada saiu do aparelho/.test(frase), 'diz o que NÃO aconteceu');
  assert.ok(/O valor continua aqui, 73,6 kg, enquanto o app estiver aberto/.test(frase), 'e até quando vale');

  assert.strictEqual(a.S().body.peso.length, 1, 'na memória o peso está');
  const disco = a.gravado();
  assert.ok(!disco || !(disco.body && disco.body.peso && disco.body.peso.length), 'no disco, não');
  a.fechar();
});

test('fechar o aviso não apaga a marca, e tentar de novo guarda quando houver espaço', async () => {
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);

  // Esc é "Fechar este aviso": o painel é camada, e dispensar não escolhe por ele.
  a.window.dispatchEvent(new a.window.KeyboardEvent('keydown', { key: 'Escape' }));
  await a.esperar();
  assert.strictEqual(painel(a), null, 'o Esc fechou o aviso');
  assert.ok(/Não guardado neste aparelho · o peso de hoje/.test(a.texto('.ng-faixa')),
    'e a marca ficou: é o estado do dado, não do aviso');

  // Com o aparelho ainda cheio, a próxima falha NÃO reabre o painel — um
  // alerta por gravação ensinaria a fechar sem ler. A marca acompanha.
  a.m.ctx.setCintura(84.5);
  a.m.ctx.registraCintura();
  await a.esperar(60);
  assert.strictEqual(painel(a), null, 'o painel abre uma vez por episódio');
  assert.ok(/a medida de cintura/.test(a.texto('.ng-faixa')), 'a marca diz o que ficou por último');

  a.encheCota(false);
  a.clicar(a.$('[data-a="ng-tenta"]'));
  await a.esperar(60);
  assert.strictEqual(a.$('.ng-faixa'), null, 'gravou: a marca sai sozinha');
  assert.strictEqual(a.gravado().body.peso.length, 1, 'e o peso está no disco');
  assert.strictEqual(a.gravado().body.cintura.length, 1, 'com a cintura');
  a.fechar();
});

test('a série que não foi guardada é dita pelo número dela, com o valor', async () => {
  const a = await app();
  a.v('iniciarSessao');
  await a.esperar();
  a.encheCota();
  a.v('anotaSerie', 0, 1, 0, 45);
  a.v('anotaSerie', 0, 1, 1, 10);
  await a.esperar(800);       // a gravação da série é represada (700 ms)
  const frase = a.texto('.falhou-w .pare-t');
  assert.strictEqual(frase.indexOf('Não guardei a série 2.'), 0, frase);
  assert.ok(/O valor continua aqui, 45 × 10,/.test(frase), frase);
  a.fechar();
});

test('copiar o registro inteiro leva a cópia de segurança completa', async () => {
  const a = await app({ estado: { body: { peso: [], cintura: [] } } });
  let copiado = null;
  Object.defineProperty(a.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: function (t) { copiado = t; return Promise.resolve(); } }
  });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  a.clicar(a.$('[data-a="falhou-copia"]'));
  await a.esperar(60);
  const c = JSON.parse(copiado);
  assert.strictEqual(c.app, 'lastro', 'é o envelope da cópia de segurança');
  assert.strictEqual(c.data.body.peso[0].v, 73.6, 'com o peso que o disco recusou');
  a.fechar();
});

test('no modo privado o painel não abre: o Agora já diz que nada vai ficar', async () => {
  const a = await app({ semArmazenamento: true, estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  assert.strictEqual(painel(a), null, 'um alerta a cada registro ensinaria a ignorar o alerta');
  assert.strictEqual(a.$('.ng-faixa'), null, 'nem a marca: o aviso de perda do Agora é o canal');
  a.fechar();
});
