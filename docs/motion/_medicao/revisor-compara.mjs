// Fase 4 do Revisor (docs/motion/07-revisao-base.md §1 e §5): põe o "depois" ao
// lado do "antes" e aplica o protocolo. Não abre navegador: lê o que
// revisor-gravar.mjs deixou nas duas pastas.
//
//   node docs/motion/_medicao/revisor-compara.mjs \
//     docs/motion/_medicao/shots/revisor/antes docs/motion/_medicao/shots/revisor/depois \
//     docs/motion/_medicao/shots/revisor/comparacao "antes · a22b09d" "depois · <commit>"
//
// Para cada fluxo e cada rodada que existe nos dois lados (chromium, webkit,
// chromium-reduz, webkit-reduz, chromium-mouse…), escreve em <saída>/<fluxo>/:
//   NN-<passo>-<rodada>-par.png      a tira do antes em cima, a do depois embaixo;
//   NN-<passo>-<rodada>.mp4          os dois vídeos lado a lado, de 0,5 s antes a
//                                    1 s depois do zero do passo, alinhados no toque;
//   NN-<passo>-<rodada>-lento.mp4    o mesmo, 4× mais devagar;
// e em <saída>/protocolo.json o veredito de cada princípio, passo a passo, com o
// número que decidiu. O resumo sai no terminal.
//
// O que cada passo tem de mostrar vem de `mov` em revisor-fluxos.mjs (as
// respostas do dono de 16/10). DURACOES=120,160,… troca a lista de durações
// permitidas (padrão: os tokens decididos — 120, 160, 200, 250, 350, 640, 2400).
// SEMVIDEO=1 pula os vídeos; SEMPAR=1 pula os pares de tiras (só o protocolo).
// Precisa de /usr/bin/ffmpeg (libx264) e de python3 com Pillow e numpy.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FLUXOS } from './revisor-fluxos.mjs';

const [ANTES, DEPOIS, SAIDA] = process.argv.slice(2, 5);
const ROT_A = process.argv[5] || 'antes · a22b09d';
const ROT_D = process.argv[6] || 'depois';
if (!ANTES || !DEPOIS || !SAIDA) { console.log('uso: revisor-compara.mjs <antes> <depois> <saída> [rótulo antes] [rótulo depois]'); process.exit(1); }
const AQUI = path.dirname(fileURLToPath(import.meta.url));
// O Python com Pillow e numpy (PYTHON=/usr/bin/python3.12 quando o python3 do
// sistema não os tem — foi o caso depois da atualização de 19/10, que trouxe o 3.14).
const PY = process.env.PYTHON || 'python3';
const FONTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FAZ_VIDEO = !process.env.SEMVIDEO;

const COMPOSITOR = new Set(['transform', 'opacity', 'translate', 'scale', 'rotate']);
const r1 = x => x == null ? null : Math.round(x * 10) / 10;
const lerJSON = a => JSON.parse(fs.readFileSync(a, 'utf8'));

/** Animações de um passo (as do quadro seguinte e as de 150 ms depois, sem repetir). */
function animacoes(ps) {
  const a = ps.animacoes || {}, vistas = new Map();
  [].concat(a.noQuadroSeguinte || [], a.aos150ms || []).forEach(x => { if (x && typeof x === 'object') vistas.set(x.nome + '|' + x.alvo + '|' + x.pseudo, x); });
  return [...vistas.values()];
}
/** Uma curva ultrapassa (mola, quique)? cubic-bezier com y fora de [0, 1], ou linear() com valor > 1. */
function ultrapassa(c) {
  if (!c) return false;
  const m = /cubic-bezier\(([^)]+)\)/.exec(c);
  if (m) { const v = m[1].split(',').map(Number); return v[1] < 0 || v[1] > 1 || v[3] < 0 || v[3] > 1; }
  const l = /linear\(([^)]+)\)/.exec(c);
  if (l) return l[1].split(',').some(p => parseFloat(p) > 1 || parseFloat(p) < 0);
  return false;
}
const fixoMudou = (a, b) => {
  const out = [];
  for (const k of Object.keys(a || {})) {
    const x = a[k], y = (b || {})[k];
    if (!Array.isArray(x) || !Array.isArray(y)) continue;
    if (Math.abs(x[0] - y[0]) > 1 || Math.abs(x[1] - y[1]) > 1) out.push(`${k} ${x[0]},${x[1]} → ${y[0]},${y[1]}`);
  }
  return out;
};
/** Fração da tela diferente entre dois quadros finais (24 níveis, meia resolução). */
function difQuadros(a, b) {
  const py = `
import sys, numpy as np
from PIL import Image
def g(p):
    im = Image.open(p).convert('L'); return np.asarray(im.resize((207, int(207 * im.height / im.width))), dtype=np.int16)
a, b = g(sys.argv[1]), g(sys.argv[2])
print((np.abs(a - b) > 24).mean() if a.shape == b.shape else 1.0)`;
  try { return Number(execFileSync(PY, ['-c', py, a, b]).toString().trim()); } catch (e) { return null; }
}

