// A pasta de leitura (`ferramentas/espelho/monta.ts`): o estado vira arquivos
// por assunto. O que se prova aqui é a organização — rede e disco ficam no
// `espelho.ts`, que não tem o que testar sem conta.

import { describe, expect, it } from 'vitest';
import { fotosDoEstado, montaArquivos, segmento } from '../../ferramentas/espelho/monta';
import { EX_BASE, semeiaProg } from '../../src/dominio/programa';

const DIA = 86400000;
/** 28/10/2026, 06:18, no fuso de quem roda — como o app grava. */
const T = new Date(2026, 9, 28, 6, 18).getTime();

function estado() {
  const prog = semeiaProg();
  const a0 = prog.A.ex[0].id, a1 = prog.A.ex[1].id;
  return {
    a0, a1,
    S: {
      plano: 12, prog, rot: ['A', 'B', 'C', 'D', 'E', 'HX'],
      done: [{ day: 'A', t: T, sid: T, dur: 64 * 60000, hora: 1, mods: ['trocou o pegador'] }],
      // a1 vem ANTES de a0 no objeto: a ordem da sessão tem de ser a do treino
      logs: {
        [a1]: [{ t: T, sid: T, sets: [[30, 12, 2], [30, 11, 1]] }],
        [a0]: [{ t: T, sid: T, sets: [[20, 10, 2], null, [20, 9]], obs: 'ombro ok', dor: ['ombro'] }]
      },
      cardio: [{ t: T + 3600000, m: 'bike', min: 20, i: 'leve' }],
      body: {
        peso: [{ t: T - DIA, v: 73.4 }, { t: T, v: 73.1 }],
        cintura: [{ t: T, v: 84, onde: 'na altura do umbigo' }]
      },
      comidaHist: [{
        d: '2026-10-27', done: { cafe: T - DIA }, agua: 8, escala: { cafe: 0.5 },
        tot: { kcal: 2844.1, p: 180, c: 320, g: 86 }, pv: 1, aj: 1
      }],
      dia: { data: '2026-10-28', done: {}, agua: 3, escala: {} },
      ajuste: 1,
      ajusteHist: [{ t: T - 7 * DIA, de: 0, para: 1, k: 'mais', p: 'Duas semanas abaixo de 0,1 kg.', reg: 12 }],
      protocolo: {
        poses: null,
        sessoes: [{
          d: '2026-10-20', t: T - 8 * DIA,
          fotos: {
            'frente-relaxado': { v: new Date(2026, 9, 20, 21, 14).getTime(), ext: 'webp' },
            'perfil-direito': { v: new Date(2026, 9, 20, 21, 16).getTime(), ext: 'jpeg', enq: { r: 2, z: 1.1, cx: 0.5, cy: 0.5, m: 1 } }
          }
        }]
      },
      fotos: { [a0]: { v: 1, ext: 'webp' }, '../fuga': { v: 2, ext: 'webp' } },
      gordura: [{ d: '2026-10-20', de: '2026-10-06', v: 'nao', t: T }],
      progLog: [{ t: T, day: 'A', txt: 'Subiu uma série no primeiro exercício.', motivo: 'sobrou fôlego' }],
      promoPendente: [{ sid: T, day: 'A', t: T, mods: [], resumoMods: ['3 → 4 séries'] }],
      descanso: { '2026-10-26': T }
    }
  };
}

describe('espelho — fotos', () => {
  it('tira as fotos das referências do estado, com o caminho da nuvem e o da pasta', () => {
    const { S, a0 } = estado();
    const f = fotosDoEstado(S as never);
    const corpo = f.filter(x => x.bucket === 'corpo');
    expect(corpo.map(x => x.caminho).sort()).toEqual([
      'corpo/fotos/2026-10-20/frente-relaxado.webp', 'corpo/fotos/2026-10-20/perfil-direito.jpeg'
    ]);
    expect(corpo.find(x => x.caminho.includes('frente'))!.partes).toEqual(['2026-10-20', 'frente-relaxado.webp']);
    const ap = f.find(x => x.bucket === 'aparelhos' && x.partes[0] === a0 + '.webp');
    expect(ap!.caminho).toBe('treino/aparelhos/' + a0 + '.webp');
  });

  it('um id com ../ não sai da pasta', () => {
    const { S } = estado();
    const f = fotosDoEstado(S as never);
    f.forEach(x => expect(x.caminho).not.toContain('..'));
    expect(segmento('../../etc/passwd')).toBe('etc-passwd');
    expect(segmento('')).toBe('sem-nome');
  });
});

