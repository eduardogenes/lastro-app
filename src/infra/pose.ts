// O DETECTOR DO CORPO: o MediaPipe Pose Landmarker (modelo lite), rodando no
// navegador sobre o quadro da câmera (docs/redesign-3/02-captura.md, §1).
//
// Carrega só quando a câmera do visual novo abre, uma vez por abertura do
// app, e de dentro do próprio app: o motor e o modelo moram em `pose/` (ver o
// plugin motor-da-deteccao em vite.config.js e o cache MOTOR em src/sw.js).
//
// Qualquer falha devolve `null`, e a câmera segue pelo caminho de reserva (as
// linhas conferidas a olho). A detecção é uma camada por cima do que já
// funciona, nunca uma dependência.
//
// Os testes trocam o motor por um dublê em `globalThis.__lastroPose`: um
// objeto com `detecta(quadro, t)` que devolve os 33 pontos (ou `null`).

import type { Ponto } from '../dominio/deteccao';
import type * as MP from '@mediapipe/tasks-vision';

export interface Detector {
  /** os 33 pontos do corpo no quadro, em fração dele; `null` sem pessoa */
  detecta(quadro: TexImageSource, t: number): Ponto[] | null;
}

let promessa: Promise<Detector | null> | null = null;

export function carrega(): Promise<Detector | null> {
  const duble = (globalThis as { __lastroPose?: Detector }).__lastroPose;
  if (duble) return Promise.resolve(duble);
  if (promessa) return promessa;
  promessa = (async function (): Promise<Detector | null> {
    try {
      // por endereço, e não pelo nome do pacote: ver o plugin motor-da-deteccao
      const base = new URL('pose/', document.baseURI).href;
      const mp: typeof MP = await import(/* @vite-ignore */ base + 'vision_bundle.mjs');
      const motor = { wasmLoaderPath: base + 'vision_wasm_internal.js', wasmBinaryPath: base + 'vision_wasm_internal.wasm' };
      const opcoes = function (delegate: 'GPU' | 'CPU') {
        return { baseOptions: { modelAssetPath: base + 'pose_landmarker_lite.task', delegate: delegate },
                 runningMode: 'VIDEO' as const, numPoses: 1 };
      };
      // a GPU é a rápida; sem WebGL utilizável, a CPU ainda pode servir
      let lm;
      try { lm = await mp.PoseLandmarker.createFromOptions(motor, opcoes('GPU')); }
      catch (e) { lm = await mp.PoseLandmarker.createFromOptions(motor, opcoes('CPU')); }
      let ultimo = 0;
      return {
        detecta: function (quadro: TexImageSource, t: number): Ponto[] | null {
          // o carimbo do vídeo tem de crescer sempre, ou o MediaPipe recusa
          const ts = Math.max(Math.round(t), ultimo + 1);
          ultimo = ts;
          const r = lm.detectForVideo(quadro, ts);
          return (r && r.landmarks && r.landmarks[0]) || null;
        }
      };
    } catch (e) {
      // pode ter sido a rede: a próxima abertura da câmera tenta de novo
      promessa = null;
      return null;
    }
  })();
  return promessa;
}
