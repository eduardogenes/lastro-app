// As quatro armadilhas conhecidas, provadas no app de hoje (docs/motion/00-briefing.md §5),
// mais duas do motor: o que um `transform` num ancestral faz com quem é `fixed`
// lá dentro, e se um toque atravessa uma View Transition em curso.
//
// Rodar (detalhes, WebKit e CPU lenta no topo de desempenho-comum.mjs):
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/desempenho-armadilhas.mjs http://localhost:4724/ docs/motion/_medicao/shots/desempenho
//
// Nada aqui é movimento do app: são SONDAS. O script põe um `transform` parado
// (o quadro do meio de uma animação) no lugar onde uma animação futura moraria,
// e lê o que o motor fez: largura rolável, rolagem horizontal possível, posição
// dos fixos, posição dos sticky, altura da página. Depois tira a sonda.
import { abre, escopo, grava, MOTOR } from './desempenho-comum.mjs';

const { b, p, erros } = await abre();
const out = {};

const neutro = () => escopo(p, `
  for (let n = 0; n < 20 && camadasAbertas(view).length; n++) voltarUmaCamada();
  stopTimer(); CTX.vaiPara('agora'); render(); window.scrollTo(0, 0);`);

// ---- 0) Varredura: o que hoje tem backdrop-filter, will-change, transform, animação ----
async function varre(nome) {
  return p.evaluate(nome => {
    const r = { tela: nome, backdrop: [], willChange: [], transform: [], animando: [] };
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      const id = el.id ? '#' + el.id : (el.className && el.className.baseVal === undefined ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase());
      if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none')) r.backdrop.push(id);
      if (cs.willChange && cs.willChange !== 'auto') r.willChange.push(id + ':' + cs.willChange);
      if (cs.transform && cs.transform !== 'none') r.transform.push(id);
    });
    r.animando = document.getAnimations().map(a => (a.animationName || a.transitionProperty || a.constructor.name) + '@' + (a.effect && a.effect.target ? (a.effect.target.id || a.effect.target.className) : '?'));
    r.transform = [...new Set(r.transform)];
    return r;
  }, nome);
}
out.varredura = [];
await neutro();
out.varredura.push(await varre('agora'));
await escopo(p, `CTX.vaiPara('semana'); render();`); out.varredura.push(await varre('semana'));
await escopo(p, `CTX.vaiPara('agora'); CTX.abreTreinoDeHoje(); toggle(0); anotaSerie(0,0,0,40); anotaSerie(0,0,1,10); render();`);
await p.waitForTimeout(200);
out.varredura.push(await varre('modo de sessão com descanso contando'));
await neutro();

// ---- 1) translateX(+N): quem transborda, quem rola de lado, quem se mexe ----
const FIXOS = ['.ins-tabbar', '#timer', '#toast', '.ins-faixa', '.ins-modo-topo', '.tc-topo'];
async function sondaX(nome, seletor, alvoRolagem) {
  return p.evaluate(({ nome, seletor, alvoRolagem, FIXOS }) => {
    const el = document.querySelector(seletor);
    if (!el) return { nome, erro: 'sem ' + seletor };
    const de = document.documentElement;
    const lado = () => FIXOS.map(s => { const f = document.querySelector(s); if (!f) return null; const r = f.getBoundingClientRect(); return s + ':' + Math.round(r.left) + ',' + Math.round(r.top); }).filter(Boolean);
    const antes = { sw: de.scrollWidth, cw: de.clientWidth, iw: innerWidth, fixos: lado() };
    const rolador = alvoRolagem ? document.querySelector(alvoRolagem) : null;
    el.style.transform = 'translateX(160px)';
    de.getBoundingClientRect();
    const depois = { sw: de.scrollWidth, cw: de.clientWidth, iw: innerWidth, fixos: lado() };
    // a janela rola de lado? (pelo programa: é o que um focus()/scrollIntoView faria)
    const y = scrollY; window.scrollTo(400, y); const sx = scrollX; window.scrollTo(0, y);
    let interno = null;
    if (rolador) { interno = { sw: rolador.scrollWidth, cw: rolador.clientWidth }; rolador.scrollLeft = 400; interno.rolouPara = rolador.scrollLeft; rolador.scrollLeft = 0; }
    el.style.transform = '';
    const cs = getComputedStyle(document.body);
    return { nome, seletor, antes, depois, janelaRolouDeLadoPara: sx, interno,
             bodyOverflowX: cs.overflowX, htmlOverflowX: getComputedStyle(de).overflowX,
             fixosMexeram: JSON.stringify(antes.fixos) !== JSON.stringify(depois.fixos) };
  }, { nome, seletor, alvoRolagem, FIXOS });
}
out.translateX = [];
await escopo(p, `CTX.vaiPara('dias'); render();`);
out.translateX.push(await sondaX('aba (o <main> de Dias)', '#app > main'));
await escopo(p, `CTX.vaiPara('agora'); CTX.abreAjustes(); render();`);
out.translateX.push(await sondaX('tela cheia (Ajustes, .tc)', '#app > .tc'));
await neutro();
await escopo(p, `CTX.abreTreinoDeHoje(); render();`);
out.translateX.push(await sondaX('modo de sessão (.ins-modo)', '#app > .ins-modo'));
await neutro();
const idRef = await escopo(p, `planoDeComida()[2].id`);
await escopo(p, `CTX.abreRefeicao('${idRef}'); render();`);
await p.waitForTimeout(150);
out.translateX.push(await sondaX('a folha inteira (.ins-folha)', '.ins-folha'));
out.translateX.push(await sondaX('o conteúdo da folha (filho de .ins-folha-c)', '.ins-folha-c > *', '.ins-folha-c'));
await neutro();

