// A revisão do treinador colada em texto (prescrição, estado 6; decisão do
// dono, 14/10): ler, casar os nomes sem chutar, e dizer o que muda.
import { test } from 'vitest';
import assert from 'node:assert';
import { lerRevisao, casaNomes, parecenca, treinoDaRevisao, mudancasDoTreino, aplicaMudancas } from '../../src/dominio/revisao';
import type { TreinoDoPrograma, MudancaDaRevisao } from '../../src/dominio/revisao';

const TEXTO = `Revisão 21/09

Treino B · Pernas completas + panturrilhas
- Agachamento no Smith · 2 x 6-10 · RIR 1-2 · 3 min · quadríceps
- Flexora sentada · 4 x 8-12 · RIR 1 · 2:00 · posterior
- Hip thrust máquina · 3 x 8-12 · RIR 1 · 2:30 · glúteo
- Panturrilha em pé · 3 séries de 6 a 10 · 90 s · panturrilha · dica: descida completa

Treino HX · Aula do box (aberto)`;

const CAT = {
  'agachamento-no-smith': { n: 'Agachamento no Smith', g: 'quadríceps' },
  'cadeira-flexora-sentada': { n: 'Cadeira flexora sentada', g: 'posterior' },
  'elevacao-pelvica-na-maquina': { n: 'Elevação pélvica na máquina', g: 'glúteo' },
  'panturrilha-em-pe': { n: 'Panturrilha em pé', g: 'panturrilha' },
  'leg-press': { n: 'Leg press', g: 'quadríceps' }
};
const ATUAL = { B: { ex: [
  { id: 'agachamento-no-smith', s: 2 }, { id: 'cadeira-flexora-sentada', s: 3 },
  { id: 'elevacao-pelvica-na-maquina', s: 2 }, { id: 'leg-press', s: 2 }
] } };

test('lê os treinos, os exercícios e cada campo, em qualquer ordem', () => {
  const r = lerRevisao(TEXTO);
  assert.strictEqual(r.data, '21/09');
  assert.deepStrictEqual(r.problemas, []);
  assert.deepStrictEqual(r.dias.map(d => [d.dia, d.nome, d.aberto, d.ex.length]),
    [['B', 'Pernas completas + panturrilhas', false, 4], ['HX', 'Aula do box', true, 0]]);
  const [ag, fl, , pt] = r.dias[0].ex;
  assert.deepStrictEqual(ag, { n: 'Agachamento no Smith', s: 2, r: '6–10', rir: '1–2', d: 180, g: 'quadríceps' });
  assert.strictEqual(fl.d, 120);
  assert.deepStrictEqual([pt.s, pt.r, pt.d, pt.cue], [3, '6–10', 90, 'descida completa']);
});

test('o que não se entende vira problema dito, não chute', () => {
  const r = lerRevisao(`- Supino solto · 3 x 8
Treino A
- Supino reto · 3 x 8-12 · pesado demais · ombro
- Remada · RIR 1
Texto qualquer
Treino A · de novo`);
  const motivos = r.problemas.map(p => p.motivo);
  assert.ok(motivos.includes('exercício antes de qualquer "Treino X"'));
  assert.ok(motivos.some(m => /^trecho não reconhecido: pesado demais, ombro$/.test(m)), motivos.join(' | '));
  assert.ok(motivos.includes('falta séries × repetições, como "3 x 8-12"'));
  assert.ok(motivos.includes('não é cabeçalho de treino nem exercício'));
  assert.ok(motivos.includes('o Treino A aparece duas vezes'));
  assert.strictEqual(r.dias[0].ex.length, 1, 'o supino reto entrou mesmo com o campo não entendido');
});

test('nome idêntico é o mesmo; parecido pergunta; o do mesmo lugar pergunta; o resto é novo', () => {
  const r = lerRevisao(TEXTO + '\n');
  const c = casaNomes(r, CAT, ATUAL);
  assert.deepStrictEqual(c['Agachamento no Smith'], { k: 'igual', id: 'agachamento-no-smith' });
  assert.deepStrictEqual(c['Panturrilha em pé'], { k: 'igual', id: 'panturrilha-em-pe' });
  assert.deepStrictEqual(c['Flexora sentada'], { k: 'pergunta', id: 'cadeira-flexora-sentada', por: 'nome' });
  assert.deepStrictEqual(c['Hip thrust máquina'], { k: 'pergunta', id: 'elevacao-pelvica-na-maquina', por: 'nome' },
    'hip thrust é elevação pélvica');
});