// ---- O que o dono decidiu em 16/10 (08 §5.1; diário 01h25) ----
// Durações que podem aparecer (guarda (a) da 06: tempo só nos tokens): o
// dissolver sob "Reduzir movimento", 120 (o toque não tem tempo: só escurece, na
// hora, e `--ins-dur-toque` saiu na peça 1), no lugar 160 (pouso, copo, aviso),
// clarão 200, amostra do descanso 250, camada 350 (entra e sai, na curva do
// iPhone), quique 640 (só a chegada da folha e do painel de apagar), ciclo do
// ponto ao vivo 2400 (infinito, decisão 12). TETO de 300 ms da 04: caiu.
const DURACOES = (process.env.DURACOES || '120,160,200,250,350,640,2400').split(',').map(Number);
const DUR_QUIQUE = 640, DUR_DISSOLVE = 120, DUR_LUGAR = 160;
const ehPulso = x => (x.props || []).join() === 'opacity' && x.dur === 2400;
// (o aviso que some não entra: sob "Reduzir movimento" ele ainda apaga, só em opacidade)
const ehSaida = m => m && m.tipo === 'sai';
const ehCamada = m => m && ['entra', 'sai', 'quique', 'aba'].includes(m.tipo);
function faixa(tira, a, b, x0 = 0, x1 = 60, y0 = 0, y1 = 896) {
  try { return Number(execFileSync(PY, [path.join(AQUI, 'revisor-tiras.py'), 'faixa', tira, a, b, String(x0), String(x1), String(y0), String(y1)]).toString().trim()); }
  catch (e) { return null; }
}

/** O 1º quadro em que a troca de camada anda (ver o princípio 1). */
function andaMs(q) {
  const m = (q.mudancasFinas || []).find(([, , c]) => c && c[0] + c[2] >= 410 && c[3] >= 300);
  return m ? m[0] : null;
}