// ---- 2) transform num ANCESTRAL de quem é fixed ----
out.ancestralFixo = [];
// 2a) #app com transform: a barra de abas é filha dele.
out.ancestralFixo.push(await p.evaluate(() => {
  const tb = document.querySelector('.ins-tabbar'); const app = document.getElementById('app');
  const r0 = tb.getBoundingClientRect();
  app.style.transform = 'translateX(1px)';
  const r1 = tb.getBoundingClientRect();
  app.style.transform = '';
  return { caso: 'transform em #app; a barra de abas (fixed, filha de #app)', topoAntes: Math.round(r0.top), topoDepois: Math.round(r1.top), alturaJanela: innerHeight };
}));
// 2b) .ins-modo com transform: a faixa da pergunta (fixed) mora DENTRO do modo.
await escopo(p, `CTX.abreTreinoDeHoje(); toggle(0); anotaSerie(0,0,0,40); anotaSerie(0,0,1,10); stopTimer(); render();`);
await escopo(p, `if (S.sessao) { S.sessao.ultima = Date.now() - 2 * 3600e3; } render();`);
await p.waitForTimeout(150);
out.ancestralFixo.push(await p.evaluate(() => {
  const f = document.querySelector('.ins-modo .ins-faixa'); const m = document.querySelector('.ins-modo');
  if (!f) return { caso: 'transform em .ins-modo; a faixa da pergunta', erro: 'faixa não apareceu' };
  const r0 = f.getBoundingClientRect();
  m.style.transform = 'translateX(1px)';
  const r1 = f.getBoundingClientRect();
  m.style.transform = '';
  return { caso: 'transform em .ins-modo; a faixa da pergunta (fixed, dentro do modo)', topoAntes: Math.round(r0.top), topoDepois: Math.round(r1.top), alturaJanela: innerHeight };
}));
await p.screenshot({ path: `${process.argv[3] || 'docs/motion/_medicao/shots/desempenho'}/armadilha-faixa-${MOTOR}.png` });
await neutro();

// ---- 3) sticky: a cadeia de overflow e se ele gruda de fato depois de rolar ----
async function sticky(nome, abreTela, seletores) {
  await neutro(); await escopo(p, abreTela); await p.waitForTimeout(150);
  return p.evaluate(({ nome, seletores }) => {
    window.scrollTo(0, 700);
    const r = { nome, rolou: scrollY, grudados: {}, cadeia: {} };
    seletores.forEach(s => {
      const el = document.querySelector(s);
      if (!el) { r.grudados[s] = 'ausente'; return; }
      r.grudados[s] = Math.round(el.getBoundingClientRect().top);
      const c = []; let a = el.parentElement;
      while (a) { const cs = getComputedStyle(a); c.push((a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.className ? '.' + String(a.className).split(' ')[0] : '')) + '[' + cs.overflowX + '/' + cs.overflowY + (cs.transform !== 'none' ? ' T' : '') + ']'); a = a.parentElement; }
      r.cadeia[s] = c.join(' < ');
    });
    window.scrollTo(0, 0);
    return r;
  }, { nome, seletores });
}
out.sticky = [];
out.sticky.push(await sticky('modo de sessão', `CTX.abreTreinoDeHoje(); toggle(0); anotaSerie(0,0,0,40); anotaSerie(0,0,1,10); stopTimer(); render();`, ['.ins-modo-topo', '.day-rel']));
out.sticky.push(await sticky('tela cheia (programa)', `CTX.vaiPara('prescricao'); CTX.abrePrograma(); render();`, ['.tc-topo']));

