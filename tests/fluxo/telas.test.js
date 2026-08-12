// Regressão das telas e das regras inegociáveis do projeto.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, HTML, FONTE, DIA, inicioDaSemana } from './harness.js';

test('um artefato só, sem dependência de runtime', async () => {
  // O app agora tem build, mas a propriedade que importa continua: o que chega
  // no aparelho não busca nada na rede fora a fonte do Google.
  const urls = (HTML.match(/https?:\/\/[^"']+/g) || [])
    .filter(function (u) { return !/fonts\.(googleapis|gstatic)/.test(u); })
    // Namespaces XML (SVG, MathML, XHTML) são identificadores, não endereços:
    // o Preact usa createElementNS e o navegador nunca busca nada neles.
    .filter(function (u) { return !/^https?:\/\/www\.w3\.org\//.test(u); });
  assert.deepStrictEqual(urls, [], 'só a fonte do Google é permitida');
  assert.ok(!/<script[^>]*\ssrc=/.test(HTML), 'nenhum script buscado à parte');
});

test('paleta e tom preservados', async () => {
  // A paleta é a do Instrumento desde a fusão; a antiga foi aposentada e os
  // nomes dela agora só apontam para estes valores.
  ['#0C0E0C', '#111411', '#22271F', '#2B302A', '#3A4137',
   '#F2F4EF', '#D6DAD0', '#A8AFA1', '#7C8478', '#CBF35E', '#FFC46B', '#FF8A6B']
    .forEach(function (cor) { assert.ok(HTML.includes(cor), 'sumiu da paleta: ' + cor); });
  // Regra 5: sem emoji. A única exceção autorizada são os marcadores de
  // período do calendário, declarados em PERIODOS. Verificado no FONTE, não no
  // build: o bundler troca `const` por `var` e reindenta.
  const semPeriodos = FONTE.replace(/(const|var|let) PERIODOS = \[[\s\S]*?\n\];/, '');
  assert.ok(!/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(semPeriodos),
    'emoji fora do bloco PERIODOS');
});

test('todo handler inline está publicado na ponte global', async () => {
  // O app é módulo ES: `function foo(){}` não é mais `window.foo`, mas
  // `onclick="foo()"` só enxerga o global. Um nome citado em atributo e ausente
  // de HANDLERS_INLINE vira botão morto — quebra silenciosa que nenhum outro
  // teste pega, porque no jsdom o bundle roda como script clássico.
  const bridge = FONTE.match(/const HANDLERS_INLINE = \{([\s\S]*?)\n\};/);
  assert.ok(bridge, 'a ponte HANDLERS_INLINE sumiu do fonte');
  const publicados = new Set(bridge[1].split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean));

  const citados = new Set();
  const re = /\son(?:click|input|change|blur|focus|submit|keydown)=(["'])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(FONTE + HTML))) {
    let f; const rf = /([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
    while ((f = rf.exec(m[2]))) citados.add(f[1]);
  }
  // métodos e globais legítimos do próprio DOM, que não passam pela ponte
  ['this', 'JSON', 'Number', 'String', 'Math', 'select', 'focus', 'blur',
   'getElementById', 'parseInt', 'parseFloat', 'stopPropagation', 'preventDefault']
    .forEach(function (n) { citados.delete(n); });

  const faltando = [...citados].filter(function (n) { return !publicados.has(n); });
  assert.deepStrictEqual(faltando, [], 'handler inline sem ponte global');
});

test('as cinco abas da shell renderizam', async () => {
  // A fusão trocou quatro abas por cinco: treino e comida são metades do mesmo
  // dia, e HOJE é a tela que junta as duas numa timeline só.
  const a = await app();
  assert.deepStrictEqual(
    a.$$('.ins-tab').map(function (b) { return b.textContent; }),
    ['hoje', 'treino', 'comida', 'dados', 'guia']
  );
  ['hoje', 'treino', 'comida', 'dados', 'guia'].forEach(function (t) {
    a.aba(t);
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'aba vazia: ' + t);
  });
  a.fechar();
});

test('o app abre em HOJE, não no treino', async () => {
  // O harness abre no treino porque quase todo teste desta pasta é sobre ele.
  // O padrão de verdade é HOJE: é o que responde "e agora?" ao acordar.
  const a = await app({ aba: 'hoje' });
  assert.ok(a.$('.ins-foco') || a.$('.ins-tl'), 'HOJE mostra o foco ou a timeline');
  assert.strictEqual(a.E('view.aba'), 'hoje');
  a.fechar();
});

test('o contexto do treino só aparece na aba de treino', async () => {
  // Rotação, faixa da semana e o botão do dia são contexto de sessão. Fora do
  // TREINO eles competiriam com o assunto da tela sem servir para nada.
  const a = await app();
  assert.ok(a.$('.tr-rot') && a.$('.semana') && a.$('.ins-estado-v'));
  ['dados', 'guia'].forEach(function (t) {
    a.aba(t);
    assert.strictEqual(a.$('.tr-rot'), null, 'rotação competindo na aba ' + t);
    assert.strictEqual(a.$('.semana'), null);
  });
  a.fechar();
});

test('faixa da semana marca os dias e abre atalho nos vazios', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: seg + 7 * 3600000, sid: seg }] } });
  const cels = a.$$('.wd');
  assert.strictEqual(cels.length, 7);
  assert.strictEqual(cels[0].querySelector('.wd-v').textContent, 'A');

  // Numa segunda-feira não existe dia passado e vazio na semana; o calendário
  // do mês sempre tem, então o atalho é verificado lá.
  a.E('tab("acomp")');
  const vazio = a.$$('.cal-d').find(function (c) {
    return !c.className.includes('feito') && !c.className.includes('futuro');
  });
  assert.ok(vazio, 'o mês sempre tem algum dia passado sem treino');
  assert.match(vazio.getAttribute('onclick') || '', /abrirAdicionar/);
  a.fechar();
});

