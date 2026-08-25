// A foto do aparelho.
//
// O que ela responde não é "como se faz uma puxada" — ele sabe. É "qual das
// três puxadas desta academia é a que o treinador quis dizer". Por isso é foto
// dele, e por isso os bytes nunca entram no estado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

/** Cache Storage de mentira: o jsdom não tem, e é onde os bytes moram. */
function cacheFalso(a) {
  a.E(`
    // o jsdom não traz Response, que o Cache Storage exige para embrulhar bytes
    if (typeof Response === 'undefined') {
      globalThis.Response = function (corpo) { this._c = corpo; };
      globalThis.Response.prototype.blob = async function () { return this._c; };
    }
    if (typeof URL.createObjectURL !== 'function') {
      let n = 0;
      URL.createObjectURL = () => 'blob:teste/' + (++n);
      URL.revokeObjectURL = () => {};
    }
    globalThis.__caches = {};
    globalThis.caches = {
      open: async function (nome) {
        const c = globalThis.__caches[nome] || (globalThis.__caches[nome] = {});
        return {
          put: async function (k, resp) { c[k] = resp; },
          match: async function (k) { return c[k] || undefined; },
          delete: async function (k) { const t = k in c; delete c[k]; return t; }
        };
      }
    };
    // createImageBitmap e canvas.toBlob não existem no jsdom
    globalThis.__passos = [];
    // 4000x3000: o que uma foto de telefone realmente entrega
    globalThis.createImageBitmap = async function () {
      return { width: 4000, height: 3000, close: function () {} };
    };
    const criar = document.createElement.bind(document);
    document.createElement = function (tag) {
      const el = criar(tag);
      if (tag === 'canvas') {
        el.getContext = function () {
          return {
            drawImage: function () { globalThis.__passos.push(el.width + 'x' + el.height); },
            fillRect: function () {},
            set fillStyle(v) {},
            set imageSmoothingEnabled(v) { globalThis.__suave = v; },
            set imageSmoothingQuality(v) { globalThis.__qual = v; }
          };
        };
        el.toBlob = function (cb, tipo) {
          globalThis.__medida = { l: el.width, a: el.height };
          cb(tipo === 'image/webp' ? new Blob(['x'.repeat(6000)], { type: 'image/webp' }) : null);
        };
      }
      return el;
    };
  `);
}
const guardadas = a => Object.keys(a.J('globalThis.__caches["treino-fotos"] || {}'));

test('o botão convida quando não há foto e mostra quando há', async () => {
  const a = await app();
  a.E('toggle(0)');
  const rotulos = () => a.$$('.ex.open .exacoes .histbtn').map(x => x.textContent.trim());
  assert.ok(rotulos().includes('foto'), rotulos().join(' | '));

  a.E('S.fotos["chest-press-inclinado-convergente"] = { v: 1, ext: "webp" }');
  a.E('render()');
  assert.ok(rotulos().includes('aparelho'), 'com foto, o rótulo muda: ' + rotulos().join(' | '));
  a.fechar();
});

