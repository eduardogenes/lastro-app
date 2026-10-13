// Registrar uma série: o que acontece entre encostar no telefone e o descanso
// começar. É a interação de maior frequência do produto e a que acontece no
// pior contexto — de pé, com uma mão, entre duas séries.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/**
 * Uma sessão anterior do treino A, para que exista coluna ANTERIOR — e a
 * rotação parada de forma que o PRÓXIMO dia seja o A.
 *
 * A presença é registrada em HX, o último da rotação, de propósito: registrá-la
 * em A empurraria a rotação para o B, `iniciarSessao()` abriria o treino de
 * pernas, e os campos `w0_0`/`r0_0` passariam a ser de outro exercício — que é
 * como este arquivo mediu errado da primeira vez.
 *
 * A chave `A0` é a forma posicional antiga: a migração do boot a reindexa para
 * o id do exercício, que é onde o histórico mora hoje.
 */
function comHistorico() {
  const agora = agoraEstavel(8);
  return {
    estado: {
      logs: { A0: [{ t: agora - 7 * DIA, sid: 1, sets: [[60, 8], [60, 7], [60, 6]] }] },
      done: [{ day: 'HX', t: agora - 7 * DIA, sid: 1, dur: 3600000 }]
    },
    agora: agora
  };
}

test('o descanso começa em QUALQUER série, não só na última', async () => {
  // Começava só na última do exercício, e isso deixava sem cronômetro a espera
  // mais frequente da sessão: a que separa a série 1 da 2.
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  a.preencher(0, 0, 60, 8);
  await a.esperar();
  assert.ok(a.$('#timer').classList.contains('on'),
    'a série 1 de 3 dispara o descanso');
  assert.notStrictEqual(a.texto('#tval'), '0:00', 'e ele está contando');

  a.v('stopTimer');
  a.preencher(0, 1, 60, 8);
  await a.esperar();
  assert.ok(a.$('#timer').classList.contains('on'),
    'a série 2 de 3 também');
  a.fechar();
});

test('apagar o campo rearma o disparo daquela série, e só dela', async () => {
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  a.preencher(0, 0, 60, 8);
  await a.esperar();
  a.v('stopTimer');

  // mexer de novo na MESMA série não redispara
  await a.regua(0, 0, 9);
  assert.ok(!a.$('#timer').classList.contains('on'),
    'corrigir a repetição não redispara o descanso');

  // REESCRITO: o gesto de apagar mudou de forma, não de existência. O campo
  // apagava com `''`; a régua não tem campo para esvaziar, então apagar é tocar
  // DE NOVO no valor que já está lá — o mesmo desenho do RIR, que o app já fazia
  // assim. O comportamento que este caso protege é o outro, e ele não mudou:
  // apagar REARMA o disparo daquela série.
  await a.regua(0, 0, 9);                       // o mesmo valor: apaga
  assert.strictEqual((a.vJ('draftPeek', 0).s[0] || [])[1], null, 'a repetição saiu');
  await a.regua(0, 0, 8);
  assert.ok(a.$('#timer').classList.contains('on'),
    'completar de novo depois de apagar dispara');
  a.fechar();
});

test('tocar na coluna ANTERIOR registra a série inteira', async () => {
  // A coluna já mostrava exatamente o que ia ser digitado. Era um `div` inerte,
  // e os dois números iam para o teclado virtual assim mesmo.
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  const botao = a.$('[data-ex="0"] .setant-b');
  assert.ok(botao, 'a coluna anterior é um botão');
  assert.ok(/repetir a série 1 anterior/.test(botao.getAttribute('aria-label')),
    'e diz o que faz para quem não a enxerga');

  a.clicar(botao);
  await a.esperar();

  assert.strictEqual(a.doc.getElementById('w0_0').textContent, '60', 'carga preenchida');
  // A repetição deixou de ser campo: o valor é o TEXTO do botão que abre a
  // régua. O `id` é o mesmo de propósito, para quem procura o lugar.
  assert.strictEqual(a.doc.getElementById('r0_0').textContent, '8', 'repetição preenchida');
  const log = a.log('A', 0);
  assert.deepStrictEqual(log[log.length - 1].sets[0], [60, 8], 'a série entrou no histórico');
  assert.ok(a.$('#timer').classList.contains('on'),
    'e o descanso começou pelo caminho normal');
  a.fechar();
});

