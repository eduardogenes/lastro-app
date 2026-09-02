// A orquestração da sincronização, com a rede simulada.
//
// A fusão em si é testada em tests/dominio/sincronia.test.ts, sem app. Aqui é o
// ciclo: quando puxa, quando funde, quando empurra, e o que acontece quando o
// outro aparelho grava no meio do caminho.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

/** Instala uma nuvem de mentira no escopo do app. */
function nuvemFalsa(a, inicial) {
  a.E(`
    globalThis.__nuvem = {
      linha: ${JSON.stringify(inicial === undefined ? null : inicial)},
      empurros: [], puxadas: 0, falha: null, conflitaUmaVez: false
    };
    NUVEM.sessao = function () { return { email: 'eu@exemplo.com', uid: 'u1' }; };
    NUVEM.pronta = async function () { return NUVEM.sessao(); };
    NUVEM.puxa = async function () {
      const n = globalThis.__nuvem;
      n.puxadas++;
      if (n.falha) return { ok: false, erro: n.falha, msg: 'falhou: ' + n.falha };
      return { ok: true, v: n.linha };
    };
    NUVEM.empurra = async function (deV, data) {
      const n = globalThis.__nuvem;
      if (n.falha) return { ok: false, erro: n.falha, msg: 'falhou: ' + n.falha };
      if (n.conflitaUmaVez) {
        n.conflitaUmaVez = false;
        return { ok: false, erro: 'conflito', msg: 'outro aparelho gravou antes' };
      }
      const v = (n.linha ? n.linha.v : 0) + 1;
      n.linha = { v: v, data: JSON.parse(JSON.stringify(data)) };
      n.empurros.push({ deV: deV, v: v });
      return { ok: true, v: v };
    };
  `);
}
const nuvem = a => a.J('globalThis.__nuvem');

test('sem conta, o app não fala com a nuvem', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  assert.strictEqual(a.E('sync.sujo'), false, 'nem marca sujeira');
  await a.E('sincroniza()');
  assert.strictEqual(a.E('sync.v'), null);
  a.fechar();
});

test('primeira sincronização cria a linha e sobe o que existe', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  await a.esperar();

  await a.E('sincroniza()');
  const n = nuvem(a);
  assert.strictEqual(n.empurros.length, 1);
  assert.strictEqual(n.empurros[0].deV, null, 'linha nova: parte do nada');
  assert.ok(n.linha.data.logs['chest-press-inclinado-convergente'], 'a série subiu');
  assert.strictEqual(a.E('sync.v'), 1);
  assert.strictEqual(a.E('sync.sujo'), false, 'limpou depois de subir');
  a.fechar();
});

test('o que o outro aparelho gravou desce e se junta ao daqui', async () => {
  const t = Date.now() - 3 * 86400000;
  const a = await app();
  // a nuvem já tem um treino que este aparelho nunca viu
  nuvemFalsa(a, { v: 7, data: {
    logs: { 'pendulum-squat': [{ t: t, sid: t, sets: [[120, 8]] }] },
    done: [{ day: 'B', t: t, sid: t, dur: 0 }],
    body: { peso: [], cintura: [] }, cardio: [], ex: {}, carga: {},
    progLog: [], apagados: {}, mtime: t, export: 0
  } });

  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);          // e aqui tem um treino de hoje
  await a.esperar();
  await a.E('sincroniza()');

  assert.strictEqual(a.E('S.logs["pendulum-squat"].length'), 1, 'desceu o de lá');
  assert.strictEqual(a.E('S.logs["chest-press-inclinado-convergente"].length'), 1, 'e o daqui ficou');
  assert.strictEqual(a.E('S.done.length'), 2, 'as duas sessões');

  const n = nuvem(a);
  assert.strictEqual(n.empurros[0].deV, 7, 'a escrita declarou de que versão partiu');
  assert.strictEqual(n.linha.data.done.length, 2, 'e a nuvem ficou com as duas');
  a.fechar();
});

test('conflito no meio do caminho refaz o ciclo em vez de perder', async () => {
  const a = await app();
  nuvemFalsa(a, { v: 3, data: {
    logs: {}, done: [], body: { peso: [], cintura: [] }, cardio: [],
    ex: {}, carga: {}, progLog: [], apagados: {}, mtime: 1, export: 0
  } });
  a.E('globalThis.__nuvem.conflitaUmaVez = true');

  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.E('sincroniza()');

  const n = nuvem(a);
  assert.strictEqual(n.puxadas, 2, 'releu depois do conflito');
  assert.strictEqual(n.empurros.length, 1, 'e gravou na segunda tentativa');
  assert.strictEqual(a.E('S.logs["chest-press-inclinado-convergente"].length'), 1,
    'a série local sobreviveu ao conflito');
  assert.strictEqual(a.E('sync.sujo'), false);
  a.fechar();
});

test('sem rede, o app não perde nada e volta a sincronizar depois', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.E("globalThis.__nuvem.falha = 'rede'");

  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.E('sincroniza()');

  assert.ok(a.E('sync.erro'), 'a tela sabe que falhou');
  assert.strictEqual(a.E('sync.sujo'), true, 'e continua devendo o envio');
  assert.strictEqual(a.E('S.logs["chest-press-inclinado-convergente"].length'), 1,
    'a série está registrada localmente do mesmo jeito');

  a.E("globalThis.__nuvem.falha = null");
  await a.E('sincroniza()');
  assert.strictEqual(a.E('sync.sujo'), false, 'ao voltar a rede, sobe');
  assert.strictEqual(nuvem(a).linha.data.done.length, 1);
  a.fechar();
});

