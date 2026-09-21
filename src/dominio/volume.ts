// Séries por músculo: o alvo do treinador, o que o programa prescreve hoje e o
// que foi de fato registrado.
//
// A contagem é de SÉRIES DIRETAS. Tríceps também trabalha nos supinos, bíceps
// nas puxadas, glúteo no terra e no leg press — apresentar série direta como
// estímulo total foi a falha metodológica que o treinador apontou, e a
// interface diz isso em voz alta.
//
// Nada aqui lê estado: quem chama entrega os treinos já resolvidos e uma função
// que diz a que músculo um id pertence. É o que permite testar o alvo, o
// impacto e a atribuição por exercício sem subir o app.

import { weekStart } from './formato';
import type { Dia, IdEx, Log, Treino } from './tipos';

/** Um exercício, na medida em que o volume se importa com ele. */
interface ComGrupoESeries { g: string; s: number; }

/**
 * Alvo por músculo, calculado do programa — nunca transcrito. Transcrever
 * seria criar uma segunda fonte de verdade que sai de sincronia na primeira
 * vez que o programa mudar.
 *
 * Exercício sem grupo declarado fica de fora, pela mesma razão que ele fica de
 * fora de `seriesPorMusculo`: não há músculo a que atribuir. É o que mantém as
 * estações do HYROX — corrida, sled, wall balls — sendo sessão de verdade na
 * rotação sem virar "séries de quadríceps" no painel de volume.
 */
export function alvoDoPrograma(
  programa: Record<Dia, Treino<ComGrupoESeries>>,
  rotacao: Dia[]
): Record<string, number> {
  const a: Record<string, number> = {};
  rotacao.forEach(function (d) {
    programa[d].ex.forEach(function (ex) {
      if (!ex.g) return;
      a[ex.g] = (a[ex.g] || 0) + ex.s;
    });
  });
  return a;
}

/** Séries diretas de um músculo somadas ao longo de uma lista de treinos. */
export function seriesDeGrupo(treinos: Array<Treino<ComGrupoESeries> | null>, g: string): number {
  let n = 0;
  treinos.forEach(function (t) {
    if (t) t.ex.forEach(function (ex) { if (ex.g === g) n += ex.s; });
  });
  return n;
}

export interface Impacto { txt: string; acima: 0 | 1; }

/** Como o número atual se lê contra o que o treinador prescreveu. */
export function impacto(g: string, agora: number, alvo: number | undefined): Impacto {
  if (alvo == null) return { txt: g + ': ' + agora + ' séries na rotação', acima: 0 };
  if (agora === alvo) return { txt: g + ': ' + agora + ' na rotação · igual ao treinador', acima: 0 };
  return {
    txt: g + ': ' + agora + ' na rotação · o treinador prescreveu ' + alvo,
    acima: agora > alvo ? 1 : 0
  };
}

/**
 * Séries efetivamente REGISTRADAS por músculo num período. Mede adesão ao
 * programa que já existe; não propõe dose nenhuma.
 *
 * O músculo vem do exercício registrado, não da posição onde ele estava
 * prescrito: trocar elevação lateral por um aparelho de peito conta em peito,
 * que é onde o trabalho aconteceu. É o que faz substituto, exercício adicionado
 * no dia e equipamento cadastrado por ele contarem no lugar certo.
 *
 * `corte` limita as semanas passadas ao mesmo ponto da semana em que estamos.
 * Sem isso, numa terça-feira o painel inteiro apareceria despencando contra
 * semanas cheias, e o número não significaria nada.
 */
export function seriesPorMusculo(
  logs: Record<IdEx, Log[]>,
  grupoDe: (k: IdEx) => string,
  de: number,
  ate: number,
  corte?: number | null
): Record<string, number> {
  const acc: Record<string, number> = {};
  Object.keys(logs).forEach(function (k) {
    const g = grupoDe(k);
    if (!g) return;
    (logs[k] || []).forEach(function (e) {
      if (e.t < de || e.t >= ate) return;
      if (corte != null && (e.t - weekStart(e.t)) > corte) return;
      acc[g] = (acc[g] || 0) + e.sets.filter(Boolean).length;
    });
  });
  return acc;
}

