// Regressão das telas e das regras inegociáveis do projeto.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, HTML, FONTE, DIA, inicioDaSemana } from './harness.js';

test('um artefato só, sem dependência de runtime', async () => {
  // O app ganhou sincronização, e com ela um endereço de DADO — o projeto do
  // Supabase. A propriedade que este teste guarda não era "nenhuma URL": era
  // que o artefato não BUSCA CÓDIGO nem asset na rede para funcionar. Isso
  // continua valendo, e é o que as duas asserções abaixo cobram.
  const urls = (HTML.match(/https?:\/\/[^"']+/g) || [])
    .filter(function (u) { return !/fonts\.(googleapis|gstatic)/.test(u); })
    // Namespaces XML (SVG, MathML, XHTML) são identificadores, não endereços:
    // o Preact usa createElementNS e o navegador nunca busca nada neles.
    .filter(function (u) { return !/^https?:\/\/www\.w3\.org\//.test(u); })
    // O endpoint da nuvem: chamado por fetch, sob login, e só quando há o que
    // sincronizar. O app abre e funciona inteiro sem ele.
    .filter(function (u) { return !/\.supabase\.co/.test(u); });
  assert.deepStrictEqual(urls, [], 'nenhum endereço além da fonte e da nuvem');
  assert.ok(!/<script[^>]*\ssrc=/.test(HTML), 'nenhum script buscado à parte');
  assert.ok(!/<link[^>]*rel=["']?stylesheet[^>]*supabase/.test(HTML), 'nem folha de estilo');
});

test('a nuvem não é pré-condição para o app abrir', async () => {
  // Sem sessão e sem rede, tudo tem que funcionar: é a regra que separa
  // "sincroniza" de "depende de servidor".
  const a = await app();
  assert.strictEqual(a.E('NUVEM.sessao()'), null, 'abre sem login nenhum');
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  assert.strictEqual(a.log('A', 0).length, 1, 'e registra série do mesmo jeito');
  assert.strictEqual(a.E('sync.sujo'), false, 'sem sessão, nem marca sujeira');
  a.fechar();
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

test('nenhum handler inline sobrou no fonte', async () => {
  // Este teste começou ao contrário: cobrava que todo nome citado num
  // `onclick=` estivesse republicado em `window`, porque o app virou módulo ES
  // e atributo só enxerga o escopo global. A ponte que ele guardava tinha 91
  // nomes e obrigava o build a rodar sem minify e sem tree-shaking — o
  // minificador renomeia binding de módulo, e o shaking apaga função que só é
  // alcançada por string.
  //
  // Com a última tela virando componente a ponte morreu, e o teste inverteu:
  // agora ele cobra a AUSÊNCIA. Um `onclick=` novo no fonte não seria um botão
  // morto — seria a dívida voltando, e junto com ela o build sem minify.
  const re = /\son(?:click|input|change|blur|focus|submit|keydown)=(["'])/g;
  const achados = [];
  let m;
  while ((m = re.exec(FONTE + HTML))) {
    achados.push((FONTE + HTML).slice(m.index, m.index + 60).replace(/\s+/g, ' '));
  }
  assert.deepStrictEqual(achados, [], 'handler inline de volta no fonte');
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
  a.aba('dados');
  const vazio = a.$$('.cal-d').find(function (c) {
    return !c.className.includes('feito') && !c.className.includes('futuro');
  });
  assert.ok(vazio, 'o mês sempre tem algum dia passado sem treino');
  a.clicar(vazio);
  assert.ok(a.E('view.add'), 'tocar num dia vazio abre o lançamento retroativo');
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
  a.aba('dados');

  const stats = a.$$('.ins-grade-c .ins-metric-m').map(function (x) { return x.textContent; });
  assert.ok(stats.includes('3'), 'três dias treinados: ' + stats.join(','));
  assert.ok(stats.includes('2h30'), 'três sessões de 50 min: ' + stats.join(','));
  assert.strictEqual(a.$$('.sessrow').length, 3);
  assert.ok(a.$$('.cal-d.feito').length >= 1);
  a.fechar();
});

test('acompanhamento não avança para o futuro', async () => {
  const a = await app();
  a.aba('dados');
  a.E('mudaMes(1)');
  assert.strictEqual(a.E('view.mes'), 0);
  a.E('mudaMes(-1)');
  assert.strictEqual(a.E('view.mes'), -1);
  a.fechar();
});

test('média semanal, não sequência de dias', async () => {
  const a = await app();
  a.aba('dados');
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
        if (ex.g && (!ALT[ex.n] || ALT[ex.n].length < 2)) acc.push(d + ' ' + ex.n);
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
  // o RIR saiu daqui: virou coluna por série. Sobraram as dores de tendão.
  assert.strictEqual(a.$$('.ex.open .chip').length, 3);
  const chips = a.$$('.ex.open .chip').map(function (x) { return x.textContent.trim(); });
  assert.ok(chips.includes('cotovelo'), chips.join(' | '));

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
  // Contra semanas CHEIAS, toda terça o painel inteiro apareceria despencando:
  // dois dias de treino contra sete. A comparação tem que cortar as semanas
  // passadas no mesmo ponto em que a atual está.
  //
  // Este teste já leu o `toString()` da função atrás do nome do parâmetro. Não
  // lê mais: o build minifica, e o nome do parâmetro deixou de existir. O que
  // importa nunca foi o nome — é a série da semana passada encolher quando o
  // corte encolhe.
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [] } });

  const semanaPassada = seg - 7 * 86400000;
  // chave real do catálogo: sem grupo muscular a série não entra na conta
  const ex = a.E('treino("A").ex[0].id');
  const g = a.E('exDe(' + JSON.stringify(ex) + ').g');
  a.E('S.logs[' + JSON.stringify(ex) + '] = [' +
      '{ t: ' + (semanaPassada + 3600000) + ', sid: 1, sets: [[40,10],[40,10]] },' +
      '{ t: ' + (semanaPassada + 5 * 86400000) + ', sid: 2, sets: [[40,10],[40,10]] }]');

  const cedo = a.J('seriesPorMusculo(' + semanaPassada + ', ' + seg + ', 86400000)');
  const tudo = a.J('seriesPorMusculo(' + semanaPassada + ', ' + seg + ')');
  assert.strictEqual(tudo[g], 4, 'a semana inteira conta as duas sessões');
  assert.strictEqual(cedo[g], 2, 'cortada no primeiro dia, conta só a primeira');

  a.aba('dados');
  assert.ok(a.doc.getElementById('app').textContent.includes('mesmo ponto'));
  a.fechar();
});

test('painel de músculos avisa quando há treino avulso no período', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [
    { t: seg + 3600000, sid: seg, livre: 1, grupos: ['peito', 'tríceps'] }
  ] } });
  a.aba('dados');
  const nota = a.$$('.ins-provenance').find(function (x) { return /avuls/.test(x.textContent); });
  assert.ok(nota, 'sem o aviso o número pareceria completo quando não é');
  assert.ok(nota.textContent.includes('peito'));
  a.fechar();
});

// O gráfico é a única coisa que ainda entra por markup gerado, e a licença
// para isso é ele não ter comportamento: desenho puro, nenhum handler, nenhum
// id que outra função procure. Se alguém colar um `onclick` ali dentro, o
// desenho vira código alcançável só por string — exatamente a dívida que o
// resto da migração serviu para pagar.
test('o gráfico do histórico é desenho, não comportamento', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t - DIA, sid: t - DIA, sets: [[40, 10]] },
                 { t: t, sid: t, sets: [[45, 10]] }] },
    done: [{ day: 'A', t: t, sid: t }]
  } });
  a.E('go("A")');
  a.E('openHist(0)');

  const g = a.$('.ins-grafico');
  assert.ok(g, 'o gráfico foi desenhado');
  assert.ok(g.querySelector('svg'), 'e é SVG');
  const sujos = [...g.querySelectorAll('*')].filter(function (el) {
    return [...el.attributes].some(function (at) { return /^on/i.test(at.name); });
  });
  assert.strictEqual(sujos.length, 0, 'nenhum handler inline dentro do gráfico');
  a.fechar();
});

