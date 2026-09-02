// O protocolo de fotos de acompanhamento.
//
// A foto de corpo é a TERCEIRA série do mesmo assunto que peso e cintura já
// respondem: está funcionando? A diferença é que ela não vira número, e por
// isso o que ela exige do app é outra coisa — não uma média, mas comparabilidade.
//
// Duas fotos só são comparáveis quando a pose e a geometria da câmera são as
// mesmas. A geometria o app não alcança (ela mora nas marcas de fita no chão);
// a POSE ele alcança, e é isso que este módulo garante: um conjunto fechado de
// poses, sempre na mesma ordem, e a foto anterior à vista na hora de disparar a
// próxima. Enquadrar contra a anterior evita o desvio; alinhar depois só o
// conserta.
//
// Mesmo desenho do programa de treino, pelo mesmo motivo: `PROTOCOLO` é a
// prescrição congelada no código e `S.protocolo.poses` é a versão dele. Trocar
// o conjunto é edição, nunca migração.
//
// Recebem dado e devolvem decisão: não leem estado global nem tocam em DOM.

import { weekStart } from './formato';
import type { Marca, Pose, PoseId, SessaoFoto } from './tipos';

/** O intervalo do protocolo. Duas semanas: menos que isso é ruído de água e sono. */
export const CADENCIA_DIAS = 14;

const DIA = 86400000;

export interface ItemDeMontagem { k: string; rotulo: string; valor: string; nota: string; }

/**
 * O que fica congelado entre uma sessão e outra.
 *
 * É documento, não registro: aparece antes da primeira foto e não é perguntado
 * de novo. Distância, altura da lente e direção da luz mudam a silhueta mais do
 * que duas semanas de treino — se variarem, a comparação mede a câmera.
 *
 * A altura da lente é a metade da altura DELE, e não a altura do peito que
 * quase todo guia repete: peito é regra de retrato. Para corpo inteiro, a lente
 * no meio distribui a distorção igualmente entre a cabeça e os pés.
 */
export const MONTAGEM: ItemDeMontagem[] = [
  { k: 'dist', rotulo: 'câmera → marca', valor: '3,0 m',
    nota: 'Com a lente 2× do celular. Só com a 1×, 2,5 m — e a grande-angular alarga o que estiver mais perto dela.' },
  { k: 'alt', rotulo: 'altura da lente', valor: 'metade da sua altura',
    nota: 'Umbigo, não peito. Marque a altura na parede com fita.' },
  { k: 'parede', rotulo: 'corpo → parede', valor: '80 cm',
    nota: 'Encostado, a sombra desenha um contorno falso no ombro e na cintura.' },
  { k: 'luz', rotulo: 'luz', valor: 'uma fonte, frontal',
    nota: 'Artificial é mais repetível que a do sol. Nada vindo de cima: luz de teto inventa definição abdominal.' },
  { k: 'hora', rotulo: 'horário', valor: 'manhã, em jejum',
    nota: 'Depois do banheiro, antes de comer e treinar — o mesmo momento da pesagem.' },
  { k: 'roupa', rotulo: 'roupa', valor: 'sempre a mesma',
    nota: 'Peça justa, de cor lisa, e sempre descalço. Meia e chinelo mudam a linha da perna e a altura.' }
];

/**
 * As nove poses, na ordem de execução.
 *
 * A ordem NÃO é agrupada por assunto — é uma rotação contínua 0° → 90° → 180°
 * → 270°. Ele gira sempre para o mesmo lado sem sair da marca do chão, e a
 * sessão inteira sai em menos de cinco minutos. Agrupar por bloco seria mais
 * bonito de ler e faria ele girar seis vezes.
 *
 * `bloco` existe para a tela poder dizer a que pergunta a foto responde, não
 * para reordenar coisa nenhuma.
 */
