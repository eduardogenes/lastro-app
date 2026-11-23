// O programa, o editor de um treino e a revisão do treinador no visual novo
// (direção 3, Fase 3). Os dados e as ações são os de sempre; o que se cobra
// é que a tela nova chega a eles e mostra a faixa de séries por músculo.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';
import { montaArquivos } from '../../ferramentas/espelho/monta';

const TEXTO = `Revisão 21/09
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 5 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Hip thrust máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;

async function noPrograma() {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.v('ctx.abrePrograma');
  await a.esperar();
  return a;
}

test('o programa: os treinos, e o editor muda séries com a faixa por músculo dizendo quanto saiu do treinador', async () => {
  const a = await noPrograma();
  assert.strictEqual(a.texto('.v3-cab h1'), 'Programa');
  assert.ok(a.$('[data-a="prog-dia-A"]'), 'o treino A');
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  assert.ok(/^Treino A/.test(a.texto('.v3-cab h1')));
  const antes = a.E('S.prog.A.ex[0].s');
  assert.ok(!a.$('.v3-vol span.mais'), 'igual ao treinador, nada acima');
  a.clicar('[data-a="ed-mais-0"]');
  await a.esperar(60);
  assert.strictEqual(a.E('S.prog.A.ex[0].s'), antes + 1, 'a série entrou no programa');
  assert.ok(/\(\+1\)/.test(a.texto('.v3-vol span.mais')), 'e a faixa diz: ' + a.texto('.v3-vol'));
  a.clicar('.v3-cab > button');               // voltar à lista
  await a.esperar();
  a.clicar('[data-a="prog-diff"]');
  await a.esperar();
  assert.strictEqual(a.texto('.v3-cab h1'), 'O que está diferente');
  assert.ok(a.$('[data-a="restaura-A"]'), 'com a volta ao do treinador');
  a.fechar();
});

test('adicionar exercício: o catálogo é uma folha sobre o editor, busca e põe no programa', async () => {
  const a = await noPrograma();
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  a.clicar('[data-a="ed-add"]');
  await a.esperar(40);
  assert.ok(a.$('#catalogo-busca'), 'o catálogo novo');
  assert.ok(!a.$('.addex'), 'e não o antigo');
  assert.ok(/^Treino A/.test(a.texto('.v3-cab h1')), 'o editor continua por baixo');
  const busca = a.$('#catalogo-busca');
  busca.value = 'remo';
  busca.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  const alvo = a.$('[data-a^="catalogo-"]:not([data-a="catalogo-novo"])');
  assert.ok(alvo, 'a busca acha');
  const id = alvo.getAttribute('data-a').slice(9);
  const antes = a.E('S.prog.A.ex.length');
  alvo.click();
  await a.esperar(60);
  assert.strictEqual(a.E('S.prog.A.ex.length'), antes + 1);
  assert.strictEqual(a.E('S.prog.A.ex[S.prog.A.ex.length - 1].id'), id, 'entrou no programa');
  assert.ok(!a.$('#catalogo-busca'), 'e a folha fecha');
  a.fechar();
});

test('cadastrar um exercício novo pelo catálogo: só com nome, e já entra no treino', async () => {
  const a = await noPrograma();
  a.clicar('[data-a="prog-dia-A"]');
  await a.esperar();
  a.clicar('[data-a="ed-add"]');
  await a.esperar(40);
  a.clicar('[data-a="catalogo-novo"]');
  await a.esperar();
  assert.ok(a.$('[data-a="novo-ex-cria"]').disabled, 'sem nome, não cria');
  const nome = a.$('#novo-ex-nome');
  nome.value = 'Remada articulada do box';
  nome.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  a.clicar('[data-a="novo-ex-composto"]');
  await a.esperar();
  a.clicar('[data-a="novo-ex-cria"]');
  await a.esperar(80);
  const ult = a.E('S.prog.A.ex[S.prog.A.ex.length - 1].id');
  assert.strictEqual(a.E(`S.ex[${JSON.stringify(ult)}].n`), 'Remada articulada do box');
  assert.strictEqual(a.E(`S.ex[${JSON.stringify(ult)}].c`), 1, 'composto');
  assert.ok(!a.$('#novo-ex-nome'), 'a folha fecha');
  a.fechar();
});

test('a revisão mudança por mudança: a desmarcada fica como diferença, e desfazer volta tudo', async () => {
  // Decisão do dono (17/11/2026). O texto usa os nomes do catálogo: só o novo pergunta.
  const texto = `Revisão 18/11
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Cadeira flexora sentada · 3 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Máquina de sissy squat · 3 x 8-12 · quadríceps
- Elevação pélvica na máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const antes = a.E('JSON.stringify({ prog: S.prog, rot: S.rot, pt: S.progTreinador })');
  a.v('ctx.abreRevisao');
  await a.esperar();
  a.v('ctx.textoDaRevisao', { value: texto });
  a.clicar('[data-a="revisao-le"]');
  await a.esperar();
  // o novo ocupa o lugar da extensora: o app pergunta, e "é outro" faz dele um exercício novo
  const r0 = a.vJ('ctx.revisao');
  r0.perguntas.forEach(q => a.v('ctx.respondeRevisao', q.nome, 'outro'));
  await a.esperar();
  const r = a.vJ('ctx.revisao');
  const todas = r.grupos.flatMap(g => g.mudancas);
  assert.deepStrictEqual(todas.map(m => m.titulo).sort(),
    ['Cadeira extensora sai', 'Cadeira flexora sentada: 4 → 3 séries', 'Máquina de sissy squat entra'].sort());
  assert.strictEqual(a.texto('.v3-cab h1'), '3 mudanças');
  assert.ok(a.$$('[role="switch"][aria-checked="true"]').length === 3, 'todas começam marcadas');
  // a extensora fica
  a.clicar('[data-a="mud-B:sai:cadeira-extensora"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="mud-B:sai:cadeira-extensora"]').getAttribute('aria-checked'), 'false');
  assert.ok(/2 marcadas/.test(a.texto('.v3-cab')), a.texto('.v3-cab'));
  assert.strictEqual(a.texto('[data-a="revisao-aplica"]'), 'Aplicar 2 mudanças');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const B = a.E('S.prog.B.ex.map(x => x.id + " " + x.s)');
  assert.ok(B.indexOf('cadeira-extensora 1') >= 0, 'a extensora ficou no programa dele: ' + B.join(', '));
  assert.ok(B.indexOf('cadeira-flexora-sentada 3') >= 0, 'a flexora caiu para 3');
  // o id exato: recalcular depois de criar o catálogo fazia nascer "-2"
  assert.ok(B.indexOf('maquina-de-sissy-squat 3') >= 0, 'o novo com o id que a tela mostrou: ' + B.join(', '));
  assert.strictEqual(a.E('CAT["maquina-de-sissy-squat"] && CAT["maquina-de-sissy-squat"].n'), 'Máquina de sissy squat', 'e com nome no catálogo');
  assert.ok(a.E('S.progTreinador.dias.B.ex.some(x => x.id === "maquina-de-sissy-squat")'), 'o mesmo id no do treinador');
  const iLeg = B.findIndex(x => /^leg-press /.test(x)), iNovo = B.findIndex(x => /^maquina-de-sissy-squat /.test(x));
  assert.strictEqual(iNovo, iLeg + 1, 'o novo entrou depois do leg press, onde o treinador o pôs');
  assert.ok(!a.E('S.progTreinador.dias.B.ex.some(x => x.id === "cadeira-extensora")'), 'o do treinador é a revisão inteira');
  const dif = a.E('difDoDia("B").map(x => x.txt)');
  assert.deepStrictEqual(dif.length, 1, 'a única diferença é a que ficou de fora: ' + dif.join(' | '));
  assert.ok(/Cadeira extensora/.test(dif[0]), dif[0]);
  assert.match(a.toast(), /^2 mudanças aplicadas\. Valem a partir do próximo treino\./);
  assert.ok(/Ficou de fora: Cadeira extensora sai \(era 1 × 10–15\)/.test(a.E('S.progLog[S.progLog.length - 1].txt')), 'o histórico diz o que ficou de fora');
  // desfazer volta o programa, o do treinador e a sequência, e arquiva o exercício que nada usa
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(120);
  assert.strictEqual(a.E('JSON.stringify({ prog: S.prog, rot: S.rot, pt: S.progTreinador })'), antes, 'tudo como era');
  assert.strictEqual(a.E('S.ex["maquina-de-sissy-squat"].arq'), 1, 'o exercício criado fica arquivado (sai das buscas)');
  assert.strictEqual(a.E('S.apagados["ex:maquina-de-sissy-squat"]'), undefined,
    'sem lápide: se o outro aparelho criou o mesmo e treinou com ele, a série dele continua com nome');
  assert.ok(/desfeita/.test(a.E('S.progLog[S.progLog.length - 1].txt')), 'e o histórico diz que foi desfeita');
  a.fechar();
});