test('sem nome parecido, o candidato é o que a revisão deixa de fora no mesmo lugar', () => {
  const r = lerRevisao(`Treino B
- Agachamento no Smith · 2 x 6-10
- Belt squat · 3 x 8-12 · quadríceps`);
  const c = casaNomes(r, CAT, ATUAL);
  assert.deepStrictEqual(c['Belt squat'], { k: 'pergunta', id: 'cadeira-flexora-sentada', por: 'lugar' },
    'a posição 2 do B é a da flexora, que a revisão deixou de fora');
  const sem = casaNomes(lerRevisao(`Treino Z\n- Belt squat · 3 x 8-12`), CAT, ATUAL);
  assert.deepStrictEqual(sem['Belt squat'], { k: 'novo' }, 'treino novo, sem lugar a herdar: é exercício novo');
});

test('um exercício nunca é proposto para dois nomes', () => {
  const r = lerRevisao(`Treino B
- Flexora sentada · 3 x 8-12
- Flexora sentada unilateral · 2 x 10-15`);
  const c = casaNomes(r, CAT, ATUAL);
  const ids = Object.values(c).filter(x => x.k !== 'novo').map(x => (x as { id: string }).id);
  assert.strictEqual(new Set(ids).size, ids.length, JSON.stringify(c));
});

test('a parecença: contido conta, palavra solta não basta', () => {
  assert.ok(parecenca('Flexora sentada', 'Cadeira flexora sentada') >= 0.5);
  assert.ok(parecenca('Rosca direta', 'Rosca martelo') < 0.5);
  assert.ok(parecenca('Hip thrust máquina', 'Elevação pélvica na máquina') >= 0.5);
});

test('o que muda no treino: entra, sai, e as séries de antes e depois', () => {
  const r = lerRevisao(TEXTO);
  const ids = { 'Agachamento no Smith': 'agachamento-no-smith', 'Flexora sentada': 'cadeira-flexora-sentada',
                'Hip thrust máquina': 'elevacao-pelvica-na-maquina', 'Panturrilha em pé': 'panturrilha-em-pe' };
  const velho = { name: 'Pernas completas + panturrilhas', tag: '', ex: [
    { id: 'agachamento-no-smith', s: 2, r: '6–10', d: 180, rir: '1–2' }, { id: 'cadeira-flexora-sentada', s: 3, r: '8–12', d: 120, rir: '1' },
    { id: 'elevacao-pelvica-na-maquina', s: 2, r: '8–12', d: 150, rir: '1' }, { id: 'leg-press', s: 2, r: '10–15', d: 150 }
  ] };
  const novo = treinoDaRevisao(r.dias[0], ids, velho, () => 90, 1);
  const nome = (id: string) => (CAT as Record<string, { n: string }>)[id].n;
  const m = mudancasDoTreino('B', velho, novo, velho, nome);
  assert.deepStrictEqual(m.map(x => x.titulo), [
    'Panturrilha em pé entra',
    'Leg press sai',
    'Cadeira flexora sentada: 3 → 4 séries',
    'Elevação pélvica na máquina: 2 → 3 séries'
  ]);
  assert.strictEqual(m[0].detalhe, '3 × 6–10, no fim');
  assert.strictEqual(m[1].detalhe, 'era 2 × 10–15');
  assert.deepStrictEqual(m.map(x => x.sinal), ['+', '−', '↑', '↑']);
});

// ---------- mudança por mudança (peça 6, decisão do dono de 17/11/2026) ----------

const nomes: Record<string, string> = {
  agacha: 'Agachamento', hack: 'Hack machine', extensora: 'Cadeira extensora', flexora: 'Cadeira flexora',
  lateral: 'Elevação lateral', facepull: 'Face pull', remada: 'Remada', rosca: 'Rosca direta', minha: 'A minha'
};
const nomeDe = (id: string) => nomes[id] || id;
const sl = (id: string, s: number, r: string, extra: Record<string, unknown> = {}) => Object.assign({ id: id, s: s, r: r, d: 120, desde: 0 }, extra);
const tr = (ex: ReturnType<typeof sl>[], name = 'Treino') => ({ name: name, tag: '', ex: ex }) as TreinoDoPrograma;
/** as diferenças do programa dele contra o do treinador, como a `difDoDia` as conta (presença, séries, repetições, descanso, ordem) */
function diferencas(meu: TreinoDoPrograma | undefined, base: TreinoDoPrograma) {
  const out: string[] = [];
  const m = (meu && meu.ex) || [], b = base.ex;
  const bi: Record<string, typeof b[0]> = {}; b.forEach(x => { bi[x.id] = x; });
  const mi: Record<string, typeof m[0]> = {}; m.forEach(x => { mi[x.id] = x; });
  m.forEach(x => {
    const o = bi[x.id];
    if (!o) { out.push('só no seu: ' + x.id); return; }
    if (x.s !== o.s) out.push(x.id + ' séries');
    if (x.r !== o.r) out.push(x.id + ' repetições');
    if (x.d !== o.d) out.push(x.id + ' descanso');
  });
  b.forEach(x => { if (!mi[x.id]) out.push('só no do treinador: ' + x.id); });
  const a1 = m.filter(x => bi[x.id]).map(x => x.id).join('|'), a2 = b.filter(x => mi[x.id]).map(x => x.id).join('|');
  if (a1 !== a2) out.push('ordem');
  return out;
}

