// O histórico do dia alimentar.
//
// Antes disto o dia era sobrescrito na virada da data: nada do que ele comeu
// sobrevivia à meia-noite, e o laço monitorar → comparar → ajustar ficava
// travado no primeiro terço. Os testes daqui guardam três coisas que é fácil
// errar: o passado não se reescreve, ausência de registro não é falha, e a
// medida é contagem, não nota.

import { test } from 'vitest';
import assert from 'node:assert';
import { ALIMENTOS_BASE, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  aderenciaDoDia, diaInterpretavel, diasInterpretaveis, excessoDoDia, fechaDia, janelaDoHistorico,
  padraoPorRefeicao, poeComidaNoDia, refeicoesDeHoje
} from '../../src/dominio/nutricao/calculo';
import type { DiaComida, DiaComidaHist } from '../../src/dominio/nutricao/tipos';

const cat = ALIMENTOS_BASE;
const dia = (extra: Partial<DiaComida> = {}): DiaComida => Object.assign({
  data: '2026-01-14', done: {}, agua: 0, escala: {}, cadencia: 'treino' as const, alta: 0 as const
}, extra);

test('o total é congelado no fechamento, contra o plano daquele dia', () => {
  const d = dia({ done: { pos: 1, almoco: 1 } });
  const h = fechaDia(d, PLANO_BASE, cat, 111, 0, 1000);
  assert.ok(h.tot.kcal > 0);
  assert.strictEqual(h.pv, 111, 'e carrega o carimbo do plano com que foi calculado');

  // o plano muda depois — o dia já fechado não se mexe
  const outro = JSON.parse(JSON.stringify(PLANO_BASE));
  outro.find((r: { id: string }) => r.id === 'almoco').itens[0].q = 100;
  const agora = fechaDia(d, outro, cat, 222, 0, 1000);
  assert.ok(agora.tot.kcal < h.tot.kcal, 'o mesmo dia daria outro número contra o plano novo');
  assert.ok(h.tot.kcal > 0, 'e é justamente por isso que o congelado tem que existir');
});

test('a aderência é ponderada pela escala, não pela contagem crua', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const cheio = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 } }),
                         PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(cheio, refs), 1);

  const meio = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                              escala: { jantar: 0.5 } }), PLANO_BASE, cat, 1, 0, 1000);
  const a = aderenciaDoDia(meio, refs)!;
  assert.ok(a < 1 && a > 0.9,
    '"marcou feito com metade" não é igual a "comeu tudo" — o app já tem esse dado');
});

test('ausência de registro NÃO é aderência zero', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const vazio = fechaDia(dia({ agua: 4 }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(vazio, refs), null,
    'ele pode ter comido perfeitamente e só não ter aberto o app');
});

test('o padrão por refeição sai em contagem, e o dia mudo não entra no denominador', () => {
  const h: DiaComidaHist[] = [
    fechaDia(dia({ data: '2026-01-10', done: { pos: 1, almoco: 1, lanche: 1 } }), PLANO_BASE, cat, 1, 0, 1),
    fechaDia(dia({ data: '2026-01-11', done: { pos: 1, almoco: 1 } }), PLANO_BASE, cat, 1, 0, 2),
    fechaDia(dia({ data: '2026-01-12', done: { pos: 1, almoco: 1 } }), PLANO_BASE, cat, 1, 0, 3),
    fechaDia(dia({ data: '2026-01-13', agua: 6 }), PLANO_BASE, cat, 1, 0, 4)   // dia mudo
  ];
  const p = padraoPorRefeicao(h, PLANO_BASE);
  const almoco = p.find(x => x.id === 'almoco')!;
  const lanche = p.find(x => x.id === 'lanche')!;
  assert.strictEqual(almoco.possiveis, 3, 'o dia sem registro nenhum fica de fora da conta');
  assert.strictEqual(almoco.feitas, 3);
  assert.strictEqual(lanche.feitas, 1, 'o lanche é o que mais falha, e a contagem diz isso');
  assert.strictEqual(lanche.possiveis, 3);
  assert.ok(!('pct' in lanche), 'contagem, nunca percentual — percentual contra 100% vira nota');
});

