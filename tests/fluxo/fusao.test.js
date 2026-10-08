// A fusão, de ponta a ponta: um estado antigo abre migrado e íntegro.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

test('estado migra para o plano 4 e a nutrição nasce semeada', async () => {
  const a = await app();
  assert.deepStrictEqual(a.erros, []);
  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'));
  assert.strictEqual(a.S().comida.plano.length, a.dado('PLANO_BASE').length, 'plano nutricional semeado');
  assert.strictEqual(a.S().cadencia.length, 7, 'cadência da semana nasce com 7 posições');
  assert.strictEqual(a.S().ajuste, 0);
  assert.strictEqual(a.S().perfManual, null, 'o app calcula a força até ele dizer o contrário');
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

  a.aba('guia');
  await a.modo('o app');
  a.v('showJSON');
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
  assert.strictEqual(a.S().comida.plano.length, a.dado('PLANO_BASE').length, 'a nutrição nasce da prescrição');
  assert.strictEqual(a.S().cadencia.length, 7);
  assert.strictEqual(a.S().ajuste, 0, 'sem ajuste herdado de lugar nenhum');
  a.fechar();
});

test('HOJE mostra comida e treino na MESMA timeline, em ordem de relógio', async () => {
  // É o argumento inteiro da fusão: o pré-treino das 5h45 e a sessão das 6h15
  // são uma sequência só. Em eixos separados, pareciam dois apps.
  //
  // A cadência vem semeada treinando em todos os sete dias: a padrão descansa
  // domingo (`CADENCIA_PADRAO`, índice 0), e no domingo esta tela não tem linha
  // de treino nenhuma — o teste passava seis dias por semana e quebrava no
  // sétimo. Quem afirma "treino e comida na mesma lista" semeia o treino.
  const a = await app({ aba: 'hoje', estado: { cadencia: ['treino','treino','treino','treino','treino','treino','treino'] } });
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
  assert.ok(Object.keys(a.S().dia.done).length === 1, 'ficou gravado no dia');
  // o salvamento é debounced em 700 ms: sem esperar, o disco ainda está vazio
  await a.esperar(800);
  assert.strictEqual(a.gravado().dia.data, a.S().dia.data, 'e foi para o disco carimbado com a data');
  a.fechar();
});

test('a água sobe e desce no toque', async () => {
  const a = await app({ aba: 'hoje' });
  const ticks = a.$$('.ins-tick');
  assert.strictEqual(ticks.length, 14, '14 copos de 250 ml');
  a.clicar(ticks[2]);
  await a.esperar();
  assert.strictEqual(a.S().dia.agua, 3);
  assert.strictEqual(a.texto('.ins-ticks-l'), '250 ml por toque0,75 / 3,5 l',
    'o rótulo diz quanto já foi, não só quanto é a meta');
  // tocar na última cheia remove ela: é o desfazer sem botão de desfazer
  a.clicar(a.$$('.ins-tick')[2]);
  await a.esperar();
  assert.strictEqual(a.S().dia.agua, 2);
  assert.strictEqual(a.texto('.ins-ticks-l'), '250 ml por toque0,5 / 3,5 l');
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
  a.v('ctx.fechaFolha');
  await a.esperar(150);
  assert.ok(!a.doc.body.className.includes('ins-travado'), 'e destrava ao fechar');
  a.fechar();
});

test('o dia previsto se identifica como previsão, e confirmar muda o alvo', async () => {
  // Mesma semeadura da timeline, pelo mesmo motivo: o teste tira o treino do dia
  // e cobra que o alvo caia. No domingo não há treino para tirar.
  const a = await app({ aba: 'hoje', estado: { cadencia: ['treino','treino','treino','treino','treino','treino','treino'] } });
  const previsto = a.vJ('ctx.hoje').diaHoje.previsto;
  if (previsto) {
    assert.ok(a.texto('.ins-secao-nota') || a.texto('.ins-provenance'),
      'a tela avisa que o dia é palpite');
  }
  const alvoAntes = a.E('Math.round(CTX.hoje().alvo.kcal)');
  a.v('ctx.setCadenciaDeHoje', 'descanso');
  await a.esperar();
  const alvoDepois = a.E('Math.round(CTX.hoje().alvo.kcal)');
  assert.ok(alvoDepois < alvoAntes, 'sem treino saem o pré e o intra: ' + alvoAntes + ' → ' + alvoDepois);
  assert.strictEqual(a.vJ('ctx.hoje').diaHoje.previsto, false, 'ele disse, então não é mais palpite');
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
  assert.deepStrictEqual(a.S().dia.done, {}, 'marcação de ontem não conta hoje');
  assert.strictEqual(a.S().dia.agua, 0);
  a.fechar();
});

