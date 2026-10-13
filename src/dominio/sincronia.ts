// A fusão de dois estados.
//
// Este módulo existe por causa de um modo de falha específico, e silencioso:
// você treina e registra no celular; chega em casa e abre o notebook, que ainda
// tem o estado de ontem; o notebook salva qualquer coisa e sobrescreve a nuvem.
// A sessão da academia some sem erro nenhum.
//
// Sincronizar documento inteiro com "o último a escrever vence" faz exatamente
// isso. Por isso a nuvem guarda o estado, mas quem decide o que fica é esta
// função — pura, sem rede e sem estado global, testável contra fixtures como
// as migrações ao lado.
//
// A regra vem da forma do dado, não de uma preferência:
//
//   Coleções com chave natural (séries, sessões, medidas, cardio) são unidas
//   pela chave. Nada se perde, porque os dois lados só acrescentam.
//
//   Documentos que se edita por cima (programa, plano de comida, cadência) não
//   têm fusão possível: vence o lado alterado por último, inteiro. É a única
//   linha com perda possível, e ela é aceitável porque documento se edita
//   deliberadamente, num aparelho por vez.
//
//   Apagar precisa de LÁPIDE. Sem ela, unir por chave RESSUSCITA o que você
//   apagou no outro aparelho — o registro ainda existe lá, e a união o traz de
//   volta. A lápide diz "isto foi apagado em T", e vence qualquer cópia mais
//   antiga que T.

import type {
  Cardio, Corpo, Estado, EntradaProgLog, FotoRef, IdEx, Log, Marca, ModeloDeAula, PoseId,
  PromoPendente, QualMarca, Sessao, SessaoFoto
} from './tipos';
import type { ComoFoiARefeicao, DiaComida, DiaComidaHist } from './nutricao/tipos';
import { MARCAS_DO_CORPO } from './corpo';
import type { LeituraDeGordura } from './corpo';

/** Limites por coleção, iguais aos que o app aplica ao gravar. */
const TETO = { logs: 500, done: 3000, progLog: 300, body: 400, cardio: 200, protocolo: 200, aulas: 60, comida: 4000, promo: 60 };

/** Lápides mais velhas que isto são podadas: o que sumiu há meses já sumiu dos dois lados. */
export const LAPIDE_DIAS = 90;

// O carimbo de alteração não tem o mesmo nome em toda coleção, e não adianta
// fingir que tem: `u` já significa "exercício por tempo" em Log, e `m` já é o
// modal em Cardio. Em vez de uma forma comum torturada, cada coleção diz como
// se lê o carimbo dela — e a fusão só recebe a função.
const carimboM = (x: { m?: number }) => typeof x.m === 'number' ? x.m : 0;
const carimboAlt = (x: { alt?: number }) => typeof x.alt === 'number' ? x.alt : 0;

/** O que a fusão fez, para o app poder contar em vez de mudar o histórico em silêncio. */
export interface ResumoDaFusao {
  /** entradas de série que vieram do outro lado */
  series: number;
  sessoes: number;
  medidas: number;
  cardio: number;
  /** fotos de acompanhamento que vieram do outro lado */
  fotosCorpo: number;
  /**
   * ajustes de foto que só existem DESTE lado.
   *
   * Conta separado de `fotosCorpo` porque não é foto nova: é recorte que o
   * outro aparelho ainda não viu, e é o que obriga a empurrar depois de uma
   * fusão que, no resto, não trouxe nada.
   */
  ajustesCorpo: number;
  /** registros que uma lápide removeu */
  apagados: number;
  /** de que lado vieram os documentos (programa, plano de comida, cadência) */
  documentos: 'local' | 'remoto' | 'iguais';
  /** true quando nada mudou de nenhum lado — o app não precisa nem salvar */
  identicos: boolean;
}

// ---------- chaves ----------
// A chave de lápide e a chave de fusão precisam ser a MESMA string, senão a
// lápide não alcança o registro que ela deveria matar. Por isso as duas saem
// daqui, e nunca de uma concatenação escrita à mão no meio do app.

/**
 * A identidade de uma série no histórico.
 *
 * Não é só o `sid`: o mesmo aparelho pode ser usado em duas posições do mesmo
 * treino, e aí são duas entradas na mesma sessão. Quem separa é a posição de
 * origem, que é o que `sl` guarda quando difere da chave.
 */
export function chaveDeLog(idEx: IdEx, l: Pick<Log, 'sid' | 'sl'>): string {
  return 'log:' + idEx + ':' + l.sid + ':' + (l.sl || idEx);
}
export function chaveDeSessao(m: Pick<Sessao, 'sid'>): string { return 'done:' + m.sid; }
/**
 * Uma medida do corpo. A chave é a grandeza mais o instante.
 *
 * `qual` é `QualMarca` e não `'peso' | 'cintura'`: as cinco chaves da
 * bioimpedância entraram na migração 9 → 10, e uma chave de fusão que não
 * alcançasse `bioGordura` faria a medida nova nunca morrer por lápide — o
 * outro aparelho a traria de volta depois de apagada.
 */