test('o dia guarda o ajuste calórico em vigor, para o app auditar a própria régua', () => {
  const h = fechaDia(dia({ done: { pos: 1 } }), PLANO_BASE, cat, 1, 1, 1000);
  assert.strictEqual(h.aj, 1);
  const zero = fechaDia(dia({ done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(zero.aj, undefined, 'ajuste neutro não gasta byte');
});

test('o enquadramento do dia viaja junto', () => {
  const h = fechaDia(dia({ done: { pos: 1 }, alta: 1, turno: 'noite', cadencia: 'treino' }),
                     PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(h.turno, 'noite');
  assert.strictEqual(h.alta, 1);
  assert.strictEqual(h.cadencia, 'treino');
});

test('a janela devolve os dias em ordem, do mais antigo ao mais novo', () => {
  const h = ['2026-01-01', '2026-01-20', '2026-01-14'].map(d =>
    fechaDia(dia({ data: d, done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, 1));
  const j = janelaDoHistorico(h, 14, '2026-01-20');
  assert.deepStrictEqual(j.map(x => x.d), ['2026-01-14', '2026-01-20']);
});

test('um dia inteiramente mudo não vira linha nenhuma', () => {
  // o `fechaDia` monta o registro; quem decide se ele vale a pena é o casco.
  // Aqui garantimos que pelo menos o registro sai coerente e vazio.
  const h = fechaDia(dia(), PLANO_BASE, cat, 1, 0, 1000);
  assert.deepStrictEqual(h.done, {});
  assert.strictEqual(h.tot.kcal, 0);
});

// ---------- os agregados que a tela mostra ----------

import {
  aderenciaPorSemana, contagemDaRefeicao, recorteDoHistorico, trocasDeAjuste
} from '../../src/dominio/nutricao/calculo';

const cheio = { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 };
const hist = (dias: Array<[string, Record<string, 1>, Partial<DiaComida>?]>) =>
  dias.map(([d, done, extra]) =>
    fechaDia(dia(Object.assign({ data: d, done }, extra || {})), PLANO_BASE, cat, 1, 0, 1));

test('a contagem da refeição ignora dias sem registro nenhum', () => {
  const h = hist([
    ['2026-01-10', { pos: 1, almoco: 1 }],
    ['2026-01-11', { pos: 1 }],
    ['2026-01-12', {} as Record<string, 1>],
    ['2026-01-13', { pos: 1, almoco: 1 }]
  ]);
  const c = contagemDaRefeicao(h, PLANO_BASE, 'almoco', 20, '2026-01-14');
  assert.strictEqual(c.possiveis, 3, 'o dia mudo não entra no denominador');
  assert.strictEqual(c.feitas, 2);
});

test('o recorte conta DIAS INTEIROS cumpridos, e o dia mudo fica de fora', () => {
  const h = hist([
    ['2026-01-10', cheio],
    ['2026-01-11', { pos: 1 }],
    ['2026-01-12', {} as Record<string, 1>]
  ]);
  const r = recorteDoHistorico(h, PLANO_BASE, () => 'tudo');
  assert.strictEqual(r[0].dias, 2, 'dois dias com registro');
  assert.strictEqual(r[0].feitos, 1, 'um deles inteiro');
});

test('a aderência por semana é null onde não houve registro', () => {
  const agora = new Date('2026-01-14T12:00:00').getTime();
  const s = aderenciaPorSemana([], PLANO_BASE, 4, agora);
  assert.strictEqual(s.length, 4);
  assert.ok(s.every(x => x === null), 'buraco é buraco, não é zero');
});

test('a auditoria acha a troca de ajuste e a aderência da semana anterior', () => {
  const dias: DiaComidaHist[] = [];
  // 7 dias de aderência baixa, depois a régua muda para +150
  for (let i = 1; i <= 7; i++) {
    dias.push(fechaDia(dia({ data: '2026-01-0' + i, done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, i));
  }
  dias.push(fechaDia(dia({ data: '2026-01-08', done: { pos: 1 } }), PLANO_BASE, cat, 1, 1, 8));
  const t = trocasDeAjuste(dias, PLANO_BASE);
  assert.strictEqual(t.length, 1);
  assert.strictEqual(t[0].de, 0);
  assert.strictEqual(t[0].para, 1);
  assert.ok(t[0].aderencia! < 0.55,
    'a régua disparou sobre uma semana mal executada — é isso que o app aponta');
});

test('sem troca de ajuste não há auditoria a fazer', () => {
  const h = hist([['2026-01-10', cheio], ['2026-01-11', cheio]]);
  assert.deepStrictEqual(trocasDeAjuste(h, PLANO_BASE), []);
});

// ---------- o que a migração 9 → 10 pôs no fechamento ----------

test('o instante de cada marca atravessa o fechamento', () => {
  // A fixture do plano 9 registra o defeito: `fechaDia` carimbava TODAS as
  // marcas com a hora do fechamento, porque o dia corrente não tinha a hora de
  // cada uma. Um dia inteiro aparecia marcado na mesma hora.
  const manha = 1791000000000, tarde = 1791040000000;
  const h = fechaDia(dia({ done: { pos: manha, lanche: tarde } }), PLANO_BASE, cat, 1, 0, 1791090000000);
  assert.strictEqual(h.done.pos, manha);
  assert.strictEqual(h.done.lanche, tarde);
});

test('marca sem instante cai para a hora do fechamento, que é o que se sabe', () => {
  const h = fechaDia(dia({ done: { pos: 1 } }), PLANO_BASE, cat, 1, 0, 1791090000000);
  assert.strictEqual(h.done.pos, 1791090000000,
    'não dá para inventar a hora; a do fechamento é a única verdadeira disponível');
});

test('`como` desce ao histórico só para refeição que foi marcada', () => {
  const h = fechaDia(dia({ done: { pos: 1791000000000 }, como: { pos: 'fora', jantar: 'nao' } }),
                     PLANO_BASE, cat, 1, 0, 1791090000000);
  assert.deepStrictEqual(h.como, { pos: 'fora' },
    '`como` é atributo da marca: solto, afirmaria algo sobre uma refeição que o dia não registra');
});

test('"não contei a água" desce como fato, e cai se houver copo', () => {
  const sem = fechaDia(dia({ done: { pos: 1791000000000 }, aguaNaoContada: 1 }),
                       PLANO_BASE, cat, 1, 0, 1791090000000);
  assert.strictEqual(sem.aguaNaoContada, 1, 'zero copo e "não contei" não são o mesmo dia');
  assert.strictEqual(sem.agua, 0);

  const com = fechaDia(dia({ done: { pos: 1791000000000 }, agua: 6, aguaNaoContada: 1 }),
                       PLANO_BASE, cat, 1, 0, 1791090000000);
  assert.strictEqual(com.aguaNaoContada, undefined, 'contou: o fato não se sustenta');
  assert.strictEqual(com.agua, 6);
});

// ---------- as regras do nutricionista ----------
// Três, e as três valem para trás. O que torna isso possível sem reescrever o
// histórico é que a ADERÊNCIA é leitura derivada: ela lê `done` e `escala` do
// dia congelado contra o PLANO DE HOJE, a cada chamada. O que está congelado é
// `tot` — calorias e macros —, e a aderência não o usa.

test('uma refeição que entra no plano muda o denominador de todo dia, sem tocar no congelado', () => {
  // É a regra da ceia, e o motivo de ela valer para trás de graça: o dono
  // acrescenta a refeição ao plano e a conta de ontem se refaz na leitura.
  const h = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 } }),
                     PLANO_BASE, cat, 1, 0, 1000);
  const kcalCongelado = h.tot.kcal;

  const seis = refeicoesDeHoje(PLANO_BASE, true, false);
  assert.strictEqual(seis.length, 6, 'o plano de hoje tem seis refeições em dia de treino');
  assert.strictEqual(aderenciaDoDia(h, seis), 1, 'seis de seis');

  // o plano ganha uma refeição — a ceia, que hoje não existe no PLANO_BASE
  const comCeia = JSON.parse(JSON.stringify(PLANO_BASE));
  comCeia.push({ id: 'ceia', t: '22:00', n: 'Ceia', tag: '', quando: 'sempre', itens: [] });
  const sete = refeicoesDeHoje(comCeia, true, false);
  assert.strictEqual(sete.length, 7);

  const a = aderenciaDoDia(h, sete)!;
  assert.ok(Math.abs(a - 6 / 7) < 1e-9, 'o MESMO dia passa a ser seis de sete');
  assert.strictEqual(h.tot.kcal, kcalCongelado,
    'e o total congelado não é tocado: ele é o registro do que foi contado na época');
});

test('"não comi" conta o dia e vale zero naquela refeição', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const h = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                           como: { jantar: 'nao' } }), PLANO_BASE, cat, 1, 0, 1000);

  assert.strictEqual(diaInterpretavel(h), true,
    'dia honesto não pode valer menos que dia esquecido');
  const a = aderenciaDoDia(h, refs)!;
  assert.ok(Math.abs(a - 5 / 6) < 1e-9, 'cinco de seis: o jantar declarado não entra');
});

