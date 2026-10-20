// O toast e a faixa acompanham o cronômetro, ou saltam? (peça 3; 03 §4.3: hoje
// o toast cai 82 px num quadro quando o descanso entra ou sai.)
//
// No modo de sessão, com uma sessão aberta e um toast na tela, o descanso
// começa (`startTimer`) e, 700 ms depois, para (`stopTimer`). A cada quadro
// (`requestAnimationFrame`) a página anota onde estão o toast e o cronômetro
// (`getBoundingClientRect`, que já inclui `transform` e `translate`). Mede-se o
// MAIOR PASSO de cada um entre dois quadros seguidos, a posição final e quanto
// tempo o movimento levou. Salto = um passo do tamanho do caminho inteiro.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//   REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-aviso-passo.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs; REDUZ=1)
//
// Escreve <pasta>/aviso-passo-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const p = ab.p;
await recarrega(p, registro, '07:10');
await escopo(p, `
  const ag = Date.now() - 1800000, dd = nextDay();
  S.sessao = { day: dd, inicio: ag, ultima: Date.now() - 60000, sid: ag, manual: 1, pausas: [], pulados: [] };
  S.done.push({ day: dd, t: ag, sid: ag, ini: 'manual' });
  view.day = dd; CTX.abreTreinoDeHoje(); render(); window.scrollTo(0, 0);`);
await p.waitForTimeout(600);

/** Liga a amostragem, roda `acao` no escopo do app e devolve a trilha por quadro. */
async function trilha(acao, ms) {
  return p.evaluate(({ acao, ms }) => new Promise(ok => {
    const caixa = s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { y: Math.round(r.y * 10) / 10, fundo: Math.round(r.bottom * 10) / 10, vis: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.01 }; };
    const q = []; const t0 = performance.now();
    q.push({ t: 0, toast: caixa('#toast'), timer: caixa('#timer') });
    window.__escopo(acao);
    (function passo() {
      requestAnimationFrame(() => {
        const t = performance.now() - t0;
        q.push({ t: Math.round(t), toast: caixa('#toast'), timer: caixa('#timer') });
        if (t < ms) passo(); else ok(q);
      });
    })();
  }), { acao, ms });
}
function resume(q, quem) {
  const v = q.filter(x => x[quem] && x[quem].vis);
  let maior = 0, iniMov = null, fimMov = null;
  for (let i = 1; i < q.length; i++) {
    const a = q[i - 1][quem], b = q[i][quem];
    if (!a || !b) continue;
    const d = Math.abs(b.y - a.y);
    if (d > 0.5) { if (iniMov == null) iniMov = q[i - 1].t; fimMov = q[i].t; }
    maior = Math.max(maior, d);
  }
  const ini = q[0][quem], fim = q[q.length - 1][quem];
  return { yInicio: ini && ini.y, yFim: fim && fim.y, fundoFim: fim && fim.fundo, visivelNoFim: !!(fim && fim.vis),
           caminho: ini && fim ? Math.round(Math.abs(fim.y - ini.y) * 10) / 10 : null,
           maiorPassoPorQuadro: Math.round(maior * 10) / 10, movimentoMs: iniMov != null ? fimMov - iniMov : 0, quadros: q.length, visiveis: v.length };
}

const res = { motor: MOTOR, rotulo: ROTULO };
await escopo(p, `toast('Ajuste salvo.');`);
await p.waitForTimeout(300);
const sobe = await trilha(`startTimer(90, 'descanso · série 1 · teste')`, 700);
res.sobe = { toast: resume(sobe, 'toast'), cronometro: resume(sobe, 'timer') };
await escopo(p, `toast('Ajuste salvo de novo.');`);
await p.waitForTimeout(300);
const desce = await trilha(`stopTimer()`, 700);
res.desce = { toast: resume(desce, 'toast'), cronometro: resume(desce, 'timer') };
res.trilhas = { sobe: sobe.map(x => [x.t, x.toast && x.toast.y, x.timer && x.timer.y]), desce: desce.map(x => [x.t, x.toast && x.toast.y, x.timer && x.timer.y]) };
res.errosDaPagina = ab.erros;
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'aviso-passo-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
console.log(ROTULO, 'sobe: toast', JSON.stringify(res.sobe.toast), '| cronômetro', JSON.stringify(res.sobe.cronometro));
console.log(ROTULO, 'desce: toast', JSON.stringify(res.desce.toast), '| cronômetro', JSON.stringify(res.desce.cronometro));
await ab.b.close();
