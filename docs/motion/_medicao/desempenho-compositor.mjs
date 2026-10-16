// O experimento do motor: uma animação está no meio e a thread principal trava
// 300 ms (o que um render() pesado, um JSON.stringify do registro ou a criação do
// AudioContext fazem). A animação congela ou continua?
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   node docs/motion/_medicao/desempenho-compositor.mjs x docs/motion/_medicao/shots/desempenho
//   (CHROME=... para o Chromium; MOTOR=webkit + LD_PRELOAD para o WebKit; precisa do ffmpeg do sistema)
//
// Não usa o app: é uma página em branco com UMA caixa, para que nada mais mude
// na tela. A mesma caixa anda 300 px em 1 s, linear — uma vez por `left`, outra
// por `transform`. Aos 350 ms a thread principal fica ocupada 300 ms. A página é
// gravada em vídeo (25 quadros/s, gravação do próprio Playwright, que copia o que
// o compositor entrega); em cada quadro o ffmpeg lê uma linha de pixels e acha a
// borda da caixa. Durante o movimento, quadros com a caixa no mesmo lugar = a
// caixa parada na tela. A medida é a MAIOR parada no meio do movimento, em ms.
import { chromium, webkit } from '../../../node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SAIDA = process.argv[3] || 'docs/motion/_medicao/shots/desempenho';
const MOTOR = process.env.MOTOR === 'webkit' ? 'webkit' : 'chromium';
const tipo = MOTOR === 'webkit' ? webkit : chromium;
const pasta = path.join(SAIDA, 'video-' + MOTOR);
fs.mkdirSync(pasta, { recursive: true });

const PAGINA = prop => `<!doctype html><meta name=viewport content="width=device-width">
<style>html,body{margin:0;background:#fff}#c{position:absolute;top:120px;left:0;width:60px;height:60px;background:#3b2fd6;
transition:${prop} 1000ms linear}</style><div id=c></div>`;

async function roda(prop) {
  const b = await tipo.launch(MOTOR === 'webkit' ? {} : { executablePath: process.env.CHROME });
  const ctx = await b.newContext({ viewport: { width: 414, height: 300 }, recordVideo: { dir: pasta, size: { width: 414, height: 300 } } });
  const p = await ctx.newPage();
  await p.setContent(PAGINA(prop));
  await p.waitForTimeout(800);
  await p.evaluate(prop => {
    const c = document.getElementById('c');
    c.getBoundingClientRect();
    if (prop === 'left') c.style.left = '300px'; else c.style.transform = 'translateX(300px)';
    setTimeout(() => { const t = performance.now(); while (performance.now() - t < 300) {} }, 350);
  }, prop);
  await p.waitForTimeout(1600);
  const video = await p.video().path();
  await ctx.close(); await b.close();
  const final = path.join(pasta, prop + '.webm');
  fs.renameSync(video, final);
  // A posição da caixa em cada quadro: uma linha de pixels (y = 150) em tons de
  // cinza; a borda esquerda da caixa é o primeiro pixel escuro.
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', final, '-vf', 'fps=25,crop=414:2:0:150,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
  const pos = [];
  for (let i = 0; i + 828 <= raw.length; i += 828) { let x = -1; for (let j = 0; j < 414; j++) if (raw[i + j] < 128) { x = j; break; } pos.push(x); }
  // o movimento: do primeiro quadro fora do ponto de partida ao primeiro no ponto final
  const ini = pos.findIndex(x => x > 2);
  const fim = pos.findIndex((x, i) => i > ini && x >= 298);
  let maior = 0, run = 1;
  for (let i = ini + 1; i <= fim; i++) { if (Math.abs(pos[i] - pos[i - 1]) <= 1) { run++; maior = Math.max(maior, run); } else run = 1; }
  const md5 = pos;
  return { prop, quadrosNoMovimento: fim - ini + 1, movimentoMs: (fim - ini + 1) * 40, maiorParadaMs: maior * 40, posicoes: pos.slice(Math.max(0, ini - 1), fim + 2).join(' '), video: final };
}

const r = [await roda('left'), await roda('transform')];
console.table(r);
fs.writeFileSync(path.join(SAIDA, 'compositor-' + MOTOR + '.json'), JSON.stringify({ motor: MOTOR, resultado: r }, null, 2));
