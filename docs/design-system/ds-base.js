/* Página viva do design system do Lastro: ícones, peças de desenho, dados de
   exemplo e a navegação do aparelho. As telas estão em ds-telas.js; o
   documento (índice, fundamentos, componentes, fluxos, auditoria) em ds-doc.js. */

/* ---------------- ícones: grade 24, traço redondo ---------------- */
const I = (d, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ic = {
  hoje: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"/>'),
  dias: I('<circle cx="6" cy="7" r="1.6"/><circle cx="12" cy="7" r="1.6"/><circle cx="18" cy="7" r="1.6"/><circle cx="6" cy="13" r="1.6"/><circle cx="12" cy="13" r="1.6"/><circle cx="18" cy="13" r="1.6"/><circle cx="6" cy="19" r="1.6"/>'),
  corpo: I('<circle cx="12" cy="5" r="2.6"/><path d="M5 11.5c2.3 1 4.6 1.5 7 1.5s4.7-.5 7-1.5M12 13v4l-2.8 4.5M12 17l2.8 4.5"/>'),
  semana: I('<path d="M3.5 17l5-5.5 4 3.5 8-9"/><path d="M15.5 6h5v5"/>'),
  plano: I('<path d="M6 4h12v16.5l-6-3.5-6 3.5z"/>'),
  mais: I('<path d="M12 5v14M5 12h14"/>', 2.6),
  ok: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.8),
  seta: I('<path d="M5 12h14M13 6l6 6-6 6"/>', 2.4),
  volta: I('<path d="M15 5.5L8.5 12l6.5 6.5"/>', 2.4),
  dir: I('<path d="M9 5.5l6.5 6.5L9 18.5"/>', 2.2),
  baixo: I('<path d="M6 9.5l6 6 6-6"/>', 2.4),
  cima: I('<path d="M6 14.5l6-6 6 6"/>', 2.4),
  x: I('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', 2.4),
  ajuste: I('<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2.2"/><circle cx="8" cy="16" r="2.2"/>'),
  duvida: I('<path d="M9.2 9.3a2.9 2.9 0 1 1 4.6 2.3c-1.1.8-1.8 1.4-1.8 2.6M12 17.6v.1"/>', 2.4),
  halter: I('<path d="M7 8v8M4 10v4M17 8v8M20 10v4M7 12h10"/>', 2.2),
  prato: I('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>'),
  lista: I('<path d="M4 7h16M4 12h16M4 17h10"/>', 2.2),
  troca: I('<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4"/>', 2.2),
  pula: I('<path d="M5 5.5l9 6.5-9 6.5zM18 5.5v13"/>', 2.2),
  fim: I('<path d="M12 5v10M8 11l4 4 4-4M5 19h14"/>', 2.2),
  atencao: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v5M12 16.2v.1"/>', 2.2),
  sobe: I('<path d="M4 17l5.5-6 4 3.5L20 7"/><path d="M15 7h5v5"/>', 2.2),
  cam: I('<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.2"/>'),
  um: I('<circle cx="12" cy="7" r="3.2"/><path d="M5.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6"/>'),
  dois: I('<circle cx="8.5" cy="8" r="2.8"/><circle cx="16.5" cy="9" r="2.3"/><path d="M3 19.5c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5M14.5 14.8c2.9-.6 5.4 1 6 4.2"/>'),
  tripe: I('<rect x="8.5" y="3.5" width="7" height="10" rx="1.8"/><path d="M12 13.5v3M12 16.5l-4.5 4M12 16.5l4.5 4"/>'),
  som: I('<path d="M4 10v4h3.5L12 18V6L7.5 10zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>'),
  nivel: I('<rect x="3.5" y="9" width="17" height="6" rx="3"/><circle cx="12" cy="12" r="1.6"/>'),
  alt: I('<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>'),
  dist: I('<path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/>'),
  gira: I('<path d="M19.5 12a7.5 7.5 0 11-2.6-5.7"/><path d="M19.5 4v4.5H15"/>', 2.2),
  lixo: I('<path d="M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7"/>'),
  play: I('<path d="M8 5.5l10 6.5-10 6.5z"/>', 2.2),
  envia: I('<path d="M12 15V4.5M8 8l4-3.5L16 8M5 14.5V19h14v-4.5"/>', 2.2),
  lupa: I('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', 2.2),
  nuvem: I('<path d="M7 18.5a4.5 4.5 0 01-.5-9A6 6 0 0118 10.5a4 4 0 01-.5 8z"/>'),
  semrede: I('<path d="M7 18.5a4.5 4.5 0 01-.5-9A6 6 0 0118 10.5a4 4 0 01-.5 8z"/><path d="M4 4l16 16"/>'),
  texto: I('<path d="M5 6h14M5 10.5h14M5 15h9"/>', 2.2),
  quadro: I('<rect x="3.5" y="5" width="17" height="12" rx="2"/><path d="M8 20h8M12 17v3"/>'),
  repete: I('<path d="M4 11a8 8 0 0114-4.5M20 4v4h-4M20 13a8 8 0 01-14 4.5M4 20v-4h4"/>', 2.2),
  copia: I('<rect x="8" y="8" width="11.5" height="11.5" rx="2"/><path d="M5 15.5V5.5a1 1 0 011-1h10"/>'),
  agua: I('<path d="M12 3.5c3.5 4.2 6 7.3 6 10.3a6 6 0 01-12 0c0-3 2.5-6.1 6-10.3z"/>'),
  bike: I('<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l2 7h-6M14 6h3"/>'),
  cadeado: I('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>'),
  sair: I('<path d="M14 5h4.5v14H14M10 8l-4 4 4 4M6 12h9.5"/>', 2.2),
  editar: I('<path d="M4.5 19.5l1-4.2L15.8 5a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L8.7 18.5z"/>')
};

