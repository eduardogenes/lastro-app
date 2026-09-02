// O protocolo de fotos de acompanhamento, no app montado.
//
// O que os testes de domínio não alcançam é justamente o que dá errado aqui: o
// byte. A regra de qual pose vem depois é pura e já está coberta em
// `tests/dominio/protocolo.test.ts`; o que esta suíte cobra é o caminho
// completo — câmera, redução, Cache Storage, bucket, poda e volta.
//
// A poda é o motivo de esta suíte existir. Ela é a única parte do app que
// APAGA byte de foto por conta própria, e o erro que ela pode cometer não tem
// desfazer: apagar daqui o que ainda não subiu para lá. Quase todo teste abaixo
// existe para cercar essa uma decisão.
import { test } from 'vitest';
import assert from 'node:assert';
import { app } from './harness.js';
import { cacheFalso, cameraFalsa, guardadasEm, nuvemComBucket } from './dubles.js';

const DIA = 86400000;

/**
 * A data local no formato do protocolo, derivada de HOJE.
 *
 * Nunca uma data fixa no código: a suíte precisa dar o mesmo resultado em
 * qualquer dia do ano, e uma sessão semeada no futuro faria `referencia()`
 * devolver outra coisa.
 */
function iso(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}
const hoje = () => iso(Date.now());
const diasAtras = n => iso(Date.now() - n * DIA);

const guardadas = a => guardadasEm(a, 'lastro-corpo');

/** Dispara a captura da pose em foco, pelo mesmo caminho que o `input` usa. */
function tirar(a) {
  return a.E(`tiraFotoDoCorpo({ files: [new Blob(['x'], { type: 'image/jpeg' })], value: '' })`);
}

/** Põe bytes no cache do corpo sem passar pela câmera. */
function semear(a, d, pose) {
  return a.E(`(async () => {
    const c = await caches.open('lastro-corpo');
    await c.put('./corpo/${d}/${pose}.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  })()`);
}

/** Sessões prontas no estado, uma foto por sessão, na mesma pose. */
function comSessoes(a, datas, pose) {
  a.E(`S.protocolo.sessoes = ${JSON.stringify(datas)}.map(function (d, i) {
    return { d: d, t: 1, m: 1, fotos: { ${JSON.stringify(pose)}: { v: i + 1, ext: 'webp' } } };
  })`);
}

// ---------- a sessão ----------

test('a montagem vem antes da primeira foto e sai do caminho depois', async () => {
  // Distância, altura da lente e luz mudam a silhueta mais do que duas semanas
  // de treino. Mas são fixas por definição: perguntar de novo a cada sessão
  // seria o oposto de não perguntar o que já se sabe.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);

  a.clicar(a.$('.dd-fotos-b .ins-btn-primary'));
  assert.ok(a.$('.pr-setup'), 'a montagem abriu');
  assert.strictEqual(a.$('.pr-disparo'), null, 'e ainda não há o que disparar');

  a.clicar(a.$('.pr-comecar'));
  assert.strictEqual(a.$('.pr-setup'), null, 'a montagem saiu');
  assert.ok(a.$('.pr-disparo'), 'e a primeira pose está pronta para a foto');
  a.fechar();
});

test('quem já tem foto de hoje não vê a montagem de novo', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.E('render()');

  a.clicar(a.$('.dd-fotos-b .ins-btn-primary'));
  assert.strictEqual(a.$('.pr-setup'), null, 'a sessão continua de onde parou');
  assert.ok(a.$('.pr-disparo'));
  a.fechar();
});

test('a sessão nasce na primeira foto: referência no estado, bytes no cache', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');

  assert.deepStrictEqual(a.J('S.protocolo.sessoes'), [], 'antes da foto não há sessão');

  await tirar(a);
  await a.esperar(60);

  const sessoes = a.J('S.protocolo.sessoes');
  assert.strictEqual(sessoes.length, 1, 'a sessão nasceu sozinha, sem botão de salvar');
  assert.strictEqual(sessoes[0].d, hoje());
  assert.ok(sessoes[0].fotos['frente-relaxado'].v > 0, 'a referência ficou no estado');
  assert.strictEqual(sessoes[0].fotos['frente-relaxado'].ext, 'webp');

  assert.deepStrictEqual(guardadas(a), ['./corpo/' + hoje() + '/frente-relaxado.webp'],
    'e os bytes foram para o cache do corpo');
  assert.deepStrictEqual(guardadasEm(a, 'lastro-fotos'), [],
    'que não é o cache das fotos de aparelho');
  a.fechar();
});

