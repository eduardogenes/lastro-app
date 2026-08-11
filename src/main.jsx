import {
  ROT_BASE, D_COMPOSTO, D_MAQUINA, D_ISOLADOR, D_CURTO,
  PROGRAMA, RULES, ALT, slugEx, EX_BASE,
  PRIORIDADES, NIVEIS, nivelDe, PRIO, CARGAS, DORES, MODAIS
} from './dominio/programa';
import {
  fmtNum, fmtInt, fmtDec, fmtSig, fmtDec2, fmtSig2, fmtK,
  DIAS_CURTOS, DIAS_LONGOS, MESES, PERIODOS, periodoDe,
  fmtHora, fmtDur, diaExtenso, fmtDate, weekStart, sameDay, fmtDesc,
  escapeHTML, escAttr
} from './dominio/formato';
import {
  totalAnilhas, isTime, tutOf, volOf, maxLoad, repsOf, topReps
} from './dominio/carga';
import { montaHTML, montaNoApp } from './ui/raiz.jsx';
import { Bruto } from './ui/bruto.jsx';
import { Exercicio } from './ui/exercicio.jsx';
import { alvoDoPrograma, seriesDeGrupo, impacto,
         seriesPorMusculo as _seriesPorMusculo } from './dominio/volume';
import { mediasSemanais, pesoRitmo as _pesoRitmo,
         cinturaMes as _cinturaMes, veredito as _veredito } from './dominio/corpo';
import { PAUSA_DIAS, diasDesde, historico as _historico, lastSet as _lastSet,
         pausaEx as _pausaEx, dorSeguida as _dorSeguida, shouldUp as _shouldUp,
         setsFor as _setsFor } from './dominio/progressao';
import { PLANO_ATUAL, migraPlano, migraPlano3, migraPlano4 } from './dominio/migracoes';
import { CADENCIA_PADRAO } from './dominio/dia';
import { PLANO_BASE } from './dominio/nutricao/alimentos';
import { semeiaProg, montaCatalogo as _montaCatalogo, exercicioFantasma } from './dominio/programa';
import { DB } from './infra/db';

const KEY = 'treino-eduardo-v1';
function rot() { return (S.rot && S.rot.length) ? S.rot : ROT_BASE; }





// ---------- mods da sessão ----------
// Editar no meio do treino NÃO mexe no programa oficial. As mudanças entram
// como uma lista de intenções sobre o dia, e no fim da sessão ele decide, uma
// a uma, o que vira permanente. Guardar intenção e não uma cópia do dia é o
// que permite dizer "trocou pendulum por hack squat e subiu lateral de 4 para
// 5", em vez de mostrar dois blocos de treino e pedir para escolher.
//
// Formato: { k:'sets'|'reps'|'desc'|'troca'|'rm'|'add'|'mover', slot, ... }
// 'slot' é sempre o id ORIGINAL da posição, mesmo depois de uma troca — é o
// que mantém os mods encadeáveis.
function modsDoDia(d) {
  const m = S.mods;
  return (m && m.day === d && Array.isArray(m.list)) ? m.list : [];
}

function achaSlot(lista, slot) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].orig === slot || (!lista[i].orig && lista[i].id === slot)) return i;
  }
  return -1;
}

function aplicaMods(d, slots) {
  const list = modsDoDia(d);
  if (!list.length) return slots;
  let out = slots.map(function (sl) { return Object.assign({}, sl); });
  list.forEach(function (x) {
    if (x.k === 'add') {
      const novo = { id:x.id, s:x.s, r:x.r, d:x.d, desde:0, mod:2, orig:x.id + '#' + x.n };
      out.splice(Math.max(0, Math.min(x.pos, out.length)), 0, novo);
      return;
    }
    const i = achaSlot(out, x.slot);
    if (i < 0) return;
    if (x.k === 'rm') { out.splice(i, 1); return; }
    const sl = out[i];
    if (!sl.orig) sl.orig = sl.id;
    if (x.k === 'sets')  { sl.s = x.para; sl.mod = sl.mod || 1; }
    if (x.k === 'reps')  { sl.r = x.para; sl.mod = sl.mod || 1; }
    if (x.k === 'desc')  { sl.d = x.para; sl.mod = sl.mod || 1; }
    if (x.k === 'troca') { sl.id = x.por; sl.mod = sl.mod || 1; }
    if (x.k === 'mover') {
      out.splice(i, 1);
      out.splice(Math.max(0, Math.min(x.para, out.length)), 0, sl);
      sl.mod = sl.mod || 1;
    }
  });
  return out;
}

// Onde o mod é gravado. Só existe para o dia que ele está treinando: editar
// outro dia da rotação é edição de programa, e passa pela tela de programa.
function podeEditar(d) {
  return S.sessao ? S.sessao.day === d : d === nextDay();
}

function bufferMods(d) {
  if (!S.mods || S.mods.day !== d) S.mods = { day: d, t: Date.now(), list: [] };
  return S.mods;
}

// Mods do mesmo tipo no mesmo slot se colapsam: subir de 3 para 4 e depois
// para 5 é uma mudança de 3 para 5, não duas. E voltar ao valor original
// apaga o mod, em vez de registrar uma mudança que não houve.
function poeMod(d, mod) {
  const b = bufferMods(d);
  if (mod.k === 'add') { b.list.push(mod); return; }
  const j = b.list.findIndex(function (x) { return x.k === mod.k && x.slot === mod.slot; });
  if (j < 0) { b.list.push(mod); return; }
  const de = b.list[j].de !== undefined ? b.list[j].de : mod.de;
  if (mod.para !== undefined && mod.para === de) { b.list.splice(j, 1); return; }
  b.list[j] = Object.assign({}, mod, { de: de });
}

function tiraMod(d, k, slot) {
  const b = S.mods && S.mods.day === d ? S.mods : null;
  if (!b) return;
  b.list = b.list.filter(function (x) { return !(x.k === k && x.slot === slot); });
}

function temMods(d) { return modsDoDia(d).length > 0; }

// Slot de origem de uma posição: é o que identifica o registro dentro da
// sessão, mesmo depois de trocar o exercício.
function slotDe(d, i) {
  const t = treino(d);
  if (!t || !t.ex[i]) return d + i;
  return t.ex[i].orig || t.ex[i].id;
}



// Catálogo efetivo: o do código mais o que ele cadastrou e o que foi arquivado.
// Catálogo efetivo, remontado sempre que o catálogo dele muda.
let CAT = {};
function montaCatalogo() { CAT = _montaCatalogo(S.ex); }
function exDe(x) { return CAT[x] || exercicioFantasma(x); }
function nomeEx(x) { return exDe(x).n; }


// O treino como ele aparece na tela: slot resolvido contra o catálogo, com os
// mods da sessão de hoje aplicados por cima. Mesma forma dos exercícios de
// antes, para o resto do app não precisar saber de nada disso.
function treino(d) {
  const p = S.prog && S.prog[d];
  if (!p) return null;
  return { name: p.name, tag: p.tag, ex: aplicaMods(d, p.ex).map(function (sl) {
    const e = exDe(sl.id);
    return { id:sl.id, n:e.n, car:e.car, g:e.g, c:e.c, cue:e.cue, u:e.u,
             s:sl.s, r:sl.r, d:sl.d, desde:sl.desde, bi:sl.bi || 0,
             mod:sl.mod || 0, orig:sl.orig || sl.id };
  }) };
}








let S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[], body:{ peso:[], cintura:[] }, carga:{}, export:0, plano:PLANO_ATUAL, prog:null, rot:null, ex:{}, mods:null, progLog:[] };
let view = { day:'A', tab:'treino', open:null, hist:null, json:null, paste:false, swapOpen:null, fired:{}, sessao:null, edit:null, retro:false, nota:null, carga:null, mes:0, add:null, cardioRapido:false,
  editProg:false, addEx:false, addQ:'', novoEx:false, promo:null, prog:null };
let timer = null, timerFim = 0, timerTotal = 0, timerAvisado = false;
let audioCtx = null, wakeLock = null, querSegurar = false;


const STORE_LABEL = {
  host:  'armazenamento do Claude.ai, com cópia no navegador',
  local: 'armazenamento local deste navegador',
  mem:   'apenas na memória desta aba — nada será salvo ao fechar'
};

// ---------- estado ----------
// Padrões de campos novos e formas inválidas. Roda no boot e na importação:
// um backup antigo tem que chegar às migrações no mesmo estado que o disco.
function normalizaEstado() {
  // A metade de comida entra AQUI e não só na migração 3→4: estado novo já
  // nasce com plano = PLANO_ATUAL, então a migração devolve null sem semear
  // nada, e a nutrição ficaria vazia para sempre em aparelho novo. Campo novo
  // recebe padrão neste ponto — é o contrato da regra 2, e é por onde passam
  // tanto o boot quanto a importação de backup.
  if (!S.cadencia || S.cadencia.length !== 7) S.cadencia = CADENCIA_PADRAO.slice();
  if (!S.comida || typeof S.comida !== 'object') S.comida = { plano: null, alimentos: {}, ocultos: {} };
  if (!S.comida.plano) S.comida.plano = JSON.parse(JSON.stringify(PLANO_BASE));
  if (!S.comida.alimentos || typeof S.comida.alimentos !== 'object') S.comida.alimentos = {};
  if (!S.comida.ocultos || typeof S.comida.ocultos !== 'object') S.comida.ocultos = {};
  if (!S.compras || typeof S.compras !== 'object') S.compras = { comprado:{}, extras:[], removidas:{}, dias:7 };
  if (S.ajuste !== -1 && S.ajuste !== 1) S.ajuste = 0;
  if (S.perfManual !== true && S.perfManual !== false) S.perfManual = null;
  if (!S.dia || typeof S.dia !== 'object') S.dia = null;

  if (!S.logs || typeof S.logs !== 'object') S.logs = {};
  if (!Array.isArray(S.done)) S.done = [];
  if (typeof S.deload !== 'boolean') S.deload = false;
  if (!S.draft || typeof S.draft !== 'object') S.draft = null;
  // sessão precisa de forma válida: sem sid, fechaSessao() não acha a marca
  if (!S.sessao || typeof S.sessao !== 'object' || !S.sessao.day || !S.sessao.sid) S.sessao = null;
  if (!Array.isArray(S.cardio)) S.cardio = [];
  if (typeof S.export !== 'number') S.export = 0;
  if (!S.carga || typeof S.carga !== 'object') S.carga = {};
  if (!S.body || typeof S.body !== 'object') S.body = { peso:[], cintura:[] };
  if (!Array.isArray(S.body.peso)) S.body.peso = [];
  if (!Array.isArray(S.body.cintura)) S.body.cintura = [];
  if (typeof S.plano !== 'number') S.plano = 1;   // estado anterior à troca de programa
  if (!S.ex || typeof S.ex !== 'object') S.ex = {};
  if (!S.mods || typeof S.mods !== 'object' || !S.mods.day || !Array.isArray(S.mods.list)) S.mods = null;
  if (!Array.isArray(S.progLog)) S.progLog = [];
}

async function load() {
  let raw = null;
  try {
    const r = await DB.get(KEY);
    if (r && r.value) raw = r.value;
  } catch (e) { /* primeira vez: começa vazio */ }

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') S = parsed;
    } catch (e) {
      console.error('histórico ilegível, mantido intacto no storage', e);
    }
  }
  normalizaEstado();
  montaCatalogo();

  // as migrações rodam em cadeia: quem está no plano 1 passa pelas duas
  const arquivados = migraPlano(S);
  const m3 = migraPlano3(S);
  migraPlano4(S);
  if (!S.prog || typeof S.prog !== 'object') S.prog = semeiaProg();
  if (!Array.isArray(S.rot) || !S.rot.length) S.rot = ROT_BASE.slice();
  montaCatalogo();

  // Rascunho do modelo antigo, sem sessão: vira sessão aberta para não
  // perder um treino que estava em andamento na hora da atualização.
  if (S.draft && !S.sessao && treino(S.draft.day) && Object.keys(S.draft.ex || {}).length) {
    S.sessao = { day: S.draft.day, inicio: S.draft.t || Date.now(), ultima: S.draft.t || Date.now(), sid: S.draft.t || Date.now() };
    projetaTudo();
  }

  encerraSePreciso();
  view.day = S.sessao ? S.sessao.day : nextDay();
  render();
  if (m3) {
    await save();
    const rec = m3.recuperados.length
      ? ' ' + m3.recuperados.length + ' voltaram para o histórico ativo.' : '';
    if (m3.chaves) toast('Histórico reindexado por exercício.' + rec);
  }
}

// ---------- ciclo de vida da sessão ----------
// Não existe botão de salvar. A sessão nasce na primeira série completa e
// se encerra sozinha por inatividade ou na virada do dia.
const SESSAO_LIMITE = 4*3600*1000;

// Duração líquida: tempo total menos o que foi pausado. O botão nunca é
// pré-condição para gravar série — ele só acrescenta precisão ao tempo.
// Só conta pausa que já aconteceu até o instante medido. Sem esse recorte, a
// pausa em aberto era descontada de um intervalo que terminava antes dela, e o
// relógio congelado andava para trás enquanto o treino estava pausado.
function somaPausas(s, ate) {
  const lim = ate != null ? ate : Date.now();
  let ms = (s.pausas || []).reduce(function (a, p) {
    return a + Math.max(0, Math.min(p.ate != null ? p.ate : lim, lim) - p.de);
  }, 0);
  if (s.pausadoEm && s.pausadoEm < lim) ms += lim - s.pausadoEm;
  return ms;
}
function duracaoSessao(s, fim) {
  if (!s) return 0;
  const ate = fim != null ? fim : Date.now();
  return Math.max(0, ate - s.inicio - somaPausas(s, ate));
}
// Pausado, o relógio para no instante da pausa. Correndo, anda sozinho.
function duracaoAtual(s) {
  return duracaoSessao(s, s.pausadoEm || Date.now());
}

async function iniciarSessao() {
  if (S.sessao) return;
  const agora = Date.now();
  S.sessao = { day: view.day, inicio: agora, ultima: agora, sid: agora, manual: 1, pausas: [], pulados: [] };
  const marca = { day: view.day, t: agora, sid: agora, ini: 'manual' };
  if (S.deload) marca.dl = 1;
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  segurarTela();
  await save();
  render(); window.scrollTo(0, 0);
  toast('Treino ' + view.day + ' iniciado. O tempo começa agora.');
}

async function pausarSessao() {
  if (!S.sessao || S.sessao.pausadoEm) return;
  S.sessao.pausadoEm = Date.now();
  soltarTela();
  await save(); render();
  toast('Treino pausado. O relógio parou.');
}

async function retomarSessao(silencioso) {
  const s = S.sessao;
  if (!s || !s.pausadoEm) return;
  if (!s.pausas) s.pausas = [];
  s.pausas.push({ de: s.pausadoEm, ate: Date.now() });
  s.pausadoEm = null;
  segurarTela();
  await save();
  if (!silencioso) { render(); toast('Treino retomado.'); }
}

function encerraSePreciso() {
  const s = S.sessao;
  if (!s) return false;
  if (s.retro) {
    // sessão retroativa fecha por inatividade real ou na virada do dia de uso
    const ref = s.tocado || s.inicio;
    if (Date.now() - ref < SESSAO_LIMITE && sameDay(ref, Date.now())) return false;
    fechaSessao('auto');
    return true;
  }
  // pausar é intenção declarada: só a virada do dia encerra
  if (s.pausadoEm) {
    if (sameDay(s.inicio, Date.now())) return false;
    fechaSessao('auto');
    return true;
  }
  const parada = Date.now() - (s.ultima || s.inicio);
  if (parada < SESSAO_LIMITE && sameDay(s.inicio, Date.now())) return false;
  fechaSessao('auto');
  return true;
}

function fechaSessao(comoFim) {
  const s = S.sessao;
  if (!s) return;
  const marca = S.done.filter(function (x) { return x.sid === s.sid; })[0];
  if (marca && !s.retro) {
    // sem "acabei", o melhor palpite é a última série; com, é o instante do toque
    const fim = comoFim === 'manual' ? Date.now() : (s.ultima || s.inicio);
    marca.dur = duracaoSessao(s, fim);
    marca.fim = comoFim === 'manual' ? 'manual' : 'auto';
    const pausado = somaPausas(s);
    if (pausado > 60000) marca.pausado = pausado;
    if (s.pulados && s.pulados.length) marca.pulados = s.pulados.slice();
  }
  S.sessao = null;
  S.draft = null;
  S.mods = null;   // as mudanças do dia não sobrevivem ao fim da sessão
  view.fired = {};
  view.day = nextDay();
}

// ---------- projeção: rascunho vira histórico na hora ----------
// O rascunho continua sendo o buffer de digitação, mas cada série completa
// é escrita no histórico imediatamente. Não existe estado "não salvo".
function abreSessao(dia) {
  if (S.sessao) return S.sessao;
  const agora = Date.now();
  S.sessao = { day: dia, inicio: agora, ultima: agora, sid: agora, pausas: [], pulados: [] };
  const marca = { day: dia, t: agora, sid: agora, ini: 'auto' };
  if (S.deload) marca.dl = 1;
  S.done.push(marca);
  if (S.done.length > 3000) S.done = S.done.slice(-3000);
  return S.sessao;
}

function setsDoRascunho(ex, e, key) {
  const seg = isTime(ex);
  const corpo = isCorpo(key, ex);
  const sets = [];
  let any = false;
  for (let k = 0; k < setsFor(ex); k++) {
    const x = e.s[k];
    // em exercício por tempo ou de peso do corpo o segundo campo basta
    const ok = x && x[1] != null && (seg || corpo || x[0] != null);
    if (ok) { sets.push([x[0] != null ? x[0] : 0, x[1]]); any = true; }
    else sets.push(null);
  }
  return any ? sets : null;
}

function projeta(i) {
  const dia = view.day;
  const ex = treino(dia).ex[i];
  const e = draftPeek(i);
  if (!ex || !e) return;

  const slot = slotDe(dia,i);
  const key = id(dia,i);
  const sets = setsDoRascunho(ex, e, key);

  // sem nenhuma série completa: apaga o que já tiver sido escrito nesta sessão
  if (!sets) { removeProjecao(key, slot); return; }

  const s = abreSessao(dia);
  // digitar é prova de que voltou: retoma sozinho em vez de exigir dois toques
  if (s.pausadoEm) {
    if (!s.pausas) s.pausas = [];
    s.pausas.push({ de: s.pausadoEm, ate: Date.now() });
    s.pausadoEm = null;
  }
  if (s.retro) { s.tocado = Date.now(); }
  else { s.ultima = Date.now(); s.day = dia; }

  if (!S.logs[key]) S.logs[key] = [];
  let entry = daSessao(key, slot, s.sid);
  // a entrada leva a data da sessão: num registro retroativo, o treino
  // aconteceu ontem, não agora
  if (!entry) { entry = { t: s.inicio, sid: s.sid }; S.logs[key].push(entry); }

  entry.sets = sets;
  // slot de origem: o registro vive no histórico do exercício, mas ainda
  // precisamos saber em que posição do treino ele foi feito
  if (key !== slot) entry.sl = slot; else delete entry.sl;
  if (isTime(ex)) entry.u = 'seg'; else delete entry.u;
  if (e.aq) entry.aq = 1; else delete entry.aq;
  const obs = (e.obs||'').trim();
  if (obs) entry.obs = obs; else delete entry.obs;
  if (e.dor && e.dor.length) entry.dor = e.dor.slice(); else delete entry.dor;
  if (S.deload) entry.dl = 1; else delete entry.dl;

  if (S.logs[key].length > 500) S.logs[key] = S.logs[key].slice(-500);
}

// Uma entrada é identificada por sessão + posição do treino, não por sessão +
// chave: o mesmo aparelho pode ser substituto em duas posições do mesmo dia, e
// aí as duas séries vivem no mesmo histórico sem se sobrescrever.
function daSessao(key, slot, sid) {
  return (S.logs[key] || []).filter(function (x) {
    return x.sid === sid && (x.sl || key) === slot;
  })[0] || null;
}

function removeProjecao(key, slot) {
  const s = S.sessao;
  if (!s || !S.logs[key]) return;
  S.logs[key] = S.logs[key].filter(function (x) {
    return !(x.sid === s.sid && (slot == null || (x.sl || key) === slot));
  });
  if (!S.logs[key].length) delete S.logs[key];
}

// reprojeta o dia inteiro: usado ao migrar rascunho antigo e ao trocar exercício
function projetaTudo() {
  const dia = S.sessao ? S.sessao.day : view.day;
  if (!treino(dia) || !S.draft || S.draft.day !== dia) return;
  treino(dia).ex.forEach(function (ex, i) { projeta(i); });
}

// ---------- os quatro estados de um exercício numa sessão ----------
// "Pulei" e "não fiz" são coisas diferentes: uma é decisão, a outra é omissão.
// Só a decisão é gravada; a omissão é derivada da ausência de registro.
function entradaDaSessao(dia, i, sid) {
  const base = slotDe(dia, i);
  const chaves = Object.keys(S.logs);
  for (let j = 0; j < chaves.length; j++) {
    const e = daSessao(chaves[j], base, sid);
    if (e) return e;
  }
  return null;
}

function estadoEx(dia, i, sid, pulados) {
  const ex = treino(dia) && treino(dia).ex[i];
  if (!ex) return 'nada';
  const e = entradaDaSessao(dia, i, sid);
  if (e) {
    const feitas = e.sets.filter(Boolean).length;
    const previstas = e.dl ? Math.ceil(ex.s / 2) : ex.s;
    return feitas >= previstas ? 'feito' : 'parcial';
  }
  if ((pulados || []).indexOf(slotDe(dia, i)) >= 0) return 'pulado';
  return 'nada';
}

// resumo de pendências de uma sessão, para a confirmação e para o detalhe
function pendencias(dia, sid, pulados) {
  const r = { feito: [], parcial: [], pulado: [], nada: [] };
  if (!treino(dia)) return r;
  treino(dia).ex.forEach(function (ex, i) {
    r[estadoEx(dia, i, sid, pulados)].push({ i: i, nome: ex.n });
  });
  return r;
}