/* ---------------- números em português ---------------- */
const vir = v => String(v).replace('.', ',').replace('-', '−');
const f1 = v => vir((Math.round(v * 10) / 10).toFixed(1));
const sinal = v => (v > 0 ? '+' : v < 0 ? '−' : '') + f1(Math.abs(v)).replace('−', '');
const milhar = v => Math.round(v).toLocaleString('pt-BR');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ---------------- peças de desenho ---------------- */
const at = o => Object.entries(o || {}).filter(([, v]) => v != null && v !== false).map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
const H = {
  momento: o => `<section class="momento ${o.fino ? 'fino' : ''}" style="--cor:var(--${o.cor || 'assunto-treino'})">
      <div class="linha0">${o.linha0 || ''}</div>
      <div class="${o.anima === false ? '' : 'entra'}">
        ${o.quando ? `<p class="quando">${o.vivo ? '<i></i>' : ''}${o.quando}</p>` : ''}
        ${o.antes || ''}
        ${o.titulo ? `<h1 class="heroi ${o.titulo.replace(/<[^>]+>/g, '').length > 12 && !o.grande ? 'm' : ''}">${o.titulo}</h1>` : ''}
        ${o.apoio ? `<p class="apoio">${o.apoio}</p>` : ''}
        ${o.meio || ''}
        ${o.acoes ? `<div class="acoes">${o.acoes}</div>` : ''}
        ${o.saidas ? `<div class="saidas">${o.saidas}</div>` : ''}
      </div></section>`,
  cab: (t, nota, o = {}) => o.lugar
    ? `<header class="cab"><h1>${t}</h1>${nota ? `<span>${nota}</span>` : ''}</header>`
    : `<header class="cab d"><button class="ico" data-voltar aria-label="Voltar">${ic.volta}</button><h1 class="${o.longo ? 'l' : ''}">${t}</h1>${o.dir || (nota ? `<span style="padding-right:8px">${nota}</span>` : '')}</header>`,
  secao: (t, nota, corpo, o = {}) => `<section class="secao" ${o.style ? `style="${o.style}"` : ''}>${t ? `<h2 class="h">${t}${nota ? ` <small>${nota}</small>` : ''}</h2>` : ''}<div class="${t ? 'corpo' : ''}">${corpo}</div></section>`,
  lin: o => {
    const marca = o.marca === 'mais' ? ic.mais : o.marca === 'nada' ? '' : ic.dir;
    const tag = o.tag || 'button';
    return `<${tag} class="lin ${o.off ? 'off' : ''} ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-desfazer': o.desfazer, 'aria-label': o.aria })}>
      ${o.o ? `<span class="o ${o.oc || ''}">${o.o}</span>` : ''}<span class="tx"><b>${o.t}</b>${o.a ? `<span class="${o.n ? 'n' : ''}">${o.a}</span>` : ''}</span>
      ${o.sp ? `<span class="sp">${o.sp}</span>` : ''}${o.val != null ? `<span class="val n">${o.val}${o.un ? `<small>${o.un}</small>` : ''}</span>` : ''}${o.extra || ''}${marca}</${tag}>`;
  },
  vai: (t, o = {}) => `<button class="vai ${o.g ? 'g' : ''} ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-lugar': o.lugar, 'aria-disabled': o.off ? 'true' : null, 'data-est': o.est, style: o.style })}>${t}</button>`,
  alt: (t, o = {}) => `<button class="alt ${o.cheio ? 'cheio' : ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-lugar': o.lugar, 'data-est': o.est, 'aria-disabled': o.off ? 'true' : null, style: o.style })}>${t}</button>`,
  saida: (t, o = {}) => `<button class="saida" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-est': o.est, 'data-lugar': o.lugar })}>${t}</button>`,
  resp: (ops, sel, o = {}) => `<div class="resp ${o.fundo ? 'sobre-fundo' : ''}" role="radiogroup" aria-label="${o.nome || 'Resposta'}">${ops.map(x => `<button role="radio" data-radio aria-checked="${x === sel}">${x}</button>`).join('')}</div>`,
  pergunta: (p, small, ops, sel) => `<div class="pergunta"><p class="pq">${p}</p>${small ? `<small>${small}</small>` : ''}${H.resp(ops, sel, { nome: p })}</div>`,
  seg: (ops, sel, nome) => `<div class="seg" role="radiogroup" aria-label="${nome || ''}">${ops.map(x => `<button role="radio" data-radio aria-checked="${x === sel}">${x}</button>`).join('')}</div>`,
  fichas: (ops, sel, nome) => `<div class="fita-f" role="radiogroup" aria-label="${nome || ''}">${ops.map((x, i) => `<button role="radio" data-radio aria-checked="${i === sel}">${x}</button>`).join('')}</div>`,
  q: o => `<${o.ir || o.folha ? 'button' : 'div'} class="q" ${at({ 'data-ir': o.ir, 'data-folha': o.folha })}><b class="n">${o.v}${o.u ? ` <small>${o.u}</small>` : ''}</b>${o.l}${o.sp ? `<div class="sp">${o.sp}</div>` : ''}</${o.ir || o.folha ? 'button' : 'div'}>`,
  quadros: (l, col) => `<div class="quadros" style="--col:${col || 2}">${l.map(H.q).join('')}</div>`,
  selo: (t, tom, i) => `<span class="selo ${tom || ''}">${i || ''}${t}</span>`,
  segs: (n, f, a, extra) => `<div class="segs" role="img" aria-label="${f} de ${n}">${Array.from({ length: n }, (_, j) => `<i class="${j < f ? 'f' : j === a ? 'a' : ''} ${extra && extra.includes(j) ? 'vao' : ''}"></i>`).join('')}</div>`,
  esc: (k, ico, t, a, sel) => `<button class="esc" role="radio" data-radio aria-checked="${!!sel}">${ico ? `<span class="o">${ico}</span>` : ''}<span><b>${t}</b><span class="c">${a}</span></span></button>`,
  chave: (t, a, on) => `<button class="chave-l" role="switch" data-chave aria-checked="${!!on}"><span class="tx"><b>${t}</b>${a ? `<span>${a}</span>` : ''}</span><span class="chave" aria-hidden="true"></span></button>`,
  vazio: (h, p, b) => `<div class="vazio"><h3>${h}</h3><p>${p}</p>${b ? `<div class="acoes">${b}</div>` : ''}</div>`,
  caixa: (tom, p, small, bs) => `<div class="caixa ${tom || ''}" role="${tom === 'a' ? 'status' : 'note'}"><p>${p}${small ? `<small>${small}</small>` : ''}</p>${bs ? `<div class="bs">${bs}</div>` : ''}</div>`,
  peq: (t, o = {}) => `<button class="peq ${o.f ? 'f' : ''} ${o.c ? 'c' : ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-fecha': o.fecha, 'data-est': o.est, 'data-desfazer': o.desfazer, 'data-voltar': o.voltar })}>${t}</button>`,
  folha: (t, sub, corpo) => `<div class="puxa" aria-hidden="true"></div><h2 class="ft" id="folha-t">${t}</h2>${sub ? `<p class="fs">${sub}</p>` : ''}${corpo || ''}`,
  op: (ico, t, a, o = {}) => `<button class="op ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-est': o.est })}><span class="o">${ico}</span><span class="tx"><b>${t}</b>${a ? `<span>${a}</span>` : ''}</span>${o.dir ? ic.dir : ''}</button>`,
  topoA: (esq, meio, dir) => `<div class="topo-a">${esq}<span class="mid">${meio}</span>${dir || '<span style="min-width:44px"></span>'}</div>`,
  campo: (rot, tipo, val, o = {}) => `<label class="campo ${o.erro ? 'erro' : ''}"><span>${rot}</span><input type="${tipo}" value="${esc(val || '')}" ${o.ac ? `autocomplete="${o.ac}"` : ''} ${o.im ? `inputmode="${o.im}"` : ''}>${o.erro ? `<span class="msg">${ic.atencao}${o.erro}</span>` : ''}</label>`
};

