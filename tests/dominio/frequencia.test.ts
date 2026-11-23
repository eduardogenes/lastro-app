import { test } from 'vitest';
import assert from 'node:assert/strict';
import { chaveDeDescanso, chaveDeFalta, MOTIVOS_FALTA, respondeFrequencia } from '../../src/dominio/frequencia';
import { estadoInicial } from '../../src/dominio/primeira-vez';
import { funde, lapidesDoApagamento, soTemAbertura } from '../../src/dominio/sincronia';
import { instanteDaData } from '../../src/dominio/protocolo';
import type { Estado, MotivoFalta } from '../../src/dominio/tipos';

const dia = '2026-11-15'; // domingo
const agora = instanteDaData('2026-11-16');
const kd = chaveDeDescanso(dia), kf = chaveDeFalta(dia);

function nasDuasOrdens(a: Estado, b: Estado, conferir: (s: Estado) => void) {
  conferir(funde(a, b, agora).estado);
  conferir(funde(b, a, agora).estado);
}

test('domingo começa em aberto e a falta, mesmo sem motivo, é histórico de quem começou vazio', () => {
  const s = estadoInicial();
  assert.ok(soTemAbertura(s));
  assert.deepEqual(s.falta, {});
  assert.deepEqual(s.descanso, {});
  for (const d of ['2026-11-16', '2026-11-17', '2026-02-31'])
    assert.equal(respondeFrequencia(s, d, 'falta', undefined, agora), false);
  assert.equal(respondeFrequencia(s, dia, 'falta', undefined, agora), true);
  assert.deepEqual(s.falta![dia], { m: agora });
  assert.equal(soTemAbertura({ ...s, apagados: {} }), false);
  for (const motivo of MOTIVOS_FALTA) {
    assert.ok(respondeFrequencia(s, dia, 'falta', motivo, agora));
    assert.equal(s.falta![dia].motivo, motivo);
  }
  assert.deepEqual(s.done, []);
});

test('a correção mais recente vence dos dois lados, mesmo quando o relógio está atrasado', () => {
  const a = estadoInicial();
  respondeFrequencia(a, dia, 'descanso', undefined, agora + 5000);
  const b = structuredClone(a);
  respondeFrequencia(b, dia, 'falta', 'viagem', agora);
  nasDuasOrdens(a, b, r => {
    assert.deepEqual(r.falta![dia], b.falta![dia]);
    assert.equal(r.descanso[dia], undefined);
    assert.ok(r.apagados[kd] >= a.descanso[dia]);
  });
  const c = structuredClone(b);
  respondeFrequencia(c, dia, 'descanso', undefined, agora);
  nasDuasOrdens(b, c, r => {
    assert.equal(r.descanso[dia], c.descanso[dia]);
    assert.equal(r.falta![dia], undefined);
    assert.ok(r.apagados[kf] >= b.falta![dia].m);
  });
});

test('escolhas simultâneas convergem e só o motivo da falta vencedora viaja', () => {
  const a = estadoInicial(), b = estadoInicial();
  respondeFrequencia(a, dia, 'falta', 'doença', agora);
  respondeFrequencia(b, dia, 'descanso', undefined, agora);
  nasDuasOrdens(a, b, r => {
    assert.equal(r.descanso[dia], agora);
    assert.deepEqual(r.falta, {});
  });
  const c = estadoInicial();
  respondeFrequencia(c, dia, 'falta', 'viagem', agora);
  nasDuasOrdens(a, c, r => assert.deepEqual(r.falta![dia], { m: agora, motivo: 'viagem' }));
  respondeFrequencia(c, dia, 'falta', undefined, agora);
  nasDuasOrdens(a, c, r => assert.deepEqual(r.falta![dia], { m: agora + 1 }));
});

test('a fusão guarda a resposta junto da sessão e só uma resposta nova é recusada', () => {
  const treino = estadoInicial(), t = instanteDaData(dia);
  treino.done.push({ t, sid: t, livre: 1 });
  for (const escolha of ['falta', 'descanso'] as const) {
    const marca = estadoInicial();
    respondeFrequencia(marca, dia, escolha, escolha === 'falta' ? 'viagem' : undefined, agora + 100);
    nasDuasOrdens(treino, marca, r => {
      assert.deepEqual(r.falta, marca.falta);
      assert.deepEqual(r.descanso, marca.descanso);
      assert.deepEqual(r.apagados, marca.apagados);
      assert.equal(r.done.length, 1);
      const antes = structuredClone(r);
      for (const nova of ['falta', 'descanso', null] as const) {
        assert.equal(respondeFrequencia(r, dia, nova, undefined, agora + 200), false);
        assert.deepEqual(r, antes);
      }
    });
  }
});

test('um motivo desconhecido é recusado ao gravar, sem alterar a resposta nem as lápides', () => {
  const s = estadoInicial();
  respondeFrequencia(s, dia, 'descanso', undefined, agora);
  const antes = structuredClone(s);
  assert.equal(respondeFrequencia(s, dia, 'falta', 'plantão' as MotivoFalta, agora + 10), false);
  assert.deepEqual(s, antes);
});

test('a fusão conserva a falta inteira e avisa se a conta perdeu um campo com o mesmo carimbo', () => {
  const a = estadoInicial(), b = estadoInicial();
  const futura = { m: agora, motivo: 'plantão', detalhe: { local: 'hospital', turnos: ['noite'] } };
  a.falta![dia] = structuredClone(futura);
  b.falta![dia] = { m: agora, motivo: 'plantão' };
  nasDuasOrdens(a, b, s => assert.deepEqual(s.falta![dia], futura));
  assert.equal(funde(a, b, agora).resumo.frequenciaDaqui, true);
  assert.equal(funde(b, a, agora).resumo.frequenciaDaqui, false);
  b.falta![dia] = { detalhe: { turnos: ['noite'], local: 'hospital' }, motivo: 'plantão', m: agora };
  assert.equal(funde(a, b, agora).resumo.frequenciaDaqui, false);
  respondeFrequencia(a, dia, 'falta', 'trabalho', agora + 1);
  assert.deepEqual(a.falta![dia], { ...futura, m: agora + 1, motivo: 'trabalho' });
});

test('o apagamento do histórico mata inclusive a falta escrita com o relógio adiantado', () => {
  const a = estadoInicial(), b = estadoInicial();
  respondeFrequencia(a, dia, 'falta', 'trabalho', agora + 500);
  b.apagados = lapidesDoApagamento(a, b, agora);
  nasDuasOrdens(a, b, r => assert.deepEqual(r.falta, {}));
});

test('12 e 13 conservam os carimbos de documentos independentes ao juntar a nova coleção', () => {
  const a = estadoInicial(), b = estadoInicial();
  delete a.primeiraVez; delete b.primeiraVez;
  a.plano = 12; delete a.falta;
  a.ajuste = 2; b.perfManual = true;
  a.carimbos = { ajuste: agora + 5 }; b.carimbos = { perfManual: agora };
  a.carimbosEm = a.mtime = agora + 5; b.carimbosEm = b.mtime = agora;
  respondeFrequencia(b, dia, 'falta', undefined, agora);
  nasDuasOrdens(a, b, s => {
    assert.equal(s.plano, 13);
    assert.equal(s.ajuste, 2);
    assert.equal(s.perfManual, true);
    assert.deepEqual(s.falta, b.falta);
  });
});
