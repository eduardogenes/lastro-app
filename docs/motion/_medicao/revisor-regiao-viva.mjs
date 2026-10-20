// A região viva do aviso nunca sai da árvore de acessibilidade? (peça 7; 05 §3.2
// e M12: com `display: none` entre um aviso e outro, o leitor de tela pode não
// anunciar o próximo, porque a região "nasce" junto com o texto.)
//
// No Agora: sem aviso, com um aviso, com o mesmo texto de novo, com um texto
// novo e depois que o aviso some. Em cada estado: o `display` do `#toast`, o
// `role` e o `aria-live`, o texto, o que o Playwright vê na árvore (as linhas da
// `ariaSnapshot` do `body` que falam da região) e, no Chromium, o nó da árvore
// do próprio motor (`Accessibility.getPartialAXTree`: ignorado ou não, o papel).
// E se a região vazia pega toque (o que está sob o centro dela).
//
//   python3 -m http.server 4728 -d <dist> &
//   CHROME=… REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json \
//     node docs/motion/_medicao/revisor-regiao-viva.mjs http://localhost:4728/ <pasta>
//   (MOTOR=webkit + LD_PRELOAD como no topo de revisor-gravar.mjs)
//
// Escreve <pasta>/regiao-viva-<rodada>.json.
import { abreMotor, abreApp, escopo, recarrega, ROTULO, SAIDA, MOTOR } from './revisor-comum.mjs';
import fs from 'node:fs';
import path from 'node:path';

const ab = await abreMotor();
const registro = await abreApp(ab.p);
const { p, cdp } = ab;
await recarrega(p, registro, '07:10');
await escopo(p, `CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`);
await p.waitForTimeout(800);

async function arvoreDoMotor() {
  if (!cdp) return null;
  try {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#toast' });
    if (!nodeId) return { erro: 'sem #toast' };
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const n = nodes[0] || {};
    return { ignorado: !!n.ignored, motivo: (n.ignoredReasons || []).map(r => r.name), papel: n.role && n.role.value, nome: n.name && n.name.value };
  } catch (e) { return { erro: String(e).split('\n')[0] }; }
}

async function estado(nome) {
  const dom = await p.evaluate(() => {
    const t = document.getElementById('toast');
    if (!t) return { existe: false };
    const r = t.getBoundingClientRect();
    const sob = r.width && r.height ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null;
    return { existe: true, display: getComputedStyle(t).display, role: t.getAttribute('role'), live: t.getAttribute('aria-live'),
             texto: t.textContent.trim(), mensagens: t.querySelectorAll(':scope > .aviso').length,
             caixa: [r.x, r.y, r.width, r.height].map(Math.round),
             sobOCentro: sob ? (sob === t || t.contains(sob) ? 'a região' : sob.tagName.toLowerCase() + (sob.className ? '.' + String(sob.className).split(' ')[0] : '')) : null };
  });
  let arvore = null;
  try {
    const snap = await p.locator('body').ariaSnapshot({ timeout: 3000 });
    arvore = snap.split('\n').filter(l => /status|Ajuste|aviso/i.test(l)).map(l => l.trim()).slice(0, 6);
  } catch (e) { arvore = ['erro: ' + String(e).split('\n')[0]]; }
  return { nome, dom, arvorePlaywright: arvore, arvoreDoMotor: await arvoreDoMotor() };
}

const res = { motor: MOTOR, rotulo: ROTULO, estados: [] };
res.estados.push(await estado('sem aviso'));
await escopo(p, `toast('Ajuste salvo.');`); await p.waitForTimeout(400);
res.estados.push(await estado('com um aviso'));
await escopo(p, `toast('Ajuste salvo.');`); await p.waitForTimeout(200);
res.estados.push(await estado('o mesmo texto de novo'));
await escopo(p, `toast('Outro texto, que refaz a entrada.');`); await p.waitForTimeout(400);
res.estados.push(await estado('um texto novo'));
await p.waitForTimeout(9000);
res.estados.push(await estado('depois que o aviso some'));
res.errosDaPagina = ab.erros;

fs.mkdirSync(SAIDA, { recursive: true });
const arq = path.join(SAIDA, 'regiao-viva-' + ROTULO + '.json');
fs.writeFileSync(arq, JSON.stringify(res, null, 1));
for (const e of res.estados) console.log(ROTULO, e.nome, '|', JSON.stringify(e.dom), '|', JSON.stringify(e.arvorePlaywright), '|', JSON.stringify(e.arvoreDoMotor));
console.log('gravado em', arq);
await ab.b.close();
