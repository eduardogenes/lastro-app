// Peso, cintura e as três regras de ajuste da dieta.
//
// O peso do dia não decide nada: oscila com água, sal e intestino. Quem decide
// é a MÉDIA DA SEMANA e o ritmo entre semanas — e é por isso que estas funções
// recebem a série inteira de marcas, nunca uma medida solta.
//
// Recebem dado e devolvem veredito: não leem estado nem tocam em tela. Foi essa
// separação que permitiu testar os limites exatos (0,15 · 0,40 · 1,5 cm) sem
// subir um DOM.

import { fmtDate, fmtDec, fmtDec2, fmtSig2, weekStart } from './formato';
import type { Marca, QualMarca } from './tipos';

const DIA = 86400000;

// ---------- o que o corpo mede ----------
// Uma tabela só, e todo mundo a enumera daqui: a fusão (`sincronia.ts`), a
// migração (`migracoes.ts`), o padrão do boot e a lista branca da importação
// (`src/main.jsx`). Duas listas divergiriam no dia em que uma grandeza nova
// entrasse — e a que ficasse para trás perderia o dado em silêncio, que é
// exatamente o defeito que a lista branca da cópia de segurança acabou de
// pagar.

/** Uma grandeza medida do corpo, com a unidade e se a entrada pode ficar vazia. */
export interface MedidaDoCorpo {
  k: QualMarca;
  /** o nome dela, para a tela não ter uma tabela própria */
  n: string;
  u: 'kg' | 'cm' | '%' | 'L';
  /** sai da balança de bioimpedância, na mesma leitura das outras `bio` */
  bio: boolean;
  /**
   * A entrada exige valor.
   *
   * Água corporal total é a única opcional das cinco da bioimpedância: foi a
   * resposta dele, e não uma leniência do app. Aqui é declaração de domínio —
   * a tela a obedece, não a decide.
   */
  obrigatorio: boolean;
  /**
   * Medida com FITA, e se ela já vem LIGADA na tela (`'ligada'`) ou espera ele
   * ligar (`'desligada'`). `false` é o que não sai de fita: a balança.
   *
   * Os seis pontos e quais vêm ligados são da Direção D (`corpo.html`), tirados
   * da resposta dele: "braço, cintura, essas coisas principais que dá pra eu
   * medir sozinho" (P6). Cintura e braço, que ele nomeou, vêm ligados; coxa,
   * panturrilha, peito e quadril esperam um toque. Ligar não cria cobrança:
   * nenhuma delas tem frequência prescrita, e nenhuma entra em regra — são
   * leitura.
   */
  fita: false | 'ligada' | 'desligada';
  /**
   * Onde o stepper parte quando ainda não há medida nenhuma.
   *
   * Peso e cintura são os valores que o app já usava (75 kg e 85 cm). Os pontos
   * novos partem do meio da faixa comum de um adulto, como a régua da D abre
   * "sem última medida" — é partida, não referência, e o teclado próprio está
   * ao lado para o valor que estiver longe. Só a balança da bioimpedância não
   * tem: a leitura dela entra digitada, sem stepper.
   */
  partida?: number;
}

