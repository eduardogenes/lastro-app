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

/**
 * Domingo 00:00 da semana em que caiu o dia de `n` dias atrás.
 *
 * Pesagem semeada por "dias atrás" não garante SEMANA: `-28` e `-27` caem em
 * semanas diferentes quando a suíte roda num sábado, e a média da semana da
 * foto passava a ter uma pesagem só. Quem afirma média escolhe a semana.
 */
function semanaDe(n) {
  const d = new Date(Date.now() - n * DIA);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

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
  const a = await app({ aba: 'corpo' });
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
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('render');

  a.clicar(a.$('.dd-fotos-b .ins-btn-primary'));
  assert.strictEqual(a.$('.pr-setup'), null, 'a sessão continua de onde parou');
  assert.ok(a.$('.pr-disparo'));
  a.fechar();
});

test('a sessão nasce na primeira foto: referência no estado, bytes no cache', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');

  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'antes da foto não há sessão');

  await tirar(a);
  await a.esperar(60);

  const sessoes = a.S().protocolo.sessoes;
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
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);

  const json = JSON.stringify(a.S().protocolo);
  assert.ok(json.length < 300, 'a sessão inteira é pequena: ' + json.length + ' bytes');
  assert.ok(!/blob:|data:|base64/.test(json), 'e não carrega imagem nenhuma: ' + json);
  a.fechar();
});

test('a foto de corpo é gravada maior que a do aparelho', async () => {
  // A miniatura do aparelho é olhada a 350 px. Esta é olhada lado a lado com
  // outra de dois meses atrás, em tela cheia, e é sobre ela que se decide se o
  // ombro mudou — é o mesmo caminho de redução, com outro teto.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
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
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  assert.strictEqual(a.vista().protocolo.pose, 'frente-relaxado');

  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.vista().protocolo.pose, 'frente-duplo-biceps',
    'passou para a segunda sem esperar toque');

  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.vista().protocolo.pose, 'frente-abdomen-coxa');
  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').faltando, 7);
  a.fechar();
});

test('a foto anterior da mesma pose aparece antes do disparo', async () => {
  // É a diferença entre esta tela e um botão de câmera. Enquadrar contra a
  // anterior evita o desvio; alinhar depois só o conserta, e mal.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');
  await semear(a, diasAtras(14), 'frente-relaxado');

  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(60);

  const ref = a.vJ('ctx.sessaoDeFotos').pose.ref;
  assert.ok(ref, 'a referência foi encontrada');
  assert.match(ref.url, /^blob:/, 'e os bytes dela chegaram à tela');
  assert.ok(a.$('.pr-fig img'), 'a imagem está desenhada');
  a.fechar();
});

test('na primeira vez a tela diz que não há referência, sem quadro quebrado', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');

  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').pose.ref, null);
  assert.strictEqual(a.$('.pr-fig img'), null, 'nenhuma <img> sem bytes');
  assert.ok(a.texto('.fa-vazio').includes('primeira vez'));
  a.fechar();
});

// ---------- apagar ----------

test('refazer uma pose deixa lápide, senão o outro aparelho traz a velha de volta', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);

  // volta para a primeira e tira de novo
  a.v('ctx.vaiParaPose', 'frente-relaxado');
  await tirar(a);
  await a.esperar(60);

  assert.ok(a.S().apagados['corpo:' + hoje() + ':frente-relaxado'],
    'a versão anterior tem lápide própria — a da sessão não a alcançaria');
  a.fechar();
});

test('apagar a única foto apaga a sessão junto', async () => {
  // A sessão nasce na primeira foto e não tem por que sobreviver à última.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);
  assert.strictEqual(a.S().protocolo.sessoes.length, 1);

  a.v('ctx.vaiParaPose', 'frente-relaxado');
  await a.v('ctx.apagaFotoDoCorpo', 'frente-relaxado');
  await a.esperar(60);

  assert.deepStrictEqual(a.S().protocolo.sessoes, []);
  assert.deepStrictEqual(guardadas(a), [], 'os bytes saíram do cache também');
  assert.ok(a.S().apagados['corpo:' + hoje()], 'com lápide de sessão');
  a.fechar();
});

test('apagar uma de duas mantém a sessão viva', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);
  await tirar(a);
  await a.esperar(60);

  await a.v('ctx.apagaFotoDoCorpo', 'frente-relaxado');
  await a.esperar(60);

  const sessoes = a.S().protocolo.sessoes;
  assert.strictEqual(sessoes.length, 1, 'a sessão continua');
  assert.deepStrictEqual(Object.keys(sessoes[0].fotos), ['frente-duplo-biceps']);
  a.fechar();
});

// ---------- a réplica no bucket ----------

test('sem conta, as fotos do corpo dizem que existem só neste aparelho', async () => {
  // a D, comparar, estado 10: a cópia em JSON leva as referências, não as fotos
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  assert.strictEqual(a.vJ('ctx.protocoloFotos').soAqui, null, 'sem foto nenhuma, nada a dizer');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);
  a.v('ctx.fechaProtocolo');
  await a.esperar();
  const s = a.vJ('ctx.protocoloFotos').soAqui;
  assert.strictEqual(s.conta, false);
  assert.strictEqual(s.t, 'A foto do corpo existe só neste aparelho');
  assert.ok(a.$('[data-a="fotos-conta"]'), 'a saída é entrar na conta');
  a.fechar();
});

test('com conta, o que não subiu é contado, sobe num toque, e o aviso sai', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);
  a.v('ctx.fechaProtocolo');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.protocoloFotos').soAqui.t, '1 foto ainda não subiu para a cópia remota');
  a.clicar('[data-a="fotos-subir"]');
  await a.esperar(150);
  assert.deepStrictEqual(a.J('globalThis.__subiuCorpo'), [hoje() + '/frente-relaxado']);
  assert.strictEqual(a.vJ('ctx.protocoloFotos').soAqui, null, 'subiu tudo: nada só aqui');
  assert.strictEqual(a.$('[data-a="fotos-subir"]'), null);
  a.fechar();
});

test('a foto tirada aqui sobe para o bucket do corpo', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);

  await a.v('reconciliaCorpo');
  await a.esperar(60);

  assert.deepStrictEqual(a.J('globalThis.__subiuCorpo'), [hoje() + '/frente-relaxado']);
  assert.ok(a.J('globalThis.__bucketCorpo')[hoje() + '/frente-relaxado.webp']);
  assert.strictEqual(a.dado('sync').fotos['corpo:' + hoje() + ':frente-relaxado'] > 0, true,
    'marcada como enviada, para a próxima sincronização não reenviar');
  a.fechar();
});

test('sem rede, a foto fica aqui e não é dada como enviada', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  a.E(`NUVEM.subirCorpo = async () => ({ ok: false, erro: 'rede', msg: 'sem conexão' })`);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);

  await a.v('reconciliaCorpo');
  await a.esperar(60);

  assert.strictEqual(a.S().protocolo.sessoes.length, 1, 'a foto está aqui de qualquer forma');
  assert.strictEqual(a.dado('sync').fotos['corpo:' + hoje() + ':frente-relaxado'], undefined,
    'a próxima sincronização tenta de novo');
  a.fechar();
});

// ---------- a poda, e a volta ----------

test('a poda deixa no aparelho só as sessões recentes', async () => {
  // São 35 MB no primeiro ano, num Cache Storage que o iOS despeja sob pressão
  // de disco. Aqui o cache é cache de verdade: a fonte é o bucket.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);

  const datas = [70, 56, 42, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');
  assert.strictEqual(guardadas(a).length, 5);

  await a.v('reconciliaCorpo');
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
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);

  const datas = [70, 56, 42, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  // a do meio não tem bytes aqui: nada a subir, e o bucket não a confirma
  for (const d of datas) if (d !== datas[2]) await semear(a, d, 'frente-relaxado');

  await a.v('reconciliaCorpo');
  await a.esperar(80);

  assert.ok(guardadas(a).includes('./corpo/' + datas[0] + '/frente-relaxado.webp'),
    'a mais antiga continua aqui: ' + guardadas(a).join(', '));
  assert.strictEqual(guardadas(a).length, 4, 'nada foi podado neste ciclo');
  a.fechar();
});

test('apagar o histórico poda os bytes de corpo, e não os do aparelho', async () => {
  // `reconciliaCorpo` NÃO alcança a poda depois do apagamento: ela termina em
  // `if (recentes.length === sessoes.length) return;`, e com as sessões
  // apagadas as duas contagens são zero. Sem a poda dentro do próprio gesto, o
  // cache fica com todas as fotos de corpo para sempre, sem nada no estado que
  // as referencie — o único índice delas era `S.protocolo.sessoes`.
  //
  // A outra direção, no mesmo caso: as fotos dos APARELHOS sobrevivem ao
  // apagamento por decisão do dono, então os bytes delas NÃO podem ser podados.
  // Um só `caches.delete` no gesto apagaria as duas.
  //
  // COBRE O MODELO, NÃO A FIAÇÃO: entra por `ctx.apagaTudo`, e não diz que a
  // tela tem botão ligado nele.
  const datas = [70, 56].map(diasAtras);
  const a = await app({
    aba: 'corpo',
    estado: {
      fotos: { A0: { v: 1, ext: 'webp' } },
      protocolo: { poses: null, sessoes: datas.map(function (d, i) {
        return { d: d, t: 1, m: 1, fotos: { 'frente-relaxado': { v: i + 1, ext: 'webp' } } };
      }) }
    }
  });
  cacheFalso(a);
  for (const d of datas) await semear(a, d, 'frente-relaxado');
  await a.E(`(async () => {
    const c = await caches.open('lastro-fotos');
    await c.put('./foto/A0.webp', new Response(new Blob(['x'], { type: 'image/webp' })));
  })()`);
  assert.strictEqual(guardadas(a).length, 2, 'os bytes das duas sessões estão no cache');
  assert.strictEqual(guardadasEm(a, 'lastro-fotos').length, 1, 'e o do aparelho também');

  await a.v('ctx.apagaTudo');
  await a.esperar(80);

  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'as sessões saíram do estado');
  assert.deepStrictEqual(guardadas(a), [],
    'e os bytes de corpo saíram do cache junto, em vez de ficarem órfãos');
  assert.deepStrictEqual(guardadasEm(a, 'lastro-fotos'), ['./foto/A0.webp'],
    'o byte da foto do APARELHO fica: a referência dele sobreviveu ao gesto');
  a.fechar();
});

