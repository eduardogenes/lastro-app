// O catálogo do sistema (docs/catalogo/00-desenho.md, etapa 0).
//
// O que não pode acontecer: uma chave de histórico mudar, um exercício mudar
// de cara na tela, uma cópia ruim do banco derrubar o catálogo, o nome de um
// exercício passar a levar a outro sem a pessoa decidir, ou o build 13 (em
// produção nos outros aparelhos) perder uma edição numa fusão com o novo.

import { test } from 'vitest';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  SEMENTE, VERSAO_DA_SEMENTE, catalogoDasLinhas, chaveDoNome, comDiferenca, deLinha, diferencaDaSemente,
  ehDoSistema, exerciciosDoSistema, indiceDeNomes, maisNova, paraLinha, resolveId, validaCatalogo,
  type CatalogoDoSistema
} from '../../src/dominio/catalogo';
import { NOVOS_DA_V22 } from '../../src/dominio/catalogo-semente';
import { EX_BASE, montaCatalogo, slugEx } from '../../src/dominio/programa';
import { casaNomes, lerRevisao, nomesNoMesmoId } from '../../src/dominio/revisao';
import { PLANO_ATUAL, migraPlano13, reduzReferencias } from '../../src/dominio/migracoes';
import { chaveDeApelido, funde } from '../../src/dominio/sincronia';
import { funde as funde13 } from './fixtures/sincronia-build13';
import type { Estado } from '../../src/dominio/tipos';

/** Igualdade de conteúdo: ordem de chave e chave indefinida não contam. */
function canon(x: unknown): string {
  return JSON.stringify(x, function (_k, v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const o: Record<string, unknown> = {};
      Object.keys(v).sort().forEach(function (k) { if (v[k] !== undefined) o[k] = v[k]; });
      return o;
    }
    return v;
  });
}

function copia<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

// ---------- a semente ----------

test('para todo id do código, o catálogo do sistema devolve o MESMO exercício', () => {
  const sis = exerciciosDoSistema(SEMENTE);
  Object.keys(EX_BASE).forEach(function (id) {
    assert.strictEqual(canon(sis[id]), canon(EX_BASE[id]), id);
  });
});

test('nenhum id da semente v1 sai do catálogo (lista congelada)', () => {
  const v1: string[] = JSON.parse(readFileSync(new URL('./fixtures/catalogo-ids-v1.json', import.meta.url), 'utf8'));
  assert.strictEqual(v1.length, 194);
  v1.forEach(function (id) { assert.ok(SEMENTE.ex[id], id + ' saiu da semente: o histórico dele ficaria sem nome'); });
});

test('os ids da semente são os slugs de sempre, e cabem na regra do banco', () => {
  Object.keys(SEMENTE.ex).forEach(function (id) {
    assert.strictEqual(SEMENTE.ex[id].id, id);
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, id);
  });
  NOVOS_DA_V22.forEach(function (x) { assert.ok(SEMENTE.ex[slugEx(x.n)], x.n); });
  assert.strictEqual(SEMENTE.v, 0, 'a semente é a versão 0 do banco');
});

test('todo exercício tem movimento e equipamento conhecidos; frações entre 0 e 1', () => {
  Object.values(SEMENTE.ex).forEach(function (e) {
    assert.notStrictEqual(e.mov, 'outro', e.id + ' sem movimento');
    assert.ok(e.eq, e.id);
    e.mus.forEach(function (m) { assert.ok(m[1] > 0 && m[1] <= 1, e.id); });
    if (e.g) assert.deepStrictEqual(e.mus[0], [e.g, 1], e.id + ': o principal é o grupo do volume');
    e.equiv.forEach(function (q) { assert.ok(SEMENTE.ex[q], e.id + ' → ' + q); });
  });
});

