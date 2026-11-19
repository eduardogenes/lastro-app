// A fusão, de ponta a ponta: um estado antigo abre migrado e íntegro.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

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

  a.aba('ajustes');
  a.v('showJSON');
  const json = a.v('payload');
  const bkp = JSON.parse(json);
  assert.strictEqual(bkp.data.ajuste, 1);
  assert.strictEqual(bkp.data.perfManual, false);
  assert.strictEqual(bkp.data.cadencia[2], 'descanso');
  assert.strictEqual(bkp.data.comida.plano[0].itens[0].q, 321);
  a.fechar();

  const b = await app({ estado: bkp.data });
  assert.strictEqual(b.S().ajuste, 1, 'o ajuste sobreviveu à volta');
  assert.strictEqual(b.S().perfManual, false);
  assert.strictEqual(b.S().cadencia[2], 'descanso');
  assert.strictEqual(b.S().comida.plano[0].itens[0].q, 321, 'o plano editado voltou igual');
  assert.strictEqual(b.S().compras.dias, 30);
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

test('o dia de comida zera sozinho na virada da data', async () => {
  const ontem = new Date(Date.now() - DIA);
  const iso = ontem.getFullYear() + '-' + String(ontem.getMonth() + 1).padStart(2, '0') + '-' +
              String(ontem.getDate()).padStart(2, '0');
  const a = await app({ aba: 'agora', estado: {
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
  const a = await app({ aba: 'prescricao' });
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

test('adicionar alimento a uma refeição entra no plano e no total do dia', async () => {
  const a = await app({ aba: 'prescricao' });
  const antes = Math.round(a.vJ('ctx.hoje').alvo.kcal);
  a.v('ctx.editaRefeicao', 'almoco');
  a.v('ctx.adicionaItem', 'almoco', 'aveia');
  await a.esperar();

  const itens = a.S().comida.plano.filter(function (r) { return r.id === 'almoco'; })[0].itens;
  assert.ok(itens.some(function (i) { return i.f === 'aveia'; }), 'entrou na refeição');
  assert.ok(Math.round(a.vJ('ctx.hoje').alvo.kcal) > antes, 'e o alvo do dia recalculou sozinho');
  a.fechar();
});

test('cadastrar alimento cria id próprio e aparece na biblioteca', async () => {
  const a = await app({ aba: 'prescricao' });
  a.v('ctx.novoAlimento');
  const id = a.v('ctx.salvaAlimento', null, { n: 'Pasta de castanha', cat: 'mercearia',
                    u: 'g', kcal: 600, p: 18, c: 12, g: 55, cru: 0 });
  await a.esperar();
  assert.strictEqual(id, 'pasta-de-castanha', 'id derivado do nome, como nos exercícios');
  assert.strictEqual(a.S().comida.alimentos["pasta-de-castanha"].meu, 1, 'marcado como dele');
  assert.ok(a.vJ('ctx.alimentosFiltrados', 'castanha').length === 1);
  a.fechar();
});

test('remover alimento em uso tira ele das refeições que o citam', async () => {
  // Sem isto o plano ficaria apontando para um id órfão e o total do dia
  // mudaria sem explicação.
  const a = await app({ aba: 'prescricao' });
  a.aceitar();
  const usava = a.S().comida.plano.filter(function (r) { return r.itens.some(function (i) { return i.f === 'arroz'; }); }).length;
  assert.ok(usava > 0, 'o arroz está no plano');

  a.v('ctx.removeAlimento', 'arroz');
  await a.esperar();
  assert.ok(a.perguntas().some(function (p) { return /refeições|refeição/.test(p); }),
    'avisa em quantas refeições ele estava');
  assert.strictEqual(
    a.S().comida.plano.filter(function (r) { return r.itens.some(function (i) { return i.f === 'arroz'; }); }).length,
    0, 'saiu de todas');
  assert.strictEqual(a.S().comida.ocultos["arroz"], 1, 'da prescrição: escondido, não apagado');
  a.fechar();
});

test('alimento da prescrição é editável mas não some do código', async () => {
  const a = await app({ aba: 'prescricao' });
  a.v('ctx.salvaAlimento', 'arroz', { n: 'Arroz integral cozido', cat: 'mercearia', u: 'g', kcal: 111, p: 2.6, c: 23, g: 0.9, cru: 0.36 });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.alimentoParaEditar', 'arroz').n, 'Arroz integral cozido');
  assert.strictEqual(a.vJ('ctx.alimentoParaEditar', 'arroz').daPrescricao, true,
    'continua sabendo que veio da prescrição');
  assert.strictEqual(a.dado('ALIMENTOS_BASE')["arroz"].n, 'Arroz branco cozido',
    'o do código não é tocado — restaurar o plano devolve o original');
  a.fechar();
});

test('remover uma refeição limpa o que era do dia junto', async () => {
  const a = await app({ aba: 'agora' });
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
  assert.strictEqual(a.S().comida.plano.filter(function (r) { return r.id === 'lanche'; }).length, 0);
  assert.strictEqual(a.S().dia.done.lanche, undefined, 'a marcação de hoje foi junto');
  assert.strictEqual(a.S().dia.escala.lanche, undefined, 'o ajuste de porção também');
  a.fechar();
});

test('remover uma refeição leva o tamanho do "comi outra coisa" junto', async () => {
  const a = await app({ aba: 'agora' });
  a.v('ctx.marcaRefeicao', 'lanche', 'fora', 'mais');
  await a.esperar();
  assert.strictEqual(a.S().dia.tam.lanche, 'mais', 'a pré-condição');
  a.aceitar();
  a.v('ctx.removeRefeicao', 'lanche');
  await a.esperar();
  assert.ok(!a.S().dia.tam, 'o tamanho não fica solto no dia');
  a.fechar();
});

test('desmarcar deixa lápide que alcança a marca, mesmo vinda de um relógio adiantado', async () => {
  const a = await app({ aba: 'agora' });
  a.v('ctx.marcaRefeicao', 'lanche');
  // a marca veio de um aparelho com o relógio uma hora adiantado
  const adiantada = a.E('diaDeComida().done.lanche = Date.now() + 3600000');
  a.v('ctx.marcaRefeicao', 'lanche');
  assert.ok(a.S().apagados['comida:' + a.S().dia.data + ':lanche'] >= adiantada,
    'a lápide nunca é anterior à marca que ela mata: senão a fusão a traria de volta');
  a.fechar();
});

test('a marca da refeição removida não volta pelo outro aparelho', async () => {
  // Regressão (docs/mapa, risco D15): a marca saía sem lápide, e a fusão do
  // mesmo dia a trazia de volta do aparelho que ainda a tinha.
  const a = await app({ aba: 'agora' });
  a.v('ctx.marcaRefeicao', 'lanche');
  await a.esperar(5);
  const outroAparelho = JSON.parse(JSON.stringify(a.S()));
  await a.esperar(5);
  const versao = a.S().comida.v;

  a.recusar();
  a.v('ctx.removeRefeicao', 'lanche');
  assert.strictEqual(a.S().comida.v, versao, 'cancelar não mexe na versão do plano');

  a.aceitar();
  a.v('ctx.removeRefeicao', 'lanche');
  await a.esperar();
  assert.ok(a.S().apagados['comida:' + a.S().dia.data + ':lanche'], 'a marca sai com lápide');
  a.E(`globalThis.__fundido = funde(S, ${JSON.stringify(outroAparelho)}, Date.now()).estado`);
  assert.strictEqual(a.J('globalThis.__fundido').dia.done.lanche, undefined,
    'e o outro aparelho não a traz de volta');
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
  const a = await app({ aba: 'prescricao' });
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
  const a = await app({ aba: 'agora' });
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

test('ctx.trocaItem derruba a marca do arroz e preserva a de alta demanda', async () => {
  // O corte do dono, de 08/10, e é pela NATUREZA da marca:
  //
  // - `i.arroz` diz QUAL ALIMENTO o item é — é onde o ajuste calórico aterra
  //   (`arrozAtual`, `aplicaArroz`). A troca a torna falsa, então ela CAI:
  //   antes disto, trocar o arroz do almoço por cuscuz movia a alavanca do
  //   ajuste para algo que não é arroz, em silêncio.
  // - `i.alta` diz QUANDO o item aparece (só em dia de alta demanda). Descreve
  //   o lugar no plano, e o lugar não mudou. Então ela FICA.
  const a = await app({ aba: 'prescricao' });
  const arrozAntes = a.v('arrozAtual');
  assert.strictEqual(arrozAntes, 500,
    'o plano tem arroz em duas refeições, 250 g cada — pré-condição');
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[0].arroz, true,
    'o primeiro item do almoço é o arroz marcado — pré-condição');

  a.v('ctx.trocaItem', 'almoco', 0, 'cuscuz');
  await a.esperar();

  const trocado = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[0];
  assert.strictEqual(trocado.f, 'cuscuz', 'o item virou cuscuz');
  assert.strictEqual(trocado.arroz, false,
    'e NÃO é mais arroz: a marca diz qual alimento é, e a troca a tornou falsa');
  assert.strictEqual(a.S().comida.plano.filter(function (r) { return r.id === 'almoco'; })[0].itens[0].arroz,
    undefined, 'a marca saiu do plano gravado, não só da leitura do editor');
  assert.strictEqual(a.v('arrozAtual'), 250,
    'e o "arroz do plano" do ajuste deixou de contar esses 250 g de cuscuz');

  // `alta` é o carboidrato intra-treino: lugar no plano, não alimento.
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'treino').itens[1].alta, true,
    'o malto do intra-treino é marcado como "alta demanda" — pré-condição');
  a.v('ctx.trocaItem', 'treino', 1, 'banana');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'treino').itens[1].alta, true,
    'a marca de alta demanda SOBREVIVE: o item segue só entrando em dia de alta');
  a.fechar();
});

test('ctx.trocaItem não decide sobre a marca de cafeína — ela sobrevive, por ora', async () => {
  // ESTE CASO NÃO AFIRMA QUE ESTÁ CERTO. `i.caf` é a terceira marca por item
  // (`Item.caf` em dominio/nutricao/tipos.ts) e é da mesma natureza de
  // `i.arroz` — diz qual alimento é, a fonte de cafeína do pré-treino, que
  // `refeicoesDeHoje` corta do dia quando o pré cai depois do CORTE_CAFEINA.
  // O dono decidiu `arroz` e `alta` em 08/10 e não foi perguntado sobre esta.
  // Ela não aparece em `refeicaoParaEditar`, então nenhuma tela a mostra e só
  // o estado a revela. Se alguém decidir que ela também cai, este caso fica
  // vermelho e aponta a linha.
  const a = await app({ aba: 'prescricao' });
  const cafeDoPre = function () {
    return a.S().comida.plano.filter(function (r) { return r.id === 'pre'; })[0].itens[3];
  };
  assert.strictEqual(cafeDoPre().f, 'cafe', 'o quarto item do pré é o café — pré-condição');
  assert.strictEqual(cafeDoPre().caf, 1, 'e é a fonte de cafeína marcada — pré-condição');

  a.v('ctx.trocaItem', 'pre', 3, 'kiwi');
  await a.esperar();

  assert.strictEqual(cafeDoPre().f, 'kiwi', 'o item virou kiwi');
  assert.strictEqual(cafeDoPre().caf, 1,
    'e o kiwi herdou a marca de cafeína — o que o app faz hoje, sem decisão do dono');
  a.fechar();
});

test('removeItem e trocaItem com refeição ou índice que não existe não perguntam nem mexem', async () => {
  // A guarda `if (!r || !r.itens[idx]) return` — e a ordem dela importa:
  // `removeItem` só pergunta DEPOIS de achar o item, então um índice fora da
  // lista não produz um `confirm` sobre "este item".
  const a = await app({ aba: 'prescricao' });
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

test('ctx.refeicaoParaEditar traduz a refeição para o editor, e acusa o alimento sumido', async () => {
  const a = await app({ aba: 'prescricao' });
  const vazia = a.vJ('ctx.refeicaoParaEditar', null);
  assert.strictEqual(vazia.novo, true, 'sem id é refeição nova');
  assert.deepStrictEqual([vazia.id, vazia.n, vazia.t, vazia.quando, vazia.itens.length],
    [null, '', '12:00', 'sempre', 0], 'e vem com o formulário em branco, meio-dia e "sempre"');

  const r = a.vJ('ctx.refeicaoParaEditar', 'almoco');
  assert.strictEqual(r.novo, false);
  assert.deepStrictEqual([r.id, r.n, r.t, r.quando], ['almoco', 'Almoço', '12:30', 'sempre']);
  assert.deepStrictEqual(r.itens.map(function (i) { return i.idx; }), [0, 1, 2, 3, 4, 5],
    'cada item carrega o PRÓPRIO índice: é por ele que removeItem e trocaItem entram');
  assert.deepStrictEqual(r.itens[0].n, 'Arroz branco cozido',
    'o nome vem do catálogo, não do plano — o plano guarda só o id');
  assert.strictEqual(r.itens[0].u, 'g', 'e a unidade também');
  assert.strictEqual(r.itens[0].sumido, false);

  // um item apontando para alimento que não existe no catálogo
  a.v('ctx.trocaItem', 'almoco', 1, 'alimento-fantasma');
  await a.esperar();
  const orfao = a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[1];
  assert.strictEqual(orfao.sumido, true, 'o item órfão se declara sumido');
  assert.strictEqual(orfao.n, 'alimento-fantasma',
    'e cai no id como nome, em vez de desenhar uma linha sem rótulo');
  assert.strictEqual(orfao.q, 50, 'a quantidade dele continua legível, para ele poder corrigir');
  a.fechar();
});

test('ctx.salvaRefeicao cria sem id e corrige com id, sem tocar nos itens', async () => {
  const a = await app({ aba: 'prescricao' });

  a.v('ctx.salvaRefeicao', 'almoco', { n: 'Almoço no trabalho', t: '13:15' });
  await a.esperar();
  const r = a.vJ('ctx.refeicaoParaEditar', 'almoco');
  assert.strictEqual(r.n, 'Almoço no trabalho');
  assert.strictEqual(r.t, '13:15');
  assert.strictEqual(r.itens.length, 6,
    'salvar os campos não mexe nos itens: campo não citado fica como estava');
  assert.strictEqual(r.tag, 'PRATO PRINCIPAL', 'nem na tag');
  assert.strictEqual(a.S().comida.plano.length, 7, 'e não duplicou a refeição');

  a.v('ctx.salvaRefeicao', null, { t: '10:00' });
  await a.esperar();
  const plano = a.vJ('ctx.planoCompleto');
  assert.strictEqual(plano.length, 8, 'sem id, nasce uma refeição nova');
  const nova = plano.filter(function (x) { return x.t === '10:00'; })[0];
  assert.strictEqual(nova.n, 'Refeição',
    'sem nome ela ganha um: refeição sem rótulo na timeline não dá para ser tocada');
  assert.ok(/^r\d+$/.test(nova.id), 'com id próprio, carimbado do relógio: ' + nova.id);
  assert.deepStrictEqual(nova.itens, [], 'e nasce vazia');
  assert.deepStrictEqual(plano.map(function (x) { return x.t; }),
    ['05:45', '06:15', '08:00', '10:00', '13:15', '16:00', '19:30', '21:30'],
    'e entra em ordem de relógio, entre o café das 08:00 e o almoço já remarcado');
  a.fechar();
});

test('duas duplicações no mesmo milissegundo ganham ids diferentes, e as duas são editáveis', async () => {
  // Este caso trocou de lado. Ele afirmava a assimetria do fonte — `idAlimento`
  // procurava um id livre em laço e o de refeição era `'r' + Date.now()` nu, em
  // `salvaRefeicao` e em `duplicaRefeicao` — e dizia que ficaria vermelho
  // quando alguém pagasse a guarda. Alguém pagou: `idRefeicao()` faz o laço de
  // `idAlimento`, e o que o caso cobra agora é a guarda, não o defeito.
  //
  // Com o relógio parado — que é como esta suíte roda — as duas duplicações
  // caem no mesmo milissegundo, que é o único jeito de exercitar o laço de
  // propósito. Dois ids iguais no plano não davam erro: `achaRefeicao` devolvia
  // sempre a primeira, e a segunda somava no total do dia sem poder ser editada.
  const a = await app({ aba: 'prescricao', agora: agoraEstavel(8) });
  a.v('ctx.duplicaRefeicao', 'ceia');
  a.v('ctx.duplicaRefeicao', 'ceia');
  await a.esperar();

  const ids = a.S().comida.plano.map(function (r) { return r.id; });
  assert.strictEqual(ids.length, 9, 'as duas cópias entraram');
  assert.notStrictEqual(ids[7], ids[8], 'e com ids DIFERENTES: ' + ids[7] + ' / ' + ids[8]);
  assert.strictEqual(new Set(ids).size, 9, 'nove refeições, nove ids');
  assert.ok(/^r\d+(-\d+)?$/.test(ids[8]), 'o segundo sai do laço com sufixo: ' + ids[8]);

  // E a segunda cópia é alcançável: era este o estrago da colisão.
  a.v('ctx.removeItem', ids[8], 0);
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', ids[8]).itens.length, 1,
    'a SEGUNDA cópia perdeu um item — ela é editável, e não um apelido da primeira');
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', ids[7]).itens.length, 2,
    'e a primeira não foi tocada');
  a.fechar();
});

test('a criação de refeição tem a MESMA guarda de id da duplicação', async () => {
  // São duas portas, e só uma estar guardada seria a assimetria de volta num
  // lugar diferente: `ctx.salvaRefeicao` sem id cria, `ctx.duplicaRefeicao`
  // copia, e as duas carimbavam `'r' + Date.now()` nu.
  const a = await app({ aba: 'prescricao', agora: agoraEstavel(8) });
  a.v('ctx.salvaRefeicao', null, { t: '10:00', n: 'Uma' });
  a.v('ctx.salvaRefeicao', null, { t: '10:30', n: 'Outra' });
  await a.esperar();

  const plano = a.S().comida.plano;
  const novas = plano.filter(function (r) { return r.n === 'Uma' || r.n === 'Outra'; });
  assert.strictEqual(novas.length, 2, 'as duas nasceram');
  assert.notStrictEqual(novas[0].id, novas[1].id,
    'com ids diferentes: ' + novas[0].id + ' / ' + novas[1].id);
  assert.strictEqual(new Set(plano.map(function (r) { return r.id; })).size, plano.length,
    'e o plano inteiro segue sem id repetido');

  // Cada uma responde pelo SEU id: com a colisão, editar a segunda editava a primeira.
  a.v('ctx.salvaRefeicao', novas[1].id, { n: 'Outra, renomeada' });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', novas[1].id).n, 'Outra, renomeada');
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', novas[0].id).n, 'Uma',
    'e a primeira não foi renomeada no lugar dela');
  a.fechar();
});

test('ctx.alternaAlta liga e desliga a marca do item, apagando a chave em vez de gravar false', async () => {
  const a = await app({ aba: 'prescricao' });
  const cru = function (i) { return a.S().comida.plano.filter(function (r) { return r.id === 'almoco'; })[0].itens[i]; };
  assert.strictEqual(cru(5).alta, undefined, 'o kiwi não é item de alta demanda — pré-condição');

  a.v('ctx.alternaAlta', 'almoco', 5);
  await a.esperar();
  assert.strictEqual(cru(5).alta, true, 'ligou');
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'almoco').itens[5].alta, true,
    'e o editor lê a marca');
  assert.strictEqual(cru(0).alta, undefined, 'o item vizinho não foi tocado');
  assert.strictEqual(a.vJ('ctx.refeicaoParaEditar', 'treino').itens[1].alta, true,
    'nem a marca que já existia em outra refeição');

  a.v('ctx.alternaAlta', 'almoco', 5);
  await a.esperar();
  assert.ok(!('alta' in cru(5)),
    'desligar APAGA a chave em vez de gravar false — é o que mantém o backup e a fusão enxutos');
  assert.strictEqual(cru(5).q, 100, 'e a quantidade atravessa as duas idas');
  a.fechar();
});