/** Os oito princípios, num passo. `a` = antes, `d` = depois (mesma rodada); `mov` = o esperado (revisor-fluxos.mjs). */
function julga(rodada, a, d, extra, mov, tiraD) {
  const v = [];
  const reprova = (p, msg) => v.push({ principio: p, veredito: 'REPROVA', motivo: msg });
  const passa = (p, msg) => v.push({ principio: p, veredito: 'passa', motivo: msg });
  const confira = (p, msg) => v.push({ principio: p, veredito: 'a conferir', motivo: msg });
  const reduz = /reduz/.test(rodada), webkit = /webkit/.test(rodada), mouse = /webkit|mouse/.test(rodada);
  const qa = a.medidasDosQuadros || {}, qd = d.medidasDosQuadros || {};
  const ta = a.toque || {}, td = d.toque || {};
  const an = animacoes(d), anA = animacoes(a);
  // (o portão universal de hoje deixa o pulso com 0,01 ms sob "Reduzir
  // movimento": animação de menos de 1 ms já está parada e não conta)
  const vivas = an.filter(x => x.estado !== 'finished' && !(x.dur != null && x.dur < 1));
  const doAntes = new Set(anA.map(x => x.nome));
  const novas = vivas.filter(x => !doAntes.has(x.nome) && !ehPulso(x));
  const visivel = qd.ultimaQualquerMudancaMs != null && qd.primeiraMudancaMs != null ? r1(qd.ultimaQualquerMudancaMs - qd.primeiraMudancaMs) : 0;

  // 1 · O toque nunca espera
  {
    const p = '1 toque nunca espera';
    const lac = qd.capturaAtrasadaMs != null || qa.capturaAtrasadaMs != null;
    if (d.confere === false) reprova(p, `o passo não produziu o efeito esperado (${d.esperado})`);
    // o segundo toque se perde quando cai no `html`/`body` (a View Transition o
    // joga lá, 04 §2.6) ou em lugar nenhum; cair no véu ou num botão é chegar
    // (com a View Transition, o robô vê o clique no `html` e o app o reenvia ao
    // nó sob o dedo: vale o efeito — `confere` —, não o alvo que o robô vê)
    if (d.segundoToque && d.confere !== true && (!d.segundoToque.alvoDoClique || /^(html|body)\b/.test(d.segundoToque.alvoDoClique))) reprova(p, `o segundo toque (${d.segundoToque.cliqueRelMs} ms depois do primeiro) caiu em ${d.segundoToque.alvoDoClique || 'lugar nenhum'}`);
    if (td.handlerMs != null && ta.handlerMs != null && td.handlerMs > Math.max(16, ta.handlerMs + 4)) reprova(p, `trabalho no toque ${td.handlerMs} ms (antes ${ta.handlerMs})`);
    if (td.eventTimingClickMs != null && ta.eventTimingClickMs != null && td.eventTimingClickMs > ta.eventTimingClickMs + 16) reprova(p, `Event Timing ${td.eventTimingClickMs} ms (antes ${ta.eventTimingClickMs})`);
    // Nas trocas de camada e de aba a decisão 6 aceita UM quadro a mais. A
    // medida cai no quadro, e onde o toque cai dentro do quadro muda de uma
    // gravação para outra: "um quadro a mais" aparece entre +8 e +25 ms, "dois",
    // de +25 a +42. O limite fica em 1,5 quadro (25 ms) nesses passos (peça 6);
    // nos outros, em um quadro (17 ms), como sempre.
    const troca = mov && /^(entra|sai|aba)$/.test(mov.tipo), lim = troca ? 25 : 17;
    // (num passo de espera ninguém toca: o zero é a condição do passo, e o "atraso"
    // seria só onde o zero cai — na peça 7, o começo da saída em vez do fim)
    if (!lac && d.tipo !== 'espera' && qd.primeiraMudancaMs != null && qa.primeiraMudancaMs != null && qd.primeiraMudancaMs > qa.primeiraMudancaMs + lim)
      reprova(p, `a tela muda a ${qd.primeiraMudancaMs} ms (antes ${qa.primeiraMudancaMs}): ` + (troca ? 'dois quadros ou mais de atraso (decisão 6 aceita um)' : 'mais de um quadro de atraso'));
    // Troca de camada (peça 5): com a View Transition, o 1º quadro que muda pode
    // ser só o controle apertado (a caixa dele), e a troca anda depois. Aqui vale
    // o 1º quadro cuja mudança encosta na borda direita e tem a altura da tela
    // (x + largura ≥ 410 e altura ≥ 300, pela medida fina): "a troca anda".
    // (no antes a troca é seca e nem sempre encosta na borda: vale então o 1º
    // quadro que muda; a aba entra na regra a partir da peça 6, o carrossel)
    const andaA = andaMs(qa) ?? qa.primeiraMudancaMs, andaD = andaMs(qd);
    if (!lac && troca && andaA != null && andaD != null && andaD > andaA + lim && !v.some(x => x.principio === p && /a tela muda/.test(x.motivo)))
      reprova(p, `a troca anda a ${andaD} ms (antes a tela trocava a ${andaA}): dois quadros ou mais de atraso (decisão 6 aceita um)`);
    // 04 R8: a 1ª série sem o tranco do AudioContext — ≤ 16 ms no Chromium 1×
    // (rodadas chromium e chromium-mouse); nas outras o número fica para leitura
    if (/primeira-serie|serie-regua/.test(extra.fluxo) && d.id === 'grava-1' && td.handlerMs > 16)
      (/^chromium(-mouse)?$/.test(rodada) ? reprova : confira)(p, `a 1ª série trabalha ${td.handlerMs} ms no toque (antes ${ta.handlerMs}; 04 R8: ≤ 16 no Chromium 1×)`);
    if (!v.some(x => x.principio === p)) (lac ? confira : passa)(p, `tela ${qa.primeiraMudancaMs} → ${qd.primeiraMudancaMs} ms; trabalho ${ta.handlerMs} → ${td.handlerMs} ms` + (lac ? ' (atraso da captura: vale o Event Timing)' : ''));
  }
  // 2 · Só transform e opacity
  {
    const p = '2 só transform e opacity';
    const ruins = an.filter(x => x.props && x.props.some(k => !COMPOSITOR.has(k)));
    ruins.length ? reprova(p, ruins.map(x => `${x.nome} anima ${x.props.join('+')} em ${x.alvo}`).join('; ')) : passa(p, `${an.length} animação(ões), todas em transform/opacity`);
  }
  // 3 · Nada pisca no Blink
  if (!webkit) {
    const p = '3 nada pisca no Blink';
    // o estado de toque (peça 1) aparece com o dedo e some ao soltar: um
    // "transitório" dentro da janela do dedo pousado é ele, não um pisca
    const doDedo = (ps, x) => ps.pousaRel != null && x.t <= 0 && x.t > ps.pousaRel - 40;
    // o quique tem dois pontos de retorno (~352 e ~515 ms depois de começar; 09,
    // peça 4): ali a folha passa pelo mesmo lugar na ida e na volta, e o quadro
    // do retorno parece "aparecer e sumir" sem ser pisca
    const doQuique = x => mov && mov.tipo === 'quique' && [352, 515].some(r => Math.abs(x.t - r - 16) <= 40);
    const trAs = (qa.transitorios || []).filter(x => !doDedo(a, x)), trDs = (qd.transitorios || []).filter(x => !doDedo(d, x) && !doQuique(x));
    const trA = trAs.length, tr = trDs.slice(trA);
    // o que se move de propósito naquele passo não conta: o cronômetro sobe e o
    // aviso e a faixa o acompanham (peça 3); o aviso sobe (peça 7)
    const movem = mov && mov.tipo === 'lugar' ? ['cronometro', 'toast', 'faixa'] : mov && mov.tipo === 'aviso' ? ['toast'] : [];
    const tira = o => Object.fromEntries(Object.entries(o || {}).filter(([k]) => !movem.includes(k)));
    const saltos = d.meio && d.depois ? fixoMudou(tira(d.meio.fixos), tira(d.depois.fixos)) : [];
    const lado = d.meio && d.meio.larguraRolavel > (d.meio.larguraDaJanela || 414);
    if (tr.length) reprova(p, `quadro que aparece e some (além dos ${trA} do antes): ${trDs.map(x => x.t + ' ms').join(', ')}`);
    if (saltos.length) reprova(p, `fixo fora do lugar no meio do movimento (120 ms): ${saltos.join('; ')}`);
    if (lado) reprova(p, `a página fica mais larga que a janela no meio do movimento (${d.meio.larguraRolavel} px)`);
    if (!tr.length && !saltos.length && !lado) passa(p, 'nenhum quadro transitório; fixos no lugar a 120 ms; sem transbordo lateral');
  }
  // 4 · 60 fps no WebKit
  if (webkit) {
    const p = '4 60 fps no WebKit';
    const pg = d.quadrosDaPagina || {};
    if (pg.acimaDoLimiteSemOPrimeiro > 0) reprova(p, `${pg.acimaDoLimiteSemOPrimeiro} intervalo(s) de requestAnimationFrame acima de ${pg.limiteMs} ms (pior ${pg.maiorIntervalo} ms), sem contar o do render`);
    else if (qd.maiorIntervaloNoMovimentoMs > 34) confira(p, `a página manteve o ritmo, mas a captura teve um buraco de ${qd.maiorIntervaloNoMovimentoMs} ms no movimento`);
    else passa(p, `pior intervalo da página ${pg.maiorIntervalo} ms; da captura no movimento ${qd.maiorIntervaloNoMovimentoMs ?? '—'} ms`);
  }
  // 5 · Movimento reduzido (decisão 2: camada esmaece 120 ms ao chegar e sai de
  // uma vez; pouso e aviso só na opacidade; nada se desloca; o ponto aceso e parado)
  if (reduz) {
    const p = '5 movimento reduzido';
    const teto = mov && ['lugar', 'aviso'].includes(mov.tipo) ? DUR_LUGAR : DUR_DISSOLVE;
    const ruins = vivas.filter(x => (x.props || []).some(k => k !== 'opacity') || x.dur > teto || x.iter === Infinity || x.iter == null);
    const naSaida = ehSaida(mov) ? vivas.filter(x => !ehPulso(x)) : [];
    if (ruins.length) reprova(p, ruins.map(x => `${x.nome} (${(x.props || []).join('+')}, ${x.dur} ms, ${x.iter} vezes)`).join('; ') + ` — teto ${teto} ms, só opacidade, finita`);
    if (naSaida.length) reprova(p, 'a saída tem de ser de uma vez: ' + naSaida.map(x => `${x.nome} ${x.dur} ms`).join(', '));
    if (!ruins.length && !naSaida.length) (visivel > teto + 50 ? confira : passa)(p, vivas.length ? `${vivas.length} esmaecer(es) curto(s); a tela muda por ${visivel} ms` : `nenhuma animação; a tela muda por ${visivel} ms`);
    if (extra.finalDiferente != null) (extra.finalDiferente > 0.005 ? reprova : passa)('7 nada só pelo movimento',
      `a tela final com e sem "Reduzir movimento" difere em ${(extra.finalDiferente * 100).toFixed(2)} % (limite 0,5 %)` + (d.confere === false ? '; e o passo não funcionou sob reduce' : ''));
  }
  // 10 · O toque se vê (decisão 7; peça 1): com o dedo pousado o controle muda,
  // a mudança cabe na caixa dele (com 8 px de folga), e nada nele anima — com e sem
  // "Reduzir movimento". Só nas rodadas em que o :active acende com o dedo
  // pousado (webkit e chromium-mouse; 07 §1.1).
  if (mouse && (d.tipo === 'toque' || d.tipo === 'toqueNoMeio')) {
    const p = '10 o toque se vê';
    const n0 = v.length, cx = qd.mudancaNoPousarCaixa, al = d.antes && Array.isArray(d.antes.alvo) ? d.antes.alvo : null;
    const px = qd.mudancaNoPousarPx;
    if (qd.mudancaNoPousarMs == null) reprova(p, 'com o dedo pousado nada muda no controle');
    else if (px && al && px > al[2] * al[3] * 1.4) confira(p, `com o dedo pousado mudam ${px} px, mais que a área do controle (${al[2] * al[3]} px)`);
    else if (px && al && px < al[2] * al[3] * 0.25) confira(p, `com o dedo pousado mudam só ${px} px, ${Math.round(100 * px / (al[2] * al[3]))} % da área do controle: o toque se vê?`);
    else if (cx && al && (cx[0] < al[0] - 8 || cx[1] < al[1] - 8 || cx[0] + cx[2] > al[0] + al[2] + 8 || cx[1] + cx[3] > al[1] + al[3] + 8))
      confira(p, `a mudança com o dedo pousado (${cx.join(',')}) passa da caixa do controle (${al.join(',')})`);
    // o toque não tem tempo: QUALQUER animação no próprio controle tocado reprova
    // (escala é a decisão 7; transição de cor é movimento novo que o dono recusou)
    const noControle = an.filter(x => x.alvo && td.alvoDoClique && x.alvo.split(' ')[0] === td.alvoDoClique.split(' ')[0]);
    if (noControle.length) reprova(p, 'o controle tocado anima (o toque só escurece, na hora): ' + noControle.map(x => `${x.nome} ${(x.props || []).join('+')} ${x.dur} ms`).join(', '));
    if (v.length === n0) passa(p, `muda com o dedo pousado (a ${qd.mudancaNoPousarMs} ms, ${cx ? 'caixa ' + cx.join(',') : px + ' px, recalculado da linha do tempo'}; controle ${al ? al.join(',') : '—'})`);
  }
  // 9 · Nada salta: a rolagem volta exata (02 T6; hoje o Corpo entra em 1982 px e
  // volta em 1091), com e sem "Reduzir movimento"
  if (mov && mov.rolagemDe && extra.passosD) {
    const de = extra.passosD.find(x => x.id === mov.rolagemDe);
    if (de && de.antes && d.depois) (Math.abs(de.antes.y - d.depois.y) > 1 ? reprova : passa)('9 a rolagem volta exata', `entrou em ${de.antes.y} px, voltou em ${d.depois.y} px`);
  }
  // 6 · O foco não se perde
  {
    const p = '6 foco não se perde';
    const fa = a.depois && a.depois.foco, fd = d.depois && d.depois.foco;
    if (fd === 'body' && fa !== 'body') reprova(p, `o foco vai ao body (antes: ${fa})`);
    else if (fd === 'body' && ehCamada(mov)) reprova(p, 'abrir ou fechar camada deixa o foco no body (peça 5: lugar declarado; 05 M8/M9)');
    else if (fd === 'body') confira(p, 'o foco vai ao body, como no antes');
    else passa(p, `foco em ${fd}`);
  }
  // 8 · Sem enfeite — e o que o dono decidiu, passo a passo
  if (!reduz) {
    const p = '8 sem enfeite (decisões do dono)';
    const n0 = v.length;
    const foraDosTokens = vivas.filter(x => !ehPulso(x) && x.dur != null && !DURACOES.some(t => Math.abs(t - x.dur) <= 1));
    const inf = vivas.filter(x => (x.iter === Infinity || x.iter == null) && !ehPulso(x));
    const quique = vivas.filter(x => Math.abs(x.dur - DUR_QUIQUE) <= 1 || ultrapassa(x.curva) || (x.curvasDosQuadros || []).some(ultrapassa));
    if (foraDosTokens.length) reprova(p, 'duração fora dos tokens: ' + foraDosTokens.map(x => `${x.nome} ${x.dur} ms`).join(', '));
    if (inf.length) reprova(p, 'movimento infinito que não é o ponto ao vivo: ' + inf.map(x => x.nome).join(', '));
    if (quique.length && !(mov && mov.tipo === 'quique')) reprova(p, 'quique fora da chegada da folha e do painel de apagar: ' + quique.map(x => `${x.nome} ${x.dur} ms ${x.curva}`).join(', '));
    if (mov && mov.tipo === 'nenhum' && novas.length) reprova(p, 'movimento onde a doutrina decidiu nenhum: ' + novas.map(x => `${x.nome} (${(x.props || []).join('+')})`).join(', '));
    if (mov && ehCamada(mov) && !mov.meio && (qd.quadrosComQualquerMudanca || 0) < 3) reprova(p, `troca num quadro só (${qd.quadrosComQualquerMudanca}): o ${mov.tipo} de ${mov.ms} ms não aparece`);
    if (mov && mov.ms && ehCamada(mov) && !mov.meio && (qd.quadrosComQualquerMudanca || 0) >= 3 && (visivel < 0.5 * mov.ms || visivel > 1.5 * mov.ms))
      confira(p, `a tela muda por ${visivel} ms; o decidido é ${mov.ms} ms (ver mudancasFinas: o pulso que chega também conta)`);
    // decisão 4: tela cheia chega pela direita com a de baixo PARADA
    if (mov && mov.debaixo && tiraD && !/reduz/.test(rodada)) {
      // A de baixo PARADA quer dizer: não se mexe enquanto a outra passa. Na
      // entrada, a faixa da esquerda (0–60 px) igual entre +50 e +100 ms, as
      // duas com a de baixo à mostra; na saída, igual entre +150 ms (já
      // descoberta) e o fim. Não se compara com o "antes do dedo": com a View
      // Transition a foto da de baixo guarda o estado de toque do controle que
      // abriu (o cartão apertado), que não é movimento — visto na peça 5, 07 §11.
      const [c1, c2] = mov.debaixo === 'entra' ? ['+50', '+100'] : ['+150', '+800'];
      // (`debaixoAte`: a faixa só até essa altura — no fluxo 17 o cronômetro
      // desce de propósito pela faixa da esquerda, 52 px, junto com a camada)
      const y1 = mov.debaixoAte || 896;
      const f = faixa(tiraD, c1, c2, 0, 60, 0, y1);
      if (f != null) (f > 0.01 ? reprova : passa)(p, `faixa da esquerda (0–60 px${y1 < 896 ? ', y 0–' + y1 : ''}) entre ${c1} e ${c2} ms: ${(f * 100).toFixed(1)} % diferente (a de baixo parada: < 1 %)`);
    }
    // decisão 3 (peça 6): o carrossel — a página inteira (as fotos da raiz) e o
    // fio em 350 ms; a barra parada (a faixa dos rótulos, y 856–896, sem o fio)
    if (mov && mov.tipo === 'aba' && !mov.meio) {
      const raiz = vivas.filter(x => /::view-transition-(old|new)\(root\)/.test(x.pseudo || '') && Math.abs(x.dur - mov.ms) <= 1);
      const fio = vivas.filter(x => /ins-tab-ind/.test(x.alvo || '') && (x.props || []).includes('transform'));
      if (raiz.length < 2) reprova(p, `a página inteira não desliza: ${raiz.length} foto(s) da raiz em ${mov.ms} ms (${vivas.map(x => x.nome + ' ' + x.dur).join(', ')})`);
      if (!fio.length || fio.some(x => Math.abs(x.dur - mov.ms) > 1)) reprova(p, `o fio não anda junto: ${fio.map(x => x.nome + ' ' + x.dur + ' ms').join(', ') || 'nenhuma animação no fio'}`);
      // (+50 a +150 e +250 a +800: no Chromium com o dedo do CDP, a aba tocada
      // fica apertada até ~+150 depois de soltar — 07 §1.1 —, e isso não é a barra andar)
      if (tiraD) for (const [c1, c2] of [['+50', '+150'], ['+250', '+800']]) {
        const f = faixa(tiraD, c1, c2, 0, 414, 856, 896);
        if (f != null) (f > 0.01 ? reprova : passa)(p, `a barra (rótulos, y 856–896) entre ${c1} e ${c2} ms: ${(f * 100).toFixed(1)} % diferente (parada: < 1 %)`);
      }
    }
    if (v.length === n0) passa(p, mov ? `esperado: ${mov.tipo}${mov.ms ? ' ' + mov.ms + ' ms' : ''}; ${novas.length} movimento(s) novo(s), ${qd.quadrosComQualquerMudanca} quadro(s) com mudança em ${visivel} ms` : 'sem expectativa para este passo');
  }
  return v;
}