test('nome alternativo nunca é o nome de outro exercício, nem leva a dois', () => {
  const visto: Record<string, string> = {};
  Object.values(SEMENTE.ex).forEach(function (e) {
    e.alt.forEach(function (n) {
      const k = chaveDoNome(n);
      assert.ok(!SEMENTE.ex[k], n + ' é o nome principal de ' + k);
      assert.ok(!visto[k] || visto[k] === e.id, n + ' leva a ' + visto[k] + ' e a ' + e.id);
      visto[k] = e.id;
    });
  });
  assert.strictEqual(Object.keys(indiceDeNomes(SEMENTE)).length, Object.keys(visto).length);
});

test('a linha do banco ida e volta é o mesmo exercício', () => {
  Object.values(SEMENTE.ex).forEach(function (e) {
    assert.strictEqual(canon(deLinha(copia(paraLinha(e)))), canon(e), e.id);
  });
});

test('o SQL gerado está em dia com a semente, e só insere', () => {
  const sql = readFileSync(new URL('../../supabase/migrations/20261123120100_catalogo_semente.sql', import.meta.url), 'utf8');
  Object.keys(SEMENTE.ex).forEach(function (id) { assert.ok(sql.indexOf("  ('" + id + "', ") >= 0, id + ' fora do SQL: rode npm run catalogo:sql'); });
  assert.ok(sql.indexOf('conteúdo versão ' + VERSAO_DA_SEMENTE) >= 0, 'versão da semente');
  assert.doesNotMatch(sql, /do update/, 'a semente não sobrescreve a curadoria do banco');
  const esquema = readFileSync(new URL('../../supabase/migrations/20261123120000_catalogo.sql', import.meta.url), 'utf8');
  assert.match(esquema, /for each row execute function public\.catalogo_sobe_versao/, 'a versão sobe por linha, não por comando');
  assert.doesNotMatch(esquema, /for each statement/);
  assert.match(esquema, /new\.carga is distinct from old\.carga/, 'o banco recusa trocar a carga');
});

// ---------- a cópia baixada ----------

function linhas(c: CatalogoDoSistema, v: number) {
  return {
    v: v, ex: Object.values(c.ex).map(e => copia(paraLinha(e))),
    redir: Object.keys(c.redir).map(de => ({ de: de, para: c.redir[de] }))
  };
}

test('cópia do banco igual à semente: serve, e a diferença guardada é vazia', () => {
  const c = catalogoDasLinhas(linhas(SEMENTE, 194), SEMENTE)!;
  assert.ok(c);
  const d = diferencaDaSemente(c, SEMENTE);
  assert.deepStrictEqual(d.ex, {});
  assert.strictEqual(canon(comDiferenca(SEMENTE, d)!.ex), canon(SEMENTE.ex));
});

test('servir e ser mais nova são perguntas separadas (versão do banco × do aparelho)', () => {
  // a versão do banco é um contador de linhas gravadas: não se compara com a
  // versão do conteúdo da semente, e uma cópia de versão baixa também serve
  const baixa = catalogoDasLinhas(linhas(SEMENTE, 1), SEMENTE)!;
  assert.ok(baixa, 'serve');
  assert.ok(maisNova(baixa, SEMENTE), 'é mais nova que a semente (0)');
  const ja = Object.assign({}, SEMENTE, { v: 300 });
  assert.ok(!maisNova(catalogoDasLinhas(linhas(SEMENTE, 300), SEMENTE)!, ja), 'a mesma versão que o aparelho já tem não é mais nova');
  assert.ok(maisNova(catalogoDasLinhas(linhas(SEMENTE, 301), SEMENTE)!, ja));
});

test('cópia que perdeu um id da semente não serve', () => {
  const b = linhas(SEMENTE, 5);
  b.ex = b.ex.filter(r => r.id !== 'pushdown');
  assert.strictEqual(catalogoDasLinhas(b, SEMENTE), null, 'o histórico de pushdown ficaria sem nome');
});

