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
// Peça 7: antes disso, com nenhum aviso na tela, um aviso chega e, 40 ms depois,
// o cronômetro entra (e, noutro, sai): `cronometroEntraNoMeio`/`SaiNoMeio`.
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
    // A mensagem: desde a peça 7, `#toast` é o LUGAR (sempre na página, vazio sem
    // aviso) e a mensagem é `#toast > .aviso`; antes, a mensagem era o próprio
    // `#toast`, com `display: none` quando não havia aviso.
    const msg = () => { const t = document.getElementById('toast'); if (!t) return null;
      return t.querySelector(':scope > .aviso:not(.sai)') || t.querySelector(':scope > .aviso') || (getComputedStyle(t).display !== 'none' && t.textContent.trim() ? t : null); };
    const caixa = s => { const e = typeof s === 'string' ? document.querySelector(s) : s(); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { y: Math.round(r.y * 10) / 10, fundo: Math.round(r.bottom * 10) / 10, op: Math.round(+cs.opacity * 100) / 100,
               vis: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.01 }; };
    const q = []; const t0 = performance.now();
    q.push({ t: 0, toast: caixa(msg), timer: caixa('#timer') });
    window.__escopo(acao);
    (function passo() {
      requestAnimationFrame(() => {
        const t = performance.now() - t0;
        q.push({ t: Math.round(t), toast: caixa(msg), timer: caixa('#timer') });
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
// Peça 7: o cronômetro entra ou sai NO MEIO da entrada do aviso (40 ms depois
// de ele chegar). O aviso não pode saltar: a mensagem sobe os 8 px dela dentro
// do lugar que anda com o cronômetro. Feitos primeiro, sem aviso na tela.
await p.waitForTimeout(4500);
const entraNoMeio = await trilha(`toast('O cronômetro entra no meio deste aviso.'); setTimeout(function () { startTimer(90, 'descanso · série 1 · teste'); }, 40);`, 700);
res.cronometroEntraNoMeio = { toast: resume(entraNoMeio, 'toast'), cronometro: resume(entraNoMeio, 'timer'), opacidade: entraNoMeio.filter(x => x.toast).map(x => [x.t, x.toast.op]).slice(0, 14) };
await p.waitForTimeout(9000);
const saiNoMeio = await trilha(`toast('O cronômetro sai no meio deste aviso.'); setTimeout(function () { stopTimer(); }, 40);`, 700);
res.cronometroSaiNoMeio = { toast: resume(saiNoMeio, 'toast'), cronometro: resume(saiNoMeio, 'timer'), opacidade: saiNoMeio.filter(x => x.toast).map(x => [x.t, x.toast.op]).slice(0, 14) };
// Peça 7: a saída. Um aviso curto e, quando ele começa a sair (a mensagem ganha
// `.sai`; antes, o `#toast` fica `display: none`), a opacidade, a altura e as
// animações dela quadro a quadro.
res.saida = await p.evaluate(() => new Promise(ok => {
  window.__escopo(`toast('Ajuste salvo.');`);
  const t = document.getElementById('toast'); const t00 = performance.now();
  const saiu = () => getComputedStyle(t).display === 'none' || !!t.querySelector(':scope > .aviso.sai') || (!t.querySelector(':scope > .aviso') && !t.textContent.trim());
  (function espera() {
    if (!saiu()) { if (performance.now() - t00 > 9000) return ok({ erro: 'o aviso não saiu' }); return requestAnimationFrame(espera); }
    const q = [], t0 = performance.now(), ficouMs = Math.round(t0 - t00);
    (function passo() {
      const a = t.querySelector(':scope > .aviso') || (getComputedStyle(t).display !== 'none' && t.textContent.trim() ? t : null);
      q.push(a ? { t: Math.round(performance.now() - t0), op: Math.round(+getComputedStyle(a).opacity * 100) / 100, y: Math.round(a.getBoundingClientRect().y * 10) / 10,
                   anims: a.getAnimations().map(x => (x.animationName || x.transitionProperty) + ' ' + x.effect.getTiming().duration) } : { t: Math.round(performance.now() - t0), op: null });
      if (q.length < 16) requestAnimationFrame(passo); else ok({ ficouMs, quadros: q });
    })();
  })();
}));
await p.waitForTimeout(600);
res.trilhasNoMeio = { entra: entraNoMeio.map(x => [x.t, x.toast && x.toast.y, x.toast && x.toast.op, x.timer && x.timer.y]), sai: saiNoMeio.map(x => [x.t, x.toast && x.toast.y, x.toast && x.toast.op, x.timer && x.timer.y]) };
await p.waitForTimeout(9000);
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
console.log(ROTULO, 'no meio, entra: toast', JSON.stringify(res.cronometroEntraNoMeio.toast), '| sai: toast', JSON.stringify(res.cronometroSaiNoMeio.toast));
await ab.b.close();
