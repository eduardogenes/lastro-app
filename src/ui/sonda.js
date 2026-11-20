// A SONDA DE TELA. Liga em Ajustes → Diagnóstico da tela, no aparelho de
// verdade, e mede o que um print mostraria de errado: texto cortado, coisa
// fora da tela, rolagem lateral, animação parada no meio, a doca e as áreas
// seguras do iOS. Cada medição vira um arquivo JSON na pasta `diagnostico/`
// do dono na nuvem (ver `NUVEM.enviaDiagnostico`), lido no computador com
// `npm run sonda`.
//
// Só lê o DOM: não toca no estado, não grava no disco do app além da própria
// chave de ligar, e desligada não faz nada além de ler essa chave.

import { NUVEM } from '../infra/nuvem';

const CHAVE = 'lastro-sonda';
const ESPERA = 700;          // depois da última rolagem, troca de tela ou animação
const INTERVALO = 20000;     // a mesma tela não manda de novo antes disso
let ligada = false, timer = 0, obs = null, fila = Promise.resolve();
const ultimo = {};

export const SONDA = {
  ligada() { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } },
  liga(on) {
    try { on ? localStorage.setItem(CHAVE, '1') : localStorage.removeItem(CHAVE); } catch (e) {}
    on ? inicia() : para();
    if (on) agenda('ligou', true);
  },
  /** Chamar uma vez no boot. */
  pronta() { if (SONDA.ligada()) inicia(); }
};

function inicia() {
  if (ligada) return;
  ligada = true;
  if (!regua) {
    regua = document.createElement('div');
    regua.setAttribute('aria-hidden', 'true');
    regua.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(regua);
  }
  addEventListener('scroll', aoRolar, { passive: true, capture: true });
  addEventListener('resize', aoRolar);
  obs = new MutationObserver(() => agenda('mudou'));
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current', 'data-sai'] });
  agenda('abriu');
}

function para() {
  ligada = false;
  removeEventListener('scroll', aoRolar, { capture: true });
  removeEventListener('resize', aoRolar);
  if (obs) obs.disconnect();
  obs = null; clearTimeout(timer);
}

let rolando = 0;
function aoRolar() { rolando = Date.now(); agenda('rolou'); }

function agenda(motivo, ja) {
  if (!ligada) return;
  clearTimeout(timer);
  timer = setTimeout(() => mede(motivo, ja), ESPERA);
}

function tela() {
  const h1 = document.querySelector('.v3 h1, .v3 h2');
  const doca = document.querySelector('.v3-doca-n [aria-current="page"]');
  return ((doca && doca.getAttribute('aria-label')) || (doca && doca.textContent) || (h1 && h1.textContent) || 'app')
    .trim().slice(0, 40);
}

function caminho(el) {
  const p = [];
  for (let e = el; e && e !== document.body && p.length < 4; e = e.parentElement) {
    const c = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.') : '';
    p.unshift(e.tagName.toLowerCase() + (c ? '.' + c : ''));
  }
  return p.join(' > ');
}

function ret(r) { return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }

function visivel(el, cs) {
  return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
}

// Um elemento só, criado antes de observar: medir não pode virar mudança no
// DOM, senão a sonda acordaria a si mesma.
let regua = null;
function areasSeguras() {
  if (!regua) return null;
  const cs = getComputedStyle(regua);
  return { topo: cs.paddingTop, dir: cs.paddingRight, base: cs.paddingBottom, esq: cs.paddingLeft };
}

