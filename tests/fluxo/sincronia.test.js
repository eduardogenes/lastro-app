// A orquestração da sincronização, com a rede simulada.
//
// A fusão em si é testada em tests/dominio/sincronia.test.ts, sem app. Aqui é o
// ciclo: quando puxa, quando funde, quando empurra, e o que acontece quando o
// outro aparelho grava no meio do caminho.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel } from './harness.js';

/** Instala uma nuvem de mentira no escopo do app. */
function nuvemFalsa(a, inicial) {
  a.E(`
    globalThis.__nuvem = {
      linha: ${JSON.stringify(inicial === undefined ? null : inicial)},
      empurros: [], puxadas: 0, falha: null, conflitaUmaVez: false
    };
    NUVEM.sessao = function () { return { email: 'eu@exemplo.com', uid: 'u1' }; };
    NUVEM.pronta = async function () { return NUVEM.sessao(); };
    NUVEM.puxa = async function () {
      const n = globalThis.__nuvem;
      n.puxadas++;
      if (n.falha) return { ok: false, erro: n.falha, msg: 'falhou: ' + n.falha };
      return { ok: true, v: n.linha };
    };
    NUVEM.empurra = async function (deV, data) {
      const n = globalThis.__nuvem;
      if (n.falha) return { ok: false, erro: n.falha, msg: 'falhou: ' + n.falha };
      if (n.conflitaUmaVez) {
        n.conflitaUmaVez = false;
        return { ok: false, erro: 'conflito', msg: 'outro aparelho gravou antes' };
      }
      const v = (n.linha ? n.linha.v : 0) + 1;
      n.linha = { v: v, data: JSON.parse(JSON.stringify(data)) };
      n.empurros.push({ deV: deV, v: v });
      return { ok: true, v: v };
    };
  `);
}
const nuvem = a => a.J('globalThis.__nuvem');

test('sem conta, o app não fala com a nuvem', async () => {
  const a = await app();
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  assert.strictEqual(a.dado('sync').sujo, false, 'nem marca sujeira');
  await a.v('sincroniza');
  assert.strictEqual(a.dado('sync').v, null);
  a.fechar();
});

test('primeira sincronização cria a linha e sobe o que existe', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();

  await a.v('sincroniza');
  const n = nuvem(a);
  assert.strictEqual(n.empurros.length, 1);
  assert.strictEqual(n.empurros[0].deV, null, 'linha nova: parte do nada');
  assert.ok(n.linha.data.logs['chest-press-inclinado-convergente'], 'a série subiu');
  assert.strictEqual(a.dado('sync').v, 1);
  assert.strictEqual(a.dado('sync').sujo, false, 'limpou depois de subir');
  a.fechar();
});

test('o que o outro aparelho gravou desce e se junta ao daqui', async () => {
  const t = Date.now() - 3 * 86400000;
  const a = await app();
  // a nuvem já tem um treino que este aparelho nunca viu
  nuvemFalsa(a, { v: 7, data: {
    logs: { 'pendulum-squat': [{ t: t, sid: t, sets: [[120, 8]] }] },
    done: [{ day: 'B', t: t, sid: t, dur: 0 }],
    body: { peso: [], cintura: [] }, cardio: [], ex: {}, carga: {},
    progLog: [], apagados: {}, mtime: t, export: 0
  } });

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);          // e aqui tem um treino de hoje
  await a.esperar();
  await a.v('sincroniza');

  assert.strictEqual(a.S().logs["pendulum-squat"].length, 1, 'desceu o de lá');
  assert.strictEqual(a.S().logs["chest-press-inclinado-convergente"].length, 1, 'e o daqui ficou');
  assert.strictEqual(a.S().done.length, 2, 'as duas sessões');

  const n = nuvem(a);
  assert.strictEqual(n.empurros[0].deV, 7, 'a escrita declarou de que versão partiu');
  assert.strictEqual(n.linha.data.done.length, 2, 'e a nuvem ficou com as duas');
  a.fechar();
});