export const PROTOCOLO: Pose[] = [
  {
    id: 'frente-relaxado', n: 'Frente relaxado', bloco: 'referência', giro: 0,
    bracos: 'soltos ao lado',
    como: [
      'Braços caídos ao lado, palmas voltadas para o corpo.',
      'Olhe para a frente. Não contraia nada — nem abdômen, nem ombro.',
      'Expire normal e pare de mexer meio segundo antes do disparo.'
    ],
    revela: 'cintura, simetria de ombro, distribuição de gordura',
    erro: 'puxar o ombro para trás sem perceber'
  },
  {
    id: 'frente-duplo-biceps', n: 'Frente duplo bíceps', bloco: 'músculo', giro: 0,
    bracos: 'cotovelos na altura do ombro',
    como: [
      'Suba os braços até os cotovelos ficarem na altura do ombro, punhos fechados.',
      'Abra as costas e mantenha a cintura contraída para dentro.',
      'Suba devagar: movimento brusco muda o enquadramento.'
    ],
    revela: 'braço, ombro, largura do dorsal, peito',
    erro: 'cotovelo alto demais, que some com o trapézio'
  },
  {
    id: 'frente-abdomen-coxa', n: 'Abdômen e coxa', bloco: 'músculo', giro: 0,
    bracos: 'mãos atrás da cabeça',
    como: [
      'Mãos atrás da cabeça, dedos entrelaçados, cotovelos abertos.',
      'Uma perna meio passo à frente, joelho travado, coxa contraída.',
      'Solte todo o ar e contraia o abdômen com o pulmão vazio.'
    ],
    revela: 'definição abdominal e serrátil — o mais sensível a gordura',
    erro: 'trocar a perna da frente entre as sessões'
  },
  {
    id: 'perfil-direito', n: 'Perfil direito', bloco: 'referência', giro: 90,
    bracos: 'estendidos à frente',
    como: [
      'Gire 90° sobre a marca, lado direito para a câmera. Os pés continuam no T.',
      'Estenda os dois braços à frente, na altura do ombro — eles saem da frente da cintura.',
      'Postura natural, sem empinar nem encolher a barriga.'
    ],
    revela: 'espessura da cintura de perfil — onde a mudança aparece primeiro',
    erro: 'girar 60° em vez de 90° e achar que emagreceu'
  },
  {
    id: 'perfil-direito-postura', n: 'Perfil direito natural', bloco: 'postura', giro: 90,
    bracos: 'soltos ao lado',
    como: [
      'Mesma posição, mas com os braços caídos naturalmente ao lado.',
      'Olhe para um ponto fixo à frente, na altura dos olhos.',
      'Dê três passos no lugar e pare — assim você cai na sua postura real.'
    ],
    revela: 'alinhamento de orelha, ombro, quadril e tornozelo',
    erro: 'corrigir a postura na hora e perder o dado'
  },
  {
    id: 'costas-relaxado', n: 'Costas relaxado', bloco: 'referência', giro: 180,
    bracos: 'soltos ao lado',
    como: [
      'Gire mais 90° no mesmo sentido. Braços soltos, palmas para o corpo.',
      'Cabeça neutra, olhando para a frente — não para baixo.',
      'Ombros onde eles caem sozinhos.'
    ],
    revela: 'simetria das escápulas, lombar, contorno do glúteo',
    erro: 'olhar por cima do ombro e torcer o tronco'
  },
  {
    id: 'costas-duplo-biceps', n: 'Costas duplo bíceps', bloco: 'músculo', giro: 180,
    bracos: 'cotovelos abertos',
    como: [
      'Mesma subida de braço da segunda pose, agora de costas.',
      'Afaste as escápulas como se puxasse os cotovelos para trás e para fora.',
      'Recue meio pé e apoie na ponta para contrair a panturrilha.'
    ],
    revela: 'espessura do dorsal, trapézio e erector',
    erro: 'trocar o pé que fica atrás'
  },
  {
    id: 'costas-maos-na-cintura', n: 'Costas mãos na cintura', bloco: 'músculo', giro: 180,
    bracos: 'polegares na cintura',
    como: [
      'Polegares logo acima da crista ilíaca, mãos abertas.',
      'Empurre os cotovelos para a frente e para fora, abrindo a largura.',
      'Cintura contraída — o contraste é a informação aqui.'
    ],
    revela: 'a relação ombro/cintura, que muda mesmo com o peso parado',
    erro: 'subir as mãos para as costelas e falsear a largura'
  },
  {
    id: 'perfil-esquerdo', n: 'Perfil esquerdo', bloco: 'referência', giro: 270,
    bracos: 'estendidos à frente',
    como: [
      'Complete o giro. Lado esquerdo para a câmera, mesma execução do perfil direito.',
      'Os dois perfis existem porque o corpo é assimétrico.',
      'Confira que os pés voltaram para o T antes do disparo.'
    ],
    revela: 'a assimetria entre os lados, invisível na foto de frente',
    erro: 'pular esta foto por parecer repetida — ela é a que fecha o par'
  }
];

