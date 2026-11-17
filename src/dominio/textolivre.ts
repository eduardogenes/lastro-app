// O TEXTO LIVRE do "+" (direção 3, Fase 4): "almocei e tomei 2 copos",
// "pesei 77,6", "jantei". Entende três coisas, e só quando tem certeza:
// refeições do plano de hoje, copos de água e o peso. O resto não vira nada,
// e a tela diz "não entendi" em vez de adivinhar: um registro errado custa
// mais que um toque a mais.
//
// Regra pura: recebe o texto e as refeições do dia, devolve o que entendeu.

export interface RefeicaoNomeada { id: string; n: string }
export interface Entendido {
  /** as refeições citadas, pelo id, na ordem do dia */
  refeicoes: string[];
  /** copos de água a somar */
  copos: number | null;
  /** o peso em kg */
  peso: number | null;
}

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Os jeitos de dizer cada refeição, pelos nomes comuns do plano. Um nome do
 * plano que não está aqui ainda é entendido pela palavra principal dele.
 */
const VERBOS: Array<[RegExp, string]> = [
  [/\b(almocei|almoco|almocar)\b/, 'almoco'],
  [/\b(jantei|janta|jantar)\b/, 'jantar'],
  [/\b(lanchei|lanche|lanchar)\b/, 'lanche'],
  [/\b(cafe da manha|tomei cafe|cafe)\b/, 'cafe'],
  [/\b(ceia|ceei)\b/, 'ceia'],
  [/\b(pre[- ]?treino|pre)\b/, 'pre'],
  [/\b(pos[- ]?treino|pos)\b/, 'pos']
];

const NUMEROS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6 };

export function interpretaTexto(texto: string, refeicoes: RefeicaoNomeada[]): Entendido {
  const t = semAcento(String(texto || '')).replace(/\s+/g, ' ').trim();
  const r: Entendido = { refeicoes: [], copos: null, peso: null };
  if (!t) return r;

  // o peso: um número com vírgula ou ponto entre 30 e 250, perto de "kg",
  // "pesei" ou "peso"; um número solto não é peso
  const p = t.match(/(?:pesei|peso|pesando)\s*(?:de\s*)?(\d{2,3}(?:[.,]\d)?)|(\d{2,3}(?:[.,]\d)?)\s*(?:kg|quilos?)\b/);
  if (p) {
    const v = parseFloat((p[1] || p[2]).replace(',', '.'));
    if (v >= 30 && v <= 250) r.peso = v;
  }

  // os copos: "2 copos", "dois copos", "um copo d'água"; "agua" sozinha é um
  const c = t.match(/(\d{1,2}|um|uma|dois|duas|tres|quatro|cinco|seis)\s*cop/);
  if (c) r.copos = /\d/.test(c[1]) ? parseInt(c[1], 10) : NUMEROS[c[1]];
  else if (/\b(copo|agua)\b/.test(t)) r.copos = 1;
  if (r.copos != null && (r.copos < 1 || r.copos > 20)) r.copos = null;

  // as refeições: pelo verbo comum ou pela palavra principal do nome do plano
  const achou: Record<string, 1> = {};
  refeicoes.forEach(function (ref) {
    const nome = semAcento(ref.n);
    const casaVerbo = VERBOS.some(function (v) {
      return v[0].test(t) && (nome.indexOf(v[1]) >= 0 || semAcento(ref.id).indexOf(v[1]) === 0);
    });
    const palavra = nome.split(/[^a-z]+/).filter(function (w) { return w.length >= 5; })[0];
    if (casaVerbo || (palavra && new RegExp('\\b' + palavra + '\\b').test(t))) achou[ref.id] = 1;
  });
  r.refeicoes = refeicoes.filter(function (x) { return achou[x.id]; }).map(function (x) { return x.id; });
  return r;
}

/** Nada entendido: a tela diz e não grava. */
export function entendeuAlgo(e: Entendido): boolean {
  return e.refeicoes.length > 0 || e.copos != null || e.peso != null;
}
