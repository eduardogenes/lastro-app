// Regressão das telas e das regras inegociáveis do projeto.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, HTML, FONTE, DIA, inicioDaSemana } from './harness.js';

/**
 * O endereço da nuvem — a origem do projeto e os caminhos que carregam DADO.
 *
 * O recorte é estreito de propósito. Antes bastava ser `.supabase.co` para
 * passar, o que deixaria entrar uma imagem servida do Storage: asset, buscado
 * na rede para a tela funcionar, exatamente o que a regra proíbe. O teste
 * ficaria verde numa regra quebrada, que é pior do que falhar.
 *
 * Foto que ELE tira é dado, e mora no Cache Storage sob URL de mesma origem —
 * não passa por aqui.
 */
const nuvemDeDados = u =>
  !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(u) &&
  !/\.supabase\.co\/(rest|auth)\//.test(u);

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
    .filter(nuvemDeDados);
  assert.deepStrictEqual(urls, [], 'nenhum endereço além da fonte e da nuvem');
  assert.ok(!/<script[^>]*\ssrc=/.test(HTML), 'nenhum script buscado à parte');
  assert.ok(!/<link[^>]*rel=["']?stylesheet[^>]*supabase/.test(HTML), 'nem folha de estilo');
});

test('a nuvem não é pré-condição para o app abrir', async () => {
  // Sem sessão e sem rede, tudo tem que funcionar: é a regra que separa
  // "sincroniza" de "depende de servidor".
  const a = await app();
  assert.strictEqual(a.v('nuvem.sessao'), null, 'abre sem login nenhum');
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  assert.strictEqual(a.log('A', 0).length, 1, 'e registra série do mesmo jeito');
  assert.strictEqual(a.dado('sync').sujo, false, 'sem sessão, nem marca sujeira');
  a.fechar();
});

