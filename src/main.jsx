import {
  ROT_BASE, D_COMPOSTO, D_MAQUINA, D_MEDIO, D_ISOLADOR, D_CURTO,
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
import { montaNoApp } from './ui/raiz.jsx';
import { ajusteDoVeredito } from './dominio/corpo';
import { e1rmPorSemana, sinalDeForca, tendenciaDeForca, textoDaTendencia } from './dominio/forca';
import { App } from './ui/app.jsx';
import { FolhaDia, FolhaRefeicao } from './ui/folhas/refeicao.jsx';
import { FolhaEditaAlimento, FolhaEditaRefeicao, FolhaSeletor } from './ui/folhas/editores.jsx';
import { FolhaFoto } from './ui/folhas/foto.jsx';
import { Protocolo } from './ui/telas/protocolo.jsx';
import { Comparar } from './ui/telas/comparar.jsx';
import { AjusteFoto } from './ui/telas/ajustefoto.jsx';
import { Camera } from './ui/telas/camera.jsx';
import { Sessao } from './ui/telas/sessao.jsx';
import { Historico } from './ui/telas/historico.jsx';
import { Decisao } from './ui/telas/decisao.jsx';
import { Retrospectiva } from './ui/telas/retrospectiva.jsx';
import { Retroativo } from './ui/telas/retroativo.jsx';
import { Programa } from './ui/telas/programa.jsx';
import { CADENCIA_PADRAO, diaDeHoje, previsaoDoHorizonte, proximoTreino } from './dominio/dia';
import { ALIMENTOS_BASE, PLANO_BASE } from './dominio/nutricao/alimentos';
import { arrozDoAjuste, listaDeCompras, totalDaRefeicao, totalDoDia } from './dominio/nutricao/calculo';
import { Exercicio } from './ui/exercicio.jsx';
import { alvoDoPrograma, seriesDeGrupo, impacto,
         seriesPorMusculo as _seriesPorMusculo } from './dominio/volume';
import { mediasSemanais, pesoRitmo as _pesoRitmo,
         cinturaMes as _cinturaMes, veredito as _veredito } from './dominio/corpo';
import { PAUSA_DIAS, diasDesde, historico as _historico, lastSet as _lastSet,
         pausaEx as _pausaEx, dorSeguida as _dorSeguida, shouldUp as _shouldUp,
         setsFor as _setsFor } from './dominio/progressao';
import { PLANO_ATUAL, migraPlano, migraPlano3, migraPlano4, migraPlano5, migraPlano6 } from './dominio/migracoes';
import { semeiaProg, montaCatalogo as _montaCatalogo, exercicioFantasma } from './dominio/programa';
import { DB } from './infra/db';
import {
  chaveDeCardio, chaveDeDescanso, chaveDeFoto, chaveDeFotoDoCorpo, chaveDeLog, chaveDeMarca, chaveDeSessaoFoto,
  chaveDeSessao, funde
} from './dominio/sincronia';
import { NUVEM } from './infra/nuvem';
import * as FOTO from './infra/fotos';
import * as CORPO from './infra/corpo';
import * as CAM from './infra/camera';
import {
  CADENCIA_DIAS, MONTAGEM, comAPose, completude,
  diasDesde as diasDesdeAFoto, instanteDaData, mediaDaSemana, parPadrao,
  poseDe, poses as posesDo, proximaPose, referencia, sessaoDe,
  ultima as ultimaSessaoFoto, vizinhaComAPose
} from './dominio/protocolo';
import {
  IDENTIDADE, arrasta as arrastaRecorte, ehIdentidade,
  normaliza as normalizaEnq, zoomMinimo
} from './dominio/enquadramento';

// A chave de hoje e a de ontem.
//
// O produto se chamava "Treino" e a chave carregava o nome. Renomear storage é
// justamente a operação que a regra 2 existe para vigiar, então isto não é um
// replace: no boot, se a chave velha ainda estiver lá, o estado dela é FUNDIDO
// com o da nova pela mesma `funde()` da sincronização — mesma máquina, mesmas
// lápides, mesma chave natural por registro — e só então a velha é apagada.
//
// Fundir, e não "copiar se a nova não existir", cobre a janela real desta
// migração: publicada a versão nova, o iPhone ainda serve o build antigo por
// uma ou duas aberturas, e uma série registrada nessa janela cai na chave
// VELHA depois de a nova já existir. Copiar perderia essa série; fundir não.
// Por isso a pergunta é "a velha existe?", e nunca "já migrei?" — se o build
// antigo rodar de novo, a migração roda de novo.
const KEY = 'lastro-v1';
const KEY_LEGADO = 'treino-eduardo-v1';

/**
 * Marca um registro como apagado.
 *
 * Sem isto, apagar num aparelho é DESFEITO pelo outro: o registro ainda existe
 * lá, e a fusão o traz de volta. A lápide viaja junto com o estado e diz "isto
 * morreu em T".
 */
function lapide(chave) {
  if (!S.apagados || typeof S.apagados !== 'object') S.apagados = {};
  S.apagados[chave] = Date.now();
}
function rot() { return (S.rot && S.rot.length) ? S.rot : ROT_BASE; }

// Sessões de cardio por semana que o treinador pede: segunda depois do A e
// quinta depois do D, que é o treino curto.
const CARDIO_ALVO = 2;
// Os dias de perna do programa: cardio pesado antes deles compete pela mesma
// recuperação. O HYROX entra aqui porque corrida, sled e lunges cobram da
// perna tanto quanto o dia de perna. Sinaliza, não bloqueia.
const DIAS_PERNA = ['B', 'HX'];





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
             s:sl.s, r:sl.r, d:sl.d, rir:sl.rir || '', desde:sl.desde, bi:sl.bi || 0,
             mod:sl.mod || 0, orig:sl.orig || sl.id };
  }) };
}








let S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[], body:{ peso:[], cintura:[] }, carga:{}, export:0, plano:PLANO_ATUAL, prog:null, rot:null, ex:{}, mods:null, progLog:[], protocolo:{ poses:null, sessoes:[] } };
let view = { day:'A', open:null, hist:null, json:null, paste:false, swapOpen:null, fired:{}, sessao:null, edit:null, retro:false, nota:null, carga:null, mes:0, add:null, cardioRapido:false,
  editProg:false, addEx:false, addQ:'', novoEx:false, promo:null, prog:null,
  protocolo:null, comparar:null, ajuste:null, camera:null };
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
  if (typeof S.mtime !== 'number') S.mtime = 0;
  if (!S.apagados || typeof S.apagados !== 'object') S.apagados = {};
  if (!S.descanso || typeof S.descanso !== 'object') S.descanso = {};
  if (!S.fotos || typeof S.fotos !== 'object') S.fotos = {};
  // O protocolo de fotos entra como campo novo e opcional — sem migração, que
  // é para reformatar dado existente, e aqui não há dado existente. Um backup
  // de qualquer versão anterior chega aqui pelo mesmo caminho que o disco.
  if (!S.protocolo || typeof S.protocolo !== 'object') S.protocolo = { poses: null, sessoes: [] };
  if (!Array.isArray(S.protocolo.sessoes)) S.protocolo.sessoes = [];
  if (!Array.isArray(S.protocolo.poses) || !S.protocolo.poses.length) S.protocolo.poses = null;
  S.protocolo.sessoes.forEach(function (x) { if (!x.fotos || typeof x.fotos !== 'object') x.fotos = {}; });
  if (!S.promoPendente || typeof S.promoPendente !== 'object') S.promoPendente = null;
}

/** Lê uma chave crua do storage. null quando não há nada lá. */
async function leBruto(k) {
  try {
    const r = await DB.get(k);
    return (r && r.value) ? r.value : null;
  } catch (e) { return null; }        // primeira vez: começa vazio
}

/** Interpreta um estado guardado. null quando o texto não é um objeto. */
function interpreta(raw) {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return (p && typeof p === 'object') ? p : null;
  } catch (e) {
    console.error('histórico ilegível, mantido intacto no storage', e);
    return null;
  }
}

async function load() {
  const legado = await leBruto(KEY_LEGADO);
  const atual = interpreta(await leBruto(KEY));
  const antigo = interpreta(legado);

  // Os dois lados existem quando o build antigo escreveu depois de a chave
  // nova já ter nascido. A ordem é (novo, velho) pelo mesmo motivo da
  // sincronização: em empate de documento, manda quem tem mtime maior, e os
  // registros se unem pela chave natural de qualquer forma.
  if (atual && antigo) S = funde(atual, antigo, Date.now()).estado;
  else if (atual) S = atual;
  else if (antigo) S = antigo;

  normalizaEstado();
  montaCatalogo();

  // as migrações rodam em cadeia: quem está no plano 1 passa pelas duas
  const arquivados = migraPlano(S);
  const m3 = migraPlano3(S);
  migraPlano4(S);
  migraPlano5(S);
  migraPlano6(S);
  garanteProgramaERotacao();
  montaCatalogo();

  // A chave velha só sai depois de a nova estar gravada E a gravação ter dado
  // certo. Se a escrita falhar, ela fica onde está e a migração tenta de novo
  // na próxima abertura. `grava` e não `save`: fundir não é tocar no estado.
  if (legado && await grava()) {
    try { await DB.delete(KEY_LEGADO); } catch (e) {}
  }

  // Rascunho do modelo antigo, sem sessão: vira sessão aberta para não
  // perder um treino que estava em andamento na hora da atualização.
  if (S.draft && !S.sessao && treino(S.draft.day) && Object.keys(S.draft.ex || {}).length) {
    S.sessao = { day: S.draft.day, inicio: S.draft.t || Date.now(), ultima: S.draft.t || Date.now(), sid: S.draft.t || Date.now() };
    projetaTudo();
  }

  encerraSePreciso();                  // sessão vencida fecha ANTES de decidir a rota
  // Abrir o app com treino em andamento cai no treino, não em HOJE. Sair e
  // voltar no meio de uma série é o caso mais comum de reabertura que existe
  // neste app, e devolvê-lo a HOJE cobrava dois toques com o celular na mão
  // suada. Se a sessão venceu, `encerraSePreciso` já a fechou e nada disto vale.
  const diaAberto = diaDaSessaoAberta();
  view.day = diaAberto || nextDay();
  if (diaAberto) view.aba = 'treino';
  render();
  abrePromoGuardada();
  // Antes da primeira leitura de foto, e depois do render: a tela já está de pé
  // e não pode procurar os bytes no cache com o nome antigo.
  await FOTO.migraCache();
  carregaFotosDoDia();

  // A nuvem entra DEPOIS de a tela já estar de pé: o app não espera rede para
  // funcionar, e quem chegou primeiro é o dado do aparelho.
  await carregaSync();
  await NUVEM.pronta();
  if (NUVEM.sessao()) { render(); sincroniza(); }
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
    marca.m = Date.now();
  }
  // A pergunta "isto fica no programa?" não pode depender de ele ter tocado em
  // FINALIZAR. A sessão nasce e morre sozinha por decisão do produto — então
  // quando morre sozinha com mudança pendente, a pergunta fica guardada e
  // aparece na abertura seguinte. Descartar em silêncio era decidir por ele,
  // sempre para o mesmo lado.
  // Só no fecho AUTOMÁTICO. Pela porta da frente quem pergunta é
  // `finalizarSessao`, e reagendar aqui faria a mesma pergunta voltar logo
  // depois de respondida.
  const pendentes = comoFim === 'auto' ? modsDoDia(s.day) : [];
  if (pendentes.length) {
    S.promoPendente = {
      day: s.day, t: Date.now(),
      mods: JSON.parse(JSON.stringify(pendentes)),
      resumoMods: pendentes.map(function (m) { return textoMod(s.day, m); })
    };
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
    if (ok) {
      const s = [x[0] != null ? x[0] : 0, x[1]];
      // a terceira posição só existe quando foi preenchida: série sem RIR
      // continua sendo um par, como sempre foi
      if (x[2] != null) s.push(x[2]);
      sets.push(s); any = true;
    }
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
  entry.m = Date.now();
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
    const sai = x.sid === s.sid && (slot == null || (x.sl || key) === slot);
    if (sai) lapide(chaveDeLog(key, x));
    return !sai;
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
    lapide(chaveDeSessao({ sid: s.sid }));
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
    // fechando pela porta da frente: a pergunta é agora, e não fica guardada
    S.promoPendente = null;
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

// ---------- sincronização ----------
// A verdade continua sendo o aparelho. Isto é RÉPLICA: tudo funciona sem rede,
// e sincronizar é uma coisa que acontece por cima, quando dá.
//
// O controle é DO APARELHO e mora numa chave própria — se entrasse no estado,
// viajaria para a nuvem e cada aparelho sobrescreveria a contabilidade do
// outro sobre o que já tinha visto.
const CHAVE_SYNC = 'treino-sync-v1';
// `fotos` guarda a versão de cada foto que ESTE aparelho já confirmou no
// servidor. É contabilidade local: se viajasse no estado, um aparelho diria ao
// outro que já subiu o que só ele tem.
let sync = { v: null, em: 0, sujo: false, rodando: false, erro: null, forcar: false, fotos: {} };

async function carregaSync() {
  try {
    const r = await DB.get(CHAVE_SYNC);
    if (r && r.value) Object.assign(sync, JSON.parse(r.value), { rodando: false });
    if (!sync.fotos || typeof sync.fotos !== 'object') sync.fotos = {};
  } catch (e) {}
}
function gravaSync() {
  DB.set(CHAVE_SYNC, JSON.stringify({
    v: sync.v, em: sync.em, sujo: sync.sujo, forcar: sync.forcar, fotos: sync.fotos || {}
  }));
}

let syncT = null;
/** Toda alteração local marca sujeira e agenda um envio. */
function sujou() {
  if (!NUVEM.sessao()) return;
  sync.sujo = true;
  gravaSync();
  clearTimeout(syncT);
  // 4 s: tempo de terminar de digitar uma série sem mandar a cada tecla
  syncT = setTimeout(function () { sincroniza(); }, 4000);
}

/**
 * Um ciclo de sincronização.
 *
 * Lê a nuvem, decide, escreve. A escrita declara de que versão partiu, e o
 * banco recusa se outro aparelho tiver gravado nesse meio-tempo — aí o ciclo
 * recomeça com o dado novo em mãos. Três tentativas bastam: para haver uma
 * quarta, dois aparelhos teriam que estar gravando ao mesmo tempo, três vezes
 * seguidas.
 */
/**
 * O app não funciona sem programa e sem rotação. Estado vindo de fora — backup
 * antigo, aparelho novo, fusão com quem ainda não tinha nada — pode chegar sem
 * eles, e aí a tela quebra antes de qualquer mensagem de erro.
 */
function garanteProgramaERotacao() {
  if (!S.prog || typeof S.prog !== 'object') S.prog = semeiaProg();
  if (!Array.isArray(S.rot) || !S.rot.length) S.rot = ROT_BASE.slice();
}

async function sincroniza(opcoes) {
  const manual = !!(opcoes && opcoes.manual);
  if (!NUVEM.sessao() || sync.rodando) return;
  // o que estiver represado sobe neste ciclo, não no próximo
  await liberaSave();
  sync.rodando = true; sync.erro = null; render();
  try {
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const lida = await NUVEM.puxa();
      if (!lida.ok) { sync.erro = lida.msg; if (manual) toast(lida.msg); return; }

      const linha = lida.v;
      let deV = linha ? linha.v : null;

      if (linha && !sync.forcar) {
        const jaVisto = linha.v === sync.v;
        if (jaVisto && !sync.sujo) {        // nada mudou de nenhum lado
          sync.em = Date.now(); gravaSync();
          reconciliaFotos();                  // pode faltar byte mesmo sem estado novo
          reconciliaCorpo();
          return;
        }
        if (!jaVisto) {
          const { estado, resumo } = funde(S, linha.data, Date.now());
          S = estado;
          normalizaEstado();
          garanteProgramaERotacao();
          montaCatalogo();
          await grava();                     // grava a fusão SEM recarimbar
          contaFusao(resumo, manual);
          if (!sync.sujo && !temQueEmpurrar(resumo)) {
            sync.v = linha.v; sync.em = Date.now(); gravaSync(); render(); return;
          }
        }
      }

      const escrita = await NUVEM.empurra(deV, S);
      if (escrita.ok) {
        sync.v = escrita.v; sync.sujo = false; sync.forcar = false; sync.em = Date.now();
        gravaSync(); render();
        if (manual) toast('Sincronizado.');
        reconciliaFotos();                     // sem await: os bytes vão por fora
        reconciliaCorpo();
        return;
      }
      if (escrita.erro === 'conflito') continue;   // outro gravou: relê e refaz
      sync.erro = escrita.msg;
      if (manual) toast(escrita.msg);
      return;
    }
    sync.erro = 'outro aparelho está gravando ao mesmo tempo';
    if (manual) toast('Tente de novo em alguns segundos.');
  } finally {
    sync.rodando = false; gravaSync(); render();
  }
}

/**
 * Leva e traz os BYTES das fotos.
 *
 * Roda depois do ciclo de estado, e separada dele de propósito: o estado é
 * pequeno e precisa fechar rápido entre duas séries; foto é grande e pode
 * demorar. Se ela falhar, o histórico já subiu — e a próxima sincronização
 * tenta de novo, porque a comparação é sempre entre a referência e o que este
 * aparelho confirmou ter enviado.
 *
 * Uma de cada vez, e não em paralelo: é o sinal da academia, e um lote
 * simultâneo derruba todas em vez de entregar algumas.
 */
async function reconciliaFotos() {
  if (!NUVEM.sessao() || !S.fotos) return;
  const ids = Object.keys(S.fotos);

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const ref = S.fotos[id];
    if (!ref || !ref.v) continue;

    const aqui = await FOTO.tem(id, ref.ext);

    if (aqui && sync.fotos[id] !== ref.v) {
      const bytes = await FOTO.le(id, ref.ext);
      if (bytes) {
        const r = await NUVEM.subirFoto(id, bytes, ref.ext);
        if (!r.ok) return;                    // sem rede: para e tenta depois
        sync.fotos[id] = ref.v; gravaSync();
      }
    } else if (!aqui) {
      const r = await NUVEM.baixaFoto(id, ref.ext);
      if (!r.ok) return;
      if (r.v) {
        await FOTO.guarda(id, r.v, ref.ext);
        sync.fotos[id] = ref.v; gravaSync();
        await carregaFotos([id]);              // a <img> estava vazia até agora
      }
    }
  }
}

/**
 * Leva e traz os bytes das fotos de ACOMPANHAMENTO.
 *
 * Separada da de aparelhos porque a política é outra. Aparelho são umas 40
 * fotos que ficam no aparelho para sempre; corpo são nove por sessão, e o
 * aparelho guarda só as recentes.
 *
 * Duas assimetrias, e as duas são deliberadas:
 *
 * SUBIR é obrigação — enquanto um byte só existe aqui, ele está a um despejo de
 * cache de sumir. BAIXAR é sob demanda: puxar o histórico inteiro na primeira
 * sincronização de um aparelho novo seriam dezenas de megabytes pelo sinal da
 * academia, e ninguém pediu para ver 2026 inteiro.
 *
 * A PODA só alcança sessão cuja foto já foi confirmada no bucket. Apagar byte
 * que ainda não subiu é o erro mais caro que este arquivo pode cometer.
 */
async function reconciliaCorpo() {
  if (!NUVEM.sessao() || !S.protocolo) return;
  const sessoes = S.protocolo.sessoes || [];

  let todasNoBucket = true;
  for (let i = sessoes.length - 1; i >= 0; i--) {
    const ses = sessoes[i];
    const poses = Object.keys(ses.fotos || {});
    for (let j = 0; j < poses.length; j++) {
      const pose = poses[j], ref = ses.fotos[pose];
      if (!ref || !ref.v) continue;
      const k = 'corpo:' + ses.d + ':' + pose;
      if (sync.fotos[k] === ref.v) continue;

      const bytes = await CORPO.le(ses.d, pose, ref.ext);
      if (!bytes) { todasNoBucket = false; continue; }   // não está aqui: nada a subir
      const r = await NUVEM.subirCorpo(ses.d, pose, bytes, ref.ext);
      if (!r.ok) return;                                  // sem rede: para e tenta depois
      sync.fotos[k] = ref.v; gravaSync();
    }
  }

  // A poda espera todo mundo confirmado. Uma foto que não subiu segura o cache
  // inteiro por um ciclo, e é exatamente isso que se quer.
  if (!todasNoBucket) return;
  const recentes = sessoes.slice(-CORPO.SESSOES_NO_APARELHO).map(function (x) { return x.d; });
  if (recentes.length === sessoes.length) return;
  await CORPO.poda(recentes);
}

