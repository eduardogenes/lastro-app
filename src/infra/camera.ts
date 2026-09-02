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
    return { erro: 'negada', msg: 'o acesso à câmera foi negado — libere nos ajustes do navegador' };
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
