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
import type { Marca, Pose, PoseId, QuemTira, SessaoFoto } from './tipos';

/** O intervalo do protocolo. Duas semanas: menos que isso é ruído de água e sono. */
export const CADENCIA_DIAS = 14;

const DIA = 86400000;

export interface ItemDeMontagem { k: string; rotulo: string; valor: string; nota: string; }

/**
 * O que fica congelado entre uma sessão e outra.
 *
 * É documento, não registro: aparece antes da primeira foto e não é perguntado
 * de novo. Distância, lente, altura da câmera e direção da luz mudam a silhueta
 * mais do que duas semanas de treino — se variarem, a comparação mede a câmera.
 *
 * Revista em 04/11/2026 a partir da auditoria das 70 fotos feita pelo agente de
 * avaliação física (docs/fotos/01-captura.md). Três coisas estavam erradas:
 * - "3 m com a 2× ou 2,5 m com a 1×" não equivalem: a segunda mostra uma faixa
 *   1,67× maior da cena. Não existe distância que troque de lente sem trocar a
 *   perspectiva; o que se repete é a MESMA lente na MESMA distância.
 * - "metade da altura" e "umbigo" eram a mesma frase e não são a mesma altura:
 *   o umbigo fica a uns 60% do corpo, a metade é a linha do quadril. Com a lente
 *   no umbigo o corpo caía baixo no quadro, com os pés a 2–5% da borda.
 * - a luz frontal nunca foi seguida (as 70 fotos são de luz de teto): a regra
 *   que serve é a MESMA luz, e a frontal fica como o ideal.
 *
 * E em 04/11 mesmo, a segunda revisão: quase sempre OUTRA PESSOA segura o
 * celular, e esse virou o padrão (`QuemTira`). O mesmo agente reviu a montagem
 * pelo lado de quem fotografa (`~/Lastro/corpo/recomendacoes-quem-fotografa.md`,
 * F1–F7 e F11): quem fotografa senta numa cadeira marcada, acerta a altura pela
 * regra do centro e a distância pelas linhas, e não sai do lugar até o fim. As
 * fotos antigas mostram por quê: o fundo se mexe entre as fotos de TODAS as
 * sessões medidas — todas foram com o celular na mão, sem lugar marcado para
 * quem segurava. E a lente passou a ser só a 1× (F5).
 */
export function montagem(quem: QuemTira): ItemDeMontagem[] {
  if (quem === 'sozinho') return [
    { k: 'dist', rotulo: 'câmera → marca', valor: 'a mesma sempre',
      nota: 'Marque no chão o lugar do apoio. A certa é a que põe a cabeça e os pés nas linhas da câmera do app: com a 1×, perto de 0,82 × a sua altura (1,43 m para quem tem 1,75 m).' },
    LENTE,
    { k: 'alt', rotulo: 'altura da lente', valor: 'metade da sua altura',
      nota: 'Na linha do quadril, um palmo abaixo do umbigo. Celular em pé e no nível: a câmera do app mostra o nível. Na altura certa, sobra o mesmo espaço acima da cabeça e abaixo dos pés.' },
    { k: 'parede', rotulo: 'corpo → parede', valor: '80 cm', nota: PAREDE },
    { k: 'luz', rotulo: 'luz', valor: 'a mesma sempre',
      nota: LUZ + ' Se for a do teto, sempre a mesma lâmpada e você sempre na marca: luz de cima muda a definição do abdômen a cada palmo que você anda.' },
    HORA,
    ROUPA
  ];
  return [
    { k: 'quem', rotulo: 'quem fotografa', valor: 'sentado, sempre na mesma cadeira',
      nota: 'Na primeira vez, marque com fita onde ficam os pés da frente da cadeira. Cotovelos apoiados nos joelhos. Se a pessoa fotografada for alta, ajoelhe num joelho só, com os cotovelos colados nas costelas.' },
    { k: 'dist', rotulo: 'distância', valor: 'a das linhas',
      nota: 'A cabeça e os pés encostam nas linhas da câmera do app; se não encostarem, chegue a cadeira para a frente ou para trás. Com a 1×, fica perto de 0,82 × a altura da pessoa: 1,43 m para quem tem 1,75 m. A linha de cima é para a cabeça: os punhos podem passar.' },
    { k: 'alt', rotulo: 'altura da lente', valor: 'a do centro',
      nota: 'Com o nível verde, suba ou desça as mãos até sobrar o mesmo espaço acima da cabeça e abaixo dos pés: a lente fica na linha do quadril, qualquer que seja a altura de cada um. Acerte uma vez, na primeira pose, e não saia do lugar até o fim.' },
    { k: 'pegada', rotulo: 'como segurar', valor: 'duas mãos, cotovelos nos joelhos',
      nota: 'Celular em pé, seguro pela metade de baixo, dedos longe da lente. Solte o ar e toque de leve.' },
    LENTE,
    { k: 'apoio', rotulo: 'apoio', valor: 'melhor ainda, se der',
      nota: 'Se puder apoiar o celular na altura certa, apoie. Quem fotografa continua conferindo e tocando.' },
    { k: 'parede', rotulo: 'pessoa → parede', valor: '80 cm', nota: PAREDE },
    { k: 'luz', rotulo: 'luz', valor: 'a mesma sempre',
      nota: LUZ + ' Quem fotografa não fica entre a luz e a pessoa, e nada de lanterna ou de outra luz.' },
    HORA,
    ROUPA
  ];
}