test('abrir uma sessão podada traz os bytes de volta do bucket', async () => {
  // É o caminho de volta da poda. Sem ele, podar seria perder.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const antiga = diasAtras(70);
  nuvemComBucket(a, {}, { [antiga + '/frente-relaxado.webp']: 1 });
  comSessoes(a, [antiga, diasAtras(14)], 'frente-relaxado');

  assert.deepStrictEqual(guardadas(a), [], 'os bytes não estão neste aparelho');

  await a.v('garanteBytesDoCorpo', [antiga]);
  await a.esperar(80);

  assert.deepStrictEqual(guardadas(a), ['./corpo/' + antiga + '/frente-relaxado.webp'],
    'voltaram do bucket para o cache');
  a.v('ctx.abreComparar');
  assert.match(a.vJ('ctx.comparacao').de.url, /^blob:/,
    'e chegaram à tela como endereço de objeto');
  a.fechar();
});

test('referência sem bytes em lugar nenhum não quebra a tela', async () => {
  // Foto que o outro aparelho registrou e ainda não subiu: a referência existe,
  // o byte não. Nada de quadro quebrado — a tela avisa e segue.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');

  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(80);

  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').pose.ref.url, null);
  assert.strictEqual(a.$('.pr-fig img'), null, 'sem <img> apontando para nada');
  // E o quadro diz o que houve. Antes ficava escrito "buscando a foto…" para
  // sempre: a tela afirmando que ainda tenta, quando já tinha desistido.
  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').pose.ref.aviso, 'a nuvem não devolveu a foto');
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('a foto que a nuvem não devolveu diz isso, e tentar de novo traz', async () => {
  // O quarto estado da tela que faz E/S. O bucket responde sem os bytes — foto
  // que o outro aparelho ainda não subiu, ou rede caindo no meio — e a
  // recuperação mora no quadro que falhou.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const antes = diasAtras(14);
  nuvemComBucket(a, {}, {});
  comSessoes(a, [diasAtras(28), antes], 'frente-relaxado');

  a.v('ctx.abreComparar');
  await a.esperar(80);

  const c = () => a.vJ('ctx.comparacao');
  assert.strictEqual(c().ate.aviso, 'a nuvem não devolveu a foto');
  assert.strictEqual(c().ate.retomar, true, 'e há o que tentar');
  // Uma porta por quadro: as duas datas falharam, e cada uma tenta a sua.
  assert.strictEqual(a.$$('.fa-retomar').length, 2);

  // o byte aparece no bucket e ele toca "tentar de novo" no lado de depois
  a.E(`globalThis.__bucketCorpo[${JSON.stringify(antes + '/frente-relaxado.webp')}] = 1`);
  a.clicar(a.$$('.fa-retomar')[1]);
  await a.esperar(80);

  assert.match(c().ate.url, /^blob:/, 'a foto chegou');
  assert.strictEqual(c().ate.retomar, false, 'e a falha não ficou grudada');
  a.fechar();
});

test('sem conta na nuvem a foto do outro aparelho não oferece tentar de novo', async () => {
  // Tentar de novo daria exatamente na mesma: a porta é entrar na conta, e
  // oferecer um botão que não resolve é pior que não oferecer nenhum.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');

  a.v('ctx.abreComparar');
  await a.esperar(80);

  const c = a.vJ('ctx.comparacao');
  assert.strictEqual(c.ate.aviso, 'a foto está na nuvem, e este aparelho não entrou na conta');
  assert.strictEqual(c.ate.retomar, false);
  assert.strictEqual(a.$('.fa-retomar'), null);
  a.fechar();
});

// ---------- o resumo em DADOS ----------

test('sem sessão nenhuma, o resumo convida e não oferece comparação', async () => {
  const a = await app({ aba: 'corpo' });
  const f = a.vJ('ctx.protocoloFotos');
  assert.strictEqual(f.tem, false);
  assert.strictEqual(f.nota, 'nenhuma sessão ainda');
  assert.strictEqual(f.dias, '–');
  assert.strictEqual(f.cta, 'Nova sessão');
  assert.strictEqual(a.texto('.dd-fotos-b .ins-btn-primary'), 'Nova sessão');
  assert.strictEqual(a.$('.dd-fotos-b .ins-btn-secondary'), null, 'nada a comparar ainda');
  a.fechar();
});

test('o atraso é informação, não cobrança', async () => {
  // Passar da cadência põe o número em âmbar e para por aí. Não há sequência,
  // não há medalha e não há tela de parabéns em lugar nenhum deste produto.
  const a = await app({ aba: 'corpo' });
  comSessoes(a, [diasAtras(20)], 'frente-relaxado');
  a.v('render');

  const f = a.vJ('ctx.protocoloFotos');
  assert.strictEqual(f.dias, '20');
  assert.strictEqual(f.diasCor, 'ins-amber', 'passou de 14 dias');
  assert.strictEqual(f.cadencia, 'a cada 14 dias');
  assert.strictEqual(f.cta, 'Nova sessão');

  const texto = a.texto('.dd-fotos');
  assert.ok(!/parab|sequ[êe]ncia|streak|dias seguidos/i.test(texto), texto);
  a.fechar();
});

test('sessão de hoje pela metade convida a continuar de onde parou', async () => {
  const a = await app({ aba: 'corpo' });
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('render');
  assert.strictEqual(a.vJ('ctx.protocoloFotos').cta, 'Continuar · 1 de 9');
  a.fechar();
});

test('comparar só aparece quando há duas sessões na mesma pose', async () => {
  const a = await app({ aba: 'corpo' });
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');
  a.v('render');
  assert.strictEqual(a.$('.dd-fotos-b .ins-btn-secondary'), null, 'uma sessão não compara');

  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');
  a.v('render');
  assert.strictEqual(a.texto('.dd-fotos-b .ins-btn-secondary'), 'Comparar');
  a.fechar();
});

// ---------- comparar ----------

test('o par padrão é a mais nova contra a MAIS ANTIGA', async () => {
  // Contra a anterior, duas semanas são quase só água e sono — e é assim que se
  // desiste de um plano que estava funcionando.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  const datas = [56, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');

  a.v('ctx.abreComparar');
  assert.strictEqual(a.vista().comparar.de, datas[0]);
  assert.strictEqual(a.vista().comparar.ate, datas[2]);
  assert.ok(a.vJ('ctx.comparacao').intervalo.startsWith('42 dias entre as duas'));
  a.fechar();
});

test('comparar abre numa pose que tem par, não num vazio', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  // só a segunda pose tem duas sessões
  a.E(`S.protocolo.sessoes = [
    { d: ${JSON.stringify(diasAtras(28))}, t: 1, m: 1, fotos: { 'frente-duplo-biceps': { v: 1, ext: 'webp' } } },
    { d: ${JSON.stringify(diasAtras(14))}, t: 2, m: 2, fotos: { 'frente-relaxado': { v: 2, ext: 'webp' }, 'frente-duplo-biceps': { v: 3, ext: 'webp' } } }
  ]`);

  a.v('ctx.abreComparar');
  assert.strictEqual(a.vista().comparar.pose, 'frente-duplo-biceps');
  assert.ok(a.vJ('ctx.comparacao').par, 'abriu com par montado');
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('o peso ao lado da foto é a média da semana, e vem do registro corporal', async () => {
  // A sessão de fotos não pede número nenhum: o protocolo manda fotografar de
  // manhã em jejum, que é o mesmo momento da pesagem.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  const semana = semanaDe(28);
  a.E(`S.body.peso = [
    { t: ${semana + 1 * DIA + 10 * 3600000}, v: 90 },
    { t: ${semana + 2 * DIA + 10 * 3600000}, v: 92 },
    { t: Date.now() - 14 * ${DIA}, v: 88 }
  ]`);

  a.v('ctx.abreComparar');
  const c = a.vJ('ctx.comparacao');
  assert.strictEqual(c.de.peso, '91,0 kg', 'média das duas pesagens daquela semana');
  assert.strictEqual(c.ate.peso, '88,0 kg');
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('sem pesagem naquela semana, o lugar do número fica vazio em vez de zero', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');

  a.v('ctx.abreComparar');
  const c = a.vJ('ctx.comparacao');
  assert.strictEqual(c.de.peso, 'peso –');
  assert.strictEqual(c.de.cintura, 'cintura –');
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('a nota da sessão reaparece na comparação, que é onde ela serve', async () => {
  // É o que explica, três meses depois, o mês que parece fora da curva.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28);
  comSessoes(a, [velha, diasAtras(14)], 'frente-relaxado');
  a.E(`S.protocolo.sessoes[0].obs = 'voltando de gripe'`);

  a.v('ctx.abreComparar');
  assert.ok(a.vJ('ctx.comparacao').notas.some(n => n.includes('voltando de gripe')));
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

// ---------- o estado ----------

test('backup antigo, sem protocolo nenhum, entra sem quebrar', async () => {
  // Campo novo entra como opcional e recebe padrão em normalizaEstado(), que
  // roda no boot E na importação — não há migração porque não há dado a
  // reformatar.
  const a = await app({ estado: { logs: {}, done: [] }, aba: 'corpo' });
  assert.deepStrictEqual(a.S().protocolo, { poses: null, sessoes: [] });
  assert.ok(a.$('.dd-fotos'), 'e a seção desenha');
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('ordem de poses vazia cai na do código, sem sumir com a tela', async () => {
  const a = await app({ estado: { logs: {}, done: [], protocolo: { poses: [], sessoes: [] } }, aba: 'corpo' });
  assert.strictEqual(a.S().protocolo.poses, null, 'normalizada para "a do código"');
  assert.strictEqual(a.vJ('ctx.protocoloFotos').pontos.length, 9);
  a.fechar();
});

// ---------- ajustar o enquadramento ----------
// Não destrutivo: o que se grava é o ajuste, e os bytes ficam como saíram da
// câmera. É o que permite reeditar sem acumular perda e desfazer sempre.

test('ajustar grava o recorte no estado e não toca nos bytes', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);
  await a.esperar(60);
  const antes = guardadas(a);

  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  assert.ok(a.$('.aj-quadro'), 'a tela de ajuste abriu');
  a.v('ctx.setGiroDoAjuste', 2);
  await a.v('ctx.salvaAjuste');
  await a.esperar(60);

  const ref = a.S().protocolo.sessoes[0].fotos["frente-relaxado"];
  assert.ok(ref.enq, 'o ajuste ficou na referência');
  assert.strictEqual(ref.enq.r, 2);
  assert.ok(ref.enq.m > 0, 'com carimbo, que é o que a fusão compara');
  assert.deepStrictEqual(guardadas(a), antes, 'os bytes são exatamente os mesmos');
  a.fechar();
});

test('girar sobe o zoom sozinho, para não abrir borda vazia', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.z, 1);

  a.v('ctx.setGiroDoAjuste', 6);
  const enq = a.vJ('ctx.ajusteEmEdicao').enq;
  assert.ok(enq.z > 1.12, 'a 6° o mínimo é ~1,13: ' + enq.z);
  a.fechar();
});

test('o ajuste que não faz nada sai do estado em vez de virar zeros', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');

  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  a.v('ctx.setGiroDoAjuste', 3);
  await a.v('ctx.salvaAjuste');
  await a.esperar(60);
  assert.ok(a.S().protocolo.sessoes[0].fotos["frente-relaxado"].enq);

  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  a.v('ctx.zeraAjuste');
  await a.v('ctx.salvaAjuste');
  await a.esperar(60);
  assert.strictEqual(a.S().protocolo.sessoes[0].fotos["frente-relaxado"].enq, undefined,
    'voltou a ser a foto como saiu, sem objeto de zeros no estado');
  a.fechar();
});

test('sair sem salvar descarta: o original nunca foi tocado', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');

  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  a.v('ctx.setGiroDoAjuste', 5);
  a.v('ctx.fechaAjuste');
  assert.strictEqual(a.S().protocolo.sessoes[0].fotos["frente-relaxado"].enq, undefined);
  assert.strictEqual(a.vista().ajuste, null);
  a.fechar();
});

test('o mesmo recorte é aplicado na captura e na comparação', async () => {
  // duas contas do mesmo ajuste divergiriam, e a divergência apareceria como
  // uma diferença no corpo que não existe
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  nuvemComBucket(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.v('ctx.abreAjuste', velha, 'frente-relaxado');
  a.v('ctx.setGiroDoAjuste', 3);
  await a.v('ctx.salvaAjuste');
  await a.esperar(60);

  a.v('ctx.abreComparar');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.comparacao').de.enq.r, 3, 'a comparação leva o ajuste');

  a.v('ctx.fechaComparar');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(60);
  const ref = a.vJ('ctx.sessaoDeFotos').pose.ref;
  assert.strictEqual(ref.enq, null, 'a referência aqui é a de 14 dias, que não foi ajustada');

  // e a de 28 dias, quando é ela a referência, chega ajustada
  const daVelha = a.S().protocolo.sessoes.filter(function (x) { return x.d === velha; })[0]
    .fotos['frente-relaxado'].enq;
  assert.strictEqual(daVelha.r, 3);
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

test('a foto sobreposta pode ser trocada para qualquer outra data', async () => {
  // o padrão é a vizinha, mas quando uma sessão antiga tem a geometria boa é
  // contra ELA que se quer alinhar as seguintes — e o app não sabe qual é
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const datas = [56, 28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');

  a.v('ctx.abreAjuste', datas[2], 'frente-relaxado');
  await a.esperar(60);
  assert.strictEqual(a.vista().ajuste.fantasmaD, datas[1], 'abre na vizinha');

  // as opções são as OUTRAS sessões naquela pose, nunca a própria
  assert.deepStrictEqual(a.vJ('ctx.ajusteEmEdicao').datas.map(o => o.d), [datas[0], datas[1]]);
  assert.strictEqual(a.$$('.aj-fantasma option').length, 2);

  a.v('ctx.setDataDoFantasma', datas[0]);
  await a.esperar(60);
  const d = a.vJ('ctx.ajusteEmEdicao');
  assert.strictEqual(d.fantasmaD, datas[0]);
  assert.ok(d.refUrl, 'e os bytes da escolhida chegaram');
  assert.ok(d.refTxt, 'com a data escrita ao lado');
  a.fechar();
});

test('a sessão mais antiga alinha contra a SEGUINTE, e não fica sem fantasma', async () => {
  // ela é a que ancora a série: deixá-la sem nada contra o que alinhar seria
  // deixar justamente a mais importante de fora
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const datas = [28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');

  a.v('ctx.abreAjuste', datas[0], 'frente-relaxado');
  await a.esperar(60);
  assert.strictEqual(a.vista().ajuste.fantasmaD, datas[1]);
  assert.ok(a.vJ('ctx.ajusteEmEdicao').refUrl);
  a.fechar();
});

test('pose que só existe numa sessão não oferece contra o que alinhar', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const so = diasAtras(14);
  comSessoes(a, [so], 'frente-relaxado');
  await semear(a, so, 'frente-relaxado');

  a.v('ctx.abreAjuste', so, 'frente-relaxado');
  await a.esperar(60);
  assert.deepStrictEqual(a.vJ('ctx.ajusteEmEdicao').datas, []);
  assert.strictEqual(a.$('.aj-fantasma'), null, 'sem seletor quando não há escolha');
  a.fechar();
});

test('a tela de ajuste abre com o fantasma da sessão anterior', async () => {
  // alinhar contra a foto anterior é o motivo desta tela existir
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.v('ctx.abreAjuste', nova, 'frente-relaxado');
  await a.esperar(60);
  const d = a.vJ('ctx.ajusteEmEdicao');
  assert.strictEqual(d.fantasma, true, 'já vem ligado');
  assert.ok(d.refUrl, 'e a foto anterior está carregada');
  assert.strictEqual(a.$$('.aj-quadro .fa').length, 2, 'duas camadas no quadro');
  a.fechar();
});

test('na primeira sessão não há fantasma, e a tela não quebra', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const so = diasAtras(14);
  comSessoes(a, [so], 'frente-relaxado');
  await semear(a, so, 'frente-relaxado');

  a.v('ctx.abreAjuste', so, 'frente-relaxado');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').refUrl, null);
  assert.strictEqual(a.$$('.aj-quadro .fa').length, 1, 'uma camada só');
  a.fechar();
});

test('ajustar não é oferecido onde não há foto', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  assert.strictEqual(a.$('.pr-sobre'), null, 'sem foto, nem ajustar nem apagar');

  await tirar(a);
  await a.esperar(60);
  a.v('ctx.vaiParaPose', 'frente-relaxado');
  assert.ok(a.$('.pr-sobre'), 'com foto, os dois aparecem');
  assert.deepStrictEqual(
    a.$$('.pr-sobre button').map(b => b.textContent.trim()), ['Ajustar', 'Apagar']);
  a.fechar();
});

test('ajuste guardado sobrevive à ida e volta pelo estado', async () => {
  const a = await app({ estado: {
    logs: {}, done: [],
    protocolo: { poses: null, sessoes: [{
      d: '2026-08-24', t: 1, m: 1,
      fotos: { 'frente-relaxado': { v: 1, ext: 'webp', enq: { r: 2.5, z: 1.3, cx: 0.4, cy: 0.6, m: 9 } } }
    }] }
  }, aba: 'corpo' });
  const enq = a.S().protocolo.sessoes[0].fotos["frente-relaxado"].enq;
  assert.deepStrictEqual(enq, { r: 2.5, z: 1.3, cx: 0.4, cy: 0.6, m: 9 });
  a.fechar();
});

// ---------- a câmera de dentro do app ----------
// Alinhar ANTES do disparo: nenhum recorte depois devolve o pé que saiu do
// quadro. O que estes testes cercam é o ciclo de vida — a câmera não pode
// ficar ligada depois que a tela some.

test('a tela da pose oferece os dois caminhos de captura', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  a.v('render');

  const rotulos = a.$$('.pr-disparo').map(x => x.textContent.trim());
  assert.deepStrictEqual(rotulos, ['tirar com sobreposição', 'usar a câmera do sistema']);
  a.fechar();
});

test('sem getUserMedia, a câmera do sistema volta a ser a principal', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.E('delete navigator.mediaDevices');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  a.v('render');

  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').temCamera, false);
  const b = a.$$('.pr-disparo');
  assert.strictEqual(b.length, 1, 'um caminho só, e não um botão que não abre');
  assert.strictEqual(b[0].textContent.trim(), 'tirar a foto');
  a.fechar();
});

test('abrir a câmera pede a traseira, e em retrato', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  const pedido = a.J('globalThis.__gumPedidos[0]');
  assert.strictEqual(pedido.audio, false);
  assert.strictEqual(pedido.video.facingMode.ideal, 'environment');
  // ideal, nunca exact: exigência faria o aparelho recusar a câmera inteira
  assert.ok(pedido.video.width.ideal && pedido.video.height.ideal);
  assert.ok(pedido.video.height.ideal > pedido.video.width.ideal, 'retrato');
  assert.strictEqual(a.vJ('ctx.cameraViva').pronta, true);
  assert.ok(a.$('.cam-video'), 'o quadro vivo está na tela');
  a.fechar();
});

test('sair da tela DESLIGA a câmera', async () => {
  // faixa viva mantém o indicador do iOS aceso e a câmera consumindo
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 1);

  a.v('ctx.fechaCamera');
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 0, 'nenhuma faixa sobrou viva');
  assert.strictEqual(a.vista().camera, null);
  a.fechar();
});

test('permissão negada não vira tela quebrada, vira o que fazer a respeito', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a, { erro: 'NotAllowedError' });
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  const erro = a.vJ('ctx.cameraViva').erro;
  assert.ok(/negado/.test(erro), erro);
  assert.ok(/ajustes/.test(erro), 'e diz onde resolver: ' + erro);
  assert.strictEqual(a.E('globalThis.__faixasVivas'), 0);
  a.fechar();
});

