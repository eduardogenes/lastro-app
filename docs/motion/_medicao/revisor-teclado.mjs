// O teclado próprio vem inteiro para a tela, e a página rola só o necessário?
// (peça 8; 03 §4.7: antes o foco rolava a página e, com o cronômetro em cena, o
// "pronto" ficava coberto por ele.)
//
// No modo de sessão, com o 1º exercício aberto, uma célula de carga é posta (pela
// rolagem) na metade de cima (y ≈ 200) ou na de baixo (y ≈ 640) da tela, e é
// tocada. Três casos: em cima; embaixo; embaixo com o descanso contando. Em cada
// um: a rolagem antes e depois, a caixa do teclado (`.tcl`), a do "pronto", a do
// cronômetro, e se o "pronto" ficou inteiro na tela e acima do cronômetro.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-teclado.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs)
//
// Escreve <pasta>/teclado-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const p = ab.p;
const caixa = s => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 10) / 10); }, s);

async function caso(nome, alturaNaTela, descanso) {
  await recarrega(p, registro, '07:10');
  await escopo(p, `CTX.abreTreinoDeHoje(); if (view.open !== 0) toggle(0); render(); window.scrollTo(0, 0);` + (descanso ? ` startTimer(90, 'descanso · série 1 · teste');` : ''));
  await p.waitForTimeout(900);
  // a célula de carga mais funda que ainda pode ir à altura pedida
  const alvo = await p.evaluate(h => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const cs = [...document.querySelectorAll('[id^="w"]')].filter(e => /^w\d+_\d+$/.test(e.id) && e.getBoundingClientRect().height);
    const ok = cs.filter(e => { const y = e.getBoundingClientRect().top + scrollY; return y - h >= 0 && y - h <= max; });
    const e = ok[ok.length - 1] || cs[0];
    if (!e) return null;
    window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + scrollY - h));
    return e.id;
  }, alturaNaTela);
  await p.waitForTimeout(400);
  const antes = { scrollY: await p.evaluate(() => Math.round(scrollY)), celula: await caixa('#' + alvo) };
  await p.locator('#' + alvo).click();
  await p.waitForTimeout(500);
  const depois = { scrollY: await p.evaluate(() => Math.round(scrollY)), celula: await caixa('#' + alvo), teclado: await caixa('.tcl'),
                   pronto: await caixa('[data-a="tcl-pronto"]'), cronometro: descanso ? await caixa('#timer') : null };
  const pr = depois.pronto, cr = depois.cronometro, tc = depois.teclado;
  // (1 px de folga: as caixas vêm em décimos e o teclado encosta na borda)
  return { nome, alvo, antes, depois, rolou: depois.scrollY - antes.scrollY,
           prontoInteiroNaTela: !!(pr && pr[1] >= -1 && pr[1] + pr[3] <= 897),
           prontoAcimaDoCronometro: cr ? !!(pr && pr[1] + pr[3] <= cr[1] + 1) : null,
           tecladoSobOCronometroPx: cr && tc ? Math.max(0, Math.round(Math.min(tc[1] + tc[3], cr[1] + cr[3]) - Math.max(tc[1], cr[1]))) : null,
           tecladoAteY: depois.teclado ? Math.round(depois.teclado[1] + depois.teclado[3]) : null };
}

const res = { motor: MOTOR, rotulo: ROTULO, casos: [] };
res.casos.push(await caso('célula na metade de cima', 200, false));
res.casos.push(await caso('célula na metade de baixo', 640, false));
res.casos.push(await caso('célula na metade de baixo, descanso contando', 640, true));
res.errosDaPagina = ab.erros;
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'teclado-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
for (const c of res.casos) console.log(ROTULO, c.nome, '| rolou', c.rolou, '| teclado até', c.tecladoAteY, '| pronto', JSON.stringify(c.depois.pronto), 'inteiro', c.prontoInteiroNaTela, '| acima do cronômetro', c.prontoAcimaDoCronometro, '| teclado sob o cronômetro', c.tecladoSobOCronometroPx, JSON.stringify(c.depois.cronometro));
await ab.b.close();