export const MEDIDAS_DO_CORPO: MedidaDoCorpo[] = [
  { k: 'peso',          n: 'peso',                      u: 'kg', bio: false, obrigatorio: true,  fita: false,       partida: 75 },
  { k: 'cintura',       n: 'cintura',                   u: 'cm', bio: false, obrigatorio: true,  fita: 'ligada',    partida: 85 },
  { k: 'bioPeso',       n: 'peso na bioimpedância',     u: 'kg', bio: true,  obrigatorio: true,  fita: false },
  { k: 'bioMusculo',    n: 'massa muscular esquelética', u: 'kg', bio: true,  obrigatorio: true,  fita: false },
  { k: 'bioGordura',    n: 'massa de gordura',          u: 'kg', bio: true,  obrigatorio: true,  fita: false },
  { k: 'bioGorduraPct', n: 'percentual de gordura',     u: '%',  bio: true,  obrigatorio: true,  fita: false },
  { k: 'bioAgua',       n: 'água corporal total',       u: 'L',  bio: true,  obrigatorio: false, fita: false },
  // As medidas com fita além da cintura. Entram SEM migração, pelo contrato de
  // `normalizaEstado()`: campo novo e vazio recebe padrão no boot e na
  // importação, e a fusão e a cópia de segurança já enumeram esta tabela.
  { k: 'braco',         n: 'braço',                     u: 'cm', bio: false, obrigatorio: true,  fita: 'ligada',    partida: 35 },
  { k: 'coxa',          n: 'coxa',                      u: 'cm', bio: false, obrigatorio: true,  fita: 'desligada', partida: 56 },
  { k: 'panturrilha',   n: 'panturrilha',               u: 'cm', bio: false, obrigatorio: true,  fita: 'desligada', partida: 37 },
  { k: 'peito',         n: 'peito',                     u: 'cm', bio: false, obrigatorio: true,  fita: 'desligada', partida: 100 },
  { k: 'quadril',       n: 'quadril',                   u: 'cm', bio: false, obrigatorio: true,  fita: 'desligada', partida: 96 }
];

/** As chaves de `S.body`, na ordem da tabela. */
export const MARCAS_DO_CORPO: QualMarca[] = MEDIDAS_DO_CORPO.map(function (m) { return m.k; });

/** Só as da balança de bioimpedância — as cinco que a migração 9 → 10 abriu. */
export const MARCAS_DA_BIO: QualMarca[] =
  MEDIDAS_DO_CORPO.filter(function (m) { return m.bio; }).map(function (m) { return m.k; });

/** As medidas com fita, na ordem da tabela — a cintura é a primeira. */
export const MEDIDAS_DE_FITA: MedidaDoCorpo[] =
  MEDIDAS_DO_CORPO.filter(function (m) { return m.fita !== false; });

/** A linha da tabela de uma grandeza, ou `null` para chave desconhecida. */
export function medidaDoCorpo(k: string): MedidaDoCorpo | null {
  return MEDIDAS_DO_CORPO.filter(function (m) { return m.k === k; })[0] || null;
}

/**
 * Como ele mediu este ponto da última vez que disse: o `onde` da medida MAIS
 * RECENTE que tem um. Medida sem texto não apaga o lembrete — ele é guardado
 * "na primeira vez" e volta nas seguintes, que normalmente vêm sem texto.
 */
export function ondeMediu(serie: Marca[] | null | undefined): string | null {
  let melhor: Marca | null = null;
  (Array.isArray(serie) ? serie : []).forEach(function (x) {
    if (!x || typeof x.onde !== 'string' || !x.onde.trim()) return;
    if (!melhor || x.t > melhor.t) melhor = x;
  });
  return melhor ? (melhor as Marca).onde!.trim() : null;
}

/** Uma semana de marcas, já resumida na média. */
export interface Semana {
  /** segunda-feira 00:00 daquela semana */
  w: number;
  /** quantas medidas entraram na média */
  n: number;
  /** a média */
  v: number;
}

export interface Ritmo {
  W: Semana[];
  ok: boolean;
  last?: Semana;
  ref?: Semana;
  dias?: number;
  /** ganho em kg por semana */
  kgSem?: number;
  /** a base tem pelo menos 12 dias, que é o que a regra pede */
  duasSemanas?: boolean;
}

export interface Cintura {
  W: Semana[];
  last: Semana;
  ref: Semana;
  dias: number;
  delta: number;
  /** variação normalizada para 30 dias */
  mes: number;
}

export interface Veredito {
  k: 'mais' | 'menos' | 'manter' | 'observar' | 'faltam';
  t: string;
  p: string;
  /** o que ainda falta para o passo valer, quando o peso já pediu revisão */
  falta?: 'aderencia' | 'gordura';
}

/** O passo de 150 kcal que um veredito PROPÕE. Não é o estado da dieta. */
export type Ajuste = -1 | 0 | 1;

/**
 * Os sinais que não saem da balança.
 *
 * A regra do nutricionista é multifatorial de propósito: peso sozinho dispara
 * REVISÃO, nunca o corte. Quem não tiver o sinal manda `null` — e o veredito
 * diz o que falta em vez de fingir que decidiu.
 */