function ehPulado(i) {
  const s = S.sessao;
  return !!(s && (s.pulados || []).indexOf(slotDe(view.day, i)) >= 0);
}

async function pularEx(i) {
  const s = S.sessao || abreSessaoVazia();
  if (!s.pulados) s.pulados = [];
  const chave = slotDe(view.day, i);
  const j = s.pulados.indexOf(chave);
  if (j >= 0) s.pulados.splice(j, 1);
  else {
    s.pulados.push(chave);
    if (view.open === i) view.open = null;
  }
  await save(); render();
  toast(j >= 0 ? 'Exercício de volta.' : 'Exercício pulado nesta sessão.');
}

// pular antes de qualquer série também abre a sessão: é uma decisão do treino
function abreSessaoVazia() {
  const agora = Date.now();
  S.sessao = { day: view.day, inicio: agora, ultima: agora, sid: agora, pausas: [], pulados: [] };
  const marca = { day: view.day, t: agora, sid: agora, ini: 'auto' };
  if (S.deload) marca.dl = 1;
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  return S.sessao;
}

// ---------- finalizar ----------
async function finalizarSessao() {
  const s = S.sessao;
  if (!s) return;
  const p = pendencias(s.day, s.sid, s.pulados);
  const feitas = p.feito.length;

  if (!feitas && !p.parcial.length) {
    if (!confirm('Nenhuma série registrada neste treino. Descartar a sessão?')) return;
    S.done = S.done.filter(function (x) { return x.sid !== s.sid; });
    S.sessao = null; S.draft = null; S.mods = null;
    view.open = null; view.fired = {}; view.editProg = false;
    view.day = nextDay();
    soltarTela();
    await save(); render(); window.scrollTo(0, 0);
    toast('Sessão descartada.');
    return;
  }

  const pend = p.parcial.concat(p.nada);
  if (pend.length) {
    const lista = pend.slice(0, 4).map(function (x) { return '· ' + x.nome; }).join('\n');
    const resto = pend.length > 4 ? '\ne mais ' + (pend.length - 4) : '';
    if (!confirm('Finalizar com ' + pend.length + (pend.length === 1 ? ' exercício pendente?' : ' exercícios pendentes?')
      + '\n\n' + lista + resto + '\n\nEles ficam marcados como não feitos no histórico.')) return;
  }

  const mods = modsDoDia(s.day);
  if (mods.length) {
    // a sessão continua aberta até ele decidir: sair sem responder mantém o
    // padrão conservador, que é não mexer no oficial
    view.promo = { day: s.day, mods: mods.slice(), dec: mods.map(function () { return 'hoje'; }),
                   motivo: null, feitas: feitas,
                   resumoMods: mods.map(function (m) { return textoMod(s.day, m); }) };
    view.editProg = false;
    render();
    return;
  }
  await encerraDeVerdade(s.day, feitas, null);
}

async function encerraDeVerdade(dia, feitas, resumoMods) {
  const s = S.sessao;
  if (!s) return;
  const dur = duracaoSessao(s, Date.now());
  const marca = S.done.filter(function (x) { return x.sid === s.sid; })[0];
  // o que foi mudado fica no registro do dia, mesmo que não vire permanente:
  // daqui a um mês, "por que o volume desse dia foi outro?" tem resposta
  if (marca && resumoMods && resumoMods.length) marca.mods = resumoMods;
  fechaSessao('manual');
  view.open = null; view.editProg = false;
  soltarTela();
  await save(); render(); window.scrollTo(0, 0);
  toast('Treino ' + dia + ' encerrado · ' + fmtDur(dur) + ' · ' + feitas + (feitas === 1 ? ' exercício' : ' exercícios'));
}

// entradas da sessão aberta não servem de referência para elas mesmas
function historico(key) { return _historico(S.logs, key, S.sessao); }

async function save() {
  try { await DB.set(KEY, JSON.stringify(S)); return true; }
  catch (e) { console.error('não salvou', e); return false; }
}

// ---------- helpers ----------
// Sessão avulsa (fora do plano) não move a rotação nem entra na conta das 48:
// ela é presença, não é o programa.
function ultimaDoPlano() {
  for (let i = S.done.length-1; i >= 0; i--) if (S.done[i].day && !S.done[i].livre) return S.done[i];
  return null;
}
function nextDay() {
  const u = ultimaDoPlano();
  if (!u) return 'A';
  const i = rot().indexOf(u.day);
  return rot()[(i+1) % rot().length];
}
// Identidade de um exercício numa posição do treino. Devolve o id do
// exercício, não a posição: é essa linha que desprende o histórico do lugar.
function id(d,i){ const t = treino(d); return (t && t.ex[i]) ? t.ex[i].id : d + i; }

// ---------- rascunho do treino em andamento ----------
// Antes disso, abrir outro exercício apagava o que já tinha sido digitado:
// render() reescreve o innerHTML e os valores viviam só no DOM.
function draftOf(i) {
  if (!S.draft || S.draft.day !== view.day) S.draft = { day: view.day, t: Date.now(), ex: {} };
  if (!S.draft.ex[i]) S.draft.ex[i] = { s: [], obs: '', dor: [], alt: null };
  const e = S.draft.ex[i];
  if (!Array.isArray(e.s)) e.s = [];
  if (!Array.isArray(e.dor)) e.dor = [];
  return e;
}
// Reconstrói o rascunho a partir do que a sessão aberta já registrou.
// Sem isso, navegar entre os dias da rotação no meio do treino deixava os
// campos em branco — e digitar por cima apagaria as séries que já existiam,
// porque projeta() reescreve o conjunto inteiro a partir do rascunho.
function hidrataDraft(dia) {
  const s = S.sessao;
  if (!s || s.day !== dia || !treino(dia)) return;
  // criar rascunho vazio aqui contaminaria o estado: na abertura seguinte a
  // migração de rascunho antigo o leria como treino em andamento
  if (!S.draft || S.draft.day !== dia) S.draft = { day: dia, t: Date.now(), ex: {} };

  treino(dia).ex.forEach(function (ex, i) {
    if (S.draft.ex[i]) return;
    const base = slotDe(dia, i);
    const chave = Object.keys(S.logs).filter(function (k) {
      return !!daSessao(k, base, s.sid);
    })[0];
    if (!chave) return;
    const e = daSessao(chave, base, s.sid);
    S.draft.ex[i] = {
      s: e.sets.map(function (x) { return x ? [x[0], x[1]] : [null, null]; }),
      obs: e.obs || '',
      dor: (e.dor || []).slice(),
      aq: !!e.aq
    };
  });
}

function draftPeek(i) {
  return (S.draft && S.draft.day === view.day && S.draft.ex && S.draft.ex[i]) || null;
}
let saveT = null;
function queueSave() {
  if (S.draft) S.draft.t = Date.now();
  clearTimeout(saveT);
  saveT = setTimeout(save, 700);
}

// ---------- substituição ----------
// Trocar é uma edição do dia como qualquer outra: vira um mod, e no fim da
// sessão ele decide se leva para o oficial. O registro vai para o histórico
// do exercício substituto, que é onde ele sempre deveria ter ido.
function altOf(i) {
  const t = treino(view.day);
  const ex = t && t.ex[i];
  return (ex && ex.orig && ex.orig !== ex.id) ? ex.id : null;
}
function logKey(d,i) { return id(d,i); }

// Opções de troca, em três camadas: quem o treinador indicou (com o que muda),
// depois o resto do catálogo do mesmo grupo, depois o catálogo inteiro. Sem a
// segunda camada, todo exercício que ele cadastrar nasceria invisível aqui.
function altList(d,i) {
  const ex = treino(d).ex[i];
  // ancorada no exercício de origem: depois de uma troca ainda queremos ver
  // os indicados do titular, e o caminho de volta
  const base = exDe(ex.orig || ex.id);
  const vistos = { }; vistos[ex.id] = 1;
  const out = [];
  (ALT[base.n] || []).forEach(function (a) {
    const k = slugEx(a.n);
    if (vistos[k]) return; vistos[k] = 1;
    out.push({ id:k, n:a.n, w:a.w, ind:1 });
  });
  Object.keys(CAT).forEach(function (k) {
    if (vistos[k] || CAT[k].arq) return;
    if (CAT[k].g !== base.g || !base.g) return;
    vistos[k] = 1;
    out.push({ id:k, n:CAT[k].n, w:'mesmo grupo muscular', ind:0 });
  });
  return out;
}

// Substitutos já registrados nesta posição do treino. Agora que a chave é o
// exercício, quem sabe disso é o campo 'sl' de cada entrada.
function variantsOf(d,i) {
  const base = slotDe(d,i);
  return Object.keys(S.logs).filter(function (k) {
    return k !== base && S.logs[k].some(function (e) { return e.sl === base; });
  }).map(function (k) { return { key:k, name:nomeEx(k) }; });
}

// Último registro de um exercício, para a lista de troca dizer se ele já foi
// usado e com quanto. Sem isso a troca é escolha às cegas.
function ultimoDe(idEx) {
  const l = S.logs[idEx];
  if (!l || !l.length) return null;
  return l[l.length - 1];
}

// ---------- séries: deload corta pela metade, sem tocar na carga ----------
function setsFor(ex) { return _setsFor(ex, S.deload); }

function pausaGeral() { return S.done.length ? diasDesde(S.done[S.done.length-1].t) : 0; }
function sessoesDeTrabalho() { return S.done.filter(function (x) { return !x.dl && !x.livre; }).length; }
function diasSemBackup() {
  if (S.export) return diasDesde(S.export);
  return S.done.length ? diasDesde(S.done[0].t) : 0;
}

// ---------- marcos de adesão ----------
function marcos() {
  const out = [];
  const n = S.done.length;
  if (n && n % 25 === 0) out.push(`Sessão número ${n}.`);

  const porSemana = {};
  S.done.forEach(function (x) { const k = weekStart(x.t); porSemana[k] = (porSemana[k]||0) + 1; });
  let seq = 0;
  // só semanas fechadas: a semana em andamento ainda pode não bater a meta
  for (let k = weekStart(Date.now()) - 7*86400000; seq < 300; k -= 7*86400000) {
    if ((porSemana[k]||0) >= 4) seq++; else break;
  }
  if (seq >= 3) out.push(`${seq} semanas seguidas com 4 ou mais treinos.`);
  return out;
}
function pausaEx(key) { return _pausaEx(historico(key)); }

function dorSeguida(key) { return _dorSeguida(historico(key)); }
function lastSet(key, k) { return _lastSet(historico(key), k); }
function lastOf(d,i){ const h = historico(id(d,i)); return h.length ? h[h.length-1] : null; }
function cargaTipo(key, ex) {
  if (S.carga && S.carga[key]) return S.carga[key];
  return (ex && ex.car) || 'pino';
}
function isCorpo(key, ex) { return cargaTipo(key, ex) === 'corpo'; }
function shouldUp(d, i, ex) { return _shouldUp(lastOf(d, i), ex, pausaEx(id(d, i))); }
function fmtLast(l, seg) {
  if (!l) return null;
  if (seg) return l.sets.map(s => s ? (s[0] ? fmtNum(s[0])+'kg×'+s[1]+'s' : s[1]+'s') : '–').join('  ');
  return l.sets.map(s => s ? fmtNum(s[0])+'×'+s[1] : '–').join('  ');
}


// só marca o que foi medido de verdade
function periodoDaSessao(m) { return temHora(m) ? periodoDe(m.t) : null; }

// Sessão retroativa sem hora informada não tem horário de verdade: o app
// guarda um valor neutro só para ordenar, e não finge que mediu.
function temHora(m) { return !!m && (!m.retro || m.hora === 1) && !m.livre; }
function horaDaSessao(m) { return temHora(m) ? fmtHora(m.t) : null; }
function fimDaSessao(m) { return temHora(m) && m.dur ? fmtHora(m.t + m.dur + (m.pausado||0)) : null; }

function sessoesDoDia(t) { return S.done.filter(function (x) { return sameDay(x.t, t); }); }
function marcaDe(m) { return m.livre ? '•' : m.day; }

function chartSVG(H, modo, rot) {
  if (!H.length) return '';
  const n = H.length;

  // faixa de cima: o que progride. Embaixo: a métrica de apoio, quando existe.
  // Em peso do corpo, quem progride é a repetição; a carga é o acessório.
  let A, B = null;
  if (modo === 'seg') {
    A = { v: H.map(tutOf), u:'seg', f: fmtInt };
    if (H.some(function (x) { return maxLoad(x) > 0; })) B = { v: H.map(maxLoad), u: rot||'kg', f: fmtNum };
  } else if (modo === 'corpo') {
    A = { v: H.map(repsOf), u:'reps', f: fmtInt };
    if (H.some(function (x) { return maxLoad(x) > 0; })) B = { v: H.map(maxLoad), u:'+kg', f: fmtNum };
  } else {
    A = { v: H.map(maxLoad), u: rot||'kg', f: fmtNum };
    B = { v: H.map(volOf), u:'vol', f: fmtK };
  }

  const x0 = 46, x1 = 292;
  const aT = 22, aB = B ? 68 : 100;
  const bT = 94, bB = 124;
  const alt = (B ? bB : aB) + 16;
  const aHi = Math.max.apply(null, A.v), aLo = Math.min.apply(null, A.v);
  const px = i => n === 1 ? (x0+x1)/2 : x0 + (x1-x0) * i/(n-1);
  const ay = v => aHi === aLo ? (aT+aB)/2 : aB - (v-aLo)/(aHi-aLo) * (aB-aT);
  const anchor = i => i === 0 && n > 1 ? 'start' : (i === n-1 && n > 1 ? 'end' : 'middle');

  let g = `<svg viewBox="0 0 320 ${alt+8}" class="chart" role="img" aria-label="progresso das últimas ${n} sessões">`;

  g += `<line x1="${x0}" y1="${aT}" x2="${x1}" y2="${aT}" class="gl"/>`
     + `<line x1="${x0}" y1="${aB}" x2="${x1}" y2="${aB}" class="gl"/>`
     + `<text x="${x0-8}" y="${ay(aHi)+3}" class="ax" text-anchor="end">${A.f(aHi)}</text>`
     + (aHi === aLo ? '' : `<text x="${x0-8}" y="${aB+3}" class="ax" text-anchor="end">${A.f(aLo)}</text>`)
     + `<text x="${x0-8}" y="${aT-9}" class="axu" text-anchor="end">${A.u}</text>`;
  if (n > 1) g += `<polyline class="cl" points="${H.map((h,i)=> px(i)+','+ay(A.v[i])).join(' ')}"/>`;
  H.forEach((h,i) => {
    const last = i === n-1;
    g += `<circle cx="${px(i)}" cy="${ay(A.v[i])}" r="${last?4.5:3.5}" class="cp${last?' last':''}"/>`
       + `<text x="${px(i)}" y="${ay(A.v[i])-11}" class="vl${last?' last':''}" text-anchor="${anchor(i)}">${A.f(A.v[i])}</text>`;
  });

  if (B) {
    const bHi = Math.max.apply(null, B.v), bLo = Math.min.apply(null, B.v);
    const by = v => bHi === bLo ? (bT+bB)/2 : bB - (v-bLo)/(bHi-bLo) * (bB-bT);
    g += `<line x1="${x0}" y1="${bT}" x2="${x1}" y2="${bT}" class="gl"/>`
       + `<line x1="${x0}" y1="${bB}" x2="${x1}" y2="${bB}" class="gl"/>`
       + `<text x="${x0-8}" y="${by(bHi)+3}" class="ax" text-anchor="end">${B.f(bHi)}</text>`
       + (bHi === bLo ? '' : `<text x="${x0-8}" y="${bB+3}" class="ax" text-anchor="end">${B.f(bLo)}</text>`)
       + `<text x="${x0-8}" y="${bT-9}" class="axu" text-anchor="end">${B.u}</text>`;
    if (n > 1) g += `<polyline class="vlline" points="${H.map((h,i)=> px(i)+','+by(B.v[i])).join(' ')}"/>`;
    H.forEach((h,i) => {
      g += `<circle cx="${px(i)}" cy="${by(B.v[i])}" r="${i===n-1?4:3}" class="vp${i===n-1?' last':''}"/>`;
    });
  }

  H.forEach((h,i) => {
    g += `<text x="${px(i)}" y="${alt}" class="ax" text-anchor="${anchor(i)}">${fmtDate(h.t)}</text>`;
  });
  return g + '</svg>';
}

// ---------- total do que está montado ----------
// Só para os tipos que se dobram: anilha por lado e halter em cada mão.
// Nunca soma o peso da barra, que varia demais para ser chutado.
function textoTotal(i, key, ex) {
  const c = CARGAS[cargaTipo(key, ex)];
  if (!c || !c.dobra) return '';
  const dr = draftPeek(i);
  let v = null;
  if (dr) for (let k = setsFor(ex)-1; k >= 0; k--) if (dr.s[k] && dr.s[k][0] != null) { v = dr.s[k][0]; break; }
  if (v == null) { const p = lastSet(key, 0); if (p) v = p[0]; }
  if (!v) return '';
  return `${fmtNum(v)} ${c.cada} · <b>${fmtNum(totalAnilhas(v))} kg ${c.total}</b>${c.obs}`;
}

function atualizaAnilhas(i) {
  const el = document.getElementById('tot' + i);
  if (!el) return;
  const ex = treino(view.day).ex[i];
  el.innerHTML = textoTotal(i, logKey(view.day, i), ex);
}

// ---------- estado do dia ----------
// Vive num elemento próprio para poder ser atualizado sem re-render: inp()
// evita render() de propósito, senão o campo perde o foco a cada tecla.
function estadoDoDia(P) {
  const aberta = S.sessao;
  if (aberta && aberta.retro) {
    const r = resumoDaSessao(aberta);
    return `<b>preenchendo ${fmtDate(aberta.inicio)}</b> · ${r.series} ${r.series===1?'série':'séries'}${r.vol?' · '+fmtInt(r.vol)+' kg×reps':''}`;
  }
  if (aberta) {
    const r = resumoDaSessao(aberta);
    return `${r.series} ${r.series===1?'série registrada':'séries registradas'}${r.vol?' · '+fmtInt(r.vol)+' kg×reps':''}`;
  }
  const hoje = sessoesDoDia(Date.now());
  if (hoje.length) {
    const m = hoje[hoje.length-1];
    const r = resumoDaSessao(m);
    return m.livre
      ? `<b>treino avulso hoje</b> · ${(m.grupos||[]).join(', ')}`
      : `<b>treino ${m.day} encerrado hoje</b> · ${fmtDur(m.dur)} · ${r.series} ${r.series===1?'série':'séries'}`;
  }
  return `${P.tag} · ${P.ex.reduce(function (a,e) { return a+e.s; }, 0)} séries prescritas`;
}

// O cardio vivia enterrado na terceira seção de outra aba. Como é obrigação
// semanal e fácil de esquecer, o placar passa a ficar onde ele olha todo dia.
function linhaCardio() {
  const n = cardioSemana().length;
  const hoje = cardioDoDia(Date.now());
  const f = Object.assign({ m:'bike', min:25, i:'moderado' }, view.cardioForm);
  const perna = pernaHoje();

  const resumo = hoje.length
    ? hoje.map(function (c) { return c.min + ' min de ' + c.m; }).join(' · ')
    : `${n} de 3 nesta semana`;

  let h = `<div class="cardl ${hoje.length?'feito':''}">
    <span class="cardl-t">cardio</span>
    <span class="cardl-n">${resumo}</span>
    <button class="cardl-b" onclick="abrirCardioRapido()">${view.cardioRapido?'fechar':'registrar'}</button>
  </div>`;

  if (view.cardioRapido) {
    h += `<div class="cardq">
      <div class="chips">${MODAIS.map(function (m) {
        return `<button class="chip ${f.m===m?'sel':''}" onclick="cardioSet('m','${m}')">${m}</button>`;
      }).join('')}</div>
      <div class="chips" style="margin-top:7px">${[20,25,30,40].map(function (v) {
        return `<button class="chip ${f.min===v?'sel':''}" onclick="cardioSet('min',${v})">${v} min</button>`;
      }).join('')}${['leve','moderado'].map(function (v) {
        return `<button class="chip ${f.i===v?'sel':''}" onclick="cardioSet('i','${v}')">${v}</button>`;
      }).join('')}</div>
      ${perna.length?`<div class="cwarn" style="margin-top:10px">Você treinou ${perna.join(' e ')} hoje. A regra é não pôr cardio no mesmo período de treino de perna.</div>`:''}
      <button class="dbtn" style="margin-top:10px" onclick="addCardio()">Registrar ${f.min} min de ${f.m}</button>
    </div>`;
  }
  return h;
}
function abrirCardioRapido(){ view.cardioRapido = !view.cardioRapido; render(); }

// Controles do ciclo. Ficam no cabeçalho porque ação de sessão não pode
// exigir rolar sete exercícios até o fim.
// O relógio vive ao lado da letra do dia, que é onde o olho já está.
// Anda de segundo em segundo sem re-render, para não roubar o foco do campo.
function relogioTexto(s) {
  const tot = Math.floor(duracaoAtual(s) / 1000);
  const h = Math.floor(tot / 3600), m = Math.floor(tot / 60) % 60, seg = tot % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0'))
    + ':' + String(seg).padStart(2, '0');
}

function relogioDaSessao() {
  const s = S.sessao;
  if (!s) return `<button class="day-ini" onclick="iniciarSessao()">iniciar</button>`;
  if (s.retro) return '';
  return `<div class="day-rel ${s.pausadoEm ? 'pausado' : ''}">
    <span id="relogio">${relogioTexto(s)}</span>
    <em>${s.pausadoEm ? 'pausado' : 'desde ' + fmtHora(s.inicio)}</em>
  </div>`;
}

let relogioT = null;
function tickRelogio() {
  const el = document.getElementById('relogio');
  if (!el || !S.sessao) return;
  el.textContent = relogioTexto(S.sessao);
}
function ajustaRelogio() {
  const ativo = !!(S.sessao && !S.sessao.pausadoEm && !S.sessao.retro && view.tab === 'treino');
  if (ativo && !relogioT) relogioT = setInterval(tickRelogio, 1000);
  else if (!ativo && relogioT) { clearInterval(relogioT); relogioT = null; }
}

