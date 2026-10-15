// Registro contínuo: a mudança estrutural do app. Não existe botão de salvar,
// a sessão nasce na primeira série completa e morre sozinha.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, abrirApp, agoraEstavel, DIA } from './harness.js';

test('não existe mais função de salvar', async () => {
  const a = await app();
  assert.strictEqual(a.E('typeof finish'), 'undefined');
  assert.ok(a.texto('.tr-nota').includes('Não há nada para salvar'));
  a.fechar();
});

test('série incompleta não abre sessão', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, null);          // só a carga
  assert.strictEqual(a.S().sessao, null);
  assert.strictEqual(a.S().done.length, 0);
  assert.deepStrictEqual(Object.keys(a.S().logs), []);
  a.fechar();
});

test('série completa abre a sessão e grava na hora', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);

  assert.ok(a.S().sessao !== null, 'sessão deveria estar aberta');
  assert.strictEqual(a.S().done.length, 1);
  assert.strictEqual(a.S().done[0].sid, a.S().sessao.sid);

  const log = a.log('A',0)[0];
  assert.deepStrictEqual(log.sets[0], [40, 10]);
  assert.strictEqual(log.sid, a.S().sessao.sid);
  a.fechar();
});

test('apagar o campo remove a série do histórico', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 9);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 2);

  a.preencher(0, 1, '', '');
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 1);
  a.fechar();
});

test('a sessão aberta não vira referência de si mesma', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('render');

  // placeholder da série 2 não pode repetir o que acabou de ser digitado.
  // Vazio é o estado de 'sem referência': a unidade mora no rótulo ao lado.
  assert.strictEqual(a.doc.getElementById('w0_1').textContent, '·',
    'a célula da carga é botão, e vazia mostra o ponto');
  assert.ok(a.texto('.ex.open .lastline').includes('primeira vez'));
  assert.deepStrictEqual(a.vJ('historico', 'A0'), []);
  a.fechar();
});

test('sessão encerra por inatividade, grava duração e avança a rotação', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const estado = a.S();

  // seis horas atrás, última série cinco horas atrás
  const agora = Date.now();
  estado.sessao.inicio = agora - 6 * 3600 * 1000;
  estado.sessao.ultima = agora - 5 * 3600 * 1000;
  estado.done[0].t = estado.sessao.inicio;
  a.fechar();

  const b = await app({ estado });
  assert.strictEqual(b.S().sessao, null, 'sessão deveria ter encerrado sozinha');
  assert.strictEqual(b.S().done[0].dur, 3600 * 1000, 'uma hora de treino');
  assert.strictEqual(b.S().draft, null);
  assert.strictEqual(b.texto('.ins-estado-v'), 'B', 'rotação deveria ter avançado');
  assert.strictEqual(b.log('A',0)[0].sets.filter(Boolean).length, 1, 'histórico preservado');
  b.fechar();
});

test('sessão do mesmo dia com pouca pausa continua aberta', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  const estado = a.S();
  estado.sessao.ultima = Date.now() - 30 * 60 * 1000;   // 30 min de descanso
  a.fechar();

  const b = await app({ estado });
  assert.ok(b.S().sessao !== null, 'não deveria encerrar por 30 minutos');
  assert.strictEqual(b.texto('.ins-estado-v'), 'A');
  b.fechar();
});

test('trocar de dia no meio do treino não perde nem sobrescreve série', async () => {
  // Regressão: o rascunho é zerado ao trocar de dia. Sem hidratação, os campos
  // voltavam em branco com as séries gravadas, e digitar por cima apagava o resto.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  a.preencher(0, 2, 40, 9);

  a.v('go', 'D');
  a.v('go', 'A');
  a.v('toggle', 0);

  assert.strictEqual(a.doc.getElementById('w0_0').textContent, '40',
    'a carga deveria voltar preenchida');
  assert.strictEqual(a.doc.getElementById('r0_2').textContent, '9',
    'a repetição é botão desde a régua, e o valor é o texto dele');

  a.preencher(0, 0, 45, 10);
  assert.strictEqual(a.log('A',0)[0].sets.filter(Boolean).length, 3, 'as outras séries continuam');
  assert.deepStrictEqual(a.log('A',0)[0].sets[1], [40, 10]);
  a.fechar();
});

test('registrar em outro dia e voltar não apaga as séries do dia de antes', async () => {
  // Regressão (docs/mapa/03, risco 1): registrar no E mudava o dia da sessão, e
  // o A só era reconstruído se fosse o dia da sessão. Voltando ao A, a primeira
  // série digitada reescrevia a entrada só com ela e as outras sumiam.
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.preencher(0, 1, 40, 10);
  a.preencher(0, 2, 40, 9);

  a.v('go', 'E');
  a.v('toggle', 0);
  a.preencher(0, 0, 20, 12);
  assert.strictEqual(a.S().sessao.day, 'E');

  a.v('go', 'A');
  a.v('toggle', 0);
  assert.strictEqual(a.doc.getElementById('w0_0').textContent, '40',
    'o A volta preenchido mesmo não sendo mais o dia da sessão');
  a.preencher(0, 0, 45, 10);

  const sets = a.log('A', 0)[0].sets;
  assert.deepStrictEqual(sets, [[45, 10], [40, 10], [40, 9]], 'as outras séries do A continuam');
  assert.strictEqual(a.log('E', 0)[0].sets.filter(Boolean).length, 1, 'e a do E também');
  a.fechar();
});

test('a marca de presença acompanha o dia da sessão', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('go', 'E');
  a.v('toggle', 0);
  a.preencher(0, 0, 20, 12);

  const s = a.S();
  const marca = s.done.filter(function (x) { return x.sid === s.sessao.sid; })[0];
  assert.strictEqual(s.sessao.day, 'E');
  assert.strictEqual(marca.day, 'E', 'a marca dizia A enquanto a sessão dizia E');
  assert.ok(marca.m > 0, 'carimbada, para a mudança atravessar a sincronia');
  a.fechar();
});

test('olhar outro dia sem registrar nada não cria rascunho dele', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  a.v('go', 'C');
  a.v('render');
  assert.strictEqual(a.S().draft.day, 'A', 'o rascunho continua sendo o do dia da sessão');
  a.fechar();
});

