// A fusão de dois estados.
//
// Cada teste aqui é um jeito de perder dado que a sincronização ingênua tem, e
// que este módulo existe para impedir. O cenário-mãe é sempre o mesmo: ele
// treinou no celular e depois abriu o notebook, que estava com o estado velho.

import { test } from 'vitest';
import assert from 'node:assert';
import { funde, chaveDeLog, chaveDeSessao, chaveDeMarca, chaveDeCardio, chaveDePromo, chaveDeSessaoFoto, chaveDeFotoDoCorpo, LAPIDE_DIAS } from '../../src/dominio/sincronia';
import type { Corpo, Enquadramento, Estado, Log, QualMarca, SessaoFoto } from '../../src/dominio/tipos';
import type { DiaComidaHist } from '../../src/dominio/nutricao/tipos';
import { MARCAS_DO_CORPO } from '../../src/dominio/corpo';

/** Um `S.body` com as sete séries vazias. Os testes preenchem as que importam. */
function corpoVazio(): Corpo {
  const b = {} as Corpo;
  MARCAS_DO_CORPO.forEach(function (k: QualMarca) { b[k] = []; });
  return b;
}

const DIA = 86400000;
const T0 = new Date(2026, 7, 24, 9, 0).getTime();

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 5,
    prog: null, rot: null, ex: {}, mods: null, progLog: [],
    cadencia: null, comida: { plano: null, alimentos: {}, ocultos: {} },
    dia: null, ajuste: 0, perfManual: null,
    compras: { comprado: {}, extras: [], removidas: {}, dias: 7 },
    mtime: 0, apagados: {}
  } as Estado, extra);
}

function log(sid: number, sets: Array<[number, number]>, extra: Partial<Log> = {}): Log {
  return Object.assign({ t: sid, sid: sid, sets: sets }, extra) as Log;
}

// ---------- o cenário que motivou o módulo ----------

test('a sessão do celular sobrevive ao notebook com estado velho', () => {
  // celular: treinou hoje de manhã
  const celular = estado({
    mtime: T0,
    logs: { supino: [log(T0, [[60, 8], [60, 8]])] },
    done: [{ day: 'A', t: T0, sid: T0, dur: 0 }]
  });
  // notebook: parou ontem, não sabe do treino de hoje
  const notebook = estado({
    mtime: T0 - DIA,
    logs: { supino: [log(T0 - DIA, [[57.5, 8]])] },
    done: [{ day: 'E', t: T0 - DIA, sid: T0 - DIA, dur: 0 }]
  });

  const { estado: r, resumo } = funde(notebook, celular, T0);
  assert.strictEqual(r.logs.supino.length, 2, 'os dois treinos existem');
  assert.strictEqual(r.done.length, 2);
  assert.strictEqual(resumo.series, 1, 'uma entrada veio do outro lado');
  assert.strictEqual(resumo.sessoes, 1);
});

test('fundir duas vezes não muda nada na segunda', () => {
  // é o que garante que os dois aparelhos convergem para o mesmo documento
  const a = estado({ mtime: T0, logs: { supino: [log(T0, [[60, 8]])] }, done: [{ day: 'A', t: T0, sid: T0, dur: 0 }] });
  const b = estado({ mtime: T0 - DIA, logs: { remada: [log(T0 - DIA, [[50, 10]])] } });

  const um = funde(a, b, T0).estado;
  const dois = funde(um, b, T0).estado;
  assert.deepStrictEqual(dois, um, 'a fusão é estável ao repetir');
  assert.strictEqual(funde(um, b, T0).resumo.identicos, true, 'e se diz idêntica');
});

test('a ordem dos lados não muda o conteúdo', () => {
  const a = estado({ mtime: T0, logs: { supino: [log(T0, [[60, 8]])] } });
  const b = estado({ mtime: T0 - DIA, logs: { supino: [log(T0 - DIA, [[55, 8]])] } });
  const ab = funde(a, b, T0).estado;
  const ba = funde(b, a, T0).estado;
  assert.deepStrictEqual(
    ab.logs.supino.map(x => x.sid).sort(), ba.logs.supino.map(x => x.sid).sort());
});

// ---------- correção de série passada ----------

test('a correção mais recente vence a versão antiga do mesmo registro', () => {
  const antigo = estado({ mtime: T0 - DIA, logs: { supino: [log(T0, [[60, 8]], { m: T0 - DIA })] } });
  const corrigido = estado({ mtime: T0, logs: { supino: [log(T0, [[62.5, 8]], { m: T0 })] } });

  const r = funde(antigo, corrigido, T0).estado;
  assert.strictEqual(r.logs.supino.length, 1, 'é o mesmo registro, não dois');
  assert.deepStrictEqual(r.logs.supino[0].sets[0], [62.5, 8], 'ficou a correção');

  // e na ordem inversa dá o mesmo
  assert.deepStrictEqual(funde(corrigido, antigo, T0).estado.logs.supino[0].sets[0], [62.5, 8]);
});