test('sem histórico não há o que copiar, e a coluna volta a ser inerte', async () => {
  const a = await app();
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();
  assert.ok(!a.$('[data-ex="0"] .setant-b'), 'nada de botão que não faria nada');
  a.fechar();
});

test('todo controle do cartão de exercício tem nome acessível', async () => {
  // Eram seis campos de texto idênticos, sem grandeza e sem número de série:
  // o cartão mais usado do produto, ilegível no VoiceOver.
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  const cartao = a.$('[data-ex="0"]');
  const semNome = Array.from(cartao.querySelectorAll('button,input')).filter(function (el) {
    return !((el.textContent || '').trim() || el.getAttribute('aria-label'));
  });
  assert.deepStrictEqual(
    semNome.map(function (el) { return el.id || el.className; }), [],
    'nenhum controle sem nome'
  );
  assert.strictEqual(
    a.doc.getElementById('w0_0').getAttribute('aria-label'),
    'registrar carga da série 1, kg',
    'vazio o botão diz o verbo; preenchido ele diz o valor');
  // O botão da régua diz MAIS do que o campo dizia: vazio ele diz o verbo
  // ("registrar"), porque um botão sem valor não anuncia nada ao ser lido;
  // preenchido ele diz o valor, que é o que o campo ecoava por ser campo.
  assert.strictEqual(
    a.doc.getElementById('r0_0').getAttribute('aria-label'),
    'registrar repetições da série 1');
  await a.regua(0, 0, 8);
  assert.strictEqual(
    a.doc.getElementById('r0_0').getAttribute('aria-label'),
    'Série 1: 8 repetições. Tocar para corrigir.',
    'preenchido, o valor E o que o toque faz (§8.1 da frente 3)');
  a.fechar();
});

test('o descanso sobrevive a fechar e reabrir o app', async () => {
  // O cronômetro já era escrito por instante-alvo para sobreviver à tela
  // apagada; o que faltava era o instante sobreviver ao processo.
  const agora = agoraEstavel(8);
  const a = await app({
    agora: agora,
    chaves: { 'lastro-descanso-v1': { fim: agora + 120000, total: 180 } }
  });
  await a.pronto();
  await a.esperar(60);

  assert.ok(a.$('#timer').classList.contains('on'),
    'o descanso religou no boot');
  assert.strictEqual(a.texto('#tval'), '2:00', 'com o tempo que faltava, não do zero');
  a.fechar();
});

test('descanso já vencido não ressuscita', async () => {
  const agora = agoraEstavel(8);
  const a = await app({
    agora: agora,
    chaves: { 'lastro-descanso-v1': { fim: agora - 60000, total: 180 } }
  });
  await a.pronto();
  await a.esperar(60);
  assert.ok(!a.$('#timer').classList.contains('on'),
    'um descanso que acabou ontem não volta à tela');
  a.fechar();
});

test('sair do app descarrega a gravação represada', async () => {
  // `queueSave()` represa 700 ms para não escrever a cada tecla. Fechar o app
  // dentro dessa janela perdia a série recém-digitada.
  const a = await app(comHistorico());
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  a.preencher(0, 0, 72, 9);
  // NÃO espera os 700 ms: é justamente a janela que estava desprotegida.
  Object.defineProperty(a.doc, 'hidden', { value: true, configurable: true });
  a.doc.dispatchEvent(new a.window.Event('visibilitychange'));
  await a.esperar(50);

  const disco = JSON.parse(a.window.localStorage.getItem('lastro-v1'));
  const chave = a.k('A', 0);
  const linhas = disco.logs[chave];
  assert.deepStrictEqual(
    linhas[linhas.length - 1].sets[0], [72, 9],
    'a série está em disco sem ter esperado o debounce'
  );
  a.fechar();
});