function controlesSessao() {
  const s = S.sessao;
  if (!s || s.retro) return '';
  if (s.pausadoEm) return `<div class="ctrl pausado">
    <button class="ctrl-b ini" onclick="retomarSessao()">retomar</button>
    <button class="ctrl-b" onclick="finalizarSessao()">finalizar</button>
  </div>`;
  return `<div class="ctrl">
    <button class="ctrl-b" onclick="pausarSessao()">pausar</button>
    <button class="ctrl-b fim" onclick="finalizarSessao()">finalizar</button>
  </div>`;
}

function atualizaEstado() {
  const el = document.getElementById('daymeta');
  if (el && treino(view.day)) el.innerHTML = estadoDoDia(treino(view.day));
}

// ---------- faixa da semana ----------
// Sete colunas de segunda a domingo. A letra do treino no dia em que houve
// treino, um ponto apagado no dia em que não houve. Sem julgamento, só o fato.
function faixaSemana() {
  const ini = weekStart(Date.now());
  let cel = '';
  for (let i = 0; i < 7; i++) {
    const dia = ini + i*86400000;
    const marcas = sessoesDoDia(dia);
    const hoje = sameDay(dia, Date.now());
    const futuro = dia > Date.now() && !hoje;
    const livre = marcas.length && marcas.every(function (m) { return m.livre; });
    const acao = marcas.length ? `abrirSessao(${marcas[marcas.length-1].t})` : (futuro ? '' : `abrirAdicionar(${dia})`);
    const card = cardioDoDia(dia).length;
    cel += `<div class="wd ${hoje?'hoje':''} ${marcas.length?'feito':''} ${livre?'livre':''} ${futuro?'futuro':''}"
      ${acao?`onclick="${acao}"`:''}>
      <span class="wd-d">${DIAS_CURTOS[i]}</span>
      <span class="wd-v">${marcas.length ? marcas.map(marcaDe).join('') : '+'}</span>
      ${card?'<span class="barra-cardio"></span>':''}
    </div>`;
  }
  return '<div class="semana">' + cel + '</div>';
}

// ---------- render ----------
// ---------- view-model do cartão de exercício ----------
// O componente não lê estado: recebe isto aqui pronto. Concentrar a leitura num
// lugar só é o que permite testar a tela com dado de mentira, e o que torna
// visível quanto do cartão é decisão de domínio (dor, pausa, subir carga) e
// quanto é apresentação.
function vmExercicio(d, i, ex) {
  const alt = altOf(i);
  const key = logKey(d, i);
  const dr = draftPeek(i);
  const l = historico(key).slice(-1)[0] || null;
  const ns = setsFor(ex);
  const seg = isTime(ex);
  const tipo = cargaTipo(key, ex);
  const corpo = tipo === 'corpo';
  const lista = altList(d, i);
  const dorLast = l && l.dor && l.dor.length ? l.dor : null;
  const dorRep = dorSeguida(key);
  const parado = pausaEx(key);
  const pulado = ehPulado(i);

  const linhas = [];
  for (let k = 0; k < ns; k++) {
    const p = lastSet(key, k);
    const v = dr && dr.s[k] ? dr.s[k] : [null, null];
    linhas.push({
      valor: v,
      place: [
        p && p[0] ? fmtNum(p[0]) : ((seg || corpo) ? '0' : 'kg'),
        p ? String(p[1]) : (seg ? 'seg' : 'reps')
      ]
    });
  }

  return {
    i: i,
    nome: ex.n,
    nomeOriginal: alt ? nomeEx(ex.orig) : null,
    alt: alt,
    grupo: ex.g,
    cue: ex.cue,
    faixa: ex.r,
    series: ns,
    composto: !!ex.c,
    bi: ex.bi || 0,
    seg: seg,
    unidade: seg ? 'kg' : CARGAS[tipo].rot,
    descanso: descOf(ex),
    descansoTxt: fmtDesc(descOf(ex)),
    cargaOpcional: seg || corpo,

    aberto: view.open === i,
    pulado: pulado,
    deload: S.deload,
    estado: S.sessao ? estadoEx(d, i, S.sessao.sid, S.sessao.pulados) : null,
    up: !alt && !S.deload && shouldUp(d, i, ex),

    linhas: linhas,
    // O total em anilhas continua vindo de textoTotal como HTML porque
    // atualizaAnilhas() escreve nele durante a digitação, sem re-render — é o
    // único ponto do cartão em que o DOM ainda é tocado por fora do Preact.
    totalHTML: CARGAS[tipo].dobra ? textoTotal(i, key, ex) : null,

    ultima: l ? {
      txt: fmtLast(l, seg),
      rotulo: seg ? 'tempo' : 'volume',
      valor: seg ? fmtInt(tutOf(l)) + ' s' : fmtInt(volOf(l))
    } : null,

    dorRep: dorRep ? dorRep.map(dorName).join(' e ') : null,
    dorLast: dorLast ? dorLast.map(dorName).join(' e ') : null,
    pausaTxt: (!dorRep && parado >= PAUSA_DIAS && !alt)
      ? Math.round(parado) + ' dias sem este exercício' : null,

    temTroca: lista.length > 0,
    trocaAberta: view.swapOpen === i,
    troca: {
      indicados: lista.filter(function (a) { return a.ind; }).map(opcaoDeTroca),
      outros: lista.filter(function (a) { return !a.ind; }).map(opcaoDeTroca)
    },

    cargaAberta: view.carga === i,
    tipoNome: CARGAS[tipo].nome,
    tipoAjuda: CARGAS[tipo].ajuda,
    cargas: Object.keys(CARGAS).map(function (t) {
      return { k: t, nome: CARGAS[t].nome, sel: tipo === t };
    }),

    mostraAquecimento: i === 0,
    aq: !!(dr && dr.aq),
    notaAberta: !!((dr && (dr.obs || dr.dor.length)) || view.nota === i),
    obs: dr ? (dr.obs || '') : '',
    dores: DORES.map(function (x) {
      return { k: x.k, t: x.t, on: !!(dr && dr.dor.indexOf(x.k) >= 0) };
    })
  };
}

// "última vez: 60 × 8" vale mais que a descrição do substituto, quando existe:
// ele já usou aquele aparelho e o número é a referência real.
function opcaoDeTroca(a) {
  const u = ultimoDe(a.id);
  return {
    id: a.id, n: a.n,
    antes: (u && u.sets && u.sets[0])
      ? 'última vez: ' + fmtNum(u.sets[0][0]) + ' × ' + u.sets[0][1]
      : a.w
  };
}

// As ações do cartão. Objeto único e estável: passar as funções por props é o
// que substitui o `onclick="fn()"` como atributo, e o que vai permitir apagar a
// ponte global quando a última tela virar componente.
const ACOES = {
  toggle: function (i) { toggle(i); },
  inp: function (el, i, k, pos) { inp(el, i, k, pos); },
  startTimer: function (s) { startTimer(s); },
  proximoDoBiset: function (i) { proximoDoBiset(i); },
  setAlt: function (i, id) { setAlt(i, id); },
  toggleSwap: function (i) { toggleSwap(i); },
  abrirSubstituicao: function (i) { abrirSubstituicao(i); },
  pularEx: function (i) { pularEx(i); },
  openHist: function (i) { openHist(i); },
  toggleAq: function (i) { toggleAq(i); },
  abrirCarga: function (i) { abrirCarga(i); },
  setCarga: function (i, t) { setCarga(i, t); },
  abrirNota: function (i) { abrirNota(i); },
  obsIn: function (el, i) { obsIn(el, i); },
  toggleDor: function (i, k) { toggleDor(i, k); }
};


function render() {
  if (view.promo) return renderPromo();
  if (view.prog) return renderPrograma();
  if (view.retro) return renderRetro();
  if (view.add) return renderAdicionar();
  if (view.sessao) return renderSessao();
  if (view.hist) return renderHist();
  const app = document.getElementById('app');
  const d = view.day, P = treino(d);
  const cycle = Math.floor(S.done.length / rot().length) + 1;
  const trabalho = sessoesDeTrabalho();
  const toDeload = 48 - (trabalho % 48);

  const naTreino = view.tab === 'treino';
  // A tela de hoje é meio string, meio componente durante a migração: o
  // cabeçalho ainda é template, a lista de exercícios já é componente.
  let corpoDoDia = null, rodape = '';
  if (naTreino) hidrataDraft(d);
  let h = `<div class="hdr ${naTreino?'':'curto'}">
    <div class="eyebrow"><span>${diaExtenso(Date.now())}</span><span>ciclo ${cycle} · ${S.done.length} sessões</span></div>
    ${naTreino ? `<div class="dayline">
      <div class="dayletter">${d}</div>
      <div class="day-txt"><div class="dayname">${P.name}</div><div class="daymeta" id="daymeta">${estadoDoDia(P)}</div></div>
      ${relogioDaSessao()}
    </div>
    ${controlesSessao()}
    ${podeEditar(d) ? `<div class="edlink">
      <button onclick="modoEdicao(${view.editProg?'false':'true'})">${view.editProg?'sair da edição':'editar treino de hoje'}</button>
      <button onclick="abrirPrograma(null)">programa</button>
      ${temMods(d)?`<span class="edcount">${modsDoDia(d).length} ${modsDoDia(d).length===1?'mudança':'mudanças'} só para hoje</span>`:''}
    </div>` : ''}
    ${faixaSemana()}
    ${linhaCardio()}` : ''}
  </div>
  ${view.tab==='treino' ? '<div class="rot">' +
    rot().map(x => `<button class="${x===view.day?'on':''} ${x===nextDay()?'next':''}" onclick="go('${x}')">${x}</button>`).join('') +
  '</div>' : ''}
  <div class="tabs">
    <button class="${view.tab==='treino'?'on':''}" onclick="tab('treino')">hoje</button>
    <button class="${view.tab==='acomp'?'on':''}" onclick="tab('acomp')">acompanhamento</button>
    <button class="${view.tab==='corpo'?'on':''}" onclick="tab('corpo')">corpo</button>
    <button class="${view.tab==='ajustes'?'on':''}" onclick="tab('ajustes')">ajustes</button>
  </div>`;

  if (naTreino && S.sessao && S.sessao.retro)
    h += `<div class="deload on"><b>Preenchendo o treino de ${diaExtenso(S.sessao.inicio)}.</b>
      As séries que você digitar entram nessa data, não em hoje.
      <button class="dlbtn" onclick="concluirRetro()">concluir</button></div>`;

  if (naTreino && trabalho > 0 && trabalho % 48 === 0)
    h += `<div class="deload on"><b>Bloco de 48 sessões concluído.</b>
      Semana de deload e uma olhada no que evoluiu.
      <button class="dlbtn" onclick="abrirRetro()">ver retrospectiva</button></div>`;

  const parado = pausaGeral();
  if (naTreino && parado >= PAUSA_DIAS)
    h += `<div class="deload on"><b>${Math.round(parado)} dias desde o último treino salvo.</b>
      O selo de subir carga fica suspenso nesta volta. Os placeholders continuam mostrando a última carga registrada, só para você ter a referência.</div>`;

  if (naTreino && S.deload)
    h += `<div class="deload on"><b>Modo deload ativo.</b> Metade das séries, mesmas cargas. Os placeholders continuam mostrando a carga da última semana normal.
      <button class="dlbtn" onclick="setDeload(false)">sair do deload</button></div>`;
  else if (naTreino && toDeload <= 6 && S.done.length > 0)
    h += `<div class="deload"><b>Deload chegando.</b> Faltam ${toDeload} sessões para a semana de metade das séries.
      <button class="dlbtn" onclick="setDeload(true)">ativar agora</button></div>`;

  if (view.tab === 'ajustes') {
    h += '<div class="rules">' + RULES.map(r => `
      <div class="rule ${r.warn?'warn':''}">
        <h3><em>${r.k}</em>${r.t}</h3>
        ${r.p.map(x=>`<p>${x}</p>`).join('')}
      </div>`).join('') + '</div>' + renderData();
  } else if (view.tab === 'acomp') {
    h += renderAcomp();
  } else if (view.tab === 'corpo') {
    h += renderBody();
  } else if (view.editProg && podeEditar(d)) {
    h += renderEdicao(d, P);
  } else {
    // A lista de exercícios é componente, não string: é a única parte da tela
    // com campo de digitação, e reescrever o innerHTML dela a cada tecla era a
    // origem das gambiarras de foco e dos dois bugs que perdiam série.
    corpoDoDia = P.ex.map(function (ex, i) {
      return <Exercicio key={id(d, i)} vm={vmExercicio(d, i, ex)} acoes={ACOES} />;
    });

    rodape = `<div class="autonota">
      Cada série entra no histórico assim que você preenche carga e repetição.
      Não há nada para salvar. O treino se encerra sozinho e a rotação avança para ${rot()[(rot().indexOf(d)+1)%rot().length]}.
    </div>`;
  }

  montaNoApp(<>
    <Bruto html={h} />
    {corpoDoDia}
    {rodape ? <Bruto html={rodape} /> : null}
  </>);
  ajustaRelogio();
}


// ---------- modo de edição do dia ----------
// Ele edita de pé, com uma mão, no meio do treino. Os alvos são grandes e as
// mudanças valem só para hoje: a decisão de tornar permanente vem no fim.
function renderEdicao(d, P) {
  const mods = modsDoDia(d);
  let h = `<div class="edbar">
    <div>
      <b>Editando o treino ${d} de hoje.</b>
      ${mods.length
        ? mods.length + (mods.length === 1 ? ' mudança pendente. No fim do treino você decide se ela fica.'
                                           : ' mudanças pendentes. No fim do treino você decide o que fica.')
        : 'O programa oficial só muda se você quiser, no fim do treino.'}
    </div>
    <button class="edbar-b" onclick="modoEdicao(false)">pronto</button>
  </div>`;

  h += P.ex.map(function (ex, i) {
    const slot = ex.orig || ex.id;
    const trocado = ex.orig && ex.orig !== ex.id;
    // o impacto só aparece onde ele mexeu ou onde o número saiu do alvo:
    // uma linha por exercício seria ruído em toda a tela
    const imp = impactoSeries(d, ex.g);
    const mostraImp = imp && (ex.mod || imp.acima);
    return `<div class="edx ${ex.mod?'mexido':''}">
      <div class="edx-h">
        <div class="ord">${String(i+1).padStart(2,'0')}</div>
        <div class="edx-n">
          ${ex.n}
          ${trocado?`<em>no lugar de ${nomeEx(ex.orig)}</em>`:''}
          <span>${ex.g}${ex.desde?' · no programa há ' + semanasDe(ex.desde):''}</span>
        </div>
        <div class="edx-mv">
          <button onclick="moverEx(${i},-1)" ${i===0?'disabled':''} aria-label="subir">↑</button>
          <button onclick="moverEx(${i},1)" ${i===P.ex.length-1?'disabled':''} aria-label="descer">↓</button>
        </div>
      </div>
      <div class="edx-c">
        <div class="stepper">
          <button onclick="mudaSeries(${i},-1)" ${ex.s<=1?'disabled':''}>−</button>
          <b>${ex.s}</b><span>séries</span>
          <button onclick="mudaSeries(${i},1)" ${ex.s>=8?'disabled':''}>+</button>
        </div>
        <button class="edx-b" onclick="abrirSubstituicao(${i})">trocar</button>
        <button class="edx-b rm" onclick="removerEx(${i})">remover</button>
      </div>
      ${mostraImp ? `<div class="edx-imp ${imp.acima?'acima':''}">${imp.txt}</div>` : ''}
      ${view.swapOpen === i ? listaDeTroca(d, i) : ''}
    </div>`;
  }).join('');

  h += `<button class="edadd" onclick="abrirAddEx()">adicionar exercício</button>`;
  if (mods.length) {
    h += `<div class="edmods">
      <div class="edmods-h">mudanças de hoje</div>
      ${mods.map(function (m, j) {
        return `<div class="edmod"><span>${textoMod(d, m)}</span>
          <button onclick="desfazMod(${j})">desfazer</button></div>`;
      }).join('')}
    </div>`;
  }
  if (view.addEx) h += painelAddEx(d);
  return h;
}

// A lista de troca é a mesma do registro; aqui ela abre dentro da linha.
function listaDeTroca(d, i) {
  const ex = treino(d).ex[i];
  const lista = altList(d, i);
  const trocado = ex.orig && ex.orig !== ex.id;
  const opt = function (a) {
    const u = ultimoDe(a.id);
    const antes = u && u.sets && u.sets[0]
      ? 'última vez: ' + fmtNum(u.sets[0][0]) + ' × ' + u.sets[0][1] : a.w;
    return `<button class="swapopt" onclick="setAlt(${i},'${escAttr(a.id)}')">
      <b>${a.n}</b><span>${antes}</span></button>`;
  };
  const ind = lista.filter(function (a) { return a.ind; });
  const outros = lista.filter(function (a) { return !a.ind; });
  return `<div class="swap">
    <div class="swap-h">Mesmo padrão de movimento:</div>
    ${ind.map(opt).join('')}
    ${outros.length?`<div class="swap-h" style="margin-top:12px">Outros de ${exDe(ex.orig||ex.id).g}:</div>${outros.map(opt).join('')}`:''}
    ${trocado?`<button class="swapopt back-orig" onclick="setAlt(${i},null)"><b>Voltar para ${nomeEx(ex.orig)}</b><span>Cancela a troca.</span></button>`:''}
    <button class="swapopt cancel" onclick="toggleSwap(${i})"><b>Fechar</b></button>
  </div>`;
}

// Adicionar exercício: catálogo inteiro, com busca, e a porta para cadastrar
// equipamento que o app ainda não conhece.
function painelAddEx(d) {
  const q = (view.addQ || '').toLowerCase().trim();
  const nodia = {};
  const t = treino(d);
  if (t) t.ex.forEach(function (x) { nodia[x.id] = 1; });
  const achados = Object.keys(CAT)
    .filter(function (k) { return !CAT[k].arq; })
    .filter(function (k) { return !q || CAT[k].n.toLowerCase().indexOf(q) >= 0 || (CAT[k].g||'').indexOf(q) >= 0; })
    .sort(function (a, b) { return CAT[a].n.localeCompare(CAT[b].n); })
    .slice(0, 40);

  return `<div class="addex">
    <div class="swap-h">Adicionar ao treino ${d} de hoje</div>
    <input type="text" class="addq" id="addq" placeholder="buscar exercício ou grupo"
      value="${escAttr(view.addQ || '')}" oninput="buscaEx(this.value)">
    <div class="addlist">
      ${achados.length ? achados.map(function (k) {
        return `<button class="swapopt" onclick="addExercicio('${escAttr(k)}')">
          <b>${CAT[k].n}</b><span>${CAT[k].g || 'sem grupo'}${nodia[k]?' · já está neste treino':''}</span></button>`;
      }).join('') : '<p class="cue">Nada com esse nome no catálogo.</p>'}
    </div>
    ${view.novoEx ? `<div class="novoex">
      <div class="swap-h">Exercício novo</div>
      <input type="text" id="nxn" class="addq" placeholder="nome do exercício">
      <select id="nxg" class="addq">
        <option value="">grupo muscular</option>
        ${gruposDoPlano().map(function (g) { return `<option value="${escAttr(g)}">${g}</option>`; }).join('')}
      </select>
      <select id="nxc" class="addq">
        ${Object.keys(CARGAS).map(function (t) { return `<option value="${t}">${CARGAS[t].nome}</option>`; }).join('')}
      </select>
      <label class="nxk"><input type="checkbox" id="nxk"> é um composto (descanso mais longo)</label>
      <button class="dbtn" onclick="criarExercicio()">Criar e adicionar</button>
    </div>` : `<button class="swapopt novo" onclick="abrirNovoEx()"><b>Cadastrar exercício novo</b>
      <span>Equipamento que o app ainda não conhece. Ele passa a ter histórico próprio.</span></button>`}
    <button class="swapopt cancel" onclick="fecharAddEx()"><b>Fechar</b></button>
  </div>`;
}

function semanasDe(t) {
  const sem = Math.floor((Date.now() - t) / (7 * 86400000));
  if (sem < 1) return 'menos de 1 semana';
  return sem + (sem === 1 ? ' semana' : ' semanas');
}

// ---------- impacto no volume ----------
// O treinador definiu um alvo por músculo. Mexer nas séries mostra na hora
// para onde o número vai, porque esse é o único momento em que dá para mudar
// de ideia sem custo. O alvo é CALCULADO do programa, nunca transcrito.
const ALVO = alvoDoPrograma(PROGRAMA, ROT_BASE);
const ALVO_TOTAL = Object.keys(ALVO).reduce(function (n, k) { return n + ALVO[k]; }, 0);

// Séries diretas de um músculo na rotação inteira, com os mods de hoje.
function seriesDe(g) { return seriesDeGrupo(rot().map(treino), g); }

function impactoSeries(d, g) { return g ? impacto(g, seriesDe(g), ALVO[g]) : null; }


// ---------- ações da edição ----------
function modoEdicao(on) {
  view.editProg = !!on;
  view.open = null; view.swapOpen = null; view.addEx = false; view.addQ = ''; view.novoEx = false;
  render(); window.scrollTo(0,0);
}

function mudaSeries(i, delta) {
  const d = view.day;
  const t = treino(d), ex = t.ex[i];
  const novo = ex.s + delta;
  if (novo < 1 || novo > 8) return;
  const orig = slotOriginal(d, i);
  poeMod(d, { k:'sets', slot: ex.orig || ex.id, de: orig ? orig.s : ex.s, para: novo });
  queueSave(); render();
}

function moverEx(i, delta) {
  const d = view.day;
  const t = treino(d);
  const j = i + delta;
  if (j < 0 || j >= t.ex.length) return;
  poeMod(d, { k:'mover', slot: t.ex[i].orig || t.ex[i].id, de: i, para: j });
  queueSave(); render();
}

