// Micro-interações · o contador "séries N/M" do modo de sessão é escrito por
// fora do Preact (`atualizaEstado`, `textContent =`), o que troca o nó de texto
// que o Preact guardava. Depois disso, mudança que só passa pelo render() —
// ligar o deload, mudar séries na edição do dia — pinta num nó solto, e a tela
// fica com o número velho. Este script prova pelo caminho do deload.
//
// Uso: igual ao micro-render.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(6, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(process.argv[2]); await p.waitForTimeout(800);
const ev = (c) => p.evaluate((c) => window.__escopo(c), c);
const conta = () => ev(`({ tela: document.querySelector('#daymeta').textContent,
  dado: seriesFeitasHoje(view.day) + '/' + treino(view.day).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) })`);
await ev(`diaDeComida().cadencia = 'treino'; S.deload = false; CTX.abreTreinoDeHoje(); toggle(0); render();`);
await p.waitForTimeout(200);
const r = {};
r.inicio = await conta();
r.deloadSemSerie = (await ev(`CTX.setDeload(true);`), await conta());
await ev(`CTX.setDeload(false);`);
r.deloadDesligado = await conta();
await ev(`anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 8); render();`);
r.depoisDaSerie = await conta();
await ev(`CTX.setDeload(true);`);
r.deloadDepoisDaSerie = await conta();
await p.screenshot({ path: process.argv[3] + '/contador-deload.png' });
console.log(JSON.stringify({ erros, r }, null, 1));
await b.close();
