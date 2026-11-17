// A leitura do corpo na imagem (direção 3, Fase 1; docs/redesign-3/02-captura.md).
// Um corpo sintético de 33 pontos, posto onde o teste quer no quadro. Cada
// teste guarda um jeito de a luz mentir: verde com o pé fora do quadro, verde
// piscando na borda, a frase mandando para o lado errado, o alinhamento que
// afasta (e corta) em vez de aproximar.

import { test } from 'vitest';
import assert from 'node:assert';
import { REGUA, alinhamentoAutomatico, leCorpo, parado, rastroDe, type Ponto } from '../../src/dominio/deteccao';
import { transform } from '../../src/dominio/enquadramento';

/** Um corpo de frente com o topo da cabeça em `topo`, os pés em `base` e o meio em `meio`. */
function corpo({ topo = REGUA.topo, base = REGUA.base, meio = 0.5, rosto = true, vis = 0.95 } = {}): Ponto[] {
  const h = base - topo, u = h * 0.035;
  const pts: Ponto[] = Array.from({ length: 33 }, () => ({ x: meio, y: topo + h / 2, visibility: vis }));
  const olho = topo + REGUA.fatorTopo * u, boca = olho + u;
  const p = (i: number, x: number, y: number, v = vis) => { pts[i] = { x: x, y: y, visibility: v }; };
  p(0, meio, olho + u / 2, rosto ? vis : 0.1);
  [1, 2, 3].forEach(i => p(i, meio - 0.02, olho, rosto ? vis : 0.1));
  [4, 5, 6].forEach(i => p(i, meio + 0.02, olho, rosto ? vis : 0.1));
  p(7, meio - 0.04, olho, rosto ? vis : 0.1); p(8, meio + 0.04, olho, rosto ? vis : 0.1);
  p(9, meio - 0.015, boca, rosto ? vis : 0.1); p(10, meio + 0.015, boca, rosto ? vis : 0.1);
  // sem rosto, o topo sai de ombro e quadril: ponha-os na proporção da régua
  const ombro = rosto ? topo + 0.18 * h : topo + (0.5 * h * REGUA.fatorTopoCostas) / (1 + REGUA.fatorTopoCostas) * 2;
  const quadril = rosto ? topo + 0.5 * h : ombro + (ombro - topo) / REGUA.fatorTopoCostas;
  p(11, meio - 0.1, ombro); p(12, meio + 0.1, ombro);
  p(23, meio - 0.06, quadril); p(24, meio + 0.06, quadril);
  p(27, meio - 0.05, base - 0.02 * h); p(28, meio + 0.05, base - 0.02 * h);
  p(29, meio - 0.05, base); p(30, meio + 0.05, base);
  p(31, meio - 0.07, base - 0.005); p(32, meio + 0.07, base - 0.005);
  return pts;
}

test('o corpo nas linhas acende altura e distância', () => {
  const l = leCorpo(corpo());
  assert.ok(l.pessoa && l.altura && l.distancia, JSON.stringify(l));
  assert.strictEqual(l.lado, 'centro');
});

test('pequeno no quadro: a distância manda chegar para a frente; grande, para trás', () => {
  assert.strictEqual(leCorpo(corpo({ topo: 0.12, base: 0.88 })).dicaDistancia, 'frente');
  const grande = leCorpo(corpo({ topo: 0.005, base: 0.995 }));
  assert.strictEqual(grande.distancia, false);
  assert.strictEqual(grande.dicaDistancia, 'tras');
});

test('caído no quadro (sobra em cima): o celular está alto e tem de descer; subido, subir', () => {
  const caido = leCorpo(corpo({ topo: 0.1, base: 0.99 }));
  assert.strictEqual(caido.altura, false);
  assert.strictEqual(caido.dicaAltura, 'descer');
  assert.strictEqual(leCorpo(corpo({ topo: 0.0, base: 0.9 })).dicaAltura, 'subir');
});

test('pé fora do quadro ou ponto não visto: nada acende', () => {
  const fora = leCorpo(corpo({ topo: 0.1, base: 1.08 }));
  assert.strictEqual(fora.pessoa, false);
  assert.ok(!fora.altura && !fora.distancia);
  assert.strictEqual(leCorpo(corpo({ vis: 0.1 })).pessoa, false, 'sem confiança não é gente');
  assert.strictEqual(leCorpo(null).pessoa, false);
  assert.strictEqual(leCorpo([]).pessoa, false);
});

test('de costas, sem rosto, o topo sai dos ombros e do quadril, e a luz acende igual', () => {
  const l = leCorpo(corpo({ rosto: false }));
  assert.ok(Math.abs(l.topo - REGUA.topo) < 0.01, 'topo estimado: ' + l.topo);
  assert.ok(l.altura && l.distancia);
});

