// Peso, cintura e as três regras de ajuste da dieta.
//
// O peso do dia não decide nada: oscila com água, sal e intestino. Quem decide
// é a MÉDIA DA SEMANA e o ritmo entre semanas — e é por isso que estas funções
// recebem a série inteira de marcas, nunca uma medida solta.
//
// Recebem dado e devolvem veredito: não leem estado nem tocam em tela. Foi essa
// separação que permitiu testar os limites exatos (0,15 · 0,40 · 1,5 cm) sem
// subir um DOM.

import { fmtDec, fmtDec2, weekStart } from './formato';
import type { Marca } from './tipos';

const DIA = 86400000;

/** Uma semana de marcas, já resumida na média. */
export interface Semana {
  /** segunda-feira 00:00 daquela semana */
  w: number;
  /** quantas medidas entraram na média */
  n: number;
  /** a média */
  v: number;
}

export interface Ritmo {
  W: Semana[];
  ok: boolean;
  last?: Semana;
  ref?: Semana;
  dias?: number;
  /** ganho em kg por semana */
  kgSem?: number;
  /** a base tem pelo menos 12 dias, que é o que a regra pede */
  duasSemanas?: boolean;
}

export interface Cintura {
  W: Semana[];
  last: Semana;
  ref: Semana;
  dias: number;
  delta: number;
  /** variação normalizada para 30 dias */
  mes: number;
}

export interface Veredito {
  k: 'mais' | 'menos' | 'manter' | 'observar' | 'faltam';
  t: string;
  p: string;
  /** o que ainda falta para o passo valer, quando o peso já pediu revisão */
  falta?: 'aderencia' | 'gordura';
}

/** O passo de 150 kcal que um veredito PROPÕE. Não é o estado da dieta. */
export type Ajuste = -1 | 0 | 1;

/**
 * Os sinais que não saem da balança.
 *
 * A regra do nutricionista é multifatorial de propósito: peso sozinho dispara
 * REVISÃO, nunca o corte. Quem não tiver o sinal manda `null` — e o veredito
 * diz o que falta em vez de fingir que decidiu.
 */
export interface Sinais {
  /** e1RM subindo. Já existe no app, vem das cargas registradas. */
  forcaSubindo?: boolean;
  /** dias com registro de comida nos últimos 14; `null` = não medido */
  diasRegistrados?: number | null;
  /** a resposta do fechamento semanal, comparando com 2 semanas atrás */
  gorduraVisual?: 'sim' | 'nao' | 'incerto' | null;
}

/** Acima disto, duas semanas seguidas pedem revisão. */
export const ALTO = 0.40;
/** Abaixo disto, duas semanas seguidas com força parada pedem mais comida. */
export const BAIXO = 0.10;
/** A faixa-alvo consolidada. Alvo de eficiência, não limite de velocidade. */
export const ALVO_MIN = 0.15, ALVO_MAX = 0.30;
/** Uma semana precisa de pelo menos duas pesagens para a média dela valer. */
export const MIN_PESAGENS = 2;
/** Dias registrados em 14 para uma mudança automática ser permitida (~80%). */
export const MIN_REGISTRADOS = 11;

export function ajusteDoVeredito(v: Veredito): Ajuste {
  if (v.k === 'mais') return 1;
  if (v.k === 'menos') return -1;
  return 0;
}

export interface TaxaSemanal {
  /** domingo 00:00 da semana que fechou o intervalo */
  w: number;
  /** ganho em kg NAQUELA semana */
  kg: number;
}

/**
 * As taxas semana a semana — e não uma taxa média sobre duas semanas.
 *
 * Esta é a correção do primeiro erro: "por 2 semanas" é PERSISTÊNCIA, não
 * janela de medição. Uma média de duas semanas deixa `+0,10` seguido de
 * `+0,75` dar 0,425 e disparar corte por causa de uma semana só de água.
 *
 * Devolve `null` quando não dá para afirmar nada: semana com menos de
 * `MIN_PESAGENS` não é média, e buraco entre semanas não é sequência.
 */
export function taxasSemanais(peso: Marca[], quantas: number = 2): TaxaSemanal[] | null {
  const W = mediasSemanais(peso).filter(x => x.n >= MIN_PESAGENS);
  if (W.length < quantas + 1) return null;
  const ult = W.slice(-(quantas + 1));
  for (let i = 1; i < ult.length; i++) {
    // tolerância de 2 h: virada de horário de verão não é buraco de semana
    if (Math.abs(ult[i].w - ult[i - 1].w - 7 * DIA) > 2 * 3600000) return null;
  }
  const out: TaxaSemanal[] = [];
  for (let i = 1; i < ult.length; i++) out.push({ w: ult[i].w, kg: ult[i].v - ult[i - 1].v });
  return out;
}

/**
 * A regra consolidada do nutricionista, em uma função pura.
 *
 * Três mudanças em relação à versão anterior, e todas vieram dele:
 *
 * 1. **Duas semanas CONSECUTIVAS**, não a média de duas. Ver `taxasSemanais`.
 * 2. **Peso sozinho não corta.** `>0,40` por duas semanas abre revisão; o
 *    corte só sai com adesão registrada E gordura visual claramente maior.
 * 3. **Cintura saiu do algoritmo.** Ela tinha prioridade e vetava o peso;
 *    agora é informação complementar, porque medir não está acontecendo e as
 *    fotos cobrem melhor a mesma pergunta. `cinturaMes` continua para a tela.
 *
 * O caso omisso é sempre `observar`: não alterar, continuar olhando. É o que
 * ele pediu em "CASO CONTRÁRIO", e é o que o app já fazia em todo o resto.
 */