export interface Sinais {
  /** e1RM subindo. Já existe no app, vem das cargas registradas. */
  forcaSubindo?: boolean;
  /** dias com registro de comida nos últimos 14; `null` = não medido */
  diasRegistrados?: number | null;
  /** a resposta do fechamento semanal, comparando com 2 semanas atrás */
  gorduraVisual?: 'sim' | 'nao' | 'incerto' | null;
}

/**
 * Uma leitura de gordura visual, feita comparando duas fotos.
 *
 * Não é análise sofisticada: é a pergunta que o nutricionista pediu para o
 * fechamento da semana — "comparando com 2 semanas atrás, a gordura visual
 * aumentou claramente?". Ela é a segunda camada de confirmação que substituiu
 * a cintura, e sem ela o peso não corta.
 */
export interface LeituraDeGordura {
  /** a data da sessão MAIS NOVA do par comparado; é a chave natural */
  d: string;
  /** a data da sessão mais antiga do par */
  de: string;
  v: 'sim' | 'nao' | 'incerto';
  /** quando ele respondeu */
  t: number;
}

/** Quantos dias uma leitura continua valendo para a decisão. */
export const VALIDADE_LEITURA = 14;

/** O intervalo em que a pergunta faz sentido: "duas semanas atrás", com folga. */
export const JANELA_MIN = 10, JANELA_MAX = 28;

/**
 * A leitura que vale para a decisão de hoje.
 *
 * Envelhece de propósito. A regra compara duas semanas de peso, e uma resposta
 * dada há um mês fala de outro corpo — usá-la seria confirmar o presente com
 * evidência do passado. Sem leitura recente o veredito diz o que falta, que é
 * o comportamento conservador e o que a regra manda na ausência do sinal.
 *
 * A validade conta da sessão MAIS NOVA do par, não de quando ele respondeu:
 * responder hoje sobre um par de três meses atrás não torna o par recente.
 */
export function leituraVigente(
  leituras: LeituraDeGordura[] | null | undefined,
  agora: number = Date.now()
): 'sim' | 'nao' | 'incerto' | null {
  if (!Array.isArray(leituras) || !leituras.length) return null;
  const corte = agora - VALIDADE_LEITURA * DIA;
  let melhor: LeituraDeGordura | null = null;
  leituras.forEach(function (x) {
    if (!x || !x.d || !x.v) return;
    const quando = new Date(x.d + 'T12:00:00').getTime();
    if (!isFinite(quando) || quando < corte) return;
    if (!melhor || x.d > melhor.d) melhor = x;
  });
  return melhor ? (melhor as LeituraDeGordura).v : null;
}

/** Acima disto, duas semanas seguidas pedem revisão. */
export const ALTO = 0.40;
/** Abaixo disto, duas semanas seguidas com força parada pedem mais comida. */
export const BAIXO = 0.10;
/** A faixa-alvo consolidada. Alvo de eficiência, não limite de velocidade. */
export const ALVO_MIN = 0.15, ALVO_MAX = 0.30;
/** Uma semana precisa de pelo menos duas pesagens para a média dela valer. */
export const MIN_PESAGENS = 2;
/** Dias registrados em 14 para uma mudança automática ser permitida (~80%). */
export const MIN_REGISTRADOS = 11;

export function ajusteDoVeredito(v: Veredito): Ajuste {
  if (v.k === 'mais') return 1;
  if (v.k === 'menos') return -1;
  return 0;
}

export interface TaxaSemanal {
  /** domingo 00:00 da semana que fechou o intervalo */
  w: number;
  /** ganho em kg NAQUELA semana */
  kg: number;
}

/**
 * A diferença de duas médias SEM o ruído do ponto flutuante.
 *
 * Os limites da regra são exatos (F214): 0,10 não é "abaixo de 0,10". Mas
 * 70,2 − 70,1 em ponto flutuante dá 0,0999999…, e em 61 de 400 sequências de
 * pesagem a taxa exata de 0,10 caía abaixo do limite e a regra mandava comer
 * mais. Arredondar a um milionésimo de quilo tira o ruído da conta sem mexer
 * em nenhuma diferença que uma balança consiga medir.
 */
