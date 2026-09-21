// O ajuste calórico é um SALDO, não um destino.
//
// A regra do nutricionista tem critérios diferentes para cortar e para subir,
// e é essa assimetria que evita o efeito sanfona: depois de um ajuste, a nova
// ingestão VIRA a linha de base. Cortou e o peso voltou à faixa? As calorias
// novas ficam. Enquanto o ajuste era `-1 | 0 | 1` lido como estado-destino, um
// veredito de observar com corte em vigor punha na tela um botão "voltar ao
// plano base" — convidando a desfazer exatamente o que não se desfaz.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, inicioDaSemana, DIA } from './harness.js';
import { cacheFalso } from './dubles.js';

function pesagens(medias) {
  const ultima = inicioDaSemana(Date.now()) - 7 * DIA;
  const ruido = [0.4, -0.3, 0.2, -0.3];
  const out = [];
  medias.forEach(function (m, idx) {
    const semana = ultima - (medias.length - 1 - idx) * 7 * DIA;
    for (let j = 0; j < 4; j++) {
      out.push({ t: semana + j * DIA + 10 * 3600000, v: Math.round((m + ruido[j]) * 100) / 100 });
    }
  });
  return out;
}

/** 14 dias com registro: sem isto a trava de adesão não deixa nada acontecer. */
function comidaRegistrada(dias) {
  const out = [];
  for (let i = 1; i <= dias; i++) {
    const d = new Date(Date.now() - i * DIA);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
    out.push({ d: iso, done: { cafe: Date.now() }, agua: 0, escala: {},
               tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: Date.now() });
  }
  return out.sort(function (x, y) { return x.d < y.d ? -1 : 1; });
}

function comPeso(medias) {
  return app({ estado: {
    logs: {}, done: [], perfManual: false,
    comidaHist: comidaRegistrada(14),
    body: { peso: pesagens(medias), cintura: [] }
  } });
}

test('dois passos no mesmo sentido somam, e a tela diz que são dois', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('dados');
  assert.strictEqual(a.E('CTX.dados().veredito.t'), 'Comer mais');
  const base = a.E('arrozAtual()');

  await a.E('CTX.aplicaAjuste()'); await a.esperar();
  assert.strictEqual(a.E('S.ajuste'), 1);
  assert.strictEqual(a.E('arrozAtual()'), base + 120, '+150 kcal são 120 g de arroz');

  await a.E('CTX.aplicaAjuste()'); await a.esperar();
  assert.strictEqual(a.E('S.ajuste'), 2, 'o segundo passo soma ao primeiro');
  assert.strictEqual(a.E('arrozAtual()'), base + 240, 'e o arroz anda de novo');
  assert.ok(a.E('CTX.dados().veredito.estado').includes('2 passos'),
    a.E('CTX.dados().veredito.estado'));
  a.fechar();
});

test('observar não oferece desfazer o corte', async () => {
  // 0,35 kg/semana: fora da faixa-alvo, mas sem critério para agir. Era aqui
  // que nascia o convite a devolver as 150 kcal.
  const a = await comPeso([73.0, 73.20, 73.55]);
  a.E('S.ajuste = -1');
  a.aba('dados');
  const v = a.J('CTX.dados().veredito');
  assert.strictEqual(v.t, 'Observar');
  assert.strictEqual(v.podeAplicar, false, 'nada a aplicar: observar não é decisão');
  assert.strictEqual(v.acaoTxt, null);
  assert.ok(v.estado.includes('−150 kcal'), 'mas o saldo continua à vista: ' + v.estado);
  a.fechar();
});

test('cada passo guarda de onde veio', async () => {
  const a = await comPeso([73.0, 73.05, 73.10]);
  a.aba('dados');
  await a.E('CTX.aplicaAjuste()'); await a.esperar();

  const h = a.J('S.ajusteHist');
  assert.strictEqual(h.length, 1);
  assert.strictEqual(h[0].de, 0);
  assert.strictEqual(h[0].para, 1);
  assert.strictEqual(h[0].k, 'mais');
  // 13 e não 14: a janela de `janelaDoHistorico` é aberta no extremo antigo,
  // então o 14º dia atrás fica de fora. Acima da trava de 11, que é o que vale.
  assert.strictEqual(h[0].reg, 13, 'a adesão registrada na hora fica com o passo');
  assert.ok(h[0].p.includes('0,05'), 'e o veredito por extenso: ' + h[0].p);
  a.fechar();
});

test('manter não mexe no saldo nem no ledger', async () => {
  const a = await comPeso([73.0, 73.25, 73.5]);
  a.aba('dados');
  assert.strictEqual(a.E('CTX.dados().veredito.t'), 'Manter como está');
  await a.E('CTX.aplicaAjuste()'); await a.esperar();
  assert.strictEqual(a.E('S.ajuste'), 0);
  assert.strictEqual(a.J('S.ajusteHist').length, 0);
  a.fechar();
});