test('paleta e tom preservados', async () => {
  // A paleta foi substituída inteira em 11/10 pela decisão 12 do dono ("sem
  // herancas"): saiu o conjunto escuro com acento ácido, entrou o de papel
  // claro com acento azul-violeta, e o escuro virou o espelho dele. Os valores
  // abaixo são os dois temas — o build carrega os dois, e é no build que este
  // caso olha.
  ['#E7E3DB', '#F5F3EE', '#EDEAE3', '#15171A', '#474C54', '#5C6169',
   '#DCD7CD', '#8C867A', '#3833DB', '#2C28BE', '#E9E8FD',
   '#FBEFD6', '#5E3B00', '#FBE4E1', '#7F1A12',
   '#08090A', '#111214', '#1B1D21', '#F2F1EE', '#9E9BFF']
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

test('os cinco LUGARES da shell renderizam, e nenhum é a sessão', async () => {
  // Reescrito de propósito: esta asserção dizia `['hoje','treino','comida',
  // 'dados','guia']`, e a frente 1 avisou que ela mudaria. Os cinco lugares
  // respondem cinco perguntas e nenhuma repetida; a SESSÃO não é um deles —
  // virou modo, porque ela não é um lugar entre lugares, é um estado em que o
  // resto sai da frente.
  //
  // E monta no AGORA e não no padrão do harness: dentro do modo a barra não é
  // desenhada, e um caso sobre a barra que a lê de dentro do modo leria vazio.
  const a = await app({ aba: 'agora' });
  const nomes = ['agora', 'dias', 'corpo', 'semana', 'prescrição'];
  assert.deepStrictEqual(
    a.$$('.ins-tab').map(function (b) { return b.textContent; }), nomes);
  assert.ok(nomes.indexOf('treino') < 0, 'a sessão não é lugar: é modo, e tem três portas');

  ['agora', 'dias', 'corpo', 'semana', 'prescricao'].forEach(function (t) {
    a.aba(t);
    assert.ok(a.doc.getElementById('app').innerHTML.length > 600, 'lugar vazio: ' + t);
  });
  a.fechar();
});

test('todo chip de um lugar abre, e não só os que algum caso visita', async () => {
  // Este caso nasce de um defeito que viveu muitas rodadas sem ser nomeado, e
  // o modo de falha é o que importa guardar.
  //
  // Na reescrita dos cinco lugares eu renomeei o estado do seletor de
  // Prescrição de `aba` para `modo` e deixei QUATRO referências a `aba` dentro
  // dos ramos — `{aba === 'plano' && …}`, `{aba === 'alimentos' && …}`,
  // `{aba === 'compras' && …}`. Em JSX isso é `ReferenceError` no render: dois
  // dos quatro chips de Prescrição quebravam a tela inteira, não a seção.
  //
  // E nenhum caso clicava naqueles dois chips. O estouro acontece dentro do
  // rerender que a mudança de estado agenda, então chega como `unhandled
  // rejection`: o Vitest o conta no rodapé, com o aviso "this might cause
  // false positive tests", **e sai com código 1** — medi provocando uma
  // rejeição sozinha, sem caso vermelho, e deu `Tests 1261 passed` com saída
  // 1. Ou seja: a suíte dizia vermelho, e quem leu a CONTAGEM em vez do status
  // fui eu, porque minhas rodadas passam por `| grep` e o cano devolve o
  // status do último comando.
  //
  // Então o que este caso acrescenta não é ver o defeito — é NOMEÁ-LO: o
  // rodapé diz "the latest test that might've caused it", e o caso diz qual
  // chip, de qual lugar.
  //
  // E a asserção não é "a tela tem conteúdo": é **o chip ficou ligado**.
  // Render que estoura não comita o DOM, e a classe `on` não chega — é o sinal
  // que distingue "abriu" de "não abriu" sem depender de saber o que cada chip
  // desenha.
  const a = await app({ aba: 'agora' });
  let vistos = 0;
  const chips = function () {
    return a.$$('.ins-chips button').map(function (b) { return b.textContent; });
  };
  const chip = function (rot) {
    return a.$$('.ins-chips button').filter(function (b) { return b.textContent === rot; })[0];
  };
  for (const t of ['agora', 'dias', 'corpo', 'semana', 'prescricao']) {
    a.aba(t);
    await a.esperar();
    // Varredura por PONTO FIXO, e não sobre uma lista tirada antes: há grupo de
    // chip DENTRO de ramo, então abrir um chip muda quais chips existem. Minha
    // primeira versão lia os rótulos uma vez e estourava no chip que o clique
    // anterior tinha tirado da tela. Visitar enquanto houver não visitado cobre
    // os aninhados também, que é o que "toda porta abre" quer dizer.
    const visitados = new Set();
    for (let volta = 0; volta < 40; volta++) {
      const falta = chips().filter(function (r) { return !visitados.has(r); });
      if (!falta.length) break;
      const rot = falta[0];
      visitados.add(rot);
      a.clicar(chip(rot));
      // Esperar é parte da asserção: o Preact agenda o rerender, e sem isto o
      // caso só aprovaria o chip que já estava ligado.
      await a.esperar();
      const depois = chip(rot);
      assert.ok(depois && depois.className.includes('on'),
        'o chip "' + rot + '" de ' + t + ' não ligou: o render estourou');
      assert.ok(a.doc.getElementById('app').innerHTML.length > 600,
        'o chip "' + rot + '" de ' + t + ' deixou o lugar vazio');
      vistos++;
    }
  }
  assert.ok(vistos >= 4, 'achei só ' + vistos + ' chips nos cinco lugares: o leitor quebrou');
  a.fechar();
});

test('o app abre no AGORA, não na sessão', async () => {
  // O harness abre na tela do treino porque quase todo caso desta pasta é sobre
  // ela. O padrão de verdade é o AGORA: é o que responde "e agora?" ao acordar.
  const a = await app({ aba: 'agora' });
  assert.ok(a.$('.ins-foco') || a.$('.ins-tl'), 'o AGORA mostra o cartão ou a linha do dia');
  assert.strictEqual(a.vista().aba, 'agora');
  assert.strictEqual(a.vista().modoSessao, false, 'e sem o modo por cima');
  a.fechar();
});

test('o modo tem a ROTAÇÃO e não tem placar nenhum', async () => {
  // Reescrito duas vezes, e a segunda corrige a primeira. A regra original era
  // "o contexto do treino só aparece na aba de treino" (achado 5: com a aba
  // virando modo ela não tem como ser reescrita igual). Na primeira reescrita eu
  // afirmei que a FAIXA DA SEMANA estava dentro do modo — e isso cristalizava o
  // contrário da regra: o §4.2 diz que a sessão esconde "o resumo do dia, as
  // médias, os placares", porque isso é "como está?" e o modo responde "e
  // agora?". A faixa era placar, e estava ali porque a aba a mantinha.
  //
  // O que o modo tem é a ROTAÇÃO — qual dia é este e qual vem depois, que é
  // contexto da sessão. O que ele não tem é placar de nenhum tipo.
  const a = await app();
  assert.ok(a.vista().modoSessao, 'pré-condição: o harness entra pelo modo');
  assert.ok(a.$('.tr-rot'), 'a rotação é contexto da sessão, e está no modo');
  assert.strictEqual(a.$('.semana'), null, 'a faixa da semana é placar: saiu');
  assert.strictEqual(a.$('.cardl'), null, 'e o placar do cardio também');

  ['agora', 'dias', 'corpo', 'semana', 'prescricao'].forEach(function (t) {
    a.aba(t);
    assert.strictEqual(a.$('.tr-rot'), null, 'rotação competindo no lugar ' + t);
  });
  a.fechar();
});

test('faixa da semana marca os dias e abre atalho nos vazios', async () => {
  // A faixa e o calendário do mês moram no MESMO lugar agora — Dias —, e isso é
  // melhoria de contrato: eles mostram a mesma semana, e divergir seria o app
  // contando duas histórias sobre o mesmo domingo. Antes estavam em telas
  // diferentes e a comparação dependia de navegar.
  const seg = inicioDaSemana(Date.now());
  const a = await app({ aba: 'dias',
    estado: { logs: {}, done: [{ day: 'A', t: seg + 7 * 3600000, sid: seg }] } });
  const cels = a.$$('.wd');
  assert.strictEqual(cels.length, 7);
  assert.strictEqual(cels[0].querySelector('.wd-v').textContent, 'A');

  // Numa segunda-feira não existe dia passado e vazio na semana; o calendário
  // do mês sempre tem, então o atalho é verificado lá — e os dois estão na
  // mesma tela, sem navegar.
  const vazio = a.$$('.cal-d').find(function (c) {
    return !c.className.includes('feito') && !c.className.includes('futuro');
  });
  assert.ok(vazio, 'o mês sempre tem algum dia passado sem treino');
  a.clicar(vazio);
  assert.ok(a.vista().add, 'tocar num dia vazio abre o lançamento retroativo');
  a.fechar();
});

test('acompanhamento soma dias, tempo e volume do mês', async () => {
  // relógio fixo: a tela lê o MÊS, e três dias para trás a partir do dia 1º
  // caem no mês anterior — a asserção falharia sem nada ter quebrado
  const agora = agoraEstavel();
  const done = [], logs = { A0: [] };
  for (let k = 0; k < 3; k++) {
    const t = agora - k * DIA;
    done.push({ day: 'A', t: t, sid: t, dur: 50 * 60000 });
    logs.A0.push({ t: t, sid: t, sets: [[40, 10], [40, 10]] });
  }
  const a = await app({ agora: agora, estado: { logs: logs, done: done } });
  a.aba('dias');

  const stats = a.$$('.ins-grade-c .ins-metric-m').map(function (x) { return x.textContent; });
  assert.ok(stats.includes('3'), 'três dias treinados: ' + stats.join(','));
  assert.ok(stats.includes('2h30'), 'três sessões de 50 min: ' + stats.join(','));
  assert.strictEqual(a.$$('.sessrow').length, 3);
  assert.ok(a.$$('.cal-d.feito').length >= 1);
  a.fechar();
});

test('acompanhamento não avança para o futuro', async () => {
  const a = await app();
  a.aba('dias');
  a.v('mudaMes', 1);
  assert.strictEqual(a.vista().mes, 0);
  a.v('mudaMes', -1);
  assert.strictEqual(a.vista().mes, -1);
  a.fechar();
});

test('média semanal, não sequência de dias', async () => {
  const a = await app();
  a.aba('semana');
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
  a.v('go', 'A');
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
  a.v('go', 'A');
  assert.strictEqual(a.$('.up'), null, 'não manda subir carga voltando de 30 dias parado');
  assert.ok(a.$$('.deload').some(function (x) { return /dias desde o último treino/.test(x.textContent); }));
  a.v('toggle', 0);
  assert.match(a.texto('.ex.open .setrow .setant'), /^40 × /, 'a referência continua visível');
  a.fechar();
});

test('anotação e dor ficam atrás de um link', async () => {
  const a = await app();
  a.v('toggle', 0);
  assert.strictEqual(a.$$('.ex.open .chip').length, 0, 'chips não ocupam espaço por padrão');
  // dois .notabtn no exercício aberto: o seletor de carga e a anotação
  const links = a.$$('.ex.open .notabtn').map(function (x) { return x.textContent.trim(); });
  assert.ok(links.includes('anotar algo'), links.join(' | '));

  a.v('abrirNota', 0);
  // o RIR saiu daqui: virou coluna por série. Sobraram as dores de tendão.
  assert.strictEqual(a.$$('.ex.open .chip').length, 3);
  const chips = a.$$('.ex.open .chip').map(function (x) { return x.textContent.trim(); });
  assert.ok(chips.includes('cotovelo'), chips.join(' | '));

  a.digitar('o0', 'algo');
  a.v('toggle', 0);
  a.v('toggle', 0);
  assert.ok(a.doc.getElementById('o0'), 'com conteúdo, o bloco reabre sozinho');
  a.fechar();
});

test('correção de sessão passada altera e apaga', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[400, 10], [40, 10]] }] },
    done: [{ day: 'F', t: t, sid: t }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);
  assert.ok(a.$('.edbtn'), 'toda sessão do histórico pode ser corrigida');

  a.v('editarSessao', 0);
  a.digitar('ed0_0', '40');
  await a.v('salvarEdicao');
  await a.esperar();
  assert.strictEqual(a.log('A',0)[0].sets[0][0], 40, 'digitou 400 no lugar de 40');

  a.v('editarSessao', 0);
  await a.v('apagarSessao');
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
  const ex = a.vJ('treino', 'A').ex[0].id;
  const g = a.vJ('exDe', ex).g;
  a.E('S.logs[' + JSON.stringify(ex) + '] = [' +
      '{ t: ' + (semanaPassada + 3600000) + ', sid: 1, sets: [[40,10],[40,10]] },' +
      '{ t: ' + (semanaPassada + 5 * 86400000) + ', sid: 2, sets: [[40,10],[40,10]] }]');

  const cedo = a.vJ('seriesPorMusculo', semanaPassada, seg, 86400000);
  const tudo = a.vJ('seriesPorMusculo', semanaPassada, seg);
  assert.strictEqual(tudo[g], 4, 'a semana inteira conta as duas sessões');
  assert.strictEqual(cedo[g], 2, 'cortada no primeiro dia, conta só a primeira');

  a.aba('semana');
  assert.ok(a.doc.getElementById('app').textContent.includes('mesmo ponto'));
  a.fechar();
});

test('painel de músculos avisa quando há treino avulso no período', async () => {
  const seg = inicioDaSemana(Date.now());
  const a = await app({ estado: { logs: {}, done: [
    { t: seg + 3600000, sid: seg, livre: 1, grupos: ['peito', 'tríceps'] }
  ] } });
  a.aba('semana');
  await a.modo('treino');
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
  a.v('go', 'A');
  a.v('openHist', 0);

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
  a.v('go', 'A');
  a.v('toggle', 0);

  const head = a.$('.ex.open .sethead');
  assert.ok(head, 'a tabela tem cabeçalho');
  assert.match(head.textContent, /série.*anterior.*kg.*reps.*rir/i, head.textContent);

  // a coluna ANTERIOR é por série: a linha 3 mostra a linha 3 da última vez
  const antes = a.$$('.ex.open .setrow .setant').map(x => x.textContent.trim());
  assert.deepStrictEqual(antes, ['55 × 10 @ 2', '55 × 9 @ 1', '55 × 8 @ 0']);

  // e as células ficam limpas: a referência tem uma casa só, e é a coluna.
  // A carga virou BOTÃO (teclado próprio), então não há placeholder a esvaziar —
  // o que se cobra é que a célula vazia mostre o ponto, e não a última carga.
  const carga = a.doc.getElementById('w0_0');
  assert.ok(!carga.hasAttribute('placeholder'), 'botão não tem placeholder a herdar');
  assert.strictEqual(carga.textContent, '·', 'vazia é vazia: a referência é a coluna');
  a.fechar();
});