test('ctx.alimentosParaSeletor acha por pedaço do nome, sem acento, e em ordem', async () => {
  const a = await app({ aba: 'prescricao' });
  const todos = a.vJ('ctx.alimentosParaSeletor', '');
  assert.ok(todos.length > 20, 'busca vazia é a biblioteca inteira: ' + todos.length);
  const nomes = todos.map(function (x) { return x.n; });
  assert.deepStrictEqual(nomes, nomes.slice().sort(function (x, y) { return x.localeCompare(y, 'pt-BR'); }),
    'em ordem alfabética de pt-BR, que é a ordem em que ele procura com o dedo');

  assert.deepStrictEqual(a.vJ('ctx.alimentosParaSeletor', 'feijao').map(function (x) { return x.n; }),
    ['Feijão cozido'], 'digitar sem acento acha o acentuado');
  assert.deepStrictEqual(a.vJ('ctx.alimentosParaSeletor', 'lei').map(function (x) { return x.n; }),
    ['Doce de leite', 'Geleia light', 'Leite em pó integral', 'Leite integral'],
    'e o pedaço casa no meio da palavra, não só no começo');
  assert.deepStrictEqual(a.vJ('ctx.alimentosParaSeletor', 'xyzqk'), [],
    'sem resultado devolve lista vazia, não a biblioteca inteira');

  // o que ele cadastra entra na mesma busca
  a.v('ctx.salvaAlimento', null, { n: 'Tapioca pronta', cat: 'mercearia', u: 'g', kcal: 160, p: 0, c: 40, g: 0, cru: 0 });
  await a.esperar();
  assert.deepStrictEqual(a.vJ('ctx.alimentosParaSeletor', 'tapioca').map(function (x) { return x.n; }),
    ['Tapioca pronta'], 'o alimento dele aparece junto com os da prescrição');
  a.fechar();
});

