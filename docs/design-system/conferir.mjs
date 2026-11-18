// Uso: node docs/design-system/conferir.mjs chromium|webkit <pasta-de-saída> [fotos]
// Percorre todas as telas e estados da página viva a 414x896: erros, rolagem lateral, alvos < 44, texto < 12.
import pw from '../../node_modules/playwright-core/index.js';
const [,, motor, out, fotos] = process.argv;
const ARQ = new URL('./lastro.html', import.meta.url).href;
const exe = { chromium: process.env.HOME + '/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome' };
const b = await pw[motor].launch(exe[motor] ? { executablePath: exe[motor] } : {});
const pg = await b.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2 });
const erros = []; pg.on('pageerror', e => erros.push(e.message)); pg.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
await pg.goto(ARQ + '#t-hoje'); await pg.waitForTimeout(1500);
const lista = await pg.evaluate(() => ORDEM.flatMap(id => (TELAS[id].es || [['', '']]).map(e => [id, e[0]])));
const achados = [];
for (const [id, e] of lista) {
  await pg.evaluate(([id, e]) => { abreTela(id, e || undefined); desenhaAparelho(true); }, [id, e]);
  await pg.waitForTimeout(fotos ? 420 : 120);
  const r = await pg.evaluate(() => {
    const fone = document.querySelector('#fone'), tela = document.querySelector('#tela'), fo = document.querySelector('#folha');
    const lado = tela.scrollWidth - tela.clientWidth, ladoF = fo.classList.contains('on') ? fo.scrollWidth - fo.clientWidth : 0;
    const peq = [], miudo = [];
    const raiz = fo.classList.contains('on') ? fo : document.querySelector('#meio');
    raiz.querySelectorAll('button, a, input, select, [role=slider]').forEach(el => {
      if (el.closest('.sim') || el.closest('.regua .rola') && !el.matches('[role=slider]')) return;
      const q = el.getBoundingClientRect(); if (!q.width || el.disabled) return;
      if (getComputedStyle(el).visibility === 'hidden') return;
      if (el.closest('.dd') || el.matches('.dd')) { if (q.width < 40) peq.push((el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height)); return; }
      if (q.width < 43.5 || q.height < 43.5) peq.push((el.getAttribute('aria-label') || el.textContent || el.className).trim().slice(0, 28) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height));
    });
    raiz.querySelectorAll('*').forEach(el => { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 11.5 && !el.closest('svg')) miudo.push(el.textContent.trim().slice(0, 20) + ' ' + fs); });
    return { lado, ladoF, peq: [...new Set(peq)].slice(0, 8), miudo: [...new Set(miudo)].slice(0, 5) };
  });
  if (r.lado > 1 || r.ladoF > 1 || r.peq.length || r.miudo.length) achados.push(id + (e ? '--' + e : '') + ' ' + JSON.stringify(r));
  if (fotos) await pg.screenshot({ path: `${out}/${id}${e ? '--' + e : ''}.png` });
}
for (const p of ['indice', 'fundamentos', 'componentes', 'fluxos', 'auditoria']) { await pg.goto(ARQ + '#' + p); await pg.waitForTimeout(500); const o = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) achados.push(p + ' rolagem lateral ' + o); if (fotos) await pg.screenshot({ path: `${out}/doc-${p}.png`, fullPage: true }); }

// âncoras (07-fluidez-e-estabilidade.md): o botão principal não sai do lugar entre os passos de uma tarefa
const TAREFAS = {
  treino: [['serie', 'normal'], ['serie', 'subir'], ['serie', 'intervalo'], ['serie', 'meio'], ['serie', 'trocado'], ['descanso', 'normal'], ['descanso', 'fim'], ['fim-treino', 'mudou'], ['fim-treino', 'igual'], ['fim-treino', 'vazio']],
  medir: [['medir', 'primeira'], ['medir', 'segunda'], ['medir', 'terceira'], ['medir', 'dobra'], ['medir', 'fim']],
  bio: [['bio-nova', 'gordura'], ['bio-nova', 'musculo'], ['bio-nova', 'agua']],
  responder: [['responder', 'meio'], ['responder', 'fim']],
  'primeira vez': [['pv-treino', ''], ['pv-comida', ''], ['pv-acompanhar', '']],
  camera: ['nivel', 'altura', 'certo', 'pose', 'gira', 'sozinho', 'torta', 'forcado', 'permissao', 'negada', 'carregando', 'ninguem'].map(e => ['camera', e])
};
await pg.goto(ARQ + '#t-hoje'); await pg.waitForTimeout(600);
for (const [g, l] of Object.entries(TAREFAS)) {
  const r = [];
  for (const [id, e] of l) {
    await pg.evaluate(([id, e]) => { abreTela(id, e || undefined); desenhaAparelho(true); }, [id, e]); await pg.waitForTimeout(60);
    r.push(await pg.evaluate(() => { const x = document.querySelector('#tela .pe-a .vai, #tela .pe-f .vai, #tela .botao'); if (!x) return 'sem principal'; const q = x.getBoundingClientRect(); return [q.top, q.left, q.width, q.height].map(Math.round).join(','); }));
  }
  const u = [...new Set(r)];
  achados.push((u.length === 1 ? 'âncora ok: ' : 'ÂNCORA MOVE: ') + g + ' ' + (u.length === 1 ? u[0] : l.map((x, i) => x.join('--') + '=' + r[i]).join('  ')));
}
console.log('telas', lista.length, 'erros', [...new Set(erros)].slice(0, 10));
console.log(achados.join('\n'));
await b.close();
