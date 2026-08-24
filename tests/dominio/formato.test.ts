// Formatação, datas e semana. É onde mora boa parte do tom do app.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  MESES, PERIODOS, diaExtenso, fmtDate, fmtDec, fmtDec2, fmtDesc, fmtDur, fmtHora,
  fmtInt, fmtK, fmtNum, fmtSig, fmtSig2, escAttr, escapeHTML, periodoDe, sameDay, weekStart
} from '../../src/dominio/formato';
import { DIA } from './ajuda';

test('número inteiro não ganha decimal à toa', () => {
  assert.strictEqual(fmtNum(60), '60');
  assert.strictEqual(fmtNum(22.5), '22.5');
  assert.strictEqual(fmtNum(22.55), '22.6');
});

test('o sinal é decidido depois de arredondar', () => {
  assert.strictEqual(fmtSig(-0.04), '0,0',
    'arredonda para zero: escrever "−0,0" seria ruído, e sinal nenhum é o certo');
  assert.strictEqual(fmtSig(0.25), '+0,3');
  // Math.round arredonda meio para +∞, então −0,25 vira −0,2 e não −0,3. A
  // assimetria é do JavaScript, e aqui não incomoda: é uma casa de exibição
  // sobre média semanal, e quem decide é o ritmo de duas casas (fmtSig2).
  assert.strictEqual(fmtSig(-0.25), '−0,2');
  assert.strictEqual(fmtSig2(0.153), '+0,15');
  assert.strictEqual(fmtSig2(-0.153), '−0,15');
});

test('o ritmo tem duas casas porque a regra distingue 0,05 de 0,14', () => {
  assert.strictEqual(fmtDec2(0.05), '0,05');
  assert.strictEqual(fmtDec2(0.14), '0,14');
  assert.strictEqual(fmtDec(0.15), '0,2', 'uma casa só arredondaria para o mesmo número');
});

test('milhar vira k para caber na tela pequena', () => {
  assert.strictEqual(fmtK(999), '999');
  assert.strictEqual(fmtK(1000), '1k');
  assert.strictEqual(fmtK(12345), '12,3k');
});

test('duração passa a hora quando merece', () => {
  assert.strictEqual(fmtDur(45 * 60000), '45 min');
  assert.strictEqual(fmtDur(90 * 60000), '1h30');
  assert.strictEqual(fmtDur(60 * 60000), '1h00');
  assert.strictEqual(fmtDur(null), '–', 'sessão sem duração medida não inventa número');
});

test('descanso redondo vira minuto; quebrado vira relógio', () => {
  assert.strictEqual(fmtDesc(180), '3min', 'grande composto');
  assert.strictEqual(fmtDesc(150), '2:30', 'máquina multiarticular');
  assert.strictEqual(fmtDesc(105), '1:45', 'isolador: não é minuto redondo');
  assert.strictEqual(fmtDesc(90), '1:30', 'lateral, abdômen e panturrilha');
  assert.strictEqual(fmtDesc(45), '45s');
});

test('a semana começa no domingo', () => {
  const qua = new Date(2026, 7, 12, 15, 0, 0).getTime();   // quarta
  const dom = weekStart(qua);
  assert.strictEqual(new Date(dom).getDay(), 0, 'domingo');
  assert.strictEqual(new Date(dom).getHours(), 0);

  const sab = new Date(2026, 7, 15, 23, 0, 0).getTime();   // sábado
  assert.strictEqual(weekStart(sab), dom, 'sábado fecha a mesma semana');

  const domSeguinte = new Date(2026, 7, 16, 0, 30, 0).getTime();
  assert.notStrictEqual(weekStart(domSeguinte), dom, 'e o domingo seguinte abre outra');
});

test('a semana de treino inteira cai num balde só', () => {
  // é o que torna a virada inofensiva: ele treina de segunda a sábado, e esses
  // seis dias continuam juntos na mesma semana
  const semana = [10, 11, 12, 13, 14, 15]        // seg 10 a sáb 15 de agosto/2026
    .map(d => weekStart(new Date(2026, 7, d, 7, 0).getTime()));
  assert.strictEqual(new Set(semana).size, 1, 'os seis dias na mesma semana');
});

test('mesmo dia ignora a hora', () => {
  const manha = new Date(2026, 7, 10, 6, 15).getTime();
  const noite = new Date(2026, 7, 10, 23, 45).getTime();
  assert.strictEqual(sameDay(manha, noite), true);
  assert.strictEqual(sameDay(manha, manha + DIA), false);
});

test('o marcador de período segue as faixas do dia', () => {
  const as = (h: number) => periodoDe(new Date(2026, 7, 10, h, 0).getTime()).k;
  assert.strictEqual(as(5), 'manha', 'a faixa começa às 5');
  assert.strictEqual(as(11), 'manha');
  assert.strictEqual(as(12), 'tarde');
  assert.strictEqual(as(17), 'tarde');
  assert.strictEqual(as(18), 'noite');
  assert.strictEqual(as(4), 'noite', 'antes das 5 ainda é noite');
  assert.strictEqual(PERIODOS.length, 3);
});

test('data e hora saem no formato brasileiro', () => {
  const t = new Date(2026, 0, 5, 6, 15).getTime();
  assert.strictEqual(fmtDate(t), '05/01');
  assert.strictEqual(fmtHora(t), '06:15');
  assert.ok(diaExtenso(t).startsWith('segunda, 05 de janeiro'), diaExtenso(t));
  assert.strictEqual(MESES.length, 12);
});

test('milhar de volume usa separador brasileiro', () => {
  assert.strictEqual(fmtInt(12345), '12.345');
});

test('nome de exercício com caractere de marcação não quebra a tela', () => {
  // ele pode cadastrar equipamento com o nome que quiser
  assert.strictEqual(escapeHTML('Supino <b>reto</b> & cia'), 'Supino &lt;b&gt;reto&lt;/b&gt; &amp; cia');
  assert.strictEqual(escAttr(`Supino 45"`), 'Supino 45&quot;');
  assert.strictEqual(escAttr("Rosca do 'papai'"), "Rosca do \\'papai\\'");
});
