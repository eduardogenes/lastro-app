// Primeira vez em um endereço novo, reabertura e restauração pela mesma porta da cópia.
import { readFileSync } from 'node:fs';
import { test } from 'vitest';
import assert from 'node:assert';
import { app, estadoVazio, CHAVE_NUVEM } from './harness.js';

test('com qualquer registro, não é endereço vazio', async () => {
  const t = Date.now() - 86400000;
  for (const extra of [
    { done: [{ day: 'A', t: t, sid: t }] },
    { cardio: [{ t: t, tipo: 'bike', min: 30 }] },
    { protocolo: { poses: null, sessoes: [{ d: '2026-01-01', t: 1, m: 1, fotos: {} }] } }
  ]) {
    const a = await app({ aba: 'prescricao', estado: estadoVazio(extra) });
    await a.esperar();
    assert.strictEqual(a.vJ('ctx.passoInicial'), null, JSON.stringify(extra));
    a.fechar();
  }
});

test('com a conta entrada, não é endereço vazio: a sincronia traz o que existe', async () => {
  const a = await app({ aba: 'prescricao', estado: estadoVazio(), chaves: {
    [CHAVE_NUVEM]: { token: 't', refresh: 'r', expira: Date.now() + 3600000, uid: 'u', email: 'a@b.c' }
  } });
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.passoInicial'), null);
  a.fechar();
});

const novo = () => app({ aba: 'agora', estado: null });
async function toca(a, seletor) {
  a.clicar(seletor);
  await a.esperar();
}
const pular = '[data-a="inicio-pular"]', continuar = '[data-a="inicio-continuar"]';

test('o cabeçalho reserva o lugar de Voltar só no primeiro passo e a escolha usa o ícone de texto', async () => {
  const a = await novo();
  try {
    const cab = '.v3-inicio .v3-cab';
    assert.equal(a.$(cab).firstElementChild.getAttribute('aria-hidden'), 'true');
    assert.ok(a.$(cab + ' > .v3-cab-vao'));
    assert.equal(a.$('[role="radio"] svg path').getAttribute('d'), 'M5 6h14M5 10.5h14M5 15h9');
    for (let passo = 2; passo <= 3; passo++) {
      await toca(a, pular);
      assert.equal(a.$(cab).firstElementChild.getAttribute('aria-label'), 'Voltar');
      assert.equal(a.$(cab + ' > .v3-cab-vao'), null);
    }
    await toca(a, cab + ' [aria-label="Voltar"]');
    await toca(a, cab + ' [aria-label="Voltar"]');
    assert.ok(a.$(cab + ' > .v3-cab-vao'));
  } finally { a.fechar(); }
});

test('um passo inteiro futuro abre o Hoje e conserva a origem pessoal ao reabrir e restaurar', async () => {
  const futuro = { logs: {}, done: [], plano: 12, primeiraVez: 17 };
  const a = await app({ aba: 'agora', estado: futuro });
  try {
    for (const restaurar of [false, true]) {
      if (restaurar) await a.v('importText', JSON.stringify(futuro));
      assert.equal(a.vJ('ctx.passoInicial'), null);
      assert.equal(a.S().primeiraVez, 17);
      assert.deepEqual(a.S().rot, []);
      assert.deepEqual(a.S().prog, {});
      assert.deepEqual(a.S().comida.plano, []);
    }
  } finally { a.fechar(); }
});

