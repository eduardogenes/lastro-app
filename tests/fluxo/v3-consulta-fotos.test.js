// As fotos para olhar, no visual novo (direção 3, Fase 1): o centro das
// fotos, comparar com a ressalva de cada data, no tempo, a galeria com o selo
// de cada sessão, a foto aberta, a lixeira e o ajuste do enquadramento.
// Especificação: docs/redesign-3/03-lotes.md.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { cacheFalso } from './dubles.js';

const DIA = 86400000;
function iso(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
const atras = n => iso(Date.now() - n * DIA);
const POSE = 'frente-relaxado';

/** Três sessões na mesma pose: a do meio com "outra luz", a mais nova com uma foto fora do padrão. */
async function comTresSessoes() {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  cacheFalso(a);
  a.E(`S.protocolo.sessoes = [
    { d: ${JSON.stringify(atras(28))}, t: 1, m: 1, fotos: { '${POSE}': { v: 1, ext: 'webp' }, 'perfil-direito': { v: 2, ext: 'webp' } } },
    { d: ${JSON.stringify(atras(14))}, t: 1, m: 1, muda: ['luz'], fotos: { '${POSE}': { v: 3, ext: 'webp' } } },
    { d: ${JSON.stringify(atras(2))}, t: 1, m: 1, fotos: { '${POSE}': { v: 4, ext: 'webp', cap: { via: 'app', l: 1, a: 1, fora: ['altura'] } } } }
  ]`);
  return a;
}
/** Mexe numa faixa de arrastar como o dedo mexe. */
function arrasta(a, sel, valor) {
  const el = a.$(sel);
  if (!el) throw new Error(sel + ' não existe');
  el.value = String(valor);
  el.dispatchEvent(new a.window.Event('input', { bubbles: true }));
}

test('o centro das fotos: a próxima sessão, a última com o selo, e as entradas por cima dele', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreCentroDasFotos');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-bloco-t'), 'Próxima em 12 dias');
  assert.ok(/fora do padrão/.test(a.texto('.v3-fita-s')), 'a última sessão diz a ressalva: ' + a.texto('.v3-fita-s'));

  a.clicar('[data-a="fotos-galeria"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Galeria', 'a galeria abre por cima do centro');
  a.v('ctx.fechaGaleria');
  await a.esperar();
  assert.ok(a.$('[data-a="fotos-nova"]'), 'e fechar devolve o centro');

  a.clicar('[data-a="fotos-comparar"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Comparar', 'a comparação também');
  a.fechar();
});

test('sem sessão, o centro convida e não oferece o que ainda não existe', async () => {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  a.v('ctx.abreCentroDasFotos');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-bloco-t'), 'A primeira sessão');
  assert.strictEqual(a.$('[data-a="fotos-comparar"]').tagName, 'DIV', 'comparar não abre nada ainda');
  a.fechar();
});

test('comparar: o selo de cada data, a linha das sessões e os três modos', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreComparar', POSE);
  await a.esperar();
  assert.strictEqual(a.vista().comparar.de, atras(28), 'abre no par mais longo');
  const selos = a.$$('.v3-datas .v3-selo').map(e => e.textContent.trim());
  assert.deepStrictEqual(selos, ['no padrão', 'uma fora do padrão']);
  assert.ok(a.$(`[data-a="trilha-${atras(14)}"] i.r`), 'a sessão de outra luz aparece marcada na linha');

  a.clicar(`[data-a="trilha-${atras(14)}"]`);
  await a.esperar();
  assert.strictEqual(a.vista().comparar.de, atras(14), 'o toque troca a ponta mais perto (empate: a mais antiga)');
  assert.ok(/outra luz/.test(a.texto('.v3-datas')), 'e o selo dela vem junto');

  a.clicar('.v3-sel button:nth-child(2)');
  await a.esperar();
  assert.ok(a.$('.v3-cortina'), 'cortina');
  arrasta(a, '[data-a="cortina-divisa"]', 30);
  assert.strictEqual(a.vista().comparar.corte, 30);
  a.clicar('.v3-sel button:nth-child(3)');
  await a.esperar();
  assert.ok(a.$('.v3-sobre') && !a.$('.v3-cortina'), 'sobrepor');
  a.fechar();
});

