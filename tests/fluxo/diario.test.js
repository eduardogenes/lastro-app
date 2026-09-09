// O dia fecha sozinho na virada, e o passado não se reescreve.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

async function noHoje() {
  const a = await app({ agora: agoraEstavel(8) });
  a.aba('hoje');
  await a.esperar();
  return a;
}

test('o dia vivido vai para o histórico na virada da data', async () => {
  const a = await noHoje();
  a.E('CTX.marcaRefeicao("pos")');
  a.E('CTX.marcaRefeicao("almoco")');
  a.E('CTX.setAgua(11)');
  a.E('diaDeComida().turno = "noite"');
  await a.esperar();
  const ontem = a.J('S.dia.data');
  assert.deepStrictEqual(a.J('S.comidaHist'), [], 'nada ainda: o dia está aberto');

  a.viajar(DIA);
  a.E('diaDeComida()');            // a primeira leitura no dia seguinte fecha o anterior
  await a.esperar();

  const h = a.J('S.comidaHist');
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].d, ontem);
  assert.deepStrictEqual(Object.keys(h[0].done).sort(), ['almoco', 'pos']);
  assert.strictEqual(h[0].agua, 11);
  assert.strictEqual(h[0].turno, 'noite');
  assert.ok(h[0].tot.kcal > 0, 'e o total vai congelado');
  a.fechar();
});

test('o passado não se reescreve quando o plano muda', async () => {
  const a = await noHoje();
  a.E('CTX.marcaRefeicao("pos")');
  a.E('CTX.marcaRefeicao("almoco")');
  await a.esperar();
  a.viajar(DIA);
  a.E('diaDeComida()');
  await a.esperar();
  const antes = a.J('S.comidaHist[0].tot.kcal');
  const pvAntes = a.J('S.comidaHist[0].pv');

  // o nutricionista corta o arroz do almoço
  a.E('CTX.setQuantidade("almoco", 0, 150)');
  await a.esperar(60);

  assert.strictEqual(a.J('S.comidaHist[0].tot.kcal'), antes,
    'medido antes: o mesmo dia caía de 1.348 para 1.220 kcal sem ninguém comer diferente');
  assert.ok(a.J('S.comida.v') > pvAntes,
    'e a versão do plano avança, então a tela consegue dizer que ele mudou');
  a.fechar();
});

test('dia inteiramente mudo não vira linha', async () => {
  const a = await noHoje();
  a.viajar(DIA);
  a.E('diaDeComida()');
  await a.esperar();
  assert.deepStrictEqual(a.J('S.comidaHist'), [],
    'guardar um dia vazio como zero seria dizer que ele não comeu');
  a.fechar();
});

test('fechar duas vezes o mesmo dia não duplica', async () => {
  const a = await noHoje();
  a.E('CTX.marcaRefeicao("pos")');
  await a.esperar();
  a.viajar(DIA);
  a.E('diaDeComida()'); a.E('diaDeComida()'); a.E('diaDeComida()');
  await a.esperar();
  assert.strictEqual(a.J('S.comidaHist').length, 1);
  a.fechar();
});

test('o histórico atravessa o backup', async () => {
  const a = await noHoje();
  a.E('CTX.marcaRefeicao("pos")');
  await a.esperar();
  a.viajar(DIA);
  a.E('diaDeComida()');
  await a.esperar();
  a.aba('guia');
  await a.modo('o app');
  a.E('showJSON()');
  const bkp = JSON.parse(a.doc.getElementById('jout').value);
  assert.strictEqual(bkp.data.comidaHist.length, 1,
    'coleção que fica de fora do export some na primeira troca de aparelho');
  a.fechar();
});

test('a fusão soma o que dois aparelhos marcaram no mesmo dia', async () => {
  const a = await noHoje();
  const local = { comidaHist: [{ d: '2026-01-14', done: { pos: 100 }, agua: 4,
                                 escala: {}, tot: { kcal: 600, p: 30, c: 80, g: 15 }, pv: 1, m: 100 }] };
  const remoto = { comidaHist: [{ d: '2026-01-14', done: { almoco: 200 }, agua: 9,
                                  escala: {}, tot: { kcal: 700, p: 35, c: 90, g: 18 }, pv: 1, m: 200 }] };
  const r = a.J(`(function(){
    var l = Object.assign(JSON.parse(JSON.stringify(S)), ${JSON.stringify(local)});
    var m = Object.assign(JSON.parse(JSON.stringify(S)), ${JSON.stringify(remoto)});
    return funde(l, m).estado.comidaHist;
  })()`);
  assert.strictEqual(r.length, 1, 'a data é a chave natural: um dia, um registro');
  assert.deepStrictEqual(Object.keys(r[0].done).sort(), ['almoco', 'pos'],
    'marcar o almoço no iPhone e o café no iPad tem que SOMAR, não escolher um');
  assert.strictEqual(r[0].agua, 9, 'a água fica no maior: é contador que só cresce');
  a.fechar();
});

test('a folha da refeição mostra o padrão dela antes de ele marcar', async () => {
  const a = await noHoje();
  // 8 dias fechados: o lanche falha na maioria
  // datas relativas a HOJE: a janela do padrão é de 20 dias, e um histórico
  // ancorado numa data fixa cairia fora dela
  a.E(`(function(){
    S.comidaHist = [];
    for (var i = 8; i >= 1; i--) {
      var done = { pos: 1, almoco: 1, jantar: 1 };
      if (i >= 6) done.lanche = 1;
      S.comidaHist.push({ d: hojeISO(Date.now() - i * 86400000), done: done, agua: 8,
                          escala: {}, cadencia: 'treino',
                          tot: {kcal:0,p:0,c:0,g:0}, pv: 1, m: 9 - i });
    }
  })()`);
  const c = a.J(`(function(){
    var f = CTX.refeicao('lanche');
    return f && f.padrao;
  })()`);
  assert.ok(c, 'com histórico suficiente o padrão aparece');
  assert.ok(/3 dos últimos 8 dias/.test(c.txt), c.txt);
  assert.ok(!/%/.test(c.txt), 'contagem crua, nunca percentual');
  a.fechar();
});

test('sem histórico suficiente a folha não inventa padrão', async () => {
  const a = await noHoje();
  assert.strictEqual(a.J('CTX.refeicao("lanche").padrao'), null,
    'mostrar um número que ainda não quer dizer nada é pior que calar');
  a.fechar();
});

test('a fusão do dia ABERTO também soma os dois aparelhos', async () => {
  const a = await noHoje();
  const r = a.J(`(function(){
    var base = JSON.parse(JSON.stringify(S));
    var l = Object.assign({}, base, { dia: { data:'2026-01-14', done:{pos:1}, agua:4, escala:{}, cadencia:'treino' } });
    var m = Object.assign({}, base, { dia: { data:'2026-01-14', done:{almoco:1}, agua:9, escala:{}, cadencia:'treino' } });
    return funde(l, m).estado.dia;
  })()`);
  assert.deepStrictEqual(Object.keys(r.done).sort(), ['almoco', 'pos'],
    'era o único que ainda vinha inteiro do lado que gravou por último');
  assert.strictEqual(r.agua, 9);
  a.fechar();
});