test('a foto entra no cache do aparelho, e só a referência no estado', async () => {
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  assert.ok(a.$('.ins-folha'), 'a folha abriu');

  await a.E(`tiraFoto({ files: [new Blob(['foto'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(50);

  const ref = a.J('S.fotos["chest-press-inclinado-convergente"]');
  assert.ok(ref && ref.v > 0, 'a referência ficou no estado');
  assert.strictEqual(ref.ext, 'webp');
  assert.deepStrictEqual(guardadas(a), ['./foto/chest-press-inclinado-convergente.webp'],
    'e os bytes foram para o cache, não para o estado');

  // o estado não pode ter engordado com imagem
  const json = a.E('JSON.stringify(S.fotos)');
  assert.ok(json.length < 200, 'a referência é pequena: ' + json.length + ' bytes');
  a.fechar();
});

test('apagar tira a referência e deixa lápide', async () => {
  const a = await app();
  cacheFalso(a);
  a.E('window.confirm = () => true');
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['foto'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(50);

  await a.E('apagaFoto()');
  await a.esperar(50);
  assert.strictEqual(a.E('S.fotos["chest-press-inclinado-convergente"]'), undefined);
  assert.deepStrictEqual(guardadas(a), [], 'os bytes saíram do cache também');
  assert.ok(a.J('S.apagados')['foto:chest-press-inclinado-convergente'],
    'a lápide impede o outro aparelho de ressuscitar a referência');
  a.fechar();
});

test('a foto chega à tela como endereço de objeto, sem passar pela rede', async () => {
  // A primeira versão servia uma URL sintética e deixava o service worker
  // respondê-la. O worker só é registrado em HTTPS: em desenvolvimento não
  // havia quem respondesse, e a imagem quebrava.
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.E('abreFoto(0)');
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(60);

  const url = a.E('CTX.foto("chest-press-inclinado-convergente").url');
  assert.match(url, /^blob:/, 'endereço de objeto, não caminho de rede: ' + url);
  assert.ok(!/^https?:/.test(url), 'e nada de endereço externo');
  a.fechar();
});

test('sem os bytes lidos, a tela simplesmente não desenha a imagem', async () => {
  // referência existe, bytes ainda não desceram: nada de quadro quebrado
  const a = await app();
  cacheFalso(a);
  a.E('S.fotos["pendulum-squat"] = { v: 123, ext: "webp" }');
  assert.strictEqual(a.E('CTX.foto("pendulum-squat").url'), null);
  a.fechar();
});

test('sem foto, a folha não desenha imagem nenhuma', async () => {
  // quadro vazio não informa: o sistema manda não desenhar nada
  const a = await app();
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  assert.strictEqual(a.$('.fotoex'), null, 'sem <img> e sem placeholder');
  assert.ok(a.texto('.foto-vazio').includes('Sem foto'));
  a.fechar();
});

// ---------- replicação entre aparelhos ----------

/** Nuvem de mentira com bucket, para exercitar a reconciliação de bytes. */
function nuvemComBucket(a, comFoto) {
  a.E(`
    globalThis.__bucket = ${JSON.stringify(comFoto || {})};
    globalThis.__subiu = [];
    NUVEM.sessao = () => ({ email: 'eu@x.com', uid: 'u1' });
    NUVEM.pronta = async () => NUVEM.sessao();
    NUVEM.puxa = async () => ({ ok: true, v: globalThis.__linha || null });
    NUVEM.empurra = async (deV, data) => {
      globalThis.__linha = { v: (globalThis.__linha ? globalThis.__linha.v : 0) + 1,
                             data: JSON.parse(JSON.stringify(data)) };
      return { ok: true, v: globalThis.__linha.v };
    };
    NUVEM.subirFoto = async (id, blob, ext) => {
      globalThis.__subiu.push(id); globalThis.__bucket[id + '.' + ext] = 1; return { ok: true, v: true };
    };
    NUVEM.baixaFoto = async (id, ext) => ({ ok: true,
      v: globalThis.__bucket[id + '.' + ext] ? new Blob(['bytes'], { type: 'image/' + ext }) : null });
    NUVEM.apagaFoto = async (id, ext) => { delete globalThis.__bucket[id + '.' + ext]; return { ok: true, v: true }; };
  `);
}

test('a foto tirada aqui sobe para a nuvem', async () => {
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a);
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(80);

  assert.deepStrictEqual(a.J('globalThis.__subiu'), ['chest-press-inclinado-convergente']);
  assert.ok(a.J('globalThis.__bucket')['chest-press-inclinado-convergente.webp']);
  a.fechar();
});

test('referência sem bytes locais busca a foto do outro aparelho', async () => {
  // é o aparelho novo entrando: o estado desce com a referência, os bytes não
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a, { 'pendulum-squat.webp': 1 });
  a.E(`S.fotos = { 'pendulum-squat': { v: 999, ext: 'webp' } }`);

  await a.E('reconciliaFotos()');
  await a.esperar(80);

  assert.ok(guardadas(a).includes('./foto/pendulum-squat.webp'),
    'os bytes foram parar no cache deste aparelho: ' + guardadas(a).join(','));
  a.fechar();
});

test('sem rede, a reconciliação para e não perde a conta', async () => {
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a);
  a.E(`NUVEM.subirFoto = async () => ({ ok: false, erro: 'rede', msg: 'sem conexão' })`);
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(80);

  assert.ok(a.J('S.fotos')['chest-press-inclinado-convergente'], 'a foto está aqui de qualquer forma');
  assert.strictEqual(a.E('sync.fotos["chest-press-inclinado-convergente"]'), undefined,
    'e não foi marcada como enviada — a próxima sincronização tenta de novo');
  a.fechar();
});

test('apagar tira do bucket também, para o byte não ficar órfão', async () => {
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a);
  a.E('window.confirm = () => true');
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(80);
  assert.ok(a.J('globalThis.__bucket')['chest-press-inclinado-convergente.webp']);

  await a.E('apagaFoto()');
  await a.esperar(80);
  assert.strictEqual(a.J('globalThis.__bucket')['chest-press-inclinado-convergente.webp'], undefined);
  a.fechar();
});

test('a miniatura aparece na troca só quando há foto', async () => {
  const a = await app();
  cacheFalso(a);
  // atalho para pôr bytes no cache sem passar pela captura
  a.E(`globalThis.FOTO_GUARDA = async id => {
    const c = await caches.open('treino-fotos');
    await c.put('./foto/' + id + '.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  }`);
  a.E('toggle(0)');
  a.E('toggleSwap(0)');
  assert.strictEqual(a.$$('.swapfoto').length, 0, 'sem foto, nem moldura');

  // com referência E bytes no cache, a miniatura aparece
  const primeiro = a.E('trocaDoDia(view.day, 0).grupos[0].opcoes[0].id');
  a.E('S.fotos[' + JSON.stringify(primeiro) + '] = { v: 5, ext: "webp" }');
  await a.E('FOTO_GUARDA(' + JSON.stringify(primeiro) + ')');
  a.E('toggleSwap(0)'); a.E('toggleSwap(0)');
  await a.esperar(60);
  assert.strictEqual(a.$$('.swapfoto').length, 1, 'com foto, uma miniatura');
  assert.match(a.$('.swapfoto').getAttribute('src'), /^blob:/, 'endereço de objeto');
  a.fechar();
});

test('a redução acontece em passos, não de uma vez', async () => {
  // Encolher 4000 para 1080 num passo só faz o navegador amostrar um pixel a
  // cada quatro e jogar o resto fora — é daí que vem o embaçado, e nenhum
  // aumento de qualidade de compressão conserta, porque a informação já se
  // perdeu antes de comprimir.
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.E('abreFoto(0)');
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(60);

  const passos = a.J('globalThis.__passos');
  assert.ok(passos.length > 1, 'mais de um passo: ' + passos.join(' → '));
  assert.strictEqual(passos[passos.length - 1], '1080x810', 'e termina no tamanho de gravação');
  assert.strictEqual(a.E('globalThis.__qual'), 'high', 'pedindo a interpolação boa');
  assert.strictEqual(a.E('globalThis.__suave'), true);
  a.fechar();
});

test('print em pé não vira tira: o teto é do lado maior', async () => {
  // Limitar só a largura deixava a altura solta — um print de tela em pé
  // virava uma tira: pesada de guardar e minúscula de ver.
  const a = await app();
  cacheFalso(a);
  a.E(`
    globalThis.__medida = null;
    globalThis.__passos = [];
    // retrato: é o formato de um print de tela, e o caso que motivou a mudança
    globalThis.createImageBitmap = async () => ({ width: 900, height: 2000, close(){} });
    const criar = document.createElement.bind(document);
    document.createElement = function (t) {
      const el = criar(t);
      if (t === 'canvas') {
        el.getContext = () => ({
          drawImage(){ globalThis.__passos.push(el.width + 'x' + el.height); },
          fillRect(){}, set fillStyle(v){},
          set imageSmoothingEnabled(v){ globalThis.__suave = v; },
          set imageSmoothingQuality(v){ globalThis.__qual = v; }
        });
        el.toBlob = function (cb, tipo) {
          globalThis.__medida = { l: el.width, a: el.height };
          cb(tipo === 'image/webp' ? new Blob(['x'], { type: 'image/webp' }) : null);
        };
      }
      return el;
    };
  `);
  a.E('toggle(0)');
  a.E('abreFoto(0)');
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/png' })], value: '' })`);
  await a.esperar(60);

  const m = a.J('globalThis.__medida');
  assert.strictEqual(Math.max(m.l, m.a), 1080, 'o lado maior é que manda: ' + JSON.stringify(m));
  assert.strictEqual(m.l, 486, 'e a proporção se mantém: 900x2000 vira 486x1080');
  a.fechar();
});

test('PNG entra e sai como WebP: nada de PNG chega ao bucket', async () => {
  // PNG de foto é enorme, e o bucket aceita só os dois formatos que o app grava
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.E('abreFoto(0)');
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/png' })], value: '' })`);
  await a.esperar(60);
  assert.strictEqual(a.J('S.fotos["chest-press-inclinado-convergente"]').ext, 'webp');
  a.fechar();
});

// ---------- a miniatura no cartão ----------

test('sem foto, o lugar dela é o caminho para tirar uma', async () => {
  // é o que separa "espaço reservado" de decoração: ele faz alguma coisa
  const a = await app();
  const alvo = a.$('.exfoto');
  assert.ok(alvo.className.includes('vazia'));
  assert.strictEqual(alvo.getAttribute('aria-label'), 'Adicionar foto do aparelho');
  assert.strictEqual(a.$('.exfoto img'), null, 'e não desenha imagem quebrada');

  a.clicar(alvo);
  assert.ok(a.$('.ins-folha'), 'tocar nele abre a folha da foto');
  a.fechar();
});

test('tocar na miniatura não abre o exercício junto', async () => {
  // abrir o exercício e abrir a câmera são intenções diferentes; sem parar a
  // propagação, um toque faria as duas
  const a = await app();
  assert.strictEqual(a.E('view.open'), null);
  a.clicar(a.$('.exfoto'));
  assert.strictEqual(a.E('view.open'), null, 'o cartão continua fechado');
  a.fechar();
});

test('o número do exercício continua visível, embaixo da miniatura', async () => {
  // a calha era só dele; a miniatura entrou sem tomar largura do nome
  const a = await app();
  assert.strictEqual(a.texto('.exfoto .ord'), '01');
  a.fechar();
});

test('a miniatura mostra a foto quando os bytes estão em memória', async () => {
  const a = await app();
  cacheFalso(a);
  a.E('toggle(0)');
  a.clicar(a.$$('.ex.open .exacoes .histbtn').filter(b => b.textContent.trim() === 'foto')[0]);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(80);

  const img = a.$('.exfoto img');
  assert.ok(img, 'a miniatura passou a mostrar a foto');
  assert.match(img.getAttribute('src'), /^blob:/);
  assert.ok(!a.$('.exfoto').className.includes('vazia'));
  a.fechar();
});