test('aplicar 4 de 5: o programa dele recebe as marcadas, e a que ficou de fora é a única diferença', () => {
  // o exemplo do design system (ds-telas2.js, "revisao")
  const velho = {
    B: tr([sl('agacha', 2, '6–10'), sl('extensora', 1, '10–15'), sl('flexora', 4, '8–12')]),
    C: tr([sl('remada', 3, '6–10'), sl('rosca', 2, '8–12')]),
    D: tr([sl('lateral', 4, '12–15')])
  };
  const texto = `Revisão 18/11
Treino B · Treino
- Agacha · 2 x 6-10
- Hack · 3 x 8-12
- Flexora · 3 x 8-12
Treino C · Treino
- Remada · 3 x 6-10
- Rosca · 2 x 8-12
- Facepull · 2 x 12-15
Treino D · Treino
- Lateral · 5 x 12-15`;
  const rev = lerRevisao(texto);
  const ids = { Agacha: 'agacha', Hack: 'hack', Flexora: 'flexora', Remada: 'remada', Rosca: 'rosca', Facepull: 'facepull', Lateral: 'lateral' };
  const dias = rev.dias.map(d => {
    const v = (velho as Record<string, TreinoDoPrograma>)[d.dia];
    const novo = treinoDaRevisao(d, ids, v, () => 90, 1000);
    return { dia: d.dia, v: v, novo: novo, m: mudancasDoTreino(d.dia, v, novo, v, nomeDe) };
  });
  const todas = dias.reduce((a, d) => a.concat(d.m), [] as MudancaDaRevisao[]);
  assert.deepStrictEqual(todas.map(m => m.titulo), [
    'Hack machine entra', 'Cadeira extensora sai', 'Cadeira flexora: 4 → 3 séries', 'Face pull entra', 'Elevação lateral: 4 → 5 séries'
  ], 'cinco mudanças, uma por linha');
  assert.strictEqual(todas[0].detalhe, '3 × 8–12, depois de Agachamento');
  assert.strictEqual(todas[3].detalhe, '2 × 12–15, no fim');
  // a extensora fica de fora
  const fora = todas.filter(m => m.k === 'B:sai:extensora');
  assert.strictEqual(fora.length, 1);
  const meu: Record<string, TreinoDoPrograma | undefined> = {};
  dias.forEach(d => { meu[d.dia] = aplicaMudancas(d.v, d.v, d.novo, d.m.filter(m => m.k !== 'B:sai:extensora'), 5000); });
  assert.deepStrictEqual(meu.B!.ex.map(x => x.id + ' ' + x.s), ['agacha 2', 'hack 3', 'extensora 1', 'flexora 3'],
    'o hack entrou depois do agachamento, a flexora caiu para 3, e a extensora ficou');
  assert.strictEqual(meu.B!.ex[1].desde, 5000, 'o que entra conta a partir de agora');
  assert.deepStrictEqual(meu.C!.ex.map(x => x.id), ['remada', 'rosca', 'facepull'], 'o face pull no fim');
  assert.strictEqual(meu.D!.ex[0].s, 5);
  // e o que sobra como diferença é exatamente o que ficou de fora
  assert.deepStrictEqual(diferencas(meu.B, dias[0].novo), ['só no seu: extensora']);
  assert.deepStrictEqual(diferencas(meu.C, dias[1].novo), []);
  assert.deepStrictEqual(diferencas(meu.D, dias[2].novo), []);
  // aplicar tudo deixa o programa dele igual ao do treinador; nada, igual ao de antes
  const tudo = aplicaMudancas(dias[0].v, dias[0].v, dias[0].novo, dias[0].m, 5000);
  assert.deepStrictEqual(diferencas(tudo, dias[0].novo), []);
  const nada = aplicaMudancas(dias[0].v, dias[0].v, dias[0].novo, [], 5000);
  assert.deepStrictEqual(nada, dias[0].v, 'sem mudança marcada, o treino dele fica como estava');
});

test('o que ele já tinha mudado e a revisão não toca fica; a mudança aplica só o que muda', () => {
  const velho = tr([sl('agacha', 2, '6–10'), sl('flexora', 4, '8–12')]);
  // ele: 3 séries no agachamento e outra faixa na flexora, e um exercício só dele no meio
  const meu = tr([sl('agacha', 3, '6–10'), sl('minha', 2, '10–12'), sl('flexora', 4, '10–12')]);
  const novo = tr([sl('agacha', 2, '8–12'), sl('flexora', 3, '8–12')]);
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  assert.deepStrictEqual(m.map(x => x.titulo), ['Agachamento: 6–10 → 8–12 repetições', 'Cadeira flexora: 4 → 3 séries']);
  assert.deepStrictEqual(m[0].campos, ['r']);
  assert.ok(/no seu programa: 3 × 6–10/.test(m[0].detalhe || ''), 'diz o que ele tem: ' + m[0].detalhe);
  const t = aplicaMudancas(meu, velho, novo, m, 1)!;
  assert.deepStrictEqual(t.ex.map(x => x.id + ' ' + x.s + ' ' + x.r), ['agacha 3 8–12', 'minha 2 10–12', 'flexora 3 10–12'],
    'as séries dele no agachamento e a faixa dele na flexora ficam; o só dele fica no lugar');
});