test('o byte não entra no estado, que é reserializado a cada série', async () => {
  // O teto do Safari para este armazenamento é 5 MiB, e o estado inteiro é
  // regravado a cada série registrada. Nove fotos por sessão aqui dentro
  // matariam o app em duas semanas.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);

  const json = a.E('JSON.stringify(S.protocolo)');
  assert.ok(json.length < 300, 'a sessão inteira é pequena: ' + json.length + ' bytes');
  assert.ok(!/blob:|data:|base64/.test(json), 'e não carrega imagem nenhuma: ' + json);
  a.fechar();
});

test('a foto de corpo é gravada maior que a do aparelho', async () => {
  // A miniatura do aparelho é olhada a 350 px. Esta é olhada lado a lado com
  // outra de dois meses atrás, em tela cheia, e é sobre ela que se decide se o
  // ombro mudou — é o mesmo caminho de redução, com outro teto.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);

  const m = a.J('globalThis.__medida');
  assert.strictEqual(Math.max(m.l, m.a), 1440, 'o lado maior manda: ' + JSON.stringify(m));
  assert.strictEqual(m.a, 1080, 'e a proporção se mantém: 4000x3000 vira 1440x1080');
  a.fechar();
});

test('a sessão avança sozinha para a pose que falta', async () => {
  // São nove poses em sequência. Pedir um toque a mais entre duas é pedir um
  // toque a mais nove vezes.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  assert.strictEqual(a.E('view.protocolo.pose'), 'frente-relaxado');

  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.E('view.protocolo.pose'), 'frente-duplo-biceps',
    'passou para a segunda sem esperar toque');

  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.E('view.protocolo.pose'), 'frente-abdomen-coxa');
  assert.strictEqual(a.E('CTX.sessaoDeFotos().faltando'), 7);
  a.fechar();
});

test('a foto anterior da mesma pose aparece antes do disparo', async () => {
  // É a diferença entre esta tela e um botão de câmera. Enquadrar contra a
  // anterior evita o desvio; alinhar depois só o conserta, e mal.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');
  await semear(a, diasAtras(14), 'frente-relaxado');

  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.esperar(60);

  const ref = a.J('CTX.sessaoDeFotos().pose.ref');
  assert.ok(ref, 'a referência foi encontrada');
  assert.match(ref.url, /^blob:/, 'e os bytes dela chegaram à tela');
  assert.ok(a.$('.pr-fig img'), 'a imagem está desenhada');
  a.fechar();
});

test('na primeira vez a tela diz que não há referência, sem quadro quebrado', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');

  assert.strictEqual(a.E('CTX.sessaoDeFotos().pose.ref'), null);
  assert.strictEqual(a.$('.pr-fig img'), null, 'nenhuma <img> sem bytes');
  assert.ok(a.texto('.fa-vazio').includes('primeira vez'));
  a.fechar();
});

// ---------- apagar ----------

test('refazer uma pose deixa lápide, senão o outro aparelho traz a velha de volta', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);

  // volta para a primeira e tira de novo
  a.E(`CTX.vaiParaPose('frente-relaxado')`);
  await tirar(a);
  await a.esperar(60);

  assert.ok(a.J('S.apagados')['corpo:' + hoje() + ':frente-relaxado'],
    'a versão anterior tem lápide própria — a da sessão não a alcançaria');
  a.fechar();
});

test('apagar a única foto apaga a sessão junto', async () => {
  // A sessão nasce na primeira foto e não tem por que sobreviver à última.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.J('S.protocolo.sessoes').length, 1);

  a.E(`CTX.vaiParaPose('frente-relaxado')`);
  await a.E(`CTX.apagaFotoDoCorpo('frente-relaxado')`);
  await a.esperar(60);

  assert.deepStrictEqual(a.J('S.protocolo.sessoes'), []);
  assert.deepStrictEqual(guardadas(a), [], 'os bytes saíram do cache também');
  assert.ok(a.J('S.apagados')['corpo:' + hoje()], 'com lápide de sessão');
  a.fechar();
});

test('apagar uma de duas mantém a sessão viva', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);
  await tirar(a);
  await a.esperar(60);

  await a.E(`CTX.apagaFotoDoCorpo('frente-relaxado')`);
  await a.esperar(60);

  const sessoes = a.J('S.protocolo.sessoes');
  assert.strictEqual(sessoes.length, 1, 'a sessão continua');
  assert.deepStrictEqual(Object.keys(sessoes[0].fotos), ['frente-duplo-biceps']);
  a.fechar();
});

// ---------- a réplica no bucket ----------

