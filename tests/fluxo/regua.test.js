// A RÉGUA DE REPETIÇÕES, na tela.
//
// A ação mais frequente do produto: 48 registros de série por semana, de pé, com
// uma mão, entre duas séries. O dono escolheu a régua (decisão 8) e a frente 2
// §1 escreveu o conserto em sete requisitos; o domínio provou o ALCANCE
// (`tests/dominio/regua.test.ts`), e aqui ficam os que só a tela mostra.
//
// O que NÃO está medido, e nenhum destes casos substitui: o toque engolido e o
// erro de alvo (medição A) exigem o aparelho e o dedo dele, "idealmente suado".
// Jsdom não tem dedo. O que os casos abaixo seguram é que as ESCOLHAS de desenho
// que respondem àquelas medições continuem de pé.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

const DIA = 86400000;

/** O mesmo estado dos casos de série: uma sessão de uma semana atrás. */
function comHistorico(sets) {
  const agora = Date.UTC(2025, 0, 8, 15, 0, 0);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: sets || [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

/** Os números que a régua está mostrando agora, em ordem. */
function visiveis(a) {
  return a.$$('.regua-v').map(function (b) { return Number(b.textContent.replace(/\D+/g, '')); });
}

async function abreCartao(opcoes) {
  const a = await app(opcoes || comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();
  return a;
}

test('a repetição é botão, e o toque abre a régua', async () => {
  // A decisão 8: registrar repetição é tocar num número. O teclado numérico
  // cobria metade da tela no meio da série — é a razão que já estava escrita no
  // fonte para o RIR ser botão, e ela vale igual aqui.
  const a = await abreCartao();
  const alvo = a.doc.getElementById('r0_0');
  assert.strictEqual(alvo.tagName, 'BUTTON', 'o campo de repetição virou botão');
  assert.strictEqual(a.$('.regua-faixa'), null, 'e a régua não está aberta antes do toque');

  a.clicar(alvo);
  await a.esperar();
  assert.ok(a.$('.regua-faixa'), 'o toque abriu a régua');
  assert.ok(visiveis(a).length >= 4, 'com números para escolher: ' + visiveis(a).join(','));
  a.fechar();
});

test('tocar num número registra a série e fecha a régua', async () => {
  const a = await abreCartao();
  a.v('anotaSerie', 0, 0, 0, 60);   // a carga é botão: entra pela porta por valor
  await a.regua(0, 0, 9);

  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 9, 'a repetição entrou');
  assert.strictEqual(a.$('.regua-faixa'), null, 'e a régua fechou: o segundo toque é a escolha');
  assert.strictEqual(a.doc.getElementById('r0_0').textContent, '9', 'o botão mostra o valor');
  a.fechar();
});

test('a régua diz qual número foi a última vez', async () => {
  // É o que a torna régua e não teclado: ele vê onde estava antes de escolher
  // onde está. A série 1 fez 8 na semana passada.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();

  const marcado = a.$$('.regua-v').filter(function (b) { return b.querySelector('.regua-marca'); });
  assert.strictEqual(marcado.length, 1, 'uma marca, não várias');
  assert.strictEqual(Number(marcado[0].textContent.replace(/\D+/g, '')), 8,
    'e é o 8, que é o que ele fez nesta mesma série');
  a.fechar();
});

test('sem histórico a régua não mente sobre a última vez', async () => {
  // Dizer "última" sobre um número que ele nunca fez seria o app inventando
  // dado. Sem histórico a régua abre na base da faixa prescrita, que é onde o
  // treinador manda recomeçar, e a marca não aparece.
  const a = await abreCartao({ estado: { logs: {}, done: [] } });
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  assert.ok(a.$('.regua-faixa'), 'a régua abre mesmo sem histórico');
  assert.strictEqual(a.$('.regua-marca'), null, 'e sem marca de "última"');
  a.fechar();
});

test('a seta anda uma JANELA, e não um valor', async () => {
  // É a escolha que a medição B força: de um em um, o valor mais distante de uma
  // régua de 13 custaria 7 toques, e a medição reprova acima de 3.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  const antes = visiveis(a);

  a.clicar(a.$('[data-a="regua-mais"]'));
  await a.esperar();
  const depois = visiveis(a);

  assert.ok(depois[0] - antes[0] > 1,
    'andou ' + (depois[0] - antes[0]) + ' valor(es): um por toque reprova a medição B');
  assert.deepStrictEqual(antes.filter(function (v) { return depois.indexOf(v) >= 0; }).length > 0,
    true, 'e não pulou a régua inteira: há sobreposição para não perder o fio');
  a.fechar();
});

test('a seta não mostra número nenhum', async () => {
  // Erro de alvo tem tolerância ZERO na medição A, e um botão que mostra `12` e
  // não registra 12 é a definição de erro de alvo. Por isso a seta é seta.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();

  const setas = a.$$('[data-a="regua-mais"], [data-a="regua-menos"]');
  assert.ok(setas.length >= 1, 'há seta: a régua é maior que a janela');
  setas.forEach(function (s) {
    assert.ok(!/\d/.test(s.textContent), 'a seta mostra "' + s.textContent.trim() + '"');
    assert.ok(/mostrar/.test(s.getAttribute('aria-label') || ''),
      'e o nome acessível dela diz o trecho que ela revela: ' + s.getAttribute('aria-label'));
  });
  a.fechar();
});

test('a janela sobrevive a um repinte', async () => {
  // A medição C, escrita como caso. No protótipo o relógio de parede chamava
  // `render()` a cada virada de minuto, o `innerHTML` destruía a faixa e
  // `centrarStrip()` a recentrava: o arrasto dele tinha validade de no máximo um
  // minuto, e a perda chegava num instante que ele não controlava.
  //
  // Aqui a posição é derivada do foco (R4), então repintar reconstrói a MESMA
  // página. É a causa 3 da §1.2 morta por construção.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  a.clicar(a.$('[data-a="regua-menos"]'));
  await a.esperar();
  const antes = visiveis(a);

  await a.pintar();
  assert.deepStrictEqual(visiveis(a), antes, 'o repinte moveu a janela');

  await a.pintar();
  assert.deepStrictEqual(visiveis(a), antes, 'e nem o segundo');
  a.fechar();
});

test('fechar o cartão e reabrir não herda a janela de antes', async () => {
  // R5: "a régua não pode guardar posição em variável de módulo que sobreviva à
  // desmontagem — se guardar, a próxima montagem herda a janela de uma sessão
  // que acabou". O foco nasce da referência a cada abertura.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  const inicial = visiveis(a);

  a.clicar(a.$('[data-a="regua-menos"]'));
  await a.esperar();
  assert.notDeepStrictEqual(visiveis(a), inicial, 'pré-condição: a janela andou');

  a.v('toggle', 0);                       // fecha o cartão
  await a.esperar();
  a.v('toggle', 0);                       // e reabre
  await a.esperar();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  assert.deepStrictEqual(visiveis(a), inicial,
    'a régua reabriu onde a de antes tinha parado');
  a.fechar();
});

test('tocar de novo no valor escolhido apaga', async () => {
  // O campo apagava com `''`, e `anotaSerie` diz por escrito que esse gesto "tem
  // de continuar existindo". A régua não tem campo para esvaziar, então o gesto
  // passa a ser o segundo toque — o mesmo desenho do RIR.
  const a = await abreCartao();
  a.v('anotaSerie', 0, 0, 0, 60);   // a carga é botão: entra pela porta por valor
  await a.regua(0, 0, 9);
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 9);

  await a.regua(0, 0, 9);
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), null, 'o segundo toque apagou');
  assert.strictEqual(a.doc.getElementById('r0_0').textContent, '·',
    'e o botão volta a dizer que não há valor');
  a.fechar();
});