const LENTE: ItemDeMontagem = { k: 'lente', rotulo: 'lente e câmera', valor: 'a 1×, sempre',
  nota: 'Não troque para a 2× nem para a 0,5×, nem entre a câmera do app e a do sistema: cada uma desenha o corpo de um jeito, e a comparação passa a medir a câmera. A câmera do app fica na 1× sozinha e anota a lente.' };
// D2 (decisão do dono, 04/11): no cômodo que não comporta a montagem na 1×,
// quem cede é a parede, nunca a lente — a 0,5× obriga a chegar a uns 70 cm, e
// a perspectiva deforma o corpo.
const PAREDE = 'Encostado, a sombra desenha um contorno falso no ombro e na cintura. Se o cômodo não comportar a montagem (uns 3 m da parede até atrás do celular), encurte até 40 cm. Nunca troque para a 0,5× para caber.';
const LUZ = 'O ideal é uma lâmpada difusa atrás do celular, um pouco acima da lente, com a do teto apagada.';
const HORA: ItemDeMontagem = { k: 'hora', rotulo: 'horário', valor: 'uma janela de 2 h',
  nota: 'Escolha uma e fique nela. O app anota a hora de cada foto e mostra na comparação: a barriga muda ao longo do dia. Se der, umas 3 h longe de refeição grande e do treino.' };
const ROUPA: ItemDeMontagem = { k: 'roupa', rotulo: 'roupa', valor: 'sempre a mesma peça',
  nota: 'Justa, lisa e de cor média, cinza ou azul. Branca estoura na luz e apaga a linha do elástico; preta esconde o contorno. Elástico logo acima do osso do quadril, e sempre descalço.' };

/**
 * O ajuste de quem fotografa, uma vez, na primeira pose (F2 e F3): depois dele
 * ninguém sai do lugar, e as outras oito poses só se conferem. A ordem importa:
 * a altura primeiro, pela regra do centro — com o celular no nível, o meio da
 * tela é a altura da lente —, e a distância depois, que não tira o quadril do
 * meio porque o corpo cresce e encolhe em volta dele.
 */
export const PASSOS_DO_AJUSTE: string[] = [
  'Deixe o nível verde.',
  'Suba ou desça as mãos até sobrar o mesmo espaço acima da cabeça e abaixo dos pés.',
  'Se a cabeça e os pés não encostarem nas linhas, chegue a cadeira para a frente ou para trás.',
  'Toque em Ajustado. Depois, não saia do lugar até o fim.'
];

/** A linha que vale em toda pose, antes da linha da pose (F15). */
export const CONFERE_SEMPRE = 'nível verde · cabeça e pés nas linhas';

/**
 * As falas de quem tem alguém fotografando (F22). Todas para a pessoa
 * fotografada: quem fotografa lê a tela (F19).
 */
export const FALA_DO_AJUSTE = 'Fique no T, de frente para o celular, braços soltos. Espere o ajuste.';
export const FALA_DO_FIM = 'Pronto. Sessão completa.';

