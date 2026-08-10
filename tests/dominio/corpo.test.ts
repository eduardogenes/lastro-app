// As três regras de ajuste da dieta, nos limites exatos.
//
// Antes cada um destes casos custava subir o app inteiro num jsdom para ler um
// parágrafo da tela. A regra é função pura: recebe as marcas, devolve o
// veredito. Testar assim custa microssegundos — e por isso dá para cobrir os
// limites, o sinal negativo e a precedência da cintura sem pensar duas vezes.

import { test } from 'vitest';
import assert from 'node:assert';
import { cinturaMes, mediasSemanais, pesoRitmo, veredito } from '../../src/dominio/corpo';
import { medidas, pesagens } from './ajuda';

const semCintura = { peso: [] as ReturnType<typeof pesagens>, cintura: [] };

test('ganho travado manda comer mais', () => {
  const v = veredito({ peso: pesagens([73.0, 73.05, 73.10]), cintura: [] });
  assert.strictEqual(v.t, 'Comer mais');
  assert.ok(v.p.includes('0,05'), v.p);
  assert.ok(v.p.includes('abaixo de 0,15'));
});

test('ganho rápido manda comer menos', () => {
  const v = veredito({ peso: pesagens([73.0, 73.6, 74.2]), cintura: [] });
  assert.strictEqual(v.t, 'Comer menos');
  assert.ok(v.p.includes('0,60'));
  assert.ok(v.p.includes('acima de 0,4'));
});

test('ganho na faixa manda manter', () => {
  const v = veredito({ peso: pesagens([73.0, 73.25, 73.5]), cintura: [] });
  assert.strictEqual(v.t, 'Manter como está');
  assert.ok(v.p.includes('0,25'));
});

test('limite exato de 0,15 ainda é comer mais', () => {
  assert.strictEqual(veredito({ peso: pesagens([73.0, 73.15, 73.30]), cintura: [] }).t, 'Comer mais');
});

test('limite exato de 0,40 ainda é manter', () => {
  assert.strictEqual(veredito({ peso: pesagens([73.0, 73.40, 73.80]), cintura: [] }).t, 'Manter como está');
});

test('perdendo peso: o texto não diz que subiu', () => {
  const v = veredito({ peso: pesagens([73.5, 73.2, 73.0]), cintura: [] });
  assert.strictEqual(v.t, 'Comer mais');
  assert.ok(v.p.includes('caiu'), 'não pode dizer "subiu −0,25": ' + v.p);
});

test('cintura estourando manda comer menos mesmo com peso na faixa', () => {
  const v = veredito({
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.6 }, { d: 7, v: 81.4 }, { d: 0, v: 82.0 }])
  });
  assert.strictEqual(v.t, 'Comer menos');
  assert.ok(v.p.includes('cintura'));
});

test('cintura dentro do limite não sobrepõe o peso', () => {
  const v = veredito({
    peso: pesagens([73.0, 73.25, 73.5]),
    cintura: medidas([{ d: 28, v: 80.0 }, { d: 21, v: 80.2 }, { d: 7, v: 80.5 }, { d: 0, v: 80.7 }])
  });
  assert.strictEqual(v.t, 'Manter como está');
});

test('uma semana só não aplica a regra', () => {
  assert.strictEqual(veredito({ peso: pesagens([73.0]), cintura: [] }).t, 'Faltam dados');
});

test('duas semanas avisam que falta uma', () => {
  const v = veredito({ peso: pesagens([73.0, 73.25]), cintura: [] });
  assert.strictEqual(v.t, 'Falta uma semana');
  assert.ok(v.p.includes('2 semanas'));
});

test('sem nada registrado pede registro', () => {
  assert.strictEqual(veredito(semCintura).t, 'Faltam dados');
});

test('cintura usa média semanal, não medida solta', () => {
  const W = mediasSemanais(
    medidas([{ d: 28, v: 80.0 }, { d: 26, v: 80.4 }, { d: 2, v: 82.2 }, { d: 0, v: 81.8 }])
  ).map(x => Math.round(x.v * 100) / 100);
  assert.ok(W.length >= 2);
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
