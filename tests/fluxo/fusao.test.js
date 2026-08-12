// A fusão, de ponta a ponta: um estado antigo abre migrado e íntegro.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('estado migra para o plano 4 e a nutrição nasce semeada', async () => {
  const a = await app();
  assert.deepStrictEqual(a.erros, []);
  assert.strictEqual(a.E('S.plano'), 5);
  assert.strictEqual(a.E('S.comida.plano.length'), 6, 'plano nutricional semeado');
  assert.strictEqual(a.J('S.cadencia').length, 7, 'cadência da semana nasce com 7 posições');
  assert.strictEqual(a.E('S.ajuste'), 0);
  assert.strictEqual(a.E('S.perfManual'), null, 'o app calcula a força até ele dizer o contrário');
  assert.ok(a.$$('.ex').length > 0, 'a tela de treino continua montando');
  a.fechar();
});

test('o backup leva a metade de comida e devolve ela igual', async () => {
  // Sem isto, trocar de celular perderia o plano nutricional, a cadência e o
  // ajuste em vigor — e a importação é whitelist, então campo novo só passa se
  // alguém lembrar de listar. Este teste é o "alguém lembrar".
  const a = await app();
  a.E('S.ajuste = 1');
  a.E('S.perfManual = false');
  a.E('S.cadencia = ["treino","treino","descanso","treino","treino","descanso","treino"]');
  a.E('S.comida.plano[0].itens[0].q = 321');
  a.E('S.compras.dias = 30');

  a.E('tab("ajustes")');
  a.E('showJSON()');
  const json = a.doc.getElementById('jout').value;
  const bkp = JSON.parse(json);
  assert.strictEqual(bkp.data.ajuste, 1);
  assert.strictEqual(bkp.data.perfManual, false);
  assert.strictEqual(bkp.data.cadencia[2], 'descanso');
  assert.strictEqual(bkp.data.comida.plano[0].itens[0].q, 321);
  a.fechar();

  const b = await app({ estado: bkp.data });
  assert.strictEqual(b.E('S.ajuste'), 1, 'o ajuste sobreviveu à volta');
  assert.strictEqual(b.E('S.perfManual'), false);
  assert.strictEqual(b.J('S.cadencia')[2], 'descanso');
  assert.strictEqual(b.E('S.comida.plano[0].itens[0].q'), 321, 'o plano editado voltou igual');
  assert.strictEqual(b.E('S.compras.dias'), 30);
  b.fechar();
});

test('backup antigo, sem a metade de comida, abre semeado em vez de vazio', async () => {
  const a = await app({ estado: {
    plano: 3, logs: {}, done: [], prog: null, rot: null, ex: {}
  } });
  assert.strictEqual(a.E('S.comida.plano.length'), 6, 'a nutrição nasce da prescrição');
  assert.strictEqual(a.J('S.cadencia').length, 7);
  assert.strictEqual(a.E('S.ajuste'), 0, 'sem ajuste herdado de lugar nenhum');
  a.fechar();
});

test('HOJE mostra comida e treino na MESMA timeline, em ordem de relógio', async () => {
  // É o argumento inteiro da fusão: o pré-treino das 5h45 e a sessão das 6h15
  // são uma sequência só. Em eixos separados, pareciam dois apps.
  const a = await app({ aba: 'hoje' });
  const linhas = a.$$('.ins-tl');
  assert.ok(linhas.length >= 5, 'as refeições do dia estão na tela: ' + linhas.length);

  const horas = linhas.map(l => l.querySelector('.ins-tl-hora').textContent);
  assert.deepStrictEqual(horas, horas.slice().sort(), 'ordenadas por relógio');

  const nomes = linhas.map(l => l.querySelector('.ins-tl-nome').textContent);
  assert.ok(nomes.some(n => /pré-treino/i.test(n)), 'a refeição está lá: ' + nomes.join(' · '));
  assert.ok(nomes.some(n => /peito|dorsais|quadríceps|espessura|deltoides|posterior/i.test(n)),
    'e o treino está na mesma lista, pelo nome da sessão: ' + nomes.join(' · '));
  a.fechar();
});

