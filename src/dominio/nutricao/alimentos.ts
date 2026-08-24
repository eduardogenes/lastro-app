// O plano nutricional do Eduardo, congelado — a semente, o alvo de comparação
// e o que o botão de restaurar devolve.
//
// Mesma relação que `PROGRAMA` tem com o treino, e pelo mesmo motivo: a
// prescrição veio de um profissional e não é o app que opina sobre ela. O que
// abre na tela é o plano DELE, semeado daqui e divergindo conforme ele decide.
//
// Regra 6 do projeto continua valendo dos dois lados: isto é a ferramenta, não
// o programa.

import type { Alimento, Refeicao } from './tipos';

/** Categorias, na ordem em que a lista de compras percorre o mercado. */
export const CATEGORIAS: Array<[string, string]> = [
  ['mercearia', 'MERCEARIA'], ['acougue', 'AÇOUGUE'], ['laticinios', 'LATICÍNIOS'],
  ['padaria', 'PADARIA'], ['hortifruti', 'HORTIFRUTI'], ['suplementos', 'SUPLEMENTOS'],
  ['livre', 'LIVRE']
];

// Tabela crua: [id, nome, categoria, unidade, kcal, proteína, carboidrato,
// gordura, fator cru]. Valores por 100 g ou 100 ml.
//
// `cru` é o fator de conversão pronto → cru, e existe porque a lista de compras
// precisa dizer quanto COMPRAR, não quanto comer: 1 kg de frango cozido são
// 1,31 kg crus no açougue. Zero quer dizer "não converte".
const CRU: Array<[string, string, string, 'g' | 'ml', number, number, number, number, number]> = [
  ['arroz', 'Arroz branco cozido', 'mercearia', 'g', 128, 2.5, 28, 0.2, 0.36],
  ['macarrao', 'Macarrão cozido', 'mercearia', 'g', 158, 5.8, 30, 1.3, 0.42],
  ['cuscuz', 'Cuscuz cozido', 'mercearia', 'g', 113, 2.2, 24.5, 0.3, 0.3625],
  ['feijao', 'Feijão cozido', 'mercearia', 'g', 76, 4.8, 13.6, 0.5, 0.43],
  ['aveia', 'Aveia', 'mercearia', 'g', 394, 13.9, 66.6, 8.5, 0],
  ['cereal', 'Cereal de milho simples', 'mercearia', 'g', 375, 7, 84, 1, 0],
  ['atum', 'Atum drenado', 'mercearia', 'g', 116, 26, 0, 1, 0],
  ['pasta', 'Pasta de amendoim', 'mercearia', 'g', 588, 25, 20, 50, 0],
  ['azeite', 'Azeite de oliva', 'mercearia', 'g', 884, 0, 0, 100, 0],
  ['mel', 'Mel', 'mercearia', 'g', 309, 0.3, 82, 0, 0],
  ['geleia', 'Geleia light', 'mercearia', 'g', 150, 0.3, 36, 0, 0],
  ['docedeleite', 'Doce de leite', 'mercearia', 'g', 315, 6.9, 55, 7.4, 0],
  ['frango', 'Frango cozido', 'acougue', 'g', 165, 31, 0, 3.6, 1.3125],
  ['suino', 'Filé/lombo suíno magro cozido', 'acougue', 'g', 190, 32, 0, 6.4, 1.34],
  ['tilapia', 'Tilápia/merluza cozida', 'acougue', 'g', 128, 26, 0, 2.7, 1.25],
  ['leite', 'Leite integral', 'laticinios', 'ml', 61, 3.2, 4.7, 3.3, 0],
  ['iogurte', 'Iogurte natural integral', 'laticinios', 'g', 61, 3.5, 4.7, 3.3, 0],
  ['requeijao', 'Requeijão light', 'laticinios', 'g', 175, 5, 5, 14, 0],
  ['leitepo', 'Leite em pó integral', 'laticinios', 'g', 496, 26, 38, 26, 0],
  ['ovo', 'Ovo cozido', 'laticinios', 'g', 143, 13, 1, 9.5, 0],
  ['pao', 'Pão Artesano', 'padaria', 'g', 280, 8.5, 50, 4, 0],
  ['banana', 'Banana', 'hortifruti', 'g', 90, 1.3, 23, 0.1, 0],
  ['uva', 'Uva', 'hortifruti', 'g', 69, 0.7, 18, 0.2, 0],
  ['maca', 'Maçã', 'hortifruti', 'g', 52, 0.3, 14, 0.2, 0],
  ['laranja', 'Laranja', 'hortifruti', 'g', 47, 0.9, 12, 0.1, 0],
  ['kiwi', 'Kiwi', 'hortifruti', 'g', 61, 1.1, 15, 0.5, 0],
  ['macaxeira', 'Macaxeira cozida', 'hortifruti', 'g', 125, 0.6, 30, 0.3, 0],
  ['batata', 'Batata cozida', 'hortifruti', 'g', 86, 1.8, 20, 0.1, 0],
  ['legumes', 'Legumes / verduras', 'hortifruti', 'g', 35, 2, 6, 0.3, 0],
  ['whey', 'Whey DUX concentrado', 'suplementos', 'g', 407, 66.7, 20, 5, 0],
  ['malto', 'Maltodextrina / dextrose', 'suplementos', 'g', 380, 0, 95, 0, 0],
  ['creatina', 'Creatina monohidratada', 'suplementos', 'g', 0, 0, 0, 0, 0],
  ['cafe', 'Café preto sem açúcar', 'livre', 'ml', 1, 0, 0, 0, 0],
  // Livre como o café: na quantidade de uma pitada não move a conta, e existir
  // na lista é o que faz a refeição na tela ser a refeição de verdade.
  ['canela', 'Canela em pó', 'livre', 'g', 0, 0, 0, 0, 0],
  ['agua', 'Água', 'livre', 'ml', 0, 0, 0, 0, 0],
  ['cocazero', 'Coca Zero', 'livre', 'ml', 0, 0, 0, 0, 0]
];

