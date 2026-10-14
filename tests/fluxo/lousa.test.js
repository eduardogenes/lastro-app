// A LOUSA DO BOX — a D, `aula.html`, estado 6; decisão do dono, 14/10.
//
// Foto agora, transcrição quando der. Um toque fotografa e a foto fica no dia;
// quando a aula termina, ela vira parte daquela sessão. Os bytes ficam no cache
// `lastro-lousa`, neste aparelho; no estado fica só a referência.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';
import { cacheFalso, guardadasEm } from './dubles.js';

/** O dia de hoje no relógio do APP, que o harness fixa (dia 15). */
let hoje = () => { throw new Error('sem app'); };

function sabado() {
  const agora = agoraEstavel(8);
  const sid = agora - 7 * DIA;
  return { agora: agora, estado: { plano: 7,
    logs: { 'wall-balls': [{ t: sid, sid: sid, u: 'rep', q: 20, sets: [[9, 20]] }] },
    done: [{ day: 'HX', t: sid, sid: sid, dur: 3600000 }] } };
}

async function noBox(opcoes, comSessao) {
  const a = await app(opcoes || sabado());
  cacheFalso(a);
  a.aba('treino');
  hoje = () => a.v('hojeISO');
  if (comSessao !== false) a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.v('render');
  await a.esperar();
  return a;
}

function fotografa(a) {
  return a.E(`CTX.tiraFotoDaLousa({ files: [new Blob(['lousa'], { type: 'image/jpeg' })], value: '' })`);
}

async function pelaLista(a, id, valor) {
  a.clicar(a.doc.getElementById(id));
  await a.esperar();
  for (const ch of String(valor)) {
    const tecla = a.$$('.rapl .tcl-grade > *').find(el => el.textContent.trim() === ch);
    a.clicar(tecla);
    await a.esperar();
  }
}

test('um toque fotografa a lousa: a foto fica no dia, e os bytes no cache próprio', async () => {
  const a = await noBox();
  assert.ok(a.$('[data-a="lousa-foto"]'), 'no dia aberto há "Fotografar a lousa"');
  await fotografa(a);
  await a.esperar(60);
  const l = a.S().lousa;
  assert.strictEqual(l.day, 'HX');
  assert.strictEqual(l.d, hoje());
  assert.deepStrictEqual(guardadasEm(a, 'lastro-lousa'), ['./lousa/' + hoje() + '-' + l.v + '.' + l.ext]);
  assert.deepStrictEqual(a.gravado().lousa, l, 'a referência está no disco');
  const t = a.vJ('ctx.treino').lousa;
  assert.strictEqual(t.tem, true);
  assert.ok(/^foto da lousa · \d\d\/\d\d \d+h\d\d$/.test(t.quando), t.quando);
  assert.ok(a.$('.tr-lousa-img'), 'e a foto aparece');
  assert.ok(a.$('[data-a="lousa-refaz"]'), 'com "Refazer a foto"');
  a.fechar();
});

test('quando a aula termina, a lousa vira parte da sessão', async () => {
  // a sessão nasce da primeira série, como no uso: é ela que cria a marca
  const a = await noBox(sabado(), false);
  await fotografa(a);
  await a.esperar(60);
  const v = a.S().lousa.v;
  a.v('repetirUltimaAula');
  await a.esperar(60);
  a.v('abrirRapido');
  await a.esperar();
  await pelaLista(a, 'fw0', 9);
  await pelaLista(a, 'fr0', 20);
  assert.ok(a.S().sessao, 'pré-condição: a série abriu a sessão');
  await a.v('finalizarSessao');
  await a.esperar(60);
  assert.strictEqual(a.S().sessao, null, 'pré-condição: a sessão encerrou');
  assert.strictEqual(a.S().lousa, null, 'a pendente saiu');
  const marca = a.gravado().done.filter(x => x.day === 'HX').slice(-1)[0];
  assert.deepStrictEqual(marca.lousa, { d: hoje(), v: v, ext: marca.lousa.ext }, 'e está na marca da aula, no disco');
  assert.ok(marca.m >= v, 'com o carimbo novo, para a fusão');
  a.fechar();
});

test('foto tirada depois de a aula de hoje encerrar vai direto para ela', async () => {
  const o = sabado();
  const hojeT = o.agora - 3600000;
  o.estado.done.push({ day: 'HX', t: hojeT, sid: hojeT, dur: 3600000 });
  const a = await noBox(o, false);
  await fotografa(a);
  await a.esperar(60);
  assert.strictEqual(a.S().lousa, null, 'não fica pendente');
  const marca = a.gravado().done.filter(x => x.t === hojeT)[0];
  assert.ok(marca.lousa && marca.lousa.d === hoje(), JSON.stringify(marca));
  a.v('ctx.abreSessaoDoDia', { k: 'sessao', t: hojeT });
  await a.esperar();
  assert.ok(/^foto da lousa · /.test(a.vJ('ctx.detalheDaSessao').lousa.quando), 'e a sessão mostra a foto');
  a.fechar();
});

test('refazer troca a foto e tira a velha do cache', async () => {
  const a = await noBox();
  await fotografa(a);
  await a.esperar(60);
  const v1 = a.S().lousa.v;
  await new Promise(r => setTimeout(r, 5));
  await fotografa(a);
  await a.esperar(60);
  const v2 = a.S().lousa.v;
  assert.notStrictEqual(v1, v2);
  assert.deepStrictEqual(guardadasEm(a, 'lastro-lousa'), ['./lousa/' + hoje() + '-' + v2 + '.' + a.S().lousa.ext],
    'só a nova ficou');
  a.fechar();
});

test('se o aparelho recusa o registro, a lousa não finge que ficou', async () => {
  const a = await noBox();
  a.encheCota();
  await fotografa(a);
  await a.esperar(60);
  assert.strictEqual(a.S().lousa, null, 'a referência voltou');
  assert.deepStrictEqual(guardadasEm(a, 'lastro-lousa'), [], 'e os bytes não ficaram órfãos');
  a.fechar();
});

test('fora do dia aberto não há lousa', async () => {
  const a = await app(sabado());
  cacheFalso(a);
  a.aba('treino');
  a.E('view.day="A"');
  a.v('render');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.treino').lousa, null);
  assert.strictEqual(a.$('[data-a="lousa-foto"]'), null);
  a.fechar();
});

test('"Mandar para transcrever" entrega a foto ao compartilhar do sistema; sem ele, diz o caminho', async () => {
  const a = await noBox();
  a.E(`globalThis.__compartilhado = [];
       Object.defineProperty(navigator, 'share', { configurable: true, value: async (d) => { globalThis.__compartilhado.push({ n: d.files.length, nome: d.files[0].name, t: d.title }); } });
       Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });`);
  await fotografa(a);
  await a.esperar(60);
  a.clicar('[data-a="lousa-manda"]');
  await a.esperar(60);
  const c = a.J('globalThis.__compartilhado');
  assert.strictEqual(c.length, 1);
  assert.ok(/^lousa-\d{4}-\d\d-\d\d\.webp$/.test(c[0].nome), c[0].nome);
  assert.ok(/^Lousa de \d\d\/\d\d$/.test(c[0].t), c[0].t);

  a.E(`Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });`);
  await a.v('ctx.mandaLousa');
  assert.ok(/abra a foto e compartilhe pelo sistema/.test(a.toast()), a.toast());
  assert.strictEqual(a.J('globalThis.__compartilhado').length, 1, 'e não fingiu que mandou');
  a.fechar();
});