test('o mesmo aparelho em duas posições do treino são dois registros', () => {
  // é por isso que a chave não é só o sid: `sl` diz de que posição veio
  const a = estado({ mtime: T0, logs: { panturrilha: [log(T0, [[100, 10]])] } });
  const b = estado({ mtime: T0, logs: { panturrilha: [log(T0, [[80, 12]], { sl: 'outra-posicao' })] } });
  const r = funde(a, b, T0).estado;
  assert.strictEqual(r.logs.panturrilha.length, 2, 'duas posições, dois registros');
});

// ---------- apagar ----------

test('apagar num aparelho não é desfeito pelo outro', () => {
  const chave = chaveDeSessao({ sid: T0 });
  // ele apagou a sessão no celular
  const celular = estado({ mtime: T0 + 1000, done: [], apagados: { [chave]: T0 + 1000 } });
  // o notebook ainda tem
  const notebook = estado({ mtime: T0, done: [{ day: 'A', t: T0, sid: T0, dur: 0 }] });

  const { estado: r, resumo } = funde(notebook, celular, T0 + 2000);
  assert.strictEqual(r.done.length, 0, 'a lápide venceu a ressurreição');
  assert.strictEqual(resumo.apagados, 1);
  assert.strictEqual(r.apagados[chave], T0 + 1000, 'e a lápide continua viajando');
});

test('registro editado DEPOIS de apagado volta', () => {
  // apagou num aparelho e, sem saber, corrigiu no outro: a correção é mais nova
  // e é uma decisão explícita — ressuscitar aqui é o certo
  const chave = chaveDeLog('supino', { sid: T0 });
  const apagou = estado({ mtime: T0 + 1000, logs: {}, apagados: { [chave]: T0 + 1000 } });
  const editou = estado({ mtime: T0 + 2000, logs: { supino: [log(T0, [[65, 8]], { m: T0 + 2000 })] } });

  const r = funde(apagou, editou, T0 + 3000).estado;
  assert.strictEqual(r.logs.supino.length, 1, 'a edição mais nova vence a lápide mais velha');
});

test('lápide antiga é podada para o mapa não crescer sem fim', () => {
  const velha = chaveDeCardio({ t: 1 });
  const nova = chaveDeCardio({ t: 2 });
  const agora = T0;
  const a = estado({ apagados: {
    [velha]: agora - (LAPIDE_DIAS + 10) * DIA,
    [nova]: agora - DIA
  } });
  const r = funde(a, estado(), agora).estado;
  assert.strictEqual(r.apagados[velha], undefined, 'o que sumiu há meses já sumiu dos dois lados');
  assert.ok(r.apagados[nova], 'a recente continua');
});

// ---------- medidas e cardio ----------

test('pesagens dos dois aparelhos se somam, sem duplicar a mesma', () => {
  const a = estado({ mtime: T0, body: { peso: [{ t: T0 - DIA, v: 73.4 }, { t: T0, v: 73.6 }], cintura: [] } });
  const b = estado({ mtime: T0 - DIA, body: { peso: [{ t: T0 - DIA, v: 73.4 }, { t: T0 - 2 * DIA, v: 73.1 }], cintura: [] } });
  const { estado: r, resumo } = funde(a, b, T0);
  assert.strictEqual(r.body.peso.length, 3, 'três dias distintos');
  assert.strictEqual(resumo.medidas, 1);
  assert.deepStrictEqual(r.body.peso.map(x => x.v), [73.1, 73.4, 73.6], 'e em ordem de tempo');
});

test('a pesagem corrigida vence a original do mesmo dia', () => {
  const original = estado({ mtime: T0 - 1000, body: { peso: [{ t: T0, v: 73.4 }], cintura: [] } });
  const corrigida = estado({ mtime: T0, body: { peso: [{ t: T0, v: 74.1, m: T0 }], cintura: [] } });
  const r = funde(original, corrigida, T0).estado;
  assert.strictEqual(r.body.peso.length, 1);
  assert.strictEqual(r.body.peso[0].v, 74.1);
});

test('cardio usa o próprio carimbo, porque m já é o modal', () => {
  const a = estado({ mtime: T0, cardio: [{ t: T0, m: 'bike', min: 20, i: 'leve' }] });
  const b = estado({ mtime: T0 - 1000, cardio: [{ t: T0, m: 'bike', min: 30, i: 'moderado', alt: T0 + 1000 }] });
  const r = funde(a, b, T0).estado;
  assert.strictEqual(r.cardio.length, 1);
  assert.strictEqual(r.cardio[0].min, 30, 'o carimbo alt decidiu, e o modal não foi confundido com ele');
});

// ---------- documentos ----------