test('apagar o histórico não apaga o plano nutricional', async () => {
  // Simetria com o programa de treino: apagar o que foi REGISTRADO nunca apaga
  // o que foi PRESCRITO. Já quebrou uma vez, deixando a nutrição sem catálogo.
  const a = await app({ aba: 'guia' });
  a.E('S.comida.plano[0].itens[0].q = 777');
  a.E('S.cadencia = ["treino","treino","treino","treino","treino","treino","treino"]');
  a.aceitar();
  await a.v('wipe');
  await a.esperar();

  assert.strictEqual(a.S().done.length, 0, 'o histórico foi');
  assert.strictEqual(a.S().comida.plano[0].itens[0].q, 777, 'o plano editado ficou');
  assert.strictEqual(a.S().cadencia[0], 'treino', 'a cadência ficou');
  assert.ok(a.S().comida.plano.length === a.dado('PLANO_BASE').length);
  a.fechar();
});

test('a cadência da semana é editável e só fala de cadência', async () => {
  const a = await app({ aba: 'guia' });
  // a cadência é ajuste, não prescrição: mora no modo "o app"
  await a.modo('o app');
  const dias = a.$$('.gu-dia');
  assert.strictEqual(dias.length, 7);

  const antes = a.S().cadencia.slice();
  a.clicar(dias[1]);            // segunda: o índice 1, agora a SEGUNDA coluna
  await a.esperar();
  assert.notStrictEqual(a.S().cadencia[1], antes[1], 'alternou');

  // e não guarda letra de treino: qual sessão vem é sempre da rotação
  a.S().cadencia.forEach(function (c) {
    assert.ok(c === 'treino' || c === 'descanso', 'cadência guardou letra: ' + c);
  });
  a.fechar();
});

test('o alvo calórico sai do plano, não de um número escrito à parte', async () => {
  const a = await app({ aba: 'guia' });
  const antes = a.texto('.ins-linha-v');
  a.E('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens[0].q += 500');
  a.v('render');
  assert.notStrictEqual(a.texto('.ins-linha-v'), antes, 'mexer no plano recalcula o alvo na hora');
  a.fechar();
});

