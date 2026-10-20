// Quanto tempo o aviso fica, pelo tamanho do texto? (peça 7: 1 s + 15
// caracteres por segundo, de 3,6 s a 8 s; antes, 3,6 s para qualquer texto.)
//
// No Agora, um aviso de cada tamanho (13, 50, 101 e 140 caracteres), um por vez;
// mede-se do `toast()` até o começo da saída (a mensagem ganha `.sai`; antes, o
// `#toast` fica `display: none`), por `requestAnimationFrame`.
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-aviso-tempo.mjs http://localhost:4728/ <pasta>
//
// Escreve <pasta>/aviso-tempo-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const p = ab.p;
await recarrega(p, registro, '07:10');
await escopo(p, `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`);
await p.waitForTimeout(800);

const base = 'Um aviso de teste para medir quanto tempo ele fica na tela, pelo tamanho do texto que ele mostra ao dono, sem pressa nenhuma.';
const textos = [13, 50, 101, 140].map(n => (base + ' ' + base).slice(0, n));
const res = { motor: MOTOR, rotulo: ROTULO, avisos: [] };
for (const texto of textos) {
  const ms = await p.evaluate(texto => new Promise(ok => {
    const t = document.getElementById('toast');
    const saiu = () => getComputedStyle(t).display === 'none' || !!t.querySelector(':scope > .aviso.sai') || (!t.querySelector(':scope > .aviso') && !t.textContent.trim());
    window.__escopo(`toast(${JSON.stringify(texto)});`);
    const t0 = performance.now();
    (function olha() {
      if (saiu()) return ok(Math.round(performance.now() - t0));
      if (performance.now() - t0 > 12000) return ok(null);
      requestAnimationFrame(olha);
    })();
  }), texto);
  res.avisos.push({ caracteres: texto.length, ficouMs: ms, regra: Math.round(Math.min(8000, Math.max(3600, 1000 + texto.length / 15 * 1000))) });
  await p.waitForTimeout(700);
}
fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'aviso-tempo-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
console.log(ROTULO, JSON.stringify(res.avisos));
await ab.b.close();
