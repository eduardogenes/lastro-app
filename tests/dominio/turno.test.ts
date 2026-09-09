// O turno do treino: o que anda com a sessão e o que fica preso ao relógio.
//
// O plano foi desenhado em cima de treino às 6h15, e o nome "Café da manhã /
// pós-treino" era a prova de que "pós-treino" nunca foi uma refeição — é um
// PAPEL que uma refeição de relógio acumula. Com o treino à tarde ou à noite,
// o papel migra; as refeições não.

import { test } from 'vitest';
import assert from 'node:assert';
import { PLANO_BASE, TURNOS } from '../../src/dominio/nutricao/alimentos';
import {
  conflitosDeTurno, deslocamentoDoTurno, horaDe, posTreinoDe, refeicoesDeHoje
} from '../../src/dominio/nutricao/calculo';

const emTurno = (t?: 'manha' | 'tarde' | 'noite') =>
  refeicoesDeHoje(PLANO_BASE, true, false, t);
const horas = (t?: 'manha' | 'tarde' | 'noite') =>
  emTurno(t).map(r => r.t + ' ' + r.id);

test('são três turnos, e a manhã não tem hora própria', () => {
  assert.deepStrictEqual(TURNOS.map(t => t.k), ['manha', 'tarde', 'noite']);
  assert.strictEqual(TURNOS[0].t, null,
    'a hora da manhã é a do PLANO — fixar 06:15 desfaria a edição dele');
  assert.strictEqual(TURNOS[1].t, '12:15');
  assert.strictEqual(TURNOS[2].t, '18:15');
});

test('manhã é o plano como está escrito', () => {
  assert.strictEqual(deslocamentoDoTurno(PLANO_BASE, 'manha'), 0);
  assert.strictEqual(deslocamentoDoTurno(PLANO_BASE, null), 0, 'ausente é manhã');
  assert.deepStrictEqual(horas('manha'), horas(undefined));
  assert.deepStrictEqual(horas('manha'), [
    '05:45 pre', '06:15 treino', '08:00 pos', '12:30 almoco', '16:00 lanche', '19:30 jantar'
  ]);
});

test('só o pré e o intra andam; o resto fica no relógio', () => {
  assert.deepStrictEqual(horas('tarde'), [
    '08:00 pos', '11:45 pre', '12:15 treino', '12:30 almoco', '16:00 lanche', '19:30 jantar'
  ], 'o café continua às 8h — deslocar o dia em bloco o poria às 14h');

  assert.deepStrictEqual(horas('noite'), [
    '08:00 pos', '12:30 almoco', '16:00 lanche', '17:45 pre', '18:15 treino', '19:30 jantar'
  ]);
});

test('o pré mantém o intervalo que o plano lhe deu', () => {
  // 30 min antes do treino, em qualquer turno
  (['manha', 'tarde', 'noite'] as const).forEach(t => {
    const refs = emTurno(t);
    const pre = refs.find(r => r.id === 'pre')!;
    const tr = refs.find(r => r.id === 'treino')!;
    const dif = Number(tr.t.slice(0, 2)) * 60 + Number(tr.t.slice(3)) -
                (Number(pre.t.slice(0, 2)) * 60 + Number(pre.t.slice(3)));
    assert.strictEqual(dif, 30, t + ': mudar o intervalo seria prescrever');
  });
});

test('o plano nunca é tocado — sai uma cópia', () => {
  const antes = JSON.stringify(PLANO_BASE);
  emTurno('noite');
  emTurno('tarde');
  assert.strictEqual(JSON.stringify(PLANO_BASE), antes,
    'editar é permanente, ajustar é de hoje');
});

test('o papel de pós-treino migra com o turno', () => {
  assert.strictEqual(posTreinoDe(emTurno('manha'), true), 'pos', 'de manhã é o café');
  assert.strictEqual(posTreinoDe(emTurno('tarde'), true), 'almoco', 'à tarde é o almoço');
  assert.strictEqual(posTreinoDe(emTurno('noite'), true), 'jantar', 'à noite é o jantar');
});

test('em dia de descanso não há pós-treino nenhum', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, false, false, 'noite');
  assert.strictEqual(posTreinoDe(refs, false), null);
  assert.strictEqual(refs.filter(r => r.quando === 'treino').length, 0,
    'sem treino não entram o pré nem o intra');
});

test('o número de refeições não muda com o turno', () => {
  const n = emTurno('manha').length;
  assert.strictEqual(emTurno('tarde').length, n);
  assert.strictEqual(emTurno('noite').length, n,
    'nada é criado e nada é apagado — fundir ou inventar refeição seria prescrever');
});

test('refeição que cai dentro da sessão é apontada, não movida', () => {
  // almoço 12:30 com treino 12:15: acontece durante o treino
  const tarde = emTurno('tarde');
  assert.deepStrictEqual(conflitosDeTurno(tarde, true), ['almoco']);
  assert.strictEqual(tarde.find(r => r.id === 'almoco')!.t, '12:30',
    'o app aponta e para: mover para um horário que ninguém prescreveu seria prescrever');

  assert.deepStrictEqual(conflitosDeTurno(emTurno('manha'), true), []);
  assert.deepStrictEqual(conflitosDeTurno(emTurno('noite'), true), [],
    'jantar 19:30 é 75 min depois do treino das 18:15 — não é conflito');
});

test('a hora dá a volta no dia sem estourar', () => {
  assert.strictEqual(horaDe(0), '00:00');
  assert.strictEqual(horaDe(6 * 60 + 15), '06:15');
  assert.strictEqual(horaDe(1440), '00:00');
  assert.strictEqual(horaDe(1500), '01:00');
  assert.strictEqual(horaDe(-60), '23:00');
});

test('o nome composto saiu do plano: o papel virou cálculo', () => {
  const pos = PLANO_BASE.find(r => r.id === 'pos')!;
  assert.strictEqual(pos.n, 'Café da manhã');
  assert.ok(!/pós-treino/i.test(pos.n),
    'com treino às 18h15 esse nome mentiria na refeição das 8h');
});