test('o programa vem inteiro do lado alterado por último', () => {
  const velho = estado({ mtime: T0 - DIA, prog: { A: { name: 'antigo', tag: '', ex: [] } } });
  const novo = estado({ mtime: T0, prog: { A: { name: 'novo', tag: '', ex: [] } } });

  assert.strictEqual(funde(velho, novo, T0).estado.prog!.A.name, 'novo');
  assert.strictEqual(funde(velho, novo, T0).resumo.documentos, 'remoto');
  assert.strictEqual(funde(novo, velho, T0).estado.prog!.A.name, 'novo');
  assert.strictEqual(funde(novo, velho, T0).resumo.documentos, 'local');
});

test('documento do notebook não atropela série do celular', () => {
  // o caso real: ele mexe no programa em casa, e o celular tem o treino de hoje
  const notebook = estado({ mtime: T0 + DIA, prog: { A: { name: 'editado em casa', tag: '', ex: [] } } });
  const celular = estado({ mtime: T0, logs: { supino: [log(T0, [[60, 8]])] } });

  const r = funde(notebook, celular, T0 + DIA).estado;
  assert.strictEqual(r.prog!.A.name, 'editado em casa', 'o documento mais novo ficou');
  assert.strictEqual(r.logs.supino.length, 1, 'e a série do celular veio junto');
});

test('o último backup é o mais recente dos dois', () => {
  const r = funde(estado({ export: 100 }), estado({ export: 500 }), T0).estado;
  assert.strictEqual(r.export, 500, 'é fato sobre o passado: o maior vale nos dois');
});

// ---------- não perder e não inventar ----------

test('fundir com estado vazio não apaga nada', () => {
  // aparelho novo entrando na conta: ele recebe tudo e não destrói nada
  const cheio = estado({
    mtime: T0, logs: { supino: [log(T0, [[60, 8]])] },
    done: [{ day: 'A', t: T0, sid: T0, dur: 0 }],
    body: { peso: [{ t: T0, v: 73 }], cintura: [] },
    cardio: [{ t: T0, m: 'bike', min: 20, i: 'leve' }]
  });
  const novo = estado();
  const r = funde(novo, cheio, T0).estado;
  assert.strictEqual(r.logs.supino.length, 1);
  assert.strictEqual(r.done.length, 1);
  assert.strictEqual(r.body.peso.length, 1);
  assert.strictEqual(r.cardio.length, 1);
});

test('a fusão não altera os estados que recebeu', () => {
  const a = estado({ mtime: T0, logs: { supino: [log(T0, [[60, 8]])] } });
  const b = estado({ mtime: T0 - DIA, logs: { remada: [log(T0 - DIA, [[50, 10]])] } });
  const copiaA = JSON.parse(JSON.stringify(a));
  const copiaB = JSON.parse(JSON.stringify(b));
  funde(a, b, T0);
  assert.deepStrictEqual(a, copiaA, 'local intacto');
  assert.deepStrictEqual(b, copiaB, 'remoto intacto');
});

test('exercício que ficou sem histórico sai do mapa', () => {
  const chave = chaveDeLog('supino', { sid: T0 });
  const a = estado({ mtime: T0, logs: { supino: [log(T0, [[60, 8]])] } });
  const b = estado({ mtime: T0 + 1000, logs: {}, apagados: { [chave]: T0 + 1000 } });
  const r = funde(a, b, T0 + 2000).estado;
  assert.strictEqual(r.logs.supino, undefined, 'chave vazia não fica sobrando no mapa');
});

test('o catálogo cadastrado por ele se soma dos dois lados', () => {
  const a = estado({ mtime: T0, ex: { 'maquina-do-celular': { n: 'Máquina do celular' } } });
  const b = estado({ mtime: T0 - DIA, ex: { 'maquina-de-casa': { n: 'Máquina de casa' } } });
  const r = funde(a, b, T0).estado;
  assert.ok(r.ex['maquina-do-celular'] && r.ex['maquina-de-casa'], 'os dois entram');
});

test('as chaves de lápide e de fusão são a mesma string', () => {
  // se divergirem, a lápide não alcança o registro e apagar deixa de funcionar
  assert.strictEqual(chaveDeLog('supino', { sid: 1 }), 'log:supino:1:supino');
  assert.strictEqual(chaveDeLog('supino', { sid: 1, sl: 'pos' }), 'log:supino:1:pos');
  assert.strictEqual(chaveDeSessao({ sid: 9 }), 'done:9');
  assert.strictEqual(chaveDeMarca('peso', { t: 5 }), 'peso:5');
  assert.strictEqual(chaveDeCardio({ t: 7 }), 'cardio:7');
});

// ---------- o RIR desce para a série ----------

