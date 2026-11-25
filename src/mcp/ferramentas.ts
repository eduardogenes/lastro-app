// As ferramentas de leitura do MCP e os papéis que enxergam cada uma
// (docs/mcp/00-desenho.md, "Os papéis").
//
// Tudo sai do mesmo texto que o espelho já monta (`ferramentas/espelho/monta.ts`):
// a leitura do agente pelo MCP e a da pasta ~/Lastro dizem a mesma coisa, com as
// mesmas regras. Nada aqui grava: as ferramentas recebem o estado já lido e
// devolvem texto.

import { montaArquivos, type Arquivos } from '../../ferramentas/espelho/monta';
import { SEMENTE } from '../dominio/catalogo';

export type IdPapel = 'treinador' | 'nutricionista' | 'assistente';

export interface Ferramenta {
  nome: string;
  titulo: string;
  descricao: string;
  entrada: { type: 'object'; properties: Record<string, unknown>; additionalProperties: false };
  roda: (arq: Arquivos, args: Record<string, unknown>) => string;
}

/** Texto acima disso é cortado por linha, com aviso de como pedir o resto. */
export const TETO = 24000;

function corta(t: string, dica: string): string {
  if (t.length <= TETO) return t;
  const linhas = t.split('\n');
  const out: string[] = [];
  let n = 0;
  for (const l of linhas) { if (n + l.length + 1 > TETO) break; out.push(l); n += l.length + 1; }
  return out.join('\n') + '\n\n[cortado: ' + (linhas.length - out.length) + ' linhas a mais. ' + dica + ']';
}

