// O tempo do toque nas ações frequentes: do toque até a tela atualizada e até o
// dado no disco.
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-toque.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//   (LENTO=4 para a CPU 4× mais lenta; MOTOR=webkit para o WebKit)
//
// Toque de verdade (Playwright `tap`: touchstart/touchend confiáveis → pointerdown,
// pointerup, click). Para cada toque, quatro números:
//   handler  — o trabalho síncrono do app no click (fase de captura → fase de bolha
//              na janela; os handlers do Preact moram nos elementos, no meio);
//   quadro   — do início do click até depois da pintura do quadro seguinte
//              (rAF + setTimeout 0): é o que o dedo espera para ver a resposta;
//   evento   — a duração do click pela Event Timing API (só Chromium; o motor
//              só registra a partir de 16 ms, então "<16" quer dizer abaixo disso);
//   disco    — do início do click até o setItem('lastro-v1') que levou o dado.
// O intervalo entre pointerdown e click não entra: é o tempo do dedo na tela
// (aqui, a latência do Playwright entre touchstart e touchend), não do app.
import { abre, escopo, grava, mediana, maximo, MOTOR, LENTO, DIAS } from './desempenho-comum.mjs';

const { b, p, cdp, erros } = await abre();

const neutro = () => escopo(p, `
  for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada();
  stopTimer(); CTX.vaiPara('agora'); render();`);

/** Toca no seletor e devolve as medidas daquele toque. */
async function toca(sel, { esperaDisco = 0, nth = 0 } = {}) {
  const loc = p.locator(sel).nth(nth);
  await loc.scrollIntoViewIfNeeded();
  await p.waitForTimeout(120);
  const n0 = await p.evaluate(() => ({ t: window.__m.toques.length, e: window.__m.eventos.length, s: window.__m.sets.length,
                                        l: window.__m.longas.length, d: window.__m.desloc.length }));
  await loc.tap();
  await p.waitForFunction(n => window.__m.toques.length > n, n0.t, { timeout: 5000 });
  if (esperaDisco) await p.waitForTimeout(esperaDisco);
  else await p.waitForTimeout(80);
  return p.evaluate(n0 => {
    const M = window.__m;
    const t = M.toques[n0.t];
    const ev = M.eventos.slice(n0.e).filter(e => e.n === 'click' || e.n === 'pointerup' || e.n === 'pointerdown');
    const click = ev.filter(e => e.n === 'click').sort((a, b) => b.dur - a.dur)[0];
    const set = M.sets.slice(n0.s).filter(s => s.t >= t.clickIni)[0];
    return {
      handler: t.clickFim - t.clickIni,
      quadro: t.pinta - t.clickIni,
      evento: click ? click.dur : null,
      eventoProcessa: click ? click.fim - click.ini : null,
      disco: set ? set.t - t.clickIni : null,
      setMs: set ? set.dur : null,
      longas: M.longas.slice(n0.l).map(x => Math.round(x.dur)),
      desloc: M.desloc.slice(n0.d).filter(x => !x.input).map(x => x.v)
    };
  }, n0);
}

const acoes = {};
function anota(nome, m) { (acoes[nome] = acoes[nome] || []).push(m); }

// 1) Trocar de aba, as cinco, duas voltas.
await neutro();
for (let volta = 0; volta < 2; volta++) {
  for (const i of [1, 3, 2, 4, 0]) anota('trocar de aba', await toca('.ins-tab', { nth: i }));
}

// 2) "+1 copo", cinco vezes. Grava na hora (await save() antes do render()).
await neutro();
for (let i = 0; i < 5; i++) anota('+1 copo', await toca('[data-a="agua-mais"]', { esperaDisco: 200 }));

// 3) Marcar refeição: abrir a linha e tocar "comi tudo" (grava com espera de 700 ms).
await neutro();
const ids = await escopo(p, `planoDeComida().map(r => r.id).filter(id => !diaDeComida().done[id]).slice(0, 4)`);
for (const id of ids) {
  const sel = `[data-a="linha-${id}"]`;
  if (!(await p.locator(sel).count())) continue;
  anota('abrir a linha da refeição', await toca(sel));
  if (await p.locator(`[data-a="tudo-${id}"]`).count()) anota('marcar refeição (comi tudo)', await toca(`[data-a="tudo-${id}"]`, { esperaDisco: 1000 }));
}

// 4) Abrir e fechar folha: o tipo do dia, no cabeçalho do Agora.
await neutro();
for (let i = 0; i < 5; i++) {
  anota('abrir folha (tipo do dia)', await toca('[data-a="tipo-do-dia"]'));
  anota('fechar folha (×)', await toca('.ins-folha-b[aria-label="fechar"]'));
}

// 5) Abrir e fechar tela cheia: Ajustes, e o dia aberto a partir de Dias.
await neutro();
for (let i = 0; i < 5; i++) {
  anota('abrir tela cheia (Ajustes)', await toca('[data-a="ajustes"]'));
  anota('fechar tela cheia (‹ Voltar)', await toca('.tc-back'));
}
await escopo(p, `CTX.vaiPara('dias'); render();`);
for (let i = 0; i < 4; i++) {
  anota('abrir dia passado (Dias)', await toca('button.dc:not([disabled]):not(.hoje):not(.futuro)', { nth: 3 + i }));
  anota('fechar tela cheia (‹ Voltar)', await toca('.tc-back'));
}

// 6) Entrar e sair do modo de sessão pelo cartão do Agora.
await neutro();
for (let i = 0; i < 5; i++) {
  anota('entrar no modo de sessão', await toca('button.ins-foco, .ins-foco button'));
  anota('sair do modo de sessão (‹)', await toca('.ins-modo-sair'));
}

// 7) Gravar série pela régua: a carga já anotada, a régua aberta, um toque nas repetições.
await neutro();
await escopo(p, `CTX.abreTreinoDeHoje(); render();`);
// A primeira série de três exercícios: cada toque é uma série NOVA (não correção),
// e por isso dispara o descanso, como no uso real.
for (let e = 0; e < 3; e++) {
  await escopo(p, `stopTimer(); if (view.open !== ${e}) toggle(${e}); anotaSerie(${e}, 0, 0, 40); abreRegua(${e}, 0); render();`);
  await p.waitForTimeout(150);
  anota('gravar série pela régua', await toca('.regua-v', { nth: 1, esperaDisco: 1100 }));
}

const tabela = Object.keys(acoes).map(nome => {
  const v = acoes[nome];
  const ev = v.map(x => x.evento);
  return {
    acao: nome, n: v.length,
    handlerMediana: mediana(v.map(x => x.handler)), handlerMax: maximo(v.map(x => x.handler)),
    quadroMediana: mediana(v.map(x => x.quadro)), quadroMax: maximo(v.map(x => x.quadro)),
    eventoMax: MOTOR === 'chromium' ? (ev.some(x => x != null) ? maximo(ev) : '<16') : 'n/d',
    discoMediana: mediana(v.map(x => x.disco)),
    longasMs: [].concat(...v.map(x => x.longas)).join(' ') || '—',
    deslocamento: Math.round(v.reduce((s, x) => s + x.desloc.reduce((a, c) => a + c, 0), 0) * 1000) / 1000
  };
});
console.table(tabela);
const arq = grava('toque', { motor: MOTOR, cpuLenta: LENTO, diasDeHistorico: DIAS, tabela, bruto: acoes, erros });
console.log(JSON.stringify({ erros }), 'gravado em', arq);
await b.close();
