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
import { cacheFalso, guardadasEm, nuvemComBucket } from './dubles.js';

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
  assert.ok(a.texto('.pr-sem').includes('primeira vez'));
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