test('disparo sem temporizador guarda a foto e avança a pose', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(120);

  const s = a.S().protocolo.sessoes;
  assert.strictEqual(s.length, 1);
  assert.ok(s[0].fotos['frente-relaxado'], 'a foto foi gravada');
  assert.deepStrictEqual(guardadas(a), ['./corpo/' + hoje() + '/frente-relaxado.webp']);
  assert.strictEqual(a.vista().protocolo.pose, 'frente-duplo-biceps', 'avançou sem sair');
  assert.ok(a.vista().camera, 'e a câmera continua aberta: são nove poses');
  a.fechar();
});

test('o disparo é o obturador, um clarão e o bloco da pose fechando — não o alarme do descanso', async () => {
  // a D, sessao-fotos estado 3: a três metros, três canais dizendo a mesma
  // coisa; o bipe duplo é do fim do descanso e aqui confundiria
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  let c = a.vJ('ctx.cameraViva');
  assert.strictEqual(c.pontos.length, 9);
  assert.deepStrictEqual(c.pontos.map(p => p.feita), Array(9).fill(false));
  assert.strictEqual(c.pontos.findIndex(p => p.atual), 0);
  assert.strictEqual(a.$$('.cam-bloco').length, 9, 'os blocos estão na câmera');
  assert.ok(a.$('.cam-bloco.atual') === a.$$('.cam-bloco')[0]);

  a.v('ctx.setTimerDaCamera', 0);
  const bipes = a.registro.bipes, vibrou = a.vibrou.length;
  a.v('ctx.disparaCamera');
  await a.esperar(120);

  assert.strictEqual(a.registro.obturador, 1, 'o som do obturador');
  assert.strictEqual(a.registro.bipes, bipes, 'e não o bipe duplo do descanso');
  assert.strictEqual(a.vibrou.length, vibrou, 'nem a vibração dele');
  c = a.vJ('ctx.cameraViva');
  assert.strictEqual(c.clarao, true, 'o clarão');
  assert.ok(a.$('.cam-clarao'));
  assert.strictEqual(c.pontos[0].feita, true, 'o bloco da pose fechou');
  assert.strictEqual(c.pontos[0].atual, false);
  assert.strictEqual(c.pontos[1].atual, true);
  assert.ok(a.$$('.cam-bloco')[0].classList.contains('feita'));

  await a.esperar(400);
  assert.strictEqual(a.vJ('ctx.cameraViva').clarao, false, 'curto: o clarão apaga sozinho');
  assert.strictEqual(a.$('.cam-clarao'), null);
  a.fechar();
});

