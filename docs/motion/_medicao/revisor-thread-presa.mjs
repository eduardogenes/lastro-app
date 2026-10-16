// O movimento real congela quando a thread principal trava? (04 §6, terceira
// linha: "parada de 0 ms com a thread presa"; o experimento de
// desempenho-compositor.mjs, aplicado ao elemento do app.)
//
// Cena "fio" (peça 0): a troca de aba Agora → Prescrição; dois quadros depois
// de o fio começar a andar, a thread principal fica presa 150 ms. Cada quadro
// da captura (`page.screencast`) é lido numa faixa da barra de abas (y 846–858)
// e o fio é achado pela cor de acento (azul forte). Mede-se a posição do fio em
// cada quadro e a MAIOR PARADA no meio do movimento: o tempo em que ele ficou no
// mesmo lugar sem ter chegado. Em `transform` (compositor) a parada tem de ser
// 0; em `left` (thread principal) ele para enquanto a thread está presa.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//   REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-thread-presa.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs; REPETE=3)
//
// Escreve <pasta>/thread-presa-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const { jpegjs } = await import('../../../node_modules/playwright-core/lib/utilsBundle.js').then(m => m.default || m);
const ab = await abreMotor();
const registro = await abreApp(ab.p);
const p = ab.p;
const REPETE = Number(process.env.REPETE || 3);

/** x da borda esquerda e direita do fio (CSS px) num quadro, ou null: a corrida
 * azul mais longa da faixa (o fio tem 83 px; letra azul dá corrida curta). */
function fio(buf) {
  const im = jpegjs.decode(buf, { useTArray: true });
  const k = im.width / 414;
  let melhor = null;
  for (let y = Math.round(846 * k); y <= Math.round(858 * k); y++) {
    let ini = -1;
    for (let x = 0; x <= im.width; x++) {
      let azul = false;
      if (x < im.width) { const i = (y * im.width + x) * 4, r = im.data[i], g = im.data[i + 1], b = im.data[i + 2]; azul = b > 120 && b - r > 40 && b - g > 40; }
      if (azul && ini < 0) ini = x;
      if (!azul && ini >= 0) { if (!melhor || x - ini > melhor[1] - melhor[0]) melhor = [ini, x]; ini = -1; }
    }
  }
  return melhor && (melhor[1] - melhor[0]) / k >= 40 ? [Math.round(melhor[0] / k), Math.round(melhor[1] / k)] : null;
}

const rodadas = [];
for (let n = 0; n < REPETE; n++) {
  await recarrega(p, registro, '07:10');
  await escopo(p, `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`);
  await p.waitForTimeout(600);
  const q = [];
  await p.screencast.start({ size: { width: 414, height: 896 }, quality: 90, onFrame: f => { q.push({ ts: f.timestamp, d: f.data }); } });
  await p.waitForTimeout(400);
  const marca = await p.evaluate(() => {
    const t0 = performance.timeOrigin + performance.now();
    window.__escopo(`CTX.vaiPara('prescricao'); render();`);
    let presa = null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const t = performance.now(); presa = performance.timeOrigin + t;
      while (performance.now() - t < 150) {}
      window.__presa = [presa, performance.timeOrigin + performance.now()];
    }));
    return t0;
  });
  await p.waitForTimeout(900);
  await p.screencast.stop();
  const presa = await p.evaluate(() => window.__presa);
  // posições por quadro (tempo relativo à troca; no WebKit o carimbo é
  // monotônico, então a referência é o primeiro quadro que muda de posição)
  const pos = q.map(x => ({ t: x.ts, f: fio(x.d) })).filter(x => x.f);
  const x0 = pos.length ? pos[0].f[0] : null;
  const xf = pos.length ? pos[pos.length - 1].f[0] : null;
  // o começo: o primeiro quadro fora do lugar de partida; a chegada: o primeiro
  // a até 3 px do lugar final
  const ini = pos.findIndex(x => Math.abs(x.f[0] - x0) > 1);
  const fim = pos.findIndex((x, i) => i >= ini && Math.abs(x.f[0] - xf) <= 3);
  let maior = 0;
  // parada: o intervalo, ANTES da chegada, entre dois quadros com o fio no mesmo
  // lugar, ou um buraco > 34 ms entre quadros (a captura só manda quadro quando
  // algo muda). Conta também o intervalo entre o último quadro parado na
  // partida e o primeiro em movimento (o fio que não sai do lugar)
  for (let i = Math.max(ini, 1); i <= fim && i > 0; i++) {
    const dt = pos[i].t - pos[i - 1].t;
    if (Math.abs(pos[i].f[0] - pos[i - 1].f[0]) <= 1 || dt > 34) maior = Math.max(maior, Math.round(dt));
  }
  rodadas.push({
    n, quadros: q.length, quadrosComFio: pos.length,
    movimentoMs: ini >= 0 && fim > ini ? Math.round(pos[fim].t - pos[ini].t) : null,
    maiorParadaMs: maior,
    caminho: pos.slice(Math.max(0, ini - 1), fim + 2).map(x => [Math.round(x.t - (pos[ini] ? pos[ini].t : 0)), x.f[0]]),
    threadPresaMs: presa ? Math.round(presa[1] - presa[0]) : null
  });
}
const saida = { motor: MOTOR, rotulo: ROTULO, cena: 'fio da aba, Agora → Prescrição, thread presa 150 ms dois quadros depois de começar', rodadas,
  maiorParadaMs: Math.max(...rodadas.map(r => r.maiorParadaMs)) };
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'thread-presa-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(saida, null, 1));
console.log(ROTULO, 'maior parada', saida.maiorParadaMs, 'ms;', rodadas.map(r => `${r.movimentoMs} ms de movimento, parada ${r.maiorParadaMs}`).join(' | '), '→', arq);
await ab.b.close();