test('hidratação recupera observação, dor e substituto', async () => {
  const a = await app();
  a.v('toggle', 1);
  a.v('setAlt', 1, 'crucifixo-inclinado-no-cabo');
  a.v('abrirNota', 1);
  a.digitar('o1', 'ombro ok hoje');
  a.v('toggleDor', 1, 'ombro');
  a.preencher(1, 0, 32, 10);

  a.v('go', 'E');
  a.v('go', 'A');
  a.v('toggle', 1);

  assert.strictEqual(a.v('altOf', 1), 'crucifixo-inclinado-no-cabo');
  assert.strictEqual(a.v('logKey', 'A', 1), 'crucifixo-inclinado-no-cabo',
    'o registro vai para o histórico do substituto, não para uma chave derivada');
  assert.strictEqual(a.doc.getElementById('o1').value, 'ombro ok hoje');
  assert.strictEqual(a.texto('.ex.open .chip.on'), 'ombro anterior');
  a.fechar();
});

test('o contador de séries acompanha a digitação sem re-render', async () => {
  // inp() não chama render() de propósito: o campo é controlado pelo valor já
  // parseado, e redesenhar a cada tecla reescreveria "22," como "22" — deixando
  // impossível digitar decimal. O contador é escrito no DOM à mão, e este teste
  // é o que garante que ele não vire texto morto.
  const a = await app();
  assert.match(a.texto('#daymeta'), /^0\/\d+$/, a.texto('#daymeta'));

  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);
  assert.match(a.texto('#daymeta'), /^1\//, a.texto('#daymeta'));

  a.preencher(0, 1, 40, 10);
  assert.match(a.texto('#daymeta'), /^2\//, 'contador acompanha a digitação');
  a.fechar();
});

test('troca de exercício move a projeção para o histórico do substituto', async () => {
  const a = await app();
  a.v('toggle', 1);
  a.preencher(1, 0, 60, 12);
  assert.ok(a.log('A',1), 'gravou no exercício original');

  const original = a.k('A',1);
  a.v('setAlt', 1, 'crossover-na-polia-baixa');
  assert.strictEqual(a.S().logs[original], undefined,
    'sai do histórico do original');
  assert.strictEqual(a.k('A',1), 'crossover-na-polia-baixa', 'a posição passa a ser do substituto');
  const sub = a.log('A',1);
  assert.strictEqual(sub.length, 1, 'e entra no histórico do substituto');
  assert.strictEqual(sub[0].sl, original, 'guardando de que posição do treino veio');
  a.fechar();
});

test('substituto acumula histórico próprio entre treinos', async () => {
  // O ganho de indexar por exercício: usar o mesmo aparelho como substituto em
  // dias diferentes vira uma série histórica só, não duas chaves órfãs.
  const a = await app();
  a.v('toggle', 1);
  a.v('setAlt', 1, 'crossover-na-polia-baixa');
  a.preencher(1, 0, 20, 12);
  assert.strictEqual(a.S().logs["crossover-na-polia-baixa"].length, 1);

  a.v('go', 'E');
  a.v('toggle', 3);
  a.v('setAlt', 3, 'crossover-na-polia-baixa');
  a.preencher(3, 0, 22, 12);
  const h = a.S().logs["crossover-na-polia-baixa"];
  assert.strictEqual(h.length, 2, 'mesma chave, dois dias diferentes');
  assert.notStrictEqual(h[0].sl, h[1].sl, 'cada um sabe de que posição veio');
  a.fechar();
});

test('deload corta as séries pela metade e marca a sessão', async () => {
  const a = await app();
  await a.v('setDeload', true);
  a.v('go', 'A');
  a.v('toggle', 0);

  assert.strictEqual(a.$$('.ex.open .setrow').length, 2, 'quatro séries viram duas');
  assert.strictEqual(a.$('.up'), null, 'selo de subir carga fica suspenso');

  a.preencher(0, 0, 40, 10);
  assert.strictEqual(a.log('A',0)[0].dl, 1);
  assert.strictEqual(a.S().done[0].dl, 1);
  assert.strictEqual(a.v('sessoesDeTrabalho'), 0, 'deload não conta para as 48');
  a.fechar();
});

// ---------- a sessão aberta manda na CHEGADA ----------
// Chegar é abrir o app e é tocar na aba TREINO vindo de fora dela. Permanecer é
// já estar lá. A diferença é o que separa prioridade de prisão.

/** Um estado com treino em andamento no dia pedido, dentro do dia de hoje. */
function emTreino(dia, agora) {
  return {
    logs: {}, done: [],
    sessao: { day: dia, inicio: agora - 2 * 60000, ultima: agora - 30000,
              sid: agora - 2 * 60000, manual: 1, pausas: [], pulados: [] }
  };
}

test('abrir o app com treino em andamento cai NO MODO, não na aba', async () => {
  // Porta 3 do modo (frente 1, §4.4). O pouso já achava a aba certa; agora o
  // que ele acha é o modo, porque reabrir o app no meio de uma série é a
  // reabertura mais comum que existe aqui — e quem volta assim está com o
  // celular na mão suada, não escolhendo onde navegar.
  const agora = agoraEstavel();
  const a = abrirApp({ agora: agora, estado: emTreino('B', agora) });
  await a.pronto();

  assert.strictEqual(a.vista().modoSessao, true, 'o boot entrou no modo');
  // Herdado do caso que este substituiu ("cai no treino, não em HOJE"): ele
  // afirmava a ABA do treino, que deixou de existir. O dia da sessão e a
  // sobrevivência dela ao boot eram asserções dele, e continuam aqui.
  assert.strictEqual(a.vista().day, 'B', 'no dia da sessão');
  assert.strictEqual((a.S().sessao || {}).day, 'B', 'e a sessão sobreviveu ao boot');
  assert.ok(a.$('[data-a="sai-do-modo"]'),
    'e desenhou a saída: sem ela o modo é uma tela sem porta');
  assert.ok(!a.$('.ins-tabbar'), 'e sem barra de abas');
  a.fechar();
});

test('sem sessão, o pouso não inventa modo nenhum', async () => {
  // A quebra espelhada: um modo aberto sem sessão poria a pessoa numa tela de
  // treino em andamento que não está em andamento, e com a barra de abas fora.
  const a = abrirApp({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  await a.pronto();

  assert.strictEqual(a.S().sessao, null, 'pré-condição: nenhuma sessão');
  assert.strictEqual(a.vista().modoSessao, false, 'e nenhum modo');
  a.fechar();
});

test('sem sessão, o app continua abrindo no AGORA', async () => {
  const a = abrirApp({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  await a.pronto();
  assert.strictEqual(a.v('ctx.abaAtual'), 'agora');
  assert.strictEqual(a.vista().modoSessao, false, 'e sem o modo por cima');
  a.fechar();
});

test('sessão vencida não sequestra a abertura', async () => {
  // encerraSePreciso() roda ANTES de decidir a rota: se a sessão morreu de
  // ontem, ela não tem por que puxar ninguém para o treino
  const agora = agoraEstavel();
  const a = abrirApp({ agora: agora, estado: emTreino('B', agora - 2 * DIA) });
  await a.pronto();
  assert.strictEqual(a.S().sessao, null, 'foi encerrada no boot');
  assert.strictEqual(a.v('ctx.abaAtual'), 'agora');
  assert.strictEqual(a.vista().modoSessao, false, 'e o modo não abriu por ela');
  a.fechar();
});

test('voltar à sessão cai no dia DELA, venha de onde vier', async () => {
  // Reescrito: a correção morava em `vaiPara`, que consertava "chegar na aba
  // TREINO abria um treino qualquer". A aba saiu, e a correção passou para as
  // PORTAS do modo — `voltaAoTreino` cai no dia da sessão, e é por ela que a
  // faixa leva de qualquer lugar.
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });

  a.v('go', 'C');
  assert.strictEqual(a.vista().day, 'C', 'dentro do modo, o dia é livre');

  a.v('ctx.vaiPara', 'prescricao');
  await a.esperar();
  a.v('ctx.voltaAoTreino');
  await a.esperar();
  assert.strictEqual(a.vista().day, 'B', 'voltando de fora, cai na sessão de novo');
  assert.strictEqual(a.vista().modoSessao, true, 'e no modo');
  a.fechar();
});

test('mas não congela: dentro da aba o dia continua livre', async () => {
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  a.v('go', 'D');
  assert.strictEqual(a.vista().day, 'D');
  a.v('render');
  assert.strictEqual(a.vista().day, 'D', 'redesenhar não puxa de volta');
  a.fechar();
});

test('sem sessão, trocar de aba não mexe no dia escolhido', async () => {
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] }, aba: 'treino' });
  a.v('go', 'C');
  a.aba('prescricao');
  a.aba('treino');
  assert.strictEqual(a.vista().day, 'C', 'nada a priorizar, nada muda');
  a.fechar();
});