/** O catálogo por id, montado uma vez. */
const POR_ID: Record<PoseId, Pose> = {};
PROTOCOLO.forEach(function (p) { POR_ID[p.id] = p; });

/** A ordem que vem do código. É a semente de `S.protocolo.poses`. */
export function ordemPadrao(): PoseId[] { return PROTOCOLO.map(function (p) { return p.id; }); }

/** Uma pose pelo id, ou null. */
export function poseDe(id: PoseId): Pose | null { return POR_ID[id] || null; }

/**
 * As poses da sessão, resolvidas contra o catálogo.
 *
 * Id desconhecido é DESCARTADO em silêncio, não vira pose fantasma: ao
 * contrário do exercício, uma pose não tem histórico próprio para preservar —
 * o histórico está na sessão, e a foto continua lá com a chave dela.
 */
export function poses(ordem: PoseId[] | null | undefined): Pose[] {
  if (!Array.isArray(ordem) || !ordem.length) return PROTOCOLO.slice();
  const r: Pose[] = [];
  ordem.forEach(function (id) { const p = POR_ID[id]; if (p) r.push(p); });
  return r.length ? r : PROTOCOLO.slice();
}

/**
 * A data local no formato 'AAAA-MM-DD'.
 *
 * Local e não UTC: a sessão é de manhã, e em UTC-3 um `toISOString` antes das
 * 3h joga a foto para o dia anterior. A chave natural da sessão é o dia como
 * ele aparece no calendário dele.
 */
export function dataLocal(t: number): string {
  const d = new Date(t);
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

/** O instante do meio-dia daquela data local. Serve para comparar com marcas. */
export function instanteDaData(d: string): number {
  const p = String(d).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0, 0).getTime();
}

/** As sessões em ordem cronológica, a mais nova por último. */
export function ordenadas(sessoes: SessaoFoto[] | null | undefined): SessaoFoto[] {
  return (Array.isArray(sessoes) ? sessoes.slice() : []).sort(function (a, b) {
    return a.d < b.d ? -1 : a.d > b.d ? 1 : 0;
  });
}

/** A sessão daquela data, ou null. */
export function sessaoDe(sessoes: SessaoFoto[] | null | undefined, d: string): SessaoFoto | null {
  return (Array.isArray(sessoes) ? sessoes : []).filter(function (s) { return s.d === d; })[0] || null;
}

/** A última sessão registrada, ou null. */
export function ultima(sessoes: SessaoFoto[] | null | undefined): SessaoFoto | null {
  const o = ordenadas(sessoes);
  return o.length ? o[o.length - 1] : null;
}

/**
 * Quantos dias desde a última sessão. `null` quando não há nenhuma.
 *
 * Conta pela DATA, não pelo instante: uma sessão de ontem às 7h e uma consulta
 * hoje às 6h dariam 0 dias por instante, e o que o protocolo pergunta é quantas
 * viradas de dia se passaram.
 */
export function diasDesde(sessoes: SessaoFoto[] | null | undefined, agora: number): number | null {
  const u = ultima(sessoes);
  if (!u) return null;
  const hoje = instanteDaData(dataLocal(agora));
  return Math.max(0, Math.round((hoje - instanteDaData(u.d)) / DIA));
}

export interface Completude {
  feitas: number;
  total: number;
  faltando: PoseId[];
  /** true quando todas as poses da ordem têm foto */
  cheia: boolean;
}

/** Quantas poses da ordem já têm foto naquela sessão. */
export function completude(
  sessao: SessaoFoto | null | undefined, ordem: PoseId[] | null | undefined
): Completude {
  const lista = poses(ordem);
  const fotos = (sessao && sessao.fotos) || {};
  const faltando = lista.filter(function (p) { return !fotos[p.id]; }).map(function (p) { return p.id; });
  return {
    feitas: lista.length - faltando.length,
    total: lista.length,
    faltando: faltando,
    cheia: faltando.length === 0 && lista.length > 0
  };
}

