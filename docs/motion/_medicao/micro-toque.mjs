// Micro-interações · o que cada controle mostra ENQUANTO o dedo está nele.
//
// Força `:active` pelo protocolo do DevTools (CSS.forcePseudoState) em cada
// controle tocável do modo de sessão e do Agora, e compara o estilo computado
// com o de repouso: fundo, cor, borda, sombra, transform e opacidade. Um
// controle em que nada muda não diz, no toque, que o toque chegou.
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
const cdp = await ctx.newCDPSession(p);
await cdp.send('DOM.enable'); await cdp.send('CSS.enable');

await ev(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const DD = nextDay(); const P = treino(DD); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:DD, t:t, sid:t, dur:3600000, fim:'manual' }];
  diaDeComida().cadencia = 'treino';
  CTX.vaiPara('agora'); render();
`);
await p.waitForTimeout(300);

const PROPS = ['background-color', 'color', 'border-top-color', 'box-shadow', 'transform', 'opacity', 'text-decoration-line'];
async function mede(sel, rotulo) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
  if (!nodeId) return { rotulo, sel, r: 'não achei' };
  const estilo = () => p.evaluate(({ sel, PROPS }) => {
    const el = document.querySelector(sel); const cs = getComputedStyle(el);
    // o que muda pode estar num filho (ex.: `.restlinha:active b`)
    const filho = el.firstElementChild ? getComputedStyle(el.firstElementChild).color : null;
    const o = {}; PROPS.forEach(k => o[k] = cs.getPropertyValue(k)); o.filho = filho; return o;
  }, { sel, PROPS });
  // o fundo de verdade atrás do controle: o primeiro ancestral com fundo opaco
  const fundo = await p.evaluate((sel) => {
    let el = document.querySelector(sel).parentElement;
    while (el) { const c = getComputedStyle(el).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; el = el.parentElement; }
    return getComputedStyle(document.body).backgroundColor;
  }, sel);
  const repouso = await estilo();
  await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['active'] });
  const ativo = await estilo();
  await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
  const muda = Object.keys(repouso).filter(k => repouso[k] !== ativo[k]).map(k => k + ': ' + repouso[k] + ' → ' + ativo[k]);
  // contraste do fundo pressionado contra o fundo de verdade (WCAG)
  const lum = c => { const m = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * m[0] + .7152 * m[1] + .0722 * m[2]; };
  const opaco = c => c && !/rgba\(0, 0, 0, 0\)/.test(c);
  const de = opaco(repouso['background-color']) ? repouso['background-color'] : fundo;
  const para = opaco(ativo['background-color']) ? ativo['background-color'] : fundo;
  const L1 = lum(de), L2 = lum(para);
  const contraste = ((Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05)).toFixed(2);
  return { rotulo, sel, muda: muda.length ? muda.concat(de !== para ? ['fundo ' + contraste + ':1'] : []) : ['NADA'] };
}

const r = [];
// Agora
r.push(await mede('[data-a="agua-mais"]', '+1 copo'));
r.push(await mede('[data-a="agua-corrige"]', 'a conta da água (corrige)'));
r.push(await mede('.ag-l-b', 'linha de refeição'));
r.push(await mede('.ins-tab', 'aba'));
r.push(await mede('.ins-cab-ajustes', 'Ajustes ⚙'));
await ev(`CTX.abreLinhaDaComida(Object.keys(diaDeComida().done).length >= 0 && document.querySelector('.ag-l-b').dataset.a.replace('linha-', ''));`);
await p.waitForTimeout(100);
r.push(await mede('.ag-l-tudo', 'Comi tudo'));
r.push(await mede('.ag-l-btns .ins-btn-secondary', 'Metade'));

// modo de sessão
await ev(`CTX.abreTreinoDeHoje(); toggle(0); render();`);
await p.waitForTimeout(300);
r.push(await mede('.ins-modo-sair', 'seta de sair do modo'));
r.push(await mede('.day-ini', 'Iniciar treino'));
r.push(await mede('[data-ex="0"] .ex-top', 'topo do cartão (abre/fecha)'));
r.push(await mede('#w0_0', 'CARGA da série (abre o teclado)'));
r.push(await mede('#r0_0', 'REPETIÇÃO da série (abre a régua)'));
r.push(await mede('#q0_0', 'RIR da série'));
r.push(await mede('.setant-b', 'coluna anterior (copia)'));
r.push(await mede('.restlinha', 'descanso 3min'));
r.push(await mede('.ex-mais', '+ série'));
r.push(await mede('.exacoes .histbtn', 'Trocar/Pular/Histórico'));
r.push(await mede('.notabtn', 'Anotar algo / Carga:'));
await ev(`abreRegua(0, 0);`); await p.waitForTimeout(50);
r.push(await mede('.regua-v', 'valor da régua'));
r.push(await mede('.regua-anda', 'seta da régua'));
r.push(await mede('.regua-outro', 'outro valor'));
await ev(`abreTecladoDeCarga(0, 0);`); await p.waitForTimeout(50);
r.push(await mede('.tcl-t', 'tecla'));
r.push(await mede('.tcl-pronto', 'pronto (teclado)'));
await ev(`fechaTeclado(); abreRir(0, 0);`); await p.waitForTimeout(50);
r.push(await mede('.rirop', 'valor do RIR'));
await ev(`view.rir = null; anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 9); render();`); await p.waitForTimeout(100);
r.push(await mede('#tmenos', '−15'));
r.push(await mede('#tmais', '+15'));
r.push(await mede('#tstop', 'parar'));
r.push(await mede('[data-a="descansa-agua"]', 'chip Água +1 (descanso)'));
r.push(await mede('.ctrl-b', 'Pausar/Encerrar'));
await ev(`CTX.finalizarSessao && 0; view.pilha = view.pilha || []; render();`);

for (const x of r) console.log((x.rotulo).padEnd(36), '|', (x.muda || [x.r]).join(' ; '));
if (erros.length) console.log('ERROS', erros);
await b.close();