export function chaveDeMarca(qual: QualMarca, x: Pick<Marca, 't'>): string {
  return qual + ':' + x.t;
}
export function chaveDeCardio(c: Pick<Cardio, 't'>): string { return 'cardio:' + c.t; }
/** Um dia de comida do histórico. A chave é a data — duas não existem. */
export function chaveDeDiaComida(h: Pick<DiaComidaHist, 'd'>): string { return 'comida:' + h.d; }
/** Uma refeição marcada dentro de um dia. Desmarcar precisa de lápide própria. */
export function chaveDeRefeicaoFeita(dia: string, refId: string): string {
  return 'comida:' + dia + ':' + refId;
}

/**
 * Uma pergunta de programa que espera decisão. A chave é o `sid` da sessão.
 *
 * `sid` sozinho, e não `day + sid`: `sid` já é a identidade de uma sessão neste
 * módulo — `chaveDeSessao` usa só ele —, nasce no começo da sessão e nunca é
 * reatribuído. `day` é editável no meio do treino, e entrar na chave faria a
 * MESMA pergunta fundir como duas entradas se os dois aparelhos tivessem
 * registrado letras diferentes para a mesma sessão; ele responderia duas vezes.
 *
 * Entrada anterior ao plano 10 não tem `sid`, e a migração o preencheu com `t`.
 * O `|| p.t` aqui é o mesmo caminho, para o caso de um backup antigo chegar por
 * fora da migração.
 */
export function chaveDePromo(p: Pick<PromoPendente, 'sid' | 't'>): string {
  return 'promo:' + (typeof p.sid === 'number' ? p.sid : p.t);
}

/** O modelo de aula. A chave é o id, que nasce com ele e não muda ao renomear. */
export function chaveDeAula(a: Pick<ModeloDeAula, 'id'>): string { return 'aula:' + a.id; }
export function chaveDeDescanso(dataISO: string): string { return 'descanso:' + dataISO; }
export function chaveDeLeitura(l: { d: string }): string { return 'gordura:' + l.d; }
export function chaveDeFoto(idEx: IdEx): string { return 'foto:' + idEx; }

/**
 * A sessão de fotos do corpo. A chave é a DATA — é a chave natural do
 * protocolo, e duas sessões no mesmo dia não existem.
 */
export function chaveDeSessaoFoto(d: string): string { return 'corpo:' + d; }

/**
 * Uma foto dentro da sessão. Precisa de lápide PRÓPRIA: refazer uma pose apaga
 * a anterior, e sem esta chave o outro aparelho a traria de volta na fusão —
 * a sessão continuaria existindo, então a lápide da sessão não a alcançaria.
 */
export function chaveDeFotoDoCorpo(d: string, pose: PoseId): string { return 'corpo:' + d + ':' + pose; }

/**
 * Uma linha do diário do programa. A chave é o instante mais o dia.
 *
 * Estava escrita à mão dentro de `funde`, e é a única que estava: as outras
 * todas saem daqui justamente para a lápide e a fusão não poderem divergir.
 * `lapidesDoApagamento` precisa dela pelo mesmo motivo que as demais.
 */
export function chaveDeProgLog(x: Pick<EntradaProgLog, 't' | 'day'>): string {
  return 'prog:' + x.t + ':' + x.day;
}

// ---------- o apagamento em bloco ----------

/**
 * Toda chave de fusão que um estado OCUPA, coleção por coleção.
 *
 * Espelha `funde` linha por linha, guardas inclusive: chave que existe aqui e
 * não lá seria lápide que não mata nada, e chave que existe lá e não aqui é
 * registro que o apagamento não alcança. As duas formas de errar são silenciosas,
 * e é por isso que esta função não filtra "registro estranho" por conta própria
 * — se a fusão o une sob uma chave, é essa chave que a lápide precisa ter.
 */