const TEXTO_NOVO = `Revisão 18/11
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Cadeira flexora sentada · 3 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Máquina de sissy squat · 3 x 8-12 · quadríceps
- Elevação pélvica na máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;
async function revisaoLida(a, texto) {
  a.v('ctx.abreRevisao');
  await a.esperar();
  a.v('ctx.textoDaRevisao', { value: texto || TEXTO_NOVO });
  a.clicar('[data-a="revisao-le"]');
  await a.esperar();
  a.vJ('ctx.revisao').perguntas.forEach(q => a.v('ctx.respondeRevisao', q.nome, 'outro'));
  await a.esperar();
}

test('uma mudança aplicada usa o singular no aviso', async () => {
  const a = await noPrograma();
  try {
    await revisaoLida(a);
    for (const mudanca of ['entra:maquina-de-sissy-squat', 'sai:cadeira-extensora']) {
      a.clicar('[data-a="mud-B:' + mudanca + '"]');
      await a.esperar();
    }
    assert.equal(a.texto('[data-a="revisao-aplica"]'), 'Aplicar 1 mudança');
    a.clicar('[data-a="revisao-aplica"]');
    await a.esperar(120);
    assert.match(a.toast(), /^1 mudança aplicada\. Vale a partir do próximo treino\./);
  } finally { a.fechar(); }
});

test('desmarcar o exercício novo o deixa de fora do programa dele, e só do dele', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await revisaoLida(a);
  a.clicar('[data-a="mud-B:entra:maquina-de-sissy-squat"]');
  await a.esperar();
  assert.strictEqual(a.texto('[data-a="revisao-aplica"]'), 'Aplicar 2 mudanças');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  assert.ok(!a.E('S.prog.B.ex.some(x => /sissy/.test(x.id))'), 'fora do programa dele');
  assert.ok(a.E('S.progTreinador.dias.B.ex.some(x => x.id === "maquina-de-sissy-squat")'), 'no do treinador');
  assert.ok(/^2 mudanças aplicadas/.test(a.toast()), 'o aviso conta o que foi aplicado: ' + a.toast());
  assert.ok(a.E('difDoDia("B").some(x => /Máquina de sissy squat/.test(x.txt))'), 'e aparece como diferença dele');
  a.fechar();
});

test('com o treino daquele dia aberto, aplicar espera: mudar o programa no meio misturaria as séries', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.E(`S.sessao = { day: 'B', inicio: Date.now(), ultima: Date.now(), sid: Date.now() }; render();`);
  await revisaoLida(a);
  assert.ok(a.$('[data-a="revisao-bloqueio"]'), 'a tela diz por quê');
  assert.ok(/Treino B está aberto agora/.test(a.texto('[data-a="revisao-bloqueio"]')));
  assert.strictEqual(a.$('[data-a="revisao-aplica"]').disabled, true, 'e não aplica');
  const antes = a.E('JSON.stringify(S.prog.B)');
  await a.v('ctx.incorporaRevisao');
  assert.strictEqual(a.E('JSON.stringify(S.prog.B)'), antes, 'nem pela porta');
  // Desmarcar as mudanças do B libera, sem trocar a tela por baixo da chave.
  const passo = a.E('passoDaAcao("revisao")');
  a.vJ('ctx.revisao').grupos.filter(g => g.dia === 'B').forEach(g => g.mudancas.forEach(m => a.v('ctx.alternaMudanca', m.k)));
  await a.esperar();
  assert.strictEqual(a.E('passoDaAcao("revisao")'), passo);
  assert.strictEqual(a.texto('[data-a="revisao-aplica"]'), 'Guardar a revisão');
  assert.ok(!a.$('[data-a="revisao-bloqueio"]'), 'sem mudança no B, nada a esperar');
  a.fechar();
});

test('desfazer não passa por cima do programa que mudou depois, e não arquiva exercício com série', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await revisaoLida(a);
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  // uma série feita com o exercício novo antes do desfazer
  a.E(`S.logs["maquina-de-sissy-squat"] = [{ t: Date.now(), sid: Date.now(), sets: [[40, 10]] }]`);
  // e o programa mudou depois (a sincronia trouxe a edição do outro aparelho)
  a.E(`S.prog.B.ex[0].s = 7`);
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar(80);
  assert.strictEqual(a.E('S.prog.B.ex[0].s'), 7, 'a edição de depois fica');
  assert.ok(/O programa mudou depois da revisão/.test(a.toast()), a.toast());
  a.fechar();
  // sem a edição de depois: desfaz, mas o exercício com série não é arquivado
  const b = await app({ aba: 'agora' });
  await b.pronto();
  await revisaoLida(b);
  b.clicar('[data-a="revisao-aplica"]');
  await b.esperar(120);
  b.E(`S.logs["maquina-de-sissy-squat"] = [{ t: Date.now(), sid: Date.now(), sets: [[40, 10]] }]`);
  b.clicar('[data-a="aviso-acao"]');
  await b.esperar(80);
  assert.ok(!b.E('S.prog.B.ex.some(x => /sissy/.test(x.id))'), 'desfeito');
  assert.ok(!b.E('S.ex["maquina-de-sissy-squat"].arq'), 'mas o exercício com série continua nas buscas');
  b.fechar();
});

test('o aparelho recusou: nada da revisão fica (nem o exercício novo no catálogo)', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  const antes = a.E('JSON.stringify({ prog: S.prog, rot: S.rot, pt: S.progTreinador, ex: S.ex, log: S.progLog })');
  await revisaoLida(a);
  a.encheCota();
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(150);
  assert.strictEqual(a.E('JSON.stringify({ prog: S.prog, rot: S.rot, pt: S.progTreinador, ex: S.ex, log: S.progLog })'), antes);
  assert.ok(a.$('[data-a="revisao-aplica"]'), 'as escolhas continuam na tela');
  a.fechar();
});

test('o treino que ficou de fora antes começa desmarcado; o aviso só conta o que mexeu no programa', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  // o F está no programa do treinador (uma revisão anterior), e ele o deixou de fora
  a.E(`S.progTreinador = { em: Date.now() - 86400000, data: '10/11', rot: rot().concat(['F']),
        dias: Object.assign(JSON.parse(JSON.stringify(baseTreinador())), { F: { name: 'Braços', tag: '', ex: [{ id: 'rosca-martelo', s: 2, r: '10–15', d: 105, desde: 0 }] } }) };
        S.prog.B.ex = S.prog.B.ex.filter(x => x.id !== 'cadeira-extensora'); render();`);
  const texto = TEXTO_NOVO + `