function texto(v: unknown): string { return typeof v === 'string' ? v.trim() : ''; }
function inteiro(v: unknown, padrao: number, max: number): number {
  const n = typeof v === 'number' ? Math.floor(v) : padrao;
  return Math.max(1, Math.min(max, isFinite(n) ? n : padrao));
}
function semAcento(s: string): string { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

/** As linhas de um CSV filtradas por trecho e data inicial, sempre com o cabeçalho. */
function filtraCsv(csv: string, args: Record<string, unknown>, campoTexto: string, padrao: number): string {
  const linhas = csv.trim().split('\n');
  const cab = linhas.shift() || '';
  const busca = semAcento(texto(args[campoTexto]));
  const desde = texto(args.desde);
  const limite = inteiro(args.limite, padrao, 2000);
  let corpo = linhas;
  if (busca) corpo = corpo.filter(l => semAcento(l).indexOf(busca) >= 0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(desde)) corpo = corpo.filter(l => l.slice(0, 10) >= desde);
  const total = corpo.length;
  corpo = corpo.slice(-limite);
  const nota = total > corpo.length ? '\n[mostrando as ' + corpo.length + ' mais recentes de ' + total + '; use "desde" ou "limite"]' : '';
  return [cab].concat(corpo).join('\n') + nota;
}

const SEM_ENTRADA = { type: 'object' as const, properties: {}, additionalProperties: false as const };
const DESDE = { type: 'string', description: 'data inicial, AAAA-MM-DD' };
const LIMITE = { type: 'integer', minimum: 1, maximum: 2000, description: 'quantas linhas, as mais recentes' };

export const FERRAMENTAS: Record<string, Ferramenta> = {
  resumo: {
    nome: 'resumo', titulo: 'Resumo do Lastro',
    descricao: 'O panorama da pessoa: o que existe no app, os números principais e o que está pendente de avaliação. Comece por aqui.',
    entrada: SEM_ENTRADA,
    roda: a => corta([a['LEIA-ME.md'], a['corpo/para-avaliar.md']].filter(Boolean).join('\n\n'), 'peça uma ferramenta específica')
  },
  programa: {
    nome: 'programa', titulo: 'Programa de treino',
    descricao: 'O programa ativo (treinos, exercícios, séries, repetições, RIR, descanso) e a lista dos programas guardados. Com treinador=true, inclui o programa como o treinador prescreveu.',
    entrada: { type: 'object', properties: { treinador: { type: 'boolean', description: 'incluir o programa do treinador' } }, additionalProperties: false },
    roda: (a, args) => corta([a['treino/programa.md'], a['treino/programas.md'], args.treinador === true ? a['treino/programa-do-treinador.md'] : '']
      .filter(Boolean).join('\n\n'), 'peça sem treinador=true')
  },
  mudancas: {
    nome: 'mudancas', titulo: 'Mudanças no programa',
    descricao: 'As decisões registradas no programa: revisões do treinador e ajustes da pessoa, com data.',
    entrada: SEM_ENTRADA,
    roda: a => corta(a['treino/mudancas.md'] || '', 'é o histórico inteiro')
  },
  historico: {
    nome: 'historico', titulo: 'Histórico de treinos do mês',
    descricao: 'As sessões de um mês: treino feito, séries com carga e repetições, dores, descanso, falta e cardio. Sem "mes", o mês mais recente.',
    entrada: { type: 'object', properties: { mes: { type: 'string', description: 'AAAA-MM' } }, additionalProperties: false },
    roda: (a, args) => {
      const meses = Object.keys(a).map(k => (k.match(/^treino\/historico\/(\d{4}-\d{2})\.md$/) || [])[1]).filter(Boolean).sort() as string[];
      if (!meses.length) return 'Nenhuma sessão registrada ainda.';
      const pedido = texto(args.mes);
      const mes = meses.indexOf(pedido) >= 0 ? pedido : meses[meses.length - 1];
      const aviso = pedido && pedido !== mes ? 'Não há registro em ' + pedido + '. ' : '';
      return corta(aviso + 'Meses com registro: ' + meses.join(', ') + '.\n\n' + a['treino/historico/' + mes + '.md'], 'o mês tem mais; peça "series" filtrando por exercício');
    }
  },
  series: {
    nome: 'series', titulo: 'Séries registradas',
    descricao: 'Tabela das séries (data, treino, exercício, carga, repetições, RIR), uma por linha. Filtre por exercício e data.',
    entrada: { type: 'object', properties: { exercicio: { type: 'string', description: 'trecho do nome' }, desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a['treino/series.csv'] || '', args, 'exercicio', 300), 'use "desde" ou "limite"')
  },
  exercicios: {
    nome: 'exercicios', titulo: 'Exercícios e cargas',
    descricao: 'Cada exercício do programa com a última carga, a melhor marca e o tipo de carga (por lado, total, halteres).',
    entrada: SEM_ENTRADA,
    roda: a => corta(a['treino/exercicios.md'] || '', 'é a lista inteira')
  },
  cardio: {
    nome: 'cardio', titulo: 'Cardio',
    descricao: 'Os registros de cardio (data, aparelho, minutos, intensidade).',
    entrada: { type: 'object', properties: { desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a['treino/cardio.csv'] || '', args, '_', 200), 'use "desde"')
  },
  plano_alimentar: {
    nome: 'plano_alimentar', titulo: 'Plano alimentar',
    descricao: 'O plano alimentar do app (refeições, porções, regras) e os ajustes registrados.',
    entrada: SEM_ENTRADA,
    roda: a => corta([a['nutricao/plano.md'], a['nutricao/ajustes.md']].filter(Boolean).join('\n\n'), 'é o plano inteiro')
  },
  dias_de_comida: {
    nome: 'dias_de_comida', titulo: 'Dias de comida',
    descricao: 'Um dia por linha: o que foi marcado de cada refeição, água, escala e o tipo do dia.',
    entrada: { type: 'object', properties: { desde: DESDE, limite: LIMITE }, additionalProperties: false },
    roda: (a, args) => corta(filtraCsv(a['nutricao/dias.csv'] || '', args, '_', 60), 'use "desde"')
  },
  alimentos: {
    nome: 'alimentos', titulo: 'Alimentos do plano',
    descricao: 'A tabela dos alimentos do plano, com porção e macros.',
    entrada: SEM_ENTRADA,
    roda: a => corta(a['nutricao/alimentos.csv'] || '', 'é a tabela inteira')
  },
  corpo: {
    nome: 'corpo', titulo: 'Peso, medidas e fotos',
    descricao: 'Peso e medidas ao longo do tempo e a lista das fotos de acompanhamento (referências, não as imagens).',
    entrada: SEM_ENTRADA,
    roda: a => corta([a['corpo/medidas.csv'], a['corpo/fotos.md']].filter(Boolean).join('\n\n'), 'peça de novo mais tarde')
  },
  catalogo: {
    nome: 'catalogo', titulo: 'Catálogo de exercícios',
    descricao: 'Busca no catálogo do sistema por nome (inclui nomes alternativos) ou músculo. Devolve o id estável de cada exercício.',
    entrada: { type: 'object', properties: { busca: { type: 'string', description: 'trecho do nome' }, musculo: { type: 'string' }, limite: { type: 'integer', minimum: 1, maximum: 100 } }, additionalProperties: false },
    roda: (_a, args) => {
      const b = semAcento(texto(args.busca)), m = semAcento(texto(args.musculo));
      const limite = inteiro(args.limite, 30, 100);
      const achados = Object.values(SEMENTE.ex).filter(e =>
        (!b || semAcento([e.n].concat(e.alt).join(' | ')).indexOf(b) >= 0) &&
        (!m || e.mus.some(x => semAcento(x[0]).indexOf(m) >= 0)));
      if (!achados.length) return 'Nada no catálogo com isso.';
      return achados.slice(0, limite).map(e => '- ' + e.id + ' · ' + e.n + (e.alt.length ? ' (também: ' + e.alt.join(', ') + ')' : '') +
        ' · músculos: ' + (e.mus.map(x => x[0] + ' ' + x[1]).join(', ') || '—') + ' · carga: ' + e.car + ' · equipamento: ' + e.eq).join('\n') +
        (achados.length > limite ? '\n[mais ' + (achados.length - limite) + '; refine a busca]' : '');
    }
  }
};

export interface Papel { id: IdPapel; nome: string; descricao: string; ferramentas: string[] }

/** O que cada porta enxerga. O assistente vê o todo em resumo, sem o detalhe série a série. */
export const PAPEIS: Record<IdPapel, Papel> = {
  treinador: {
    id: 'treinador', nome: 'Treinador',
    descricao: 'Lê o treino: programa, histórico e séries, cargas, cardio, dores, peso, medidas e fotos. Só lê.',
    ferramentas: ['programa', 'mudancas', 'historico', 'series', 'exercicios', 'cardio', 'corpo', 'catalogo']
  },
  nutricionista: {
    id: 'nutricionista', nome: 'Nutricionista',
    descricao: 'Lê a comida: plano alimentar, dias marcados, alimentos, peso, medidas e fotos. Só lê.',
    ferramentas: ['plano_alimentar', 'dias_de_comida', 'alimentos', 'corpo']
  },
  assistente: {
    id: 'assistente', nome: 'Assistente',
    descricao: 'Vê o todo em resumo: o panorama, o programa, o plano alimentar e o corpo. Só lê.',
    ferramentas: ['resumo', 'programa', 'mudancas', 'plano_alimentar', 'corpo']
  }
};

export function ehPapel(x: string): x is IdPapel { return x === 'treinador' || x === 'nutricionista' || x === 'assistente'; }

/** O texto da pasta, montado uma vez por chamada a partir do estado lido. */
export function arquivosDoEstado(estado: unknown, agora: number): Arquivos {
  return montaArquivos(estado, { agora, origem: 'nuvem' });
}
