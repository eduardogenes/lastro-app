// As quatro grandezas, a direção que sai delas e o ritmo.
//
// Este arquivo existe por um número medido: com o modelo antigo, 5×500 m de
// remo apareciam como `+423%` em ácido contra um 500 m sozinho. O app somava
// segundos, chamava a soma de progresso e pintava de verde ficar mais lento.
// Os testes daqui são o contrato que impede isso de voltar.

import { test } from 'vitest';
import assert from 'node:assert';
import {
  cronometrado, menosEhMelhor, ritmoDe, temUnidade, unidadeDe, isTime,
  ESCALA_RITMO, ROTULO_UNIDADE
} from '../../src/dominio/carga';
import { e1rmDoLog, tendenciaDeForca } from '../../src/dominio/forca';
import { shouldUp } from '../../src/dominio/progressao';
import { log } from './ajuda';
import type { Unidade } from '../../src/dominio/tipos';

const UNIDADES: Unidade[] = ['seg', 'm', 'cal', 'rep'];

test('toda unidade tem rótulo, e são quatro', () => {
  assert.deepStrictEqual(Object.keys(ROTULO_UNIDADE).sort(), ['cal', 'm', 'rep', 'seg']);
  UNIDADES.forEach(u => assert.ok(ROTULO_UNIDADE[u], u + ' sem rótulo'));
});

test('a série de musculação continua sem unidade nenhuma', () => {
  assert.strictEqual(unidadeDe({}), null);
  assert.strictEqual(temUnidade({}), false);
  assert.strictEqual(temUnidade(null), false);
  assert.strictEqual(cronometrado(null), false, 'sem unidade não há relógio a comparar');
});

test('`seg` continua querendo dizer o que sempre quis', () => {
  assert.strictEqual(isTime({ u: 'seg' }), true);
  assert.strictEqual(unidadeDe({ u: 'seg' }), 'seg');
  assert.strictEqual(temUnidade({ u: 'seg' }), true);
});

// ---------- a direção ----------
// Ela é propriedade da UNIDADE, nunca do exercício. Em metro e caloria a
// quantidade é fixa e o relógio é o resultado, então menos é melhor. Em
// repetição e segundo a janela é fixa e a quantidade é o resultado.

test('menos é melhor exatamente onde o resultado é o relógio', () => {
  assert.strictEqual(menosEhMelhor('m'), true, '500 m mais rápido é melhor');
  assert.strictEqual(menosEhMelhor('cal'), true, '15 cal mais rápido é melhor');
  assert.strictEqual(menosEhMelhor('rep'), false, 'mais repetição na janela é melhor');
  assert.strictEqual(menosEhMelhor('seg'), false, 'prancha mais longa é melhor');
  assert.strictEqual(menosEhMelhor(null), false, 'musculação sobe carga, não desce relógio');
});

test('cronometrado e menosEhMelhor respondem a mesma pergunta', () => {
  UNIDADES.forEach(u => assert.strictEqual(cronometrado(u), menosEhMelhor(u), u));
});

// ---------- o ritmo ----------

test('o ritmo põe sessões de tamanhos diferentes no mesmo eixo', () => {
  // era exatamente este par que produzia o +423%
  const mil = log([[0, 220]], { u: 'm', q: 1000 });
  const cinco = log([[0, 110], [0, 112], [0, 115], [0, 118], [0, 120]], { u: 'm', q: 500 });

  assert.strictEqual(ritmoDe(mil), 0.22, '220 s para 1000 m');
  assert.strictEqual(ritmoDe(cinco), 575 / 2500, '575 s para 2500 m');
  assert.ok(ritmoDe(cinco)! > ritmoDe(mil)!, 'cinco tiros de 500 são mais lentos por metro');
});

test('o ritmo é por unidade de trabalho, não por sessão', () => {
  const um = log([[0, 110]], { u: 'm', q: 500 });
  const dois = log([[0, 110], [0, 110]], { u: 'm', q: 500 });
  assert.strictEqual(ritmoDe(um), ritmoDe(dois),
    'fazer o mesmo tiro duas vezes não muda o ritmo — era aí que a soma mentia');
});

test('sem trabalho conhecido não se inventa denominador', () => {
  assert.strictEqual(ritmoDe(log([[0, 110]], { u: 'm' })), null, 'sem q');
  assert.strictEqual(ritmoDe(log([[0, 110]], { u: 'm', q: 0 })), null);
  assert.strictEqual(ritmoDe(log([[0, 60]], { u: 'seg', q: 60 })), null, 'segundo não tem ritmo');
  assert.strictEqual(ritmoDe(log([[0, 20]], { u: 'rep', q: 20 })), null, 'repetição não tem ritmo');
  assert.strictEqual(ritmoDe(log([[60, 10]])), null, 'musculação não tem ritmo');
  assert.strictEqual(ritmoDe(log([null], { u: 'm', q: 500 })), null, 'série não feita');
});

test('a escala existe só onde há ritmo, e é a que se lê na máquina', () => {
  assert.strictEqual(ESCALA_RITMO.m!.fator, 100, 's/metro daria 0,22 — ninguém compara isso');
  assert.strictEqual(ESCALA_RITMO.cal!.fator, 1);
  assert.strictEqual(ESCALA_RITMO.seg, undefined);
  assert.strictEqual(ESCALA_RITMO.rep, undefined);
});

// ---------- o guarda da força ----------
// O e1RM não morre no histórico: ele vira o sinal que a REGRA CALÓRICA
// consome. Uma unidade que escape daqui faz o app mentir na metade da comida,
// longe de onde o erro foi cometido.

test('nenhuma grandeza declarada produz e1RM', () => {
  UNIDADES.forEach(u => {
    assert.strictEqual(e1rmDoLog(log([[9, 100]], { u })), 0,
      u + ': wall balls de 9 kg × 100 não é um supino de 39 kg');
  });
});

test('a série de musculação continua produzindo e1RM', () => {
  assert.ok(e1rmDoLog(log([[60, 10]])) > 0);
});

test('a tendência de força ignora todo movimento com grandeza', () => {
  const DIA = 86400000, agora = Date.now();
  const serie = (t: number) => ({ t, sid: t, sets: [[9, 100]] as [number, number][] });
  const logs = {
    'wall-balls': [serie(agora - 21 * DIA), serie(agora - 3 * DIA)],
    'sled-push':  [serie(agora - 21 * DIA), serie(agora - 3 * DIA)],
    'corrida':    [serie(agora - 21 * DIA), serie(agora - 3 * DIA)]
  };
  const t = tendenciaDeForca(logs, () => true, agora);
  assert.strictEqual(t.base, 0, 'nenhum deles entra na conta');
  assert.strictEqual(t.ok, false, 'e sem base o sinal não conclui nada');
});

test('movimento com grandeza não ganha selo de subir carga', () => {
  const cheio = log([[9, 100], [9, 100], [9, 100]]);
  UNIDADES.forEach(u => {
    assert.strictEqual(shouldUp(cheio, { u, s: 3, r: '6–10' }, 0), false, u);
  });
  assert.strictEqual(shouldUp(cheio, { s: 3, r: '6–10' }, 0), true,
    'musculação batendo o topo continua ganhando');
});