export const ALIMENTOS_BASE: Record<string, Alimento> = {};
CRU.forEach(function ([id, n, cat, u, kcal, p, c, g, cru]) {
  ALIMENTOS_BASE[id] = { id, n, cat, u, kcal, p, c, g, cru };
});

/**
 * O plano do dia, congelado. Cada refeição carrega a CONDIÇÃO em que aparece
 * (`quando`), em vez de existirem sete planos, um por dia da semana:
 * escopo por regra, não por duplicação. Mesma ideia do programa de treino, que
 * tem um catálogo com condições por exercício e não seis telas de dia.
 *
 *   sempre  — todo dia
 *   treino  — só em dia de treino
 *   alta    — só em dia de alta demanda
 */
export const PLANO_BASE: Refeicao[] =[
  { id: 'pre', t: '05:45', n: 'Pré-treino', tag: 'RÁPIDO E FUNCIONAL', quando: 'treino', nota: 'Carboidrato rápido antes de um treino após o jejum noturno. Volume baixo, digestão rápida. Uma fatia de pão, doce de leite e canela.', itens: [{ f: 'pao', q: 35 }, { f: 'docedeleite', q: 20 }, { f: 'canela', q: 1 }, { f: 'cafe', q: 200 }] },
  { id: 'treino', t: '06:15', n: 'Treino', tag: 'INTRA-TREINO', quando: 'treino', nota: 'Musculação 6h15–7h30. Nos dias de alta demanda entram 25 g de carboidrato na água.', itens: [{ f: 'agua', q: 600 }, { f: 'malto', q: 25, alta: true }] },
  { id: 'pos', t: '08:00', n: 'Café da manhã / pós-treino', tag: 'REFEIÇÃO FORTE', quando: 'sempre', nota: 'Quatro fontes de energia e proteína sem depender de fogão no trabalho.', itens: [{ f: 'cuscuz', q: 200 }, { f: 'frango', q: 70 }, { f: 'requeijao', q: 30 }, { f: 'leite', q: 250 }, { f: 'uva', q: 120 }] },
  { id: 'almoco', t: '12:30', n: 'Almoço', tag: 'PRATO PRINCIPAL', quando: 'sempre', nota: 'O kiwi entra diariamente junto de feijão, aveia e vegetais para elevar fibra e ajudar a regularidade intestinal.', itens: [{ f: 'arroz', q: 250, arroz: true }, { f: 'feijao', q: 50 }, { f: 'frango', q: 80 }, { f: 'legumes', q: 100 }, { f: 'azeite', q: 15 }, { f: 'kiwi', q: 100 }] },
  { id: 'lanche', t: '16:00', n: 'Lanche da tarde', tag: 'GRANDE REFEIÇÃO', quando: 'sempre', nota: 'Bata leite + banana + aveia + pasta + leite em pó + whey. Pão e geleia ficam separados.', itens: [{ f: 'leite', q: 250 }, { f: 'banana', q: 120 }, { f: 'aveia', q: 40 }, { f: 'pasta', q: 10 }, { f: 'leitepo', q: 10 }, { f: 'whey', q: 30 }, { f: 'pao', q: 50 }, { f: 'geleia', q: 20 }] },
  { id: 'jantar', t: '19:30', n: 'Jantar', tag: 'PRATO PRINCIPAL', quando: 'sempre', nota: 'Sem ceia obrigatória: o dia já fecha proteína e energia com quatro refeições proteicas completas.', itens: [{ f: 'arroz', q: 250, arroz: true }, { f: 'feijao', q: 50 }, { f: 'suino', q: 80 }, { f: 'legumes', q: 100 }, { f: 'azeite', q: 15 }] }
];
