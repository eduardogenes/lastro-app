// Auditor: o nó sobrevive à mudança de estado, ou renasce? Uma transição CSS só
// dispara num nó que já estava na página antes da mudança. Mesmo uso do
// auditor-movimento.mjs.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
await p.goto(process.argv[2]); await p.waitForTimeout(900);
const esc = c => p.evaluate(x => window.__escopo(x), c);
await esc(`
  const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
  const t = function (k) { return base.getTime() - k*DIA; };
  S.done = [{ day:'A', t:t(3), sid:t(3), dur:4000000, fim:'manual' }, { day:'B', t:t(2), sid:t(2), dur:4000000, fim:'auto' }];
  S.body.peso = [{ t: t(9), v: 74.1 }, { t: t(8), v: 74.0 }, { t: t(2), v: 73.8 }, { t: t(1), v: 73.6 }];
  render();
`);
await p.waitForTimeout(300);

// Guarda o nó, faz a mudança, diz se o mesmo nó continua lá.
async function mesmo(seletor, codigo) {
  await p.evaluate(s => { window.__no = document.querySelector(s); }, seletor);
  await esc(codigo);
  await p.waitForTimeout(80);
  return p.evaluate(s => {
    const agora = document.querySelector(s);
    return { antes: !!window.__no, depois: !!agora, mesmoNo: !!window.__no && window.__no === agora };
  }, seletor);
}

const R = {};
// A pilha de folhas primeiro, com a página limpa.
await esc(`CTX.abreFolha({ k: 'dia' }); CTX.abreFolha({ k: 'pesoRapido' });`);
await p.waitForTimeout(150);
R.folhaDeBaixo_aoFecharADeCima = await mesmo('.ins-folha-w', `CTX.fechaFolha();`);
await esc(`CTX.fechaTudo();`);
await p.waitForTimeout(150);
R.cartaoDeCima_marcaRefeicao = await mesmo('.ins-foco', `const r = planoDeComida()[0]; CTX.marcaRefeicao(r.id);`);
R.copo_maisUmCopo = await mesmo('.ag-copos i', `CTX.maisUmCopo();`);
await p.waitForTimeout(200);
R.linhaDaComida_abre = await mesmo('.ag-l', `CTX.abreLinhaDaComida(planoDeComida()[1].id);`);
R.abaParaTelaCheia_evolucao = await mesmo('.tc', `CTX.abreEvolucao(); render();`);
R.telaCheia_tituloDeEvolucaoParaAjustes = await mesmo('.tc-titulo', `CTX.abreAjustes();`);
await esc(`CTX.fechaAjustes(); view.evolucao = false; saiDoDestino('evolucao'); render();`);
await esc(`diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); render();`);
await p.waitForTimeout(200);
R.cartaoExercicio_abre = await mesmo('[data-ex="0"]', `toggle(0);`);
R.linhaDaSerie_grava = await mesmo('[data-ex="0"] .setrow', `anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 9); render();`);
R.cartaoExercicio_fecha = await mesmo('[data-ex="0"]', `toggle(0);`);
R.toast_reaparece = await mesmo('#toast', `toast('a'); toast('b');`);
console.log(JSON.stringify({ R, erros }, null, 1));
await b.close();