test('a ordem: os da revisão trocam de lugar entre si, e o que é só dele não sai do lugar', () => {
  const velho = tr([sl('agacha', 2, '6–10'), sl('flexora', 3, '8–12'), sl('lateral', 3, '12–15')]);
  const novo = tr([sl('lateral', 3, '12–15'), sl('agacha', 2, '6–10'), sl('flexora', 3, '8–12')]);
  const meu = tr([sl('agacha', 2, '6–10'), sl('minha', 2, '10–12'), sl('flexora', 3, '8–12'), sl('lateral', 3, '12–15')]);
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  assert.deepStrictEqual(m.map(x => x.tipo), ['ordem']);
  assert.strictEqual(m[0].detalhe, 'Elevação lateral passa para antes de Agachamento');
  const t = aplicaMudancas(meu, velho, novo, m, 1)!;
  assert.deepStrictEqual(t.ex.map(x => x.id), ['lateral', 'minha', 'agacha', 'flexora']);
  assert.deepStrictEqual(aplicaMudancas(meu, velho, novo, [], 1)!.ex.map(x => x.id), ['agacha', 'minha', 'flexora', 'lateral'], 'sem a chave, a ordem dele');
});

test('o que ele já tem não muda nada, e a linha diz', () => {
  const velho = tr([sl('agacha', 2, '6–10'), sl('extensora', 1, '10–15')]);
  const meu = tr([sl('agacha', 2, '6–10'), sl('hack', 3, '8–12')]);     // ele já tirou a extensora e pôs o hack
  const novo = tr([sl('agacha', 2, '6–10'), sl('hack', 3, '8–12')]);
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  assert.deepStrictEqual(m.map(x => [x.titulo, !!x.jaEsta]), [['Hack machine entra', true], ['Cadeira extensora sai', true]]);
  assert.ok(/já está no seu programa/.test(m[0].detalhe!) && /já não está no seu programa/.test(m[1].detalhe!));
  assert.deepStrictEqual(aplicaMudancas(meu, velho, novo, m, 1)!.ex.map(x => x.id), ['agacha', 'hack'], 'aplicar não duplica nem tira nada');
});

test('treino novo é uma mudança só; sem marcar, ele não entra no programa dele', () => {
  const rev = lerRevisao('Treino F · Braços\n- Rosca · 3 x 8-12\n- Lateral · 3 x 12-15');
  const novo = treinoDaRevisao(rev.dias[0], { Rosca: 'rosca', Lateral: 'lateral' }, undefined, () => 90, 7);
  const m = mudancasDoTreino('F', undefined, novo, undefined, nomeDe);
  assert.deepStrictEqual(m.map(x => [x.tipo, x.titulo, x.detalhe]), [['dia', 'Treino F entra na rotação', '2 exercícios, 6 séries']]);
  const t = aplicaMudancas(undefined, undefined, novo, m, 9)!;
  assert.deepStrictEqual(t.ex.map(x => x.id), ['rosca', 'lateral']);
  assert.ok(t.ex.every(x => x.desde === 9), 'conta a partir de agora');
  assert.strictEqual(aplicaMudancas(undefined, undefined, novo, [], 9), undefined, 'desmarcado, o treino fica só no do treinador');
});

test('o treino do treinador: o que a revisão não diz (RIR, descanso) fica como estava', () => {
  const velho = tr([sl('agacha', 2, '6–10', { d: 180, rir: '1–2', desde: 0 }), sl('flexora', 3, '8–12', { d: 120, rir: '1', desde: 33 })], 'Pernas');
  const rev = lerRevisao('Treino B · Pernas\n- Agacha · 3 x 6-10\n- Flexora · 3 x 8-12 · RIR 0-1 · 90 s\n- Hack · 3 x 8-12');
  const t = treinoDaRevisao(rev.dias[0], { Agacha: 'agacha', Flexora: 'flexora', Hack: 'hack' }, velho, () => 75, 500);
  assert.deepStrictEqual(t.ex.map(x => [x.id, x.d, x.rir || null, x.desde]), [
    ['agacha', 180, '1–2', 0], ['flexora', 90, '0–1', 33], ['hack', 75, null, 500]
  ]);
  assert.strictEqual(t.name, 'Pernas');
  // só o RIR e o descanso que mudaram viram mudança
  const m = mudancasDoTreino('B', velho, t, velho, nomeDe);
  assert.deepStrictEqual(m.map(x => x.titulo), ['Hack machine entra', 'Agachamento: 2 → 3 séries', 'Cadeira flexora: sobrando 1 → 0–1']);
  assert.strictEqual(m[2].detalhe, 'descanso 2 min → 1 min 30 s');
});

