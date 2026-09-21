// As três regras de ajuste da dieta, nos limites exatos.
//
// Antes cada um destes casos custava subir o app inteiro num jsdom para ler um
// parágrafo da tela. A regra é função pura: recebe as marcas, devolve o
// veredito. Testar assim custa microssegundos — e por isso dá para cobrir os
// limites, o sinal negativo e a precedência da cintura sem pensar duas vezes.

import { test } from 'vitest';
import assert from 'node:assert';
import { cinturaMes, leituraVigente, mediasSemanais, pesoRitmo, veredito } from '../../src/dominio/corpo';
import { medidas, naSemana, pesagens } from './ajuda';

const semCintura = { peso: [] as ReturnType<typeof pesagens>, cintura: [] };

// Registrado o bastante e força parada: o cenário em que a regra PODE agir.
// Passar isto explicitamente é o ponto — sem adesão registrada, nada muda.
const OK = { diasRegistrados: 14, forcaSubindo: false };

test('ganho travado por 2 semanas, com força parada, manda comer mais', () => {
  const v = veredito({ peso: pesagens([73.0, 73.05, 73.10]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Comer mais');
  assert.ok(v.p.includes('+150 kcal'), v.p);
});

test('ganho travado com a força subindo é recomposição: não mexe', () => {
  const v = veredito({ peso: pesagens([73.0, 73.05, 73.10]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: true });
  assert.strictEqual(v.k, 'observar');
  assert.ok(v.p.includes('recomposição'), v.p);
});

test('ganho na faixa-alvo manda manter', () => {
  const v = veredito({ peso: pesagens([73.0, 73.25, 73.5]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Manter como está');
  assert.ok(v.p.includes('0,25'));
});

// ---------- o erro que motivou tudo: persistência, não média ----------

test('uma semana aberrante NÃO corta: +0,10 e depois +0,75', () => {
  // A média das duas dá 0,425 e a regra antiga cortava. Só uma semana passou
  // de 0,40, então o critério temporal ainda não foi confirmado.
  const v = veredito({ peso: pesagens([73.0, 73.10, 73.85]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: 'sim' });
  assert.notStrictEqual(v.k, 'menos', 'uma semana só não confirma: ' + v.p);
  assert.strictEqual(v.k, 'observar');
});

test('duas semanas seguidas acima de 0,40, com gordura visual, cortam', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: 'sim' });
  assert.strictEqual(v.t, 'Comer menos');
  assert.ok(v.p.includes('−150 kcal'), v.p);
});

test('duas semanas acima de 0,40 sem piora nas fotos: o ganho é produtivo', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: 'nao' });
  assert.strictEqual(v.k, 'manter', v.p);
});

test('sem a leitura das fotos, o peso abre revisão e não corta', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: null });
  assert.strictEqual(v.k, 'observar');
  assert.strictEqual(v.falta, 'gordura');
});

test('fotos inconclusivas também não cortam', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: 'incerto' });
  assert.strictEqual(v.k, 'observar');
});

// ---------- a trava de adesão ----------

test('sem registro suficiente o app não corta, mesmo com tudo apontando para lá', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 6, forcaSubindo: false, gorduraVisual: 'sim' });
  assert.strictEqual(v.k, 'observar');
  assert.strictEqual(v.falta, 'aderencia');
  assert.ok(v.p.includes('saídas'), v.p);
});

test('10 de 14 dias ainda é pouco; 11 já serve', () => {
  const peso = pesagens([73.0, 73.6, 74.2]);
  const base = { forcaSubindo: false, gorduraVisual: 'sim' as const };
  assert.strictEqual(veredito({ peso, cintura: [] }, { ...base, diasRegistrados: 10 }).k, 'observar');
  assert.strictEqual(veredito({ peso, cintura: [] }, { ...base, diasRegistrados: 11 }).k, 'menos');
});

test('sem medir adesão nenhuma, também não mexe', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { forcaSubindo: false, gorduraVisual: 'sim' });
  assert.strictEqual(v.falta, 'aderencia');
});

// ---------- a cintura saiu do algoritmo ----------

test('cintura estourando não sobrepõe mais o peso na faixa', () => {
  // Antes ela tinha prioridade e mandava comer menos. Medir circunferência
  // parou de acontecer, e as fotos cobrem melhor a mesma pergunta.
  const v = veredito({
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  }, OK);
  assert.strictEqual(v.t, 'Manter como está', 'a cintura é informação, não veto: ' + v.p);
});

// ---------- os limites, e o caso omisso ----------