test('união: o id antigo sai da tabela, redireciona, e aparece com o exercício que ficou', () => {
  const b = linhas(SEMENTE, 5);
  b.ex = b.ex.filter(r => r.id !== 'pec-deck');
  b.redir.push({ de: 'pec-deck', para: 'peck-deck-unilateral' });
  const c = catalogoDasLinhas(b, SEMENTE)!;
  assert.ok(c);
  assert.strictEqual(resolveId('pec-deck', c.redir), 'peck-deck-unilateral');
  assert.ok(ehDoSistema('pec-deck', c));
  const sis = exerciciosDoSistema(c);
  assert.strictEqual(canon(sis['pec-deck']), canon(sis['peck-deck-unilateral']), 'materializada');
  // a pessoa tinha só a referência reduzida do pec-deck
  const cat = montaCatalogo({ 'pec-deck': { m: 6 } } as Estado['ex'], sis);
  assert.strictEqual(cat['pec-deck'].n, sis['peck-deck-unilateral'].n);
  assert.ok(cat['pec-deck'].car && cat['pec-deck'].g, 'carga e grupo completos');
  // e a cópia guardada no aparelho, ao reabrir, continua redirecionando
  const volta = comDiferenca(SEMENTE, copia(diferencaDaSemente(c, SEMENTE)))!;
  assert.strictEqual(exerciciosDoSistema(volta)['pec-deck'].n, sis['peck-deck-unilateral'].n);
});

test('id sem base nenhuma, com só o carimbo na pessoa: fantasma nomeado, nunca sem nome', () => {
  const cat = montaCatalogo({ 'saiu-do-sistema': { m: 1 }, 'meu': { n: 'Meu', car: 'pino', g: 'peito', c: 0, cue: '' } } as Estado['ex'],
                            exerciciosDoSistema(SEMENTE));
  assert.strictEqual(cat['saiu-do-sistema'].n, 'saiu-do-sistema');
  assert.strictEqual(cat['saiu-do-sistema'].sumido, 1);
  assert.strictEqual(typeof cat['saiu-do-sistema'].car, 'string');
  assert.strictEqual(cat['meu'].sumido, undefined, 'pessoal com nome não é fantasma');
});

test('união em círculo, linha com carga inválida: não serve', () => {
  const b = linhas(SEMENTE, 5);
  b.redir.push({ de: 'a-x', para: 'b-x' }, { de: 'b-x', para: 'a-x' });
  assert.strictEqual(catalogoDasLinhas(b, SEMENTE), null);
  const ruim = linhas(SEMENTE, 5);
  (ruim.ex[0] as Record<string, unknown>).carga = 'kg';
  assert.strictEqual(catalogoDasLinhas(ruim, SEMENTE), null);
  assert.strictEqual(resolveId('a-x', { 'a-x': 'b-x', 'b-x': 'a-x' }), 'a-x', 'ciclo não trava');
});

test('regra de curadoria: trocar a carga ou a grandeza de um exercício da semente não serve', () => {
  const carga = linhas(SEMENTE, 5);
  (carga.ex.find(r => r.id === 'leg-press') as Record<string, unknown>).carga = 'pino';
  assert.strictEqual(catalogoDasLinhas(carga, SEMENTE), null, '40 por lado não é 40 na placa');
  const grandeza = linhas(SEMENTE, 5);
  (grandeza.ex.find(r => r.id === 'corrida') as Record<string, unknown>).unidade = 'cal';
  assert.strictEqual(catalogoDasLinhas(grandeza, SEMENTE), null);
  const nome = linhas(SEMENTE, 5);
  (nome.ex.find(r => r.id === 'leg-press') as Record<string, unknown>).nome = 'Leg press 45 graus';
  assert.ok(catalogoDasLinhas(nome, SEMENTE), 'o nome o moderador pode corrigir');
});

