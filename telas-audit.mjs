// Auditoria visual: dirige o app num iPhone 14 e captura cada tela.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const OUT = process.argv[2] || '/tmp/telas';
const URL = 'http://127.0.0.1:5173/';
fs.mkdirSync(OUT, { recursive: true });

const DIA = 86400000;
const agora = Date.now();

// Estado realista: seis semanas de treino, peso subindo devagar, cintura estável.
function estado() {
  const logs = {}, done = [];
  const rot = ['A', 'B', 'C', 'D', 'E', 'F'];
  const ex = {
    A: ['chest-press-inclinado-convergente', 'crossover-de-baixo-para-cima', 'elevacao-lateral-na-maquina'],
    B: ['pulldown-convergente', 'pulldown-unilateral', 'reverse-pec-deck'],
    C: ['pendulum-squat', 'leg-press', 'cadeira-extensora'],
    D: ['remada-convergente-com-apoio-de-peito', 'supino-inclinado-no-smith'],
    E: ['desenvolvimento-na-maquina', 'elevacao-lateral-na-maquina'],
    F: ['terra-romeno-com-halteres', 'mesa-flexora']
  };
  for (let s = 30; s >= 1; s--) {
    const t = agora - s * DIA * 1.2;
    const d = rot[(30 - s) % 6];
    done.push({ day: d, t, sid: t, dur: (48 + (s % 9)) * 60000, hora: 1, ini: 'manual', fim: 'manual' });
    (ex[d] || []).forEach((k, i) => {
      const base = 40 + i * 15 + Math.floor((30 - s) / 4) * 2.5;
      (logs[k] = logs[k] || []).push({
        t, sid: t, sets: [[base, 9], [base, 8], [base, 8]]
      });
    });
  }
  const peso = [], cintura = [];
  for (let k = 42; k >= 0; k--) {
    if (k % 2 === 0) peso.push({ t: agora - k * DIA, v: Math.round((73 + (42 - k) * 0.03) * 10) / 10 });
    if (k % 7 === 0) cintura.push({ t: agora - k * DIA, v: Math.round((81 + (42 - k) * 0.02) * 10) / 10 });
  }
  return {
    logs, done, plano: 5, deload: false, draft: null, sessao: null,
    cardio: [{ t: agora - DIA, m: 'bike', min: 25, i: 'moderado' }],
    body: { peso, cintura }, carga: {}, export: agora - 12 * DIA,
    prog: null, rot: null, ex: {}, mods: null, progLog: []
  };
}

const TELAS = [
  { n: '01-hoje', vai: a => a.aba('hoje') },
  { n: '02-hoje-fim', vai: a => a.aba('hoje'), rolar: 'fim' },
  { n: '03-treino', vai: a => a.aba('treino') },
  { n: '04-treino-aberto', vai: a => { a.aba('treino'); a.E('toggle(0)'); } },
  { n: '05-treino-fim', vai: a => a.aba('treino'), rolar: 'fim' },
  { n: '06-comida-plano', vai: a => a.aba('comida') },
  { n: '07-comida-alimentos', vai: a => { a.aba('comida'); a.clique('.ins-chips .ins-chip:nth-child(2)'); } },
  { n: '08-comida-compras', vai: a => { a.aba('comida'); a.clique('.ins-chips .ins-chip:nth-child(3)'); } },
  { n: '09-dados', vai: a => a.aba('dados') },
  { n: '10-dados-fim', vai: a => a.aba('dados'), rolar: 'fim' },
  { n: '11-guia', vai: a => a.aba('guia') },
  { n: '12-guia-fim', vai: a => a.aba('guia'), rolar: 'fim' },
  { n: '13-folha-refeicao', vai: a => { a.aba('hoje'); a.clique('.ins-tl .ins-tl-toque'); } },
  { n: '14-folha-dia', vai: a => { a.aba('hoje'); a.clique('.ins-cab .ins-estado'); } },
  { n: '15-programa', vai: a => { a.aba('treino'); a.E('abrirPrograma(null)'); } },
  { n: '16-historico', vai: a => { a.aba('treino'); a.E('openHist(0)'); } },
  { n: '16b-historico-edicao', vai: a => { a.aba('treino'); a.E('openHist(0)'); a.E('editarSessao(S.logs["chest-press-inclinado-convergente"].length-1)'); } },
  { n: '16c-historico-vazio', vazio: true, vai: a => { a.aba('treino'); a.E('openHist(0)'); } },
  { n: '19-decisao', vai: a => { a.aba('treino'); a.E('iniciarSessao()'); a.E('toggle(0)');
      a.E('[0,1,2].forEach(function(k){ ["w0_"+k,"r0_"+k].forEach(function(id,n){ var e=document.getElementById(id); if(!e) return; e.value = n?"10":"40"; e.dispatchEvent(new Event("input",{bubbles:true})); }); })');
      a.E('toggle(0)'); a.E('modoEdicao(true)'); a.E('mudaSeries(2, 1)'); a.E('modoEdicao(false)'); a.E('finalizarSessao()'); } },
  { n: '20-retro', vai: a => { a.aba('dados'); a.E('abrirRetro()'); } },
  { n: '17-hoje-vazio', vazio: true, vai: a => a.aba('hoje') },
  { n: '18-treino-vazio', vazio: true, vai: a => a.aba('treino') }
];

const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });

for (const tela of TELAS) {
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const p = await ctx.newPage();
  p.on('dialog', d => d.accept());

  if (!tela.vazio) {
    await p.addInitScript(`localStorage.setItem('treino-eduardo-v1', ${JSON.stringify(JSON.stringify(estado()))})`);
  }
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);

  // executa a navegação da tela dentro da página
  const acoes = { aba: a => `CTX.vaiPara(${JSON.stringify(a)})`, E: c => c, clique: null };
  const passos = [];
  tela.vai({
    aba: a => passos.push({ k: 'eval', v: `CTX.vaiPara(${JSON.stringify(a)})` }),
    E: c => passos.push({ k: 'eval', v: c }),
    clique: s => passos.push({ k: 'click', v: s })
  });
  for (const passo of passos) {
    if (passo.k === 'eval') await p.evaluate(v => window.__escopo(v), passo.v);
    else { const el = await p.$(passo.v); if (el) await el.click(); }
    await p.waitForTimeout(250);
  }

  if (tela.rolar === 'fim') {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(300);
  }

  await p.screenshot({ path: `${OUT}/${tela.n}.png` });

  // mede o que a imagem não mostra
  const m = await p.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth > doc.clientWidth;
    const pequenos = [...document.querySelectorAll('button, a, input, textarea, [role=button]')]
      .filter(e => e.offsetParent !== null)
      .map(e => ({ t: (e.textContent || e.tagName).trim().slice(0, 24), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) }))
      .filter(x => x.h > 0 && x.h < 28);
    return {
      alturaTotal: document.body.scrollHeight,
      overflowX: overflow ? doc.scrollWidth - doc.clientWidth : 0,
      alvosPequenos: pequenos.slice(0, 6),
      textoUndefined: /undefined|NaN|\[object/.test(document.body.textContent)
    };
  });
  console.log(JSON.stringify({ tela: tela.n, ...m }));
  await ctx.close();
}

await b.close();
