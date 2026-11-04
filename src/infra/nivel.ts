// O nível do celular, pela gravidade.
//
// A auditoria das fotos (docs/fotos/01-captura.md) achou celular girado até
// 4,2° e inclinações que só se veem na borda do armário. Com 2° para a frente
// ou para trás, a escala da cabeça e a dos pés já diferem uns 3%, e nenhum
// ajuste depois devolve isso. O nível tem de estar certo ANTES de ele sair de
// perto do celular — e é por isso que ele aparece na câmera, e fica gravado em
// cada foto.
//
// Por que a gravidade (`devicemotion`) e não os ângulos de `deviceorientation`:
// com o celular EM PÉ, o beta fica em 90° e o gamma perde o sentido (os eixos
// se alinham, e girar o celular no plano da tela vira um misto de alpha e
// gamma). O vetor da gravidade nas coordenadas do aparelho não tem esse ponto
// cego: em pé, ele está todo no eixo y, e o que vaza para x e para z é o erro.
//
// O SINAL não é prometido. O iOS já entregou esse vetor com os eixos invertidos
// em relação ao Android, e daqui não há como conferir num iPhone. Por isso o
// nível diz e grava só o TAMANHO de cada inclinação — que é o que decide se a
// foto serve —, e não o lado para onde ela vai.

export interface Nivel {
  /** girado no plano da tela, em graus (0 = em pé reto) */
  lado: number;
  /** inclinado para a frente ou para trás, em graus (0 = lente na horizontal) */
  frente: number;
}

/** Dentro disto, em graus, nas duas direções, o celular está no nível. */
export const NIVEL_OK = 1;

const GRAU = 180 / Math.PI;

/**
 * As duas inclinações a partir do vetor da gravidade (m/s²). `null` quando o
 * vetor não é de um celular parado e em pé: em queda livre não há gravidade
 * para ler, e deitado o nível de retrato não se aplica.
 */
export function angulos(x: number, y: number, z: number): Nivel | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  const g = Math.hypot(x, y, z);
  if (g < 5) return null;
  const ay = Math.abs(y);
  if (ay < g * 0.5) return null;      // mais de 60° fora do prumo: não está em pé
  return {
    lado: Math.round(Math.atan2(Math.abs(x), ay) * GRAU * 10) / 10,
    frente: Math.round(Math.atan2(Math.abs(z), ay) * GRAU * 10) / 10
  };
}

/** As duas dentro da tolerância? */
export function noNivel(n: Nivel | null | undefined): boolean {
  return !!n && n.lado <= NIVEL_OK && n.frente <= NIVEL_OK;
}

/**
 * Pede a permissão de movimento. No iOS ela só pode ser pedida dentro de um
 * toque, e por isso quem chama é o toque que abre a câmera, antes de qualquer
 * `await`. Fora do iOS não há o que pedir.
 */
export function pedePermissao(): Promise<boolean> {
  const D = typeof DeviceMotionEvent !== 'undefined'
    ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
    : null;
  if (!D) return Promise.resolve(false);
  if (typeof D.requestPermission !== 'function') return Promise.resolve(true);
  try {
    return D.requestPermission().then(function (r) { return r === 'granted'; }, function () { return false; });
  } catch (e) {
    return Promise.resolve(false);
  }
}

/**
 * Escuta o nível. Devolve a função que para de escutar — e quem abre a câmera
 * tem de chamá-la ao fechar, como desliga a câmera.
 *
 * O vetor passa por um filtro curto: a mão que solta o celular no apoio faz o
 * número pular, e o que interessa é onde ele assenta.
 */
export function escuta(aoMudar: (n: Nivel | null) => void): () => void {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return function () {};
  let s: { x: number; y: number; z: number } | null = null;
  const ouve = function (e: DeviceMotionEvent) {
    const a = e && e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    s = s
      ? { x: s.x * 0.8 + a.x * 0.2, y: s.y * 0.8 + a.y * 0.2, z: s.z * 0.8 + a.z * 0.2 }
      : { x: a.x, y: a.y, z: a.z };
    aoMudar(angulos(s.x, s.y, s.z));
  };
  window.addEventListener('devicemotion', ouve as EventListener);
  return function () { window.removeEventListener('devicemotion', ouve as EventListener); };
}