async function removerEx(i) {
  const d = view.day;
  const ex = treino(d).ex[i];
  const slot = ex.orig || ex.id;
  if (temRegistro(d, i) && !confirm('Este exercício já tem série registrada hoje. Remover apaga o registro desta sessão. Continuar?')) return;
  removeProjecao(logKey(d, i), slotDe(d, i));
  poeMod(d, { k:'rm', slot: slot });
  view.open = null; view.swapOpen = null;
  await save(); render();
  toast(ex.n + ' fora do treino de hoje.');
}

function temRegistro(d, i) {
  const s = S.sessao;
  if (!s) return false;
  return !!daSessao(logKey(d, i), slotDe(d, i), s.sid);
}

// O slot como está no programa oficial, para o mod saber de onde partiu.
function slotOriginal(d, slotId) {
  const p = S.prog && S.prog[d];
  if (!p) return null;
  if (typeof slotId === 'number') {
    const ex = treino(d).ex[slotId];
    slotId = ex ? (ex.orig || ex.id) : null;
  }
  return p.ex.filter(function (x) { return x.id === slotId; })[0] || null;
}

function abrirAddEx() { view.addEx = true; view.addQ = ''; render(); }
function fecharAddEx() { view.addEx = false; view.addQ = ''; view.novoEx = false; render(); }
function buscaEx(q) {
  view.addQ = q;
  // render() reescreve o innerHTML: sem devolver o foco, o teclado fecha a
  // cada letra digitada
  const foco = document.activeElement && document.activeElement.id;
  render();
  if (foco) { const n = document.getElementById(foco); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
}

async function addExercicio(idEx) {
  const e = exDe(idEx);
  const s = 3, r = e.c ? '6–10' : '10–15', desc = e.c ? D_COMPOSTO : D_ISOLADOR;
  // na tela de programa a adição é permanente; na tela de hoje é só do dia
  if (view.prog && view.prog.day) {
    const d = view.prog.day;
    S.prog[d].ex.push({ id:idEx, s:s, r:r, d:desc, desde: Date.now() });
    logProg(d, e.n + ' entrou no treino · ' + s + ' × ' + r);
    view.addEx = false; view.addQ = ''; view.novoEx = false;
    await save(); render();
    toast(e.n + ' entrou no treino ' + d + '.');
    return;
  }
  const d = view.day;
  poeMod(d, { k:'add', id:idEx, s:s, r:r, d:desc, pos: treino(d).ex.length, n: Date.now() });
  view.addEx = false; view.addQ = ''; view.novoEx = false;
  await save(); render();
  toast(e.n + ' entrou no treino de hoje.');
}

function abrirNovoEx() { view.novoEx = true; view.addEx = true; render(); }

async function criarExercicio() {
  const nome = (document.getElementById('nxn') || {}).value || '';
  const g = (document.getElementById('nxg') || {}).value || '';
  const car = (document.getElementById('nxc') || {}).value || 'pino';
  const comp = !!(document.getElementById('nxk') || {}).checked;
  if (nome.trim().length < 3) { toast('Dê um nome ao exercício.'); return; }
  const k = slugEx(nome);
  if (CAT[k] && !CAT[k].arq) { toast('Já existe um exercício com esse nome.'); return; }
  S.ex[k] = { n: nome.trim(), g: g, car: car, c: comp ? 1 : 0, cue: '', meu: 1 };
  montaCatalogo();
  view.novoEx = false;
  await save();
  await addExercicio(k);
}

function desfazMod(j) {
  const b = S.mods;
  if (!b || !b.list[j]) return;
  const m = b.list[j];
  // desfazer uma troca precisa tirar a projeção da chave que ela criou
  if (m.k === 'troca') {
    const i = treino(b.day).ex.findIndex(function (x) { return (x.orig || x.id) === m.slot; });
    if (i >= 0) removeProjecao(logKey(b.day, i), slotDe(b.day, i));
  }
  b.list.splice(j, 1);
  queueSave(); render();
}

// Texto de uma mudança, em português e no passado. É o que ele lê na hora de
// decidir se ela vira permanente.
function textoMod(d, m) {
  if (m.k === 'add')   return 'adicionou ' + nomeEx(m.id);
  if (m.k === 'rm')    return 'removeu ' + nomeEx(m.slot);
  if (m.k === 'troca') return nomeEx(m.slot) + ' → ' + nomeEx(m.por);
  if (m.k === 'sets')  return nomeEx(m.slot) + ': ' + m.de + ' → ' + m.para + ' séries';
  if (m.k === 'reps')  return nomeEx(m.slot) + ': ' + m.de + ' → ' + m.para + ' repetições';
  if (m.k === 'desc')  return nomeEx(m.slot) + ': descanso ' + fmtDesc(m.de) + ' → ' + fmtDesc(m.para);
  if (m.k === 'mover') return 'mudou ' + nomeEx(m.slot) + ' de posição';
  return 'mudança';
}


// ---------- decisão do fim da sessão ----------
// O padrão é "só hoje". Boa parte das mudanças é circunstancial — máquina
// quebrada, outra academia — e o caminho de menor esforço tem que ser o
// conservador, porque o app existe em parte para frear.
const MOTIVOS = [
  { k:'ocupada', t:'máquina ocupada' },
  { k:'fora',    t:'outra academia' },
  { k:'decisao', t:'decisão de programa' }
];

function renderPromo() {
  const P = view.promo;
  const app = document.getElementById('app');
  let h = `<div class="promo">
    <div class="promo-h">
      <div class="eyebrow"><span>treino ${P.day}</span><span>${P.mods.length} ${P.mods.length===1?'mudança':'mudanças'}</span></div>
      <h2>O que fica no programa?</h2>
      <p>As séries que você registrou já estão no histórico. Isto decide só o
      treino ${P.day} de amanhã.</p>
    </div>`;

  h += P.mods.map(function (m, j) {
    const imp = impactoDoMod(P.day, m);
    return `<div class="pmod">
      <div class="pmod-t">${textoMod(P.day, m)}</div>
      ${imp?`<div class="pmod-i ${imp.acima?'acima':''}">${imp.txt}</div>`:''}
      <div class="pmod-b">
        <button class="${P.dec[j]!=='oficial'?'on':''}" onclick="decidePromo(${j},'hoje')">só hoje</button>
        <button class="${P.dec[j]==='oficial'?'on':''}" onclick="decidePromo(${j},'oficial')">levar para o oficial</button>
      </div>
    </div>`;
  }).join('');

  h += `<div class="pmot">
    <div class="obs-h">motivo (opcional)</div>
    <div class="chips">${MOTIVOS.map(function (x) {
      return `<button class="chip ${P.motivo===x.k?'on':''}" onclick="motivoPromo('${x.k}')">${x.t}</button>`;
    }).join('')}</div>
  </div>`;

  const n = P.dec.filter(function (x) { return x === 'oficial'; }).length;
  h += `<button class="dbtn" style="width:100%" onclick="concluirPromo()">
    ${n ? 'Encerrar e levar ' + n + (n===1?' mudança':' mudanças') + ' para o oficial' : 'Encerrar mantendo o programa como está'}
  </button>`;
  h += `<button class="notabtn" style="width:100%;margin-top:10px" onclick="voltarDoPromo()">voltar para o treino</button>`;
  h += '</div>';
  montaHTML(h);
  window.scrollTo(0,0);
}

// O impacto que importa é o do programa DEPOIS da promoção, não o de hoje.
function impactoDoMod(d, m) {
  if (m.k === 'sets') {
    const g = exDe(m.slot).g;
    if (!g) return null;
    const oficial = seriesOficiais(g);
    const depois = oficial - m.de + m.para;
    const alvo = ALVO[g];
    if (alvo == null) return { txt: g + ': ' + oficial + ' → ' + depois + ' séries na rotação', acima: 0 };
    return { txt: g + ': ' + oficial + ' → ' + depois + ' na rotação · o treinador prescreveu ' + alvo,
             acima: depois > alvo ? 1 : 0 };
  }
  if (m.k === 'add') {
    const g = exDe(m.id).g;
    if (!g) return null;
    const depois = seriesOficiais(g) + m.s;
    const alvo = ALVO[g];
    return { txt: g + ': ' + seriesOficiais(g) + ' → ' + depois + ' na rotação'
                  + (alvo != null ? ' · o treinador prescreveu ' + alvo : ''),
             acima: alvo != null && depois > alvo ? 1 : 0 };
  }
  if (m.k === 'rm') {
    const g = exDe(m.slot).g;
    const sl = slotOriginal(d, m.slot);
    if (!g || !sl) return null;
    const depois = seriesOficiais(g) - sl.s;
    const alvo = ALVO[g];
    return { txt: g + ': ' + seriesOficiais(g) + ' → ' + depois + ' na rotação'
                  + (alvo != null ? ' · o treinador prescreveu ' + alvo : ''),
             acima: 0 };
  }
  if (m.k === 'troca') {
    const sl = slotOriginal(d, m.slot);
    if (!sl) return null;
    const sem = semanasNoPrograma(sl);
    if (sem != null && sem < 6) {
      return { txt: nomeEx(m.slot) + ' está no programa há ' + semanasDe(sl.desde)
                    + '. O treinador pede 6 a 8 semanas antes de trocar os principais.', acima: 1 };
    }
    return null;
  }
  return null;
}

// Séries de um músculo no programa OFICIAL, sem os mods de hoje.
function seriesOficiais(g) {
  return seriesDeGrupo(rot().map(function (d) {
    const pr = S.prog && S.prog[d];
    if (!pr) return null;
    return { name: pr.name, tag: pr.tag,
             ex: pr.ex.map(function (sl) { return { g: exDe(sl.id).g, s: sl.s }; }) };
  }), g);
}

function semanasNoPrograma(sl) {
  if (!sl || !sl.desde) return null;   // desde 0 = veio do treinador, não conta
  return Math.floor((Date.now() - sl.desde) / (7 * 86400000));
}

function decidePromo(j, v) { view.promo.dec[j] = v; render(); }
function motivoPromo(k) { view.promo.motivo = view.promo.motivo === k ? null : k; render(); }
function voltarDoPromo() { view.promo = null; render(); }

// Aplica ao programa oficial as mudanças escolhidas, na ordem em que foram
// feitas, e registra a decisão para dar resposta a "por que isso mudou?".
function aplicaAoOficial(d, mods, motivo) {
  const p = S.prog[d];
  if (!p) return 0;
  let n = 0;
  const agora = Date.now();
  mods.forEach(function (m) {
    if (m.k === 'add') {
      p.ex.push({ id:m.id, s:m.s, r:m.r, d:m.d, desde:agora });
      n++; return;
    }
    const i = p.ex.findIndex(function (x) { return x.id === m.slot; });
    if (i < 0) return;
    if (m.k === 'rm')    { p.ex.splice(i, 1); n++; return; }
    if (m.k === 'sets')  { p.ex[i].s = m.para; n++; return; }
    if (m.k === 'reps')  { p.ex[i].r = m.para; n++; return; }
    if (m.k === 'desc')  { p.ex[i].d = m.para; n++; return; }
    if (m.k === 'troca') { p.ex[i].id = m.por; p.ex[i].desde = agora; n++; return; }
    if (m.k === 'mover') {
      const sl = p.ex.splice(i, 1)[0];
      p.ex.splice(Math.max(0, Math.min(m.para, p.ex.length)), 0, sl);
      n++; return;
    }
  });
  if (n) {
    if (!Array.isArray(S.progLog)) S.progLog = [];
    mods.forEach(function (m) {
      S.progLog.push({ t: agora, day: d, txt: textoMod(d, m), motivo: motivo || null });
    });
    if (S.progLog.length > 300) S.progLog = S.progLog.slice(-300);
  }
  return n;
}

async function concluirPromo() {
  const P = view.promo;
  const escolhidos = P.mods.filter(function (m, j) { return P.dec[j] === 'oficial'; });
  const n = escolhidos.length ? aplicaAoOficial(P.day, escolhidos, P.motivo) : 0;
  view.promo = null;
  await encerraDeVerdade(P.day, P.feitas, P.resumoMods);
  if (n) toast(n + (n === 1 ? ' mudança levada' : ' mudanças levadas') + ' para o programa oficial.');
}


// ---------- tela de programa ----------
// Onde ele reorganiza sentado em casa. Aqui a edição é direta: mexeu, mudou o
// oficial. É o oposto da edição do dia, e a tela diz isso o tempo todo.
function difDoDia(d) {
  const base = PROGRAMA[d] ? PROGRAMA[d].ex.map(function (ex) {
    return { id: slugEx(ex.n), s: ex.s, r: ex.r, d: ex.d };
  }) : null;
  const meu = (S.prog[d] || { ex: [] }).ex;
  if (!base) return [{ k:'novo', txt:'treino criado por você' }];

  const porId = {}; base.forEach(function (x) { porId[x.id] = x; });
  const meuId = {}; meu.forEach(function (x) { meuId[x.id] = x; });
  const out = [];

  // Um exercício que saiu e outro que entrou na mesma posição é uma troca,
  // não duas mudanças. Ler "A → B" é o que ele espera.
  const trocado = {};
  meu.forEach(function (x, i) {
    const b = base[i];
    if (!b || b.id === x.id) return;
    if (porId[x.id] || meuId[b.id]) return;   // um dos dois só mudou de lugar
    trocado[x.id] = b.id;
  });

  meu.forEach(function (x) {
    const b = porId[x.id];
    if (!b) {
      out.push(trocado[x.id]
        ? { k:'troca', txt: nomeEx(trocado[x.id]) + ' → ' + nomeEx(x.id) }
        : { k:'novo', txt: nomeEx(x.id) + ' entrou · ' + x.s + ' × ' + x.r });
      return;
    }
    if (x.s !== b.s) out.push({ k:'sets', txt: nomeEx(x.id) + ': ' + b.s + ' → ' + x.s + ' séries' });
    if (x.r !== b.r) out.push({ k:'reps', txt: nomeEx(x.id) + ': ' + b.r + ' → ' + x.r + ' repetições' });
    if (x.d !== b.d) out.push({ k:'desc', txt: nomeEx(x.id) + ': descanso ' + fmtDesc(b.d) + ' → ' + fmtDesc(x.d) });
  });
  const saiuPorTroca = {};
  Object.keys(trocado).forEach(function (k) { saiuPorTroca[trocado[k]] = 1; });
  base.forEach(function (x) {
    if (!meuId[x.id] && !saiuPorTroca[x.id]) out.push({ k:'fora', txt: nomeEx(x.id) + ' saiu do treino' });
  });
  const a = meu.filter(function (x) { return porId[x.id]; }).map(function (x) { return x.id; }).join('|');
  const b = base.filter(function (x) { return meuId[x.id]; }).map(function (x) { return x.id; }).join('|');
  if (a !== b) out.push({ k:'ordem', txt:'a ordem mudou' });
  return out;
}

function difTotal() {
  let n = 0;
  rot().forEach(function (d) { n += difDoDia(d).length; });
  if (rot().join('|') !== ROT_BASE.join('|')) n++;
  return n;
}

function seriesDoDia(d) {
  const p = S.prog[d];
  return p ? p.ex.reduce(function (n, x) { return n + x.s; }, 0) : 0;
}

function totalSeries() {
  return rot().reduce(function (n, d) { return n + seriesDoDia(d); }, 0);
}

function abrirPrograma(d) {
  view.prog = { day: d || null, modo: 'lista' };
  view.editProg = false; view.addEx = false; view.addQ = ''; view.novoEx = false;
  render(); window.scrollTo(0,0);
}
function fecharPrograma() { view.prog = null; render(); window.scrollTo(0,0); }
function modoPrograma(m) { view.prog.modo = m; view.prog.day = null; render(); window.scrollTo(0,0); }

function renderPrograma() {
  const app = document.getElementById('app');
  const V = view.prog;
  let h = `<div class="hhdr">
    <button class="back" onclick="${V.day||V.modo!=='lista'?'abrirPrograma(null)':'fecharPrograma()'}">‹ ${V.day||V.modo!=='lista'?'programa':'voltar'}</button>`;

  if (V.day) h += renderProgramaDia(V.day);
  else if (V.modo === 'diff') h += renderProgramaDiff();
  else if (V.modo === 'historico') h += renderProgramaHist();
  else h += renderProgramaLista();

  montaHTML(h);
  window.scrollTo(0,0);
}

function renderProgramaLista() {
  const dif = difTotal();
  const tot = totalSeries();
  let h = `<div class="eyebrow"><span>seu programa</span><span>${rot().length} treinos</span></div>
    <h2 class="htitle">Programa</h2>
  </div>
  <div class="hwrap">
    <div class="stats">
      <div><b>${tot}</b><span>séries diretas</span></div>
      <div><b>${ALVO_TOTAL}</b><span>do treinador</span></div>
      <div><b>${dif}</b><span>${dif===1?'diferença':'diferenças'}</span></div>
    </div>
    <p class="cue">Aqui a mudança é direta: vale a partir do próximo treino.
    Para mudar só o treino de hoje, use a edição na tela de hoje.</p>

    <div class="progdias">`;

  h += rot().map(function (d, i) {
    const p = S.prog[d];
    const n = difDoDia(d).length;
    return `<div class="progd">
      <button class="progd-b" onclick="abrirPrograma('${d}')">
        <div class="progd-l">${d}</div>
        <div class="progd-t">
          <b>${p ? p.name : 'treino ' + d}</b>
          <span>${p ? p.ex.length : 0} exercícios · ${seriesDoDia(d)} séries${n?' · ' + n + (n===1?' diferença':' diferenças'):''}</span>
        </div>
        <div class="chev">›</div>
      </button>
      <div class="progd-mv">
        <button onclick="moverDia(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button onclick="moverDia(${i},1)" ${i===rot().length-1?'disabled':''}>↓</button>
      </div>
    </div>`;
  }).join('');

  h += `</div>
    <button class="edadd" onclick="criarTreino()">criar treino novo</button>
    <div class="dgroup" style="margin-top:20px">
      <h3>Comparar com o treinador</h3>
      <p>${dif ? dif + (dif===1?' diferença em relação':' diferenças em relação') + ' ao que ele prescreveu.'
               : 'Seu programa está igual ao que o treinador prescreveu.'}</p>
      <button class="dbtn ghost" onclick="modoPrograma('diff')">ver a diferença</button>
      <button class="dbtn ghost" onclick="modoPrograma('historico')">histórico de mudanças</button>
      <button class="dbtn ghost" onclick="restaurarTudo()">restaurar o programa do treinador</button>
    </div>
  </div>`;
  return h;
}

function renderProgramaDia(d) {
  const p = S.prog[d];
  if (!p) return '</div><div class="msg">Treino não encontrado.</div>';
  const dif = difDoDia(d);
  let h = `<div class="eyebrow"><span>treino ${d}</span><span>${seriesDoDia(d)} séries</span></div>
    <h2 class="htitle">${p.name}</h2>
  </div>
  <div class="hwrap">
    ${dif.length?`<div class="progdif">
      <b>${dif.length} ${dif.length===1?'diferença':'diferenças'} do treinador</b>
      ${dif.map(function (x) { return `<span>${x.txt}</span>`; }).join('')}
      <button class="dlbtn" onclick="restaurarDia('${d}')">restaurar este treino</button>
    </div>`:''}`;

  h += p.ex.map(function (sl, i) {
    const e = exDe(sl.id);
    const imp = impactoOficial(e.g);
    return `<div class="edx">
      <div class="edx-h">
        <div class="ord">${String(i+1).padStart(2,'0')}</div>
        <div class="edx-n">${e.n}
          <span>${e.g || 'sem grupo'}${sl.desde?' · há ' + semanasDe(sl.desde):''}</span>
        </div>
        <div class="edx-mv">
          <button onclick="moverProg('${d}',${i},-1)" ${i===0?'disabled':''}>↑</button>
          <button onclick="moverProg('${d}',${i},1)" ${i===p.ex.length-1?'disabled':''}>↓</button>
        </div>
      </div>
      <div class="edx-c">
        <div class="stepper">
          <button onclick="progSeries('${d}',${i},-1)" ${sl.s<=1?'disabled':''}>−</button>
          <b>${sl.s}</b><span>séries</span>
          <button onclick="progSeries('${d}',${i},1)" ${sl.s>=8?'disabled':''}>+</button>
        </div>
        <button class="edx-b" onclick="progTroca('${d}',${i})">trocar</button>
        <button class="edx-b rm" onclick="progRemove('${d}',${i})">remover</button>
      </div>
      <div class="edx-c">
        <button class="edx-b" onclick="progReps('${d}',${i})">${sl.r} reps</button>
        <button class="edx-b" onclick="progDesc('${d}',${i})">descanso ${fmtDesc(sl.d)}</button>
      </div>
      ${imp ? `<div class="edx-imp ${imp.acima?'acima':''}">${imp.txt}</div>` : ''}
      ${view.swapOpen === i ? listaDeTrocaProg(d, i) : ''}
    </div>`;
  }).join('');

  h += `<button class="edadd" onclick="abrirAddEx()">adicionar exercício</button>`;
  if (view.addEx) h += painelAddEx(d);
  h += '</div>';
  return h;
}

function renderProgramaDiff() {
  let h = `<div class="eyebrow"><span>seu programa</span><span>vs. treinador</span></div>
    <h2 class="htitle">O que está diferente</h2>
  </div>
  <div class="hwrap">`;
  if (rot().join('|') !== ROT_BASE.join('|')) {
    h += `<div class="progdif"><b>rotação</b><span>${ROT_BASE.join(' → ')} virou ${rot().join(' → ')}</span></div>`;
  }
  let algo = false;
  rot().forEach(function (d) {
    const dif = difDoDia(d);
    if (!dif.length) return;
    algo = true;
    h += `<div class="progdif"><b>treino ${d}</b>
      ${dif.map(function (x) { return `<span>${x.txt}</span>`; }).join('')}
      <button class="dlbtn" onclick="restaurarDia('${d}')">restaurar</button></div>`;
  });
  if (!algo && rot().join('|') === ROT_BASE.join('|')) {
    h += '<div class="msg">Seu programa está igual ao que o treinador prescreveu.</div>';
  }
  h += '</div>';
  return h;
}

function renderProgramaHist() {
  const log = (S.progLog || []).slice().reverse();
  let h = `<div class="eyebrow"><span>seu programa</span><span>${log.length} ${log.length===1?'mudança':'mudanças'}</span></div>
    <h2 class="htitle">Histórico de mudanças</h2>
  </div>
  <div class="hwrap">`;
  if (!log.length) {
    h += '<div class="msg">Nenhuma mudança no programa até agora.</div></div>';
    return h;
  }
  const MOT = {}; MOTIVOS.forEach(function (x) { MOT[x.k] = x.t; });
  h += log.map(function (x) {
    return `<div class="phist">
      <div class="phist-t">${x.txt}</div>
      <div class="phist-m">treino ${x.day} · ${diaExtenso(x.t)}${x.motivo?' · ' + (MOT[x.motivo] || x.motivo):''}</div>
    </div>`;
  }).join('');
  h += '</div>';
  return h;
}

function listaDeTrocaProg(d, i) {
  const sl = S.prog[d].ex[i];
  const e = exDe(sl.id);
  const vistos = {}; vistos[sl.id] = 1;
  const out = [];
  (ALT[e.n] || []).forEach(function (a) {
    const k = slugEx(a.n);
    if (vistos[k]) return; vistos[k] = 1;
    out.push({ id:k, n:a.n, w:a.w });
  });
  Object.keys(CAT).forEach(function (k) {
    if (vistos[k] || CAT[k].arq || CAT[k].g !== e.g || !e.g) return;
    vistos[k] = 1;
    out.push({ id:k, n:CAT[k].n, w:'mesmo grupo muscular' });
  });
  return `<div class="swap">
    <div class="swap-h">Trocar no programa, a partir do próximo treino ${d}:</div>
    ${out.map(function (a) {
      const u = ultimoDe(a.id);
      const antes = u && u.sets && u.sets[0]
        ? 'última vez: ' + fmtNum(u.sets[0][0]) + ' × ' + u.sets[0][1] : a.w;
      return `<button class="swapopt" onclick="progSetTroca('${d}',${i},'${escAttr(a.id)}')">
        <b>${a.n}</b><span>${antes}</span></button>`;
    }).join('')}
    <button class="swapopt cancel" onclick="toggleSwap(${i})"><b>Fechar</b></button>
  </div>`;
}

// Impacto do programa OFICIAL contra o alvo. Só aparece quando saiu do alvo.
function impactoOficial(g) {
  if (!g) return null;
  const agora = seriesOficiais(g), alvo = ALVO[g];
  if (alvo == null || agora === alvo) return null;
  return impacto(g, agora, alvo);
}


// ---------- ações do programa ----------
// Toda mudança aqui é imediata e registrada. O log é o que responde, daqui a
// dois meses, "por que o pendulum virou hack squat?".
function logProg(d, txt, motivo) {
  if (!Array.isArray(S.progLog)) S.progLog = [];
  S.progLog.push({ t: Date.now(), day: d, txt: txt, motivo: motivo || null });
  if (S.progLog.length > 300) S.progLog = S.progLog.slice(-300);
}

async function progSeries(d, i, delta) {
  const sl = S.prog[d].ex[i];
  const novo = sl.s + delta;
  if (novo < 1 || novo > 8) return;
  const de = sl.s;
  sl.s = novo;
  logProg(d, nomeEx(sl.id) + ': ' + de + ' → ' + novo + ' séries');
  await save(); render();
}

async function moverProg(d, i, delta) {
  const ex = S.prog[d].ex;
  const j = i + delta;
  if (j < 0 || j >= ex.length) return;
  const sl = ex.splice(i, 1)[0];
  ex.splice(j, 0, sl);
  logProg(d, 'mudou ' + nomeEx(sl.id) + ' de posição');
  await save(); render();
}

async function progRemove(d, i) {
  const sl = S.prog[d].ex[i];
  if (!confirm('Tirar ' + nomeEx(sl.id) + ' do treino ' + d + '?\n\nO histórico do exercício continua guardado.')) return;
  S.prog[d].ex.splice(i, 1);
  logProg(d, nomeEx(sl.id) + ' saiu do treino');
  view.swapOpen = null;
  await save(); render();
  toast(nomeEx(sl.id) + ' fora do treino ' + d + '.');
}

function progTroca(d, i) { view.swapOpen = view.swapOpen === i ? null : i; render(); }

async function progSetTroca(d, i, idEx) {
  const sl = S.prog[d].ex[i];
  const de = sl.id;
  const sem = semanasNoPrograma(sl);
  if (sem != null && sem < 6 &&
      !confirm(nomeEx(de) + ' está no programa há ' + semanasDe(sl.desde) +
               '.\n\nO treinador pede 6 a 8 semanas antes de trocar os principais. Trocar mesmo assim?')) return;
  sl.id = idEx;
  sl.desde = Date.now();
  logProg(d, nomeEx(de) + ' → ' + nomeEx(idEx));
  view.swapOpen = null;
  await save(); render();
  toast('Trocado no programa. Vale a partir do próximo treino ' + d + '.');
}

async function progReps(d, i) {
  const sl = S.prog[d].ex[i];
  const v = prompt('Faixa de repetições de ' + nomeEx(sl.id) + ':', sl.r);
  if (v == null) return;
  const novo = String(v).trim().replace(/-/g, '–');
  if (!novo) return;
  const de = sl.r;
  sl.r = novo;
  logProg(d, nomeEx(sl.id) + ': ' + de + ' → ' + novo + ' repetições');
  await save(); render();
}

async function progDesc(d, i) {
  const sl = S.prog[d].ex[i];
  const opcoes = [D_COMPOSTO, D_MAQUINA, D_ISOLADOR, D_CURTO];
  const j = (opcoes.indexOf(sl.d) + 1) % opcoes.length;
  const de = sl.d;
  sl.d = opcoes[j];
  logProg(d, nomeEx(sl.id) + ': descanso ' + fmtDesc(de) + ' → ' + fmtDesc(sl.d));
  await save(); render();
}

async function moverDia(i, delta) {
  const r = rot().slice();
  const j = i + delta;
  if (j < 0 || j >= r.length) return;
  const d = r.splice(i, 1)[0];
  r.splice(j, 0, d);
  S.rot = r;
  logProg(d, 'rotação: ' + r.join(' → '));
  await save(); render();
}

async function criarTreino() {
  const usadas = Object.keys(S.prog);
  let letra = null;
  for (let c = 65; c <= 90; c++) {
    if (usadas.indexOf(String.fromCharCode(c)) < 0) { letra = String.fromCharCode(c); break; }
  }
  if (!letra) { toast('Sem letra livre para um treino novo.'); return; }
  const nome = prompt('Nome do treino ' + letra + ':', 'Treino ' + letra);
  if (nome == null) return;
  S.prog[letra] = { name: String(nome).trim() || ('Treino ' + letra), tag: '', ex: [] };
  S.rot = rot().concat([letra]);
  logProg(letra, 'treino ' + letra + ' criado');
  await save();
  abrirPrograma(letra);
  toast('Treino ' + letra + ' criado. Adicione os exercícios.');
}

async function restaurarDia(d) {
  if (!PROGRAMA[d]) {
    if (!confirm('O treino ' + d + ' foi criado por você e não existe no programa do treinador. Apagar o treino?')) return;
    delete S.prog[d];
    S.rot = rot().filter(function (x) { return x !== d; });
    logProg(d, 'treino ' + d + ' apagado');
    await save(); abrirPrograma(null);
    toast('Treino ' + d + ' apagado.');
    return;
  }
  const n = difDoDia(d).length;
  if (!n) { toast('O treino ' + d + ' já está igual ao do treinador.'); return; }
  if (!confirm('Desfazer ' + n + (n===1?' mudança':' mudanças') + ' no treino ' + d +
               ' e voltar ao que o treinador prescreveu?\n\nO histórico não é tocado.')) return;
  S.prog[d] = semeiaProg()[d];
  logProg(d, 'treino ' + d + ' restaurado para o do treinador');
  await save(); render();
  toast('Treino ' + d + ' de volta ao programa do treinador.');
}

async function restaurarTudo() {
  const n = difTotal();
  if (!n) { toast('Seu programa já é o do treinador.'); return; }
  if (!confirm('Desfazer ' + n + (n===1?' diferença':' diferenças') +
               ' e voltar ao programa do treinador?\n\nO histórico e os exercícios que você cadastrou não são tocados.')) return;
  S.prog = semeiaProg();
  S.rot = ROT_BASE.slice();
  logProg('-', 'programa restaurado para o do treinador');
  await save(); render();
  toast('Programa de volta ao do treinador.');
}

// ---------- histórico do exercício ----------
function renderHist() {
  const d = view.hist.day, i = view.hist.i;
  const ex = treino(d).ex[i];
  const vars = variantsOf(d,i);
  const sel = view.hist.key || id(d,i);
  const tipo = cargaTipo(sel, ex);
  const nome = nomeEx(sel);
  const H = (S.logs[sel] || []).slice(-6);
  const app = document.getElementById('app');

  let h = `<div class="hhdr">
    <button class="back" onclick="closeHist()">‹ voltar para o treino ${d}</button>
    <div class="eyebrow"><span>treino ${d} · exercício ${String(i+1).padStart(2,'0')}</span><span>${H.length} de 6 sessões</span></div>
    <h2 class="htitle">${nome}</h2>
    <div class="ex-sub">
      <span>${ex.s} × ${ex.r}</span>
      <span class="tag ${ex.c?'comp':''}">${ex.c?'composto':'isolador'}</span>
      <span class="tag">${CARGAS[tipo].nome}</span>
      ${sel!==id(d,i)?'<span class="tag swap-t">substituto</span>':''}
      ${sel===id(d,i)&&shouldUp(d,i,ex)?'<span class="up">↑ subir carga</span>':''}
    </div>
    ${vars.length?`<div class="vars">
      <button class="vchip ${sel===id(d,i)?'on':''}" onclick="histKey('${escAttr(id(d,i))}')">${ex.n}</button>
      ${vars.map(v=>`<button class="vchip ${sel===v.key?'on':''}" onclick="histKey('${escAttr(v.key)}')">${v.name}</button>`).join('')}
    </div>`:''}
  </div>`;

  if (!H.length) {
    h += `<div class="msg">Nenhuma sessão registrada neste exercício ainda.<br>O gráfico aparece depois do primeiro treino salvo.</div>`;
    montaHTML(h);
    window.scrollTo(0,0);
    return;
  }

  const seg = isTime(ex) || (H[0] && H[0].u === 'seg');
  const corpo = !seg && tipo === 'corpo';
  const rotCarga = seg ? 'kg' : CARGAS[tipo].rot;
  const met = seg ? tutOf : (corpo ? repsOf : volOf);
  const last = H[H.length-1];
  const first = H[0];
  const dv = H.length > 1 && met(first) > 0
    ? Math.round((met(last) - met(first)) / met(first) * 100)
    : null;
  const comCarga = seg && H.some(x => maxLoad(x) > 0);

  h += `<div class="hwrap">
    <div class="stats">
      ${seg
        ? `<div><b>${fmtInt(tutOf(last))}</b><span>tempo da última · seg</span></div>
           <div><b>${fmtInt(Math.round(tutOf(last)/Math.max(last.sets.filter(Boolean).length,1)))}</b><span>média por série · seg</span></div>`
        : corpo
        ? `<div><b>${fmtInt(repsOf(last))}</b><span>repetições na última</span></div>
           <div><b>${maxLoad(last)?fmtNum(maxLoad(last)):'–'}</b><span>carga somada · kg</span></div>`
        : `<div><b>${fmtNum(maxLoad(last))}</b><span>carga atual · ${rotCarga}</span></div>
           <div><b>${fmtInt(volOf(last))}</b><span>volume da última</span></div>`}
      <div><b class="${dv!==null&&dv>0?'up':''}">${dv===null?'–':(dv>0?'+':'')+dv+'%'}</b><span>${seg?'tempo':(corpo?'repetições':'volume')} no período</span></div>
    </div>
    ${chartSVG(H, seg ? 'seg' : (corpo ? 'corpo' : null), rotCarga)}
    <div class="legend">
      <span class="c"><i></i>${seg?'tempo total sob tensão':(corpo?'repetições da sessão':'carga máxima da sessão')}</span>
      ${(seg||corpo) ? (H.some(function(x){return maxLoad(x)>0;})?'<span class="v"><i></i>carga adicionada</span>':'') : '<span class="v"><i></i>volume total</span>'}
    </div>
    <div class="hsec">sessão a sessão</div>`;

  const base = S.logs[sel].length - H.length;   // índice real dentro do log completo
  h += H.map((s, k) => {
    const v = met(s);
    const pv = k > 0 ? met(H[k-1]) : null;
    const delta = pv ? Math.round((v-pv)/pv*100) : null;
    const real = base + k;
    if (view.edit === real) return linhaEdicao(sel, real, s, seg);
    return `<div class="hs">
      <div class="hs-top">
        <span class="hs-date">${fmtDate(s.t)}</span>
        <span class="hs-vol">${fmtInt(v)}<em>${seg?'seg no total':'kg×reps'}</em></span>
        ${s.dl?'<span class="tag dl-t">deload</span>':''}
        ${delta===null?'':`<span class="hs-d ${delta>0?'up':''}">${delta>0?'+':''}${delta}%</span>`}
      </div>
      <div class="hs-sets">${s.sets.map(x => x
        ? `<span>${seg ? (x[0]?fmtNum(x[0])+'kg × '+x[1]+'s':x[1]+'s')
                      : (corpo && !x[0] ? x[1]+' reps' : fmtNum(x[0])+'×'+x[1])}</span>`
        : '<span class="nul">–</span>').join('')}
        ${(seg||corpo)?'':`<span class="nul">${repsOf(s)} reps</span>`}
        ${!seg && CARGAS[tipo].dobra && maxLoad(s)?`<span class="nul">${fmtNum(totalAnilhas(maxLoad(s)))} kg ${CARGAS[tipo].total}</span>`:''}
      </div>
      ${s.dor&&s.dor.length?`<div class="pain">dor em ${s.dor.map(dorName).join(' e ')}</div>`:''}
      ${s.obs?`<div class="hs-obs">${escapeHTML(s.obs)}</div>`:''}
      <button class="edbtn" onclick="editarSessao(${real})">corrigir esta sessão</button>
    </div>`;
  }).reverse().join('');

  const dores = H.filter(x => x.dor && x.dor.length);
  if (dores.length) {
    h += `<div class="painsum"><b>${dores.length} ${dores.length===1?'sessão marcada':'sessões marcadas'} com dor de tendão</b>${H.length>1?` nas últimas ${H.length} sessões`:''}.
      A regra do programa é tirar o exercício por 2 semanas e trocar o ângulo, não empurrar por cima.</div>`;
  }

  h += `<p class="cue" style="margin:22px 0 0">${ex.cue}</p></div>`;

  montaHTML(h);
  window.scrollTo(0,0);
}

function openHist(i){ view.hist = { day:view.day, i, key:logKey(view.day,i) }; view.edit = null; render(); }

// ---------- correção de sessão passada ----------
// Digitou 400 no lugar de 40 e só percebeu na semana seguinte: até aqui não
// havia saída a não ser exportar o JSON e editar na mão.
function linhaEdicao(key, real, s, seg) {
  const e = S.logs[key][real];
  let rows = '';
  e.sets.forEach(function (x, k) {
    rows += `<div class="setrow">
      <div class="setno">${k+1}</div>
      <div class="f"><input type="text" inputmode="decimal" id="ed${k}_0"
        value="${x?fmtNum(x[0]):''}" placeholder="${seg?'0':'kg'}" oninput="limpaNum(this,true)"><span class="unit">kg</span></div>
      <div class="x">×</div>
      <div class="f"><input type="text" inputmode="numeric" id="ed${k}_1"
        value="${x?x[1]:''}" placeholder="${seg?'seg':'reps'}" oninput="limpaNum(this,false)">${seg?'<span class="unit">seg</span>':''}</div>
    </div>`;
  });
  return `<div class="hs editando">
    <div class="hs-top"><span class="hs-date">${fmtDate(e.t)}</span><span class="hs-vol" style="font-size:11px">corrigindo</span></div>
    <div style="margin-top:10px">${rows}</div>
    <div class="obs-h" style="margin-top:14px">dor de tendão</div>
    <div class="chips">${DORES.map(x => `<button class="chip ${(e.dor||[]).indexOf(x.k)>=0?'on':''}" onclick="editDor('${x.k}')">${x.t}</button>`).join('')}</div>
    <textarea class="note" id="edobs" placeholder="observação da sessão">${escapeHTML(e.obs||'')}</textarea>
    <div class="edrow">
      <button class="dbtn" onclick="salvarEdicao()">Salvar correção</button>
      <button class="dbtn ghost" onclick="cancelarEdicao()">cancelar</button>
    </div>
    <button class="danger" style="width:100%;margin-top:10px" onclick="apagarSessao()">apagar esta sessão</button>
  </div>`;
}

function editarSessao(real){ view.edit = real; render(); }
function cancelarEdicao(){ view.edit = null; render(); }

function editDor(k) {
  const e = S.logs[view.hist.key][view.edit];
  if (!e.dor) e.dor = [];
  const j = e.dor.indexOf(k);
  if (j >= 0) e.dor.splice(j,1); else e.dor.push(k);
  guardaCamposEdicao();
  render();
}

// preserva o que já foi digitado quando os chips forçam re-render
function guardaCamposEdicao() {
  const e = S.logs[view.hist.key][view.edit];
  e.sets.forEach(function (x, k) {
    const a = document.getElementById('ed'+k+'_0'), b = document.getElementById('ed'+k+'_1');
    if (!a || !b) return;
    const w = parseFloat(a.value.replace(',','.')), r = parseInt(b.value,10);
    e.sets[k] = isNaN(r) ? null : [isNaN(w) ? 0 : w, r];
  });
  const o = document.getElementById('edobs');
  if (o) { const t = o.value.trim(); if (t) e.obs = t; else delete e.obs; }
}

async function salvarEdicao() {
  const e = S.logs[view.hist.key][view.edit];
  guardaCamposEdicao();
  if (!e.dor || !e.dor.length) delete e.dor;
  if (!e.sets.filter(Boolean).length) {
    toast('Uma sessão sem nenhuma série. Use apagar se foi engano.');
    return;
  }
  view.edit = null;
  await save(); render();
  toast('Sessão corrigida.');
}

async function apagarSessao() {
  if (!confirm('Apagar esta sessão do histórico? Isso não tem volta.')) return;
  const key = view.hist.key;
  S.logs[key].splice(view.edit, 1);
  if (!S.logs[key].length) delete S.logs[key];
  view.edit = null;
  await save();
  if (!S.logs[key]) view.hist.key = id(view.hist.day, view.hist.i);
  render();
  toast('Sessão apagada.');
}
function histKey(k){ view.hist.key = k; view.edit = null; render(); }
function closeHist(){ const i = view.hist.i; view.hist = null; view.edit = null; view.open = i; render(); }

function cardioDoDia(t) { return S.cardio.filter(function (c) { return sameDay(c.t, t); }); }
function cardioSemana() {
  const w = weekStart(Date.now());
  return S.cardio.filter(c => c.t >= w).sort((a,b) => b.t - a.t);
}
// treino de perna salvo hoje: sinaliza, não bloqueia
function pernaHoje() {
  return S.done.filter(x => (x.day==='C' || x.day==='F') && sameDay(x.t, Date.now())).map(x => x.day);
}

function renderCardio() {
  const sem = cardioSemana();
  const n = sem.length;
  const perna = pernaHoje();
  const f = view.cardioForm || { m:'bike', min:25, i:'moderado' };

  let estado, cls;
  if (n < 2) { estado = n === 0 ? 'Nenhuma sessão nesta semana ainda.' : 'Falta 1 sessão para a dose mínima da semana.'; cls = ''; }
  else if (n <= 3) { estado = 'Dose da semana cumprida.'; cls = 'ok'; }
  else { estado = 'Acima da dose prescrita de 2 a 3 sessões.'; cls = 'over'; }

  return `
    <div class="hsec" style="margin:30px 0 0">cardio</div>
    <div class="week">
      <div class="week-n">${n} <em>de 3</em></div>
      <div class="week-s ${cls}">sessões nesta semana<br><b>${estado}</b></div>
    </div>
    <p class="week-p">25 a 40 minutos, 2 a 3 vezes por semana, RPE 4 a 6: respiração acelerada, mas dá para conversar. São 50 a 110 minutos na semana. O cardio está aqui por saúde cardiovascular, capacidade de trabalho e regulação do apetite.</p>

    <div class="dgroup">
      <h3>Registrar sessão</h3>
      <div class="obs-h">modalidade</div>
      <div class="chips">${MODAIS.map(m => `<button class="chip ${f.m===m?'sel':''}" onclick="cardioSet('m','${m}')">${m}</button>`).join('')}</div>
      <div class="obs-h" style="margin-top:16px">duração</div>
      <div class="chips">${[20,25,30,40].map(v => `<button class="chip ${f.min===v?'sel':''}" onclick="cardioSet('min',${v})">${v} min</button>`).join('')}</div>
      <div class="obs-h" style="margin-top:16px">intensidade</div>
      <div class="chips">${['leve','moderado'].map(v => `<button class="chip ${f.i===v?'sel':''}" onclick="cardioSet('i','${v}')">${v}</button>`).join('')}</div>
      ${perna.length?`<div class="cwarn">Você salvou o treino ${perna.join(' e ')} hoje. A regra é não pôr cardio no mesmo período de treino de perna — se ainda der, deixe para outro dia.</div>`:''}
      <p class="crule">Depois do A: 25 a 30 min. No dia de descanso: 30 a 40 min. Depois do F: 20 a 30 min, opcional. Evite antes de C ou F, e nunca antes do treino.</p>
      <button class="dbtn" onclick="addCardio()">Registrar ${f.min} min de ${f.m}</button>
    </div>

    <div class="dgroup">
      <h3>Esta semana</h3>
      ${n ? sem.map(c => `<div class="crow">
        <span class="crow-d">${fmtDate(c.t)}</span>
        <span class="crow-m">${c.m}</span>
        <span class="crow-n">${c.min} min · ${c.i}</span>
        <button class="crow-x" onclick="delCardio(${c.t})">remover</button>
      </div>`).join('') : '<p style="margin:0">Nada registrado desde segunda-feira.</p>'}
    </div>`;
}

function cardioSet(k, v) {
  view.cardioForm = Object.assign({ m:'bike', min:25, i:'moderado' }, view.cardioForm);
  view.cardioForm[k] = v;
  render();
}
async function addCardio() {
  const f = Object.assign({ m:'bike', min:25, i:'moderado' }, view.cardioForm);
  S.cardio.push({ t: Date.now(), m: f.m, min: f.min, i: f.i });
  if (S.cardio.length > 200) S.cardio = S.cardio.slice(-200);
  await save();
  view.cardioRapido = false;
  render();
  const n = cardioSemana().length;
  toast(`${f.min} min de ${f.m} registrados · ${n} de 3 nesta semana`);
}
async function delCardio(t) {
  S.cardio = S.cardio.filter(c => c.t !== t);
  await save();
  render();
  toast('Sessão removida.');
}

// ---------- acompanhamento ----------
// A tela que faltava: o app sabia tudo sobre cada exercício e nada sobre o mês.
function mesRef() {
  const b = view.mes || 0;
  const d = new Date();
  d.setDate(1); d.setHours(0,0,0,0);
  d.setMonth(d.getMonth() + b);
  return d;
}

function totaisDoPeriodo(de, ate) {
  const marcas = S.done.filter(function (x) { return x.t >= de && x.t < ate; });
  let vol = 0, tempo = 0, series = 0;
  marcas.forEach(function (m) {
    const r = resumoDaSessao(m);
    vol += r.vol; series += r.series;
    tempo += m.dur || (S.sessao && S.sessao.sid === m.sid ? S.sessao.ultima - S.sessao.inicio : 0);
  });
  const dias = {};
  marcas.forEach(function (m) { dias[new Date(m.t).toDateString()] = 1; });
  const comTempo = marcas.filter(function (m) { return m.dur; }).length;
  return { marcas: marcas, vol: vol, tempo: tempo, series: series, comTempo: comTempo, dias: Object.keys(dias).length };
}

// média móvel de treinos por semana nas últimas 4 semanas fechadas.
// Deliberadamente não é sequência: você treina 5 a 6 vezes por semana, então
// sequência quebraria todo domingo e viraria cobrança em vez de informação.
function mediaSemanal() {
  const fim = weekStart(Date.now());
  const de = fim - 4*7*86400000;
  const n = S.done.filter(function (x) { return x.t >= de && x.t < fim; }).length;
  const temSemanas = S.done.some(function (x) { return x.t < fim; });
  return temSemanas ? n/4 : null;
}

// um só marcador por dia: se houve mais de um treino, vale o primeiro medido
function periodoNaCelula(marcas) {
  for (let i = 0; i < marcas.length; i++) {
    const p = periodoDaSessao(marcas[i]);
    if (p) return '<u class="per ' + p.k + '">' + p.rot + '</u>';
  }
  return '';
}

function renderAcomp() {
  const base = mesRef();
  const de = base.getTime();
  const fimD = new Date(base); fimD.setMonth(fimD.getMonth()+1);
  const ate = fimD.getTime();
  const T = totaisDoPeriodo(de, ate);
  const med = mediaSemanal();

  // grade do mês, começando na segunda
  const primeiro = new Date(de);
  const offset = (primeiro.getDay() + 6) % 7;
  const diasNoMes = new Date(base.getFullYear(), base.getMonth()+1, 0).getDate();
  let cel = DIAS_CURTOS.map(function (x) { return '<span class="cal-h">'+x+'</span>'; }).join('');
  for (let i = 0; i < offset; i++) cel += '<span class="cal-x"></span>';
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const t = new Date(base.getFullYear(), base.getMonth(), dia).getTime();
    const marcas = sessoesDoDia(t);
    const hoje = sameDay(t, Date.now());
    const futuro = t > Date.now() && !hoje;
    const livre = marcas.length && marcas.every(function (m) { return m.livre; });
    const acao = marcas.length ? `abrirSessao(${marcas[marcas.length-1].t})` : (futuro ? '' : `abrirAdicionar(${t})`);
    const card = cardioDoDia(t).length;
    cel += `<span class="cal-d ${marcas.length?'feito':''} ${livre?'livre':''} ${hoje?'hoje':''} ${futuro?'futuro':''} ${card?'com-cardio':''}"
      ${acao?`onclick="${acao}"`:''}>
      <em>${dia}</em>${marcas.length?'<i>'+marcas.map(marcaDe).join('')+'</i>':''}${periodoNaCelula(marcas)}
      ${card?'<span class="barra-cardio"></span>':''}
    </span>`;
  }

  const lista = S.done.slice().filter(function (x) { return x.t >= de && x.t < ate; }).sort(function (a,b) { return b.t - a.t; });
  const comHora = lista.filter(temHora);
  const horarios = { n: comHora.length };
  if (comHora.length) {
    const mins = comHora.map(function (m) { const d = new Date(m.t); return d.getHours()*60 + d.getMinutes(); });
    const med = Math.round(mins.reduce(function (a,b) { return a+b; }, 0) / mins.length);
    const fmt = function (v) { return String(Math.floor(v/60)).padStart(2,'0') + ':' + String(v%60).padStart(2,'0'); };
    horarios.media = fmt(med);
    horarios.min = fmt(Math.min.apply(null, mins));
    horarios.max = fmt(Math.max.apply(null, mins));
  }

  const cardMes = S.cardio.filter(function (c) { return c.t >= de && c.t < ate; });
  const soCardio = Object.keys(cardMes.reduce(function (acc, c) {
    if (!sessoesDoDia(c.t).length) acc[new Date(c.t).toDateString()] = 1;
    return acc;
  }, {})).length;

  return `<div class="data">
    <div class="mesnav">
      <button onclick="mudaMes(-1)">‹</button>
      <span>${MESES[base.getMonth()]} ${base.getFullYear()}</span>
      <button onclick="mudaMes(1)" ${view.mes>=0?'disabled':''}>›</button>
    </div>

    <div class="stats" style="margin-top:16px">
      <div><b>${T.dias}</b><span>${T.dias===1?'dia treinado':'dias treinados'}</span></div>
      <div><b>${T.tempo?fmtDur(T.tempo):'–'}</b><span>tempo total${T.comTempo>1?' · méd '+fmtDur(Math.round(T.tempo/T.comTempo)):''}</span></div>
      <div><b>${T.vol?fmtK(T.vol):'–'}</b><span>volume · kg×reps</span></div>
    </div>

    <div class="cal">${cel}</div>
    <div class="callegenda">${PERIODOS.map(function (p) {
      return '<span><u class="per ' + p.k + '">' + p.rot + '</u>' + p.nome + '</span>';
    }).join('')}</div>

    ${med!==null?`<p class="mediasem"><b>${fmtDec(med)}</b> treinos por semana<br><span>média das últimas 4 semanas</span></p>`:''}
    ${horarios.n?`<p class="mediasem" style="margin-top:14px"><b>${horarios.media}</b> em média<br><span>horário de início · mais cedo ${horarios.min} · mais tarde ${horarios.max}</span></p>`:''}
    ${cardMes.length?`<p class="mediasem" style="margin-top:14px"><b>${cardMes.length}</b> ${cardMes.length===1?'sessão de cardio':'sessões de cardio'}<br><span>${fmtInt(cardMes.reduce(function(a,c){return a+c.min;},0))} minutos no mês${soCardio?' · '+soCardio+' em '+(soCardio===1?'dia sem musculação':'dias sem musculação'):''}</span></p>`:''}

    <button class="dbtn" style="margin-top:22px" onclick="abrirAdicionar()">Registrar um treino passado</button>
    <p class="cue" style="margin:9px 0 0">Ou toque num dia vazio do calendário.</p>

    <div class="hsec" style="margin-top:26px">sessões do mês</div>
    ${lista.length ? lista.map(function (m) {
      const r = resumoDaSessao(m);
      const dur = m.dur != null ? m.dur : (S.sessao && S.sessao.sid === m.sid ? S.sessao.ultima - S.sessao.inicio : null);
      const aberta = S.sessao && S.sessao.sid === m.sid;
      const desc = m.livre
        ? (m.nome ? m.nome + ' · ' : '') + (m.grupos||[]).join(', ')
        : `${fmtDur(dur)} · ${r.series} ${r.series===1?'série':'séries'}${r.vol?' · '+fmtK(r.vol):''}`;
      return `<div class="sessrow" onclick="abrirSessao(${m.t})">
        <span class="sess-d">${fmtDate(m.t)}${horaDaSessao(m)?'<em>'+horaDaSessao(m)+'</em>':''}</span>
        <span class="sess-l ${m.livre?'livre':''}">${marcaDe(m)}</span>
        <span class="sess-n">${desc}${!m.livre && m.dur && m.fim !== 'manual' ? ' <em class="aprox">aprox</em>' : ''}</span>
        ${aberta?'<span class="sess-o">em andamento</span>':''}
        ${cardioDoDia(m.t).length?'<span class="tag card-t">cardio</span>':''}
        ${m.retro?'<span class="tag">retroativo</span>':''}
        ${m.dl?'<span class="tag dl-t">deload</span>':''}
      </div>`;
    }).join('') : '<p class="cue" style="margin:0">Nenhum treino registrado neste mês.</p>'}
  </div>`;
}