export function semRuido(kg: number): number { return Math.round(kg * 1e6) / 1e6; }

/**
 * As taxas semana a semana — e não uma taxa média sobre duas semanas.
 *
 * Esta é a correção do primeiro erro: "por 2 semanas" é PERSISTÊNCIA, não
 * janela de medição. Uma média de duas semanas deixa `+0,10` seguido de
 * `+0,75` dar 0,425 e disparar corte por causa de uma semana só de água.
 *
 * Devolve `null` quando não dá para afirmar nada: semana com menos de
 * `MIN_PESAGENS` não é média, e buraco entre semanas não é sequência.
 */
export function taxasSemanais(peso: Marca[], quantas: number = 2): TaxaSemanal[] | null {
  const W = mediasSemanais(peso).filter(x => x.n >= MIN_PESAGENS);
  if (W.length < quantas + 1) return null;
  const ult = W.slice(-(quantas + 1));
  for (let i = 1; i < ult.length; i++) {
    // tolerância de 2 h: virada de horário de verão não é buraco de semana
    if (Math.abs(ult[i].w - ult[i - 1].w - 7 * DIA) > 2 * 3600000) return null;
  }
  const out: TaxaSemanal[] = [];
  for (let i = 1; i < ult.length; i++) out.push({ w: ult[i].w, kg: semRuido(ult[i].v - ult[i - 1].v) });
  return out;
}

/**
 * A regra consolidada do nutricionista, em uma função pura.
 *
 * Três mudanças em relação à versão anterior, e todas vieram dele:
 *
 * 1. **Duas semanas CONSECUTIVAS**, não a média de duas. Ver `taxasSemanais`.
 * 2. **Peso sozinho não corta.** `>0,40` por duas semanas abre revisão; o
 *    corte só sai com adesão registrada E gordura visual claramente maior.
 * 3. **Cintura saiu do algoritmo.** Ela tinha prioridade e vetava o peso;
 *    agora é informação complementar, porque medir não está acontecendo e as
 *    fotos cobrem melhor a mesma pergunta. `cinturaMes` continua para a tela.
 *
 * O caso omisso é sempre `observar`: não alterar, continuar olhando. É o que
 * ele pediu em "CASO CONTRÁRIO", e é o que o app já fazia em todo o resto.
 *
 * **Os títulos falam uma gramática só** (§6.1 da frente 3): o veredito é o que
 * a regra faz com a comida, e o que vem depois dos dois-pontos é por quê.
 * "Não mexer" e não "Manter": manter é o que ele faria, não mexer é o que a
 * regra faz — ela tem autoridade sobre o plano, não sobre o prato. E o título
 * separa o que a prosa sozinha separava: "Observar" nomeava três situações, e
 * só numa delas havia algo a fazer agora. A prosa `p` não muda uma palavra.
 */