test('o relógio da sessão é filho direto do main, senão o sticky descola', async () => {
  // sticky se prende ao bloco que o contém: dentro da seção ele sairia da tela
  // junto com ela, a uns dois exercícios de rolagem
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  const rel = a.$('.day-rel');
  assert.ok(rel, 'o relógio está na tela');
  assert.strictEqual(rel.parentElement.tagName, 'MAIN',
    'saiu para o <main>: dentro da <section> o sticky se prenderia a ela');
  assert.ok(a.$('.ins-secao.continua'), 'e a seção partida não desenha fio');
  a.fechar();
});

test('dentro do modo o relógio continua filho direto de um main', async () => {
  // O modo devolve a tela cheia ANTES da casca (`app.jsx`: `if
  // (ctx.emTelaCheia()) return ctx.telaCheia()`), então o `<main>` da casca não
  // entra — e sem um `<main>` do modo o relógio passava a ser filho do
  // invólucro, que é um flex column. O sticky se prende ao bloco que o contém:
  // trocar o pai é trocar a âncora dele, exatamente a quebra que o caso de cima
  // segura para a aba. E o `<main>` também é o marco da página: no modo, o modo
  // É a página.
  const agora = agoraEstavel();
  const a = await app({ agora: agora, estado: emTreino('B', agora), aba: 'treino' });
  assert.strictEqual(a.vista().modoSessao, true, 'pré-condição: o boot entrou no modo');

  const rel = a.$('.day-rel');
  assert.ok(rel, 'o relógio está na tela do modo');
  assert.strictEqual(rel.parentElement.tagName, 'MAIN',
    'e é filho direto de um <main>, como na aba');
  assert.strictEqual(a.$$('main').length, 1,
    'de UM só: dois <main> na mesma página não é marco, é ruído');
  a.fechar();
});

test('o cabeçalho do modo mostra a hora de parede', async () => {
  // Item 3 da lista do que não some no modo (frente 1, §4.3): "dentro do modo,
  // a hora fica no cabeçalho". O protótipo achou que o app não tem relógio
  // NENHUM — e a projeção de fim do treino não se confere sem ele: "acabo às
  // 19h10" não diz nada a quem não sabe que horas são.
  const a = await app({ agora: agoraEstavel(14, 37), estado: emTreino('B', agoraEstavel(14, 37)), aba: 'treino' });
  assert.strictEqual(a.vista().modoSessao, true, 'pré-condição: dentro do modo');

  const hora = a.$('#hora');
  assert.ok(hora, 'a hora está no cabeçalho do modo');
  assert.strictEqual(hora.textContent, '14:37', 'e é a hora de agora, em HH:MM');
  assert.strictEqual(hora.tagName, 'TIME', 'em <time>: é hora, não um número qualquer');
  // Sem `aria-live`: o leitor de tela anunciando a virada de cada minuto no
  // meio de uma série é interrupção, não informação.
  assert.ok(!hora.getAttribute('aria-live'), 'e não se anuncia a cada minuto');
  a.fechar();
});

test('a hora de parede aparece no modo mesmo SEM sessão aberta', async () => {
  // Entrar no modo é navegação, e a sessão nasce na primeira série — então o
  // modo tem um estado vazio (M1‑7). A hora não depende de haver treino
  // aberto: ela é a hora, e é justamente antes de começar que se pergunta se
  // dá tempo.
  const a = await app({ agora: agoraEstavel(6, 5), estado: { logs: {}, done: [] } });
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.S().sessao, null, 'pré-condição: nenhuma sessão');

  assert.strictEqual((a.$('#hora') || {}).textContent, '06:05',
    'a hora está lá, com o zero à esquerda');
  assert.ok(!a.$('#relogio'), 'e o relógio DA SESSÃO não, porque não há sessão');
  a.fechar();
});