test('a diferença guardada leva a mudança do moderador, e só ela', () => {
  const mudado = copia(SEMENTE);
  mudado.v = 3;
  mudado.ex['pushdown'].alt.push('Tríceps pulley');
  const d = diferencaDaSemente(mudado, SEMENTE);
  assert.deepStrictEqual(Object.keys(d.ex), ['pushdown']);
  const volta = comDiferenca(SEMENTE, copia(d))!;
  assert.ok(volta.ex['pushdown'].alt.indexOf('Tríceps pulley') >= 0);
  assert.strictEqual(volta.v, 3);
  assert.strictEqual(comDiferenca(SEMENTE, 'lixo'), null);
});

test('validaCatalogo recusa forma inválida', () => {
  assert.strictEqual(validaCatalogo(null, SEMENTE), null);
  assert.strictEqual(validaCatalogo({ v: 9, ex: { x: { id: 'y' } } }, SEMENTE), null);
  assert.strictEqual(validaCatalogo({ v: -1, ex: copia(SEMENTE.ex) }, SEMENTE), null);
});

// ---------- os nomes ----------

const V22 = readFileSync(new URL('./fixtures/revisao-v22.txt', import.meta.url), 'utf8');

function catalogoDaTela(ex: Record<string, unknown> = {}) {
  const cat = montaCatalogo(ex as Estado['ex'], exerciciosDoSistema(SEMENTE));
  const c: Record<string, { n: string; g?: string; arq?: 1 }> = {};
  Object.keys(cat).forEach(function (k) { c[k] = { n: cat[k].n, g: cat[k].g, arq: cat[k].arq }; });
  return c;
}
const ALT = indiceDeNomes(SEMENTE);

test('a v2.2 inteira: os novos e os nomes alternativos casam sem perguntar', () => {
  const lida = lerRevisao(V22);
  const casa = casaNomes(lida, catalogoDaTela(), {}, { alt: ALT });
  NOVOS_DA_V22.forEach(function (x) {
    assert.deepStrictEqual(casa[x.n], { k: 'igual', id: slugEx(x.n) }, x.n);
  });
  assert.deepStrictEqual(casa['Panturrilha sentado'], { k: 'igual', id: 'panturrilha-sentada' });
  assert.deepStrictEqual(casa['Hip thrust com barra'], { k: 'igual', id: 'elevacao-pelvica-com-barra' });
  assert.deepStrictEqual(casa['Mesa flexora sentada'], { k: 'igual', id: 'cadeira-flexora-sentada' });
  // variação que muda a carga não é nome alternativo: continua perguntando
  assert.strictEqual(casa['Supino inclinado no Smith 30°'].k, 'pergunta');
});

test('quem já tem o exercício com o id do nome continua com ele, não com o alternativo', () => {
  // no build 13, a v2.2 criou 'panturrilha-sentado' (pessoal, com histórico)
  const lida = lerRevisao(V22);
  const cat = catalogoDaTela({ 'panturrilha-sentado': { n: 'Panturrilha sentado', car: 'lado', g: 'panturrilha', c: 0, cue: '' } });
  const casa = casaNomes(lida, cat, {}, { alt: ALT });
  assert.deepStrictEqual(casa['Panturrilha sentado'], { k: 'igual', id: 'panturrilha-sentado' });
});

test('apelido e nome exato em treinos diferentes vão os DOIS para o mesmo exercício', () => {
  // ele já respondeu que "Supino inclinado no Smith 30°" é o supino no Smith;
  // a revisão seguinte usa os dois nomes, um em cada treino. Tirar o id do
  // jogo depois do apelido mandava o nome exato para um exercício novo (-2),
  // e o histórico do supino ficava para trás.
  const alvo = 'supino-inclinado-no-smith';
  const texto = 'Revisão 01/12\nTreino SA · Peito\n- Supino inclinado no Smith 30° · 4 x 6-10 · RIR 1 · 2:30 · peito superior\n' +
    'Treino SC · Peito\n- ' + EX_BASE[alvo].n + ' · 4 x 6-10 · RIR 1 · 2:30 · peito superior';
  const lida = lerRevisao(texto);
  const casa = casaNomes(lida, catalogoDaTela(), {}, { apelidos: { [chaveDoNome('Supino inclinado no Smith 30°')]: alvo }, alt: ALT });
  assert.deepStrictEqual(casa['Supino inclinado no Smith 30°'], { k: 'igual', id: alvo, por: 'apelido' });
  assert.deepStrictEqual(casa[EX_BASE[alvo].n], { k: 'igual', id: alvo });
  assert.deepStrictEqual(nomesNoMesmoId(lida, casa), [], 'treinos diferentes: não é aviso');
});