// ---------- a tabela de séries ----------

test('cada série tem carga, repetição e RIR, com o anterior ao lado', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { 'chest-press-inclinado-convergente': [
      { t: t, sid: t, sets: [[55, 10, 2], [55, 9, 1], [55, 8, 0]] }
    ] },
    done: [{ day: 'A', t: t, sid: t, dur: 0 }]
  } });
  a.E('go("A")');
  a.E('toggle(0)');

  const head = a.$('.ex.open .sethead');
  assert.ok(head, 'a tabela tem cabeçalho');
  assert.match(head.textContent, /série.*anterior.*kg.*reps.*rir/i, head.textContent);

  // a coluna ANTERIOR é por série: a linha 3 mostra a linha 3 da última vez
  const antes = a.$$('.ex.open .setrow .setant').map(x => x.textContent.trim());
  assert.deepStrictEqual(antes, ['55 × 10 @ 2', '55 × 9 @ 1', '55 × 8 @ 0']);

  // e o placeholder do RIR é dado, como os outros dois
  assert.strictEqual(a.doc.getElementById('q0_2').placeholder, '0');
  a.fechar();
});

test('o RIR digitado entra na própria série', async () => {
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.digitar('q0_0', '2');
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [60, 8, 2]);

  // série sem RIR continua sendo um par: o campo é opcional
  a.preencher(0, 1, 60, 7);
  assert.deepStrictEqual(a.log('A', 0)[0].sets[1], [60, 7]);
  a.fechar();
});

test('RIR fora da faixa é contido em vez de aceito', async () => {
  // acima de 5 o número não diz mais nada sobre proximidade da falha
  const a = await app();
  a.E('toggle(0)');
  a.preencher(0, 0, 60, 8);
  a.digitar('q0_0', '9');
  assert.strictEqual(a.log('A', 0)[0].sets[0][2], 5);
  a.fechar();
});

test('o descanso é um por exercício, não um por série', async () => {
  const a = await app();
  a.E('toggle(0)');
  assert.strictEqual(a.$$('.ex.open .restlinha').length, 1,
    'o valor era o mesmo em todas as linhas: repeti-lo ocupava a coluna do RIR');
  assert.match(a.$('.ex.open .restlinha').textContent, /descanso/i);
  a.fechar();
});