test('o RIR entra na própria série, em dois toques', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);

  assert.strictEqual(a.$$('.ex.open .rirscale').length, 0, 'fechado, não custa espaço');
  a.clicar(a.doc.getElementById('q0_0'));
  const opcoes = a.$$('.ex.open .rirscale .rirop').map(x => x.textContent);
  assert.deepStrictEqual(opcoes, ['0', '1', '2', '3', '4'], 'tudo à vista, sem lista suspensa');

  a.clicar(a.$$('.ex.open .rirscale .rirop')[2]);      // o 2
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [60, 8, 2]);
  assert.strictEqual(a.$$('.ex.open .rirscale').length, 0, 'grava e fecha no mesmo toque');

  // série sem RIR continua sendo um par: registrar é opcional
  a.preencher(0, 1, 60, 7);
  assert.deepStrictEqual(a.log('A', 0)[0].sets[1], [60, 7]);
  a.fechar();
});

test('tocar de novo no valor escolhido limpa o RIR', async () => {
  // sem isto, um toque errado não teria volta: não há teclado para apagar
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  a.clicar(a.doc.getElementById('q0_0'));
  a.clicar(a.$$('.ex.open .rirscale .rirop')[1]);
  assert.strictEqual(a.log('A', 0)[0].sets[0][2], 1);

  a.clicar(a.doc.getElementById('q0_0'));
  a.clicar(a.$$('.ex.open .rirscale .rirop')[1]);
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [60, 8], 'voltou a ser um par');
  a.fechar();
});

test('a escala abre só na série tocada', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.clicar(a.doc.getElementById('q0_1'));
  assert.strictEqual(a.$$('.ex.open .rirscale').length, 1, 'uma linha por vez');
  assert.match(a.texto('.ex.open .rirscale-r'), /série 2/);
  a.fechar();
});

test('o descanso é um por exercício, não um por série', async () => {
  const a = await app();
  a.v('toggle', 0);
  assert.strictEqual(a.$$('.ex.open .restlinha').length, 1,
    'o valor era o mesmo em todas as linhas: repeti-lo ocupava a coluna do RIR');
  assert.match(a.$('.ex.open .restlinha').textContent, /descanso/i);
  a.fechar();
});

test('a tabela do cartão não alcança o formulário de corrigir sessão', async () => {
  // Regressão real: a tabela de séries virou grade de cinco colunas reusando
  // `.setrow`, e o formulário de correção usa a MESMA classe com quatro células
  // — número, carga, ×, repetições. Sem escopo, a grade do cartão aplicava lá e
  // espremia a carga em 96px. Duas estruturas, uma classe: o escopo é o que
  // separa.
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { 'chest-press-inclinado-convergente': [{ t: t, sid: t, sets: [[55, 10], [55, 9]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 0 }]
  } });
  const st = el => a.doc.defaultView.getComputedStyle(el);

  a.v('go', 'A');
  a.v('toggle', 0);
  assert.strictEqual(st(a.$('.ex.open .setrow')).display, 'grid', 'no cartão é tabela');

  a.v('openHist', 0);
  a.clicar(a.$('.edbtn'));
  const linha = a.$('.ed-sets .setrow');
  assert.strictEqual(linha.children.length, 4, 'o formulário tem quatro células');
  assert.strictEqual(st(linha).display, 'flex', 'e continua em flex');
  assert.strictEqual(st(linha.querySelector('.unit')).position, 'absolute',
    'a unidade ali vive DENTRO do campo, flutuando na direita');
  a.fechar();
});

test('o RIR vazio não desenha fio: o ponto já ocupa o lugar', async () => {
  const a = await app();
  a.v('toggle', 0);
  const st = el => a.doc.defaultView.getComputedStyle(el);
  const rir = a.doc.getElementById('q0_0');
  assert.ok(rir.className.includes('vazio'));
  assert.strictEqual(st(rir).boxShadow, '', 'sem linha de escrita: não é campo de texto');
  // REESCRITO: a asserção dizia "os vizinhos continuam campos, e esses sim
  // precisam da linha" — e eles deixaram de ser campos. A régua trocou a
  // repetição por botão e o teclado próprio trocou a carga; a linha da série
  // inteira é de botões agora, e nenhum deles desenha fio de escrita.
  //
  // O contraste que o caso media mudou de lugar, não desapareceu: quem ainda é
  // campo é a MEDIDA de exercício cronometrado, e é lá que o fio tem sentido.
  ['w0_0', 'r0_0'].forEach(function (id) {
    const el = a.doc.getElementById(id);
    assert.strictEqual(el.tagName, 'BUTTON', id + ' deixou de ser campo');
    assert.strictEqual(st(el).boxShadow, '', id + ' não desenha fio de escrita');
  });
  a.fechar();
});

test('o cabeçalho da tabela cabe nas próprias colunas', async () => {
  // "série" em mono 9px com tracking não cabe na largura de um dígito, e
  // transbordava por cima de "anterior"
  const a = await app();
  a.v('toggle', 0);
  const st = el => a.doc.defaultView.getComputedStyle(el);
  const cols = st(a.$('.ex.open .sethead')).gridTemplateColumns;
  assert.strictEqual(cols, st(a.$('.ex.open .setrow')).gridTemplateColumns,
    'cabeçalho e linha compartilham a definição, e por isso não divergem');
  assert.match(cols, /^34px 96px/, 'a primeira coluna é dimensionada pelo rótulo');
  const rotulos = Array.from(a.$('.ex.open .sethead').children).map(x => x.textContent);
  assert.deepStrictEqual(rotulos, ['série', 'anterior', 'kg', 'reps', 'rir']);
  a.fechar();
});