/**
 * As poses, na ordem de execução.
 *
 * A ordem NÃO é agrupada por assunto — é uma rotação contínua 0° → 90° → 180°
 * → 270°, sempre para a esquerda. Ele gira sempre para o mesmo lado sem sair
 * da marca do chão, e a sessão inteira sai em menos de cinco minutos. Agrupar
 * por bloco seria mais bonito de ler e faria ele girar seis vezes.
 *
 * `bloco` existe para a tela poder dizer a que pergunta a foto responde, não
 * para reordenar coisa nenhuma.
 *
 * Em 04/11/2026 (docs/fotos/01-captura.md): braços um palmo afastados nas
 * relaxadas, cabeça e perna fixas no abdômen, pés no T no duplo bíceps de
 * costas, "marque passo" no perfil natural, e uma frase de voz para cada uma.
 * As nove continuam: a auditoria sugeriu tirar a das mãos na cintura, e ele
 * decidiu mantê-la (04/11).
 *
 * Na revisão de quem fotografa (04/11, F16 e F21–F22): cada pose ganhou a
 * linha que quem fotografa confere (`confira`); no abdômen, "olhe para o
 * celular" virou "olhe para a frente" — com a lente no quadril, olhar para o
 * celular baixava a cabeça uns 28°, o erro que a frase queria evitar; e na das
 * mãos na cintura a voz pede "mãos só apoiadas, sem apertar", porque ela vinha
 * virando uma pinça da dobra.
 */