// ---- 4) a cadeia de alturas, e a sobra rolável quando o conteúdo é curto ----
async function alturas(nome, abreTela, encurta) {
  await neutro(); await escopo(p, abreTela); await p.waitForTimeout(150);
  return p.evaluate(({ nome, encurta }) => {
    if (encurta) document.querySelectorAll(encurta).forEach(e => { e.dataset.sonda = e.style.display; e.style.display = 'none'; });
    const px = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    const cs = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).minHeight : null; };
    const r = { nome, janela: innerHeight, pagina: document.documentElement.scrollHeight,
      sobraRolavel: document.documentElement.scrollHeight - innerHeight,
      html: px('html'), body: px('body') + ' (min ' + cs('body') + ')', app: px('#app') + ' (padding-bottom ' + getComputedStyle(document.getElementById('app')).paddingBottom + ')',
      modo: px('.ins-modo') != null ? px('.ins-modo') + ' (min ' + cs('.ins-modo') + ')' : null };
    if (encurta) document.querySelectorAll(encurta).forEach(e => { e.style.display = e.dataset.sonda || ''; });
    return r;
  }, { nome, encurta });
}
out.alturas = [];
out.alturas.push(await alturas('Agora (conteúdo normal)', `render();`));
out.alturas.push(await alturas('Ajustes (tela cheia)', `CTX.abreAjustes(); render();`));
out.alturas.push(await alturas('modo de sessão, conteúdo encurtado à força (sonda)', `CTX.abreTreinoDeHoje(); render();`, '.ins-modo main'));
out.alturas.push(await alturas('tela cheia, conteúdo encurtado à força (sonda)', `CTX.abreAjustes(); render();`, '.tc-corpo'));

// ---- 5) View Transition: um toque no meio dela chega ao botão? ----
async function vt(nome, css) {
  await neutro(); await p.waitForTimeout(200);
  const suporta = await p.evaluate(() => typeof document.startViewTransition === 'function');
  if (!suporta) return { nome, suporta };
  await p.evaluate(css => {
    let st = document.getElementById('sonda-vt');
    if (!st) { st = document.createElement('style'); st.id = 'sonda-vt'; document.head.appendChild(st); }
    st.textContent = '::view-transition-group(root){animation-duration:600ms} ' + css;
    window.__vtFim = null;
    const t = document.startViewTransition(() => window.__escopo(`CTX.vaiPara('dias')`));
    t.finished.then(() => { window.__vtFim = performance.now(); });
  }, css);
  await p.waitForTimeout(150);
  const n0 = await p.evaluate(() => window.__m.toques.length);
  const t0 = await p.evaluate(() => performance.now());
  await p.locator('.ins-tab').nth(2).tap({ force: true });
  await p.waitForTimeout(800);
  return p.evaluate(({ nome, n0, t0 }) => ({
    nome, suporta: true,
    abaDepois: window.__escopo('view.aba'),
    toqueChegouAoClick: window.__m.toques.length > n0,
    alvoDoToque: window.__m.toques[n0] ? window.__m.toques[n0].alvo : (window.__m.toque ? window.__m.toque.alvo : null),
    vtTerminouMsDepoisDoToque: window.__vtFim ? Math.round(window.__vtFim - t0) : null
  }), { nome, n0, t0 });
}
out.viewTransition = [];
out.viewTransition.push(await vt('padrão do motor', ''));
out.viewTransition.push(await vt('com ::view-transition { pointer-events: none }', '::view-transition{pointer-events:none}'));

console.log(JSON.stringify(out, null, 1));
console.log('gravado em', grava('armadilhas', Object.assign({ motor: MOTOR, erros }, out)));
await b.close();
