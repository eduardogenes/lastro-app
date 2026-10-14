// O turno na tela: escolher no botão PREVISTO e ver o diário responder.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function noHoje(estado) {
  const a = await app(estado ? { estado: estado } : {});
  a.aba('agora');
  await a.esperar();
  return a;
}

/** Garante que hoje é dia de treino, e abre a folha do botão PREVISTO. */
async function abreFolha(a) {
  a.E('diaDeComida().cadencia = "treino"');
  a.v('render');
  await a.esperar();
  a.clicar('[data-a="tipo-do-dia"]');
  await a.esperar();
}

test('o botão PREVISTO oferece os três turnos, com a hora de cada um', async () => {
  const a = await noHoje();
  await abreFolha(a);
  const ops = a.$$('.fd-turno-op').map(b => b.textContent.replace(/\s+/g, ' ').trim());
  assert.strictEqual(ops.length, 3);
  assert.ok(ops[0].indexOf('manhã') >= 0 && ops[0].indexOf('06:15') >= 0,
    'a manhã mostra a hora do PLANO: ' + ops[0]);
  assert.ok(ops[1].indexOf('12:15') >= 0, ops[1]);
  assert.ok(ops[2].indexOf('18:15') >= 0, ops[2]);
  a.fechar();
});

test('cada opção diz de antemão qual refeição vira o pós-treino', async () => {
  const a = await noHoje();
  await abreFolha(a);
  const t = a.vJ('ctx.seletorDeDia').turnos;
  assert.strictEqual(t[0].pos, 'Café da manhã');
  assert.strictEqual(t[1].pos, 'Almoço');
  assert.strictEqual(t[2].pos, 'Jantar',
    'ver a consequência antes de tocar é o que torna isto uma decisão');
  a.fechar();
});

test('escolher o turno reordena o diário', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);          // noite
  await a.esperar();

  const linhas = a.$$('.ins-tl-hora, .tl-hora').map(e => e.textContent.trim());
  const ordem = a.vJ('ctx.hoje').refs.map(function (r) { return r.t + ' ' + r.id; });
  assert.deepStrictEqual(ordem, [
    '08:00 pos', '12:30 almoco', '16:00 lanche', '17:45 pre', '18:15 treino', '19:45 jantar',
    '21:30 ceia'
  ], 'o pré e o treino andam, o café fica às 8h, e o jantar sai de dentro da sessão');
  assert.ok(linhas.length === 0 || linhas.length === ordem.length);
  a.fechar();
});

test('o selo de pós-treino aparece na refeição certa', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);
  await a.esperar();
  // O selo tem elemento próprio: colado no nome ele virava "Almoço · pós-tr…",
  // porque o nome corta com reticências e o papel é o que não pode ser cortado.
  const comSelo = a.$$('.ag-l').filter(function (l) { return l.querySelector('.ag-l-n small'); });
  assert.strictEqual(comSelo.length, 1, 'um papel, uma refeição');
  assert.strictEqual(comSelo[0].querySelector('.ag-l-n').childNodes[0].textContent, 'Jantar',
    'à noite o jantar recebe o papel');
  assert.strictEqual(comSelo[0].querySelector('.ag-l-n small').textContent, 'pós-treino');
  assert.strictEqual(a.vJ('ctx.hoje').posTreino, 'jantar');
  a.fechar();
});

test('o turno é ajuste de HOJE: o plano não se move', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[1]);          // tarde
  await a.esperar();
  assert.strictEqual(a.S().dia.turno, 'tarde', 'mora no dia, que zera com a data');
  const plano = a.vJ('planoDeComida').map(function (r) { return r.t + ' ' + r.id; });
  assert.deepStrictEqual(plano.slice(0, 2), ['05:45 pre', '06:15 treino'],
    'em COMIDA a edição vale para todo dia — e ela não aconteceu');
  a.fechar();
});

test('o almoço que não cabe no treino vai para depois dele', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[1]);          // tarde: treino 12:15
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.hoje').refs.filter(function (r) { return r.id === 'almoco'; })[0].t,
    '13:45', 'não se antecipa o almoço nem se come no meio do treino');
  const nota = a.texto('.hj-conflito');
  assert.ok(nota && /Almoço foi para as 13:45/.test(nota),
    'não é aviso: é a procedência de um horário que não bate com o plano — ' + nota);
  assert.strictEqual(a.vJ('ctx.hoje').posTreino, 'almoco',
    'e é ele que carrega o papel de pós-treino');
  a.fechar();
});

