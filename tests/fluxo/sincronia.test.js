// A orquestração da sincronização, com a rede simulada.
//
// A fusão em si é testada em tests/dominio/sincronia.test.ts, sem app. Aqui é o
// ciclo: quando puxa, quando funde, quando empurra, e o que acontece quando o
// outro aparelho grava no meio do caminho.
import { readFileSync } from 'node:fs';
import { test, vi } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';
import { montaArquivos } from '../../ferramentas/espelho/monta';

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

function ligaComSenha(conta, a) {
  conta.liga(a);
  a.E(`
    globalThis.__conectado = false;
    globalThis.__expirou = false;
    const puxa = NUVEM.puxa;
    NUVEM.puxa = () => globalThis.__expirou ? Promise.resolve({ ok: false, erro: 'auth', msg: 'sessão expirada' }) : puxa();
    NUVEM.sessao = () => globalThis.__conectado ? { email: 'ana@exemplo.com', uid: 'u1' } : null;
    NUVEM.entrar = async email => { globalThis.__conectado = true; globalThis.__expirou = false; return { ok: true, v: { email } }; };
    NUVEM.sair = async () => { globalThis.__conectado = false; return { ok: true }; };
  `);
}

async function entraComSenha(a) {
  a.v('ctx.nuvemCampo', 'email', 'ana@exemplo.com');
  a.v('ctx.nuvemCampo', 'senha', 'senha-de-teste');
  await a.v('ctx.entrarNaNuvem');
  await vi.waitFor(() => assert.ok(a.dado('sync').v != null && !a.dado('sync').rodando));
}

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

test('o que foi gravado durante o envio continua pendente e sobe em seguida', async () => {
  // Regressão (docs/mapa, risco D12): o ciclo apagava a pendência DEPOIS de a
  // nuvem responder, e uma gravação feita enquanto o pedido estava no ar era
  // dada como enviada sem ter ido.
  const a = await app();
  nuvemFalsa(a, null);
  a.v('toggle', 0);
  a.preencher(0, 0, 60, 8);
  await a.esperar();
  a.E(`
    const _empurra = NUVEM.empurra;
    let vez = 0;
    NUVEM.empurra = async function (deV, data) {
      const r = await _empurra(deV, data);
      if (vez++ === 0) { S.export = 4242; await save(); }   // grava no meio do envio
      return r;
    };
  `);

  await a.v('sincroniza');
  assert.strictEqual(a.dado('sync').sujo, true, 'a gravação do meio continua pendente');
  assert.notStrictEqual(nuvem(a).linha.data.export, 4242, 'ela ainda não subiu');

  await a.esperar(1300);                 // o ciclo seguinte é agendado sozinho
  assert.strictEqual(nuvem(a).linha.data.export, 4242, 'e sobe no ciclo seguinte');
  assert.strictEqual(a.dado('sync').sujo, false);
  a.fechar();
});