test('entrar no modo de outra aba não congela o relógio da sessão', async () => {
  // O relógio decorrido anda por fora do Preact (`tickRelogio`), e o motor dele
  // era ligado só com `view.aba === 'treino'`. As portas 2 e 3 arrumam a aba
  // antes de entrar, então o congelamento não aparecia — mas a porta 1 é o
  // cartão do topo do Agora, e entra DE LÁ. O relógio pararia no meio do
  // treino, mostrando a hora da entrada para sempre.
  //
  // Este caso espera tempo de verdade, 1,2 s, e é o único da suíte que faz
  // isso: o harness congela `Date.now` quando recebe `agora`, e com ele
  // congelado nenhum motor de relógio tem o que mostrar. Sem `agora`, o
  // decorrido vira de segundo em segundo e 1,2 s garante a virada.
  const a = await app({ estado: emTreino('B', Date.now()) });
  a.v('ctx.vaiPara', 'comida');
  a.v('ctx.abreModoDeSessao');
  await a.esperar();
  assert.strictEqual(a.vista().aba, 'comida', 'pré-condição: a aba por baixo NÃO é treino');

  const antes = a.$('#relogio').textContent;
  await a.esperar(1200);
  assert.notStrictEqual(a.$('#relogio').textContent, antes,
    'o decorrido virou: o motor ficou ligado dentro do modo, de onde quer ' +
    'que se tenha entrado (parado em ' + antes + ')');
  a.fechar();
});

// ---------- corrigir e apagar um treino registrado ----------
// Registrar o treino errado e esquecer de finalizar são os dois enganos que
// este app deixa acontecer sem atrito — e até aqui nenhum dos dois tinha saída:
// apagar só era oferecido no treino AVULSO, e o tempo não se editava.

/** Um dia com treino registrado e séries nele. */
function comTreinoRegistrado(agora) {
  const t = agora - 3 * 60 * 60000;
  return {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10], [40, 10], [40, 8]] }],
            A1: [{ t: t, sid: t, sets: [[20, 12], [20, 12]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3 * 60 * 60000, fim: 'auto' }],
    t: t
  };
}

test('o detalhe de um treino do plano oferece corrigir e apagar', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'semana' });
  a.v('abrirSessao', f.t);

  const d = a.vJ('ctx.detalheDaSessao');
  assert.strictEqual(d.livre, false, 'é treino do plano, não avulso');
  assert.strictEqual(d.corrigivel, true);
  assert.ok(d.duracoes.length >= 4, 'os degraus de duração estão lá');
  const botoes = a.$$('.tc button').map(x => x.textContent.trim());
  assert.ok(botoes.includes('Apagar este treino'), botoes.join(' | '));
  assert.strictEqual(a.$$('.ss-tempo-c .ins-chip').length, 0, 'os degraus só abrem pelo "Corrigir"');
  a.clicar('[data-a="sessao-corrige-tempo"]');
  await a.esperar();
  assert.strictEqual(a.$$('.ss-tempo-c .ins-chip').length, d.duracoes.length, 'e abrem ali, ao lado do fim');
  a.fechar();
});

test('corrigir o tempo torna a duração declarada, e o aproximado some', async () => {
  // esquecer de finalizar deixa o tempo correndo até a última série
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'semana' });
  a.v('abrirSessao', f.t);
  assert.strictEqual(a.vJ('ctx.detalheDaSessao').exato, false, 'nasce aproximado');

  await a.v('ctx.corrigeDuracao', f.t, 45);
  await a.esperar(60);

  const m = a.S().done[0];
  assert.strictEqual(m.dur, 45 * 60000);
  assert.strictEqual(m.fim, 'manual', 'passa a ser declarado, não estimado');
  assert.ok(m.m > 0, 'com carimbo, senão a fusão devolve o valor velho');
  assert.strictEqual(a.vJ('ctx.detalheDaSessao').exato, true);
  a.fechar();
});

test('a correção é presa a limites, e não aceita lixo', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'semana' });

  await a.v('ctx.corrigeDuracao', f.t, 0);
  await a.esperar(40);
  assert.strictEqual(a.S().done[0].dur, 60000, 'piso de um minuto');

  await a.v('ctx.corrigeDuracao', f.t, 9999);
  await a.esperar(40);
  assert.strictEqual(a.S().done[0].dur, 600 * 60000, 'teto de dez horas');
  a.fechar();
});

test('apagar o treino leva as séries dele junto, com lápide nas duas coisas', async () => {
  // sem isso as séries ficariam órfãs no histórico de cada exercício: ainda
  // contando volume, ainda puxando progressão, sem dia a que pertencer
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'semana' });
  assert.strictEqual(a.S().done.length, 1);
  const comHistorico = () => Object.keys(a.S().logs).length;
  assert.strictEqual(comHistorico(), 2, 'dois exercícios com histórico');

  a.v('abrirSessao', f.t);
  await a.v('ctx.editaSessao', f.t);
  await a.esperar(80);

  assert.deepStrictEqual(a.S().done, [], 'a marca do dia saiu');
  assert.strictEqual(comHistorico(), 0, 'e os exercícios ficaram sem histórico nenhum');
  const mortos = a.S().apagados;
  assert.ok(mortos['done:' + f.t], 'lápide da sessão');
  assert.ok(Object.keys(mortos).some(k => k.indexOf('log:') === 0), 'e das séries');
  assert.strictEqual(a.vista().sessao, null, 'a tela fechou sozinha');
  a.fechar();
});

test('o aviso diz quantas séries vão junto antes de apagar', async () => {
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'semana' });
  a.v('abrirSessao', f.t);

  a.recusar();
  await a.v('ctx.editaSessao', f.t);
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 1, 'recusou: nada foi apagado');
  const p = a.perguntas().join(' ');
  assert.ok(/5 séries/.test(p), 'a conta das séries aparece: ' + p);
  assert.ok(/outros aparelhos/.test(p), 'e que vale para os outros: ' + p);
  a.fechar();
});

test('o treino EM ANDAMENTO não se apaga por aqui', async () => {
  // o tempo dele ainda está correndo; apagar por baixo deixaria a sessão viva
  // apontando para um dia que não existe mais
  const agora = agoraEstavel();
  const f = comTreinoRegistrado(agora);
  f.sessao = { day: 'A', inicio: f.t, ultima: agora, sid: f.t, manual: 1, pausas: [], pulados: [] };
  const a = await app({ agora: agora, estado: f, aba: 'semana' });

  await a.v('ctx.editaSessao', f.t);
  await a.esperar(60);
  assert.strictEqual(a.S().done.length, 1, 'continua lá');
  assert.ok(/em andamento/.test(a.toast()), a.toast());
  a.fechar();
});

