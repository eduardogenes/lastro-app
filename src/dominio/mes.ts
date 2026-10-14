// AS LEITURAS DO MÊS, em Dias — e só estas três (a D, `dias.html`, estado 1).
//
// Dias responde "o que aconteceu em cada dia". Do mês, ele lê três coisas, cada
// uma com a conta à vista: quantos dias com treino por semana, o cardio e o
// horário de início. O resto — volume, séries por músculo, força — é leitura de
// Semana, e repetir aqui seria dois lugares para o mesmo número.

const DIA = 86400000;

/** O que estas leituras precisam saber de uma sessão registrada. */
export interface SessaoDoMes {
  t: number;
  day?: string;
  /** treino fora da prescrição (F155) */
  livre?: number | boolean;
}

/** A meia-noite local daquele instante. */
export function inicioDoDia(t: number): number {
  const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime();
}

/** A chave de um dia local, para contar DIAS e não sessões. */
function chaveDoDia(t: number): number { return inicioDoDia(t); }

/**
 * Dias com treino nos `dias` dias que terminam em `ate` (o dia de `ate` incluso).
 *
 * A unidade é o DIA, e é decisão do desenho com razão escrita: a prescrição
 * fala em "seis dias ativos" (F21), e contar sessões faria dois treinos no
 * mesmo dia — o caso comum de abrir um treino por engano e depois o certo
 * (F35, F157) — inflarem a conta. Aula conta (é o sexto treino); treino fora
 * da prescrição conta (é presença). Descanso não conta.
 */
export function diasComTreino(done: SessaoDoMes[], ate: number, dias: number = 28): number {
  const fim = inicioDoDia(ate);
  const ini = fim - (dias - 1) * DIA;
  const vistos: Record<number, 1> = {};
  done.forEach(s => { const k = chaveDoDia(s.t); if (k >= ini && k <= fim) vistos[k] = 1; });
  return Object.keys(vistos).length;
}

/**
 * Dias com treino por semana, em média móvel de quatro semanas — nunca
 * sequência de dias: quem treina 5 a 6 vezes por semana quebra sequência todo
 * domingo (F22), e o número puniria o descanso que o próprio programa manda.
 */
export function mediaMovel(done: SessaoDoMes[], ate: number): { dias: number; porSemana: number } {
  const dias = diasComTreino(done, ate, 28);
  return { dias, porSemana: dias / 4 };
}

/**
 * A leitura dos dias com treino, com a média só quando ela existe.
 *
 * A média usa as últimas quatro semanas; até completar quatro desde o primeiro
 * treino, a conta vem SEM média — "3 dias com treino em 9" —, porque dividir
 * nove dias por quatro semanas diria que ele treinou menos do que treinou (o
 * vazio da D, `dias.html` estado 15). Sem treino nenhum, `null`: nenhuma
 * leitura vira zero.
 */
export function leituraDosDias(done: SessaoDoMes[], ate: number):
  { dias: number; janela: number; porSemana: number | null } | null {
  const ate0 = inicioDoDia(ate);
  const antes = done.filter(s => inicioDoDia(s.t) <= ate0);
  if (!antes.length) return null;
  const primeiro = Math.min.apply(null, antes.map(s => inicioDoDia(s.t)));
  const desde = Math.round((ate0 - primeiro) / DIA) + 1;
  if (desde < 28) return { dias: diasComTreino(done, ate, desde), janela: desde, porSemana: null };
  const m = mediaMovel(done, ate);
  return { dias: m.dias, janela: 28, porSemana: m.porSemana };
}

/** A média móvel dia a dia, de `de` até `ate` — a linha do desenho. */
export function serieDaMediaMovel(done: SessaoDoMes[], de: number, ate: number): number[] {
  const out: number[] = [];
  for (let t = inicioDoDia(de); t <= inicioDoDia(ate); t += DIA) out.push(mediaMovel(done, t).porSemana);
  return out;
}

/**
 * O horário do meio, em minutos (decisão do dono, 14/10: mediana, não média).
 * A média de outubro deu 7h56, uma hora em que ele nunca começou — os treinos
 * à tarde a puxavam; a mediana é o início típico. Com número par de inícios, o
 * meio entre os dois do centro. `null` sem início.
 */
export function medianaDosInicios(inicios: Inicio[]): number | null {
  const m = inicios.map(x => x.min).sort((a, b) => a - b);
  if (!m.length) return null;
  const k = Math.floor(m.length / 2);
  return m.length % 2 ? m[k] : (m[k - 1] + m[k]) / 2;
}

/** Um início de treino no mês, em minutos desde a meia-noite. */
export interface Inicio { t: number; min: number }

/**
 * Os inícios de treino do período, e o que ficou de fora com o motivo.
 *
 * Só entra sessão com hora MEDIDA: um treino de data passada sem hora não tem
 * horário, e o 07:00 inventado já sujou esta média uma vez (F270). Aula sem hora
 * de início e treino fora da prescrição ficam fora, e a tela diz quantos.
 */
export function iniciosDoPeriodo(
  done: SessaoDoMes[], de: number, ate: number,
  temHora: (s: SessaoDoMes) => boolean, ehAula: (s: SessaoDoMes) => boolean
): { inicios: Inicio[]; aulasSemHora: number; semHora: number; fora: number } {
  const r = { inicios: [] as Inicio[], aulasSemHora: 0, semHora: 0, fora: 0 };
  done.filter(s => s.t >= de && s.t <= ate).forEach(s => {
    if (s.livre) { r.fora++; return; }
    if (!temHora(s)) { if (ehAula(s)) r.aulasSemHora++; else r.semHora++; return; }
    const d = new Date(s.t);
    r.inicios.push({ t: s.t, min: d.getHours() * 60 + d.getMinutes() });
  });
  r.inicios.sort((a, b) => a.min - b.min);
  return r;
}