function chavesDoEstado(S: Partial<Estado> | null | undefined): Record<string, 1> {
  const k: Record<string, 1> = {};
  if (!S) return k;
  const lista = function <T>(x: unknown): T[] { return Array.isArray(x) ? (x as T[]) : []; };

  const logs = (S.logs || {}) as Record<string, Log[]>;
  Object.keys(logs).forEach(function (idEx) {
    lista<Log>(logs[idEx]).forEach(function (l) { if (l) k[chaveDeLog(idEx, l)] = 1; });
  });
  lista<Sessao>(S.done).forEach(function (x) { if (x) k[chaveDeSessao(x)] = 1; });
  lista<Cardio>(S.cardio).forEach(function (x) { if (x) k[chaveDeCardio(x)] = 1; });
  lista<EntradaProgLog>(S.progLog).forEach(function (x) { if (x) k[chaveDeProgLog(x)] = 1; });
  lista<ModeloDeAula>(S.aulas).forEach(function (x) { if (x) k[chaveDeAula(x)] = 1; });
  lista<PromoPendente>(S.promoPendente).forEach(function (x) { if (x) k[chaveDePromo(x)] = 1; });
  lista<LeituraDeGordura>(S.gordura).forEach(function (x) { if (x) k[chaveDeLeitura(x)] = 1; });

  // o dia de comida e, DENTRO dele, cada refeição marcada: a fusão tem lápide
  // para as duas, e desmarcar uma refeição nunca foi apagar o dia
  lista<DiaComidaHist>(S.comidaHist).forEach(function (h) {
    if (!h || !h.d) return;
    k[chaveDeDiaComida(h)] = 1;
    Object.keys(h.done || {}).forEach(function (id) { k[chaveDeRefeicaoFeita(h.d, id)] = 1; });
  });

  // O dia ABERTO, só pelas MARCAS. Elas não estão em `comidaHist` — o dia só
  // fecha lá na virada da data — e a fusão as une pela mesma chave de refeição,
  // então sem isto a marca de hoje voltava do outro aparelho depois do
  // apagamento. Medido: voltava.
  //
  // Só as marcas, e não o dia: `S.dia` é DOCUMENTO, e o que não é coleção vem
  // do lado com `mtime` mais novo. A água é a exceção dentro da exceção — é
  // contador que fica com o MAIOR dos dois, por desenho, e por isso não há
  // lápide que a alcance.
  const aberto = S.dia as DiaComida | null | undefined;
  if (aberto && aberto.data) {
    Object.keys(aberto.done || {}).forEach(function (id) {
      k[chaveDeRefeicaoFeita(aberto.data, id)] = 1;
    });
  }

  MARCAS_DO_CORPO.forEach(function (qual) {
    lista<Marca>(S.body && S.body[qual]).forEach(function (x) {
      if (x) k[chaveDeMarca(qual, x)] = 1;
    });
  });

  Object.keys(S.descanso || {}).forEach(function (d) { k[chaveDeDescanso(d)] = 1; });
  // referência sem versão a fusão descarta dos DOIS lados, e por isso ela não
  // ressuscita: lápide para ela seria peso sem efeito
  const fotos = (S.fotos || {}) as Record<string, FotoRef>;
  Object.keys(fotos).forEach(function (id) {
    const f = fotos[id];
    if (f && typeof f.v === 'number') k[chaveDeFoto(id)] = 1;
  });

  lista<SessaoFoto>(S.protocolo && S.protocolo.sessoes).forEach(function (s) {
    if (!s || !s.d) return;
    k[chaveDeSessaoFoto(s.d)] = 1;
    Object.keys(s.fotos || {}).forEach(function (pose) {
      const ref = s.fotos[pose];
      if (ref && typeof ref.v === 'number') k[chaveDeFotoDoCorpo(s.d, pose)] = 1;
    });
  });

  return k;
}

/**
 * As lápides de um apagamento em BLOCO.
 *
 * `wipe` não apaga registro por registro: ele monta um estado novo e esvazia as
 * coleções de uma vez. Guardar as lápides antigas não resolveria nada — elas
 * falam dos registros apagados ANTES —, e sem lápide nova a fusão lê o que
 * sobrou no outro aparelho como registro que este simplesmente não tem, e o traz
 * de volta. O aviso promete "isso não tem volta", e tinha.
 *
 * O conserto é fazer o apagamento em bloco virar o que a fusão já sabe ler:
 * **uma lápide por registro que saiu**, com a mesma chave natural que a fusão
 * usa para uni-lo. Daí a forma desta função ser um DIFERENÇA entre dois estados,
 * e não "lápide para tudo que havia": se amanhã o apagamento decidir preservar
 * uma coleção, ela deixa de aparecer no diff e nenhuma lápide a persegue. A
 * decisão de escopo fica num lugar só, que é o estado novo.
 *
 * **O alcance é o que ESTE aparelho conhecia**, e isso é deliberado. Registro
 * que só existe no outro lado não tem lápide e sobrevive; registro que o outro
 * lado editar DEPOIS do apagamento sobrevive também, pela regra que a fusão já
 * tem ("lápide só mata o que é mais velho que ela"). Apagar de menos se conserta
 * repetindo o gesto no outro aparelho; apagar de mais não se conserta.
 */
export function lapidesDoApagamento(
  antes: Partial<Estado> | null | undefined,
  depois: Partial<Estado> | null | undefined,
  agora: number
): Record<string, number> {
  const ficou = chavesDoEstado(depois);
  const saida: Record<string, number> = {};
  Object.keys(chavesDoEstado(antes)).forEach(function (k) {
    if (!ficou[k]) saida[k] = agora;
  });
  return saida;
}

// ---------- as peças ----------

/**
 * Une duas listas pela chave natural.
 *
 * Presente dos dois lados: vence o carimbo mais novo. Sem carimbo os dois — é
 * registro anterior à sincronização — os dois são a mesma coisa de qualquer
 * forma, e fica o local para a fusão ser estável ao repetir.
 *
 * `mortos` é consultado por último: lápide mais nova que o registro o remove.
 */
