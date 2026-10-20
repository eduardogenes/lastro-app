// O AVISO CURTO na árvore: o tempo pelo texto, um nó por mensagem, a região
// viva que nunca sai, e a saída pelo relógio — nada espera o fim de animação.
//
// Peça 7 do motion (dono, 16/10, pergunta 10: "sobe, apaga ao sair, fica o
// tempo do texto"; pergunta 2: sob "Reduzir movimento" só a opacidade; e a
// precondição da docs/motion/05 §3.2: a região viva deixa de usar
// `display: none`, que a tirava da árvore de acessibilidade). Antes: 3,6 s para
// toda mensagem (as longas sumiam antes de dar tempo de ler), o texto novo
// trocava no mesmo nó sem sinal nenhum, e entre um aviso e outro a região era
// `display: none`.
//
// Aqui, no jsdom (sem layout nem animação): o tempo, a ordem dos nós, a região,
// o relógio. O movimento como o motor o roda — subir 8 px e acender em 160 ms,
// apagar, compor com o acompanhamento do cronômetro, a troca de camada — é
// `acende.test.js`; a forma no CSS é a guarda (j) de `estilo.test.ts`.
import { test } from 'vitest';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './harness.js';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** O aparelho que pediu movimento (ou menos), visto pela porta do app. */
const pede = reduz => ({
  antesDoApp: w => {
    w.matchMedia = q => ({ matches: reduz ? /:\s*reduce\)/.test(q) : /:\s*no-preference\)/.test(q), media: q,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  }
});

// Mensagens DE VERDADE do app (`main.jsx`), da mais curta à mais longa.
const CURTA = 'Foto apagada.';
const MEDIA = 'Desconectado. O histórico continua neste aparelho.';
const LONGA = 'Guardei como pulado hoje: Remada. Não volta a ser pedido nesta sessão; desfazer põe de volta na fila.';
const MAIS_LONGA = 'O registro deste aparelho não pôde ser lido. Guardei uma cópia dele à parte, sem mexer, e o app abriu vazio.';
const ANTES_MS = 3600;   // o tempo de antes, para toda mensagem: o piso
const TETO_MS = 8000;    // ~8 s (pergunta 10)

// `toast()` e `apagaAviso()` não são verbos da superfície do harness: chamados no escopo do app.
const diz = (a, texto) => a.E('toast(' + JSON.stringify(texto) + ')');
const apaga = a => a.E('apagaAviso()');
const tempoDe = (a, texto) => a.E('tempoDeLeitura(' + JSON.stringify(texto) + ')');
const mensagens = a => a.$$('#toast > *');
const naTela = a => { const n = a.$('#toast > .aviso'); return n && !n.classList.contains('sai') ? n.textContent : null; };