test('no tempo: abre na sessão mais nova, arrasta até a primeira e troca de pose', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreNoTempo', POSE);
  await a.esperar();
  assert.ok(/sessão 3 de 3/.test(a.texto('.v3-datas')));
  arrasta(a, '[data-a="tempo-r"]', 0);
  await a.esperar();
  assert.ok(/sessão 1 de 3/.test(a.texto('.v3-datas')));
  assert.ok(!a.$('.v3-datas .v3-selo'), 'a primeira está no padrão');
  arrasta(a, '[data-a="tempo-r"]', 1);
  await a.esperar();
  assert.ok(/outra luz/.test(a.texto('.v3-datas')), 'a do meio mostra a ressalva');
  a.clicar('.v3-poses button:nth-child(5)');
  await a.esperar();
  assert.notStrictEqual(a.vista().noTempo.pose, POSE);
  a.fechar();
});

test('galeria: o selo por sessão, a foto aberta com a ressalva, apagar e devolver da lixeira', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreGaleria');
  await a.esperar();
  const selos = a.$$('.v3-sec-h small').map(e => e.textContent.trim());
  assert.deepStrictEqual(selos, ['uma fora do padrão', 'outra luz', 'no padrão'], 'da mais nova para a mais antiga');

  a.clicar(`[data-a="galeria-${atras(2)}-${POSE}"]`);
  await a.esperar();
  assert.ok(/Esta foto saiu fora do padrão: altura/.test(a.texto('.v3-sec')), a.texto('.v3-sec'));
  a.v('ctx.fechaFotoDaGaleria');
  a.clicar(`[data-a="galeria-${atras(28)}-${POSE}"]`);
  await a.esperar();
  assert.strictEqual(a.$('[data-a="foto-proxima"]').disabled, false, 'anda para a pose seguinte da sessão');
  a.clicar('[data-a="foto-proxima"]');
  await a.esperar();
  assert.strictEqual(a.vista().galeria.foto.pose, 'perfil-direito');

  // os bytes no aparelho: é deles que a lixeira devolve a foto
  await a.E(`(async () => {
    const c = await caches.open('lastro-corpo');
    await c.put('./corpo/${atras(28)}/perfil-direito.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  })()`);
  a.clicar('[data-a="foto-apagar"]');
  await a.esperar(40);
  a.clicar('[data-a="aviso-sim"]');
  await a.esperar(120);
  assert.ok(!a.S().protocolo.sessoes[0].fotos['perfil-direito'], 'saiu da sessão');
  a.clicar('[data-a="galeria-lixeira"]');
  await a.esperar(60);
  assert.strictEqual(a.$$('.v3-lixo').length, 1, 'e está na lixeira');
  a.clicar('.v3-lixo-b');
  await a.esperar(120);
  assert.ok(a.S().protocolo.sessoes[0].fotos['perfil-direito'], 'devolvida');
  a.fechar();
});

test('ajustar pela foto aberta: girar sobe o zoom junto, e salvar grava o recorte', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreGaleria');
  a.v('ctx.abreFotoDaGaleria', atras(14), POSE);
  await a.esperar();
  a.clicar('[data-a="foto-ajustar"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Ajustar', 'o ajuste abre por cima da galeria');
  assert.strictEqual(a.$('[data-a="aj-original"]').disabled, true, 'nada para desfazer ainda');
  arrasta(a, '[data-a="aj-giro"]', 3);
  await a.esperar();
  const enq = a.vista().ajuste.enq;
  assert.strictEqual(enq.r, 3);
  assert.ok(enq.z > 1, 'o zoom subiu para não abrir borda vazia');
  a.clicar('[data-a="aj-salvar"]');
  await a.esperar(80);
  assert.strictEqual(a.S().protocolo.sessoes[1].fotos[POSE].enq.r, 3);
  assert.ok(a.vista().galeria.foto, 'e volta para a foto aberta');
  a.fechar();
});