test('a foto tirada aqui sobe para o bucket do corpo', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);

  await a.E('reconciliaCorpo()');
  await a.esperar(60);

  assert.deepStrictEqual(a.J('globalThis.__subiuCorpo'), [hoje() + '/frente-relaxado']);
  assert.ok(a.J('globalThis.__bucketCorpo')[hoje() + '/frente-relaxado.webp']);
  assert.strictEqual(a.E('sync.fotos["corpo:' + hoje() + ':frente-relaxado"]') > 0, true,
    'marcada como enviada, para a próxima sincronização não reenviar');
  a.fechar();
});

test('sem rede, a foto fica aqui e não é dada como enviada', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  a.E(`NUVEM.subirCorpo = async () => ({ ok: false, erro: 'rede', msg: 'sem conexão' })`);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);

  await a.E('reconciliaCorpo()');
  await a.esperar(60);

  assert.strictEqual(a.J('S.protocolo.sessoes').length, 1, 'a foto está aqui de qualquer forma');
  assert.strictEqual(a.E('sync.fotos["corpo:' + hoje() + ':frente-relaxado"]'), undefined,
    'a próxima sincronização tenta de novo');
  a.fechar();
});

// ---------- a poda, e a volta ----------

test('a poda deixa no aparelho só as sessões recentes', async () => {
  // São 35 MB no primeiro ano, num Cache Storage que o iOS despeja sob pressão
  // de disco. Aqui o cache é cache de verdade: a fonte é o bucket.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);

  const datas = [70, 56, 42, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');
  assert.strictEqual(guardadas(a).length, 5);

  await a.E('reconciliaCorpo()');
  await a.esperar(80);

  assert.deepStrictEqual(guardadas(a), datas.slice(1).map(d => './corpo/' + d + '/frente-relaxado.webp'),
    'as quatro recentes ficaram, a mais antiga saiu — e só ela');
  assert.strictEqual(Object.keys(a.J('globalThis.__bucketCorpo')).length, 5,
    'as cinco continuam no bucket, que é a fonte');
  a.fechar();
});

test('foto que ainda não subiu segura a poda do cache inteiro', async () => {
  // O erro mais caro que este caminho pode cometer é apagar daqui o byte que
  // ainda não está lá. A poda espera todo mundo confirmado, e uma foto que
  // falta segura o ciclo — que é exatamente o que se quer.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);

  const datas = [70, 56, 42, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  // a do meio não tem bytes aqui: nada a subir, e o bucket não a confirma
  for (const d of datas) if (d !== datas[2]) await semear(a, d, 'frente-relaxado');

  await a.E('reconciliaCorpo()');
  await a.esperar(80);

  assert.ok(guardadas(a).includes('./corpo/' + datas[0] + '/frente-relaxado.webp'),
    'a mais antiga continua aqui: ' + guardadas(a).join(', '));
  assert.strictEqual(guardadas(a).length, 4, 'nada foi podado neste ciclo');
  a.fechar();
});

test('abrir uma sessão podada traz os bytes de volta do bucket', async () => {
  // É o caminho de volta da poda. Sem ele, podar seria perder.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const antiga = diasAtras(70);
  nuvemComBucket(a, {}, { [antiga + '/frente-relaxado.webp']: 1 });
  comSessoes(a, [antiga, diasAtras(14)], 'frente-relaxado');

  assert.deepStrictEqual(guardadas(a), [], 'os bytes não estão neste aparelho');

  await a.E(`garanteBytesDoCorpo([${JSON.stringify(antiga)}])`);
  await a.esperar(80);

  assert.deepStrictEqual(guardadas(a), ['./corpo/' + antiga + '/frente-relaxado.webp'],
    'voltaram do bucket para o cache');
  a.E('CTX.abreComparar()');
  assert.match(a.J('CTX.comparacao()').de.url, /^blob:/,
    'e chegaram à tela como endereço de objeto');
  a.fechar();
});

test('referência sem bytes em lugar nenhum não quebra a tela', async () => {
  // Foto que o outro aparelho registrou e ainda não subiu: a referência existe,
  // o byte não. Nada de quadro quebrado — a tela avisa e segue.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');

  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.esperar(80);

  assert.strictEqual(a.J('CTX.sessaoDeFotos().pose.ref').url, null);
  assert.strictEqual(a.$('.pr-fig img'), null, 'sem <img> apontando para nada');
  a.fechar();
});

// ---------- o resumo em DADOS ----------

test('sem sessão nenhuma, o resumo convida e não oferece comparação', async () => {
  const a = await app({ aba: 'dados' });
  const f = a.J('CTX.protocoloFotos()');
  assert.strictEqual(f.tem, false);
  assert.strictEqual(f.nota, 'nenhuma sessão ainda');
  assert.strictEqual(f.dias, '–');
  assert.strictEqual(f.cta, 'nova sessão');
  assert.strictEqual(a.texto('.dd-fotos-b .ins-btn-primary'), 'nova sessão');
  assert.strictEqual(a.$('.dd-fotos-b .ins-btn-secondary'), null, 'nada a comparar ainda');
  a.fechar();
});

test('o atraso é informação, não cobrança', async () => {
  // Passar da cadência põe o número em âmbar e para por aí. Não há sequência,
  // não há medalha e não há tela de parabéns em lugar nenhum deste produto.
  const a = await app({ aba: 'dados' });
  comSessoes(a, [diasAtras(20)], 'frente-relaxado');
  a.E('render()');

  const f = a.J('CTX.protocoloFotos()');
  assert.strictEqual(f.dias, '20');
  assert.strictEqual(f.diasCor, 'ins-amber', 'passou de 14 dias');
  assert.strictEqual(f.cadencia, 'a cada 14 dias');
  assert.strictEqual(f.cta, 'nova sessão');

  const texto = a.texto('.dd-fotos');
  assert.ok(!/parab|sequ[êe]ncia|streak|dias seguidos/i.test(texto), texto);
  a.fechar();
});

test('sessão de hoje pela metade convida a continuar de onde parou', async () => {
  const a = await app({ aba: 'dados' });
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.E('render()');
  assert.strictEqual(a.J('CTX.protocoloFotos()').cta, 'continuar · 1 de 9');
  a.fechar();
});

test('comparar só aparece quando há duas sessões na mesma pose', async () => {
  const a = await app({ aba: 'dados' });
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');
  a.E('render()');
  assert.strictEqual(a.$('.dd-fotos-b .ins-btn-secondary'), null, 'uma sessão não compara');

  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');
  a.E('render()');
  assert.strictEqual(a.texto('.dd-fotos-b .ins-btn-secondary'), 'comparar');
  a.fechar();
});

// ---------- comparar ----------

test('o par padrão é a mais nova contra a MAIS ANTIGA', async () => {
  // Contra a anterior, duas semanas são quase só água e sono — e é assim que se
  // desiste de um plano que estava funcionando.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  const datas = [56, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');

  a.E('CTX.abreComparar()');
  assert.strictEqual(a.E('view.comparar.de'), datas[0]);
  assert.strictEqual(a.E('view.comparar.ate'), datas[2]);
  assert.ok(a.J('CTX.comparacao()').intervalo.startsWith('42 dias entre as duas'));
  a.fechar();
});

test('comparar abre numa pose que tem par, não num vazio', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  // só a segunda pose tem duas sessões
  a.E(`S.protocolo.sessoes = [
    { d: ${JSON.stringify(diasAtras(28))}, t: 1, m: 1, fotos: { 'frente-duplo-biceps': { v: 1, ext: 'webp' } } },
    { d: ${JSON.stringify(diasAtras(14))}, t: 2, m: 2, fotos: { 'frente-relaxado': { v: 2, ext: 'webp' }, 'frente-duplo-biceps': { v: 3, ext: 'webp' } } }
  ]`);

  a.E('CTX.abreComparar()');
  assert.strictEqual(a.E('view.comparar.pose'), 'frente-duplo-biceps');
  assert.ok(a.J('CTX.comparacao()').par, 'abriu com par montado');
  a.fechar();
});

test('o peso ao lado da foto é a média da semana, e vem do registro corporal', async () => {
  // A sessão de fotos não pede número nenhum: o protocolo manda fotografar de
  // manhã em jejum, que é o mesmo momento da pesagem.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  a.E(`S.body.peso = [
    { t: Date.now() - 28 * ${DIA}, v: 90 },
    { t: Date.now() - 27 * ${DIA}, v: 92 },
    { t: Date.now() - 14 * ${DIA}, v: 88 }
  ]`);

  a.E('CTX.abreComparar()');
  const c = a.J('CTX.comparacao()');
  assert.strictEqual(c.de.peso, '91,0 kg', 'média das duas pesagens daquela semana');
  assert.strictEqual(c.ate.peso, '88,0 kg');
  a.fechar();
});

test('sem pesagem naquela semana, o lugar do número fica vazio em vez de zero', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');

  a.E('CTX.abreComparar()');
  const c = a.J('CTX.comparacao()');
  assert.strictEqual(c.de.peso, 'peso –');
  assert.strictEqual(c.de.cintura, 'cintura –');
  a.fechar();
});

test('a nota da sessão reaparece na comparação, que é onde ela serve', async () => {
  // É o que explica, três meses depois, o mês que parece fora da curva.
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28);
  comSessoes(a, [velha, diasAtras(14)], 'frente-relaxado');
  a.E(`S.protocolo.sessoes[0].obs = 'voltando de gripe'`);

  a.E('CTX.abreComparar()');
  assert.ok(a.J('CTX.comparacao()').notas.some(n => n.includes('voltando de gripe')));
  a.fechar();
});

// ---------- o estado ----------

test('backup antigo, sem protocolo nenhum, entra sem quebrar', async () => {
  // Campo novo entra como opcional e recebe padrão em normalizaEstado(), que
  // roda no boot E na importação — não há migração porque não há dado a
  // reformatar.
  const a = await app({ estado: { logs: {}, done: [] }, aba: 'dados' });
  assert.deepStrictEqual(a.J('S.protocolo'), { poses: null, sessoes: [] });
  assert.ok(a.$('.dd-fotos'), 'e a seção desenha');
  a.fechar();
});

test('ordem de poses vazia cai na do código, sem sumir com a tela', async () => {
  const a = await app({ estado: { logs: {}, done: [], protocolo: { poses: [], sessoes: [] } }, aba: 'dados' });
  assert.strictEqual(a.E('S.protocolo.poses'), null, 'normalizada para "a do código"');
  assert.strictEqual(a.J('CTX.protocoloFotos()').pontos.length, 9);
  a.fechar();
});

// ---------- ajustar o enquadramento ----------
// Não destrutivo: o que se grava é o ajuste, e os bytes ficam como saíram da
// câmera. É o que permite reeditar sem acumular perda e desfazer sempre.

test('ajustar grava o recorte no estado e não toca nos bytes', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await tirar(a);
  await a.esperar(60);
  const antes = guardadas(a);

  a.E(`CTX.abreAjuste(${JSON.stringify(hoje())}, 'frente-relaxado')`);
  assert.ok(a.$('.aj-quadro'), 'a tela de ajuste abriu');
  a.E('CTX.setGiroDoAjuste(2)');
  await a.E('CTX.salvaAjuste()');
  await a.esperar(60);

  const ref = a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"]');
  assert.ok(ref.enq, 'o ajuste ficou na referência');
  assert.strictEqual(ref.enq.r, 2);
  assert.ok(ref.enq.m > 0, 'com carimbo, que é o que a fusão compara');
  assert.deepStrictEqual(guardadas(a), antes, 'os bytes são exatamente os mesmos');
  a.fechar();
});

test('girar sobe o zoom sozinho, para não abrir borda vazia', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.E(`CTX.abreAjuste(${JSON.stringify(hoje())}, 'frente-relaxado')`);
  assert.strictEqual(a.J('CTX.ajusteEmEdicao()').enq.z, 1);

  a.E('CTX.setGiroDoAjuste(6)');
  const enq = a.J('CTX.ajusteEmEdicao()').enq;
  assert.ok(enq.z > 1.12, 'a 6° o mínimo é ~1,13: ' + enq.z);
  a.fechar();
});

test('o ajuste que não faz nada sai do estado em vez de virar zeros', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(hoje())}, 'frente-relaxado')`);
  a.E('CTX.setGiroDoAjuste(3)');
  await a.E('CTX.salvaAjuste()');
  await a.esperar(60);
  assert.ok(a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"]').enq);

  a.E(`CTX.abreAjuste(${JSON.stringify(hoje())}, 'frente-relaxado')`);
  a.E('CTX.zeraAjuste()');
  await a.E('CTX.salvaAjuste()');
  await a.esperar(60);
  assert.strictEqual(a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"]').enq, undefined,
    'voltou a ser a foto como saiu, sem objeto de zeros no estado');
  a.fechar();
});