function mudaMes(n) {
  const novo = (view.mes || 0) + n;
  if (novo > 0) return;
  view.mes = novo;
  render(); window.scrollTo(0,0);
}

// ---------- registro retroativo ----------
// "Treinei ontem e não abri o app." Dois casos: foi um treino do plano, ou foi
// outra coisa. O segundo registra presença e grupo muscular, sem fingir que
// tem carga e repetição que ninguém anotou.
function gruposDoPlano() {
  const set = {};
  rot().forEach(function (d) { treino(d).ex.forEach(function (ex) { set[ex.g] = 1; }); });
  return Object.keys(set).sort(function (a,b) {
    const pa = PRIO.indexOf(a), pb = PRIO.indexOf(b);
    if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    return a.localeCompare(b, 'pt-BR');
  });
}

function abrirAdicionar(t) {
  const base = t != null ? t : Date.now() - 86400000;
  const d = new Date(base); d.setHours(7,0,0,0);
  view.add = { t: d.getTime(), tipo: null, grupos: [], dur: null, nome: '', hora: '' };
  view.sessao = null;
  render(); window.scrollTo(0,0);
}
function fecharAdicionar(){ view.add = null; render(); window.scrollTo(0,0); }

async function concluirRetro() {
  const t = S.sessao ? S.sessao.inicio : null;
  fechaSessao('manual');
  view.open = null;
  await save();
  render(); window.scrollTo(0,0);
  if (t) toast('Treino de ' + fmtDate(t) + ' concluído.');
}

