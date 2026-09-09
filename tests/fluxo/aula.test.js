// Montar a aula de sábado sem digitar tudo de novo.
//
// Medido antes destas portas: cinco movimentos em cinco rounds custavam 66
// interações — 32 toques e 34 teclas — antes do primeiro número. Aula de box
// muda toda semana, mas o vocabulário do box não muda, e é essa folga que
// "repetir o sábado passado" e os modelos exploram.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/** Um sábado já registrado: quatro movimentos, cada um com a sua medida. */
function comSabadoAnterior() {
  const agora = agoraEstavel(8);
  const sid = agora - 7 * DIA;
  return {
    agora: agora,
    estado: {
      plano: 7,
      logs: {
        'corrida':         [{ t: sid,     sid: sid, u: 'm',   q: 400, sets: [[0, 105], [0, 108]] }],
        'remo-ergometro':  [{ t: sid + 1, sid: sid, u: 'm',   q: 500, sets: [[0, 110], [0, 112]] }],
        'wall-balls':      [{ t: sid + 2, sid: sid, u: 'rep', q: 20,  sets: [[9, 20], [9, 18]] }],
        'assault-bike':    [{ t: sid + 3, sid: sid, u: 'cal', q: 15,  sets: [[0, 62]] }]
      },
      done: [{ day: 'HX', t: sid, sid: sid, dur: 3600000 }]
    }
  };
}

async function noSabado(opcoes) {
  const a = await app(opcoes);
  a.aba('treino');
  a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.E('render()');
  await a.esperar();
  return a;
}

test('repetir o sábado passado traz os movimentos com a medida de cada um', async () => {
  const a = await noSabado(comSabadoAnterior());
  assert.strictEqual(a.E('treino("HX").ex.length'), 0, 'o dia aberto começa vazio');

  a.E('repetirUltimaAula()');
  await a.esperar(60);

  const ex = a.J('treino("HX").ex.map(function(x){return {id:x.id,s:x.s,u:x.u,q:x.q}})');
  assert.deepStrictEqual(ex, [
    { id: 'corrida',        s: 2, u: 'm',   q: 400 },
    { id: 'remo-ergometro', s: 2, u: 'm',   q: 500 },
    { id: 'wall-balls',     s: 2, u: 'rep', q: 20 },
    { id: 'assault-bike',   s: 1, u: 'cal', q: 15 }
  ], 'a ordem, o número de passadas e a medida vêm do que ele fez');
  a.fechar();
});

test('repetir traz a prescrição, nunca o resultado', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('repetirUltimaAula()');
  await a.esperar(60);

  // wall balls foi 9 kg × 20 no sábado passado. Nada disso pode aparecer como
  // registro de hoje: registro que aparece sozinho é o jeito mais rápido de
  // encher o histórico de número que ninguém fez.
  const sid = a.J('S.sessao.sid');
  const hoje = a.J(`(function(){
    var n = 0;
    Object.keys(S.logs).forEach(function (k) {
      (S.logs[k]||[]).forEach(function (e) { if (e.sid === ${sid}) n++; });
    });
    return n;
  })()`);
  assert.strictEqual(hoje, 0, 'nenhuma série foi registrada só por repetir a aula');
  assert.strictEqual(a.E('seriesFeitasHoje("HX")'), 0);
  a.fechar();
});

test('sem sábado anterior a porta não aparece', async () => {
  const a = await noSabado({});
  const c = a.J('CTX.treino().aulas');
  assert.strictEqual(c.ultima, null, 'um botão que não faz nada é pior que a ausência dele');
  assert.deepStrictEqual(c.modelos, []);
  assert.strictEqual(c.podeSalvar, false, 'e não há dia nenhum para salvar');
  a.fechar();
});

test('salvar como modelo guarda os movimentos e não a carga', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('repetirUltimaAula()');
  await a.esperar(60);
  a.responder('circuito de sábado');
  a.E('salvarAulaComoModelo()');
  await a.esperar(60);

  const aulas = a.J('S.aulas');
  assert.strictEqual(aulas.length, 1);
  assert.strictEqual(aulas[0].nome, 'circuito de sábado');
  assert.strictEqual(aulas[0].mov.length, 4);
  assert.deepStrictEqual(aulas[0].mov[2], { id: 'wall-balls', s: 2, d: 90, r: '', u: 'rep', q: 20 });
  const temCarga = JSON.stringify(aulas[0]).indexOf('"carga"') >= 0;
  assert.ok(!temCarga, 'o modelo não carrega peso: ele é prescrição, não registro');
  a.fechar();
});

test('salvar com um nome que já existe atualiza em vez de duplicar', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('repetirUltimaAula()');
  await a.esperar(60);
  a.responder('circuito');
  a.E('salvarAulaComoModelo()');
  await a.esperar(60);
  const id = a.J('S.aulas[0].id');

  a.E('removerEx(0)');
  await a.esperar(60);
  a.responder('Circuito');            // mesmo nome, outra caixa
  a.E('salvarAulaComoModelo()');
  await a.esperar(60);

  assert.strictEqual(a.J('S.aulas').length, 1, 'uma lista com três "circuito" não diz qual é qual');
  assert.strictEqual(a.J('S.aulas[0].id'), id, 'o id não muda: é a chave natural da fusão');
  assert.strictEqual(a.J('S.aulas[0].mov').length, 3, 'e o conteúdo é o de agora');
  a.fechar();
});

test('aplicar um modelo põe os movimentos no dia', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('repetirUltimaAula()');
  await a.esperar(60);
  a.responder('circuito');
  a.E('salvarAulaComoModelo()');
  await a.esperar(60);

  // limpa o dia e aplica o modelo
  a.E('S.mods = null');
  a.E('render()');
  await a.esperar();
  assert.strictEqual(a.E('treino("HX").ex.length'), 0);

  const id = a.J('S.aulas[0].id');
  a.E(`aplicarModeloDeAula(${JSON.stringify(id)})`);
  await a.esperar(60);
  assert.strictEqual(a.E('treino("HX").ex.length'), 4);
  assert.strictEqual(a.E('treino("HX").ex[3].u'), 'cal', 'a medida vem junto');
  a.fechar();
});

test('apagar um modelo deixa lápide, senão a sincronização o ressuscita', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('repetirUltimaAula()');
  await a.esperar(60);
  a.responder('circuito');
  a.E('salvarAulaComoModelo()');
  await a.esperar(60);
  const id = a.J('S.aulas[0].id');

  a.E(`apagarModeloDeAula(${JSON.stringify(id)})`);
  await a.esperar(60);
  assert.deepStrictEqual(a.J('S.aulas'), []);
  assert.ok(a.J('S.apagados')['aula:' + id] > 0,
    'sem a lápide, a fusão traz de volta o que só existe do outro lado');
  a.fechar();
});

test('as portas rápidas só existem no dia aberto', async () => {
  const a = await noSabado(comSabadoAnterior());
  a.E('S.sessao=null');
  a.E('view.day="A"');
  a.E('render()');
  await a.esperar();
  assert.strictEqual(a.J('CTX.treino().aulas'), null,
    'pôr uma aula inteira num dia de prescrição seria emendar o programa por atalho');
  a.fechar();
});
