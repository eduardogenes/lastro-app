// O Corpo para consultar, no visual novo (direção 3, Fase 2): o peso com a
// faixa de tempo e a correção de uma pesagem, uma medida com as sessões de
// fotos marcadas, a leitura nova da bioimpedância um número por passo, e tudo
// na mesma data. Especificação: docs/redesign-3/03-lotes.md, Fase 2.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const DIA = 86400000;
function iso(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
async function comDados(semente) {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  a.E(semente);
  await a.esperar();
  return a;
}
const pesagens = `S.body.peso = [${Array.from({ length: 20 }, (_, i) => `{ t: Date.now() - ${40 - i * 2} * ${DIA}, v: ${(75 + i * 0.1).toFixed(1)}, m: 1 }`).join(',')}];`;

test('peso: a linha da semana com as pesagens, 4 semanas ou tudo, e corrigir uma pesagem pela régua', async () => {
  const a = await comDados(pesagens);
  a.v('ctx.abreEvolucao');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Peso');
  assert.ok(a.$('.v3-graf .v3-graf-linha'), 'a linha');
  const tudo = a.$$('.v3-graf-ponto').length;
  a.clicar('.v3-sel button:nth-child(1)');
  await a.esperar();
  assert.ok(a.$$('.v3-graf-ponto').length < tudo, '4 semanas mostra menos pesagens');

  const t = a.S().body.peso.slice(-1)[0].t;
  a.clicar(`[data-a="pesagem-${t}"]`);
  await a.esperar(40);
  assert.ok(/Pesagem de/.test(a.texto('.v3-folha h2')), 'a folha diz o que corrige: ' + a.texto('.v3-folha h2'));
  a.clicar('.v3-folha .v3-regua-p button:last-child');
  await a.esperar(10);
  a.clicar('.v3-folha .v3-regua-p button:last-child');
  await a.esperar();
  a.clicar('[data-a="corrige-ok"]');
  await a.esperar(60);
  const x = a.S().body.peso.filter(y => y.t === t);
  assert.strictEqual(x.length, 1, 'a mesma pesagem, no mesmo instante');
  assert.strictEqual(x[0].v, 77.1, 'corrigida');
  a.fechar();
});

test('uma medida: a linha com as sessões de fotos marcadas, e "medir agora" mede só ela', async () => {
  const a = await comDados(`
    S.body.cintura = [{ t: Date.now() - 30 * ${DIA}, v: 84.5, m: 1 }, { t: Date.now() - 2 * ${DIA}, v: 86, m: 1 }];
    S.protocolo.sessoes = [{ d: ${JSON.stringify(iso(Date.now() - 15 * DIA))}, t: 1, m: 1, fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } }];`);
  a.v('ctx.abreMedida', 'cintura');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Cintura');
  assert.strictEqual(a.$$('.v3-graf-marca').length, 1, 'a sessão de fotos marcada sob a linha');
  assert.ok(/\+1,5 cm/.test(a.texto('.v3-gigante')), a.texto('.v3-gigante'));
  a.clicar('[data-a="medida-medir"]');
  await a.esperar();
  const m = a.vJ('ctx.medirV3');
  assert.deepStrictEqual([m.m.k, m.total], ['cintura', 1]);
  a.fechar();
});

test('bioimpedância: a leitura nova, um número por passo; a água pode ficar de fora', async () => {
  const a = await comDados(`S.body.peso = [{ t: Date.now() - ${DIA}, v: 77, m: 1 }]`);
  a.v('ctx.abreBio');
  await a.esperar(40);
  assert.ok(/1 de 5/.test(a.texto('.v3-folha-s')));
  for (let i = 0; i < 4; i++) { a.clicar('[data-a="bio-segue"]'); await a.esperar(); }
  assert.ok(a.$('[data-a="bio-pula"]'), 'a água é opcional');
  a.clicar('[data-a="bio-pula"]');
  await a.esperar(80);
  assert.ok(!a.$('.v3-folha'), 'a folha fechou');
  const b = a.S().body;
  assert.strictEqual(b.bioPeso.slice(-1)[0].v, 77, 'o peso partiu do da balança comum');
  assert.ok(b.bioMusculo.length && b.bioGordura.length && b.bioGorduraPct.length);
  assert.strictEqual((b.bioAgua || []).length, 0, 'a água ficou de fora');
  a.fechar();
});

test('tudo na mesma data: o último número de cada medida até o dia, com a data dele, e a sessão mais perto', async () => {
  const a = await comDados(`
    S.body.peso = [{ t: Date.now() - 30 * ${DIA}, v: 75, m: 1 }, { t: Date.now() - 2 * ${DIA}, v: 77, m: 1 }];
    S.body.cintura = [{ t: Date.now() - 20 * ${DIA}, v: 85, m: 1 }];
    S.protocolo.sessoes = [{ d: ${JSON.stringify(iso(Date.now() - 18 * DIA))}, t: 1, m: 1, fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } }];`);
  a.clicar('[data-a="corpo-mesma-data"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Na mesma data');
  a.v('ctx.setDiaNaMesmaData', Date.now() - 19 * DIA);
  await a.esperar();
  const d = a.vJ('ctx.naMesmaDataV3');
  const peso = d.medidas.filter(m => m.k === 'peso')[0], cint = d.medidas.filter(m => m.k === 'cintura')[0];
  assert.strictEqual(peso.valor, '75,0', 'o peso de antes, não o de depois');
  assert.ok(/11 dias antes/.test(peso.quando), peso.quando);
  assert.ok(/1 dia antes/.test(cint.quando), cint.quando);
  assert.strictEqual(d.sessao.d, iso(Date.now() - 18 * DIA), 'a sessão mais perto, mesmo depois do dia');
  a.fechar();
});