test('acompanhamento soma dias, tempo e volume do mês', async () => {
  const done = [], logs = { A0: [] };
  for (let k = 0; k < 3; k++) {
    const t = Date.now() - k * DIA;
    done.push({ day: 'A', t: t, sid: t, dur: 50 * 60000 });
    logs.A0.push({ t: t, sid: t, sets: [[40, 10], [40, 10]] });
  }
  const a = await app({ estado: { logs: logs, done: done } });
  a.E('tab("acomp")');

  const stats = a.$$('.stats b').map(function (x) { return x.textContent; });
  assert.strictEqual(stats[0], '3', 'três dias treinados');
  assert.strictEqual(stats[1], '2h30', 'três sessões de 50 min');
  assert.strictEqual(a.$$('.sessrow').length, 3);
  assert.ok(a.$$('.cal-d.feito').length >= 1);
  a.fechar();
});

test('acompanhamento não avança para o futuro', async () => {
  const a = await app();
  a.E('tab("acomp")');
  a.E('mudaMes(1)');
  assert.strictEqual(a.E('view.mes'), 0);
  a.E('mudaMes(-1)');
  assert.strictEqual(a.E('view.mes'), -1);
  a.fechar();
});

test('média semanal, não sequência de dias', async () => {
  const a = await app();
  a.E('tab("acomp")');
  const txt = a.doc.getElementById('app').textContent.toLowerCase();
  assert.ok(!/sequ[eê]ncia|streak|dias seguidos/.test(txt),
    'sequência puniria a quebra: quem treina 5 a 6 vezes quebra todo domingo');
  a.fechar();
});

test('substituição oferece alternativas para todos os exercícios', async () => {
  const a = await app();
  const semAlt = a.J(`
    rot().reduce(function (acc, d) {
      treino(d).ex.forEach(function (ex) {
        if (!ALT[ex.n] || ALT[ex.n].length < 2) acc.push(d + ' ' + ex.n);
      });
      return acc;
    }, [])`);
  assert.deepStrictEqual(semAlt, []);
  a.fechar();
});