test('conflito no meio do caminho refaz o ciclo em vez de perder', async () => {
  const a = await app();
  nuvemFalsa(a, { v: 3, data: {
    logs: {}, done: [], body: { peso: [], cintura: [] }, cardio: [],
    ex: {}, carga: {}, progLog: [], apagados: {}, mtime: 1, export: 0
  } });
  a.E('globalThis.__nuvem.conflitaUmaVez = true');

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.v('sincroniza');

  const n = nuvem(a);
  assert.strictEqual(n.puxadas, 2, 'releu depois do conflito');
  assert.strictEqual(n.empurros.length, 1, 'e gravou na segunda tentativa');
  assert.strictEqual(a.S().logs["chest-press-inclinado-convergente"].length, 1,
    'a série local sobreviveu ao conflito');
  assert.strictEqual(a.dado('sync').sujo, false);
  a.fechar();
});

test('sem rede, o app não perde nada e volta a sincronizar depois', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.E("globalThis.__nuvem.falha = 'rede'");

  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.v('sincroniza');

  assert.ok(a.dado('sync').erro, 'a tela sabe que falhou');
  assert.strictEqual(a.dado('sync').sujo, true, 'e continua devendo o envio');
  assert.strictEqual(a.S().logs["chest-press-inclinado-convergente"].length, 1,
    'a série está registrada localmente do mesmo jeito');

  a.E("globalThis.__nuvem.falha = null");
  await a.v('sincroniza');
  assert.strictEqual(a.dado('sync').sujo, false, 'ao voltar a rede, sobe');
  assert.strictEqual(nuvem(a).linha.data.done.length, 1);
  a.fechar();
});

test('nada mudou de nenhum lado: não reescreve à toa', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  await a.v('sincroniza');
  const depoisDoPrimeiro = nuvem(a).empurros.length;

  await a.v('sincroniza');
  assert.strictEqual(nuvem(a).empurros.length, depoisDoPrimeiro,
    'segunda chamada sem mudança não gera escrita');
  a.fechar();
});

test('apagar aqui não é desfeito pelo que a nuvem ainda tem', async () => {
  const t = Date.now() - 2 * 86400000;
  const a = await app({ estado: {
    logs: {}, done: [], body: { peso: [{ t: t, v: 73.4 }], cintura: [] }, cardio: []
  } });
  nuvemFalsa(a, null);
  await a.v('sincroniza');                     // a nuvem passa a ter a pesagem
  assert.strictEqual(nuvem(a).linha.data.body.peso.length, 1);

  await a.E('delBody("peso", ' + t + ')');       // apagou aqui
  await a.esperar();
  await a.v('sincroniza');

  assert.strictEqual(a.S().body.peso.length, 0, 'apagada aqui');
  assert.strictEqual(nuvem(a).linha.data.body.peso.length, 0, 'e apagada na nuvem');
  assert.ok(Object.keys(a.S().apagados).length > 0, 'a lápide viajou junto');
  a.fechar();
});

test('dia marcado como descanso viaja e some quando desmarcado', async () => {
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [] } });
  nuvemFalsa(a, null);

  await a.v('alternaDescanso', ontem);
  await a.esperar();
  await a.v('sincroniza');
  assert.strictEqual(Object.keys(nuvem(a).linha.data.descanso).length, 1, 'subiu a marca');

  await a.v('alternaDescanso', ontem);   // desmarcou
  await a.esperar();
  await a.v('sincroniza');
  assert.strictEqual(Object.keys(nuvem(a).linha.data.descanso).length, 0,
    'desmarcar não é desfeito pela nuvem que ainda tinha a marca');
  a.fechar();
});

test('descanso não conta como treino em lugar nenhum', async () => {
  const ontem = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [] } });
  await a.v('alternaDescanso', ontem);
  await a.esperar();
  assert.strictEqual(a.S().done.length, 0, 'não entra em done');
  assert.strictEqual(a.v('sessoesDeTrabalho'), 0, 'nem na conta do bloco');
  assert.strictEqual(a.v('ehDescanso', ontem), true, 'mas o calendário sabe');
  a.fechar();
});

test('dia com treino registrado recusa a marca de descanso', async () => {
  const t = Date.now() - 86400000;
  const a = await app({ estado: { logs: {}, done: [{ day: 'A', t: t, sid: t, dur: 0 }] } });
  await a.v('alternaDescanso', t);
  await a.esperar();
  assert.strictEqual(a.v('ehDescanso', t), false,
    'o fato já respondeu: o app não pode afirmar as duas coisas');
  a.fechar();
});