test('cada passo pode ser pulado e o Hoje vazio permite registrar um treino livre', async () => {
  const a = await novo();
  try {
    for (const titulo of ['Seu treino', 'Sua comida', 'O que acompanhar']) {
      assert.equal(a.texto('h1'), titulo);
      assert.equal(a.$('.v3-doca'), null);
      await toca(a, pular);
    }
    assert.equal(a.texto('h1'), 'Nada para agora.');
    assert.deepEqual(a.S().rot, []);
    assert.equal(a.$('[data-a="hoje-tipo"]'), null);
    for (const k of ['comida', 'peso', 'agua', 'cardio', 'fotos']) assert.equal(a.v('ctx.moduloLigado', k), false);
    assert.equal(a.gravado().primeiraVez, 4);
    await toca(a, '[data-a="hoje-treino-livre"]');
    assert.equal(a.$('[data-a="lanca-previsto"]'), null);
    await toca(a, '[data-a="lanca-livre"]');
    assert.ok(a.S().done[0].livre);
    assert.deepEqual(a.S().rot, []);
  } finally { a.fechar(); }
});

test('confirmar comida e as chaves guarda só o escolhido e o app reabre direto no Hoje', async () => {
  const a = await novo();
  let guardado;
  try {
    await toca(a, '[role="radio"]:last-child');
    await toca(a, continuar);
    await toca(a, continuar);
    assert.equal(a.$('[data-a="inicio-peso"]').getAttribute('aria-checked'), 'true');
    await toca(a, '[data-a="inicio-peso"]');
    await toca(a, '[data-a="inicio-agua"]');
    await toca(a, continuar);
    guardado = a.gravado();
    assert.deepEqual(guardado.comida.plano, []);
    assert.ok(a.dado('CAT')['leg-press']);
    assert.ok(a.E("!!catalogoAlimentos().arroz"));
  } finally { a.fechar(); }
  const b = await app({ aba: 'agora', estado: guardado });
  try {
    assert.equal(b.$(pular), null);
    assert.deepEqual(['comida','peso','agua','cardio','fotos'].map(k => b.v('ctx.moduloLigado', k)), [true,false,true,false,false]);
    b.aba('prescricao');
    await toca(b, b.$$('button').find(el => el.textContent.includes('+ Refeição')));
    b.digitar('ref-nome', 'Minha primeira refeição');
    await b.esperar();
    await toca(b, '[data-a="ref-cria"]');
    assert.deepEqual(b.S().comida.plano.map(r => r.n), ['Minha primeira refeição']);
  } finally { b.fechar(); }
});

test('a revisão do primeiro treino grava só o programa colado e segue para a comida', async () => {
  const a = await novo();
  try {
    await toca(a, continuar);
    await toca(a, 'button[aria-label="Voltar"]');
    assert.equal(a.texto('h1'), 'Seu treino');
    await toca(a, continuar);
    a.digitar('revisao-texto', 'Treino B · Meu treino\n- Leg press · 2 x 10-15');
    await toca(a, '[data-a="revisao-le"]');
    await toca(a, '[data-a="revisao-aplica"]');
    assert.equal(a.texto('h1'), 'Sua comida');
    const s = a.gravado();
    assert.deepEqual(Object.keys(s.prog), ['B']);
    assert.deepEqual(s.rot, ['B']);
    assert.deepEqual(s.progTreinador.rot, ['B']);
    assert.deepEqual(Object.keys(s.progTreinador.dias), ['B']);
    assert.deepEqual(s.prog.B.ex.map(x => x.id), ['leg-press']);
  } finally { a.fechar(); }
});

test('restaurar a cópia preserva o passo pessoal e aceita o programa antigo sem histórico', async () => {
  const a = await novo();
  try {
    await toca(a, '[data-a="inicio-recuperar"]');
    assert.ok(a.$('#nuvem-email') && a.$('[type="file"]'));
    await toca(a, 'button[aria-label="Voltar"]');
    await toca(a, pular);
    const copia = a.v('payload');
    await toca(a, pular);
    await toca(a, pular);
    await a.v('importText', copia);
    await a.esperar();
    assert.equal(a.texto('h1'), 'Sua comida');
    assert.deepEqual(a.gravado().rot, []);
    assert.deepEqual(a.gravado().comida.plano, []);
    const programa = { Z: { name: 'Treino já meu', tag: '', ex: [] } };
    const plano = [{ id:'minha', n:'Minha refeição', t:'12:00', quando:'sempre', itens:[] }];
    await a.v('importText', JSON.stringify({ logs: {}, done: [], plano: 12, prog: programa, rot: ['Z'], comida: { plano } }));
    await a.esperar();
    assert.equal(a.$(pular), null);
    assert.deepEqual(a.S().prog, programa);
    assert.deepEqual(a.S().comida.plano, plano);
    await a.v('importText', copia);
    assert.deepEqual(a.S().prog, programa, 'uma cópia só da abertura não esvazia o aparelho sem conta');
    assert.deepEqual(a.S().comida.plano, plano);
  } finally { a.fechar(); }
});