test('voltar para a manhã desfaz o deslocamento', async () => {
  const a = await noHoje();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[2]);
  await a.esperar();
  await abreFolha(a);
  a.clicar(a.$$('.fd-turno-op')[0]);
  await a.esperar();
  // `E` e não `J`: JSON.stringify(undefined) não é JSON, e ausência é o ponto
  assert.strictEqual(a.S().dia.turno, undefined, 'manhã é a ausência de deslocamento');
  assert.strictEqual(a.E('"turno" in S.dia'), false, 'a chave sai, não fica como null');
  assert.strictEqual(a.vJ('ctx.hoje').refs[0].t, '05:45');
  a.fechar();
});

test('em dia de descanso o turno não é oferecido', async () => {
  const a = await noHoje();
  a.E('diaDeComida().cadencia = "descanso"');
  a.v('render');
  await a.esperar();
  a.clicar('[data-a="tipo-do-dia"]');
  await a.esperar();
  assert.strictEqual(a.$$('.fd-turno-op').length, 0,
    'sem treino não há turno de treino a escolher');
  a.fechar();
});

test('a migração 7→8 tira o papel do nome, e só do nome que era dela', async () => {
  const a = await app({ estado: { plano: 7, comida: {
    plano: [{ id: 'pos', t: '08:00', n: 'Café da manhã / pós-treino',
              tag: '', quando: 'sempre', itens: [] }],
    alimentos: {}, ocultos: {} } } });
  assert.strictEqual(a.S().comida.plano[0].n, 'Café da manhã');
  assert.strictEqual(a.S().plano, a.dado('PLANO_ATUAL'));
  a.fechar();

  const b = await app({ estado: { plano: 7, comida: {
    plano: [{ id: 'pos', t: '08:00', n: 'Meu café',
              tag: '', quando: 'sempre', itens: [] }],
    alimentos: {}, ocultos: {} } } });
  assert.strictEqual(b.S().comida.plano[0].n, 'Meu café',
    'se ele já tinha renomeado, o nome dele fica');
  b.fechar();
});

// ---------------------------------------------------------------------------
// Os dois ajustes do dia, por valor: `setTurno` e `setAlta`
// ---------------------------------------------------------------------------
//
// O QUE ESTE GRUPO PROVA: que os dois ajustes de HOJE são alcançáveis pelo
// MODELO, que cada um grava onde diz gravar, e que nenhum dos dois encosta no
// PLANO — a distinção entre "ajuste de hoje" e "plano de todo dia" é a lei 6
// do sistema, e aqui ela está medida em vez de comentada.
//
// Os casos acima deste bloco entram pelo dedo, clicando em `.fd-turno-op`.
// Estes entram por nome e valor, e é essa a diferença: eles sobrevivem à
// reescrita da folha.
//
// O QUE ESTE GRUPO NÃO PROVA: que a folha nova ofereça os três turnos, nem que
// o botão de alta demanda exista. `a.v('ctx.setTurno', 'noite')` prova que o
// modelo aceita a escolha; não prova que há onde tocar. Nada aqui conta botões.

test('ctx.setTurno grava o turno de hoje e fecha a folha, e a manhã apaga a chave', async () => {
  const a = await noHoje();
  const planoAntes = JSON.stringify(a.S().comida.plano);
  await abreFolha(a);
  assert.strictEqual(a.$$('.ins-folha').length, 1, 'a folha do PREVISTO está aberta');

  a.v('ctx.setTurno', 'noite');
  await a.esperar(150);
  assert.strictEqual(a.S().dia.turno, 'noite', 'o turno ficou no dia');
  assert.strictEqual(a.vJ('ctx.seletorDeDia').turno, 'noite', 'e a leitura concorda');
  assert.strictEqual(a.$$('.ins-folha').length, 0,
    'a folha fecha no mesmo gesto: escolher é a saída, não um passo antes dela');

  a.v('ctx.setTurno', 'manha');
  await a.esperar();
  assert.ok(!('turno' in a.S().dia),
    'voltar para a manhã APAGA a chave em vez de gravar "manha" — o padrão não ocupa estado');
  assert.strictEqual(a.vJ('ctx.seletorDeDia').turno, 'manha',
    'e a leitura ainda responde "manha", porque é o padrão, não o gravado');

  a.v('ctx.setTurno', 'tarde');
  await a.esperar();
  assert.strictEqual(a.S().dia.turno, 'tarde');
  a.v('ctx.setTurno', null);
  await a.esperar();
  assert.ok(!('turno' in a.S().dia), 'e nulo também devolve ao padrão, sem gravar lixo');

  assert.strictEqual(JSON.stringify(a.S().comida.plano), planoAntes,
    'e nada disso tocou o PLANO: o turno é ajuste de hoje, e zera com a data');
  a.fechar();
});