test('dor em duas sessões seguidas sugere trocar o ângulo', async () => {
  const t1 = Date.now() - 14 * DIA, t2 = Date.now() - 7 * DIA;
  const a = await app({ estado: {
    logs: { A0: [
      { t: t1, sid: t1, sets: [[40, 10]], dor: ['ombro'] },
      { t: t2, sid: t2, sets: [[40, 10]], dor: ['ombro'] }
    ] },
    done: [{ day: 'F', t: t2, sid: t2 }]
  } });
  a.E('go("A")');
  assert.ok(a.texto('.painbox').includes('duas últimas sessões'));
  assert.ok(a.$('.painbtn'), 'sugere, com atalho, mas não troca sozinho');
  a.fechar();
});

test('pausa longa suspende o selo de subir carga', async () => {
  const t = Date.now() - 30 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10], [40, 10], [40, 10], [40, 10]] }] },
    done: [{ day: 'F', t: t, sid: t }]
  } });
  a.E('go("A")');
  assert.strictEqual(a.$('.up'), null, 'não manda subir carga voltando de 30 dias parado');
  assert.ok(a.$$('.deload').some(function (x) { return /dias desde o último treino/.test(x.textContent); }));
  a.E('toggle(0)');
  assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '40', 'a referência continua visível');
  a.fechar();
});

test('anotação e dor ficam atrás de um link', async () => {
  const a = await app();
  a.E('toggle(0)');
  assert.strictEqual(a.$$('.ex.open .chip').length, 0, 'chips não ocupam espaço por padrão');
  // dois .notabtn no exercício aberto: o seletor de carga e a anotação
  const links = a.$$('.ex.open .notabtn').map(function (x) { return x.textContent.trim(); });
  assert.ok(links.includes('anotar algo'), links.join(' | '));

  a.E('abrirNota(0)');
  assert.strictEqual(a.$$('.ex.open .chip').length, 3);

  a.digitar('o0', 'algo');
  a.E('toggle(0)');
  a.E('toggle(0)');
  assert.ok(a.doc.getElementById('o0'), 'com conteúdo, o bloco reabre sozinho');
  a.fechar();
});

test('correção de sessão passada altera e apaga', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[400, 10], [40, 10]] }] },
    done: [{ day: 'F', t: t, sid: t }]
  } });
  a.E('go("A")');
  a.E('toggle(0)');
  a.E('openHist(0)');
  assert.ok(a.$('.edbtn'), 'toda sessão do histórico pode ser corrigida');

  a.E('editarSessao(0)');
  a.digitar('ed0_0', '40');
  await a.E('salvarEdicao()');
  await a.esperar();
  assert.strictEqual(a.log('A',0)[0].sets[0][0], 40, 'digitou 400 no lugar de 40');

  a.E('editarSessao(0)');
  await a.E('apagarSessao()');
  await a.esperar();
  assert.strictEqual(a.log('A',0), null);
  a.fechar();
});

test('séries por músculo compara com o mesmo ponto das semanas anteriores', async () => {
  // Contra semanas cheias, toda terça o painel inteiro apareceria despencando.
  const a = await app();
  const src = a.E('seriesPorMusculo.toString()');
  assert.ok(/corte/.test(src), 'a função precisa aceitar o corte da semana em andamento');
  a.E('tab("corpo")');
  assert.ok(a.doc.getElementById('app').textContent.includes('mesmo ponto'));
  a.fechar();
});

test('painel de músculos avisa quando há treino avulso no período', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [
    { t: seg + 3600000, sid: seg, livre: 1, grupos: ['peito', 'tríceps'] }
  ] } });
  a.E('tab("corpo")');
  const nota = a.$$('.dgroup p').find(function (x) { return /avuls/.test(x.textContent); });
  assert.ok(nota, 'sem o aviso o número pareceria completo quando não é');
  assert.ok(nota.textContent.includes('peito'));
  a.fechar();
});
