// O "Não guardei" ignora o toque que vinha para outra coisa? (peça 4, defeito 5:
// o aviso chega ~0,8 s depois do toque, com os botões na zona do polegar.)
//
// No modo, com o aparelho recusando a gravação (o localStorage lança
// QuotaExceededError), uma série é gravada pela régua; a página anota a hora em
// que o aviso aparece. Então o dedo de verdade (toque pelo CDP no Chromium;
// ponteiro no WebKit, como em revisor-comum.mjs) toca "Fechar este aviso":
//   1. 150 ms depois de o aviso chegar → o aviso tem de FICAR (janela de 400 ms);
//   2. 600 ms depois → o aviso tem de FECHAR.
// Também anota se o fundo ficou isolado (`inert`) e onde está o foco.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-aviso-janela.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs)
//
// Escreve <pasta>/aviso-janela-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR, DEDO } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const { p, cdp } = ab;

async function dedo(x, y, segura = 80) {
  if (DEDO === 'toque') {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await p.waitForTimeout(segura);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else { await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(segura); await p.mouse.up(); }
}

async function provoca() {
  await recarrega(p, registro, '07:10');
  await escopo(p, `CTX.abreTreinoDeHoje(); if (view.open !== 0) toggle(0); anotaSerie(0, 0, 0, 40); abreRegua(0, 0); render();`);
  // a carga anotada acima dispara a gravação adiada (700 ms): espera ela sair,
  // senão é ELA que falha e o aviso chega antes do toque da série
  await p.waitForTimeout(1300);
  await p.evaluate(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (k === 'lastro-v1') { const e = new Error('cheio'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); };
    window.__aviso = null;
    new MutationObserver(() => { if (!window.__aviso && document.querySelector('.falhou-w')) window.__aviso = performance.now(); })
      .observe(document.body, { subtree: true, childList: true });
  });
  const v = p.locator('.regua-v').nth(2);
  await v.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const bb = await v.boundingBox();
  const t0 = await p.evaluate(() => performance.now());
  await dedo(Math.round(bb.x + bb.width / 2), Math.round(bb.y + bb.height / 2), 100);
  await p.waitForFunction(() => window.__aviso != null, null, { timeout: 4000 });
  return p.evaluate(t0 => Math.round(window.__aviso - t0), t0);
}

/** Toca "Fechar este aviso" `ms` depois de ele chegar; devolve se o aviso ficou. */
async function tocaFechar(ms) {
  if (!(await p.locator('.falhou-w').count())) return { avisoJaFechado: true };
  const espera = await p.evaluate(ms => Math.max(0, window.__aviso + ms - performance.now()), ms);
  const bb = await p.locator('[data-a="falhou-fecha"]').boundingBox();
  await p.waitForTimeout(espera);
  const t = await p.evaluate(() => Math.round(performance.now() - window.__aviso));
  await dedo(Math.round(bb.x + bb.width / 2), Math.round(bb.y + bb.height / 2));
  await p.waitForTimeout(150);
  return { tocadoAosMs: t, avisoFicou: await p.evaluate(() => !!document.querySelector('.falhou-w')) };
}

const res = { motor: MOTOR, rotulo: ROTULO, dedo: DEDO };
res.msAteOAviso = await provoca();
res.isolamento = await p.evaluate(() => {
  const fora = [...document.querySelectorAll('button, [tabindex]')].filter(e => !e.closest('.falhou-w') && e.getBoundingClientRect().width);
  return { focaveisForaDoAviso: fora.length, foraInertes: fora.filter(e => e.closest('[inert]')).length,
           timerInerte: !!(document.querySelector('#timer') && document.querySelector('#timer').closest('[inert]')),
           foco: document.activeElement ? (document.activeElement.textContent || '').trim().slice(0, 30) : null };
});
res.cedo = await tocaFechar(150);
res.depois = await tocaFechar(600);
// Defeito 4 (peça 5): fechado o aviso, a faixa "Não guardado" fica no topo. Ela
// cobre a seta de sair do modo, a hora e o `···`? (o que está sob o centro de
// cada um, e a sobreposição das caixas)
await p.waitForTimeout(300);
res.faixa = await p.evaluate(() => {
  const cx = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null; };
  const f = document.querySelector('.ng-faixa');
  const sob = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null;
    const a = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { alvo: sel, oQueEstaNoCentro: a ? (a.closest(sel) ? 'o próprio' : (a.className || a.tagName) + '') : null }; };
  return { faixa: cx(f), seta: cx(document.querySelector('.ins-modo-sair')), topo: cx(document.querySelector('.ins-modo-topo')),
           noCentro: ['.ins-modo-sair', '.ins-modo-topo [class*=hora], .ins-modo-topo time', '.ins-modo-topo button:last-child'].map(sob) };
});
res.errosDaPagina = ab.erros;
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'aviso-janela-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
console.log(ROTULO, JSON.stringify(res));
await ab.b.close();