describe('espelho — arquivos', () => {
  it('monta a pasta por assunto, com o índice primeiro', () => {
    const { S } = estado();
    const a = montaArquivos(S, { agora: T + DIA });
    const k = Object.keys(a);
    expect(k[0]).toBe('LEIA-ME.md');
    ['treino/programa.md', 'treino/programa-do-treinador.md', 'treino/mudancas.md', 'treino/historico/2026-10.md',
      'treino/series.csv', 'treino/cardio.csv', 'treino/exercicios.md', 'nutricao/plano.md', 'nutricao/dias.csv',
      'nutricao/ajustes.md', 'nutricao/alimentos.csv', 'corpo/medidas.csv', 'corpo/fotos.md', 'bruto/estado.json'
    ].forEach(c => expect(k).toContain(c));
    // sem modelo de aula, o arquivo não existe — e o índice não o promete
    expect(k).not.toContain('treino/aulas-de-box.md');
    expect(a['LEIA-ME.md']).not.toContain('aulas-de-box.md');
  });

  it('a sessão sai na ordem do treino, série por série, com hora, duração e nota', () => {
    const { S, a0, a1 } = estado();
    const h = montaArquivos(S, { agora: T })['treino/historico/2026-10.md'];
    const n0 = EX_BASE[a0].n, n1 = EX_BASE[a1].n;
    expect(h.indexOf(n0)).toBeGreaterThan(0);
    expect(h.indexOf(n0)).toBeLessThan(h.indexOf(n1));
    expect(h).toContain('20 × 10 (RIR 2) · 20 × 9');
    expect(h).toContain('começou às 06:18 · 1h04 de treino');
    expect(h).toContain('nota: ombro ok');
    expect(h).toContain('dor: ombro anterior');
    expect(h).toContain('Mudanças do dia: trocou o pegador');
    expect(h).toContain('## Cardio');
    expect(h).toContain('## Descanso');
  });

  it('series.csv tem uma linha por série feita, sem as vazias', () => {
    const { S } = estado();
    const linhas = montaArquivos(S, { agora: T })['treino/series.csv'].trim().split('\n');
    expect(linhas[0].split(',')).toContain('rir');
    expect(linhas.length).toBe(1 + 4);
  });

  it('dias.csv: o dia fechado com os totais congelados e o dia em curso marcado como tal', () => {
    const { S } = estado();
    const linhas = montaArquivos(S, { agora: T })['nutricao/dias.csv'].trim().split('\n');
    expect(linhas.length).toBe(3);
    expect(linhas[1]).toMatch(/^2026-10-27,.*fechado/);
    expect(linhas[1]).toContain('porção 50%');
    expect(linhas[1]).toContain(',2844,180,320,86,1');
    expect(linhas[2]).toMatch(/^2026-10-28,.*em andamento.*,treino,sessão registrada/);
  });

  it('a foto que está na pasta vira link; a que não subiu diz isso', () => {
    const { S } = estado();
    const f = montaArquivos(S, {
      agora: T,
      presentes: new Set(['corpo/fotos/2026-10-20/frente-relaxado.webp']),
      faltando: new Set(['corpo/fotos/2026-10-20/perfil-direito.jpeg'])
    })['corpo/fotos.md'];
    expect(f).toContain('| Frente relaxado | 21:14 | [frente-relaxado.webp](fotos/2026-10-20/frente-relaxado.webp) |');
    expect(f).toContain('| Perfil direito | 21:16 | ainda não subiu para a nuvem | giro 2°, zoom 1,1× |');
    expect(f).toMatch(/## \w{3}, 20\/10\/2026 — 2 de \d+ poses/);
  });

  it('só o LEIA-ME muda com a hora da geração', () => {
    const { S } = estado();
    const a = montaArquivos(S, { agora: T }), b = montaArquivos(S, { agora: T + 3 * DIA });
    Object.keys(a).forEach(k => { if (k !== 'LEIA-ME.md') expect(b[k]).toBe(a[k]); });
    expect(b['LEIA-ME.md']).not.toBe(a['LEIA-ME.md']);
  });

  it('estado vazio ou estranho gera a pasta mesmo assim', () => {
    [{}, null, { done: 'x', logs: [], body: 3, protocolo: { sessoes: [{ d: '../x' }] } }].forEach(function (S) {
      const a = montaArquivos(S, { agora: T });
      expect(a['LEIA-ME.md']).toContain('nenhuma sessão registrada');
      expect(fotosDoEstado((S || {}) as never)).toEqual([]);
    });
  });
});