test('se o disco recusar o passo, o mesmo toque pode ser repetido sem perder a escolha', async () => {
  const a = await novo();
  try {
    await toca(a, pular);
    a.encheCota();
    await toca(a, continuar);
    assert.equal(a.S().primeiraVez, 2);
    a.encheCota(false);
    await toca(a, '[data-a="falhou-tenta"]');
    assert.equal(a.texto('h1'), 'O que acompanhar');
    assert.equal(a.v('ctx.moduloLigado', 'comida'), true);
  } finally { a.fechar(); }
});

for (const versao of [9, 10, 11]) {
  test('o plano ' + versao + ' já salvo conserva o programa e o histórico sem passar pela primeira vez', async () => {
    const fixture = JSON.parse(readFileSync(new URL('../dominio/fixtures/estado-plano-' + versao + '.json', import.meta.url)));
    const a = await app({ aba: 'agora', [versao === 9 ? 'legado' : 'estado']: fixture });
    try {
      const s = a.S();
      assert.equal(a.$(pular), null);
      assert.equal(s.primeiraVez, undefined);
      assert.equal(s.plano, 12);
      assert.deepEqual(s.prog, fixture.prog);
      assert.deepEqual(s.rot, fixture.rot);
      assert.deepEqual(s.body.peso, fixture.body.peso);
      assert.ok(fixture.comida.plano.every(ref => s.comida.plano.some(r => r.id === ref.id)));
    } finally { a.fechar(); }
  });
}

test('programa, plano alimentar ou só a base antiga bastam para abrir direto no Hoje', async () => {
  const prog = { Z: { name: 'Só meu', tag: '', ex: [] } };
  const plano = [{ id: 'meu', n: 'Só minha', t: '11:00', quando: 'sempre', itens: [] }];
  for (const campos of [{ prog, rot: ['Z'] }, { comida: { plano } }, {}]) {
    const a = await app({ aba: 'agora', estado: { plano: 12, logs: {}, done: [], ...campos } });
    try {
      assert.equal(a.$(pular), null);
      assert.deepEqual(a.S().prog, campos.prog || a.J('semeiaProg()'));
      assert.deepEqual(a.S().comida.plano, campos.comida ? plano : a.dado('PLANO_BASE'));
    } finally { a.fechar(); }
  }
});

test('apagar o histórico no perfil pessoal mantém a origem, as escolhas e o programa vazio ao reabrir', async () => {
  const a = await novo();
  try {
    for (let i = 0; i < 3; i++) await a.v('ctx.avancaInicio', true);
    await a.v('wipe');
    const estado = a.gravado();
    assert.equal(estado.primeiraVez, 4);
    const b = await app({ aba: 'agora', estado });
    try {
      assert.equal(b.texto('h1'), 'Nada para agora.');
      assert.deepEqual(b.S().rot, []);
      assert.deepEqual(b.S().comida.plano, []);
    } finally { b.fechar(); }
  } finally { a.fechar(); }
});

test('com armazenamento apenas em memória é possível pular e usar a sessão atual', async () => {
  const a = await app({ aba: 'agora', estado: null, semArmazenamento: true });
  try {
    for (let i = 0; i < 3; i++) await toca(a, pular);
    assert.equal(a.texto('h1'), 'Nada para agora.');
  } finally { a.fechar(); }
});