test('o nome do treino é uma mudança com chave: só muda se marcada, e diz o nome que ele deu', () => {
  const velho = tr([sl('agacha', 2, '6–10')], 'Pernas');
  const novo = tr([sl('agacha', 2, '6–10')], 'Pernas completas');
  const meu = tr([sl('agacha', 2, '6–10')], 'Minhas pernas');
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  assert.deepStrictEqual(m.map(x => [x.tipo, x.titulo]), [['nome', 'O treino B passa a se chamar “Pernas completas”']]);
  assert.ok(/o seu se chama “Minhas pernas”/.test(m[0].detalhe!), m[0].detalhe!);
  assert.strictEqual(aplicaMudancas(meu, velho, novo, m, 1)!.name, 'Pernas completas', 'marcada, o nome muda');
  assert.strictEqual(aplicaMudancas(meu, velho, novo, [], 1)!.name, 'Minhas pernas', 'desmarcada, nada muda (nem o nome)');
});

test('a aula aberta que vira treino com exercícios é uma mudança com chave', () => {
  const velho = { name: 'Aula', tag: '', aberto: 1 as const, ex: [] };
  const novo = tr([sl('agacha', 3, '6–10')], 'Aula');
  const m = mudancasDoTreino('HX', velho, novo, velho, nomeDe);
  assert.deepStrictEqual(m.map(x => x.tipo), ['aberto']);
  assert.match(m[0].detalhe!, /Agachamento/);
  const t = aplicaMudancas(velho, velho, novo, m, 1)!;
  assert.ok(!t.aberto && t.ex.length === 1, 'deixa de ser aula e ganha o exercício');
  assert.deepStrictEqual(aplicaMudancas(velho, velho, novo, [], 1), velho);
  const volta = mudancasDoTreino('HX', novo, velho, novo, nomeDe);
  assert.deepStrictEqual(volta.map(x => x.tipo), ['aberto']);
  assert.deepStrictEqual(aplicaMudancas(novo, novo, velho, volta, 2), velho);
  assert.deepStrictEqual(aplicaMudancas(novo, novo, velho, [], 2), novo);
  assert.deepStrictEqual(mudancasDoTreino('HX', novo, novo, velho, nomeDe), [], 'reler a mesma revisão não propõe mudanças');
  const listaRevista = tr([sl('agacha', 4, '6–10')], 'Aula');
  const recusadaAntes = mudancasDoTreino('HX', novo, listaRevista, velho, nomeDe);
  assert.ok(recusadaAntes[0].desmarcada, 'continua como aula até escolher a lista fixa');
});

test('o treino que ele deixou de fora numa revisão anterior volta como uma mudança só, desmarcada', () => {
  // sem isto, a revisão seguinte mostrava mudanças de exercício que não caíam em lugar nenhum
  const velhoF = tr([sl('rosca', 3, '8–12')], 'Braços');
  const novoF = tr([sl('rosca', 4, '8–12')], 'Braços');
  const m = mudancasDoTreino('F', velhoF, novoF, undefined, nomeDe);
  assert.deepStrictEqual(m.map(x => [x.tipo, x.titulo, !!x.desmarcada]), [['dia', 'Treino F entra na rotação', true]]);
  assert.ok(/ficou de fora do seu programa antes/.test(m[0].detalhe!));
  assert.strictEqual(aplicaMudancas(undefined, velhoF, novoF, m, 3)!.ex[0].s, 4, 'marcada, o treino entra como o treinador o mandou');
});

test('"entra" num exercício que ele já tem mexe só no que difere; "já está" não mexe em nada', () => {
  const velho = tr([sl('agacha', 2, '6–10')]);
  const meu = tr([sl('agacha', 2, '6–10'), sl('hack', 3, '8–12', { rir: '2', d: 150 })]);
  const novo = tr([sl('agacha', 2, '6–10'), sl('hack', 3, '8–12', { rir: '1', d: 150 })]);
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  assert.deepStrictEqual(m.map(x => [x.tipo, x.campos, !!x.jaEsta]), [['entra', ['rir'], false]]);
  const t = aplicaMudancas(meu, velho, novo, m, 1)!;
  assert.deepStrictEqual([t.ex[1].rir, t.ex[1].d, t.ex[1].desde], ['1', 150, 0], 'só o RIR muda; o descanso e o "desde" dele ficam');
  const igual = tr([sl('agacha', 2, '6–10'), sl('hack', 3, '8–12', { rir: '1', d: 150, desde: 7 })]);
  const m2 = mudancasDoTreino('B', velho, novo, igual, nomeDe);
  assert.ok(m2[0].jaEsta && /já está no seu programa/.test(m2[0].detalhe!));
  assert.deepStrictEqual(aplicaMudancas(igual, velho, novo, m2, 1), igual, 'aplicar "já está" não muda nada');
});