test('sair sem salvar descarta: o original nunca foi tocado', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(hoje())}, 'frente-relaxado')`);
  a.E('CTX.setGiroDoAjuste(5)');
  a.E('CTX.fechaAjuste()');
  assert.strictEqual(a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"]').enq, undefined);
  assert.strictEqual(a.E('view.ajuste'), null);
  a.fechar();
});

test('o mesmo recorte é aplicado na captura e na comparação', async () => {
  // duas contas do mesmo ajuste divergiriam, e a divergência apareceria como
  // uma diferença no corpo que não existe
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(velha)}, 'frente-relaxado')`);
  a.E('CTX.setGiroDoAjuste(3)');
  await a.E('CTX.salvaAjuste()');
  await a.esperar(60);

  a.E('CTX.abreComparar()');
  await a.esperar(60);
  assert.strictEqual(a.J('CTX.comparacao()').de.enq.r, 3, 'a comparação leva o ajuste');

  a.E('CTX.fechaComparar()');
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.esperar(60);
  const ref = a.J('CTX.sessaoDeFotos().pose.ref');
  assert.strictEqual(ref.enq, null, 'a referência aqui é a de 14 dias, que não foi ajustada');

  // e a de 28 dias, quando é ela a referência, chega ajustada
  const daVelha = a.J(`(function () {
    const s = S.protocolo.sessoes.filter(function (x) { return x.d === ${JSON.stringify(velha)}; })[0];
    return s.fotos['frente-relaxado'].enq;
  })()`);
  assert.strictEqual(daVelha.r, 3);
  a.fechar();
});