test('a série carrega o próprio RIR sem atrapalhar quem lê carga e repetição', () => {
  const com: Log = { t: T0, sid: T0, sets: [[60, 8, 2], [60, 8, 0]] };
  assert.strictEqual(com.sets[0]![0], 60, 'carga continua em [0]');
  assert.strictEqual(com.sets[0]![1], 8, 'repetição continua em [1]');
  assert.strictEqual(com.sets[1]![2], 0, 'e o RIR mora em [2]');

  // série antiga, de dois números, continua válida
  const sem: Log = { t: T0, sid: T0, sets: [[60, 8]] };
  assert.strictEqual(sem.sets[0]![2], undefined);
});

// ---------- as sessões de foto do corpo ----------
// A sessão de fotos é longa e nada garante que ela saia inteira de um aparelho
// só. Estes testes são sobre o caso em que ela NÃO sai.

function sfoto(d: string, poses: Record<string, number>, extra: Partial<SessaoFoto> = {}): SessaoFoto {
  const fotos: SessaoFoto['fotos'] = {};
  Object.keys(poses).forEach(p => { fotos[p] = { v: poses[p], ext: 'webp' }; });
  return Object.assign({ d, t: poses[Object.keys(poses)[0]] || 0, fotos }, extra) as SessaoFoto;
}

test('poses tiradas em aparelhos diferentes no MESMO dia se somam', () => {
  const celular = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0, 'perfil-direito': T0 + 1 })
  ] } });
  const notebook = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'costas-relaxado': T0 + 2 })
  ] } });

  const { estado: r, resumo } = funde(notebook, celular, T0);
  assert.strictEqual(r.protocolo.sessoes.length, 1, 'continua sendo uma sessão só');
  assert.deepStrictEqual(
    Object.keys(r.protocolo.sessoes[0].fotos).sort(),
    ['costas-relaxado', 'frente-relaxado', 'perfil-direito']
  );
  assert.strictEqual(resumo.fotosCorpo, 2, 'duas fotos vieram do outro lado');
});

test('refazer uma pose vence a versão antiga do outro aparelho', () => {
  const novo = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 + 5000 })
  ] } });
  const velho = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 })
  ] } });

  const { estado: r } = funde(velho, novo, T0);
  assert.strictEqual(r.protocolo.sessoes[0].fotos['frente-relaxado'].v, T0 + 5000);
});

test('apagar UMA pose não a ressuscita pelo outro aparelho', () => {
  const apagou = estado({
    mtime: T0,
    protocolo: { poses: null, sessoes: [sfoto('2026-08-24', { 'costas-relaxado': T0 })] },
    apagados: { [chaveDeFotoDoCorpo('2026-08-24', 'frente-relaxado')]: T0 + 10 }
  });
  const aindaTem = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0, 'costas-relaxado': T0 })
  ] } });

  const { estado: r } = funde(apagou, aindaTem, T0);
  assert.deepStrictEqual(Object.keys(r.protocolo.sessoes[0].fotos), ['costas-relaxado']);
});

test('apagar a sessão inteira não a ressuscita, e ela some da lista', () => {
  const apagou = estado({
    mtime: T0,
    protocolo: { poses: null, sessoes: [] },
    apagados: { [chaveDeSessaoFoto('2026-08-24')]: T0 + 10 }
  });
  const aindaTem = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    Object.assign(sfoto('2026-08-24', { 'frente-relaxado': T0 }), { m: T0 })
  ] } });

  const { estado: r } = funde(apagou, aindaTem, T0);
  assert.strictEqual(r.protocolo.sessoes.length, 0);
});

test('sessão que ficou sem foto nenhuma não sobra na lista', () => {
  const a = estado({ mtime: T0, protocolo: { poses: null, sessoes: [sfoto('2026-08-24', {})] } });
  const b = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [] } });
  const { estado: r } = funde(a, b, T0);
  assert.strictEqual(r.protocolo.sessoes.length, 0);
});

test('a nota da sessão vem do lado alterado por último', () => {
  const novo = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    Object.assign(sfoto('2026-08-24', { 'frente-relaxado': T0 }), { obs: 'voltando de gripe', m: T0 + 100 })
  ] } });
  const velho = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    Object.assign(sfoto('2026-08-24', { 'frente-relaxado': T0 }), { obs: 'nada', m: T0 })
  ] } });
  const { estado: r } = funde(velho, novo, T0);
  assert.strictEqual(r.protocolo.sessoes[0].obs, 'voltando de gripe');
});

test('a fusão é estável: repetir não muda mais nada', () => {
  const a = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 })
  ] } });
  const b = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-10', { 'costas-relaxado': T0 - DIA })
  ] } });
  const um = funde(a, b, T0).estado;
  const dois = funde(um, um, T0);
  assert.deepStrictEqual(dois.estado.protocolo, um.protocolo);
  assert.strictEqual(dois.resumo.fotosCorpo, 0);
  assert.strictEqual(dois.resumo.identicos, true);
});

