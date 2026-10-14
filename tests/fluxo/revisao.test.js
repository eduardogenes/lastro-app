// A REVISÃO DO TREINADOR colada em texto — a D, `prescricao.html`, estado 6;
// decisão do dono, 14/10. O que só a tela e o dado provam: a pergunta antes de
// gravar, o histórico que fica onde a resposta mandou, o que sai dito antes, e
// o programa do treinador que passa a ser o da revisão.
import { test } from 'vitest';
import assert from 'node:assert';
import { app, DIA } from './harness.js';

const TEXTO = `Revisão 21/09
Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 5 x 8-12 · RIR 1 · posterior
- Terra romeno no Smith · 3 x 6-10 · RIR 1-2
- Leg press · 2 x 10-15
- Hip thrust máquina · 3 x 8-12 · RIR 1 · glúteo
- Adutora · 2 x 10-15
- Panturrilha em pé · 3 x 6-10
- Panturrilha sentada · 2 x 10-15`;

async function naRevisao(texto, estado) {
  const t = Date.now() - 10 * DIA;
  const a = await app({ aba: 'prescricao', estado: Object.assign({ plano: 7,
    logs: { 'cadeira-flexora-sentada': [{ t: t, sid: t, sets: [[45, 12, 1], [45, 11, 1]] }] },
    done: [{ day: 'B', t: t, sid: t, dur: 3600000 }] }, estado || {}) });
  await a.esperar();
  a.clicar('[data-a="abre-revisao"]');
  await a.esperar();
  a.v('ctx.textoDaRevisao', { value: texto || TEXTO });
  a.clicar('[data-a="rev-ler"]');
  await a.esperar();
  return a;
}

const pergunta = (a, nome) => a.$$('[data-rev-pergunta]').filter(e => e.getAttribute('data-rev-pergunta') === nome)[0];

test('lê, pergunta antes de gravar, e não grava enquanto falta resposta', async () => {
  const a = await naRevisao();
  const r = a.vJ('ctx.revisao');
  assert.strictEqual(r.data, '21/09');
  assert.deepStrictEqual(r.perguntas.map(q => [q.nome, q.candidato]), [
    ['Flexora sentada', 'Cadeira flexora sentada'], ['Hip thrust máquina', 'Elevação pélvica na máquina']]);
  assert.ok(/^Tem 2 séries registradas desde \d\d\/\d\d\.$/.test(r.perguntas[0].series), r.perguntas[0].series);
  assert.ok(/Responder errado manda o histórico para o exercício errado/.test(pergunta(a, 'Flexora sentada').textContent));
  assert.strictEqual(a.$('[data-a="rev-incorpora"]').disabled, true, 'sem resposta, não grava');
  const b = r.dias[0];
  assert.ok(b.linhas.includes('Cadeira flexora sentada: 4 → 5 séries'), b.linhas.join(' | '));
  assert.ok(b.linhas.includes('sai Cadeira extensora'), b.linhas.join(' | '));
  a.fechar();
});

test('"É a mesma": o histórico fica com o exercício, e o programa passa a ser o da revisão', async () => {
  const a = await naRevisao();
  a.clicar(pergunta(a, 'Flexora sentada').querySelector('[data-a="rev-mesma"]'));
  a.clicar(pergunta(a, 'Hip thrust máquina').querySelector('[data-a="rev-mesma"]'));
  await a.esperar();
  assert.strictEqual(a.$('[data-a="rev-incorpora"]').disabled, false);
  a.clicar('[data-a="rev-incorpora"]');
  await a.esperar(60);

  const g = a.gravado();
  const b = g.prog.B.ex;
  assert.deepStrictEqual(b.map(x => x.id).slice(0, 2), ['agachamento-no-smith', 'cadeira-flexora-sentada']);
  assert.strictEqual(b[1].s, 5);
  assert.ok(!b.some(x => x.id === 'cadeira-extensora'), 'a extensora saiu');
  assert.deepStrictEqual(g.progTreinador.dias.B.ex.map(x => x.id), b.map(x => x.id), 'é o programa do treinador agora');
  assert.strictEqual(g.progTreinador.data, '21/09');
  assert.strictEqual(g.logs['cadeira-flexora-sentada'].length, 1, 'o histórico continua onde estava');
  assert.strictEqual(a.v('difTotal'), 0, 'e o programa dele é igual ao do treinador');
  assert.strictEqual(a.vista().revisao, null, 'a tela fecha');
  assert.ok(/^Revisão de 21\/09 incorporada: Treino B\.$/.test(a.toast()), a.toast());
  a.fechar();
});