// ===========================================================================
// `ctx.apagaLinha` — o apagamento ESTREITO, que não é o do detalhe do mês
// ===========================================================================
//
// O app tem dois apagamentos de sessão passada, e eles têm alcances
// diferentes de propósito:
//
//   - o do DETALHE DO MÊS leva a marca do dia e TODAS as séries daquele `sid`,
//     em todos os exercícios. É o caso *apagar o treino leva as séries dele
//     junto* , logo acima.
//   - `ctx.apagaLinha`, aqui, leva UMA linha do histórico de UM exercício. A
//     marca do dia fica, e as séries do mesmo treino nos outros exercícios
//     ficam.
//
// O segundo alcance não tinha nenhuma asserção. `telas` :: *correção de sessão
// passada altera e apaga* chama `apagarSessao` e confere que a linha sumiu —
// não que **só** ela sumiu. Um apagamento que crescesse do exercício para o
// treino passaria naquele caso. Daí este.
//
// Cobre o modelo, não a fiação: prova que a capacidade existe e onde ela para,
// e nada sobre a tela nova ter um botão ligado em `ctx.apagaLinha`.

test('ctx.apagaLinha avisa antes, e recusar deixa a linha onde estava', async () => {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[400, 10]] }] },
    done: [{ day: 'A', t: t, sid: t }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);
  a.v('ctx.editaLinha', 0);

  a.recusar();
  await a.v('ctx.apagaLinha');
  await a.esperar();

  assert.strictEqual(a.log('A', 0).length, 1, 'recusar não apaga');
  const q = a.perguntas().join(' | ');
  assert.ok(/não tem volta/.test(q), 'e o aviso diz que não tem volta: ' + q);
  a.fechar();
});

test('ctx.apagaLinha leva uma linha só — o dia e os outros exercícios ficam', async () => {
  const velho = Date.now() - 9 * DIA, novo = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    logs: {
      // duas sessões no MESMO exercício, e uma terceira em outro exercício
      // dentro do MESMO treino da sessão nova
      A0: [{ t: velho, sid: velho, sets: [[60, 10]] },
           { t: novo, sid: novo, sets: [[400, 10]] }],
      A1: [{ t: novo, sid: novo, sets: [[20, 12]] }]
    },
    done: [{ day: 'A', t: velho, sid: velho }, { day: 'A', t: novo, sid: novo }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);

  const antes = a.log('A', 0);
  const alvo = antes.findIndex(function (l) { return l.sid === novo; });
  assert.ok(alvo >= 0, 'a sessão nova está no histórico da posição 0');

  a.v('ctx.editaLinha', alvo);
  await a.v('ctx.apagaLinha');
  await a.esperar();

  assert.deepStrictEqual(a.log('A', 0).map(function (l) { return l.sid; }), [velho],
    'a linha nomeada saiu, e a outra sessão do MESMO exercício ficou');
  assert.strictEqual(a.log('A', 1).length, 1,
    'e o mesmo treino no exercício VIZINHO ficou: o alcance é a linha, não o `sid`');
  assert.strictEqual(a.S().done.length, 2,
    'a marca do dia fica — quem leva o dia junto é o detalhe do mês, não esta porta');

  assert.ok(a.S().apagados['log:' + a.k('A', 0) + ':' + novo + ':' + a.k('A', 0)] > 0,
    'com lápide da linha, senão a fusão do outro aparelho a devolve');
  assert.strictEqual(a.S().apagados['done:' + novo], undefined,
    'e sem lápide do dia, que não foi apagado');
  a.fechar();
});

// ===========================================================================
// A correção de uma linha do histórico, pelas chaves de `CTX`
// ===========================================================================
//
// `editaLinha`, `cancelaEdicao`, `salvaEdicao`, `editDor` e `histKey` não
// tinham caso próprio. `telas` :: *correção de sessão passada altera e apaga*
// aciona as funções de módulo e confere o valor corrigido; o que falta é o
// contorno — o que a edição alcança, o que o cancelar desfaz (e o que não
// desfaz) e o que trocar de chave faz com uma edição aberta.
//
// Cobrem o modelo, não a fiação. Uma ressalva de contrato: `salvaEdicao` e
// `editDor` LEEM O DOM por dentro (`guardaCamposEdicao`, os ids `ed{k}_0`), e
// por isso são os únicos desta entrega que não sobrevivem sozinhos ao
// redesenho. O par por valor deles é `guardaEdicaoCom`, que já está na
// superfície — e o §2 do 09-superficie.md explica por quê.

/** Uma sessão de três séries no histórico da posição 0 do treino A. */
async function umaLinha() {
  const t = Date.now() - 3 * DIA;
  const a = await app({ estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[60, 10], [60, 8], [55, 8]] }] },
    done: [{ day: 'A', t: t, sid: t }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);
  return a;
}

test('ctx.editaLinha abre a edição de UMA linha, e ctx.cancelaEdicao a fecha', async () => {
  const a = await umaLinha();
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].editando, false, 'fechada por padrão');
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].edicao, null,
    'e o formulário não existe até ela abrir');

  a.v('ctx.editaLinha', 0);
  const s = a.vJ('ctx.historico').sessoes[0];
  assert.strictEqual(s.editando, true, 'abre');
  assert.deepStrictEqual(s.edicao.sets, [{ carga: '60', reps: '10' },
                                         { carga: '60', reps: '8' },
                                         { carga: '55', reps: '8' }],
    'o formulário parte do que foi registrado, série por série');
  assert.strictEqual(s.edicao.dores.length, 3, 'com os três marcadores de dor');

  a.v('ctx.cancelaEdicao');
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].editando, false, 'e fecha');
  a.fechar();
});

test('ctx.editDor marca e desmarca cada dor por conta própria', async () => {
  const a = await umaLinha();
  a.v('ctx.editaLinha', 0);
  const ligadas = function () {
    return a.vJ('ctx.historico').sessoes[0].edicao.dores
            .filter(function (d) { return d.on; }).map(function (d) { return d.k; });
  };
  assert.deepStrictEqual(ligadas(), [], 'nenhuma por padrão');

  a.v('ctx.editDor', 'ombro');
  assert.deepStrictEqual(ligadas(), ['ombro'], 'marca a nomeada');
  a.v('ctx.editDor', 'patelar');
  assert.deepStrictEqual(ligadas(), ['ombro', 'patelar'], 'e acumula, sem trocar a anterior');
  a.v('ctx.editDor', 'ombro');
  assert.deepStrictEqual(ligadas(), ['patelar'], 'o mesmo verbo desmarca só aquela');
  assert.deepStrictEqual(a.log('A', 0)[0].dor, ['patelar'],
    'e a dor vai para o registro, não só para o formulário');
  a.fechar();
});

