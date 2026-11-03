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
 * O retrato que o protocolo quer, pedido como IDEAL e nunca como exigência.
 *
 * Constraint exata (`exact`) faz o navegador recusar a câmera inteira quando o
 * aparelho não entrega aquele modo — e aí o app fica sem câmera por causa de
 * uma preferência. Ideal é preferência: ele chega o mais perto que conseguir.
 */
const PEDIDO: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1080 },
    height: { ideal: 1440 }
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

/** O vídeo já tem quadro para capturar? Antes disso a captura sai preta. */
export function pronto(v: HTMLVideoElement | null | undefined): boolean {
  return !!v && v.readyState >= 2 && !!v.videoWidth && !!v.videoHeight;
}

// ---------------------------------------------------------------------------
// O QUADRO EM PÉ — o mesmo para a tela da câmera e para a foto.
//
// Medido em 03/11 num iPhone 11 Pro Max, com o app em pé: a tela da câmera
// mostrava 55% da largura e 55% da altura do que a câmera do sistema mostra,
// do mesmo lugar — 1,8× mais perto. E três de quatro fotos saíam deitadas, com
// a faixa do meio da altura ampliada 1,3×.
//
// A causa é uma só. O vídeo se anunciava DEITADO (`videoWidth > videoHeight`)
// com o conteúdo em pé, e o Safari preenche o quadro que recebe: a imagem em pé
// cobria um quadro deitado, perdendo a parte de cima e a de baixo. Na foto, era
// isso. Na tela, o `object-fit: cover` do quadro 3:4 ainda cortava os lados
// desse quadro deitado — dois cortes, 55% × 55%.
//
// O conserto é dar ao Safari um quadro EM PÉ para preencher: aí o mesmo
// preenchimento devolve a cena inteira. E a tela passa a ser desenhada por esta
// mesma função, num canvas, em vez de mostrar o <video> direto — o que se vê
// enquadrando é, por construção, o que fica guardado.

/**
 * O celular está em pé? Retrato na tela e dedo como ponteiro.
 *
 * As duas juntas separam o caso que importa — o iPhone, onde o app só
 * funciona em pé e a câmera gira com o aparelho — do notebook, onde a webcam é
 * deitada de verdade e a janela também.
 */
export function celularEmPe(): boolean {
  try {
    return typeof matchMedia === 'function' &&
           matchMedia('(orientation: portrait)').matches && matchMedia('(pointer: coarse)').matches;
  } catch (e) { return false; }
}

/** O vídeo se anuncia deitado com o conteúdo em pé: o caso medido no iPhone. */
function anunciaDeitado(v: HTMLVideoElement): boolean {
  return v.videoWidth > v.videoHeight && celularEmPe();
}

/** O tamanho, em pé, do quadro que sai deste vídeo para a FOTO. */
export function tamanhoDoQuadro(v: HTMLVideoElement): { l: number; a: number } {
  const vl = v.videoWidth, va = v.videoHeight;
  if (va >= vl) return { l: vl, a: va };
  if (anunciaDeitado(v)) return { l: va, a: vl };
  // a webcam do notebook, deitada de verdade: o recorte 3:4 do meio
  return { l: Math.round(va * 3 / 4), a: va };
}

/**
 * Desenha um quadro do vídeo num retângulo l × a, preenchendo-o como o
 * `object-fit: cover` preencheria: sem esticar, cortando só o que sobra.
 */
export function desenhaQuadro(c: CanvasRenderingContext2D, v: HTMLVideoElement, l: number, a: number): void {
  const vl = v.videoWidth, va = v.videoHeight;
  // O caso do iPhone: os números do vídeo estão trocados, então não servem para
  // calcular recorte nenhum. O vídeo inteiro vai para o retângulo em pé, e o
  // próprio Safari o preenche sem esticar.
  if (anunciaDeitado(v)) { c.drawImage(v, 0, 0, l, a); return; }
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
