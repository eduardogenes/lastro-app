// A RÉGUA DE REPETIÇÕES — a ação mais frequente do produto, 48 vezes por semana.
//
// O dono escolheu a régua (decisão 8), e a frente 2 §1 escreveu o conserto dela
// em sete requisitos. Este arquivo é a parte PURA: quais valores a régua carrega
// e qual página a janela mostra. Nada aqui sabe de DOM, de relógio ou de estado.
//
// ---- Os valores: a fórmula é a do protótipo, conferida ----
//
// `lo = min(ref−4, faixa[0]−1)`, `hi = max(ref+5, faixa[1]+2)`, com `lo ≥ 1`
// (`03-direcao-D/prototipo.html:700`). A régua é assimétrica de propósito: ela
// abre mais para cima do que para baixo, porque subir repetição é o caso comum
// e descer é exceção.
//
// **Mas a fórmula sozinha produz régua grande demais, e eu medi onde ela
// quebra.** Com a referência longe da faixa — última 1 repetição, faixa
// prescrita 15–25 — ela devolve 27 valores, e aí nenhuma paginação segura o teto
// de 3 toques. Varri o alcance por tamanho de régua e por posição inicial:
//
// | valores | pior alcance, por onde a régua abre |
// |---:|---|
// | 11 | **3 em qualquer posição** |
// | 12 | 3, menos quando a referência é o primeiro valor (4) |
// | 13 | 3, menos nas três pontas (4) |
// | 14 | 4 em cinco das catorze posições |
//
// Daí o `TETO_DE_VALORES`. Ele não é gosto: **11 é o maior tamanho em que todo
// valor custa no máximo 3 toques, qualquer que seja o lugar em que a régua
// abre** — e 3 é o número que a medição B reprova acima.
//
// ---- A paginação, e por que ela não é "arrastar" nem "um valor por toque" ----
//
// A §1.1 mediu a geometria e ela não tem conserto: **54 px de botão com 6 de vão
// em 382 px de tela cabem no máximo 6, sempre**, qualquer que seja o exercício.
// Com 10 a 13 valores, de 4 a 7 ficam fora da janela. Isso não é defeito, é a
// forma (causa 1 da §1.2).
//
// O que a §1.3 pede é que os escondidos sejam ALCANÇÁVEIS sem arrasto: R1 tira o
// gesto horizontal do navegador (`touch-action: pan-y`) e R2 manda a janela
// andar "um passo" por toque na borda. **"Um passo" tem duas leituras, e a
// medição decide qual.** A medição B reprova com "mediana acima de 1 toque, ou
// qualquer série que custe mais de 3" (§1.5). Andando de um VALOR por toque, o
// valor mais distante de uma régua de 13 custa 6 toques de borda mais 1 = 7:
// reprovado pela aritmética, antes de existir. Então o passo é uma JANELA.
//
// E com a janela como passo, o alcance vira propriedade demonstrável em vez de
// esperança — o caso *nenhum valor custa mais de três toques* a cobra para todo
// tamanho de régua que a fórmula produz.
//
// ---- Por que a página não rola, e o que isso apaga ----
//
// A janela mostra `SLOTS` valores e **só eles existem no DOM**. Não há contêiner
// rolável, não há `scroll-snap`, não há `scrollLeft`. Isso apaga as causas 2 e 3
// da §1.2 por construção, em vez de consertá-las:
//
//  - **causa 2, o toque engolido como arrasto**: sem contêiner rolável na
//    horizontal não há pan para o toque virar. O `touch-action: pan-y` do R1
//    continua declarado, como cinto além do suspensório.
//  - **causa 3, a janela que se perde no minuto**: a posição não é `scrollLeft`
//    nenhum — é derivada do valor em foco, que é exatamente o que o R4 pede
//    ("estado derivado do valor em foco, não um `scrollLeft` guardado"). Um
//    re-render do relógio reconstrói a mesma página, porque ela é função do
//    foco.
//
// ---- Os dois slots de andar NÃO mostram número ----
//
// A R2 escreve "os dois valores das extremidades viram dois alvos de andar". Eu
// implemento os alvos **sem o número dentro**, e a razão é a própria medição A:
// "erro de alvo tem tolerância zero" (§1.5), e um botão que mostra `12` e não
// registra 12 é a definição de erro de alvo. Os slots de andar mostram seta, e o
// nome acessível deles diz qual trecho aparece.
//
// E o slot só é de andar quando há para onde andar: na ponta da régua ele volta
// a ser valor, porque ali não existe passo nenhum a dar.

/**
 * Quantos slots a janela tem.
 *
 * É o teto medido da §1.1, e a conta é do aparelho dele: num iPhone 11 Pro Max a
 * janela tem 414 px de CSS, `.ctl` tira 16 de cada lado e sobram **382**. Com
 * botão de 54 e vão de 6, `6×54 + 5×6 = 354 ≤ 382` — e sete não cabem
 * (`7×54 + 6×6 = 414`). O número não depende do exercício.
 */
export const SLOTS = 6;

/** Quantos valores a janela oferece quando os dois slots de andar estão de pé. */
export const PASSO = SLOTS - 2;

export type Faixa = readonly [number, number];

export type Regua = {
  /** Todos os valores, em ordem, do menor ao maior. */
  readonly valores: readonly number[];
  /** A faixa prescrita pelo treinador, se houver. */
  readonly faixa: Faixa | null;
  /** O valor de referência: a última vez. É onde a janela começa. */
  readonly referencia: number;
};

