// O TOQUE QUE ESCURECE, na árvore montada.
//
// O pedido do dono (pergunta 7, 16/10): todo controle mostra que o dedo está
// nele, só pela cor — nada encolhe —, e mostra igual com "Reduzir movimento".
// Até a peça 1 do motion, de 115 controles do app 78 não mudavam nada com o
// dedo pousado, e o mais forte dos que mudavam media 1,24:1; o "+1 copo"
// trocava para a cor exata do bloco em volta, 1,00:1 (docs/motion/03 §1.3,
// 09 peça 1).
//
// O jsdom não pinta e não conhece `:active`, então este caso faz a conta que o
// navegador faria: lê as regras da folha EMBARCADA (a do build, que é o que vai
// para o iPhone), resolve a cascata — especificidade, ordem, `!important`, a
// pilha de `@media`, `var()` com herança — e compõe as camadas de fundo da
// raiz até o controle, com e sem o dedo. "O dedo" é o que o navegador faz: o
// controle E todos os ancestrais casam `:active`.
//
// O que conta como controle vem da ÁRVORE, não de uma lista escrita aqui: todo
// `<button>`, todo nó com ouvinte de clique do Preact, o rótulo que abre um
// seletor de arquivo ou marca uma caixa, e `role="button"`.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

/** O piso, o mesmo de `tokens.css` e da guarda de estilo. */
const MINIMO = 1.5;

/**
 * Nós com ouvinte de clique que NÃO são controle, cada um com o porquê. Só pode
 * encolher: um nome que a árvore não mostra mais reprova (a lista tem de ser
 * exata), e um nó novo com clique que não escurece reprova até entrar aqui com
 * a razão.
 */
const NAO_SAO_CONTROLE = {
  // o véu atrás da folha: tocar fora fecha a folha, mas o véu não é um botão
  // e escurecê-lo diria que o fundo reagiu ao dedo
  'div.ins-veu': 'o véu atrás da folha'
};

// ---------------------------------------------------------------- a cascata

/** Parte em `sep` no nível de fora: nem dentro de parênteses, nem de aspas. */
function partes(txt, sep) {
  const out = []; let prof = 0, aspas = '', ini = 0;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) { if (c === aspas) aspas = ''; continue; }
    if (c === '"' || c === "'") aspas = c;
    else if (c === '(') prof++;
    else if (c === ')') prof--;
    else if (c === sep && prof === 0) { out.push(txt.slice(ini, i)); ini = i + 1; }
  }
  out.push(txt.slice(ini));
  return out.map(s => s.trim()).filter(Boolean);
}
function fecha(txt, i) {
  let prof = 0;
  for (let j = i; j < txt.length; j++) {
    if (txt[j] === '(') prof++;
    else if (txt[j] === ')' && --prof === 0) return j;
  }
  return txt.length;
}
function fimDoNome(txt, i) {
  while (i < txt.length && /[\w-]|\\/.test(txt[i])) i += txt[i] === '\\' ? 2 : 1;
  return i;
}

/** Especificidade [ids, classes, tipos] de UM seletor complexo. */
function especificidade(sel) {
  const e = [0, 0, 0];
  const soma = x => { e[0] += x[0]; e[1] += x[1]; e[2] += x[2]; };
  let i = 0;
  while (i < sel.length) {
    const c = sel[i];
    if (c === '#') { e[0]++; i = fimDoNome(sel, i + 1); }
    else if (c === '.') { e[1]++; i = fimDoNome(sel, i + 1); }
    else if (c === '[') { e[1]++; i = sel.indexOf(']', i) + 1; }
    else if (c === ':') {
      const elemento = sel[i + 1] === ':';
      const j = fimDoNome(sel, i + (elemento ? 2 : 1));
      const nome = sel.slice(i + (elemento ? 2 : 1), j).toLowerCase();
      let k = j;
      if (sel[j] === '(') {
        k = fecha(sel, j) + 1;
        const dentro = sel.slice(j + 1, k - 1);
        if (['is', 'not', 'has', 'matches'].includes(nome)) {
          soma(partes(dentro, ',').map(especificidade)
            .reduce((m, x) => (x[0] - m[0] || x[1] - m[1] || x[2] - m[2]) > 0 ? x : m, [0, 0, 0]));
        } else if (nome !== 'where') e[1]++;
      } else if (elemento || ['before', 'after', 'first-line', 'first-letter'].includes(nome)) e[2]++;
      else e[1]++;
      i = k;
    } else if (/[a-zA-Z]/.test(c)) { e[2]++; i = fimDoNome(sel, i); }
    else i++;
  }
  return e;
}
const compara = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** O que a cascata precisa saber: fundo, o que mexe na forma, e as variáveis. */
const RELEVANTE = /^(background|background-color|background-image|transform|translate|scale|rotate|--.+)$/;
const PSEUDO_ELEMENTO = /::|:(before|after|first-line|first-letter)\b/;

