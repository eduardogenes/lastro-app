// Os dados da semente do catálogo do sistema (ver `catalogo.ts`). Só dado.
//
// Subir `VERSAO_DA_SEMENTE` a cada mudança daqui, e gerar o SQL de novo
// (`npm run catalogo:sql`). O SQL só INSERE o que falta no banco: exercício
// que já existe lá se corrige lá, pelo moderador (a semente não sobrescreve a
// curadoria). E o app só usa a cópia do banco se ela tiver todos os ids desta
// semente — um id novo aqui sem o SQL aplicado faz o app ficar com a semente.

import type { TipoCarga, Unidade } from './tipos';

export const VERSAO_DA_SEMENTE = 3;

/** O padrão do movimento. `outro` é o que a regra não reconheceu. */
export const MOVIMENTOS: Record<string, string> = {
  'supino-inclinado': 'Supino inclinado',
  'supino': 'Supino',
  'crucifixo': 'Crucifixo',
  'puxada': 'Puxada vertical',
  'pullover': 'Pullover',
  'remada': 'Remada',
  'elevacao-lateral': 'Elevação lateral',
  'elevacao-frontal': 'Elevação frontal',
  'crucifixo-inverso': 'Crucifixo inverso',
  'encolhimento': 'Encolhimento',
  'rosca': 'Rosca',
  'triceps': 'Extensão de cotovelo',
  'agachamento': 'Agachamento',
  'extensao-de-joelho': 'Extensão de joelho',
  'flexao-de-joelho': 'Flexão de joelho',
  'dobradica': 'Dobradiça de quadril',
  'ponte': 'Extensão de quadril',
  'abducao': 'Abdução de quadril',
  'aducao': 'Adução de quadril',
  'panturrilha': 'Flexão plantar',
  'tibial': 'Dorsiflexão',
  'core': 'Core',
  'mobilidade': 'Mobilidade',
  'condicionamento': 'Condicionamento',
  'outro': 'Outro'
};

/** Tipos de equipamento genéricos, com o tipo de carga que costumam ter. */
export const EQUIPAMENTOS: Record<string, { n: string; car: TipoCarga }> = {
  'smith':          { n: 'Smith', car: 'lado' },
  'polia':          { n: 'Polia', car: 'pino' },
  'maquina-pino':   { n: 'Máquina de pino', car: 'pino' },
  'maquina-anilha': { n: 'Máquina de anilha', car: 'lado' },
  'halteres':       { n: 'Halteres', car: 'halter' },
  'barra':          { n: 'Barra livre', car: 'barra' },
  'implemento':     { n: 'Implemento único', car: 'halter1' },
  'corpo':          { n: 'Peso do corpo', car: 'corpo' },
  'ergometro':      { n: 'Ergômetro', car: 'corpo' },
  'sled':           { n: 'Trenó', car: 'lado' }
};

/** Um exercício que entra no sistema vindo de um texto do treinador. */
export interface NovoDoSistema {
  n: string;
  g: string;
  car: TipoCarga;
  u?: Unidade;
  c?: 1;
  uni?: 1;
  mov?: string;
  eq?: string;
  mus?: [string, number][];
  alt?: string[];
  equiv?: string[];
}

/**
 * Os exercícios da v2.2 do treinador (23/11/2026) sem par no catálogo do código.
 *
 * Só os que não tinham NENHUM candidato: nem nome parecido, nem lugar (os
 * treinos da v2.2 tinham letras novas, então não houve candidato por lugar). A
 * revisão os criou com o id do próprio nome, e por isso a semente usa o mesmo
 * id — o histórico de quem colou a v2.2 já está nele.
 *
 * Os que tinham nome parecido ("Supino inclinado no Smith 30°", "Remada apoiada
 * no peito"…) NÃO entram: a pessoa respondeu "é o mesmo" ou "é outro", e o app
 * não guardou a resposta. Pôr o nome deles no catálogo mudaria a próxima
 * leitura do mesmo texto. Ficam para o moderador (docs/catalogo/00-desenho.md).
 */
