// Os movimentos que já existem, medidos quadro a quadro: o indicador de aba
// (`left`), a barra do cronômetro (`scaleX` + texto), a folha (que abre sem
// movimento) — e um experimento: o que um render() pesado faz com uma animação
// de `left` e com uma de `transform` que está no meio.
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-movimentos.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//
// Em cada janela: os intervalos entre quadros vistos por requestAnimationFrame
// (todo intervalo > 25 ms é um quadro perdido a 60 Hz), os contadores do CDP
// (LayoutCount, RecalcStyleCount, durações) e, no Chromium, um traço do motor
// (Tracing) de onde saem: quantos Layout, Paint e quadros desenhados houve, e se
// cada animação CSS rodou no compositor ou caiu para a thread principal (evento
// "Animation" com `compositeFailed`/`unsupportedProperties`).
import { abre, escopo, grava, metricas, diferenca, mediana, maximo, MOTOR, LENTO } from './desempenho-comum.mjs';
import fs from 'node:fs';

const { b, p, cdp, erros } = await abre();
const chromium = MOTOR === 'chromium';

const CATS = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame',
  'blink.animations', 'cc', 'viz', 'benchmark'];

/** Lê um traço e conta o que importa para movimento. */
function leTraco(buf, nome) {
  const j = JSON.parse(buf.toString());
  const ev = j.traceEvents || j;
  fs.writeFileSync(`${process.argv[3] || 'docs/motion/_medicao/shots/desempenho'}/traco-${nome}-${MOTOR}${LENTO > 1 ? '-lento' + LENTO : ''}.json`, buf);
  const conta = n => ev.filter(e => e.name === n && (e.ph === 'X' || e.ph === 'B' || e.ph === 'I' || e.ph === 'i' || e.ph === 'n')).length;
  const soma = n => Math.round(ev.filter(e => e.name === n && e.ph === 'X').reduce((s, e) => s + (e.dur || 0), 0) / 100) / 10;
  const anim = ev.filter(e => e.name === 'Animation' && e.args && e.args.data)
    .map(e => ({ id: e.id2 && (e.id2.local || e.id2.global) || e.id, nome: e.args.data.name || e.args.data.nodeName || '',
                 falha: e.args.data.compositeFailed, props: e.args.data.unsupportedProperties }))
    .filter(a => a.falha !== undefined || a.props);
  return {
    layout: conta('Layout'), layoutMs: soma('Layout'),
    estilo: conta('UpdateLayoutTree'), estiloMs: soma('UpdateLayoutTree'),
    paint: conta('Paint'), paintMs: soma('Paint'),
    quadrosDesenhados: conta('DrawFrame'),
    animacoes: anim
  };
}

async function janela(nome, acao, ms) {
  if (chromium) await b.startTracing(p, { categories: CATS });
  const m0 = await metricas(cdp);
  await p.evaluate(() => { window.__para = window.__m.gravaQuadros(); window.__d0 = window.__m.desloc.length; });
  await acao();
  await p.waitForTimeout(ms);
  const q = await p.evaluate(() => ({ q: window.__para(), d: window.__m.desloc.slice(window.__d0) }));
  const m1 = await metricas(cdp);
  const tr = chromium ? leTraco(await b.stopTracing(), nome) : null;
  const perdidos = q.q.filter(x => x > 25).length;
  return {
    nome, janelaMs: ms, quadros: q.q.length, perdidos, piorQuadroMs: maximo(q.q), medianaMs: mediana(q.q),
    cdp: diferenca(m0, m1), traco: tr,
    deslocamento: Math.round(q.d.reduce((s, x) => s + x.v, 0) * 1000) / 1000,
    deslocamentoForaDoToque: Math.round(q.d.filter(x => !x.input).reduce((s, x) => s + x.v, 0) * 1000) / 1000
  };
}

const neutro = () => escopo(p, `
  for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada();
  stopTimer(); CTX.vaiPara('agora'); render();`);

const res = [];
// Aquecimento: cada tela e a folha uma vez antes de medir. A primeira entrada, a
// frio, é medida em desempenho-render.mjs; aqui interessa o quadro a quadro de
// um movimento que o usuário repete.
for (const a of ['semana', 'dias', 'corpo', 'prescricao', 'agora']) { await escopo(p, `CTX.vaiPara('${a}'); render(); document.body.offsetHeight;`); await p.waitForTimeout(100); }
{
  const id0 = await escopo(p, `planoDeComida().filter(r => !diaDeComida().done[r.id])[3].id`);
  await escopo(p, `CTX.abreRefeicao('${id0}'); render(); document.body.offsetHeight;`); await p.waitForTimeout(150);
  await escopo(p, `CTX.abreTreinoDeHoje(); render(); document.body.offsetHeight;`); await p.waitForTimeout(150);
}
await neutro(); await p.waitForTimeout(300);

