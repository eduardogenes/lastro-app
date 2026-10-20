// O RESTO DO LUGAR, na árvore: o "+1 copo" que o aparelho recusa e a forma da
// refeição que pousa.
//
// Peça 8 do motion (docs/motion/08 §4 e §5.1; dono, 16/10, pergunta 13).
//
// O DEFEITO 6 (docs/motion/03 §8.7): cada "+1 copo" guardava o seu `antes` e,
// recusado, devolvia a conta a ele. Dois toques antes da primeira resposta davam
// errado nos dois sentidos — o primeiro recusado e o segundo aceito apagavam o
// copo que o disco guardou; os dois recusados deixavam na tela o copo que o disco
// recusou. A regra que os casos cobram é a da tela de sempre: ela nunca mostra
// copo que o disco recusou, nem perde copo que ele guardou.
//
// A FORMA (03 §4.6): a da linha marcada pela própria linha pousa, sob uma marca
// de "recém" que vence sozinha; a da leitura de volta, a do cartão de cima e a
// que reaparece numa aba nova, não. O movimento como o motor o roda é
// `enche.test.js`.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, CHAVE } from './harness.js';

function dataLocal(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
/** O Agora às 15h41 de um dia de descanso: o lanche das 16h é o cartão, o almoço passou sem marca. */
function noAgora(extra) {
  const agora = agoraEstavel(15, 41);
  return app(Object.assign({ aba: 'agora', agora: agora, estado: { plano: 7, logs: {}, done: [],
    dia: { data: dataLocal(agora), done: {}, agua: 0, escala: {}, cadencia: 'descanso', alta: 0 } } }, extra || {}));
}

/**
 * Tudo o que a linha da água mostrou, desenho a desenho: cada valor que o rótulo
 * ("água: N de 14 copos") e cada copo tiveram, lido dos registros de mutação com
 * o valor antigo — inclusive os desenhos que acontecem no meio, que um caso que
 * só olha o fim não vê.
 */
function vigiaAAgua(a) {
  const w = a.window;
  const registros = [];
  const mo = new w.MutationObserver(function (rs) { registros.push.apply(registros, rs); });
  mo.observe(a.$('.ag-agua'), { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'aria-label'] });
  return function () {
    registros.push.apply(registros, mo.takeRecords());
    mo.disconnect();
    const contas = registros.filter(r => r.attributeName === 'aria-label' && r.oldValue)
      .map(r => Number(/água: (\d+)/.exec(r.oldValue)[1]));
    contas.push(Number(/água: (\d+)/.exec(a.$('.ag-agua-t').getAttribute('aria-label'))[1]));
    const copos = a.$$('.ag-copos i');
    // o maior copo que esteve cheio em algum desenho
    let maior = copos.filter(c => c.classList.contains('f')).length;
    registros.filter(r => r.attributeName === 'class' && /\bf\b/.test(r.oldValue || '') && copos.includes(r.target))
      .forEach(r => { maior = Math.max(maior, copos.indexOf(r.target) + 1); });
    return { contas: contas, maiorCopoCheio: maior };
  };
}

test('dois "+1 copo" antes da resposta, os dois recusados: a conta fica no que o disco tem, e nenhum desenho mostra o copo recusado', async () => {
  const a = await noAgora();
  a.clicar('[data-a="agua-mais"]');
  await a.esperar(60);
  assert.strictEqual(a.gravado().dia.agua, 1, 'pré-condição: um copo no disco');

  a.encheCota();
  const viu = vigiaAAgua(a);
  // os dois toques no mesmo tique: o segundo chega antes da resposta do primeiro
  a.clicar('[data-a="agua-mais"]');
  a.clicar('[data-a="agua-mais"]');
  await a.esperar(60);
  const v = viu();

  assert.strictEqual(a.gravado().dia.agua, 1, 'o disco ficou no que tinha');
  assert.strictEqual(a.S().dia.agua, 1, 'e a memória volta ao que o disco tem (antes do conserto: 2, o copo do primeiro toque)');
  assert.ok(/Água · 1 de 14 copos/.test(a.texto('.ag-agua-t')), a.texto('.ag-agua-t'));
  assert.strictEqual(a.$$('.ag-copos i.f').length, 1);
  assert.deepStrictEqual([...new Set(v.contas)], [1], 'nenhum desenho mostrou outra conta: ' + v.contas.join(' → '));
  assert.strictEqual(v.maiorCopoCheio, 1, 'nenhum desenho encheu um copo que o disco recusou');
  assert.ok(/O 2º copo não foi gravado/.test(a.texto('.ag-agua-f')), 'diz o primeiro copo que não entrou: ' + a.texto('.ag-agua-f'));
  assert.ok(/continua em 1/.test(a.texto('.ag-agua-f')));

  // e o "Tentar de novo" grava, como sempre
  a.encheCota(false);
  a.clicar('[data-a="agua-tenta"]');
  await a.esperar(60);
  assert.strictEqual(a.gravado().dia.agua, 2);
  assert.strictEqual(a.$('.ag-agua-f'), null);
  a.fechar();
});

