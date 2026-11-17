// O QUE APARECE: as partes do app que a pessoa liga e desliga.
//
// Princípio 3 do PRODUCT.md: o treino é o centro; a comida e o resto se ligam
// e desligam (a comida desde 17/11/2026, decisão do dono), e o app completo não assusta porque só aparece o que foi ligado.
// **Desligar esconde, nunca apaga**: nenhuma função daqui toca em registro.
//
// Mora no estado sincronizado (`S.modulos`), e não no aparelho: é preferência
// da pessoa, e o computador e o celular mostram as mesmas coisas. Funde como
// DOCUMENTO inteiro, por carimbo (`DOCUMENTOS`, dominio/sincronia.ts), igual à
// cadência e às compras.
//
// Ausente, ou chave ausente, é o PADRÃO. Por isso não existe migração: o estado
// de antes desta versão já é um estado válido, com tudo no padrão.

import type { QualMarca } from './tipos';

/** As partes que se ligam e desligam como um todo. */
export type Modulo = 'comida' | 'agua' | 'peso' | 'cardio' | 'fotos' | 'dobras' | 'noite' | 'vesperaFotos';

export interface Modulos {
  /** o plano alimentar e as refeições (quem só treina desliga) */
  comida?: 0 | 1;
  /** liga (1) ou desliga (0) uma parte; ausente = o padrão dela */
  agua?: 0 | 1;
  peso?: 0 | 1;
  cardio?: 0 | 1;
  fotos?: 0 | 1;
  /** as dobras com adipômetro */
  dobras?: 0 | 1;
  /** a pergunta da noite: "a comida de hoje foi como o plano?" */
  noite?: 0 | 1;
  /** o lembrete das fotos, no Hoje, na véspera e no dia da sessão (dentro do app) */
  vesperaFotos?: 0 | 1;
  /** cada medida com fita, uma por uma; ausente = o padrão daquela medida */
  fita?: Partial<Record<QualMarca, 0 | 1>>;
}

/**
 * O padrão de cada parte, para quem nunca mexeu.
 *
 * Água, peso, cardio e fotos já apareciam antes desta preferência existir, e
 * continuam aparecendo: o padrão não pode esconder nada de quem atualizou o
 * app. As dobras já nasciam escondidas no formulário. Os dois lembretes nascem
 * desligados: aviso que ninguém pediu é cobrança.
 */
export const PADRAO: Readonly<Record<Modulo, 0 | 1>> = {
  comida: 1, agua: 1, peso: 1, cardio: 1, fotos: 1, dobras: 0, noite: 0, vesperaFotos: 0
};

const MODULOS = Object.keys(PADRAO) as Modulo[];

/** A parte está ligada? */
export function ligado(m: Modulos | null | undefined, k: Modulo): boolean {
  const v = m && m[k];
  return v === 0 || v === 1 ? v === 1 : PADRAO[k] === 1;
}

/**
 * A medida com fita está ligada?
 *
 * `padrao` é o que a tabela de medidas diz daquele ponto (`fita: 'ligada'`).
 * **Medida que já tem registro aparece mesmo desligada pelo padrão**: o padrão
 * decide o que se oferece a quem nunca mediu, não esconde o que já foi medido.
 * Só a escolha EXPLÍCITA de desligar esconde uma medida com histórico, e o
 * histórico continua guardado.
 */
export function fitaLigada(
  m: Modulos | null | undefined, k: QualMarca, padrao: boolean, temRegistro: boolean
): boolean {
  const v = m && m.fita && m.fita[k];
  if (v === 0 || v === 1) return v === 1;
  return padrao || temRegistro;
}

/**
 * Liga ou desliga uma parte, devolvendo um objeto novo. Voltar ao padrão
 * apaga a chave, para o estado guardar só o que a pessoa de fato escolheu.
 */
export function comModulo(m: Modulos | null | undefined, k: Modulo, on: boolean): Modulos {
  const novo: Modulos = Object.assign({}, m || {});
  const v: 0 | 1 = on ? 1 : 0;
  if (v === PADRAO[k]) delete novo[k]; else novo[k] = v;
  return novo;
}

/** Liga ou desliga uma medida com fita, devolvendo um objeto novo. */
export function comFita(m: Modulos | null | undefined, k: QualMarca, on: boolean): Modulos {
  const novo: Modulos = Object.assign({}, m || {});
  const fita = Object.assign({}, novo.fita || {});
  fita[k] = on ? 1 : 0;
  novo.fita = fita;
  return novo;
}

/**
 * O valor guardado, limpo: só chaves conhecidas, só 0 ou 1. É o que a
 * importação de cópia de segurança e a abertura passam adiante, para um dado
 * adulterado ou de outra versão não entrar como está. Devolve `null` quando não
 * sobra escolha nenhuma (tudo no padrão).
 */
export function normalizaModulos(x: unknown): Modulos | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const m: Modulos = {};
  MODULOS.forEach(function (k) {
    if (o[k] === 0 || o[k] === 1) m[k] = o[k] as 0 | 1;
  });
  const f = o.fita;
  if (f && typeof f === 'object' && !Array.isArray(f)) {
    const fita: Partial<Record<string, 0 | 1>> = {};
    Object.keys(f as object).forEach(function (k) {
      const v = (f as Record<string, unknown>)[k];
      if ((v === 0 || v === 1) && /^[a-zA-Z]{1,40}$/.test(k)) fita[k] = v;
    });
    if (Object.keys(fita).length) m.fita = fita as Partial<Record<QualMarca, 0 | 1>>;
  }
  return Object.keys(m).length ? m : null;
}
