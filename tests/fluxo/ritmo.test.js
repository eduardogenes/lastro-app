// O que as telas dizem sobre um movimento medido em distância.
//
// Antes disto, o histórico de remo somava os segundos das séries e chamava a
// soma de progresso: cinco tiros de 500 m contra um 500 m sozinho apareciam
// como `+423%` em ácido, e um remo mais lento entrava na lista dos exercícios
// que evoluíram. Estes testes leem a TELA, não a função, porque era na tela
// que a mentira aparecia.

import { test } from 'vitest';
import assert from 'node:assert';
import { app, agoraEstavel, DIA } from './harness.js';

/** Três sábados de remo: 1000 m, 500 m e cinco tiros de 500 m. */
function comRemo() {
  const agora = agoraEstavel(8);
  return {
    agora: agora,
    estado: {
      plano: 7,
      logs: {
        'remo-ergometro': [
          { t: agora - 21 * DIA, sid: 1, u: 'm', q: 1000, sets: [[0, 220]] },
          { t: agora - 14 * DIA, sid: 2, u: 'm', q: 500,  sets: [[0, 110]] },
          { t: agora -  7 * DIA, sid: 3, u: 'm', q: 500,
            sets: [[0, 110], [0, 112], [0, 115], [0, 118], [0, 120]] }
        ]
      },
      done: [
        { day: 'HX', t: agora - 21 * DIA, sid: 1, dur: 3600000 },
        { day: 'HX', t: agora - 14 * DIA, sid: 2, dur: 3600000 },
        { day: 'HX', t: agora -  7 * DIA, sid: 3, dur: 3600000 }
      ]
    }
  };
}

async function abreHistoricoDoRemo() {
  const a = await app(comRemo());
  a.aba('treino');
  a.E('view.day="HX"');
  a.E('addExercicio("remo-ergometro")');
  await a.esperar(50);
  a.E('view.hist={day:"HX",i:0,key:"remo-ergometro"}');
  return a;
}

test('o histórico de distância fala em ritmo, não em soma de segundos', async () => {
  const a = await abreHistoricoDoRemo();
  const v = a.J('CTX.historico()');

  assert.ok(v.stats[0].rotulo.indexOf('ritmo') >= 0,
    'a primeira estatística é o ritmo, e não "tempo da última": ' + v.stats[0].rotulo);
  assert.strictEqual(v.stats[0].valor, '23,0', '575 s em 2500 m são 23 s a cada 100 m');
  assert.ok(v.legenda[0].t.indexOf('menor é melhor') >= 0,
    'a legenda diz a direção por extenso, não só por cor: ' + v.legenda[0].t);
  a.fechar();
});

test('ficar mais lento não é pintado de verde', async () => {
  const a = await abreHistoricoDoRemo();
  const v = a.J('CTX.historico()');

  const periodo = v.stats.filter(function (x) { return x.rotulo.indexOf('no período') >= 0; })[0];
  assert.ok(periodo, 'existe a linha do período');
  assert.strictEqual(periodo.cor, '', 'o ritmo piorou de 22,0 para 23,0 — não é ácido');

  // a sessão de cinco tiros contra o 500 m sozinho: era aqui que saía o +423%
  const ultima = v.sessoes[0];
  assert.strictEqual(ultima.unidade, 's / 100 m', 'a unidade da linha é o ritmo');
  assert.strictEqual(ultima.deltaCor, '', 'mais lento por metro não é recorde');
  assert.ok(!/\+4\d\d%/.test(ultima.delta || ''),
    'o delta não é mais a razão entre as somas de segundos: ' + ultima.delta);
  a.fechar();
});

test('a série mostra o trabalho junto com o relógio', async () => {
  const a = await abreHistoricoDoRemo();
  const v = a.J('CTX.historico()');
  assert.strictEqual(v.sessoes[0].series[0], '500 m · 110s',
    '"110s" sozinho não diz o que foi feito');
  // fmtInt separa milhar, como todo inteiro do app
  assert.strictEqual(v.sessoes[2].series[0], '1.000 m · 220s',
    'e 1000 m não se confunde mais com 500 m no mesmo histórico');
  a.fechar();
});

test('o eixo do gráfico é invertido onde menor é melhor', async () => {
  const a = await abreHistoricoDoRemo();
  const v = a.J('CTX.historico()');
  // O melhor ritmo do período é 22,0 (o 1000 m); o pior é 23,0. Num eixo
  // normal o maior valor fica no topo — aqui o que tem que ficar no topo é o
  // melhor, senão a linha de quem melhora desce e o desenho mente igual.
  const alto = /<text[^>]*y="(\d+)"[^>]*class="ax"[^>]*>22<\/text>/.exec(v.svg)
            || /<text[^>]*y="([\d.]+)"[^>]*class="ax"[^>]*>22,0<\/text>/.exec(v.svg);
  const baixo = /<text[^>]*y="([\d.]+)"[^>]*class="ax"[^>]*>23,0<\/text>/.exec(v.svg);
  assert.ok(alto && baixo, 'os dois extremos estão rotulados no eixo');
  assert.ok(Number(alto[1]) < Number(baixo[1]),
    'o ritmo MELHOR (22,0) desenha mais alto que o pior (23,0)');
  a.fechar();
});