test('"sai" tira toda ocorrência, e o que entra sem um anterior vai antes do seguinte', () => {
  const velho = tr([sl('agacha', 2, '6–10'), sl('extensora', 1, '10–15')]);
  const meu = tr([sl('extensora', 1, '10–15'), sl('agacha', 2, '6–10'), sl('extensora', 1, '10–15')]);
  const novo = tr([sl('hack', 3, '8–12'), sl('agacha', 2, '6–10')]);
  const m = mudancasDoTreino('B', velho, novo, meu, nomeDe);
  const t = aplicaMudancas(meu, velho, novo, m, 1)!;
  assert.deepStrictEqual(t.ex.map(x => x.id), ['hack', 'agacha'], 'as duas extensoras saem, e o hack entra antes do agachamento');
});

test('a leitura recusa o mesmo exercício duas vezes no mesmo treino, e diz', () => {
  const r = lerRevisao('Treino B · Pernas\n- Leg press · 3 x 8-12\n- Agachamento · 2 x 6-10\n- Leg press · 2 x 15-20\nTreino C · Costas\n- Leg press · 1 x 10');
  assert.deepStrictEqual(r.dias[0].ex.map(x => x.n + ' ' + x.s), ['Leg press 3', 'Agachamento 2'], 'a primeira fica');
  assert.ok(r.problemas.some(p => /Leg press aparece duas vezes no Treino B/.test(p.motivo)), JSON.stringify(r.problemas));
  assert.strictEqual(r.dias[1].ex.length, 1, 'em outro treino, o mesmo exercício pode');
});

test('cada mudança guarda o registro inteiro, para o histórico do programa', () => {
  const velho = tr([sl('flexora', 4, '8–12', { rir: '1' }), sl('extensora', 1, '10–15')]);
  const novo = tr([sl('flexora', 3, '8–12', { rir: '0–1' }), sl('hack', 3, '8–12', { rir: '1', d: 150 })]);
  const m = mudancasDoTreino('B', velho, novo, velho, nomeDe);
  assert.deepStrictEqual(m.map(x => x.texto), [
    'Hack machine entra (3 × 8–12, RIR 1, descanso 2:30, no fim)',
    'Cadeira extensora sai (era 1 × 10–15)',
    'Cadeira flexora: 4 → 3 séries, sobrando 1 → 0–1'
  ]);
});

test('uma palavra em comum não faz candidato: "Rosca direta" não é a Rosca martelo', () => {
  const c = casaNomes(lerRevisao('Treino Z\n- Rosca direta · 3 x 8-12'),
    { 'rosca-martelo': { n: 'Rosca martelo', g: 'bíceps' } }, {});
  assert.deepStrictEqual(c['Rosca direta'], { k: 'novo' });
});

test('a dica vai até o próximo "·", com ";" dentro, e o bi-set dela marca sem sair da dica', () => {
  const r = lerRevisao(`Treino SA · Peito
- Crucifixo na polia · 3 x 10-15 · RIR 1 · 90 s · peito superior · dica: bi-set com o de baixo; mãos até o queixo; última série RIR 0
- Elevação lateral na polia · 4 x 12-20 · RIR 1 · 90 s · deltoide lateral · dica: cabo por trás do corpo; não faça bi-set aqui
- Tríceps na polia · 3 x 10-15 · dica: bi-set com o de baixo;`);
  const [cr, el, tr] = r.dias[0].ex;
  assert.strictEqual(cr.bi, 1);
  assert.strictEqual(cr.cue, 'bi-set com o de baixo; mãos até o queixo; última série RIR 0', 'a frase fica: nenhuma tela mostra o bi-set');
  assert.strictEqual(cr.g, 'peito superior');
  assert.strictEqual(el.bi, undefined, '"não faça bi-set" não marca');
  assert.strictEqual(tr.bi, undefined, 'o último do treino não tem com quem fazer bi-set');
  assert.strictEqual(tr.cue, 'bi-set com o de baixo', 'e o ";" que sobra sai');
  assert.deepStrictEqual(r.problemas.map(p => p.motivo), ['Tríceps na polia pede bi-set, mas é o último do Treino SA; fica sem bi-set']);
});

test('a dica no meio da linha ou logo depois do nome é lida como no build a4e2922', () => {
  const r = lerRevisao(`Treino A · Peito
- Supino · dica: controle a descida · 3 x 8
- Remada · 3 x 8-12 · dica: peito no apoio · RIR 1 · 2 min · costas
- Crucifixo ; 3 x 10-15 ; RIR 1 ; dica: devagar`);
  assert.deepStrictEqual(r.problemas, []);
  const [su, re, cr] = r.dias[0].ex;
  assert.deepStrictEqual([su.s, su.r, su.cue], [3, '8', 'controle a descida']);
  assert.deepStrictEqual([re.s, re.r, re.rir, re.d, re.g, re.cue], [3, '8–12', '1', 120, 'costas', 'peito no apoio']);
  assert.deepStrictEqual([cr.s, cr.r, cr.rir, cr.cue], [3, '10–15', '1', 'devagar'], 'o ";" antigo como separador continua valendo');
});