function addSet(campo, valor) {
  const a = view.add;
  if (campo === 'grupo') {
    const i = a.grupos.indexOf(valor);
    if (i >= 0) a.grupos.splice(i,1); else a.grupos.push(valor);
  } else if (campo === 'dia') {
    const d = new Date(a.t); d.setDate(d.getDate() + valor);
    if (d.getTime() > Date.now()) return;
    a.t = d.getTime();
  } else {
    a[campo] = a[campo] === valor ? null : valor;
  }
  render();
}
function addNome(el){ view.add.nome = el.value; }
function addHora(el) {
  let v = el.value.replace(/[^0-9:]/g, '');
  if (v.length === 2 && el.value.length === 2 && v.indexOf(':') < 0) v += ':';
  if (v !== el.value) el.value = v;
  view.add.hora = v;
}
// 'HH:MM' válido vira o instante do dia escolhido
function aplicaHora(base, txt) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((txt||'').trim());
  if (!m) return null;
  const hh = +m[1], mm = +m[2];
  if (hh > 23 || mm > 59) return null;
  const d = new Date(base);
  d.setHours(hh, mm, 0, 0);
  return d.getTime();
}

function renderAdicionar() {
  const a = view.add;
  const jaTem = sessoesDoDia(a.t);
  const grupos = gruposDoPlano();
  const app = document.getElementById('app');
  const futuro = a.t + 86400000 > Date.now() + 86400000;

  let h = `<div class="hhdr">
    <button class="back" onclick="fecharAdicionar()">‹ voltar</button>
    <div class="eyebrow"><span>registrar treino passado</span></div>
    <h2 class="htitle">${diaExtenso(a.t)}</h2>
  </div>
  <div class="hwrap">
    <div class="mesnav" style="margin-top:4px">
      <button onclick="addSet('dia',-1)">‹</button>
      <span style="text-transform:none">${fmtDate(a.t)}</span>
      <button onclick="addSet('dia',1)" ${sameDay(a.t, Date.now())?'disabled':''}>›</button>
    </div>
    ${jaTem.length?`<div class="deload" style="margin-top:14px"><b>Já existe treino registrado neste dia.</b>
      ${jaTem.map(function(m){return m.livre?'avulso':'treino '+m.day;}).join(', ')}. Adicionar de novo cria uma segunda sessão.</div>`:''}

    <div class="obs-h" style="margin-top:22px">o que foi</div>
    <div class="chips">
      ${rot().map(function (x) { return `<button class="chip ${a.tipo===x?'sel':''}" onclick="addSet('tipo','${x}')">${x}</button>`; }).join('')}
      <button class="chip ${a.tipo==='livre'?'sel':''}" onclick="addSet('tipo','livre')">outro treino</button>
    </div>
    ${a.tipo && a.tipo !== 'livre' ? `<p class="cue" style="margin:12px 0 0">${treino(a.tipo).name} · ${treino(a.tipo).tag}</p>` : ''}

    ${a.tipo === 'livre' ? `
      <div class="obs-h" style="margin-top:22px">grupos musculares</div>
      <div class="chips">${grupos.map(function (g) {
        return `<button class="chip ${a.grupos.indexOf(g)>=0?'sel':''}" onclick="addSet('grupo','${g}')">${g}</button>`;
      }).join('')}</div>
      <input class="note" style="margin-top:14px" placeholder="o que foi, se quiser dizer (opcional)"
        value="${escapeHTML(a.nome)}" oninput="addNome(this)">
      <p class="cue" style="margin:12px 0 0">Treino avulso conta como dia treinado no calendário e na média semanal, mas não move a rotação nem entra na conta das 48 sessões do bloco.</p>
    ` : ''}

    <div class="obs-h" style="margin-top:22px">horário, se lembrar</div>
    <div class="addrow">
      <div class="f"><input type="text" inputmode="numeric" id="ahora"
        value="${escapeHTML(a.hora||'')}" placeholder="06:15" oninput="addHora(this)"></div>
    </div>
    <p class="crule" style="margin:8px 0 0">Em branco, o app não inventa horário.</p>

    <div class="obs-h" style="margin-top:22px">duração, se lembrar</div>
    <div class="chips">
      ${[30,45,60,75].map(function (v) { return `<button class="chip ${a.dur===v?'sel':''}" onclick="addSet('dur',${v})">${v} min</button>`; }).join('')}
    </div>

    <div class="edrow" style="margin-top:26px">
      <button class="dbtn" onclick="gravarRetro(false)" ${a.tipo?'':'disabled'}>Adicionar</button>
    </div>
    ${a.tipo && a.tipo !== 'livre' ? `<button class="dbtn ghost" style="margin-top:9px" onclick="gravarRetro(true)">Adicionar e preencher os exercícios</button>` : ''}
  </div>`;

  montaHTML(h);
}

async function gravarRetro(detalhar) {
  const a = view.add;
  if (!a.tipo) { toast('Escolha qual treino foi.'); return; }
  if (a.tipo === 'livre' && !a.grupos.length) { toast('Marque pelo menos um grupo muscular.'); return; }

  const comHora = aplicaHora(a.t, a.hora);
  const quando = comHora != null ? comHora : a.t;
  const sid = quando;
  const marca = { t: quando, sid: sid, retro: 1 };
  if (comHora != null) marca.hora = 1;
  if (a.tipo === 'livre') {
    marca.livre = 1;
    marca.grupos = a.grupos.slice();
    if (a.nome.trim()) marca.nome = a.nome.trim();
  } else {
    marca.day = a.tipo;
    if (S.deload) marca.dl = 1;
  }
  if (a.dur) marca.dur = a.dur*60000;

  S.done.push(marca);
  S.done.sort(function (x,y) { return x.t - y.t; });
  view.add = null;
  await save();

  if (detalhar && a.tipo !== 'livre') {
    // Só pode existir uma sessão aberta. Fechar a de hoje antes grava a
    // duração dela; sem isso ela ficaria órfã, com o tempo perdido.
    let fechou = null;
    if (S.sessao) { fechou = S.sessao.day; fechaSessao('manual'); }
    S.sessao = { day: a.tipo, inicio: quando, ultima: quando, sid: sid, retro: 1, tocado: Date.now(), pausas: [], pulados: [] };
    S.draft = null;
    view.tab = 'treino'; view.day = a.tipo; view.open = 0;
    await save();
    render(); window.scrollTo(0,0);
    toast(fechou
      ? 'Treino ' + fechou + ' de hoje encerrado. Agora preenchendo ' + fmtDate(a.t) + '.'
      : 'Preenchendo o treino de ' + fmtDate(a.t) + '. Some sozinho quando você sair.');
    return;
  }
  view.tab = 'acomp';
  render(); window.scrollTo(0,0);
  toast(a.tipo === 'livre' ? 'Treino avulso registrado.' : 'Treino ' + a.tipo + ' registrado em ' + fmtDate(a.t) + '.');
}



function pesoRitmo() { return _pesoRitmo(S.body.peso); }

function cinturaMes() { return _cinturaMes(S.body.cintura); }

function veredito() { return _veredito(S.body); }

function bodySVG(W) {
  if (!W.length) return '';
  const n = W.length;
  const x0 = 46, x1 = 292, aT = 24, aB = 88, dy = 108;
  const hi = Math.max.apply(null, W.map(x=>x.v)), lo = Math.min.apply(null, W.map(x=>x.v));
  const px = i => n === 1 ? (x0+x1)/2 : x0 + (x1-x0) * i/(n-1);
  const py = v => hi === lo ? (aT+aB)/2 : aB - (v-lo)/(hi-lo) * (aB-aT);
  const anchor = i => i === 0 && n > 1 ? 'start' : (i === n-1 && n > 1 ? 'end' : 'middle');

  let g = `<svg viewBox="0 0 320 116" class="chart" role="img" aria-label="média semanal de peso nas últimas ${n} semanas">`;
  g += `<line x1="${x0}" y1="${aT}" x2="${x1}" y2="${aT}" class="gl"/>`
     + `<line x1="${x0}" y1="${aB}" x2="${x1}" y2="${aB}" class="gl"/>`
     + `<text x="${x0-8}" y="${py(hi)+3}" class="ax" text-anchor="end">${fmtDec(hi)}</text>`
     + (hi === lo ? '' : `<text x="${x0-8}" y="${aB+3}" class="ax" text-anchor="end">${fmtDec(lo)}</text>`)
     + `<text x="${x0-8}" y="${aT-9}" class="axu" text-anchor="end">kg</text>`;
  if (n > 1) g += `<polyline class="cl" points="${W.map((x,i)=> px(i)+','+py(x.v)).join(' ')}"/>`;
  W.forEach((x,i) => {
    const last = i === n-1;
    g += `<circle cx="${px(i)}" cy="${py(x.v)}" r="${last?4.5:3.5}" class="cp${last?' last':''}"/>`
       + `<text x="${px(i)}" y="${py(x.v)-11}" class="vl${last?' last':''}" text-anchor="${anchor(i)}">${fmtDec(x.v)}</text>`
       + `<text x="${px(i)}" y="${dy}" class="ax" text-anchor="${anchor(i)}">${fmtDate(x.w)}</text>`;
  });
  return g + '</svg>';
}

// Adaptador: a regra vive em dominio/volume.ts; aqui só entram os dados.
function seriesPorMusculo(de, ate, corte) {
  return _seriesPorMusculo(S.logs, function (k) { return exDe(k).g; }, de, ate, corte);
}