test('a retrospectiva do bloco não chama piora de evolução', async () => {
  const a = await abreHistoricoDoRemo();
  const R = a.J('retro()');
  const remo = R.evol.filter(function (x) { return x.nome === 'Remo ergômetro'; });
  assert.strictEqual(remo.length, 0,
    'o remo ficou mais lento no bloco e não pode aparecer entre os que subiram');
  a.fechar();
});

test('o volume acumulado continua sem contar movimento com grandeza', async () => {
  const a = await abreHistoricoDoRemo();
  const R = a.J('retro()');
  assert.strictEqual(R.volTotal, 0,
    'metro não vira kg×reps — é a mesma razão que mantém o sábado fora do alvo por músculo');
  a.fechar();
});

test('trocar a medida do dia alcança o que já foi digitado', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.E('addExercicio("remo-ergometro")');
  await a.esperar(50);

  // o box passou 500 m, não os 1000 da prova
  a.E('poeMedida(0, undefined, "500")');
  await a.esperar();
  assert.strictEqual(a.E('treino("HX").ex[0].q'), 500, 'a quantidade do dia entra no slot');

  a.E('view.open=0'); a.E('render()');
  await a.esperar();
  a.preencher(0, 0, null, 110);
  let h = a.log('HX', 0);
  assert.strictEqual(h[0].q, 500, 'o registro carimba o trabalho do dia');
  assert.strictEqual(h[0].u, 'm');

  // e se ele corrigir a grandeza depois de já ter digitado, o registro segue
  a.E('poeMedida(0, "cal", undefined)');
  await a.esperar();
  h = a.log('HX', 0);
  assert.strictEqual(h[0].u, 'cal',
    'a unidade é carimbada na projeção — mudá-la tem que reprojetar');
  a.fechar();
});

test('o cartão de um movimento com grandeza não pede RIR nem aproximação', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.E('addExercicio("remo-ergometro")');
  await a.esperar(50);
  a.E('view.open=0'); a.E('render()');
  await a.esperar();

  assert.strictEqual(a.$$('.ex.open .rirbtn').length, 0, 'nenhum botão de RIR na tabela');
  assert.ok(!a.$('.ex.open .aquec'),
    '"2 a 3 séries subindo carga" não quer dizer nada num remo');
  assert.strictEqual(a.texto('.ex.open .ex-sub span'), '1 × 1.000 m',
    'o cartão diz o que foi passado, não só um número solto');
  a.fechar();
});

test('o catálogo conhece o vocabulário do box', async () => {
  const a = await app({});
  a.aba('treino');
  // 15 destes não devolviam NADA e 4 devolviam aparelho de musculação
  const termos = ['bike', 'box jump', 'double under', 'kettlebell', 'thruster',
                  'air squat', 'sit', 'devil press', 'clean', 'push press',
                  'snatch', 'mountain', 'burpee', 'prancha'];
  termos.forEach(function (q) {
    const comGrandeza = a.J(`(function(){ view.addQ=${JSON.stringify(q)};
      return catalogoDeAdicao('HX').achados.filter(function(x){ return !!CAT[x.id].u; }); })()`);
    assert.ok(comGrandeza.length > 0, 'a busca por "' + q + '" não acha movimento de box');
  });
  a.fechar();
});

test('todo movimento de box fica fora do alvo por músculo e declara grandeza', async () => {
  const a = await app({});
  const falhas = a.J(`(function(){
    return MOVIMENTOS_DE_BOX.filter(function (ex) { return ex.g !== '' || !ex.u || !(ex.q > 0); })
      .map(function (ex) { return ex.n; });
  })()`);
  assert.deepStrictEqual(falhas, [],
    'movimento com grupo entraria no volume; sem grandeza viraria série de musculação');
  assert.strictEqual(a.E('ALVO_TOTAL'), 90, 'o alvo continua sendo só a musculação');
  a.fechar();
});

test('exercício cadastrado por ele pode declarar grandeza', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.E('abrirAddEx()'); a.E('abrirNovoEx()');
  await a.esperar();
  a.doc.getElementById('nxn').value = 'Sandbag over shoulder';
  a.doc.getElementById('nxg').value = 'peito';
  a.doc.getElementById('nxu').value = 'rep';
  a.doc.getElementById('nxq').value = '15';
  a.clicar('.novoex .dbtn');
  await a.esperar(60);

  const ex = a.J('S.ex["sandbag-over-shoulder"]');
  assert.strictEqual(ex.u, 'rep', 'a grandeza escolhida entra no catálogo dele');
  assert.strictEqual(ex.q, 15);
  assert.strictEqual(ex.g, '',
    'movimento com grandeza não leva grupo: contaria como série de peito no volume');
  assert.strictEqual(a.E('treino("HX").ex[0].u'), 'rep', 'e entra no dia já medido certo');
  a.fechar();
});