/**
 * Garante que os bytes daquelas sessões estejam AQUI, buscando no bucket o que
 * faltar. É o caminho de volta da poda: abrir uma sessão antiga a traz.
 */
async function garanteBytesDoCorpo(datas) {
  let mudou = false;
  for (const d of datas || []) {
    const ses = sessaoDe(S.protocolo.sessoes, d);
    if (!ses) continue;
    for (const pose of Object.keys(ses.fotos || {})) {
      const ref = ses.fotos[pose];
      if (!ref || !ref.v) continue;
      if (await CORPO.tem(d, pose, ref.ext)) {
        if (await CORPO.carrega(d, pose, ref)) mudou = true;
        continue;
      }
      if (!NUVEM.sessao()) continue;
      const r = await NUVEM.baixaCorpo(d, pose, ref.ext);
      if (!r.ok || !r.v) continue;
      await CORPO.guarda(d, pose, r.v, ref.ext);
      if (await CORPO.carrega(d, pose, ref)) mudou = true;
    }
  }
  if (mudou) render();
}

/** A fusão trouxe algo do outro lado? Então o nosso documento precisa subir. */
function temQueEmpurrar(r) {
  return r.series > 0 || r.sessoes > 0 || r.medidas > 0 || r.cardio > 0 ||
         r.fotosCorpo > 0 || r.ajustesCorpo > 0 || r.apagados > 0 || r.documentos === 'local';
}

/** Mudar o histórico dele em silêncio seria pior que não sincronizar. */
function contaFusao(r, manual) {
  const p = [];
  if (r.series) p.push(r.series + (r.series === 1 ? ' série' : ' séries'));
  if (r.sessoes) p.push(r.sessoes + (r.sessoes === 1 ? ' sessão' : ' sessões'));
  if (r.medidas) p.push(r.medidas + (r.medidas === 1 ? ' medida' : ' medidas'));
  if (r.cardio) p.push(r.cardio + ' de cardio');
  if (r.fotosCorpo) p.push(r.fotosCorpo + (r.fotosCorpo === 1 ? ' foto' : ' fotos'));
  if (p.length) toast('Do outro aparelho: ' + p.join(' · ') + '.');
  else if (manual && r.documentos === 'remoto') toast('Programa e plano vieram do outro aparelho.');
}

/** Escreve o estado como ele está. Não carimba: quem carimba é `save`. */
async function grava() {
  try { await DB.set(KEY, JSON.stringify(S)); return true; }
  catch (e) { console.error('não salvou', e); return false; }
}

async function save() {
  // O carimbo do estado inteiro. É o que decide, na fusão, de que lado vêm os
  // DOCUMENTOS — programa, plano de comida, cadência —, que são os únicos
  // pedaços sem fusão possível. As coleções não dependem dele: elas se unem
  // pela chave natural de cada registro.
  S.mtime = Date.now();
  sujou();
  return grava();
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
      s: e.sets.map(function (x) { return x ? [x[0], x[1], x[2] != null ? x[2] : null] : [null, null, null]; }),
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
  saveT = setTimeout(function () { saveT = null; save(); }, 700);
}

/**
 * Faz acontecer agora a gravação represada pelo debounce.
 *
 * Sincronizar sem isto lia um estado que ainda não tinha sido carimbado e com a
 * sujeira ainda não marcada — e o ciclo concluía "nada mudou", deixando a
 * alteração para trás até algum gatilho seguinte.
 */
async function liberaSave() {
  if (saveT == null) return;
  clearTimeout(saveT); saveT = null;
  await save();
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

/** Aquele dia foi descanso? */
function ehDescanso(t) { return !!(S.descanso && S.descanso[hojeISO(t)]); }

/**
 * Marca ou desmarca um dia como descanso.
 *
 * Só faz sentido em dia SEM sessão: se há treino registrado, o fato já
 * respondeu a pergunta, e deixar as duas marcas conviverem seria o app
 * afirmando duas coisas contrárias sobre o mesmo dia.
 */
async function alternaDescanso(t) {
  const iso = hojeISO(t);
  if (sessoesDoDia(t).length) { toast('Este dia tem treino registrado.'); return; }
  if (S.descanso[iso]) {
    delete S.descanso[iso];
    lapide(chaveDeDescanso(iso));
    await save(); render();
    toast('Marca de descanso removida.');
  } else {
    S.descanso[iso] = Date.now();
    await save(); render();
    toast('Dia marcado como descanso.');
  }
  fecharAdicionar();
}

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

let relogioT = null;
function tickRelogio() {
  const el = document.getElementById('relogio');
  if (!el || !S.sessao) return;
  el.textContent = relogioTexto(S.sessao);
}
function ajustaRelogio() {
  const ativo = !!(S.sessao && !S.sessao.pausadoEm && !S.sessao.retro && view.aba === 'treino');
  if (ativo && !relogioT) relogioT = setInterval(tickRelogio, 1000);
  else if (!ativo && relogioT) { clearInterval(relogioT); relogioT = null; }
}

/**
 * O contador de séries, atualizado no toque sem re-render.
 *
 * Existe porque `inp()` NÃO chama render() de propósito: o campo é controlado
 * pelo valor já parseado, e redesenhar a cada tecla reescreveria "22," como
 * "22" — deixando impossível digitar decimal no teclado pt-BR. O preço é este
 * ponteiro no DOM, e ele é o último lugar do treino tocado por fora do Preact.
 */
function atualizaEstado() {
  const el = document.getElementById('daymeta');
  if (!el) return;
  const P = treino(view.day);
  if (!P) return;
  const prescritas = P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0);
  el.textContent = seriesFeitasHoje(view.day) + '/' + prescritas;
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
      // A coluna ANTERIOR: o que ele fez nesta MESMA série da última vez.
      // Antes isso era só o placeholder do campo de carga e uma linha de
      // resumo embaixo — para saber a repetição da série 3 era preciso contar
      // na cabeça. Aqui cada linha carrega a própria referência.
      antes: p
        ? (p[0] ? fmtNum(p[0]) + (seg ? 'kg × ' : ' × ') : '') + p[1] + (seg ? 's' : '') +
          (p[2] != null ? ' @ ' + p[2] : '')
        : null,
      // O placeholder é DADO — a carga da última vez. A unidade é ESTRUTURA e
      // fica sempre visível ao lado. Antes os dois diziam a mesma coisa quando
      // não havia histórico: o campo mostrava "kg" com um "KG" grudado na
      // direita. Sem histórico, o campo fica vazio e só a unidade fala.
      rirAberto: !!(view.rir && view.rir.i === i && view.rir.k === k),
      rirEscala: RIR_ESCALA.map(function (v) { return { v: v, on: (dr && dr.s[k]) ? dr.s[k][2] === v : false }; }),
      // Não há placeholder nos campos: a referência tem UMA casa, e é a coluna
      // ANTERIOR. Ela diz as três coisas numa linha só e, ao contrário do
      // placeholder, NÃO some quando ele começa a digitar — antes, escrever a
      // carga apagava a referência das repetições justamente na hora de
      // escrevê-las.
      temAnterior: !!p
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
    rir: ex.rir || '',
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
    temFoto: !!S.fotos[ex.id],
    // o endereço já lido para a memória, ou null enquanto não foi
    foto: FOTO.urlDaFoto(ex.id, S.fotos[ex.id]),
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
    // Aqui a foto paga mais que em qualquer outro lugar: são substitutos que
    // ele quase nunca executou, escolhidos sob pressão com a máquina ocupada.
    // Reconhecer o aparelho pela imagem é mais rápido que ler o nome.
    foto: FOTO.urlDaFoto(a.id, S.fotos[a.id]),
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
  toggleDor: function (i, k) { toggleDor(i, k); },
  abreRir: function (i, k) { abreRir(i, k); },
  abreFoto: function (i) { abreFoto(i); },
  poeRir: function (i, k, v) { poeRir(i, k, v); }
};



// =============================================================================
// O CONTEXTO — a ponte entre o casco e a shell do Instrumento.
//
// As telas novas não leem `S` nem `view`: recebem view-model pronto e ações.
// Foi o que permitiu repintar sem tocar na lógica de sessão, projeção e
// migração — a parte onde errar custa histórico, e que os testes de fluxo
// protegem há meses.
//
// Cada método aqui é ou LEITURA (monta view-model) ou AÇÃO (muda estado e
// chama render). Nada no meio.
// =============================================================================

/** 'AAAA-MM-DD' local — o carimbo que faz o dia de comida zerar sozinho. */
function hojeISO(t) {
  const d = new Date(t == null ? Date.now() : t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

/**
 * O dia de comida de hoje. Carimbado com a data: virou o dia, zera sozinho —
 * marcações, água e ajuste de porção são do dia, não do plano.
 */
function diaDeComida() {
  const hoje = hojeISO();
  if (!S.dia || S.dia.data !== hoje) {
    S.dia = { data: hoje, done: {}, agua: 0, escala: {}, cadencia: null, alta: 0 };
  }
  if (!S.dia.done) S.dia.done = {};
  if (!S.dia.escala) S.dia.escala = {};
  return S.dia;
}

/** O catálogo de alimentos efetivo: o do código mais o que ele cadastrou. */
function catalogoAlimentos() {
  const cat = {};
  Object.keys(ALIMENTOS_BASE).forEach(function (k) {
    if (!S.comida.ocultos[k]) cat[k] = ALIMENTOS_BASE[k];
  });
  Object.keys(S.comida.alimentos || {}).forEach(function (k) {
    cat[k] = Object.assign({ id: k }, ALIMENTOS_BASE[k] || {}, S.comida.alimentos[k]);
  });
  return cat;
}

function planoDeComida() {
  if (!S.comida.plano) S.comida.plano = JSON.parse(JSON.stringify(PLANO_BASE));
  return S.comida.plano;
}

function cadenciaDaSemana() {
  return (S.cadencia && S.cadencia.length === 7) ? S.cadencia : CADENCIA_PADRAO;
}

function diaResolvido() {
  return diaDeHoje(S, ROT_BASE, cadenciaDaSemana(), diaDeComida().cadencia, Date.now());
}

/** A refeição que É o treino: o plano marca isso pelo id. */
function ehLinhaDeTreino(r) { return r.id === 'treino'; }

/** Séries registradas hoje naquele treino. */
function seriesFeitasHoje(d) {
  const P = treino(d);
  if (!P) return 0;
  let n = 0;
  P.ex.forEach(function (ex, i) {
    const h = (S.logs[id(d, i)] || []).filter(function (e) { return sameDay(e.t, Date.now()); });
    h.forEach(function (e) { n += e.sets.filter(Boolean).length; });
  });
  return n;
}

const CTX = {
  // ---------- rota ----------
  abaAtual: function () { return view.aba || 'hoje'; },
  // Uma rota só. `view.tab` existia em paralelo a `view.aba` durante a
  // migração — duas fontes de verdade para a mesma pergunta, e o app já
  // trocava de conteúdo sem trocar a aba acesa por causa disso.
  vaiPara: function (a) {
    const vindoDeFora = view.aba !== a;
    view.aba = a;
    view.prog = null; view.hist = null; view.retro = false;
    view.sessao = null; view.add = null; view.mes = 0;

    // Chegar em TREINO com sessão aberta cai no dia DELA. Era aqui que o app
    // abria "um treino qualquer": `view.day` ficava no último dia visitado, que
    // depois de um `finalizarSessao` já é o PRÓXIMO da rotação.
    const diaAberto = a === 'treino' && vindoDeFora ? diaDaSessaoAberta() : null;
    const trocou = diaAberto && diaAberto !== view.day;
    if (trocou) { view.day = diaAberto; view.open = null; view.nota = null; }

    render();
    window.scrollTo(0, 0);
    if (trocou) carregaFotosDoDia();
  },
  telaCheia: telaCheia,
  /** true quando uma tela cheia do sistema antigo tomou a tela toda. */
  emTelaCheia: function () {
    return !!(view.promo || view.prog || view.retro || view.add || view.sessao || view.hist ||
              view.protocolo || view.comparar || view.ajuste || view.camera);
  },

  // ---------- cabeçalho de HOJE ----------
  cabecalhoDeHoje: function () {
    const h = diaResolvido();
    // `new Date(Date.now())` e não `new Date()`: TODO o relógio do app passa
    // por `Date.now`, e é o que permite ao teste fixar o dia. Um `new Date()`
    // solto escapa dessa porta e lê o relógio de verdade — a tela passaria a
    // discordar do resto do app no meio de um teste que viajou no tempo.
    const d = new Date(Date.now());
    return {
      olho: (DIAS_LONGOS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]).toUpperCase(),
      rotulo: h.previsto ? 'previsto' : 'hoje',
      valor: h.cadencia === 'descanso' ? 'folga' : (h.treino || '—')
    };
  },

  // ---------- HOJE ----------
  hoje: function () {
    const h = diaResolvido();
    const dia = diaDeComida();
    const cat = catalogoAlimentos();
    const plano = planoDeComida();
    const alta = !!dia.alta;
    const treinando = h.cadencia === 'treino';

    const P = h.treino ? treino(h.treino) : null;
    const prescritas = P ? P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) : 0;
    const feitas = h.treino ? seriesFeitasHoje(h.treino) : 0;

    return {
      diaHoje: h,
      plano: plano,
      catalogo: cat,
      comidaDoDia: dia,
      alta: alta,
      alvo: totalDoDia(plano, cat, treinando, alta, {}),
      cadenciaTxt:
        (S.ajuste === 0 ? 'plano atual' : S.ajuste > 0 ? 'ajuste +150 kcal' : 'ajuste −150 kcal') +
        ' · ' + (h.previsto ? 'dia previsto pela cadência da semana' : 'dia confirmado'),
      sessao: {
        nome: P ? P.name : null,
        feita: prescritas > 0 && feitas >= prescritas,
        valor: P ? feitas + '/' + prescritas + ' séries' : null,
        resumo: P ? P.ex.slice(0, 3).map(function (e) { return e.n; }).join(' · ') : 'Dia de descanso.',
        meta: S.sessao ? 'sessão aberta' : (feitas ? 'registrado' : 'não começou')
      }
    };
  },
  ehLinhaDeTreino: ehLinhaDeTreino,

  // ---------- ações do dia ----------
  marcaRefeicao: function (id) {
    const d = diaDeComida();
    if (d.done[id]) delete d.done[id]; else d.done[id] = 1;
    queueSave(); render();
  },
  setAgua: function (n) { diaDeComida().agua = Math.max(0, n); queueSave(); render(); },
  abreRefeicao: function (id) { CTX.abreFolha({ k: 'refeicao', id: id }); },
  editaRefeicao: function (id) { CTX.abreFolha({ k: 'editaRefeicao', id: id }); },
  novaRefeicao: function () { CTX.abreFolha({ k: 'editaRefeicao', id: null }); },


  /** Ajuste de porção: SÓ DE HOJE. O rótulo diz isso, e o estado zera com a data. */
  setEscala: function (id, v) {
    const d = diaDeComida();
    if (v === 1) delete d.escala[id]; else d.escala[id] = v;
    queueSave(); render();
  },

  /** O seletor de dia: confirma ou corrige a previsão da cadência. */
  abreSeletorDeDia: function () { CTX.abreFolha({ k: 'dia' }); },
  setCadenciaDeHoje: function (c) {
    diaDeComida().cadencia = c;
    pilha().pop();
    queueSave(); render();
  },
  setAlta: function (v) { diaDeComida().alta = v ? 1 : 0; queueSave(); render(); },

  // ---------- folhas ----------
  folhas: function () { return folhaAberta(); }
};

// A tela do sistema antigo, ainda em string. Devolve a árvore em vez de
// montar: quem monta é a shell nova. Cada aba convertida some daqui, e quando

// As telas cheias: as que substituem a shell inteira, tab bar inclusive.
// Não são abas — em cada uma o assunto é uma coisa só, e a tab bar convidaria
// a sair no meio. O voltar é o único caminho de saída.
function telaCheia() {
  if (view.camera) return <Camera ctx={CTX} />;
  if (view.ajuste) return <AjusteFoto ctx={CTX} />;
  if (view.protocolo) return <Protocolo ctx={CTX} />;
  if (view.comparar) return <Comparar ctx={CTX} />;
  if (view.promo) return <Decisao ctx={CTX} />;
  if (view.prog) return <Programa ctx={CTX} />;
  if (view.retro) return <Retrospectiva ctx={CTX} />;
  if (view.add) return <Retroativo ctx={CTX} />;
  if (view.sessao) return <Sessao ctx={CTX} />;
  if (view.hist) return <Historico ctx={CTX} />;
  return null;
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
function voltarDoPromo() {
  // sair sem responder mantém o padrão conservador — e não deixa a pergunta
  // reaparecendo para sempre
  if (view.promo && view.promo.guardada) { S.promoPendente = null; queueSave(); }
  view.promo = null;
  render();
}

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
  S.promoPendente = null;

  if (P.guardada) {
    // a sessão já tinha fechado sozinha: só a decisão faltava
    await save(); render(); window.scrollTo(0, 0);
  } else {
    await encerraDeVerdade(P.day, P.feitas, P.resumoMods);
  }
  if (n) toast(n + (n === 1 ? ' mudança levada' : ' mudanças levadas') + ' para o programa oficial.');
}

/**
 * A pergunta que ficou de uma sessão encerrada sozinha.
 *
 * Aparece na abertura seguinte, e nunca no meio de um treino novo: perguntar
 * sobre o programa enquanto ele registra série é interromper a única coisa que
 * o app existe para não atrapalhar.
 */
