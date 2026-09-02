// Os bytes das fotos de acompanhamento.
//
// Mesma decisão de `fotos.ts`, pela mesma razão: o byte NÃO entra no estado. O
// estado é reserializado inteiro a cada série registrada e enviado inteiro a
// cada sincronização, e o teto do Safari para esse armazenamento é de 5 MiB.
// No estado fica a referência; aqui ficam os bytes.
//
// A diferença em relação à foto do aparelho é o VOLUME e a VIDA ÚTIL. Aparelho
// são umas 40 fotos que existem para sempre e cabem no aparelho. Corpo são 9
// por sessão, 26 sessões por ano — 35 MB no primeiro ano, num Cache Storage que
// o iOS pode despejar sob pressão de disco.
//
// Por isso aqui o cache é CACHE de verdade: a fonte é o bucket, e o aparelho
// guarda só as sessões recentes. Abrir uma sessão antiga busca os bytes de
// volta. É a mesma relação que o app já tem com a nuvem em todo o resto —
// exceto que aqui a poda é deliberada, e não um acidente do sistema.

import { reduzPara } from './fotos';
import type { FotoRef, PoseId } from '../dominio/tipos';

/** Cache próprio: dado do usuário, não asset do build — não leva versão no nome. */
export const CACHE_CORPO = 'lastro-corpo';

/**
 * 1440 e não os 1080 do aparelho.
 *
 * A miniatura do aparelho é olhada a 350 px de largura CSS. Esta é olhada lado
 * a lado com outra de dois meses atrás, em tela cheia, e é sobre ela que se
 * decide se o ombro mudou. A 1440 um WebP dá uns 150 KB — nove por sessão são
 * 1,3 MB, que não pesam no bucket e pesam no cache só até a poda.
 */
const LADO_MAIOR = 1440;

/** Quantas sessões ficam com os bytes no aparelho. As anteriores voltam do bucket. */
export const SESSOES_NO_APARELHO = 4;

/**
 * Endereços de objeto abertos, por sessão · pose · VERSÃO.
 *
 * A versão entra na chave pelo mesmo motivo de `fotos.ts`: refazer uma foto tem
 * que trocar a imagem na tela, e com chave sem versão o endereço antigo
 * continuaria válido.
 */
const abertos: Record<string, string> = {};

function chaveViva(d: string, pose: PoseId, ref: FotoRef): string { return d + ':' + pose + ':' + ref.v; }

/** A chave no cache. É por ela que se guarda e se procura. */
function chave(d: string, pose: PoseId, ext: string): string {
  return './corpo/' + d + '/' + pose + '.' + (ext || 'webp');
}

/**
 * Guardar exige o cache e o `Response`. As duas vêm da mesma especificação, mas
 * conferir as duas é o que faz o módulo DEGRADAR em vez de estourar.
 */
function temCache(): boolean {
  return typeof caches !== 'undefined' && !!caches && typeof Response !== 'undefined';
}

/** Reduz o que veio da câmera, no teto do corpo. */
export function reduz(arquivo: Blob): Promise<{ blob: Blob; ext: string }> {
  return reduzPara(arquivo, LADO_MAIOR);
}

/** O endereço da foto, se ela já foi lida para a memória. Síncrono de propósito. */
export function urlDaFoto(d: string, pose: PoseId, ref: FotoRef | null | undefined): string | null {
  if (!ref || !ref.v) return null;
  return abertos[chaveViva(d, pose, ref)] || null;
}

/**
 * Lê os bytes do cache e abre o endereço. Devolve `true` quando algo mudou — é
 * o sinal de que a tela precisa ser redesenhada.
 */
export async function carrega(d: string, pose: PoseId, ref: FotoRef | null | undefined): Promise<boolean> {
  if (!ref || !ref.v || typeof URL === 'undefined' || !URL.createObjectURL) return false;
  const k = chaveViva(d, pose, ref);
  if (abertos[k]) return false;
  const b = await le(d, pose, ref.ext);
  if (!b) return false;
  solta(d, pose);                 // versão anterior da mesma pose sai da memória
  abertos[k] = URL.createObjectURL(b);
  return true;
}

/** Devolve a memória dos endereços daquela pose — ou da sessão inteira. */
export function solta(d: string, pose?: PoseId): void {
  const prefixo = d + ':' + (pose ? pose + ':' : '');
  Object.keys(abertos).forEach(function (k) {
    if (k.indexOf(prefixo) !== 0) return;
    try { URL.revokeObjectURL(abertos[k]); } catch (e) {}
    delete abertos[k];
  });
}

export async function guarda(d: string, pose: PoseId, blob: Blob, ext: string): Promise<void> {
  if (!temCache()) return;
  const c = await caches.open(CACHE_CORPO);
  await c.put(chave(d, pose, ext), new Response(blob, {
    headers: { 'Content-Type': blob.type || 'image/webp' }
  }));
}

export async function le(d: string, pose: PoseId, ext: string): Promise<Blob | null> {
  if (!temCache()) return null;
  const c = await caches.open(CACHE_CORPO);
  const r = await c.match(chave(d, pose, ext));
  return r ? r.blob() : null;
}

/** Este aparelho tem os bytes? É o que separa "falta baixar" de "não existe". */
export async function tem(d: string, pose: PoseId, ext: string): Promise<boolean> {
  if (!temCache()) return false;
  const c = await caches.open(CACHE_CORPO);
  return !!(await c.match(chave(d, pose, ext)));
}

/** Esquece os bytes daqui. A referência quem tira é quem chamou. */
export async function esquece(d: string, pose: PoseId, ext: string): Promise<void> {
  if (!temCache()) return;
  const c = await caches.open(CACHE_CORPO);
  await c.delete(chave(d, pose, ext));
  // o outro formato pode ter ficado de uma captura anterior
  await c.delete(chave(d, pose, ext === 'webp' ? 'jpeg' : 'webp'));
}

/**
 * Tira do cache os bytes das sessões que não estão em `manter`.
 *
 * Recebe a lista do que fica em vez de calculá-la: quem sabe quais sessões já
 * subiram para o bucket é o casco, e apagar byte que ainda não subiu seria
 * perder a foto — o erro mais caro possível aqui. A poda é burra de propósito.
 *
 * Devolve quantas entradas saíram.
 */
export async function poda(manter: string[]): Promise<number> {
  if (!temCache() || typeof caches.has !== 'function') return 0;
  if (!(await caches.has(CACHE_CORPO))) return 0;
  const fica: Record<string, 1> = {};
  (manter || []).forEach(function (d) { fica['./corpo/' + d + '/'] = 1; });

  const c = await caches.open(CACHE_CORPO);
  const chaves = await c.keys();
  let saíram = 0;
  for (const req of chaves) {
    const u = req.url || '';
    const i = u.indexOf('/corpo/');
    if (i < 0) continue;
    const resto = u.slice(i + 7);              // '2026-09-01/frente-relaxado.webp'
    const data = resto.split('/')[0];
    if (fica['./corpo/' + data + '/']) continue;
    await c.delete(req);
    solta(data);
    saíram++;
  }
  return saíram;
}