test('estado sem protocolo nenhum não quebra a fusão', () => {
  const semNada = estado({ mtime: T0 });
  delete (semNada as Partial<Estado>).protocolo;
  const com = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 })
  ] } });
  const { estado: r } = funde(semNada, com, T0);
  assert.strictEqual(r.protocolo.sessoes.length, 1);
});

// ---------- o enquadramento ajustado ----------
// Recortar não gera bytes novos, então `v` não muda. Sem desempate próprio, o
// lado que não foi recortado empataria e o recorte sumiria na volta.

/** Uma sessão com uma foto que tem enquadramento ajustado. */
function comEnq(d: string, pose: string, v: number, enq: Partial<Enquadramento>): SessaoFoto {
  const s = sfoto(d, { [pose]: v });
  s.fotos[pose].enq = Object.assign({ r: 0, z: 1, cx: 0.5, cy: 0.5, m: 0 }, enq) as Enquadramento;
  return s;
}

test('o recorte feito num aparelho não some na volta do outro', () => {
  const recortado = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 2, m: T0 + 100 })
  ] } });
  const intacto = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 })
  ] } });

  // dos dois lados, em qualquer ordem, o ajuste sobrevive
  [[recortado, intacto], [intacto, recortado]].forEach(([a, b]) => {
    const { estado: r } = funde(a, b, T0);
    const f = r.protocolo.sessoes[0].fotos['frente-relaxado'];
    assert.ok(f.enq, 'o ajuste ficou');
    assert.strictEqual(f.enq!.r, 2);
  });
});

test('entre dois recortes da mesma foto, vence o mais recente', () => {
  const velho = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 1, m: T0 + 10 })
  ] } });
  const novo = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 5, m: T0 + 999 })
  ] } });
  const { estado: r } = funde(velho, novo, T0);
  assert.strictEqual(r.protocolo.sessoes[0].fotos['frente-relaxado'].enq!.r, 5);
});

test('refazer a foto descarta o recorte da versão antiga', () => {
  // `v` maior manda: são bytes novos, e o recorte era do enquadramento velho
  const antiga = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 4, m: T0 + 500 })
  ] } });
  const refeita = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 + 1000 })
  ] } });
  const { estado: r } = funde(antiga, refeita, T0);
  const f = r.protocolo.sessoes[0].fotos['frente-relaxado'];
  assert.strictEqual(f.v, T0 + 1000);
  assert.strictEqual(f.enq, undefined, 'o recorte velho não segue a foto nova');
});

test('recorte que só existe aqui obriga a empurrar', () => {
  // é o que impede uma fusão que "não trouxe nada" de deixar o outro aparelho
  // sem o recorte para sempre
  const aqui = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 3, m: T0 + 100 })
  ] } });
  const la = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-24', { 'frente-relaxado': T0 })
  ] } });
  const { resumo } = funde(aqui, la, T0);
  assert.strictEqual(resumo.fotosCorpo, 0, 'foto nova nenhuma veio');
  assert.strictEqual(resumo.ajustesCorpo, 1, 'mas o recorte precisa ir');
  assert.strictEqual(resumo.identicos, false);
});

test('quando o recorte é o mesmo dos dois lados, não há o que empurrar', () => {
  const um = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 3, m: T0 + 100 })
  ] } });
  const dois = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 3, m: T0 + 100 })
  ] } });
  const { resumo } = funde(um, dois, T0);
  assert.strictEqual(resumo.ajustesCorpo, 0);
  assert.strictEqual(resumo.identicos, true);
});

test('a fusão com ajuste também é estável ao repetir', () => {
  const a = estado({ mtime: T0, protocolo: { poses: null, sessoes: [
    comEnq('2026-08-24', 'frente-relaxado', T0, { r: 2, z: 1.2, m: T0 + 5 })
  ] } });
  const b = estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [
    sfoto('2026-08-10', { 'costas-relaxado': T0 - DIA })
  ] } });
  const um = funde(a, b, T0).estado;
  const dois = funde(um, um, T0);
  assert.deepStrictEqual(dois.estado.protocolo, um.protocolo);
  assert.strictEqual(dois.resumo.identicos, true);
});

// ---------- as leituras de gordura visual ----------
// Coleção com chave natural, como as sessões de foto: a resposta dada no
// computador não pode sumir porque o iPhone gravou qualquer outra coisa depois.

test('leituras de gordura de dois aparelhos se juntam', () => {
  const pc = estado({ gordura: [{ d: '2026-09-05', de: '2026-08-22', v: 'nao', t: 100 }] });
  const cel = estado({ gordura: [{ d: '2026-09-19', de: '2026-09-05', v: 'sim', t: 200 }] });
  const r = funde(pc, cel, T0).estado;
  assert.strictEqual(r.gordura.length, 2, 'nenhuma das duas some');
  assert.deepStrictEqual(r.gordura.map(x => x.d), ['2026-09-05', '2026-09-19'], 'em ordem de data');
});