function abrePromoGuardada() {
  const g = S.promoPendente;
  if (!g || !Array.isArray(g.mods) || !g.mods.length || S.sessao) return false;
  view.promo = {
    day: g.day, mods: g.mods.slice(), dec: g.mods.map(function () { return 'hoje'; }),
    motivo: null, feitas: 0, resumoMods: g.resumoMods || [], guardada: true, quando: g.t
  };
  render();
  return true;
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

// Só o que tem músculo declarado. As estações do HYROX são exercício de
// verdade no dia, mas contá-las aqui compararia 106 contra o alvo de 90 do
// treinador — dois números medindo coisas diferentes lado a lado.
function seriesDoDia(d) {
  const p = S.prog[d];
  return p ? p.ex.reduce(function (n, x) { return n + (exDe(x.id).g ? x.s : 0); }, 0) : 0;
}
/** Quantos itens do dia não são série de hipertrofia — as estações do HYROX. */
function estacoesDoDia(d) {
  const p = S.prog[d];
  return p ? p.ex.filter(function (x) { return !exDe(x.id).g; }).length : 0;
}
/** "9 exercícios · 20 séries" na musculação; "9 estações" num dia de condicionamento. */
function metaDoDia(d) {
  const est = estacoesDoDia(d);
  const s = seriesDoDia(d);
  if (est && !s) return est + (est === 1 ? ' estação' : ' estações');
  return s + ' séries';
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
  S.progLog.push({ t: Date.now(), day: d, txt: txt, motivo: motivo || null, m: Date.now() });
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
  const opcoes = [D_COMPOSTO, D_MAQUINA, D_MEDIO, D_ISOLADOR, D_CURTO];
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
    if (!confirm('O treino ' + d + ' não existe no programa atual do treinador. Apagar o treino?')) return;
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

function openHist(i){ view.hist = { day:view.day, i, key:logKey(view.day,i) }; view.edit = null; render(); }

// ---------- correção de sessão passada ----------
// Digitou 400 no lugar de 40 e só percebeu na semana seguinte: até aqui não
// havia saída a não ser exportar o JSON e editar na mão.
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
  e.m = Date.now();
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
  lapide(chaveDeLog(key, S.logs[key][view.edit]));
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
  return S.done.filter(x => DIAS_PERNA.indexOf(x.day) >= 0 && sameDay(x.t, Date.now())).map(x => x.day);
}

function cardioSet(k, v) {
  view.cardioForm = Object.assign({ m:'bike', min:25, i:'moderado' }, view.cardioForm);
  view.cardioForm[k] = v;
  render();
}
async function addCardio() {
  const f = Object.assign({ m:'bike', min:25, i:'moderado' }, view.cardioForm);
  // `alt` e não `m`: em cardio o `m` já é o modal
  S.cardio.push({ t: Date.now(), m: f.m, min: f.min, i: f.i, alt: Date.now() });
  if (S.cardio.length > 200) S.cardio = S.cardio.slice(-200);
  await save();
  view.cardioRapido = false;
  render();
  const n = cardioSemana().length;
  toast(`${f.min} min de ${f.m} registrados · ${n} de ${CARDIO_ALVO} nesta semana`);
}
async function delCardio(t) {
  lapide(chaveDeCardio({ t: t }));
  S.cardio = S.cardio.filter(c => c.t !== t);
  await save();
  render();
  toast('Sessão removida.');
}

// ---------- acompanhamento ----------
// A tela que faltava: o app sabia tudo sobre cada exercício e nada sobre o mês.
function mesRef() {
  const b = view.mes || 0;
  const d = new Date(Date.now());          // pela mesma porta que o resto — ver cabecalhoDeHoje
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

async function gravarRetro(detalhar) {
  const a = view.add;
  if (!a.tipo) { toast('Escolha o que foi aquele dia.'); return; }
  // descanso não é sessão: não tem hora, nem duração, nem exercício para
  // detalhar. Sai por outra porta, antes de qualquer coisa virar marca.
  if (a.tipo === 'descanso') { await alternaDescanso(a.t); return; }
  if (a.tipo === 'livre' && !a.grupos.length) { toast('Marque pelo menos um grupo muscular.'); return; }

  const comHora = aplicaHora(a.t, a.hora);
  const quando = comHora != null ? comHora : a.t;
  const sid = quando;
  const marca = { t: quando, sid: sid, retro: 1, m: Date.now() };
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
    view.aba = 'treino'; view.day = a.tipo; view.open = 0;
    await save();
    render(); window.scrollTo(0,0);
    toast(fechou
      ? 'Treino ' + fechou + ' de hoje encerrado. Agora preenchendo ' + fmtDate(a.t) + '.'
      : 'Preenchendo o treino de ' + fmtDate(a.t) + '. Some sozinho quando você sair.');
    return;
  }
  view.aba = 'dados';
  render(); window.scrollTo(0,0);
  toast(a.tipo === 'livre' ? 'Treino avulso registrado.' : 'Treino ' + a.tipo + ' registrado em ' + fmtDate(a.t) + '.');
}



function pesoRitmo() { return _pesoRitmo(S.body.peso); }

function cinturaMes() { return _cinturaMes(S.body.cintura); }

/**
 * O veredito, agora com o sinal de força que o TREINO produz.
 *
 * É onde a fusão vira comportamento em vez de arquitetura: peso parado com
 * carga subindo é recomposição, e mandar comer mais nessa hora atropelaria
 * justamente o que estava dando certo. Antes esse sinal era um interruptor que
 * ele ligava na mão; agora sai do e1RM das cargas registradas.
 */
function forcaSubindo() {
  const t = tendenciaDeForca(S.logs, function (k) { return exDe(k).u === 'seg'; });
  return sinalDeForca(t, S.perfManual);
}
function veredito() { return _veredito(S.body, forcaSubindo()); }

/** Quanto de arroz o plano manda hoje, com o ajuste em vigor aplicado. */
function arrozAtual() {
  const plano = planoDeComida();
  let base = 0;
  plano.forEach(function (r) {
    r.itens.forEach(function (i) { if (i.arroz) base += i.q; });
  });
  return arrozDoAjuste(base, S.ajuste);
}

/**
 * Aplica o ajuste calórico onde o plano manda aplicar: no arroz.
 * O veredito DECIDE, isto EXECUTA — é a divisão de trabalho entre as duas
 * metades do produto.
 */
function aplicaArroz(ajusteAntes) {
  const plano = planoDeComida();
  plano.forEach(function (r) {
    r.itens.forEach(function (i) {
      if (!i.arroz) return;
      // desfaz o ajuste anterior antes de aplicar o novo, senão eles somam
      const base = arrozDoAjuste(i.q, -ajusteAntes);
      i.q = arrozDoAjuste(base, S.ajuste);
    });
  });
}

// Adaptador: a regra vive em dominio/volume.ts; aqui só entram os dados.
function seriesPorMusculo(de, ate, corte) {
  return _seriesPorMusculo(S.logs, function (k) { return exDe(k).g; }, de, ate, corte);
}

/**
 * @param {boolean} [semVeredito] omite o cartão de veredito, que a tela DADOS já
 *   desenha no Instrumento logo acima — sem isso ele aparece duas vezes.
 */
/** Onde o stepper começa quando ainda não há nenhuma medida registrada. */
const CORPO_PADRAO = { peso: 75, cintura: 85 };

// ---------- a data da medida ----------
// Pesagem esquecida ontem não pode entrar como hoje. O veredito da dieta lê
// MÉDIA SEMANAL e o ritmo entre semanas: uma medida no dia errado desloca as
// duas médias, e é esse número que decide comer mais ou comer menos.
//
// O padrão continua sendo hoje, num toque só — a data fica atrás de um link,
// porque registrar no dia é o caso de todo dia e retroativo é exceção.
//
// O seletor é o NATIVO do aparelho, e não uma lista de dias recentes: a medida
// esquecida pode ser de semanas atrás, e uma lista curta não alcança. No iPhone
// ele abre a roda de dia, mês e ano, que é o caminho mais rápido para uma data
// distante — e impede data no futuro pelo `max`, sem o app ter que validar.

/** Um dia normalizado às 7h, que é quando ele pesa. */
function diaNormalizado(t) {
  const d = new Date(t); d.setHours(7, 0, 0, 0); return d.getTime();
}
function diaDaMedida(k) {
  return (view.bodyDia && view.bodyDia[k]) || diaNormalizado(Date.now());
}
/**
 * O instante que vai para o histórico. Hoje leva a hora real, para as medidas
 * do dia manterem ordem entre si; um dia passado leva 7h, o horário de pesagem.
 */
function instanteDaMedida(k) {
  const d = diaDaMedida(k);
  return sameDay(d, Date.now()) ? Date.now() : d;
}
function rotuloDoDia(t) {
  if (sameDay(t, Date.now())) return 'hoje';
  if (sameDay(t, Date.now() - 86400000)) return 'ontem';
  const d = new Date(t);
  return DIAS_CURTOS[d.getDay()] + ' ' + d.getDate();
}
/** O que o dia escolhido já tem — é o que diz se ele vai criar ou corrigir. */
function medidaDoDia(k) {
  const d = diaDaMedida(k);
  return (S.body[k] || []).filter(function (x) { return sameDay(x.t, d); })[0] || null;
}
/** "registrar hoje", "registrar ontem", "registrar em ter 14". */
function acaoDaMedida(k) {
  const r = rotuloDoDia(diaDaMedida(k));
  return 'registrar ' + (r === 'hoje' || r === 'ontem' ? r : 'em ' + r);
}

/** O que a tela precisa saber sobre a data escolhida. */
function diaDaMedidaVM(k) {
  const d = diaDaMedida(k);
  const j = medidaDoDia(k);
  const un = k === 'peso' ? 'kg' : 'cm';
  return {
    aberto: view.bodyDiaAberto === k,
    iso: hojeISO(d),
    max: hojeISO(),
    hoje: sameDay(d, Date.now()),
    txt: rotuloDoDia(d),
    // dizer o que o dia já tem evita o registro cego: ou ele está preenchendo
    // um buraco, ou está corrigindo um valor — e são gestos diferentes
    jaTem: j ? 'neste dia: ' + fmtDec(j.v) + ' ' + un + ' · registrar substitui'
             : 'nenhuma medida neste dia'
  };
}

/**
 * Onde o stepper parte quando não há rascunho.
 *
 * Se o dia escolhido JÁ tem medida, é ela — o gesto ali é corrigir aquele dia,
 * e partir do último peso faria ele digitar por cima do que já estava certo.
 * Sem medida no dia, parte da última registrada.
 */
function baseDoCorpo(k) {
  const arr = S.body[k] || [];
  const d = diaDaMedida(k);
  const noDia = arr.filter(function (x) { return sameDay(x.t, d); })[0];
  if (noDia) return noDia.v;
  return arr.length ? arr[arr.length - 1].v : CORPO_PADRAO[k];
}

/**
 * O valor que o stepper de corpo está mostrando AGORA — a MESMA leitura para a
 * tela e para o botão de registrar.
 *
 * Quando o campo de texto virou stepper, esta função não existia: a tela passou
 * a desenhar um número vindo de `view.bodyForm`, e o registro continuou lendo um
 * `<input>` por id que o redesenho já tinha apagado. Sem tocar no stepper o
 * botão não gravava nada; tocando, chegava número onde o código esperava string.
 *
 * Devolve NaN quando há rascunho e ele não é número — o registro precisa
 * RECUSAR nesse caso, e não gravar a referência no lugar do que foi digitado.
 */
function valorDoCorpo(k) {
  const f = view.bodyForm || {};
  if (f[k] == null || f[k] === '') return baseDoCorpo(k);
  return typeof f[k] === 'number' ? f[k] : parseFloat(String(f[k]).replace(',', '.'));
}

async function addBody(k) {
  const v = valorDoCorpo(k);
  if (isNaN(v) || v <= 0) { toast('Digite um número válido.'); return; }

  const quando = instanteDaMedida(k);
  const rotulo = rotuloDoDia(quando);
  const arr = S.body[k];
  const noDia = arr.filter(x => sameDay(x.t, quando));
  // a substituída ganha lápide: o registro novo tem outro instante, e sem isso
  // a fusão traria os dois de volta e o dia teria duas medidas
  noDia.forEach(x => { lapide(chaveDeMarca(k, x)); arr.splice(arr.indexOf(x), 1); });
  arr.push({ t: quando, v, m: Date.now() });
  arr.sort((a,b) => a.t - b.t);
  if (arr.length > 400) S.body[k] = arr.slice(-400);

  // Solta o rascunho: o stepper volta a se derivar da última medida, que é
  // justamente a que acabou de ser gravada. E a data volta para hoje — deixar
  // uma data passada armada seria a próxima pesagem caindo no dia errado sem
  // ele perceber.
  view.bodyForm = Object.assign({}, view.bodyForm);
  delete view.bodyForm[k];
  view.bodyDia = Object.assign({}, view.bodyDia);
  delete view.bodyDia[k];
  if (view.bodyDiaAberto === k) view.bodyDiaAberto = null;
  await save();
  render();
  const nome = k === 'peso' ? 'Peso' : 'Cintura';
  const un = k === 'peso' ? 'kg' : 'cm';
  toast(noDia.length
    ? `${nome} de ${rotulo} atualizado para ${fmtDec(v)} ${un}.`
    : `${fmtDec(v)} ${un} registrado ${rotulo === 'hoje' ? 'hoje' : 'em ' + rotulo}.`);
}
async function delBody(k, t) {
  lapide(chaveDeMarca(k, { t: t }));
  S.body[k] = S.body[k].filter(x => x.t !== t);
  await save(); render();
  toast('Medida removida.');
}

function payload() {
  return JSON.stringify({ app:'lastro', v:1, exportedAt:new Date().toISOString(), data:S }, null, 2);
}

function exportData() {
  const txt = payload();
  const name = 'lastro-' + new Date().toISOString().slice(0,10) + '.json';
  try {
    // `charset=utf-8` explícito. O Blob sempre grava a string em UTF-8, e
    // JSON é UTF-8 por definição (RFC 8259) — mas quem lê o arquivo depois
    // nem sempre sabe disso, e um leitor que assume Latin-1 transforma
    // "tríceps" em "trÃ­ceps" e "6–10" em "6â10". A corrupção é silenciosa:
    // o JSON continua válido, só o texto fica ilegível.
    const url = URL.createObjectURL(new Blob([txt], {type:'application/json;charset=utf-8'}));
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
        compras: (d.compras && typeof d.compras === 'object') ? d.compras : null,
        // a sincronização: sem estes, importar um backup zeraria o carimbo do
        // estado e as lápides — e um aparelho ressuscitaria o que o outro apagou
        mtime: typeof d.mtime === 'number' ? d.mtime : 0,
        apagados: (d.apagados && typeof d.apagados === 'object') ? d.apagados : {},
        descanso: (d.descanso && typeof d.descanso === 'object') ? d.descanso : {},
        fotos: (d.fotos && typeof d.fotos === 'object') ? d.fotos : {},
        promoPendente: (d.promoPendente && typeof d.promoPendente === 'object') ? d.promoPendente : null };
  // um backup de qualquer versão anterior passa pelas mesmas migrações que o
  // estado do disco: sem isso o app abre com o programa nulo
  normalizaEstado();
  migraPlano(S);
  migraPlano3(S);
  migraPlano4(S);
  migraPlano5(S);
  migraPlano6(S);
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
/**
 * O dia da sessão aberta, quando ela existe e ainda tem treino no programa.
 *
 * A sessão manda na CHEGADA, nunca na permanência. Chegar é abrir o app e é
 * tocar na aba TREINO vindo de fora dela; permanecer é já estar lá. A diferença
 * é o que separa "prioridade" de "prisão": quem chega cai onde estava treinando,
 * e quem quer olhar outro dia troca no seletor e fica nele enquanto não sair.
 *
 * `treino(day)` na condição porque o dia da sessão pode ter saído do programa
 * entre uma abertura e outra — aí não há para onde levar ninguém.
 */
function diaDaSessaoAberta() {
  return S.sessao && treino(S.sessao.day) ? S.sessao.day : null;
}

function go(d){ view.day=d; view.open=null; view.hist=null; view.nota=null; render(); window.scrollTo(0,0); carregaFotosDoDia(); }
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
  const v = (raw === '' || isNaN(num)) ? null : num;
  // RIR não é grandeza aberta: acima de 5 a pessoa não está treinando perto o
  // suficiente para o número significar algo, e negativo não existe
  e.s[k][pos] = (pos === 2 && v != null) ? Math.max(0, Math.min(5, v)) : v;
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
// ---------- a foto do aparelho ----------
// Ela responde "qual das três puxadas desta academia é a que o treinador quis
// dizer" — e por isso é foto DELE, não ilustração. Fica atrás de um botão: no
// cartão aberto ela empurraria a tabela de séries, que é o motivo de o cartão
// abrir, e a partir da segunda semana do bloco ele já não precisa dela.

// Entra pela pilha de folhas, como as outras: é ela que trava a rolagem do
// corpo, empilha e devolve o Escape. Inventar um caminho próprio seria ter
// duas mecânicas de modal no mesmo app.
function abreFoto(i) {
  const t = treino(view.day);
  const ex = t && t.ex[i];
  if (!ex) return;
  pilha().push({ k: 'foto', id: ex.id });
  render();
  carregaFotos([ex.id]);
}

/**
 * Lê do cache as fotos que a tela vai precisar e redesenha se alguma chegou.
 *
 * A leitura é assíncrona e a tela é síncrona, então o primeiro desenho sai sem
 * imagem e o segundo sai com ela. É rápido o bastante para não piscar, e é o
 * preço de não depender do service worker para servir a foto.
 */
/** As miniaturas do treino que está na tela. Chamada ao abrir e ao trocar de dia. */
function carregaFotosDoDia() {
  const t = treino(view.day);
  if (!t) return;
  carregaFotos(t.ex.map(function (x) { return x.id; }));
}

async function carregaFotos(ids) {
  let mudou = false;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (!id || !S.fotos[id]) continue;
    if (await FOTO.carrega(id, S.fotos[id])) mudou = true;
  }
  if (mudou) render();
}

/** O exercício da folha de foto no topo da pilha. */
function fotoAberta() {
  const f = (view.pilha || []).filter(function (x) { return x.k === 'foto'; }).pop();
  return f ? f.id : null;
}

async function tiraFoto(el) {
  const arquivo = el && el.files && el.files[0];
  const id = fotoAberta();
  if (!arquivo || !id) return;
  el.value = '';                       // permite repetir a mesma foto
  try {
    const { blob, ext } = await FOTO.reduz(arquivo);
    await FOTO.guarda(id, blob, ext);
    S.fotos = Object.assign({}, S.fotos);
    S.fotos[id] = { v: Date.now(), ext: ext };
    FOTO.solta(id);                    // a versão anterior sai da memória
    await save();
    await carregaFotos([id]);
    render();
    toast('Foto guardada neste aparelho.');
    reconciliaFotos();
  } catch (e) {
    console.error('foto', e);
    toast('Não deu para usar essa imagem.');
  }
}

async function apagaFoto() {
  const id = fotoAberta();
  if (!id) return;
  if (!confirm('Apagar a foto deste aparelho?')) return;
  const ref = S.fotos[id];
  FOTO.solta(id);
  await FOTO.esquece(id, ref ? ref.ext : 'webp');
  if (ref && NUVEM.sessao()) NUVEM.apagaFoto(id, ref.ext);
  delete sync.fotos[id]; gravaSync();
  S.fotos = Object.assign({}, S.fotos);
  delete S.fotos[id];
  lapide(chaveDeFoto(id));
  await save();
  render();
  toast('Foto apagada.');
}

// ---------- o RIR em dois toques ----------
// Teclado numérico para um dígito custa caro: cobre metade da tela no meio da
// série, e ele está de pé com uma mão. Lista suspensa custa o mesmo e ainda
// esconde as opções até abrir. Aqui a faixa aparece embaixo da própria linha,
// mostra tudo de uma vez, e o segundo toque grava e fecha.
const RIR_ESCALA = [0, 1, 2, 3, 4];

function abreRir(i, k) {
  const aberto = view.rir && view.rir.i === i && view.rir.k === k;
  view.rir = aberto ? null : { i: i, k: k };
  render();
}

function poeRir(i, k, v) {
  const e = draftOf(i);
  if (!e.s[k]) e.s[k] = [null, null];
  // tocar de novo no valor que já está lá limpa: registrar RIR é opcional, e
  // sem isso um toque errado não teria volta
  e.s[k][2] = e.s[k][2] === v ? null : v;
  view.rir = null;
  projeta(i); queueSave(); render();
}

function toggleDor(i, k) {
  const e = draftOf(i);
  const j = e.dor.indexOf(k);
  if (j >= 0) e.dor.splice(j,1); else e.dor.push(k);
  projeta(i); queueSave(); render();
}
function toggleSwap(i){
  view.swapOpen = view.swapOpen===i ? null : i;
  render();
  // as miniaturas das opções: lidas do cache depois que o painel já está de pé
  if (view.swapOpen === i) {
    const t = trocaDoDia(view.day, i);
    const ids = [];
    (t ? t.grupos : []).forEach(function (g) {
      g.opcoes.forEach(function (o) { ids.push(o.id); });
    });
    carregaFotos(ids);
  }
}
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

/**
 * Apaga um registro de treino INTEIRO: a marca do dia e as séries dela.
 *
 * A versão anterior tirava só a marca, e por isso só era oferecida para o
 * treino AVULSO, que não tem série nenhuma. Num treino do plano isso deixaria
 * as séries órfãs no histórico de cada exercício — ainda contando volume, ainda
 * puxando progressão, sem nenhum dia a que pertencer. Registrar o treino errado
 * é exatamente o caso em que se quer as duas coisas fora.
 *
 * Lápide nos dois: sem elas a próxima sincronização traz tudo de volta do outro
 * aparelho.
 */
async function apagaRegistroDeTreino(t) {
  const m = S.done.filter(function (x) { return x.t === t; })[0];
  if (!m) return;
  if (S.sessao && S.sessao.sid === m.sid) {
    toast('Este treino está em andamento. Finalize ou descarte primeiro.');
    return;
  }

  // as séries daquela sessão, exercício por exercício
  const linhas = [];
  Object.keys(S.logs).forEach(function (idEx) {
    (S.logs[idEx] || []).forEach(function (l) { if (l.sid === m.sid) linhas.push({ idEx: idEx, l: l }); });
  });
  const series = linhas.reduce(function (a, x) {
    return a + x.l.sets.filter(Boolean).length;
  }, 0);

  // o aviso diz o que vai junto: apagar o dia e apagar as séries é uma
  // decisão só, e ela não pode ser tomada sem o número na frente
  const oQue = series
    ? 'Apagar este treino e as ' + series + (series === 1 ? ' série registrada' : ' séries registradas') + ' nele?'
    : 'Apagar este registro de treino?';
  if (!confirm(oQue + '\n\nIsso não tem volta, e vale para os outros aparelhos.')) return;

  lapide(chaveDeSessao(m));
  linhas.forEach(function (x) { lapide(chaveDeLog(x.idEx, x.l)); });

  S.done = S.done.filter(function (x) { return x.t !== t; });
  Object.keys(S.logs).forEach(function (idEx) {
    S.logs[idEx] = S.logs[idEx].filter(function (l) { return l.sid !== m.sid; });
    if (!S.logs[idEx].length) delete S.logs[idEx];   // exercício sem histórico sai do mapa
  });

  view.sessao = null;
  await save(); render(); window.scrollTo(0, 0);
  toast(series ? 'Treino e séries apagados.' : 'Registro apagado.');
}

/**
 * Corrige o tempo de um treino já registrado.
 *
 * O caso é esquecer de finalizar: o app fecha sozinho e o tempo vai até a
 * última série, que pode ser horas depois do que se treinou de fato. Corrigir
 * marca `fim: 'manual'` — o tempo passa a ser declarado, e some o "aproximado"
 * que a tela vinha mostrando, porque agora ele não é mais estimativa.
 */
async function corrigeDuracao(t, minutos) {
  const m = S.done.filter(function (x) { return x.t === t; })[0];
  if (!m) return;
  m.dur = Math.max(1, Math.min(600, Math.round(minutos))) * 60000;
  m.fim = 'manual';
  m.m = Date.now();                    // carimbo: é ele que a fusão compara
  view.sessao = m;
  await save(); render();
  toast('Tempo corrigido.');
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

function abrirRetro(){ view.retro = true; view.sessao = null; render(); window.scrollTo(0,0); }
function fecharRetro(){ view.retro = false; render(); window.scrollTo(0,0); }

async function wipe() {
  if (!confirm('Apagar todo o histórico? Isso não tem volta.')) return;
  // apagar o histórico não apaga o programa: os exercícios que ele cadastrou
  // e as mudanças que promoveu ao oficial sobrevivem
  S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[],
        body:{ peso:[], cintura:[] }, carga:{}, export:0,
        plano:PLANO_ATUAL, prog:S.prog, rot:S.rot, ex:S.ex, mods:null, progLog:S.progLog || [],
        // A metade de comida também sobrevive: apagar histórico de TREINO não
        // é apagar o plano nutricional, do mesmo jeito que não apaga o programa.
        cadencia:S.cadencia, comida:S.comida, dia:null, ajuste:S.ajuste,
        perfManual:S.perfManual, compras:S.compras };
  // Passa pela mesma normalização do boot: é o único lugar que sabe o padrão de
  // cada campo, e reconstruir o estado à mão aqui já deixou a nutrição sem
  // catálogo uma vez.
  normalizaEstado();
  montaCatalogo();
  try { await DB.delete(KEY); } catch(e){}
  // A velha vai junto. Deixá-la seria a migração do boot ressuscitar amanhã
  // exatamente o histórico que ele acabou de mandar apagar.
  try { await DB.delete(KEY_LEGADO); } catch(e){}
  view.day='A'; view.aba='treino'; view.open=null; view.hist=null; view.json=null; view.paste=false;
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

// O cronômetro de descanso vive FORA da árvore do Preact, em `index.html`:
// ele repinta 4× por segundo e redesenhar a tela nesse ritmo roubaria o foco
// do campo que ele está preenchendo no meio da série. O botão de parar era o
// último `onclick=` do projeto; agora é `addEventListener`, como todo o resto.
function ligaBotaoDoTimer() {
  const b = document.getElementById('tstop');
  if (b) b.addEventListener('click', function () { stopTimer(); });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ligaBotaoDoTimer);
} else {
  ligaBotaoDoTimer();
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
  // Voltar ao app é o momento mais provável de o outro aparelho ter gravado.
  sincroniza();
});