function painelMusculos() {
  const semana = weekStart(Date.now());
  const atual = seriesPorMusculo(semana, Date.now() + 1);
  const janela = 4;
  const decorrido = Date.now() - semana;
  const antes = seriesPorMusculo(semana - janela*7*86400000, semana, decorrido);
  const diaDaSemana = Math.min(7, Math.floor(decorrido/86400000) + 1);

  const avulsos = S.done.filter(function (x) { return x.livre && x.t >= semana; });
  const avulsosGrupos = Object.keys(avulsos.reduce(function (a,x) {
    (x.grupos||[]).forEach(function (g) { a[g] = 1; }); return a;
  }, {}));

  const nomes = {};
  rot().forEach(d => treino(d).ex.forEach(ex => { if (ex.g) nomes[ex.g] = 1; }));
  // um músculo que saiu do programa mas foi treinado na semana ainda aparece
  Object.keys(atual).forEach(function (g) { if (g) nomes[g] = 1; });
  const lista = Object.keys(nomes).sort(function (a,b) {
    const na = NIVEIS.indexOf(nivelDe(a)), nb = NIVEIS.indexOf(nivelDe(b));
    if (na !== nb) return na - nb;
    const pa = PRIO.indexOf(a), pb = PRIO.indexOf(b);
    if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    return a.localeCompare(b, 'pt-BR');
  });

  const temHistorico = Object.keys(antes).length > 0;
  const max = Math.max(1, Math.max.apply(null, lista.map(g => Math.max(atual[g]||0, (antes[g]||0)/janela))));

  // O que ele PRESCREVEU para si contra o que o treinador prescreveu. É
  // diferente do que ele registrou: aqui o assunto é o programa, não a semana.
  const fora = lista.map(function (g) { return impactoOficial(g); })
                    .filter(function (x) { return x; });

  return `<div class="dgroup">
    ${fora.length ? `<div class="progdif" style="margin-bottom:16px">
      <b>Seu programa está diferente do que o treinador prescreveu</b>
      ${fora.map(function (x) { return `<span>${x.txt}</span>`; }).join('')}
      <button class="dlbtn" onclick="abrirPrograma(null)">abrir o programa</button>
    </div>` : ''}
    <h3>Séries por músculo nesta semana</h3>
    <p>Séries registradas desde segunda-feira, comparadas com o <b>mesmo ponto</b> das últimas ${janela} semanas — dia ${diaDaSemana} de 7. A ordem segue a hierarquia do programa.</p>
    <p style="color:var(--dim)"><b>São séries diretas.</b> Tríceps também trabalha nos supinos, bíceps nas puxadas, glúteo no terra e no leg press, e deltoide anterior no peito. O estímulo real desses é maior que o número aqui.</p>
    ${temHistorico ? '' : '<p style="color:var(--dim)">Ainda sem semanas anteriores para comparar. A coluna de média aparece a partir da segunda semana de registro.</p>'}
    ${avulsos.length ? `<p style="color:var(--dim)">${avulsos.length} ${avulsos.length===1?'treino avulso nesta semana não entra':'treinos avulsos nesta semana não entram'} nesta contagem, porque não ${avulsos.length===1?'tem':'têm'} série registrada: ${avulsosGrupos.join(', ')}.</p>` : ''}
    <div class="mus">
      ${lista.map(function (g) {
        const n = atual[g] || 0;
        const m = temHistorico ? (antes[g]||0)/janela : null;
        const nivel = nivelDe(g);
        const prio = nivel === 'maxima';
        const dif = m !== null && m >= 1 ? Math.round((n-m)/m*100) : null;
        return `<div class="musrow ${prio?'prio':''}">
          <span class="musn">${g}${PRIORIDADES[nivel].rot?`<i class="n-${nivel}">${PRIORIDADES[nivel].rot}</i>`:''}</span>
          <span class="musbar"><em style="width:${Math.min(100, n/max*100)}%"></em></span>
          <span class="musv">${n}${m!==null?`<small>méd ${fmtDec(m)}</small>`:''}</span>
          ${dif===null?'':`<span class="musd ${dif>0?'up':(dif<-25?'down':'')}">${dif>0?'+':''}${dif}%</span>`}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderBody() {
  const v = veredito();
  const r = pesoRitmo();
  const W = r.W.slice(-8);
  const c = cinturaMes();
  const semana = weekStart(Date.now());
  const pesagens = S.body.peso.filter(x => x.t >= semana);
  const cinturaSem = S.body.cintura.filter(x => x.t >= semana);
  const cW = mediasSemanais(S.body.cintura);
  const cAtual = cW.length ? cW[cW.length-1] : null;
  const atual = W.length ? W[W.length-1] : null;
  const f = view.bodyForm || {};

  return `<div class="data">
    <div class="verdict ${v.k}">
      <div class="verdict-k">o que fazer com a comida</div>
      <div class="verdict-t">${v.t}</div>
      <p>${v.p}</p>
    </div>

    <div class="dgroup">
      <h3>Peso</h3>
      <p>A média da semana é o número que conta. O peso de um dia isolado oscila com água, sal e intestino, e não serve para decidir nada.</p>
      <div class="week">
        <div class="week-n">${atual?fmtDec(atual.v):'–'} <em>kg</em></div>
        <div class="week-s">média desta semana<br><b>${atual?`${atual.n} ${atual.n===1?'pesagem':'pesagens'} · ritmo ${r.ok?fmtSig2(r.kgSem)+' kg/semana':'ainda sem ritmo'}`:'sem pesagem nesta semana'}</b></div>
      </div>
      ${W.length>1?bodySVG(W)+'<div class="legend"><span class="c"><i></i>média por semana, não o peso do dia</span></div>':''}
      <div class="obs-h" style="margin-top:18px">registrar peso de hoje · ${pesagens.length} de 4 nesta semana</div>
      <div class="addrow">
        <div class="f"><input type="text" inputmode="decimal" id="bpeso"
          value="${f.peso!=null?f.peso:''}" placeholder="${S.body.peso.length?fmtDec(S.body.peso[S.body.peso.length-1].v):'73,0'}"
          oninput="bodyIn('peso',this)"><span class="unit">kg</span></div>
        <button class="dbtn" onclick="addBody('peso')">Registrar</button>
      </div>
      ${pesagens.length?`<div class="blist">${pesagens.slice().sort((a,b)=>b.t-a.t).map(x=>`<div class="crow">
        <span class="crow-d">${fmtDate(x.t)}</span><span class="crow-m">${fmtDec(x.v)} kg</span>
        <button class="crow-x" onclick="delBody('peso',${x.t})">remover</button></div>`).join('')}</div>`:''}
    </div>

    <div class="dgroup">
      <h3>Cintura</h3>
      <p>Uma medida por semana, sempre no mesmo ponto e no mesmo horário. É o que separa ganho de massa de ganho de gordura quando a balança sobe.</p>
      <div class="week">
        <div class="week-n">${cAtual?fmtDec(cAtual.v):'–'} <em>cm</em></div>
        <div class="week-s ${c&&c.mes>1.5?'over':''}">média desta semana<br><b>${c?`${fmtSig(c.delta)} cm em ${Math.round(c.dias)} dias`:'sem comparação de um mês ainda'}</b></div>
      </div>
      <div class="obs-h" style="margin-top:18px">registrar cintura · ${cinturaSem.length} de 1 nesta semana</div>
      <div class="addrow">
        <div class="f"><input type="text" inputmode="decimal" id="bcint"
          value="${f.cintura!=null?f.cintura:''}" placeholder="${S.body.cintura.length?fmtDec(S.body.cintura[S.body.cintura.length-1].v):'80,0'}"
          oninput="bodyIn('cintura',this)"><span class="unit">cm</span></div>
        <button class="dbtn" onclick="addBody('cintura')">Registrar</button>
      </div>
      ${S.body.cintura.length?`<div class="blist">${S.body.cintura.slice(-6).sort((a,b)=>b.t-a.t).map(x=>`<div class="crow">
        <span class="crow-d">${fmtDate(x.t)}</span><span class="crow-m">${fmtDec(x.v)} cm</span>
        <button class="crow-x" onclick="delBody('cintura',${x.t})">remover</button></div>`).join('')}</div>`:''}
    </div>

    ${renderCardio()}

    ${painelMusculos()}

    <div class="dgroup">
      <h3>As regras que estão sendo aplicadas</h3>
      <p style="margin:0">Média subindo <b>menos de 0,15 kg por semana</b> por 2 semanas: comer mais.<br>
      Média subindo <b>mais de 0,4 kg por semana</b> por 2 semanas: comer menos.<br>
      Cintura <b>+1,5 cm no mês</b>: comer menos, mesmo que o peso esteja na faixa.</p>
    </div>
  </div>`;
}

function bodyIn(k, el) {
  view.bodyForm = Object.assign({}, view.bodyForm);
  view.bodyForm[k] = limpaNum(el, true);
}
async function addBody(k) {
  const el = document.getElementById(k === 'peso' ? 'bpeso' : 'bcint');
  const raw = ((view.bodyForm && view.bodyForm[k]) || (el && el.value) || '').replace(',', '.');
  const v = parseFloat(raw);
  if (isNaN(v) || v <= 0) { toast('Digite um número válido.'); return; }

  const arr = S.body[k];
  const hoje = arr.filter(x => sameDay(x.t, Date.now()));
  hoje.forEach(x => arr.splice(arr.indexOf(x), 1));   // uma medida por dia
  arr.push({ t: Date.now(), v });
  arr.sort((a,b) => a.t - b.t);
  if (arr.length > 400) S.body[k] = arr.slice(-400);

  view.bodyForm = Object.assign({}, view.bodyForm);
  view.bodyForm[k] = '';
  await save();
  render();
  toast(hoje.length
    ? `${k === 'peso' ? 'Peso' : 'Cintura'} de hoje atualizado para ${fmtDec(v)} ${k==='peso'?'kg':'cm'}.`
    : `${fmtDec(v)} ${k==='peso'?'kg':'cm'} registrado.`);
}
async function delBody(k, t) {
  S.body[k] = S.body[k].filter(x => x.t !== t);
  await save(); render();
  toast('Medida removida.');
}

// ---------- aba de dados ----------
function renderData() {
  const nEx = Object.keys(S.logs).length;
  const sb = diasSemBackup();
  return `<div class="data">
    ${sb >= 30 && S.done.length ? `<div class="deload" style="margin:14px 0 0">
      <b>${S.export ? Math.round(sb) + ' dias desde o último backup.' : 'Você nunca exportou o histórico.'}</b>
      Baixe o JSON agora. É a única cópia que não depende deste navegador.</div>` : ''}
    <div class="dgroup">
      <h3>Programa</h3>
      <p>Os ${rot().length} treinos, a ordem da rotação e os exercícios. Mudança aqui vale a partir do próximo treino;
      para mudar só o treino de hoje, use a edição na tela de hoje.</p>
      <button class="dbtn ghost" onclick="abrirPrograma(null)">abrir o programa${difTotal()?' · ' + difTotal() + ' ' + (difTotal()===1?'diferença':'diferenças') + ' do treinador':''}</button>
    </div>
    <div class="dgroup">
      <h3>Exportar</h3>
      <p>Baixa todo o histórico em um arquivo JSON. Guarde antes de trocar de celular, limpar o navegador ou mexer no app.</p>
      <button class="dbtn" onclick="exportData()">Baixar arquivo JSON</button>
      <button class="dbtn ghost" onclick="showJSON()">${view.json?'esconder o texto':'mostrar o JSON para copiar'}</button>
      ${view.json?`<textarea class="jtext" id="jout" readonly onclick="this.select()">${escapeHTML(view.json)}</textarea>
      <button class="dbtn ghost" onclick="copyJSON()">copiar para a área de transferência</button>`:''}
    </div>

    <div class="dgroup">
      <h3>Importar</h3>
      <p>Restaura um backup. Substitui o que estiver salvo agora, com confirmação antes.</p>
      <label class="dbtn">Escolher arquivo JSON<input type="file" accept="application/json,.json,.txt" onchange="importFile(this)"></label>
      <button class="dbtn ghost" onclick="pasteJSON()">colar o texto do backup</button>
      ${view.paste?`<textarea class="jtext" id="jin" placeholder="cole aqui o conteúdo do arquivo"></textarea>
      <button class="dbtn" onclick="importText(document.getElementById('jin').value)">Importar do texto</button>`:''}
    </div>

    <div class="dgroup">
      <h3>Retrospectiva do bloco</h3>
      <p>O que evoluiu, o que ficou parado e onde a dor apareceu desde o começo deste bloco de 48 sessões.</p>
      <button class="dbtn" onclick="abrirRetro()">Abrir retrospectiva</button>
    </div>

    <div class="dgroup">
      <h3>Modo deload</h3>
      <p>Mostra metade das séries de cada exercício mantendo as mesmas cargas. As sessões salvas nesse modo ficam marcadas no histórico, para a queda de volume não parecer regressão.</p>
      <button class="dbtn" onclick="setDeload(${S.deload?'false':'true'})">${S.deload?'Desativar o modo deload':'Ativar o modo deload'}</button>
    </div>

    <div class="dgroup">
      <h3>Onde ficam seus dados</h3>
      <p class="store" style="margin:0">Salvos em: <b>${STORE_LABEL[DB.mode] || 'verificando'}</b>.<br>
      ${S.done.length} ${S.done.length===1?'sessão registrada':'sessões registradas'} · ${nEx} ${nEx===1?'exercício com histórico':'exercícios com histórico'} · ${S.cardio.length} ${S.cardio.length===1?'sessão de cardio':'sessões de cardio'} · ${S.body.peso.length} ${S.body.peso.length===1?'pesagem':'pesagens'} · ${S.body.cintura.length} ${S.body.cintura.length===1?'medida de cintura':'medidas de cintura'}.</p>
      <button class="danger" onclick="wipe()">apagar todo o histórico</button>
    </div>
  </div>`;
}


function payload() {
  return JSON.stringify({ app:'treino-eduardo', v:1, exportedAt:new Date().toISOString(), data:S }, null, 2);
}

function exportData() {
  const txt = payload();
  const name = 'treino-eduardo-' + new Date().toISOString().slice(0,10) + '.json';
  try {
    const url = URL.createObjectURL(new Blob([txt], {type:'application/json'}));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
    S.export = Date.now(); save();
    toast('Arquivo ' + name + ' gerado.');
  } catch (e) {
    view.json = txt; render();
    toast('O download não funciona aqui. Copie o texto abaixo.');
  }
}

function showJSON() {
  // abrir o JSON já conta como backup: quem copia o texto na mão nunca
  // passaria pelo caminho do clipboard, e o lembrete ficaria pedindo para sempre
  if (!view.json) { S.export = Date.now(); save(); }
  view.json = view.json ? null : payload();
  render();
}
function pasteJSON(){ view.paste = !view.paste; render(); }

function copyJSON() {
  const txt = view.json || payload();
  const done = () => { S.export = Date.now(); save(); toast('JSON copiado.'); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done, () => legacyCopy(txt, done));
  } else legacyCopy(txt, done);
}
function legacyCopy(txt, done) {
  const el = document.getElementById('jout');
  if (el) { el.focus(); el.select(); }
  try { document.execCommand('copy'); done(); }
  catch (e) { toast('Não consegui copiar. Selecione o texto manualmente.'); }
}

function importFile(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { importText(String(rd.result)); input.value = ''; };
  rd.onerror = () => { toast('Não consegui ler o arquivo.'); input.value = ''; };
  rd.readAsText(f);
}

async function importText(txt) {
  if (!txt || !txt.trim()) { toast('Nada para importar.'); return; }
  let o;
  try { o = JSON.parse(txt); }
  catch (e) { toast('JSON inválido. Confira se copiou o arquivo inteiro.'); return; }

  const d = o && o.data ? o.data : o;
  const valido = d && typeof d === 'object'
    && d.logs && typeof d.logs === 'object'
    && Array.isArray(d.done);
  if (!valido) { toast('Isso não parece um backup deste app.'); return; }

  const nS = d.done.length, nE = Object.keys(d.logs).length;
  if (!confirm(`Importar ${nS} sessões e ${nE} exercícios?\n\nIsso substitui o histórico atual (${S.done.length} sessões). Exporte antes se tiver dúvida.`)) return;

  S = { logs: d.logs, done: d.done, deload: !!d.deload, draft: d.draft || null,
        cardio: Array.isArray(d.cardio) ? d.cardio : [],
        body: { peso: (d.body && Array.isArray(d.body.peso)) ? d.body.peso : [],
                cintura: (d.body && Array.isArray(d.body.cintura)) ? d.body.cintura : [] },
        sessao: d.sessao || null,
        carga: (d.carga && typeof d.carga === 'object') ? d.carga : {},
        export: typeof d.export === 'number' ? d.export : 0,
        plano: typeof d.plano === 'number' ? d.plano : 1,
        prog: d.prog || null, rot: d.rot || null,
        ex: (d.ex && typeof d.ex === 'object') ? d.ex : {},
        mods: d.mods || null, progLog: Array.isArray(d.progLog) ? d.progLog : [],
        // A metade de comida entra pelo mesmo caminho. Whitelist e não spread
        // de propósito: um backup adulterado não pode injetar campo que o app
        // não conhece. O preço é este — campo novo tem que ser listado aqui,
        // e um teste cobra que a lista bata com o que é exportado.
        cadencia: Array.isArray(d.cadencia) && d.cadencia.length === 7 ? d.cadencia : null,
        comida: (d.comida && typeof d.comida === 'object') ? d.comida : null,
        dia: (d.dia && typeof d.dia === 'object') ? d.dia : null,
        ajuste: (d.ajuste === -1 || d.ajuste === 1) ? d.ajuste : 0,
        perfManual: (d.perfManual === true || d.perfManual === false) ? d.perfManual : null,
        compras: (d.compras && typeof d.compras === 'object') ? d.compras : null };
  // um backup de qualquer versão anterior passa pelas mesmas migrações que o
  // estado do disco: sem isso o app abre com o programa nulo
  normalizaEstado();
  migraPlano(S);
  migraPlano3(S);
  migraPlano4(S);
  montaCatalogo();
  await save();
  view.day = nextDay(); view.open = null; view.hist = null; view.json = null; view.paste = false;
  render();
  toast('Histórico importado: ' + nS + ' sessões.');
}

let toastT = null;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 3600);
}

// ---------- actions ----------
function go(d){ view.day=d; view.open=null; view.hist=null; view.nota=null; render(); window.scrollTo(0,0); }
function tab(t){ view.tab=t; view.prog=null; view.hist=null; view.json=null; view.paste=false; view.retro=false; view.sessao=null; view.add=null; view.mes=0; view.cardioRapido=false; render(); window.scrollTo(0,0); }
function toggle(i){ view.open = view.open===i ? null : i; view.swapOpen = null; view.nota = null; view.carga = null; render(); }
function dorName(k){ const x = DORES.filter(y=>y.k===k)[0]; return x ? x.t : k; }

// Grava no rascunho a cada tecla, sem re-render: o campo não perde o foco
// e nada se perde ao abrir outro exercício ou fechar o app no meio do treino.
// type="number" recusa vírgula: no teclado pt-BR "73,4" chegava aqui como string
// vazia. Os campos são type="text" e a limpeza é feita na mão.
function limpaNum(el, dec) {
  const antes = el.value;
  const depois = antes.replace(dec ? /[^0-9.,]/g : /[^0-9]/g, '');
  if (depois !== antes) el.value = depois;
  return depois.replace(',', '.');
}

function inp(el, i, k, pos) {
  const e = draftOf(i);
  if (!e.s[k]) e.s[k] = [null,null];
  const raw = limpaNum(el, pos === 0);
  const num = pos === 0 ? parseFloat(raw) : parseInt(raw,10);
  e.s[k][pos] = (raw === '' || isNaN(num)) ? null : num;
  el.classList.toggle('done', el.value !== '');
  segurarTela();
  projeta(i);
  atualizaEstado();
  atualizaAnilhas(i);
  queueSave();
  autoTimer(i, k, e);
}

// cronômetro começa sozinho quando a última série do exercício fica completa
function autoTimer(i, k, e) {
  const ex = treino(view.day).ex[i];
  const ult = setsFor(ex) - 1;
  const tag = view.day + i;
  const cheia = k === ult && e.s[ult] && e.s[ult][0] != null && e.s[ult][1] != null;
  if (k !== ult) return;
  if (cheia && !view.fired[tag]) {
    view.fired[tag] = true;
    // primeiro do bi-set não descansa: encadeia direto no segundo
    if (ex.bi === 1) proximoDoBiset(i);
    else startTimer(descOf(ex));
  } else if (!cheia) view.fired[tag] = false;
}

function proximoDoBiset(i) {
  const prox = treino(view.day).ex[i+1];
  if (!prox) return;
  view.open = i+1; view.swapOpen = null;
  render();
  toast('Sem pausa: vá direto para ' + prox.n.replace(' (bi-set)','') + '.');
}

function obsIn(el, i) { draftOf(i).obs = el.value; projeta(i); queueSave(); }
function toggleAq(i) { const e = draftOf(i); e.aq = !e.aq; projeta(i); queueSave(); render(); }
// A anotação e os marcadores de dor ficam atrás de um link: na maioria das
// sessões não há nada a registrar, e ocupavam espaço em todo exercício aberto.
// Uma vez que exista conteúdo no rascunho, o bloco reabre sozinho.
function abrirNota(i) { view.nota = i; render(); }
function abrirCarga(i) { view.carga = view.carga === i ? null : i; render(); }
async function setCarga(i, t) {
  const key = logKey(view.day, i);
  const ex = treino(view.day).ex[i];
  if ((ex.car || 'pino') === t) delete S.carga[key]; else S.carga[key] = t;
  view.carga = null;
  await save(); render();
  toast('Carga deste exercício: ' + CARGAS[t].nome + '.');
}
function toggleDor(i, k) {
  const e = draftOf(i);
  const j = e.dor.indexOf(k);
  if (j >= 0) e.dor.splice(j,1); else e.dor.push(k);
  projeta(i); queueSave(); render();
}
function toggleSwap(i){ view.swapOpen = view.swapOpen===i ? null : i; render(); }
function abrirSubstituicao(i){ view.open = i; view.swapOpen = i; render(); }
function setAlt(i, idEx) {
  const d = view.day;
  // a chave de histórico muda junto: tira a projeção da chave antiga primeiro
  const slot = slotDe(d, i);
  removeProjecao(logKey(d, i), slot);
  if (!idEx || idEx === slot) tiraMod(d, 'troca', slot);
  else poeMod(d, { k:'troca', slot: slot, por: idEx });
  projeta(i);
  view.swapOpen = null;
  queueSave(); render();
  toast(idEx && idEx !== slot
    ? 'Trocado por ' + nomeEx(idEx) + ' só para hoje. No fim do treino você decide se fica.'
    : 'De volta ao exercício original.');
}
async function setDeload(on) {
  S.deload = !!on;
  await save();
  view.open = null; render();
  toast(on ? 'Deload ativo: metade das séries, mesmas cargas.' : 'Deload desligado. Séries completas de volta.');
}