test('a tabela usa a largura do cartão, sem recuo herdado', async () => {
  // O recuo de 34px alinhava as séries com o NOME do exercício, de quando isto
  // era lista. Virou tabela com coluna de número própria: manter os dois era
  // cobrar 34px de largura por um alinhamento que a coluna já faz.
  const a = await app();
  a.v('toggle', 0);
  const pad = a.doc.defaultView.getComputedStyle(a.$('.ex.open .sets')).paddingLeft;
  assert.ok(pad === '' || /^(0|0px|var\(--ins-)/.test(pad) === false || !/34/.test(pad),
    'sem recuo de 34px à esquerda: ' + pad);
  a.fechar();
});

test('o pior caso do "anterior" cabe sem cortar', async () => {
  // carga de três dígitos com decimal, repetições de dois e o RIR: é o mais
  // longo que a coluna precisa carregar
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { 'chest-press-inclinado-convergente': [{ t: t, sid: t, sets: [[127.5, 12, 2]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 0 }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  const txt = a.texto('.ex.open .setrow .setant');
  // ponto e não vírgula: é `fmtNum`, a mesma formatação de carga que a conta de
  // anilhas e os rótulos do gráfico usam no app inteiro
  assert.strictEqual(txt, '127.5 × 12 @ 2');
  // 14 caracteres em mono 11px ≈ 92px; a coluna tem 96
  assert.ok(txt.length * 6.6 < 96, 'largura estimada ' + Math.round(txt.length * 6.6) + 'px');
  a.fechar();
});

test('um asset servido do Storage não passa despercebido', () => {
  // O recorte da regra acima só vale se ele REJEITAR o que deve rejeitar.
  const passa = u => !nuvemDeDados(u);

  assert.ok(passa('https://x.supabase.co'), 'a origem do projeto passa');
  assert.ok(passa('https://x.supabase.co/rest/v1/estado'), 'o endpoint de dado passa');
  assert.ok(passa('https://x.supabase.co/auth/v1/token'), 'o de login também');
  assert.ok(!passa('https://x.supabase.co/storage/v1/object/public/ex/pulldown.avif'),
    'um asset do Storage tem que falhar: é asset buscado na rede, não dado');
  assert.ok(!passa('https://cdn.jsdelivr.net/qualquer.js'), 'e qualquer CDN também');
});

test('dia com dois treinos leva à lista, em vez de abrir um deles em silêncio', async () => {
  // Registrar o treino errado e depois o certo põe dois no mesmo dia. A célula
  // mostra as duas letras e abria só a última: a outra ficava inalcançável.
  const agora = agoraEstavel();
  const d = new Date(agora); d.setHours(8, 0, 0, 0);
  const tB = d.getTime(), tD = tB + 3 * 60 * 60000;
  // `plano` declarado: sem ele o harness entra como plano 2 e a migração
  // reindexa as fixtures, trocando a letra do treino que este teste lê
  const a = await app({ agora: agora, estado: {
    plano: 6, logs: {}, done: [
      { day: 'B', t: tB, sid: tB, dur: 40 * 60000, fim: 'manual' },
      { day: 'D', t: tD, sid: tD, dur: 90 * 60000, fim: 'manual' }
    ]
  }, aba: 'dias' });

  const cel = a.$('.cal-d.hoje');
  assert.ok(cel.textContent.includes('B') && cel.textContent.includes('D'),
    'a célula anuncia os dois: ' + cel.textContent.trim());

  a.clicar(cel);
  await a.esperar(60);
  assert.strictEqual(a.vista().sessao, null, 'não escolheu por ele');
  assert.strictEqual(a.$$('.sessrow.destacada').length, 2, 'apontou as duas linhas');

  // e cada linha abre a SUA
  a.clicar(a.$$('.sessrow.destacada')[1]);
  await a.esperar(60);
  assert.strictEqual(a.vista().sessao.day, 'B', 'a de baixo é o B, o mais cedo');
  a.fechar();
});

test('dia com um treino só continua abrindo direto', async () => {
  const agora = agoraEstavel();
  const d = new Date(agora); d.setHours(8, 0, 0, 0);
  const a = await app({ agora: agora, estado: {
    plano: 6, logs: {},
    done: [{ day: 'B', t: d.getTime(), sid: d.getTime(), dur: 40 * 60000, fim: 'manual' }]
  }, aba: 'dias' });

  a.clicar(a.$('.cal-d.hoje'));
  await a.esperar(60);
  assert.strictEqual(a.vista().sessao.day, 'B', 'sem escolha a fazer, abre logo');
  a.fechar();
});

test('abrir um exercício traz a série para a tela', async () => {
  // Medido no navegador, com a sessão correndo: a primeira linha de digitar
  // nascia em y=826 numa janela de 874 — atrás da tab bar, invisível. Abrir e
  // ROLAR eram duas ações, e a segunda caía sobre quem está de pé, com uma
  // mão, entre uma série e outra. Agora abrir já põe o cartão no topo.
  const a = await app();
  const rolou = [];
  a.window.Element.prototype.scrollIntoView = function (o) {
    rolou.push({ ex: this.getAttribute('data-ex'), bloco: o && o.block, como: o && o.behavior });
  };

  a.v('toggle', 0);
  assert.deepStrictEqual(rolou, [{ ex: '0', bloco: 'start', como: 'instant' }],
    'rola até o cartão que abriu, alinhando o topo dele');

  a.v('toggle', 0);
  assert.strictEqual(rolou.length, 1, 'fechar não rola: nada novo entrou na tela');

  a.v('toggle', 2);
  assert.strictEqual(rolou.length, 2, 'e cada abertura rola até o SEU cartão');
  assert.strictEqual(rolou[1].ex, '2');
  a.fechar();
});

test('o cartão de exercício tem endereço no DOM', async () => {
  // `data-ex` é como o casco alcança o cartão para rolar até ele. Sem o
  // atributo o `querySelector` volta null e o scroll vira silêncio — o modo de
  // falha exato que esta correção existe para tirar.
  const a = await app();
  const cartoes = a.$$('[data-ex]');
  assert.ok(cartoes.length >= 3, 'todo exercício da lista tem endereço');
  assert.deepStrictEqual(cartoes.slice(0, 3).map(e => e.getAttribute('data-ex')), ['0', '1', '2'],
    'e o endereço é a posição, que é o que o toggle conhece');
  a.fechar();
});

test('as regras de execução nascem fechadas e abrem uma por vez', async () => {
  // As catorze regras abertas somavam 4.428px — 64% do guia inteiro, cinco
  // telas de rolagem só delas. São material de REFERÊNCIA: lê-se uma vez e
  // depois se volta procurando UMA regra.
  const a = await app();
  a.aba('prescricao');
  await a.esperar();

  const regras = a.$$('.gu-regra');
  assert.ok(regras.length >= 10, 'as regras do treinador continuam todas na tela');
  assert.strictEqual(a.$$('.gu-regra .ins-lx-c').length, 0, 'nenhuma nasce aberta');

  // O título fica à vista: fechada, a lista É o índice das regras.
  const titulos = a.$$('.gu-regra-t').map(function (x) { return x.textContent.trim(); });
  assert.ok(titulos.every(function (t) { return t.length > 0; }), 'todo título visível');

  a.clicar(a.$$('.gu-regra .ins-lx-h')[1]);
  await a.esperar();
  assert.strictEqual(a.$$('.gu-regra .ins-lx-c').length, 1, 'abriu no lugar');

  a.clicar(a.$$('.gu-regra .ins-lx-h')[3]);
  await a.esperar();
  assert.strictEqual(a.$$('.gu-regra .ins-lx-c').length, 1,
    'abrir outra fecha a anterior: duas abertas devolvem a rolagem que a lista tirou');

  a.clicar(a.$$('.gu-regra .ins-lx-h')[3]);
  await a.esperar();
  assert.strictEqual(a.$$('.gu-regra .ins-lx-c').length, 0, 'e tocar de novo fecha');
  a.fechar();
});

test('a prescrição e a máquina do app são LUGARES diferentes', async () => {
  // Reescrito de propósito, e a propriedade ficou mais forte. O GUIA juntava
  // três naturezas sob um nome só — o que foi prescrito, a máquina do app e
  // atalhos para outros destinos — e a separação era por CHIP, dentro da mesma
  // tela. Agora é por lugar: Prescrição responde "o que foi prescrito, e o que
  // eu mudo?"; Ajustes não é lugar nenhum, é o botão do canto do Agora, e
  // "não possui nenhuma decisão de treino ou de comida" (§1.6).
  const a = await app();

  a.aba('prescricao');
  await a.esperar();
  assert.ok(a.$$('.gu-regra').length >= 10, 'as regras do treinador estão na prescrição');
  assert.ok(a.$$('.ins-label').some(function (x) { return x.textContent === 'alvo por tipo de dia'; }));
  // A máquina não fica no caminho de quem só queria conferir uma regra.
  assert.strictEqual(a.$('.gu-apagar'), null, 'apagar histórico não mora na prescrição');
  assert.strictEqual(a.$('#nvemail'), null, 'nem o login da nuvem');

  // A CADÊNCIA mudou de lado, e isto é decisão registrada: o GUIA a punha na
  // máquina do app com a razão "a cadência é AJUSTE, não referência". A frente
  // 1 a lista como posse de Prescrição, e a razão que vence é a pergunta — em
  // que dias costumo treinar é prescrição de rotina, e é contra ela que o
  // palpite do dia se calcula. Ela fica tocável, num chip próprio.
  await a.modo('semana');
  assert.strictEqual(a.$$('.gu-dia').length, 7, 'a semana inteira, na prescrição');
  assert.strictEqual(a.$$('.gu-regra').length, 0, 'e as regras não vazam para o chip dela');

  a.aba('ajustes');
  await a.esperar();
  assert.ok(a.$('.gu-apagar'), 'a máquina está toda nos Ajustes');
  assert.ok(a.$('#nvemail'));
  assert.strictEqual(a.$$('.gu-regra').length, 0, 'e a prescrição não vaza para cá');
  assert.strictEqual(a.$$('.gu-dia').length, 0, 'nem a cadência');
  a.fechar();
});

test('as portas do programa são três, e cada uma responde outra pergunta', async () => {
  // Reescrito. Ele dizia "a porta do programa some do GUIA, e as outras duas
  // ficam": `abrir o programa` existia em TREINO, DADOS e GUIA, e a do guia era
  // a terceira — a única embrulhada num parágrafo explicando o que ela faz.
  //
  // A reestruturação mudou o mapa. As três que existem agora não são
  // redundância: cada uma responde outra pergunta, e é por isso que elas podem
  // conviver.
  //
  //   PRESCRIÇÃO · "quero mexer no meu programa" — a porta do lugar que o POSSUI
  //                (§1.5), e a que faltava;
  //   a SESSÃO   · "preciso mudar isto agora, de pé" — contexto do treino;
  //   SEMANA     · "o volume saiu do alvo do treinador" — consequência de um
  //                número, e a porta leva ao lugar de consertar.
  const abre = a => a.$$('button').filter(function (b) {
    return /abrir o programa/.test(b.textContent);
  }).length;

  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  assert.strictEqual(abre(a), 1, 'a Prescrição tem a porta do dono');

  a.aba('ajustes');
  await a.esperar();
  assert.strictEqual(abre(a), 0, 'os Ajustes não: lá não há decisão de treino');

  a.aba('treino');
  await a.pintar();
  assert.strictEqual(abre(a), 1, 'a da sessão continua');
  a.fechar();
});

test('a retrospectiva mudou de casa e continua abrindo', async () => {
  // Era um botão órfão numa tela de referência; agora mora junto do resto do
  // que é olhar para trás.
  const a = await app();
  a.aba('prescricao');
  await a.esperar();
  assert.ok(!a.$$('button').some(function (b) { return /retrospectiva/.test(b.textContent); }),
    'saiu da referência');

  a.aba('semana');
  await a.modo('treino');
  const botao = a.$$('button').filter(function (b) {
    return /abrir retrospectiva/.test(b.textContent);
  })[0];
  assert.ok(botao, 'e está no dados, junto do que é olhar para trás');

  a.clicar(botao);
  await a.esperar();
  assert.ok(a.vista().retro, 'e abre de verdade');
  a.fechar();
});

test('a pegada aparece onde há decisão, e cala onde resumir seria pior', async () => {
  // O campo nasceu de duas revisões independentes cruzadas em
  // docs/pegada/00-parecer-cruzado.md. Vazio é estado de primeira classe: em
  // ~8 exercícios uma frase curta é verdadeira e inútil, e nesses o app cala.
  const a = await app();
  const linha = i => { const e = a.$(`[data-ex="${i}"] .peglinha`); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };

  a.E("view.day='A'; render(); toggle(2)");   // crucifixo inclinado no cabo
  await a.esperar();
  assert.match(linha(2), /^pegada /, 'onde a decisão é da mão, o rótulo é pegada');

  a.E("view.day='A'; view.open=null; render(); toggle(6)");  // extensão de tríceps acima da cabeça
  await a.esperar();
  assert.strictEqual(linha(6), null,
    'onde resumir seria pior que calar, não há linha nenhuma');

  a.E("view.day='A'; view.open=null; render(); toggle(1)");  // pulldown convergente
  await a.esperar();
  assert.strictEqual(linha(1), null,
    'e onde o treinador já falou de pegada na dica, a palavra dele vence');

  a.E("view.day='B'; view.open=null; render(); toggle(3)");  // leg press
  await a.esperar();
  assert.match(linha(3), /^pés /,
    'na perna a decisão é do pé, e o rótulo diz isso em vez de "pegada"');
  a.fechar();
});

// ===========================================================================
// As sete tabelas de ação, e as quatro leituras da shell
// ===========================================================================
//
// `acoesEx`, `acoesDia`, `acoesRapido`, `acoesAulas`, `acoesAdd`,
// `acoesPrograma` e `acoesProg` são as tabelas por onde CADA tela entrega o
// que ela sabe fazer. Nenhuma tinha caso próprio, e são o inventário mais
// fácil de encolher numa reescrita: a tela nova liga oito dos vinte e dois
// botões do cartão de exercício, ninguém conta, e as capacidades que sobraram
// não têm nada vermelho a mostrar.
//
// Cobrem o modelo, não a fiação: o caso afirma que a CAPACIDADE está no
// contrato, e explicitamente NÃO que a tela nova a ligou num botão.
//
// Duas coisas que o código ensinou aqui, e valem registro:
//
//  1. **`a.v` não alcança as tabelas.** `chama` parte o nome no PRIMEIRO
//     ponto, então `'ctx.acoesDia.subir'` procura a chave literal
//     `"acoesDia.subir"` em `CTX` e estoura. Entram por `a.m.ctx.acoes…`, que é
//     a porta por acesso direto — por nome e sem `eval` —, e o §4 do
//     09-superficie.md já a documenta com a ressalva de realm.
//  2. **`acoesEx.inp`/`obsIn` recebem elemento do DOM.** São as cascas do §2,
//     e os pares por valor delas (`anotaSerie`, `anotaObservacao`) já estão em
//     `verbos`. (`acoesRapido.inp` era a terceira, e saiu com o campo.) O caso confere que
//     o NOME está na tabela, não que ele seja verbo.

/** O inventário completo, por tabela — a lista é o que o caso protege. */
const TABELAS_DE_ACAO = {
  acoesEx: ['toggle', 'inp', 'startTimer', 'proximoDoBiset', 'setAlt', 'toggleSwap',
            'abrirSubstituicao', 'pularEx', 'openHist', 'toggleAq', 'abrirCarga', 'setCarga',
            'abrirMedida', 'setUnidade', 'setQ', 'abrirNota', 'obsIn', 'toggleDor', 'abreRir',
            'abreFoto', 'poeRir', 'usaAnterior',
            // A régua da frente 2: o campo de repetição virou botão, e são
            // estes os quatro toques possíveis nela.
            'abreRegua', 'andaRegua', 'poeRep', 'abreOutroValor',
            // O teclado próprio, que a porta "outro valor" abre.
            'tecla', 'fechaTeclado', 'abreTecladoDeCarga'],
  acoesDia: ['subir', 'descer', 'menos', 'mais', 'trocar', 'remover', 'escolheTroca',
             'fechaTroca', 'desfaz', 'pronto'],
  // `inp` saiu por decisão escrita: a lista rápida não tem mais campo — carga
  // e medida abrem o teclado próprio —, e o par por valor dela,
  // `anotaSerieRapida`, continua em `verbos`. As três que entraram são as do
  // teclado, e duas delas são as MESMAS de `acoesEx`.
  acoesRapido: ['abre', 'abreTeclado', 'tecla', 'fechaTeclado'],
  acoesAulas: ['abre', 'repete', 'aplica', 'salva', 'apaga', 'cola', 'importa'],
  acoesAdd: ['abre', 'fecha', 'busca', 'adiciona', 'abreNovo', 'cria'],
  acoesPrograma: ['volta', 'abreDia', 'modo', 'moveDia', 'criaTreino', 'restauraDia',
                  'restauraTudo'],
  acoesProg: ['subir', 'descer', 'menos', 'mais', 'trocar', 'remover', 'escolheTroca',
              'fechaTroca', 'reps', 'descanso']
};

test('as sete tabelas de ação entregam o inventário inteiro, e tudo nelas é chamável', async () => {
  const a = await app();

  Object.keys(TABELAS_DE_ACAO).forEach(function (tabela) {
    const t = a.m.ctx[tabela];
    assert.strictEqual(typeof t, 'object', tabela + ' é uma tabela de ações');
    assert.deepStrictEqual(Object.keys(t).sort(), TABELAS_DE_ACAO[tabela].slice().sort(),
      tabela + ': o inventário mudou. Acrescentar ação é livre — este caso só quer que ' +
      'TIRAR uma seja uma decisão escrita, e não um botão que a tela nova esqueceu de ligar.');
    Object.keys(t).forEach(function (k) {
      assert.strictEqual(typeof t[k], 'function', tabela + '.' + k + ' é chamável');
    });
  });

  // E a porta: nome com dois pontos não resolve, e o erro diz o nome.
  assert.throws(function () { a.v('ctx.acoesDia.subir', 0); }, /verbo fora da superfície/,
    '`a.v` parte o nome no primeiro ponto, então a tabela só entra por `a.m.ctx`');
  a.fechar();
});

test('acoesDia e acoesProg mexem em programas diferentes — o do dia e o oficial', async () => {
  // As duas tabelas têm oito nomes iguais, e é a diferença entre elas que é a
  // regra central do app: mexer no treino de HOJE não mexe no programa oficial.
  // Um redesenho que ligasse a tabela errada num botão passaria por toda a
  // suíte de hoje sem um vermelho.
  const a = await app();
  const idSaindo = a.k('A', 0);
  const nomeOficial = a.v('nomeEx', idSaindo);

  a.v('modoEdicao');
  a.m.ctx.acoesDia.remover(0);
  await a.esperar();

  assert.strictEqual(a.v('nomeEx', idSaindo), nomeOficial,
    'remover pela tabela do DIA não toca no catálogo: o exercício continua tendo nome');
  assert.ok(a.S().prog.A.ex.some(function (x) { return x.id === idSaindo; }),
    'nem no programa oficial: o exercício continua prescrito lá');
  assert.deepStrictEqual(a.vJ('modsDoDia', 'A'), [{ k: 'rm', slot: idSaindo }],
    'o que ela cria é uma MUDANÇA do dia, que a decisão do fim promove ou não');
  assert.ok(!a.vJ('treino', 'A').ex.some(function (x) { return x.id === idSaindo; }),
    'e o treino de HOJE, que é o projetado, já não o tem');
  a.fechar();
});

// ---------------------------------------------------------------------------
// As quatro leituras da shell
// ---------------------------------------------------------------------------

test('ctx.emTelaCheia diz quando um destino tomou a tela toda', async () => {
  // Quem pergunta é a shell, para esconder a tabbar: errar aqui é a barra de
  // abas aparecendo em cima da câmera, ou desaparecendo na tela de treino.
  const a = await app({ aba: 'agora' });
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'um LUGAR não é tela cheia');

  a.v('ctx.abrePrograma');
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'o programa é');
  a.v('ctx.fechaFolha');
  a.v('ctx.vaiPara', 'agora');
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'e sair devolve a shell');

  // E o MODO é tela cheia, o que mudou de propósito: a aba de treino virou
  // modo, e é esse o ponto — a sessão é o estado em que o resto sai da frente.
  a.aba('treino');
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'a sessão é tela cheia agora');
  a.v('ctx.fechaModoDeSessao');
  assert.strictEqual(a.v('ctx.emTelaCheia'), false, 'e fechar o modo devolve a shell');

  a.v('openHist', 0);
  assert.strictEqual(a.v('ctx.emTelaCheia'), true, 'o histórico de um exercício também é');
  a.fechar();
});