test('a foto sobreposta pode ser trocada para qualquer outra data', async () => {
  // o padrão é a vizinha, mas quando uma sessão antiga tem a geometria boa é
  // contra ELA que se quer alinhar as seguintes — e o app não sabe qual é
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const datas = [56, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(datas[2])}, 'frente-relaxado')`);
  await a.esperar(60);
  assert.strictEqual(a.E('view.ajuste.fantasmaD'), datas[1], 'abre na vizinha');

  // as opções são as OUTRAS sessões naquela pose, nunca a própria
  assert.deepStrictEqual(a.J('CTX.ajusteEmEdicao().datas').map(o => o.d), [datas[0], datas[1]]);
  assert.strictEqual(a.$$('.aj-fantasma option').length, 2);

  a.E(`CTX.setDataDoFantasma(${JSON.stringify(datas[0])})`);
  await a.esperar(60);
  const d = a.J('CTX.ajusteEmEdicao()');
  assert.strictEqual(d.fantasmaD, datas[0]);
  assert.ok(d.refUrl, 'e os bytes da escolhida chegaram');
  assert.ok(d.refTxt, 'com a data escrita ao lado');
  a.fechar();
});

test('a sessão mais antiga alinha contra a SEGUINTE, e não fica sem fantasma', async () => {
  // ela é a que ancora a série: deixá-la sem nada contra o que alinhar seria
  // deixar justamente a mais importante de fora
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const datas = [28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(datas[0])}, 'frente-relaxado')`);
  await a.esperar(60);
  assert.strictEqual(a.E('view.ajuste.fantasmaD'), datas[1]);
  assert.ok(a.J('CTX.ajusteEmEdicao()').refUrl);
  a.fechar();
});