test('dois "+1 copo" antes da resposta, o primeiro recusado e o segundo aceito: os dois copos ficam, na tela e no disco', async () => {
  const a = await noAgora();
  // o aparelho recusa UMA escrita do estado, a próxima, e volta a aceitar
  const proto = Object.getPrototypeOf(a.window.localStorage);
  const setItem = proto.setItem;
  let recusa = 1;
  proto.setItem = function (k, v) {
    if (k === CHAVE && recusa > 0) { recusa--; throw new a.window.DOMException('cheio', 'QuotaExceededError'); }
    return setItem.call(this, k, v);
  };
  try {
    a.clicar('[data-a="agua-mais"]');
    a.clicar('[data-a="agua-mais"]');
    await a.esperar(60);
    assert.strictEqual(recusa, 0, 'pré-condição: a primeira escrita foi recusada');
    assert.strictEqual(a.gravado().dia.agua, 2, 'a segunda escrita levou os dois copos');
    assert.strictEqual(a.S().dia.agua, 2, 'e a memória não desfez o copo que o disco guardou (antes do conserto: 0)');
    assert.ok(/Água · 2 de 14 copos/.test(a.texto('.ag-agua-t')), a.texto('.ag-agua-t'));
    assert.strictEqual(a.$$('.ag-copos i.f').length, 2);
    assert.strictEqual(a.$('.ag-agua-f'), null, 'os dois estão guardados: não há copo a dizer que faltou');

    // a gravação seguinte, de outra coisa, não apaga os copos
    a.v('ctx.setAlta', true);
    await a.esperar(800);
    assert.strictEqual(a.gravado().dia.agua, 2, 'a próxima gravação manteve os dois (antes do conserto: escrevia 0)');
  } finally { proto.setItem = setItem; }
  a.fechar();
});

/**
 * O host (`window.storage`) responde quando quer — aqui, quando o caso mandar:
 * cada escrita do estado fica pendurada até o caso aceitar ou recusar. O espelho
 * local também recusa (a cota cheia), então a recusa do host é a do aparelho.
 * Depois da primeira recusa o app deixa o host e grava só no espelho (`db.ts`):
 * cada caso abre o seu.
 */
async function comHostQueSegura() {
  const pendentes = [];
  let segura = false;                    // o boot grava livre; o caso começa a segurar depois
  const a = await noAgora({
    antesDoApp: function (w) {
      const guardado = {};
      w.storage = {
        get: function (k) { return Promise.resolve(k in guardado ? { value: guardado[k] } : null); },
        set: function (k, v) {
          if (!segura || k !== CHAVE) { guardado[k] = v; return Promise.resolve(); }
          return new Promise(function (ok, nao) {
            pendentes.push({ aceita: function () { guardado[k] = v; ok(); }, recusa: function () { nao(new Error('recusou')); } });
          });
        },
        delete: function (k) { delete guardado[k]; return Promise.resolve(); }
      };
    }
  });
  assert.strictEqual(a.E('DB.mode'), 'host', 'pré-condição: o armazenamento é o do host');
  a.encheCota();
  segura = true;
  return { a, pendentes };
}

