// Peso, cintura e as três regras de ajuste da dieta.
//
// O peso do dia não decide nada: oscila com água, sal e intestino. Quem decide
// é a MÉDIA DA SEMANA e o ritmo entre semanas — e é por isso que estas funções
// recebem a série inteira de marcas, nunca uma medida solta.
//
// Recebem dado e devolvem veredito: não leem estado nem tocam em tela. Foi essa
// separação que permitiu testar os limites exatos (0,15 · 0,40 · 1,5 cm) sem
// subir um DOM.

import { fmtDec, fmtDec2, fmtSig2, weekStart } from './formato';
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
}

/** O estado do ±150 kcal que a comida executa. */
export type Ajuste = -1 | 0 | 1;

/**
 * A ponte entre as duas metades do produto.
 *
 * Os dois apps tinham motor de veredito próprio sobre o MESMO peso, com
 * limiares diferentes — 0,15/0,40 aqui, 0,10/0,40 com dois interruptores
 * manuais lá. Ter dois seria ter duas verdades sobre a mesma balança.
 *
 * Agora há um só, e a divisão de trabalho é: aqui se DECIDE, na comida se
 * EXECUTA. `veredito()` diz comer mais, manter ou comer menos; `ajuste`
 * converte isso no ±150 kcal que reescreve as quantidades do plano.
 *
 * "observar" e "faltam" viram 0 de propósito: nenhum dos dois é uma decisão,
 * e mexer na comida sem decisão é o oposto do que o app existe para fazer.
 */
export function ajusteDoVeredito(v: Veredito): Ajuste {
  if (v.k === 'mais') return 1;
  if (v.k === 'menos') return -1;
  return 0;
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

/**
 * As situações do programa. Cintura tem prioridade: subir cintura é o sinal de
 * que o superávit virou gordura, mesmo com o peso comportado.
 *
 * `forcaSubindo` entrou com a fusão e muda UM ramo: peso parado com força
 * subindo não é sinal de comer mais, é recomposição acontecendo. Mandar comer
 * mais nessa hora atropelaria justamente o que estava dando certo. Sem o
 * sinal — que é o padrão — a regra é exatamente a de antes.
 */
export function veredito(
  body: { peso: Marca[]; cintura: Marca[] },
  forcaSubindo: boolean = false
): Veredito {
  const c = cinturaMes(body.cintura);
  if (c && c.mes > 1.5)
    return { k: 'menos', t: 'Comer menos', p: `A média semanal da cintura subiu ${fmtDec(c.delta)} cm em ${Math.round(c.dias)} dias — acima do limite de 1,5 cm no mês.` };

  const r = pesoRitmo(body.peso);
  if (!r.ok)
    return { k: 'faltam', t: 'Faltam dados', p: 'Registre o peso 3 a 4 vezes por semana. A regra só vale sobre a média de pelo menos duas semanas.' };
  if (!r.duasSemanas)
    return { k: 'faltam', t: 'Falta uma semana', p: `Ritmo atual de ${fmtSig2(r.kgSem!)} kg por semana, mas medido sobre ${Math.round(r.dias!)} dias. A regra pede 2 semanas de média.` };
  if (r.kgSem! < 0.15) {
    const mov = r.kgSem! < 0
      ? `A média caiu ${fmtDec2(r.kgSem!)} kg por semana`
      : `A média subiu ${fmtDec2(r.kgSem!)} kg por semana`;
    if (forcaSubindo)
      return { k: 'observar', t: 'Observar', p: `${mov}, mas a força estimada está subindo. Peso parado com carga subindo é recomposição — não mexa na comida ainda.` };
    return { k: 'mais', t: 'Comer mais', p: `${mov} nas últimas 2 semanas — abaixo de 0,15.` };
  }
  if (r.kgSem! > 0.4)
    return { k: 'menos', t: 'Comer menos', p: `A média subiu ${fmtDec2(r.kgSem!)} kg por semana nas últimas 2 semanas — acima de 0,4.` };
  return { k: 'manter', t: 'Manter como está', p: `A média está subindo ${fmtDec2(r.kgSem!)} kg por semana, dentro da faixa de 0,15 a 0,4.` };
}