Treino F · Braços
- Rosca martelo · 3 x 10-15`;
  await revisaoLida(a, texto);
  assert.strictEqual(a.$('[data-a="mud-F:dia"]').getAttribute('aria-checked'), 'false', 'o F começa desmarcado, como ele escolheu');
  assert.strictEqual(a.$('[data-a="mud-F:dia"]').closest('section').querySelector('h2').textContent, 'Treino F');
  assert.ok(/ficou de fora do seu programa antes/.test(a.texto('[data-a="mud-F:dia"]')));
  // a extensora ele já tinha tirado: "sai" não mexe em nada, e não conta
  assert.ok(/já não está no seu programa/.test(a.texto('[data-a="mud-B:sai:cadeira-extensora"]')));
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  assert.ok(!a.E('S.prog.F'), 'o F continua fora');
  assert.ok(/^2 mudanças aplicadas/.test(a.toast()), 'conta a flexora e o novo, não a extensora que já tinha saído: ' + a.toast());
  a.fechar();
});

test('a diferença do programa conta o RIR', async () => {
  const a = await app({ aba: 'agora' });
  await a.pronto();
  a.E(`S.prog.B.ex[1].rir = '0–1'`);
  assert.ok(a.E('difDoDia("B").some(x => x.k === "rir" && /sobrando 0–1, não 1/.test(x.txt))'), JSON.stringify(a.E('difDoDia("B")')));
  a.fechar();
});

test('a revisão do treinador: lê o texto, pergunta o que não reconhece, e mostra o que muda em cada treino', async () => {
  const t = Date.now() - 10 * DIA;
  const a = await app({ aba: 'agora', estado: { plano: 7,
    logs: { 'cadeira-flexora-sentada': [{ t: t, sid: t, sets: [[45, 12, 1], [45, 11, 1]] }] },
    done: [{ day: 'B', t: t, sid: t, dur: 3600000 }] } });
  await a.pronto();
  a.v('ctx.abreRevisao');
  await a.esperar();
  assert.ok(a.$('#revisao-texto'), 'o campo de colar');
  a.v('ctx.textoDaRevisao', { value: TEXTO });
  a.clicar('[data-a="revisao-le"]');
  await a.esperar();
  const r = a.vJ('ctx.revisao');
  assert.strictEqual(r.perguntas.length, 2);
  const principal = a.$('[data-a="revisao-aplica"]');
  assert.strictEqual(principal.disabled, false, 'alcançável pelo Tab');
  assert.strictEqual(principal.getAttribute('aria-disabled'), 'true');
  assert.strictEqual(a.texto('#' + principal.getAttribute('aria-describedby')), 'Responda as perguntas acima para aplicar.');
  assert.doesNotMatch(a.texto('.v3-revisao-confirmar'), /O programa do treinador passa a ser este/);
  a.clicar(principal);
  assert.ok(a.$('.v3-perg'), 'o botão em espera não aplica');
  a.clicar(a.$$('.v3-perg')[0].querySelector('button'));
  assert.strictEqual(a.texto('#revisao-motivo'), 'Responda a pergunta acima para aplicar.');
  a.clicar(a.$$('.v3-perg')[1].querySelector('button'));
  await a.esperar();
  assert.ok(a.$$('.v3-sec-h').some(e => /Treino B/.test(e.textContent)), 'o que muda no B');
  assert.ok(!a.$('[data-a="revisao-aplica"]').hasAttribute('aria-disabled'), 'respondido, aplica');
  a.fechar();
});

test('a escolha só aparece depois de identificar o exercício', async () => {
  const a = await noPrograma();
  a.v('ctx.abreRevisao');
  a.digitar('revisao-texto', TEXTO_NOVO.replace('Máquina de sissy squat', 'Hack machine'));
  a.clicar('[data-a="revisao-le"]');
  assert.strictEqual(a.texto('.v3-perg p'), '“Hack machine” é Cadeira extensora?');
  assert.strictEqual(a.texto('.v3-perg small'), 'Cadeira extensora não tem série registrada e ocupa este lugar no treino B.');
  assert.strictEqual(a.$$('[role="switch"]').length, 0, 'nenhuma escolha provisória');
  a.clicar(a.$$('[role="radio"]')[0]);
  a.clicar('[data-a="mud-B:muda:cadeira-extensora"]');
  a.clicar(a.$$('[role="radio"]')[1]);
  assert.strictEqual(a.texto('.v3-perg p'), '“Hack machine” é outro exercício.');
  assert.strictEqual(a.$('[data-a="mud-B:sai:cadeira-extensora"]').getAttribute('aria-checked'), 'false');
  assert.strictEqual(a.$('[data-a="mud-B:entra:hack-machine"]').getAttribute('aria-checked'), 'false');
  a.clicar('[data-a="mud-B:entra:hack-machine"]');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar();
  assert.ok(a.S().prog.B.ex.some(x => x.id === 'cadeira-extensora'));
  assert.ok(a.S().prog.B.ex.some(x => x.id === 'hack-machine'));
  assert.ok(!a.S().progTreinador.dias.B.ex.some(x => x.id === 'cadeira-extensora'));
  a.fechar();
});

function dedo(a, alvo, tipo, x, y) {
  alvo.dispatchEvent(new a.window.MouseEvent(tipo, { bubbles: true, cancelable: true, detail: 1, clientX: x, clientY: y }));
}

test('Desfazer recebe o toque que desceu na raiz durante a saída da revisão', async () => {
  const a = await noPrograma();
  await revisaoLida(a);
  const antes = a.S().prog.B;
  const doc = a.window.document;
  // As fotos da transição recebem o ponteiro no WebKit. O navegador não envia clique.
  a.window.matchMedia = () => ({ matches: true });
  a.window.requestAnimationFrame = cb => { cb(); return 0; };
  doc.startViewTransition = desenha => {
    a.window.setTimeout(desenha, 0);
    return doc.activeViewTransition = { skipTransition() {}, ready: Promise.resolve() };
  };
  let instante = 0;
  a.window.performance.now = () => instante;
  const aplica = a.$('[data-a="revisao-aplica"]');
  aplica.getBoundingClientRect = () => ({ left: 20, right: 394, top: 750, bottom: 808 });
  dedo(a, aplica, 'click', 350, 780);
  await a.esperar();
  assert.notDeepStrictEqual(a.S().prog.B, antes);
  const aviso = a.$('#toast .aviso');
  aviso.getBoundingClientRect = () => ({ left: 14, right: 400, top: 752, bottom: 808 });
  doc.elementFromPoint = () => aviso.querySelector('button');
  // A transição continua viva mesmo depois da tolerância do toque duplo.
  instante = 650;
  a.viajar(650);
  dedo(a, doc.documentElement, 'pointerdown', 350, 780);
  dedo(a, doc.documentElement, 'pointerup', 350, 780);
  await a.esperar(360);
  assert.deepStrictEqual(a.S().prog.B, antes, 'a revisão foi desfeita');
  a.fechar();
});

test('o segundo toque em Aplicar conserva o Plano e o Desfazer', async () => {
  const a = await app({ aba: 'prescricao' });
  await a.pronto();
  await revisaoLida(a);
  const aplica = a.$('[data-a="revisao-aplica"]');
  aplica.getBoundingClientRect = () => ({ left: 20, right: 394, top: 500, bottom: 558 });
  let instante = 0;
  a.window.performance.now = () => instante;
  dedo(a, aplica, 'click', 207, 529);
  await a.esperar();
  instante += 320;
  const linha = a.$('[data-a="plano-treino-HX"]');
  dedo(a, linha, 'pointerdown', 207, 529);
  dedo(a, linha, 'pointerup', 207, 529);
  dedo(a, linha, 'click', 207, 529);
  assert.ok(a.$('[data-a="plano-revisao"]'), 'o segundo toque não abriu o HX');
  assert.ok(a.$('[data-a="aviso-acao"]'), 'Desfazer continua disponível');
  a.clicar('[data-a="aviso-acao"]');
  await a.esperar();
  assert.ok(!a.S().prog.B.ex.some(x => x.id === 'maquina-de-sissy-squat'));
  a.fechar();
});

test('Tentar de novo aplica a revisão com as mesmas escolhas no disco', async () => {
  const a = await noPrograma();
  await revisaoLida(a);
  a.clicar('[data-a="mud-B:sai:cadeira-extensora"]');
  a.encheCota();
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar();
  assert.ok(a.$('[data-a="falhou-tenta"]'));
  a.encheCota(false);
  a.clicar('[data-a="falhou-tenta"]');
  await a.esperar();
  const disco = JSON.parse(a.window.localStorage.getItem('lastro-v1'));
  assert.ok(disco.prog.B.ex.some(x => x.id === 'maquina-de-sissy-squat'), 'guardou a entrada');
  assert.ok(disco.prog.B.ex.some(x => x.id === 'cadeira-extensora'), 'respeitou a saída desmarcada');
  assert.ok(!disco.progTreinador.dias.B.ex.some(x => x.id === 'cadeira-extensora'));
  assert.ok(a.$('[data-a="aviso-acao"]'));
  a.fechar();
});

test('o toque repetido em Aplicar não desfaz quando os botões se sobrepõem', async () => {
  const a = await app({ aba: 'prescricao' });
  await a.pronto();
  await revisaoLida(a);
  const antes = a.S().prog.B;
  let instante = 0;
  a.window.performance.now = () => instante;
  a.window.matchMedia = () => ({ matches: true });
  const quadros = [];
  a.window.requestAnimationFrame = cb => quadros.push(cb);
  a.doc.startViewTransition = desenha => {
    a.window.setTimeout(() => { instante = 400; desenha(); }, 0);
    return a.doc.activeViewTransition = { skipTransition() {}, ready: Promise.resolve() };
  };
  const aplica = a.$('[data-a="revisao-aplica"]');
  aplica.getBoundingClientRect = () => ({ left: 20, right: 394, top: 750, bottom: 808 });
  dedo(a, aplica, 'click', 340, 779);
  await a.esperar();
  const aviso = a.$('#toast .aviso');
  aviso.getBoundingClientRect = () => ({ left: 14, right: 400, top: 752, bottom: 808 });
  const desfazer = aviso.querySelector('button');
  function tocaDesfazer(ms) {
    instante = ms;
    for (const tipo of ['pointerdown', 'pointerup', 'click']) dedo(a, desfazer, tipo, 340, 779);
  }
  for (const ms of [560, 720]) {
    instante = ms;
    quadros.splice(0).forEach(cb => cb(ms));
  }
  tocaDesfazer(990); // 270 ms depois de apresentar o aviso, 590 ms depois do desenho
  await a.esperar();
  assert.notDeepStrictEqual(a.gravado().prog.B, antes, 'o toque duplo conservou a revisão no disco');
  assert.ok(desfazer.isConnected);
  tocaDesfazer(1370);
  await a.esperar();
  assert.deepStrictEqual(a.gravado().prog.B, antes);
  assert.strictEqual(a.toast(), 'Revisão desfeita.');
  a.fechar();
});

for (const [situacao, falha] of [['falhou', true], ['teve sucesso', false]]) {
  test('revisão recusada quando a gravação seguinte ' + situacao, async () => {
    const a = await noPrograma();
    await revisaoLida(a);
    a.clicar('[data-a="mud-B:sai:cadeira-extensora"]');
    a.encheCota();
    a.clicar('[data-a="revisao-aplica"]');
    await a.esperar();
    a.encheCota(falha);
    await a.E('grava()'); // a escrita que a sincronia faz depois do rollback
    a.encheCota(false);
    if (falha) {
      a.clicar('[data-a="falhou-tenta"]');
    } else {
      assert.ok(!a.$('[data-a="falhou-tenta"]'));
      assert.match(a.texto('.v3-revisao-confirmar'), /A revisão não foi aplicada/);
      a.clicar('[data-a="revisao-aplica"]');
    }
    await a.esperar();
    const disco = a.gravado();
    assert.ok(disco.prog.B.ex.some(x => x.id === 'maquina-de-sissy-squat'));
    assert.ok(disco.prog.B.ex.some(x => x.id === 'cadeira-extensora'));
    assert.ok(!disco.progTreinador.dias.B.ex.some(x => x.id === 'cadeira-extensora'));
    assert.ok(a.$('[data-a="aviso-acao"]'));
    a.fechar();
  });
}

test('uma revisão recusada conserva os carimbos e a edição do outro aparelho', async () => {
  const a = await noPrograma();
  await revisaoLida(a);
  const marcas = () => a.J('({ mtime: S.mtime, carimbos: S.carimbos, carimbosEm: S.carimbosEm, impressoes })');
  const antes = marcas();
  const remoto = a.S();
  const em = a.E('Date.now()') + 1000;
  remoto.prog.B.ex[0].s = 9;
  remoto.carimbos = { ...remoto.carimbos, prog: em };
  remoto.carimbosEm = remoto.mtime = em;
  a.viajar(2000);
  a.encheCota();
  await a.v('ctx.incorporaRevisao');
  assert.deepStrictEqual(marcas(), antes);
  a.encheCota(false);
  await a.E('save()');
  assert.strictEqual(a.gravado().carimbos.prog, antes.carimbos.prog);
  assert.strictEqual(a.E('funde(S, ' + JSON.stringify(remoto) + ', Date.now()).estado.prog.B.ex[0].s'), 9);
  a.fechar();
});

test('variações de caixa compartilham a pergunta e o id, inclusive ao reativar após desfazer', async () => {
  const a = await noPrograma();
  const texto = TEXTO_NOVO + '\nTreino C · Costas\n- Máquina de Sissy Squat · 2 x 10-12';
  const id = 'maquina-de-sissy-squat';
  await revisaoLida(a, texto);
  const r = a.vJ('ctx.revisao');
  assert.strictEqual(r.perguntas.length, 1);
  assert.deepStrictEqual(r.novos, ['Máquina de sissy squat']);
  for (let vez = 0; vez < 2; vez++) {
    if (vez) await revisaoLida(a, texto);
    await a.v('ctx.incorporaRevisao');
    const s = a.gravado();
    assert.ok(!s.ex[id].arq && !s.ex[id + '-2']);
    for (const prog of [s.prog, s.progTreinador.dias]) {
      for (const dia of ['B', 'C']) assert.ok(prog[dia].ex.some(x => x.id === id));
    }
    a.clicar('[data-a="aviso-acao"]');
    await a.esperar();
    assert.strictEqual(a.gravado().ex[id].arq, 1);
  }
  a.fechar();
});

test('a saída ainda ativa protege a linha sob Aplicar depois da janela de toque duplo', async () => {
  const a = await app({ aba: 'prescricao' });
  await a.pronto();
  await revisaoLida(a);
  const doc = a.doc;
  let instante = 0;
  a.window.performance.now = () => instante;
  a.window.matchMedia = () => ({ matches: true });
  a.window.requestAnimationFrame = cb => { cb(); return 0; };
  doc.startViewTransition = desenha => {
    a.window.setTimeout(desenha, 0);
    return doc.activeViewTransition = { skipTransition() {}, ready: Promise.resolve() };
  };
  const aplica = a.$('[data-a="revisao-aplica"]');
  aplica.getBoundingClientRect = () => ({ left: 20, right: 394, top: 500, bottom: 558 });
  dedo(a, aplica, 'click', 300, 530);
  await a.esperar();
  const linha = a.$('[data-a="plano-treino-HX"]');
  doc.elementFromPoint = () => linha;
  instante = 650;
  a.viajar(650);
  for (const tipo of ['pointerdown', 'pointerup', 'click']) dedo(a, doc.documentElement, tipo, 300, 530);
  await a.esperar();
  assert.ok(a.$('[data-a="plano-revisao"]') && a.$('[data-a="aviso-acao"]'));
  a.fechar();
});

test('a segunda aplicação durante a escrita pendente não duplica o histórico', async () => {
  const a = await noPrograma();
  await revisaoLida(a, TEXTO_NOVO + '\nTreino F · Braços\n- Rosca martelo · 3 x 10-15');
  a.clicar('[data-a="mud-F:dia"]');
  const logAntes = a.S().progLog.length;
  const primeira = a.v('ctx.incorporaRevisao');
  // O F deixado de fora ainda dá uma escolha válida enquanto a primeira gravação espera.
  assert.ok(a.vJ('ctx.revisao').pode);
  await a.v('ctx.incorporaRevisao');
  await primeira;
  assert.strictEqual(a.gravado().progLog.length, logAntes + 2);
  a.fechar();
});

test('o toque fora preserva o aviso nos primeiros 500 ms e o dispensa depois', async () => {
  const a = await noPrograma();
  await revisaoLida(a);
  let agora = a.window.Date.now();
  a.window.Date.now = () => agora;
  await a.v('ctx.incorporaRevisao');
  const no = a.$('#toast .aviso');
  no.getBoundingClientRect = () => ({ left: 14, right: 400, top: 752, bottom: 808 });
  agora += 320;
  dedo(a, a.doc.body, 'pointerdown', 100, 450);
  assert.ok(a.$('[data-a="aviso-acao"]'));
  agora += 330;
  dedo(a, a.doc.body, 'pointerdown', 100, 450);
  assert.ok(!a.$('[data-a="aviso-acao"]'));
  a.fechar();
});

test('a revisão traz um treino novo com série de tempo, tipo de carga e bi-set, e o app os guarda', async () => {
  const texto = `Revisão 23/11
