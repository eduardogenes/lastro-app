// O cartão de cima: a regra que escolhe a próxima coisa a fazer.
//
// O Agora responde "e agora?" com UM cartão. Qual cartão é a regra desta
// função, escrita inteira na seção 5 de `docs/redesign/09-frente1-sessao.md`,
// com as colisões resolvidas uma a uma e com a decisão do dono (D4) de que o
// treino ganha da refeição.
//
// Nada aqui lê estado nem relógio: quem chama entrega os fatos do dia já
// resolvidos — a sessão, a janela do treino, as refeições com a hora do plano e
// a marca de hoje, e quantos minutos são agora. É o que permite exercitar as
// sete regras e cada colisão sem subir o app, e é a mesma convenção de
// `dominio/volume.ts`.
//
// ---- O que NÃO está aqui, de propósito ----
//
// **O aviso de que nada vai ficar** (aparelho sem armazenamento) fica ACIMA do
// cartão e não disputa o topo: não é uma ação, é a condição de validade de
// todas as outras (§5.0). Quem desenha a tela resolve isso; a regra não.
//
// **O vencimento da mudança do dia** é aviso, não cartão (§5.6). Pesagem,
// sessão de fotos e cardio também não disputam: são linhas, cada uma com o seu
// dia previsto, e nenhuma é "a próxima coisa a fazer" no sentido que o cartão
// responde (§5.5).

/** A sessão aberta, como o topo a vê. */
export interface SessaoNoTopo {
  dia: string;
  guardadas: number;
  prescritas: number;
  /**
   * Parada há 1h30 ou mais. A faixa VIRA a pergunta e mantém o topo — já é
   * assim em `CTX.faixaDaSessao`, que devolve a pergunta antes de tudo.
   */
  esquecida: boolean;
}

/** A sessão que fechou sozinha e espera confirmação do fim. */
export interface FechamentoAConfirmar {
  dia: string;
  /** instantes, para a tela escrever "6h20 → 7h31"; a regra não os lê */
  inicio: number;
  fim: number;
}

/** O treino previsto do dia, já resolvido por quem chama. */
export interface TreinoDoDia {
  dia: string;
  /**
   * Minuto do dia em que a janela do treino previsto TERMINA.
   *
   * É o que define "enquanto o treino não aconteceu" sem usar a rotina de
   * ninguém: a decisão do dono diz "manhã de dia de treino", e "manhã" não é um
   * dado. A janela vem do turno declarado do dia e, sem turno, do padrão
   * semanal — e aí o previsto é palpite. Treino à noite cai na mesma regra sem
   * emenda.
   */
  fimDaJanela: number;
  /** o previsto vem do padrão semanal, e não de dado declarado */
  palpite: boolean;
  /** já aconteceu hoje; dois treinos no mesmo dia são possíveis */
  feito: boolean;
  /** é o dia da aula, que É a sessão daquele dia — não "o sábado" */
  aula: boolean;
}

/** Uma refeição do plano, com a hora PREVISTA e a marca de hoje. */
export interface RefeicaoDoDia {
  id: string;
  /**
   * Minuto do dia, do PLANO e não dele (decisão 14.6): o lanche das 16h00 é o
   * previsto mesmo que ele coma às 15h30. A marca grava o instante real do
   * toque, e isso é outro assunto.
   */
  hora: number;
  marcada: boolean;
}

/** Os fatos do dia, já resolvidos. */
export interface FatosDoDia {
  sessao: SessaoNoTopo | null;
  confirmar: FechamentoAConfirmar | null;
  treino: TreinoDoDia | null;
  /** o plano do dia, em qualquer ordem: a regra ordena pela hora */
  refeicoes: RefeicaoDoDia[];
  /** minutos desde a meia-noite */
  agora: number;
}

/**
 * O cartão de cima, ou `null` quando não há o que pôr nele.
 *
 * `null` é resposta legítima e está na regra: dia de descanso fora de qualquer
 * janela não tem cartão (§5.7), e o que passou sem marca é a linha "Pôr hoje em
 * dia" — nunca o cartão.
 */
export type Cartao =
  | { k: 'sessao'; dia: string; guardadas: number; prescritas: number; pergunta: boolean }
  | { k: 'confirmar'; dia: string; inicio: number; fim: number }
  | { k: 'aula'; dia: string }
  | { k: 'treino'; dia: string; palpite: boolean }
  | { k: 'refeicao'; id: string; hora: number; janela: boolean }
  | { k: 'resolvido'; id: string };

