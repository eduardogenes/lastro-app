// As três regras de ajuste da dieta, nos limites exatos.
//
// Antes cada um destes casos custava subir o app inteiro num jsdom para ler um
// parágrafo da tela. A regra é função pura: recebe as marcas, devolve o
// veredito. Testar assim custa microssegundos — e por isso dá para cobrir os
// limites, o sinal negativo e a precedência da cintura sem pensar duas vezes.

import { test } from 'vitest';
import assert from 'node:assert';
import { cinturaMes, leituraVigente, mediasSemanais, MEDIDAS_DE_FITA, leituraDaEvolucao, ondeMediu, pesoRitmo, portoesDaRegra, semanasDaRegra, semanaEmCurso, veredito } from '../../src/dominio/corpo';
import { medidas, naSemana, pesagens } from './ajuda';

const semCintura = { peso: [] as ReturnType<typeof pesagens>, cintura: [] };

// Registrado o bastante e força parada: o cenário em que a regra PODE agir.
// Passar isto explicitamente é o ponto — sem adesão registrada, nada muda.
const OK = { diasRegistrados: 14, forcaSubindo: false };

test('ganho travado por 2 semanas, com força parada, manda comer mais', () => {
  const v = veredito({ peso: pesagens([73.0, 73.05, 73.10]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Comer mais 150 kcal');
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
  assert.strictEqual(v.t, 'Não mexer: a taxa está na faixa');
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
  assert.strictEqual(v.t, 'Comer menos 150 kcal');
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
  assert.strictEqual(v.t, 'Não mexer: falta a avaliação das fotos');
  // a parte da regra que mais surpreende fica escrita (semana, estado 5)
  assert.ok(v.p.includes('Se as fotos não mostrarem piora, o certo é manter'), v.p);
});

test('fotos inconclusivas também não cortam', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] },
                      { diasRegistrados: 14, forcaSubindo: false, gorduraVisual: 'incerto' });
  assert.strictEqual(v.k, 'observar');
  // "incerto" também é resposta: a leitura não FALTA, e a tela não a pede de novo
  assert.strictEqual(v.falta, undefined);
  assert.strictEqual(v.t, 'Não mexer: a avaliação das fotos ficou incerta');
  assert.ok(v.p.includes('a regra mantém a comida como está'), v.p);
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
  assert.strictEqual(v.t, 'Não mexer: a taxa está na faixa', 'a cintura é informação, não veto: ' + v.p);
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

test('exatamente 0,10 não é "abaixo de 0,10" nem quando o ponto flutuante empurra para baixo', () => {
  // Este passava por sorte: em 73,0 → 73,1 → 73,2 o ruído cai para lados
  // opostos e só uma das taxas fica "abaixo". Em 70,1 → 70,2 → 70,3 as duas
  // diferenças dão 0,0999…, e a regra mandava comer mais com taxa exata de 0,10.
  const v = veredito({ peso: pesagens([70.1, 70.2, 70.3]), cintura: [] }, OK);
  assert.notStrictEqual(v.k, 'mais', v.t);
});

test('perdendo peso o texto não diz que subiu', () => {
  const v = veredito({ peso: pesagens([73.5, 73.2, 73.0]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Comer mais 150 kcal');
  assert.ok(!v.p.includes('subiu'), 'não pode dizer "subiu −0,30": ' + v.p);
});

test('entre 0,30 e 0,40 o caso é omisso: observar, não mexer', () => {
  const v = veredito({ peso: pesagens([73.0, 73.35, 73.70]), cintura: [] }, OK);
  assert.strictEqual(v.k, 'observar');
});

// ---------- dados insuficientes ----------

test('duas semanas não bastam: a regra pede duas TAXAS, logo três semanas', () => {
  const v = veredito({ peso: pesagens([73.0, 73.25]), cintura: [] }, OK);
  assert.strictEqual(v.t, 'Não mexer: faltam pesagens');
});

test('semana com uma pesagem só não é média', () => {
  const W = pesagens([73.0, 73.25, 73.5]);
  const magra = W.filter((_, i) => i < 8 || i === 8);   // a última semana fica com 1
  assert.strictEqual(veredito({ peso: magra, cintura: [] }, OK).t, 'Não mexer: faltam pesagens');
});

test('sem nada registrado pede registro', () => {
  assert.strictEqual(veredito(semCintura, OK).t, 'Não mexer: faltam pesagens');
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

// ---------------------------------------------------------------------------
// As medidas com fita — a decisão 2a do dono, e a lista da Direção D
// ---------------------------------------------------------------------------

test('seis pontos com fita, todos em cm, e só cintura e braço vêm ligados', () => {
  // A lista é da D, tirada da resposta dele: "braço, cintura, essas coisas
  // principais que dá pra eu medir sozinho" (P6). Os dois que ele nomeou vêm
  // ligados; os outros esperam um toque, e ligar não cria cobrança.
  assert.deepStrictEqual(MEDIDAS_DE_FITA.map(m => m.k),
    ['cintura', 'braco', 'coxa', 'panturrilha', 'peito', 'quadril']);
  assert.ok(MEDIDAS_DE_FITA.every(m => m.u === 'cm' && !m.bio), 'fita mede em cm, e não é balança');
  assert.deepStrictEqual(MEDIDAS_DE_FITA.filter(m => m.fita === 'ligada').map(m => m.k),
    ['cintura', 'braco']);
  assert.ok(MEDIDAS_DE_FITA.every(m => typeof m.partida === 'number'),
    'todo ponto com fita tem de onde o stepper partir');
});

test('o lembrete de como ele mediu é o texto da medida mais recente que tem um', () => {
  // Guardado "na primeira vez" e devolvido nas seguintes, que normalmente vêm
  // sem texto: medida sem texto NÃO apaga o lembrete.
  const serie = [
    { t: 1, v: 36, onde: 'no meio do bíceps' },
    { t: 3, v: 36.5 },
    { t: 2, v: 36.2, onde: '  dois dedos acima do cotovelo  ' },
    { t: 4, v: 36.6, onde: '   ' }
  ];
  assert.strictEqual(ondeMediu(serie), 'dois dedos acima do cotovelo',
    'o mais recente COM texto, aparado; espaço em branco não é texto');
  assert.strictEqual(ondeMediu([{ t: 1, v: 36 }]), null, 'sem texto nenhum, não há lembrete');
  assert.strictEqual(ondeMediu(undefined), null, 'e série ausente não estoura');
});

// ---------- os portões da regra, e o vazio dela (§6.2 e §6.4 da frente 3) ----------


const FORCA = { forca: { delta: 0.004, base: 7, ok: true } };

test('peso parado: os portões são taxa, força e adesão, com o estado na palavra', () => {
  const p = portoesDaRegra({ peso: pesagens([73.0, 73.05, 73.10]) }, { diasRegistrados: 14, forcaSubindo: false }, FORCA)!;
  assert.deepStrictEqual(p.map(x => x.k), ['taxa', 'forca', 'adesao']);
  assert.strictEqual(p[0].t, 'Taxa: cumprida — +0,05 e +0,05 kg/semana');
  assert.ok(/^duas semanas seguidas abaixo de 0,10 · três semanas com média válida \(\d\d\/\d\d, \d\d\/\d\d, \d\d\/\d\d\)$/.test(p[0].d), p[0].d);
  assert.strictEqual(p[1].t, 'Força: cumprida — não está subindo', 'o portão se cumpre quando a força NÃO sobe');
  assert.strictEqual(p[1].d, '+0,4% em 2 semanas, sobre 7 exercícios — abaixo de 1%, que é ruído de anilha');
  assert.strictEqual(p[1].acao, 'ver-forca');
  assert.strictEqual(p[2].t, 'Adesão: cumprida — 14 dias de 14');
});

test('a força subindo deixa o portão dela em falta', () => {
  const p = portoesDaRegra({ peso: pesagens([73.0, 73.05, 73.10]) }, { diasRegistrados: 14, forcaSubindo: true }, FORCA)!;
  assert.strictEqual(p[1].ok, false);
  assert.strictEqual(p[1].t, 'Força: falta — está subindo');
});

test('a adesão diz quantos faltam e quantos ainda dá para preencher', () => {
  const um = portoesDaRegra({ peso: pesagens([73.0, 73.05, 73.10]) }, { diasRegistrados: 1 }, FORCA)!;
  const a = um.filter(x => x.k === 'adesao')[0];
  assert.strictEqual(a.t, 'Adesão: falta — 1 dia de 14');
  assert.strictEqual(a.d, 'a regra pede 11. Faltam 10 dias com consumo conhecido, e 13 dos 14 ainda podem ser preenchidos');
  assert.strictEqual(a.acao, 'por-em-dia');
  const dez = portoesDaRegra({ peso: pesagens([73.0, 73.05, 73.10]) }, { diasRegistrados: 10 }, FORCA)!;
  assert.ok(/Falta 1 dia com consumo conhecido/.test(dez.filter(x => x.k === 'adesao')[0].d));
  const onze = portoesDaRegra({ peso: pesagens([73.0, 73.05, 73.10]) }, { diasRegistrados: 11 }, FORCA)!;
  assert.strictEqual(onze.filter(x => x.k === 'adesao')[0].d, 'o mínimo da regra. 10 de 14 não bastaria');
});

test('peso subindo rápido: a força não entra, e a avaliação das fotos entra', () => {
  const par = { de: Date.now() - 16 * 86400000, ate: Date.now() };
  const p = portoesDaRegra({ peso: pesagens([73.0, 73.5, 74.0]) }, { diasRegistrados: 12 }, { par: par })!;
  assert.deepStrictEqual(p.map(x => x.k), ['taxa', 'adesao', 'visual']);
  assert.ok(/acima de 0,40/.test(p[0].d), p[0].d);
  const v = p[2];
  assert.strictEqual(v.t, 'Avaliação visual: falta — sem resposta');
  assert.ok(/^há par válido: \d\d\/\d\d e \d\d\/\d\d, 16 dias — a pergunta vale para pares de 10 a 28 dias$/.test(v.d), v.d);
  assert.strictEqual(v.acao, 'responder');
  const semPar = portoesDaRegra({ peso: pesagens([73.0, 73.5, 74.0]) }, { diasRegistrados: 12 })!;
  assert.strictEqual(semPar[2].acao, undefined, 'sem par não há o que responder: o botão não existe');
  const sim = portoesDaRegra({ peso: pesagens([73.0, 73.5, 74.0]) }, { diasRegistrados: 12, gorduraVisual: 'sim' }, { par: par })!;
  assert.strictEqual(sim[2].t, 'Avaliação visual: cumprida — aumentou claramente');
});

test('fora dos dois ramos que dão passo, não há portão nenhum', () => {
  assert.strictEqual(portoesDaRegra({ peso: pesagens([73.0, 73.1, 73.85]) }, { diasRegistrados: 14 }), null,
    'uma semana sozinha não decide, e mostrar portão seria sugerir decisão');
  assert.strictEqual(portoesDaRegra({ peso: pesagens([73.0, 73.2]) }, { diasRegistrados: 14 }), null, 'sem semanas, nada');
});

test('o vazio lista as semanas com o motivo de cada uma', () => {
  const agora = Date.now();
  const peso = naSemana([
    { s: 3, dow: 1, v: 73 }, { s: 3, dow: 3, v: 73 },
    { s: 2, dow: 2, v: 73 },
    { s: 1, dow: 1, v: 73 }, { s: 1, dow: 3, v: 73 }, { s: 1, dow: 5, v: 73 },
  ]).concat(new Date(agora).getDay() > 0 ? naSemana([{ s: 0, dow: 0, v: 73 }]) : []);
  const ws = semanasDaRegra(peso, agora);
  assert.strictEqual(ws.length, 4);
  assert.deepStrictEqual(ws.slice(1).map(w => w.estado), ['média válida', 'buraco: quebra a sequência', 'média válida']);
  const faltam = 6 - new Date(agora).getDay();
  assert.strictEqual(ws[0].estado, 'em curso' + (faltam > 0 ? ' · ' + (faltam === 1 ? 'falta 1 dia' : 'faltam ' + faltam + ' dias') : ''));
  assert.ok(/^\d\d\/\d\d a \d\d\/\d\d$/.test(ws[0].intervalo), ws[0].intervalo);
  assert.strictEqual(ws[2].n, 1);
});

// ---------- o destino Evolução (a D, corpo.html estado 8; §1.7 da frente 3) ----------

test('a Evolução lê as médias que a regra lê, os pontos do dia e a taxa de cada semana', () => {
  const agora = Date.now();
  const peso = naSemana([
    { s: 3, dow: 1, v: 73.0 }, { s: 3, dow: 3, v: 73.2 },
    { s: 2, dow: 1, v: 73.4 }, { s: 2, dow: 3, v: 73.4 },
    { s: 1, dow: 1, v: 73.5 },
  ]).concat(new Date(agora).getDay() >= 2 ? naSemana([{ s: 0, dow: 0, v: 73.6 }, { s: 0, dow: 1, v: 73.6 }]) : []);
  const L = leituraDaEvolucao(peso, agora);
  assert.strictEqual(L.n, peso.length, 'todas as pesagens do intervalo viram ponto');
  assert.ok(L.semanas.every(w => w.n >= 2), 'a linha só passa onde a regra lê');
  assert.strictEqual(L.taxas.length, 4);
  const duas = L.taxas[2];
  assert.ok(Math.abs((duas.kg as number) - 0.3) < 1e-9, 'a de duas semanas atrás é +0,30 sobre a anterior');
  assert.strictEqual(duas.classe, 'no alvo', '0,30 é o teto do alvo, e ainda é alvo');
  assert.strictEqual(L.taxas[1].kg, null);
  assert.strictEqual(L.taxas[1].classe, 'sem taxa: a semana não tem média', 'uma pesagem não é média');
  assert.strictEqual(L.taxas[1].nota, '1 pesagem');
  assert.ok(L.taxas[0].nota.indexOf('em curso · ') === 0);
});

test('a classe da taxa segue o alvo do nutricionista, de 0,15 a 0,30', () => {
  const agora = Date.now();
  const comTaxa = function (kg: number) {
    const peso = naSemana([
      { s: 2, dow: 1, v: 73 }, { s: 2, dow: 3, v: 73 },
      { s: 1, dow: 1, v: 73 + kg }, { s: 1, dow: 3, v: 73 + kg },
    ]);
    return leituraDaEvolucao(peso, agora).taxas[1].classe;
  };
  assert.strictEqual(comTaxa(0.05), 'abaixo do alvo');
  assert.strictEqual(comTaxa(0.20), 'no alvo');
  assert.strictEqual(comTaxa(0.45), 'acima do alvo');
});

// ---------- a semana em curso sem média (a D, corpo, estado 9) ----------

/** Sexta, 2 de outubro de 2026, 21h32: a semana começa no domingo, 27/09. */
const SEXTA = new Date(2026, 9, 2, 21, 32).getTime();
const em = (dia: number, h: number, m: number, v: number) => ({ t: new Date(2026, 8, dia, h, m).getTime(), v });

test('uma pesagem só na semana: o que falta, quantos dias restam, e o que para', () => {
  const s = semanaEmCurso([em(28, 6, 40, 73.6)], SEXTA)!;
  assert.ok(s, 'a semana não tem média');
  assert.strictEqual(s.nota, 'esta semana · 1 pesagem');
  assert.strictEqual(s.falta, 'Faltam 2 dias na semana e 1 pesagem para a média valer. ' +
    'Sem ela, a sequência de três semanas se quebra e a regra do nutricionista volta a “pedir pesagens”.');
  assert.deepStrictEqual(s.trechos.map(t => [t.rotulo, t.v, t.hora]), [
    ['dom 27/09', 'sem pesagem', null],
    ['seg 28/09', '73,6 kg', '6h40'],
    ['ter 29/09 · qua 30/09 · qui 01/10', 'sem pesagem', null],
    ['sex 02/10 · sáb 03/10', 'ainda dá tempo', null]
  ]);
});

test('pesado hoje, hoje não conta mais como dia que dá tempo', () => {
  const s = semanaEmCurso([new Date(2026, 9, 2, 7, 0).getTime()].map(t => ({ t, v: 73.2 })), SEXTA)!;
  assert.ok(s.falta.startsWith('Falta 1 dia na semana e 1 pesagem'), s.falta);
  assert.strictEqual(s.trechos[s.trechos.length - 1].rotulo, 'sáb 03/10');
});

test('sem dias que bastem, a semana diz que não dá mais tempo', () => {
  const sabado = new Date(2026, 9, 3, 20, 0).getTime();
  const s = semanaEmCurso([], sabado)!;
  assert.ok(s.falta.startsWith('Não dá mais tempo: resta 1 dia e faltam 2 pesagens.'), s.falta);
  const s2 = semanaEmCurso([{ t: new Date(2026, 9, 3, 7, 0).getTime(), v: 73 }], sabado)!;
  assert.ok(s2.falta.startsWith('Não dá mais tempo: a semana não tem mais dias e falta 1 pesagem.'), s2.falta);
});

test('com a semana valendo, não há o que cobrar', () => {
  assert.strictEqual(semanaEmCurso([em(28, 6, 40, 73.6), em(30, 6, 50, 73.4)], SEXTA), null);
});

test('o medido é a média das quatro semanas fechadas antes desta', () => {
  // 11 pesagens nas quatro semanas anteriores: 2,75 por semana
  const w = new Date(2026, 8, 27).getTime();
  const quatro = Array.from({ length: 11 }, (_, i) => ({ t: w - 28 * 86400000 + i * 2.5 * 86400000 + 3600000, v: 73 }));
  const s = semanaEmCurso(quatro.concat([em(28, 6, 40, 73.6)]), SEXTA)!;
  assert.strictEqual(s.medido, 'No medido, nas quatro semanas anteriores, foram 2,75.');
  assert.strictEqual(semanaEmCurso([em(28, 6, 40, 73.6)], SEXTA)!.medido, null, 'sem histórico, nada a medir');
});
