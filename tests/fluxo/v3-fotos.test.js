// A sessão de fotos no visual novo (direção 3, Fase 1), no app montado:
// quem segura, os três passos, "tudo como da última vez?", as três luzes que
// destravam o disparo, "tirar mesmo assim" e o fim com a ressalva.
// Especificação: docs/redesign-3/03-lotes.md e 02-captura.md.

import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { cacheFalso, cameraFalsa } from './dubles.js';

const DIA = 86400000;
function iso(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** O app com o visual novo, a câmera e o cache falsos, e a nova sessão aberta. */
async function novaSessao(antes) {
  const a = await app({ aba: 'corpo' });
  await a.pronto();
  a.E('CTX.alternaVisual()');
  cacheFalso(a);
  cameraFalsa(a);
  if (antes) antes(a);
  a.v('ctx.abreProtocolo');
  await a.esperar();
  return a;
}
async function abreCamera(a) {
  a.clicar('[data-a="sessao-camera"]');
  await a.esperar(80);
}
const confereTudo = async a => {
  for (const k of ['nivel', 'altura', 'distancia']) a.clicar(`[data-a="luz-${k}"]`);
  await a.esperar();
};
const fotoDeHoje = (a, pose = 'frente-relaxado') => {
  const s = a.S().protocolo.sessoes.filter(x => x.d === iso(Date.now()))[0];
  return s && s.fotos[pose];
};
const comSessaoAnterior = a => a.E(`S.protocolo.sessoes = [{ d: ${JSON.stringify(iso(Date.now() - 14 * DIA))}, t: 1, m: 1,
  fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } }]`);

test('nova sessão: três cenários, e "alguém que nunca fez" passa pelos três passos antes da câmera', async () => {
  const a = await novaSessao();
  assert.strictEqual(a.$$('.v3-esc').length, 3);
  assert.strictEqual(a.$('[data-a="quem-sempre"]').getAttribute('aria-pressed'), 'true', 'o padrão é a pessoa de sempre');
  assert.ok(a.$('[data-a="sessao-camera"]'));

  a.clicar('[data-a="quem-novo"]');
  await a.esperar();
  assert.strictEqual(a.E('quemTira'), 'alguem', 'alguém novo é o mesmo modo de câmera');
  a.clicar('[data-a="sessao-passar"]');
  await a.esperar();
  assert.ok(a.texto('.v3-passos').includes('Sente na cadeira marcada'));
  assert.deepStrictEqual(a.E('JSON.stringify(camadasAbertas(view))'), JSON.stringify(['protocolo', 'passos']), 'os passos são uma camada');

  a.v('ctx.fechaPassosDasFotos');
  await a.esperar();
  assert.ok(a.$('[data-a="sessao-passar"]'), 'voltar devolve a nova sessão');

  a.clicar('[data-a="sessao-passar"]');
  await a.esperar();
  a.clicar('[data-a="passos-entendi"]');
  await a.esperar(80);
  assert.ok(a.vista().camera, 'entendi abre a câmera');
  assert.ok(!a.vista().protocolo.passos, 'e os passos saem da pilha: fechar a câmera volta à sessão');
  assert.ok(a.$('.v3-cam'), 'a câmera do visual novo');
  a.fechar();
});

test('sozinho fica guardado como o modo do aparelho; "novo" não', async () => {
  const a = await novaSessao();
  a.clicar('[data-a="quem-sozinho"]');
  await a.esperar();
  assert.strictEqual(a.E('quemTira'), 'sozinho');
  a.clicar('[data-a="quem-novo"]');
  await a.esperar();
  assert.strictEqual(a.E('quemTira'), 'alguem');
  assert.strictEqual(a.vista().protocolo.novo, true);
  a.fechar();
});

test('"tudo como da última vez?" só aparece com sessão anterior, e o que mudou entra na sessão', async () => {
  let a = await novaSessao();
  assert.ok(!a.$('.v3-cond'), 'primeira sessão: não há última vez');
  a.fechar();

  a = await novaSessao(comSessaoAnterior);
  a.clicar('[data-a="muda-luz"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="muda-luz"]').getAttribute('aria-pressed'), 'true');
  assert.ok(/outra luz/.test(a.texto('[data-a="muda-luz"]')));
  await abreCamera(a);
  await confereTudo(a);
  a.clicar('[data-a="cam-ajustado"]');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  const ses = a.S().protocolo.sessoes.filter(x => x.d === iso(Date.now()))[0];
  assert.deepStrictEqual(ses.muda, ['luz'], 'a sessão nasce com o que mudou');
  a.fechar();
});