// Reconectou: o que ficou represado sobe agora.
window.addEventListener('online', function () { sincroniza(); });

// ---------- o zoom do navegador não existe aqui ----------
// O CSS (`touch-action: pan-x pan-y` na raiz) já tira o toque duplo e a pinça
// em quase todo lugar. Estes três eventos são a parte que só o WebKit tem: o
// Safari implementa a pinça como gesto PRÓPRIO, acima do touch-action, e sem
// recusá-la aqui ela ainda passa em algumas versões.
//
// `passive: false` é obrigatório — sem isso o navegador ignora o
// preventDefault e o listener vira decoração.
['gesturestart', 'gesturechange', 'gestureend'].forEach(function (nome) {
  document.addEventListener(nome, function (e) { e.preventDefault(); }, { passive: false });
});

// ---------------------------------------------------------------------------
// A única porta que o app abre para fora de si.
//
// `eval` direto neste escopo enxerga tudo o que está declarado aqui, e é o que
// os testes de fluxo usam para chegar em `S`, `view` e nas funções internas.
// Eles rodam sobre o BUILD, não sobre o fonte; sem isto o app teria de exportar
// o próprio miolo, e seria o teste desenhando a interface do módulo.
//
// A ponte de 91 handlers globais que morava aqui ao lado morreu junto com o
// último `onclick=` do fonte: todo evento hoje é função passada por prop.
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


// ---------- as folhas ----------
// Só HOJE tem folha convertida por enquanto. As telas cheias do sistema antigo
// (programa, histórico, retrospectiva) continuam tomando a tela inteira até
// serem convertidas — é o que `emTelaCheia()` sinaliza para a shell.
function folhaAberta() {
  return (view.pilha || []).map(function (f, i) {
    if (f.k === 'refeicao') return <FolhaRefeicao key={i} ctx={CTX} id={f.id} />;
    if (f.k === 'dia') return <FolhaDia key={i} ctx={CTX} />;
    if (f.k === 'editaRefeicao') return <FolhaEditaRefeicao key={i} ctx={CTX} id={f.id} />;
    if (f.k === 'seletor') return <FolhaSeletor key={i} ctx={CTX} ref={f.ref} idx={f.idx} />;
    if (f.k === 'editaAlimento') return <FolhaEditaAlimento key={i} ctx={CTX} id={f.id} />;
    if (f.k === 'foto') return <FolhaFoto key={i} ctx={CTX} id={f.id} />;
    return null;
  });
}

// leituras que as folhas precisam
CTX.refeicao = function (id) {
  const r = planoDeComida().filter(function (x) { return x.id === id; })[0];
  if (!r) return null;
  const dia = diaDeComida();
  return {
    r: r,
    catalogo: catalogoAlimentos(),
    alta: !!dia.alta,
    escala: dia.escala[id] == null ? 1 : dia.escala[id],
    feita: !!dia.done[id]
  };
};

CTX.seletorDeDia = function () {
  const h = diaResolvido();
  const dia = diaDeComida();
  return {
    titulo: h.cadencia === 'descanso' ? 'Descanso' : 'Dia de treino',
    treino: h.treino,
    cadencia: h.cadencia,
    alta: !!dia.alta,
    procedencia: h.origem === 'registrado' ? 'você já registrou uma sessão hoje'
      : h.origem === 'aberta' ? 'há uma sessão aberta agora'
      : h.origem === 'manual' ? 'definido por você para hoje'
      : 'previsto pela cadência da semana · confirme se for diferente'
  };
};


// ---------- render ----------
// Monta a shell do Instrumento. As cinco abas são componentes; as telas cheias
// tomam o lugar da shell inteira, tab bar inclusive.
function render() {
  montaNoApp(<App ctx={CTX} />);
  ajustaRelogio();
}

// ---------- COMIDA ----------
// A biblioteca e o plano. Compras é derivada: some do estado, aparece na tela.
CTX.planoCompleto = function () {
  const cat = catalogoAlimentos();
  return planoDeComida().slice()
    .sort(function (a, b) { return a.t.localeCompare(b.t); })
    .map(function (r) {
      return Object.assign({}, r, { kcal: Math.round(totalDaRefeicao(r, cat, true).kcal) });
    });
};

/**
 * O que o plano soma, por tipo de dia.
 *
 * Dois totais e não um: refeições são condicionais — pré-treino e treino só
 * entram em dia de treino —, então um número só estaria errado metade da
 * semana. A lista já diz "só em dia de treino" em cada linha; isto fecha a
 * conta que aquelas linhas abrem.
 *
 * Fica no fim da tela porque é onde se olha depois de editar: a pergunta que
 * sobra ao mexer numa refeição é se o dia ainda fecha.
 */
CTX.resumoDoPlano = function () {
  const cat = catalogoAlimentos();
  const plano = planoDeComida();
  const comTreino = totalDoDia(plano, cat, true, false, {});
  const semTreino = totalDoDia(plano, cat, false, false, {});
  return {
    treino: {
      kcal: fmtInt(comTreino.kcal),
      macros: Math.round(comTreino.p) + ' P · ' + Math.round(comTreino.c) + ' C · ' +
              Math.round(comTreino.g) + ' G'
    },
    descanso: {
      kcal: fmtInt(semTreino.kcal),
      macros: Math.round(semTreino.p) + ' P · ' + Math.round(semTreino.c) + ' C · ' +
              Math.round(semTreino.g) + ' G'
    },
    refeicoes: plano.length
  };
};

CTX.alimentosFiltrados = function (q) {
  const cat = catalogoAlimentos();
  const termo = String(q || '').toLowerCase().trim();
  return Object.keys(cat).map(function (k) { return cat[k]; })
    .filter(function (a) { return !termo || a.n.toLowerCase().indexOf(termo) >= 0; })
    .sort(function (a, b) { return a.n.localeCompare(b.n, 'pt-BR'); });
};

CTX.compras = function () {
  const prev = previsaoDoHorizonte(cadenciaDaSemana(), S.compras.dias);
  return {
    linhas: listaDeCompras(planoDeComida(), catalogoAlimentos(), prev, 0)
      .filter(function (l) { return !S.compras.removidas[l.f]; }),
    previsao: prev,
    dias: S.compras.dias,
    comprado: S.compras.comprado
  };
};
CTX.setHorizonteCompras = function (d) { S.compras.dias = d; queueSave(); render(); };
CTX.marcaCompra = function (f) {
  if (S.compras.comprado[f]) delete S.compras.comprado[f]; else S.compras.comprado[f] = 1;
  queueSave(); render();
};
CTX.novoAlimento = function () { CTX.abreFolha({ k: 'editaAlimento', id: null }); };
CTX.editaAlimento = function (id) { CTX.abreFolha({ k: 'editaAlimento', id: id }); };

// ---------- TREINO ----------
// A tela usada dentro da academia. O número que importa — séries feitas de
// prescritas — fica no topo e não exige rolar.

/** Volume levantado hoje naquele treino. */
function volumeDoDia(d) {
  const P = treino(d);
  if (!P) return 0;
  let v = 0;
  P.ex.forEach(function (ex, i) {
    (S.logs[id(d, i)] || []).forEach(function (e) {
      if (sameDay(e.t, Date.now())) v += volOf(e);
    });
  });
  return v;
}

CTX.treino = function () {
  const h = diaResolvido();
  const d = view.day || h.treino || proximoTreino(S, ROT_BASE);
  // OBRIGATÓRIO antes de montar: o rascunho é zerado ao trocar de dia, e sem
  // hidratar os campos voltam em branco com as séries já gravadas — digitar por
  // cima apagaria o resto. Era chamado pelo render antigo; a conta veio junto.
  hidrataDraft(d);
  const P = treino(d);
  const s = S.sessao;
  const prescritas = P ? P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) : 0;
  const feitas = seriesFeitasHoje(d);

  const avisos = [];
  const trabalho = sessoesDeTrabalho();
  const faltam = 48 - (trabalho % 48);
  if (S.deload) {
    avisos.push({ k: 'dl', rotulo: 'deload ativo', cor: 'amber',
      txt: 'Metade das séries, mesmas cargas. Os placeholders continuam mostrando a carga da última semana normal.',
      acao: { t: 'sair do deload', onClick: function () { setDeload(false); } } });
  } else if (trabalho > 0 && faltam <= 6) {
    // Não é contagem regressiva para um deload obrigatório: o treinador tirou a
    // semana fixa do programa. O bloco de 48 sessões continua sendo o momento de
    // OLHAR, e quem decide é a evidência de fadiga, não o calendário.
    avisos.push({ k: 'dl2', rotulo: 'fim de bloco chegando', cor: '',
      txt: 'Faltam ' + faltam + ' sessões para fechar o bloco. Deload só se houver evidência de fadiga: força caindo por 2 a 3 sessões, dor que não passa em 72 h, RIR difícil de manter. Progredindo bem, siga treinando.',
      acao: { t: 'entrar em deload', onClick: function () { setDeload(true); } } });
  }
  // Preenchendo um treino de outra data: o aviso é o único lugar que diz para
  // onde as séries digitadas estão indo, e carrega a porta de saída. Sem ele o
  // app fica preso numa sessão retroativa sem nada na tela explicando por quê.
  if (s && s.retro) {
    avisos.push({ k: 'r', rotulo: 'preenchendo treino passado', cor: 'amber',
      txt: 'As séries que você digitar entram em ' + diaExtenso(s.inicio) + ', não em hoje.',
      acao: { t: 'concluir', onClick: function () { concluirRetro(); } } });
  }

  const parado = pausaGeral();
  if (parado >= PAUSA_DIAS) {
    avisos.push({ k: 'p', rotulo: 'volta de pausa', cor: 'amber',
      txt: Math.round(parado) + ' dias desde o último treino salvo. O selo de subir carga fica suspenso nesta volta; os placeholders continuam mostrando a última carga registrada.' });
  }

  const dif = difTotal();
  return {
    dia: d,
    nome: P ? P.name : '—',
    olho: P ? P.tag.toUpperCase() : '',
    feitas: feitas,
    prescritas: prescritas,
    volume: fmtK(volumeDoDia(d)),
    ciclo: String(Math.floor(S.done.length / rot().length) + 1),
    sessoes: S.done.length,
    sessaoAberta: !!s,
    pausada: !!(s && s.pausadoEm),
    podeEditar: podeEditar(d),
    proximo: proximoTreino(S, ROT_BASE),
    rotacao: rot().map(function (x) {
      return { k: x, t: x, on: x === d, proximo: x === proximoTreino(S, ROT_BASE) };
    }),
    diffTxt: dif ? dif + (dif === 1 ? ' diferença do treinador' : ' diferenças do treinador') : 'igual ao treinador',

    editando: !!(view.editProg && podeEditar(d)),
    avisos: avisos,
    exercicios: P ? P.ex.map(function (ex, i) {
      return Object.assign(vmExercicio(d, i, ex), { id: id(d, i) });
    }) : []
  };
};

CTX.sessaoAberta = function () {
  const s = S.sessao;
  if (!s) return null;
  return { duracao: fmtDur(duracaoAtual(s)), pausada: !!s.pausadoEm };
};
CTX.acoesEx = ACOES;
CTX.vaiParaDia = function (d) { go(d); };
CTX.iniciarSessao = function () { iniciarSessao(); };
CTX.pausarSessao = function () { pausarSessao(); };
CTX.retomarSessao = function () { retomarSessao(); };
CTX.finalizarSessao = function () { finalizarSessao(); };
CTX.modoEdicao = function () { modoEdicao(true); };
CTX.abrePrograma = function () { abrirPrograma(null); };
CTX.abreHistorico = function () { openHist(0); };

// ---------- DADOS ----------
CTX.dados = function () {
  const t = tendenciaDeForca(S.logs, function (k) { return exDe(k).u === 'seg'; });
  const v = veredito();
  const alvo = ajusteDoVeredito(v);

  // e1RM da semana, somando o melhor de cada exercício: é a curva que responde
  // "estou ficando mais forte", e não a de um exercício só — que oscila com
  // troca de aparelho e com o dia.
  const porSemana = [];
  for (let i = 13; i >= 0; i--) {
    const fim = weekStart(Date.now()) - (i - 1) * 7 * 86400000;
    const ini = fim - 7 * 86400000;
    let soma = 0;
    Object.keys(S.logs).forEach(function (k) {
      if (exDe(k).u === 'seg') return;
      const janela = (S.logs[k] || []).filter(function (e) { return e.t >= ini && e.t < fim; });
      if (!janela.length) return;
      soma += Math.max.apply(null, janela.map(function (e) {
        return e.sets.reduce(function (m, s) {
          return s && s[0] > 0 && s[1] > 0 ? Math.max(m, s[0] * (1 + s[1] / 30)) : m;
        }, 0);
      }));
    });
    porSemana.push(soma > 0 ? Math.round(soma) : null);
  }

  return {
    veredito: {
      t: v.t, p: v.p,
      cor: (v.k === 'menos' || v.k === 'observar') ? 'amber' : v.k === 'faltam' ? 't4' : 'acid',
      podeAplicar: alvo !== S.ajuste && v.k !== 'faltam',
      acaoTxt: alvo > 0 ? 'aplicar +150 kcal' : alvo < 0 ? 'aplicar −150 kcal' : 'voltar ao plano base',
      estado: (S.ajuste === 0 ? 'plano atual' : S.ajuste > 0 ? 'ajuste +150 kcal' : 'ajuste −150 kcal') +
              ' · arroz ' + arrozAtual() + ' g'
    },
    forca: {
      serie: porSemana,
      agora: t.ok ? Math.round(t.agora) + ' kg' : '—',
      delta: t.ok ? (t.delta >= 0 ? '+' : '−') + (Math.abs(t.delta) * 100).toFixed(1).replace('.', ',') + '%' : '—',
      cor: t.ok ? (t.subindo ? 'ins-acid' : 'ins-amber') : '',
      txt: textoDaTendencia(t, S.perfManual),
      opcoes: [
        { k: 'auto', t: 'o app decide', v: null, on: S.perfManual == null },
        { k: 'sim', t: 'está subindo', v: true, on: S.perfManual === true },
        { k: 'nao', t: 'não está', v: false, on: S.perfManual === false }
      ]
    },

  };
};

CTX.setPerfManual = function (v) { S.perfManual = v; queueSave(); render(); };
CTX.aplicaAjuste = function () {
  const antes = S.ajuste;
  S.ajuste = ajusteDoVeredito(veredito());
  aplicaArroz(antes);
  queueSave(); render();
  toast('Ajuste aplicado. O arroz do plano foi para ' + arrozAtual() + ' g.');
};

// ---------- GUIA ----------
CTX.guia = function () {
  const cat = catalogoAlimentos();
  const plano = planoDeComida();
  const dTreino = totalDoDia(plano, cat, true, false);
  const dFolga = totalDoDia(plano, cat, false, false);
  return {
    cadencia: cadenciaDaSemana(),
    rotacao: rot().join(' → '),
    alvos: [
      { k: 't', t: 'Dia de treino', s: 'com pré-treino e intra-treino',
        v: Math.round(dTreino.kcal) + ' kcal' },
      { k: 'd', t: 'Dia de descanso', s: 'sem as refeições de treino',
        v: Math.round(dFolga.kcal) + ' kcal' }
    ],
    regras: RULES
  };
};

CTX.alternaCadencia = function (i) {
  const c = cadenciaDaSemana().slice();
  c[i] = c[i] === 'treino' ? 'descanso' : 'treino';
  S.cadencia = c;
  queueSave(); render();
};

CTX.restauraPrograma = function () { restaurarTudo(); };
CTX.restauraPlano = function () {
  if (!confirm('Restaurar o plano do nutricionista?\n\nSeus alimentos cadastrados e todo o histórico ficam. Volta só a prescrição.')) return;
  S.comida.plano = JSON.parse(JSON.stringify(PLANO_BASE));
  S.ajuste = 0;
  queueSave(); render();
  toast('Plano nutricional restaurado.');
};

// ---------- DADOS ----------

/** Série da média semanal, para a sparkline. */
function serieSemanal(marcas, semanas) {
  const base = weekStart(Date.now());
  const W = mediasSemanais(marcas);
  const saida = [];
  for (let i = semanas - 1; i >= 0; i--) {
    const w = base - i * 7 * 86400000;
    const achou = W.filter(function (x) { return x.w === w; })[0];
    saida.push(achou ? Math.round(achou.v * 10) / 10 : null);
  }
  return saida;
}

// As últimas medidas, com a data — a lista existe para corrigir: digitou 743
// no lugar de 74,3 e só percebeu depois. Sem ela, o erro entra na média da
// semana e não sai mais.
function medidasRecentes(k, un) {
  return S.body[k].slice(-4).slice().sort(function (a, b) { return b.t - a.t; })
    .map(function (x) {
      return { t: x.t, data: fmtDate(x.t), valor: fmtDec(x.v) + ' ' + un };
    });
}

