// Os tipos do domínio.
//
// Até aqui o formato do estado só existia escrito em docs/ARQUITETURA.md e na
// cabeça de quem escreveu. Isso é um problema específico deste app: há uma
// cadeia de migrações, os campos entram sempre como opcionais, e um backup de
// qualquer versão anterior chega pelo mesmo caminho que o disco. É exatamente o
// lugar onde um contrato só documentado se solta do código sem ninguém ver.

import type { Cadencia } from './dia';
import type { Ajuste } from './corpo';
import type { Alimento, DiaComida, Refeicao } from './nutricao/tipos';

/** Os seis tipos de carregamento. O app rotula, nunca converte. */
export type TipoCarga = 'pino' | 'lado' | 'halter' | 'halter1' | 'corpo' | 'assist';

/** Letra do treino na rotação. */
export type Dia = string;

/** id derivado do nome do exercício por slugEx. É a chave do histórico. */
export type IdEx = string;

/** O que um exercício É — vem do catálogo, não da prescrição. */
export interface Exercicio {
  /** nome como aparece na tela */
  n: string;
  /** tipo de carregamento do equipamento */
  car: TipoCarga;
  /** grupo muscular ao qual a série é atribuída */
  g: string;
  /** 1 se é composto grande (governa o descanso padrão) */
  c: 0 | 1;
  /** dica de execução */
  cue?: string;
  /** 'seg' quando o exercício é medido por tempo, não por repetição */
  u?: 'seg';
  /** verdadeiro quando o exercício saiu do catálogo mas tem histórico */
  sumido?: 1;
  /** cadastrado por ele, não veio do código */
  meu?: 1;
  /** entrou no catálogo por ser substituto de outro, não por prescrição direta */
  sub?: 1;
  /** arquivado pela migração 2→3: saiu do programa mas tem histórico */
  arq?: 1;
}

/** Como um exercício está PRESCRITO hoje, naquela posição do treino. */
export interface Slot {
  id: IdEx;
  /** séries */
  s: number;
  /** faixa de repetições, como '6–10' */
  r: string;
  /** descanso em segundos */
  d: number;
  /** repetições na reserva alvo, como '1–2'; ausente nos slots anteriores à revisão de 2026 */
  rir?: string;
  /** quando entrou nesta posição; 0 = veio do treinador e não conta na regra das 6 a 8 semanas */
  desde: number;
  /** 1 quando é bi-set com o exercício seguinte */
  bi?: 0 | 1;
  /** 1 quando o slot é resultado de um mod do dia */
  mod?: 0 | 1;
  /** id original da posição, mesmo depois de uma troca */
  orig?: IdEx;
}

/** Slot resolvido contra o catálogo: o que a tela consome. */
export type SlotResolvido = Slot & Exercicio;

/** Um treino da rotação. */
export interface Treino<E = Slot> {
  name: string;
  tag: string;
  ex: E[];
}

/** Uma série registrada: [carga, repetições]. null = série não feita. */
export type Serie = [number, number] | null;

/** Uma entrada de histórico, indexada pelo id do exercício. */
export interface Log {
  /** instante */
  t: number;
  /** id da sessão */
  sid: number;
  sets: Serie[];
  /** posição de origem, quando difere da chave (houve troca) */
  sl?: IdEx;
  /** exercício por tempo */
  u?: 'seg';
  /** quando este registro foi alterado pela última vez; a fusão o usa para decidir */
  m?: number;
  obs?: string;
  dor?: string[];
  /**
   * Repetições na reserva da ÚLTIMA série, como '1' ou '0–1'. Uma por exercício
   * por sessão, não por série: é o que o treinador pede para ler o registro, e
   * o que cabe digitar entre uma série e outra.
   */
  rir?: string;
  /** feito em deload */
  dl?: 0 | 1;
  /** feito com aproximação */
  aq?: 0 | 1;
}

/** Presença: uma entrada por sessão. */
export interface Sessao {
  day: Dia;
  t: number;
  sid: number;
  /** duração líquida, sem as pausas */
  dur: number;
  /** como começou */
  ini?: 'manual' | 'auto';
  /** como terminou */
  fim?: 'manual' | 'auto';
  pausado?: number;
  pulados?: number[];
  /** 1 quando o horário é confiável */
  hora?: 0 | 1;
  dl?: 0 | 1;
  retro?: 0 | 1;
  /** o que mudou no dia, tenha virado permanente ou não */
  mods?: string[];
  /** sessão avulsa, fora do plano */
  livre?: 0 | 1;
  grupos?: string[];
  nome?: string;
  obs?: string;
  /** quando foi alterada pela última vez */
  m?: number;
}

/** Mudança do dia, guardada como intenção e não como cópia do treino. */
export type Mod =
  | { k: 'troca'; slot: IdEx; por: IdEx }
  | { k: 'sets'; slot: IdEx; de: number; para: number }
  | { k: 'reps'; slot: IdEx; de: string; para: string }
  | { k: 'desc'; slot: IdEx; de: number; para: number }
  | { k: 'rm'; slot: IdEx }
  | { k: 'mover'; slot: IdEx; de: number; para: number }
  | { k: 'add'; id: IdEx; s: number; r: string; d: number; pos: number; n?: 0 | 1 };

export interface Mods {
  day: Dia;
  t: number;
  list: Mod[];
}