test('ctx.cancelaEdicao NÃO desfaz a dor já marcada — o escopo de hoje', async () => {
  // ESTE CASO NÃO AFIRMA QUE ESTÁ CERTO. `editDor` escreve direto no registro
  // e `cancelarEdicao` só fecha o formulário (`view.edit = null`): não há
  // rascunho para descartar. Então marcar uma dor e cancelar deixa a dor.
  // Registrado para o escopo não mudar em silêncio nos dois sentidos — se
  // alguém der rascunho ao cancelar, este caso fica vermelho e aponta onde.
  const a = await umaLinha();
  a.v('ctx.editaLinha', 0);
  a.v('ctx.editDor', 'cotovelo');
  a.v('ctx.cancelaEdicao');

  assert.deepStrictEqual(a.log('A', 0)[0].dor, ['cotovelo'],
    'cancelar fecha o formulário e deixa a dor marcada');
  a.fechar();
});

test('corrigir uma sessão de outro dia diz que não reabre aquele treino', async () => {
  // §8.4: cada invariante da correção tem frase, e esta é a de outro dia.
  const a = await umaLinha();
  a.v('ctx.editaLinha', 0);
  await a.esperar();
  const data = a.vJ('ctx.historico').sessoes[0].data;
  assert.strictEqual(a.texto('.ed-outrodia'), 'Esta sessão é de ' + data + '. Corrigir não reabre aquele treino.');
  a.fechar();
});

test('ctx.salvaEdicao fecha a linha, carimba a correção e recusa deixá-la sem série', async () => {
  const a = await umaLinha();
  a.v('ctx.editaLinha', 0);
  const antes = a.log('A', 0)[0].m;
  assert.strictEqual(antes, undefined, 'a sessão original não tem carimbo de correção');

  await a.v('ctx.salvaEdicao');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].editando, false, 'salvar fecha a linha');
  assert.ok(a.log('A', 0)[0].m > 0, 'e carimba quando foi corrigida, que é o que a fusão compara');
  assert.strictEqual(a.toast(), 'Sessão corrigida.');

  // A guarda do fim: uma sessão sem nenhuma série não é correção, é engano.
  // Alcançada pelos campos porque `salvaEdicao` relê o DOM por dentro — sem
  // isso o verbo restauraria os valores da tela e a guarda nunca dispararia.
  a.v('ctx.editaLinha', 0);
  a.digitar('ed0_1', '');
  a.digitar('ed1_1', '');
  a.digitar('ed2_1', '');
  await a.v('ctx.salvaEdicao');
  await a.esperar();

  assert.match(a.toast(), /sem nenhuma série\. Use apagar/,
    'manda apagar em vez de guardar um fantasma: ' + a.toast());
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].editando, true,
    'e a linha fica aberta, para ele desfazer o que digitou');
  assert.strictEqual(a.log('A', 0).length, 1, 'sem apagar nada por conta própria');
  a.fechar();
});

test('ctx.histKey troca para o histórico do substituto e fecha a edição aberta', async () => {
  // Fechar a edição ao trocar de chave não é cosmético: `view.edit` é índice
  // na lista DAQUELA chave. Levá-lo para a outra lista apontaria para a linha
  // errada — ou para nenhuma —, e o próximo salvar escreveria em cima de uma
  // sessão que ele não estava editando.
  const t = Date.now() - 4 * DIA, t2 = Date.now() - 2 * DIA;
  const a = await app({ estado: {
    logs: {
      'chest-press-inclinado-convergente': [{ t: t, sid: t, sets: [[60, 10]] }],
      'crucifixo-maquina': [{ t: t2, sid: t2, sets: [[20, 12]],
                              sl: 'chest-press-inclinado-convergente' }]
    },
    done: [{ day: 'A', t: t, sid: t }, { day: 'A', t: t2, sid: t2 }]
  } });
  a.v('go', 'A');
  a.v('toggle', 0);
  a.v('openHist', 0);

  const h = a.vJ('ctx.historico');
  assert.deepStrictEqual(h.variantes.map(function (v) { return v.on; }), [true, false],
    'abre no exercício do programa, não no substituto');
  assert.ok(!h.marcas.some(function (m) { return m.k === 'sub'; }), 'e sem o selo de substituto');

  a.v('ctx.editaLinha', 0);
  assert.strictEqual(a.vJ('ctx.historico').sessoes[0].editando, true, 'uma edição aberta');

  a.v('ctx.histKey', 'crucifixo-maquina');
  const h2 = a.vJ('ctx.historico');

  assert.deepStrictEqual(h2.variantes.map(function (v) { return v.on; }), [false, true],
    'a troca acende a outra chave');
  assert.strictEqual(h2.titulo, 'crucifixo-maquina', 'e o título passa a ser o do substituto');
  assert.ok(h2.marcas.some(function (m) { return m.k === 'sub'; }),
    'com o selo dizendo que não é o exercício do programa');
  assert.strictEqual(h2.sessoes.length, 1, 'mostrando a sessão DELE');
  assert.strictEqual(h2.sessoes[0].editando, false,
    'e a edição que estava aberta fecha: o índice não atravessa de uma lista para a outra');
  a.fechar();
});

// ---------------------------------------------------------------------------
// Corrigir no lugar, na sessão passada (a D, `dias.html`, estados 3, 4 e 14)
// ---------------------------------------------------------------------------
//
// Cada série é um botão; o toque abre a régua da academia, a carga abre o
// teclado do app, e CADA TOQUE GRAVA. É escrita em `S.logs` de um dia que já
// passou — o histórico do exercício, o volume e a progressão leem dali —, e
// por isso cada caso confere o DISCO, não só a tela.

async function abreSerie(agora, k) {
  const f = comTreinoRegistrado(agora);
  const a = await app({ agora: agora, estado: f, aba: 'dias' });
  a.v('abrirSessao', f.t);
  const ex = a.vJ('ctx.detalheDaSessao').exercicios[0];
  a.clicar('[data-a="serie-' + ex.idEx + '-' + k + '"]');
  await a.esperar();
  return { a: a, idEx: ex.idEx };
}