function ff(args) { execFileSync('/usr/bin/ffmpeg', ['-v', 'error', '-y', ...args]); }
/** Os dois vídeos lado a lado, de t-0,5 s a t+1 s em cada um, com rótulo. */
function ladoALado(va, ta, vd, td, rotA, rotD, saida, lento) {
  const ini = x => Math.max(0, (x - 500) / 1000).toFixed(3);
  const rot = (txt, cor) => `pad=iw:ih+44:0:44:${cor},drawtext=fontfile=${FONTE}:text='${txt.replace(/[':]/g, ' ')}':x=10:y=14:fontsize=15:fontcolor=white`;
  const vel = lento ? ',setpts=4*PTS' : '';
  ff(['-ss', ini(ta), '-t', '1.5', '-i', va, '-ss', ini(td), '-t', '1.5', '-i', vd,
      '-filter_complex', `[0:v]${rot(rotA, '0x1e1e1e')}${vel}[a];[1:v]${rot(rotD, '0x24604a')}${vel}[b];[a][b]hstack=inputs=2:shortest=0[v]`,
      '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', '25', saida]);
}

fs.mkdirSync(SAIDA, { recursive: true });
const resultado = [];
const fluxos = fs.readdirSync(ANTES).filter(f => /^\d\d[a-z]?-/.test(f) && fs.existsSync(path.join(DEPOIS, f)));
for (const f of fluxos) {
  const rodadas = fs.readdirSync(path.join(ANTES, f)).map(x => /^medidas-(.+)\.json$/.exec(x)).filter(Boolean).map(m => m[1])
    .filter(r => fs.existsSync(path.join(DEPOIS, f, 'medidas-' + r + '.json')));
  fs.mkdirSync(path.join(SAIDA, f), { recursive: true });
  for (const r of rodadas) {
    const A = lerJSON(path.join(ANTES, f, 'medidas-' + r + '.json')), D = lerJSON(path.join(DEPOIS, f, 'medidas-' + r + '.json'));
    // o par sem movimento reduzido, para comparar a tela final
    const rLivre = r.replace('-reduz', '');
    const DL = /reduz/.test(r) && fs.existsSync(path.join(DEPOIS, f, 'medidas-' + rLivre + '.json')) ? lerJSON(path.join(DEPOIS, f, 'medidas-' + rLivre + '.json')) : null;
    A.passos.forEach((pa, i) => {
      const pd = D.passos.find(x => x.id === pa.id);
      if (!pd || pa.erro || pd.erro) { resultado.push({ fluxo: f, rodada: r, passo: pa.id, erro: (pa.erro || '') + (pd ? pd.erro || '' : ' sem passo no depois') }); return; }
      const nn = String(i + 1).padStart(2, '0') + '-' + pa.id + '-' + r;
      let extra = null;
      if (DL) {
        const pl = DL.passos.find(x => x.id === pa.id);
        if (pl && pl.quadroFinal && pd.quadroFinal) extra = { finalDiferente: difQuadros(path.join(DEPOIS, f, pd.quadroFinal), path.join(DEPOIS, f, pl.quadroFinal)) };
      }
      const fl = FLUXOS.find(x => x.id === f), mov = fl && (fl.passos.find(x => x.id === pa.id) || {}).mov;
      const tiraD = path.join(DEPOIS, f, path.basename(pd.tira || ''));
      const vered = julga(r, pa, pd, Object.assign({ fluxo: f, passosD: D.passos }, extra || {}), mov, fs.existsSync(tiraD) ? tiraD : null);
      // a tira do antes sobre a do depois
      const ta = path.join(ANTES, f, path.basename(pa.tira)), td = path.join(DEPOIS, f, path.basename(pd.tira));
      if (!process.env.SEMPAR && fs.existsSync(ta) && fs.existsSync(td)) execFileSync(PY, [path.join(AQUI, 'revisor-tiras.py'), 'par', ta, td, path.join(SAIDA, f, nn + '-par.png'), ROT_A + ' · ' + r, ROT_D + ' · ' + r]);
      // os vídeos lado a lado, alinhados no zero do passo
      if (FAZ_VIDEO && pa.t0NoVideoMs != null && pd.t0NoVideoMs != null) {
        const va = path.join(ANTES, f, A.video), vd = path.join(DEPOIS, f, D.video);
        try {
          ladoALado(va, pa.t0NoVideoMs, vd, pd.t0NoVideoMs, ROT_A, ROT_D, path.join(SAIDA, f, nn + '.mp4'), false);
          ladoALado(va, pa.t0NoVideoMs, vd, pd.t0NoVideoMs, ROT_A + ' (4x mais lento)', ROT_D + ' (4x mais lento)', path.join(SAIDA, f, nn + '-lento.mp4'), true);
        } catch (e) { vered.push({ principio: '—', veredito: 'erro', motivo: 'vídeo: ' + String(e).split('\n')[0] }); }
      }
      resultado.push({ fluxo: f, rodada: r, passo: pa.id, titulo: pa.titulo, vereditos: vered,
        numeros: { telaMs: [pa.medidasDosQuadros?.primeiraMudancaMs, pd.medidasDosQuadros?.primeiraMudancaMs],
                   andaMs: [pa, pd].map(x => andaMs(x.medidasDosQuadros || {})),
                   quadrosQueMudam: [pa.medidasDosQuadros?.quadrosComQualquerMudanca, pd.medidasDosQuadros?.quadrosComQualquerMudanca],
                   ultimaMudancaMs: [pa.medidasDosQuadros?.ultimaQualquerMudancaMs, pd.medidasDosQuadros?.ultimaQualquerMudancaMs],
                   trabalhoMs: [pa.toque?.handlerMs, pd.toque?.handlerMs], eventTimingMs: [pa.toque?.eventTimingClickMs, pd.toque?.eventTimingClickMs] } });
    });
  }
}
fs.writeFileSync(path.join(SAIDA, 'protocolo.json'), JSON.stringify({ antes: ANTES, depois: DEPOIS, quando: new Date().toISOString(), duracoes: DURACOES, resultado }, null, 1));
// Resumo: por princípio, quantos passos passam, reprovam ou ficam a conferir.
const conta = {};
resultado.forEach(x => (x.vereditos || []).forEach(v => { const c = conta[v.principio] = conta[v.principio] || { passa: 0, REPROVA: 0, 'a conferir': 0, erro: 0 }; c[v.veredito]++; }));
console.table(conta);
resultado.filter(x => (x.vereditos || []).some(v => v.veredito === 'REPROVA')).forEach(x =>
  x.vereditos.filter(v => v.veredito === 'REPROVA').forEach(v => console.log(`REPROVA ${x.fluxo} · ${x.passo} · ${x.rodada} · ${v.principio}: ${v.motivo}`)));
resultado.filter(x => x.erro).forEach(x => console.log(`ERRO ${x.fluxo} · ${x.passo} · ${x.rodada}: ${x.erro}`));
