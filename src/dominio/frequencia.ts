// Resposta explícita para um dia sem treino. A cadência prevista não entra nesta conta.
import type { Estado, Falta, MotivoFalta } from './tipos';
import { dataLocal, instanteDaData } from './protocolo';

export const MOTIVOS_FALTA: readonly MotivoFalta[] = ['doença', 'preguiça', 'viagem', 'trabalho', 'outro'];
export const chaveDeFalta = (data: string) => 'falta:' + data;
export const chaveDeDescanso = (data: string) => 'descanso:' + data;

type Marcas = Pick<Partial<Estado>, 'descanso' | 'falta'>;

function dataValida(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && dataLocal(instanteDaData(d)) === d;
}

function apaga(mortos: Record<string, number>, chave: string, em: number) {
  mortos[chave] = Math.max(mortos[chave] || 0, em);
}

export function respondeFrequencia(s: Estado, data: string, escolha: 'descanso' | 'falta' | null, motivo: MotivoFalta | undefined, agora: number): boolean {
  const hoje = dataLocal(agora);
  if (!dataValida(data) || data > hoje || (data === hoje && escolha === 'falta') ||
      s.done.some(x => x && dataLocal(x.t) === data)) return false;
  if (escolha !== 'descanso' && escolha !== 'falta' && escolha !== null) return false;
  if (motivo !== undefined && !MOTIVOS_FALTA.includes(motivo)) return false;
  const kd = chaveDeDescanso(data), kf = chaveDeFalta(data);
  const em = Math.max(agora, 1 + Math.max(s.apagados[kd] || 0, s.apagados[kf] || 0, s.descanso[data] || 0, s.falta?.[data]?.m || 0));
  // A troca supera tudo o que já vimos. No empate entre escolhas simultâneas,
  // a lápide da troca deixa passar a outra resposta para o desempate da fusão.
  if (escolha !== 'descanso') {
    delete s.descanso[data];
    apaga(s.apagados, kd, escolha === null ? em : em - 1);
  }
  if (escolha !== 'falta') {
    if (s.falta) delete s.falta[data];
    apaga(s.apagados, kf, escolha === null ? em : em - 1);
  }
  if (escolha === 'descanso') s.descanso[data] = em;
  if (escolha === 'falta') {
    const entrada = { ...s.falta?.[data], m: em };
    if (motivo === undefined) delete entrada.motivo;
    else entrada.motivo = motivo;
    (s.falta ??= {})[data] = entrada;
  }
  return true;
}

// Em empate, a ordem das chaves do JSON recebido não pode decidir qual aparelho vence.
function conteudo(f: Falta): string {
  return JSON.stringify(f, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
}

function prefereFalta(f: Falta, outra: Falta): boolean {
  if (f.m !== outra.m) return f.m > outra.m;
  const motivo = f.motivo || '', anterior = outra.motivo || '';
  if (motivo !== anterior) return motivo > anterior;
  const a = conteudo(f), b = conteudo(outra);
  return a.length !== b.length ? a.length > b.length : a > b;
}

// Sessão esconde a resposta só na leitura. Apenas a troca ou retirada cria lápide.
export function uneFrequencia(a: Marcas, b: Marcas, mortos: Record<string, number>) {
  const descanso: Record<string, number> = {}, falta: Record<string, Falta> = {};
  for (const lado of [a, b]) {
    for (const [d, em] of Object.entries(lado.descanso || {})) {
      if (Number.isFinite(em) && em > (mortos[chaveDeDescanso(d)] || 0) && em > (descanso[d] || 0)) descanso[d] = em;
    }
    for (const [d, f] of Object.entries(lado.falta || {})) {
      if (!dataValida(d) || !Number.isFinite(f?.m) || f.m <= (mortos[chaveDeFalta(d)] || 0)) continue;
      const outra = falta[d];
      if (!outra || prefereFalta(f, outra)) falta[d] = JSON.parse(JSON.stringify(f));
    }
  }
  for (const [d, f] of Object.entries(falta)) {
    if (!descanso[d]) continue;
    if (descanso[d] >= f.m) { apaga(mortos, chaveDeFalta(d), descanso[d]); delete falta[d]; }
    else { apaga(mortos, chaveDeDescanso(d), f.m); delete descanso[d]; }
  }
  return { descanso, falta };
}

// Compara o que o outro aparelho precisa receber, inclusive a lápide sozinha.
export function frequenciaDifere(a: Marcas, b: Marcas, mortos: Record<string, number>, vistos: Record<string, number> = {}): boolean {
  const ad = a.descanso || {}, bd = b.descanso || {}, af = a.falta || {}, bf = b.falta || {};
  return Object.keys(ad).length !== Object.keys(bd).length || Object.keys(ad).some(d => ad[d] !== bd[d]) ||
    Object.keys(af).length !== Object.keys(bf).length || Object.keys(af).some(d => !bf[d] || conteudo(af[d]) !== conteudo(bf[d])) ||
    Object.keys(mortos).some(k => (k.startsWith('descanso:') || k.startsWith('falta:')) && mortos[k] > (vistos[k] || 0));
}
