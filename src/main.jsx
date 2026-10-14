import {
  ROT_BASE, D_COMPOSTO, D_MAQUINA, D_MEDIO, D_ISOLADOR, D_CURTO,
  PROGRAMA, RULES, ALT, slugEx, EX_BASE, FREQUENTES_NO_BOX,
  PRIORIDADES, NIVEIS, nivelDe, ordemDe, regiaoDe, REGIOES, ehPriorizado, PRIO, CARGAS, DORES, MODAIS,
  MOVIMENTOS_DE_BOX
} from './dominio/programa';
import { caixaDeFrase as _caixaDeFrase,
  fmtNum, fmtCarga, fmtInt, fmtDec, fmtSig, fmtDec2, fmtSig2, fmtK, casaBusca, fmtHoraDita,
  DIAS_CURTOS, DIAS_LONGOS, MESES, periodoDe,
  fmtHora, fmtDur, semanasDesde, diaExtenso, fmtDate, weekStart, sameDay, fmtDesc,
  escapeHTML, escAttr
} from './dominio/formato';
import {
  totalAnilhas, isTime, tutOf, volOf, maxLoad, repsOf, topReps,
  unidadeDe, temUnidade, cronometrado, menosEhMelhor, ritmoDe,
  ROTULO_UNIDADE, ESCALA_RITMO
} from './dominio/carga';
import { montaNoApp, desmontaDoApp } from './ui/raiz.jsx';
import { camadasAbertas, sincronizaHistorico, liga as ligaNavegacao } from './ui/navegacao.js';
import { ehBancada } from './palco.js';
import { MIN_PESAGENS as MIN_PESAGENS_CORPO, semanaEmCurso, ajusteDoVeredito, leituraVigente, JANELA_MIN, JANELA_MAX, VALIDADE_LEITURA, MIN_REGISTRADOS, ALVO_MIN, ALVO_MAX, leituraDaEvolucao, portoesDaRegra, semanasDaRegra } from './dominio/corpo';
import { ondeEleEstava, proximoDepois } from './dominio/sessao';
import { cartaoDeCima } from './dominio/agora';
import { venceuPorPosicao } from './dominio/prescricao';
import { leAula } from './dominio/aula';
import { regua, pagina, anda, faixaDoTexto } from './dominio/regua';
import { teclar } from './dominio/teclado';
import { e1rmPorSemana, sinalDeForca, tendenciaDeForca, textoDaTendencia } from './dominio/forca';
import { App } from './ui/app.jsx';
import { FolhaDia, FolhaRefeicao } from './ui/folhas/refeicao.jsx';
import { FolhaEditaAlimento, FolhaEditaRefeicao, FolhaSeletor } from './ui/folhas/editores.jsx';
import { FolhaFoto } from './ui/folhas/foto.jsx';
import { FolhaMenuDaSessao } from './ui/folhas/menusessao.jsx';
import { FolhaPesoRapido } from './ui/folhas/pesorapido.jsx';
import { FolhaPoeODia } from './ui/folhas/poeodia.jsx';
import { FolhaDecidir } from './ui/folhas/decidir.jsx';
import { Protocolo } from './ui/telas/protocolo.jsx';
import { Comparar } from './ui/telas/comparar.jsx';
import { Evolucao } from './ui/telas/evolucao.jsx';
import { Dia } from './ui/telas/dia.jsx';
import { AjusteFoto } from './ui/telas/ajustefoto.jsx';
import { Camera } from './ui/telas/camera.jsx';
import { Ajustes } from './ui/telas/ajustes.jsx';
import { Sessao } from './ui/telas/sessao.jsx';
import { Historico } from './ui/telas/historico.jsx';
import { SessaoModo } from './ui/telas/sessaomodo.jsx';
import { Retrospectiva } from './ui/telas/retrospectiva.jsx';
import { Retroativo } from './ui/telas/retroativo.jsx';
import { Programa } from './ui/telas/programa.jsx';
import { CADENCIA_PADRAO, diaDeHoje, previsaoDoHorizonte, proximoTreino } from './dominio/dia';
import { diasComTreino as _diasComTreino, inicioDoDia as _inicioDoDia, iniciosDoPeriodo as _iniciosDoPeriodo, leituraDosDias as _leituraDosDias,
         serieDaMediaMovel as _serieDaMediaMovel } from './dominio/mes';
import { ALIMENTOS_BASE, PLANO_BASE, TURNOS } from './dominio/nutricao/alimentos';
import {
  aplicaAjusteNoArroz, tiraMarcaDeArroz, listaDeCompras, totalDaRefeicao, totalDoDia,
  refeicoesDeHoje, posTreinoDe, refeicoesMovidas, duracaoDaSessao, minutosDe,
  fechaDia, aderenciaDoDia, padraoPorRefeicao, janelaDoHistorico, diasInterpretaveis, diaInterpretavel,
  aderenciaPorSemana, contagemDaRefeicao, recorteDoHistorico, trocasDeAjuste,
  poeComidaNoDia, resumoDaRefeicao, FOLGA_POS
} from './dominio/nutricao/calculo';
import { Exercicio } from './ui/exercicio.jsx';
import { alvoDoPrograma, seriesDeGrupo, impacto, impactoDoMod as _impactoDoMod,
         seriesPorMusculo as _seriesPorMusculo, leituraDaSemana } from './dominio/volume';
import { MARCAS_DO_CORPO, MARCAS_DA_BIO, MEDIDAS_DO_CORPO, MEDIDAS_DE_FITA, medidaDoCorpo, ondeMediu,
         mediasSemanais, pesoRitmo as _pesoRitmo,
         cinturaMes as _cinturaMes, veredito as _veredito } from './dominio/corpo';
import { PAUSA_DIAS, diasDesde, historico as _historico, lastSet as _lastSet,
         pausaEx as _pausaEx, dorSeguida as _dorSeguida, shouldUp as _shouldUp,
         setsFor as _setsFor } from './dominio/progressao';
import { PLANO_ATUAL, listaDePromo, migraPlano, migraPlano3, migraPlano4, migraPlano5, migraPlano6, migraPlano7, migraPlano8, migraPlano9, migraPlano10, migraPlano11, migraPlano12 } from './dominio/migracoes';
import { semeiaProg, montaCatalogo as _montaCatalogo, exercicioFantasma } from './dominio/programa';
import { DB } from './infra/db';
import {
  chaveDeAula, chaveDeCardio, chaveDeDescanso, chaveDeFoto, chaveDeFotoDoCorpo, chaveDeLog,
  chaveDeMarca, chaveDePromo, chaveDeRefeicaoFeita, chaveDeSessaoFoto, chaveDeSessao, funde,
  lapidesDoApagamento, uneLapides
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

// O app já foi desligado? Toda continuação `async` deste arquivo pergunta isto
// depois de um `await`, e `render()` pergunta antes de pintar. Quem desliga é
// `CTX.desliga()`, lá embaixo, junto com a explicação.
//
// Declarada AQUI, antes de tudo, e não ao lado de quem a escreve: `load()` pode
// rodar ainda na avaliação deste módulo — script de módulo é diferido, e aí
// `document.readyState` já é 'interactive' — e o boot pinta a primeira tela.
// Um `let` mais abaixo faria dessa primeira pintura um erro de TDZ.
let desligado = false;

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
      const novo = { id:x.id, s:x.s, r:x.r, d:x.d, u:x.u, q:x.q, desde:0, mod:2, orig:x.id + '#' + x.n };
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
    // A medida do dia. Não carrega `de`/`para` como os outros mods porque não
    // há o que desfazer para: a grandeza de um movimento de box não tem valor
    // oficial anterior — ela nasce no dia, com a lousa.
    if (x.k === 'med')   { sl.u = x.u; sl.q = x.q; sl.mod = sl.mod || 1; }
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
/** O dia se decide NO dia: sábado é o que o box programar. */
function diaAberto(d) { const t = treino(d); return !!(t && t.aberto); }

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

/** O nome que o exercício tem no CÓDIGO, quando ele vem de lá. */
function nomeDoCodigo(idEx) { return (EX_BASE[idEx] && EX_BASE[idEx].n) || null; }

/**
 * Troca o nome de um exercício sem mexer na identidade dele.
 *
 * A chave do histórico é o ID, e o id nasce do nome uma vez só — depois disso
 * ele é IDENTIDADE, não rótulo. Renomear grava `n` no mesmo id, e por isso
 * histórico, prescrição no programa, foto do aparelho e correção de tipo de
 * carga continuam apontando para o mesmo lugar: nada se move.
 *
 * Recalcular o id a partir do nome novo seria o oposto — criaria um exercício
 * vazio e deixaria todo o passado órfão sob uma chave sem dono. É exatamente o
 * erro que a migração 2→3 deste app existiu para consertar.
 *
 * O id fica com o slug do nome ANTIGO para sempre, e isso está certo: ele é um
 * identificador, e ninguém o lê.
 */
async function renomeiaExercicio(idEx, bruto) {
  if (!CAT[idEx]) return;
  const nome = String(bruto || '').trim().replace(/\s+/g, ' ');
  if (nome.length < 3) { toast('O nome precisa de três letras ou mais.'); return; }

  // Nome repetido não quebra nada — os ids são diferentes —, mas deixa duas
  // linhas iguais na troca e no histórico, e aí ninguém sabe qual é qual.
  const repetido = Object.keys(CAT).some(function (k) {
    return k !== idEx && !CAT[k].arq && CAT[k].n.toLowerCase() === nome.toLowerCase();
  });
  if (repetido) { toast('Já existe um exercício com esse nome.'); return; }

  const doCodigo = nomeDoCodigo(idEx);
  const marca = Object.assign({}, S.ex[idEx] || {});
  if (doCodigo && doCodigo === nome) {
    // voltou ao nome do treinador: o override some em vez de virar cópia
    delete marca.n;
    if (Object.keys(marca).length) S.ex[idEx] = marca; else delete S.ex[idEx];
  } else {
    marca.n = nome;
    S.ex[idEx] = marca;
  }

  montaCatalogo();
  await save(); render();
  toast(doCodigo && doCodigo === nome ? 'Nome do treinador de volta.' : 'Nome trocado.');
}


// O treino como ele aparece na tela: slot resolvido contra o catálogo, com os
// mods da sessão de hoje aplicados por cima. Mesma forma dos exercícios de
// antes, para o resto do app não precisar saber de nada disso.
function treino(d) {
  const p = S.prog && S.prog[d];
  if (!p) return null;
  return { name: p.name, tag: p.tag, aberto: p.aberto, ex: aplicaMods(d, p.ex).map(function (sl) {
    const e = exDe(sl.id);
    // A grandeza do SLOT vence a do catálogo: o mesmo remo é 500 m num sábado
    // e 15 cal no outro, e quem decide é a lousa do box. O catálogo só diz com
    // o que o campo nasce preenchido.
    return { id:sl.id, n:e.n, car:e.car, g:e.g, c:e.c, cue:e.cue, u:sl.u || e.u,
             q:sl.q, peg:e.peg, pegPe:e.pegPe,
             s:sl.s, r:sl.r, d:sl.d, rir:sl.rir || '', desde:sl.desde, bi:sl.bi || 0,
             mod:sl.mod || 0, orig:sl.orig || sl.id };
  }) };
}

// ---------- as medidas do corpo ----------
// `S.body` tem uma coleção por grandeza, e a lista delas vive em
// `MARCAS_DO_CORPO` (`src/dominio/corpo.ts`). Estas duas funções existem para
// que NENHUM lugar do app escreva essa lista à mão: o estado inicial, o
// `normalizaEstado`, o apagar tudo e a lista branca da importação passam todos
// por aqui. Enquanto era `{ peso, cintura }` havia quatro cópias da forma, e
// foi por uma lista escrita à mão que a importação derrubou seis campos de topo
// em silêncio.

/** Um `S.body` vazio, com todas as séries de medida. */
function corpoVazio() {
  const b = {};
  MARCAS_DO_CORPO.forEach(function (k) { b[k] = []; });
  return b;
}

/** O `S.body` de um backup, chave por chave. O que não for lista vira lista. */
function corpoDoBackup(body) {
  const b = corpoVazio();
  if (!body || typeof body !== 'object') return b;
  MARCAS_DO_CORPO.forEach(function (k) { if (Array.isArray(body[k])) b[k] = body[k]; });
  return b;
}





let S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[], body:corpoVazio(), carga:{}, export:0, plano:PLANO_ATUAL, prog:null, rot:null, ex:{}, mods:null, progLog:[], aulas:[], protocolo:{ poses:null, sessoes:[] }, promoPendente:[] };
let view = { day:'A', open:null, hist:null, json:null, paste:false, swapOpen:null, sessao:null, modoSessao:false, edit:null, retro:false, nota:null, carga:null, mes:0, add:null, cardioRapido:false,
  editProg:false, addEx:false, addQ:'', novoEx:false, prog:null, medida:null, aulas:false, rapido:false,
  protocolo:null, comparar:null, evolucao:null, diaAberto:null, ajuste:null, camera:null, ajustes:false };
let timer = null, timerFim = 0, timerTotal = 0, timerAvisado = false, timerCtx = '';
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
  if (typeof S.ajuste !== 'number' || !isFinite(S.ajuste)) S.ajuste = 0;
  S.ajuste = Math.round(S.ajuste);
  if (!Array.isArray(S.ajusteHist)) S.ajusteHist = [];
  if (!Array.isArray(S.gordura)) S.gordura = [];
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
  // As SETE séries de medida, enumeradas de `MARCAS_DO_CORPO`: peso e cintura,
  // mais as cinco da bioimpedância que a migração 9→10 abriu. Lista escrita à
  // mão aqui era o que deixava uma grandeza nova sem padrão no aparelho novo.
  if (!S.body || typeof S.body !== 'object') S.body = corpoVazio();
  MARCAS_DO_CORPO.forEach(function (k) { if (!Array.isArray(S.body[k])) S.body[k] = []; });
  if (typeof S.plano !== 'number') S.plano = 1;   // estado anterior à troca de programa
  if (!S.ex || typeof S.ex !== 'object') S.ex = {};
  if (!S.mods || typeof S.mods !== 'object' || !S.mods.day || !Array.isArray(S.mods.list)) S.mods = null;
  if (!Array.isArray(S.progLog)) S.progLog = [];
  // Campo novo e opcional: recebe padrão aqui, sem migração — não há dado
  // existente a reformatar, e um backup de qualquer versão chega por este
  // mesmo caminho.
  if (!Array.isArray(S.aulas)) S.aulas = [];
  if (!S.quadro || typeof S.quadro !== 'object') S.quadro = null;
  if (!Array.isArray(S.comidaHist)) S.comidaHist = [];
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
  // Coleção desde o plano 10. O OBJETO antigo fica INTACTO aqui para
  // `migraPlano10` convertê-lo: `normalizaEstado` roda ANTES das migrações, nos
  // dois caminhos, e tratar a pergunta guardada como "forma inválida" a
  // apagaria antes de alguém poder convertê-la. Só o que não é nem lista nem
  // objeto vira lista vazia.
  if (!Array.isArray(S.promoPendente) && !(S.promoPendente && typeof S.promoPendente === 'object')) {
    S.promoPendente = [];
  }
  // Já sendo lista, ela entra ORDENADA por tempo. O escritor ordena
  // (`guardaPromo`) e a fusão ordena (`porTempo` em `dominio/sincronia.ts`),
  // mas a IMPORTAÇÃO copia a chave como ela vem no arquivo — e os DOIS leitores
  // confia na ordem: a lista de Prescrição apresenta na ordem em que as sessões
  // fecharam, que é "a mais antiga primeiro — a única ordem que ele reconhece",
  // escrito desde que a pergunta era uma tela só. Fora de ordem, a lista mostra
  // a mudança mais nova na frente, o contrário do que está escrito.
  if (Array.isArray(S.promoPendente)) {
    S.promoPendente.sort(function (a, b) { return ((a && a.t) || 0) - ((b && b.t) || 0); });
  }
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
  const m7 = migraPlano7(S);
  migraPlano8(S);
  migraPlano9(S);
  migraPlano10(S);
  migraPlano11(S);
  migraPlano12(S);
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

  // Sessão vencida fecha ANTES de decidir a rota — e DIZ que fechou (§7.7 da
  // frente 3). Antes o retorno era ignorado: o fecho por inatividade na
  // abertura seguinte acontecia em silêncio, e é o caminho comum — 16 das 35
  // sessões do registro dele fecharam sem ele (P1). O lançamento retroativo
  // fecha calado: não era uma sessão ao vivo.
  const vencida = S.sessao;
  if (encerraSePreciso() && vencida && !vencida.retro) toast(fraseDoFechoNaUltima(vencida, 'Fechei'));
  ligaBatida();
  // Abrir o app com treino em andamento cai no treino, não em HOJE. Sair e
  // voltar no meio de uma série é o caso mais comum de reabertura que existe
  // neste app, e devolvê-lo a HOJE cobrava dois toques com o celular na mão
  // suada. Se a sessão venceu, `encerraSePreciso` já a fechou e nada disto vale.
  const diaAberto = diaDaSessaoAberta();
  view.day = diaAberto || nextDay();
  if (diaAberto) { view.aba = 'agora'; abreModo(); }
  render();
  // O BOOT NÃO INTERROMPE MAIS. Aqui havia `abrePromoGuardada()`, que abria a
  // tela de decisão em cima de quem acabou de abrir o app — para perguntar
  // sobre o programa, que é a pergunta menos urgente que existe neste produto.
  //
  // A fila agora mora em Prescrição, com a conta de volume e o vencimento ao
  // lado de cada mudança (§8.1, passo 3), e o Agora avisa com UMA LINHA na
  // manhã do dia em que aquele treino volta (passo 4). O mecanismo que carrega
  // a mudança continua inteiro — é ele que o §3.6 do plano manda não apagar.
  //
  // E `abrePromoGuardada` SAIU com ela, por ter ficado sem chamador. A TELA
  // inteira saiu depois, com a decisão D1 — e junto dela entrou o carregador no
  // fecho MANUAL, que não existia: `fechaSessao` só copiava a mudança no fecho
  // automático, e tirar a pergunta sem escrever o carregador faria finalizar no
  // toque descartar a mudança em silêncio (o F280 nominal, não o risco dele).
  // O descanso que estava correndo. Depois do render, porque ele pinta na barra
  // que vive fora da árvore do Preact e precisa dela já montada.
  await retomaDescanso();
  // Antes da primeira leitura de foto, e depois do render: a tela já está de pé
  // e não pode procurar os bytes no cache com o nome antigo.
  await FOTO.migraCache();
  carregaFotosDoDia();

  // A nuvem entra DEPOIS de a tela já estar de pé: o app não espera rede para
  // funcionar, e quem chegou primeiro é o dado do aparelho.
  await carregaSync();
  await NUVEM.pronta();
  if (NUVEM.sessao()) { render(); sincroniza(); }
  // O que a 6→7 apagou merece ser dito: apagar histórico em silêncio é o tipo
  // de coisa que a pessoa descobre semanas depois e não sabe se foi bug.
  if (m7 && m7.entradas) {
    await save();
    toast('Histórico do HYROX zerado: ' + m7.entradas +
      (m7.entradas === 1 ? ' entrada' : ' entradas') + ' em ' + m7.exercicios +
      (m7.exercicios === 1 ? ' exercício.' : ' exercícios.'));
  }
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
//
// Eram 4 horas, e 4 horas nunca encerraram nada de útil: quem esquece de
// finalizar guarda o celular e só reabre no dia seguinte, quando a virada do
// dia já tinha fechado a sessão. O limite real de um treino parado é bem
// menor — 1h30 sem série nova não é descanso, é treino esquecido.
const SESSAO_LIMITE = 90*60*1000;

// Depois de perguntar, quanto o app espera antes de encerrar sozinho.
//
// Existe porque a pergunta só vale se houver chance de responder: encerrar no
// mesmo instante em que pergunta seria decorar uma decisão já tomada. Dez
// minutos cobrem banheiro, fila do aparelho e telefonema — e não custam nada,
// porque a duração gravada vai até a ÚLTIMA SÉRIE, não até o fecho.
const GRACA_ENCERRAMENTO = 10*60*1000;

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
  // Na abertura o app fecha o que já passou da graça. Entre o limite e ela, a
  // sessão continua viva e a faixa pergunta — reabrir o app é justamente a
  // chance de responder.
  const parada = paradaDaSessao(s);
  if (parada < SESSAO_LIMITE + GRACA_ENCERRAMENTO && sameDay(s.inicio, Date.now())) return false;
  fechaSessao('auto');
  return true;
}

/**
 * Há quanto tempo a sessão não recebe série.
 *
 * Pausado devolve zero: pausar é intenção declarada, e cobrar inatividade de
 * quem avisou que parou seria punir o aviso. Só a virada do dia encerra uma
 * sessão pausada, como já era.
 */
function paradaDaSessao(s) {
  if (!s || s.pausadoEm) return 0;
  return Date.now() - (s.ultima || s.inicio);
}

/** Parada o bastante para o app perguntar se ele ainda está treinando. */
function sessaoEsquecida(s) {
  return paradaDaSessao(s) >= SESSAO_LIMITE;
}

// A batida que faz a pergunta aparecer sem reabrir o app.
//
// `encerraSePreciso` só roda no boot, e isso bastava quando o limite era de 4
// horas: ninguém fica com o app aberto tanto tempo. Com 1h30 o caso comum é
// outro — o celular fica na bancada com o app aberto, e sem batida a pergunta
// só apareceria na próxima abertura, que é tarde demais para ser pergunta.
let batida = null;
let faixaPerguntando = false;

function ligaBatida() {
  if (batida) return;
  batida = setInterval(function () {
    const s = S.sessao;
    if (!s) { faixaPerguntando = false; return; }
    const parada = paradaDaSessao(s);
    if (parada >= SESSAO_LIMITE + GRACA_ENCERRAMENTO) {
      fechaSessao('auto');
      faixaPerguntando = false;
      save(); render();
      toast(fraseDoFechoNaUltima(s, 'Fechei'));
      return;
    }
    // Só repinta na VIRADA: a faixa sai de atalho para pergunta uma vez, e
    // renderizar a cada 30 s sem nada mudar seria trabalho por nada.
    const agora = parada >= SESSAO_LIMITE;
    if (agora !== faixaPerguntando) { faixaPerguntando = agora; render(); }
  }, 30000);
}

// ---------- as perguntas de programa que esperam ----------
// Coleção com chave natural, lápide e teto, como o resto do estado que dois
// aparelhos tocam. Era um documento — uma pergunta, ou `null` —, e a escrita era
// atribuição direta: o fecho seguinte sobrescrevia o anterior, e a fusão trazia
// o campo inteiro do lado com `mtime` mais novo.
//
// As duas funções recebem a SESSÃO e o `sid`, não o modo de fecho: nenhuma
// delas sabe se o fecho foi manual ou automático, e é de propósito. Hoje só o
// fecho automático guarda (`fechaSessao`, logo abaixo) porque pela porta da
// frente quem pergunta é `finalizarSessao`; quando a pergunta do fim do treino
// sair, o fecho manual passa a guardar pelo mesmo caminho, sem mexer na forma
// do dado.

/** Guarda a decisão de uma sessão para a próxima abertura. */
function guardaPromo(s, pendentes) {
  if (!Array.isArray(S.promoPendente)) S.promoPendente = listaDePromo(S.promoPendente);
  const agora = Date.now();
  const p = {
    sid: s.sid, day: s.day, t: agora,
    mods: JSON.parse(JSON.stringify(pendentes)),
    resumoMods: pendentes.map(function (m) { return textoMod(s.day, m); }),
    m: agora
  };
  // a chave é o `sid`: fechar a mesma sessão duas vezes atualiza, não duplica
  const j = S.promoPendente.findIndex(function (x) { return chaveDePromo(x) === chaveDePromo(p); });
  if (j >= 0) S.promoPendente[j] = p; else S.promoPendente.push(p);
  S.promoPendente.sort(function (a, b) { return (a.t || 0) - (b.t || 0); });
  if (S.promoPendente.length > 60) S.promoPendente = S.promoPendente.slice(-60);
}

/**
 * Resolve a pergunta de UMA sessão: ela sai da lista e ganha lápide.
 *
 * A lápide é o que impede o outro aparelho de trazer de volta a pergunta que ele
 * acabou de responder — é a mesma regra das outras coleções. E tirar só a desta
 * sessão é o que impede o contrário: responder uma apagava todas as outras,
 * porque o campo era um documento só.
 */
function soltaPromo(sid) {
  if (!Array.isArray(S.promoPendente)) S.promoPendente = listaDePromo(S.promoPendente);
  if (sid == null) return;
  const chave = chaveDePromo({ sid: sid, t: sid });
  S.promoPendente = S.promoPendente.filter(function (x) { return chaveDePromo(x) !== chave; });
  lapide(chave);
}

// ---------- as palavras do fecho (§7.7 da frente 3) ----------
// Quatro maneiras de a sessão acabar, e três gravam um fim diferente. A palavra
// diz qual: o fecho no toque grava o instante do toque e a duração é medida; os
// dois fechos que vão até a última série dizem "aproximada", porque ninguém
// mediu o que houve depois dela (F152). "Encerrei" e "Fechei" na primeira
// pessoa do app: encerrar é ato do registro, e a voz passiva escondia o agente.
function oTreino(dia) { return diaAberto(dia) ? 'a aula' : 'o Treino ' + dia; }
/** A frase de um fecho que foi até a última série — "já parei" ou o automático. */
function fraseDoFechoNaUltima(s, verbo) {
  const marca = S.done.filter(function (x) { return x.sid === s.sid; })[0];
  const ultima = s.ultima || s.inicio;
  // Na abertura seguinte a sessão pode ser de outro dia: "o Treino A de ontem".
  const dia = rotuloDoDia(s.inicio);
  return verbo + ' ' + oTreino(s.day) + (dia === 'hoje' ? '' : ' de ' + dia) +
    ' na última série, às ' + fmtHoraDita(ultima) +
    '. A duração vai até ela: cerca de ' + fmtDur(marca ? marca.dur : 0) + ', aproximada.';
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
    // A outra escolha diante da dor repetida (§7.4 da frente 3): "fazer mesmo
    // assim" também fica escrito no dia, como o pulado.
    if (s.dorMesmoAssim && s.dorMesmoAssim.length) marca.dorMesmoAssim = s.dorMesmoAssim.slice();
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
  //
  // E só em dia de PRESCRIÇÃO, pela mesma razão escrita em `finalizarSessao`:
  // num dia ABERTO o que foi adicionado É o dia, não uma emenda a ele — não há
  // conteúdo permanente para aquilo virar. A razão não fala do modo de fecho, e
  // por isso vale para os dois. Sem esta metade, a aula de box que fechava
  // SOZINHA enfileirava os movimentos como mudança esperando decisão e a
  // encerrada no toque não: mesma situação, dois resultados, e uma pergunta por
  // semana sem resposta certa.
  const pendentes = (comoFim === 'auto' && !diaAberto(s.day)) ? modsDoDia(s.day) : [];
  if (pendentes.length) guardaPromo(s, pendentes);

  // O quadro do box vira a nota da sessão. É a única chance: ele não se
  // reconstrói depois a partir da prescrição, como o treino de musculação se
  // reconstrói. Sem isto, o time cap, o peso em libras e o "alternate with
  // partner" não ficam em lugar nenhum.
  if (marca && S.quadro && S.quadro.day === s.day) {
    marca.obs = S.quadro.texto;
    marca.m = Date.now();
  }
  if (S.quadro && S.quadro.day === s.day) S.quadro = null;

  S.sessao = null;
  S.draft = null;
  S.mods = null;   // as mudanças do dia não sobrevivem ao fim da sessão
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
  const seg = temUnidade(ex);
  const corpo = isCorpo(key, ex);
  const sets = [];
  let any = false;
  for (let k = 0; k < setsFor(ex); k++) {
    const x = e.s[k];
    // em movimento com grandeza própria ou de peso do corpo o segundo campo basta
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
  // A grandeza vai carimbada no registro, não lida do catálogo na hora de
  // mostrar: o catálogo muda, e o que foi feito não muda com ele. `q` viaja
  // junto porque sem ele não há ritmo — e sem ritmo 500 m e 1000 m caem no
  // mesmo histórico como se fossem a mesma coisa.
  const un = unidadeDe(ex);
  if (un) entry.u = un; else delete entry.u;
  if (un && ex.q > 0) entry.q = ex.q; else delete entry.q;
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

/**
 * Os estados dos exercícios de um dia, na ordem do treino.
 *
 * Recebe o dia em vez de ler `view.day`: o atalho de voltar ao treino é
 * consultado de OUTRA aba, onde o dia aberto pode não ser o da sessão.
 */
function estadosDoDia(dia) {
  const d = dia || view.day;
  const t = treino(d);
  if (!t) return [];
  const s = S.sessao;
  return t.ex.map(function (_, j) {
    return estadoEx(d, j, s ? s.sid : null, s ? s.pulados : []);
  });
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
  // §7.5 da frente 3: pular é reversível a um toque, então não há pergunta
  // antes — há a frase do que ficou guardado depois, com o nome, e o desfazer
  // na própria linha. "Pulado" concorda com "exercício", e não com o nome: a
  // frente escreveu "pulada" porque o exemplo era "Elevação lateral", e o nome
  // muda de gênero de um exercício para outro.
  const ex = treino(view.day).ex[i];
  const nome = ex ? ex.n : 'o exercício';
  toast(j >= 0
    ? 'Desfeito: ' + nome + ' voltou para a fila desta sessão.'
    : 'Guardei como pulado hoje: ' + nome + '. Não volta a ser pedido nesta sessão; desfazer põe de volta na fila.');
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
    // PARE (§3.3): o horário e a duração saem e não voltam.
    if (!(await pare({ texto: 'Descartar esta sessão apaga o horário de início e a duração. Nenhuma série foi registrada nela, então não há série para perder.',
                       sim: 'Descartar a sessão' }))) return;
    lapide(chaveDeSessao({ sid: s.sid }));
    S.done = S.done.filter(function (x) { return x.sid !== s.sid; });
    S.sessao = null; S.draft = null; S.mods = null;
    view.open = null; view.editProg = false;
    view.day = nextDay();
    soltarTela();
    await save(); render(); window.scrollTo(0, 0);
    toast('Sessão descartada.');
    return;
  }

  const pend = p.parcial.concat(p.nada);
  if (pend.length) {
    // A PERGUNTA neutra, não o pare: nada se destrói — os pendentes ficam
    // escritos como não feitos. Botões da §7.7: "Encerrar assim" e "Voltar ao
    // treino"; o diálogo do sistema só sabe dizer OK e Cancelar.
    const lista = pend.slice(0, 4).map(function (x) { return x.nome; }).join(', ') +
                  (pend.length > 4 ? ' e mais ' + (pend.length - 4) : '');
    const um = pend.length === 1;
    if (!(await pare({ tom: 'pergunta',
        texto: 'Encerrar com ' + (um ? '1 exercício pendente' : pend.length + ' exercícios pendentes') + ': ' + lista + '. ' +
               (um ? 'Ele fica marcado como não feito' : 'Eles ficam marcados como não feitos') + ' no histórico.',
        sim: 'Encerrar assim', nao: 'Voltar ao treino' }))) return;
  }

  const mods = modsDoDia(s.day);
  // Num dia ABERTO o que foi adicionado É o dia, não uma emenda a ele: não há
  // conteúdo permanente para aquilo virar, e perguntar "isto fica no programa?"
  // a cada movimento do box seria uma pergunta por semana sem resposta certa.
  //
  // A PERGUNTA SAIU DAQUI — decisão D1 — e no lugar dela entrou o CARREGADOR.
  //
  // Esta era a metade do mecanismo que não existia, e era o furo que o §3.6 do
  // plano nomeia: `fechaSessao` só copiava a mudança no fecho AUTOMÁTICO, com a
  // razão escrita "pela porta da frente quem pergunta é `finalizarSessao`". Com
  // a pergunta fora e sem esta linha, finalizar no toque DESCARTARIA a mudança
  // em silêncio — o F280 nominal, e não o risco dele. Por isso a pergunta e o
  // carregador têm de entrar na mesma passada: um sem o outro perde dado.
  //
  // `guardaPromo` chaveia pelo `sid`, então fechar a mesma sessão duas vezes
  // atualiza em vez de duplicar — e não toca na mudança de outra sessão, que é
  // o defeito que o `soltaPromo(s.sid)` daqui existia para evitar.
  const resumoMods = mods.map(function (m) { return textoMod(s.day, m); });
  if (mods.length && !diaAberto(s.day)) guardaPromo(s, mods);
  await encerraDeVerdade(s.day, feitas, resumoMods);
}

async function encerraDeVerdade(dia, feitas, resumoMods) {
  const s = S.sessao;
  if (!s) return;
  const dur = duracaoSessao(s, Date.now());
  const marca = S.done.filter(function (x) { return x.sid === s.sid; })[0];
  // o que foi mudado fica no registro do dia, mesmo que não vire permanente:
  // daqui a um mês, "por que o volume desse dia foi outro?" tem resposta
  if (marca && resumoMods && resumoMods.length) marca.mods = resumoMods;
  const inicio = s.inicio, pulados = (s.pulados || []).length;
  fechaSessao('manual');
  view.open = null; view.editProg = false;
  soltarTela();
  await save(); render(); window.scrollTo(0, 0);
  // "Encerrei o Treino A · 6h20 → 7h31 · 1h11 · 8 exercícios" — o intervalo
  // inteiro, e o pulado no resumo, que é onde a §7.5 o põe.
  toast('Encerrei ' + oTreino(dia) + ' · ' + fmtHoraDita(inicio) + ' → ' + fmtHoraDita(Date.now()) +
        ' · ' + fmtDur(dur) + ' · ' + feitas + (feitas === 1 ? ' exercício' : ' exercícios') +
        (pulados ? ' · ' + pulados + (pulados === 1 ? ' pulado' : ' pulados') : ''));
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
// `expirou`: o instante em que a sessão de login caiu (401). Fica gravado: o
// aviso tem de sobreviver a fechar e abrir o app, até ele entrar de novo.
let sync = { v: null, em: 0, sujo: false, rodando: false, erro: null, forcar: false, fotos: {}, expirou: 0 };

async function carregaSync() {
  try {
    const r = await DB.get(CHAVE_SYNC);
    if (r && r.value) Object.assign(sync, JSON.parse(r.value), { rodando: false });
    if (!sync.fotos || typeof sync.fotos !== 'object') sync.fotos = {};
  } catch (e) {}
}
function gravaSync() {
  DB.set(CHAVE_SYNC, JSON.stringify({
    v: sync.v, em: sync.em, sujo: sync.sujo, forcar: sync.forcar, fotos: sync.fotos || {},
    expirou: sync.expirou || 0
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
      if (!lida.ok) { sync.erro = lida.msg; if (lida.erro === 'auth') sync.expirou = Date.now(); if (manual) toast(lida.msg); return; }

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
      if (escrita.erro === 'auth') sync.expirou = Date.now();
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

  let todasNoBucket = true, subiu = 0;
  // o aviso de "fotos só neste aparelho" (Corpo) lê o que subiu: redesenha
  // quando alguma subiu, inclusive se a rede caiu no meio
  const conta = function () { if (subiu) render(); };
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
      if (!r.ok) { conta(); return; }                     // sem rede: para e tenta depois
      sync.fotos[k] = ref.v; gravaSync(); subiu++;
    }
  }
  conta();

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
/**
 * Por que uma foto não apareceu.
 *
 * O quadro vazio não distingue "ainda vem" de "não vem": sem isto, uma falha
 * de rede fica escrita para sempre como "buscando a foto…", que é a tela
 * mentindo que ainda está tentando. A chave é data|pose, e a marca morre
 * sozinha quando os bytes chegam.
 */
const falhaDeFoto = {};
function chaveDaFalha(d, pose) { return d + '|' + pose; }
function marcaFalha(k, por) {
  if (falhaDeFoto[k] === por) return false;
  falhaDeFoto[k] = por;
  return true;
}
function limpaFalha(k) {
  if (!falhaDeFoto[k]) return false;
  delete falhaDeFoto[k];
  return true;
}

const AVISO_DA_FALHA = {
  semconta: 'a foto está na nuvem, e este aparelho não entrou na conta',
  nuvem: 'a nuvem não devolveu a foto'
};

/** O que escrever no quadro: o estado real, não "buscando" para sempre. */
function avisoDaFoto(d, pose, temRef, semFoto) {
  if (!temRef) return semFoto;
  const f = falhaDeFoto[chaveDaFalha(d, pose)];
  return f ? AVISO_DA_FALHA[f] : 'buscando a foto…';
}
/** Só 'nuvem' vale tentar de novo: sem conta, a porta é entrar nela. */
function podeTentarFoto(d, pose, temRef) {
  return !!(temRef && falhaDeFoto[chaveDaFalha(d, pose)] === 'nuvem');
}

async function garanteBytesDoCorpo(datas) {
  let mudou = false;
  for (const d of datas || []) {
    const ses = sessaoDe(S.protocolo.sessoes, d);
    if (!ses) continue;
    for (const pose of Object.keys(ses.fotos || {})) {
      const ref = ses.fotos[pose];
      if (!ref || !ref.v) continue;
      const k = chaveDaFalha(d, pose);
      // Depois de CADA await, a mesma pergunta: ainda tem alguém aí? O
      // IndexedDB e a rede levam tempo, e o que vem depois daqui mexe no cache
      // de URL de blob e termina em `render()`. Esta função é chamada sem
      // `await` — os bytes vão por fora —, então um erro aqui não cai em
      // nenhum `try` do app: vira rejeição não tratada e contamina a suíte.
      const aqui = await CORPO.tem(d, pose, ref.ext);
      if (desligado) return;
      if (aqui) {
        if (await CORPO.carrega(d, pose, ref)) mudou = true;
        if (desligado) return;
        if (limpaFalha(k)) mudou = true;
        continue;
      }
      // Sem conta não é erro de rede: a foto existe, está no outro aparelho, e
      // o caminho para ela é entrar na nuvem — não tentar de novo.
      if (!NUVEM.sessao()) { if (marcaFalha(k, 'semconta')) mudou = true; continue; }
      const r = await NUVEM.baixaCorpo(d, pose, ref.ext);
      if (desligado) return;
      if (!r.ok || !r.v) { if (marcaFalha(k, 'nuvem')) mudou = true; continue; }
      await CORPO.guarda(d, pose, r.v, ref.ext);
      if (desligado) return;
      if (limpaFalha(k)) mudou = true;
      if (await CORPO.carrega(d, pose, ref)) mudou = true;
      if (desligado) return;
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

// ---------- a gravação que FALHOU (decisão 13, §3.2 da frente 3) ----------
// Até aqui a falha era SILENCIOSA: `grava()` engolia o erro, e a camada de
// armazenamento respondia "gravei" mesmo com o aparelho cheio. O estado ficava
// só na memória e se perdia ao fechar o app, sem uma palavra a ninguém.
//
// Agora a falha abre o painel da família "falhou" — a mesma moldura do pare, e
// o que a distingue é a palavra: abre por "Não guardei…", diz a causa, diz o que
// NÃO aconteceu e até quando o valor vale. Fechar o aviso não apaga a marca:
// "não guardado" fica na tela até a próxima gravação dar certo, porque é o
// estado do dado, não do aviso.
//
// O modo privado NÃO abre o painel: ali nada nunca dura, e o Agora já diz isso
// acima do cartão (`ctx.guardando`, §5.0 da frente 1). Um alerta a cada série
// ensinaria o dono a ignorar o alerta.

/** O que está sendo gravado agora, nas palavras da frase de falha. */
let oQueGrava = null;
// O instante da última gravação que o aparelho ACEITOU. O estado lido na
// abertura já está no disco, então nasce no boot. É o que deixa o aviso de
// falha dizer o que continua guardado (a D, `aula.html`, estado 12).
let ultimaGravacaoOk = Date.now();
/**
 * Quem escreve declara o que escreve, antes de enfileirar. A gravação é
 * represada (`queueSave`), então vale o ÚLTIMO a declarar — é o que estava na
 * tela quando o disco recusou.
 */
function declaraGravacao(oQue, valor) { oQueGrava = { oQue: oQue, valor: valor || null }; }

/** Escreve o estado como ele está. Não carimba: quem carimba é `save`. */
async function grava() {
  let ok;
  try { ok = await DB.set(KEY, JSON.stringify(S)); }
  catch (e) { console.error('não salvou', e); ok = false; }
  if (ok) {
    oQueGrava = null;
    ultimaGravacaoOk = Date.now();
    if (view.naoGuardado) { view.naoGuardado = null; view.falhou = false; render(); }
  } else if (DB.mode !== 'mem') {
    naoGuardou();
  }
  return ok;
}

function naoGuardou() {
  const ja = !!view.naoGuardado;
  const g = oQueGrava || { oQue: 'a última mudança', valor: null };
  view.naoGuardado = { motivo: DB.falha || 'recusa', oQue: g.oQue, valor: g.valor, salvo: oQueEstaGuardado() };
  // O painel abre UMA vez por episódio: com o aparelho cheio, cada série
  // seguinte também falha, e um alerta por série é ruído que ensina a fechar sem
  // ler. A marca, essa sim, acompanha cada uma.
  if (!ja) view.falhou = true;
  render();
}
/**
 * O que CONTINUA guardado quando uma gravação falha no meio de uma sessão: a
 * presença dela, se nasceu antes da última gravação que o aparelho aceitou. É
 * o registro que importa, e dizer que está a salvo é o contrário de falso
 * sucesso — é verdade com hora (a D, `aula.html`, estado 12).
 */
function oQueEstaGuardado() {
  const s = S.sessao;
  if (!s) return null;
  const m = S.done.filter(function (x) { return x.sid === s.sid; })[0];
  if (!m || m.t > ultimaGravacaoOk) return null;
  const nome = diaAberto(m.day) ? 'da aula' : 'do Treino ' + m.day;
  return 'A presença ' + nome + ', guardada às ' + fmtHoraDita(m.t) + ', continua lá.';
}

/** Fechar este aviso: o painel sai, a marca de "não guardado" fica. */
function dispensaFalha() { view.falhou = false; render(); }


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
// Uma autoridade só sobre qual treino vem: a do domínio, com a aula fora da
// ordem. Esta cópia local ainda contava a aula como posição.
function nextDay() { return proximoTreino(S, ROT_BASE); }
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
  if (!ex || !ex.orig || ex.orig === ex.id) return null;
  // `mod: 2` é exercício ADICIONADO, não trocado. O `orig` dele é uma chave
  // sintética (`id#instante`) que existe só para o mod ter identidade própria e
  // poder ser encadeado — não é o exercício que saiu do lugar. Sem esta linha o
  // cartão anunciava "no lugar de remo-ergometro#1788963143430" e um selo de
  // SUBSTITUÍDO em cima de algo que não substituiu nada. Aparecia em qualquer
  // adição ao dia; virou o caminho principal quando o sábado ficou aberto.
  if (ex.mod === 2) return null;
  return ex.id;
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
/**
 * Como uma série se lê quando o movimento tem grandeza própria.
 *
 * O que muda entre as unidades é QUAL número é o resultado. Em metro e
 * caloria o trabalho está na prescrição e a série guarda o relógio, então os
 * dois precisam aparecer juntos — `500 m · 110s` é legível e `110s` sozinho
 * não diz nada. Em repetição e segundo a série JÁ é o trabalho, e repetir a
 * prescrição ao lado seria dizer a mesma coisa duas vezes.
 */
function textoDaSerie(x, u, q) {
  if (!x) return null;
  const carga = x[0] ? fmtCarga(x[0]) + 'kg · ' : '';
  if (cronometrado(u)) {
    return carga + (q > 0 ? fmtInt(q) + ' ' + ROTULO_UNIDADE[u] + ' · ' : '') + x[1] + 's';
  }
  return carga + x[1] + (u ? ' ' + ROTULO_UNIDADE[u] : 's');
}

function fmtLast(l, seg) {
  if (!l) return null;
  if (seg) return l.sets.map(s => textoDaSerie(s, l.u, l.q) || '–').join('  ');
  return l.sets.map(s => s ? fmtCarga(s[0])+'×'+s[1] : '–').join('  ');
}

// Sessão retroativa sem hora informada não tem horário de verdade: o app
// guarda um valor neutro só para ordenar, e não finge que mediu.
function temHora(m) { return !!m && (!m.retro || m.hora === 1) && !m.livre; }
function horaDaSessao(m) { return temHora(m) ? fmtHora(m.t) : null; }
function fimDaSessao(m) { return temHora(m) && m.dur ? fmtHora(m.t + m.dur + (m.pausado||0)) : null; }

function sessoesDoDia(t) { return S.done.filter(function (x) { return sameDay(x.t, t); }); }

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

function chartSVG(H, modo, rot, un) {
  if (!H.length) return '';
  const n = H.length;

  // faixa de cima: o que progride. Embaixo: a métrica de apoio, quando existe.
  // Em peso do corpo, quem progride é a repetição; a carga é o acessório.
  //
  // No RITMO o eixo é INVERTIDO, e isso não é enfeite. O gráfico inteiro do app
  // é construído sobre "mais alto é melhor"; ritmo é a única métrica em que o
  // número desce quando o desempenho sobe. Plotá-lo cru faria a linha de quem
  // está melhorando descer — o mesmo erro que o `+423%` cometia, só que em
  // forma de desenho.
  let A, B = null, inv = 0;
  if (modo === 'ritmo') {
    const esc = ESCALA_RITMO[un] || { fator: 1, rot: 's' };
    A = { v: H.map(function (x) { const r = ritmoDe(x); return r == null ? 0 : r * esc.fator; }),
          u: esc.rot, f: fmtDec };
    inv = 1;
    if (H.some(function (x) { return maxLoad(x) > 0; })) B = { v: H.map(maxLoad), u: rot||'kg', f: fmtNum };
  } else if (modo === 'seg') {
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
  const ay = v => {
    if (aHi === aLo) return (aT+aB)/2;
    const f = (v-aLo)/(aHi-aLo);
    return aB - (inv ? 1-f : f) * (aB-aT);
  };
  const anchor = i => i === 0 && n > 1 ? 'start' : (i === n-1 && n > 1 ? 'end' : 'middle');

  let g = `<svg viewBox="0 0 320 ${alt+8}" class="chart" role="img" aria-label="progresso das últimas ${n} sessões">`;

  g += `<line x1="${x0}" y1="${aT}" x2="${x1}" y2="${aT}" class="gl"/>`
     + `<line x1="${x0}" y1="${aB}" x2="${x1}" y2="${aB}" class="gl"/>`
     + `<text x="${x0-8}" y="${ay(aHi)+3}" class="ax" text-anchor="end">${A.f(aHi)}</text>`
     + (aHi === aLo ? '' : `<text x="${x0-8}" y="${ay(aLo)+3}" class="ax" text-anchor="end">${A.f(aLo)}</text>`)
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
  return `${fmtCarga(v)} ${c.cada} · <b>${fmtCarga(totalAnilhas(v, c.barra))} kg ${c.total}</b>${c.obs}`;
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
  // A hora primeiro, e FORA do `if` da sessão: ela não depende de haver treino
  // aberto, e o modo tem estado vazio (a sessão nasce na primeira série).
  const h = document.getElementById('hora');
  if (h) h.textContent = fmtHora(Date.now());
  const el = document.getElementById('relogio');
  if (!el || !S.sessao) return;
  el.textContent = relogioTexto(S.sessao);
}
function ajustaRelogio() {
  // `view.modoSessao` e não só a aba: as portas 2 e 3 arrumam a aba para
  // 'treino' antes de entrar, mas a porta 1 é o cartão do topo do Agora e
  // entra DE LÁ — o motor ficava desligado e o relógio parava na hora da
  // entrada. Dentro do modo ele anda de onde quer que se tenha entrado, e
  // anda também sem sessão, porque a HORA é o que o cabeçalho mostra.
  // A aba de treino não existe mais: quem define "está na tela do treino" é o
  // MODO. Antes eram as duas, e a razão de a aba estar ali caiu com ela.
  const ativo = !!(view.modoSessao && S.sessao && !S.sessao.pausadoEm && !S.sessao.retro)
    || !!(view.modoSessao && !S.sessao);
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
  // Num dia aberto a métrica é MOVIMENTOS, não séries feitas de prescritas —
  // é o que a tela desenha. Escrever `4/9` aqui desfazia isso na primeira
  // tecla digitada, e o topo passava a contar contra um número que o box nunca
  // prometeu. O bug era antigo e ficava escondido porque só aparecia depois de
  // digitar; a lista rápida o disparava a cada campo.
  if (diaAberto(view.day)) { el.textContent = P.ex.length ? String(P.ex.length) : '–'; return; }
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
  const un = unidadeDe(ex);
  const seg = !!un;
  const relogio = cronometrado(un);
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
        ? (seg
            // no cartão a prescrição já está no cabeçalho: repeti-la na coluna
            // ANTERIOR gastaria a calha mais estreita da linha para dizer duas
            // vezes a mesma coisa
            ? (p[0] ? fmtCarga(p[0]) + 'kg · ' : '') + p[1] + (relogio ? 's' : '')
            : (p[0] ? fmtCarga(p[0]) + ' × ' : '') + p[1] + (p[2] != null ? ' @ ' + p[2] : ''))
        : null,
      // O placeholder é DADO — a carga da última vez. A unidade é ESTRUTURA e
      // fica sempre visível ao lado. Antes os dois diziam a mesma coisa quando
      // não havia histórico: o campo mostrava "kg" com um "KG" grudado na
      // direita. Sem histórico, o campo fica vazio e só a unidade fala.
      rirAberto: !!(view.rir && view.rir.i === i && view.rir.k === k),
      // A RÉGUA da linha. Montada aqui, no modelo de apresentação, e a página é
      // função do foco — é o R4 da frente 2: não há `scrollLeft` guardado para
      // um re-render perder. Reconstruir com o mesmo foco dá a mesma página.
      // Sem "última" nesta posição (a série a mais de hoje), a referência é a
      // série anterior DE HOJE — a D, momento 1, estado 4.
      regua: reguaDaLinha(i, k, ex, p, v, CARGAS[tipo].rot,
                          !p && k > 0 && dr && dr.s[k - 1] && dr.s[k - 1][1] != null ? dr.s[k - 1] : null),
      // O TECLADO PRÓPRIO, quando a porta "outro valor" o abriu nesta linha.
      teclado: (function () {
        const a = view.teclado && view.teclado.alvo;
        if (!a || a.tipo !== 'serie' || a.i !== i || a.k !== k) return null;
        return { texto: view.teclado.texto, decimal: a.pos === 0,
                 unidade: a.pos === 0 ? (seg ? 'kg' : CARGAS[tipo].rot) : 'reps' };
      })(),
      rirEscala: RIR_ESCALA.map(function (v) { return { v: v, on: (dr && dr.s[k]) ? dr.s[k][2] === v : false }; }),
      // Não há placeholder nos campos: a referência tem UMA casa, e é a coluna
      // ANTERIOR. Ela diz as três coisas numa linha só e, ao contrário do
      // placeholder, NÃO some quando ele começa a digitar — antes, escrever a
      // carga apagava a referência das repetições justamente na hora de
      // escrevê-las.
      temAnterior: !!p,
      // Os números crus da série anterior, para o toque que preenche. O texto
      // acima é para LER; isto é para AGIR, e são coisas diferentes o bastante
      // para não se derivar uma da outra na hora do toque.
      anteriorValor: p ? [p[0], p[1]] : null
    });
  }

  return {
    i: i,
    nome: ex.n,
    // "+ série" só onde a série a mais é mudança do dia possível: no treino que
    // dá para editar hoje, de repetição, e não no exercício pulado
    podeMaisSerie: podeEditar(d) && !seg && !diaAberto(d) && ns < 8 && !pulado,
    nomeOriginal: alt ? nomeEx(ex.orig) : null,
    // "Fazer antes o próximo" (§7.3): a saída mais barata da máquina ocupada,
    // e só existe se há um próximo para trazer.
    proximo: treino(d).ex[i + 1] ? treino(d).ex[i + 1].n : null,
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
    // O rótulo da segunda coluna: o que o número dela É. Em metro e caloria a
    // prescrição é o trabalho e a série guarda o relógio; em repetição e
    // segundo a série já é o trabalho.
    medida: seg ? (relogio ? 'seg' : ROTULO_UNIDADE[un]) : 'reps',
    // A prescrição do dia, escrita como se lê na lousa.
    prescricao: seg && ex.q > 0 ? fmtInt(ex.q) + ' ' + ROTULO_UNIDADE[un] : '',
    // RIR é linguagem de hipertrofia. Numa aula de box eram 25 botões sem
    // sentido na tela, um por linha de série.
    temRir: !seg,
    // A RÉGUA é de REPETIÇÃO. Em metro, caloria ou segundo o valor não é um
    // número curto de faixa conhecida — 500 m não cabe numa régua de onze
    // valores —, e ali o campo continua sendo o certo.
    temRegua: !seg,
    // Aproximação é preparo para carga pesada. Num remo ou numa corrida a
    // frase "2 a 3 séries subindo carga antes da primeira valendo" é ruído.
    unidadeRotulo: un ? ROTULO_UNIDADE[un] : '',
    // A pegada, quando existe. Vazio é estado de primeira classe: ver a nota em
    // PEGADA_POR_NOME sobre por que vários exercícios ficam de fora.
    pegada: ex.peg || null,
    pegadaRotulo: ex.pegPe ? 'pés' : 'pegada',
    descanso: descOf(ex),
    descansoTxt: fmtDesc(descOf(ex)),
    cargaOpcional: seg || corpo,

    aberto: view.open === i,
    // o que se faz no descanso, a um toque cada (momento 1, estado 2): só no
    // cartão aberto, que é onde o polegar está
    descansa: view.open === i ? CTX.enquantoDescansa() : null,
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
      // O agregado que a coluna ANTERIOR não mostra. Em movimento
      // cronometrado, somar os segundos seria comparar sessões de tamanhos
      // diferentes — o que vale é o ritmo.
      rotulo: relogio ? 'ritmo' : seg ? 'tempo' : 'volume',
      valor: relogio && ritmoDe(l) != null
        ? fmtDec(ritmoDe(l) * (ESCALA_RITMO[un] || { fator: 1 }).fator) + ' ' +
          (ESCALA_RITMO[un] || { rot: 's' }).rot
        : seg ? fmtInt(tutOf(l)) + ' s' : fmtInt(volOf(l))
    } : null,

    dorRep: dorRep ? dorRep.map(dorName).join(' e ') : null,
    // A dor repetida PARA a régua até ele escolher (§7.4): substituir, pular ou
    // fazer mesmo assim. As duas datas dizem de onde veio a detecção.
    dorDatas: dorRep ? (function () {
      const h = historico(key);
      return fmtDate(h[h.length - 2].t) + ' e ' + fmtDate(h[h.length - 1].t);
    })() : null,
    dorAceita: !!(dorRep && S.sessao && (S.sessao.dorMesmoAssim || []).indexOf(slotDe(d, i)) >= 0),
    dorBloqueia: !!(dorRep && !pulado && !(S.sessao && (S.sessao.dorMesmoAssim || []).indexOf(slotDe(d, i)) >= 0)),
    nSubs: lista.filter(function (a) { return a.ind; }).length,
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

    // A medida do dia: o que o box escreveu na lousa. Mora atrás de um link,
    // como a carga, porque é decisão de uma vez por movimento e a linha de
    // série é que precisa do espaço.
    medidaAberta: view.medida === i,
    medidaResumo: seg
      ? (ex.q > 0 ? fmtInt(ex.q) + ' ' + ROTULO_UNIDADE[un] : 'sem quantidade')
      : 'repetições com carga',
    q: ex.q != null ? String(ex.q) : '',
    unidades: [{ k:'m', t:'metros' }, { k:'cal', t:'calorias' },
               { k:'rep', t:'repetições' }, { k:'seg', t:'segundos' }]
      .map(function (x) { return { k:x.k, t:x.t, sel: un === x.k }; }),

    cargaAberta: view.carga === i,
    tipoNome: CARGAS[tipo].nome,
    tipoAjuda: CARGAS[tipo].ajuda,
    cargas: Object.keys(CARGAS).map(function (t) {
      return { k: t, nome: CARGAS[t].nome, sel: tipo === t };
    }),

    // Aproximação é preparo para série pesada: "2 a 3 séries subindo carga
    // antes da primeira valendo" não quer dizer nada num remo de 500 m.
    mostraAquecimento: i === 0 && !seg,
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
  // §7.3 da frente 3: o ★ do treinador ganha a PALAVRA ("indicado pelo
  // treinador") — em lugar nenhum dizia —, e a última carga não apaga mais o que
  // muda ao trocar: antes era uma coisa OU a outra na mesma linha.
  const ind = /^Indicad[oa] pelo treinador[.:]?\s*/;
  return {
    id: a.id, n: a.n,
    indicado: ind.test(a.w || ''),
    nota: (a.w || '').replace(ind, ''),
    ultima: (u && u.sets && u.sets[0])
      ? 'última vez: ' + fmtNum(u.sets[0][0]).replace('.', ',') + ' × ' + u.sets[0][1] : null,
    // Aqui a foto paga mais que em qualquer outro lugar: são substitutos que
    // ele quase nunca executou, escolhidos sob pressão com a máquina ocupada.
    // Reconhecer o aparelho pela imagem é mais rápido que ler o nome.
    foto: FOTO.urlDaFoto(a.id, S.fotos[a.id]),
    antes: (u && u.sets && u.sets[0])
      ? 'última vez: ' + fmtCarga(u.sets[0][0]) + ' × ' + u.sets[0][1]
      : a.w
  };
}

// As ações do cartão. Objeto único e estável: passar as funções por props é o
// que substitui o `onclick="fn()"` como atributo, e o que vai permitir apagar a
// ponte global quando a última tela virar componente.
const ACOES = {
  toggle: function (i) { toggle(i); },
  inp: function (el, i, k, pos) { inp(el, i, k, pos); },
  startTimer: function (s, ctx) { startTimer(s, ctx); },
  proximoDoBiset: function (i) { proximoDoBiset(i); },
  setAlt: function (i, id) { setAlt(i, id); },
  toggleSwap: function (i) { toggleSwap(i); },
  abrirSubstituicao: function (i) { abrirSubstituicao(i); },
  pularEx: function (i) { pularEx(i); },
  fazAntesOProximo: function (i) { fazAntesOProximo(i); },
  aceitaDor: function (i) { aceitaDor(i); },
  openHist: function (i) { openHist(i); },
  toggleAq: function (i) { toggleAq(i); },
  abrirCarga: function (i) { abrirCarga(i); },
  setCarga: function (i, t) { setCarga(i, t); },
  abrirMedida: function (i) { abrirMedida(i); },
  setUnidade: function (i, u) { poeMedida(i, u, undefined); },
  setQ: function (el, i) { poeMedida(i, undefined, el.value); },
  abrirNota: function (i) { abrirNota(i); },
  obsIn: function (el, i) { obsIn(el, i); },
  toggleDor: function (i, k) { toggleDor(i, k); },
  abreRir: function (i, k) { abreRir(i, k); },
  abreRegua: function (i, k) { abreRegua(i, k); },
  andaRegua: function (dir) { andaRegua(dir); },
  poeRep: function (i, k, v) { poeRep(i, k, v); },
  abreOutroValor: function () { abreOutroValor(); },
  abreTecladoDeCarga: function (i, k) { abreTecladoDeCarga(i, k); },
  tecla: function (t) { teclaDoTeclado(t); },
  fechaTeclado: function () { fechaTeclado(); },
  abreFoto: function (i) { abreFoto(i); },
  poeRir: function (i, k, v) { poeRir(i, k, v); },
  usaAnterior: function (i, k) { usaAnterior(i, k); },
  maisUmaSerie: function (i) { maisUmaSerie(i); },
  preNoDescanso: function () { CTX.preNoDescanso(); },
  copoNoDescanso: function () { CTX.maisUmCopo(); },
  pesoNoDescanso: function () { CTX.abrePesoNoDescanso(); }
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
    // A virada do dia é aqui, e é aqui que o dia velho FECHA. Não precisa de
    // job nem de cron — esta arquitetura não tem nenhum dos dois, e o gatilho
    // preguiçoso já existia: até agora ele simplesmente descartava o dia
    // anterior, e nada do que ele comeu sobrevivia à meia-noite.
    if (S.dia && S.dia.data) fechaDiaDeComida(S.dia);
    S.dia = { data: hoje, done: {}, agua: 0, escala: {}, cadencia: null, alta: 0 };
  }
  if (!S.dia.done) S.dia.done = {};
  if (!S.dia.escala) S.dia.escala = {};
  return S.dia;
}

/**
 * Empurra um dia vivido para o histórico.
 *
 * Os totais são congelados AQUI, contra o plano vigente. Derivar depois leria
 * o plano de hoje: cortar o arroz do almoço reescreveria o janeiro dele.
 *
 * Idempotente pela data — reabrir o app duas vezes no mesmo dia não duplica, e
 * um dia que já esteja no histórico é atualizado, não repetido.
 */
function fechaDiaDeComida(dia) {
  if (!Array.isArray(S.comidaHist)) S.comidaHist = [];
  const marcou = Object.keys(dia.done || {}).length > 0;
  // Dia sem NADA: nem marca, nem água, nem enquadramento. Não vale uma linha
  // no histórico — e guardá-lo como zero seria dizer que ele não comeu, que é
  // o erro de medição que confunde silêncio com falha.
  if (!marcou && !(dia.agua > 0) && !dia.cadencia && !dia.turno) return;

  const h = fechaDia(dia, planoDeComida(), catalogoAlimentos(),
                     versaoDoPlano(), S.ajuste || 0, Date.now());
  const j = S.comidaHist.findIndex(function (x) { return x.d === h.d; });
  if (j >= 0) S.comidaHist[j] = h; else S.comidaHist.push(h);
  S.comidaHist.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  if (S.comidaHist.length > 4000) S.comidaHist = S.comidaHist.slice(-4000);
}

/**
 * Quanto dura uma sessão dele, em minutos.
 *
 * Derivado das últimas sessões registradas — o app já sabe, e nada derivável é
 * digitado. É o que decide se uma refeição cai dentro do treino: com 75 min, o
 * jantar das 19h30 não cabe num treino que começa às 18h15.
 */
function duracaoDoTreino() {
  return duracaoDaSessao(S.done.slice(-30).map(function (x) { return x.dur; }));
}

/**
 * O carimbo da versão do plano.
 *
 * Nasce na primeira leitura e é reescrito toda vez que o plano ou a tabela de
 * alimentos mudam. Não guarda o QUE era o plano — guarda QUANDO ele era
 * aquele, que é o bastante para a tela dizer que um dia foi calculado contra
 * outro plano. Um snapshot por dia custaria 6,6 MiB em dez anos, acima do teto
 * do Safari.
 */
function versaoDoPlano() {
  if (!S.comida.v) S.comida.v = Date.now();
  return S.comida.v;
}

/**
 * Carimba que o plano mudou.
 *
 * Monotônico de propósito: duas mudanças no mesmo milissegundo — ou uma
 * mudança no mesmo instante em que o carimbo nasceu — deixariam a versão
 * parada, e um dia fechado passaria a parecer calculado contra o plano atual
 * quando não foi. O relógio não é garantia de avanço; o `+1` é.
 */
function planoMudou() { S.comida.v = Math.max(Date.now(), (S.comida.v || 0) + 1); }

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
  abaAtual: function () { return view.aba || 'agora'; },
  // Uma rota só. `view.tab` existia em paralelo a `view.aba` durante a
  // migração — duas fontes de verdade para a mesma pergunta, e o app já
  // trocava de conteúdo sem trocar a aba acesa por causa disso.
  vaiPara: function (a) {
    const vindoDeFora = view.aba !== a;
    view.aba = a;
    view.prog = null; view.hist = null; view.retro = false;
    view.sessao = null; view.add = null; view.mes = 0;
    // Ir para um LUGAR fecha o que está em tela cheia — o modo de sessão e os
    // ajustes inclusive. Sem isto `vaiPara` troca `view.aba` POR BAIXO de um
    // destino que continua desenhado (`emTelaCheia()` ganha da aba em
    // `app.jsx`), e o lugar pedido nunca aparece.
    //
    // Pelos verbos e não pela flag: os dois guardam a posição de leitura em
    // `saiDoDestino`, e zerar a flag na mão deixaria a entrada órfã. As cinco
    // linhas acima fazem isso há mais tempo e têm a mesma dívida; não é razão
    // para repeti-la em duas novas.
    if (view.modoSessao) CTX.fechaModoDeSessao();
    if (view.ajustes) CTX.fechaAjustes();

    // A correção de "chegar em TREINO abria um treino qualquer" saiu daqui com
    // a aba: quem entra na sessão agora é o MODO, e as três portas dele já
    // resolvem o dia — `voltaAoTreino` cai no dia da sessão, `abreTreinoDeHoje`
    // no dia resolvido de hoje. `vindoDeFora` fica porque o render e o scroll
    // ainda dependem de ter havido troca de lugar.

    render();
    window.scrollTo(0, 0);
    if (vindoDeFora) carregaFotosDoDia();
  },
  telaCheia: telaCheia,
  /** true quando uma tela cheia do sistema antigo tomou a tela toda. */
  emTelaCheia: function () {
    return !!(view.prog || view.retro || view.add || view.sessao || view.hist ||
              view.protocolo || view.comparar || view.evolucao || view.diaAberto || view.ajuste || view.camera ||
              view.ajustes || view.modoSessao);
  },

  // ---------- cabeçalho de HOJE ----------
  cabecalhoDeHoje: function () {
    const h = diaResolvido();
    // `new Date(Date.now())` e não `new Date()`: TODO o relógio do app passa
    // por `Date.now`, e é o que permite ao teste fixar o dia. Um `new Date()`
    // solto escapa dessa porta e lê o relógio de verdade — a tela passaria a
    // discordar do resto do app no meio de um teste que viajou no tempo.
    const d = new Date(Date.now());
    // A PROCEDÊNCIA do tipo do dia, e é ela a linha tocável (a D,
    // `agora-descanso.html`, estados 1, 4 e 5): o palpite diz que é palpite, com
    // o pontilhado; o que ele disse e a sessão registrada são fato.
    const treinoTxt = h.treino ? (diaAberto(h.treino) ? ' · aula' : ' · Treino ' + h.treino) : '';
    const procedencia = h.origem === 'registrado' ? 'dia de treino, pela sessão registrada' + treinoTxt
      : h.origem === 'aberta' ? 'dia de treino, com a sessão aberta' + treinoTxt
      : h.origem === 'manual' ? (h.cadencia === 'descanso' ? 'descanso, você disse' : 'dia de treino, você disse' + treinoTxt)
      : (h.cadencia === 'descanso' ? 'descanso, pelo padrão semanal' : 'dia de treino, pelo padrão semanal' + treinoTxt);
    return {
      data: DIAS_LONGOS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()],
      procedencia: procedencia,
      palpite: !!h.previsto
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

    const refs = refeicoesDeHoje(plano, treinando, alta, dia.turno, duracaoDoTreino());
    const movidas = refeicoesMovidas(refs);

    return {
      diaHoje: h,
      plano: plano,
      catalogo: cat,
      comidaDoDia: dia,
      alta: alta,
      // As refeições JÁ no turno de hoje. Vêm prontas daqui para a tela não
      // precisar saber o que desloca e o que não desloca.
      refs: refs,
      // Quem carrega o papel de pós-treino hoje — calculado, nunca gravado.
      posTreino: posTreinoDe(refs, treinando),
      turno: dia.turno || 'manha',
      // A refeição que não cabia dentro do treino e foi para depois dele. Não é
      // aviso: é a procedência de um horário que não bate com o plano.
      movidas: movidas.map(function (r) {
        return { id: r.id, txt: r.n + ' foi para as ' + r.t + ', depois do treino' };
      }),
      alvo: totalDoDia(plano, cat, treinando, alta, {}),
      cadenciaTxt: rotuloDoAjuste() +
        ' · ' + (h.previsto ? 'dia previsto pela cadência da semana' : 'dia confirmado'),
      sessao: {
        nome: P ? P.name : null,
        feita: prescritas > 0 && feitas >= prescritas,
        valor: P ? feitas + '/' + prescritas + ' séries' : null,
        resumo: P ? P.ex.slice(0, 3).map(function (e) { return e.n; }).join(' · ') : 'Dia de descanso.',
        meta: S.sessao ? 'sessão aberta' : (feitas ? 'registrado' : 'não começou'),
        // "sessão aberta desde 6h20": a procedência do cartão de cima (§1.1)
        desde: S.sessao ? fmtHoraDita(S.sessao.inicio) : null
      }
    };
  },
  ehLinhaDeTreino: ehLinhaDeTreino,

  // ---------- ações do dia ----------
  /**
   * Marca ou desmarca uma refeição de HOJE.
   *
   * Grava o INSTANTE, e não `1`: é a forma convergida com o histórico desde a
   * migração 9→10, e é o que a lápide compara. `como` é opcional — ausente é
   * "comeu o que estava prescrito", que é o caso dominante e por isso não se
   * grava; `'fora'` é "comi, mas não foi isto", `'nao'` é "não comi esta
   * refeição", que é diferente de não ter marcado nada, e `'nsei'` é "não sei o
   * que foi esta refeição". A fonte da verdade dos três é
   * `ComoFoiARefeicao` (`src/dominio/nutricao/tipos.ts`), com a aritmética de
   * cada um escrita lá; a lista aqui é a recusa de gravar valor que o domínio
   * não conhece.
   *
   * Desmarcar deixa LÁPIDE. `chaveDeRefeicaoFeita` existia na fusão desde que o
   * dia aberto passou a fundir campo a campo, e ninguém a escrevia: desmarcar
   * aqui era desfeito pelo outro aparelho, que ainda tinha a marca.
   */
  marcaRefeicao: function (id, como) {
    const d = diaDeComida();
    if (d.done[id]) {
      delete d.done[id];
      if (d.como) {
        delete d.como[id];
        if (!Object.keys(d.como).length) delete d.como;
      }
      lapide(chaveDeRefeicaoFeita(d.data, id));
    } else {
      // Nunca igual nem anterior à lápide daquela refeição: marcar, desmarcar e
      // marcar de novo dentro do mesmo milissegundo daria `quando <= morto`, e a
      // fusão apagaria a marca que ele acabou de fazer.
      const morta = (S.apagados || {})[chaveDeRefeicaoFeita(d.data, id)] || 0;
      d.done[id] = Math.max(Date.now(), morta + 1);
      if (como === 'fora' || como === 'nao' || como === 'nsei') {
        if (!d.como) d.como = {};
        d.como[id] = como;
      }
    }
    queueSave(); render();
  },
  /**
   * Os copos de água de hoje — ou o fato de que ele não contou.
   *
   * `null` declara "não contei a água", que não é zero copo: `agua: 0` juntava
   * o dia em que ele não bebeu nada com o dia em que ele não contou, e um zero
   * lido como abandono de registro é erro de medição. Contar de novo derruba o
   * fato, porque contar tem dado por trás.
   */
  setAgua: function (n) {
    const d = diaDeComida();
    if (n == null) { d.aguaNaoContada = 1; }
    else { d.agua = Math.max(0, n); delete d.aguaNaoContada; }
    queueSave(); render();
  },
  abreRefeicao: function (id) { CTX.abreFolha({ k: 'refeicao', id: id }); },

  // ---------- a água em linha (a D, `agora-descanso.html`, estados 3 e 8) ----------
  //
  // "+1 copo" é um toque e grava NA HORA, sabendo se gravou: com cada toque
  // gravando, cada toque pode falhar, e a tela não finge (estado 8). Se o
  // aparelho recusa, a conta volta ao que está guardado e a linha diz qual copo
  // não entrou. Tocar no número corrige no lugar, sem prazo.
  agua: function () {
    const d = diaDeComida();
    return { n: d.aguaNaoContada ? 0 : (d.agua || 0), naoContada: !!d.aguaNaoContada,
             corrigindo: !!view.aguaCorrige, falhou: view.aguaFalhou || null };
  },
  maisUmCopo: async function () {
    const d = diaDeComida();
    const antes = d.agua, nc = d.aguaNaoContada;
    d.agua = (d.aguaNaoContada ? 0 : (d.agua || 0)) + 1;
    delete d.aguaNaoContada;
    const n = d.agua;
    view.aguaFalhou = null;
    const ok = await save();
    if (ok === false) {
      d.agua = antes;
      if (nc) d.aguaNaoContada = nc;
      view.aguaFalhou = n;
    }
    render();
  },
  abreCorrecaoDaAgua: function () { view.aguaCorrige = !view.aguaCorrige; render(); },

  // ---------- a linha da comida, aberta no lugar (a D, `agora-descanso.html`
  // estado 2; `momento-2.html` estados 1 e 5) ----------
  //
  // A linha tocada abre ali mesmo com o que o cartão teria: a procedência, os
  // itens e os três botões. Um toque grava — não há "guardar". Só uma linha
  // abre por vez, para o dedo nunca acertar o botão de outra refeição.
  linhaDaComida: function () {
    const u = view.ultimaMarca;
    const d = diaDeComida();
    return { aberta: view.linhaComida || null, pergunta: view.perguntaDe || null,
             // a leitura de volta do último toque (momento 2, estado 2): fica
             // enquanto a marca existir e for de hoje
             ultima: u && u.data === d.data && d.done[u.id] ? u : null };
  },
  abreLinhaDaComida: function (id) {
    view.linhaComida = view.linhaComida === id ? null : id;
    view.perguntaDe = null;
    render();
  },
  /**
   * `k`: `'tudo'`, `'metade'` (a marca com porção ½, como na folha de pôr o dia
   * em dia), `'fora'`, `'nsei'`, `'nao'` — ou `'pergunta'`, que abre a única
   * pergunta do "Não comi isso", e `'desfaz'`, que tira a marca.
   */
  marcaLinhaDaComida: function (id, k) {
    const d = diaDeComida();
    if (k === 'pergunta') { view.perguntaDe = id; render(); return; }
    if (k === 'desfaz') {
      if (!d.done[id]) return;
      if (d.escala[id] != null) delete d.escala[id];
      CTX.marcaRefeicao(id);
      return;
    }
    if (d.done[id]) return;                 // marcada: só "Desfazer" muda
    if (['tudo', 'metade', 'fora', 'nsei', 'nao'].indexOf(k) < 0) return;
    if (k === 'metade') d.escala[id] = 0.5;
    else if (d.escala[id] != null && k === 'tudo') delete d.escala[id];
    view.linhaComida = null; view.perguntaDe = null;
    view.ultimaMarca = { id: id, k: k, data: d.data };
    CTX.marcaRefeicao(id, k === 'tudo' || k === 'metade' ? undefined : k);
  },
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
  /**
   * "Já fiz alguma coisa hoje" (a D, estado 4): o cardio abre o registro de
   * cardio do Agora; a aula e o treino fora da prescrição abrem o lançamento de
   * hoje, que oferece os dois.
   */
  jaFizHoje: function (k) {
    pilha().pop();
    if (k === 'cardio') { view.cardioRapido = true; render(); return; }
    abrirAdicionar(Date.now());
  },
  /**
   * Como o dia foi. Ajuste de hoje, como a escala e o turno: zera com a data,
   * e é congelado no histórico por `fechaDia`.
   */
  setAderencia: function (v) {
    const d = diaDeComida();
    if (!v || v === 'plano') delete d.aderencia; else d.aderencia = v;
    queueSave(); render();
  },
  /** O turno do treino de hoje. Ajuste de hoje: zera com a data, como a escala. */
  setTurno: function (t) {
    const d = diaDeComida();
    if (!t || t === 'manha') delete d.turno; else d.turno = t;
    pilha().pop();
    queueSave(); render();
  },

  // ---------- folhas ----------
  folhas: function () { return folhaAberta(); }
};

// A tela do sistema antigo, ainda em string. Devolve a árvore em vez de
// montar: quem monta é a shell nova. Cada aba convertida some daqui, e quando

// As telas cheias: as que substituem a shell inteira, tab bar inclusive.
// Não são abas — em cada uma o assunto é uma coisa só, e a tab bar convidaria
// a sair no meio. O voltar é o único caminho de saída.
function telaCheia() {
  if (view.ajustes) return <Ajustes ctx={CTX} />;
  if (view.camera) return <Camera ctx={CTX} />;
  if (view.ajuste) return <AjusteFoto ctx={CTX} />;
  if (view.protocolo) return <Protocolo ctx={CTX} />;
  if (view.comparar) return <Comparar ctx={CTX} />;
  // Depois de comparar: a comparação abre DE DENTRO da Evolução, e fica por cima.
  if (view.evolucao) return <Evolucao ctx={CTX} />;

  if (view.retro) return <Retrospectiva ctx={CTX} />;
  if (view.add) return <Retroativo ctx={CTX} />;
  if (view.sessao) return <Sessao ctx={CTX} />;
  // O DIA aberto fica ABAIXO da sessão e do registro de treino passado: os
  // dois abrem de dentro dele, e Voltar devolve ao dia.
  if (view.diaAberto) return <Dia ctx={CTX} />;
  // O histórico ANTES do programa: `telaCheia` desenha o primeiro que casa, e
  // quem casa primeiro está por cima. Abrindo o histórico de dentro do programa
  // — que é a porta nova da Prescrição —, ele é a camada de cima.
  if (view.hist) return <Historico ctx={CTX} />;
  if (view.prog) return <Programa ctx={CTX} />;
  // O modo é o ÚLTIMO: camada mais funda, tudo que se abre de dentro dele fica
  // por cima. A ordem aqui é a inversa da pilha de `camadasAbertas`.
  if (view.modoSessao) return <SessaoModo ctx={CTX} />;
  return null;
}

function semanasDe(t) { return semanasDesde(t, Date.now()); }

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

/**
 * "+ série", na linha do exercício (a D, momento 1, estado 4: "deveria ser mais
 * fácil, direto, por ali já", P12). Vira mudança SÓ DO DIA (F159) — a mesma que
 * a edição do dia faria —, a carga vem igual à da série anterior de hoje, e a
 * régua da série nova abre com a repetição dela como referência. Se fica
 * permanente, decide-se depois, sentado.
 */
function maisUmaSerie(i) {
  const d = view.day;
  const ex = treino(d).ex[i];
  if (!ex || setsFor(ex) >= 8) return;
  mudaSeries(i, 1);
  const k = setsFor(treino(d).ex[i]) - 1;
  const dr = draftPeek(i);
  const ant = dr && dr.s[k - 1];
  if (ant && ant[0] != null && !(dr.s[k] && dr.s[k][0] != null)) anotaSerie(i, k, 0, String(ant[0]));
  abreRegua(i, k);
}

/**
 * "Fazer mesmo assim" diante da dor repetida (§7.4 da frente 3). É ESCOLHA, e
 * fica registrada no dia como o pulado fica: a régua volta, e a marca do dia
 * guarda que ele treinou por cima de um sinal de tendão — a regra do treinador
 * diz para não fazer, e ele decidiu fazer, e as duas coisas ficam escritas.
 */
async function aceitaDor(i) {
  const s = S.sessao || abreSessaoVazia();
  if (!s.dorMesmoAssim) s.dorMesmoAssim = [];
  const chave = slotDe(view.day, i);
  if (s.dorMesmoAssim.indexOf(chave) < 0) s.dorMesmoAssim.push(chave);
  await save(); render();
  const ex = treino(view.day).ex[i];
  toast('Guardei: ' + (ex ? ex.n : 'o exercício') + ' feito mesmo assim, com a dor repetida. Fica registrado no dia.');
}

/**
 * Máquina ocupada: faz antes o próximo, e esta volta logo depois. É a saída mais
 * barata (§7.4 da frente 2 ordena as saídas por preço): não troca exercício,
 * só a ordem — e só HOJE, pela mesma mudança do dia que mover já usa.
 */
function fazAntesOProximo(i) {
  const t = treino(view.day);
  if (!t.ex[i + 1]) return;
  const este = t.ex[i].n, prox = t.ex[i + 1].n;
  moverEx(i, 1);
  view.swapOpen = null;
  view.open = i;                       // o próximo agora mora aqui
  render();
  toast('Só hoje: ' + prox + ' agora, e ' + este + ' logo depois. O programa não muda.');
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
  // PARE (§3.3) só quando há série dele nesta sessão: sem série, tirar do dia
  // não apaga nada — o histórico das outras sessões fica de todo jeito.
  if (temRegistro(d, i)) {
    const reg = daSessao(logKey(d, i), slotDe(d, i), S.sessao.sid);
    const n = reg && reg.sets ? reg.sets.filter(Boolean).length : 1;
    if (!(await pare({ texto: 'Tirar este exercício agora apaga ' + (n === 1 ? 'a série que você registrou' : 'as ' + n + ' séries que você registrou') + ' nele hoje. O histórico das outras sessões fica.',
                       sim: 'Tirar e apagar ' + (n === 1 ? 'a série' : 'as ' + n + ' séries') }))) return;
  }
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

// ---------- aula de box: repetir e reaproveitar ----------
// Aula de box muda toda semana, mas o VOCABULÁRIO do box não muda: os mesmos
// seis a oito movimentos voltam. Montar uma aula de cinco movimentos em cinco
// rounds custava 66 interações — 32 toques e 34 teclas — antes do primeiro
// número digitado, e é isso que estas duas portas atacam.
//
// As duas põem PRESCRIÇÃO no dia, nunca resultado. Trazer as cargas da última
// vez pareceria registro pronto, e registro que aparece sozinho é o jeito mais
// rápido de encher o histórico de número que ninguém fez.

/**
 * O descanso com que um movimento entra num dia.
 *
 * Movimento com grandeza própria entra curto: numa aula em rounds o intervalo
 * é o que o coach dita, e 3 minutos entre um wall ball e outro seriam a
 * prescrição de hipertrofia de volta pela porta dos fundos.
 */
function descansoPadrao(ex) {
  if (temUnidade(ex)) return D_CURTO;
  return ex && ex.c ? D_COMPOSTO : D_ISOLADOR;
}

/** Os movimentos de um dia, na forma que um modelo guarda. */
function movimentosDoDia(d) {
  const t = treino(d);
  if (!t) return [];
  return t.ex.map(function (ex) {
    return { id: ex.id, s: ex.s, d: ex.d, r: ex.r, u: ex.u, q: ex.q };
  });
}

/**
 * A última sessão registrada naquele dia da rotação, com o que ela teve.
 *
 * Sai de `S.logs` e não de um campo próprio: o que ele fez está no histórico, e
 * guardar uma segunda cópia criaria a segunda fonte de verdade que este projeto
 * evita em toda parte. `q` e `u` vêm carimbados no registro, então o modelo sai
 * de lá medido do jeito certo.
 */
function ultimaAulaDe(d) {
  const sessoes = S.done.filter(function (x) { return x.day === d && x.sid; });
  if (!sessoes.length) return null;
  const marca = sessoes[sessoes.length - 1];
  const mov = [];
  Object.keys(S.logs).forEach(function (k) {
    (S.logs[k] || []).forEach(function (e) {
      if (e.sid !== marca.sid) return;
      const ex = exDe(k);
      // O descanso sai da mesma regra que `addExercicio` usa, e não de
      // `descOf`: o log não guarda descanso, e `descOf` cairia no padrão de
      // COMPOSTO — 3 minutos entre um wall ball e outro dentro de um circuito.
      mov.push({ id: k, t: e.t,
                 s: Math.max(1, e.sets.filter(Boolean).length),
                 d: descansoPadrao(ex), r: '', u: e.u, q: e.q });
    });
  });
  if (!mov.length) return null;
  mov.sort(function (a, b) { return a.t - b.t; });
  return { t: marca.t, mov: mov.map(function (m) {
    return { id: m.id, s: m.s, d: m.d, r: m.r, u: m.u, q: m.q };
  }) };
}

/** Põe uma lista de movimentos no dia, como mods. */
async function poeMovimentos(d, mov, comoContar) {
  if (!mov.length) return;
  mov.forEach(function (m, k) {
    poeMod(d, { k:'add', id: m.id, s: m.s, r: m.r || '', d: m.d, u: m.u, q: m.q,
                pos: treino(d).ex.length, n: Date.now() + k });
  });
  view.addEx = false; view.addQ = ''; view.novoEx = false; view.aulas = false;
  await save(); render();
  toast(comoContar);
}

async function repetirUltimaAula() {
  const d = view.day;
  const a = ultimaAulaDe(d);
  if (!a) { toast('Não há sábado anterior para repetir.'); return; }
  await poeMovimentos(d, a.mov,
    a.mov.length + (a.mov.length === 1 ? ' movimento' : ' movimentos') + ' do sábado passado.');
}

/**
 * Salva o dia como modelo.
 *
 * O nome é pedido por `prompt` — é a mesma porta que o app já usa para renomear
 * treino, e uma folha inteira para uma linha de texto seria a quarta camada que
 * o contrato de navegação não tem.
 */
async function salvarAulaComoModelo() {
  const d = view.day;
  const mov = movimentosDoDia(d);
  if (!mov.length) { toast('Não há movimento nenhum para salvar.'); return; }
  const nome = (window.prompt('Nome deste modelo de aula:', '') || '').trim();
  if (!nome) return;
  if (!Array.isArray(S.aulas)) S.aulas = [];
  if (!Array.isArray(S.comidaHist)) S.comidaHist = [];
  const agora = Date.now();
  // Mesmo nome sobrescreve em vez de duplicar: uma lista com três "circuito"
  // não diz qual é qual, e ele não tem como saber sem abrir os três.
  const j = S.aulas.findIndex(function (x) { return x.nome.toLowerCase() === nome.toLowerCase(); });
  const modelo = { id: j >= 0 ? S.aulas[j].id : 'a' + agora, nome: nome,
                   t: j >= 0 ? S.aulas[j].t : agora, m: agora, mov: mov };
  // Se o dia veio de um quadro colado, ele vai junto: salvar é justamente o
  // gesto de quem reconheceu uma aula que se repete, e o modelo sem a lousa
  // perderia o time cap e os pesos na próxima vez.
  if (S.quadro && S.quadro.day === d) modelo.quadro = S.quadro.texto;
  if (j >= 0) S.aulas[j] = modelo; else S.aulas.push(modelo);
  if (S.aulas.length > 60) S.aulas = S.aulas.slice(-60);
  await save(); render();
  toast(j >= 0 ? 'Modelo "' + nome + '" atualizado.' : 'Modelo "' + nome + '" salvo.');
}

/**
 * Importa uma aula escrita fora do app.
 *
 * Preenche o DIA, não a biblioteca de modelos. A aula do box não se sabe
 * antes — ele descobre o que vai ser quando entra —, então a porta certa é a
 * da entrada nova, ao lado da lista rápida, e não a do reuso. Salvar como
 * modelo continua sendo decisão dele, para quando reconhecer uma repetida.
 *
 * Põe prescrição sem carga, como `repetirUltimaAula`: carga que aparece
 * preenchida sozinha é o jeito mais rápido de encher o histórico de número que
 * ninguém fez.
 *
 * O formato está em docs/AULA-IMPORTACAO.md; a leitura e as recusas moram em
 * dominio/aula.ts, onde custam microssegundos para testar.
 */
async function importaAulaColada(texto) {
  const d = view.day;
  if (!diaAberto(d)) { toast('A aula do box só entra no dia aberto.'); return; }

  const r = leAula(texto, function (id) { return !!CAT[id]; });
  if (!r.ok) { toast(r.erro); return; }
  const a = r.aula;

  // Cadastra o vocabulário novo antes de montar o dia: sem isso o dia
  // apontaria para id que o catálogo não conhece, e a linha nasceria vazia.
  a.novos.forEach(function (x) {
    S.ex[x.id] = { n: x.n, g: '', car: x.car, c: 0, cue: '', meu: 1 };
    if (x.u) { S.ex[x.id].u = x.u; if (x.q) S.ex[x.id].q = x.q; }
  });
  if (a.novos.length) montaCatalogo();

  // O quadro fica guardado até a sessão nascer. Ela só existe na primeira
  // série, e é em `fechaSessao` que ele vira a nota do histórico.
  if (a.quadro) {
    S.quadro = { day: d, texto: a.quadro, t: Date.now() };
    if (a.data) S.quadro.data = a.data;
  }

  view.colaAula = false;
  let msg = a.nome + ' · ' + a.mov.length + (a.mov.length === 1 ? ' movimento' : ' movimentos');
  if (a.novos.length) {
    msg += ' · ' + a.novos.length + (a.novos.length === 1 ? ' cadastrado' : ' cadastrados');
  }
  await poeMovimentos(d, a.mov, msg + (r.avisos.length ? ' · ' + r.avisos[0] : ''));
}

async function aplicarModeloDeAula(id) {
  const a = (S.aulas || []).filter(function (x) { return x.id === id; })[0];
  if (!a) return;
  await poeMovimentos(view.day, a.mov, 'Aula "' + a.nome + '" no dia de hoje.');
}

async function apagarModeloDeAula(id) {
  const a = (S.aulas || []).filter(function (x) { return x.id === id; })[0];
  if (!a) return;
  if (!confirm('Apagar o modelo "' + a.nome + '"? As sessões já registradas com ele não mudam.')) return;
  // Lápide, não delete seco: a fusão une as duas listas pela chave natural, e o
  // que só existe de um lado VOLTA na primeira sincronização.
  lapide(chaveDeAula(a));
  S.aulas = S.aulas.filter(function (x) { return x.id !== id; });
  await save(); render();
  toast('Modelo apagado.');
}

function abrirAulas() { view.aulas = !view.aulas; render(); }

function abrirAddEx() { view.addEx = true; view.addQ = ''; render(); }
function fecharAddEx() { view.addEx = false; view.addQ = ''; view.novoEx = false; render(); }
/**
 * O texto da busca do catálogo de adição. **Por valor**, e só dado.
 *
 * Quem devolve o foco é a casca (`buscaEx`): manter o teclado aberto é
 * capacidade de tela, e é o que o teste da busca cobra lendo
 * `document.activeElement`. O filtro em si é `catalogoDeAdicao()`, que lê
 * `view.addQ` — e por isso a busca passou a ser conferível sem campo nenhum.
 */
function setBuscaDeExercicio(q) { view.addQ = q; render(); }

function buscaEx(q) {
  // render() reescreve o innerHTML: sem devolver o foco, o teclado fecha a
  // cada letra digitada
  const foco = document.activeElement && document.activeElement.id;
  setBuscaDeExercicio(q);
  if (foco) { const n = document.getElementById(foco); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
}

async function addExercicio(idEx) {
  const e = exDe(idEx);
  // Exercício medido por TEMPO não tem faixa de repetição a prescrever: uma
  // corrida ou um sled entram como uma passada, e o alvo é o relógio. Dar-lhe
  // `3 × 10–15` era a mesma linguagem de hipertrofia que fazia o sábado inteiro
  // parecer o que não é.
  const un = unidadeDe(e);
  const seg = !!un;
  const s = seg ? 1 : 3;
  const r = seg ? '' : (e.c ? '6–10' : '10–15');
  const desc = descansoPadrao(e);
  // na tela de programa a adição é permanente; na tela de hoje é só do dia
  if (view.prog && view.prog.day) {
    const d = view.prog.day;
    S.prog[d].ex.push({ id:idEx, s:s, r:r, d:desc, u:un, q:e.q, desde: Date.now() });
    logProg(d, e.n + ' entrou no treino · ' + s + ' × ' +
             (seg && e.q > 0 ? fmtInt(e.q) + ' ' + ROTULO_UNIDADE[un] : r));
    view.addEx = false; view.addQ = ''; view.novoEx = false;
    await save(); render();
    toast(e.n + ' entrou no treino ' + d + '.');
    return;
  }
  const d = view.day;
  poeMod(d, { k:'add', id:idEx, s:s, r:r, d:desc, u:un, q:e.q,
              pos: treino(d).ex.length, n: Date.now() });
  view.addEx = false; view.addQ = ''; view.novoEx = false;
  await save(); render();
  toast(e.n + ' entrou no treino de hoje.');
}

function abrirNovoEx() { view.novoEx = true; view.addEx = true; render(); }

/**
 * Cadastra um exercício no catálogo dele e já o põe no treino. **Por valor.**
 *
 * Os seis campos (`#nxn`, `#nxg`, `#nxc`, `#nxk`, `#nxu`, `#nxq`) eram lidos
 * aqui dentro, e por isso `edicao`, `fluxo` e `ritmo` precisavam escrever
 * `document.getElementById("nxg").value = …` antes de chamar o verbo — três
 * arquivos acoplados ao id de um campo para exercitar uma regra de catálogo.
 *
 * `carga` cai em `'pino'` e `unidade` em `''` quando vêm vazias, como o
 * formulário já fazia: o padrão é o do campo, não do chamador.
 */
async function criarExercicioCom(c) {
  const d = c || {};
  const nome = d.nome == null ? '' : String(d.nome);
  const g = d.grupo == null ? '' : String(d.grupo);
  const car = d.carga || 'pino';
  const comp = !!d.composto;
  // A grandeza no cadastro. Sem ela, um movimento que ele criasse nascia como
  // série de musculação — "Burpee" entrava 3 × 10–15, com coluna de kg e selo
  // de RIR — e não havia caminho nenhum para corrigir isso no catálogo.
  const un = d.unidade || '';
  const q = numeroDoCampo(d.q);
  if (nome.trim().length < 3) { toast('Dê um nome ao exercício.'); return; }
  const k = slugEx(nome);
  if (CAT[k] && !CAT[k].arq) { toast('Já existe um exercício com esse nome.'); return; }
  S.ex[k] = { n: nome.trim(), g: un ? '' : g, car: car, c: comp ? 1 : 0, cue: '', meu: 1 };
  // Movimento com grandeza não recebe grupo muscular, pela mesma razão que as
  // estações: atribuí-lo a um músculo faria o painel de volume contar burpee
  // como série de peito.
  if (un) { S.ex[k].u = un; if (q) S.ex[k].q = q; }
  montaCatalogo();
  view.novoEx = false;
  await save();
  await addExercicio(k);
}

/** A casca: lê os seis campos do formulário e chama o verbo. */
async function criarExercicio() {
  const campo = function (id) { return (document.getElementById(id) || {}).value; };
  return criarExercicioCom({
    nome: campo('nxn') || '',
    grupo: campo('nxg') || '',
    carga: campo('nxc') || 'pino',
    composto: !!(document.getElementById('nxk') || {}).checked,
    unidade: campo('nxu') || '',
    q: campo('nxq')
  });
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

// Texto de uma mudança. É o que ele lê na hora de decidir se ela entra no
// treino (§5.2 da frente 3): UMA gramática só — o nome prescrito, dois-pontos, o
// que passou a valer, e o que era depois. "4 séries, não 3" e não "3 → 4": a
// flecha é tabular, e o que importa primeiro é o número que vale. E os atos dele
// não se narram em terceira pessoa ("adicionou", "removeu", "mudou"), que é V8.
function textoMod(d, m) {
  if (m.k === 'add')   return nomeEx(m.id) + ': entrou no dia';
  if (m.k === 'rm')    return nomeEx(m.slot) + ': saiu do dia';
  if (m.k === 'troca') return nomeEx(m.por) + ' no lugar de ' + nomeEx(m.slot);
  if (m.k === 'sets')  return nomeEx(m.slot) + ': ' + m.para + ' séries, não ' + m.de;
  if (m.k === 'reps')  return nomeEx(m.slot) + ': ' + m.para + ' repetições, não ' + m.de;
  if (m.k === 'desc')  return nomeEx(m.slot) + ': descanso de ' + fmtDesc(m.para) + ', não ' + fmtDesc(m.de);
  if (m.k === 'mover') return nomeEx(m.slot) + ': feito ' + (m.para < m.de ? 'antes' : 'depois') + ', fora da ordem';
  // A grandeza do movimento (5 × 500 m). Não estava entre as sete da frente e
  // caía em "mudança", que não diz nada; a mudança não guarda o valor de antes.
  if (m.k === 'med')   return nomeEx(m.slot) + ': medido em ' +
                              (m.q > 0 ? fmtInt(m.q) + ' ' : '') + (ROTULO_UNIDADE[m.u] || m.u);
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

/**
 * O que uma mudança do dia faria no programa — o invólucro que resolve o `S`.
 *
 * A conta e a prosa moram em `dominio/volume.ts`, com os dez casos que as
 * quatro ramificações nunca tiveram (três delas não tinham asserção em lugar
 * nenhum). Aqui fica só o que depende de estado: a rotação oficial, o alvo, o
 * catálogo, o slot original daquele dia e o relógio.
 */
function impactoDoMod(d, m) {
  return _impactoDoMod(m, {
    rotacao: rot().map(function (dia) {
      const pr = S.prog && S.prog[dia];
      if (!pr) return null;
      return { name: pr.name, tag: pr.tag,
               ex: pr.ex.map(function (sl) { return { g: exDe(sl.id).g, s: sl.s }; }) };
    }),
    alvo: ALVO,
    grupoDe: function (id) { return exDe(id).g; },
    nomeDe: nomeEx,
    oficialDe: function (slot) { return slotOriginal(d, slot); },
    agora: Date.now()
  });
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

// A TELA DE DECISÃO SAIU (decisão D1), e com ela estas quatro funções:
// `decidePromo`, `motivoPromo`, `voltarDoPromo` e `concluirPromo`. Elas eram a
// mecânica de uma tela cheia que interrompia o fecho do treino para perguntar
// sobre o PROGRAMA — a pergunta menos urgente que existe neste produto, feita
// no momento em que ele acabou de treinar.
//
// O que ficou no lugar delas, e é mais e não menos: o carregador nos DOIS
// fechos (`fechaSessao` e `finalizarSessao`), a fila em Prescrição com a conta
// de volume e o vencimento ao lado de cada mudança, e `CTX.respondeMudanca`,
// que responde UMA mudança por vez — o que o `dec[]` daquela tela fazia para um
// conjunto, e sem obrigar a decidir tudo de uma vez.
//
// `S.promoPendente` NÃO saiu, e é o ponto do §3.6 do plano: ele é o mecanismo,
// e apagá-lo com a tela é como o F280 volta.
//
// E `aplicaAoOficial` FICA, obviamente: ela é quem escreve no programa, e
// `CTX.respondeMudanca` a chama. Ela morava no meio das quatro que saíram, e eu
// a apaguei junto — o app parou de bootar e 669 casos responderam
// `__escopo is not a function`, que é o modo de falha de um módulo que não
// termina de carregar.

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
        ? { k:'troca', txt: nomeEx(x.id) + ' no lugar de ' + nomeEx(trocado[x.id]) }
        : { k:'novo', txt: nomeEx(x.id) + ' entrou · ' + x.s + ' × ' + x.r });
      return;
    }
    // A mesma gramática da lista que vence (§5.2): o que vale primeiro, e o
    // que era depois. O histórico do programa recebe as duas, e uma gramática
    // por origem faria o mesmo registro falar de dois jeitos.
    if (x.s !== b.s) out.push({ k:'sets', txt: nomeEx(x.id) + ': ' + x.s + ' séries, não ' + b.s });
    if (x.r !== b.r) out.push({ k:'reps', txt: nomeEx(x.id) + ': ' + x.r + ' repetições, não ' + b.r });
    if (x.d !== b.d) out.push({ k:'desc', txt: nomeEx(x.id) + ': descanso de ' + fmtDesc(x.d) + ', não ' + fmtDesc(b.d) });
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
  // Dia aberto não tem meta: dizer "0 séries" seria prometer uma conta que não
  // existe. O que ele tem é uma regra — quem programa é o box.
  if (diaAberto(d)) return 'o que o box programar';
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
  entraNoDestino('prog'); render();
}
function fecharPrograma() { view.prog = null; render(); saiDoDestino('prog'); }
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
  logProg(d, nomeEx(sl.id) + ': ' + novo + ' séries, não ' + de);
  await save(); render();
}

async function moverProg(d, i, delta) {
  const ex = S.prog[d].ex;
  const j = i + delta;
  if (j < 0 || j >= ex.length) return;
  const sl = ex.splice(i, 1)[0];
  ex.splice(j, 0, sl);
  logProg(d, nomeEx(sl.id) + ': ' + (delta < 0 ? 'mais cedo' : 'mais tarde') + ' no treino');
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
      !confirm('Trocar ' + nomeEx(de) + ' mesmo assim?\n\nEle está no programa há ' +
               semanasDe(sl.desde) + ', e o treinador pede 6 a 8 semanas antes de trocar os principais.')) return;
  sl.id = idEx;
  sl.desde = Date.now();
  logProg(d, nomeEx(idEx) + ' no lugar de ' + nomeEx(de));
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
  logProg(d, nomeEx(sl.id) + ': ' + novo + ' repetições, não ' + de);
  await save(); render();
}

async function progDesc(d, i) {
  const sl = S.prog[d].ex[i];
  const opcoes = [D_COMPOSTO, D_MAQUINA, D_MEDIO, D_ISOLADOR, D_CURTO];
  const j = (opcoes.indexOf(sl.d) + 1) % opcoes.length;
  const de = sl.d;
  sl.d = opcoes[j];
  logProg(d, nomeEx(sl.id) + ': descanso de ' + fmtDesc(sl.d) + ', não ' + fmtDesc(de));
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
    if (!confirm('Apagar o treino ' + d + '?\n\nEle não existe no programa atual do treinador.')) return;
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

function openHist(i){ view.hist = { day:view.day, i, key:logKey(view.day,i) }; view.edit = null; entraNoDestino('hist'); render(); }

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

/**
 * Grava na sessão em correção as séries e a observação. **Por valor.**
 *
 * `sets` é a lista NA ORDEM das séries da sessão: cada item é `[carga, reps]`
 * (número ou texto, vírgula vale ponto). Item `null` ou ausente **não mexe**
 * naquela série — é o `if (!a || !b) return` da leitura por id, que existia
 * para o re-render dos chips não apagar o que ainda não estava na tela.
 *
 * `obs` ausente (`undefined`) também não mexe na observação; `''` a apaga.
 */
function guardaEdicaoCom(sets, obs) {
  const e = S.logs[view.hist.key][view.edit];
  e.sets.forEach(function (x, k) {
    const par = sets && sets[k];
    if (par == null) return;
    const w = parseFloat(String(par[0]).replace(',','.')), r = parseInt(par[1],10);
    // O que vem depois de carga e repetição — o RIR — não está no formulário e
    // fica onde estava. Regravar só [carga, reps] apagava o RIR de todas as
    // séries da sessão, inclusive das que ninguém tocou.
    const resto = Array.isArray(x) ? x.slice(2) : [];
    e.sets[k] = isNaN(r) ? null : [isNaN(w) ? 0 : w, r].concat(resto);
  });
  if (obs !== undefined) {
    const t = String(obs == null ? '' : obs).trim();
    if (t) e.obs = t; else delete e.obs;
  }
}

// preserva o que já foi digitado quando os chips forçam re-render
function guardaCamposEdicao() {
  const e = S.logs[view.hist.key][view.edit];
  const sets = e.sets.map(function (x, k) {
    const a = document.getElementById('ed'+k+'_0'), b = document.getElementById('ed'+k+'_1');
    return (a && b) ? [a.value, b.value] : null;
  });
  const o = document.getElementById('edobs');
  guardaEdicaoCom(sets, o ? o.value : undefined);
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
  const key = view.hist.key;
  // PARE (§3.3). A frente 3 escreveu "apagar esta série", mas o que sai é o
  // registro INTEIRO do exercício naquele dia — todas as séries dele —, e a
  // frase diz o que acontece, não o que o desenho supôs.
  const reg = S.logs[key] && S.logs[key][view.edit];
  const n = reg && reg.sets ? reg.sets.filter(Boolean).length : 0;
  const quando = reg ? fmtDate(reg.t) : '';
  if (!(await pare({ texto: 'Apagar o registro de ' + quando + ' tira ' + (n === 1 ? '1 série' : n + ' séries') + ' do histórico de ' + nomeEx(key) + '. Isso não tem volta.',
                     sim: 'Apagar o registro de ' + quando }))) return;
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
function closeHist(){ const i = view.hist.i; view.hist = null; view.edit = null; view.open = i; render(); saiDoDestino('hist'); }

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
/**
 * Corrige um campo do cardio já registrado, no lugar (a D, `dias.html`, estado
 * 12): modalidade, minutos ou intensidade, cada um num toque. O instante não
 * muda — é a chave dele na sincronia (`cardio:<t>`) —, e o carimbo `alt` sobe.
 */
async function corrigeCardio(t, campo, valor) {
  const c = S.cardio.filter(function (x) { return x.t === t; })[0];
  if (!c) return;
  if (campo === 'm' && MODAIS.indexOf(valor) < 0) return;
  if (campo === 'i' && ['leve', 'moderado'].indexOf(valor) < 0) return;
  if (campo === 'min' && !(Math.round(+valor) >= 1 && Math.round(+valor) <= 300)) return;
  if (campo !== 'm' && campo !== 'i' && campo !== 'min') return;
  c[campo] = campo === 'min' ? Math.round(+valor) : valor;
  c.alt = Date.now();                  // carimbo do cardio: `alt`, porque `m` é o modal
  await save();
  render();
}

async function delCardio(t) {
  // Esta lista existe para desfazer um registro errado, e por isso mesmo ela
  // não pode apagar o certo num toque de passagem.
  const c = S.cardio.filter(function (x) { return x.t === t; })[0];
  if (!c) return;
  // O painel do desenho (a D, `dias.html`, estado 12): o que vai embora, o que
  // fica no dia — com o "igual a este" quando é igual —, e o efeito na leitura
  // do mês, com os números de antes e de depois.
  const mesmoDia = cardioDoDia(t).filter(function (x) { return x !== c; });
  const fica = mesmoDia.length
    ? ' Fica ' + mesmoDia.map(function (x) {
        return 'o cardio das ' + fmtHoraDita(x.t) + (x.m === c.m && x.min === c.min && x.i === c.i ? ', igual a este' : ', ' + x.min + ' min de ' + x.m);
      }).join(' e ') + '.'
    : '';
  const treinoFica = sessoesDoDia(t).length ? ' O treino do dia não muda.' : '';
  const d0 = new Date(t), ini = new Date(d0.getFullYear(), d0.getMonth(), 1).getTime(), fim = new Date(d0.getFullYear(), d0.getMonth() + 1, 1).getTime();
  const doMes = S.cardio.filter(function (x) { return x.t >= ini && x.t < fim; });
  const minMes = doMes.reduce(function (a, x) { return a + x.min; }, 0);
  const efeito = ' O cardio de ' + MESES[d0.getMonth()] + ' passa de ' + doMes.length + ' para ' + (doMes.length - 1) +
    (doMes.length - 1 === 1 ? ' sessão' : ' sessões') + ' e de ' + minMes + ' para ' + (minMes - c.min) + ' min.';
  if (!(await pare({ texto: 'Apagar o cardio de ' + DIAS_CURTOS[d0.getDay()] + ' ' + fmtDate(t) + ' tira 1 sessão de cardio: ' +
                             c.min + ' min de ' + c.m + ', ' + c.i + '.' + fica + treinoFica + efeito + ' Isso não tem volta.',
                     sim: 'Apagar o cardio' }))) return;
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

/**
 * Anda um mês em Dias.
 *
 * **Não mexe na rolagem**, e isso é o ponto: trocar de mês é ATUALIZAR O DADO
 * DA MESMA TELA, não entrar em lugar nenhum. Ela subia ao topo a cada toque, e
 * como as setas ficam no meio da página, quem quisesse comparar três meses
 * tinha que rolar de volta até elas três vezes. O `scrollTo(0,0)` era o idioma
 * repetido de "algo mudou, redesenha" — certo para destino, errado aqui.
 *
 * Mês mais curto que a posição atual não precisa de tratamento: o navegador
 * grampeia o `scrollY` no novo fim da página sozinho, e parar no fim de um mês
 * vazio ainda diz mais do que voltar ao topo.
 */
function mudaMes(n) {
  const novo = (view.mes || 0) + n;
  if (novo > 0) return;
  view.mes = novo;
  render();
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

/** As regiões do corpo, na ordem do mapa: peito, ombro, costas, perna, panturrilha, braço, abdômen. */
function regioesDoCorpo() {
  return Object.keys(REGIOES).map(function (g) { return REGIOES[g]; })
    .filter(function (r, i, xs) { return xs.indexOf(r) === i; });
}

// ---------- o lançamento de um treino passado (a D, `dias.html`, estados 6 a 8) ----------
//
// Um toque grava a presença. A folha pergunta uma coisa só — que treino foi —,
// e o toque já é o registro: hora, séries, grupos e duração vêm DEPOIS, se ele
// quiser, e cada um corrige o registro que já existe (decisão 1: cada toque
// grava). Treino de data passada não ganha hora inventada (F270): sem hora, ele
// conta como dia com treino e não entra no horário de início.

/** A hora neutra de um dia sem hora informada: só ordena, nunca é mostrada. */
function horaNeutra(t) { const d = new Date(t); d.setHours(7, 0, 0, 0); return d.getTime(); }

/**
 * Um instante livre para o registro, a partir de `t`.
 *
 * Dois treinos sem hora no mesmo dia cairiam no mesmo instante — e o instante é
 * o `sid` de um registro novo, que é a chave dele na sincronia (`done:<sid>`) e
 * o que apagar e abrir procuram. Um minuto adiante, até ficar livre, e a hora
 * neutra continua sem ser mostrada.
 */
function instanteLivre(t, fora) {
  let x = t;
  while (S.done.some(function (m) { return m !== fora && (m.t === x || m.sid === x); })) x += 60000;
  return x;
}

function abrirAdicionar(t) {
  const base = t != null ? t : Date.now() - 86400000;
  view.add = { t: horaNeutra(base), sid: null, antes: null, horaAberta: false, hora: '', durAberta: false };
  view.sessao = null;
  entraNoDestino('add'); render();
}
function fecharAdicionar() {
  const tinha = view.add && view.add.sid != null;
  view.add = null; render(); saiDoDestino('add');
  if (tinha) save();           // o nome, que grava ao sair do campo, pode não ter saído
}

/** O registro que esta folha gravou, ou `null` antes do toque. */
function registroDoLancamento() {
  const a = view.add;
  return a && a.sid != null ? S.done.filter(function (x) { return x.sid === a.sid; })[0] || null : null;
}

/** O próximo da sequência NAQUELE dia: o que vinha depois do último antes dele. */
function previstoNoDia(t) {
  const ini = new Date(t); ini.setHours(0, 0, 0, 0);
  return proximoTreino(Object.assign({}, S, { done: S.done.filter(function (x) { return x.t < ini.getTime(); }) }), ROT_BASE);
}

/** Dias com treino nas últimas quatro semanas, até ontem — a conta da leitura de Dias. */
function diasNasQuatroSemanas() { return _diasComTreino(S.done, _inicioDoDia(Date.now()) - 1, 28); }

/**
 * O toque que grava: `k` é a letra do treino, ou `'livre'` para fora da
 * prescrição (presença, sem séries, sem mexer na sequência — F155).
 */
async function lancaTreino(k) {
  const a = view.add;
  if (!a || a.sid != null) return;
  if (k !== 'livre' && rot().indexOf(k) < 0) return;
  a.antes = diasNasQuatroSemanas();
  const t = instanteLivre(a.t);
  const marca = { t: t, sid: t, retro: 1, m: Date.now() };
  if (k === 'livre') { marca.livre = 1; marca.grupos = []; }
  else { marca.day = k; if (S.deload) marca.dl = 1; }
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  a.sid = marca.sid;
  a.gravadoEm = Date.now();
  await save();
  render();
}

/** Toda correção depois do toque passa por aqui: carimba e grava. */
async function corrigeLancamento(muda) {
  const m = registroDoLancamento();
  if (!m) return;
  muda(m);
  m.m = Date.now();                    // carimbo: é ele que a fusão compara
  S.done.sort(function (x, y) { return x.t - y.t; });
  await save();
  render();
}

function abreHoraDoLancamento() { if (view.add) { view.add.horaAberta = true; render(); } }

/**
 * A hora de início, por valor ("19:30"). Vazio é "sem hora": o registro volta à
 * hora neutra e perde a marca de hora informada. Hora inválida não grava nada.
 */
async function horaDoLancamento(txt) {
  const a = view.add;
  if (!a) return;
  a.hora = mascaraDeHora(txt, false);
  if (!a.hora) {
    a.horaAberta = false;
    return corrigeLancamento(function (m) { delete m.hora; m.t = instanteLivre(a.t, m); });
  }
  const comHora = aplicaHora(a.t, a.hora);
  if (comHora == null) { render(); return; }
  return corrigeLancamento(function (m) { m.t = instanteLivre(comHora, m); m.hora = 1; });
}
/** A casca do campo: aplica a máscara enquanto ele digita, e grava quando a hora fecha. */
function horaDoLancamentoNoCampo(el) {
  const v = mascaraDeHora(el.value, el.value.length === 2);
  if (v !== el.value) el.value = v;
  if (!v || aplicaHora(view.add.t, v) != null) horaDoLancamento(v);
  else view.add.hora = v;
}

function grupoDoLancamento(g) {
  if (regioesDoCorpo().indexOf(g) < 0) return;
  return corrigeLancamento(function (m) {
    const gs = (m.grupos || []).slice();
    const i = gs.indexOf(g);
    if (i >= 0) gs.splice(i, 1); else gs.push(g);
    m.grupos = gs;
  });
}
/** A duração em minutos; tocar a que já está tira. `'outro'` abre o campo. */
function duracaoDoLancamento(min) {
  if (min === 'outro') { view.add.durAberta = true; render(); return; }
  const v = Math.round(+min);
  return corrigeLancamento(function (m) {
    if (!v || v < 1) { delete m.dur; return; }
    if (m.dur === v * 60000 && !view.add.durAberta) delete m.dur;
    else m.dur = Math.min(600, v) * 60000;
  });
}
/** O nome, o único texto livre: anota a cada tecla e grava ao sair do campo. */
function anotaNomeDoLancamento(nome) {
  const m = registroDoLancamento();
  if (!m) return;
  const v = String(nome || '').trim();
  if (v) m.nome = v; else delete m.nome;
  m.m = Date.now();
}

/**
 * "Detalhar exercícios e séries": abre a sessão daquele registro, na data dele.
 *
 * Só pode existir uma sessão aberta. Fechar a de hoje antes grava a duração
 * dela; sem isso ela ficaria órfã, com o tempo perdido.
 */
async function detalhaLancamento() {
  const m = registroDoLancamento();
  if (!m || m.livre) return;
  let fechou = null;
  if (S.sessao) { fechou = S.sessao.day; fechaSessao('manual'); }
  S.sessao = { day: m.day, inicio: m.t, ultima: m.t, sid: m.sid, retro: 1, tocado: Date.now(), pausas: [], pulados: [] };
  S.draft = null;
  view.add = null; saiDoDestino('add');
  view.day = m.day; view.open = 0; abreModo();
  await save();
  render(); window.scrollTo(0, 0);
  toast(fechou
    ? 'Treino ' + fechou + ' de hoje encerrado. Agora preenchendo ' + fmtDate(m.t) + '.'
    : 'Preenchendo o treino de ' + fmtDate(m.t) + '. Some sozinho quando você sair.');
}

async function concluirRetro() {
  const t = S.sessao ? S.sessao.inicio : null;
  fechaSessao('manual');
  view.open = null;
  await save();
  render(); window.scrollTo(0,0);
  if (t) toast('Treino de ' + fmtDate(t) + ' concluído.');
}

/**
 * A máscara do horário: só dígito e `:`, e os dois-pontos entram sozinhos.
 *
 * `digitando` é o que separa "ele acabou de escrever o segundo dígito" de
 * "alguém está passando um horário inteiro": só no primeiro caso o `:` nasce,
 * porque a máscara existe para poupar uma tecla de quem digita, não para
 * reinterpretar `'06'` vindo por valor.
 */
function mascaraDeHora(txt, digitando) {
  const v = (txt == null ? '' : String(txt)).replace(/[^0-9:]/g, '');
  return (digitando && v.length === 2 && v.indexOf(':') < 0) ? v + ':' : v;
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
  const t = tendenciaDeForca(S.logs, function (k) { return temUnidade(exDe(k)); });
  return sinalDeForca(t, S.perfManual);
}
/**
 * Dias com registro de comida nos últimos 14.
 *
 * A trava de adesão do nutricionista: mudança automática só é permitida com
 * cerca de 80% dos 14 dias interpretáveis. Conta dia sobre o qual o app SABE
 * algo, não aderência: quem seguiu o plano e quem saiu sabendo o que comeu
 * contam igual. Só o dia perdido não conta — ver `diaInterpretavel`.
 */
function diasRegistrados() {
  if (!Array.isArray(S.comidaHist)) return 0;
  const hoje = new Date();
  const iso = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
              String(hoje.getDate()).padStart(2, '0');
  return diasInterpretaveis(S.comidaHist, 14, iso);
}

function sinaisDaRegra() {
  return {
    forcaSubindo: forcaSubindo(),
    diasRegistrados: diasRegistrados(),
    // A segunda camada de confirmação, que substituiu a cintura. Perguntada na
    // tela de comparar, onde as duas fotos estão à vista. Envelhece em 14 dias:
    // sem leitura recente o peso abre revisão e não corta.
    gorduraVisual: leituraVigente(S.gordura, Date.now()),
    // o passo em vigor: com ele, a regra espera duas semanas novas de peso
    passoEm: passoEmVigor() ? passoEmVigor().t : null
  };
}

function veredito() { return _veredito(S.body, sinaisDaRegra()); }

/**
 * O par de fotos sobre o qual a avaliação visual é perguntada — o mesmo que a
 * comparação abre: a primeira pose com duas sessões, o par padrão dela, e só se
 * ele cobrir de 10 a 28 dias, que é sobre o que a pergunta é. `null` sem par.
 */
function parDaAvaliacao() {
  const pose = ordemDePoses().filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0];
  const par = pose && parPadrao(S.protocolo.sessoes, pose);
  if (!par) return null;
  const de = instanteDaData(par.de.d), ate = instanteDaData(par.ate.d);
  const dias = Math.abs(Math.round((ate - de) / 86400000));
  return dias >= JANELA_MIN && dias <= JANELA_MAX ? { de: de, ate: ate } : null;
}

/**
 * O rótulo do ajuste em vigor.
 *
 * Diz o SALDO, não o último passo: depois de um ajuste a nova ingestão vira a
 * linha de base, então dois cortes são −300 kcal e a tela precisa dizer isso.
 * Vive aqui porque DADOS e COMIDA mostram o mesmo texto, e duas cópias
 * divergiriam no dia em que o saldo passasse de um passo.
 */
function rotuloDoAjuste() {
  const n = S.ajuste || 0;
  if (!n) return 'plano base';
  const passos = Math.abs(n);
  return 'ajuste ' + (n > 0 ? '+' : '−') + (passos * 150) + ' kcal' +
         (passos > 1 ? ' · ' + passos + ' passos' : '');
}

/** Quanto de arroz o plano manda hoje, com o ajuste em vigor aplicado. */
function arrozAtual() {
  // Soma o que o plano diz, e NÃO reaplica o ajuste: `aplicaArroz()` já gravou
  // o passo dentro de `i.q`. Aplicar de novo aqui contava o ajuste duas vezes,
  // e o número da tela mentia por 120 g — invisível enquanto o saldo era
  // ternário e no máximo um passo, mas o saldo acumulado empilharia o erro.
  const plano = planoDeComida();
  let total = 0;
  plano.forEach(function (r) {
    r.itens.forEach(function (i) { if (i.arroz) total += i.q; });
  });
  return Math.round(total);
}

/**
 * Aplica o ajuste calórico onde o plano manda aplicar: no arroz.
 * O veredito DECIDE, isto EXECUTA — é a divisão de trabalho entre as duas
 * metades do produto.
 *
 * Adaptador: a regra vive em `aplicaAjusteNoArroz` (dominio/nutricao/calculo);
 * aqui só se junta a lista de itens marcados. Não recebe mais o saldo ANTERIOR
 * porque não precisa dele: o que cada item recebeu está no item (`ajq`), e era
 * recalcular isso pela contagem de agora que tirava comida do prato quando o
 * plano mudava no meio.
 */
function aplicaArroz() {
  const itens = [];
  planoDeComida().forEach(function (r) {
    r.itens.forEach(function (i) { if (i.arroz) itens.push(i); });
  });
  // Quem muda o plano CARIMBA. `aplicaArroz` reescreve a quantidade de arroz
  // em dado PERSISTIDO, e não carimbava: `comida.v` ficava igual ao `pv` que o
  // dia fechado guardou ANTES do passo, então o app não conseguia dizer que
  // aquele dia foi calculado contra outro plano. Sub-relatava divergência.
  if (aplicaAjusteNoArroz(itens, S.ajuste || 0)) planoMudou();
}

// Adaptador: a regra vive em dominio/volume.ts; aqui só entram os dados.
function seriesPorMusculo(de, ate, corte) {
  return _seriesPorMusculo(S.logs, function (k) { return exDe(k).g; }, de, ate, corte);
}

/**
 * @param {boolean} [semVeredito] omite o cartão de veredito, que a tela DADOS já
 *   desenha no Instrumento logo acima — sem isso ele aparece duas vezes.
 */
/**
 * Onde o stepper começa quando ainda não há nenhuma medida registrada. Sai da
 * coluna `partida` de `MEDIDAS_DO_CORPO`: com as medidas com fita, transcrever
 * os valores aqui seria a segunda lista que diverge da tabela.
 */
const CORPO_PADRAO = {};
MEDIDAS_DO_CORPO.forEach(function (m) { if (m.partida != null) CORPO_PADRAO[m.k] = m.partida; });

/** A unidade de uma grandeza, pela tabela. */
function unidadeDoCorpo(k) { const m = medidaDoCorpo(k); return m ? m.u : ''; }

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
/** "Registrar hoje", "Registrar ontem", "Registrar em ter 14". */
function acaoDaMedida(k) {
  const r = rotuloDoDia(diaDaMedida(k));
  return 'Registrar ' + (r === 'hoje' || r === 'ontem' ? r : 'em ' + r);
}

/** O que a tela precisa saber sobre a data escolhida. */
function diaDaMedidaVM(k) {
  const d = diaDaMedida(k);
  const j = medidaDoDia(k);
  const un = unidadeDoCorpo(k);
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

/**
 * Põe uma marca na série daquela grandeza, no instante dado.
 *
 * A medida do MESMO DIA é substituída, e a substituída ganha lápide: o registro
 * novo tem outro instante, e sem a lápide a fusão traria os dois de volta e o
 * dia teria duas medidas.
 *
 * @returns {number} quantas medidas daquele dia foram substituídas
 */
function gravaMarca(k, v, quando, onde) {
  if (!Array.isArray(S.body[k])) S.body[k] = [];
  const arr = S.body[k];
  const noDia = arr.filter(x => sameDay(x.t, quando));
  // O "como eu medi" de uma medida com fita é guardado na primeira vez e não
  // volta a ser digitado. Corrigir o valor do MESMO dia sem texto novo não pode
  // levá-lo junto com a marca substituída — senão a correção de um número
  // apagaria o lembrete que existe para o ponto não mudar.
  if (!onde) onde = noDia.map(x => x.onde).filter(Boolean)[0] || null;
  noDia.forEach(x => { lapide(chaveDeMarca(k, x)); arr.splice(arr.indexOf(x), 1); });
  const nova = { t: quando, v, m: Date.now() };
  if (onde) nova.onde = onde;
  arr.push(nova);
  arr.sort((a,b) => a.t - b.t);
  if (arr.length > 400) S.body[k] = arr.slice(-400);
  return noDia.length;
}

async function addBody(k) {
  const v = valorDoCorpo(k);
  if (isNaN(v) || v <= 0) { toast('Digite um número válido.'); return; }

  const quando = instanteDaMedida(k);
  const rotulo = rotuloDoDia(quando);
  // O texto de "como eu medi" só existe nas medidas com fita, e vazio é "não
  // disse" — nunca uma frase em branco gravada por cima do lembrete.
  const onde = (view.bodyOnde && typeof view.bodyOnde[k] === 'string') ? view.bodyOnde[k].trim() : '';
  declaraGravacao(k === 'peso' ? 'o peso de ' + (rotulo === 'hoje' ? 'hoje' : rotulo) : 'a medida de ' + (medidaDoCorpo(k) || { n: k }).n,
                  comUnidade(v, unidadeDoCorpo(k)));
  const substituiu = gravaMarca(k, v, quando, onde || null);

  // Solta o rascunho: o stepper volta a se derivar da última medida, que é
  // justamente a que acabou de ser gravada. E a data volta para hoje — deixar
  // uma data passada armada seria a próxima pesagem caindo no dia errado sem
  // ele perceber.
  view.bodyForm = Object.assign({}, view.bodyForm);
  delete view.bodyForm[k];
  view.bodyDia = Object.assign({}, view.bodyDia);
  delete view.bodyDia[k];
  if (view.bodyDiaAberto === k) view.bodyDiaAberto = null;
  view.bodyOnde = Object.assign({}, view.bodyOnde);
  delete view.bodyOnde[k];
  await save();
  render();
  // Nome e unidade pela tabela, como no aviso de remover: com as medidas com
  // fita, um ternário em `k === 'peso'` daria "Cintura" a um braço.
  const med = medidaDoCorpo(k);
  const nome = med ? med.n.charAt(0).toUpperCase() + med.n.slice(1) : k;
  const un = unidadeDoCorpo(k);
  toast(substituiu
    ? `${nome} de ${rotulo} atualizado para ${fmtDec(v)} ${un}.`
    : `${fmtDec(v)} ${un} registrado ${rotulo === 'hoje' ? 'hoje' : 'em ' + rotulo}.`);
}

/**
 * A TORNEIRA DA BIOIMPEDÂNCIA: registra uma leitura da balança.
 *
 * Toda a tubulação das cinco grandezas já existia — `MEDIDAS_DO_CORPO` as
 * declara, a migração 9 → 10 criou as chaves em `S.body`, a lista branca da
 * cópia de segurança as preserva, `chaveDeMarca` tem lápide para cada uma e a
 * fusão as soma. **Faltava a porta de escrita.** Nada no app gravava a
 * primeira leitura, e `addBody('bioPeso')` recusava com "Digite um número
 * válido" porque não há (nem deve haver) valor de partida para elas.
 *
 * **Recebe a LEITURA INTEIRA, não uma grandeza por vez.** As cinco saem da
 * mesma pesagem, e a tabela do domínio diz isso em letras (`bio` é *"sai da
 * balança de bioimpedância, na mesma leitura das outras `bio`"*). Gravar três
 * de quatro deixaria uma leitura que não fecha — massa de gordura sem
 * percentual, percentual sem peso — e é dela que a média semanal depois lê.
 * Por isso a recusa é ATÔMICA: nada entra pela metade.
 *
 * **`bioAgua` é a única opcional**, e isso não é leniência do app: é
 * `MEDIDAS_DO_CORPO[].obrigatorio`, consultado aqui em vez de transcrito.
 * Vazia, ela não entra — e não vira zero, que seria medição inventada.
 *
 * **O peso daqui é registro SEPARADO de `S.body.peso`.** Ele pesa na balança
 * do banheiro de manhã e mede na de bioimpedância em outra hora; as duas
 * séries convivem de propósito, e unificá-las perderia a diferença entre as
 * duas balanças. O veredito da dieta continua lendo só a da manhã.
 *
 * **Não há valor de partida para as cinco em `CORPO_PADRAO`, e não deve
 * haver**: um padrão de `bioGorduraPct: 18` seria o app inventando leitura de
 * balança. Campo de bioimpedância nasce vazio, e esta é a única porta que o
 * enche.
 *
 * **ESTE VERBO EXISTE E A TELA NÃO.** A capacidade está no modelo, alcançável
 * e testável por aqui; nenhuma tela do app a oferece ao dedo ainda, e o resumo
 * do acervo (`CTX.dadosDoApp`) continua não contando as cinco. A tela é de
 * outra frente.
 *
 * @param {object} leitura valores por chave de grandeza. Texto com vírgula
 *   decimal é aceito, porque é o que um campo de aparelho entrega.
 * @param {number} [quando] o instante da leitura; o padrão é agora. Data no
 *   futuro é recusada, como em `CTX.setDiaCorpo`.
 * @returns {Promise<object>} `{ ok: true, em, gravadas }` ou
 *   `{ ok: false, falta, invalidas }` — sempre por valor, nunca um elemento.
 */
async function registraBio(leitura, quando) {
  const L = (leitura && typeof leitura === 'object') ? leitura : {};
  const t = quando == null ? Date.now() : Number(quando);
  if (!t || isNaN(t) || t > Date.now()) {
    toast('Data no futuro: a leitura não foi registrada.');
    return { ok: false, falta: [], invalidas: [], futuro: true };
  }

  const falta = [], invalidas = [], vai = [];
  MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).forEach(function (m) {
    const bruto = L[m.k];
    if (bruto == null || bruto === '') { if (m.obrigatorio) falta.push(m); return; }
    const v = typeof bruto === 'number' ? bruto : parseFloat(String(bruto).replace(',', '.'));
    // Opcional preenchida com lixo também recusa: deixar passar em silêncio
    // perderia uma medida que ele digitou, e um erro de digitação não é
    // "não medi".
    if (isNaN(v) || v <= 0) { invalidas.push(m); return; }
    vai.push({ k: m.k, v: v });
  });

  const nomes = function (ms) { return ms.map(function (m) { return m.n; }).join(', '); };
  if (invalidas.length) {
    toast('Número inválido em ' + nomes(invalidas) + '.');
    return { ok: false, falta: falta.map(m => m.k), invalidas: invalidas.map(m => m.k) };
  }
  if (falta.length) {
    // §10.1: não é "campo obrigatório". A frase diz POR QUE ele é, que é a única
    // coisa que torna a exigência razoável num fluxo de transcrever um visor.
    const com = vai.length ? ': com ' + POR_EXTENSO[vai.length] + ', a série do mês fica sem comparação.' : '.';
    toast((falta.length === 1 ? 'Falta ' : 'Faltam ') + listaComE(falta.map(nomeNaFrase)) +
          '. Os cinco números são uma medição só' + com);
    return { ok: false, falta: falta.map(m => m.k), invalidas: [] };
  }

  // Um instante só para as cinco: é o que as torna UMA leitura, e é o que a
  // fusão usa para casar o mesmo dia vindo de dois aparelhos.
  let substituiu = 0;
  vai.forEach(function (x) { substituiu += gravaMarca(x.k, x.v, t); });

  await save();
  render();
  // "Guardei os cinco números de 01/10 neste aparelho." (§10.3): quantos, e o
  // que entrou — é o que impede o "Guardar" de ser o "Salvar" que V2 recusa.
  toast('Guardei os ' + POR_EXTENSO[vai.length] + ' números de ' + fmtDate(t) + ' neste aparelho.' +
        (substituiu ? ' Substituí a leitura que havia nesse dia.' : ''));
  return { ok: true, em: t, gravadas: vai.map(function (x) { return x.k; }) };
}
const POR_EXTENSO = ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco'];
/** "a massa de gordura e o percentual de gordura": o nome com o artigo. */
const ARTIGO_DA_BIO = { bioPeso: 'o', bioMusculo: 'a', bioGordura: 'a', bioGorduraPct: 'o', bioAgua: 'a' };
function nomeNaFrase(m) { return (ARTIGO_DA_BIO[m.k] ? ARTIGO_DA_BIO[m.k] + ' ' : '') + m.n; }
function listaComE(xs) {
  return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1];
}

/**
 * Valor com a unidade da grandeza, como se escreve.
 *
 * O `%` cola no número e as outras levam espaço — é a regra que o resto do app
 * já segue (`+2,3%`, `81,2 kg`), e ela mora aqui para a frase não a decidir.
 */
function comUnidade(v, u) { return fmtDec(v) + (u === '%' ? '' : ' ') + u; }

// ---------- o painel de PARE (decisão 13) ----------
// A família "vai destruir" da frente 3 (§3.3), para as NOVE ações que apagam
// dado que o aparelho não reconstrói. Promessa e não o diálogo do sistema: os
// botões dele chamam-se "OK" e "Cancelar", e a regra escrita é que nenhum painel de
// pare tenha esses rótulos — o botão repete o verbo com o objeto, e a saída é
// "Deixar como está". As outras catorze perguntas do app mexem em prescrição ou
// em conta, o registro fica, e continuam no diálogo do sistema: pintá-las de pare
// treinaria o dono a ignorar o painel.
let pareResolve = null;
let pareSeq = 0;
/**
 * @param {{ texto: string, sim: string }} opcoes a frase inteira, aberta pelo
 *   infinitivo do estrago e com o número do que vai embora; e o rótulo do botão,
 *   que repete o verbo com o objeto
 * @returns {Promise<boolean>} se ele tocou no verbo
 */
function pare(opcoes) {
  // Um painel por vez. Um pedido novo com outro esperando responde ao primeiro
  // que não — o primeiro não pode ficar pendurado para sempre.
  if (pareResolve) { const r = pareResolve; pareResolve = null; r(false); }
  return new Promise(function (resolve) {
    pareResolve = resolve;
    // `tom: 'pergunta'` é a variante NEUTRA, para a pergunta que para o dedo
    // sem destruir nada (encerrar com pendentes, §7.7). A moldura de pare é só
    // das duas famílias da decisão 13: "nada mais usa o painel de pare" (§3.4).
    view.pare = { id: ++pareSeq, texto: opcoes.texto, sim: opcoes.sim,
                  nao: opcoes.nao || null, tom: opcoes.tom || 'pare' };
    render();
  });
}
function respondePare(sim) {
  const r = pareResolve;
  pareResolve = null;
  view.pare = null;
  render();
  if (r) r(!!sim);
}
CTX.pare = function () { return view.pare || null; };
CTX.respondePare = function (sim) { respondePare(sim); };

// As portas da gravação que falhou (o mecanismo mora junto de `grava()`).
CTX.naoGuardado = function () { return view.naoGuardado || null; };
CTX.falhou = function () { return view.falhou && view.naoGuardado ? view.naoGuardado : null; };
/** Tentar de novo é repetir a MESMA intenção: gravar o estado inteiro. */
CTX.tentaGravar = function () { return save(); };
/**
 * Copiar o registro inteiro: o estado é regravado inteiro a cada série (F256),
 * então a cópia é a cópia de segurança completa (F249), e não um remendo.
 */
CTX.copiaRegistro = async function () {
  try {
    await navigator.clipboard.writeText(payload());
    toast('Copiei o registro inteiro. Cole num lugar fora deste aparelho.');
  } catch (e) {
    toast('Não consegui copiar. Ajustes › Cópia de segurança exporta o mesmo registro.');
  }
};
CTX.dispensaFalha = function () { dispensaFalha(); };


async function delBody(k, t) {
  // Confirma, como as outras ações destrutivas: a medida é um ponto de um dia
  // que já passou, e desfazer seria ter decorado o número. O aviso delimita o
  // estrago em vez de dramatizar.
  //
  // Nome e unidade saem de `MEDIDAS_DO_CORPO`, e nunca de um ternário em
  // `k === 'peso'`. Com as cinco grandezas da bioimpedância em `S.body` desde a
  // migração 9 → 10, o ternário fazia este aviso DESTRUTIVO perguntar pela
  // grandeza errada na unidade errada: remover uma leitura de `bioGorduraPct`
  // perguntava *"Remover a cintura de 08/10 (17,8 cm)?"*. A tabela do domínio
  // sabe o nome e a unidade das sete; transcrever duas delas aqui era a única
  // razão de o aviso poder mentir.
  //
  // E é PARE (§3.3 da frente 3): a medida apagada não volta, e com lápide a
  // sincronia não a ressuscita. A frase abre pelo infinitivo do estrago, diz o
  // número que vai embora, e o botão repete o verbo com o objeto. Só o peso da
  // manhã entra na média da semana e no ritmo — dizer isso das outras onze seria
  // a frase mentindo sobre o que a regra lê.
  const m = S.body[k].filter(function (x) { return x.t === t; })[0];
  const med = MEDIDAS_DO_CORPO.filter(function (x) { return x.k === k; })[0];
  if (!m) return;
  const quando = fmtDate(t), valor = comUnidade(m.v, med ? med.u : '');
  const sim = await pare(k === 'peso'
    ? { texto: 'Apagar o peso de ' + quando + ' (' + valor + ') tira ele da média da semana e do ritmo. As outras medidas ficam.',
        sim: 'Apagar o peso de ' + quando }
    : { texto: 'Apagar a medida de ' + (med ? med.n : k) + ' de ' + quando + ' (' + valor + ') tira ela do histórico. As outras medidas ficam.',
        sim: 'Apagar a medida de ' + quando });
  if (!sim) return;
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
        // A lista branca das medidas do corpo também é por chave, e também
        // enumera `MARCAS_DO_CORPO`: escrita à mão, ela derrubaria em silêncio
        // as cinco da bioimpedância — que é exatamente como os seis campos de
        // topo tinham sido perdidos.
        body: corpoDoBackup(d.body),
        sessao: d.sessao || null,
        carga: (d.carga && typeof d.carga === 'object') ? d.carga : {},
        export: typeof d.export === 'number' ? d.export : 0,
        plano: typeof d.plano === 'number' ? d.plano : 1,
        prog: d.prog || null, rot: d.rot || null,
        ex: (d.ex && typeof d.ex === 'object') ? d.ex : {},
        mods: d.mods || null, progLog: Array.isArray(d.progLog) ? d.progLog : [],
        // A metade de comida entra pelo mesmo caminho. Whitelist e não spread
        // de propósito: um backup adulterado não pode injetar campo que o app
        // não conhece. O preço é este — campo novo tem que ser listado aqui.
        // O teste que cobra a paridade com a exportação é
        // "reimportar devolve TODOS os campos" em `tests/fluxo/dados.test.js`:
        // ele escreve em cada campo, exporta, apaga, importa e compara tudo.
        // Antes dele, a promessa deste comentário não existia em teste nenhum,
        // e seis campos tinham ficado para trás.
        cadencia: Array.isArray(d.cadencia) && d.cadencia.length === 7 ? d.cadencia : null,
        comida: (d.comida && typeof d.comida === 'object') ? d.comida : null,
        dia: (d.dia && typeof d.dia === 'object') ? d.dia : null,
        // `ajuste` é SALDO acumulado de passos de ±150 kcal, não estado
        // ternário — o comentário do tipo diz, com estas palavras, que "dois
        // cortes seguidos são −300 kcal, não outro −150" e que isso "não cabe
        // em `-1 | 0 | 1`, que descreve um destino e não um saldo".
        //
        // Esta linha clampava a −1|0|1 e era a única no app a fazê-lo: o tipo
        // diz `number`, quem escreve faz `antes + passo` sem teto, e
        // `normalizaEstado()` aceita qualquer número finito. Então um backup de
        // quem estava em dois passos voltava com saldo ZERO, calado — e zero não
        // parece dado perdido, parece "nenhum ajuste em vigor". Mesma família do
        // bug dos seis campos: perda muda no único caminho de volta que ele tem.
        //
        // Passa número finito e deixa `normalizaEstado()` arredondar: é ele o
        // único lugar que sabe o padrão de cada campo.
        ajuste: (typeof d.ajuste === 'number' && isFinite(d.ajuste)) ? d.ajuste : 0,
        perfManual: (d.perfManual === true || d.perfManual === false) ? d.perfManual : null,
        compras: (d.compras && typeof d.compras === 'object') ? d.compras : null,
        // a sincronização: sem estes, importar um backup zeraria o carimbo do
        // estado e as lápides — e um aparelho ressuscitaria o que o outro apagou
        mtime: typeof d.mtime === 'number' ? d.mtime : 0,
        apagados: (d.apagados && typeof d.apagados === 'object') ? d.apagados : {},
        descanso: (d.descanso && typeof d.descanso === 'object') ? d.descanso : {},
        fotos: (d.fotos && typeof d.fotos === 'object') ? d.fotos : {},
        // Coleção desde o plano 10, e o backup pode ser de antes: o documento
        // antigo entra como está e `migraPlano10` o converte, logo abaixo.
        promoPendente: (d.promoPendente && typeof d.promoPendente === 'object') ? d.promoPendente : [],
        // Estes seis ficaram para trás quando nasceram, e a perda era MUDA:
        // `normalizaEstado()` roda logo abaixo e devolve todos vazios, então o
        // app abria limpo sem avisar nada — com o backup intacto no disco e
        // inútil. É o caminho de volta dele que estava quebrado.
        ajusteHist: Array.isArray(d.ajusteHist) ? d.ajusteHist : [],
        gordura: Array.isArray(d.gordura) ? d.gordura : [],
        aulas: Array.isArray(d.aulas) ? d.aulas : [],
        comidaHist: Array.isArray(d.comidaHist) ? d.comidaHist : [],
        protocolo: (d.protocolo && typeof d.protocolo === 'object') ? d.protocolo : null,
        quadro: (d.quadro && typeof d.quadro === 'object') ? d.quadro : null };
  // um backup de qualquer versão anterior passa pelas mesmas migrações que o
  // estado do disco: sem isso o app abre com o programa nulo
  normalizaEstado();
  migraPlano(S);
  migraPlano3(S);
  migraPlano4(S);
  migraPlano5(S);
  migraPlano6(S);
  // A 7 e a 8 faltavam aqui. `ARQUITETURA` diz que toda migração roda no boot
  // E na importação, pelo mesmo caminho — um backup do plano 6 entrava com o
  // histórico das estações de HYROX que a 6→7 existe para apagar.
  migraPlano7(S);
  migraPlano8(S);
  migraPlano9(S);
  migraPlano10(S);
  migraPlano11(S);
  migraPlano12(S);
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
/**
 * Traz o exercício recém-aberto para a tela.
 *
 * Sem isto, abrir o primeiro exercício não mostrava a série: com a sessão
 * correndo, a primeira linha de digitar nascia em y=826 numa janela de 874 —
 * atrás da tab bar, invisível. Abrir e ROLAR eram duas ações, e a segunda caía
 * sobre quem está de pé, com uma mão, entre uma série e outra.
 *
 * `instant` e não `smooth`: o sistema tem exatamente dois movimentos (§6 do
 * DESIGN) e este não vira o terceiro. O cartão simplesmente já está lá.
 * Onde ele para é o `scroll-margin-top` de `.ex`.
 */
function mostraExercicio(i) {
  const el = document.querySelector('[data-ex="' + i + '"]');
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'instant' });
}

function toggle(i){
  const abrindo = view.open !== i;
  view.open = abrindo ? i : null;
  view.swapOpen = null; view.nota = null; view.carga = null; view.medida = null;
  // A RÉGUA e a escala de RIR também fecham. Para a régua isso é requisito — o
  // R5 da frente 2 proíbe posição que sobreviva à desmontagem, "se guardar, a
  // próxima montagem herda a janela de uma sessão que acabou" —, e sem isto o
  // toque seguinte no botão ALTERNAVA para fechado em vez de abrir, porque
  // `view.regua` continuava apontando a mesma série. A escala de RIR entra na
  // mesma linha: ela já devia fechar e não fechava.
  view.regua = null; view.rir = null; view.teclado = null;
  render();
  if (abrindo) mostraExercicio(i);
}
function dorName(k){ const x = DORES.filter(y=>y.k===k)[0]; return x ? x.t : k; }

// Grava no rascunho a cada tecla, sem re-render: o campo não perde o foco
// e nada se perde ao abrir outro exercício ou fechar o app no meio do treino.
// type="number" recusa vírgula: no teclado pt-BR "73,4" chegava aqui como string
// vazia. Os campos são type="text" e a limpeza é feita na mão.
/** O que um campo numérico deixa ficar: dígito, e separador decimal quando couber. */
function filtroNum(dec) { return dec ? /[^0-9.,]/g : /[^0-9]/g; }

/**
 * O número que há num texto, normalizado: vírgula vale ponto, o resto cai fora.
 *
 * É a metade POR VALOR de `limpaNum`. A outra metade — reescrever o campo com o
 * que sobrou — é da casca, e é a única parte que precisa de um elemento.
 */
function soNumero(v, dec) {
  return (v == null ? '' : String(v)).replace(filtroNum(dec), '').replace(',', '.');
}

function limpaNum(el, dec) {
  const limpo = el.value.replace(filtroNum(dec), '');
  if (limpo !== el.value) el.value = limpo;
  return limpo.replace(',', '.');
}

/**
 * Registra um valor de série — carga (`pos` 0), repetição (1) ou RIR (2) — na
 * posição `i` do dia aberto, série `k`. **Por valor.**
 *
 * Esta é a interação de maior frequência do produto, e até aqui a única porta
 * para ela era pôr texto num campo e disparar `input`: `inp` recebia o
 * elemento, e nenhum teste conseguia registrar uma série sem a tela de hoje.
 * Agora `inp` é a casca — lê o campo, reescreve o que o campo aceita, pinta o
 * `done` — e tudo que é modelo mora aqui.
 *
 * `valor` aceita número ou texto, com vírgula ou ponto; `''` e `null` apagam a
 * série, que é o gesto de "digitei errado" e tem de continuar existindo.
 */
function anotaSerie(i, k, pos, valor) {
  const e = draftOf(i);
  if (!e.s[k]) e.s[k] = [null,null];
  // antes da escrita, senão registrar e corrigir ficam indistinguíveis
  const jaRegistrada = serieJaRegistrada(i, k);
  const raw = soNumero(valor, pos === 0);
  const num = pos === 0 ? parseFloat(raw) : parseInt(raw,10);
  const v = (raw === '' || isNaN(num)) ? null : num;
  // RIR não é grandeza aberta: acima de 5 a pessoa não está treinando perto o
  // suficiente para o número significar algo, e negativo não existe
  e.s[k][pos] = (pos === 2 && v != null) ? Math.max(0, Math.min(5, v)) : v;
  declaraGravacao('a série ' + (k + 1),
    (e.s[k][0] != null && e.s[k][1] != null) ? fmtNum(e.s[k][0]).replace('.', ',') + ' × ' + e.s[k][1] : null);
  segurarTela();
  projeta(i);
  atualizaEstado();
  atualizaAnilhas(i);
  queueSave();
  autoTimer(i, k, e, jaRegistrada);
}

function inp(el, i, k, pos) {
  const raw = limpaNum(el, pos === 0);
  el.classList.toggle('done', el.value !== '');
  anotaSerie(i, k, pos, raw);
}

/**
 * A digitação da lista rápida: um campo por MOVIMENTO, não por passada.
 *
 * Existe porque o ritmo real de uma aula de box não é o da musculação. Entre
 * uma série e outra há 60 a 180 segundos parado, e é aí que se registra; entre
 * dois rounds de um circuito não há nada — o coach já chamou o próximo, o
 * celular está na mochila. A janela que existe de verdade é DEPOIS da aula,
 * ofegante, sentado, e ela é curta.
 *
 * O valor entra em TODAS as passadas do movimento, e a tela diz isso com todas
 * as letras na própria linha ("5 passadas · o mesmo em todas"). Escrever cinco
 * vezes o mesmo número em silêncio seria o app inventando dado; escrever com o
 * rótulo à vista é ele oferecendo uma aproximação que o usuário aceitou — e o
 * cartão continua aberto ao lado para quem quiser diferenciar round a round.
 *
 * Não dispara o cronômetro de descanso: quem preenche isto está com a aula
 * terminada, e um contador de descanso começando aí não serve a ninguém.
 */
function anotaSerieRapida(i, pos, valor) {
  const ex = treino(view.day).ex[i];
  if (!ex) return;
  const e = draftOf(i);
  const raw = soNumero(valor, pos === 0);
  const num = pos === 0 ? parseFloat(raw) : parseInt(raw, 10);
  const v = (raw === '' || isNaN(num)) ? null : num;
  for (let k = 0; k < setsFor(ex); k++) {
    if (!e.s[k]) e.s[k] = [null, null];
    e.s[k][pos] = v;
  }
  segurarTela();
  projeta(i);
  atualizaEstado();
  queueSave();
}

/**
 * O teclado próprio na LISTA RÁPIDA, para a carga (`pos` 0) e a medida (1) de
 * um movimento.
 *
 * §6.1 manda próprio aqui, e o fonte já dizia por quê, no comentário de
 * `anotaSerieRapida`: a janela de registro da aula é "DEPOIS da aula, ofegante,
 * sentado, e ela é curta". Curta é o que define — o teclado do sistema cobre
 * metade da tela e esconde os movimentos seguintes da própria lista.
 *
 * Parte do valor REGISTRADO, como na série e ao contrário do corpo: aqui não há
 * stepper acima mostrando o número, então o teclado é o único editor do valor,
 * e abrir vazio faria um valor já registrado parecer ausente.
 *
 * Tocar no mesmo botão fecha; tocar no outro troca. Um painel só.
 */
function abreTecladoRapido(i, pos) {
  if (!treino(view.day).ex[i]) return;
  const a = view.teclado && view.teclado.alvo;
  if (a && a.tipo === 'rapida' && a.i === i && a.pos === pos) {
    view.teclado = null; render(); return;
  }
  const dr = draftPeek(i);
  const v = dr && dr.s && dr.s[0] ? dr.s[0][pos] : null;
  view.regua = null; view.rir = null;
  view.teclado = { alvo: { tipo: 'rapida', i: i, pos: pos },
                   texto: v != null ? String(v).replace('.', ',') : '' };
  render();
}

function abrirRapido() {
  view.rapido = !view.rapido; view.open = null;
  // Fechar a lista fecha o teclado dela: um painel aberto sem a linha que o
  // abriu ficaria escrevendo num movimento que não está mais na tela.
  if (!view.rapido && view.teclado && view.teclado.alvo.tipo === 'rapida') view.teclado = null;
  render();
}

/** Série completa: carga E repetição. É o critério do disparo do descanso. */
function serieCheia(e, k) {
  return !!(e && e.s && e.s[k] && e.s[k][0] != null && e.s[k][1] != null);
}

/**
 * Esta série já estava registrada ANTES deste toque?
 *
 * É a pergunta que separa REGISTRAR de CORRIGIR, e é ela que decide se o
 * descanso começa. Tem de ser feita antes da escrita: depois dela os dois atos
 * são indistinguíveis.
 *
 * A marca era `view.fired[dia + i + ':' + k]` — campo de `view`, MEMÓRIA e
 * nunca disco. O iOS fecha o app em segundo plano no meio do treino; ao reabrir
 * a marca nascia vazia, e corrigir uma série registrada quinze minutos antes
 * disparava um descanso de dois minutos para uma série que já tinha acabado.
 *
 * A resposta agora vem do DADO, que sobrevive ao processo: o rascunho, que vai
 * a disco, e — como segunda fonte, para quando o rascunho daquela posição ainda
 * não foi hidratado — a série já escrita no histórico desta sessão. As duas
 * espelham a mesma verdade, porque `projeta` reescreve o histórico a partir do
 * rascunho; a segunda só cobre a janela em que a primeira está vazia.
 */
function serieJaRegistrada(i, k) {
  if (serieCheia(draftPeek(i), k)) return true;
  const s = S.sessao;
  if (!s) return false;
  const entry = entradaDaSessao(view.day, i, s.sid);
  const set = entry && entry.sets && entry.sets[k];
  return !!(set && set[0] != null && set[1] != null);
}

// O cronômetro começa sozinho quando QUALQUER série fica completa.
//
// Começava só na última do exercício, e isso deixava sem cronômetro justamente
// a espera mais frequente da sessão: a que separa a série 1 da 2. Entre elas o
// usuário tinha que achar e tocar "DESCANSO 3MIN" no topo do cartão — um toque
// a mais por série, de pé, com uma mão, que é o contexto que este app existe
// para respeitar.
//
// A pergunta é POR SÉRIE, não por exercício: com uma marca por exercício, a
// série 2 não dispararia depois da 1. E apagar o campo rearma aquela série e só
// ela.
//
// `jaRegistrada` vem do CHAMADOR, medido antes da escrita (`serieJaRegistrada`):
// é o que separa registrar de corrigir, e é por isso que corrigir não reinicia
// o descanso.
/**
 * Anuncia a série, com o valor dentro do anúncio.
 *
 * "55 kg × 9, série 3 guardada" — e o valor dentro é o ponto: um anúncio que
 * diga só "guardado" obriga quem usa leitor de tela a ir conferir o que foi
 * guardado, que é justamente o trabalho que o anúncio existe para poupar.
 *
 * Hoje a confirmação visual já existe e é boa (`voa()` leva o valor até a
 * tabela). O que faltava era a metade auditiva: nenhuma das chamadas de `toast`
 * é da gravação de série, e o `<input>` ecoava o valor por ser campo — o que
 * deixa de valer no dia em que a régua substituir o campo.
 *
 * Região própria e invisível, e não o toast: 48 toasts por semana competindo com
 * o cronômetro de descanso — que começa no mesmo instante — seriam ruído para
 * quem vê, para resolver um problema de quem não vê.
 */
function dizSerie(i, k, e, jaRegistrada) {
  const el = document.getElementById('serie-dita');
  if (!el) return;
  const s = e.s[k] || [];
  const ex = treino(view.day).ex[i];
  const un = unidadeDe(ex);
  // "55" e não "55,0": o anúncio diz o que ele DIGITOU, e a casa decimal vazia
  // lida em voz alta vira "cinquenta e cinco vírgula zero". Inteiro sai inteiro;
  // decimal sai com vírgula, porque ponto em português se lê como outra coisa.
  const num = function (v) { return v % 1 === 0 ? String(v) : fmtDec(v); };
  const peso = s[0] == null ? null : num(s[0]) + (un ? ' ' + ROTULO_UNIDADE[un] : ' kg');
  const reps = s[1] == null ? null : String(s[1]);
  const valor = peso && reps ? peso + ' × ' + reps : (peso || reps || '');
  // "Guardei a série 3: 55 kg × 9." / "Corrigi a série 3: 55 kg × 9, igual à
  // última." — o agente aparece (V8), e corrigir tem verbo próprio: guardar de
  // novo soaria como série nova. O "igual à última" saiu do botão da régua
  // (§8.3) e vem para cá, onde cabe e é lido depois do toque.
  const p = jaRegistrada ? lastSet(logKey(view.day, i), k) : null;
  const igual = !!(p && p[0] === s[0] && p[1] === s[1]);
  el.textContent = (jaRegistrada ? 'Corrigi' : 'Guardei') + ' a série ' + (k + 1) + ': ' +
    valor + (igual ? ', igual à última' : '') + '.';
}

function autoTimer(i, k, e, jaRegistrada) {
  const ex = treino(view.day).ex[i];
  const ult = setsFor(ex) - 1;
  const cheia = serieCheia(e, k);

  // série incompleta não tem descanso a começar — e completá-la de novo depois
  // de apagar o campo REARMA o disparo daquela série, porque aí ela deixou de
  // estar registrada
  if (!cheia) return;
  // A SÉRIE GUARDADA É ANUNCIADA, com o valor dentro (frente 2, R6). Fica aqui
  // porque é aqui que o app sabe que a série ficou COMPLETA e é NOVA — as duas
  // coisas que fazem dela uma gravação e não uma correção.
  //
  // Antes do `return` do `jaRegistrada`: corrigir também merece anúncio, e com
  // palavra diferente, porque o que mudou foi o valor e não o registro.
  dizSerie(i, k, e, jaRegistrada);
  // corrigir não reinicia o descanso: o valor muda, o instante não
  if (jaRegistrada) return;

  // O bi-set não descansa entre as suas séries — é essa a definição. O primeiro
  // encadeia direto no segundo, e só quando o exercício acabou; nas séries do
  // meio não há pausa a cronometrar.
  if (ex.bi === 1) {
    if (k === ult) proximoDoBiset(i);
    return;
  }
  startTimer(descOf(ex), 'descanso · série ' + (k + 1) + ' · ' + ex.n);
  // O descanso primeiro: ele é do exercício que ACABOU, e o rótulo dele diz
  // qual foi. Só então a tela anda.
  if (k === ult) avancaExercicio(i);
}

/**
 * Ao completar o último set, abre o próximo pendente.
 *
 * Tira um toque por exercício de quem está de pé, com uma mão, entre séries —
 * o mesmo motivo pelo qual o cronômetro passou a disparar sozinho. Abre
 * PRONTO, não INICIADO: não começa sessão, não dispara descanso e não
 * preenche nada. O que ele acabou de fazer colapsa, como já acontecia no
 * bi-set, e continua a um toque para quem precisa corrigir o que digitou.
 *
 * Nada acontece se o exercício ainda tem série faltando, nem se não há mais
 * pendente à frente: chegar ao fim é informação, e quem decide o que fazer
 * com o que ficou para trás é a tela de finalizar.
 */
function avancaExercicio(i) {
  const t = treino(view.day);
  if (!t) return;
  const estados = estadosDoDia();
  if (estados[i] !== 'feito') return;
  const prox = proximoDepois(estados, i);
  if (prox == null) return;
  view.open = prox; view.swapOpen = null;
  render();
  mostraExercicio(prox);
}

function proximoDoBiset(i) {
  const prox = treino(view.day).ex[i+1];
  if (!prox) return;
  view.open = i+1; view.swapOpen = null;
  render();
  toast('Sem pausa: vá direto para ' + prox.n.replace(' (bi-set)','') + '.');
}

/**
 * Copia para a série a carga e a repetição da MESMA série da última vez.
 *
 * A coluna ANTERIOR já respondia "o que eu fiz aqui na semana passada", e na
 * maioria das séries ela é exatamente o que vai ser digitado — repetir a carga
 * é o caso comum, subir é a exceção. Mesmo assim os dois números eram digitados
 * no teclado virtual, de pé, com uma mão: duas aberturas de teclado por série,
 * umas quarenta por sessão.
 *
 * Tocar preenche e pronto. Não confirma nada e não fecha nada — os campos
 * continuam campos, e corrigir a carga para cima é editar um número que já
 * está lá. Como a série entra no histórico assim que carga e repetição existem
 * (§8 do contrato de UX), o toque também dispara o cronômetro pelo caminho
 * normal, sem atalho próprio.
 */
function usaAnterior(i, k) {
  const key = logKey(view.day, i);
  const p = lastSet(key, k);
  if (!p) return;
  const e = draftOf(i);
  if (!e.s[k]) e.s[k] = [null, null];
  const jaRegistrada = serieJaRegistrada(i, k);
  e.s[k][0] = p[0];
  e.s[k][1] = p[1];
  segurarTela();
  projeta(i);
  atualizaEstado();
  atualizaAnilhas(i);
  queueSave();
  render();
  autoTimer(i, k, e, jaRegistrada);
}

function anotaObservacao(i, texto) { draftOf(i).obs = texto; projeta(i); queueSave(); }
function obsIn(el, i) { anotaObservacao(i, el.value); }
function toggleAq(i) { const e = draftOf(i); e.aq = !e.aq; projeta(i); queueSave(); render(); }
// A anotação e os marcadores de dor ficam atrás de um link: na maioria das
// sessões não há nada a registrar, e ocupavam espaço em todo exercício aberto.
// Uma vez que exista conteúdo no rascunho, o bloco reabre sozinho.
function abrirNota(i) { view.nota = i; render(); }
function abrirCarga(i) { view.carga = view.carga === i ? null : i; render(); }

function abrirMedida(i) { view.medida = view.medida === i ? null : i; render(); }

/**
 * A medida daquele movimento HOJE — a grandeza e quanto dela.
 *
 * Escreve no MOD, não no programa: num dia aberto tudo é mod, e mudar a
 * prescrição do sábado é a natureza do dia, não uma emenda a ele. Quando o
 * movimento veio de um `add` (o caminho normal do dia aberto) a mudança entra
 * no próprio `add`, senão o dia acumularia dois mods dizendo respeito à mesma
 * coisa e o resumo do fim listaria a mesma decisão duas vezes.
 *
 * Não passa por `render()` a cada tecla no campo de quantidade: reescrever a
 * tela no meio da digitação é o que fechava o teclado do iPhone, e é a mesma
 * razão que existe na projeção da série.
 */
function poeMedida(i, u, qTexto) {
  const d = view.day;
  const t = treino(d);
  if (!t || !t.ex[i]) return;
  const ex = t.ex[i];
  const slot = ex.orig || ex.id;
  const q = qTexto === undefined ? undefined : numeroDoCampo(qTexto);

  const b = bufferMods(d);
  const add = b.list.filter(function (x) { return x.k === 'add' && (x.id + '#' + x.n) === slot; })[0];
  const alvo = add || null;
  if (alvo) {
    if (u !== undefined) alvo.u = u;
    if (q !== undefined) alvo.q = q;
  } else {
    const atual = b.list.filter(function (x) { return x.k === 'med' && x.slot === slot; })[0];
    const nova = { k:'med', slot: slot,
                   u: u !== undefined ? u : (atual ? atual.u : unidadeDe(ex)),
                   q: q !== undefined ? q : (atual ? atual.q : ex.q) };
    if (atual) Object.assign(atual, nova); else b.list.push(nova);
  }

  // a grandeza é carimbada no registro: mudá-la tem que alcançar o que já foi
  // digitado nesta sessão, senão o log fica com a unidade de antes
  projeta(i);
  queueSave();
  if (u !== undefined) { view.medida = null; render(); }
  else { atualizaEstado(); atualizaPrescricao(i); }
}

/**
 * Reescreve a prescrição no cabeçalho do cartão, sem re-render.
 *
 * Mesma escapatória de `atualizaEstado()`, e pelo mesmo motivo: um `render()`
 * a cada tecla reescreveria `value` a partir do estado, e "5," viraria "5" no
 * meio da digitação — o campo é controlado e o número ainda não terminou de
 * ser escrito. Sem isto o cabeçalho dizia `1 × 20 reps` enquanto o campo já
 * mostrava 30, e as duas coisas ficavam na tela ao mesmo tempo.
 */
/**
 * A prescrição de uma posição do dia, em texto: `3 × 10–15`, `5 × 400 m`.
 *
 * É a metade POR VALOR de `atualizaPrescricao`: o que o cabeçalho tem de dizer,
 * sem precisar de cabeçalho para dizê-lo. `null` quando não há exercício ali.
 */
function textoDaPrescricao(i) {
  const ex = treino(view.day).ex[i];
  if (!ex) return null;
  const un = unidadeDe(ex);
  const ns = setsFor(ex);
  return un && ex.q > 0
    ? ns + ' × ' + fmtInt(ex.q) + ' ' + ROTULO_UNIDADE[un]
    : ns + (ex.r ? ' × ' + ex.r : '');
}

function atualizaPrescricao(i) {
  const el = document.getElementById('presc' + i);
  if (!el) return;
  const txt = textoDaPrescricao(i);
  if (txt == null) return;
  el.textContent = txt;
}

/** Número de um campo livre: vírgula vale ponto, e vazio é ausência. */
function numeroDoCampo(v) {
  const t = String(v == null ? '' : v).replace(',', '.').trim();
  if (!t) return undefined;
  const n = parseFloat(t);
  return isFinite(n) && n > 0 ? n : undefined;
}
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
  // PARE (§3.3). A frente 3 escreveu "se houver cópia remota, ela continua lá",
  // e o código diz o contrário: com conta, `NUVEM.apagaFoto` apaga a remota
  // logo abaixo. A frase diz o que o código faz.
  const remota = !!NUVEM.sessao();
  if (!(await pare({ texto: 'Apagar a foto do equipamento de ' + nomeEx(id) + ' tira a imagem deste aparelho' + (remota ? ' e da cópia remota' : '') + '. O exercício continua; só a imagem sai. Isso não tem volta.',
                     sim: 'Apagar a foto do equipamento' }))) return;
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

/**
 * A régua da série `k`, quando ela está aberta — e `null` quando não está.
 *
 * A REFERÊNCIA é o que ele fez nesta MESMA série da última vez. Sem histórico
 * não há "última vez": aí a régua abre na base da faixa prescrita, que é onde o
 * treinador manda recomeçar (F95, "recomeçar perto da base"), e a marca não
 * aparece — dizer "última" sobre um número que ele nunca fez seria inventar.
 */
function reguaDaLinha(i, k, ex, anterior, valor, un, deHoje) {
  const r = view.regua;
  if (!r || r.i !== i || r.k !== k || r.outro) return null;
  const fx = faixaDoTexto(ex.r);
  const tem = !!(anterior && anterior[1] != null);
  const hoje = !tem && !!deHoje;
  const ref = tem ? anterior[1] : hoje ? deHoje[1] : (fx ? fx[0] : 10);
  const reg = regua(ref, fx);
  return {
    slots: pagina(reg, r.foco != null ? r.foco : ref),
    marca: tem ? 'última' : hoje ? 'série ' + k : null,
    referencia: ref,
    // "Corrigir a série 3 · guardada: 55 kg × 9" — só com a série já guardada,
    // que é quando o toque CORRIGE (§8.2). O "às 6h52" do desenho não vem: a
    // série não guarda o próprio instante, só a sessão.
    corrige: valor && valor[1] != null
      ? 'Corrigir a série ' + (k + 1) + ' · guardada: ' + textoDoGuardado(valor, un)
      : null
  };
}

/** "55 kg × 9", ou "9 repetições" sem carga — o par como ele está no disco. */
function textoDoGuardado(s, un) {
  return s[0] != null && s[0] !== ''
    ? fmtNum(s[0]).replace('.', ',') + ' ' + un + ' × ' + s[1]
    : s[1] + ' repetições';
}

/**
 * Abre ou fecha a régua da série.
 *
 * O foco nasce do valor já registrado, ou da referência — **sempre recalculado
 * na abertura, nunca herdado**. É o R5 da frente 2: posição que sobrevive à
 * desmontagem faz a próxima montagem herdar a janela de uma sessão que acabou.
 */
function abreRegua(i, k) {
  const aberta = view.regua && view.regua.i === i && view.regua.k === k;
  if (aberta) { view.regua = null; render(); return; }
  const dr = draftPeek(i);
  const v = dr && dr.s[k] ? dr.s[k][1] : null;
  view.rir = null; view.teclado = null;   // uma coisa aberta por vez embaixo da linha
  view.regua = { i: i, k: k, foco: v != null ? v : null, outro: false };
  render();
}

/** Anda a janela da régua: uma JANELA por toque, e o domínio explica por quê. */
function andaRegua(dir) {
  const r = view.regua;
  if (!r) return;
  const ex = treino(view.day).ex[r.i];
  if (!ex) return;
  const fx = faixaDoTexto(ex.r);
  const p = lastSet(logKey(view.day, r.i), r.k);
  const tem = !!(p && p[1] != null);
  const ref = tem ? p[1] : (fx ? fx[0] : 10);
  const reg = regua(ref, fx);
  view.regua = Object.assign({}, r, { foco: anda(reg, r.foco != null ? r.foco : ref, dir) });
  render();
}

/**
 * O toque num número da régua: grava e fecha.
 *
 * Grava por `anotaSerie`, que é a porta POR VALOR — e com ela vêm de graça o
 * cronômetro de descanso, o avanço de exercício e o anúncio da série (R6), que
 * é justamente o que a régua tira do campo ao substituí-lo.
 *
 * **Tocar de novo no valor que já está lá APAGA.** O campo apagava com `''`, e
 * `anotaSerie` diz por escrito que isso "é o gesto de 'digitei errado' e tem de
 * continuar existindo" — a régua não tem campo para esvaziar, então o gesto
 * passa a ser o segundo toque. É o mesmo desenho do RIR, que já faz assim com a
 * razão escrita: "sem isso um toque errado não teria volta".
 *
 * E apagar REARMA o disparo do descanso daquela série, porque ela deixou de
 * estar registrada — comportamento que o campo tinha e que não pode sair junto
 * com ele.
 */
function poeRep(i, k, v) {
  const dr = draftPeek(i);
  const atual = dr && dr.s[k] ? dr.s[k][1] : null;
  view.regua = null;
  anotaSerie(i, k, 1, atual === v ? '' : v);
  render();
}

/**
 * A porta "outro valor": a repetição que não está na régua.
 *
 * Abre o TECLADO PRÓPRIO, que é o que a §6.1 manda aqui — e o caminho é raro por
 * construção, porque a régua carrega a vizinhança da última vez e a faixa do
 * treinador inteira. O texto nasce do valor já registrado: corrigir 27 para 28
 * não começa do zero.
 */
function abreOutroValor() {
  const r = view.regua;
  if (!r) return;
  const dr = draftPeek(r.i);
  const v = dr && dr.s[r.k] ? dr.s[r.k][1] : null;
  view.regua = null;
  view.teclado = { alvo: { tipo: 'serie', i: r.i, k: r.k, pos: 1 },
                   texto: v != null ? String(v) : '' };
  render();
}

/**
 * Uma tecla do teclado próprio.
 *
 * Escreve a cada tecla, como o campo escrevia a cada letra — é a mesma
 * semântica, e `anotaSerie` continua sendo a porta. Vírgula vale ponto; texto
 * que ainda não é número (`'22,'`) não apaga o que estava: `anotaSerie` só
 * recebe o que já se lê como número.
 */
function teclaDoTeclado(t) {
  const tc = view.teclado;
  if (!tc) return;
  const a = tc.alvo;
  // Qual grandeza aceita vírgula: carga e as medidas de corpo, sim; repetição,
  // não. A tecla nem aparece onde não aceita.
  const decimal = a.tipo === 'corpo' || a.pos === 0;
  const texto = teclar(tc.texto, t, decimal);
  view.teclado = Object.assign({}, tc, { texto: texto });
  // `'22,'` é digitação no meio do caminho: ainda não é número, e gravar nesse
  // instante apagaria o valor por um passo. Gravar vazio, sim — é o gesto de
  // apagar, que tem de continuar existindo.
  if (!/,$/.test(texto)) {
    if (a.tipo === 'serie') anotaSerie(a.i, a.k, a.pos, texto);
    else if (a.tipo === 'passada') cargaDaPassada(texto);
    // A lista rápida escreve em TODAS as passadas do movimento, e a linha diz
    // isso por extenso; quem converte a vírgula é `soNumero`, lá dentro.
    else if (a.tipo === 'rapida') anotaSerieRapida(a.i, a.pos, texto);
    else {
      // Em corpo o vazio é "sem rascunho", e `valorDoCorpo` já lê isso caindo na
      // última medida (ou no padrão). Guardar o último número digitado em vez de
      // soltar deixaria o stepper mostrando um pedaço do que ele apagou.
      //
      // E apagar aqui NÃO apaga medida nenhuma: o teclado escreve rascunho, não
      // histórico. Quem remove uma medida é a porta na lista das últimas, que é
      // o único caminho para desfazer um 743 digitado no lugar de 74,3.
      const n = numeroDoCampo(texto);
      view.bodyForm = Object.assign({}, view.bodyForm, { [a.campo]: n == null ? null : n });
    }
  }
  render();
}

function fechaTeclado() { view.teclado = null; render(); }

/**
 * O teclado da CARGA, aberto pelo botão da célula.
 *
 * §6.1: a carga da série é teclado PRÓPRIO. Era o último campo da sessão a abrir
 * o teclado do sistema — o que cobre metade da tela no meio de uma série, que é
 * a razão escrita no fonte desde que o RIR virou botão.
 *
 * O texto nasce do valor registrado, e `fmtNum` não entra aqui: o visor mostra o
 * que foi DIGITADO, com vírgula, e quem converte é `anotaSerie`.
 */
function abreTecladoDeCarga(i, k) {
  const a = view.teclado && view.teclado.alvo;
  if (a && a.tipo === 'serie' && a.i === i && a.k === k && a.pos === 0) {
    view.teclado = null; render(); return;
  }
  const dr = draftPeek(i);
  const v = dr && dr.s[k] ? dr.s[k][0] : null;
  view.regua = null; view.rir = null;
  view.teclado = { alvo: { tipo: 'serie', i: i, k: k, pos: 0 },
                   texto: v != null ? String(v).replace('.', ',') : '' };
  render();
}

/**
 * O teclado próprio em CORPO, para peso e cintura.
 *
 * §6.1 manda próprio nos dois, "com a régua de 100 g na frente" — e é isso que o
 * stepper é. O que faltava era a outra metade da frase: *"a régua resolve o caso
 * comum e o próprio resolve o resto"*.
 *
 * O resto tem tamanho medido: **a primeira pesagem parte de 75 kg**
 * (`CORPO_PADRAO`), então quem pesa 73,6 chega lá com **14 toques** no menos —
 * e a cintura parte de 85. Um valor longe do último não tinha caminho nenhum
 * além de apertar.
 *
 * Escreve no RASCUNHO (`view.bodyForm`), que é onde o stepper escreve: quem
 * registra continua sendo o botão de registrar, e a data escolhida continua
 * valendo. O teclado é outra porta para o mesmo número, não outro registro.
 */
function abreTecladoDeCorpo(campo) {
  const a = view.teclado && view.teclado.alvo;
  if (a && a.tipo === 'corpo' && a.campo === campo) {
    view.teclado = null; render(); return;
  }
  // NASCE VAZIO, e aqui isso é diferente da série. Lá o teclado é o único editor
  // do valor, então ele parte do que está registrado. Aqui o stepper já mostra o
  // número atual logo acima, e o valor de partida pode ser o PADRÃO (75 kg para
  // o peso, 85 cm para a cintura) — pré-encher faria ele apagar dois dígitos
  // antes de digitar os seus, que é o mesmo defeito dos catorze toques em
  // miniatura. A divisão da §6.1 fica limpa: o stepper para o perto, o teclado
  // para o resto.
  view.teclado = { alvo: { tipo: 'corpo', campo: campo }, texto: '' };
  render();
}

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
// ---------- deload: o freio passou do lugar para a palavra (§7.6) ----------

// A regra do treinador sobre deload, LITERAL: o parágrafo do programa que diz
// quando e o quê. Vai entre aspas e com o autor, e por isso não pode ser
// paráfrase — a frente escreveu uma, e o app não põe assinatura em frase que o
// treinador não escreveu (o mesmo critério da dor e da máquina ocupada).
const REGRA_DO_DELOAD = (function () {
  const r = RULES.filter(function (x) { return x.k === 'deload'; })[0];
  const p = r && r.p.filter(function (x) { return /evidência clara/.test(x); })[0];
  return p ? p.replace(/<[^>]+>/g, '') : null;
})();

function nSeries(n) { return n + (n === 1 ? ' série' : ' séries'); }

/** Quanto o prescrito do dia pede e quanto o deload deixa — a conta de `setsFor`. */
function corteDoDeload(d) {
  const t = treino(d);
  if (!t || !t.ex.length) return null;
  return {
    nome: 'Treino ' + d,
    cheio: t.ex.reduce(function (n, ex) { return n + _setsFor(ex, false); }, 0),
    cortado: t.ex.reduce(function (n, ex) { return n + _setsFor(ex, true); }, 0)
  };
}

/**
 * As palavras de quem liga ou desliga o deload, com o número antes do toque.
 * O menu da sessão e os avisos do treino leem daqui: duas portas para o mesmo
 * interruptor, e nenhuma delas sem o freio da palavra.
 */
function itemDoDeload(d) {
  const c = corteDoDeload(d);
  if (!c) return null;
  return S.deload
    // "Sair do deload · devolve 10 séries ao Treino A de hoje"
    ? { ligado: true, rotulo: 'Sair do deload',
        detalhe: 'devolve ' + nSeries(c.cheio - c.cortado) + ' ao ' + c.nome + ' de hoje' }
    // "Deload hoje · corta 20 séries para 10, nas mesmas cargas"
    : { ligado: false, rotulo: 'Deload hoje',
        detalhe: 'corta ' + nSeries(c.cheio) + ' para ' + c.cortado + ', nas mesmas cargas',
        regra: REGRA_DO_DELOAD };
}

/**
 * "Deload desligado. As 10 séries voltaram: Pulldown unilateral volta a pedir 4,
 * e as 2 que você já registrou ficam." — a decisão 7 inteira numa frase. O
 * exercício nomeado é o último em que ele registrou e que agora pede mais do que
 * tem: é ali que o susto mora. Sem o "o" do desenho antes do nome, porque metade
 * dos exercícios é feminina e o app não sabe o gênero de nenhum.
 */
function fraseDoDesligar(s) {
  const c = corteDoDeload(s.day);
  const volta = c ? c.cheio - c.cortado : 0;
  if (!volta) return 'Deload desligado. Séries completas de volta.';
  const abre = 'Deload desligado. ' + (volta === 1 ? 'A 1 série voltou' : 'As ' + volta + ' séries voltaram');
  const ficam = function (n) { return n === 1 ? 'a 1 que você já registrou fica.' : 'as ' + n + ' que você já registrou ficam.'; };
  let alvo = null, total = 0;
  treino(s.day).ex.forEach(function (ex, i) {
    const e = entradaDaSessao(s.day, i, s.sid);
    if (!e) return;
    const feitas = e.sets.filter(Boolean).length;
    const pede = _setsFor(ex, false);
    total += feitas;
    if (feitas > 0 && feitas < pede && (!alvo || (e.m || 0) >= alvo.m)) {
      alvo = { n: ex.n, pede: pede, feitas: feitas, m: e.m || 0 };
    }
  });
  if (alvo) return abre + ': ' + alvo.n + ' volta a pedir ' + alvo.pede + ', e ' + ficam(alvo.feitas);
  if (total) return abre + ', e ' + ficam(total);
  return abre + '.';
}

/**
 * O modo vale para a sessão INTEIRA, e o registro dela tem de dizer o mesmo que
 * a tela. O `dl` de cada entrada é o que `estadoEx` lê para saber quantas séries
 * o exercício pede: sem isto, desligar no meio deixava "feito" o exercício de 2
 * séries enquanto a frase dizia que ele voltou a pedir 4, e a sessão saía
 * marcada como deload — fora da conta das 48 — sem estar. Nenhuma série muda,
 * só a marca do modo, com carimbo novo para a outra ponta da sincronia aceitar.
 */
function remarcaSessao(s) {
  const agora = Date.now();
  const remarca = function (x) {
    if (x.sid !== s.sid || !!x.dl === S.deload) return;
    if (S.deload) x.dl = 1; else delete x.dl;
    x.m = agora;
  };
  Object.keys(S.logs).forEach(function (k) { S.logs[k].forEach(remarca); });
  S.done.forEach(remarca);
}

async function setDeload(on) {
  const s = S.sessao;
  const frase = on
    ? 'Deload ligado. Metade das séries, mesmas cargas. As sessões deste modo ficam marcadas, para a queda de volume não parecer regressão.'
    : s ? fraseDoDesligar(s) : 'Deload desligado. Séries completas de volta.';
  S.deload = !!on;
  if (s) remarcaSessao(s);
  await save();
  view.open = null; render();
  toast(frase);
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
      const un = e.u || null;
      const seg = !!un;
      // Ritmo onde o resultado é o relógio; o resto como sempre foi. E o
      // recorde compara na DIREÇÃO da unidade: um remo mais lento chegou a
      // aparecer como "recorde de tempo", que é a mesma mentira do +423%.
      const ritmo = cronometrado(un) && ritmoDe(e) != null;
      const met = ritmo ? function (l) { const r = ritmoDe(l); return r == null ? 0 : r; }
                : seg ? tutOf : volOf;
      const antes = S.logs[k].filter(function (x) { return x.t < e.t; });
      const comparaveis = antes.filter(function (x) { return met(x) > 0; });
      const melhor = comparaveis.length
        ? (ritmo ? Math.min.apply(null, comparaveis.map(met))
                 : Math.max.apply(null, comparaveis.map(met)))
        : null;
      const ant = antes.length ? met(antes[antes.length-1]) : 0;
      const cru = ant > 0 ? Math.round((met(e) - ant) / ant * 100) : null;
      out.push({
        t: e.t, nome: ex.n,
        seg: seg, un: un, q: e.q, ritmo: ritmo,
        sets: e.sets, met: met(e), dor: e.dor || [],
        novo: !antes.length,
        delta: cru,
        // o delta continua sendo o número cru; quem sabe se ele foi BOM é a
        // unidade, e é isso que a tela pinta
        bom: cru != null && (ritmo ? cru < 0 : cru > 0),
        recCarga: !seg && antes.length > 0 && maxLoad(e) > Math.max.apply(null, antes.map(maxLoad)),
        recMet: melhor != null && met(e) > 0 && (ritmo ? met(e) < melhor : met(e) > melhor),
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

  // O painel do desenho (a D, `dias.html`, estado 13): o que vai embora, com o
  // número; o que FICA, com o número também, para ele conferir que está
  // apagando a de cima e não a de baixo; e a resposta que um apagar de treino
  // sempre levanta — o que acontece com a sequência. Apagar a presença e deixar
  // as séries deixaria séries órfãs contando volume (F295): vão juntas.
  const nomeDe = function (x) {
    return x.livre ? 'o treino fora da prescrição' : diaAberto(x.day) ? 'a aula' : 'o Treino ' + x.day;
  };
  const seriesDe = function (x) {
    return Object.keys(S.logs).reduce(function (n, k) {
      return n + (S.logs[k] || []).filter(function (l) { return l.sid === x.sid; })
        .reduce(function (a, l) { return a + l.sets.filter(Boolean).length; }, 0);
    }, 0);
  };
  const dia = DIAS_LONGOS[new Date(m.t).getDay()] + ', ' + fmtDate(m.t);
  const vai = '1 sessão' + (temHora(m) ? ', aberta às ' + fmtHoraDita(m.t) : '') +
    ', com ' + (series === 1 ? '1 série' : series + ' séries');
  const outras = sessoesDoDia(m.t).filter(function (x) { return x !== m; });
  const fica = outras.length
    ? ' Fica ' + outras.map(function (x) {
        const n = seriesDe(x);
        return nomeDe(x) + (temHora(x) ? ' das ' + fmtHoraDita(x.t) : '') + ', com ' + (n === 1 ? '1 série' : n + ' séries');
      }).join(' e ') + '.'
    : '';
  const ultimo = ultimaDoPlano();
  const antesDele = S.done.filter(function (x) { return x !== m && x.day && !x.livre; });
  const novoUltimo = antesDele.length ? antesDele[antesDele.length - 1] : null;
  const quandoDe = function (x) { return sameDay(x.t, Date.now()) ? 'de hoje' : 'de ' + fmtDate(x.t); };
  const seq = m.livre
    ? ' A sequência não muda: treino fora da prescrição não conta nela.'
    : ultimo === m
      ? ' A sequência volta um passo: ' + (novoUltimo
          ? 'o último registrado passa a ser ' + nomeDe(novoUltimo) + ' ' + quandoDe(novoUltimo) + '.'
          : 'não sobra treino registrado, e o próximo volta a ser o primeiro.')
      : ' A sequência não muda: o último registrado continua sendo ' + nomeDe(ultimo) + ' ' + quandoDe(ultimo) + '.';
  const sim = await pare({ texto: 'Apagar ' + nomeDe(m) + ' de ' + dia + ' tira ' + vai + '.' + fica + seq +
                             ' Isso não tem volta, e vale para os outros aparelhos.',
                           sim: 'Apagar ' + nomeDe(m) });
  if (!sim) return;

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

/**
 * "Está certo": o tempo aproximado passa a ser declarado, sem mudar o número.
 *
 * É a outra metade de `corrigeDuracao`, e a resposta mais comum — o app fechou
 * na última série e quase sempre a última série É quando ele parou. Sem este
 * verbo, aceitar custaria entrar na tela da sessão e redigitar o mesmo número,
 * e o cartão do Agora ficaria para sempre perguntando o que ele já respondeu.
 *
 * `fim: 'manual'` é o MESMO carimbo que a correção escreve, e é de propósito:
 * o que o carimbo significa é "este tempo é declarado", não "este tempo foi
 * mudado". É ele que tira o "aproximado" da tela e que faz a pergunta sair do
 * cartão de cima, sem precisar de uma marca de "já respondi".
 */
async function confirmaDuracao(t) {
  const m = S.done.filter(function (x) { return x.t === t; })[0];
  if (!m || m.fim === 'manual') return;
  m.fim = 'manual';
  m.m = Date.now();                    // carimbo: é ele que a fusão compara
  await save(); render();
  toast('Tempo confirmado.');
}

// ---------- corrigir no lugar, na sessão passada (a D, `dias.html`, estados 3, 4 e 14) ----------
//
// Cada série é um botão. Ao tocar, abre ali mesmo a régua de repetições da
// academia, porque o dado é o mesmo; a carga abre o teclado do app, com vírgula
// (F63); o RIR, a escala. CADA TOQUE GRAVA, e a linha diz o que foi gravado.
// Se a gravação falha, o número guardado fica como estava e o toque fica à
// parte, dito como tocado — a tela não finge que gravou (estado 14).
//
// O registro é achado pela CHAVE da sincronia, não pela posição na lista: a
// lista do exercício pode ganhar uma entrada vinda do outro aparelho entre o
// toque que abriu e o que grava.

/** O registro de um exercício numa sessão, pela chave `log:<id>:<sid>:<sl>`. */
function registroPorChave(idEx, chave) {
  return (S.logs[idEx] || []).filter(function (l) { return chaveDeLog(idEx, l) === chave; })[0] || null;
}

function serieDaPassada() {
  const p = view.passada;
  if (!p) return null;
  const e = registroPorChave(p.idEx, p.chave);
  return e ? { p: p, e: e, s: e.sets[p.k] || null } : null;
}

/** Abre (ou fecha) a série `k` do exercício `idEx` na sessão passada. */
function abreSerieDaPassada(idEx, chave, k) {
  const p = view.passada;
  if (p && p.idEx === idEx && p.chave === chave && p.k === k) { view.passada = null; render(); return; }
  const e = chave ? registroPorChave(idEx, chave) : null;
  view.teclado = null;
  if (e && e.sets[k] && !e.u) {
    view.passada = { idEx: idEx, chave: chave, k: k, foco: null, era: e.sets[k].slice(),
                     gravado: null, tocado: null, rir: false, teclado: null };
    render();
    return;
  }
  // "não feito": se ele fez e não registrou, a série entra aqui (estado 3)
  const m = view.sessao;
  if (!m || m.livre || (e && e.u) || (!e && unidadeDoPrescrito(m, idEx))) return;
  const ref = referenciaDaSerie(idEx, e, k, m);
  view.passada = { idEx: idEx, chave: chave, k: k, foco: null, era: null, novo: true,
                   carga: ref ? ref[0] : 0, ref: ref, gravado: null, tocado: null, rir: false, teclado: null };
  render();
}

/** A unidade própria do exercício prescrito (segundos, metros…), que a régua de repetições não atende. */
function unidadeDoPrescrito(m, idEx) {
  const P = m.day ? treino(m.day) : null;
  const ex = P ? P.ex.filter(function (x) { return x.id === idEx; })[0] : null;
  return !!(ex && ex.u);
}

/**
 * A referência de uma série que não foi registrada: a série anterior do mesmo
 * registro, ou a mesma posição na última vez ANTES desta sessão. Sem nenhuma,
 * `null` — e a régua abre na base da faixa, sem marca de "última".
 */
function referenciaDaSerie(idEx, e, k, m) {
  if (e) for (let j = k - 1; j >= 0; j--) if (e.sets[j]) return e.sets[j];
  const antes = (S.logs[idEx] || []).filter(function (l) { return l.t < m.t && l.sid !== m.sid; });
  for (let j = antes.length - 1; j >= 0; j--) {
    const sets = antes[j].sets || [];
    if (sets[k]) return sets[k];
    for (let q = sets.length - 1; q >= 0; q--) if (sets[q]) return sets[q];
  }
  return null;
}

/**
 * Lança a série que faltou, com `reps` repetições e a carga proposta.
 *
 * Sem registro do exercício nesta sessão, nasce um — no instante da sessão, e
 * ENTRE os outros pela ordem do tempo: a lista é lida pela posição (o fim é a
 * "última vez" que a próxima sessão usa), e uma entrada antiga no fim viraria a
 * referência de amanhã.
 */
async function lancaSerieDaPassada(reps) {
  const p = view.passada, m = view.sessao;
  if (!p || !p.novo || !m) return;
  let e = p.chave ? registroPorChave(p.idEx, p.chave) : null;
  const nasceu = !e;
  if (nasceu) {
    e = { t: m.t, sid: m.sid, sets: [] };
    if (m.dl) e.dl = 1;
    const lista = S.logs[p.idEx] = (S.logs[p.idEx] || []).slice();
    let i = lista.length;
    while (i > 0 && lista[i - 1].t > e.t) i--;
    lista.splice(i, 0, e);
  }
  const antes = e.sets.slice(), mAntes = e.m;
  while (e.sets.length < p.k) e.sets.push(null);
  e.sets[p.k] = [p.carga != null ? p.carga : 0, reps];
  e.m = Date.now();
  const ok = await save();
  if (ok === false) {
    if (nasceu) {
      S.logs[p.idEx] = S.logs[p.idEx].filter(function (l) { return l !== e; });
      if (!S.logs[p.idEx].length) delete S.logs[p.idEx];
    } else { e.sets = antes; if (mAntes == null) delete e.m; else e.m = mAntes; }
    p.tocado = { k: 'reps', v: reps };
    render();
    return;
  }
  view.passada = { idEx: p.idEx, chave: chaveDeLog(p.idEx, e), k: p.k, foco: null, era: e.sets[p.k].slice(),
                   gravado: 'Lançada às ' + fmtHoraDita(Date.now()) + ': ' + textoDaSerieDaPassada(p.idEx, e.sets[p.k]) +
                     '. Entra no volume e no histórico deste dia.',
                   tocado: null, rir: false, teclado: null };
  render();
}

/**
 * Escreve na série aberta e grava. `muda` recebe a série (`[carga, reps, rir?]`)
 * e a altera no lugar; `tocado` é o que a tela mostra se a gravação falhar.
 */
async function gravaNaPassada(muda, tocado) {
  const x = serieDaPassada();
  if (!x) return;
  const antes = x.s.slice(), mAntes = x.e.m;
  muda(x.s);
  x.e.m = Date.now();                  // carimbo: é ele que a fusão compara
  const ok = await save();
  if (ok === false) {
    // a série volta ao que está no disco, e o toque fica dito como tocado
    x.e.sets[x.p.k] = antes;
    if (mAntes == null) delete x.e.m; else x.e.m = mAntes;
    view.passada.tocado = tocado;
    view.passada.gravado = null;
  } else {
    view.passada.tocado = null;
    view.passada.gravado = 'Gravado às ' + fmtHoraDita(Date.now()) + ': ' + textoDaSerieDaPassada(x.p.idEx, x.e.sets[x.p.k]) +
      '. Nada mais na sessão muda.';
  }
  render();
}

function textoDaSerieDaPassada(idEx, s) {
  if (!s) return 'não feita';
  return s[0] != null && s[0] !== '' ? fmtNum(s[0]).replace('.', ',') + ' × ' + s[1] : s[1] + ' repetições';
}

function repsDaPassada(v) {
  const n = Math.round(+v);
  if (!(n >= 0) || n > 200) return;
  if (view.passada && view.passada.novo) return lancaSerieDaPassada(n);
  return gravaNaPassada(function (s) { s[1] = n; }, { k: 'reps', v: n });
}
function andaReguaDaPassada(dir) {
  const pn = view.passada;
  if (pn && pn.novo) {
    const P = view.sessao && view.sessao.day ? treino(view.sessao.day) : null;
    const ex = P ? P.ex.filter(function (x) { return x.id === pn.idEx || x.orig === pn.idEx; })[0] : null;
    const fx = faixaDoTexto(ex ? ex.r : null);
    const base = pn.ref ? pn.ref[1] : (fx ? fx[0] : 10);
    view.passada.foco = anda(regua(base, fx), pn.foco != null ? pn.foco : base, dir);
    render();
    return;
  }
  const x = serieDaPassada();
  if (!x) return;
  const fx = faixaDoTexto((exDoRegistro(x.p.idEx, x.e) || {}).r);
  const reg = regua(x.p.era[1], fx);
  view.passada.foco = anda(reg, view.passada.foco != null ? view.passada.foco : x.s[1], dir);
  render();
}
function rirDaPassada(v) {
  if (v === 'abre') { view.passada.rir = !view.passada.rir; view.teclado = null; render(); return; }
  view.passada.rir = false;
  return gravaNaPassada(function (s) {
    if (v == null || s[2] === v) s.length = 2; else s[2] = Math.max(0, Math.min(5, v));
  }, { k: 'rir', v: v });
}

/** O teclado da carga, na sessão passada: escreve no visor, grava quando o número fecha. */
function abreCargaDaPassada() {
  const p = view.passada;
  if (p && p.novo) {
    const a0 = view.teclado && view.teclado.alvo;
    if (a0 && a0.tipo === 'passada') { view.teclado = null; render(); return; }
    view.teclado = { alvo: { tipo: 'passada', pos: 0 }, texto: p.carga != null ? String(p.carga).replace('.', ',') : '' };
    render();
    return;
  }
  const x = serieDaPassada();
  if (!x) return;
  const a = view.teclado && view.teclado.alvo;
  if (a && a.tipo === 'passada') { view.teclado = null; render(); return; }
  view.passada.rir = false;
  view.teclado = { alvo: { tipo: 'passada', pos: 0 }, texto: x.s[0] != null ? String(x.s[0]).replace('.', ',') : '' };
  render();
}
function cargaDaPassada(texto) {
  const n = numeroDoCampo(texto);
  if (n == null || n < 0) return;
  // a série ainda não existe: a carga fica proposta, e grava junto com a repetição
  if (view.passada && view.passada.novo) { view.passada.carga = n; render(); return; }
  return gravaNaPassada(function (s) { s[0] = n; }, { k: 'carga', v: n });
}

/**
 * Apagar uma série passa pelo painel, como todo apagar (decisão 8). A série
 * vira "não feita" na posição dela — as outras não mudam de número. A última
 * série do exercício leva o registro inteiro, com lápide.
 */
async function apagaSerieDaPassada() {
  const x = serieDaPassada();
  if (!x) return;
  const restam = x.e.sets.filter(Boolean).length - 1;
  const texto = textoDaSerieDaPassada(x.p.idEx, x.s);
  const quando = fmtDate(x.e.t);
  const nome = nomeEx(x.p.idEx);
  if (!(await pare({
    texto: 'Apagar a série ' + (x.p.k + 1) + ' de ' + nome + ' de ' + quando + ' tira ' + texto + ' do histórico. ' +
      (restam ? (restam === 1 ? 'A outra série fica.' : 'As outras ' + restam + ' séries ficam.')
              : 'Era a única: o exercício sai desta sessão.') + ' Isso não tem volta.',
    sim: 'Apagar a série ' + (x.p.k + 1) }))) return;
  if (!restam) {
    lapide(chaveDeLog(x.p.idEx, x.e));
    S.logs[x.p.idEx] = S.logs[x.p.idEx].filter(function (l) { return l !== x.e; });
    if (!S.logs[x.p.idEx].length) delete S.logs[x.p.idEx];
  } else {
    x.e.sets[x.p.k] = null;
    x.e.m = Date.now();
  }
  view.passada = null; view.teclado = null;
  await save(); render();
  toast('Série apagada.');
}

/** O exercício da prescrição daquele registro, para a faixa e o RIR prescritos. */
function exDoRegistro(idEx, e) {
  const m = S.done.filter(function (x) { return x.sid === e.sid; })[0];
  const P = m && m.day ? treino(m.day) : null;
  return P ? P.ex.filter(function (ex) { return ex.id === idEx || ex.id === e.sl || ex.orig === idEx; })[0] || null : null;
}

/** O editor da série que não foi feita: carga proposta, régua sem valor, e nada a apagar. */
function editorDoNovo(idEx, ex) {
  const pa = view.passada;
  const fx = faixaDoTexto(ex ? ex.r : null);
  const base = pa.ref ? pa.ref[1] : (fx ? fx[0] : 10);
  const un = CARGAS[cargaTipo(idEx, ex || exDe(idEx))].rot;
  const tc = view.teclado && view.teclado.alvo.tipo === 'passada' ? view.teclado : null;
  return {
    novo: true,
    titulo: 'Série ' + (pa.k + 1),
    guardada: 'não registrada · ' + (pa.ref ? 'a carga vem da série de referência' : 'sem referência'),
    carga: fmtNum(pa.carga != null ? pa.carga : 0).replace('.', ','),
    un: un,
    faixa: fx ? 'repetições · faixa ' + ex.r + ' · um toque lança' : 'repetições · um toque lança',
    regua: { slots: pagina(regua(base, fx), pa.foco != null ? pa.foco : base), valor: null,
             marca: pa.ref ? 'última' : null, tocado: pa.tocado && pa.tocado.k === 'reps' ? pa.tocado.v : null },
    gravado: null,
    falhou: pa.tocado ? 'Não foi gravado: o aparelho recusou. A série continua não feita.' : null,
    rir: null,
    teclado: tc ? { texto: tc.texto, unidade: un } : null
  };
}

function abreCorrecaoDoTempo(t) { view.corrigeTempo = view.corrigeTempo === t ? null : t; render(); }

function abrirSessao(t){ view.sessao = S.done.filter(function (x) { return x.t === t; })[0]; if (view.sessao) { entraNoDestino('sessao'); render(); } }
function fecharSessao(){ view.sessao = null; view.passada = null; view.corrigeTempo = null; if (view.teclado && view.teclado.alvo.tipo === 'passada') view.teclado = null; render(); saiDoDestino('sessao'); }

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
        // A grandeza sai do REGISTRO. Ler do catálogo aqui faria o bloco
        // inteiro mudar de leitura no dia em que o exercício mudasse de medida.
        const un = (H[0] && H[0].u) || unidadeDe(ex) || null;
        const seg = !!un;
        const ritmo = cronometrado(un) && H.some(function (e) { return ritmoDe(e) != null; });
        const met = ritmo ? function (e) { const r = ritmoDe(e); return r == null ? 0 : r; }
                  : seg ? tutOf : volOf;
        H.forEach(function (e) {
          if (!seg) volTotal += volOf(e);
          (e.dor||[]).forEach(function (x) { dores[x] = (dores[x]||0) + 1; });
        });
        if (H.length < 2) return;
        const a = H[0], b = H[H.length-1];
        const ci = ritmo ? met(a) : seg ? tutOf(a) : maxLoad(a);
        const cf = ritmo ? met(b) : seg ? tutOf(b) : maxLoad(b);
        const dv = met(a) > 0 ? Math.round((met(b)-met(a))/met(a)*100) : null;
        // "Evoluiu" é na direção da unidade. Antes era sempre `cf > ci`, e por
        // isso o remo que ficou mais lento entrava na lista dos que evoluíram.
        const melhorou = ritmo ? (ci > 0 && cf > 0 && cf < ci) : cf > ci;
        const item = { nome:nome, n:H.length, ci:ci, cf:cf, dv:dv, seg:seg, ritmo:ritmo, un:un,
                       dc: ci > 0 ? Math.round((cf-ci)/ci*100) : null };
        if (melhorou) evol.push(item);
        else if (cf === ci && H.length >= 3) parados.push(item);
      });
    });
  });

  sessoes = S.done.filter(function (x) { return x.t >= de; }).length;
  const semanas = Math.max(1, (ate - de) / (7*86400000));
  // Ordena por GANHO, não pelo sinal cru: em ritmo o número que melhora é o
  // que desce, e ordenar por `dc` jogaria justamente quem mais evoluiu para o
  // fim da lista.
  const ganho = function (x) { return (x.ritmo ? -1 : 1) * (x.dc || 0); };
  evol.sort(function (a,b) { return ganho(b) - ganho(a); });

  return { de:de, ate:ate, sessoes:sessoes, semanas:semanas, volTotal:volTotal,
           evol:evol, parados:parados, dores:dores,
           deloads: S.done.filter(function (x) { return x.dl && x.t >= de; }).length };
}

function abrirRetro(){ view.retro = true; view.sessao = null; entraNoDestino('retro'); render(); }
function fecharRetro(){ view.retro = false; render(); saiDoDestino('retro'); }

async function wipe() {
  // "e vale para os outros aparelhos" é a frase que `apagaRegistroDeTreino` já
  // usava, e agora ela é verdade aqui também: o gesto deixa lápide, e lápide
  // viaja. Antes a promessa era menor do que a verdade — o apagamento era
  // desfeito pela fusão —, e dizer o alcance é o que falta para o dono decidir
  // com o que ele tem na mão.
  // PARE (§3.3), com o número de cada coisa que sai — e o que FICA, porque
  // "todo o histórico" lido de relance soa como o app inteiro.
  const fotosDoCorpo = ((S.protocolo && S.protocolo.sessoes) || []).reduce(function (a, x) {
    return a + Object.keys((x && x.fotos) || {}).length;
  }, 0);
  const medidas = MARCAS_DO_CORPO.reduce(function (a, k) { return a + ((S.body && S.body[k]) || []).length; }, 0);
  const sai = [
    [S.done.length, 'sessão', 'sessões'],
    [(S.comidaHist || []).length, 'dia de comida', 'dias de comida'],
    [medidas, 'medida do corpo', 'medidas do corpo'],
    [S.cardio.length, 'cardio', 'cardios'],
    [fotosDoCorpo, 'foto do corpo', 'fotos do corpo']
  ].filter(function (x) { return x[0] > 0; }).map(function (x) { return x[0] + ' ' + (x[0] === 1 ? x[1] : x[2]); });
  const lista = sai.length > 1 ? sai.slice(0, -1).join(', ') + ' e ' + sai[sai.length - 1] : (sai[0] || 'nada registrado ainda');
  if (!(await pare({ texto: 'Apagar todo o histórico tira ' + lista + ' deste aparelho. O programa, o plano alimentar e as fotos de equipamento ficam. Isso não tem volta, e vale para os outros aparelhos.',
                     sim: 'Apagar todo o histórico' }))) return;
  const antes = S;
  const agora = Date.now();
  // apagar o histórico não apaga o programa: os exercícios que ele cadastrou
  // e as mudanças que promoveu ao oficial sobrevivem
  S = { logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[],
        body:corpoVazio(), carga:{}, export:0,
        plano:PLANO_ATUAL, prog:S.prog, rot:S.rot, ex:S.ex, mods:null, progLog:S.progLog || [],
        // A metade de comida também sobrevive: apagar histórico de TREINO não
        // é apagar o plano nutricional, do mesmo jeito que não apaga o programa.
        cadencia:S.cadencia, comida:S.comida, dia:null, ajuste:S.ajuste, ajusteHist:S.ajusteHist, gordura:S.gordura, quadro:S.quadro,
        perfManual:S.perfManual, compras:S.compras,
        // BIBLIOTECA e CATÁLOGO, pela mesma razão de `S.ex` acima — decisão do
        // dono, 08/10. `aulas` são os modelos de aula que ELE salvou, e `fotos`
        // são as fotos dos aparelhos, uma por exercício, para reconhecer a
        // máquina na academia: atributo do catálogo, não registro de treino.
        aulas:S.aulas, fotos:S.fotos,
        // `protocolo` é PARTIDO: `poses` é a ordem das poses do protocolo —
        // prescrição, e fica —, e `sessoes` são as sessões de foto de corpo —
        // registro, e vão.
        //
        // Só `poses` é nomeada aqui de propósito: `normalizaEstado` logo abaixo
        // é o único lugar que sabe o padrão de cada campo (`sessoes` vira `[]`,
        // `poses` inválida vira `null`), e reconstruir a forma à mão já deixou a
        // nutrição sem catálogo uma vez.
        protocolo:{ poses: S.protocolo && S.protocolo.poses } };
  // Passa pela mesma normalização do boot: é o único lugar que sabe o padrão de
  // cada campo, e reconstruir o estado à mão aqui já deixou a nutrição sem
  // catálogo uma vez.
  normalizaEstado();
  montaCatalogo();

  // A LÁPIDE de cada registro que acabou de sair — a outra porta da mesma
  // ressurreição que a linha de baixo blinda.
  //
  // Preservar as lápides velhas não bastaria: elas falam dos registros apagados
  // ANTES, e este gesto esvaziou as coleções em bloco, sem passar por `lapide()`
  // em nenhum registro. Sem lápide nova, a fusão lê o que sobrou no outro
  // aparelho como registro que este simplesmente não tem, e o traz de volta —
  // contra um aviso que acabou de prometer que não tem volta.
  //
  // As velhas entram junto, por `uneLapides`: lápide de um registro que ESTE
  // gesto não apagou continua sendo a única coisa que impede o outro aparelho
  // de ressuscitá-lo, e jogá-la fora aqui era um apagamento desfeito de graça.
  // Vem de lá, de quebra, a poda dos 90 dias.
  S.apagados = uneLapides(antes.apagados || {}, lapidesDoApagamento(antes, S, agora), agora);

  try { await DB.delete(KEY); } catch(e){}
  // A velha vai junto. Deixá-la seria a migração do boot ressuscitar amanhã
  // exatamente o histórico que ele acabou de mandar apagar.
  try { await DB.delete(KEY_LEGADO); } catch(e){}
  // E GRAVA — `save`, não `grava`.
  //
  // Apagar e não escrever deixava o apagamento só na memória: fechar o app
  // antes do próximo toque perdia as lápides E a prescrição preservada, porque
  // a chave tinha acabado de ser removida. O carimbo importa pelo mesmo motivo
  // que nas outras escritas: é ele que decide de que lado vêm os DOCUMENTOS, e
  // sem ele os que este gesto zerou (o dia de comida aberto, o rascunho)
  // voltariam do outro aparelho. E `save` marca a sujeira: apagamento que não
  // marca sujeira só sobe quando um toque sem relação com ele resolve subir.
  //
  // A ordem é deliberada: a remoção vem primeiro, e por isso uma escrita que
  // falhe não pode deixar o histórico velho de pé na chave.
  await save();

  // Os BYTES das fotos de corpo que acabaram de perder a referência.
  //
  // `reconciliaCorpo` não alcança a poda depois deste gesto: ela termina em
  // `if (recentes.length === sessoes.length) return;`, e com as sessões
  // apagadas as duas contagens são ZERO — a igualdade é verdadeira e
  // `CORPO.poda` nunca roda. Sem isto, o cache fica com todas as fotos de
  // corpo para sempre, sem nada no estado que as referencie: o único índice
  // delas era `S.protocolo.sessoes`, e ele acabou de sair.
  //
  // `[]` é a lista do que fica, e depois deste gesto o que fica é nada. Não é
  // política nova: é a mesma porta que a reconciliação usa, com a lista que o
  // resultado do apagamento dita. O que a lápide deixa voltar do outro
  // aparelho volta do BUCKET, por `garanteBytes` — a poda já é o caminho
  // normal das sessões antigas, e tem volta por lá.
  //
  // Depois do `save()`, e em `try`: uma falha de cache não pode impedir a
  // escrita do estado apagado, que é a parte sem volta. E as fotos de APARELHO
  // (`S.fotos`) não entram aqui — elas sobrevivem ao gesto, então os bytes
  // delas continuam referenciados.
  //
  // O BUCKET das fotos de corpo NÃO é podado, e isto é limite conhecido, não
  // esquecimento: `NUVEM.apagaCorpo` não tem um único chamador em `src/` — nem
  // `CTX.apagaFotoDoCorpo`, que apaga UMA, o chama —, e decidir o que fazer
  // quando uma das N chamadas de rede falha no meio de um gesto que hoje não
  // faz rede nenhuma é política que ninguém escreveu. Ver `09-superficie.md`.
  try { await CORPO.poda([]); } catch (e) {}

  view.day='A'; view.aba='agora'; view.open=null; view.hist=null; view.json=null; view.paste=false;
  view.swapOpen=null;
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


// ---------- o descanso sobrevive a fechar o app ----------
// Chave PRÓPRIA, fora de `S`: um descanso é do APARELHO e do momento, não do
// histórico. Em `S` ele iria junto na sincronização, e o outro aparelho herdaria
// um cronômetro correndo que ninguém ligou lá.
//
// O que se grava é o instante-alvo, que é como o cronômetro já era escrito para
// sobreviver à tela apagada. Sobreviver ao reload passa a ser o mesmo número
// lido de outro lugar.
const KEY_DESCANSO = 'lastro-descanso-v1';

/**
 * Publica a altura do cronômetro para quem se empilha acima dele.
 *
 * Medida em vez de constante porque ela muda: com a linha de procedência o
 * cronômetro tem uma altura, sem ela tem outra, e o toast precisa da de agora.
 * Chamada quando ele entra e quando sai — não a cada quadro, que é o ritmo em
 * que ele repinta.
 */
function alturaDoTimer() {
  const box = document.getElementById('timer');
  const h = box && box.classList.contains('on') ? box.offsetHeight : 0;
  try { document.documentElement.style.setProperty('--ins-timer-h', h + 'px'); } catch (e) {}
}

function gravaDescanso() {
  try {
    DB.set(KEY_DESCANSO, JSON.stringify({ fim: timerFim, total: timerTotal, ctx: timerCtx }));
  } catch (e) {}
}
function apagaDescanso() {
  try { DB.delete(KEY_DESCANSO); } catch (e) {}
}

/**
 * Religa o descanso que estava correndo quando o app fechou.
 *
 * Não é `startTimer`: aquele nasce dentro do gesto do usuário e por isso pode
 * preparar o áudio e pedir o wake lock. Aqui não houve gesto nenhum — o app
 * apenas abriu —, então o cronômetro volta mudo. Se zerar com a tela à vista,
 * `pintaTimer` avisa pelo caminho de sempre.
 */
async function retomaDescanso() {
  let g = null;
  try {
    const r = await DB.get(KEY_DESCANSO);
    g = r && r.value ? JSON.parse(r.value) : null;
  } catch (e) { g = null; }
  if (!g || !g.fim || Date.now() >= g.fim) { apagaDescanso(); return; }

  timerTotal = g.total || Math.ceil((g.fim - Date.now()) / 1000);
  timerFim = g.fim;
  timerAvisado = false;
  timerCtx = g.ctx || '';
  const box = document.getElementById('timer');
  if (box) box.classList.add('on');
  pintaTimer();
  alturaDoTimer();
  if (timer) clearInterval(timer);
  timer = setInterval(pintaTimer, 250);
}

/**
 * @param {number} sec
 * @param {string} [ctx] de onde veio este descanso — "série 2 · pulldown".
 *   Sem isto o número flutua sem referência depois de rolar a tela ou reabrir
 *   o app, e o cronômetro passa a ser um relógio sem assunto.
 */
function startTimer(sec, ctx) {
  stopTimer();
  timerTotal = sec;
  timerFim = Date.now() + sec*1000;
  timerAvisado = false;
  timerCtx = ctx || '';
  document.getElementById('timer').classList.add('on');
  preparaAudio();          // precisa nascer dentro do gesto do usuário
  segurarTela();
  pintaTimer();
  alturaDoTimer();
  timer = setInterval(pintaTimer, 250);
  gravaDescanso();
}

/**
 * Tira ou põe tempo no descanso em curso.
 *
 * A academia real cobra os dois: a máquina está ocupada e o descanso precisa
 * esticar, ou a série saiu leve e não vale esperar os três minutos. Sem isto a
 * única saída era parar o cronômetro e perder a conta.
 *
 * Mexe no INSTANTE-ALVO, que é como o cronômetro é escrito — nunca num contador
 * que decrementa, senão a tela apagada comeria o ajuste junto.
 */
function ajustaTimer(delta) {
  if (!timerFim) return;
  const agora = Date.now();
  // Somar a partir de `agora` quando já zerou: o alvo ficou no passado, e
  // esticar a partir dele daria um descanso que nasce vencido.
  const base = Math.max(agora, timerFim);
  const novo = Math.max(agora, base + delta * 1000);
  if (novo <= agora && delta < 0) { stopTimer(); return; }
  timerFim = novo;
  // A barra é `restante / total`: sem subir o total junto, esticar o descanso
  // daria uma escala acima de 1 e a barra vazaria da calha.
  timerTotal = Math.max(timerTotal, Math.ceil((timerFim - agora) / 1000));
  timerAvisado = false;
  const val = document.getElementById('tval');
  if (val) val.classList.remove('zero');
  if (!timer) timer = setInterval(pintaTimer, 250);
  pintaTimer();
  gravaDescanso();
}

function pintaTimer() {
  const val = document.getElementById('tval');
  const fill = document.getElementById('tfill');
  if (!val || !fill || !timerFim) return;
  const ctx = document.getElementById('tctx');
  if (ctx && ctx.textContent !== timerCtx) ctx.textContent = timerCtx;

  const restante = Math.max(0, timerFim - Date.now());
  fill.style.transform = 'scaleX(' + (restante / (timerTotal * 1000)) + ')';

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
  // parar redesenha: o que só existe enquanto o descanso conta ("enquanto
  // descansa", no cartão aberto) sai junto com ele
  if (b) b.addEventListener('click', function () { stopTimer(); render(); });
  const menos = document.getElementById('tmenos');
  if (menos) menos.addEventListener('click', function () {
    const contava = !!timerFim;
    ajustaTimer(-15);
    if (contava && !timerFim) render();
  });
  const mais = document.getElementById('tmais');
  if (mais) mais.addEventListener('click', function () { ajustaTimer(15); });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ligaBotaoDoTimer);
} else {
  ligaBotaoDoTimer();
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  timerFim = 0; timerAvisado = false;
  timerCtx = '';
  const ctx = document.getElementById('tctx');
  if (ctx) ctx.textContent = '';
  apagaDescanso();
  try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
  const box = document.getElementById('timer');
  if (box) box.classList.remove('on');
  alturaDoTimer();
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

// Sair do app não pode levar embora a última série.
//
// `queueSave()` represa a gravação por 700 ms para não escrever a cada tecla. A
// janela é curta, mas o que cabe nela é exatamente o que o produto existe para
// não perder: fechar o app, trocar de aplicativo ou bloquear a tela dentro
// desses 700 ms perdia a série recém-digitada.
//
// `pagehide` é o evento que o iOS realmente entrega quando o PWA sai de cena —
// `beforeunload` não é confiável lá. `visibilitychange` cobre o ir para segundo
// plano, que é o caminho mais comum de todos.
function descarregaAoSair() { liberaSave(); }
window.addEventListener('pagehide', descarregaAoSair);

// Voltar do bloqueio de tela: o iOS solta o wake lock e congela os intervalos.
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { descarregaAoSair(); return; }
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

// ---------- travar em retrato, onde a plataforma deixa ----------
// `screen.orientation.lock` é a ÚNICA trava de verdade que existe na web. O
// Chrome a implementa; o Safari expõe `screen.orientation` só para leitura e
// não tem `lock`, então no iPhone isto não faz nada — lá quem age é a media
// query de `#deitado`, no base.css.
//
// Fica assim mesmo: custa nada, acerta onde dá, e passa a valer sozinho no dia
// em que a Apple implementar. Só em aparelho de toque, para não mexer com a
// janela de um computador.
(function travaEmRetrato() {
  try {
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;
    const o = window.screen && window.screen.orientation;
    if (!o || typeof o.lock !== 'function') return;
    const p = o.lock('portrait');
    if (p && p.catch) p.catch(function () {});   // recusa é o caso normal, não erro
  } catch (e) {}
})();

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
// ---------- desligamento ----------
// O app não tinha fim. Tinha boot, e depois trabalhava até a página morrer — e
// quando a página morria primeiro, o trabalho em voo acordava sem documento.
//
// A rotina que busca os bytes da foto de corpo espera o IndexedDB e espera a
// rede; nesse intervalo a página pode já ter ido, e ela volta para pintar de
// qualquer jeito. Era essa a origem das quatro rejeições não tratadas da suíte
// de fluxo: `createElementNS` e `addEventListener` sobre um `document` que
// deixou de existir.
//
/**
 * Encerra o app de propósito, em ordem: primeiro ninguém mais renderiza, depois
 * os relógios param, por último a árvore sai.
 *
 * A ordem importa. Desmontar antes de travar o render deixaria uma janela em que
 * uma continuação remontaria a árvore inteira — e o desligamento teria
 * desligado nada.
 *
 * Quem chama hoje é o harness dos testes de fluxo, antes de fechar a janela do
 * jsdom. Mas o verbo é do app, não do teste: a disciplina que falta aqui é a
 * mesma que vai faltar em qualquer tela que espere algo e volte para pintar.
 */
CTX.desliga = function () {
  if (desligado) return;
  desligado = true;
  stopTimer();
  if (relogioT) { clearInterval(relogioT); relogioT = null; }
  if (batida) { clearInterval(batida); batida = null; }
  desmontaDoApp();
};

// ===========================================================================
// A SUPERFÍCIE — os verbos do modelo, com nome, contrato e porta própria.
// ===========================================================================
//
// A interface inteira do app vai ser reescrita. A suíte de fluxo é a rede de
// segurança dessa reescrita, e ela entra no app por `window.__escopo` logo
// abaixo: uma `eval` dentro deste escopo. Isso funciona e é frágil por três
// razões que não se consertam com cuidado:
//
// 1. **O alcance não é este arquivo — é o bundle inteiro.** Depois do rollup
//    todos os módulos de `src/` ficam num escopo de topo só, e a `eval` vê
//    todos. `a.E('migraCache()')` chama `src/infra/fotos.js` sem pedir licença.
//    Nenhuma dessas 341 funções prometeu nada a ninguém.
// 2. **Nada é alcançado por referência, então nada é verificável.** Um nome
//    errado só aparece como `ReferenceError` na hora, e renomear uma função
//    interna quebra testes sem um único aviso do compilador ou do bundler.
// 3. **`treeshake: true` apaga o que só a string alcança.** Já aconteceu aqui:
//    a função sumiu do build e a medição saiu invertida, com os dois builds
//    saindo com hash idêntico. Esta superfície existe por REFERÊNCIA — as
//    chaves abaixo são o próprio nome da função, e é isso que a mantém viva.
//
// O CONTRATO, que é o que a torna reusável depois da reescrita:
//
// - **Nenhuma chave recebe elemento do DOM, nem devolve um.** Todo argumento é
//   valor: número, texto, booleano ou dado puro. Quem lê campo é casca da
//   interface, e casca não entra aqui. Duas exceções declaradas: `tiraFoto` e
//   `tiraFotoDoCorpo` recebem um pato `{ files, value }` — era convenção dos
//   testes, e está escrito aqui para virar contrato.
// - **Chamar um verbo daqui faz o que o dedo faz.** A interface não tem rota
//   paralela: ela lê o campo e chama o mesmo verbo.
// - **`verbos` é verbo, `dado` é leitura.** `dado` é tudo getter, porque `S`,
//   `view` e `CAT` são RELIGADOS em tempo de execução (importar um backup troca
//   `S` inteiro) — uma cópia por valor aqui apontaria para o estado de antes.
// - **Acrescentar chave é livre; tirar e renomear, não.** Quem depende disto é
//   uma suíte que a reescrita não pode reescrever.
// - **A superfície não escreve no estado.** Semear `S` no meio de um teste
//   continua sendo `__escopo`, e de propósito: isso é cirurgia de fixture, não
//   verbo, e dar-lhe nome estável seria prometer o formato interno do estado.
const SUPERFICIE = {
  // Sobe quando uma chave muda de significado ou sai. Acrescentar não mexe.
  contrato: 1,

  // As chaves da ponte com a shell do Instrumento, alcançáveis sem `eval`.
  ctx: CTX,
  nuvem: NUVEM,

  verbos: {
    // ---- por valor, onde antes só havia elemento ou campo na tela ----
    anotaSerie, anotaSerieRapida, anotaObservacao, anotaNomeDoLancamento, horaDoLancamento,
    mascaraDeHora, soNumero, criarExercicioCom, guardaEdicaoCom, textoDaPrescricao,
    setBuscaDeExercicio,

    // ---- os verbos do módulo que a suíte aciona pelo nome nu ----
    abreFoto, abrirAddEx, abrirAdicionar, abrirCardioRapido, abrirCarga, abrirMedida,
    abrirNota, abrirNovoEx, abrirPrograma, abrirRapido, abrirSessao, addBody, addCardio,
    addExercicio, ajustaTimer, altList, altOf, alternaDescanso, apagaFoto,
    apagarModeloDeAula, apagarSessao, aplicaAoOficial, aplicarModeloDeAula, arrozAtual,
    cardioSemana, cardioSet, cargaTipo, catalogoAlimentos, catalogoDeAdicao,
    concluirRetro, criarExercicio, lancaTreino, abreHoraDoLancamento, criarTreino, delBody, descOf, desfazMod, diaAberto,
    diaDeComida, diasSemBackup, difDoDia, difTotal, draftPeek, duracaoAtual, editarSessao, ehDescanso,
    encerraSePreciso, estadoEx, exDe, fechaSessao, fecharPrograma, finalizarSessao,
    garanteBytesDoCorpo, go, grupoDoLancamento, duracaoDoLancamento, detalhaLancamento, historico, hojeISO, id, impactoDoMod,
    impactoOficial, impactoSeries, importText, importaAulaColada, iniciarSessao, logKey,
    modoEdicao, modoPrograma, modsDoDia, montaCatalogo, moverDia, moverEx,
    moverProg, mudaMes, mudaSeries, nextDay, nomeEx, openHist, ordemDePoses, pausarSessao,
    payload, pendencias, pintaTimer, planoDeComida, poeMedida, progDesc, progRemove,
    progSeries, progSetTroca, programaDia, pularEx, reconciliaCorpo, reconciliaFotos,
    removerEx, render, repetirUltimaAula, restaurarDia, restaurarTudo, retomarSessao,
    retro, rot, salvarAulaComoModelo, salvarEdicao, save, seriesDe, seriesFeitasHoje,
    seriesPorMusculo, sessoesDeTrabalho, setAlt, setCarga, setDeload, setsFor, showJSON,
    sincroniza, soltarTela, startTimer, stopTimer, temHora, tickRelogio, tiraFoto,
    textoMod, tiraFotoDoCorpo, toggle, toggleDor, toggleSwap, treino, trocaDoDia, unidadeDe,
    veredito, vmExercicio, wipe,

    // ---- regra pura de `src/dominio/`, que o app já importa ----
    // Entram pela superfície em vez de o teste de fluxo importar o fonte: o que
    // esta suíte cobra é o BUILD, e importar o módulo ao lado o contornaria.
    fmtDesc, funde, migraPlano, migraPlano3, periodoDe, proximoTreino, sameDay, slugEx, weekStart,

    // ---- o cache de fotos, que mora em src/infra/fotos.js ----
    migraCache: FOTO.migraCache
  },

  dado: {
    get S() { return S; },
    get view() { return view; },
    get CAT() { return CAT; },
    get CARGAS() { return CARGAS; },
    get ALVO() { return ALVO; },
    get ALVO_TOTAL() { return ALVO_TOTAL; },
    get ALT() { return ALT; },
    get EX_BASE() { return EX_BASE; },
    get FREQUENTES_NO_BOX() { return FREQUENTES_NO_BOX; },
    get MOVIMENTOS_DE_BOX() { return MOVIMENTOS_DE_BOX; },
    get PROGRAMA() { return PROGRAMA; },
    get ROT_BASE() { return ROT_BASE; },
    get PLANO_ATUAL() { return PLANO_ATUAL; },
    get PLANO_BASE() { return PLANO_BASE; },
    get ALIMENTOS_BASE() { return ALIMENTOS_BASE; },
    get MARCAS_DO_CORPO() { return MARCAS_DO_CORPO; },
    // A tabela inteira, com nome, unidade e obrigatoriedade. `MARCAS_DO_CORPO`
    // só dá as chaves, e quem precisa saber que `bioAgua` é a única opcional
    // teria de transcrever a tabela — que é o defeito que ela existe para
    // evitar.
    get MEDIDAS_DO_CORPO() { return MEDIDAS_DO_CORPO; },
    // O relógio do descanso e a tela acesa: variáveis de módulo, e a única
    // forma de observá-las de fora era ler o nome nu pela `eval`.
    get timer() { return timer; },
    get timerFim() { return timerFim; },
    get timerCtx() { return timerCtx; },
    get audioCtx() { return audioCtx; },
    get querSegurar() { return querSegurar; },
    get relogioT() { return relogioT; },
    get sync() { return sync; },
    get scrollDoDestino() { return scrollDoDestino; }
  },

  /**
   * Chama um verbo pelo nome, com os argumentos atravessando o realm.
   *
   * O nome é `'toggle'`, `'ctx.hoje'` ou `'nuvem.sessao'`. Nome fora da
   * superfície estoura aqui, com o nome no erro — o contrário da `eval`, onde
   * um `ReferenceError` nu não diz de quem é a culpa.
   *
   * Os argumentos passam por `JSON` porque um objeto criado no realm do Node
   * tem outro `Object.prototype`, e o app o receberia como forasteiro. O
   * primitivo passa direto, inclusive `undefined` — que `JSON` apagaria, e há
   * verbo que distingue `undefined` de `null` (`poeMedida`, `guardaEdicaoCom`).
   */
  chama: function (nome, args) {
    const ponto = String(nome).indexOf('.');
    const dono = ponto < 0 ? SUPERFICIE.verbos : SUPERFICIE[String(nome).slice(0, ponto)];
    const chave = ponto < 0 ? String(nome) : String(nome).slice(ponto + 1);
    const f = dono && dono[chave];
    if (typeof f !== 'function') throw new Error('verbo fora da superfície: ' + nome);
    const vs = [];
    for (let i = 0; i < (args ? args.length : 0); i++) {
      const v = args[i];
      vs.push((v === null || typeof v !== 'object') ? v : JSON.parse(JSON.stringify(v)));
    }
    return f.apply(ponto < 0 ? null : dono, vs);
  },

  /**
   * O mesmo, devolvendo o resultado serializado.
   *
   * Embrulhado em `{ v: … }` de propósito: `JSON.stringify(undefined)` devolve
   * `undefined` em vez de texto, e o chamador perderia a diferença entre "o
   * verbo não devolveu nada" e "o verbo falhou".
   */
  chamaJSON: function (nome, args) {
    return JSON.stringify({ v: SUPERFICIE.chama(nome, args) });
  },

  /** Uma leitura de `dado`, serializada para atravessar o realm. */
  leJSON: function (chave) {
    return JSON.stringify({ v: SUPERFICIE.dado[chave] });
  }
};

// Publicada em `window` e não só em `CTX` porque o ponto é entrar SEM `eval` —
// e a atribuição em si é efeito colateral de topo, que é o que faz o rollup
// manter a tabela e, com ela, cada função que ela nomeia.
window.__modelo = SUPERFICIE;

// ---------------------------------------------------------------------------
// A porta velha, que a superfície ainda não substitui.
//
// `eval` direto neste escopo enxerga tudo o que está declarado aqui, e é o que
// os testes de fluxo usam para chegar em `S`, `view` e nas funções internas.
// Eles rodam sobre o BUILD, não sobre o fonte; sem isto o app teria de exportar
// o próprio miolo, e seria o teste desenhando a interface do módulo.
//
// A ponte de 91 handlers globais que morava aqui ao lado morreu junto com o
// último `onclick=` do fonte: todo evento hoje é função passada por prop.
//
// O que ainda só passa por aqui: escrever em `S` no meio de um teste, instalar
// dublê em `globalThis`, e ler nome que a superfície não nomeia. Cada caso de
// teste que deixa de usá-la é um pedaço de rede que sobrevive ao redesenho.
window.__escopo = function (codigo) { return eval(codigo); };

// Arranca quando o DOM existir, tanto embutido no Claude.ai
// quanto abrindo o arquivo direto no navegador.
//
// A exceção é a BANCADA (src/palco.js, que roda antes deste arquivo): ali esta
// janela é a mesa, e quem roda o app é o iframe em cima dela. Montar aqui
// TAMBÉM daria dois apps vivos sobre o mesmo estado — duas sincronizações
// disputando a nuvem, dois wake locks, dois cronômetros. Um app por documento.
// ---------- a abertura com PRAZO (§7.2 da frente 3) ----------
// "Carregando…" sem fim já aconteceu (F273): se `load()` trava ou rejeita, a
// frase do `index.html` fica para sempre e não diz nada. Agora a abertura tem
// prazo de 4 s, e passado o prazo — ou na primeira rejeição — a tela diz o que
// aconteceu, o que NÃO aconteceu, e o que fazer.
//
// Em DOM puro e numa camada à parte, e não no `#app`: o Preact não chegou a
// montar, e se o registro abrir atrasado o app tem de aparecer por cima do
// aviso — o primeiro `render` tira a camada.
const PRAZO_ABERTURA = 4000;
let abriu = false;
let vigiaAbertura = null;
const inicioDaAbertura = Date.now();

function naoAbriu(erro) {
  if (abriu || desligado) return;
  if (vigiaAbertura) { clearTimeout(vigiaAbertura); vigiaAbertura = null; }
  if (document.getElementById('abertura-falhou')) return;
  const seg = Math.round((Date.now() - inicioDaAbertura) / 1000);
  const el = function (tag, cls, txt) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;      // texto, nunca HTML: o erro vem de fora
    return n;
  };
  const caixa = el('div', 'abertura-falhou');
  caixa.id = 'abertura-falhou';
  caixa.setAttribute('role', 'alert');
  caixa.appendChild(el('p', 'abertura-t', 'O registro deste aparelho não abriu.'));
  caixa.appendChild(el('p', 'abertura-c',
    (erro ? '' : 'Esperei ' + Math.round(PRAZO_ABERTURA / 1000) + ' s. ') +
    'Nada foi apagado e nada saiu do aparelho. A rede não é a causa: o registro mora aqui.'));
  const tenta = el('button', 'abertura-b pare-sim', 'Tentar de novo');
  tenta.setAttribute('data-a', 'abertura-tenta');
  tenta.addEventListener('click', function () { location.reload(); });
  const ver = el('button', 'abertura-b pare-nao', 'Ver o detalhe técnico');
  ver.setAttribute('data-a', 'abertura-detalhe');
  const detalhe = el('p', 'abertura-d',
    (erro ? 'a leitura falhou: ' + ((erro && erro.message) || String(erro))
          : 'leitura local sem resposta há ' + seg + ' s') +
    ' · armazenamento: ' + (DB.mode || 'sem resposta da sonda'));
  detalhe.hidden = true;
  ver.addEventListener('click', function () { detalhe.hidden = !detalhe.hidden; });
  caixa.appendChild(tenta);
  caixa.appendChild(ver);
  caixa.appendChild(detalhe);
  caixa.appendChild(el('p', 'abertura-r',
    'Se acontecer de novo: Ajustes › Cópia de segurança, a partir de outro aparelho com a conta.'));
  document.body.appendChild(caixa);
}

function arranca() {
  vigiaAbertura = setTimeout(function () { naoAbriu(null); }, PRAZO_ABERTURA);
  Promise.resolve().then(load).catch(function (e) { console.error('a abertura falhou', e); naoAbriu(e); });
}

if (ehBancada()) {
  // nada: quem monta é o aparelho
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', arranca);
} else {
  arranca();
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
    if (f.k === 'decidir') return <FolhaDecidir key={i} ctx={CTX} />;
    if (f.k === 'editaRefeicao') return <FolhaEditaRefeicao key={i} ctx={CTX} id={f.id} />;
    // `alvo`, e nunca `ref`: `ref` é prop reservada do Preact e NÃO chega ao
    // componente. A folha recebia `undefined` como refeição de destino, e
    // escolher um alimento na busca não fazia nada — sem erro, sem toast, sem
    // nada. Os testes não pegavam porque chamavam `adicionaItem` direto.
    if (f.k === 'seletor') return <FolhaSeletor key={i} ctx={CTX} alvo={f.ref} idx={f.idx} />;
    if (f.k === 'editaAlimento') return <FolhaEditaAlimento key={i} ctx={CTX} id={f.id} />;
    if (f.k === 'foto') return <FolhaFoto key={i} ctx={CTX} id={f.id} />;
    if (f.k === 'menuSessao') return <FolhaMenuDaSessao key={i} ctx={CTX} />;
    if (f.k === 'pesoRapido') return <FolhaPesoRapido key={i} ctx={CTX} />;
    if (f.k === 'poeODia') return <FolhaPoeODia key={i} ctx={CTX} data={f.data} />;
    return null;
  });
}

// leituras que as folhas precisam
CTX.refeicao = function (id) {
  const r = planoDeComida().filter(function (x) { return x.id === id; })[0];
  if (!r) return null;
  const dia = diaDeComida();
  // O padrão desta refeição, ANTES de ele decidir. É a devolutiva do histórico
  // que a literatura sustenta: informar antes da decisão, em vez de cobrar
  // depois. Contagem crua, nunca percentual — "14 de 20" e "70%" são iguais na
  // matemática e opostos na cabeça.
  const c = contagemDaRefeicao(S.comidaHist || [], planoDeComida(), id, 20, hojeISO());
  return {
    r: r,
    catalogo: catalogoAlimentos(),
    alta: !!dia.alta,
    escala: dia.escala[id] == null ? 1 : dia.escala[id],
    feita: !!dia.done[id],
    padrao: c.possiveis >= 5
      ? { txt: 'feita em ' + c.feitas + ' dos últimos ' + c.possiveis + ' dias com registro' }
      : null
  };
};

CTX.seletorDeDia = function () {
  const h = diaResolvido();
  const dia = diaDeComida();
  const plano = planoDeComida();
  const doPlano = plano.filter(function (r) { return r.id === 'treino'; })[0];
  const refs = refeicoesDeHoje(plano, h.cadencia === 'treino', !!dia.alta, dia.turno, duracaoDoTreino());
  const pos = posTreinoDe(refs, h.cadencia === 'treino');
  const nomeDe = function (id) {
    const r = refs.filter(function (x) { return x.id === id; })[0];
    return r ? r.n : null;
  };
  const cat = catalogoAlimentos();
  const kcalDe = function (treinando) { return Math.round(totalDoDia(plano, cat, treinando, !!dia.alta, {}).kcal); };
  const refsDesc = refeicoesDeHoje(plano, false, !!dia.alta, dia.turno, duracaoDoTreino());
  const proximo = h.treino || nextDay();
  const diaNome = DIAS_LONGOS[new Date(Date.now()).getDay()];
  const fato = h.origem === 'registrado' || h.origem === 'aberta';
  return {
    // a folha da D (`agora-descanso.html`, estado 4): a procedência em cima, a
    // pergunta, e o efeito de cada resposta antes do toque
    olho: h.origem === 'previsto' || h.previsto
      ? 'pelo padrão semanal: ' + diaNome + ' é ' + (h.cadencia === 'descanso' ? 'descanso' : 'dia de treino')
      : h.origem === 'manual' ? 'você disse que hoje é ' + (h.cadencia === 'descanso' ? 'descanso' : 'dia de treino')
      : 'hoje tem sessão registrada',
    pergunta: fato ? 'Hoje é dia de treino' : 'Hoje é dia de ' + (h.cadencia === 'descanso' ? 'descanso' : 'treino') + '?',
    sub: fato ? 'A sessão registrada manda no tipo do dia.'
              : 'É um palpite até você dizer. Dizer muda o plano da comida de hoje, e mais nada.',
    efeitoDescanso: 'o plano fica o de descanso: ' + refsDesc.length + ' refeições, ' + fmtInt(kcalDe(false)) + ' kcal',
    efeitoTreino: 'o pré-treino e o treino entram no plano e andam com a hora da sessão · na sequência, o próximo é ' +
                  (diaAberto(proximo) ? 'a aula' : 'o Treino ' + proximo),
    fato: fato,
    titulo: h.cadencia === 'descanso' ? 'Descanso' : 'Dia de treino',
    treino: h.treino,
    cadencia: h.cadencia,
    alta: !!dia.alta,
    aderencia: dia.aderencia || 'plano',
    aderencias: [
      { k: 'plano',   t: 'segui o plano' },
      { k: 'fora',    t: 'saí, mas sei o que comi' },
      { k: 'perdido', t: 'saí e não sei quanto' }
    ],
    turno: dia.turno || 'manha',
    turnos: TURNOS.map(function (x) {
      // `manha` não tem hora própria: a hora é a do plano, seja qual for.
      const hora = x.t || (doPlano ? doPlano.t : '06:15');
      const sim = refeicoesDeHoje(plano, true, !!dia.alta, x.k, duracaoDoTreino());
      const idPos = posTreinoDe(sim, true);
      const ref = idPos ? sim.filter(function (r) { return r.id === idPos; })[0] : null;
      return { k: x.k, n: x.n, hora: hora, on: (dia.turno || 'manha') === x.k,
               // o que muda de fato: quem vira o pós-treino naquele turno
               pos: ref ? ref.n : null };
    }),
    posNome: pos ? nomeDe(pos) : null,
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
  if (desligado) return;
  montaNoApp(<App ctx={CTX} />);
  // A primeira montagem é a prova de que o registro abriu: `abriu` cala o prazo
  // (`naoAbriu` não faz nada depois dela), e se o aviso de que não abriu chegou
  // a aparecer, o app atrasado passa na frente. UM guarda só, e sem cancelar o
  // timer aqui também: os dois juntos se mascaravam — tirar qualquer um deixava
  // a suíte verde, porque o outro atendia.
  if (!abriu) {
    abriu = true;
    const aviso = document.getElementById('abertura-falhou');
    if (aviso) aviso.remove();
  }
  ajustaRelogio();
  // Depois de montar, e não antes: aqui `view` já é o que está na tela, e a
  // profundidade do histórico passa a ser a mesma da pilha de camadas.
  sincronizaHistorico(camadasAbertas(view).length);
}

// ---------- o Voltar do sistema ----------
// Fecha UMA camada — a do topo — pelo mesmo caminho que o botão do app usaria.
// Nenhum fechamento novo foi inventado aqui: cada entrada aponta para a função
// que já existia, e é isso que garante que voltar pelo gesto e voltar pelo
// botão deixem o app no mesmo estado.
const FECHA_CAMADA = {
  // Voltar com o aviso de falha aberto é "Fechar este aviso": dispensar não
  // escolhe por ele, e a marca de não guardado continua.
  falhou:    function () { dispensaFalha(); },
  // Voltar com o painel de pare aberto é "Deixar como está": a resposta que não
  // apaga nada, pelo mesmo caminho que fecha qualquer camada.
  pare:      function () { respondePare(false); },
  camera:    function () { CTX.fechaCamera(); },
  ajustes:   function () { CTX.fechaAjustes(); },
  ajuste:    function () { CTX.fechaAjuste(); },
  protocolo: function () { CTX.fechaProtocolo(); },
  comparar:  function () { CTX.fechaComparar(); },
  evolucao:  function () { CTX.fechaEvolucao(); },
  dia:       function () { CTX.fechaDia(); },
  prog:      function () { fecharPrograma(); },
  retro:     function () { fecharRetro(); },
  add:       function () { fecharAdicionar(); },
  sessao:    function () { fecharSessao(); },
  hist:      function () { closeHist(); },
  // O modo de sessão fecha pela MESMA porta da seta do cabeçalho, e isso é
  // deliberado: as duas saídas têm de deixar a sessão aberta. Se o Voltar
  // encerrasse, o gesto de borda do Safari passaria a matar o treino.
  modoSessao: function () { CTX.fechaModoDeSessao(); }
};

function voltarUmaCamada() {
  const camadas = camadasAbertas(view);
  if (!camadas.length) return;
  const topo = camadas[camadas.length - 1];
  // A folha é a única camada cuja chave carrega índice: são várias do mesmo
  // tipo, e o que fecha é sempre a de cima.
  if (topo.indexOf('folha:') === 0) { CTX.fechaFolha(); return; }
  const fecha = FECHA_CAMADA[topo];
  if (fecha) fecha();
}

ligaNavegacao({
  camadas: function () { return camadasAbertas(view).length; },
  aoVoltar: voltarUmaCamada
});

// ---------- COMIDA ----------
// A biblioteca e o plano. Compras é derivada: some do estado, aparece na tela.
CTX.planoCompleto = function () {
  const cat = catalogoAlimentos();
  const doNutri = {};
  PLANO_BASE.forEach(function (r) { doNutri[r.id] = true; });
  return planoDeComida().slice()
    .sort(function (a, b) { return a.t.localeCompare(b.t); })
    .map(function (r) {
      return Object.assign({}, r, {
        kcal: Math.round(totalDaRefeicao(r, cat, true).kcal),
        // o que tem dentro, como se lê no prato (a D, prescrição, estado 7):
        // "pão 35 g · doce de leite 20 g · café 200 ml"
        itensTxt: (r.itens || []).map(function (it) {
          const a = cat[it.f];
          const n = a ? a.n.charAt(0).toLowerCase() + a.n.slice(1) : it.f;
          return n + ' ' + fmtNum(it.q).replace('.', ',') + ' ' + (a ? a.u : 'g') + (it.alta ? ' só em dia de alta demanda' : '');
        }).join(' · '),
        // o momento criado por ele fica marcado como dele, ao lado do que o
        // nutricionista escreveu: as duas coisas são verdade (F182)
        meu: !doNutri[r.id]
      });
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
  const n = S.ajuste || 0;
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
    refeicoes: plano.length,
    // o saldo dos passos de ±150 kcal que a Semana aplicou
    ajuste: n ? rotuloDoAjuste().replace(/^ajuste /, '') : 'nenhum passo de ±150 kcal aplicado',
    folga: FOLGA_POS
  };
};

// ---------- o endereço vazio (a D, `prescricao.html`, estado 9) ----------
//
// Os dados ficam presos ao endereço de onde o app é aberto (F56): um link novo
// abre um app vazio, e o histórico continua no antigo. Aparelho novo já ficaria
// sem plano para sempre (F271). Então o vazio de verdade não oferece começar em
// primeiro: oferece ACHAR o que existe — a conta, a cópia de segurança, o ícone
// antigo — e só depois começar. O programa e o plano já vêm semeados; começar é
// só dizer que não há nada em outro lugar.
function enderecoVazio() {
  if (NUVEM.sessao()) return false;
  const tem = function (x) { return Array.isArray(x) && x.length > 0; };
  if (Object.keys(S.logs || {}).some(function (k) { return tem(S.logs[k]); })) return false;
  if (tem(S.done) || tem(S.cardio) || tem(S.progLog) || tem(S.aulas) || tem(S.comidaHist)) return false;
  if (S.body && Object.keys(S.body).some(function (k) { return tem(S.body[k]); })) return false;
  if (S.protocolo && tem(S.protocolo.sessoes)) return false;
  const d = S.dia;
  if (S.sessao || (d && ((d.done && Object.keys(d.done).length) || d.agua))) return false;
  return true;
}
CTX.enderecoVazio = function () {
  if (view.comecouAqui || !enderecoVazio()) return null;
  const r = rot().filter(function (k) { return !!treino(k); });
  const series = r.reduce(function (n, k) {
    return n + treino(k).ex.reduce(function (m, ex) { return m + setsFor(ex); }, 0);
  }, 0);
  const res = CTX.resumoDoPlano();
  return {
    programa: r.length + ' treinos na sequência · ' + series + ' séries nela inteira',
    plano: res.refeicoes + ' momentos · ' + res.treino.kcal + ' kcal em dia de treino',
    semRede: typeof navigator !== 'undefined' && navigator.onLine === false
  };
};
CTX.comecaAqui = function () { view.comecouAqui = true; render(); };

CTX.alimentosFiltrados = function (q) {
  const cat = catalogoAlimentos();
  return Object.keys(cat).map(function (k) { return cat[k]; })
    .filter(function (a) { return casaBusca(a.n, q); })
    .sort(function (a, b) { return a.n.localeCompare(b.n, 'pt-BR'); });
};

CTX.compras = function () {
  const prev = previsaoDoHorizonte(cadenciaDaSemana(), S.compras.dias);
  return {
    linhas: listaDeCompras(planoDeComida(), catalogoAlimentos(), prev, 0)
      .filter(function (l) { return !S.compras.removidas[l.f]; }),
    previsao: prev,
    dias: S.compras.dias,
    comprado: S.compras.comprado,
    // o que a previsão deixa de fora, dito (a D, prescrição, estado 8): os
    // dias de alta demanda não se preveem, e o que só entra neles não aparece
    foraDaPrevisao: (function () {
      const cat = catalogoAlimentos(), vistos = {};
      planoDeComida().forEach(function (r) {
        (r.itens || []).forEach(function (it) { if (it.alta && cat[it.f]) vistos[it.f] = cat[it.f].n.toLowerCase(); });
      });
      return Object.keys(vistos).map(function (k) { return vistos[k]; });
    })()
  };
};
/**
 * O horizonte das compras: quantos dias até a próxima. A frequência dele não é
 * conhecida, então a tela pergunta em vez de supor; "outro" aceita qualquer
 * número de 1 a 60.
 */
CTX.setHorizonteCompras = function (d) {
  const n = parseInt(d, 10);
  if (!(n >= 1 && n <= 60)) return;
  S.compras.dias = n; queueSave(); render();
};
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
  // O botão destes avisos é a segunda porta do interruptor, e diz as mesmas
  // palavras do menu: "entrar em deload" sozinho era o nome sem o freio.
  const dl = itemDoDeload(d);
  const porta = function (on) {
    return dl ? { t: dl.rotulo.charAt(0).toUpperCase() + dl.rotulo.slice(1) + ' · ' + dl.detalhe, onClick: function () { setDeload(on); } } : null;
  };
  if (S.deload) {
    avisos.push({ k: 'dl', rotulo: 'deload ativo', cor: 'amber',
      txt: 'Metade das séries, mesmas cargas. Os placeholders continuam mostrando a carga da última semana normal.',
      acao: porta(false) });
  } else if (trabalho > 0 && faltam <= 6) {
    // Não é contagem regressiva para um deload obrigatório: o treinador tirou a
    // semana fixa do programa. O bloco de 48 sessões continua sendo o momento de
    // OLHAR, e quem decide é a evidência de fadiga, não o calendário.
    avisos.push({ k: 'dl2', rotulo: 'fim de bloco chegando', cor: '',
      txt: 'Faltam ' + faltam + ' sessões para fechar o bloco. Deload só se houver evidência de fadiga: força caindo por 2 a 3 sessões, dor que não passa em 72 h, RIR difícil de manter. Progredindo bem, siga treinando.',
      acao: porta(true) });
  }
  // Preenchendo um treino de outra data: o aviso é o único lugar que diz para
  // onde as séries digitadas estão indo, e carrega a porta de saída. Sem ele o
  // app fica preso numa sessão retroativa sem nada na tela explicando por quê.
  if (s && s.retro) {
    avisos.push({ k: 'r', rotulo: 'preenchendo treino passado', cor: 'amber',
      txt: 'As séries que você digitar entram em ' + diaExtenso(s.inicio) + ', não em hoje.',
      acao: { t: 'Concluir', onClick: function () { concluirRetro(); } } });
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
    olho: P ? _caixaDeFrase(P.tag) : '',
    feitas: feitas,
    prescritas: prescritas,
    // Num dia aberto não existe "prescritas": a meta 0/16 do sábado era uma
    // conta contra um número que o box nunca ia cumprir. O que conta é quantos
    // movimentos entraram.
    aberto: diaAberto(d),
    movimentos: P ? P.ex.length : 0,
    // O catálogo de adição também é desenhado AQUI, e não só dentro da edição
    // do dia: num dia aberto adicionar movimento é o uso normal da tela, não
    // uma emenda ao programa. Fica preso ao dia aberto fora do modo de edição
    // para as duas superfícies nunca desenharem o mesmo painel ao mesmo tempo.
    addEx: (diaAberto(d) && !view.editProg && view.addEx) ? catalogoDeAdicao(d) : null,
    // antes de começar a aula, o que entrou na última (estado 5)
    ultimaAula: (diaAberto(d) && P && !P.ex.length) ? referenciaDaUltimaAula(d) : null,
    // A lista rápida: um campo por movimento, para o fim da aula. Só no dia
    // aberto e só com movimento dentro — uma lista vazia não registra nada.
    rapido: (diaAberto(d) && !view.editProg && P && P.ex.length) ? (function () {
      return {
        ativo: !!view.rapido,
        linhas: P.ex.map(function (ex, i) {
          const un = unidadeDe(ex);
          const dr = draftPeek(i);
          const v = (dr && dr.s && dr.s[0]) ? dr.s[0] : [null, null];
          const ns = setsFor(ex);
          const tipo = cargaTipo(logKey(d, i), ex);
          return {
            i: i,
            nome: ex.n,
            // o que foi prescrito, para ele saber em cima de que está digitando
            prescricao: un && ex.q > 0
              ? ns + ' × ' + fmtInt(ex.q) + ' ' + ROTULO_UNIDADE[un]
              : ns + (ex.r ? ' × ' + ex.r : ''),
            // dito por extenso: escrever o mesmo número em cinco passadas em
            // silêncio seria o app inventando dado
            nota: ns > 1 ? ns + ' passadas · o mesmo em todas' : null,
            unidade: un ? 'kg' : CARGAS[tipo].rot,
            medida: un ? (cronometrado(un) ? 'seg' : ROTULO_UNIDADE[un]) : 'reps',
            carga: v[0] != null ? String(v[0]) : '',
            valor: v[1] != null ? String(v[1]) : '',
            feito: v[1] != null,
            // O TECLADO PRÓPRIO, quando ele está aberto nesta linha. `pos` diz
            // em qual das duas grandezas — é o que marca o botão que o abriu.
            teclado: (function () {
              const a = view.teclado && view.teclado.alvo;
              if (!a || a.tipo !== 'rapida' || a.i !== i) return null;
              return { texto: view.teclado.texto, pos: a.pos, decimal: a.pos === 0,
                       unidade: a.pos === 0 ? (un ? 'kg' : CARGAS[tipo].rot)
                                            : (un ? (cronometrado(un) ? 'seg' : ROTULO_UNIDADE[un]) : 'reps') };
            })()
          };
        })
      };
    })() : null,
    // As portas rápidas do dia aberto. Só existem no dia aberto: pôr uma aula
    // inteira num dia de prescrição seria emendar o programa do treinador por
    // atalho, que é exatamente o que o app existe para frear.
    aulas: (diaAberto(d) && !view.editProg) ? (function () {
      const ult = ultimaAulaDe(d);
      return {
        painelAberto: !!view.aulas,
        // O sábado passado, com quantos movimentos teve. Sem sessão anterior a
        // porta não aparece: um botão que não faz nada é pior que sua ausência.
        ultima: ult ? { n: ult.mov.length, quando: fmtDate(ult.t) } : null,
        modelos: (S.aulas || []).slice().reverse().map(function (a) {
          return { id: a.id, nome: a.nome,
                   sub: a.mov.length + (a.mov.length === 1 ? ' movimento' : ' movimentos'),
                   quadro: a.quadro || null };
        }),
        podeSalvar: (P ? P.ex.length : 0) > 0,
        colando: !!view.colaAula
      };
    })() : null,
    // O quadro do box enquanto a aula acontece: time cap, peso sugerido e o
    // que mais a lousa disse e o app não modela. Some quando a sessão encerra,
    // depois de virar a nota dela.
    quadro: (S.quadro && S.quadro.day === d) ? S.quadro.texto : null,
    volume: fmtK(volumeDoDia(d)),
    // `ciclo` e `sessoes` saíram desta leitura com a célula que os mostrava: o
    // ciclo foi para `CTX.cicloDoBloco`, que a Semana lê. Deixá-los aqui seria
    // uma segunda fonte da mesma conta, esperando divergir da primeira.
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
/**
 * A metade de comida do DADOS.
 *
 * Tudo aqui é PADRÃO, nunca nota. A regra que governa esta leitura inteira:
 * contagem crua em vez de percentual, nenhuma cor avaliativa, nenhum
 * coeficiente de correlação e nenhuma frase causal. O que o app faz é pôr o
 * dado à vista; a interpretação é dele.
 */
function dadosDeComida() {
  // Janela de 90 dias, e não o histórico inteiro. Dois motivos, e o segundo é
  // o que manda: percorrer dez anos a cada render custaria milhares de
  // iterações numa tela que se abre com o polegar; e "qual refeição eu mais
  // falho" respondido sobre uma década responde menos que sobre o trimestre —
  // o padrão de hoje é o que dá para mexer.
  const JANELA = 90;
  const plano = planoDeComida();
  const hist = janelaDoHistorico(S.comidaHist || [], JANELA, hojeISO());
  const DIAS_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  const comRegistro = hist.filter(function (h) { return Object.keys(h.done || {}).length; });
  const nome = function (id) {
    const r = plano.filter(function (x) { return x.id === id; })[0];
    return r ? r.n : id;
  };

  const padrao = padraoPorRefeicao(hist, plano)
    .filter(function (p) { return p.possiveis > 0; })
    .map(function (p) {
      return { k: p.id, nome: nome(p.id), feitas: p.feitas, possiveis: p.possiveis,
               txt: p.feitas + ' de ' + p.possiveis };
    });
  // a que mais falha, para a tela poder dizer QUAL sem pedir que ele compare
  const pior = padrao.slice().sort(function (a, b) {
    return (a.feitas / a.possiveis) - (b.feitas / b.possiveis);
  })[0];

  const recorte = function (chave) {
    return recorteDoHistorico(hist, plano, chave).map(function (r) {
      return { k: r.k, rotulo: r.k, txt: r.feitos + ' de ' + r.dias };
    });
  };

  const trocas = trocasDeAjuste(hist, plano).slice(-6);
  const comAderencia = trocas.filter(function (x) { return x.aderencia != null; });
  const baixas = comAderencia.filter(function (x) { return x.aderencia < 0.55; });

  return {
    janela: JANELA,
    dias: comRegistro.length,
    // o piso de 14 dias não é estético: abaixo disso qualquer padrão é ruído,
    // e mostrar um número que ainda não quer dizer nada é pior que calar
    pronto: comRegistro.length >= 14,
    faltam: Math.max(0, 14 - comRegistro.length),
    padrao: padrao,
    pior: pior && pior.possiveis >= 5 && pior.feitas < pior.possiveis
      ? { nome: pior.nome, txt: pior.txt } : null,
    // Em ordem de CALENDÁRIO, não de primeira aparição: uma lista que começa
    // na sexta porque foi o primeiro dia registrado não se lê.
    porSemana: recorte(function (h) {
      return DIAS_SEM[new Date(h.d + 'T12:00:00').getDay()];
    }).sort(function (a, b) { return DIAS_SEM.indexOf(a.k) - DIAS_SEM.indexOf(b.k); }),
    porTurno: recorte(function (h) {
      return h.cadencia === 'descanso' ? null : (h.turno || 'manhã');
    }),
    porCadencia: recorte(function (h) {
      return h.cadencia === 'descanso' ? 'descanso' : 'treino';
    }),
    // As duas curvas, suavizadas por semana. Sem coeficiente e sem frase
    // causal: o ganho que se quer enxergar é de 200 a 400 g por semana, a
    // flutuação de água passa de 1 kg, e duas séries com tendência
    // correlacionam por definição — um número aqui seria confiança fabricada.
    curvas: {
      aderencia: aderenciaPorSemana(S.comidaHist || [], plano, 14),
      peso: serieSemanal(S.body.peso, 14)
    },
    // Uma troca já basta para valer o aviso: se a régua mudou em cima de uma
    // semana mal executada, isso é fato sobre o sistema, não estatística.
    auditoria: baixas.length
      ? { n: baixas.length, de: comAderencia.length,
          // "abaixo de 55%" seria a aderência DELE em percentual, que é a
          // forma que esta tela evita em toda parte. O limiar continua sendo
          // 55%; o que se diz é o fato, na mesma moeda do resto: contagem.
          txt: comAderencia.length === 1
            ? 'O ajuste calórico mudou uma vez, e foi sobre uma semana em que menos da metade das refeições foi cumprida.'
            : 'Das últimas ' + comAderencia.length + ' vezes em que o ajuste calórico mudou, ' +
              (baixas.length === 1 ? '1 foi' : baixas.length + ' foram') +
              ' sobre uma semana em que menos da metade das refeições foi cumprida.' }
      : null
  };
}

CTX.dados = function () {
  const t = tendenciaDeForca(S.logs, function (k) { return temUnidade(exDe(k)); });
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
      if (temUnidade(exDe(k))) return;
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
      // Só 'mais' e 'menos' propõem passo. 'observar' e 'manter' não oferecem
      // ação nenhuma: antes, com o alvo lido como DESTINO, um veredito de
      // observar com corte em vigor punha na tela um botão "voltar ao plano
      // base" — convidando a devolver as 150 kcal, que é exatamente o que a
      // regra proíbe. Desfazer existe, e é o restaurar do plano, um nível
      // para dentro e com confirmação.
      podeAplicar: v.k === 'mais' || v.k === 'menos',
      acaoTxt: alvo > 0 ? 'aplicar +150 kcal' : alvo < 0 ? 'aplicar −150 kcal' : null,
      // A frase do que não volta, ANTES do toque e em número (V4, §6.3): é a
      // que impede ler o passo como empréstimo que se devolve sozinho.
      naoVolta: (v.k === 'mais' || v.k === 'menos') && alvo
        ? 'Depois de aplicado, ' + fmtInt(kcalDeTreinoCom((S.ajuste || 0) + alvo)) +
          ' kcal vira a nova base. Se o peso voltar ao alvo, o passo não é devolvido sozinho.'
        : null,
      estado: linhaDoAjuste(),
      podeDesfazer: !!passoEmVigor(),
      // Os portões da regra, cada um com o estado na palavra e o caminho do que
      // falta (§6.2). Só nos dois ramos que podem dar passo; nos outros, `null`.
      portoes: portoesDaRegra(S.body, sinaisDaRegra(), { forca: t, forcaManual: S.perfManual, par: parDaAvaliacao() }),
      // O vazio da régua: as semanas e o motivo de cada reprovação (§6.4), e a
      // saída quando um buraco separa duas semanas válidas.
      semanas: v.k === 'faltam' ? semanasDoVazio() : null
    },
    comida: dadosDeComida(),
    forca: {
      serie: porSemana,
      agora: t.ok ? Math.round(t.agora) + ' kg' : '—',
      delta: t.ok ? (t.delta >= 0 ? '+' : '−') + (Math.abs(t.delta) * 100).toFixed(1).replace('.', ',') + '%' : '—',
      // Sem ácido para "subindo": é comparação com antes, e o app não
      // comemora. O âmbar fica, porque "não está subindo" pede atenção.
      cor: t.ok && !t.subindo ? 'ins-amber' : '',
      txt: textoDaTendencia(t, S.perfManual),
      opcoes: [
        { k: 'auto', t: 'o app decide', v: null, on: S.perfManual == null },
        { k: 'sim', t: 'está subindo', v: true, on: S.perfManual === true },
        { k: 'nao', t: 'não está', v: false, on: S.perfManual === false }
      ]
    },

  };
};

/**
 * As semanas do vazio, com a saída escrita quando há um buraco entre duas
 * válidas: "Com a semana de 13/09 incompleta, as de 06/09 e 20/09 não formam
 * sequência. Uma pesagem com data passada em 13/09 ainda resolve isso — se você
 * souber o número." (§6.4). Sem buraco assim, não há saída a dizer.
 */
function semanasDoVazio() {
  const ws = semanasDaRegra(S.body.peso || [], Date.now());
  let saida = null;
  for (let i = 1; i < ws.length - 1; i++) {
    if (!ws[i].valida && ws[i - 1].valida && ws[i + 1].valida) {
      saida = 'Com a semana de ' + fmtDate(ws[i].w) + ' incompleta, as de ' + fmtDate(ws[i + 1].w) + ' e ' +
              fmtDate(ws[i - 1].w) + ' não formam sequência. Uma pesagem com data passada em ' + fmtDate(ws[i].w) +
              ' ainda resolve isso — se você souber o número.';
      break;
    }
  }
  return {
    lista: ws.map(function (w) {
      return { w: w.w, intervalo: w.intervalo, estado: w.estado, valida: w.valida,
               n: w.n === 0 ? 'nenhuma pesagem' : w.n + (w.n === 1 ? ' pesagem' : ' pesagens') };
    }),
    saida: saida
  };
}

CTX.setPerfManual = function (v) { S.perfManual = v; queueSave(); render(); };
/**
 * Muda o passo e GRAVA NA HORA, e se o aparelho recusa, volta inteiro (a D,
 * `semana.html`, estado 10: "nada entra pela metade"). O passo mexe no ajuste,
 * no histórico dele e no arroz de duas refeições; os três voltam juntos, e a
 * tela diz o que não mudou, com os números de antes, em vez de "Apliquei".
 */
async function gravaOPasso(muda, oQue) {
  const antes = JSON.stringify({ a: S.ajuste, h: S.ajusteHist, p: planoDeComida(), v: S.comida.v });
  const kcalAntes = Math.round(kcalDeTreinoCom(S.ajuste || 0));
  const arrozAntes = planoDeComida().map(function (r) {
    const i = r.itens.filter(function (x) { return x.arroz; })[0];
    return i ? { refeicao: r.n, q: i.q } : null;
  }).filter(Boolean);
  const ajusteAntes = S.ajuste || 0;
  muda();
  view.passoFalhou = null;
  const ok = await save();
  if (ok === false) {
    const v = JSON.parse(antes);
    S.ajuste = v.a; S.ajusteHist = v.h; S.comida.plano = v.p; S.comida.v = v.v;
    view.passoFalhou = { oQue: oQue, kcal: kcalAntes, arroz: arrozAntes, ajuste: ajusteAntes };
    render();
    return false;
  }
  render();
  return true;
}

CTX.aplicaAjuste = async function () {
  const v = veredito();
  const passo = ajusteDoVeredito(v);
  if (!passo) return;                   // observar e manter não propõem passo
  const ok = await gravaOPasso(function () {
    const antes = S.ajuste || 0;
    const kde = kcalDeTreinoCom(antes);
    S.ajuste = antes + passo;
    if (!Array.isArray(S.ajusteHist)) S.ajusteHist = [];
    aplicaArroz();
    // As kcal do dia de treino antes e depois vão junto: é o que a linha do passo
    // diz depois ("3.007 → 3.157 kcal em dia de treino"), e o plano muda — lidas
    // depois, dariam o número de outro dia.
    S.ajusteHist.push({ t: Date.now(), de: antes, para: S.ajuste,
                        k: v.k, p: v.p, reg: diasRegistrados(),
                        kde: Math.round(kde), kpara: Math.round(kcalDeTreinoCom(S.ajuste)) });
  }, { verbo: 'aplicado', passo: passo });
  // "Apliquei", e não "Ajuste aplicado": aplicar é ato do registro, e o agente
  // é o app (V8). Só depois de o aparelho aceitar.
  if (ok) toast('Apliquei ' + sinalDoPasso(passo) + ' kcal. O arroz do plano foi para ' + arrozAtual() + ' g.');
};

/**
 * Desfaz o passo em vigor — o "Desfazer" do desenho, ao lado da linha do passo
 * aplicado, e sem prazo: corrigir no lugar vale aqui também. O plano volta ao
 * saldo de antes e o arroz acompanha; o passo fica no registro, marcado como
 * desfeito. Não passa pelo pare: nada é destruído, e aplicar de novo o refaz.
 */
CTX.desfazAjuste = async function () {
  const u = passoEmVigor();
  if (!u) return;
  const passo = u.para - u.de;
  const ok = await gravaOPasso(function () {
    const w = passoEmVigor();
    w.desfeito = Date.now();
    S.ajuste = w.de;
    aplicaArroz();
  }, { verbo: 'desfeito', passo: passo });
  if (ok) toast('Desfiz o ' + sinalDoPasso(passo) + ' kcal. O arroz do plano voltou para ' + arrozAtual() + ' g.');
};

/** O passo que o aparelho recusou, para a tela dizer o que não mudou. */
CTX.passoFalhou = function () {
  const f = view.passoFalhou;
  if (!f) return null;
  return {
    titulo: 'O passo não foi ' + f.oQue.verbo,
    texto: 'O armazenamento deste aparelho recusou a gravação. O plano continua em ' + fmtInt(f.kcal) +
      ' kcal no dia de treino' + (f.arroz.length ? ', com arroz ' + f.arroz.map(function (x) { return fmtInt(x.q) + ' g no ' + x.refeicao.toLowerCase(); }).join(' e ') : '') +
      ', e o ajuste acumulado continua em ' + (f.ajuste ? sinalDoPasso(f.ajuste) + ' kcal' : '0') + '.',
    linhas: f.arroz.map(function (x) { return x.refeicao + ' · arroz cozido ' + fmtInt(x.q) + ' g'; })
      .concat(['Dia de treino ' + fmtInt(f.kcal) + ' kcal']),
    veredito: f.oQue.verbo === 'aplicado'
      ? 'O veredito continua valendo: ' + sinalDoPasso(f.oQue.passo) + ' kcal. Ele não vence e não some.'
      : null,
    tenta: f.oQue.verbo === 'aplicado' ? 'aplicar' : 'desfazer'
  };
};
CTX.dispensaPassoFalhou = function () { view.passoFalhou = null; render(); };

/** "+150" / "−300": o passo em kcal, com o sinal de verdade. */
function sinalDoPasso(passos) { return (passos > 0 ? '+' : '−') + Math.abs(passos) * 150; }

/**
 * As kcal do dia de treino com um saldo de ajuste qualquer, SEM tocar no plano.
 * É o que deixa a consequência ser dita antes do toque, em número (V4): o
 * ajuste aterrissa no arroz em gramas inteiros, então o total não é "atual +
 * 150" — é o que a conta do arroz der.
 */
function kcalDeTreinoCom(ajuste) {
  const plano = JSON.parse(JSON.stringify(planoDeComida()));
  const itens = [];
  plano.forEach(function (r) { r.itens.forEach(function (i) { if (i.arroz) itens.push(i); }); });
  aplicaAjusteNoArroz(itens, ajuste);
  return totalDoDia(plano, catalogoAlimentos(), true, false).kcal;
}

/**
 * "Apliquei +150 kcal em 01/10, às 21h34 · 3.007 → 3.157 kcal em dia de treino"
 * (§6.3) — só enquanto aquele passo é o que está em vigor. Antes dele, ou com o
 * plano restaurado, a linha volta a ser o estado: "plano base · arroz 250 g".
 */
/** O último passo que ainda vale: o mais recente não desfeito, se é ele que está em vigor. */
function passoEmVigor() {
  const h = (Array.isArray(S.ajusteHist) ? S.ajusteHist : []).filter(function (x) { return !x.desfeito; });
  const u = h[h.length - 1];
  return u && u.para !== u.de && u.para === (S.ajuste || 0) ? u : null;
}

function linhaDoAjuste() {
  const estado = rotuloDoAjuste() + ' · arroz ' + arrozAtual() + ' g';
  const u = passoEmVigor();
  if (!u) return estado;
  return 'Apliquei ' + sinalDoPasso(u.para - u.de) + ' kcal em ' + fmtDate(u.t) + ', às ' + fmtHoraDita(u.t) +
    (u.kde != null && u.kpara != null
      ? ' · ' + fmtInt(u.kde) + ' → ' + fmtInt(u.kpara) + ' kcal em dia de treino' : '') +
    ' · ' + estado;
}

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
        v: fmtInt(dTreino.kcal) + ' kcal' },
      { k: 'd', t: 'Dia de descanso', s: 'sem as refeições de treino',
        v: fmtInt(dFolga.kcal) + ' kcal' }
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
  // O carimbo vem DEPOIS da pergunta, e por isso: ele estava antes, então
  // cancelar subia a versão do plano sem o plano mudar, e o app passava a
  // relatar divergência em dias que não divergiram. É o erro espelhado do que
  // `aplicaArroz` fazia — carimbar sem mudar, em vez de mudar sem carimbar.
  planoMudou();
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

/**
 * O VAZIO DE VERDADE do Corpo (a D, `corpo.html`, estado 10): aparelho novo, ou
 * histórico apagado — nenhum peso, nenhuma medida, nenhuma foto. O vazio diz
 * quanto custa sair dele, com os números da regra e não com uma barra de
 * progresso: duas taxas semanais seguidas são três semanas de média, e cada
 * média pede `MIN_PESAGENS` pesagens.
 */
CTX.corpoVazio = function () {
  const b = S.body || {};
  const alguma = Object.keys(b).some(function (k) { return Array.isArray(b[k]) && b[k].length; }) ||
    (S.protocolo && Array.isArray(S.protocolo.sessoes) && S.protocolo.sessoes.length);
  if (alguma) return null;
  const semanas = 3, pesagens = semanas * MIN_PESAGENS_CORPO;
  return {
    titulo: semanas + ' semanas até a regra poder decidir',
    texto: 'Ela precisa de três semanas seguidas com média válida, e cada média precisa de pelo menos ' +
      MIN_PESAGENS_CORPO + ' pesagens. São ' + pesagens + ' pesagens, em ' + semanas + ' semanas, para o primeiro veredito existir.',
    linhas: [
      { k: 'peso', t: 'Peso', d: 'de manhã, antes de treinar, mesma roupa' },
      { k: 'fita', t: 'Cintura e outras medidas', d: 'sem frequência prescrita · quando você quiser' },
      { k: 'bio', t: 'Bioimpedância', d: 'uma vez por mês' },
      { k: 'fotos', t: 'Fotos', d: 'a cada ' + CADENCIA_DIAS + ' dias, ' + posesDo(S.protocolo && S.protocolo.poses).length + ' poses, menos de 5 min' }
    ],
    conta: NUVEM.sessao() ? null
      : 'Se você já tem histórico em outro aparelho, entrar na conta traz tudo de volta antes de registrar qualquer coisa aqui.'
  };
};

CTX.corpo = function () {
  const r = pesoRitmo();
  const c = cinturaMes();
  const ultimaCint = baseDoCorpo('cintura');
  // a tela precisa de um número para desenhar: rascunho ilegível cai na referência
  const vPeso = valorDoCorpo('peso'), vCint = valorDoCorpo('cintura');
  const semana = weekStart(Date.now());
  const naSemana = S.body.peso.filter(function (x) { return x.t >= semana; }).length;
  // A semana em curso sem média (a D, corpo, estado 9). Com ela, a média e o
  // ritmo desta semana são "—": uma pesagem só não é média, e o ritmo contra
  // ela seria a mesma média falsa com sinal.
  const semMedia = S.body.peso.length ? semanaEmCurso(S.body.peso, Date.now()) : null;
  const vale = r.ok && !semMedia;

  return {
    peso: {
      valor: isNaN(vPeso) ? baseDoCorpo('peso') : vPeso,
      serie: serieSemanal(S.body.peso, 14),
      media: vale ? fmtDec(r.last.v) + ' kg' : '—',
      ritmo: (vale && r.duasSemanas) ? fmtSig2(r.kgSem) : '—',
      // Ácido fica: não é "melhor que antes", é DENTRO DA FAIXA que o
      // nutricionista prescreveu — estado contra uma regra, como "feito".
      ritmoCor: (vale && r.duasSemanas)
        ? (r.kgSem >= 0.15 && r.kgSem <= 0.4 ? 'ins-acid' : 'ins-amber') : '',
      nota: naSemana + (naSemana === 1 ? ' pesagem da manhã nesta semana' : ' pesagens da manhã nesta semana'),
      alvo: 'registre 3 a 4 por semana',
      // o que falta, e a decisão que fica parada. Sem nenhuma pesagem no
      // histórico, quem fala é o vazio de verdade, e não esta cobrança.
      semana: semMedia,
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
      medidas: medidasRecentes('cintura', 'cm'),
      onde: ondeMediu(S.body.cintura),
      ondeRascunho: (view.bodyOnde && view.bodyOnde.cintura) || ''
    },
    // AS MEDIDAS COM FITA além da cintura, que tem seção própria logo acima.
    // Leitura, e nenhuma decide nada (Direção D, pergunta 8): não há média,
    // ritmo nem cor de estado — a última medida e quanto ela andou desde a
    // primeira.
    //
    // LIGADA é derivado, não guardado: o ponto que a tabela liga, o que já tem
    // medida, ou o que ele ligou nesta visita. Ponto ligado e nunca medido não
    // tem nada a lembrar, então não paga um campo novo no estado — e um campo
    // de topo esquecido na lista branca da restauração foi o defeito F251.
    fita: MEDIDAS_DE_FITA.filter(function (m) { return m.k !== 'cintura'; }).map(function (m) {
      const k = m.k;
      const serie = S.body[k] || [];
      const v = valorDoCorpo(k);
      const ult = serie[serie.length - 1], pri = serie[0];
      return {
        k: k, n: m.n, u: m.u,
        ligada: m.fita === 'ligada' || serie.length > 0 || !!(view.fitaLigadas && view.fitaLigadas[k]),
        valor: isNaN(v) ? baseDoCorpo(k) : v,
        serie: serieSemanal(serie, 14),
        atual: ult ? fmtDec(ult.v) + ' ' + m.u : '–',
        desde: serie.length > 1 ? fmtSig2(ult.v - pri.v) : '–',
        acao: acaoDaMedida(k),
        dia: diaDaMedidaVM(k),
        medidas: medidasRecentes(k, m.u),
        onde: ondeMediu(serie),
        ondeRascunho: (view.bodyOnde && view.bodyOnde[k]) || ''
      };
    }),
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
    // As linhas lidas EM CONJUNTO. O painel sempre teve o dado para responder
    // "a semana priorizou o que devia?" — em linhas separadas, e ninguém
    // cruzava. Descreve e para: o que fazer com a frase é do treinador.
    leitura: leituraDaSemana(lista.map(function (g) {
      return { g: g, n: atual[g] || 0,
               media: temHistorico ? (antes[g] || 0) / janela : null };
    }), { ordem: ordemDe, regiao: regiaoDe, priorizado: ehPriorizado }, janela),
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
        rot: (PRIORIDADES[nivel].rot || '').replace(/^(prioridade|progressão) /, '') || null,
        media: m !== null ? fmtDec(m) : null,
        // O ácido saiu: `dif` é contra as semanas anteriores, e volume acima do
        // de antes não é "feito", é melhor que antes. A queda forte continua âmbar.
        dif: dif, difCor: dif !== null && dif < -25 ? 'ins-amber' : ''
      };
    })
  };
};

/** O teclado próprio de uma medida de corpo, quando ele está aberto nela. */
CTX.tecladoDoCorpo = function (campo) {
  const a = view.teclado && view.teclado.alvo;
  if (!a || a.tipo !== 'corpo' || a.campo !== campo) return null;
  return { texto: view.teclado.texto, decimal: true,
           unidade: unidadeDoCorpo(campo) };
};
CTX.abreTecladoDeCorpo = function (campo) { abreTecladoDeCorpo(campo); };
// As duas são as MESMAS de `acoesEx`: um teclado só, uma função só. O que muda
// entre a sessão e o corpo é o ALVO, e ele mora no estado do teclado.
CTX.tecla = function (t) { teclaDoTeclado(t); };
CTX.fechaTeclado = function () { fechaTeclado(); };

CTX.setPeso = function (v) { view.bodyForm = Object.assign({}, view.bodyForm, { peso: v }); render(); };
CTX.setCintura = function (v) { view.bodyForm = Object.assign({}, view.bodyForm, { cintura: v }); render(); };
CTX.abreDiaCorpo = function (k) { view.bodyDiaAberto = view.bodyDiaAberto === k ? null : k; render(); };
CTX.setDiaCorpo = function (k, iso) {
  // 'YYYY-MM-DD' parseado como data LOCAL: `new Date(iso)` leria como UTC e no
  // Brasil cairia no dia anterior.
  const p = String(iso).split('-').map(Number);
  if (p.length !== 3 || !p[0]) return;
  const d = new Date(p[0], p[1] - 1, p[2], 7, 0, 0, 0);
  if (isNaN(d.getTime())) return;
  // HOJE volta ao padrão, e não às 7h: antes das 7h, hoje às 7h está no futuro,
  // e escolher hoje de volta era recusado em silêncio — às 6h, que é a hora em
  // que ele pesa.
  const hoje = sameDay(d.getTime(), Date.now());
  if (!hoje && d.getTime() > Date.now()) {
    // A recusa diz que recusou: um seletor que ignora o toque é beco (§7.8).
    toast('Nunca uma data futura: o dia ainda não aconteceu.');
    return;
  }
  const dias = Object.assign({}, view.bodyDia);
  if (hoje) delete dias[k]; else dias[k] = d.getTime();
  view.bodyDia = dias;
  // trocar de dia troca a referência do stepper: o valor a corrigir é o
  // daquele dia, não o da última pesagem
  view.bodyForm = Object.assign({}, view.bodyForm);
  delete view.bodyForm[k];
  render();
};
CTX.registraPeso = function () { addBody('peso'); };
CTX.registraCintura = function () { addBody('cintura'); };
// As medidas com fita, pela grandeza: a mesma porta da cintura, sem uma função
// por ponto. Só aceitam o que a tabela diz que é fita — o peso e a balança da
// bioimpedância têm as portas deles.
function ehFita(k) { const m = medidaDoCorpo(k); return !!(m && m.fita); }
CTX.setMedida = function (k, v) {
  if (!ehFita(k)) return;
  view.bodyForm = Object.assign({}, view.bodyForm, { [k]: v }); render();
};
CTX.registraMedida = function (k) { return ehFita(k) ? addBody(k) : undefined; };
CTX.ligaMedida = function (k) {
  if (!ehFita(k)) return;
  view.fitaLigadas = Object.assign({}, view.fitaLigadas, { [k]: true }); render();
};
/**
 * O "como eu medi" em rascunho. Vai para a medida no registro, e só nela:
 * escrever aqui não grava nada sozinho. Sem `render` a cada tecla — o campo é
 * texto do teclado do sistema, e repintar no meio da frase não serve a nada.
 */
CTX.setOnde = function (k, txt) {
  if (!ehFita(k)) return;
  view.bodyOnde = Object.assign({}, view.bodyOnde, { [k]: String(txt) });
};
/**
 * A porta de escrita das cinco grandezas da bioimpedância — ver `registraBio`.
 *
 * Devolve a PROMESSA de propósito: o verbo grava e só então responde se a
 * leitura entrou, e quem chama precisa dessa resposta para dizer ao dono o
 * que faltou. `CTX.registraPeso` não devolve nada porque a casca dele lê o
 * rascunho da tela; aqui o valor vem por argumento, e a resposta volta por
 * retorno.
 */
/**
 * A bioimpedancia: as cinco medidas da balanca, e a ultima leitura delas.
 *
 * Cinco campos, decisao do dono (5.a' P3), e o PESO DELA e registro separado da
 * pesagem da manha: sao duas balancas, medidas em momentos diferentes, e
 * mistura-las faria a media semanal do peso — que e o numero que a regra
 * calorica le — pular de acordo com qual balanca ele usou.
 *
 * UMA LEITURA, e e o que o instante compartilhado garante: `registraBio` grava
 * as cinco com o mesmo `t`, e e por ele que a fusao casa o mesmo dia vindo de
 * dois aparelhos. A tela mostra esse instante como "a ultima leitura" em vez de
 * cinco datas, porque cinco datas iguais nao informam nada.
 *
 * `bioAgua` e a unica opcional: a balanca dele a da, mas nem toda balanca da, e
 * recusar a leitura inteira por falta dela perderia as quatro que ele mediu.
 */
// O rótulo de cada campo DENTRO do bloco (§10.1): a palavra dele, a unidade
// por extenso quando a abreviada se lê mal ("l" minúsculo ao lado de número), e
// o que só aquele campo precisa dizer. "Peso" e não "peso na bioimpedância":
// dentro do bloco, a balança já está dita.
const CAMPO_DA_BIO = {
  bioPeso:       { rotulo: 'Peso', un: 'kg', dica: 'o que esta balança mostrou' },
  bioMusculo:    { rotulo: 'Massa muscular esquelética', un: 'kg' },
  bioGordura:    { rotulo: 'Massa de gordura', un: 'kg' },
  bioGorduraPct: { rotulo: 'Percentual de gordura', un: '%' },
  bioAgua:       { rotulo: 'Água corporal total', un: 'litros', dica: 'pode ficar vazio' }
};

CTX.bioimpedancia = function () {
  const campos = MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).map(function (m) {
    const serie = S.body[m.k] || [];
    const ultima = serie[serie.length - 1] || null;
    const c = CAMPO_DA_BIO[m.k] || { rotulo: m.n, un: m.u };
    return {
      k: m.k, n: m.n, u: m.u, obrigatorio: !!m.obrigatorio,
      rotulo: c.rotulo + ' · ' + c.un + (c.dica ? ' · ' + c.dica : ''),
      valor: ultima ? ultima.v : null,
      // o valor de antes, no lugar: é o que o campo mostra até ele mexer
      antes: ultima ? fmtDec(ultima.v) : '',
      txt: ultima ? fmtDec(ultima.v) + ' ' + m.u : '—'
    };
  });
  const noLugar = campos.filter(function (c) { return c.valor != null; }).length;
  const quandos = MARCAS_DA_BIO.map(function (k) {
    const serie = S.body[k] || [];
    const u = serie[serie.length - 1];
    return u ? u.t : null;
  }).filter(function (t) { return t != null; });
  const ultimaT = quandos.length ? Math.max.apply(null, quandos) : null;
  return {
    campos: campos,
    tem: quandos.length > 0,
    ultima: ultimaT ? rotuloDoDia(ultimaT) : null,
    // "uma vez por mês · anterior: 03/09" (§10.1, D2)
    nota: 'uma vez por mês · ' + (ultimaT ? 'anterior: ' + fmtDate(ultimaT) : 'nenhuma leitura ainda'),
    // Na primeira vez, de onde saem os números; nas seguintes, que os do mês
    // passado já estão no lugar — composição corporal muda devagar, e redigitar
    // tudo todo mês é o fluxo que ele recusa.
    instrucao: noLugar
      ? 'Os ' + POR_EXTENSO[noLugar] + ' números do mês passado estão no lugar. Toque só no que mudou.'
      : 'Os cinco números saem da balança de bioimpedância, não da balança de casa.',
    maxISO: hojeISO()
  };
};

CTX.registraBio = function (leitura, quando) { return registraBio(leitura, quando); };
CTX.apagaMedida = function (k, t) { delBody(k, t); };
CTX.apagaCardio = function (t) { delCardio(t); };
CTX.corrigeCardio = function (t, campo, valor) { return corrigeCardio(t, campo, valor); };
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
/**
 * Troca a folha do topo em vez de empilhar.
 *
 * Existe por um caminho só: refeição → `···` → trocar → cadastrar alimento
 * novo, que chegava à QUARTA folha — a primeira em que ninguém sabe mais o que
 * o fechar leva de volta. Cadastrar é a continuação da busca que não achou, não
 * uma camada por cima dela.
 */
CTX.trocaFolha = function (f) { pilha().pop(); pilha().push(f); render(); };
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

/**
 * Um id de refeição livre, com a mesma guarda de colisão de `idAlimento`.
 *
 * Era `'r' + Date.now()` nu, em duas portas — a criação e a duplicação. Dois
 * ids iguais no plano não dão erro: `achaRefeicao` devolve sempre a primeira, e
 * a segunda refeição fica no plano somando no total do dia e **ineditável**,
 * sem nada na tela dizendo por quê. Ninguém mediu caminho realista até a
 * colisão; o que não havia era razão escrita para um id ter guarda e o outro
 * não. O laço é o mesmo de `idAlimento`, e um id já carimbado do relógio
 * raramente entra nele.
 */
function idRefeicao() {
  const base = 'r' + Date.now();
  const plano = planoDeComida();
  const ocupado = function (id) {
    return plano.filter(function (r) { return r.id === id; }).length > 0;
  };
  let id = base, n = 2;
  while (ocupado(id)) id = base + '-' + n++;
  return id;
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
  planoMudou();
  const plano = planoDeComida();
  let r = id ? achaRefeicao(id) : null;
  if (!r) {
    r = { id: idRefeicao(), t: '12:00', n: '', tag: '', quando: 'sempre', nota: '', itens: [] };
    plano.push(r);
  }
  Object.assign(r, campos);
  if (!r.n) r.n = 'Refeição';
  queueSave(); render();
};

CTX.duplicaRefeicao = function (id) {
  planoMudou();
  const r = achaRefeicao(id);
  if (!r) return;
  const copia = JSON.parse(JSON.stringify(r));
  copia.id = idRefeicao();
  copia.n = r.n + ' (cópia)';
  planoDeComida().push(copia);
  CTX.fechaFolha();
  queueSave(); render();
  toast('Refeição duplicada.');
};

CTX.removeRefeicao = function (id) {
  planoMudou();
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
  planoMudou();
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  r.itens[idx].q = Math.max(0, Math.round(q));
  queueSave(); render();
};

CTX.removeItem = function (refId, idx) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  // O item sai do plano de TODO dia, e voltar pede achar o alimento de novo e
  // digitar a quantidade que estava aqui. Confirma, e diz o que não se perde.
  const a = catalogoAlimentos()[r.itens[idx].f];
  if (!confirm('Tirar ' + (a ? a.n.toLowerCase() : 'este item') + ' de ' + r.n + '?\n\n' +
      'Muda o plano de todos os dias, não só o de hoje. ' +
      'O alimento continua na biblioteca.')) return;
  planoMudou();
  // Não há o que devolver aqui, e é diferente da troca de propósito: o item SAI
  // do plano, e com ele os gramas que o ajuste lhe deu. O que o defeito tirava
  // era comida dos OUTROS pratos, por recalcular o desfazer pela contagem que
  // sobrou — e isso agora não acontece porque cada um guarda o que recebeu.
  // Vale igual para `removeRefeicao`, que leva o item junto sem passar por aqui.
  r.itens.splice(idx, 1);
  queueSave(); render();
};

CTX.alternaAlta = function (refId, idx) {
  planoMudou();
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  if (r.itens[idx].alta) delete r.itens[idx].alta; else r.itens[idx].alta = true;
  queueSave(); render();
};

CTX.adicionaItem = function (refId, foodId) {
  planoMudou();
  const r = achaRefeicao(refId);
  if (!r) return;
  r.itens.push({ f: foodId, q: 100 });
  CTX.fechaFolha();
  queueSave(); render();
};

CTX.trocaItem = function (refId, idx, foodId) {
  planoMudou();
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  r.itens[idx].f = foodId;
  // O corte é pela NATUREZA da marca, não por uma lista:
  //
  // - `arroz` diz QUAL ALIMENTO o item é — é onde o ajuste calórico aterra
  //   (`arrozAtual`, `aplicaArroz`). A troca torna a marca falsa: sem isto,
  //   trocar o arroz do almoço por cuscuz movia a alavanca do ajuste para algo
  //   que não é arroz, em silêncio, e a tela passava a chamar de arroz o que
  //   não é. Então ela CAI.
  // - `alta` diz QUANDO o item aparece (só em dia de alta demanda). Descreve o
  //   lugar no plano, e o lugar não mudou com a troca. Então ela FICA.
  //
  // `caf` (fonte de cafeína, que `refeicoesDeHoje` corta quando o pré cai na
  // tarde) é da mesma natureza de `arroz` — diz qual alimento é —, mas o dono
  // não a decidiu e ela não entra em nenhuma tela: `refeicaoParaEditar` não a
  // devolve. Fica como está, de propósito, até haver decisão.
  //
  // A marca cai DEVOLVENDO: o que o ajuste tinha somado a este item volta com
  // ela. Sem isso o alimento trocado ficava com os gramas para sempre — o
  // desfazer não passa mais por um item sem marca —, e o número é do dono.
  tiraMarcaDeArroz(r.itens[idx]);
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
  planoMudou();
  const alvo = id || idAlimento(campos.n);
  const base = ALIMENTOS_BASE[alvo];
  S.comida.alimentos[alvo] = Object.assign(
    {}, S.comida.alimentos[alvo] || {}, campos,
    base ? {} : { meu: 1 }
  );
  delete S.comida.ocultos[alvo];

  // Cadastrado a partir da busca de uma refeição? Então ele já ENTRA nela: a
  // folha trouxe para onde ia (`para`), e sem isso cadastrar deixava o alimento
  // criado e posto em lugar nenhum — quem pediu "trocar" ainda tinha que achar
  // na lista o que acabou de digitar.
  const topo = pilha()[pilha().length - 1];
  const para = !id && topo && topo.k === 'editaAlimento' ? topo.para : null;
  if (para) {
    const r = achaRefeicao(para.ref);
    // Sem fechar aqui: esta folha tomou o lugar da busca, e são elas que fecham
    // a folha de onde a escolha veio.
    if (para.idx == null) CTX.adicionaItem(para.ref, alvo);
    else CTX.trocaItem(para.ref, para.idx, alvo);
    toast('Alimento cadastrado e posto em ' + (r ? r.n : 'refeição') + '.');
    return alvo;
  }

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
    // Ácido fica: "em dia" é FEITO — o estado do que já subiu —, não uma
    // comparação com antes.
    cor: sync.erro ? 'ins-amber' : (sync.sujo || !quando) ? '' : 'ins-acid'
  };
};

CTX.nuvemCampo = function (k, v) {
  view.nuvemForm = Object.assign({}, view.nuvemForm, { [k]: v });
  view.nuvemErro = null;
  render();
};

/**
 * A sessão de login que expirou (a D, `prescricao.html`, estado 11). Sem rede a
 * sincronia falha em silêncio, de propósito — o subsolo é o lugar normal de uso.
 * Login expirado NÃO é sem rede, e virar uma coisa só seria mentir: o que ele
 * registra continua gravado no aparelho, e o que falta é a réplica.
 */
CTX.loginExpirou = function () {
  if (!sync.expirou || NUVEM.sessao()) return null;
  return {
    texto: 'O que você registra continua gravado neste aparelho. Só não vai para a cópia remota, e os outros aparelhos não veem o que mudou aqui.',
    esperando: sync.sujo ? 'Há mudanças deste aparelho esperando subir.' : null,
    ultima: sync.em ? 'Última sincronização: ' + (sameDay(sync.em, Date.now()) ? 'hoje' : fmtDate(sync.em)) + ', ' + fmtHoraDita(sync.em) + '.' : null
  };
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
  sync.v = null; sync.sujo = true; sync.expirou = 0;
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
      plural(S.body.cintura.length, 'medida de cintura', 'medidas de cintura'),
      // As LEITURAS de bioimpedância, e não as medidas: as cinco entram com o
      // mesmo instante e são UMA leitura — contá-las em cinco diria que ele tem
      // cinco vezes mais do que tem. O `bioPeso` é a obrigatória que sempre
      // existe quando a leitura existe, então a série dele é a contagem.
      //
      // Esta linha faltava, e o caso de `corpo.test.js` previu o momento: "o
      // resumo diz ao dono o tamanho do que ele tem a perder, e a partir daqui
      // ele pode ter leituras de bioimpedância que o resumo ignora". Enquanto a
      // bioimpedância não tinha tela, a omissão era coerente; com a tela, é
      // omissão real sobre o que se perde num apagamento.
      plural(S.body.bioPeso.length, 'leitura de bioimpedância', 'leituras de bioimpedância')
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
  const hojeCardio = cardioDoDia(Date.now());
  return {
    sessao: s && !s.retro ? {
      relogio: relogioTexto(s),
      pausada: !!s.pausadoEm,
      desde: s.pausadoEm ? 'pausado' : 'desde ' + fmtHora(s.inicio)
    } : null,
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
        acao: 'Registrar ' + f.min + ' min de ' + f.m
      };
    })()
  };
};

CTX.abreSessaoDoDia = function (a) {
  if (!a) return;
  if (a.k === 'sessao') { abrirSessao(a.t); return; }
  abrirAdicionar(a.t);
};

CTX.cardioSet = function (k, v) { cardioSet(k, v); };
CTX.addCardio = function () { addCardio(); };

// ---------- o MÊS em Dias (a D, `dias.html`, estado 1) ----------
//
// O mês é a entrada, e o dia é o lugar. Cada célula diz o que o dia teve por
// forma e palavra — a letra do treino, "aula", "fora", "desc.", o coração do
// cardio, a barra da comida — e um toque abre o dia. Dia sem nada fica sem
// nada: o domingo não vira descanso sozinho, e a segunda sem registro não vira
// treino. Embaixo, três leituras do mês, e só estas.
//
// Saíram daqui, pelo desenho: a faixa da semana (o mês já mostra a semana), o
// quadro de dias, tempo e volume (volume é leitura de Semana), a marca de
// período nas células (o horário de início diz quando ele treina, com os
// pontos à vista) e a lista de sessões, dos dias de comida e dos cardios — que
// moram agora no dia aberto.

const DIA_MS = 86400000;
function maiuscula(x) { return x ? x.charAt(0).toUpperCase() + x.slice(1) : x; }
/** "7h56", de minutos desde a meia-noite */
function horaDeMinutos(min) { const m = Math.round(min); return Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0'); }
/** "4,75", "4,5", "5": a média em quartos, sem casa vazia */
function numeroCurto(v) { return String(Math.round(v * 100) / 100).replace('.', ','); }

/** O que um registro de treino é, em palavra curta: a letra, "aula" ou "fora". */
function letraDoRegistro(m) { return m.livre ? 'fora' : diaAberto(m.day) ? 'aula' : m.day; }

CTX.mes = function () {
  const ref = mesRef();
  const ano = ref.getFullYear(), mesN = ref.getMonth();
  const ini = new Date(ano, mesN, 1).getTime();
  const fim = new Date(ano, mesN + 1, 1).getTime();
  const nDias = new Date(ano, mesN + 1, 0).getDate();
  const agora = Date.now();
  const ontem = _inicioDoDia(agora) - 1;
  const corrente = !view.mes;
  // as leituras vão até ONTEM no mês corrente: hoje ainda está acontecendo, e é do Agora
  const ate = Math.min(fim - 1, ontem);
  const porData = {};
  (Array.isArray(S.comidaHist) ? S.comidaHist : []).forEach(function (h) { if (h && h.d) porData[h.d] = h; });

  const celulas = [];
  for (let i = 1; i <= nDias; i++) {
    const dia = new Date(ano, mesN, i, 12).getTime();
    const hoje = sameDay(dia, agora);
    const futuro = !hoje && dia > agora;
    const marcas = futuro ? [] : sessoesDoDia(dia).slice().sort(function (a, b) { return a.t - b.t; });
    const letras = marcas.filter(function (m) { return !m.livre; }).map(letraDoRegistro);
    const fora = marcas.some(function (m) { return m.livre; });
    const desc = !marcas.length && !futuro && ehDescanso(dia);
    const cardio = futuro ? 0 : cardioDoDia(dia).length;
    const h = porData[hojeISO(dia)];
    const comida = futuro || hoje ? null : (h && diaInterpretavel(h) ? 'com' : 'sem');
    const partes = [];
    marcas.forEach(function (m) {
      partes.push(m.livre ? 'treino fora da prescrição' : diaAberto(m.day) ? 'aula' : 'treino ' + m.day);
    });
    const desc0 = partes.length > 1 ? [partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]] : partes;
    const ditos = desc0.slice();
    if (desc) ditos.push('descanso marcado');
    if (cardio) ditos.push(cardio === 1 ? 'cardio' : cardio + ' cardios');
    if (comida) ditos.push(comida === 'com' ? 'comida com marca' : 'comida sem marca');
    if (hoje) ditos.push('hoje: abre o Agora');
    const d = new Date(dia);
    celulas.push({
      n: i, iso: hojeISO(dia), hoje: hoje, futuro: futuro,
      principal: letras.length ? letras.join(' ') : fora ? 'fora' : desc ? 'desc.' : '',
      extra: letras.length && fora ? '+fora' : null,
      descanso: desc, cardio: cardio, comida: comida,
      rotulo: DIAS_LONGOS[d.getDay()] + ', ' + i + ' de ' + MESES[mesN] + (ditos.length ? ': ' + ditos.join(', ') : ''),
      abre: hoje ? 'agora' : futuro ? null : dia
    });
  }

  // As três leituras, cada uma com a conta à vista.
  const L = ate >= ini ? _leituraDosDias(S.done, ate) : null;
  const cardMes = S.cardio.filter(function (c) { return c.t >= ini && c.t <= ate; });
  const ins = _iniciosDoPeriodo(S.done, ini, ate, temHora, function (x) { return diaAberto(x.day); });
  const n = ins.inicios.length;
  const media = n ? ins.inicios.reduce(function (a, x) { return a + x.min; }, 0) / n : null;
  const fora = [];
  if (ins.aulasSemHora) fora.push(ins.aulasSemHora === 1 ? 'a aula, sem hora de início' : 'as ' + ins.aulasSemHora + ' aulas, sem hora de início');
  if (ins.semHora) fora.push(ins.semHora === 1 ? 'o treino registrado sem hora' : 'os ' + ins.semHora + ' treinos registrados sem hora');
  if (ins.fora) fora.push(ins.fora === 1 ? 'o treino fora da prescrição' : 'os ' + ins.fora + ' treinos fora da prescrição');
  const diaCurto = function (t) { return DIAS_CURTOS[new Date(t).getDay()] + ' ' + fmtDate(t); };
  const temAlgo = S.done.length > 0 || S.cardio.length > 0 ||
    (Array.isArray(S.comidaHist) && S.comidaHist.some(diaInterpretavel));

  return {
    titulo: MESES[mesN] + ' de ' + ano + (corrente && ate >= ini ? ' · até ontem, ' + fmtDate(ontem) : ''),
    anterior: maiuscula(MESES[(mesN + 11) % 12]),
    proximo: maiuscula(MESES[(mesN + 1) % 12]),
    podeAvancar: view.mes < 0,
    offset: new Date(ini).getDay(),
    dias: DIAS_CURTOS,
    celulas: celulas,
    vazio: !temAlgo,
    treino: L
      ? (L.porSemana != null
          ? { valor: numeroCurto(L.porSemana),
              conta: L.dias + ' dias com treino nos últimos 28, divididos por 4. Dois treinos no mesmo dia contam um dia. Descanso não conta.',
              serie: _serieDaMediaMovel(S.done, ini, ate), prescricao: rot().length,
              de: fmtDate(ini), ate: fmtDate(ate) }
          : { valor: null,
              conta: L.dias + (L.dias === 1 ? ' dia com treino em ' : ' dias com treino em ') + L.janela +
                     '. A média usa as últimas 4 semanas, e ainda não há 4.' })
      : null,
    cardio: { titulo: 'Cardio em ' + MESES[mesN], n: cardMes.length,
              min: cardMes.reduce(function (a, c) { return a + c.min; }, 0),
              so: cardMes.filter(function (c) { return sessoesDoDia(c.t).length === 0; }).length },
    horario: n ? {
      media: horaDeMinutos(media),
      cedo: horaDeMinutos(ins.inicios[0].min), cedoDia: diaCurto(ins.inicios[0].t),
      tarde: horaDeMinutos(ins.inicios[n - 1].min), tardeDia: diaCurto(ins.inicios[n - 1].t),
      pontos: ins.inicios.map(function (x) { return x.min; }), mediaMin: media,
      nota: n + (n === 1 ? ' sessão com hora.' : ' sessões com hora.') +
            (fora.length ? ' Não entram ' + fora.join(', nem ') + '.' : '')
    } : null
  };
};

// ---------- o DIA aberto (a D, `dias.html`, estados 2, 5 e 9) ----------
//
// Os registros vêm primeiro, cada um numa linha que abre. A comida aparece num
// olhar: os momentos do plano, cada um com a forma do seu estado. Quando algo
// destoa, o app aponta e não corrige: dois cardios iguais no mesmo dia ficam
// lado a lado, o segundo dizendo "igual ao das 7h35", e nada sai sem ele.
CTX.abreDia = function (t) {
  if (t === 'agora') { CTX.vaiPara('agora'); return; }
  view.diaAberto = t; view.cardioAberto = null; entraNoDestino('dia'); render();
};
CTX.fechaDia = function () { view.diaAberto = null; view.cardioAberto = null; render(); saiDoDestino('dia'); };
CTX.abreCardioDoDia = function (t) { view.cardioAberto = view.cardioAberto === t ? null : t; render(); };
CTX.alternaDescansoDoDia = function (t) { return alternaDescanso(t); };

CTX.diaAberto = function () {
  const t = view.diaAberto;
  if (!t) return null;
  const d = new Date(t);
  const iso = hojeISO(t);
  const marcas = sessoesDoDia(t).slice().sort(function (a, b) { return a.t - b.t; });
  const cardios = cardioDoDia(t).slice().sort(function (a, b) { return a.t - b.t; });
  const desc = !marcas.length && ehDescanso(t);

  const sessoes = marcas.map(function (m) {
    const feitas = m.livre ? 0 : Object.keys(S.logs).reduce(function (n, k) {
      return n + (S.logs[k] || []).filter(function (e) { return e.sid === m.sid; })
        .reduce(function (x, e) { return x + e.sets.filter(Boolean).length; }, 0);
    }, 0);
    const P = !m.livre && treino(m.day);
    const prescritas = P ? P.ex.reduce(function (n, ex) { return n + ex.s; }, 0) : 0;
    const hora = temHora(m) ? fmtHoraDita(m.t) : null;
    const fim = hora && m.dur ? fmtHoraDita(m.t + m.dur + (m.pausado || 0)) : null;
    const detalhe = m.livre
      ? [(m.grupos || []).join(', ') || null, m.dur ? fmtDur(m.dur) : null].filter(Boolean)
      : [hora ? hora + (fim ? ' → ' + fim : '') : 'sem hora',
         m.dur && m.fim !== 'manual' ? 'fechou sem você' : null,
         prescritas ? feitas + ' de ' + prescritas + ' séries' : (feitas ? feitas + ' séries' : null)].filter(Boolean);
    return {
      k: 'sessao', t: m.t, letra: letraDoRegistro(m),
      titulo: m.livre ? (m.nome || 'Treino fora da prescrição') : diaAberto(m.day) ? 'Aula' : 'Treino ' + m.day,
      detalhe: detalhe.join(' · ')
    };
  });
  const listaCardio = cardios.map(function (c, i) {
    const igual = cardios.slice(0, i).filter(function (o) { return o.m === c.m && o.min === c.min && o.i === c.i; })[0];
    const depois = marcas.some(function (m) { return !m.livre && temHora(m) && m.t < c.t; });
    return {
      k: 'cardio', t: c.t,
      titulo: 'Cardio · ' + c.min + ' min de ' + c.m,
      detalhe: [c.i, fmtHoraDita(c.t) + (depois ? ', depois do treino' : '')].filter(Boolean).join(' · ') +
               (igual ? ' · igual ao das ' + fmtHoraDita(igual.t) : ''),
      igual: !!igual,
      aberto: view.cardioAberto === c.t,
      // aberto, o registro inteiro: cada campo corrigível no toque
      campos: view.cardioAberto === c.t ? {
        modais: MODAIS.map(function (x) { return { k: x, t: x, on: c.m === x }; }),
        minutos: [20, 25, 30, 40].concat([20, 25, 30, 40].indexOf(c.min) < 0 ? [c.min] : [])
          .sort(function (a, b) { return a - b; }).map(function (v) { return { k: v, t: v + ' min', on: c.min === v }; }),
        intensidades: ['leve', 'moderado'].map(function (v) { return { k: v, t: v, on: c.i === v }; })
      } : null
    };
  });

  // a comida do dia: a verdade do registro, nunca a sugestão da folha
  const passado = iso < hojeISO();
  const folha = passado ? CTX.poeODiaEmDia(iso) : null;
  const h = (Array.isArray(S.comidaHist) ? S.comidaHist : []).filter(function (x) { return x.d === iso; })[0] || null;
  const momentos = folha ? folha.linhas.map(function (l) {
    return { id: l.id, nome: l.nome, hora: l.hora.replace(/^0(\d)/, '$1').replace(':', 'h'), marca: l.sugerida || l.marca === 'vazia' ? 'sem' : l.marca };
  }) : [];
  const comMarca = momentos.filter(function (x) { return x.marca !== 'sem'; }).length;
  const conta = h && diaInterpretavel(h);

  return {
    titulo: DIAS_LONGOS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()],
    volta: 'Voltar para ' + MESES[d.getMonth()],
    procedencia: marcas.length ? 'dia de treino, pela sessão registrada'
               : desc ? 'descanso, marcado por você' : 'nada registrado',
    registros: sessoes.concat(listaCardio).sort(function (a, b) { return a.t - b.t; }),
    vazio: !marcas.length && !desc && !cardios.length,
    descanso: desc,
    // "marcado agora, às 21h22 · não conta como treino em nenhuma conta" (estado 9)
    descansoDetalhe: desc ? (function () {
      const tm = S.descanso[iso];
      const quando = typeof tm === 'number' && tm > 1
        ? 'marcado ' + (sameDay(tm, Date.now()) ? 'hoje' : 'em ' + fmtDate(tm)) + ', às ' + fmtHoraDita(tm) + ' · ' : '';
      return quando + 'não conta como treino em nenhuma conta';
    })() : null,
    // o palpite do dia vazio, dito como palpite (estado 5)
    palpite: !marcas.length && !desc
      ? 'Pelo padrão semanal, ' + DIAS_LONGOS[d.getDay()] + ' é dia de ' +
        (cadenciaDaSemana()[d.getDay()] === 'treino' ? 'treino' : 'descanso') + ' — é palpite.'
      : null,
    // um dia com treino não aceita a marca de descanso, e diz por quê (F156)
    podeDescanso: !marcas.length,
    data: iso,
    comida: passado ? {
      resumo: !momentos.length ? null : comMarca === 0 ? 'nenhuma com marca' : comMarca + ' de ' + momentos.length + ' com marca',
      momentos: momentos,
      agua: h ? (h.aguaNaoContada ? 'não contei' : h.agua + (h.agua === 1 ? ' copo' : ' copos')) : 'não contei',
      regra: conta ? 'Conta para a regra dos 14 dias, porque tem refeição marcada.'
                   : 'Sem marca, o dia não conta para a regra: é desconhecido, não zero.',
      plano: folha ? 'Plano ' + (h && h.cadencia === 'treino' ? 'de dia de treino' : h && h.cadencia === 'descanso' ? 'de descanso' : 'do dia') +
                     ', ' + folha.plano + '. É referência — o plano mora em Prescrição.' : null
    } : null
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
  // o aproximado e o início marcado moram nas linhas de começo e fim
  if (m.pausado) notas.push(fmtDur(m.pausado) + ' de pausa, fora da conta.');

  const hIni = horaDaSessao(m), hFim = aberta ? null : fimDaSessao(m);

  // A correção não é oferecida no treino em andamento: o tempo dele ainda está
  // correndo, e escrever por cima seria discutir com o relógio.
  const corrigivel = !aberta;
  // ---- a sessão como foi (a D, `dias.html`, estado 3) ----
  const P = treino(m.day);
  const naSessao = function (k, e) {
    return m.sid != null ? e.sid === m.sid
      : (sameDay(e.t, m.t) && e.sid == null && P && P.ex.some(function (ex) { return ex.id === k || ex.id === e.sl; }));
  };
  const registros = [];
  Object.keys(S.logs).forEach(function (k) {
    (S.logs[k] || []).forEach(function (e) { if (naSessao(k, e)) registros.push({ idEx: k, e: e }); });
  });
  const posicao = function (r) {
    const i = P ? P.ex.findIndex(function (ex) { return ex.id === r.idEx || ex.id === r.e.sl || ex.orig === r.idEx; }) : -1;
    return i < 0 ? 1000 + r.e.t / 1e13 : i;
  };
  registros.sort(function (a, b) { return posicao(a) - posicao(b); });
  const pa = view.passada;
  const linhaDe = function (idEx, e, ex) {
    const chave = chaveDeLog(idEx, e);
    const prescritas = ex ? ex.s : 0;
    const n = Math.max(e.sets.length, prescritas);
    const series = [];
    for (let k = 0; k < n; k++) {
      const s = e.sets[k];
      const aberta = !!(pa && pa.idEx === idEx && pa.chave === chave && pa.k === k);
      series.push(s
        ? { k: k, texto: e.u ? textoDaSerie(s, e.u, e.q) : textoDaSerieDaPassada(idEx, s),
            rir: s[2] != null ? 'RIR ' + s[2] : null, editavel: !e.u, aberta: aberta }
        : { k: k, nao: true, lanca: !e.u, aberta: aberta });
    }
    let editor = null;
    const s = pa && !pa.novo && pa.idEx === idEx && pa.chave === chave ? e.sets[pa.k] : null;
    if (pa && pa.novo && pa.idEx === idEx && pa.chave === chave) editor = editorDoNovo(idEx, ex);
    if (s) {
      const fx = faixaDoTexto(ex ? ex.r : null);
      const reg = regua(pa.era[1], fx);
      const un = CARGAS[cargaTipo(idEx, ex || exDe(idEx))].rot;
      const tc = view.teclado && view.teclado.alvo.tipo === 'passada' ? view.teclado : null;
      editor = {
        titulo: 'Série ' + (pa.k + 1),
        guardada: 'guardada: ' + textoDaSerieDaPassada(idEx, pa.era),
        carga: s[0] != null && s[0] !== '' ? fmtNum(s[0]).replace('.', ',') : '–',
        un: un,
        faixa: fx ? 'repetições · faixa ' + ex.r : 'repetições',
        regua: { slots: pagina(reg, pa.foco != null ? pa.foco : s[1]), valor: s[1], marca: 'era',
                 tocado: pa.tocado && pa.tocado.k === 'reps' ? pa.tocado.v : null },
        gravado: pa.gravado,
        falhou: pa.tocado ? 'Não foi gravado: o aparelho recusou. A série continua ' + textoDaSerieDaPassada(idEx, s) + ', que é o que está guardado.' : null,
        rir: { texto: s[2] != null ? 'RIR: ' + s[2] + ' · mudar' : 'RIR: nenhum · marcar', aberto: pa.rir,
               escala: RIR_ESCALA.map(function (v) { return { v: v, on: s[2] === v }; }) },
        teclado: tc ? { texto: tc.texto, unidade: un } : null
      };
    }
    return {
      idEx: idEx, chave: chave, nome: exDe(idEx).n,
      presc: ex ? ex.s + ' × ' + ex.r + (ex.rir ? ' · RIR ' + ex.rir : '') : 'fora do treino',
      series: series, editor: editor,
      nota: (e.dor && e.dor.length ? 'dor em ' + e.dor.map(dorName).join(' e ') : '') + (e.obs ? (e.dor && e.dor.length ? ' · ' : '') + e.obs : '') || null
    };
  };
  const feitos = {};
  const exercicios = registros.map(function (r) {
    const ex = P ? P.ex.filter(function (x) { return x.id === r.idEx || x.id === r.e.sl || x.orig === r.idEx; })[0] : null;
    if (ex) feitos[ex.id] = 1;
    return linhaDe(r.idEx, r.e, ex);
  });
  // o que estava prescrito e não tem registro nenhum: "não feito", e isso não
  // é falha nem pendência (P2) — fica na posição dele, sem cor de alarme
  if (P && !aberta) P.ex.forEach(function (ex, i) {
    if (feitos[ex.id]) return;
    const series = [];
    for (let k = 0; k < ex.s; k++) {
      series.push({ k: k, nao: true, lanca: !ex.u,
                    aberta: !!(pa && pa.novo && pa.idEx === ex.id && pa.chave == null && pa.k === k) });
    }
    exercicios.splice(Math.min(i, exercicios.length), 0,
      { idEx: ex.id, chave: null, nome: ex.n, presc: ex.s + ' × ' + ex.r + (ex.rir ? ' · RIR ' + ex.rir : ''), series: series,
        editor: pa && pa.novo && pa.idEx === ex.id && pa.chave == null ? editorDoNovo(ex.id, ex) : null, nota: null });
  });

  const fimT = !aberta && hFim ? m.t + m.dur + (m.pausado || 0) : null;
  const cab = {
    titulo: diaAberto(m.day) ? 'Aula' : 'Treino ' + m.day,
    meta: [diaAberto(m.day) ? 'aula' : 'da sequência', DIAS_LONGOS[new Date(m.t).getDay()] + ', ' + fmtDate(m.t),
           P && P.tag ? P.tag : null].filter(Boolean).join(' · ')
  };
  const comeco = hIni
    ? { hora: fmtHoraDita(m.t), nota: m.ini === 'manual' ? 'marcado antes do aquecimento' : null }
    : { hora: 'sem hora', nota: 'registrado depois, sem a hora de início' };
  const fim = aberta ? null : fimT
    ? { hora: fmtHoraDita(fimT), aprox: !exato,
        nota: (exato ? 'declarado por você' : 'aproximado: fechou sem você, na última série') + ' · ' + fmtDur(dur) }
    : { hora: dur != null ? fmtDur(dur) : 'não medido', aprox: false,
        nota: dur != null ? (exato ? 'duração declarada por você' : 'duração aproximada') : 'a duração não foi medida' };

  return {
    livre: false,
    t: m.t,
    cab: cab, comeco: comeco, fim: fim, exercicios: exercicios,
    corrigindoTempo: view.corrigeTempo === m.t,
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
      { k: 'v', rotulo: 'volume', valor: R.vol ? fmtInt(R.vol) : '–', unidade: 'kg×reps' },
      // Recorde é a comparação favorável mais pura que existe aqui, e pintá-lo
      // de ácido era o app dizendo "você foi bem" por cor. O número basta.
      { k: 'r', rotulo: recordes === 1 ? 'recorde' : 'recordes', valor: String(recordes) }
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
      else if (x.recMet) marcas.push('recorde de ' + (x.ritmo ? 'ritmo' : x.seg ? 'tempo' : 'volume'));
      if (x.novo) marcas.push('primeira vez');
      if (x.fora) marcas.push('fora do treino');
      return {
        nome: x.nome,
        delta: x.delta === null ? null : (x.delta > 0 ? '+' : '') + x.delta + '%',
      // Ácido não pinta comparação favorável: "melhor que antes" é elogio, e o
      // app não comemora. O sinal que sobra é o âmbar, que pede atenção.
        deltaCor: '',
        series: x.sets.map(function (y) {
          if (!y) return null;
          return x.seg ? textoDaSerie(y, x.un, x.q) : fmtCarga(y[0]) + '×' + y[1];
        }),
        meta: x.ritmo
          ? fmtDec(x.met * (ESCALA_RITMO[x.un] || { fator: 1 }).fator) + ' ' +
            (ESCALA_RITMO[x.un] || { rot: 's' }).rot
          : fmtInt(x.met) + ' ' + (x.seg ? 'seg' : 'vol'),
        marcas: marcas,
        nota: x.dor.length ? 'dor em ' + x.dor.map(dorName).join(' e ') : null
      };
    })
  };
};
CTX.fechaSessao = function () { fecharSessao(); };
CTX.abreSerieDaPassada = function (idEx, chave, k) { abreSerieDaPassada(idEx, chave, k); };
CTX.repsDaPassada = function (v) { return repsDaPassada(v); };
CTX.andaReguaDaPassada = function (dir) { andaReguaDaPassada(dir); };
CTX.rirDaPassada = function (v) { return rirDaPassada(v); };
CTX.abreCargaDaPassada = function () { abreCargaDaPassada(); };
CTX.apagaSerieDaPassada = function () { return apagaSerieDaPassada(); };
CTX.abreCorrecaoDoTempo = function (t) { abreCorrecaoDoTempo(t); };
CTX.editaSessao = function (t) { return apagaRegistroDeTreino(t); };
CTX.corrigeDuracao = function (t, min) { corrigeDuracao(t, min); };
/* Uma porta só, e aqui: `corrigeDuracao` já mora em `CTX`, e as duas são as
   duas metades da mesma resposta. Pôr esta também na tabela de verbos nus daria
   dois caminhos para o mesmo verbo, que é o que a superfície existe para não
   ter. */
CTX.confirmaDuracao = function (t) { confirmaDuracao(t); };

// ---------- tela cheia: histórico do exercício ----------
CTX.renomeiaExercicio = function (idEx, nome) { renomeiaExercicio(idEx, nome); };

CTX.historico = function () {
  const d = view.hist.day, i = view.hist.i;
  const P = treino(d);
  const ex = P.ex[i];
  const vars = variantsOf(d, i);
  const sel = view.hist.key || id(d, i);
  const tipo = cargaTipo(sel, ex);
  const H = (S.logs[sel] || []).slice(-6);
  const base = (S.logs[sel] || []).length - H.length;

  // A grandeza vem do registro antes de vir do catálogo: o catálogo muda, e o
  // que foi feito não muda com ele.
  const un = (H[0] && H[0].u) || unidadeDe(ex) || null;
  const seg = !!un;
  const ritmo = cronometrado(un) && H.some(function (x) { return ritmoDe(x) != null; });
  const esc = ESCALA_RITMO[un] || { fator: 1, rot: 's' };
  const corpo = !seg && tipo === 'corpo';
  const rotCarga = seg ? 'kg' : CARGAS[tipo].rot;
  const met = ritmo
    ? function (l) { const r = ritmoDe(l); return r == null ? 0 : r * esc.fator; }
    : seg ? tutOf : (corpo ? repsOf : volOf);
  // Onde o resultado é o relógio, cair é melhorar. É o único lugar do app em
  // que o sinal do delta não basta para saber se foi bom.
  const bom = function (delta) { return delta == null ? false : (ritmo ? delta < 0 : delta > 0); };

  const marcas = [];
  // "isolador" num remo de 1000 m é linguagem de hipertrofia aplicada a
  // condicionamento — o mesmo erro que fazia o sábado inteiro parecer o que
  // não é. Onde há grandeza própria, a marca que vale é a grandeza.
  if (seg) marcas.push({ k: 'c', t: ROTULO_UNIDADE[un], cls: '' });
  else marcas.push({ k: 'c', t: ex.c ? 'composto' : 'isolador', cls: ex.c ? 'comp' : '' });
  marcas.push({ k: 'car', t: CARGAS[tipo].nome, cls: '' });
  if (sel !== id(d, i)) marcas.push({ k: 'sub', t: 'substituto', cls: 'swap-t' });

  const cab = {
    dia: d,
    olho: 'treino ' + d + ' · exercício ' + String(i + 1).padStart(2, '0'),
    meta: H.length + ' de 6 sessões',
    titulo: nomeEx(sel),
    // Renomear vive AQUI porque esta tela é sobre um exercício só, e o título
    // dela é o próprio nome. No cartão do treino seria uma quinta ação no meio
    // da série; aqui é o que se faz olhando para o histórico dele.
    renome: {
      id: sel,
      nome: nomeEx(sel),
      // o nome do código, quando existe e está sobrescrito: é a volta possível
      doCodigo: (S.ex[sel] && S.ex[sel].n && nomeDoCodigo(sel) !== nomeEx(sel))
        ? nomeDoCodigo(sel) : null
    },
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
    stats: (ritmo
      ? [{ k: 'a', rotulo: 'ritmo', valor: fmtDec(met(last)), unidade: esc.rot },
         { k: 'b', rotulo: 'trabalho', unidade: ROTULO_UNIDADE[un],
           valor: fmtInt((last.q || 0) * last.sets.filter(Boolean).length) }]
      : seg
      ? [{ k: 'a', rotulo: 'tempo da última', valor: fmtInt(tutOf(last)), unidade: 'seg' },
         { k: 'b', rotulo: 'média por série', unidade: 'seg',
           valor: fmtInt(Math.round(tutOf(last) / Math.max(last.sets.filter(Boolean).length, 1))) }]
      : corpo
      ? [{ k: 'a', rotulo: 'repetições na última', valor: fmtInt(repsOf(last)) },
         { k: 'b', rotulo: 'carga somada', valor: maxLoad(last) ? fmtCarga(maxLoad(last)) : '–', unidade: 'kg' }]
      : [{ k: 'a', rotulo: 'carga atual', valor: fmtCarga(maxLoad(last)), unidade: rotCarga },
         { k: 'b', rotulo: 'volume da última', valor: fmtInt(volOf(last)) }]
    ).concat([{
      k: 'd',
      rotulo: (ritmo ? 'ritmo' : seg ? 'tempo' : corpo ? 'repetições' : 'volume') + ' no período',
      valor: dv === null ? '–' : (dv > 0 ? '+' : '') + dv + '%'
    }]),
    // O gráfico continua sendo SVG gerado: é desenho, não estrutura, e não
    // carrega nenhum handler. Entra por markup e sai daqui inteiro.
    svg: chartSVG(H, ritmo ? 'ritmo' : seg ? 'seg' : (corpo ? 'corpo' : null), rotCarga, un),
    legenda: [
      { k: 'c', t: ritmo ? 'ritmo · ' + esc.rot + ' · menor é melhor'
                 : seg ? 'tempo total sob tensão'
                 : corpo ? 'repetições da sessão' : 'carga máxima da sessão' },
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
        valor: ritmo ? fmtDec(v) : fmtInt(v),
        unidade: ritmo ? esc.rot : seg ? 'seg no total' : 'kg×reps',
        deload: !!s.dl,
        delta: delta === null ? null : (delta > 0 ? '+' : '') + delta + '%',
      // Ácido não pinta comparação favorável: "melhor que antes" é elogio, e o
      // app não comemora. O sinal que sobra é o âmbar, que pede atenção.
        deltaCor: '',
        series: s.sets.map(function (x) {
          if (!x) return null;
          return seg ? textoDaSerie(x, s.u, s.q)
                     : (corpo && !x[0] ? x[1] + ' reps' : fmtCarga(x[0]) + '×' + x[1]);
        }),
        reps: (seg || corpo) ? null : repsOf(s) + ' reps',
        anilhas: (!seg && CARGAS[tipo].dobra && maxLoad(s))
          ? fmtCarga(totalAnilhas(maxLoad(s), CARGAS[tipo].barra)) + ' kg ' + CARGAS[tipo].total : null,
        dor: s.dor && s.dor.length ? 'dor em ' + s.dor.map(dorName).join(' e ') : null,
        rir: s.rir ? 'última série a ' + s.rir + ' da falha' : null,
        obs: s.obs || null,
        editando: view.edit === base + k,
        edicao: view.edit === base + k ? {
          // §8.4: "Esta série é de 21/09. Corrigir não reabre aquele treino." —
          // aqui a correção é da sessão inteira, e a frase diz sessão.
          outroDia: sameDay(s.t, Date.now()) ? null : fmtDate(s.t),
          sets: s.sets.map(function (x) {
            return { carga: x ? fmtCarga(x[0]) : '', reps: x ? String(x[1]) : '' };
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
/**
 * A lista das mudanças do dia que esperam decisão — e que vencem.
 *
 * É a peça 2 da ordem que o plano amarrou (§6.3 da frente 1): a conta de volume
 * sai de `main.jsx` para o domínio (feito), **esta lista passa a ser a
 * chamadora dela**, e só então a tela de decisão sai. Fora dessa ordem a conta
 * desaparece entre uma coisa e outra, que é o que o §3.6 do plano avisa.
 *
 * Cada linha diz as quatro coisas do passo 3 do fluxo: o que mudou, de que
 * sessão veio, **quando vence** e **a conta de volume se virar permanente**. A
 * conta é por mudança e na forma de TRANSIÇÃO — "o posterior passa de 7 para 8
 * contra 7 prescritas" —, que é a forma que o dono pediu e a única que
 * `impactoDoMod` produz; `impacto()` afirma o número de agora e não serve aqui.
 *
 * **De onde a conta começa a andar**, e é a única decisão deste invólucro: o
 * vencimento percorre os dias à frente e precisa saber que letra o PRÓXIMO
 * treino vai ter. Quando o dia de hoje já tem treino registrado ou sessão
 * aberta, a posição de hoje já foi gasta — a caminhada começa AMANHÃ, senão ela
 * daria a letra de hoje a um dia que já aconteceu e venceria tudo um dia cedo.
 */
/**
 * Responde UMA mudança da fila: ela virou permanente, ou foi só daquele dia.
 *
 * Por mudança e não por sessão, e é o que a frente 1 desenhou: cada linha diz o
 * que mudou e tem as duas respostas do tamanho do polegar ao lado. Uma sessão
 * pode ter subido uma série de lateral — que ele quer manter — e trocado o
 * agachamento porque a máquina estava ocupada — que ele não quer. Responder as
 * duas juntas forçaria a escolha errada numa das duas.
 *
 * O MOTIVO é opcional e é texto, porque ele está sentado quando decide isto
 * (§8.1, passo 3). Vai para o histórico do programa junto da mudança: é a
 * resposta de "mudei isso quando, e por quê?".
 *
 * Mudança respondida sai da lista da sessão; esvaziada a lista, a sessão sai da
 * fila DEIXANDO LÁPIDE, para a fusão não a ressuscitar do outro aparelho — a
 * mesma disciplina das outras coleções com chave natural (§8.1, passo 6).
 *
 * "Foi só daquele dia" NÃO desfaz nada: a sessão onde a mudança aconteceu
 * continua com o que foi registrado. O que ela decide é o PROGRAMA, e o
 * programa é o que vem depois.
 */
CTX.respondeMudanca = async function (sid, i, permanente, motivo) {
  if (!Array.isArray(S.promoPendente)) S.promoPendente = listaDePromo(S.promoPendente);
  const chave = chaveDePromo({ sid: sid, t: sid });
  const g = S.promoPendente.filter(function (x) { return chaveDePromo(x) === chave; })[0];
  if (!g || !Array.isArray(g.mods)) return;
  const m = g.mods[i];
  if (!m) return;

  const n = permanente ? aplicaAoOficial(g.day, [m], motivo || null) : 0;

  g.mods = g.mods.filter(function (_, j) { return j !== i; });
  if (Array.isArray(g.resumoMods)) {
    g.resumoMods = g.resumoMods.filter(function (_, j) { return j !== i; });
  }
  g.m = Date.now();                    // carimbo: é ele que a fusão compara
  if (!g.mods.length) soltaPromo(sid);

  await save(); render();
  // "o oficial" era vocabulário interno (V7): o destino é o treino, com nome.
  toast(permanente
    ? (n ? 'Entrou no Treino ' + g.day + '.' : 'A posição não existe mais no programa.')
    : 'Ficou como só daquele dia. O treino registrado não muda.');
};

/**
 * A procedência do vazio da fila (a D, prescrição, estado 4): quando foi a
 * última mudança que entrou no programa. "Fica só naquele dia" não deixa
 * registro com data, então a frase fala só do que entrou.
 */
CTX.ultimaQueEntrou = function () {
  const log = Array.isArray(S.progLog) ? S.progLog : [];
  if (!log.length) return null;
  const t = Math.max.apply(null, log.map(function (x) { return x.t || 0; }));
  return t ? 'a última mudança que entrou no programa foi em ' + fmtDate(t) : null;
};

CTX.mudancasQueEsperam = function () {
  const fila = Array.isArray(S.promoPendente) ? S.promoPendente : [];
  if (!fila.length) return [];
  const proxima = proximoTreino(S, ROT_BASE);
  // Vence HOJE quando hoje é dia de treino, a sessão de hoje ainda não houve e
  // o treino de hoje é aquele — "na manhã do dia em que aquele treino volta".
  const h = diaResolvido();
  const hojeTreina = h.cadencia === 'treino' && h.origem !== 'registrado' && h.origem !== 'aberta';

  const r = rot();
  return fila.map(function (g) {
    const mods = Array.isArray(g.mods) ? g.mods : [];
    const nome = 'Treino ' + g.day;
    // As voltas daquele treino desde que a mudança nasceu, na ordem. A primeira
    // é o VENCIMENTO; a segunda fecha o desfazer (decisão 8). É fato no dado,
    // não conta sobre o relógio — e por isso não precisa de campo, de cron nem
    // de o app ter estado aberto no dia certo.
    const voltou = (S.done || []).filter(function (x) {
      return x && !x.livre && x.day === g.day && x.t > g.t;
    }).sort(function (a, b) { return a.t - b.t; });
    return {
      // a chave é a mesma da fila, para decidir e para a lápide depois
      sid: typeof g.sid === 'number' ? g.sid : g.t,
      dia: g.day,
      quando: g.t,
      // Em TREINOS, não em data (§5.3): a sequência anda pela ordem, não pelo
      // dia da semana, e uma data seria previsão do app dita como fato.
      vence: fraseDoVencimento(nome, r.indexOf(g.day), r.indexOf(proxima), r.length),
      venceHoje: hojeTreina && h.treino === g.day,
      venceu: venceuPorPosicao(g.day, g.t, S.done),
      // "Ficou como só daquele dia quando o Treino B voltou, em 29/09. A sessão
      // de 22/09 continua como foi registrada." — a mudança não some, e o
      // desfazer vale até a próxima vez daquele treino.
      venceuTxt: voltou.length
        ? 'Ficou como só daquele dia quando o ' + nome + ' voltou, em ' + fmtDate(voltou[0].t) +
          '. A sessão de ' + fmtDate(g.t) + ' continua como foi registrada.'
        : null,
      prazo: 'Dá para fazer entrar no ' + nome + ' até a próxima vez dele.',
      // Decisão 8: voltou DUAS vezes, o desfazer fechou e a linha sai da lista.
      // O dado fica — a fila não perde nada por isso, e o teto de 60 a contém.
      fechou: voltou.length >= 2,
      entra: 'Entra no ' + nome,
      mudancas: mods.map(function (m) {
        const imp = impactoDoMod(g.day, m);
        return {
          txt: textoMod(g.day, m),
          // a mudança ACRESCENTA séries: é sobre ela que a regra do treinador fala (F99)
          acrescenta: (m.k === 'sets' && m.para > m.de) || m.k === 'add',
          // "Se entrar no Treino D: deltoide lateral passa de 12 para 13 séries
          // na rotação." — o prefixo só na conta de volume: a da troca é outra
          // frase, sobre o tempo do exercício no programa.
          impacto: imp ? (imp.volume ? 'Se entrar no ' + nome + ': ' + imp.txt : imp.txt) : null,
          acima: !!(imp && imp.acima)
        };
      })
    };
  }).filter(function (g) { return !g.fechou; });
};

/**
 * "vence quando o Treino D voltar · faltam 4 treinos" — `voltas` é a frente 2
 * §9.3: quantos treinos passam antes de aquele voltar, pela ordem da rotação.
 * `null` quando o treino não está mais na rotação: sem posição, não há volta.
 */
function fraseDoVencimento(nome, ip, iq, n) {
  if (ip < 0 || iq < 0 || !n) return null;
  const voltas = (ip - iq + n) % n;
  if (voltas === 0) return 'vence na próxima vez do ' + nome + ' — que é a próxima sessão';
  return 'vence quando o ' + nome + ' voltar · ' +
         (voltas === 1 ? 'falta 1 treino' : 'faltam ' + voltas + ' treinos');
}

// ---------- tela cheia: retrospectiva de bloco ----------
CTX.retrospectiva = function () {
  const R = retro();
  const dores = Object.keys(R.dores);
  // O sufixo do par "de → para". Em ritmo ele é a escala da unidade, e o
  // número que aparece é o ritmo — não o tempo somado, que era comparação
  // entre sessões de tamanhos diferentes.
  const un = function (x) {
    return x.ritmo ? ' ' + (ESCALA_RITMO[x.un] || { rot: 's' }).rot : x.seg ? 's' : 'kg';
  };
  const val = function (x, v) {
    return x.ritmo ? fmtDec(v * (ESCALA_RITMO[x.un] || { fator: 1 }).fator) : fmtCarga(v);
  };
  return {
    olho: 'retrospectiva de bloco',
    meta: fmtDate(R.de) + ' a ' + fmtDate(R.ate),
    titulo: R.sessoes + ' sessões em ' + fmtDec(R.semanas) + ' semanas',
    stats: [
      { k: 'a', rotulo: 'treinos por semana', valor: fmtDec(R.sessoes / R.semanas) },
      { k: 'b', rotulo: 'volume acumulado', valor: fmtInt(R.volTotal) },
      { k: 'c', rotulo: 'exercícios que subiram', valor: String(R.evol.length) }
    ],
    evol: R.evol.slice(0, 8).map(function (x) {
      return {
        nome: x.nome,
        delta: x.dc === null ? null : (x.dc > 0 ? '+' : '') + x.dc + '%',
      // Ácido não pinta comparação favorável: "melhor que antes" é elogio, e o
      // app não comemora. O sinal que sobra é o âmbar, que pede atenção.
        deltaCor: '',
        series: [val(x, x.ci) + un(x) + ' → ' + val(x, x.cf) + un(x)],
        meta: [x.n + ' sessões'].concat(
          x.dv === null ? [] : [(x.ritmo ? 'ritmo ' : 'volume ') + (x.dv > 0 ? '+' : '') + x.dv + '%']),
        marcas: []
      };
    }),
    parados: R.parados.map(function (x) {
      return {
        nome: x.nome,
        delta: x.dv === null ? null : (x.dv > 0 ? '+' : '') + x.dv + '%',
      // Ácido não pinta comparação favorável: "melhor que antes" é elogio, e o
      // app não comemora. O sinal que sobra é o âmbar, que pede atenção.
        deltaCor: '',
        series: [val(x, x.cf) + un(x) + ' o bloco inteiro'],
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
  const d = new Date(a.t);
  const dataCurta = fmtDate(a.t);
  const nomeDoDia = DIAS_LONGOS[d.getDay()];
  const m = registroDoLancamento();
  const jaTem = sessoesDoDia(a.t).filter(function (x) { return x !== m; });
  const descreve = function (k) {
    const P = treino(k);
    if (!P) return null;
    const series = P.ex.reduce(function (n, ex) { return n + ex.s; }, 0);
    return [P.tag || null, P.ex.length ? P.ex.length + (P.ex.length === 1 ? ' exercício, ' : ' exercícios, ') + series + ' séries' : null]
      .filter(Boolean).join(' · ');
  };
  const nomeDe = function (k) { return diaAberto(k) ? 'Aula' : 'Treino ' + k; };
  const proximo = nextDay();
  const ultimo = ultimaDoPlano();
  const base = {
    titulo: nomeDoDia + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()],
    procedencia: m ? 'dia de treino, pela sessão registrada' : jaTem.length
      ? 'já tem ' + jaTem.map(function (x) { return x.livre ? 'treino fora da prescrição' : nomeDe(x.day).toLowerCase(); }).join(' e ')
      : 'nada registrado'
  };

  // antes do toque: a pergunta, com o previsto em destaque (estado 6)
  if (!m) {
    const previsto = previstoNoDia(a.t);
    return Object.assign(base, {
      gravado: false,
      pergunta: 'Que treino foi ' + (d.getDay() === 0 || d.getDay() === 6 ? 'no ' : 'na ') + nomeDoDia + ', ' + dataCurta + '?',
      previsto: { k: previsto, letra: diaAberto(previsto) ? 'aula' : previsto, titulo: nomeDe(previsto), detalhe: descreve(previsto) },
      outros: rot().filter(function (k) { return k !== previsto; })
        .map(function (k) { return { k: k, t: diaAberto(k) ? 'Aula' : k }; })
    });
  }

  // depois do toque: o que ficou gravado, e o que mudou por causa dele (7 e 8)
  const depois = diasNasQuatroSemanas();
  const mudou = a.antes != null && depois !== a.antes
    ? 'dias com treino nas últimas 4 semanas: ' + depois + ', eram ' + a.antes : null;
  const comHora = temHora(m);
  if (m.livre) {
    return Object.assign(base, {
      gravado: true, livre: true,
      titulo2: 'Treino fora da prescrição · ' + dataCurta,
      gravadoEm: 'gravado às ' + fmtHoraDita(a.gravadoEm || m.m) + ' · ' + (mudou || 'conta como dia com treino'),
      // as regiões do corpo que o produto já conhece (F178), e não os músculos
      // finos do plano: de um treino fora dele ninguém sabe o "delt lateral"
      grupos: regioesDoCorpo().map(function (g) { return { k: g, t: g, on: (m.grupos || []).indexOf(g) >= 0 }; }),
      duracoes: [30, 45, 60].map(function (v) { return { k: v, t: v + ' min', on: m.dur === v * 60000 && !a.durAberta }; })
        .concat([{ k: 'outro', t: 'outro', on: a.durAberta || (!!m.dur && [30, 45, 60].indexOf(m.dur / 60000) < 0) }]),
      durAberta: a.durAberta || (!!m.dur && [30, 45, 60].indexOf(m.dur / 60000) < 0),
      durMin: m.dur ? String(Math.round(m.dur / 60000)) : '',
      nome: m.nome || '',
      nota: 'Sem séries. Não mexe na sequência — o próximo continua ' + (diaAberto(proximo) ? 'a aula' : 'o ' + proximo) +
            ' — e não entra no horário de início do mês.'
    });
  }
  const anda = ultimo === m;
  return Object.assign(base, {
    gravado: true, livre: false,
    titulo2: nomeDe(m.day) + ' · ' + nomeDoDia + ', ' + dataCurta,
    gravadoEm: 'gravado às ' + fmtHoraDita(a.gravadoEm || m.m) + (mudou ? ' · ' + mudou : ''),
    comHora: comHora,
    horaAberta: a.horaAberta || comHora,
    hora: comHora ? fmtHora(m.t) : a.hora,
    notaHora: comHora
      ? 'Começou às ' + fmtHoraDita(m.t) + ', e entra no horário de início do mês.'
      : 'Sem hora, este treino conta como dia com treino, mas não entra no horário de início do mês. Nenhuma hora é inventada.',
    detalhar: 'abre o ' + nomeDe(m.day) + ' de ' + dataCurta + ' série a série, com o que você fez da última vez ao lado de cada uma',
    sequencia: anda
      ? 'A sequência anda: este é o último registrado, e o próximo passa a ser ' + (diaAberto(proximo) ? 'a aula' : 'o ' + proximo) + '.'
      : 'A sequência não muda: ' + (ultimo ? 'o ' + nomeDe(ultimo.day) + ' de ' + (sameDay(ultimo.t, Date.now()) ? 'hoje' : fmtDate(ultimo.t)) +
        ' continua sendo o último registrado, e ' : '') + 'o próximo continua sendo ' + (diaAberto(proximo) ? 'a aula' : 'o ' + proximo) + '.'
  });
};
CTX.fechaAdicionar = function () { fecharAdicionar(); };
CTX.lancaTreino = function (k) { return lancaTreino(k); };
CTX.abreHoraDoLancamento = function () { abreHoraDoLancamento(); };
CTX.semHoraNoLancamento = function () { return horaDoLancamento(''); };
CTX.horaDoLancamento = function (el) { horaDoLancamentoNoCampo(el); };
CTX.grupoDoLancamento = function (g) { return grupoDoLancamento(g); };
CTX.duracaoDoLancamento = function (min) { return duracaoDoLancamento(min); };
CTX.nomeDoLancamento = function (el) { anotaNomeDoLancamento(el.value); };
CTX.guardaLancamento = function () { return save(); };
CTX.detalhaLancamento = function () { return detalhaLancamento(); };

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
/**
 * A referência de um movimento do box: o que entrou da última vez, com a data,
 * ou "sem registro anterior" — a tela diz que não sabe em vez de fingir (a D,
 * aula, estado 3). Peso guardado é peso do dia: a lousa muda toda semana.
 */
function referenciaDoBox(k) {
  const h = historico(k);
  const u = h.length ? h[h.length - 1] : null;
  if (!u) return 'sem registro anterior';
  const un = unidadeDe(CAT[k] || {});
  return 'última: ' + fmtLast(u, !!un).replace(/  /g, ' · ') + ' em ' + fmtDate(u.t);
}

/**
 * A ÚLTIMA AULA, antes de começar a de hoje (a D, aula, estado 5): "quando eu
 * chegar lá, saber qual é o wall ball que eu costumo pegar" (P4). Os movimentos
 * que entraram na última sessão daquele dia aberto, com o que entrou. Sem
 * sessão anterior com movimento, nada.
 */
function referenciaDaUltimaAula(d) {
  const ses = (S.done || []).filter(function (x) { return x && x.day === d; })
    .sort(function (a, b) { return b.t - a.t; });
  for (let j = 0; j < ses.length; j++) {
    const sid = typeof ses[j].sid === 'number' ? ses[j].sid : ses[j].t;
    const linhas = [];
    Object.keys(S.logs || {}).forEach(function (k) {
      (S.logs[k] || []).forEach(function (e) {
        if (e && e.sid === sid && Array.isArray(e.sets) && e.sets.some(Boolean)) {
          linhas.push({ k: k, n: CAT[k] ? CAT[k].n : k, t: e.t,
                        v: fmtLast(e, !!unidadeDe(CAT[k] || {})).replace(/  /g, ' · ') });
        }
      });
    });
    if (linhas.length) {
      linhas.sort(function (a, b) { return a.t - b.t; });
      const dt = new Date(ses[j].t);
      return { quando: DIAS_CURTOS[dt.getDay()] + ' ' + fmtDate(ses[j].t), linhas: linhas };
    }
  }
  return null;
}

function catalogoDeAdicao(d) {
  const q = view.addQ || '';
  const nodia = {};
  const t = treino(d);
  if (t) t.ex.forEach(function (x) { nodia[x.id] = 1; });

  // No DIA ABERTO o que ele procura é sempre o mesmo punhado, e a ordem
  // alfabética o espalha por 180 exercícios — o remo e o trenó caem no meio da
  // musculação. Nos outros dias a prioridade não existe: lá o que se adiciona
  // é exercício de hipertrofia, e pôr sled no topo seria oferecer o caminho
  // errado na tela mais usada do app.
  const prio = {};
  if (diaAberto(d)) FREQUENTES_NO_BOX.forEach(function (n, i) { prio[slugEx(n)] = i + 1; });
  const posicao = function (k) { return prio[k] || 999; };

  return {
    dia: d,
    busca: view.addQ || '',
    achados: Object.keys(CAT)
      .filter(function (k) { return !CAT[k].arq; })
      // Nome e grupo no mesmo alvo: cada palavra da consulta precisa aparecer
      // em algum dos dois, e a ordem não importa. É o que faz `sled push`,
      // `push sled` e `remo` chegarem onde ele espera — e `triceps` achar o
      // grupo `tríceps`, que antes exigia o acento.
      .filter(function (k) {
        return casaBusca(CAT[k].n + ' ' + (CAT[k].g || ''), q);
      })
      .sort(function (a, b) {
        const pa = posicao(a), pb = posicao(b);
        return pa !== pb ? pa - pb : CAT[a].n.localeCompare(CAT[b].n);
      })
      .slice(0, 40)
      .map(function (k) {
        // A procedência da linha é a GRANDEZA quando existe: um movimento de
        // box tem `g: ''` de propósito, e "sem grupo" dezesseis vezes seguidas
        // no topo da lista não diria nada. `1.000 m` diz o que vai entrar.
        const un = unidadeDe(CAT[k]);
        const medida = un
          ? (CAT[k].q > 0 ? fmtInt(CAT[k].q) + ' ' + ROTULO_UNIDADE[un] : ROTULO_UNIDADE[un])
          : (CAT[k].g || 'sem grupo');
        return { id: k, n: CAT[k].n,
                 sub: medida + (nodia[k] ? ' · já está neste treino' : ''),
                 // no box, a referência de cada movimento (estado 3)
                 ref: diaAberto(d) ? referenciaDoBox(k) : null };
      }),
    novo: view.novoEx
      ? { grupos: gruposDoPlano(),
          cargas: Object.keys(CARGAS).map(function (c) { return { k: c, t: CARGAS[c].nome }; }),
          unidades: [{ k:'', t:'repetições com carga' }, { k:'m', t:'metros' },
                     { k:'cal', t:'calorias' }, { k:'rep', t:'repetições' },
                     { k:'seg', t:'segundos' }] }
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

// `inp` saiu: a lista rápida não tem mais campo, e o par por valor dela
// (`anotaSerieRapida`) continua sendo a porta do modelo. `tecla` e
// `fechaTeclado` são as MESMAS da sessão e do corpo — um teclado só; o que muda
// é o alvo, e ele mora no estado do teclado.
CTX.acoesRapido = {
  abre: function () { abrirRapido(); },
  abreTeclado: function (i, pos) { abreTecladoRapido(i, pos); },
  tecla: function (t) { teclaDoTeclado(t); },
  fechaTeclado: function () { fechaTeclado(); }
};

CTX.acoesAulas = {
  abre: function () { abrirAulas(); },
  repete: function () { repetirUltimaAula(); },
  aplica: function (id) { aplicarModeloDeAula(id); },
  salva: function () { salvarAulaComoModelo(); },
  apaga: function (id) { apagarModeloDeAula(id); },
  cola: function () { view.colaAula = !view.colaAula; render(); },
  importa: function (txt) { importaAulaColada(txt); }
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
  // Sem `scrollTo`: `‹ anterior` e `próxima ›` ficam no meio da página e são
  // tocados nove vezes seguidas. Jogar ao topo tira o botão de baixo do polegar
  // a cada pose — é o mesmo conserto que `mudaMes` já levou.
  render();
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
/**
 * A pose que não coube no aparelho (a D, `sessao-fotos.html`, estado 9): a
 * sessão PARA em vez de seguir fingindo, e o bloco da pose fica "não guardada",
 * diferente de "falta". Se foi o cache que recusou a foto, a foto reduzida fica
 * na memória para tentar de novo; se foi o registro, a referência fica no
 * estado e a próxima gravação aceita a leva.
 */
function marcaPoseNaoGuardada(pose, motivo, reduzida) {
  if (view.protocolo) view.protocolo.naoGuardada = { pose: pose, motivo: motivo, reduzida: reduzida || null };
}

async function guardaFotoDaPose(d, pose, reduzida) {
  const { blob, ext } = reduzida;
  try { await CORPO.guarda(d, pose, blob, ext); }
  catch (e) { marcaPoseNaoGuardada(pose, 'foto', reduzida); return { parou: true }; }

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

  if ((await save()) === false) { marcaPoseNaoGuardada(pose, 'registro', null); return { parou: true }; }
  if (view.protocolo) view.protocolo.naoGuardada = null;
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
    const r = await guardaFotoDaPose(v.d, v.pose, await CORPO.reduz(arquivo));
    render();
    if (!(r && r.parou)) window.scrollTo(0, 0);
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
  // PARE (§3.3): a lápide viaja, e a comparação perde o par.
  const qual = p ? p.n.toLowerCase() : pose;
  if (!(await pare({ texto: 'Apagar a foto de ' + qual + ' de ' + fmtDate(Date.parse(v.d + 'T12:00:00')) + ' tira ela deste aparelho e dos outros na próxima sincronização, e a comparação perde esse par. Isso não tem volta.',
                     sim: 'Apagar a foto de ' + qual }))) return;
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
      return { id: p.id, n: p.n, feita: !!(ses && ses.fotos[p.id]), atual: p.id === v.pose,
               naoGuardada: !!(v.naoGuardada && v.naoGuardada.pose === p.id) };
    }),
    naoGuardada: avisoDaPoseNaoGuardada(lista),
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
              d: ref.d,
              txt: fmtDate(instanteDaData(ref.d)),
              url: CORPO.urlDaFoto(ref.d, pose.id, r),
              enq: (r && r.enq) || null,
              aviso: avisoDaFoto(ref.d, pose.id, true, ''),
              retomar: podeTentarFoto(ref.d, pose.id, true)
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

// ---------- o destino EVOLUÇÃO ----------
// A leitura do peso ao longo do tempo, dentro de Corpo — o estado 8 do
// `corpo.html` da D, com o nome que o dono devolveu em 06/10 (§1.7 da frente 3):
// "Evolução", no lugar de "Histórico". Não é um sexto lugar: é um destino que
// abre de Corpo e volta para ele.
CTX.abreEvolucao = function () { view.evolucao = true; entraNoDestino('evolucao'); render(); };
CTX.fechaEvolucao = function () { view.evolucao = null; render(); saiDoDestino('evolucao'); };

CTX.evolucao = function () {
  const agora = Date.now();
  const L = leituraDaEvolucao(S.body.peso || [], agora);
  const semanas = {};
  L.pontos.forEach(function (x) { semanas[weekStart(x.t)] = 1; });
  const ns = Object.keys(semanas).length;
  const pri = L.semanas[0], ult = L.semanas[L.semanas.length - 1];
  const duasAbaixo = L.taxas.filter(function (x) { return x.kg != null; }).slice(0, 2);
  return {
    meta: L.n ? ns + (ns === 1 ? ' semana · ' : ' semanas · ') + L.n + (L.n === 1 ? ' pesagem' : ' pesagens') : 'nenhuma pesagem ainda',
    leitura: L,
    alvo: { min: ALVO_MIN, max: ALVO_MAX },
    // as duas pontas da linha, ditas como o desenho diz: "02/08 · 71,5" e "hoje · 73,6"
    inicio: pri ? fmtDate(pri.w) + ' · ' + fmtDec(pri.v) : null,
    fim: ult ? (sameDay(ult.w, weekStart(agora)) ? 'esta semana' : fmtDate(ult.w)) + ' · ' + fmtDec(ult.v) : null,
    taxas: L.taxas.map(function (x) {
      return { w: x.w, intervalo: x.intervalo, nota: x.nota, classe: x.classe,
               valor: x.kg == null ? '–' : fmtSig2(x.kg) };
    }),
    // A frase que aponta para onde a decisão mora. Quando as duas taxas mais
    // recentes estão abaixo de 0,10, é exatamente o que a regra lê — a frase do
    // desenho; nos outros casos, só o endereço.
    frase: duasAbaixo.length === 2 && duasAbaixo.every(function (x) { return x.kg < 0.10; })
      ? 'Duas taxas seguidas abaixo de 0,10 é exatamente o que a regra do nutricionista lê. O que ela decide está em Semana.'
      : 'O que a regra do nutricionista decide com estas taxas está em Semana.',
    podeComparar: posesDo(S.protocolo.poses).some(function (p) { return comAPose(S.protocolo.sessoes, p.id).length >= 2; })
  };
};

function aplicaParPadrao() {
  const c = view.comparar;
  const par = parPadrao(S.protocolo.sessoes, c.pose);
  c.de = par ? par.de.d : null;
  c.ate = par ? par.ate.d : null;
  if (par) garanteBytesDoCorpo([c.de, c.ate]);
}

CTX.setPoseComparada = function (id) { view.comparar.pose = id; aplicaParPadrao(); render(); };
/** Tentar de novo mora na tela que mostrou a falha, como o "ajustar". */
CTX.tentaFotos = function (d) {
  Object.keys(falhaDeFoto).forEach(function (k) {
    if (k.indexOf(d + '|') === 0) delete falhaDeFoto[k];
  });
  render();
  garanteBytesDoCorpo([d]);
};

CTX.setDataComparada = function (qual, d) {
  view.comparar[qual] = d;
  garanteBytesDoCorpo([d]);
  render();
};
CTX.setSobrepor = function (on) { view.comparar.sobrepor = !!on; if (on) view.comparar.cortina = false; render(); };
/**
 * A CORTINA (a D, `comparar.html`, estado 2): uma foto por cima da outra, e a
 * divisa diz onde uma termina e a outra começa. É a leitura que a geometria
 * permite — mesma pose, mesma distância, mesmas marcas —, de pé, com um dedo,
 * sem depender de ler nada.
 */
CTX.setCortina = function (on) { view.comparar.cortina = !!on; if (on) view.comparar.sobrepor = false; render(); };
CTX.setCorte = function (n) { view.comparar.corte = Math.max(0, Math.min(100, Number(n) || 0)); render(); };
CTX.setOpacidade = function (n) { view.comparar.opacidade = n; render(); };

/**
 * O vazio de uma sessão só (a D, comparar, estado 11): tem data. A próxima
 * sessão é o que falta, a cada `CADENCIA_DIAS`, e com ela nasce o par.
 */
function vazioDeUmaSessao(d) {
  const t = instanteDaData(d);
  const prox = t + CADENCIA_DIAS * 86400000;
  // em dias de calendário, e não em horas: "daqui a 10 dias" não muda às 18h
  const h0 = new Date(Date.now()); h0.setHours(0, 0, 0, 0);
  const p0 = new Date(prox); p0.setHours(0, 0, 0, 0);
  const faltam = Math.round((p0.getTime() - h0.getTime()) / 86400000);
  const quando = sameDay(t, Date.now()) ? 'A primeira sessão foi hoje.' : 'A primeira sessão foi em ' + fmtDate(t) + '.';
  const dp = new Date(prox);
  return 'Ainda não há par. ' + quando + ' ' +
    (faltam > 0
      ? 'A segunda cai em ' + DIAS_CURTOS[dp.getDay()] + ' ' + fmtDate(prox) + ', daqui a ' + (faltam === 1 ? '1 dia' : faltam + ' dias') + '.'
      : 'A segunda já pode ser feita: a cadência é a cada ' + CADENCIA_DIAS + ' dias.') +
    ' Com ela nasce o primeiro par, e com ' + JANELA_MIN + ' a ' + JANELA_MAX +
    ' dias de intervalo ele já serve para a pergunta do nutricionista.';
}
CTX.voltaAoParLongo = function () { aplicaParPadrao(); render(); };

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
    aviso: avisoDaFoto(d, pose, !!ref, 'sem foto nesta pose'),
    retomar: podeTentarFoto(d, pose, !!ref),
    // a média da SEMANA, dita como tal; sem medida, a palavra certa e não um
    // zero nem um traço (a D, comparar, estado 1)
    peso: peso == null ? 'peso: sem medida' : fmtDec(peso) + ' kg na semana',
    cintura: cint == null ? 'cintura: sem medida' : fmtDec(cint) + ' cm na semana',
    pesoV: peso
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

  let intervalo = '', curto = null, longo = false;
  if (par) {
    const dias = Math.round((instanteDaData(c.ate) - instanteDaData(c.de)) / 86400000);
    const primeira = comFoto[0].d, ultima = comFoto[comFoto.length - 1].d;
    const diasLongo = Math.round((instanteDaData(ultima) - instanteDaData(primeira)) / 86400000);
    longo = c.de === primeira && c.ate === ultima;
    // O par mais longo é o que abre, e diz que é (a D, comparar, estado 1), com
    // a variação da média semanal quando as duas semanas têm peso.
    const delta = de.pesoV != null && ate.pesoV != null ? ate.pesoV - de.pesoV : null;
    intervalo = longo
      ? 'Par mais longo que existe desta pose: ' + dias + ' dias' + (delta != null ? ', ' + fmtSig(Math.round(delta * 10) / 10) + ' kg' : '')
      : Math.abs(dias) + (Math.abs(dias) === 1 ? ' dia' : ' dias') + ' entre as duas · ' +
        comFoto.length + ' sessões nesta pose';
    // O PAR CURTO (estado 3): a tela avisa e não impede. O aviso é o fato —
    // o que aquele intervalo consegue mostrar — e o atalho de volta fica ao lado.
    const absd = Math.abs(dias);
    if (absd <= JANELA_MAX && diasLongo > absd) {
      const pares = comFoto.slice(0, -1).map(function (x) {
        return Math.round((instanteDaData(ultima) - instanteDaData(x.d)) / 86400000);
      });
      curto = {
        titulo: absd + (absd === 1 ? ' dia mostra' : ' dias mostram') + ' pouco',
        texto: 'Nesse intervalo a diferença é quase toda água e sono. ' + (absd >= JANELA_MIN
          ? 'Serve para a pergunta do nutricionista; não serve para ver mudança.'
          : 'Não serve para ver mudança.'),
        voltar: 'Voltar ao par de ' + diasLongo + ' dias',
        pares: 'Pares desta pose: ' + (pares.length === 1 ? pares[0]
          : pares.slice(0, -1).join(', ') + ' e ' + pares[pares.length - 1]) + ' dias.'
      };
    }
  }

  // A pergunta do fechamento semanal, feita onde a resposta está à vista: ele
  // já está com as duas fotos na frente. Só aparece quando o par cobre mais ou
  // menos duas semanas — que é sobre o que a pergunta é. Num par de três meses
  // ela seria outra pergunta, e guardar a resposta como se fosse esta mentiria
  // para a régua calórica.
  let pergunta = null;
  if (par) {
    const dias = Math.abs(Math.round((instanteDaData(c.ate) - instanteDaData(c.de)) / 86400000));
    if (dias >= JANELA_MIN && dias <= JANELA_MAX) {
      const ja = (S.gordura || []).filter(function (x) { return x.d === c.ate; })[0];
      pergunta = {
        t: 'Comparando com ' + dias + ' dias atrás: a gordura visual aumentou claramente?',
        valor: ja ? ja.v : null,
        opcoes: [{ k: 'sim', t: 'Sim' }, { k: 'nao', t: 'Não' }, { k: 'incerto', t: 'Incerto' }],
        nota: 'A resposta vale por ' + VALIDADE_LEITURA + ' dias e entra na régua calórica: o peso sozinho não corta. ' +
              '"Incerto" também é resposta: com ela, a regra mantém a comida como está.'
      };
    }
  }

  // O PAR QUE RECUOU (a D, `comparar.html`, estado 7): a pose não existe nas
  // sessões mais antigas, e o par mais longo POSSÍVEL dela começa depois. O
  // par já recuava sozinho; agora diz que recuou, com as datas — um intervalo
  // menor muda o que a comparação consegue mostrar.
  let recuou = null;
  const todas = (S.protocolo.sessoes || []).slice().sort(function (x, y) { return x.d < y.d ? -1 : x.d > y.d ? 1 : 0; });
  if (par && comFoto.length && todas.length && c.de === comFoto[0].d && todas[0].d !== comFoto[0].d) {
    const semPose = todas.filter(function (x) { return x.d < comFoto[0].d; }).map(function (x) { return fmtDate(instanteDaData(x.d)); });
    const diasPar = Math.round((instanteDaData(c.ate) - instanteDaData(c.de)) / 86400000);
    const diasTodo = Math.round((instanteDaData(c.ate) - instanteDaData(todas[0].d)) / 86400000);
    recuou = {
      titulo: diasPar + ' dias, e não ' + diasTodo,
      texto: (semPose.length === 1 ? 'A sessão de ' + semPose[0] + ' não tem' : 'As sessões de ' +
              semPose.slice(0, -1).join(', ') + ' e ' + semPose[semPose.length - 1] + ' não têm') +
             ' esta pose. O par mais longo possível dela começa em ' + fmtDate(instanteDaData(comFoto[0].d)) + '.'
    };
  }

  return {
    meta: S.protocolo.sessoes.length + (S.protocolo.sessoes.length === 1 ? ' sessão' : ' sessões'),
    recuou: recuou,
    pergunta: pergunta,
    poses: lista.map(function (p) { return { k: p.id, t: p.n }; }),
    pose: c.pose,
    par: par,
    vazio: comFoto.length === 0
      ? 'Nenhuma foto nesta pose ainda.'
      : vazioDeUmaSessao(comFoto[0].d),
    longo: longo,
    curto: curto,
    datas: comFoto.map(function (s) { return { d: s.d, txt: fmtDate(instanteDaData(s.d)) }; }),
    de: de, ate: ate,
    sobrepor: c.sobrepor,
    opacidade: c.opacidade,
    cortina: !!c.cortina,
    corte: c.corte == null ? 50 : c.corte,
    intervalo: intervalo,
    notas: notas
  };
};

/** O resumo que aparece na aba DADOS, ao lado de peso e cintura. */
/**
 * Guarda a leitura de gordura do par em tela.
 *
 * Chave natural: a data da sessão mais NOVA do par. Responder de novo
 * substitui — não existe histórico de opinião sobre o mesmo par, e sim a
 * resposta em vigor. Sem toast: é registro silencioso, como toda série.
 */
CTX.setGordura = function (v) {
  const c = view.comparar;
  if (!c || !c.de || !c.ate) return;
  if (!Array.isArray(S.gordura)) S.gordura = [];
  const leitura = { d: c.ate, de: c.de, v: v, t: Date.now() };
  const i = S.gordura.findIndex(function (x) { return x.d === c.ate; });
  if (i >= 0) S.gordura[i] = leitura; else S.gordura.push(leitura);
  S.gordura.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  queueSave(); render();
};

/**
 * O atalho de volta ao treino em andamento.
 *
 * Só existe quando há sessão aberta, e some na própria aba de treino — ali
 * ele seria uma porta para a sala em que já se está. Diz o nome do exercício
 * de destino porque um atalho que não diz para onde vai obriga a tocar para
 * descobrir, e o toque é o que ele existe para economizar.
 */
/**
 * A hora de parede, para o cabeçalho do modo.
 *
 * O protótipo achou que o app não tem relógio NENHUM, e que a projeção de fim
 * do treino não se confere sem ele: "acabo às 19h10" não diz nada a quem não
 * sabe que horas são. Fica aqui e não na vista porque `Date.now()` dentro de um
 * componente é estado escondido — a vista desenha o que o modelo diz.
 *
 * E aqui embaixo, e não junto de `tickRelogio` lá em cima: `CTX` só nasce
 * depois dele, e atribuir antes é TDZ no carregamento do módulo — o app não
 * boota e a suíte inteira responde `__escopo is not a function`.
 */
CTX.horaDeParede = function () { return fmtHora(Date.now()); };

/**
 * Os fatos do dia que a regra do cartão de cima lê, resolvidos do `S`.
 *
 * A REGRA mora em `dominio/agora.ts`, é pura e está provada por mutação, degrau
 * por degrau. Aqui fica só o que depende de estado — e cada linha deste
 * invólucro é uma decisão de ONDE o fato já estava:
 *
 * - **a janela do treino** termina quando a sessão terminaria: o minuto da
 *   refeição `treino` do dia (que `refeicoesDeHoje` já desloca pelo turno) mais
 *   `duracaoDoTreino()`, que é a mediana medida das sessões dele e não uma
 *   constante. Nenhum número novo: é o mesmo cálculo com que o plano já move as
 *   refeições em volta do treino;
 * - **palpite** é `previsto` de `diaDeHoje`, que já distingue sessão
 *   registrada, sessão aberta e escolha manual do palpite do padrão semanal;
 * - **feito** é `origem === 'registrado'`: já há sessão registrada hoje;
 * - **a aula** é o dia ABERTO da rotação (`HX`, `aberto: 1`), porque a aula É a
 *   sessão daquele dia;
 * - **as refeições presas à sessão não disputam o topo.** São as de
 *   `quando: 'treino'` — o pré e o intra —, e é a razão escrita da frente 1: o
 *   pré "desce para a linha de baixo e reaparece dentro do descanso, que é onde
 *   ele de fato é marcado". Cartão mandando beber água no meio da série seria a
 *   mesma classe de erro.
 *
 * **A confirmação do fim aproximado** é derivada, e de propósito sem campo
 * novo: a sessão mais recente fechada SOZINHA (`fim: 'auto'`, que
 * `fechaSessao('auto')` carimba) e de um dia anterior a hoje. Enquanto ele não
 * responde, o número escrito continua aproximado e a pergunta continua
 * legítima; responder de qualquer um dos dois lados passa o `fim` a `'manual'`
 * e a pergunta sai sozinha. Campo novo aqui custaria migração, regra de fusão e
 * duas listas de cópia — por um fato que o dado já carrega.
 */
CTX.fatosDoDia = function () {
  const h = diaResolvido();
  const dia = diaDeComida();
  const plano = planoDeComida();
  const treinando = h.cadencia === 'treino';
  const refs = refeicoesDeHoje(plano, treinando, !!dia.alta, dia.turno, duracaoDoTreino());
  const agora = Date.now();
  const agoraMin = new Date(agora).getHours() * 60 + new Date(agora).getMinutes();

  // a sessão aberta, com a contagem de séries. A aritmética espelha
  // `estadoEx`, deload incluído, para as duas leituras não divergirem.
  let sessao = null;
  const s = S.sessao;
  if (s) {
    const t = treino(s.day);
    let guardadas = 0, prescritas = 0;
    (t ? t.ex : []).forEach(function (ex, i) {
      const e = entradaDaSessao(s.day, i, s.sid);
      prescritas += (e && e.dl) ? Math.ceil(ex.s / 2) : ex.s;
      if (e) guardadas += e.sets.filter(Boolean).length;
    });
    sessao = { dia: s.day, guardadas: guardadas, prescritas: prescritas,
               esquecida: sessaoEsquecida(s) };
  }

  // a sessão que fechou sozinha e ainda não teve o fim confirmado
  let confirmar = null;
  for (let i = S.done.length - 1; i >= 0; i--) {
    const m = S.done[i];
    if (!m || m.livre) continue;
    if (m.fim === 'auto' && !sameDay(m.t, agora) && m.dur) {
      confirmar = { dia: m.day, inicio: m.t - m.dur, fim: m.t };
    }
    break;                               // só a MAIS RECENTE responde
  }

  // o treino previsto e a janela dele
  let treinoDoDia = null;
  if (treinando && h.treino) {
    const doPlano = refs.filter(function (r) { return r.id === 'treino'; })[0];
    const ini = doPlano ? minutosDe(doPlano.t) : null;
    treinoDoDia = {
      dia: h.treino,
      // sem a refeição do treino no plano do dia não há janela a respeitar, e
      // o dia inteiro seria dela: o treino passa a não disputar.
      fimDaJanela: ini == null ? -1 : ini + duracaoDoTreino(),
      palpite: !!h.previsto,
      feito: h.origem === 'registrado',
      aula: diaAberto(h.treino)
    };
  }

  return {
    sessao: sessao,
    confirmar: confirmar,
    treino: treinoDoDia,
    refeicoes: refs
      .filter(function (r) { return r.quando !== 'treino'; })
      .map(function (r) {
        return { id: r.id, hora: minutosDe(r.t), marcada: !!dia.done[r.id] };
      }),
    agora: agoraMin
  };
};

/**
 * O aparelho está guardando?
 *
 * `src/infra/db.ts` sonda o armazenamento no boot e cai para memória quando o
 * acesso estoura — aba privada, armazenamento bloqueado por política, `file://`
 * travado. Até esta passada **ninguém lia o resultado da sonda**: o app abria
 * inteiro, marcava refeição, registrava série, e perdia tudo ao fechar a aba
 * sem dizer uma palavra. É a §5.0 da frente 1, e o aviso dela fica ACIMA do
 * cartão porque não é uma ação — é a condição de validade de todas as outras.
 *
 * `null` antes de a sonda responder conta como guardando: avisar perda antes de
 * saber seria alarme falso, e alarme falso ensina a ignorar o verdadeiro.
 */
CTX.guardando = function () { return DB.mode !== 'mem'; };

/**
 * A linha do Agora sobre o que espera decisão — e sobre o que vence hoje.
 *
 * DUAS FRENTES PEDIRAM COISAS DIFERENTES AQUI, e a linha carrega as duas:
 *
 * - a frente 1 (§5.6) quer o aviso do VENCIMENTO "na manhã daquele treino";
 * - a frente 2 (§9.2) quer que encerrar o treino **informe**, e não pergunte:
 *   "a mudança some da vista dele no mesmo instante em que o app passa a
 *   guardá-la — e 'guardado em silêncio' é tão ruim quanto 'descartado em
 *   silêncio', porque ele não sabe que há algo a decidir".
 *
 * **Reconciliação, e está declarada:** a linha PERSISTE enquanto houver algo
 * esperando, e muda de palavra no dia em que vence. O "uma vez" da frente 1 lê
 * como UMA LINHA e não uma lista — que é o que a §1.1 manda, "o Agora mostra uma
 * linha; o dono da lista é Prescrição". Literalmente uma vez, a mudança ficaria
 * invisível entre o fim do treino e a manhã da volta, que é justamente o buraco
 * que a frente 2 nomeia.
 *
 * `!g.venceu` em tudo: o que já venceu não tem aviso a dar — tem o bloco
 * "venceu sem você" em Prescrição, que é dito e desfazível. Avisar dos dois
 * jeitos faria o Agora cobrar uma decisão que o tempo já tomou.
 */
// ---------- pôr um dia em dia ----------
//
// A tarefa que o app não tinha: registrar a terça que ele esqueceu de marcar. O
// chão é `poeComidaNoDia` (frente 0), e esta é a metade de MODELO da folha que a
// frente 2 desenhou — as leituras e a escrita, antes de qualquer pixel.
//
// As CINCO marcas por refeição, e cada uma é coisa diferente no dado:
//
//   tudo     · comeu o que o plano diz           → `done`, sem `como`
//   metade   · comeu menos                       → `done` + `escala: 0.5`
//   fora     · comeu, mas não foi aquilo         → `done` + `como: 'fora'`
//   não sei  · comeu e não sabe quanto           → `done` + `como: 'nsei'`, peso 0
//   não comi · NÃO comeu, dito como fato         → `done` + `como: 'nao'`, peso 0
//
// O quinto é o que destrava o portão, e é decisão 1 das quinze: declarar "não
// comi" com um toque produz dia CONTADO, em vez de silêncio — e silêncio não
// conta para o `MIN_REGISTRADOS` de 11 em 14. Até aqui `'nao'` existia no
// domínio e não tinha porta: o modelo o alcançava, o dedo não.
//
// "Não sei" NÃO tira o dia da conta, e isso é decisão 2: peso 0 DENTRO do
// denominador. Subestimar segura o corte; inflar autoriza um corte que não devia
// acontecer.

/** As porções que o app oferece. Duas acima de 1 — "comi mais que o plano". */
const PORCOES_DO_DIA = [0.5, 0.75, 1, 1.25, 1.5];

/**
 * As linhas da folha de pôr um dia em dia.
 *
 * ABRE PRÉ-MARCADA COMO SUGESTÃO, e a regra é a do protótipo: dia passado vem
 * tudo marcado. Mas aqui há histórico, e o que está REGISTRADO vence a sugestão
 * — `poeComidaNoDia` completa em vez de substituir, e a tela não pode prometer
 * o contrário.
 *
 * `sugerida` separa as duas, e a separação não pode ser só de cor (1.4.1): a
 * linha carrega a PROCEDÊNCIA da marca em palavra — "marcada pelo horário" para
 * a sugestão, nada para o que ele declarou.
 *
 * `null` quando a data não serve: futura, ilegível. A folha não abre para um dia
 * que não aconteceu.
 */
/**
 * Os dias de comida JÁ FECHADOS — a lista que Dias possui (§1.2).
 *
 * É daqui que a folha de pôr em dia é alcançada: Dias é "o LUGAR" dela, e o que
 * o lugar oferece é a lista do que aconteceu, com a porta para corrigir cada
 * dia. Os dias SEM linha aparecem também, e são justamente os que ele pode pôr
 * em dia — um dia sem registro é o caso de uso inteiro desta peça.
 *
 * Catorze dias, a mesma janela do portão: é o recorte em que pôr um dia em dia
 * ainda muda a conta que a regra lê. Mais que isso é arqueologia.
 */
CTX.diasDeComidaFechados = function () {
  const hoje = hojeISO();
  const porData = {};
  (Array.isArray(S.comidaHist) ? S.comidaHist : []).forEach(function (h) {
    if (h && h.d) porData[h.d] = h;
  });

  const dias = [];
  for (let k = 1; k <= 14; k++) {
    const dt = new Date(hoje + 'T12:00:00');
    dt.setDate(dt.getDate() - k);
    const iso = hojeISO(dt.getTime());
    const h = porData[iso];
    const marcas = h ? Object.keys(h.done || {}).length : 0;
    dias.push({
      data: iso,
      rotulo: fmtDate(dt.getTime()),
      // Contagem, nunca percentual: um número contra 100% implícito funciona
      // como nota, e registro não leva nota.
      txt: h
        ? marcas + (marcas === 1 ? ' refeição marcada' : ' refeições marcadas')
        : 'sem registro',
      tem: !!h
    });
  }
  return dias;
};

CTX.abrePoeODia = function (data) { CTX.abreFolha({ k: 'poeODia', data: data }); };

CTX.poeODiaEmDia = function (data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const hoje = hojeISO();
  if (data > hoje) return null;

  const linha = (Array.isArray(S.comidaHist) ? S.comidaHist : [])
    .filter(function (h) { return h && h.d === data; })[0] || null;
  const cadencia = linha && linha.cadencia ? linha.cadencia : 'descanso';
  const plano = planoDeComida();
  const refs = refeicoesDeHoje(plano, cadencia === 'treino',
                               !!(linha && linha.alta), linha && linha.turno,
                               duracaoDoTreino());
  const cat = catalogoAlimentos();

  return {
    data: data,
    // A PROCEDÊNCIA do plano, e ela tem de ser dita: o plano daquela data não
    // existe em lugar nenhum — `pv` guarda QUANDO ele era aquele, não O QUE
    // era. Um dia posto em dia é contado contra o plano de HOJE.
    plano: refs.length + (refs.length === 1 ? ' refeição' : ' refeições') +
           ' · contado contra o plano de hoje',
    fechado: !!linha,
    porcoes: PORCOES_DO_DIA.slice(),
    linhas: refs.map(function (r) {
      const marcada = !!(linha && linha.done && linha.done[r.id] != null);
      const como = (linha && linha.como && linha.como[r.id]) || null;
      const escala = (linha && linha.escala && linha.escala[r.id] != null)
        ? linha.escala[r.id] : 1;
      // A SUGESTÃO VALE SÓ ENQUANTO O DIA NÃO TEM REGISTRO, e isto me custou um
      // vermelho: eu sugeria "tudo" para toda linha sem marca, inclusive num dia
      // JÁ gravado. A consequência era que o dia não convergia — esvaziar uma
      // linha a devolvia como sugestão, e o toque seguinte em outra linha a
      // re-gravava. Nunca dava para deixar uma refeição sem marca.
      //
      // Com o dia declarado, o REGISTRO é a verdade, inclusive os vazios: linha
      // sem marca num dia gravado é ausência DECLARADA, não ausência de resposta.
      const vazio = !marcada && !!linha;
      return {
        id: r.id,
        nome: r.n,
        hora: r.t,
        marca: marcada ? (como || (escala === 0.5 ? 'metade' : 'tudo'))
             : vazio ? 'vazia' : 'tudo',
        escala: marcada ? escala : 1,
        // o que distingue sugestão de declaração, em PALAVRA e não em cor
        sugerida: !marcada && !linha,
        procedencia: (marcada || vazio) ? null : 'marcada pelo horário · ' + r.t,
        resumo: resumoDaRefeicao(r, cat, !!(linha && linha.alta), escala)
      };
    }),
    // `aderencia` sem resposta é `'plano'`, e `'plano'` é o padrão de quem não
    // respondeu. A pergunta do "fora do plano" NÃO bloqueia (decisão 4): ela
    // aparece depois da gravação, e o que a resposta muda é se o dia conta.
    aderencia: (linha && linha.aderencia) || 'plano',
    frase: fraseDoDia(refs, linha)
  };
};

/**
 * A FRASE DE LEITURA DE VOLTA, e ela é obrigatória — não ornamento.
 *
 * Se um toque grava sete refeições, a tela tem de dizer **as sete**, com as
 * palavras que foram gravadas (frente 2, §4.3). E tem de dizer inclusive o que
 * NÃO foi marcado, porque "fica sem marca" é um resultado e não um silêncio.
 *
 * Agrupa por marca em vez de listar linha por linha: sete frases dizendo a mesma
 * coisa viram ruído e ninguém lê a sétima. E usa as PALAVRAS do botão, não os
 * valores do dado — quem lê a frase é quem acabou de tocar, e ele reconhece o
 * que tocou.
 *
 * O nó que a mostra é `aria-live="polite"`: a gravação acontece no toque, e sem
 * região viva quem usa leitor de tela não ouve o que foi gravado.
 */
const PALAVRA_DA_MARCA = {
  tudo: 'tudo', metade: 'metade', fora: 'fora do plano',
  nsei: 'não sei quanto', nao: 'não comi', vazia: 'fica sem marca'
};
function fraseDoDia(refs, linha) {
  const grupos = {};
  refs.forEach(function (r) {
    const marcada = !!(linha && linha.done && linha.done[r.id] != null);
    const como = (linha && linha.como && linha.como[r.id]) || null;
    const escala = (linha && linha.escala && linha.escala[r.id] != null)
      ? linha.escala[r.id] : 1;
    const m = marcada ? (como || (escala === 0.5 ? 'metade' : 'tudo'))
            : linha ? 'vazia' : 'tudo';
    (grupos[m] = grupos[m] || []).push(r.n.toLowerCase());
  });
  const partes = Object.keys(PALAVRA_DA_MARCA)
    .filter(function (m) { return grupos[m]; })
    .map(function (m) {
      const ns = grupos[m];
      const lista = ns.length === 1 ? ns[0]
        : ns.slice(0, -1).join(', ') + ' e ' + ns[ns.length - 1];
      return PALAVRA_DA_MARCA[m] + ' em ' + lista;
    });
  if (!partes.length) return '';
  const corpo = partes.join('; ');
  // O verbo diz o ESTADO: antes do primeiro toque nada está gravado, e a frase
  // não pode dizer "gravado" sobre uma sugestão.
  return (linha ? 'Gravado: ' : 'Sugerido, e nada gravado ainda: ') + corpo + '.';
}

/**
 * Grava UMA linha de um dia passado — e com ela o dia inteiro como está sugerido.
 *
 * É a decisão P3.i.6 do dono, e a consequência precisa está dita na frente 2
 * (§4.3): **o primeiro toque grava o dia inteiro como está sugerido**, e cada
 * toque seguinte corrige uma linha. Não é "o toque grava aquela linha" — é "o
 * toque transforma a sugestão inteira em registro, com a linha tocada já
 * corrigida". Qualquer outra leitura exige um botão de guardar, e o botão está
 * proibido.
 *
 * Por isso a escrita monta o dia a partir das LINHAS da folha, não da marca
 * isolada: o que está na tela é o que vai ao dado.
 *
 * **NÃO EXISTE "limpar a marca", e isso é limite do chão, não esquecimento.**
 * `poeComidaNoDia` COMPLETA e não substitui — "marca nova vence marca velha
 * chave a chave; o resto fica" —, e a frente 2 escreveu que a folha "não pode"
 * oferecer limpar: apagar um dia do histórico é destrutivo e não foi desenhado.
 *
 * Eu havia inventado uma marca `'vazia'` para tirar a refeição do registro, e a
 * rede mostrou que ela não funcionava: o merge a devolvia na chamada seguinte.
 * O defeito não era do merge — era meu, por especificar comportamento que a
 * função não permite. As cinco marcas são as cinco, e todas MARCAM; o que
 * distingue "não comi" de silêncio é que a primeira é fato declarado.
 */
CTX.marcaNoDiaPassado = async function (data, id, marca, escala) {
  const d = CTX.poeODiaEmDia(data);
  if (!d) return { ok: false, recusa: 'data' };

  const done = {}, como = {}, esc = {};
  const agora = Date.now();
  d.linhas.forEach(function (l) {
    const m = l.id === id ? marca : l.marca;
    const e = l.id === id ? (escala == null ? l.escala : escala) : l.escala;
    // Linha que o dia declarou SEM marca fica sem marca: ela não entra, e o
    // merge do chão preserva o que já estava. O que não existe é a volta —
    // nenhuma marca sai daqui.
    if (m === 'vazia') return;
    done[l.id] = agora;
    if (m === 'fora' || m === 'nao' || m === 'nsei') como[l.id] = m;
    if (m === 'metade') esc[l.id] = 0.5;
    else if (e != null && e !== 1) esc[l.id] = e;
  });

  const r = poeComidaNoDia(
    Array.isArray(S.comidaHist) ? S.comidaHist : [],
    data,
    { done: done, como: como, escala: esc, aderencia: d.aderencia },
    planoDeComida(), catalogoAlimentos(), hojeISO(),
    versaoDoPlano(), S.ajuste || 0, agora
  );
  if (r.recusa) {
    // "Nada mudou" é resultado legítimo, e o app tem doutrina contra falso
    // sucesso: dia que fica mudo depois de ele mexer continua mudo, e a tela
    // diz isso em vez de piscar um sucesso.
    toast(r.recusa === 'mudo'
      ? 'O dia ficou sem marca nenhuma, e continua como estava.'
      : 'Esta data não serve.');
    render();
    return { ok: false, recusa: r.recusa };
  }

  S.comidaHist = r.hist;
  await save();
  render();
  return { ok: true };
};

// A regra do treinador sobre séries a mais (F99, o guia em
// `src/dominio/programa.ts`), condensada pela D para caber ao lado da decisão.
const REGRA_DAS_SERIES = 'Não acrescentar séries agora. Considerar 1 a 2 a mais só num músculo estagnado, ' +
  'depois de várias exposições, com recuperação boa e sem dor.';

/**
 * A linha e a folha da mudança que espera decisão, no Agora (a D,
 * `agora-descanso.html`, estados 6 e 7). A leitura é a mesma da lista de
 * Prescrição (`mudancasQueEsperam`), e o verbo também (`respondeMudanca`): é o
 * mesmo item, sem trocar de lugar.
 */
CTX.decisaoNoAgora = function () {
  const fila = CTX.mudancasQueEsperam().filter(function (g) { return !g.venceu; });
  if (!fila.length) return null;
  const n = fila.reduce(function (k, g) { return k + g.mudancas.length; }, 0);
  const origem = function (g) {
    return 'da sessão de ' + DIAS_LONGOS[new Date(g.quando).getDay()] + ', ' + fmtDate(g.quando) + ' · Treino ' + g.dia;
  };
  const so = n === 1 ? fila[0] : null;
  return {
    olho: so ? origem(so) : 'esperando decisão',
    titulo: so ? so.mudancas[0].txt : n + ' mudanças esperam você',
    // a linha do Agora: "Uma mudança do Treino D espera você"
    linha: {
      titulo: so ? 'Uma mudança do Treino ' + so.dia + ' espera você' : n + ' mudanças esperam você',
      detalhe: so
        ? so.mudancas[0].txt + ', na ' + DIAS_LONGOS[new Date(so.quando).getDay()] + ' ' + fmtDate(so.quando) +
          (so.vence ? ' · ' + so.vence : '')
        : fila.map(function (g) { return 'Treino ' + g.dia; }).filter(function (x, i, xs) { return xs.indexOf(x) === i; }).join(', ')
    },
    grupos: fila.map(function (g) {
      const nome = 'Treino ' + g.dia;
      return {
        sid: g.sid, origem: origem(g),
        mudancas: g.mudancas.map(function (m, i) {
          return { i: i, txt: m.txt, impacto: m.impacto ? m.impacto.replace(/^Se entrar no [^:]+: /, '') : null,
                   acima: m.acima, regra: m.acrescenta ? REGRA_DAS_SERIES : null };
        }),
        seNinguem: 'Se ninguém decidir, quando o ' + nome + ' voltar ela fica como só daquele dia — dito na lista de ' +
          'Prescrição, e desfazível até a vez seguinte do ' + nome + '. A sessão de ' + fmtDate(g.quando) +
          ' guarda o que foi feito de qualquer jeito.'
      };
    })
  };
};
CTX.abreDecisao = function () { CTX.abreFolha({ k: 'decidir' }); };
/** Decide pela folha do Agora, e a fecha quando não sobra mudança nenhuma. */
CTX.decideNoAgora = async function (sid, i, permanente) {
  await CTX.respondeMudanca(sid, i, permanente);
  if (!CTX.decisaoNoAgora() && (view.pilha || []).some(function (f) { return f.k === 'decidir'; })) CTX.fechaFolha();
};

CTX.esperandoDecisao = function () {
  const fila = CTX.mudancasQueEsperam().filter(function (g) { return !g.venceu; });
  if (!fila.length) return null;

  const vencendo = fila.filter(function (g) { return g.venceHoje; });
  const conta = function (gs) {
    return gs.reduce(function (k, g) { return k + g.mudancas.length; }, 0);
  };

  if (vencendo.length) {
    const n = conta(vencendo);
    return {
      n: n, vence: true,
      txt: n === 1
        ? 'Uma mudança do treino ' + vencendo[0].dia + ' vence hoje.'
        : n + ' mudanças vencem hoje.'
    };
  }

  const n = conta(fila);
  return {
    n: n, vence: false,
    // Nomeia o treino quando é uma só: é o que ele reconhece, e o que a frente 2
    // pede ("a série a mais do Treino A está esperando decisão em Prescrição").
    // A descrição de cada mudança é da LISTA, não daqui.
    txt: n === 1
      ? 'Uma mudança do treino ' + fila[0].dia + ' está esperando decisão.'
      : n + ' mudanças estão esperando decisão.'
  };
};

/** A próxima coisa a fazer. A regra é `dominio/agora.ts`; os fatos, acima. */
CTX.cartaoDeCima = function () { return cartaoDeCima(CTX.fatosDoDia()); };

CTX.faixaDaSessao = function () {
  const s = S.sessao;
  if (!s) return null;
  const t = treino(s.day);
  if (!t) return null;

  // A pergunta aparece em TODAS as abas, treino inclusive: quem esqueceu de
  // finalizar costuma ter esquecido olhando justamente para ela.
  if (sessaoEsquecida(s)) {
    return { tipo: 'pergunta', dia: s.day,
             txt: 'Treino ' + s.day + ' sem série nova há ' + fmtDur(paradaDaSessao(s)) + '.' };
  }

  // O atalho leva ao treino em andamento. Dentro do modo a pessoa JÁ está nele,
  // e o botão ocuparia a faixa com um caminho para onde ela está. A pergunta
  // acima continua, que é o item 1 da lista do que não some no modo.
  //
  // A metade `view.aba === 'treino'` saiu com a aba: ela dizia a mesma coisa
  // que o modo diz agora, e era de onde o modo herdou a regra por acidente.
  if (view.modoSessao) return null;
  const i = ondeEleEstava(estadosDoDia(s.day));
  return {
    tipo: 'atalho', dia: s.day,
    // Sem pendente, o atalho continua: encerrar é decisão dele, e sumir com a
    // porta seria esconder a sessão aberta justamente quando ela acabou.
    txt: i == null ? 'tudo registrado · encerrar' : t.ex[i].n
  };
};

/** "Continuo treinando": zera o relógio de inatividade, e só isso. */
CTX.continuaSessao = async function () {
  const s = S.sessao;
  if (!s) return;
  s.ultima = Date.now();
  faixaPerguntando = false;
  await save(); render();
  toast('Treino continua.');
};

/** "Já parei": encerra com a duração indo até a última série registrada. */
CTX.encerraSessaoEsquecida = async function () {
  const s = S.sessao;
  if (!s) return;
  fechaSessao('auto');
  faixaPerguntando = false;
  await save(); render(); window.scrollTo(0, 0);
  // "já parei" é um TOQUE que grava o fim automático — o único lugar do produto
  // em que um toque dele grava um tempo que não é o do toque. A frase diz isso.
  toast(fraseDoFechoNaUltima(s, 'Encerrei'));
};

CTX.voltaAoTreino = function () {
  const s = S.sessao;
  if (!s) return;
  view.day = s.day;
  // Sem mexer em `view.aba`: ver a nota de `abreTreinoDeHoje`. O modo é camada
  // por cima do lugar, e fechá-lo devolve a pessoa de onde ela entrou.
  view.swapOpen = null;
  view.open = ondeEleEstava(estadosDoDia(s.day));
  abreModo();                          // a faixa entra NO modo, não na aba atrás dele
  render();
  if (view.open != null) mostraExercicio(view.open);
  else window.scrollTo(0, 0);
};

/**
 * As linhas do corpo no Agora: a pesagem da manhã e, quando vence, a sessão de
 * fotos. Linhas e não cartão (frente 1 §5, regra 5): cada uma tem um dia em que
 * é prevista, e nenhuma é "a próxima coisa a fazer". O desenho é o M1‑13 da D
 * ("Peso de hoje · antes de treinar, depois do pré · última: 73,8 · Anotar"),
 * com o nome que a §10.2 da frente 3 deu: "Peso da manhã", porque com a
 * bioimpedância há dois pesos no mesmo dia.
 */
CTX.linhasDoCorpo = function () {
  const agora = Date.now();
  const peso = S.body.peso || [];
  const hoje = peso.filter(function (x) { return sameDay(x.t, agora); }).slice(-1)[0];
  const antes = peso.filter(function (x) { return !sameDay(x.t, agora); }).slice(-1)[0];
  const h = diaResolvido();
  const treina = h.cadencia === 'treino';

  // A HORA manda nas duas linhas (a D, `agora-descanso.html`, estados 1 e 5).
  // A pesagem é de manhã em semi-jejum (F42) — em dia de treino, antes de
  // treinar —, e passada a hora ela não aparece: aparecer à tarde seria pedir
  // um número que não compara. As fotos são em jejum (F228): antes da primeira
  // refeição do dia; depois dela marcada, "amanhã cedo".
  const H = CTX.hoje();
  const refs = H.refs.filter(function (r) { return !ehLinhaDeTreino(r); });
  const primeira = refs[0] || null;
  const linhaTreino = H.refs.filter(ehLinhaDeTreino)[0] || null;
  const minAgora = new Date(agora).getHours() * 60 + new Date(agora).getMinutes();
  const comeu = !!(primeira && H.comidaDoDia.done[primeira.id]);
  const horaDita = function (t) { return t.replace(/^0(\d)/, '$1').replace(':', 'h'); };
  const passouAHora = treina
    ? (h.origem === 'registrado' || h.origem === 'aberta' || (linhaTreino && minAgora > minutosDe(linhaTreino.t)))
    : (comeu || (primeira && minAgora > minutosDe(primeira.t)));
  const semana = peso.filter(function (x) { return x.t >= weekStart(agora); }).length;

  const linhas = [];
  if (hoje) {
    linhas.push({ k: 'peso', t: 'Peso da manhã', v: comUnidade(hoje.v, 'kg'),
                  d: 'anotado às ' + fmtHoraDita(hoje.t) + ' · ' + semana + (semana === 1 ? ' nesta semana' : ' nesta semana') });
  } else if (!passouAHora) {
    linhas.push({ k: 'peso', t: 'Peso da manhã', v: 'sem marca',
      d: (treina ? 'antes de treinar, depois do pré' : 'de manhã, em semi-jejum') +
         (antes ? ' · última: ' + fmtDec(antes.v) + ' em ' + fmtDate(antes.t) : '') +
         (semana ? ' · ' + semana + ' nesta semana' : ''),
      acao: 'Anotar' });
  }
  const dias = diasDesdeAFoto(S.protocolo.sessoes, agora);
  const u = ultimaSessaoFoto(S.protocolo.sessoes);
  if (dias != null && dias >= CADENCIA_DIAS && u) {
    linhas.push(comeu
      ? { k: 'fotos', t: 'Fotos do corpo', v: 'amanhã cedo',
          d: 'faz ' + dias + ' dias · foto depois de comer não compara com as outras' }
      : { k: 'fotos', t: 'Fotos do corpo', v: 'faz ' + dias + ' dias',
          d: primeira ? 'em jejum, antes do ' + primeira.n.toLowerCase().replace(/^café da manhã$/, 'café') +
                        ' das ' + horaDita(primeira.t) : 'em jejum',
          acao: 'Nova sessão' });
  }
  return linhas;
};

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
      ? 'Continuar · ' + cHoje.feitas + ' de ' + cHoje.total
      : (hoje ? 'Refazer alguma pose' : 'Nova sessão'),
    podeComparar: lista.some(function (p) { return comAPose(S.protocolo.sessoes, p.id).length >= 2; }),
    soAqui: fotosSoAqui()
  };
};

/**
 * As fotos do corpo que só existem neste aparelho (a D, comparar, estado 10).
 * Enquanto um byte só existe aqui, ele está a um despejo de cache de sumir — e
 * a cópia de segurança em JSON leva as referências, não as fotos. Com conta, o
 * que não subiu é contado e sobe num toque; sem conta, a tela diz que tudo está
 * só aqui. Sem foto nenhuma, nada.
 */
function fotosSoAqui() {
  let total = 0, fora = 0;
  (S.protocolo.sessoes || []).forEach(function (ses) {
    Object.keys(ses.fotos || {}).forEach(function (pose) {
      const ref = ses.fotos[pose];
      if (!ref || !ref.v) return;
      total++;
      if (sync.fotos['corpo:' + ses.d + ':' + pose] !== ref.v) fora++;
    });
  });
  if (!total) return null;
  const n = function (x) { return x + (x === 1 ? ' foto' : ' fotos'); };
  if (!NUVEM.sessao()) {
    return { conta: false,
      t: total === 1 ? 'A foto do corpo existe só neste aparelho' : 'As ' + n(total) + ' do corpo existem só neste aparelho',
      p: 'A cópia de segurança leva as referências, não as fotos. Com a conta, elas sobem para a cópia remota.' };
  }
  if (!fora) return null;
  return { conta: true,
    t: (fora === 1 ? '1 foto ainda não subiu' : fora + ' fotos ainda não subiram') + ' para a cópia remota',
    p: (fora === 1 ? 'Ela não existe' : 'Elas não existem') + ' em outro lugar até subir.' };
}


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
/* ---- O modo de sessão ----
   A sessão deixa de ser aba e passa a ser MODO, com saída própria. O protótipo
   achou o defeito que isto conserta: instalado no iPhone não existe barra de
   navegador, e o dedo ficava preso dentro do treino, sem caminho para a comida.

   Entrar no modo NÃO é começar a sessão, e são coisas independentes de
   propósito: a sessão nasce na primeira série completa e o botão nunca foi
   pré-condição para gravar. O modo abre PRONTO, não iniciado.

   E sair do modo não encerra nada. A seta do cabeçalho fecha o modo e deixa a
   sessão aberta — é a saída que o protótipo não tinha. Encerrar é outra coisa,
   e mata a sessão, não o modo.

   A flag é tudo que estes dois fazem: a pilha de camadas é DERIVADA de `view`
   (`src/ui/navegacao.js`), então ligar a flag já faz o Voltar do sistema fechar
   o modo em vez de sair do app. `view.aba` fica intocada — o modo cobre a aba
   em que o dedo estava, e fechá-lo devolve o dedo lá. */
/**
 * Abre o modo SEM pintar, e diz se abriu.
 *
 * Três portas levam ao modo (frente 1, §4.4) e duas delas já arrumam a tela
 * antes de entrar — a faixa mexe em aba, dia e exercício aberto; o pouso do app
 * mexe em aba e dia. Essas duas querem um render só, no fim, e não o do meio.
 */
function abreModo() {
  if (view.modoSessao) return false;
  view.modoSessao = true;
  entraNoDestino('modoSessao');
  return true;
}

CTX.abreModoDeSessao = function () { if (abreModo()) render(); };

/**
 * Os AJUSTES: a conta, o aparelho e a cópia de segurança.
 *
 * Destino de tela cheia e não lugar — um botão no canto do Agora (§1.6). Entrou
 * como camada, então o Voltar do sistema e o Esc fecham por ele como por
 * qualquer outra.
 */
CTX.abreAjustes = function () {
  if (view.ajustes) return;
  view.ajustes = true;
  entraNoDestino('ajustes');
  render();
};
CTX.fechaAjustes = function () {
  if (!view.ajustes) return;
  view.ajustes = false;
  saiDoDestino('ajustes');
  render();
};

/**
 * A PORTA 1 do modo: o cartão de cima do Agora.
 *
 * As outras duas portas devolvem alguém a uma sessão que já existe (a faixa) ou
 * a reabrem no pouso do app. Esta é a que COMEÇA — e começar não é abrir
 * sessão: "entrar no modo é navegação", e a sessão nasce na primeira série
 * completa (frente 1, §4.4). Por isso aqui não há `abreSessao` nenhuma.
 *
 * O dia vem resolvido, e não de `view.day`: o cartão fala do treino de HOJE, e
 * o dedo pode ter deixado a letra em outro dia por outro caminho.
 *
 * E ela NÃO mexe em `view.aba`. Com a aba de treino, mexer era obrigatório — a
 * tela do treino era uma aba. Agora o modo é camada POR CIMA do lugar, e trocar
 * o lugar por baixo faria fechar o modo devolver a pessoa a outro lugar que não
 * o de onde ela entrou.
 */
/**
 * O menu `···` da sessão: o que é RARO, e por isso não fica à vista.
 *
 * Nasce com um item só — o deload —, e isso é por decisão e não por falta de
 * ideia. A decisão 6 do dono mandou o interruptor sair de Ajustes para cá, e o
 * argumento que caiu com ele era bom o bastante para ficar escrito:
 *
 *   "um interruptor que corta metade das séries não deve estar a um toque no
 *    meio de uma sessão. O app existe em parte para frear, e o caminho de menor
 *    esforço tem que ser o conservador."
 *
 * **O lugar ERA o freio**, e ele decidiu movê-lo sabendo disso — foi perguntado
 * duas vezes na mesma noite e manteve. Então o freio passa do LUGAR para a
 * PALAVRA: o item não é um interruptor com nome, é uma frase que diz **o corte
 * em número antes do toque** (frente 3, §7.6).
 *
 * Os números são do dado e não de exemplo: saem do prescrito do dia e da conta
 * do deload (`setsFor`), calculados na hora de abrir o menu.
 *
 * `null` sem treino no dia: não há séries a cortar.
 */
/**
 * Em que ponto do bloco ele está.
 *
 * Veio do cabeçalho do TREINO (achado 7 da frente 1): o ciclo responde "em que
 * ponto do bloco eu estou", que é a mesma pergunta que a retrospectiva responde
 * em prosa — e a retrospectiva é de Semana. No cabeçalho da sessão ele era a
 * terceira célula de uma linha que se lê de pé, no meio de uma série.
 *
 * A conta é por VOLTAS DA ROTAÇÃO e não por semanas: o ciclo é quantas vezes a
 * sequência inteira já passou, e por isso ele depende do tamanho dela — cinco
 * dias mais o HYROX, ou o que a rotação dele tiver. Contar em semanas daria o
 * número errado toda vez que ele treinasse mais ou menos que a rotação pede.
 */
/**
 * Os catorze dias que a regra do corte lê — as fatias e a contagem.
 *
 * §1.1 lista isto como posse do Agora, e o §5.7 o nomeia no estado mais mudo
 * que a tela tem: num dia de descanso fora de qualquer janela "ficam a linha do
 * dia, a água e A CONTAGEM DOS 14 DIAS, e não há cartão". Faltava — e pior, o
 * aviso de aparelho sem armazenamento que eu escrevi diz "não entra na conta
 * dos 14 dias", citando uma conta que não estava em tela nenhuma.
 *
 * **A janela é a mesma que o portão lê**, e é por isso que ela inclui a casa de
 * HOJE mesmo sabendo que ela vai estar vazia: `diasInterpretaveis` conta sobre
 * `S.comidaHist`, e o dia corrente só entra lá quando a data vira
 * (`fechaDiaDeComida`). Mostrar treze casas e contar sobre catorze faria a tela
 * e a regra discordarem — e a tela perderia, porque quem decide o corte é a
 * regra. A casa de hoje vazia é informação: o dia não fechou.
 *
 * `null` numa fatia é dia sem registro interpretável, e o primitivo desenha
 * casa vazia — é o que faz as catorze lerem como presença e ausência em vez de
 * um gráfico de zero e um.
 */
/**
 * O histórico de um exercício, a partir de uma linha do PROGRAMA.
 *
 * A porta que o achado 1 da frente 1 pede. `openHist(i)` indexa pelo
 * `view.day`, e no editor de programa o dia é o de `view.prog` — podia ser
 * outro. Aqui o dia vem explícito, e `view.day` o acompanha porque é dele que a
 * tela do histórico lê a prescrição da posição.
 *
 * As QUATRO capacidades que moravam só no cartão do exercício chegam por aqui:
 * o gráfico do "estou ficando mais forte nisto", a correção de uma série de
 * semanas atrás, o renome do exercício e o tipo de carga. Com a aba de treino
 * fora, o cartão só existe dentro do modo — e corrigir a série de três semanas
 * atrás não é tarefa de quem está treinando.
 */
CTX.abreHistoricoDaPrescricao = function (dia, i) {
  view.day = dia;
  openHist(i);
};

CTX.quatorzeDias = function () {
  const hoje = hojeISO();
  const porData = {};
  (Array.isArray(S.comidaHist) ? S.comidaHist : []).forEach(function (h) {
    if (h && h.d) porData[h.d] = h;
  });

  const fatias = [];
  for (let k = 13; k >= 0; k--) {
    const d = new Date(hoje + 'T12:00:00');
    d.setDate(d.getDate() - k);
    const h = porData[hojeISO(d.getTime())];
    fatias.push(h && diaInterpretavel(h) ? 1 : null);
  }

  const n = diasRegistrados();

  // AS CÉLULAS DA D (`agora-descanso.html`, estado 1): uma por dia, cheia quando
  // todas as refeições têm marca, em parte quando só algumas, vazia quando o dia
  // é desconhecido. A classificação é a da folha de pôr o dia em dia — a mesma
  // regra nos dois lugares. HOJE aparece na célula dele, mas a conta é a do
  // portão do nutricionista, que só lê dias fechados: hoje entra quando a data
  // vira (a D diz "hoje passou a contar"; ver a pergunta ao dono no checklist).
  const celulas = [];
  for (let k = 13; k >= 1; k--) {
    const d = new Date(hoje + 'T12:00:00');
    d.setDate(d.getDate() - k);
    const iso = hojeISO(d.getTime());
    const h = porData[iso];
    if (!h || !diaInterpretavel(h)) { celulas.push({ iso: iso, estado: 'vazio' }); continue; }
    const f = CTX.poeODiaEmDia(iso);
    const marcadas = f ? f.linhas.filter(function (l) { return !l.sugerida && l.marca !== 'vazia'; }).length : 0;
    celulas.push({ iso: iso, estado: f && marcadas >= f.linhas.length ? 'cheio' : 'parte' });
  }
  const hojeDia = diaDeComida();
  const marcadasHoje = Object.keys(hojeDia.done || {}).length;
  const H = CTX.hoje();
  celulas.push({ iso: hoje, estado: 'hoje' + (marcadasHoje ? (marcadasHoje >= H.refs.length ? ' cheio' : ' parte') : '') });

  const d0 = new Date(hoje + 'T12:00:00'); d0.setDate(d0.getDate() - 13);
  const dOntem = new Date(hoje + 'T12:00:00'); dOntem.setDate(dOntem.getDate() - 1);
  const isoOntem = hojeISO(dOntem.getTime());
  const cOntem = celulas[12];
  const nomeOntem = DIAS_LONGOS[dOntem.getDay()];
  let ontem = null;
  if (cOntem.estado === 'vazio') ontem = { iso: isoOntem, txt: 'Ontem, ' + nomeOntem + ', ficou sem marca.' };
  else if (cOntem.estado === 'parte') {
    const f = CTX.poeODiaEmDia(isoOntem);
    const m = f.linhas.filter(function (l) { return !l.sugerida && l.marca !== 'vazia'; }).length;
    ontem = { iso: isoOntem, txt: 'Ontem, ' + nomeOntem + ': ' + m + ' de ' + f.linhas.length + ' refeições com marca.' };
  }

  return {
    celulas: celulas,
    primeiro: DIAS_CURTOS[d0.getDay()] + ' ' + fmtDate(d0.getTime()),
    conta: 'Dias conhecidos nos últimos 14: ',
    regra: 'A regra do nutricionista precisa de ' + MIN_REGISTRADOS + '.',
    hojeExplica: marcadasHoje ? 'Hoje tem refeição marcada, e entra na conta quando o dia fechar.' : null,
    ontem: ontem,
    fatias: fatias,
    registrados: n,
    pede: MIN_REGISTRADOS,
    // O portão é do nutricionista e o número não é negociável. A tela diz onde
    // ele está sem transformar isso em nota: contagem, nunca percentual.
    txt: n + ' de 14 dias com registro',
    nota: n >= MIN_REGISTRADOS
      ? 'a regra pede ' + MIN_REGISTRADOS + ' · o portão da adesão está aberto'
      : 'a regra pede ' + MIN_REGISTRADOS + ' para mexer nas calorias',
    aberto: n >= MIN_REGISTRADOS
  };
};

CTX.cicloDoBloco = function () {
  const treinos = rot().length;
  return {
    sessoes: S.done.length,
    treinos: treinos,
    ciclo: String(Math.floor(S.done.length / treinos) + 1)
  };
};

CTX.menuDaSessao = function () {
  const d = view.day;
  const deload = itemDoDeload(d);
  if (!deload) return null;
  return {
    // "Encerrar o treino · o fim é agora, 7h31": o que o toque grava, com o
    // número, antes do toque (V4). Só existe com sessão aberta.
    encerrar: S.sessao ? { rotulo: 'Encerrar o treino', detalhe: 'o fim é agora, ' + fmtHoraDita(Date.now()) } : null,
    deload: deload
  };
};

CTX.abreTreinoDeHoje = function () {
  const h = diaResolvido();
  if (!h.treino) return;               // dia de descanso: não há treino a abrir
  view.day = h.treino;
  view.swapOpen = null;
  abreModo();
  render();
};

// ---------- enquanto descansa (a D, momento 1, estado 2) ----------
//
// No descanso, dentro da sessão, o que se faz a um toque cada: a refeição de
// antes do treino, um copo de água e o peso de hoje (F30: 7 de 11 pesagens
// entraram entre 6h28 e 7h52 — no meio do treino). Só enquanto o descanso
// conta, e só no modo: fora dele, o Agora já tem as três linhas.
const COPOS_DO_DIA = 14;
CTX.enquantoDescansa = function () {
  if (!view.modoSessao || !timerFim) return null;
  const H = CTX.hoje();
  const d = H.comidaDoDia;
  // A refeição de antes do treino é a condicional ao treino que vem antes dele:
  // antes da linha do treino no plano, ou, sem ela, antes do início da sessão.
  const linha = H.refs.filter(ehLinhaDeTreino)[0] || null;
  const limite = linha ? minutosDe(linha.t)
    : S.sessao ? new Date(S.sessao.inicio).getHours() * 60 + new Date(S.sessao.inicio).getMinutes() : -1;
  const pre = H.refs.filter(function (r) {
    return !ehLinhaDeTreino(r) && r.quando === 'treino' && minutosDe(r.t) <= limite;
  }).slice(-1)[0] || null;
  const ag = CTX.agua();
  const pesoHoje = (S.body.peso || []).filter(function (x) { return sameDay(x.t, Date.now()); }).slice(-1)[0];
  return {
    pre: pre ? { id: pre.id, n: pre.n, comeu: !!d.done[pre.id] } : null,
    agua: { n: ag.n, meta: COPOS_DO_DIA, falhou: ag.falhou },
    peso: pesoHoje ? comUnidade(pesoHoje.v, 'kg') : null
  };
};
/** O toque na refeição de antes do treino: marca "comi tudo"; marcada, desfaz. */
CTX.preNoDescanso = function () {
  const e = CTX.enquantoDescansa();
  if (!e || !e.pre) return;
  CTX.marcaLinhaDaComida(e.pre.id, e.pre.comeu ? 'desfaz' : 'tudo');
};
CTX.abrePesoNoDescanso = function () {
  // "Peso de HOJE": uma data passada armada na tela do corpo não vale aqui
  if (view.bodyDia && view.bodyDia.peso) {
    view.bodyDia = Object.assign({}, view.bodyDia);
    delete view.bodyDia.peso;
  }
  CTX.abreFolha({ k: 'pesoRapido' });
};
CTX.pesoRapido = function () {
  const c = CTX.corpo().peso;
  return { valor: c.valor, teclado: CTX.tecladoDoCorpo('peso') };
};
CTX.registraPesoRapido = async function () {
  const m = Date.now();
  await addBody('peso');
  // só fecha se gravou: valor inválido deixa a folha aberta, com o aviso dito
  const gravou = (S.body.peso || []).some(function (x) { return x.m >= m && sameDay(x.t, m); });
  const p = view.pilha || [];
  if (gravou && p.length && p[p.length - 1].k === 'pesoRapido') { pilha().pop(); render(); }
};

CTX.fechaModoDeSessao = function () {
  if (!view.modoSessao) return;
  view.modoSessao = false;
  saiDoDestino('modoSessao');
  render();
};

function entraNoDestino(chave) {
  scrollDoDestino[chave] = window.scrollY;
  window.scrollTo(0, 0);
}

/** Fim de fluxo: o destino fechou, e a posição guardada não serve mais. */
function esqueceDestino(chave) { delete scrollDoDestino[chave]; }

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
  falaPose(v.pose);
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

/**
 * O DISPARO, dito sem palavra nenhuma (a D, `sessao-fotos.html`, estado 3): o
 * som do obturador, um clarão curto e o bloco da pose fechando. Os três dizem a
 * mesma coisa por canais diferentes — se o som estiver desligado, o clarão e o
 * bloco continuam valendo. O alarme do descanso, que tocava aqui, é de outra
 * coisa.
 */
function obturador() {
  try {
    if (!audioCtx) preparaAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t0 = audioCtx.currentTime, n = Math.floor(audioCtx.sampleRate * 0.09);
    const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const src = audioCtx.createBufferSource(), g = audioCtx.createGain();
    src.buffer = buf; g.gain.setValueAtTime(0.6, t0);
    src.connect(g); g.connect(audioCtx.destination);
    src.start(t0);
  } catch (e) {}
}
function clarao() {
  if (!view.camera) return;
  view.camera.clarao = Date.now();
  setTimeout(function () { if (view.camera) { view.camera.clarao = null; render(); } }, 320);
}
/**
 * A instrução por VOZ (a D, estado 2, hipótese B): a três metros nada precisa
 * ser lido. A pose e o primeiro passo dela, em português; sem síntese de voz no
 * aparelho, o desenho da tela segue valendo sozinho.
 */
function falaPose(poseId) {
  try {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
    const lista = posesDo(S.protocolo.poses);
    const i = lista.findIndex(function (p) { return p.id === poseId; });
    const p = lista[i];
    if (!p) return;
    const u = new SpeechSynthesisUtterance('Pose ' + (i + 1) + ' de ' + lista.length + '. ' + p.n + '. ' +
                                           (Array.isArray(p.como) && p.como[0] ? p.como[0] : ''));
    u.lang = 'pt-BR';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
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
    const r = await guardaFotoDaPose(v.d, v.pose, reduzida);
    c.contagem = null;
    // não coube: a sessão para aqui, e a tela diz (estado 9)
    if (r && r.parou) { aviso(); render(); return; }
    const prox = r;
    // a sessão continua AQUI: são nove poses, e sair e voltar nove vezes seria
    // pior que o problema que esta tela resolve
    const viz = prox ? vizinhaComAPose(S.protocolo.sessoes, prox, v.d) : null;
    if (prox) {
      c.fantasmaD = viz ? viz.d : null;
      garanteBytesDoCorpo(viz ? [viz.d] : []);
    }
    obturador(); clarao();
    if (prox) falaPose(prox);
    render();
    if (!prox) toast('Sessão completa. As nove poses estão registradas.');
  } catch (e) {
    c.contagem = null;
    toast('Não deu para guardar a foto.');
    render();
  }
}

/** "A pose 6, perfil esquerdo, não foi guardada" — o que a tela diz quando a sessão parou. */
function avisoDaPoseNaoGuardada(lista) {
  const ng = view.protocolo && view.protocolo.naoGuardada;
  if (!ng) return null;
  const i = lista.findIndex(function (p) { return p.id === ng.pose; });
  const p = lista[i];
  return {
    titulo: 'A pose ' + (i + 1) + (p ? ', ' + p.n.toLowerCase() + ',' : '') + ' não foi guardada',
    texto: ng.motivo === 'foto'
      ? 'O aparelho recusou a foto: o espaço dele está cheio. Ela está na memória enquanto o app estiver aberto, e a sessão parou aqui.'
      : 'A foto entrou no aparelho, mas o registro dela não gravou. A sessão parou aqui, e nada do que já foi guardado saiu.',
    copia: ng.motivo === 'registro'
  };
}
CTX.tentaFotoDaPose = async function () {
  const v = view.protocolo, ng = v && v.naoGuardada;
  if (!ng) return;
  if (ng.motivo === 'foto' && ng.reduzida) {
    const r = await guardaFotoDaPose(v.d, ng.pose, ng.reduzida);
    if (!(r && r.parou) && r) v.pose = r;
  } else if ((await save()) !== false) {
    v.naoGuardada = null;
  }
  render();
};

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
    naoGuardada: avisoDaPoseNaoGuardada(lista),
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
    contagem: c.contagem,
    clarao: !!c.clarao,
    // os blocos das poses, do tamanho de um dedo (estado 2): em que pose está,
    // e quais já fecharam, legível a três metros
    pontos: lista.map(function (p) {
      return { id: p.id, n: p.n, feita: !!(ses && ses.fotos[p.id]), atual: p.id === v.pose,
               naoGuardada: !!(v.naoGuardada && v.naoGuardada.pose === p.id) };
    })
  };
};