test('corrigir uma série depois de reabrir o app não inicia descanso', async () => {
  // O iOS fecha o app em segundo plano no meio do treino. A marca de "esta
  // série já disparou" vivia só em `view.fired`, que é memória: ao reabrir ela
  // nascia vazia, e corrigir uma série registrada quinze minutos antes
  // disparava um descanso de dois minutos para uma série que já acabou.
  const base = comHistorico();
  const a = await app(base);
  await a.pronto();
  a.v('iniciarSessao');
  await a.esperar();
  a.v('toggle', 0);
  await a.esperar();

  a.preencher(0, 0, 60, 9);
  await a.esperar();
  assert.ok(a.$('#timer').classList.contains('on'),
    'registrar a série 1 dispara o descanso, como sempre');

  // segundo plano: descarrega o que o debounce de 700 ms represou
  Object.defineProperty(a.doc, 'hidden', { value: true, configurable: true });
  a.doc.dispatchEvent(new a.window.Event('visibilitychange'));
  await a.esperar(50);
  const disco = a.gravado();
  a.fechar();

  // quinze minutos depois ele reabre e corrige a repetição daquela série
  const b = await app({ estado: disco, agora: base.agora + 15 * 60000 });
  await b.pronto();
  assert.strictEqual((b.S().sessao || {}).day, 'A', 'a sessão continua aberta');
  b.v('toggle', 0);
  await b.esperar();
  assert.strictEqual(b.doc.getElementById('r0_0').textContent, '9',
    'a série registrada antes de fechar está na tela');

  await b.regua(0, 0, 8);
  assert.ok(!b.$('#timer').classList.contains('on'),
    'corrigir 9 para 8 não começa descanso para uma série que acabou há quinze minutos');
  const log = b.log('A', 0);
  assert.deepStrictEqual(log[log.length - 1].sets[0], [60, 8], 'e a correção foi gravada');
  b.fechar();
});

// ---------------------------------------------------------------------------
// A SÉRIE GUARDADA É ANUNCIADA — R6 da frente 2
// ---------------------------------------------------------------------------
//
// A confirmação visual já existia e é boa: `voa()` anima o valor até a tabela.
// O que faltava era a metade auditiva — nenhuma das 94 chamadas de `toast()` é
// da gravação de série, e o `<input>` ecoava o valor por SER campo, o que deixa
// de valer no dia em que a régua de repetições substituir o campo.

test('gravar uma série anuncia o VALOR, não só "guardado"', async () => {
  // O valor dentro do anúncio é o ponto: um anúncio que diga só "guardado"
  // obriga quem usa leitor de tela a ir conferir o que foi guardado — que é
  // justamente o trabalho que o anúncio existe para poupar.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, 9);
  await a.esperar();

  const dito = a.doc.getElementById('serie-dita');
  assert.ok(dito, 'a região viva existe');
  assert.strictEqual(dito.getAttribute('aria-live'), 'polite',
    'informa, não interrompe — a mesma razão escrita do toast');
  assert.strictEqual(dito.getAttribute('role'), 'status');
  assert.strictEqual(dito.textContent, 'Guardei a série 1: 55 kg × 9.', 'o agente aparece, com o valor dentro');
  a.fechar();
});

test('o anúncio é invisível, e isso é decisão e não descuido', async () => {
  // Região própria e fora da tela: 48 toasts por semana competindo com o
  // cronômetro de descanso — que começa no mesmo instante — seriam ruído para
  // quem vê, para resolver um problema de quem não vê.
  //
  // E nunca `display: none` nem `visibility: hidden`: os dois tiram o nó da
  // árvore de acessibilidade, e com ele o anúncio.
  const a = await app();
  const regras = a.window.getComputedStyle(a.doc.getElementById('serie-dita'));
  assert.notStrictEqual(regras.display, 'none', 'display none tiraria o anúncio');
  assert.notStrictEqual(regras.visibility, 'hidden', 'visibility hidden também');
  assert.ok(a.doc.getElementById('serie-dita').className.includes('ins-so-leitor'),
    'usa a classe de só-leitor, que sai da tela sem sair da árvore');
  a.fechar();
});