test('mandar para os agentes: escolhe a pose ou as onze, grava o pedido, e mandar de novo não repete', async () => {
  const a = await comTresSessoes();
  a.v('ctx.abreComparar', POSE);
  await a.esperar();
  a.clicar('[data-a="mandar"]');
  await a.esperar(40);
  assert.strictEqual(a.$('[data-a="mandar-pose"]').getAttribute('aria-pressed'), 'true', 'o padrão é só esta pose');
  a.clicar('[data-a="mandar-todas"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="mandar-todas"]').getAttribute('aria-pressed'), 'true');
  a.clicar('[data-a="mandar-ok"]');
  await a.esperar(40);
  assert.ok(!a.$('.v3-folha'), 'a folha fechou');
  const p = a.S().paraAvaliar;
  assert.strictEqual(p.length, 1);
  assert.deepStrictEqual([p[0].pose, p[0].de, p[0].ate], ['todas', atras(28), atras(2)]);
  assert.ok(/Mandado em .*com as onze poses/.test(a.texto('.v3-sec')), a.texto('.v3-sec'));

  a.clicar('[data-a="mandar"]');
  await a.esperar(40);
  a.clicar('[data-a="mandar-todas"]');
  a.clicar('[data-a="mandar-ok"]');
  await a.esperar(40);
  assert.strictEqual(a.S().paraAvaliar.length, 1, 'o mesmo par só renova a data');
  a.fechar();
});

test('o alinhamento sugerido: a foto aberta mostra a prévia, aceitar grava como do app, e "agora não" só apaga a sugestão', async () => {
  const a = await comTresSessoes();
  a.E(`S.protocolo.sessoes[1].fotos['${POSE}'].sug = { r: 0, z: 1.3, cx: 0.5, cy: 0.48, m: 5, auto: 1 };
       S.protocolo.sessoes[0].fotos['${POSE}'].sug = { r: 0, z: 1.2, cx: 0.5, cy: 0.5, m: 5, auto: 1 };`);
  // os bytes da foto no aparelho: sem eles a tela mostra o quadro vazio, e não a foto
  await a.E(`(async () => {
    const c = await caches.open('lastro-corpo');
    await c.put('./corpo/${atras(14)}/${POSE}.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  })()`);
  a.v('ctx.abreGaleria');
  a.v('ctx.abreFotoDaGaleria', atras(14), POSE);
  await a.esperar(150);
  assert.ok(a.$('.v3-sug'), 'a sugestão aparece');
  const img = () => a.$('.v3-ver img');
  assert.ok(img(), 'a foto está na tela');
  assert.ok(!/scale\(1\.3/.test(img().getAttribute('style')), 'antes, a foto como saiu');
  a.clicar('[data-a="sug-ver"]');
  await a.esperar();
  assert.ok(/scale\(1\.3/.test(img().getAttribute('style')), 'a prévia desenha a sugestão: ' + img().getAttribute('style'));
  assert.strictEqual(a.S().protocolo.sessoes[1].fotos[POSE].enq, undefined, 'ver não grava');
  a.clicar('[data-a="sug-aceitar"]');
  await a.esperar(60);
  const f = a.S().protocolo.sessoes[1].fotos[POSE];
  assert.strictEqual(f.enq.auto, 1, 'aceita, vira o ajuste da foto, marcado como do app');
  assert.strictEqual(f.enq.z, 1.3);
  assert.strictEqual(f.sug, undefined);
  assert.ok(!a.$('.v3-sug'), 'e a sugestão sai da tela');

  a.v('ctx.abreFotoDaGaleria', atras(28), POSE);
  await a.esperar();
  a.clicar('[data-a="sug-nao"]');
  await a.esperar(60);
  const g = a.S().protocolo.sessoes[0].fotos[POSE];
  assert.strictEqual(g.sug, undefined, 'dispensada');
  assert.strictEqual(g.enq, undefined, 'e a foto continua como saiu');
  a.fechar();
});