test('o dia em que ele não comeu nada é dia conhecido, com aderência zero', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const h = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                           como: { pre: 'nao', treino: 'nao', pos: 'nao', almoco: 'nao',
                                   lanche: 'nao', jantar: 'nao' } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(diaInterpretavel(h), true, 'o app sabe exatamente o que entrou: nada');
  assert.strictEqual(aderenciaDoDia(h, refs), 0);
  assert.strictEqual(h.tot.kcal, 0, 'e o total congelado não soma refeição que ele disse não ter comido');
});

test('"saí do plano" numa refeição conta como cumprida, com a procedência', () => {
  // Ele comeu; só não foi aquilo. O app só tem os números do plano, e a marca é
  // a procedência dizendo que o número é do prescrito.
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const h = fechaDia(dia({ done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                           como: { almoco: 'fora' } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(h, refs), 1);
  assert.strictEqual(h.como!.almoco, 'fora', 'mas o dia carrega que o almoço não foi o do plano');
  assert.ok(h.tot.kcal > 0);
});

test('a aderência não passa de 100%, e o excesso é medido à parte', () => {
  // A régua de porções do app vai até 1½. Sem teto, comer mais que o plano
  // aparecia como aderir MELHOR do que aderir — e `recorteDoHistorico` contava
  // o dia como cumprido por causa do excedente, não do cumprimento.
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const todas = { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 };

  const cheio = fechaDia(dia({ done: todas }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(cheio, refs), 1);
  assert.strictEqual(excessoDoDia(cheio, refs), 0, 'seguiu o plano: nada acima');

  const comeuMais = fechaDia(dia({ done: todas, escala: { almoco: 1.5 } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(aderenciaDoDia(comeuMais, refs), 1,
    'cumprir uma refeição é cumpri-la; mais que ela não é mais cumprimento');
  const ex = excessoDoDia(comeuMais, refs)!;
  assert.ok(Math.abs(ex - 0.5 / 6) < 1e-9, 'meia porção de seis refeições');

  // e o excesso não compensa a falta: são duas leituras, não uma soma
  const faltouEComeuMais = fechaDia(dia({ done: todas, escala: { almoco: 1.5, jantar: 0.5 } }),
                                    PLANO_BASE, cat, 1, 0, 1000);
  const a = aderenciaDoDia(faltouEComeuMais, refs)!;
  assert.ok(Math.abs(a - 5.5 / 6) < 1e-9, 'metade do jantar continua pesando contra');
  assert.ok(Math.abs(excessoDoDia(faltouEComeuMais, refs)! - 0.5 / 6) < 1e-9);
});

test('o excesso ignora a refeição que ele declarou não ter comido', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  const h = fechaDia(dia({ done: { pos: 1, almoco: 1 }, escala: { almoco: 1.5 },
                           como: { almoco: 'nao' } }), PLANO_BASE, cat, 1, 0, 1000);
  assert.strictEqual(excessoDoDia(h, refs), 0, 'não comeu: não há excedente a medir');
});

test('"não comi" não conta como refeição cumprida no padrão por refeição', () => {
  // Esta leitura responde "qual refeição eu mais falho". Contar um pulo
  // declarado como acerto a faria apontar para o lado errado.
  const h: DiaComidaHist[] = [
    fechaDia(dia({ data: '2026-01-10', done: { pos: 1, jantar: 1 } }), PLANO_BASE, cat, 1, 0, 1),
    fechaDia(dia({ data: '2026-01-11', done: { pos: 1, jantar: 1 }, como: { jantar: 'nao' } }),
             PLANO_BASE, cat, 1, 0, 2)
  ];
  const p = padraoPorRefeicao(h, PLANO_BASE);
  const jantar = p.filter(x => x.id === 'jantar')[0];
  assert.strictEqual(jantar.possiveis, 2, 'os dois dias entram no denominador');
  assert.strictEqual(jantar.feitas, 1, 'e só um deles foi cumprido');
});

// ---------- pôr comida num dia de data arbitrária ----------
// A tarefa que o app não tinha: `diaDeComida()` carimba o dia com a data,
// `fechaDiaDeComida` congela o dia velho na virada e `marcaRefeicao` escreve
// sempre no dia corrente. Não havia caminho para a terça que ele esqueceu.

const HOJE = '2026-01-14';
const AGORA = new Date('2026-01-14T21:00:00').getTime();

function poe(hist: DiaComidaHist[], data: string, c: Parameters<typeof poeComidaNoDia>[2],
             ajuste: number | null = 0) {
  return poeComidaNoDia(hist, data, c, PLANO_BASE, cat, HOJE, 777, ajuste, AGORA);
}

test('um dia passado ganha linha, com o total congelado e o carimbo do plano', () => {
  const r = poe([], '2026-01-11', { done: { pos: 1, almoco: 1 }, agua: 6, cadencia: 'descanso' });
  assert.strictEqual(r.recusa, null);
  assert.strictEqual(r.hist.length, 1);
  assert.strictEqual(r.dia!.d, '2026-01-11');
  assert.strictEqual(r.dia!.agua, 6);
  assert.strictEqual(r.dia!.cadencia, 'descanso');
  assert.ok(r.dia!.tot.kcal > 0, 'o total é congelado agora, como em qualquer fechamento');
  assert.strictEqual(r.dia!.pv, 777, 'e carrega a procedência do plano com que foi contado');
  assert.strictEqual(r.dia!.m, AGORA, 'o carimbo de alteração é o instante de quem chamou');
});

test('o instante da marca é de quem chama: a função não lê relógio', () => {
  const marcado = new Date('2026-01-11T12:40:00').getTime();
  const r = poe([], '2026-01-11', { done: { almoco: marcado } });
  assert.strictEqual(r.dia!.done.almoco, marcado);

  // sem instante aproveitável, cai para o `agora` recebido — nunca para
  // `Date.now()`, que escaparia da porta pela qual o teste viaja no tempo
  const sem = poe([], '2026-01-11', { done: { almoco: 1 } });
  assert.strictEqual(sem.dia!.done.almoco, AGORA);
});

test('hoje também é data arbitrária', () => {
  const r = poe([], HOJE, { done: { pos: 1 } });
  assert.strictEqual(r.recusa, null);
  assert.strictEqual(r.dia!.d, HOJE);
});

test('data futura é recusada: dia que não aconteceu não se registra', () => {
  const r = poe([], '2026-01-15', { done: { pos: 1 } });
  assert.strictEqual(r.recusa, 'futuro');
  assert.strictEqual(r.dia, null);
  assert.deepStrictEqual(r.hist, [], 'e nada é gravado');
});

test('data ilegível é recusada em vez de virar linha com chave torta', () => {
  // `d` é a chave natural do histórico e a chave da fusão. Uma linha com data
  // inválida nunca mais seria alcançada por lápide nenhuma.
  ['ontem', '2026-1-4', '', '2026-01-14T10:00'].forEach(function (d) {
    const r = poe([], d, { done: { pos: 1 } });
    assert.strictEqual(r.recusa, 'data', d + ' devia ser recusada');
    assert.deepStrictEqual(r.hist, []);
  });
});

test('pôr em dia COMPLETA a linha que existe, em vez de apagar o resto dela', () => {
  // "marquei o jantar que esqueci" não pode virar "apaguei o resto da terça".
  const antes = poe([], '2026-01-11', { done: { pos: 1, almoco: 1 }, agua: 5, turno: 'noite' }).hist;
  const r = poe(antes, '2026-01-11', { done: { jantar: 1 }, escala: { jantar: 0.5 } });

  assert.strictEqual(r.hist.length, 1, 'não duplica: a data é a chave natural');
  assert.deepStrictEqual(Object.keys(r.dia!.done).sort(), ['almoco', 'jantar', 'pos']);
  assert.strictEqual(r.dia!.agua, 5, 'a água que já estava lá fica');
  assert.strictEqual(r.dia!.turno, 'noite', 'e o turno também');
  assert.strictEqual(r.dia!.escala.jantar, 0.5);
});

test('o que vem agora vence o que estava, chave a chave', () => {
  const antes = poe([], '2026-01-11', { done: { almoco: 1 }, escala: { almoco: 1 }, agua: 2 }).hist;
  const r = poe(antes, '2026-01-11', { escala: { almoco: 0.5 }, agua: 9, como: { almoco: 'fora' } });
  assert.strictEqual(r.dia!.escala.almoco, 0.5, 'corrigir a porção de um dia passado é o caso de uso');
  assert.strictEqual(r.dia!.agua, 9);
  assert.strictEqual(r.dia!.como!.almoco, 'fora');
});

test('o total é recontado quando as marcas mudam — e só por isso', () => {
  // O congelamento protege o passado de mudança no PLANO, não de mudança nas
  // MARCAS: elas mudaram agora, de propósito.
  const antes = poe([], '2026-01-11', { done: { pos: 1 } }).hist;
  const so = antes[0].tot.kcal;
  const r = poe(antes, '2026-01-11', { done: { almoco: 1 } });
  assert.ok(r.dia!.tot.kcal > so, 'duas refeições somam mais que uma');
});

test('dia que continua mudo não vira linha', () => {
  const r = poe([], '2026-01-11', {});
  assert.strictEqual(r.recusa, 'mudo');
  assert.deepStrictEqual(r.hist, [],
    'guardar um dia vazio como zero seria dizer que ele não comeu');

  // água declarada como não contada JÁ é informação sobre o dia
  const comFato = poe([], '2026-01-11', { aguaNaoContada: 1 });
  assert.strictEqual(comFato.recusa, null);
  assert.strictEqual(comFato.dia!.aguaNaoContada, 1);
});

test('chamada que não muda nada não reescreve a linha nem adianta o carimbo', () => {
  // Apagar um dia do histórico é destrutivo e não foi desenhado: esta função
  // acrescenta, não remove. E bumpar `m` sem mudança faria este aparelho
  // afirmar ser a cópia mais nova de um dia que ele não tocou.
  const antes = poe([], '2026-01-11', { done: { pos: 1 } }).hist;
  const r = poe(antes, '2026-01-11', {});
  assert.strictEqual(r.recusa, null);
  assert.strictEqual(r.hist.length, 1);
  assert.deepStrictEqual(r.hist[0], antes[0], 'a linha fica exatamente como estava');
  assert.strictEqual(r.dia, antes[0]);
});

test('o histórico de entrada não é tocado, e o de saída sai em ordem de data', () => {
  const original: DiaComidaHist[] = [];
  const um = poe(original, '2026-01-12', { done: { pos: 1 } }).hist;
  assert.deepStrictEqual(original, [], 'função pura: devolve outro array');

  const dois = poe(um, '2026-01-09', { done: { pos: 1 } }).hist;
  const tres = poe(dois, '2026-01-11', { done: { pos: 1 } }).hist;
  assert.deepStrictEqual(tres.map(x => x.d), ['2026-01-09', '2026-01-11', '2026-01-12']);
  assert.strictEqual(um.length, 1, 'e as chamadas anteriores continuam com o que tinham');
});

test('o ajuste em vigor naquele dia é de quem chama; `null` preserva o que havia', () => {
  const antes = poe([], '2026-01-11', { done: { pos: 1 } }, -2).hist;
  assert.strictEqual(antes[0].aj, -2);
  const mantem = poe(antes, '2026-01-11', { done: { almoco: 1 } }, null);
  assert.strictEqual(mantem.dia!.aj, -2, 'o passo da época não é sobrescrito pelo de hoje');
  const troca = poe(antes, '2026-01-11', { done: { almoco: 1 } }, 1);
  assert.strictEqual(troca.dia!.aj, 1);
});

test('o dia posto em dia entra nas leituras como qualquer outro', () => {
  // É o ponto: pôr o dia em dia tem que mover o portão de 11 em 14 e a
  // aderência da semana, senão registrar o passado não serve para nada.
  let hist: DiaComidaHist[] = [];
  ['2026-01-10', '2026-01-11', '2026-01-12'].forEach(function (d) {
    hist = poe(hist, d, { done: { pre: 1, treino: 1, pos: 1, almoco: 1, lanche: 1, jantar: 1 },
                          cadencia: 'treino' }).hist;
  });
  assert.strictEqual(diasInterpretaveis(hist, 14, HOJE), 3);

  const refs = refeicoesDeHoje(PLANO_BASE, true, false);
  assert.strictEqual(aderenciaDoDia(hist[0], refs), 1);

  // e um dia honesto de "não comi" conta igual
  hist = poe(hist, '2026-01-13', { done: { pos: 1, almoco: 1 }, como: { almoco: 'nao' },
                                   cadencia: 'descanso' }).hist;
  assert.strictEqual(diasInterpretaveis(hist, 14, HOJE), 4);
  assert.strictEqual(hist[3].como!.almoco, 'nao');
});
