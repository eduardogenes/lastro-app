import {
  ROT_BASE, D_COMPOSTO, D_MAQUINA, D_MEDIO, D_ISOLADOR, D_CURTO,
  PROGRAMA, RULES, ALT, slugEx, EX_BASE, FREQUENTES_NO_BOX,
  PRIORIDADES, NIVEIS, nivelDe, ordemDe, regiaoDe, REGIOES, ehPriorizado, PRIO, CARGAS, DORES, MODAIS,
  MOVIMENTOS_DE_BOX
} from './dominio/programa';
import { caixaDeFrase as _caixaDeFrase,
  fmtNum, fmtCarga, fmtInt, fmtDec, fmtSig, fmtDec2, fmtSig2, fmtK, casaBusca, fmtHoraDita,
  DIAS_CURTOS, DIAS_LONGOS, MESES, PERIODOS, periodoDe,
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
import { tempo as tempoDoMovimento, pontoDentro, protegeSegundoToque, TOQUE_DUPLO_MS, trocaDeCamada } from './ui/movimento.js';
import { ehBancada } from './palco.js';
import { SONDA } from './ui/sonda.js';
import { MIN_PESAGENS as MIN_PESAGENS_CORPO, semanaEmCurso, ajusteDoVeredito, leituraVigente, JANELA_MIN, JANELA_MAX, VALIDADE_LEITURA, MIN_REGISTRADOS, ALVO_MIN, ALVO_MAX, leituraDaEvolucao, portoesDaRegra, semanasDaRegra } from './dominio/corpo';
import { ondeEleEstava, proximoDepois, intervaloLongo } from './dominio/sessao';
import { entendeuAlgo, interpretaTexto } from './dominio/textolivre';
import { corpoVazio, estadoInicial, passoValido } from './dominio/primeira-vez';
import { cartaoDeCima } from './dominio/agora';
import { venceuPorPosicao } from './dominio/prescricao';
import { leAula } from './dominio/aula';
import { lerRevisao, casaNomes, nomesNoMesmoId, MODELO_DA_REVISAO, treinoDaRevisao, mudancasDoTreino, mudancasDosExercicios, aplicaMudancas } from './dominio/revisao';
import { regua, pagina, anda, faixaDoTexto } from './dominio/regua';
import { teclar } from './dominio/teclado';
import { e1rmPorSemana, sinalDeForca, tendenciaDeForca, textoDaTendencia } from './dominio/forca';
import { App } from './ui/app.jsx';
import { DESTINOS_V3, FOLHAS_V3 } from './ui/v3/telas.js';
import { estadoDosAgentes, resumoDosAgentes } from './dominio/agentes';
import { ligado, fitaLigada, comModulo, comFita, normalizaModulos } from './dominio/modulos';
import { DIAS_NA_LIXEIRA, chaveDaLixeira, diasRestantes, nomeNaLixeira, ordemDaLixeira, pastaDaLixeira, vencidos as vencidosDaLixeira } from './dominio/lixeira';
import { LugarNaPilha, FolhaDaPilha } from './ui/v3/camada.js';
import { CADENCIA_PADRAO, diaDeHoje, previsaoDoHorizonte, proximoTreino, rotacao } from './dominio/dia';
import { programasDe, garanteProgramas, programaDaSessao, programaEm, conteudoDe, estadoDoPrograma, ativaPrograma, criaPrograma,
         duplicaPrograma, renomeiaPrograma, nomeReserva, nomeLivre, programaComNome, treinosDe, diasAbertos, semanaDoAtivo,
         periodoDe as periodoDoPrograma, balancoDoPrograma, revisoesDoPrograma, inicioDoAtivo, sessoesDoAtivo } from './dominio/programas';
import { diasComTreino as _diasComTreino, inicioDoDia as _inicioDoDia, iniciosDoPeriodo as _iniciosDoPeriodo, medianaDosInicios as _medianaDosInicios, leituraDosDias as _leituraDosDias,
         serieDaMediaMovel as _serieDaMediaMovel } from './dominio/mes';
import { ALIMENTOS_BASE, PLANO_BASE, TURNOS } from './dominio/nutricao/alimentos';
import {
  aplicaAjusteNoArroz, tiraMarcaDeArroz, listaDeCompras, totalDaRefeicao, totalDoDia,
  refeicoesDeHoje, posTreinoDe, refeicoesMovidas, duracaoDaSessao, minutosDe,
  fechaDia, aderenciaDoDia, padraoPorRefeicao, comidaDaResposta, respostaDoDia, janelaDoHistorico, diasInterpretaveis, diaInterpretavel,
  aderenciaPorSemana, contagemDaRefeicao, recorteDoHistorico, trocasDeAjuste,
  poeComidaNoDia, resumoDaRefeicao, FOLGA_POS, fmtKg, ehTamanhoDaOutra, tamanhosDaMarca
} from './dominio/nutricao/calculo';
import { alvoDoPrograma, seriesDeGrupo, impacto, impactoDoMod as _impactoDoMod,
         seriesPorMusculo as _seriesPorMusculo, leituraDaSemana, treinosQueVem, somaPorGrupo } from './dominio/volume';
import { MARCAS_DO_CORPO, MARCAS_DA_BIO, MEDIDAS_DO_CORPO, MEDIDAS_DE_FITA, REGRA_DA_FITA, REGRA_DA_DOBRA, MEDIDAS_DE_DOBRA, ORDEM_DE_MEDIR, CONFERIR_ACIMA, doMeio, mediaDaFita, pedeTerceira, passoDaLeitura, naMesmaData, pesoDaSemana, medidaDoCorpo, ondeMediu,
         mediasSemanais, pesoRitmo as _pesoRitmo,
         cinturaMes as _cinturaMes, veredito as _veredito } from './dominio/corpo';
import { PAUSA_DIAS, diasDesde, historico as _historico, historicoDeReferencia as _historicoDeReferencia, lastSet as _lastSet,
         pausaEx as _pausaEx, dorSeguida as _dorSeguida, shouldUp as _shouldUp,
         setsFor as _setsFor, proximaCarga, estadoDaProgressao } from './dominio/progressao';
import { MOTIVOS_FALTA, respondeFrequencia, uneFrequencia } from './dominio/frequencia';
import { PLANO_ATUAL, listaDePromo, migraPlano, migraPlano3, migraPlano4, migraPlano5, migraPlano6, migraPlano7, migraPlano8, migraPlano9, migraPlano10, migraPlano11, migraPlano12, migraPlano13, reduzReferencias, corrigeApelidosErrados } from './dominio/migracoes';
import { semeiaProg, montaCatalogo as _montaCatalogo, exercicioFantasma } from './dominio/programa';
import { SEMENTE, exerciciosDoSistema, indiceDeNomes, comDiferenca, diferencaDaSemente, catalogoDasLinhas, chaveDoNome, maisNova, equipamentoDe, EQUIPAMENTOS, midiaDo } from './dominio/catalogo';
import { paresDoTreino, proximaDoPar, depoisDaSerie, separaPegada } from './dominio/biset';
import { DB } from './infra/db';
import {
  chaveDeAula, chaveDeCardio, chaveDeFoto, chaveDeFotoDoCorpo, chaveDeLog,
  chaveDeMarca, chaveDePromo, chaveDeRefeicaoFeita, chaveDeSessaoFoto, chaveDeSessao, funde, soTemAbertura,
  lapidesDoApagamento, uneLapides, uneDiasDeComida, DOCUMENTOS, valorDoDocumento, TETO, TETO_PEDIDOS, chaveDeCatalogo, chaveDeApelido
} from './dominio/sincronia';
import { NUVEM } from './infra/nuvem';
import * as FOTO from './infra/fotos';
import * as CORPO from './infra/corpo';
import * as LOUSA from './infra/lousa';
import * as CAM from './infra/camera';
import * as NIVEL from './infra/nivel';
import * as POSE from './infra/pose';
import { alinhamentoAutomatico, leCorpo, parado, rastroDe } from './dominio/deteccao';
import { exifDoArquivo } from './infra/exif';
import {
  CADENCIA_DIAS, CONFERE_SEMPRE, FALA_DO_AJUSTE, FALA_DO_FIM, PASSOS_DO_AJUSTE,
  comAPose, completude, montagem as montagemDe, mudancasDaSessao, ressalvaDaSessao, textoDaMudanca, tituloDoFim,
  pontaParaTrocar, seloDaSessao,
  diasDesde as diasDesdeAFoto, instanteDaData, mediaDaSemana, parPadrao,
  poseDe, poses as posesDo, posesDaData, proximaPose, quaseTodoPreto, referencia, sessaoDe,
  ultima as ultimaSessaoFoto, vizinhaComAPose
} from './dominio/protocolo';
import { LUZES, apagadas, liberado, luzes, nomesDoFora } from './dominio/captura';
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
/**
 * Marca o registro como apagado agora e devolve o instante. Quem recria o
 * registro na MESMA chave logo em seguida (refazer uma pose, corrigir a medida
 * de um dia) carimba o novo com `depoisDe(morte)`: no mesmo milissegundo, a
 * lápide venceria o empate na fusão e mataria o registro novo no outro aparelho.
 */
function lapide(chave, quando) {
  if (!S.apagados || typeof S.apagados !== 'object') S.apagados = {};
  const t = quando == null ? Date.now() : quando;
  S.apagados[chave] = t;
  return t;
}
function depoisDe(morte) { return Math.max(Date.now(), (morte || 0) + 1); }
function rot() { return rotacao(S, ROT_BASE); }

// ---------- os programas (dominio/programas.ts) ----------
/** O programa que valia num instante, para uma letra (a letra de antes da troca leva ao programa de antes). */
/**
 * O instante que decide o programa de um DIA (L1 da revisão de dado): o fim
 * daquele dia, e hoje, agora. O cartão, a gravação e a prescrição usam o mesmo,
 * para o dia da troca não mostrar um programa e gravar em outro.
 */
function instanteDoDia(t) {
  const fim = new Date(t); fim.setHours(23, 59, 59, 999);
  return Math.min(fim.getTime(), Date.now());
}
/** O programa de um dia; `escolhido` é o "Foi de outro programa" do cartão. */
function programaDoDia(t, escolhido) {
  const P = programasDe(S);
  if (!P) return null;
  if (escolhido && P.lista[escolhido] && P.lista[escolhido].estado !== 'proximo' && P.lista[escolhido].estado !== 'rascunho') return escolhido;
  return programaEm(S, instanteDoDia(t));
}
/** A sessão nova leva o programa em que foi feita: a letra deixa de ser a chave. */
function marcaPrograma(marca, id) {
  const P = programasDe(S);
  if (!P) return marca;
  marca.prog = id || P.ativo;
  return marca;
}
/** A rotação de um programa, com os abertos (o HYROX), que valem com qualquer um. */
function rotDoPrograma(id) {
  const P = programasDe(S);
  if (!P || !id || id === P.ativo) return rot();
  const c = conteudoDe(S, id);
  return c ? c.rot.filter(function (d) { return c.prog[d]; }).concat(diasAbertos(S.prog).filter(function (d) { return c.rot.indexOf(d) < 0; })) : rot();
}
/** Os treinos de um programa, com os abertos de hoje. */
function progDoPrograma(id) {
  const P = programasDe(S);
  if (!P || !id || id === P.ativo) return S.prog || {};
  const c = conteudoDe(S, id);
  return c ? Object.assign({}, c.prog, Object.fromEntries(diasAbertos(S.prog).map(function (d) { return [d, S.prog[d]]; }))) : (S.prog || {});
}
/** Um treino que não está no ativo, mas num programa guardado (a sessão de antes da troca). */
function treinoGuardado(d) {
  const P = programasDe(S);
  if (!P) return null;
  // só os que já foram o ativo: o de "Próximo" e o rascunho nunca tiveram sessão
  const ids = Object.keys(P.lista).filter(function (id) { return id !== P.ativo && P.lista[id].estado === 'guardado'; })
    .sort(function (a, b) { return (P.lista[b].m || 0) - (P.lista[a].m || 0); });
  for (const id of ids) { const c = conteudoDe(S, id); if (c && c.prog[d]) return c.prog[d]; }
  return null;
}

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
// O catálogo do SISTEMA (docs/catalogo/00-desenho.md): a semente embutida, ou a
// cópia mais nova que veio do banco. `CAT` é ele com o `S.ex` da pessoa por cima.
let SISTEMA = SEMENTE;
let EX_SISTEMA = exerciciosDoSistema(SEMENTE);
let NOMES_ALT = indiceDeNomes(SEMENTE);
function montaCatalogo() { CAT = _montaCatalogo(S.ex, EX_SISTEMA); }
function usaSistema(c) {
  SISTEMA = c; EX_SISTEMA = exerciciosDoSistema(c); NOMES_ALT = indiceDeNomes(c);
  montaCatalogo();
}

/** Os nomes alternativos de um exercício do sistema (para a busca). */
function nomesAltDe(id) { return (SISTEMA.ex[id] && SISTEMA.ex[id].alt) || []; }

/** Apelidos dele como mapa nome → id (o formato que `casaNomes` lê). */
function mapaDeApelidos() {
  const m = {};
  Object.keys(S.apelidos || {}).forEach(function (k) { const a = S.apelidos[k]; if (a && a.id) m[k] = a.id; });
  return m;
}

// A cópia do catálogo no aparelho guarda só a diferença para a semente
// (`diferencaDaSemente`). Sem cópia, ou cópia recusada, vale a semente.
const CHAVE_CATALOGO = 'lastro-catalogo-v1';
async function carregaCatalogo() {
  try {
    const r = await DB.get(CHAVE_CATALOGO);
    const c = r && r.value ? comDiferenca(SEMENTE, JSON.parse(r.value)) : null;
    if (c) usaSistema(c);
  } catch (e) { /* cópia ilegível: segue a semente */ }
}
let catalogoPedidoEm = 0;
async function atualizaCatalogo() {
  // uma vez por hora no máximo: o catálogo muda pela mão do moderador, raramente
  if (Date.now() - catalogoPedidoEm < 3600000) return;
  catalogoPedidoEm = Date.now();
  try {
    const r = await NUVEM.catalogo(SISTEMA.v);
    if (!r.ok || !r.v) return;
    // duas perguntas: a cópia serve (todos os ids desta semente, nenhuma troca
    // de carga) e é mais nova que a que o aparelho já usa
    const c = catalogoDasLinhas(r.v, SEMENTE);
    if (!c) { console.warn('catálogo do banco recusado: falta id da semente, troca de carga ou linha inválida'); return; }
    if (!maisNova(c, SISTEMA)) return;
    usaSistema(c);
    await DB.set(CHAVE_CATALOGO, JSON.stringify(diferencaDaSemente(c, SEMENTE)));
    render();
  } catch (e) { console.warn('catálogo do banco não atualizou', e); }
}
function exDe(x) { return CAT[x] || exercicioFantasma(x); }
function nomeEx(x) { return exDe(x).n; }

/** O nome que o exercício tem no CÓDIGO, quando ele vem de lá. */
function nomeDoCodigo(idEx) { return (EX_SISTEMA[idEx] && EX_SISTEMA[idEx].n) || null; }

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
  delete marca.m;
  if (doCodigo && doCodigo === nome) {
    // voltou ao nome do treinador: o override some em vez de virar cópia — e a
    // saída deixa lápide, senão o outro aparelho traria o nome velho de volta
    delete marca.n;
    if (Object.keys(marca).length) S.ex[idEx] = Object.assign(marca, { m: Date.now() });
    else { delete S.ex[idEx]; lapide(chaveDeCatalogo(idEx)); }
  } else {
    marca.n = nome;
    S.ex[idEx] = Object.assign(marca, { m: Date.now() });
  }

  montaCatalogo();
  await save(); render();
  toast(doCodigo && doCodigo === nome ? 'Nome do treinador de volta.' : 'Nome trocado.');
}


// O treino como ele aparece na tela: slot resolvido contra o catálogo, com os
// mods da sessão de hoje aplicados por cima. Mesma forma dos exercícios de
// antes, para o resto do app não precisar saber de nada disso.
function treino(d) {
  const p = (S.prog && S.prog[d]) || treinoGuardado(d);
  if (!p) return null;
  return treinoResolvido(d, p, !!(S.prog && S.prog[d]));
}
/**
 * O treino de uma sessão JÁ FEITA: o do programa em que ela foi feita (L3 da
 * revisão de dado). A mesma letra em dois programas é treino diferente.
 */
function treinoDaSessao(m) {
  if (!m || !m.day) return null;
  const P = programasDe(S);
  if (P) {
    const id = programaDaSessao(S, m);
    if (id && id !== P.ativo) {
      const c = conteudoDe(S, id);
      const p = c && c.prog[m.day];
      if (p) return treinoResolvido(m.day, p, false);
    }
  }
  return treino(m.day);
}
function treinoResolvido(d, p, comMods) {
  return { name: p.name, tag: p.tag, aberto: p.aberto, ex: (comMods ? aplicaMods(d, p.ex) : p.ex).map(function (sl) {
    const e = exDe(sl.id);
    // A grandeza do SLOT vence a do catálogo: o mesmo remo é 500 m num sábado
    // e 15 cal no outro, e quem decide é a lousa do box. O catálogo só diz com
    // o que o campo nasce preenchido.
    return { id:sl.id, n:e.n, car:e.car, g:e.g, c:e.c, cue:e.cue, u:sl.u || e.u,
             q:sl.q, lado:sl.lado, peg:e.peg, pegPe:e.pegPe,
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

/** O `S.body` de um backup, chave por chave. O que não for lista vira lista. */
function corpoDoBackup(body) {
  const b = corpoVazio();
  if (!body || typeof body !== 'object') return b;
  MARCAS_DO_CORPO.forEach(function (k) { if (Array.isArray(body[k])) b[k] = body[k]; });
  return b;
}





let S = estadoInicial();
let view = { day:'A', open:null, hist:null, json:null, paste:false, swapOpen:null, sessao:null, modoSessao:false, edit:null, retro:false, nota:null, carga:null, mes:0, diaDoMes:null, add:null, cardioRapido:false,
  editProg:false, addEx:false, addQ:'', novoEx:false, prog:null, medida:null, aulas:false, rapido:false,
  protocolo:null, comparar:null, evolucao:null, diaAberto:null, ajuste:null, camera:null, ajustes:false };
let timer = null, timerFim = 0, timerTotal = 0, timerAvisado = false, timerCtx = '';
let audioCtx = null, wakeLock = null, querSegurar = false;
// O som nasce meio segundo depois de entrar no modo (`preparaAudioDepois`). Aqui
// em cima, e não ao lado dela, pela mesma razão de `desligado`: o boot pode
// entrar no modo ainda na avaliação deste módulo.
const ESPERA_DO_SOM_MS = 500;
let somAgendado = null;


const STORE_LABEL = {
  host:  'armazenamento do Claude.ai, com cópia no navegador',
  local: 'armazenamento local deste navegador',
  mem:   'apenas na memória desta aba — nada será salvo ao fechar'
};

// ---------- estado ----------
// Padrões de campos novos e formas inválidas. Roda no boot e na importação:
// um backup antigo tem que chegar às migrações no mesmo estado que o disco.
function normalizaEstado() {
  if (!passoValido(S.primeiraVez)) delete S.primeiraVez;
  if (!S.cadencia || S.cadencia.length !== 7) S.cadencia = S.primeiraVez ? Array(7).fill('descanso') : CADENCIA_PADRAO.slice();
  if (!S.comida || typeof S.comida !== 'object') S.comida = { plano: null, alimentos: {}, ocultos: {} };
  planoDeComida();
  if (!S.comida.alimentos || typeof S.comida.alimentos !== 'object') S.comida.alimentos = {};
  if (!S.comida.ocultos || typeof S.comida.ocultos !== 'object') S.comida.ocultos = {};
  if (!S.compras || typeof S.compras !== 'object') S.compras = { comprado:{}, extras:[], removidas:{}, dias:7 };
  if (typeof S.ajuste !== 'number' || !isFinite(S.ajuste)) S.ajuste = 0;
  S.ajuste = Math.round(S.ajuste);
  if (!Array.isArray(S.ajusteHist)) S.ajusteHist = [];
  if (!Array.isArray(S.gordura)) S.gordura = [];
  if (S.perfManual !== true && S.perfManual !== false) S.perfManual = null;
  // o que aparece (dominio/modulos.ts): só chaves conhecidas; ausente = padrão
  S.modulos = normalizaModulos(S.modulos);
  if (!S.apelidos || typeof S.apelidos !== 'object' || Array.isArray(S.apelidos)) S.apelidos = {};
  // os pedidos de avaliação (visual novo): só os bem formados; sem nenhum, some
  if (S.paraAvaliar !== undefined) {
    const ok = Array.isArray(S.paraAvaliar) ? S.paraAvaliar.filter(function (p) {
      return p && typeof p.t === 'number' && /^\d{4}-\d{2}-\d{2}$/.test(String(p.de)) && /^\d{4}-\d{2}-\d{2}$/.test(String(p.ate)) &&
             (p.pose === 'todas' || !!poseDe(p.pose));
    }) : [];
    if (ok.length) S.paraAvaliar = ok; else delete S.paraAvaliar;
  }
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
  if (!S.lousa || typeof S.lousa !== 'object' || !S.lousa.d || !S.lousa.v) S.lousa = null;
  if (!S.progTreinador || typeof S.progTreinador !== 'object' || !S.progTreinador.dias ||
      typeof S.progTreinador.dias !== 'object' || !Array.isArray(S.progTreinador.rot)) S.progTreinador = null;
  if (!Array.isArray(S.comidaHist)) S.comidaHist = [];
  // O tamanho do "comi outra coisa" (18/11/2026): campo novo e opcional, sem
  // migração — ausente é "não foi perguntado", e as marcas de antes continuam
  // valendo como estão. Aqui só sai o que a invariante não deixa (valor
  // desconhecido, refeição sem marca `'fora'`): a cópia colada à mão e o
  // aparelho com build antigo chegam pelo mesmo caminho.
  const limpaTamanho = function (h) {
    if (!h || typeof h !== 'object' || h.tam === undefined) return;
    const tam = tamanhosDaMarca(h);
    if (tam) h.tam = tam; else delete h.tam;
  };
  limpaTamanho(S.dia);
  S.comidaHist.forEach(limpaTamanho);
  if (typeof S.mtime !== 'number') S.mtime = 0;
  if (!S.carimbos || typeof S.carimbos !== 'object') S.carimbos = {};
  if (typeof S.carimbosEm !== 'number') S.carimbosEm = 0;
  if (!S.apagados || typeof S.apagados !== 'object') S.apagados = {};
  Object.assign(S, uneFrequencia(S, {}, S.apagados));
  if (!S.fotos || typeof S.fotos !== 'object') S.fotos = {};
  // O protocolo de fotos entra como campo novo e opcional — sem migração, que
  // é para reformatar dado existente, e aqui não há dado existente. Um backup
  // de qualquer versão anterior chega aqui pelo mesmo caminho que o disco.
  if (!S.protocolo || typeof S.protocolo !== 'object') S.protocolo = { poses: null, sessoes: [] };
  if (!Array.isArray(S.protocolo.sessoes)) S.protocolo.sessoes = [];
  if (!Array.isArray(S.protocolo.poses) || !S.protocolo.poses.length) S.protocolo.poses = null;
  S.protocolo.sessoes.forEach(function (x) { if (!x.fotos || typeof x.fotos !== 'object') x.fotos = {}; });
  // a lixeira das fotos do corpo (13/11/2026): campo novo e opcional, sem migração
  if (!Array.isArray(S.lixeira)) S.lixeira = [];
  S.lixeira = S.lixeira.filter(function (x) { return x && typeof x.d === 'string' && x.pose && x.ref && typeof x.ref.v === 'number' && typeof x.em === 'number'; });
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

/**
 * O texto guardado que não pôde ser lido vai para uma chave à parte antes de
 * qualquer gravação. "Mantido intacto" valia só até o primeiro toque: a
 * gravação seguinte escrevia o estado vazio por cima, e sem conta o histórico
 * se perdia de vez. A cópia fica para ser recuperada à mão.
 */
async function guardaIlegivel(chave, bruto) {
  if (!bruto) return;
  try {
    await DB.set(chave + '-ilegivel-' + Date.now(), bruto);
    registroIlegivel = true;
  } catch (e) { console.error('não deu para guardar a cópia do registro ilegível', e); }
}
let registroIlegivel = false;

function migraEstado() {
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
  migraPlano13(S);
  // não é plano: roda sempre, e é idempotente (dominio/migracoes.ts)
  reduzReferencias(S);
  corrigeApelidosErrados(S);
  garanteProgramaERotacao();
  // não é plano: cria `S.programas` uma vez, de forma determinística (dominio/programas.ts)
  if (garanteProgramas(S)) programasNovos = S.programas && S.programas.separados ? 'separou' : 'criou';
  return { arquivados, m3, m7 };
}

// A migração dos programas mexe no dado depois de a abertura (ou a fusão) já
// ter dito "o que está aqui não é mudança" (`lembraDocumentos`). O carimbo dela
// sai do DADO, nunca do relógio (P1–P3 da revisão de dado): dois aparelhos que
// migram o mesmo estado carimbam igual, e uma migração atrasada não vence o que
// outro aparelho já decidiu.
// - "criou" (um programa só, nada muda nos treinos): carimbo mínimo, 1.
// - "separou": um acima do maior carimbo de prog, rot e progTreinador, para o
//   aparelho no build 13 adotar a separação em vez de devolver o programa somado.
let programasNovos = null;
function carimbaProgramasNovos() {
  if (!programasNovos) return false;
  const tipo = programasNovos;
  programasNovos = null;
  if (!S.carimbos || typeof S.carimbos !== 'object') S.carimbos = {};
  if (tipo === 'separou') {
    const c = 1 + Math.max(0, S.carimbos.prog || 0, S.carimbos.rot || 0, S.carimbos.progTreinador || 0);
    ['prog', 'rot', 'progTreinador', 'programas'].forEach(function (d) { S.carimbos[d] = Math.max(S.carimbos[d] || 0, c); });
  } else if (!S.carimbos.programas) S.carimbos.programas = 1;
  return true;
}

async function load() {
  // o catálogo do sistema antes do estado: `montaCatalogo` monta por cima dele
  await carregaCatalogo();
  const legado = await leBruto(KEY_LEGADO);
  const bruto = await leBruto(KEY);
  const atual = interpreta(bruto);
  const antigo = interpreta(legado);
  if (bruto && !atual) await guardaIlegivel(KEY, bruto);
  if (legado && !antigo) await guardaIlegivel(KEY_LEGADO, legado);

  // Os dois lados existem quando o build antigo escreveu depois de a chave
  // nova já ter nascido. A ordem é (novo, velho) pelo mesmo motivo da
  // sincronização: em empate de documento, manda quem tem mtime maior, e os
  // registros se unem pela chave natural de qualquer forma.
  if (atual && antigo) S = funde(atual, antigo, Date.now()).estado;
  else if (atual) S = atual;
  else if (antigo) S = antigo;

  await carregaSync();
  if (!atual && !antigo && (sync.jaSincronizou || sync.v != null || sync.forcar)) {
    // O estado que correspondia à versão vista já não existe neste aparelho.
    sync.v = null; sync.em = 0; sync.forcar = false; sync.jaSincronizou = false;
    await gravaSync();
  }
  normalizaEstado();
  montaCatalogo();
  // a lixeira das fotos esvazia o que passou de 30 dias, também sem rede
  setTimeout(function () { if (!desligado) purgaLixeira().catch(function () {}); }, 4000);

  const { arquivados, m3, m7 } = migraEstado();
  montaCatalogo();
  limpaFila();
  // O que está no disco não é mudança: daqui em diante, só o que mudar ganha carimbo.
  lembraDocumentos();
  if (carimbaProgramasNovos()) { sujou(); await grava(); }

  // A chave velha só sai depois de a nova estar gravada E a gravação ter dado
  // certo. Se a escrita falhar, ela fica onde está e a migração tenta de novo
  // na próxima abertura. `grava` e não `save`: fundir não é tocar no estado.
  // Só a chave velha que foi LIDA sai: a ilegível já tem cópia, mas apagar o
  // original sem precisar seria tirar a última chance de quem for recuperá-la.
  if (antigo && await grava()) {
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
  if (registroIlegivel) toast('O registro deste aparelho não pôde ser lido. Guardei uma cópia dele à parte, sem mexer, e o app abriu vazio.');
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
  await lembraQuemTira();
  // Antes da primeira leitura de foto, e depois do render: a tela já está de pé
  // e não pode procurar os bytes no cache com o nome antigo.
  await FOTO.migraCache();
  carregaFotosDoDia();

  // A nuvem entra DEPOIS de a tela já estar de pé: o app não espera rede para
  // funcionar, e quem chegou primeiro é o dado do aparelho.
  await NUVEM.pronta();
  if (NUVEM.sessao()) { render(); sincroniza(); }
  // A sonda de tela (Ajustes → Diagnóstico da tela): só mede quando ligada.
  SONDA.pronta();
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
  marcaPrograma(marca);
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  segurarTela();
  await save();
  render(); rola(0);
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
  if (S.promoPendente.length > TETO.promo) S.promoPendente = S.promoPendente.slice(-TETO.promo);
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

/**
 * A lápide de UMA mudança respondida. A pergunta da sessão é uma entrada só, e
 * a fusão escolhe a entrada inteira do lado mais novo: responder uma mudança no
 * celular e outra no notebook trazia de volta a que o outro já tinha aplicado,
 * e responder "entra" de novo a aplicava duas vezes (num exercício adicionado,
 * duplicava o exercício). Com uma lápide por mudança, a resposta de qualquer
 * aparelho vale nos dois.
 *
 * A chave é o conteúdo da mudança como ela nasceu (`chave`, quando a posição
 * dela foi reescrita por uma troca aceita antes).
 */
function chaveDaMudanca(sid, m) {
  return 'promo:' + sid + ':' + (m.chave || JSON.stringify([m.k, m.slot, m.de, m.para, m.por, m.id, m.pos, m.n]));
}
/** Tira da fila as mudanças já respondidas em qualquer aparelho. */
function limpaFila() {
  if (!Array.isArray(S.promoPendente)) return;
  const mortos = S.apagados || {};
  S.promoPendente.slice().forEach(function (g) {
    if (!Array.isArray(g.mods)) return;
    const fica = [];
    g.mods.forEach(function (m, j) { if (mortos[chaveDaMudanca(g.sid, m)] == null) fica.push(j); });
    if (fica.length === g.mods.length) return;
    g.mods = fica.map(function (j) { return g.mods[j]; });
    if (Array.isArray(g.resumoMods)) g.resumoMods = fica.map(function (j) { return g.resumoMods[j]; });
    if (!g.mods.length) soltaPromo(g.sid);
  });
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

/**
 * O quadro do dia aberto `d` que vale para a aula que começou em `inicio`: o
 * colado no dia dela ou na véspera. Um quadro mais velho é de uma aula que não
 * fechou, e não é desta.
 */
function quadroDaAula(d, inicio) {
  const q = S.quadro;
  return (q && q.day === d && recenteParaAula(q.t, inicio)) ? q : null;
}
/** A lousa pendente do dia aberto `d`, pela mesma janela do quadro. */
function lousaDaAula(d, inicio) {
  const l = S.lousa;
  return (l && l.day === d && recenteParaAula(l.t || l.v, inicio)) ? l : null;
}
function recenteParaAula(t, inicio) {
  const dia = _inicioDoDia(inicio);
  return typeof t === 'number' && t >= dia - 86400000 && t < dia + 2 * 86400000;
}
/** As lápides do quadro e da lousa: cada um é um só, e o instante dele é a chave. */
function chaveDoQuadro(q) { return 'quadro:' + (q && q.t); }
function chaveDaLousa(l) { return 'lousa:' + (l && l.v); }

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
  //
  // Só o quadro e a lousa DESTA aula: colados ou fotografados no dia dela ou na
  // véspera. O de uma aula que não fechou não vaza mais para a seguinte, uma
  // semana depois, como nota e foto de outra aula. E os dois saem com lápide:
  // sem ela, a fusão trazia de volta do outro aparelho o quadro e a lousa já
  // fechados, porque "um lado vazio nunca vence um lado com valor".
  const quadro = quadroDaAula(s.day, s.inicio), lousa = lousaDaAula(s.day, s.inicio);
  if (marca && quadro) {
    marca.obs = quadro.texto;
    marca.m = Date.now();
  }
  if (S.quadro && S.quadro.day === s.day) { lapide(chaveDoQuadro(S.quadro)); S.quadro = null; }
  // A foto da lousa, pela mesma razão: vira parte da sessão da aula.
  if (marca && lousa) {
    marca.lousa = { d: lousa.d, v: lousa.v, ext: lousa.ext };
    marca.m = Date.now();
  }
  if (S.lousa && S.lousa.day === s.day && (marca || !lousa)) { lapide(chaveDaLousa(S.lousa)); S.lousa = null; }

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
  marcaPrograma(marca);
  S.done.push(marca);
  // em ordem: um treino registrado depois pode ter instante igual ou posterior ao começo desta
  S.done.sort(function (x, y) { return x.t - y.t || x.sid - y.sid; });
  if (S.done.length > TETO.done) S.done = S.done.slice(-TETO.done);
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
  else {
    s.ultima = Date.now(); s.day = dia;
    // A sessão segue o dia em que ele registra, e a marca de presença vai junto:
    // senão a sessão dizia E e a marca dizia A, e a rotação andava pelo A.
    const marca = S.done.filter(function (x) { return x.sid === s.sid; })[0];
    if (marca && marca.day !== dia) { marca.day = dia; marca.m = Date.now(); }
  }

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
  // posta em dia ("Já fiz mais do que anotei"): os números são os da última
  // vez, e o registro diz isso (`Log.dp`, docs/redesign-3/00-plano.md)
  if (e.dp) entry.dp = 1; else delete entry.dp;

  if (S.logs[key].length > TETO.logs) S.logs[key] = S.logs[key].slice(-TETO.logs);
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

/**
 * Pula o exercício `i` hoje, ou desfaz o pulo.
 *
 * `botao` é o que o dedo tocou (o "Pular" do cartão, o "Pular hoje" da troca ou
 * da dor). Ao pular, o cartão fecha e o que estava embaixo sobe: sob o dedo
 * ficava o nome do exercício seguinte, e um segundo toque abria outro cartão
 * (defeito 2 da docs/motion/03 §8.6). Depois do desenho a página rola para pôr
 * sob o dedo a frase "Pulado hoje…" do próprio exercício — texto, e não
 * controle: o que acabou de acontecer, no lugar do toque, com o Desfazer ao
 * lado. Sem `botao` (os testes, o teclado) nada rola.
 */
async function pularEx(i, botao) {
  const s = S.sessao || abreSessaoVazia();
  if (!s.pulados) s.pulados = [];
  const chave = slotDe(view.day, i);
  const j = s.pulados.indexOf(chave);
  const dedo = j < 0 ? centroNaTela(botao) : null;
  if (j >= 0) s.pulados.splice(j, 1);
  else {
    s.pulados.push(chave);
    if (view.open === i) view.open = null;
  }
  await save(); render();
  if (dedo != null) depoisDoLayout(function () {
    const frase = centroNaTela(document.querySelector('[data-ex="' + i + '"] .puladobox span'));
    if (frase != null) rolaPor(frase - dedo);
  });
  // §7.5 da frente 3: pular é reversível a um toque, então não há pergunta
  // antes — há a frase do que ficou guardado depois, com o nome, e o desfazer
  // na própria linha. "Pulado" concorda com "exercício", e não com o nome: a
  // frente escreveu "pulada" porque o exemplo era "Elevação lateral", e o nome
  // muda de gênero de um exercício para outro.
  //
  // Pular tem efeito longe da tela (o exercício some da fila): grava na hora e
  // mostra o aviso com "Desfazer" (03-padroes-e-voz.md, "Desfazer em vez de
  // perguntar"). O desfazer só tira o pulo se ele ainda estiver lá.
  const ex = treino(view.day).ex[i];
  const nome = ex ? ex.n : 'o exercício';
  if (j >= 0) { toast('Desfeito: ' + nome + ' voltou para a fila desta sessão.'); return; }
  const dia = view.day;
  avisoComAcao(nome + ' pulado hoje.', 'Desfazer', function () {
    const sv = S.sessao;
    if (!sv || !sv.pulados || sv.pulados.indexOf(chave) < 0 || view.day !== dia) return;
    pularEx(i);
  });
}

// pular antes de qualquer série também abre a sessão: é uma decisão do treino
function abreSessaoVazia() {
  const agora = Date.now();
  S.sessao = { day: view.day, inicio: agora, ultima: agora, sid: agora, pausas: [], pulados: [] };
  const marca = { day: view.day, t: agora, sid: agora, ini: 'auto' };
  if (S.deload) marca.dl = 1;
  marcaPrograma(marca);
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  return S.sessao;
}

// ---------- descartar ----------
/**
 * Descarta a sessão ABERTA: a marca do dia, o relógio e as séries dela. É o
 * "Apagar este treino" de Dias (`apagaRegistroDeTreino`) para a sessão que
 * ainda corre, e mora no `···` (dono, 21/10). Sem série, é o mesmo descarte
 * que o Encerrar de uma sessão vazia sempre fez, com o mesmo texto.
 *
 * Não vale para o treino passado em preenchimento: lá a sessão é um registro
 * que já existia, e apagá-lo é coisa de Dias.
 */
async function descartarSessao() {
  const s = S.sessao;
  if (!s || s.retro) return;
  const linhas = [];
  Object.keys(S.logs).forEach(function (idEx) {
    (S.logs[idEx] || []).forEach(function (l) { if (l.sid === s.sid) linhas.push({ idEx: idEx, l: l }); });
  });
  const series = linhas.reduce(function (a, x) { return a + x.l.sets.filter(Boolean).length; }, 0);
  // PARE (§3.3): o que sai não volta, e o texto diz quanto sai.
  const texto = series
    ? 'Descartar esta sessão apaga o horário de início, a duração e ' +
      (series === 1 ? 'a 1 série registrada' : 'as ' + series + ' séries registradas') +
      ' nela. Isso não tem volta, e vale para os outros aparelhos.'
    : 'Descartar esta sessão apaga o horário de início e a duração. Nenhuma série foi registrada nela, então não há série para perder.';
  if (!(await pare({ texto: texto, sim: 'Descartar a sessão' }))) return;
  // Lápide nos dois, como no apagar de Dias: sem ela a próxima sincronização
  // traz a sessão e as séries de volta do outro aparelho.
  lapide(chaveDeSessao({ sid: s.sid }));
  linhas.forEach(function (x) { lapide(chaveDeLog(x.idEx, x.l)); });
  S.done = S.done.filter(function (x) { return x.sid !== s.sid; });
  Object.keys(S.logs).forEach(function (idEx) {
    S.logs[idEx] = S.logs[idEx].filter(function (l) { return l.sid !== s.sid; });
    if (!S.logs[idEx].length) delete S.logs[idEx];
  });
  S.sessao = null; S.draft = null; S.mods = null;
  view.open = null; view.editProg = false;
  view.day = nextDay();
  soltarTela();
  await save(); render(); rola(0);
  toast(series ? 'Sessão e séries descartadas.' : 'Sessão descartada.');
}

// ---------- finalizar ----------
async function finalizarSessao(comTelaDeFim = false) {
  const s = S.sessao;
  if (!s) return;
  const p = pendencias(s.day, s.sid, s.pulados);
  const feitas = p.feito.length;

  // Encerrar uma sessão sem série nenhuma é descartá-la: não há o que guardar.
  if (!feitas && !p.parcial.length) { await descartarSessao(); return; }

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
  await encerraDeVerdade(s.day, feitas, resumoMods, comTelaDeFim);
}

async function encerraDeVerdade(dia, feitas, resumoMods, comTelaDeFim) {
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
  await save(); render(); rola(0);
  // "Encerrei o Treino A · 6h20 → 7h31 · 1h11 · 8 exercícios" — o intervalo
  // inteiro, e o pulado no resumo, que é onde a §7.5 o põe.
  if (comTelaDeFim === true) return;
  toast('Encerrei ' + oTreino(dia) + ' · ' + fmtHoraDita(inicio) + ' → ' + fmtHoraDita(Date.now()) +
        ' · ' + fmtDur(dur) + ' · ' + feitas + (feitas === 1 ? ' exercício' : ' exercícios') +
        (pulados ? ' · ' + pulados + (pulados === 1 ? ' pulado' : ' pulados') : ''));
}

// entradas da sessão aberta não servem de referência para elas mesmas
function historico(key) { return _historico(S.logs, key, S.sessao); }
// A referência de carga ignora as entradas antigas com carga 0 do "como o
// prescrito" (ver `historicoDeReferencia`). Pausa e dor seguem o histórico cru.
function temCargaDeReferencia(key) {
  const ex = exDe(key);
  const t = cargaTipo(key, ex);
  return t !== 'corpo' && t !== 'assist' && !(ex && ex.u);
}
function historicoRef(key) { return _historicoDeReferencia(historico(key), temCargaDeReferencia(key)); }

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
let sync = { v: null, em: 0, jaSincronizou: false, sujo: false, rodando: false, erro: null, forcar: false, fotos: {}, expirou: 0, apagar: [] };

async function carregaSync() {
  try {
    const r = await DB.get(CHAVE_SYNC);
    if (r && r.value) {
      const controle = JSON.parse(r.value);
      Object.assign(sync, controle, { rodando: false });
      // Nos aparelhos anteriores ao marcador, a versão vista e o último sucesso já eram recibos.
      sync.jaSincronizou = controle.jaSincronizou ?? (sync.v != null || sync.em > 0);
    }
    if (!sync.fotos || typeof sync.fotos !== 'object') sync.fotos = {};
    if (!Array.isArray(sync.apagar)) sync.apagar = [];
  } catch (e) {}
}
function gravaSync() {
  return DB.set(CHAVE_SYNC, JSON.stringify({
    v: sync.v, em: sync.em, jaSincronizou: sync.jaSincronizou, sujo: sync.sujo, forcar: sync.forcar, fotos: sync.fotos || {},
    expirou: sync.expirou || 0, apagar: sync.apagar || []
  }));
}

let syncT = null;
/** Toda alteração local marca sujeira e agenda um envio. */
// Cada gravação conta uma geração. O envio anota a geração que levou; se outra
// gravação chegar enquanto ele está no ar, a pendência continua — senão a série
// gravada nesse meio-tempo ficava marcada como enviada sem ter ido.
let geracao = 0;
// Um pedido que chega com o ciclo rodando não se perde: vira um ciclo depois.
let pedidoNoMeio = false;
function sujou() {
  if (!NUVEM.sessao()) return;
  geracao++;
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
 * O estado antigo podia depender da prescrição embutida. No perfil pessoal uma
 * rotação vazia é válida, inclusive ao reabrir, restaurar ou entrar na conta.
 */
function garanteProgramaERotacao() {
  if (!S.prog || typeof S.prog !== 'object') S.prog = S.primeiraVez ? {} : semeiaProg();
  if (!Array.isArray(S.rot) || (!S.rot.length && !S.primeiraVez)) S.rot = S.primeiraVez ? [] : ROT_BASE.slice();
}

async function sincroniza(opcoes) {
  const manual = !!(opcoes && opcoes.manual);
  if (desligado || !NUVEM.sessao()) return;
  if (sync.rodando) { pedidoNoMeio = true; return; }
  sync.rodando = true; sync.erro = null; render();
  let avisouPrescricao = false;
  try {
    // O que estiver represado sobe neste ciclo, já com a sincronização em curso.
    await liberaSave();
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      const primeiraConta = !sync.jaSincronizou && !!S.primeiraVez;
      if (primeiraConta) sync.forcar = false;
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
          atualizaCatalogo();
          return;
        }
        if (!jaVisto) {
          const aindaComecando = passoInicial();
          const trazDados = primeiraConta && !soTemAbertura(S);
          const revisaoLocal = trazDados && Object.keys(linha.data.prog || {}).length &&
            (S.progLog || []).slice().reverse().find(x => x.textoRevisao);
          const { estado, resumo } = funde(S, linha.data, Date.now(), primeiraConta);
          S = estado;
          normalizaEstado();
          migraEstado();
          if (aindaComecando) {
            view.day = diaDaSessaoAberta() || nextDay();
            delete view.escolhasIniciais;
            delete view.repeteInicio;
          }
          montaCatalogo();
          limpaFila();                       // a resposta dada lá vale aqui
          lembraDocumentos();                // o que veio de lá não é mudança daqui
          // a migração dos programas, se rodou agora, é mudança daqui (carimbo novo)
          const migrou = carimbaProgramasNovos();
          const gravou = await grava();      // grava a fusão SEM recarimbar (a migração já se carimbou pelo dado)
          if (trazDados || migrou) sync.sujo = true;
          if (gravou && !sync.jaSincronizou) {
            sync.jaSincronizou = true;       // a fusão já dura, mesmo se o envio falhar
            await gravaSync();
          }
          if (revisaoLocal && !avisouPrescricao) {
            avisoComAcao('Ficou o programa da sua conta. O texto que você colou está guardado.',
              'Rever texto', () => CTX.abreRevisao(revisaoLocal.textoRevisao));
            avisouPrescricao = true;
          } else if (!avisouPrescricao) contaFusao(resumo, manual);
          if (!sync.sujo && !temQueEmpurrar(resumo)) {
            if (gravou) { sync.v = linha.v; sync.em = Date.now(); }
            gravaSync(); render(); return;
          }
        }
      }

      const levou = geracao;
      const escrita = await NUVEM.empurra(deV, S);
      if (escrita.ok) {
        sync.jaSincronizou = true;
        sync.v = escrita.v; sync.sujo = geracao !== levou; sync.forcar = false; sync.em = Date.now();
        if (sync.sujo) pedidoNoMeio = true;
        gravaSync(); render();
        if (manual && !avisouPrescricao) toast('Sincronizado.');
        reconciliaFotos();                     // sem await: os bytes vão por fora
        reconciliaCorpo();
        atualizaCatalogo();                    // sem await: o catálogo do sistema, se mudou
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
    if (pedidoNoMeio && !desligado) {
      pedidoNoMeio = false;
      clearTimeout(syncT);
      syncT = setTimeout(function () { sincroniza(); }, 1000);
    }
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
/** Os bytes de versão desconhecida já conferidos nesta abertura: não se baixa duas vezes. */
const conferidas = {};

/** Dois blobs com o mesmo conteúdo? É como se sabe que a nuvem ainda tem a versão velha. */
async function mesmosBytes(a, b) {
  if (!a || !b || a.size !== b.size) return false;
  try {
    const [x, y] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()]);
    const u = new Uint8Array(x), w = new Uint8Array(y);
    for (let i = 0; i < u.length; i++) if (u[i] !== w[i]) return false;
    return true;
  } catch (e) { return false; }
}

/**
 * As fotos do corpo apagadas aqui saem também do bucket.
 *
 * Apagar a pose, a sessão ou o histórico inteiro tirava a foto dos aparelhos e
 * a deixava na nuvem para sempre — foto do corpo, que é o dado mais sensível do
 * app. O pedido entra numa fila guardada com a contabilidade da sincronia, e a
 * fila anda no começo de cada reconciliação: sem rede, ela espera; com rede,
 * cada pedido só sai dela quando o servidor confirma.
 */
function apagaDaNuvemDepois(d, pose, ext) {
  if (!Array.isArray(sync.apagar)) sync.apagar = [];
  if (!sync.apagar.some(function (x) { return x.d === d && x.pose === pose && x.ext === ext; })) {
    sync.apagar.push({ d: d, pose: pose, ext: ext });
  }
  delete sync.fotos['corpo:' + d + ':' + pose];
  gravaSync();
}
/**
 * O ORIGINAL de uma foto (F27) também sai do bucket: ao ser refeita, ao ser
 * apagada, com o histórico. O nome dele leva a versão, então o pedido nunca
 * alcança o original de uma foto nova no mesmo lugar.
 */
function apagaOriginalDaNuvemDepois(d, pose, v, ext) {
  if (!Array.isArray(sync.apagar)) sync.apagar = [];
  const e = CORPO.extDoOriginal(v, ext);
  if (!sync.apagar.some(function (x) { return x.d === d && x.pose === pose && x.ext === e; })) {
    sync.apagar.push({ d: d, pose: pose, ext: e });
  }
  const k = 'corpo-orig:' + d + ':' + pose;
  if (sync.fotos[k] === v) delete sync.fotos[k];
  gravaSync();
}
async function apagaPendentesDaNuvem() {
  if (!NUVEM.sessao() || !Array.isArray(sync.apagar)) return true;
  while (sync.apagar.length) {
    const x = sync.apagar[0];
    // Uma foto nova pode ter ocupado o mesmo lugar depois do pedido (refeita
    // aqui ou no outro aparelho): apagar agora levaria a nova.
    const ses = sessaoDe(S.protocolo.sessoes || [], x.d);
    const viva = ses && ses.fotos && ses.fotos[x.pose];
    if (!(viva && viva.ext === x.ext)) {
      const r = await NUVEM.apagaCorpo(x.d, x.pose, x.ext);
      if (desligado) return false;
      if (!r.ok) return false;              // sem rede: a fila fica para o próximo ciclo
    }
    sync.apagar.shift(); gravaSync();
  }
  return true;
}

async function reconciliaFotos() {
  if (!NUVEM.sessao() || !S.fotos) return;
  const ids = Object.keys(S.fotos);

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const ref = S.fotos[id];
    if (!ref || !ref.v) continue;

    // Só sobem bytes que este aparelho SABE que são desta versão. O nome no
    // cache não tem versão: antes, o aparelho com a foto velha a subia por cima
    // da foto trocada no outro, assim que a referência nova chegava.
    const aqui = await FOTO.versaoAqui(id, ref.ext);
    if (desligado) return;
    const confirmada = sync.fotos[id];

    if (aqui === ref.v) {
      if (confirmada === ref.v) continue;
      const bytes = await FOTO.le(id, ref.ext);
      if (!bytes) continue;
      const r = await NUVEM.subirFoto(id, bytes, ref.ext);
      if (!r.ok) return;                      // sem rede: para e tenta depois
      sync.fotos[id] = ref.v; gravaSync();
    } else if (aqui === 'legado') {
      // Guardados antes de os bytes dizerem a versão: podem ser esta foto ou a
      // anterior. Sobem só se a nuvem não tiver nada ali — aí são a única cópia.
      if (confirmada === ref.v || conferidas[id] === ref.v) continue;
      conferidas[id] = ref.v;
      const b = await NUVEM.baixaFoto(id, ref.ext);
      if (!b.ok) return;
      if (b.v) continue;                      // há foto na nuvem: a daqui não sobe por cima
      const bytes = await FOTO.le(id, ref.ext);
      if (!bytes) continue;
      const r = await NUVEM.subirFoto(id, bytes, ref.ext);
      if (!r.ok) return;
      sync.fotos[id] = ref.v; gravaSync();
    } else {
      // não está aqui, ou está a de outra versão: a certa vem da nuvem
      const r = await NUVEM.baixaFoto(id, ref.ext);
      if (!r.ok) return;
      if (!r.v) continue;
      if (aqui !== null && await mesmosBytes(await FOTO.le(id, ref.ext), r.v)) continue;   // a nova ainda não subiu
      await FOTO.guarda(id, r.v, ref.ext, ref.v);
      sync.fotos[id] = ref.v; gravaSync();
      FOTO.solta(id);
      await carregaFotos([id]);                // a <img> estava vazia, ou com a velha
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
  // A LIXEIRA PRIMEIRO: a foto apagada só sai do endereço dela no bucket depois
  // que a cópia da lixeira subiu. Na ordem inversa, um aparelho que caísse no
  // meio a perderia.
  if (!(await sobeLixeira())) return;
  await purgaLixeira();
  if (!(await apagaPendentesDaNuvem())) return;
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
      const confirmada = sync.fotos[k];
      // Só sobem bytes que este aparelho SABE que são desta versão: antes, o
      // aparelho com a pose antiga a subia por cima da pose refeita no outro.
      const aqui = await CORPO.versaoAqui(ses.d, pose, ref.ext);
      if (desligado) return;
      if (aqui === null) continue;            // não está aqui: nada a subir, nada a podar
      // a de outra versão não sobe; e é a velha, que a poda pode levar
      if (typeof aqui === 'number' && aqui !== ref.v) continue;
      if (confirmada === ref.v) continue;     // já está no bucket

      if (aqui === 'legado') {
        // De versão desconhecida. Se a nuvem tem a foto e este aparelho nunca
        // subiu nada ali, os bytes daqui vieram de lá: a nuvem vale. Se nunca
        // subiu e a nuvem não tem, os daqui são a única cópia: sobem. Se já
        // subiu outra versão, não há como saber qual é a nova: nada sobe, e o
        // byte fica (a poda espera).
        if (conferidas[k] === ref.v) { todasNoBucket = false; continue; }
        conferidas[k] = ref.v;
        const b = await NUVEM.baixaCorpo(ses.d, pose, ref.ext);
        if (desligado) return;
        if (!b.ok) { conta(); return; }
        if (b.v && confirmada == null) {
          await CORPO.guarda(ses.d, pose, b.v, ref.ext, ref.v);
          CORPO.solta(ses.d, pose);
          sync.fotos[k] = ref.v; gravaSync(); subiu++;
          continue;
        }
        if (b.v) { todasNoBucket = false; continue; }
      }

      const bytes = await CORPO.le(ses.d, pose, ref.ext);
      if (!bytes) continue;
      const r = await NUVEM.subirCorpo(ses.d, pose, bytes, ref.ext);
      if (!r.ok) { conta(); return; }                     // sem rede: para e tenta depois
      sync.fotos[k] = ref.v; gravaSync(); subiu++;
    }
  }
  conta();

  // Os ORIGINAIS (F27): sobem depois das fotos da tela, que são as que a
  // comparação usa, e saem do aparelho assim que o servidor confirma — são uns
  // 4,7 MB cada, e aqui não há nada que os mostre. O que não está aqui (tirado
  // no outro aparelho, ou já subido) não tem o que fazer.
  for (let i = sessoes.length - 1; i >= 0; i--) {
    const ses = sessoes[i];
    for (const pose of Object.keys(ses.fotos || {})) {
      const ref = ses.fotos[pose];
      if (!ref || !ref.v || !ref.orig) continue;
      const bytes = await CORPO.leOriginal(ses.d, pose, ref.orig.ext, ref.v);
      if (desligado) return;
      if (!bytes) continue;
      const k = 'corpo-orig:' + ses.d + ':' + pose;
      if (sync.fotos[k] !== ref.v) {
        const r = await NUVEM.subirCorpo(ses.d, pose, bytes, CORPO.extDoOriginal(ref.v, ref.orig.ext));
        if (desligado) return;
        if (!r.ok) return;                    // sem rede: o original fica, e a poda espera
        sync.fotos[k] = ref.v; gravaSync();
      }
      await CORPO.esqueceOriginal(ses.d, pose, ref.orig.ext, ref.v);
      if (desligado) return;
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
      // Os bytes daqui só servem se forem DESTA versão (ou de antes de os bytes
      // dizerem a versão). A pose refeita no outro aparelho vem do bucket.
      const aqui = await CORPO.versaoAqui(d, pose, ref.ext);
      if (desligado) return;
      if (aqui === ref.v || aqui === 'legado') {
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
      // a nuvem ainda com a versão velha que já estava aqui: a nova não subiu
      if (aqui !== null && await mesmosBytes(await CORPO.le(d, pose, ref.ext), r.v)) {
        if (marcaFalha(k, 'nuvem')) mudou = true; continue;
      }
      await CORPO.guarda(d, pose, r.v, ref.ext, ref.v);
      if (desligado) return;
      // o que veio da nuvem está na nuvem: não conta como "ainda não subiu"
      sync.fotos['corpo:' + d + ':' + pose] = ref.v; gravaSync();
      CORPO.solta(d, pose);
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
         r.fotosCorpo > 0 || r.ajustesCorpo > 0 || r.comidaDaqui > 0 || r.frequenciaDaqui || r.apagados > 0 || r.documentos === 'local';
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
async function grava(estado = S) {
  let ok;
  try { ok = await DB.set(KEY, JSON.stringify(estado)); }
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
  // NO TREINO, a série recusada volta para a tela (design system, "serie",
  // estado "a série não foi guardada"): o descanso que ela tinha começado para,
  // a caixa de atenção diz o que houve e oferece tentar de novo, e o anúncio
  // para leitor de tela, que dizia "Guardei a série", é corrigido. O painel de
  // falha não abre por cima: a caixa da série faz o papel dele.
  const u = view.modoSessao && view.ultimaV3;
  if (u && u.dia === view.day && timerFim) {
    stopTimer();
    view.focoV3 = { i: u.i, k: u.k };
    view.falhou = false;
    const dita = document.getElementById('serie-dita');
    if (dita) dita.textContent = 'A série ' + (u.k + 1) + ' não foi guardada. Os números continuam na tela.';
  }
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
  // O carimbo do estado inteiro, e o de cada DOCUMENTO que mudou desde a última
  // gravação — programa, plano de comida, cadência, a sessão aberta. Na fusão,
  // cada documento vem do lado onde ELE mudou por último. As coleções não
  // dependem disso: elas se unem pela chave natural de cada registro.
  S.mtime = Date.now();
  carimbaDocumentos(S.mtime);
  sujou();
  return grava();
}

// Como cada documento estava na última gravação (ou na última fusão). Comparar
// o texto é o jeito de saber o que mudou sem ensinar cada tela a avisar.
let impressoes = {};
function impressaoDe(d) { const v = valorDoDocumento(S, d); return JSON.stringify(v === undefined ? null : v); }
/** O estado veio de fora (abertura, fusão): o que está aqui não é mudança nova. */
function lembraDocumentos() {
  impressoes = {};
  DOCUMENTOS.forEach(function (d) { impressoes[d] = impressaoDe(d); });
}
function carimbaDocumentos(agora) {
  if (!S.carimbos || typeof S.carimbos !== 'object') S.carimbos = {};
  DOCUMENTOS.forEach(function (d) {
    const j = impressaoDe(d);
    if (impressoes[d] !== undefined && impressoes[d] !== j) S.carimbos[d] = agora;
    impressoes[d] = j;
  });
  S.carimbosEm = agora;
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
  if (!s || !treino(dia)) return;
  // Vale para qualquer dia mostrado, não só o da sessão. Registrar em outro dia
  // da rotação muda o dia da sessão; o dia de antes, sem rascunho, voltava em
  // branco, e a primeira série digitada nele reescrevia a entrada inteira só
  // com ela — as outras séries daquele exercício sumiam do histórico.
  const achadas = {};
  treino(dia).ex.forEach(function (ex, i) {
    const base = slotDe(dia, i);
    const chave = Object.keys(S.logs).filter(function (k) {
      return !!daSessao(k, base, s.sid);
    })[0];
    if (chave) achadas[i] = daSessao(chave, base, s.sid);
  });
  // criar rascunho vazio aqui contaminaria o estado: na abertura seguinte a
  // migração de rascunho antigo o leria como treino em andamento. Por isso um
  // dia que não é o da sessão só ganha rascunho se tiver o que reconstruir.
  if (s.day !== dia && !Object.keys(achadas).length) return;
  if (!S.draft || S.draft.day !== dia) S.draft = { day: dia, t: Date.now(), ex: {} };

  Object.keys(achadas).forEach(function (i) {
    if (S.draft.ex[i]) return;
    const e = achadas[i];
    S.draft.ex[i] = {
      s: e.sets.map(function (x) { return x ? [x[0], x[1], x[2] != null ? x[2] : null] : [null, null, null]; }),
      obs: e.obs || '',
      dor: (e.dor || []).slice(),
      aq: !!e.aq,
      dp: !!e.dp
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
function lastSet(key, k) { return _lastSet(historicoRef(key), k); }
function lastOf(d,i){ const h = historicoRef(id(d,i)); return h.length ? h[h.length-1] : null; }
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
function turnoDaSessao(m) {
  return m && (temHora(m) || m.hora === 'turno' || m.hora === 1) ? periodoDe(m.t) : null;
}
function siglaDoTreino(k) { return /^hyrox$/i.test(S.prog?.[k]?.name) ? 'HX' : k; }
function horaDaSessao(m) { return temHora(m) ? fmtHora(m.t) : null; }
function fimDaSessao(m) { return temHora(m) && m.dur ? fmtHora(m.t + m.dur + (m.pausado||0)) : null; }

function sessoesDoDia(t) { return S.done.filter(function (x) { return sameDay(x.t, t); }); }

/** Aquele dia foi descanso? */
function ehDescanso(t) { return !!(S.descanso && S.descanso[hojeISO(t)]); }

/** A resposta só pode mudar enquanto o dia estiver sem sessão. */
async function alternaDescanso(t, comDesfazer = false) {
  const iso = hojeISO(t);
  if (sessoesDoDia(t).length) { toast('Este dia tem treino registrado.'); return; }
  const escolha = S.descanso[iso] ? null : 'descanso';
  const faltaAnterior = S.falta[iso];
  if (!respondeFrequencia(S, iso, escolha, undefined, Date.now())) return;
  const marcado = S.descanso[iso];
  await save(); render();
  if (comDesfazer && escolha) {
    avisoComAcao('Dia marcado como descanso.', 'Desfazer', async () => {
      if (S.descanso[iso] !== marcado || !respondeFrequencia(S, iso, faltaAnterior ? 'falta' : null, undefined, Date.now())) return;
      // Desfazer restaura a entrada guardada, inclusive se veio de um build mais novo.
      if (faltaAnterior) S.falta[iso] = { ...faltaAnterior, m: S.falta[iso].m };
      await save(); render();
    });
  } else toast(escolha ? 'Dia marcado como descanso.' : 'Marca de descanso removida.');
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
 * Avisa o contador de séries de que o número pode ter mudado, sem re-render.
 *
 * Existe porque `inp()` NÃO chama render() de propósito: o campo é controlado
 * pelo valor já parseado, e redesenhar a cada tecla reescreveria "22," como
 * "22" — deixando impossível digitar decimal no teclado pt-BR.
 *
 * UM ESCRITOR SÓ (defeito 1 da docs/motion/03 §8.1, consertado na peça 2). Até
 * 16/10 esta função escrevia `textContent` direto no `#daymeta`, e o contador
 * tinha dois escritores: ela e o Preact. Escrever `textContent` TROCA o nó de
 * texto que o Preact guardava; dali em diante o render() pintava num nó solto,
 * e o que só passa pelo render() — ligar o deload, mudar séries na edição do
 * dia — deixava a tela com o número velho (medido: tela 1/20 com o dado em
 * 1/12; tela 0/23 com o dado em 0/24). Agora quem escreve é só o componente
 * (`Contador`, em `ui/telas/treino.jsx`), que lê `contadorDoDia()`; aqui ele é
 * só avisado, e se redesenha sozinho, antes do próximo quadro.
 */
function atualizaEstado() {}

/**
 * O que o contador do topo do treino mostra agora: o valor e se acende.
 * Lido pelo componente a cada desenho — o do render() e o do aviso acima.
 */
function contadorDoDia() {
  const d = view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE);
  const P = treino(d);
  const feitas = seriesFeitasHoje(d);
  // Num dia aberto a métrica é MOVIMENTOS, não séries feitas de prescritas —
  // é o que a tela desenha. Escrever `4/9` aqui desfazia isso na primeira
  // tecla digitada, e o topo passava a contar contra um número que o box nunca
  // prometeu. O bug era antigo e ficava escondido porque só aparecia depois de
  // digitar; a lista rápida o disparava a cada campo.
  if (diaAberto(d)) {
    const n = P ? P.ex.length : 0;
    return { valor: n ? String(n) : '–', cor: feitas > 0 ? 'ins-acid' : '' };
  }
  const prescritas = P ? P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) : 0;
  return { valor: feitas + '/' + prescritas,
           cor: feitas >= prescritas && prescritas > 0 ? 'ins-acid' : '' };
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
  const l = historicoRef(key).slice(-1)[0] || null;
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
      // Carga, repetição e RIR: qual acabou de receber o valor por um toque que
      // grava, e por isso POUSA (ver `marcaRecem`).
      recem: recemDaSerie(d, i, k),
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
  pularEx: function (i, botao) { pularEx(i, botao); },
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

  // O dia desce com o tipo que ELE TEVE, e não só com o que foi dito: num dia
  // de treino pelo padrão semanal, ou com sessão registrada, sem ninguém abrir
  // a folha do tipo do dia, a linha ia sem tipo — o total congelado saía sem o
  // pré-treino e o intra, e a adesão lia as refeições do descanso.
  const fechado = Object.assign({}, dia, { cadencia: tipoDoDiaDeComida(dia.data, dia.cadencia, true) });
  const h = fechaDia(fechado, planoDeComida(), catalogoAlimentos(),
                     versaoDoPlano(), S.ajuste || 0, Date.now());
  const j = S.comidaHist.findIndex(x => x.d === h.d);
  const anterior = j < 0 ? [] : [S.comidaHist[j]];
  const unidos = uneDiasDeComida(anterior, [h], S.apagados || {}).itens;
  if (j < 0) S.comidaHist.push(...unidos);
  else S.comidaHist.splice(j, 1, ...unidos);
  S.comidaHist.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  if (S.comidaHist.length > TETO.comida) S.comidaHist = S.comidaHist.slice(-TETO.comida);
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
  if (S.primeiraVez && !S.comida.plano?.length && !S.comida.v) return 0;
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
  if (!S.comida.plano) S.comida.plano = S.primeiraVez ? [] : JSON.parse(JSON.stringify(PLANO_BASE));
  return S.comida.plano;
}

function cadenciaDaSemana() {
  return (S.cadencia && S.cadencia.length === 7) ? S.cadencia : CADENCIA_PADRAO;
}

function diaResolvido() {
  return diaDeHoje(S, ROT_BASE, cadenciaDaSemana(), diaDeComida().cadencia, Date.now());
}

/**
 * Treino ou descanso, para um dia de comida de qualquer data, pela MESMA
 * autoridade do dia de hoje: sessão registrada naquele dia manda; depois, o que
 * ele disse; por último, a semana típica — o palpite que o Agora mostrou
 * naquele dia. Sem `comPalpite`, o palpite não vale e o dia sem sessão nem
 * resposta é descanso: é o caso do dia passado que nunca foi mostrado.
 */
function tipoDoDiaDeComida(dataISO, dito, comPalpite) {
  const h = diaDeHoje(S, ROT_BASE, cadenciaDaSemana(), dito || null, instanteDaData(dataISO));
  if (h.previsto && !comPalpite) return 'descanso';
  return h.cadencia;
}

/** A refeição que É o treino: o plano marca isso pelo id. */
function ehLinhaDeTreino(r) { return r.id === 'treino'; }

/** Séries registradas hoje naquele treino. */
function seriesFeitasHoje(d) {
  const P = treino(d);
  if (!P) return 0;
  // Pelas SESSÕES de hoje daquele treino, como o dia aberto conta (`e.sid ===
  // m.sid`), e não pela posição do exercício no programa: a série de um
  // exercício trocado no dia mora na chave do exercício que entrou, e ficava de
  // fora — o Agora dizia 6/22 com o dia dizendo 10 de 22 (dono, 21/10).
  const sids = {};
  sessoesDoDia(Date.now()).forEach(function (m) { if (!m.livre && m.day === d) sids[m.sid] = 1; });
  if (S.sessao && S.sessao.day === d) sids[S.sessao.sid] = 1;
  let n = 0;
  Object.keys(S.logs).forEach(function (k) {
    (S.logs[k] || []).forEach(function (e) {
      if (e && sids[e.sid] && sameDay(e.t, Date.now())) n += (e.sets || []).filter(Boolean).length;
    });
  });
  return n;
}

/**
 * OS COPOS NO AR (defeito 6 da docs/motion/03 §8.7, consertado na peça 8 do
 * motion). Cada "+1 copo" soma na memória, grava e espera a resposta; com o
 * aparelho recusando, cada chamada devolvia a conta ao `antes` DELA. Dois toques
 * antes da primeira resposta (o que acontece quando o armazenamento demora, como
 * o do host) davam errado: o primeiro recusado e o segundo aceito devolvia a
 * conta a antes dos dois — o copo que o disco guardou sumia, e a próxima
 * gravação o apagava —; os dois recusados deixavam na tela o copo do primeiro,
 * que o disco recusou; e o primeiro aceito desenhava a memória, com o segundo
 * copo ainda sem resposta.
 *
 * A rajada: enquanto algum "+1 copo" espera a resposta, `coposNoAr` guarda o
 * que o disco TEM de água — o que havia antes do primeiro toque, e depois o que
 * cada gravação aceita escreveu. Cada gravação leva a conta inteira da memória,
 * e por isso a do toque mais novo leva os copos dos de antes: quem decide é ela.
 * Aceita, a conta fica; recusada, a conta volta ao que o disco tem, e o aviso
 * diz qual copo não entrou a partir dali. Os de antes, ao responder, só
 * atualizam o que o disco tem (e, aceitos, desenham). E a tela lê o que o disco
 * tem enquanto a rajada está no ar (`CTX.agua`): nenhum desenho no meio — o
 * painel de "Não guardei" também desenha — mostra copo sem resposta. O copo
 * enche no desenho que vem depois da resposta.
 */
let coposNoAr = null;
function aguaDoDia(d) { return { agua: d.agua, nc: d.aguaNaoContada, m: d.aguaM }; }

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
    view.sessao = null; view.add = null; view.mes = 0; view.diaDoMes = null;
    // O que reaparece não pousa de novo: a aba nasce inteira a cada troca, e a
    // forma da refeição recém-marcada pousaria outra vez (peça 8 do motion).
    view.formaRecem = null;
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
    if (view.agentes) CTX.fechaAgentes();
    if (view.ajustes) CTX.fechaAjustes();

    // A correção de "chegar em TREINO abria um treino qualquer" saiu daqui com
    // a aba: quem entra na sessão agora é o MODO, e as três portas dele já
    // resolvem o dia — `voltaAoTreino` cai no dia da sessão, `abreTreinoDeHoje`
    // no dia resolvido de hoje. `vindoDeFora` fica porque o render e o scroll
    // ainda dependem de ter havido troca de lugar.

    // Toda aba abre no topo, e o topo entra DENTRO do desenho novo (peça 6 do
    // motion): com o carrossel, o `render()` só pede a troca e o desenho fica
    // pendente, e `rola` guarda o topo para ele. Nesta ordem, e nunca ao
    // contrário: rolar antes do `render()` rolaria a página que ainda está na
    // tela, e a foto da aba que sai pularia para o topo antes de sumir.
    render();
    rola(0);
    if (vindoDeFora) carregaFotosDoDia();
  },
  telaCheia: telaCheia,
  /** true quando uma tela cheia do sistema antigo tomou a tela toda. */
  emTelaCheia: function () {
    return !!(passoInicial() || view.prog || view.retro || view.add || view.sessao || view.hist ||
              view.protocolo || view.comparar || view.evolucao || view.medida || view.medidas || view.galeria || view.diaAberto || view.ajuste || view.camera ||
              view.ajustes || view.agentes || view.modoSessao || view.porEmDia || view.revisao || view.programas || view.fotos || view.noTempo || view.naMesmaData || view.progressao || view.responderDias);
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
        prescritas: prescritas,
        feita: prescritas > 0 && feitas >= prescritas,
        // já há treino registrado hoje (a linha do treino leva ao dia, não a outro registro)
        registrada: h.origem === 'registrado',
        // e ele já fechou: com todas as séries a linha ganha o check; com menos,
        // a meia forma da refeição comida pela metade (dono, 21/10)
        fechada: !!h.treino && sessoesDoDia(Date.now()).some(function (m) {
          return !m.livre && m.day === h.treino && !(S.sessao && S.sessao.sid === m.sid);
        }),
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
   *
   * `tam` é o tamanho do "comi outra coisa" (`TamanhoDaOutra`): só vale com
   * `como === 'fora'`, e sai junto com a marca.
   */
  marcaRefeicao: function (id, como, tam) {
    const d = diaDeComida();
    if (d.done[id]) {
      const quando = d.done[id];
      delete d.done[id];
      if (d.como) {
        delete d.como[id];
        if (!Object.keys(d.como).length) delete d.como;
      }
      if (d.tam) {
        delete d.tam[id];
        if (!Object.keys(d.tam).length) delete d.tam;
      }
      // nunca anterior à marca que ela mata: a marca pode ter vindo de um
      // aparelho com o relógio adiantado
      lapide(chaveDeRefeicaoFeita(d.data, id), Math.max(Date.now(), typeof quando === 'number' ? quando : 0));
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
      if (como === 'fora' && ehTamanhoDaOutra(tam)) {
        if (!d.tam) d.tam = {};
        d.tam[id] = tam;
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
    d.aguaM = Date.now();              // a correção para menos atravessa a fusão
    queueSave(); render();
  },

  // ---------- a água em linha (a D, `agora-descanso.html`, estados 3 e 8) ----------
  //
  // "+1 copo" é um toque e grava NA HORA, sabendo se gravou: com cada toque
  // gravando, cada toque pode falhar, e a tela não finge (estado 8). Se o
  // aparelho recusa, a conta volta ao que está guardado e a linha diz qual copo
  // não entrou. Tocar no número corrige no lugar, sem prazo.
  agua: function () {
    const d = diaDeComida();
    // com um "+1 copo" esperando a resposta do aparelho, o que o disco tem
    // (ver `coposNoAr`): a tela não mostra copo que ninguém confirmou
    const a = coposNoAr && coposNoAr.data === d.data ? coposNoAr.guardado : aguaDoDia(d);
    return { n: a.nc ? 0 : (a.agua || 0), naoContada: !!a.nc,
             corrigindo: !!view.aguaCorrige, falhou: view.aguaFalhou || null };
  },
  maisUmCopo: async function () {
    const d = diaDeComida();
    if (!coposNoAr || coposNoAr.data !== d.data) coposNoAr = { data: d.data, toques: 0, guardado: aguaDoDia(d) };
    const rajada = coposNoAr, meu = ++rajada.toques;
    d.agua = (d.aguaNaoContada ? 0 : (d.agua || 0)) + 1;
    delete d.aguaNaoContada;
    d.aguaM = Date.now();
    const leva = aguaDoDia(d);           // o que ESTA gravação escreve
    view.aguaFalhou = null;
    const ok = await save();
    if (ok !== false) rajada.guardado = leva;
    // um toque mais novo espera a resposta dele, e a gravação dele leva este
    // copo junto: é ela que decide. Aceito, este copo já está no disco, e a
    // tela (que lê o que o disco tem) o mostra.
    if (meu !== rajada.toques) { if (ok !== false) render(); return; }
    if (coposNoAr === rajada) coposNoAr = null;
    if (ok === false) {
      const g = rajada.guardado;
      d.agua = g.agua;
      if (g.nc) d.aguaNaoContada = g.nc; else delete d.aguaNaoContada;
      if (g.m == null) delete d.aguaM; else d.aguaM = g.m;
      view.aguaFalhou = (g.nc ? 0 : (g.agua || 0)) + 1;
    }
    render();
  },

  /**
   * `k`: `'tudo'`, `'metade'` (a marca com porção ½, como na folha de pôr o dia
   * em dia), `'fora'`, `'nsei'`, `'nao'` — ou `'pergunta'`, que abre a única
   * pergunta do "Não comi isso", e `'desfaz'`, que tira a marca. Com `'fora'`,
   * `tam` é o tamanho que a folha "Comi outra coisa" perguntou.
   *
   * Pela LINHA aberta (peça 8 do motion; só ela tem estes botões — o cartão de
   * cima chama o mesmo verbo com a linha fechada), duas coisas de tela, que não
   * gravam nada nem mudam a ordem dos toques:
   *  - a linha NÃO SAI DE BAIXO DO DEDO (defeito 3 da docs/motion/03 §8.5): a
   *    leitura de volta nasce no topo, 145 px acima, e a linha descia 157 px
   *    (com a página rolada a ancoragem do navegador a segurava, e era a
   *    leitura que nascia fora da tela). O topo da linha se mede no toque e, no
   *    desenho seguinte, a página rola o que a linha andou — o mesmo conserto
   *    da série (`depoisDoLayout`). Desfazer pela linha é o caminho de volta: a
   *    leitura sai de cima e a linha subiria o mesmo tanto. E, quando foi o
   *    dedo, ele continua SOBRE a linha (ajustes finais): o painel que fecha
   *    era o que estava sob ele, e a rolagem vai pelo ponto do toque
   *    (`devolveALinhaDaComida`);
   *  - a FORMA da linha pousa (03 §4.6): é o retorno do toque, ali onde o dedo
   *    está. `view.formaRecem` é estado de tela, como a marca da série: vence em
   *    `VIDA_DO_RECEM_MS`, e trocar de aba ou entrar no modo a apaga.
   */
  marcaLinhaDaComida: function (id, k, tam) {
    const d = diaDeComida();
    if (k === 'pergunta') { view.perguntaDe = id; render(); return; }
    const daLinha = view.linhaComida === id;
    const botao = daLinha ? botaoDaLinhaDaComida(id) : null;
    const antes = daLinha ? topoNaTela(botao) : null;
    // e onde o dedo está, se foi o dedo: a linha tem de continuar sob ele
    const dedo = botao ? pontoDoToque(botao.closest('li')) : null;
    if (k === 'desfaz') {
      if (!d.done[id]) return;
      if (d.escala[id] != null) delete d.escala[id];
      view.formaRecem = null;
      CTX.marcaRefeicao(id);
      devolveALinhaDaComida(id, antes, dedo);
      return;
    }
    if (d.done[id]) return;                 // marcada: só "Desfazer" muda
    if (['tudo', 'metade', 'fora', 'nsei', 'nao'].indexOf(k) < 0) return;
    if (k === 'metade') d.escala[id] = 0.5;
    // "tudo", "fora", "não comi", "não sei": a porção que sobrou de antes não fica
    else if (d.escala[id] != null) delete d.escala[id];
    view.linhaComida = null; view.perguntaDe = null;
    view.ultimaMarca = { id: id, k: k, data: d.data };
    view.formaRecem = daLinha ? { id: id, data: d.data, t: Date.now() } : null;
    CTX.marcaRefeicao(id, k === 'tudo' || k === 'metade' ? undefined : k, k === 'fora' ? tam : undefined);
    devolveALinhaDaComida(id, antes, dedo);
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
    if (k === 'cardio') { CTX.abreFolha({ k: 'cardio' }); return; }
    CTX.lancaTreinoDeHoje();
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
  // O destino de cima é o mesmo que o Voltar desfaz (`camadasAbertas`), sem as
  // folhas e os painéis. `so`: o destino que só assume a camada em certas
  // condições (o histórico de um exercício, aberto pela progressão).
  const destinos = camadasAbertas(view, passoInicial()).filter(function (c) { return c.indexOf('folha:') !== 0 && c !== 'pare' && c !== 'falhou'; });
  const D = DESTINOS_V3[destinos[destinos.length - 1] || (passoInicial() && 'pvTreino')];
  if (D && (!D.so || D.so(view))) return <div class="v3"><D ctx={CTX} /></div>;
  return null;
}

function semanasDe(t) { return semanasDesde(t, Date.now()); }

// ---------- impacto no volume ----------
// O treinador definiu um alvo por músculo. Mexer nas séries mostra na hora
// para onde o número vai, porque esse é o único momento em que dá para mudar
// de ideia sem custo. O alvo é CALCULADO do programa, nunca transcrito.
// O PROGRAMA DO TREINADOR: o do código, até uma revisão colada entrar
// (decisão do dono, 14/10). Daí em diante é o da revisão, guardado no dado —
// é contra ele que "igual ao treinador", o alvo de séries e o restaurar leem.
function baseTreinador() {
  return S.progTreinador && S.progTreinador.dias ? S.progTreinador.dias : (S.primeiraVez ? {} : semeiaProg());
}
function rotTreinador() {
  return S.progTreinador && Array.isArray(S.progTreinador.rot) && S.progTreinador.rot.length
    ? S.progTreinador.rot : (S.primeiraVez ? [] : ROT_BASE);
}
function alvo() {
  const b = baseTreinador(), prog = {};
  Object.keys(b).forEach(function (d) {
    prog[d] = { ex: (b[d].ex || []).map(function (sl) { return { g: exDe(sl.id).g, s: sl.s }; }) };
  });
  return alvoDoPrograma(prog, rotTreinador().filter(function (d) { return prog[d]; }));
}
function alvoTotal() { const a = alvo(); return Object.keys(a).reduce(function (n, k) { return n + a[k]; }, 0); }

// Séries diretas de um músculo na rotação inteira, com os mods de hoje.
function seriesDe(g) { return seriesDeGrupo(rot().map(treino), g); }

function impactoSeries(d, g) { return g ? impacto(g, seriesDe(g), alvo()[g]) : null; }


// ---------- ações da edição ----------
function modoEdicao(on) {
  view.editProg = !!on;
  view.open = null; view.swapOpen = null; view.addEx = false; view.addQ = ''; view.novoEx = false;
  render(); rola(0);
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
  if (ant && ant[0] != null && !(dr.s[k] && dr.s[k][0] != null)) {
    marcaRecem(i, k, [0]);             // a carga trazida da anterior pousa
    anotaSerie(i, k, 0, String(ant[0]));
  }
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
  const q = quadroDaAula(d, Date.now());
  if (q) modelo.quadro = q.texto;
  if (j >= 0) S.aulas[j] = modelo; else S.aulas.push(modelo);
  if (S.aulas.length > TETO.aulas) S.aulas = S.aulas.slice(-TETO.aulas);
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
async function importaAulaColada(texto, aoLer) {
  const d = view.day;
  if (!diaAberto(d)) { toast('A aula do box só entra no dia aberto.'); return; }

  const r = leAula(texto, function (id) { return !!CAT[id]; });
  if (!r.ok) { toast(r.erro); return; }
  const a = r.aula;

  // Cadastra o vocabulário novo antes de montar o dia: sem isso o dia
  // apontaria para id que o catálogo não conhece, e a linha nasceria vazia.
  a.novos.forEach(function (x) {
    S.ex[x.id] = { n: x.n, g: '', car: x.car, c: 0, cue: '', meu: 1, m: Date.now() };
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
  if (aoLer) aoLer();
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
  if (!(await pare({ texto: 'Apagar o modelo "' + a.nome + '"? As sessões já registradas com ele não mudam.', sim: 'Apagar o modelo' }))) return;
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
  // nome alternativo de um exercício do sistema: é ele, com outro nome
  const jaE = NOMES_ALT[k] && CAT[NOMES_ALT[k]] && !CAT[NOMES_ALT[k]].arq ? NOMES_ALT[k] : null;
  if (jaE) { toast('Esse é o ' + CAT[jaE].n + ', que já está no catálogo.'); return; }
  S.ex[k] = { n: nome.trim(), g: un ? '' : g, car: car, c: comp ? 1 : 0, cue: '', meu: 1, m: Date.now() };
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
    alvo: alvo(),
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
    if (S.progLog.length > TETO.progLog) S.progLog = S.progLog.slice(-TETO.progLog);
  }
  return n;
}



// ---------- tela de programa ----------
// Onde ele reorganiza sentado em casa. Aqui a edição é direta: mexeu, mudou o
// oficial. É o oposto da edição do dia, e a tela diz isso o tempo todo.
function difDoDia(d) {
  const bt = baseTreinador()[d];
  const base = bt ? bt.ex.map(function (sl) { return { id: sl.id, s: sl.s, r: sl.r, d: sl.d, rir: sl.rir, u: sl.u, q: sl.q, bi: sl.bi, lado: sl.lado }; }) : null;
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
    const trocouUnidade = (x.u || '') !== (b.u || '');
    // repetições ↔ tempo é uma diferença só, dita pela linha do tempo abaixo
    if (!trocouUnidade && (x.r !== b.r || (x.lado || '') !== (b.lado || ''))) {
      const rep = function (z) { return z.r + ' repetições' + (z.lado ? ' por ' + z.lado : ''); };
      out.push({ k:'reps', txt: nomeEx(x.id) + ': ' + rep(x) + ', não ' + rep(b) });
    }
    if (x.d !== b.d) out.push({ k:'desc', txt: nomeEx(x.id) + ': descanso de ' + fmtDesc(x.d) + ', não ' + fmtDesc(b.d) });
    if ((x.rir || '') !== (b.rir || '')) out.push({ k:'rir', txt: nomeEx(x.id) + ': sobrando ' + (x.rir || '—') + ', não ' + (b.rir || '—') });
    // o tempo (ou a grandeza) e o bi-set também são do treinador: deixados de fora, viram diferença
    const passada = function (z) { return (z.u && z.q != null ? z.q + ' ' + ({ seg: 's', m: 'm', cal: 'cal', rep: 'rep' })[z.u] : z.r + ' repetições') + (z.lado ? ' por ' + z.lado : ''); };
    if ((x.u || '') !== (b.u || '') || (x.q || 0) !== (b.q || 0)) out.push({ k:'tempo', txt: nomeEx(x.id) + ': ' + passada(x) + ', não ' + passada(b) });
    if (!!x.bi !== !!b.bi) out.push({ k:'bi', txt: nomeEx(x.id) + ': ' + (x.bi ? 'bi-set com o seguinte' : 'sem bi-set') + ', não ' + (b.bi ? 'bi-set' : 'sem bi-set') });
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
  if (rot().join('|') !== rotTreinador().join('|')) n++;
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
function modoPrograma(m) { view.prog.modo = m; view.prog.day = null; render(); rola(0); }

// Impacto do programa OFICIAL contra o alvo. Só aparece quando saiu do alvo.
function impactoOficial(g) {
  if (!g) return null;
  const agora = seriesOficiais(g), alvoG = alvo()[g];
  if (alvoG == null || agora === alvoG) return null;
  return impacto(g, agora, alvoG);
}


// ---------- ações do programa ----------
// Toda mudança aqui é imediata e registrada. O log é o que responde, daqui a
// dois meses, "por que o pendulum virou hack squat?".
// ---------- a revisão do treinador, colada em texto (prescrição, estado 6) ----------
//
// Decisão do dono, 14/10: a revisão chega como texto. O app lê, pergunta uma
// vez por nome que não reconhece com certeza — "é a mesma / é outro exercício",
// com as séries que aquele exercício já tem —, diz o que muda em cada treino e
// quais mudanças dele saem, e só então grava. Errar a correspondência manda o
// histórico para o exercício errado (F300): por isso nada é chutado.
CTX.abreRevisao = function (texto) {
  view.revisao = { texto: typeof texto === 'string' ? texto : '', lida: null, respostas: {} };
  entraNoDestino('revisao'); render();
};
CTX.fechaRevisao = function () { view.revisao = null; render(); saiDoDestino('revisao'); };
/** O texto colado: guardado sem redesenhar, para não roubar o foco do campo. */
CTX.textoDaRevisao = function (el) { if (view.revisao) view.revisao.texto = el.value; };
CTX.revisaoTexto = function () { return view.revisao ? view.revisao.texto : ''; };
CTX.leRevisao = function () {
  if (!view.revisao) return;
  const lida = lerRevisao(view.revisao.texto);
  view.revisao.lida = lida;
  view.revisao.casa = casaNomes(lida, catalogoParaRevisao(), baseTreinador(), { apelidos: mapaDeApelidos(), alt: NOMES_ALT });
  view.revisao.respostas = {};
  view.revisao.recusados = {};
  // O nome que ele já respondeu numa revisão de antes (o apelido) vira pergunta
  // JÁ respondida: a tela mostra "é o X" com "mudar". Uma resposta errada
  // ("Elevação lateral na polia bilateral" é a puxada unilateral) não pode
  // ficar escondida, e sem isto não havia como desfazê-la depois do aviso.
  Object.keys(view.revisao.casa).forEach(function (n) {
    const c = view.revisao.casa[n];
    if (c.k !== 'igual' || c.por !== 'apelido') return;
    view.revisao.casa[n] = { k: 'pergunta', id: c.id, por: 'apelido' };
    view.revisao.respostas[n] = 'mesma';
  });
  // as mudanças começam marcadas; desmarcar é o que fica de fora. O treino que
  // ele deixou de fora numa revisão anterior começa desmarcado, como ele escolheu
  view.revisao.fora = {};
  // programa novo ou revisão (etapa 1 de docs/catalogo): a sugestão vem das
  // letras — nenhum treino do texto bate com os de agora, é programa novo
  const s = sugestaoDaRevisao(lida);
  view.revisao.modo = s.modo;
  view.revisao.nome = (lida.programa && lida.programa.nome) || nomeReserva(lida.data, Date.now());
  view.revisao.quando = lida.programa && lida.programa.comeca ? 'data' : 'agora';
  render();
};

/** As letras do texto e as de agora, e a sugestão: programa novo quando nenhuma bate. */
function sugestaoDaRevisao(lida) {
  const doTexto = lida.dias.filter(function (d) { return !d.aberto; }).map(function (d) { return d.dia; });
  const deAgora = treinosDe(S.prog, rot());
  const batem = doTexto.filter(function (d) { return deAgora.indexOf(d) >= 0; });
  // sem programa de agora (a primeira vez), não há o que guardar: é revisão do vazio
  const escolha = deAgora.length > 0 && doTexto.length > 0;
  return { modo: escolha && !batem.length ? 'novo' : 'revisao', sugestao: escolha && !batem.length ? 'novo' : 'revisao',
           escolha: escolha, doTexto: doTexto, deAgora: deAgora, batem: batem };
}
CTX.escolheModoDaRevisao = function (k) {
  const r = view.revisao;
  if (!r || !r.lida || (k !== 'novo' && k !== 'revisao') || !sugestaoDaRevisao(r.lida).escolha) return;
  r.modo = k; render();
};
/** O nome do programa novo: guardado sem redesenhar, para não roubar o foco. O aviso de repetido vem no blur. */
CTX.nomeDoProgramaNovo = function (el, redesenha) {
  if (!view.revisao) return;
  view.revisao.nome = String(el.value || '');
  if (redesenha) render();
};
CTX.quandoComecaONovo = function (k) { if (view.revisao && (k === 'data' || k === 'agora')) { view.revisao.quando = k; render(); } };
/** "Editar o texto": volta ao campo, com o texto como estava. */
CTX.editaTextoDaRevisao = function () { if (view.revisao) { view.revisao.lida = null; view.revisao.falhou = false; render(); } };
/** A chave de uma mudança: marcada entra no programa dele; desmarcada fica como diferença. */
CTX.alternaMudanca = function (k) {
  const r = view.revisao;
  if (!r || !r.lida) return;
  const mudanca = CTX.revisao().grupos.flatMap(g => g.mudancas).find(m => m.k === k);
  if (!mudanca) return;
  r.fora[k] = mudanca.on;
  render();
};
CTX.respondeRevisao = function (nome, r) {
  if (view.revisao && r === null) {
    // "mudar": a resposta volta a ser pergunta. As mudanças de antes ficam
    // lembradas, para a resposta nova poder dividir uma troca recusada (abaixo).
    const rev = view.revisao;
    if (rev.respostas[nome]) rev.gruposAntes = Object.assign({}, rev.gruposAntes, { [nome]: CTX.revisao().grupos });
    const resp = Object.assign({}, rev.respostas); delete resp[nome];
    rev.respostas = resp; render(); return;
  }
  if (!view.revisao || (r !== 'mesma' && r !== 'outro')) return;
  const rev = view.revisao;
  // "é outro" numa resposta de antes (o apelido): o nome volta a ser lido sem
  // ela — o catálogo pode ter outro candidato (nova pergunta) ou o nome é dele
  // mesmo. O apelido errado sai na gravação, com lápide (`criaDaRevisao`).
  const c0 = rev.casa && rev.casa[nome];
  if (r === 'outro' && c0 && c0.k === 'pergunta' && c0.por === 'apelido') {
    rev.recusados = Object.assign({}, rev.recusados, { [nome]: c0.id });
    const alt = alternativaSemApelido(rev, nome, c0.id);
    if (alt) {
      const antes = CTX.revisao().grupos;
      rev.casa = Object.assign({}, rev.casa, { [nome]: alt });
      const resp = Object.assign({}, rev.respostas);
      if (alt.respondida) resp[nome] = 'mesma'; else delete resp[nome];
      rev.respostas = resp;
      rev.gruposAntes = Object.assign({}, rev.gruposAntes, { [nome]: antes });
      render(); return;
    }
  }
  const anteriores = rev.respostas[nome] ? CTX.revisao().grupos : rev.gruposAntes && rev.gruposAntes[nome];
  if (rev.gruposAntes) delete rev.gruposAntes[nome];
  rev.respostas = Object.assign({}, rev.respostas, { [nome]: r });
  // Ao corrigir uma resposta, uma troca recusada pode se dividir em entrada e saída.
  if (anteriores) {
    CTX.revisao().grupos.forEach(function (g) {
      const antes = anteriores.find(a => a.dia === g.dia);
      if (!antes || !antes.mudancas.some(a => !a.on && !g.mudancas.some(m => m.k === a.k))) return;
      g.mudancas.forEach(m => { if (!antes.mudancas.some(a => a.k === m.k)) rev.fora[m.k] = true; });
    });
  }
  render();
};

/**
 * O que o nome seria sem a resposta de antes (o apelido recusado): outro
 * candidato do catálogo vira pergunta (ou resposta certa, se o nome é o id de
 * um exercício); sem candidato, `null` — fica "é outro", e o exercício nasce
 * novo. O id recusado nunca volta como candidato.
 */
function alternativaSemApelido(rev, nome, recusado) {
  const cat = catalogoParaRevisao(); delete cat[recusado];
  const ap = mapaDeApelidos(); delete ap[chaveDoNome(nome)];
  const alt = Object.assign({}, NOMES_ALT);
  Object.keys(alt).forEach(function (k) { if (alt[k] === recusado) delete alt[k]; });
  const c = casaNomes(rev.lida, cat, baseTreinador(), { apelidos: ap, alt: alt })[nome];
  // o "lugar" (o que sai do mesmo treino) é palpite fraco depois de uma
  // recusa explícita: sem nome parecido, o exercício é dele, novo
  if (!c || c.k === 'novo' || c.id === recusado || (c.k === 'pergunta' && c.por === 'lugar')) return null;
  if (c.k === 'igual') return { k: 'pergunta', id: c.id, por: 'nome', respondida: true };
  return { k: 'pergunta', id: c.id, por: c.por };
}

/** "o Supino", "a Cadeira flexora": o artigo pelo fim da primeira palavra (a pergunta da revisão). */
function artigoDe(nome) {
  const w = String(nome || '').split(' ')[0].toLowerCase();
  return /(a|ção|são|gem|dade|ade)$/.test(w) ? 'a' : 'o';
}
/** "3 séries no treino A": onde o exercício está no programa de agora, para a pergunta. */
function ondeNoPrograma(id) {
  for (const d of rot()) {
    const sl = ((S.prog && S.prog[d] && S.prog[d].ex) || []).find(function (x) { return x.id === id; });
    if (sl) return sl.s + (sl.s === 1 ? ' série' : ' séries') + ' no treino ' + siglaDoTreino(d);
  }
  return null;
}

function catalogoParaRevisao() {
  const c = {};
  Object.keys(CAT).forEach(function (k) { c[k] = { n: CAT[k].n, g: CAT[k].g, arq: CAT[k].arq }; });
  return c;
}

/** "Tem 41 séries registradas desde 06/08." — o que uma resposta errada levaria. */
function seriesDoExercicio(id) {
  const h = S.logs[id] || [];
  const n = h.reduce(function (a, e) { return a + (e.sets || []).filter(Boolean).length; }, 0);
  if (!n) return 'não tem série registrada';
  const desde = Math.min.apply(null, h.map(function (e) { return e.t; }));
  return 'tem ' + n + (n === 1 ? ' série registrada' : ' séries registradas') + ' desde ' + fmtDate(desde);
}

/** O id final de cada nome, com as respostas dadas; `null` enquanto falta resposta. */
function idsDaRevisao(r) {
  const ids = {}, usados = {};
  let falta = false;
  r.lida.dias.forEach(function (d) {
    d.ex.forEach(function (x) {
      if (ids[x.n]) return;
      const c = r.casa[x.n];
      if (c.k === 'igual') ids[x.n] = c.id;
      else if (c.k === 'pergunta' && r.respostas[x.n] === 'mesma') ids[x.n] = c.id;
      else if (c.k === 'pergunta' && !r.respostas[x.n]) { falta = true; ids[x.n] = c.id; }
      else {
        // exercício novo: o id nasce do nome, e nunca pisa num que já existe
        let id = slugEx(x.n), k = 2;
        while (CAT[id] || usados[id]) id = slugEx(x.n) + '-' + k++;
        ids[x.n] = id;
      }
      usados[ids[x.n]] = 1;
    });
  });
  return { ids: ids, falta: falta };
}

/**
 * O que a revisão faz em cada treino que ela traz: o treino do treinador de
 * antes (`velho`), o de depois (`novo`, a revisão inteira), o dele (`meu`) e a
 * lista das mudanças (`dominio/revisao.ts`, `mudancasDoTreino`). Uma conta só
 * para a tela e para a gravação.
 */
function planoDaRevisao(r, idsJa) {
  // `idsJa`: os ids que a gravação já calculou ANTES de criar os exercícios novos
  // no catálogo. Recalcular depois fazia o novo nascer como `<slug>-2` (o slug
  // já existia), e a chave da mudança desmarcada não batia mais com a gravada
  const { ids, falta } = idsJa ? { ids: idsJa, falta: false } : idsDaRevisao(r);
  const base = baseTreinador();
  const agora = Date.now();
  const nome = function (id) { return CAT[id] ? CAT[id].n : (Object.keys(ids).filter(function (n) { return ids[n] === id; })[0] || id); };
  const dias = r.lida.dias.map(function (d) {
    const velho = base[d.dia];
    const novo = treinoDaRevisao(d, ids, velho, function (id) { return descansoPadrao(exDe(id)); }, agora);
    const meu = S.prog[d.dia];
    return { dia: d.dia, velho: velho, novo: novo, meu: meu, mudancas: mudancasDoTreino(d.dia, velho, novo, meu, nome) };
  });
  const exercicios = mudancasDosExercicios(r.lida, ids, exercicioDeAgora, nome, function (t) { return (CARGAS[t] || CARGAS.pino).nome; });
  return { ids: ids, falta: falta, dias: dias, exercicios: exercicios };
}

/** O exercício como é hoje para ele (o tipo de carga efetivo e a dica); null = ainda não existe. */
function exercicioDeAgora(id) {
  const e = CAT[id];
  if (!e || e.arq) return null;
  return { car: cargaTipo(id, e), cue: e.cue || '' };
}

CTX.revisao = function () {
  const r = view.revisao;
  if (!r) return null;
  if (!r.lida) return { lida: false, texto: r.texto, modelo: MODELO_DA_REVISAO };
  const L = r.lida;
  const { ids, falta } = idsDaRevisao(r);
  const novos = {};
  const perguntas = [];
  L.dias.forEach(function (d) {
    d.ex.forEach(function (x) {
      const c = r.casa[x.n];
      if (c.k === 'pergunta' && !perguntas.some(function (p) { return p.nome === x.n; })) {
        perguntas.push({ nome: x.n, candidato: exDe(c.id).n, artigo: artigoDe(exDe(c.id).n), series: seriesDoExercicio(c.id),
                         lugar: c.por === 'lugar' ? ' e ocupa este lugar no treino ' + d.dia : '',
                         noPrograma: ondeNoPrograma(c.id),
                         porApelido: c.por === 'apelido',
                         resposta: r.respostas[x.n] || null });
      }
      if (!CAT[ids[x.n]]) novos[x.n] = 1;
    });
  });
  const plano = falta ? null : planoDaRevisao(r, ids);
  const dias = plano ? plano.dias : [];
  const grupos = dias.filter(function (d) { return d.mudancas.length; }).map(function (d) {
    return { dia: d.dia, titulo: 'Treino ' + d.dia,
             mudancas: d.mudancas.map(function (m) { return Object.assign({}, m, { on: !(r.fora[m.k] ?? m.desmarcada) }); }) };
  });
  // a carga e a dica são do exercício, não de um treino: um grupo próprio
  if (plano && plano.exercicios.length) grupos.push({ dia: '*', titulo: 'Os exercícios',
    mudancas: plano.exercicios.map(function (m) { return Object.assign({}, m, { on: !(r.fora[m.k] ?? m.desmarcada) }); }) });
  const todas = grupos.reduce(function (a, g) { return a.concat(g.mudancas); }, []);
  // com a sessão daquele treino aberta, mudar o programa dele no meio misturaria
  // as séries de hoje (o rascunho é por posição): aplicar espera o fim do treino,
  // ou que ele desmarque as mudanças daquele treino
  const naSessao = S.sessao && S.sessao.day;
  const sug = sugestaoDaRevisao(L);
  const modo = sug.escolha ? (r.modo || sug.modo) : 'revisao';
  const comeca = L.programa && L.programa.comeca;
  const depois = modo === 'novo' && comeca && r.quando === 'data';
  // trocar de programa no meio de um treino misturaria as séries de hoje
  const bloqueio = modo === 'novo' ? (naSessao && !depois ? naSessao : null) : naSessao && grupos.some(function (g) {
    return g.dia === naSessao && g.mudancas.some(function (m) { return m.on && !m.jaEsta; });
  }) ? naSessao : null;
  // os exercícios do texto: os que já têm histórico (as cargas continuam) e os que começam do zero
  const idsTexto = [], emQue = {};
  L.dias.forEach(function (d) {
    if (d.aberto) return;
    d.ex.forEach(function (x) {
      const id = ids[x.n];
      if (idsTexto.indexOf(id) < 0) { idsTexto.push(id); emQue[id] = { n: CAT[id] ? CAT[id].n : x.n, dias: [] }; }
      if (emQue[id].dias.indexOf(d.dia) < 0) emQue[id].dias.push(d.dia);
    });
  });
  const temHistorico = function (id) { return (S.logs[id] || []).some(function (l) { return (l.sets || []).some(Boolean); }); };
  const doZero = idsTexto.filter(function (id) { return !temHistorico(id); }).map(function (id) {
    return { id: id, n: emQue[id].n, em: emQue[id].dias.join(' e ') };
  });
  const P = programasDe(S);
  const ativo = P && P.lista[P.ativo];
  const perA = ativo && periodoDoPrograma(S, P.ativo, Date.now());
  const feitosA = P ? sessoesDoAtivo(S).filter(function (x) { return !x.livre && x.day; }).length : S.done.filter(function (x) { return !x.livre && x.day; }).length;
  const nome = String(r.nome || '').trim() || nomeReserva(L.data, Date.now());
  const igualA = programaComNome(S, nome);
  const abertosDoTexto = L.dias.filter(function (d) { return d.aberto; }).map(function (d) { return d.dia; });
  const abertosHoje = diasAbertos(S.prog);
  const novosNaRevisao = sug.doTexto.filter(function (d) { return sug.deAgora.indexOf(d) < 0; });
  return {
    lida: true, data: L.data,
    bloqueio: bloqueio,
    modo: modo, escolha: sug.escolha, sugestao: sug.sugestao, doTexto: sug.doTexto, deAgora: sug.deAgora,
    lido: { treinos: L.dias.length, exercicios: L.dias.reduce(function (n, d) { return n + d.ex.length; }, 0) },
    exercicios: { total: idsTexto.length, comHistorico: idsTexto.length - doZero.length, doZero: doZero },
    novo: modo !== 'novo' ? null : {
      nome: r.nome, nomeFinal: nomeLivre(S, nome), temTitulo: !!(L.programa && L.programa.nome),
      reserva: nomeReserva(L.data, Date.now()), dataDoTexto: !!L.data, desde: L.data ? String(L.data).split('/').slice(0, 2).join('/') : ddmmDe(Date.now()),
      repetido: igualA ? { nome: igualA.nome, de: fmtDate(igualA.criado || igualA.m || Date.now()) } : null,
      objetivo: L.objetivo || null,
      comeca: comeca || null, quando: depois ? 'data' : 'agora',
      rotacao: sug.doTexto, fora: abertosDoTexto.concat(abertosHoje.filter(function (d) { return abertosDoTexto.indexOf(d) < 0; })),
      agora: ativo ? { nome: ativo.nome, de: perA ? MESES[new Date(perA.de || Date.now()).getMonth()].slice(0, 3) + '.' : '', ate: ddmmDe(Date.now()), feitos: feitosA } : null
    },
    somados: modo === 'revisao' && sug.escolha && novosNaRevisao.length ? { total: sug.deAgora.length + novosNaRevisao.length, deAgora: sug.deAgora, novos: novosNaRevisao, fora: abertosHoje } : null,
    falhou: !!r.falhou,
    // dois nomes do mesmo treino no mesmo exercício: aviso, junto dos problemas do texto
    problemas: L.problemas.concat(nomesNoMesmoId(L, r.casa).map(function (x) {
      return { linha: x.nomes.join('” e “'), motivo: 'os dois são ' + exDe(x.id).n + ' no treino ' + x.dia + '; confira o texto' };
    })),
    vazia: !L.dias.length,
    perguntas: perguntas,
    falta: falta,
    novos: falta ? [] : Object.keys(novos),
    grupos: grupos,
    total: todas.length,
    marcadas: todas.filter(function (m) { return m.on; }).length,
    // a revisão lida é igual ao programa do treinador de agora: nada a escolher
    igual: modo === 'revisao' && !falta && L.dias.length > 0 && !todas.length,
    pode: !falta && !bloqueio && L.dias.length > 0 && (modo === 'novo' || todas.length > 0)
  };
};

/**
 * Grava a revisão, mudança por mudança (decisão do dono, 17/11/2026):
 *
 * - os exercícios novos entram no catálogo (o programa do treinador os tem,
 *   marcados ou não);
 * - o programa do TREINADOR passa a ser a revisão inteira, nos treinos que ela
 *   traz (`treinoDaRevisao`); treino novo entra no fim da sequência dele;
 * - o programa DELE recebe só as mudanças marcadas (`aplicaMudancas`): o que
 *   ficou de fora continua aparecendo como diferença dele (`difDoDia`), e o que
 *   ele já tinha mudado e a revisão não toca fica como está;
 * - o histórico do programa diz, por treino, o que entrou e o que ficou de fora.
 *
 * Tudo volta se o aparelho recusar. O aviso desfaz: o programa, o do treinador
 * e a sequência voltam ao que eram, e o exercício que a revisão criou e nada
 * usa fica arquivado, preservando o histórico do outro aparelho.
 */
/**
 * O que a revisão cria antes de mexer no programa: os exercícios novos no
 * catálogo e os apelidos ("é o mesmo"). Igual para a revisão e para o
 * programa novo.
 */
function criaDaRevisao(r, ids) {
  S.ex = Object.assign({}, S.ex);
  const catAntes = CAT;          // o catálogo de antes: o que a revisão cria não está aqui
  const criados = [];
  r.lida.dias.forEach(function (d) {
    d.ex.forEach(function (x) {
      const id = ids[x.n];
      if (S.ex[id] && S.ex[id].arq) {
        S.ex[id] = { ...S.ex[id], m: Date.now() };
        delete S.ex[id].arq;
        criados.push(id);
        return;
      }
      if (CAT[id] || S.ex[id]) return;
      // série de tempo ("2 x 40 s"): sem carga. A grandeza fica no SLOT, e não no catálogo: se uma
      // revisão seguinte trocar o slot para repetições, o catálogo não pode continuar dizendo segundos
      // e, como todo movimento com grandeza, sem grupo: a prancha não vira série de core no volume
      S.ex[id] = { n: x.n, car: x.car || (x.u === 'seg' ? 'corpo' : 'pino'), g: x.u === 'seg' ? '' : (x.g || ''), c: 0, cue: x.cue || '', m: Date.now() };
      criados.push(id);
    });
  });
  montaCatalogo();

  // A resposta "é o mesmo" vira apelido: a próxima leitura do mesmo nome não
  // pergunta de novo. Só quando o nome leva a um exercício que JÁ existia e
  // que o nome não dá sozinho. Não vira apelido:
  // - o nome que já é o id de um exercício vivo (o apelido passaria por cima
  //   dele na leitura seguinte, e o histórico iria para o outro);
  // - o id criado ou desarquivado por esta revisão ("é outro" virou `-2`): o
  //   Desfazer o arquiva, e o apelido apontaria para um exercício arquivado;
  // - o que o nome alternativo do sistema já resolve.
  // O Desfazer tira os que esta revisão gravou (`apelidosDaRevisao`).
  S.apelidos = Object.assign({}, S.apelidos || {});
  const apelidosDaRevisao = [];
  // A resposta de antes que ele trocou ("é outro" no apelido): o apelido sai,
  // com lápide, antes de o laço abaixo gravar a resposta nova (se houver). O
  // `antes` guardado é o apelido de antes, e o Desfazer o devolve.
  Object.keys(r.recusados || {}).forEach(function (nome) {
    const k = chaveDoNome(nome), velho = S.apelidos[k];
    if (!k || !velho || velho.id !== r.recusados[nome] || ids[nome] === velho.id) return;
    apelidosDaRevisao.push({ k: k, antes: velho });
    delete S.apelidos[k];
    lapide(chaveDeApelido(k));
  });
  Object.keys(ids).forEach(function (nome) {
    const k = chaveDoNome(nome), id = ids[nome];
    if (!k || k === id || NOMES_ALT[k] === id) return;
    if (!catAntes[id] || criados.indexOf(id) >= 0) return;
    if (catAntes[k] && !catAntes[k].arq) return;
    if (S.apelidos[k] && S.apelidos[k].id === id) return;
    if (!apelidosDaRevisao.some(function (a) { return a.k === k; })) apelidosDaRevisao.push({ k: k, antes: S.apelidos[k] || null });
    S.apelidos[k] = { id: id, m: depoisDe(S.apagados && S.apagados[chaveDeApelido(k)]), n: nome };
  });
  return { criados: criados, apelidosDaRevisao: apelidosDaRevisao, catAntes: catAntes };
}

CTX.incorporaRevisao = async function (evento) {
  const r = view.revisao;
  const vm = CTX.revisao();
  if (!r || !vm || !vm.pode || r.aplicando) return;
  if (vm.modo === 'novo') return comecaProgramaNovo(evento, r, vm);
  r.aplicando = true;
  const botaoTocado = evento && evento.detail > 0 && evento.currentTarget ? evento.currentTarget.getBoundingClientRect() : null;
  const { ids } = idsDaRevisao(r);
  // Ao recusar a revisão, o programa volta com a mesma prioridade na fusão.
  const marcas = { mtime: S.mtime, carimbosEm: S.carimbosEm, carimbos: S.carimbos && { ...S.carimbos } };
  const impressoesAntes = { ...impressoes };
  const antes = JSON.stringify({ ex: S.ex, apelidos: S.apelidos, apagados: S.apagados || {}, prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, progLog: S.progLog, carga: S.carga });

  const { criados, apelidosDaRevisao } = criaDaRevisao(r, ids);

  // a conta de novo, agora com o catálogo completo (o descanso padrão do novo),
  // com os MESMOS ids da tela
  const p = planoDaRevisao(r, ids);
  const marcadas = new Set(vm.grupos.flatMap(g => g.mudancas.filter(m => m.on).map(m => m.k)));
  const base = JSON.parse(JSON.stringify(baseTreinador()));
  const rotBase = rotTreinador().slice();
  const agora = Date.now();
  const de = r.lida.data ? ' de ' + r.lida.data : '';
  const tocados = [];
  let aplicadas = 0;
  p.dias.forEach(function (d) {
    base[d.dia] = d.novo;
    if (rotBase.indexOf(d.dia) < 0) rotBase.push(d.dia);
    if (!d.mudancas.length) return;
    const escolhidas = d.mudancas.filter(function (m) { return marcadas.has(m.k); });
    const deixadas = d.mudancas.filter(function (m) { return !marcadas.has(m.k); });
    // conta só o que mexe no programa dele (o que já estava assim não é mudança)
    aplicadas += escolhidas.filter(function (m) { return !m.jaEsta; }).length;
    const t = aplicaMudancas(S.prog[d.dia], d.velho, d.novo, escolhidas, agora);
    if (t) {
      S.prog[d.dia] = t;
      if (rot().indexOf(d.dia) < 0 && escolhidas.some(function (m) { return m.tipo === 'dia'; })) S.rot = rot().concat([d.dia]);
    }
    // o registro inteiro de cada mudança (todos os campos), e não só o título da tela
    const lista = function (ms) { return ms.map(function (m) { return m.texto; }).join('; '); };
    logProg(d.dia, 'revisão do treinador' + de + ': ' + (escolhidas.length ? lista(escolhidas) : 'nenhuma mudança aplicada') +
                   (deixadas.length ? '. Ficou de fora: ' + lista(deixadas) : '') + '.',
      null, !tocados.length && S.primeiraVez && !sync.jaSincronizou ? r.texto : undefined);
    tocados.push(d.dia);
  });
  S.progTreinador = { em: agora, data: r.lida.data, rot: rotBase, dias: base };
  // a carga e a dica do exercício: o que ele marcou vira dele (a carga como
  // correção pessoal, nunca no catálogo; a dica na entrada dele); o que era
  // antes fica guardado para o Desfazer
  const doExercicio = p.exercicios.filter(function (m) { return marcadas.has(m.k); });
  const exAntes = [];
  doExercicio.forEach(function (m) {
    if (m.tipo === 'carga') {
      exAntes.push({ tipo: 'carga', id: m.id, antes: S.carga && S.carga[m.id] !== undefined ? S.carga[m.id] : null });
      S.carga = Object.assign({}, S.carga || {});
      if (((CAT[m.id] && CAT[m.id].car) || 'pino') === m.valor) delete S.carga[m.id]; else S.carga[m.id] = m.valor;
    } else {
      exAntes.push({ tipo: 'dica', id: m.id, antes: S.ex[m.id] ? Object.assign({}, S.ex[m.id]) : null });
      S.ex = Object.assign({}, S.ex);
      S.ex[m.id] = Object.assign({}, S.ex[m.id] || {}, { cue: m.valor, m: Date.now() });
    }
  });
  if (doExercicio.length) {
    montaCatalogo();
    aplicadas += doExercicio.length;
    logProg('-', 'revisão do treinador' + de + ': ' + doExercicio.map(function (m) { return m.texto; }).join('; ') + '.');
  }
  const primeiroTreino = passoInicial() === 1;
  if (primeiroTreino) S.primeiraVez = 2;

  if ((await save()) === false) {
    r.aplicando = false;
    if (primeiroTreino) S.primeiraVez = 1;
    Object.assign(S, marcas);
    impressoes = impressoesAntes;
    const v = JSON.parse(antes);
    S.ex = v.ex; S.apelidos = v.apelidos; S.apagados = v.apagados; S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador; S.progLog = v.progLog; S.carga = v.carga;
    montaCatalogo();
    r.falhou = true;
    render();
    return;
  }
  view.revisao = null;
  render(); saiDoDestino('revisao');
  if (botaoTocado) noDesenho(protegeSegundoToque(botaoTocado));
  const gravado = JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador });
  const exGravado = JSON.stringify(exAntes.map(function (a) { return a.tipo === 'carga' ? (S.carga || {})[a.id] : (S.ex[a.id] || {}).cue; }));
  const desfaz = async function () {
    // só desfaz se o programa ainda é o que a revisão gravou: uma sincronia no
    // meio pode ter trazido uma edição do outro aparelho, e restaurar por cima
    // a apagaria (com carimbo novo, nos dois aparelhos)
    if (JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador }) !== gravado) {
      toast('O programa mudou depois da revisão; desfazer agora passaria por cima disso. Corrija pelo programa.');
      return;
    }
    if (JSON.stringify(exAntes.map(function (a) { return a.tipo === 'carga' ? (S.carga || {})[a.id] : (S.ex[a.id] || {}).cue; })) !== exGravado) {
      toast('A carga ou a dica mudou depois da revisão; desfazer agora passaria por cima disso.');
      return;
    }
    const v = JSON.parse(antes);
    S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador;
    // a carga e a dica voltam ao que eram, exercício por exercício (o resto do
    // catálogo dele pode ter mudado por sincronia: não se restaura o S.ex inteiro)
    exAntes.forEach(function (a) {
      if (a.tipo === 'carga') {
        S.carga = Object.assign({}, S.carga || {});
        if (a.antes == null) delete S.carga[a.id]; else S.carga[a.id] = a.antes;
      } else {
        S.ex = Object.assign({}, S.ex);
        if (a.antes) S.ex[a.id] = Object.assign({}, a.antes, { m: Date.now() });
        else S.ex[a.id] = Object.assign({}, S.ex[a.id], { cue: (EX_SISTEMA[a.id] && EX_SISTEMA[a.id].cue) || "", m: Date.now() });
      }
    });
    // o que a revisão criou e nada mais usa é ARQUIVADO, e não apagado: se o
    // outro aparelho criou o mesmo exercício e já treinou com ele, a série dele
    // continua com nome e grupo (uma lápide mataria a entrada de catálogo de lá)
    const usado = function (id) {
      if ((S.logs[id] || []).length) return true;
      const em = function (dias) { return Object.keys(dias || {}).some(function (k) { return ((dias[k] && dias[k].ex) || []).some(function (sl) { return sl.id === id; }); }); };
      return em(S.prog) || em(S.progTreinador && S.progTreinador.dias);
    };
    S.ex = Object.assign({}, S.ex);
    criados.forEach(function (id) { if (S.ex[id] && !usado(id)) S.ex[id] = Object.assign({}, S.ex[id], { arq: 1, m: Date.now() }); });
    // os apelidos que ela gravou saem, com lápide (senão o outro aparelho os
    // devolve); o que ela sobrescreveu volta ao que era
    S.apelidos = Object.assign({}, S.apelidos || {});
    apelidosDaRevisao.forEach(function (a) {
      if (a.antes) S.apelidos[a.k] = Object.assign({}, a.antes, { m: depoisDe(S.apagados && S.apagados[chaveDeApelido(a.k)]) });
      else { delete S.apelidos[a.k]; lapide(chaveDeApelido(a.k)); }
    });
    montaCatalogo();
    tocados.forEach(function (d) { logProg(d, 'revisão do treinador' + de + ' desfeita: o treino voltou ao que era.'); });
    if (exAntes.length) logProg('-', 'revisão do treinador' + de + ' desfeita: a carga e a dica voltaram ao que eram.');
    const ok = await save();
    render();
    if (ok) toast('Revisão desfeita.');
  };
  noDesenho(() => CTX.avisaComDesfazer(aplicadas
    ? aplicadas + (aplicadas === 1 ? ' mudança aplicada. Vale' : ' mudanças aplicadas. Valem') + ' a partir do próximo treino.'
    : 'Revisão guardada. O seu programa não mudou.', desfaz));
};

/**
 * O PROGRAMA NOVO (etapa 1 de docs/catalogo): o texto inteiro vira um
 * programa, o de agora vai para a linha do tempo, guardado, e nada se apaga.
 * Com "começa dd/mm", ele fica em "Próximo" e o de agora segue. O aviso desfaz.
 */
async function comecaProgramaNovo(evento, r, vm) {
  r.aplicando = true;
  const botaoTocado = evento && evento.detail > 0 && evento.currentTarget ? evento.currentTarget.getBoundingClientRect() : null;
  const { ids } = idsDaRevisao(r);
  const marcas = { mtime: S.mtime, carimbosEm: S.carimbosEm, carimbos: S.carimbos && { ...S.carimbos } };
  const impressoesAntes = { ...impressoes };
  const antes = JSON.stringify({ ex: S.ex, apelidos: S.apelidos, apagados: S.apagados || {}, prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, progLog: S.progLog, programas: S.programas });
  const doAntes = programasDe(S) ? S.programas.lista[S.programas.ativo].nome : null;
  const { criados, apelidosDaRevisao } = criaDaRevisao(r, ids);
  const agora = Date.now();
  const prog = {}, rotN = [], abertos = [];
  r.lida.dias.forEach(function (d) {
    prog[d.dia] = treinoDaRevisao(d, ids, d.aberto ? S.prog && S.prog[d.dia] : undefined, function (id) { return descansoPadrao(exDe(id)); }, agora);
    (d.aberto ? abertos : rotN).push(d.dia);
  });
  const rotFinal = rotN.concat(abertos);
  const nEx = vm.exercicios.total;
  const resumo = rotN.length + (rotN.length === 1 ? ' treino, ' : ' treinos, ') + nEx + (nEx === 1 ? ' exercício' : ' exercícios');
  const nome = vm.novo.nomeFinal;
  const comeca = vm.novo.quando === 'data' ? vm.novo.comeca : null;
  const id = criaPrograma(S, { nome: nome, origem: 'treinador', objetivo: vm.novo.objetivo, prog: prog, rot: rotFinal,
    progTreinador: { em: agora, data: r.lida.data, rot: rotFinal.slice(), dias: JSON.parse(JSON.stringify(prog)) },
    resumo: resumo, comeca: comeca, texto: r.texto }, agora);
  logProg('-', 'Programa novo: ' + resumo + (comeca ? ', começa em ' + comeca : ''), null,
    S.primeiraVez && !sync.jaSincronizou ? r.texto : undefined, id);
  if (!comeca) view.day = nextDay();
  if ((await save()) === false) {
    r.aplicando = false;
    Object.assign(S, marcas);
    impressoes = impressoesAntes;
    const v = JSON.parse(antes);
    S.ex = v.ex; S.apelidos = v.apelidos; S.apagados = v.apagados; S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador; S.progLog = v.progLog; S.programas = v.programas;
    montaCatalogo();
    view.day = nextDay();
    r.falhou = true;
    render();
    return;
  }
  view.revisao = null;
  render(); saiDoDestino('revisao');
  if (botaoTocado) noDesenho(protegeSegundoToque(botaoTocado));
  const gravado = JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas });
  const desfaz = async function () {
    if (S.sessao) { toast('Há um treino aberto. Encerre o treino antes de desfazer a troca de programa.'); return; }
    // só desfaz se nada mudou depois (uma sincronia pode ter trazido outra edição)
    if (JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas }) !== gravado) {
      toast('O programa mudou depois; desfazer agora passaria por cima disso. Reative o de antes pela linha do tempo.');
      return;
    }
    const v = JSON.parse(antes);
    S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador; S.programas = v.programas;
    const usado = function (x) {
      if ((S.logs[x] || []).length) return true;
      const em = function (dias) { return Object.keys(dias || {}).some(function (k) { return ((dias[k] && dias[k].ex) || []).some(function (sl) { return sl.id === x; }); }); };
      return em(S.prog) || em(S.progTreinador && S.progTreinador.dias);
    };
    S.ex = Object.assign({}, S.ex);
    criados.forEach(function (x) { if (S.ex[x] && !usado(x)) S.ex[x] = Object.assign({}, S.ex[x], { arq: 1, m: Date.now() }); });
    S.apelidos = Object.assign({}, S.apelidos || {});
    apelidosDaRevisao.forEach(function (a) {
      if (a.antes) S.apelidos[a.k] = Object.assign({}, a.antes, { m: depoisDe(S.apagados && S.apagados[chaveDeApelido(a.k)]) });
      else { delete S.apelidos[a.k]; lapide(chaveDeApelido(a.k)); }
    });
    montaCatalogo();
    logProg('-', 'Programa novo desfeito: ' + nome + ' saiu.', null, undefined, id);
    view.day = nextDay();
    const ok = await save();
    render();
    if (ok) toast(comeca ? 'O ' + nome + ' saiu de Próximo.' : 'Voltou o ' + (doAntes || 'programa de antes') + '.');
  };
  noDesenho(() => CTX.avisaComDesfazer(comeca
    ? 'O ' + nome + ' fica em Próximo até ' + comeca + '. Até lá, segue o de agora.'
    : 'Começou o ' + nome + '.' + (doAntes ? ' O ' + doAntes + ' está guardado na linha do tempo.' : ''), desfaz));
}

function logProg(d, txt, motivo, textoRevisao, p) {
  if (!Array.isArray(S.progLog)) S.progLog = [];
  const entrada = { t: Date.now(), day: d, txt: txt, motivo: motivo || null, m: Date.now() };
  if (textoRevisao) entrada.textoRevisao = textoRevisao;
  if (p) entrada.p = p;
  S.progLog.push(entrada);
  if (S.progLog.length > TETO.progLog) S.progLog = S.progLog.slice(-TETO.progLog);
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
  if (!(await pare({ texto: 'Tirar ' + nomeEx(sl.id) + ' do treino ' + d + '? O histórico do exercício continua guardado.', sim: 'Tirar do treino' }))) return;
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
      !(await pare({ tom: 'pergunta', texto: 'Trocar ' + nomeEx(de) + ' mesmo assim? Ele está no programa há ' +
               semanasDe(sl.desde) + ', e o treinador pede 6 a 8 semanas antes de trocar os principais.',
               sim: 'Trocar mesmo assim', nao: 'Manter' }))) return;
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
  if (!baseTreinador()[d]) {
    if (!(await pare({ texto: 'Apagar o treino ' + d + '? Ele não existe no programa atual do treinador.', sim: 'Apagar o treino ' + d }))) return;
    delete S.prog[d];
    S.rot = rot().filter(function (x) { return x !== d; });
    logProg(d, 'treino ' + d + ' apagado');
    await save(); abrirPrograma(null);
    toast('Treino ' + d + ' apagado.');
    return;
  }
  const n = difDoDia(d).length;
  if (!n) { toast('O treino ' + d + ' já está igual ao do treinador.'); return; }
  if (!(await pare({ texto: 'Desfazer ' + n + (n===1?' mudança':' mudanças') + ' no treino ' + d +
               ' e voltar ao que o treinador prescreveu? O histórico não é tocado.', sim: 'Voltar ao do treinador' }))) return;
  S.prog[d] = JSON.parse(JSON.stringify(baseTreinador()[d]));
  logProg(d, 'treino ' + d + ' restaurado para o do treinador');
  await save(); render();
  toast('Treino ' + d + ' de volta ao programa do treinador.');
}

async function restaurarTudo() {
  const n = difTotal();
  if (!n) { toast('Seu programa já é o do treinador.'); return; }
  if (!(await pare({ texto: 'Desfazer ' + n + (n===1?' diferença':' diferenças') +
               ' e voltar ao programa do treinador? O histórico e os exercícios que você cadastrou não são tocados.', sim: 'Voltar ao programa do treinador' }))) return;
  S.prog = JSON.parse(JSON.stringify(baseTreinador()));
  S.rot = rotTreinador().slice();
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

const MINUTOS_CARDIO = [15, 20, 30, 45, 60];
const CARDIO_INICIAL = { m: 'bike', min: 30, i: 'moderado' };
function camposDoCardio(f) {
  const opcoes = (valores, atual, unidade = '') => valores.map(k => ({ k, t: k + unidade, on: k === atual }));
  return { modais: opcoes(MODAIS, f.m), minutos: opcoes(MINUTOS_CARDIO, f.min, ' min'), min: f.min,
           intensidades: opcoes(['leve', 'moderado'], f.i) };
}
CTX.camposDoCardio = camposDoCardio;
CTX.cardioInicial = CARDIO_INICIAL;

function cardioSet(k, v) {
  view.cardioForm = Object.assign({}, CARDIO_INICIAL, view.cardioForm);
  view.cardioForm[k] = v;
  render();
}
async function addCardio() {
  const f = Object.assign({}, CARDIO_INICIAL, view.cardioForm);
  // `alt` e não `m`: em cardio o `m` já é o modal
  S.cardio.push({ t: Date.now(), m: f.m, min: f.min, i: f.i, alt: Date.now() });
  if (S.cardio.length > TETO.cardio) S.cardio = S.cardio.slice(-TETO.cardio);
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

/** A hora do cardio, em prosa; o lançado depois não tem hora medida. */
function horaDoCardio(c) { return c && !c.semHora ? fmtHoraDita(c.t) : null; }

/**
 * O CARDIO ESQUECIDO, lançado num dia passado pelo dia aberto em Dias, pelo cartão
 * do dia ou pela folha do Hoje (decisão do dono, 14/10). O instante cai dentro da
 * hora das 12h daquele dia, com um deslocamento tirado do instante do toque, para
 * dois aparelhos que lançam o mesmo dia não caírem na mesma chave (`cardio:<t>`);
 * hoje, nunca depois de agora. A semana e o mês o contam no dia em que aconteceu,
 * e a hora não foi medida: fica marcada (`semHora`) e a tela não a inventa. Um
 * instante já ocupado ou com lápide anda um milissegundo.
 */
CTX.abreCardioNoDia = function () {
  view.cardioNoDia = view.cardioNoDia ? null : { ...CARDIO_INICIAL };
  view.cardioNoDiaFalhou = null;
  render();
};
CTX.cardioNoDiaSet = function (campo, v) {
  if (!view.cardioNoDia) return;
  view.cardioNoDia = Object.assign({}, view.cardioNoDia, { [campo]: campo === 'min' ? Number(v) : v });
  render();
};
CTX.gravaCardioNoDia = async function (dia = view.diaAberto, f = view.cardioNoDia) {
  if (!f || !dia) return;
  const d = new Date(dia);
  if (!Number.isFinite(d.getTime()) || hojeISO(dia) > hojeISO()) return;
  // Meio-dia e mais um deslocamento tirado do instante do toque, dentro da mesma hora: dois
  // aparelhos que lançam o mesmo dia não caem na mesma chave (`cardio:<t>`). Hoje, nunca no futuro.
  let t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0).getTime() + (Date.now() % 3600000);
  if (hojeISO(dia) === hojeISO()) t = Math.min(t, Date.now());
  while (S.cardio.some(x => x.t === t) || S.apagados[chaveDeCardio({ t })]) t++;
  const novo = { t: t, m: f.m, min: f.min, i: f.i, alt: Date.now(), semHora: 1 };
  S.cardio.push(novo);
  S.cardio.sort(function (a, b) { return a.t - b.t; });
  const excedentes = S.cardio.splice(0, Math.max(0, S.cardio.length - TETO.cardio));
  const ok = await save();
  if (ok === false) {
    S.cardio = excedentes.concat(S.cardio).filter(x => x !== novo);
    view.cardioNoDiaFalhou = 'O cardio não foi gravado: o armazenamento deste aparelho recusou. O dia continua como estava.';
    render();
    return;
  }
  if (f === view.cardioNoDia) {
    view.cardioNoDia = null;
    toast(f.min + ' min de ' + f.m + ' registrados em ' + fmtDate(t) + '.');
  }
  view.cardioNoDiaFalhou = null;
  render();
  return novo;
};

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
        return (horaDoCardio(x) ? 'o cardio das ' + horaDoCardio(x) : 'o outro cardio do dia') + (x.m === c.m && x.min === c.min && x.i === c.i ? ', igual a este' : ', ' + x.min + ' min de ' + x.m);
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
  if (await tiraCardio(t)) toast('Sessão removida.');
}
async function tiraCardio(t) {
  const c = S.cardio.find(x => x.t === t);
  if (!c) return;
  const chave = chaveDeCardio(c), ant = S.apagados[chave];
  const morte = lapide(chave, Math.max(Date.now(), c.alt || 0));
  S.cardio = S.cardio.filter(x => x.t !== t);
  const ok = await save();
  if (ok === false) {
    if (ant == null) delete S.apagados[chave]; else S.apagados[chave] = ant;
    S.cardio.push(c); S.cardio.sort((a, b) => a.t - b.t);
    render(); return false;
  }
  render();
  // O "tirar" do cartão tem Desfazer: o mesmo registro volta, com a lápide de antes e um
  // carimbo depois da que foi posta agora, para a volta vencer o "tirar" no outro aparelho.
  return {
    texto: diaComMaiuscula(t) + ': cardio tirado.',
    desfaz: async () => {
      if (S.cardio.some(x => x.t === c.t)) return true;
      const volta = { ...c, alt: depoisDe(morte) };
      if (ant == null) delete S.apagados[chave]; else S.apagados[chave] = ant;
      S.cardio.push(volta); S.cardio.sort((a, b) => a.t - b.t);
      if (await save() === false) {
        S.cardio = S.cardio.filter(x => x !== volta);
        S.apagados[chave] = morte;
        render(); return false;
      }
      render(); return true;
    }
  };
}
/** "Segunda, 9": o dia do registro, para começar o aviso com maiúscula. */
function diaComMaiuscula(t) {
  const d = new Date(t), x = DIAS_LONGOS[d.getDay()] + ', ' + d.getDate();
  return x.charAt(0).toUpperCase() + x.slice(1);
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
  view.mes = novo; view.diaDoMes = null;
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
 * o que apagar e abrir procuram. Um milissegundo adiante, até ficar livre, e a hora
 * neutra continua sem ser mostrada.
 */
function instanteLivre(t, fora) {
  let x = t;
  while (S.done.some(m => m !== fora && (m.t === x || m.sid === x)) || S.apagados[chaveDeSessao({ sid: x })]) x++;
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
function previstoNoDia(t, escolhido) {
  const ini = new Date(t); ini.setHours(0, 0, 0, 0);
  // no programa que valia naquele dia: antes da troca, o seguinte era o do programa de antes
  const id = programaDoDia(t, escolhido);
  const base = id && programasDe(S) && id !== S.programas.ativo ? estadoDoPrograma(S, id) : S;
  return proximoTreino(Object.assign({}, base, { done: base.done.filter(function (x) { return x.t < ini.getTime(); }) }), ROT_BASE);
}

/** Dias com treino nas últimas quatro semanas, até ontem — a conta da leitura de Dias. */
function diasNasQuatroSemanas() { return _diasComTreino(S.done, _inicioDoDia(Date.now()) - 1, 28); }

/**
 * O toque que grava: `k` é a letra do treino, ou `'livre'` para fora da
 * prescrição (presença, sem séries, sem mexer na sequência — F155).
 */
async function lancaTreino(k, a = view.add, linhas = []) {
  if (!a || a.sid != null) return;
  // a letra vale no programa daquele dia (registrar um dia de antes da troca oferece os treinos de antes)
  const idP = programaDoDia(a.t, a.prog);
  if (k !== 'livre' && rotDoPrograma(idP).indexOf(k) < 0) return;
  a.antes = diasNasQuatroSemanas();
  const t = instanteLivre(a.t);
  // Dois aparelhos podem lançar o mesmo turno. A identidade nasce no toque, sem depender das 8h/15h/20h.
  const sid = a.precisao ? instanteLivre(Date.now()) : t;
  const marca = { t, sid, retro: 1, m: Date.now() };
  if (a.precisao) marca.hora = a.precisao;
  if (k === 'livre') {
    marca.livre = 1; marca.grupos = a.grupos || [];
    if (a.dur) { marca.dur = a.dur * 60000; marca.fim = 'manual'; }
  }
  else { marca.day = k; if (S.deload) marca.dl = 1; marcaPrograma(marca, idP); }
  S.done.push(marca);
  S.done.sort(function (x, y) { return x.t - y.t; });
  a.sid = marca.sid;
  a.gravadoEm = Date.now();
  for (const linha of linhas) escreveSeriesPassadas(marca, linha.id, linha.sets, { ...linha, dp: 1 });
  if (await save() === false) {
    retiraSessao(marca, false);
    a.sid = null;
    render(); return null;
  }
  render(); return marca;
}

// O cartão prepara as escolhas em memória. Só o último toque chega a lancaTreino.
const HORAS_DO_TURNO = { manha: '08:00', tarde: '15:00', noite: '20:00' };
const TURNO_DITO = { manha: 'de manhã', tarde: 'à tarde', noite: 'à noite' };
CTX.turnoDito = TURNO_DITO;
CTX.diaComMaiuscula = diaComMaiuscula;
const MODOS_DO_REGISTRO = { ultima: 'como da última vez', prescrito: 'como o prescrito', ajustar: 'ajustado', presenca: 'só a presença' };
function instanteDoRegistro(data, turno, hora) {
  if (!HORAS_DO_TURNO[turno] || data > hojeISO()) return null;
  let t = aplicaHora(instanteDaData(data), hora || HORAS_DO_TURNO[turno]);
  if (t == null || hojeISO(t) !== data) return null;
  // Hoje, nada no futuro: a hora exata depois de agora é recusada, e o turno vale até agora.
  if (t > Date.now()) {
    if (hora) return null;
    t = Date.now();
  }
  return instanteLivre(t);
}
/** Os turnos que já começaram naquele dia: hoje de manhã, a noite ainda não existe. */
CTX.turnosDoDia = function (data) {
  if (data !== hojeISO()) return ['manha', 'tarde', 'noite'];
  const h = new Date(Date.now()).getHours();
  return PERIODOS.filter(p => p.k === 'noite' ? h >= p.de || h < p.ate : h >= p.de).map(p => p.k);
};

CTX.turnoDaHora = function (data, hora) {
  const t = aplicaHora(instanteDaData(data), hora);
  return t == null ? null : periodoDe(t).k;
};
CTX.diaDoRegistro = function (data, escolhido) {
  const t = instanteDaData(data), d = new Date(t);
  const sessoes = sessoesDoDia(t).sort((a, b) => a.t - b.t);
  const P = programasDe(S);
  const doDia = programaDoDia(t);
  const idP = programaDoDia(t, escolhido);
  const outroPrograma = !!(P && idP && idP !== P.ativo);
  const base = outroPrograma ? estadoDoPrograma(S, idP) : S;
  const proximo = sessoes.length ? proximoTreino({ ...base, done: base.done.filter(m => hojeISO(m.t) <= data) }, ROT_BASE) : previstoNoDia(t, escolhido);
  // "Foi de outro programa": os outros que já foram o ativo, o mais recente primeiro
  const outros = P ? Object.values(P.lista).filter(x => x.id !== idP && (x.estado === 'ativo' || x.estado === 'guardado'))
    .sort((a, b) => (b.periodos.at(-1)?.[0] ?? 0) - (a.periodos.at(-1)?.[0] ?? 0)).map(x => ({ id: x.id, nome: x.nome })) : [];
  return {
    dia: DIAS_LONGOS[d.getDay()] + ', ' + d.getDate(), t, hoje: data === hojeISO(),
    treinos: rotDoPrograma(idP).map(k => ({ k, sigla: siglaDoTreino(k), proximo: k === proximo })),
    // o dia de antes da troca: os treinos são os do programa que valia nele
    programa: outroPrograma || (escolhido && idP !== doDia) ? { id: idP, nome: P.lista[idP].nome, escolhido: !!escolhido && idP !== doDia } : null,
    outros,
    grupos: regioesDoCorpo(), sessoes: sessoes.length, cardios: cardioDoDia(t),
    frequencia: !sessoes.length && (S.descanso[data] ? 'descanso' : S.falta[data] ? 'falta' : null),
    motivo: S.falta[data]?.motivo
  };
};

CTX.seriesDoRegistro = function (data, dia, turno, hora, escolhido) {
  const t = instanteDoRegistro(data, turno, hora);
  // a última vez DAQUELE treino, no mesmo programa: o A de outro programa é outro treino
  const idP = programasDe(S) ? programaDoDia(instanteDaData(data), escolhido) : null;
  const anterior = S.done.filter(m => m.day === dia && !m.livre && m.t < t && m.sid !== S.sessao?.sid &&
    (!idP || programaDaSessao(S, m) === idP)).at(-1);
  const ultima = [];
  if (anterior) for (const [id, lista] of Object.entries(S.logs)) {
    for (const l of lista) if (l.sid === anterior.sid && l.sets.some(Boolean)) {
      ultima.push({ id, sl: l.sl, u: l.u, q: l.q, sets: l.sets.map(par => par && par.slice(0, 2)) });
    }
  }
  // A prescrição é a do programa (o daquele dia). As trocas temporárias de uma sessão ao vivo pertencem a ela.
  const prescrito = (progDoPrograma(idP)?.[dia]?.ex || []).map(slot => {
    const ex = exDe(slot.id), u = slot.u || ex.u, q = slot.q || ex.q;
    const alvo = cronometrado(u) ? null : (u && q) || faixaDoTexto(slot.r)?.[0];
    // "como o prescrito" CONTA para a sugestão de carga (decisão do dono, 23/11):
    // cada série vale a carga da última vez no TOPO da faixa — feito como
    // prescrito, a progressão anda (`shouldUp`). Sem carga anterior, fica 0 e
    // não conta (não há de onde subir)
    const topo = cronometrado(u) ? null : (u && q) || faixaDoTexto(slot.r)?.[1];
    const anteriorDoEx = ultima.find(l => l.id === slot.id && !l.sl && l.u === u && (!cronometrado(u) || l.q === q));
    const par = anteriorDoEx?.sets.find(Boolean);
    const tipo = cargaTipo(slot.id, ex);
    return { id: slot.id, nome: ex.n, u, q: u && q, n: setsFor(slot), alvo, topo,
      carga: par?.[0] ?? 0, reps: par?.[1] ?? alvo ?? 0, passo: passoDaCarga(tipo), unidadeCarga: u ? 'kg' : CARGAS[tipo].rot };
  });
  const series = ultima.reduce((n, l) => n + l.sets.filter(Boolean).length, 0);
  const da = anterior && new Date(anterior.t);
  return { ultima, prescrito, series,
    dataAnterior: da ? DIAS_LONGOS[da.getDay()] + ', ' + da.getDate() + '/' + (da.getMonth() + 1) : null };
};

CTX.guardaRegistro = async function (data, r, modo, ajustes) {
  const t = instanteDoRegistro(data, r.turno, r.hora);
  if (t == null && r.hora && data === hojeISO() && aplicaHora(instanteDaData(data), r.hora) > Date.now()) {
    return { erro: 'Essa hora ainda não chegou.' };
  }
  if (t == null || !Object.hasOwn(MODOS_DO_REGISTRO, modo)) return;
  let linhas = [];
  if (r.k !== 'livre' && modo !== 'presenca') {
    const { ultima, prescrito } = CTX.seriesDoRegistro(data, r.k, r.turno, r.hora, r.prog);
    if (modo === 'ultima') {
      if (!ultima.length) return;
      linhas = ultima;
    } else {
      const exercicios = modo === 'ajustar' ? ajustes : prescrito;
      for (const ex of exercicios) {
        const reps = modo === 'ajustar' ? ex.reps : (ex.topo || ex.alvo);
        if (ex.nao || !(reps > 0)) continue;
        const carga = modo === 'ajustar' ? ex.carga : (ex.carga || 0);
        linhas.push({ id: ex.id, u: ex.u, q: ex.q, sets: Array.from({ length: ex.n }, () => [carga, reps]) });
      }
    }
  }
  const sessao = await lancaTreino(r.k, { t, precisao: r.hora ? 1 : 'turno', grupos: r.grupos, dur: r.dur, prog: r.prog }, linhas);
  if (!sessao) return;
  const sigla = siglaDoTreino(r.k);
  const treino = r.k === 'livre' ? 'Treino livre' : sigla === 'HX' ? 'HYROX' : 'Treino ' + sigla;
  const quando = r.hora ? fmtHoraDita(t) : TURNO_DITO[r.turno];
  return { texto: [treino, CTX.diaDoRegistro(data).dia, quando, r.k !== 'livre' && MODOS_DO_REGISTRO[modo]].filter(Boolean).join(' · ') + '.',
    desfaz: async () => {
      const m = S.done.find(x => x.sid === sessao.sid);
      if (!m || S.sessao?.sid === m.sid) return;
      const antes = JSON.stringify({ done: S.done, logs: S.logs, apagados: S.apagados });
      retiraSessao(m);
      if (await save() === false) {
        // o armazenamento recusou: o treino continua como estava, como nas outras gravações
        const v = JSON.parse(antes);
        S.done = v.done; S.logs = v.logs; S.apagados = v.apagados;
        render(); return false;
      }
      render(); return true;
    } };
};

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
  view.add = null; saiDoDestinoNoDesenho('add');
  view.day = m.day; view.open = 0; abreModo();
  await save();
  render(); rola(0);
  toast(fechou
    ? 'Treino ' + fechou + ' de hoje encerrado. Agora preenchendo ' + fmtDate(m.t) + '.'
    : 'Preenchendo o treino de ' + fmtDate(m.t) + '. Some sozinho quando você sair.');
}

async function concluirRetro() {
  const t = S.sessao ? S.sessao.inicio : null;
  fechaSessao('manual');
  view.open = null;
  await save();
  render(); rola(0);
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
  // O mesmo relógio do resto do app (`Date.now`, via `hojeISO`): com `new
  // Date()` a conta dos 14 dias e as casas que o Agora desenha liam relógios
  // diferentes sempre que o relógio do app não era o da parede.
  return diasInterpretaveis(S.comidaHist, 14, hojeISO());
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
    passoEm: passoEmVigor() ? passoEmVigor().t : null,
    // com o instante, semanas velhas não decidem
    agora: Date.now()
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
  const c = pose ? comAPose(S.protocolo.sessoes, pose) : [];
  if (c.length < 2) return null;
  // A sessão mais nova contra a mais antiga que ainda cabe na janela de 10 a 28
  // dias. Era sempre o par mais longo (a primeira sessão contra a última): a
  // partir da quarta sessão, a cada 14 dias, ele passava de 28 dias, a pergunta
  // sumia dos caminhos guiados e o corte por ganho rápido travava.
  const ate = instanteDaData(c[c.length - 1].d);
  for (let i = 0; i < c.length - 1; i++) {
    const de = instanteDaData(c[i].d);
    const dias = Math.round((ate - de) / 86400000);
    if (dias >= JANELA_MIN && dias <= JANELA_MAX) return { de: de, ate: ate, pose: pose, dDe: c[i].d, dAte: c[c.length - 1].d };
  }
  return null;
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
  const h = view.bodyHora && view.bodyHora[k];
  if (h && /^\d\d:\d\d$/.test(h)) {
    const x = new Date(d); x.setHours(Number(h.slice(0, 2)), Number(h.slice(3, 5)), 0, 0);
    return x.getTime();
  }
  return sameDay(d, Date.now()) ? Date.now() : d;
}
function horaHHMM(t) { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
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
/**
 * `leituras`: quantas leituras da fita deram `v` (a média delas). Só para
 * medida com fita; `1` marca "guardar só esta" (`Marca.n`).
 */
function gravaMarca(k, v, quando, onde, semHora, leituras) {
  if (!Array.isArray(S.body[k])) S.body[k] = [];
  const arr = S.body[k];
  const noDia = arr.filter(x => sameDay(x.t, quando));
  // O "como eu medi" de uma medida com fita é guardado na primeira vez e não
  // volta a ser digitado. Corrigir o valor do MESMO dia sem texto novo não pode
  // levá-lo junto com a marca substituída — senão a correção de um número
  // apagaria o lembrete que existe para o ponto não mudar.
  if (!onde) onde = noDia.map(x => x.onde).filter(Boolean)[0] || null;
  let morte = 0;
  noDia.forEach(x => { morte = lapide(chaveDeMarca(k, x)); arr.splice(arr.indexOf(x), 1); });
  // A medida de um dia passado tem instante fixo (7h), e a nova cai na MESMA
  // chave da que saiu: o carimbo tem de vir depois da lápide.
  const nova = { t: quando, v, m: depoisDe(morte) };
  if (onde) nova.onde = onde;
  if (semHora) nova.semHora = 1;
  if (typeof leituras === 'number' && leituras >= 1) nova.n = Math.round(leituras);
  arr.push(nova);
  arr.sort((a,b) => a.t - b.t);
  if (arr.length > TETO.body) S.body[k] = arr.slice(-TETO.body);
  return noDia.length;
}

async function addBody(k) {
  const v = valorDoCorpo(k);
  if (isNaN(v) || v <= 0) { toast('Digite um número válido.'); return; }

  const quando = instanteDaMedida(k);
  if (quando > Date.now() + 60000) { toast('Essa hora ainda não chegou. Confira a hora.'); return; }
  const rotulo = rotuloDoDia(quando);
  // O texto de "como eu medi" só existe nas medidas com fita, e vazio é "não
  // disse" — nunca uma frase em branco gravada por cima do lembrete.
  // Sem texto dele, vai o ponto de antes ou o padrão da tabela: toda medida
  // com fita sai com o "onde mediu" preenchido.
  const med0 = medidaDoCorpo(k);
  const onde = ((view.bodyOnde && typeof view.bodyOnde[k] === 'string') ? view.bodyOnde[k].trim() : '') ||
    (med0 && med0.fita ? (ondeMediu(S.body[k]) || med0.onde || '') : '');
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
  view.bodyHora = Object.assign({}, view.bodyHora);
  delete view.bodyHora[k];
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
async function registraBio(leitura, quando, semHora) {
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
  vai.forEach(function (x) { substituiu += gravaMarca(x.k, x.v, t, null, !!semHora); });

  await save();
  render();
  // "Guardei os cinco números de 01/10 neste aparelho." (§10.3): quantos, e o
  // que entrou — é o que impede o "Guardar" de ser o "Salvar" que V2 recusa.
  toast('Guardei os ' + POR_EXTENSO[vai.length] + ' números de ' + fmtDate(t) + (semHora ? '' : ' às ' + fmtHora(t)) + ' neste aparelho.' +
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
CTX.tentaGravar = function () {
  if (view.revisao && view.revisao.falhou) return CTX.incorporaRevisao();
  if (view.repeteInicio && passoInicial()) return view.repeteInicio();
  return save();
};
/** "Ver", na faixa da falha: o painel com o que era, o porquê e o que fazer. */
CTX.verFalha = function () { if (view.naoGuardado) { view.falhou = true; render(); } };
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
  const sessoes = function (n) { return n + (n === 1 ? ' sessão' : ' sessões'); };
  const exercicios = function (n) { return n + (n === 1 ? ' exercício' : ' exercícios'); };
  // Com a conta entrada, importar JUNTA: o histórico da conta não é apagado, e
  // o que este aparelho ainda não enviou também não. Antes o aviso dizia
  // "substitui", e a sincronia seguinte trazia de volta tudo o que o arquivo não
  // tinha — e o que só existia aqui, sem ter subido, se perdia de verdade.
  const comConta = !!NUVEM.sessao();
  if (!comConta && soTemAbertura(d) && !soTemAbertura(S)) {
    toast('Essa cópia só tem as escolhas da primeira vez. Seu registro continua aqui.');
    return;
  }
  const ok = await pare(comConta
    ? { texto: 'Importar ' + sessoes(nS) + ' e ' + exercicios(nE) + ' do backup junta o que está nele ao histórico da sua conta (' + sessoes(S.done.length) + '): o que estiver no arquivo volta, e nada do que já está aqui ou na conta é apagado.',
        sim: 'Juntar o backup', tom: 'pergunta' }
    : { texto: 'Importar ' + sessoes(nS) + ' e ' + exercicios(nE) + ' substitui o histórico atual deste aparelho (' + sessoes(S.done.length) + '): o que não estiver no arquivo sai daqui. Exporte antes se tiver dúvida.',
        sim: 'Substituir pelo backup' });
  if (!ok) return;
  const atual = S;

  S = { primeiraVez: d.primeiraVez, logs: d.logs, done: d.done, deload: !!d.deload, draft: d.draft || null,
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
        apelidos: (d.apelidos && typeof d.apelidos === 'object' && !Array.isArray(d.apelidos)) ? d.apelidos : {},
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
        // o que aparece: preferência da pessoa, limpa em `normalizaEstado()`
        modulos: (d.modulos && typeof d.modulos === 'object') ? d.modulos : null,
        // o que ele mandou os agentes olharem; limpo em `normalizaEstado()`
        paraAvaliar: Array.isArray(d.paraAvaliar) ? d.paraAvaliar : undefined,
        // a sincronização: sem estes, importar um backup zeraria o carimbo do
        // estado e as lápides — e um aparelho ressuscitaria o que o outro apagou
        mtime: typeof d.mtime === 'number' ? d.mtime : 0,
        carimbos: (d.carimbos && typeof d.carimbos === 'object') ? d.carimbos : {},
        carimbosEm: typeof d.carimbosEm === 'number' ? d.carimbosEm : 0,
        apagados: (d.apagados && typeof d.apagados === 'object') ? d.apagados : {},
        falta: d.falta,
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
        lixeira: Array.isArray(d.lixeira) ? d.lixeira : [],
        quadro: (d.quadro && typeof d.quadro === 'object') ? d.quadro : null,
        lousa: (d.lousa && typeof d.lousa === 'object') ? d.lousa : null,
        progTreinador: (d.progTreinador && typeof d.progTreinador === 'object') ? d.progTreinador : null,
        // os programas (etapa 1 do catálogo): sem ele, a migração recriaria um programa só
        programas: (d.programas && typeof d.programas === 'object' && !Array.isArray(d.programas)) ? d.programas : null };
  // um backup de qualquer versão anterior passa pelas mesmas migrações que o
  // estado do disco: sem isso o app abre com o programa nulo
  normalizaEstado();
  migraEstado();
  if (comConta) {
    S = funde(atual, S, Date.now()).estado;
    normalizaEstado();
    reduzReferencias(S); corrigeApelidosErrados(S);
  }
  garanteProgramaERotacao();
  delete view.escolhasIniciais;
  delete view.repeteInicio;
  if (S.primeiraVez) lembraDocumentos();
  carimbaProgramasNovos();
  montaCatalogo();
  await save();
  view.day = nextDay(); view.open = null; view.hist = null; view.json = null; view.paste = false;
  render();
  toast((comConta ? 'Backup juntado: ' : 'Histórico importado: ') + sessoes(nS) + '.');
}

/**
 * O TEMPO DO AVISO NA TELA, pelo tamanho do texto (peça 7 do motion; dono,
 * 16/10, pergunta 10: "fica o tempo do texto"). NÃO É MOVIMENTO: É LEITURA —
 * por isso mora aqui, e não nos tokens de tempo, e vale igual sob "Reduzir
 * movimento".
 *
 * Eram 3,6 s para toda mensagem, e as longas (até ~105 caracteres, com o nome
 * do exercício dentro: "Guardei como pulado hoje: Remada. Não volta a ser
 * pedido nesta sessão; desfazer põe de volta na fila.") sumiam antes de dar
 * tempo de ler (docs/motion/03 §5.1). A regra é uma só: um segundo para o olho
 * sair do que estava fazendo e achar o aviso, mais o texto a 15 caracteres por
 * segundo — o passo mais lento da faixa de leitura de frase curta (15 a 20,
 * 03 §5.1), porque quem lê está de pé, entre séries. Com piso nos 3,6 s de
 * antes (nenhuma mensagem fica MENOS do que ficava: até 39 caracteres, como
 * hoje) e teto em 8 s (as de 105 caracteres ou mais chegam nele; a mais longa
 * escrita no app tem 108). Contado no texto como ele aparece.
 */
const AVISO_PISO_MS = 3600;
const AVISO_TETO_MS = 8000;
const AVISO_ACHAR_MS = 1000;
const AVISO_CARACTERES_POR_S = 15;
function tempoDeLeitura(texto) {
  const n = String(texto == null ? '' : texto).trim().length;
  const le = AVISO_ACHAR_MS + Math.round(n * 1000 / AVISO_CARACTERES_POR_S);
  return Math.min(AVISO_TETO_MS, Math.max(AVISO_PISO_MS, le));
}

/**
 * O AVISO CURTO (o toast): a frase do que acabou de acontecer, no rodapé.
 * Informa, nunca interrompe, e nunca atrasa nada — `toast()` é chamado DEPOIS
 * de o que ele conta já estar gravado.
 *
 * `#toast` (`index.html`) é a região viva, e NUNCA sai da página: sem
 * mensagem ele fica vazio, em vez de `display: none` — que o tirava da árvore
 * de acessibilidade, e a mensagem que entrava junto com ele não era anunciada
 * de forma confiável (docs/motion/05 §3.2). A mensagem é um nó dentro dele
 * (`.aviso`), um por mensagem: o texto novo entra numa região que já estava
 * lá, e o leitor de tela o anuncia; vazio, não sobra frase velha para o dedo
 * do VoiceOver achar, nem nada para tocar.
 *
 * Um nó NOVO por mensagem nova é também o que faz a entrada recomeçar (peça 7;
 * `componentes.css`): o aviso sobe e acende de novo, para dizer que é OUTRA
 * mensagem. O mesmo texto com o aviso ainda na tela não é outra: o nó fica,
 * nada se mexe, e só o tempo recomeça (como sempre foi).
 *
 * A saída: o nó ganha `.sai` (apaga, e o toque passa por ele) e é tirado pelo
 * tempo de `--d-aviso-sai` lido na porta — nunca por evento de fim de
 * animação. Sob "Reduzir movimento" (e onde a porta não sabe) o tempo é 0, e
 * ele sai de uma vez.
 */
let avisoLeitura = null;   // o relógio do tempo de leitura
let avisoSaindo = null;    // o relógio da saída (o nó apagando)
function toast(msg) {
  const regiao = document.getElementById('toast');
  if (!regiao) return;
  const texto = msg == null ? '' : String(msg);
  clearTimeout(avisoLeitura);
  if (avisoSaindo) { clearTimeout(avisoSaindo); avisoSaindo = null; }
  // sem texto, não há aviso: nunca uma pílula vazia na tela
  if (!texto.trim()) { regiao.textContent = ''; avisoLeitura = null; return; }
  const atual = regiao.firstElementChild;
  if (!atual || atual.classList.contains('sai') || atual.textContent !== texto) {
    const no = document.createElement('div');
    no.className = 'aviso';
    no.textContent = texto;
    regiao.textContent = '';
    regiao.appendChild(no);
  }
  avisoLeitura = setTimeout(apagaAviso, tempoDeLeitura(texto));
}
/** O tempo de leitura acabou: o aviso apaga (com movimento) ou sai de uma vez. */
function apagaAviso() {
  avisoLeitura = null;
  const regiao = document.getElementById('toast');
  const no = regiao && regiao.firstElementChild;
  if (!no || no.classList.contains('sai')) return;
  const ms = tempoDoMovimento('--d-aviso-sai');
  if (ms > 0) {
    no.classList.add('sai');
    avisoSaindo = setTimeout(function () {
      avisoSaindo = null;
      if (no.parentNode) no.parentNode.removeChild(no);
    }, ms);
  } else {
    regiao.textContent = '';
  }
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

function go(d){ view.day=d; view.open=null; view.hist=null; view.nota=null; render(); rola(0); carregaFotosDoDia(); }
/**
 * Traz o exercício recém-aberto para a tela.
 *
 * Sem isto, abrir o primeiro exercício não mostrava a série: com a sessão
 * correndo, a primeira linha de digitar nascia em y=826 numa janela de 874 —
 * atrás da tab bar, invisível. Abrir e ROLAR eram duas ações, e a segunda caía
 * sobre quem está de pé, com uma mão, entre uma série e outra.
 *
 * `instant` e não suave: rolagem programática é sempre um salto (DESIGN.md
 * §Movimento). A rolagem suave é do navegador, sem token de tempo nem de curva,
 * e roda na thread que o `render()` ocupa — congela no meio. O cartão
 * simplesmente já está lá. Onde ele para é o `scroll-margin-top` de `.ex`.
 */
function mostraExercicio(i) {
  // Dentro do desenho novo quando há uma troca de camada pendente (a faixa que
  // leva ao modo e já abre o exercício): antes dele, o cartão ainda não existe.
  noDesenho(function () {
    const el = document.querySelector('[data-ex="' + i + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}

// ---------- a série recebida: o pouso e o dedo no lugar (peça 2 do motion) ----------

/**
 * A MARCA DE "RECÉM": qual célula acabou de receber um valor por um toque que
 * grava — a régua (repetição), o RIR, a coluna anterior (carga e repetição) e a
 * carga que o "+ série" copia. É ela, e só ela, que faz o número POUSAR
 * (docs/motion/03 §4.2): o número da célula mora num nó próprio por valor
 * (`ui/exercicio.jsx`), e a animação só vale sob a classe `recem`. Sem a marca,
 * abrir um cartão ou entrar no modo faria todas as células pousarem de uma vez
 * — o `.sets` escondido mostra os nós ao abrir, e animação de nó que estava em
 * `display: none` começa quando ele aparece.
 *
 * É estado de TELA, nunca dado: não grava nem sincroniza. E sai sem ouvir o fim
 * de animação nenhum (sob "Reduzir movimento" o evento nem chega):
 *  - o próximo registro a troca pela dele;
 *  - abrir ou fechar um cartão, ou entrar no modo, a apaga: o que reaparece não
 *    pousa de novo;
 *  - e ela vence sozinha em um segundo, folga de sobra sobre os 160 ms do pouso.
 *    O render() seguinte desenha a célula sem a classe, e nada se mexe: o último
 *    quadro do pouso é o número parado.
 * Um render() no meio do pouso não o reinicia — o nó é o mesmo (a chave é o
 * valor) e a classe é a mesma — nem faz outra célula pousar.
 *
 * O teclado próprio NÃO marca: a célula muda a cada dígito e o visor do teclado
 * já é o lugar do olho; pousar cada tecla seria cintilar (03 §4.2).
 */
const VIDA_DO_RECEM_MS = 1000;
function marcaRecem(i, k, campos) {
  view.recem = { dia: view.day, i: i, k: k, campos: campos, t: Date.now() };
}
/** Quais campos da série — carga, repetição, RIR — estão sob a marca agora. */
function recemDaSerie(d, i, k) {
  const r = view.recem;
  const vale = !!r && r.dia === d && r.i === i && r.k === k && Date.now() - r.t < VIDA_DO_RECEM_MS;
  return [0, 1, 2].map(function (p) { return vale && r.campos.indexOf(p) >= 0; });
}

/**
 * O DEDO NÃO PERDE O LUGAR (defeito 2 da docs/motion/03 §8.6, consertado na
 * peça 2). O nó persiste no render(), mas a posição não: na primeira série da
 * sessão nascem no topo o relógio e os controles (52 px), a linha tocada desce e
 * a célula de carga da mesma série cai sob o dedo; no teclado, a tecla de cima
 * cai sob o dedo e o segundo dígito vai para a tecla errada; depois de "Pular",
 * o cartão fecha e o nome do exercício seguinte sobe para baixo do dedo.
 *
 * O conserto é ROLAGEM, de uma vez — rolagem programática é sempre um salto
 * (`DESIGN.md` §Movimento) —, e só depois do render(): nada do que se grava
 * muda, nem a ordem dos toques. O "antes" se mede no toque, com a página ainda
 * montada; o "depois" e a rolagem, no desenho seguinte (`depoisDoLayout`).
 * Sem nada a medir (o jsdom dos testes de fluxo não tem layout) nada rola.
 */
function topoNaTela(el) {
  if (!el || !el.getClientRects().length) return null;   // não desenhado
  return el.getBoundingClientRect().top;
}
function centroNaTela(el) {
  if (!el || !el.getClientRects().length) return null;
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
}
function rolaPor(dy) {
  if (!(Math.abs(dy) >= 1)) return;
  noDesenho(function () { window.scrollTo(0, window.scrollY + dy); });
}

/**
 * Roda `fn` no próximo desenho: DEPOIS do layout e ANTES da pintura.
 *
 * Medir a página logo depois do render(), ainda dentro do toque, obriga o
 * navegador a montar o layout ali mesmo — no WebKit desta máquina, na primeira
 * série, isso trazia para dentro do toque mais de 100 ms que o quadro ia gastar
 * de qualquer jeito (a fonte que falta no Linux). O lugar certo para medir e
 * corrigir a rolagem é o ponto do desenho em que o layout já está pronto e nada
 * foi pintado: é onde o navegador entrega as observações de um ResizeObserver.
 * Observar a raiz de novo garante uma entrega no próximo desenho (a primeira
 * observação de um elemento sempre chega), e a rolagem feita ali sai no MESMO
 * quadro — nenhum quadro mostra a linha fora do lugar.
 *
 * Não é movimento: é medida. Sem ResizeObserver (o jsdom; Safari antes do
 * 13.1), roda na hora.
 */
let paraDepoisDoLayout = [];
let vigiaDoLayout = null;
function depoisDoLayout(fn) {
  if (typeof ResizeObserver !== 'function') { fn(); return; }
  paraDepoisDoLayout.push(fn);
  if (!vigiaDoLayout) {
    vigiaDoLayout = new ResizeObserver(function () {
      vigiaDoLayout.disconnect();
      const fs = paraDepoisDoLayout;
      paraDepoisDoLayout = [];
      fs.forEach(function (f) { try { f(); } catch (e) {} });
    });
  }
  vigiaDoLayout.observe(document.documentElement);
}

function linhaDaSerie(i, k) {
  const c = document.querySelector('[data-ex="' + i + '"]');
  return c ? c.querySelectorAll('.setrow')[k] || null : null;
}
/** Onde a linha da série está na tela agora, antes do toque mexer em algo. */
function ondeEstaALinha(i, k) { return topoNaTela(linhaDaSerie(i, k)); }
/**
 * No desenho seguinte, a linha volta para onde estava. Não quando o cartão
 * fechou: aí o toque levou ao próximo exercício (o avanço da última série, o
 * bi-set), e quem rola é `mostraExercicio`, de propósito.
 */
function devolveALinha(i, k, antes) {
  if (antes == null) return;
  depoisDoLayout(function () {
    if (view.open !== i) return;
    const agora = ondeEstaALinha(i, k);
    if (agora != null) rolaPor(agora - antes);
  });
}

/** O botão da linha da refeição `id` no Agora (o id é dado: compara, não monta seletor). */
function botaoDaLinhaDaComida(id) {
  const ls = document.querySelectorAll('.ag-l-b');
  for (let j = 0; j < ls.length; j++) if (ls[j].getAttribute('data-a') === 'linha-' + id) return ls[j];
  return null;
}
/**
 * A linha da comida marcada (ou desfeita) pela linha aberta volta, no desenho
 * seguinte, para onde estava: a leitura de volta nasce ou sai acima dela
 * (defeito 3 da docs/motion/03 §8.5; ver `marcaLinhaDaComida`). Onde o
 * navegador já ancorou a rolagem, a linha está no lugar e nada rola.
 *
 * E O DEDO CONTINUA SOBRE ELA (ajustes finais do motion; 07 §14.3). `dedo` é a
 * altura do toque na tela (`pontoDoToque`), ou `null` (teclado, script). O dedo
 * estava num botão do PAINEL aberto da linha ("Comi tudo", 123 px abaixo da
 * linha fechada), e a marca fecha o painel: com o topo da linha no lugar, sob o
 * dedo subia a linha seguinte — a "Ceia" —, e um segundo toque rápido a abria.
 * Então a rolagem é pelo PONTO DO TOQUE: quando a linha, com o topo de volta ao
 * lugar, deixaria o dedo fora dela, a página rola só o que falta para ele cair
 * DENTRO da linha, a `folga` da borda; com o dedo já sobre ela (o "Desfazer",
 * que reabre o painel no lugar), nada muda. A linha desce, de uma vez, até o
 * dedo — o mínimo, e só para isso: o painel que fechou era o que estava sob ele.
 */
function devolveALinhaDaComida(id, antes, dedo) {
  if (antes == null) return;
  depoisDoLayout(function () {
    const b = botaoDaLinhaDaComida(id);
    const agora = topoNaTela(b);
    if (agora == null) return;
    let dy = agora - antes;
    if (dedo != null) {
      const r = (b.closest('li') || b).getBoundingClientRect();
      const topo = r.top - dy, base = r.bottom - dy;
      const folga = Math.min(12, b.getBoundingClientRect().height / 4);
      if (dedo >= base) dy -= dedo - (base - folga);
      else if (dedo < topo) dy += (topo + folga) - dedo;
    }
    rolaPor(dy);
  });
}

function toggle(i){
  const abrindo = view.open !== i;
  view.open = abrindo ? i : null;
  view.swapOpen = null; view.nota = null; view.carga = null; view.medida = null;
  // O que reaparece não pousa de novo (ver `marcaRecem`).
  view.recem = null;
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
 * Quem vê já tem a confirmação na tela: o número entra na célula que recebeu o
 * toque, e o descanso começa. O que faltava era a metade auditiva: nenhuma das
 * chamadas de `toast` é da gravação de série, e o `<input>` ecoava o valor por
 * ser campo — o que deixa de valer no dia em que a régua substituir o campo.
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
  // O BI-SET É UM CIRCUITO (dominio/biset.ts): estação 1 → estação 2 →
  // descanso do par (o da estação 2) → volta. Sem pausa entre as estações da
  // mesma rodada; a série que sobra, sozinha, descansa o próprio tempo.
  const par = parAtivoDe(view.day, i);
  if (par) {
    const lado = i === par.a ? 'a' : 'b';
    const depois = depoisDaSerie(lado, k, estacaoDe(par.a), estacaoDe(par.b));
    const outra = lado === 'a' ? par.b : par.a;
    if (depois === 'segue') { proximoDoBiset(outra); return; }
    const exD = depois === 'par' ? treino(view.day).ex[par.b] : ex;
    startTimer(descOf(exD), 'descanso do par ' + par.n + ' · rodada ' + (k + 1));
    if (k === ult) avancaExercicio(i);
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

/** A outra estação do par, sem pausa. `j` é a posição dela no treino. */
function proximoDoBiset(j) {
  const prox = treino(view.day).ex[j];
  if (!prox) return;
  // no treino em foco a série seguinte já é a da outra estação (`serieEmFoco`);
  // no cartão antigo, ela abre
  if (!view.modoSessao) { view.open = j; view.swapOpen = null; }
  render();
  if (!view.modoSessao) toast('Sem pausa: vá direto para ' + prox.n.replace(' (bi-set)','') + '.');
}

// ---------- o par (bi-set) do treino de hoje ----------
/** As estações 1 dos pares separados hoje ("Separar hoje"), por posição no treino do dia. */
function separadosHoje(d) {
  const s = S.sessao, t = treino(d);
  if (!s || !s.separar || !s.separar.length || !t) return [];
  const out = [];
  t.ex.forEach(function (_, i) { if (s.separar.indexOf(slotDe(d, i)) >= 0) out.push(i); });
  return out;
}
/** Os pares do treino `d`, com os separados de hoje marcados. */
function paresDe(d) {
  const t = treino(d);
  return paresDoTreino(t ? t.ex : [], separadosHoje(d));
}
/** O par ATIVO (não separado hoje) em que a posição `i` está, ou null. */
function parAtivoDe(d, i) {
  const p = paresDe(d).de[i];
  return p && !p.separado ? p : null;
}
/** O que o circuito precisa saber da estação `i` do dia em tela. */
function estacaoDe(i) {
  const ex = treino(view.day).ex[i];
  const dr = draftPeek(i);
  return { series: setsFor(ex), cheia: function (k) { return serieCheia(dr, k); }, fora: ehPulado(i) };
}
/** O equipamento de um exercício, para o aviso de troca de aparelho: "Polia". */
function equipamentoDoEx(ex) {
  if (!ex) return null;
  const sis = SISTEMA.ex[ex.id] || SISTEMA.ex[ex.orig];
  const id = (sis && sis.eq) || equipamentoDe(ex.n || '', ex.car || 'pino', ex.u);
  return EQUIPAMENTOS[id] ? { id: id, n: EQUIPAMENTOS[id].n } : null;
}
/** "1:22", para o trecho do vídeo. */
function mmss(seg) { seg = Math.max(0, Math.round(seg || 0)); return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0'); }
/**
 * A MÍDIA DO EXERCÍCIO (Fase D) na forma da tela: o vídeo de referência (só o
 * trecho, sem som de saída, repetindo) e a animação de duas imagens, quando o
 * catálogo tiver. Os pontos-chave saem da pegada e da dica do treinador. Nada
 * aqui grava: é leitura do catálogo do sistema.
 */
function midiaDoExV3(ex, pg) {
  if (!ex) return null;
  const m = midiaDo(SISTEMA, NOMES_ALT, ex.id || '', ex.n);
  if (!m) return null;
  const out = { n: ex.n, pontos: [] };
  if (m.video) {
    const v = m.video, dur = v.fim > v.inicio ? v.fim - v.inicio : 0;
    out.video = {
      yt: v.yt, inicio: v.inicio, fim: v.fim, canal: v.canal, idioma: v.idioma,
      dur: dur ? mmss(dur) : '', trecho: mmss(v.inicio) + (v.fim ? '–' + mmss(v.fim) : ''),
      embed: 'https://www.youtube-nocookie.com/embed/' + v.yt + '?start=' + v.inicio + (v.fim ? '&end=' + v.fim : '') +
        '&mute=1&playsinline=1&rel=0&modestbranding=1&autoplay=1&loop=1&playlist=' + v.yt,
      url: 'https://www.youtube.com/watch?v=' + v.yt + '&t=' + v.inicio + 's',
      inteiro: 'https://www.youtube.com/watch?v=' + v.yt
    };
  }
  if (m.anim) out.anim = { inicio: m.anim.inicio, pico: m.anim.pico, credito: m.anim.credito, fonte: m.anim.fonte };
  const p = pg || {};
  if (p.pegada) out.pontos.push('Pegada: ' + p.pegada + '.');
  if (p.pes) out.pontos.push('Pés: ' + p.pes + '.');
  (p.dica || '').split(/;\s*|\.\s+/).map(function (t) { return t.trim().replace(/\.$/, ''); }).filter(Boolean).forEach(function (t) {
    if (out.pontos.length < 3) out.pontos.push(t.charAt(0).toUpperCase() + t.slice(1) + '.');
  });
  out.pontos = out.pontos.slice(0, 3);
  return out;
}
const CHAVE_SUGESTOES = 'lastro-sugestoes-midia-v1';
/**
 * "Sugerir um melhor": por ora a sugestão fica neste aparelho, com a hora, e a
 * tela diz que foi para a curadoria. A fila de curadoria de verdade (todos os
 * usuários, aprovação do moderador) é a Fase F; quando ela existir, estas
 * sobem. Não entra no estado sincronizado.
 */
CTX.sugereMidia = function (sug) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(CHAVE_SUGESTOES) || '[]'); if (!Array.isArray(lista)) lista = []; } catch (e) { lista = []; }
  lista.push(Object.assign({ t: Date.now() }, sug));
  try { localStorage.setItem(CHAVE_SUGESTOES, JSON.stringify(lista.slice(-50))); } catch (e) { return false; }
  return true;
};
CTX.abreVideo = function (m) { if (m && m.video) CTX.abreFolha({ k: 'video', m: m }); };
CTX.ampliaMidia = function (m) { if (m) CTX.abreFolha({ k: 'ampliaMidia', m: m }); };
CTX.sugereFolha = function (m) { CTX.abreFolha({ k: 'sugereMidia', m: m }); };
/**
 * Guarda no aparelho as animações do programa ativo, para a academia sem sinal:
 * pede ao service worker (cache `lastro-midia`). Sem animação no catálogo, nada.
 */
function guardaMidiaDoPrograma() {
  try {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    const urls = [];
    Object.keys(S.prog || {}).forEach(function (d) {
      ((S.prog[d] && S.prog[d].ex) || []).forEach(function (sl) {
        const m = midiaDo(SISTEMA, NOMES_ALT, sl.id, nomeEx(sl.id));
        if (m && m.anim) urls.push(m.anim.inicio, m.anim.pico);
      });
    });
    if (urls.length) navigator.serviceWorker.controller.postMessage({ tipo: 'guarda-midia', urls: urls });
  } catch (e) { /* sem worker: sem cópia offline */ }
}
/** A pegada e os pés de um exercício: da dica do treinador, ou do catálogo. A dica volta sem eles. */
function pegadaDoEx(ex) {
  const sp = separaPegada(ex && ex.cue);
  return {
    pegada: sp.pegada || (ex && ex.peg && !ex.pegPe && !sp.pes ? ex.peg : null),
    pes: sp.pes || (ex && ex.peg && ex.pegPe && !sp.pegada ? ex.peg : null),
    dica: sp.resto
  };
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
  const linha = ondeEstaALinha(i, k);
  e.s[k][0] = p[0];
  e.s[k][1] = p[1];
  marcaRecem(i, k, [0, 1]);            // os dois números pousam
  segurarTela();
  projeta(i);
  atualizaEstado();
  atualizaAnilhas(i);
  queueSave();
  render();
  devolveALinha(i, k, linha);
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
  CTX.abreFotoDoAparelhoV3(ex.id);
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

// ---------- a lousa do box (a D, `aula.html`, estado 6; decisão do dono, 14/10) ----------
//
// Foto agora, transcrição quando der. Um toque fotografa e acaba ali: nada fica
// esperando resposta. A foto fica guardada no dia e, quando a aula termina,
// vira parte daquela sessão. Se a aula de hoje já foi encerrada, a foto vai
// direto para ela.
async function tiraFotoDaLousa(el) {
  const arquivo = el && el.files && el.files[0];
  const day = view.day;
  if (!arquivo || !diaAberto(day)) return;
  el.value = '';
  const d = hojeISO();
  // a versão é o instante, e anda se a anterior for do mesmo milissegundo: é a
  // chave dos bytes, e duas fotos não podem dividir uma
  const anterior = lousaDoDia(day);
  const v = Math.max(Date.now(), anterior ? anterior.v + 1 : 0);
  let ext;
  try {
    const r = await LOUSA.reduz(arquivo);
    ext = r.ext;
    await LOUSA.guarda(d, v, r.blob, ext);
  } catch (e) {
    toast('A foto da lousa não foi guardada: o armazenamento deste aparelho recusou.');
    return;
  }
  const ref = { d: d, v: v, ext: ext };
  const encerrada = !(S.sessao && S.sessao.day === day) &&
    S.done.filter(function (x) { return x.day === day && !x.livre && sameDay(x.t, Date.now()); }).slice(-1)[0];
  const antes = { lousa: S.lousa, marca: encerrada ? encerrada.lousa : undefined, m: encerrada ? encerrada.m : undefined };
  if (encerrada) { encerrada.lousa = ref; encerrada.m = Date.now(); }
  else S.lousa = { day: day, d: d, v: v, ext: ext, t: Date.now() };
  if ((await save()) === false) {
    // a referência volta; os bytes novos saem do cache, para não ficar órfão
    S.lousa = antes.lousa;
    if (encerrada) { if (antes.marca) encerrada.lousa = antes.marca; else delete encerrada.lousa; encerrada.m = antes.m; }
    LOUSA.esquece(d, v, ext);
    render();
    return;
  }
  // a foto que esta substitui sai do cache depois de a nova estar gravada
  const velha = encerrada ? antes.marca : antes.lousa;
  if (velha && velha.v !== v) LOUSA.esquece(velha.d, velha.v, velha.ext);
  await LOUSA.carrega(d, v, ext);
  render();
  toast('Foto da lousa guardada neste aparelho.');
}
CTX.tiraFotoDaLousa = function (el) { return tiraFotoDaLousa(el); };

/** A lousa do dia aberto `d`: a pendente, ou a da sessão de hoje já encerrada. */
function lousaDoDia(d) {
  const pendente = lousaDaAula(d, Date.now());
  if (pendente) return pendente;
  const m = S.done.filter(function (x) { return x.day === d && !x.livre && sameDay(x.t, Date.now()) && x.lousa; }).slice(-1)[0];
  return m ? m.lousa : null;
}

/**
 * "Mandar para transcrever": a foto sai do app pelo compartilhar do sistema, e
 * a transcrição volta como arquivo (estado 7). Sem compartilhar arquivo no
 * navegador, a tela diz o caminho em vez de fingir que mandou.
 */
CTX.mandaLousa = async function () {
  const l = lousaDoDia(view.day);
  if (!l) return;
  const b = await LOUSA.le(l.d, l.v, l.ext);
  if (!b) { toast('A foto não está mais neste aparelho.'); return; }
  const arq = typeof File === 'function' ? new File([b], 'lousa-' + l.d + '.' + l.ext, { type: b.type || 'image/webp' }) : null;
  const pode = arq && navigator.canShare && navigator.canShare({ files: [arq] });
  if (!pode || !navigator.share) {
    toast('Este navegador não manda arquivo daqui: abra a foto e compartilhe pelo sistema.');
    return;
  }
  try { await navigator.share({ files: [arq], title: 'Lousa de ' + fmtDate(instanteDaData(l.d)) }); } catch (e) {}
};

async function tiraFoto(el) {
  const arquivo = el && el.files && el.files[0];
  const id = fotoAberta();
  if (!arquivo || !id) return;
  el.value = '';                       // permite repetir a mesma foto
  try {
    const { blob, ext } = await FOTO.reduz(arquivo);
    const v = Date.now();
    await FOTO.guarda(id, blob, ext, v);   // os bytes dizem de que versão são
    S.fotos = Object.assign({}, S.fotos);
    S.fotos[id] = { v: v, ext: ext };
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
  const linha = ondeEstaALinha(i, k);
  view.regua = null;
  // o número pousa na célula; apagar não pousa nada
  if (atual !== v) marcaRecem(i, k, [1]);
  anotaSerie(i, k, 1, atual === v ? '' : v);
  render();
  devolveALinha(i, k, linha);
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
  mostraOTecladoInteiro();
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
  // No modo, a tecla que vem a seguir tem de estar onde o dedo está: a série que
  // a tecla completa pode ser a primeira da sessão, e o relógio que nasce no
  // topo desceria o teclado inteiro 52 px (ver `rolaPor`).
  const noModo = a.tipo === 'serie' || a.tipo === 'rapida';
  const teclado = noModo ? topoNaTela(document.querySelector('.tcl')) : null;
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
  if (teclado != null) depoisDoLayout(function () {
    // escondido (a tecla fechou a última série e o cartão avançou): nada a segurar
    const agora = topoNaTela(document.querySelector('.tcl'));
    if (agora != null) rolaPor(agora - teclado);
  });
}

function fechaTeclado() { view.teclado = null; render(); }

/**
 * O TECLADO INTEIRO NA TELA (peça 8 do motion, na conferência do coordenador).
 *
 * O teclado recebe o foco sem rolar (`preventScroll`, `teclado.jsx`): o foco
 * rolava sempre que o painel não estava inteiro na vista, e com a página no topo
 * a célula subia 131 px e uma tecla caía sob o dedo. Mas sem rolagem nenhuma o
 * teclado que nasce na metade de baixo da tela fica com a última fileira e o
 * "pronto" fora dela. No desenho seguinte, depois do layout e antes da pintura
 * (`depoisDoLayout`), ele vem inteiro para a área visível pelo MÍNIMO
 * (`block: 'nearest'`), de uma vez — rolagem programática é sempre um salto —;
 * quando já cabe, nada rola. O que conta como visível é o `scroll-margin` do
 * `.tcl` (`componentes.css`): descontados a área segura, o que é fixo no rodapé
 * e o que gruda no topo. Sem nada desenhado (o jsdom), nada rola.
 */
function mostraOTecladoInteiro() {
  depoisDoLayout(function () {
    const t = document.querySelector('.tcl');
    if (!t || !t.getClientRects().length || typeof t.scrollIntoView !== 'function') return;
    noDesenho(function () { t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); });
  });
}

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
  mostraOTecladoInteiro();
}


function abreRir(i, k) {
  const aberto = view.rir && view.rir.i === i && view.rir.k === k;
  view.rir = aberto ? null : { i: i, k: k };
  render();
}

function poeRir(i, k, v) {
  const e = draftOf(i);
  if (!e.s[k]) e.s[k] = [null, null];
  const linha = ondeEstaALinha(i, k);
  // tocar de novo no valor que já está lá limpa: registrar RIR é opcional, e
  // sem isso um toque errado não teria volta
  e.s[k][2] = e.s[k][2] === v ? null : v;
  if (e.s[k][2] != null) marcaRecem(i, k, [2]);
  view.rir = null;
  projeta(i); queueSave(); render();
  devolveALinha(i, k, linha);
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
  const t = marca.day ? treinoDaSessao(marca) : null;
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
  const m = sessaoNoInstante(t, view.sessao?.t === t ? view.sessao.sid : null);
  if (!m) return;
  if (S.sessao && S.sessao.sid === m.sid) {
    toast('Este treino está em andamento. Encerre ou descarte pelo ··· do treino.');
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

  retiraSessao(m);
  view.sessao = null;
  await save(); render(); rola(0);
  toast(series ? 'Treino e séries apagados.' : 'Registro apagado.');
}

// A presença e os logs têm chaves próprias na fusão. O Desfazer tira só este sid.
function retiraSessao(m, comLapide = true) {
  if (comLapide) lapide(chaveDeSessao(m), Math.max(Date.now(), m.m || 0));
  S.done = S.done.filter(x => x !== m && (m.sid == null || x.sid !== m.sid));
  for (const [idEx, lista] of Object.entries(S.logs)) {
    const dela = lista.filter(l => l.sid === m.sid);
    if (!dela.length) continue;
    if (comLapide) for (const l of dela) lapide(chaveDeLog(idEx, l), Math.max(Date.now(), l.m || 0));
    S.logs[idEx] = lista.filter(l => l.sid !== m.sid);
    if (!S.logs[idEx].length) delete S.logs[idEx];
  }
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
  const m = sessaoNoInstante(t, view.sessao?.t === t ? view.sessao.sid : null);
  if (!m) return;
  m.dur = Math.max(1, Math.min(600, Math.round(minutos))) * 60000;
  m.fim = 'manual';
  m.m = Date.now();                    // carimbo: é ele que a fusão compara
  view.sessao = m;
  await save(); render();
  toast('Tempo corrigido.');
}

/**
 * Corrige a hora de COMEÇO de um treino já registrado (dono, 21/10): o treino
 * aberto ao vivo depois da hora carimba o começo com a hora de agora, e antes
 * não havia onde dizer a hora de verdade. Muda o instante do registro e não a
 * identidade dele: as séries estão ligadas pelo `sid`, que fica. O fim anda junto
 * (a duração continua a mesma; ela se corrige nos botões ao lado). Hora no
 * futuro não grava; o treino em andamento não se corrige (o relógio dele corre).
 */
async function corrigeComeco(t, txt) {
  const m = sessaoNoInstante(t, view.sessao?.t === t ? view.sessao.sid : null);
  if (!m || (S.sessao && S.sessao.sid === m.sid)) return;
  const novo = aplicaHora(m.t, txt);
  if (novo == null || novo > Date.now()) return;
  m.t = instanteLivre(novo, m);
  m.hora = 1;
  delete m.ini;                        // "marcado antes do aquecimento" não vale mais
  m.m = Date.now();                    // carimbo: é ele que a fusão compara
  S.done.sort(function (x, y) { return x.t - y.t; });
  view.sessao = m;
  view.corrigeTempo = m.t;             // o painel fica aberto no registro, agora na hora nova
  await save(); render();
  toast('Começo corrigido.');
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
async function confirmaDuracao(t, sid) {
  const m = sessaoNoInstante(t, sid);
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
  const P = m.day ? treinoDaSessao(m) : null;
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

// A correção de uma série e o registro do cartão entram no mesmo histórico ordenado.
function escreveSeriesPassadas(m, idEx, sets, metadados = {}, existente = null) {
  const e = existente || { t: m.t, sid: m.sid };
  if (!existente) {
    if (m.dl) e.dl = 1;
    if (metadados.u) e.u = metadados.u;
    if (metadados.q) e.q = metadados.q;
    if (metadados.sl) e.sl = metadados.sl;
    // "registrado depois" só pelo cartão: corrigir uma série de um treino anotado ao vivo não o torna declarado
    if (metadados.dp) e.dp = 1;
    const lista = S.logs[idEx] = (S.logs[idEx] || []).slice();
    const pos = lista.findIndex(l => l.t > e.t);
    lista.splice(pos < 0 ? lista.length : pos, 0, e);
  }
  e.sets = sets;
  e.m = Date.now();
  return e;
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
  const antes = e?.sets || [], mAntes = e?.m;
  const sets = antes.slice();
  while (sets.length < p.k) sets.push(null);
  sets[p.k] = [p.carga != null ? p.carga : 0, reps];
  e = escreveSeriesPassadas(m, p.idEx, sets, {}, e);
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
  const P = m && m.day ? treinoDaSessao(m) : null;
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

function sessaoNoInstante(t, sid) {
  return S.done.find(m => sid != null ? m.sid === sid : m.t === t);
}
function abrirSessao(t, sid){ view.sessao = sessaoNoInstante(t, sid); if (view.sessao) { entraNoDestino('sessao'); render(); } }
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
    [Object.keys(S.descanso).length, 'descanso marcado', 'descansos marcados'],
    [Object.keys(S.falta).length, 'falta', 'faltas'],
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
  S = { primeiraVez:S.primeiraVez, logs:{}, done:[], deload:false, draft:null, sessao:null, cardio:[],
        body:corpoVazio(), carga:{}, export:0,
        plano:PLANO_ATUAL, prog:S.prog, rot:S.rot, ex:S.ex, apelidos:S.apelidos || {}, mods:null, progLog:S.progLog || [],
        progTreinador:S.progTreinador || null, programas:S.programas || null,
        // Os carimbos dos documentos ficam: o programa e o plano que sobrevivem
        // continuam sendo a versão de quando foram editados, e zerar o carimbo
        // faria a cópia velha do outro aparelho vencer.
        carimbos:S.carimbos || {}, carimbosEm:S.carimbosEm || 0,
        // A metade de comida também sobrevive: apagar histórico de TREINO não
        // é apagar o plano nutricional, do mesmo jeito que não apaga o programa.
        cadencia:S.cadencia, comida:S.comida, dia:null, ajuste:S.ajuste, ajusteHist:S.ajusteHist, gordura:S.gordura, quadro:S.quadro, lousa:S.lousa,
        perfManual:S.perfManual, compras:S.compras, modulos:S.modulos || null,
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
  // E o BUCKET das fotos de corpo também: cada foto que existia entra na fila de
  // apagar da nuvem (`apagaDaNuvemDepois`), que anda na reconciliação seguinte
  // com rede e só larga um pedido quando o servidor confirma. O gesto continua
  // sem rede nenhuma; a falha de uma das chamadas só adia aquela.
  try { await CORPO.poda([]); } catch (e) {}
  ((antes.protocolo && antes.protocolo.sessoes) || []).forEach(function (ses) {
    Object.keys(ses.fotos || {}).forEach(function (pose) {
      const ref = ses.fotos[pose];
      if (ref && ref.v) apagaDaNuvemDepois(ses.d, pose, ref.ext || 'webp');
      if (ref && ref.v && ref.orig) apagaOriginalDaNuvemDepois(ses.d, pose, ref.v, ref.orig.ext);
    });
  });
  (antes.lixeira || []).forEach(function (x) {
    if (!x || !x.ref) return;
    CORPO.esquece(pastaDaLixeira(x.d), nomeNaLixeira(x.pose, x.ref.v), x.ref.ext).catch(function () {});
    apagaDaNuvemDepois(pastaDaLixeira(x.d), nomeNaLixeira(x.pose, x.ref.v), x.ref.ext);
    if (x.ref.orig) apagaOriginalDaNuvemDepois(x.d, x.pose, x.ref.v, x.ref.orig.ext);
  });
  if (NUVEM.sessao()) apagaPendentesDaNuvem();

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
  pintaTimer();
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
  // Dentro do gesto do usuário, que é o que o iPhone exige para o som começar.
  // Desde a peça 2 o contexto já nasceu ao entrar no modo (`preparaAudioDepois`)
  // e isto só o retoma se estiver suspenso; criar aqui é a rede de quem chegou
  // ao descanso sem passar pela entrada (ou antes do meio segundo dela).
  preparaAudio();
  segurarTela();
  pintaTimer();
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
  if (!timer) timer = setInterval(pintaTimer, 250);
  pintaTimer();
  gravaDescanso();
}

/**
 * O tique do descanso: quando ele zera, para o relógio e avisa (som e
 * vibração). Quem DESENHA o descanso é o treino em foco (`src/ui/v3/telas/treino.jsx`),
 * que lê `timerFim` pelo contexto e se redesenha com o próprio relógio.
 */
function pintaTimer() {
  if (!timerFim) return;
  const restante = Math.max(0, timerFim - Date.now());
  if (restante > 0) return;
  if (timer) { clearInterval(timer); timer = null; }
  if (!timerAvisado) {
    timerAvisado = true;
    // só avisa se a tela estiver à vista; se zerou com o app em segundo
    // plano, tocar depois seria pior do que não tocar
    if (!document.hidden) aviso();
  }
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  timerFim = 0; timerAvisado = false;
  timerCtx = '';
  apagaDescanso();
  try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
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

/**
 * O SOM NASCE AO ENTRAR NO MODO DE SESSÃO, e não no toque da primeira série
 * (peça 2 do motion; docs/motion/04 R8).
 *
 * Criar o `AudioContext` é caro e não dá para fatiar: 43 a 55 ms dentro do
 * construtor no Chromium; no WebKit o construtor volta na hora e a thread fica
 * presa uns 60 ms logo depois, ligando o motor de som. Até 16/10 isso acontecia
 * dentro do toque da primeira série de cada abertura — o toque mais repetido
 * do produto, no quadro em que o número entra e o descanso começa (80,6 ms de
 * trabalho no toque, a frio, no Chromium). Aqui ele vai para logo depois da
 * entrada no modo: meio segundo depois, quando a tela do modo já chegou e o
 * dedo ainda não voltou; no Chromium, além disso, só quando a página fica
 * ociosa (o WebKit não tem `requestIdleCallback`).
 *
 * Meio segundo, e não mais: o iPhone só deixa o som começar dentro de um gesto,
 * e o WebKit leva o gesto do toque de entrada até um `setTimeout` de até um
 * segundo. Entrar pela abertura do app (sem toque) cria o contexto suspenso, e
 * quem o retoma é `preparaAudio()` no primeiro descanso, dentro do toque da
 * série, como sempre foi. O som e a hora em que ele toca não mudam: o bipe
 * continua sendo `aviso()`, no fim do descanso.
 */
function preparaAudioDepois() {
  if (audioCtx || somAgendado) return;
  somAgendado = setTimeout(function () {
    somAgendado = null;
    if (desligado) return;
    const ocioso = window.requestIdleCallback;
    if (typeof ocioso === 'function') ocioso.call(window, preparaAudio, { timeout: ESPERA_DO_SOM_MS });
    else preparaAudio();
  }, ESPERA_DO_SOM_MS);
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

// ---------- o toque se vê no iPhone ----------
// O Safari do iOS só aplica `:active` a um toque se houver algum ouvinte de
// `touchstart` no elemento ou num ancestral — e o app não tinha nenhum, então
// no iPhone o estado de toque desenhado em `base.css` nunca acendia
// (docs/motion/03 §1.4). Um ouvinte VAZIO no documento basta, e roda uma vez,
// aqui no topo do módulo. Passivo: não segura a rolagem nem espera nada, e não
// muda o que o toque faz — o `click` continua sendo quem age.
document.addEventListener('touchstart', function () {}, { passive: true });

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
  clearTimeout(syncT);
  stopTimer();
  if (somAgendado) { clearTimeout(somAgendado); somAgendado = null; }
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
    progSeries, progSetTroca, programaDia, pularEx, reconciliaCorpo, reconciliaFotos, purgaLixeira,
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
    get ALVO() { return alvo(); },
    get ALVO_TOTAL() { return alvoTotal(); },
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
    // as animações do programa ativo, guardadas para a academia sem sinal
    navigator.serviceWorker.ready.then(function () { setTimeout(guardaMidiaDoPrograma, 4000); }).catch(function () {});
  });
}


// ---------- as folhas ----------
// Só HOJE tem folha convertida por enquanto. As telas cheias do sistema antigo
// (programa, histórico, retrospectiva) continuam tomando a tela inteira até
// serem convertidas — é o que `emTelaCheia()` sinaliza para a shell.
function folhaAberta() {
  return (view.pilha || []).map(function (f, i) {
    // a posição na pilha dá a ordem de empilhamento da folha
    return <LugarNaPilha.Provider key={i} value={i}><FolhaDaPilha.Provider value={f}>{folhaDe(f, i)}</FolhaDaPilha.Provider></LugarNaPilha.Provider>;
  });
}
function folhaDe(f, i) {
  const F = FOLHAS_V3[f.k];
  return F ? <F key={i} ctx={CTX} f={f} /> : null;
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
//
// A TROCA DE CAMADA MORA AQUI, num ponto só (peça 5 do motion; docs/motion/02
// §3.3). Quando o que se desenha muda de CAMADA — uma tela cheia ou o modo
// chegam ou saem, uma folha ou o painel de apagar fecham — ou de ABA (peça 6: o
// carrossel, no sentido do índice na barra), o desenho é pedido
// à porta do movimento (`trocaDeCamada`), que o faz dentro de uma transição de
// vista: o navegador fotografa a tela de agora e chama `desenhaAgora` cerca de
// um quadro depois (o quadro a mais que o dono aceitou, pergunta 6). Sem
// movimento pedido, sem a API (o jsdom dos testes, iOS antes do 18) ou na
// primeira tela (T9), desenha agora, como sempre.
//
// Enquanto o desenho novo está PENDENTE, `render()` não faz nada: o desenho que
// vem lê o `view` mais recente, e dois `render()` seguidos viram uma transição
// só (a navegação composta, 02 T2), no sentido da primeira mudança. E a rolagem
// pedida nesse meio não rola a foto da tela velha: entra DENTRO do desenho novo
// (`rola`, `noDesenho`), que já nasce na posição — é o que faz a rolagem voltar
// exata (02 T6).
let desenhoPendente = false;
/** A rolagem que entra dentro do próximo desenho (`entraNoDestino`, ou `rola` com o desenho pendente). */
let rolagemPendente = null;
/** O que roda logo depois do próximo desenho, quando ele está pendente (`mostraExercicio`). */
let paraODesenho = [];
/** As camadas da tela que está desenhada: é contra elas que a próxima troca se mede. */
let camadasDesenhadas = [];
/** A aba da tela que está desenhada: é contra ela que a próxima troca de aba se mede (peça 6). */
let abaDesenhada = null;
/** O Voltar que o navegador já animou (gesto de borda, `hasUAVisualTransition`): não anima de novo. */
let jaAnimado = false;
/** O passo da tela de ação que está desenhada (`passoDaAcao`): contra ele se mede o próximo. */
let passoDesenhado = null;

/**
 * Qual troca é esta, do que está desenhado para o que `view` pede. É a tabela
 * do docs/design-system/07-fluidez-e-estabilidade.md:
 *
 *  - `entra` / `sai`: um destino chega por cima, ou o de cima sai e o de baixo
 *    (ou o lugar) reaparece;
 *  - `sobe` / `desce`: o mesmo, quando quem chega ou sai é uma TELA DE AÇÃO
 *    (treino, responder os dias, medir, câmera);
 *  - `passo`: uma tela de ação dá lugar a outra (a câmera sobre a sessão), ou a
 *    mesma tela de ação muda de passo (a série vira descanso, a leitura vira a
 *    próxima, o dia vira o seguinte): as âncoras ficam, o miolo troca;
 *  - `lugar`: o lugar à vista dos dois lados, e ele mudou (fade through);
 *  - `seca`: o lugar mudou, mas um dos dois não está na doca;
 *  - `fica`: nenhum destino muda, e uma folha ou o painel de apagar fecham;
 *  - `null`: nada a mover (a folha que abre sobe por CSS, um redesenho do
 *    mesmo passo, a régua que anda).
 *
 * A camada vem antes do lugar: fechar um destino e trocar de lugar no mesmo
 * toque é a tela de cima saindo, e o lugar que reaparece já é o novo. O lugar
 * vem antes da folha que fecha, e a folha antes do passo: a foto da folha desce
 * sozinha em qualquer transição.
 */
const ORDEM_DAS_ABAS = ['agora', 'dias', 'corpo', 'semana', 'prescricao'];
const TELAS_DE_ACAO = ['modoSessao', 'responderDias', 'medidas', 'camera'];
function eAcao(c) { return TELAS_DE_ACAO.indexOf(c) >= 0; }
function sentidoDaTroca(antes, agora, abaAntes, abaAgora, passoAntes, passoAgora) {
  const destinos = function (l) {
    return l.filter(function (c) { return c !== 'pare' && c !== 'falhou' && c.indexOf('folha:') !== 0; });
  };
  const da = destinos(antes), dn = destinos(agora);
  const topoAntes = da.length ? da[da.length - 1] : null;
  const topoAgora = dn.length ? dn[dn.length - 1] : null;
  if (topoAntes !== topoAgora) {
    if ((!topoAntes || topoAntes === 'pvComida' || topoAntes === 'pvAcompanhar') &&
        (!topoAgora || topoAgora === 'pvComida' || topoAgora === 'pvAcompanhar') && passoInicial()) return 'passo';
    const chega = topoAgora != null && da.indexOf(topoAgora) < 0;
    if (chega) return eAcao(topoAgora) ? (eAcao(topoAntes) ? 'passo' : 'sobe') : 'entra';
    return eAcao(topoAntes) ? (eAcao(topoAgora) ? 'passo' : 'desce') : 'sai';
  }
  // Trocar de lugar: só com o lugar à vista — com um destino aberto, o lugar
  // de baixo nem está desenhado.
  if (topoAgora == null && abaAntes !== abaAgora) {
    if (ORDEM_DAS_ABAS.indexOf(abaAntes) < 0 || ORDEM_DAS_ABAS.indexOf(abaAgora) < 0) return 'seca';
    return 'lugar';
  }
  const folhas = function (l) { return l.filter(function (c) { return c.indexOf('folha:') === 0; }).length; };
  if (folhas(agora) < folhas(antes)) return 'fica';
  if (antes.indexOf('pare') >= 0 && agora.indexOf('pare') < 0) return 'fica';
  if (topoAgora === 'revisao' && passoAntes !== passoAgora) return 'estado';
  if (eAcao(topoAgora) && passoAntes != null && passoAgora != null && passoAntes !== passoAgora) return 'passo';
  return null;
}

/**
 * O PASSO da tela de ação de cima: muda quando a tarefa avança (a série
 * guardada vira descanso, o descanso vira a próxima série, a leitura vira a
 * próxima, o dia vira o seguinte), e não muda num redesenho do mesmo passo
 * (+15 s, a régua, o relógio). `null` fora de tela de ação.
 */
function passoDaAcao(topo) {
  if (topo === 'revisao') {
    const r = view.revisao;
    if (!r || !r.lida) return 'colar';
    return JSON.stringify(r.respostas);
  }
  if (topo === 'modoSessao') {
    if (view.fimV3) return 'encerrado';
    if (timerFim) return 'descanso';
    const d = view.day;
    if (!d || !treino(d)) return 'vazio';
    if (diaAberto(d) && !view.aulaPorSerie) return 'aula';
    const f = serieEmFoco(d);
    return f ? 'serie:' + d + ':' + f.i + ':' + f.k : 'fim:' + d;
  }
  if (topo === 'responderDias') {
    const r = view.responderDias;
    return r ? 'dia:' + r.i : null;
  }
  if (topo === 'medidas') {
    const x = view.medidas && view.medidas.v3;
    if (!x) return null;
    if (x.feitas) return 'fim';
    const k = x.fila[x.i];
    return 'medida:' + x.i + ':' + ((view.medidas.leituras[k] || []).length);
  }
  return null;
}
function topoDe(l) {
  const d = l.filter(function (c) { return c !== 'pare' && c !== 'falhou' && c.indexOf('folha:') !== 0; });
  return d.length ? d[d.length - 1] : null;
}

function render() {
  if (desligado || desenhoPendente) return;
  const pedidas = camadasAbertas(view, passoInicial());
  const sentido = abriu ? sentidoDaTroca(camadasDesenhadas, pedidas, abaDesenhada, CTX.abaAtual(),
                                         passoDesenhado, passoDaAcao(topoDe(pedidas))) : null;
  if (!sentido) { desenhaAgora(); return; }
  desenhoPendente = true;
  marcaAsFolhasQueSaem(pedidas);
  trocaDeCamada(sentido, desenhaPendente, !jaAnimado);
}

/**
 * A FOLHA QUE SAI, marcada antes da foto. Na descida (`fica`) só ela e o véu
 * dela têm nome na transição (`src/v3/movimento.css`, "a folha desce"): a que
 * fica e o resto ficam na foto da página, que não anda. Sai toda folha cuja
 * posição passa do que `view` pede (a pilha só fecha por cima); a marca de uma
 * que fica é tirada. O nó que sai deixa o DOM no desenho, e a marca vai com
 * ele. Não muda o que se desenha: só quem tem foto.
 */
function marcaAsFolhasQueSaem(pedidas) {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  const ficam = pedidas.filter(function (c) { return c.indexOf('folha:') === 0; }).length;
  [].slice.call(document.querySelectorAll('.v3-folha-w[data-lugar]')).forEach(function (el) {
    if (Number(el.getAttribute('data-lugar')) >= ficam) el.setAttribute('data-sai', '');
    else el.removeAttribute('data-sai');
  });
}

/** O desenho que a transição pede — e que o toque no meio dela antecipa. Desenha uma vez só. */
function desenhaPendente() { if (desenhoPendente) desenhaAgora(); }

function desenhaAgora() {
  desenhoPendente = false;
  if (desligado) return;
  const antes = camadasDesenhadas;
  const focado = typeof document !== 'undefined' ? document.activeElement : null;
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
  // A rolagem, DENTRO deste desenho: a tela que reaparece já nasce na posição.
  const y = rolagemPendente;
  rolagemPendente = null;
  if (y != null) window.scrollTo({ top: y, behavior: 'instant' });
  const depois = paraODesenho;
  paraODesenho = [];
  depois.forEach(function (f) { f(); });
  camadasDesenhadas = camadasAbertas(view, passoInicial());
  abaDesenhada = CTX.abaAtual();
  passoDesenhado = passoDaAcao(topoDe(camadasDesenhadas));
  devolveOFoco(antes, camadasDesenhadas);
  naoPerdeOFoco(focado);
  ajustaRelogio();
  // Depois de montar, e não antes: aqui `view` já é o que está na tela, e a
  // profundidade do histórico passa a ser a mesma da pilha de camadas.
  sincronizaHistorico(camadasDesenhadas.length);
}

/**
 * Rola a janela até `y` — DENTRO do desenho novo, se há um pendente; senão,
 * agora. Toda rolagem do casco passa por aqui: com a transição de vista, a
 * rolagem feita antes do desenho novo rolaria a foto da tela velha, que se
 * moveria sozinha antes de sair (02 T1, "posição de leitura").
 */
function rola(y) {
  if (desenhoPendente) { rolagemPendente = y; return; }
  window.scrollTo({ top: y, behavior: 'instant' });
}
/** Roda `f` logo depois do desenho novo, se há um pendente; senão, agora. */
function noDesenho(f) {
  if (desenhoPendente) { paraODesenho.push(f); return; }
  f();
}

// ---------- o Voltar do sistema ----------
// Fecha UMA camada — a do topo — pelo mesmo caminho que o botão do app usaria.
// Nenhum fechamento novo foi inventado aqui: cada entrada aponta para a função
// que já existia, e é isso que garante que voltar pelo gesto e voltar pelo
// botão deixem o app no mesmo estado.
const FECHA_CAMADA = {
  pvComida: () => CTX.voltaInicio(),
  pvAcompanhar: () => CTX.voltaInicio(),
  // Voltar com o aviso de falha aberto é "Fechar este aviso": dispensar não
  // escolhe por ele, e a marca de não guardado continua.
  falhou:    function () { dispensaFalha(); },
  // Voltar com o painel de pare aberto é "Deixar como está": a resposta que não
  // apaga nada, pelo mesmo caminho que fecha qualquer camada.
  pare:      function () { respondePare(false); },
  camera:    function () { CTX.fechaCamera(); },
  ajustes:   function () { CTX.fechaAjustes(); },
  agentes:   function () { CTX.fechaAgentes(); },
  ajuste:    function () { CTX.fechaAjuste(); },
  protocolo: function () { CTX.fechaProtocolo(); },
  passos:    function () { CTX.fechaPassosDasFotos(); },
  fotos:     function () { CTX.fechaCentroDasFotos(); },
  noTempo:   function () { CTX.fechaNoTempo(); },
  naMesmaData: function () { CTX.fechaNaMesmaData(); },
  progressao: function () { CTX.fechaProgressao(); },
  responderDias: function () { CTX.fechaResponderDias(); },
  porEmDia:  function () { CTX.fechaPorEmDia(); },
  comparar:  function () { CTX.fechaComparar(); },
  revisao:   function () { CTX.fechaRevisao(); },
  evolucao:  function () { CTX.fechaEvolucao(); },
  medida:    function () { CTX.fechaMedida(); },
  medidas:   function () { CTX.fechaMedidas(); },
  galeria:   function () { CTX.fechaGaleria(); },
  galeriaFoto: function () { CTX.fechaFotoDaGaleria(); },
  lixeira:   function () { CTX.fechaLixeira(); },
  dia:       function () { CTX.fechaDia(); },
  prog:      function () { fecharPrograma(); },
  programas: function () { CTX.fechaProgramas(); },
  programa:  function () { CTX.fechaProgramaAberto(); },
  retro:     function () { fecharRetro(); },
  add:       function () { fecharAdicionar(); },
  sessao:    function () { fecharSessao(); },
  hist:      function () { closeHist(); },
  // O modo de sessão fecha pela MESMA porta da seta do cabeçalho, e isso é
  // deliberado: as duas saídas têm de deixar a sessão aberta. Se o Voltar
  // encerrasse, o gesto de borda do Safari passaria a matar o treino.
  modoSessao: function () { CTX.fechaModoDeSessao(); }
};

function voltarUmaCamada(como) {
  const camadas = camadasAbertas(view, passoInicial());
  if (!camadas.length) return;
  const topo = camadas[camadas.length - 1];
  // Quando o navegador já animou a volta (o gesto de borda do iPhone), o fecho
  // desenha sem a transição do app: a mesma volta não aparece duas vezes.
  jaAnimado = !!(como && como.jaAnimado);
  try {
    // A folha é a única camada cuja chave carrega índice: são várias do mesmo
    // tipo, e o que fecha é sempre a de cima.
    if (topo.indexOf('folha:') === 0) { CTX.fechaFolha(); return; }
    const fecha = FECHA_CAMADA[topo];
    if (fecha) fecha();
  } finally {
    jaAnimado = false;
  }
}

ligaNavegacao({
  // Com um desenho PENDENTE (a troca de camada da peça 5), o histórico ainda
  // tem a profundidade da tela desenhada: a entrada da camada nova só é
  // empurrada no desenho. O `popstate` que chega nesse meio — o do
  // `history.go(-1)` com que o desenho anterior consumiu a entrada de uma camada
  // fechada pelo botão — compara com ELA. Comparado com o `view` pendente, ele
  // via uma camada a mais e a fechava: abrir a Evolução logo depois de sair do
  // modo a fechava sozinha (medido no WebKit, onde a foto da tela velha demora).
  camadas: function () { return desenhoPendente ? camadasDesenhadas.length : camadasAbertas(view, passoInicial()).length; },
  aoVoltar: voltarUmaCamada
});

// ---------- COMIDA ----------
// A biblioteca e o plano. Compras é derivada: some do estado, aparece na tela.
CTX.planoCompleto = function () {
  const cat = catalogoAlimentos();
  const doNutri = {};
  if (!S.primeiraVez) PLANO_BASE.forEach(function (r) { doNutri[r.id] = true; });
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

// A primeira tela é a raiz do aparelho novo. Só os passos seguintes entram no histórico.
function passoInicial() { return S.primeiraVez < 4 ? S.primeiraVez : null; }
CTX.passoInicial = passoInicial;
CTX.escolhasIniciais = function () {
  if (!view.escolhasIniciais) view.escolhasIniciais = {
    treinador: true, comida: S.primeiraVez > 2 ? ligado(S.modulos, 'comida') : true,
    peso: true, agua: false, cardio: false, fotos: false
  };
  return view.escolhasIniciais;
};
CTX.escolheInicio = function (k, v) { CTX.escolhasIniciais()[k] = v; render(); };
async function guardaPasso(passo, modulos) {
  if (view.guardandoInicio) return;
  const origem = S;
  view.guardandoInicio = true;
  declaraGravacao('as escolhas da primeira vez');
  const ok = await grava({ ...S, primeiraVez: passo, modulos });
  view.guardandoInicio = false;
  if (S !== origem) { await grava(); return; } // a conta ou a cópia chegou enquanto o disco gravava
  if (!ok && DB.mode !== 'mem') {
    view.repeteInicio = () => guardaPasso(passo, modulos);
    return;
  }
  view.repeteInicio = null;
  S.primeiraVez = passo;
  S.modulos = modulos;
  // Escolhas da abertura cedem às preferências de uma conta já usada.
  impressoes.modulos = impressaoDe('modulos');
  sujou();
  if (passo === 4) delete view.escolhasIniciais;
  render(); rola(0);
}
CTX.voltaInicio = function () {
  if (passoInicial() > 1) return guardaPasso(S.primeiraVez - 1, S.modulos);
};
CTX.avancaInicio = function (pular, passoNaTela = passoInicial()) {
  const passo = passoInicial();
  if (!passo || passo !== passoNaTela || view.guardandoInicio) return;
  const e = CTX.escolhasIniciais();
  if (passo === 1 && !pular && e.treinador) { CTX.abreRevisao(); return; }
  let modulos = S.modulos;
  if (passo === 2) {
    e.comida = !pular && e.comida;
    modulos = comModulo(modulos, 'comida', e.comida);
  }
  if (passo === 3 && !pular) {
    for (const k of ['peso', 'agua', 'cardio', 'fotos']) modulos = comModulo(modulos, k, e[k]);
  }
  return guardaPasso(passo + 1, modulos);
};

/**
 * O PLANO no visual novo (Fase 4): os treinos, a semana de treino, a comida
 * do nutricionista e o que espera decisão ("vira regra?"). Lê o que o Plano
 * antigo lê.
 */
// ---------- os PROGRAMAS (etapa 1 de docs/catalogo; protótipo em ~/lastro-rascunho/programas) ----------
const MES_CURTO = function (t) { return MESES[new Date(t).getMonth()].slice(0, 3) + '.'; };
/** "57,5", "60": a carga sem o ",0" que não diz nada. */
const kg = function (v) { return String(Math.round(v * 100) / 100).replace('.', ','); };
const ddmmDe = function (t) { const d = new Date(t); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); };
/** Quantos treinos a semana prevê: os dias de treino da cadência, sem os abertos (o HYROX conta como feito, não como previsto). */
function previstosPorSemana() {
  const cad = cadenciaDaSemana();
  const n = cad.filter(function (c) { return c === 'treino'; }).length;
  return Math.max(1, Math.min(n, treinosDe(S.prog, rot()).length || n));
}
/** A carga da última vez, para "com histórico": "57,5 kg/lado". */
function ultimaCargaDe(id) {
  const h = _historicoDeReferencia(S.logs[id] || [], temCargaDeReferencia(id)).filter(function (l) { return (l.sets || []).some(Boolean); });
  const l = h[h.length - 1];
  if (!l) return null;
  const c = Math.max.apply(null, l.sets.filter(Boolean).map(function (p) { return +p[0] || 0; }));
  const tipo = cargaTipo(id, exDe(id));
  if (!c) return (l.u && l.q ? l.q + ' ' + l.u : 'feito em ' + fmtDate(l.t));
  return kg(c) + ' ' + CARGAS[tipo].rot;
}
CTX.abreProgramas = function () {
  if (!programasDe(S)) { abrirPrograma(null); return; }
  view.programas = { aberto: null };
  entraNoDestino('programas'); render(); rola(0);
};
CTX.fechaProgramas = function () { view.programas = null; render(); saiDoDestino('programas'); };
CTX.abreProgramaAberto = function (id) {
  if (!view.programas) view.programas = { aberto: null };
  if (!programasDe(S) || !S.programas.lista[id]) return;
  entraNoDestino('programa');
  view.programas.aberto = id; view.programas.treino = null; render(); rola(0);
};
CTX.fechaProgramaAberto = function () { if (view.programas) { view.programas.aberto = null; render(); saiDoDestino('programa'); } };
CTX.abreTreinoDoPrograma = function (k) { if (view.programas) { view.programas.treino = view.programas.treino === k ? null : k; render(); } };

/** A linha do tempo: o próximo, o de agora e os de antes, com a aderência de cada um. */
CTX.programasV3 = function () {
  const P = programasDe(S);
  if (!P) return null;
  const agora = Date.now();
  const x = P.lista[P.ativo];
  const sem = semanaDoAtivo(S, agora);
  const letras = treinosDe(S.prog, rot());
  const prox = nextDay();
  const feitos = sem ? sem.feitos : [];
  const ini = inicioDoAtivo(S);
  const quem = function (p) { return p.origem === 'treinador' ? 'do treinador' : 'seu'; };
  const prev = previstosPorSemana();
  const antes = Object.values(P.lista).filter(function (p) { return p.estado === 'guardado'; })
    .sort(function (a, b) { return fimDe(b) - fimDe(a); }).map(function (p) {
      const b = balancoDoPrograma(S, p.id, agora, prev);
      const per = periodoDoPrograma(S, p.id, agora);
      const max = b ? Math.max(1, Math.max.apply(null, b.porSemana)) : 1;
      return { id: p.id, nome: p.nome,
        per: (per && per.de ? MES_CURTO(per.de) + ' a ' : 'até ') + (per ? ddmmDe(per.ate) : '') + (b ? ' · ' + b.semanas + (b.semanas === 1 ? ' semana · ' : ' semanas · ') + b.feitos + (b.feitos === 1 ? ' treino' : ' treinos') : ''),
        ader: b ? b.porSemana.map(function (v) { return { v: v, h: Math.round(v / max * 100), baixa: v < Math.min(prev, max) * 0.8 }; }) : [],
        pct: b ? b.pct : null };
    });
  const proximos = Object.values(P.lista).filter(function (p) { return p.estado === 'proximo' || p.estado === 'rascunho'; })
    .sort(function (a, b) { return (b.m || 0) - (a.m || 0); }).map(function (p) {
      return { id: p.id, nome: p.nome, sub: p.estado === 'proximo' ? quem(p) + ' · começa em ' + p.comeca : 'rascunho · ainda não começou' };
    });
  return {
    agora: { id: x.id, nome: x.nome,
      per: quem(x) + ' · desde ' + (ini > 0 ? DIAS_CURTOS[new Date(ini).getDay()] + '., ' + ddmmDe(ini) : MESES[new Date(x.criado || agora).getMonth()]),
      letras: letras.map(function (k) { return { k: k, sigla: siglaDoTreino(k), feito: feitos.indexOf(k) >= 0, prox: k === prox }; }),
      semana: sem ? sem.semana : null, feitos: letras.filter(function (k) { return feitos.indexOf(k) >= 0; }).length, total: letras.length,
      proximo: prox && !diaAberto(prox) ? siglaDoTreino(prox) : null },
    proximos: proximos, antes: antes,
    fora: diasAbertos(S.prog).map(function (d) { return { k: d, sigla: siglaDoTreino(d), nome: S.prog[d].name }; })
  };
};
function fimDe(p) { const per = p.periodos || []; return per.length ? (per[per.length - 1][1] || Infinity) : (p.m || 0); }

/** Um programa aberto: o ativo (com a continuidade de cada exercício e as revisões) ou um guardado (com o balanço). */
CTX.programaAbertoV3 = function () {
  const P = programasDe(S);
  const id = view.programas && view.programas.aberto;
  if (!P || !id || !P.lista[id]) return null;
  const agora = Date.now();
  const x = P.lista[id], c = conteudoDe(S, id);
  const ativo = id === P.ativo;
  const letras = treinosDe(c.prog, c.rot);
  const revisoes = revisoesDoPrograma(S, id);
  const suas = revisoes.filter(function (r) { return r.quem === 'voce'; }).length;
  const prev = previstosPorSemana();
  const b = balancoDoPrograma(S, id, agora, prev);
  const per = periodoDoPrograma(S, id, agora);
  const sem = ativo ? semanaDoAtivo(S, agora) : null;
  const prox = ativo ? nextDay() : null;
  const feitos = sem ? sem.feitos : [];
  const ini = ativo ? inicioDoAtivo(S) : null;
  const tem = function (exId) { return (S.logs[exId] || []).some(function (l) { return (l.sets || []).some(Boolean); }); };
  let com = 0, todos = 0;
  const treinos = letras.map(function (k) {
    const t = c.prog[k];
    const pares = paresDoTreino(t.ex || []).de;
    const ex = (t.ex || []).map(function (sl, j) {
      const h = tem(sl.id);
      todos++; if (h) com++;
      const pr = pares[j];
      return { id: sl.id, n: nomeEx(sl.id), hist: h, apoio: h ? (ultimaCargaDe(sl.id) || 'com histórico') : 'começa do zero',
               par: pr ? { n: pr.n, lado: j === pr.a ? 'a' : 'b', descanso: fmtDesc(descOf(t.ex[pr.b])) } : null,
               prescricao: sl.s + ' × ' + (sl.u && sl.q ? sl.q + ' ' + sl.u : sl.r || '') + (sl.rir ? ' · RIR ' + sl.rir : '') };
    });
    const vezes = (S.done || []).filter(function (s) { return s && s.day === k && !s.livre && programaDaSessao(S, s) === id; }).length;
    return { k: k, sigla: siglaDoTreino(k), nome: t.name, n: ex.length, novos: ex.filter(function (e) { return !e.hist; }).length,
             feito: feitos.indexOf(k) >= 0, prox: k === prox, vezes: vezes, ex: ex, aberto: view.programas.treino === k };
  });
  const rotulo = (ativo ? 'Agora' : x.estado === 'guardado' ? 'Antes' : 'Próximo') + ' · ' + (x.origem === 'treinador' ? 'do treinador' : 'seu') +
    (x.estado === 'guardado' ? ' · guardado' : x.estado === 'rascunho' ? ' · rascunho' : '');
  const nRev = revisoes.length;
  const sub = ativo
    ? 'Desde ' + (ini > 0 ? DIAS_CURTOS[new Date(ini).getDay()] + '., ' + ddmmDe(ini) : MESES[new Date(x.criado || agora).getMonth()]) + (suas ? ' · ' + suas + (suas === 1 ? ' revisão sua' : ' revisões suas') : '')
    : x.estado === 'guardado'
      ? (per && per.de ? MES_CURTO(per.de) + ' a ' : 'até ') + (per ? ddmmDe(per.ate) : '') + (b ? ' · ' + b.semanas + (b.semanas === 1 ? ' semana' : ' semanas') : '') + (nRev ? ' · ' + nRev + (nRev === 1 ? ' revisão' : ' revisões') : '')
      : (x.estado === 'proximo' ? 'Começa em ' + x.comeca : 'Ainda não começou') + (x.resumo ? ' · ' + x.resumo : '');
  const top = b && b.progressoes[0];
  const kgTxt = function (v) { return (v > 0 ? '+' : '') + kg(v); };
  return {
    id: id, ativo: ativo, estado: x.estado, nome: x.nome, rotulo: rotulo, sub: sub, objetivo: x.objetivo || null,
    origem: x.origem,
    nums: ativo
      ? [{ v: sem ? String(sem.semana) : '1', u: '', t: 'semana' }, { v: String(letras.filter(function (k) { return feitos.indexOf(k) >= 0; }).length), u: ' de ' + letras.length, t: 'treinos nesta semana' },
         { v: prox && !diaAberto(prox) ? siglaDoTreino(prox) : '—', u: '', t: 'o próximo' }]
      : x.estado === 'guardado' && b
        ? [{ v: String(b.feitos), u: '', t: 'treinos feitos' }, { v: b.pct == null ? '—' : b.pct + '%', u: '', t: 'dos previstos' }].concat(top ? [{ v: kgTxt(top.delta), u: ' kg', t: 'no ' + nomeEx(top.id).toLowerCase().split(' ').slice(0, 2).join(' ') }] : [])
        : null,
    treinos: treinos, comHistorico: com, todos: todos,
    revisoes: revisoes.map(function (r, i) { return { i: i, t: r.t, dia: ddmmDe(r.t), semana: DIAS_CURTOS[new Date(r.t).getDay()] + '.', quem: r.quem, titulo: r.titulo, detalhe: r.detalhe, texto: !!r.textoRevisao }; }),
    balanco: x.estado === 'guardado' && b ? {
      ader: b.porSemana.map(function (v) { const mx = Math.max(1, Math.max.apply(null, b.porSemana)); return { v: v, h: Math.round(v / mx * 100), baixa: v < Math.min(prev, mx) * 0.8 }; }),
      meses: (function () { const out = []; const base = per ? per.de : agora; for (let i = 0; i < b.porSemana.length; i++) { const m = MES_CURTO(base + i * 7 * 86400000); if (!out.length || out[out.length - 1] !== m) out.push(m); } return out; })(),
      progressoes: b.progressoes.slice(0, 3).map(function (p) { const u = CARGAS[cargaTipo(p.id, exDe(p.id))].rot; return { id: p.id, n: nomeEx(p.id), de: kg(p.de) + ' → ' + kg(p.para) + ' ' + u, d: kgTxt(p.delta) + ' kg', em: 'em ' + p.semanas + (p.semanas === 1 ? ' semana' : ' semanas') }; }),
      parados: b.parados.slice(0, 1).map(function (p) { return { id: p.id, n: nomeEx(p.id), de: 'parada em ' + kg(p.carga) + ' kg desde ' + ddmmDe(p.desde), em: p.semanas + (p.semanas === 1 ? ' semana' : ' semanas') }; }),
      seguiram: b.seguiram.map(nomeEx), total: b.total, ativo: P.lista[P.ativo].nome,
      notaProgressao: 'primeira → última',
      fraca: (function () {
        if (b.porSemana.length < 3) return null;
        const base = per ? per.de : agora;
        let i = -1;
        b.porSemana.forEach(function (v, k) { if (v < prev && (i < 0 || v < b.porSemana[i])) i = k; });
        if (i < 0) return null;
        const ini = base + i * 7 * 86400000, v = b.porSemana[i];
        return 'A semana mais fraca foi a de ' + ddmmDe(ini) + ' (' + MESES[new Date(ini).getMonth()] + '), com ' + v + (v === 1 ? ' treino' : ' treinos') + ' dos ' + prev + ' previstos.';
      })()
    } : null,
    dif: ativo ? difTotal() : 0,
    bloqueio: S.sessao && !ativo ? (diaAberto(S.sessao.day) ? 'A aula' : 'O treino ' + S.sessao.day) : null,
    reativa: !ativo ? { ativo: P.lista[P.ativo].nome, feitos: sessoesDoAtivo(S).filter(function (s) { return !s.livre && s.day; }).length, primeiro: letras.length ? siglaDoTreino(letras[0]) : null } : null
  };
};
CTX.revisaoDoProgramaV3 = function (i) {
  const id = view.programas && view.programas.aberto;
  if (!id) return null;
  const r = revisoesDoPrograma(S, id)[i];
  if (!r) return null;
  const mudancas = [], fora = [];
  r.itens.forEach(function (e) {
    const dia = e.day && e.day !== '-' ? e.day : null;
    // "revisão do treinador de 23/11: X; Y. Ficou de fora: Z." vira uma linha por mudança
    const corpo = String(e.txt || '').replace(/^revis[aã]o do treinador( de [\d/]+)?:\s*/i, '').replace(/\.$/, '');
    const [feito, deFora] = corpo.split(/\.\s*Ficou de fora:\s*/);
    const parte = function (txt, lista) {
      txt.split(/;\s*/).filter(Boolean).forEach(function (t) {
        const sinal = /\bentra\b|criado|^Programa novo/i.test(t) ? '+' : /\bsai\b|apagado|desfeit/i.test(t) ? '−' : '~';
        lista.push({ txt: t.charAt(0).toUpperCase() + t.slice(1), sinal: sinal, dia: dia, motivo: e.motivo || null });
      });
    };
    parte(feito || '', mudancas);
    if (deFora) parte(deFora, fora);
  });
  return { titulo: r.titulo, quem: r.quem, quando: DIAS_LONGOS[new Date(r.t).getDay()] + ', ' + ddmmDe(r.t) + ', às ' + fmtHoraDita(r.t),
           itens: mudancas, fora: fora, texto: r.textoRevisao || (r.itens[0] && r.itens[0].p && programasDe(S) && S.programas.lista[r.itens[0].p] ? S.programas.lista[r.itens[0].p].texto || null : null) };
};

/** Trocar de programa: reativar um guardado, ou começar o de "Próximo". O aviso desfaz. */
CTX.ativaPrograma = async function (id) {
  const P = programasDe(S);
  if (!P || !P.lista[id] || id === P.ativo || S.sessao) return;
  const antes = JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas });
  const doAntes = P.lista[P.ativo].nome, nome = P.lista[id].nome, eraGuardado = P.lista[id].estado === 'guardado';
  ativaPrograma(S, id, Date.now());
  logProg('-', (eraGuardado ? 'Programa reativado: ' : 'Programa começou: ') + nome + '. O ' + doAntes + ' foi para a linha do tempo.', null, undefined, id);
  view.day = nextDay();
  if (view.programas) view.programas.aberto = null;
  pilha().length = 0;
  const marcas = { mtime: S.mtime, carimbosEm: S.carimbosEm, carimbos: S.carimbos && { ...S.carimbos } };
  const impressoesAntes = { ...impressoes };
  const ok = await save();
  if (ok === false) {
    // a gravação recusou: tudo volta, inclusive os carimbos (senão o de antes sairia com carimbo novo)
    const v = JSON.parse(antes);
    S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador; S.programas = v.programas;
    S.progLog = S.progLog.slice(0, -1);
    Object.assign(S, marcas); impressoes = impressoesAntes;
    view.day = nextDay();
    render();
    return;
  }
  render();
  const gravado = JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas });
  CTX.avisaComDesfazer((eraGuardado ? 'O ' + nome + ' voltou' : 'Começou o ' + nome) + '. O ' + doAntes + ' está na linha do tempo.', async function () {
    if (S.sessao) { toast('Há um treino aberto. Encerre o treino antes de desfazer a troca de programa.'); return; }
    if (JSON.stringify({ prog: S.prog, rot: S.rot, progTreinador: S.progTreinador, programas: S.programas }) !== gravado) {
      toast('O programa mudou depois; troque pela linha do tempo.'); return;
    }
    const v = JSON.parse(antes);
    S.prog = v.prog; S.rot = v.rot; S.progTreinador = v.progTreinador; S.programas = v.programas;
    logProg('-', 'Troca de programa desfeita: voltou o ' + doAntes + '.');
    view.day = nextDay();
    await save(); render();
  });
};
CTX.duplicaPrograma = async function (id) {
  if (!duplicaPrograma(S, id, Date.now())) return;
  if (view.programas) view.programas.aberto = null;
  await save(); render(); rola(0);
  toast('A cópia está em “Próximo”, como rascunho.');
};
CTX.renomeiaPrograma = async function (id, nome) {
  if (!renomeiaPrograma(S, id, nome, Date.now())) { toast('O nome precisa de duas letras ou mais.'); return; }
  await save(); render();
};
/** O aviso único da separação: "Entendi" o tira, nos dois aparelhos. */
CTX.dispensaSeparados = async function () {
  if (!programasDe(S) || !S.programas.separados) return;
  S.programas = Object.assign({}, S.programas, { separados: Object.assign({}, S.programas.separados, { visto: 1 }) });
  await save(); render();
};
/**
 * O dia de "começa dd/mm": no ano de quando o texto foi colado, ou no seguinte,
 * se a data já tinha passado (um "começa 05/01" colado em dezembro é janeiro que vem).
 */
function diaDoComeca(txt, criado) {
  const [d, m, a] = String(txt).split('/').map(Number);
  const c = new Date(criado); c.setHours(0, 0, 0, 0);
  let ano = a ? (a < 100 ? 2000 + a : a) : c.getFullYear();
  let dia = new Date(ano, (m || 1) - 1, d || 1).getTime();
  if (!a && dia < c.getTime() - 31 * 86400000) dia = new Date(ano + 1, (m || 1) - 1, d || 1).getTime();
  return dia;
}
/** O programa de "Próximo" cujo dia chegou: o Hoje pergunta se começa (nunca troca sozinho). */
function proximoQueComecaHoje(agora) {
  const P = programasDe(S);
  if (!P) return null;
  const hoje = new Date(agora); hoje.setHours(0, 0, 0, 0);
  const x = Object.values(P.lista).filter(function (p) {
    if (p.estado !== 'proximo' || !p.comeca) return false;
    const dia = diaDoComeca(p.comeca, p.criado || p.m || Date.now());
    return dia <= hoje.getTime() && !(p.adiado && p.adiado >= hoje.getTime());
  })[0];
  return x ? { id: x.id, nome: x.nome } : null;
}
CTX.adiaProximo = async function (id) {
  const P = programasDe(S);
  if (!P || !P.lista[id]) return;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  S.programas = JSON.parse(JSON.stringify(P));
  S.programas.lista[id].adiado = hoje.getTime();
  S.programas.lista[id].m = Date.now();
  await save(); render();
};

CTX.planoV3 = function () {
  const hoje = diaResolvido().treino;
  const cad = cadenciaDaSemana();
  const Pg = programasDe(S);
  const sem = Pg ? semanaDoAtivo(S, Date.now()) : null;
  const feitos = sem ? sem.feitos : [];
  const prox = nextDay();
  const lista = rot().filter(function (d) { return !!(S.prog && S.prog[d]); }).map(function (d) {
    const P = treino(d);
    return { d: d, sigla: siglaDoTreino(d), nome: P.name, hoje: d === hoje, aberto: diaAberto(d),
             feito: feitos.indexOf(d) >= 0, prox: !!Pg && d === prox,
             series: P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0), n: P.ex.length };
  });
  const letras = treinosDe(S.prog, rot());
  const sep = Pg && Pg.separados && !Pg.separados.visto && Pg.lista[Pg.separados.de] && Pg.lista[Pg.separados.para] ? Pg.separados : null;
  return {
    // com programas, os treinos do programa e, à parte, os que ficam fora de programa (os abertos)
    programa: Pg ? { nome: Pg.lista[Pg.ativo].nome,
      sub: [sem ? 'semana ' + sem.semana : null, sem ? letras.filter(function (k) { return feitos.indexOf(k) >= 0; }).length + ' de ' + letras.length + ' feitos' : null,
            prox && !diaAberto(prox) ? 'o próximo é o ' + siglaDoTreino(prox) : null].filter(Boolean).join(' · ') } : null,
    separados: sep ? { de: Pg.lista[sep.de].nome, letrasDe: treinosDe(Pg.lista[sep.de].prog, Pg.lista[sep.de].rot),
                       para: Pg.lista[sep.para].nome, letrasPara: letras } : null,
    treinos: Pg ? lista.filter(function (t) { return !t.aberto; }) : lista,
    fora: Pg ? lista.filter(function (t) { return t.aberto; }) : [],
    cadencia: DIAS_CURTOS.map(function (rotulo, i) { return { i: i, rotulo: rotulo, nome: DIAS_LONGOS[i], treino: cad[i] === 'treino' }; }),
    refeicoes: CTX.planoCompleto(),
    resumo: CTX.resumoDoPlano(),
    esperam: CTX.mudancasQueEsperam()
  };
};
/** Uma refeição do plano: os itens com a quantidade, para mudar pela régua. */
CTX.refeicaoDoPlanoV3 = function (id) {
  const r = achaRefeicao(id);
  if (!r) return null;
  const cat = catalogoAlimentos();
  return { id: r.id, n: r.n, t: r.t, quando: r.quando, kcal: Math.round(totalDaRefeicao(r, cat, true).kcal),
    itens: (r.itens || []).map(function (it, i) {
      const a = cat[it.f];
      return { i: i, n: a ? a.n : it.f, q: it.q, u: a ? a.u : 'g', alta: !!it.alta,
               kcal: a ? Math.round(a.kcal * it.q / 100) : null };
    }) };
};
/** A lista de compras, já com as quantidades escritas. */
CTX.comprasV3 = function () {
  const c = CTX.compras();
  return Object.assign({}, c, { linhas: c.linhas.map(function (l) { return Object.assign({}, l, { txt: fmtKg(l.comprar, l.u) }); }) });
};

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
    quadro: (quadroDaAula(d, Date.now()) || { texto: null }).texto,
    // a foto da lousa (estado 6): só no dia aberto
    lousa: diaAberto(d) ? (function () {
      const l = lousaDoDia(d);
      if (!l) return { tem: false };
      const url = LOUSA.urlDaLousa(l.d, l.v);
      if (!url) LOUSA.carrega(l.d, l.v, l.ext).then(function (mudou) { if (mudou) render(); });
      return { tem: true, url: url,
               quando: 'foto da lousa · ' + fmtDate(l.v) + ' ' + fmtHoraDita(l.v),
               podeMandar: typeof navigator !== 'undefined' && !!navigator.share };
    })() : null,
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
CTX.modoEdicao = function () { modoEdicao(true); };
CTX.abrePrograma = function () { abrirPrograma(null); };

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
  // Durante a espera do passo, os portões cumpridos sugeriam uma decisão que a
  // regra não vai tomar: não aparecem até ela voltar a decidir.
  const portoes = v.espera ? null
    : portoesDaRegra(S.body, sinaisDaRegra(), { forca: t, forcaManual: S.perfManual, par: parDaAvaliacao() });

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
      t: v.t, p: v.p, k: v.k,
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
      portoes: portoes,
      // A PROMESSA (decisão do dono, 14/10): a cobrança da adesão fica só aqui.
      // A frase só existe porque ela é cumprida — o Agora mostra a conta dos 14
      // dias como número, sem cobrar, e nenhuma outra tela pede os dias.
      promessa: portoes && portoes.some(function (g) { return g.k === 'adesao' && !g.ok; })
        ? 'Enquanto a adesão não chega a ' + MIN_REGISTRADOS + ', o veredito não muda, por mais pesagem que entre. ' +
          'A tela não vai pedir isso de novo em outro lugar.'
        : null,
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

/**
 * A SEMANA no visual novo (Fase 4): o veredito do nutricionista com o que a
 * regra olha, e as séries por região do corpo separando as feitas das que
 * ainda vêm (`treinosQueVem`, em dominio/volume.ts).
 */
CTX.semanaV3 = function () {
  const D = CTX.dados();
  const agora = Date.now();
  const semana = weekStart(agora);
  const feitas = seriesPorMusculo(semana, agora + 1);
  const treinouHoje = (S.done || []).some(function (x) { return x && !x.livre && sameDay(x.t, agora); }) || !!S.sessao;
  const vemDias = treinosQueVem(rot(), proximoTreino(S, ROT_BASE), cadenciaDaSemana(), new Date(agora).getDay(), treinouHoje)
    .filter(function (d) { return treino(d) && !diaAberto(d); });
  const vem = somaPorGrupo(vemDias.map(function (d) {
    const r = {};
    treino(d).ex.forEach(function (ex) { if (ex.g) r[ex.g] = (r[ex.g] || 0) + setsFor(ex); });
    return r;
  }));
  const porRegiao = {};
  Object.keys(Object.assign({}, feitas, vem)).forEach(function (g) {
    const reg = regiaoDe(g);
    const x = porRegiao[reg] || (porRegiao[reg] = { regiao: reg, feitas: 0, vem: 0, musculos: [] });
    x.feitas += feitas[g] || 0; x.vem += vem[g] || 0;
    x.musculos.push({ g: g, feitas: feitas[g] || 0, vem: vem[g] || 0 });
  });
  return {
    veredito: D.veredito,
    dia: Math.min(7, Math.floor((agora - semana) / 86400000) + 1),
    vemDias: vemDias,
    cardio: (function () { const n = (S.cardio || []).filter(function (x) { return x.t >= semana; }).length; return n + ' de ' + CARDIO_ALVO + ' nesta semana'; })(),
    regioes: Object.keys(porRegiao).map(function (k) { return porRegiao[k]; })
      .sort(function (a, b) { return (b.feitas + b.vem) - (a.feitas + a.vem); })
  };
};

CTX.aplicaAjuste = async function (quieto) {
  const v = veredito();
  const passo = ajusteDoVeredito(v);
  if (!passo) return false;             // observar e manter não propõem passo
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
  // quieto: a folha "Aplicar no plano" dá o próprio aviso, com Desfazer
  if (ok && quieto !== true) toast('Apliquei ' + sinalDoPasso(passo) + ' kcal. O arroz do plano foi para ' + arrozAtual() + ' g.');
  return !!ok;
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


CTX.alternaCadencia = function (i) {
  const c = cadenciaDaSemana().slice();
  c[i] = c[i] === 'treino' ? 'descanso' : 'treino';
  S.cadencia = c;
  queueSave(); render();
};

CTX.restauraPrograma = function () { restaurarTudo(); };
CTX.restauraPlano = async function () {
  if (S.primeiraVez) return;
  if (!(await pare({ texto: 'Voltar ao plano do nutricionista? Seus alimentos cadastrados e todo o histórico ficam. Volta só a prescrição.', sim: 'Voltar ao plano dele' }))) return;
  // O carimbo vem DEPOIS da pergunta, e por isso: ele estava antes, então
  // cancelar subia a versão do plano sem o plano mudar, e o app passava a
  // relatar divergência em dias que não divergiram. É o erro espelhado do que
  // `aplicaArroz` fazia — carimbar sem mudar, em vez de mudar sem carimbar.
  planoMudou();
  // O passo em vigor sai junto do plano, e o registro diz isso: antes ele ficava
  // lá parecendo vigente, com o saldo já em zero.
  const u = passoEmVigor();
  if (u) { u.desfeito = Date.now(); u.porRestaurar = 1; }
  S.comida.plano = JSON.parse(JSON.stringify(PLANO_BASE));
  S.ajuste = 0;
  queueSave(); render();
  toast('Plano nutricional restaurado.' + (u ? ' O ajuste de ' + sinalDoPasso(u.para - u.de) + ' kcal em vigor saiu junto.' : ''));
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
 * O que o campo "como eu medi" mostra: o que ele está digitando, ou, quando a
 * medida nunca teve ponto dito, o ponto padrão da tabela — já preenchido.
 */
function rascunhoDoOnde(k) {
  if (view.bodyOnde && typeof view.bodyOnde[k] === 'string') return view.bodyOnde[k];
  const m = medidaDoCorpo(k);
  return ondeMediu(S.body[k]) ? '' : ((m && m.onde) || '');
}

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
      ondeRascunho: rascunhoDoOnde('cintura'),
      como: medidaDoCorpo('cintura').como
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
        ondeRascunho: rascunhoDoOnde(k),
        como: m.como
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
    musculos: CTX.musculos(),
    regraDaFita: REGRA_DA_FITA
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
  view.bodyHora = Object.assign({}, view.bodyHora);
  delete view.bodyHora[k];
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
function ehFita(k) { const m = medidaDoCorpo(k); return !!(m && (m.fita || m.dobra)); }
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

/**
 * @param {string} [dia] 'AAAA-MM-DD' escolhido na tela. Se aquele dia já tem
 *   leitura, os campos trazem a DELE — é corrigir aquele dia (a hora de 15/09,
 *   por exemplo), e partir da última leitura faria gravar os números de outro
 *   dia por cima. Sem leitura no dia, a última, como antes.
 */
CTX.bioimpedancia = function (dia) {
  const doDia = function (serie) {
    if (!dia) return null;
    return serie.filter(function (x) { return hojeISO(x.t) === dia; }).slice(-1)[0] || null;
  };
  const temNoDia = !!dia && MARCAS_DA_BIO.some(function (k) { return !!doDia(S.body[k] || []); });
  const campos = MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).map(function (m) {
    const serie = S.body[m.k] || [];
    const ultima = temNoDia ? doDia(serie) : (serie[serie.length - 1] || null);
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
    noDia: temNoDia ? fmtDate(Date.parse(dia + 'T12:00:00')) : null,
    instrucao: temNoDia
      ? 'Os números da leitura de ' + fmtDate(Date.parse(dia + 'T12:00:00')) + ' estão no lugar. Guardar substitui essa leitura.'
      : noLugar
      ? 'Os ' + POR_EXTENSO[noLugar] + ' números do mês passado estão no lugar. Toque só no que mudou.'
      : 'Os cinco números saem da balança de bioimpedância, não da balança de casa.',
    maxISO: hojeISO()
  };
};

CTX.registraBio = function (leitura, quando, semHora) { return registraBio(leitura, quando, semHora); };


// ---------- a BIOIMPEDÂNCIA, em folha ----------
CTX.abreBio = function () { CTX.abreFolha({ k: 'bio' }); };
CTX.registraBioDaFolha = async function (leitura, quando, semHora) {
  const r = await registraBio(leitura, quando, semHora);
  const p = view.pilha || [];
  if (r && r.ok && p.length && p[p.length - 1].k === 'bio') { pilha().pop(); render(); }
  return r;
};

// ---------- REGISTRAR MEDIDAS: fita e dobras num formulário (docs/corpo/02, §2.4) ----------
// Na ordem do corpo, de cima para baixo, e depois as dobras. Campo vazio não
// grava. A medida anterior NÃO aparece enquanto se digita: ela puxa o número de
// quem mede (dono, 06/11/2026). Depois de salvar, o que mudou demais desde a
// última pede "confira esta medida".
function medidasDeMedir() { return ORDEM_DE_MEDIR.map(medidaDoCorpo).filter(Boolean); }

CTX.abreMedidas = function (foco) {
  const agora = Date.now();
  view.medidas = {
    foco: foco || null, leituras: {}, como: {}, salvo: null,
    dobras: MEDIDAS_DE_DOBRA.some(function (m) { return (S.body[m.k] || []).length; }) ||
      !!(foco && medidaDoCorpo(foco) && medidaDoCorpo(foco).dobra),
    data: hojeISO(agora), hora: horaHHMM(agora)
  };
  view.bodyOnde = {};
  // no visual novo, a mesma porta abre o "medir agora" de uma medida por tela
  iniciaMedirV3(view.medidas, foco);
  entraNoDestino('medidas'); render(); rola(0);
};
/**
 * RECOLHER "MEDIR AGORA": cada medida já foi gravada quando FECHOU pela regra
 * (`gravaMedidaQueFechou`), então recolher não perde o que foi confirmado e não
 * grava nada: a medida em curso, incompleta (uma leitura da dobra, duas fitas
 * que divergem), não vira registro, e não substitui a do mesmo dia.
 */
CTX.fechaMedidas = function () {
  const v = view.medidas;
  // a medida em curso, com leitura lida e ainda não fechada, não vira registro: o aviso diz
  if (v && v.v3 && !v.v3.feitas) {
    const k = v.v3.fila[v.v3.i], m = k && medidaDoCorpo(k);
    const n = ((v.leituras || {})[k] || []).filter(function (t) { return String(t).trim() !== ''; }).length;
    if (m && n && !(v.v3.gravadas && v.v3.gravadas[k])) {
      toast(maiuscula(m.n) + ' ficou com ' + (n === 1 ? 'uma leitura' : n + ' leituras') + ' e não foi guardada.');
    }
  }
  view.medidas = null; view.bodyOnde = {}; render(); saiDoDestino('medidas');
};
CTX.setLeitura = function (k, i, txt) {
  const v = view.medidas; if (!v) return;
  const l = (v.leituras[k] || ['', '', '']).slice(); l[i] = String(txt);
  v.leituras = Object.assign({}, v.leituras, { [k]: l });
  v.salvo = null;
  render();
};
function numeroDaLeitura(t) {
  if (t == null || String(t).trim() === '') return null;
  const n = parseFloat(String(t).replace(',', '.'));
  return isNaN(n) || n <= 0 ? NaN : n;
}
/** O valor que cada medida do formulário vai gravar, ou null (vazia), ou NaN (inválida). */
function valorDoFormulario(m, l) {
  const ns = (l || []).map(numeroDaLeitura);
  if (ns.some(function (n) { return typeof n === 'number' && isNaN(n); })) return NaN;
  const vs = ns.filter(function (n) { return n != null; });
  if (!vs.length) return null;
  return m.dobra ? doMeio(vs) : mediaDaFita(vs);
}
function instanteDasMedidas(v) {
  const p = String(v.data).split('-').map(Number), h = String(v.hora || '').split(':').map(Number);
  if (p.length !== 3 || !p[0]) return NaN;
  return new Date(p[0], p[1] - 1, p[2], h[0] || 0, h[1] || 0, 0, 0).getTime();
}
CTX.salvaMedidas = async function () {
  const v = view.medidas; if (!v) return { ok: false };
  const t = instanteDasMedidas(v);
  if (isNaN(t)) { toast('Confira a data e a hora.'); return { ok: false }; }
  if (t > Date.now() + 60000) { toast('Essa hora ainda não chegou. Confira a data e a hora.'); return { ok: false }; }
  const todas = medidasDeMedir().filter(function (m) { return !m.dobra || v.dobras; });
  const vai = [], ruins = [];
  todas.forEach(function (m) {
    const x = valorDoFormulario(m, v.leituras[m.k]);
    if (x == null) return;
    if (isNaN(x)) { ruins.push(m.n); return; }
    vai.push({ m: m, v: x });
  });
  if (ruins.length) { toast('Número inválido em ' + listaComE(ruins) + '.'); return { ok: false }; }
  if (!vai.length) { toast('Nenhuma medida preenchida.'); return { ok: false }; }
  const conferir = [];
  vai.forEach(function (x) {
    const k = x.m.k;
    const antes = (S.body[k] || []).filter(function (y) { return y.t < t && !sameDay(y.t, t); }).slice(-1)[0];
    const lim = CONFERIR_ACIMA[x.m.u];
    if (antes && lim != null && Math.abs(x.v - antes.v) > lim + 1e-9) {
      const d = x.v - antes.v;
      conferir.push({ k: k, n: x.m.n.charAt(0).toUpperCase() + x.m.n.slice(1),
        txt: fmtDec(antes.v) + ' → ' + fmtDec(x.v) + ' ' + x.m.u + ' (' + (d > 0 ? '+' : '−') + fmtDec(Math.abs(d)) + ' desde ' + fmtDate(antes.t) + ')' });
    }
    const typed = view.bodyOnde && typeof view.bodyOnde[k] === 'string' ? view.bodyOnde[k].trim() : '';
    // quantas leituras da fita deram o valor: o visual novo pede sempre a
    // segunda e marca a medida feita com uma só (`Marca.n`)
    const leituras = x.m.dobra ? null
      : (v.leituras[k] || []).map(numeroDaLeitura).filter(function (n) { return typeof n === 'number' && !isNaN(n); }).length;
    gravaMarca(k, x.v, t, typed || ondeMediu(S.body[k]) || x.m.onde || null, false, leituras);
  });
  declaraGravacao(vai.length === 1 ? 'a medida' : 'as ' + vai.length + ' medidas', fmtDate(t));
  await save();
  v.leituras = {}; v.segunda = {}; view.bodyOnde = {};
  v.salvo = { n: vai.length, conferir: conferir,
    txt: 'Salvei ' + (vai.length === 1 ? '1 medida' : vai.length + ' medidas') + ' de ' + fmtDate(t) + ' às ' + horaHHMM(t) + '.' };
  render(); rola(0);
  return { ok: true, n: vai.length, conferir: conferir.map(function (c) { return c.k; }) };
};

// ---------- O DETALHE de uma medida (fita, dobra) ou da bioimpedância ----------
CTX.abreMedida = function (k) { view.medida = k; entraNoDestino('medida'); render(); rola(0); };
CTX.fechaMedida = function () { view.medida = null; render(); saiDoDestino('medida'); };
function datasDasFotos() { return ((S.protocolo && S.protocolo.sessoes) || []).filter(function (s) { return s && s.fotos && Object.keys(s.fotos).length; }).map(function (s) { return instanteDaData(s.d); }); }
CTX.detalheDaMedida = function () {
  const k = view.medida;
  if (!k) return null;
  const fotos = datasDasFotos();
  if (k === 'bio') {
    const series = MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).map(function (m) {
      const s = (S.body[m.k] || []).slice().sort(function (a, b) { return a.t - b.t; });
      return { k: m.k, n: (CAMPO_DA_BIO[m.k] || { rotulo: m.n }).rotulo, u: m.u,
        pontos: s.map(function (x) { return { t: x.t, v: x.v }; }),
        ultima: s.length ? comUnidade(s[s.length - 1].v, m.u) : '—' };
    });
    const instantes = {};
    MARCAS_DA_BIO.forEach(function (k2) { (S.body[k2] || []).forEach(function (x) { instantes[x.t] = x; }); });
    const hist = Object.keys(instantes).map(Number).sort(function (a, b) { return b - a; }).map(function (t) {
      const x = instantes[t];
      return { t: t, data: fmtDate(t), hora: x.semHora ? 'sem hora' : horaHHMM(t),
        valores: series.map(function (s) { const p = s.pontos.filter(function (y) { return y.t === t; })[0]; return p ? fmtDec(p.v) + (s.u === '%' ? '%' : ' ' + s.u) : '—'; }).join(' · ') };
    });
    return { k: 'bio', n: 'Bioimpedância', olho: 'uma leitura por mês', series: series, historico: hist, fotos: fotos };
  }
  const m = medidaDoCorpo(k);
  if (!m) return null;
  const s = (S.body[k] || []).slice().sort(function (a, b) { return a.t - b.t; });
  let ondeAnt = null;
  const pontos = s.map(function (x, i) {
    const onde = x.onde || null;
    const mudou = i > 0 && !!onde && !!ondeAnt && onde !== ondeAnt;
    if (onde) ondeAnt = onde;
    return { t: x.t, v: x.v, onde: onde, mudou: mudou };
  });
  const u = s[s.length - 1], p = s[0];
  return {
    k: k, n: m.n.charAt(0).toUpperCase() + m.n.slice(1), u: m.u, dobra: !!m.dobra,
    olho: m.dobra ? 'dobra com adipômetro · mm' : 'medida com fita',
    atual: u ? comUnidade(u.v, m.u) : '—',
    variacao: s.length > 1 ? fmtSig(Math.round((u.v - p.v) * 10) / 10) + ' ' + m.u + ' desde ' + fmtDate(p.t) : null,
    como: m.como || '', ponto: ondeMediu(s) || m.onde || '',
    regra: m.dobra ? REGRA_DA_DOBRA : REGRA_DA_FITA,
    pontos: pontos, fotos: fotos,
    historico: pontos.slice().reverse().map(function (x) {
      return { t: x.t, data: fmtDate(x.t), hora: horaHHMM(x.t), valor: comUnidade(x.v, m.u), onde: x.onde || '', mudou: x.mudou };
    })
  };
};
CTX.apagaLeituraBio = async function (t) {
  const sim = await pare({ texto: 'Apagar a leitura de bioimpedância de ' + fmtDate(t) + ' tira os cinco números dela do histórico.',
    sim: 'Apagar a leitura de ' + fmtDate(t) });
  if (!sim) return;
  MARCAS_DA_BIO.forEach(function (k) {
    if ((S.body[k] || []).some(function (x) { return x.t === t; })) {
      lapide(chaveDeMarca(k, { t: t }));
      S.body[k] = S.body[k].filter(function (x) { return x.t !== t; });
    }
  });
  await save(); render();
  toast('Leitura removida.');
};

// ---------- o PAINEL da tela Corpo (docs/corpo/02, §2.2) ----------
CTX.painelDoCorpo = function () {
  const agora = Date.now();
  const pw = pesoDaSemana(S.body.peso, agora);
  const ult = (S.body.peso || [])[(S.body.peso || []).length - 1];
  const medidas = medidasDeMedir().filter(function (m) { return (S.body[m.k] || []).length; }).map(function (m) {
    const s = S.body[m.k];
    const u = s[s.length - 1], a = s[s.length - 2];
    return { k: m.k, n: m.n.charAt(0).toUpperCase() + m.n.slice(1), valor: comUnidade(u.v, m.u),
      variacao: a ? fmtSig(Math.round((u.v - a.v) * 10) / 10) : '', desde: a ? 'desde ' + fmtDate(a.t) : 'primeira medida',
      serie: s.slice(-8).map(function (x) { return x.v; }) };
  });
  const ultMed = medidasDeMedir().map(function (m) { const s = S.body[m.k] || []; return s.length ? s[s.length - 1].t : 0; })
    .reduce(function (a, b) { return Math.max(a, b); }, 0);
  const bioT = MARCAS_DA_BIO.map(function (k) { const s = S.body[k] || []; return s.length ? s[s.length - 1].t : 0; })
    .reduce(function (a, b) { return Math.max(a, b); }, 0);
  const daBio = function (k) { const x = (S.body[k] || []).filter(function (y) { return y.t === bioT; })[0]; return x ? x.v : null; };
  return {
    peso: {
      media: pw.media == null ? '—' : fmtDec(pw.media),
      parcial: pw.n ? 'parcial · ' + pw.n + (pw.n === 1 ? ' pesagem' : ' pesagens') : 'nenhuma pesagem nesta semana',
      diferenca: pw.diferenca == null ? null : fmtSig2(pw.diferenca) + ' kg em relação à semana de ' + fmtDate(pw.anterior.w),
      anterior: pw.media == null && pw.anterior ? 'semana de ' + fmtDate(pw.anterior.w) + ': ' + fmtDec(pw.anterior.media) + ' kg' : null,
      hoje: ult ? (sameDay(ult.t, agora) ? 'hoje: ' : 'última: ') + fmtDec(ult.v) + ' kg' + (sameDay(ult.t, agora) ? '' : ' · ' + rotuloDoDia(ult.t)) : null,
      serie: serieSemanal(S.body.peso, 14)
    },
    medidas: medidas,
    ultimaMedida: ultMed ? 'última: ' + fmtDate(ultMed) : 'nenhuma ainda',
    bio: bioT ? {
      quando: fmtDate(bioT) + ' · uma vez por mês',
      celulas: [
        { k: 'g', rotulo: 'gordura', valor: daBio('bioGorduraPct') == null ? '—' : fmtDec(daBio('bioGorduraPct')) + ' %' },
        { k: 'm', rotulo: 'músculo', valor: daBio('bioMusculo') == null ? '—' : fmtDec(daBio('bioMusculo')) + ' kg' },
        { k: 'mg', rotulo: 'massa de gordura', valor: daBio('bioGordura') == null ? '—' : fmtDec(daBio('bioGordura')) + ' kg' },
        { k: 'a', rotulo: 'água', valor: daBio('bioAgua') == null ? '—' : fmtDec(daBio('bioAgua')) + ' L' }
      ]
    } : null
  };
};
// ---------- o CORPO no visual novo (Fase 2) ----------

/** As medidas de fita ligadas, e as dobras quando o módulo delas está ligado, na ordem de medir. */
function medidasLigadasV3() {
  return medidasDeMedir().filter(function (m) {
    return m.dobra ? ligado(S.modulos, 'dobras') : CTX.fitaLigada(m.k);
  });
}
/** Variação entre o primeiro e o último número de uma série (nulos de fora). */
function variacaoDaSerie(serie) {
  const v = serie.filter(function (x) { return x != null; });
  return v.length >= 2 ? Math.round((v[v.length - 1] - v[0]) * 10) / 10 : null;
}

CTX.corpoV3 = function () {
  const agora = Date.now();
  const pesos = S.body.peso || [];
  const ult = pesos[pesos.length - 1];
  const hoje = !!(ult && sameDay(ult.t, agora));
  const serie = serieSemanal(pesos, 9);
  const dPeso = variacaoDaSerie(serie);
  const cint = S.body.cintura || [];
  const sCint = cint.slice(-8).map(function (x) { return x.v; });
  const painel = CTX.painelDoCorpo();
  const bioSerie = function (k) { return (S.body[k] || []).slice(-6).map(function (x) { return x.v; }); };
  const gord = bioSerie('bioGorduraPct'), musc = bioSerie('bioMusculo');
  const ligadas = medidasLigadasV3();
  const desligadas = medidasDeMedir().filter(function (m) { return ligadas.indexOf(m) < 0; });
  const fotos = (S.protocolo.sessoes || []).filter(function (s) { return Object.keys(s.fotos || {}).length; });
  const uf = ultimaSessaoFoto(fotos);
  const desde = diasDesdeAFoto(fotos, agora);
  return {
    peso: {
      valor: ult ? ult.v : (medidaDoCorpo('peso').partida || 75),
      hoje: hoje,
      ultima: ult ? (hoje ? 'pesado hoje, ' + horaHHMM(ult.t).replace(':', 'h') : 'última: ' + rotuloDoDia(ult.t)) : 'nenhuma pesagem ainda',
      variacao: dPeso == null ? null : fmtSig(dPeso), serie: serie.filter(function (x) { return x != null; })
    },
    quadros: [
      { k: 'peso', valor: dPeso == null ? '—' : fmtSig(dPeso), unidade: 'kg', rotulo: 'peso em 8 semanas', serie: serie.filter(function (x) { return x != null; }) },
      { k: 'cintura', valor: sCint.length >= 2 ? fmtSig(Math.round((sCint[sCint.length - 1] - sCint[0]) * 10) / 10) : (sCint.length ? fmtDec(sCint[0]) : '—'),
        unidade: 'cm', rotulo: sCint.length >= 2 ? 'cintura' : 'cintura, última', serie: sCint },
      gord.length ? { k: 'gordura', valor: fmtDec(gord[gord.length - 1]), unidade: '%', rotulo: 'gordura' + (gord.length > 1 ? ' · ' + fmtSig(Math.round((gord[gord.length - 1] - gord[gord.length - 2]) * 10) / 10) : ''), serie: gord } : null,
      musc.length ? { k: 'musculo', valor: fmtDec(musc[musc.length - 1]), unidade: 'kg', rotulo: 'músculo' + (musc.length > 1 ? ' · ' + fmtSig(Math.round((musc[musc.length - 1] - musc[musc.length - 2]) * 10) / 10) : ''), serie: musc } : null
    ].filter(Boolean),
    medidas: ligadas.map(function (m) {
      const s = S.body[m.k] || [];
      const u = s[s.length - 1], a = s[s.length - 2];
      return { k: m.k, n: m.n.charAt(0).toUpperCase() + m.n.slice(1), u: m.u,
        valor: u ? fmtDec(u.v) : null,
        apoio: !u ? 'ainda sem medida' : a ? fmtSig(Math.round((u.v - a.v) * 10) / 10) + ' ' + m.u + ' desde ' + fmtDate(a.t) : 'primeira medida' };
    }),
    desligadas: desligadas.map(function (m) { return m.n.replace(' direita', '').replace(' direito', ''); }),
    ultimaMedida: painel.ultimaMedida,
    bio: painel.bio,
    fotos: uf ? {
      txt: fmtDate(instanteDaData(uf.d)) + (desde != null ? ' · próxima ' + (CADENCIA_DIAS - desde > 1 ? 'em ' + (CADENCIA_DIAS - desde) + ' dias' : CADENCIA_DIAS - desde === 1 ? 'amanhã' : 'já pode') : ''),
      lista: ordemDePoses().filter(function (id) { return uf.fotos[id]; }).slice(0, 5).map(function (id) {
        const f = uf.fotos[id];
        return { id: id, url: CORPO.urlDaFoto(uf.d, id, f), enq: (f && f.enq) || null };
      })
    } : null
  };
};

/** A pesagem de hoje, pela régua: grava agora; pesar de novo no mesmo dia corrige. */
/** "Guardado hoje", no Corpo: a correção da pesagem de hoje (o número certo, ou apagar). */
CTX.corrigePesoDeHoje = function () {
  const p = (S.body.peso || []).filter(function (x) { return sameDay(x.t, Date.now()); }).slice(-1)[0];
  if (!p) return;
  CTX.abreFolha({ k: 'corrigeMarca', marca: 'peso', t: p.t, data: 'hoje às ' + horaHHMM(p.t).replace(':', 'h'), u: 'kg', valor: p.v });
};
CTX.pesaHoje = async function (v) {
  const n = Math.round(Number(v) * 10) / 10;
  if (!isFinite(n) || n <= 0) return false;
  const agora = Date.now();
  const corrigiu = gravaMarca('peso', n, agora, null, false, null);
  await save(); render();
  toast((corrigiu ? 'Pesagem de hoje corrigida: ' : 'Pesagem guardada: ') + fmtDec(n) + ' kg.');
  return true;
};

/** O que se liga e desliga em "Mais medidas": as fitas, uma a uma, e as dobras juntas. */
CTX.medidasParaLigar = function () {
  return {
    fitas: medidasDeMedir().filter(function (m) { return !m.dobra; }).map(function (m) {
      return { k: m.k, n: m.n.charAt(0).toUpperCase() + m.n.slice(1), onde: m.onde || '', ligada: CTX.fitaLigada(m.k) };
    }),
    dobras: ligado(S.modulos, 'dobras')
  };
};

/**
 * MEDIR AGORA, uma medida por tela. Usa o mesmo rascunho do formulário antigo
 * (`view.medidas.leituras`) e grava cada medida quando ela fecha (`gravaMedidaQueFechou`); o `salvaMedidas` é do formulário de antes: muda a forma, não a
 * regra. `foco` mede uma só (a da tela "uma medida").
 */
CTX.abreMedirAgora = function (foco) { CTX.abreMedidas(foco); };
function iniciaMedirV3(v, foco) {
  const fila = foco && medidaDoCorpo(foco) ? [foco] : medidasLigadasV3().map(function (m) { return m.k; });
  v.dobras = fila.some(function (k) { const m = medidaDoCorpo(k); return m && m.dobra; });
  // reabrir para continuar começa pela primeira que ainda não foi medida hoje
  // (medir de novo a de hoje substitui: só se a pessoa for até ela)
  const hoje = Date.now();
  let i = fila.findIndex(function (k) { return !(S.body[k] || []).some(function (y) { return sameDay(y.t, hoje); }); });
  if (i < 0) i = 0;
  v.v3 = { fila: fila, i: i, valor: valorInicialDaMedida(fila[i]), feitas: null };
}
function valorInicialDaMedida(k) {
  const m = k && medidaDoCorpo(k);
  if (!m) return 0;
  const s = S.body[k] || [];
  return s.length ? s[s.length - 1].v : (m.partida || (m.dobra ? 12 : 50));
}
CTX.medirV3 = function () {
  const v = view.medidas;
  if (!v || !v.v3) return null;
  const x = v.v3;
  if (x.feitas) return { fim: true, feitas: x.feitas, conferir: (v.salvo && v.salvo.conferir) || [] };
  if (!x.fila.length) return { vazia: true };
  const k = x.fila[x.i];
  const m = medidaDoCorpo(k);
  if (!m) return null;
  const ls = (v.leituras[k] || []).map(numeroDaLeitura).filter(function (n) { return typeof n === 'number' && !isNaN(n); });
  const s = S.body[k] || [];
  const ult = s[s.length - 1];
  const centro = valorInicialDaMedida(k);
  return {
    fim: false, i: x.i, total: x.fila.length,
    m: { k: k, n: m.n.charAt(0).toUpperCase() + m.n.slice(1), u: m.u, dobra: !!m.dobra, onde: ondeMediu(s) || m.onde || '', como: m.como || '' },
    regua: m.dobra ? { min: 2, max: 60, passo: 0.5, cada: 5 }
      : { min: Math.max(1, Math.floor(centro - 30)), max: Math.ceil(centro + 30), passo: 0.1, cada: 1 },
    valor: x.valor,
    leituras: ls.map(fmtDec),
    passo: passoDaLeitura(!!m.dobra, ls),
    diferenca: ls.length >= 2 ? fmtDec(Math.abs(ls[0] - ls[1])) : null,
    grava: ls.length ? fmtDec(m.dobra ? doMeio(ls) : mediaDaFita(ls)) : null,
    ultima: ult ? fmtDec(ult.v) + ' ' + m.u + ' em ' + fmtDate(ult.t) : null,
    // já medida hoje: guardar de novo substitui a de hoje, e a tela diz
    hoje: ult && sameDay(ult.t, Date.now()) ? 'medida hoje às ' + horaHHMM(ult.t).replace(':', 'h') + ' · medir de novo substitui' : null,
    partida: !ult ? fmtDec(centro) + ' ' + m.u : null,
    regra: m.dobra ? REGRA_DA_DOBRA : REGRA_DA_FITA
  };
};
CTX.setValorDaMedida = function (n) { const v = view.medidas; if (v && v.v3) { v.v3.valor = n; render(); } };
/** Guarda a leitura que está na régua como a próxima da medida em tela. */
CTX.guardaLeitura = function () {
  const v = view.medidas; if (!v || !v.v3) return;
  if (travadoNaMedicao(v.v3)) return;
  const k = v.v3.fila[v.v3.i];
  const l = (v.leituras[k] || []).filter(function (t) { return String(t).trim() !== ''; });
  if (l.length >= 3) return;
  CTX.setLeitura(k, l.length, String(v.v3.valor));
};
/** Pula a medida em tela: o que foi lido dela sai, e ela não é gravada. */
CTX.pulaMedida = function () {
  const v = view.medidas; if (!v || !v.v3) return;
  if (travadoNaMedicao(v.v3)) return;
  const k = v.v3.fila[v.v3.i];
  v.leituras = Object.assign({}, v.leituras, { [k]: [] });
  return CTX.seguirMedida();
};
/**
 * GRAVA A MEDIDA QUE FECHOU, na hora em que fecha (as leituras batem, a
 * terceira decide, ou "Guardar só esta" com uma leitura da fita), pela mesma
 * porta de sempre (`gravaMarca`, no instante da medição, e `save`). Antes,
 * tudo esperava o fim da fila, e sair no meio (ou o iPhone fechar o app em
 * segundo plano) perdia até as medidas já fechadas. Só se chega aqui pela
 * regra: `seguirMedida` é chamado quando a medida fecha, ou depois de "Pular"
 * (que tira as leituras, e aí nada se grava). Devolve a linha do resumo.
 */
async function gravaMedidaQueFechou(v, k) {
  const m = medidaDoCorpo(k);
  if (!m) return null;
  const ls = (v.leituras[k] || []).map(numeroDaLeitura).filter(function (n) { return typeof n === 'number' && !isNaN(n); });
  if (!ls.length) return null;
  const val = m.dobra ? doMeio(ls) : mediaDaFita(ls);
  let t = instanteDasMedidas(v);
  if (isNaN(t) || t > Date.now() + 60000) t = Date.now();
  const ant = (S.body[k] || []).filter(function (y) { return y.t < t && !sameDay(y.t, t); }).slice(-1)[0];
  const lim = CONFERIR_ACIMA[m.u];
  const nome = m.n.charAt(0).toUpperCase() + m.n.slice(1);
  if (ant && lim != null && Math.abs(val - ant.v) > lim + 1e-9) (v.v3.conferir = v.v3.conferir || []).push({ k: k, n: nome });
  const linha = { k: k, n: nome, valor: fmtDec(val) + ' ' + m.u, leituras: ls.length, dobra: !!m.dobra,
                  dif: ant ? fmtSig(Math.round((val - ant.v) * 10) / 10) + ' ' + m.u + ' desde ' + fmtDate(ant.t) : 'primeira medida' };
  const typed = view.bodyOnde && typeof view.bodyOnde[k] === 'string' ? view.bodyOnde[k].trim() : '';
  gravaMarca(k, val, t, typed || ondeMediu(S.body[k]) || m.onde || null, false, m.dobra ? null : ls.length);
  declaraGravacao(m.n.toLowerCase(), fmtDec(val) + ' ' + m.u);
  await save();
  // mudou mais que o comum: dito quando fecha, não só no resumo do fim
  if (v.v3.conferir && v.v3.conferir.some(function (c) { return c.k === k; })) {
    toast(nome + ': ' + linha.dif + '. Confira se mediu certo; dá para corrigir na tela da medida.');
  }
  return linha;
}
/**
 * Quanto tempo os botões da medição ignoram toques depois de a tela seguir
 * sozinha: o segundo toque de um toque duplo não vira a 1ª leitura da medida
 * seguinte, nem um "Pular esta" que a pessoa não decidiu. Pelo relógio
 * monotônico: um ajuste de hora do aparelho não silencia o botão.
 */
const TRAVA_DO_AVANCO_MS = 400;
const relogioMono = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
function travadoNaMedicao(x) { return !!(x && x.travadoAte && relogioMono() < x.travadoAte); }
/** A medida da tela fechou (ou foi pulada): grava a que fechou, e segue para a próxima; depois da última, o resumo. */
CTX.seguirMedida = async function () {
  const v = view.medidas; if (!v || !v.v3) return;
  const x = v.v3;
  if (x.seguindo || travadoNaMedicao(x)) return;
  x.seguindo = true;
  const kAgora = x.fila[x.i];
  if (!x.gravadas) x.gravadas = {};
  try {
    if (!x.gravadas[kAgora]) {
      const linha = await gravaMedidaQueFechou(v, kAgora);
      if (view.medidas !== v) return;
      if (linha) { x.gravadas[kAgora] = linha; }
    }
  } finally { x.seguindo = false; }
  x.travadoAte = relogioMono() + TRAVA_DO_AVANCO_MS;
  if (x.i < x.fila.length - 1) {
    x.i++;
    x.valor = valorInicialDaMedida(x.fila[x.i]);
    render(); rola(0);
    return;
  }
  // o resumo é o que foi gravado ao longo da fila, medida a medida
  const feitas = x.fila.map(function (k) { return x.gravadas[k] || null; }).filter(Boolean);
  if (!feitas.length) { view.medidas = null; view.bodyOnde = {}; render(); saiDoDestino('medidas'); return; }
  x.feitas = feitas;
  v.salvo = { n: feitas.length, conferir: x.conferir || [] };
  render(); rola(0);
};

/**
 * PESO (destino `evolucao` no visual novo): a média da semana em linha, as
 * pesagens em pontos, a faixa do alvo e as taxas por semana. "4 semanas" ou
 * "tudo" (desde a primeira pesagem).
 */
CTX.setFaixaDoPeso = function (f) { view.faixaDoPeso = f === '4' ? '4' : 'tudo'; render(); };
CTX.pesoV3 = function () {
  const agora = Date.now();
  const todos = (S.body.peso || []).slice().sort(function (a, b) { return a.t - b.t; });
  const faixa = view.faixaDoPeso === '4' ? '4' : 'tudo';
  const de = faixa === '4' ? weekStart(agora) - 4 * 7 * 86400000 : (todos.length ? weekStart(todos[0].t) : agora);
  const pontos = todos.filter(function (x) { return x.t >= de; });
  const semanas = mediasSemanais(todos).filter(function (w) { return w.w >= de - 7 * 86400000; })
    .map(function (w) { return { t: w.w + 3.5 * 86400000, v: Math.round(w.v * 10) / 10 }; });
  const ev = CTX.evolucao();
  const ult = todos[todos.length - 1];
  const s9 = serieSemanal(todos, 9);
  const d = variacaoDaSerie(s9);
  return {
    vazio: !todos.length,
    atual: ult ? fmtDec(ult.v) : '—',
    variacao: d == null ? null : fmtSig(d) + ' em 8 semanas',
    faixa: faixa, de: de, ate: agora,
    semanas: semanas, pontos: pontos.map(function (x) { return { t: x.t, v: x.v }; }),
    // o alvo do nutricionista, a partir da primeira média da faixa
    alvo: semanas.length ? { t: semanas[0].t, v: semanas[0].v, min: ALVO_MIN, max: ALVO_MAX } : null,
    meta: ev.meta,
    taxas: ev.taxas,
    frase: ev.frase,
    pesagens: ev.pesagens
  };
};

/** Corrige uma marca no mesmo instante (o número digitado errado), mantendo o resto dela. */
CTX.corrigeMarca = async function (k, t, v) {
  const n = Math.round(Number(v) * 10) / 10;
  const x = (S.body[k] || []).filter(function (y) { return y.t === t; })[0];
  if (!x || !isFinite(n) || n <= 0) return false;
  gravaMarca(k, n, t, x.onde || null, !!x.semHora, typeof x.n === 'number' ? x.n : null);
  await save(); render();
  toast('Corrigido: ' + fmtDec(n) + ' ' + ((medidaDoCorpo(k) || {}).u || '') + ' em ' + fmtDate(t) + '.');
  return true;
};

/** UMA MEDIDA no visual novo: o detalhe de sempre, com o que o gráfico precisa. */
CTX.medidaV3 = function () {
  const d = CTX.detalheDaMedida();
  if (!d) return null;
  return Object.assign(d, {
    fotosNoTempo: datasDasFotos(),
    serie: (d.pontos || []).map(function (p) { return { t: p.t, v: p.v }; })
  });
};

/**
 * TUDO NA MESMA DATA: um dia escolhido no tempo, e o corpo inteiro naquele
 * ponto, cada número com a data dele (`naMesmaData`, em dominio/corpo.ts).
 */
const CHAVES_DA_MESMA_DATA = ['peso', 'cintura', 'braco', 'coxa', 'panturrilha', 'peito', 'quadril',
  'dobraAbdominal', 'dobraSuprailiaca', 'dobraCoxa', 'bioGorduraPct', 'bioMusculo', 'bioGordura', 'bioAgua'];
CTX.abreNaMesmaData = function () { view.naMesmaData = { t: Date.now() }; entraNoDestino('naMesmaData'); render(); rola(0); };
CTX.fechaNaMesmaData = function () { view.naMesmaData = null; render(); saiDoDestino('naMesmaData'); };
CTX.setDiaNaMesmaData = function (t) {
  if (!view.naMesmaData) return;
  view.naMesmaData.t = Number(t);
  const r = naMesmaData(S.body, S.protocolo.sessoes || [], view.naMesmaData.t, CHAVES_DA_MESMA_DATA);
  if (r.sessao) garanteBytesDoCorpo([r.sessao]);
  render();
};
CTX.naMesmaDataV3 = function () {
  const v = view.naMesmaData; if (!v) return null;
  const agora = Date.now();
  const primeiras = CHAVES_DA_MESMA_DATA.map(function (k) { const s = S.body[k] || []; return s.length ? s.reduce(function (a, b) { return b.t < a.t ? b : a; }).t : agora; });
  (S.protocolo.sessoes || []).forEach(function (s) { primeiras.push(instanteDaData(s.d)); });
  const inicio = new Date(Math.min.apply(null, primeiras.concat([agora]))); inicio.setHours(12, 0, 0, 0);
  const r = naMesmaData(S.body, S.protocolo.sessoes || [], v.t, CHAVES_DA_MESMA_DATA);
  const ses = r.sessao ? sessaoDe(S.protocolo.sessoes, r.sessao) : null;
  return {
    t: v.t, inicio: inicio.getTime(), fim: agora,
    data: DIAS_LONGOS[new Date(v.t).getDay()] + ', ' + fmtDate(v.t),
    medidas: r.medidas.map(function (x) {
      const m = medidaDoCorpo(x.k);
      const dias = Math.round((new Date(v.t).setHours(12, 0, 0, 0) - new Date(x.t).setHours(12, 0, 0, 0)) / 86400000);
      return { k: x.k, n: (CAMPO_DA_BIO[x.k] ? CAMPO_DA_BIO[x.k].rotulo : m.n.charAt(0).toUpperCase() + m.n.slice(1)),
               valor: fmtDec(x.v), u: m.u, quando: dias === 0 ? 'no dia' : fmtDate(x.t) + ' · ' + dias + (dias === 1 ? ' dia antes' : ' dias antes') };
    }),
    sessao: ses ? {
      d: ses.d, txt: fmtDate(instanteDaData(ses.d)),
      fotos: ordemDePoses().filter(function (id) { return ses.fotos[id]; }).slice(0, 3).map(function (id) {
        const f = ses.fotos[id];
        return { id: id, url: CORPO.urlDaFoto(ses.d, id, f), enq: (f && f.enq) || null };
      })
    } : null
  };
};

/** A leitura nova da bioimpedância, um número por passo: de onde cada régua parte. */
CTX.camposDaBioV3 = function () {
  const PARTIDA = { bioPeso: null, bioMusculo: 35, bioGordura: 12, bioGorduraPct: 15, bioAgua: 45 };
  return MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).map(function (m) {
    const s = S.body[m.k] || [];
    const peso = (S.body.peso || []).slice(-1)[0];
    const partida = s.length ? s[s.length - 1].v : (PARTIDA[m.k] != null ? PARTIDA[m.k] : (peso ? peso.v : 75));
    return { k: m.k, rotulo: (CAMPO_DA_BIO[m.k] || { rotulo: m.n }).rotulo, u: m.u === 'L' ? 'L' : m.u,
             dica: (CAMPO_DA_BIO[m.k] || {}).dica || '', opcional: !m.obrigatorio, partida: partida,
             ultima: s.length ? fmtDec(s[s.length - 1].v) + ' ' + m.u + ' em ' + fmtDate(s[s.length - 1].t) : null };
  });
};

CTX.apagaMedida = function (k, t) { delBody(k, t); };
CTX.tiraCardio = tiraCardio;
CTX.apagaCardio = function (t) { delCardio(t); };
CTX.corrigeCardio = function (t, campo, valor) { return corrigeCardio(t, campo, valor); };
// No visual novo o cardio rápido é uma folha; no antigo, o painel do Agora.
CTX.abreCardio = function () { CTX.abreFolha({ k: 'cardio' }); };

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
/** Muda campos da folha de cima (uma escolha dentro dela, no visual novo) e redesenha. */
CTX.mudaFolha = function (campos) { const p = pilha(); if (!p.length) return; Object.assign(p[p.length - 1], campos); render(); };
/**
 * Troca a folha do topo em vez de empilhar.
 *
 * Existe por um caminho só: refeição → `···` → trocar → cadastrar alimento
 * novo, que chegava à QUARTA folha — a primeira em que ninguém sabe mais o que
 * o fechar leva de volta. Cadastrar é a continuação da busca que não achou, não
 * uma camada por cima dela.
 */
CTX.trocaFolha = function (f, volta) {
  const de = pilha().pop();
  // `troca`: a folha nova nasce no lugar, sem subir nem acender o véu (a moldura
  // é outra, e a entrada recomeçava: o véu piscava e um toque no meio caía no
  // vazio). `volta`: o Voltar, o Esc e o véu devolvem a primeira (02 §8: "a
  // segunda substitui a primeira, e o Voltar devolve a primeira")
  pilha().push(Object.assign({}, f, { troca: 1 }, volta && de ? { deBaixo: de } : {}));
  render();
};
// O estado que uma folha do visual novo segura sai com ela, feche como fechar
// (o X, o véu, o Voltar do sistema, o Esc): sem isto o catálogo e a série
// passada ficavam "abertos" no `view` depois de a folha sumir.
function soltaEstadoDaFolha(f) {
  if (!f) return;
  if (f.k === 'catalogo') { view.addEx = false; view.addQ = ''; view.novoEx = false; }
  if (f.k === 'seriePassada') { view.passada = null; view.teclado = null; }
}
CTX.fechaFolha = function () {
  const f = pilha().pop();
  soltaEstadoDaFolha(f);
  // a folha que substituiu outra devolve a de baixo, no lugar
  if (f && f.deBaixo) pilha().push(Object.assign(f.deBaixo, { troca: 1 }));
  render();
};
/** A folha terminou o que fazia (gravou): fecha sem devolver a que ela substituiu. */
CTX.concluiFolha = function () { soltaEstadoDaFolha(pilha().pop()); render(); };
CTX.fechaTudo = function () { (view.pilha || []).forEach(soltaEstadoDaFolha); view.pilha = []; render(); };

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

CTX.removeRefeicao = async function (id) {
  const r = achaRefeicao(id);
  if (!r) return;
  if (!(await pare({ texto: 'Tirar "' + r.n + '" do plano? Vale para todo dia. O histórico do que você já marcou não muda.', sim: 'Tirar do plano' }))) return;
  // a versão do plano sobe só se ele mudou: cancelar não é mudança
  planoMudou();
  const plano = planoDeComida();
  plano.splice(plano.indexOf(r), 1);
  const dia = diaDeComida();
  // A marca de hoje sai com LÁPIDE, como no desmarcar: sem ela, o outro aparelho
  // a trazia de volta, e uma refeição que nem existe mais contava no dia.
  if (dia.done[id] != null) lapide(chaveDeRefeicaoFeita(dia.data, id));
  delete dia.done[id];
  delete dia.escala[id];
  if (dia.como) { delete dia.como[id]; if (!Object.keys(dia.como).length) delete dia.como; }
  if (dia.tam) { delete dia.tam[id]; if (!Object.keys(dia.tam).length) delete dia.tam; }
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

CTX.removeItem = async function (refId, idx) {
  const r = achaRefeicao(refId);
  if (!r || !r.itens[idx]) return;
  // O item sai do plano de TODO dia, e voltar pede achar o alimento de novo e
  // digitar a quantidade que estava aqui. Confirma, e diz o que não se perde.
  const a = catalogoAlimentos()[r.itens[idx].f];
  if (!(await pare({ texto: 'Tirar ' + (a ? a.n.toLowerCase() : 'este item') + ' de ' + r.n + '? ' +
      'Muda o plano de todos os dias, não só o de hoje. ' +
      'O alimento continua na biblioteca.', sim: 'Tirar da refeição' }))) return;
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

CTX.removeAlimento = async function (id) {
  const cat = catalogoAlimentos();
  const a = cat[id];
  if (!a) return;
  // Um alimento em uso não pode sumir sem aviso: o plano ficaria apontando
  // para um id órfão, e o total do dia mudaria sem explicação.
  const usos = planoDeComida().filter(function (r) {
    return r.itens.some(function (i) { return i.f === id; });
  });
  const aviso = usos.length
    ? ' Ele está em ' + usos.length + (usos.length === 1 ? ' refeição' : ' refeições') +
      ': ' + usos.map(function (r) { return r.n; }).join(', ') + '. Vai sair de lá também.'
    : '';
  if (!(await pare({ texto: 'Tirar "' + a.n + '" da biblioteca?' + aviso, sim: 'Tirar da biblioteca' }))) return;

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
  // Relê a conta a cada login, inclusive depois de renovar a senha.
  sync.v = null; sync.sujo = true; sync.expirou = 0;
  gravaSync(); render();
  toast('Conectado como ' + r.v.email + '.');
  sincroniza({ manual: true });
};

CTX.sairDaNuvem = async function () {
  if (!(await pare({ tom: 'pergunta', texto: 'Sair da conta neste aparelho? O histórico continua aqui. Só para de sincronizar.', sim: 'Sair da conta', nao: 'Continuar na conta' }))) return;
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
    temPlanoEmbutido: !S.primeiraVez,
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
      const f = Object.assign({}, CARDIO_INICIAL, view.cardioForm);
      const perna = pernaHoje();
      return {
        feito: hojeCardio.length > 0,
        resumo: hojeCardio.length
          ? hojeCardio.map(function (c) { return c.min + ' min de ' + c.m; }).join(' · ')
          : cardioSemana().length + ' de ' + CARDIO_ALVO + ' nesta semana',
        aberto: !!view.cardioRapido,
        ...camposDoCardio(f),
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
  if (a.k === 'sessao') { abrirSessao(a.t, a.sid); return; }
  CTX.abreFolha({ k: 'registroTreino', data: hojeISO(a.t) });
};

CTX.cardioSet = function (k, v) { cardioSet(k, v); };
CTX.addCardio = function () { addCardio(); };

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

  const datasFotos = new Set(S.protocolo.sessoes
    .filter(s => Object.values(s.fotos || {}).some(f => f && Number.isFinite(f.v)))
    .map(s => s.d));
  const datasMedidas = new Set();
  for (const medida of medidasDeMedir()) {
    for (const marca of S.body[medida.k] || []) {
      if (marca.t >= ini && marca.t < fim) datasMedidas.add(hojeISO(marca.t));
    }
  }
  const celulas = [];
  for (let i = 1; i <= nDias; i++) {
    const dia = new Date(ano, mesN, i, 12).getTime();
    const hoje = sameDay(dia, agora);
    const futuro = !hoje && dia > agora;
    const marcas = futuro ? [] : sessoesDoDia(dia).slice().sort(function (a, b) { return a.t - b.t; });
    const iso = hojeISO(dia);
    const letras = marcas.map(m => m.livre ? 'fora' : siglaDoTreino(m.day));
    const desc = !marcas.length && !futuro && ehDescanso(dia);
    const cardio = futuro ? 0 : cardioDoDia(dia).length;
    const falta = !marcas.length && !futuro ? S.falta[iso] : null;
    const fotos = !futuro && datasFotos.has(iso), medidas = !futuro && datasMedidas.has(iso);
    const per = turnoDaSessao(marcas[0]);
    const h = hoje && S.dia?.data === iso ? S.dia : porData[iso];
    const resposta = futuro ? null : respostaDoDia(h) || (h && diaInterpretavel(h) ? 'com' : null);
    const partes = letras.map(l => l === 'fora' ? 'treino fora da prescrição' : l === 'HX' ? 'HYROX' : 'treino ' + l);
    const desc0 = partes.length > 1 ? [partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]] : partes;
    const ditos = desc0.slice();
    if (per) ditos.push('de ' + per.nome);
    if (!futuro && !marcas.length && !desc && !falta) ditos.push('sem treino registrado');
    if (desc) ditos.push('descanso marcado');
    if (cardio) ditos.push(cardio === 1 ? 'cardio' : cardio + ' cardios');
    if (falta) ditos.push('falta' + (falta.motivo ? ', ' + falta.motivo : ''));
    if (fotos) ditos.push('fotos');
    if (medidas) ditos.push('medidas');
    if (!futuro && ligado(S.modulos, 'comida')) {
      ditos.push('comida ' + ({ sim: 'no plano', quase: 'quase', naosei: 'não lembro', com: 'por refeição' }[resposta] || 'sem resposta'));
    }
    if (hoje) ditos.push('hoje');
    const d = new Date(dia);
    celulas.push({
      n: i, iso, hoje, futuro,
      principal: letras[0] || '', segunda: letras[1] || '',
      outrosTreinos: marcas.length > 1 ? partes.join(' · ') : null,
      descanso: desc, falta, cardio, resposta, fotos, medidas,
      periodo: per ? { k: per.k, rot: per.rot } : null,
      rotulo: DIAS_LONGOS[d.getDay()] + ', ' + i + ' de ' + MESES[mesN] + (ditos.length ? ': ' + ditos.join(', ') : ''),
      // Hoje abre o dia como os outros (dono, 21/10): é onde se vê e se corrige o
      // que já foi registrado hoje — antes abria o Agora, e um treino lançado
      // repetido ficava sem lugar para apagar.
      abre: futuro ? null : dia
    });
  }

  // As três leituras, cada uma com a conta à vista.
  const L = ate >= ini ? _leituraDosDias(S.done, ate) : null;
  const cardMes = S.cardio.filter(function (c) { return c.t >= ini && c.t <= ate; });
  const ins = _iniciosDoPeriodo(S.done, ini, ate, temHora, function (x) { return diaAberto(x.day); });
  const n = ins.inicios.length;
  const mediana = _medianaDosInicios(ins.inicios);
  const fora = [];
  if (ins.aulasSemHora) fora.push(ins.aulasSemHora === 1 ? 'a aula, sem hora de início' : 'as ' + ins.aulasSemHora + ' aulas, sem hora de início');
  if (ins.semHora) fora.push(ins.semHora === 1 ? 'o treino registrado sem hora' : 'os ' + ins.semHora + ' treinos registrados sem hora');
  if (ins.fora) fora.push(ins.fora === 1 ? 'o treino fora da prescrição' : 'os ' + ins.fora + ' treinos fora da prescrição');
  const diaCurto = function (t) { return DIAS_CURTOS[new Date(t).getDay()] + ' ' + fmtDate(t); };
  const temAlgo = Object.keys(S.falta).length > 0 || Object.keys(S.descanso).length > 0 || S.done.length > 0 || S.cardio.length > 0 ||
    (Array.isArray(S.comidaHist) && S.comidaHist.some(diaInterpretavel));

  return {
    titulo: MESES[mesN] + ' de ' + ano,
    // as leituras do mês contam até ontem; o calendário mostra hoje também
    ate: corrente && ate >= ini ? 'até ontem, ' + fmtDate(ontem) : null,
    anterior: maiuscula(MESES[(mesN + 11) % 12]),
    proximo: maiuscula(MESES[(mesN + 1) % 12]),
    podeAvancar: view.mes < 0,
    offset: new Date(ini).getDay(),
    dias: DIAS_CURTOS,
    celulas: celulas,
    escolhido: view.diaDoMes,
    periodos: PERIODOS.map(function (p) { return { k: p.k, rot: p.rot, nome: p.nome }; }),
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
      mediana: horaDeMinutos(Math.round(mediana)),
      cedo: horaDeMinutos(ins.inicios[0].min), cedoDia: diaCurto(ins.inicios[0].t),
      tarde: horaDeMinutos(ins.inicios[n - 1].min), tardeDia: diaCurto(ins.inicios[n - 1].t),
      pontos: ins.inicios.map(function (x) { return x.min; }), medianaMin: mediana,
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
  view.diaAberto = t; view.cardioAberto = null; view.cardioNoDia = null; entraNoDestino('dia'); render();
};
CTX.fechaDia = function () { view.diaAberto = null; view.cardioAberto = null; view.cardioNoDia = null; render(); saiDoDestino('dia'); };
CTX.abreCardioDoDia = function (t) { view.cardioAberto = view.cardioAberto === t ? null : t; render(); };
CTX.motivosFalta = MOTIVOS_FALTA;
CTX.respondeFrequencia = async function (data, escolha, motivo, restaura) {
  const falta = S.falta[data], descanso = S.descanso[data];
  const chaves = ['falta:' + data, 'descanso:' + data];
  const anteriores = chaves.map(k => S.apagados[k]);
  if (!respondeFrequencia(S, data, escolha, motivo, Date.now())) return;
  if (restaura) S.falta[data] = { ...restaura, m: S.falta[data].m };
  const em = S.falta[data]?.m || S.descanso[data];
  if (await save() === false) {
    if (falta) S.falta[data] = falta; else delete S.falta[data];
    if (descanso) S.descanso[data] = descanso; else delete S.descanso[data];
    chaves.forEach((k, i) => { if (anteriores[i] == null) delete S.apagados[k]; else S.apagados[k] = anteriores[i]; });
    render(); return;
  }
  render();
  return { texto: diaComMaiuscula(instanteDaData(data)) + ': ' + escolha + (motivo ? ', ' + motivo : '') + '.',
    desfaz: () => {
      if ((S.falta[data]?.m || S.descanso[data]) !== em) return;
      return CTX.respondeFrequencia(data, falta ? 'falta' : descanso ? 'descanso' : null, undefined, falta);
    } };
};
CTX.alternaDescansoDoDia = alternaDescanso;

CTX.diaAberto = function () {
  const t = view.diaAberto;
  if (!t) return null;
  const d = new Date(t);
  const iso = hojeISO(t);
  const marcas = sessoesDoDia(t).slice().sort(function (a, b) { return a.t - b.t; });
  const cardios = cardioDoDia(t).slice().sort(function (a, b) { return a.t - b.t; });
  const desc = !marcas.length && ehDescanso(t);
  const falta = !marcas.length && S.falta[iso];

  const sessoes = marcas.map(function (m) {
    const feitas = m.livre ? 0 : Object.keys(S.logs).reduce(function (n, k) {
      return n + (S.logs[k] || []).filter(function (e) { return e.sid === m.sid; })
        .reduce(function (x, e) { return x + e.sets.filter(Boolean).length; }, 0);
    }, 0);
    const P = !m.livre && treinoDaSessao(m);
    const prescritas = P ? P.ex.reduce(function (n, ex) { return n + ex.s; }, 0) : 0;
    const hh = function (x) { return horaHHMM(x).replace(':', 'h'); };
    const hora = temHora(m) || m.hora === 1 ? hh(m.t) : null;
    const turno = m.hora === 'turno' ? 'de ' + periodoDe(m.t).nome : null;
    const fim = hora && m.dur ? hh(m.t + m.dur + (m.pausado || 0)) : null;
    const detalhe = m.livre
      ? [hora || turno, (m.grupos || []).join(', ') || null, m.dur ? fmtDur(m.dur) : null].filter(Boolean)
      : [hora ? hora + (fim ? ' às ' + fim : '') : turno || 'sem hora',
         feitas ? feitas + (prescritas && feitas < prescritas ? ' de ' + prescritas : '') + ' séries' : (prescritas ? 'nenhuma série' : null),
         m.dur ? fmtDur(m.dur) : null,
         m.dur && m.fim !== 'manual' ? 'fechou sem você' : null].filter(Boolean);
    return {
      k: 'sessao', t: m.t, sid: m.sid, letra: letraDoRegistro(m),
      titulo: m.livre ? (m.nome || 'Treino fora da prescrição') : diaAberto(m.day) ? 'Aula' : 'Treino ' + m.day,
      detalhe: detalhe.join(' · ')
    };
  });
  const listaCardio = cardios.map(function (c, i) {
    const igual = cardios.slice(0, i).filter(function (o) { return o.m === c.m && o.min === c.min && o.i === c.i; })[0];
    const depois = !c.semHora && marcas.some(function (m) { return !m.livre && temHora(m) && m.t < c.t; });
    return {
      k: 'cardio', t: c.t,
      titulo: 'Cardio: ' + c.m,
      detalhe: [c.min + ' min' + (c.i ? ', ' + c.i : ''), horaDoCardio(c) ? horaDoCardio(c) + (depois ? ', depois do treino' : '') : 'lançado depois, sem hora']
                 .filter(Boolean).join(' · ') +
               (igual ? (horaDoCardio(igual) ? ' · igual ao das ' + horaDoCardio(igual) : ' · igual a outro deste dia') : ''),
      igual: !!igual,
      aberto: view.cardioAberto === c.t,
      // aberto, o registro inteiro: cada campo corrigível no toque
      campos: view.cardioAberto === c.t ? camposDoCardio(c) : null
    };
  });

  // a comida do dia: a verdade do registro, nunca a sugestão da folha
  const passado = iso < hojeISO();
  const folha = passado ? CTX.poeODiaEmDia(iso) : null;
  const h = (Array.isArray(S.comidaHist) ? S.comidaHist : []).filter(function (x) { return x.d === iso; })[0] || null;
  const momentos = folha ? folha.linhas.map(function (l) {
    return { id: l.id, nome: l.nome, hora: l.hora.replace(/^0(\d)/, '$1').replace(':', 'h'), marca: l.sugerida || l.marca === 'vazia' ? 'sem' : l.marca, tam: l.tam };
  }) : [];
  const comMarca = momentos.filter(function (x) { return x.marca !== 'sem'; }).length;
  const conta = h && diaInterpretavel(h);

  return {
    titulo: DIAS_LONGOS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()],
    volta: 'Voltar para ' + MESES[d.getMonth()],
    procedencia: marcas.length ? 'dia de treino, pela sessão registrada'
               : desc ? 'descanso, marcado por você' : falta ? 'falta, marcada por você' : 'nada registrado',
    registros: sessoes.concat(listaCardio).sort(function (a, b) { return a.t - b.t; }),
    peso: (function () {
      const p = (S.body.peso || []).filter(function (x) { return sameDay(x.t, t); }).slice(-1)[0];
      return p ? { valor: fmtDec(p.v), v: p.v, t: p.t, hora: horaHHMM(p.t).replace(':', 'h'), data: fmtDate(p.t) } : null;
    })(),
    vazio: !marcas.length && !desc && !falta && !cardios.length,
    falta,
    descanso: desc,
    // "marcado agora, às 21h22 · não conta como treino em nenhuma conta" (estado 9)
    descansoDetalhe: desc ? (function () {
      const tm = S.descanso[iso];
      const quando = typeof tm === 'number' && tm > 1
        ? 'marcado ' + (sameDay(tm, Date.now()) ? 'hoje' : 'em ' + fmtDate(tm)) + ', às ' + fmtHoraDita(tm) + ' · ' : '';
      return quando + 'não conta como treino em nenhuma conta';
    })() : null,
    // o palpite do dia vazio, dito como palpite (estado 5)
    palpite: !marcas.length && !desc && !falta
      ? 'Pelo padrão semanal, ' + DIAS_LONGOS[d.getDay()] + ' é dia de ' +
        (cadenciaDaSemana()[d.getDay()] === 'treino' ? 'treino' : 'descanso') + ' — é palpite.'
      : null,
    // um dia com treino não aceita a marca de descanso, e diz por quê (F156)
    podeDescanso: !marcas.length,
    // o cardio esquecido entra pelo dia passado (decisão do dono, 14/10)
    podeCardio: passado,
    cardioNovo: passado && view.cardioNoDia ? {
      ...camposDoCardio(view.cardioNoDia),
      falhou: view.cardioNoDiaFalhou || null
    } : null,
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

CTX.escolheDiaDoMes = function (iso) { view.diaDoMes = iso; render(); };
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
  const P = treinoDaSessao(m);
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
            rir: s[2] != null ? 'RIR ' + s[2] : null, editavel: !e.u, aberta: aberta, dp: !!e.dp }
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
    : { hora: m.hora === 'turno' ? 'de ' + periodoDe(m.t).nome : 'sem hora', nota: 'registrado depois, sem a hora de início' };
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
    comecoTxt: hIni || '',
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
    // a foto da lousa, que virou parte da aula (decisão do dono, 14/10)
    lousa: m.lousa ? (function () {
      const url = LOUSA.urlDaLousa(m.lousa.d, m.lousa.v);
      if (!url) LOUSA.carrega(m.lousa.d, m.lousa.v, m.lousa.ext).then(function (mudou) { if (mudou) render(); });
      return { url: url, quando: 'foto da lousa · ' + fmtDate(m.lousa.v) + ' ' + fmtHoraDita(m.lousa.v) };
    })() : null,
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
CTX.abreCorrecaoDoTempo = function (t) { abreCorrecaoDoTempo(t); };
CTX.editaSessao = function (t) { return apagaRegistroDeTreino(t); };
CTX.corrigeDuracao = function (t, min) { corrigeDuracao(t, min); };
/** O campo do começo: máscara enquanto digita, e grava quando a hora fecha. */
CTX.comecoNoCampo = function (t, el) {
  const v = mascaraDeHora(el.value, el.value.length === 2);
  if (v !== el.value) el.value = v;
  if (aplicaHora(t, v) != null) corrigeComeco(t, v);
};
/* Uma porta só, e aqui: `corrigeDuracao` já mora em `CTX`, e as duas são as
   duas metades da mesma resposta. Pôr esta também na tabela de verbos nus daria
   dois caminhos para o mesmo verbo, que é o que a superfície existe para não
   ter. */
CTX.confirmaDuracao = function (t, sid) { confirmaDuracao(t, sid); };

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
CTX.apagaLinha = function () { apagarSessao(); };
CTX.editDor = function (k) { editDor(k); };

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
/**
 * O toque numa resposta do Plano: responder tira a decisão da tela e o resto
 * sobe, então o segundo toque de um toque duplo cairia na de baixo. Por um
 * instante, os toques nas respostas são ignorados. A trava é do toque, não da
 * regra: quem chama `respondeMudanca` direto não passa por ela.
 */
const TRAVA_DA_RESPOSTA_MS = 600;
let respostaTravadaAte = 0;
CTX.respondeMudancaPeloToque = function (sid, i, permanente) {
  const agoraMono = (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  if (agoraMono < respostaTravadaAte) return;
  respostaTravadaAte = agoraMono + TRAVA_DA_RESPOSTA_MS;
  return CTX.respondeMudanca(sid, i, permanente);
};
CTX.respondeMudanca = async function (sid, i, permanente, motivo) {
  if (!Array.isArray(S.promoPendente)) S.promoPendente = listaDePromo(S.promoPendente);
  const chave = chaveDePromo({ sid: sid, t: sid });
  const g = S.promoPendente.filter(function (x) { return chaveDePromo(x) === chave; })[0];
  if (!g || !Array.isArray(g.mods)) return;
  const m = g.mods[i];
  if (!m) return;

  // respondida no outro aparelho: não se aplica de novo
  const chaveM = chaveDaMudanca(sid, m);
  const jaRespondida = !!(S.apagados && S.apagados[chaveM] != null);
  const n = (permanente && !jaRespondida) ? aplicaAoOficial(g.day, [m], motivo || null) : 0;
  lapide(chaveM);
  // A troca aceita muda o exercício da posição. As outras mudanças da mesma
  // posição (as séries, a faixa) passam a apontar para o exercício novo: elas
  // procuravam o antigo, e respondiam "A posição não existe mais no programa".
  if (n && m.k === 'troca') {
    g.mods.forEach(function (o, j) {
      if (j === i || o.slot !== m.slot) return;
      if (!o.chave) o.chave = chaveDaMudanca(sid, o).slice(('promo:' + sid + ':').length);
      o.slot = m.por;
    });
  }

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
      previsto: previsto ? { k: previsto, letra: diaAberto(previsto) ? 'aula' : previsto, titulo: nomeDe(previsto), detalhe: descreve(previsto) } : null,
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
CTX.abreHoraDoLancamento = function () { abreHoraDoLancamento(); };
// o fluxo antigo de lançar treino passado, sem entrada na interface: fica para os testes que criam sessões retroativas (docs/ARQUITETURA.md)
CTX.lancaTreino = function (k) { return lancaTreino(k); };
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

function catalogoDeAdicao(d, trocaDe) {
  const q = view.addQ || '';
  const nodia = {};
  const t = treino(d);
  const origem = t?.ex[trocaDe];
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
      // Na troca, a série já digitada acompanha o exercício com a mesma grandeza.
      .filter(k => trocaDe == null || (origem && unidadeDe(CAT[k]) === unidadeDe(origem)))
      // Nome e grupo no mesmo alvo: cada palavra da consulta precisa aparecer
      // em algum dos dois, e a ordem não importa. É o que faz `sled push`,
      // `push sled` e `remo` chegarem onde ele espera — e `triceps` achar o
      // grupo `tríceps`, que antes exigia o acento.
      // e os nomes alternativos do catálogo do sistema: "pulldown" acha a puxada
      .filter(function (k) {
        return casaBusca(CAT[k].n + ' ' + (CAT[k].g || '') + ' ' + nomesAltDe(k).join(' '), q);
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


CTX.acoesAulas = {
  abre: function () { abrirAulas(); },
  repete: function () { repetirUltimaAula(); },
  aplica: function (id) { aplicarModeloDeAula(id); },
  salva: function () { salvarAulaComoModelo(); },
  apaga: function (id) { apagarModeloDeAula(id); },
  cola: function () { view.colaAula = !view.colaAula; render(); },
  importa: importaAulaColada
};

CTX.acoesAdd = {
  // no visual novo o catálogo é uma folha (`catalogo`), no programa e na aula
  abre: function () { CTX.abreCatalogoV3(); },
  fecha: function () { fecharAddEx(); },
  busca: function (v) { buscaEx(v); },
  adiciona: function (k) { addExercicio(k); },
  abreNovo: function () { abrirNovoEx(); },
  cria: function () { criarExercicio(); }
};

// ---------- o CATÁLOGO no visual novo (folha `catalogo`) ----------
// As mesmas portas do catálogo antigo (`catalogoDeAdicao`, `addExercicio`,
// `criarExercicioCom`). No programa a adição é permanente; no treino de hoje
// (a aula), é só do dia — quem decide é `addExercicio`, pelo `view.prog`.
CTX.abreCatalogoV3 = function (trocaDe) {
  view.addEx = true; view.addQ = ''; view.novoEx = false;
  if (Number.isInteger(trocaDe)) CTX.trocaFolha({ k: 'catalogo', trocaDe }, true);
  else CTX.abreFolha({ k: 'catalogo' });
};
CTX.catalogoV3 = function (trocaDe) {
  const permanente = !!(view.prog && view.prog.day);
  const d = permanente ? view.prog.day : view.day;
  return Object.assign(catalogoDeAdicao(d, trocaDe), { permanente: permanente });
};
CTX.buscaCatalogoV3 = function (q) { setBuscaDeExercicio(q); };
CTX.novoNoCatalogoV3 = function (sim) { view.novoEx = sim !== false; render(); };
CTX.fechaCatalogoV3 = function () { CTX.fechaFolha(); };
function saiDoCatalogoV3() {
  const p = pilha();
  if (p.length && p[p.length - 1].k === 'catalogo') CTX.fechaFolha();
}
CTX.adicionaDoCatalogoV3 = async function (k) { await addExercicio(k); saiDoCatalogoV3(); };
CTX.criaNoCatalogoV3 = async function (c) {
  await criarExercicioCom(c);
  // sem nome ou com nome repetido, o verbo avisa e o catálogo fica aberto
  if (!view.addEx) saiDoCatalogoV3();
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
      { k: 'b', rotulo: 'do treinador', valor: String(alvoTotal()) },
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
  if (rot().join('|') !== rotTreinador().join('|')) {
    blocos.push({ k: 'rot', titulo: 'rotação',
                  itens: [rotTreinador().join(' → ') + ' virou ' + rot().join(' → ')], dia: null });
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
  const log = (S.progLog || []).slice().reverse().sort((a, b) => b.t - a.t);
  const MOT = {}; MOTIVOS.forEach(function (x) { MOT[x.k] = x.t; });
  return {
    modo: 'historico',
    olho: 'seu programa',
    meta: log.length ? log.length + ' desde ' + fmtDate(log[log.length - 1].t) : '0 mudanças',
    titulo: 'Histórico de mudanças',
    log: log.map(function (x, i) {
      const data = new Date(x.t);
      const mes = maiuscula(MESES[data.getMonth()]);
      const origem = x.textoRevisao ? 'texto do treinador' : x.motivo ? 'você, no fim do treino' : 'treino ' + x.day;
      return {
        mes: mes + (data.getFullYear() === new Date().getFullYear() ? '' : ' de ' + data.getFullYear()),
        dia: fmtDate(x.t).slice(0, 2),
        i: i,
        txt: x.txt,
        textoRevisao: x.textoRevisao,
        meta: fmtDate(x.t) + ' · ' + origem +
              (x.motivo ? ' · ' + (MOT[x.motivo] || x.motivo) : '')
      };
    })
  };
}

/**
 * A FAIXA DO EDITOR (visual novo): as séries por músculo neste treino, e
 * quanto saiu do que o treinador prescreveu para ele.
 */
CTX.faixaDoTreinoV3 = function (d) {
  const meu = S.prog[d], dele = baseTreinador()[d];
  if (!meu) return [];
  const soma = function (p) {
    const r = {};
    ((p && p.ex) || []).forEach(function (sl) { const g = exDe(sl.id).g; if (g) r[g] = (r[g] || 0) + (sl.s || 0); });
    return r;
  };
  const a = soma(meu), b = soma(dele);
  return Object.keys(Object.assign({}, b, a)).map(function (g) {
    return { g: g, series: a[g] || 0, diferenca: (a[g] || 0) - (b[g] || 0) };
  });
};

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
  // o que mudou desde a sessão anterior, dito no preparo (visual novo)
  const muda = view.protocolo && view.protocolo.d === d ? mudancasDaSessao(view.protocolo.muda) : [];
  if (muda.length) ses.muda = muda;
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

/**
 * "Tudo como da última vez?" (visual novo): o que mudou desde a sessão
 * anterior. Fica no preparo e entra na sessão quando ela nasce, na primeira
 * foto; se a sessão do dia já existe, é atualizada na hora.
 */
CTX.setMudaDaSessao = function (lista) {
  const v = view.protocolo; if (!v) return;
  v.muda = mudancasDaSessao(lista);
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  if (ses) {
    if (v.muda.length) ses.muda = v.muda.slice(); else delete ses.muda;
    ses.m = Date.now();
    queueSave();
  }
  render();
};
CTX.mudaDaSessao = function () {
  const v = view.protocolo; if (!v) return [];
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  return mudancasDaSessao(ses ? ses.muda : v.muda);
};

/**
 * QUEM SEGURA O CELULAR (visual novo): três cenários, dois modos de câmera.
 * "A pessoa de sempre" e "alguém que nunca fez" são o mesmo `alguem`; o
 * segundo só ganha os três passos escritos para ela antes da câmera. Por isso
 * o "novo" fica na sessão aberta, e não guardado: a próxima pode ser outra
 * pessoa.
 */
CTX.setQuemSegura = function (k) {
  const v = view.protocolo; if (!v) return;
  if (k !== 'sempre' && k !== 'novo' && k !== 'sozinho') return;
  v.novo = k === 'novo';
  CTX.setQuemTira(k === 'sozinho' ? 'sozinho' : 'alguem');
  render();
};
CTX.quemSegura = function () {
  const v = view.protocolo;
  if (quemTira === 'sozinho') return 'sozinho';
  return v && v.novo ? 'novo' : 'sempre';
};
/** Os três passos para quem nunca fotografou: uma camada, que o Voltar desfaz. */
CTX.abrePassosDasFotos = function () {
  const v = view.protocolo; if (!v) return;
  v.passos = true; entraNoDestino('passos'); render();
};
CTX.fechaPassosDasFotos = function () {
  const v = view.protocolo; if (!v || !v.passos) return;
  v.passos = false; render(); saiDoDestino('passos');
};
/**
 * Da "Nova sessão" (ou dos três passos) direto para a câmera. Tem de rodar
 * dentro do toque: a câmera pede a permissão do sensor antes de qualquer
 * espera (ver `abreCamera`).
 */
CTX.vaiParaACamera = function () {
  const v = view.protocolo; if (!v) return;
  if (v.passos) { v.passos = false; esqueceDestino('passos'); }
  preparaAudio();
  v.montagem = false;
  CTX.abreCamera();
};
/** O que a "Nova sessão" mostra. */
CTX.novaSessaoV3 = function () {
  const v = view.protocolo; if (!v) return null;
  const anteriores = (S.protocolo.sessoes || []).filter(function (s) { return s.d < v.d && Object.keys(s.fotos || {}).length; });
  return {
    quem: CTX.quemSegura(),
    muda: CTX.mudaDaSessao(),
    // sem sessão anterior, não há "da última vez" para conferir
    temAnterior: anteriores.length > 0,
    total: posesDo(S.protocolo.poses).length,
    passos: !!v.passos
  };
};

CTX.fechaProtocolo = function () { view.protocolo = null; render(); saiDoDestino('protocolo'); };
/** Do fim da sessão de fotos direto para as medidas: a sessão sai, as medidas entram. */
CTX.medirDepoisDasFotos = function () {
  view.protocolo = null; saiDoDestinoNoDesenho('protocolo');
  CTX.abreMedidas();
};
// O toque em começar é também o que libera o som (a D, estado 1): no Safari do
// iOS, áudio só existe dentro de um toque (F58).
CTX.comecaSessaoDeFotos = function () { preparaAudio(); view.protocolo.montagem = false; render(); rola(0); };
CTX.vaiParaPose = function (id) { view.protocolo.pose = id; render(); rola(0); };

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

/**
 * A próxima pose que falta, deixando para o fim as que voltaram por foto preta
 * (a D, estado 6): elas só vêm quando não sobra outra.
 */
function proximaComAdiadas(ses) {
  const ordem = posesDo(S.protocolo.poses).map(function (p) { return p.id; });
  const faltam = ordem.filter(function (id) { return !(ses && ses.fotos && ses.fotos[id]); });
  const ad = (view.protocolo && view.protocolo.adiadas) || {};
  return faltam.filter(function (id) { return !ad[id]; })[0] || faltam[0] || null;
}

async function guardaFotoDaPose(d, pose, reduzida) {
  const { blob, ext } = reduzida;
  // A versão nasce antes de guardar, porque os bytes a levam junto; e vem um
  // milissegundo depois do instante da lápide da versão anterior (abaixo): no
  // mesmo milissegundo, o empate é da lápide, e a foto nova sumiria no outro
  // aparelho.
  // A FOTO QUE ESTA SUBSTITUI VAI PARA A LIXEIRA (13/11/2026), e antes de os
  // bytes novos ocuparem o lugar dela: o endereço da foto viva não tem versão.
  const sesAntes = sessaoDe(S.protocolo.sessoes, d);
  const anterior = sesAntes && sesAntes.fotos && sesAntes.fotos[pose];
  if (anterior && anterior.v) await paraALixeira(d, pose, anterior, 'refeita');
  const morte = Date.now();
  const v = morte + 1;
  try { await CORPO.guarda(d, pose, blob, ext, v); }
  catch (e) { marcaPoseNaoGuardada(pose, 'foto', reduzida); return { parou: true }; }
  // O original (F27) vem depois, e é opcional: sem espaço para ele, a foto da
  // tela já está guardada, e ela é a que a sessão precisa.
  let orig = null;
  const o = reduzida.original;
  if (o && o.blob) {
    try { await CORPO.guardaOriginal(d, pose, o.blob, o.ext, v); orig = { ext: o.ext, l: o.l, a: o.a }; }
    catch (e) { orig = null; }
  }

  const ses = sessaoFotoOuCria(d);
  const antiga = ses.fotos[pose];
  // refazer apaga a anterior: sem lápide, a fusão traria a versão velha de
  // volta do outro aparelho, e as duas disputariam a mesma pose
  if (antiga) {
    lapide(chaveDeFotoDoCorpo(d, pose), morte);
    // no outro formato, a anterior ocuparia outro lugar no bucket para sempre
    // (a cópia dela está na lixeira, e sobe antes de a fila de apagar andar)
    if (antiga.ext && antiga.ext !== ext) apagaDaNuvemDepois(d, pose, antiga.ext);
    // o original da anterior tem nome próprio, com a versão: fica, junto com
    // ela na lixeira, e sai quando ela sair de vez
  }
  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[pose] = { v: v, ext: ext };
  if (orig) ses.fotos[pose].orig = orig;
  // Por qual câmera, e que tamanho o navegador disse que a fonte tinha: é o que
  // deixa ver nos DADOS, sem pedir teste a ninguém, se o vídeo voltou a se
  // anunciar deitado (ver `quadroDoVideo`). São uns 40 bytes por foto.
  if (reduzida.via && reduzida.fonte) {
    ses.fotos[pose].cap = registroDaCaptura(reduzida);
  }
  // o alinhamento que o app sugere, pelos pontos do corpo no disparo (visual
  // novo): fica como sugestão até o dono aceitar (decisão de 17/11/2026)
  if (reduzida.enqAuto) ses.fotos[pose].sug = reduzida.enqAuto;
  ses.m = Date.now();
  CORPO.solta(d, pose);                // a versão anterior sai da memória
  await CORPO.carrega(d, pose, ses.fotos[pose]);

  if ((await save()) === false) { marcaPoseNaoGuardada(pose, 'registro', null); return { parou: true }; }
  if (view.protocolo) view.protocolo.naoGuardada = null;
  // avança sozinho para a próxima que falta: a sessão é uma sequência, e
  // pedir um toque a mais entre duas poses é pedir um toque a mais nove vezes
  const prox = proximaComAdiadas(sessaoDe(S.protocolo.sessoes, d));
  if (prox && view.protocolo) view.protocolo.pose = prox;
  return prox;
}

/**
 * A FOTO DEITADA (medida em 03/11).
 *
 * Toda foto do protocolo é tirada em pé — o app só funciona em retrato e pede
 * para desvirar o celular. Mesmo assim, de oito fotos tiradas com o celular
 * parado e em pé, quatro chegaram DEITADAS: a imagem em pé preenchendo um
 * quadro deitado, e o que ficaria guardado era só a faixa do meio, ampliada
 * 1,3×. Três pela câmera do app, uma pela do sistema, sem erro nenhum.
 *
 * A câmera do app já monta o quadro em pé (`quadroDoVideo`), e a do sistema
 * passou a ser lida pelo <img>. Isto aqui é a trava que sobra para a do
 * sistema: se ainda assim chegar deitada, é defeito, nunca escolha, e não é
 * guardada — guardá-la estragaria a comparação em silêncio, que é o único erro
 * que esta parte do app não pode cometer.
 */
function deitada(r) { return !!r && r.l > r.a; }

/**
 * O registro da captura (`Captura`, em dominio/tipos.ts): por qual câmera, o
 * tamanho que a fonte tinha e, desde 04/11, a lente e o nível do celular no
 * disparo. A lente e o nível vêm da auditoria das fotos: os dois mudam a foto
 * mais do que duas semanas de treino, e nenhum dá para ler na foto depois.
 * Campo que não veio fica fora, em vez de entrar vazio.
 */
function registroDaCaptura(r) {
  const cap = { via: r.via, l: r.fonte.l, a: r.fonte.a };
  if (r.origem === 'foto' || r.origem === 'quadro') cap.origem = r.origem;
  if (r.lente) cap.lente = r.lente;
  if (typeof r.mm === 'number') cap.mm = r.mm;
  if (typeof r.zoom === 'number') cap.zoom = r.zoom;
  if (r.nivel) cap.nivel = { lado: r.nivel.lado, frente: r.nivel.frente };
  if (r.modo === 'alguem' || r.modo === 'sozinho') cap.modo = r.modo;
  if (r.mov) cap.mov = { toque: r.mov.toque, seg: r.mov.seg };
  // fora do padrão: o que não estava certo e quem fotografou tirou mesmo assim
  // (`Captura.fora`). Quem decide a lista é a câmera.
  if (Array.isArray(r.fora) && r.fora.length) {
    const ok = ['nivel', 'altura', 'distancia', 'tremida'];
    const fora = r.fora.filter(function (x, i, a) { return ok.indexOf(x) >= 0 && a.indexOf(x) === i; });
    if (fora.length) cap.fora = fora;
  }
  if (r.det && typeof r.det.ativa === 'boolean') cap.det = { ativa: r.det.ativa, qps: Math.round(Number(r.det.qps) || 0) };
  return cap;
}
const FOTO_DEITADA = 'A foto saiu cortada pelo navegador e não foi guardada. Tire de novo.';

async function tiraFotoDoCorpo(el) {
  const arquivo = el.files && el.files[0];
  const v = view.protocolo;
  if (!arquivo || !v) return;
  el.value = '';                       // permite repetir a mesma foto
  try {
    // a lente sai dos bytes ORIGINAIS: a redução não leva o EXIF junto
    const exif = await exifDoArquivo(arquivo);
    const reduzida = Object.assign(await CORPO.reduz(arquivo), { via: 'sistema' }, exif);
    if (deitada(reduzida)) { toast(FOTO_DEITADA); return; }
    const r = await guardaFotoDaPose(v.d, v.pose, reduzida);
    render();
    if (!(r && r.parou)) rola(0);
  } catch (e) {
    toast('Não deu para guardar a foto.');
  }
}
CTX.tiraFotoDoCorpo = function (el) { tiraFotoDoCorpo(el); };

/**
 * Apaga UMA foto de corpo, de qualquer sessão.
 *
 * Nasceu presa à sessão de HOJE, porque a única porta era a tela de captura —
 * que sempre abre no dia. A foto de uma sessão passada não tinha saída:
 * ajustar resolve a torta e a tirada de longe, mas não a que não devia existir
 * (pedido do dono, 03/11). A segunda porta é a Comparar, que é onde a foto
 * antiga aparece. As duas passam por aqui, com a mesma confirmação, a mesma
 * lápide e a mesma fila para tirar os bytes do bucket.
 *
 * @returns {Promise<boolean>} se a foto foi apagada
 */
async function apagaFotoDoCorpo(d, pose) {
  const antes = sessaoDe(S.protocolo.sessoes, d);
  if (!antes || !antes.fotos[pose]) return false;
  const ref = antes.fotos[pose];
  // Não pergunta antes (13/11/2026): apagar põe a foto na lixeira, por 30 dias,
  // e o aviso traz "Desfazer". O que pede confirmação é apagar DE VEZ.
  const item = await paraALixeira(d, pose, ref, 'apagada');
  // relida depois do await: a cópia leva tempo, e uma sincronização no meio
  // pode ter trocado o estado inteiro
  const ses = sessaoDe(S.protocolo.sessoes, d);
  if (!ses || !ses.fotos[pose] || ses.fotos[pose].v !== ref.v) return false;
  lapide(chaveDeFotoDoCorpo(d, pose));
  ses.fotos = Object.assign({}, ses.fotos);
  delete ses.fotos[pose];
  ses.m = Date.now();
  CORPO.solta(d, pose);
  await CORPO.esquece(d, pose, ref.ext);
  // o endereço da foto viva sai do bucket — depois de a cópia da lixeira subir
  // (`reconciliaCorpo`). Se a cópia não coube (raro: sem os bytes aqui e sem
  // rede), os bytes ficam no endereço dela, e é de lá que a restauração busca.
  if (!item.noLugar) apagaDaNuvemDepois(d, pose, ref.ext);
  // sessão sem foto nenhuma não sobrevive à última: ela nasce na primeira
  if (!Object.keys(ses.fotos).length) {
    lapide(chaveDeSessaoFoto(d));
    S.protocolo.sessoes = S.protocolo.sessoes.filter(function (x) { return x.d !== d; });
  }
  await save(); render();
  const k = chaveDaLixeira(item);
  avisoComAcao('Foto na lixeira por ' + DIAS_NA_LIXEIRA + ' dias.', 'Desfazer', function () { restauraDaLixeira(k); });
  return true;
}

// ---------- a LIXEIRA das fotos do corpo (dominio/lixeira.ts) ----------
function lixeiraDeFotos() { if (!Array.isArray(S.lixeira)) S.lixeira = []; return S.lixeira; }

/** Copia os bytes da foto para o endereço da lixeira. `true` se ficaram aqui. */
async function copiaParaLixeira(d, pose, ref) {
  try {
    let b = null;
    const aqui = await CORPO.versaoAqui(d, pose, ref.ext);
    if (aqui === ref.v || aqui === 'legado') b = await CORPO.le(d, pose, ref.ext);
    if (!b && NUVEM.sessao()) {
      const r = await NUVEM.baixaCorpo(d, pose, ref.ext);
      if (r.ok && r.v) b = r.v;
    }
    if (!b) return false;
    await CORPO.guarda(pastaDaLixeira(d), nomeNaLixeira(pose, ref.v), b, ref.ext, ref.v);
    return true;
  } catch (e) { return false; }
}

/** Põe a foto na lixeira (sem tirá-la da sessão: isso é de quem chama). */
async function paraALixeira(d, pose, ref, porque) {
  const copiou = await copiaParaLixeira(d, pose, ref);
  const r = Object.assign({}, ref); delete r.r;
  const item = { d: d, pose: pose, ref: r, em: Date.now(), porque: porque };
  if (!copiou) item.noLugar = 1;
  const k = chaveDaLixeira(item);
  S.lixeira = lixeiraDeFotos().filter(function (x) { return chaveDaLixeira(x) !== k; }).concat([item]);
  return item;
}

/** Os bytes de um item da lixeira, daqui ou do bucket. `null` sem eles. */
async function bytesDaLixeira(x) {
  const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
  let b = await CORPO.le(pd, pn, x.ref.ext);
  if (!b && NUVEM.sessao()) { const r = await NUVEM.baixaCorpo(pd, pn, x.ref.ext); if (r.ok && r.v) b = r.v; }
  if (!b && x.noLugar) {
    const aqui = await CORPO.versaoAqui(x.d, x.pose, x.ref.ext);
    if (aqui === x.ref.v || aqui === 'legado') b = await CORPO.le(x.d, x.pose, x.ref.ext);
    if (!b && NUVEM.sessao()) { const r = await NUVEM.baixaCorpo(x.d, x.pose, x.ref.ext); if (r.ok && r.v) b = r.v; }
  }
  return b;
}

/**
 * Devolve a foto à sessão dela. Se a pose já tem outra foto, a outra vai para
 * a lixeira no lugar desta. A foto volta com a versão de sempre e o carimbo de
 * restauração (`r`), que a põe depois da lápide de quando foi apagada.
 */
async function restauraDaLixeira(k) {
  const x = lixeiraDeFotos().filter(function (y) { return chaveDaLixeira(y) === k; })[0];
  if (!x) return false;
  const b = await bytesDaLixeira(x);
  if (!b) { toast('A foto está na nuvem, e este aparelho está sem conexão. Tente de novo com internet.'); return false; }
  const agora = Date.now();
  const ses0 = sessaoDe(S.protocolo.sessoes, x.d);
  const atual = ses0 && ses0.fotos[x.pose];
  if (atual && atual.v !== x.ref.v) await paraALixeira(x.d, x.pose, atual, 'refeita');
  await CORPO.guarda(x.d, x.pose, b, x.ref.ext, x.ref.v);
  const ses = sessaoFotoOuCria(x.d);
  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[x.pose] = Object.assign({}, x.ref, { r: agora });
  ses.m = agora;
  // a foto volta a ser desta versão aqui, e o bucket precisa recebê-la de novo
  delete sync.fotos['corpo:' + x.d + ':' + x.pose]; gravaSync();
  lapide(k, agora);
  S.lixeira = lixeiraDeFotos().filter(function (y) { return chaveDaLixeira(y) !== k; });
  const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
  CORPO.solta(pd, pn);
  CORPO.esquece(pd, pn, x.ref.ext).catch(function () {});
  apagaDaNuvemDepois(pd, pn, x.ref.ext);
  CORPO.solta(x.d, x.pose);
  await CORPO.carrega(x.d, x.pose, ses.fotos[x.pose]);
  await save(); render();
  toast('Foto restaurada em ' + fmtDate(instanteDaData(x.d)) + '.');
  return true;
}

/** Tira o item da lixeira e os bytes dele daqui e do bucket. Sem perguntar. */
async function apagaDaLixeiraDeVez(x) {
  const k = chaveDaLixeira(x);
  lapide(k);
  S.lixeira = lixeiraDeFotos().filter(function (y) { return chaveDaLixeira(y) !== k; });
  const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
  CORPO.solta(pd, pn);
  try { await CORPO.esquece(pd, pn, x.ref.ext); } catch (e) {}
  apagaDaNuvemDepois(pd, pn, x.ref.ext);
  // os bytes que ficaram no endereço da foto viva: a fila não apaga se uma
  // foto nova ocupou o lugar no mesmo formato
  if (x.noLugar) apagaDaNuvemDepois(x.d, x.pose, x.ref.ext);
  if (x.ref.orig && x.ref.v) {
    try { await CORPO.esqueceOriginal(x.d, x.pose, x.ref.orig.ext, x.ref.v); } catch (e) {}
    apagaOriginalDaNuvemDepois(x.d, x.pose, x.ref.v, x.ref.orig.ext);
  }
}

/** Depois de 30 dias, sozinha. Roda ao abrir o app e a cada reconciliação. */
async function purgaLixeira() {
  const v = vencidosDaLixeira(lixeiraDeFotos(), Date.now());
  if (!v.length) return 0;
  for (const x of v) await apagaDaLixeiraDeVez(x);
  await save();
  return v.length;
}

/** Os bytes da lixeira sobem para o endereço dela no bucket. `false` sem rede. */
async function sobeLixeira() {
  for (const x of lixeiraDeFotos().slice()) {
    if (!x || x.noLugar || !x.ref) continue;
    const k = 'lixo:' + x.d + ':' + x.pose + ':' + x.ref.v;
    if (sync.fotos[k]) continue;
    const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
    const b = await CORPO.le(pd, pn, x.ref.ext);
    if (desligado) return false;
    if (!b) continue;                  // foi para a lixeira no outro aparelho: sobe de lá
    const r = await NUVEM.subirCorpo(pd, pn, b, x.ref.ext);
    if (desligado) return false;
    if (!r.ok) return false;
    sync.fotos[k] = 1; gravaSync();
  }
  return true;
}

/** Os bytes da lixeira na memória, para a tela: daqui, ou do bucket. */
async function garanteBytesDaLixeira() {
  let mudou = false;
  for (const x of lixeiraDeFotos().slice()) {
    if (!x || !x.ref) continue;
    const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
    const ref = { v: x.ref.v, ext: x.ref.ext };
    if (CORPO.urlDaFoto(pd, pn, ref)) continue;
    let tem = await CORPO.tem(pd, pn, ref.ext);
    if (desligado) return;
    if (!tem) {
      const b = await bytesDaLixeira(x);
      if (desligado) return;
      if (b) { await CORPO.guarda(pd, pn, b, ref.ext, ref.v); tem = true; }
    }
    if (tem && await CORPO.carrega(pd, pn, ref)) mudou = true;
    if (desligado) return;
  }
  if (mudou) render();
}

/**
 * O AVISO COM "DESFAZER": o componente único para tudo o que é reversível mas
 * tem efeito longe da tela (apagar foto, pular exercício). A pílula de tinta,
 * acima da doca, com a ação em lima (`global.css`, "O AVISO"). Fica 6 s, para
 * dar tempo de o dedo chegar.
 */
function avisoComAcao(msg, rotulo, fn) {
  const regiao = document.getElementById('toast');
  if (!regiao) return;
  clearTimeout(avisoLeitura);
  if (avisoSaindo) { clearTimeout(avisoSaindo); avisoSaindo = null; }
  const no = document.createElement('div');
  no.className = 'aviso com-acao';
  const t = document.createElement('span');
  t.textContent = msg;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'aviso-acao'; b.textContent = rotulo;
  b.setAttribute('data-a', 'aviso-acao');
  b.addEventListener('click', function () {
    clearTimeout(avisoLeitura); avisoLeitura = null;
    regiao.textContent = '';
    fn();
  });
  no.appendChild(t); no.appendChild(b);
  regiao.textContent = '';
  regiao.appendChild(no);
  // O segundo toque da ação que abriu o aviso ainda pode cair na tela de trás.
  const aceitaForaEm = Date.now() + TOQUE_DUPLO_MS;
  const fora = function (e) {
    if (!no.isConnected) { document.removeEventListener('pointerdown', fora, true); return; }
    if (pontoDentro(e, no.getBoundingClientRect()) || Date.now() < aceitaForaEm) return;
    document.removeEventListener('pointerdown', fora, true);
    clearTimeout(avisoLeitura);
    apagaAviso();
  };
  document.addEventListener('pointerdown', fora, true);
  // 6 s para o dedo chegar (02-componentes.md, §12), ou o tempo de ler, se maior
  avisoLeitura = setTimeout(apagaAviso, Math.max(AVISO_COM_ACAO_MS, tempoDeLeitura(msg)));
}
const AVISO_COM_ACAO_MS = 6000;

// ---------- a GALERIA das fotos do corpo ----------
CTX.abreGaleria = function () {
  view.galeria = { foto: null, lixeira: false };
  entraNoDestino('galeria'); render(); rola(0);
  garanteBytesDoCorpo(((S.protocolo && S.protocolo.sessoes) || []).map(function (x) { return x.d; }));
};
CTX.fechaGaleria = function () { view.galeria = null; render(); saiDoDestino('galeria'); };
CTX.abreFotoDaGaleria = function (d, pose) {
  if (!view.galeria) return;
  view.galeria.foto = { d: d, pose: pose }; render(); rola(0);
  garanteBytesDoCorpo([d]);
};
CTX.fechaFotoDaGaleria = function () { if (view.galeria) { view.galeria.foto = null; render(); } };
CTX.abreLixeira = function () {
  if (!view.galeria) { view.galeria = { foto: null, lixeira: false }; entraNoDestino('galeria'); }
  view.galeria.lixeira = true; render(); rola(0);
  garanteBytesDaLixeira();
};
CTX.fechaLixeira = function () { if (view.galeria) { view.galeria.lixeira = false; render(); } };
CTX.apagaDaGaleria = async function (d, pose) {
  const ok = await apagaFotoDoCorpo(d, pose);
  if (ok && view.galeria) { view.galeria.foto = null; render(); }
  return ok;
};
CTX.restauraDaLixeira = function (k) { return restauraDaLixeira(k); };
CTX.esvaziaLixeira = async function () {
  const todos = lixeiraDeFotos().slice();
  if (!todos.length) return false;
  const sim = await pare({ texto: 'Esvaziar a lixeira apaga de vez ' + (todos.length === 1 ? 'a foto que está nela' : 'as ' + todos.length + ' fotos que estão nela') +
    ', deste aparelho e da nuvem. Isso não tem volta.', sim: 'Esvaziar a lixeira' });
  if (!sim) return false;
  for (const x of todos) await apagaDaLixeiraDeVez(x);
  await save(); render();
  toast('Lixeira vazia.');
  return true;
};

function fotoDaGaleria(d, pose, ref) {
  const p = poseDe(pose);
  return {
    d: d, pose: pose, n: p ? p.n : pose,
    hora: ref && ref.v > 1577836800000 ? horaHHMM(ref.v) : '',
    url: CORPO.urlDaFoto(d, pose, ref),
    aviso: avisoDaFoto(d, pose, !!ref, '')
  };
}
CTX.galeria = function () {
  const g = view.galeria;
  if (!g) return null;
  const agora = Date.now();
  const lx = ordemDaLixeira(lixeiraDeFotos());
  const sessoes = ((S.protocolo && S.protocolo.sessoes) || []).slice().sort(function (a, b) { return a.d < b.d ? 1 : -1; })
    .map(function (ses) {
      const lista = posesDaData(ses.d, S.protocolo.poses);
      const ids = lista.map(function (p) { return p.id; });
      Object.keys(ses.fotos || {}).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
      const fotos = ids.filter(function (id) { return ses.fotos[id]; }).map(function (id) { return fotoDaGaleria(ses.d, id, ses.fotos[id]); });
      return { d: ses.d, data: DIAS_CURTOS[new Date(instanteDaData(ses.d)).getDay()] + ' ' + fmtDate(instanteDaData(ses.d)),
               conta: fotos.length + ' de ' + lista.length, fotos: fotos };
    });
  let foto = null;
  if (g.foto) {
    const ses = sessaoDe(S.protocolo.sessoes, g.foto.d);
    const ref = ses && ses.fotos[g.foto.pose];
    if (ref) foto = Object.assign(fotoDaGaleria(g.foto.d, g.foto.pose, ref), { data: fmtDate(instanteDaData(g.foto.d)) });
  }
  return {
    sessoes: sessoes, foto: foto, naLixeira: lx.length, lixeiraAberta: !!g.lixeira,
    lixeira: lx.map(function (x) {
      const p = poseDe(x.pose), dias = diasRestantes(x, agora);
      const pd = pastaDaLixeira(x.d), pn = nomeNaLixeira(x.pose, x.ref.v);
      return {
        k: chaveDaLixeira(x), n: p ? p.n : x.pose,
        sessao: fmtDate(instanteDaData(x.d)),
        quando: (x.porque === 'refeita' ? 'substituída' : 'apagada') + ' em ' + fmtDate(x.em) + ' às ' + horaHHMM(x.em),
        restam: dias <= 1 ? 'sai de vez amanhã' : 'sai de vez em ' + dias + ' dias',
        url: CORPO.urlDaFoto(pd, pn, { v: x.ref.v, ext: x.ref.ext })
      };
    })
  };
};

CTX.apagaFotoDoCorpo = function (pose) { return apagaFotoDoCorpo(view.protocolo.d, pose); };

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
/**
 * O FIM DA SESSÃO (a D, estado 10): o tempo real do primeiro ao último disparo,
 * o que já subiu para a cópia remota, o peso daquela semana, e o que se pode
 * fazer agora — comparar com o par longo, responder a pergunta do
 * nutricionista. A próxima sessão tem data, e nada aqui vence.
 */
function fimDaSessaoDeFotos(ses) {
  const lista = posesDo(S.protocolo.poses);
  const vs = lista.map(function (p) { return ses.fotos[p.id] && ses.fotos[p.id].v; })
    .filter(function (v) { return v > 1577836800000; });
  let tempo = null;
  if (vs.length === lista.length) {
    const seg = Math.round((Math.max.apply(null, vs) - Math.min.apply(null, vs)) / 1000);
    tempo = (seg >= 60 ? Math.floor(seg / 60) + ' min ' : '') + (seg % 60) + ' s do primeiro ao último disparo';
  }
  const subiram = lista.filter(function (p) {
    const r = ses.fotos[p.id];
    return r && sync.fotos['corpo:' + ses.d + ':' + p.id] === r.v;
  }).length;
  const peso = mediaDaSemana(S.body.peso, ses.d);
  const prox = instanteDaData(ses.d) + CADENCIA_DIAS * 86400000;
  const dp = new Date(prox);
  const pose = ordemDePoses().filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0];
  const par = pose ? parPadrao(S.protocolo.sessoes, pose) : null;
  const longo = par && par.ate.d === ses.d ? par : null;
  const aval = parDaAvaliacao();
  return {
    poses: lista.length + ' de ' + lista.length + ' poses',
    tempo: tempo,
    subida: !NUVEM.sessao()
      ? 'As fotos ficam neste aparelho: sem a conta, elas não sobem.'
      : subiram === lista.length ? 'Todas na cópia remota.'
      : 'Subindo para a cópia remota: ' + subiram + ' de ' + lista.length + '. Pode fechar o app; continua depois.',
    peso: peso == null ? null : fmtDec(peso) + ' kg, a média da semana',
    comparar: longo ? 'Comparar com ' + fmtDate(instanteDaData(longo.de.d)) + ' · mesma pose, ' +
      Math.round((instanteDaData(longo.ate.d) - instanteDaData(longo.de.d)) / 86400000) + ' dias, o par longo' : null,
    pergunta: aval ? 'Responder a pergunta do nutricionista · par de ' +
      Math.round((aval.ate - aval.de) / 86400000) + ' dias' : null,
    proxima: 'A próxima sessão cai em ' + DIAS_CURTOS[dp.getDay()] + ' ' + fmtDate(prox) + '. Nada aqui vence.',
    // as medidas são feitas na mesma noite das fotos (dono, 06/11/2026)
    medir: 'Medir fita agora'
  };
}

/**
 * O FIM DA SESSÃO no visual novo: o título com a ressalva, o que mudou, as
 * fotos (com a marca das que saíram fora do padrão) e a comparação longa.
 * O resto (tempo, subida, peso, próxima) é o mesmo do fim antigo.
 */
CTX.fimDaSessaoV3 = function () {
  const v = view.protocolo;
  if (!v) return null;
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const lista = posesDo(S.protocolo.poses);
  if (!ses || completude(ses, S.protocolo.poses).faltando.length) return null;
  const base = fimDaSessaoDeFotos(ses);
  const r = ressalvaDaSessao(ses);
  const pose = ordemDePoses().filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0];
  const par = pose ? parPadrao(S.protocolo.sessoes, pose) : null;
  return {
    titulo: tituloDoFim(lista.length, lista.length, r),
    noPadrao: r.noPadrao,
    fora: r.fora.length,
    sugeridas: lista.filter(function (p) { const f = ses.fotos[p.id]; return f && f.sug && !f.enq; }).length,
    muda: r.muda.length ? 'Anotado nesta sessão: ' + textoDaMudanca(r.muda) + '. Aparece ao comparar.' : null,
    tempo: base.tempo,
    subida: base.subida,
    peso: base.peso,
    proxima: base.proxima,
    comparar: par && par.ate.d === ses.d ? 'Comparar com ' + fmtDate(instanteDaData(par.de.d)) : null,
    fotos: lista.map(function (p) {
      const f = ses.fotos[p.id];
      return { id: p.id, n: p.n, url: CORPO.urlDaFoto(ses.d, p.id, f), enq: (f && f.enq) || null,
               fora: r.fora.indexOf(p.id) >= 0 };
    })
  };
};
/** Do fim da sessão para a foto de uma pose: a câmera volta nela, para refazer. */
CTX.refazPoseDaSessao = function (id) {
  const v = view.protocolo; if (!v || !poseDe(id)) return;
  v.pose = id; v.montagem = false;
  CTX.abreCamera();
};

CTX.sessaoDeFotos = function () {
  const v = view.protocolo;
  if (!v) return null;
  const lista = posesDo(S.protocolo.poses);
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const c = completude(ses, S.protocolo.poses);

  if (v.montagem) {
    return { passo: 'montagem', meta: fmtDate(instanteDaData(v.d)), montagem: { itens: montagemDe(quemTira), quem: quemTira,
      // a ordem das poses, numa linha (a D, estado 1): a rotação é contínua,
      // sempre para a esquerda
      total: lista.length,
      ordem: lista.map(function (p, k) { return (k + 1) + ' ' + p.n.toLowerCase(); }).join(' · ') } };
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
               naoGuardada: !!(v.naoGuardada && v.naoGuardada.pose === p.id),
               adiada: !!(v.adiadas && v.adiadas[p.id] && !(ses && ses.fotos[p.id])) };
    }),
    naoGuardada: avisoDaPoseNaoGuardada(lista),
    fim: (ses && !c.faltando.length) ? fimDaSessaoDeFotos(ses) : null,
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

CTX.abreComparar = function (naPose) {
  const ordem = ordemDePoses();
  // abre na primeira pose que tem pelo menos duas sessões: abrir numa pose sem
  // par mostraria um vazio como primeira tela. A galeria pede a pose da foto.
  let pose = ordem.filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0] || ordem[0];
  if (typeof naPose === 'string' && poseDe(naPose)) pose = naPose;
  view.comparar = { pose: pose, de: null, ate: null, sobrepor: false, opacidade: 50 };
  aplicaParPadrao();
  entraNoDestino('comparar'); render();
};
/**
 * "Responder" abre a comparação no par da pergunta, e não no mais longo: com o
 * par mais longo passando de 28 dias, a pergunta não aparecia na tela que o
 * botão abria.
 */
CTX.abreAvaliacao = function () {
  const a = parDaAvaliacao();
  if (!a) { CTX.abreComparar(); return; }
  view.comparar = { pose: a.pose, de: a.dDe, ate: a.dAte, sobrepor: false, opacidade: 50 };
  garanteBytesDoCorpo([a.dDe, a.dAte]);
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
    podeComparar: posesDo(S.protocolo.poses).some(function (p) { return comAPose(S.protocolo.sessoes, p.id).length >= 2; }),
    // as pesagens, com a porta de apagar: a tela Corpo mostra só o estado
    pesagens: (S.body.peso || []).slice().sort(function (a, b) { return b.t - a.t; }).slice(0, 60).map(function (x) {
      return { t: x.t, data: fmtDate(x.t), hora: horaHHMM(x.t), valor: fmtDec(x.v) + ' kg' };
    })
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

/**
 * Apagar a foto que está à vista, num dos lados do par. A pose é a da tela; a
 * data é a do lado tocado.
 *
 * Se a foto era uma das pontas do par, o par volta ao padrão: a tela não pode
 * continuar comparando com uma foto que não existe mais, e o padrão é o par
 * que ela abriria agora. Sem par possível, ela mostra o vazio que já sabe
 * mostrar.
 */
CTX.apagaFotoComparada = async function (d) {
  const c = view.comparar;
  if (!c) return;
  if (!(await apagaFotoDoCorpo(d, c.pose))) return;
  if (view.comparar && (view.comparar.de === d || view.comparar.ate === d)) { aplicaParPadrao(); render(); }
};

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
    // a hora da foto (decisão do dono, 14/10): manhã em jejum e noite depois de
    // comer mudam a barriga, e a comparação diz quando cada uma foi tirada.
    // Referência antiga, sem instante de verdade, fica sem hora.
    hora: ref && ref.v > 1577836800000 ? fmtHoraDita(ref.v) : null,
    url: ref ? CORPO.urlDaFoto(d, pose, ref) : null,
    // a referência existe, mesmo que os bytes não tenham chegado: é o que
    // decide se dá para apagar — uma foto que não baixa também precisa de saída
    tem: !!ref,
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

// ---------- as fotos no visual novo: o que as telas de consulta leem ----------

/** A ressalva de uma sessão pela data, pronta para o selo. */
function seloDaData(d) {
  const r = ressalvaDaSessao(d ? sessaoDe(S.protocolo.sessoes, d) : null);
  return { noPadrao: r.noPadrao, txt: seloDaSessao(r) };
}

/** A comparação, com a ressalva de cada data ao lado (o selo por data do lote 1). */
CTX.comparacaoV3 = function () {
  const c = view.comparar;
  if (!c) return null;
  const base = CTX.comparacao();
  const dias = base.par ? Math.abs(Math.round((instanteDaData(c.ate) - instanteDaData(c.de)) / 86400000)) : null;
  return Object.assign(base, {
    dias: dias,
    modo: base.cortina ? 'cortina' : base.sobrepor ? 'sobre' : 'lado',
    seloDe: seloDaData(c.de), seloAte: seloDaData(c.ate),
    datas: base.datas.map(function (x) { return Object.assign({}, x, { noPadrao: seloDaData(x.d).noPadrao }); })
  });
};
/**
 * "MANDAR PARA OS AGENTES": o par em tela vai para a pasta deles
 * (`corpo/para-avaliar.md`), só esta pose ou as onze. Mandar de novo o mesmo
 * par só renova a data do pedido.
 */
CTX.mandaParaOsAgentes = function (qual) {
  const c = view.comparar;
  if (!c || !c.de || !c.ate) return;
  const de = c.de < c.ate ? c.de : c.ate, ate = c.de < c.ate ? c.ate : c.de;
  const pedido = { pose: qual === 'todas' ? 'todas' : c.pose, de: de, ate: ate, t: Date.now() };
  const k = function (p) { return p.pose + '|' + p.de + '|' + p.ate; };
  S.paraAvaliar = (S.paraAvaliar || []).filter(function (p) { return k(p) !== k(pedido); }).concat([pedido]).slice(-TETO_PEDIDOS);
  queueSave(); render();
  toast(qual === 'todas' ? 'As onze poses das duas sessões vão para os agentes.' : 'O par vai para os agentes.');
};
/** O pedido já feito deste par, para a tela dizer quando foi mandado. */
CTX.pedidoDoPar = function () {
  const c = view.comparar;
  if (!c || !c.de || !c.ate) return null;
  const de = c.de < c.ate ? c.de : c.ate, ate = c.de < c.ate ? c.ate : c.de;
  const p = (S.paraAvaliar || []).filter(function (x) { return x.de === de && x.ate === ate && (x.pose === c.pose || x.pose === 'todas'); }).pop();
  return p ? { quando: fmtDate(p.t), todas: p.pose === 'todas' } : null;
};
CTX.setModoDaComparacao = function (m) {
  const c = view.comparar; if (!c) return;
  c.cortina = m === 'cortina'; c.sobrepor = m === 'sobre';
  render();
};
/** O toque numa sessão da linha: troca a ponta do par mais perto dela. */
CTX.tocaSessaoComparada = function (d) {
  const c = view.comparar; if (!c) return;
  const datas = comAPose(S.protocolo.sessoes, c.pose).map(function (s) { return s.d; });
  const ponta = pontaParaTrocar(datas, c.de, c.ate, d);
  if (ponta) CTX.setDataComparada(ponta, d);
};

/**
 * NO TEMPO: as sessões de uma pose, em ordem, como um filme. Mesmo lugar e
 * mesma distância, o corpo fica parado e só a mudança aparece.
 */
CTX.abreNoTempo = function (pose) {
  const ordem = ordemDePoses();
  const p = typeof pose === 'string' && poseDe(pose) ? pose
    : ordem.filter(function (id) { return comAPose(S.protocolo.sessoes, id).length >= 2; })[0] || ordem[0];
  const n = comAPose(S.protocolo.sessoes, p).length;
  view.noTempo = { pose: p, i: Math.max(0, n - 1) };
  entraNoDestino('noTempo'); render(); rola(0);
  garanteBytesDoCorpo(comAPose(S.protocolo.sessoes, p).map(function (s) { return s.d; }));
};
CTX.fechaNoTempo = function () { view.noTempo = null; render(); saiDoDestino('noTempo'); };
CTX.setPoseNoTempo = function (id) {
  const t = view.noTempo; if (!t || !poseDe(id)) return;
  const ses = comAPose(S.protocolo.sessoes, id);
  t.pose = id; t.i = Math.max(0, ses.length - 1);
  garanteBytesDoCorpo(ses.map(function (s) { return s.d; }));
  render();
};
CTX.setIndiceNoTempo = function (i) {
  const t = view.noTempo; if (!t) return;
  const n = comAPose(S.protocolo.sessoes, t.pose).length;
  t.i = Math.max(0, Math.min(n - 1, Math.round(Number(i) || 0)));
  render();
};
CTX.noTempoV3 = function () {
  const t = view.noTempo; if (!t) return null;
  const sessoes = comAPose(S.protocolo.sessoes, t.pose).map(function (s) {
    const f = s.fotos[t.pose];
    const peso = mediaDaSemana(S.body.peso, s.d);
    const sel = seloDaData(s.d);
    return { d: s.d, txt: fmtDate(instanteDaData(s.d)), url: CORPO.urlDaFoto(s.d, t.pose, f), enq: (f && f.enq) || null,
             peso: peso == null ? null : fmtDec(peso) + ' kg', noPadrao: sel.noPadrao, selo: sel.txt };
  });
  return {
    poses: posesDo(S.protocolo.poses).map(function (p) { return { k: p.id, t: p.n }; }),
    pose: t.pose, i: Math.min(t.i, Math.max(0, sessoes.length - 1)), sessoes: sessoes
  };
};

/**
 * O ALINHAMENTO SUGERIDO: aceitar grava a sugestão como o ajuste da foto,
 * marcado como do app; dispensar só apaga a sugestão. O arquivo não muda.
 */
function trocaRefDaFoto(d, pose, muda) {
  const ses = sessaoDe(S.protocolo.sessoes, d);
  const ref = ses && ses.fotos[pose];
  if (!ref || !ref.sug) return false;
  const novo = Object.assign({}, ref);
  muda(novo);
  delete novo.sug;
  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[pose] = novo;
  ses.m = Date.now();
  queueSave(); render();
  return true;
}
CTX.aceitaAlinhamento = function (d, pose) {
  if (trocaRefDaFoto(d, pose, function (r) { r.enq = Object.assign(normalizaEnq(r.sug), { m: Date.now(), auto: 1 }); })) {
    toast('Foto alinhada. "Original" no ajuste desfaz.');
  }
};
CTX.dispensaAlinhamento = function (d, pose) { trocaRefDaFoto(d, pose, function () {}); };

/** A galeria, com o selo de cada sessão e o ajuste de cada foto. */
CTX.galeriaV3 = function () {
  const g = CTX.galeria();
  if (!g) return null;
  const enq = function (d, pose) {
    const s = sessaoDe(S.protocolo.sessoes, d);
    const f = s && s.fotos[pose];
    return (f && f.enq) || null;
  };
  g.sessoes = g.sessoes.map(function (s) {
    return Object.assign(s, { selo: seloDaData(s.d), fotos: s.fotos.map(function (f) { return Object.assign(f, { enq: enq(f.d, f.pose) }); }) });
  });
  if (g.foto) {
    const ses = g.sessoes.filter(function (s) { return s.d === g.foto.d; })[0];
    const i = ses ? ses.fotos.findIndex(function (f) { return f.pose === g.foto.pose; }) : -1;
    const sessao = sessaoDe(S.protocolo.sessoes, g.foto.d);
    const ref = sessao && sessao.fotos[g.foto.pose];
    const r = ressalvaDaSessao(sessao);
    const fora = ref && ref.cap && Array.isArray(ref.cap.fora) ? ref.cap.fora : [];
    const peso = mediaDaSemana(S.body.peso, g.foto.d);
    Object.assign(g.foto, {
      enq: enq(g.foto.d, g.foto.pose),
      // a sugestão do app, só quando a foto ainda não tem ajuste
      sug: ref && ref.sug && !ref.enq ? normalizaEnq(ref.sug) : null,
      indice: i + 1, total: ses ? ses.fotos.length : 0,
      anterior: ses && i > 0 ? ses.fotos[i - 1].pose : null,
      proxima: ses && i >= 0 && i < ses.fotos.length - 1 ? ses.fotos[i + 1].pose : null,
      peso: peso == null ? null : fmtDec(peso) + ' kg na semana',
      ressalva: fora.length ? 'Esta foto saiu fora do padrão: ' + nomesDoFora(fora) + '.'
        : r.muda.length ? 'Sessão com ressalva: ' + textoDaMudanca(r.muda) + '.'
        : r.noPadrao ? 'No padrão.' : 'A foto no padrão; outra da sessão saiu fora.'
    });
  }
  return g;
};

/**
 * O CENTRO DAS FOTOS: a próxima sessão, a última e as três entradas
 * (comparar, no tempo, galeria). Destino a partir de Corpo.
 */
CTX.abreCentroDasFotos = function () {
  view.fotos = true; entraNoDestino('fotos'); render(); rola(0);
  const u = ultimaSessaoFoto(S.protocolo.sessoes);
  if (u) garanteBytesDoCorpo([u.d]);
};
CTX.fechaCentroDasFotos = function () { view.fotos = null; render(); saiDoDestino('fotos'); };
CTX.centroDasFotosV3 = function () {
  if (!view.fotos) return null;
  const sessoes = (S.protocolo.sessoes || []).filter(function (s) { return Object.keys(s.fotos || {}).length; });
  const u = ultimaSessaoFoto(sessoes);
  const desde = diasDesdeAFoto(sessoes, Date.now());
  const faltam = desde == null ? null : CADENCIA_DIAS - desde;
  const prox = u ? new Date(instanteDaData(u.d) + CADENCIA_DIAS * 86400000) : null;
  const lista = posesDo(S.protocolo.poses);
  const fotos = sessoes.reduce(function (n, s) { return n + Object.keys(s.fotos).length; }, 0);
  const ressalva = u ? ressalvaDaSessao(u) : null;
  const hoje = sessaoDe(S.protocolo.sessoes, hojeISO());
  const pares = ordemDePoses().filter(function (id) { return comAPose(sessoes, id).length >= 2; }).length;
  return {
    nenhuma: !u,
    hojePelaMetade: !!(hoje && completude(hoje, S.protocolo.poses).faltando.length && Object.keys(hoje.fotos).length),
    titulo: !u ? 'A primeira sessão' : faltam > 1 ? 'Próxima em ' + faltam + ' dias' : faltam === 1 ? 'Próxima amanhã' : faltam === 0 ? 'Hoje é dia' : 'Passou ' + (-faltam) + (faltam === -1 ? ' dia' : ' dias'),
    quando: u ? 'a cada ' + CADENCIA_DIAS + ' dias · a última foi ' + (desde === 0 ? 'hoje' : desde === 1 ? 'ontem' : 'há ' + desde) : 'a cada ' + CADENCIA_DIAS + ' dias',
    apoio: !u ? 'São ' + lista.length + ' fotos, uns 4 minutos. Daqui a duas semanas nasce a primeira comparação.'
      : (faltam > 0 ? DIAS_LONGOS[prox.getDay()] + ', ' + fmtDate(prox.getTime()) + '. Dá para fazer antes, se quiser: a comparação usa a data de cada sessão.'
        : 'Nada aqui vence: a sessão entra com a data em que for feita.'),
    ultima: u ? {
      txt: fmtDate(instanteDaData(u.d)),
      selo: seloDaSessao(ressalva), noPadrao: ressalva.noPadrao,
      fotos: lista.filter(function (p) { return u.fotos[p.id]; }).slice(0, 6).map(function (p) {
        const f = u.fotos[p.id];
        return { id: p.id, n: p.n, url: CORPO.urlDaFoto(u.d, p.id, f), enq: (f && f.enq) || null };
      })
    } : null,
    comparar: pares ? 'duas datas da mesma pose, de três jeitos' : null,
    noTempo: sessoes.length >= 2 ? 'as ' + sessoes.length + ' sessões de uma pose, em sequência' : null,
    galeria: fotos + (fotos === 1 ? ' foto' : ' fotos') + ' em ' + sessoes.length + (sessoes.length === 1 ? ' sessão' : ' sessões') +
      ' · lixeira ' + (lixeiraDeFotos().length ? 'com ' + lixeiraDeFotos().length : 'vazia')
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
      confirmar = { dia: m.day, inicio: m.t - m.dur, fim: m.t, sid: m.sid };
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
 * As refeições do plano numa data passada. Dia sem linha: o tipo vem da mesma
 * autoridade do fecho — com sessão registrada naquele dia, é treino, e entram o
 * pré-treino e o intra. Uma regra só para o "pôr o dia em dia" e para a
 * resposta do dia.
 */
function refeicoesDaData(data, linha) {
  const cadencia = linha && linha.cadencia ? linha.cadencia : tipoDoDiaDeComida(data, null);
  return refeicoesDeHoje(planoDeComida(), cadencia === 'treino',
                         !!(linha && linha.alta), linha && linha.turno,
                         duracaoDoTreino());
}

/**
 * A RESPOSTA DO DIA: "a comida foi como o plano?" (direção 3).
 *
 * `resposta` é `sim`, `quase` ou `naosei` (`comidaDaResposta`,
 * dominio/nutricao/calculo.ts). Hoje escreve no dia aberto; uma data passada
 * passa por `poeComidaNoDia`, o mesmo caminho do "pôr o dia em dia", que
 * completa o dia sem apagar o que já estava. Data futura não aceita.
 *
 * Devolve `{ ok, resposta }` e não desenha: quem chama decide o que mostrar.
 */
CTX.respondeODia = function (data, resposta) {
  if (resposta !== 'sim' && resposta !== 'quase' && resposta !== 'naosei') return { ok: false };
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return { ok: false };
  const hoje = hojeISO();
  if (data > hoje) return { ok: false };
  const agora = Date.now();
  if (data === hoje) {
    const d = diaDeComida();
    const h = diaResolvido();
    const refs = refeicoesDeHoje(planoDeComida(), h.cadencia === 'treino', !!d.alta, d.turno, duracaoDoTreino());
    const c = comidaDaResposta(resposta, refs, d.done, agora);
    d.done = Object.assign({}, d.done || {}, c.done || {});
    if (c.aderencia === 'plano') delete d.aderencia; else d.aderencia = c.aderencia;
    d.pordia = 1;
    queueSave(); render();
    return { ok: true, resposta: resposta };
  }
  const hist = Array.isArray(S.comidaHist) ? S.comidaHist : [];
  const linha = hist.filter(function (x) { return x && x.d === data; })[0] || null;
  const c = comidaDaResposta(resposta, refeicoesDaData(data, linha), linha && linha.done, agora);
  const r = poeComidaNoDia(hist, data, c, planoDeComida(), catalogoAlimentos(), hoje,
                           versaoDoPlano(), null, agora);
  if (r.recusa) return { ok: false, recusa: r.recusa };
  S.comidaHist = r.hist;
  queueSave(); render();
  return { ok: true, resposta: resposta };
};

/**
 * A PERGUNTA DA NOITE, com "Desfazer": o bloco passa a "dia fechado" na hora, e
 * o toque errado não teria volta no lugar. O desfazer desmarca pelo caminho de
 * sempre (`marcaLinhaDaComida(…, 'desfaz')`, que deixa a lápide para a fusão)
 * só as refeições que a resposta marcou, e devolve a aderência de antes.
 */
CTX.respondeHojeComDesfazer = function (resposta) {
  const d = diaDeComida();
  const antes = Object.keys(d.done || {});
  const ader = d.aderencia, pordia = d.pordia;
  const r = CTX.respondeODia(hojeISO(), resposta);
  if (!r || !r.ok) return r;
  const novas = Object.keys(diaDeComida().done || {}).filter(function (id) { return antes.indexOf(id) < 0; });
  const frase = { sim: 'Hoje: foi como o plano.', quase: 'Hoje: quase como o plano.', naosei: 'Hoje fica fora da conta.' }[resposta];
  avisoComAcao(frase, 'Desfazer', function () {
    novas.forEach(function (id) { CTX.marcaLinhaDaComida(id, 'desfaz'); });
    const d2 = diaDeComida();
    if (ader === undefined) delete d2.aderencia; else d2.aderencia = ader;
    if (pordia === undefined) delete d2.pordia; else d2.pordia = pordia;
    queueSave(); render();
  });
  return r;
};

/** A resposta que uma data já tem (`sim`, `quase`, `naosei`), ou `null`. */
CTX.respostaDoDia = function (data) {
  if (data === hojeISO()) return respostaDoDia(S.dia && S.dia.data === data ? S.dia : null);
  const linha = (Array.isArray(S.comidaHist) ? S.comidaHist : []).filter(function (x) { return x && x.d === data; })[0];
  return respostaDoDia(linha);
};

/**
 * O QUE APARECE (dominio/modulos.ts). Desligar esconde, nunca apaga. Grava no
 * estado sincronizado: é preferência da pessoa, a mesma em todo aparelho.
 */
CTX.moduloLigado = function (k) { return ligado(S.modulos, k); };
CTX.ligaModulo = function (k, on) { S.modulos = normalizaModulos(comModulo(S.modulos, k, !!on)); queueSave(); render(); };
CTX.fitaLigada = function (k) {
  const m = MEDIDAS_DE_FITA.filter(function (x) { return x.k === k; })[0];
  return fitaLigada(S.modulos, k, !!(m && m.fita === 'ligada'), !!(S.body[k] && S.body[k].length));
};
CTX.ligaFita = function (k, on) { S.modulos = normalizaModulos(comFita(S.modulos, k, !!on)); queueSave(); render(); };

CTX.abrePoeODia = function (data) { CTX.abreFolha({ k: 'poeODia', data: data }); };

CTX.poeODiaEmDia = function (data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const hoje = hojeISO();
  if (data > hoje) return null;

  const linha = (Array.isArray(S.comidaHist) ? S.comidaHist : [])
    .filter(function (h) { return h && h.d === data; })[0] || null;
  const refs = refeicoesDaData(data, linha);
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
        // o tamanho do "comi outra coisa", quando foi dito (só lido aqui: o pôr
        // em dia não pergunta o tamanho, e a fusão do chão o preserva)
        tam: marcada && como === 'fora' && linha.tam ? linha.tam[r.id] || null : null,
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
  // só dia passado: hoje é o dia aberto (`marcaRefeicao`), e a lápide daqui usaria
  // a mesma chave da marca dele, que a fusão seguinte apagaria
  if (typeof data === 'string' && data >= hojeISO()) return { ok: false, recusa: data > hojeISO() ? 'futuro' : 'hoje' };
  const d = CTX.poeODiaEmDia(data);
  if (!d) return { ok: false, recusa: 'data' };

  const done = {}, como = {}, esc = {};
  const agora = Date.now();
  const linhaHoje = (Array.isArray(S.comidaHist) ? S.comidaHist : []).filter(function (x) { return x && x.d === data; })[0] || null;
  const chave = chaveDeRefeicaoFeita(data, id);
  // A linha tocada que já tinha marca e muda é "desmarcar e marcar de novo",
  // como no Hoje: a marca velha morre com lápide e a nova nasce depois dela. É
  // a lápide que leva a correção ao outro aparelho, que ainda tem a velha (a
  // fusão fica com a marca de cada lado; ver `uneDiasDeComida`). A lápide só é
  // escrita depois de o dia gravar.
  let morte = null;
  d.linhas.forEach(function (l) {
    // Só a linha tocada e as sugeridas (o primeiro toque grava o dia inteiro
    // como está sugerido). As outras marcas do dia ficam como estão, com a hora
    // delas: recarimbá-las fazia este toque valer sobre a correção que o outro
    // aparelho fez em outra refeição, e apagava o "como" que uma versão mais
    // nova do app tivesse gravado (revisão de dado, 18/11/2026).
    if (l.id !== id && !l.sugerida) return;
    const m = l.id === id ? marca : l.marca;
    let e = l.id === id ? (escala == null ? l.escala : escala) : l.escala;
    // "Tudo" sobre "Metade": a porção volta a cheia. Dita como 1, e não como
    // ausente: ausência não vence o ½ guardado no merge do chão
    const cheia = l.id === id && marca === 'tudo' && escala == null && l.marca === 'metade';
    if (cheia) e = 1;
    // Linha que o dia declarou SEM marca fica sem marca: ela não entra, e o
    // merge do chão preserva o que já estava. O que não existe é a volta —
    // nenhuma marca sai daqui.
    if (m === 'vazia') return;
    const tinha = l.id === id && !l.sugerida && l.marca !== 'vazia';
    if (tinha) {
      // o mesmo toque de novo não muda nada, e não vira lápide
      if (m === l.marca && (m === 'metade' || (e == null ? 1 : e) === l.escala)) return;
      const velha = linhaHoje && linhaHoje.done ? linhaHoje.done[id] : 0;
      morte = Math.max(agora, typeof velha === 'number' ? velha : 0, (S.apagados || {})[chave] || 0);
    }
    // nunca igual nem anterior à lápide da refeição (como em `marcaRefeicao`)
    const morta = (S.apagados || {})[chaveDeRefeicaoFeita(data, l.id)] || 0;
    done[l.id] = tinha ? morte + 1 : Math.max(agora, morta + 1);
    // "Tudo" e "Metade" tiram o "fora", o "não sei" ou o "não comi" que a
    // linha tocada tinha (`null`): sem isso a marca nova não vencia a antiga
    if (m === 'fora' || m === 'nao' || m === 'nsei') como[l.id] = m;
    else if (l.id === id) como[l.id] = null;
    if (m === 'metade') esc[l.id] = 0.5;
    else if (e != null && (e !== 1 || cheia)) esc[l.id] = e;
  });
  if (!Object.keys(done).length) { render(); return { ok: true }; }

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
  if (morte != null) lapide(chave, morte);
  await save();
  render();
  return { ok: true };
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

// ---------- O HOJE no visual novo (Fase 4) ----------
// O bloco do momento sai da mesma regra (`cartaoDeCima`, em dominio/agora.ts);
// a linha do dia, o "se quiser" e o ritmo leem o que o Agora antigo lê. Nada
// aqui grava: as ações são as de sempre (`marcaLinhaDaComida`, `maisUmCopo`,
// `respondeODia`…).

/** A data de hoje, 'AAAA-MM-DD', para quem responde o dia. */
CTX.hojeISO = function () { return hojeISO(); };

/** Uma refeição de hoje, para a folha do visual novo. */
/** "250 g arroz branco cozido" → { n: 'Arroz branco cozido', q: '250 g' }. */
function separaQuantidade(item) {
  const m = /^([\d.,]+\s*(?:g|ml|kg|un\.?|unidades?|colheres?(?: de sopa| de chá)?|fatias?|xícaras?)?)\s+(.*)$/i.exec(item);
  if (!m) return { n: maiuscula(item), q: '' };
  return { n: maiuscula(m[2]), q: m[1] };
}
/** O apoio do bloco da refeição: "Arroz, feijão, frango e mais 3." */
function nomesDaRefeicao(resumo) {
  const nomes = String(resumo || '').split(' · ').filter(Boolean).map(function (x) { return separaQuantidade(x).n.split(/\s+/)[0].toLowerCase(); });
  if (!nomes.length) return '';
  const tres = nomes.slice(0, 3), resto = nomes.length - tres.length;
  const t = tres.join(', ');
  return maiuscula(t) + (resto ? ' e mais ' + resto : '') + '.';
}
CTX.refeicaoV3 = function (id) {
  const H = CTX.hoje();
  const r = H.refs.filter(function (x) { return x.id === id; })[0];
  if (!r) return null;
  const d = H.comidaDoDia;
  const esc = d.escala[id] != null ? d.escala[id] : 1;
  return { id: id, n: r.n, t: r.t, kcal: Math.round(totalDaRefeicao(r, H.catalogo, H.alta).kcal * esc),
           itens: resumoDaRefeicao(r, H.catalogo, H.alta, esc).split(' · ').filter(Boolean).map(separaQuantidade),
           feita: !!d.done[id], como: d.como ? d.como[id] || null : null,
           tam: d.tam ? d.tam[id] || null : null, metade: esc === 0.5, nota: r.nota || null };
};

/** O "+": a folha de registrar, com o mais provável primeiro e o texto livre. */
CTX.abreRegistrar = function () { CTX.abreFolha({ k: 'registrar' }); };
/**
 * O texto livre do "+": grava só o que `interpretaTexto` entendeu com certeza,
 * pelas portas de sempre (a refeição como "comi tudo", os copos, o peso de
 * hoje), e devolve a frase do que guardou, ou `null` se não entendeu nada.
 */
CTX.registraTextoV3 = async function (texto) {
  const H = CTX.hoje();
  const refs = H.refs.filter(function (r) { return !ehLinhaDeTreino(r); }).map(function (r) { return { id: r.id, n: r.n }; });
  const e = interpretaTexto(texto, refs);
  if (!entendeuAlgo(e)) return null;
  const fez = [];
  const d = H.comidaDoDia;
  e.refeicoes.forEach(function (id) {
    if (d.done[id]) return;
    CTX.marcaRefeicao(id);
    fez.push(refs.filter(function (r) { return r.id === id; })[0].n.toLowerCase());
  });
  if (e.copos) { const ag = CTX.agua(); CTX.setAgua(ag.n + e.copos); fez.push(e.copos === 1 ? '1 copo' : e.copos + ' copos'); }
  if (e.peso) { await CTX.pesaHoje(e.peso); fez.push('peso ' + fmtDec(e.peso) + ' kg'); }
  render();
  return fez.length ? 'Guardado: ' + fez.join(', ') + '.' : 'Já estava guardado.';
};

/** A pergunta da noite: depois das 20h, refeições que passaram sem resposta. */
const HORA_DA_PERGUNTA = 20 * 60;
CTX.hojeV3 = function () {
  const agora = Date.now();
  const agoraMin = new Date(agora).getHours() * 60 + new Date(agora).getMinutes();
  const H = CTX.hoje();
  const d = H.comidaDoDia;
  const cat = H.catalogo;
  const cartao = cartaoDeCima(CTX.fatosDoDia());
  // sem a comida (desligada em "O que aparece"), o dia é só o treino
  const comOn = ligado(S.modulos, 'comida');
  const diaT = H.diaHoje.treino;
  const linha = H.refs.filter(function (r) { return comOn || ehLinhaDeTreino(r); }).map(function (r) {
    const treinoL = ehLinhaDeTreino(r);
    const m = minutosDe(r.t);
    const emCurso = !!(cartao && cartao.k === 'sessao');
    const feita = treinoL ? !emCurso && !!(H.sessao.registrada || H.sessao.fechada) : !!d.done[r.id];
    const agoraNela = cartao && ((cartao.k === 'refeicao' && cartao.id === r.id) ||
      (treinoL && (cartao.k === 'treino' || cartao.k === 'aula' || cartao.k === 'sessao')));
    return { id: r.id, t: r.t, n: treinoL ? (diaT ? (diaAberto(diaT) ? 'Aula do box' : 'Treino ' + diaT) : 'Treino') : r.n, treino: treinoL,
             series: treinoL ? H.sessao.prescritas : null,
             feita: feita, como: d.como ? d.como[r.id] || null : null, agora: !!agoraNela,
             falta: !feita && !agoraNela && agoraMin - m >= 60,
             kcal: treinoL ? null : Math.round(totalDaRefeicao(r, cat, H.alta).kcal) };
  });
  const prox = linha.filter(function (x) { return !x.feita && minutosDe(x.t) > agoraMin; })[0] || null;
  const passaram = linha.filter(function (x) { return !x.treino && !x.feita && agoraMin - minutosDe(x.t) >= 60; }).length;
  const respondido = respostaDoDia(d);
  // o bloco do momento, a partir do cartão da regra
  let bloco;
  if (cartao && cartao.k === 'sessao') {
    const fP = treino(cartao.dia) ? serieEmFoco(cartao.dia) : null;
    const exP = fP ? treino(cartao.dia).ex[fP.i] : null;
    const sA = S.sessao;
    bloco = { k: 'sessao', cor: 'treino', vivo: !cartao.pergunta,
              quando: cartao.pergunta ? 'parado há ' + fmtDur(paradaDaSessao(sA)) : 'em andamento' + (sA ? ' · ' + fmtDur(duracaoAtual(sA)) : ''),
              titulo: 'Treino ' + cartao.dia,
              apoio: cartao.pergunta && sA
                ? 'A última série foi às ' + horaHHMM(sA.ultima || sA.inicio).replace(':', 'h') + '. Ainda está treinando?'
                : cartao.guardadas + ' de ' + cartao.prescritas + ' séries guardadas.' + (exP ? ' A próxima é ' + exP.n.toLowerCase() + '.' : ''),
              sub: cartao.guardadas + ' de ' + cartao.prescritas,
              pergunta: cartao.pergunta ? (CTX.faixaDaSessao() || {}).txt || null : null };
  } else if (cartao && cartao.k === 'confirmar') {
    const hh = function (t) { return horaHHMM(t).replace(':', 'h'); };
    bloco = { k: 'confirmar', cor: 'corpo', quando: sameDay(cartao.fim, agora) ? 'o treino de hoje cedo' : 'o treino de ontem', titulo: 'Treino ' + cartao.dia,
              apoio: 'Fechou sozinho na última série: das ' + hh(cartao.inicio) + ' às ' + hh(cartao.fim) + ', ' + fmtDur(cartao.fim - cartao.inicio) + '. Está certo?',
              fim: cartao.fim, sid: cartao.sid };
  } else if (cartao && cartao.k === 'treino' && proximoQueComecaHoje(agora)) {
    // um programa de "Próximo" cujo dia chegou: o Hoje pergunta ANTES de oferecer
    // o treino do programa de agora, e nunca troca sozinho
    const px = proximoQueComecaHoje(agora), Pg = programasDe(S);
    bloco = { k: 'programa', id: px.id, cor: 'treino', quando: 'começa hoje',
              titulo: px.nome, apoio: 'Ele estava em “Próximo”. Até você dizer, segue o ' + (Pg ? Pg.lista[Pg.ativo].nome : 'de agora') + '.' };
  } else if (cartao && (cartao.k === 'treino' || cartao.k === 'aula')) {
    const l = linha.filter(function (x) { return x.treino; })[0];
    const falta = l ? minutosDe(l.t) - agoraMin : null;
    const minutos = duracaoDoTreino();
    const estimativa = minutos < 50 ? '45 min' : minutos <= 70 ? 'uma hora' : '1h15';
    // o primeiro dia de um programa ganha um marco, uma vez (protótipo de Programas, "Hoje, 1º dia")
    const Pg = programasDe(S), iniP = Pg ? inicioDoAtivo(S) : 0;
    const primeiroDia = cartao.k === 'treino' && !!Pg && iniP > 0 && sameDay(iniP, agora) &&
      !sessoesDoAtivo(S).some(function (x) { return !x.livre && x.day; });
    bloco = { k: cartao.k, cor: cartao.k === 'aula' ? 'corpo' : 'treino', vivo: true,
              marco: primeiroDia ? 'Começa o ' + Pg.lista[Pg.ativo].nome + ' · semana 1' : null,
              quando: primeiroDia ? 'o primeiro' : falta == null ? 'hoje' : falta > 0 ? 'daqui a ' + falta + ' min' : 'agora',
              titulo: cartao.k === 'aula' ? 'Aula do box' : 'Treino ' + cartao.dia,
              apoio: cartao.k === 'aula' ? 'Anote no fim, um número por movimento. Ou repita a última aula.'
                : (H.sessao.nome ? H.sessao.nome + '. ' : '') +
                  (treino(cartao.dia) ? treino(cartao.dia).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) + ' séries' +
                    ', perto de ' + estimativa + '.' : ''),
              sub: cartao.k === 'aula' ? (l ? 'hoje, ' + l.t.replace(':', 'h') : 'hoje') : (treino(cartao.dia) ? treino(cartao.dia).ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) + ' séries' : '') };
  } else if (comOn && agoraMin >= HORA_DA_PERGUNTA && passaram && !respondido) {
    // de noite, a pergunta do dia vem antes da próxima refeição (o protótipo)
    bloco = { k: 'noite', cor: 'corpo', quando: passaram + (passaram === 1 ? ' refeição ficou' : ' refeições ficaram') + ' sem resposta',
              titulo: 'A comida de hoje foi como o plano?' };
  } else if (comOn && cartao && cartao.k === 'refeicao') {
    const r = H.refs.filter(function (x) { return x.id === cartao.id; })[0];
    const falta = minutosDe(r.t) - agoraMin;
    bloco = { k: 'refeicao', cor: 'refeicao', vivo: true, id: r.id,
              quando: falta > 0 ? 'daqui a ' + falta + ' min' : falta === 0 ? 'agora' : 'era às ' + r.t.replace(':', 'h'),
              titulo: r.n, apoio: nomesDaRefeicao(resumoDaRefeicao(r, cat, H.alta, d.escala[r.id] != null ? d.escala[r.id] : 1)),
              sub: r.t.replace(':', 'h') + ' · ' + Math.round(totalDaRefeicao(r, cat, H.alta).kcal) + ' kcal',
              pergunta: view.perguntaDe === r.id };
  } else if (S.primeiraVez && !rot().length && !prox) {
    bloco = { k: 'semTreino', cor: 'treino', quando: 'ainda sem treino', titulo: 'Nada para agora.',
                apoio: 'Quando houver um treino no app, o próximo aparece aqui, com um botão só.' };
  } else {
    bloco = { k: 'livre', cor: 'feito', fino: true, quando: H.diaHoje.cadencia === 'treino' ? 'tudo em dia' : 'dia de descanso',
              titulo: prox ? 'Livre até as ' + prox.t.replace(':', 'h') : 'Dia fechado',
              apoio: prox ? 'O próximo é ' + (/^ceia/i.test(prox.n) ? 'a ' : 'o ') + prox.n.toLowerCase() + '. Ele aparece aqui meia hora antes.' : 'Nada mais para hoje.' };
  }
  // os últimos sete dias: treino e comida de cada um
  const ritmo = [];
  for (let i = 6; i >= 0; i--) {
    const t = agora - i * 86400000;
    const data = hojeISO(t);
    const m = (S.done || []).filter(function (x) { return x && !x.livre && sameDay(x.t, t); })[0];
    const r = CTX.respostaDoDia(data);
    const hist = (S.comidaHist || []).filter(function (h) { return h.d === data; })[0];
    const ader = hist?.aderencia;
    ritmo.push({ data: data, letra: DIAS_CURTOS[new Date(t).getDay()].charAt(0).toUpperCase(), nome: DIAS_LONGOS[new Date(t).getDay()],
                 treino: m ? m.day : null, hoje: i === 0, emBranco: !r && !Object.keys(hist?.done || {}).length && (!ader || ader === 'plano'),
                 comida: !comOn ? null : r === 'sim' || ader === 'plano' ? 'cheia' : r === 'quase' || ader === 'fora' ? 'meia' : 'vazia' });
  }
  const ontem = hojeISO(agora - 86400000);
  const hOntem = (S.comidaHist || []).filter(function (h) { return h.d === ontem; })[0];
  const ontemEmBranco = comOn && !!hOntem && !CTX.respostaDoDia(ontem) && !Object.keys(hOntem.done || {}).length;
  const ag = CTX.agua();
  const pesoHoje = (S.body.peso || []).filter(function (x) { return sameDay(x.t, agora); }).slice(-1)[0];
  const semana = weekStart(agora);
  const cardioSemana = (S.cardio || []).filter(function (x) { return x.t >= semana; }).length;
  return {
    data: DIAS_LONGOS[new Date(agora).getDay()] + ', ' + new Date(agora).getDate() + ' ' + MESES[new Date(agora).getMonth()].slice(0, 3), hora: horaHHMM(agora),
    // o tipo do dia, que a folha `dia` confirma ou corrige
    tipo: diaResolvido().cadencia === 'descanso' ? 'descanso' : 'treino',
    bloco: bloco,
    linha: linha, feitas: linha.filter(function (x) { return x.feita; }).length,
    proxima: prox ? { n: prox.n, t: prox.t, kcal: prox.kcal } : null,
    seQuiser: {
      agua: ligado(S.modulos, 'agua') ? { n: ag.n, meta: COPOS_DO_DIA } : null,
      peso: ligado(S.modulos, 'peso') ? { hoje: pesoHoje ? fmtDec(pesoHoje.v) : null } : null,
      cardio: ligado(S.modulos, 'cardio') ? { n: cardioSemana, meta: 2 } : null
    },
    ritmo: ritmo,
    temHistorico: !!(S.done.length || S.comidaHist.length),
    ontem: ontemEmBranco ? ontem : null,
    comida: comOn,
    lembrete: lembreteDasFotos(agora)
  };
};

/**
 * O LEMBRETE DAS FOTOS, dentro do app (decisão do dono, 17/11/2026: o aviso no
 * celular fica para as melhorias futuras). Aparece no Hoje na véspera, no dia
 * e depois de passar, com as fotos e o lembrete ligados. Antes da primeira
 * sessão não há data para lembrar. "Agora não" some até o app abrir de novo.
 */
function lembreteDasFotos(agora) {
  if (!ligado(S.modulos, 'fotos') || !ligado(S.modulos, 'vesperaFotos')) return null;
  if (view.lembreteDispensado === hojeISO(agora)) return null;
  const sessoes = (S.protocolo.sessoes || []).filter(function (s) { return Object.keys(s.fotos || {}).length; });
  const desde = diasDesdeAFoto(sessoes, agora);
  if (desde == null) return null;
  const faltam = CADENCIA_DIAS - desde;
  if (faltam > 1) return null;
  return {
    t: faltam === 1 ? 'Amanhã é dia das fotos' : faltam === 0 ? 'Hoje é dia das fotos' : 'As fotos passaram ' + (-faltam) + (faltam === -1 ? ' dia' : ' dias'),
    apoio: faltam === 1 ? 'Combine com quem vai fotografar. De noite, com a mesma luz de sempre.' : 'A sessão entra com a data em que for feita; nada vence.'
  };
}
CTX.dispensaLembrete = function () {
  view.lembreteDispensado = hojeISO(); render();
  avisoComAcao('Lembrete dispensado até amanhã.', 'Desfazer', function () { view.lembreteDispensado = null; render(); });
};

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
  await save(); render(); rola(0);
  // "já parei" é um TOQUE que grava o fim automático — o único lugar do produto
  // em que um toque dele grava um tempo que não é o do toque. A frase diz isso.
  toast(fraseDoFechoNaUltima(s, 'Encerrei'));
};

/**
 * A TIRA DO TREINO ABERTO, acima da doca, em todo lugar: o nome do treino e
 * quantas séries de quantas. `null` sem sessão aberta.
 */
/** O aviso com "Desfazer" (o componente único), para as telas: o fato e o que desfaz. */
CTX.avisaComDesfazer = function (msg, desfaz) { avisoComAcao(msg, 'Desfazer', desfaz); };
/** "Fiz mais do que anotei" de um treino aberto, a partir do Hoje: o pôr em dia do dia da sessão. */
CTX.poeEmDiaDaSessao = function () { if (S.sessao) view.day = S.sessao.day; CTX.abrePorEmDia(); };

CTX.tiraDoTreinoV3 = function () {
  const s = S.sessao;
  const P = s && treino(s.day);
  if (!P) return null;
  if (diaAberto(s.day)) return { nome: 'Aula do box', feitas: 0, prescritas: 0 };
  const prescritas = P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0);
  return { nome: 'Treino ' + s.day, feitas: Math.min(seriesFeitasHoje(s.day), prescritas), prescritas: prescritas };
};

/** O tempo da sessão aberta, sem as pausas: o relógio do topo do treino. */
CTX.relogioDoTreinoV3 = function () { return S.sessao ? duracaoAtual(S.sessao) : 0; };
CTX.verSeriesDoFimV3 = function () { const f = view.fimV3; if (f && f.t != null) abrirSessao(f.t, f.sid); };

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
  else rola(0);
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
    // as poses do protocolo da data dela: sessão de antes de 06/11 tem nove
    pontos: (u ? posesDaData(u.d, S.protocolo.poses) : lista).map(function (p) {
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
  view.recem = null;                   // nada pousa ao montar (ver `marcaRecem`)
  view.formaRecem = null;              // nem a forma da refeição, ao voltar
  entraNoDestino('modoSessao');
  // O som do descanso nasce agora, e não no toque da primeira série.
  preparaAudioDepois();
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
// O interruptor do visual novo (direção 3), por aparelho. Sai na Fase 5.

CTX.abreAjustes = function (fechaAsFolhas) {
  if (view.ajustes) return;
  // vindo de uma folha ("O que aparece"): ela sai no mesmo desenho, e a troca
  // é uma só, a de entrar no destino
  if (fechaAsFolhas === true) { (view.pilha || []).forEach(soltaEstadoDaFolha); view.pilha = []; }
  view.ajustes = true;
  entraNoDestino('ajustes');
  render();
};
CTX.fechaAjustes = function () {
  if (!view.ajustes) return;
  view.ajustes = false;
  // desenha, depois rola: ver `fechaModoDeSessao`
  render();
  saiDoDestino('ajustes');
};

// ---------- AJUSTES › AGENTES (docs/mcp/00-desenho.md, etapa 1, parte 2) ----------
// Lido da nuvem a cada abertura: as tabelas `acessos` e `agentes` e os grants
// do Supabase. Nada disso entra no estado nem sincroniza: é da conta.
const SETE_DIAS = 7 * 864e5;
let agentesDados = null; // { acessos, ligados, grants }
function enderecoDoAgente(k) { return location.origin + '/api/mcp/' + k; }
async function carregaAgentes(tudo) {
  const v = view.agentes; if (!v) return;
  v.carregando = true; v.erro = null; render();
  const desde = new Date(tudo ? 0 : Date.now() - SETE_DIAS).toISOString();
  const r = await NUVEM.agentes(desde, tudo ? 1000 : 200);
  if (view.agentes !== v) return;
  v.carregando = false;
  if (!r.ok) { v.erro = r.erro === 'rede' ? 'Sem conexão. Os agentes só aparecem com internet.' : r.msg; render(); return; }
  agentesDados = r.v; v.tudo = !!tudo;
  render();
}
CTX.abreAgentes = function () {
  if (view.agentes) return;
  view.agentes = { carregando: true, erro: null, tudo: false, copiado: null, desconectando: false };
  agentesDados = null;
  entraNoDestino('agentes');
  render();
  carregaAgentes(false);
};
CTX.fechaAgentes = function () {
  if (!view.agentes) return;
  view.agentes = null;
  render();
  saiDoDestino('agentes');
};
CTX.recarregaAgentes = function () { carregaAgentes(view.agentes && view.agentes.tudo); };
CTX.agentesDesdeOComeco = function () { carregaAgentes(true); };
CTX.agentesV3 = function () {
  const v = view.agentes || {};
  const out = { carregando: !!v.carregando, erro: v.erro || null, tudo: !!v.tudo, copiado: v.copiado || null, desconectando: !!v.desconectando, papeis: null, vazio: false, resumo: '' };
  if (!agentesDados) return out;
  const papeis = estadoDosAgentes(agentesDados.acessos, agentesDados.ligados, Date.now());
  out.papeis = papeis;
  out.vazio = !agentesDados.grants.length && !papeis.some(function (p) { return p.leu; });
  out.resumo = resumoDosAgentes(papeis);
  return out;
};
CTX.ligaAgente = async function (k, on) {
  if (!agentesDados) return;
  const antes = agentesDados.ligados[k] !== false;
  agentesDados.ligados[k] = on; render();
  const r = await NUVEM.ligaAgente(k, on);
  if (!r.ok) { agentesDados.ligados[k] = antes; render(); toast(r.erro === 'rede' ? 'Sem conexão: a chave não mudou.' : 'Não deu para guardar: a chave não mudou.'); return; }
  const nome = { treinador: 'O treinador', nutricionista: 'O nutricionista', assistente: 'O assistente' }[k] || k;
  avisoComAcao(on ? nome + ' pode ler de novo.' : nome + ' não lê mais nada.', 'Desfazer', function () { CTX.ligaAgente(k, antes); });
};
CTX.copiaEnderecoDoAgente = function (k) {
  const url = enderecoDoAgente(k);
  const fim = function () { if (view.agentes) { view.agentes.copiado = k; render(); } };
  try { navigator.clipboard.writeText(url).then(fim, function () { toast(url); }); } catch (e) { toast(url); }
};
CTX.desconectaClaude = async function () {
  const v = view.agentes; if (!v || !agentesDados) return;
  v.desconectando = true; render();
  let falhou = 0;
  for (const g of agentesDados.grants) {
    const r = await NUVEM.revogaGrant(g.client && g.client.id);
    if (!r.ok) falhou++;
  }
  v.desconectando = false;
  CTX.fechaFolha();
  if (falhou) toast('Não deu para desconectar tudo. Tente de novo.');
  else toast('Claude desconectado. As leituras continuam guardadas.');
  carregaAgentes(v.tudo);
};


/**
 * RESPONDER OS DIAS (visual novo): os 13 dias antes de hoje, cada um com a
 * resposta que já tem ("sim", "quase", "naosei") e se já tem marca de comida.
 * A sequência pergunta, um por tela, só os que não têm nenhuma das duas.
 */
function diasParaResponder() {
  const hoje = hojeISO();
  const porData = {};
  (Array.isArray(S.comidaHist) ? S.comidaHist : []).forEach(function (h) { if (h && h.d) porData[h.d] = h; });
  const out = [];
  for (let k = 13; k >= 1; k--) {
    const d = new Date(hoje + 'T12:00:00');
    d.setDate(d.getDate() - k);
    const iso = hojeISO(d.getTime());
    const h = porData[iso];
    // o que o dia teve, para a pessoa lembrar: o treino e o turno
    const ms = sessoesDoDia(d.getTime()).filter(function (m) { return !m.livre; });
    const per = ms.filter(temHora)[0];
    out.push({ iso: iso, rotulo: maiuscula(DIAS_LONGOS[d.getDay()]) + ', ' + fmtDate(d.getTime()),
               curto: DIAS_LONGOS[d.getDay()] + ', ' + d.getDate(),
               teve: ms.length ? 'Dia de ' + (diaAberto(ms[0].day) ? 'aula' : 'Treino ' + ms[0].day) + (per ? ', ' + ({ 'manhã': 'de manhã', tarde: 'de tarde', noite: 'à noite' })[periodoDe(per.t).nome] : '') + '.' : 'Dia sem treino.',
               resposta: CTX.respostaDoDia(iso), marcado: !!(h && Object.keys(h.done || {}).length) });
  }
  return out;
}
CTX.abreResponderDias = function () {
  // do mais recente para trás: o dia de ontem é o que se lembra melhor
  const falta = diasParaResponder().filter(function (x) { return !x.resposta && !x.marcado; }).map(function (x) { return x.iso; }).reverse();
  view.responderDias = { fila: falta, i: 0 };
  entraNoDestino('responderDias'); render(); rola(0);
};
CTX.fechaResponderDias = function () { view.responderDias = null; render(); saiDoDestino('responderDias'); };
/** Quantos dos últimos dias têm resposta ou marca: a conta da regra do nutricionista. */
CTX.respondidosV3 = function () {
  const todos = diasParaResponder();
  return { n: todos.filter(function (x) { return x.resposta || x.marcado; }).length, de: todos.length };
};
/** No dia escolhido, o treino e a última pesagem da data. */
CTX.resumoDoDiaV3 = function (iso) {
  const t = instanteDaData(iso);
  const m = sessoesDoDia(t).sort((a, b) => a.t - b.t)[0];
  let series = 0;
  if (m) Object.keys(S.logs).forEach(function (k) { (S.logs[k] || []).forEach(function (l) { if (l.sid === m.sid) series += l.sets.filter(Boolean).length; }); });
  const peso = (S.body.peso || []).filter(function (x) { return sameDay(x.t, t); }).slice(-1)[0];
  return {
    treino: m ? { titulo: m.livre ? 'Treino fora' : siglaDoTreino(m.day) === 'HX' ? 'HYROX' : 'Treino ' + m.day,
                  apoio: (turnoDaSessao(m) ? 'de ' + turnoDaSessao(m).nome + ' · ' : '') + (series ? series + (series === 1 ? ' série' : ' séries') : 'sem série') + (m.dur ? ' · ' + fmtDur(m.dur) : '') } : null,
    peso: peso ? fmtDec(peso.v) : null
  };
};
CTX.responderDiasV3 = function () {
  const v = view.responderDias; if (!v) return null;
  const todos = diasParaResponder();
  const porIso = {}; todos.forEach(function (x) { porIso[x.iso] = x; });
  const atual = v.i < v.fila.length ? porIso[v.fila[v.i]] : null;
  return { total: v.fila.length, i: v.i, atual: atual,
           respondidos: todos.filter(function (x) { return x.resposta || x.marcado; }).length, de: todos.length };
};
/** Responde o dia em tela e anda; `todos` responde o mesmo para ele e os que faltam. */
CTX.respondeNaSequencia = function (resposta, todos) {
  const v = view.responderDias; if (!v) return;
  const alvo = todos ? v.fila.slice(v.i) : [v.fila[v.i]];
  alvo.forEach(function (iso) { if (iso) CTX.respondeODia(iso, resposta); });
  v.i = todos ? v.fila.length : v.i + 1;
  render();
};
CTX.voltaUmNaSequencia = function () { const v = view.responderDias; if (v && v.i > 0) { v.i--; render(); } };

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
    escolhido: view.diaDoMes,
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
    ciclo: treinos ? String(Math.floor(S.done.length / treinos) + 1) : '—'
  };
};

/**
 * O `···` do modo (dono, 21/10): as opções da sessão inteira, e não as de cada
 * série. O título é o treino ("Treino B · hoje"), porque é dele que as opções
 * falam. Tudo aqui também tem lugar na tela do treino — o menu é um caminho a
 * mais, não uma mudança de casa —, menos o descartar, que antes só aparecia ao
 * encerrar uma sessão vazia.
 */
CTX.menuDaSessao = function () {
  const d = view.day;
  const s = S.sessao;
  const retro = !!(s && s.retro);
  const quando = retro ? fmtDate(s.inicio) : 'hoje';
  const series = s ? Object.keys(S.logs).reduce(function (n, k) {
    return n + (S.logs[k] || []).filter(function (l) { return l.sid === s.sid; })
      .reduce(function (a, l) { return a + l.sets.filter(Boolean).length; }, 0);
  }, 0) : 0;
  const prox = proximoTreino(S, ROT_BASE);
  return {
    titulo: (diaAberto(d) ? 'Aula' : 'Treino ' + d) + ' · ' + quando,
    // A mesma fileira da tela, e o mesmo efeito: a sessão segue o treino em
    // que ele registrar. Num treino passado não há "outro hoje".
    troca: retro ? null : {
      rotulo: 'Fazer outro treino hoje',
      dias: rot().map(function (x) { return { k: x, t: x, on: x === d, proximo: x === prox }; })
    },
    // As mesmas condições do botão do fim da tela: só o treino que ele está
    // fazendo, e some quando ele já está editando.
    editar: podeEditar(d) && !view.editProg
      ? { rotulo: 'Editar o treino ' + (retro ? 'de ' + quando : 'de hoje'),
          detalhe: 'subir, descer, trocar, tirar ou pôr exercício · vale só para esta sessão' }
      : null,
    deload: itemDoDeload(d),
    // "Encerrar o treino · o fim é agora, 7h31": o que o toque grava, com o
    // número, antes do toque (V4). Só existe com sessão aberta.
    encerrar: s ? { rotulo: 'Encerrar o treino', detalhe: 'o fim é agora, ' + fmtHoraDita(Date.now()) } : null,
    descartar: s && !retro ? {
      rotulo: 'Descartar esta sessão',
      detalhe: series
        ? 'apaga o início e ' + (series === 1 ? 'a 1 série registrada' : 'as ' + series + ' séries registradas')
        : 'apaga o início · nenhuma série registrada'
    } : null
  };
};
CTX.descartarSessao = function () { descartarSessao(); };

CTX.abreTreinoDeHoje = function () {
  const h = diaResolvido();
  if (!h.treino) return;               // dia de descanso: não há treino a abrir
  view.day = h.treino;
  view.swapOpen = null;
  abreModo();
  render();
};

/**
 * O treino de hoje, depois da janela dele: o registro de hoje (o mesmo do "Já
 * fiz"), que grava na data de hoje e pergunta a hora em que foi, em vez de abrir
 * o modo ao vivo e carimbar as séries com a hora de agora. Dele, "Detalhar
 * exercícios e séries" abre o modo na data e na hora do registro.
 */
CTX.lancaTreinoDeHoje = function () { CTX.abreFolha({ k: 'registroTreino', data: hojeISO() }); };

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

// ---------- O TREINO EM FOCO no visual novo (Fase 3): uma série por tela ----------
// Só a forma muda. A série entra pela MESMA porta do modo antigo
// (`anotaSerie`: carga e repetição; `poeRir`: o RIR), que é a que projeta no
// histórico, guarda e dispara o descanso. Não há caminho de gravação novo:
// é onde o app já perdeu série no passado (docs/redesign-3/03-lotes.md).

/** A série em foco: a escolhida (`view.focoV3`) ou a primeira que falta, na ordem do treino. */
function serieEmFoco(d) {
  const P = treino(d);
  if (!P) return null;
  const f = view.focoV3;
  if (f && P.ex[f.i] && f.k < setsFor(P.ex[f.i])) return f;
  const estados = estadosDoDia(d);
  const pares = paresDe(d).de;
  for (let i = 0; i < P.ex.length; i++) {
    // o par ativo anda em circuito: rodada a rodada, estação 1 e estação 2
    const par = pares[i];
    if (par && !par.separado && par.a === i) {
      const r = proximaDoPar(estacaoDe(par.a), estacaoDe(par.b));
      if (r) return { i: r.lado === 'a' ? par.a : par.b, k: r.k };
      i = par.b;
      continue;
    }
    if (ehPulado(i) || estados[i] === 'feito') continue;
    const dr = draftPeek(i);
    const ns = setsFor(P.ex[i]);
    for (let k = 0; k < ns; k++) if (!serieCheia(dr, k)) return { i: i, k: k };
  }
  return null;
}
CTX.focoV3 = function () {
  const h = diaResolvido();
  const d = view.day || h.treino || proximoTreino(S, ROT_BASE);
  hidrataDraft(d);
  const P = treino(d);
  if (!P) return null;
  const f = serieEmFoco(d);
  const feitas = seriesFeitasHoje(d);
  const prescritas = P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0);
  const base = { dia: d, nome: P.name, feitas: feitas, prescritas: prescritas, sessaoAberta: !!S.sessao, pausada: !!(S.sessao && S.sessao.pausadoEm) };
  if (!f) return Object.assign(base, { fim: true });
  const ex = P.ex[f.i];
  const vm = vmExercicio(d, f.i, ex);
  const key = logKey(d, f.i);
  const tipo = cargaTipo(key, ex);
  const dr = draftPeek(f.i);
  const agora = dr && dr.s[f.k] ? dr.s[f.k] : [null, null];
  const ant = lastSet(key, f.k);
  const fx = faixaDoTexto(ex.r);
  const v0 = valoresDaSerie(d, f.i, f.k);
  const carga = v0.carga, reps = v0.reps;
  const pg = pegadaDoEx(ex);
  const sobe = vm.up && f.k === 0 && agora[0] == null ? proximaCarga(ant ? ant[0] : null, tipo) : null;
  return Object.assign(base, {
    fim: false, i: f.i, k: f.k,
    par: parDoFoco(d, f),
    pegada: pg.pegada, pes: pg.pes,
    midia: midiaDoExV3(ex, pg),
    ex: { n: ex.n, cue: pg.dica || '', faixa: ex.r || '', rir: ex.rir || '', series: setsFor(ex),
          unidade: vm.unidade === 'kg/lado' ? (tipo === 'halter' ? 'kg em cada mão' : 'kg por lado') : vm.unidade, medida: vm.medida,
          semCarga: tipo === 'corpo', seg: vm.seg, descanso: vm.descansoTxt, proximo: vm.proximo,
          equip: (equipamentoDoEx(ex) || {}).n || null },
    estados: vm.linhas.map(function (l, k) {
      return { k: k, feita: l.valor[1] != null, antes: l.antes,
               txt: l.valor[1] != null ? (l.valor[0] ? fmtNum(l.valor[0]).replace('.', ',') + ' × ' : '') + l.valor[1] : null };
    }),
    carga: carga, reps: reps,
    passoCarga: passoDaCarga(tipo),
    antes: vm.linhas[f.k] ? vm.linhas[f.k].antes : null,
    jaFeita: agora[1] != null,
    sobe: sobe,
    // os números da sugestão: com que carga, até quantas repetições, e para onde o alvo volta
    sobeNota: sobe ? { carga: ant ? ant[0] : null, topo: fx ? fx[1] : null, comeco: fx ? fx[0] : null } : null,
    dor: vm.dorBloqueia ? { o: vm.dorRep, datas: vm.dorDatas } : null,
    // passou tempo demais desde a última série para ser descanso
    intervalo: S.sessao && !S.sessao.pausadoEm && !timerFim && S.sessao.ultima !== view.intervaloDispensado &&
      intervaloLongo(S.sessao.ultima, Date.now(), vm.descanso)
      ? { minutos: Math.round((Date.now() - S.sessao.ultima) / 60000) } : null
  });
};
/**
 * De onde a série parte: o que já está anotado, a mesma série da última vez, a
 * série anterior de hoje, ou o começo da faixa do treinador.
 */
function valoresDaSerie(d, i, k) {
  const ex = treino(d).ex[i];
  const dr = draftPeek(i);
  const agora = dr && dr.s[k] ? dr.s[k] : [null, null];
  const ant = lastSet(logKey(d, i), k);
  const anteriorHoje = k > 0 && dr && dr.s[k - 1] ? dr.s[k - 1] : null;
  const fx = faixaDoTexto(ex.r);
  return {
    carga: agora[0] != null ? agora[0] : ant && ant[0] != null ? ant[0] : anteriorHoje && anteriorHoje[0] != null ? anteriorHoje[0] : 0,
    reps: agora[1] != null ? agora[1] : ant && ant[1] != null ? ant[1] : anteriorHoje && anteriorHoje[1] != null ? anteriorHoje[1] : (fx ? fx[0] : 10),
    antes: ant ? (ant[0] ? fmtNum(ant[0]).replace('.', ',') + ' × ' : '') + ant[1] : null
  };
}
/**
 * O PAR da série em foco, para a tela de circuito: as duas estações com o
 * mesmo peso, a grade de rodadas (um ponto por série de cada uma) e o que vem
 * depois desta série ("→ Rosca inclinada" ou "→ descanso 75 s").
 */
function parDoFoco(d, f) {
  const par = parAtivoDe(d, f.i);
  if (!par) return null;
  const P = treino(d);
  const lado = f.i === par.a ? 'a' : 'b';
  const est = [par.a, par.b].map(function (j) {
    const ex = P.ex[j];
    const e = estacaoDe(j);
    const tipo = cargaTipo(logKey(d, j), ex);
    const un = unidadeDe(ex);
    const kVal = j === f.i ? f.k : (proximaDoPar(estacaoDe(par.a), estacaoDe(par.b)) || {}).k;
    const kk = kVal != null && kVal < e.series ? kVal : Math.min(f.k, e.series - 1);
    const v = valoresDaSerie(d, j, kk);
    const pg = pegadaDoEx(ex);
    let feitas = 0;
    const pontos = [];
    for (let k = 0; k < e.series; k++) {
      const ch = e.cheia(k);
      if (ch) feitas++;
      pontos.push(ch ? 'f' : (j === f.i && k === f.k) ? 'a' : '');
    }
    return {
      i: j, n: ex.n, series: e.series, feitas: feitas, pontos: pontos, fora: e.fora,
      ativa: j === f.i, fechou: feitas >= e.series,
      carga: v.carga, reps: v.reps, antes: v.antes,
      unidade: un ? ROTULO_UNIDADE[un] : (CARGAS[tipo].rot === 'kg/lado' ? (tipo === 'halter' ? 'kg em cada mão' : 'kg por lado') : CARGAS[tipo].rot),
      semCarga: tipo === 'corpo', seg: !!un && cronometrado(un), medida: un ? ROTULO_UNIDADE[un] : 'repetições',
      lado: ex.lado || null,
      pegada: pg.pegada, pes: pg.pes,
      midia: midiaDoExV3(ex, pg),
      equip: (equipamentoDoEx(ex) || {}).n || null
    };
  });
  const eu = est[lado === 'a' ? 0 : 1];
  // o que vem depois desta série, se ela for guardada agora
  const ea = estacaoDe(par.a), eb = estacaoDe(par.b);
  const simula = function (e, j) {
    if (j !== f.i) return e;
    return { series: e.series, fora: e.fora, cheia: function (k) { return k === f.k || e.cheia(k); } };
  };
  const depois = depoisDaSerie(lado, f.k, simula(ea, par.a), simula(eb, par.b));
  const outra = est[lado === 'a' ? 1 : 0];
  const descSeg = descOf(depois === 'par' ? P.ex[par.b] : P.ex[f.i]);
  return {
    n: par.n, lado: lado,
    rodada: f.k + 1, rodadas: Math.max(est[0].fora ? 0 : est[0].series, est[1].fora ? 0 : est[1].series),
    estacoes: est,
    depois: depois === 'segue' ? { k: 'segue', n: outra.n } : { k: 'descanso', s: descSeg, txt: fmtDesc(descSeg) },
    sozinha: !outra.fora && f.k >= outra.series,
    descanso: fmtDesc(descOf(P.ex[par.b])),
    tempo: !!eu.seg
  };
}
/** Tocar a outra estação: ela passa a ser a da vez (o aparelho da primeira está ocupado). */
CTX.trocaVezV3 = function () {
  const f = CTX.focoV3();
  if (!f || !f.par) return;
  const outra = f.par.estacoes[f.par.lado === 'a' ? 1 : 0];
  if (outra.fora || outra.fechou) return;
  let k = f.k < outra.series && outra.pontos[f.k] !== 'f' ? f.k : outra.pontos.indexOf('');
  if (k < 0) return;
  view.focoV3 = { i: outra.i, k: k };
  render();
};
/** "Separar hoje": o par vira dois exercícios comuns só neste treino; de novo, junta. */
CTX.separaParV3 = async function (i, separar) {
  const d = view.day;
  const p = paresDe(d).de[i];
  if (!p) return;
  const s = S.sessao || abreSessaoVazia();
  if (!s.separar) s.separar = [];
  const chave = slotDe(d, p.a);
  const j = s.separar.indexOf(chave);
  if (separar && j < 0) s.separar.push(chave);
  if (!separar && j >= 0) s.separar.splice(j, 1);
  view.focoV3 = null;
  await save(); render();
  toast(separar ? 'Par ' + p.n + ' separado hoje. Cada um com o seu descanso.' : 'Par ' + p.n + ' junto de novo.');
};
/**
 * A PROGRESSÃO (visual novo): os exercícios de um treino agrupados em
 * "prontos para subir", "ganhando repetição" e "parados" (`estadoDaProgressao`,
 * em dominio/progressao.ts).
 */
CTX.abreProgressao = function (dia) {
  view.progressao = { dia: dia || view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE) };
  entraNoDestino('progressao'); render(); rola(0);
};
CTX.fechaProgressao = function () { view.progressao = null; render(); saiDoDestino('progressao'); };
CTX.setDiaDaProgressao = function (d) { if (view.progressao && treino(d)) { view.progressao.dia = d; render(); } };
CTX.progressaoV3 = function () {
  const p = view.progressao; if (!p) return null;
  const P = treino(p.dia);
  const grupos = { subir: [], rep: [], parado: [] };
  if (P) P.ex.forEach(function (ex, i) {
    const key = logKey(p.dia, i);
    const h = historicoRef(key);
    const e = estadoDaProgressao(h, Object.assign({}, ex, { s: setsFor(ex) }), pausaEx(key));
    if (!e) return;
    const u = h[h.length - 1];
    const tipo = cargaTipo(key, ex);
    grupos[e.k].push({ i: i, n: nomeEx(key), carga: fmtNum(maxLoad(u)).replace('.', ','), unidade: CARGAS[tipo].rot,
      reps: u.sets.filter(Boolean).map(function (s) { return s[1]; }).join(' · '),
      serie: h.slice(-8).map(function (l) { return maxLoad(l) * (1 + repsOf(l) / Math.max(1, l.sets.filter(Boolean).length) / 30); }) });
  });
  return { dia: p.dia, nome: P ? P.name : '', dias: rot().filter(function (d) { return treino(d) && !diaAberto(d); }), grupos: grupos };
};
/** Um exercício, aberto da progressão: a mesma camada `hist` do histórico antigo. */
CTX.abreExercicioV3 = function (dia, i) {
  view.hist = { day: dia, i: Number(i), key: logKey(dia, Number(i)), v3: true }; view.edit = null;
  entraNoDestino('hist'); render(); rola(0);
};
CTX.exercicioV3 = function () {
  const v = view.hist; if (!v) return null;
  const P = treino(v.day); const ex = P && P.ex[v.i];
  if (!ex) return null;
  const key = v.key || logKey(v.day, v.i);
  const h = (S.logs[key] || []).filter(function (l) { return l && Array.isArray(l.sets) && l.sets.some(Boolean); });
  const tipo = cargaTipo(key, ex);
  const ns = setsFor(ex);
  const topo = topReps(ex.r || '');
  const e = estadoDaProgressao(historicoRef(key), Object.assign({}, ex, { s: ns }), pausaEx(key));
  const u = h[h.length - 1], a = h[0];
  const un = CARGAS[tipo].rot;
  let passo = null;
  if (e && e.k === 'subir') {
    const nova = proximaCarga(maxLoad(u), tipo);
    passo = { tom: 'subir', t: nova ? 'Na próxima, suba para ' + fmtNum(nova).replace('.', ',') + ' ' + un : 'Pronto para subir',
              d: 'Todas as séries chegaram a ' + topo + ' repetições com ' + fmtNum(maxLoad(u)).replace('.', ',') + '. Com a carga nova, o alvo volta para o começo da faixa.' };
  } else if (e && e.k === 'parado') {
    passo = { tom: 'parado', t: 'Parado há 3 sessões', d: 'Mesma carga e mesmas repetições. Não quer dizer erro: vale olhar descanso, sono e a ordem no treino antes de mexer.' };
  } else if (e && e.k === 'rep') {
    passo = { tom: 'rep', t: 'Ganhando repetição', d: 'Mantenha ' + fmtNum(maxLoad(u)).replace('.', ',') + ' ' + un + '. ' +
      e.falta.map(function (x) { return 'Série ' + x[0] + ': mais ' + x[1]; }).join('. ') + (e.falta.length ? '. ' : '') + 'Quando todas chegarem a ' + topo + ', sobe.' };
  }
  // as sessões por `sid`, montadas uma vez: cada linha de "sessão a sessão" abre a sua
  const sessaoPorSid = {};
  S.done.forEach(function (x) { if (x.sid != null && !sessaoPorSid[x.sid]) sessaoPorSid[x.sid] = x; });
  return {
    n: nomeEx(key), id: key, dia: v.day, i: v.i,
    prescricao: ns + ' × ' + (ex.r || '') + (ex.rir ? ' · sobrando ' + ex.rir : ''),
    unidade: un, topo: topo,
    atual: u ? fmtNum(maxLoad(u)).replace('.', ',') : null,
    desde: u && a && h.length > 1 ? fmtSig(Math.round((maxLoad(u) - maxLoad(a)) * 100) / 100) + ' desde ' + fmtDate(a.t) : null,
    passo: passo,
    linha: h.map(function (l) { return { t: l.t, v: maxLoad(l) }; }),
    sessoes: h.slice().reverse().map(function (l) {
      // a sessão do registro, que abre para corrigir: pelo `sid`; o registro
      // antigo sem `sid`, pela sessão sem `sid` do mesmo dia — é a única em
      // que `detalheDaSessao` o mostra
      const m = l.sid != null ? sessaoPorSid[l.sid]
        : S.done.find(function (x) { return x.sid == null && !x.livre && sameDay(x.t, l.t); });
      return { t: l.t, data: fmtDate(l.t), carga: fmtNum(maxLoad(l)).replace('.', ','), dp: !!l.dp, sessao: m ? m.t : null, sid: m ? m.sid : null,
               reps: l.sets.map(function (s) { return s ? { r: s[1], topo: isFinite(topo) && s[1] >= topo } : null; }).filter(Boolean) };
    }),
    temFoto: !!S.fotos[ex.id],
    foto: FOTO.urlDaFoto(ex.id, S.fotos[ex.id]),
    renome: { nome: nomeEx(key), doCodigo: (S.ex[key] && S.ex[key].n && nomeDoCodigo(key) !== nomeEx(key)) ? nomeDoCodigo(key) : null }
  };
};

/**
 * ENCERRAR no visual novo: o mesmo `finalizarSessao` (que pergunta pelos
 * pendentes e guarda as mudanças do dia na fila `promoPendente`), e depois o
 * fim fica na tela, com o resumo e o "vira regra?" daquela sessão. Encerrar
 * troca o dia em tela para o próximo treino; por isso o fim guarda o dele.
 */
CTX.encerraTreinoV3 = async function () {
  const s = S.sessao;
  if (!s) return;
  const sid = s.sid, dia = s.day;
  await finalizarSessao(true);
  if (S.sessao && S.sessao.sid === sid) return;   // voltou ao treino, ou não encerrou
  let series = 0, depois = 0;
  Object.keys(S.logs).forEach(function (k) {
    (S.logs[k] || []).forEach(function (l) {
      if (l.sid !== sid) return;
      series += l.sets.filter(Boolean).length;
      if (l.dp) depois++;
    });
  });
  if (!series) return;                             // descartada: nada a resumir
  const marca = S.done.filter(function (x) { return x.sid === sid; })[0];
  view.fimV3 = { sid: sid, dia: dia, series: series, depois: depois,
                 t: marca ? marca.t : null, min: typeof marca?.dur === 'number' ? Math.round(marca.dur / 60000) : null, dur: marca && marca.dur ? marca.dur : 0 };
  render(); rola(0);
};
CTX.fimV3 = function () {
  const f = view.fimV3; if (!f) return null;
  const g = CTX.mudancasQueEsperam().filter(function (x) { return x.sid === f.sid; })[0];
  const P = treino(f.dia);
  return Object.assign({}, f, { nome: 'Treino ' + f.dia,
    prescritas: P ? P.ex.reduce(function (n, ex) { return n + setsFor(ex); }, 0) : f.series,
    mudancas: g ? g.mudancas : [], vence: g ? g.vence : null });
};
CTX.fechaFimV3 = function () { view.fimV3 = null; CTX.fechaModoDeSessao(); };

/**
 * A AULA DO BOX no visual novo (dia aberto): a lista rápida grava pela porta
 * de sempre dela (`anotaSerieRapida`: o valor entra em todas as passadas do
 * movimento, e a tela diz isso). "Série por série" leva ao treino em foco.
 */
CTX.anotaRapidaV3 = function (i, pos, valor) { anotaSerieRapida(Number(i), pos, valor); render(); };
CTX.setAulaPorSerie = function (on) { view.aulaPorSerie = !!on; view.focoV3 = null; render(); };
CTX.aulaV3 = function () {
  const d = view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE);
  if (!diaAberto(d) || view.aulaPorSerie) return null;
  return CTX.treino();
};

/**
 * A sessão inteira, aberta do histórico de um exercício (visual novo): é ela
 * que sabe corrigir cada série. Fica por cima do histórico (`camadasAbertas`).
 */
CTX.abreSessaoDoHistorico = function (t, sid) { if (t != null) abrirSessao(t, sid); };

/**
 * A foto do aparelho (visual novo): a mesma folha `foto` da pilha, aberta pelo
 * id do exercício, de onde quer que ele esteja (histórico, treino em foco).
 * `tiraFoto` e `apagaFoto` acham o exercício pela folha aberta (`fotoAberta`).
 */
/**
 * O tipo do dia e o turno, na folha `dia` do visual novo: os mesmos campos de
 * `setCadenciaDeHoje` e `setTurno`, sem fechar a folha — nela se escolhe mais
 * de uma coisa (o turno, a demanda alta, como foi o dia) antes do "Pronto".
 */
CTX.setCadenciaV3 = function (c) { diaDeComida().cadencia = c; queueSave(); render(); };
CTX.setTurnoV3 = function (t) {
  const d = diaDeComida();
  if (!t || t === 'manha') delete d.turno; else d.turno = t;
  queueSave(); render();
};

CTX.abreFotoDoAparelhoV3 = function (id) {
  if (!id) return;
  pilha().push({ k: 'foto', id: id });
  render();
  carregaFotos([id]);
};

/** O passo da régua de carga, pelo tipo de carga: o mesmo hoje e na série passada. */
function passoDaCarga(tipo) { return tipo === 'lado' || tipo === 'barra' ? 1.25 : tipo === 'halter' ? 1 : 2.5; }

// ---------- a SÉRIE PASSADA no visual novo (folha `seriePassada`) ----------
// As mesmas portas da tela antiga (`abreSerieDaPassada`, `gravaNaPassada`,
// `lancaSerieDaPassada`, `apagaSerieDaPassada`); muda só o desenho: as duas
// réguas da série de hoje e um "Guardar".
CTX.abreSeriePassadaV3 = function (idEx, chave, k) {
  view.passada = null; view.teclado = null;
  abreSerieDaPassada(idEx, chave, k);
  if (view.passada) CTX.abreFolha({ k: 'seriePassada' });
};
CTX.fechaSeriePassadaV3 = function () { CTX.fechaFolha(); };
CTX.seriePassadaV3 = function () {
  const p = view.passada, m = view.sessao;
  if (!p || !m) return null;
  const x = p.novo ? null : serieDaPassada();
  if (!p.novo && !(x && x.s)) return null;
  const e = x ? x.e : (p.chave ? registroPorChave(p.idEx, p.chave) : null);
  const P = m.day ? treinoDaSessao(m) : null;
  const ex = e ? exDoRegistro(p.idEx, e)
    : P ? P.ex.filter(function (q) { return q.id === p.idEx || q.orig === p.idEx; })[0] || null : null;
  const tipo = cargaTipo(p.idEx, ex || exDe(p.idEx));
  const fx = faixaDoTexto(ex ? ex.r : null);
  const sr = x ? x.s : null;
  return {
    titulo: nomeEx(p.idEx) + ' · série ' + (p.k + 1),
    sub: DIAS_LONGOS[new Date(m.t).getDay()] + ', ' + fmtDate(m.t) + '. ' + (p.novo
      ? (p.ref ? 'Não registrada; a carga vem da série de referência.' : 'Não registrada.')
      : 'Corrigir aqui não muda o programa.'),
    novo: !!p.novo,
    un: CARGAS[tipo].rot,
    semCarga: tipo === 'corpo',
    passo: passoDaCarga(tipo),
    carga: sr ? (+sr[0] || 0) : (+p.carga || 0),
    reps: sr ? (+sr[1] || 0) : (p.ref ? +p.ref[1] || 0 : fx ? fx[0] : 10),
    rir: sr && sr[2] != null ? sr[2] : null,
    rirs: RIR_ESCALA,
    faixa: fx ? 'faixa do treino: ' + ex.r + ' repetições' : null,
    falhou: p.tocado ? 'Não foi gravado: o aparelho recusou. O que está guardado não mudou.' : null
  };
};
CTX.guardaSeriePassadaV3 = async function (carga, reps, rir) {
  const p = view.passada;
  if (!p) return;
  const n = Math.round(+reps);
  if (!(n >= 0) || n > 200) return;
  if (p.novo) {
    if (carga != null) p.carga = carga;
    await lancaSerieDaPassada(n);
    if (!view.passada || view.passada.tocado) return;
    if (rir != null) await gravaNaPassada(function (s) { s[2] = rir; }, { k: 'rir', v: rir });
  } else {
    await gravaNaPassada(function (s) {
      if (carga != null) s[0] = carga;
      s[1] = n;
      if (rir == null) s.length = 2; else s[2] = rir;
    }, { k: 'tudo', v: n });
  }
  if (!view.passada || view.passada.tocado) return;
  const x = serieDaPassada();
  const txt = x && x.s ? textoDaSerieDaPassada(x.p.idEx, x.s) : '';
  view.passada = null;
  CTX.fechaFolha();
  toast((p.novo ? 'Série lançada: ' : 'Série corrigida: ') + txt + '.');
};
CTX.apagaSerieDaPassadaV3 = async function () {
  await apagaSerieDaPassada();
  if (!view.passada) CTX.fechaFolha();
};

/** "Não, só parei": o aviso some até a próxima série. */
CTX.dispensaIntervalo = function () { if (S.sessao) { view.intervaloDispensado = S.sessao.ultima; render(); } };

/**
 * "JÁ FIZ MAIS DO QUE ANOTEI": as séries que faltam no treino de hoje, cada
 * uma com os números que ela teria (os da mesma série da última vez, ou os da
 * série anterior de hoje). Série sem número de onde partir não é oferecida:
 * o app não inventa.
 */
function numerosDaSerieEmDia(d, i, k) {
  const key = logKey(d, i);
  const ant = lastSet(key, k);
  if (ant && ant[1] != null) return [ant[0] != null ? ant[0] : 0, ant[1]];
  const dr = draftPeek(i);
  for (let j = k - 1; j >= 0; j--) if (dr && serieCheia(dr, j)) return [dr.s[j][0], dr.s[j][1]];
  return null;
}
CTX.porEmDiaV3 = function () {
  const d = view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE);
  hidrataDraft(d);
  const P = treino(d);
  if (!P) return null;
  return P.ex.map(function (ex, i) {
    if (ehPulado(i)) return null;
    const dr = draftPeek(i);
    if (setsFor(ex) > 0 && Array.from({ length: setsFor(ex) }, function (_, k) { return k; }).every(function (k) { return serieCheia(dr, k); })) {
      return { i: i, n: ex.n, ja: true, series: [] };
    }
    const series = [];
    for (let k = 0; k < setsFor(ex); k++) {
      if (serieCheia(dr, k)) continue;
      const n = numerosDaSerieEmDia(d, i, k);
      if (n) series.push({ k: k, carga: n[0], reps: n[1], txt: (n[0] ? fmtNum(n[0]).replace('.', ',') + ' × ' : '') + n[1] });
    }
    if (!series.length) return null;
    const tipo = cargaTipo(logKey(d, i), ex);
    return { i: i, n: ex.n, series: series, carga: series[0].carga, semCarga: tipo === 'corpo',
             passo: passoDaCarga(tipo), unidade: vmExercicio(d, i, ex).unidade };
  }).filter(Boolean);
};
/** PÔR EM DIA é tela (destino): lista com marcação e carga por exercício, que rola. */
CTX.abrePorEmDia = function () {
  if (view.porEmDia) return;
  view.porEmDia = { marcados: {}, cargas: {} };
  entraNoDestino('porEmDia'); render(); rola(0);
};
CTX.fechaPorEmDia = function () { if (!view.porEmDia) return; view.porEmDia = null; render(); saiDoDestino('porEmDia'); };
CTX.estadoPorEmDia = function () { return view.porEmDia; };
CTX.marcaPorEmDia = function (i) {
  const v = view.porEmDia; if (!v) return;
  v.marcados[i] = !v.marcados[i]; render();
};
CTX.cargaPorEmDia = function (i, carga) {
  const v = view.porEmDia; if (!v) return;
  v.cargas[i] = carga; v.marcados[i] = true; render();
};
/**
 * Guarda o que foi marcado (ou tudo, com `tudo`), e volta à série. Cada
 * exercício marcado entra com TODAS as séries que faltam, com as repetições da
 * última vez e a carga acertada na tela (a da última vez, se não mexeu).
 */
CTX.guardaPorEmDia = function (tudo) {
  const v = view.porEmDia; if (!v) return 0;
  const lista = CTX.porEmDiaV3() || [];
  const marcados = [];
  lista.forEach(function (x) {
    if (x.ja || (!tudo && !v.marcados[x.i])) return;
    x.series.forEach(function (s) { marcados.push({ i: x.i, k: s.k }); });
  });
  view.porEmDia = null;
  // desenha (poeEmDia), depois rola: ver `fechaModoDeSessao`
  const n = CTX.poeEmDia(marcados, tudo ? {} : v.cargas);
  saiDoDestino('porEmDia');
  return n;
};
/**
 * Grava as séries marcadas com os números da última vez, PELA MESMA PORTA de
 * toda série (`anotaSerie`), e marca o registro como posto em dia (`Log.dp`).
 * O descanso que a última delas dispararia não começa: ninguém está
 * descansando de uma série feita há meia hora.
 */
CTX.poeEmDia = function (marcados, cargas) {
  const d = view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE);
  if (view.day !== d) view.day = d;
  hidrataDraft(d);
  let n = 0;
  (marcados || []).forEach(function (m) {
    const i = Number(m.i), k = Number(m.k);
    const ex = treino(d).ex[i];
    if (!ex || k >= setsFor(ex) || serieCheia(draftPeek(i), k)) return;
    const nums = numerosDaSerieEmDia(d, i, k);
    if (!nums) return;
    draftOf(i).dp = 1;
    // a carga acertada na tela do pôr em dia vale para todas as séries dele
    const c = cargas && cargas[i] != null ? Number(cargas[i]) : nums[0];
    anotaSerie(i, k, 0, c);
    anotaSerie(i, k, 1, nums[1]);
    n++;
  });
  if (n) { stopTimer(); view.focoV3 = null; view.intervaloDispensado = null; }
  render();
  if (n) toast(n === 1 ? '1 série posta em dia, com os números da última vez.' : n + ' séries postas em dia, com os números da última vez.');
  return n;
};
/** Pula para uma série (a lista do treino, ou a seta para corrigir uma feita). */
CTX.setFocoV3 = function (i, k) { view.focoV3 = { i: Number(i), k: Number(k) || 0 }; render(); };
/**
 * "FEITA": a série em foco, com a carga e a repetição da régua, pela porta de
 * sempre. Depois o foco volta a ser "a próxima que falta".
 */
CTX.fazSerieV3 = function (carga, reps) {
  const f = CTX.focoV3();
  if (!f || f.fim) return;
  // o rascunho é o do dia em tela; a sessão nasce sozinha na projeção da
  // primeira série completa, como no modo antigo (`abreSessao`)
  if (view.day !== f.dia) view.day = f.dia;
  const corpo = f.ex.semCarga;
  anotaSerie(f.i, f.k, 0, corpo && !(carga > 0) ? 0 : carga);
  anotaSerie(f.i, f.k, 1, reps);
  view.ultimaV3 = { i: f.i, k: f.k, dia: f.dia };
  // No par, a próxima é a do MESMO par (a outra estação, ou a rodada seguinte),
  // mesmo que ele tenha vindo ao par fora da ordem do treino. Fora do par, o
  // foco volta a ser "a primeira que falta".
  const par = parAtivoDe(f.dia, f.i);
  const r = par ? proximaDoPar(estacaoDe(par.a), estacaoDe(par.b)) : null;
  view.focoV3 = r ? { i: r.lado === 'a' ? par.a : par.b, k: r.k } : null;
  render();
};
/** "Sobraram quantas?": o RIR da série que acabou, no descanso. */
CTX.rirDaUltimaV3 = function (v) {
  const u = view.ultimaV3;
  if (!u || u.dia !== view.day) return;
  poeRir(u.i, u.k, v);
};
CTX.ultimaV3 = function () {
  const u = view.ultimaV3;
  if (!u || u.dia !== view.day) return null;
  const dr = draftPeek(u.i);
  const s = dr && dr.s[u.k];
  const ex = treino(view.day).ex[u.i];
  const par = parAtivoDe(view.day, u.i);
  return s ? { n: ex.n, serie: u.k + 1, rir: s[2] != null ? s[2] : null, txt: (s[0] ? fmtNum(s[0]).replace('.', ',') + ' × ' : '') + s[1],
               equip: (equipamentoDoEx(ex) || {}).n || null, par: par ? par.n : null } : null;
};
/** "Mudar este exercício": o que o cartão antigo oferecia, para a folha nova. */
CTX.mudarExV3 = function (i) {
  const d = view.day;
  const P = treino(d);
  if (!P || !P.ex[i]) return null;
  const vm = vmExercicio(d, i, P.ex[i]);
  return { i: i, id: P.ex[i].id, nome: vm.nome, nomeOriginal: vm.nomeOriginal, series: setsFor(P.ex[i]), pulado: vm.pulado, podeMaisSerie: vm.podeMaisSerie,
           proximo: vm.proximo, troca: vm.troca, temTroca: vm.temTroca, dores: vm.dores, dorBloqueia: vm.dorBloqueia,
           parSeparado: (function () { const p = paresDe(d).de[i]; return p && p.separado ? { n: p.n } : null; })(),
           regraDor: S.primeiraVez ? null : RULES.find(r => r.k === 'atenção').p[1] };
};
/** A lista do treino: cada exercício com o que foi feito, e a primeira série que falta dele. */
CTX.listaV3 = function () {
  const d = view.day || diaResolvido().treino || proximoTreino(S, ROT_BASE);
  const P = treino(d);
  if (!P) return null;
  const estados = estadosDoDia(d);
  const f = serieEmFoco(d);
  const pares = paresDe(d).de;
  return {
    nome: 'Treino ' + d, deload: itemDoDeload(d), sessaoAberta: !!S.sessao,
    descansoDoPar: function (n) { const p = paresDe(d).pares.filter(function (x) { return x.n === n; })[0]; return p ? fmtDesc(descOf(P.ex[p.b])) : ''; },
    exercicios: P.ex.map(function (ex, i) {
      const dr = draftPeek(i);
      const ns = setsFor(ex);
      let feitas = 0, prox = null;
      for (let k = 0; k < ns; k++) { if (serieCheia(dr, k)) feitas++; else if (prox == null) prox = k; }
      const par = pares[i];
      const pontos = [];
      for (let k = 0; k < ns; k++) pontos.push(serieCheia(dr, k) ? 'f' : (f && f.i === i && f.k === k) ? 'a' : '');
      return { i: i, n: ex.n, feitas: feitas, series: ns, pulado: ehPulado(i), feito: estados[i] === 'feito',
               atual: !!(f && f.i === i), proxima: prox == null ? 0 : prox, pontos: pontos,
               par: par ? { n: par.n, lado: i === par.a ? 'a' : 'b', separado: par.separado } : null,
               equip: (equipamentoDoEx(ex) || {}).n || null };
    })
  };
};
/** O descanso em curso, para a tela cheia que enche de cor. */
CTX.descansoV3 = function () {
  if (!timerFim) return null;
  return { fim: timerFim, total: timerTotal * 1000, rotulo: timerCtx };
};
CTX.ajustaDescanso = function (delta) { ajustaTimer(delta); render(); };
CTX.paraDescanso = function () { stopTimer(); render(); };

// DESENHA, DEPOIS ROLA (peça 5 do motion; docs/motion/02 §0 e T6). Este fecho
// e o de `fechaAjustes` rolavam ANTES do `render()`: o `scrollTo` corria com o
// modo ainda no DOM, o navegador cortava na altura máxima DELE, e o Corpo que
// entrou a 1982 px voltava a 1091. Agora os dois fazem como os outros doze: o
// destino sai do desenho e só então a posição volta — dentro do desenho novo,
// quando há transição (`rola`).
CTX.fechaModoDeSessao = function () {
  if (!view.modoSessao) return;
  view.modoSessao = false;
  render();
  saiDoDestino('modoSessao');
};

/**
 * Entra num destino: guarda onde a tela de baixo estava — a posição e o
 * controle que o abriu — e pede o topo DENTRO do desenho que o mostra
 * (`rolagemPendente`). Rolar aqui, antes do desenho, rolaria a foto da tela
 * que fica por baixo durante a chegada, e ela daria um salto antes de ser
 * coberta.
 *
 * A posição de baixo é a que está na tela, ou a que já foi pedida para o
 * desenho que vem (um destino que fecha e outro que abre no mesmo toque).
 */
function entraNoDestino(chave) {
  scrollDoDestino[chave] = rolagemPendente != null ? rolagemPendente : window.scrollY;
  focoDoDestino[chave] = chaveDoAcionador();
  rolagemPendente = 0;
}

/** Fim de fluxo: o destino fechou, e a posição guardada não serve mais. */
function esqueceDestino(chave) { delete scrollDoDestino[chave]; delete focoDoDestino[chave]; }

/**
 * Sai de um destino, DEPOIS do `render()` que o tirou: a posição de antes volta
 * — agora, ou dentro do desenho novo, se a troca está pendente.
 */
function saiDoDestino(chave) {
  const y = scrollDoDestino[chave] || 0;
  delete scrollDoDestino[chave];
  // 'instant': suave faz a página deslizar sozinha depois que o destino já
  // sumiu, e parece bug — o mesmo motivo de folha.jsx
  rola(y);
}

/**
 * Um destino que fecha e outro que abre NO MESMO desenho (o "Detalhar" do
 * lançamento passado: o lançamento sai, o modo entra): a posição de baixo não
 * rola agora — rolar o lançamento cortaria na altura dele —; ela fica pedida
 * para o desenho, e o destino que entra a guarda como sua.
 */
function saiDoDestinoNoDesenho(chave) {
  const y = scrollDoDestino[chave] || 0;
  delete scrollDoDestino[chave];
  delete focoDoDestino[chave];
  rolagemPendente = y;
}

// ---------- O FOCO DEVOLVIDO (peça 5 do motion; docs/motion/05 §3.1, §3.4) ----------
//
// O destino SUBSTITUI a casca inteira (`app.jsx`): ao fechar, o controle que o
// abriu é desenhado de novo, nó novo, e ninguém dizia onde o foco devia pousar
// — ele caía no `body` (medido: ao sair do modo e ao fechar toda tela cheia).
// Agora o foco volta a um lugar DECLARADO: o mesmo controle, achado de novo
// pela chave dele (o `data-a`, ou a tag e a primeira classe, e a posição entre
// os iguais), ou, se ele não existe mais, o título da tela que reaparece.
// Guardado por nome do destino, como a posição de leitura.

/** Destino → a chave do controle que o abriu (`chaveDoAcionador`). */
const focoDoDestino = {};
/** O último controle tocado ou clicado (o Safari não foca botão no toque): o acionador provável. */
let ultimoAcionado = null;
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('click', function (e) {
    // e onde o dedo estava: o clique de um toque (`detail` ≥ 1) traz o ponto;
    // o do teclado e o do script, não (`pontoDoToque`)
    ultimoAcionado = { el: e.target, quando: relogioDoFoco(),
                       y: e.detail >= 1 && typeof e.clientY === 'number' ? e.clientY : null };
  }, true);
}
function relogioDoFoco() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : 0;
}
/**
 * A altura na tela do toque que está sendo atendido agora, se ele foi um toque
 * (ou um clique de ponteiro) DENTRO de `dentro` — `null` para o teclado, o
 * script, ou um clique de outro lugar. Lido no próprio clique (o ouvinte de
 * captura acima roda antes do botão).
 */
function pontoDoToque(dentro) {
  const u = ultimoAcionado;
  if (!u || u.y == null || relogioDoFoco() - u.quando > 1000) return null;
  if (!dentro || !u.el || !u.el.isConnected || !dentro.contains(u.el)) return null;
  return u.y;
}
/** O que conta como controle a que o foco pode voltar. */
const CONTROLE = 'button, a[href], [role="button"], label, input, select, textarea, [tabindex]:not([tabindex="-1"]), .ex-top';

/**
 * A chave do controle que está abrindo um destino agora: o tocado há pouco, ou
 * o que tem o foco (o teclado). `null` quando não há controle (a abertura do
 * app, um verbo chamado por programa).
 */
function chaveDoAcionador() {
  const recente = ultimoAcionado && relogioDoFoco() - ultimoAcionado.quando < 1000 ? ultimoAcionado.el : null;
  const el = recente && recente.isConnected ? recente : document.activeElement;
  const c = el && el.closest ? el.closest(CONTROLE) : null;
  if (!c || c === document.body || !c.isConnected) return null;
  const a = c.getAttribute('data-a');
  const classe = (typeof c.className === 'string' ? c.className : '').trim().split(/\s+/)[0];
  const sel = a ? '[data-a="' + a.replace(/"/g, '\\"') + '"]' : c.tagName.toLowerCase() + (classe ? '.' + classe : '');
  let iguais = [];
  try { iguais = [].slice.call(document.querySelectorAll(sel)); } catch (e) { return null; }
  return { sel: sel, i: iguais.indexOf(c), texto: (c.textContent || '').trim().slice(0, 80) };
}

/** Foca `el`, sem rolar, se ele está na página e fora de camada inerte; diz se o foco ficou nele. */
function tentaFocar(el) {
  if (!el || !el.isConnected || el.closest('[inert]') || typeof el.focus !== 'function') return false;
  el.focus({ preventScroll: true });
  return document.activeElement === el;
}

/**
 * Depois do desenho: se um destino SAIU e o que está por cima é uma camada que
 * já estava lá (o lugar, ou o destino de baixo), o foco volta ao controle que
 * abriu o destino que saiu — o mais fundo, se saíram vários no mesmo toque —,
 * ou ao título da tela. Quem chega não precisa disto: o título de uma tela
 * cheia e o do modo recebem o foco ao montar.
 */
function devolveOFoco(antes, agora) {
  const destino = function (c) { return c !== 'pare' && c !== 'falhou' && c.indexOf('folha:') !== 0; };
  const sairam = antes.filter(function (c) { return destino(c) && agora.indexOf(c) < 0; });
  if (!sairam.length) return;
  const chave = focoDoDestino[sairam[0]];
  sairam.forEach(function (c) { delete focoDoDestino[c]; });
  const topo = agora.filter(destino).pop() || null;
  if (topo != null && antes.indexOf(topo) < 0) return;      // um destino novo chegou: ele foca o próprio título
  // Uma folha, o pare ou o aviso por cima ficam com o foco deles.
  if (agora.some(function (c) { return !destino(c); })) return;
  let alvo = null;
  if (chave) {
    let iguais = [];
    try { iguais = [].slice.call(document.querySelectorAll(chave.sel)); } catch (e) { iguais = []; }
    alvo = iguais[chave.i];
    if (!alvo || (alvo.textContent || '').trim().slice(0, 80) !== chave.texto) {
      alvo = iguais.filter(function (el) { return (el.textContent || '').trim().slice(0, 80) === chave.texto; })[0] || alvo;
    }
  }
  if (!tentaFocar(alvo)) tentaFocar(document.querySelector('#app h1[tabindex]'));
}

/**
 * O FOCO QUE O DESENHO PERDEU. Quem tinha o foco saiu da página com este
 * desenho, e o foco caiu no `body` — sem que uma camada tenha saído, que é o caso
 * de `devolveOFoco`: a aba trocou e o controle era da aba velha (o "Ir para
 * Semana", que fecha a Evolução e troca de aba no mesmo toque: sob "Reduzir
 * movimento" são dois desenhos, e o segundo tirava o controle que o primeiro
 * tinha focado; a conferência da peça 5, 07 §11.2), ou o conteúdo trocou dentro
 * da mesma tela cheia (o treino aberto na lista do Programa, 07 §11.3). O foco
 * vai ao título da tela que está desenhada — o mesmo lugar declarado de
 * `devolveOFoco`. Com uma folha, o pare ou o aviso por cima, eles ficam com o
 * foco deles; ninguém tinha o foco (o toque no Safari não foca botão), nada a
 * fazer.
 *
 * O FOCO VAI DEPOIS DO LAYOUT, E NÃO DENTRO DO TOQUE (a 1ª série a frio no
 * WebKit; docs/motion/09, "A primeira série a frio no WebKit"). `focus()` obriga
 * o navegador a montar o desenho na hora, para saber se o nó é focável — o
 * WebKit, o que o nó precisa (a frio, o app quase inteiro); o Chromium, o estilo
 * e o layout do documento —, e este desenho quase sempre roda dentro do toque: a
 * régua que fecha na série gravada tira da página o valor tocado (o Chromium e
 * o WebKit desta máquina focam o botão tocado), e o treino aberto no Programa
 * tira o botão da lista. No WebKit desta máquina, da primeira vez, eram ~200
 * ms DENTRO do handler que o quadro ia gastar de qualquer jeito (a fonte que
 * falta no Linux) — o mesmo defeito que a peça 2 tirou da medida da linha. Por
 * `depoisDoLayout`, o foco entra no MESMO quadro do desenho, depois do layout e
 * antes da pintura, e sem custar nada; a tela mostra o mesmo. Lá, tudo se confere
 * de novo: se alguém pôs o foco nesse meio (uma folha que abriu, o teclado), ou
 * se uma camada ficou por cima, ele fica onde está. Sem ResizeObserver (o jsdom
 * dos testes), na hora, como antes.
 */
function naoPerdeOFoco(focado) {
  if (!focado || focado === document.body || focado === document.documentElement || focado.isConnected) return;
  const perdido = function () {
    const agora = document.activeElement;
    return !agora || agora === document.body || agora === document.documentElement;
  };
  const cobre = function () {
    return camadasDesenhadas.some(function (c) { return c === 'pare' || c === 'falhou' || c.indexOf('folha:') === 0; });
  };
  if (!perdido() || cobre()) return;
  depoisDoLayout(function () {
    if (!perdido() || cobre()) return;
    tentaFocar(document.querySelector('#app h1[tabindex]'));
  });
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
  // Desfazer um ajuste que existia é outra coisa: grava o enquadramento neutro
  // CARIMBADO. Sem carimbo, "sem ajuste" valia zero na fusão, e o ajuste antigo
  // do outro aparelho vencia e voltava.
  const neutro = ehIdentidade(v.enq);
  const desfaz = neutro && ref.enq && !ehIdentidade(ref.enq);
  const novo = Object.assign({}, ref, {
    enq: desfaz ? Object.assign({}, IDENTIDADE, { m: Date.now() })
       : neutro ? undefined : Object.assign({}, v.enq, { m: Date.now() })
  });
  if (novo.enq === undefined) delete novo.enq;
  // ajustou à mão: a sugestão do app perdeu o sentido
  delete novo.sug;

  ses.fotos = Object.assign({}, ses.fotos);
  ses.fotos[v.pose] = novo;
  ses.m = Date.now();
  view.ajuste = null;
  await save();
  render(); saiDoDestino('ajuste');
  toast(neutro ? 'Ajuste desfeito.' : 'Ajuste salvo.');
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
// Só com alguém tirando: a fala da pose seguinte espera 1,5 s depois do clique,
// e a miniatura da foto fica 3 s no canto (F17, F20).
let falaT = null, miniaturaT = null;
// O giro do celular no último segundo, pelo giroscópio (ver `criaMovimento`).
let movimento = NIVEL.criaMovimento();

// ---------- quem tira as fotos ----------
// Na vida real, OUTRA PESSOA segura o celular (04/11), e esse é o padrão; a
// pessoa sozinha, com o celular apoiado e a contagem, é a exceção. A escolha
// mora no APARELHO, e não no estado sincronizado: é do celular que fotografa,
// e o computador não tem o que fazer com ela. Cada foto grava o modo dela
// (`Captura.modo`), e é por lá que os dados ficam sabendo.
const KEY_QUEM_TIRA = 'lastro-fotos-quem-v1';
let quemTira = 'alguem';
async function lembraQuemTira() {
  try {
    const r = await DB.get(KEY_QUEM_TIRA);
    if (r && (r.value === 'alguem' || r.value === 'sozinho')) quemTira = r.value;
  } catch (e) {}
}
CTX.setQuemTira = function (q) {
  if (q !== 'alguem' && q !== 'sozinho') return;
  quemTira = q;
  try { DB.set(KEY_QUEM_TIRA, q); } catch (e) {}
  const c = view.camera;
  if (c && c.quem !== q) {
    // trocar no meio para o que o outro modo tinha em andamento: a contagem e
    // a sequência de um, a foto torta e a miniatura do outro
    clearTimeout(contagemT); contagemT = null; sequencia++;
    clearTimeout(falaT); falaT = null;
    clearTimeout(miniaturaT); miniaturaT = null;
    Object.assign(c, { quem: q, contagem: null, seguido: false, torta: null, miniatura: null, ajuste: false });
    const v = view.protocolo;
    if (v) {
      c.fantasmaD = fantasmaDaPose(v.pose, v.d, q);
      garanteBytesDoCorpo(c.fantasmaD ? [c.fantasmaD] : []);
    }
  }
  render();
};

/**
 * A SOBREPOSTA de cada modo (D1, decisão do dono em 04/11).
 *
 * Com alguém tirando, quem decide a distância são as linhas de cabeça e pés —
 * e uma foto anterior às linhas briga com elas: a frente de 29/10 tem o corpo
 * em 87% do quadro, as linhas pedem 92%, e encaixar a pessoa nela deixaria
 * quem fotografa uns 6% mais longe do que as linhas mandam. Então, nesse
 * modo, só serve de sobreposta a foto tirada COM as linhas: pela câmera do
 * app, de 04/11 em diante. A anterior mais recente que serve; sem nenhuma,
 * sobreposta nenhuma — e ela volta sozinha a partir da primeira sessão assim.
 *
 * Sozinho, a sobreposta continua sendo a vizinha de sempre: ali ela acerta o
 * apoio contra a sala, uma vez, antes de a pessoa se afastar.
 */
const INICIO_DAS_LINHAS = new Date(2026, 10, 4).getTime();
function comAsLinhas(ref) { return !!(ref && ref.v >= INICIO_DAS_LINHAS && ref.cap && ref.cap.via === 'app'); }
function fantasmaDaPose(pose, d, quem) {
  if (quem !== 'alguem') {
    const viz = vizinhaComAPose(S.protocolo.sessoes, pose, d);
    return viz ? viz.d : null;
  }
  const servem = comAPose(S.protocolo.sessoes, pose)
    .filter(function (s) { return s.d !== d && comAsLinhas(s.fotos[pose]); });
  if (!servem.length) return null;
  const antes = servem.filter(function (s) { return s.d < d; });
  return (antes.length ? antes[antes.length - 1] : servem[0]).d;
}

CTX.streamDaCamera = function () { return streamCamera; };
/** Pinta a tela da câmera com o mesmo quadro que vira a foto (ver `desenhaQuadro`). */
CTX.pintaTelaDaCamera = function (tela, video) {
  const r = CAM.pintaTela(tela, video);
  detectaNoQuadro(tela);
  return r;
};

// ---------- a detecção do corpo (visual novo) ----------
// A cada quadro pintado, no máximo `RITMO_DA_DETECCAO` vezes por segundo, o
// detector lê o mesmo quadro que vira a foto (o canvas, já em 3:4). Abaixo de
// `QPS_MINIMO`, ou se o motor não carregar, a detecção sai e as luzes de altura
// e distância voltam a ser conferidas a olho (docs/redesign-3/02-captura.md).
const RITMO_DA_DETECCAO = 66, QPS_MINIMO = 8, AQUECIMENTO = 2500;
let detector = null, pedidoDoDetector = false;
function detectaNoQuadro(tela) {
  const c = view.camera;
  if (!c || !c.v3 || !c.pronta || c.detParou) return;
  if (!detector) {
    if (!pedidoDoDetector) {
      pedidoDoDetector = true;
      POSE.carrega().then(function (d) {
        pedidoDoDetector = false;
        detector = d;
        if (!d && view.camera === c) { c.detParou = 'não carregou'; render(); }
      });
    }
    return;
  }
  const agora = agoraMs();
  const d = c.det || (c.det = { desde: agora, vezes: [], leitura: null, rastros: [], ativa: true, qps: 0 });
  if (d.vezes.length && agora - d.vezes[d.vezes.length - 1] < RITMO_DA_DETECCAO) return;
  let pts = null;
  try { pts = detector.detecta(tela, agora); }
  catch (e) { c.detParou = 'falhou'; c.det.ativa = false; render(); return; }
  d.vezes = d.vezes.filter(function (t) { return agora - t < 2000; }).concat([agora]);
  d.qps = d.vezes.length / 2;
  if (agora - d.desde > AQUECIMENTO && d.qps < QPS_MINIMO) { c.detParou = 'lenta'; d.ativa = false; render(); return; }
  const antes = d.leitura;
  d.leitura = leCorpo(pts, antes);
  const r = rastroDe(pts, agora);
  d.rastros = d.rastros.filter(function (x) { return agora - x.t < 1500; }).concat(r ? [r] : []);
  const chave = function (l) { return l ? [l.pessoa, l.altura, l.distancia, l.dicaAltura, l.dicaDistancia, l.lado].join() : ''; };
  if (chave(antes) !== chave(d.leitura)) {
    falaDoAjuste(c, antes, d.leitura);
    render();
  }
}
/**
 * O que o toque no botão exige. Sozinho e com a detecção ativa, quem toca está
 * ao lado do celular, fora do quadro: o toque pede só o nível, e o app espera
 * as três luzes com a pessoa na marca antes de contar (`esperaParadoEDispara`).
 */
function liberadoNoToque(c) {
  const l = luzesDaCamera(c);
  if (c.quem === 'sozinho' && deteccaoAtiva(c)) return !!(c.forcado || l.nivel);
  return liberado(l, c.forcado);
}
/** Detecção ligada e medindo: é ela quem acende altura e distância. */
function deteccaoAtiva(c) { return !!(c && c.det && c.det.ativa && !c.detParou && c.det.leitura); }

/**
 * Sozinho, a pessoa está longe da tela: quando a distância apaga enquanto o
 * app espera por ela, a voz diz o que fazer, uma vez por mudança.
 */
const FALA_DA_DISTANCIA = { frente: 'Um passo para a frente.', tras: 'Um passo para trás.' };
function falaDoAjuste(c, antes, agora) {
  if (c.quem !== 'sozinho' || !c.esperando || !agora || !agora.pessoa) return;
  const d = agora.dicaDistancia;
  if (d !== 'ok' && (!antes || antes.dicaDistancia !== d) && FALA_DA_DISTANCIA[d]) falaTexto(FALA_DA_DISTANCIA[d]);
}

/**
 * O DISPARO SOZINHO, com a detecção ativa: em vez da contagem fixa, o app
 * espera as três luzes verdes e o corpo parado por um segundo, e então conta
 * cinco. Sem a detecção (ou depois de 20 s esperando), a contagem fixa de antes.
 */
const ESPERA_MAXIMA = 20000;
/** Com a pessoa parada na marca, conta cinco (decisão do dono, 17/11/2026). */
const CONTA_PARADO = 5;
function esperaParadoEDispara(c, contagemFixa) {
  const vez = sequencia, t0 = agoraMs();
  c.esperando = true;
  const confere = function () {
    if (view.camera !== c || !c.seguido || vez !== sequencia || c.contagem != null) { c.esperando = false; return; }
    if (!deteccaoAtiva(c) || agoraMs() - t0 > ESPERA_MAXIMA) { c.esperando = false; contaEDispara(contagemFixa); return; }
    if (liberado(luzesDaCamera(c), c.forcado) && parado(c.det.rastros, agoraMs())) { c.esperando = false; contaEDispara(CONTA_PARADO); return; }
    setTimeout(confere, 200);
  };
  confere();
}

/** Desliga a câmera e cancela a contagem. Toda saída passa por aqui. */
function encerraCamera() {
  clearTimeout(contagemT); contagemT = null;
  clearTimeout(falaT); falaT = null;
  clearTimeout(miniaturaT); miniaturaT = null;
  sequencia++;
  paraNivel(); paraNivel = function () {};
  CAM.fecha(streamCamera);
  streamCamera = null;
}

// ---------- o nível do celular ----------
// Aparece na câmera e fica gravado em cada foto (ver infra/nivel.ts). Ele muda
// a cada quadro do sensor, e a tela só precisa dele quando o número que ela
// mostra muda: o redesenho sai no máximo cinco vezes por segundo.
//
// O "no nível" (`nivelOk`) tem folga para sair (F9): é ele que a tela mostra,
// e é ele que decide, no toque, se a foto saiu torta.
let paraNivel = function () {};
let nivelT = null;
function recebeNivel(n) {
  const c = view.camera;
  if (!c) return;
  const antes = c.nivel, okAntes = !!c.nivelOk;
  c.nivel = n;
  c.nivelOk = NIVEL.noNivel(n, okAntes);
  const mudou = okAntes !== c.nivelOk || !antes !== !n || (n && antes && (antes.lado !== n.lado || antes.frente !== n.frente));
  if (!mudou || nivelT) return;
  nivelT = setTimeout(function () { nivelT = null; if (view.camera) render(); }, 200);
}

// ---------- a sequência ----------
// Um toque e as poses saem uma atrás da outra (aprovado em 03/11; R24 e R25
// em docs/fotos/01-captura.md): depois de cada foto a voz diz o giro e a pose
// seguinte, e a contagem curta começa quando a voz ACABA — não antes, que é
// quando ele ainda está girando. `sequencia` é o número da vez: um toque novo,
// parar ou sair da câmera o avança, e a continuação que esperava a voz de uma
// vez antiga morre ao chegar.
let sequencia = 0;
/** Depois da voz, os segundos de contagem até o disparo. Mais quando há giro. */
const PAUSA_DA_POSE = 3, PAUSA_DO_GIRO = 5;
function seguirDepoisDaFala(giro) {
  const c = view.camera;
  if (!c || !c.seguido) return null;
  const vez = sequencia;
  return function () {
    if (view.camera !== c || !c.seguido || vez !== sequencia || c.contagem != null) return;
    if (deteccaoAtiva(c)) { esperaParadoEDispara(c, giro ? PAUSA_DO_GIRO : PAUSA_DA_POSE); return; }
    contaEDispara(giro ? PAUSA_DO_GIRO : PAUSA_DA_POSE);
  };
}

CTX.abreCamera = async function () {
  const v = view.protocolo;
  if (!v) return;
  // A permissão de movimento só pode ser pedida DENTRO do toque (iOS): antes
  // de qualquer await, ou o pedido é recusado sem nem perguntar.
  const podeNivel = NIVEL.pedePermissao();
  const fd = fantasmaDaPose(v.pose, v.d, quemTira);
  const hoje = sessaoDe(S.protocolo.sessoes, v.d);
  view.camera = {
    erro: null, pronta: false,
    fantasma: true, fantasmaD: fd,
    opacidade: 45, grade: false,
    // 10s por padrão: é quanto leva para andar três metros e parar de balançar
    timer: 10, contagem: null,
    seguido: false, nivel: null, nivelOk: false, lente: null,
    quem: quemTira,
    // Com alguém tirando, a sessão começa pelo AJUSTE (F2, F3): altura e
    // distância uma vez, na primeira pose, e ninguém sai do lugar até o fim.
    // Câmera reaberta no meio da sessão não repete: as fotos já têm o lugar.
    ajuste: quemTira === 'alguem' && !(hoje && Object.keys(hoje.fotos).length),
    torta: null, miniatura: null, guardando: false, anunciada: null,
    // As três luzes do disparo (visual novo; docs/redesign-3/02-captura.md):
    // o que quem fotografa conferiu a olho, e se escolheu tirar mesmo assim.
    // No visual antigo nada disso trava nem é gravado.
    v3: true, conferi: {}, forcado: false
  };
  movimento = NIVEL.criaMovimento();
  entraNoDestino('camera'); render();
  garanteBytesDoCorpo(fd ? [v.d, fd] : [v.d]);

  const r = await CAM.abre();
  if (!view.camera) { if (r.ok) CAM.fecha(r.stream); return; }   // saiu enquanto abria
  if (!r.ok) { view.camera.erro = r.msg; render(); return; }
  streamCamera = r.stream;
  const aberta = view.camera;
  // a 1× antes de ler a lente: o que fica gravado é o zoom que a câmera
  // devolveu depois do pedido (F5)
  await CAM.fixaZoom(r.stream);
  if (view.camera !== aberta) return;
  aberta.pronta = true;
  aberta.lente = CAM.lenteDe(r.stream);
  podeNivel.then(function (ok) {
    if (ok && view.camera === aberta) {
      paraNivel();
      paraNivel = NIVEL.escuta(recebeNivel, function (gps) { movimento.registra(gps, Date.now()); });
    }
  });
  render();
  if (aberta.ajuste) falaTexto(FALA_DO_AJUSTE);
  else falaPose(v.pose);
};

/** Quem fotografa acertou altura e distância: a primeira pose começa (F22). */
CTX.ajustado = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v || !c.ajuste) return;
  if (c.v3 && !liberadoNoToque(c)) return;
  preparaAudio();
  c.ajuste = false;
  render();
  falaPose(v.pose);
};

/** A pessoa não ouviu: a fala de agora, de novo (F20). Nunca se repete sozinha. */
CTX.repeteFala = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v) return;
  preparaAudio();
  if (c.ajuste) falaTexto(FALA_DO_AJUSTE);
  else falaPose(v.pose);
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

/** Para a contagem E a sequência: parar é parar tudo, não só esta foto. */
CTX.cancelaDisparo = function () {
  clearTimeout(contagemT); contagemT = null;
  sequencia++;
  if (view.camera) { view.camera.contagem = null; view.camera.seguido = false; }
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
  // os três últimos também em voz (a D, estado 2: "três, dois, um")
  if (n <= 3) falaTexto(['um', 'dois', 'três'][n - 1]);
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
/**
 * O clarão é do DISPARO QUE GUARDOU: o número do disparo vira a chave do nó na
 * câmera, então cada foto ganha um nó novo e a animação recomeça. Quem apaga o
 * branco é a própria animação (`.cam-clarao`, que termina em opacidade 0 e,
 * fora do portão do movimento, já nasce apagada) — e não um relógio aqui que
 * desmontasse o nó e pedisse outro desenho. A próxima tentativa de foto o
 * limpa em `capturaAgora`, para que a pose que não coube não herde o clarão.
 *
 * Contador e não `Date.now()`: com o relógio parado (os testes fixam o
 * relógio), dois disparos teriam a mesma chave e o segundo não clarearia.
 */
let disparos = 0;
function clarao() {
  if (!view.camera) return;
  view.camera.clarao = ++disparos;
}
/**
 * A instrução por VOZ (a D, estado 2, hipótese B): a três metros nada precisa
 * ser lido. A pose e o primeiro passo dela, em português; sem síntese de voz no
 * aparelho, o desenho da tela segue valendo sozinho.
 */
function falaTexto(texto, junto, aoAcabar) {
  // O fim da fala, para quem precisa esperar por ele (a sequência). Pelo
  // `onend` quando a voz avisa, e pelo relógio quando não avisa: sem síntese no
  // aparelho, ou com o `onend` que o Safari às vezes engole. O que chegar
  // primeiro vale, uma vez só.
  let feito = false, t = null;
  const fim = function () {
    if (feito) return;
    feito = true; clearTimeout(t);
    aoAcabar();
  };
  if (aoAcabar) t = setTimeout(fim, duracaoDaFala(texto));
  try {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    if (aoAcabar) { u.onend = fim; u.onerror = fim; }
    if (!junto) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
/** Quanto uma frase leva para ser dita em português, com folga: uns 13 caracteres por segundo. */
function duracaoDaFala(texto) { return 1500 + String(texto || '').length * 75; }

/**
 * O giro em palavras. Na ordem do protocolo ele é sempre um quarto de volta
 * para a ESQUERDA (frente → perfil direito → costas → perfil esquerdo); os
 * outros só aparecem quando ele anda fora da ordem.
 */
function giroFalado(giro) {
  if (giro === 90) return 'Gire para a sua esquerda, um quarto de volta. Pés na marca. ';
  if (giro === 180) return 'Gire meia volta. Pés na marca. ';
  if (giro === 270) return 'Gire para a sua direita, um quarto de volta. Pés na marca. ';
  return '';
}
/** O mesmo giro, na tela: grande, lido a três metros. */
function giroEscrito(giro) {
  if (giro === 90) return '↺ gire à esquerda';
  if (giro === 180) return 'gire meia volta';
  if (giro === 270) return '↻ gire à direita';
  return null;
}
/**
 * O giro entre duas poses, em graus, sempre para o mesmo lado (a D, estado 4:
 * "girar é desenho, não frase" — e a voz diz junto). 0 quando não há giro.
 */
function giroEntre(deId, paraId) {
  const lista = posesDo(S.protocolo.poses);
  const de = lista.filter(function (p) { return p.id === deId; })[0];
  const para = lista.filter(function (p) { return p.id === paraId; })[0];
  if (!de || !para) return 0;
  return (((para.giro || 0) - (de.giro || 0)) % 360 + 360) % 360;
}
function falaPose(poseId, deId, aoAcabar) {
  const lista = posesDo(S.protocolo.poses);
  const i = lista.findIndex(function (p) { return p.id === poseId; });
  const p = lista[i];
  if (!p) { if (aoAcabar) aoAcabar(); return; }
  const giro = deId ? giroEntre(deId, poseId) : 0;
  // a frase própria da voz (`voz`), curta e no imperativo; sem ela, a primeira
  // linha da execução
  falaTexto(giroFalado(giro) + 'Pose ' + (i + 1) + ' de ' + lista.length + '. ' + p.n + '. ' +
            (p.voz || (Array.isArray(p.como) && p.como[0]) || ''), false, aoAcabar);
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

/**
 * O toque no disparo.
 *
 * Com alguém tirando, a foto é o quadro do instante em que o dedo ENCOSTA
 * (F8): o toque empurra o celular, e o quadro que já estava pronto foi feito
 * antes do empurrão. Por isso o botão chama com `'toque'` no `pointerdown`, e
 * o clique que o mesmo toque gera logo depois não dispara de novo. O clique
 * sozinho (teclado, leitor de tela) continua disparando.
 */
let toqueEm = -1e9;
function agoraMs() { return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(); }
CTX.disparaCamera = function (origem) {
  const c = view.camera;
  if (!c || !c.pronta || c.contagem != null) return;
  if (origem === 'toque') toqueEm = agoraMs();
  else if (agoraMs() - toqueEm < 1000) return;
  preparaAudio();                      // o gesto de toque é o que libera o áudio
  // no visual novo, o botão só vale com as três luzes verdes (ou "mesmo assim")
  if (c.v3 && !liberadoNoToque(c)) return;
  // Com alguém tirando, um toque é UMA foto, e nada sai sozinho (pedido do
  // dono, 04/11): quem fotografa vê a pessoa e decide a hora.
  if (c.quem === 'alguem') {
    if (c.ajuste) { CTX.ajustado(); return; }
    if (c.torta || c.guardando) return;
    capturaAgora();
    return;
  }
  // um toque é a sessão inteira: depois desta foto, as que faltam seguem
  // sozinhas. E um toque novo vale mais que a continuação que esperava a voz.
  sequencia++;
  c.seguido = true;
  if (deteccaoAtiva(c)) { esperaParadoEDispara(c, c.timer || PAUSA_DA_POSE); return; }
  if (!c.timer) { capturaAgora(); return; }
  contaEDispara(c.timer);
};

async function capturaAgora() {
  const c = view.camera, v = view.protocolo;
  if (!c || !v || c.guardando) return;
  c.clarao = null;
  const el = document.querySelector('.cam-video, .v3-cam-video');
  if (!CAM.pronto(el)) { c.contagem = null; toast('A câmera ainda não está pronta.'); render(); return; }
  // O nível e o giro do INSTANTE do toque, lidos antes de montar o quadro
  // (F8): a redução leva alguns milissegundos, e o empurrão do dedo entraria
  // na leitura. Torta é o que a tela mostrava no toque — o "no nível" com a
  // folga —, e só quando há leitura: sem sensor, não há como dizer.
  const dados = dadosDaCamera(c);
  const torta = c.quem === 'alguem' && !!c.nivel && !c.nivelOk;
  c.guardando = true;
  try {
    // O quadro sai SEMPRE em pé (ver `quadroDoVideo` em infra/fotos.ts): era
    // aqui que três de quatro fotos saíam deitadas e cortadas, em 03/11.
    const reduzida = await pixelsDaCamera(el, dados);
    // O QUADRO PRETO (a D, estado 6; F78): a foto não é guardada, a pose volta
    // para o fim da fila, e a voz diz — ele está a três metros e não vê a tela.
    if (quaseTodoPreto(reduzida.brilho)) {
      c.contagem = null;
      const era = v.pose;
      v.adiadas = Object.assign({}, v.adiadas, { [era]: 1 });
      const prox = proximaComAdiadas(sessaoDe(S.protocolo.sessoes, v.d));
      const lista = posesDo(S.protocolo.poses);
      const nome = function (id) { const p = lista.filter(function (x) { return x.id === id; })[0]; return p ? p.n : id; };
      if (prox && prox !== era) {
        v.pose = prox;
        c.giro = giroEntre(era, prox) || null;
        falaTexto('A foto saiu preta. Esta pose volta no fim. Siga: ' + nome(prox) + '.', false, seguirDepoisDaFala(c.giro));
      } else {
        c.giro = null;
        falaTexto('A foto saiu preta. Vamos de novo.', false, seguirDepoisDaFala(0));
      }
      c.preta = era;
      c.guardando = false;
      render();
      return;
    }
    // A FOTO TORTA (pedido do dono, 04/11): a foto sai — quem tocou viu a
    // pessoa pronta, e o clique avisa que ela pode soltar —, mas não é
    // guardada sem pergunta. Quem fotografa escolhe entre repetir, que é o
    // caminho certo e leva o destaque, e registrar assim mesmo, com a
    // inclinação verdadeira gravada junto. A voz espera a resposta (F20).
    if (torta) {
      c.contagem = null;
      c.torta = { reduzida: reduzida, pose: v.pose, txt: NIVEL.foraDoNivel(dados.nivel) };
      c.guardando = false;
      obturador();
      render();
      return;
    }
    await guardaESegue(c, v, reduzida, false);
  } catch (e) {
    c.contagem = null;
    c.seguido = false;
    c.guardando = false;
    toast('Não deu para guardar a foto.');
    render();
  }
}

/**
 * OS PIXELS DA FOTO (F27): a foto de verdade, pelo `takePhoto` da câmera
 * aberta, ou o quadro do vídeo como reserva.
 *
 * O quadro é pego JÁ, no instante do toque, antes de pedir a foto — se ela
 * falhar, a reserva é do mesmo instante, e não de depois da espera. A foto só
 * vale se chegar em pé e em 3:4, como o quadro que a tela mostrava; senão ela
 * não é a foto que quem fotografou enquadrou.
 *
 * O original só fica quando há nuvem para recebê-lo: sem conta, 4,7 MB por
 * foto ficariam acumulando no aparelho, sem destino. A cópia da tela, reduzida
 * da foto de verdade, é melhor que a do quadro do mesmo jeito.
 */
async function pixelsDaCamera(el, dados) {
  const t0 = Date.now();
  const pQuadro = CORPO.reduzDoVideo(el);
  pQuadro.catch(function () {});
  const foto = await CAM.tiraFoto(streamCamera);
  let r = null, original = null;
  if (foto) {
    try {
      const daFoto = await CORPO.reduz(foto);
      if (!deitada(daFoto) && daFoto.a && Math.abs(daFoto.l / daFoto.a - 0.75) < 0.02) { r = daFoto; original = foto; }
    } catch (e) {}
  }
  if (!r) r = await pQuadro;
  const out = Object.assign(r, { via: 'app', origem: original ? 'foto' : 'quadro' }, dados);
  if (original) {
    // a foto leva uma fração de segundo depois do toque, e o empurrão do dedo
    // pode entrar nela: o tremor é o maior do toque até ela voltar
    const durante = movimento.maxEntre(t0, Date.now());
    if (durante != null) {
      const toque = Math.round(Math.max(out.mov ? out.mov.toque : 0, durante) * 10) / 10;
      out.mov = { toque: toque, seg: out.mov ? out.mov.seg : Math.round(durante * 100) / 100 };
    }
    if (NUVEM.sessao()) out.original = { blob: original, ext: CORPO.extDoTipo(original.type), l: r.fonte.l, a: r.fonte.a };
  }
  // a tremida entra no fora do padrão com o tremor final, o da foto inteira
  if (Array.isArray(out.fora) && out.mov && out.mov.toque > NIVEL.TREMOR && out.fora.indexOf('tremida') < 0) {
    out.fora = out.fora.concat(['tremida']);
  }
  return out;
}

/**
 * Guarda a foto da pose em foco e segue para a próxima: o obturador, o clarão,
 * o giro na tela e a fala da pose nova. Sozinho, a fala puxa a contagem; com
 * alguém tirando, a miniatura fica no canto e a fala espera 1,5 s, tempo de
 * quem fotografa tocar em Refazer antes de a pessoa mudar de posição (F20).
 */
async function guardaESegue(c, v, reduzida, jaClicou) {
  const era = v.pose;
  const r = await guardaFotoDaPose(v.d, era, reduzida);
  c.contagem = null;
  c.guardando = false;
  // não coube: a sessão para aqui, e a tela diz (estado 9)
  if (r && r.parou) { c.seguido = false; sequencia++; aviso(); render(); return; }
  const prox = r;
  // a sessão continua AQUI: são várias poses, e sair e voltar a cada uma seria
  // pior que o problema que esta tela resolve
  if (prox) {
    c.fantasmaD = fantasmaDaPose(prox, v.d, c.quem);
    garanteBytesDoCorpo(c.fantasmaD ? [c.fantasmaD] : []);
  }
  if (!jaClicou) obturador();
  clarao();
  c.preta = null;
  // o giro até a pose nova, grande na tela e dito junto (a D, estado 4)
  c.giro = prox ? (giroEntre(era, prox) || null) : null;
  if (c.quem === 'alguem') {
    mostraMiniatura(c, v.d, era, reduzida);
    clearTimeout(falaT);
    c.anunciada = null;
    falaT = setTimeout(function () {
      falaT = null;
      if (view.camera !== c) return;
      c.anunciada = prox;
      if (prox) falaPose(prox, era);
      else falaTexto(FALA_DO_FIM);
    }, 1500);
  } else if (prox) {
    falaPose(prox, era, seguirDepoisDaFala(c.giro));
  } else {
    c.seguido = false;
    falaTexto(FALA_DO_FIM);
  }
  // a última foto saiu nesta câmera: o visual novo troca o disparo por "Ver a sessão"
  c.fim = !prox;
  render();
  if (!prox) toast('Sessão completa. As ' + posesDo(S.protocolo.poses).length + ' poses estão registradas.');
}

/**
 * A miniatura da foto que acabou de ser guardada, 3 s no canto do quadro, com
 * Refazer (F17). Quem fotografa confere nela a linha da pose; a que pode ter
 * tremido (F12) diz isso, e o Refazer dela leva o destaque.
 */
function mostraMiniatura(c, d, pose, reduzida) {
  const ses = sessaoDe(S.protocolo.sessoes, d);
  const ref = ses && ses.fotos[pose];
  c.miniatura = {
    pose: pose,
    url: ref ? CORPO.urlDaFoto(d, pose, ref) : null,
    tremida: !!(reduzida.mov && reduzida.mov.toque > NIVEL.TREMOR)
  };
  clearTimeout(miniaturaT);
  miniaturaT = setTimeout(function () {
    miniaturaT = null;
    if (view.camera === c && c.miniatura && c.miniatura.pose === pose) { c.miniatura = null; render(); }
  }, 3000);
}

/**
 * Volta a uma pose para tirá-la de novo, e a voz diz (F22: "Vamos repetir a
 * pose três", e a frase dela). Se a pessoa já tinha ouvido a pose seguinte e
 * girado, a voz manda girar de volta.
 */
function voltaParaPose(c, v, pose) {
  const giro = c.anunciada && c.anunciada !== pose ? giroEntre(c.anunciada, pose) : 0;
  c.anunciada = null;
  c.fim = false;
  v.pose = pose;
  c.giro = null;
  c.fantasmaD = fantasmaDaPose(pose, v.d, c.quem);
  garanteBytesDoCorpo(c.fantasmaD ? [c.fantasmaD] : []);
  render();
  const lista = posesDo(S.protocolo.poses);
  const i = lista.findIndex(function (p) { return p.id === pose; });
  const p = lista[i];
  if (p) falaTexto(giroFalado(giro) + 'Vamos repetir a pose ' + (i + 1) + '. ' +
                   (p.voz || (Array.isArray(p.como) && p.como[0]) || ''));
}

/** Refazer a foto da miniatura: a fala da pose seguinte, se ainda não saiu, não sai. */
CTX.refazUltima = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v || !c.miniatura || c.guardando) return;
  const pose = c.miniatura.pose;
  clearTimeout(falaT); falaT = null;
  clearTimeout(miniaturaT); miniaturaT = null;
  c.miniatura = null;
  voltaParaPose(c, v, pose);
};

/** A foto torta: repetir, o caminho certo. Nada é guardado. */
CTX.repeteTorta = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v || !c.torta) return;
  const pose = c.torta.pose;
  c.torta = null;
  voltaParaPose(c, v, pose);
};

/** A foto torta: registrar assim mesmo, com a inclinação verdadeira no registro. */
CTX.registraTorta = async function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v || !c.torta || c.guardando) return;
  const t = c.torta;
  c.torta = null;
  c.guardando = true;
  // guardada torta de propósito: fica marcada fora do padrão no nível
  t.reduzida.fora = (Array.isArray(t.reduzida.fora) ? t.reduzida.fora : []).concat(['nivel']);
  render();
  try {
    v.pose = t.pose;
    await guardaESegue(c, v, t.reduzida, true);
  } catch (e) {
    c.guardando = false;
    toast('Não deu para guardar a foto.');
    render();
  }
};

/** A lente e o nível no instante do disparo, para o registro da captura. */
function dadosDaCamera(c) {
  const r = { modo: c.quem };
  if (c.lente && c.lente.nome) r.lente = c.lente.nome;
  if (c.lente && typeof c.lente.zoom === 'number') r.zoom = c.lente.zoom;
  if (c.nivel) r.nivel = c.nivel;
  const m = movimento.resumo(Date.now());
  if (m) r.mov = m;
  // o que não estava verde no disparo (a tremida entra depois, em `pixelsDaCamera`)
  if (c.v3) {
    r.fora = apagadas(luzesDaCamera(c));
    const ativa = deteccaoAtiva(c);
    r.det = { ativa: ativa, qps: ativa ? c.det.qps : 0 };
    const enq = ativa ? alinhamentoAutomatico(c.det.leitura, Date.now()) : null;
    if (enq) r.enqAuto = enq;
  }
  return r;
}

/** As três luzes de agora: o nível pelo sensor, altura e distância conferidas. */
function luzesDaCamera(c) {
  const det = deteccaoAtiva(c) ? { altura: c.det.leitura.altura, distancia: c.det.leitura.distancia } : null;
  return luzes({ nivel: c.nivel ? !!c.nivelOk : null, det: det, conferi: c.conferi });
}
/** Quem fotografa conferiu a olho uma luz que o app não mede (o caminho de reserva). */
CTX.confereLuz = function (k, on) {
  const c = view.camera;
  if (!c || LUZES.indexOf(k) < 0 || luzesDaCamera(c).medida[k]) return;
  c.conferi = Object.assign({}, c.conferi, { [k]: !!on });
  render();
};
/**
 * "Tirar mesmo assim": o botão destrava, e cada foto guarda o que não estava
 * verde. Com alguém tirando, encerra também o ajuste.
 */
CTX.tiraMesmoAssim = function () {
  const c = view.camera;
  if (!c) return;
  c.forcado = true;
  if (c.ajuste) CTX.ajustado(); else render();
};
/** O que a câmera do visual novo mostra além de `cameraViva`. */
CTX.cameraV3 = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v) return null;
  const lista = posesDo(S.protocolo.poses);
  const i = Math.max(0, lista.findIndex(function (p) { return p.id === v.pose; }));
  const l = luzesDaCamera(c);
  // as posições: um grupo novo a cada giro do corpo
  const grupos = [];
  lista.forEach(function (p, k) { if (k === 0 || p.giro !== lista[k - 1].giro) grupos.push(k); });
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const feitas = lista.filter(function (p) { return ses && ses.fotos[p.id]; }).length;
  return {
    luzes: l,
    apagadas: apagadas(l),
    liberado: liberadoNoToque(c),
    // a detecção: medindo, carregando, ou o motivo de ter saído
    deteccao: c.detParou ? 'reserva' : deteccaoAtiva(c) ? 'ativa' : 'carregando',
    dicaLado: deteccaoAtiva(c) && c.det.leitura.pessoa ? c.det.leitura.lado : 'centro',
    pessoa: deteccaoAtiva(c) ? !!c.det.leitura.pessoa : null,
    dicaAltura: deteccaoAtiva(c) ? c.det.leitura.dicaAltura : null,
    dicaDistancia: deteccaoAtiva(c) ? c.det.leitura.dicaDistancia : null,
    esperando: !!c.esperando,
    forcado: !!c.forcado,
    ajuste: !!(c.quem === 'alguem' && c.ajuste),
    grupos: grupos,
    posicao: grupos.filter(function (g) { return g <= i; }).length,
    posicoes: grupos.length,
    feitas: feitas,
    // tudo tirado NESTA câmera; reaberta para refazer uma pose, o disparo continua
    completa: !!c.fim && feitas === lista.length,
    fala: lista[i].voz || (Array.isArray(lista[i].como) && lista[i].como[0]) || '',
    confira: lista[i].confira || ''
  };
};

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

/** "0,4°": o nível com uma casa, na vírgula daqui. */
function fmtGrau(n) { return String(Math.round(n * 10) / 10).replace('.', ',') + '°'; }

/**
 * O que o botão promete: a sessão inteira, quando é ela que vai sair do toque.
 * Refazer é uma pose só — o que vier depois dela é a sequência seguindo para
 * o que falta, e não o que o botão diz.
 */
function rotuloDoDisparo(ses, lista, pose) {
  if (ses && ses.fotos[pose]) return 'refazer esta pose';
  const faltam = lista.filter(function (p) { return !(ses && ses.fotos[p.id]); }).length;
  return faltam > 1 ? 'tirar as ' + faltam + ' fotos' : 'tirar a foto';
}

/** O que a tela da câmera consome. */
CTX.cameraViva = function () {
  const c = view.camera, v = view.protocolo;
  if (!c || !v) return null;
  const lista = posesDo(S.protocolo.poses);
  const i = Math.max(0, lista.findIndex(function (p) { return p.id === v.pose; }));
  const ses = sessaoDe(S.protocolo.sessoes, v.d);
  const outra = c.fantasmaD ? sessaoDe(S.protocolo.sessoes, c.fantasmaD) : null;
  const refOutra0 = outra ? outra.fotos[v.pose] : null;
  // com alguém tirando, só a foto tirada com as linhas (D1, ver `fantasmaDaPose`)
  const refOutra = c.quem === 'alguem' && !comAsLinhas(refOutra0) ? null : refOutra0;

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
    datas: datasDoFantasma(v.d, v.pose).filter(function (o) {
      if (c.quem !== 'alguem') return true;
      const s = sessaoDe(S.protocolo.sessoes, o.d);
      return comAsLinhas(s && s.fotos[v.pose]);
    }),
    // A sobreposta vai CRUA, sem o ajuste que ela ganhou depois (aprovado em
    // 03/11): o quadro vivo também é cru, e é contra a sala da foto como saiu
    // que o celular se posiciona. Com o zoom do ajuste por cima, a sala não
    // casava em lugar nenhum.
    refUrl: outra && refOutra ? CORPO.urlDaFoto(outra.d, v.pose, refOutra) : null,
    refTxt: outra ? fmtDate(instanteDaData(outra.d)) : '',
    opacidade: c.opacidade,
    timer: c.timer,
    contagem: c.contagem,
    seguido: !!c.seguido,
    quem: c.quem,
    // Com alguém tirando, o botão é UMA foto; antes dela, o ajuste
    rotulo: c.quem === 'alguem'
      ? (c.ajuste ? 'Ajustado' : (ses && ses.fotos[v.pose]) ? 'refazer esta pose' : 'tirar a foto')
      : rotuloDoDisparo(ses, lista, v.pose),
    ajuste: c.quem === 'alguem' && c.ajuste ? PASSOS_DO_AJUSTE : null,
    // o que quem fotografa confere antes do toque: a linha fixa e a da pose
    // (F15, F16) — com a miniatura no canto, a da foto que acabou de sair —; e
    // o erro comum em cima do quadro (F18)
    confira: [CONFERE_SEMPRE, ((c.miniatura && lista.filter(function (p) { return p.id === c.miniatura.pose; })[0]) || lista[i]).confira].filter(Boolean),
    erroComum: lista[i].erro,
    torta: c.torta ? { txt: c.torta.txt } : null,
    miniatura: c.miniatura ? {
      url: c.miniatura.url, tremida: c.miniatura.tremida,
      pose: (lista.filter(function (p) { return p.id === c.miniatura.pose; })[0] || {}).n || ''
    } : null,
    guardando: !!c.guardando,
    nivel: c.nivel ? { lado: fmtGrau(c.nivel.lado), frente: fmtGrau(c.nivel.frente), ok: !!c.nivelOk } : null,
    clarao: !!c.clarao,
    // a chave do nó do clarão: um disparo, um nó, uma animação
    disparo: c.clarao || 0,
    giro: c.giro || null,
    giroTxt: giroEscrito(c.giro),
    preta: c.preta ? (lista.filter(function (p) { return p.id === c.preta; })[0] || {}).n || null : null,
    // os blocos das poses, do tamanho de um dedo (estado 2): em que pose está,
    // e quais já fecharam, legível a três metros
    pontos: lista.map(function (p) {
      return { id: p.id, n: p.n, feita: !!(ses && ses.fotos[p.id]), atual: p.id === v.pose,
               naoGuardada: !!(v.naoGuardada && v.naoGuardada.pose === p.id),
               adiada: !!(v.adiadas && v.adiadas[p.id] && !(ses && ses.fotos[p.id])) };
    })
  };
};