/**
 * Quantos minutos à frente uma refeição ainda conta como "o momento".
 *
 * Trinta, do protótipo. A janela cobre o previsto e o real: o lanche das 16h00
 * marcado às 15h30 cai dentro dela pelos dois lados.
 */
export const JANELA_REFEICAO = 30;

/**
 * A próxima coisa a fazer.
 *
 * A ordem é a da seção 5, e cada degrau existe por uma razão medida ou
 * decidida:
 *
 * **1 · A sessão aberta ganha de tudo.** É o único estado em que o topo
 * competiria com um modo que já está aberto, e é o estado mais comum medido —
 * de 42% a 59% das sessões fecham sem ele.
 *
 * **2 · A sessão que fechou sozinha ganha do treino de hoje.** É uma
 * confirmação sobre um registro JÁ ESCRITO, e o número escrito está aproximado
 * até ele dizer.
 *
 * **3 · Enquanto o treino do dia não aconteceu, o treino ganha da refeição.**
 * Decisão do dono (D4). O pré-treino desce para a linha de baixo e reaparece
 * dentro do descanso, que é onde ele de fato é marcado. Em dia de descanso não
 * há treino, então a refeição ganha POR AUSÊNCIA e não por regra.
 *
 * **4 · Passada a janela do treino, a refeição do momento ganha o topo** — e só
 * PARA FRENTE. Esta metade corrige a regra escrita da direção D ("se não houver
 * nada à frente, é a última que passou sem marca"), que se virava contra si
 * mesma um segundo depois de marcar: marcado o lanche das 15h30, ela jogava o
 * almoço das 12h30 para o topo como se fosse agora.
 *
 * **5 · Fora da janela, não há cartão de refeição.** Aqui havia uma leitura
 * minha, declarada: "nada na janela, mas algo à frente, o cartão é a próxima
 * coisa do dia". A terceira entrega da D (`agora-descanso.html`, estados 1 e 3)
 * a desfez com dois casos: às 10h40, com o almoço às 12h30, e às 14h10, com o
 * lanche às 16h00 — "de novo, nenhum cartão". O que está à frente é linha do
 * dia; o que passou sem marca também. O campo `janela` fica, sempre verdadeiro,
 * para a tela não precisar mudar de forma.
 *
 * **6 · Dia resolvido: o topo confirma o que foi marcado, com "Corrigir".**
 * Para a tela não ficar muda quando tudo foi feito. O app de hoje já faz algo
 * equivalente por outro caminho.
 *
 * **7 · Nada à frente e o dia não resolvido: não há cartão.** O que passou sem
 * marca é a linha "Pôr hoje em dia", e o app não cobra ninguém.
 */
export function cartaoDeCima(f: FatosDoDia): Cartao | null {
  if (!f) return null;

  // 1 · a sessão aberta, e a pergunta de 1h30 mantendo o topo
  if (f.sessao) {
    return {
      k: 'sessao', dia: f.sessao.dia,
      guardadas: f.sessao.guardadas, prescritas: f.sessao.prescritas,
      pergunta: !!f.sessao.esquecida
    };
  }

  // 2 · a confirmação de um registro já escrito
  if (f.confirmar) {
    return { k: 'confirmar', dia: f.confirmar.dia,
             inicio: f.confirmar.inicio, fim: f.confirmar.fim };
  }

  // 3 · o treino, enquanto a janela dele não passou
  const t = f.treino;
  if (t && !t.feito && f.agora <= t.fimDaJanela) {
    return t.aula ? { k: 'aula', dia: t.dia } : { k: 'treino', dia: t.dia, palpite: !!t.palpite };
  }

  // 4 e 5 · a refeição, só para frente
  const adiante = (f.refeicoes || [])
    .filter(function (r) { return r && !r.marcada && r.hora >= f.agora; })
    .sort(function (a, b) { return a.hora - b.hora; })[0];
  if (adiante && adiante.hora - f.agora <= JANELA_REFEICAO) {
    return { k: 'refeicao', id: adiante.id, hora: adiante.hora, janela: true };
  }

  // 6 · o dia resolvido confirma a última marca
  const marcadas = (f.refeicoes || [])
    .filter(function (r) { return r && r.marcada; })
    .sort(function (a, b) { return a.hora - b.hora; });
  const nadaFaltando = (f.refeicoes || []).every(function (r) { return !r || r.marcada; });
  const treinoResolvido = !t || t.feito;
  if (marcadas.length && nadaFaltando && treinoResolvido) {
    return { k: 'resolvido', id: marcadas[marcadas.length - 1].id };
  }

  // 7 · nada à frente, e o dia não fechou: a linha "Pôr hoje em dia" resolve,
  // e o cartão se cala em vez de cobrar.
  return null;
}
