// Os tipos da nutrição.
//
// A forma espelha a do treino de propósito: biblioteca + programa + log do
// dia. `alimentos` está para `EX_BASE`, `plano` está para `S.prog`, e `dia`
// está para `S.sessao`. Mesma forma, mesmas afordâncias de edição, mesma regra
// de persistência — é o que faz as duas metades parecerem um produto só em vez
// de dois apps que dividem uma tab bar.

/** Um alimento da biblioteca. Macros sempre por 100 g ou 100 ml. */
export interface Alimento {
  id: string;
  n: string;
  /** categoria de compra */
  cat: string;
  u: 'g' | 'ml';
  kcal: number;
  /** proteína */
  p: number;
  /** carboidrato */
  c: number;
  /** gordura */
  g: number;
  /** fator pronto → cru, para a lista de compras. 0 = não converte. */
  cru: number;
  /** cadastrado por ele, não veio da prescrição */
  meu?: 1;
}

/** Quando uma refeição ou um item aparece. Escopo por regra, não por duplicação. */
export type Quando = 'sempre' | 'treino' | 'alta';

/**
 * O turno em que o treino de hoje acontece.
 *
 * O plano foi desenhado em cima de treino às 6h15, e os nomes das refeições
 * carregavam isso — "Café da manhã / pós-treino" só faz sentido quando o
 * treino é de manhã. Nem sempre é.
 *
 * `manha` significa **sem deslocamento**: o dia sai exatamente como o plano o
 * escreve. Não é um horário fixo de 6h15 porque o horário do treino é dele
 * para editar, e um turno que "corrigisse" essa edição de volta seria o app
 * discordando do plano.
 */
export type Turno = 'manha' | 'tarde' | 'noite';

/** Um item dentro de uma refeição. */
export interface Item {
  /**
   * 1 quando o item é fonte de CAFEÍNA.
   *
   * Existe porque o café viajava junto com o pré-treino: num treino às 18h15
   * ele iria para as 17h45, e ele dorme por volta das 23h. A prescrição é
   * manter a cafeína de manhã — então o item não acompanha o pré quando o pré
   * cai na tarde ou na noite.
   */
  caf?: 1;
  /** id do alimento */
  f: string;
  /** quantidade na unidade do alimento */
  q: number;
  /** este item é a fonte de arroz que o ajuste calórico move */
  arroz?: boolean;
  /** só entra em dia de alta demanda */
  alta?: boolean;
}

/** Uma refeição do plano. */
export interface Refeicao {
  id: string;
  /** horário, 'HH:MM' */
  t: string;
  n: string;
  tag: string;
  quando: Quando;
  nota?: string;
  itens: Item[];
  /**
   * 1 quando esta refeição foi EMPURRADA para depois do treino de hoje.
   *
   * Marca de runtime — sai de `refeicoesDeHoje`, nunca do plano gravado. A
   * tela a usa para dizer por que o horário não é o prescrito.
   */
  movida?: 1;
}

/** O que uma refeição soma. */
export interface Totais {
  kcal: number;
  p: number;
  c: number;
  g: number;
}

/** O estado do dia de comida. Carimbado com a data, zera sozinho. */
export interface DiaComida {
  /** 'AAAA-MM-DD' — o carimbo que faz o dia zerar sozinho */
  data: string;
  /** refeições marcadas como feitas */
  done: Record<string, 1>;
  /** copos de água */
  agua: number;
  /** ajuste de porção SÓ DE HOJE, por refeição: 1 = 100% */
  escala: Record<string, number>;
  /** override da cadência de hoje */
  cadencia?: 'treino' | 'descanso' | null;
  /** hoje é dia de alta demanda */
  alta?: 1;
  /**
   * O turno do treino de hoje. Ausente = `manha`, o plano como está escrito.
   *
   * Mora aqui, junto de `escala` e `alta`, e não no plano: **editar é
   * permanente, ajustar é de hoje**. O plano em COMIDA continua dizendo 05:45
   * e 06:15, porque lá a edição vale para todo dia; aqui é só a terça em que
   * ele treinou à noite, e some sozinho na virada da data.
   */
  turno?: Turno;
}

/**
 * Um dia de comida que já passou.
 *
 * Existe porque o dia corrente era SOBRESCRITO na virada da data: o que ele
 * comeu ontem não existia em lugar nenhum. Sem isso o laço de autorregulação
 * — monitorar, comparar, ajustar — fica travado no primeiro terço, e o app
 * não consegue responder nem "qual refeição eu mais falho".
 *
 * O que NÃO tem aqui é tão decidido quanto o que tem: nada de nota de texto,
 * foto de refeição, horário de cada copo ou escala de humor. São campos que
 * apps de dieta guardam e ninguém relê — e cada campo a mais na tela de
 * entrada é atrito, que é a causa dominante de abandono de registro.
 */
export interface DiaComidaHist {
  /** 'AAAA-MM-DD' local — a chave natural */
  d: string;
  /**
   * refeição → instante em que foi marcada.
   *
   * Instante e não `1` porque é o que permite fundir: dois aparelhos marcando
   * refeições diferentes no mesmo dia precisam somar, e desmarcar precisa de
   * lápide. É a mesma forma de `S.descanso`, pelo mesmo motivo.
   */
  done: Record<string, number>;
  /** copos de água ao fechar o dia */
  agua: number;
  /** ajuste de porção por refeição: 0,5 = comeu metade */
  escala: Record<string, number>;
  cadencia?: 'treino' | 'descanso' | null;
  alta?: 1;
  turno?: Turno;
  /**
   * Os quatro totais, CONGELADOS.
   *
   * Aqui a lei "nada derivável é guardado duas vezes" não se aplica, e a razão
   * é precisa: ela pressupõe uma única leitura possível do insumo. Como o
   * plano é editável, "o total deriva do plano" quer dizer na verdade "deriva
   * do plano NO INSTANTE T" — e T é um valor que nada mais no sistema lembra.
   * Sem congelar, cortar o arroz do almoço hoje reescreveria o janeiro dele:
   * medido, 1.348 → 1.220 kcal num dia já vivido, sem ninguém ter comido
   * diferente. Isso não é omitir duplicata, é mentir sobre o passado.
   */
  tot: Totais;
  /**
   * Carimbo da versão do plano com que `tot` foi calculado.
   *
   * Não guarda O QUE era o plano — guarda QUANDO ele era aquele. É o bastante
   * para a tela dizer "este dia foi calculado contra um plano diferente do
   * atual", que é a regra do produto de todo número derivado dizer de onde
   * veio, sem o custo de um snapshot por dia (que a 10 anos estoura o teto do
   * Safari: 1.907 bytes × 3.650 dias são 6,6 MiB).
   */
  pv: number;
  /** o ajuste calórico em vigor naquele dia: −1, 0 ou 1 */
  aj?: -1 | 0 | 1;
  /** quando foi alterado; a fusão o usa para desempatar */
  m?: number;
}

/** Uma linha da lista de compras, derivada — nunca guardada. */
export interface LinhaCompra {
  f: string;
  n: string;
  cat: string;
  u: 'g' | 'ml';
  /** quantidade pronta, somada no horizonte */
  pronto: number;
  /** quantidade a comprar, já convertida para cru quando há fator */
  comprar: number;
  /** de onde veio o número, quando houve conversão */
  procedencia: string | null;
}