test('dois nomes do MESMO treino no mesmo exercício viram aviso', () => {
  const alvo = 'supino-inclinado-no-smith';
  const lida = lerRevisao('Treino SA · Peito\n- Supino inclinado no Smith 30° · 4 x 6-10\n- ' + EX_BASE[alvo].n + ' · 3 x 8-12');
  const casa = casaNomes(lida, catalogoDaTela(), {}, { apelidos: { [chaveDoNome('Supino inclinado no Smith 30°')]: alvo } });
  assert.deepStrictEqual(nomesNoMesmoId(lida, casa), [{ dia: 'SA', id: alvo, nomes: ['Supino inclinado no Smith 30°', EX_BASE[alvo].n] }]);
});

test('o apelido vem antes do id do nome (inverter os passos fica vermelho)', () => {
  // ele disse que "Pullover na polia alta" (que é um id do sistema) é o
  // pullover em máquina, que é o que ele usa
  const lida = lerRevisao('Treino A · Costas\n- Pullover na polia alta · 3 x 12');
  const casa = casaNomes(lida, catalogoDaTela(), {}, { apelidos: { 'pullover-na-polia-alta': 'pullover-em-maquina' }, alt: ALT });
  assert.deepStrictEqual(casa['Pullover na polia alta'], { k: 'igual', id: 'pullover-em-maquina', por: 'apelido' });
});

test('o palpite não propõe um id que a certeza já levou', () => {
  const lida = lerRevisao('Treino A · Pernas\n- Leg press · 3 x 10\n- Leg press bilateral · 3 x 10');
  const casa = casaNomes(lida, catalogoDaTela(), {});
  assert.deepStrictEqual(casa['Leg press'], { k: 'igual', id: 'leg-press' });
  assert.notStrictEqual((casa['Leg press bilateral'] as { id?: string }).id, 'leg-press');
});

test('o nome atual de um exercício renomeado vem antes do nome alternativo ("Voador")', () => {
  // "Voador" é nome alternativo do pec deck; mas ela renomeou o peck deck
  // unilateral para "Voador", que é como a academia dela chama
  const cat = catalogoDaTela({ 'peck-deck-unilateral': { n: 'Voador', m: 1 } });
  const lida = lerRevisao('Treino A · Peito\n- Voador · 3 x 10-12 · RIR 1 · 90 s · peito');
  assert.deepStrictEqual(casaNomes(lida, cat, {}, { alt: ALT })['Voador'], { k: 'igual', id: 'peck-deck-unilateral' });
  // sem renomear, o alternativo leva ao pec deck
  assert.deepStrictEqual(casaNomes(lida, catalogoDaTela(), {}, { alt: ALT })['Voador'], { k: 'igual', id: 'pec-deck' });
});

test('apelido para id que não existe mais é ignorado', () => {
  const lida = lerRevisao(V22);
  const casa = casaNomes(lida, catalogoDaTela(), {}, { apelidos: { [chaveDoNome('Dead bug')]: 'sumiu' } });
  assert.deepStrictEqual(casa['Dead bug'], { k: 'igual', id: 'dead-bug' });
});