// ---------------------------------------------------------------------------
// O plano lido inteiro, a cadência da semana e a lista de compras
// ---------------------------------------------------------------------------
//
// O QUE ESTE GRUPO PROVA: que as três leituras do plano (`planoCompleto`,
// `resumoDoPlano`, e a de compras por trás de `setHorizonteCompras` e
// `marcaCompra`) respondem ao dado, e que `alternaCadencia` muda um dia da
// semana e só aquele dia.
//
// O QUE ESTE GRUPO NÃO PROVA: que a tela DESENHE o que a leitura devolve. Uma
// tela nova que lesse `resumoDoPlano` e mostrasse só o total de dia de treino
// passaria por tudo aqui — e seria exatamente o erro que a existência de dois
// totais existe para evitar. Nada aqui conta elementos na tela.

test('ctx.planoCompleto devolve o plano em ordem de relógio, com o kcal de cada refeição', async () => {
  const a = await app({ aba: 'prescricao' });
  const plano = a.vJ('ctx.planoCompleto');
  const horas = plano.map(function (r) { return r.t; });
  assert.deepStrictEqual(horas, horas.slice().sort(), 'ordenado pelo relógio');
  assert.ok(plano.every(function (r) { return typeof r.kcal === 'number' && r.kcal > 0; }),
    'cada refeição vem com o próprio kcal, já somado do catálogo');
  assert.ok(plano.every(function (r) { return Array.isArray(r.itens); }),
    'e com os itens, para a lista não precisar de uma segunda leitura');

  // uma refeição fora de ordem no estado: a leitura ordena, o estado não muda
  a.v('ctx.salvaRefeicao', null, { n: 'Café duplo', t: '06:00' });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.planoCompleto')[1].n, 'Café duplo',
    'a nova entra em segundo lugar na LEITURA, entre 05:45 e 06:15');
  assert.strictEqual(a.S().comida.plano[7].n, 'Café duplo',
    'e continua em último no ESTADO: planoCompleto ordena sem reescrever o plano');
  a.fechar();
});