test('a pose que não coube não ganha obturador nem clarão: o bloco dela fica marcado na câmera', async () => {
  // o disparo diz "guardou"; se não guardou, nenhum dos três canais pode dizer
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(400);
  assert.strictEqual(a.registro.obturador, 1);

  a.encheCota();
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  assert.strictEqual(a.registro.obturador, 1, 'sem obturador para o que não guardou');
  const c = a.vJ('ctx.cameraViva');
  assert.strictEqual(c.clarao, false, 'nem clarão');
  assert.strictEqual(c.pontos[1].naoGuardada, true);
  const bloco = a.$$('.cam-bloco')[1];
  assert.ok(bloco.classList.contains('nao'), 'e o bloco dela tem a forma de "não guardada"');
  assert.ok(!bloco.classList.contains('feita'), 'e não a de fechado');
  assert.strictEqual(a.$$('.cam-bloco.nao').length, 1);
  a.fechar();
});

test('a pose é dita em voz, ao abrir a câmera e a cada pose nova', async () => {
  // a D, sessao-fotos estado 2: a três metros nada precisa ser lido
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  assert.strictEqual(a.registro.falas.length, 1);
  assert.strictEqual(a.registro.falas[0].lang, 'pt-BR');
  assert.ok(/^Pose 1 de 9\. Frente relaxado\. \S/.test(a.registro.falas[0].t), a.registro.falas[0].t);

  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  assert.strictEqual(a.registro.falas.length, 2);
  assert.ok(/^Pose 2 de 9\. Frente duplo bíceps\. /.test(a.registro.falas[1].t), a.registro.falas[1].t);
  a.fechar();
});

test('sem síntese de voz no aparelho, a câmera abre e dispara igual', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.E('delete window.speechSynthesis; delete window.SpeechSynthesisUtterance');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.cameraViva').pronta, true);
  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  assert.ok(a.S().protocolo.sessoes[0].fotos['frente-relaxado']);
  assert.strictEqual(a.registro.falas.length, 0);
  assert.deepStrictEqual(a.erros, []);
  a.fechar();
});

test('a contagem pode ser cancelada antes de disparar', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  a.v('ctx.setTimerDaCamera', 10);
  a.v('ctx.disparaCamera');
  assert.strictEqual(a.vJ('ctx.cameraViva').contagem, 10);
  assert.ok(a.$('.cam-contagem'), 'a contagem cobre o quadro');

  a.v('ctx.cancelaDisparo');
  await a.esperar(120);
  assert.strictEqual(a.vJ('ctx.cameraViva').contagem, null);
  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'nada foi gravado');
  a.fechar();
});

test('o temporizador padrão dá tempo de andar os três metros', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.cameraViva').timer, 10);
  a.fechar();
});

test('sem quadro ainda, a captura recusa em vez de gravar preto', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a, { semQuadro: true });
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(120);
  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'nada gravado');
  assert.ok(/não está pronta/.test(a.toast()), a.toast());
  a.fechar();
});