function uneLista<T>(
  local: T[], remoto: T[],
  chave: (x: T) => string, carimbo: (x: T) => number,
  mortos: Record<string, number>
): { itens: T[]; vindos: number; apagados: number } {
  const por: Record<string, T> = {};
  const daqui: Record<string, 1> = {};
  (Array.isArray(local) ? local : []).forEach(function (x) {
    const k = chave(x); por[k] = x; daqui[k] = 1;
  });
  let vindos = 0;
  (Array.isArray(remoto) ? remoto : []).forEach(function (x) {
    const k = chave(x);
    const meu = por[k];
    if (!meu) { por[k] = x; vindos++; return; }
    if (carimbo(x) > carimbo(meu)) por[k] = x;
  });

  let apagados = 0;
  const itens: T[] = [];
  Object.keys(por).forEach(function (k) {
    const morto = mortos[k];
    // a lápide só mata o que é mais velho que ela: registro editado DEPOIS de
    // apagado é ressurreição deliberada, e o app tem que respeitar
    if (morto != null && carimbo(por[k]) <= morto) {
      apagados++;
      if (!daqui[k]) vindos--;   // veio e morreu no mesmo passo: não contar
      return;
    }
    itens.push(por[k]);
  });
  return { itens: itens, vindos: Math.max(0, vindos), apagados: apagados };
}

/**
 * Une as sessões de fotos do corpo.
 *
 * Não dá para reusar `uneLista`: quando os dois lados têm a MESMA data, vencer
 * pelo carimbo descartaria as poses que só existem do outro lado. E esse caso é
 * real — a sessão é longa, e nada impede que quatro poses saiam num aparelho e
 * as outras cinco no outro depois de o primeiro ficar sem bateria.
 *
 * Então a data une a sessão, e DENTRO dela cada pose une pela própria versão,
 * exatamente como `S.fotos` já faz com a foto do aparelho.
 *
 * Com uma exceção, que é o AJUSTE. Recortar não gera bytes novos e por isso não
 * muda `v`: os dois lados continuam com a mesma foto. Sem desempate, o lado que
 * não foi recortado empataria e o recorte sumiria na volta. Quando `v` empata,
 * quem ganha é o ajuste mais recente.
 */
function uneSessoesDeFoto(
  local: SessaoFoto[], remoto: SessaoFoto[], mortos: Record<string, number>
): { itens: SessaoFoto[]; fotosVindas: number; ajustesDaqui: number; apagados: number } {
  const por: Record<string, SessaoFoto> = {};
  const fotosDaqui: Record<string, 1> = {};
  const ajusteRemoto: Record<string, number> = {};
  let apagados = 0;

  function carimbo(s: SessaoFoto): number { return typeof s.m === 'number' ? s.m : 0; }

  /** Quando o ajuste daquela foto mudou. Foto sem ajuste é o marco zero. */
  function carimboDoAjuste(f: FotoRef): number {
    return f && f.enq && typeof f.enq.m === 'number' ? f.enq.m : 0;
  }

  function absorve(lista: SessaoFoto[], daqui: boolean): void {
    (Array.isArray(lista) ? lista : []).forEach(function (s) {
      if (!s || !s.d) return;
      const meu = por[s.d];
      if (!meu) {
        por[s.d] = { d: s.d, t: s.t, fotos: {}, obs: s.obs, m: s.m };
      } else {
        // o instante é o da PRIMEIRA foto: o menor dos dois é o verdadeiro
        if (typeof s.t === 'number' && (typeof meu.t !== 'number' || s.t < meu.t)) meu.t = s.t;
        if (carimbo(s) > carimbo(meu)) { meu.obs = s.obs; meu.m = s.m; }
      }
      const alvo = por[s.d];
      Object.keys(s.fotos || {}).forEach(function (pose) {
        const ref = s.fotos[pose];
        if (!ref || typeof ref.v !== 'number') return;
        const k = s.d + ':' + pose;
        if (daqui) fotosDaqui[k] = 1;
        else ajusteRemoto[k] = carimboDoAjuste(ref);
        const atual = alvo.fotos[pose];
        if (!atual || ref.v > atual.v) { alvo.fotos[pose] = ref; return; }
        // mesma foto dos dois lados: desempata o ajuste
        if (ref.v === atual.v && carimboDoAjuste(ref) > carimboDoAjuste(atual)) {
          alvo.fotos[pose] = ref;
        }
      });
    });
  }

  absorve(local, true);
  absorve(remoto, false);

  let fotosVindas = 0;
  let ajustesDaqui = 0;
  const itens: SessaoFoto[] = [];
  Object.keys(por).forEach(function (d) {
    const s = por[d];
    const mortaSessao = mortos[chaveDeSessaoFoto(d)];
    if (mortaSessao != null && carimbo(s) <= mortaSessao) {
      apagados += Object.keys(s.fotos).length || 1;
      return;
    }
    Object.keys(s.fotos).forEach(function (pose) {
      const morta = mortos[chaveDeFotoDoCorpo(d, pose)];
      if (morta != null && s.fotos[pose].v <= morta) { delete s.fotos[pose]; apagados++; return; }
      const k = d + ':' + pose;
      if (!fotosDaqui[k]) { fotosVindas++; return; }
      // a foto já era nossa, mas o ajuste que venceu é mais novo que o do outro
      // lado: ele está desatualizado e precisa receber a volta
      if (carimboDoAjuste(s.fotos[pose]) > (ajusteRemoto[k] || 0)) ajustesDaqui++;
    });
    // sessão que ficou sem foto nenhuma sai — ela nasce na primeira foto e não
    // tem por que sobreviver à última
    if (!Object.keys(s.fotos).length) return;
    itens.push(s);
  });

  itens.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  return { itens: itens, fotosVindas: fotosVindas, ajustesDaqui: ajustesDaqui, apagados: apagados };
}