test('"É outro exercício": entra um exercício novo, e o histórico do antigo não vai junto', async () => {
  const a = await naRevisao();
  a.clicar(pergunta(a, 'Flexora sentada').querySelector('[data-a="rev-outro"]'));
  a.clicar(pergunta(a, 'Hip thrust máquina').querySelector('[data-a="rev-mesma"]'));
  await a.esperar();
  assert.ok(/Flexora sentada/.test(a.texto('[data-a="rev-novos"]')), 'a tela diz que entra como novo');
  a.clicar('[data-a="rev-incorpora"]');
  await a.esperar(60);
  const g = a.gravado();
  assert.strictEqual(g.prog.B.ex[1].id, 'flexora-sentada');
  assert.strictEqual(g.ex['flexora-sentada'].n, 'Flexora sentada');
  assert.strictEqual(g.ex['flexora-sentada'].g, 'posterior', 'com o grupo que a revisão disse');
  assert.strictEqual(g.logs['flexora-sentada'], undefined, 'o novo nasce sem histórico');
  assert.strictEqual(g.logs['cadeira-flexora-sentada'].length, 1, 'e o antigo guarda o dele');
  a.fechar();
});

test('as mudanças dele no treino que a revisão substitui são ditas antes', async () => {
  const a = await app({ aba: 'prescricao', estado: { plano: 7 } });
  await a.esperar();
  a.E('S.prog.B.ex[4].s = 3');          // ele subiu a extensora de 1 para 3
  a.clicar('[data-a="abre-revisao"]');
  a.v('ctx.textoDaRevisao', { value: TEXTO });
  a.clicar('[data-a="rev-ler"]');
  await a.esperar();
  const b = a.vJ('ctx.revisao').dias[0];
  assert.ok(b.suas.length >= 1, 'a mudança dele aparece');
  assert.ok(/Suas mudanças no Treino B são substituídas por esta revisão/.test(a.texto('#app') + a.doc.body.textContent));
  a.fechar();
});

test('se o aparelho recusa, nada da revisão fica', async () => {
  const a = await naRevisao();
  a.clicar(pergunta(a, 'Flexora sentada').querySelector('[data-a="rev-outro"]'));
  a.clicar(pergunta(a, 'Hip thrust máquina').querySelector('[data-a="rev-mesma"]'));
  const antes = JSON.stringify(a.S().prog.B);
  a.encheCota();
  a.clicar('[data-a="rev-incorpora"]');
  await a.esperar(60);
  assert.strictEqual(JSON.stringify(a.S().prog.B), antes, 'o programa voltou');
  assert.strictEqual(a.S().progTreinador, null);
  assert.strictEqual(a.S().ex['flexora-sentada'], undefined, 'e o exercício novo não ficou');
  assert.ok(a.vista().revisao, 'a tela fica, para tentar de novo');
  a.fechar();
});

test('depois da revisão, restaurar volta ao programa da revisão, e não ao antigo', async () => {
  const a = await naRevisao();
  a.clicar(pergunta(a, 'Flexora sentada').querySelector('[data-a="rev-mesma"]'));
  a.clicar(pergunta(a, 'Hip thrust máquina').querySelector('[data-a="rev-mesma"]'));
  a.clicar('[data-a="rev-incorpora"]');
  await a.esperar(60);
  a.E('S.prog.B.ex[1].s = 2');
  assert.strictEqual(a.v('difTotal'), 1);
  a.responder(true);
  await a.v('restaurarTudo');
  await a.esperar(60);
  assert.strictEqual(a.S().prog.B.ex[1].s, 5, 'as 5 séries da revisão, não as 4 do código');
  a.fechar();
});

test('treino novo na revisão entra no fim da sequência; linha não entendida é dita', async () => {
  const a = await naRevisao(`Treino F · Braços
- Rosca direta · 3 x 8-12 · bíceps
- algo sem formato`);
  const r = a.vJ('ctx.revisao');
  assert.strictEqual(r.problemas.length, 1);
  assert.ok(a.$('.rv-problemas'), 'a tela lista o que não entendeu');
  assert.strictEqual(r.dias[0].novo, true);
  r.perguntas.forEach(q => a.v('ctx.respondeRevisao', q.nome, 'outro'));
  await a.esperar();
  a.clicar('[data-a="rev-incorpora"]');
  await a.esperar(60);
  assert.strictEqual(a.S().rot[a.S().rot.length - 1], 'F', 'o F entrou no fim');
  assert.strictEqual(a.S().progTreinador.rot[a.S().progTreinador.rot.length - 1], 'F');
  a.fechar();
});

test('o Voltar do sistema fecha a revisão', async () => {
  const a = await naRevisao();
  a.E('voltarUmaCamada()');            // o caminho do Voltar do sistema e do Esc
  await a.esperar();
  assert.strictEqual(a.vista().revisao, null);
  a.fechar();
});
