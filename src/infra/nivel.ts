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

/**
 * Até quantos graus o celular está no nível, uma régua para cada direção
 * (`recomendacoes-quem-fotografa.md`, F9; antes era 1° nas duas).
 *
 * PARA A FRENTE pesa mais: o celular apontado para baixo aumenta a cabeça e o
 * tronco e encolhe as pernas, e girar a foto depois não desfaz isso. Na 1×, a
 * lente do protocolo, cada grau muda 2,1% da proporção entre a metade de cima e
 * a de baixo do corpo.
 *
 * DE LADO só gira a foto, sem mudar proporção nenhuma, e o "Ajustar" endireita.
 * O agente aceita até 5° porque a comparação endireitaria sozinha pelo ângulo
 * gravado — mas isso pede o SENTIDO do giro, que este sensor não garante (ver o
 * começo do arquivo). Enquanto a comparação não endireita, a régua de lado é a
 * do alvo dele, 2°.
 */
export const NIVEL_FRENTE = 1;
export const NIVEL_LADO = 2;
/**
 * O verde acende ao entrar na régua e só apaga depois de passar dela por esta
 * folga (F9): com o celular na mão, o número dança em volta do limite, e o
 * indicador piscaria a cada décimo.
 */
export const FOLGA_DO_NIVEL = 0.3;

/** Acima disto, em graus por segundo no toque, a foto pode ter tremido (F12, na 1×). */
export const TREMOR = 4;
/** Abaixo disto, o maior giro do segundo antes do toque: o celular estava apoiado (F13). */
export const APOIADO = 0.1;

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

/**
 * As duas dentro da régua? Com `antes` (se estava no nível na leitura
 * anterior), quem já estava verde só sai depois da folga.
 */
export function noNivel(n: Nivel | null | undefined, antes?: boolean): boolean {
  if (!n) return false;
  const f = antes ? FOLGA_DO_NIVEL : 0;
  return n.lado <= NIVEL_LADO + f && n.frente <= NIVEL_FRENTE + f;
}

/** O que passou da régua, em palavras: "frente 1,4°", "de lado 2,6° · frente 1,2°". */
export function foraDoNivel(n: Nivel | null | undefined): string {
  if (!n) return '';
  const g = function (x: number) { return String(Math.round(x * 10) / 10).replace('.', ',') + '°'; };
  const partes: string[] = [];
  if (n.lado > NIVEL_LADO) partes.push('de lado ' + g(n.lado));
  if (n.frente > NIVEL_FRENTE) partes.push('frente ' + g(n.frente));
  return partes.join(' · ');
}

/** O giro do celular num instante, em graus por segundo, pelos três eixos. */
export function velocidade(r: { alpha?: number | null; beta?: number | null; gamma?: number | null } | null | undefined): number | null {
  if (!r || r.alpha == null || r.beta == null || r.gamma == null) return null;
  const a = Number(r.alpha), b = Number(r.beta), c = Number(r.gamma);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return null;
  return Math.hypot(a, b, c);
}

export interface Movimento { toque: number; seg: number; }

/**
 * O giro do último segundo, para o registro do toque: o do instante e o maior
 * da janela. O primeiro diz se pode ter tremido; o segundo, se estava apoiado.
 */
export function criaMovimento() {
  let amostras: { t: number; v: number }[] = [];
  return {
    registra: function (v: number, t: number) {
      amostras.push({ t: t, v: v });
      const corte = t - 1000;
      while (amostras.length && amostras[0].t < corte) amostras.shift();
    },
    resumo: function (t: number): Movimento | null {
      const janela = amostras.filter(function (a) { return a.t >= t - 1000 && a.t <= t; });
      if (!janela.length) return null;
      const max = Math.max.apply(null, janela.map(function (a) { return a.v; }));
      return {
        toque: Math.round(janela[janela.length - 1].v * 10) / 10,
        seg: Math.round(max * 100) / 100
      };
    }
  };
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
export function escuta(aoMudar: (n: Nivel | null) => void, aoGirar?: (grausPorSegundo: number) => void): () => void {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return function () {};
  let s: { x: number; y: number; z: number } | null = null;
  const ouve = function (e: DeviceMotionEvent) {
    // o giroscópio vem no mesmo evento, e sem filtro: tremor é o pico, não a média
    const v = aoGirar ? velocidade(e && e.rotationRate) : null;
    if (aoGirar && v != null) aoGirar(v);
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