export function veredito(
  body: { peso: Marca[]; cintura: Marca[] },
  sinais: Sinais = {}
): Veredito {
  const taxas = taxasSemanais(body.peso, 2);
  if (!taxas)
    return { k: 'faltam', t: 'Não mexer: faltam pesagens', p: 'Registre o peso 3 a 4 vezes por semana. A regra pede duas semanas seguidas de média, e média de uma pesagem só não é média.' };

  const [ante, ult] = taxas;
  const reg = sinais.diasRegistrados;
  const aderenciaOk = typeof reg === 'number' ? reg >= MIN_REGISTRADOS : false;
  const semRegistro = typeof reg !== 'number' || reg < MIN_REGISTRADOS;

  // ---------- ganho rápido, duas semanas seguidas ----------
  if (ante.kg > ALTO && ult.kg > ALTO) {
    const mov = `A média subiu ${fmtDec2(ante.kg)} e depois ${fmtDec2(ult.kg)} kg — duas semanas seguidas acima de ${fmtDec(ALTO)}.`;
    if (semRegistro)
      return { k: 'observar', t: 'Não mexer: falta registro de comida', falta: 'aderencia',
               p: `${mov} Mas não há registro suficiente dos últimos 14 dias para saber se o ganho veio da dieta ou de saídas dela. Tirar comida do plano agora puniria os dias em que você seguiu.` };
    if (sinais.gorduraVisual === 'sim')
      return { k: 'menos', t: 'Comer menos 150 kcal', p: `${mov} Com adesão registrada e aumento visual claro de gordura, o passo é −150 kcal.` };
    if (sinais.gorduraVisual === 'nao')
      // Fora da tabela da frente: aqui a taxa NÃO está na faixa (está acima),
      // e o porquê é o da prosa — as fotos.
      return { k: 'manter', t: 'Não mexer: as fotos não mostram piora', p: `${mov} As fotos não mostram piora, então o ganho está comprando músculo. Ganho acima da faixa não é ruim por si.` };
    // "Incerto" também é resposta (a D, `semana.html`, estado 5): com ela a
    // regra mantém, e dizer que a leitura FALTA pediria de novo o que ele já deu.
    if (sinais.gorduraVisual === 'incerto')
      return { k: 'observar', t: 'Não mexer: a avaliação das fotos ficou incerta',
               p: `${mov} A avaliação das fotos foi "incerto", e incerto também é resposta: com ela, a regra mantém a comida como está.` };
    // A última frase está escrita porque é a parte da regra que mais surpreende.
    return { k: 'observar', t: 'Não mexer: falta a avaliação das fotos', falta: 'gordura',
             p: `${mov} Sem a resposta sobre a gordura visual, não há corte. Se as fotos não mostrarem piora, o certo é manter: o ganho está comprando músculo.` };
  }

  // ---------- ganho travado, duas semanas seguidas ----------
  if (ante.kg < BAIXO && ult.kg < BAIXO) {
    const mov = `A média ficou em ${fmtDec2(ante.kg)} e ${fmtDec2(ult.kg)} kg por semana — duas seguidas abaixo de ${fmtDec(BAIXO)}.`;
    if (sinais.forcaSubindo)
      return { k: 'observar', t: 'Não mexer: peso parado com carga subindo', p: `${mov} Mas a força estimada está subindo: peso parado com carga subindo é recomposição, e mexer na comida atropelaria o que está dando certo.` };
    if (!aderenciaOk)
      return { k: 'observar', t: 'Não mexer: falta registro de comida', falta: 'aderencia',
               p: `${mov} Sem registro suficiente dos últimos 14 dias não dá para saber se a comida prescrita está sendo comida.` };
    return { k: 'mais', t: 'Comer mais 150 kcal', p: `${mov} Com a performance parada e a adesão registrada, o passo é +150 kcal.` };
  }

  // ---------- dentro da faixa, ou em qualquer outro lugar ----------
  if (ult.kg >= ALVO_MIN && ult.kg <= ALVO_MAX)
    return { k: 'manter', t: 'Não mexer: a taxa está na faixa', p: `A média está subindo ${fmtDec2(ult.kg)} kg por semana, dentro da faixa-alvo de ${fmtDec(ALVO_MIN)} a ${fmtDec(ALVO_MAX)}.` };

  return { k: 'observar', t: 'Não mexer: uma semana sozinha não decide', p: `A média está em ${fmtDec2(ult.kg)} kg por semana. Não é motivo para mexer na comida — uma semana isolada fora da faixa é ruído, e a regra pede duas seguidas.` };
}

/** Um dos portões da regra, com o estado na PALAVRA (§6.2 da frente 3). */
export interface Portao {
  k: 'taxa' | 'forca' | 'adesao' | 'visual';
  /** a condição da regra está satisfeita */
  ok: boolean;
  /** "Taxa: cumprida — +0,07 e +0,03 kg/semana" */
  t: string;
  /** o que produziu o estado, e o que falta */
  d: string;
  /** para onde o botão do portão leva, quando há botão */
  acao?: 'por-em-dia' | 'responder' | 'ver-forca';
}