test('pose que só existe numa sessão não oferece contra o que alinhar', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const so = diasAtras(14);
  comSessoes(a, [so], 'frente-relaxado');
  await semear(a, so, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(so)}, 'frente-relaxado')`);
  await a.esperar(60);
  assert.deepStrictEqual(a.J('CTX.ajusteEmEdicao()').datas, []);
  assert.strictEqual(a.$('.aj-fantasma'), null, 'sem seletor quando não há escolha');
  a.fechar();
});

test('a tela de ajuste abre com o fantasma da sessão anterior', async () => {
  // alinhar contra a foto anterior é o motivo desta tela existir
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(nova)}, 'frente-relaxado')`);
  await a.esperar(60);
  const d = a.J('CTX.ajusteEmEdicao()');
  assert.strictEqual(d.fantasma, true, 'já vem ligado');
  assert.ok(d.refUrl, 'e a foto anterior está carregada');
  assert.strictEqual(a.$$('.aj-quadro .fa').length, 2, 'duas camadas no quadro');
  a.fechar();
});

test('na primeira sessão não há fantasma, e a tela não quebra', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  const so = diasAtras(14);
  comSessoes(a, [so], 'frente-relaxado');
  await semear(a, so, 'frente-relaxado');

  a.E(`CTX.abreAjuste(${JSON.stringify(so)}, 'frente-relaxado')`);
  await a.esperar(60);
  assert.strictEqual(a.J('CTX.ajusteEmEdicao()').refUrl, null);
  assert.strictEqual(a.$$('.aj-quadro .fa').length, 1, 'uma camada só');
  a.fechar();
});

test('ajustar não é oferecido onde não há foto', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  assert.strictEqual(a.$('.pr-sobre'), null, 'sem foto, nem ajustar nem apagar');

  await tirar(a);
  await a.esperar(60);
  a.E(`CTX.vaiParaPose('frente-relaxado')`);
  assert.ok(a.$('.pr-sobre'), 'com foto, os dois aparecem');
  assert.deepStrictEqual(
    a.$$('.pr-sobre button').map(b => b.textContent.trim()), ['ajustar', 'apagar']);
  a.fechar();
});

test('ajuste guardado sobrevive à ida e volta pelo estado', async () => {
  const a = await app({ estado: {
    logs: {}, done: [],
    protocolo: { poses: null, sessoes: [{
      d: '2026-08-24', t: 1, m: 1,
      fotos: { 'frente-relaxado': { v: 1, ext: 'webp', enq: { r: 2.5, z: 1.3, cx: 0.4, cy: 0.6, m: 9 } } }
    }] }
  }, aba: 'dados' });
  const enq = a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"].enq');
  assert.deepStrictEqual(enq, { r: 2.5, z: 1.3, cx: 0.4, cy: 0.6, m: 9 });
  a.fechar();
});

