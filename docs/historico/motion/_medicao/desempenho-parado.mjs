// O que o app faz SOZINHO, sem toque: 5 s parado no Agora (o relógio do Agora
// redesenha a tela inteira a cada segundo) e 5 s no modo de sessão com o
// descanso contando (o cronômetro repinta 4× por segundo). É o "render() no meio
// de uma animação" que acontece sem ninguém pedir.
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-parado.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//   (LENTO=4 para a CPU 4× mais lenta; os contadores do CDP só existem no Chromium)
import { abre, escopo, grava, metricas, diferenca, maximo, MOTOR, LENTO } from './desempenho-comum.mjs';

const { b, p, cdp, erros } = await abre();

async function parado(nome, prepara) {
  await escopo(p, `for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada(); stopTimer(); CTX.vaiPara('agora'); render();`);
  await escopo(p, prepara);
  await p.waitForTimeout(1200);
  // quanto custa cada render() que o Agora faz sozinho: conta os commits do Preact
  await p.evaluate(() => {
    window.__renders = [];
    const app = document.getElementById('app');
    window.__mo = new MutationObserver(() => window.__renders.push(performance.now()));
    window.__mo.observe(app, { subtree: true, characterData: true, childList: true, attributes: true });
    window.__l0 = window.__m.longas.length; window.__f0 = window.__m.loaf.length;
    window.__para = window.__m.gravaQuadros();
  });
  const m0 = await metricas(cdp);
  await p.waitForTimeout(5000);
  const m1 = await metricas(cdp);
  const r = await p.evaluate(() => {
    window.__mo.disconnect();
    const q = window.__para();
    // mutações agrupadas por tarefa (as que caem no mesmo ms são um render só)
    const grupos = new Set(window.__renders.map(t => Math.round(t / 50)));
    return { quadros: q.length, perdidos: q.filter(x => x > 25).length, pior: Math.max.apply(null, q),
             tarefasComMutacao: grupos.size, longas: window.__m.longas.slice(window.__l0).map(x => Math.round(x.dur)) };
  });
  return Object.assign({ nome }, r, { cdp: diferenca(m0, m1) });
}

const res = [
  await parado('Agora parado 5 s', `render();`),
  await parado('modo de sessão, descanso contando, 5 s', `CTX.abreTreinoDeHoje(); toggle(0); render(); startTimer(120, 'descanso · teste');`)
];
console.table(res.map(r => ({ nome: r.nome, quadros: r.quadros, perdidos: r.perdidos, pior: maximo([r.pior]),
  tarefasQueMexemNoDOM: r.tarefasComMutacao, scriptMs: r.cdp ? r.cdp.ScriptDuration : 'n/d', layouts: r.cdp ? r.cdp.LayoutCount : 'n/d',
  layoutMs: r.cdp ? r.cdp.LayoutDuration : 'n/d', estilos: r.cdp ? r.cdp.RecalcStyleCount : 'n/d', longas: r.longas.join(' ') || '—' })));
console.log('gravado em', grava('parado', { motor: MOTOR, cpuLenta: LENTO, res, erros }));
await b.close();