CTX.corpo = function () {
  const r = pesoRitmo();
  const c = cinturaMes();
  const ultimaCint = baseDoCorpo('cintura');
  // a tela precisa de um número para desenhar: rascunho ilegível cai na referência
  const vPeso = valorDoCorpo('peso'), vCint = valorDoCorpo('cintura');
  const semana = weekStart(Date.now());
  const naSemana = S.body.peso.filter(function (x) { return x.t >= semana; }).length;

  return {
    peso: {
      valor: isNaN(vPeso) ? baseDoCorpo('peso') : vPeso,
      serie: serieSemanal(S.body.peso, 14),
      media: r.ok ? fmtDec(r.last.v) + ' kg' : '—',
      ritmo: (r.ok && r.duasSemanas) ? fmtSig2(r.kgSem) : '—',
      ritmoCor: (r.ok && r.duasSemanas)
        ? (r.kgSem >= 0.15 && r.kgSem <= 0.4 ? 'ins-acid' : 'ins-amber') : '',
      nota: naSemana + (naSemana === 1 ? ' pesagem nesta semana' : ' pesagens nesta semana'),
      alvo: 'registre 3 a 4 por semana',
      acao: acaoDaMedida('peso'),
      dia: diaDaMedidaVM('peso'),
      medidas: medidasRecentes('peso', 'kg')
    },
    cintura: {
      valor: isNaN(vCint) ? ultimaCint : vCint,
      serie: serieSemanal(S.body.cintura, 14),
      atual: S.body.cintura.length ? fmtDec(ultimaCint) + ' cm' : '–',
      // Duas coisas separadas, e antes eram uma só: a célula de métrica quer
      // um NÚMERO, a procedência quer a FRASE. A tela cortava a frase no
      // primeiro espaço para preencher a célula e escrevia "faltam" onde
      // devia estar a variação em centímetros.
      mesValor: c ? fmtSig2(c.mes) : '–',
      mes: c ? fmtSig2(c.mes) + ' cm no mês' : 'faltam 3 semanas de medida para concluir',
      acao: acaoDaMedida('cintura'),
      dia: diaDaMedidaVM('cintura'),
      medidas: medidasRecentes('cintura', 'cm')
    },
    cardio: {
      semana: cardioSemana().length,
      alvo: CARDIO_ALVO,
      perna: pernaHoje(),
      // A lista da semana existe para uma coisa só: desfazer. Registrou 25 min
      // de bike duas vezes por engano, e sem isso o número da semana fica
      // errado para sempre — não há outra porta para apagar um registro.
      sessoes: cardioSemana().map(function (x) {
        return { t: x.t, data: fmtDate(x.t), modal: x.m, resumo: x.min + ' min · ' + x.i };
      }),
      regra: 'segunda, depois do A: 20 a 25 min · quinta, depois do D: 25 a 30 min. Leve a moderado: respirando mais forte, mas ainda dando para conversar. Evite antes de B ou do HYROX, e nunca antes do treino.'
    },
    musculos: CTX.musculos()
  };
};

CTX.musculos = function () {
  const semana = weekStart(Date.now());
  const janela = 4;
  const decorrido = Date.now() - semana;
  const atual = seriesPorMusculo(semana, Date.now() + 1);
  const antes = seriesPorMusculo(semana - janela * 7 * 86400000, semana, decorrido);
  const temHistorico = Object.keys(antes).length > 0;

  const nomes = {};
  rot().forEach(function (d) {
    treino(d).ex.forEach(function (ex) { if (ex.g) nomes[ex.g] = 1; });
  });
  Object.keys(atual).forEach(function (g) { if (g) nomes[g] = 1; });

  const lista = Object.keys(nomes).sort(function (a, b) {
    const na = NIVEIS.indexOf(nivelDe(a)), nb = NIVEIS.indexOf(nivelDe(b));
    if (na !== nb) return na - nb;
    const pa = PRIO.indexOf(a), pb = PRIO.indexOf(b);
    if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    return a.localeCompare(b, 'pt-BR');
  });
  const max = Math.max(1, Math.max.apply(null, lista.map(function (g) {
    return Math.max(atual[g] || 0, (antes[g] || 0) / janela);
  })));

  // Treino avulso é presença sem série registrada: sem este aviso, o número
  // da semana pareceria completo quando não é.
  const avulsos = S.done.filter(function (x) { return x.livre && x.t >= semana; });
  const grupos = Object.keys(avulsos.reduce(function (a, x) {
    (x.grupos || []).forEach(function (g) { a[g] = 1; });
    return a;
  }, {}));

  return {
    dia: Math.min(7, Math.floor(decorrido / 86400000) + 1),
    janela: janela,
    avulsos: avulsos.length,
    avulsosTxt: avulsos.length
      ? avulsos.length + (avulsos.length === 1
          ? ' treino avulso nesta semana não entra' : ' treinos avulsos nesta semana não entram') +
        ' nesta contagem, porque não ' + (avulsos.length === 1 ? 'tem' : 'têm') +
        ' série registrada: ' + grupos.join(', ') + '.'
      : null,
    temHistorico: temHistorico,
    fora: lista.map(impactoOficial).filter(Boolean),
    linhas: lista.map(function (g) {
      const n = atual[g] || 0;
      const m = temHistorico ? (antes[g] || 0) / janela : null;
      const nivel = nivelDe(g);
      const dif = (m !== null && m >= 1) ? Math.round((n - m) / m * 100) : null;
      return {
        g: g, n: n, pct: Math.min(100, n / max * 100),
        prio: nivel === 'maxima',
        // sem o prefixo 'prioridade': a 9px na coluna de 104px ele quebrava em
        // duas linhas e engordava toda linha de músculo secundário. A string
        // completa continua em PRIORIDADES, que é o que os documentos geram.
        rot: (PRIORIDADES[nivel].rot || '').replace(/^prioridade /, '') || null,
        media: m !== null ? fmtDec(m) : null,
        dif: dif, difCor: dif === null ? '' : dif > 0 ? 'ins-acid' : dif < -25 ? 'ins-amber' : ''
      };
    })
  };
};

CTX.setPeso = function (v) { view.bodyForm = Object.assign({}, view.bodyForm, { peso: v }); render(); };
CTX.setCintura = function (v) { view.bodyForm = Object.assign({}, view.bodyForm, { cintura: v }); render(); };
CTX.abreDiaCorpo = function (k) { view.bodyDiaAberto = view.bodyDiaAberto === k ? null : k; render(); };
CTX.setDiaCorpo = function (k, iso) {
  // 'YYYY-MM-DD' parseado como data LOCAL: `new Date(iso)` leria como UTC e no
  // Brasil cairia no dia anterior.
  const p = String(iso).split('-').map(Number);
  if (p.length !== 3 || !p[0]) return;
  const d = new Date(p[0], p[1] - 1, p[2], 7, 0, 0, 0);
  if (isNaN(d.getTime()) || d.getTime() > Date.now()) return;
  view.bodyDia = Object.assign({}, view.bodyDia, { [k]: d.getTime() });
  // trocar de dia troca a referência do stepper: o valor a corrigir é o
  // daquele dia, não o da última pesagem
  view.bodyForm = Object.assign({}, view.bodyForm);
  delete view.bodyForm[k];
  render();
};
CTX.registraPeso = function () { addBody('peso'); };
CTX.registraCintura = function () { addBody('cintura'); };
CTX.apagaMedida = function (k, t) { delBody(k, t); };
CTX.apagaCardio = function (t) { delCardio(t); };
CTX.abreCardio = function () { abrirCardioRapido(); };

// ---------- edição de COMIDA ----------
// Lei 3 do sistema: não existe modo de edição. Toda refeição carrega o próprio
// `···`, e todo item dentro dela expande no lugar. Lei 4: o destrutivo vive um
// nível para dentro — dentro do editor, em coral, nunca na lista.
//
// A distinção que mais importa aqui é a lei 6, e ela é a diferença entre um app
// de dieta que se entende e um que não: mexer na QUANTIDADE de um item muda o
// plano para todo dia; o controle de porção da folha de refeição é "só de hoje"
// e zera com a data. As duas coisas moram em telas diferentes de propósito, e
// cada uma diz na tela qual é.

/** A pilha de folhas. Três níveis, nunca mais. */
function pilha() { return view.pilha || (view.pilha = []); }

CTX.abreFolha = function (f) { pilha().push(f); render(); };
CTX.fechaFolha = function () { pilha().pop(); render(); };
CTX.fechaTudo = function () { view.pilha = []; render(); };

/** Um id de alimento a partir do nome, igual ao dos exercícios. */
function idAlimento(nome) {
  const base = slugEx(nome) || 'alimento';
  let id = base, n = 2;
  const cat = catalogoAlimentos();
  while (cat[id]) id = base + '-' + n++;
  return id;
}

function achaRefeicao(id) {
  return planoDeComida().filter(function (r) { return r.id === id; })[0] || null;
}

// ---- refeição ----

CTX.refeicaoParaEditar = function (id) {
  const r = id ? achaRefeicao(id) : null;
  const cat = catalogoAlimentos();
  return {
    novo: !r,
    id: r ? r.id : null,
    n: r ? r.n : '',
    t: r ? r.t : '12:00',
    tag: r ? r.tag : '',
    quando: r ? r.quando : 'sempre',
    nota: r ? (r.nota || '') : '',
    itens: r ? r.itens.map(function (i, idx) {
      const a = cat[i.f];
      return {
        idx: idx, f: i.f, q: i.q, alta: !!i.alta, arroz: !!i.arroz,
        n: a ? a.n : i.f, u: a ? a.u : 'g', sumido: !a
      };
    }) : []
  };
};

CTX.salvaRefeicao = function (id, campos) {
  const plano = planoDeComida();
  let r = id ? achaRefeicao(id) : null;
  if (!r) {
    r = { id: 'r' + Date.now(), t: '12:00', n: '', tag: '', quando: 'sempre', nota: '', itens: [] };
    plano.push(r);
  }
  Object.assign(r, campos);
  if (!r.n) r.n = 'Refeição';
  queueSave(); render();
};

CTX.duplicaRefeicao = function (id) {
  const r = achaRefeicao(id);
  if (!r) return;
  const copia = JSON.parse(JSON.stringify(r));
  copia.id = 'r' + Date.now();
  copia.n = r.n + ' (cópia)';
  planoDeComida().push(copia);
  CTX.fechaFolha();
  queueSave(); render();
  toast('Refeição duplicada.');
};

CTX.removeRefeicao = function (id) {
  const r = achaRefeicao(id);
  if (!r) return;
  if (!confirm('Remover "' + r.n + '" do plano?\n\nIsso vale para todo dia. O histórico do que você já marcou não muda.')) return;
  const plano = planoDeComida();
  plano.splice(plano.indexOf(r), 1);
  const dia = diaDeComida();
  delete dia.done[id];
  delete dia.escala[id];
  CTX.fechaTudo();
  queueSave(); render();
  toast('Refeição removida do plano.');
};

// ---- item dentro da refeição ----

CTX.setQuantidade = function (refId, idx, q) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  r.itens[idx].q = Math.max(0, Math.round(q));
  queueSave(); render();
};

CTX.removeItem = function (refId, idx) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  r.itens.splice(idx, 1);
  queueSave(); render();
};

CTX.alternaAlta = function (refId, idx) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  if (r.itens[idx].alta) delete r.itens[idx].alta; else r.itens[idx].alta = true;
  queueSave(); render();
};

CTX.adicionaItem = function (refId, foodId) {
  const r = achaRefeicao(refId);
  if (!r) return;
  r.itens.push({ f: foodId, q: 100 });
  CTX.fechaFolha();
  queueSave(); render();
};

CTX.trocaItem = function (refId, idx, foodId) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  r.itens[idx].f = foodId;
  CTX.fechaFolha();
  queueSave(); render();
};

// ---- alimento ----

CTX.alimentoParaEditar = function (id) {
  const cat = catalogoAlimentos();
  const a = id ? cat[id] : null;
  return {
    novo: !a,
    id: a ? id : null,
    n: a ? a.n : '',
    cat: a ? a.cat : 'mercearia',
    u: a ? a.u : 'g',
    kcal: a ? a.kcal : 0, p: a ? a.p : 0, c: a ? a.c : 0, g: a ? a.g : 0,
    cru: a ? a.cru : 0,
    meu: !!(a && a.meu),
    /** true quando o alimento veio da prescrição: dá para editar, não apagar */
    daPrescricao: !!(a && ALIMENTOS_BASE[id])
  };
};

CTX.salvaAlimento = function (id, campos) {
  const alvo = id || idAlimento(campos.n);
  const base = ALIMENTOS_BASE[alvo];
  S.comida.alimentos[alvo] = Object.assign(
    {}, S.comida.alimentos[alvo] || {}, campos,
    base ? {} : { meu: 1 }
  );
  delete S.comida.ocultos[alvo];
  CTX.fechaFolha();
  queueSave(); render();
  toast(id ? 'Alimento atualizado.' : 'Alimento cadastrado.');
  return alvo;
};

CTX.removeAlimento = function (id) {
  const cat = catalogoAlimentos();
  const a = cat[id];
  if (!a) return;
  // Um alimento em uso não pode sumir sem aviso: o plano ficaria apontando
  // para um id órfão, e o total do dia mudaria sem explicação.
  const usos = planoDeComida().filter(function (r) {
    return r.itens.some(function (i) { return i.f === id; });
  });
  const aviso = usos.length
    ? '\n\nEle está em ' + usos.length + (usos.length === 1 ? ' refeição' : ' refeições') +
      ': ' + usos.map(function (r) { return r.n; }).join(', ') + '. Vai sair de lá também.'
    : '';
  if (!confirm('Remover "' + a.n + '" da biblioteca?' + aviso)) return;

  planoDeComida().forEach(function (r) {
    r.itens = r.itens.filter(function (i) { return i.f !== id; });
  });
  if (ALIMENTOS_BASE[id]) S.comida.ocultos[id] = 1;   // da prescrição: esconde
  delete S.comida.alimentos[id];                       // dele: apaga
  CTX.fechaTudo();
  queueSave(); render();
  toast('Alimento removido.');
};

CTX.alimentosParaSeletor = function (q) {
  return CTX.alimentosFiltrados(q);
};

// ---------- GUIA: a área de dados ----------
CTX.foto = function (id) {
  if (!id) return null;
  const ref = S.fotos[id] || null;
  return {
    nome: exDe(id).n,
    url: FOTO.urlDaFoto(id, ref),
    tem: !!ref,
    // o cue do treinador desce junto: quem abre a foto está com dúvida de
    // execução, e a frase dele é mais precisa que a imagem no que varia
    cue: exDe(id).cue || null
  };
};
CTX.tiraFoto = function (el) { tiraFoto(el); };
CTX.apagaFoto = function () { apagaFoto(); };

CTX.nuvem = function () {
  const ses = NUVEM.sessao();
  const f = view.nuvemForm || {};
  if (!ses) {
    return {
      dentro: false, email: f.email || '', senha: f.senha || '',
      erro: view.nuvemErro || null, rodando: !!view.nuvemEntrando
    };
  }
  const quando = sync.em ? fmtDate(sync.em) + ' às ' + fmtHora(sync.em) : null;
  return {
    dentro: true,
    conta: ses.email,
    explica: 'O mesmo registro em todo aparelho onde você entrar. Sincroniza ao abrir, ao voltar para o app e alguns segundos depois de cada mudança.',
    rodando: sync.rodando,
    estado: sync.rodando ? 'sincronizando...'
          : sync.erro ? sync.erro
          : sync.sujo ? 'há mudanças para enviar'
          : quando ? 'em dia · ' + quando
          : 'ainda não sincronizou',
    cor: sync.erro ? 'ins-amber' : (sync.sujo || !quando) ? '' : 'ins-acid'
  };
};

CTX.nuvemCampo = function (k, v) {
  view.nuvemForm = Object.assign({}, view.nuvemForm, { [k]: v });
  view.nuvemErro = null;
  render();
};

CTX.entrarNaNuvem = async function () {
  const f = view.nuvemForm || {};
  const email = String(f.email || '').trim();
  if (!email || !f.senha) { view.nuvemErro = 'preencha e-mail e senha'; render(); return; }
  view.nuvemEntrando = true; view.nuvemErro = null; render();
  const r = await NUVEM.entrar(email, f.senha);
  view.nuvemEntrando = false;
  if (!r.ok) { view.nuvemErro = r.msg; render(); return; }
  // a senha não fica pendurada na memória da tela depois de usada
  view.nuvemForm = null;
  // primeiro login neste aparelho: nada foi visto ainda, então tudo se funde
  sync.v = null; sync.sujo = true;
  gravaSync(); render();
  toast('Conectado como ' + r.v.email + '.');
  sincroniza({ manual: true });
};

CTX.sairDaNuvem = async function () {
  if (!confirm('Sair da conta neste aparelho?\n\nO histórico continua aqui. Só para de sincronizar.')) return;
  await NUVEM.sair();
  sync.v = null; sync.em = 0; sync.sujo = false; sync.erro = null;
  gravaSync(); render();
  toast('Desconectado. O histórico continua neste aparelho.');
};

CTX.sincronizaAgora = function () { sincroniza({ manual: true }); };

CTX.dadosDoApp = function () {
  const nEx = Object.keys(S.logs).length;
  const sb = diasSemBackup();
  const dif = difTotal();
  const plural = function (n, um, muitos) { return n + ' ' + (n === 1 ? um : muitos); };
  return {
    cobraBackup: sb >= 30 && S.done.length > 0,
    backupTxt: S.export
      ? Math.round(sb) + ' dias desde o último backup.'
      : 'Você nunca exportou o histórico.',
    difTxt: dif ? dif + ' ' + (dif === 1 ? 'diferença' : 'diferenças') + ' do treinador' : null,
    treinos: rot().length,
    json: view.json,
    colando: !!view.paste,
    deload: S.deload,
    onde: STORE_LABEL[DB.mode] || 'verificando',
    resumo: [
      plural(S.done.length, 'sessão registrada', 'sessões registradas'),
      plural(nEx, 'exercício com histórico', 'exercícios com histórico'),
      plural(S.cardio.length, 'sessão de cardio', 'sessões de cardio'),
      plural(S.body.peso.length, 'pesagem', 'pesagens'),
      plural(S.body.cintura.length, 'medida de cintura', 'medidas de cintura')
    ].join(' · ')
  };
};
CTX.exportar = function () { exportData(); };
CTX.mostraJSON = function () { showJSON(); };
CTX.copiaJSON = function () { copyJSON(); };
CTX.alternaColar = function () { pasteJSON(); };
CTX.importaTexto = function (txt) { importText(txt); };
CTX.importaArquivo = function (input) { importFile(input); };
CTX.abreRetro = function () { abrirRetro(); };
CTX.setDeload = function (v) { setDeload(v); };
CTX.apagaTudo = function () { wipe(); };

// ---------- TREINO: o cromo da sessão ----------

CTX.cromoDoTreino = function () {
  const s = S.sessao;
  const ini = weekStart(Date.now());
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const dia = ini + i * 86400000;
    const marcas = sessoesDoDia(dia);
    const hoje = sameDay(dia, Date.now());
    const futuro = dia > Date.now() && !hoje;
    const folga = !marcas.length && ehDescanso(dia);
    semana.push({
      d: DIAS_CURTOS[i],
      // '+' é convite: "registre aqui". Em dia de descanso ele mentiria, porque
      // não há o que registrar — o traço diz vazio DE PROPÓSITO.
      v: marcas.length ? marcas.map(marcaDe).join('') : (folga ? '–' : '+'),
      descanso: folga,
      feito: marcas.length > 0,
      livre: marcas.length > 0 && marcas.every(function (m) { return m.livre; }),
      hoje: hoje,
      futuro: futuro,
      cardio: cardioDoDia(dia).length > 0,
      // sem ação no futuro: lançar treino que ainda não aconteceu não faz sentido
      // Um dia pode ter DUAS sessões — registrar o treino errado e depois o
      // certo é o jeito mais comum de chegar nisso, e a célula já mostra as
      // duas letras. Abrir a última em silêncio deixava a outra inalcançável:
      // com mais de uma, a célula leva à LISTA, onde elas estão lado a lado.
      abre: marcas.length > 1 ? { k: 'dia', t: dia }
           : marcas.length ? { k: 'sessao', t: marcas[marcas.length - 1].t }
           : futuro ? null : { k: 'lancar', t: dia }
    });
  }

  const hojeCardio = cardioDoDia(Date.now());
  return {
    sessao: s && !s.retro ? {
      relogio: relogioTexto(s),
      pausada: !!s.pausadoEm,
      desde: s.pausadoEm ? 'pausado' : 'desde ' + fmtHora(s.inicio)
    } : null,
    semana: semana,
    cardio: (function () {
      const f = Object.assign({ m: 'bike', min: 25, i: 'moderado' }, view.cardioForm);
      const perna = pernaHoje();
      return {
        feito: hojeCardio.length > 0,
        resumo: hojeCardio.length
          ? hojeCardio.map(function (c) { return c.min + ' min de ' + c.m; }).join(' · ')
          : cardioSemana().length + ' de ' + CARDIO_ALVO + ' nesta semana',
        aberto: !!view.cardioRapido,
        modais: MODAIS.map(function (m) { return { k: m, t: m, on: f.m === m }; }),
        minutos: [20, 25, 30, 40].map(function (v) { return { k: v, t: v + ' min', on: f.min === v }; }),
        intensidades: ['leve', 'moderado'].map(function (v) { return { k: v, t: v, on: f.i === v }; }),
        // O aviso não bloqueia: sinaliza. A regra é do treinador, e quem decide
        // se hoje ainda dá é ele, não o app.
        aviso: perna.length
          ? 'Você treinou ' + perna.join(' e ') + ' hoje. A regra é não pôr cardio no mesmo período de treino de perna.'
          : null,
        acao: 'registrar ' + f.min + ' min de ' + f.m
      };
    })()
  };
};