/** Une dois mapas simples. Em conflito de chave, vence o lado mais recente. */
/**
 * Une os dias de comida CAMPO A CAMPO, e não como documento inteiro.
 *
 * O motivo é o mesmo que fez `uneSessoesDeFoto` existir: marcar o almoço no
 * iPhone e a água no iPad, no mesmo dia, com os dois offline. Vencedor-leva-
 * tudo por carimbo descartaria o dia INTEIRO de um dos lados — o bug de
 * sempre, só que na comida.
 *
 * Cada campo funde do jeito que a natureza dele pede:
 *
 * - `done` é PRESENÇA: união das duas chaves, com lápide para o desmarcado.
 *   É a mesma forma de `S.descanso`, e pelo mesmo motivo — união simples faria
 *   desmarcar num aparelho ser desfeito pelo outro.
 * - `como` é ATRIBUTO da marca, e viaja com ela: o lado cuja marca entrou traz
 *   o "fora do plano" ou o "não comi" junto, e a lápide que mata a marca mata o
 *   atributo também. Fundido à parte, ele descreveria uma marca que não existe.
 * - `agua` é contador que só cresce ao longo do dia: fica o MAIOR. Carimbar um
 *   inteiro custaria mais que o risco, e subestimar um copo é ruído aceitável.
 * - `aguaNaoContada` é o único campo em que CONTAR vence: declarar que não
 *   contou e, no outro aparelho, ter contado são afirmações sobre o mesmo dia, e
 *   a segunda tem dado por trás. Então o fato cai quando a união dá copo.
 * - `escala`, `tot`, `pv` e o enquadramento do dia vêm do lado com carimbo mais
 *   novo. São decisões tomadas uma vez, e a corrida entre dois aparelhos no
 *   mesmo dia é rara — mas quando houver, o registro mais recente é a leitura
 *   mais provável de estar certa.
 */
function uneDiasDeComida(
  local: DiaComidaHist[], remoto: DiaComidaHist[], mortos: Record<string, number>
): { itens: DiaComidaHist[]; vindos: number; apagados: number } {
  const por: Record<string, DiaComidaHist> = {};
  const daqui: Record<string, 1> = {};
  let vindos = 0, apagados = 0;

  (Array.isArray(local) ? local : []).forEach(function (x) {
    if (x && x.d) { por[x.d] = JSON.parse(JSON.stringify(x)); daqui[x.d] = 1; }
  });

  (Array.isArray(remoto) ? remoto : []).forEach(function (x) {
    if (!x || !x.d) return;
    const meu = por[x.d];
    if (!meu) { por[x.d] = JSON.parse(JSON.stringify(x)); vindos++; return; }

    // done: união, respeitando a lápide de cada refeição. `como` acompanha a
    // marca que entrou: é atributo dela, não registro próprio
    Object.keys(x.done || {}).forEach(function (id) {
      const quando = x.done[id];
      if (typeof quando !== 'number') return;
      const morto = mortos[chaveDeRefeicaoFeita(x.d, id)];
      if (morto != null && quando <= morto) return;
      if (meu.done[id] == null) {
        meu.done[id] = quando; vindos++;
        const como = x.como && x.como[id];
        if (como) { if (!meu.como) meu.como = {}; meu.como[id] = como; }
      }
    });
    // e o que ESTE lado tem também passa pela lápide do outro
    Object.keys(meu.done || {}).forEach(function (id) {
      const morto = mortos[chaveDeRefeicaoFeita(x.d, id)];
      if (morto != null && meu.done[id] <= morto) {
        delete meu.done[id];
        if (meu.como) delete meu.como[id];
        apagados++;
      }
    });

    meu.agua = Math.max(meu.agua || 0, x.agua || 0);
    // o fato "não contei" só sobrevive se NENHUM dos dois lados contou
    if (!x.aguaNaoContada || !meu.aguaNaoContada) delete meu.aguaNaoContada;
    if (meu.agua > 0) delete meu.aguaNaoContada;

    if (carimboM(x) > carimboM(meu)) {
      meu.escala = Object.assign({}, x.escala || {});
      meu.tot = x.tot; meu.pv = x.pv;
      meu.cadencia = x.cadencia; meu.alta = x.alta; meu.turno = x.turno; meu.aj = x.aj;
      // `aderencia` faltava nesta lista, e por isso o enquadramento do dia era o
      // do lado local sempre, mesmo quando o outro aparelho o tinha respondido
      // depois. É decisão tomada uma vez, como a cadência e o turno
      meu.aderencia = x.aderencia;
      meu.m = x.m;
    }
  });

  const itens: DiaComidaHist[] = [];
  Object.keys(por).forEach(function (d) {
    const morto = mortos[chaveDeDiaComida({ d: d })];
    if (morto != null && carimboM(por[d]) <= morto) { apagados++; return; }
    // `como` sem marca não descreve nada: a invariante é que ele é atributo de
    // quem está em `done`, e deixá-lo solto viraria "fora do plano" numa
    // refeição que o dia não diz ter acontecido
    const h = por[d];
    if (h.como) {
      Object.keys(h.como).forEach(function (id) {
        if (h.done == null || h.done[id] == null) delete h.como![id];
      });
      if (!Object.keys(h.como).length) delete h.como;
    }
    itens.push(h);
  });
  itens.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  return { itens: itens, vindos: vindos, apagados: apagados };
}