test('a tela de lançamento aguenta a opção de descanso', async () => {
  // regressão: 'descanso' não é letra da rotação, e descrever o treino dela
  // derrubava a tela inteira antes de qualquer mensagem
  const a = await app({ estado: { logs: {}, done: [] } });
  a.v('abrirAdicionar', (Date.now() - 86400000));
  const rotulos = a.$$('.chips .ins-chip').map(x => x.textContent);
  assert.ok(rotulos.includes('foi descanso'), rotulos.join(' | '));

  a.v('addSet', 'tipo', 'descanso');
  assert.ok(a.$('.add-acoes .ins-btn-primary'), 'a tela continua de pé');
  assert.match(a.$('.add-acoes .ins-btn-primary').textContent, /descanso/i);
  assert.strictEqual(a.$('#ahora'), null, 'descanso não tem horário nem duração');
  a.fechar();
});

test('o descanso aparece nas duas telas, e do mesmo jeito', async () => {
  // a tira da semana e o calendário do mês mostram a MESMA semana: divergir
  // seria o app contando duas histórias sobre o mesmo domingo
  // relógio fixo: o domingo da semana corrente precisa cair no MÊS corrente,
  // senão o calendário do mês — corretamente — não tem onde mostrá-lo
  const a = await app({ agora: agoraEstavel(), estado: { logs: {}, done: [] } });
  const dom = a.E('weekStart(Date.now())');

  const antes = a.$$('.wd .wd-v').map(x => x.textContent);
  assert.strictEqual(antes[0], '+', 'sem marca, o domingo convida a registrar');

  await a.v('alternaDescanso', dom);
  await a.esperar();

  const cel = a.$$('.wd')[0];
  assert.strictEqual(cel.querySelector('.wd-v').textContent, '–', 'vira traço');
  assert.ok(cel.className.includes('descanso'));
  assert.ok(!cel.className.includes('feito'), 'e nunca com o peso de dia treinado');

  a.aba('dados');
  await a.modo('treino');
  assert.strictEqual(a.$$('.cal-d.descanso').length, 1, 'o mês diz a mesma coisa');
  a.fechar();
});

// ===========================================================================
// Entrar e sair da conta, pelas chaves de `CTX`
// ===========================================================================
//
// Os casos acima usam `nuvemFalsa`, que já entra com a sessão pronta: o CICLO
// tinha rede, a PORTA não. `nuvemCampo`, `entrarNaNuvem`, `sairDaNuvem` e
// `sincronizaAgora` não tinham caso próprio — e são a custódia do dado dele
// fora do aparelho.
//
// Cobrem o modelo e não a fiação: que a capacidade existe e o que ela promete.
// Não dizem nada sobre haver formulário de login na tela nova ligado nelas.

/** `entrar` e `sair` de mentira, sem a sessão já montada. */
function portaFalsa(a, resposta) {
  a.E(`
    globalThis.__porta = { tentativas: [], saiu: 0, empurros: 0 };
    globalThis.__ses = null;
    NUVEM.sessao = function () { return globalThis.__ses; };
    NUVEM.pronta = async function () { return globalThis.__ses; };
    NUVEM.entrar = async function (email, senha) {
      globalThis.__porta.tentativas.push({ email: email, senha: senha });
      const r = ${JSON.stringify(resposta)};
      if (r.ok) globalThis.__ses = r.v;
      return r;
    };
    NUVEM.sair = async function () { globalThis.__porta.saiu++; globalThis.__ses = null; };
    NUVEM.puxa = async function () { return { ok: true, v: null }; };
    NUVEM.empurra = async function () { globalThis.__porta.empurros++; return { ok: true, v: 1 }; };
  `);
}
const porta = a => a.J('globalThis.__porta');

test('ctx.entrarNaNuvem cobra os dois campos antes de falar com a rede', async () => {
  const a = await app({ aba: 'guia' });
  portaFalsa(a, { ok: true, v: { email: 'eu@exemplo.com', uid: 'u1' } });

  await a.v('ctx.entrarNaNuvem');
  await a.esperar(40);
  assert.strictEqual(porta(a).tentativas.length, 0, 'sem campo nenhum, não bate na rede');
  assert.strictEqual(a.vJ('ctx.nuvem').erro, 'preencha e-mail e senha');

  a.v('ctx.nuvemCampo', 'email', 'eu@exemplo.com');
  assert.strictEqual(a.vJ('ctx.nuvem').erro, null, 'digitar limpa o erro anterior');
  assert.strictEqual(a.vJ('ctx.nuvem').email, 'eu@exemplo.com', 'e o campo fica na tela');

  await a.v('ctx.entrarNaNuvem');
  await a.esperar(40);
  assert.strictEqual(porta(a).tentativas.length, 0, 'só com e-mail também não');
  assert.strictEqual(a.vJ('ctx.nuvem').erro, 'preencha e-mail e senha');
  a.fechar();
});