test('a mesma leitura respondida duas vezes: vence a mais recente', () => {
  const antes = estado({ gordura: [{ d: '2026-09-19', de: '2026-09-05', v: 'sim', t: 100 }] });
  const depois = estado({ gordura: [{ d: '2026-09-19', de: '2026-09-05', v: 'incerto', t: 300 }] });
  assert.strictEqual(funde(antes, depois, T0).estado.gordura.length, 1, 'é a mesma leitura');
  assert.strictEqual(funde(antes, depois, T0).estado.gordura[0].v, 'incerto');
  assert.strictEqual(funde(depois, antes, T0).estado.gordura[0].v, 'incerto', 'e a ordem não muda nada');
});

// ---------- o que a migração 9 → 10 pôs na fusão ----------
// Campo persistido novo tem que atravessar aqui, senão dois aparelhos que
// somavam voltam a se sobrescrever. São quatro coisas: as cinco chaves do
// corpo, o instante da marca, `como` como atributo da marca e o fato de a água
// não ter sido contada.

test('as cinco medidas da bioimpedância somam como o peso e a cintura', () => {
  // A fusão enumerava `['peso','cintura']` escrito à mão: uma grandeza nova
  // nunca chegaria do outro aparelho, e a tela mostraria só metade da leitura.
  const balanca = estado({ mtime: T0, body: Object.assign(corpoVazio(), {
    bioPeso: [{ t: T0, v: 79.2 }], bioMusculo: [{ t: T0, v: 37.4 }],
    bioGordura: [{ t: T0, v: 14.1 }], bioGorduraPct: [{ t: T0, v: 17.8 }],
    bioAgua: [{ t: T0, v: 45.3 }]
  }) });
  const outro = estado({ mtime: T0 - DIA, body: Object.assign(corpoVazio(), {
    bioPeso: [{ t: T0 - 7 * DIA, v: 80.1 }]
  }) });

  const { estado: r, resumo } = funde(outro, balanca, T0);
  assert.strictEqual(r.body.bioPeso.length, 2, 'duas leituras de dias diferentes');
  assert.deepStrictEqual(r.body.bioPeso.map(x => x.v), [80.1, 79.2], 'em ordem de tempo');
  assert.strictEqual(r.body.bioMusculo[0].v, 37.4);
  assert.strictEqual(r.body.bioGordura[0].v, 14.1);
  assert.strictEqual(r.body.bioGorduraPct[0].v, 17.8);
  assert.strictEqual(r.body.bioAgua[0].v, 45.3);
  assert.strictEqual(resumo.medidas, 5, 'cinco medidas vieram do outro lado');
});

test('a lápide alcança a medida da bioimpedância', () => {
  // Sem `chaveDeMarca` aceitando a grandeza nova, a chave da lápide não casava
  // com a da fusão e a medida apagada voltava do outro aparelho.
  const aqui = estado({ mtime: T0, body: corpoVazio(), apagados: { [chaveDeMarca('bioGordura', { t: T0 - DIA })]: T0 } });
  const nuvem = estado({ mtime: T0 - DIA, body: Object.assign(corpoVazio(), {
    bioGordura: [{ t: T0 - DIA, v: 14.1 }]
  }) });
  const { estado: r } = funde(aqui, nuvem, T0);
  assert.deepStrictEqual(r.body.bioGordura, [], 'o que ele apagou aqui não ressuscita');
});

test('o peso da manhã e o da bioimpedância não se misturam', () => {
  // São dois aparelhos e duas horas: ele pesa numa balança e mede na outra. A
  // chave de fusão carrega a grandeza, então o mesmo instante nas duas não
  // colide.
  const a = estado({ mtime: T0, body: Object.assign(corpoVazio(), {
    peso: [{ t: T0, v: 79.4 }], bioPeso: [{ t: T0, v: 79.2 }]
  }) });
  const b = estado({ mtime: T0 - 1000, body: corpoVazio() });
  const { estado: r } = funde(b, a, T0);
  assert.strictEqual(r.body.peso[0].v, 79.4, 'a pesagem da manhã');
  assert.strictEqual(r.body.bioPeso[0].v, 79.2, 'e a da balança de bioimpedância');
});