test('o cabeçalho acompanha a quantidade enquanto ele digita', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('S.sessao={day:"HX",inicio:Date.now(),ultima:Date.now(),sid:Date.now(),pausas:[],pulados:[]}');
  a.E('view.day="HX"');
  a.E('addExercicio("remo-ergometro")');
  await a.esperar(50);
  a.E('view.open=0'); a.E('abrirMedida(0)');
  await a.esperar();
  assert.strictEqual(a.texto('#presc0'), '1 × 1.000 m');

  // digitar não re-renderiza — o campo é controlado e "5," viraria "5" no meio
  // da digitação. Quem mantém o cabeçalho honesto é a escrita direta.
  a.digitar('q0', '500');
  await a.esperar();
  assert.strictEqual(a.texto('#presc0'), '1 × 500 m',
    'o cabeçalho dizia 1.000 enquanto o campo já mostrava 500');
  a.fechar();
});

test('no dia aberto o catálogo abre pelos movimentos de box, na ordem', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('view.addQ=""');
  const hx = a.J(`catalogoDeAdicao('HX').achados.map(function(x){return x.n})`);
  assert.deepStrictEqual(hx.slice(0, 9), [
    'Corrida', 'Wall balls', 'Remo ergômetro', 'Ski erg', 'Sled push',
    'Sled pull', 'Farmers carry', 'Lunges com sandbag', 'Burpee broad jump'
  ], 'as nove estações da prova primeiro, na ordem em que ele as procura');
  assert.deepStrictEqual(hx.slice(9, 16), [
    'Kettlebell swing', 'Box jump', 'Burpee', 'Assault bike', 'Bike erg',
    'Double under', 'Thruster'
  ], 'e depois os frequentes que não são oficiais');
  assert.ok(hx[16].localeCompare(hx[17]) <= 0, 'do 17º em diante volta a ser alfabético');
  a.fechar();
});

test('a prioridade não existe nos dias de musculação', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('view.addQ=""');
  const dia = a.J(`catalogoDeAdicao('A').achados.map(function(x){return x.n})`);
  const ordenado = dia.slice().sort(function (x, y) { return x.localeCompare(y); });
  assert.deepStrictEqual(dia, ordenado,
    'no dia de prescrição pôr sled no topo seria oferecer o caminho errado');
  a.fechar();
});

test('a prioridade também vale dentro da busca', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('view.addQ="burpee"');
  const r = a.J(`catalogoDeAdicao('HX').achados.map(function(x){return x.n})`);
  assert.strictEqual(r[0], 'Burpee broad jump', 'a estação da prova vem antes do burpee solto');
  a.E('view.addQ="s"');
  const s = a.J(`catalogoDeAdicao('HX').achados.map(function(x){return x.n}).slice(0,3)`);
  assert.deepStrictEqual(s, ['Wall balls', 'Ski erg', 'Sled push'],
    'digitar uma letra faz o box subir, em vez de dezenas de aparelhos');
  a.fechar();
});

test('a linha diz a medida, não "sem grupo"', async () => {
  const a = await app({});
  a.aba('treino');
  a.E('view.addQ="remo erg"');
  const r = a.J(`catalogoDeAdicao('HX').achados`);
  assert.strictEqual(r[0].sub, '1.000 m', '"sem grupo" dezesseis vezes no topo não diria nada');
  a.E('view.addQ="wall"');
  assert.strictEqual(a.J(`catalogoDeAdicao('HX').achados`)[0].sub, '100 reps');
  a.E('view.addQ="assault"');
  assert.strictEqual(a.J(`catalogoDeAdicao('HX').achados`)[0].sub, '15 cal');
  // e o exercício de musculação continua mostrando o grupo (pushdown já está
  // no treino A, e o aviso disso continua vindo junto)
  a.E('view.addQ="pushdown"');
  assert.strictEqual(a.J(`catalogoDeAdicao('A').achados`)[0].sub,
    'tríceps · já está neste treino');
  a.fechar();
});

test('todo nome da lista de frequentes existe no catálogo', async () => {
  const a = await app({});
  const orfaos = a.J(`(function(){
    return FREQUENTES_NO_BOX.filter(function (n) { return !EX_BASE[slugEx(n)]; });
  })()`);
  assert.deepStrictEqual(orfaos, [],
    'um nome com erro de digitação sumiria da prioridade em silêncio');
  a.fechar();
});