// ---------- detalhe de uma sessão ----------
// Não existe mais resumo pós-treino: a sessão nunca é "enviada". Este é o
// detalhe de um dia, aberto a partir do acompanhamento.
// Agora que a chave é o exercício, o detalhe de uma sessão não precisa mais
// varrer o programa posição por posição: basta pegar tudo que foi registrado
// naquela sessão. Isso cobre de graça os substitutos, os exercícios que
// saíram do programa e os que vieram do plano antigo.
function itensDaSessao(marca) {
  const doDia = {};
  const t = marca.day ? treino(marca.day) : null;
  if (t) t.ex.forEach(function (ex) { doDia[ex.id] = 1; });

  const out = [];
  Object.keys(S.logs).forEach(function (k) {
    (S.logs[k] || []).forEach(function (e) {
      const bate = marca.sid != null
        ? e.sid === marca.sid
        // registro antigo, sem sid: só entra se for do dia e do treino certos
        : (sameDay(e.t, marca.t) && e.sid == null && (doDia[k] || doDia[e.sl]));
      if (!bate) return;
      const ex = exDe(k);
      const seg = e.u === 'seg';
      const met = seg ? tutOf : volOf;
      const antes = S.logs[k].filter(function (x) { return x.t < e.t; });
      out.push({
        t: e.t, nome: ex.n,
        seg: seg, sets: e.sets, met: met(e), dor: e.dor || [],
        novo: !antes.length,
        delta: antes.length && met(antes[antes.length-1]) > 0
          ? Math.round((met(e) - met(antes[antes.length-1])) / met(antes[antes.length-1]) * 100) : null,
        recCarga: !seg && antes.length > 0 && maxLoad(e) > Math.max.apply(null, antes.map(maxLoad)),
        recMet: antes.length > 0 && met(e) > Math.max.apply(null, antes.map(met)),
        // exercício que não está mais neste treino: substituto de hoje, ou
        // sobra de um programa anterior
        fora: t && !doDia[k] ? 1 : 0
      });
    });
  });
  out.sort(function (a, b) { return a.t - b.t; });
  return out;
}

function resumoDaSessao(marca) {
  const itens = itensDaSessao(marca);
  let vol = 0, tempo = 0;
  const dores = [];
  itens.forEach(function (x) {
    if (x.seg) tempo += x.met; else vol += x.met;
    if (x.dor.length) dores.push(x.nome);
  });
  const series = itens.reduce(function (a,x) { return a + x.sets.filter(Boolean).length; }, 0);
  return { itens: itens, vol: vol, tempo: tempo, dores: dores, series: series };
}

function renderSessao() {
  const marca = view.sessao;
  if (marca.livre) return renderSessaoLivre(marca);
  const R = resumoDaSessao(marca);
  const aberta = S.sessao && S.sessao.sid === marca.sid;
  const dur = aberta ? (S.sessao.ultima - S.sessao.inicio) : marca.dur;
  const recordes = R.itens.filter(function (x) { return x.recCarga || x.recMet; }).length;
  const app = document.getElementById('app');

  const exato = marca.fim === 'manual';
  const p = pendencias(marca.day, marca.sid, marca.pulados);

  let h = `<div class="hhdr">
    <button class="back" onclick="fecharSessao()">‹ voltar</button>
    <div class="eyebrow"><span>treino ${marca.day}${aberta?' · em andamento':''}</span><span>${diaExtenso(marca.t)}</span></div>
    <h2 class="htitle">${R.series} ${R.series===1?'série registrada':'séries registradas'}</h2>
  </div>
  <div class="hwrap">
    <div class="stats">
      <div><b>${dur!=null?fmtDur(dur):'–'}</b><span>${aberta?'em andamento':(dur==null?'tempo não medido':(exato?'tempo exato':'tempo aproximado'))}</span></div>
      <div><b>${R.vol?fmtInt(R.vol):'–'}</b><span>volume · kg×reps</span></div>
      <div><b class="${recordes?'up':''}">${recordes}</b><span>${recordes===1?'recorde':'recordes'}</span></div>
    </div>`;

  const hIni = horaDaSessao(marca), hFim = aberta ? null : fimDaSessao(marca);
  if (hIni) h += `<p class="horario">${hFim ? 'das <b>'+hIni+'</b> às <b>'+hFim+'</b>' : 'começou às <b>'+hIni+'</b>'}</p>`;

  const notas = [];
  if (!aberta && dur != null && !exato)
    notas.push('Você não encerrou este treino; o app fechou sozinho e o tempo vai até a última série registrada.');
  if (marca.pausado) notas.push(fmtDur(marca.pausado) + ' de pausa, fora da conta.');
  if (marca.ini === 'manual') notas.push('Início marcado por você, antes do aquecimento.');
  if (notas.length) h += `<p class="cue" style="margin:16px 0 0">${notas.join(' ')}</p>`;

  // o que foi mudado naquele dia, tenha virado permanente ou não
  if (Array.isArray(marca.mods) && marca.mods.length) {
    h += `<div class="pend">
      <div><b>${marca.mods.length===1?'1 mudança no dia':marca.mods.length + ' mudanças no dia'}</b>
      <span>${marca.mods.join(' · ')}</span></div>
    </div>`;
  }

  if (p.pulado.length || p.parcial.length || p.nada.length) {
    h += `<div class="pend">
      ${p.pulado.length?`<div><b>${p.pulado.length} ${p.pulado.length===1?'pulado':'pulados'}</b><span>${p.pulado.map(function(x){return x.nome;}).join(', ')}</span></div>`:''}
      ${p.parcial.length?`<div><b>${p.parcial.length} ${p.parcial.length===1?'parcial':'parciais'}</b><span>${p.parcial.map(function(x){return x.nome;}).join(', ')}</span></div>`:''}
      ${p.nada.length?`<div><b>${p.nada.length} não ${p.nada.length===1?'feito':'feitos'}</b><span>${p.nada.map(function(x){return x.nome;}).join(', ')}</span></div>`:''}
    </div>`;
  }

  const card = cardioDoDia(marca.t);
  if (card.length) {
    h += `<div class="cardio-dia">
      <b>cardio no mesmo dia</b>
      <span>${card.map(function (c) { return c.min + ' min de ' + c.m + ' · ' + c.i; }).join('<br>')}</span>
    </div>`;
  }

  if (R.tempo) h += `<p class="cue" style="margin:16px 0 0">Mais ${fmtInt(R.tempo)} segundos de prancha, contados à parte do volume.</p>`;
  if (R.dores.length)
    h += `<div class="painsum" style="margin-top:18px"><b>Dor marcada em ${R.dores.join(', ')}.</b>
      Se repetir na próxima sessão, o app sugere a troca de ângulo.</div>`;

  h += `<div class="hsec">exercício a exercício</div>` + (R.itens.length ? R.itens.map(function (x) {
    return `<div class="hs">
      <div class="hs-top">
        <span class="hs-vol" style="min-width:0">${x.nome}</span>
        ${x.delta===null?'':`<span class="hs-d ${x.delta>0?'up':''}">${x.delta>0?'+':''}${x.delta}%</span>`}
      </div>
      <div class="hs-sets" style="padding-left:0">
        ${x.sets.map(function (y) { return y ? `<span>${x.seg?(y[0]?fmtNum(y[0])+'kg × '+y[1]+'s':y[1]+'s'):fmtNum(y[0])+'×'+y[1]}</span>` : '<span class="nul">–</span>'; }).join('')}
        <span class="nul">${fmtInt(x.met)} ${x.seg?'seg':'vol'}</span>
        ${x.recCarga?'<span class="rec">recorde de carga</span>':''}
        ${!x.recCarga&&x.recMet?`<span class="rec">recorde de ${x.seg?'tempo':'volume'}</span>`:''}
        ${x.novo?'<span class="nul">primeira vez</span>':''}
        ${x.fora?'<span class="nul">fora do treino</span>':''}
      </div>
      ${x.dor.length?`<div class="pain" style="padding-left:0">dor em ${x.dor.map(dorName).join(' e ')}</div>`:''}
    </div>`;
  }).join('') : '<p class="cue" style="margin:0">Nenhuma série registrada neste dia.</p>');

  h += '</div>';
  montaHTML(h);
}
function renderSessaoLivre(m) {
  const app = document.getElementById('app');
  montaHTML(`<div class="hhdr">
    <button class="back" onclick="fecharSessao()">‹ voltar</button>
    <div class="eyebrow"><span>treino avulso</span><span>${diaExtenso(m.t)}</span></div>
    <h2 class="htitle">${m.nome ? escapeHTML(m.nome) : (m.grupos||[]).join(', ')}</h2>
  </div>
  <div class="hwrap">
    <div class="stats">
      <div><b>${m.dur?fmtDur(m.dur):'–'}</b><span>tempo de treino</span></div>
      <div><b>${(m.grupos||[]).length}</b><span>${(m.grupos||[]).length===1?'grupo muscular':'grupos musculares'}</span></div>
    </div>
    ${(m.grupos||[]).length?`<div class="chips" style="margin-top:18px">${m.grupos.map(function (g) {
      return '<span class="chip sel" style="cursor:default">'+g+'</span>';
    }).join('')}</div>`:''}
    <p class="cue" style="margin:20px 0 0">Fora do plano. Conta como dia treinado no calendário e na média semanal, mas não tem carga nem série registrada e não move a rotação.</p>
    <button class="danger" style="width:100%;margin-top:22px" onclick="apagarMarca(${m.t})">apagar este registro</button>
  </div>`);
}

async function apagarMarca(t) {
  if (!confirm('Apagar este registro de treino? Isso não tem volta.')) return;
  S.done = S.done.filter(function (x) { return x.t !== t; });
  view.sessao = null;
  await save(); render();
  toast('Registro apagado.');
}

function abrirSessao(t){ view.sessao = S.done.filter(function (x) { return x.t === t; })[0]; if (view.sessao) { render(); window.scrollTo(0,0); } }
function fecharSessao(){ view.sessao = null; render(); window.scrollTo(0,0); }

// ---------- retrospectiva de bloco ----------
// 48 sessões de trabalho é o ciclo do programa. Até aqui, completá-lo não
// produzia nada: o contador zerava e o app seguia como se nada tivesse fechado.
function inicioDoBloco() {
  const trab = S.done.filter(function (x) { return !x.dl; });
  if (!trab.length) return 0;
  const n = trab.length % 48 === 0 ? 48 : trab.length % 48;
  return trab[trab.length - n].t;
}

function retro() {
  const de = inicioDoBloco();
  const ate = Date.now();
  const evol = [], parados = [], dores = {};
  let sessoes = 0, volTotal = 0;

  rot().forEach(function (d) {
    treino(d).ex.forEach(function (ex, i) {
      const base = id(d,i);
      Object.keys(S.logs).forEach(function (k) {
        if (k !== base && k.indexOf(base + '~') !== 0) return;
        const H = S.logs[k].filter(function (e) { return e.t >= de && e.t <= ate; });
        if (!H.length) return;
        const nome = k === base ? ex.n : k.slice(base.length+1);
        const seg = isTime(ex);
        const met = seg ? tutOf : volOf;
        H.forEach(function (e) {
          if (!seg) volTotal += volOf(e);
          (e.dor||[]).forEach(function (x) { dores[x] = (dores[x]||0) + 1; });
        });
        if (H.length < 2) return;
        const a = H[0], b = H[H.length-1];
        const ci = seg ? tutOf(a) : maxLoad(a), cf = seg ? tutOf(b) : maxLoad(b);
        const dv = met(a) > 0 ? Math.round((met(b)-met(a))/met(a)*100) : null;
        const item = { nome:nome, n:H.length, ci:ci, cf:cf, dv:dv, seg:seg,
                       dc: ci > 0 ? Math.round((cf-ci)/ci*100) : null };
        if (cf > ci) evol.push(item);
        else if (cf === ci && H.length >= 3) parados.push(item);
      });
    });
  });

  sessoes = S.done.filter(function (x) { return x.t >= de; }).length;
  const semanas = Math.max(1, (ate - de) / (7*86400000));
  evol.sort(function (a,b) { return (b.dc||0) - (a.dc||0); });

  return { de:de, ate:ate, sessoes:sessoes, semanas:semanas, volTotal:volTotal,
           evol:evol, parados:parados, dores:dores,
           deloads: S.done.filter(function (x) { return x.dl && x.t >= de; }).length };
}

function renderRetro() {
  const R = retro();
  const app = document.getElementById('app');
  const dores = Object.keys(R.dores);

  let h = `<div class="hhdr">
    <button class="back" onclick="fecharRetro()">‹ voltar</button>
    <div class="eyebrow"><span>retrospectiva de bloco</span><span>${fmtDate(R.de)} a ${fmtDate(R.ate)}</span></div>
    <h2 class="htitle">${R.sessoes} sessões em ${fmtDec(R.semanas)} semanas</h2>
  </div>
  <div class="hwrap">
    <div class="stats">
      <div><b>${fmtDec(R.sessoes/R.semanas)}</b><span>treinos por semana</span></div>
      <div><b>${fmtInt(R.volTotal)}</b><span>volume acumulado</span></div>
      <div><b class="${R.evol.length?'up':''}">${R.evol.length}</b><span>exercícios que subiram</span></div>
    </div>`;

  if (R.evol.length) {
    h += `<div class="hsec">o que evoluiu</div>` + R.evol.slice(0,8).map(function (x) {
      return `<div class="hs"><div class="hs-top">
        <span class="hs-vol" style="min-width:0">${x.nome}</span>
        ${x.dc===null?'':`<span class="hs-d up">+${x.dc}%</span>`}
      </div>
      <div class="hs-sets" style="padding-left:0">
        <span>${fmtNum(x.ci)}${x.seg?'s':'kg'} → ${fmtNum(x.cf)}${x.seg?'s':'kg'}</span>
        <span class="nul">${x.n} sessões</span>
        ${x.dv===null?'':`<span class="nul">volume ${x.dv>0?'+':''}${x.dv}%</span>`}
      </div></div>`;
    }).join('');
  }

  if (R.parados.length) {
    h += `<div class="hsec">parados no bloco</div>
      <p class="cue" style="margin:0 0 8px">Mesma carga do começo ao fim, com 3 ou mais sessões. Não quer dizer que esteja errado — quer dizer que você olhou.</p>` +
      R.parados.map(function (x) {
        return `<div class="hs"><div class="hs-top">
          <span class="hs-vol" style="min-width:0">${x.nome}</span>
          ${x.dv===null?'':`<span class="hs-d ${x.dv>0?'up':''}">${x.dv>0?'+':''}${x.dv}%</span>`}
        </div>
        <div class="hs-sets" style="padding-left:0">
          <span>${fmtNum(x.cf)}${x.seg?'s':'kg'} o bloco inteiro</span>
          <span class="nul">${x.n} sessões</span>
        </div></div>`;
      }).join('');
  }

  if (dores.length)
    h += `<div class="painsum" style="margin-top:20px"><b>Dor marcada ${dores.map(function(k){return R.dores[k]+'x em '+dorName(k);}).join(', ')} no bloco.</b>
      Vale olhar se está concentrada em algum exercício antes de começar o próximo.</div>`;

  if (R.deloads)
    h += `<p class="cue" style="margin:18px 0 0">${R.deloads} ${R.deloads===1?'sessão foi':'sessões foram'} em modo deload e não ${R.deloads===1?'entrou':'entraram'} na conta das 48.</p>`;

  h += `<div class="finish" style="padding-left:0;padding-right:0">
      <button onclick="fecharRetro()">Fechar</button>
    </div></div>`;
  montaHTML(h);
}
function abrirRetro(){ view.retro = true; view.sessao = null; render(); window.scrollTo(0,0); }
function fecharRetro(){ view.retro = false; render(); window.scrollTo(0,0); }

async function wipe() {
  if (!confirm('Apagar todo o histórico? Isso não tem volta.')) return;
  // apagar o histórico não apaga o programa: os exercícios que ele cadastrou
  // e as mudanças que promoveu ao oficial sobrevivem
  S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[],
        body:{ peso:[], cintura:[] }, carga:{}, export:0,
        plano:PLANO_ATUAL, prog:S.prog, rot:S.rot, ex:S.ex, mods:null, progLog:S.progLog || [] };
  montaCatalogo();
  try { await DB.delete(KEY); } catch(e){}
  view.day='A'; view.tab='treino'; view.open=null; view.hist=null; view.json=null; view.paste=false;
  view.swapOpen=null; view.fired={};
  render();
  toast('Histórico apagado.');
}

// ---------- cronômetro de descanso ----------
// Guarda o INSTANTE em que o descanso acaba, não um contador que decrementa.
// O iOS suspende o JavaScript quando a tela apaga; com contador, o cronômetro
// congelava no ponto em que a tela apagou.
// Descanso do exercício. Sem 'd' declarado (dados antigos, substituto), cai na
// regra genérica: composto 3 min, isolador 90 s.
function descOf(ex) { return ex && ex.d ? ex.d : (ex && ex.c ? D_COMPOSTO : D_CURTO); }


function startTimer(sec) {
  stopTimer();
  timerTotal = sec;
  timerFim = Date.now() + sec*1000;
  timerAvisado = false;
  document.getElementById('timer').classList.add('on');
  preparaAudio();          // precisa nascer dentro do gesto do usuário
  segurarTela();
  pintaTimer();
  timer = setInterval(pintaTimer, 250);
}

function pintaTimer() {
  const val = document.getElementById('tval');
  const fill = document.getElementById('tfill');
  if (!val || !fill || !timerFim) return;

  const restante = Math.max(0, timerFim - Date.now());
  fill.style.width = (restante / (timerTotal*1000) * 100) + '%';

  if (restante <= 0) {
    val.textContent = 'vai';
    val.classList.add('zero');
    if (timer) { clearInterval(timer); timer = null; }
    if (!timerAvisado) {
      timerAvisado = true;
      // só avisa se a tela estiver à vista; se zerou com o app em segundo
      // plano, tocar depois seria pior do que não tocar
      if (!document.hidden) aviso();
    }
    return;
  }
  const left = Math.ceil(restante/1000);
  val.textContent = Math.floor(left/60) + ':' + String(left%60).padStart(2,'0');
  val.classList.remove('zero');
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  timerFim = 0; timerAvisado = false;
  try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
  const box = document.getElementById('timer');
  if (box) box.classList.remove('on');
}

// ---------- aviso sonoro ----------
// O Safari nunca implementou navigator.vibrate de forma confiável, então o
// aviso real é um bipe curto por Web Audio. A vibração fica como bônus.
function preparaAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { audioCtx = null; }
}

function aviso() {
  try { if (navigator.vibrate) navigator.vibrate([420,140,420]); } catch (e) {}
  try {
    if (!audioCtx) preparaAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [0, 0.30].forEach(function (off) {
      const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t0 + off);
      g.gain.setValueAtTime(0.0001, t0 + off);
      g.gain.exponentialRampToValueAtTime(0.4, t0 + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.24);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(t0 + off); osc.stop(t0 + off + 0.26);
    });
  } catch (e) {}
}

// ---------- tela acesa durante o treino ----------
// Funciona em PWA instalado a partir do iOS 18.4. Onde não existe, falha calado.
function segurarTela() {
  querSegurar = true;
  if (!('wakeLock' in navigator) || wakeLock || document.hidden) return;
  try {
    navigator.wakeLock.request('screen').then(function (l) {
      wakeLock = l;
      l.addEventListener('release', function () { wakeLock = null; });
    }).catch(function () { wakeLock = null; });
  } catch (e) { wakeLock = null; }
}
function soltarTela() {
  querSegurar = false;
  try { if (wakeLock) wakeLock.release(); } catch (e) {}
  wakeLock = null;
}

// Voltar do bloqueio de tela: o iOS solta o wake lock e congela os intervalos.
document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  if (timerFim) {
    if (!timer && Date.now() < timerFim) timer = setInterval(pintaTimer, 250);
    pintaTimer();
  }
  if (querSegurar) segurarTela();
});

// ---------------------------------------------------------------------------
// Ponte global — TEMPORÁRIA, morre na fase 3.
//
// O app virou módulo ES, e módulo tem escopo próprio: `function foo(){}` aqui
// dentro não é mais `window.foo`. Como o render ainda emite `onclick="foo()"`
// como atributo, e atributo só enxerga o escopo global, cada função usada em
// handler inline precisa ser republicada em `window`.
//
// Quando o render virar componente e os handlers virarem funções de verdade,
// esta lista inteira deixa de existir. Até lá, `telas.test.js` varre o fonte
// atrás de handler inline e cobra que todo nome citado esteja aqui — esquecer
// um dá botão morto, que é exatamente o tipo de quebra silenciosa que o
// atributo esconde até alguém apertar.
const HANDLERS_INLINE = {
  abrirAddEx, abrirAdicionar, abrirCardioRapido, abrirCarga, abrirNota,
  abrirNovoEx, abrirPrograma, abrirRetro, abrirSessao, abrirSubstituicao,
  addBody, addCardio, addExercicio, addHora, addNome, addSet, apagarMarca,
  apagarSessao, bodyIn, buscaEx, cancelarEdicao, cardioSet, closeHist,
  concluirPromo, concluirRetro, copyJSON, criarExercicio, criarTreino,
  decidePromo, delBody, delCardio, descOf, desfazMod, editDor, editarSessao,
  escAttr, exportData, fecharAddEx, fecharAdicionar, fecharPrograma,
  fecharRetro, fecharSessao, finalizarSessao, go, gravarRetro, histKey, id,
  importFile, importText, iniciarSessao, inp, limpaNum, modoEdicao,
  modoPrograma, motivoPromo, moverDia, moverEx, moverProg, mudaMes,
  mudaSeries, obsIn, openHist, pasteJSON, pausarSessao, progDesc, progRemove,
  progReps, progSeries, progSetTroca, progTroca, proximoDoBiset, pularEx,
  removerEx, restaurarDia, restaurarTudo, retomarSessao, salvarEdicao,
  setAlt, setCarga, setDeload, showJSON, startTimer, stopTimer, tab, toggle,
  toggleAq, toggleDor, toggleSwap, voltarDoPromo, wipe
};
Object.assign(window, HANDLERS_INLINE);

// Janela para os testes alcançarem o escopo do módulo. `eval` direto aqui dentro
// enxerga tudo que é declarado neste arquivo — é o que `window.eval` dava de
// graça quando o script era global, e o que o harness usa para chegar em `S`,
// `view` e nas funções internas sem que o app precise exportar nada.
// Some junto com a ponte, quando os testes passarem a importar os módulos.
window.__escopo = function (codigo) { return eval(codigo); };

// Arranca quando o DOM existir, tanto embutido no Claude.ai
// quanto abrindo o arquivo direto no navegador.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', load);
} else {
  load();
}

// Service worker: funciona sem internet na academia. Falha em silêncio
// onde não existe (file://, iframe do Claude.ai, navegador antigo).
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