test('saldo de dois passos sobrevive ao boot', async () => {
  const a = await app({ estado: { logs: {}, done: [], ajuste: -2 } });
  assert.strictEqual(a.E('S.ajuste'), -2, 'o clamp ternário de antes truncaria para 0');
  a.fechar();
});

test('o backup leva o saldo e o ledger', async () => {
  const a = await app();
  a.E('S.ajuste = -2');
  a.E("S.ajusteHist = [{ t: 1, de: -1, para: -2, k: 'menos', p: 'texto', reg: 13 }]");
  a.aba('guia');
  await a.modo('o app');
  a.E('showJSON()');
  const bkp = JSON.parse(a.doc.getElementById('jout').value);
  assert.strictEqual(bkp.data.ajuste, -2);
  assert.strictEqual(bkp.data.ajusteHist.length, 1);
  a.fechar();

  const b = await app({ estado: bkp.data });
  assert.strictEqual(b.E('S.ajuste'), -2);
  assert.strictEqual(b.J('S.ajusteHist')[0].k, 'menos', 'a procedência voltou junto');
  b.fechar();
});

test('restaurar o plano é o caminho documentado para zerar', async () => {
  // Tirei o botão que desfazia sozinho; o desfazer continua existindo, um
  // nível para dentro e com confirmação. É a regra 6 do produto.
  const a = await app();
  a.E('S.ajuste = -2');
  a.E('window.confirm = function () { return true; }');
  await a.E('CTX.restauraPlano()'); await a.esperar();
  assert.strictEqual(a.E('S.ajuste'), 0);
  a.fechar();
});

// ---------- a leitura das fotos, que é o que destrava o corte ----------

const iso = n => {
  const d = new Date(Date.now() - n * DIA);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
};

function comFotos(a, datas) {
  a.E(`S.protocolo.sessoes = ${JSON.stringify(datas)}.map(function (d, i) {
    return { d: d, t: 1, m: 1, fotos: { 'frente-relaxado': { v: i + 1, ext: 'webp' } } };
  })`);
}

test('a leitura das fotos destrava o corte que o peso sozinho não dá', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);          // duas semanas acima de 0,40
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);

  a.aba('dados');
  assert.strictEqual(a.E('CTX.dados().veredito.t'), 'Observar',
    'sem a leitura, o peso abre revisão e não corta');

  a.E('CTX.abreComparar()');
  const p = a.J('CTX.comparacao().pergunta');
  assert.ok(p, 'a pergunta aparece num par de 14 dias');
  assert.strictEqual(p.valor, null, 'e começa sem resposta');

  await a.E("CTX.setGordura('sim')"); await a.esperar();
  assert.strictEqual(a.J('S.gordura').length, 1);
  assert.strictEqual(a.J('S.gordura')[0].v, 'sim');
  assert.strictEqual(a.J('S.gordura')[0].d, iso(0), 'a chave é a sessão mais nova');

  a.aba('dados');
  const v = a.J('CTX.dados().veredito');
  assert.strictEqual(v.t, 'Comer menos');
  assert.strictEqual(v.podeAplicar, true, 'e agora há o que aplicar');
  a.fechar();
});

test('fotos sem piora mandam manter, e não cortam', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);
  a.E('CTX.abreComparar()');
  await a.E("CTX.setGordura('nao')"); await a.esperar();

  a.aba('dados');
  assert.strictEqual(a.E('CTX.dados().veredito.t'), 'Manter como está',
    'ganho acima da faixa não é ruim por si: está comprando músculo');
  a.fechar();
});

test('responder de novo substitui, em vez de empilhar opinião', async () => {
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(14), iso(0)]);
  a.E('CTX.abreComparar()');
  await a.E("CTX.setGordura('sim')"); await a.esperar();
  await a.E("CTX.setGordura('incerto')"); await a.esperar();

  assert.strictEqual(a.J('S.gordura').length, 1, 'uma leitura por par');
  assert.strictEqual(a.J('S.gordura')[0].v, 'incerto');
  a.aba('dados');
  assert.strictEqual(a.E('CTX.dados().veredito.t'), 'Observar', 'incerto não corta');
  assert.strictEqual(a.E('CTX.dados().veredito.podeAplicar'), false);
  a.fechar();
});

test('num par de três meses a pergunta não aparece', async () => {
  // Seria outra pergunta, e a régua leria a resposta como se fosse esta.
  const a = await comPeso([73.0, 73.6, 74.2]);
  cacheFalso(a);
  comFotos(a, [iso(92), iso(0)]);
  a.E('CTX.abreComparar()');
  assert.strictEqual(a.J('CTX.comparacao().pergunta'), null);
  a.fechar();
});