test('a unidade é rótulo de coluna; a referência é a coluna ANTERIOR', () => {
  // A unidade sempre foi ESTRUTURA e por isso fica sempre — mudou de lugar,
  // de dentro do campo para o cabeçalho da tabela.
  //
  // A referência do que foi feito na última vez saiu do placeholder e virou
  // coluna. O placeholder sumia no instante em que ele começava a digitar:
  // escrever a carga apagava a referência das repetições justamente na hora
  // de escrevê-las. A coluna diz as três coisas e não sai da tela.
  return app().then(async a => {
    a.v('toggle', 0);
    const unidades = a.$$('.ex.open .sethead .f').map(u => u.textContent);
    assert.ok(unidades.includes('kg'), 'a carga declara a unidade: ' + unidades.join(','));
    assert.ok(unidades.includes('reps'), 'a repetição também: ' + unidades.join(','));
    assert.strictEqual(a.texto('.ex.open .setrow .setant'), '–', 'sem histórico, nada a referenciar');

    a.preencher(0, 0, 55, 8);
    a.E('S.sessao = null');
    a.v('render');
    assert.strictEqual(a.texto('.ex.open .setrow .setant'), '55 × 8', 'com histórico, o que ele fez');
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
  a.v('render');
  assert.ok(a.$('.ins-cab'), 'o cabeçalho continua depois de re-renderizar');
  assert.ok(a.$$('.ins-tab').length === 5);
  a.fechar();
});

// ---------- os editores de COMIDA ----------

test('editar a quantidade de um item muda o plano para todo dia', async () => {
  // A distinção que separa este app de um rastreador genérico: aqui é o PLANO,
  // e vale amanhã também. O controle de porção da folha de refeição é o outro
  // lado — "só de hoje" — e os dois dizem qual é na tela.
  const a = await app({ aba: 'comida' });
  a.v('ctx.editaRefeicao', 'almoco');
  await a.esperar(150);
  assert.ok(a.$('.ins-folha'), 'a folha de edição abriu');

  const antes = a.E('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens[0].q');
  a.E('CTX.setQuantidade("almoco", 0, ' + (antes + 50) + ')');
  await a.esperar();
  assert.strictEqual(
    a.E('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens[0].q'),
    antes + 50, 'a quantidade do plano mudou');
  assert.deepStrictEqual(a.S().dia.escala, {}, 'e não virou ajuste de hoje');
  a.fechar();
});

test('as folhas empilham em três níveis e voltam uma a uma', async () => {
  const a = await app({ aba: 'comida' });
  a.v('ctx.editaRefeicao', 'almoco');
  a.E('CTX.abreFolha({ k: "seletor", ref: "almoco", idx: null })');
  a.E('CTX.abreFolha({ k: "editaAlimento", id: null })');
  await a.esperar(150);
  assert.strictEqual(a.$$('.ins-folha').length, 3, 'três folhas na pilha');

  a.v('ctx.fechaFolha');
  await a.esperar(150);
  assert.strictEqual(a.$$('.ins-folha').length, 2, 'fecha uma, volta para a de baixo');
  assert.ok(a.doc.body.className.includes('ins-travado'), 'o corpo segue travado com folha aberta');

  a.v('ctx.fechaTudo');
  await a.esperar(150);
  assert.strictEqual(a.$$('.ins-folha').length, 0);
  assert.ok(!a.doc.body.className.includes('ins-travado'), 'e destrava quando a última fecha');
  a.fechar();
});

test('adicionar alimento a uma refeição entra no plano e no total do dia', async () => {
  const a = await app({ aba: 'comida' });
  const antes = a.E('Math.round(CTX.hoje().alvo.kcal)');
  a.v('ctx.editaRefeicao', 'almoco');
  a.v('ctx.adicionaItem', 'almoco', 'aveia');
  await a.esperar();

  const itens = a.J('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens');
  assert.ok(itens.some(function (i) { return i.f === 'aveia'; }), 'entrou na refeição');
  assert.ok(a.E('Math.round(CTX.hoje().alvo.kcal)') > antes, 'e o alvo do dia recalculou sozinho');
  a.fechar();
});

test('cadastrar alimento cria id próprio e aparece na biblioteca', async () => {
  const a = await app({ aba: 'comida' });
  a.v('ctx.novoAlimento');
  const id = a.E(`CTX.salvaAlimento(null, { n: "Pasta de castanha", cat: "mercearia",
                    u: "g", kcal: 600, p: 18, c: 12, g: 55, cru: 0 })`);
  await a.esperar();
  assert.strictEqual(id, 'pasta-de-castanha', 'id derivado do nome, como nos exercícios');
  assert.strictEqual(a.S().comida.alimentos["pasta-de-castanha"].meu, 1, 'marcado como dele');
  assert.ok(a.vJ('ctx.alimentosFiltrados', 'castanha').length === 1);
  a.fechar();
});

test('escolher um alimento na busca põe ele na refeição', async () => {
  // O caminho do usuário, que nenhum teste fazia: todos chamavam `adicionaItem`
  // direto. A folha recebia a refeição de destino numa prop chamada `ref` —
  // reservada do Preact, que nunca chega ao componente —, então escolher na
  // lista não fazia nada. Sem erro, sem toast, sem nada (`9914199`).
  const a = await app({ aba: 'comida' });
  a.v('ctx.editaRefeicao', 'almoco');
  a.E('CTX.abreFolha({ k: "seletor", ref: "almoco", idx: null })');
  await a.esperar(150);

  const itens = () => a.J('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens');
  const antes = itens().length;
  const opcao = a.$$('.ins-folha button').filter(function (b) { return /^Aveia/.test(b.textContent); })[0];
  assert.ok(opcao, 'a aveia está na lista da busca');
  a.clicar(opcao);
  await a.esperar(150);

  assert.strictEqual(itens().length, antes + 1, 'entrou na refeição');
  assert.strictEqual(itens()[antes].f, 'aveia');
  assert.strictEqual(a.vista().pilha.length, 1, 'e a busca fechou, voltando para a refeição');
  a.fechar();
});

test('cadastrar a partir da busca não abre a quarta folha, e já põe na refeição', async () => {
  // O caminho que chegava a quatro: refeição → ··· → trocar → cadastrar. Agora o
  // cadastro TOMA o lugar da busca que não achou, e salvar põe o alimento na
  // refeição — antes ele era criado e ficava em lugar nenhum, e quem pediu
  // "trocar" ainda tinha que achar na lista o que acabou de digitar.
  const a = await app({ aba: 'comida' });
  a.v('ctx.editaRefeicao', 'almoco');
  a.E('CTX.abreFolha({ k: "seletor", ref: "almoco", idx: null })');
  await a.esperar(150);
  assert.strictEqual(a.vista().pilha.length, 2, 'editar a refeição e a busca');

  const cadastrar = a.$$('.ins-folha .ins-btn-add')
    .filter(function (b) { return /cadastrar/.test(b.textContent); })[0];
  assert.ok(cadastrar, 'o botão de cadastrar está na folha da busca');
  a.clicar(cadastrar);
  await a.esperar(150);

  assert.strictEqual(a.vista().pilha.length, 2, 'o cadastro tomou o lugar da busca');
  assert.strictEqual(a.vista().pilha[1].k, 'editaAlimento');
  assert.strictEqual(a.$$('.ins-folha').length, 2, 'e na tela também são duas');

  const antes = a.E('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens.length');
  a.E(`CTX.salvaAlimento(null, { n: "Tapioca de teste", cat: "mercearia",
                    u: "g", kcal: 240, p: 0.5, c: 58, g: 0.2, cru: 0 })`);
  await a.esperar(150);

  const itens = a.J('S.comida.plano.filter(function(r){return r.id==="almoco";})[0].itens');
  assert.strictEqual(itens.length, antes + 1, 'o alimento novo entrou na refeição');
  assert.strictEqual(itens[itens.length - 1].f, 'tapioca-de-teste');
  assert.strictEqual(a.vista().pilha.length, 1, 'e voltou para a refeição que ele estava editando');
  assert.ok(/posto em/.test(a.toast()), 'o aviso diz onde ele foi parar: ' + a.toast());
  a.fechar();
});

test('remover alimento em uso tira ele das refeições que o citam', async () => {
  // Sem isto o plano ficaria apontando para um id órfão e o total do dia
  // mudaria sem explicação.
  const a = await app({ aba: 'comida' });
  a.aceitar();
  const usava = a.E('S.comida.plano.filter(function(r){return r.itens.some(function(i){return i.f==="arroz";});}).length');
  assert.ok(usava > 0, 'o arroz está no plano');

  a.v('ctx.removeAlimento', 'arroz');
  await a.esperar();
  assert.ok(a.perguntas().some(function (p) { return /refeições|refeição/.test(p); }),
    'avisa em quantas refeições ele estava');
  assert.strictEqual(
    a.E('S.comida.plano.filter(function(r){return r.itens.some(function(i){return i.f==="arroz";});}).length'),
    0, 'saiu de todas');
  assert.strictEqual(a.S().comida.ocultos["arroz"], 1, 'da prescrição: escondido, não apagado');
  a.fechar();
});

test('alimento da prescrição é editável mas não some do código', async () => {
  const a = await app({ aba: 'comida' });
  a.E('CTX.salvaAlimento("arroz", { n: "Arroz integral cozido", cat: "mercearia", u: "g", kcal: 111, p: 2.6, c: 23, g: 0.9, cru: 0.36 })');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.alimentoParaEditar', 'arroz').n, 'Arroz integral cozido');
  assert.strictEqual(a.vJ('ctx.alimentoParaEditar', 'arroz').daPrescricao, true,
    'continua sabendo que veio da prescrição');
  assert.strictEqual(a.dado('ALIMENTOS_BASE')["arroz"].n, 'Arroz branco cozido',
    'o do código não é tocado — restaurar o plano devolve o original');
  a.fechar();
});

test('remover uma refeição limpa o que era do dia junto', async () => {
  const a = await app({ aba: 'hoje' });
  a.v('ctx.marcaRefeicao', 'lanche');
  a.v('ctx.setEscala', 'lanche', 0.5);
  await a.esperar();
  // instante, e não `1`: `DiaComida.done` convergiu na forma de
  // `DiaComidaHist.done` na migração 9→10. O que este teste protege são as
  // duas asserções depois do `removeRefeicao`; esta é a pré-condição.
  assert.ok(a.S().dia.done.lanche > 1, 'ficou marcada, com a hora da marca');

  a.aceitar();
  a.v('ctx.removeRefeicao', 'lanche');
  await a.esperar();
  assert.strictEqual(a.E('S.comida.plano.filter(function(r){return r.id==="lanche";}).length'), 0);
  assert.strictEqual(a.S().dia.done.lanche, undefined, 'a marcação de hoje foi junto');
  assert.strictEqual(a.S().dia.escala.lanche, undefined, 'o ajuste de porção também');
  a.fechar();
});

// ---------------------------------------------------------------------------
// O destrutivo de dentro da refeição: `removeItem` e `trocaItem`
// ---------------------------------------------------------------------------
//
// O QUE ESTE GRUPO PROVA: que as duas capacidades existem NO MODELO, que cada
// uma apaga o que diz apagar — e, sobretudo, **que ela não apaga mais do que
// isso**. O escopo delimitado é metade da capacidade: um `removeItem` que
// crescesse do item para a refeição, ou da refeição de hoje para o plano
// inteiro, continuaria passando em todo teste que só olhasse o item removido.
// Por isso cada caso afirma o que FICA, item por item, refeição por refeição.
//
// O QUE ESTE GRUPO NÃO PROVA: que exista botão, menu ou `···` na tela ligado
// nessas chaves. Chamar `a.v('ctx.removeItem', …)` prova a capacidade no
// modelo; não prova a FIAÇÃO. Se o redesenho esquecer o item destrutivo do
// editor de refeição, estes casos continuam todos verdes e o dedo não alcança
// a capacidade. Nenhum deles conta botões.
//
// Entram pelo nome e pelo valor (`a.v('ctx.removeItem', 'almoco', 2)`), nunca
// por `a.E('…')`: é o que os faz sobreviver à reescrita das telas.

test('ctx.removeItem pergunta antes, diz o que muda, e recusar não tira nada', async () => {
  const a = await app({ aba: 'comida' });
  const antes = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens.map(function (i) { return i.f; });
  assert.strictEqual(antes[2], 'frango', 'o terceiro item do almoço é o frango');
  const versaoAntes = a.S().comida.v;

  a.recusar();
  a.v('ctx.removeItem', 'almoco', 2);
  await a.esperar();

  const pergunta = a.perguntas().slice(-1)[0];
  assert.ok(/^Tirar frango cozido de Almoço\?/.test(pergunta),
    'a pergunta nomeia o alimento E a refeição: ' + pergunta);
  assert.ok(/todos os dias/.test(pergunta),
    'e diz que o estrago é o plano de todo dia, não o de hoje: ' + pergunta);
  assert.ok(/continua na biblioteca/.test(pergunta),
    'e delimita: o alimento não é apagado junto: ' + pergunta);

  assert.deepStrictEqual(a.vJ('ctx.refeicaoParaEditar', 'almoco').itens.map(function (i) { return i.f; }),
    antes, 'recusar deixa a refeição exatamente como estava');
  assert.strictEqual(a.S().comida.v, versaoAntes,
    'e nem carimba o plano como mudado — a versão só anda quando algo mudou');
  a.fechar();
});

test('ctx.removeItem tira UM item, e nada além daquele item', async () => {
  // O caso do escopo. `frango` está no almoço E no café da manhã, e o almoço
  // tem outros cinco itens: as três coisas que um apagamento largo levaria.
  const a = await app({ aba: 'hoje' });
  a.v('ctx.marcaRefeicao', 'almoco');
  a.v('ctx.setEscala', 'almoco', 0.5);
  await a.esperar();
  assert.ok(a.S().dia.done.almoco > 1, 'o almoço de hoje está marcado — pré-condição');

  const noCafe = a.vJ('ctx.refeicaoParaEditar', 'pos').itens.map(function (i) { return i.f; });
  assert.ok(noCafe.indexOf('frango') >= 0, 'o frango também está no café da manhã');
  const versaoAntes = a.S().comida.v;

  a.aceitar();
  a.v('ctx.removeItem', 'almoco', 2);
  await a.esperar();

  const depois = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens;
  assert.deepStrictEqual(depois.map(function (i) { return i.f; }),
    ['arroz', 'feijao', 'legumes', 'azeite', 'kiwi'],
    'saiu o frango, e só ele — os outros cinco ficam, na ordem');
  assert.deepStrictEqual(depois.map(function (i) { return i.q; }), [250, 50, 100, 15, 100],
    'com as quantidades intactas: o índice andou, o dado não');

  assert.deepStrictEqual(a.vJ('ctx.refeicaoParaEditar', 'pos').itens.map(function (i) { return i.f; }),
    noCafe, 'o frango do CAFÉ DA MANHÃ fica: o escopo é o item, não o alimento');
  assert.strictEqual(a.vJ('ctx.alimentosParaSeletor', 'frango').length, 1,
    'e o alimento continua na biblioteca, pronto para voltar');
  assert.strictEqual(a.S().comida.plano.length, 7, 'as sete refeições do plano ficam');

  assert.ok(a.S().dia.done.almoco > 1,
    'a marcação de HOJE fica — tirar um item não desmarca a refeição comida');
  assert.strictEqual(a.S().dia.escala.almoco, 0.5,
    'e o ajuste de porção de hoje também fica (diferente de removeRefeicao, que leva os dois)');
  assert.ok(a.S().comida.v > (versaoAntes || 0),
    'o plano foi carimbado como mudado: dia fechado antes disto não mente');
  a.fechar();
});

test('ctx.trocaItem troca o alimento, preserva a quantidade e não mexe em mais nada', async () => {
  const a = await app({ aba: 'comida' });
  const noCafe = a.vJ('ctx.refeicaoParaEditar', 'pos').itens.map(function (i) { return i.f; });
  const versaoAntes = a.S().comida.v;

  // uma folha aberta, para medir que o verbo a fecha
  a.v('ctx.editaRefeicao', 'almoco');
  a.v('ctx.abreFolha', { k: 'seletor', ref: 'almoco', idx: 2 });
  await a.esperar(150);
  assert.strictEqual(a.$$('.ins-folha').length, 2, 'duas folhas na pilha — pré-condição');

  a.v('ctx.trocaItem', 'almoco', 2, 'suino');
  await a.esperar(150);

  const depois = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens;
  assert.deepStrictEqual(depois.map(function (i) { return i.f; }),
    ['arroz', 'feijao', 'suino', 'legumes', 'azeite', 'kiwi'],
    'o terceiro item virou suíno, na mesma posição');
  assert.strictEqual(depois[2].q, 80,
    'e A QUANTIDADE É A DO ITEM ANTIGO: trocar não faz ele digitar 80 g de novo');
  assert.strictEqual(depois.length, 6, 'nenhum item entrou nem saiu');
  assert.deepStrictEqual(depois.filter(function (i) { return i.idx !== 2; }).map(function (i) { return i.q; }),
    [250, 50, 100, 15, 100], 'os outros cinco não foram tocados');

  assert.deepStrictEqual(a.vJ('ctx.refeicaoParaEditar', 'pos').itens.map(function (i) { return i.f; }),
    noCafe, 'o frango do café da manhã fica: a troca é daquele item, não do alimento');
  assert.strictEqual(a.vJ('ctx.alimentosParaSeletor', 'frango').length, 1,
    'e o frango continua na biblioteca, sem ter sido apagado por falta de uso');

  assert.strictEqual(a.$$('.ins-folha').length, 1,
    'o verbo fecha a folha de onde a escolha veio, e só ela');
  assert.ok(a.S().comida.v > (versaoAntes || 0), 'e carimba o plano como mudado');
  a.fechar();
});

test('ctx.trocaItem leva junto as marcas do item antigo — inclusive a do arroz', async () => {
  // ESTE CASO NÃO AFIRMA QUE ESTÁ CERTO. Ele grava o que o app faz hoje:
  // `trocaItem` só reescreve `i.f`, então `i.arroz` e `i.alta` sobrevivem à
  // troca e passam a valer para o alimento NOVO.
  //
  // `i.arroz` é onde o ajuste calórico da dieta aterra (`arrozAtual`,
  // `aplicaArroz`): trocar o arroz do almoço por outra coisa move a alavanca
  // do ajuste para um alimento que não é arroz, em silêncio. `i.alta` é o
  // carboidrato intra-treino do dia de alta demanda. Se alguém decidir que a
  // troca deve limpar as marcas, este caso fica vermelho e aponta a linha.
  const a = await app({ aba: 'comida' });
  const arrozAntes = a.v('arrozAtual');
  assert.ok(arrozAntes > 0, 'o plano tem arroz, e o ajuste aterra nele: ' + arrozAntes);
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[0].arroz, true,
    'o primeiro item do almoço é o arroz marcado — pré-condição');

  a.v('ctx.trocaItem', 'almoco', 0, 'cuscuz');
  await a.esperar();

  const trocado = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[0];
  assert.strictEqual(trocado.f, 'cuscuz', 'o item virou cuscuz');
  assert.strictEqual(trocado.arroz, true,
    'e CONTINUA marcado como arroz: a marca é do item, e a troca não a limpa');
  assert.strictEqual(a.v('arrozAtual'), arrozAntes,
    'então o "arroz do plano" do ajuste segue contando esses 250 g, agora de cuscuz');

  // a mesma coisa com `alta`, o carboidrato intra-treino
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'treino').itens[1].alta, true,
    'o malto do intra-treino é marcado como "alta demanda" — pré-condição');
  a.v('ctx.trocaItem', 'treino', 1, 'banana');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'treino').itens[1].alta, true,
    'a marca de alta demanda também passa para o alimento novo');
  a.fechar();
});

test('removeItem e trocaItem com refeição ou índice que não existe não perguntam nem mexem', async () => {
  // A guarda `if (!r || !r.itens[idx]) return` — e a ordem dela importa:
  // `removeItem` só pergunta DEPOIS de achar o item, então um índice fora da
  // lista não produz um `confirm` sobre "este item".
  const a = await app({ aba: 'comida' });
  const antes = JSON.stringify(a.S().comida.plano);
  const perguntasAntes = a.perguntas().length;

  a.v('ctx.removeItem', 'nao-existe', 0);
  a.v('ctx.removeItem', 'almoco', 99);
  a.v('ctx.removeItem', 'almoco', -1);
  a.v('ctx.trocaItem', 'nao-existe', 0, 'arroz');
  a.v('ctx.trocaItem', 'almoco', 99, 'arroz');
  await a.esperar();

  assert.strictEqual(JSON.stringify(a.S().comida.plano), antes,
    'o plano inteiro ficou byte a byte igual');
  assert.strictEqual(a.perguntas().length, perguntasAntes,
    'e nenhuma pergunta foi feita sobre item que não existe');
  a.fechar();
});
