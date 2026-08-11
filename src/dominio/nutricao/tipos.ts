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

/** Um item dentro de uma refeição. */
export interface Item {
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
