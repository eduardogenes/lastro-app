// O dado novo da direção 3 (docs/redesign-3/00-plano.md, Fase 0, item 4).
//
// Seis registros novos, todos opcionais e com padrão na leitura, sem migração:
// a resposta do dia, a série registrada depois, o que mudou na sessão de fotos,
// a foto fora do padrão, o número de leituras da fita e o que aparece. Cada
// teste aqui guarda um jeito de perder ou deturpar um deles: a resposta que
// apaga uma marca, o campo que some na sincronização, o agente que lê uma hora
// que ninguém informou.

import { test } from 'vitest';
import assert from 'node:assert';
import { ALIMENTOS_BASE, PLANO_BASE } from '../../src/dominio/nutricao/alimentos';
import {
  aderenciaDoDia, comidaDaResposta, diaInterpretavel, ehTamanhoDaOutra, fechaDia, poeComidaNoDia,
  refeicoesDeHoje, respostaDoDia, tamanhosDaMarca, totalRegistrado, TAMANHOS_DA_OUTRA
} from '../../src/dominio/nutricao/calculo';
import type { DiaComida, DiaComidaHist } from '../../src/dominio/nutricao/tipos';
import { DOCUMENTOS, funde } from '../../src/dominio/sincronia';
import type { Estado, Log, Marca, SessaoFoto } from '../../src/dominio/tipos';
import {
  PADRAO, comFita, comModulo, fitaLigada, ligado, normalizaModulos
} from '../../src/dominio/modulos';
import { montaArquivos } from '../../ferramentas/espelho/monta';
import { semeiaProg } from '../../src/dominio/programa';

const cat = ALIMENTOS_BASE;
const T0 = new Date(2026, 10, 10, 21, 0).getTime();
const DIA = 86400000;

function estado(extra: Partial<Estado> = {}): Estado {
  return Object.assign({
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: { peso: [], cintura: [] }, carga: {}, export: 0, plano: 12,
    prog: null, rot: null, ex: {}, mods: null, progLog: [],
    cadencia: null, comida: { plano: null, alimentos: {}, ocultos: {} },
    dia: null, ajuste: 0, perfManual: null,
    compras: { comprado: {}, extras: [], removidas: {}, dias: 7 },
    mtime: 0, apagados: {}
  } as Estado, extra);
}

// ---------- a resposta do dia ----------

const refsTreino = refeicoesDeHoje(PLANO_BASE, true, false);

