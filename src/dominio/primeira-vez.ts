// A ausência do campo identifica um estado que já existia antes dos três passos.
import { MARCAS_DO_CORPO } from './corpo';
import { PLANO_ATUAL } from './migracoes';
import type { Corpo, Estado } from './tipos';

export function passoValido(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1;
}

export function corpoVazio(): Corpo {
  const b = {} as Corpo;
  for (const k of MARCAS_DO_CORPO) b[k] = [];
  return b;
}

export function estadoInicial(): Estado {
  return {
    primeiraVez: 1, plano: PLANO_ATUAL, prog: {}, rot: [], progTreinador: null,
    cadencia: Array(7).fill('descanso'), comida: { plano: [], alimentos: {}, ocultos: {} },
    modulos: { comida: 0, peso: 0, agua: 0, cardio: 0, fotos: 0 },
    logs: {}, done: [], deload: false, draft: null, sessao: null, cardio: [],
    body: corpoVazio(), carga: {}, export: 0, ex: {}, mods: null, progLog: [],
    aulas: [], quadro: null, dia: null, comidaHist: [], ajuste: 0, ajusteHist: [],
    gordura: [], perfManual: null, compras: { comprado: {}, extras: [], removidas: {}, dias: 7 },
    promoPendente: [], fotos: {}, protocolo: { poses: null, sessoes: [] },
    descanso: {}, lixeira: [], apagados: {}, mtime: 0
  };
}