test('a câmera abre com a sobreposta da sessão vizinha', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');

  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(80);

  const c = a.vJ('ctx.cameraViva');
  assert.strictEqual(c.fantasmaD, nova, 'a mais recente antes de hoje');
  assert.ok(c.refUrl, 'com os bytes já carregados');
  assert.deepStrictEqual(c.datas.map(o => o.d), [velha, nova]);
  assert.ok(a.$('.cam-ghost'), 'desenhada por cima do quadro vivo');
  a.fechar();
});

test('depois do disparo a sobreposta acompanha a nova pose', async () => {
  // são nove poses seguidas: a referência tem que trocar sozinha, senão a
  // segunda foto seria enquadrada contra a pose errada
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  const velha = diasAtras(14);
  a.E(`S.protocolo.sessoes = [{ d: ${JSON.stringify(velha)}, t: 1, m: 1, fotos: {
    'frente-relaxado': { v: 1, ext: 'webp' },
    'frente-duplo-biceps': { v: 2, ext: 'webp' }
  } }]`);

  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  assert.strictEqual(a.vJ('ctx.cameraViva').pose, 'Frente relaxado');

  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(150);

  const c = a.vJ('ctx.cameraViva');
  assert.strictEqual(c.pose, 'Frente duplo bíceps', 'a tela seguiu a pose');
  assert.strictEqual(c.fantasmaD, velha, 'e a sobreposta é a mesma sessão, na pose nova');
  a.fechar();
});

test('a foto da câmera interna entra pelo mesmo caminho da do sistema', async () => {
  // reduzida no mesmo teto, guardada no mesmo cache, com referência igual
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.v('ctx.abreCamera');
  await a.esperar(60);
  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(150);

  const ref = a.S().protocolo.sessoes[0].fotos["frente-relaxado"];
  assert.strictEqual(ref.ext, 'webp');
  assert.ok(ref.v > 0);
  const m = a.J('globalThis.__medida');
  assert.strictEqual(Math.max(m.l, m.a), 1440, 'mesmo teto do corpo: ' + JSON.stringify(m));
  a.fechar();
});

test('refazer pela câmera deixa lápide, como pelo sistema', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreProtocolo');
  a.E(`view.protocolo.montagem = false; view.protocolo.pose = 'frente-relaxado'`);
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  a.v('ctx.setTimerDaCamera', 0);
  a.v('ctx.disparaCamera');
  await a.esperar(150);
  assert.ok(a.S().apagados['corpo:' + hoje() + ':frente-relaxado'],
    'a versão anterior tem lápide');
  a.fechar();
});

test('apagar a foto pergunta antes, e recusar cancela', async () => {
  // é a única ação destrutiva que passava direto; e a lápide viaja na
  // sincronização, então não apaga só deste aparelho
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreProtocolo');
  a.E(`view.protocolo.montagem = false; view.protocolo.pose = 'frente-relaxado'`);

  a.recusar();
  await a.v('ctx.apagaFotoDoCorpo', 'frente-relaxado');
  await a.esperar(60);
  assert.strictEqual(a.S().protocolo.sessoes.length, 1, 'recusou: a foto ficou');
  const perguntas = a.perguntas().join(' ');
  assert.ok(/Apagar a foto/.test(perguntas), perguntas);
  assert.ok(/outros na próxima sincronização/.test(perguntas), 'o aviso é honesto');

  a.aceitar();
  await a.v('ctx.apagaFotoDoCorpo', 'frente-relaxado');
  await a.esperar(60);
  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'aceitou: apagou');
  a.fechar();
});

test('sair de uma tela cheia devolve a posição de leitura', async () => {
  // as folhas já faziam isso; as telas cheias jogavam para o topo e você
  // perdia a linha de onde veio
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(28), diasAtras(14)], 'frente-relaxado');
  a.v('render');

  a.E('window.scrollY = 640');          // jsdom não rola sozinho
  a.v('ctx.abreComparar');
  assert.strictEqual(a.dado('scrollDoDestino')['comparar'], 640, 'guardou antes de trocar a tela');

  a.v('ctx.fechaComparar');
  assert.strictEqual(a.dado('scrollDoDestino')['comparar'], undefined, 'e devolveu, sem deixar lixo');
  a.fechar();
});

test('andar entre poses não joga a sessão de fotos para o topo', async () => {
  // `‹ anterior` e `próxima ›` ficam no meio da página e são tocados nove vezes
  // seguidas: o topo tirava o botão de baixo do polegar a cada pose.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  await a.esperar();

  const pedidos = [];
  a.window.scrollTo = function (x, top) {
    pedidos.push(x && typeof x === 'object' ? x.top : top);
  };

  a.v('ctx.posProxima');
  await a.esperar();
  assert.strictEqual(pedidos.length, 0, 'paginar pose não pede rolagem');

  // E a pose andou de verdade — senão o teste passaria com o botão quebrado.
  assert.notStrictEqual(a.vista().protocolo.pose, a.vJ('ordemDePoses')[0]);
  // A busca de bytes continua em voo: fechar a janela no meio dela deixa o
  // render que o aviso de falha dispara sem documento para desenhar.
  await a.esperar(80);
  a.fechar();
});

// ---------------------------------------------------------------------------
// `ctx.setNotaDaSessao`: a observação da sessão de fotos
// ---------------------------------------------------------------------------
//
// Ela está no assunto errado na lista do §5 do `09-superficie.md`, ao lado de
// `editaLinha` e `apagaLinha` — mas não escreve em sessão de TREINO: escreve
// `obs` numa sessão de FOTO DE CORPO, e por isso a casa dela é aqui.
//
// Por que primeiro, dentro do assunto: é a única chave do grupo que ESCREVE em
// `S`. As outras dezesseis mexem em `view`, e uma regressão nelas custa um
// controle que não responde — visível no toque seguinte. Uma regressão aqui
// perde o que ele escreveu sobre o corpo daquele dia, em silêncio, porque a
// escrita no armazenamento é atrasada 700 ms.
//
// O QUE ESTE GRUPO PROVA: que a nota entra na sessão do dia, que a leitura da
// tela a devolve, que ela só chega ao armazenamento depois do debounce, e que
// sem sessão de fotos ela sai pela porta em vez de inventar uma sessão.
//
// O QUE ESTE GRUPO NÃO COBRE: que algum campo da tela esteja ligado nela, nem
// que o `textarea` exista. Chamar o verbo prova que a capacidade existe no
// MODELO, não que o dedo a alcança.

test('ctx.setNotaDaSessao escreve na sessão do dia, com o debounce do rascunho', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreProtocolo');
  await a.esperar(40);
  const mAntes = a.S().protocolo.sessoes[0].m;

  a.v('ctx.setNotaDaSessao', 'joelho doendo, agachei menos');
  assert.strictEqual(a.S().protocolo.sessoes[0].obs, 'joelho doendo, agachei menos',
    'a nota entrou na sessão daquele dia');
  assert.ok(a.S().protocolo.sessoes[0].m > mAntes,
    'com `m` novo, senão a fusão do outro aparelho a descarta por ser mais velha');
  assert.strictEqual(a.vJ('ctx.sessaoDeFotos').obs, 'joelho doendo, agachei menos',
    'e a leitura da tela a devolve');

  const gravado = function () {
    const g = a.gravado();
    const s = g && g.protocolo && g.protocolo.sessoes && g.protocolo.sessoes[0];
    return s ? s.obs : undefined;
  };
  // Medido a 250 ms, e não logo depois da chamada: `save()` é `async` de
  // qualquer jeito, então "ainda não gravou" no instante seguinte não prova
  // debounce nenhum — prova só que a gravação é assíncrona. Foi uma quebra
  // deliberada (trocar o `setTimeout` por `save()` nu) que mostrou isso: ela
  // não derrubou a asserção anterior.
  await a.esperar(250);
  assert.strictEqual(gravado(), undefined,
    'a 250 ms ainda não foi ao armazenamento: é o debounce de 700 ms do rascunho');
  await a.esperar(600);
  assert.strictEqual(gravado(), 'joelho doendo, agachei menos', 'depois do debounce, foi');

  // apagar a nota é escrita como qualquer outra: '' não é "não mexer"
  a.v('ctx.setNotaDaSessao', '');
  await a.esperar(900);
  assert.strictEqual(a.S().protocolo.sessoes[0].obs, '', 'a nota apagada fica apagada');
  assert.strictEqual(gravado(), '', 'inclusive no armazenamento');
  await a.esperar(60);
  a.fechar();
});

test('ctx.setNotaDaSessao sem foto no dia não inventa sessão para anotar', async () => {
  // A sessão de fotos nasce na PRIMEIRA FOTO, como a de treino nasce na
  // primeira série. Deixar a nota criá-la poria no histórico um dia de fotos
  // que nunca teve foto.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  await a.esperar(40);
  assert.deepStrictEqual(a.S().protocolo.sessoes, [], 'nenhuma sessão ainda — pré-condição');

  a.v('ctx.setNotaDaSessao', 'anotado antes de tirar foto');
  await a.esperar(800);
  assert.deepStrictEqual(a.S().protocolo.sessoes, [],
    'e continua nenhuma: a nota sai pela porta em vez de criar uma');
  assert.ok(!/anotado antes/.test(JSON.stringify(a.gravado() || {})),
    'e nada disso chegou ao armazenamento');
  await a.esperar(60);
  a.fechar();
});