// ---------- a referência (sem plano novo) ----------

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 13,
    prog: null, rot: null, ex: {}, mods: null, progLog: [], apagados: {}, falta: {}, descanso: {}
  } as Estado, extra);
}

test('o plano continua 13: o build em produção não conhece outro', () => {
  assert.strictEqual(PLANO_ATUAL, 13);
});

test('reduzir: a tela monta o MESMO catálogo antes e depois, e nenhuma chave de histórico muda', () => {
  const s = estado({
    logs: { pushdown: [{ t: 1, sid: 1, sets: [[30, 10]] }], 'dead-bug': [{ t: 2, sid: 2, sets: [[0, 8]] }] } as Estado['logs'],
    ex: {
      pushdown: Object.assign({}, EX_BASE['pushdown'], { n: 'Tríceps no pulley', m: 5 }),
      'leg-press': Object.assign({}, EX_BASE['leg-press'], { m: 6 }),
      'dead-bug': { n: 'Dead bug', car: 'corpo', g: 'core', c: 0, cue: 'costas no chão', m: 7 },
      'meu-aparelho': { n: 'Meu aparelho', car: 'pino', g: 'peito', c: 0, cue: '', meu: 1, m: 8 },
      'antigo~Puxada aberta pronada': { n: 'Puxada aberta pronada', car: 'pino', g: 'dorsal', c: 0, cue: '', arq: 1 }
    } as Estado['ex']
  });
  const logs = copia(s.logs);
  const antes = montaCatalogo(copia(s.ex));           // o build 13: base = código
  assert.strictEqual(reduzReferencias(s), 2);
  const depois = montaCatalogo(s.ex, exerciciosDoSistema(SEMENTE));
  Object.keys(antes).forEach(function (id) { assert.strictEqual(canon(depois[id]), canon(antes[id]), id); });
  assert.deepStrictEqual(s.logs, logs);
  assert.strictEqual(s.plano, 13);
  assert.deepStrictEqual(s.ex['pushdown'], { n: 'Tríceps no pulley', m: 5 });
  assert.deepStrictEqual(s.ex['leg-press'], { m: 6 });
  assert.strictEqual(s.ex['dead-bug'].cue, 'costas no chão');
  assert.strictEqual(s.apelidos, undefined, 'apelidos é opcional: quem cria o padrão é normalizaEstado');
  const build13 = montaCatalogo(s.ex);
  Object.keys(antes).forEach(function (id) { assert.strictEqual(canon(build13[id]), canon(antes[id]), '13: ' + id); });
  // idempotente
  const uma = copia(s);
  assert.strictEqual(reduzReferencias(s), 0);
  assert.deepStrictEqual(s, uma);
});

test('a fixture do build 13 (v2.2 colada, renome): o catálogo da tela não muda e nada se move', () => {
  const s: Estado = JSON.parse(readFileSync(new URL('./fixtures/estado-plano-13.json', import.meta.url), 'utf8'));
  assert.strictEqual(s.plano, 13);
  const antes = montaCatalogo(copia(s.ex));
  const ex = copia(s.ex);
  migraPlano13(s);
  reduzReferencias(s);
  assert.strictEqual(s.plano, 13);
  const depois = montaCatalogo(s.ex, exerciciosDoSistema(SEMENTE));
  Object.keys(antes).forEach(function (id) { assert.strictEqual(canon(depois[id]), canon(antes[id]), id); });
  assert.deepStrictEqual(s.ex, ex, 'o 13 guarda o renome como { n, m }, e a v2.2 só com ids fora do código');
  // os cinco que nasceram pessoais (docs/catalogo/00-desenho.md, lista do moderador)
  ['crucifixo-na-polia-baixa-para-alta', 'abducao-de-quadril-na-maquina', 'panturrilha-sentado',
   'rosca-bayesiana-na-polia', 'crucifixo-inverso-no-peck-deck'].forEach(function (id) {
    assert.ok(s.ex[id], id);
    assert.ok(!ehDoSistema(id, SEMENTE), id + ' é pessoal');
  });
});