export const NOVOS_DA_V22: NovoDoSistema[] = [
  { n: 'Puxada alta pegada neutra', g: 'dorsal', car: 'pino', c: 1, alt: ['Neutral grip lat pulldown'], equiv: ['puxada-neutra-no-cabo', 'puxada-neutra-na-maquina'] },
  { n: 'Puxada alta pegada aberta', g: 'dorsal', car: 'pino', c: 1, alt: ['Wide grip lat pulldown', 'Puxada aberta'], equiv: ['pulldown-convergente'] },
  { n: 'Alongamento do flexor do quadril ajoelhado', g: 'mobilidade', car: 'corpo', u: 'seg', uni: 1, alt: ['Half-kneeling hip flexor stretch'] },
  { n: 'Mobilidade de quadril 90/90', g: 'mobilidade', car: 'corpo', uni: 1, mov: 'mobilidade', alt: ['90/90 hip mobility'] },
  { n: 'Stiff com halteres', g: 'posterior', car: 'halter', c: 1, alt: ['Dumbbell stiff-leg deadlift'], equiv: ['terra-romeno-com-halteres'] },
  { n: 'Afundo reverso com halteres', g: 'glúteo', car: 'halter', c: 1, uni: 1, mov: 'agachamento', mus: [['glúteo', 1], ['quadríceps', 0.5]], alt: ['Dumbbell reverse lunge'] },
  { n: 'Pallof press', g: 'core', car: 'pino', uni: 1, alt: ['Pallof'] },
  { n: 'Agachamento goblet', g: 'quadríceps', car: 'halter1', c: 1, alt: ['Goblet squat'] },
  { n: 'Agachamento búlgaro com halteres', g: 'quadríceps', car: 'halter', c: 1, uni: 1, alt: ['Bulgarian split squat'] },
  { n: 'Dead bug', g: 'core', car: 'corpo' },
  { n: 'Tríceps acima da cabeça na polia sentado', g: 'tríceps', car: 'pino', alt: ['Seated overhead cable triceps extension'], equiv: ['extensao-de-triceps-acima-da-cabeca-no-cabo'] },
  { n: 'Elevação lateral na polia inclinado para fora', g: 'deltoide lateral', car: 'pino', uni: 1, alt: ['Lean-away cable lateral raise'], equiv: ['elevacao-lateral-unilateral-no-cabo'] }
];

/**
 * Exercícios que faltavam no catálogo e entraram depois da v2.2 (a semente de
 * 23/11 cobria o código e a v2.2). Mesmo cuidado: id do próprio nome.
 * - Barra fixa (24/11/2026): o catálogo só tinha a assistida, e "Barra fixa" do
 *   v3.0 casou com ela. É outro exercício: peso do corpo, sem contrapeso.
 */
export const NOVOS_DO_SISTEMA: NovoDoSistema[] = [
  { n: 'Barra fixa', g: 'dorsal', car: 'corpo', c: 1, mov: 'puxada', eq: 'corpo', mus: [['dorsal', 1], ['bíceps', 0.5]], alt: ['Pull-up', 'Barra fixa pronada', 'Barra fixa livre'], equiv: ['barra-fixa-assistida-pegada-neutra', 'pulldown-convergente', 'puxada-alta-pegada-neutra'] }
];

/**
 * Nomes alternativos, por id. Só o que é, com certeza, o MESMO exercício: nome
 * alternativo leva ao id sem perguntar. Variação que muda a carga (outro
 * ângulo, outra máquina) não é nome alternativo — é outro exercício, ou um
 * equivalente.
 */
export const ALT_NOMES: Record<string, string[]> = {
  'panturrilha-sentada': ['Panturrilha sentado', 'Seated calf raise'],
  'panturrilha-em-pe': ['Standing calf raise'],
  'abdutora': ['Abdução de quadril na máquina', 'Cadeira abdutora', 'Hip abduction machine'],
  'adutora': ['Cadeira adutora', 'Adução de quadril na máquina', 'Hip adduction machine'],
  'rosca-bayesian-no-cabo': ['Rosca bayesiana na polia', 'Rosca bayesiana no cabo', 'Bayesian curl'],
  'reverse-pec-deck': ['Crucifixo inverso no peck deck', 'Peck deck inverso', 'Crucifixo inverso na máquina'],
  'elevacao-pelvica-na-maquina': ['Hip thrust na máquina', 'Machine hip thrust'],
  'elevacao-pelvica-com-barra': ['Hip thrust com barra', 'Barbell hip thrust'],
  'cadeira-flexora-sentada': ['Mesa flexora sentada', 'Flexora sentada', 'Seated leg curl'],
  'mesa-flexora-deitada': ['Flexora deitada', 'Lying leg curl'],
  'cadeira-extensora': ['Extensora', 'Leg extension'],
  'pushdown': ['Tricep pushdown'],
  'triceps-barra-reta-na-polia': ['Tríceps na polia com barra reta', 'Straight bar pushdown'],
  'triceps-corda-na-polia': ['Tríceps corda', 'Rope pushdown'],
  'pec-deck': ['Peck deck', 'Voador', 'Pec fly machine'],
  'remada-cavalinho': ['T-bar row'],
  'terra-romeno-com-barra': ['Romanian deadlift', 'RDL'],
  'straight-arm-pulldown': ['Pulldown com braços estendidos'],
  'face-pull-na-polia-alta': ['Face pull'],
  'encolhimento-com-halteres': ['Dumbbell shrug'],
  'elevacao-lateral-com-halteres': ['Dumbbell lateral raise'],
  'elevacao-lateral-unilateral-no-cabo': ['Elevação lateral unilateral na polia', 'Single-arm cable lateral raise'],
  'pullover-na-polia-alta': ['Pullover na polia', 'Cable pullover'],
  'crucifixo-inverso-no-cabo': ['Crucifixo inverso na polia', 'Cable reverse fly'],
  'crossover-de-baixo-para-cima': ['Crucifixo na polia baixa para alta', 'Low to high cable fly'],
  'leg-press-45': ['Leg press 45 graus']
};