test('o valor registrado aparece escolhido na régua', async () => {
  const a = await abreCartao();
  a.v('anotaSerie', 0, 0, 0, 60);   // a carga é botão: entra pela porta por valor
  await a.regua(0, 0, 9);

  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  const ligado = a.$$('.regua-v').filter(function (b) { return b.className.includes('on'); });
  assert.strictEqual(ligado.length, 1, 'um escolhido');
  assert.strictEqual(Number(ligado[0].textContent.replace(/\D+/g, '')), 9);
  assert.strictEqual(ligado[0].getAttribute('aria-pressed'), 'true',
    'e o estado chega a quem usa leitor de tela');
  a.fechar();
});

test('a porta "outro valor" abre o teclado próprio', async () => {
  // §6.1 manda teclado PRÓPRIO na repetição fora da régua, e agora ele existe
  // (§6.2). O caminho é raro por construção — a régua carrega a vizinhança da
  // última vez e a faixa do treinador inteira —, mas sem ele uma repetição de
  // fora não teria como ser registrada.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();

  a.clicar(a.$('[data-a="regua-outro"]'));
  await a.esperar();
  assert.ok(a.$('.tcl-grade'), 'o teclado próprio abriu');
  assert.strictEqual(a.$('.regua-faixa'), null, 'e a régua saiu do lugar');
  assert.strictEqual(a.$('[data-a="tcl-virgula"]'), null,
    'repetição é inteira: a tecla de vírgula não existe, porque tecla que não ' +
    'faz nada é falso sucesso');

  a.v('anotaSerie', 0, 0, 0, 60);   // a carga é botão: entra pela porta por valor
  a.clicar(a.$('[data-a="tcl-2"]'));
  await a.esperar();
  a.clicar(a.$('[data-a="tcl-7"]'));
  await a.esperar();
  assert.strictEqual(a.E('(draftPeek(0).s[0] || [])[1]'), 27,
    'o valor de fora da régua entra');
  assert.ok(a.texto('.tcl-visor').includes('27'), 'e o visor mostra o que foi digitado');
  a.fechar();
});

