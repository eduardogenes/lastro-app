// Uso depois do build: node docs/design-system/conferir-primeira-vez.mjs chromium|webkit [pasta de capturas]
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright-core';

const [, , motor, capturas] = process.argv;
assert.ok(['chromium', 'webkit'].includes(motor), 'Escolha chromium ou webkit.');
const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
assert.ok(existsSync(resolve(dist, 'index.html')), 'O build do app precisa estar em dist/.');
if (capturas) mkdirSync(capturas, { recursive: true });
const motores = { chromium, webkit };
const navegador = await motores[motor].launch({ executablePath: process.env.LASTRO_NAVEGADOR });
const telas = ['Seu treino', 'Sua comida', 'O que acompanhar'];
try {
  for (const movimento of ['no-preference', 'reduce']) {
    const ctx = await navegador.newContext({
      viewport: { width: 414, height: 896 }, deviceScaleFactor: 2,
      hasTouch: true, reducedMotion: movimento, serviceWorkers: 'block'
    });
    // Somente o build local. Cada percurso começa com armazenamento próprio e vazio.
    await ctx.route('**/*', rota => {
      const url = new URL(rota.request().url());
      const arquivo = resolve(dist, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
      if (url.origin !== 'https://lastro.test' || !arquivo.startsWith(resolve(dist) + sep) || !existsSync(arquivo)) return rota.abort();
      return rota.fulfill({ path: arquivo });
    });
    const pg = await ctx.newPage();
    const erros = [];
    pg.on('pageerror', e => erros.push(e.message));
    await pg.goto('https://lastro.test/');
    const botao = pg.locator('[data-a="inicio-continuar"]');
    for (const [i, tela] of telas.entries()) {
      await pg.getByRole('heading', { name: tela, exact: true }).waitFor();
      // O WebKit deslocava o título um quadro inteiro ao inserir Voltar.
      const cabecalho = () => pg.locator('.v3-inicio .v3-cab').evaluate(cab => {
        const x = el => el.getBoundingClientRect().x - cab.getBoundingClientRect().x;
        return [x(cab.firstElementChild), x(cab.querySelector('h1'))];
      });
      assert.deepEqual(await cabecalho(), [8, 56]);
      await pg.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(requestAnimationFrame);
        const finitas = document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity);
        await Promise.allSettled(finitas.map(a => a.finished));
      });
      const caixa = await botao.evaluate(el => {
        const { x, y, width, height } = el.getBoundingClientRect();
        return [x, y, width, height];
      });
      console.log(motor, movimento, tela, caixa);
      assert.deepEqual(await cabecalho(), [8, 56]);
      // Medida da página viva, nos dois motores, no mesmo tamanho.
      assert.deepEqual(caixa, [20, 762, 374, 58]);
      assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth), 414);
      if (capturas) await pg.screenshot({ path: resolve(capturas, motor + '-' + movimento + '-' + (i + 1) + '.png') });
      if (i === 0) await pg.getByRole('radio', { name: /Monto depois/ }).click();
      await botao.click();
    }
    await pg.getByRole('heading', { name: 'Nada para agora.' }).waitFor();
    assert.deepEqual(erros, []);
    await ctx.close();
  }
} finally {
  await navegador.close();
}
