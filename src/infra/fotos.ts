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
export const CACHE_FOTOS = 'lastro-fotos';

/**
 * Como o cache se chamava antes de o app virar Lastro.
 *
 * Continua reconhecido por uma versão, e o service worker é obrigado a POUPÁ-LO
 * na limpeza de ativação: se o worker apagasse primeiro, a migração abaixo não
 * teria o que migrar. Quando não houver mais aparelho com o nome antigo, esta
 * constante sai daqui e de `src/sw.js` no mesmo commit.
 */
export const CACHE_FOTOS_LEGADO = 'treino-fotos';

/**
 * Leva os bytes do cache antigo para o novo. Devolve quantas fotos passaram.
 *
 * Copia e só então apaga — nunca move. Se a cópia falhar no meio, o cache
 * antigo continua inteiro e a migração refaz tudo na próxima abertura;
 * reescrever uma entrada que já passou é inofensivo. É o mesmo desenho da
 * migração da chave de storage, pelo mesmo motivo.
 *
 * `caches.has` e não `caches.open`: abrir um cache que não existe o CRIA, e aí
 * toda abertura do app deixaria para trás um `treino-fotos` vazio que o
 * service worker teria que poupar para sempre.
 */
export async function migraCache(): Promise<number> {
  if (!temCache() || typeof caches.has !== 'function') return 0;
  if (!(await caches.has(CACHE_FOTOS_LEGADO))) return 0;

  const velho = await caches.open(CACHE_FOTOS_LEGADO);
  const novo = await caches.open(CACHE_FOTOS);
  const chaves = await velho.keys();

  let levadas = 0;
  for (const req of chaves) {
    const r = await velho.match(req);
    if (!r) continue;
    await novo.put(req, r);
    levadas++;
  }

  await caches.delete(CACHE_FOTOS_LEGADO);
  return levadas;
}

/**
 * Teto do lado MAIOR, não da largura.
 *
 * Limitar só a largura deixava a altura solta: um print de tela em pé virava
 * uma tira de 400 por 1200, que pesa como uma imagem grande e aparece minúscula.
 *
 * 1080, e o número saiu de uma conta, não de gosto: a folha desenha a imagem
 * com uns 350 de largura CSS, e num telefone de 3x isso são 1050 pixels reais.
 * Guardar menos que isso é entregar uma imagem para ser ESTICADA na hora de
 * mostrar — que é exatamente a aparência borrada.
 *
 * Os 400 e depois 700 anteriores vieram de um orçamento que não era deste
 * problema: o de INSTALAÇÃO do app, onde cada byte desce toda vez. Foto não
 * entra na instalação. Ela desce uma vez por aparelho, do bucket, e fica. A
 * 1080 um WebP dá uns 70 KB — oitenta aparelhos são 6 MB no bucket, e zero na
 * abertura do app.
 */
const LADO_MAIOR = 1080;

/**
 * 0,82 e não 0,75. A diferença são uns 20 KB por foto e some no ruído do
 * bucket; abaixo disso o WebP começa a borrar justamente onde a foto precisa
 * ser lida — a etiqueta do aparelho, o número do pino.
 */
const QUALIDADE = 0.82;

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
/**
 * Reduz em PASSOS, cada um cortando no máximo a metade.
 *
 * Uma foto de telefone chega com uns 4000 pixels de lado. Encolher isso para
 * 1080 de uma vez faz o navegador amostrar um pixel a cada quatro e descartar o
 * resto — é daí que vem boa parte do embaçado, e nenhum aumento de qualidade
 * de compressão conserta, porque a informação já se perdeu antes de comprimir.
 *
 * Encolhendo pela metade de cada vez, cada passo faz média de quatro pixels
 * vizinhos, e o resultado é nítido. `imageSmoothingQuality` alto é o que pede
 * ao navegador a interpolação boa em vez da barata.
 */
function desenha(
  tela: HTMLCanvasElement, origem: CanvasImageSource,
  lFim: number, aFim: number, fundo?: string
): CanvasRenderingContext2D {
  let l = (origem as ImageBitmap).width;
  let a = (origem as ImageBitmap).height;
  let atual: CanvasImageSource = origem;

  while (l > lFim * 2) {
    l = Math.max(lFim, Math.round(l / 2));
    a = Math.max(aFim, Math.round(a / 2));
    const meio = document.createElement('canvas');
    meio.width = l; meio.height = a;
    const c = meio.getContext('2d');
    if (!c) break;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(atual, 0, 0, l, a);
    atual = meio;
  }

  tela.width = lFim; tela.height = aFim;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('sem canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (fundo) { ctx.fillStyle = fundo; ctx.fillRect(0, 0, lFim, aFim); }
  ctx.drawImage(atual, 0, 0, lFim, aFim);
  return ctx;
}

export async function reduz(arquivo: Blob): Promise<{ blob: Blob; ext: string }> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAIOR / Math.max(bitmap.width, bitmap.height));
  const l = Math.round(bitmap.width * escala);
  const a = Math.round(bitmap.height * escala);

  const tela = document.createElement('canvas');
  const ctx = desenha(tela, bitmap, l, a);

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
  desenha(tela, bitmap, l, a, FUNDO);
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