test('o instante da marca atravessa a fusão do dia aberto', () => {
  // A conversão interna achatava a marca em `1` nos dois sentidos, porque era a
  // forma do dia corrente. `1` é 1970: qualquer lápide o matava.
  const manha = 'pos', tarde = 'lanche';
  const a = estado({ mtime: T0, dia: { data: '2026-08-24', done: { [manha]: T0 - 3600000 }, agua: 3, escala: {} } });
  const b = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: { [tarde]: T0 - 600000 }, agua: 1, escala: {} } });

  const { estado: r } = funde(a, b, T0);
  assert.strictEqual(r.dia!.done[manha], T0 - 3600000, 'a hora da marca da manhã');
  assert.strictEqual(r.dia!.done[tarde], T0 - 600000, 'e a da tarde, somadas');
  assert.strictEqual(r.dia!.agua, 3, 'a água é contador que só cresce: fica o maior');
});

test('desmarcar uma refeição num aparelho não é desfeito pelo outro', () => {
  const chave = 'comida:2026-08-24:almoco';
  const aqui = estado({ mtime: T0, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {} },
                        apagados: { [chave]: T0 } });
  const nuvem = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: { almoco: T0 - 3600000 }, agua: 0, escala: {} } });
  const { estado: r } = funde(aqui, nuvem, T0);
  assert.strictEqual(r.dia!.done.almoco, undefined, 'a lápide vence a cópia mais antiga');
});

test('`como` viaja com a marca, e morre com a lápide dela', () => {
  const a = estado({ mtime: T0, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {} } });
  const b = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: { jantar: T0 - 600000 },
                                              como: { jantar: 'fora' }, agua: 0, escala: {} } });
  const { estado: r } = funde(a, b, T0);
  assert.strictEqual(r.dia!.done.jantar, T0 - 600000, 'a marca veio');
  assert.strictEqual(r.dia!.como!.jantar, 'fora', 'e o "saí do plano" veio com ela');

  // agora com lápide: a marca morre e o atributo não fica solto descrevendo
  // uma refeição que o dia não diz ter acontecido
  const comLapide = estado({ mtime: T0, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {} },
                             apagados: { 'comida:2026-08-24:jantar': T0 } });
  const { estado: r2 } = funde(comLapide, b, T0);
  assert.strictEqual(r2.dia!.done.jantar, undefined);
  assert.strictEqual(r2.dia!.como, undefined, 'nem o atributo sobra');
});

test('"não comi" atravessa a fusão como fato, e não como silêncio', () => {
  const a = estado({ mtime: T0, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {} } });
  const b = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: { ceia: T0 - 600000 },
                                              como: { ceia: 'nao' }, agua: 0, escala: {} } });
  const { estado: r } = funde(a, b, T0);
  assert.strictEqual(r.dia!.como!.ceia, 'nao',
    'é o que separa "não comi" de "esqueci de marcar", e o que faz o dia contar');
});

test('quem contou a água vence quem declarou não ter contado', () => {
  // As duas são afirmações sobre o mesmo dia, e a segunda tem dado por trás.
  const naoContou = estado({ mtime: T0, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {}, aguaNaoContada: 1 } });
  const contou = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: {}, agua: 5, escala: {} } });
  const { estado: r } = funde(naoContou, contou, T0);
  assert.strictEqual(r.dia!.agua, 5);
  assert.strictEqual(r.dia!.aguaNaoContada, undefined, 'o fato cai quando a união dá copo');

  // mas se os DOIS não contaram, o fato sobrevive — senão o dia voltaria a
  // parecer um dia de zero copo
  const outro = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {}, aguaNaoContada: 1 } });
  const { estado: r2 } = funde(naoContou, outro, T0);
  assert.strictEqual(r2.dia!.aguaNaoContada, 1);
});

test('o enquadramento do dia aberto sobrevive à fusão', () => {
  // Achado de passagem: `aderencia` não entrava na conversão do dia e a
  // reconstrução não a devolvia. Fundir dois aparelhos no mesmo dia APAGAVA
  // "saí do plano" e "dia perdido", em silêncio.
  const a = estado({ mtime: T0, dia: { data: '2026-08-24', done: { pos: T0 }, agua: 2, escala: {}, aderencia: 'fora' } });
  const b = estado({ mtime: T0 - 1000, dia: { data: '2026-08-24', done: {}, agua: 0, escala: {} } });
  assert.strictEqual(funde(a, b, T0).estado.dia!.aderencia, 'fora');
  assert.strictEqual(funde(b, a, T0).estado.dia!.aderencia, 'fora', 'dos dois lados');
});

test('o enquadramento de um dia fechado vem do lado que respondeu depois', () => {
  const dia = (extra: Partial<DiaComidaHist>): DiaComidaHist => Object.assign({
    d: '2026-08-20', done: { pos: T0 - DIA }, agua: 4, escala: {},
    tot: { kcal: 2000, p: 100, c: 250, g: 60 }, pv: 1
  }, extra) as DiaComidaHist;
  const antigo = estado({ mtime: T0, comidaHist: [dia({ m: T0 - DIA })] });
  const novo = estado({ mtime: T0 - 1000, comidaHist: [dia({ m: T0, aderencia: 'perdido' })] });
  const { estado: r } = funde(antigo, novo, T0);
  assert.strictEqual(r.comidaHist[0].aderencia, 'perdido',
    'faltava nesta lista, e o lado local vencia sempre');
});