export function veredito(
  body: { peso: Marca[]; cintura: Marca[] },
  sinais: Sinais = {}
): Veredito {
  const taxas = taxasSemanais(body.peso, 2);
  if (!taxas)
    return { k: 'faltam', t: 'Faltam dados', p: 'Registre o peso 3 a 4 vezes por semana. A regra pede duas semanas seguidas de média, e média de uma pesagem só não é média.' };

  const [ante, ult] = taxas;
  const reg = sinais.diasRegistrados;
  const aderenciaOk = typeof reg === 'number' ? reg >= MIN_REGISTRADOS : false;
  const semRegistro = typeof reg !== 'number' || reg < MIN_REGISTRADOS;

  // ---------- ganho rápido, duas semanas seguidas ----------
  if (ante.kg > ALTO && ult.kg > ALTO) {
    const mov = `A média subiu ${fmtDec2(ante.kg)} e depois ${fmtDec2(ult.kg)} kg — duas semanas seguidas acima de ${fmtDec(ALTO)}.`;
    if (semRegistro)
      return { k: 'observar', t: 'Registrar antes de mexer', falta: 'aderencia',
               p: `${mov} Mas não há registro suficiente dos últimos 14 dias para saber se o ganho veio da dieta ou de saídas dela. Tirar comida do plano agora puniria os dias em que você seguiu.` };
    if (sinais.gorduraVisual === 'sim')
      return { k: 'menos', t: 'Comer menos', p: `${mov} Com adesão registrada e aumento visual claro de gordura, o passo é −150 kcal.` };
    if (sinais.gorduraVisual === 'nao')
      return { k: 'manter', t: 'Manter como está', p: `${mov} As fotos não mostram piora, então o ganho está comprando músculo. Ganho acima da faixa não é ruim por si.` };
    return { k: 'observar', t: 'Observar', falta: 'gordura',
             p: `${mov} Falta a leitura das fotos contra as de duas semanas atrás. Sem ela o peso pede revisão, não corte.` };
  }

  // ---------- ganho travado, duas semanas seguidas ----------
  if (ante.kg < BAIXO && ult.kg < BAIXO) {
    const mov = `A média ficou em ${fmtDec2(ante.kg)} e ${fmtDec2(ult.kg)} kg por semana — duas seguidas abaixo de ${fmtDec(BAIXO)}.`;
    if (sinais.forcaSubindo)
      return { k: 'observar', t: 'Observar', p: `${mov} Mas a força estimada está subindo: peso parado com carga subindo é recomposição, e mexer na comida atropelaria o que está dando certo.` };
    if (!aderenciaOk)
      return { k: 'observar', t: 'Registrar antes de mexer', falta: 'aderencia',
               p: `${mov} Sem registro suficiente dos últimos 14 dias não dá para saber se a comida prescrita está sendo comida.` };
    return { k: 'mais', t: 'Comer mais', p: `${mov} Com a performance parada e a adesão registrada, o passo é +150 kcal.` };
  }

  // ---------- dentro da faixa, ou em qualquer outro lugar ----------
  if (ult.kg >= ALVO_MIN && ult.kg <= ALVO_MAX)
    return { k: 'manter', t: 'Manter como está', p: `A média está subindo ${fmtDec2(ult.kg)} kg por semana, dentro da faixa-alvo de ${fmtDec(ALVO_MIN)} a ${fmtDec(ALVO_MAX)}.` };

  return { k: 'observar', t: 'Observar', p: `A média está em ${fmtDec2(ult.kg)} kg por semana. Não é motivo para mexer na comida — uma semana isolada fora da faixa é ruído, e a regra pede duas seguidas.` };
}

/** Agrupa marcas por semana e devolve a média de cada uma, em ordem. */
export function mediasSemanais(arr: Marca[]): Semana[] {
  const m: Record<number, number[]> = {};
  arr.forEach(x => { const k = weekStart(x.t); (m[k] = m[k] || []).push(x.v); });
  return Object.keys(m).map(Number).sort((a, b) => a - b).map(k => ({
    w: k, n: m[k].length,
    v: m[k].reduce((a, b) => a + b, 0) / m[k].length
  }));
}

/** Ritmo em kg por semana, medido sobre ~2 semanas de média. */
export function pesoRitmo(peso: Marca[]): Ritmo {
  const W = mediasSemanais(peso);
  if (W.length < 2) return { W, ok: false };
  const last = W[W.length - 1];
  let ref = W[W.length - 2];
  for (let i = W.length - 2; i >= 0; i--) { ref = W[i]; if (last.w - W[i].w >= 12 * DIA) break; }
  const dias = (last.w - ref.w) / DIA;
  return { W, ok: true, last, ref, dias, kgSem: (last.v - ref.v) / (dias / 7), duasSemanas: dias >= 12 };
}

/**
 * Variação da cintura no último mês, normalizada para 30 dias.
 * Usa média semanal como o peso: fita métrica erra de posicionamento mais do
 * que a balança varia de água, e duas medidas soltas disparariam a regra errado.
 */
export function cinturaMes(cintura: Marca[]): Cintura | null {
  const W = mediasSemanais(cintura);
  if (W.length < 2) return null;
  const last = W[W.length - 1];
  let ref = W[W.length - 2];
  for (let i = W.length - 2; i >= 0; i--) { ref = W[i]; if (last.w - W[i].w >= 24 * DIA) break; }
  const dias = (last.w - ref.w) / DIA;
  if (dias < 21) return null;
  return { W, last, ref, dias, delta: last.v - ref.v, mes: (last.v - ref.v) / (dias / 30) };
}