test('o botão só destrava com as três luzes; a foto no padrão sai sem marca', async () => {
  const a = await novaSessao();
  await abreCamera(a);
  assert.strictEqual(a.$('[data-a="cam-ajustado"]').disabled, true, 'travado até ficar verde');
  a.v('ctx.ajustado');
  a.v('ctx.disparaCamera');
  await a.esperar(100);
  assert.strictEqual(a.S().protocolo.sessoes.length, 0, 'nem pela porta de trás');

  a.clicar('[data-a="luz-nivel"]');
  a.clicar('[data-a="luz-altura"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="cam-ajustado"]').disabled, true, 'duas não bastam');
  assert.ok(/cabeça e pés nas linhas/.test(a.texto('.v3-cam-aviso')), 'e o aviso diz o que falta: ' + a.texto('.v3-cam-aviso'));
  a.clicar('[data-a="luz-distancia"]');
  await a.esperar();
  assert.strictEqual(a.$('[data-a="cam-ajustado"]').disabled, false);
  a.clicar('[data-a="cam-ajustado"]');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  const f = fotoDeHoje(a);
  assert.ok(f, 'a foto saiu');
  assert.strictEqual(f.cap.fora, undefined, 'no padrão, sem marca');
  a.fechar();
});

test('"tirar mesmo assim" pergunta, destrava, e cada foto guarda o que ficou sem acertar', async () => {
  const a = await novaSessao();
  await abreCamera(a);
  a.clicar('[data-a="luz-nivel"]');
  await a.esperar();
  a.clicar('[data-a="cam-mesmo-assim"]');
  await a.esperar(40);
  assert.ok(a.$('.v3-folha'), 'a confirmação abriu');
  assert.strictEqual(a.texto('.v3-folha .v3-btn.p'), 'Voltar e acertar', 'o caminho seguro é o principal');
  a.clicar('[data-a="aviso-sim"]');
  await a.esperar(40);
  assert.strictEqual(a.vista().camera.ajuste, false, 'o ajuste acabou');
  assert.ok(/Fora do padrão: altura, distância sem acertar/.test(a.texto('.v3-cam-aviso')), a.texto('.v3-cam-aviso'));
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  assert.deepStrictEqual(fotoDeHoje(a).cap.fora, ['altura', 'distancia']);
  a.fechar();
});

test('celular girando no disparo: a foto entra marcada como tremida', async () => {
  const a = await novaSessao(x => x.E('window.DeviceMotionEvent = function () {}'));
  await abreCamera(a);
  a.E(`const e = new Event('devicemotion');
       e.accelerationIncludingGravity = { x: 0, y: 9.81, z: 0 };
       e.rotationRate = { alpha: 12, beta: 0, gamma: 0 };
       for (let i = 0; i < 40; i++) window.dispatchEvent(e);`);
  await a.esperar(260);
  a.clicar('[data-a="luz-altura"]');
  a.clicar('[data-a="luz-distancia"]');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.cameraV3').luzes.medida.nivel, true, 'o nível vem do sensor');
  a.clicar('[data-a="cam-ajustado"]');
  await a.esperar();
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  assert.deepStrictEqual(fotoDeHoje(a).cap.fora, ['tremida']);
  a.fechar();
});