// ---------- a leitura da semana ----------
//
// O painel mostra número por músculo, uma linha de cada vez, e nunca lê as
// linhas em conjunto. O dado para responder "a semana priorizou o que devia?"
// já estava todo lá — em linhas separadas, e ninguém cruzava.
//
// **Descreve, nunca recomenda.** A regra 6 do produto é "não inventar conselho
// de treino", e ela continua inteira: dizer que o peito levou 12 séries e o
// peito superior 6 é relatar o que aconteceu. O que fazer com isso é decisão
// do treinador, e a frase existe para ele ser levado à conversa — não para o
// app ocupar o lugar dele.

/** Uma observação factual sobre a semana. */
export interface Leitura {
  txt: string;
  /** o que a produziu; a tela e o teste leem daqui */
  k: 'inversao' | 'abaixo';
}

interface LinhaDeVolume { g: string; n: number; media: number | null }

/** A hierarquia do programa, entregue por quem a conhece. */
export interface Hierarquia {
  /** posição na hierarquia; menor é mais prioritário */
  ordem: (g: string) => number;
  /** a região a que o músculo pertence */
  regiao: (g: string) => string;
  /** está entre os que o programa manda priorizar em VOLUME */
  priorizado: (g: string) => boolean;
}

/**
 * O que a semana diz quando as linhas são lidas juntas.
 *
 * Duas observações, e nenhuma delas opina:
 *
 * **Inversão** — dentro de uma REGIÃO, um músculo menos prioritário levou mais
 * séries do que um mais prioritário. É o caso que ele descreveu: peito
 * superior contra peito, posterior contra quadríceps. Cruzar regiões dava a
 * frase errada — "peito levou 8 séries e delt lateral, 0" tem a maior
 * diferença do painel e não diz nada, porque são dias diferentes do programa e
 * um não tira volume do outro. Reporta só a mais gritante: três frases dizendo
 * a mesma coisa viram ruído e ninguém lê a terceira.
 *
 * **Abaixo da própria média** — quantos dos priorizados ficaram abaixo do que
 * eles mesmos vinham recebendo. Contagem, nunca percentual: um número contra
 * 100% implícito funciona como nota, e é a mesma razão pela qual a aderência
 * da comida se conta em dias.
 *
 * **O que estas frases NÃO dizem**, e o treinador foi explícito: prioridade
 * não significa obrigatoriamente mais séries brutas toda semana. Ela também se
 * expressa em seleção de exercício, posição no treino, frequência, qualidade
 * da série e estímulo indireto. Por isso a inversão é apresentada como desvio
 * para olhar, e nunca como erro — o texto diz o nível do músculo e para por
 * aí, sem concluir que a semana foi mal executada.
 */
export function leituraDaSemana(
  linhas: LinhaDeVolume[],
  hier: Hierarquia,
  semanas: number
): Leitura[] {
  const out: Leitura[] = [];
  if (!linhas || !linhas.length) return out;

  // a inversão mais gritante, dentro de uma região
  let pior: { alto: LinhaDeVolume; baixo: LinhaDeVolume; gap: number } | null = null;
  linhas.forEach(function (alto) {
    linhas.forEach(function (baixo) {
      if (hier.regiao(alto.g) !== hier.regiao(baixo.g)) return;
      if (hier.ordem(alto.g) >= hier.ordem(baixo.g)) return;
      const gap = baixo.n - alto.n;
      if (gap > 0 && (!pior || gap > pior.gap)) pior = { alto: alto, baixo: baixo, gap: gap };
    });
  });
  if (pior) {
    const x = pior as { alto: LinhaDeVolume; baixo: LinhaDeVolume; gap: number };
    out.push({
      k: 'inversao',
      txt: x.baixo.g + ' levou ' + x.baixo.n + (x.baixo.n === 1 ? ' série' : ' séries')
         + ' nesta semana, e ' + x.alto.g + ', ' + x.alto.n + ' — '
         + x.alto.g + ' vem antes na hierarquia do programa.'
    });
  }

  // priorizados abaixo da média que eles mesmos vinham recebendo
  const priorizados = linhas.filter(function (l) {
    return hier.priorizado(l.g) && l.media != null;
  });
  const abaixo = priorizados.filter(function (l) { return l.n < (l.media as number); });
  if (abaixo.length) {
    out.push({
      k: 'abaixo',
      txt: abaixo.length + ' dos ' + priorizados.length + ' músculos priorizados ficaram abaixo da '
         + 'própria média de ' + semanas + (semanas === 1 ? ' semana' : ' semanas') + ': '
         + abaixo.map(function (l) { return l.g; }).join(', ') + '.'
    });
  }

  return out;
}
