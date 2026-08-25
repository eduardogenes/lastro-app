// As fotos dos aparelhos.
//
// O que uma foto responde aqui não é "como se faz uma puxada" — ele sabe. É
// "qual das três puxadas DESTA academia é a que o treinador quis dizer". Por
// isso é foto dele, do aparelho dele, e não ilustração de acervo: o exercício
// é definido pela máquina, e uma máquina genérica é outra máquina.
//
// Os bytes NÃO entram no estado. O estado é reserializado inteiro a cada série
// registrada e enviado inteiro a cada sincronização; algumas dezenas de fotos
// em base64 seriam megabytes atravessando as duas coisas, e o teto do Safari
// para esse armazenamento é de 5 MiB. No estado fica só a referência.
//
// Os bytes moram no Cache Storage, sob uma URL sintética de MESMA ORIGEM. É o
// que faz `<img src="./foto/...">` funcionar offline sem tocar no manipulador
// de rede do service worker, e sem colocar endereço externo no bundle.

import type { FotoRef, IdEx } from '../dominio/tipos';

/** O cache não leva versão no nome: é dado do usuário, não asset do build. */
export const CACHE_FOTOS = 'treino-fotos';

/** Largura de gravação. Acima disto não se enxerga mais nada de novo num aparelho. */
const LARGURA = 400;

/** WebP a 0,75 dá ~6 KB nesta largura; JPEG é a saída de quem não codifica WebP. */
const QUALIDADE = 0.75;

/** A URL sintética daquela foto. Mesma origem, e é isso que a torna offline. */
export function urlDaFoto(idEx: IdEx, ref: FotoRef | null | undefined): string | null {
  if (!ref || !ref.v) return null;
  // `v` na query quebra o cache do <img> quando ele troca a foto do aparelho
  return './foto/' + idEx + '.' + (ref.ext || 'webp') + '?v=' + ref.v;
}

/** A chave no cache, sem a query: é por ela que se guarda e se procura. */
function chave(idEx: IdEx, ext: string): string {
  return './foto/' + idEx + '.' + (ext || 'webp');
}

/**
 * Guardar exige as duas coisas: o cache e o `Response` que embrulha os bytes.
 * As duas vêm da mesma especificação, então na prática ou existem juntas ou não
 * existem — mas conferir as duas é o que faz o módulo DEGRADAR em vez de
 * estourar num ambiente que só tem uma.
 */
function temCache(): boolean {
  return typeof caches !== 'undefined' && !!caches && typeof Response !== 'undefined';
}

/**
 * Reduz o que veio da câmera.
 *
 * Uma foto de iPhone chega com uns 3 MB. O que serve para reconhecer um
 * aparelho cabe em 6 KB, e a redução acontece AQUI, no aparelho, antes de
 * qualquer coisa ser guardada ou enviada — não existe servidor para fazer isso
 * depois, e subir 3 MB pelo sinal da academia não é uma opção.
 */
export async function reduz(arquivo: Blob): Promise<{ blob: Blob; ext: string }> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LARGURA / bitmap.width);
  const l = Math.round(bitmap.width * escala);
  const a = Math.round(bitmap.height * escala);

  const tela = document.createElement('canvas');
  tela.width = l; tela.height = a;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('sem canvas');
  ctx.drawImage(bitmap, 0, 0, l, a);
  if (typeof bitmap.close === 'function') bitmap.close();

  const saida = await new Promise<{ blob: Blob; ext: string } | null>(function (ok) {
    tela.toBlob(function (b) {
      // `toBlob` devolve PNG quando não sabe o tipo pedido, e PNG de foto é
      // enorme: conferir o tipo do que voltou é o que evita guardar 200 KB
      // achando que são 6.
      if (b && b.type === 'image/webp') ok({ blob: b, ext: 'webp' });
      else ok(null);
    }, 'image/webp', QUALIDADE);
  });
  if (saida) return saida;

  const jpeg = await new Promise<Blob | null>(function (ok) {
    tela.toBlob(function (b) { ok(b); }, 'image/jpeg', QUALIDADE);
  });
  if (!jpeg) throw new Error('não deu para codificar a imagem');
  return { blob: jpeg, ext: 'jpeg' };
}

/** Guarda os bytes no aparelho. */
export async function guarda(idEx: IdEx, blob: Blob, ext: string): Promise<void> {
  if (!temCache()) return;
  const c = await caches.open(CACHE_FOTOS);
  await c.put(chave(idEx, ext), new Response(blob, {
    headers: { 'Content-Type': blob.type || 'image/webp' }
  }));
}

/** Os bytes daquela foto, se este aparelho os tiver. */
export async function le(idEx: IdEx, ext: string): Promise<Blob | null> {
  if (!temCache()) return null;
  const c = await caches.open(CACHE_FOTOS);
  const r = await c.match(chave(idEx, ext));
  return r ? r.blob() : null;
}

/** Este aparelho já tem os bytes? É o que separa "falta baixar" de "não existe". */
export async function tem(idEx: IdEx, ext: string): Promise<boolean> {
  if (!temCache()) return false;
  const c = await caches.open(CACHE_FOTOS);
  return !!(await c.match(chave(idEx, ext)));
}

/** Esquece os bytes daqui. A referência quem tira é quem chamou. */
export async function esquece(idEx: IdEx, ext: string): Promise<void> {
  if (!temCache()) return;
  const c = await caches.open(CACHE_FOTOS);
  await c.delete(chave(idEx, ext));
  // o outro formato pode ter ficado de uma captura anterior
  await c.delete(chave(idEx, ext === 'webp' ? 'jpeg' : 'webp'));
}