test('ctx.entrarNaNuvem entra, apara o e-mail e não deixa a senha na memória da tela', async () => {
  const a = await app({ aba: 'guia' });
  portaFalsa(a, { ok: true, v: { email: 'eu@exemplo.com', uid: 'u1' } });

  a.v('ctx.nuvemCampo', 'email', '  eu@exemplo.com  ');
  a.v('ctx.nuvemCampo', 'senha', 'segredo');
  await a.v('ctx.entrarNaNuvem');
  await a.esperar(60);

  assert.deepStrictEqual(porta(a).tentativas, [{ email: 'eu@exemplo.com', senha: 'segredo' }],
    'o espaço colado junto com o e-mail é aparado antes de ir para a rede');

  const vm = a.vJ('ctx.nuvem');
  assert.strictEqual(vm.dentro, true, 'entrou');
  assert.strictEqual(vm.conta, 'eu@exemplo.com', 'e a tela diz de quem é a conta');
  // Lido em `view`, e não na leitura `ctx.nuvem`: logado, a leitura NÃO TEM
  // campo `senha`, então `vm.senha === undefined` passaria com a senha ainda
  // guardada. Era uma asserção que não sabia ficar vermelha — fora.
  assert.strictEqual(a.vista().nuvemForm, null,
    'a senha não fica pendurada na memória da tela depois de usada');

  // Entrar DISPARA a sincronização, e é por isso que o toast que sobra na tela
  // é o dela e não o do login: `entrarNaNuvem` termina em
  // `sincroniza({ manual: true })`. É a capacidade que importa — primeiro login
  // neste aparelho parte de `sync.v = null`, então tudo se funde em vez de o
  // aparelho novo sobrescrever a nuvem.
  assert.strictEqual(porta(a).empurros, 1, 'entrar já sincroniza, sem segundo toque');
  assert.ok(a.dado('sync').em > 0, 'e carimba a hora');
  a.fechar();
});

test('ctx.entrarNaNuvem com senha errada mostra o motivo e não entra', async () => {
  const a = await app({ aba: 'guia' });
  portaFalsa(a, { ok: false, erro: 'auth', msg: 'e-mail ou senha não conferem' });

  a.v('ctx.nuvemCampo', 'email', 'eu@exemplo.com');
  a.v('ctx.nuvemCampo', 'senha', 'errada');
  await a.v('ctx.entrarNaNuvem');
  await a.esperar(60);

  const vm = a.vJ('ctx.nuvem');
  assert.strictEqual(vm.dentro, false, 'não entrou');
  assert.strictEqual(vm.erro, 'e-mail ou senha não conferem', 'e o motivo é o da rede, não um genérico');
  assert.strictEqual(vm.rodando, false, 'e o botão volta de "entrando..."');
  assert.strictEqual(vm.email, 'eu@exemplo.com', 'o e-mail digitado fica, para ele só corrigir a senha');
  a.fechar();
});

test('ctx.sairDaNuvem pergunta, e o histórico continua no aparelho', async () => {
  // Sair é o gesto mais fácil de confundir com apagar. O aviso promete que o
  // histórico fica — e o que ele promete é o que este caso cobra.
  const t = Date.now() - 2 * 86400000;
  const a = await app({ aba: 'guia', estado: {
    logs: { A0: [{ t: t, sid: t, sets: [[70, 8]] }] }, done: [{ day: 'A', t: t, sid: t }]
  } });
  portaFalsa(a, { ok: true, v: { email: 'eu@exemplo.com', uid: 'u1' } });
  a.v('ctx.nuvemCampo', 'email', 'eu@exemplo.com');
  a.v('ctx.nuvemCampo', 'senha', 'segredo');
  await a.v('ctx.entrarNaNuvem');
  await a.esperar(60);

  a.recusar();
  await a.v('ctx.sairDaNuvem');
  await a.esperar(40);
  assert.strictEqual(porta(a).saiu, 0, 'recusar não sai');
  assert.strictEqual(a.vJ('ctx.nuvem').dentro, true);
  const q = a.perguntas().join(' | ');
  assert.ok(/histórico continua aqui/.test(q), 'o aviso promete que o histórico fica: ' + q);
  assert.ok(/para de sincronizar/.test(q), 'e diz o que de fato acontece: ' + q);

  a.aceitar();
  await a.v('ctx.sairDaNuvem');
  await a.esperar(60);

  assert.strictEqual(porta(a).saiu, 1, 'saiu');
  assert.strictEqual(a.vJ('ctx.nuvem').dentro, false);
  assert.strictEqual(a.S().done.length, 1, 'e o histórico continua aqui, como prometido');
  assert.deepStrictEqual(a.log('A', 0)[0].sets[0], [70, 8], 'com as séries dentro');
  assert.strictEqual(a.dado('sync').em, 0, 'o relógio da sincronização zera: não há com quem comparar');
  assert.strictEqual(a.dado('sync').sujo, false);
  a.fechar();
});