export const PROTOCOLO: Pose[] = [
  {
    id: 'frente-relaxado', n: 'Frente relaxado', bloco: 'referência', giro: 0,
    bracos: 'um palmo do corpo',
    como: [
      'Braços soltos, afastados um palmo do corpo, palmas para o corpo.',
      'Olhe para a frente. Não contraia nada — nem abdômen, nem ombro.',
      'Solte o ar normalmente e segure, sem forçar, até o disparo.'
    ],
    voz: 'Braços soltos, um palmo do corpo. Solte o ar e segure.',
    confira: 'pés no T · braços um palmo do corpo',
    revela: 'cintura, simetria de ombro, distribuição de gordura',
    erro: 'colar os braços no corpo, que esconde o contorno da cintura'
  },
  {
    id: 'frente-duplo-biceps', n: 'Frente duplo bíceps', bloco: 'músculo', giro: 0,
    bracos: 'cotovelos na altura do ombro',
    como: [
      'Suba os braços até os cotovelos ficarem na altura do ombro, punhos fechados.',
      'Abra as costas e mantenha a cintura contraída para dentro.',
      'Suba devagar: movimento brusco muda o enquadramento.'
    ],
    voz: 'Cotovelos na altura do ombro. Contraia.',
    confira: 'cotovelos na altura do ombro · pés no T',
    revela: 'braço, ombro, largura do dorsal, peito',
    erro: 'cotovelo alto demais, que some com o trapézio'
  },
  {
    id: 'frente-abdomen-coxa', n: 'Abdômen e coxa', bloco: 'músculo', giro: 0,
    bracos: 'mãos atrás da cabeça',
    como: [
      'Mãos atrás da cabeça, dedos entrelaçados, cotovelos abertos.',
      'Perna esquerda meio pé à frente — sempre a esquerda —, joelho travado, coxa contraída.',
      'Olhe para a frente, na altura dos olhos, queixo paralelo ao chão.',
      'Solte todo o ar e contraia o abdômen com o pulmão vazio.'
    ],
    voz: 'Mãos atrás da cabeça. Perna esquerda meio pé à frente. Olhe para a frente. Solte todo o ar e contraia.',
    confira: 'queixo reto, olhar para a frente · perna esquerda meio pé à frente',
    revela: 'definição abdominal e serrátil — o mais sensível a gordura',
    erro: 'baixar a cabeça para olhar o abdômen, que encurta a dobra dele'
  },
  {
    id: 'perfil-direito', n: 'Perfil direito', bloco: 'referência', giro: 90,
    bracos: 'estendidos à frente',
    como: [
      'Gire 90° para a sua esquerda sobre a marca: o lado direito fica para a câmera. Os pés continuam no T.',
      'Estenda os dois braços à frente, na altura do ombro — eles saem da frente da cintura.',
      'Olhe para a frente. Postura natural, sem empinar nem encolher a barriga.'
    ],
    voz: 'Braços esticados à frente, na altura do ombro. Olhe para a frente.',
    confira: 'um braço esconde o outro · mãos dentro da tela',
    revela: 'espessura da cintura de perfil — onde a mudança aparece primeiro',
    erro: 'girar 60° em vez de 90° e achar que emagreceu'
  },
  {
    id: 'perfil-direito-postura', n: 'Perfil direito natural', bloco: 'postura', giro: 90,
    bracos: 'soltos ao lado',
    como: [
      'Mesma posição, mas com os braços caídos naturalmente ao lado.',
      'Marque passo três vezes sem sair do T, e pare — assim você cai na sua postura real.',
      'Olhe para um ponto fixo à frente, na altura dos olhos.'
    ],
    voz: 'Braços soltos. Marque passo três vezes, sem sair do lugar. Olhe para a frente.',
    confira: 'pés na marca · olhar para a frente, sem posar',
    revela: 'alinhamento de orelha, ombro, quadril e tornozelo',
    erro: 'corrigir a postura na hora e perder o dado'
  },
  {
    id: 'costas-relaxado', n: 'Costas relaxado', bloco: 'referência', giro: 180,
    bracos: 'um palmo do corpo',
    como: [
      'Gire mais 90° para a esquerda. Braços soltos, afastados um palmo do corpo, palmas para o corpo.',
      'Cabeça neutra, olhando para a frente — não para baixo.',
      'Ombros onde eles caem sozinhos.'
    ],
    voz: 'Braços soltos, um palmo do corpo. Cabeça reta.',
    confira: 'braços um palmo do corpo · cabeça reta',
    revela: 'simetria das escápulas, lombar, contorno do glúteo',
    erro: 'olhar por cima do ombro e torcer o tronco'
  },
  {
    id: 'costas-duplo-biceps', n: 'Costas duplo bíceps', bloco: 'músculo', giro: 180,
    bracos: 'cotovelos abertos',
    como: [
      'Mesma subida de braço da segunda pose, agora de costas: cotovelos na altura do ombro.',
      'Afaste as escápulas como se puxasse os cotovelos para trás e para fora.',
      'Pés juntos no T, os dois apoiados no chão.'
    ],
    voz: 'Cotovelos na altura do ombro. Pés juntos. Abra as costas.',
    confira: 'cotovelos na altura do ombro · pés juntos no T',
    revela: 'espessura do dorsal, trapézio e erector',
    erro: 'cotovelos em alturas diferentes'
  },
  {
    id: 'costas-maos-na-cintura', n: 'Costas mãos na cintura', bloco: 'músculo', giro: 180,
    bracos: 'polegares na cintura',
    como: [
      'Polegares logo acima da crista ilíaca, mãos abertas e só apoiadas, sem apertar a pele.',
      'Empurre os cotovelos para a frente e para fora, abrindo a largura.',
      'Cintura contraída — o contraste é a informação aqui.'
    ],
    voz: 'Polegares logo acima do osso do quadril. Mãos só apoiadas, sem apertar.',
    confira: 'mãos só apoiadas, sem beliscar · cintura à mostra',
    revela: 'a relação ombro/cintura, que muda mesmo com o peso parado',
    erro: 'subir as mãos para as costelas e falsear a largura'
  },
  {
    id: 'perfil-esquerdo', n: 'Perfil esquerdo', bloco: 'referência', giro: 270,
    bracos: 'estendidos à frente',
    como: [
      'Complete o giro, mais 90° para a esquerda. Lado esquerdo para a câmera, mesma execução do perfil direito.',
      'Os dois perfis existem porque o corpo é assimétrico.',
      'Confira que os pés voltaram para o T antes do disparo.'
    ],
    voz: 'Braços esticados à frente, na altura do ombro. Olhe para a frente.',
    confira: 'um braço esconde o outro · mãos dentro da tela',
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
/**
 * O quadro preto (F78): capturar antes de o vídeo ter o primeiro quadro produz
 * imagem preta, e ele está a três metros. Abaixo deste brilho médio (0 a 255) a
 * foto não é guardada: a pose volta para o fim da fila.
 */
export const BRILHO_DO_PRETO = 12;
export function quaseTodoPreto(brilho: number | null | undefined): boolean {
  return typeof brilho === 'number' && brilho < BRILHO_DO_PRETO;
}

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
