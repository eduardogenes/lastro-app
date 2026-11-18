// A foto do aparelho.
//
// O que ela responde não é "como se faz uma puxada" — ele sabe. É "qual das
// três puxadas desta academia é a que o treinador quis dizer". Por isso é foto
// dele, e por isso os bytes nunca entram no estado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { cacheFalso, guardadasEm, nuvemComBucket } from './dubles.js';

const guardadas = a => guardadasEm(a, 'lastro-fotos');

test('a foto chega à tela como endereço de objeto, sem passar pela rede', async () => {
  // A primeira versão servia uma URL sintética e deixava o service worker
  // respondê-la. O worker só é registrado em HTTPS: em desenvolvimento não
  // havia quem respondesse, e a imagem quebrava.
  const a = await app();
  cacheFalso(a);
  a.v('toggle', 0);
  a.v('abreFoto', 0);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
  await a.esperar(60);

  const url = a.vJ('ctx.foto', 'chest-press-inclinado-convergente').url;
  assert.match(url, /^blob:/, 'endereço de objeto, não caminho de rede: ' + url);
  assert.ok(!/^https?:/.test(url), 'e nada de endereço externo');
  a.fechar();
});

test('sem os bytes lidos, a tela simplesmente não desenha a imagem', async () => {
  // referência existe, bytes ainda não desceram: nada de quadro quebrado
  const a = await app();
  cacheFalso(a);
  a.E('S.fotos["pendulum-squat"] = { v: 123, ext: "webp" }');
  assert.strictEqual(a.vJ('ctx.foto', 'pendulum-squat').url, null);
  a.fechar();
});

test('referência sem bytes locais busca a foto do outro aparelho', async () => {
  // é o aparelho novo entrando: o estado desce com a referência, os bytes não
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a, { 'pendulum-squat.webp': 1 });
  a.E(`S.fotos = { 'pendulum-squat': { v: 999, ext: 'webp' } }`);

  await a.v('reconciliaFotos');
  await a.esperar(80);

  assert.ok(guardadas(a).includes('./foto/pendulum-squat.webp'),
    'os bytes foram parar no cache deste aparelho: ' + guardadas(a).join(','));
  a.fechar();
});

// ---------- os bytes dizem de que versão são (docs/mapa, risco D6) ----------

test('o aparelho com a foto velha não a sobe por cima da trocada no outro', async () => {
  // Este aparelho subiu a versão 100; o outro trocou a foto (versão 200) e a
  // referência nova chegou pela fusão. Os bytes daqui são os da 100.
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a, { 'pendulum-squat.webp': 1 });
  await a.E(`(async () => {
    const c = await caches.open('lastro-fotos');
    await c.put('./foto/pendulum-squat.webp', new Response(new Blob(['velha'], { type: 'image/webp' }),
      { headers: { 'Content-Type': 'image/webp', 'X-Lastro-Versao': '100' } }));
  })()`);
  a.E(`S.fotos = { 'pendulum-squat': { v: 200, ext: 'webp' } }; sync.fotos['pendulum-squat'] = 100`);

  await a.v('reconciliaFotos');
  await a.esperar(80);

  assert.deepStrictEqual(a.J('globalThis.__subiu'), [], 'a velha não subiu por cima da nova');
  assert.strictEqual(await a.E(`(async () => (await (await caches.open('lastro-fotos')).match('./foto/pendulum-squat.webp')).headers.get('X-Lastro-Versao'))()`), '200',
    'e a nova veio da nuvem, com a versão dela');
  assert.strictEqual(a.dado('sync').fotos['pendulum-squat'], 200);
  a.fechar();
});

test('bytes de antes desta versão sobem só se a nuvem não tiver a foto', async () => {
  const a = await app();
  cacheFalso(a);
  nuvemComBucket(a, { 'pendulum-squat.webp': 1 });
  // guardados sem dizer a versão, como tudo o que foi guardado antes
  await a.E(`(async () => {
    const c = await caches.open('lastro-fotos');
    await c.put('./foto/pendulum-squat.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
    await c.put('./foto/remo-baixo.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  })()`);
  a.E(`S.fotos = { 'pendulum-squat': { v: 200, ext: 'webp' }, 'remo-baixo': { v: 300, ext: 'webp' } };
       sync.fotos['pendulum-squat'] = 100`);

  await a.v('reconciliaFotos');
  await a.esperar(80);

  assert.deepStrictEqual(a.J('globalThis.__subiu'), ['remo-baixo'],
    'só sobe a que a nuvem não tem: a daqui é a única cópia');
  a.fechar();
});

test('a redução acontece em passos, não de uma vez', async () => {
  // Encolher 4000 para 1080 num passo só faz o navegador amostrar um pixel a
  // cada quatro e jogar o resto fora — é daí que vem o embaçado, e nenhum
  // aumento de qualidade de compressão conserta, porque a informação já se
  // perdeu antes de comprimir.
  const a = await app();
  cacheFalso(a);
  a.v('toggle', 0);
  a.v('abreFoto', 0);
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
  a.v('toggle', 0);
  a.v('abreFoto', 0);
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
  a.v('toggle', 0);
  a.v('abreFoto', 0);
  await a.E(`tiraFoto({ files: [new Blob(['x'], { type: 'image/png' })], value: '' })`);
  await a.esperar(60);
  assert.strictEqual(a.S().fotos["chest-press-inclinado-convergente"].ext, 'webp');
  a.fechar();
});

test('as fotos mudam de cache junto com o nome do app', async () => {
  // O cache se chamava treino-fotos. Renomear sem migrar apagaria as fotos dos
  // aparelhos na primeira ativação do service worker, porque o activate limpa
  // todo cache que ele não reconhece.
  const a = await app();
  cacheFalso(a);
  a.E(`globalThis.__caches['treino-fotos'] = {
    './foto/pendulum-squat.webp': new Response(new Blob(['x'], { type: 'image/webp' })),
    './foto/leg-press.webp': new Response(new Blob(['y'], { type: 'image/webp' }))
  }`);

  const levadas = await a.v('migraCache');
  assert.strictEqual(levadas, 2, 'as duas fotos passaram para o cache novo');
  assert.deepStrictEqual(guardadas(a).sort(),
    ['./foto/leg-press.webp', './foto/pendulum-squat.webp']);
  assert.strictEqual(a.E('"treino-fotos" in globalThis.__caches'), false,
    'o cache antigo só some depois de os bytes estarem no novo');
});

test('sem cache antigo, a migração não cria um vazio', async () => {
  // caches.open() CRIA o cache que não existe. Se a migração abrisse antes de
  // perguntar, toda abertura do app deixaria um treino-fotos vazio para trás —
  // e o service worker teria que poupá-lo para sempre.
  const a = await app();
  cacheFalso(a);

  const levadas = await a.v('migraCache');
  assert.strictEqual(levadas, 0);
  assert.strictEqual(a.E('"treino-fotos" in globalThis.__caches'), false,
    'perguntou com has() em vez de abrir');
});
