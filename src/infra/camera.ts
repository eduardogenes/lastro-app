// A câmera de dentro do app.
//
// O `<input capture>` entrega a captura para o iOS e recebe um arquivo de
// volta. É simples, dá a melhor qualidade que o aparelho sabe produzir, e é
// CEGO: entre apertar e receber o arquivo o app não existe, e por isso não há
// como pôr a foto anterior por cima na hora de enquadrar.
//
// Este módulo compra o contrário. `getUserMedia` dá o quadro vivo, o app
// desenha o que quiser em cima dele, e a captura sai de um frame do vídeo.
//
// O que se PAGA por isso, e é honesto declarar: o quadro do vídeo não passa
// pelo processamento da câmera nativa — sem HDR, sem fusão de exposições, com
// menos resolução. Para uma foto de acompanhamento isso importa menos do que
// parece, porque o que ela mede é a silhueta e não a textura da pele; e a
// consistência de enquadramento que o alinhamento ao vivo compra vale mais que
// a nitidez que se perde. Mas a câmera do sistema continua ali como alternativa,
// e é ela que atende quando isto aqui não estiver disponível.

/** Dá para abrir a câmera interna neste aparelho? */
export function temCamera(): boolean {
  return typeof navigator !== 'undefined' &&
         !!navigator.mediaDevices &&
         typeof navigator.mediaDevices.getUserMedia === 'function';
}

/**
 * O tamanho pedido à câmera: 4:3 DEITADO, como o sensor é. Pedido como IDEAL e
 * nunca como exigência.
 *
 * Deitado mesmo sendo a foto em pé, e esta é a linha que custou o dia 03/11. O
 * pedido era 1080×1440, em pé. O iPhone recorta o SENSOR, que é deitado, no
 * formato pedido e só DEPOIS gira para o celular em pé: o quadro que chegava era
 * deitado, com a largura inteira e só a faixa do meio da altura (56%). Medido
 * num iPhone 11 Pro Max contra a câmera do sistema, do mesmo lugar: a tela
 * mostrava 55% × 55% da cena (1,8× mais perto), a foto saía deitada com a faixa
 * ampliada 1,3×, e desenhá-la num quadro em pé a esticou 1,79×. Pedido no
 * formato do sensor, nada é recortado, e o giro entrega o 4:3 inteiro em pé.
 *
 * Constraint exata (`exact`) faz o navegador recusar a câmera inteira quando o
 * aparelho não entrega aquele modo — e aí o app fica sem câmera por causa de
 * uma preferência. Ideal é preferência: ele chega o mais perto que conseguir.
 */
const PEDIDO: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1440 },
    height: { ideal: 1080 }
  }
};

export type ErroDeCamera = 'sem-suporte' | 'negada' | 'ocupada' | 'nenhuma' | 'falhou';

export interface Aberta { stream: MediaStream; }
export type Resultado =
  | { ok: true; stream: MediaStream }
  | { ok: false; erro: ErroDeCamera; msg: string };

/**
 * O nome do erro do `getUserMedia` vira uma frase.
 *
 * Cada um destes tem uma saída diferente para quem está segurando o celular, e
 * é por isso que não viram todos um "não deu": permissão negada se resolve nos
 * ajustes, câmera ocupada se resolve fechando o outro app, e não ter câmera
 * nenhuma não se resolve.
 */
function traduz(e: unknown): { erro: ErroDeCamera; msg: string } {
  const nome = (e && typeof e === 'object' && 'name' in e) ? String((e as Error).name) : '';
  if (nome === 'NotAllowedError' || nome === 'SecurityError') {
    // a saída está fora do app (a D, estado 8): dita em uma frase, com o caminho
    return { erro: 'negada', msg: 'A câmera está bloqueada para este app (acesso negado). Libere em Ajustes do iPhone › Safari › Câmera › Permitir, e volte: a sessão começa do zero, sem perder nada.' };
  }
  if (nome === 'NotReadableError' || nome === 'AbortError') {
    return { erro: 'ocupada', msg: 'a câmera está ocupada por outro app' };
  }
  if (nome === 'NotFoundError' || nome === 'OverconstrainedError') {
    return { erro: 'nenhuma', msg: 'nenhuma câmera disponível neste aparelho' };
  }
  return { erro: 'falhou', msg: 'não deu para abrir a câmera' };
}

/** Abre o quadro vivo. Nunca estoura: devolve o motivo. */
export async function abre(): Promise<Resultado> {
  if (!temCamera()) {
    return { ok: false, erro: 'sem-suporte', msg: 'este navegador não abre a câmera de dentro do app' };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(PEDIDO);
    return { ok: true, stream: stream };
  } catch (e) {
    const t = traduz(e);
    return { ok: false, erro: t.erro, msg: t.msg };
  }
}

/**
 * Desliga a câmera.
 *
 * Não é higiene, é obrigação: enquanto uma faixa fica viva o iOS mantém o
 * indicador aceso e a câmera consumindo, mesmo com a tela do app fechada. Toda
 * saída desta tela passa por aqui, inclusive a que acontece por engano.
 */
export function fecha(stream: MediaStream | null | undefined): void {
  if (!stream || typeof stream.getTracks !== 'function') return;
  stream.getTracks().forEach(function (t) {
    try { t.stop(); } catch (e) {}
  });
}

/**
 * Qual câmera o navegador entregou: o rótulo dela e o zoom, quando ele diz.
 *
 * O iPhone tem até três lentes traseiras, e o `facingMode` não escolhe entre
 * elas — escolhe o navegador. A foto do app não tem EXIF (é um quadro do
 * vídeo), então a lente fica sabida por aqui ou não fica. Gravada em cada foto,
 * ela diz nos dados se a câmera do app e a do sistema estão usando a mesma
 * lente, que é a condição para as duas se compararem.
 */