// ---------- a fusão com o build 13 ----------

test('edição de programa feita no build novo atravessa uma fusão no 13 e volta intacta', () => {
  const T = 1790000000000;
  const novo = estado({ mtime: T + 5, carimbosEm: T + 5, carimbos: { prog: T + 5 },
    prog: { A: { name: 'editado no novo', tag: '', ex: [] } },
    apelidos: { 'hip-thrust-maquina': { id: 'elevacao-pelvica-na-maquina', m: T + 1 } } });
  // o 13 registrou uma série depois (mtime maior), com o programa antigo
  const velho = estado({ mtime: T + 9, carimbosEm: T + 9, carimbos: { prog: T - 100 },
    prog: { A: { name: 'antigo', tag: '', ex: [] } },
    logs: { pushdown: [{ t: T + 9, sid: T + 9, sets: [[30, 10]] }] } as Estado['logs'] });
  const no13 = funde13(velho, novo, T + 10).estado;
  assert.strictEqual(no13.plano, 13);
  assert.strictEqual(no13.prog!.A.name, 'editado no novo', 'o 13 funde por documento: mesmo plano');
  const volta = funde(novo, no13, T + 11).estado;
  assert.strictEqual(volta.prog!.A.name, 'editado no novo');
  assert.strictEqual(volta.logs.pushdown.length, 1, 'e a série do 13 chegou');
  assert.deepStrictEqual(volta.apelidos, novo.apelidos, 'o apelido sobrevive: o 13 pode largá-lo, a união o traz de volta');
});

test('a lápide de um apelido atravessa o build 13', () => {
  const T = 1790000000000;
  const novo = estado({ mtime: T + 5, apelidos: {}, apagados: { [chaveDeApelido('x')]: T + 4 } });
  const velho = estado({ mtime: T + 9, apelidos: { x: { id: 'pushdown', m: T + 1 } } });
  const no13 = funde13(velho, novo, T + 10).estado;
  assert.ok(no13.apagados[chaveDeApelido('x')] != null, 'o 13 une as lápides');
  const volta = funde(novo, no13, T + 11).estado;
  assert.strictEqual((volta.apelidos || {}).x, undefined);
});

test('a cópia completa que volta do 13 no empate de carimbo é reduzida de novo', () => {
  // o 13 nunca reduz; no empate de `m`, a fusão de coleção escolhe pelo mtime
  const T = 1790000000000;
  const novo = estado({ mtime: T, ex: { pushdown: { n: 'Tríceps no pulley', m: 5 } } as Estado['ex'] });
  const velho = estado({ mtime: T + 9, ex: { pushdown: Object.assign({}, EX_BASE['pushdown'], { n: 'Tríceps no pulley', m: 5 }) } as Estado['ex'] });
  const r = funde(novo, velho, T + 10).estado;
  assert.ok(Object.keys(r.ex.pushdown).length > 2, 'veio a completa');
  reduzReferencias(r);                       // o que migraEstado faz depois da fusão
  assert.deepStrictEqual(r.ex.pushdown, { n: 'Tríceps no pulley', m: 5 });
});

test('apelidos: os dois lados ficam, o mais novo vence, e a lápide mata', () => {
  const a = estado({ apelidos: { um: { id: 'pushdown', m: 1 }, dois: { id: 'leg-press', m: 5 } } });
  const b = estado({ apelidos: { dois: { id: 'leg-press-45', m: 9 }, tres: { id: 'pec-deck', m: 2 } },
                     apagados: { [chaveDeApelido('um')]: 3 } });
  const r = funde(a, b, 10).estado;
  assert.deepStrictEqual(r.apelidos, { dois: { id: 'leg-press-45', m: 9 }, tres: { id: 'pec-deck', m: 2 } });
});