/** O que os portões leem além do peso — do treino, da comida e das fotos. */
export interface FontesDosPortoes {
  /** a tendência de força, quando há carga para medir */
  forca?: { delta: number; base: number; ok: boolean } | null;
  /** a força foi assumida na mão */
  forcaManual?: boolean | null;
  /** o par de fotos que a pergunta da avaliação visual compara, se há um */
  par?: { de: number; ate: number } | null;
}

const plural = (n: number, um: string, varios: string) => n + ' ' + (n === 1 ? um : varios);

/**
 * Os portões da regra para a semana, na ordem do desenho.
 *
 * Só existem nos dois ramos que PODEM produzir passo, e cada ramo tem os seus:
 * peso parado pede taxa, força e adesão; peso subindo rápido pede taxa, adesão e
 * a avaliação visual das fotos — a força não entra no corte. Nos outros ramos
 * nenhum portão decide nada, e mostrar portões ali seria sugerir uma decisão
 * que a regra não tem: devolve `null`.
 *
 * O estado está na palavra — "cumprida", "falta" —, não no ícone. E "Força:
 * cumprida — não está subindo" é a linha mais estranha do produto e está certa:
 * o portão da força se cumpre quando a força NÃO sobe.
 */
export function portoesDaRegra(
  body: { peso: Marca[] },
  sinais: Sinais = {},
  fontes: FontesDosPortoes = {}
): Portao[] | null {
  const taxas = taxasSemanais(body.peso, 2);
  if (!taxas) return null;
  const [ante, ult] = taxas;
  const travado = ante.kg < BAIXO && ult.kg < BAIXO;
  const rapido = ante.kg > ALTO && ult.kg > ALTO;
  if (!travado && !rapido) return null;

  const semanas = [ante.w - 7 * DIA, ante.w, ult.w].map(fmtDate).join(', ');
  const out: Portao[] = [{
    k: 'taxa', ok: true,
    t: 'Taxa: cumprida — ' + fmtSig2(ante.kg) + ' e ' + fmtSig2(ult.kg) + ' kg/semana',
    d: (travado ? 'duas semanas seguidas abaixo de ' + fmtDec2(BAIXO) : 'duas semanas seguidas acima de ' + fmtDec2(ALTO)) +
       ' · três semanas com média válida (' + semanas + ')'
  }];

  if (travado) {
    const f = fontes.forca;
    const conta = f && f.ok
      ? (f.delta >= 0 ? '+' : '−') + (Math.abs(f.delta) * 100).toFixed(1).replace('.', ',') + '% em 2 semanas, sobre ' +
        plural(f.base, 'exercício', 'exercícios')
      : 'sem carga registrada suficiente para medir';
    const subindo = !!sinais.forcaSubindo;
    out.push({
      k: 'forca', ok: !subindo,
      t: subindo ? 'Força: falta — está subindo' : 'Força: cumprida — não está subindo',
      d: fontes.forcaManual != null
        ? 'assumido na mão, porque o app estava cego para as cargas'
        : conta + (f && f.ok && !subindo ? ' — abaixo de 1%, que é ruído de anilha' : ''),
      acao: 'ver-forca'
    });
  }

  const n = typeof sinais.diasRegistrados === 'number' ? sinais.diasRegistrados : 0;
  out.push(n >= MIN_REGISTRADOS
    ? { k: 'adesao', ok: true, t: 'Adesão: cumprida — ' + n + ' dias de 14',
        d: n === MIN_REGISTRADOS ? 'o mínimo da regra. ' + (n - 1) + ' de 14 não bastaria' : 'a regra pede ' + MIN_REGISTRADOS }
    : { k: 'adesao', ok: false, t: 'Adesão: falta — ' + plural(n, 'dia', 'dias') + ' de 14',
        d: 'a regra pede ' + MIN_REGISTRADOS + '. ' +
           (MIN_REGISTRADOS - n === 1 ? 'Falta 1 dia' : 'Faltam ' + (MIN_REGISTRADOS - n) + ' dias') +
           ' com consumo conhecido, e ' + (14 - n) + ' dos 14 ainda podem ser preenchidos',
        acao: 'por-em-dia' });

  if (rapido) {
    const v = sinais.gorduraVisual;
    const par = fontes.par;
    const sobre = par
      ? 'há par válido: ' + fmtDate(par.de) + ' e ' + fmtDate(par.ate) + ', ' +
        plural(Math.round(Math.abs(par.ate - par.de) / DIA), 'dia', 'dias') + ' — a pergunta vale para pares de 10 a 28 dias'
      : 'ainda não há par de fotos de 10 a 28 dias — a pergunta precisa dele';
    out.push(v === 'sim'
      ? { k: 'visual', ok: true, t: 'Avaliação visual: cumprida — aumentou claramente', d: sobre }
      : v === 'nao'
        ? { k: 'visual', ok: false, t: 'Avaliação visual: as fotos não mostram piora',
            d: 'o certo é manter: o ganho está comprando músculo' }
        : v === 'incerto'
          ? { k: 'visual', ok: false, t: 'Avaliação visual: incerto',
              d: '"incerto" também é resposta: com ela, a regra mantém a comida como está' }
          : { k: 'visual', ok: false, t: 'Avaliação visual: falta — sem resposta', d: sobre,
              acao: par ? 'responder' : undefined });
  }
  return out;
}