test('série de tempo vira segundos; "/lado" e "/perna" vão para a dica; "90 s" sozinho continua descanso', () => {
  const r = lerRevisao(`Treino IA · Glúteo
- Prancha lateral · 2 x 30 s/lado · RIR 2 · 60 s · core · dica: comece pela esquerda
- Afundo reverso com halteres · 3 x 8-12/perna · RIR 2 · 90 s · glúteo
- Alongamento do flexor · 2 x 40 seg · mobilidade`);
  assert.deepStrictEqual(r.problemas, []);
  const [pr, af, al] = r.dias[0].ex;
  assert.deepStrictEqual([pr.s, pr.r, pr.u, pr.q, pr.d, pr.cue], [2, '', 'seg', 30, 60, 'por lado; comece pela esquerda']);
  assert.deepStrictEqual([af.s, af.r, af.u, af.d, af.cue, af.lado], [3, '8–12', undefined, 90, 'por perna', 'perna']);
  assert.deepStrictEqual([al.u, al.q, al.d], ['seg', 40, undefined]);
});

test('"carga:" dá o tipo de carga; o que não se entende nela vira problema', () => {
  const r = lerRevisao(`Treino IB · Pernas
- Leg press 45 · 4 x 8-12 · carga: por lado
- Goblet · 4 x 8-12 · carga: halteres
- Hip thrust com barra · 4 x 8-12 · carga: barra
- Supino estranho · 3 x 8-12 · carga: elástico`);
  assert.deepStrictEqual(r.dias[0].ex.map(x => x.car), ['lado', 'halter', 'barra', undefined]);
  assert.ok(r.problemas.some(p => /carga: elástico/.test(p.motivo)), r.problemas.map(p => p.motivo).join(' | '));
});

test('a revisão leva tempo e bi-set para o programa, e a mudança deles aparece e se aplica', () => {
  const lida = lerRevisao(`Treino IA · Glúteo
- Prancha lateral · 2 x 45 s · RIR 2 · 60 s · core · dica: bi-set com o de baixo
- Dead bug · 3 x 8 · RIR 2 · 45 s · core`);
  const ids = { 'Prancha lateral': 'prancha-lateral', 'Dead bug': 'dead-bug' };
  const velho: TreinoDoPrograma = { name: 'Glúteo', ex: [
    { id: 'prancha-lateral', s: 2, r: '', u: 'seg', q: 30, d: 60, rir: '2', desde: 0 },
    { id: 'dead-bug', s: 3, r: '8', d: 45, rir: '2', desde: 0 }
  ] };
  const novo = treinoDaRevisao(lida.dias[0], ids, velho, () => 90, 1000);
  assert.deepStrictEqual([novo.ex[0].u, novo.ex[0].q, novo.ex[0].bi], ['seg', 45, 1]);
  const mud = mudancasDoTreino('IA', velho, novo, velho, id => id);
  const pr = mud.find(m => m.id === 'prancha-lateral')!;
  assert.ok(pr, 'a prancha muda');
  assert.deepStrictEqual(pr.campos, ['q', 'bi']);
  const depois = aplicaMudancas(velho, velho, novo, mud, 2000)!;
  assert.deepStrictEqual([depois.ex[0].q, depois.ex[0].bi], [45, 1]);
});

test('repetições para tempo e de volta: uma frase só, a unidade certa, e o aplicar troca a grandeza do slot', () => {
  const ids = { 'Prancha': 'prancha' };
  const reps: TreinoDoPrograma = { name: 'Core', ex: [{ id: 'prancha', s: 3, r: '8–12', d: 60, desde: 0 }] };
  const tempo = treinoDaRevisao(lerRevisao('Treino C · Core\n- Prancha · 2 x 40 s · 60 s').dias[0], ids, reps, () => 60, 1);
  const ida = mudancasDoTreino('C', reps, tempo, reps, id => id === 'prancha' ? 'Prancha' : id);
  assert.deepStrictEqual(ida.map(m => m.titulo), ['Prancha: 3 → 2 séries']);
  assert.strictEqual(ida[0].detalhe, '8–12 repetições → 40 s');
  assert.ok(!/2 × /.test(ida[0].texto.replace('2 séries', '')), ida[0].texto);
  const t1 = aplicaMudancas(reps, reps, tempo, ida, 2)!;
  assert.deepStrictEqual([t1.ex[0].s, t1.ex[0].r, t1.ex[0].u, t1.ex[0].q], [2, '', 'seg', 40]);
  const volta = treinoDaRevisao(lerRevisao('Treino C · Core\n- Prancha · 3 x 10/lado · 60 s').dias[0], ids, tempo, () => 60, 3);
  const vm = mudancasDoTreino('C', tempo, volta, t1, id => id === 'prancha' ? 'Prancha' : id);
  assert.strictEqual(vm[0].titulo, 'Prancha: 2 → 3 séries');
  assert.strictEqual(vm[0].detalhe, '40 s → 10 repetições por lado');
  const t2 = aplicaMudancas(t1, tempo, volta, vm, 4)!;
  assert.deepStrictEqual([t2.ex[0].s, t2.ex[0].r, t2.ex[0].u, t2.ex[0].q, t2.ex[0].lado], [3, '10', undefined, undefined, 'lado'],
    'de volta a repetições: a série vai ao histórico como repetições');
  const so = mudancasDoTreino('C', reps, tempo, undefined, id => id);
  assert.ok(/1 exercício, 2 séries/.test(so[0].titulo + so[0].detalhe), 'treino novo resume pelas séries');
});