test('"Foi, sim" marca as refeições sem marca e conta o dia, com adesão inteira', () => {
  const c = comidaDaResposta('sim', refsTreino, {}, T0);
  assert.strictEqual(c.aderencia, 'plano');
  assert.strictEqual(c.pordia, 1);
  assert.deepStrictEqual(Object.keys(c.done || {}).sort(), refsTreino.map(r => r.id).sort());

  const r = poeComidaNoDia([], '2026-11-09', Object.assign({ cadencia: 'treino' as const }, c),
                           PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.ok(r.dia, 'o dia vira linha');
  assert.ok(diaInterpretavel(r.dia!), 'e entra na conta dos 11 de 14');
  assert.strictEqual(aderenciaDoDia(r.dia!, refsTreino), 1);
  assert.strictEqual(r.dia!.pordia, 1, 'e diz que foi respondido pela pergunta');
});

test('a resposta completa o dia e não reescreve a refeição já marcada', () => {
  // O almoço foi marcado na hora, como "não comi". À noite ele responde "Foi,
  // sim": o almoço continua "não comi", com a hora dele.
  const almoco = T0 - 8 * 3600000;
  const antes: DiaComidaHist[] = [
    fechaDia({ data: '2026-11-09', done: { almoco: almoco }, como: { almoco: 'nao' }, agua: 0, escala: {}, cadencia: 'treino' } as DiaComida,
             PLANO_BASE, cat, 1, 0, almoco)
  ];
  const c = comidaDaResposta('sim', refsTreino, antes[0].done, T0);
  assert.ok(!(c.done && 'almoco' in c.done), 'a resposta não toca na refeição marcada');

  const r = poeComidaNoDia(antes, '2026-11-09', c, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.strictEqual(r.dia!.done.almoco, almoco, 'a hora do almoço fica');
  assert.strictEqual(r.dia!.como && r.dia!.como.almoco, 'nao', 'e o "não comi" também');
  assert.ok(aderenciaDoDia(r.dia!, refsTreino)! < 1, 'e a adesão do dia reflete o almoço não comido');
});

test('"Quase" conta o dia como fora do plano; "Não lembro" tira o dia da conta sem apagar nada', () => {
  const quase = comidaDaResposta('quase', refsTreino, {}, T0);
  assert.strictEqual(quase.aderencia, 'fora');
  const rq = poeComidaNoDia([], '2026-11-08', quase, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.ok(diaInterpretavel(rq.dia!), '"quase" ainda é um dia que o app sabe ler');

  const naosei = comidaDaResposta('naosei', refsTreino, { almoco: T0 - 3600000 }, T0);
  assert.strictEqual(naosei.aderencia, 'perdido');
  assert.strictEqual(naosei.done, undefined, '"não lembro" não inventa marca');
  const antes = poeComidaNoDia([], '2026-11-07', { done: { almoco: T0 - 3600000 } }, PLANO_BASE, cat, '2026-11-10', 1, null, T0 - 1);
  const rn = poeComidaNoDia(antes.hist, '2026-11-07', naosei, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.ok(!diaInterpretavel(rn.dia!), 'o dia sai da conta');
  assert.ok(rn.dia!.done.almoco, 'e a marca que existia continua guardada');
});

test('a resposta se lê de volta, e um dia marcado refeição a refeição não tem resposta', () => {
  assert.strictEqual(respostaDoDia({ aderencia: 'plano', pordia: 1 }), 'sim');
  assert.strictEqual(respostaDoDia({ pordia: 1 }), 'sim');
  assert.strictEqual(respostaDoDia({ aderencia: 'fora', pordia: 1 }), 'quase');
  assert.strictEqual(respostaDoDia({ aderencia: 'perdido', pordia: 1 }), 'naosei');
  assert.strictEqual(respostaDoDia({ aderencia: 'fora' }), null, 'sem `pordia` é o registro de antes');
  assert.strictEqual(respostaDoDia(null), null);
});

test('o dia aberto respondido pela pergunta leva a resposta ao fechar', () => {
  const d = { data: '2026-11-10', done: { pre: T0 }, agua: 0, escala: {}, cadencia: 'treino', aderencia: 'fora', pordia: 1 } as DiaComida;
  const h = fechaDia(d, PLANO_BASE, cat, 1, 0, T0);
  assert.strictEqual(h.pordia, 1);
  assert.strictEqual(h.aderencia, 'fora');
});

// ---------- a sincronização leva os campos novos ----------

test('a resposta do dia atravessa a fusão, nos dois sentidos', () => {
  const dia = (pordia: boolean, m: number): DiaComidaHist => ({
    d: '2026-11-09', done: { almoco: T0 }, agua: 0, escala: {}, aderencia: 'fora',
    tot: { kcal: 1, p: 1, c: 1, g: 1 }, pv: 1, m: m, ...(pordia ? { pordia: 1 as const } : {})
  });
  // o lado mais novo respondeu: a resposta vence
  const a = funde(estado({ mtime: T0, comidaHist: [dia(false, T0)] }),
                  estado({ mtime: T0 + 1, comidaHist: [dia(true, T0 + 1)] }), T0 + 2).estado;
  assert.strictEqual(a.comidaHist[0].pordia, 1);
  // o lado mais novo desfez a resposta (marcou refeição a refeição): ela sai
  const b = funde(estado({ mtime: T0 + 1, comidaHist: [dia(true, T0)] }),
                  estado({ mtime: T0, comidaHist: [dia(false, T0 + 5)] }), T0 + 6).estado;
  assert.strictEqual(b.comidaHist[0].pordia, undefined);
});

test('o que mudou na sessão de fotos atravessa a fusão, que remonta a sessão campo a campo', () => {
  const s = (muda: SessaoFoto['muda'], m: number): SessaoFoto =>
    ({ d: '2026-11-12', t: T0, m: m, fotos: { 'frente-relaxado': { v: T0, ext: 'webp' } }, ...(muda ? { muda } : {}) });
  const so = funde(estado({ mtime: T0, protocolo: { poses: null, sessoes: [s(['luz'], T0)] } }),
                   estado({ mtime: T0 - DIA, protocolo: { poses: null, sessoes: [] } }), T0 + 1).estado;
  assert.deepStrictEqual(so.protocolo!.sessoes[0].muda, ['luz'], 'a sessão de um lado só chega inteira');

  const dois = funde(estado({ mtime: T0, protocolo: { poses: null, sessoes: [s(undefined, T0)] } }),
                     estado({ mtime: T0 + 1, protocolo: { poses: null, sessoes: [s(['luz', 'roupa'], T0 + 1)] } }), T0 + 2).estado;
  assert.deepStrictEqual(dois.protocolo!.sessoes[0].muda, ['luz', 'roupa'], 'e o lado mais novo decide');
});

test('série registrada depois, foto fora do padrão e leituras da fita viajam com o próprio registro', () => {
  const log: Log = { t: T0, sid: T0, sets: [[60, 10]], dp: 1, m: T0 };
  const marca: Marca = { t: T0, v: 86, n: 1, m: T0 };
  const sessao: SessaoFoto = { d: '2026-11-12', t: T0, m: T0,
    fotos: { 'frente-relaxado': { v: T0, ext: 'webp', cap: { via: 'app', l: 1, a: 1, fora: ['altura'] } } } };
  const r = funde(
    estado({ mtime: T0, logs: { ag: [log] }, body: { peso: [], cintura: [marca] } as Estado['body'],
             protocolo: { poses: null, sessoes: [sessao] } }),
    estado({ mtime: T0 - DIA }), T0 + 1).estado;
  assert.strictEqual(r.logs.ag[0].dp, 1);
  assert.strictEqual(r.body.cintura[0].n, 1);
  assert.deepStrictEqual(r.protocolo!.sessoes[0].fotos['frente-relaxado'].cap!.fora, ['altura']);
});

test('o que aparece funde como documento: vence o lado onde mudou por último', () => {
  assert.ok((DOCUMENTOS as readonly string[]).includes('modulos'));
  const com = (mtime: number, carimbo: number, modulos: Estado['modulos']) =>
    estado({ mtime, carimbos: { modulos: carimbo }, carimbosEm: mtime, modulos });
  // o celular desligou a água às 9h; o notebook, mais novo no resto, não mexeu
  const r = funde(com(T0, T0, { agua: 0 }), com(T0 + 3600000, 0, null), T0 + 3600001).estado;
  assert.deepStrictEqual(r.modulos, { agua: 0 }, 'a escolha não se perde para o estado mais novo');
});

// ---------- o que aparece ----------

test('sem escolha nenhuma, aparece o que já aparecia', () => {
  assert.ok(ligado(null, 'agua') && ligado(null, 'peso') && ligado(null, 'cardio') && ligado(null, 'fotos'));
  assert.ok(ligado(null, 'comida'), 'a comida nasce ligada: quem atualizou continua vendo o plano');
  assert.deepStrictEqual(normalizaModulos({ comida: 0 }), { comida: 0 }, 'e desligar a comida é guardado');
  assert.ok(!ligado(null, 'dobras'), 'as dobras já nasciam escondidas');
  assert.ok(!ligado(null, 'noite') && !ligado(null, 'vesperaFotos'), 'lembrete que ninguém pediu é cobrança');
});

test('voltar ao padrão apaga a escolha, e o estado guarda só o que foi escolhido', () => {
  const a = comModulo(null, 'agua', false);
  assert.deepStrictEqual(a, { agua: 0 });
  assert.deepStrictEqual(comModulo(a, 'agua', true), {});
  assert.strictEqual(normalizaModulos(comModulo(a, 'agua', true)), null);
  Object.keys(PADRAO).forEach(k => assert.ok(PADRAO[k as keyof typeof PADRAO] === 0 || PADRAO[k as keyof typeof PADRAO] === 1));
});

test('medida já medida aparece mesmo desligada pelo padrão; só a escolha explícita a esconde', () => {
  assert.ok(!fitaLigada(null, 'coxa', false, false), 'nunca medida e desligada pelo padrão: não aparece');
  assert.ok(fitaLigada(null, 'coxa', false, true), 'medida antes: aparece');
  assert.ok(!fitaLigada(comFita(null, 'coxa', false), 'coxa', false, true), 'desligada à mão: some, com o histórico guardado');
  assert.ok(fitaLigada(comFita(null, 'braco', true), 'braco', false, false));
});

test('a preferência guardada é limpa: chave estranha e valor fora de 0 ou 1 não entram', () => {
  assert.deepStrictEqual(normalizaModulos({ agua: 0, peso: 'sim', lixo: 1, fita: { coxa: 1, 'x;y': 1, braco: 2 } }),
                         { agua: 0, fita: { coxa: 1 } });
  assert.strictEqual(normalizaModulos('agua'), null);
  assert.strictEqual(normalizaModulos([1]), null);
});

// ---------- a pasta dos agentes ----------

test('a pasta dos agentes diz o que foi respondido pelo dia, registrado depois, lido uma vez e tirado fora do padrão', () => {
  const T = new Date(2026, 9, 28, 6, 18).getTime();
  const prog = semeiaProg();
  const a0 = prog.A.ex[0].id;
  const S = {
    plano: 12, prog, rot: ['A', 'B', 'C', 'D', 'E', 'HX'],
    done: [{ day: 'A', t: T, sid: T, dur: 3600000 }],
    logs: { [a0]: [{ t: T, sid: T, sets: [[20, 10]], dp: 1 }] },
    body: { peso: [], cintura: [{ t: T, v: 84, n: 1 }] },
    comidaHist: [{ d: '2026-10-27', done: { almoco: T - DIA }, agua: 0, escala: {}, aderencia: 'plano', pordia: 1,
                   tot: { kcal: 700, p: 30, c: 90, g: 20 }, pv: 1 }],
    protocolo: { poses: null, sessoes: [{ d: '2026-10-28', t: T, muda: ['luz'],
      fotos: { 'frente-relaxado': { v: T, ext: 'webp', cap: { via: 'app', l: 1, a: 1, fora: ['altura', 'distancia'] } } } }] }
  };
  const arq = montaArquivos(S as unknown as Partial<Estado>, { agora: T + DIA });
  const series = arq['treino/series.csv'] as string;
  assert.ok(series.split('\n')[0].endsWith(',registrado_depois'));
  assert.ok(series.split('\n')[1].endsWith(',1'), 'a série posta em dia sai marcada');

  const dias = arq['nutricao/dias.csv'] as string;
  assert.ok(dias.split('\n')[0].endsWith(',respondido_pelo_dia'));
  const linha = dias.split('\n').filter(l => l.startsWith('2026-10-27'))[0];
  assert.ok(linha.endsWith(',1'));
  // a hora sai como 06:18 na coluna das refeições; num dia respondido pela
  // pergunta, ela não aparece
  assert.ok(/Almoço|almoco/.test(linha), 'a refeição está na linha');
  assert.ok(!/\d{2}:\d{2}/.test(linha), 'e sai sem a hora da resposta');

  const medidas = arq['corpo/medidas.csv'] as string;
  assert.ok(medidas.split('\n')[0].endsWith(',leituras'));
  assert.ok(medidas.split('\n').filter(l => l.includes('cintura'))[0].endsWith(',1'));

  const fotos = arq['corpo/fotos.md'] as string;
  assert.ok(fotos.includes('Mudou em relação à sessão anterior: a luz'));
  assert.ok(fotos.includes('fora do padrão: altura, distância'));
});

// ---------- "mandar para os agentes" ----------

test('os pedidos de avaliação dos dois aparelhos se somam, e o mesmo par mandado de novo só renova a data', () => {
  const p = (pose: string, de: string, t: number) => ({ pose: pose as never, de: de, ate: '2026-11-12', t: t });
  const r = funde(estado({ mtime: T0, paraAvaliar: [p('frente-relaxado', '2026-10-01', T0), p('todas', '2026-10-15', T0)] }),
                  estado({ mtime: T0 + 1, paraAvaliar: [p('perfil-direito', '2026-10-01', T0 + 1), p('todas', '2026-10-15', T0 + 5)] }), T0 + 6).estado;
  assert.strictEqual(r.paraAvaliar!.length, 3, 'nenhum pedido some porque o outro aparelho mandou outro');
  assert.strictEqual(r.paraAvaliar!.filter(x => x.pose === 'todas')[0].t, T0 + 5, 'o repetido fica com a data mais nova');
  const nada = funde(estado({ mtime: T0 }), estado({ mtime: T0 + 1 }), T0 + 2).estado;
  assert.strictEqual(nada.paraAvaliar, undefined, 'sem pedido de nenhum lado, o campo não nasce');
});

test('a pasta dos agentes mostra cada pedido com o par, o peso da semana e a ressalva de cada sessão', () => {
  const S = estado({
    body: { peso: [{ t: new Date(2026, 9, 1, 7).getTime(), v: 76.3 }, { t: new Date(2026, 10, 12, 7).getTime(), v: 77.9 }], cintura: [] } as never,
    protocolo: { poses: null, sessoes: [
      { d: '2026-10-01', t: T0, fotos: { 'frente-relaxado': { v: T0, ext: 'webp' } } },
      { d: '2026-11-12', t: T0, muda: ['luz'], fotos: { 'frente-relaxado': { v: T0 + 1, ext: 'webp' } } }
    ] },
    paraAvaliar: [{ pose: 'frente-relaxado', de: '2026-10-01', ate: '2026-11-12', t: T0 }]
  });
  const arq = montaArquivos(S, { agora: T0 + DIA });
  const md = arq['corpo/para-avaliar.md'] as string;
  assert.ok(md, 'o arquivo existe com pedido');
  assert.ok(/## \S+ 01\/10\/2026 → \S+ 12\/11\/2026 · Frente relaxado/.test(md), md.slice(0, 900));
  assert.ok(md.includes('42 dias entre as duas'));
  assert.ok(md.includes('76,3 kg') && md.includes('77,9 kg'), 'o peso da semana de cada sessão');
  assert.ok(md.includes('outra luz') && md.includes('no padrão'), 'e a ressalva de cada uma');
  assert.ok(md.includes('(fotos/2026-11-12/frente-relaxado.webp)'), 'com o arquivo');
  assert.strictEqual(montaArquivos(estado(), { agora: T0 })['corpo/para-avaliar.md'], undefined, 'sem pedido, não existe');
});

// ---------- o tamanho do "comi outra coisa" (peça 6, 18/11/2026) ----------
//
// Decisão do dono (17/11): guardar o tamanho, para o nutricionista ver. Campo
// novo e opcional (`tam`), atributo da marca `'fora'`. Cada teste guarda um
// jeito de perder ou deturpar o tamanho: o que fica solto numa refeição que não
// foi "outra coisa", o que some na fusão ou no fecho do dia, a regra que passa
// a contar o que só devia ser mostrado.

const ALMOCO = 'almoco';

test('a guarda do tamanho: sai o solto e o de marca que não é "fora"; o valor de uma versão mais nova fica', () => {
  assert.deepStrictEqual([...TAMANHOS_DA_OUTRA], ['parecido', 'mais', 'menos', 'nsei'], 'as quatro respostas da folha, na ordem');
  assert.ok(ehTamanhoDaOutra('mais') && !ehTamanhoDaOutra('grande') && !ehTamanhoDaOutra(1));
  const h = {
    done: { almoco: T0, jantar: T0, lanche: T0, ceia: T0, colacao: T0, merenda: T0 },
    como: { almoco: 'fora', jantar: 'nao', ceia: 'fora', colacao: 'pouco', merenda: 'fora' } as Record<string, string>,
    tam: { almoco: 'mais', jantar: 'mais', lanche: 'menos', ceia: 'enorme', pre: 'parecido', colacao: 'mais', merenda: 7 }
  };
  assert.deepStrictEqual(tamanhosDaMarca(h as never), { almoco: 'mais', ceia: 'enorme', colacao: 'mais' },
    'sai o do "não comi", o da marca como o plano, o da refeição sem marca e o que não é texto; fica o valor e o "como" que este app não conhece');
  assert.strictEqual(tamanhosDaMarca({ done: {}, tam: { almoco: 'mais' } }), undefined, 'sem nada válido, o campo some');
  assert.strictEqual(tamanhosDaMarca({ done: { almoco: T0 }, como: { almoco: 'fora' } }), undefined, 'sem tamanho, nada');
});

test('o fecho do dia leva o tamanho da marca "fora", e só ele', () => {
  const dia: DiaComida = { data: '2026-11-09', done: { almoco: T0, jantar: T0 }, agua: 2, escala: {},
                           como: { almoco: 'fora', jantar: 'nao' }, tam: { almoco: 'menos', jantar: 'parecido' } };
  const h = fechaDia(dia, PLANO_BASE, cat, 1, 0, T0);
  assert.deepStrictEqual(h.tam, { almoco: 'menos' }, 'o do "não comi" não desce: descreveria outra coisa');
  const sem = fechaDia({ data: '2026-11-09', done: { almoco: T0 }, agua: 0, escala: {}, como: { almoco: 'fora' } }, PLANO_BASE, cat, 1, 0, T0);
  assert.ok(!('tam' in sem), 'marca de antes, sem tamanho: o campo não nasce');
});

test('nenhuma regra lê o tamanho: o total e a adesão do dia são os mesmos com qualquer resposta', () => {
  const refs = refeicoesDeHoje(PLANO_BASE, false, false);
  const base: DiaComida = { data: '2026-11-09', done: { almoco: T0, jantar: T0 }, agua: 0, escala: {}, como: { almoco: 'fora' } };
  const semTam = fechaDia(base, PLANO_BASE, cat, 1, 0, T0);
  TAMANHOS_DA_OUTRA.forEach(function (t) {
    const com = Object.assign({}, base, { tam: { almoco: t } });
    assert.deepStrictEqual(totalRegistrado(PLANO_BASE, cat, com, false, false), totalRegistrado(PLANO_BASE, cat, base, false, false),
      'o total continua com os números do plano (' + t + ')');
    const h = fechaDia(com, PLANO_BASE, cat, 1, 0, T0);
    assert.strictEqual(aderenciaDoDia(h, refs), aderenciaDoDia(semTam, refs), 'e a adesão também (' + t + ')');
    assert.strictEqual(diaInterpretavel(h), diaInterpretavel(semTam));
  });
});

test('o pôr em dia preserva o tamanho dito, e a troca da marca para outra coisa que não "fora" o tira', () => {
  const antes = fechaDia({ data: '2026-11-07', done: { almoco: T0 - 3 * DIA }, agua: 0, escala: {},
                           como: { almoco: 'fora' }, tam: { almoco: 'mais' } }, PLANO_BASE, cat, 1, 0, T0 - 3 * DIA);
  // marcar o jantar esquecido não mexe no tamanho do almoço
  const r = poeComidaNoDia([antes], '2026-11-07', { done: { jantar: T0 } }, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.strictEqual(r.dia!.tam!.almoco, 'mais', 'completar o dia não apaga o que foi dito');
  // o almoço passa a "não comi": o tamanho de "outra coisa" não descreve mais nada
  const r2 = poeComidaNoDia(r.hist, '2026-11-07', { done: { almoco: T0 }, como: { almoco: 'nao' } }, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.strictEqual(r2.dia!.como!.almoco, 'nao');
  assert.ok(!r2.dia!.tam, 'e o tamanho saiu com a marca que ele descrevia');
});

test('o tamanho viaja com a marca na fusão, e morre com a lápide dela', () => {
  const d = '2026-11-10';
  const aqui = estado({ mtime: T0, dia: { data: d, done: {}, agua: 0, escala: {} } });
  const la = estado({ mtime: T0 - 1000, dia: { data: d, done: { almoco: T0 - 600000 }, agua: 0, escala: {},
                                               como: { almoco: 'fora' }, tam: { almoco: 'menos' } } });
  const r = funde(aqui, la, T0).estado;
  assert.strictEqual(r.dia!.como!.almoco, 'fora');
  assert.strictEqual(r.dia!.tam!.almoco, 'menos', 'o tamanho veio com a marca');
  const morto = estado({ mtime: T0, dia: { data: d, done: {}, agua: 0, escala: {} }, apagados: { ['comida:' + d + ':almoco']: T0 - 1 } });
  const r2 = funde(morto, la, T0).estado;
  assert.strictEqual(r2.dia!.done.almoco, undefined);
  assert.strictEqual(r2.dia!.tam, undefined, 'e não sobra solto');
  // nos dias fechados, o mesmo
  const h = { d: '2026-11-08', done: { almoco: T0 - 2 * DIA }, agua: 0, escala: {}, como: { almoco: 'fora' as const },
              tam: { almoco: 'parecido' as const }, tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: T0 - 2 * DIA } as DiaComidaHist;
  const h3 = funde(estado({ mtime: T0, comidaHist: [] }), estado({ mtime: T0 - 1, comidaHist: [h] }), T0).estado;
  assert.strictEqual(h3.comidaHist![0].tam!.almoco, 'parecido', 'o dia que só o outro aparelho tem chega inteiro');
  const comMarcaSo = { d: '2026-11-08', done: { almoco: T0 - 2 * DIA }, agua: 0, escala: {}, tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: T0 - DIA } as DiaComidaHist;
  const h4 = funde(estado({ mtime: T0, comidaHist: [comMarcaSo] }), estado({ mtime: T0 - 1, comidaHist: [h] }), T0).estado;
  assert.ok(!h4.comidaHist![0].tam, 'a mesma marca dos dois lados: vale o atributo do lado que fica, sem misturar');
});

test('marcar, desfazer e marcar de novo num aparelho chega ao outro, que ainda tinha a marca velha', () => {
  // O defeito que existia: a fusão recusava a marca nova do lado de lá porque
  // este lado ainda tinha a velha, e logo depois matava a velha pela lápide. A
  // refeição ficava sem marca até a próxima sincronia. É o caminho do "Comi",
  // "Desfazer", "Comi outra coisa".
  const d = '2026-11-10', t1 = T0 - 3600000, morte = T0 - 1800000, t2 = T0 - 600000;
  const refez = estado({ mtime: T0, dia: { data: d, done: { almoco: t2 }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'mais' } },
                         apagados: { ['comida:' + d + ':almoco']: morte } });
  const velho = estado({ mtime: T0 - 2000000, dia: { data: d, done: { almoco: t1 }, agua: 0, escala: {} } });
  [funde(velho, refez, T0).estado, funde(refez, velho, T0).estado].forEach(function (r, i) {
    const lado = i === 0 ? 'no aparelho velho' : 'no que refez';
    assert.strictEqual(r.dia!.done.almoco, t2, 'a marca nova, ' + lado);
    assert.strictEqual(r.dia!.como!.almoco, 'fora', 'com o "outra coisa", ' + lado);
    assert.strictEqual(r.dia!.tam!.almoco, 'mais', 'e o tamanho, ' + lado);
  });
  // e o contrário: a marca velha com atributo não empresta o atributo à nova
  const velhoFora = estado({ mtime: T0 - 2000000, dia: { data: d, done: { almoco: t1 }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'menos' } } });
  const refezTudo = estado({ mtime: T0, dia: { data: d, done: { almoco: t2 }, agua: 0, escala: {} }, apagados: { ['comida:' + d + ':almoco']: morte } });
  const r3 = funde(velhoFora, refezTudo, T0).estado;
  assert.strictEqual(r3.dia!.done.almoco, t2, 'a marca refeita como o plano');
  assert.ok(!(r3.dia!.como && r3.dia!.como.almoco) && !(r3.dia!.tam && r3.dia!.tam.almoco), 'sem o "outra coisa" nem o tamanho da velha');
});

test('duas marcas da mesma refeição feitas sem se ver: cada aparelho fica com a sua, e a resposta do dia não apaga o "outra coisa"', () => {
  // "Vale a marca mais nova" foi tentado e saiu (revisão de dado, 18/11/2026):
  // a resposta das 21h marca o almoço com a hora da resposta, e venceria o
  // "outra coisa, bem mais" das 12h40 do outro aparelho nos dois lados.
  const d = '2026-11-10', almoco = new Date(2026, 10, 10, 12, 40).getTime(), resposta = new Date(2026, 10, 10, 21, 0).getTime();
  const marcou = estado({ mtime: almoco, dia: { data: d, done: { almoco: almoco }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'mais' } } });
  const respondeu = estado({ mtime: resposta, dia: { data: d, done: { almoco: resposta, jantar: resposta }, agua: 0, escala: {}, pordia: 1 } });
  const noQueMarcou = funde(marcou, respondeu, T0).estado;
  assert.strictEqual(noQueMarcou.dia!.done.almoco, almoco, 'a marca de verdade fica');
  assert.strictEqual(noQueMarcou.dia!.como!.almoco, 'fora');
  assert.strictEqual(noQueMarcou.dia!.tam!.almoco, 'mais', 'com o tamanho');
  assert.strictEqual(noQueMarcou.dia!.done.jantar, resposta, 'e o que só a resposta marcou entra');
  const noQueRespondeu = funde(respondeu, marcou, T0).estado;
  assert.strictEqual(noQueRespondeu.dia!.done.almoco, resposta, 'o outro fica com a dele: não convergem, e nenhuma se perde');
});

test('a porção é da marca que ficou, e não do dia de carimbo mais novo', () => {
  const d = '2026-11-08', t = T0 - 2 * DIA;
  const linha = (extra: Partial<DiaComidaHist>) => Object.assign({ d: d, done: {}, agua: 0, escala: {}, tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: t }, extra) as DiaComidaHist;
  // o "Comi metade" que só o outro lado tem, com este lado mais novo (mexeu na água)
  const meia = linha({ done: { almoco: t }, escala: { almoco: 0.5 }, m: t });
  const agua = linha({ done: {}, agua: 3, m: t + 1000 });
  const r = funde(estado({ mtime: T0, comidaHist: [agua] }), estado({ mtime: T0 - 1, comidaHist: [meia] }), T0).estado;
  assert.strictEqual(r.comidaHist![0].escala.almoco, 0.5, 'a metade veio com a marca: não virou "tudo"');
  // e o contrário: a marca deste lado guarda a porção dela, com o outro mais novo
  const r2 = funde(estado({ mtime: T0 - 1, comidaHist: [meia] }), estado({ mtime: T0, comidaHist: [agua] }), T0).estado;
  assert.strictEqual(r2.comidaHist![0].escala.almoco, 0.5);
  // duas marcas diferentes: o tamanho de um lado não se mistura com a porção do outro
  const fora = linha({ done: { almoco: t + 50 }, como: { almoco: 'fora' }, tam: { almoco: 'mais' }, m: t + 50 });
  const meiaNova = linha({ done: { almoco: t + 10 }, escala: { almoco: 0.5 }, m: t + 9000 });
  const r3 = funde(estado({ mtime: T0, comidaHist: [fora] }), estado({ mtime: T0 - 1, comidaHist: [meiaNova] }), T0).estado;
  assert.strictEqual(r3.comidaHist![0].tam!.almoco, 'mais');
  assert.ok(!(r3.comidaHist![0].escala && r3.comidaHist![0].escala.almoco), '"bem mais" não vira "porção 50%"');
});

test('a porção da marca que a lápide levou sai junto, e não cai na próxima marca', () => {
  // A marcou "Comi metade" às 12h e contou um copo às 15h (o dia dela é o mais
  // novo); B, que já tinha o "metade", desfez às 13h. Sem isto, A ficava com a
  // porção 50% solta, e o "outra coisa, bem mais" seguinte saía pela metade.
  const d = '2026-11-10', meio = new Date(2026, 10, 10, 12, 0).getTime(), desfez = new Date(2026, 10, 10, 13, 0).getTime(), copo = new Date(2026, 10, 10, 15, 0).getTime();
  const A = estado({ mtime: copo, dia: { data: d, done: { almoco: meio }, agua: 1, escala: { almoco: 0.5 } } });
  const B = estado({ mtime: desfez, dia: { data: d, done: {}, agua: 0, escala: {} }, apagados: { ['comida:' + d + ':almoco']: desfez } });
  const r = funde(A, B, T0).estado;
  assert.strictEqual(r.dia!.done.almoco, undefined, 'a lápide levou a marca');
  assert.ok(!(r.dia!.escala && r.dia!.escala.almoco), 'e a porção dela');
});

test('o que só este lado tem é contado, para a sincronia empurrar', () => {
  const d = '2026-11-08', t = T0 - 2 * DIA;
  const linha = (extra: Partial<DiaComidaHist>) => Object.assign({ d: d, done: {}, agua: 0, escala: {}, tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: t }, extra) as DiaComidaHist;
  const aqui = linha({ done: { almoco: t, jantar: t } });
  const la = linha({ done: { almoco: t } });
  assert.ok(funde(estado({ mtime: T0, comidaHist: [aqui] }), estado({ mtime: T0, comidaHist: [la] }), T0).resumo.comidaDaqui >= 1, 'a marca que só tem aqui');
  assert.ok(funde(estado({ mtime: T0, comidaHist: [aqui] }), estado({ mtime: T0, comidaHist: [] }), T0).resumo.comidaDaqui >= 1, 'o dia que só tem aqui');
  const igual = funde(estado({ mtime: T0, comidaHist: [la] }), estado({ mtime: T0, comidaHist: [la] }), T0).resumo;
  assert.strictEqual(igual.comidaDaqui, 0, 'iguais, nada a empurrar');
});

test('a mesma marca dos dois lados, com o tamanho só num deles: o tamanho fica', () => {
  // O caso do aparelho com build antigo, que fundiu a marca sem conhecer o campo.
  const d = '2026-11-10', t = T0 - 600000;
  const comTam = estado({ mtime: T0 - 1, dia: { data: d, done: { almoco: t }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'parecido' } } });
  const semTam = estado({ mtime: T0, dia: { data: d, done: { almoco: t }, agua: 0, escala: {}, como: { almoco: 'fora' } } });
  assert.strictEqual(funde(semTam, comTam, T0).estado.dia!.tam!.almoco, 'parecido', 'chega a quem não tinha');
  const volta = funde(comTam, semTam, T0);
  assert.strictEqual(volta.estado.dia!.tam!.almoco, 'parecido', 'e não se perde em quem tinha');
  assert.ok(volta.resumo.comidaDaqui >= 1, 'e quem tinha sabe que precisa empurrar: a nuvem ficou sem ele');
});

test('o pôr em dia de um build antigo recarimba o dia sem o tamanho: o tamanho fica', () => {
  const d = '2026-11-07', t0 = T0 - 3 * DIA, t1 = T0;
  const novo = { d: d, done: { almoco: t0 }, agua: 0, escala: {}, como: { almoco: 'fora' as const }, tam: { almoco: 'mais' },
                 tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: t0 } as DiaComidaHist;
  // o build antigo marcou o jantar esquecido, recarimbou o dia inteiro e não conhecia o tamanho
  const antigo = { d: d, done: { almoco: t1, jantar: t1 }, agua: 0, escala: {}, como: { almoco: 'fora' as const },
                   tot: { kcal: 0, p: 0, c: 0, g: 0 }, pv: 1, m: t1 } as DiaComidaHist;
  const r = funde(estado({ mtime: T0 - DIA, comidaHist: [novo] }), estado({ mtime: T0, comidaHist: [antigo] }), T0).estado;
  const h = r.comidaHist![0];
  assert.strictEqual(h.tam!.almoco, 'mais', 'o tamanho não se perde');
  assert.strictEqual(h.done.jantar, t1, 'e o jantar do outro aparelho entra');
});

test('a correção de um dia passado ("Fora" que vira "Tudo") chega ao outro aparelho, pela lápide', () => {
  const d = '2026-11-07';
  const velho = fechaDia({ data: d, done: { almoco: T0 - 3 * DIA }, agua: 0, escala: {}, como: { almoco: 'fora' }, tam: { almoco: 'mais' } },
                         PLANO_BASE, cat, 1, 0, T0 - 3 * DIA);
  // o pôr em dia é "desmarcar e marcar de novo": lápide na marca velha, a nova
  // depois dela, e `como: null` para o "Tudo"
  const corrigido = poeComidaNoDia([velho], d, { done: { almoco: T0 + 1 }, como: { almoco: null } }, PLANO_BASE, cat, '2026-11-10', 1, null, T0);
  assert.ok(!corrigido.dia!.como && !corrigido.dia!.tam, 'o "Tudo" tirou o "fora" e o tamanho, no aparelho que corrigiu');
  const aqui = estado({ mtime: T0, comidaHist: corrigido.hist, apagados: { ['comida:' + d + ':almoco']: T0 } });
  const la = estado({ mtime: T0 - DIA, comidaHist: [velho] });
  [funde(aqui, la, T0).estado, funde(la, aqui, T0).estado].forEach(function (r, i) {
    const h = r.comidaHist!.filter(function (x) { return x.d === d; })[0];
    assert.ok(!(h.como && h.como.almoco) && !(h.tam && h.tam.almoco), 'a correção vale ' + (i === 0 ? 'aqui' : 'lá também'));
    assert.strictEqual(h.done.almoco, T0 + 1, 'com a marca nova');
  });
});

test('dois aparelhos corrigem refeições diferentes do mesmo dia passado: as duas correções ficam', () => {
  const d = '2026-11-07', t0 = T0 - 3 * DIA;
  const dia = fechaDia({ data: d, done: { almoco: t0, jantar: t0 }, agua: 0, escala: {} }, PLANO_BASE, cat, 1, 0, t0);
  // B corrige o jantar para "não comi"; depois A corrige o almoço para metade, sem se verem
  const tB = T0 - 1000, tA = T0;
  const b = poeComidaNoDia([dia], d, { done: { jantar: tB + 1 }, como: { jantar: 'nao' } }, PLANO_BASE, cat, '2026-11-10', 1, null, tB);
  const a = poeComidaNoDia([dia], d, { done: { almoco: tA + 1 }, como: { almoco: null }, escala: { almoco: 0.5 } }, PLANO_BASE, cat, '2026-11-10', 1, null, tA);
  const B = estado({ mtime: tB, comidaHist: b.hist, apagados: { ['comida:' + d + ':jantar']: tB } });
  const A = estado({ mtime: tA, comidaHist: a.hist, apagados: { ['comida:' + d + ':almoco']: tA } });
  [funde(A, B, T0 + 1).estado, funde(B, A, T0 + 1).estado].forEach(function (r) {
    const h = r.comidaHist!.filter(function (x) { return x.d === d; })[0];
    assert.strictEqual(h.como!.jantar, 'nao', 'a correção de B');
    assert.strictEqual(h.escala.almoco, 0.5, 'e a de A');
  });
});

test('a pasta dos agentes diz o tamanho da refeição fora do plano, e só dela', () => {
  const S = estado({
    comidaHist: [{ d: '2026-11-08', done: { almoco: new Date(2026, 10, 8, 12, 40).getTime(), jantar: new Date(2026, 10, 8, 20, 10).getTime(),
                                             lanche: new Date(2026, 10, 8, 16, 0).getTime() },
                   agua: 4, escala: {}, como: { almoco: 'fora', jantar: 'fora', lanche: 'nao' }, tam: { almoco: 'mais', lanche: 'menos' },
                   tot: { kcal: 2000, p: 150, c: 200, g: 60 }, pv: 1, m: T0 } as DiaComidaHist]
  });
  const csv = montaArquivos(S, { agora: T0 })['nutricao/dias.csv'] as string;
  const linha = csv.split('\n').filter(function (l) { return l.indexOf('2026-11-08') === 0; })[0];
  assert.ok(/Almoço 12:40 \(fora do plano, bem mais que o plano\)/.test(linha), linha);
  assert.ok(/Jantar 20:10 \(fora do plano\)/.test(linha), 'sem tamanho dito, só "fora do plano": ' + linha);
  assert.ok(!/bem menos/.test(linha), 'o tamanho preso a um "não comeu" não é lido');
  const leia = montaArquivos(S, { agora: T0 })['LEIA-ME.md'] as string;
  assert.ok(/tamanho da refeição fora do plano/.test(leia), 'e o LEIA-ME explica o que é');
});