test('no visual antigo nada trava e nada é marcado, menos a torta guardada de propósito', async () => {
  const a = await app({ aba: 'corpo' });
  a.E('window.DeviceMotionEvent = function () {}');
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  a.v('ctx.ajustado');
  a.E(`const e = new Event('devicemotion');
       e.accelerationIncludingGravity = { x: 9.81 * Math.tan(3 * Math.PI / 180), y: 9.81, z: 0 };
       e.rotationRate = { alpha: 0, beta: 0, gamma: 0 };
       for (let i = 0; i < 40; i++) window.dispatchEvent(e);`);
  await a.esperar(260);
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  await a.v('ctx.registraTorta');
  await a.esperar(60);
  assert.deepStrictEqual(fotoDeHoje(a).cap.fora, ['nivel'], 'guardar torta é fora do padrão no nível');
  a.fechar();
});

test('o fim diz a ressalva, marca a foto fora do padrão e leva a medir', async () => {
  const a = await novaSessao(x => x.E(`
    const d = hojeISO(), fotos = {};
    ordemDePoses().forEach(function (id, i) {
      fotos[id] = { v: i + 1, ext: 'webp', cap: { via: 'app', l: 1, a: 1 } };
    });
    fotos['frente-relaxado'].cap.fora = ['altura'];
    S.protocolo.sessoes = [{ d: d, t: 1, m: 1, muda: ['luz'], fotos: fotos }];`));
  assert.ok(/uma fora do padrão/.test(a.texto('.v3-bloco-t')), a.texto('.v3-bloco-t'));
  assert.ok(/Anotado nesta sessão: outra luz/.test(a.texto('.v3-bloco-a')));
  assert.strictEqual(a.$$('.v3-grade .v3-foto-m').length, 1, 'uma marca, na foto fora');
  assert.ok(a.$('[data-a="fim-foto-frente-relaxado"] .v3-foto-m'));
  a.clicar('[data-a="fim-medir"]');
  await a.esperar();
  assert.strictEqual(a.vista().protocolo, null, 'a sessão sai');
  assert.ok(a.vista().medidas, 'e as medidas entram');
  a.fechar();
});

test('a câmera fechada no meio volta à sessão pela metade, com os dois caminhos', async () => {
  const a = await novaSessao();
  await abreCamera(a);
  a.clicar('[data-a="cam-sair"]');
  await a.esperar();
  assert.strictEqual(a.vista().camera, null);
  assert.ok(a.$('[data-a="sessao-camera"]'), 'continuar na câmera do app');
  assert.ok(a.$('label.v3-saida input[type="file"]'), 'e a câmera do sistema');
  assert.strictEqual(a.$$('.v3-lin').length, a.vJ('ctx.sessaoDeFotos').total, 'as poses, para escolher');
  a.fechar();
});

test('sozinho, o toque que começa a sessão também espera as três luzes', async () => {
  const a = await novaSessao();
  a.clicar('[data-a="quem-sozinho"]');
  await a.esperar();
  await abreCamera(a);
  a.v('ctx.setTimerDaCamera', 0);
  assert.strictEqual(a.$('[data-a="cam-disparo"]').disabled, true);
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  assert.strictEqual(a.S().protocolo.sessoes.length, 0, 'nem pela porta de trás');
  assert.strictEqual(a.vista().camera.seguido, false, 'a sequência não começou');
  await confereTudo(a);
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  assert.ok(fotoDeHoje(a), 'com as três verdes, sai');
  a.fechar();
});

test('refazer uma foto pelo fim abre a câmera com o disparo, e só depois dele vem "Ver a sessão"', async () => {
  const a = await novaSessao(x => x.E(`
    const fotos = {};
    ordemDePoses().forEach(function (id, i) { fotos[id] = { v: i + 1, ext: 'webp' }; });
    S.protocolo.sessoes = [{ d: hojeISO(), t: 1, m: 1, fotos: fotos }];`));
  a.clicar('[data-a="fim-foto-frente-relaxado"]');
  await a.esperar(80);
  assert.strictEqual(a.vista().protocolo.pose, 'frente-relaxado');
  assert.ok(a.$('[data-a="cam-disparo"]'), 'o disparo, e não "Ver a sessão"');
  assert.ok(!a.$('[data-a="cam-ver-sessao"]'));
  await confereTudo(a);
  a.clicar('[data-a="cam-disparo"]');
  await a.esperar(150);
  assert.ok(a.$('[data-a="cam-ver-sessao"]'), 'refeita, a sessão está completa de novo');
  a.fechar();
});