/* a régua: o número se arrasta. `alvo` é o seletor do número grande que acompanha */
let reguaN = 0;
function regua(o) {
  const id = 'rg' + (++reguaN), n = Math.round((o.mx - o.mn) / o.st);
  let t = '';
  for (let i = 0; i <= n; i++) { const v = Math.round((o.mn + i * o.st) * 100) / 100, g = Math.abs(v / o.cada - Math.round(v / o.cada)) < 1e-6; t += `<i class="tk ${g ? 'g' : ''}" ${g ? `data-r="${vir(v)}"` : ''}></i>`; }
  return `<div class="regua" style="--passo:${o.px}px"><div class="rola" id="${id}" role="slider" tabindex="0" aria-label="${o.nome}" aria-valuemin="${o.mn}" aria-valuemax="${o.mx}" aria-valuenow="${o.v}" aria-valuetext="${vir(o.v)} ${o.un || ''}"
    data-mn="${o.mn}" data-st="${o.st}" data-px="${o.px}" data-v="${o.v}" data-alvo="${o.alvo || ''}" data-dec="${o.dec || 0}" data-un="${o.un || ''}" data-kcal="${o.kcal || ''}"><div class="fita">${t}</div></div></div>
    ${o.passos === false ? '' : `<div class="passos-r"><button data-passo="-1" data-r="${id}" aria-label="menos ${vir(o.st)} ${o.un || ''}">−</button><button data-passo="1" data-r="${id}" aria-label="mais ${vir(o.st)} ${o.un || ''}">+</button></div>`}`;
}
function armaReguas(raiz) {
  raiz.querySelectorAll('.rola').forEach(el => {
    const mn = +el.dataset.mn, st = +el.dataset.st, px = +el.dataset.px, dec = +el.dataset.dec;
    el.scrollLeft = (+el.dataset.v - mn) / st * px;
    const pinta = v => {
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', vir(v.toFixed(dec)) + ' ' + el.dataset.un);
      if (el.dataset.alvo) document.querySelectorAll(el.dataset.alvo).forEach(a => { a.textContent = vir(v.toFixed(dec)); });
      if (el.dataset.kcal) document.querySelectorAll('[data-kcal-de]').forEach(a => { a.textContent = Math.round(+el.dataset.kcal * v / 100); });
      const g = raiz.querySelector('[data-guarda]'); if (g) { g.classList.remove('espera'); g.innerHTML = ic.ok + ' ' + g.dataset.guarda.replace('#', vir(v.toFixed(dec))); }
    };
    let ult = +el.dataset.v;
    el.addEventListener('scroll', () => { const v = Math.round((mn + Math.round(el.scrollLeft / px) * st) * 100) / 100; if (v !== ult) { ult = v; pinta(v); } }, { passive: true });
    el.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (d) { e.preventDefault(); el.scrollLeft += d * px; } });
  });
}

/* ---------------- o manequim das fotos (no app, a foto é a foto) ---------------- */
function gente(p, s, fantasma) {
  const k = s / 10, o = 25 + 4 * k, c = 15 + 1.5 * k, cor = fantasma ? 'none' : '#3A3934', tr = fantasma ? 'stroke="#0F0F0D" stroke-width="1.6" stroke-dasharray="4 4"' : '';
  const L = (d, w) => fantasma ? `<path d="${d}" fill="none" stroke="#0F0F0D" stroke-width="1.6" stroke-dasharray="4 4"/>` : `<path d="${d}" fill="none" stroke="#3A3934" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let arms = ''; const sx = p.v === 'perfil' ? .58 : 1, ox = 60 - o, dx = 60 + o;
  if (p.b === 'solto') arms = L(`M${ox} 64L${ox - 7} 150`, 11) + L(`M${dx} 64L${dx + 7} 150`, 11);
  if (p.b === 'A') arms = L(`M${ox} 64L${ox - 26} 140`, 11) + L(`M${dx} 64L${dx + 26} 140`, 11);
  if (p.b === 'biceps') arms = L(`M${ox} 64L${ox - 24} 62L${ox - 26} 30`, 11) + L(`M${dx} 64L${dx + 24} 62L${dx + 26} 30`, 11);
  if (p.b === 'nuca') arms = L(`M${ox} 64L${ox - 18} 44L60 26`, 10) + L(`M${dx} 64L${dx + 18} 44L60 26`, 10);
  if (p.b === 'cintura') arms = L(`M${ox} 64L${ox - 22} 104L${60 - c} 136`, 10) + L(`M${dx} 64L${dx + 22} 104L${60 + c} 136`, 10);
  if (p.v === 'perfil' && p.b === 'solto') arms = L('M62 66L66 150', 11);
  if (p.v === 'perfil' && p.b === 'nuca') arms = L('M60 64L86 44L62 28', 10);
  const tronco = `M${ox} 58Q60 50 ${dx} 58L${60 + c} 138L${60 + c + 4} 168L${60 - c - 4} 168L${60 - c} 138Z`;
  const corpo = `<circle cx="60" cy="27" r="15" fill="${cor}" ${tr}/><path d="M54 40h12v14H54z" fill="${cor}" ${tr}/><path d="${tronco}" fill="${cor}" ${tr}/>` + L(`M${60 - c + 3} 168L47 288`, 17) + L(`M${60 + c - 3} 168L73 288`, 17) + arms;
  return `<svg viewBox="0 0 120 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="translate(60 0) scale(${sx} 1) translate(-60 0)">${corpo}</g></svg>`;
}
const foto = (p, s, marca, extra) => `<span class="foto" role="img" aria-label="${p.n}" ${extra || ''}>${gente(p, s)}${marca ? '<span class="marca" title="fora do padrão"></span>' : ''}</span>`;