test('com o armazenamento que demora (o do host), o primeiro recusado e o segundo aceito: no meio a tela fica no que o disco tem, e no fim nos dois copos', async () => {
  const { a, pendentes } = await comHostQueSegura();
  const viu = vigiaAAgua(a);
  a.clicar('[data-a="agua-mais"]');
  a.clicar('[data-a="agua-mais"]');
  await a.esperar();
  assert.strictEqual(pendentes.length, 2, 'as duas escritas estão no ar');
  pendentes.shift().recusa();
  await a.esperar();
  assert.ok(/^Água$/.test(a.texto('.ag-agua-t .ins-body')),
    'com o segundo no ar, a tela mostra o que o disco tem — ' + a.texto('.ag-agua-t'));
  pendentes.shift().aceita();
  await a.esperar();
  const v = viu();
  assert.strictEqual(a.S().dia.agua, 2, 'o segundo levou os dois copos (antes do conserto: 0)');
  assert.ok(/Água · 2 de 14 copos/.test(a.texto('.ag-agua-t')), a.texto('.ag-agua-t'));
  assert.strictEqual(a.$('.ag-agua-f'), null);
  assert.deepStrictEqual([...new Set(v.contas)], [0, 2], 'a tela foi do que o disco tinha ao que o disco tem: ' + v.contas.join(' → '));
  a.fechar();
});

test('com o armazenamento que demora (o do host), os dois recusados: nenhum desenho mostra copo, e a conta fica no que o disco tem', async () => {
  const { a, pendentes } = await comHostQueSegura();
  const viu = vigiaAAgua(a);
  a.clicar('[data-a="agua-mais"]');
  a.clicar('[data-a="agua-mais"]');
  await a.esperar();
  assert.strictEqual(pendentes.length, 2, 'as duas escritas estão no ar');
  pendentes.shift().recusa();
  await a.esperar();
  assert.ok(/^Água$/.test(a.texto('.ag-agua-t .ins-body')),
    'o primeiro recusou e o segundo está no ar: a tela fica no que o disco tem — ' + a.texto('.ag-agua-t'));
  pendentes.shift().recusa();
  await a.esperar();
  const v = viu();
  assert.ok(!a.S().dia.agua, 'a conta volta ao que o disco tem (antes do conserto: 1)');
  assert.deepStrictEqual([...new Set(v.contas)], [0], 'nenhum desenho mostrou copo recusado: ' + v.contas.join(' → '));
  assert.strictEqual(v.maiorCopoCheio, 0);
  assert.ok(/O 1º copo não foi gravado/.test(a.texto('.ag-agua-f')), a.texto('.ag-agua-f'));
  a.fechar();
});

test('com o armazenamento que demora (o do host), o primeiro aceito e o segundo no ar: a tela mostra o copo guardado, e não o que espera resposta', async () => {
  const { a, pendentes } = await comHostQueSegura();
  const viu = vigiaAAgua(a);
  a.clicar('[data-a="agua-mais"]');
  a.clicar('[data-a="agua-mais"]');
  await a.esperar();
  assert.strictEqual(pendentes.length, 2, 'as duas escritas estão no ar');
  pendentes.shift().aceita();
  await a.esperar();
  assert.ok(/Água · 1 de 14 copos/.test(a.texto('.ag-agua-t')),
    'o primeiro copo está guardado e o segundo espera: a tela mostra um (antes do conserto: dois, o segundo sem resposta) — ' + a.texto('.ag-agua-t'));
  assert.strictEqual(a.$$('.ag-copos i.f').length, 1);
  pendentes.shift().recusa();
  await a.esperar();
  const v = viu();
  assert.strictEqual(a.S().dia.agua, 1, 'o segundo foi recusado: a conta fica no que o disco tem');
  assert.ok(/O 2º copo não foi gravado/.test(a.texto('.ag-agua-f')), a.texto('.ag-agua-f'));
  assert.ok(/continua em 1/.test(a.texto('.ag-agua-f')));
  assert.deepStrictEqual([...new Set(v.contas)], [0, 1], 'a tela foi de zero a um, e nunca a dois: ' + v.contas.join(' → '));
  assert.strictEqual(v.maiorCopoCheio, 1, 'nenhum desenho encheu o copo que acabou recusado');
  a.fechar();
});

/** As formas que pousam agora, pela linha em que estão. */
const pousando = a => a.$$('.df.recem').map(f => {
  const l = f.closest('.ag-l');
  return l ? l.querySelector('.ag-l-b').getAttribute('data-a') : (f.closest('.ag-volta') ? 'leitura de volta' : f.parentNode.className);
});