test('só uma coisa abre embaixo da linha', async () => {
  // Duas abertas devolvem a rolagem que o painel existe para tirar, e a régua e
  // a escala de RIR disputam o mesmo lugar.
  const a = await abreCartao();
  a.clicar(a.doc.getElementById('q0_0'));          // o botão de RIR da série 1
  await a.esperar();
  assert.ok(a.$('.rirscale'), 'pré-condição: a escala de RIR está aberta');

  a.clicar(a.doc.getElementById('r0_0'));
  await a.esperar();
  assert.ok(a.$('.regua-faixa'), 'a régua abriu');
  assert.strictEqual(a.$('.rirscale'), null, 'e a escala saiu');
  a.fechar();
});

test('exercício medido por tempo continua com campo', async () => {
  // A régua é de REPETIÇÃO. Em metro, caloria ou segundo o valor não é um número
  // curto de faixa conhecida — 500 m não cabe numa régua de onze valores.
  const a = await abreCartao();
  const comUnidade = a.E('treino(view.day).ex.findIndex(function (e) { return !!unidadeDe(e); })');
  if (comUnidade < 0) {
    // O Treino A pode não ter movimento medido: aí o caso prova o contrário —
    // que a régua está em todas as linhas dele, e não que ela nunca cede.
    assert.ok(a.E('vmExercicio(view.day, 0, treino(view.day).ex[0]).temRegua'),
      'sem movimento medido no dia, toda linha tem régua');
    a.fechar();
    return;
  }
  a.v('toggle', comUnidade);
  await a.esperar();
  const campo = a.doc.getElementById('r' + comUnidade + '_0');
  assert.strictEqual(campo.tagName, 'INPUT', 'medido por tempo ou metro: campo');
  a.fechar();
});