Treino IA · Glúteo + posterior
- Hip thrust com barra · 4 x 8-12 · RIR 1-2 · 2:30 · glúteo · carga: barra · dica: pausa de 1 s no topo; costelas para baixo
- Pallof press · 3 x 10/lado · RIR 2 · 60 s · core · dica: bi-set com o de baixo; comece pela esquerda
- Prancha lateral com giro · 2 x 30 s/lado · RIR 2 · 60 s · core`;
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await revisaoLida(a, texto);
  const r = a.vJ('ctx.revisao');
  assert.deepStrictEqual(r.problemas || [], [], 'o texto inteiro foi entendido');
  a.clicar('[data-a="revisao-aplica"]');
  await a.esperar(120);
  const hip = a.E('Object.keys(S.ex).filter(k => S.ex[k].n === "Hip thrust com barra").map(k => S.ex[k])')[0];
  assert.ok(hip, 'o hip thrust com barra entrou no catálogo');
  assert.strictEqual(hip.car, 'barra', 'com o tipo de carga que a linha disse');
  assert.strictEqual(hip.cue, 'pausa de 1 s no topo; costelas para baixo', 'e a dica inteira, com o ";"');
  const pr = a.E('Object.keys(S.ex).filter(k => S.ex[k].n === "Prancha lateral com giro").map(k => S.ex[k])')[0];
  assert.deepStrictEqual([pr.car, pr.u || '-', pr.q || '-', pr.g || '-'].join(' '), 'corpo - - -', 'a prancha nasce sem carga e sem grupo; a grandeza fica no slot');
  const IA = JSON.parse(a.E('JSON.stringify((S.prog.IA || S.progTreinador.dias.IA).ex.map(x => [x.s, x.r, x.u || "", x.q || 0, x.bi || 0]))'));
  assert.deepStrictEqual(IA, [[4, '8–12', '', 0, 0], [3, '10', '', 0, 1], [2, '', 'seg', 30, 0]],
    'no programa: a faixa, o bi-set do pallof com a prancha e a série de tempo');
  a.fechar();
});

test('tempo e bi-set deixados de fora viram diferença; e uma revisão que volta o tempo para repetições grava repetições', async () => {
  const r1 = `Revisão 23/11