test('ctx.cabecalhoDeHoje nomeia o dia e o treino previsto, sem inventar', async () => {
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  const h = a.vJ('ctx.cabecalhoDeHoje');

  const d = new Date(agoraEstavel());
  assert.ok(h.olho.includes(String(d.getDate())), 'o olho traz o dia do mês: ' + h.olho);
  assert.strictEqual(h.olho, h.olho.toUpperCase(), 'em caixa alta, como a tela pede');
  assert.strictEqual(h.rotulo, 'previsto',
    'e o treino do dia é PREVISTO enquanto nada foi registrado — o app não afirma o que não mediu');
  assert.ok(a.dado('ROT_BASE').includes(h.valor), 'o valor é uma letra da rotação: ' + h.valor);
  a.fechar();
});

test('ctx.sessaoAberta devolve null sem sessão, e a duração enquanto há uma', async () => {
  const a = await app();
  assert.strictEqual(a.vJ('ctx.sessaoAberta'), null, 'sem sessão não há o que mostrar');

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();

  const s = a.vJ('ctx.sessaoAberta');
  assert.ok(s, 'a primeira série completa abre a sessão');
  assert.match(s.duracao, /^\d+ min$|^\d+:\d\d$/,
    'e a leitura traz a duração já formatada, nunca o instante cru: ' + s.duracao);
  assert.strictEqual(s.pausada, false, 'correndo');

  await a.v('pausarSessao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.sessaoAberta').pausada, true, 'pausar aparece aqui');
  await a.v('retomarSessao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.sessaoAberta').pausada, false, 'e retomar também');
  a.fechar();
});

