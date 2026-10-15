// O dia fecha sozinho na virada, e o passado não se reescreve.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

async function noHoje() {
  const a = await app({ agora: agoraEstavel(8) });
  a.aba('agora');
  await a.esperar();
  return a;
}

test('o dia vivido vai para o histórico na virada da data', async () => {
  const a = await noHoje();
  a.v('ctx.marcaRefeicao', 'pos');
  a.v('ctx.marcaRefeicao', 'almoco');
  a.v('ctx.setAgua', 11);
  a.E('diaDeComida().turno = "noite"');
  await a.esperar();
  const ontem = a.S().dia.data;
  assert.deepStrictEqual(a.S().comidaHist, [], 'nada ainda: o dia está aberto');

  a.viajar(DIA);
  a.v('diaDeComida');            // a primeira leitura no dia seguinte fecha o anterior
  await a.esperar();

  const h = a.S().comidaHist;
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].d, ontem);
  assert.deepStrictEqual(Object.keys(h[0].done).sort(), ['almoco', 'pos']);
  assert.strictEqual(h[0].agua, 11);
  assert.strictEqual(h[0].turno, 'noite');
  assert.ok(h[0].tot.kcal > 0, 'e o total vai congelado');
  a.fechar();
});

test('o dia de treino fecha como treino mesmo sem ninguém dizer o tipo', async () => {
  // Regressão (docs/mapa, risco D8): o dia descia com o tipo DITO na folha do
  // tipo do dia. Num dia de treino pelo padrão semanal, sem abrir a folha, a
  // linha ia sem tipo: o total congelado saía sem o pré-treino e a adesão lia
  // as refeições do descanso.
  const a = await noHoje();
  a.E(`S.cadencia = ['treino','treino','treino','treino','treino','treino','treino']`);
  a.v('ctx.marcaRefeicao', 'pre');
  a.v('ctx.marcaRefeicao', 'almoco');
  await a.esperar();
  assert.strictEqual(a.S().dia.cadencia || null, null, 'ninguém disse o tipo do dia');

  a.viajar(DIA);
  a.v('diaDeComida');
  await a.esperar();
  const h = a.S().comidaHist[0];
  assert.strictEqual(h.cadencia, 'treino', 'o dia desce com o tipo que ele teve');
  assert.ok(h.done.pre, 'com a marca do pré-treino');
  const soAlmoco = a.J(`(() => { const d = JSON.parse(JSON.stringify(S.comidaHist[0])); delete d.done.pre;
    return fechaDia({ data: d.d, done: d.done, agua: 0, escala: {}, cadencia: 'treino' }, planoDeComida(), catalogoAlimentos(), 1, 0, 1).tot.kcal; })()`);
  assert.ok(h.tot.kcal > soAlmoco, 'e o pré-treino entra no total congelado');
  a.fechar();
});

test('o dia em que ele disse descanso e depois treinou fecha como treino', async () => {
  const a = await noHoje();
  a.v('ctx.marcaRefeicao', 'almoco');
  a.E(`diaDeComida().cadencia = 'descanso'`);
  a.v('toggle', 0);
  a.preencher(0, 0, 40, 10);          // a sessão registrada naquele dia manda
  await a.esperar();

  a.viajar(DIA);
  a.v('diaDeComida');
  await a.esperar();
  assert.strictEqual(a.S().comidaHist[0].cadencia, 'treino');
  a.fechar();
});

test('o passado não se reescreve quando o plano muda', async () => {
  const a = await noHoje();
  a.v('ctx.marcaRefeicao', 'pos');
  a.v('ctx.marcaRefeicao', 'almoco');
  await a.esperar();
  a.viajar(DIA);
  a.v('diaDeComida');
  await a.esperar();
  const antes = a.S().comidaHist[0].tot.kcal;
  const pvAntes = a.S().comidaHist[0].pv;

  // o nutricionista corta o arroz do almoço
  a.v('ctx.setQuantidade', 'almoco', 0, 150);
  await a.esperar(60);

  assert.strictEqual(a.S().comidaHist[0].tot.kcal, antes,
    'medido antes: o mesmo dia caía de 1.348 para 1.220 kcal sem ninguém comer diferente');
  assert.ok(a.S().comida.v > pvAntes,
    'e a versão do plano avança, então a tela consegue dizer que ele mudou');
  a.fechar();
});

test('dia inteiramente mudo não vira linha', async () => {
  const a = await noHoje();
  a.viajar(DIA);
  a.v('diaDeComida');
  await a.esperar();
  assert.deepStrictEqual(a.S().comidaHist, [],
    'guardar um dia vazio como zero seria dizer que ele não comeu');
  a.fechar();
});

test('fechar duas vezes o mesmo dia não duplica', async () => {
  const a = await noHoje();
  a.v('ctx.marcaRefeicao', 'pos');
  await a.esperar();
  a.viajar(DIA);
  a.v('diaDeComida'); a.v('diaDeComida'); a.v('diaDeComida');
  await a.esperar();
  assert.strictEqual(a.S().comidaHist.length, 1);
  a.fechar();
});

test('o histórico atravessa o backup', async () => {
  const a = await noHoje();
  a.v('ctx.marcaRefeicao', 'pos');
  await a.esperar();
  a.viajar(DIA);
  a.v('diaDeComida');
  await a.esperar();
  a.aba('ajustes');
  a.v('showJSON');
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
  const r = a.vJ('funde', Object.assign(a.S(), local), Object.assign(a.S(), remoto)).estado.comidaHist;
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
  const f = a.vJ('ctx.refeicao', 'lanche');
  const c = f && f.padrao;
  assert.ok(c, 'com histórico suficiente o padrão aparece');
  assert.ok(/3 dos últimos 8 dias/.test(c.txt), c.txt);
  assert.ok(!/%/.test(c.txt), 'contagem crua, nunca percentual');
  a.fechar();
});

test('sem histórico suficiente a folha não inventa padrão', async () => {
  const a = await noHoje();
  assert.strictEqual(a.vJ('ctx.refeicao', 'lanche').padrao, null,
    'mostrar um número que ainda não quer dizer nada é pior que calar');
  a.fechar();
});

test('a fusão do dia ABERTO também soma os dois aparelhos', async () => {
  const a = await noHoje();
  const base = a.S();
  const l = Object.assign({}, base, { dia: { data: '2026-01-14', done: { pos: 1 }, agua: 4, escala: {}, cadencia: 'treino' } });
  const m = Object.assign({}, base, { dia: { data: '2026-01-14', done: { almoco: 1 }, agua: 9, escala: {}, cadencia: 'treino' } });
  const r = a.vJ('funde', l, m).estado.dia;
  assert.deepStrictEqual(Object.keys(r.done).sort(), ['almoco', 'pos'],
    'era o único que ainda vinha inteiro do lado que gravou por último');
  assert.strictEqual(r.agua, 9);
  a.fechar();
});
