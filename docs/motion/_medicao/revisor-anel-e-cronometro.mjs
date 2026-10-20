// Dois itens da peça 5 que os fluxos não cobrem:
//   1. Defeito 7: com o teclado, o campo de importar dos Ajustes mostra o anel?
//      O `input` de arquivo é transparente sobre o rótulo; o anel tem de estar
//      no rótulo (o botão que se vê). Vai pelo Tab até o `input`; se o Tab do
//      motor não chegar lá, aperta uma tecla e foca por programa (o que o
//      navegador conta como foco de teclado).
//   2. O cronômetro nas telas cheias (Ajustes, Evolução): o fundo dele no fundo
//      da tela (896) ou 52 px acima (844)?
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-anel-e-cronometro.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs)
//
// Escreve <pasta>/anel-e-cronometro-<rodada>.json e <pasta>/anel-<rodada>.png.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const { p } = ab;
const res = { motor: MOTOR, rotulo: ROTULO };

// ---- 1) o anel do campo de importar ----
await recarrega(p, registro, '07:10');
await escopo(p, `CTX.abreAjustes(); render(); window.scrollTo(0, 0);`);
await p.waitForTimeout(900);
const noCampo = () => p.evaluate(() => !!(document.activeElement && document.activeElement.matches('input[type="file"]') &&
  document.activeElement.closest('label.gu-arquivo')));
let tabs = 0;
while (tabs < 120 && !(await noCampo())) { await p.keyboard.press('Tab'); tabs++; }
res.anel = { chegouPeloTab: await noCampo(), tabs };
if (!res.anel.chegouPeloTab) {
  await p.keyboard.press('Shift');
  await p.evaluate(() => document.querySelector('label.gu-arquivo input[type="file"]').focus());
}
await p.evaluate(() => document.activeElement.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
Object.assign(res.anel, await p.evaluate(() => {
  const i = document.activeElement, l = i.closest('label');
  const anel = e => { const c = getComputedStyle(e); return { outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`, offset: c.outlineOffset, sombra: c.boxShadow }; };
  let fv = null; try { fv = i.matches(':focus-visible'); } catch (e) { fv = 'sem suporte'; }
  const r = l.getBoundingClientRect();
  return { focado: i.matches('label.gu-arquivo input[type="file"]'), focusVisible: fv,
           rotulo: (l.textContent || '').trim().slice(0, 40), noRotulo: anel(l), noInput: anel(i),
           caixa: [r.x, r.y, r.width, r.height].map(Math.round) };
}));
const [x, y, w, h] = res.anel.caixa;
await p.screenshot({ path: path.join(SAIDA, `anel-${ROTULO}.png`), clip: { x: Math.max(0, x - 12), y: Math.max(0, y - 12), width: w + 24, height: h + 24 } });

// ---- 2) o cronômetro nas telas cheias ----
const caixaTimer = () => p.evaluate(() => {
  const e = document.querySelector('#timer'); if (!e) return null;
  const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
  return { topo: Math.round(r.top * 10) / 10, fundo: Math.round(r.bottom * 10) / 10, janela: innerHeight,
           visivel: c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.01 };
});
res.cronometro = {};
for (const [nome, abre] of [['agora (sobre a barra de abas)', ``], ['Ajustes', `CTX.abreAjustes();`], ['Evolução', `CTX.vaiPara('corpo'); CTX.abreEvolucao();`]]) {
  await recarrega(p, registro, '07:10');
  await escopo(p, `startTimer(90, 'descanso · série 1 · teste'); ${abre} render(); window.scrollTo(0, 0);`);
  await p.waitForTimeout(1000);
  res.cronometro[nome] = await caixaTimer();
}

const arq = path.join(SAIDA, `anel-e-cronometro-${ROTULO}.json`);
fs.mkdirSync(SAIDA, { recursive: true });
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
console.log('gravado em', arq);
await ab.b.close();