test('ctx.ehLinhaDeTreino separa a linha de treino das de comida na timeline', async () => {
  // A timeline de HOJE mistura comida e treino em ordem de relógio. Esta é a
  // pergunta que decide qual cromo cada linha recebe — e ela é sobre o `id` da
  // linha, não sobre a letra do dia.
  const a = await app({ aba: 'agora' });
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'treino' }), true);
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'almoco' }), false);
  assert.strictEqual(a.v('ctx.ehLinhaDeTreino', { id: 'pre' }), false,
    'o pré-treino é refeição, e é o que mais se confunde com treino');
  a.fechar();
});

// ---------------------------------------------------------------------------
// `ctx.vaiParaDia` e `ctx.abreSessaoDoDia` — as duas portas da tira da semana
// ---------------------------------------------------------------------------
//
// Terceiro degrau do critério desta passada (quanto custa uma quebra em
// silêncio). As duas são os `onClick` da tira da semana em TREINO
// (`src/ui/telas/treino.jsx`), e `abreSessaoDoDia` é também o do calendário do
// mês em DADOS. Quebradas em silêncio, o histórico do dia fica inalcançável
// pelo toque — e a de duas sessões no mesmo dia já ficou inalcançável uma vez,
// por este mesmo caminho. Nenhuma das duas tinha menção em `tests/fluxo/`: a
// rede chegava nelas pelo clique no `.cal-d`, que o redesenho reescreve.
//
// O QUE ESTE GRUPO NÃO COBRE: que a tira ou o calendário tenham célula ligada
// nelas. Chamar o verbo prova que a capacidade existe no MODELO.

test('ctx.vaiParaDia troca o dia do treino e larga o que estava aberto nele', async () => {
  const a = await app();
  a.v('toggle', 0);
  assert.strictEqual(a.vista().open, 0, 'pré-condição: um exercício aberto');
  const antes = a.vista().day;

  a.v('ctx.vaiParaDia', 'E');
  await a.esperar();

  assert.strictEqual(a.vista().day, 'E', 'o dia é outro');
  assert.notStrictEqual(antes, 'E', 'e era outro antes — senão o caso não media nada');
  assert.strictEqual(a.vista().open, null,
    'e o cartão aberto fechou: ele era de um exercício do dia que saiu da tela');
  assert.strictEqual(a.vista().hist, null, 'o histórico aberto também');
  assert.strictEqual(a.vista().nota, null, 'e a anotação aberta');
  a.fechar();
});

test('ctx.abreSessaoDoDia despacha pelos três tipos de célula que a leitura dá', async () => {
  // A leitura `ctx.cromoDoTreino` monta o `abre` de cada célula da semana, e
  // este verbo é o que o consome. O caso pega o objeto da própria leitura em
  // vez de escrevê-lo à mão: o par é que importa, e um `k` que a leitura
  // deixasse de produzir passaria batido numa constante de teste.
  const agora = agoraEstavel();
  const d = new Date(agora); d.setHours(8, 0, 0, 0);
  const tB = d.getTime(), tD = tB + 3 * 60 * 60000;
  const a = await app({ agora: agora, estado: {
    plano: 6, logs: {}, done: [
      { day: 'B', t: tB, sid: tB, dur: 40 * 60000, fim: 'manual' },
      { day: 'D', t: tD, sid: tD, dur: 90 * 60000, fim: 'manual' }
    ]
  }, aba: 'treino' });

  const semana = a.vJ('ctx.cromoDoTreino').semana;
  const hoje = semana.filter(function (x) { return x.hoje; })[0];
  assert.strictEqual(hoje.abre.k, 'dia', 'hoje tem DUAS sessões, então a célula leva à lista');

  // (1) `k: 'dia'` — vai à lista do mês em DADOS, e NÃO escolhe uma das duas
  a.v('ctx.abreSessaoDoDia', hoje.abre);
  await a.esperar(60);
  assert.strictEqual(a.vista().aba, 'dias', 'é lá que existe lista de dia');
  assert.strictEqual(a.vista().mes, 0, 'no mês do dia tocado');
  assert.strictEqual(a.vista().sessao, null, 'e sem escolher nenhuma das duas por ele');
  assert.ok(a.vista().destacaDia, 'com o dia apontado na lista');

  // (2) `k: 'sessao'` — abre aquela sessão
  a.v('ctx.abreSessaoDoDia', { k: 'sessao', t: tB });
  await a.esperar(60);
  assert.strictEqual(a.vista().sessao.day, 'B', 'abriu a sessão daquele instante, e só ela');

  // (3) qualquer outro `k` cai no lançamento retroativo — é o `k: 'lancar'`
  // das células passadas e vazias
  a.v('ctx.fechaSessao');
  const vazia = semana.filter(function (x) { return x.abre && x.abre.k === 'lancar'; })[0];
  assert.ok(vazia, 'a semana tem alguma célula passada e vazia');
  a.v('ctx.abreSessaoDoDia', vazia.abre);
  await a.esperar(60);
  assert.ok(a.vista().add, 'abriu o lançamento retroativo');
  assert.strictEqual(a.vista().sessao, null, 'e fechou a sessão que estava na tela');
  a.fechar();
});