test('ctx.resumoDoPlano fecha a conta nos dois tipos de dia, e não num só', async () => {
  const a = await app({ aba: 'prescricao' });
  const num = function (s) { return Number(String(s).replace(/\./g, '')); };
  const antes = a.vJ('ctx.resumoDoPlano');
  assert.strictEqual(antes.refeicoes, 7, 'conta as refeições do plano');
  assert.ok(num(antes.treino.kcal) > num(antes.descanso.kcal),
    'o dia de treino soma mais: as refeições condicionais entram só nele — ' +
    antes.treino.kcal + ' vs ' + antes.descanso.kcal);
  assert.match(antes.treino.macros, /^\d+ P · \d+ C · \d+ G$/, 'macros na forma P · C · G');

  // o pré-treino passa a valer todo dia: o total de DESCANSO sobe, o de treino não
  a.v('ctx.salvaRefeicao', 'pre', { quando: 'sempre' });
  await a.esperar();
  const depois = a.vJ('ctx.resumoDoPlano');
  assert.strictEqual(num(depois.treino.kcal), num(antes.treino.kcal),
    'o dia de treino já contava o pré-treino: não muda');
  assert.ok(num(depois.descanso.kcal) > num(antes.descanso.kcal),
    'e o de descanso sobe pelo kcal do pré-treino — é a prova de que os dois totais ' +
    'não são o mesmo número escrito duas vezes');
  assert.strictEqual(depois.refeicoes, 7, 'sem refeição nova: mudou a condição, não a lista');
  a.fechar();
});

