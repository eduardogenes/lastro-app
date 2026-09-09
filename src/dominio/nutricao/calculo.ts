// O que a nutrição deriva. Nada aqui é digitado duas vezes.
//
// Lei 5 do sistema: nada derivável é digitado. Os totais do dia saem da
// biblioteca × as quantidades; a lista de compras sai do plano × a previsão da
// semana; o alvo calórico sai do plano, não de um número escrito à parte. Onde
// um número é derivado, quem mostra tem que dizer de onde veio.

import type {
  Alimento, DiaComida, DiaComidaHist, Item, LinhaCompra, Quando, Refeicao, Totais, Turno
} from './tipos';

export const VAZIO: Totais = { kcal: 0, p: 0, c: 0, g: 0 };

/** Soma dois totais. */
export function somaTotais(a: Totais, b: Totais): Totais {
  return { kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, g: a.g + b.g };
}

/** O que um item soma, dado o catálogo e uma escala de porção. */
export function totalDoItem(
  item: Item,
  catalogo: Record<string, Alimento>,
  escala: number = 1
): Totais {
  const a = catalogo[item.f];
  if (!a) return VAZIO;
  const f = (item.q * escala) / 100;
  return { kcal: a.kcal * f, p: a.p * f, c: a.c * f, g: a.g * f };
}

/** Um item entra hoje? `alta` só aparece em dia de alta demanda. */
export function itemEntra(item: Item, alta: boolean): boolean {
  return !item.alta || alta;
}

/** Uma refeição entra hoje? */
export function refeicaoEntra(r: Refeicao, treino: boolean, alta: boolean): boolean {
  if (r.quando === 'sempre') return true;
  if (r.quando === 'treino') return treino;
  return alta;
}

/** O que uma refeição soma hoje. */
export function totalDaRefeicao(
  r: Refeicao,
  catalogo: Record<string, Alimento>,
  alta: boolean,
  escala: number = 1
): Totais {
  return r.itens
    .filter(i => itemEntra(i, alta))
    .reduce((acc, i) => somaTotais(acc, totalDoItem(i, catalogo, escala)), VAZIO);
}

/** O que o dia inteiro soma, com as condições e as escalas de hoje aplicadas. */
export function totalDoDia(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  treino: boolean,
  alta: boolean,
  escala: Record<string, number> = {}
): Totais {
  return plano
    .filter(r => refeicaoEntra(r, treino, alta))
    .reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, escala[r.id] ?? 1)), VAZIO);
}

/** O que já foi comido: só as refeições marcadas. */
export function totalRegistrado(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  dia: DiaComida,
  treino: boolean,
  alta: boolean
): Totais {
  return plano
    .filter(r => refeicaoEntra(r, treino, alta) && dia.done[r.id])
    .reduce((acc, r) => somaTotais(acc, totalDaRefeicao(r, catalogo, alta, dia.escala[r.id] ?? 1)), VAZIO);
}