test('exatamente 0,40 não é "acima de 0,40"', () => {
  const v = veredito({ peso: pesagens([73.0, 73.40, 73.80]), cintura: [] },
                      { ...OK, gorduraVisual: 'sim' });
  assert.notStrictEqual(v.k, 'menos');
  assert.strictEqual(v.k, 'observar', 'fora da faixa-alvo, mas sem critério para agir');
});

test('exatamente 0,10 não é "abaixo de 0,10"', () => {
  const v = veredito({ peso: pesagens([73.0, 73.10, 73.20]), cintura: [] }, OK);
  assert.notStrictEqual(v.k, 'mais');
});

test('perdendo peso o texto não diz que subiu', () => {
  const v = veredito({ peso: pesagens([73.5, 73.2, 73.0]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Comer mais');
  assert.ok(!v.p.includes('subiu'), 'não pode dizer "subiu −0,30": ' + v.p);
});

test('entre 0,30 e 0,40 o caso é omisso: observar, não mexer', () => {
  const v = veredito({ peso: pesagens([73.0, 73.35, 73.70]), cintura: [] }, OK);
  assert.strictEqual(v.k, 'observar');
});

// ---------- dados insuficientes ----------

test('duas semanas não bastam: a regra pede duas TAXAS, logo três semanas', () => {
  const v = veredito({ peso: pesagens([73.0, 73.25]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Faltam dados');
});

test('semana com uma pesagem só não é média', () => {
  const W = pesagens([73.0, 73.25, 73.5]);
  const magra = W.filter((_, i) => i < 8 || i === 8);   // a última semana fica com 1
  assert.strictEqual(veredito({ peso: magra, cintura: [] }, OK).t, 'Faltam dados');
});

test('sem nada registrado pede registro', () => {
  assert.strictEqual(veredito(semCintura, OK).t, 'Faltam dados');
});

test('cintura usa média semanal, não medida solta', () => {
  const W = mediasSemanais(naSemana([
    { s: 4, dow: 1, v: 80.0 }, { s: 4, dow: 3, v: 80.4 },
    { s: 1, dow: 1, v: 82.2 }, { s: 1, dow: 3, v: 81.8 }
  ])).map(x => Math.round(x.v * 100) / 100);
  assert.strictEqual(W.length, 2, 'duas semanas, não quatro medidas soltas');
  assert.strictEqual(W[0], 80.2, 'as duas medidas da mesma semana viram média');
});

test('cintura com menos de 21 dias de base não conclui nada', () => {
  const c = cinturaMes(medidas([{ d: 13, v: 80.0 }, { d: 0, v: 82.5 }]));
  assert.strictEqual(c, null, 'salto grande em duas semanas ainda não é tendência de mês');
});

test('o ritmo é medido sobre pelo menos 12 dias', () => {
  const r = pesoRitmo(pesagens([73.0, 73.3]));
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.duasSemanas, false, 'duas semanas seguidas dão 7 dias de base, não 12');
});

// ---------- a leitura de gordura visual ----------

test('a leitura mais recente é a que vale', () => {
  const hoje = new Date();
  const iso = d => new Date(hoje.getTime() - d * 86400000).toISOString().slice(0, 10);
  const v = leituraVigente([
    { d: iso(10), de: iso(24), v: 'nao', t: Date.now() },
    { d: iso(2),  de: iso(16), v: 'sim', t: Date.now() }
  ]);
  assert.strictEqual(v, 'sim');
});

test('leitura velha não decide o presente', () => {
  const antiga = new Date(Date.now() - 40 * 86400000).toISOString().slice(0, 10);
  assert.strictEqual(
    leituraVigente([{ d: antiga, de: antiga, v: 'sim', t: Date.now() }]),
    null, 'responder hoje sobre um par de mês passado não torna o par recente');
});

test('sem leitura nenhuma é null, não "não"', () => {
  assert.strictEqual(leituraVigente([]), null);
  assert.strictEqual(leituraVigente(null), null);
  assert.strictEqual(leituraVigente(undefined), null);
});

test('a leitura velha some e o corte volta a travar', () => {
  const antiga = new Date(Date.now() - 40 * 86400000).toISOString().slice(0, 10);
  const body = { peso: pesagens([73.0, 73.6, 74.2]), cintura: [] };
  const v = veredito(body, {
    diasRegistrados: 14, forcaSubindo: false,
    gorduraVisual: leituraVigente([{ d: antiga, de: antiga, v: 'sim', t: Date.now() }])
  });
  assert.strictEqual(v.k, 'observar');
  assert.strictEqual(v.falta, 'gordura', 'evidência vencida é ausência de evidência');
});