/* ---------------- gráficos ---------------- */
function linha(pts, o = {}) {
  const W = 340, Ht = o.h || 120, x0 = o.x0 ?? pts[0][0], x1 = o.x1 ?? pts[pts.length - 1][0];
  const ys = pts.map(p => p[1]).concat((o.pontos || []).map(p => p[1])), mn = Math.min(...ys) - (o.folga || .4), mx = Math.max(...ys) + (o.folga || .4);
  const X = d => (d - x0) / (x1 - x0 || 1) * W, Y = v => Ht - (v - mn) / (mx - mn) * Ht; let s = '';
  if (o.banda) s += `<path d="M${X(o.banda[0])} ${Y(o.banda[1])}L${X(x1)} ${Y(o.banda[1] + (x1 - o.banda[0]) / 7 * .30)}L${X(x1)} ${Y(o.banda[1] + (x1 - o.banda[0]) / 7 * .15)}Z" fill="#D3C6FF"/>`;
  (o.marcas || []).filter(d => d >= x0).forEach(d => { s += `<path d="M${X(d)} ${Ht + 6}v8" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round"/>`; });
  (o.pontos || []).filter(p => p[0] >= x0).forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2.6" fill="#0F0F0D" opacity=".3"/>`; });
  const v = pts.filter(p => p[0] >= x0 - 7);
  s += `<path d="${v.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('')}" fill="none" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.bolas) v.slice(0, -1).forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="5" fill="#F6F3EC" stroke="#0F0F0D" stroke-width="3"/>`; });
  if (o.cur != null) { s += `<path d="M${X(o.cur)} -6V${Ht + 14}" stroke="#0F0F0D" stroke-width="2" stroke-dasharray="3 4"/><circle cx="${X(o.cur)}" cy="${Y(o.curY)}" r="7" fill="#D2F23A" stroke="#0F0F0D" stroke-width="3"/>`; }
  else { const u = v[v.length - 1]; s += `<circle cx="${X(u[0])}" cy="${Y(u[1])}" r="6" fill="${o.corFim || '#D3C6FF'}" stroke="#0F0F0D" stroke-width="3"/>`; }
  if (o.rotulos) s += `<text x="0" y="${Ht + 24}" font-family="Bricolage Grotesque" font-weight="700" font-size="12" fill="#62615A">${o.rotulos[0]}</text><text x="${W}" y="${Ht + 24}" text-anchor="end" font-family="Bricolage Grotesque" font-weight="700" font-size="12" fill="#62615A">${o.rotulos[1]}</text>`;
  return `<svg class="graf" viewBox="-8 -12 356 ${Ht + 40}" role="img" aria-label="${o.rotulo || 'gráfico'}">${s}</svg>`;
}
const mini = ys => { const mn = Math.min(...ys), mx = Math.max(...ys), n = ys.length; return `<svg viewBox="-3 -3 70 36" preserveAspectRatio="none" aria-hidden="true"><path d="${ys.map((y, i) => (i ? 'L' : 'M') + (i / Math.max(1, n - 1) * 64).toFixed(1) + ' ' + (30 - (mx === mn ? .5 : (y - mn) / (mx - mn)) * 30).toFixed(1)).join('')}" fill="none" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`; };