test('marcar pela linha pousa a forma DESSA linha, num nó novo que um render() não troca; a leitura de volta não pousa', async () => {
  const a = await noAgora();
  a.clicar('[data-a="linha-almoco"]');
  await a.esperar();
  const antes = a.$('[data-a="linha-almoco"] .df');
  assert.ok(/\bsem\b/.test(antes.getAttribute('class')), 'pré-condição: o almoço passou sem marca');
  a.clicar('[data-a="tudo-almoco"]');
  await a.esperar();

  assert.deepStrictEqual(pousando(a), ['linha-almoco'], 'só a forma da linha tocada pousa');
  const no = a.$('[data-a="linha-almoco"] .df');
  assert.notStrictEqual(no, antes, 'a forma nova é outro nó: a marca é outro estado');
  assert.ok(/\btudo\b/.test(no.getAttribute('class')));
  assert.ok(a.$('.ag-volta .df'), 'a leitura de volta nasceu, com a forma dela');
  assert.ok(!a.$('.ag-volta .df').classList.contains('recem'), 'e a dela não pousa');

  await a.pintar();
  assert.strictEqual(a.$('[data-a="linha-almoco"] .df'), no, 'um render() no meio não troca o nó (e o pouso não recomeça)');
  assert.deepStrictEqual(pousando(a), ['linha-almoco']);

  a.E('Date.now = (function (t) { return function () { return t; }; })(Date.now() + 1100)');
  await a.pintar();
  assert.deepStrictEqual(pousando(a), [], 'um segundo depois, o render() seguinte desenha sem a marca, sem ouvir o fim da animação');
  assert.strictEqual(a.$('[data-a="linha-almoco"] .df'), no, 'e a forma continua lá, parada');
  a.fechar();
});

test('"Metade" e a pergunta do "Não comi isso" pela linha também pousam; o cartão de cima, o Desfazer e a aba que volta, não', async () => {
  const a = await noAgora();
  a.clicar('[data-a="linha-almoco"]');
  await a.esperar();
  a.clicar('[data-a="metade-almoco"]');
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['linha-almoco'], '"Metade"');

  a.clicar('[data-a="linha-pos"]');
  await a.esperar();
  a.clicar('[data-a="naocomi-pos"]');
  await a.esperar();
  assert.ok(a.$('[data-a="nsei-pos"]'), 'a pergunta abriu na linha');
  a.clicar('[data-a="nsei-pos"]');
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['linha-pos'], 'a resposta da pergunta troca a marca pela dela');

  // o Desfazer pela linha: a forma volta, e não pousa
  a.clicar('[data-a="linha-pos"]');
  await a.esperar();
  a.clicar('[data-a="desfaz-pos"]');
  await a.esperar();
  assert.strictEqual(a.S().dia.done.pos, undefined, 'desfeito');
  assert.deepStrictEqual(pousando(a), [], 'desfazer não pousa');

  // o cartão de cima: o dedo está no cartão, e a linha lá embaixo muda sem se mexer
  assert.strictEqual(a.vJ('ctx.cartaoDeCima').id, 'lanche', 'pré-condição: o lanche é o cartão');
  a.clicar('[data-a="cartao-tudo"]');
  await a.esperar();
  assert.ok(a.S().dia.done.lanche > 0, 'o cartão gravou');
  assert.ok(/\btudo\b/.test(a.$('[data-a="linha-lanche"] .df').getAttribute('class')));
  assert.deepStrictEqual(pousando(a), [], 'marcar pelo cartão não pousa a linha');

  // a aba que volta nasce inteira: o que reaparece não pousa de novo
  a.clicar('[data-a="linha-jantar"]');
  await a.esperar();
  a.clicar('[data-a="tudo-jantar"]');
  await a.esperar();
  assert.deepStrictEqual(pousando(a), ['linha-jantar']);
  a.v('ctx.vaiPara', 'corpo');
  await a.esperar();
  a.v('ctx.vaiPara', 'agora');
  await a.esperar();
  assert.ok(/\btudo\b/.test(a.$('[data-a="linha-jantar"] .df').getAttribute('class')), 'a marca continua');
  assert.deepStrictEqual(pousando(a), [], 'e a forma que reaparece não pousa');
  a.fechar();
});
