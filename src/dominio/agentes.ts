// A tela Ajustes › Agentes (docs/mcp/00-desenho.md, etapa 1, parte 2): o que
// cada papel leu, em frases e por dia, e se está ligado. Puro: recebe o que a
// nuvem devolveu (tabelas `acessos` e `agentes`, grants do Supabase).

export type IdPapelDoAgente = 'treinador' | 'nutricionista' | 'assistente';

export interface PapelDoAgente {
  k: IdPapelDoAgente;
  nome: string;
  /** o que lê, em linguagem de gente (igual à porta: src/mcp/ferramentas.ts) */
  le: string[];
  nao: string[];
}

export const PAPEIS_DOS_AGENTES: PapelDoAgente[] = [
  { k: 'treinador', nome: 'Treinador', le: ['os treinos e as séries, com RIR', 'o programa, o dele e o seu', 'descanso, falta e dores', 'peso, medidas e fotos', 'o catálogo de exercícios'], nao: ['a comida e o plano alimentar'] },
  { k: 'nutricionista', nome: 'Nutricionista', le: ['as refeições, com marca e porção', 'o plano alimentar', 'peso, medidas e fotos'], nao: ['as séries do treino', 'descanso, falta e dores'] },
  { k: 'assistente', nome: 'Assistente', le: ['um resumo de treino, comida e corpo', 'o programa e as mudanças', 'o plano alimentar'], nao: ['o detalhe: série por série, refeição por refeição'] }
];

/** A ferramenta da porta, em frase ("leu o programa…"). */
const FRASE: Record<string, string> = {
  resumo: 'o resumo do Lastro',
  programa: 'o programa de treino',
  mudancas: 'as mudanças no programa',
  historico: 'o histórico de treinos',
  series: 'as séries registradas',
  exercicios: 'os exercícios e as cargas',
  cardio: 'o cardio',
  plano_alimentar: 'o plano alimentar',
  dias_de_comida: 'os dias de comida',
  alimentos: 'os alimentos do plano',
  corpo: 'o peso, as medidas e as fotos',
  catalogo: 'o catálogo de exercícios'
};

export interface Acesso { papel: string; ferramenta: string; resumo: string; cliente: string | null; em: string }
export interface Grant { client: { id: string; name?: string }; granted_at?: string }

export interface LeituraDia { dia: string; itens: { hora: string; texto: string }[] }
export interface EstadoDoPapel {
  k: IdPapelDoAgente;
  nome: string;
  ligado: boolean;
  /** leu alguma vez (no período lido) */
  leu: boolean;
  /** "hoje, às 14h02" */
  ultima: string | null;
  dias: LeituraDia[];
  le: string[];
  nao: string[];
}

const DIAS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
const p2 = (n: number) => (n < 10 ? '0' : '') + n;
const horaDita = (d: Date) => d.getHours() + 'h' + p2(d.getMinutes());
const ddmm = (d: Date) => p2(d.getDate()) + '/' + p2(d.getMonth() + 1);

function nomeDoDia(d: Date, agora: Date): string {
  const zero = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dif = Math.round((zero(agora) - zero(d)) / 864e5);
  if (dif === 0) return 'Hoje';
  if (dif === 1) return 'Ontem, ' + ddmm(d);
  const n = DIAS[d.getDay()];
  return n.charAt(0).toUpperCase() + n.slice(1) + ', ' + ddmm(d);
}

/** A frase de uma leitura: "o programa de treino" (+ o pedido, se houve). */
export function fraseDoAcesso(a: Acesso): string {
  const base = FRASE[a.ferramenta] || a.ferramenta;
  return a.resumo ? base + ' (' + a.resumo + ')' : base;
}

export function estadoDosAgentes(acessos: Acesso[], ligados: Record<string, boolean>, agora: number): EstadoDoPapel[] {
  const ag = new Date(agora);
  return PAPEIS_DOS_AGENTES.map(function (p) {
    const meus = acessos.filter(a => a.papel === p.k).sort((a, b) => Date.parse(b.em) - Date.parse(a.em));
    const dias: LeituraDia[] = [];
    meus.forEach(function (a) {
      const d = new Date(a.em);
      const dia = nomeDoDia(d, ag);
      let g = dias[dias.length - 1];
      if (!g || g.dia !== dia) { g = { dia: dia, itens: [] }; dias.push(g); }
      g.itens.push({ hora: horaDita(d), texto: fraseDoAcesso(a) });
    });
    const u = meus[0] ? new Date(meus[0].em) : null;
    const ultima = u ? (nomeDoDia(u, ag) === 'Hoje' ? 'hoje' : nomeDoDia(u, ag).toLowerCase()) + ', às ' + horaDita(u) : null;
    return { k: p.k, nome: p.nome, ligado: ligados[p.k] !== false, leu: meus.length > 0, ultima: ultima, dias: dias, le: p.le, nao: p.nao };
  });
}

/** "2 ligados", "nenhum". Só conta quem já leu e está ligado. */
export function resumoDosAgentes(e: EstadoDoPapel[]): string {
  const n = e.filter(x => x.leu && x.ligado).length;
  return n === 0 ? 'nenhum ligado' : n === 1 ? '1 ligado' : n + ' ligados';
}
