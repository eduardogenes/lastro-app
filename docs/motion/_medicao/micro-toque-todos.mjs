// O toque em TODO controle: o que cada um mostra com o dedo pousado.
//
// Percorre telas do app (Agora, folhas, Ajustes, os cinco lugares, o modo de
// sessão com régua, teclado, RIR e descanso, o painel de pare, histórico,
// programa), acha todo controle tocável — todo <button> e todo nó com ouvinte
// de clique do Preact (`el.l`) —, força `:active` pelo DevTools em cada um e
// compara a cor que se vê (as camadas de fundo compostas, da raiz até o nó)
// com o repouso e com o fundo de verdade atrás dele (a composição do pai).
//
// Peça 1 do motion (docs/motion/09-implementacao.md): o antes e o depois de
// 116 controles, nos dois temas. Contra o `dist/` servido numa porta livre:
//
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/micro-toque-todos.mjs http://localhost:4729/ \
//     docs/motion/_medicao/shots/micro/toque-todos-claro.json claro
import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const [url, saida, tema = 'claro'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  colorScheme: tema === 'escuro' ? 'dark' : 'light' });
const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(String(e)));
const d = new Date(); d.setHours(18, 30, 0, 0);
await p.addInitScript(`Date.now = () => ${d.getTime()};`);
await p.goto(url); await p.waitForTimeout(900);
const ev = (c) => p.evaluate((c) => { window.__escopo(c); return null; }, c);
const cdp = await ctx.newCDPSession(p);
await cdp.send('DOM.enable'); await cdp.send('CSS.enable');

await ev(`
  const DIA = 86400000, t = Date.now() - 7*DIA;
  const DD = nextDay(); const P = treino(DD); S.logs = {};
  P.ex.forEach(function (ex, i) { const sets=[]; for (let k=0;k<ex.s;k++) sets.push([40+5*i, 9-k, 1]); S.logs[ex.id]=[{ t:t+i*600000, sid:t, sets:sets }]; });
  S.done = [{ day:DD, t:t, sid:t, dur:3600000, fim:'manual' }];
  diaDeComida().cadencia = 'treino';
  CTX.vaiPara('agora'); render();
`);
await p.waitForTimeout(300);

// O que corre DENTRO da página: marca os tocáveis, e mede um.
await p.addScriptTag({ content: `
  window.__mt = {
    cor(s) { const m = s && s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
      const v = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; },
    camadas(el) {
      const cs = getComputedStyle(el); const out = [];
      const bg = this.cor(cs.backgroundColor); if (bg && bg[3] > 0) out.push(bg);
      // um gradiente de cor única é uma camada lisa (é como o toque se pinta)
      for (const g of cs.backgroundImage.matchAll(/linear-gradient\\(((?:[^()]|\\([^()]*\\))*)\\)/g)) {
        const cores = [...g[1].matchAll(/rgba?\\([^)]*\\)/g)].map(x => this.cor(x[0]));
        if (cores.length && cores.every(c => c.join() === cores[0].join()) && cores[0][3] > 0) out.push(cores[0]);
      }
      return out;
    },
    sobre(base, c) { const a = c[3]; return [0, 1, 2].map(i => base[i] * (1 - a) + c[i] * a); },
    efetivo(el) {
      const cadeia = []; for (let n = el; n; n = n.parentElement) cadeia.unshift(n);
      let cor = [255, 255, 255];
      for (const n of cadeia) for (const c of this.camadas(n)) cor = this.sobre(cor, c);
      return cor.map(Math.round);
    },
    lum(c) { const l = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
      return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; },
    contraste(a, b) { const x = this.lum(a), y = this.lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); },
    tocaveis() {
      const els = [...document.querySelectorAll('*')].filter(el => {
        if (el.closest('[data-palco]') && !el.closest('#app, #timer, #toast')) return false;
        const clica = el.l && Object.keys(el.l).some(k => /^click/i.test(k));
        if (!(el.tagName === 'BUTTON' || clica || el.getAttribute('role') === 'button')) return false;
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      });
      els.forEach((el, i) => el.setAttribute('data-mt', i));
      return els.length;
    },
    nome(el) {
      return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
        [...el.classList].map(c => '.' + c).join('') + (el.dataset.a ? '[data-a=' + el.dataset.a + ']' : '');
    },
    estado(el) {
      const cs = getComputedStyle(el);
      return { cor: this.efetivo(el), texto: cs.color, transform: cs.transform, scale: cs.scale,
        transicao: cs.transitionProperty + ' ' + cs.transitionDuration, imagem: cs.backgroundImage.slice(0, 80) };
    }
  };
` });