test('ctx.abreSessaoDoDia sem célula não abre nada', async () => {
  // Célula no FUTURO tem `abre: null` — lançar treino que ainda não aconteceu
  // não faz sentido. O verbo recebe esse `null` e tem de sair pela porta, em
  // vez de abrir o lançamento retroativo num dia que ainda não chegou.
  // Quarta-feira às 8h, para a semana ter sempre dia futuro E dia passado —
  // num sábado não haveria futuro, e a asserção viraria condicional.
  const quarta = inicioDaSemana(Date.now()) + 3 * DIA + 8 * 3600000;
  const a = await app({ agora: quarta, aba: 'treino' });
  const semana = a.vJ('ctx.cromoDoTreino').semana;
  const futuras = semana.filter(function (x) { return x.futuro; });
  assert.strictEqual(futuras.length, 3, 'quinta, sexta e sábado estão no futuro');
  assert.strictEqual(futuras[0].abre, null, 'e a leitura não dá ação para o futuro');

  const lugarAntes = a.vista().aba;
  a.v('ctx.abreSessaoDoDia', null);
  await a.esperar(60);
  assert.strictEqual(a.vista().add, null, 'nada de lançamento retroativo');
  assert.strictEqual(a.vista().sessao, null, 'nada de sessão aberta');
  assert.strictEqual(a.vista().aba, lugarAntes, 'e nem trocou de lugar');
  assert.strictEqual(a.vista().modoSessao, true, 'nem fechou o modo por onde ele entrou');
  a.fechar();
});

