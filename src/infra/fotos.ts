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
// Os bytes moram no Cache Storage. A tela os alcança por `blob:` — a imagem é
// LIDA do cache e vira um endereço de objeto em memória.
//
// A primeira versão servia uma URL sintética de mesma origem e deixava o
// service worker respondê-la. Parecia elegante e era frágil: o service worker
// só é registrado em HTTPS, então em desenvolvimento não havia quem
// respondesse e a imagem quebrava — e mesmo publicado ela ficava refém de o
// worker novo já ter assumido. `blob:` não depende de nada disso, não passa
// pela rede e não coloca endereço externo no bundle.

import type { FotoRef, IdEx } from '../dominio/tipos';

/** O cache não leva versão no nome: é dado do usuário, não asset do build. */
export const CACHE_FOTOS = 'treino-fotos';

/**
 * Teto do lado MAIOR, não da largura.
 *
 * Limitar só a largura deixava a altura solta: um print de tela em pé virava
 * uma tira de 400 por 1200, que pesa como uma imagem grande e aparece minúscula.
 *
 * 700 e não 400 por duas razões que apareceram juntas. A folha desenha a
 * imagem com uns 350 de largura, e num aparelho de 3x um arquivo de 400 sobe
 * borrado. E aqui não entra só foto de máquina: um print de diagrama ou de
 * mensagem tem TEXTO, que a 400 fica ilegível. A 700 um WebP ainda sai com uns
 * 15 KB, e nada disso entra na instalação do app.
 */
const LADO_MAIOR = 700;

/** WebP a 0,75 dá uns 15 KB neste tamanho; JPEG é a saída de quem não codifica WebP. */
const QUALIDADE = 0.75;

/** `--ins-canvas`. Só entra quando o JPEG precisa achatar transparência. */
const FUNDO = '#0C0E0C';

/**
 * Endereços de objeto já abertos, por exercício e VERSÃO.
 *
 * A versão entra na chave porque trocar a foto do aparelho tem que trocar a
 * imagem na tela — com chave só de exercício, o endereço antigo continuaria
 * válido e a tela mostraria a foto velha.
 */
const abertos: Record<string, string> = {};

function chaveViva(idEx: IdEx, ref: FotoRef): string { return idEx + ':' + ref.v; }

/** O endereço da foto, se ela já foi lida para a memória. Síncrono de propósito. */
export function urlDaFoto(idEx: IdEx, ref: FotoRef | null | undefined): string | null {
  if (!ref || !ref.v) return null;
  return abertos[chaveViva(idEx, ref)] || null;
}

/**
 * Lê os bytes do cache e abre o endereço.
 *
 * Devolve `true` quando algo mudou — é o sinal de que a tela precisa ser
 * redesenhada. Chamar de novo para a mesma versão não relê nada.
 */
export async function carrega(idEx: IdEx, ref: FotoRef | null | undefined): Promise<boolean> {
  if (!ref || !ref.v || typeof URL === 'undefined' || !URL.createObjectURL) return false;
  const k = chaveViva(idEx, ref);
  if (abertos[k]) return false;
  const b = await le(idEx, ref.ext);
  if (!b) return false;
  solta(idEx);                    // versão anterior do mesmo exercício sai da memória
  abertos[k] = URL.createObjectURL(b);
  return true;
}

/** Devolve a memória dos endereços daquele exercício. */
export function solta(idEx: IdEx): void {
  Object.keys(abertos).forEach(function (k) {
    if (k.indexOf(idEx + ':') !== 0) return;
    try { URL.revokeObjectURL(abertos[k]); } catch (e) {}
    delete abertos[k];
  });
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
  const escala = Math.min(1, LADO_MAIOR / Math.max(bitmap.width, bitmap.height));
  const l = Math.round(bitmap.width * escala);
  const a = Math.round(bitmap.height * escala);

  const tela = document.createElement('canvas');
  tela.width = l; tela.height = a;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('sem canvas');
  ctx.drawImage(bitmap, 0, 0, l, a);

  const saida = await new Promise<{ blob: Blob; ext: string } | null>(function (ok) {
    tela.toBlob(function (b) {
      // `toBlob` devolve PNG quando não sabe o tipo pedido, e PNG de foto é
      // enorme: conferir o tipo do que voltou é o que evita guardar 200 KB
      // achando que são 6. WebP também é o que preserva transparência, que é
      // comum em print recortado.
      if (b && b.type === 'image/webp') ok({ blob: b, ext: 'webp' });
      else ok(null);
    }, 'image/webp', QUALIDADE);
  });
  if (saida) { if (typeof bitmap.close === 'function') bitmap.close(); return saida; }

  // Sem WebP, sobra JPEG — que não tem transparência, e pinta de PRETO o que
  // era transparente. Redesenha sobre o fundo do app para o recorte se apoiar
  // na cor certa em vez de num retângulo preto no meio da folha.
  ctx.fillStyle = FUNDO;
  ctx.fillRect(0, 0, l, a);
  ctx.drawImage(bitmap, 0, 0, l, a);
  if (typeof bitmap.close === 'function') bitmap.close();

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