/**
 * As regras da folha embarcada, achatadas, cada uma com a pilha de condições.
 * Só as que declaram o que interessa; cada seletor já com a especificidade e
 * com `:active` trocado por um atributo que o caso põe no dedo.
 */
function regrasDe(doc) {
  const out = []; let ordem = 0, todas = 0;
  const visita = (regras, conds) => {
    for (const r of regras) {
      if (r.selectorText != null && r.style) {
        todas++;
        const decls = [];
        for (let i = 0; i < r.style.length; i++) {
          const p = r.style[i];
          if (RELEVANTE.test(p)) {
            decls.push({ p, v: r.style.getPropertyValue(p).trim(), imp: r.style.getPropertyPriority(p) === 'important', o: ordem * 1000 + i });
          }
        }
        ordem++;
        if (!decls.length) continue;
        const sels = partes(r.selectorText, ',').filter(s => !PSEUDO_ELEMENTO.test(s)).map(s => ({
          texto: s, esp: especificidade(s), casa: s.replace(/:active\b/g, '[data-dedo]'), chave: chaveDe(s)
        }));
        if (sels.length) out.push({ sels, decls, conds });
      } else if (r.cssRules) {
        const cond = r.media ? r.media.mediaText : r.conditionText != null ? '@supports ' + r.conditionText : null;
        if (cond == null) continue;            // @keyframes: não é estado
        visita(r.cssRules, conds.concat(cond));
      }
    }
  };
  for (const sh of doc.styleSheets) {
    let rs = null;
    try { rs = sh.cssRules; } catch (e) { rs = null; }
    if (rs) visita(rs, []);
  }
  assert.ok(todas > 800 && out.length > 100,
    'a folha embarcada não chegou inteira ao jsdom: ' + todas + ' regras, ' + out.length + ' de fundo e forma');
  return out;
}

/**
 * O que o último composto de um seletor exige do próprio nó — etiqueta, id e
 * classes fora de parênteses —, para descartar sem chamar `matches` a regra que
 * não tem como casar. É só um atalho: quem decide é `matches`.
 */
function chaveDe(sel) {
  let prof = 0, colchete = false, ini = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === '(') prof++;
    else if (c === ')') prof--;
    else if (c === '[') colchete = true;
    else if (c === ']') colchete = false;
    else if (!prof && !colchete && /[\s>+~]/.test(c)) ini = i + 1;
  }
  const ultimo = sel.slice(ini);
  let fora = '', p = 0;
  for (const c of ultimo) { if (c === '(') p++; if (!p) fora += c; if (c === ')') p--; }
  fora = fora.replace(/\[[^\]]*\]/g, '');
  const tag = /^[a-zA-Z][\w-]*/.exec(fora);
  return {
    tag: tag ? tag[0].toUpperCase() : null,
    id: (/#([\w-]+)/.exec(fora) || [])[1] || null,
    classes: [...fora.matchAll(/\.([\w-]+)/g)].map(m => m[1])
  };
}
function podeCasar(el, k) {
  if (k.tag && el.tagName !== k.tag) return false;
  if (k.id && el.id !== k.id) return false;
  for (const c of k.classes) if (!el.classList.contains(c)) return false;
  return true;
}