test('ctx.alternaCadencia vira um dia da semana, e só aquele dia', async () => {
  const a = await app({ aba: 'prescricao' });
  const antes = a.S().cadencia.slice();
  assert.strictEqual(antes.length, 7, 'sete posições — pré-condição');

  a.v('ctx.alternaCadencia', 0);
  await a.esperar();
  const depois = a.S().cadencia;
  assert.strictEqual(depois.length, 7, 'continua com sete');
  assert.notStrictEqual(depois[0], antes[0], 'o domingo virou');
  assert.ok(depois[0] === 'treino' || depois[0] === 'descanso',
    'para o outro dos dois valores, nunca para um terceiro: ' + depois[0]);
  assert.deepStrictEqual(depois.slice(1), antes.slice(1),
    'e os outros seis dias não foram tocados');

  a.v('ctx.alternaCadencia', 0);
  await a.esperar();
  assert.deepStrictEqual(a.S().cadencia, antes, 'o mesmo verbo devolve: é alternar, não setar');
  a.fechar();
});

test('ctx.marcaCompra liga e desliga o comprado item por item, sem tirar a linha da lista', async () => {
  const a = await app({ aba: 'prescricao' });
  const linhas = a.vJ('ctx.compras').linhas.length;
  assert.ok(linhas > 5, 'a lista de compras tem linhas: ' + linhas);
  assert.deepStrictEqual(a.S().compras.comprado, {}, 'nada comprado — pré-condição');

  a.v('ctx.marcaCompra', 'arroz');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.compras').comprado.arroz, 1, 'o arroz ficou marcado');
  assert.strictEqual(a.vJ('ctx.compras').linhas.length, linhas,
    'e a linha FICA na lista: marcar é riscar, não remover — remover é outra porta');
  assert.deepStrictEqual(Object.keys(a.S().compras.comprado), ['arroz'],
    'nenhum outro item foi marcado de carona');
  assert.deepStrictEqual(a.S().compras.removidas, {}, 'e nada foi removido da lista');

  a.v('ctx.marcaCompra', 'arroz');
  await a.esperar();
  assert.strictEqual(a.S().compras.comprado.arroz, undefined,
    'o mesmo verbo desmarca, apagando a chave em vez de gravar 0');
  a.fechar();
});

