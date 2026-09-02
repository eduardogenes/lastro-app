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
  Cardio, Estado, EntradaProgLog, FotoRef, IdEx, Log, Marca, PoseId, Sessao, SessaoFoto
} from './tipos';

/** Limites por coleção, iguais aos que o app aplica ao gravar. */
const TETO = { logs: 500, done: 3000, progLog: 300, body: 400, cardio: 200, protocolo: 200 };

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
export function chaveDeMarca(qual: 'peso' | 'cintura', x: Pick<Marca, 't'>): string {
  return qual + ':' + x.t;
}
export function chaveDeCardio(c: Pick<Cardio, 't'>): string { return 'cardio:' + c.t; }
export function chaveDeDescanso(dataISO: string): string { return 'descanso:' + dataISO; }
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

  // ---- peso e cintura ----
  base.body = { peso: [], cintura: [] };
  (['peso', 'cintura'] as const).forEach(function (qual) {
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
    function (x) { return 'prog:' + x.t + ':' + x.day; }, carimboM, mortos
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
