// Os bytes da foto da lousa do box.
//
// O conteúdo da aula só se conhece ao chegar, pela lousa, e a transcrição é
// feita fora do app, "quando der" (a D, `aula.html`, estado 6; decisão do dono,
// 14/10). Então a foto é um toque e fica guardada no dia; quando a aula termina,
// ela vira a nota daquela sessão.
//
// Mesma decisão das outras fotos: o byte NÃO entra no estado. No estado fica a
// referência (`S.lousa` enquanto a aula acontece, `lousa` na marca da sessão
// depois); aqui ficam os bytes, num cache próprio que o service worker poupa.
// A foto fica só neste aparelho — o que é durável é a transcrição.

import { reduzPara } from './fotos';

/** Cache próprio: dado do usuário, não asset do build — não leva versão no nome. */
export const CACHE_LOUSA = 'lastro-lousa';

/** Lado maior: a lousa se lê de perto, letra de giz a três metros. */
const LADO_MAIOR = 1600;

function temCache(): boolean {
  return typeof caches !== 'undefined' && !!caches && typeof Response !== 'undefined';
}

function chave(d: string, v: number, ext: string): string { return './lousa/' + d + '-' + v + '.' + ext; }

export function reduz(arquivo: Blob): Promise<{ blob: Blob; ext: string }> {
  return reduzPara(arquivo, LADO_MAIOR);
}

export async function guarda(d: string, v: number, blob: Blob, ext: string): Promise<void> {
  if (!temCache()) throw new Error('sem cache neste navegador');
  const c = await caches.open(CACHE_LOUSA);
  await c.put(chave(d, v, ext), new Response(blob, { headers: { 'Content-Type': blob.type || 'image/webp' } }));
}

export async function le(d: string, v: number, ext: string): Promise<Blob | null> {
  if (!temCache()) return null;
  const c = await caches.open(CACHE_LOUSA);
  const r = await c.match(chave(d, v, ext));
  return r ? r.blob() : null;
}

export async function esquece(d: string, v: number, ext: string): Promise<void> {
  if (!temCache()) return;
  const c = await caches.open(CACHE_LOUSA);
  await c.delete(chave(d, v, ext));
}

/** Endereços já abertos, por dia e versão. */
const abertos: Record<string, string> = {};

/** O endereço da foto, se já foi lida para a memória. Síncrono de propósito. */
export function urlDaLousa(d: string, v: number): string | null {
  return abertos[d + ':' + v] || null;
}

/** Lê os bytes e abre o endereço. `true` quando algo mudou. */
export async function carrega(d: string, v: number, ext: string): Promise<boolean> {
  if (typeof URL === 'undefined' || !URL.createObjectURL) return false;
  const k = d + ':' + v;
  if (abertos[k]) return false;
  const b = await le(d, v, ext);
  if (!b) return false;
  abertos[k] = URL.createObjectURL(b);
  return true;
}