test('ctx.sincronizaAgora é a porta manual do mesmo ciclo', async () => {
  const a = await app();
  nuvemFalsa(a, null);
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();

  await a.v('ctx.sincronizaAgora');
  await a.esperar(80);

  const n = nuvem(a);
  assert.strictEqual(n.empurros.length, 1, 'o toque manual sobe o que existe');
  assert.strictEqual(a.dado('sync').sujo, false, 'e limpa a sujeira');
  assert.ok(a.dado('sync').em > 0, 'carimbando a hora, que é o que a tela mostra');
  a.fechar();
});

// ===========================================================================
// Apagar TODO o histórico, com os dois aparelhos
// ===========================================================================
//
// `wipe` é a única ação que apaga o histórico inteiro, e o aviso dela promete
// *"Isso não tem volta."* Promessa que vale num aparelho só é promessa falsa:
// sem lápide, a fusão lê os registros do outro lado como registros que este
// aparelho simplesmente não tem — e os traz de volta.
//
// Os casos abaixo precisam de uma nuvem SÓ com dois apps em cima dela.
// `nuvemFalsa` monta uma linha POR aparelho, e duas linhas nunca se encontram.

/**
 * Uma linha de nuvem no realm do Node, compartilhada por quantos aparelhos
 * quiserem. A trava de versão é a de verdade: escrita que parte de versão
 * vencida é recusada com `conflito`, e o app relê, funde e tenta de novo.
 *
 * Atravessa o realm por STRING, nos dois sentidos: objeto do Node desserializado
 * dentro do jsdom chega com o protótipo errado, e é o app que vai fundi-lo.
 */
function nuvemDeDois(inicial) {
  const nuvem = { linha: inicial || null, empurros: [] };
  nuvem.liga = function (a) {
    a.window.__cloudLe = function () {
      return nuvem.linha ? JSON.stringify(nuvem.linha) : '';
    };
    a.window.__cloudGrava = function (deV, dataJSON) {
      const atual = nuvem.linha ? nuvem.linha.v : null;
      const de = deV === '' ? null : Number(deV);
      if (de !== atual) {
        return JSON.stringify({ ok: false, erro: 'conflito', msg: 'outro aparelho gravou antes' });
      }
      const v = (atual || 0) + 1;
      nuvem.linha = { v: v, data: JSON.parse(dataJSON) };
      nuvem.empurros.push(v);
      return JSON.stringify({ ok: true, v: v });
    };
    a.E(`
      NUVEM.sessao = function () { return { email: 'eu@exemplo.com', uid: 'u1' }; };
      NUVEM.pronta = async function () { return NUVEM.sessao(); };
      NUVEM.puxa = async function () {
        const s = globalThis.__cloudLe();
        return { ok: true, v: s ? JSON.parse(s) : null };
      };
      NUVEM.empurra = async function (deV, data) {
        return JSON.parse(globalThis.__cloudGrava(deV == null ? '' : String(deV), JSON.stringify(data)));
      };
      NUVEM.subirFoto = async function () { return { ok: true, v: true }; };
      NUVEM.baixaFoto = async function () { return { ok: true, v: null }; };
      NUVEM.subirCorpo = async function () { return { ok: true, v: true }; };
      NUVEM.baixaCorpo = async function () { return { ok: true, v: null }; };
    `);
  };
  return nuvem;
}

const T_HIST = Date.now() - 3 * 86400000;

