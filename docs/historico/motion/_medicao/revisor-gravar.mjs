// O Revisor grava os fluxos de docs/motion/07-revisao-base.md §2, num motor,
// e deixa para cada fluxo: o vídeo (.webm), uma tira de quadros por passo (.png)
// e as medidas (.json). O MESMO script grava o "antes" e o "depois": só muda a
// URL (o dist servido) e a pasta de saída.
//
// Do raiz do projeto:
//
//   # o "antes" (a22b09d), já copiado para fora do git:
//   python3 -m http.server 4727 -d docs/motion/_medicao/shots/dist-antes &
//   CHROME=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
//     node docs/motion/_medicao/revisor-gravar.mjs http://localhost:4727/ docs/motion/_medicao/shots/revisor/antes
//
//   # WebKit 26.5 (as quatro bibliotecas sem sudo: receita no topo de desempenho-comum.mjs)
//   L=~/.cache/ms-playwright/webkit-deps-noble
//   MOTOR=webkit LD_LIBRARY_PATH=$L \
//   LD_PRELOAD=$L/libgav1.so.1:$L/libyuv.so.0:$L/libevent-2.1.so.7:$L/libavif.so.16 \
//     node docs/motion/_medicao/revisor-gravar.mjs http://localhost:4727/ docs/motion/_medicao/shots/revisor/antes
//
//   # o "depois": o dist novo numa porta, a pasta "depois" e o MESMO registro do antes
//   python3 -m http.server 4728 -d dist &
//   REGISTRO=docs/motion/_medicao/shots/revisor/antes/registro.json CHROME=… \
//     node docs/motion/_medicao/revisor-gravar.mjs http://localhost:4728/ docs/motion/_medicao/shots/revisor/depois
//
// Variáveis: MOTOR=webkit · REDUZ=1 (`prefers-reduced-motion: reduce`) ·
// DEDO=mouse (no Chromium; o toque emulado não acende `:active`) · DPR=3
// (×3 como o iPhone 11 Pro Max; o padrão é ×2) · SEGURA=100 (ms com o dedo
// pousado) · FLUXOS=01,03 (só os fluxos que começam assim) · REGISTRO=arquivo
// (usa esse registro em vez de semear) · QUADROS=1 (guarda os quadros soltos em
// <saída>/_quadros/) · DIAS=120 (dias semeados).
//
// Precisa de python3 com Pillow e numpy (revisor-tiras.py); PYTHON=/usr/bin/python3.12
// escolhe outro Python. A saída fica em
// <saída>/<fluxo>/: <rotulo>.webm, NN-<passo>-<rotulo>.png, medidas-<rotulo>.json;
// e em <saída>/rodada-<rotulo>.json o resumo da rodada.
import { abreMotor, calibra, abreApp, aquece, gravaFluxo, ROTULO, SAIDA, MOTOR, REDUZ, DPR, SEGURA, URL_APP } from './revisor-comum.mjs';
import { FLUXOS } from './revisor-fluxos.mjs';
import fs from 'node:fs';
import path from 'node:path';

const filtro = process.env.FLUXOS ? process.env.FLUXOS.split(',') : null;
const t0 = Date.now();
const ab = await abreMotor();
const cal = await calibra(ab.p);
console.log(`[${ROTULO}] ${ab.versao} · isMobile ${ab.mobile} · latência da captura ${cal.lat} ms (${cal.latencias.join(' ')})`);
const registro = await abreApp(ab.p);
await aquece(ab.p);
const fluxos = [];
for (const f of FLUXOS) {
  if (filtro && !filtro.some(x => f.id.startsWith(x))) continue;
  const ti = Date.now();
  try {
    const r = await gravaFluxo(ab, registro, cal, f);
    fluxos.push({ id: f.id, medidas: path.relative(SAIDA, r.arq), passos: r.passos });
    console.log(`[${ROTULO}] ${f.id} (${Math.round((Date.now() - ti) / 1000)} s): ${r.passos.join(' · ')}`);
  } catch (e) {
    fluxos.push({ id: f.id, erro: String(e).split('\n')[0] });
    console.log(`[${ROTULO}] ${f.id}: ERRO ${String(e).split('\n')[0]}`);
  }
}
const rodada = {
  rotulo: ROTULO, motor: MOTOR, versao: ab.versao, isMobile: ab.mobile, reduz: REDUZ, dpr: DPR, seguraMs: SEGURA,
  url: URL_APP, quando: new Date().toISOString(), duracaoS: Math.round((Date.now() - t0) / 1000),
  calibracao: cal, errosDaPagina: ab.erros, fluxos
};
fs.writeFileSync(path.join(SAIDA, 'rodada-' + ROTULO + '.json'), JSON.stringify(rodada, null, 1));
await ab.b.close();
