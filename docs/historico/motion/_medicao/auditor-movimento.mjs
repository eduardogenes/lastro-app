// Auditor de movimento (fase 1, só leitura): confere em Chromium, a 414×896 ×2,
// o que de fato anima hoje e o que troca de estalo. Roda contra o `dist`.
//
//   python3 -m http.server 4721 -d dist &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/auditor-movimento.mjs http://localhost:4721/ docs/motion/_medicao/shots/auditor
//
// Não congela o relógio: o cronômetro precisa do tempo de verdade.
import { chromium } from '../../../node_modules/playwright-core/index.mjs';

const URL = process.argv[2], OUT = process.argv[3];
const b = await chromium.launch({ executablePath: process.env.CHROME });
const R = {};

// O que está animando agora, em toda a página: tipo, alvo, propriedade, duração.
const animando = () => document.getAnimations().map(a => {
  const ef = a.effect, alvo = ef && ef.target;
  const t = ef && ef.getTiming ? ef.getTiming() : {};
  return {
    tipo: a.constructor.name,
    nome: a.transitionProperty || a.animationName || a.id || '',
    alvo: alvo ? (alvo.id ? '#' + alvo.id : (alvo.className && alvo.className.baseVal == null ? '.' + String(alvo.className).split(' ').join('.') : alvo.tagName)) : null,
    dur: t.duration, atraso: t.delay, curva: t.easing, estado: a.playState
  };
});

async function abre(reduz) {
  const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: reduz ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(900);
  // Dado mínimo: duas sessões e quatro pesos, como o molde da redesign.
  await p.evaluate(() => window.__escopo(`
    const DIA = 86400000, base = new Date(Date.now()); base.setHours(6,20,0,0);
    const t = function (k) { return base.getTime() - k*DIA; };
    S.done = [{ day:'A', t:t(3), sid:t(3), dur:4000000, fim:'manual' }, { day:'B', t:t(2), sid:t(2), dur:4000000, fim:'auto' }];
    S.body.peso = [{ t: t(9), v: 74.1 }, { t: t(8), v: 74.0 }, { t: t(2), v: 73.8 }, { t: t(1), v: 73.6 }];
    render();
  `));
  await p.waitForTimeout(300);
  return { ctx, p, erros };
}

const esc = (p, codigo) => p.evaluate(c => window.__escopo(c), codigo);