/** O mesmo histórico nos dois aparelhos: é o que dois aparelhos sincronizados têm. */
function historico() {
  return {
    logs: { A0: [{ t: T_HIST, sid: T_HIST, sets: [[60, 10], [60, 10]] }] },
    done: [{ day: 'A', t: T_HIST, sid: T_HIST, dur: 40 * 60000 }],
    cardio: [{ t: T_HIST, m: 'bike', min: 25, i: 'moderado' }],
    body: { peso: [{ t: T_HIST, v: 80 }], cintura: [] }
  };
}

/** Quanto histórico este aparelho tem agora, por família. */
function acervo(a) {
  const d = a.S();
  return {
    exercicios: Object.keys(d.logs).length,
    sessoes: d.done.length,
    cardio: d.cardio.length,
    pesagens: d.body.peso.length
  };
}

test('apagar todo o histórico no celular não volta pelo notebook', async () => {
  const ontem = Date.now() - 86400000;
  const nuvem = nuvemDeDois(null);

  const cel = await app({ estado: historico() });
  nuvem.liga(cel);
  await cel.v('sincroniza');
  assert.strictEqual(nuvem.linha.data.done.length, 1, 'a nuvem recebeu o histórico');

  const note = await app({ estado: historico() });
  nuvem.liga(note);
  await note.v('sincroniza');
  assert.deepStrictEqual(acervo(note), { exercicios: 1, sessoes: 1, cardio: 1, pesagens: 1 },
    'os dois aparelhos partem do MESMO histórico');

  // o dono apaga tudo no celular
  cel.aceitar();
  await cel.v('wipe');
  await cel.esperar(60);
  assert.deepStrictEqual(acervo(cel), { exercicios: 0, sessoes: 0, cardio: 0, pesagens: 0 },
    'apagou aqui');

  // e chega em casa e abre o notebook, que registra um dia de descanso
  await note.v('alternaDescanso', ontem);
  await note.esperar();

  await cel.v('sincroniza');     // o celular sobe o apagamento
  await cel.esperar(60);
  await note.v('sincroniza');    // o notebook lê e obedece
  await note.esperar(60);
  await cel.v('sincroniza');     // e o celular relê o que o notebook subiu
  await cel.esperar(60);

  assert.deepStrictEqual(acervo(cel), { exercicios: 0, sessoes: 0, cardio: 0, pesagens: 0 },
    'o histórico apagado NÃO volta pela fusão');
  assert.deepStrictEqual(acervo(note), { exercicios: 0, sessoes: 0, cardio: 0, pesagens: 0 },
    'e morre no notebook também: o aviso diz que não tem volta');
  assert.strictEqual(nuvem.linha.data.done.length, 0, 'nem sobra na nuvem');

  // o alcance é limitado: o que o notebook registrou DEPOIS do apagamento fica
  assert.strictEqual(cel.v('ehDescanso', ontem), true,
    'o descanso que o notebook marcou depois do apagamento chegou e sobreviveu');

  cel.fechar(); note.fechar();
});

test('o apagamento sobrevive a fechar o app, que é onde ele morria', async () => {
  // `wipe` removia a chave e NÃO gravava nada no lugar: as lápides ficavam só
  // na memória. Fechar o app antes do toque seguinte — abrir, apagar, guardar o
  // telefone — perdia as lápides E a prescrição que o gesto preserva, e a
  // abertura seguinte era um aparelho vazio que a nuvem reenchia.
  const nuvem = nuvemDeDois(null);

  const antes = await app({ estado: historico() });
  nuvem.liga(antes);
  await antes.v('sincroniza');                 // a nuvem fica com o histórico
  antes.aceitar();
  await antes.v('wipe');
  await antes.esperar(60);

  const disco = antes.gravado();
  assert.ok(disco, 'o apagamento FICOU gravado, em vez de só na memória');
  assert.ok(Object.keys(disco.apagados).length > 0, 'com as lápides dentro');
  assert.ok(disco.comida.plano.length > 0, 'e com a prescrição que o gesto preserva');
  antes.fechar();

  // o mesmo aparelho, reaberto do que ficou no disco
  const depois = await app({ estado: disco });
  nuvem.liga(depois);
  await depois.v('sincroniza');
  await depois.esperar(60);

  assert.deepStrictEqual(acervo(depois), { exercicios: 0, sessoes: 0, cardio: 0, pesagens: 0 },
    'reaberto, o aparelho não é reenchido pela nuvem que ainda tinha tudo');
  depois.fechar();
});