/** Uma semana como a regra a lê, para o vazio dizer exatamente o que falta. */
export interface SemanaDaRegra {
  /** domingo 00:00 */
  w: number;
  n: number;
  /** "27/09 a 03/10" */
  intervalo: string;
  /** "média válida" · "em curso · faltam 2 dias" · "buraco: quebra a sequência" */
  estado: string;
  valida: boolean;
}

/**
 * As últimas semanas, com o motivo de cada reprovação (§6.4 da frente 3).
 *
 * O vazio da régua não é tela em branco: é a lista das semanas e o que faltou em
 * cada uma. Uma semana vale com `MIN_PESAGENS`; a que está em curso ainda pode
 * valer; a que passou sem isso quebra a sequência — e é por ela que a regra não
 * decide.
 */
export function semanasDaRegra(peso: Marca[], agora: number, quantas: number = 4): SemanaDaRegra[] {
  const por: Record<number, number> = {};
  peso.forEach(x => { const k = weekStart(x.t); por[k] = (por[k] || 0) + 1; });
  const esta = weekStart(agora);
  const out: SemanaDaRegra[] = [];
  for (let i = 0; i < quantas; i++) {
    const w = esta - i * 7 * DIA;
    const n = por[w] || 0;
    const valida = n >= MIN_PESAGENS;
    const faltam = 6 - new Date(agora).getDay();
    out.push({
      w, n, valida,
      intervalo: fmtDate(w) + ' a ' + fmtDate(w + 6 * DIA),
      estado: valida ? 'média válida'
        : i === 0 ? 'em curso' + (faltam > 0 ? ' · ' + (faltam === 1 ? 'falta 1 dia' : 'faltam ' + faltam + ' dias') : '')
        : 'buraco: quebra a sequência'
    });
  }
  return out;
}

/** Uma linha de "Taxa, semana a semana" no destino Evolução. */
export interface TaxaDaEvolucao {
  w: number;
  intervalo: string;
  /** "em curso · 3 pesagens" · "3 pesagens" */
  nota: string;
  /** a taxa da semana contra a anterior, quando as duas têm média; senão `null` */
  kg: number | null;
  /** "abaixo do alvo" · "no alvo" · "acima do alvo" · ou por que não há taxa */
  classe: string;
}

/** O que o destino Evolução desenha: a curva, os pontos e as taxas. */
export interface LeituraDaEvolucao {
  /** médias das semanas que a regra lê (com `MIN_PESAGENS`), em ordem */
  semanas: Semana[];
  /** as pesagens do dia, no intervalo */
  pontos: Marca[];
  /** de onde a leitura começa e onde termina (agora) */
  de: number;
  ate: number;
  /** as últimas quatro semanas, da mais recente para trás */
  taxas: TaxaDaEvolucao[];
  /** quantas pesagens entraram */
  n: number;
}