/** A primeira pose sem foto — por onde a sessão continua. Null quando está cheia. */
export function proximaPose(
  sessao: SessaoFoto | null | undefined, ordem: PoseId[] | null | undefined
): PoseId | null {
  const f = completude(sessao, ordem);
  return f.faltando.length ? f.faltando[0] : null;
}

export interface Referencia { d: string; pose: PoseId; }

/**
 * A foto mais recente daquela pose ANTES de uma data. É o que a tela mostra na
 * hora de disparar — a referência de enquadramento.
 *
 * Procura para trás até achar uma sessão que tenha a pose: pular uma pose numa
 * sessão não pode cegar a referência da seguinte.
 */
export function referencia(
  sessoes: SessaoFoto[] | null | undefined, pose: PoseId, antesDe: string
): Referencia | null {
  const o = ordenadas(sessoes);
  for (let i = o.length - 1; i >= 0; i--) {
    if (o[i].d >= antesDe) continue;
    if (o[i].fotos && o[i].fotos[pose]) return { d: o[i].d, pose: pose };
  }
  return null;
}

/** As sessões que têm aquela pose, da mais antiga para a mais nova. */
export function comAPose(sessoes: SessaoFoto[] | null | undefined, pose: PoseId): SessaoFoto[] {
  return ordenadas(sessoes).filter(function (s) { return !!(s.fotos && s.fotos[pose]); });
}

/**
 * A sessão VIZINHA naquela pose: a que serve de fantasma ao ajustar.
 *
 * A anterior primeiro, porque alinhar contra o passado é o que mantém a série
 * coerente — mexer numa foto para casar com uma futura reescreveria a história
 * ao contrário. Mas quando não há anterior, e é o caso da sessão mais antiga de
 * todas, a seguinte serve: sem isso a primeira foto da série seria a única que
 * nunca teria contra o que se alinhar, justamente a que ancora o resto.
 *
 * `null` só quando aquela pose existe numa sessão só.
 */
export function vizinhaComAPose(
  sessoes: SessaoFoto[] | null | undefined, pose: PoseId, d: string
): SessaoFoto | null {
  const c = comAPose(sessoes, pose).filter(function (s) { return s.d !== d; });
  if (!c.length) return null;
  const antes = c.filter(function (s) { return s.d < d; });
  return antes.length ? antes[antes.length - 1] : c[0];
}

/**
 * O par que a tela de comparação abre por padrão: a mais nova e a MAIS ANTIGA
 * que tenha a mesma pose.
 *
 * Contra a anterior, a diferença de duas semanas é quase toda água e sono — e é
 * assim que se desiste de um plano que estava funcionando. O padrão tem que ser
 * o intervalo longo; o curto ele escolhe se quiser.
 */
export function parPadrao(
  sessoes: SessaoFoto[] | null | undefined, pose: PoseId
): { de: SessaoFoto; ate: SessaoFoto } | null {
  const c = comAPose(sessoes, pose);
  if (c.length < 2) return null;
  return { de: c[0], ate: c[c.length - 1] };
}

/**
 * A média semanal de uma marca corporal na semana daquela sessão.
 *
 * É o que põe o número ao lado da foto na comparação — e é DERIVADO de
 * `S.body`, nunca digitado na sessão de fotos. O protocolo manda fotografar de
 * manhã em jejum, que é o mesmo momento da pesagem: perguntar o peso de novo
 * seria perguntar o que o app já sabe.
 *
 * Média da semana e não a medida do dia, pela mesma razão que rege
 * `dominio/corpo.ts`: o peso de um dia não decide nada.
 */
export function mediaDaSemana(marcas: Marca[] | null | undefined, d: string): number | null {
  const semana = weekStart(instanteDaData(d));
  const nela = (Array.isArray(marcas) ? marcas : []).filter(function (x) {
    return weekStart(x.t) === semana;
  });
  if (!nela.length) return null;
  return nela.reduce(function (a, x) { return a + x.v; }, 0) / nela.length;
}