test('o cartão-foco responde "e agora?" antes de qualquer resumo', async () => {
  const a = await app({ aba: 'hoje' });
  const foco = a.$('.ins-foco');
  assert.ok(foco, 'o foco é a primeira coisa da tela');
  assert.ok(a.$('.ins-live-dot'), 'com o ponto ao vivo');
  assert.ok(/agora · \d\d:\d\d/.test(a.texto('.ins-foco .ins-label')), a.texto('.ins-foco .ins-label'));

  // o bloco de energia vem DEPOIS do foco, nunca antes
  const html = a.doc.getElementById('app').innerHTML;
  assert.ok(html.indexOf('ins-foco') < html.indexOf('ins-hero'), 'resumo não pode vir antes da próxima ação');
  a.fechar();
});

test('marcar uma refeição soma no registrado e persiste', async () => {
  const a = await app({ aba: 'hoje' });
  const antes = a.texto('.ins-metric-xl');
  a.clicar('.ins-tl .ins-caixa');
  await a.esperar();
  assert.notStrictEqual(a.texto('.ins-metric-xl'), antes, 'o kcal registrado subiu');
  assert.ok(Object.keys(a.J('S.dia.done')).length === 1, 'ficou gravado no dia');
  // o salvamento é debounced em 700 ms: sem esperar, o disco ainda está vazio
  await a.esperar(800);
  assert.strictEqual(a.gravado().dia.data, a.E('S.dia.data'), 'e foi para o disco carimbado com a data');
  a.fechar();
});

test('a água sobe e desce no toque', async () => {
  const a = await app({ aba: 'hoje' });
  const ticks = a.$$('.ins-tick');
  assert.strictEqual(ticks.length, 14, '14 copos de 250 ml');
  a.clicar(ticks[2]);
  await a.esperar();
  assert.strictEqual(a.E('S.dia.agua'), 3);
  // tocar na última cheia remove ela: é o desfazer sem botão de desfazer
  a.clicar(a.$$('.ins-tick')[2]);
  await a.esperar();
  assert.strictEqual(a.E('S.dia.agua'), 2);
  a.fechar();
});

test('abrir uma refeição mostra o que tem dentro e o ajuste só de hoje', async () => {
  const a = await app({ aba: 'hoje' });
  a.clicar('.ins-tl .ins-tl-toque');
  // efeito do Preact roda depois do paint; 20 ms não bastam no jsdom
  await a.esperar(150);
  const folha = a.$('.ins-folha');
  assert.ok(folha, 'a folha abriu');
  assert.ok(a.texto('.ins-folha').toLowerCase().includes('só de hoje'),
    'o rótulo diz que ajustar porção não muda o plano');
  assert.ok(a.$$('.ins-folha .ins-linha').length > 0, 'lista os itens');

  // e o corpo fica travado enquanto ela está aberta
  assert.ok(a.doc.body.className.includes('ins-travado'), 'no iOS é a única trava que segura');
  a.E('CTX.fechaFolha()');
  await a.esperar(150);
  assert.ok(!a.doc.body.className.includes('ins-travado'), 'e destrava ao fechar');
  a.fechar();
});

test('o dia previsto se identifica como previsão, e confirmar muda o alvo', async () => {
  const a = await app({ aba: 'hoje' });
  const previsto = a.E('CTX.hoje().diaHoje.previsto');
  if (previsto) {
    assert.ok(a.texto('.ins-secao-nota') || a.texto('.ins-provenance'),
      'a tela avisa que o dia é palpite');
  }
  const alvoAntes = a.E('Math.round(CTX.hoje().alvo.kcal)');
  a.E('CTX.setCadenciaDeHoje("descanso")');
  await a.esperar();
  const alvoDepois = a.E('Math.round(CTX.hoje().alvo.kcal)');
  assert.ok(alvoDepois < alvoAntes, 'sem treino saem o pré e o intra: ' + alvoAntes + ' → ' + alvoDepois);
  assert.strictEqual(a.E('CTX.hoje().diaHoje.previsto'), false, 'ele disse, então não é mais palpite');
  a.fechar();
});

test('o dia de comida zera sozinho na virada da data', async () => {
  const ontem = new Date(Date.now() - DIA);
  const iso = ontem.getFullYear() + '-' + String(ontem.getMonth() + 1).padStart(2, '0') + '-' +
              String(ontem.getDate()).padStart(2, '0');
  const a = await app({ aba: 'hoje', estado: {
    logs: {}, done: [],
    dia: { data: iso, done: { almoco: 1 }, agua: 9, escala: {} }
  } });
  assert.deepStrictEqual(a.J('S.dia.done'), {}, 'marcação de ontem não conta hoje');
  assert.strictEqual(a.E('S.dia.agua'), 0);
  a.fechar();
});