let destaqueT = null;

CTX.abreSessaoDoDia = function (a) {
  if (!a) return;
  if (a.k === 'sessao') { abrirSessao(a.t); return; }
  if (a.k === 'dia') { levaAsSessoesDoDia(a.t); return; }
  abrirAdicionar(a.t);
};

/**
 * Leva às sessões daquele dia, na lista do mês.
 *
 * NÃO abre nenhuma: com duas no mesmo dia, escolher por ele seria escolher
 * errado metade das vezes. A lista já traz as duas com data, horário e letra —
 * o que faltava era chegar nela sabendo quais linhas olhar.
 *
 * Vai para DADOS porque é lá que existe lista de dia; a tira da semana do
 * treino mostra o dia, mas não o desdobra. E leva o mês junto, senão a lista
 * mostraria outro mês que não o do dia tocado.
 *
 * O destaque se apaga sozinho: é empurrão de atenção, não estado.
 */
function levaAsSessoesDoDia(t) {
  const d = new Date(t), agora = new Date(Date.now());
  view.aba = 'dados';
  view.mes = (d.getFullYear() - agora.getFullYear()) * 12 + (d.getMonth() - agora.getMonth());
  view.destacaDia = t;
  render();

  const alvo = document.querySelector('.sessrow.destacada');
  if (alvo) {
    const parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    alvo.scrollIntoView({ behavior: parado ? 'auto' : 'smooth', block: 'center' });
  }
  clearTimeout(destaqueT);
  destaqueT = setTimeout(function () { view.destacaDia = null; render(); }, 2600);
}
CTX.cardioSet = function (k, v) { cardioSet(k, v); };
CTX.addCardio = function () { addCardio(); };

// ---------- DADOS: o calendário do mês ----------
// Grade de fios por natureza: sete colunas, uma célula por dia. O marcador de
// período é a ÚNICA exceção autorizada à regra de não usar emoji, e por isso
// vive isolado em PERIODOS — inclusive fora deste comentário, que citá-lo
// aqui já bastou para reprovar o teste que guarda a regra.

CTX.mes = function () {
  const ref = mesRef();
  const ini = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  const offset = ini.getDay();                        // domingo como primeira coluna
  const dias = Math.round((fim - ini) / 86400000);
  const t = totaisDoPeriodo(ini.getTime(), fim.getTime());
  const med = mediaSemanal();
  const cardMes = S.cardio.filter(function (c) { return c.t >= ini.getTime() && c.t < fim.getTime(); });

  const celulas = [];
  for (let i = 0; i < dias; i++) {
    const dia = ini.getTime() + i * 86400000;
    const marcas = sessoesDoDia(dia);
    const hoje = sameDay(dia, Date.now());
    const futuro = dia > Date.now() && !hoje;
    const livre = marcas.length > 0 && marcas.every(function (m) { return m.livre; });
    // periodoNaCelula devolve HTML para o render antigo; aqui o componente
    // precisa do objeto, então a busca é feita direto.
    let per = null;
    for (let j = 0; j < marcas.length && !per; j++) per = periodoDaSessao(marcas[j]);
    celulas.push({
      n: i + 1,
      // a letra do treino manda na célula; o número do dia é contexto
      marca: marcas.length ? marcas.map(marcaDe).join('') : (ehDescanso(dia) ? '–' : null),
      feito: marcas.length > 0, livre: livre, hoje: hoje, futuro: futuro,
      descanso: !marcas.length && ehDescanso(dia),
      cardio: cardioDoDia(dia).length > 0,
      periodo: per ? { k: per.k, rot: per.rot } : null,
      // Um dia pode ter DUAS sessões — registrar o treino errado e depois o
      // certo é o jeito mais comum de chegar nisso, e a célula já mostra as
      // duas letras. Abrir a última em silêncio deixava a outra inalcançável:
      // com mais de uma, a célula leva à LISTA, onde elas estão lado a lado.
      abre: marcas.length > 1 ? { k: 'dia', t: dia }
           : marcas.length ? { k: 'sessao', t: marcas[marcas.length - 1].t }
           : futuro ? null : { k: 'lancar', t: dia }
    });
  }

  const sessoes = S.done
    .filter(function (m) { return m.t >= ini.getTime() && m.t < fim.getTime(); })
    .slice().reverse()
    .map(function (m) {
      const nSets = m.livre ? 0 : Object.keys(S.logs).reduce(function (n, k) {
        return n + (S.logs[k] || []).filter(function (e) { return e.sid === m.sid; })
                    .reduce(function (x, e) { return x + e.sets.filter(Boolean).length; }, 0);
      }, 0);
      return {
        t: m.t,
        destacada: view.destacaDia != null && sameDay(m.t, view.destacaDia),
        data: fmtDate(m.t),
        hora: horaDaSessao(m),
        marca: marcaDe(m),
        livre: !!m.livre,
        desc: m.livre
          ? ((m.grupos || []).join(', ') || 'treino avulso')
          : [m.dur ? fmtDur(m.dur) : null, nSets ? nSets + ' séries' : null].filter(Boolean).join(' · '),
        aprox: !m.livre && !!m.dur && m.fim !== 'manual',
        aberta: !!(S.sessao && S.sessao.sid === m.sid),
        cardio: cardioDoDia(m.t).length > 0
      };
    });

  return {
    titulo: MESES[ref.getMonth()] + ' ' + ref.getFullYear(),
    podeAvancar: view.mes < 0,
    offset: offset,
    dias: DIAS_CURTOS,
    celulas: celulas,
    periodos: PERIODOS.map(function (p) { return { k: p.k, rot: p.rot, nome: p.nome }; }),
    stats: [
      { k: 'd', rotulo: 'dias', valor: String(t.dias) },
      // a média de duração vinha no rótulo do total; sem ela, 7h48 não diz se
      // foram sessões longas ou muitas sessões
      { k: 't', rotulo: 'tempo total', valor: t.tempo ? fmtDur(t.tempo) : '–',
        nota: t.comTempo ? 'méd ' + fmtDur(t.tempo / t.comTempo) : null },
      { k: 'v', rotulo: 'volume', valor: fmtK(t.vol) }
    ],
    media: med !== null ? fmtDec(med) : null,
    cardio: cardMes.length ? (function () {
      // Cardio em dia sem musculação conta separado: é o que o plano pede
      // (não competir com a recuperação), e some se for só um número total.
      const so = cardMes.filter(function (c) { return sessoesDoDia(c.t).length === 0; }).length;
      return {
        n: cardMes.length,
        min: fmtInt(cardMes.reduce(function (a, c) { return a + c.min; }, 0)),
        soCardio: so
      };
    })() : null,
    // Horário típico: só conta sessão com hora medida — retroativo sem hora
    // informada não inventa horário, e entrar na média seria inventar.
    horarios: (function () {
      const h = S.done.filter(function (x) {
        return x.t >= ini.getTime() && x.t < fim.getTime() && temHora(x);
      }).map(function (x) { return new Date(x.t).getHours() * 60 + new Date(x.t).getMinutes(); });
      if (!h.length) return null;
      const fmt = function (min) {
        return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(Math.round(min % 60)).padStart(2, '0');
      };
      return {
        n: h.length,
        media: fmt(h.reduce(function (a, b) { return a + b; }, 0) / h.length),
        min: fmt(Math.min.apply(null, h)),
        max: fmt(Math.max.apply(null, h))
      };
    })(),
    sessoes: sessoes
  };
};
CTX.mudaMes = function (n) { mudaMes(n); };

// ---------- tela cheia: detalhe da sessão ----------
CTX.detalheDaSessao = function () {
  const m = view.sessao;
  if (!m) return null;

  if (m.livre) {
    return {
      livre: true,
      olho: 'treino avulso',
      meta: diaExtenso(m.t),
      titulo: m.nome || (m.grupos || []).join(', ') || 'treino avulso',
      stats: [
        { k: 'd', rotulo: 'tempo de treino', valor: m.dur ? fmtDur(m.dur) : '–' },
        { k: 'g', rotulo: (m.grupos || []).length === 1 ? 'grupo muscular' : 'grupos musculares',
          valor: String((m.grupos || []).length) }
      ],
      grupos: m.grupos || [],
      t: m.t
    };
  }

  const R = resumoDaSessao(m);
  const aberta = !!(S.sessao && S.sessao.sid === m.sid);
  const dur = aberta ? (S.sessao.ultima - S.sessao.inicio) : m.dur;
  const exato = m.fim === 'manual';
  const recordes = R.itens.filter(function (x) { return x.recCarga || x.recMet; }).length;
  const p = pendencias(m.day, m.sid, m.pulados);
  const card = cardioDoDia(m.t);

  const notas = [];
  if (!aberta && dur != null && !exato) {
    notas.push('Você não encerrou este treino; o app fechou sozinho e o tempo vai até a última série registrada.');
  }
  if (m.pausado) notas.push(fmtDur(m.pausado) + ' de pausa, fora da conta.');
  if (m.ini === 'manual') notas.push('Início marcado por você, antes do aquecimento.');

  const hIni = horaDaSessao(m), hFim = aberta ? null : fimDaSessao(m);

  // A correção não é oferecida no treino em andamento: o tempo dele ainda está
  // correndo, e escrever por cima seria discutir com o relógio.
  const corrigivel = !aberta;
  return {
    livre: false,
    t: m.t,
    corrigivel: corrigivel,
    exato: exato,
    duracoes: corrigivel
      ? [30, 45, 60, 75, 90].map(function (v) {
          return { k: v, t: v + ' min', on: Math.round((dur || 0) / 60000) === v };
        })
      : [],
    duracaoTxt: dur == null ? 'não medido' : fmtDur(dur),
    olho: 'treino ' + m.day + (aberta ? ' · em andamento' : ''),
    meta: diaExtenso(m.t),
    titulo: R.series + (R.series === 1 ? ' série registrada' : ' séries registradas'),
    stats: [
      { k: 'd', rotulo: aberta ? 'em andamento'
          : dur == null ? 'tempo não medido' : exato ? 'tempo exato' : 'tempo aproximado',
        valor: dur != null ? fmtDur(dur) : '–' },
      { k: 'v', rotulo: 'volume · kg×reps', valor: R.vol ? fmtInt(R.vol) : '–' },
      { k: 'r', rotulo: recordes === 1 ? 'recorde' : 'recordes', valor: String(recordes),
        cor: recordes ? 'ins-acid' : '' }
    ],
    horario: hIni ? (hFim ? { de: hIni, ate: hFim } : { de: hIni, ate: null }) : null,
    notas: notas,
    mods: Array.isArray(m.mods) && m.mods.length ? m.mods : null,
    pendencias: [
      { k: 'pulado', n: p.pulado.length, rotulo: p.pulado.length === 1 ? 'pulado' : 'pulados',
        nomes: p.pulado.map(function (x) { return x.nome; }).join(', ') },
      { k: 'parcial', n: p.parcial.length, rotulo: p.parcial.length === 1 ? 'parcial' : 'parciais',
        nomes: p.parcial.map(function (x) { return x.nome; }).join(', ') },
      { k: 'nada', n: p.nada.length, rotulo: 'não ' + (p.nada.length === 1 ? 'feito' : 'feitos'),
        nomes: p.nada.map(function (x) { return x.nome; }).join(', ') }
    ].filter(function (x) { return x.n > 0; }),
    cardio: card.length
      ? card.map(function (c) { return c.min + ' min de ' + c.m + ' · ' + c.i; })
      : null,
    tempo: R.tempo ? fmtInt(R.tempo) : null,
    dores: R.dores.length ? R.dores.join(', ') : null,
    itens: R.itens.map(function (x) {
      const marcas = [];
      if (x.recCarga) marcas.push('recorde de carga');
      else if (x.recMet) marcas.push('recorde de ' + (x.seg ? 'tempo' : 'volume'));
      if (x.novo) marcas.push('primeira vez');
      if (x.fora) marcas.push('fora do treino');
      return {
        nome: x.nome,
        delta: x.delta === null ? null : (x.delta > 0 ? '+' : '') + x.delta + '%',
        deltaCor: x.delta > 0 ? 'ins-acid' : '',
        series: x.sets.map(function (y) {
          if (!y) return null;
          return x.seg
            ? (y[0] ? fmtNum(y[0]) + 'kg × ' + y[1] + 's' : y[1] + 's')
            : fmtNum(y[0]) + '×' + y[1];
        }),
        meta: fmtInt(x.met) + ' ' + (x.seg ? 'seg' : 'vol'),
        marcas: marcas,
        nota: x.dor.length ? 'dor em ' + x.dor.map(dorName).join(' e ') : null
      };
    })
  };
};
CTX.fechaSessao = function () { fecharSessao(); };
CTX.editaSessao = function (t) { apagaRegistroDeTreino(t); };
CTX.corrigeDuracao = function (t, min) { corrigeDuracao(t, min); };

// ---------- tela cheia: histórico do exercício ----------
CTX.historico = function () {
  const d = view.hist.day, i = view.hist.i;
  const P = treino(d);
  const ex = P.ex[i];
  const vars = variantsOf(d, i);
  const sel = view.hist.key || id(d, i);
  const tipo = cargaTipo(sel, ex);
  const H = (S.logs[sel] || []).slice(-6);
  const base = (S.logs[sel] || []).length - H.length;

  const seg = isTime(ex) || (H[0] && H[0].u === 'seg');
  const corpo = !seg && tipo === 'corpo';
  const rotCarga = seg ? 'kg' : CARGAS[tipo].rot;
  const met = seg ? tutOf : (corpo ? repsOf : volOf);

  const marcas = [];
  marcas.push({ k: 'c', t: ex.c ? 'composto' : 'isolador', cls: ex.c ? 'comp' : '' });
  marcas.push({ k: 'car', t: CARGAS[tipo].nome, cls: '' });
  if (sel !== id(d, i)) marcas.push({ k: 'sub', t: 'substituto', cls: 'swap-t' });

  const cab = {
    dia: d,
    olho: 'treino ' + d + ' · exercício ' + String(i + 1).padStart(2, '0'),
    meta: H.length + ' de 6 sessões',
    titulo: nomeEx(sel),
    alvo: ex.s + ' × ' + ex.r + (ex.rir ? ' · RIR ' + ex.rir : ''),
    marcas: marcas,
    up: sel === id(d, i) && shouldUp(d, i, ex),
    cue: ex.cue,
    variantes: vars.length
      ? [{ k: id(d, i), t: ex.n, on: sel === id(d, i) }].concat(
          vars.map(function (v) { return { k: v.key, t: v.name, on: sel === v.key }; }))
      : null
  };

  if (!H.length) return Object.assign(cab, { vazio: true });

  const last = H[H.length - 1], first = H[0];
  const dv = H.length > 1 && met(first) > 0
    ? Math.round((met(last) - met(first)) / met(first) * 100) : null;

  return Object.assign(cab, {
    vazio: false,
    stats: (seg
      ? [{ k: 'a', rotulo: 'tempo da última · seg', valor: fmtInt(tutOf(last)) },
         { k: 'b', rotulo: 'média por série · seg',
           valor: fmtInt(Math.round(tutOf(last) / Math.max(last.sets.filter(Boolean).length, 1))) }]
      : corpo
      ? [{ k: 'a', rotulo: 'repetições na última', valor: fmtInt(repsOf(last)) },
         { k: 'b', rotulo: 'carga somada · kg', valor: maxLoad(last) ? fmtNum(maxLoad(last)) : '–' }]
      : [{ k: 'a', rotulo: 'carga atual · ' + rotCarga, valor: fmtNum(maxLoad(last)) },
         { k: 'b', rotulo: 'volume da última', valor: fmtInt(volOf(last)) }]
    ).concat([{
      k: 'd',
      rotulo: (seg ? 'tempo' : corpo ? 'repetições' : 'volume') + ' no período',
      valor: dv === null ? '–' : (dv > 0 ? '+' : '') + dv + '%',
      cor: dv !== null && dv > 0 ? 'ins-acid' : ''
    }]),
    // O gráfico continua sendo SVG gerado: é desenho, não estrutura, e não
    // carrega nenhum handler. Entra por markup e sai daqui inteiro.
    svg: chartSVG(H, seg ? 'seg' : (corpo ? 'corpo' : null), rotCarga),
    legenda: [
      { k: 'c', t: seg ? 'tempo total sob tensão' : corpo ? 'repetições da sessão' : 'carga máxima da sessão' },
      (seg || corpo)
        ? (H.some(function (x) { return maxLoad(x) > 0; }) ? { k: 'v', t: 'carga adicionada' } : null)
        : { k: 'v', t: 'volume total' }
    ].filter(Boolean),
    sessoes: H.map(function (s, k) {
      const v = met(s);
      const pv = k > 0 ? met(H[k - 1]) : null;
      const delta = pv ? Math.round((v - pv) / pv * 100) : null;
      return {
        real: base + k,
        data: fmtDate(s.t),
        valor: fmtInt(v),
        unidade: seg ? 'seg no total' : 'kg×reps',
        deload: !!s.dl,
        delta: delta === null ? null : (delta > 0 ? '+' : '') + delta + '%',
        deltaCor: delta > 0 ? 'ins-acid' : '',
        series: s.sets.map(function (x) {
          if (!x) return null;
          return seg ? (x[0] ? fmtNum(x[0]) + 'kg × ' + x[1] + 's' : x[1] + 's')
                     : (corpo && !x[0] ? x[1] + ' reps' : fmtNum(x[0]) + '×' + x[1]);
        }),
        reps: (seg || corpo) ? null : repsOf(s) + ' reps',
        anilhas: (!seg && CARGAS[tipo].dobra && maxLoad(s))
          ? fmtNum(totalAnilhas(maxLoad(s))) + ' kg ' + CARGAS[tipo].total : null,
        dor: s.dor && s.dor.length ? 'dor em ' + s.dor.map(dorName).join(' e ') : null,
        rir: s.rir ? 'última série a ' + s.rir + ' da falha' : null,
        obs: s.obs || null,
        editando: view.edit === base + k,
        edicao: view.edit === base + k ? {
          sets: s.sets.map(function (x) {
            return { carga: x ? fmtNum(x[0]) : '', reps: x ? String(x[1]) : '' };
          }),
          seg: seg,
          dores: DORES.map(function (x) {
            return { k: x.k, t: x.t, on: (s.dor || []).indexOf(x.k) >= 0 };
          }),
          obs: s.obs || ''
        } : null
      };
    }).reverse(),
    dores: (function () {
      const n = H.filter(function (x) { return x.dor && x.dor.length; }).length;
      return n ? { n: n, de: H.length } : null;
    })()
  });
};
CTX.fechaHist = function () { closeHist(); };
CTX.histKey = function (k) { histKey(k); };
CTX.editaLinha = function (real) { editarSessao(real); };
CTX.cancelaEdicao = function () { cancelarEdicao(); };
CTX.salvaEdicao = function () { salvarEdicao(); };
CTX.apagaLinha = function () { apagarSessao(); };
CTX.editDor = function (k) { editDor(k); };
CTX.limpaNum = function (el, dec) { limpaNum(el, dec); };

// ---------- tela cheia: decisão de fim de sessão ----------
CTX.decisao = function () {
  const P = view.promo;
  if (!P) return null;
  const n = P.dec.filter(function (x) { return x === 'oficial'; }).length;
  return {
    dia: P.day,
    olho: 'treino ' + P.day,
    meta: P.mods.length + (P.mods.length === 1 ? ' mudança' : ' mudanças'),
    mods: P.mods.map(function (m, j) {
      const imp = impactoDoMod(P.day, m);
      return {
        j: j,
        txt: textoMod(P.day, m),
        impacto: imp ? imp.txt : null,
        acima: !!(imp && imp.acima),
        oficial: P.dec[j] === 'oficial'
      };
    }),
    motivos: MOTIVOS.map(function (x) {
      return { k: x.k, t: x.t, on: P.motivo === x.k };
    }),
    acao: n
      ? 'Encerrar e levar ' + n + (n === 1 ? ' mudança' : ' mudanças') + ' para o oficial'
      : 'Encerrar mantendo o programa como está'
  };
};
CTX.decidePromo = function (j, v) { decidePromo(j, v); };
CTX.motivoPromo = function (k) { motivoPromo(k); };
CTX.concluiPromo = function () { concluirPromo(); };
CTX.voltaDoPromo = function () { voltarDoPromo(); };