Treino IA · Core
- Pallof press · 3 x 10 · 60 s
- Prancha lateral com giro · 2 x 30 s · 60 s`;
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await revisaoLida(a, r1); a.clicar('[data-a="revisao-aplica"]'); await a.esperar(120);
  const pid = a.E('Object.keys(S.ex).find(k => S.ex[k].n === "Prancha lateral com giro")');
  // a revisão 2 muda o tempo e põe o bi-set; ele deixa as duas de fora
  await revisaoLida(a, r1.replace('2 x 30 s', '2 x 45 s').replace('3 x 10 · 60 s', '3 x 10 · 60 s · dica: bi-set com o de baixo').replace('23/11', '24/11'));
  for (const m of a.vJ('ctx.revisao').grupos.flatMap(g => g.mudancas)) a.clicar('[data-a="mud-' + m.k + '"]');
  await a.esperar();
  a.clicar('[data-a="revisao-aplica"]'); await a.esperar(120);
  const dif = a.E('JSON.stringify(difDoDia("IA").map(x => x.k + ": " + x.txt))');
  assert.match(dif, /tempo: Prancha lateral com giro: 30 s, não 45 s/);
  assert.match(dif, /bi: Pallof press: sem bi-set, não bi-set/);
  // a revisão 3 volta a prancha para repetições, por lado; agora ele aceita tudo
  await revisaoLida(a, r1.replace('2 x 30 s', '3 x 10/lado').replace('23/11', '25/11'));
  a.clicar('[data-a="revisao-aplica"]'); await a.esperar(120);
  const slot = JSON.parse(a.E('JSON.stringify(treino("IA").ex.find(x => x.id === ' + JSON.stringify(pid) + '))'));
  assert.deepStrictEqual([slot.s, slot.r, slot.u || null], [3, '10', null], 'a série vai ao histórico como repetições: o catálogo não insiste em segundos');
  const prog = montaArquivos(a.S(), { agora: Date.now() })['treino/programa.md'];
  const linha = prog.split('\n').filter(l => /Prancha lateral com giro/.test(l)).join(' | ');
  assert.ok(/\b10\b/.test(linha) && !/\b(30|45) ?s\b/.test(linha), 'o espelho mostra repetições: ' + linha);
  a.fechar();
});

test('o "por perna" deixado de fora vira diferença, e o espelho o mostra', async () => {
  const r1 = `Revisão 23/11