/** Uma condição de `@media`/`@supports`, no aparelho do caso. */
function vale(cond, cfg) {
  const c = cond.replace(/\s+/g, '');
  if (c.startsWith('@supports')) return true;
  if (/prefers-color-scheme/.test(c)) return false;     // o escuro entra pelo data-theme
  if (/prefers-reduced-motion:no-preference/.test(c)) return !cfg.reduz;
  if (/prefers-reduced-motion:reduce/.test(c)) return cfg.reduz;
  if (/orientation:landscape/.test(c)) return false;
  throw new Error('condição de @media que este caso não sabe ler: ' + cond + ' — ensine a ele');
}

/**
 * `el.matches`, e a única forma que o nwsapi do jsdom não lê: `X:not(:has(Y))`
 * no fim do seletor, que é como o topo do cartão diz "não quando o dedo está
 * na miniatura". Qualquer outra recusa do jsdom é vermelha, com o seletor.
 */
function casa(el, sel) {
  try { return el.matches(sel); } catch (e) {
    const m = /^(.*):not\(:has\(([^()]*(?:\([^()]*\))*[^()]*)\)\)$/.exec(sel);
    if (m) return el.matches(m[1]) && !el.querySelector(m[2]);
    throw new Error('seletor que o jsdom não lê, numa regra que pinta fundo ou forma: ' + sel);
  }
}

/**
 * Quem casa com cada nó: a parte cara, e a mesma para os quatro contextos de
 * leitura (tema e preferência mudam quais regras VALEM, não quais casam — fora o
 * `<html>`, que casa diferente em cada tema). O repouso é guardado para a tela
 * inteira; o dedo, só enquanto um controle está tocado, porque o atributo do
 * dedo muda o que casa.
 */
function casador(regras) {
  const repouso = new Map();
  let dedo = null, geracao = 0;
  const chave = el => el.tagName === 'HTML' ? 'html:' + el.getAttribute('data-theme') : el;
  return {
    casadas(el) {
      const cache = dedo || repouso;
      const k = chave(el);
      if (cache.has(k)) return cache.get(k);
      const out = [];
      for (const r of regras) {
        let esp = null;
        for (const s of r.sels) if (podeCasar(el, s.chave) && casa(el, s.casa) && (!esp || compara(s.esp, esp) > 0)) esp = s.esp;
        if (esp) out.push({ r, esp });
      }
      cache.set(k, out);
      return out;
    },
    dedo(liga) { dedo = liga ? new Map() : null; geracao++; },
    emDedo: () => !!dedo,
    geracao: () => geracao
  };
}

