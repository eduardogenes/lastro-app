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

/**
 * Uma série registrada: [carga, repetições, RIR].
 *
 * O RIR é a terceira posição e é opcional — série antiga tem só dois números, e
 * continua válida. Quem lê carga e repetição indexa [0] e [1] e não precisa
 * saber que existe um terceiro.
 *
 * Ele mora AQUI, e não numa marca por exercício, porque é por série que a
 * informação existe: a primeira a 2 da falha e a última a 0 é uma sessão
 * diferente de três séries a 1, e as duas somariam o mesmo volume.
 */
export type Serie = [number, number, number?] | null;

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
   * LEGADO do plano 5: o RIR da última série, como '1' ou '0–1', um por
   * exercício. A migração 5→6 o move para a terceira posição da série. Fica
   * declarado porque a migração precisa lê-lo.
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

/** Uma decisão de programa que ficou para a próxima abertura. */
export interface PromoPendente {
  day: Dia;
  /** quando a sessão fechou, para a tela poder dizer de que treino se trata */
  t: number;
  mods: Mod[];
  /** cada mudança já em português, como a tela mostra */
  resumoMods: string[];
}

/** A referência de uma foto: quando foi tirada e em que formato ela ficou. */
export interface FotoRef {
  /** instante da captura; serve de versão na fusão e de quebra-cache na tela */
  v: number;
  /** 'webp' ou 'jpeg' — o Safari antigo não codifica webp no canvas */
  ext: string;
}

/** id de uma pose do protocolo, derivado do nome uma vez só. */
export type PoseId = string;

/** Uma pose do protocolo de fotos: o que ela é e como se executa. */
export interface Pose {
  id: PoseId;
  /** nome como aparece na tela */
  n: string;
  /** a que pergunta a foto responde */
  bloco: 'referência' | 'músculo' | 'postura';
  /** rotação do corpo em relação à câmera */
  giro: 0 | 90 | 180 | 270;
  /** resumo curto da posição dos braços, para o cabeçalho */
  bracos: string;
  /** execução, uma instrução por linha */
  como: string[];
  revela: string;
  erro: string;
}

/**
 * Uma sessão de fotos. A chave natural é a DATA — duas sessões no mesmo dia não
 * existem no protocolo, e usar a data faz a fusão convergir sem sorteio.
 *
 * `fotos` guarda só a REFERÊNCIA de cada pose, nunca os bytes: eles moram no
 * Cache Storage e replicam pelo bucket, pela mesma razão que já vale para a
 * foto do aparelho.
 */
export interface SessaoFoto {
  /** 'AAAA-MM-DD' local */
  d: string;
  /** instante da primeira foto */
  t: number;
  fotos: Record<PoseId, FotoRef>;
  /** a nota que explica, três meses depois, o mês fora da curva */
  obs?: string;
  /** quando foi alterada pela última vez; a fusão a usa para decidir */
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

/** O estado persistido inteiro, sob a chave `lastro-v1`. */
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
   * A decisão de fim de treino que ficou pendente.
   *
   * Existe porque a sessão pode morrer sozinha — por inatividade ou na virada
   * do dia — e nesse caminho ninguém perguntou se as mudanças do dia entram no
   * programa. Guardada aqui, a pergunta aparece na abertura seguinte em vez de
   * a resposta ser decidida em silêncio, sempre para o mesmo lado.
   */
  promoPendente: PromoPendente | null;
  /**
   * A foto do aparelho, por exercício — só a REFERÊNCIA, nunca os bytes.
   *
   * Os bytes moram no Cache Storage do aparelho e replicam pelo Supabase
   * Storage. Aqui ficam uns 25 bytes por exercício, porque o estado inteiro é
   * reserializado a cada série registrada e enviado inteiro a cada
   * sincronização: 40 fotos embutidas em base64 seriam megabytes atravessando
   * as duas coisas, e o teto do Safari para este armazenamento é de 5 MiB.
   */
  fotos: Record<IdEx, FotoRef>;
  /**
   * Dias marcados como descanso, por data ('AAAA-MM-DD' → quando foi marcado).
   *
   * Não entra em `done` de propósito: lá dentro ele viraria treino em toda
   * contagem que percorre sessões — o bloco de 48, a média semanal, a rotação.
   * Aqui ele responde só à pergunta que o calendário não sabia responder: o dia
   * está vazio porque você descansou ou porque esqueceu de registrar?
   */
  /**
   * O protocolo de fotos de acompanhamento.
   *
   * `poses` é a ordem/seleção dele, semeada do PROTOCOLO do código — mesmo par
   * que `PROGRAMA`/`S.prog`. `null` significa "a do código".
   *
   * `sessoes` é coleção com chave natural (a data), e por isso funde sem perda.
   * Só a referência de cada foto entra aqui: 26 sessões por ano custam uns 7 kB
   * no estado, e o estado inteiro é reserializado a cada série registrada.
   */
  protocolo: {
    poses: PoseId[] | null;
    sessoes: SessaoFoto[];
  };
  descanso: Record<string, number>;
  /**
   * Lápides: chave do registro → quando foi apagado.
   *
   * Sem isto, unir dois estados RESSUSCITA o que você apagou num aparelho: o
   * registro ainda existe no outro, e a união o traz de volta.
   */
  apagados: Record<string, number>;
}