Treino IB · Pernas
- Afundo reverso com halteres · 3 x 8-12 · 90 s`;
  const a = await app({ aba: 'agora' });
  await a.pronto();
  await revisaoLida(a, r1); a.clicar('[data-a="revisao-aplica"]'); await a.esperar(120);
  await revisaoLida(a, r1.replace('3 x 8-12', '3 x 8-12/perna').replace('23/11', '24/11'));
  const ms = a.vJ('ctx.revisao').grupos.flatMap(g => g.mudancas);
  assert.deepStrictEqual(ms.map(m => m.titulo), ['Afundo reverso com halteres: 8–12 repetições → 8–12 repetições por perna']);
  a.clicar('[data-a="mud-' + ms[0].k + '"]'); await a.esperar();
  a.clicar('[data-a="revisao-aplica"]'); await a.esperar(120);
  const dif = a.E('JSON.stringify(difDoDia("IB").map(x => x.txt))');
  assert.match(dif, /Afundo reverso com halteres: 8–12 repetições, não 8–12 repetições por perna/);
  const doTreinador = montaArquivos(a.S(), { agora: Date.now() })['treino/programa-do-treinador.md'];
  assert.match(doTreinador.split('\n').filter(l => /Afundo reverso/.test(l)).join(' '), /8[–-]12 por perna/);
  a.fechar();
});