test('um plano futuro 14 com os mesmos documentos funde por documento com o 13', () => {
  const T = 1000;
  const aqui = estado({ plano: 14, mtime: T, carimbos: { prog: T + 5 }, carimbosEm: T,
                        prog: { A: { name: 'aqui', tag: '', ex: [] } } });
  const la = estado({ plano: 13, mtime: T + 10, carimbos: { comida: T + 10 }, carimbosEm: T + 10,
                      prog: { A: { name: 'lá', tag: '', ex: [] } } });
  const r = funde(aqui, la, T + 20).estado;
  assert.strictEqual(r.prog!.A.name, 'aqui');
  assert.strictEqual(r.plano, 14);
});

// ---------- o espelho ----------

test('o espelho mostra os apelidos em treino/exercicios.md', async () => {
  const { montaArquivos } = await import('../../ferramentas/espelho/monta');
  const s = estado({ apelidos: { 'hip-thrust-maquina': { id: 'elevacao-pelvica-na-maquina', m: 1, n: 'Hip thrust máquina' } } });
  const md = montaArquivos(s, { agora: 1790000000000 })['treino/exercicios.md'];
  assert.match(md, /Também chamado de/);
  const linha = md.split('\n').find(l => l.indexOf('`elevacao-pelvica-na-maquina`') >= 0)!;
  assert.match(linha, /“Hip thrust máquina”/);
});

// ---------- curadoria (25/11/2026) ----------
import { CURADORIA } from '../../src/dominio/catalogo-curadoria';

test('todo equivalente do catálogo aponta para um exercício que existe, e não para si mesmo', () => {
  Object.keys(SEMENTE.ex).forEach(id => {
    SEMENTE.ex[id].equiv.forEach(q => {
      assert.ok(SEMENTE.ex[q], id + ' → equivalente inexistente ' + q);
      assert.notStrictEqual(q, id, id + ' é equivalente de si mesmo');
    });
  });
});

test('a curadoria entra na semente sem mudar id, carga nem grandeza, e nenhum nome alternativo leva a dois exercícios', () => {
  const dono: Record<string, string> = {};
  Object.keys(SEMENTE.ex).forEach(id => {
    const e = SEMENTE.ex[id];
    [e.n].concat(e.alt).forEach(n => {
      const k = slugEx(n);
      assert.ok(!dono[k] || dono[k] === id, '"' + n + '" leva a ' + dono[k] + ' e a ' + id);
      dono[k] = id;
    });
  });
  Object.keys(CURADORIA).forEach(id => {
    const c = CURADORIA[id], e = SEMENTE.ex[id];
    if (c.mus) assert.deepStrictEqual(JSON.stringify(e.mus), JSON.stringify(c.mus));
    if (c.cue) assert.ok(e.cue, id + ' sem dica');
    if (c.conferido) assert.strictEqual(e.cur, undefined, id + ' continua marcado para curadoria');
    if (EX_BASE[id]) assert.strictEqual(e.car, EX_BASE[id].car, id + ' mudou a carga');
  });
  assert.strictEqual(SEMENTE.ex['mergulho-na-maquina-assistida'].mus[0][0], 'tríceps');
  assert.ok(SEMENTE.ex['agachamento-goblet'].alt.includes('Agachamento taça'));
});

test('o SQL de curadoria gerado está em dia e só faz UPDATE nas colunas permitidas', () => {
  const sql = readFileSync('supabase/migrations/20261125120000_catalogo_curadoria.sql', 'utf8');
  const ups = sql.split('\n').filter(l => l.startsWith('update '));
  assert.strictEqual(ups.length, Object.keys(CURADORIA).length);
  ups.forEach(l => {
    assert.ok(!/ carga =| unidade =| id =/.test(l.replace(/ where id = .*$/, '')), 'coluna proibida: ' + l.slice(0, 80));
  });
  assert.ok(!/insert|delete|drop/i.test(sql.replace(/--.*$/gm, '')));
});