test('cada documento ganha carimbo só quando muda', async () => {
  const a = await app();
  const antes = JSON.parse(JSON.stringify(a.S().carimbos || {}));
  a.E(`S.prog.A.name = 'Treino A editado'`);
  await a.v('save');
  const c = a.S().carimbos;
  assert.ok(c.prog > (antes.prog || 0), 'o programa mudou e foi carimbado');
  assert.strictEqual(c.comida || 0, antes.comida || 0, 'o plano de comida não mudou e não ganhou carimbo');
  assert.strictEqual(a.S().carimbosEm, a.S().mtime, 'e os carimbos ficam confiáveis');
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

test('o que só este aparelho tem sobe, mesmo sem mudança nova nele (o tamanho que a nuvem perdeu)', async () => {
  // Um build antigo fundiu o dia sem conhecer o tamanho e subiu. Este aparelho,
  // que não mexeu em nada desde então, puxa e fica com o tamanho (é a mesma
  // marca): sem empurrar, a nuvem e a pasta dos agentes ficariam sem ele.
  const t = Date.now() - 2 * 86400000;
  const iso = new Date(t).toISOString().slice(0, 10);
  const dia = { d: iso, done: { almoco: t }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'mais' },
                tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: t };
  const a = await app({ estado: { logs: {}, done: [], comidaHist: [dia] } });
  nuvemFalsa(a, null);
  await a.v('sincroniza');
  await a.esperar(40);
  assert.strictEqual(nuvem(a).linha.data.comidaHist[0].tam.almoco, 'mais', 'a pré-condição: a nuvem tem o tamanho');
  const empurros = nuvem(a).empurros.length;
  // o build antigo sobe o dia sem o tamanho
  a.E(`(function () { const n = globalThis.__nuvem; const data = JSON.parse(JSON.stringify(n.linha.data));
        data.comidaHist.forEach(function (h) { delete h.tam; }); n.linha = { v: n.linha.v + 1, data: data }; })()`);
  await a.v('sincroniza');
  await a.esperar(40);
  assert.strictEqual(a.S().comidaHist[0].tam.almoco, 'mais', 'este aparelho fica com o tamanho');
  assert.ok(nuvem(a).empurros.length > empurros, 'e empurra, sem ter mudado nada aqui');
  assert.strictEqual(nuvem(a).linha.data.comidaHist[0].tam.almoco, 'mais', 'a nuvem volta a ter o tamanho');
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

  await a.v('delBody', 'peso', t);       // apagou aqui
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

test('a folha de lançamento não grava "descanso" como treino', async () => {
  // regressão: 'descanso' não é letra da rotação, e descrever o treino dela
  // derrubava a tela inteira. Pela D o descanso saiu da folha (mora no dia, com
  // o mesmo peso de "Registrar treino"), e o verbo recusa o que não é da
  // sequência em vez de gravar uma letra que não existe.
  const a = await app({ estado: { logs: {}, done: [] } });
  a.v('abrirAdicionar', (Date.now() - 86400000));
  const rotulos = a.$$('.ln-chips .ins-chip').map(x => x.textContent);
  assert.ok(!rotulos.includes('foi descanso'), rotulos.join(' | '));

  await a.v('lancaTreino', 'descanso');
  assert.strictEqual(a.S().done.length, 0, 'nada gravado');
  assert.ok(a.$('[data-a="lanca-previsto"]'), 'e a folha continua de pé');
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
  const a = await app({ aba: 'ajustes' });
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
  const a = await app({ aba: 'ajustes' });
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
  const a = await app({ aba: 'ajustes' });
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
  const a = await app({ aba: 'ajustes', estado: {
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

test('a refeição marcada HOJE não volta; a água volta, porque é contador', async () => {
  // O dia aberto não está em `comidaHist` — ele só fecha lá na virada da data —
  // e a fusão une as marcas dele pela MESMA chave de refeição. Sem lápide, a
  // marca que o apagamento levou voltava do outro aparelho. Medido: voltava.
  //
  // A água é a exceção declarada no topo de `sincronia.ts`: contador que fica
  // com o MAIOR dos dois, sem carimbo, porque "subestimar um copo é ruído
  // aceitável". Não há lápide que a alcance, e este caso diz isso em voz alta
  // em vez de deixar a surpresa para depois.
  const nuvem = nuvemDeDois(null);

  const cel = await app({ estado: { logs: {}, done: [] }, aba: 'agora' });
  nuvem.liga(cel);
  const note = await app({ estado: { logs: {}, done: [] }, aba: 'agora' });
  nuvem.liga(note);

  await cel.v('ctx.marcaRefeicao', 'almoco');
  await cel.esperar();
  await cel.v('sincroniza');
  await note.v('sincroniza');
  await note.esperar(60);
  assert.ok(note.S().dia.done.almoco, 'os dois aparelhos têm a marca de hoje');

  cel.aceitar();
  await cel.v('wipe');
  await cel.esperar(60);

  await note.v('ctx.setAgua', 3);     // o notebook mexe em hoje depois do apagamento
  await note.esperar();
  await cel.v('sincroniza');
  await cel.esperar(60);
  await note.v('sincroniza');
  await note.esperar(60);
  await cel.v('sincroniza');
  await cel.esperar(60);

  assert.deepStrictEqual(cel.S().dia.done, {}, 'a marca de hoje não volta pela fusão');
  assert.deepStrictEqual(note.S().dia.done, {}, 'e morre no notebook também');
  assert.strictEqual(cel.S().dia.agua, 3,
    'a água do notebook chega: é contador sem carimbo, e nenhuma lápide a alcança');
  cel.fechar(); note.fechar();
});

test('a água corrigida para menos não é desfeita pelo outro aparelho', async () => {
  // Regressão (docs/mapa, risco D13): a água fundia pelo maior, e corrigir para
  // menos num aparelho era desfeito pelo outro, que ainda tinha o número velho.
  const nuvem = nuvemDeDois(null);
  const cel = await app({ estado: { logs: {}, done: [] }, aba: 'agora' });
  nuvem.liga(cel);
  const note = await app({ estado: { logs: {}, done: [] }, aba: 'agora' });
  nuvem.liga(note);

  await cel.v('ctx.setAgua', 8);
  await cel.esperar(5);
  await cel.v('sincroniza');
  await note.v('sincroniza');
  await note.esperar(20);
  assert.strictEqual(note.S().dia.agua, 8);

  await note.v('ctx.setAgua', 5);       // contou de mais: corrige
  await note.esperar(5);
  await note.v('sincroniza');
  await cel.v('sincroniza');
  await cel.esperar(20);
  assert.strictEqual(cel.S().dia.agua, 5, 'a correção chegou');
  await note.v('sincroniza');
  await note.esperar(20);
  assert.strictEqual(note.S().dia.agua, 5, 'e não foi desfeita');
  cel.fechar(); note.fechar();
});

test('voltar o tipo de carga ao padrão não é desfeito pelo outro aparelho', async () => {
  const nuvem = nuvemDeDois(null);
  const cel = await app();
  nuvem.liga(cel);
  const note = await app();
  nuvem.liga(note);

  const chave = cel.E(`logKey(view.day, 0)`);
  const padrao = cel.E(`treino(view.day).ex[0].car || 'pino'`);
  const outro = padrao === 'halter' ? 'barra' : 'halter';
  await cel.E(`setCarga(0, ${JSON.stringify(outro)})`);
  await cel.esperar(5);
  await cel.v('sincroniza');
  await note.v('sincroniza');
  await note.esperar(20);
  assert.strictEqual(note.S().carga[chave], outro);

  await cel.E(`setCarga(0, ${JSON.stringify(padrao)})`);   // volta ao padrão: a chave sai
  await cel.esperar(5);
  await note.E(`S.export = 1; save()`);                      // o notebook grava outra coisa
  await note.esperar(5);
  await cel.v('sincroniza');
  await note.v('sincroniza');
  await cel.v('sincroniza');
  await cel.esperar(20);
  assert.strictEqual(cel.S().carga[chave], undefined, 'a volta ao padrão ficou');
  assert.strictEqual(note.S().carga[chave], undefined, 'nos dois aparelhos');
  cel.fechar(); note.fechar();
});


test('entrar na conta e juntar a cópia de um primeiro acesso conserva a prescrição e o histórico da conta', async () => {
  const a = await app({ aba: 'agora', estado: null });
  try {
    await a.v('ctx.avancaInicio', true);
    const copia = a.v('payload');
    const conta = { plano: 12, logs: {}, done: [{ day: 'Z', t: 1090, sid: 1090 }],
      prog: { Z: { name: 'Programa da conta', tag: '', ex: [] } }, rot: ['Z'],
      comida: { plano: [{ id: 'meu', n: 'Plano da conta', t: '11:15', quando: 'sempre', itens: [] }], alimentos: {}, ocultos: {} } };
    nuvemFalsa(a, { v: 1, data: conta });
    await a.v('sincroniza');
    assert.equal(a.S().primeiraVez, undefined);
    assert.equal(a.S().prog.Z.name, 'Programa da conta');
    await a.v('importText', copia);
    await a.v('sincroniza');
    for (const s of [a.S(), a.gravado(), nuvem(a).linha.data]) {
      assert.deepEqual(s.rot, conta.rot);
      assert.deepEqual(s.prog, conta.prog);
      assert.deepEqual(s.comida.plano, conta.comida.plano);
      assert.deepEqual(s.done, conta.done);
      assert.equal(s.primeiraVez, undefined);
    }
  } finally { a.fechar(); }
});

test('entrar pelo aparelho novo migra o plano 9 da conta pelo mesmo caminho do disco', async () => {
  const conta = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-9.json', import.meta.url), 'utf8'));
  const a = await app({ estado: null, aba: 'agora' });
  try {
    nuvemFalsa(a, { v: 1, data: conta });
    await a.v('sincroniza');
    const s = a.S();
    assert.equal(s.plano, 12);
    assert.deepEqual(s.prog, conta.prog);
    assert.deepEqual(s.rot, conta.rot);
    assert.deepEqual(s.body.peso, conta.body.peso);
    assert.ok(s.comida.plano.some(r => r.id === 'ceia'));
    assert.equal(s.primeiraVez, undefined);
  } finally { a.fechar(); }
});

async function colaTreinoEConcluiInicio(a, texto) {
  a.clicar('[data-a="inicio-continuar"]');
  await a.esperar();
  a.digitar('revisao-texto', texto);
  for (const acao of ['revisao-le', 'revisao-aplica', 'inicio-pular', 'inicio-pular']) {
    a.clicar('[data-a="' + acao + '"]');
    await a.esperar();
  }
}

test('a primeira fusão mantém a prescrição da conta e oferece reaplicar o texto colado antes de entrar', async () => {
  const conta = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  conta.plano = 12;
  conta.carimbos = { prog: conta.mtime - 1, rot: conta.mtime - 1 };
  conta.carimbosEm = conta.mtime;
  conta.progTreinador = { em: conta.mtime, data: null, rot: conta.rot, dias: conta.prog };
  conta.progLog.push({ day: 'A', t: Date.now() + DIA, txt: 'Revisão no outro aparelho', textoRevisao: 'Outro texto' });
  conta.ex = {
    'remada-do-box': { n: 'Remada da conta', g: 'costas', car: 'livre', m: conta.mtime },
    'extensao-do-box': { n: 'Extensão da conta', g: 'tríceps', car: 'pino', m: conta.mtime }
  };
  const texto = 'Treino B · Pernas\n- Leg press · 2 x 10-15';
  const a = await app({ aba: 'agora', estado: null });
  const toca = async seletor => { a.clicar(seletor); await a.esperar(); };
  try {
    await colaTreinoEConcluiInicio(a, texto);
    await a.E(`S.comida.plano = [{ id: 'minha', n: 'Minha', itens: [], quando: 'sempre', t: '12:00' }];
      S.ex['remada-do-box'] = { n: 'Remada local', g: 'costas', car: 'barra', m: Date.now() };
      lapide(chaveDeCatalogo('extensao-do-box'));
      S.cadencia = Array(7).fill('treino'); S.body.peso.push({ t: Date.now(), v: 71 }); save()`);
    assert.deepEqual(a.S().rot, ['B']);
    nuvemFalsa(a, { v: 3, data: conta });
    await a.v('sincroniza', { manual: true });
    for (const s of [a.S(), a.gravado(), nuvem(a).linha.data]) {
      for (const k of ['prog', 'rot', 'progTreinador', 'comida', 'cadencia', 'ex']) assert.deepEqual(s[k], conta[k], k);
      assert.equal(s.carimbos.prog, conta.carimbos.prog);
      assert.equal(s.body.peso.length, conta.body.peso.length + 1);
      assert.ok(s.progLog.some(x => x.textoRevisao === texto));
    }
    assert.equal(a.texto('#toast .aviso > span'), 'Ficou o programa da sua conta. O texto que você colou está guardado.');
    assert.equal(a.texto('#toast button'), 'Rever texto');
    const reaberto = await app({ aba: 'prescricao', estado: a.gravado() });
    try {
      reaberto.v('ctx.abrePrograma');
      await reaberto.esperar();
      reaberto.clicar('[data-a="prog-hist"]');
      await reaberto.esperar();
      const linha = reaberto.$$('.v3-lin').find(l => l.textContent.includes('revisão do treinador'));
      assert.equal(linha.tagName, 'DIV');
      reaberto.clicar(linha.querySelector('b'));
      await reaberto.esperar();
      assert.equal(reaberto.$('#revisao-texto'), null);
      const rever = linha.querySelector('button.v3-peq.c');
      assert.equal(rever?.textContent, 'Rever texto');
      reaberto.clicar(rever);
      await reaberto.esperar();
      assert.equal(reaberto.$('#revisao-texto').value, texto);
    } finally { reaberto.fechar(); }
    await toca('[data-a="aviso-acao"]');
    assert.equal(a.$('#revisao-texto').value, texto);
    await toca('[data-a="revisao-le"]');
    await toca('[data-a="revisao-aplica"]');
    await a.v('sincroniza');
    assert.deepEqual(nuvem(a).linha.data.rot, conta.rot);
    assert.equal(nuvem(a).linha.data.prog.B.ex[0].s, 2);
    assert.deepEqual(nuvem(a).linha.data.prog.A, conta.prog.A);
  } finally { a.fechar(); }
});

test('depois da primeira fusão entre perfis pessoais uma edição local do plano volta a poder subir', async () => {
  const a = await app({ aba: 'agora', estado: null });
  try {
    const conta = a.S();
    conta.primeiraVez = 4;
    conta.comida.plano = [{ id: 'conta', n: 'Refeição da conta', t: '12:00', quando: 'sempre', itens: [] }];
    nuvemFalsa(a, { v: 7, data: conta });
    a.E('sync.forcar = true'); // contabilidade de uma versão antiga
    await a.v('sincroniza');
    assert.deepEqual(a.S().comida.plano, conta.comida.plano);
    assert.equal(a.dado('sync').forcar, false);
    await a.E("S.comida.plano[0].n = 'Almoço alterado'; save()");
    a.E('globalThis.__nuvem.linha.v++');
    await a.v('sincroniza');
    assert.equal(nuvem(a).linha.data.comida.plano[0].n, 'Almoço alterado');
  } finally { a.fechar(); }
});

test('registro ilegível com versão de sincronia intacta volta a fundir ao pular o primeiro passo', async () => {
  const conta = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  conta.plano = 12;
  for (const controle of [{ v: 3 }, { v: 3, forcar: true }, { v: null, jaSincronizou: true }]) {
    const a = await app({ aba: 'agora', estado: '{"logs": {', chaves: { 'treino-sync-v1': controle } });
    try {
      assert.equal(a.dado('sync').v, null);
      const salvo = JSON.parse(a.window.localStorage.getItem('treino-sync-v1'));
      assert.equal(salvo.v, null);
      assert.equal(salvo.jaSincronizou, false);
      nuvemFalsa(a, { v: 3, data: conta });
      await a.v('ctx.avancaInicio', true);
      await a.v('sincroniza');
      for (const s of [a.gravado(), nuvem(a).linha.data]) {
        assert.deepEqual(s.prog, conta.prog);
        assert.deepEqual(s.comida.plano, conta.comida.plano);
        assert.deepEqual(s.done, conta.done);
      }
    } finally { a.fechar(); }
  }
});

test.each([false, true])('a virada entre dois aparelhos conserva café, almoço e jantar, virada já gravada = %s', async gravouVirada => {
  const cel = await app({ aba: 'agora', estado: null }), tab = await app({ aba: 'agora', estado: null });
  const conta = nuvemDeDois(null);
  try {
    for (let i = 0; i < 3; i++) await cel.v('ctx.avancaInicio', true);
    await cel.E(`S.comida.plano = ['cafe', 'almoco', 'jantar'].map(id => ({ id, n:id, t:'12:00', quando:'sempre', itens:[] }));
      S.modulos.comida = 1; save()`);
    conta.liga(cel);
    cel.v('ctx.marcaRefeicao', 'cafe');
    await cel.v('sincroniza');
    conta.liga(tab);
    await tab.v('sincroniza');
    const data = cel.S().dia.data;
    cel.v('ctx.marcaRefeicao', 'jantar');
    await cel.E('liberaSave()');
    tab.v('ctx.marcaRefeicao', 'almoco');
    await tab.v('sincroniza');
    cel.viajar(DIA);
    cel.v('diaDeComida');
    if (gravouVirada) await cel.E('save()');
    await cel.v('sincroniza');
    cel.v('diaDeComida');
    await cel.E('save()');
    await cel.v('sincroniza');
    for (const s of [cel.gravado(), conta.linha.data]) {
      assert.ok(s.dia.data > data);
      const fechados = s.comidaHist.filter(x => x.d === data);
      assert.equal(fechados.length, 1);
      assert.deepEqual(Object.keys(fechados[0].done).sort(), ['almoco','cafe','jantar']);
    }
  } finally { cel.fechar(); tab.fechar(); }
});

test('tirar do plano a única refeição marcada conserva a lápide ao encontrar a marca da conta', async () => {
  const a = await app({ aba: 'agora', estado: null });
  try {
    await a.E(`S.primeiraVez = 4; S.comida.plano = [{ id:'almoco', n:'Almoço', t:'12:00', quando:'sempre', itens:[] }]; save()`);
    nuvemFalsa(a, null);
    a.v('ctx.marcaRefeicao', 'almoco');
    await a.v('sincroniza');
    const data = a.S().dia.data;
    assert.ok(nuvem(a).linha.data.dia.done.almoco);
    await a.v('ctx.removeRefeicao', 'almoco');
    a.E('globalThis.__nuvem.linha.v++');
    await a.v('sincroniza');
    for (const s of [a.gravado(), nuvem(a).linha.data]) {
      assert.deepEqual(s.dia.done, {});
      assert.deepEqual(s.comida.plano, []);
      assert.ok(s.apagados['comida:' + data + ':almoco']);
    }
  } finally { a.fechar(); }
});

test.each(['primeiros passos pulados', 'documentos esvaziados', 'documentos ausentes', 'só programa e sequência preenchidos', 'programa sem sequência', 'sequência sem programa'])(
  'primeiro login com %s na conta conserva cada prescrição preenchida', async cenario => {
    const conta = nuvemDeDois(null);
    const tablet = await app({ aba: 'agora', estado: null });
    const cel = await app({ aba: 'agora', estado: null });
    try {
      for (let i = 0; i < 3; i++) await tablet.v('ctx.avancaInicio', true);
      ligaComSenha(conta, tablet);
      await entraComSenha(tablet);
      const remoto = conta.linha.data;
      assert.deepEqual(remoto.prog, {});
      assert.deepEqual(remoto.comida.plano, []);
      if (cenario !== 'primeiros passos pulados') {
        // Uma conta pode ser mais recente mesmo que o seu documento esteja vazio.
        remoto.mtime = remoto.carimbosEm = Date.now() + DIA;
        remoto.carimbos = {};
        for (const k of ['prog', 'rot', 'progTreinador', 'comida', 'cadencia']) {
          remoto.carimbos[k] = remoto.mtime;
          if (cenario === 'documentos ausentes') delete remoto[k];
        }
        if (cenario !== 'documentos ausentes') {
          remoto.progTreinador = { em: remoto.mtime, rot: [], dias: {} };
          remoto.cadencia = [];
        }
        if (cenario === 'só programa e sequência preenchidos' || cenario === 'programa sem sequência') {
          const dono = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
          remoto.prog = { A:dono.prog.A };
          remoto.rot = cenario === 'programa sem sequência' ? [] : ['A'];
        }
        if (cenario === 'sequência sem programa') remoto.rot = ['A'];
      }
      const temProgramaNaConta = Object.keys(remoto.prog || {}).length > 0;
      await colaTreinoEConcluiInicio(cel, 'Treino B · Pernas\n- Leg press · 2 x 10-15');
      await cel.E(`S.comida.plano = ['cafe','almoco'].map(id => ({ id, n:id, t:'12:00', quando:'sempre', itens:[] }));
        S.cadencia[2] = 'treino'; S.body.peso.push({ t:Date.now(), v:64 }); save()`);
      const antes = cel.S();
      assert.deepEqual(antes.rot, ['B']);
      ligaComSenha(conta, cel);
      await entraComSenha(cel);
      for (const s of [cel.S(), cel.gravado(), conta.linha.data]) {
        for (const k of ['prog', 'rot', 'progTreinador', 'comida', 'cadencia']) {
          const origem = temProgramaNaConta && ['prog', 'rot', 'progTreinador'].includes(k) ? remoto : antes;
          assert.deepEqual(s[k], origem[k], k);
          if (origem === remoto) assert.equal(s.carimbos[k], origem.carimbos[k], 'carimbo de ' + k);
          // O aparelho que vence a primeira fusão passa o carimbo da conta, ou a
          // fusão seguinte com o aparelho dela desfaria a decisão.
          else assert.ok(s.carimbos[k] >= (origem.carimbos?.[k] || 0) && s.carimbos[k] > (remoto.carimbos?.[k] || 0), 'carimbo de ' + k);
        }
        assert.deepEqual(s.body.peso, antes.body.peso);
      }
      if (!temProgramaNaConta) {
        assert.doesNotMatch(cel.texto('#toast'), /Ficou o programa da sua conta/);
      }
    } finally { cel.fechar(); tablet.fechar(); }
  });

test('colar só o treino B e entrar na conta do dono preserva a referência embutida, o alvo e a restauração', async () => {
  const estado = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  const dono = await app({ aba:'agora', estado });
  const a = await app({ aba:'agora', estado:null });
  try {
    const referencia = dono.J('baseTreinador()');
    const rot = dono.J('rotTreinador()');
    const alvo = dono.E('alvoTotal()');
    assert.equal(alvo, 90);
    assert.equal(dono.vJ('ctx.dadosDoApp').difTxt, null);
    const arquivo = 'treino/programa-do-treinador.md';
    const espelhoDoDono = montaArquivos(estado, { agora:estado.mtime })[arquivo];

    await colaTreinoEConcluiInicio(a, 'Treino B · Pernas\n- Leg press · 2 x 10-15');
    assert.deepEqual(a.S().progTreinador.rot, ['B']);
    assert.equal(a.E('alvoTotal()'), 2);
    const conta = nuvemDeDois({ v:3, data:estado });
    ligaComSenha(conta, a);
    await entraComSenha(a);

    const copia = JSON.parse(a.v('payload')).data;
    for (const s of [a.gravado(), copia, conta.linha.data]) {
      assert.equal(s.progTreinador, null);
      assert.deepEqual(s.prog, estado.prog);
      assert.deepEqual(s.rot, estado.rot);
    }
    assert.deepEqual(a.J('baseTreinador()'), referencia);
    assert.equal(a.E('alvoTotal()'), alvo);
    assert.equal(a.vJ('ctx.dadosDoApp').difTxt, null);
    assert.equal(montaArquivos(copia, { agora:estado.mtime })[arquivo], espelhoDoDono);

    // Uma edição de verdade faz aparecer a ação de restaurar nos Ajustes.
    await a.v('progSeries', 'A', 0, 1);
    a.aba('ajustes');
    await a.esperar();
    a.clicar('[data-a="ajustes-restaura-programa"]');
    await vi.waitFor(() => assert.deepEqual(a.gravado().prog, referencia));
    await a.v('sincroniza');
    assert.deepEqual(conta.linha.data.prog, referencia);
    assert.deepEqual(conta.linha.data.rot, rot);
  } finally { a.fechar(); dono.fechar(); }
});

test('a primeira fusão conserva o alimento exclusivo do aparelho e o plano e a biblioteca da conta', async () => {
  const estado = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  estado.plano = 12;
  estado.comida.alimentos['pasta-do-box'] = { n:'Pasta da conta', kcal:540, meu:1 };
  estado.comida.ocultos.aveia = 1;
  estado.carimbos = { comida:estado.mtime };
  estado.carimbosEm = estado.mtime;
  const conta = nuvemDeDois({ v:3, data:estado });
  const dono = await app({ aba:'agora', estado, chaves:{ 'treino-sync-v1':{ v:3 } } });
  const a = await app({ aba:'agora', estado:null });
  try {
    for (let i = 0; i < 3; i++) await a.v('ctx.avancaInicio', true);
    const pao = { n:'Pão da padaria', cat:'padaria', u:'g', kcal:280, p:9, c:52, g:3 };
    const id = a.v('ctx.salvaAlimento', null, pao);
    a.v('ctx.salvaRefeicao', null, { n:'Café local', itens:[{ f:id, q:100 }] });
    a.v('ctx.salvaAlimento', 'pasta-do-box', { n:'Pasta local', kcal:300 });
    a.v('ctx.salvaAlimento', 'arroz', { kcal:999 });
    a.v('ctx.salvaAlimento', 'aveia', { kcal:777 });
    const cadastro = a.S().comida.alimentos[id];
    const alimentos = { ...estado.comida.alimentos, [id]:cadastro };
    ligaComSenha(conta, a);
    await entraComSenha(a);

    const copia = JSON.parse(a.v('payload')).data;
    for (const s of [a.gravado(), copia, conta.linha.data]) {
      assert.deepEqual(s.comida, { ...estado.comida, alimentos });
    }
    assert.equal(a.J('catalogoAlimentos()')[id].kcal, 280);
    assert.match(montaArquivos(copia, { agora:estado.mtime })['nutricao/alimentos.csv'], /Pão da padaria,padaria,g,280,9,52,3,/);

    // O dono só registrou peso enquanto o outro aparelho acrescentava o pão.
    dono.viajar(2 * DIA);
    await dono.E('S.body.peso.push({ t:Date.now(), v:70 }); save()');
    conta.liga(dono);
    await dono.v('sincroniza');
    assert.deepEqual(dono.gravado().comida.alimentos, alimentos);
    assert.deepEqual(conta.linha.data.comida.alimentos, alimentos);

    a.viajar(3 * DIA);
    await a.v('ctx.removeAlimento', id);
    await a.v('sincroniza');
    await dono.v('sincroniza');
    assert.equal(dono.gravado().comida.alimentos[id], undefined, 'uma exclusão posterior vale nos dois aparelhos');
    assert.equal(conta.linha.data.comida.alimentos[id], undefined);
  } finally { a.fechar(); dono.fechar(); }
});

test.each(['sair', 'receber 401'])('entrar de novo depois de %s preserva a edição da refeição, o exercício e a exclusão locais', async como => {
  const conta = nuvemDeDois(null);
  let a = await app({ aba: 'agora', estado: null });
  try {
    for (let i = 0; i < 3; i++) await a.v('ctx.avancaInicio', true);
    await a.E(`S.comida.plano = [{ id:'almoco', n:'Almoço', t:'12:00', quando:'sempre', itens:[] }];
      S.ex.antigo = { n:'Máquina antiga', g:'costas', car:'pino', m:Date.now() }; save()`);
    ligaComSenha(conta, a);
    await entraComSenha(a);
    assert.equal(conta.linha.data.comida.plano.length, 1);
    if (como === 'sair') {
      await a.v('ctx.sairDaNuvem');
      const controle = a.window.localStorage.getItem('treino-sync-v1');
      const estado = a.gravado();
      a.fechar();
      a = await app({ aba:'agora', estado, chaves:{ 'treino-sync-v1': controle } });
      ligaComSenha(conta, a);
    } else {
      a.E('globalThis.__expirou = true');
      await a.v('sincroniza');
      assert.ok(a.dado('sync').expirou);
    }
    a.viajar(DIA);
    await a.E(`S.comida.plano[0].n = 'Almoço novo';
      S.comida.plano.push({ id:'jantar', n:'Jantar', t:'20:00', quando:'sempre', itens:[] });
      S.ex.y = { n:'Máquina Y', g:'costas', car:'pino', m:Date.now() };
      S.logs.y = [{ t:Date.now(), sid:Date.now(), sets:[[30,12]] }];
      delete S.ex.antigo; lapide(chaveDeCatalogo('antigo')); save()`);
    await entraComSenha(a);
    for (const s of [a.S(), a.gravado(), conta.linha.data]) {
      assert.deepEqual(s.comida.plano.map(r => r.n), ['Almoço novo','Jantar']);
      assert.equal(s.ex.y.n, 'Máquina Y');
      assert.deepEqual(s.logs.y[0].sets, [[30,12]]);
      assert.equal(s.ex.antigo, undefined);
      assert.ok(s.apagados['ex:antigo']);
      assert.equal(s.jaSincronizou, undefined, 'o recibo pertence ao aparelho');
    }
    assert.equal(JSON.parse(a.window.localStorage.getItem('treino-sync-v1')).jaSincronizou, true);
  } finally { a.fechar(); }
});

test('exercício exclusivo do aparelho conserva nome, grupo e séries na primeira fusão com a conta do dono', async () => {
  const dono = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-11.json', import.meta.url), 'utf8'));
  dono.plano = 12;
  dono.ex = { comum: { n:'Exercício da conta', g:'peito', car:'pino', m:dono.mtime } };
  const a = await app({ aba: 'agora', estado: null });
  try {
    for (let i = 0; i < 3; i++) await a.v('ctx.avancaInicio', true);
    await a.E(`S.ex['maquina-x'] = { n:'Máquina X', g:'quadríceps', car:'pino', m:Date.now() };
      S.ex.comum = { n:'Nome local', g:'costas', car:'barra', m:Date.now() };
      S.logs['maquina-x'] = [{ t:Date.now(), sid:Date.now(), sets:[[40,10]] }];
      lapide(chaveDeCatalogo('removido-so-aqui')); save()`);
    const conta = nuvemDeDois({ v:7, data:dono });
    ligaComSenha(conta, a);
    await entraComSenha(a);
    for (const s of [a.S(), a.gravado(), conta.linha.data]) {
      assert.deepEqual(s.rot, dono.rot);
      assert.equal(s.ex['maquina-x']?.n, 'Máquina X');
      assert.equal(s.ex['maquina-x'].g, 'quadríceps');
      assert.deepEqual(s.logs['maquina-x'][0].sets, [[40,10]]);
      assert.deepEqual(s.ex.comum, dono.ex.comum);
      assert.ok(s.apagados['ex:removido-so-aqui']);
    }
    assert.equal(a.dado('CAT')['maquina-x'].n, 'Máquina X');
    assert.equal(a.$('#toast .aviso-acao'), null, 'sem texto colado não há ação de primeira fusão');
  } finally { a.fechar(); }
});

test.each([{ v: 7, em: 0 }, { v: null, em: 12345 }])(
  'o controle antigo com v=$v e em=$em conserva o plano editado ao entrar de novo', async controle => {
    const a = await app({ aba: 'agora', estado: { plano:12, primeiraVez:4, logs:{}, done:[] },
      chaves: { 'treino-sync-v1': controle } });
    try {
      await a.E(`S.comida.plano = [{ id:'almoco', n:'Almoço antigo', t:'12:00', quando:'sempre', itens:[] }]; save()`);
      const conta = nuvemDeDois({ v:7, data:a.gravado() });
      a.viajar(DIA);
      await a.E(`S.comida.plano[0].n = 'Almoço editado'; save()`);
      ligaComSenha(conta, a);
      await entraComSenha(a);
      assert.equal(conta.linha.data.comida.plano[0].n, 'Almoço editado');
      assert.equal(JSON.parse(a.window.localStorage.getItem('treino-sync-v1')).jaSincronizou, true);
    } finally { a.fechar(); }
  });

test('só confirma a primeira sincronia depois de enviar ou guardar a fusão, mesmo se o próximo envio falhar', async () => {
  const a = await app({ aba: 'agora', estado:null });
  const controle = () => JSON.parse(a.window.localStorage.getItem('treino-sync-v1'));
  try {
    await a.v('ctx.avancaInicio', true);
    await a.E(`S.comida.plano = [{ id:'almoco', n:'Da conta', t:'12:00', quando:'sempre', itens:[] }]; save()`);
    const remoto = a.gravado();
    await a.E(`S.comida.plano[0].n = 'Deste aparelho'; save()`);
    nuvemFalsa(a, null);
    a.E(`NUVEM.empurra = async () => ({ ok:false, erro:'rede', msg:'envio interrompido' })`);
    await Promise.all([a.v('sincroniza'), a.v('sincroniza')]);
    assert.equal(nuvem(a).puxadas, 1, 'dois disparos simultâneos abrem uma única primeira fusão');
    assert.equal(controle().jaSincronizou, false, 'a conta ainda não recebeu o primeiro envio');
    a.E(`globalThis.__nuvem.linha = ${JSON.stringify({ v:1, data:remoto })}`);
    a.encheCota();
    await a.v('sincroniza');
    assert.equal(controle().jaSincronizou, false, 'a fusão só está em memória');
    assert.equal(a.gravado().comida.plano[0].n, 'Deste aparelho');
    a.encheCota(false);
    await a.v('sincroniza');
    assert.equal(a.gravado().comida.plano[0].n, 'Da conta');
    assert.equal(controle().jaSincronizou, true, 'a fusão foi guardada mesmo com o envio interrompido');
    assert.equal(controle().sujo, true);
  } finally { a.fechar(); }
});

test('a sincronia entre os planos 9 e 12 mantém a marca antiga fora do dia já fechado no formato atual', async () => {
  const antigo = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-9.json', import.meta.url), 'utf8'));
  assert.equal(antigo.dia.done.almoco, 1);
  const data = antigo.dia.data;
  const a = await app({ aba: 'agora' });
  try {
    await a.E(`diaDeComida();
      S.comidaHist = [{ d:${JSON.stringify(data)}, done:{ jantar:Date.now() }, agua:0, escala:{}, pv:1, tot:{ kcal:2, p:0, c:0, g:0 }, m:Date.now() }];
      save()`);
    const fechado = a.S().comidaHist[0];
    assert.ok(a.S().dia.data > data);
    nuvemFalsa(a, { v:1, data:antigo });
    await a.v('sincroniza');
    for (const s of [a.gravado(), nuvem(a).linha.data]) {
      assert.equal(s.plano, 12);
      assert.deepEqual(s.comidaHist.find(h => h.d === data).done, fechado.done);
    }
  } finally { a.fechar(); }
});