// ---------- tela cheia: retrospectiva de bloco ----------
CTX.retrospectiva = function () {
  const R = retro();
  const dores = Object.keys(R.dores);
  const un = function (x) { return x.seg ? 's' : 'kg'; };
  return {
    olho: 'retrospectiva de bloco',
    meta: fmtDate(R.de) + ' a ' + fmtDate(R.ate),
    titulo: R.sessoes + ' sessões em ' + fmtDec(R.semanas) + ' semanas',
    stats: [
      { k: 'a', rotulo: 'treinos por semana', valor: fmtDec(R.sessoes / R.semanas) },
      { k: 'b', rotulo: 'volume acumulado', valor: fmtInt(R.volTotal) },
      { k: 'c', rotulo: 'exercícios que subiram', valor: String(R.evol.length),
        cor: R.evol.length ? 'ins-acid' : '' }
    ],
    evol: R.evol.slice(0, 8).map(function (x) {
      return {
        nome: x.nome,
        delta: x.dc === null ? null : '+' + x.dc + '%',
        deltaCor: 'ins-acid',
        series: [fmtNum(x.ci) + un(x) + ' → ' + fmtNum(x.cf) + un(x)],
        meta: [x.n + ' sessões'].concat(
          x.dv === null ? [] : ['volume ' + (x.dv > 0 ? '+' : '') + x.dv + '%']),
        marcas: []
      };
    }),
    parados: R.parados.map(function (x) {
      return {
        nome: x.nome,
        delta: x.dv === null ? null : (x.dv > 0 ? '+' : '') + x.dv + '%',
        deltaCor: x.dv > 0 ? 'ins-acid' : '',
        series: [fmtNum(x.cf) + un(x) + ' o bloco inteiro'],
        meta: x.n + ' sessões',
        marcas: []
      };
    }),
    dores: dores.length
      ? dores.map(function (k) { return R.dores[k] + 'x em ' + dorName(k); }).join(', ')
      : null,
    deloads: R.deloads
      ? R.deloads + (R.deloads === 1 ? ' sessão foi' : ' sessões foram') +
        ' em modo deload e não ' + (R.deloads === 1 ? 'entrou' : 'entraram') + ' na conta das 48.'
      : null
  };
};
CTX.fechaRetro = function () { fecharRetro(); };

// ---------- tela cheia: registro retroativo ----------
CTX.retroativo = function () {
  const a = view.add;
  if (!a) return null;
  const jaTem = sessoesDoDia(a.t);
  return {
    titulo: diaExtenso(a.t),
    data: fmtDate(a.t),
    hoje: sameDay(a.t, Date.now()),
    jaTem: jaTem.length
      ? jaTem.map(function (m) { return m.livre ? 'avulso' : 'treino ' + m.day; }).join(', ')
      : null,
    tipos: rot().map(function (x) { return { k: x, t: x, on: a.tipo === x }; })
      .concat([{ k: 'livre', t: 'outro treino', on: a.tipo === 'livre' },
               { k: 'descanso', t: 'foi descanso', on: a.tipo === 'descanso' }]),
    descanso: a.tipo === 'descanso',
    jaEraDescanso: ehDescanso(a.t),
    // só letra da rotação tem treino para descrever: 'livre' e 'descanso' não
    doPlano: a.tipo && treino(a.tipo)
      ? treino(a.tipo).name + ' · ' + treino(a.tipo).tag : null,
    livre: a.tipo === 'livre',
    grupos: gruposDoPlano().map(function (g) {
      return { k: g, t: g, on: a.grupos.indexOf(g) >= 0 };
    }),
    nome: a.nome,
    hora: a.hora || '',
    duracoes: [30, 45, 60, 75].map(function (v) {
      return { k: v, t: v + ' min', on: a.dur === v };
    }),
    pode: !!a.tipo
  };
};
CTX.fechaAdicionar = function () { fecharAdicionar(); };
CTX.addSet = function (campo, valor) { addSet(campo, valor); };
CTX.addNome = function (el) { addNome(el); };
CTX.addHora = function (el) { addHora(el); };
CTX.gravaRetro = function (detalhar) { gravarRetro(detalhar); };

// ---------- edição do treino de HOJE ----------
// O gesto é o mesmo do editor de programa — subir, descer, mais série, menos
// série, trocar, remover — e por isso a linha é um componente só. O que muda
// é quem executa, e isso entra por `acoes`.
CTX.edicaoDoDia = function () {
  const d = view.day;
  const P = treino(d);
  const mods = modsDoDia(d);
  return {
    dia: d,
    aviso: mods.length
      ? mods.length + (mods.length === 1
          ? ' mudança pendente. No fim do treino você decide se ela fica.'
          : ' mudanças pendentes. No fim do treino você decide o que fica.')
      : 'O programa oficial só muda se você quiser, no fim do treino.',
    linhas: P.ex.map(function (ex, i) {
      const trocado = ex.orig && ex.orig !== ex.id;
      const imp = impactoSeries(d, ex.g);
      return {
        i: i,
        ord: String(i + 1).padStart(2, '0'),
        nome: ex.n,
        noLugarDe: trocado ? 'no lugar de ' + nomeEx(ex.orig) : null,
        meta: ex.g + (ex.desde ? ' · no programa há ' + semanasDe(ex.desde) : ''),
        mexido: !!ex.mod,
        primeira: i === 0,
        ultima: i === P.ex.length - 1,
        series: ex.s,
        // o impacto só aparece onde ele mexeu ou onde o número saiu do alvo:
        // uma linha por exercício seria ruído em toda a tela
        impacto: imp && (ex.mod || imp.acima) ? { txt: imp.txt, acima: !!imp.acima } : null,
        troca: view.swapOpen === i ? trocaDoDia(d, i) : null
      };
    }),
    mods: mods.map(function (m, j) { return { j: j, txt: textoMod(d, m) }; }),
    addEx: view.addEx ? catalogoDeAdicao(d) : null
  };
};

function trocaDoDia(d, i) {
  const ex = treino(d).ex[i];
  const lista = altList(d, i);
  const ind = lista.filter(function (a) { return a.ind; });
  const outros = lista.filter(function (a) { return !a.ind; });
  const grupos = [{ rotulo: 'Mesmo padrão de movimento:', opcoes: ind.map(opcaoDeTroca) }];
  if (outros.length) {
    grupos.push({ rotulo: 'Outros de ' + exDe(ex.orig || ex.id).g + ':',
                  opcoes: outros.map(opcaoDeTroca) });
  }
  return {
    grupos: grupos,
    voltar: ex.orig && ex.orig !== ex.id
      ? { t: 'Voltar para ' + nomeEx(ex.orig), sub: 'Cancela a troca.' } : null
  };
}

// O catálogo inteiro, com busca, e a porta para cadastrar equipamento que o
// app ainda não conhece.
function catalogoDeAdicao(d) {
  const q = (view.addQ || '').toLowerCase().trim();
  const nodia = {};
  const t = treino(d);
  if (t) t.ex.forEach(function (x) { nodia[x.id] = 1; });
  return {
    dia: d,
    busca: view.addQ || '',
    achados: Object.keys(CAT)
      .filter(function (k) { return !CAT[k].arq; })
      .filter(function (k) {
        return !q || CAT[k].n.toLowerCase().indexOf(q) >= 0 || (CAT[k].g || '').indexOf(q) >= 0;
      })
      .sort(function (a, b) { return CAT[a].n.localeCompare(CAT[b].n); })
      .slice(0, 40)
      .map(function (k) {
        return { id: k, n: CAT[k].n,
                 sub: (CAT[k].g || 'sem grupo') + (nodia[k] ? ' · já está neste treino' : '') };
      }),
    novo: view.novoEx
      ? { grupos: gruposDoPlano(),
          cargas: Object.keys(CARGAS).map(function (c) { return { k: c, t: CARGAS[c].nome }; }) }
      : null
  };
}

CTX.acoesDia = {
  subir: function (i) { moverEx(i, -1); },
  descer: function (i) { moverEx(i, 1); },
  menos: function (i) { mudaSeries(i, -1); },
  mais: function (i) { mudaSeries(i, 1); },
  trocar: function (i) { abrirSubstituicao(i); },
  remover: function (i) { removerEx(i); },
  escolheTroca: function (i, id) { setAlt(i, id); },
  fechaTroca: function (i) { toggleSwap(i); },
  desfaz: function (j) { desfazMod(j); },
  pronto: function () { modoEdicao(false); }
};

CTX.acoesAdd = {
  abre: function () { abrirAddEx(); },
  fecha: function () { fecharAddEx(); },
  busca: function (v) { buscaEx(v); },
  adiciona: function (k) { addExercicio(k); },
  abreNovo: function () { abrirNovoEx(); },
  cria: function () { criarExercicio(); }
};

// ---------- tela cheia: o programa ----------
// Quatro modos numa tela só — a lista dos treinos, um treino aberto, a
// diferença para o que o treinador prescreveu, e o histórico de mudanças —
// porque são quatro ângulos do MESMO objeto.
CTX.programa = function () {
  const V = view.prog;
  if (V.day) return programaDia(V.day);
  if (V.modo === 'diff') return programaDiff();
  if (V.modo === 'historico') return programaHist();
  return programaLista();
};

function programaLista() {
  const dif = difTotal();
  return {
    modo: 'lista',
    olho: 'seu programa',
    meta: rot().length + ' treinos',
    titulo: 'Programa',
    stats: [
      { k: 'a', rotulo: 'séries diretas', valor: String(totalSeries()) },
      { k: 'b', rotulo: 'do treinador', valor: String(ALVO_TOTAL) },
      { k: 'c', rotulo: dif === 1 ? 'diferença' : 'diferenças', valor: String(dif),
        cor: dif ? 'ins-amber' : '' }
    ],
    dias: rot().map(function (d, i) {
      const p = S.prog[d];
      const n = difDoDia(d).length;
      return {
        d: d, i: i,
        nome: p ? p.name : 'treino ' + d,
        meta: (p ? p.ex.length : 0) + ' exercícios · ' + metaDoDia(d) +
              (n ? ' · ' + n + (n === 1 ? ' diferença' : ' diferenças') : ''),
        primeiro: i === 0,
        ultimo: i === rot().length - 1
      };
    }),
    dif: dif
  };
}

function programaDia(d) {
  const p = S.prog[d];
  if (!p) return { modo: 'dia', vazio: true, olho: 'treino ' + d, titulo: 'Treino não encontrado' };
  return {
    modo: 'dia',
    dia: d,
    olho: 'treino ' + d,
    meta: metaDoDia(d),
    titulo: p.name,
    dif: difDoDia(d).map(function (x) { return x.txt; }),
    linhas: p.ex.map(function (sl, i) {
      const e = exDe(sl.id);
      const imp = impactoOficial(e.g);
      return {
        i: i,
        ord: String(i + 1).padStart(2, '0'),
        nome: e.n,
        noLugarDe: null,
        meta: (e.g || 'sem grupo') + (sl.desde ? ' · há ' + semanasDe(sl.desde) : ''),
        mexido: false,
        primeira: i === 0,
        ultima: i === p.ex.length - 1,
        series: sl.s,
        reps: sl.r + ' reps',
        descanso: 'descanso ' + fmtDesc(sl.d),
        impacto: imp ? { txt: imp.txt, acima: !!imp.acima } : null,
        troca: view.swapOpen === i ? trocaDoPrograma(d, i) : null
      };
    }),
    addEx: view.addEx ? catalogoDeAdicao(d) : null
  };
}

function trocaDoPrograma(d, i) {
  const sl = S.prog[d].ex[i];
  const e = exDe(sl.id);
  const vistos = {}; vistos[sl.id] = 1;
  const out = [];
  (ALT[e.n] || []).forEach(function (a) {
    const k = slugEx(a.n);
    if (vistos[k]) return; vistos[k] = 1;
    out.push({ id: k, n: a.n, w: a.w });
  });
  Object.keys(CAT).forEach(function (k) {
    if (vistos[k] || CAT[k].arq || CAT[k].g !== e.g || !e.g) return;
    vistos[k] = 1;
    out.push({ id: k, n: CAT[k].n, w: 'mesmo grupo muscular' });
  });
  return {
    grupos: [{ rotulo: 'Trocar no programa, a partir do próximo treino ' + d + ':',
               opcoes: out.map(opcaoDeTroca) }],
    voltar: null
  };
}

function programaDiff() {
  const blocos = [];
  if (rot().join('|') !== ROT_BASE.join('|')) {
    blocos.push({ k: 'rot', titulo: 'rotação',
                  itens: [ROT_BASE.join(' → ') + ' virou ' + rot().join(' → ')], dia: null });
  }
  rot().forEach(function (d) {
    const dif = difDoDia(d);
    if (!dif.length) return;
    blocos.push({ k: d, titulo: 'treino ' + d,
                  itens: dif.map(function (x) { return x.txt; }), dia: d });
  });
  return { modo: 'diff', olho: 'seu programa', meta: 'vs. treinador',
           titulo: 'O que está diferente', blocos: blocos };
}

function programaHist() {
  const log = (S.progLog || []).slice().reverse();
  const MOT = {}; MOTIVOS.forEach(function (x) { MOT[x.k] = x.t; });
  return {
    modo: 'historico',
    olho: 'seu programa',
    meta: log.length + (log.length === 1 ? ' mudança' : ' mudanças'),
    titulo: 'Histórico de mudanças',
    log: log.map(function (x, i) {
      return {
        i: i,
        txt: x.txt,
        meta: 'treino ' + x.day + ' · ' + diaExtenso(x.t) +
              (x.motivo ? ' · ' + (MOT[x.motivo] || x.motivo) : '')
      };
    })
  };
}

CTX.acoesPrograma = {
  volta: function () {
    if (view.prog.day || view.prog.modo !== 'lista') abrirPrograma(null);
    else fecharPrograma();
  },
  abreDia: function (d) { abrirPrograma(d); },
  modo: function (m) { modoPrograma(m); },
  moveDia: function (i, n) { moverDia(i, n); },
  criaTreino: function () { criarTreino(); },
  restauraDia: function (d) { restaurarDia(d); },
  restauraTudo: function () { restaurarTudo(); }
};

// As mesmas ações da linha editável, executadas no programa oficial.
CTX.acoesProg = {
  subir: function (i) { moverProg(view.prog.day, i, -1); },
  descer: function (i) { moverProg(view.prog.day, i, 1); },
  menos: function (i) { progSeries(view.prog.day, i, -1); },
  mais: function (i) { progSeries(view.prog.day, i, 1); },
  trocar: function (i) { progTroca(view.prog.day, i); },
  remover: function (i) { progRemove(view.prog.day, i); },
  escolheTroca: function (i, id) { progSetTroca(view.prog.day, i, id); },
  fechaTroca: function (i) { toggleSwap(i); },
  reps: function (i) { progReps(view.prog.day, i); },
  descanso: function (i) { progDesc(view.prog.day, i); }
};

// ---------- o protocolo de fotos ----------
// A terceira série do mesmo assunto que peso e cintura já respondem: está
// funcionando? A diferença é que esta não vira número, e por isso o que ela
// exige do app não é uma média — é COMPARABILIDADE.
//
// Duas fotos só se comparam quando a pose e a geometria da câmera são as
// mesmas. A geometria mora nas marcas de fita no chão, fora do alcance do app;
// a pose ele alcança, e é o que estas funções garantem.

/** A ordem de poses em vigor: a dele, ou a do código. */
function ordemDePoses() { return posesDo(S.protocolo.poses).map(function (p) { return p.id; }); }

/** A sessão daquela data, criando-a se ainda não existir. */
function sessaoFotoOuCria(d) {
  let ses = sessaoDe(S.protocolo.sessoes, d);
  if (ses) return ses;
  ses = { d: d, t: Date.now(), fotos: {}, m: Date.now() };
  S.protocolo.sessoes = S.protocolo.sessoes.concat([ses]).sort(function (a, b) {
    return a.d < b.d ? -1 : a.d > b.d ? 1 : 0;
  });
  return sessaoDe(S.protocolo.sessoes, d);
}

/** As datas cujas fotos a tela vai precisar — incluindo as de referência. */
function datasNecessarias(d) {
  const set = {};
  set[d] = 1;
  ordemDePoses().forEach(function (pose) {
    const r = referencia(S.protocolo.sessoes, pose, d);
    if (r) set[r.d] = 1;
  });
  return Object.keys(set);
}

CTX.abreProtocolo = function () {
  const d = hojeISO();
  const ses = sessaoDe(S.protocolo.sessoes, d);
  const prox = proximaPose(ses, S.protocolo.poses);
  view.protocolo = {
    d: d,
    pose: prox || ordemDePoses()[0],
    // a montagem só na primeira foto do dia: o que é fixo por definição não se
    // pergunta de novo
    montagem: !ses || !Object.keys(ses.fotos).length
  };
  entraNoDestino('protocolo'); render();
  garanteBytesDoCorpo(datasNecessarias(d));
};

CTX.fechaProtocolo = function () { view.protocolo = null; render(); saiDoDestino('protocolo'); };
CTX.comecaSessaoDeFotos = function () { view.protocolo.montagem = false; render(); window.scrollTo(0, 0); };
CTX.vaiParaPose = function (id) { view.protocolo.pose = id; render(); window.scrollTo(0, 0); };

function andaPose(delta) {
  const ordem = ordemDePoses();
  const i = ordem.indexOf(view.protocolo.pose) + delta;
  if (i < 0 || i >= ordem.length) return;
  view.protocolo.pose = ordem[i];
  render(); window.scrollTo(0, 0);
}
CTX.posAnterior = function () { andaPose(-1); };
CTX.posProxima = function () { andaPose(1); };

/**
 * Guarda a foto e avança.
 *
 * A sessão nasce AQUI, na primeira foto — igual à sessão de treino, que nasce
 * na primeira série. Não há botão de salvar e não há o que confirmar.
 */
/**
 * Grava a foto daquela pose e avança a sessão.
 *
 * Compartilhada pelos dois caminhos de captura — a câmera do sistema, que
 * entrega um arquivo, e a de dentro do app, que entrega um quadro de vídeo. O
 * que muda entre elas é só a fonte dos pixels; tudo o que vem depois (reduzir,
 * guardar, lapidar a anterior, avançar) é o mesmo, e ter um lugar só é o que
 * impede as duas de divergirem no que gravam.
 */
async function guardaFotoDaPose(d, pose, reduzida) {
  const { blob, ext } = reduzida;
  await CORPO.guarda(d, pose, blob, ext);

  const ses = sessaoFotoOuCria(d);
  const antiga = ses.fotos[pose];
  // refazer apaga a anterior: sem lápide, a fusão traria a versão velha de
  // volta do outro aparelho, e as duas disputariam a mesma pose
  if (antiga) lapide(chaveDeFotoDoCorpo(d, pose));
  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[pose] = { v: Date.now(), ext: ext };
  ses.m = Date.now();
  CORPO.solta(d, pose);                // a versão anterior sai da memória
  await CORPO.carrega(d, pose, ses.fotos[pose]);

  await save();
  // avança sozinho para a próxima que falta: a sessão é uma sequência, e
  // pedir um toque a mais entre duas poses é pedir um toque a mais nove vezes
  const prox = proximaPose(sessaoDe(S.protocolo.sessoes, d), S.protocolo.poses);
  if (prox && view.protocolo) view.protocolo.pose = prox;
  return prox;
}

async function tiraFotoDoCorpo(el) {
  const arquivo = el.files && el.files[0];
  const v = view.protocolo;
  if (!arquivo || !v) return;
  el.value = '';                       // permite repetir a mesma foto
  try {
    await guardaFotoDaPose(v.d, v.pose, await CORPO.reduz(arquivo));
    render(); window.scrollTo(0, 0);
  } catch (e) {
    toast('Não deu para guardar a foto.');
  }
}
CTX.tiraFotoDoCorpo = function (el) { tiraFotoDoCorpo(el); };

CTX.apagaFotoDoCorpo = async function (pose) {
  const v = view.protocolo;
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  if (!ses || !ses.fotos[pose]) return;
  // Confirma como toda outra ação destrutiva do app. E o aviso é honesto: a
  // lápide viaja na sincronização, então isto não apaga só daqui.
  const p = poseDe(pose);
  if (!confirm('Apagar a foto de ' + (p ? p.n.toLowerCase() : pose) + '?\n\n' +
               'Some deste aparelho e dos outros na próxima sincronização. Não tem volta.')) return;
  const ext = ses.fotos[pose].ext;
  lapide(chaveDeFotoDoCorpo(v.d, pose));
  ses.fotos = Object.assign({}, ses.fotos);
  delete ses.fotos[pose];
  ses.m = Date.now();
  CORPO.solta(v.d, pose);
  await CORPO.esquece(v.d, pose, ext);
  // sessão sem foto nenhuma não sobrevive à última: ela nasce na primeira
  if (!Object.keys(ses.fotos).length) {
    lapide(chaveDeSessaoFoto(v.d));
    S.protocolo.sessoes = S.protocolo.sessoes.filter(function (x) { return x.d !== v.d; });
  }
  await save(); render();
  toast('Foto apagada.');
};