// ---------------------------------------------------------------- normal ----
{
  const { ctx, p, erros } = await abre(false);
  const r = R.normal = {};

  // 1 · Em repouso no Agora: o que anima sozinho.
  r.agoraRepouso = await p.evaluate(animando);

  // 2 · Trocar de aba: o indicador transiciona? O <main> e o conteúdo são os mesmos nós?
  await p.evaluate(() => { window.__m = document.querySelector('main'); window.__c = document.querySelector('main').firstElementChild; window.__ind = document.querySelector('.ins-tab-ind'); });
  await esc(p, `CTX.vaiPara('semana');`);
  r.trocaAba = await p.evaluate(animando);
  r.trocaAbaNos = await p.evaluate(() => ({
    mainMesmo: document.querySelector('main') === window.__m,
    conteudoMesmo: document.querySelector('main').firstElementChild === window.__c,
    indicadorMesmo: document.querySelector('.ins-tab-ind') === window.__ind,
    transicaoComputada: getComputedStyle(document.querySelector('.ins-tab-ind')).transition
  }));
  await p.waitForTimeout(80);
  await p.screenshot({ path: OUT + '/aba-meio-da-transicao.png' });
  await p.waitForTimeout(400);

  // 3 · Entrar numa tela cheia e voltar: a tab bar renasce?
  await p.evaluate(() => { window.__ind = document.querySelector('.ins-tab-ind'); window.__tb = document.querySelector('.ins-tabbar'); });
  await esc(p, `CTX.abreAjustes();`);
  r.entraTelaCheia = await p.evaluate(animando);
  r.telaCheiaTemTabbar = await p.evaluate(() => !!document.querySelector('.ins-tabbar'));
  await esc(p, `CTX.fechaAjustes();`);
  r.saiTelaCheia = await p.evaluate(animando);
  r.saiTelaCheiaNos = await p.evaluate(() => ({
    tabbarMesma: document.querySelector('.ins-tabbar') === window.__tb,
    indicadorMesmo: document.querySelector('.ins-tab-ind') === window.__ind
  }));

  // 4 · Abrir uma folha: anima alguma coisa?
  await esc(p, `CTX.vaiPara('agora');`);
  await p.waitForTimeout(400);
  await esc(p, `CTX.abreFolha({ k: 'dia' });`);
  r.abreFolha = await p.evaluate(animando);
  r.folhaEstilo = await p.evaluate(() => {
    const f = document.querySelector('.ins-folha'), v = document.querySelector('.ins-veu');
    if (!f) return null;
    const cf = getComputedStyle(f), cv = getComputedStyle(v);
    return { folhaTransition: cf.transition, folhaAnimation: cf.animationName, folhaTransform: cf.transform, veuTransition: cv.transition, veuOpacidade: cv.opacity };
  });
  await p.screenshot({ path: OUT + '/folha-primeiro-quadro.png' });
  await esc(p, `CTX.fechaFolha();`);
  r.fechaFolha = await p.evaluate(animando);

  // 5 · Toast: como aparece.
  await esc(p, `toast('Teste do auditor.');`);
  r.toast = await p.evaluate(() => {
    const t = document.getElementById('toast'), c = getComputedStyle(t);
    return { display: c.display, transition: c.transition, animation: c.animationName, anim: document.getAnimations().filter(a => a.effect && a.effect.target === t).length };
  });
  await p.screenshot({ path: OUT + '/toast.png' });

  // 6 · Dias: trocar de mês reaproveita as células?
  await esc(p, `CTX.vaiPara('dias');`);
  await p.waitForTimeout(300);
  await p.evaluate(() => { window.__cel = Array.from(document.querySelectorAll('.dc-c, [class*="dc-"]')).slice(0, 40); window.__n = window.__cel.length; });
  r.diasCelulasAntes = await p.evaluate(() => window.__n);
  await esc(p, `CTX.mudaMes(-1);`);
  r.diasTrocaMes = await p.evaluate(() => {
    const agora = Array.from(document.querySelectorAll('.dc-c, [class*="dc-"]')).slice(0, 40);
    let iguais = 0; window.__cel.forEach(function (n) { if (n.isConnected) iguais++; });
    return { nosAntes: window.__cel.length, aindaNaPagina: iguais, scrollY: scrollY };
  });
  r.diasAnim = await p.evaluate(animando);

  // 7 · Modo de sessão: entrar, abrir o exercício, gravar uma série pela régua.
  await esc(p, `CTX.vaiPara('agora');`);
  await p.waitForTimeout(300);
  await p.evaluate(() => scrollTo(0, 300));
  r.antesDoModoY = await p.evaluate(() => scrollY);
  await esc(p, `diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); render();`);
  r.entraModo = await p.evaluate(animando);
  r.entraModoY = await p.evaluate(() => scrollY);
  await esc(p, `toggle(0);`);
  r.abreExercicio = { anim: await p.evaluate(animando), y: await p.evaluate(() => scrollY) };
  await esc(p, `anotaSerie(0, 0, 0, 40); abreRegua(0, 0); render();`);
  await p.waitForTimeout(200);
  r.abreRegua = await p.evaluate(animando);
  const v = await p.$$('.regua-v');
  if (v.length) await v[1].click();
  await p.waitForTimeout(60);
  r.seriaGravadaLogo = await p.evaluate(animando);
  r.timer = await p.evaluate(() => {
    const t = document.getElementById('timer'), f = document.getElementById('tfill');
    return { display: getComputedStyle(t).display, fillTransition: getComputedStyle(f).transition, fillTransform: f.style.transform };
  });
  await p.waitForTimeout(600);
  r.timerContando = await p.evaluate(animando);
  await p.screenshot({ path: OUT + '/modo-serie-gravada.png' });

  // 8 · Teclado próprio: abrir rola a página (foco sem preventScroll)?
  await p.evaluate(() => scrollTo(0, 0));
  r.antesTecladoY = await p.evaluate(() => scrollY);
  await esc(p, `abreTecladoDeCarga(0, 1);`);
  await p.waitForTimeout(250);
  r.tecladoY = await p.evaluate(() => ({ y: scrollY, foco: document.activeElement && document.activeElement.className, topoDoTeclado: (document.querySelector('.tcl') || { getBoundingClientRect: () => ({}) }).getBoundingClientRect().top }));

  // 9 · Sair do modo: devolve a rolagem de onde se entrou?
  await esc(p, `CTX.fechaTeclado ? CTX.fechaTeclado() : fechaTeclado(); CTX.fechaModoDeSessao();`);
  await p.waitForTimeout(150);
  r.saiModo = { anim: await p.evaluate(animando), y: await p.evaluate(() => scrollY) };

  r.erros = erros;
  await ctx.close();
}

// ------------------------------------------------------- movimento reduzido ----
{
  const { ctx, p, erros } = await abre(true);
  const r = R.reduz = {};
  r.indicador = await p.evaluate(() => getComputedStyle(document.querySelector('.ins-tab-ind')).transition);
  await esc(p, `CTX.vaiPara('semana');`);
  r.trocaAba = await p.evaluate(animando);
  await esc(p, `CTX.vaiPara('agora'); diaDeComida().cadencia = 'treino'; CTX.abreTreinoDeHoje(); render();`);
  await p.waitForTimeout(200);
  r.pontoAoVivo = await p.evaluate(() => {
    const d = document.querySelector('.ins-live-dot');
    if (!d) return null;
    const c = getComputedStyle(d);
    return { dur: c.animationDuration, iter: c.animationIterationCount, opacidade: c.opacity };
  });
  r.anim = await p.evaluate(animando);
  r.erros = erros;
  await ctx.close();
}

// ------------------------------------------------------------- bancada ----
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(120);
  R.bancada = { anim: await p.evaluate(animando), palco: await p.evaluate(() => document.documentElement.dataset.palco || null), erros };
  await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + '/bancada.png' });
  await ctx.close();
}

console.log(JSON.stringify(R, null, 1));
await b.close();