function uneMapa<T>(local: Record<string, T>, remoto: Record<string, T>, remotoManda: boolean): Record<string, T> {
  const saida: Record<string, T> = {};
  const a = remotoManda ? local : remoto;
  const b = remotoManda ? remoto : local;
  Object.keys(a || {}).forEach(function (k) { saida[k] = a[k]; });
  Object.keys(b || {}).forEach(function (k) { saida[k] = b[k]; });
  return saida;
}

function porTempo<T extends { t: number }>(a: T, b: T): number { return a.t - b.t; }

/** Une as lápides dos dois lados e poda o que já é história antiga. */
export function uneLapides(
  a: Record<string, number>, b: Record<string, number>, agora: number
): Record<string, number> {
  const corte = agora - LAPIDE_DIAS * 86400000;
  const saida: Record<string, number> = {};
  [a || {}, b || {}].forEach(function (m) {
    Object.keys(m).forEach(function (k) {
      const t = m[k];
      if (typeof t !== 'number' || t < corte) return;
      if (saida[k] == null || t > saida[k]) saida[k] = t;
    });
  });
  return saida;
}

// ---------- a fusão ----------

/** Quando o estado foi tocado pela última vez. É o que decide os documentos. */
export function mtimeDe(S: Partial<Estado> | null | undefined): number {
  return (S && typeof (S as { mtime?: number }).mtime === 'number')
    ? (S as { mtime: number }).mtime : 0;
}

/**
 * Funde o estado local com o que veio da nuvem.
 *
 * Não altera nenhum dos dois: devolve um terceiro. O app substitui o seu por
 * este resultado e escreve o mesmo resultado de volta na nuvem, de modo que os
 * dois lados convergem para o MESMO documento — e uma segunda fusão dos mesmos
 * dois estados não muda mais nada.
 */
