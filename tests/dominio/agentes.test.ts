// Ajustes › Agentes: o que cada papel leu, por dia, e se está ligado.
import { test } from 'vitest';
import assert from 'node:assert';
import { estadoDosAgentes, fraseDoAcesso, resumoDosAgentes } from '../../src/dominio/agentes';

const agora = new Date(2026, 10, 24, 20, 0).getTime();
const em = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m).toISOString();

test('agrupa por dia, mais recente primeiro, com a hora dita e a frase da ferramenta', () => {
  const e = estadoDosAgentes([
    { papel: 'treinador', ferramenta: 'historico', resumo: '', cliente: 'c', em: em(23, 21, 5) },
    { papel: 'treinador', ferramenta: 'programa', resumo: '', cliente: 'c', em: em(24, 14, 2) },
    { papel: 'treinador', ferramenta: 'series', resumo: 'exercicio: barra-fixa', cliente: 'c', em: em(24, 14, 1) }
  ], {}, agora);
  const t = e.find(x => x.k === 'treinador')!;
  assert.strictEqual(t.leu, true);
  assert.strictEqual(t.ultima, 'hoje, às 14h02');
  assert.deepStrictEqual(t.dias.map(d => d.dia), ['Hoje', 'Ontem, 23/11']);
  assert.strictEqual(t.dias[0].itens[1].texto, 'as séries registradas (exercicio: barra-fixa)');
  const n = e.find(x => x.k === 'nutricionista')!;
  assert.strictEqual(n.leu, false);
  assert.strictEqual(n.ultima, null);
});

test('a chave: sem linha é ligado; false desliga; o resumo conta quem leu e está ligado', () => {
  const ac = [{ papel: 'treinador', ferramenta: 'programa', resumo: '', cliente: null, em: em(24, 9, 0) },
              { papel: 'nutricionista', ferramenta: 'corpo', resumo: '', cliente: null, em: em(24, 9, 0) }];
  assert.strictEqual(resumoDosAgentes(estadoDosAgentes(ac, {}, agora)), '2 ligados');
  const e = estadoDosAgentes(ac, { nutricionista: false }, agora);
  assert.strictEqual(e.find(x => x.k === 'nutricionista')!.ligado, false);
  assert.strictEqual(resumoDosAgentes(e), '1 ligado');
  assert.strictEqual(resumoDosAgentes(estadoDosAgentes([], {}, agora)), 'nenhum ligado');
});

test('ferramenta desconhecida aparece pelo nome, sem quebrar', () => {
  assert.strictEqual(fraseDoAcesso({ papel: 'assistente', ferramenta: 'nova', resumo: '', cliente: null, em: em(24, 1, 0) }), 'nova');
});