// ===========================================================================
// GRUPO A · As quatro chaves que decidem se a foto EXISTE
// ===========================================================================
//
// O critério desta passada é QUANTO UMA QUEBRA SILENCIOSA CUSTA, do
// irrecuperável ao visível. Estas quatro são o topo: são as únicas chaves de
// `CTX` sem rede que chamam `garanteBytesDoCorpo`, a porta que traz os bytes do
// bucket de volta para o cache. Quebrada em silêncio, qualquer uma delas faz a
// tela dizer "a nuvem não devolveu a foto" sobre foto que ESTÁ no bucket — e a
// comparação entre sessões, que é a razão do protocolo existir, fica vazia sem
// nada dizendo por quê. Nenhuma delas tinha uma única menção em `tests/fluxo/`:
// a rede chegava até elas pelo clique (`.fa-retomar`) ou pelo nome de módulo
// dentro de `a.E`, que o redesenho renomeia sem avisar ninguém.
//
// O QUE ESTE GRUPO NÃO COBRE: que algum botão ou seletor da tela esteja ligado
// nelas. Chamar o verbo prova que a capacidade existe no MODELO, não que o dedo
// a alcança.

test('ctx.tentaFotos limpa a falha daquela data e traz os bytes de novo', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  nuvemComBucket(a, {}, {});                 // com conta, e o bucket vazio
  comSessoes(a, [velha, nova], 'frente-relaxado');

  a.v('ctx.abreComparar');
  await a.esperar(80);
  const c = () => a.vJ('ctx.comparacao');
  assert.strictEqual(c().ate.aviso, 'a nuvem não devolveu a foto', 'pré-condição: falhou');
  assert.strictEqual(c().ate.retomar, true, 'e há o que tentar');

  // o byte aparece no bucket, e é só então que tentar de novo tem o que trazer
  a.E(`globalThis.__bucketCorpo[${JSON.stringify(nova + '/frente-relaxado.webp')}] = 1`);
  a.v('ctx.tentaFotos', nova);
  await a.esperar(80);

  assert.match(c().ate.url, /^blob:/, 'a foto chegou do bucket ao cache e à tela');
  assert.strictEqual(c().ate.retomar, false, 'e a falha não ficou grudada no quadro');
  assert.deepStrictEqual(guardadas(a), ['./corpo/' + nova + '/frente-relaxado.webp'],
    'os bytes ficaram no cache deste aparelho');
  await a.esperar(60);
  a.fechar();
});

test('ctx.tentaFotos não limpa a falha das OUTRAS datas', async () => {
  // A chave da falha é `data|pose`, e o verbo filtra por prefixo. Limpar tudo
  // faria o quadro que continua falhando dizer "buscando a foto…" para sempre
  // — a tela afirmando que ainda tenta depois de já ter desistido, que é
  // exatamente o defeito que `falhaDeFoto` nasceu para consertar.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  nuvemComBucket(a, {}, {});
  comSessoes(a, [velha, nova], 'frente-relaxado');

  a.v('ctx.abreComparar');
  await a.esperar(80);
  const c = () => a.vJ('ctx.comparacao');
  assert.strictEqual(c().de.aviso, 'a nuvem não devolveu a foto', 'as duas falharam');
  assert.strictEqual(c().ate.aviso, 'a nuvem não devolveu a foto');

  // o byte da NOVA aparece; o da velha continua fora do bucket
  a.E(`globalThis.__bucketCorpo[${JSON.stringify(nova + '/frente-relaxado.webp')}] = 1`);
  a.v('ctx.tentaFotos', nova);
  await a.esperar(80);

  assert.match(c().ate.url, /^blob:/, 'a data tentada trouxe');
  assert.strictEqual(c().de.aviso, 'a nuvem não devolveu a foto',
    'e a OUTRA continua com a falha escrita, em vez de voltar a "buscando…"');
  assert.strictEqual(c().de.retomar, true, 'com a porta dela própria para tentar');
  await a.esperar(60);
  a.fechar();
});

test('ctx.setDataComparada troca um lado do par e busca os bytes da data nova', async () => {
  // O par padrão é a mais nova contra a mais antiga; trocar um lado é o gesto
  // que responde "e contra a do meio?". Sem a busca de bytes aqui, a data nova
  // entraria no estado e o quadro dela abriria vazio.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const datas = [56, 28, 14].map(diasAtras);
  nuvemComBucket(a, {}, Object.fromEntries(datas.map(d => [d + '/frente-relaxado.webp', 1])));
  comSessoes(a, datas, 'frente-relaxado');

  a.v('ctx.abreComparar');
  await a.esperar(80);
  assert.strictEqual(a.vista().comparar.de, datas[0], 'pré-condição: o par padrão');
  assert.strictEqual(a.vista().comparar.ate, datas[2]);

  a.v('ctx.setDataComparada', 'de', datas[1]);
  await a.esperar(80);

  assert.strictEqual(a.vista().comparar.de, datas[1], 'o lado DE virou a do meio');
  assert.strictEqual(a.vista().comparar.ate, datas[2], 'e o outro lado ficou onde estava');
  const c = a.vJ('ctx.comparacao');
  assert.strictEqual(c.de.d, datas[1], 'a leitura da tela acompanhou');
  assert.match(c.de.url, /^blob:/, 'e os bytes da data nova foram buscados');
  assert.ok(/^14 dias entre as duas/.test(c.intervalo),
    'o intervalo é o do par novo, 28 → 14 dias atrás: ' + c.intervalo);
  await a.esperar(60);
  a.fechar();
});

test('ctx.setPoseComparada troca a pose e remonta o par padrão dela', async () => {
  // Cada pose tem seu próprio conjunto de sessões: trocar a pose sem remontar
  // o par deixaria as duas datas da pose anterior apontando para quadros que
  // não existem naquela.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const todas = [56, 28, 14].map(diasAtras);
  nuvemComBucket(a, {}, Object.fromEntries(
    todas.map(d => [d + '/frente-relaxado.webp', 1])
      .concat([[todas[1] + '/costas-relaxado.webp', 1], [todas[2] + '/costas-relaxado.webp', 1]])));
  // a segunda pose só existe nas duas sessões mais recentes
  a.E(`S.protocolo.sessoes = [
    { d: ${JSON.stringify(todas[0])}, t: 1, m: 1, fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } },
    { d: ${JSON.stringify(todas[1])}, t: 2, m: 2, fotos: { 'frente-relaxado': { v: 2, ext: 'webp' }, 'costas-relaxado': { v: 3, ext: 'webp' } } },
    { d: ${JSON.stringify(todas[2])}, t: 3, m: 3, fotos: { 'frente-relaxado': { v: 4, ext: 'webp' }, 'costas-relaxado': { v: 5, ext: 'webp' } } }
  ]`);

  a.v('ctx.abreComparar');
  await a.esperar(80);
  assert.strictEqual(a.vista().comparar.pose, 'frente-relaxado', 'pré-condição');
  assert.strictEqual(a.vista().comparar.de, todas[0], 'com o par mais largo que essa pose tem');

  a.v('ctx.setPoseComparada', 'costas-relaxado');
  await a.esperar(80);

  assert.strictEqual(a.vista().comparar.pose, 'costas-relaxado', 'a pose trocou');
  assert.strictEqual(a.vista().comparar.de, todas[1],
    'e o par foi REMONTADO no que essa pose tem: a mais antiga dela, não a de antes');
  assert.strictEqual(a.vista().comparar.ate, todas[2]);
  const c = a.vJ('ctx.comparacao');
  assert.match(c.de.url, /^blob:/, 'e os bytes dos dois lados foram buscados');
  assert.match(c.ate.url, /^blob:/);
  await a.esperar(60);
  a.fechar();
});

test('ctx.setDataDoFantasmaDaCamera troca a sobreposição e busca os bytes dela', async () => {
  // Alinhar ANTES do disparo é o motivo da câmera de dentro do app existir, e
  // o fantasma é COM o que se alinha. Trocá-lo sem buscar os bytes deixaria a
  // câmera sobrepondo nada.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  const datas = [56, 28, 14].map(diasAtras);
  nuvemComBucket(a, {}, Object.fromEntries(datas.map(d => [d + '/frente-relaxado.webp', 1])));
  comSessoes(a, datas, 'frente-relaxado');

  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(80);
  await a.v('ctx.abreCamera');
  await a.esperar(80);
  assert.strictEqual(a.vista().camera.fantasmaD, datas[2],
    'a câmera abre na vizinha com a pose — pré-condição');

  a.v('ctx.setDataDoFantasmaDaCamera', datas[0]);
  await a.esperar(80);

  assert.strictEqual(a.vista().camera.fantasmaD, datas[0], 'o fantasma virou a mais antiga');
  assert.deepStrictEqual(guardadas(a).includes('./corpo/' + datas[0] + '/frente-relaxado.webp'), true,
    'e os bytes dela foram buscados do bucket: ' + guardadas(a).join(', '));
  a.v('ctx.fechaCamera');
  await a.esperar(60);
  a.fechar();
});