test('apagar o histórico não apaga o plano nutricional', async () => {
  // Simetria com o programa de treino: apagar o que foi REGISTRADO nunca apaga
  // o que foi PRESCRITO. Já quebrou uma vez, deixando a nutrição sem catálogo.
  const a = await app({ aba: 'guia' });
  a.E('S.comida.plano[0].itens[0].q = 777');
  a.E('S.cadencia = ["treino","treino","treino","treino","treino","treino","treino"]');
  a.aceitar();
  await a.E('wipe()');
  await a.esperar();

  assert.strictEqual(a.E('S.done.length'), 0, 'o histórico foi');
  assert.strictEqual(a.E('S.comida.plano[0].itens[0].q'), 777, 'o plano editado ficou');
  assert.strictEqual(a.J('S.cadencia')[0], 'treino', 'a cadência ficou');
  assert.ok(a.E('S.comida.plano.length') === 6);
  a.fechar();
});

test('a cadência da semana é editável e só fala de cadência', async () => {
  const a = await app({ aba: 'guia' });
  const dias = a.$$('.gu-dia');
  assert.strictEqual(dias.length, 7);

  const antes = a.J('S.cadencia').slice();
  a.clicar(dias[0]);            // segunda, que é o índice 1 da cadência
  await a.esperar();
  assert.notStrictEqual(a.J('S.cadencia')[1], antes[1], 'alternou');

  // e não guarda letra de treino: qual sessão vem é sempre da rotação
  a.J('S.cadencia').forEach(function (c) {
    assert.ok(c === 'treino' || c === 'descanso', 'cadência guardou letra: ' + c);
  });
  a.fechar();
});

test('o alvo calórico sai do plano, não de um número escrito à parte', async () => {
  const a = await app({ aba: 'guia' });
  const antes = a.texto('.ins-linha-v');
  a.E('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens[0].q += 500');
  a.E('render()');
  assert.notStrictEqual(a.texto('.ins-linha-v'), antes, 'mexer no plano recalcula o alvo na hora');
  a.fechar();
});

test('a unidade é rótulo fixo; o placeholder é a carga da última vez', () => {
  // Antes os dois diziam a mesma coisa quando não havia histórico: o campo
  // mostrava "kg" com um "KG" grudado à direita. Unidade é estrutura e fica
  // sempre; placeholder é dado e só aparece quando existe dado.
  return app().then(async a => {
    a.E('toggle(0)');
    const unidades = a.$$('.ex.open .setrow .unit').map(u => u.textContent);
    assert.ok(unidades.includes('kg'), 'a carga declara a unidade: ' + unidades.join(','));
    assert.ok(unidades.includes('reps'), 'a repetição também: ' + unidades.join(','));
    assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '', 'sem histórico, sem placeholder');

    a.preencher(0, 0, 55, 8);
    a.E('S.sessao = null');
    a.E('render()');
    assert.strictEqual(a.doc.getElementById('w0_0').placeholder, '55',
      'com histórico, o placeholder é a carga da última vez');
    a.fechar();
  });
});

test('o placeholder de carregamento some quando o app monta', async () => {
  // O Preact não remove filhos pré-existentes do container no primeiro render:
  // ele não tem árvore antiga para comparar e só insere a dele. O "Carregando
  // seu histórico…" ficava no topo da tela para sempre, e resíduo de troca de
  // módulo pelo HMR ficava junto.
  const a = await app({ aba: 'hoje' });
  const app_ = a.doc.getElementById('app');
  assert.strictEqual(app_.querySelector('.msg'), null, 'placeholder ficou na tela');
  assert.ok(!app_.textContent.includes('Carregando'), app_.textContent.slice(0, 80));
  assert.ok(!/undefined/.test(app_.textContent), 'texto "undefined" vazou para a tela');

  // e sobrevive a re-render: limpar só pode acontecer no primeiro mount
  a.E('render()');
  assert.ok(a.$('.ins-cab'), 'o cabeçalho continua depois de re-renderizar');
  assert.ok(a.$$('.ins-tab').length === 5);
  a.fechar();
});