test('ctx.setAlta liga a demanda alta do dia, e o alvo do dia soma o intra-treino', async () => {
  const a = await noHoje({ cadencia: ['treino','treino','treino','treino','treino','treino','treino'] });
  const planoAntes = JSON.stringify(a.S().comida.plano);
  const alvoAntes = a.vJ('ctx.hoje').alvo.kcal;
  assert.strictEqual(a.S().dia.alta, 0, 'o dia nasce sem alta demanda');
  assert.strictEqual(a.vJ('ctx.hoje').alta, false, 'e a leitura de HOJE concorda');

  a.v('ctx.setAlta', 1);
  await a.esperar();
  assert.strictEqual(a.S().dia.alta, 1, 'ligou no dia');
  assert.strictEqual(a.vJ('ctx.hoje').alta, true);
  assert.strictEqual(a.vJ('ctx.seletorDeDia').alta, true, 'as duas leituras do dia concordam');
  const alvoDepois = a.vJ('ctx.hoje').alvo.kcal;
  assert.ok(alvoDepois > alvoAntes,
    'e o ALVO do dia sobe: o carboidrato marcado como "alta" passa a contar — ' +
    Math.round(alvoAntes) + ' → ' + Math.round(alvoDepois));

  a.v('ctx.setAlta', 0);
  await a.esperar();
  assert.strictEqual(a.S().dia.alta, 0, 'e desliga');
  assert.strictEqual(Math.round(a.vJ('ctx.hoje').alvo.kcal), Math.round(alvoAntes),
    'devolvendo o alvo ao número de antes');

  // qualquer coisa verdadeira liga; qualquer coisa falsa desliga — e grava 1/0,
  // não o que veio: o estado vai para o backup e para a fusão.
  a.v('ctx.setAlta', 'sim');
  await a.esperar();
  assert.strictEqual(a.S().dia.alta, 1, 'o verbo normaliza para 1 em vez de guardar o texto');
  a.v('ctx.setAlta', null);
  await a.esperar();
  assert.strictEqual(a.S().dia.alta, 0, 'e para 0 em vez de guardar null');

  assert.strictEqual(JSON.stringify(a.S().comida.plano), planoAntes,
    'nada disso tocou o PLANO: alta demanda é do dia, e o malto continua no plano de todo dia');
  a.fechar();
});

// ---------------------------------------------------------------------------
// Os quatro campos de `ctx.hoje()` que nada media
// ---------------------------------------------------------------------------
//
// Último degrau do critério desta passada (quanto custa uma quebra em
// silêncio): aqui nada se perde e nada se grava. O que se perde é a VERDADE da
// tela de HOJE — `catalogo` e `comidaDoDia` são o que a timeline usa para
// escrever cada linha, `movidas` é a procedência de um horário que não bate com
// o plano, e `cadenciaTxt` é a frase que diz qual plano está em vigor. Quebrados
// em silêncio, a tela some, mostra número errado, ou cala a explicação de um
// horário estranho — e nada fica vermelho.
//
// CORREÇÃO DE UMA AFIRMAÇÃO DO BRIEFING: os quatro NÃO são chaves de `CTX`.
// São campos do registro que `CTX.hoje()` devolve (`src/main.jsx`, dentro do
// literal do `CTX`), e por isso entram por `a.vJ('ctx.hoje')` e não por
// `a.v('ctx.catalogo')` — que estouraria com "verbo fora da superfície".
//
// O QUE ESTE GRUPO NÃO COBRE: que a timeline esteja desenhando estes quatro
// campos. Chamar a leitura prova que a capacidade existe no MODELO.

test('ctx.hoje traz o catálogo efetivo de alimentos, com o que ELE cadastrou dentro', async () => {
  const a = await noHoje();
  const cat = a.vJ('ctx.hoje').catalogo;
  assert.ok(cat.arroz, 'o catálogo do código está lá');
  assert.strictEqual(cat.arroz.n, 'Arroz branco cozido');
  assert.strictEqual(typeof cat.arroz.kcal, 'number', 'com a grandeza que a linha soma');

  // cadastrar um alimento o põe aqui, porque a leitura usa o catálogo EFETIVO
  a.v('ctx.salvaAlimento', null, { n: 'Tapioca', cat: 'mercearia', u: 'g',
                                   kcal: 120, p: 0.2, c: 29, g: 0.1, cru: 0 });
  await a.esperar();
  const depois = a.vJ('ctx.hoje').catalogo;
  assert.ok(depois.tapioca, 'o que ele cadastrou entra no mesmo mapa: ' + Object.keys(depois).length);
  assert.strictEqual(depois.tapioca.meu, 1, 'marcado como dele');

  // e esconder um da prescrição o tira daqui
  a.recusar();
  a.v('ctx.removeAlimento', 'arroz');
  a.aceitar();
  a.v('ctx.removeAlimento', 'arroz');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.hoje').catalogo.arroz, undefined,
    'o escondido sai do catálogo que a tela consome');
  a.fechar();
});