// ===========================================================================
// GRUPO B · As três que compõem o recorte GRAVADO, e a que entrega o quadro
// ===========================================================================
//
// Segundo degrau do critério: `setZoomDoAjuste` e `arrastaAjuste` montam o
// `enq` que `salvaAjuste` grava na referência da foto, e esse objeto viaja na
// sincronização e é aplicado na captura, na referência e na comparação.
// Quebradas em silêncio, elas gravam alinhamento errado numa foto que não se
// refaz — o corpo de dois meses atrás não volta para ser fotografado de novo.
// `streamDaCamera` é a única porta para a faixa de vídeo viva: sem ela a tela
// de alinhar antes do disparo não tem o que sobrepor.
//
// O QUE ESTE GRUPO NÃO COBRE: que o arrasto do dedo, o controle de zoom ou o
// `<video>` estejam ligados nelas. Chamar o verbo prova que a capacidade existe
// no MODELO, não que o dedo a alcança.

test('ctx.setZoomDoAjuste põe o zoom no recorte, dentro do que dá para desenhar', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  await a.esperar(40);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.z, 1, 'abre sem zoom — pré-condição');

  a.v('ctx.setZoomDoAjuste', 1.4);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.z, 1.4, 'o valor entrou');
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').sujo, true, 'e a tela sabe que há o que salvar');

  // o teto é 2: além disso não é recorte, é outra foto
  a.v('ctx.setZoomDoAjuste', 9);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.z, 2, 'passa por normalizaEnq, que limita em 2');

  // e o piso é o zoom que o giro em vigor exige, não 1
  a.v('ctx.setGiroDoAjuste', 6);
  a.v('ctx.setZoomDoAjuste', 1);
  const enq = a.vJ('ctx.ajusteEmEdicao').enq;
  assert.ok(enq.z > 1.12, 'a 6° o piso é ~1,13, e o 1 não desce abaixo dele: ' + enq.z);
  assert.strictEqual(enq.r, 6, 'e o giro não foi perdido no caminho');

  await a.v('ctx.salvaAjuste');
  await a.esperar(60);
  const gravado = a.S().protocolo.sessoes[0].fotos['frente-relaxado'].enq;
  assert.ok(gravado.z > 1.12, 'o zoom chegou ao estado: ' + gravado.z);
  a.fechar();
});

test('ctx.arrastaAjuste move o centro do recorte, e o zoom encolhe o passo', async () => {
  // `dx`/`dy` vêm em fração do QUADRO e são divididos pelo zoom: quanto mais
  // perto, menos foto um centímetro de dedo atravessa. Se o zoom não entrasse
  // na conta, arrastar com zoom alto saltaria a foto inteira.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreAjuste', hoje(), 'frente-relaxado');
  await a.esperar(40);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.cx, 0.5, 'o centro começa no meio');

  // no zoom mínimo não há folga nenhuma: a foto mal cobre o quadro
  a.v('ctx.arrastaAjuste', 0.1, 0);
  assert.strictEqual(a.vJ('ctx.ajusteEmEdicao').enq.cx, 0.5,
    'sem folga, arrastar não move — e não estoura');

  a.v('ctx.setZoomDoAjuste', 1.5);
  a.v('ctx.arrastaAjuste', 0.1, 0.1);
  const perto = a.vJ('ctx.ajusteEmEdicao').enq;
  assert.ok(perto.cx < 0.5, 'com folga, o centro andou: ' + perto.cx);
  assert.ok(perto.cy < 0.5, 'nos dois eixos: ' + perto.cy);

  // o MESMO arrasto, com o dobro do zoom, anda a metade da foto
  a.v('ctx.zeraAjuste');
  a.v('ctx.setZoomDoAjuste', 2);
  a.v('ctx.arrastaAjuste', 0.1, 0);
  const maisPerto = a.vJ('ctx.ajusteEmEdicao').enq;
  assert.ok(0.5 - maisPerto.cx < 0.5 - perto.cx,
    'o passo encolheu com o zoom: ' + (0.5 - perto.cx) + ' → ' + (0.5 - maisPerto.cx));

  await a.v('ctx.salvaAjuste');
  await a.esperar(60);
  const gravado = a.S().protocolo.sessoes[0].fotos['frente-relaxado'].enq;
  assert.ok(gravado.cx < 0.5, 'e o centro deslocado chegou ao estado: ' + gravado.cx);
  a.fechar();
});

test('ctx.streamDaCamera entrega a faixa viva, e nada depois de fechar', async () => {
  // É a única porta para a faixa de vídeo. O que ela devolve é o que o
  // `<video>` recebe, e por isso ela também é a prova de que sair da tela
  // desligou de verdade: faixa viva mantém o indicador do iOS aceso.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  comSessoes(a, [hoje()], 'frente-relaxado');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(60);
  assert.strictEqual(a.v('ctx.streamDaCamera'), null, 'sem a tela aberta não há faixa');

  await a.v('ctx.abreCamera');
  await a.esperar(60);
  assert.ok(a.v('ctx.streamDaCamera'), 'com a câmera aberta, a faixa está lá');
  assert.strictEqual(a.J('globalThis.__faixasVivas'), 1, 'e é uma faixa viva de verdade');

  a.v('ctx.fechaCamera');
  await a.esperar(60);
  assert.strictEqual(a.v('ctx.streamDaCamera'), null, 'fechar devolve nada');
  assert.strictEqual(a.J('globalThis.__faixasVivas'), 0, 'e a faixa foi parada, não só esquecida');
  a.fechar();
});

// ===========================================================================
// GRUPO C · As preferências de alinhamento, e as duas saídas da tela
// ===========================================================================
//
// Quarto degrau do critério: aqui nada se perde. Grade, fantasma, opacidade e
// sobreposição não entram em `S` e não viajam — são preferências de olhar, e
// uma quebra aparece no primeiro toque. Elas ganham rede por outro motivo: são
// os três controles que decidem se o alinhamento é possível de fazer, e o
// grupo é o lugar onde moram as entradas de DOM dentro do `a.E` que esta
// passada estava reduzindo. `posAnterior` e `fechaProtocolo` entram aqui porque
// são as duas únicas saídas da pose: uma anda para trás, a outra fecha.
//
// O QUE ESTE GRUPO NÃO COBRE: que haja interruptor, controle deslizante ou
// botão de fechar ligado em qualquer uma delas. Chamar o verbo prova que a
// capacidade existe no MODELO.

test('ctx.setGradeDoAjuste e ctx.setFantasmaDoAjuste ligam e desligam na leitura', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const velha = diasAtras(28), nova = diasAtras(14);
  comSessoes(a, [velha, nova], 'frente-relaxado');
  for (const d of [velha, nova]) await semear(a, d, 'frente-relaxado');
  a.v('ctx.abreAjuste', nova, 'frente-relaxado');
  await a.esperar(60);

  const aj = () => a.vJ('ctx.ajusteEmEdicao');
  assert.strictEqual(aj().grade, false, 'a grade abre desligada');
  assert.strictEqual(aj().fantasma, true, 'e o fantasma abre LIGADO: alinhar é o motivo da tela');

  a.v('ctx.setGradeDoAjuste', true);
  assert.strictEqual(aj().grade, true);
  a.v('ctx.setGradeDoAjuste', false);
  assert.strictEqual(aj().grade, false, 'e desliga pela mesma porta');

  a.v('ctx.setFantasmaDoAjuste', false);
  assert.strictEqual(aj().fantasma, false, 'o fantasma sai do caminho quando ele quer ver a foto');
  a.v('ctx.setFantasmaDoAjuste', true);
  assert.strictEqual(aj().fantasma, true);

  // os dois são verdade/mentira na leitura: um valor solto não vaza para a tela
  a.v('ctx.setGradeDoAjuste', 'sim');
  assert.strictEqual(aj().grade, true, 'a leitura entrega booleano, não o que entrou');
  assert.strictEqual(a.S().protocolo.sessoes[1].fotos['frente-relaxado'].enq, undefined,
    'e nada disso tocou o estado: preferência de olhar não é ajuste');
  a.fechar();
});