test('o aviso fica na tela o tempo do texto: o piso é o de antes, o teto ~8 s, e a mais longa dá para ler a 15 caracteres por segundo', async () => {
  const a = await app();
  const curta = tempoDe(a, CURTA), media = tempoDe(a, MEDIA), longa = tempoDe(a, LONGA), maisLonga = tempoDe(a, MAIS_LONGA);
  assert.strictEqual(curta, ANTES_MS, 'a curta fica o que sempre ficou');
  assert.ok(media > ANTES_MS && media < longa, 'a média fica mais que antes e menos que a longa: ' + media);
  assert.ok(longa >= Math.round(LONGA.length * 1000 / 15) && longa <= TETO_MS,
    'a longa (' + LONGA.length + ' caracteres) dá tempo de ler a 15 por segundo, sem passar do teto: ' + longa);
  assert.ok(maisLonga >= longa && maisLonga <= TETO_MS, 'a mais longa do app fica pelo menos o da longa, sem passar do teto: ' + maisLonga);
  // o teto existe e segura: um texto que nenhuma mensagem do app tem (400 caracteres) para nele
  assert.strictEqual(tempoDe(a, 'x'.repeat(400)), TETO_MS, 'o teto: nenhum aviso fica mais de ~8 s');
  assert.strictEqual(tempoDe(a, '   ' + CURTA + '   '), curta, 'conta o texto como ele aparece');

  // uma regra só, para todas: cada mensagem literal do app, do fonte, nunca menos
  // que antes, nunca mais que o teto, e nunca menos tempo para um texto maior
  const fonte = fs.readFileSync(path.join(RAIZ, 'src', 'main.jsx'), 'utf8');
  const todas = [...new Set([...fonte.matchAll(/toast\('((?:[^'\\]|\\.)*)'\)/g)].map(m => m[1]))].sort((x, y) => x.length - y.length);
  assert.ok(todas.length > 40, 'o andador achou só ' + todas.length + ' mensagens');
  const tempos = todas.map(t => tempoDe(a, t));
  assert.ok(tempos.every(t => t >= ANTES_MS && t <= TETO_MS), 'toda mensagem entre o piso e o teto');
  assert.ok(tempos.every((t, i) => i === 0 || t >= tempos[i - 1]), 'texto maior nunca fica menos');
  a.fechar();

  // sob "Reduzir movimento" a leitura é a mesma: não é movimento
  const r = await app(pede(true));
  assert.deepStrictEqual([CURTA, MEDIA, LONGA, MAIS_LONGA].map(t => tempoDe(r, t)), [curta, media, longa, maisLonga],
    'o tempo pelo texto vale igual sob "Reduzir movimento"');
  r.fechar();
});

test('o aviso sai pelo relógio da leitura, e o mesmo texto de novo recomeça o tempo — nada espera o fim de uma animação', { timeout: 30000 }, async () => {
  // três aparelhos ao mesmo tempo, num relógio só: a curta, a longa, e a curta
  // repetida 2 s depois. Sem `matchMedia` (a porta não sabe), a saída é de uma vez.
  const [c, l, rep] = await Promise.all([app(), app(), app()]);
  diz(c, CURTA); diz(l, LONGA); diz(rep, CURTA);
  const t0 = Date.now();
  const ate = ms => new Promise(r => setTimeout(r, Math.max(0, t0 + ms - Date.now())));
  await ate(2000);
  diz(rep, CURTA);
  await ate(ANTES_MS - 300);
  assert.strictEqual(naTela(c), CURTA); assert.strictEqual(naTela(l), LONGA);
  await ate(ANTES_MS + 400);
  assert.strictEqual(mensagens(c).length, 0, 'a curta saiu no tempo de antes');
  assert.strictEqual(c.texto('#toast'), '', 'e a região ficou vazia: nada de frase velha para o leitor de tela achar');
  assert.strictEqual(naTela(l), LONGA, 'a longa continua, depois dos 3,6 s de antes');
  assert.strictEqual(naTela(rep), CURTA, 'a repetida recomeçou o tempo');
  await ate(2000 + ANTES_MS + 400);
  assert.strictEqual(mensagens(rep).length, 0, 'e saiu no tempo dela, contado da repetição');
  const longa = tempoDe(l, LONGA);
  await ate(longa - 400);
  assert.strictEqual(naTela(l), LONGA, 'a longa fica o tempo do texto');
  await ate(longa + 500);
  assert.strictEqual(mensagens(l).length, 0, 'e sai no fim dele');
  [c, l, rep].forEach(a => {
    assert.ok(a.$('#toast'), 'a região continua na página');
    a.fechar();
  });
});

test('um texto novo com o aviso na tela é um nó novo — a entrada recomeça; o mesmo texto não se mexe', async () => {
  const a = await app(pede(false));
  diz(a, CURTA);
  const primeiro = a.$('#toast > .aviso');
  assert.ok(primeiro, 'a mensagem é um nó dentro da região');
  assert.strictEqual(primeiro.textContent, CURTA);
  diz(a, MEDIA);
  const segundo = a.$('#toast > .aviso');
  assert.notStrictEqual(segundo, primeiro, 'outra mensagem, outro nó: a entrada recomeça (o CSS anima o nó que nasce)');
  assert.strictEqual(mensagens(a).length, 1, 'e só ela: a velha saiu na hora, não fica nada para ler duas vezes');
  assert.strictEqual(a.texto('#toast'), MEDIA);
  diz(a, MEDIA);
  assert.strictEqual(a.$('#toast > .aviso'), segundo, 'o mesmo texto com o aviso na tela não é outra mensagem: nada se mexe');

  // a que está apagando não é a da tela: o mesmo texto chega de novo
  apaga(a);
  assert.ok(segundo.classList.contains('sai'), 'com movimento pedido, a mensagem apaga');
  diz(a, MEDIA);
  const terceiro = a.$('#toast > .aviso');
  assert.notStrictEqual(terceiro, segundo, 'o mesmo texto sobre a que apagava chega de novo');
  assert.ok(!terceiro.classList.contains('sai'));
  assert.strictEqual(mensagens(a).length, 1);
  a.fechar();
});

test('a saída apaga pelo tempo da porta e tira o nó; sob "Reduzir movimento" e sem a porta saber, sai de uma vez', async () => {
  const a = await app(pede(false));
  const m = /^(\d*\.?\d+)(ms|s)$/.exec(a.E(`getComputedStyle(document.documentElement).getPropertyValue('--ins-dur-lugar')`).trim());
  assert.ok(m, 'o token --ins-dur-lugar não se lê');
  const LUGAR = Number(m[1]) * (m[2] === 's' ? 1000 : 1);
  diz(a, MEDIA);
  apaga(a);
  const no = a.$('#toast > .aviso');
  assert.ok(no && no.classList.contains('sai'), 'apagando: o nó continua, com `.sai`');
  await a.esperar(Math.round(LUGAR / 3));
  assert.ok(no.isConnected, 'ainda apagando');
  await a.esperar(LUGAR);
  assert.strictEqual(mensagens(a).length, 0, 'o relógio da porta tirou o nó — o jsdom nunca dispara fim de animação');
  assert.strictEqual(a.texto('#toast'), '');
  a.fechar();

  for (const [nome, op] of [['sob "Reduzir movimento"', pede(true)], ['sem matchMedia', undefined]]) {
    const r = await app(op);
    diz(r, MEDIA);
    assert.ok(!r.$('#toast > .aviso').classList.contains('sai'));
    apaga(r);
    assert.strictEqual(mensagens(r).length, 0, nome + ': sai de uma vez, no mesmo tique');
    r.fechar();
  }
});

test('a região viva fica sempre na página, vazia sem mensagem, e não tem nada que se foque', async () => {
  const a = await app(pede(false));
  const regiao = a.$('#toast');
  const confere = quando => {
    assert.strictEqual(a.$('#toast'), regiao, quando + ': a mesma região, nunca recriada');
    assert.strictEqual(regiao.getAttribute('role'), 'status', quando);
    assert.strictEqual(regiao.getAttribute('aria-live'), 'polite', quando);
    assert.ok(!regiao.hidden && !regiao.hasAttribute('aria-hidden') && !regiao.hasAttribute('inert'), quando + ': nada a esconde');
    assert.notStrictEqual(a.window.getComputedStyle(regiao).display, 'none', quando + ': nunca display: none');
    assert.notStrictEqual(a.window.getComputedStyle(regiao).visibility, 'hidden', quando + ': nunca visibility: hidden');
    assert.strictEqual(regiao.querySelectorAll('a, button, input, select, textarea, [tabindex]').length, 0, quando + ': nada focável');
  };
  confere('antes de qualquer aviso');
  assert.strictEqual(regiao.textContent, '', 'vazia antes de qualquer aviso');
  diz(a, CURTA);
  confere('com o aviso');
  assert.strictEqual(regiao.textContent, CURTA, 'o texto entra numa região que já estava na árvore');
  apaga(a);
  confere('apagando');
  await a.esperar(400);
  confere('depois');
  assert.strictEqual(regiao.textContent, '', 'vazia depois: o VoiceOver não acha frase velha ao passar o dedo');
  a.fechar();
});