test('ctx.hoje traz o dia de comida ABERTO, e ele é o mesmo objeto que os verbos mexem', async () => {
  const a = await noHoje();
  const dia = () => a.vJ('ctx.hoje').comidaDoDia;
  assert.ok(dia().data, 'o dia aberto tem data: ' + dia().data);
  assert.deepStrictEqual(dia().done, {}, 'e nasce sem refeição marcada');
  assert.strictEqual(dia().agua, 0, 'e sem água');

  a.v('ctx.marcaRefeicao', 'almoco');
  await a.esperar();
  assert.ok(dia().done.almoco > 0,
    'marcar o almoço aparece aqui, e grava o INSTANTE — é o que a lápide compara');

  a.v('ctx.setAgua', 3);
  await a.esperar();
  assert.strictEqual(dia().agua, 3, 'a água também');
  assert.strictEqual(dia().data, a.S().dia.data, 'e é o dia de `S`, não uma cópia de outro lugar');
  a.fechar();
});

test('ctx.hoje explica o horário que o treino empurrou, em movidas', async () => {
  // Refeição que caía dentro do treino vai para depois dele. Não é aviso: é a
  // PROCEDÊNCIA de um horário que não bate com o plano, e sem ela a tela mostra
  // um relógio diferente do prescrito sem dizer por quê.
  const a = await noHoje();
  a.E('diaDeComida().cadencia = "treino"');
  a.v('render');
  await a.esperar();
  assert.deepStrictEqual(a.vJ('ctx.hoje').movidas, [],
    'de manhã nada é empurrado — pré-condição');

  a.v('ctx.setTurno', 'tarde');
  await a.esperar();
  const movidas = a.vJ('ctx.hoje').movidas;
  assert.ok(movidas.length > 0, 'treinando à tarde, alguma refeição foi empurrada');
  assert.ok(movidas.every(function (m) { return m.id && /foi para as \d\d:\d\d, depois do treino/.test(m.txt); }),
    'cada uma com id e a frase da procedência: ' + JSON.stringify(movidas));
  // e a frase cita o horário que a própria leitura publica para aquela linha
  const ref = a.vJ('ctx.hoje').refs.filter(function (r) { return r.id === movidas[0].id; })[0];
  assert.ok(movidas[0].txt.indexOf(ref.t) >= 0,
    'o horário na frase é o mesmo da refeição: ' + movidas[0].txt + ' vs ' + ref.t);

  a.v('ctx.setTurno', 'manha');
  await a.esperar();
  assert.deepStrictEqual(a.vJ('ctx.hoje').movidas, [], 'voltar para a manhã desfaz');
  a.fechar();
});

test('ctx.hoje diz qual plano está em vigor, e se o dia é palpite, em cadenciaTxt', async () => {
  const a = await noHoje();
  const txt = () => a.vJ('ctx.hoje').cadenciaTxt;
  assert.strictEqual(txt(), 'plano base · dia previsto pela cadência da semana',
    'sem ajuste e sem confirmação: o plano é o base, e o dia é palpite da cadência');

  // Confirmar o dia tira o "previsto" da frase. Quem confirma é
  // `setCadenciaDeHoje`, e não `setTurno`: escolher o turno diz QUANDO é o
  // treino, não SE ele é hoje.
  a.v('ctx.setTurno', 'tarde');
  await a.esperar();
  assert.strictEqual(txt(), 'plano base · dia previsto pela cadência da semana',
    'escolher o turno não confirma o dia — ele segue palpite da cadência');
  a.v('ctx.setCadenciaDeHoje', 'treino');
  await a.esperar();
  assert.strictEqual(txt(), 'plano base · dia confirmado',
    'ele disse que hoje é treino, então a frase para de chamar o dia de palpite');

  // e o ajuste calórico em vigor entra na mesma frase
  a.E('S.ajuste = 1');
  a.v('render');
  assert.strictEqual(txt(), 'ajuste +150 kcal · dia confirmado');
  a.E('S.ajuste = -2');
  a.v('render');
  assert.strictEqual(txt(), 'ajuste −300 kcal · 2 passos · dia confirmado',
    'dois passos são o dobro, e a frase conta os passos — com o menos tipográfico');
  a.fechar();
});
