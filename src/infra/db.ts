// Camada de storage.
//
// Mesma interface assíncrona de window.storage: get -> {value} | null, set,
// delete. Ordem: window.storage (Claude.ai) -> localStorage (navegador) ->
// memória (última rede). Toda escrita é espelhada no localStorage, então
// trocar de ambiente não perde histórico.
//
// Este módulo continua sendo a VERDADE do app: tudo grava e lê aqui primeiro,
// e nada nesta camada sabe da rede. A sincronização (src/infra/nuvem.ts) é
// réplica por cima — se a nuvem sumir, o app não perde uma série.

/** O que o app precisa de um armazenamento, seja ele qual for. */
export interface Armazenamento {
  readonly mode: Modo | null;
  ready(): Promise<Modo>;
  get(k: string): Promise<{ value: string } | null>;
  /**
   * Grava, e devolve se a escrita DUROU — `false` quando o valor ficou só na
   * memória (armazenamento cheio, escrita recusada, ou não há armazenamento).
   */
  set(k: string, v: string): Promise<boolean>;
  /** Por que a última escrita não durou, ou `null` se a última durou. */
  readonly falha: MotivoDeFalha | null;
  delete(k: string): Promise<boolean>;
}

export type Modo = 'host' | 'local' | 'mem';
/**
 * `cota`: o armazenamento está cheio (o teto do Safari é de cerca de 5 MiB, F53,
 * e o estado inteiro é regravado a cada série, F256). `recusa`: qualquer outra
 * escrita negada — inclusive não haver armazenamento nenhum.
 */
export type MotivoDeFalha = 'cota' | 'recusa';

declare global {
  interface Window {
    storage?: {
      get(k: string): Promise<{ value?: string } | null>;
      set(k: string, v: string): Promise<unknown>;
      delete(k: string): Promise<unknown>;
    };
  }
}

// ---------- camada de storage ----------
// Mesma interface assíncrona de window.storage: get -> {value} | null, set, delete.
// Ordem: window.storage (Claude.ai) -> localStorage (navegador) -> memória (última rede).
// Toda escrita é espelhada no localStorage, então trocar de ambiente não perde histórico.
export const DB: Armazenamento = (function () {
  let mode: Modo | null = null;                 // 'host' | 'local' | 'mem'
  // guardado na sonda: usar window.storage direto obrigaria a reprovar a
  // existência dele em cada método, e é a mesma referência de qualquer forma
  let host: Window['storage'] | null = null;
  const mem = Object.create(null);
  let falha: MotivoDeFalha | null = null;

  const hasLocal = (function () {
    try {
      const k = '__t' + Date.now();
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }  // Safari privado, file:// travado, etc.
  })();

  function localGet(k: string): string | null {
    if (hasLocal) { try { return localStorage.getItem(k); } catch (e) {} }
    return k in mem ? mem[k] : null;
  }
  // DEVOLVE se a escrita durou. Antes ela engolia o erro do `setItem` e o `set`
  // respondia `true` sempre: com o armazenamento cheio, o estado ficava só na
  // memória e se perdia ao fechar o app — sem uma palavra a ninguém. Quem decide
  // o que dizer é o app; esta camada só tem de não mentir.
  function localSet(k: string, v: string): boolean {
    mem[k] = v;
    if (!hasLocal) { falha = 'recusa'; return false; }
    try { localStorage.setItem(k, v); return true; }
    catch (e) {
      const n = e && (e as { name?: string }).name;
      falha = (n === 'QuotaExceededError' || n === 'NS_ERROR_DOM_QUOTA_REACHED') ? 'cota' : 'recusa';
      return false;
    }
  }
  function localDel(k: string): void {
    delete mem[k];
    if (hasLocal) { try { localStorage.removeItem(k); } catch (e) {} }
  }

  // Sonda de verdade: window.storage pode existir e mesmo assim falhar.
  async function probe(): Promise<Modo> {
    if (mode) return mode;
    if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
      try { await window.storage.get('__probe__'); mode = 'host'; host = window.storage; }
      catch (e) { mode = hasLocal ? 'local' : 'mem'; }
    } else {
      mode = hasLocal ? 'local' : 'mem';
    }
    return mode;
  }

  return {
    get mode() { return mode; },
    get falha() { return falha; },
    ready: probe,

    async get(k: string) {
      await probe();
      if (mode === 'host') {
        try {
          const r = await host!.get(k);
          if (r && r.value != null) return { value: r.value };
          // host vazio mas existe espelho local: resgata em vez de começar do zero
          const m = localGet(k);
          return m != null ? { value: m } : null;
        } catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      const v = localGet(k);
      return v != null ? { value: v } : null;
    },

    async set(k: string, v: string) {
      await probe();
      const local = localSet(k, v);                  // espelho primeiro, sempre
      if (mode === 'host') {
        // No host, a escrita dura se o host aceitou, mesmo que o espelho não.
        try { await host!.set(k, v); falha = null; return true; }
        catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      if (local) falha = null;
      return local;
    },

    async delete(k: string) {
      await probe();
      localDel(k);
      if (mode === 'host') {
        try { await host!.delete(k); }
        catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      return true;
    }
  };
})();