test('todo aviso que para o dedo diz o que acontece, e diz na primeira palavra', () => {
  // A decisão 13 trocou o significado do terceiro sinal de "destrói dado" para
  // "pare". Com isso a gravação que falhou e a ação que vai destruir passaram a
  // usar o MESMO painel, com a mesma moldura — e **o que as distingue é a
  // palavra**. A cor deixou de dizer o que dizia, e a palavra ainda não tinha
  // assumido: este caso é o que impede a lacuna de voltar.
  //
  // De relance ninguém lê a frase inteira: lê-se a PRIMEIRA PALAVRA e o botão.
  // Daí as duas regras mecânicas que este caso cobra, as duas da frente 3 §3.1.
  const avisos = [];
  const re = /\bconfirm\(\s*([\s\S]{0,40})/g;
  let m;
  while ((m = re.exec(FONTE))) avisos.push(m[1]);
  assert.ok(avisos.length > 15, 'o varredor achou avisos: ' + avisos.length);

  // G3 · a primeira palavra é a única que se lê de relance, e ela tem de ser o
  // VERBO do que vai acontecer. A regra é morfológica em vez de uma lista de
  // verbos autorizados, e por isso se mantém sozinha: infinitivo em português
  // termina em -ar, -er ou -ir.
  //
  // E a regra fica SIMPLES de propósito: o primeiro argumento do aviso abre com
  // literal, e a primeira palavra dele é o verbo. Houve uma versão deste caso
  // que resolvia uma indireção, para aceitar um aviso que abria por um `const`
  // montado de literais — e ela foi jogada fora. Teste esperto o bastante para
  // entender código esperto é o caminho errado: o código mudou para abrir com
  // literal, e o verbo passou a ficar legível no ponto onde o aviso é dado.
  const INFINITIVO = /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:ar|er|ir)\b/;

  const semVerbo = avisos
    .map(a => ({ a, lit: (a.trim().match(/^['"`]([^'"`]{2,})/) || [])[1] }))
    .filter(x => !x.lit || !INFINITIVO.test(x.lit))
    .map(x => x.a.trim().slice(0, 46));
  assert.deepStrictEqual(semVerbo, [],
    'aviso cuja primeira palavra não é o verbo do que vai acontecer: de ' +
    'relance quem lê não sabe o que o toque faz — abra pelo infinitivo e ponha ' +
    'o resto depois');

  // E a lista do que nunca se escreve, da frente 3 §3.1: rótulo que não diz o
  // que acontece ao tocar, e pergunta que empurra a decisão sem nomear o
  // estrago.
  const proibidas = ['Tem certeza', 'Continuar?', 'Atenção!', 'Erro inesperado',
    'Ops', 'Confirmar?'];
  const usadas = proibidas.filter(p => new RegExp(p.replace('?', '\\?')).test(FONTE));
  assert.deepStrictEqual(usadas, [],
    'frase que a voz do produto recusa: ela não diz o que acontece ao tocar');

  // O PAINEL DE PARE, e é a "regra de uma linha" da frente 3 (§3.4): a ação que
  // apaga sem volta pede pelo painel, e a frase E O BOTÃO abrem pelo verbo do
  // estrago. Nenhum botão de pare se chama "OK", "Confirmar", "Sim" ou
  // "Cancelar" — é a asserção que impede as duas famílias de voltarem a se
  // parecer, e o diálogo do sistema não consegue cumpri-la.
  const pedidos = [...FONTE.matchAll(/\{\s*texto:\s*'([^']*)'[^{}]*?sim:\s*'([^']*)'/g)];
  assert.ok(pedidos.length >= 1, 'o varredor achou pedidos de pare: ' + pedidos.length);
  const tortos = pedidos
    .filter(p => !INFINITIVO.test(p[1]) || !INFINITIVO.test(p[2]) || /^(OK|Confirmar|Sim|Cancelar)\b/.test(p[2]))
    .map(p => p[1].slice(0, 30) + ' / ' + p[2]);
  assert.deepStrictEqual(tortos, [],
    'pedido de pare cuja frase ou cujo botão não abre pelo verbo do que vai acontecer');
  const painel = (FONTE.match(/export function Pare\b[\s\S]*?\n\}/) || [''])[0];
  assert.ok(/Deixar como está/.test(painel), 'a saída do painel é "Deixar como está"');
  assert.ok(!/>\s*(Cancelar|OK|Sim)\s*</.test(painel), 'e nunca "Cancelar", "OK" ou "Sim"');
});

test('botão que mostra só um símbolo tem nome acessível', () => {
  // Já havia guarda para isto, e ela cobria UM cartão (`serie.test.js` :: todo
  // controle do cartão de exercício tem nome acessível). O app inteiro não
  // tinha: um `···` ou um `×` novo em qualquer outra tela nasceria sem nome, e
  // quem usa leitor de tela ouviria "botão" — sem nada que diga o que ele faz.
  //
  // Hoje os que existem têm `aria-label`. Este caso é o que mantém isso verdade
  // quando nascer o próximo.
  //
  // REESCRITO, e o motivo é que a versão anterior ENVELHECEU em silêncio. Ela
  // enumerava os símbolos conhecidos — `· • × ✕ ✓ + − …` — e eu acrescentei dois
  // que não estavam na lista: o `⚙` dos Ajustes e o `‹` da saída do modo. Os
  // dois têm rótulo, mas a guarda não saberia se não tivessem: uma lista de
  // símbolos é um inventário, e inventário é o que fica velho.
  //
  // A pergunta certa é a inversa e não envelhece: o conteúdo visível tem alguma
  // LETRA OU DÍGITO? Se não tem, não há nome a tirar dele, e o botão precisa de
  // `aria-label` qualquer que seja o símbolo — inclusive um que ninguém ainda
  // inventou.
  //
  // LIMITE DECLARADO: isto é leitura de FONTE. Um botão cujo corpo é uma
  // expressão (`{x.t}`) tem letras no código e passa por "tem texto", mesmo que
  // o valor em tempo de execução seja um símbolo. Casos de DOM cobrem os que
  // importam um a um; este cobre a classe.
  const TEM_PALAVRA = /[\p{L}\p{N}]/u;
  const sem = [];
  const re = /<button\b([^>]*)>([\s\S]{0,60}?)<\/button>/g;
  let m;
  while ((m = re.exec(FONTE))) {
    const [, attrs, corpo] = m;
    if (TEM_PALAVRA.test(corpo)) continue;           // tem texto: o texto é o nome
    if (!corpo.trim()) continue;                     // vazio: não é botão de símbolo
    if (/aria-label|aria-labelledby/.test(attrs)) continue;
    sem.push((corpo.trim() || '(vazio)') + '  ←  ' + attrs.trim().slice(0, 50));
  }
  assert.deepStrictEqual(sem, [],
    'botão cujo conteúdo visível é só símbolo e que não tem nome acessível: ' +
    'quem usa leitor de tela ouve "botão" e nada mais');
});

// ---------------------------------------------------------------------------
// O DELOAD mudou de lugar, e o freio virou a palavra
// ---------------------------------------------------------------------------
//
// Decisão 6 do dono: o interruptor sai de Ajustes e vai para o menu `···` da
// sessão. O argumento que caiu era bom e fica escrito, porque é o que ninguém
// pode esquecer ao implementar — "um interruptor que corta metade das séries não
// deve estar a um toque no meio de uma sessão. O app existe em parte para frear,
// e o caminho de menor esforço tem que ser o conservador".
//
// O LUGAR era o freio. Ele decidiu mover sabendo disso — foi perguntado duas
// vezes na mesma noite e manteve, depois de o cartão ser corrigido. Então o
// freio passa do lugar para a PALAVRA, e é isso que estes casos cobram.

test('o menu ··· da sessão diz o corte em NÚMERO antes do toque', async () => {
  const a = await app();
  assert.ok(a.vista().modoSessao, 'pré-condição: dentro do modo');
  const mais = a.$('[data-a="menu-sessao"]');
  assert.ok(mais, 'o ··· está no cabeçalho do modo');
  assert.ok(mais.getAttribute('aria-label'), 'com nome acessível: três pontos não é nome');

  mais.click();
  await a.esperar(60);

  const item = a.$('[data-a="deload"]');
  assert.ok(item, 'o deload é o item do menu');
  const txt = item.textContent;
  assert.ok(/Deload hoje/.test(txt), txt);
  // Os números são do DADO e não de exemplo: o prescrito do dia e a conta do
  // deload, calculados na hora de abrir.
  assert.match(txt, /corta \d+ séries para \d+, nas mesmas cargas/,
    'diz o corte em número, antes do toque: ' + txt);

  // E NUNCA um interruptor com o nome sozinho — é a linha "nunca" da tabela da
  // frente 3. Sem o número, o freio não existe em lugar nenhum.
  assert.ok(!/[Aa]tivar deload/.test(txt), 'não é "ativar deload": ' + txt);
  a.fechar();
});

test('os números do corte são os do dia, conferidos à mão', async () => {
  // Conferência independente: soma o prescrito do dia sem passar pela leitura
  // que está sob teste. Se a conta do deload mudar, o caso diz.
  const a = await app();
  const ex = a.vJ('treino', a.vista().day).ex;
  const cheio = ex.reduce(function (n, x) { return n + x.s; }, 0);
  const cortado = ex.reduce(function (n, x) { return n + Math.ceil(x.s / 2); }, 0);
  assert.ok(cheio > cortado, 'pré-condição: o deload corta mesmo (' + cheio + ' → ' + cortado + ')');

  const m = a.vJ('ctx.menuDaSessao');
  assert.strictEqual(m.deload.detalhe,
    'corta ' + cheio + ' séries para ' + cortado + ', nas mesmas cargas');
  a.fechar();
});

test('com o deload ligado, a palavra diz o que o toque DEVOLVE', async () => {
  // A segunda metade, e é a que impede o susto: desligar no meio devolve as
  // séries, e o que já foi registrado fica. A frase tem de dizer quanto volta.
  const a = await app({ estado: { logs: {}, done: [], deload: true } });
  const ex = a.vJ('treino', a.vista().day).ex;
  const devolve = ex.reduce(function (n, x) { return n + x.s - Math.ceil(x.s / 2); }, 0);

  const m = a.vJ('ctx.menuDaSessao');
  assert.strictEqual(m.deload.ligado, true);
  assert.strictEqual(m.deload.rotulo, 'Sair do deload');
  assert.match(m.deload.detalhe,
    new RegExp('devolve ' + devolve + ' séries ao Treino ' + a.vista().day + ' de hoje'),
    m.deload.detalhe);
  a.fechar();
});

test('tocar no item liga o deload e fecha o menu', async () => {
  const a = await app();
  assert.strictEqual(a.S().deload, false, 'pré-condição: desligado');

  a.clicar('[data-a="menu-sessao"]');
  await a.esperar(60);
  a.clicar('[data-a="deload"]');
  await a.esperar(60);

  assert.strictEqual(a.S().deload, true, 'ligou');
  assert.strictEqual(a.$('.ins-folha'), null, 'e o menu fechou: fim de tarefa');
  a.fechar();
});

test('o INTERRUPTOR do deload não está mais em Prescrição nem em Ajustes', async () => {
  // A outra metade da mudança de lugar: deixá-lo em dois lugares seria duas
  // portas para o mesmo interruptor, e uma delas sem o freio da palavra.
  //
  // A busca é pelo BOTÃO que liga, e não pela palavra "deload" — e a diferença
  // me custou um vermelho: uma das catorze regras do treinador se chama "Deload
  // por evidência, não por calendário", e ela é REFERÊNCIA, que é posse de
  // Prescrição. Procurar a palavra confundia a regra com o interruptor.
  const liga = x => x.$$('button').filter(function (b) {
    return /deload/i.test(b.textContent) && !/por evidência/i.test(b.textContent);
  });

  const a = await app({ aba: 'prescricao' });
  await a.esperar();
  for (const chip of ['programa', 'comida', 'alimentos', 'semana']) {
    await a.modo(chip);
    assert.deepStrictEqual(liga(a).map(function (b) { return b.textContent.trim(); }), [],
      'nenhum botão de deload no chip ' + chip + ' da Prescrição');
  }

  a.aba('ajustes');
  await a.esperar();
  assert.deepStrictEqual(liga(a).map(function (b) { return b.textContent.trim(); }), [],
    'nem nos Ajustes, de onde ele saiu');

  // E a regra do treinador CONTINUA onde deve: ela é referência, não botão.
  a.aba('prescricao');
  await a.modo('programa');
  assert.ok(/[Dd]eload por evidência/.test(a.doc.getElementById('app').textContent),
    'a regra do treinador sobre deload continua na Prescrição');
  a.fechar();
});

test('o ciclo saiu do cabeçalho da sessão e mora em Semana, ao lado da retrospectiva', async () => {
  // Achado 7 da frente 1: o ciclo responde "em que ponto do bloco eu estou",
  // que é a mesma pergunta que a retrospectiva responde em prosa. No cabeçalho
  // do treino ele era a terceira célula de uma linha que se lê de pé, no meio
  // de uma série — e nenhum dos nove HTML das direções o desenhou em lugar
  // nenhum.
  const a = await app();
  assert.ok(a.vista().modoSessao, 'pré-condição: dentro do modo');
  const celulas = a.$$('.ins-grade-c').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(!/ciclo/i.test(celulas), 'o ciclo não está no cabeçalho da sessão: ' + celulas);
  // E o VOLUME fica: durante a sessão ele é devolutiva ao vivo do que entrou, e
  // não resumo do dia — a cópia que Dias guarda no detalhe é o registro.
  assert.ok(/volume/i.test(celulas), 'o volume continua, que é outra natureza: ' + celulas);

  a.aba('semana');
  await a.esperar();
  await a.modo('treino');
  const naSemana = a.$$('.ins-grade-c').map(function (x) { return x.textContent; }).join(' | ');
  assert.ok(/ciclo/i.test(naSemana), 'e está em Semana: ' + naSemana);
  a.fechar();
});

test('o ciclo conta VOLTAS DA ROTAÇÃO, não semanas', async () => {
  // Conferência independente: a conta é `sessões / tamanho da rotação`, e o
  // tamanho é o da rotação DELE. Contar em semanas daria o número errado toda
  // vez que ele treinasse mais ou menos que a rotação pede.
  const seis = [];
  for (let k = 0; k < 6; k++) {
    const t = Date.now() - (6 - k) * DIA;
    seis.push({ day: 'ABCDE'[k] || 'HX', t: t, sid: t, dur: 60 * 60000 });
  }
  const a = await app({ aba: 'semana', estado: { logs: {}, done: seis } });
  await a.esperar();

  const c = a.vJ('ctx.cicloDoBloco');
  assert.strictEqual(c.sessoes, 6);
  assert.strictEqual(c.treinos, 6, 'a rotação base tem seis: A, B, C, D, E e HX');
  assert.strictEqual(c.ciclo, '2', 'uma volta inteira fechada: ele está no segundo ciclo');
  a.fechar();
});