export function funde(local: Estado, remoto: Estado, agora?: number): { estado: Estado; resumo: ResumoDaFusao } {
  const t = agora == null ? Date.now() : agora;
  const remotoManda = mtimeDe(remoto) > mtimeDe(local);

  // clone do lado que manda nos documentos: tudo que não é coleção vem dele
  // inteiro, e as coleções são sobrescritas logo abaixo
  const base: Estado = JSON.parse(JSON.stringify(remotoManda ? remoto : local));

  const mortos = uneLapides(
    (local as Estado & { apagados?: Record<string, number> }).apagados || {},
    (remoto as Estado & { apagados?: Record<string, number> }).apagados || {},
    t
  );

  const resumo: ResumoDaFusao = {
    series: 0, sessoes: 0, medidas: 0, cardio: 0, fotosCorpo: 0, ajustesCorpo: 0, apagados: 0,
    documentos: mtimeDe(remoto) === mtimeDe(local) ? 'iguais' : (remotoManda ? 'remoto' : 'local'),
    identicos: false
  };

  // ---- séries: mapa de exercício -> lista ----
  const logs: Record<IdEx, Log[]> = {};
  const chavesEx: Record<string, 1> = {};
  Object.keys(local.logs || {}).forEach(function (k) { chavesEx[k] = 1; });
  Object.keys(remoto.logs || {}).forEach(function (k) { chavesEx[k] = 1; });
  Object.keys(chavesEx).forEach(function (idEx) {
    const r = uneLista<Log>(
      (local.logs || {})[idEx] || [], (remoto.logs || {})[idEx] || [],
      function (x) { return chaveDeLog(idEx, x); }, carimboM, mortos
    );
    resumo.series += r.vindos;
    resumo.apagados += r.apagados;
    if (!r.itens.length) return;             // exercício que ficou sem histórico sai do mapa
    r.itens.sort(porTempo);
    logs[idEx] = r.itens.slice(-TETO.logs);
  });
  base.logs = logs;

  // ---- sessões ----
  const d = uneLista<Sessao>(local.done || [], remoto.done || [], chaveDeSessao, carimboM, mortos);
  d.itens.sort(porTempo);
  base.done = d.itens.slice(-TETO.done);
  resumo.sessoes = d.vindos;
  resumo.apagados += d.apagados;

  // ---- cardio ----
  const c = uneLista<Cardio>(local.cardio || [], remoto.cardio || [], chaveDeCardio, carimboAlt, mortos);
  c.itens.sort(porTempo);
  base.cardio = c.itens.slice(-TETO.cardio);
  resumo.cardio = c.vindos;
  resumo.apagados += c.apagados;

  // ---- dias de comida ----
  const cm = uneDiasDeComida(local.comidaHist || [], remoto.comidaHist || [], mortos);
  base.comidaHist = cm.itens.slice(-TETO.comida);
  resumo.apagados += cm.apagados;

  // ---- o dia ABERTO ----
  // Ele é o que mais colide, e era o único que ainda vinha inteiro do lado que
  // gravou por último: marcar o almoço no iPhone e a água no iPad, hoje, fazia
  // um dos dois sumir. É o mesmo dado dos dias fechados, então funde pela
  // mesma função — só volta à forma de `DiaComida` no fim.
  if (local.dia && remoto.dia && local.dia.data === remoto.dia.data) {
    // Antes da migração 9 → 10 esta conversão achatava a marca em `1` nos dois
    // sentidos, porque era a forma do dia aberto. Com `done` convergido, o
    // INSTANTE atravessa: é ele que a lápide de `chaveDeRefeicaoFeita` compara,
    // e achatá-lo fazia toda marca do dia aberto parecer de 1970 — qualquer
    // lápide a mataria.
    //
    // O carimbo do dia aberto é o `mtime` DO ESTADO. `DiaComida` não tem campo
    // de alteração — o dia zera com a data, e carimbá-lo custaria uma escrita a
    // cada toque —, e sem carimbo os dois lados empatavam em 0: as decisões
    // tomadas uma vez (escala, cadência, turno, enquadramento) vinham SEMPRE do
    // lado local, mesmo quando o outro aparelho as havia respondido depois. O
    // `mtime` é o mesmo sinal que já decide os documentos duas linhas acima.
    const comoHist = function (d: DiaComida, mtime: number): DiaComidaHist {
      return { d: d.data, done: Object.assign({}, d.done || {}), agua: d.agua || 0,
               aguaNaoContada: d.aguaNaoContada,
               escala: Object.assign({}, d.escala || {}),
               como: d.como ? Object.assign({}, d.como) : undefined,
               // `aderencia` não entrava nesta conversão, e o `base.dia`
               // reconstruído abaixo não a devolvia: fundir dois aparelhos no
               // mesmo dia APAGAVA o enquadramento ("saí do plano", "dia
               // perdido") sem dizer nada
               aderencia: d.aderencia,
               cadencia: d.cadencia, alta: d.alta, turno: d.turno,
               tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 0,
               m: (d as DiaComida & { m?: number }).m || mtime };
    };
    const j = uneDiasDeComida(
      [comoHist(local.dia, mtimeDe(local))],
      [comoHist(remoto.dia, mtimeDe(remoto))],
      mortos
    ).itens[0];
    if (j) {
      base.dia = { data: j.d, done: j.done, agua: j.agua, escala: j.escala,
                   cadencia: j.cadencia, alta: j.alta, turno: j.turno };
      // `m` não volta para `base.dia`: `DiaComida` não tem o campo, e o carimbo
      // que importa para a próxima fusão é o `mtime` do estado, logo abaixo.
      if (j.aguaNaoContada) base.dia.aguaNaoContada = 1;
      if (j.como) base.dia.como = j.como;
      if (j.aderencia) base.dia.aderencia = j.aderencia;
    }
  }

  // ---- modelos de aula ----
  // Coleção e não documento: um modelo salvo no iPhone não pode sumir porque o
  // outro aparelho gravou qualquer outra coisa depois.
  const au = uneLista<ModeloDeAula>(local.aulas || [], remoto.aulas || [], chaveDeAula, carimboM, mortos);
  au.itens.sort(porTempo);
  base.aulas = au.itens.slice(-TETO.aulas);
  resumo.apagados += au.apagados;

  // ---- as perguntas de programa que esperam ----
  // Coleção e não documento, e a troca conserta uma perda que já existia: como
  // `promoPendente` não era coleção, ela vinha INTEIRA do lado com `mtime` mais
  // novo, e a pergunta guardada no celular sumia porque o notebook sincronizou
  // depois. Lápide porque responder é resolver: sem ela, o outro aparelho
  // traria de volta a pergunta que ele acabou de responder.
  const pp = uneLista<PromoPendente>(
    Array.isArray(local.promoPendente) ? local.promoPendente : [],
    Array.isArray(remoto.promoPendente) ? remoto.promoPendente : [],
    chaveDePromo, carimboM, mortos
  );
  pp.itens.sort(porTempo);
  base.promoPendente = pp.itens.slice(-TETO.promo);
  resumo.apagados += pp.apagados;

  // ---- o quadro do box de hoje ----
  // Documento e não coleção: é o quadro do dia em curso, e existe um só. Vence
  // o mais novo, que é o aparelho onde ele acabou de colar a lousa.
  const ql = local.quadro, qr = remoto.quadro;
  base.quadro = (qr && (!ql || (qr.t || 0) > (ql.t || 0))) ? qr : (ql || null);

  // ---- leituras de gordura visual ----
  // Coleção como as outras: a resposta dada no computador não pode sumir
  // porque o iPhone gravou outra coisa depois.
  const go = uneLista<LeituraDeGordura>(
    local.gordura || [], remoto.gordura || [], chaveDeLeitura,
    function (x) { return typeof x.t === 'number' ? x.t : 0; }, mortos
  );
  go.itens.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  base.gordura = go.itens.slice(-TETO.protocolo);
  resumo.apagados += go.apagados;

  // ---- as medidas do corpo ----
  // Enumera `MARCAS_DO_CORPO` e não uma lista escrita aqui: foram duas listas —
  // esta e a do tipo — que mantiveram `S.body` fechado em `{ peso, cintura }`, e
  // a migração 9 → 10 abriu as duas no mesmo passo. Grandeza que entrar na
  // tabela de `corpo.ts` passa a fundir sem ninguém editar este arquivo.
  base.body = {} as Corpo;
  MARCAS_DO_CORPO.forEach(function (qual) {
    const r = uneLista<Marca>(
      (local.body && local.body[qual]) || [], (remoto.body && remoto.body[qual]) || [],
      function (x) { return chaveDeMarca(qual, x); }, carimboM, mortos
    );
    r.itens.sort(porTempo);
    base.body[qual] = r.itens.slice(-TETO.body);
    resumo.medidas += r.vindos;
    resumo.apagados += r.apagados;
  });

  // ---- histórico de mudanças do programa: só cresce ----
  const pl = uneLista<EntradaProgLog>(
    local.progLog || [], remoto.progLog || [],
    chaveDeProgLog, carimboM, mortos
  );
  pl.itens.sort(porTempo);
  base.progLog = pl.itens.slice(-TETO.progLog);

  // ---- dias de descanso: mapa de data, com lápide ----
  // União simples não bastaria: desmarcar num aparelho seria desfeito pelo
  // outro, que ainda tem a marca. A lápide resolve, igual às coleções.
  const descanso: Record<string, number> = {};
  [local.descanso || {}, remoto.descanso || {}].forEach(function (m) {
    Object.keys(m).forEach(function (k) {
      const quando = m[k];
      if (typeof quando !== 'number') return;
      const morto = mortos[chaveDeDescanso(k)];
      if (morto != null && quando <= morto) return;
      if (descanso[k] == null || quando > descanso[k]) descanso[k] = quando;
    });
  });
  base.descanso = descanso;

  // ---- fotos: mapa de referência, vence a mais recente ----
  // Só a referência funde aqui. Os bytes vivem no Cache Storage de cada
  // aparelho, e cada um busca os que não tem — trocar a referência é o que
  // avisa o outro lado de que há algo novo para buscar.
  const fotos: Record<IdEx, FotoRef> = {};
  [local.fotos || {}, remoto.fotos || {}].forEach(function (m) {
    Object.keys(m).forEach(function (k) {
      const f = m[k];
      if (!f || typeof f.v !== 'number') return;
      const morto = mortos[chaveDeFoto(k)];
      if (morto != null && f.v <= morto) return;
      if (!fotos[k] || f.v > fotos[k].v) fotos[k] = f;
    });
  });
  base.fotos = fotos;

  // ---- as sessões de foto do corpo ----
  // Coleção com chave natural, igual às séries: os dois lados só acrescentam, e
  // por isso nada se perde. `poses` não entra aqui — é documento, e já veio no
  // clone do lado que manda.
  const cf = uneSessoesDeFoto(
    (local.protocolo && local.protocolo.sessoes) || [],
    (remoto.protocolo && remoto.protocolo.sessoes) || [],
    mortos
  );
  const poses = (remotoManda ? remoto : local).protocolo
    ? (remotoManda ? remoto : local).protocolo.poses
    : null;
  base.protocolo = { poses: poses || null, sessoes: cf.itens.slice(-TETO.protocolo) };
  resumo.fotosCorpo = cf.fotosVindas;
  resumo.ajustesCorpo = cf.ajustesDaqui;
  resumo.apagados += cf.apagados;

  // ---- mapas por exercício ----
  base.ex = uneMapa(local.ex || {}, remoto.ex || {}, remotoManda);
  base.carga = uneMapa(local.carga || {}, remoto.carga || {}, remotoManda);

  // o último backup é o mais recente dos dois: é fato sobre o passado, e o
  // maior dos dois é o verdadeiro em ambos
  base.export = Math.max(local.export || 0, remoto.export || 0);

  (base as Estado & { apagados: Record<string, number> }).apagados = mortos;
  (base as Estado & { mtime: number }).mtime = Math.max(mtimeDe(local), mtimeDe(remoto));

  resumo.identicos = resumo.series === 0 && resumo.sessoes === 0 && resumo.medidas === 0 &&
                     resumo.cardio === 0 && resumo.fotosCorpo === 0 && resumo.ajustesCorpo === 0 &&
                     resumo.apagados === 0 && resumo.documentos !== 'remoto';

  return { estado: base, resumo: resumo };
}
