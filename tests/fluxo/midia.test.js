// A MÍDIA DO EXERCÍCIO na tela da série (Fase D): o vídeo do catálogo abre no
// trecho, sem som e sem cookies; exercício sem mídia fica como era; a
// sugestão fica no aparelho e não entra no estado sincronizado.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';

async function naSerie(i) {
  const a = await app();
  a.v('go', 'A');
  a.v('render');
  a.v('toggle', i);
  a.v('ctx.setFocoV3', i, 0);
  await a.pintar();
  return a;
}

test('a série com vídeo no catálogo mostra "Ver execução" e abre o trecho sem som', async () => {
  // A[4] é a Elevação lateral na máquina: vídeo de 2:02 a 2:45
  const a = await naSerie(4);
  const f = a.vJ('ctx.focoV3');
  assert.strictEqual(f.midia.video.yt, 'IwWvZ0rlNXs');
  assert.strictEqual(f.midia.video.dur, '0:43');
  const b = a.doc.querySelector('[data-a="midia-video"]');
  assert.ok(b, 'o botão do vídeo está na tela da série');
  assert.match(b.textContent, /Ver execução/);
  a.clicar(b);
  await a.pintar();
  const ifr = a.doc.querySelector('.v3-mplayer iframe');
  assert.ok(ifr, 'a folha do vídeo abriu');
  const src = ifr.getAttribute('src');
  assert.match(src, /^https:\/\/www\.youtube-nocookie\.com\/embed\/IwWvZ0rlNXs\?/);
  assert.match(src, /start=122/);
  assert.match(src, /end=165/);
  assert.match(src, /mute=1/, 'começa sem som (decisão do dono)');
  assert.match(src, /playsinline=1/);
  assert.match(a.doc.querySelector('[data-a="midia-youtube"]').getAttribute('href'), /watch\?v=IwWvZ0rlNXs&t=122s/);
  assert.match(a.texto('.v3-mfonte'), /Leandro Twin/);
  a.fechar();
});

test('exercício sem mídia no catálogo: a série fica como era', async () => {
  // A[0] é o Chest press inclinado convergente, ainda sem vídeo
  const a = await naSerie(0);
  assert.strictEqual(a.vJ('ctx.focoV3').midia, null);
  assert.strictEqual(a.doc.querySelector('[data-a="midia-video"]'), null);
  assert.strictEqual(a.doc.querySelector('.v3-mq'), null);
  a.fechar();
});

test('o nome do treinador acha a mídia do exercício do sistema (nome alternativo)', async () => {
  const a = await naSerie(4);
  // um exercício pessoal com o nome que o v3.0 usa leva ao reverse-pec-deck
  a.E("S.ex['crucifixo-inverso-no-peck-deck'] = { n: 'Crucifixo inverso no peck deck', g: 'delt posterior', car: 'pino', c: 0, cue: '', meu: 1, m: Date.now() }; montaCatalogo();");
  a.E("S.prog.A.ex[4].id = 'crucifixo-inverso-no-peck-deck';");
  a.v('render');
  assert.strictEqual(a.vJ('ctx.focoV3').midia.video.yt, 'wjlX-5DTjBQ');
  a.fechar();
});

test('sugerir um vídeo melhor: fica no aparelho, fora do estado, e a tela diz que foi para a curadoria', async () => {
  const a = await naSerie(4);
  const antes = JSON.stringify(a.S());
  a.v('ctx.sugereFolha', { n: 'Elevação lateral na máquina' });
  await a.pintar();
  a.digitar('sug-link', 'https://youtu.be/abcdefghijk');
  a.digitar('sug-ini', '1:10');
  a.digitar('sug-fim', '1:40');
  await a.pintar();
  a.clicar('[data-a="midia-sugere-envia"]');
  await a.pintar();
  assert.match(a.texto('.v3-maviso'), /curadoria/);
  const guardada = JSON.parse(a.window.localStorage.getItem('lastro-sugestoes-midia-v1'));
  assert.strictEqual(guardada.length, 1);
  assert.strictEqual(guardada[0].inicio, 70);
  assert.strictEqual(guardada[0].fim, 100);
  assert.strictEqual(JSON.stringify(a.S()), antes, 'a sugestão não mexe no estado sincronizado');
  a.fechar();
});

test('trecho ruim não envia (fim antes do começo)', async () => {
  const a = await naSerie(4);
  a.v('ctx.sugereFolha', { n: 'Elevação lateral na máquina' });
  await a.pintar();
  a.digitar('sug-link', 'https://youtu.be/abcdefghijk');
  a.digitar('sug-ini', '1:40');
  a.digitar('sug-fim', '1:10');
  await a.pintar();
  assert.ok(a.doc.querySelector('[data-a="midia-sugere-envia"]').disabled);
  a.fechar();
});
