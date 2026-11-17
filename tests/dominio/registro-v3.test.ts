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
  aderenciaDoDia, comidaDaResposta, diaInterpretavel, fechaDia, poeComidaNoDia,
  refeicoesDeHoje, respostaDoDia
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