test('corrigir uma série anuncia com palavra DIFERENTE de gravar', async () => {
  // O que mudou foi o valor, não o registro — e dizer "guardada" de novo faria
  // a correção soar como uma série a mais.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, 9);
  await a.esperar();
  assert.match(a.doc.getElementById('serie-dita').textContent, /^Guardei a série 1: /);

  a.preencher(0, 0, 60, null);
  await a.esperar();
  assert.match(a.doc.getElementById('serie-dita').textContent, /^Corrigi a série 1: 60 kg × 9/,
    a.doc.getElementById('serie-dita').textContent);
  a.fechar();
});

test('série incompleta não anuncia nada', async () => {
  // Meia série não é série: anunciar "55 kg, série 1 guardada" com a repetição
  // em branco diria que algo foi registrado quando o registro é a dupla.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 55, null);
  await a.esperar();
  assert.strictEqual(a.doc.getElementById('serie-dita').textContent, '',
    'nada anunciado: a série não ficou completa');
  a.fechar();
});

test('corrigir pela régua diz que é correção: o guardado, "agora" no botão e "Corrigi" no anúncio', async () => {
  // §8 da frente 3. No app a correção não é tela própria: tocar no número
  // guardado abre a régua embaixo da linha, e é ali que ela tem de dizer que
  // corrige — o que está no disco, e a invariante que o toque não quebra.
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[55, 9], [55, 8], [50, 8]] }] },
    done: [{ day: 'A', t: t, sid: t }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.preencher(0, 0, 55, 9);
  await a.esperar();
  assert.strictEqual(a.$('#serie-dita').textContent, 'Guardei a série 1: 55 kg × 9.');

  a.clicar(a.$('#r0_0'));
  await a.esperar();
  assert.strictEqual(a.$('#w0_0').getAttribute('aria-label'), 'Série 1: 55 quilos. Tocar para corrigir.',
    'a unidade por extenso: número abreviado não se lê em voz');
  assert.strictEqual(a.texto('.regua-corrige-t'), 'Corrigir a série 1 · guardada: 55 kg × 9');
  assert.ok(a.texto('.regua-corrige').indexOf('O descanso continua de onde estava.') >= 0,
    'a invariante que o toque não quebra, liberada pelo caso de reabrir o app');
  assert.strictEqual(a.$('.regua-faixa').getAttribute('aria-label'), 'Repetições · um toque corrige');
  // O defeito da §8.3: guardado igual à última recebia a pintura de "agora" e
  // a palavra "última". A palavra passa a dizer o que a pintura diz.
  assert.strictEqual(a.texto('[data-a="regua-9"] .regua-marca'), 'agora');

  await a.regua(0, 0, 10);
  assert.strictEqual(a.$('#serie-dita').textContent, 'Corrigi a série 1: 55 kg × 10.');
  await a.regua(0, 0, 9);
  assert.strictEqual(a.$('#serie-dita').textContent, 'Corrigi a série 1: 55 kg × 9, igual à última.',
    'e o "igual à última" que saiu do botão vem para a frase');
  a.fechar();
});

test('registrar pela primeira vez não diz "corrigir"', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.clicar(a.$('#r0_0'));
  await a.esperar();
  assert.strictEqual(a.$('.regua-corrige'), null, 'série vazia: o toque registra');
  assert.strictEqual(a.$('.regua-faixa').getAttribute('aria-label'), 'repetições da série 1');
  assert.strictEqual(a.$$('.regua-marca').filter(function (m) { return m.textContent === 'agora'; }).length, 0);
  a.fechar();
});