function mede(motivo, forca) {
  if (!ligada) return;
  const nome = tela();
  const agora = Date.now();
  // Rolar manda de novo, mas não mais que a cada 5 s: é rolando que a doca encolhe.
  const pausa = motivo === 'rolou' ? 5000 : INTERVALO;
  if (!forca && ultimo[nome] && agora - ultimo[nome] < pausa) return;
  const L = innerWidth, A = innerHeight;
  const achados = [];

  for (const el of document.querySelectorAll('body *')) {
    if (el === regua) continue;
    if (achados.length > 60) break;
    const cs = getComputedStyle(el);
    if (!visivel(el, cs)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > A) continue;
    const texto = (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
      ? el.textContent.trim().slice(0, 50) : '';
    // texto que não cabe na própria caixa e está sendo cortado
    // vale também quando o texto está num filho (o rótulo dentro do botão)
    const dentro = el.textContent.trim();
    if (dentro && el.clientWidth > 0 && (el.scrollWidth > el.clientWidth + 1) && /hidden|clip/.test(cs.overflow + cs.overflowX)) {
      achados.push({ tipo: 'texto cortado', texto: dentro.slice(0, 50), onde: caminho(el), caixa: ret(r), precisa: el.scrollWidth });
    }
    // o mesmo, quando quem corta é o pai
    const pai = el.parentElement;
    if (texto && pai && pai !== document.body) {
      const pcs = getComputedStyle(pai);
      const pr = pai.getBoundingClientRect();
      if (/hidden|clip/.test(pcs.overflow + pcs.overflowX) && (r.right > pr.right + 1 || r.left < pr.left - 1) && r.width > 0) {
        achados.push({ tipo: 'texto passa do pai', texto, onde: caminho(el), caixa: ret(r), pai: ret(pr) });
      }
    }
    // coisa fora da tela na horizontal
    if ((r.right > L + 1 || r.left < -1) && cs.position !== 'fixed' && r.width < L * 3) {
      achados.push({ tipo: 'fora da tela', texto, onde: caminho(el), caixa: ret(r) });
    }
  }

  const animacoes = (document.getAnimations ? document.getAnimations() : [])
    .filter(a => a.playState !== 'finished')
    .slice(0, 20)
    .map(a => ({ estado: a.playState, nome: a.animationName || a.transitionProperty || '', alvo: a.effect && a.effect.target ? caminho(a.effect.target) : '' }));

  const doca = document.querySelector('.v3-doca');
  const docaInfo = doca ? {
    classe: doca.className, caixa: ret(doca.getBoundingClientRect()),
    navegacao: (n => n ? ret(n.getBoundingClientRect()) : null)(doca.querySelector('.v3-doca-n')),
    botoes: [...doca.querySelectorAll('.v3-doca-n button')].map(b => {
      const cs = getComputedStyle(b);
      return { rotulo: (b.getAttribute('aria-label') || b.textContent || '').trim(), atual: b.getAttribute('aria-current') === 'page',
               caixa: ret(b.getBoundingClientRect()), opacidade: +(+cs.opacity).toFixed(2), largura: cs.width };
    })
  } : null;

  const rel = {
    quando: new Date().toISOString(), motivo, tela: nome, local: location.hash,
    rolandoHa: rolando ? agora - rolando : null,
    janela: { L, A, visual: window.visualViewport ? [Math.round(visualViewport.width), Math.round(visualViewport.height), Math.round(visualViewport.offsetTop)] : null,
              dpr: devicePixelRatio, rolagem: [Math.round(scrollX), Math.round(scrollY)],
              larguraDaPagina: document.documentElement.scrollWidth, alturaDaPagina: document.documentElement.scrollHeight },
    seguras: areasSeguras(),
    instalado: (window.matchMedia ? matchMedia('(display-mode: standalone)').matches : false) || navigator.standalone === true,
    navegador: navigator.userAgent,
    fontes: { titulo: document.fonts ? document.fonts.check('700 20px "Bricolage Grotesque Variable"') : null },
    rolagemLateral: document.documentElement.scrollWidth > L + 1,
    doca: docaInfo, animacoes, achados
  };
  ultimo[nome] = agora;
  try { sessionStorage.setItem(CHAVE + '-rel', JSON.stringify(rel)); } catch (e) {}
  const arquivo = rel.quando.replace(/[:.]/g, '-') + '-' + nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json';
  fila = fila.then(() => NUVEM.enviaDiagnostico(arquivo, JSON.stringify(rel))).then(r => {
    try { localStorage.setItem(CHAVE + '-ultimo', r.ok ? 'enviado ' + new Date().toLocaleTimeString() : 'falhou: ' + r.msg); } catch (e) {}
  }).catch(() => {});
}