/** Minutos desde a meia-noite, para ordenar a timeline. */
export function minutosDe(hhmm: string): number {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 'HH:MM' a partir de minutos desde a meia-noite, dando a volta no dia. */
export function horaDe(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

/**
 * O deslocamento do turno, em minutos.
 *
 * É a diferença entre a hora do turno escolhido e a hora que o PLANO dá ao
 * treino — não uma constante. Assim, mexer no horário do treino dentro do
 * plano continua valendo, e `manha` é sempre zero: o dia como está escrito.
 */
export function deslocamentoDoTurno(plano: Refeicao[], turno?: Turno | null): number {
  if (!turno || turno === 'manha') return 0;
  const alvo = turno === 'tarde' ? 12 * 60 + 15 : 18 * 60 + 15;
  const treino = plano.filter(r => r.id === 'treino')[0];
  if (!treino) return 0;
  return alvo - minutosDe(treino.t);
}

/**
 * As refeições de hoje, em ordem de relógio, já no turno escolhido.
 *
 * **Só o que é do treino anda.** `quando: 'treino'` já marcava exatamente as
 * duas refeições que existem por causa da sessão — o pré e o intra —, e são
 * elas que deslizam junto, mantendo o intervalo que o plano lhes deu. Café,
 * almoço, lanche e jantar são âncoras do RELÓGIO e ficam onde estão: deslocar
 * o dia inteiro em bloco poria o café da manhã às 14h.
 *
 * O plano nunca é tocado — sai uma cópia. Editar é permanente, ajustar é de
 * hoje.
 */
export function refeicoesDeHoje(
  plano: Refeicao[],
  treino: boolean,
  alta: boolean,
  turno?: Turno | null
): Refeicao[] {
  const d = deslocamentoDoTurno(plano, turno);
  return plano
    .filter(r => refeicaoEntra(r, treino, alta))
    .map(r => (d && r.quando === 'treino') ? { ...r, t: horaDe(minutosDe(r.t) + d) } : r)
    .sort((a, b) => minutosDe(a.t) - minutosDe(b.t));
}

/**
 * Qual refeição carrega o papel de PÓS-TREINO hoje.
 *
 * "Pós-treino" nunca foi uma refeição neste plano — é um papel que uma
 * refeição de relógio acumula, e o nome composto que o nutricionista deu
 * ("Café da manhã / pós-treino") era a prova disso. O papel gruda na primeira
 * refeição de relógio depois da sessão: de manhã é o café, à tarde o almoço, à
 * noite o jantar.
 *
 * Calculado, nunca gravado. Fundir ou criar refeição para acomodar o papel
 * seria inventar uma sétima refeição, e o app executa a prescrição.
 */
export function posTreinoDe(refs: Refeicao[], treinando: boolean): string | null {
  if (!treinando) return null;
  const t = refs.filter(r => r.id === 'treino')[0];
  if (!t) return null;
  const dep = refs.filter(r => r.quando !== 'treino' && minutosDe(r.t) > minutosDe(t.t));
  return dep.length ? dep[0].id : null;
}

/**
 * Refeição de relógio que caiu DENTRO da sessão.
 *
 * Com treino às 12h15 e almoço às 12h30 no plano, o almoço acontece durante o
 * treino. O app aponta e para por aí: mover a refeição para um horário que
 * ninguém prescreveu seria prescrever, e fundir duas seria pior. Quem decide é
 * ele, editando o plano ou ignorando.
 *
 * 60 minutos é piso de detecção, não duração prescrita: é o mínimo que uma
 * sessão de musculação ocupa, e usar mais acusaria conflito onde não há.
 */
export const PISO_DA_SESSAO = 60;

export function conflitosDeTurno(refs: Refeicao[], treinando: boolean): string[] {
  if (!treinando) return [];
  const t = refs.filter(r => r.id === 'treino')[0];
  if (!t) return [];
  const ini = minutosDe(t.t);
  return refs
    .filter(r => r.quando !== 'treino')
    .filter(r => minutosDe(r.t) > ini && minutosDe(r.t) < ini + PISO_DA_SESSAO)
    .map(r => r.id);
}

/** Resumo de uma linha: "120 g banana · 15 g mel · 200 ml café". */
export function resumoDaRefeicao(
  r: Refeicao,
  catalogo: Record<string, Alimento>,
  alta: boolean,
  escala: number = 1
): string {
  return r.itens
    .filter(i => itemEntra(i, alta))
    .map(i => {
      const a = catalogo[i.f];
      if (!a) return null;
      return Math.round(i.q * escala) + ' ' + a.u + ' ' + a.n.toLowerCase();
    })
    .filter(Boolean)
    .join(' · ');
}

/**
 * O ajuste calórico, aplicado onde o plano manda aplicar: no arroz.
 *
 * ±150 kcal em arroz cozido a 128 kcal/100 g dão ~117 g. Arredondado para 15 g,
 * que é a menor colherada que dá para medir sem balança de precisão às 12h30
 * no trabalho — precisão maior que a da execução é falsa precisão.
 */
export const PASSO_ARROZ = 120;

/** Quanto o arroz muda para um dado ajuste. */
export function arrozDoAjuste(base: number, ajuste: -1 | 0 | 1): number {
  return Math.max(0, Math.round((base + ajuste * PASSO_ARROZ) / 15) * 15);
}

/**
 * A lista de compras — derivada, nunca guardada.
 *
 * Soma cada refeição pelas vezes que ela aparece no horizonte, e converte
 * pronto → cru onde há fator. Cada linha convertida carrega a procedência,
 * porque "1,3 kg" sem dizer que veio de "1 kg pronto" é um número que ninguém
 * consegue conferir no açougue.
 */
export function listaDeCompras(
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  previsao: { treino: number; descanso: number },
  diasAlta: number = 0
): LinhaCompra[] {
  const total = previsao.treino + previsao.descanso;
  const acc: Record<string, number> = {};

  plano.forEach(r => {
    // quantas vezes esta refeição acontece no horizonte
    const vezes = r.quando === 'sempre' ? total
      : r.quando === 'treino' ? previsao.treino
      : diasAlta;
    if (!vezes) return;
    r.itens.forEach(i => {
      const vezesItem = i.alta ? diasAlta : vezes;
      if (!vezesItem) return;
      acc[i.f] = (acc[i.f] || 0) + i.q * vezesItem;
    });
  });

  return Object.keys(acc)
    .map(f => {
      const a = catalogo[f];
      if (!a) return null;
      const pronto = acc[f];
      const comprar = a.cru > 0 ? pronto * a.cru : pronto;
      return {
        f, n: a.n, cat: a.cat, u: a.u,
        pronto: Math.round(pronto),
        comprar: Math.round(comprar),
        procedencia: a.cru > 0 ? `cru · ${fmtKg(pronto, a.u)} prontos` : null
      } as LinhaCompra;
    })
    .filter((x): x is LinhaCompra => x !== null)
    .sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'));
}

/** Quantidade grande vira kg/l: "3,4 kg" lê melhor que "3400 g" na gôndola. */
export function fmtKg(v: number, u: 'g' | 'ml'): string {
  if (v >= 1000) {
    return (Math.round(v / 100) / 10).toFixed(1).replace('.', ',') + (u === 'g' ? ' kg' : ' l');
  }
  return Math.round(v) + ' ' + u;
}


// ---------- o dia que já passou ----------
//
// O dia corrente era sobrescrito na virada da data. Guardá-lo é o que fecha o
// laço monitorar → comparar → ajustar: sem histórico, cada dia zera e a etapa
// de comparar não existe.

/**
 * Fecha o dia corrente num registro histórico.
 *
 * Os totais são CONGELADOS aqui, contra o plano vigente, e carregam o carimbo
 * dele. É o único jeito de o passado continuar verdadeiro quando o plano muda:
 * derivar depois leria o plano de HOJE e responderia "quanto isso custaria
 * agora" fingindo responder "quanto custou naquele dia".
 */
export function fechaDia(
  dia: DiaComida,
  plano: Refeicao[],
  catalogo: Record<string, Alimento>,
  pv: number,
  ajuste: -1 | 0 | 1,
  agora: number = Date.now()
): DiaComidaHist {
  const treinando = dia.cadencia === 'treino';
  const alta = !!dia.alta;
  const done: Record<string, number> = {};
  Object.keys(dia.done || {}).forEach(function (k) { done[k] = agora; });
  const h: DiaComidaHist = {
    d: dia.data,
    done: done,
    agua: dia.agua || 0,
    escala: Object.assign({}, dia.escala || {}),
    tot: totalRegistrado(plano, catalogo, dia, treinando, alta),
    pv: pv,
    m: agora
  };
  if (dia.cadencia) h.cadencia = dia.cadencia;
  if (dia.alta) h.alta = 1;
  if (dia.turno) h.turno = dia.turno;
  if (ajuste) h.aj = ajuste;
  return h;
}

/**
 * A aderência de um dia: quanto do prescrito foi de fato cumprido.
 *
 * PONDERADA pela escala, e não a contagem crua de refeições marcadas. "Marcou
 * feito com escala 0,5" e "comeu tudo" não são a mesma coisa, e o app já tem
 * esse dado — descartá-lo na hora de medir seria jogar fora justamente o mais
 * informativo.
 *
 * `null` quando NADA foi marcado. Ausência de registro não é aderência zero:
 * ele pode ter comido perfeitamente e só não ter aberto o app, e tratar o
 * silêncio como falha é erro de medição — engana o próprio usuário sobre o que
 * aconteceu.
 */
export function aderenciaDoDia(h: DiaComidaHist, refs: Refeicao[]): number | null {
  const ids = Object.keys(h.done || {});
  if (!ids.length || !refs.length) return null;
  const noDia: Record<string, 1> = {};
  refs.forEach(function (r) { noDia[r.id] = 1; });
  let soma = 0;
  ids.forEach(function (id) {
    if (!noDia[id]) return;                       // refeição que não existe mais
    const e = h.escala && h.escala[id];
    soma += (typeof e === 'number' && e >= 0) ? e : 1;
  });
  return soma / refs.length;
}

/** Quantas vezes cada refeição foi cumprida, no período. */
export interface PadraoDeRefeicao {
  id: string;
  /** dias em que foi marcada */
  feitas: number;
  /** dias em que ela existia no dia (denominador honesto) */
  possiveis: number;
}

/**
 * O padrão por refeição — qual delas falha mais.
 *
 * Devolve CONTAGEM, nunca percentual. Um número único comparado contra 100%
 * implícito funciona como nota, e feedback que dirige a atenção para a
 * autoavaliação é o tipo que a literatura mostra piorar o desempenho em cerca
 * de um terço dos casos. "Feito em 14 de 20 dias" e "70% de aderência" são
 * matematicamente iguais e psicologicamente opostos.
 */
export function padraoPorRefeicao(
  hist: DiaComidaHist[],
  plano: Refeicao[]
): PadraoDeRefeicao[] {
  const por: Record<string, PadraoDeRefeicao> = {};
  plano.forEach(function (r) { por[r.id] = { id: r.id, feitas: 0, possiveis: 0 }; });
  hist.forEach(function (h) {
    const refs = refeicoesDeHoje(plano, h.cadencia === 'treino', !!h.alta, h.turno);
    // dia sem registro nenhum não entra no denominador: silêncio não é falha
    if (!Object.keys(h.done || {}).length) return;
    refs.forEach(function (r) {
      if (!por[r.id]) por[r.id] = { id: r.id, feitas: 0, possiveis: 0 };
      por[r.id].possiveis++;
      if (h.done[r.id]) por[r.id].feitas++;
    });
  });
  return plano.map(function (r) { return por[r.id]; }).filter(Boolean);
}

/** Os dias do histórico dentro de uma janela, do mais antigo ao mais novo. */
export function janelaDoHistorico(
  hist: DiaComidaHist[],
  dias: number,
  hojeISO: string
): DiaComidaHist[] {
  const corte = new Date(hojeISO + 'T00:00:00');
  corte.setDate(corte.getDate() - dias);
  const limite = corte.toISOString().slice(0, 10);
  return hist.filter(function (h) { return h.d > limite; })
             .slice()
             .sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
}

/**
 * Aderência por semana, no mesmo formato de `serieSemanal` do corpo.
 *
 * SUAVIZADA de propósito, e só assim ela pode aparecer ao lado do peso: o
 * ganho que se quer enxergar é de 200 a 400 g por semana, e a flutuação de
 * água de um dia para o outro passa de 1 kg. Comparar dia com dia seria
 * comparar ruído com ruído.
 *
 * `null` na semana sem registro nenhum — buraco é buraco, não é zero.
 */
export function aderenciaPorSemana(
  hist: DiaComidaHist[],
  plano: Refeicao[],
  semanas: number,
  agora: number = Date.now()
): Array<number | null> {
  const DIA = 86400000;
  const out: Array<number | null> = [];
  const dom = new Date(agora);
  dom.setHours(0, 0, 0, 0);
  dom.setDate(dom.getDate() - dom.getDay());
  const base = dom.getTime();

  for (let i = semanas - 1; i >= 0; i--) {
    const ini = base - i * 7 * DIA, fim = ini + 7 * DIA;
    const dias = hist.filter(function (h) {
      const t = new Date(h.d + 'T12:00:00').getTime();
      return t >= ini && t < fim;
    });
    const vals: number[] = [];
    dias.forEach(function (h) {
      const refs = refeicoesDeHoje(plano, h.cadencia === 'treino', !!h.alta, h.turno);
      const a = aderenciaDoDia(h, refs);
      if (a != null) vals.push(a);
    });
    out.push(vals.length ? Math.round(vals.reduce(function (x, y) { return x + y; }, 0) / vals.length * 100) : null);
  }
  return out;
}

/** Quantos dias daquela refeição foram cumpridos numa janela. */
export function contagemDaRefeicao(
  hist: DiaComidaHist[],
  plano: Refeicao[],
  refId: string,
  dias: number,
  hojeISO: string
): { feitas: number; possiveis: number } {
  const janela = janelaDoHistorico(hist, dias, hojeISO);
  let feitas = 0, possiveis = 0;
  janela.forEach(function (h) {
    if (!Object.keys(h.done || {}).length) return;      // silêncio não é falha
    const refs = refeicoesDeHoje(plano, h.cadencia === 'treino', !!h.alta, h.turno);
    if (!refs.some(function (r) { return r.id === refId; })) return;
    possiveis++;
    if (h.done[refId]) feitas++;
  });
  return { feitas: feitas, possiveis: possiveis };
}

/** Aderência agrupada por um recorte do dia (semana, turno, treino/descanso). */
export interface Recorte { k: string; feitos: number; dias: number }

export function recorteDoHistorico(
  hist: DiaComidaHist[],
  plano: Refeicao[],
  chave: (h: DiaComidaHist) => string | null
): Recorte[] {
  const por: Record<string, Recorte> = {};
  const ordem: string[] = [];
  hist.forEach(function (h) {
    const refs = refeicoesDeHoje(plano, h.cadencia === 'treino', !!h.alta, h.turno);
    const a = aderenciaDoDia(h, refs);
    if (a == null) return;                              // dia mudo fica fora
    const k = chave(h);
    if (k == null) return;
    if (!por[k]) { por[k] = { k: k, feitos: 0, dias: 0 }; ordem.push(k); }
    por[k].dias++;
    // "dia cumprido" é o dia em que TODAS as refeições foram marcadas. É um
    // limiar cru de propósito: contagem de dias inteiros se lê sem esforço, e
    // uma média de fração viraria a nota que a devolutiva não pode ser.
    if (a >= 0.999) por[k].feitos++;
  });
  return ordem.map(function (k) { return por[k]; });
}

/**
 * A auditoria da régua calórica: ela disparou sobre semanas bem executadas?
 *
 * É a única devolutiva que os três especialistas consideraram inequivocamente
 * segura, e o motivo é que ela **não julga o usuário** — aponta um limite do
 * próprio sistema. O sinal de força que move o ajuste sai das cargas; se as
 * semanas em que ele mudou foram semanas de aderência baixa, o sinal pode
 * estar lendo adesão ruim como resposta metabólica.
 */
export interface TrocaDeAjuste { d: string; de: number; para: number; aderencia: number | null }

export function trocasDeAjuste(
  hist: DiaComidaHist[],
  plano: Refeicao[]
): TrocaDeAjuste[] {
  const dias = hist.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  const out: TrocaDeAjuste[] = [];
  for (let i = 1; i < dias.length; i++) {
    const de = dias[i - 1].aj || 0, para = dias[i].aj || 0;
    if (de === para) continue;
    // a aderência da semana ANTERIOR à troca: é sobre ela que a régua decidiu
    const ini = Math.max(0, i - 7);
    const vals: number[] = [];
    for (let j = ini; j < i; j++) {
      const refs = refeicoesDeHoje(plano, dias[j].cadencia === 'treino', !!dias[j].alta, dias[j].turno);
      const a = aderenciaDoDia(dias[j], refs);
      if (a != null) vals.push(a);
    }
    out.push({
      d: dias[i].d, de: de, para: para,
      aderencia: vals.length ? vals.reduce(function (x, y) { return x + y; }, 0) / vals.length : null
    });
  }
  return out;
}