export function lenteDe(stream: MediaStream | null | undefined): { nome?: string; zoom?: number } | null {
  try {
    const t = stream && typeof stream.getVideoTracks === 'function' ? stream.getVideoTracks()[0] : null;
    if (!t) return null;
    const r: { nome?: string; zoom?: number } = {};
    if (t.label) r.nome = String(t.label).slice(0, 80);
    const s = typeof t.getSettings === 'function' ? (t.getSettings() as MediaTrackSettings & { zoom?: number }) : null;
    if (s && typeof s.zoom === 'number' && Number.isFinite(s.zoom)) r.zoom = Math.round(s.zoom * 100) / 100;
    return r.nome || r.zoom != null ? r : null;
  } catch (e) {
    return null;
  }
}

/**
 * Põe a câmera na 1×, quando ela deixa escolher.
 *
 * O protocolo é sempre na 1× (`recomendacoes-quem-fotografa.md`, F5): no
 * iPhone, a câmera tripla vai de 0,5× a 10×, e o Safari não promete abrir na
 * 1×. Pedido toda vez, mesmo já estando nela, e lido de volta por `lenteDe`.
 * Nunca estoura: sem o recurso, a câmera fica como abriu.
 */
export async function fixaZoom(stream: MediaStream | null | undefined): Promise<boolean> {
  try {
    const t = stream && typeof stream.getVideoTracks === 'function' ? stream.getVideoTracks()[0] : null;
    if (!t || typeof t.getCapabilities !== 'function' || typeof t.applyConstraints !== 'function') return false;
    const z = (t.getCapabilities() as MediaTrackCapabilities & { zoom?: { min?: number; max?: number } }).zoom;
    if (!z || typeof z.min !== 'number' || typeof z.max !== 'number' || z.min > 1 || z.max < 1) return false;
    await t.applyConstraints({ advanced: [{ zoom: 1 } as MediaTrackConstraintSet] });
    return true;
  } catch (e) {
    return false;
  }
}

/** O vídeo já tem quadro para capturar? Antes disso a captura sai preta. */
export function pronto(v: HTMLVideoElement | null | undefined): boolean {
  return !!v && v.readyState >= 2 && !!v.videoWidth && !!v.videoHeight;
}

// ---------------------------------------------------------------------------
// O QUADRO EM PÉ — o mesmo para a tela da câmera e para a foto.
//
// A tela da câmera é um canvas pintado por estas funções, e a foto sai delas
// também: o que se vê enquadrando é, por construção, o que fica guardado. Antes
// a tela era o <video> direto, e o corte dele era decidido pelo navegador — foi
// assim que, em 03/11, a tela mostrava 55% × 55% da cena sem ninguém saber de
// onde vinha o corte (a causa estava no pedido à câmera; ver `PEDIDO`).
//
// A regra é uma: PREENCHER sem esticar, como o `object-fit: cover`. Vídeo em
// pé (o caso do celular, com o pedido certo) vira a foto inteira. Vídeo deitado
// (a webcam do notebook, ou o celular se um dia voltar a entregar deitado) vira
// o recorte 3:4 do meio — que é exatamente o que a tela mostra. Esticar nunca:
// desenhar o quadro deitado num retângulo em pé foi tentado em 03/11 e saiu
// 1,79× alongado, porque o que o vídeo entrega já é o quadro deitado, e não há
// cena escondida para recuperar.

/** O tamanho, em pé, do quadro que sai deste vídeo para a FOTO. */
export function tamanhoDoQuadro(v: HTMLVideoElement): { l: number; a: number } {
  const vl = v.videoWidth, va = v.videoHeight;
  if (va >= vl) return { l: vl, a: va };
  return { l: Math.round(va * 3 / 4), a: va };
}

/**
 * Desenha um quadro do vídeo num retângulo l × a, preenchendo-o como o
 * `object-fit: cover` preencheria: sem esticar, cortando só o que sobra.
 */
export function desenhaQuadro(c: CanvasRenderingContext2D, v: HTMLVideoElement, l: number, a: number): void {
  const vl = v.videoWidth, va = v.videoHeight;
  const r = l / a, rv = vl / va;
  let sx = 0, sy = 0, sw = vl, sh = va;
  if (rv > r + 1e-3) { sw = va * r; sx = (vl - sw) / 2; }
  else if (rv < r - 1e-3) { sh = vl / r; sy = (va - sh) / 2; }
  if (!sx && !sy) c.drawImage(v, 0, 0, l, a);
  else c.drawImage(v, sx, sy, sw, sh, 0, 0, l, a);
}

/**
 * Pinta a tela da câmera: o quadro do vídeo num canvas do tamanho que ele
 * ocupa na página. Densidade de até 2×: a tela é para enquadrar, e 3× custaria
 * bateria a cada quadro sem mostrar nada que o alinhamento precise.
 */
export function pintaTela(tela: HTMLCanvasElement, v: HTMLVideoElement): boolean {
  if (!pronto(v)) return false;
  const caixa = tela.getBoundingClientRect();
  // sem tamanho na página (ainda montando, ou fora dela) não há o que pintar
  if (!caixa.width || !caixa.height) return false;
  const d = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
  const l = Math.max(1, Math.round(caixa.width * d)), a = Math.max(1, Math.round(caixa.height * d));
  if (tela.width !== l || tela.height !== a) { tela.width = l; tela.height = a; }
  const c = tela.getContext('2d');
  if (!c) return false;
  desenhaQuadro(c, v, l, a);
  return true;
}