test('tocar a série abre a régua, e o toque grava a correção', async () => {
  const { a, idEx } = await abreSerie(agoraEstavel(), 2);
  assert.ok(a.$('.ss-ed'), 'a série abriu ali mesmo');
  assert.ok(/Série 3 · guardada: 40 × 8/.test(a.texto('.ss-ed-h')), a.texto('.ss-ed-h'));
  const carimbo = a.S().logs[idEx][0].m || 0;

  a.clicar('[data-a="regua-9"]');
  await a.esperar(60);

  assert.deepStrictEqual(a.S().logs[idEx][0].sets[2], [40, 9], 'a série 3 virou 40 × 9');
  assert.deepStrictEqual(a.S().logs[idEx][0].sets[0], [40, 10], 'e as outras não mudaram');
  assert.ok(a.S().logs[idEx][0].m > carimbo, 'carimbada, para a sincronia saber que mudou');
  assert.deepStrictEqual(a.gravado().logs[idEx][0].sets[2], [40, 9], 'e está no disco');
  assert.ok(/Gravado às \d+h\d\d: 40 × 9\./.test(a.texto('.ss-ed-ok')), a.texto('.ss-ed-ok'));
  assert.ok(/era/.test(a.texto('[data-a="regua-8"]')), 'o 8 fica dito como "era"');
  assert.ok(a.texto('[data-a="serie-' + idEx + '-2"]').includes('40 × 9'), 'o botão já mostra o novo');
  a.fechar();
});

test('a carga abre o teclado do app, com vírgula', async () => {
  const { a, idEx } = await abreSerie(agoraEstavel(), 0);
  a.clicar('[data-a="sessao-carga"]');
  await a.esperar();
  assert.ok(/vírgula/.test(a.$('.ss-ed').innerHTML), 'o teclado do app, com a tecla da vírgula');
  ['⌫', '⌫', '4', '2', ',', '5'].forEach(function (t) { a.v('ctx.tecla', t); });
  await a.esperar(60);
  assert.strictEqual(a.S().logs[idEx][0].sets[0][0], 42.5, '42,5 com a vírgula do teclado');
  assert.strictEqual(a.S().logs[idEx][0].sets[0][1], 10, 'a repetição não mudou');
  assert.strictEqual(a.gravado().logs[idEx][0].sets[0][0], 42.5);
  a.fechar();
});

test('o RIR da série passada marca e desmarca', async () => {
  const { a, idEx } = await abreSerie(agoraEstavel(), 1);
  a.clicar('[data-a="sessao-rir"]');
  await a.esperar();
  a.clicar('[data-a="sessao-rir-2"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().logs[idEx][0].sets[1], [40, 10, 2]);
  assert.ok(/RIR 2/.test(a.texto('[data-a="serie-' + idEx + '-1"]')), 'o botão diz o RIR');
  a.clicar('[data-a="sessao-rir"]');
  await a.esperar();
  a.clicar('[data-a="sessao-rir-nenhum"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().logs[idEx][0].sets[1], [40, 10], '"nenhum" tira');
  a.fechar();
});

test('apagar uma série passa pelo painel e deixa as outras na posição', async () => {
  const { a, idEx } = await abreSerie(agoraEstavel(), 0);
  a.recusar();
  a.clicar('[data-a="sessao-apaga-serie"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().logs[idEx][0].sets[0], [40, 10], 'recusar o painel não apaga');

  assert.ok(a.$('.ss-ed'), 'e a série continua aberta');
  a.aceitar();
  a.clicar('[data-a="sessao-apaga-serie"]');
  await a.esperar(60);
  const sets = a.S().logs[idEx][0].sets;
  assert.strictEqual(sets[0], null, 'a série 1 vira "não feita"');
  assert.deepStrictEqual(sets.slice(1), [[40, 10], [40, 8]], 'e as outras continuam série 2 e série 3');
  assert.ok(a.vJ('ctx.detalheDaSessao').exercicios[0].series[0].nao, 'a tela diz "não feito" na posição');
  a.fechar();
});

test('apagar a única série leva o registro do exercício, com lápide', async () => {
  const agora = agoraEstavel();
  const t = agora - 3 * 60 * 60000;
  const a = await app({ agora: agora, aba: 'dias', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3600000, fim: 'manual' }]
  } });
  a.v('abrirSessao', t);
  const idEx = a.vJ('ctx.detalheDaSessao').exercicios[0].idEx;
  a.clicar('[data-a="serie-' + idEx + '-0"]');
  await a.esperar();
  a.clicar('[data-a="sessao-apaga-serie"]');
  await a.esperar(60);
  assert.strictEqual(a.S().logs[idEx], undefined, 'o exercício sai do histórico');
  assert.ok(Object.keys(a.S().apagados).some(function (k) { return k.indexOf('log:' + idEx + ':') === 0; }),
    'e a lápide impede o outro aparelho de trazê-lo de volta');
  assert.strictEqual(a.S().done.length, 1, 'a presença do dia fica');
  a.fechar();
});