/** Sessão em andamento. */
export interface SessaoAberta {
  day: Dia;
  inicio: number;
  ultima: number;
  sid: number;
  manual?: boolean;
  retro?: boolean;
  pausadoEm?: number | null;
  pausas?: Array<{ de: number; ate?: number }>;
  pulados?: number[];
}

/** Uma decisão registrada sobre o programa. */
export interface EntradaProgLog {
  t: number;
  day: Dia;
  txt: string;
  motivo?: string;
  /** quando foi alterada pela última vez */
  m?: number;
}

/** Uma marca corporal. */
export interface Marca { t: number; v: number; /** alterada em */ m?: number; }

/** Uma sessão de cardio. */
export interface Cardio {
  t: number;
  /** modal */
  m: string;
  min: number;
  /** intensidade */
  i: string;
  /** quando foi alterada pela última vez. `m` já era o modal, então aqui é `alt` */
  alt?: number;
}

/** O que está sendo digitado numa posição da sessão aberta. */
export interface RascunhoEx {
  s: Serie[];
  obs?: string;
  dor?: string[];
  /** RIR da última série, como digitado hoje */
  rir?: string;
  /** substituto escolhido para hoje */
  alt?: IdEx;
  /** feito com aproximação */
  aq?: 0 | 1;
}

/** Buffer de digitação da sessão aberta, por posição do treino. */
export interface Rascunho {
  /** o dia a que o rascunho pertence: zerado ao trocar de treino */
  day?: Dia;
  t?: number;
  ex: Record<string, RascunhoEx>;
}

/** Estado das compras. Derivado no cálculo, mas o que foi MARCADO persiste. */
export interface EstadoCompras {
  /** itens já no carrinho */
  comprado: Record<string, 1>;
  /** linhas escritas à mão, fora do plano */
  extras: string[];
  /** linhas do plano que ele tirou da lista desta vez */
  removidas: Record<string, 1>;
  /** horizonte em dias: 7, 14 ou 30 */
  dias: number;
}

/** A metade de comida do estado. Espelha a de treino: biblioteca + plano. */
export interface EstadoComida {
  /** o plano dele, semeado do PLANO_BASE e editável */
  plano: Refeicao[] | null;
  /** o catálogo dele, sobrepondo o que vem do código */
  alimentos: Record<string, Partial<Alimento>>;
  /** alimentos do código que ele escondeu */
  ocultos: Record<string, 1>;
}

/** O estado persistido inteiro, sob a chave `treino-eduardo-v1`. */
export interface Estado {
  /** histórico por ID DE EXERCÍCIO, nunca por posição */
  logs: Record<IdEx, Log[]>;
  done: Sessao[];
  deload: boolean;
  /** buffer de digitação da sessão aberta */
  draft: Rascunho | null;
  sessao: SessaoAberta | null;
  cardio: Cardio[];
  body: { peso: Marca[]; cintura: Marca[] };
  /** correção do tipo de carga, por exercício */
  carga: Record<IdEx, TipoCarga>;
  /** timestamp do último backup */
  export: number;
  /** versão do formato */
  plano: number;
  /** o programa dele, semeado do PROGRAMA e editável */
  prog: Record<Dia, Treino> | null;
  rot: Dia[] | null;
  /** o catálogo dele */
  ex: Record<IdEx, Partial<Exercicio>>;
  /** as mudanças de hoje */
  mods: Mods | null;
  progLog: EntradaProgLog[];

  // ---- o que a fusão com a nutrição trouxe ----

  /**
   * Cadência da semana: 7 posições, domingo primeiro, 'treino' | 'descanso'.
   * NÃO guarda letra de treino — qual sessão vem é sempre da rotação. Isto
   * responde só "hoje é dia de treinar", e sustenta a previsão de compras.
   */
  cadencia: Cadencia[] | null;
  /** a metade de comida */
  comida: EstadoComida;
  /** o dia de comida, carimbado com a data; zera sozinho */
  dia: DiaComida | null;
  /** o ±150 kcal em vigor */
  ajuste: Ajuste;
  /**
   * Override do sinal de força. `null` = o app calcula a partir das cargas.
   * Existe porque o cálculo não sabe que ele voltou de duas semanas doente.
   */
  perfManual: boolean | null;
  compras: EstadoCompras;

  // ---- o que a sincronização trouxe ----

  /**
   * Quando o estado foi tocado pela última vez. É o que decide, na fusão, de
   * que lado vêm os DOCUMENTOS — programa, plano de comida, cadência —, que
   * são os únicos pedaços sem fusão possível.
   */
  mtime: number;
  /**
   * Dias marcados como descanso, por data ('AAAA-MM-DD' → quando foi marcado).
   *
   * Não entra em `done` de propósito: lá dentro ele viraria treino em toda
   * contagem que percorre sessões — o bloco de 48, a média semanal, a rotação.
   * Aqui ele responde só à pergunta que o calendário não sabia responder: o dia
   * está vazio porque você descansou ou porque esqueceu de registrar?
   */
  descanso: Record<string, number>;
  /**
   * Lápides: chave do registro → quando foi apagado.
   *
   * Sem isto, unir dois estados RESSUSCITA o que você apagou num aparelho: o
   * registro ainda existe no outro, e a união o traz de volta.
   */
  apagados: Record<string, number>;
}