test('ctx.setHorizonteCompras muda o horizonte e a lista recalcula em cima dele', async () => {
  const a = await app({ aba: 'prescricao' });
  const antes = a.vJ('ctx.compras');
  assert.strictEqual(antes.dias, 7, 'o horizonte nasce em uma semana');
  assert.strictEqual(antes.previsao.treino + antes.previsao.descanso, 7,
    'e a previsão reparte os sete dias entre treino e descanso');
  const arrozAntes = antes.linhas.filter(function (l) { return l.f === 'arroz'; })[0];
  a.v('ctx.marcaCompra', 'arroz');
  await a.esperar();

  a.v('ctx.setHorizonteCompras', 14);
  await a.esperar();
  const depois = a.vJ('ctx.compras');
  assert.strictEqual(depois.dias, 14, 'o horizonte mudou');
  assert.strictEqual(a.S().compras.dias, 14, 'e ficou no estado, não só na leitura');
  assert.strictEqual(depois.previsao.treino + depois.previsao.descanso, 14,
    'a previsão acompanhou');
  const arrozDepois = depois.linhas.filter(function (l) { return l.f === 'arroz'; })[0];
  assert.ok(arrozDepois.pronto > arrozAntes.pronto,
    'e a quantidade a comprar subiu com o horizonte: ' + arrozAntes.pronto + ' → ' + arrozDepois.pronto);

  assert.strictEqual(a.S().compras.comprado.arroz, 1,
    'o que ele já marcou como comprado sobrevive à troca de horizonte');
  a.fechar();
});