test('se a gravação falha, a série continua a guardada e o toque fica dito como tocado', async () => {
  const { a, idEx } = await abreSerie(agoraEstavel(), 2);
  a.encheCota();
  a.clicar('[data-a="regua-9"]');
  await a.esperar(60);

  assert.deepStrictEqual(a.S().logs[idEx][0].sets[2], [40, 8], 'a série continua o que está guardado');
  assert.ok(a.$('.regua-v.tocado'), 'o 9 fica à parte, tracejado');
  assert.ok(/tocado/.test(a.texto('[data-a="regua-9"]')));
  assert.ok(/Não foi gravado/.test(a.texto('.ss-ed-falhou')), a.texto('.ss-ed-falhou'));
  assert.strictEqual(a.$('.ss-ed-ok'), null, 'e não diz "Gravado"');

  a.encheCota(false);
  a.clicar('[data-a="sessao-tenta"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().logs[idEx][0].sets[2], [40, 9], '"Tentar de novo" grava o toque');
  assert.strictEqual(a.$('.ss-ed-falhou'), null);
  a.fechar();
});

test('a correção acha o registro pela chave, mesmo com a lista do exercício mudando', async () => {
  // Entre o toque que abre e o que grava, a sincronia pode pôr outra entrada
  // na lista do exercício. Achar pela posição corrigiria o registro errado.
  const { a, idEx } = await abreSerie(agoraEstavel(), 2);
  const outro = a.S().logs[idEx][0].t - 7 * 86400000;
  a.E('S.logs[' + JSON.stringify(idEx) + '].unshift({ t: ' + outro + ', sid: ' + outro + ', sets: [[30, 8], [30, 8], [30, 8]] })');
  a.clicar('[data-a="regua-9"]');
  await a.esperar(60);
  const lista = a.S().logs[idEx];
  assert.deepStrictEqual(lista[0].sets[2], [30, 8], 'a entrada que chegou não foi tocada');
  assert.deepStrictEqual(lista[1].sets[2], [40, 9], 'a da sessão aberta foi');
  a.fechar();
});

// "Não feito" tocável: se ele fez e não registrou, a série entra ali (estado 3).

test('a série não feita entra pela régua, na posição dela, com a carga da anterior', async () => {
  const agora = agoraEstavel();
  const t = agora - 2 * DIA;
  const a = await app({ agora: agora, aba: 'dias', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10], [40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3600000, fim: 'manual' }]
  } });
  a.v('abrirSessao', t);
  const ex = a.vJ('ctx.detalheDaSessao').exercicios[0];
  assert.ok(ex.series[2].nao && ex.series[2].lanca, 'a série 3 está "não feito", e é tocável');
  a.clicar('[data-a="serie-' + ex.idEx + '-2"]');
  await a.esperar();
  assert.ok(/não registrada/.test(a.texto('.ss-ed-h')), a.texto('.ss-ed-h'));
  a.clicar('[data-a="regua-9"]');
  await a.esperar(60);

  const reg = a.S().logs[ex.idEx];
  assert.strictEqual(reg.length, 1, 'no mesmo registro, sem criar outro');
  assert.deepStrictEqual(reg[0].sets, [[40, 10], [40, 10], [40, 9]], 'na posição 3, com a carga da série anterior');
  assert.ok(reg[0].m > 0, 'carimbado');
  assert.ok(/Lançada às \d+h\d\d: 40 × 9\./.test(a.texto('.ss-ed-ok')), a.texto('.ss-ed-ok'));
  assert.deepStrictEqual(a.gravado().logs[ex.idEx][0].sets[2], [40, 9], 'e está no disco');
  a.fechar();
});

test('exercício inteiro não feito ganha registro, entre os outros pela ordem do tempo', async () => {
  // A lista do exercício é lida pela POSIÇÃO: o fim é a "última vez" que a
  // próxima sessão usa. A entrada de um dia passado não pode ir para o fim.
  const agora = agoraEstavel();
  const t = agora - 3 * DIA, hoje = agora - 3600000;
  const a = await app({ agora: agora, aba: 'dias', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }], A1: [{ t: hoje, sid: hoje, sets: [[20, 12]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3600000, fim: 'manual' }, { day: 'A', t: hoje, sid: hoje, dur: 3600000, fim: 'manual' }]
  } });
  const id1 = a.vJ('treino', 'A').ex[1].id;
  a.v('abrirSessao', t);
  a.clicar('[data-a="serie-' + id1 + '-0"]');
  await a.esperar();
  assert.ok(/sem referência/.test(a.texto('.ss-ed-h')), 'nada antes daquele dia para servir de referência');
  a.clicar('[data-a="sessao-carga"]');
  await a.esperar();
  ['⌫', '⌫', '1', '8'].forEach(function (k) { a.v('ctx.tecla', k); });
  assert.strictEqual(a.S().logs[id1].length, 1, 'a carga sozinha não lança nada');
  const alvo = a.$$('.regua-v')[1];
  const reps = +alvo.getAttribute('data-a').replace('regua-', '');
  a.clicar(alvo);
  await a.esperar(60);

  const lista = a.S().logs[id1];
  assert.strictEqual(lista.length, 2, 'um registro novo');
  assert.strictEqual(lista[0].sid, t, 'o do dia passado vem PRIMEIRO');
  assert.deepStrictEqual(lista[0].sets, [[18, reps]], 'com a carga do teclado e a repetição da régua');
  assert.strictEqual(lista[1].sid, hoje, 'e o de hoje continua sendo o último');
  const h = a.vJ('historico', id1);
  assert.strictEqual(h[h.length - 1].sid, hoje, 'a "última vez" da próxima sessão não muda');
  a.fechar();
});

test('se lançar a série falha, ela continua não feita', async () => {
  const agora = agoraEstavel();
  const t = agora - 2 * DIA;
  const a = await app({ agora: agora, aba: 'dias', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3600000, fim: 'manual' }]
  } });
  const id1 = a.vJ('treino', 'A').ex[1].id;
  a.v('abrirSessao', t);
  a.clicar('[data-a="serie-' + id1 + '-0"]');
  await a.esperar();
  a.encheCota();
  a.clicar(a.$$('.regua-v')[1]);
  await a.esperar(60);
  assert.strictEqual(a.S().logs[id1], undefined, 'nenhum registro ficou na memória sem estar no disco');
  assert.ok(a.$('.regua-v.tocado'), 'o toque fica dito como tocado');
  assert.ok(/continua não feita/.test(a.texto('.ss-ed-falhou')));
  a.encheCota(false);
  a.clicar('[data-a="sessao-tenta"]');
  await a.esperar(60);
  assert.strictEqual(a.S().logs[id1].length, 1, '"Tentar de novo" lança');
  a.fechar();
});

test('lançar a série 3 com a 2 não feita deixa a 2 não feita', async () => {
  const agora = agoraEstavel();
  const t = agora - 2 * DIA;
  const a = await app({ agora: agora, aba: 'dias', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[40, 10]] }] },
    done: [{ day: 'A', t: t, sid: t, dur: 3600000, fim: 'manual' }]
  } });
  a.v('abrirSessao', t);
  const ex = a.vJ('ctx.detalheDaSessao').exercicios[0];
  a.clicar('[data-a="serie-' + ex.idEx + '-2"]');
  await a.esperar();
  a.clicar('[data-a="regua-9"]');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().logs[ex.idEx][0].sets, [[40, 10], null, [40, 9]], 'cada série na posição dela');
  assert.ok(a.vJ('ctx.detalheDaSessao').exercicios[0].series[1].nao, 'e a 2 continua "não feito"');
  a.fechar();
});