// A) Troca de aba por toque: o render da aba nova + o indicador deslizando em `left`.
res.push(await janela('aba-toque-agora-semana', () => p.locator('.ins-tab').nth(3).tap(), 500));
await neutro(); await p.waitForTimeout(300);
res.push(await janela('aba-toque-agora-dias', () => p.locator('.ins-tab').nth(1).tap(), 500));
await neutro(); await p.waitForTimeout(300);

// B) Só o indicador, sem render: o custo por quadro de animar `left`.
res.push(await janela('indicador-so-left', () => p.evaluate(() => {
  document.querySelector('.ins-tab-ind').style.left = '80%';
}), 400));
await neutro(); await p.waitForTimeout(300);
// B') O mesmo deslocamento em `transform` (controle; não existe no app).
res.push(await janela('indicador-controle-transform', () => p.evaluate(() => {
  const el = document.querySelector('.ins-tab-ind');
  el.style.transition = 'transform var(--ins-dur) var(--ins-ease)';
  el.style.transform = 'translateX(400%)';
}), 400));
await neutro(); await p.evaluate(() => { const el = document.querySelector('.ins-tab-ind'); el.style.transition = ''; el.style.transform = ''; });
await p.waitForTimeout(300);

// C) A barra do cronômetro contando, 2 s: scaleX a cada 250 ms e o número.
await escopo(p, `CTX.abreTreinoDeHoje(); render();`);
await p.waitForTimeout(300);
res.push(await janela('cronometro-2s', () => escopo(p, `startTimer(90, 'descanso · série 1 · teste')`), 2000));
await neutro(); await p.waitForTimeout(300);

// D) Abrir e fechar a folha da refeição ("outra porção", na linha aberta), com a
//    página rolada: hoje ela aparece e some sem movimento. Confere também se o
//    fechar devolve a rolagem de antes (a trava do corpo em folha.jsx).
const idRef = await escopo(p, `planoDeComida().filter(r => !diaDeComida().done[r.id])[3].id`);
await escopo(p, `CTX.abreLinhaDaComida('${idRef}')`);
await p.locator(`[data-a="porcao-${idRef}"]`).evaluate(e => e.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(200);
const rolagemAntes = await p.evaluate(() => Math.round(window.scrollY));
res.push(await janela('folha-abre', () => p.locator(`[data-a="porcao-${idRef}"]`).tap(), 400));
res.push(await janela('folha-fecha', () => p.locator('.ins-folha-b[aria-label="fechar"]').tap(), 400));
const rolagemDepois = await p.evaluate(() => Math.round(window.scrollY));
await neutro(); await p.waitForTimeout(300);

// E) O experimento: um render() pesado (120 ms de thread principal ocupada) cai
//    60 ms depois de uma animação de 300 ms começar. Mesma caixa, mesmo
//    deslocamento; uma em `left`, outra em `transform`. Quantos quadros o
//    motor desenha enquanto a thread principal está presa?
async function experimento(prop) {
  await p.evaluate(prop => {
    const el = document.createElement('div');
    el.id = 'cobaia';
    el.style.cssText = 'position:fixed;top:200px;left:0;width:80px;height:40px;background:#3b2fd6;z-index:99;' +
      (prop === 'left' ? 'transition:left 300ms linear;' : 'transition:transform 300ms linear;');
    document.body.appendChild(el);
    el.getBoundingClientRect();
  }, prop);
  await p.waitForTimeout(100);
  const r = await janela('bloqueio-' + prop, () => p.evaluate(prop => {
    const el = document.getElementById('cobaia');
    if (prop === 'left') el.style.left = '300px'; else el.style.transform = 'translateX(300px)';
    setTimeout(() => { const t = performance.now(); while (performance.now() - t < 120) {} }, 60);
  }, prop), 500);
  await p.evaluate(() => document.getElementById('cobaia').remove());
  return r;
}
res.push(await experimento('left'));
res.push(await experimento('transform'));

console.table(res.map(r => ({
  janela: r.nome, quadros: r.quadros, perdidos: r.perdidos, pior: r.piorQuadroMs,
  layouts: r.cdp ? r.cdp.LayoutCount : (r.traco ? r.traco.layout : 'n/d'),
  estilos: r.cdp ? r.cdp.RecalcStyleCount : 'n/d',
  layoutMs: r.cdp ? r.cdp.LayoutDuration : 'n/d',
  paints: r.traco ? r.traco.paint : 'n/d',
  desenhados: r.traco ? r.traco.quadrosDesenhados : 'n/d',
  desloc: r.deslocamento
})));
res.forEach(r => { if (r.traco && r.traco.animacoes.length) console.log(r.nome, JSON.stringify(r.traco.animacoes.slice(0, 4))); });
console.log('rolagem antes de abrir a folha / depois de fechar:', rolagemAntes, rolagemDepois);
const arq = grava('movimentos', { motor: MOTOR, cpuLenta: LENTO, janelas: res, rolagemAntesDaFolha: rolagemAntes, rolagemDepoisDaFolha: rolagemDepois, erros });
console.log(JSON.stringify({ erros }), 'gravado em', arq);
await b.close();