/* ---------------- dados de exemplo (o produto de verdade) ---------------- */
const D = {
  REF: [
    { id: 'pre', h: '05h45', n: 'Pré-treino', k: 163, it: [['Pão Artesano', '35 g', 98], ['Doce de leite', '20 g', 62], ['Café preto', '200 ml', 3]], so: true },
    { id: 'cafe', h: '08h00', n: 'Café da manhã', k: 629, it: [['Cuscuz cozido', '200 g', 224], ['Frango cozido', '70 g', 116], ['Requeijão light', '30 g', 54], ['Leite integral', '250 ml', 153], ['Uva', '120 g', 82]] },
    { id: 'almoco', h: '12h30', n: 'Almoço', k: 719, it: [['Arroz branco cozido', '250 g', 320], ['Feijão cozido', '50 g', 38], ['Frango cozido', '80 g', 132], ['Legumes e verduras', '100 g', 35], ['Azeite de oliva', '15 g', 133], ['Kiwi', '100 g', 61]] },
    { id: 'lanche', h: '16h00', n: 'Lanche da tarde', k: 819, it: [['Leite integral', '250 ml', 153], ['Banana', '120 g', 107], ['Aveia', '40 g', 156], ['Whey', '30 g', 120], ['Pão Artesano', '50 g', 140]] },
    { id: 'jantar', h: '19h30', n: 'Jantar', k: 678, it: [['Arroz branco cozido', '250 g', 320], ['Feijão cozido', '50 g', 38], ['Lombo suíno cozido', '80 g', 168], ['Legumes e verduras', '100 g', 35]] },
    { id: 'ceia', h: '21h30', n: 'Ceia', k: 197, it: [['Leite integral', '250 ml', 153], ['Neston 3 cereais', '12 g', 46]] }
  ],
  EX: [
    { id: 'ag', n: 'Agachamento no Smith', g: 'quadríceps', s: 2, f: [6, 10], rir: '1–2', un: 'kg por lado', d: 'Amplitude máxima confortável. Pés na mesma posição de sempre.', h: [['30/09', 55, [9, 8]], ['07/10', 55, [10, 9]], ['14/10', 57.5, [8, 8]], ['21/10', 60, [9, 10]]], sub: ['Hack machine', 'Leg press 45°'] },
    { id: 'fl', n: 'Cadeira flexora sentada', g: 'posterior', s: 4, f: [8, 12], rir: '1', un: 'kg', d: 'Volte em 2 a 3 segundos.', h: [['23/09', 40, [12, 11, 10, 10]], ['30/09', 42.5, [11, 10, 10, 9]], ['07/10', 42.5, [12, 11, 11, 10]], ['14/10', 45, [11, 11, 10, 10]], ['21/10', 45, [12, 12, 12, 12]]], sub: ['Mesa flexora', 'Flexora unilateral'] },
    { id: 'tr', n: 'Terra romeno no Smith', g: 'posterior', s: 3, f: [6, 10], rir: '1–2', un: 'kg por lado', d: 'Quem protege a lombar é o quadril.', h: [['30/09', 50, [9, 9, 8]], ['07/10', 50, [9, 9, 8]], ['14/10', 50, [9, 9, 8]], ['21/10', 50, [9, 9, 8]]], sub: ['Stiff com halteres'] },
    { id: 'lp', n: 'Leg press', g: 'quadríceps', s: 2, f: [10, 15], rir: '1–2', un: 'kg', d: 'Desça até onde o quadril não sai do banco.', h: [['07/10', 150, [13, 12]], ['14/10', 160, [12, 11]], ['21/10', 160, [14, 12]]], sub: ['Hack machine'] },
    { id: 'ex', n: 'Cadeira extensora', g: 'quadríceps', s: 1, f: [10, 15], rir: '0–1', un: 'kg', d: 'Um segundo parado no topo.', h: [['07/10', 50, [15]], ['14/10', 55, [12]], ['21/10', 55, [13]]], sub: ['Extensora unilateral'] },
    { id: 'ep', n: 'Elevação pélvica na máquina', g: 'glúteo', s: 3, f: [8, 12], rir: '1', un: 'kg', d: 'Queixo recolhido, costelas para baixo.', h: [['07/10', 75, [12, 11, 10]], ['14/10', 80, [11, 10, 10]], ['21/10', 80, [12, 11, 10]]], sub: ['Elevação pélvica na barra'] },
    { id: 'ad', n: 'Adutora', g: 'adutores', s: 2, f: [10, 15], rir: '1', un: 'kg', d: 'Sem embalo na abertura.', h: [['07/10', 45, [15, 14]], ['14/10', 50, [13, 12]], ['21/10', 50, [14, 13]]], sub: ['Adutora no cabo'] },
    { id: 'pp', n: 'Panturrilha em pé', g: 'panturrilha', s: 3, f: [6, 10], rir: '1', un: 'kg', d: 'Dois segundos alongado embaixo.', h: [['07/10', 70, [10, 9, 8]], ['14/10', 70, [10, 9, 8]], ['21/10', 70, [10, 9, 8]]], sub: ['Panturrilha no leg press'] },
    { id: 'ps', n: 'Panturrilha sentada', g: 'panturrilha', s: 2, f: [10, 15], rir: '1', un: 'kg', d: 'Amplitude inteira, sem quicar.', h: [['07/10', 32.5, [15, 13]], ['14/10', 35, [13, 12]], ['21/10', 35, [14, 12]]], sub: ['Panturrilha unilateral'] }
  ],
  TR: [['A', 'Peito superior, dorsais, lateral, tríceps', 20, 1], ['B', 'Pernas completas e panturrilhas', 22, 0], ['C', 'Costas, deltoides, bíceps', 17, 1], ['D', 'Lateral, panturrilha, abdômen', 18, 2], ['E', 'Peito superior, costas, braços', 18, 5]],
  POSES: [
    { n: 'Frente relaxado', v: 'frente', b: 'solto', fala: 'Braços soltos, um palmo do corpo. Solte o ar e segure.', conf: 'pés no T · braços um palmo do corpo' },
    { n: 'Frente braços afastados', v: 'frente', b: 'A', fala: 'Abra os braços em A, palmas para a frente.', conf: 'braços longe da cintura' },
    { n: 'Frente duplo bíceps', v: 'frente', b: 'biceps', fala: 'Duplo bíceps, cotovelos na altura do ombro.', conf: 'punhos podem passar da linha de cima' },
    { n: 'Abdômen e coxa', v: 'frente', b: 'nuca', fala: 'Mãos na nuca, olhe para a frente, uma perna à frente.', conf: 'cabeça reta' },
    { n: 'Perfil direito', v: 'perfil', b: 'solto', fala: 'Um quarto de volta. Braços soltos ao lado do corpo.', conf: 'ombro e quadril alinhados' },
    { n: 'Perfil direito natural', v: 'perfil', b: 'solto', fala: 'Marque passo três vezes e pare como parou.', conf: 'postura do dia a dia, sem arrumar' },
    { n: 'Perfil mãos na nuca', v: 'perfil', b: 'nuca', fala: 'Mãos na nuca, cotovelos para a frente.', conf: 'cotovelo não cobre o tronco' },
    { n: 'Costas relaxado', v: 'costas', b: 'solto', fala: 'Braços soltos, um palmo do corpo.', conf: 'pés no T' },
    { n: 'Costas duplo bíceps', v: 'costas', b: 'biceps', fala: 'Duplo bíceps, abra as costas.', conf: 'cotovelos na altura do ombro' },
    { n: 'Costas mãos na cintura', v: 'costas', b: 'cintura', fala: 'Mãos só apoiadas na cintura, sem apertar.', conf: 'mãos sem pinçar' },
    { n: 'Perfil esquerdo', v: 'perfil', b: 'solto', fala: 'Braços soltos ao lado do corpo.', conf: 'ombro e quadril alinhados' }
  ],
  SES: [['06/07', 72.4, null, ''], ['21/07', 73.0, null, ''], ['06/08', 73.6, null, ''], ['16/08', 74.0, null, ''], ['24/08', 74.3, null, ''], ['04/09', 74.9, null, ''], ['20/09', 75.6, null, ''], ['01/10', 76.3, 84.5, ''], ['15/10', 77.1, null, ''], ['29/10', 77.6, 86.0, 'outra luz'], ['12/11', 77.9, null, '']],
  SEM: [74.3, 75.3, 76.2, 77.3, 78.2, 78.2, 77.8, 77.9, 77.6]
};
D.PESAGENS = (() => { const r = [], pe = d => { const i = Math.min(7, Math.floor(d / 7)), t = (d - i * 7) / 7; return D.SEM[i] + (D.SEM[i + 1] - D.SEM[i]) * t; }; for (let d = 0; d < 54; d++) if ((d * 7) % 9 < 7 && r.length < 43) r.push([d, Math.round((pe(d) + Math.sin(d * 2.3) * .45) * 10) / 10]); r.push([54, 77.6]); D.pesoEm = pe; return r; })();
D.SEMPTS = D.SEM.map((v, i) => [i * 7, v]);
const DIA0 = new Date(2026, 8, 20);
const dataDe = d => { const x = new Date(DIA0.getTime() + d * 864e5); return String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0'); };

/* ---------------- a navegação do aparelho ---------------- */
const TELAS = {};        // registradas por ds-telas.js
const ORDEM = [];
function tela(t) { TELAS[t.id] = t; ORDEM.push(t.id); }
const GRUPOS = [['geral', 'Moldura e estados', 'assunto-feito'], ['hoje', 'Hoje', 'assunto-treino'], ['treino', 'Treino', 'assunto-treino'], ['dias', 'Dias', 'assunto-corpo'], ['corpo', 'Corpo', 'assunto-corpo'], ['fotos', 'Fotos', 'assunto-corpo'], ['semana', 'Semana', 'assunto-semana'], ['plano', 'Plano', 'assunto-refeicao'], ['ajustes', 'Ajustes e primeira vez', 'superficie-quieta']];
const CAMADA = { lugar: 'lugar', destino: 'destino', acao: 'tela de ação', folha: 'folha' };
const LUGARES = [['hoje', 'Hoje'], ['dias', 'Dias'], ['corpo', 'Corpo'], ['semana', 'Semana'], ['plano', 'Plano']];

const P = { pilha: [], folha: null, glob: { rede: false, falha: false, treino: false }, desfazer: null };
const $ = s => document.querySelector(s);

function abreTela(id, est) {
  const t = TELAS[id]; if (!t) return;
  if (t.c === 'folha') { P.pilha = [{ id: t.base, e: TELAS[t.base].es ? TELAS[t.base].es[0][0] : null }]; P.folha = { id, e: est || (t.es ? t.es[0][0] : null) }; }
  else { P.pilha = [{ id, e: est || (t.es ? t.es[0][0] : null) }]; P.folha = null; }
  if (t.glob) Object.assign(P.glob, t.glob);
}
const topo = () => P.pilha[P.pilha.length - 1];
const atual = () => P.folha || topo();
function hashDe() { const a = atual(); return '#t-' + a.id + (a.e && TELAS[a.id].es && a.e !== TELAS[a.id].es[0][0] ? '--' + a.e : ''); }

/* O tipo de troca diz o movimento (07-fluidez-e-estabilidade.md, regra 4). */
let ULT = { chave: null, id: null, n: 0, faixas: null };
/* O toque durante uma transição vale (regra 5): o Safari entrega o toque à camada da
   transição, e não ao botão; então o toque encerra a transição e vai para quem está
   embaixo do dedo. */
let VT = null, tocouNaTransicao = false;
document.addEventListener('pointerdown', () => { if (VT) { tocouNaTransicao = true; VT.skipTransition(); } }, true);
document.addEventListener('click', ev => {
  if (!tocouNaTransicao) return;
  tocouNaTransicao = false;
  const alvo = document.elementFromPoint(ev.clientX, ev.clientY);
  // o clique caiu num contêiner porque o dedo desceu sobre a imagem da transição: entrega a quem está embaixo
  if (alvo && alvo !== ev.target && ev.target.contains(alvo)) { ev.stopImmediatePropagation(); ev.preventDefault(); alvo.click(); }
}, true);
const reduzMovimento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function tipoDe(b) {
  if (!ULT.id) return null;
  const a = TELAS[ULT.id], t = TELAS[b.id], n = P.pilha.length;
  if (ULT.id === b.id) return t.c === 'acao' ? 'passo' : 'estado';
  if (a.c === 'acao' && t.c === 'acao') return 'passo';
  if (n > ULT.n) return t.c === 'acao' ? 'sobe' : 'entra';
  if (n < ULT.n) return a.c === 'acao' ? 'desce' : 'sai';
  if (a.c === 'acao') return 'desce';
  return 'lugar';
}
/* Âncoras: o mesmo nome antes e depois mantém o elemento no lugar. */
function nomeia(el, tipo) {
  el.querySelectorAll('[data-vt]').forEach(x => { x.style.viewTransitionName = ''; delete x.dataset.vt; });
  const poe = (x, n) => { if (x) { x.style.viewTransitionName = n; x.dataset.vt = n; } };
  el.style.viewTransitionName = 'tela';
  poe(el.querySelector('.pe-a, .pe-f'), 'pe'); poe(el.querySelector('.topo-a'), 'topo'); poe(el.querySelector('.segs'), 'segs');
  if (tipo === 'estado' || tipo === 'passo') {
    poe(el.querySelector('.momento'), 'momento'); poe(el.querySelector('.cab'), 'cab');
    el.querySelectorAll(':scope > .secao').forEach((x, i) => poe(x, 'sec' + i));
  }
}
function desenhaAparelho(primeira) {
  const raiz = $('#raiz');
  if (primeira || !$('#fone')) {
    ULT = { chave: null, id: null, n: 0, faixas: null };
    raiz.innerHTML = `<div class="palco"><div class="fone" id="fone">
        <div class="sim" role="group" aria-label="Navegação da página, não é do app"><a href="#indice" aria-label="Voltar ao índice do design system">${ic.volta}Índice</a><span class="nm" id="sim-nm"></span><select id="sim-e" aria-label="Estado desta tela"></select></div>
        <div class="meio" id="meio"><main class="tela" id="tela"></main><div class="gruda" id="gruda"></div><div id="tira"></div><div class="doca" id="doca"></div><div class="faixas" id="faixas"></div><div id="desf"></div>
          <div class="veu" id="veu"></div><section class="folha" id="folha" role="dialog" aria-modal="true" aria-labelledby="folha-t"></section></div></div>
      <aside class="lado" id="lado"></aside></div>`;
  }
  const b = topo(), tb = TELAS[b.id], lugar = tb.c === 'lugar';
  const chave = b.id + '|' + b.e + '|' + P.glob.treino;
  const mudouTela = chave !== ULT.chave;
  const tipo = mudouTela ? tipoDe(b) : null;
  const el = $('#tela');
  const pinta = () => {
    if (mudouTela) {
      const y = el.scrollTop;
      el.className = 'tela' + (lugar ? ' com-doca' : '') + (tb.c === 'acao' ? ' acao' : '');
      el.innerHTML = tb.r(b.e || '', P);
      // posição de leitura: o mesmo lugar ao mudar de estado, a de antes ao voltar, o topo ao entrar
      el.scrollTop = tipo === 'estado' ? y : (tipo === 'sai' || tipo === 'desce') ? (b.y || 0) : 0;
      armaReguas(el); if (window.armaExtras) armaExtras(el);
      nomeia(el, tipo);
      $('#doca').innerHTML = lugar ? `<nav class="nav" aria-label="Lugares">${LUGARES.map(l => `<button data-lugar="${l[0]}" aria-label="${l[1]}" ${l[0] === b.id ? 'aria-current="page"' : ''}>${ic[l[0]]}<span>${l[1]}</span></button>`).join('')}</nav><button class="mais" data-folha="f-registrar" aria-label="Registrar">${ic.mais}</button>` : '';
      $('#doca').classList.remove('mini');
      const andamento = b.id === 'hoje' && (b.e === 'andamento' || b.e === 'parado');
      el.classList.toggle('com-tira', !!(P.glob.treino && lugar && !andamento));
      $('#tira').innerHTML = P.glob.treino && lugar && !andamento ? `<button class="tira" data-ir="serie" aria-label="Voltar ao treino B, 8 de 22 séries"><i></i><span>Treino B · 8 de 22</span>${ic.seta}</button>` : '';
      const g = $('#gruda'); g.innerHTML = tb.gruda ? tb.gruda(b.e) : ''; g.classList.remove('on');
    }
    // faixas: só redesenha quando mudam, para não reanimar a cada navegação
    const fx = (P.glob.falha ? `<div class="faixa" role="alert">${ic.atencao}<span>1 série não foi guardada</span><button data-folha="f-falhou">Ver</button></div>` : '') + (P.glob.rede ? `<div class="faixa rede" role="status">${ic.semrede}<span>Sem rede. Tudo fica guardado neste aparelho.</span></div>` : '');
    if (fx !== ULT.faixas) { $('#faixas').innerHTML = fx; ULT.faixas = fx; }
    $('#desf').innerHTML = P.desfazer ? `<div class="desfazer ${lugar ? 'sobe' : ''}" role="status"><span>${P.desfazer}</span><button data-desfaz>Desfazer</button></div>` : '';
    const f = P.folha ? TELAS[P.folha.id] : null, fo = $('#folha'), veu = $('#veu');
    if (f) { fo.innerHTML = f.r(P.folha.e || '', P); armaReguas(fo); if (window.armaExtras) armaExtras(fo); fo.classList.add('on'); veu.classList.add('on'); fo.scrollTop = 0; }
    else { fo.classList.remove('on'); veu.classList.remove('on'); }
    const cur = atual(), tc = TELAS[cur.id];
    $('#sim-nm').textContent = tc.n;
    const se = $('#sim-e'); se.innerHTML = (tc.es || [['', 'um estado só']]).map(e => `<option value="${e[0]}" ${e[0] === (cur.e || '') ? 'selected' : ''}>${e[1]}</option>`).join(''); se.disabled = !tc.es;
    desenhaLado();
    ULT.chave = chave; ULT.id = b.id; ULT.n = P.pilha.length;
  };
  if (tipo && document.startViewTransition && !reduzMovimento()) {
    nomeia(el, tipo);
    document.documentElement.dataset.vt = tipo;
    const vt = VT = document.startViewTransition(() => { try { pinta(); } catch (e) { console.error('pinta', e); throw e; } });
    vt.finished.finally(() => { if (VT === vt) VT = null; if (document.documentElement.dataset.vt === tipo) delete document.documentElement.dataset.vt; });
  } else pinta();
  history.replaceState(null, '', hashDe());
  if (P.folha) setTimeout(() => { const t = $('#folha-t'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }, 60);
}

function desenhaLado() {
  const cur = atual(), t = TELAS[cur.id];
  const lk = ids => (ids || []).filter(i => TELAS[i]).map(i => `<a href="#t-${i}">${TELAS[i].n}</a>`).join('');
  const de = ORDEM.filter(i => (TELAS[i].vai || []).includes(cur.id));
  const chega = [...new Set([...(t.de || []), ...de])];
  $('#lado').innerHTML = `<h2>${t.n}</h2><span class="cam">${CAMADA[t.c]}${t.c === 'folha' ? ' sobre ' + TELAS[t.base].n : ''}</span>
    ${t.d ? `<p>${t.d}</p>` : ''}
    ${t.es ? `<h3>Estados</h3><div class="lks">${t.es.map(e => `<button data-est="${e[0]}" aria-pressed="${e[0] === cur.e}">${e[1]}</button>`).join('')}</div>` : ''}
    ${chega.length ? `<h3>Chega-se de</h3><div class="lks">${lk(chega)}</div>` : ''}
    ${(t.vai || []).length ? `<h3>Leva a</h3><div class="lks">${lk(t.vai)}</div>` : ''}
    <h3>O Voltar</h3><p style="margin-top:4px">${t.v || ({ lugar: 'Sai do app: é a raiz.', destino: 'Volta à tela de onde veio, na posição em que estava.', acao: 'Recolhe a tela de ação. O que foi confirmado já está guardado.', folha: 'Fecha a folha; a tela de baixo não mexe.' })[t.c]}</p>
    <h3>Simular no app inteiro</h3><div class="lks">${[['rede', 'sem rede'], ['falha', 'falha ao guardar'], ['treino', 'treino aberto']].map(x => `<button data-glob="${x[0]}" aria-pressed="${P.glob[x[0]]}">${x[1]}</button>`).join('')}</div>
    <h3>Todas as telas</h3>${GRUPOS.map(g => { const l = ORDEM.filter(i => TELAS[i].g === g[0]); return l.length ? `<details ${l.includes(cur.id) ? 'open' : ''}><summary>${g[1]} · ${l.length}</summary><div class="todas">${l.map(i => `<a href="#t-${i}" ${i === cur.id ? 'aria-current="true"' : ''}>${TELAS[i].n}</a>`).join('')}</div></details>` : ''; }).join('')}
    <p style="margin-top:22px">A tira tracejada no topo do aparelho é da página, não do app.</p>`;
}

function vaiPara(alvo, empilha = true) {
  const [id, e] = alvo.split('--'), t = TELAS[id]; if (!t) return;
  P.desfazer = null;
  if (t.c === 'folha') { if (t.base !== topo().id && !empilha) abreTela(id, e); P.folha = { id, e: e || (t.es ? t.es[0][0] : null) }; }
  else {
    P.folha = null; const el = $('#tela'), novo = { id, e: e || (t.es ? t.es[0][0] : null) };
    // passo da mesma tarefa (tela de ação para tela de ação) troca o topo: o Voltar recolhe a tarefa inteira
    if (TELAS[topo().id].c === 'acao' && t.c === 'acao') P.pilha[P.pilha.length - 1] = novo;
    else { if (el) topo().y = el.scrollTop; P.pilha.push(novo); }
  }
  desenhaAparelho();
}
function voltar() {
  if (P.folha) { P.folha = null; desenhaAparelho(); return; }
  if (P.pilha.length > 1) { P.pilha.pop(); desenhaAparelho(); return; }
  const t = TELAS[topo().id];
  if (t.c !== 'lugar') { P.pilha = [{ id: t.lugar || 'hoje', e: null }]; const l = TELAS[P.pilha[0].id]; P.pilha[0].e = l.es ? l.es[0][0] : null; desenhaAparelho(); }
}

/* cliques do aparelho */
document.addEventListener('click', ev => {
  if (!$('#fone')) return;
  if (ev.target.id === 'veu') { voltar(); return; }
  const b = ev.target.closest('[data-ir],[data-lugar],[data-folha],[data-voltar],[data-fecha],[data-est],[data-glob],[data-desfazer],[data-desfaz],[data-radio],[data-chave],[data-marca],[data-passo],[data-par]');
  if (!b || !b.closest('#fone, #lado')) return;
  const d = b.dataset;
  if (b.getAttribute('aria-disabled') === 'true') return;
  if (d.radio != null) { const g = b.closest('[role=radiogroup]') || b.parentElement; g.querySelectorAll('[data-radio]').forEach(x => x.setAttribute('aria-checked', x === b)); }
  if (d.chave != null) { b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true'); return; }
  if (d.marca != null) { b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true'); return; }
  if (d.passo) { const r = document.getElementById(d.r); r.scrollLeft += +d.passo * +r.dataset.px; return; }
  if (d.par) { const p = b.closest('.par'); p.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
  if (d.glob) { P.glob[d.glob] = !P.glob[d.glob]; desenhaAparelho(); return; }
  if (d.desfaz != null) { P.desfazer = null; $('#desf').innerHTML = ''; return; }
  if (d.est != null && b.closest('#lado, #fone')) { const a = atual(); a.e = d.est; desenhaAparelho(); return; }
  if (d.desfazer) { P.folha = null; desenhaAparelho(); P.desfazer = d.desfazer; $('#desf').innerHTML = `<div class="desfazer ${TELAS[topo().id].c === 'lugar' ? 'sobe' : ''}" role="status"><span>${d.desfazer}</span><button data-desfaz>Desfazer</button></div>`; return; }
  if (d.fecha != null) { voltar(); return; }
  if (d.voltar != null) { voltar(); return; }
  if (d.lugar) { abreTela(d.lugar); desenhaAparelho(); return; }
  if (d.folha) { vaiPara(d.folha); return; }
  if (d.ir) { vaiPara(d.ir); }
});
document.addEventListener('change', ev => { if (ev.target.id === 'sim-e') { atual().e = ev.target.value; desenhaAparelho(); } });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('#fone')) voltar(); });
let ultY = 0;
document.addEventListener('scroll', ev => {
  const t = ev.target; if (!t || t.id !== 'tela') return;
  const y = t.scrollTop, dc = $('#doca');
  if (dc) { if (y > ultY + 6 && y > 60) dc.classList.add('mini'); else if (y < ultY - 6 || y < 30) dc.classList.remove('mini'); }
  ultY = y;
  const g = $('#gruda'), m = t.querySelector('.momento');
  if (g && g.innerHTML && m) g.classList.toggle('on', y > m.offsetHeight - 70);
}, true);