const linhas = new Map();
async function varre(rotulo, codigo, espera = 150) {
  if (codigo) { try { await ev(codigo); } catch (e) { console.log('!! ' + rotulo + ': ' + e.message.split('\n')[0]); return; } }
  await p.waitForTimeout(espera);
  const n = await p.evaluate(() => window.__mt.tocaveis());
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-mt]' });
  for (const nodeId of nodeIds) {
    const { attributes } = await cdp.send('DOM.getAttributes', { nodeId });
    const i = attributes[attributes.indexOf('data-mt') + 1];
    const antes = await p.evaluate((i) => { const el = document.querySelector('[data-mt="' + i + '"]');
      return { nome: window.__mt.nome(el), rep: window.__mt.estado(el), fundo: window.__mt.efetivo(el.parentElement),
               txt: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28) }; }, i);
    if (linhas.has(antes.nome)) continue;
    await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['active'] });
    const tocado = await p.evaluate((i) => window.__mt.estado(document.querySelector('[data-mt="' + i + '"]')), i);
    await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
    const c = (a, b) => p.evaluate(([a, b]) => window.__mt.contraste(a, b), [a, b]);
    linhas.set(antes.nome, {
      onde: rotulo, nome: antes.nome, txt: antes.txt,
      repouso: antes.rep.cor, tocado: tocado.cor, fundo: antes.fundo,
      contraRepouso: +(await c(antes.rep.cor, tocado.cor)).toFixed(2),
      contraFundo: +(await c(antes.fundo, tocado.cor)).toFixed(2),
      texto: antes.rep.texto === tocado.texto ? null : antes.rep.texto + ' → ' + tocado.texto,
      transform: antes.rep.transform === tocado.transform && antes.rep.scale === tocado.scale ? null : tocado.transform + ' / ' + tocado.scale,
      transicao: tocado.transicao
    });
  }
  console.log(rotulo.padEnd(34), n, 'tocáveis; acumulados', linhas.size);
}

await varre('Agora', null);
await varre('Agora · linha aberta', `CTX.abreLinhaDaComida(document.querySelector('.ag-l-b').dataset.a.replace('linha-', ''));`, 150);
await varre('Agora · corrige a água', `CTX.vaiPara('agora'); render(); CTX.abreCorrecaoDaAgua();`);
await varre('folha · seletor de dia', `CTX.vaiPara('agora'); render(); CTX.abreSeletorDeDia();`, 300);
await varre('folha · refeição', `pilha().length = 0; render(); CTX.abreRefeicao(document.querySelector('.ag-l-b').dataset.a.replace('linha-', ''));`, 300);
await varre('folha · peso rápido', `pilha().length = 0; render(); CTX.abreFolha({ k: 'pesoRapido' });`, 300);
await varre('Ajustes', `pilha().length = 0; CTX.vaiPara('agora'); render(); CTX.abreAjustes();`, 300);
await varre('Dias', `CTX.vaiPara('dias'); render();`, 300);
await varre('Corpo', `CTX.vaiPara('corpo'); render();`, 300);
await varre('Semana', `CTX.vaiPara('semana'); render();`, 300);
await varre('Prescrição', `CTX.vaiPara('prescricao'); render();`, 300);
await varre('modo de sessão', `CTX.vaiPara('agora'); CTX.abreTreinoDeHoje(); render();`, 300);
await varre('modo · cartão aberto', `toggle(0); render();`, 300);
await varre('modo · régua', `abreRegua(0, 0);`, 100);
await varre('modo · teclado', `abreTecladoDeCarga(0, 0);`, 100);
await varre('modo · RIR', `fechaTeclado(); abreRir(0, 0);`, 100);
await varre('modo · descanso', `view.rir = null; anotaSerie(0, 0, 0, 40); anotaSerie(0, 0, 1, 9); render();`, 200);
await varre('modo · menu da sessão', `CTX.abreFolha({ k: 'menuSessao' });`, 300);
await varre('modo · peso no descanso', `pilha().length = 0; render(); CTX.abrePesoNoDescanso && CTX.abrePesoNoDescanso();`, 300);
await varre('pare · encerrar', `pilha().length = 0; render(); finalizarSessao();`, 300);
await varre('histórico', `CTX.vaiPara('agora'); render(); CTX.abreHistorico();`, 300);
await varre('programa', `CTX.vaiPara('prescricao'); render(); CTX.abrePrograma();`, 300);
await varre('retroativo', `CTX.vaiPara('dias'); render(); CTX.abreRetro();`, 300);
await varre('evolução', `CTX.vaiPara('corpo'); render(); CTX.abreEvolucao();`, 300);

fs.writeFileSync(saida, JSON.stringify({ tema, erros, linhas: [...linhas.values()] }, null, 1));
const fmt = x => x == null ? '' : x;
for (const x of linhas.values()) {
  console.log((x.onde + ' · ' + x.nome).slice(0, 70).padEnd(70), String(x.contraRepouso).padStart(5), String(x.contraFundo).padStart(5), fmt(x.texto), fmt(x.transform));
}
if (erros.length) console.log('ERROS', erros);
await b.close();