// ---------- a câmera de dentro do app ----------
// Alinhar ANTES do disparo: nenhum recorte depois devolve o pé que saiu do
// quadro. O que estes testes cercam é o ciclo de vida — a câmera não pode
// ficar ligada depois que a tela some.

test('a tela da pose oferece os dois caminhos de captura', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  a.E('render()');

  const rotulos = a.$$('.pr-disparo').map(x => x.textContent.trim());
  assert.deepStrictEqual(rotulos, ['tirar com sobreposição', 'usar a câmera do sistema']);
  a.fechar();
});

test('sem getUserMedia, a câmera do sistema volta a ser a principal', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  a.E('delete navigator.mediaDevices');
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  a.E('render()');

  assert.strictEqual(a.J('CTX.sessaoDeFotos().temCamera'), false);
  const b = a.$$('.pr-disparo');
  assert.strictEqual(b.length, 1, 'um caminho só, e não um botão que não abre');
  assert.strictEqual(b[0].textContent.trim(), 'tirar a foto');
  a.fechar();
});

test('abrir a câmera pede a traseira, e em retrato', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  const pedido = a.J('globalThis.__gumPedidos[0]');
  assert.strictEqual(pedido.audio, false);
  assert.strictEqual(pedido.video.facingMode.ideal, 'environment');
  // ideal, nunca exact: exigência faria o aparelho recusar a câmera inteira
  assert.ok(pedido.video.width.ideal && pedido.video.height.ideal);
  assert.ok(pedido.video.height.ideal > pedido.video.width.ideal, 'retrato');
  assert.strictEqual(a.J('CTX.cameraViva()').pronta, true);
  assert.ok(a.$('.cam-video'), 'o quadro vivo está na tela');
  a.fechar();
});

test('sair da tela DESLIGA a câmera', async () => {
  // faixa viva mantém o indicador do iOS aceso e a câmera consumindo
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 1);

  a.E('CTX.fechaCamera()');
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 0, 'nenhuma faixa sobrou viva');
  assert.strictEqual(a.E('view.camera'), null);
  a.fechar();
});

test('permissão negada não vira tela quebrada, vira o que fazer a respeito', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a, { erro: 'NotAllowedError' });
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  const erro = a.J('CTX.cameraViva()').erro;
  assert.ok(/negado/.test(erro), erro);
  assert.ok(/ajustes/.test(erro), 'e diz onde resolver: ' + erro);
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 0);
  a.fechar();
});

test('disparo sem temporizador guarda a foto e avança a pose', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  a.E('CTX.setTimerDaCamera(0)');
  a.E('CTX.disparaCamera()');
  await a.esperar(120);

  const s = a.J('S.protocolo.sessoes');
  assert.strictEqual(s.length, 1);
  assert.ok(s[0].fotos['frente-relaxado'], 'a foto foi gravada');
  assert.deepStrictEqual(guardadas(a), ['./corpo/' + hoje() + '/frente-relaxado.webp']);
  assert.strictEqual(a.E('view.protocolo.pose'), 'frente-duplo-biceps', 'avançou sem sair');
  assert.ok(a.E('view.camera'), 'e a câmera continua aberta: são nove poses');
  a.fechar();
});

test('a contagem pode ser cancelada antes de disparar', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  a.E('CTX.setTimerDaCamera(10)');
  a.E('CTX.disparaCamera()');
  assert.strictEqual(a.J('CTX.cameraViva()').contagem, 10);
  assert.ok(a.$('.cam-contagem'), 'a contagem cobre o quadro');

  a.E('CTX.cancelaDisparo()');
  await a.esperar(120);
  assert.strictEqual(a.J('CTX.cameraViva()').contagem, null);
  assert.deepStrictEqual(a.J('S.protocolo.sessoes'), [], 'nada foi gravado');
  a.fechar();
});

test('o temporizador padrão dá tempo de andar os três metros', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);
  assert.strictEqual(a.J('CTX.cameraViva()').timer, 10);
  a.fechar();
});

test('sem quadro ainda, a captura recusa em vez de gravar preto', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a, { semQuadro: true });
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  a.E('CTX.setTimerDaCamera(0)');
  a.E('CTX.disparaCamera()');
  await a.esperar(120);
  assert.deepStrictEqual(a.J('S.protocolo.sessoes'), [], 'nada gravado');
  assert.ok(/não está pronta/.test(a.toast()), a.toast());
  a.fechar();
});