/**
 * A leitura do peso ao longo do tempo — o destino Evolução (a D, `corpo.html`,
 * estado 8; o nome é o da §1.7 da frente 3, decidido pelo dono em 06/10).
 *
 * A linha é o que a regra lê: média semanal só onde a semana tem `MIN_PESAGENS`;
 * semana sem isso não ganha ponto na linha, e a linha não atravessa o buraco
 * fingindo continuidade. Os pontos são as pesagens do dia, para a oscilação
 * diária ficar à vista ao lado da média — é ela que explica por que um dia não
 * decide nada.
 */
export function leituraDaEvolucao(peso: Marca[], agora: number, semanas: number = 9): LeituraDaEvolucao {
  const de = weekStart(agora) - (semanas - 1) * 7 * DIA;
  const pontos = peso.filter(x => x.t >= de && x.t <= agora).sort((a, b) => a.t - b.t);
  const W = mediasSemanais(pontos);
  const por: Record<number, Semana> = {};
  W.forEach(w => { por[w.w] = w; });
  const esta = weekStart(agora);
  const taxas: TaxaDaEvolucao[] = [];
  for (let i = 0; i < 4; i++) {
    const w = esta - i * 7 * DIA;
    const s = por[w];
    const ant = por[w - 7 * DIA];
    const n = s ? s.n : 0;
    const pes = n === 0 ? 'nenhuma pesagem' : n + (n === 1 ? ' pesagem' : ' pesagens');
    const kg = s && ant && s.n >= MIN_PESAGENS && ant.n >= MIN_PESAGENS ? semRuido(s.v - ant.v) : null;
    taxas.push({
      w, intervalo: fmtDate(w) + ' a ' + fmtDate(w + 6 * DIA),
      nota: (i === 0 ? 'em curso · ' : '') + pes,
      kg,
      classe: kg == null
        ? (n < MIN_PESAGENS ? 'sem taxa: a semana não tem média' : 'sem taxa: a semana anterior não tem média')
        : kg < ALVO_MIN ? 'abaixo do alvo' : kg > ALVO_MAX ? 'acima do alvo' : 'no alvo'
    });
  }
  return { semanas: W.filter(w => w.n >= MIN_PESAGENS), pontos, de, ate: agora, taxas, n: pontos.length };
}

/** Agrupa marcas por semana e devolve a média de cada uma, em ordem. */
export function mediasSemanais(arr: Marca[]): Semana[] {
  const m: Record<number, number[]> = {};
  arr.forEach(x => { const k = weekStart(x.t); (m[k] = m[k] || []).push(x.v); });
  return Object.keys(m).map(Number).sort((a, b) => a - b).map(k => ({
    w: k, n: m[k].length,
    v: m[k].reduce((a, b) => a + b, 0) / m[k].length
  }));
}

/** Ritmo em kg por semana, medido sobre ~2 semanas de média. */
export function pesoRitmo(peso: Marca[]): Ritmo {
  const W = mediasSemanais(peso);
  if (W.length < 2) return { W, ok: false };
  const last = W[W.length - 1];
  let ref = W[W.length - 2];
  for (let i = W.length - 2; i >= 0; i--) { ref = W[i]; if (last.w - W[i].w >= 12 * DIA) break; }
  const dias = (last.w - ref.w) / DIA;
  return { W, ok: true, last, ref, dias, kgSem: (last.v - ref.v) / (dias / 7), duasSemanas: dias >= 12 };
}

/**
 * Variação da cintura no último mês, normalizada para 30 dias.
 * Usa média semanal como o peso: fita métrica erra de posicionamento mais do
 * que a balança varia de água, e duas medidas soltas disparariam a regra errado.
 */
export function cinturaMes(cintura: Marca[]): Cintura | null {
  const W = mediasSemanais(cintura);
  if (W.length < 2) return null;
  const last = W[W.length - 1];
  let ref = W[W.length - 2];
  for (let i = W.length - 2; i >= 0; i--) { ref = W[i]; if (last.w - W[i].w >= 24 * DIA) break; }
  const dias = (last.w - ref.w) / DIA;
  if (dias < 21) return null;
  return { W, last, ref, dias, delta: last.v - ref.v, mes: (last.v - ref.v) / (dias / 30) };
}