test('"/lado" num exercício que já existe é dito na mudança; o bi-set nomeia o par e começa desmarcado se o seguinte dele é outro', () => {
  const v: TreinoDoPrograma = { name: 'P', ex: [{ id: 'afundo', s: 3, r: '8–12', d: 90, desde: 0 }, { id: 'pallof', s: 3, r: '10', d: 60, desde: 0 }, { id: 'prancha', s: 2, r: '', u: 'seg', q: 30, d: 60, desde: 0 }] };
  const meu: TreinoDoPrograma = { name: 'P', ex: [v.ex[0], v.ex[1], { id: 'minha', s: 2, r: '10', d: 60, desde: 0 }, v.ex[2]] };
  const nomes: Record<string, string> = { afundo: 'Afundo', pallof: 'Pallof press', prancha: 'Prancha lateral' };
  const lida = lerRevisao(`Treino P · P
- Afundo · 3 x 8-12/perna · 90 s
- Pallof press · 3 x 10 · 60 s · dica: bi-set com o de baixo
- Prancha lateral · 2 x 45 s · 60 s`);
  const novo = treinoDaRevisao(lida.dias[0], { 'Afundo': 'afundo', 'Pallof press': 'pallof', 'Prancha lateral': 'prancha' }, v, () => 60, 1);
  const m = mudancasDoTreino('P', v, novo, meu, id => nomes[id]);
  const af = m.find(x => x.id === 'afundo')!, pa = m.find(x => x.id === 'pallof')!, pr = m.find(x => x.id === 'prancha')!;
  assert.strictEqual(af.titulo, 'Afundo: 8–12 repetições → 8–12 repetições por perna');
  assert.strictEqual(pa.titulo, 'Pallof press: passa a ser bi-set com Prancha lateral');
  assert.strictEqual(pa.desmarcada, true, 'no programa dele o seguinte é outro exercício');
  assert.strictEqual(pr.titulo, 'Prancha lateral: 30 s → 45 s');
});

test('"sem bi-set" e "não faça bi-set" não marcam; o "/lado" sozinho num exercício de tempo é dito como lado; entrar em bi-set sem o par começa desmarcada', () => {
  const r = lerRevisao(`Treino A · A
- Um · 3 x 8 · dica: sem bi-set com o de baixo
- Dois · 3 x 8 · dica: não faça bi-set com o de baixo
- Três · 3 x 8`);
  assert.deepStrictEqual(r.dias[0].ex.map(x => x.bi), [undefined, undefined, undefined]);
  const v: TreinoDoPrograma = { name: 'P', ex: [{ id: 'prancha', s: 2, r: '', u: 'seg', q: 30, d: 60, desde: 0 }, { id: 'par', s: 3, r: '10', d: 60, desde: 0 }] };
  const meu: TreinoDoPrograma = { name: 'P', ex: [v.ex[0]] };
  const lida = lerRevisao(`Treino P · P
- Prancha · 2 x 30 s/lado · 60 s
- Novo · 3 x 8 · dica: bi-set com o de baixo
- Par · 3 x 10 · 60 s`);
  const novo = treinoDaRevisao(lida.dias[0], { Prancha: 'prancha', Novo: 'novo', Par: 'par' }, v, () => 60, 1);
  const m = mudancasDoTreino('P', v, novo, meu, id => ({ prancha: 'Prancha', novo: 'Novo', par: 'Par' } as Record<string, string>)[id]);
  const pr = m.find(x => x.id === 'prancha')!, nv = m.find(x => x.id === 'novo')!;
  assert.strictEqual(pr.titulo, 'Prancha: passa a ser por lado', 'e não "30 s → 30 s"');
  assert.deepStrictEqual(pr.campos, ['r']);
  assert.ok(/bi-set com Par/.test(nv.detalhe || ''), nv.detalhe || '');
  assert.strictEqual(nv.desmarcada, true, 'o par saiu do programa dele: entra desmarcada');
});