test('nada mudou de nenhum lado: não reescreve à toa', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.E('sincroniza()');
  const depoisDoPrimeiro = nuvem(a).empurros.length;

  await a.E('sincroniza()');
  assert.strictEqual(nuvem(a).empurros.length, depoisDoPrimeiro,
    'segunda chamada sem mudança não gera escrita');
  a.fechar();
});

test('apagar aqui não é desfeito pelo que a nuvem ainda tem', async () => {
  const t = Date.now() - 2 * 86400000;
  const a = await app({ estado: {
    logs: {}, done: [], body: { peso: [{ t: t, v: 73.4 }], cintura: [] }, cardio: []
  } });
  nuvemFalsa(a, null);
  await a.E('sincroniza()');                     // a nuvem passa a ter a pesagem
  assert.strictEqual(nuvem(a).linha.data.body.peso.length, 1);

  await a.E('delBody("peso", ' + t + ')');       // apagou aqui
  await a.esperar();
  await a.E('sincroniza()');

  assert.strictEqual(a.E('S.body.peso.length'), 0, 'apagada aqui');
  assert.strictEqual(nuvem(a).linha.data.body.peso.length, 0, 'e apagada na nuvem');
  assert.ok(Object.keys(a.J('S.apagados')).length > 0, 'a lápide viajou junto');
  a.fechar();
});

test('dia marcado como descanso viaja e some quando desmarcado', async () => {
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [] } });
  nuvemFalsa(a, null);

  await a.E('alternaDescanso(' + ontem + ')');
  await a.esperar();
  await a.E('sincroniza()');
  assert.strictEqual(Object.keys(nuvem(a).linha.data.descanso).length, 1, 'subiu a marca');

  await a.E('alternaDescanso(' + ontem + ')');   // desmarcou
  await a.esperar();
  await a.E('sincroniza()');
  assert.strictEqual(Object.keys(nuvem(a).linha.data.descanso).length, 0,
    'desmarcar não é desfeito pela nuvem que ainda tinha a marca');
  a.fechar();
});

test('descanso não conta como treino em lugar nenhum', async () => {
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [] } });
  await a.E('alternaDescanso(' + ontem + ')');
  await a.esperar();
  assert.strictEqual(a.E('S.done.length'), 0, 'não entra em done');
  assert.strictEqual(a.E('sessoesDeTrabalho()'), 0, 'nem na conta do bloco');
  assert.strictEqual(a.E('ehDescanso(' + ontem + ')'), true, 'mas o calendário sabe');
  a.fechar();
});

test('dia com treino registrado recusa a marca de descanso', async () => {
  const t = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: t, sid: t, dur: 0 }] } });
  await a.E('alternaDescanso(' + t + ')');
  await a.esperar();
  assert.strictEqual(a.E('ehDescanso(' + t + ')'), false,
    'o fato já respondeu: o app não pode afirmar as duas coisas');
  a.fechar();
});

test('a tela de lançamento aguenta a opção de descanso', async () => {
  // regressão: 'descanso' não é letra da rotação, e descrever o treino dela
  // derrubava a tela inteira antes de qualquer mensagem
  const a = await app({ estado: { logs: {}, done: [] } });
  a.E('abrirAdicionar(' + (Date.now() - 86400000) + ')');
  const rotulos = a.$$('.chips .ins-chip').map(x => x.textContent);
  assert.ok(rotulos.includes('foi descanso'), rotulos.join(' | '));

  a.E("addSet('tipo','descanso')");
  assert.ok(a.$('.add-acoes .ins-btn-primary'), 'a tela continua de pé');
  assert.match(a.$('.add-acoes .ins-btn-primary').textContent, /descanso/i);
  assert.strictEqual(a.$('#ahora'), null, 'descanso não tem horário nem duração');
  a.fechar();
});

test('o descanso aparece nas duas telas, e do mesmo jeito', async () => {
  // a tira da semana e o calendário do mês mostram a MESMA semana: divergir
  // seria o app contando duas histórias sobre o mesmo domingo
  // relógio fixo: o domingo da semana corrente precisa cair no MÊS corrente,
  // senão o calendário do mês — corretamente — não tem onde mostrá-lo
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  const dom = a.E('weekStart(Date.now())');

  const antes = a.$$('.wd .wd-v').map(x => x.textContent);
  assert.strictEqual(antes[0], '+', 'sem marca, o domingo convida a registrar');

  await a.E('alternaDescanso(' + dom + ')');
  await a.esperar();

  const cel = a.$$('.wd')[0];
  assert.strictEqual(cel.querySelector('.wd-v').textContent, '–', 'vira traço');
  assert.ok(cel.className.includes('descanso'));
  assert.ok(!cel.className.includes('feito'), 'e nunca com o peso de dia treinado');

  a.aba('dados');
  assert.strictEqual(a.$$('.cal-d.descanso').length, 1, 'o mês diz a mesma coisa');
  a.fechar();
});