test('ctx.setSobrepor e ctx.setOpacidade comandam a comparação sobreposta', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const datas = [28, 14].map(diasAtras);
  nuvemComBucket(a, {}, Object.fromEntries(datas.map(d => [d + '/frente-relaxado.webp', 1])));
  comSessoes(a, datas, 'frente-relaxado');
  a.v('ctx.abreComparar');
  await a.esperar(80);

  const c = () => a.vJ('ctx.comparacao');
  assert.strictEqual(c().sobrepor, false, 'a comparação abre lado a lado');

  a.v('ctx.setSobrepor', true);
  assert.strictEqual(c().sobrepor, true, 'e passa a sobrepor');
  a.v('ctx.setOpacidade', 70);
  assert.strictEqual(c().opacidade, 70, 'com a opacidade que ele escolheu');
  a.v('ctx.setOpacidade', 0);
  assert.strictEqual(c().opacidade, 0, 'inclusive 0, que é só a de baixo — não é "sem valor"');
  a.v('ctx.setSobrepor', false);
  assert.strictEqual(c().sobrepor, false);
  assert.strictEqual(c().opacidade, 0, 'e a opacidade escolhida sobrevive a voltar para lado a lado');
  await a.esperar(60);
  a.fechar();
});

test('ctx.setGradeDaCamera, setFantasmaDaCamera e setOpacidadeDaCamera comandam o quadro vivo', async () => {
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  cameraFalsa(a);
  const datas = [28, 14].map(diasAtras);
  comSessoes(a, datas, 'frente-relaxado');
  for (const d of datas) await semear(a, d, 'frente-relaxado');
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await a.esperar(60);
  await a.v('ctx.abreCamera');
  await a.esperar(60);

  const v = () => a.vista().camera;
  assert.strictEqual(v().grade, false, 'a grade abre desligada');
  assert.strictEqual(v().fantasma, true, 'o fantasma abre ligado');
  assert.strictEqual(v().opacidade, 45, 'e a opacidade começa em 45');

  a.v('ctx.setGradeDaCamera', true);
  assert.strictEqual(v().grade, true);
  a.v('ctx.setFantasmaDaCamera', false);
  assert.strictEqual(v().fantasma, false);
  a.v('ctx.setOpacidadeDaCamera', 80);
  assert.strictEqual(v().opacidade, 80);

  a.v('ctx.setGradeDaCamera', 0);
  assert.strictEqual(v().grade, false, 'os dois interruptores entregam booleano');
  a.v('ctx.fechaCamera');
  await a.esperar(60);
  a.fechar();
});

test('ctx.posAnterior anda uma pose para trás, e na primeira não anda', async () => {
  // Nove poses em ordem, e a navegação é só para os lados. Passar do começo
  // daria a volta e faria a sessão parecer terminada quando ela acabou de
  // começar.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  await a.esperar(60);
  const ordem = a.vJ('ordemDePoses');
  assert.strictEqual(a.vista().protocolo.pose, ordem[0], 'abre na primeira — pré-condição');

  a.v('ctx.posProxima');
  a.v('ctx.posProxima');
  assert.strictEqual(a.vista().protocolo.pose, ordem[2]);

  a.v('ctx.posAnterior');
  assert.strictEqual(a.vista().protocolo.pose, ordem[1], 'andou UMA para trás');
  a.v('ctx.posAnterior');
  assert.strictEqual(a.vista().protocolo.pose, ordem[0], 'e chegou na primeira');

  a.v('ctx.posAnterior');
  assert.strictEqual(a.vista().protocolo.pose, ordem[0],
    'e na primeira não anda: não dá a volta para a última');
  await a.esperar(80);
  a.fechar();
});

test('ctx.fechaProtocolo fecha a tela e devolve a posição de leitura', async () => {
  // `saiDoDestino` é o par de `entraNoDestino`: abrir guardou onde ele estava
  // na página, e fechar tem de devolvê-lo ali. Sem isso, sair da sessão de
  // fotos joga ao topo de DADOS, longe do cartão que ele tocou.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(14)], 'frente-relaxado');

  let y = 0;
  a.window.scrollTo = function (x, top) { y = x && typeof x === 'object' ? x.top : top; };
  Object.defineProperty(a.window, 'scrollY', { configurable: true, value: 640 });

  a.v('ctx.abreProtocolo');
  await a.esperar(60);
  assert.ok(a.vista().protocolo, 'a tela abriu');
  assert.strictEqual(y, 0, 'e entrar jogou ao topo');

  a.v('ctx.fechaProtocolo');
  await a.esperar(60);
  assert.strictEqual(a.vista().protocolo, null, 'a tela fechou');
  assert.strictEqual(y, 640, 'e devolveu a posição de leitura de onde ele veio');
  a.fechar();
});

test('a pose que não coube para a sessão, fica marcada, e "Tentar de novo" a guarda', async () => {
  // A D (`sessao-fotos.html`, estado 9). Antes, com o registro recusado, a
  // sessão AVANÇAVA para a próxima pose como se tivesse gravado.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  a.v('ctx.abreProtocolo');
  a.v('ctx.comecaSessaoDeFotos');
  await tirar(a);                                   // a pose 1 grava
  await a.esperar(60);
  const pose2 = a.vista().protocolo.pose;
  a.encheCota();
  await tirar(a);                                   // a pose 2 não cabe no registro
  await a.esperar(60);

  assert.strictEqual(a.vista().protocolo.pose, pose2, 'a sessão parou na pose 2, não seguiu fingindo');
  const d = a.vJ('ctx.sessaoDeFotos');
  assert.ok(d.pontos.filter(p => p.naoGuardada).length === 1, 'uma pose marcada como não guardada');
  assert.ok(/^A pose 2, .+, não foi guardada$/.test(d.naoGuardada.titulo), d.naoGuardada.titulo);
  assert.ok(a.$('.pr-ponto.nao'), 'com forma diferente de "falta"');
  assert.ok(a.$('[data-a="pose-copia"]'), 'e a cópia oferecida, porque o que falhou foi o registro');

  a.encheCota(false);
  a.clicar('[data-a="pose-tenta"]');
  await a.esperar(60);
  assert.strictEqual(a.$('.pr-naoguardada'), null, '"Tentar de novo" grava');
  assert.ok(a.gravado().protocolo.sessoes[0].fotos[pose2], 'e a pose 2 está no disco');
  a.fechar();
});

test('a pose que não existe lá atrás: o par recua sozinho e diz que recuou', async () => {
  // A D (`comparar.html`, estado 7). A pose só começou a ser fotografada na
  // terceira sessão; o par mais longo possível dela começa ali, e a tela diz
  // quantos dias o par tem e quantos teria, com as sessões que não têm a pose.
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  const d1 = diasAtras(55), d2 = diasAtras(48), d3 = diasAtras(27), d4 = diasAtras(0);
  a.E(`S.protocolo.sessoes = [
    { d: '${d1}', t: 1, m: 1, fotos: { 'frente-relaxado': { v: 1, ext: 'webp' } } },
    { d: '${d2}', t: 1, m: 1, fotos: { 'frente-relaxado': { v: 2, ext: 'webp' } } },
    { d: '${d3}', t: 1, m: 1, fotos: { 'frente-relaxado': { v: 3, ext: 'webp' }, 'costas-maos-na-cintura': { v: 3, ext: 'webp' } } },
    { d: '${d4}', t: 1, m: 1, fotos: { 'frente-relaxado': { v: 4, ext: 'webp' }, 'costas-maos-na-cintura': { v: 4, ext: 'webp' } } }
  ]`);
  a.v('ctx.abreComparar');
  a.v('ctx.setPoseComparada', 'costas-maos-na-cintura');
  await a.esperar();
  const c = a.vJ('ctx.comparacao');
  assert.strictEqual(c.recuou.titulo, '27 dias, e não 55');
  assert.ok(/As sessões de \d\d\/\d\d e \d\d\/\d\d não têm esta pose\. O par mais longo possível dela começa em \d\d\/\d\d\./.test(c.recuou.texto), c.recuou.texto);
  assert.ok(a.$('.cp-recuou'), 'e a tela diz');

  a.v('ctx.setPoseComparada', 'frente-relaxado');
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.comparacao').recuou, null, 'a pose que existe desde a primeira não recua');
  a.fechar();
});

test('a cortina: uma foto por cima da outra, e o dedo anda a divisa', async () => {
  // A D (`comparar.html`, estado 2).
  const a = await app({ aba: 'corpo' });
  cacheFalso(a);
  comSessoes(a, [diasAtras(28), diasAtras(0)], 'frente-relaxado');
  a.v('ctx.abreComparar');
  await a.esperar();
  a.clicar('[data-a="modo-cortina"]');
  await a.esperar();
  assert.ok(a.$('.cp-cortina'), 'a cortina está na tela');
  assert.strictEqual(a.vJ('ctx.comparacao').corte, 50, 'a divisa nasce no meio');
  const r = a.$('[data-a="cortina-divisa"]');
  r.value = '30';
  r.dispatchEvent(new a.window.Event('input', { bubbles: true }));
  await a.esperar();
  assert.strictEqual(a.vJ('ctx.comparacao').corte, 30, 'o dedo andou a divisa');
  assert.ok(/left:\s*30%/.test(a.$('.cp-divisa').getAttribute('style')), a.$('.cp-divisa').getAttribute('style'));
  assert.strictEqual(a.vJ('ctx.comparacao').sobrepor, false, 'cortina e sobrepor não se misturam');
  a.fechar();
});
