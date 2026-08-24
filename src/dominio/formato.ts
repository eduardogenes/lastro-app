// Formatação, datas e semana. Tudo puro: entra número ou instante, sai string.
//
// Vive à parte porque é o que mais aparece em teste de regressão de tela — o
// veredito de corpo, o calendário e o resumo de sessão são, em boa medida,
// decisões sobre como formatar. Testar isso não deveria custar um jsdom.

/** Um marcador de período do calendário. */
export interface Periodo { k: string; de: number; ate: number; rot: string; nome: string; }

// ---------- números e volume ----------
export function fmtNum(n: number): string { return n % 1 === 0 ? String(n) : String(Math.round(n*10)/10); }

export function fmtInt(n: number): string { return Math.round(n).toLocaleString('pt-BR'); }

// ---------- corpo ----------
// O peso do dia não decide nada: oscila com água, sal e intestino.
// Quem decide é a MÉDIA DA SEMANA e o ritmo entre semanas.
export function fmtDec(v: number): string { return (Math.round(v*10)/10).toFixed(1).replace('.', ','); }

// arredonda antes de decidir o sinal, senão −0,04 vira "−0,0"
export function fmtSig(v: number): string { const r = Math.round(v*10)/10; return (r>0?'+':r<0?'−':'') + fmtDec(Math.abs(r)); }

// o ritmo é comparado com 0,15 e 0,4 — uma casa só não distingue 0,05 de 0,14
export function fmtDec2(v: number): string { return (Math.round(Math.abs(v)*100)/100).toFixed(2).replace('.', ','); }

export function fmtSig2(v: number): string { const r = Math.round(v*100)/100; return (r>0?'+':r<0?'−':'') + fmtDec2(r); }

// ---------- gráfico (SVG puro) ----------
// Duas faixas empilhadas: carga em cima (âmbar, protagonista) e volume embaixo
// (cinza, secundário). Cada faixa tem escala própria com mínimo e máximo escritos
// no eixo — é o que deixa visível o volume subindo com a carga parada.
export function fmtK(n: number): string {
  n = Math.round(n);
  return n >= 1000 ? String(Math.round(n/100)/10).replace('.', ',') + 'k' : String(n);
}

// Domingo primeiro, igual a `Date#getDay` e à cadência — assim o índice do dia
// da semana é o índice do rótulo, sem conversão no meio.
export const DIAS_CURTOS: string[] = ['dom','seg','ter','qua','qui','sex','sáb'];

export const DIAS_LONGOS: string[] = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];

export const MESES: string[] = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

// Marcador de período no calendário. É a ÚNICA exceção à regra 5 do projeto,
// que proíbe emoji na interface — decisão consciente do Eduardo, registrada no
// README. Não estender para outros lugares sem ele pedir.
export const PERIODOS: Periodo[] = [
  { k:'manha', de:5,  ate:12, rot:'\u{2600}\u{FE0F}', nome:'manhã' },
  { k:'tarde', de:12, ate:18, rot:'\u{1F324}\u{FE0F}', nome:'tarde' },
  { k:'noite', de:18, ate:5,  rot:'\u{1F319}', nome:'noite' }
];

export function periodoDe(t: number): Periodo {
  const h = new Date(t).getHours();
  if (h >= 5 && h < 12) return PERIODOS[0];
  if (h >= 12 && h < 18) return PERIODOS[1];
  return PERIODOS[2];
}

export function fmtHora(t: number): string {
  const d = new Date(t);
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

export function fmtDur(ms: number | null | undefined): string {
  if (ms == null) return '–';
  const m = Math.round(ms/60000);
  if (m < 60) return m + ' min';
  return Math.floor(m/60) + 'h' + String(m%60).padStart(2,'0');
}

export function diaExtenso(t: number): string {
  const d = new Date(t);
  return DIAS_LONGOS[d.getDay()] + ', ' + String(d.getDate()).padStart(2,'0') + ' de ' + MESES[d.getMonth()];
}

export function fmtDate(t: number): string {
  const d = new Date(t);
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
}

// ---------- cardio ----------
// Ele está em superávit. O cardio aqui é saúde cardiovascular, capacidade de
// trabalho e apetite. Nada de caloria, gasto energético, gráfico ou HIIT.
/**
 * O domingo que abre a semana daquele instante.
 *
 * Domingo e não segunda porque é assim que o calendário se lê no Brasil, e o
 * app precisa que a grade da tela e a conta da média digam a mesma coisa — uma
 * semana que COMEÇA no domingo na tela e TERMINA nele no cálculo seria duas
 * semanas diferentes com o mesmo nome.
 *
 * A troca é inofensiva para o histórico dele: os seis dias de treino vão de
 * segunda a sábado, então continuam caindo todos no mesmo balde. O que mudou de
 * lugar foi o domingo de descanso, que não carrega série nenhuma.
 */
export function weekStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay());   // domingo
  return d.getTime();
}

export function sameDay(a: number, b: number): boolean {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear()===y.getFullYear() && x.getMonth()===y.getMonth() && x.getDate()===y.getDate();
}

export function fmtDesc(sec: number): string {
  if (sec % 60 === 0) return (sec / 60) + 'min';
  return sec >= 60 ? Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2) : sec + 's';
}

export function escapeHTML(s: unknown): string { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

export function escAttr(s: unknown): string { return String(s).replace(/'/g,"\\'").replace(/"/g,'&quot;'); }