test('o ajuste de porção do dia aberto vem do lado que tocou depois', () => {
  // Mesmo defeito do enquadramento: sem carimbo, os dois lados empatavam em 0 e
  // o `escala` do lado local vencia sempre.
  const velho = estado({ mtime: T0 - DIA, dia: { data: '2026-08-24', done: { jantar: T0 - DIA }, agua: 0, escala: {} } });
  const novo = estado({ mtime: T0, dia: { data: '2026-08-24', done: { jantar: T0 - DIA }, agua: 0, escala: { jantar: 0.5 } } });
  assert.strictEqual(funde(velho, novo, T0).estado.dia!.escala.jantar, 0.5);
  assert.strictEqual(funde(novo, velho, T0).estado.dia!.escala.jantar, 0.5, 'dos dois lados');
});

test('a pergunta guardada no celular não some porque o notebook sincronizou depois', () => {
  // Enquanto `promoPendente` era documento, a fusão a trazia INTEIRA do lado
  // com `mtime` mais novo — "tudo que não é coleção vem dele". O que o celular
  // registrou se perdia, em silêncio.
  const promo = (sid: number, day: string) => ({
    sid: sid, day: day, t: sid, m: sid,
    mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }], resumoMods: ['Pushdown: 2 → 3 séries']
  });
  const celular = estado({ mtime: T0 - DIA, promoPendente: [promo(T0 - DIA, 'A')] } as Partial<Estado>);
  const notebook = estado({ mtime: T0, promoPendente: [promo(T0, 'B')] } as Partial<Estado>);

  const { estado: r } = funde(notebook, celular, T0);
  assert.strictEqual(r.promoPendente.length, 2, 'as duas perguntas esperam');
  assert.deepStrictEqual(r.promoPendente.map(p => p.day), ['A', 'B'], 'em ordem de tempo');
  assert.deepStrictEqual(funde(celular, notebook, T0).estado.promoPendente.map(p => p.day),
    ['A', 'B'], 'e a ordem dos lados não muda nada');
});

test('responder uma pergunta não a ressuscita do outro aparelho', () => {
  const promo = { sid: T0 - DIA, day: 'A', t: T0 - DIA, m: T0 - DIA,
                  mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }], resumoMods: [] };
  const respondeu = estado({ mtime: T0, promoPendente: [],
                             apagados: { [chaveDePromo(promo)]: T0 } } as Partial<Estado>);
  const nuvem = estado({ mtime: T0 - DIA, promoPendente: [promo] } as Partial<Estado>);
  assert.deepStrictEqual(funde(respondeu, nuvem, T0).estado.promoPendente, [],
    'sem lápide, a pergunta que ele acabou de responder voltava');
});

test('a mesma sessão fechada nos dois aparelhos é UMA pergunta', () => {
  // Os dois tinham a sessão aberta e os dois a encerraram sozinhos: a chave é o
  // `sid`, então vira uma entrada e ele responde uma vez.
  const base = { sid: T0 - DIA, day: 'A', t: T0 - DIA,
                 mods: [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }], resumoMods: [] };
  const aqui = estado({ mtime: T0, promoPendente: [Object.assign({}, base, { m: T0 })] } as Partial<Estado>);
  const la = estado({ mtime: T0 - 1000, promoPendente: [Object.assign({}, base, { m: T0 - 2000 })] } as Partial<Estado>);
  const { estado: r } = funde(aqui, la, T0);
  assert.strictEqual(r.promoPendente.length, 1);
  assert.strictEqual(r.promoPendente[0].m, T0, 'vence o carimbo mais novo');
});

test('a chave da pergunta é o `sid`, e não o dia — que é editável no treino', () => {
  // "Trocar de dia no meio do treino não perde nem sobrescreve": se `day`
  // entrasse na chave, a MESMA pergunta fundiria como duas e ele responderia
  // duas vezes.
  const mods = [{ k: 'sets', slot: 'pushdown', de: 2, para: 3 }];
  const comoA = { sid: T0, day: 'A', t: T0, m: T0 - 1000, mods: mods, resumoMods: [] };
  const comoB = { sid: T0, day: 'B', t: T0, m: T0, mods: mods, resumoMods: [] };
  assert.strictEqual(chaveDePromo(comoA), chaveDePromo(comoB));
  const { estado: r } = funde(
    estado({ mtime: T0, promoPendente: [comoA] } as Partial<Estado>),
    estado({ mtime: T0 - 1, promoPendente: [comoB] } as Partial<Estado>),
    T0
  );
  assert.strictEqual(r.promoPendente.length, 1, 'uma pergunta, uma resposta');
});