test('a câmera abre com a sobreposta da sessão vizinha', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(80);

  const c = a.J('CTX.cameraViva()');
  assert.strictEqual(c.fantasmaD, nova, 'a mais recente antes de hoje');
  assert.ok(c.refUrl, 'com os bytes já carregados');
  assert.deepStrictEqual(c.datas.map(o => o.d), [velha, nova]);
  assert.ok(a.$('.cam-ghost'), 'desenhada por cima do quadro vivo');
  a.fechar();
});

test('depois do disparo a sobreposta acompanha a nova pose', async () => {
  // são nove poses seguidas: a referência tem que trocar sozinha, senão a
  // segunda foto seria enquadrada contra a pose errada
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  const velha = diasAtras(14);
  a.E(`S.protocolo.sessoes = [{ d: ${JSON.stringify(velha)}, t: 1, m: 1, fotos: {
    'frente-relaxado': { v: 1, ext: 'webp' },
    'frente-duplo-biceps': { v: 2, ext: 'webp' }
  } }]`);

  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);
  assert.strictEqual(a.J('CTX.cameraViva()').pose, 'Frente relaxado');

  a.E('CTX.setTimerDaCamera(0)');
  a.E('CTX.disparaCamera()');
  await a.esperar(150);

  const c = a.J('CTX.cameraViva()');
  assert.strictEqual(c.pose, 'Frente duplo bíceps', 'a tela seguiu a pose');
  assert.strictEqual(c.fantasmaD, velha, 'e a sobreposta é a mesma sessão, na pose nova');
  a.fechar();
});

test('a foto da câmera interna entra pelo mesmo caminho da do sistema', async () => {
  // reduzida no mesmo teto, guardada no mesmo cache, com referência igual
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('CTX.abreProtocolo()');
  a.E('CTX.comecaSessaoDeFotos()');
  await a.E('CTX.abreCamera()');
  await a.esperar(60);
  a.E('CTX.setTimerDaCamera(0)');
  a.E('CTX.disparaCamera()');
  await a.esperar(150);

  const ref = a.J('S.protocolo.sessoes[0].fotos["frente-relaxado"]');
  assert.strictEqual(ref.ext, 'webp');
  assert.ok(ref.v > 0);
  const m = a.J('globalThis.__medida');
  assert.strictEqual(Math.max(m.l, m.a), 1440, 'mesmo teto do corpo: ' + JSON.stringify(m));
  a.fechar();
});

test('refazer pela câmera deixa lápide, como pelo sistema', async () => {
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  cameraFalsa(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.E('CTX.abreProtocolo()');
  a.E(`view.protocolo.montagem = false; view.protocolo.pose = 'frente-relaxado'`);
  await a.E('CTX.abreCamera()');
  await a.esperar(60);

  a.E('CTX.setTimerDaCamera(0)');
  a.E('CTX.disparaCamera()');
  await a.esperar(150);
  assert.ok(a.J('S.apagados')['corpo:' + hoje() + ':frente-relaxado'],
    'a versão anterior tem lápide');
  a.fechar();
});

test('apagar a foto pergunta antes, e recusar cancela', async () => {
  // é a única ação destrutiva que passava direto; e a lápide viaja na
  // sincronização, então não apaga só deste aparelho
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.E('CTX.abreProtocolo()');
  a.E(`view.protocolo.montagem = false; view.protocolo.pose = 'frente-relaxado'`);

  a.recusar();
  await a.E(`CTX.apagaFotoDoCorpo('frente-relaxado')`);
  await a.esperar(60);
  assert.strictEqual(a.J('S.protocolo.sessoes').length, 1, 'recusou: a foto ficou');
  const perguntas = a.perguntas().join(' ');
  assert.ok(/Apagar a foto/.test(perguntas), perguntas);
  assert.ok(/outros na próxima sincronização/.test(perguntas), 'o aviso é honesto');

  a.aceitar();
  await a.E(`CTX.apagaFotoDoCorpo('frente-relaxado')`);
  await a.esperar(60);
  assert.deepStrictEqual(a.J('S.protocolo.sessoes'), [], 'aceitou: apagou');
  a.fechar();
});

test('sair de uma tela cheia devolve a posição de leitura', async () => {
  // as folhas já faziam isso; as telas cheias jogavam para o topo e você
  // perdia a linha de onde veio
  const a = await app({ aba: 'dados' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');
  a.E('render()');

  a.E('window.scrollY = 640');          // jsdom não rola sozinho
  a.E('CTX.abreComparar()');
  assert.strictEqual(a.E("scrollDoDestino['comparar']"), 640, 'guardou antes de trocar a tela');

  a.E('CTX.fechaComparar()');
  assert.strictEqual(a.E("scrollDoDestino['comparar']"), undefined, 'e devolveu, sem deixar lixo');
  a.fechar();
});