/** Um contexto de leitura: o tema e a preferência, sobre um casador. */
function leitor(regras, cfg, quem) {
  const ativas = new Set(regras.filter(r => r.conds.every(c => vale(c, cfg))));
  const repouso = new Map();
  let doDedo = null, geracaoDoDedo = -1;
  const cacheAtual = () => {
    if (!quem.emDedo()) return repouso;
    if (geracaoDoDedo !== quem.geracao()) { doDedo = new Map(); geracaoDoDedo = quem.geracao(); }
    return doDedo;
  };

  /** As declarações vencedoras de um nó, propriedade a propriedade. */
  function vencedoras(el) {
    const cache = cacheAtual();
    const k = el.tagName === 'HTML' ? 'html:' + el.getAttribute('data-theme') : el;
    if (cache.has(k)) return cache.get(k);
    const cand = new Map();
    const poe = (p, d) => {
      const atual = cand.get(p);
      const melhor = !atual || (d.imp !== atual.imp ? d.imp : (compara(d.esp, atual.esp) || d.o - atual.o) > 0);
      if (melhor) cand.set(p, d);
    };
    for (const { r, esp } of quem.casadas(el)) {
      if (!ativas.has(r)) continue;
      for (const d of r.decls) {
        const x = { v: d.v, imp: d.imp, esp, o: d.o };
        if (d.p === 'background') { poe('background-color', x); poe('background-image', x); }
        else poe(d.p, x);
      }
    }
    // o atributo `style` vence as folhas (o Preact escreve alguns)
    const st = el.style;
    if (st) for (let i = 0; i < st.length; i++) {
      const p = st[i];
      if (!RELEVANTE.test(p)) continue;
      const x = { v: st.getPropertyValue(p), imp: st.getPropertyPriority(p) === 'important', esp: [1e6, 0, 0], o: 1e9 };
      if (p === 'background') { poe('background-color', x); poe('background-image', x); } else poe(p, x);
    }
    const out = {};
    cand.forEach((d, p) => { out[p] = d.v; });
    // `background` abreviado: a cor é o que não for imagem; a imagem, o gradiente
    if (out['background-color'] != null && /gradient\(|url\(/.test(out['background-color'])) out['background-color'] = 'transparent';
    if (out['background-image'] != null && !/gradient\(|url\(/.test(out['background-image'])) out['background-image'] = 'none';
    cache.set(k, out);
    return out;
  }

  /** Uma variável no nó: a declarada nele, ou herdada. */
  function variavel(el, nome) {
    for (let n = el; n; n = n.parentElement) {
      const v = vencedoras(n)[nome];
      if (v != null) return resolve(n, v, 0);
    }
    return null;
  }
  function resolve(el, valor, prof) {
    if (prof > 20) throw new Error('var() em ciclo: ' + valor);
    let v = valor, guarda = 0;
    while (/var\(/.test(v) && guarda++ < 50) {
      const i = v.indexOf('var(');
      const f = fecha(v, i + 3);
      const [nome, ...resto] = partes(v.slice(i + 4, f), ',');
      const achado = variavel(el, nome.trim());
      const troca = achado != null ? achado : resto.length ? resolve(el, resto.join(','), prof + 1) : '';
      v = v.slice(0, i) + troca + v.slice(f + 1);
    }
    return v.trim();
  }

  /** As camadas de fundo de um nó, de baixo para cima, como [r, g, b, a]. */
  function camadas(el) {
    const w = vencedoras(el);
    const out = [];
    const cor = cor_(resolve(el, w['background-color'] || 'transparent', 0));
    if (cor[3] > 0) out.push(cor);
    const img = resolve(el, w['background-image'] || 'none', 0);
    if (img !== 'none') {
      const m = /^linear-gradient\((.*)\)$/s.exec(img);
      const cores = m ? partes(m[1], ',').map(cor_) : null;
      if (!cores || cores.some(c => c.join() !== cores[0].join())) return { out, ilegivel: img };
      if (cores[0][3] > 0) out.push(cores[0]);
    }
    return { out };
  }

  function efetivo(el) {
    const cadeia = [];
    for (let n = el; n; n = n.parentElement) cadeia.unshift(n);
    let c = [255, 255, 255];
    for (const n of cadeia) for (const k of camadas(n).out) c = c.map((v, i) => v * (1 - k[3]) + k[i] * k[3]);
    return c;
  }

  function forma(el) {
    const w = vencedoras(el);
    return ['transform', 'translate', 'scale', 'rotate'].map(p => p + ':' + (w[p] ? resolve(el, w[p], 0) : 'none')).join(' ');
  }

  return { camadas, efetivo, forma };
}

function cor_(txt) {
  const t = txt.trim().toLowerCase();
  if (t === 'transparent' || t === 'none' || t === '') return [0, 0, 0, 0];
  if (t === 'white' || t === '#fff') return [255, 255, 255, 1];
  if (t === 'black' || t === '#000') return [0, 0, 0, 1];
  let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(t);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1);
  m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(t);
  if (m) return [1, 2, 3].map(i => parseInt(m[i] + m[i], 16)).concat(1);
  m = /^rgba?\(([^)]*)\)$/.exec(t);
  if (m) {
    const v = m[1].split(/[\s,/]+/).filter(Boolean).map(x => x.endsWith('%') ? parseFloat(x) / 100 : Number(x));
    return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
  }
  throw new Error('cor que este caso não sabe ler: ' + txt);
}

function luminancia(c) {
  const l = c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
function contraste(a, b) {
  const x = luminancia(a), y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// ---------------------------------------------------------------- a árvore

/** Os controles da árvore, e os nós com clique que não são controle. */
function controles(doc) {
  const sao = [], naoSao = [];
  for (const el of doc.querySelectorAll('body *')) {
    const tag = el.tagName;
    const clica = el.l && Object.keys(el.l).some(k => /^click/i.test(k));
    const ehControle = tag === 'BUTTON' || el.getAttribute('role') === 'button' || clica ||
      (tag === 'LABEL' && !!el.querySelector('input[type="file"], input[type="checkbox"]'));
    if (!ehControle) continue;
    if (tag === 'BUTTON' && el.disabled) continue;   // botão desligado não acende
    const nome = nomeDe(el, false);
    if (NAO_SAO_CONTROLE[nome]) naoSao.push(nome); else sao.push(el);
  }
  return { sao, naoSao };
}
function nomeDe(el, comDado) {
  return el.tagName.toLowerCase() + (el.id && comDado ? '#' + el.id : '') +
    [...el.classList].map(c => '.' + c).join('') +
    (comDado && el.dataset && el.dataset.a ? '[data-a=' + el.dataset.a + ']' : '');
}

const CONFIGS = [
  { tema: 'claro', reduz: false }, { tema: 'claro', reduz: true },
  { tema: 'escuro', reduz: false }, { tema: 'escuro', reduz: true }
];
const fmt = n => n.toFixed(2).replace('.', ',');

/**
 * Confere cada controle da tela, nos dois temas e nas duas preferências. Devolve
 * as falhas como frases; anota no `visto` o nome de cada controle conferido.
 */
function confere(a, onde, visto) {
  const doc = a.doc;
  const raiz = doc.documentElement;
  const temaAntes = raiz.getAttribute('data-theme');
  const regras = regrasDe(doc);
  const { sao, naoSao } = controles(doc);
  naoSao.forEach(n => visto.naoSao.add(n));
  const falhas = [];
  const quem = casador(regras);
  const leitores = CONFIGS.map(cfg => ({ cfg, ler: leitor(regras, cfg, quem) }));
  const tema = cfg => raiz.setAttribute('data-theme', cfg.tema === 'escuro' ? 'dark' : 'light');
  try {
    for (const el of sao) {
      const nome = nomeDe(el, true);
      visto.controles.add(nome);
      const cadeia = [];
      for (let n = el; n; n = n.parentElement) cadeia.push(n);

      // o repouso, nos quatro contextos
      const antes = leitores.map(({ cfg, ler }) => {
        tema(cfg);
        const pintado = ler.camadas(el);
        return { ilegivel: pintado.ilegivel, repouso: ler.efetivo(el), fundo: ler.efetivo(el.parentElement),
          forma: ler.forma(el), ancestrais: cadeia.slice(1).map(n => JSON.stringify(ler.camadas(n).out)) };
      });

      // o dedo: o controle e todos os ancestrais casam `:active`
      cadeia.forEach(n => n.setAttribute('data-dedo', ''));
      quem.dedo(true);
      let depois;
      try {
        depois = leitores.map(({ cfg, ler }) => {
          tema(cfg);
          return { tocado: ler.efetivo(el), forma: ler.forma(el),
            ancestrais: cadeia.slice(1).map(n => JSON.stringify(ler.camadas(n).out)) };
        });
      } finally {
        quem.dedo(false);
        cadeia.forEach(n => n.removeAttribute('data-dedo'));
      }

      leitores.forEach(({ cfg }, k) => {
        const r = antes[k], d = depois[k];
        const rotulo = onde + ' · ' + nome + ' · ' + cfg.tema + (cfg.reduz ? ' com "Reduzir movimento"' : '');
        if (r.ilegivel) {
          falhas.push(rotulo + ': o repouso tem imagem de fundo (' + r.ilegivel + '), e a camada do toque a apagaria');
          return;
        }
        const cr = contraste(d.tocado, r.repouso), cf = contraste(d.tocado, r.fundo);
        if (process.env.TOQUE_RELATORIO) visto.medidas.push({ onde, nome, tema: cfg.tema, reduz: cfg.reduz, cr, cf });
        if (cr < MINIMO) falhas.push(rotulo + ': o tocado contra o repouso mede ' + fmt(cr) + ':1 (mínimo ' + fmt(MINIMO) + ')');
        if (cf < MINIMO) falhas.push(rotulo + ': o tocado contra o fundo atrás mede ' + fmt(cf) + ':1 (mínimo ' + fmt(MINIMO) + ')');
        if (d.forma !== r.forma) falhas.push(rotulo + ': o toque mexe na forma (' + d.forma + '); ele só escurece');
        const mudou = r.ancestrais.findIndex((x, i) => x !== d.ancestrais[i]);
        if (mudou >= 0) {
          falhas.push(rotulo + ': o dedo neste controle escurece também ' + nomeDe(cadeia[mudou + 1], false) +
            ' — só o controle tocado escurece (a régua escurece o botão, nunca a faixa)');
        }
      });
    }
  } finally {
    if (temaAntes == null) raiz.removeAttribute('data-theme'); else raiz.setAttribute('data-theme', temaAntes);
  }
  return falhas;
}

// ---------------------------------------------------------------- os casos

test('todo controle do app escurece com o dedo, contra o repouso e contra o fundo, nos dois temas e com "Reduzir movimento"', async () => {
  const visto = { controles: new Set(), naoSao: new Set(), medidas: [] };
  const falhas = [];
  const olha = (a, onde) => falhas.push(...confere(a, onde, visto));

  // o Agora: as linhas da comida, a água, o canto dos Ajustes, as abas
  let a = await app({ aba: 'agora' });
  olha(a, 'Agora');
  const linha = a.$('.ag-l-b');
  assert.ok(linha, 'pré-condição: o Agora tem linhas de refeição');
  a.v('ctx.abreLinhaDaComida', linha.dataset.a.replace('linha-', ''));
  await a.esperar();
  olha(a, 'Agora com a linha aberta');
  a.v('ctx.abreCorrecaoDaAgua');
  await a.esperar();
  olha(a, 'Agora corrigindo a água');
  a.v('ctx.abreSeletorDeDia');
  await a.esperar(200);
  olha(a, 'folha do dia');
  a.fechar();

  // os outros quatro lugares, e os Ajustes (com o seletor de arquivo)
  for (const aba of ['dias', 'corpo', 'semana', 'prescricao', 'ajustes']) {
    a = await app({ aba });
    olha(a, aba);
    a.fechar();
  }

  // o modo de sessão: o cartão aberto (com a série da última vez, que se toca
  // para copiar), a régua, o teclado, o RIR, o descanso, a troca, a edição do dia
  a = await app();
  a.v('go', 'A');
  const t0 = Date.now() - 7 * DIA;
  a.E('S.logs[' + JSON.stringify(a.k('A', 0)) + '] = [{ t: ' + t0 + ', sid: ' + t0 + ', sets: [[40, 9, 1], [40, 8, 1], [40, 8, 2]] }]; render()');
  olha(a, 'modo de sessão');
  a.v('toggle', 0);
  await a.esperar();
  assert.ok(a.$('.setant-b'), 'pré-condição: a coluna da última vez está na tela');
  olha(a, 'cartão aberto');
  a.E('abreRegua(0, 0)');
  await a.esperar();
  olha(a, 'régua');
  a.E('abreTecladoDeCarga(0, 0)');
  await a.esperar();
  olha(a, 'teclado');
  a.E('fechaTeclado(); abreRir(0, 0)');
  await a.esperar();
  olha(a, 'escala de RIR');
  a.E('view.rir = null; render()');
  a.preencher(0, 0, 40, 10);
  await a.esperar();
  assert.ok(a.$('#tmenos'), 'pré-condição: o descanso está contando');
  olha(a, 'descanso');
  a.E('abreRegua(0, 0)');
  await a.esperar();
  assert.ok(a.$('.regua-v.on'), 'pré-condição: a régua mostra o valor guardado aceso');
  olha(a, 'régua com o valor guardado');
  a.E('view.regua = null; abrirSubstituicao(0)');
  await a.esperar();
  olha(a, 'troca do exercício');
  a.E('toggleSwap(0); modoEdicao(true)');
  await a.esperar();
  assert.ok(a.$('.edbar-b'), 'pré-condição: a edição do dia está aberta');
  olha(a, 'edição do dia');
  a.E('abrirNovoEx()');
  await a.esperar();
  olha(a, 'exercício novo');
  a.E('view.addEx = false; view.novoEx = false; modoEdicao(false)');
  await a.esperar();
  a.E("CTX.abreFolha({ k: 'menuSessao' })");
  await a.esperar(200);
  olha(a, 'menu da sessão');
  a.fechar();

  // o painel de pare, nas duas famílias: o que destrói e a pergunta neutra
  a = await app({ painelManual: true });
  a.E("pare({ texto: 'Apagar o treino tira 3 séries.', sim: 'Apagar o treino' })");
  await a.esperar();
  assert.ok(a.$('[data-a="pare-sim"]'), 'pré-condição: o painel de pare está na tela');
  olha(a, 'pare');
  a.E("pare({ texto: 'Encerrar com séries pendentes?', sim: 'Encerrar', tom: 'pergunta' })");
  await a.esperar();
  olha(a, 'pergunta');
  a.fechar();

  // o aviso de falha e a faixa de "não guardado"
  a = await app({ estado: { body: { peso: [], cintura: [] } } });
  a.aba('corpo');
  a.encheCota();
  a.m.ctx.setPeso(73.6);
  a.m.ctx.registraPeso();
  await a.esperar(60);
  olha(a, 'aviso de falha');
  a.clicar('[data-a="falhou-fecha"]');
  await a.esperar();
  olha(a, 'faixa de não guardado');
  a.fechar();

  // telas cheias: histórico, programa, o retroativo
  const t = Date.now() - 2 * DIA;
  a = await app({ estado: { done: [{ day: 'A', t, sid: t, dur: 3600000 }],
    logs: { supino: [{ t, sid: t, sets: [[60, 8], [60, 7]] }] } } });
  a.E('CTX.abreHistorico()');
  await a.esperar();
  olha(a, 'histórico');
  a.E("CTX.vaiPara('prescricao'); CTX.abrePrograma()");
  await a.esperar();
  olha(a, 'programa');
  a.E("CTX.vaiPara('dias'); CTX.abreRetro()");
  await a.esperar();
  olha(a, 'retroativo');
  a.fechar();

  // TOQUE_RELATORIO=arquivo.json grava as medidas (e as falhas), para o
  // relatório da peça — antes das asserções, para valer também no vermelho
  if (process.env.TOQUE_RELATORIO) {
    (await import('node:fs')).writeFileSync(process.env.TOQUE_RELATORIO,
      JSON.stringify({ medidas: visto.medidas, falhas }, null, 1));
  }

  assert.deepStrictEqual(falhas, [],
    'controle que não mostra o dedo — ou mostra mexendo na forma, ou escurecendo quem não foi tocado. ' +
    'A camada do toque é `--ins-toque` (base.css, "O TOQUE"); preenchimento cheio declara ' +
    '`--ins-toque: var(--ins-toque-cheio)` na regra que o pinta.');

  // o caso só vale se olhou o que importa: os controles mais tocados do produto
  const nomes = [...visto.controles];
  const tem = re => nomes.some(n => re.test(n));
  const esperados = {
    '+1 copo': /ag-agua-b/, 'linha de refeição': /ag-l-b/, 'conta da água': /ag-agua-t/, 'aba': /ins-tab/,
    'topo do cartão': /^div\.ex-top/, 'célula da série': /repbtn/, 'célula de RIR': /rirbtn/, 'régua': /regua-v/,
    'seta da régua': /regua-anda/, 'tecla': /tcl-t/, 'valor do RIR': /rirop/, '−15 · +15': /#tmenos/,
    'chip do descanso': /chip/, 'Pausar/Encerrar': /ctrl-b/, 'botão primário': /ins-btn-primary/,
    'painel de pare': /pare-sim/, 'faixa de não guardado': /ng-b/, 'seletor de arquivo': /^label/,
    'voltar da tela cheia': /tc-back/, 'coluna da última vez': /setant-b/, 'régua acesa': /regua-v\b.*\.on\b/,
    'troca do exercício': /swapopt/, 'Pronto da edição do dia': /edbar-b/, 'caixa de marcar': /^label\.nxk/
  };
  assert.deepStrictEqual(Object.keys(esperados).filter(k => !tem(esperados[k])), [],
    'o caso não chegou a estes controles (uma tela não abriu?): a conferência ficaria cega neles');
  assert.ok(visto.controles.size >= 80, 'só ' + visto.controles.size + ' controles diferentes conferidos');
  assert.deepStrictEqual(Object.keys(NAO_SAO_CONTROLE).filter(n => !visto.naoSao.has(n)), [],
    'nome em NAO_SAO_CONTROLE que a árvore não mostrou: a lista só serve se for exata');
}, 120000);

test('o documento tem UM ouvinte de touchstart, vazio e passivo: sem ele o iPhone não aplica :active', async () => {
  // O Safari do iOS só aplica `:active` num toque se houver ouvinte de
  // `touchstart` no elemento ou num ancestral (docs/motion/03 §1.4). O app não
  // tinha nenhum: no iPhone, nada do estado de toque acendia. O ouvinte tem de
  // existir, estar no documento (o ancestral de tudo), ser passivo (não segura
  // a rolagem) e não fazer nada (o `click` continua sendo quem age).
  const ouvidos = [];
  const a = await app({ aba: 'agora', antesDoApp(w) {
    const original = w.EventTarget.prototype.addEventListener;
    w.EventTarget.prototype.addEventListener = function (tipo, fn, op) {
      if (/^touch/.test(tipo)) ouvidos.push({ alvo: this, tipo, fn, op });
      return original.call(this, tipo, fn, op);
    };
  } });
  try {
    const noDocumento = ouvidos.filter(o => o.alvo === a.doc && o.tipo === 'touchstart');
    assert.strictEqual(noDocumento.length, 1,
      'o documento tem ' + noDocumento.length + ' ouvintes de touchstart; é um, posto uma vez no topo do módulo');
    const o = noDocumento[0];
    assert.ok(o.op && o.op.passive === true, 'o ouvinte é passivo: { passive: true }, para não segurar a rolagem');
    let mexeu = 0;
    const ev = { preventDefault() { mexeu++; }, stopPropagation() { mexeu++; }, stopImmediatePropagation() { mexeu++; } };
    assert.strictEqual(o.fn.call(a.doc, ev), undefined, 'o ouvinte não devolve nada');
    assert.strictEqual(mexeu, 0, 'o ouvinte não segura nem desvia o toque');
    assert.deepStrictEqual(ouvidos.filter(x => !(x.op && x.op.passive === true)).map(x => x.tipo), [],
      'ouvinte de toque que não é passivo: ele seguraria a rolagem do iPhone');
    // e o app continua de pé depois do boot, com o ouvinte posto
    assert.ok(a.$('.ins-tabbar'), 'o app montou');
  } finally {
    a.fechar();
  }
});