let notaT = null;
CTX.setNotaDaSessao = function (txt) {
  const v = view.protocolo;
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  if (!ses) return;                    // sem foto ainda não há sessão para anotar
  ses.obs = txt;
  ses.m = Date.now();
  render();
  clearTimeout(notaT);
  notaT = setTimeout(function () { save(); }, 700);   // mesmo debounce do rascunho
};

/** O que a tela de captura consome. */
CTX.sessaoDeFotos = function () {
  const v = view.protocolo;
  if (!v) return null;
  const lista = posesDo(S.protocolo.poses);
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const c = completude(ses, S.protocolo.poses);

  if (v.montagem) {
    return { passo: 'montagem', meta: fmtDate(instanteDaData(v.d)), montagem: { itens: MONTAGEM } };
  }

  const i = Math.max(0, lista.findIndex(function (p) { return p.id === v.pose; }));
  const pose = lista[i];
  const minha = ses && ses.fotos[pose.id];
  const ref = referencia(S.protocolo.sessoes, pose.id, v.d);

  return {
    passo: 'pose',
    d: v.d,
    // sem `getUserMedia` não há o que oferecer: o botão da câmera do sistema
    // volta a ser o principal, em vez de sobrar um caminho que não abre
    temCamera: CAM.temCamera(),
    indice: i + 1,
    total: lista.length,
    faltando: c.faltando.length,
    obs: (ses && ses.obs) || '',
    anterior: i > 0,
    proxima: i < lista.length - 1,
    pontos: lista.map(function (p) {
      return { id: p.id, n: p.n, feita: !!(ses && ses.fotos[p.id]), atual: p.id === v.pose };
    }),
    pose: {
      id: pose.id, n: pose.n, bloco: pose.bloco, giro: pose.giro, bracos: pose.bracos,
      como: pose.como, revela: pose.revela, erro: pose.erro,
      url: CORPO.urlDaFoto(v.d, pose.id, minha),
      // o enquadramento anda colado na url: quem desenha não vai buscá-lo
      enq: (minha && minha.enq) || null,
      ref: ref
        ? (function () {
            const r = sessaoDe(S.protocolo.sessoes, ref.d).fotos[pose.id];
            return {
              txt: fmtDate(instanteDaData(ref.d)),
              url: CORPO.urlDaFoto(ref.d, pose.id, r),
              enq: (r && r.enq) || null
            };
          })()
        : null
    }
  };
};

// ---------- comparar ----------

CTX.abreComparar = function () {
  const ordem = ordemDePoses();
  // abre na primeira pose que tem pelo menos duas sessões: abrir numa pose sem
  // par mostraria um vazio como primeira tela
  let pose = ordem.filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0] || ordem[0];
  view.comparar = { pose: pose, de: null, ate: null, sobrepor: false, opacidade: 50 };
  aplicaParPadrao();
  entraNoDestino('comparar'); render();
};
CTX.fechaComparar = function () { view.comparar = null; render(); saiDoDestino('comparar'); };

function aplicaParPadrao() {
  const c = view.comparar;
  const par = parPadrao(S.protocolo.sessoes, c.pose);
  c.de = par ? par.de.d : null;
  c.ate = par ? par.ate.d : null;
  if (par) garanteBytesDoCorpo([c.de, c.ate]);
}

CTX.setPoseComparada = function (id) { view.comparar.pose = id; aplicaParPadrao(); render(); };
CTX.setDataComparada = function (qual, d) {
  view.comparar[qual] = d;
  garanteBytesDoCorpo([d]);
  render();
};
CTX.setSobrepor = function (on) { view.comparar.sobrepor = !!on; render(); };
CTX.setOpacidade = function (n) { view.comparar.opacidade = n; render(); };

/** Um lado da comparação, com os números da semana daquela sessão. */
function ladoDaComparacao(d, pose) {
  const ses = d && sessaoDe(S.protocolo.sessoes, d);
  const ref = ses && ses.fotos[pose];
  const peso = ses && mediaDaSemana(S.body.peso, d);
  const cint = ses && mediaDaSemana(S.body.cintura, d);
  return {
    d: d,
    pose: pose,
    data: ses ? fmtDate(instanteDaData(d)) : '–',
    url: ref ? CORPO.urlDaFoto(d, pose, ref) : null,
    enq: (ref && ref.enq) || null,
    aviso: ref ? 'buscando a foto…' : 'sem foto nesta pose',
    peso: peso == null ? 'peso –' : fmtDec(peso) + ' kg',
    cintura: cint == null ? 'cintura –' : fmtDec(cint) + ' cm'
  };
}

CTX.comparacao = function () {
  const c = view.comparar;
  const lista = posesDo(S.protocolo.poses);
  const comFoto = comAPose(S.protocolo.sessoes, c.pose);
  const par = comFoto.length >= 2 && c.de && c.ate;

  const de = ladoDaComparacao(c.de, c.pose);
  const ate = ladoDaComparacao(c.ate, c.pose);
  const notas = [];
  [c.de, c.ate].forEach(function (d) {
    const s = d && sessaoDe(S.protocolo.sessoes, d);
    if (s && s.obs) notas.push(fmtDate(instanteDaData(d)) + ' · ' + s.obs);
  });

  let intervalo = '';
  if (par) {
    const dias = Math.round((instanteDaData(c.ate) - instanteDaData(c.de)) / 86400000);
    intervalo = Math.abs(dias) + (Math.abs(dias) === 1 ? ' dia' : ' dias') + ' entre as duas · ' +
                comFoto.length + ' sessões nesta pose';
  }

  return {
    meta: S.protocolo.sessoes.length + (S.protocolo.sessoes.length === 1 ? ' sessão' : ' sessões'),
    poses: lista.map(function (p) { return { k: p.id, t: p.n }; }),
    pose: c.pose,
    par: par,
    vazio: comFoto.length === 0
      ? 'Nenhuma foto nesta pose ainda.'
      : 'Só uma sessão nesta pose. A comparação começa na segunda.',
    datas: comFoto.map(function (s) { return { d: s.d, txt: fmtDate(instanteDaData(s.d)) }; }),
    de: de, ate: ate,
    sobrepor: c.sobrepor,
    opacidade: c.opacidade,
    intervalo: intervalo,
    notas: notas
  };
};

/** O resumo que aparece na aba DADOS, ao lado de peso e cintura. */
CTX.protocoloFotos = function () {
  const lista = posesDo(S.protocolo.poses);
  const u = ultimaSessaoFoto(S.protocolo.sessoes);
  const dias = diasDesdeAFoto(S.protocolo.sessoes, Date.now());
  const hoje = sessaoDe(S.protocolo.sessoes, hojeISO());
  const cHoje = completude(hoje, S.protocolo.poses);
  const cU = completude(u, S.protocolo.poses);

  return {
    tem: !!u,
    nota: u ? fmtDate(instanteDaData(u.d)) + ' · ' + cU.feitas + ' de ' + cU.total : 'nenhuma sessão ainda',
    // atraso é informação, não cobrança: o app não tem streak nem medalha
    dias: dias == null ? '–' : String(dias),
    diasCor: dias != null && dias > CADENCIA_DIAS ? 'ins-amber' : '',
    cadencia: 'a cada ' + CADENCIA_DIAS + ' dias',
    pontos: lista.map(function (p) {
      return { id: p.id, n: p.n, feita: !!(u && u.fotos[p.id]) };
    }),
    cta: hoje && !cHoje.cheia
      ? 'continuar · ' + cHoje.feitas + ' de ' + cHoje.total
      : (hoje ? 'refazer alguma pose' : 'nova sessão'),
    podeComparar: lista.some(function (p) { return comAPose(S.protocolo.sessoes, p.id).length >= 2; })
  };
};

/**
 * Salta para uma seção do guia.
 *
 * `smooth` diz de onde para onde se foi, que num salto longo é o que evita a
 * sensação de ter trocado de tela. Menos quando o sistema pede movimento
 * reduzido — aí o salto é seco, como o resto do app já faz com as transições.
 */
CTX.vaiParaSecao = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  const parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: parado ? 'auto' : 'smooth', block: 'start' });
};

// ---------- a posição de leitura ----------
// Entrar num destino leva ao topo dele; SAIR devolve onde se estava.
//
// As folhas já faziam isso (ver travaScroll em ui/instrumento/folha.jsx) e as
// telas cheias não: voltar do comparar caía no topo de DADOS, não na linha de
// onde se veio. Numa lista longa isso é perder o lugar toda vez.
//
// Guardado por CHAVE do destino, e não numa pilha: destino que abre outro por
// cima (protocolo -> ajuste) tem que devolver os dois, e uma pilha
// desbalanceada por uma saída que não passou pelo fechar iria escorregando.
const scrollDoDestino = {};

/**
 * Chamada ANTES do `render()`, e a ordem é o ponto: depois dele a página já é a
 * do destino — curta — e o `scrollY` do navegador já veio grampeado nela. A
 * posição que se queria guardar teria sumido meio quadro antes.
 */
function entraNoDestino(chave) {
  scrollDoDestino[chave] = window.scrollY;
  window.scrollTo(0, 0);
}

function saiDoDestino(chave) {
  const y = scrollDoDestino[chave] || 0;
  delete scrollDoDestino[chave];
  // 'instant': suave faz a página deslizar sozinha depois que o destino já
  // sumiu, e parece bug — o mesmo motivo de folha.jsx
  window.scrollTo({ top: y, behavior: 'instant' });
}

// ---------- ajustar uma foto ----------
// Endireitar e reenquadrar depois de tirada. Não destrutivo: o que se grava é
// o AJUSTE, e os bytes no cache e no bucket continuam sendo os da câmera.
//
// A edição acontece numa cópia em `view.ajuste.aj` e só entra em `S` no salvar.
// Sair pelo voltar descarta — sem diálogo de confirmação, porque não há nada a
// perder: o original nunca foi tocado.

/** A foto que está sendo ajustada, e a que está sobreposta a ela. */
function fotosDoAjuste() {
  const v = view.ajuste;
  if (!v) return null;
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const ref = ses && ses.fotos[v.pose];
  if (!ref) return null;
  const outra = v.fantasmaD ? sessaoDe(S.protocolo.sessoes, v.fantasmaD) : null;
  return { ref: ref, outra: outra, refOutra: outra ? outra.fotos[v.pose] : null };
}

/** As datas contra as quais dá para alinhar: as outras sessões naquela pose. */
function datasDoFantasma(d, pose) {
  return comAPose(S.protocolo.sessoes, pose)
    .filter(function (s) { return s.d !== d; })
    .map(function (s) { return { d: s.d, txt: fmtDate(instanteDaData(s.d)) }; });
}

CTX.abreAjuste = function (d, pose) {
  const ses = sessaoDe(S.protocolo.sessoes, d);
  const ref = ses && ses.fotos[pose];
  if (!ref) return;
  // A vizinha: a anterior naquela pose, ou a seguinte quando esta é a mais
  // antiga. Sem o segundo caso, a primeira foto da série — justamente a que
  // ancora o resto — seria a única sem nada contra o que alinhar.
  const viz = vizinhaComAPose(S.protocolo.sessoes, pose, d);
  view.ajuste = {
    d: d, pose: pose,
    enq: normalizaEnq(ref.enq || IDENTIDADE),
    grade: false,
    // o fantasma já vem ligado: alinhar contra outra sessão é o motivo de esta
    // tela existir. Qual data é escolha dele — o padrão é só o palpite.
    fantasma: true,
    fantasmaD: viz ? viz.d : null
  };
  entraNoDestino('ajuste'); render();
  garanteBytesDoCorpo(viz ? [d, viz.d] : [d]);
};

CTX.setDataDoFantasma = function (d) {
  view.ajuste.fantasmaD = d;
  garanteBytesDoCorpo([d]);
  render();
};

CTX.fechaAjuste = function () { view.ajuste = null; render(); saiDoDestino('ajuste'); };
CTX.setGradeDoAjuste = function (on) { view.ajuste.grade = !!on; render(); };
CTX.setFantasmaDoAjuste = function (on) { view.ajuste.fantasma = !!on; render(); };

CTX.setGiroDoAjuste = function (n) {
  const a = view.ajuste.enq;
  // o zoom sobe junto quando o giro passa a exigir mais: normaliza() já faz o
  // piso, e deixar o usuário ver a borda vazia por um quadro seria pior
  view.ajuste.enq = normalizaEnq({ r: n, z: Math.max(a.z, zoomMinimo(n)), cx: a.cx, cy: a.cy, m: a.m });
  render();
};
CTX.setZoomDoAjuste = function (n) {
  const a = view.ajuste.enq;
  view.ajuste.enq = normalizaEnq({ r: a.r, z: n, cx: a.cx, cy: a.cy, m: a.m });
  render();
};
CTX.arrastaAjuste = function (dx, dy) {
  view.ajuste.enq = arrastaRecorte(view.ajuste.enq, dx, dy);
  render();
};

CTX.zeraAjuste = function () {
  view.ajuste.enq = normalizaEnq(IDENTIDADE);
  render();
};

CTX.salvaAjuste = async function () {
  const v = view.ajuste;
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const ref = ses && ses.fotos[v.pose];
  if (!ref) { view.ajuste = null; render(); return; }

  // Ajuste que é a identidade SAI do estado em vez de virar um objeto de zeros.
  // O estado é reserializado a cada série registrada, e "sem ajuste" e "ajuste
  // que não faz nada" são a mesma coisa para quem desenha.
  const novo = Object.assign({}, ref, { enq: ehIdentidade(v.enq) ? undefined : Object.assign({}, v.enq, { m: Date.now() }) });
  if (novo.enq === undefined) delete novo.enq;

  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[v.pose] = novo;
  ses.m = Date.now();
  view.ajuste = null;
  await save();
  render(); saiDoDestino('ajuste');
  toast(novo.enq ? 'Ajuste salvo.' : 'Ajuste desfeito.');
};

/** O que a tela de ajuste consome. */
CTX.ajusteEmEdicao = function () {
  const v = view.ajuste;
  const f = fotosDoAjuste();
  if (!v || !f) return null;
  const p = poseDe(v.pose);
  return {
    d: v.d,
    pose: p ? p.n : v.pose,
    data: fmtDate(instanteDaData(v.d)),
    url: CORPO.urlDaFoto(v.d, v.pose, f.ref),
    enq: v.enq,
    refUrl: f.outra && f.refOutra ? CORPO.urlDaFoto(f.outra.d, v.pose, f.refOutra) : null,
    refEnq: f.refOutra ? f.refOutra.enq : null,
    refTxt: f.outra ? fmtDate(instanteDaData(f.outra.d)) : '',
    grade: v.grade,
    fantasma: v.fantasma,
    fantasmaD: v.fantasmaD,
    datas: datasDoFantasma(v.d, v.pose),
    sujo: !ehIdentidade(v.enq)
  };
};

// ---------- a câmera de dentro do app ----------
// Alinhar ANTES do disparo, e não corrigir depois: nenhum recorte devolve o pé
// que saiu do quadro. O `<input capture>` continua ali como alternativa — ele
// dá a melhor qualidade que o aparelho sabe produzir, e é quem atende quando a
// câmera interna não estiver disponível.

let streamCamera = null;
let contagemT = null;

CTX.streamDaCamera = function () { return streamCamera; };

/** Desliga a câmera e cancela a contagem. Toda saída passa por aqui. */
function encerraCamera() {
  clearTimeout(contagemT); contagemT = null;
  CAM.fecha(streamCamera);
  streamCamera = null;
}

CTX.abreCamera = async function () {
  const v = view.protocolo;
  if (!v) return;
  const viz = vizinhaComAPose(S.protocolo.sessoes, v.pose, v.d);
  view.camera = {
    erro: null, pronta: false,
    fantasma: true, fantasmaD: viz ? viz.d : null,
    opacidade: 45, grade: false,
    // 10s por padrão: é quanto leva para andar três metros e parar de balançar
    timer: 10, contagem: null
  };
  entraNoDestino('camera'); render();
  garanteBytesDoCorpo(viz ? [v.d, viz.d] : [v.d]);

  const r = await CAM.abre();
  if (!view.camera) { if (r.ok) CAM.fecha(r.stream); return; }   // saiu enquanto abria
  if (!r.ok) { view.camera.erro = r.msg; render(); return; }
  streamCamera = r.stream;
  view.camera.pronta = true;
  render();
};

CTX.fechaCamera = function () {
  encerraCamera();
  view.camera = null;
  render(); saiDoDestino('camera');
};

CTX.setGradeDaCamera = function (on) { view.camera.grade = !!on; render(); };
CTX.setFantasmaDaCamera = function (on) { view.camera.fantasma = !!on; render(); };
CTX.setOpacidadeDaCamera = function (n) { view.camera.opacidade = n; render(); };
CTX.setTimerDaCamera = function (n) { view.camera.timer = n; render(); };
CTX.setDataDoFantasmaDaCamera = function (d) {
  view.camera.fantasmaD = d;
  garanteBytesDoCorpo([d]);
  render();
};

CTX.cancelaDisparo = function () {
  clearTimeout(contagemT); contagemT = null;
  if (view.camera) view.camera.contagem = null;
  render();
};

/**
 * A contagem. Um bipe por segundo e dois no disparo — a três metros o ouvido é
 * o único canal que chega, porque a tela daqui não se lê.
 */
function contaEDispara(n) {
  if (!view.camera) return;
  view.camera.contagem = n;
  render();
  if (n <= 0) { contagemT = null; capturaAgora(); return; }
  bipeDaContagem(n);
  contagemT = setTimeout(function () { contaEDispara(n - 1); }, 1000);
}

function bipeDaContagem(n) {
  try {
    if (!audioCtx) preparaAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine';
    // o último segundo sobe de tom: é o aviso de "agora pare de mexer"
    osc.frequency.setValueAtTime(n <= 1 ? 1320 : 660, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0 + 0.14);
  } catch (e) {}
}

CTX.disparaCamera = function () {
  const c = view.camera;
  if (!c || !c.pronta || c.contagem != null) return;
  preparaAudio();                      // o gesto de toque é o que libera o áudio
  if (!c.timer) { capturaAgora(); return; }
  contaEDispara(c.timer);
};

async function capturaAgora() {
  const c = view.camera, v = view.protocolo;
  if (!c || !v) return;
  const el = document.querySelector('.cam-video');
  if (!CAM.pronto(el)) { c.contagem = null; toast('A câmera ainda não está pronta.'); render(); return; }
  try {
    const reduzida = await CORPO.reduzDoVideo(el);
    const prox = await guardaFotoDaPose(v.d, v.pose, reduzida);
    c.contagem = null;
    // a sessão continua AQUI: são nove poses, e sair e voltar nove vezes seria
    // pior que o problema que esta tela resolve
    const viz = prox ? vizinhaComAPose(S.protocolo.sessoes, prox, v.d) : null;
    if (prox) {
      c.fantasmaD = viz ? viz.d : null;
      garanteBytesDoCorpo(viz ? [viz.d] : []);
    }
    aviso();
    render();
    if (!prox) toast('Sessão completa. As nove poses estão registradas.');
  } catch (e) {
    c.contagem = null;
    toast('Não deu para guardar a foto.');
    render();
  }
}

/** O que a tela da câmera consome. */
CTX.cameraViva = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v) return null;
  const lista = posesDo(S.protocolo.poses);
  const i = Math.max(0, lista.findIndex(function (p) { return p.id === v.pose; }));
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const outra = c.fantasmaD ? sessaoDe(S.protocolo.sessoes, c.fantasmaD) : null;
  const refOutra = outra ? outra.fotos[v.pose] : null;

  return {
    pose: lista[i].n,
    indice: i + 1,
    total: lista.length,
    data: fmtDate(instanteDaData(v.d)),
    erro: c.erro,
    pronta: c.pronta,
    feita: !!(ses && ses.fotos[v.pose]),
    grade: c.grade,
    fantasma: c.fantasma,
    fantasmaD: c.fantasmaD,
    datas: datasDoFantasma(v.d, v.pose),
    refUrl: outra && refOutra ? CORPO.urlDaFoto(outra.d, v.pose, refOutra) : null,
    refEnq: refOutra ? refOutra.enq : null,
    refTxt: outra ? fmtDate(instanteDaData(outra.d)) : '',
    opacidade: c.opacidade,
    timer: c.timer,
    contagem: c.contagem
  };
};
