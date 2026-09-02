// A fusão de dois estados.
//
// Cada teste aqui é um jeito de perder dado que a sincronização ingênua tem, e
// que este módulo existe para impedir. O cenário-mãe é sempre o mesmo: ele
// treinou no celular e depois abriu o notebook, que estava com o estado velho.

import { test } from 'vitest';
import assert from 'node:assert';
import { funde, chaveDeLog, chaveDeSessao, chaveDeMarca, chaveDeCardio, chaveDeSessaoFoto, chaveDeFotoDoCorpo, LAPIDE_DIAS } from '../../src/dominio/sincronia';
import type { Estado, Log, SessaoFoto } from '../../src/dominio/tipos';

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