export type Slot =
  | { readonly tipo: 'valor'; readonly v: number; readonly naFaixa: boolean; readonly referencia: boolean }
  | { readonly tipo: 'anda'; readonly dir: -1 | 1; readonly de: number; readonly ate: number };

/**
 * Quantos valores a régua carrega, no máximo.
 *
 * Medido, e o número é o do alcance: 11 é o maior tamanho em que todo valor
 * custa no máximo 3 toques **em qualquer posição de abertura**. Em 12 a régua
 * que abre no primeiro valor já custa 4, e 4 reprova a medição B.
 */
export const TETO_DE_VALORES = 11;

/**
 * Os valores que a régua carrega: a fórmula do protótipo, com o teto.
 *
 * Quando a fórmula estoura o teto, **quem cede é a cortesia, não a faixa nem a
 * referência** — e a direção em que ela cede é a da faixa:
 *
 *  - faixa ACIMA da referência: a régua sobe a partir da referência, para o lado
 *    de onde ele tem de chegar;
 *  - faixa ABAIXO: desce;
 *  - faixa CONTENDO a referência (e larga demais): centra na referência, que é o
 *    valor que ele vai registrar quase sempre.
 *
 * O que sobra de fora passa pela porta "outro valor". É o mesmo desenho da §6.1
 * para repetição fora da régua, e ela existe justamente para isto.
 */
export function regua(referencia: number, faixa: Faixa | null): Regua {
  let lo = Math.max(1, faixa ? Math.min(referencia - 4, faixa[0] - 1) : referencia - 4);
  let hi = faixa ? Math.max(referencia + 5, faixa[1] + 2) : referencia + 5;
  if (hi < lo) hi = lo;

  if (hi - lo + 1 > TETO_DE_VALORES) {
    if (faixa && faixa[0] > referencia) {
      lo = Math.max(1, referencia - 1);
      hi = lo + TETO_DE_VALORES - 1;
    } else if (faixa && faixa[1] < referencia) {
      hi = referencia + 1;
      lo = Math.max(1, hi - TETO_DE_VALORES + 1);
      hi = lo + TETO_DE_VALORES - 1;
    } else {
      lo = Math.max(1, referencia - Math.floor((TETO_DE_VALORES - 1) / 2));
      hi = lo + TETO_DE_VALORES - 1;
    }
  }

  const valores: number[] = [];
  for (let v = lo; v <= hi; v++) valores.push(v);
  return { valores, faixa, referencia };
}

/** O índice do valor em foco, com quem está fora da régua caindo no mais perto. */
function indiceDoFoco(r: Regua, foco: number): number {
  const i = r.valores.indexOf(foco);
  if (i >= 0) return i;
  if (!r.valores.length) return 0;
  return foco < r.valores[0]! ? 0 : r.valores.length - 1;
}

/** Onde a janela começa para que o foco apareça, e nunca na borda se der. */
function inicioDaJanela(r: Regua, foco: number, slots: number): number {
  if (r.valores.length <= slots) return 0;
  const i = indiceDoFoco(r, foco);
  const bruto = i - Math.floor(slots / 2);
  return Math.min(Math.max(0, bruto), r.valores.length - slots);
}

/**
 * A página que a janela mostra: `SLOTS` slots, alguns de valor e no máximo dois
 * de andar.
 *
 * Função pura do foco — é o R4 inteiro. Reconstruir a página com o mesmo foco dá
 * a mesma página, então nenhum re-render move a janela.
 */
export function pagina(r: Regua, foco: number, slots: number = SLOTS): Slot[] {
  const ini = inicioDaJanela(r, foco, slots);
  const fim = Math.min(r.valores.length, ini + slots);
  const temAntes = ini > 0;
  const temDepois = fim < r.valores.length;
  const passo = Math.max(1, slots - 2);
  const out: Slot[] = [];
  for (let j = ini; j < fim; j++) {
    const v = r.valores[j]!;
    if (j === ini && temAntes) {
      const alvo = Math.max(0, ini - passo);
      out.push({ tipo: 'anda', dir: -1, de: r.valores[alvo]!, ate: r.valores[ini - 1]! });
      continue;
    }
    if (j === fim - 1 && temDepois) {
      const alvo = Math.min(r.valores.length - 1, fim - 1 + passo);
      out.push({ tipo: 'anda', dir: 1, de: r.valores[fim]!, ate: r.valores[alvo]! });
      continue;
    }
    out.push({
      tipo: 'valor', v,
      naFaixa: !!r.faixa && v >= r.faixa[0] && v <= r.faixa[1],
      referencia: v === r.referencia
    });
  }
  return out;
}

/** O foco depois de um toque num slot de andar: uma janela, não um valor. */
export function anda(r: Regua, foco: number, dir: -1 | 1, slots: number = SLOTS): number {
  const passo = Math.max(1, slots - 2);
  const i = indiceDoFoco(r, foco);
  const j = Math.min(r.valores.length - 1, Math.max(0, i + dir * passo));
  return r.valores[j]!;
}

/** Os valores que a página oferece para registrar, na ordem em que aparecem. */
export function escolhiveis(slots: readonly Slot[]): number[] {
  return slots.filter(s => s.tipo === 'valor').map(s => (s as { v: number }).v);
}
