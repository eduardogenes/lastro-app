// As leituras do mês em Dias (a D, dias.html estado 1): dias com treino por
// semana em média móvel, contando DIAS; e o horário de início, com o que fica
// de fora dito.
import { test } from 'vitest';
import assert from 'node:assert';
import { diasComTreino, iniciosDoPeriodo, inicioDoDia, leituraDosDias, mediaMovel, serieDaMediaMovel, medianaDosInicios } from '../../src/dominio/mes';

const DIA = 86400000;
const hoje = inicioDoDia(Date.now()) + 12 * 3600000;
const as = (diasAtras: number, h: number, m = 0) => inicioDoDia(hoje - diasAtras * DIA) + (h * 60 + m) * 60000;

test('conta DIAS com treino, não sessões: dois treinos no mesmo dia contam um dia', () => {
  const done = [{ t: as(1, 6) }, { t: as(1, 18) }, { t: as(2, 6) }, { t: as(30, 6) }];
  assert.strictEqual(diasComTreino(done, hoje), 2, 'o dia de dois treinos é um dia, e o de 30 dias atrás está fora');
  const m = mediaMovel(done, hoje);
  assert.strictEqual(m.dias, 2);
  assert.strictEqual(m.porSemana, 0.5, 'divididos por 4');
});

test('a janela é de 28 dias, com o dia final incluso', () => {
  const done = [{ t: as(0, 6) }, { t: as(27, 6) }, { t: as(28, 6) }];
  assert.strictEqual(diasComTreino(done, hoje), 2, 'hoje e 27 dias atrás entram; 28 dias atrás não');
});

test('aula e treino fora da prescrição contam como dia com treino', () => {
  const done = [{ t: as(1, 9), day: 'HX' }, { t: as(2, 9), livre: 1 }];
  assert.strictEqual(diasComTreino(done, hoje), 2);
});

test('a série tem um valor por dia, do primeiro ao último', () => {
  const done = [{ t: as(3, 6) }];
  const s = serieDaMediaMovel(done, hoje - 5 * DIA, hoje);
  assert.strictEqual(s.length, 6);
  assert.deepStrictEqual(s, [0, 0, 0.25, 0.25, 0.25, 0.25]);
});

test('o horário de início só lê sessão com hora, e diz o que ficou de fora', () => {
  const done = [
    { t: as(1, 6, 5) }, { t: as(2, 18, 15) },
    { t: as(3, 9), day: 'HX', semHora: 1 }, { t: as(4, 7), semHora: 1 },
    { t: as(5, 10), livre: 1 }
  ];
  const r = iniciosDoPeriodo(done, hoje - 10 * DIA, hoje,
    (s: any) => !s.semHora && !s.livre, (s: any) => s.day === 'HX');
  assert.deepStrictEqual(r.inicios.map(x => x.min), [6 * 60 + 5, 18 * 60 + 15], 'em ordem de hora');
  assert.strictEqual(r.aulasSemHora, 1);
  assert.strictEqual(r.semHora, 1);
  assert.strictEqual(r.fora, 1);
});

test('antes de quatro semanas desde o primeiro treino, a conta vem sem média', () => {
  const done = [{ t: as(8, 6) }, { t: as(4, 6) }, { t: as(1, 6) }];
  const r = leituraDosDias(done, hoje)!;
  assert.deepStrictEqual(r, { dias: 3, janela: 9, porSemana: null }, '"3 dias com treino em 9", sem dividir por 4');
  const longe = leituraDosDias([{ t: as(40, 6) }, { t: as(2, 6) }], hoje)!;
  assert.strictEqual(longe.janela, 28);
  assert.strictEqual(longe.porSemana, 0.25);
  assert.strictEqual(leituraDosDias([], hoje), null, 'sem treino nenhum, nenhuma leitura vira zero');
});

test('a mediana dos inícios: o do meio, ou o meio entre os dois do centro', () => {
  const i = (mins: number[]) => mins.map(min => ({ t: 0, min }));
  assert.strictEqual(medianaDosInicios(i([370, 374, 1110])), 374);
  assert.strictEqual(medianaDosInicios(i([1110, 360, 380, 400])), 390, 'fora de ordem também');
  assert.strictEqual(medianaDosInicios([]), null);
});
