// A lixeira das fotos do corpo: 30 dias, a chave, e a fusão que respeita a restauração.
import { test } from 'vitest';
import assert from 'node:assert';
import { DIAS_NA_LIXEIRA, chaveDaLixeira, diasRestantes, ordemDaLixeira, vencidos, vivaDesde } from '../../src/dominio/lixeira';
import { funde } from '../../src/dominio/sincronia';

const DIA = 86400000;
const item = (em: number, v = 1) => ({ d: '2026-11-12', pose: 'frente-relaxado', ref: { v, ext: 'webp' }, em, porque: 'apagada' as const });

test('trinta dias, contados de quando foi para a lixeira', () => {
  const agora = Date.now();
  assert.strictEqual(DIAS_NA_LIXEIRA, 30);
  assert.strictEqual(diasRestantes(item(agora), agora), 30);
  assert.strictEqual(diasRestantes(item(agora - 29.5 * DIA), agora), 1);
  assert.deepStrictEqual(vencidos([item(agora - 30 * DIA, 1), item(agora - 29 * DIA, 2)], agora).map(x => x.ref.v), [1]);
  assert.deepStrictEqual(ordemDaLixeira([item(1, 1), item(3, 3), item(2, 2)]).map(x => x.ref.v), [3, 2, 1]);
  assert.strictEqual(chaveDaLixeira(item(1, 7)), 'lixo:2026-11-12:frente-relaxado:7');
});

test('a foto restaurada vence a lápide de quando foi apagada, nos dois sentidos da fusão', () => {
  assert.strictEqual(vivaDesde({ v: 10, ext: 'webp', r: 50 }), 50);
  const ses = (fotos: any, m: number) => ({ d: '2026-11-12', t: 1, m, fotos });
  // aqui: restaurada às 50; lá: apagada às 30 (com a lápide), sem a foto
  const aqui: any = { protocolo: { poses: null, sessoes: [ses({ 'frente-relaxado': { v: 10, ext: 'webp', r: 50 } }, 50)] },
                      apagados: { 'corpo:2026-11-12:frente-relaxado': 30, 'lixo:2026-11-12:frente-relaxado:10': 50 }, lixeira: [], mtime: 50 };
  const la: any = { protocolo: { poses: null, sessoes: [] },
                    apagados: { 'corpo:2026-11-12:frente-relaxado': 30, 'corpo:2026-11-12': 30 },
                    lixeira: [{ d: '2026-11-12', pose: 'frente-relaxado', ref: { v: 10, ext: 'webp' }, em: 30, porque: 'apagada' }], mtime: 40 };
  for (const [x, y] of [[aqui, la], [la, aqui]]) {
    const r = funde(x, y, 100).estado as any;
    assert.ok(r.protocolo.sessoes[0] && r.protocolo.sessoes[0].fotos['frente-relaxado'], 'a foto ficou');
    assert.deepStrictEqual(r.lixeira, [], 'e a lixeira do outro lado perdeu o item, pela lápide da restauração');
  }
});

test('sem restauração, a lápide continua matando a foto velha', () => {
  const aqui: any = { protocolo: { poses: null, sessoes: [{ d: '2026-11-12', t: 1, m: 5, fotos: { 'frente-relaxado': { v: 10, ext: 'webp' } } }] }, apagados: {}, lixeira: [], mtime: 5 };
  const la: any = { protocolo: { poses: null, sessoes: [] }, apagados: { 'corpo:2026-11-12:frente-relaxado': 30, 'corpo:2026-11-12': 30 },
                    lixeira: [{ d: '2026-11-12', pose: 'frente-relaxado', ref: { v: 10, ext: 'webp' }, em: 30, porque: 'apagada' }], mtime: 40 };
  const r = funde(aqui, la, 100).estado as any;
  assert.deepStrictEqual(r.protocolo.sessoes, []);
  assert.strictEqual(r.lixeira.length, 1, 'ela está na lixeira, nos dois aparelhos');
});