test('a luz verde tem folga para apagar: não pisca na borda da régua', () => {
  const borda = corpo({ topo: REGUA.topo + 0.02, base: REGUA.base - 0.025 });
  const deApagada = leCorpo(borda, null);
  assert.strictEqual(deApagada.distancia, false, 'de apagada, a borda não acende');
  const deAcesa = leCorpo(borda, leCorpo(corpo()));
  assert.strictEqual(deAcesa.distancia, true, 'de acesa, a mesma borda segura');
});

test('o meio do corpo longe do meio do quadro vira dica de lado, sem apagar luz', () => {
  const l = leCorpo(corpo({ meio: 0.36 }));
  assert.strictEqual(l.lado, 'esquerda');
  assert.ok(l.altura && l.distancia);
});

test('parado é um segundo inteiro sem o tronco andar', () => {
  const r = (t: number, x = 0.5) => rastroDe(corpo({ meio: x }), t)!;
  assert.strictEqual(parado([r(0), r(500), r(1000)], 1000), true);
  assert.strictEqual(parado([r(500), r(1000)], 1000), false, 'meio segundo ainda não diz');
  assert.strictEqual(parado([r(0), r(500, 0.53), r(1000)], 1000), false, 'andou');
});

test('o alinhamento automático aproxima e centraliza até a cabeça e os pés caírem nas linhas', () => {
  const l = leCorpo(corpo({ topo: 0.12, base: 0.86, meio: 0.45 }));
  const e = alinhamentoAutomatico(l, 123)!;
  assert.ok(e && e.auto === 1 && e.m === 123);
  assert.strictEqual(e.r, 0, 'não gira');
  // pela mesma conta do transform: y na tela = 0,5 + (y − cy) · z
  const naTela = (y: number) => 0.5 + (y - e.cy) * e.z;
  assert.ok(Math.abs(naTela(l.topo) - REGUA.topo) < 0.002, 'cabeça na linha');
  assert.ok(Math.abs(naTela(l.baseY) - REGUA.base) < 0.002, 'pés na linha');
  assert.ok(Math.abs(e.cx - 0.45) < 0.001);
  assert.ok(/scale\(/.test(transform(e)));
});

test('sem o que alinhar: nas linhas já, grande demais (afastar não existe) ou sem pessoa', () => {
  assert.strictEqual(alinhamentoAutomatico(leCorpo(corpo()), 1), null);
  assert.strictEqual(alinhamentoAutomatico(leCorpo(corpo({ topo: -0.01, base: 1.01 })), 1), null);
  assert.strictEqual(alinhamentoAutomatico(leCorpo(null), 1), null);
});

test('a pasta dos agentes diz se a detecção mediu e se o enquadramento foi do app', async () => {
  const { montaArquivos } = await import('../../ferramentas/espelho/monta');
  const T = new Date(2026, 10, 10, 21, 0).getTime();
  const S = { protocolo: { poses: null, sessoes: [{ d: '2026-11-10', t: T, fotos: {
    'frente-relaxado': { v: T, ext: 'webp', enq: { r: 0, z: 1.2, cx: 0.5, cy: 0.52, m: T, auto: 1 },
                         cap: { via: 'app', l: 1, a: 1, det: { ativa: true, qps: 14 } } },
    'perfil-direito': { v: T + 1, ext: 'webp', cap: { via: 'app', l: 1, a: 1, det: { ativa: false, qps: 0 } },
                        sug: { r: 0, z: 1.3, cx: 0.5, cy: 0.5, m: T, auto: 1 } }
  } }] } };
  const fotos = montaArquivos(S as never, { agora: T + 86400000 })['corpo/fotos.md'] as string;
  assert.ok(fotos.includes('altura e distância medidas pelo app (14 quadros/s)'));
  assert.ok(fotos.includes('altura e distância conferidas a olho'));
  assert.ok(fotos.includes('alinhado pelo app'), 'o aceito');
  assert.ok(fotos.includes('alinhamento sugerido pelo app, ainda não aceito'), 'e o que ainda não foi');
});

test('o cache do motor no service worker tem o nome da versão instalada do MediaPipe', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const raiz = path.join(__dirname, '..', '..');
  const versao = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8')).devDependencies['@mediapipe/tasks-vision']
    || JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8')).dependencies['@mediapipe/tasks-vision'];
  assert.match(versao, /^\d+\.\d+\.\d+$/, 'versão fixa, sem ^ nem ~');
  const sw = fs.readFileSync(path.join(raiz, 'src', 'sw.js'), 'utf8');
  assert.ok(sw.includes("const MOTOR = 'lastro-pose-" + versao + "';"),
    'trocar a versão do motor sem trocar o nome do cache deixaria o aparelho com o motor velho');
});
